create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'owner' check (role in ('owner', 'manager')),
  active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.artwork_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(trim(description)) between 8 and 500),
  image_src text not null,
  image_alt text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null check (char_length(trim(title)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  collection_id uuid references public.artwork_collections(id) on delete set null,
  medium text not null check (char_length(trim(medium)) between 2 and 220),
  description text not null check (char_length(trim(description)) between 8 and 1200),
  price integer check (price is null or price >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  availability text not null default 'available' check (availability in ('available', 'on-request', 'reserved', 'sold')),
  image_src text not null,
  image_alt text not null,
  materials text,
  dimensions text,
  origin text not null default 'Hand-painted in Turkey',
  framing text,
  care_notes text,
  is_featured boolean not null default false,
  is_signature boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 160),
  customer_email text not null check (customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  customer_phone text check (customer_phone is null or char_length(trim(customer_phone)) between 5 and 60),
  topic text not null check (char_length(trim(topic)) between 2 and 120),
  message text not null check (char_length(trim(message)) between 8 and 2000),
  status text not null default 'new' check (status in ('new', 'reviewed', 'replied', 'closed')),
  source text not null default 'website',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'website',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_artwork_collections_updated_at on public.artwork_collections;
create trigger set_artwork_collections_updated_at
before update on public.artwork_collections
for each row execute function public.set_updated_at();

drop trigger if exists set_artworks_updated_at on public.artworks;
create trigger set_artworks_updated_at
before update on public.artworks
for each row execute function public.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();

create index if not exists artwork_collections_active_sort_idx
  on public.artwork_collections (is_active, sort_order, title);

create index if not exists artworks_public_sort_idx
  on public.artworks (is_published, is_featured, sort_order, title);

create index if not exists artworks_collection_sort_idx
  on public.artworks (collection_id, is_published, sort_order);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create index if not exists checkout_requests_status_created_idx
  on public.checkout_requests (status, created_at desc);

alter table public.admin_users enable row level security;
alter table public.artwork_collections enable row level security;
alter table public.artworks enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.artwork_collections, public.artworks to anon, authenticated;
grant insert on public.contact_messages, public.newsletter_subscribers to anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.artwork_collections, public.artworks to authenticated;
grant select, update on public.checkout_requests, public.checkout_request_items to authenticated;
grant select, update, delete on public.contact_messages, public.newsletter_subscribers to authenticated;

drop policy if exists "Admin users can read own access row" on public.admin_users;
create policy "Admin users can read own access row"
on public.admin_users
for select
to authenticated
using (
  active is true
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Public can read active collections" on public.artwork_collections;
create policy "Public can read active collections"
on public.artwork_collections
for select
to anon, authenticated
using (is_active is true);

drop policy if exists "Admins can manage collections" on public.artwork_collections;
create policy "Admins can manage collections"
on public.artwork_collections
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Public can read published artworks" on public.artworks;
create policy "Public can read published artworks"
on public.artworks
for select
to anon, authenticated
using (is_published is true);

drop policy if exists "Admins can manage artworks" on public.artworks;
create policy "Admins can manage artworks"
on public.artworks
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Visitors can send contact messages" on public.contact_messages;
create policy "Visitors can send contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and char_length(trim(customer_name)) between 2 and 160
  and customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  and char_length(trim(topic)) between 2 and 120
  and char_length(trim(message)) between 8 and 2000
);

drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages"
on public.contact_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Visitors can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Visitors can subscribe to newsletter"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  status = 'active'
  and source = 'website'
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);

drop policy if exists "Admins can manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can manage newsletter subscribers"
on public.newsletter_subscribers
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can read checkout requests" on public.checkout_requests;
create policy "Admins can read checkout requests"
on public.checkout_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can update checkout requests" on public.checkout_requests;
create policy "Admins can update checkout requests"
on public.checkout_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "Admins can read checkout request items" on public.checkout_request_items;
create policy "Admins can read checkout request items"
on public.checkout_request_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

insert into public.admin_users (email, role, active)
values ('ozuligbouchennajude@gmail.com', 'owner', true)
on conflict (email) do update
set role = excluded.role,
    active = excluded.active;

insert into public.artwork_collections
  (title, slug, description, image_src, image_alt, sort_order, is_active)
values
  ('Acrylic Statements', 'acrylic-statements', 'Textured acrylic works with presence, depth, and quiet drama.', '/images/artworks/crowned-silence.jpg', 'Signature textured portrait artwork with black, silver, and gold detailing', 10, true),
  ('Abstract Editions', 'abstract-editions', 'Expressive hand-painted abstract pieces for refined spaces.', '/images/artworks/obsidian-wave.jpg', 'Gold and charcoal hand-painted abstract artwork with flowing lines', 20, true),
  ('Interior Gallery Pieces', 'interior-gallery-pieces', 'Large-format artworks curated for homes, hotels, and offices.', '/images/artworks/quiet-current.jpg', 'Framed blue and ivory artwork displayed on a studio easel', 30, true),
  ('Our Works', 'our-works', 'A view into previous projects, collector placements, and commissions.', '/images/artworks/studio-pair.jpg', 'Two finished artworks displayed together in a studio setting', 40, true)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    image_src = excluded.image_src,
    image_alt = excluded.image_alt,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into public.artworks
  (
    legacy_id, title, slug, collection_id, medium, description, price, currency,
    availability, image_src, image_alt, materials, dimensions, origin, framing,
    care_notes, is_featured, is_signature, is_published, sort_order
  )
select
  seed.legacy_id,
  seed.title,
  seed.slug,
  collections.id,
  seed.medium,
  seed.description,
  seed.price,
  'NGN',
  seed.availability,
  seed.image_src,
  seed.image_alt,
  seed.materials,
  seed.dimensions,
  seed.origin,
  seed.framing,
  seed.care_notes,
  seed.is_featured,
  seed.is_signature,
  seed.is_published,
  seed.sort_order
from (
  values
    ('golden-arc-reverie', 'Golden Arc Reverie', 'golden-arc-reverie', 'abstract-editions', 'Hand-painted mixed media artwork', 'A rhythmic abstract piece with layered black gestures and warm gold arcs, made to bring movement and quiet drama into refined interiors.', 185000, 'available', '/images/artworks/golden-arc-reverie.jpg', 'Hand-painted abstract artwork with black brushwork and golden arc details', 'Acrylic paint and mixed media texture on canvas', '120 x 180 cm', 'Hand-painted in Turkey', 'Framed and ready for interior placement', 'Dust gently with a dry microfiber cloth. Keep away from direct moisture and harsh sunlight.', true, false, true, 10),
    ('obsidian-wave', 'Obsidian Wave', 'obsidian-wave', 'abstract-editions', 'Textured Turkish abstract artwork', 'A sculptural gold-on-charcoal composition with flowing waves, designed for bold walls, lounges, and gallery-led spaces.', 210000, 'available', '/images/artworks/obsidian-wave.jpg', 'Gold and charcoal textured abstract artwork with flowing wave pattern', 'Textured acrylic and metallic detailing on canvas', '120 x 180 cm', 'Hand-painted in Turkey', 'Framed on request', 'Avoid abrasive cleaning. Use a soft dry cloth around raised texture.', true, false, true, 20),
    ('ivory-terrain', 'Ivory Terrain', 'ivory-terrain', 'interior-gallery-pieces', 'Hand-painted textured canvas', 'A calm neutral artwork with tactile surface detail, selected for interiors that need softness, balance, and understated presence.', 165000, 'available', '/images/artworks/ivory-terrain.jpg', 'Neutral hand-painted textured canvas artwork with ivory and charcoal detail', 'Textured acrylic paint on canvas', '100 x 150 cm', 'Hand-painted in Turkey', 'Minimal frame included', 'Keep in a dry interior space and handle by frame edges only.', true, false, true, 30),
    ('quiet-current', 'Quiet Current', 'quiet-current', 'acrylic-statements', 'Framed hand-painted artwork', 'A serene composition of blue, ivory, and muted earth tones, ideal for collectors who prefer atmosphere over noise.', 150000, 'available', '/images/artworks/quiet-current.jpg', 'Framed hand-painted artwork with soft blue and ivory abstract movement', 'Acrylic paint on canvas with framed finish', '100 x 150 cm', 'Hand-painted in Turkey', 'Framed', 'Use a dry microfiber cloth. Do not spray cleaners directly on the artwork.', true, false, true, 40),
    ('solitary-muse', 'Solitary Muse', 'solitary-muse', 'our-works', 'Hand-painted portrait artwork', 'An elegant portrait with soft tonal restraint and emotional stillness, created for interiors that value intimacy and poise.', 240000, 'available', '/images/artworks/solitary-muse.jpg', 'Hand-painted portrait artwork of a solitary female muse in neutral tones', 'Acrylic paint and portrait detail on canvas', '100 x 150 cm', 'Hand-painted in Turkey', 'Framed', 'Avoid prolonged direct sun exposure to preserve tonal depth.', true, false, true, 50),
    ('ember-gaze', 'Ember Gaze', 'ember-gaze', 'our-works', 'Contemporary portrait artwork', 'A vivid portrait study with expressive color, close framing, and a confident editorial mood.', 175000, 'available', '/images/artworks/ember-gaze.jpg', 'Contemporary portrait artwork with expressive eye detail and rich color', 'Acrylic paint on canvas', '100 x 150 cm', 'Hand-painted in Turkey', 'Framed', 'Dust gently and avoid high-humidity walls.', true, false, true, 60),
    ('crowned-silence', 'Crowned Silence', 'crowned-silence', 'acrylic-statements', 'Signature hand-painted Turkish artwork', 'A commanding portrait built around a circular crown of black, silver, and antique gold. The textured surface gives the piece a ceremonial presence, balancing strength, mystery, and modern luxury.', 350000, 'available', '/images/artworks/crowned-silence.jpg', 'Signature hand-painted Turkish portrait artwork with black circular crown and gold center', 'Textured acrylic, metallic accents, and mixed media on canvas', '120 x 180 cm', 'Hand-painted in Turkey', 'Slim gold-and-black frame', 'Handle with two hands by the frame. Do not accept installation in damp areas.', false, true, true, 5)
) as seed(
  legacy_id, title, slug, collection_slug, medium, description, price, availability,
  image_src, image_alt, materials, dimensions, origin, framing, care_notes,
  is_featured, is_signature, is_published, sort_order
)
join public.artwork_collections collections
  on collections.slug = seed.collection_slug
on conflict (slug) do update
set legacy_id = excluded.legacy_id,
    title = excluded.title,
    collection_id = excluded.collection_id,
    medium = excluded.medium,
    description = excluded.description,
    price = excluded.price,
    currency = excluded.currency,
    availability = excluded.availability,
    image_src = excluded.image_src,
    image_alt = excluded.image_alt,
    materials = excluded.materials,
    dimensions = excluded.dimensions,
    origin = excluded.origin,
    framing = excluded.framing,
    care_notes = excluded.care_notes,
    is_featured = excluded.is_featured,
    is_signature = excluded.is_signature,
    is_published = excluded.is_published,
    sort_order = excluded.sort_order;

comment on table public.admin_users is 'Allowlisted emails that can access the NURALUXURYART admin panel.';
comment on table public.artwork_collections is 'Editable NURALUXURYART artwork collections shown on the storefront.';
comment on table public.artworks is 'Editable artwork catalog with prices, materials, availability, and media.';
comment on table public.contact_messages is 'Collector enquiries submitted from the contact page.';
comment on table public.newsletter_subscribers is 'Newsletter subscribers for artwork release and collector updates.';
