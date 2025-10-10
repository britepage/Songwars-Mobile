# Parity Gate: Mobile = Web (No Extra Features)

Purpose: Ensure the Ionic mobile app exactly matches the existing Nuxt web app. No new routes, no public sharing, no schema changes. The app must switch from the mobile branch to production by changing env values only.

## Routes (must match web)
- / (landing)
- /dashboard
- /my-songs
- /leaderboard
- /account
- /user/:username
- /sign-in
- /registration
- /reset-password
- /reset-password-email
- /preview (trial)
- /admin/flags

Confirm
- [ ] No `/preview/:songId` or other public song routes
- [ ] Deep links (OAuth/notifications) route to authenticated screens (e.g., /tabs/dashboard)

## Data & API
- [ ] Supabase URL/key only; no code changes when switching to prod
- [ ] Uses existing RPCs/tables/triggers/RLS; no migrations
- [ ] Storage buckets and paths identical to web

## Features
- [ ] Sign-in (email/password, OAuth) and sign-out
- [ ] Upload (with 30s clip selection preserved)
- [ ] Battle 30s clips, vote, roulette animations (functionally equivalent)
- [ ] Leaderboard display
- [ ] Account management (profile, avatar, deletion RPC)
- [ ] Admin flags page (same capabilities)
- [ ] Password reset email flow

## Audio
- [ ] Enforces single/dual player rules; no overlapping audio beyond battle
- [ ] 30-second auto-stop and cleanup parity

## Config / Env Swap
- [ ] `.env.mobile-dev` → branch URL/key
- [ ] `.env.mobile-prod` → production URL/key
- [ ] Build reads only from env; no hardcoded refs

## Security
- [ ] No service-role keys in app
- [ ] RLS enforced (verified via negative tests)
- [ ] No public song preview/share links

## Final Smoke (on prod env)
- [ ] Sign in → Dashboard
- [ ] Upload a song → Play clip → Appears in My Songs
- [ ] Start battle → Play both clips → Vote succeeds
- [ ] Leaderboard loads
- [ ] Edit profile + avatar
- [ ] Admin flags screen loads (admin user)
- [ ] Password reset completes
- [ ] Account deletion RPC works and signs out

If any box fails, fix or remove the change before launch. This app must be a drop-in client for the existing backend.

