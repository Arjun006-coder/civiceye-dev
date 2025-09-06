import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: leaderboard, error } = await supabaseAdmin
      .from('leaderboard')
      .select(`
        *,
        user:users(*)
      `)
      .order('rank_position', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error in GET leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
