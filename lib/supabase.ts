import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Client for client-side operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface User {
  id: string
  clerk_id: string
  full_name: string
  email: string
  address?: string
  bio?: string
  profile_pic_url?: string
  phone_number?: string
  honor_score_points: number
  reputation: number
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IssueCategory {
  id: string
  type: string
  description: string
  color_code: string
}

export interface Report {
  id: string
  user_id: string
  title: string
  description: string
  issue_category_id: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'under_review' | 'resolved'
  verification_color: string
  latitude: number
  longitude: number
  address: string
  images: string[]
  ai_confidence_score?: number
  multiple_report_confidence_score?: number
  harmful_content: boolean
  final_confidence_score?: number
  admin_notes?: string
  created_at: string
  updated_at: string
  // Joined data
  user?: User
  issue_category?: IssueCategory
}

export interface MunicipalityAction {
  id: string
  report_id: string
  action_type: 'planning' | 'in_progress' | 'completed' | 'rejected' | 'on_hold'
  action_color: string
  action_description: string
  assigned_department: string
  estimated_completion?: string
  start_date?: string
  end_date?: string
  cost_estimate?: number
  priority_level: number
  created_by: string
  created_at: string
  // Joined data
  report?: Report
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  total_points: number
  reports_submitted: number
  verified_reports: number
  rank_position: number
  created_at: string
  // Joined data
  user?: User
}

export interface HeatmapData {
  id: string
  area_name: string
  latitude: number
  longitude: number
  total_reports: number
  pending_reports: number
  resolved_reports: number
  intensity_score: number
  last_report_date: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  related_report_id?: string
  created_at: string
}

// Problems feature
export interface Problem {
  id: string
  issue_category_id: string
  centroid_lat: number
  centroid_lng: number
  radius_m: number
  status: 'open' | 'in_progress' | 'claimed_resolved' | 'public_verification' | 'resolved' | 'disputed'
  reports_count: number
  report_ids: string[]
  created_at: string
  updated_at: string
}

export type ProblemVoteType = 'agree' | 'disagree'

export interface ProblemVote {
  id: string
  problem_id: string
  user_id: string
  vote: ProblemVoteType
  reason?: string
  created_at: string
}

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function recomputeCentroid(
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 0, lng: 0 }
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}

// Utility functions
export const getVerificationColor = (status: string): string => {
  const colors = {
    pending: 'yellow',
    verified: 'green',
    rejected: 'red',
    under_review: 'blue'
  }
  return colors[status as keyof typeof colors] || 'yellow'
}

export const getActionColor = (actionType: string): string => {
  const colors = {
    planning: 'orange',
    in_progress: 'blue',
    completed: 'green',
    rejected: 'red',
    on_hold: 'yellow'
  }
  return colors[actionType as keyof typeof colors] || 'orange'
}

export const getStatusBadgeClasses = (status: string, type: 'verification' | 'action'): string => {
  const verificationColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  const actionColors = {
    planning: 'bg-orange-100 text-orange-800 border-orange-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  if (type === 'verification') {
    return verificationColors[status as keyof typeof verificationColors] || verificationColors.pending
  } else {
    return actionColors[status as keyof typeof actionColors] || actionColors.planning
  }
}
