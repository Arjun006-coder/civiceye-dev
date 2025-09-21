import { NextRequest, NextResponse } from 'next/server';
import { MultiProviderAI } from '@/lib/ai/multiProviderAI';

export async function GET(request: NextRequest) {
  try {
    const ai = new MultiProviderAI();
    const testResults = await ai.testProviders();

    return NextResponse.json({
      success: true,
      providers: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Provider test error:', error);
    return NextResponse.json(
      { 
        error: 'Provider test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
