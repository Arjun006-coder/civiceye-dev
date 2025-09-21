import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string; // 'nsfw' or 'classify'

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Mock responses for development when Railway is down
    if (type === 'nsfw') {
      // Mock NSFW detection response
      return NextResponse.json({
        flagged: false,
        raw: [
          { label: "nsfw", score: 0.15 },
          { label: "safe", score: 0.85 }
        ]
      });
    } else if (type === 'classify') {
      // Mock issue classification response
      return NextResponse.json([
        { label: "Pothole", score: 0.85 },
        { label: "Garbage", score: 0.10 },
        { label: "Street Light Problem", score: 0.05 }
      ]);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Error in local AI test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
