-- Add optional image_url column to outfit_posts.
alter table public.outfit_posts
  add column if not exists image_url text;
