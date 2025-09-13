import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Admin only
    const { data: me } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()
    if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await context.params
    const { data: problem, error: pErr } = await supabaseAdmin
      .from('problems')
      .select('*')
      .eq('id', id)
      .single()
    if (pErr || !problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

    // Fetch reports for this problem with user and category
    const reportIds: string[] = Array.isArray(problem.report_ids) ? problem.report_ids : []
    const { data: reports } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        user:users(id, full_name, email),
        issue_category:issue_categories(id, type, description)
      `)
      .in('id', reportIds)

    return NextResponse.json({ problem, reports: reports || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


