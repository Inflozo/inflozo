# Epic 2 Context: Accounts & Passkeys

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A user owns their account end to end: registers a passkey and signs in with it instead of waiting for an email, changes their email without a dead-end verification, ends every session everywhere in one action, and can leave — with a 14-day window to change their mind, their pre-Inflozo theme snapshots offered as downloads throughout it, and a purge on the deadline that keeps the GDPR promise rather than becoming indefinite retention. Exit: passkey sign-in round-trip on production; deletion cascade verified end to end on the real database.

## Stories

- Story 2.1: Register a passkey and sign in with it
- Story 2.2: See, rename and revoke my passkeys
- Story 2.3: Change my email address safely
- Story 2.4: End every session everywhere
- Story 2.5: Ask to delete my account, and be able to change my mind
- Story 2.6: The purge, the cascade and the anonymisation

## Requirements & Constraints

- Passkeys register only from a signed-in session (magic link first), offered once by a post-onboarding nudge and always from Account → Security; afterwards sign-in offers passkey as primary, magic link as fallback. Each is auto-named from its authenticator AAGUID, renameable, revocable with immediate effect.
- Email change: an address already registered to another account is rejected upfront with "already in use" before any email is sent; otherwise verification goes to the **new** address and the change lands only on confirmation. This is the product's second transactional email — a Supabase Auth template, branded, through Resend SMTP.
- Sessions persist 30 days rolling; sign-out-everywhere invalidates every session including the current one.
- Deletion: typed confirm opens a 14-day soft-delete window; the confirmation email states the deadline; Dodo auto-renew stops immediately and entitlements hold until the purge; every retained snapshot is listed with its site and offered as a download at deletion time, in the email and throughout the window. Signing in during the window offers one-click Restore, which cancels the purge, offers resume of auto-renew at the same plan and price, and says plainly if the paid period ended meanwhile (restore then lands on Free under the over-limit rules).
- The purge proceeds on the deadline whether or not snapshots were downloaded. **No reminder email** — nudges are forbidden product-wide.
- Security floor from Epic 1 stands: RLS on every table keyed to `auth.uid()`, no secret in `NEXT_PUBLIC_*`, per-session CSP with no `'unsafe-eval'`, zero axe-core violations at WCAG 2.1 AA, no analytics in the app.

## Technical Decisions

- **Supabase Auth basis, as executed 2026-08-20.** The client library carries a full WebAuthn surface (landed in `auth-js` 2.75.0, so the pinned 2.115.0 is a safe over-pin). On the live project, WebAuthn enrolment via the MFA factors endpoint answers 422 "not enabled" while the TOTP control answers 200, and auth settings report `passkeys_enabled: false` — a **project setting**, not a missing capability. The PRD calls the API **Beta, explicit opt-in**, and the opt-in is literal: `auth: { experimental: { passkey: true } }` on the server client, without which every `auth.passkey.*` method THROWS at call time rather than returning an error envelope (executed 2026-09-06; `server-wiring.test.ts` pins the line). **2.1 executed the round trip on production and it holds**: register from a signed-in session, then a full passwordless assertion — the API serves primary sign-in, not only a second factor. Registration and authentication run through the **two-step** `auth.passkey.start*`/`verify*` methods in server actions, never the one-call `signInWithPasskey()`/`registerPasskey()` helpers, which would put a Supabase client in the browser.
- **Two switches, both read server-side per request.** Inflozo's `feature_flags.passkeys` row **and** Supabase's `passkeys_enabled`; if they disagree the user is offered a flow the platform refuses. The flag is a **database row, never an environment variable** — a Vercel env-var change applies only to new deployments, and flipping without a redeploy is the point. Seeded off; 2.1 turns it on.
- **The flag reader is `apps/web/lib/flags.ts` and DW-12 is closed (Story 2.1, 2026-09-06).** `feature_flags` is granted to `service_role` only, RLS on with no policy, so the reader is `supabaseAdmin()` in `apps/web/lib/supabase/server.ts` — one cookie-less service-role client, built lazily and once, holding `SUPABASE_SECRET_KEY`, **imported by `lib/flags.ts` and by nothing else** (`server-wiring.test.ts` enforces that list; a second caller edits it deliberately or the gate goes red). The `security definer` function was the other candidate and lost: a migration plus a SCHEMA.sql change plus an RLS-TEST assertion plus a gate run, for one boolean. `passkeysEnabled()` reads BOTH switches per request, `cache()`d, fail-closed with a 3s timeout on each; the pure combinator and the two wire-shape mappings are `lib/flags-rule.ts` under `node --test`. **A later flag reuses this reader — do not build a second one.** Both switches are ON in production since 2.1's Deploy run; `passkeys` is the kill switch and flipping the row to `false` in psql removes the whole module with no redeploy.
- **What Epic 1 already built for auth:** one cookie-backed server Supabase client (no browser client); the 30-day lifetime applied in the app's own cookie writer because the library's `maxAge` option is silently inert (DW-13 — never reintroduce it); `getUser()` as the only guard; the magic-link action, confirm route and authenticated route group; a script that pushes and reads back every Auth setting including templates (the email-change template and subject belong there); the account menu's Billing & plan row as the entry to S12.
- **Passkey names are the platform's.** `passkey_labels` was built on the belief that Supabase carried no user-editable name; the installed `@supabase/auth-js` 2.115.0 carries `friendly_name` on every passkey and a `PATCH /passkeys/{id}` to set it (read 2026-09-06, DW-30). 2.1 writes the AAGUID auto-name there and 2.2 writes the user's rename there, so **2.2 dropped `passkey_labels`** (`supabase/migrations/20260907120000_drop_passkey_labels.sql`; it never held a row) and revokes with `auth.passkey.delete()` — `DELETE /passkeys/{id}`. Nothing of ours stores a credential id.
- **Deletion is two columns on `profiles`** (`deleted_at`, `purge_after`, partial index on the pending set); snapshots carry their own `purge_after` set to the same deadline. Restore clears them.
- **The purge is a cron** under `apps/web/app/api/cron/{name}`, schedule in `vercel.json`, owning epic in its header — the v1 cron set is closed and this is E2's one. It deletes Storage objects across the three buckets **before** rows: a row cascade never removes bytes and Storage has no PITR — this is one of five sanctioned deletion paths and no story may add a sixth. Suggestions are **anonymised, not deleted**: `user_id` nulls, `anonymized_at` stamped, author shows as "Deleted user", any uploaded image removed; votes and notification rows are deleted. `auth.users` cascades handle most rows; the job must remove objects and anonymise first.
- **The snapshot download is a short-lived Storage signed URL** minted by a server route, never a function response body.
- **Mutation shape:** client → server action → service-role write; one zod schema per boundary; error envelope `{ code, message, detail?, action? }`. A migration is a new file, with `SCHEMA.sql`, `RLS-TEST.sql` and the gate's `rls.sql` copy updated in the same commit, and `bash supabase/tests/run-rls-gate.sh` green.

