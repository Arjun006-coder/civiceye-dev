import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('=== TEST REPORT API ===');
    
    // Create a test report directly
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .insert({
        user_id: '4a4ccf00-88e0-4e29-9c78-e0afdb1fe020', // Your user ID from test
        title: 'Test Report',
        description: 'Emergency test report',
        issue_category_id: '1',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Test Address',
        images: [],
        verification_status: 'pending',
        verification_color: 'yellow',
        harmful_content: false,
        final_confidence_score: 0.5
      })
      .select()
      .single()

    console.log('Test report result:', { report, error });

    if (error) {
      return NextResponse.json({ 
        error: 'Test failed', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      report,
      message: 'Test report created successfully!' 
    })

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

