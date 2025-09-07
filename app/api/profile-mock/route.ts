import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== MOCK PROFILE API ===');
    
    // Return mock profile data
    const mockProfile = {
      id: '1',
      clerk_id: 'user_32HtaYu3nfNXC5K7i6N11Gd7VQI',
      full_name: 'Arjun Agrawal',
      email: 'arjun1234agrawal@gmail.com',
      address: 'Delhi, India',
      phone_number: '+91 9876543210',
      bio: 'Passionate citizen committed to improving our community through civic engagement.',
      profile_pic_url: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AA',
      honor_score_points: 1250,
      reputation: 85,
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      user: mockProfile,
      message: 'Mock profile data loaded' 
    });

  } catch (error) {
    console.error('Error in mock profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

