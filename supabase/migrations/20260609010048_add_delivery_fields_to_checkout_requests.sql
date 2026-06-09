alter table public.checkout_requests
  add column if not exists delivery_preference text,
  add column if not exists delivery_country text,
  add column if not exists delivery_state text,
  add column if not exists delivery_city text,
  add column if not exists delivery_address text,
  add column if not exists delivery_landmark text;

alter table public.checkout_requests
  drop constraint if exists checkout_requests_delivery_preference_check,
  drop constraint if exists checkout_requests_delivery_country_check,
  drop constraint if exists checkout_requests_delivery_state_check,
  drop constraint if exists checkout_requests_delivery_city_check,
  drop constraint if exists checkout_requests_delivery_address_check,
  drop constraint if exists checkout_requests_delivery_landmark_check;

alter table public.checkout_requests
  add constraint checkout_requests_delivery_preference_check
    check (
      delivery_preference is null
      or delivery_preference in (
        'Lagos delivery',
        'Pickup or gallery consultation',
        'Outside Lagos delivery'
      )
    ),
  add constraint checkout_requests_delivery_country_check
    check (
      delivery_country is null
      or (
        char_length(trim(delivery_country)) >= 2
        and char_length(trim(delivery_country)) <= 120
      )
    ),
  add constraint checkout_requests_delivery_state_check
    check (
      delivery_state is null
      or (
        char_length(trim(delivery_state)) >= 2
        and char_length(trim(delivery_state)) <= 120
      )
    ),
  add constraint checkout_requests_delivery_city_check
    check (
      delivery_city is null
      or (
        char_length(trim(delivery_city)) >= 2
        and char_length(trim(delivery_city)) <= 160
      )
    ),
  add constraint checkout_requests_delivery_address_check
    check (
      delivery_address is null
      or (
        char_length(trim(delivery_address)) >= 8
        and char_length(trim(delivery_address)) <= 500
      )
    ),
  add constraint checkout_requests_delivery_landmark_check
    check (
      delivery_landmark is null
      or char_length(trim(delivery_landmark)) <= 220
    );

comment on column public.checkout_requests.delivery_preference is 'Collector delivery preference selected during checkout.';
comment on column public.checkout_requests.delivery_country is 'Delivery country collected before payment confirmation.';
comment on column public.checkout_requests.delivery_state is 'Delivery state collected before payment confirmation.';
comment on column public.checkout_requests.delivery_city is 'Delivery city or area collected before payment confirmation.';
comment on column public.checkout_requests.delivery_address is 'Full delivery address collected before payment confirmation.';
comment on column public.checkout_requests.delivery_landmark is 'Optional delivery landmark for artwork handling and delivery coordination.';

drop policy if exists "Allow valid website checkout request inserts" on public.checkout_requests;

create policy "Allow valid website checkout request inserts"
on public.checkout_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and currency = 'NGN'
  and item_count > 0
  and total_amount >= 0
  and char_length(trim(customer_name)) between 2 and 160
  and char_length(trim(customer_phone)) between 5 and 60
  and customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  and delivery_preference in (
    'Lagos delivery',
    'Pickup or gallery consultation',
    'Outside Lagos delivery'
  )
  and char_length(trim(delivery_country)) between 2 and 120
  and char_length(trim(delivery_state)) between 2 and 120
  and char_length(trim(delivery_city)) between 2 and 160
  and char_length(trim(delivery_address)) between 8 and 500
  and (
    delivery_landmark is null
    or char_length(trim(delivery_landmark)) <= 220
  )
);
