alter table public.checkout_requests
  add column if not exists payment_provider text not null default 'none',
  add column if not exists payment_status text not null default 'not_started',
  add column if not exists payment_amount_subunit integer,
  add column if not exists payment_currency text,
  add column if not exists payment_verified_at timestamp with time zone,
  add column if not exists paid_at timestamp with time zone,
  add column if not exists paystack_reference text,
  add column if not exists paystack_access_code text,
  add column if not exists paystack_authorization_url text,
  add column if not exists paystack_transaction_id text,
  add column if not exists paystack_channel text,
  add column if not exists paystack_gateway_response text;

alter table public.checkout_requests
  drop constraint if exists checkout_requests_payment_provider_check,
  drop constraint if exists checkout_requests_payment_status_check,
  drop constraint if exists checkout_requests_payment_amount_subunit_check,
  drop constraint if exists checkout_requests_payment_currency_check,
  drop constraint if exists checkout_requests_paystack_reference_check;

alter table public.checkout_requests
  add constraint checkout_requests_payment_provider_check
    check (payment_provider in ('none', 'paystack')),
  add constraint checkout_requests_payment_status_check
    check (
      payment_status in (
        'not_started',
        'initialized',
        'ongoing',
        'pending',
        'processing',
        'queued',
        'abandoned',
        'failed',
        'reversed',
        'success'
      )
    ),
  add constraint checkout_requests_payment_amount_subunit_check
    check (payment_amount_subunit is null or payment_amount_subunit >= 0),
  add constraint checkout_requests_payment_currency_check
    check (payment_currency is null or payment_currency = 'NGN'),
  add constraint checkout_requests_paystack_reference_check
    check (
      paystack_reference is null
      or (
        char_length(paystack_reference) <= 120
        and paystack_reference ~ '^[A-Za-z0-9.\-=]+$'
      )
    );

create unique index if not exists checkout_requests_paystack_reference_unique_idx
  on public.checkout_requests (paystack_reference)
  where paystack_reference is not null;

create index if not exists checkout_requests_payment_status_created_idx
  on public.checkout_requests (payment_status, created_at desc);

comment on column public.checkout_requests.payment_provider is 'Payment processor used for the checkout request.';
comment on column public.checkout_requests.payment_status is 'Server-verified payment status from Paystack or request-only fallback.';
comment on column public.checkout_requests.payment_amount_subunit is 'Paystack amount in the currency subunit, such as kobo for NGN.';
comment on column public.checkout_requests.payment_currency is 'Currency returned by Paystack verification.';
comment on column public.checkout_requests.payment_verified_at is 'Time the app last verified this payment with Paystack.';
comment on column public.checkout_requests.paid_at is 'Time Paystack recorded a successful payment.';
comment on column public.checkout_requests.paystack_reference is 'Unique Paystack transaction reference for this checkout request.';
comment on column public.checkout_requests.paystack_access_code is 'Paystack access code returned during transaction initialization.';
comment on column public.checkout_requests.paystack_authorization_url is 'Paystack checkout URL returned during transaction initialization.';
comment on column public.checkout_requests.paystack_transaction_id is 'Paystack transaction ID stored as text to avoid integer-size issues.';
comment on column public.checkout_requests.paystack_channel is 'Payment channel returned by Paystack verification.';
comment on column public.checkout_requests.paystack_gateway_response is 'Gateway response returned by Paystack verification.';
