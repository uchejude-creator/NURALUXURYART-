alter table public.artworks
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

alter table public.artworks
  drop constraint if exists artworks_gallery_images_is_array;

alter table public.artworks
  add constraint artworks_gallery_images_is_array
  check (jsonb_typeof(gallery_images) = 'array');

comment on column public.artworks.gallery_images is
  'Optional ordered detail images for artwork product galleries. First storefront image remains image_src; this stores additional views only.';
