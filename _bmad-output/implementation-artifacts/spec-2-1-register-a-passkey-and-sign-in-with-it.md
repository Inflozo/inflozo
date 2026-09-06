---
title: 'Story 2.1 — Register a passkey and sign in with it'
type: 'feature'
created: '2026-09-06'
status: 'in-review'
review_loop_iteration: 1
baseline_commit: 'c2d6f365c86dd3e9c323847cccd2856b304da6b7'
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
- [x] `apps/web/package.json` -- add `@supabase/auth-js` 2.115.0 (direct, pinned); `pnpm install`; the spine's Stack row -- the deep import needs a direct dependency under pnpm
- [x] `apps/web/lib/supabase/server.ts` -- `experimental.passkey` on the server client; `supabaseAdmin()` lazily, once, cookie-less -- the ceremony's HTTP half and the one privileged read
- [x] `apps/web/lib/flags-rule.ts` + `apps/web/flags-rule.test.ts` -- `bothOn()` and its cases -- the rule where `node --test` reaches it
- [x] `apps/web/lib/flags.ts` -- the two reads, `cache()`d, fail-closed; close DW-12 in `deferred-work.md` -- the flag becomes a flag
- [x] `apps/web/lib/passkey-aaguids.ts` + `apps/web/lib/passkey-name.ts` + `apps/web/passkey-name.test.ts` -- the list (source and hash in the header), the parser, the fallback -- FR-A2's auto-name
- [x] `apps/web/app/(app)/app/sign-in/webauthn.ts` -- the one import site -- keeps the deep path in one file
- [x] `apps/web/app/(app)/app/sign-in/actions.ts` -- `startPasskeySignIn`, `finishPasskeySignIn` -- sign-in without a browser client
- [x] `apps/web/app/(app)/app/sign-in/passkey-button.tsx` + `sign-in-form.tsx` -- the button in the existing branch, S1c's 40% while pending, the captions -- S1a and S1c
- [x] `apps/web/app/(app)/app/(authed)/account/actions.ts` -- `startPasskeyRegistration`, `finishPasskeyRegistration`, `dismissPasskeyNudge` -- registration, naming, the once-only fact
- [x] `apps/web/app/(app)/app/(authed)/account/page.tsx` + `passkeys-card.tsx` -- S12a's right column -- the Security surface
- [x] `apps/web/components/kit/icons.tsx` (+ `globals.css`/`DESIGN.md` only if a value has no token) -- the frame's glyphs and, if needed, two tokens -- tokens only
- [x] `apps/web/app/(app)/app/(authed)/page.tsx` + `passkey-nudge.tsx` -- the notice Banner -- the post-onboarding nudge, once
- [x] `tools/probe/configure-supabase-auth.py` -- the four fields in `settings()`; run `--check` (expect the four to FAIL until Deploy applies them, and say so) -- Supabase's own switch, under the existing tool
- [x] `SCHEMA.sql` (`passkey_labels` comment) -- record the finding beside the table -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result

**Acceptance Criteria:**
- Given both switches on and a signed-out visitor, when `/sign-in` renders, then S1a's "or" divider and "Sign in with a passkey" are drawn and **match the frame** (`S1 Sign In.dc.html` S1a: the secondary 44px button, full width, under the divider, the frame's words)
- Given a registered passkey, when the visitor presses the button and approves the OS prompt, then no email is sent, the session cookie is `Max-Age=2592000; HttpOnly; Secure`, and they land on `/` signed in
- Given a signed-in user on `/account` with both switches on, when the page renders at 1440 and at 390, then it **matches the frame** (`S12 Billing.dc.html` S12a's right column: the Email card and the Passkeys card, values off the frame, tokens only), with Change email, rename, revoke, the plan column and the Danger zone absent
- Given "Add a passkey" completes, when the card re-renders, then the new row shows the AAGUID's name (or `Passkey`) and "added <date>", and `auth.passkey.list()` carries the same `friendly_name`
- Given either switch off, when `/sign-in`, `/` and `/account` render, then nothing passkey-related is drawn and all four actions refuse with `passkeys_off`
- Given the nudge shown, when "Not now" is pressed or a first passkey is registered, then it never appears again on any device for that user
- Given the row turned off by one SQL line with no deploy, when the next request arrives, then the module is gone
- Given `pnpm check`, `pnpm build` and `node --test`, then all green, and axe-core reports zero violations on `/sign-in` (flag on) and `/account`

### Review Findings

Code review of 2026-09-06 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance
Auditor, Real-infra verifier), the last against the live project. Every patch below is applied; the
run that proves them is `## Verification` → *The review's run*.

