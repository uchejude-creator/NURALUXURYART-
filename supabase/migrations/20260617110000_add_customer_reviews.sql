create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  review_token uuid not null default gen_random_uuid() unique,
  checkout_request_id uuid references public.checkout_requests(id) on delete set null,
  checkout_request_item_id uuid references public.checkout_request_items(id) on delete set null,
  artwork_id uuid references public.artworks(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  location text,
  artwork_title text,
  rating integer check (rating between 1 and 5),
  quote text,
  status text not null default 'invited' check (status in ('invited', 'pending', 'approved', 'rejected')),
  sort_order integer not null default 100,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint customer_reviews_name_check check (char_length(trim(customer_name)) >= 2),
  constraint customer_reviews_email_check check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint customer_reviews_quote_check check (quote is null or char_length(trim(quote)) between 8 and 900),
  constraint customer_reviews_pending_content_check check (
    status in ('invited', 'rejected')
    or (rating is not null and quote is not null)
  )
);

drop trigger if exists set_customer_reviews_updated_at on public.customer_reviews;
create trigger set_customer_reviews_updated_at
before update on public.customer_reviews
for each row execute function public.set_updated_at();

create index if not exists customer_reviews_public_sort_idx
on public.customer_reviews (status, sort_order, approved_at desc)
where status = 'approved';

create index if not exists customer_reviews_token_idx
on public.customer_reviews (review_token);

create index if not exists customer_reviews_checkout_request_idx
on public.customer_reviews (checkout_request_id);

alter table public.customer_reviews enable row level security;

grant select on public.customer_reviews to anon, authenticated;
grant select, insert, update, delete on public.customer_reviews to authenticated;

drop policy if exists "Public can read approved customer reviews" on public.customer_reviews;
create policy "Public can read approved customer reviews"
on public.customer_reviews
for select
to anon, authenticated
using (
  status = 'approved'
  and rating is not null
  and quote is not null
);

drop policy if exists "Admins can read customer reviews" on public.customer_reviews;
create policy "Admins can read customer reviews"
on public.customer_reviews
for select
to authenticated
using (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can insert customer reviews" on public.customer_reviews;
create policy "Admins can insert customer reviews"
on public.customer_reviews
for insert
to authenticated
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can update customer reviews" on public.customer_reviews;
create policy "Admins can update customer reviews"
on public.customer_reviews
for update
to authenticated
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can delete customer reviews" on public.customer_reviews;
create policy "Admins can delete customer reviews"
on public.customer_reviews
for delete
to authenticated
using (public.is_nuraluxuryart_admin());

create or replace function public.get_review_invitation(p_token uuid)
returns table (
  review_token uuid,
  customer_name text,
  artwork_title text,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    review_token,
    customer_name,
    artwork_title,
    status
  from public.customer_reviews
  where review_token = p_token
    and status in ('invited', 'pending')
  limit 1;
$$;

create or replace function public.submit_customer_review(
  p_token uuid,
  p_rating integer,
  p_quote text,
  p_location text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
  clean_quote text := trim(coalesce(p_quote, ''));
  clean_location text := nullif(trim(coalesce(p_location, '')), '');
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.';
  end if;

  if char_length(clean_quote) < 8 or char_length(clean_quote) > 900 then
    raise exception 'Review must be between 8 and 900 characters.';
  end if;

  update public.customer_reviews
  set
    rating = p_rating,
    quote = clean_quote,
    location = coalesce(clean_location, location),
    status = 'pending',
    submitted_at = now(),
    updated_at = now()
  where review_token = p_token
    and status = 'invited';

  get diagnostics updated_count = row_count;

  return updated_count = 1;
end;
$$;

revoke execute on function public.get_review_invitation(uuid) from public, anon, authenticated;
revoke execute on function public.submit_customer_review(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.get_review_invitation(uuid) to anon, authenticated;
grant execute on function public.submit_customer_review(uuid, integer, text, text) to anon, authenticated;

comment on table public.customer_reviews is 'Private customer review invitations and moderated ratings for NURALUXURYART.';
comment on function public.get_review_invitation(uuid) is 'Returns safe invitation details for a private review token.';
comment on function public.submit_customer_review(uuid, integer, text, text) is 'Submits a token-bound customer review for admin approval.';
