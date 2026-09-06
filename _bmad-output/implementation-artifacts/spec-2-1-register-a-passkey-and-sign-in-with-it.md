---
title: 'Story 2.1 — Register a passkey and sign in with it'
type: 'feature'
created: '2026-09-06'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

After this story you can add a passkey to your Inflozo account — the Touch ID, Face ID or Windows Hello
prompt your device already uses — and from then on sign in with one tap instead of waiting for an email.
You will see a new Account page (avatar → Account settings) with your email and a "Passkeys" card that
lists each passkey you add with the date you added it, a one-time yellow line on the dashboard offering it,
and a "Sign in with a passkey" button under the email box on the Sign In page. The whole thing sits behind
a switch in the database that is off today and is turned on only after the code is live, so it can be
turned off again in one line, with no redeploy, if Supabase's still-experimental passkey service misbehaves.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every sign-in waits on an email. FR-A2 asks for passkeys — magic link first, register from a
signed-in session, then passkey as the one-tap way in — behind a flag that flips without a redeploy. Today
that flag is a row nothing in the app can read (DW-12), S1a's "or" rule would sit over empty space if it were
on, and Supabase's own passkey switch is off (MEASUREMENTS §20, re-read 2026-09-06: `passkeys_enabled: false`).

**Approach:** Supabase Auth's passkey API through its **two-step server methods**, so the HTTP half of each
ceremony runs in server actions with the cookie-backed client and only `navigator.credentials` runs in the
browser; the Account page at `/account` built from S12a's right column with the Passkeys card; the button on
S1a and the 40% card of S1c while the OS prompt is up; a one-time notice Banner on the dashboard;
`passkeysEnabled()` reading **both** switches per request — our row through a secret-key client, and
Supabase's project setting.

## Boundaries & Constraints

**Always:**
- **Two switches, both read server-side per request:** `feature_flags.passkeys` (a row, never an env var)
  AND GoTrue's `/auth/v1/settings` `passkeys_enabled`. Either off → the module is absent everywhere: the
  button and divider, the Passkeys card, the nudge, and the four server actions refuse. **Fail closed:** any
  read error is "off", logged as a code without user content.
- **The secret-key client exists for one read** (`feature_flags`), is cookie-less, is never handed user
  input and never makes a user-scoped call. Everything else keeps the publishable-key client — 1.4's Keys
  rule stands for the rest of the app.
- **No browser Supabase client, no `NEXT_PUBLIC_*`.** The browser runs `navigator.credentials.create()` /
  `.get()` and serialises the answer; the challenge and the verify are server actions.
- **Frames (R-74):** `/account` from `S12 Billing.dc.html` S12a's right column (Email card, Passkeys card,
  the heading's own words); the button from `S1 Sign In.dc.html` S1a; S1c's card at 40% while the OS sheet
  is up, and nothing of the sheet drawn; the nudge **extrapolated** from the Kit's notice Banner, marigold
  ("nudges without blocking", EXPERIENCE.md), because no frame draws it. Values read off the frame, never
  rounded; tokens only, no hex in `.tsx`; the frame's own words.
- **Auto-name** = the authenticator's AAGUID → the community list's name, else `Passkey`; written as
  Supabase's own `friendly_name` in the same action as the verify. Nothing of ours stores an AAGUID.
- Registration only from a signed-in session; `getUser()` is the guard, as always.
- The passkey sign-in's session lands through the same `setAll` → `sessionCookie()` as the magic link:
  30 days, `HttpOnly`, `Secure`.
- The flag row is **off in every migration and seed**. ON is a Deploy-phase act recorded under
  `## Verification`, reversible by the same one line.
- UX-DR3 — absent, not greyed: Change email (2.3), rename and revoke (2.2), the plan column (E12) and the
  Danger zone (2.5) are not drawn.
- Zero axe-core violations at WCAG 2.1 AA on `/account` and `/sign-in`; keyboard-complete; `/account`
  fully usable at 390.
- Logs carry no user content; every key is named by its variable, never printed.