- [x] [Review][Decision] Cancelling the OS passkey sheet on Sign In shows "No passkey on this device yet…" — the frozen matrix says "nothing said", and the browser gives the same `NotAllowedError` for a cancel and for "no passkey here", so the two cannot be told apart. **Ruled (owner, 2026-09-06): option 1, keep it as built** — the matrix's "nothing said" row is superseded by the ruling; nothing changed in code.
- [x] [Review][Decision] `/account` capped its cards at 720px, a value that occurs nowhere in the frame — the spec's own Ask First. **Ruled (owner, 2026-09-06): option 2, the frame's own width** — at desktop the column is `100% - 504px` (the 480px plan column and the 24px gap, `S12 Billing.dc.html:35`), full width below, so nothing moves when Epic 12's column lands [apps/web/app/(app)/app/(authed)/account/page.tsx:45].
- [x] [Review][Patch] A successful passkey sign-in showed the failure caption and restored the card before the dashboard arrived: a server action that `redirect`s REJECTS the awaited promise with a `NEXT_REDIRECT` error (Next 16.3.1, `server-action-reducer.js:241-262`, read) and the catch treated it as "no passkey" [apps/web/app/(app)/app/sign-in/passkey-button.tsx]
- [x] [Review][Patch] Errors that are not the OS sheet's answer (`SecurityError` from an unlisted origin, a `TypeError` from a malformed challenge, a rejected action) were reported as "no passkey on this device" on Sign In and swallowed silently on the card; each now gets one failure sentence and a name-only log line [passkey-button.tsx · account/passkeys-card.tsx]
- [x] [Review][Patch] A browser without WebAuthn showed its reason only after a press; the caption is up front and the control carries `aria-disabled` (UX-DR3: a greyed control shows its reason) [passkey-button.tsx · passkeys-card.tsx]
- [x] [Review][Patch] S1c dims the card's contents, not the card and its shadow, and a card at 40% still took clicks while the OS sheet was up; `[&>*]:opacity-40 pointer-events-none` [apps/web/app/(app)/app/sign-in/sign-in-form.tsx:131]
- [x] [Review][Patch] `verifyAuthentication` answering without a `session` (typed nullable) redirected to `/` with no cookie set — now `passkey_failed` [apps/web/app/(app)/app/sign-in/actions.ts:155]
- [x] [Review][Patch] `markNudgeDone` made a second `getUser()` and discarded its error, so a failed read would have been spread as nothing and the metadata written back as only the nudge key; it now takes the metadata `ready()` verified [apps/web/app/(app)/app/(authed)/account/actions.ts:139]
- [x] [Review][Patch] "Not now" hid the banner before the action answered and ignored a refusal, so a failed dismissal vanished and came back next visit unexplained [apps/web/app/(app)/app/(authed)/passkey-nudge.tsx:36]
- [x] [Review][Patch] Neither flag read had a timeout, so a hanging platform hung the sign-in page instead of failing closed; and the settings read bypassed `env()` (a missing key became a fetch to `undefined/auth/v1/settings`). `AbortSignal.timeout(3000)` on both, `env()` on both [apps/web/lib/flags.ts]
- [x] [Review][Patch] The two wire-shape mappings (`enabled`, `passkeys_enabled`) and the `list()` envelope were unexecuted and untested — a wrong field name is a reader that is off for ever and every off-switch control still passes. `rowEnabled`/`settingEnabled` in `flags-rule.ts` and `passkeyRows` in `passkey-name.ts`, under `node --test` with the literal shapes the live project answered [apps/web/lib/flags-rule.ts · apps/web/lib/passkey-name.ts · the two test files]
- [x] [Review][Patch] A failed `auth.passkey.list()` rendered the card empty — claiming no passkeys and offering "Add a passkey" to someone who has one; the card now says it could not load [apps/web/app/(app)/app/(authed)/account/page.tsx:70 · passkeys-card.tsx]
- [x] [Review][Patch] `nameFor` threw on a non-string `aaguid` from a hand-made POST after GoTrue had already accepted the registration (nudge unmarked, no revalidate); it takes `unknown` and falls back [apps/web/lib/passkey-name.ts:42]
- [x] [Review][Patch] Frame values: S1a's button label is 500 and the Kit's secondary is 600 (`font-medium`); the Email row's padding is 2px, not `py-px` [passkey-button.tsx · account/page.tsx:48]
- [x] [Review][Patch] The dashboard read both switches on every render even after the nudge was answered; the read is skipped once `nudgeDone` [apps/web/app/(app)/app/(authed)/page.tsx:61]
- [x] [Review][Patch] `aria-busy` on both ceremony buttons while the OS sheet is up, as the nudge's button already did [passkey-button.tsx · passkeys-card.tsx]
- [x] [Review][Patch] Wording that restated a count or a wrong fact: "the four server actions" (there are five) → "every passkey action"; DW-12's "exactly one caller" → "called only from `flags.ts`"; "five cases" → "its cases"; the test constant `ICLOUD` for an AAGUID the list names "Apple Passwords"; the owner's test said a Mac's passkey reads "iCloud Keychain" — the shipped list says "Apple Passwords" [flags.ts · deferred-work.md · this spec · passkey-name.test.ts]
- [x] [Review][Patch] `## Verification` now says the off-switch run proves fail-closed only — the on-switch is first exercised at Deploy — and that a `Secure` cookie cannot be walked over `http://localhost`, so the flag-on checks run on the deployed origin [this spec]
- [x] [Review][Defer] The four actions' `passkeys_off` refusal has no repeatable control — a stale tab could still verify an assertion after the row is flipped off and only a hand-run curl would notice [apps/web/app/(app)/app/sign-in/actions.ts:131] — deferred, a scripted probe is a tool with a catalogue row; DW-32
- [x] [Review][Defer] The named-AAGUID path (a passkey born "Apple Passwords") is observable only on the owner's device; a virtual authenticator reports the all-zero AAGUID [apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx:56] — deferred, needs one real `getAuthenticatorData()` buffer as a fixture, which only the owner's first registration can give; DW-32

