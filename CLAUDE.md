# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

HealthFit — a personal (single-user), free-tier-hosted PWA for logging meals by photo (AI-estimated calories/macros via Claude vision), tracking body weight, and syncing Garmin Forerunner 55 activity data, with evolution charts. Not a multi-tenant product — there is no user table or signup flow, just a single shared-password gate.

Full architecture rationale and phased build plan: `C:\Users\jdelichotti\.claude\plans\drifting-churning-island.md`.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx drizzle-kit generate` — generate a SQL migration from `db/schema.ts`
- `npx drizzle-kit migrate` — apply migrations to `DATABASE_URL`
- `npx drizzle-kit studio` — inspect DB data in the browser

Node.js on this machine is a portable (non-admin) install at `%LOCALAPPDATA%\Programs\node-v24.19.0-win-x64`, added to the user PATH. If `node`/`npm` aren't found in a new shell, prepend that directory to `$env:Path` for the session.

## Architecture

- **Framework**: Next.js 16 (App Router). **This is a newer major version than typical training data assumes** — `middleware.ts` is deprecated, replaced by `proxy.ts` (export a `proxy` function, not `middleware`). See `@AGENTS.md` and `node_modules/next/dist/docs/` before using any App Router API that might have changed.
- **DB**: Postgres via Drizzle ORM. Schema lives in `db/schema.ts` — three tables, no `users` table (single user by design): `meals`, `weight_logs`, `garmin_daily_metrics`. All timestamps stored UTC; convert at the UI boundary.
- **Auth**: one shared password gate, not per-user accounts. `proxy.ts` checks a signed HTTP-only session cookie and redirects unauthenticated page requests to `/login`; each API route also independently verifies the session (proxy is not relied on alone, per Next.js's own guidance since Server Functions can bypass proxy matchers).
- **AI food recognition**: `lib/claude.ts` wraps the Anthropic API — server-side only, never call it from the client (API key must stay in env vars). Structured JSON output, not free-text parsing.
- **Garmin sync**: lives outside the Next.js app, in `garmin-sync/` (Python, `python-garminconnect`), run by a scheduled GitHub Actions workflow. It never talks to Postgres directly — it POSTs to `/api/garmin/ingest`, which is the single writer to `garmin_daily_metrics`.
- **Storage**: meal photos go to Vercel Blob via `lib/storage.ts`; compress/normalize-orientation client-side before upload (keeps both storage and Claude API token cost down).
- **PWA**: hand-written service worker at `public/sw.js` (network-first navigation with an `/offline` fallback, cache-first for static assets) registered by `components/register-sw.tsx`. `@serwist/next` was deliberately **not** used — its webpack `InjectManifest` plugin doesn't run under Turbopack, which this project uses for both `dev` and `build`; `@serwist/turbopack` exists but is experimental, so a plain hand-rolled worker was the more reliable choice. Camera capture uses the native `<input type="file" capture="environment">` picker rather than a custom `getUserMedia()` UI (more reliable on iOS Safari, which also has no install-prompt API — `components/install-prompt.tsx` shows manual instructions there instead).

## Cost note

Hosting (Vercel + GitHub Actions) is free-tier. The Anthropic API is the one pay-per-use component — a monthly spend limit should be set in the Anthropic Console.

## Deployment status (updated 2026-08-10)

- **Live**: https://healthfit-kohl.vercel.app — deployed and working (login, dashboard, meal capture+AI+save, meal edit/delete, weight entry+chart, PWA install all tested successfully on the owner's phone).
- **Repo**: https://github.com/jdelichotti/healthfit (public).
- **Hosting stack as actually provisioned**: Vercel project → **Neon** Postgres (Vercel's native "Postgres" storage is now a Neon marketplace integration, "Launch"/free plan; env var is plain `DATABASE_URL`, no custom prefix) + **Vercel Blob** (provisioned via the newer OIDC flow — env vars are `BLOB_STORE_ID` / `BLOB_WEBHOOK_PUBLIC_KEY`, **not** a static `BLOB_READ_WRITE_TOKEN`; `@vercel/blob`'s `put()` auto-detects this and uses the platform-injected `VERCEL_OIDC_TOKEN` at runtime — no code changes needed, this just works on Vercel but won't work from an unlinked local shell without `vercel env pull`).
- **Vercel Production env vars set**: `DATABASE_URL`, `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY` (auto-created by the integrations) plus manually-added `ANTHROPIC_API_KEY`, `SESSION_SECRET`, `GARMIN_INGEST_SECRET`, `APP_PASSWORD_HASH`.
- **DB migration**: `db/migrations/0000_loose_onslaught.sql` was applied by hand via the Neon Console SQL Editor (not `drizzle-kit migrate`, since no Vercel CLI/DB link was ever set up from this machine). **Any future schema change needs the same manual step** (generate migration locally with `drizzle-kit generate`, then paste the new SQL into Neon's SQL Editor) until CLI-based migration is wired up.
- **Garmin sync**: code is deployed; GitHub Actions secrets (`GARMIN_EMAIL`, `GARMIN_PASSWORD`, `APP_INGEST_URL` = `https://healthfit-kohl.vercel.app/api/garmin/ingest`, `GARMIN_INGEST_SECRET`) were being added as of the last session — confirm they're all set, then trigger the workflow manually (Actions tab → Garmin Sync → Run workflow) to verify it actually pulls data from the Forerunner 55 and lands a row in `garmin_daily_metrics`.
- **Still to verify**: a monthly spend limit was set on the Anthropic API key in the Anthropic Console (recommended, not yet confirmed).
