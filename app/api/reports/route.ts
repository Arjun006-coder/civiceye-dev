import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getVerificationColor } from '@/lib/supabase'
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
      .select('id, role')
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
      query = query.or(`verification_status.eq.verified,user_id.eq.${user.id}`)
    }

    if (status) {
      query = query.eq('verification_status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Error in GET reports:', error)
    return NextResponse.json({ reports: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== REPORT SUBMISSION START ===');
    
    const { userId } = await auth()
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body);
    const { title, description, issue_category_id, latitude, longitude, address, images } = body

    // Check for duplicate reports within 35m radius
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
          
          return distance <= 35 // 35 meter radius
        })

        if (duplicateFound) {
          return NextResponse.json({ 
            error: 'A similar issue has already been reported in this area. Please wait for it to be resolved before reporting again.',
            code: 'DUPLICATE_REPORT'
          }, { status: 400 })
        }
      }
    }

    // AI Analysis removed - will be handled by external service

    // Get user's database ID and reputation
    console.log('Looking for user with clerk_id:', userId);
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, reputation')
      .eq('clerk_id', userId)
      .single()

    console.log('User query result:', { user, userError });

    if (userError || !user) {
      console.error('User not found in database:', userError);
      return NextResponse.json({ 
        error: 'User not found in database. Please refresh the page and try again.',
        code: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // Calculate dynamic confidence score per requested rules
    // Base score: 30-40% → use 35%
    let confidenceScore = 0.35

    // Factor 1: User reputation (0-10%)
    // Reputation of 10 → 0% bonus; scales up to +10%
    const normalizedReputation = Math.max(0, (user.reputation - 10) / 90)
    const reputationBonus = Math.min(0.1, normalizedReputation * 0.1)
    confidenceScore += reputationBonus

    // Factor 2: Multiple reports in same area (10-20% for 3-4 within radius)
    let nearbySimilarReports: { id: string; latitude?: number; longitude?: number }[] | null = null
    let corroborationBonus = 0
    if (latitude && longitude) {
      const { data: nearbyReports } = await supabaseAdmin
        .from('reports')
        .select('id, latitude, longitude, issue_category_id')
        .eq('issue_category_id', issue_category_id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      nearbySimilarReports = nearbyReports as { id: string; latitude?: number; longitude?: number }[]

      // Count within 100m radius
      const R = 6371000
      const toRad = (deg: number) => (deg * Math.PI) / 180
      const countWithinRadius = (nearbyReports || []).reduce((count, r: { id: string; latitude?: number; longitude?: number }) => {
        if (r.latitude == null || r.longitude == null) return count
        const dLat = toRad((latitude as number) - r.latitude)
        const dLon = toRad((longitude as number) - r.longitude)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(latitude as number)) * Math.cos(toRad(r.latitude)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        return distance <= 100 ? count + 1 : count
      }, 0)

      if (countWithinRadius >= 4) corroborationBonus = 0.2
      else if (countWithinRadius >= 3) corroborationBonus = 0.1
      confidenceScore += corroborationBonus
    }

    // Factor 3: AI analysis removed - will be handled by external service

    // Cap confidence score to max 1.0 (now includes AI analysis)
    confidenceScore = Math.min(Math.max(confidenceScore, 0), 1.0)

    // Determine verification status (no auto-verify status)
    // If high confidence, mark as under_review; else pending
    let verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' = 'pending'
    if (confidenceScore >= 0.8) {
      verificationStatus = 'under_review'
    }

    // Create report

    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .insert({
        user_id: user.id,
        title,
        description,
        issue_category_id,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        images: images || [],
        verification_status: verificationStatus,
        verification_color: getVerificationColor(verificationStatus),
        harmful_content: false,
        is_nsfw: false,
        ai_confidence_score: 0,
        multiple_report_confidence_score: nearbySimilarReports ? Math.min(nearbySimilarReports.length * 0.1, 0.2) : 0,
        final_confidence_score: confidenceScore
      })
      .select(`
        *,
        user:users(*),
        issue_category:issue_categories(*)
      `)
      .single()

    console.log('Report creation result:', { report, error });

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json({ error: 'Failed to create report', details: error }, { status: 500 })
    }

    // Do not add honor points on submission. Points are awarded only on verification.

    console.log('=== REPORT SUBMISSION SUCCESS ===');
    return NextResponse.json({ report, message: 'Report created successfully' })
  } catch (error) {
    console.error('=== REPORT SUBMISSION ERROR ===');
    console.error('Error in POST reports:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