## UX & Interaction Patterns

- The export is the design authority. Security lives on `S12 Billing.dc.html` S12a: Email row ("Magic links land here", Change email); Passkeys list ("MacBook Pro — Touch ID · added …") with Add a passkey; Danger zone with Delete account. Delete Account is S12c — serious voice, "This cannot be undone", the typed confirm labelled `s12c-confirm`. Sign-in is S1a (magic link, "or", "Sign in with a passkey") and S1c (the same card at 40% behind the OS sheet; Inflozo draws nothing of the sheet).
- Irreversible confirms open with focus on the cancelling action; typed confirm only for account and project delete. A control that could never act is absent, not greyed; a greyed control shows its reason in the helper-caption slot.
- Widths 1440 / 834 / 390, Billing fully usable at 390; values read off the frame, never rounded; one coral focus ring everywhere.

## Cross-Story Dependencies

- 2.1 before 2.2; 2.1 owns the flag reader later flag consumers reuse. 2.5 before 2.6. 2.4 completes FR-A6, whose 30-day half Epic 1 shipped.
- **On Epic 12:** 2.5 must stop Dodo auto-renew and offer resume, but no billing adapter or subscription code exists yet — the spec states what it builds against or flags the gap under Questions for the owner rather than inventing a Dodo call.
- On Epics 3 and 7: nothing writes `site_snapshots` until deploy exists — 2.5 builds the listing against the table and proves it with a seeded row (R-82).
- Process rulings binding every story: commit and push after every phase as `Story 2.<n> - <Phase> - <one line>`; the doc gate before every commit; review and owner test on the real Supabase, Resend and Vercel (keys in `tools/probe/.env`); every UI story carries an owner's manual test on the production domains; owner questions in plain English with an example, numbered options and a (RECOMMENDED) mark.

## Since compiled — rulings landed by later stories (kept current by hand; the file says edit freely)

- **R-94 and R-95 (owner, Story 2.3's review, 2026-09-07)** — `reconcile-designs-decisions.md` §A19. R-94: a stale
  email-change link opened on a signed-in browser lands on `/account?email=stale` with a red note (the sign-in page
  bounces signed-in visitors before it says a word). R-95: the PREVIOUS address is told when an email change is
  confirmed — Supabase's own `mailer_notifications_email_changed_enabled`, plain and unbranded until E12 (DW-39) —
  and FR-P1 is now **seven** emails. Neither touches sessions, passkeys or deletion; nothing above changes for 2.4–2.6.
- **What 2.3 left for 2.4, and what 2.4 did with it (2026-09-07)** — DW-38 is CLOSED: `signedIn()` is one export in
  `lib/supabase/server.ts`, imported by both actions files and pinned by `server-wiring.test.ts`. DW-14 stays open:
  2.4 did not need `sessions_inactivity_timeout` (a global logout is core GoTrue, not the paid session feature), so
  the money question was never asked.
- **Executed by 2.4 (2026-09-07), no longer hypotheses** (`auth-js` 2.115.0, `GoTrueClient.js:3405-3445`):
  `signOut()`'s DEFAULT scope is `'global'`, so the avatar menu's Sign out from 1.4 had ended every session
  everywhere until 2.4 made it `{ scope: 'local' }` and gave the everywhere action `{ scope: 'global' }` — both
  explicit, both read out of the source by `signed-out.test.ts`. On the hosted GoTrue `POST /auth/v1/logout?scope=local`
  → 204 with the other session still 200; `?scope=global` → 204 with every session `403 session_not_found` at
  `GET /auth/v1/user` AT ONCE, not at the JWT's `exp`, and the bouncing response clears the cookies. Residuals on the
  ledger, both executed or read: DW-40 (a revoked token still satisfies PostgREST until `jwt_exp` = 60 minutes) and
  DW-41 (the client clears this device's cookies before returning most `/logout` failures — both sign-out actions).