**Ask First:**
- Supabase answers **402** to `passkey_enabled` (a plan-gated field, as `sessions_inactivity_timeout`
  was): stop and put the plan question to the owner in R-83 shape.
- Any change to the export; any change to the RP ID once a passkey exists in production (a one-way door);
  a new token whose value occurs nowhere in the export.
- A migration. None is planned; if one becomes necessary, ask before writing it.

**Never:**
- Conditional-UI / autofill passkeys, cross-device QR flows, or `auth.mfa.*` — that is a different API
  (MFA factors) and MEASUREMENTS §20's 422 is its switch, not this one's.
- The `passkey_labels` table: unused by this story (DW-30 — the platform carries the name; 2.2 decides).
- `getSession()`. Editing the frozen migration. A device name or AAGUID stored anywhere of ours.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sign In, both switches on | signed out, GET `/sign-in` | S1a with the "or" divider and "Sign in with a passkey" (secondary 44, full width) | — |
| Either switch off | GET `/sign-in`, `/`, `/account` | No button, no divider, no Passkeys card, no nudge — 1.5's pages unchanged; the four actions return `{ error: { code: 'passkeys_off' } }` | — |
| Press the button, a passkey exists | `get()` → assertion | finish → session cookies (`Max-Age=2592000; HttpOnly; Secure`) → `redirect('/')`, no email sent | — |
| Press the button, none on this device | `NotAllowedError` after the OS sheet | card back from 40%; helper caption "No passkey on this device yet — sign in with a magic link, then add one under Account settings." | no session |
| Press the button, then cancel the sheet | `AbortError` / user cancel | card back from 40%, nothing said | — |
| Browser without WebAuthn | `browserSupportsWebAuthn()` false | caption "This browser can't use passkeys." | — |
| Verify refused (expired challenge, tampered credential) | 4xx from `/passkeys/authentication/verify` | caption "We couldn't sign you in with a passkey. Use a magic link instead." | code logged, no content |
| `/account`, no passkeys | signed in, both on | Email card (address, "Magic links land here"); Passkeys card with only "Add a passkey" | — |
| Add a passkey, success | `create()` → attestation | verify → `friendly_name` set → row "iCloud Keychain · added Sep 6, 2026" (date in mono); nudge marked done | — |
| Add a passkey, same authenticator again | server `excludeCredentials` | OS refuses / `InvalidStateError` → caption "This device already has a passkey for Inflozo." | — |
| Add a passkey, cancelled | `NotAllowedError` | nothing said; button live again | — |
| Add a passkey, session gone | `AuthSessionMissingError` | `redirect('/sign-in')` | — |
| The nudge | both on ∧ `user_metadata.passkey_nudge_done_at` absent | notice Banner above the grid: "Sign in faster next time — add a passkey." · **Add a passkey** → `/account` · **Not now** | — |
| Not now, or a first registration | action | `passkey_nudge_done_at` = now in `user_metadata`; never shown again on any device | — |
| `feature_flags` read fails / GoTrue settings unreachable | error | off; `console.error('flags: read failed', { code })` | — |
| `next build` (CI has no env) | prerender pass | nothing reads a key at module load; the reader runs per request only | — |

</frozen-after-approval>

## Code Map

