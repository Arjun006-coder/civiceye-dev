import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }

    console.log('Testing report update for ID:', reportId)

    // Check current status
    const { data: before } = await supabaseAdmin
      .from('reports')
      .select('id, verification_status, title')
      .eq('id', reportId)
      .single()

    console.log('BEFORE update:', before)

    // Update to resolved
    const { error, data: after } = await supabaseAdmin
      .from('reports')
      .update({ 
        verification_status: 'resolved',
        verification_color: 'green'
      })
      .eq('id', reportId)
      .select('id, verification_status, title')

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('AFTER update:', after)

    return NextResponse.json({ 
      success: true, 
      before, 
      after 
    })
  } catch (err) {
    console.error('Test update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
