import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

// PUBLIC: Read-only for transparency — anyone can view actions
export async function GET() {
  try {
    const { data: actions, error } = await supabaseAdmin
      .from('municipality_actions')
      .select(`
        id, action_type, action_color, action_description, assigned_department,
        estimated_completion, start_date, end_date, cost_estimate, priority_level,
        created_at,
        report:reports(id, title, address, issue_category:issue_categories(type))
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching actions:', error)
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 })
    }

    return NextResponse.json({ actions })
  } catch (error) {
    console.error('Error in GET actions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role, id')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { report_id, action_type, action_description, assigned_department, estimated_completion, cost_estimate, priority_level } = body

    const { data: action, error } = await supabaseAdmin
      .from('municipality_actions')
      .insert({
        report_id,
        action_type,
        action_color: getActionColor(action_type),
        action_description,
        assigned_department,
        estimated_completion,
        cost_estimate,
        priority_level: priority_level || 3,
        created_by: user.id
      })
      .select(`
        *,
        report:reports(*)
      `)
      .single()

    if (error) {
      console.error('Error creating action:', error)
      return NextResponse.json({ error: 'Failed to create action' }, { status: 500 })
    }

    return NextResponse.json({ action, message: 'Action created successfully' })
  } catch (error) {
    console.error('Error in POST actions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, action_type, action_description, assigned_department, estimated_completion, cost_estimate, priority_level } = body

    const { data: action, error } = await supabaseAdmin
      .from('municipality_actions')
      .update({
        action_type,
        action_color: getActionColor(action_type),
        action_description,
        assigned_department,
        estimated_completion,
        cost_estimate,
        priority_level
      })
      .eq('id', id)
      .select(`
        *,
        report:reports(*)
      `)
      .single()

    if (error) {
      console.error('Error updating action:', error)
      return NextResponse.json({ error: 'Failed to update action' }, { status: 500 })
    }

    return NextResponse.json({ action, message: 'Action updated successfully' })
  } catch (error) {
    console.error('Error in PUT actions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Action ID required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('municipality_actions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting action:', error)
      return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Action deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE actions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getActionColor(actionType: string): string {
  const colors = {
    planning: 'orange',
    in_progress: 'blue',
    completed: 'green',
    rejected: 'red',
    on_hold: 'yellow'
  }
  return colors[actionType as keyof typeof colors] || 'orange'
}
