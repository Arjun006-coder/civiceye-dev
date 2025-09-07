import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE REPORT API START ===');
    
    const { userId } = await auth()
    console.log('User ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body);
    
    const { title, description, issue_category_id, latitude, longitude, address, images } = body

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    console.log('User found:', user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get first available category
    const { data: categories } = await supabaseAdmin
      .from('issue_categories')
      .select('id')
      .limit(1)

    const categoryId = categories && categories.length > 0 ? categories[0].id : null

    // Create report with minimal data
    const reportData = {
      user_id: user.id,
      title: title || 'Test Report',
      description: description || 'Test Description',
      issue_category_id: issue_category_id || categoryId,
      latitude: latitude ? parseFloat(latitude) : 0,
      longitude: longitude ? parseFloat(longitude) : 0,
      address: address || 'Test Address',
      images: images || [],
      verification_status: 'pending',
      verification_color: 'yellow',
      harmful_content: false,
      final_confidence_score: 0.5
    }

    console.log('Creating report with:', reportData);

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .insert(reportData)
      .select()
      .single()

    console.log('Report result:', { report, error });

    if (error) {
      console.error('Report creation error:', error);
      return NextResponse.json({ 
        error: 'Failed to create report', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('=== REPORT CREATED SUCCESSFULLY ===');
    return NextResponse.json({ 
      report, 
      message: 'Report created successfully' 
    })

  } catch (error) {
    console.error('=== SIMPLE REPORT API ERROR ===');
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
