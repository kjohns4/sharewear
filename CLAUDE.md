# shareWear

A web app where friends coordinate outfits for events. Users create events, share an invite link, and post outfit descriptions to a shared feed — centralizing the "what are you wearing?" conversation.

## Stack
- React + Vite (TypeScript)
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- shadcn/ui-style primitives (Radix + CVA, no shadcn CLI)
- Supabase (Postgres, Auth, RLS)
- Vercel (auto-deploy on push)

## Folder Structure
```
src/
  components/
    ui/          # button, input, label, dialog
    CreateEventModal.tsx
    EventCard.tsx
    OutfitPost.tsx
  pages/
    Home.tsx
    Event.tsx
    Login.tsx
    SetDisplayName.tsx
  lib/
    supabase.ts
    database.types.ts   # hand-typed schema; keep in sync with Supabase
    auth.tsx            # AuthProvider + useAuth hook
    utils.ts            # cn(), generateInviteCode()
  App.tsx
  main.tsx
  index.css
```

## Supabase Tables

### profiles
| column | type | notes |
|---|---|---|
| id | uuid | = auth.uid(), PK |
| display_name | text | set on first login |
| created_at | timestamptz | default now() |

RLS: users can read all profiles, update only their own.

### events
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| date | date | nullable |
| created_by | uuid | FK → profiles.id |
| invite_code | text | unique, random 8-char string |
| created_at | timestamptz | default now() |

RLS: anyone authenticated can read events (by invite_code lookup). Only creator can update/delete.

### outfit_posts
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → events.id |
| user_id | uuid | FK → profiles.id |
| description | text | |
| created_at | timestamptz | default now() |

RLS: authenticated users can read all posts for an event. Users can only insert/update/delete their own posts.

## Completed Tasks
- [x] Vite + React + TypeScript scaffold
- [x] Tailwind CSS v4 + shadcn/ui-style UI primitives
- [x] Supabase client (typed via database.types.ts)
- [x] Auth context (AuthProvider / useAuth)
- [x] Magic link login page
- [x] First-login display_name prompt (SetDisplayName)
- [x] CreateEventModal (name + optional date, generates invite_code)
- [x] Home page (lists user's events)
- [x] Event page (public feed by invite_code, post outfit descriptions)
- [x] EventCard and OutfitPost display components
- [x] Copy-invite-link button on Event page
- [x] Auth guard routing in App.tsx (login → display_name → home)
- [x] TypeScript clean (tsc --noEmit passes)
- [x] Production build passes

## Remaining: Engineer Action Required
- [ ] **Supabase: run SQL migration** (see supabase/migrations/001_initial.sql)
- [ ] **Supabase: enable Email auth with Magic Link** in Authentication > Providers
- [ ] **Set redirect URL** in Supabase Authentication > URL Configuration: add `http://localhost:5173`
- [ ] **Create .env.local** with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] **Vercel: set same env vars** in project settings for production
- [ ] Connect Vercel to GitHub repo and enable auto-deploy

## V2 Backlog
- Outfit photos / image upload
- Likes / reactions on posts
- Edit/delete your own post
- Friend system / private events
- Push or email notifications when someone posts
- Real-time feed updates (Supabase realtime channel)
- Event page visible to unauthenticated users without sign-in banner blocking the view

## Known Gotchas
- invite_code is generated client-side (nanoid-style 8-char string). Collision risk is negligible for MVP scale but switch to a Supabase function or DB default for scale.
- Magic link auth requires a confirmed email — test with a real email in dev. Supabase blocks magic links to unverified addresses.
- Supabase RLS must be enabled on all tables before going live; do not skip.
- `database.types.ts` is hand-maintained. After any schema change, update it to match. Consider generating it from Supabase CLI (`supabase gen types typescript`) in the future.
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind base/components/utilities` — do not use v3 syntax.
- TypeScript's `baseUrl` is deprecated in TS 7.0; suppressed with `"ignoreDeprecations": "6.0"` in tsconfig.app.json.
- The Supabase join `.select('*, profiles(display_name)')` on outfit_posts requires the FK `outfit_posts_user_id_fkey` to exist in the DB. The migration creates it.

## Deploy
- Target: Vercel
- Env vars needed:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

## Security
- Secrets in .env.local only, never hardcoded. `.env.local` covered by `*.local` in .gitignore.
- RLS enabled on all tables (see migration)
- Input validated client-side before all Supabase writes (length bounds checked)
- Auth enforced in RLS policies, not only in UI
- No `any` types in TypeScript
- npm audit: 0 vulnerabilities (checked after each install)

## Commit Conventions
Conventional Commits: `<type>(scope): <description>`
Types: feat, fix, refactor, chore, style, test, docs
One concern per commit — atomic, self-contained, reviewable in isolation.
Push after every 2-3 commits so the PR stays current.
Open a PR for each logical feature unit — do not batch the entire session into one PR.
