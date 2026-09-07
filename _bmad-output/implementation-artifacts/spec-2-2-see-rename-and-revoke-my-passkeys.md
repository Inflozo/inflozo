---
title: 'Story 2.2 — See, rename and revoke my passkeys'
type: 'feature'
created: '2026-09-07'
status: 'done'
baseline_commit: '51cfb9740508aa11da170bc5b85022e3745fd6c8'
review_loop_iteration: 2
owner_test: passed
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

After this story you can give each passkey on your Account page a name of your own, and remove one
you no longer use — for instance the passkey of a laptop you sold — so that device can no longer sign
in to your account. You will see, at the end of every row in the Passkeys card, a small pencil that
opens a "Rename passkey" window and a small red bin that opens a "Remove this passkey?" window with
**Cancel** and **Remove passkey**. The moment you remove one, its row is gone and that device's
passkey stops working on the next sign-in; the magic link always still works.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-A3 says the Security surface lists passkeys **with rename and revoke**. Story 2.1 built
the list and the auto-name, and deliberately left the pencil and the bin the frame draws at the end of
every row absent (UX-DR3: a control that could never act is absent, not greyed). A user who loses a
device today cannot cut that device off.

**Approach:** The two controls the frame draws, wired to Supabase's own passkey store through the
methods the installed library already carries — `auth.passkey.update({ passkeyId, friendlyName })`
(`PATCH /passkeys/{id}`) and `auth.passkey.delete({ passkeyId })` (`DELETE /passkeys/{id}`) — as two
server actions in the file 2.1's registration actions live in. Rename is a dialog with one field;
revoke is a confirm that opens on Cancel. The name lives in Supabase's `friendly_name`, so
`passkey_labels` — built on the premise 2.1 falsified (DW-30) — is dropped by a new migration.

## Boundaries & Constraints

**Always:**
- The frame is `S12 Billing.dc.html` S12a's Passkeys card (`:83-104`): a 28×28 icon button, radius 8,
  at the end of each row — the pencil (`#6E6A64`, hover `paper`) titled *Rename* and the bin (danger
  stroke, hover `danger-tint`) titled *Revoke* — read off the frame, never rounded, tokens only.
- The rename dialog and the revoke confirm have no frame and are **extrapolated from the same place
  the project menu's were** — S12c through `project-menu.tsx`'s two `<dialog>`s: same `sheet`, same
  `title`, Cancel + primary footer, and for the confirm the danger disc with the bin in it. The revoke
  confirm opens with focus on Cancel (EXPERIENCE.md § Destructive confirms). **No typed confirm** —
  that is reserved for account and project delete.
- Both actions are `'use server'` beside `startPasskeyRegistration`, guarded by the same `ready()`:
  the flag first, then the session. `auth.passkey.*` is called through the user's own cookie-backed
  client, never `supabaseAdmin()` — GoTrue scopes both calls to the bearer, which is the ownership
  check; nothing of ours re-checks it.
- Mutation shape: client → server action → the platform; one zod schema at the boundary — the name is
  `trim().min(1).max(120)`, the platform's own ceiling (`types.d.ts:2441`); the id is a UUID. Error
  envelope `{ code, message }` as the file already shapes it, S12's voice, in the helper-caption slot.
- Both actions `revalidatePath('/app/account')` — the internal path — so the row renames or leaves
  with the re-rendered tree; nothing on the client edits the list optimistically.
- `passkey_labels` is dropped by a **new** migration file; the frozen 2026-09-04 migration is not
  edited; `SCHEMA.sql` loses the table and its three list entries in the same commit; the RLS gate
  is green (its schema diff is the proof the two now agree).
- Every claim below about GoTrue's `PATCH`/`DELETE` behaviour is a hypothesis until the harness
  executes it against the live project (standing rule 1); `## Verification` says which ones.

**Ask First:**
- Any second store for a passkey's name, or any column of ours that keeps a credential id.
- A route change, a new page, or any control on the Sign In page.
- Any change to `passkeysEnabled()`, `supabaseAdmin()`'s caller list, or the flags.

**Never:**
- Change email (2.3), sign-out-everywhere (2.4), the Danger zone (2.5), the plan column (E12).
- A device glyph per row: nothing of ours knows the device (the AAGUID is read once and dropped),
  so every row keeps the laptop the card draws today; the frame's phone is illustrative.
- A browser Supabase client; a one-call helper; a `disabled` attribute (the Kit greys with
  `aria-disabled`); a tooltip for any sentence.
