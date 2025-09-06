import { useUser as useClerkUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { User } from '@/lib/supabase'

export function useUser() {
  // Check if Clerk is available
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkAvailable = publishableKey && publishableKey !== 'pk_test_placeholder';

  // Only use Clerk hooks if Clerk is available
  const clerkData = isClerkAvailable ? useClerkUser() : { user: null, isLoaded: true };
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClerkAvailable || !clerkData.isLoaded || !clerkData.user) {
      setLoading(false)
      return
    }

    const syncUser = async () => {
      try {
        setLoading(true)
        setError(null)

        // First try to get existing user
        const response = await fetch('/api/auth/sync-user')
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else if (response.status === 404) {
          // User doesn't exist, create them
          const createResponse = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: clerkData.user.primaryEmailAddress?.emailAddress,
              fullName: clerkData.user.fullName || 'User',
              profilePicUrl: clerkData.user.imageUrl
            })
          })

          if (createResponse.ok) {
            const data = await createResponse.json()
            setUser(data.user)
          } else {
            // If creation fails, create a temporary user object
            console.log('Failed to create user in database, using temporary user')
            setUser({
              id: 'temp-id',
              clerk_id: clerkData.user.id,
              full_name: clerkData.user.fullName || 'User',
              email: clerkData.user.primaryEmailAddress?.emailAddress || '',
              address: '',
              bio: '',
              profile_pic_url: clerkData.user.imageUrl,
              honor_score_points: 0,
              reputation: 0,
              role: 'user',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        } else {
          // If sync fails, create a temporary user object
          console.log('Failed to sync user, using temporary user')
          setUser({
            id: 'temp-id',
            clerk_id: clerkData.user.id,
            full_name: clerkData.user.fullName || 'User',
            email: clerkData.user.primaryEmailAddress?.emailAddress || '',
            address: '',
            bio: '',
            profile_pic_url: clerkData.user.imageUrl,
            honor_score_points: 0,
            reputation: 0,
            role: 'user',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } catch (err) {
        console.error('Error syncing user:', err)
        // Create a temporary user object on error
        setUser({
          id: 'temp-id',
          clerk_id: clerkData.user.id,
          full_name: clerkData.user.fullName || 'User',
          email: clerkData.user.primaryEmailAddress?.emailAddress || '',
          address: '',
          bio: '',
          profile_pic_url: clerkData.user.imageUrl,
          honor_score_points: 0,
          reputation: 0,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setError(null) // Don't show error to user, just use temp data
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [isClerkAvailable, clerkData.user, clerkData.isLoaded])

  return {
    user,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    isLoaded: isClerkAvailable ? (clerkData.isLoaded && !loading) : true
  }
}
