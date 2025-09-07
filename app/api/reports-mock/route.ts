import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('=== MOCK REPORT API ===');
    
    // Just return success without touching database
    return NextResponse.json({ 
      success: true,
      report: {
        id: 'mock-report-id',
        title: 'Mock Report',
        description: 'This is a mock report for testing',
        verification_status: 'pending'
      },
      message: 'Mock report created successfully!' 
    })

  } catch (error) {
    console.error('Mock error:', error);
    return NextResponse.json({ 
      error: 'Mock failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

