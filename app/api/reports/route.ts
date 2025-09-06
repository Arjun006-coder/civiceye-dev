import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tables exist by trying to query them
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (userError) {
      console.log('Tables not set up yet, returning empty data');
      return NextResponse.json({ reports: [] })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('reports')
      .select(`
        *,
        user:users(*),
        issue_category:issue_categories(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on user role
    if (user.role === 'user') {
      // Users can only see verified reports and their own reports
      query = query.or(`verification_status.eq.verified,user_id.in.(
        select id from users where clerk_id.eq.${userId}
      )`)
    }

    if (status) {
      query = query.eq('verification_status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({ reports: [] })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Error in GET reports:', error)
    return NextResponse.json({ reports: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, issue_category_id, latitude, longitude, address, images } = body

    // Check for duplicate reports within 20m radius
    if (latitude && longitude) {
      const { data: nearbyReports, error: nearbyError } = await supabaseAdmin
        .from('reports')
        .select('id, title, issue_category_id, verification_status, latitude, longitude')
        .eq('issue_category_id', issue_category_id)
        .neq('verification_status', 'rejected')
        .neq('verification_status', 'resolved')

      if (!nearbyError && nearbyReports) {
        const duplicateFound = nearbyReports.some(report => {
          if (!report.latitude || !report.longitude) return false
          
          // Calculate distance using Haversine formula (simplified for small distances)
          const R = 6371000 // Earth's radius in meters
          const dLat = (latitude - report.latitude) * Math.PI / 180
          const dLon = (longitude - report.longitude) * Math.PI / 180
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(latitude * Math.PI / 180) * Math.cos(report.latitude * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const distance = R * c // Distance in meters
          
          return distance <= 20 // 20 meter radius
        })

        if (duplicateFound) {
          return NextResponse.json({ 
            error: 'A similar issue has already been reported in this area. Please wait for it to be resolved before reporting again.',
            code: 'DUPLICATE_REPORT'
          }, { status: 400 })
        }
      }
    }

    // Get user's database ID and reputation
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, reputation')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate dynamic confidence score
    let confidenceScore = 0.5 // Base score

    // Factor 1: User reputation (0-0.3 points)
    const reputationBonus = Math.min(user.reputation / 100, 0.3)
    confidenceScore += reputationBonus

    // Factor 2: Multiple reports in same area (0-0.2 points)
    let nearbySimilarReports = null
    if (latitude && longitude) {
      const { data: nearbyReports } = await supabaseAdmin
        .from('reports')
        .select('id')
        .eq('issue_category_id', issue_category_id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      nearbySimilarReports = nearbyReports

      if (nearbyReports && nearbyReports.length >= 3) {
        confidenceScore += 0.2 // Bonus for multiple reports
      } else if (nearbyReports && nearbyReports.length >= 2) {
        confidenceScore += 0.1 // Smaller bonus for 2 reports
      }
    }

    // Factor 3: AI analysis placeholder (0-0.3 points)
    // This will be implemented later when AI is added
    const aiConfidence = 0.1 // Placeholder - will be replaced with actual AI analysis
    confidenceScore += aiConfidence

    // Factor 4: Image quality (0-0.2 points)
    if (images && images.length > 0) {
      confidenceScore += 0.2 // Bonus for having images
    }

    // Cap confidence score between 0 and 1
    confidenceScore = Math.min(Math.max(confidenceScore, 0), 1)

    // Determine verification status based on confidence score
    let verificationStatus = 'pending'
    if (confidenceScore >= 0.8) {
      verificationStatus = 'auto_verified'
    }

    // Create report
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .insert({
        user_id: user.id,
        title,
        description,
        issue_category_id,
        latitude,
        longitude,
        address,
        images: images || [],
        verification_status: verificationStatus,
        verification_color: verificationStatus === 'auto_verified' ? 'green' : 'yellow',
        harmful_content: false,
        ai_confidence_score: aiConfidence,
        multiple_report_confidence_score: nearbySimilarReports ? Math.min(nearbySimilarReports.length * 0.1, 0.2) : 0,
        final_confidence_score: confidenceScore
      })
      .select(`
        *,
        user:users(*),
        issue_category:issue_categories(*)
      `)
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    // Update user's report count - get current points first
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('honor_score_points')
      .eq('id', user.id)
      .single()
    
    if (currentUser) {
      await supabaseAdmin
        .from('users')
        .update({
          honor_score_points: currentUser.honor_score_points + 5
        })
        .eq('id', user.id)
    }

    return NextResponse.json({ report, message: 'Report created successfully' })
  } catch (error) {
    console.error('Error in POST reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
