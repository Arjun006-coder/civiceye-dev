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
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, status, adminNotes } = body

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 })
    }

    // Get the report with user information
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update the report status
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('reports')
      .update({
        verification_status: status,
        verification_color: status === 'verified' ? 'green' : status === 'rejected' ? 'red' : 'yellow',
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

    if (updateError) {
      console.error('Error updating report:', updateError)
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
    }

    // If report is verified, award honor points and increase reputation
    if (status === 'verified') {
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('honor_score_points, reputation')
        .eq('id', report.user_id)
        .single()
      
      if (currentUser) {
        await supabaseAdmin
          .from('users')
          .update({
            honor_score_points: currentUser.honor_score_points + 5,
            reputation: currentUser.reputation + 0.5
          })
          .eq('id', report.user_id)
      }
    }

    return NextResponse.json({ 
      report: updatedReport, 
      message: `Report ${status} successfully` 
    })
  } catch (error) {
    console.error('Error in POST verify:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}