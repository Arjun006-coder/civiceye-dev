import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database access
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, clerk_id, full_name')
      .limit(5);

    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('id, title, user_id')
      .limit(5);

    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('issue_categories')
      .select('id, type, description')
      .limit(5);

    return NextResponse.json({
      success: true,
      users: { data: users, error: usersError },
      reports: { data: reports, error: reportsError },
      categories: { data: categories, error: categoriesError }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

