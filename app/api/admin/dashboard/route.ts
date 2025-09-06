import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get dashboard statistics
    const [
      totalReportsResult,
      pendingReportsResult,
      verifiedReportsResult,
      rejectedReportsResult,
      totalUsersResult,
      activeUsersResult,
      avgConfidenceResult
    ] = await Promise.all([
      supabaseAdmin.from('reports').select('id', { count: 'exact' }),
      supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('verification_status', 'verified'),
      supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('verification_status', 'rejected'),
      supabaseAdmin.from('users').select('id', { count: 'exact' }),
      supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('is_active', true),
      supabaseAdmin.from('reports').select('final_confidence_score').not('final_confidence_score', 'is', null)
    ])

    const totalReports = totalReportsResult.count || 0
    const pendingReports = pendingReportsResult.count || 0
    const verifiedReports = verifiedReportsResult.count || 0
    const rejectedReports = rejectedReportsResult.count || 0
    const totalUsers = totalUsersResult.count || 0
    const activeUsers = activeUsersResult.count || 0

    // Calculate average confidence score
    const confidenceScores = avgConfidenceResult.data?.map(r => r.final_confidence_score) || []
    const avgConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0

    const stats = {
      totalReports,
      pendingReports,
      verifiedReports,
      rejectedReports,
      totalUsers,
      activeUsers,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in admin dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
