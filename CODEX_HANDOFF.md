# Codex Handoff For NURALUXURYART

This file lets a new Codex task continue the local Windows work from GitHub on a new Mac.

## Repository State

- GitHub repo: `https://github.com/uchejude-creator/NURALUXURYART-.git`
- Branch: `main`
- Latest pushed commit: `ff702b4 Add Paystack checkout integration`
- Local Windows workspace: `C:\Users\Administrator\Documents\NURALUXURYART\NURALUXURYART-`

## What Was Completed

- Customer account login was simplified to Google-only.
- Paystack checkout integration was coded server-side.
- Priced cart selections now create a Paystack transaction and redirect to Paystack.
- `Available on request` selections remain request-only for manual collector care follow-up.
- Paystack callback page was added at `/checkout/complete`.
- Paystack webhook endpoint was added at `/api/paystack/webhook`.
- Paystack payments are verified server-side before a checkout request is marked `paid`.
- Amount and currency mismatch protection was added.
- Admin orders now show Paystack payment status, reference, channel, gateway response, paid time, and verification time.
- Customer account order summaries now show Paystack status.
- Checkout/admin emails now include Paystack payment links and references when available.
- Supabase service-role helper was added for server-only payment updates.
- `.env.example` and README Paystack setup notes were added.
- Supabase migration was added at `supabase/migrations/20260722090000_add_paystack_checkout_fields.sql`.

## Verification Already Run

On Windows, these passed before the Paystack commit:

```bash
npm run lint
npm run build
```

Local pages also returned `200`:

- `http://127.0.0.1:3000/checkout`
- `http://127.0.0.1:3000/checkout/complete`

## Supabase And Vercel Status

- The Supabase SQL migration was run manually in Supabase SQL Editor and showed `Success. No rows returned`.
- `SUPABASE_SERVICE_ROLE_KEY` must be added to Vercel as a server-only sensitive env var.
- `PAYSTACK_SECRET_KEY` is still pending from Paystack registration and must be added to Vercel as a server-only sensitive env var.
- Paystack webhook URL to set in Paystack dashboard:

```text
https://nuraluxuryart.com/api/paystack/webhook
```

After Vercel env vars are added, redeploy the site so production picks them up.

## Mac Setup

Install on the Mac:

- ChatGPT/Codex app, signed into the same account
- Git or Xcode Command Line Tools
- Node.js LTS
- Vercel CLI

Clone and run:

```bash
git clone https://github.com/uchejude-creator/NURALUXURYART-.git
cd NURALUXURYART-
npm install
npm run dev
```

Pull Vercel env vars into local Mac development:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local --yes
```

When `vercel link` asks, choose the existing `nuraluxuryart` project.

## Local-Only Files Not Pushed

These existed on Windows but were intentionally not pushed as website code:

- `.vscode/`
- `NURALUXYART_PROJECT_BRIEF.md`
- `stitch_nuraluxyart_hero_concept/`

Use the SanDisk/Extreme SSD if these local design/reference files are needed on the Mac.

Do not copy `node_modules/`, `.next/`, or log files. The Mac will recreate them.

## Chat Continuation Note

The Windows Codex task itself may not appear in Mac Codex because Codex local tasks are separate from ChatGPT browser projects. The reliable continuation path is:

1. Open the cloned repo in Mac Codex.
2. Ask Codex to read `CODEX_HANDOFF.md`.
3. Continue from the pushed GitHub state.

Do not copy the entire `.codex` app data folder between computers unless OpenAI/Codex explicitly provides a supported migration flow. It can contain local settings, tokens, caches, and machine-specific paths.
