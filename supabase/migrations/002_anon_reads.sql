-- Allow anonymous (unauthenticated) users to read events and outfit_posts.
-- The initial migration scoped read policies to `authenticated` only,
-- which blocks invite-link sharing with non-logged-in users.

-- events
drop policy if exists "events: authenticated users can read" on public.events;
create policy "events: anyone can read"
  on public.events for select
  using (true);
grant select on public.events to anon;

-- outfit_posts
drop policy if exists "outfit_posts: authenticated users can read" on public.outfit_posts;
create policy "outfit_posts: anyone can read"
  on public.outfit_posts for select
  using (true);
grant select on public.outfit_posts to anon;
