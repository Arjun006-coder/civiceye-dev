import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('=== ULTRA SIMPLE TEST ===');
    
    return NextResponse.json({ 
      success: true,
      message: 'Ultra simple API works!' 
    })

  } catch (error) {
    console.error('Ultra simple error:', error);
    return NextResponse.json({ 
      error: 'Ultra simple failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

