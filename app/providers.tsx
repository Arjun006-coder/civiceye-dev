'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/nextjs';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // If no publishable key is available, render without Clerk (for build time)
  if (!publishableKey || publishableKey === 'pk_test_placeholder') {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        layout: {
          // optional, but makes sure Clerk uses your routes
          socialButtonsVariant: "iconButton",
        },
      }}
      // 👇 these two options force Clerk to use your in-app routes
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  );
}