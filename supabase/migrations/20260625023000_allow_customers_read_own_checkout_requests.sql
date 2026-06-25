grant select on public.checkout_requests, public.checkout_request_items to authenticated;

drop policy if exists "Customers can read own checkout requests" on public.checkout_requests;
create policy "Customers can read own checkout requests"
on public.checkout_requests
for select
to authenticated
using (lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Customers can read own checkout request items" on public.checkout_request_items;
create policy "Customers can read own checkout request items"
on public.checkout_request_items
for select
to authenticated
using (
  exists (
    select 1
    from public.checkout_requests request
    where request.id = checkout_request_items.request_id
      and lower(request.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);
