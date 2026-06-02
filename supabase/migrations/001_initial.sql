-- ============================================================
-- shareWear initial schema
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: anyone can read"
  on public.profiles for select
  using (true);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------
-- events
-- ----------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  date        date,
  created_by  uuid not null references public.profiles(id) on delete cascade,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events: authenticated users can read"
  on public.events for select
  to authenticated
  using (true);

create policy "events: owner can insert"
  on public.events for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "events: owner can update"
  on public.events for update
  to authenticated
  using (auth.uid() = created_by);

create policy "events: owner can delete"
  on public.events for delete
  to authenticated
  using (auth.uid() = created_by);

-- ----------------------------------------------------------------
-- outfit_posts
-- ----------------------------------------------------------------
create table if not exists public.outfit_posts (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  description text not null check (char_length(description) between 2 and 500),
  created_at  timestamptz not null default now()
);

alter table public.outfit_posts enable row level security;

create policy "outfit_posts: authenticated users can read"
  on public.outfit_posts for select
  to authenticated
  using (true);

create policy "outfit_posts: owner can insert"
  on public.outfit_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "outfit_posts: owner can update"
  on public.outfit_posts for update
  to authenticated
  using (auth.uid() = user_id);

create policy "outfit_posts: owner can delete"
  on public.outfit_posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Role grants (RLS policies alone are not enough without these)
-- ----------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.outfit_posts to authenticated;

-- ----------------------------------------------------------------
-- Auto-create profile row on new user sign-up
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
