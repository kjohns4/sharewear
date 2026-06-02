# shareWear

A web app where friends coordinate outfits for events. Users create events, share an invite link, and post outfit descriptions to a shared feed — centralizing the "what are you wearing?" conversation.

## Stack
- React + Vite (TypeScript)
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- shadcn/ui-style primitives (Radix + CVA, no shadcn CLI)
- Supabase (Postgres, Auth, RLS)
- Vercel (auto-deploy on push from GitHub: kjohns4/sharewear)

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

RLS: anyone (anon + authenticated) can read. Users can insert/update only their own row.

### events
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| date | date | nullable |
| created_by | uuid | FK → profiles.id |
| invite_code | text | unique, random 8-char string |
| created_at | timestamptz | default now() |

RLS: anyone (anon + authenticated) can read. Only creator can insert/update/delete.

### outfit_posts
| column | type | notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → events.id |
| user_id | uuid | FK → profiles.id |
| description | text | |
| created_at | timestamptz | default now() |

RLS: anyone (anon + authenticated) can read. Users can only insert/update/delete their own posts.

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
- [x] Supabase migration run (profiles, events, outfit_posts + RLS + trigger)
- [x] Role grants applied (anon + authenticated can reach tables)
- [x] Anon read policies added (events + outfit_posts + profiles readable without login)
- [x] GitHub repo created (private: kjohns4/sharewear)
- [x] Vercel connected to GitHub, env vars set, auto-deploy working
- [x] Supabase Site URL + redirect URLs configured for production
- [x] Display name save navigates immediately (onSaved callback fix)
- [x] Auth works end to end in production (magic link → display name → home)

## Open Issues
- [ ] **Vercel deep link 404**: `/event/:code` returns 404 in production. `vercel.json` with both `rewrites` and `routes` formats attempted — neither worked. Root cause is likely a Root Directory or Output Directory override in the Vercel project settings (Settings → General) conflicting with the SPA fallback config. Works fine locally.

## V2 Backlog
- Outfit photos / image upload
- Likes / reactions on posts
- Edit/delete your own post
- Friend system / private events
- Push or email notifications when someone posts
- Real-time feed updates (Supabase realtime channel)

## Known Gotchas
- **Vercel SPA routing**: `vercel.json` `rewrites` format conflicts with Vite framework preset. `routes` format also tried. Check Vercel project Settings → General for Root/Output Directory overrides before trying other fixes.
- **Supabase RLS needs GRANTs too**: Policies alone aren't enough in newer Supabase projects — public schema default grants are revoked. Must explicitly `GRANT SELECT/INSERT/UPDATE/DELETE ON table TO authenticated` and `GRANT SELECT ON table TO anon` for public reads.
- **Anon vs authenticated RLS**: Any table that should be readable without login needs both an `anon` policy AND a `GRANT SELECT ... TO anon`. Easy to miss.
- **Profile state doesn't auto-refresh**: `user` object from Supabase auth doesn't change when profile data changes. Any component that updates profile data must call its parent's state setter directly (not rely on a useEffect watching `user`).
- invite_code is generated client-side (8-char alphanumeric). Fine for MVP; switch to a DB default for scale.
- Magic link requires a real email address. Supabase blocks magic links to unverified addresses.
- `database.types.ts` is hand-maintained. After schema changes, update it or regenerate with `supabase gen types typescript`.
- Tailwind v4 uses `@import "tailwindcss"` — do not use v3 `@tailwind base/components/utilities` syntax.
- TypeScript `baseUrl` deprecated in TS 7.0; suppressed with `"ignoreDeprecations": "6.0"` in tsconfig.app.json.
- The Supabase join `.select('*, profiles(display_name)')` on outfit_posts requires `outfit_posts_user_id_fkey` FK to exist. Created by the migration via the inline `references` clause in `create table`.

## Deploy
- Target: Vercel (auto-deploys on push to main)
- GitHub: https://github.com/kjohns4/sharewear
- Env vars needed in both .env.local and Vercel project settings:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

## Security
- Secrets in .env.local only, never hardcoded. Covered by `*.local` in .gitignore.
- RLS enabled on all tables with explicit policies
- Role grants applied for anon and authenticated
- Input validated client-side before all Supabase writes (length bounds checked)
- Auth enforced in RLS, not only in UI
- No `any` types in TypeScript
- npm audit: 0 vulnerabilities

## Commit Conventions
Conventional Commits: `<type>(scope): <description>`
Types: feat, fix, refactor, chore, style, test, docs
One concern per commit — atomic, self-contained, reviewable in isolation.
Push after every 2-3 commits so the PR stays current.
