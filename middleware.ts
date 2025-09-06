import { clerkMiddleware } from '@clerk/nextjs/server';

// Only use Clerk middleware if we have the publishable key
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default publishableKey && publishableKey !== 'pk_test_placeholder' 
  ? clerkMiddleware() 
  : () => {};

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
