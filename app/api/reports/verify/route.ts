import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, status, adminNotes } = body

    if (!['verified', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update report status
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .update({
        verification_status: status,
        verification_color: getVerificationColor(status),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select(`
        *,
        user:users(*),
        issue_category:issue_categories(*)
      `)
      .single()

    if (error) {
      console.error('Error updating report:', error)
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
    }

    // Update user's reputation and points based on status and corroboration
    let pointsToAdd = 0
    let reputationChange = 0
    if (status === 'verified') {
      // Base points 5-40 depending on confidence
      const base = Math.round(Math.max(5, Math.min(40, Math.floor((report.final_confidence_score || 0.5) * 50))))

      // Bonus if multiple similar reports exist near the same area
      const { data: corroborating } = await supabaseAdmin
        .from('reports')
        .select('id')
        .eq('issue_category_id', report.issue_category_id)
        .neq('id', reportId)
        .limit(5)

      const corroborationBonus = corroborating && corroborating.length >= 2 ? 20 : (corroborating && corroborating.length >= 1 ? 10 : 0)

      pointsToAdd = base + corroborationBonus
      reputationChange = Math.max(1, Math.min(10, Math.floor(pointsToAdd / 10)))
    } else if (status === 'rejected') {
      pointsToAdd = -10
      reputationChange = -2
    }

    if (pointsToAdd !== 0 || reputationChange !== 0) {
      // Get current user data
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('honor_score_points, reputation')
        .eq('id', report.user_id)
        .single()
      
      if (currentUser) {
        await supabaseAdmin
          .from('users')
          .update({
            honor_score_points: currentUser.honor_score_points + pointsToAdd,
            reputation: currentUser.reputation + reputationChange
          })
          .eq('id', report.user_id)
      }
    }

    // Create notification for report author
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: report.user_id,
        title: `Report ${status}`,
        message: `Your report "${report.title}" has been ${status}`,
        type: status === 'verified' ? 'success' : status === 'rejected' ? 'error' : 'info',
        related_report_id: reportId
      })

    // Update leaderboard
    await updateLeaderboard()

    return NextResponse.json({ report, message: 'Report status updated successfully' })
  } catch (error) {
    console.error('Error in verify report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getVerificationColor(status: string): string {
  const colors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red',
    under_review: 'blue'
  }
  return colors[status as keyof typeof colors] || 'yellow'
}

async function updateLeaderboard() {
  try {
    // Get all users with their stats
    const { data: users } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        honor_score_points,
        reports:reports(count),
        verified_reports:reports(count)
      `)
      .eq('is_active', true)

    if (!users) return

    // Calculate leaderboard entries
    const leaderboardEntries = users.map((user, index) => ({
      user_id: user.id,
      total_points: user.honor_score_points,
      reports_submitted: user.reports?.[0]?.count || 0,
      verified_reports: user.verified_reports?.[0]?.count || 0,
      rank_position: index + 1
    }))

    // Clear existing leaderboard
    await supabaseAdmin.from('leaderboard').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new leaderboard entries
    await supabaseAdmin
      .from('leaderboard')
      .insert(leaderboardEntries)

  } catch (error) {
    console.error('Error updating leaderboard:', error)
  }
}
