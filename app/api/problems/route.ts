import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMail } from '@/lib/mailer'
import { auth } from '@clerk/nextjs/server'

async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single()
  return !!user && user.role === 'admin'
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabaseAdmin
      .from('problems')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Problems fetch error:', error)
      // If table missing or other dev issue, return empty set to avoid UI failure
      return NextResponse.json({ problems: [] })
    }
    return NextResponse.json({ problems: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(await isAdmin(userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { action, problem_id } = body as { action?: string; problem_id?: string }

    if (action === 'backfill') {
      // Create problems for existing verified reports that lack problem_id
      const { data: reports } = await supabaseAdmin
        .from('reports')
        .select('id, issue_category_id, latitude, longitude, problem_id')
        .eq('verification_status', 'verified')
        .is('problem_id', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      const created: string[] = []
      if (reports && reports.length > 0) {
        for (const r of reports) {
          // Find an existing problem in same category within 35m
          const { data: candidates } = await supabaseAdmin
            .from('problems')
            .select('id, centroid_lat, centroid_lng, reports_count, report_ids')
            .eq('issue_category_id', r.issue_category_id)

          let chosen: string | null = null
          if (candidates) {
            for (const p of candidates) {
              const d = Math.hypot(
                Number(p.centroid_lat) - Number(r.latitude),
                Number(p.centroid_lng) - Number(r.longitude)
              ) * 111139 // rough meters per degree
              if (d <= 35) {
                const newIds = Array.isArray(p.report_ids) ? [...p.report_ids, r.id] : [r.id]
                await supabaseAdmin
                  .from('problems')
                  .update({
                    reports_count: (p.reports_count || 0) + 1,
                    report_ids: newIds,
                  })
                  .eq('id', p.id)
                chosen = p.id
                break
              }
            }
          }
          if (!chosen) {
            const { data: createdProblem } = await supabaseAdmin
              .from('problems')
              .insert({
                issue_category_id: r.issue_category_id,
                centroid_lat: r.latitude,
                centroid_lng: r.longitude,
                radius_m: 35,
                status: 'open',
                reports_count: 1,
                report_ids: [r.id]
              })
              .select('id')
              .single()
            chosen = createdProblem?.id || null
          }
          if (chosen) {
            await supabaseAdmin
              .from('reports')
              .update({ problem_id: chosen })
              .eq('id', r.id)
            created.push(chosen)
          }
        }
      }
      return NextResponse.json({ success: true, processed: reports?.length || 0 })
    }

    if (action && action !== 'claim_resolved' && action !== 'reopen') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (!problem_id) {
      return NextResponse.json({ error: 'Missing problem_id' }, { status: 400 })
    }

    if (action === 'reopen') {
      const { error: reopenErr } = await supabaseAdmin
        .from('problems')
        .update({ status: 'open' })
        .eq('id', problem_id)
      if (reopenErr) return NextResponse.json({ error: 'Failed to reopen problem' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // claim_resolved → Move problem to public verification
    const { data: problem, error: updErr } = await supabaseAdmin
      .from('problems')
      .update({ status: 'public_verification' })
      .eq('id', problem_id)
      .select('*')
      .single()

    if (updErr || !problem) return NextResponse.json({ error: 'Failed to update problem' }, { status: 500 })

    // Fetch reporters attached to this problem
    const ids = Array.isArray(problem.report_ids) ? problem.report_ids : []
    const { data: reports } = await supabaseAdmin
      .from('reports')
      .select('id, user_id')
      .in('id', ids)

    const reporterIds = Array.from(new Set((reports || []).map(r => r.user_id).filter(Boolean))) as string[]

    if (reporterIds.length > 0) {
      // Check if notifications already exist for this problem
      const { data: existingNotifs } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('related_problem_id', problem_id)

      if (!existingNotifs || existingNotifs.length === 0) {
        // Get problem details for notifications
        const { data: problemDetails } = await supabaseAdmin
          .from('problems')
          .select(`
            id,
            reports:reports(
              id, title, description, address, verification_status
            )
          `)
          .eq('id', problem_id)
          .single()

        const reportTitles = problemDetails?.reports?.map(r => r.title).join(', ') || 'your reported issue'
        
        // Create notifications for reporters
        const notifications = reporterIds.map(user_id => ({
          user_id,
          title: `Resolution claimed: ${reportTitles}`,
          message: `Municipality claims your reported problem "${reportTitles}" is resolved. Please confirm.`,
          type: 'info',
          is_read: false,
          related_problem_id: problem_id,
        }))

        const { error: notifErr, data: createdNotifs } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)
          .select('id')

        if (notifErr) {
          console.error('Notification insert failed:', notifErr)
        } else {
          console.log('Notifications created:', createdNotifs?.length || 0, 'for problem:', problem_id)
        }
      } else {
        console.log('Notifications already exist for problem:', problem_id, 'count:', existingNotifs.length)
      }

      // Email: notify reporters with detailed info
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', reporterIds)
      const emails = (users || []).map(u => u.email).filter(Boolean) as string[]
      
      // Get problem details for email
      const { data: problemDetails } = await supabaseAdmin
        .from('problems')
        .select(`
          id,
          reports:reports(
            id, title, description, address, verification_status
          )
        `)
        .eq('id', problem_id)
        .single()

      for (const email of emails) {
        const reportTitles = problemDetails?.reports?.map(r => r.title).join(', ') || 'your reported issue'
        const reportAddress = problemDetails?.reports?.[0]?.address || 'the reported location'
        
        await sendMail({
          to: email,
          subject: `Resolution Update: ${reportTitles}`,
          text: `The municipality has claimed that your reported problem "${reportTitles}" at ${reportAddress} has been resolved. Please confirm by voting in the app.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Problem Resolution Update</h2>
              <p>Hello,</p>
              <p>The municipality has claimed that your reported problem has been resolved:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #374151;">${reportTitles}</h3>
                <p style="margin: 0; color: #6b7280;">Location: ${reportAddress}</p>
              </div>
              <p>Please confirm if the issue has actually been resolved by voting in the app.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/user_dashboard" 
                 style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                Go to Dashboard to Vote
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Thank you for helping improve your community!
              </p>
            </div>
          `
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in POST /api/problems:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


