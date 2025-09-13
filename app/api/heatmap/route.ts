import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Get reports data for heatmap visualization
    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        user:users(*),
        issue_category:issue_categories(*)
      `)
      .eq('verification_status', 'verified')
      .not('verification_status', 'eq', 'resolved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Reports table not set up yet, returning empty data');
      return NextResponse.json({ reports: [] })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Error in GET heatmap:', error)
    return NextResponse.json({ reports: [] })
  }
}

