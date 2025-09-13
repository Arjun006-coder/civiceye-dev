import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // resolve user row
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { problem_id, vote, reason } = body as { problem_id?: string; vote?: 'agree' | 'disagree'; reason?: string }
    if (!problem_id || !vote) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    // Only reporters attached to the problem can vote (ensure membership)
    const { data: problem } = await supabaseAdmin
      .from('problems')
      .select('id, report_ids, reports_count, status')
      .eq('id', problem_id)
      .single()
    if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

    const reportIds: string[] = Array.isArray(problem.report_ids) ? problem.report_ids : []
    if (reportIds.length > 0) {
      const { data: reports } = await supabaseAdmin
        .from('reports')
        .select('id, user_id')
        .in('id', reportIds)
      const allowed = (reports || []).some(r => r.user_id === user.id)
      if (!allowed) return NextResponse.json({ error: 'Not permitted' }, { status: 403 })
    }

    // Upsert vote
    const { error: voteErr } = await supabaseAdmin
      .from('problem_votes')
      .upsert({ problem_id, user_id: user.id, vote, reason }, { onConflict: 'problem_id,user_id' })
    if (voteErr) return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })

    // Compute tallies
    const { data: votes } = await supabaseAdmin
      .from('problem_votes')
      .select('vote')
      .eq('problem_id', problem_id)
    const agree = (votes || []).filter(v => v.vote === 'agree').length
    const disagree = (votes || []).filter(v => v.vote === 'disagree').length
    const total = agree + disagree
    const ratio = total > 0 ? agree / total : 0

     // Auto-finalize logic - FORCE RESOLVE FOR TESTING
     let newStatus: 'resolved' | 'disputed' | undefined
     
     // FORCE RESOLVE ON ANY AGREE VOTE FOR TESTING
     if (vote === 'agree') {
       newStatus = 'resolved'
     } else if (total > 0) {
       if (ratio >= 0.5) newStatus = 'resolved'
       else if (disagree / total > 0.5) newStatus = 'disputed'
     }

     console.log('=== VOTE DEBUG ===')
     console.log('Problem ID:', problem_id)
     console.log('Reports count:', problem.reports_count)
     console.log('Report IDs:', reportIds)
     console.log('Vote:', vote)
     console.log('Agree:', agree, 'Disagree:', disagree, 'Total:', total, 'Ratio:', ratio)
     console.log('Current status:', problem.status)
     console.log('New status:', newStatus)
     console.log('Will update?', newStatus && problem.status !== newStatus)

    if (newStatus && problem.status !== newStatus) {
      console.log('Updating problem status to:', newStatus)
      
      // Update problem status
      const { error: problemUpdateError } = await supabaseAdmin
        .from('problems')
        .update({ status: newStatus })
        .eq('id', problem_id)
      
      if (problemUpdateError) {
        console.error('Problem update error:', problemUpdateError)
      }

       // If resolved, update all related reports to "resolved" status
       if (newStatus === 'resolved' && reportIds.length > 0) {
         console.log('=== UPDATING REPORTS TO RESOLVED ===')
         console.log('Report IDs to update:', reportIds)
         
         // First, check what the reports look like before update
         const { data: reportsBefore } = await supabaseAdmin
           .from('reports')
           .select('id, verification_status, title')
           .in('id', reportIds)
         console.log('Reports BEFORE update:', reportsBefore)
         
         const { error: reportsUpdateError, data: updatedReports } = await supabaseAdmin
           .from('reports')
           .update({ 
             verification_status: 'resolved',
             verification_color: 'green'
           })
           .in('id', reportIds)
           .select('id, verification_status, title')
         
         if (reportsUpdateError) {
           console.error('Reports update error:', reportsUpdateError)
         } else {
           console.log('Reports AFTER update:', updatedReports)
         }
         
         // Double-check by querying again
         const { data: reportsAfter } = await supabaseAdmin
           .from('reports')
           .select('id, verification_status, title')
           .in('id', reportIds)
         console.log('Reports VERIFICATION (final check):', reportsAfter)

        // Award honor points to all reporters (5 points each)
        const { data: reporters } = await supabaseAdmin
          .from('reports')
          .select('user_id')
          .in('id', reportIds)

        if (reporters && reporters.length > 0) {
          const uniqueUserIds = Array.from(new Set(reporters.map(r => r.user_id).filter(Boolean)))
          console.log('Awarding honor points to:', uniqueUserIds)
          
          for (const reporterId of uniqueUserIds) {
            const { error: honorError } = await supabaseAdmin.rpc('increment_honor_points', { 
              user_id: reporterId, 
              points: 5 
            })
            if (honorError) {
              console.error('Honor points error:', honorError)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, tally: { agree, disagree, total, ratio }, status: newStatus || problem.status })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



