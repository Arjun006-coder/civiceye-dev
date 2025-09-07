import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== MOCK USER REPORTS API ===');
    
    // Return mock user reports data
    const mockReports = [
      {
        id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        verification_status: 'verified',
        verification_color: 'green',
        final_confidence_score: 0.85,
        images: ['https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Pothole'],
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '2',
        title: 'Broken Street Light',
        description: 'Street light not working for 3 days',
        verification_status: 'pending',
        verification_color: 'yellow',
        final_confidence_score: 0.65,
        images: ['https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Street+Light'],
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: '3',
        title: 'Garbage Pileup',
        description: 'Garbage not collected for a week',
        verification_status: 'under_review',
        verification_color: 'blue',
        final_confidence_score: 0.8,
        images: ['https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Garbage'],
        created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];

    return NextResponse.json({ 
      reports: mockReports,
      message: 'Mock user reports data loaded' 
    });

  } catch (error) {
    console.error('Error in mock user reports API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