- Signing the user out, or touching any session, on a revoke.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Rename | pencil → "Rename passkey", field holds the current name → Save | `PATCH` with the trimmed name; dialog closes; row shows the new name | failure keeps the dialog open with "We couldn't rename that passkey just now. Try again in a moment." above the form |
| Rename, empty or spaces | field `"   "` → Save | nothing sent | field error "Give it a name — up to 120 characters." |
| Rename, 121+ chars | typed or pasted | the 121st character cannot be entered (`maxLength`); the server refuses it anyway | same sentence, server-side |
| Rename to the same name | unchanged → Save | one `PATCH`, dialog closes, nothing visibly changes | as Rename |
| Revoke | bin → "Remove this passkey?" · "*name* will no longer sign you in on that device. You can add it again later." → **Remove passkey** | `DELETE`; confirm closes; the row is gone; the current session is untouched | failure keeps the confirm open with "We couldn't remove that passkey just now. Try again in a moment." |
| Revoke, then that device signs in | the authenticator still holds the revoked credential | sign-in fails with one of S1a's two existing sentences — "No passkey on this device yet…" if the browser no longer offers it, "We couldn't sign you in with a passkey. Use a magic link instead." if GoTrue refuses the assertion; the magic link works | which sentence is a hypothesis — the harness records it and the change log pins it |
| Revoke the last passkey | one row → Remove | the card is empty but for "Add a passkey"; magic link is the way in | — |
| Either switch off, or the session ended | any of the two actions | `passkeys_off` / redirect to sign-in — `ready()`'s existing answers | — |
| Double submit | Save or Remove pressed twice in one tick | one request (`onSubmit` guard, `project-menu.tsx`'s `once`) | — |
| Cancel / Escape / backdrop | either dialog | closes; the rename field resets to the current name (`form.reset()` on close) | — |
| A stale id | the row was revoked in another tab, then renamed here | GoTrue answers 404; the sentence above; the next render drops the row | logged by status and code only |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/account/actions.ts` -- ADD `renamePasskey(prev, formData)` and `revokePasskey(prev, formData)` with `useActionState`'s `(previous, FormData)` signature (`projects/actions.ts:130,188` is the pattern) so the dialogs' `<form action>` are progressively enhanced; both through `ready()`; `Code` widens by `'bad_name' | 'rename_failed' | 'revoke_failed'` and `MESSAGES` gains the three sentences; `supabase.auth.passkey.update({ passkeyId, friendlyName })` returns the item, `delete({ passkeyId })` returns `null` (`GoTrueClient.js:5668-5730`); the name schema `z.string().trim().min(1).max(120)` is NOT `lib/projects`'s `nameSchema` (80, and its hint names a project); because a `'use server'` file may export only async functions, the schema and `PASSKEY_NAME_MAX` live in a new plain `account/passkey-name-rule.ts` (the precedent `nudge.ts` set), under `node --test`
- `apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx` -- the rows gain the frame's trailing pair (`ml-auto flex gap-[2px]`; each `size-7 rounded-sm` button, `aria-label="Rename <name>"` / `"Remove <name>"`, the pencil in `text-ink-soft hover:bg-paper`, the bin in `text-danger hover:bg-danger-tint`, `Pencil`/`Trash` from `kit/icons` at 13 — their paths are byte-identical to the frame's); the two `<dialog>`s ONE per card, holding the selected row in state, not one pair per row; `sheet`, `title` and the `open()` that focuses `[data-cancel]` move to `components/kit/dialog.ts` and are imported by both files rather than copied; the `once` double-submit guard stays per component (it closes over a `busy` ref tied to that component's `pending` flags, `project-menu.tsx:130-143`) and is written here the same way; the `onClose` reset and the "seen" pattern follow `project-menu.tsx:113-180,274-330`; the comment at the top saying rename and revoke are 2.2's is rewritten to say what is true
- `apps/web/components/kit/dialog.ts` (new, plain) -- `sheet`, `title`, `openOnCancel(dialog)` exported with the `m-auto` note that travels with `sheet`; `project-menu.tsx` imports them; `kit-button.test.ts`'s idiom pins that `sheet` still names `shadow-modal` and `backdrop:bg-scrim`
- `apps/web/app/(app)/app/(authed)/account/page.tsx` -- `listPasskeys()` gains `Promise.race` against a 3s `setTimeout` that resolves `null` — DW-33 (2), the same ceiling `passkeysEnabled()` has; nothing else moves
- `apps/web/app/(app)/app/(authed)/project-menu.tsx` -- imports the three from `kit/dialog.ts`; no behaviour change (the review reads the diff as a pure move)
- `supabase/migrations/20260907120000_drop_passkey_labels.sql` (new) -- `drop table public.passkey_labels;` with a header naming DW-30, the story and the premise; the file is applied to production by hand at Deploy (`psql "$SUPABASE_DB_URL" -f …`, never echoed) — no CLI and no CI applies migrations (1.2's record)
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql:128-144,821,1022,1174` -- the table, its comment and its three list entries go; `RLS-TEST.sql` never named it (grepped 2026-09-07), so `supabase/tests/rls.sql` is untouched
- `tools/probe/run-verify-passkeys.py` (new, tool → a `doc-audit.py` catalogue row at `:263`'s shape) -- Playwright (memory: `headless-browser-tooling`) with `WebAuthn.addVirtualAuthenticator` against `app.inflozo.com` under a session it obtains as 2.1's Deploy run did — a fixture user, `POST /auth/v1/admin/generate_link` with `SUPABASE_SECRET_KEY`, the `hashed_token` redeemed at `/app/auth/confirm`, the user deleted afterwards with the Admin-API user count read before and after: register → `GET /passkeys` carries the row → rename through the UI → `friendly_name` read back off the wire → a second `create()` on the same authenticator (DW-32 (4)) → revoke through the UI → `GET /passkeys` no longer lists it → sign in with the revoked credential fails → the magic-link session is still `200` on `/app/account`; a burst of 30 `startPasskeySignIn` posts recording the first status ≠ 200 (DW-33 (1)); **control:** rename to a 121-char name through the action must be refused. Exit non-zero on any step
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-30 `status: closed` (dropped); DW-32 (3) and (4) closed, (1) and (2) stay open with a line saying so; DW-33 (1) and (2) closed
- `apps/web/app/(app)/app/sign-in/passkey-button.tsx` -- **the Fix run's file (the owner's finding 1).** WAS read-only. Now: the local `caption` state is gone and an attempt's answer goes UP through a new `onError` prop — `NO_PASSKEY_HERE`, `PASSKEY_FAILED` and both server-action messages. `NO_WEBAUTHN` is not an attempt's answer and stays in P0-0's helper-caption slot, which the component now renders INSTEAD of the offer rather than beside it (one state fewer: `supported` already carried it). `aria-describedby` on the button goes with the caption — the banner is `role="alert"` and announces itself
- `apps/web/app/(app)/app/sign-in/sign-in-form.tsx` -- **the Fix run's file.** `passkeyError` state, handed to `PasskeyButton` as `onError` and drawn as `<Banner kind="error">` at the top of the card; the three existing banners move into that ternary's else branch, so the passkey sentence REPLACES them rather than stacking (the owner's own words). `guard()` clears it on a send, so it never outlives what answered it
- `apps/web/passkey-banner.test.ts` (new) -- the wiring pinned by source assertion, `kit-button.test.ts`'s idiom and for its reason (`node --test` cannot load `.tsx`): the two sentences reach `onError`, `NO_WEBAUTHN` does not, the Banner is `kind="error"`, and the other three sit in the else branch. Its control ran — all three tests FAIL against the pre-Fix files
- `apps/web/app/(app)/app/sign-in/actions.ts` -- read-only: the revoked-credential path lands on its existing sentences; nothing to add
- `EXPERIENCE.md:131,298,482-486` · `epics.md:757-770` · PRD FR-A3 (`prd.md:182`) · `auth-js/dist/module/lib/types.d.ts:2404-2447` -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/components/kit/dialog.ts` + `project-menu.tsx` -- lift `sheet`, `title`, `openOnCancel` -- one dialog vocabulary, no second copy
- [x] `apps/web/app/(app)/app/(authed)/account/passkey-name-rule.ts` + `apps/web/passkey-name-rule.test.ts` -- the schema and `PASSKEY_NAME_MAX`; cases: trims, empty, 120 ok, 121 refused -- the boundary, under `node --test`
- [x] `apps/web/app/(app)/app/(authed)/account/actions.ts` -- `renamePasskey`, `revokePasskey`, the three messages -- FR-A3's two verbs
- [x] `apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx` -- the trailing pair, the two dialogs, the header comment -- S12a
- [x] `apps/web/app/(app)/app/(authed)/account/page.tsx` -- the 3s race in `listPasskeys()` -- DW-33 (2)
- [x] `supabase/migrations/20260907120000_drop_passkey_labels.sql` + `SCHEMA.sql` -- drop the table; `bash supabase/tests/run-rls-gate.sh` green -- DW-30's fate
- [x] `tools/probe/run-verify-passkeys.py` + its `doc-audit.py` row -- the harness -- DW-32 (3)(4), DW-33 (1), and this story's own round trip
- [x] `deferred-work.md` -- close DW-30, DW-32 (3)(4), DW-33; say what stays open -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result

**The Fix run (the owner's test finding 1):**
- [x] `apps/web/app/(app)/app/sign-in/passkey-button.tsx` -- an attempt's answer leaves the caption and goes up through `onError` -- the sentence he could not see
- [x] `apps/web/app/(app)/app/sign-in/sign-in-form.tsx` -- `passkeyError` drawn as the Kit's `error` Banner at the top, replacing the other three -- "like the 'You have been signed out' message ... but in red, with an error icon"
- [x] `apps/web/passkey-banner.test.ts` -- the wiring pinned, and its control run against the pre-Fix files
- [x] `tools/probe/run-verify-passkeys.py` -- `revoked-signin` now asserts the BANNER (role, `danger-tint`, an icon), not any `<p>` -- a step that read a `<p>` would pass for the very caption he asked to be replaced
- [x] Re-run `## Verification` on the real infrastructure (R-82), with a control

**Acceptance Criteria:**
- Given a signed-in user with passkeys on `/account` at 1440 and at 390, when the card renders, then every row ends in the pencil and the bin and **matches the frame** (`S12 Billing.dc.html` S12a `:90-91`: 28×28, radius 8, 13px glyphs, the frame's hover fills), the laptop glyph on every row, the plan column and Change email still absent
- Given the pencil pressed, when a valid name is saved, then `GET /passkeys` carries it as `friendly_name` and the row shows it after the re-render
- Given the bin pressed, when the confirm opens, then focus is on Cancel; when **Remove passkey** is pressed, then `GET /passkeys` no longer lists that id, the row is gone, and the same session still renders `/account`
- Given a credential revoked, when that authenticator is used on `/sign-in`, then the assertion is refused and the existing sentence shows; the magic link still signs in
- Given either switch off, when either action is posted, then `passkeys_off`; given no session, then the sign-in redirect
- Given the new migration applied, when `run-rls-gate.sh` runs, then it is green and `passkey_labels` exists in neither database
- Given `pnpm check`, `pnpm build`, `node --test` and axe-core on `/account` with both dialogs open in turn, then all green and zero violations
- **(the owner's test, finding 1)** Given a passkey sign-in that fails, when the card answers, then the sentence is the Kit's `error` Banner at the top of the card — `role="alert"`, the `danger-tint` fill, the `danger-line` hairline, `danger-text` words and the `XCircleSolid` icon in `danger` — and it REPLACES whichever of the three banners was there; nothing is left in the helper-caption slot under the button, and axe is still clean at 1440 and 390

### Review Findings

Code review 2026-09-07, five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). No decision for the owner. Every patch applied in the review; one item deferred.

- [x] [Review][Patch] The harness minted two magic links up front and GoTrue keeps one per user, so the Deploy run would have failed at `signed-in` against a correct product [tools/probe/run-verify-passkeys.py] — executed against the deployed confirm route: the first link answered `/sign-in?error=link`. The second link is now minted by the browser half right before the `magic-link` step
- [x] [Review][Patch] The harness's control could not reach the server: Playwright's `fill` honours `maxlength` (executed: 121 became 120), so `rename-control` would have failed for the wrong reason [tools/probe/run-verify-passkeys.py] — the value is set from script past the attribute; the step waits for the field's sentence and asserts it quotes the ceiling
- [x] [Review][Patch] `revoked-signin` passed for any page still on `/sign-in`, a button that did nothing included [tools/probe/run-verify-passkeys.py] — one of S1a's two sentences must be on the page
- [x] [Review][Patch] A user count that could not be read silently skipped the leak check; paging stopped on a short page, not an empty one; stale `passkey-harness-*` users from a killed run were never swept [tools/probe/run-verify-passkeys.py]
- [x] [Review][Patch] `revoke`'s "id gone" was vacuously true with no id; the id's UUID shape (the boundary's premise) was never asserted [tools/probe/run-verify-passkeys.py]
- [x] [Review][Patch] `duplicate` waited a fixed 4s and, if GoTrue did not refuse, left a second credential that `revoked-signin` would then reason about [tools/probe/run-verify-passkeys.py] — waits for the caption or the second row, and removes any extra row through the bin
- [x] [Review][Patch] `frame` measured the hover fills and glyph colours but never asserted them, and its comment quoted the frame's `#FDEBEC` where the token is `#FDECEC` [tools/probe/run-verify-passkeys.py] — asserted against the tokens read out of `globals.css` (DESIGN.md:51 rules the token); the name ceiling is read out of `passkey-name-rule.ts`
- [x] [Review][Patch] Harness robustness: network and non-JSON answers, a 600s node timeout and a missing `.env` were tracebacks that skipped cleanup; `burst()` counted a network error as a status [tools/probe/run-verify-passkeys.py]
- [x] [Review][Patch] The catalogue row said the harness "closes DW-32 (4) and DW-33 (1)" while the ledger in the same commit says both wait for the Deploy run [tools/doc-audit.py:289]
- [x] [Review][Patch] The 3s ceiling on `listPasskeys()` was a second copy of `lib/flags.ts`'s constant, left its timer pending on every fast read, and had no test [apps/web/app/(app)/app/(authed)/account/page.tsx] — `lib/with-timeout.ts` under `node --test` with mock timers, importing the now-exported `READ_TIMEOUT_MS`
- [x] [Review][Patch] The passkey-id guard lived in a `'use server'` file no test can load and the harness only ever posts real ids [apps/web/app/(app)/app/(authed)/account/actions.ts:58] — `passkeyIdSchema` moved beside the name rule and pinned: `x/../../user` and `''` refused
- [x] [Review][Patch] A 404 on rename or revoke (the *stale id* row) showed the sentence but nothing revalidated, so the row the matrix promised would leave stayed [apps/web/app/(app)/app/(authed)/account/actions.ts] — 404 (executed against GoTrue: `validation_failed "Passkey not found"`) revalidates and still says the sentence
- [x] [Review][Patch] The matrix promises Cancel / Escape / backdrop close either dialog, and a native modal `<dialog>` does not close on a backdrop click [apps/web/components/kit/dialog.ts] — `closeOnBackdrop` (geometry, so the sheet's own padding does not count) on all four dialogs, the project menu's included
- [x] [Review][Patch] The card's comment claimed both forms work with JavaScript off; the dialogs open by `showModal()` and the id is set by a click handler [apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx:100]
- [x] [Review][Patch] `kit/dialog.ts` cited "standing rule 3" by number; CLAUDE.md says cite the words [apps/web/components/kit/dialog.ts:6]
- [x] [Review][Patch] Nothing pinned that `project-menu.tsx` keeps no copy of the lifted sheet, or the `title` tokens [apps/web/kit-button.test.ts]
- [x] [Review][Defer] Two rows born with the fallback name `Passkey` are two identical `Rename Passkey` controls to a screen reader [apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx] — deferred, DW-36; the disambiguator is the added date, and it changes the harness's locators, so it is done with DW-32 (2)

**Second review, 2026-09-07, after the Fix run** — the same five layers over the whole diff since the
baseline, the Fix run's two files and its test read for the first time. No decision for the owner.

- [x] [Review][Patch] A keyboard-activated submit closed the dialog: Enter in the rename field or Space on Save fires a click at (0,0), which `closeOnBackdrop`'s geometry reads as outside the sheet — executed in Chromium (`click target=save x=0 y=0 detail=0 outside=true`). The mouse-driven harness could never see it [apps/web/components/kit/dialog.ts:44] — a click whose target is not the `<dialog>` itself is never the backdrop; pinned in `kit-button.test.ts`; the harness now renames with Enter and keeps the mouse for the control
- [x] [Review][Patch] The test that claims the three banners sit inside the passkey ternary's else branch captured the OUTER `sent` ternary instead — hoisting "You've been signed out." above the red banner left it green (executed by three layers) [apps/web/passkey-banner.test.ts:72]
- [x] [Review][Patch] A passkey attempt's banner survived a rejected send: `guard()` returned on a bad address before clearing it, so the red banner at the top and the red field sentence stood together [apps/web/app/(app)/app/sign-in/sign-in-form.tsx:114-122]
- [x] [Review][Patch] A result that arrived after a backdrop click closed the dialog mid-flight was shown on the NEXT open, for another row [apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx:122-127]
- [x] [Review][Patch] The frozen matrix says an empty name sends nothing; the form posted it and let the server say the sentence [apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx:296] — the shared schema is checked at the submit, `sign-in-form.tsx`'s `guard()` shape
- [x] [Review][Patch] `revoked-signin` waited a fixed 6s for a banner it can wait FOR, and never asserted that nothing was left in the caption slot — a regression showing both would pass [tools/probe/run-verify-passkeys.py:401]
- [x] [Review][Patch] `ratelimit`'s burst of 30 sits on the edge of GoTrue's window: today's harness burst was all 200 and a 60-call burst right after got 429 on call 4 (55 of 60), so the step could record "did NOT rate-limit" against a platform that does; "of 30" was also hardcoded [tools/probe/run-verify-passkeys.py:465] — 60 calls, the count derived; the DW-33 line says the limit is a window
- [x] [Review][Patch] Four comments say the old caption was 12.5px; `globals.css` says 11px and the Fix measured 11px [apps/web/app/(app)/app/sign-in/passkey-button.tsx:20 · sign-in-form.tsx:56 · passkey-banner.test.ts:8 · tools/probe/run-verify-passkeys.py:407]
- [x] [Review][Patch] `id="passkey-caption"` is referenced by nothing since `aria-describedby` went [apps/web/app/(app)/app/sign-in/passkey-button.tsx:158]
- [x] [Review][Patch] The sign-in actions' comment still says the sentences go "in P0-0's helper-caption slot under the button" [apps/web/app/(app)/app/sign-in/actions.ts:123]
- [x] [Review][Patch] The signed-out banner's comment block sits above the passkey ternary and describes a banner three lines lower [apps/web/app/(app)/app/sign-in/sign-in-form.tsx:233-237]
- [x] [Review][Patch] The catalogue row says the harness "ASKS DW-32 (4) and DW-33 (1), which close on the Deploy run's recorded answer"; both closed on 2026-09-07 [tools/doc-audit.py:289]
- [x] [Review][Patch] The frozen *Always* says the error envelope lands "in the helper-caption slot"; the Code Map and the matrix say a Banner above the form, and the code does the latter — recorded in the change log, no code change
- [x] [Review][Patch] Three `next-server` processes from earlier runs of this story were still listening on 3100, 3121 and 3122 (≈13–23h); a local check that landed on one saw 500s and no banner and would have read as a product failure — killed, recorded under `## Verification`

**Dismissed as noise, second review** (fourteen): `role="status"` on a caption mounted with its text (2.1's second loop already ruled it); scrolling the banner into view at 390 (the owner's step 5 re-test is the control for that); scoping `[role="alert"]` tighter in the harness (the token check on the matched element already refuses the field slot); rewriting 2.1's frozen matrix for a sentence that moved but did not change (change log 11 is the record); an empty `## Questions for the owner` (the section exists only when a decision is his); a "gone" sentence on 404 (the frozen matrix says the sentence, dismissed once already); the empty hidden id (twice — no dialog opens without a row's click, and the schema refuses it); `kit-button.test.ts`'s name; the `onError(null)` ordering comment; the mint banner reappearing for the length of a second attempt; a send resolving during a ceremony (the card is `pointer-events-none` while pending); a non-6-hex token tripping `.group(1)` (a traceback is still a non-zero exit); the second, empty `role="alert"` the harness lists (Next's route announcer).

**Dismissed as noise** (twelve): a token change to `#FDEBEC` (DESIGN.md:51 rules `danger-tint` `#FDECEC`); the `once` ref sticking after a throw or redirect (the card unmounts either way); a stale `renamedSeen` when Cancel wins a race with Save (no sentence is shown for a success); quoted `.env` values; a shared `load_env`; a Node-version check; a recovery note in the drop migration; a `deleteSucceeded` helper; recording the `--check` response shape; `burst()` after a browser failure; a `passkeys_off` rate-limit path; treating `DELETE` 404 as success (the matrix says the sentence).

## Spec Change Log

1. **`pnpm check` runs from the repository root, not `apps/web`.** The Verification section drafted
   it as `cd apps/web && pnpm check`; `apps/web/package.json` carries no `check` script — the
   workspace root's is `lint && typecheck && test` across every package. The recorded commands are
   the ones that actually ran.
2. **The axe passes and the frame measurement moved into `tools/probe/run-verify-passkeys.py`.**
   Both need a real passkey row, and GoTrue's `rp.id = inflozo.com` makes a row impossible from any
   localhost origin — executed, with Chrome's refusal quoted under `## Verification`. Keeping them
   in the harness means they run against the deployed site rather than in a scratch script that
   lives in no file, which is what DW-32 (3) asked for in the first place. The closed-state axe
   pass needs no row and ran at Dev at 1440 and 390, and so did both dialog states — the dialogs
   are in the DOM without a row — all four zero violations. What still needs the deployed site is
   the frame MEASUREMENT and the round trip, because those need a row that exists.
3. **DW-32 (4) and DW-33 (1) are written but not yet ANSWERED, and the ledger says so.** Each is a
   harness step whose result only exists after the Deploy run; marking them closed now would be a
   result whose control has not run (standing rule 2). DW-30, DW-32 (3) and DW-33 (2) ARE closed —
   each landed in code or in the schema at Dev.
4. **`SCHEMA.sql` lost four things, not three.** The Code Map said "the table and its three list
   entries"; the table also carried its own `alter table … enable row level security` line in §10.
   All four are gone, and the gate's schema diff against the migrations is the proof.
5. **Both `renamePasskey` and `revokePasskey` wrap their platform call in `try`/`catch`.** Not in
   the Code Map, but `auth.passkey.*` asserts the experimental opt-in BEFORE the library's own try
   and re-throws anything that is not an `AuthError` (`GoTrueClient.js:5668-5730`) — unwrapped, a
   Server Function that throws reaches the error boundary and takes `/account` down instead of
   leaving the dialog open with one sentence. It is the wrapping `listPasskeys()` already carries,
   for the same reason.
6. **`ready()` runs before the name is parsed.** The matrix's *Either switch off* row says any of
   the two actions answers `passkeys_off`; an action that still returned "give it a name" with the
   module switched off would be describing a form nobody should have been shown.
7. **Review, 2026-09-07 — two harness defects that would have failed the Deploy run against a
   correct product, both found by execution.** GoTrue keeps ONE magic-link token per user, so the two
   links the Python half minted up front left the first dead (`/sign-in?error=link` off the deployed
   confirm route); and Playwright's `fill` honours `maxlength` (121 became 120), so the control's
   121 characters never reached the server. The second link is now minted right before it is used,
   and the control sets the value from script past the attribute. Neither is visible to `--check`,
   which is why Dev's green `--check` could not see them.
8. **The `frame` step asserts the hover fills and glyph colours against the TOKENS, derived from
   `globals.css`.** The AC says "the frame's hover fills"; the frame's bin hover pixel is `#FDEBEC`
   and the token `danger-tint` is `#FDECEC` — DESIGN.md:51 rules the token, and both are export
   values (F-110). The card is built from the token, so the token is what is measured.
9. **The stale-id row's "the next render drops the row" needed a revalidate.** GoTrue's 404 on an
   unknown id is now executed (`validation_failed`, "Passkey not found", on both PATCH and DELETE);
   both actions revalidate on it and still say the sentence.
10. **Backdrop click now closes every dialog**, as the matrix's *Cancel / Escape / backdrop* row
    promised and a native modal `<dialog>` does not do on its own — `closeOnBackdrop` in
    `kit/dialog.ts`, on the project menu's two dialogs as well so the vocabulary stays one.
11. **The owner's test, finding 1: the sentence moved, the sentence did not change.** The matrix's
    *Revoke, then that device signs in* row is frozen and still says exactly what it said — the
    sign-in fails with one of S1a's two existing sentences, and the Deploy run pinned which one
    ("We couldn't sign you in with a passkey. Use a magic link instead."). What the owner's test
    found is that it was said in a **11px grey helper-caption at the bottom of the card**
    (measured: `rgb(110, 106, 100)`, no icon, 656px down the viewport) with the mint "You've been
    signed out." banner still sitting above it. It is now the Kit's `error` Banner at the TOP of
    the card, and it replaces whatever banner was there — his own words, and the Kit already owns
    both halves, so no new vocabulary. The three OTHER captions in this product's passkey code are
    untouched: `/account`'s card keeps its own, and "This browser can't use passkeys." keeps this
    card's, because it is not an attempt's answer — it is shown before anything is pressed and
    explains the absent button it replaces, and a red alert on arrival would misdescribe a page
    whose magic link works perfectly. A routine call, recorded here rather than asked (CLAUDE.md).
    Worth saying that the move lands INSIDE the spine rather than beside it: `EXPERIENCE.md:296`
    already rules the feedback banner — "one icon, one plain sentence … danger is serious" — and
    `:285` scopes the helper-caption slot to a **greyed control showing its reason**, which is what
    "This browser can't use passkeys." is and what a failed attempt is not. Nothing was amended.
12. **Second review, 2026-09-07 — a keyboard submit closed the dialog, found by execution.** A
    form's implicit submission (Enter in the field) and a Space on Save both fire a click at
    `(0,0)` on the button; `closeOnBackdrop` read that point as outside the sheet and closed the
    dialog on the very submit it was meant to show the answer to. Chromium showed it in a
    standalone page (`target=save x=0 y=0 detail=0`), the deployed site showed it through the
    harness's new `rename-keyboard` record (`still open right after Enter = false` on the
    pre-patch build), and the patched build keeps the dialog open. Only a click whose target is
    the `<dialog>` itself is now the backdrop; every dialog in the app shares the fix.
13. **The matrix's "nothing sent" for an empty name is now true of the form, not only of the
    field's `maxLength`.** Emptiness is refused at the submit with the action's own sentence
    (`sign-in-form.tsx`'s `guard()` shape); the ceiling stays the server's on purpose, so the
    121-character control still reaches the action and proves ITS refusal (standing rule 2).
14. **The frozen *Always* row says the error envelope lands "in the helper-caption slot"; the Code
    Map, the matrix and the code put a failed rename or revoke in a Banner above the form and only
    the field's own refusal in the caption.** The three agree with `project-menu.tsx`'s split, which
    a review had to add there; the *Always* row is the odd one out and is read as "the field's
    sentence in the field's slot". Recorded, not amended — the block is frozen.
15. **GoTrue's rate limit on `/passkeys/authentication/options` is a rolling window of roughly
    thirty calls, not a call number.** The Deploy run saw 429 on call 12 of 30; this review's
    harness burst of 30 saw thirty 200s and a 60-call burst right after saw 429 on call 4; the
    harness now bursts 60 and saw 429 on call 31. DW-33 (1)'s closing line says so.

## Design Notes

**Routine calls made here, not the owner's** (each one line, as CLAUDE.md asks). *Drop `passkey_labels`:*
it is empty, unread, and its comment is a falsified claim the next reader would trust; one store for one
name, and the drop is one file plus a gate run. *Dialogs, not inline editing:* the frame draws a pencil,
not a field, and the product already owns a rename dialog extrapolated from S12c; inline editing would be a
second vocabulary. *A confirm on revoke, untyped:* a 28px bin beside a name is one mis-tap from cutting a
device off, and EXPERIENCE.md reserves the typed confirm for account and project delete. *One glyph:* see
Never. *The harness:* DW-32 names 2.2 as its owner because 2.2 edits the two files that carry the ceremony,
and R-82 wants the round trip re-run, not re-improvised.

**What is a hypothesis until the harness runs.** That `DELETE /passkeys/{id}` answers without a body and
the credential leaves `GET /passkeys` at once; that an assertion with a deleted credential is refused at
`verifyAuthentication` rather than at `startAuthentication`; that a revoke leaves the current session
alone; that `PATCH` on an unknown id is a 404 and not a 200. Each is executed, not reasoned, and the
result lands under `## Verification` and, where it changes a sentence, in the matrix through the change log.

**Why one dialog pair per card.** A `<dialog>` per row is N×2 modals in the DOM for no reason; the card
keeps `{ id, name }` of the row whose button was pressed and the two dialogs read it. `project-menu.tsx`
is one card, so it has one pair; this is the same shape at the card's altitude.

**Where a sentence is said is a decision, and there are now two answers on one card** (the Fix run).
An attempt's ANSWER goes to the card's banner slot: the user pressed something, is waiting, and a
12.5px line at the far end of the card is not where a waited-for answer belongs — the owner proved
that by missing it. A sentence that explains an ABSENCE stays where the absent thing was. The split is
the one the Kit already draws, and it is why `NO_WEBAUTHN` did not move.

`// ponytail: one laptop glyph; a per-row glyph the day a device type is stored` ·
`// ponytail: 3s race on list(); a real AbortSignal if the library ever exposes one`
## Verification

Run by the Dev run on the real infrastructure (R-82) on **2026-09-07**. Every key was read into a
command's environment by name and never printed; keys are recorded below by variable name only.

**What ran at Dev, and what it returned**

- `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH && pnpm check` — **GREEN**.
  *(The spec drafted this as `cd apps/web && pnpm check`; `check` is the workspace root's script —
  `lint && typecheck && test` across every package — so it is run from the repository root. See the
  change log.)* `apps/web`: **111 tests, 111 pass, 0 fail**, including the three this story adds —
  `passkeyNameSchema: trimmed, 1 to PASSKEY_NAME_MAX, one sentence for both failures`, `the hint
  quotes the limit, and the limit is GoTrue's own 120`, and `the shared dialog sheet keeps the
  scrim, the shadow and the centring margin`.
- `pnpm build` — **GREEN**. `✓ Compiled successfully`, TypeScript finished, the six static pages
  generated, `/app/account` still `ƒ` (server-rendered on demand).
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, every `rls.sql` assertion `PASS`.
- **THE GATE'S CONTROL, and it held.** The same command with
  `supabase/migrations/20260907120000_drop_passkey_labels.sql` moved out of the way — **exit 1**,
  `SCHEMA DRIFT`, and the diff it printed names the table:
  `+ CREATE TABLE public.passkey_labels (user_id uuid NOT NULL, credential_id text NOT NULL, …)`.
  So the green run above is the gate seeing the drop, not the gate seeing nothing (standing rule 2).
- `python3 tools/probe/run-verify-passkeys.py --check` — against the **real Supabase project**
  (keys `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`) — **exit 0**:
  `users before: 4` · fixture user created · `playwright: resolved` · `axe-core: resolved` ·
  `PASS admin round trip: create, read back (200)` ·
  `PASS GET /admin/users/{id}/passkeys answers 200 (empty for a new user)` ·
  `fixture user deleted (HTTP 200); users after: 4`. The Admin-API count returned to where it
  started, so the run leaked no user.
- **Both switches read ON on the live project**, which is why the card renders at all:
  `GET /auth/v1/settings` → `passkeys_enabled = True`, and
  `GET /rest/v1/feature_flags?select=key,enabled` → `[{'key': 'ghostpro_preview_probe', 'enabled':
  False}, {'key': 'passkeys', 'enabled': True}]`.
- **axe-core 4.12.1 over `/account`, WCAG 2.1 AA, at 1440 and at 390** — a real signed-in session
  against the **production Supabase**, entered through a real
  `POST /auth/v1/admin/generate_link` magic link redeemed at `/app/auth/confirm`, fixture user
  deleted afterwards. **1440: 0 violations, 21 passes, no horizontal scroll, the Passkeys card
  present. 390: 0 violations, 21 passes, no horizontal scroll, the Passkeys card present.**
- **axe-core over BOTH DIALOGS OPEN, on the same real session.** The two `<dialog>`s are in the
  DOM whether or not the list has a row, so their markup and their focus contract are provable at
  Dev; only the row-derived text (the field's current name, the name inside the confirm's
  sentence) is empty here, and the Deploy run fills it. Opened one at a time by `showModal()`:
  **"Rename passkey" — focus on `Cancel`, 0 violations, 14 passes.**
  **"Remove this passkey?" — focus on `Cancel`, 0 violations, 12 passes.**
  Both headings are the ones the matrix names, and both confirm EXPERIENCE.md § Destructive
  confirms: the confirm does not open on its own destructive action.
- `python3 tools/doc-audit.py --check` — first run `FAIL STALE` (its sub-tools regenerate on the
  first failure, as documented), second run **`documentation gate: PASS (0 warning(s))`**.

**What the Dev run could NOT do, why, and where it moved to**

The two dialog states, the frame measurement and the whole round trip need a **real passkey row**;
a row needs a real WebAuthn registration; and **GoTrue's registration options carry
`rp.id = inflozo.com`** — read off the wire on 2026-09-07, not assumed. WebAuthn refuses an `rp.id`
that is not a registrable suffix of the page's origin, so **no localhost origin can ever register a
passkey against this project.** Chrome's own words, captured from the running page:

> `SecurityError: The relying party ID is not a registrable domain suffix of, nor equal to the
> current domain.`

Three ways round it were executed and all three failed, so this is a finding rather than a shrug:
`--unsafely-treat-insecure-origin-as-secure` never produced a secure context;
`next dev --experimental-https` could not make a certificate on this machine (`mkcert` exited 1);
and a hand-rolled TLS proxy under the real hostname got as far as a **secure context and a
signed-in `/account`** before Chromium refused the handshake with `ERR_SSL_PROTOCOL_ERROR` (curl
over the same socket answered 200). One real defect was found and fixed on the way: behind that
proxy **every Server Action answered 403** until `x-forwarded-proto: https` was forwarded — Next
compares a request's `Origin` against the forwarded protocol and host.

**The deployed site is therefore the only place these can run, and that is where the harness puts
them.** `tools/probe/run-verify-passkeys.py` (no flag) runs at Deploy against `app.inflozo.com` and
carries every one: `register` · `auto-name` · `frame` (the pencil and the bin **measured** — 28×28,
radius 8, 13px glyph, and the hover fills) · `rename` (read back off
`GET /admin/users/{id}/passkeys`, never out of the DOM) · `rename-control` (121 characters, which
the server must refuse — the run FAILS if it does not) · `duplicate` (DW-32 (4)) · `revoke-focus` ·
`revoke` · `revoked-signin` · `magic-link` · `axe-card` / `axe-rename-open` / `axe-confirm-open` ·
`ratelimit` (DW-33 (1)).

**The Deploy run's output is below, under its own heading.** All four were hypotheses until then
(standing rule 1): GoTrue does populate `excludeCredentials` on a second registration (refused); a
revoked credential at sign-in produces the second of S1a's two sentences, "We couldn't sign you in
with a passkey. Use a magic link instead."; GoTrue does rate-limit
`/passkeys/authentication/options` (429 on call 12 of 30); and the frame measurement matches the
tokens exactly, once the harness itself was fixed to read the hover fill after its 160ms transition
settles rather than mid-animation.

**Review run, 2026-09-07 (R-82), on the real infrastructure** — every command by key name, none printed.

- `pnpm check` — **GREEN**, `apps/web`: **115 tests, 115 pass** (the review added `passkeyIdSchema`,
  `withTimeout` ×2 and the project-menu lift test). `pnpm --filter web build` — **GREEN**,
  `/app/account` still `ƒ`. `bash supabase/tests/run-rls-gate.sh` — **exit 0**; its control (the drop
  migration moved aside) — **exit 1, `SCHEMA DRIFT` naming `passkey_labels`**, file restored, tree clean.
- `python3 tools/probe/run-verify-passkeys.py --check` — **exit 0** before and after the review's patches;
  `users before: 4 … users after: 4`.
- **GoTrue's hypotheses, executed without a browser** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`; a fixture user minted by `generate_link`, redeemed at `POST /auth/v1/verify`,
  deleted afterwards, count 4 → 4): `PATCH /passkeys/<random uuid>` → **404**
  `validation_failed "Passkey not found"`; `DELETE /passkeys/<random uuid>` → **404**, same body;
  `PATCH` with a 121-character `friendly_name` → **400** `"friendly_name must be 120 characters or less"`
  (so the ceiling is the platform's, executed); the session survived both failures (`GET /user` → 200).
  **Negative control held:** the same `PATCH` and `DELETE` with the publishable key only → **401**
  `no_authorization`. Whether GoTrue answers 404 or 403 for ANOTHER user's real id still needs two users
  with passkeys — the Deploy run's.
- **Two hypotheses the harness itself rested on, falsified by execution and fixed** (change log 7):
  `generate_link` twice for one user → the first `token_hash` answered **`303 /sign-in?error=link`** at the
  deployed confirm route and the second `303 /`; Playwright `fill` of 121 characters into a
  `maxlength=120` field → **120** in the field (`$eval` setting `.value` → 121).
- Both switches still ON: `passkeys_enabled = True`; `feature_flags.passkeys = true`. `passkey_labels`
  still exists in production (`GET /rest/v1/passkey_labels?limit=1` → 200 `[]`), as expected before Deploy.
  `https://app.inflozo.com/account` signed out → **307** to `/sign-in`; the deployed site is pre-Deploy for
  this story, so the pencil and the bin were not looked for there.

**Second review, 2026-09-07 (R-82), after the Fix run — on the real infrastructure**, every key by name.

- **Which build is live:** `GET https://api.vercel.com/v6/deployments?limit=5` (`VERCEL_TOKEN`) — newest
  production deployment `READY` at commit `610cf15f`, the Fix commit. The deployed site is therefore the
  Fix run's build and PRE-dates this review's patches.
- `pnpm check` — **GREEN**, `apps/web`: **118 tests, 118 pass** before the patches and after them (the
  review widened two existing tests rather than adding files). `pnpm --filter web build` — **GREEN**,
  `/app/account` and `/app/sign-in` both `ƒ`. `bash supabase/tests/run-rls-gate.sh` — **exit 0, 72 PASS**
  (the Real-infra layer; no SQL changed).
- **The regex control:** the test's else-branch capture, run against a copy of `sign-in-form.tsx` with
  "You've been signed out." hoisted above the passkey ternary — the OLD regex still found the words
  (green for a stacked banner); the anchored regex does not. A test that cannot fail is not a test.
- **The keyboard defect, executed three ways.** (1) A standalone `<dialog>` in Chromium: Enter in the
  field and Space on Save each fire `click target=save x=0 y=0 detail=0 outside=true`; a real mouse
  click inside reads `detail=1 outside=false`. (2) `python3 tools/probe/run-verify-passkeys.py` against
  the deployed pre-patch `app.inflozo.com` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`) — **`RESULT: all steps passed`, `users before: 4 … users after: 4`**, with
  the new records: `rename-keyboard: the rename dialog is still open right after Enter = false` (the
  defect, on production), `revoked-signin … captions under the button still saying it=0`,
  `ratelimit: the first status ≠ 200 was 429 on call 31 of 60`. (3) The PATCHED build as `next start
  -p 3140` with the three keys, a real session through `generate_link` redeemed at the local confirm
  route, fixture user created and deleted (200/200): Enter in the rename field → **dialog still open
  right after, and still open once the server answered** (the empty-id refusal in its Banner); a
  blank name → **0 POSTs**, the field said "Give it a name — up to 120 characters."; a mouse click on
  the backdrop of a freshly opened dialog → **closed**, the event logged as `target: DIALOG, self:
  true, x: 5, y: 5`. One probe run saw a backdrop click about 3.5s after a refused submit reach nothing
  at all while a later, slower run saw the same click close the dialog; not reproduced and not
  attributed — noted, not claimed.
- **The rate-limit window, executed:** the harness's 30-burst → all 200; a 60-burst straight after →
  `{200: 5, 429: 55}`, first 429 on call 4; the widened harness → 429 on call 31 of 60.
- **Housekeeping found by execution:** three `next-server` processes from earlier runs of this story
  were still listening on 3100, 3121 and 3122 (cwd `apps/web`, 13–23h old); a local check that landed
  on one saw 500s and no banner. Killed; the review's own server on 3140 was stopped and its port
  confirmed closed.
- `python3 tools/doc-audit.py --check` — twice, second run **PASS**.

**Commands for the Deploy run**

- `env $(grep '^SUPABASE_DB_URL' tools/probe/.env | xargs) psql "$SUPABASE_DB_URL" -f supabase/migrations/20260907120000_drop_passkey_labels.sql`
  then `… -c "\dt public.passkey_labels"` -- expected: `Did not find any relation`
- `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH && python3 tools/probe/run-verify-passkeys.py`
  -- expected: every step PASS, the control refused, exit 0; paste the run

**Deploy run, 2026-09-07.**

**Deployment:** `dpl_7uXLXN7FYKDy4sqMQy38NxLFCVh5` (`inflozo-59graeoto-umangkagathara.vercel.app`), commit
`2e5fb9d0` — `readyState: READY`, read from `GET /v6/deployments` (`VERCEL_TOKEN`); CI's `check` and `rls`
jobs both `success` for that commit (`GITHUB_TOKEN`, read-only), so `deploy` ran and this is the build
serving `app.inflozo.com` and `inflozo.com` (AD-26).

- **Migration applied by the owner**, no CLI or CI touching production (1.2's record): the owner ran
  `drop table public.passkey_labels;` in the Supabase SQL Editor. Confirmed dropped from this session —
  `GET /rest/v1/passkey_labels?limit=1` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`) went from **200 `[]`** at
  Review to **404** now; PostgREST has no route left for a table that no longer exists.
- `python3 tools/probe/run-verify-passkeys.py` (no flag), against the deployed `app.inflozo.com`, real
  Supabase project (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`) —
  **first run: RESULT: FAILED.** `users before: 4` … `users after: 4` (no leak); every step passed except
  `frame`, which measured both buttons' hover fill as `rgba(0, 0, 0, 0)` against the tokens' `paper` /
  `dangerTint`. **This was the harness, not the product**, found by execution: `globals.css` sets
  `--default-transition-duration: var(--duration-fast)` = **160ms**, and the harness read
  `getComputedStyle(...).backgroundColor` immediately after `el.hover()` — at the transition's start,
  not its end, which is a transparent background animating toward the fill rather than the fill itself.
  Fixed in `tools/probe/run-verify-passkeys.py`'s `measure()`: a 220ms wait (past the 160ms duration)
  between `hover()` and the read.
- **Second run, after the fix: `RESULT: all steps passed`.** `users before: 4` … `fixture user deleted
  (HTTP 200); users after: 4` (no leak, control held — standing rule 2).
  - `signed-in`, `register` (id is a UUID) — PASS.
  - `frame` — **PASS**: pencil `28×28, radius 8px, glyph 13, colour rgb(110, 106, 100), hover
    rgb(247, 245, 242)`; bin `28×28, radius 8px, glyph 13, colour rgb(229, 72, 77), hover
    rgb(253, 236, 236)` — both match the tokens (`inkSoft`/`paper`, `danger`/`dangerTint`) exactly.
  - `axe-card`, `axe-rename-open`, `axe-confirm-open` — zero violations at WCAG 2.1 AA, each.
  - `rename` — `friendly_name` off `GET /admin/users/{id}/passkeys` reads back `"Harness MacBook"`.
  - `rename-control` — 121 characters sent; dialog stayed open; the field said "Give it a name — up to
    120 characters."; the name on the wire was unchanged.
  - `duplicate` (**DW-32 (4), now answered**) — REFUSED: a second `create()` on the same virtual
    authenticator was rejected and the card showed "This device already has a passkey for Inflozo."
    **GoTrue does populate `excludeCredentials`**; `ALREADY_HERE` in `passkeys-card.tsx` is live code.
  - `revoke-focus` — focus on Cancel. `revoke` — the id came off the wire, `GET /passkeys` list dropped
    to 0, the same session still rendered `/account` (200) — the current session survives a revoke.
  - `revoked-signin` — the authenticator still held the deleted credential; the sign-in attempt stayed
    on `/sign-in` and showed **"We couldn't sign you in with a passkey. Use a magic link instead."**
    (the second of S1a's two sentences, resolving the matrix's open question).
  - `magic-link` — the magic link still signed in, landing on `/account` (200).
  - `ratelimit` (**DW-33 (1), now answered**) — a burst of 30 `startPasskeySignIn`-shaped posts to
    `/auth/v1/passkeys/authentication/options` got its first non-200 as **429 on call 12 of 30**.
    **GoTrue does rate-limit this endpoint on its own.**
- `deferred-work.md` — DW-32 (4) and DW-33 (1) closed on the lines above; DW-32 (1) and (2) stay open
  (unrelated to this run — the kill-switch curl and the real AAGUID fixture); DW-33 as a whole is now
  closed.

**Second deploy run, 2026-09-07, after the Fix run and second review.** No schema change this round —
the second review's own record says so, and `passkey_labels` was already dropped from production at
the first Deploy run above. Nothing for the owner to apply by hand.

- `git push` landed `3627a7bf` on `main`. CI (`GET /repos/Inflozo/inflozo/actions/runs?head_sha=…`,
  `GITHUB_TOKEN`, read-only) — run `34085153825`, all three jobs `success`: `check`, `rls`, `deploy`.
- **Deployment:** `dpl_3RSZCamfXcmBoQvpxz4nVJrTowpd` (`inflozo-prp7qw519-umangkagathara.vercel.app`),
  commit `3627a7bf` — `readyState: READY` (`GET /v13/deployments/{id}`, `VERCEL_TOKEN`), `target:
  production`, aliased to `inflozo.com`, `app.inflozo.com` and `www.inflozo.com` — this is the build
  now serving both domains (AD-26).

This is the build the owner tests next: the keyboard-submit fix (Enter in the rename field or Space on
Save no longer closes the dialog mid-save), the anchored stacking-banner fix and the empty-name-at-submit
guard are all live at `app.inflozo.com/account` and `/sign-in`, alongside the Fix run's banner change below.

### The Fix run (2026-09-07)

The owner's finding is a UI change on the SIGN-IN card, so the proof is that card rendered by a **real
production build talking to the real Supabase project** — both switches on, as production has them — and
driven in real Chromium. No mocks (R-82). Keys read by name from `tools/probe/.env` (`SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`); none printed.

**How the failure is produced without a device, and it is the real one.** GoTrue's authentication options
carry `rp.id = inflozo.com`, so on `localhost` the browser refuses the assertion with a `SecurityError`
before any OS sheet — which is `passkey-button.tsx`'s generic branch and therefore *exactly* the sentence
the owner named. The server action really ran (`POST` → 200 off the real project) and the browser really
refused: `console.error` recorded `passkey: sign-in threw {name: SecurityError}`. Nothing is stubbed.

- `pnpm check` (`eslint .` · `tsc --noEmit` · `node --test` across the workspace) — **green, exit 0**.
  `apps/web`: **118 tests, 118 pass, 0 fail** — 115 before, plus this run's three.
- `pnpm --filter web build` — **green**, `✓ Compiled successfully`; `/app/sign-in` still `ƒ`. Started as
  `next start -p 3112` with the three keys; `curl … /app/sign-in | grep -c 'Sign in with a passkey'` →
  **1**, so the build is reading the live project and both switches are still on.
- **The banner, measured off the running page** (`/app/sign-in?signed-out=1`, so the owner's own
  reference banner is on the card first — mint `rgb(228, 245, 238)`, 12.5px):

  | | measured | the token, read out of `globals.css` |
  |---|---|---|
  | `role` | `alert` | (the caption was `status`) |
  | background | `rgb(253, 236, 236)` | `danger-tint` `#FDECEC` ✔ |
  | words | `rgb(196, 56, 60)` | `danger-text` `#C4383C` ✔ |
  | hairline | `rgb(245, 198, 201)` | `danger-line` `#F5C6C9` ✔ |
  | icon | `rgb(229, 72, 77)`, 14×14 | `danger` `#E5484D` ✔ (`XCircleSolid`) |
  | size · radius | 12.5px · 10px | the same as his reference banner |
  | position | **first drawn child of the card** | the top, where he asked for it |

  The sentence in it: **"We couldn't sign you in with a passkey. Use a magic link instead."** — one
  `role="alert"` in the card and no other. "You've been signed out." is **gone** (count 0): it was
  replaced, not stacked. `#passkey-caption` is **absent** and no `p.text-helper-caption` remains.
- **THE CONTROL, and it held** (standing rule 2). The same script, against a **build of the pre-Fix
  files** (`git checkout` of the two, rebuilt, `next start -p 3113`): `form [role="alert"]` never
  appeared — **timeout after 30s, RESULT: FAILED**. What that build showed instead, measured:
  `P`, `role="status"`, **`font-size: 11px`**, `color: rgb(110, 106, 100)` (`ink-soft`), **no icon**,
  transparent, **656px down the viewport** — with "You've been signed out." **still on the card above
  it**. That is the owner's finding, in numbers, and it is what changed.
- `node --test passkey-banner.test.ts` — **3 pass**. Its own control: the same three tests against the
  pre-Fix files — **3 fail**. A test that cannot fail is not a test.
- **axe-core 4.12.1, WCAG 2.1 AA, over the sign-in card WITH THE RED BANNER SHOWN** — **1440: 0
  violations, 24 passes, no horizontal scroll. 390: 0 violations, 24 passes, no horizontal scroll.**
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, 72 `PASS` assertions. No SQL changed in this run;
  it is re-run because `## Verification` is refreshed as a whole.
- `python3 tools/probe/run-verify-passkeys.py --check` — against the **real Supabase project** —
  **exit 0**: `users before: 4` … `PASS admin round trip` · `PASS GET /admin/users/{id}/passkeys` ·
  `fixture user deleted (HTTP 200); users after: 4`. No user leaked.
- `python3 tools/doc-audit.py --check` — **PASS**.

**The harness's `revoked-signin` step changed with the product, and had to.** It read `page.locator('p')`,
which would have passed for the very caption the finding asks to be replaced — a control that does not
control. It now locates `[role="alert"]`, requires the magic-link sentence inside it, and asserts the
banner's background against the `danger-tint` token and the presence of its icon. It runs at Deploy.

**One thing this run found that is NOT this story's, executed rather than assumed.** Holding the card in
**S1c** (the frame's own state: the whole card's contents at `opacity: 0.4` while the OS sheet is up —
confirmed `0.4` on the running page) makes axe report **1 `color-contrast` violation over 9 nodes,
serious** — the headline, the label, the field, the sentence, the banner: everything, because everything
is at 40%. S1c is Story 2.1's and it is drawn from the frame (R-74); nothing in this Fix touches it, and
the state is transient and `pointer-events-none`. It is recorded as **DW-37** rather than fixed here.

**What is still the Deploy run's.** The round trip on `app.inflozo.com` — and `revoked-signin` in
particular, which now proves the banner on the deployed site through a genuinely revoked credential
rather than through a `SecurityError` on localhost.

## Owner's manual test

On the live site, after the Deploy run. You need at least one passkey from Story 2.1; two is better
(Mac and phone).

1. **URL:** https://app.inflozo.com/account · **Screen:** Account & Billing · **Do:** look at the Passkeys
   card · **See:** at the right end of every passkey row, a small grey pencil and a small red bin. Hover
   each: the pencil's background goes light grey, the bin's goes pale red.
2. **URL:** the same · **Do:** press the pencil on your Mac's passkey; a window "Rename passkey" opens with
   the current name in a field; type `My MacBook` and press **Save** · **See:** the window closes and the
   row now reads "My MacBook" with the same "added …" date under it.
3. **URL:** the same · **Do:** press the pencil again, delete everything in the field, press **Save** ·
   **See:** the window stays open and under the field: "Give it a name — up to 120 characters." Press
   **Cancel**; the name is unchanged.
4. **URL:** the same, on your phone if you have a second passkey · **Do:** press the red bin on the
   phone's passkey · **See:** a window "Remove this passkey?" with the bin in a pale red disc, one
   sentence saying that device will no longer sign you in and you can add it again later, and two
   buttons: **Cancel** and **Remove passkey**. Press **Cancel** first: nothing happens. Press the bin
   again, then **Remove passkey** · **See:** the window closes and the row is gone. You are still signed in.
5. **URL:** https://app.inflozo.com/sign-in on the phone whose passkey you just removed · **Do:** avatar →
   Sign out, then press **Sign in with a passkey** and approve Face ID · **See:** it does not sign you in.
   **This is the one you asked to be changed.** At the **top of the card**, in the same place and the same
   shape as the "You've been signed out." message but **red, with a red error icon**, one sentence:
   "We couldn't sign you in with a passkey. Use a magic link instead." (On a device that never had a
   passkey it says the other sentence — "No passkey on this device yet — sign in with a magic link, then
   add one under Account settings." — in the same red message.) The green "You've been signed out." message
   you arrived with is **replaced** by it, not pushed down. Nothing small and grey is left at the bottom of
   the card. The magic link works as always. Add the phone's passkey again from Account settings if you
   want it back.
6. **URL:** https://app.inflozo.com/account · **Do:** press the bin on your last remaining passkey and
   remove it · **See:** the card shows only "Add a passkey". You are still signed in, and the magic link
   is the way in until you add one again. (Add it back afterwards.)

## Owner's test findings

Tested on app.inflozo.com on 2026-09-07. One finding.

1. **The passkey sign-in failure message is too small and easy to miss.** The message "We couldn't
   sign you in with a passkey. Use a magic link instead." is small and easy to miss. Make it like the
   "You have been signed out" message at the top of the sign-in screen, but in red, with an error
   icon. If there is already a message showing at the top, replace it with the new one.

**Fixed, 2026-09-07 (the Fix run).** You were right about the size: measured on a real build of the code
you tested, that sentence was **11px** grey text with **no icon**, sitting **656px down the page** at the
very bottom of the card, while the green "You've been signed out." message stayed above it. It is now the
same message component as that green one — same 12.5px size, same rounded box, same icon slot — in red:
the `danger-tint` fill, the `danger-line` hairline, `danger-text` words and a red ✕ icon, at the **top of
the card**, and it **replaces** whichever message was already there rather than adding to it. It is also
now a `role="alert"`, so a screen reader announces it instead of leaving it to be noticed.

The same move applies to the other sentence a failed passkey sign-in can give ("No passkey on this device
yet…") and to any error the server sends back, because they are all answers to the same press. One
sentence deliberately did **not** move: "This browser can't use passkeys.", which appears on arrival on an
old browser and explains why the passkey button is missing — a red alert for that would overstate a page
whose magic link works perfectly. That was a routine call, not one for you.

Proved on a real build against the real Supabase project under `## Verification` → *The Fix run*, with a
control: the same measurement against a build of the OLD code fails, which is how the numbers above were
taken. It goes back through Review and Deploy, and then it is yours to test again — **step 5** of the
manual test above is the one to look at, and it now says exactly what you should see.

**Re-tested on app.inflozo.com, 2026-09-07 — passed.** No further findings.
