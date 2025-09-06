# Setup Instructions

## Required Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## How to Get Clerk Keys

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Copy the publishable key and secret key from the dashboard
5. Replace the placeholder values in `.env.local`

## Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`