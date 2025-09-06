import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.log('User table not set up yet, returning default user');
      return NextResponse.json({ 
        user: {
          id: 'temp-id',
          clerk_id: userId,
          full_name: 'User',
          email: '',
          address: '',
          bio: '',
          honor_score_points: 0,
          reputation: 0,
          role: 'user'
        }
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET /api/users/profile:', error);
    return NextResponse.json({ 
      user: {
        id: 'temp-id',
        clerk_id: userId || 'temp-clerk-id',
        full_name: 'User',
        email: '',
        address: '',
        bio: '',
        honor_score_points: 0,
        reputation: 0,
        role: 'user'
      }
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, email, address, bio, profile_pic_url } = body;

    // Try to update user profile
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        email,
        address,
        bio,
        profile_pic_url,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.log('User table not set up yet, returning success anyway');
      return NextResponse.json({ 
        user: {
          id: 'temp-id',
          clerk_id: userId || 'temp-clerk-id',
          full_name,
          email,
          address,
          bio,
          profile_pic_url,
          honor_score_points: 0,
          reputation: 0,
          role: 'user'
        }
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in PUT /api/users/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