Dismissed as noise (9): the hairline under the last passkey row (the frame draws it, `S12 Billing.dc.html:96`); "add a passkey" twice in the nudge (the frozen matrix's own words); `status` logged on `start*` and `code` on `verify*` (explained beside each); passkeys unusable on `localhost` and preview hosts (Design Notes already say so); `SUPABASE_SECRET_KEY` undocumented (server.ts's header and the Code Map's Vercel row); the migration's stale comment (the spec's Never: the frozen migration is not edited — SCHEMA.sql and DW-30 carry it); `flags.ts` logging `message` against the frozen `{ code }` (Change Log 5 is the record, and the query carries no user input); a click between hydration and the support check (now the one failure sentence); a zod schema at the action boundary (GoTrue verifies the credential; `aaguid` is guarded above).

## Spec Change Log

1. **The card shadow already had a token; only the hairline needed one.** The Code Map said add
   `--shadow-card` and `--color-line-soft` *only if* a grep found no token. `0 1px 2px
   rgba(28,27,26,.06)` is already `--shadow-sm` (globals.css:91), so the cards use `shadow-sm` and
   **no shadow token was added**. `#F1EDE7` had none, so `--color-line-soft` landed with its
   `DESIGN.md` twin and its row in the colour-roles table. One token, not two.

2. **The deep import became four wrappers, still in the one file.** `auth-js` types the ceremony as
   WebAuthn Level 3 (`AuthenticatorTransportFuture` carries `"cable"`; `PublicKeyCredential` carries
   the `parse*FromJSON` statics) and TypeScript's `lib.dom` does not, so `tsc` refused both
   `navigator.credentials` calls and both serialisers. Rather than four casts at four call sites,
   `webauthn.ts` — which exists to hold the deep import — now also holds the bridge:
   `creationOptions`, `requestOptions`, `registrationResponse`, `authenticationResponse`, and the
   types the two `'use server'` files need. Same one import site, one explanation instead of four.

3. **`NUDGE_DONE` moved to `account/nudge.ts`.** A `'use server'` module may export only async
   functions, so the key and its reader sit in a plain module beside the actions — the precedent
   `signed-out.ts` and `resend-timer.ts` set, for the same reason.

4. **`auth.passkey.list()`'s envelope is accepted either way.** The library TYPES it as a bare
   `PasskeyListItem[]`, and that is a claim about GoTrue's `GET /passkeys` that cannot be executed
   until Supabase's own switch is on — this story's Deploy phase. Two lines normalise an array or a
   `{ passkeys }` wrapper, so a wrapped response cannot render an empty card in silence (standing
   rule 1).

5. **`flags.ts` logs the platform's message as well as the code**, because the Dev run's fail-closed
   control proved `{ code }` alone was useless: PostgREST answers a bad key with `{ message, hint }`
   and no `code`, so a flag that had just failed closed logged `code: undefined` and nothing else.
   Safe by construction — that query carries no user input.

6. **The nudge's `user_metadata` is read and written back whole.** Whether GoTrue merges `data` or
   replaces it is an unexecuted claim about an external platform; the spread is correct under
   either, which is cheaper than proving which.

7. **Three propagations the Code Map did not list**, each because the story falsified a sentence
   that was true before it (standing rule 3): the spine's `@supabase/ssr` row said the cookie-backed
   client is "the ONLY Supabase client the app makes"; `projects/actions.ts` said "there is no
   service-role client in the app at all"; and the spine's Feature-flags row named no reader. All
   three now say what is true, and the Stack table gained the `@supabase/auth-js` row.

8. **`addedLabel()` joined `passkey-name.ts`.** S12a's second line is "added Aug 2, 2026" and needed
   a formatter that the server's render and the client's re-render cannot disagree about; it is
   `updatedLabel`'s idiom (fixed locale, `timeZone: 'UTC'`) and is under `node --test` with it.

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

Run by the Dev run on 2026-09-06, on the real infrastructure (R-82). Every key was read into a
command's environment from `tools/probe/.env` and is named here by its variable only; none was
printed, echoed or committed.

### The gate

- `pnpm check` (`eslint .` · `tsc --noEmit` on every package · `node --test`) — **green**, exit 0.
- `cd apps/web && node --test '*.test.ts'` — **90 pass, 0 fail**, including the two new files:
  `flags-rule.test.ts` (off/off, on/off, off/on, on/on, and a failed read in six shapes) and
  `passkey-name.test.ts` (the AAGUID at offset 37, a one-byte shift, no AT flag, a truncated
  buffer, the named / unknown / all-zero fallbacks, every key a unique lowercase UUID, and the
  row's date line).
- `pnpm build` **with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` unset**,
  which is how CI's `check` job runs — **green**; nothing reads a key at module load. `/app/account`
  is listed `ƒ` (server-rendered on demand), never prerendered.

### Supabase — the Management API (`SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`)

- `curl https://api.supabase.com/api/v1-json` — `UpdateAuthConfigBody` carries **`passkey_enabled`**
  (boolean) and **`webauthn_rp_id`**, **`webauthn_rp_origins`**, **`webauthn_rp_display_name`**
  (strings, nullable). The four names the tool now writes were read there, not assumed.
- `python3 tools/probe/configure-supabase-auth.py --check` — `GET 200`, then **17 PASS and 4 FAIL**.
  The 17 are every Story 1.4 field (`site_url`, `uri_allow_list`, `mailer_otp_exp = 900`, the five
  SMTP fields, both rate limits, both subjects, both 4394-char templates, the three booleans) —
  **that is the control, and it passed**. The 4 FAIL are exactly the new ones and exactly as the
  Tasks predicted: `passkey_enabled` live `False`, all three `webauthn_rp_*` live `None`. Applying
  them is the Deploy phase's act. `sessions_inactivity_timeout` still reports `----` (not on this
  plan), unchanged. **No 402 came back**, so the "Ask First" trigger for a plan-gated
  `passkey_enabled` did not fire on the read; the `PATCH` is Deploy's and could still meet one.

### Supabase — GoTrue (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`)

- `GET $SUPABASE_URL/auth/v1/settings` — **`passkeys_enabled: false`**, re-read at Dev and unchanged
  from MEASUREMENTS §20. This is the switch `lib/flags.ts` reads per request.

### Supabase — PostgREST, and DW-12's premise proved both ways

- `GET /rest/v1/feature_flags?select=enabled&key=eq.passkeys` with **`SUPABASE_SECRET_KEY`** —
  **HTTP 200, `[{"enabled":false}]`**. That is the exact query `passkeysEnabled()` makes.
- The same request with **`SUPABASE_PUBLISHABLE_KEY`** — **HTTP 401**, `42501 permission denied for
  table feature_flags`. **The negative control**: it proves the secret-key client is doing real work
  and that DW-12's premise — the app's own key cannot read that table — is still true today.
- `GET /rest/v1/feature_flags?select=key,enabled,updated_at` — both rows read rather than restated:
  `passkeys` **false**, `ghostpro_preview_probe` **false**.
- `PATCH /rest/v1/feature_flags` with `SUPABASE_SECRET_KEY` — **HTTP 403**, recorded because it
  matters at Deploy: the schema grants `service_role` **`select` only** (:1175), so the flip is the
  `psql "$SUPABASE_DB_URL"` statement below and **not** a PostgREST call. The spec already named
  psql; this is the reason it had to.

### The real production build, served against the real project

`next start` on the built app, with the three keys from `tools/probe/.env`:

- `/app/sign-in` — **HTTP 200**; `Sign in with a passkey` **0**, the `or` divider **0**,
  `Make something gorgeous` **1**. Both switches are off, so the module is absent and 1.5's page is
  untouched — the matrix's "either switch off" row, against the real project.
- `/app/account` **signed out** — **HTTP 307 → `/sign-in`**. The guard is where the file sits.
- **Fail-closed against a real 401:** the same build with `SUPABASE_SECRET_KEY` deliberately wrong.
  `/app/sign-in` still **HTTP 200**, the card still renders, the module still absent, and the server
  logged `flags: read failed { code: undefined, message: 'Invalid API key' }` — no user content, no
  key. **This run changed that log line:** PostgREST answers a bad key with `{ message, hint }` and
  **no `code` at all**, so `{ code }` alone printed `code: undefined` and said nothing about a flag
  that had just failed closed. The message is safe here by construction — the query carries no user
  input, one literal filter and one boolean column.

### A real signed-in session, and the session cookie

A fixture user (`story-2-1-fixture@inflozo.com`) through `POST /auth/v1/admin/generate_link` with
`SUPABASE_SECRET_KEY` — 1.4's pattern — its `hashed_token` redeemed at `/app/auth/confirm`:

- `confirm` — **HTTP 303 → `/`**, and the `Set-Cookie` it wrote was
  **`Max-Age=2592000; Secure; HttpOnly; SameSite=lax`** — FR-A6's 30 days, measured on the header
  rather than asserted.
- `/app/account` signed in — **HTTP 200**, the `Account & Billing` heading, the fixture's address and
  `Magic links land here` both present, and — the switches being off — the Passkeys card **absent**
  (`>Passkeys<` count **0**). `Change email` **0**, `Danger zone` **0**: UX-DR3 holds, each is
  another story's and absent rather than greyed.
- `/app` — the nudge **absent** (count **0**), because the flag is off.
- **The fixture user was deleted afterwards** (`DELETE /auth/v1/admin/users/{id}`, HTTP 200) and the
  live user count is **2 before and 2 after**, read both times through the Admin API.

### axe-core 4.12.1

Real Chromium (`~/.cache/ms-playwright/chromium-1228`) against that same running build, on the
`wcag2a · wcag2aa · wcag21a · wcag21aa` tag set:

| page | 1440 | 390 |
|---|---|---|
| `/app/sign-in` (signed out) | **0 violations** | **0 violations** |
| `/app/account` (signed in) | **0 violations** | **0 violations** |

Two harness corrections, both recorded because each produced a *convincing wrong answer* first. The
app's per-session CSP has no `'unsafe-inline'`, so `addScriptTag` is refused and axe goes in through
`addInitScript` — **the CSP working is why**. And a signed-in browser is redirected off `/sign-in`,
so the first run audited the **marketing** page by mistake and reported its missing `<title>` as
this story's; there are two browser contexts now, signed-out and signed-in. That `document-title`
finding on `/` belongs to the marketing page and to no story here.

A Tab walk of `/app/account` reaches the shell's links and the account chip and then wraps: with the
flag off the page has **no focusable control of its own**, which is correct, and is exactly why the
keyboard proof of "Add a passkey" is a flag-on check below.

Two things this off-switch run does NOT prove, said plainly for the Deploy runner (review,
2026-09-06): a reader that is wrong is indistinguishable from a reader that is off, so the
on-switch — the field names, the envelope, the button appearing — is first exercised by Deploy's
`grep -c … → 1`; the mappings are now under `node --test` with the literal shapes the live project
answered, which is the control this run can give. And the session cookie is `Secure`, so the
flag-on walk of `/account` cannot run over `http://localhost` with a cookie-jar client: it runs on
the deployed origin, or with hand-set cookies.

### What this run could not execute, and why

Three things need a switch this phase is not allowed to flip. They are the **Deploy** run's and the
**owner's test**, in the spec's own Deploy order:

1. `python3 tools/probe/configure-supabase-auth.py --apply`, then `--check` — expected: all 21 PASS.
   Then `--check --expect passkey_enabled=false` — expected: FAIL on exactly that field (the
   negative control).
2. `psql "$SUPABASE_DB_URL" -c "update public.feature_flags set enabled = true where key =
   'passkeys'"` (`SUPABASE_DB_URL` never echoed), read back with `select key, enabled, updated_at
   from public.feature_flags`. `false` is the kill switch — the same one line, no redeploy.
3. With both on: `curl -s https://app.inflozo.com/sign-in | grep -c 'Sign in with a passkey'` → `1`
   (it is `0` today, proved above); Supabase on with the row off → `0`; each action with the flag
   off → `passkeys_off`; the full round trip under a Playwright virtual authenticator
   (`WebAuthn.addVirtualAuthenticator`, `ctap2` · `internal` · resident key · user-verified) — add a
   passkey, the row reads `Passkey · added <today>`, the nudge gone, sign out, sign in with it, no
   email sent, `auth.passkey.list()` carrying the `friendly_name`; and axe plus a Tab walk on
   `/sign-in` and `/account` **with the flag on**, where the button and "Add a passkey" exist.

The virtual authenticator reports the all-zero AAGUID, so it proves the **`Passkey` fallback** only;
the named path (`Apple Passwords`, `Google Password Manager`, `Windows Hello`) is the owner's own
device, and that is step 3 of his manual test.

### The review's run (2026-09-06)

The review's Real-infra verifier re-executed every claim above that this phase may execute, on
the Dev commit, and each held with the same values — 17 PASS / 4 FAIL from `--check` (the 17 are
the control), `passkeys_enabled: false`, the `feature_flags` read 200 with `SUPABASE_SECRET_KEY`
and **401 `42501` with `SUPABASE_PUBLISHABLE_KEY`** (the negative control), the fixture user's
`Max-Age=2592000; Secure; HttpOnly` cookie, and the user count 2 before and 2 after. Vercel,
Resend, Dodo and the Ghost servers are not touched by this story and were not called. Four
Code-Map claims were read or executed in the installed sources: `experimental.passkey` is asserted
at the top of every `auth.passkey.*` method (executed: `list()` **threw** without it and returned
an `AuthSessionMissingError` envelope with it); `verifyAuthentication` → `_saveSession` →
`@supabase/ssr`'s `setAll`; the deep path exports the five names and resolves to the one pnpm
copy; `list()` passes GoTrue's body through unchanged, so the envelope is not settled by source.

After the patches, on the patched build (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY` read by name from `tools/probe/.env`; Node 24.18.1):

- `pnpm check` — **green**, exit 0; `cd apps/web && node --test '*.test.ts'` — **94 pass, 0 fail**
  (the four new: the row's field name, GoTrue's `passkeys_enabled` against the Management API's
  `passkey_enabled`, the list bare or wrapped, a non-string AAGUID).
- `pnpm build` with the three keys unset — **green**; `/app`, `/app/account`, `/app/sign-in` all `ƒ`.
- `next start` with the keys: `/app/sign-in` **200**, `Sign in with a passkey` **0**, `>or<` **0**,
  `Make something gorgeous` **1**; `/app/account` signed out **307 → `/sign-in`**; no `flags:` line
  logged — both reads answered, both `false`.
- The same with `SUPABASE_SECRET_KEY` deliberately wrong: the page unchanged, the module absent, and
  exactly `flags: read failed { code: undefined, message: 'Invalid API key' }` — fail-closed with the
  timeouts and `env()` in place.
- The same with `SUPABASE_URL` empty: **500**, `Error: SUPABASE_URL is not set` — the loud `env()`
  now reached by the settings read too, where `process.env` had made it a fetch to
  `undefined/auth/v1/settings`.
- One harness fault, recorded because it produced a convincing wrong answer first: a curl carrying
  `Host: app.inflozo.com` at `localhost` is answered **308** to the public domain by `proxy.ts`
  before any page renders. Curl `localhost` bare.
- Read, not asserted: Next 16.3.1's `server-action-reducer.js:241-262` — an action that redirects
  rejects the caller's promise with `NEXT_REDIRECT` and navigates on its own — which is the first
  patch's whole basis.

### The Deploy run (2026-09-06)

**App code:** the last app-code commit, `84d1eff5`, and HEAD, `3ebd41e4`, both built CI-green
(`gh actions/runs`, both `completed`/`success`) and both Vercel production deployments read
**READY** (`GET /v6/deployments?projectId=…`). `GET /v2/deployments/{id}/aliases` on the HEAD
deployment (`dpl_B7w3PTtzjeFBeLMXEWx3tqRfSYWe`) lists `app.inflozo.com` and `inflozo.com` as its
aliases; `curl -I https://app.inflozo.com/sign-in` and `https://inflozo.com` both **200**.
**Deployment: dpl_B7w3PTtzjeFBeLMXEWx3tqRfSYWe (https://app.inflozo.com, https://inflozo.com)**.

**Switch 1 — Supabase's own, `configure-supabase-auth.py` (`SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`):**
`--apply` → `PATCH 402` on the plan-gated `sessions_inactivity_timeout` alone (as anticipated —
not the passkey fields), retried without it, `PATCH 200`, 22 fields written. `--check` read back
**21 PASS**, including `passkey_enabled = True`, `webauthn_rp_id = 'inflozo.com'`,
`webauthn_rp_origins = 'https://app.inflozo.com'`, `webauthn_rp_display_name = 'Inflozo'`.
Negative control: `--check --expect passkey_enabled=false` → **1 FAILED**, and it is exactly
`passkey_enabled` — the tool tells a wrong value from a right one.

**Switch 2 — the row, over the pooler (`SUPABASE_DB_URL`'s direct host has no IPv4 route from this
machine; resolved instead through Supabase's transaction pooler, `aws-0-eu-central-1.pooler.supabase.com:6543`,
read from `GET /v1/projects/{ref}/config/database/pooler`, same password, `psql` via the official
`postgres:17` Docker image):** `update public.feature_flags set enabled = true where key =
'passkeys'` → `UPDATE 1`; read back `select key, enabled from public.feature_flags` →
`passkeys | t`. Both switches on.

**The flag-on round trip, against the real production site, both switches on:**
- `curl -s https://app.inflozo.com/sign-in | grep -c 'Sign in with a passkey'` → **1**; `>or<` → **1**
  (both were **0** in the Dev/Review runs with the switches off).
- A Playwright virtual authenticator (`WebAuthn.addVirtualAuthenticator`, `ctap2` · `internal` ·
  resident key · user-verified · automatic presence) against `https://app.inflozo.com`, driving a
  fixture user (`admin/generate_link` — a brand-new address returns `verification_type: 'signup'`,
  not `'magiclink'`, and the confirm route accepts either): redeem the link → signed in at `/`;
  `/account` → **Add a passkey** → the ceremony completes with no human present → the row appears
  (`Passkey · added …`, the all-zero AAGUID's fallback name, as the spec's own note predicts for a
  virtual authenticator) and the dashboard's nudge is gone; cookies cleared (a clean second
  session, not reuse of the first); `/sign-in` → **Sign in with a passkey** → the same virtual
  authenticator answers `get()` with no OS sheet a human would see → lands on `/` with a
  `sb-…-auth-token` cookie set and **no email sent**. The fixture user was deleted afterwards
  (`DELETE /auth/v1/admin/users/{id}`, HTTP 200); the live user count is **2 before and 2 after**.
- axe-core 4.12.1, same Chromium, **flag on**: `/sign-in` signed-out and `/account` signed-in
  (through the passkey session above), at 1440 and 390 — **0 violations** on all four.

This is the on-switch proof the Dev and Review runs said they could not give: the field names, the
envelope, and the button/card's actual appearance, executed rather than inferred from the
off-switch control.

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
   a row appears in it — a name like "Apple Passwords" (a Mac's own passkey store) or "Google Password
   Manager" and "added Sep 6, 2026".
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

## Questions for the owner

**1. When you open the passkey prompt on the Sign In page and then cancel it, the page says "No passkey on this device yet — sign in with a magic link, then add one under Account settings." Is that what you want?**

The story said a cancelled prompt should say nothing. It turns out the browser gives the website the
exact same answer for "the person cancelled" and for "this device has no passkey" — on purpose, so a
website cannot tell whether an account has a passkey. So the page cannot say nothing for one and
something for the other; it has to pick one behaviour for both.

*Example:* on your phone, with no passkey yet, you press **Sign in with a passkey** and Face ID appears
and finds nothing. Today the page says the sentence above, which tells you what to do next. If it said
nothing, you would be looking at the same page wondering whether the button worked.

1. **Keep it as built — one sentence for both cases, the one that names the way in that always works. (RECOMMENDED)** — nobody is left wondering, and someone who cancelled on purpose reads one harmless line.
2. **Say nothing in both cases** — quieter, but the person with no passkey gets no help at all.
3. **A neutral sentence for both** — e.g. "Nothing was signed in. Try again, or use a magic link." Same mechanism as option 1, different words.

**Ruled (owner, 2026-09-06): option 1 — "Keep it as built — one sentence for both cases, the one that
names the way in that always works."** Nothing changed in code; the matrix's "nothing said" row is
superseded by this ruling.

**2. On the Account page, how wide should the Email and Passkeys cards be on a big screen?**

The design draws this page with two columns: your plan and invoices on the left (that part comes with
the billing work, much later) and Email · Passkeys on the right, filling the room beside it. Right now
there is no left column, so the cards were capped at 720 pixels wide — a number the design never
uses, which the story's own rules say to ask you about.

*Example:* on a 1440-pixel-wide screen, the design's right column is about 870 pixels wide. Today's
page shows the cards at 720. When the plan column arrives, cards at 870 would not move; cards at 720
would.

1. **The design's own width — the cards take the room beside where the plan column will be, about 870 pixels on a wide screen. (RECOMMENDED)** — nothing shifts later, and it is what the design draws.
2. **Keep the 720-pixel cap** — a little narrower to read today; the cards widen when the plan column lands.

**Ruled (owner, 2026-09-06): option 2 — "The design's own width — the cards take the room beside where
the plan column will be, about 870 pixels on a wide screen."** Applied in the same review: at desktop the
column is `100% - 504px`, the frame's own 480px column plus its 24px gap; full width below desktop, where
the frame draws nothing and 390 is one column.
