import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getVerificationColor } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, status, adminNotes } = body as { reportId?: string; status?: 'verified' | 'rejected' | 'under_review' | 'pending'; adminNotes?: string }

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Update report status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('reports')
      .update({
        verification_status: status,
        verification_color: getVerificationColor(status),
        admin_notes: adminNotes || null,
      })
      .eq('id', reportId)
      .select('id, user_id')
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update report' }, { status: 500 })
    }

    // Adjust honor points and reputation on verify only
    if (status === 'verified') {
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('increment_honor_and_reputation', {
          target_user_id: updated.user_id,
          honor_delta: 5,
          reputation_delta: 0.5,
        })
        if (rpcError) throw rpcError
      } catch {
        // Fallback if RPC not present: do direct update
        const { data: current } = await supabaseAdmin
          .from('users')
          .select('honor_score_points, reputation')
          .eq('id', updated.user_id)
          .single()
        if (current) {
          await supabaseAdmin
            .from('users')
            .update({
              honor_score_points: (current.honor_score_points || 0) + 5,
              reputation: (current.reputation || 0) + 0.5,
            })
            .eq('id', updated.user_id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}