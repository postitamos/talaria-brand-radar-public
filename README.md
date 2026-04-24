# Brand Radar Public

Portuguese-first public website for Brand Radar.

This repo is the dedicated public product surface for:

- public rankings
- public methodology
- free newsletter signup
- newsletter archive placeholder

It consumes the approved Brand Radar public rankings artifact and does not read
live Brand Radar truth tables at runtime.

## Product Boundary

- `talaria-brand-radar` remains the truth engine
- this repo consumes only imported scored artifacts
- the public website can show `publishable` and `limited`
- `blocked` rows never appear on the public site
- newsletter signup uses a separate Supabase project

## Main Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run test:run` - test suite
- `npm run verify:artifact` - validate the imported public rankings artifact boundary
- `npm run verify` - tests plus build
- `npm run import:rankings` - import the approved public rankings artifact into `public/data/`

## Artifact Import

The site reads:

- `public/data/public_brand_rankings.latest.json`

To refresh that file from Brand Radar:

```powershell
npm run import:rankings
```

Optional explicit source:

```powershell
node .\scripts\import-rankings-artifact.mjs --source ..\talaria-brand-radar\temp\public_scores\public_brand_rankings_2026-04-23.json
```

The import step writes:

- snapshot-specific JSON
- `public_brand_rankings.latest.json`
- `public_brand_rankings.metadata.json`

Before a real publish, validate the imported runtime artifact:

```powershell
npm run verify:artifact
```

## Signup Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_PUBLIC_SIGNUP_SUPABASE_URL`
- `VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY`
- optional `VITE_PUBLIC_SIGNUP_FUNCTION_NAME`

The public site uses only the separate signup project URL + anon key. It does
not use Brand Radar research credentials.

## Separate Supabase Signup Surface

This repo includes:

- `supabase/migrations/20260423234500_create_newsletter_signups.sql`
- `supabase/functions/newsletter-signup/index.ts`
- `supabase/config.toml`

The intended deployment model is:

- separate Supabase project for public signup
- one `newsletter_signups` table
- one `newsletter-signup` Edge Function

The function is public-facing and returns a generic success response for repeat
signups after dedupe by normalized email. `supabase/config.toml` fixes
`verify_jwt = false` for this public function.

## Current Public Routes

- `/` - landing page
- `/ranking` - public rankings
- `/metodologia` - methodology
- `/registo` - newsletter signup
- `/arquivo` - newsletter archive placeholder

## Deployment Readiness

- `vercel.json` is included for SPA rewrites and basic public headers
- `docs/DEPLOYMENT_RUNBOOK_PT_2026-04-24.md` documents the separate Supabase
  signup project setup and the static deployment flow

## Current Data Rules

- rankings are fully public
- signup does not gate rankings
- newsletter remains stricter than the site
- first public send remains a later tranche
