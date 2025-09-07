'use client';

export default function DebugPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        <p><strong>Clerk Key:</strong> {clerkKey ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>Supabase URL:</strong> {supabaseUrl ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>Clerk Key Value:</strong> {clerkKey || 'Not available'}</p>
      </div>
    </div>
  );
}
