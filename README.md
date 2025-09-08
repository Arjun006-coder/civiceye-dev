# Civic‑Eye

Civic‑Eye is a community reporting platform that lets citizens submit issues, track progress, and view transparent municipal actions. It includes an admin dashboard for report verification and action management, and a public heatmap of verified issues.

## Table of contents

- Features
- Tech stack
- Architecture
- Getting started
- Environment variables
- Supabase setup (DB + Storage)
- Clerk setup (Auth)
- Development workflow
- Deployment (Vercel)
- Key modules and APIs
- Confidence score logic
- Heatmap logic
- Roadmap (upcoming features)
- Troubleshooting

## Features

- Citizen reporting with image uploads, geolocation, and issue categories
- Dynamic confidence scoring (base + reputation + corroboration + AI placeholder)
- Duplicate report prevention (Haversine radius check)
- User profile with totals, verified reports, honor points, recent reports
- Leaderboard with ranks, totals, verified counts
- Admin dashboard for live stats, review/verify/reject reports
- Official Actions (transparent, public‑read view of municipal actions)
- Heatmap built from verified reports only, clustered with 500m translucent radius overlays
- File uploads to Supabase Storage (public URLs)
- Role‑based access (user/admin) with Clerk auth

## Tech stack

- Framework: Next.js 15 (App Router, Route Handlers, Turbopack)
- Language: TypeScript
- UI: React 19, Tailwind CSS v4, Radix UI primitives (via components under `components/ui`), Lucide icons
- Animation: Framer Motion
- Forms: React Hook Form (+ resolvers)
- Maps: React‑Leaflet + Leaflet
- Auth: Clerk (`@clerk/nextjs`)
- Database & Storage: Supabase (Postgres, Storage)
- State/Async: React hooks (and optional TanStack Query installed)
- Tooling: ESLint, Prettier, Husky (git hooks)
- CI/CD & Hosting: GitHub + Vercel

## Architecture

- App Router structure under `app/`
  - Pages: `dashboard`, `user_dashboard`, `AdminDashboard`, `profile`, `report`, `heatmaps`, `leaderboard`, `municipality`, `team`
  - APIs: `app/api/**` (serverless route handlers)
- Data access via `lib/supabase.ts`
- Auth integration and DB sync via `hooks/use-user.ts`

## Getting started

1) Install deps

```bash
npm install
```

2) Set env vars in `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

3) Run dev

```bash
npm run dev
```

4) Build

```bash
npm run build
npm start
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` – Service role (server‑side only)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk publishable key
- `CLERK_SECRET_KEY` – Clerk secret

## Supabase setup (DB + Storage)

- Create tables: `users`, `reports`, `issue_categories`, `leaderboard`, `municipality_actions`
- Storage bucket: `report-images` (public). The upload API auto‑creates it if missing.
- Ensure Postgres Row Level Security rules match your needs. Server APIs use the service role client.

## Clerk setup (Auth)

- Create a Clerk application and copy the publishable + secret keys into `.env.local`.
- Configure OAuth providers in Clerk if desired.

## Development workflow

- Lint: `npm run lint`
- Commit hooks: Husky runs on commit/push
- Preferred branch: `main` → Vercel auto‑deploys

## Deployment (Vercel)

- Connect GitHub repo to Vercel
- Set the environment variables in Vercel project settings
- Each push to `main` triggers a build and deployment

## Key modules and APIs

- Reports
  - `POST /api/reports` – create report (with duplicate guard, confidence scoring)
  - `GET /api/reports` – list: users see verified + their own; admins see all
  - `POST /api/reports/verify` – admin verify/reject; updates honor points (+5) and reputation (+0.5) on verify
- Uploads
  - `POST /api/upload` – upload file to Supabase Storage; validates type/size, ensures bucket, retries once
- Admin
  - `GET /api/admin/dashboard` – live stats (reports/users/avg confidence)
  - `GET /api/admin/actions` – public‑read transparency actions (safe subset of fields)
- Leaderboard
  - `GET /api/leaderboard` – leaderboard entries with user join
- Heatmap
  - `GET /api/heatmap` – verified reports only with location and joins

## Confidence score logic

Final confidence (capped to 0.8 until AI is added):

- Base: 40%
- Reputation bonus: 0–20% (reputation 30–40 → 1–20%)
- Multiple reports corroboration: 0–20% (counts within radius thresholds)
- AI analysis: 0–20% (reserved; currently 0)
- ≥80% → auto mark as `under_review`

Honor/Rep

- Honor +5 and Reputation +0.5 only when a report is verified

## Heatmap logic

- Server returns only verified reports
- Client clusters reports in 500m radius using Haversine distance
- Each cluster draws a 500m translucent circle colored by cluster size:
  - 9+ red, 4–8 yellow/orange, 2–3 green, 1 blue

## Roadmap (upcoming)

- AI moderation for images/text (flag harmful or irrelevant content)
- AI confidence scoring (vision + text signals to contribute up to 20%)
- Push notifications (status updates, verifications)
- Advanced analytics (trends, department performance)
- PWA offline support and background sync for report drafts
- Geospatial indexing for scalable clustering
- Role‑based actions management with audit logs

## Troubleshooting

- Upload fails
  - Check Supabase env keys; ensure `report-images` bucket exists (API ensures on first run)
  - Validate file is image/* and ≤ 10MB
- 401/403 on actions or reports
  - Sign in; public actions are read‑only, admin endpoints require admin
- Vercel build errors
  - Ensure no stray JSX or type errors; run `npm run build` locally

---

Contributions welcome. Open issues or PRs for enhancements and bug fixes.
