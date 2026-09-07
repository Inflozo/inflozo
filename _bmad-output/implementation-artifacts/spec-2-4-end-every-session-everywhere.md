---
title: 'Story 2.4 — End every session everywhere'
type: 'feature'
created: '2026-09-07'
status: 'in-progress'
baseline_commit: 'a26f42efdb21386b5c89e809954bb831cf0cb69b'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

After this story, if you lose a laptop or a phone that is signed in to Inflozo, one button on the
Account page signs you out of every device at once — including the one you are holding — so the lost
device is locked out the next time it tries to open anything. You will see a new **Sessions** card under
Passkeys with a **Sign out everywhere** button; it asks once, and then the sign-in page says "You've been
signed out on every device." The ordinary **Sign out** in your avatar menu now signs out *only that
device*, which is what it always should have done: until today it quietly signed you out everywhere,
so signing out on the laptop also threw you off the phone.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-A6 asks for two things — sessions that last 30 days rolling, and a sign-out-everywhere
action — and the product has neither half right. There is no everywhere action on `/account`; and the
avatar menu's Sign out from Story 1.4 calls `supabase.auth.signOut()` with no scope, whose default in
the installed `auth-js` 2.115.0 is **`'global'`** (`GoTrueClient.js:3405`, `POST /logout?scope=global`
at `GoTrueAdminApi.js:72`), so every ordinary sign-out has been ending every session everywhere, and
"ordinary sessions persist until then" is not true today.

**Approach:** A **Sessions** card on S12a, extrapolated from the Email card beside it (R-74), whose one
button opens a confirm and then calls Supabase's own `auth.signOut({ scope: 'global' })`; a distinct
sign-in sentence says it happened. The avatar menu's Sign out becomes `{ scope: 'local' }`, explicitly.
No table, no cron, no session store of ours: GoTrue owns the sessions, and a revoked one is refused on
its very next verifying call — `getUser()` answers `session_not_found`, the client clears the cookies
(`lib/fetch.js:82-86`, `GoTrueClient.js:2714-2718`) and the layout's guard sends that device to sign-in.
Every claim in this paragraph is a hypothesis until the harness executes it (standing rule: cite or
execute, never assert).

## Boundaries & Constraints

**Always:**
- The frame is `S12 Billing.dc.html` S12a. It draws no sessions surface, so the card is
  **extrapolated from the nearest drawn one — the Email card (`:74-82`)**: the same card shell (white,
  `line` border, radius 16, `shadow-sm`, 20/24 padding), the 13px/600 uppercase label, one row (16px
  glyph in ink-soft, 13px/500 title over 11px ink-soft caption) and the frame's own 30px button at the
  row's end (`:80`: `0 13px`, radius 10, 12px/500, surface fill, `line` border, `paper` on hover) — the
  exact classes `email-card.tsx` already draws. Label **Sessions**; glyph `Laptop`; title "Every device
  you're signed in on"; caption "Each stays signed in for 30 days from its last visit"; button
  **Sign out everywhere**. It sits between the Passkeys card and where 2.5's Danger zone will go, and
  it renders whether or not the passkey switches are on.
