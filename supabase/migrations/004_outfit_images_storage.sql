-- Create the outfit-images storage bucket (public reads, authenticated writes).
insert into storage.buckets (id, name, public)
  values ('outfit-images', 'outfit-images', true)
  on conflict (id) do nothing;

-- Authenticated users can upload/update/delete only under their own uid/ prefix.
create policy "outfit-images: owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'outfit-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "outfit-images: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'outfit-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "outfit-images: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'outfit-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone (including anon) can read public objects in this bucket.
create policy "outfit-images: public read"
  on storage.objects for select
  using (bucket_id = 'outfit-images');
