'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user_dashboard');
  }, [router]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to your dashboard</p>
      </div>
    </div>
  );
}



