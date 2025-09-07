import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== MOCK DASHBOARD API ===');
    
    // Return mock dashboard data
    const mockData = {
      totalReports: 156,
      verifiedReports: 89,
      pendingReports: 45,
      rejectedReports: 22,
      totalUsers: 234,
      activeUsers: 189,
      avgConfidence: 0.78,
      recentReports: [
        {
          id: '1',
          title: 'Pothole on Main Street',
          status: 'verified',
          confidence: 0.85,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Broken Street Light',
          status: 'pending',
          confidence: 0.65,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Garbage Pileup',
          status: 'under_review',
          confidence: 0.8,
          created_at: new Date().toISOString()
        }
      ]
    };

    return NextResponse.json({ 
      ...mockData,
      message: 'Mock dashboard data loaded' 
    });

  } catch (error) {
    console.error('Error in mock dashboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

