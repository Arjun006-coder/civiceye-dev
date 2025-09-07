import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== MOCK UPLOAD API ===');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate mock URL
    const mockUrl = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(file.name)}`;
    
    return NextResponse.json({ 
      url: mockUrl,
      path: `${folder}/mock-${file.name}`,
      message: 'File uploaded successfully (mock)' 
    });

  } catch (error) {
    console.error('Error in mock upload API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

