
'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { isAdmin, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (isAdmin) router.replace('/AdminDashboard');
    else router.replace('/user_dashboard');
  }, [router, isAdmin, isLoaded]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to your dashboard</p>
      </div>
    </div>
  );
}



