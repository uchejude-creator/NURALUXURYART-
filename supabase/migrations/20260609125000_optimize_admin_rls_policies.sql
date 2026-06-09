create or replace function public.is_nuraluxuryart_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );
$$;

grant execute on function public.is_nuraluxuryart_admin() to authenticated;

drop policy if exists "Admin users can read own access row" on public.admin_users;
create policy "Admin users can read own access row"
on public.admin_users
for select
to authenticated
using (
  active is true
  and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

drop policy if exists "Public can read active collections" on public.artwork_collections;
create policy "Public can read active collections"
on public.artwork_collections
for select
to anon
using (is_active is true);

drop policy if exists "Admins can manage collections" on public.artwork_collections;
create policy "Admins can manage collections"
on public.artwork_collections
for all
to authenticated
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Public can read published artworks" on public.artworks;
create policy "Public can read published artworks"
on public.artworks
for select
to anon
using (is_published is true);

drop policy if exists "Admins can manage artworks" on public.artworks;
create policy "Admins can manage artworks"
on public.artworks
for all
to authenticated
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Visitors can send contact messages" on public.contact_messages;
create policy "Visitors can send contact messages"
on public.contact_messages
for insert
to anon
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
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Visitors can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Visitors can subscribe to newsletter"
on public.newsletter_subscribers
for insert
to anon
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
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can read checkout requests" on public.checkout_requests;
create policy "Admins can read checkout requests"
on public.checkout_requests
for select
to authenticated
using (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can update checkout requests" on public.checkout_requests;
create policy "Admins can update checkout requests"
on public.checkout_requests
for update
to authenticated
using (public.is_nuraluxuryart_admin())
with check (public.is_nuraluxuryart_admin());

drop policy if exists "Admins can read checkout request items" on public.checkout_request_items;
create policy "Admins can read checkout request items"
on public.checkout_request_items
for select
to authenticated
using (public.is_nuraluxuryart_admin());
