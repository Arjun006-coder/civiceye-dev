import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Try to resolve the app user by clerk_id first
    let appUserId: string | null = null
    const { data: userByClerk } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    if (userByClerk) {
      appUserId = userByClerk.id
    } else {
      // Fallback: resolve by email from Clerk (covers accounts seeded without clerk_id)
      try {
        const clerk = await clerkClient()
        const clerkUser = await clerk.users.getUser(userId)
        const primaryEmail = clerkUser?.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
          || clerkUser?.emailAddresses?.[0]?.emailAddress
        if (primaryEmail) {
          const { data: userByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', primaryEmail)
            .single()
          if (userByEmail) appUserId = userByEmail.id
        }
      } catch {}
    }

    if (!appUserId) return NextResponse.json({ notifications: [] })

    const { data } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', appUserId)
      .order('created_at', { ascending: false })
    return NextResponse.json({ notifications: data || [] })
  } catch (err) {
    return NextResponse.json({ notifications: [] })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const { id, mark } = body as { id?: string; mark?: 'read_all' | 'read_one' }
    if (mark === 'read_all') {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
    } else if (mark === 'read_one' && id) {
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



