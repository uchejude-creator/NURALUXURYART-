# NURALUXURYART

Luxury art e-commerce website for NURALUXURYART, built with Next.js, TypeScript, and Tailwind CSS.

## Development

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```powershell
npm run build
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage
- Vercel production deployment
- Paystack checkout

## Paystack Checkout

Priced checkout selections now initialize Paystack from the server, redirect the
collector to Paystack, verify the callback at `/checkout/complete`, and receive
Paystack `charge.success` webhooks at `/api/paystack/webhook`.

Manual setup before deploying the payment flow:

1. In Supabase, apply:

```text
supabase/migrations/20260722090000_add_paystack_checkout_fields.sql
```

You can paste the SQL into the Supabase SQL Editor if the Supabase CLI is not
installed.

2. In Vercel Project Settings > Environment Variables, add:

```text
PAYSTACK_SECRET_KEY=your_paystack_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://nuraluxuryart.com
SITE_URL=https://nuraluxuryart.com
```

Keep `PAYSTACK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not
prefix either value with `NEXT_PUBLIC_`.

3. In Paystack Dashboard, set the webhook URL to:

```text
https://nuraluxuryart.com/api/paystack/webhook
```

4. Test with Paystack test mode first. After a full test order succeeds, replace
the test secret key with the live secret key in Vercel and redeploy.

Artwork selections with any item marked `Available on request` remain
request-only, so the team can confirm price, availability, and delivery before
taking payment.

## Supabase Auth Notes

Admin login uses Supabase email OTP links. The admin email must exist in
`public.admin_users` with `active = true`, and it must also have a Supabase
Auth user. The admin form does not create users automatically and returns a
generic success message so visitors cannot confirm which emails are admins.

Set `NEXT_PUBLIC_SITE_URL` or `SITE_URL` to the public site URL used for auth
callbacks. In production this should be the Vercel/domain URL, for example:

```powershell
NEXT_PUBLIC_SITE_URL=https://nuraluxuryart.vercel.app
```

Use the custom domain once Vercel DNS is connected:

```powershell
NEXT_PUBLIC_SITE_URL=https://nuraluxuryart.com
```

For safer email links, set the Supabase Magic Link email template URL to:

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Continue to admin</a>
```

The app sends `RedirectTo` as `/auth/confirm?next=/admin`, so the email opens a
confirmation page first. The token is only used after the admin clicks the
button on that page.

The app also includes a homepage fallback for Supabase links that land on `/`
with auth query or hash parameters. If Supabase falls back to the Site URL, the
client redirects the session into `/admin`.

In Supabase Auth URL Configuration, allow:

```text
http://localhost:3000/**
https://nuraluxuryart.com/**
https://nuraluxuryart.vercel.app/**
```

For branded auth delivery, add Resend as Supabase custom SMTP after the sending
domain is verified in Resend.

## Supabase Storage Notes

Artwork images live in the public `artwork-media` bucket. Active admins can
upload replacement images from `/admin/artworks`; catalog rows store the public
image URL in `image_src`.

## Brand Note

The correct company name is `NURALUXURYART`.
