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

- **Supabase Auth basis, as executed 2026-08-20.** The client library carries a full WebAuthn surface (landed in `auth-js` 2.75.0, so the pinned 2.115.0 is a safe over-pin). On the live project, WebAuthn enrolment via the MFA factors endpoint answers 422 "not enabled" while the TOTP control answers 200, and auth settings report `passkeys_enabled: false` — a **project setting**, not a missing capability. The PRD calls the API **Beta, explicit opt-in**; a full enrolment-and-assertion round trip with a real authenticator is **unexecuted**. The sources establish presence, client support and off-by-default — nothing more. Whether the API serves passwordless *primary* sign-in or only a second factor is not stated anywhere; 2.1 establishes it by execution.
- **Two switches, both read server-side per request.** Inflozo's `feature_flags.passkeys` row **and** Supabase's `passkeys_enabled`; if they disagree the user is offered a flow the platform refuses. The flag is a **database row, never an environment variable** — a Vercel env-var change applies only to new deployments, and flipping without a redeploy is the point. Seeded off; 2.1 turns it on.
- **The flag reader does not exist yet (DW-12).** `feature_flags` is granted to `service_role` only, RLS on with no policy, and the app holds only the publishable key, so the current reader returns the seeded `false` without querying. 2.1 chooses between a server-side reader holding the secret key and a narrow `security definer` function granted to `authenticated` (smaller, keeps the secret out of the shell). The sign-in page already gates the passkey button and its "or" divider on the result — only the divider is built, so the button must be wired before the flag flips.
- **What Epic 1 already built for auth:** one cookie-backed server Supabase client (no browser client); the 30-day lifetime applied in the app's own cookie writer because the library's `maxAge` option is silently inert (DW-13 — never reintroduce it); `getUser()` as the only guard; the magic-link action, confirm route and authenticated route group; a script that pushes and reads back every Auth setting including templates (the email-change template and subject belong there); the account menu's Billing & plan row as the entry to S12.
- **Passkey names are the platform's.** `passkey_labels` was built on the belief that Supabase carried no user-editable name; the installed `@supabase/auth-js` 2.115.0 carries `friendly_name` on every passkey and a `PATCH /passkeys/{id}` to set it (read 2026-09-06, DW-30). 2.1 writes the AAGUID auto-name there; 2.2 decides the table's fate.
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
