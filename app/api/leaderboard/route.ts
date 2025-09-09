import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // Identify current user (to compute rank)
    const { userId } = await auth()

    // Pull all non-admin users with their reports
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        clerk_id,
        full_name,
        email,
        honor_score_points,
        role,
        reports:reports(id, verification_status)
      `)

    if (usersError) {
      console.error('Error fetching users for leaderboard:', usersError)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Build ranking list: exclude admins and users with zero reports
    type ReportRow = { id: string; verification_status: 'pending' | 'verified' | 'rejected' | 'under_review' };
    type UserRow = {
      id: string;
      clerk_id: string;
      full_name: string | null;
      email: string | null;
      honor_score_points: number | null;
      role: string;
      reports?: ReportRow[] | null;
    };

    const ranked = ((users || []) as unknown as UserRow[])
      .filter(u => u.role !== 'admin')
      .map(u => {
        const reportsSubmitted = u.reports?.length || 0
        const verifiedReports = (u.reports || []).filter((r) => r.verification_status === 'verified').length
        return {
          id: u.id,
          user: {
            id: u.id,
            clerk_id: u.clerk_id,
            full_name: u.full_name,
            email: u.email,
          },
          total_points: u.honor_score_points || 0,
          reports_submitted: reportsSubmitted,
          verified_reports: verifiedReports,
        }
      })
      .filter(entry => entry.verified_reports > 0)
      .sort((a, b) => {
        if ((b.total_points || 0) !== (a.total_points || 0)) {
          return (b.total_points || 0) - (a.total_points || 0)
        }
        const nameA = (a.user.full_name || '').toLowerCase()
        const nameB = (b.user.full_name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

    // Compute current user's rank (1-based)
    let myRank: number | null = null
    if (userId) {
      const idx = ranked.findIndex(e => e.user.clerk_id === userId)
      if (idx >= 0) myRank = idx + 1
    }

    // Return only top 10 entries
    const topTen = ranked.slice(0, 10).map((e, i) => ({ ...e, rank_position: i + 1 }))

    return NextResponse.json({ leaderboard: topTen, myRank })
  } catch (error) {
    console.error('Error in GET leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






