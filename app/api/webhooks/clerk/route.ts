// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Webhook } from 'svix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
)

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Required environment variables not found - webhook disabled')
    return NextResponse.json({ message: 'Webhook disabled - environment variables not configured' }, { status: 200 })
  }

  // Get headers
  const headerPayload = request.headers
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  // Get body
  const payload = await request.text()

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let evt: any

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  const eventType = evt.type
  console.log('Webhook received:', eventType)

  try {
    if (eventType === 'user.created') {
      const userData = evt.data

      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: userData.id,
          email: userData.email_addresses[0]?.email_address,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
          profile_pic_url: userData.image_url,
          // Set admin role for your email - REPLACE WITH YOUR ACTUAL EMAIL
          role: userData.email_addresses[0]?.email_address === 'arjun1234agrawal@gmail.com' ? 'admin' : 'user'
        })

      if (error) {
        console.error('Error creating user in Supabase:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log('User created in Supabase:', data)
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
