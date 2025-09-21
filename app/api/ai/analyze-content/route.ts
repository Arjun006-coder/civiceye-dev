import { NextRequest, NextResponse } from 'next/server';
import { MultiProviderAI } from '@/lib/ai/multiProviderAI';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const issueType = formData.get('issueType') as string;
    const userId = formData.get('userId') as string;
    const imageFile = formData.get('image') as File;

    if (!description || !issueType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: description, issueType, userId' },
        { status: 400 }
      );
    }

    // Convert image to base64 if provided
    let imageBase64: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      imageBase64 = `data:${imageFile.type};base64,${base64}`;
    }

    // Initialize AI system
    const ai = new MultiProviderAI();

    // Analyze content
    const analysis = await ai.analyzeContent({
      imageBase64,
      description,
      issueType,
      userId
    });

    // Return results
    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { 
        error: 'AI analysis failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
