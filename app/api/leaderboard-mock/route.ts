import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== MOCK LEADERBOARD API ===');
    
    // Return mock leaderboard data
    const mockLeaderboard = [
      {
        id: '1',
        user_id: 'user1',
        full_name: 'Arjun Agrawal',
        honor_score_points: 1250,
        reports_submitted: 15,
        verified_reports: 12,
        rank_position: 1
      },
      {
        id: '2',
        user_id: 'user2',
        full_name: 'Priya Sharma',
        honor_score_points: 980,
        reports_submitted: 12,
        verified_reports: 9,
        rank_position: 2
      },
      {
        id: '3',
        user_id: 'user3',
        full_name: 'Raj Kumar',
        honor_score_points: 750,
        reports_submitted: 8,
        verified_reports: 6,
        rank_position: 3
      },
      {
        id: '4',
        user_id: 'user4',
        full_name: 'Sneha Patel',
        honor_score_points: 620,
        reports_submitted: 7,
        verified_reports: 5,
        rank_position: 4
      },
      {
        id: '5',
        user_id: 'user5',
        full_name: 'Vikram Singh',
        honor_score_points: 480,
        reports_submitted: 5,
        verified_reports: 4,
        rank_position: 5
      }
    ];

    return NextResponse.json({ 
      leaderboard: mockLeaderboard,
      message: 'Mock leaderboard data loaded' 
    });

  } catch (error) {
    console.error('Error in mock leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