- `apps/web/lib/supabase/server.ts` -- `supabaseServer()` gains `auth: { experimental: { passkey: true } }` — `@supabase/ssr` spreads `options.auth` (`dist/main/createServerClient.js:36`), and without it **every passkey method throws at call time** (`auth-js/dist/module/lib/helpers.js:450-453`). New `supabaseAdmin()`: `createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })` from `@supabase/supabase-js`, created lazily and once, no cookies; `env()` widens to the third name; the header comment ("nothing in the app reads it") is rewritten to say exactly what does
- `apps/web/lib/flags.ts` -- `passkeysEnabled()` becomes real and `cache()`d: `supabaseAdmin().from('feature_flags').select('enabled').eq('key', 'passkeys').maybeSingle()` AND `fetch(SUPABASE_URL + '/auth/v1/settings', { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, cache: 'no-store' })` → `passkeys_enabled` (MEASUREMENTS §20's two-switch rule; the endpoint answered `passkeys_enabled: false` on 2026-09-06). The combinator is pure and next door — `apps/web/lib/flags-rule.ts` `bothOn(row, settings)` — with `apps/web/flags-rule.test.ts`: off/off, on/off, off/on, on/on, a thrown read → false. **DW-12 closes here**
- `apps/web/lib/passkey-name.ts` (new, pure) -- `aaguidFromAuthData(bytes)` → the 16 bytes at offset 37 as a lowercase UUID (authData = rpIdHash 32 · flags 1 · signCount 4 · aaguid 16 — WebAuthn §6.1); `nameFor(aaguid)` → the list's name or `'Passkey'`. `apps/web/lib/passkey-aaguids.ts` (new, data) -- the AAGUID → name pairs transcribed from `github.com/passkeydeveloper/passkey-authenticator-aaguids` (`aaguid.json`, names only), the commit hash and read date in the header; never fetched at runtime. `apps/web/passkey-name.test.ts`: a synthetic 53-byte authData → its UUID; an unknown one → `Passkey`; every key a UUID, no duplicates
- `apps/web/app/(app)/app/sign-in/webauthn.ts` (new, client-safe) -- the ONE import site for `deserializeCredentialCreationOptions`, `deserializeCredentialRequestOptions`, `serializeCredentialCreationResponse`, `serializeCredentialRequestResponse` and `browserSupportsWebAuthn` from `@supabase/auth-js/dist/module/lib/webauthn` (`auth-js` has no `exports` map and its index does not re-export them; the serialisers prefer the native `toJSON()` and fall back, `webauthn.js:153-167`). `// ponytail: deep import, pinned; copy the ~40 lines if a version ever hides the path`
- `apps/web/package.json` -- `@supabase/auth-js` `2.115.0` as a **direct** dependency (pnpm resolves nothing transitive), the exact version `@supabase/supabase-js` 2.115.0 already brings (`pnpm-lock.yaml`); the spine's Stack row gains it in the same commit
- `apps/web/app/(app)/app/sign-in/actions.ts` -- `startPasskeySignIn()` → `auth.passkey.startAuthentication()` → `{ challengeId, options }`; `finishPasskeySignIn({ challengeId, credential })` → `auth.passkey.verifyAuthentication(…)` — it saves the session and fires `SIGNED_IN` (`GoTrueClient.js:5628-5631`), which `@supabase/ssr` applies through our `setAll` → `redirect('/')`. Failures → `{ error: { code: 'passkeys_off' | 'passkey_failed'; message } }`. Both refuse when `passkeysEnabled()` is false — an action reachable with the flag off is the flag not being a flag
- `apps/web/app/(app)/app/sign-in/passkey-button.tsx` (new, client) -- S1a's button (`Button` secondary 44, `w-full`, "Sign in with a passkey"); the ceremony: start → `deserializeCredentialRequestOptions` → `navigator.credentials.get()` → `serializeCredentialRequestResponse` → finish; the three captions from the matrix in P0-0's helper-caption slot; `onPending(bool)` up to the form
- `apps/web/app/(app)/app/sign-in/sign-in-form.tsx:280-295` -- the branch that today draws only the divider: the button joins it, under the divider as S1a draws it; while the ceremony runs the card takes S1c's 40% (`opacity-40`) and `aria-busy`, and is restored on return
- `apps/web/app/(app)/app/(authed)/account/page.tsx` (new, server) -- S12a's right column: `metadata.title` "Account · Inflozo", noindex as `sign-in/page.tsx:27`; `currentUser()`; `passkeysEnabled()`; `auth.passkey.list()` only when on; the heading is the frame's "Account & Billing" (the left column is E12's, its absence is UX-DR3's); one column at 390; the Email card with the envelope glyph, the address at 13px/500 and "Magic links land here" at 11px ink-soft; the Passkeys card below it
- `apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx` (new, client) -- the rows (laptop glyph · name 13px/500 · "added Aug 2, 2026" in mono 11px ink-soft · 9px/0 · the `#F1EDE7` hairline), and "Add a passkey" — 34px, radius 12, 13px/500, `border-line`, drawn inline from the tokens because the Kit's sizes are 44/36/32 and 34 is the frame's (1.4's precedent for S1's 44px field). The ceremony: start → `deserializeCredentialCreationOptions` → `create()` → `serializeCredentialCreationResponse` + `aaguidFromAuthData(response.getAuthenticatorData())` (method absent → `null`) → finish; "Waiting for your device…" on the button while pending
- `apps/web/app/(app)/app/(authed)/account/actions.ts` (new, `'use server'`) -- `startPasskeyRegistration()` → `{ challengeId, options }`; `finishPasskeyRegistration({ challengeId, credential, aaguid })` → `verifyRegistration` → `auth.passkey.update({ passkeyId: data.id, friendlyName: nameFor(aaguid) })` → `auth.updateUser({ data: { passkey_nudge_done_at } })` → `revalidatePath('/app/account')` (the internal path — `routing.ts:25`); `dismissPasskeyNudge()` → the same `updateUser` → `revalidatePath('/app')`. Each guarded by `passkeysEnabled()` and `currentUser()`; the result union `{ ok: true } | { error: { code, message } }` as `projects/actions.ts` shapes it
- `apps/web/app/(app)/app/(authed)/page.tsx` + `passkey-nudge.tsx` (new, client) -- `passkeysEnabled() && !user.user_metadata?.passkey_nudge_done_at` → `<Banner kind="notice">` above the grid: "Sign in faster next time — add a passkey." · `BannerLink` to `/account` · a "Not now" button posting `dismissPasskeyNudge`. Zero extra calls on the dashboard: the fact rides `getUser()`'s own answer
- `apps/web/components/kit/icons.tsx` -- S12a's own paths: `Mail` (rect 2 4 20 16 + `M22 7l-10 6L2 7`), `Laptop` (rect 2 4 20 13 + `M8 21h8M12 17v4`), and the "Add a passkey" glyph read off `S12 Billing.dc.html:103` at Dev
- `apps/web/app/globals.css` + `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` -- only if the card shadow `0 1px 2px rgba(28,27,26,.06)` and the row hairline `#F1EDE7` have no token yet (grep first): `--shadow-card` and `--color-line-soft` with their twins; `tokens.test.ts` requires each value in the export and both are (`S12 Billing.dc.html:75,87`)
- `tools/probe/configure-supabase-auth.py:49` -- `settings()` gains `passkey_enabled: True`, `webauthn_rp_id: 'inflozo.com'`, `webauthn_rp_origins: 'https://app.inflozo.com'`, `webauthn_rp_display_name: 'Inflozo'` — field names read from `api.supabase.com/api/v1-json` on 2026-09-06 (`UpdateAuthConfigBody`, all four; `passkey_enabled` boolean, the rest strings); `--check` asserts them; the docstring's field list follows
- `supabase/migrations/20260904120000_complete_schema.sql:127-136,716` -- read-only: the row is seeded `false` and stays so; `passkey_labels` rests on a premise the installed library falsifies (`auth-js/dist/module/lib/types.d.ts:2387-2390,2438-2442`: `friendly_name` on the passkey, `PATCH /passkeys/{id}`), so it is not used — DW-30
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` (`passkey_labels` comment) · `ARCHITECTURE-SPINE.md:437` (Stack row) -- the comment records the finding (a comment, so the RLS gate's shape diff is unmoved); the row gains the direct dependency
- `apps/web/app-routes.test.ts:33` -- discovers `account/page.tsx` inside `(authed)`; nothing to add
- Vercel (real) -- production already holds `SUPABASE_SECRET_KEY` (read 2026-09-05); nothing to add. CI's `check` job carries no env, so the reader must run per request only, never at import
- `MEASUREMENTS.md` §20 · `EXPERIENCE.md:103-105,131,296` · `epics.md:703-717` · spine Feature-flags row (`:425`) · `deferred-work.md` DW-12 -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/package.json` -- add `@supabase/auth-js` 2.115.0 (direct, pinned); `pnpm install`; the spine's Stack row -- the deep import needs a direct dependency under pnpm
- [ ] `apps/web/lib/supabase/server.ts` -- `experimental.passkey` on the server client; `supabaseAdmin()` lazily, once, cookie-less -- the ceremony's HTTP half and the one privileged read
- [ ] `apps/web/lib/flags-rule.ts` + `apps/web/flags-rule.test.ts` -- `bothOn()` and its five cases -- the rule where `node --test` reaches it
- [ ] `apps/web/lib/flags.ts` -- the two reads, `cache()`d, fail-closed; close DW-12 in `deferred-work.md` -- the flag becomes a flag
- [ ] `apps/web/lib/passkey-aaguids.ts` + `apps/web/lib/passkey-name.ts` + `apps/web/passkey-name.test.ts` -- the list (source and hash in the header), the parser, the fallback -- FR-A2's auto-name
- [ ] `apps/web/app/(app)/app/sign-in/webauthn.ts` -- the one import site -- keeps the deep path in one file
- [ ] `apps/web/app/(app)/app/sign-in/actions.ts` -- `startPasskeySignIn`, `finishPasskeySignIn` -- sign-in without a browser client
- [ ] `apps/web/app/(app)/app/sign-in/passkey-button.tsx` + `sign-in-form.tsx` -- the button in the existing branch, S1c's 40% while pending, the captions -- S1a and S1c
- [ ] `apps/web/app/(app)/app/(authed)/account/actions.ts` -- `startPasskeyRegistration`, `finishPasskeyRegistration`, `dismissPasskeyNudge` -- registration, naming, the once-only fact
- [ ] `apps/web/app/(app)/app/(authed)/account/page.tsx` + `passkeys-card.tsx` -- S12a's right column -- the Security surface
- [ ] `apps/web/components/kit/icons.tsx` (+ `globals.css`/`DESIGN.md` only if a value has no token) -- the frame's glyphs and, if needed, two tokens -- tokens only
- [ ] `apps/web/app/(app)/app/(authed)/page.tsx` + `passkey-nudge.tsx` -- the notice Banner -- the post-onboarding nudge, once
- [ ] `tools/probe/configure-supabase-auth.py` -- the four fields in `settings()`; run `--check` (expect the four to FAIL until Deploy applies them, and say so) -- Supabase's own switch, under the existing tool
- [ ] `SCHEMA.sql` (`passkey_labels` comment) -- record the finding beside the table -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result

**Acceptance Criteria:**
- Given both switches on and a signed-out visitor, when `/sign-in` renders, then S1a's "or" divider and "Sign in with a passkey" are drawn and **match the frame** (`S1 Sign In.dc.html` S1a: the secondary 44px button, full width, under the divider, the frame's words)
- Given a registered passkey, when the visitor presses the button and approves the OS prompt, then no email is sent, the session cookie is `Max-Age=2592000; HttpOnly; Secure`, and they land on `/` signed in
- Given a signed-in user on `/account` with both switches on, when the page renders at 1440 and at 390, then it **matches the frame** (`S12 Billing.dc.html` S12a's right column: the Email card and the Passkeys card, values off the frame, tokens only), with Change email, rename, revoke, the plan column and the Danger zone absent
- Given "Add a passkey" completes, when the card re-renders, then the new row shows the AAGUID's name (or `Passkey`) and "added <date>", and `auth.passkey.list()` carries the same `friendly_name`
- Given either switch off, when `/sign-in`, `/` and `/account` render, then nothing passkey-related is drawn and all four actions refuse with `passkeys_off`
- Given the nudge shown, when "Not now" is pressed or a first passkey is registered, then it never appears again on any device for that user
- Given the row turned off by one SQL line with no deploy, when the next request arrives, then the module is gone
- Given `pnpm check`, `pnpm build` and `node --test`, then all green, and axe-core reports zero violations on `/sign-in` (flag on) and `/account`

## Spec Change Log

## Design Notes

**Why the two-step methods and still no browser client.** `signInWithPasskey()` and `registerPasskey()`
are the library's one-call helpers, and both run the HTTP half in the same process as the browser half —
which is a browser client, the thing 1.4 kept out of the app. The lower-level `auth.passkey.*` methods
split exactly where the app already splits: `startAuthentication`/`verifyAuthentication` need no session
and `verifyAuthentication` saves one through storage (executed by reading `GoTrueClient.js:5582-5635`), so
in a server action the session lands in cookies through `setAll` and `sessionCookie()` as the magic link's
does; `startRegistration`/`verifyRegistration` read the session from the same cookies. The browser keeps
`navigator.credentials` and two serialisers.

**Why the secret-key client and not a `security definer` function.** DW-12 named both. The function is a
migration, a SCHEMA.sql change, an RLS-TEST assertion and the gate; the key is already in production, unread,
and the next two stories that need a privileged server read (2.6's purge, E3's Vault) need the same client.
It is fenced by construction: no cookies, one caller, one table.

**Why the RP ID is `inflozo.com` and the origin is `app.inflozo.com`.** A passkey is bound to its RP ID for
ever; the apex covers any future host under it, the origin list stays exact. The OS sheet will therefore
say "Sign in to inflozo.com" where S1c draws `inflozo.app` — the sheet is the OS's, not a surface of ours,
and the frame's word was illustrative. Localhost cannot run the ceremony under this RP ID, so the round trip
is proved on the deployed site (R-82 asks for that anyway).

**"Primary" within the frame.** FR-A2 says passkey primary, magic link fallback; S1a draws the email field
first and the passkey button under "or". The PRD decides what the surface does, the export what it is built
from: the button is offered on every sign-in the moment the flag is on and is the one-tap path; the email is
the path that still works when there is no passkey on the device. The layout is the frame's. Conditional UI
(the passkey offered inside the email field's autofill) is the upgrade if the owner ever wants the button
gone — `// ponytail:` beside the button says so.

**Why the name lives in Supabase and not in `passkey_labels`.** The schema's comment (2026-08-20) said the
platform "carries no user-editable label", and the installed 2.115.0 has `friendly_name` on every passkey
and a `PATCH` to set it. One store beats two that can disagree; the table stays for 2.2 to drop or repurpose
(DW-30). The AAGUID is read from `getAuthenticatorData()` — no CBOR parser for the attestation object — and a
browser without that method gets `Passkey`, which is also what a virtual authenticator's all-zero AAGUID gets.

**Why the once-only fact is in `user_metadata`.** "Offers it once" is per user, not per device, so a cookie
is wrong; a column is a migration for one timestamp. `auth.users.raw_user_meta_data` is the platform's own
per-user store, writable by the user's session, and it arrives inside `getUser()`, so the dashboard reads it
for free. `// ponytail: user_metadata; a profiles column when this ever needs querying`.

**Deploy order, because two switches and one deploy.** (1) the code ships with the row off — nothing is
visible; (2) `configure-supabase-auth.py --apply` turns Supabase's side on and reads it back; (3) the row goes
on; (4) `--check` and the round trip; (5) the owner's test. Off is step 3 with `false`, no deploy.

## Verification

Run by the Dev run on the real infrastructure (R-82); every key read into a command's environment from
`tools/probe/.env` and named here by its variable only.

**Commands:**
- `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH && pnpm check && pnpm build && (cd apps/web && node --test '*.test.ts')` -- expected: green; the new tests among them
- `python3 tools/probe/configure-supabase-auth.py --check` -- expected before Deploy: the four passkey fields FAIL and every 1.4 field PASSes (the control); after `--apply`: all PASS; `--expect passkey_enabled=false` then FAILs on exactly that field (negative control)
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY)=' tools/probe/.env | xargs) bash -c 'curl -s "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_PUBLISHABLE_KEY"'` -- expected: `passkeys_enabled` false before Deploy, true after
- `psql "$SUPABASE_DB_URL" -c "update public.feature_flags set enabled = true where key = 'passkeys'"` (`SUPABASE_DB_URL` from the env file, never echoed) -- the Deploy-phase flip; `false` is the kill switch; read back with `select key, enabled, updated_at from public.feature_flags`
- A fixture user through `generate_link` (`SUPABASE_SECRET_KEY`, 1.4's pattern) signed in on `https://app.inflozo.com`, then Playwright Chromium (`~/.cache/ms-playwright/chromium-1228`) with CDP `WebAuthn.enable` and `WebAuthn.addVirtualAuthenticator({ protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true })` -- expected: `/account` → Add a passkey → a row "Passkey · added <today>"; the nudge gone from `/`; Sign out; `/sign-in` → the button → `/` 200 signed in with `Max-Age=2592000; HttpOnly; Secure` and no email sent (`RESEND` log unchanged); `auth.passkey.list()` for the fixture → one item with `friendly_name`
- Controls: the row off → `curl -s https://app.inflozo.com/sign-in | grep -c 'Sign in with a passkey'` → `0`, the same page with it on → `1`; Supabase off and the row on → `0`; each action called with the flag off → `passkeys_off`
- axe-core 4.12.1 on `/sign-in` (flag on) and `/account` at 1440 and 390 -- expected: zero violations; a Tab walk reaches the button and "Add a passkey"
- The fixture user deleted afterwards; the live user count unchanged from before the run

**Manual checks (if no CLI):**
- The owner's own device is the named path (`iCloud Keychain`, `Google Password Manager`, `Windows Hello`…): the virtual authenticator proves only the `Passkey` fallback

## Owner's manual test

Everything below is on the live site, after the Deploy run has turned both switches on. Use your Mac first,
then your phone.

1. **URL:** https://app.inflozo.com/sign-in · **Screen:** Sign In · **Do:** just look, then sign in with
   the magic link as you always have · **See:** under "Send magic link" there is now a thin "or" line and a
   button "Sign in with a passkey". Don't press it yet — you have no passkey.
2. **URL:** https://app.inflozo.com/ · **Screen:** Dashboard · **Do:** look above your projects · **See:** one
   yellow line: "Sign in faster next time — add a passkey." with **Add a passkey** and **Not now**. Click
   **Add a passkey**.
3. **URL:** https://app.inflozo.com/account · **Screen:** Account & Billing · **Do:** press **Add a passkey**
   and approve your Mac's prompt (Touch ID, or Chrome offering to save a passkey) · **See:** the page has an
   **Email** card with your address and "Magic links land here", and a **Passkeys** card. After you approve,
   a row appears in it — a name like "iCloud Keychain" or "Google Password Manager" and "added Sep 6, 2026".
   Go back to the dashboard: the yellow line is gone.
4. **URL:** https://app.inflozo.com/sign-in · **Screen:** Sign In · **Do:** avatar → Sign out, then press
   **Sign in with a passkey** and approve the prompt · **See:** the dashboard, straight away, with no email
   sent. The green "You've been signed out." line still shows before you press.
5. **URL:** https://app.inflozo.com/sign-in on your phone · **Screen:** Sign In · **Do:** press **Sign in
   with a passkey** · **See:** if your Mac's passkey is in iCloud Keychain, your iPhone offers it and Face ID
   signs you in. If the phone has none, one sentence under the button: "No passkey on this device yet — sign
   in with a magic link, then add one under Account settings." — and the magic link works as before. Then
   add one on the phone from Account settings too; the Passkeys card lists both.
6. **Optional, say the word:** I turn the switch off with one line and no deploy. On your next page load the
   button, the card and the yellow line are all gone; one line turns them back on.
