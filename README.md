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
- Planned: Paystack checkout

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
