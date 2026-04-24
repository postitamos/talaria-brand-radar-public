# Brand Radar Public

Portuguese-first public website for Brand Radar.

This repo is the dedicated public product surface for:

- public rankings
- public methodology
- privacy and publication-boundary page
- free newsletter signup
- newsletter archive placeholder

It consumes the approved Brand Radar public rankings artifact and does not read
live Brand Radar truth tables at runtime.

## Product Boundary

- `talaria-brand-radar` remains the truth engine
- this repo consumes only imported scored artifacts
- the public website can show `publishable` and `limited`
- `blocked` rows never appear on the public site
- newsletter signup uses an isolated Supabase boundary and, in the current v1
  launch path, reuses the Brand Radar project through the shared-project
  fallback

## Main Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run test:run` - test suite
- `npm run verify:artifact` - validate the imported public rankings artifact boundary
- `npm run import:newsletter` - import the newsletter candidate artifact into `public/data/`
- `npm run verify:newsletter` - validate the imported newsletter candidate artifact boundary
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

The same repo also supports the manual editorial candidate import:

```powershell
npm run import:newsletter
npm run verify:newsletter
```

## Signup Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_PUBLIC_SIGNUP_SUPABASE_URL`
- `VITE_PUBLIC_SIGNUP_SUPABASE_ANON_KEY`
- optional `VITE_PUBLIC_SIGNUP_FUNCTION_NAME`
- optional `VITE_PUBLIC_BASE_PATH`
- optional `VITE_PUBLIC_SUPPORT_EMAIL`

The public site uses only the signup project URL + anon/publishable key for the
public Edge Function. It does not read Brand Radar research tables at runtime.
The current local launch path is wired against the shared Brand Radar project
fallback.

## Supabase Signup Surface

This repo includes:

- `supabase/migrations/20260423234500_create_newsletter_signups.sql`
- `supabase/functions/newsletter-signup/index.ts`
- `supabase/config.toml`

The intended deployment model is:

- preferred: separate Supabase project for public signup
- accepted v1 fallback: isolated signup table + Edge Function inside the Brand
  Radar Supabase project
- one `newsletter_signups` table
- one `newsletter-signup` Edge Function

The function is public-facing and returns a generic success response for repeat
signups after dedupe by normalized email. `supabase/config.toml` fixes
`verify_jwt = false` for this public function.

Validated v1 state on 2026-04-24:

- `public.newsletter_signups` exists on project `qukapngihsutopsycwec`
- `newsletter-signup` is deployed live on that same project
- valid signup, duplicate signup, and invalid-payload rejection were all
  smoke-tested successfully from this repo

## Newsletter Editorial Baseline

The public site does not send the newsletter yet, but this repo now imports the
current newsletter candidate artifact as a sibling editorial input.

Current boundary:

- rankings page consumes only `public_brand_rankings.latest.json`
- archive/editorial readiness can consume `newsletter_candidate_brands.latest.json`
- newsletter candidates remain `publishable` by default unless an explicit
  upstream `limited` override is present in the imported artifact

## Current Public Routes

- `/` - landing page
- `/ranking` - public rankings
- `/metodologia` - methodology
- `/privacidade` - privacy and publication boundary
- `/registo` - newsletter signup
- `/arquivo` - newsletter archive placeholder

## Deployment Readiness

- `.github/workflows/deploy-pages.yml` is included for GitHub Pages deployment
- `public/404.html` plus the SPA redirect logic in `index.html` keep clean routes
  working on GitHub Pages
- `VITE_PUBLIC_BASE_PATH` supports project-site base-path builds
- `VITE_PUBLIC_SUPPORT_EMAIL` lets the public surface expose a real support and
  privacy contact instead of hiding that boundary
- `vercel.json` remains available as a fallback static host config
- `docs/DEPLOYMENT_RUNBOOK_PT_2026-04-24.md` documents the shared-project
  fallback and the static deployment flow
- the preferred v1 host is now GitHub Pages, provided the repo is created and
  Pages can publish the workflow artifact

## Current Data Rules

- rankings are fully public
- signup does not gate rankings
- newsletter remains stricter than the site
- first public send remains a later tranche