- The confirm has no frame and is extrapolated from where every dialog is — S12c through
  `components/kit/dialog.ts` in the Change-email dialog's shape (`email-card.tsx`): the sheet, the
  display title "Sign out everywhere?", one sentence — "Every device signed in to your account will be
  signed out, including this one. Sign in again wherever you need to." — then Cancel + primary
  **Sign out everywhere** at 36, opening with focus on Cancel (`openOnCancel`), closing on Escape and
  the backdrop (`closeOnBackdrop`). Untyped: the typed confirm is account and project delete only. The
  primary reads "Signing out…" while it runs (1.5's own word).
- **Both scopes are written explicitly and pinned by a test that reads the source.** The everywhere
  action calls `auth.signOut({ scope: 'global' })`; the avatar menu's `signOut` calls
  `auth.signOut({ scope: 'local' })`. The library's default is global, so an option dropped in a tidy-up
  silently makes ordinary Sign out everywhere again — the defect this story found.
- The landing is a URL hint on the existing contract: `signed-out.ts` gains a second VALUE on the
  same key — `/sign-in?signed-out=all` — with its own reader, and the sign-in card says "You've been
  signed out on every device." (`sign-in-form.tsx:251-253`'s success Banner, the other sentence). The
  two values never read as each other; `signed-out.test.ts` walks both round trips.
- The action guards on the session alone (`signedIn()`), never on the passkey flag; a session that
  ended between the render and the click is the sign-in page, not a sentence.
- A `/logout` that fails is SAID, never claimed: the dialog stays open with a `Banner kind="error"` —
  "We couldn't sign you out everywhere just now. Try again in a moment." — and nothing redirects.
- **DW-38 closes here**: `signedIn()` moves to one plain export in `lib/supabase/server.ts` beside
  `currentUser()`, and both copies (`account/actions.ts`, `projects/actions.ts:63-67`) import it.
- The harness runs against `app.inflozo.com` and the real Supabase (R-82); keys by variable name only.

**Ask First:**
- If the harness shows a JWT whose session was revoked still answering **200** at `GET /auth/v1/user`
  (i.e. GoTrue does not check the `session_id` claim on the hosted project), the approach above does
  not sign the other devices out until their token expires — stop, record the numbers, and put the
  choice to the owner (shorter `jwt_exp` versus a session table of ours) rather than picking one.
- Any change to the ordinary Sign out beyond its scope — its sentence, its landing, its failure
  branch — is 1.4/1.5's and the owner's; this story changes the scope only.

**Never:**
- No table, migration, cron or session list of ours; no admin/service-role call — the user's own
  cookie-backed client ends the user's own sessions (`supabaseAdmin()`'s caller list is unchanged).
- No telling the OTHER devices what happened: the guard cannot tell a revoked session from an absent
  one (both surface as a missing session), and no frame draws it. They land on `/sign-in` with nothing
  said; the owner's manual test says so in words.
- No `sessions_inactivity_timeout` (DW-14 stays open, one line appended: 2.4 did not need it — a
  global logout is core GoTrue, not the paid session feature).
- No `others` scope, no "sign out other devices but keep this one": the AC says including the current
  one.
