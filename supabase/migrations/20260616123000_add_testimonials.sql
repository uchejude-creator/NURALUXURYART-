create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 160),
  location text,
  rating integer not null default 5 check (rating between 1 and 5),
  quote text not null check (char_length(trim(quote)) between 8 and 700),
  artwork_title text,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

create index if not exists testimonials_public_sort_idx
on public.testimonials (is_published, sort_order, created_at desc);

alter table public.testimonials enable row level security;

grant select on public.testimonials to anon, authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials"
on public.testimonials
for select
to anon, authenticated
using (is_published is true);

drop policy if exists "Admins can manage testimonials" on public.testimonials;
create policy "Admins can manage testimonials"
on public.testimonials
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

insert into public.testimonials (
  customer_name,
  location,
  rating,
  quote,
  artwork_title,
  is_published,
  sort_order
)
values
  (
    'Amara O.',
    'Ikoyi, Lagos',
    5,
    'The texture is even richer in person. It brought a quiet, gallery-like presence into our living room.',
    'Crowned Silence',
    true,
    10
  ),
  (
    'Tunde A.',
    'Victoria Island, Lagos',
    5,
    'NURALUXURYART helped us choose a piece that felt made for the space. The framing and finish were beautifully handled.',
    'Quiet Current',
    true,
    20
  ),
  (
    'Mina K.',
    'Abuja, Nigeria',
    5,
    'The artwork arrived carefully protected, and the colour depth completely changed the room.',
    'Golden Arc Reverie',
    true,
    30
  ),
  (
    'Chinonso E.',
    'Lekki, Lagos',
    5,
    'I wanted something bold but refined. The team guided me toward a piece that feels personal without overwhelming the interior.',
    'Obsidian Wave',
    true,
    40
  ),
  (
    'Hassan B.',
    'Lagos, Nigeria',
    5,
    'The hand-painted detail gives the piece a presence you cannot get from a regular print.',
    'Solitary Muse',
    true,
    50
  );

comment on table public.testimonials is 'Editable customer testimonials and ratings shown on the NURALUXURYART homepage.';
