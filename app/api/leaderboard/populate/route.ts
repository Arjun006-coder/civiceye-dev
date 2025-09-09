import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all users with their stats
    const { data: users } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        honor_score_points,
        reputation,
        reports:reports(id, verification_status)
      `)

    if (!users) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 })
    }

    // Clear existing leaderboard
    await supabaseAdmin.from('leaderboard').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Prepare leaderboard entries
    type ReportRow = { id: string; verification_status: 'pending' | 'verified' | 'rejected' | 'under_review' };
    type UserWithReports = {
      id: string;
      honor_score_points: number | null;
      reputation: number | null;
      reports?: ReportRow[] | null;
    };

    const leaderboardEntries = (users as unknown as UserWithReports[]).map((user) => {
      const totalReports = user.reports?.length || 0
      const verifiedReports = user.reports?.filter((r) => r.verification_status === 'verified').length || 0
      
      return {
        user_id: user.id,
        total_points: user.honor_score_points || 0,
        reports_submitted: totalReports,
        verified_reports: verifiedReports,
        rank_position: 999 // Will be updated after insertion
      }
    })

    // Insert all entries
    const { data: insertedEntries, error: insertError } = await supabaseAdmin
      .from('leaderboard')
      .insert(leaderboardEntries)
      .select()

    if (insertError) {
      console.error('Error inserting leaderboard entries:', insertError)
      return NextResponse.json({ error: 'Failed to populate leaderboard' }, { status: 500 })
    }

    // Recalculate rankings
    const { data: allEntries } = await supabaseAdmin
      .from('leaderboard')
      .select('id, total_points')
      .order('total_points', { ascending: false })

    if (allEntries) {
      for (let i = 0; i < allEntries.length; i++) {
        await supabaseAdmin
          .from('leaderboard')
          .update({ rank_position: i + 1 })
          .eq('id', allEntries[i].id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Populated leaderboard with ${insertedEntries?.length || 0} entries` 
    })
  } catch (error) {
    console.error('Error populating leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