- No confirm on the ordinary Sign out (the owner's question 6, Story 1.5).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ordinary Sign out, this device only | avatar menu → Sign out on device A; device B signed in | A → `/sign-in?signed-out=1` "You've been signed out."; **B stays signed in** — its `GET /user` still 200, its `/account` still renders (the control) | unchanged from 1.5 |
| Open the confirm | Sign out everywhere pressed | dialog opens, focus on Cancel; Cancel / Escape / backdrop close it, nothing sent | N/A |
| Confirmed, happy path | primary pressed on A; B signed in | `POST /logout?scope=global` 2xx; A's cookies deleted (`maxAge: 0` through `sessionCookie`); A → `/sign-in?signed-out=all` "You've been signed out on every device."; A's former token and B's token both answer `session_not_found` at `GET /user`; B's next page load → `/sign-in`, its cookies cleared by the proxy's `getUser()` | N/A |
| GoTrue unreachable or a 5xx | primary pressed | dialog stays open, red Banner, no redirect, nothing claimed — the other devices were NOT signed out and the sentence says so; what the library did to THIS device's cookies on the way is its own (DW-41) | logged by status and code |
| Double submit | Enter held / second click while running | one request (`once`), "Signing out…" | N/A |
| Session ended before the click | `signedIn()` finds no user | `/sign-in` (the guard) | N/A |
| Passkey switches off | `feature_flags.passkeys` false | the Sessions card is still there and still works | N/A |
| 390 | narrow viewport | the card full width, the button at the row's end, nothing clipped, zero axe violations | N/A |
| Sign in after everywhere | a fresh magic link for A | signs in normally — a global sign-out revokes sessions, never the account | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/sign-in/signed-out.ts` -- ADD `SIGNED_OUT_EVERYWHERE_VALUE = 'all'`,
  `SIGNED_OUT_EVERYWHERE_PATH` (`/sign-in?signed-out=all`, composed from the key and the value exactly as
  `SIGNED_OUT_PATH` is) and `isSignedOutEverywhere(value)`; `isSignedOut` stays `=== '1'` so the two values
  are disjoint by construction. The value-and-reader shape is this file's own (its head comment says why)
- `apps/web/signed-out.test.ts` -- ADD the everywhere round trip through its reader; the two values never
  reading as each other; and a SOURCE-READING test (`email-change-rule.test.ts`'s pattern: `readFileSync`
  the action file) that `sign-in/actions.ts`'s `signOut` contains `scope: 'local'` and the everywhere
  action contains `scope: 'global'` — derived from the files, never restated
- `apps/web/app/(app)/app/sign-in/actions.ts:93-98` -- `signOut()` becomes
  `supabase.auth.signOut({ scope: 'local' })` with a comment citing `GoTrueClient.js:3405` (the default is
  global) and this story; nothing else in it moves. Its `:82-84` comment about a failed sign-out keeping the
  cookies is 1.4's claim and stays — see DW-41
- `apps/web/app/(app)/app/(authed)/account/actions.ts` -- ADD `signOutEverywhere(prev, formData)` in
  `useActionState`'s shape (`changeEmail`'s twin): `await signedIn()`; try `supabase.auth.signOut({ scope:
  'global' })`; on `error` → `console.error('sign-out everywhere: failed', { status, code })` and
  `fail('sign_out_failed')`; on success `redirect(SIGNED_OUT_EVERYWHERE_PATH)` (a thrown redirect, as
  `signOut` does). `Code` widens by `'sign_out_failed'`, `MESSAGES` gains its sentence. DELETE the local
  `signedIn()` and import it (DW-38); `ready()` keeps calling it
- `apps/web/lib/supabase/server.ts` -- ADD `export async function signedIn()` beside `currentUser()`: the
  three lines, `redirect('/sign-in')` from `next/navigation`. A plain module, so both actions files import
  one function (DW-38's own prescription)
- `apps/web/app/(app)/app/(authed)/projects/actions.ts:63-67` -- DELETE its `signedIn()` copy, import the
  one above; no other line changes
- `apps/web/server-wiring.test.ts` -- ADD one assertion: `signedIn` is exported from `lib/supabase/server.ts`
  and `async function signedIn` appears in neither actions file, so the copy cannot come back unnoticed
- `apps/web/app/(app)/app/(authed)/account/sessions-card.tsx` (new, client) -- the card: `email-card.tsx`'s
  shell, row and `:80` button verbatim in shape (the same class strings; `Laptop` from `kit/icons`); the
  `<dialog>` from `kit/dialog.ts` (`sheet`, `title`, `openOnCancel`, `closeOnBackdrop`, `aria-labelledby`);
  `useActionState(signOutEverywhere, null)`; the `once`/`submitting` guard and the `seen` pattern copied
  from `email-card.tsx`; the Banner above the form for the one failure; Cancel `data-cancel` + primary
  `Button size={36}`. `noValidate` is not needed (no field)
- `apps/web/app/(app)/app/(authed)/account/page.tsx` -- render `<SessionsCard />` after the Passkeys card
  (unconditionally); the header comment gains one sentence naming the extrapolation and this story
- `apps/web/app/(app)/app/sign-in/page.tsx:38-45,65` and `sign-in-form.tsx:28-36,251-253` -- the page reads
  the one key and passes `signedOutEverywhere={isSignedOutEverywhere(signedOut)}`; the form renders the
  other sentence in the same success Banner, same `state.status === 'idle'` condition
- `tools/probe/run-verify-sign-out-everywhere.py` (new, tool → a `doc-audit.py` catalogue row in
  `:283`'s shape) -- Playwright against `app.inflozo.com`; `Admin`, `load_env`, `playwright_dir`,
  `axe_path`, `tokens_rgb` and the sweep IMPORTED from `run-verify-passkeys.py` through
  `run-verify-email-change.py`'s `_sibling` pattern; fixture `sign-out-harness-<ts>@inflozo.com`, swept by
  `sweep_stale_fixtures(pattern)`, user count before and after; the steps in `## Verification`. A second
  session is minted AFTER the first is redeemed (GoTrue keeps one magic-link token per user — the passkey
  harness's `magic-link` note). `--check` is plumbing only. No key printed
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-14 gains one line (not needed here);
  DW-38 → closed by this story; DW-40 and DW-41 written at Create (below) — the Dev run fills DW-40's number
- read-only: `apps/web/lib/supabase/cookies.ts` (`SESSION_MAX_AGE`, the `maxAge: 0` deletion), `proxy.ts:25-39`
  (the per-request `getUser()` that clears a revoked session's cookies), `(authed)/layout.tsx` (the guard),
  `components/shell/account-menu.tsx:259-262` (the form that posts `signOut` — untouched),
  `passkeys-card.tsx:343-392` (the other confirm, for the vocabulary), `kit/banner.tsx`, `kit/button.tsx`
- `auth-js` 2.115.0, read 2026-09-07: `GoTrueClient.js:3405` (default `{ scope: 'global' }`),
  `:3415-3445` (`_signOut`: `admin.signOut(accessToken, scope)`; a 401/403/404 or a missing session is taken
  as already signed out; any other error removes the local session AND returns the error),
  `GoTrueAdminApi.js:67-77` (`POST /logout?scope=`), `lib/types.d.ts:1582-1590,1703` (`global | local |
  others`), `lib/fetch.js:82-86` (`session_not_found` → `AuthSessionMissingError`),
  `GoTrueClient.js:2714-2718` (`getUser()` removes the session on it) -- the rows that bind
- `EXPERIENCE.md:131` · `epics.md:791-804` · PRD FR-A6 (`prd.md:185`) · DW-14 · DW-38

## Tasks & Acceptance

**Execution:**
- [x] `sign-in/signed-out.ts` + `apps/web/signed-out.test.ts` -- the second value, its reader, both round
      trips, and the source-reading scope test -- the contract before anything reads it
- [x] `lib/supabase/server.ts` + `account/actions.ts` + `projects/actions.ts` + `server-wiring.test.ts` --
      `signedIn()` once, imported twice, pinned -- DW-38
- [x] `sign-in/actions.ts` -- `{ scope: 'local' }` on the ordinary Sign out -- FR-A6's "ordinary sessions
      persist until then"
- [x] `account/actions.ts` -- `signOutEverywhere`, the code and the sentence -- FR-A6's verb
- [x] `account/sessions-card.tsx` + `account/page.tsx` -- the card, the row, the button, the confirm -- S12a
- [x] `sign-in/page.tsx` + `sign-in-form.tsx` -- the other sentence -- say it happened
- [x] `tools/probe/run-verify-sign-out-everywhere.py` + its catalogue row -- the harness, control first --
      R-82, re-runnable
- [x] `deferred-work.md` -- DW-38 closed, DW-40's `jwt_exp` filled from the harness's (DW-14's line landed at Create)
      `jwt-exp` step -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by variable name

**Acceptance Criteria:**
- Given a signed-in user on `/account` at 1440 and at 390, when the page renders, then a **Sessions** card
  sits under Passkeys and **matches the frame** — S12a's Email card shell and row (`S12 Billing.dc.html:74-82`)
  with the `:80` button (30px / radius 10 / 12px 500 / surface, `line` border, `paper` on hover), the label,
  glyph, title, caption and button text as Always names them; the Email and Passkeys cards exactly as 2.3
  left them
- Given **Sign out everywhere** pressed, when the dialog opens, then focus is on Cancel, the title and the one
  sentence are there, and Cancel, Escape and a backdrop click each close it with no request sent
- Given the confirm's primary pressed on device A while device B is signed in, when GoTrue answers
  `/logout?scope=global` 2xx, then A lands on `/sign-in?signed-out=all` with "You've been signed out on
  every device.", A's cookies are gone, A's former access token and B's access token both answer
  `session_not_found` at `GET /auth/v1/user`, and B's next `/account` load lands on `/sign-in`
- Given the avatar menu's Sign out on device A while B is signed in, when A lands on `/sign-in?signed-out=1`,
  then B's token still answers **200** and B's `/account` still renders — **the control**, and the half of
  FR-A6 that was false until this story
- Given the everywhere action fails at `/logout` (a status the library does not treat as already signed
  out), when the action returns, then the dialog is still open with the red sentence, nothing redirected,
  and no other device was signed out
- Given a fresh magic link for A after an everywhere sign-out, when it is redeemed, then it signs in to the
  same user id and its `Set-Cookie` carries `Max-Age=2592000`
- Given `signed-out.test.ts`, when either action's scope option is removed or swapped, then a test fails
- Given `pnpm check`, `pnpm build`, and axe-core on `/account` (closed, dialog open) and on
  `/sign-in?signed-out=all`, at 1440 and 390, then all green and zero violations

## Spec Change Log

1. **One test beyond the Code Map, in `server-wiring.test.ts`** (Dev, 2026-09-07). Two matrix rows —
   *Passkey switches off* and *Session ended before the click* — are visible only in the source: production
   runs with both passkey switches ON, so no harness step can ever see a Sessions card moved inside the
   `passkeys ? … : null` branch, and none can see the guard swapped from `signedIn()` to `ready()`. Either
   would be green in every gate while taking sign-out-everywhere away from exactly the user whose passkeys
   are off. The test asserts what stands immediately before `<SessionsCard`, and that `signOutEverywhere`
   awaits `signedIn()` before `/logout`. Both halves were controlled — broken, seen to fail, restored.
2. **`SESSION_MAX_AGE` is read by the harness, never retyped in it** (Dev, 2026-09-07). The
   `magic-link-after` step asserts FR-A6's thirty days on the `Set-Cookie`, and reads the number out of
   `apps/web/lib/supabase/cookies.ts`: a count written twice is a count that goes stale once.

## Design Notes

**Routine calls made here, not the owner's** (each one line, as CLAUDE.md asks). *Ordinary Sign out
becomes this-device-only:* FR-A6 names two actions, and two actions that do the same thing is not what it
means; the default was never a decision, it was a library default nobody read. *A separate card, not a
row in Passkeys:* the passkey card is absent with the switch off and a way OUT must not hang on a way in.
*A confirm, untyped:* one mis-click here throws you off every device including this one; the revoke
confirm exists for less. *The Email card as the base, not the Danger zone:* red is the vocabulary for
losing data, and nothing is lost here but a re-sign-in. *A second value on the one key, not a new key:*
`signed-out.ts`'s test already pins that one sign-out never reads as another. *Nothing told to the other
devices:* see Never.

**What is a hypothesis until the harness runs.** That the hosted GoTrue honours `scope=local` (only the
caller's session goes) and `scope=global` (every session goes); that a JWT whose session row is gone is
refused at `/user` with `session_not_found` at once rather than until `exp`; that the response the proxy
writes on that refusal carries the deletion cookies; that a magic link after a global sign-out signs in.
Each is executed, not reasoned, and the result lands under `## Verification` — and the first one that
fails is an **Ask First**, not a workaround.

**Why the 401/403/404 branch is not a lie.** `_signOut` treats those three from `/logout` as "already
signed out" and returns no error (`GoTrueClient.js:3429-3431`). With a live session GoTrue does not
answer them, and with a dead one `signedIn()` has already redirected before the call is made — so the
branch is unreachable from this action, which is why the matrix has no row for it.

**The residual, named (DW-40).** After a global sign-out, a captured access token is still a valid
signature until its `exp`. The app never accepts it — every page and action verifies with `getUser()`,
which GoTrue refuses — but Supabase's REST would, until `jwt_exp`. No browser client and an `HttpOnly`
cookie mean the token is never in script's reach, so the exposure needs the cookie stolen first; the
harness reads `jwt_exp` off the Management API so the number is a fact.

`// ponytail: the other devices find out by being bounced; a sentence for them the day a frame draws one` ·
`// ponytail: one Laptop glyph on the row; per-device rows the day GoTrue lists sessions to a user`

## Verification

Run on the real infrastructure (R-82) by the Dev run, 2026-09-07. Every key was read into a command's
environment by name and never printed; each is recorded below by its variable name only.

**Ran at Dev, and what each returned:**

- `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH && pnpm check` (repository root) --
  **exit 0**. `eslint .` clean, `tsc --noEmit` clean in every package, `node --test` **140 pass / 0 fail**
  in `apps/web`. The seven new ones: the everywhere round trip through its reader; "nothing else reads as
  signed out everywhere"; "an ordinary sign-out and an everywhere sign-out never read as each other"; the
  two source-reading scope tests; "the session guard is one export, imported, and copied into neither
  actions file"; and "the way out of every device does not hang on a way in"
- `pnpm build` -- **exit 0**, `✓ Compiled successfully`; `/app/account` still `ƒ` and `/app/sign-in` still `ƒ`
- `bash supabase/tests/run-rls-gate.sh` -- **exit 0**. No migration in this story; the gate proves the
  `supabase/` copies have not drifted from the architecture originals and every RLS assertion still passes
- `python3 tools/doc-audit.py --check` -- **PASS (0 warnings)**, after `tools/story-board.py` regenerated
  the board. The new harness has its catalogue row
- `python3 tools/probe/run-verify-sign-out-everywhere.py --check` -- **exit 0**, against the real Supabase
  project (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ACCESS_TOKEN`):
  `playwright: resolved`, `axe-core: resolved`, `PASS admin round trip: create, read back (200)`,
  `SESSION_MAX_AGE read from the app: 2592000`; users **4 before, 4 after** — no leak

**THE STORY'S FOUNDING CLAIM, EXECUTED rather than reasoned** (standing rule 1). The Intent cites
`GoTrueClient.js:3405` for the library's default; what the HOSTED GoTrue does with each scope was still a
hypothesis. Two real sessions were minted for one fixture user the way the app's own confirm route does it
(`POST /admin/generate_link` with `SUPABASE_SECRET_KEY`, then `POST /auth/v1/verify` with
`SUPABASE_PUBLISHABLE_KEY` — each link minted immediately before redemption, because GoTrue keeps one per
user), then `POST /auth/v1/logout?scope=…` from A1 with A1's own bearer token, asking `GET /auth/v1/user`
for both tokens either side. Executed 2026-09-07:

| scope | `POST /logout` (A1) | A1 after | A2 after |
|---|---|---|---|
| `local` | **HTTP 204** | `403 session_not_found` | **`200`** — still signed in |
| `global` | **HTTP 204** | `403 session_not_found` | **`403 session_not_found`** |

Both halves hold, and they hold **immediately**: a revoked session is refused at `GET /auth/v1/user` at
once, not at the JWT's own `exp`. **The Ask First did not fire** — no revoked token answered 200, so the
choice between a shorter `jwt_exp` and a session table of ours never arises and there is nothing to put to
the owner. The fixture user was deleted and the Admin-API count returned to 4.

- `GET https://api.supabase.com/v1/projects/{ref}/config/auth` (`SUPABASE_ACCESS_TOKEN`) -- **HTTP 200,
  `jwt_exp = 3600`** (60 minutes), written into **DW-40**, which no longer carries a blank

**Controls run, because a test that cannot fail is not a test** (standing rule 2). Each contract was broken,
seen to fail with its own message, and restored:

- `{ scope: 'local' }` dropped from `signOut`, as a tidy-up would -- *"the avatar menu's Sign out is
  explicitly this device only"* FAILS
- `signOutEverywhere`'s `'global'` swapped for `'local'` -- *"Sign out everywhere is explicitly every
  device"* FAILS
- `<SessionsCard />` moved inside `{passkeys ? … : null}` -- *"the way out of every device does not hang on
  a way in"* FAILS
- `signOutEverywhere`'s `signedIn()` swapped for `ready()` -- the same test FAILS on its guard assertion

**Belongs to the Deploy run, not to Dev**, because it drives the deployed UI and this code is not yet on
`app.inflozo.com`:

- `python3 tools/probe/run-verify-sign-out-everywhere.py` (against `app.inflozo.com`) -- expected: every
  step PASS, exit 0. Its steps, in order: `control-local` (**the control, and it runs first**: A1's ordinary
  avatar-menu Sign out, after which A2 must STILL be signed in — a run where A2 is signed out has found the
  pre-2.4 defect still deployed and FAILS, because signing every device out is also what the broken build
  did), `frame`, `dialog-focus`, `everywhere`, `jwt-exp` (RECORD), `magic-link-after`, and `axe-*` over
  `/account` closed, `/account` with the confirm open, and `/sign-in?signed-out=all`, each at 1440 and 390 —
  zero violations and no horizontal scroll. Fixture user deleted; Admin-API count before == after

**WHAT NO AUTOMATED STEP COVERS, said rather than left to be found.** Every matrix row but two has a
covering step: four ran at Dev and passed (the two scopes, the guard, the card's unconditional render), and
four are the harness's and run at Deploy against the deployed UI, which is where R-80 and R-82 put them.
The two that have none:

- *GoTrue unreachable or a 5xx* — it cannot be produced against real infrastructure, and a mock would not be
  evidence (R-82). The branch is two lines (`if (error) → fail('sign_out_failed')`), the sentence is in
  `MESSAGES`, and nothing redirects because the redirect is outside the try. The neighbouring unexecuted
  claim about what the library does to THIS device's cookies on that path is already **DW-41**
- *Double submit* — the `once` guard is client-side React, and this repository has no component test runner
  (`node --test` over plain modules only). `email-card.tsx`'s identical guard is untested for the same
  reason; adding a runner is not this story's

**Manual checks (if no CLI):**
- Playwright's Chromium at 1440 and 390: the card's row and button sit where the Email card's do; the
  primary reads "Signing out…" while the action runs

## Owner's manual test

On the live site, after the Deploy run. You need **two devices** — your laptop and your phone — both signed
in to the same Inflozo account.

1. **URL:** https://app.inflozo.com/account on the **laptop** · **Screen:** Account & Billing · **Do:** look
   under the Passkeys card · **See:** a new **Sessions** card: a small laptop icon, "Every device you're
   signed in on", the smaller line "Each stays signed in for 30 days from its last visit", and at the right
   end of the row a small white **Sign out everywhere** button — the same size and look as **Change email**
   above it.
2. **URL:** the same · **Do:** press your avatar (bottom-left) → **Sign out** — the ordinary one · **See:** the
   sign-in page with the green "You've been signed out." Now pick up the **phone** and reload the dashboard ·
   **See:** the phone is **still signed in**. (Before this story it would have been signed out too — that was
   a bug this story fixes.)
3. **URL:** https://app.inflozo.com/sign-in on the laptop · **Do:** sign in again (magic link or passkey),
   then go to https://app.inflozo.com/account and press **Sign out everywhere** · **See:** a window titled
   "Sign out everywhere?" with one sentence — "Every device signed in to your account will be signed out,
   including this one. Sign in again wherever you need to." — and two buttons, **Cancel** and **Sign out
   everywhere**. The Cancel button has the focus ring. Press **Cancel** · **See:** the window closes and
   nothing else happens.
4. **URL:** the same · **Do:** press **Sign out everywhere** again, then the dark **Sign out everywhere**
   button in the window · **See:** it reads "Signing out…" for a moment, then the sign-in page with the
   green "You've been signed out on every device."
5. **Phone** · **Do:** reload the dashboard (or open any page) · **See:** the sign-in page. It says nothing
   about why — the phone simply finds itself signed out. That is expected in this story.
6. **URL:** https://app.inflozo.com/sign-in on the laptop · **Do:** sign in again · **See:** your dashboard
   and projects as before — signing out everywhere ends sessions, never the account.

## Owner's test findings
