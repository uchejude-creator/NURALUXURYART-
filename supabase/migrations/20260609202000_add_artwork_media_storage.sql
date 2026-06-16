insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artwork-media',
  'artwork-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Temporary artwork media seed upload" on storage.objects;
drop policy if exists "Public artwork media read" on storage.objects;

drop policy if exists "Admins can upload artwork media" on storage.objects;
create policy "Admins can upload artwork media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'artwork-media'
  and exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(auth.jwt() ->> 'email')
      and admin.active = true
  )
);

drop policy if exists "Admins can update artwork media" on storage.objects;
create policy "Admins can update artwork media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'artwork-media'
  and exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(auth.jwt() ->> 'email')
      and admin.active = true
  )
)
with check (
  bucket_id = 'artwork-media'
  and exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(auth.jwt() ->> 'email')
      and admin.active = true
  )
);

drop policy if exists "Admins can delete artwork media" on storage.objects;
create policy "Admins can delete artwork media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'artwork-media'
  and exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(auth.jwt() ->> 'email')
      and admin.active = true
  )
);

insert into public.admin_users (email, role, active)
values ('nuraluxuryng@gmail.com', 'owner', true)
on conflict (email) do update
set role = excluded.role,
    active = excluded.active;

update public.artworks
set image_src = replace(
  image_src,
  '/images/artworks/',
  'https://xuhwuwdsamnisvxezobh.supabase.co/storage/v1/object/public/artwork-media/artworks/'
)
where image_src like '/images/artworks/%';

update public.artwork_collections
set image_src = replace(
  image_src,
  '/images/artworks/',
  'https://xuhwuwdsamnisvxezobh.supabase.co/storage/v1/object/public/artwork-media/artworks/'
)
where image_src like '/images/artworks/%';
