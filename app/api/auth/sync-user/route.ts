import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, fullName, profilePicUrl } = body

    // Try to check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // If it's not a "not found" error, return the error
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email,
          full_name: fullName,
          profile_pic_url: profilePicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }

      return NextResponse.json({ user: data, message: 'User updated successfully' })
    } else {
      // Create new user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email,
          full_name: fullName,
          profile_pic_url: profilePicUrl,
          role: email === 'arjun1234agrawal@gmail.com' ? 'admin' : 'user',
          honor_score_points: 0,
          reputation: 10,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      return NextResponse.json({ user: data, message: 'User created successfully' })
    }
  } catch (error) {
    console.error('Error in sync-user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in get-user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
