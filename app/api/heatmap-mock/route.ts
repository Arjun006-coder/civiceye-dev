import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== MOCK HEATMAP API ===');
    
    // Return mock reports data
    const mockReports = [
      {
        id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'Main Street, Delhi',
        verification_status: 'verified',
        final_confidence_score: 0.85,
        images: ['https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Pothole'],
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Broken Street Light',
        description: 'Street light not working for 3 days',
        latitude: 28.6149,
        longitude: 77.2100,
        address: 'Park Avenue, Delhi',
        verification_status: 'pending',
        final_confidence_score: 0.65,
        images: ['https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Street+Light'],
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Garbage Pileup',
        description: 'Garbage not collected for a week',
        latitude: 28.6129,
        longitude: 77.2080,
        address: 'Residential Area, Delhi',
        verification_status: 'under_review',
        final_confidence_score: 0.8,
        images: ['https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Garbage'],
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      reports: mockReports,
      message: 'Mock heatmap data loaded' 
    });

  } catch (error) {
    console.error('Error in mock heatmap API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

