---
title: 'Story 2.2 — See, rename and revoke my passkeys'
type: 'feature'
created: '2026-09-07'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
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
- `apps/web/app/(app)/app/sign-in/passkey-button.tsx` · `sign-in/actions.ts` -- read-only: the revoked-credential path lands on their existing captions; nothing to add
- `EXPERIENCE.md:131,298,482-486` · `epics.md:757-770` · PRD FR-A3 (`prd.md:182`) · `auth-js/dist/module/lib/types.d.ts:2404-2447` -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/components/kit/dialog.ts` + `project-menu.tsx` -- lift `sheet`, `title`, `openOnCancel` -- one dialog vocabulary, no second copy
- [ ] `apps/web/app/(app)/app/(authed)/account/passkey-name-rule.ts` + `apps/web/passkey-name-rule.test.ts` -- the schema and `PASSKEY_NAME_MAX`; cases: trims, empty, 120 ok, 121 refused -- the boundary, under `node --test`
- [ ] `apps/web/app/(app)/app/(authed)/account/actions.ts` -- `renamePasskey`, `revokePasskey`, the three messages -- FR-A3's two verbs
- [ ] `apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx` -- the trailing pair, the two dialogs, the header comment -- S12a
- [ ] `apps/web/app/(app)/app/(authed)/account/page.tsx` -- the 3s race in `listPasskeys()` -- DW-33 (2)
- [ ] `supabase/migrations/20260907120000_drop_passkey_labels.sql` + `SCHEMA.sql` -- drop the table; `bash supabase/tests/run-rls-gate.sh` green -- DW-30's fate
- [ ] `tools/probe/run-verify-passkeys.py` + its `doc-audit.py` row -- the harness -- DW-32 (3)(4), DW-33 (1), and this story's own round trip
- [ ] `deferred-work.md` -- close DW-30, DW-32 (3)(4), DW-33; say what stays open -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result

**Acceptance Criteria:**
- Given a signed-in user with passkeys on `/account` at 1440 and at 390, when the card renders, then every row ends in the pencil and the bin and **matches the frame** (`S12 Billing.dc.html` S12a `:90-91`: 28×28, radius 8, 13px glyphs, the frame's hover fills), the laptop glyph on every row, the plan column and Change email still absent
- Given the pencil pressed, when a valid name is saved, then `GET /passkeys` carries it as `friendly_name` and the row shows it after the re-render
- Given the bin pressed, when the confirm opens, then focus is on Cancel; when **Remove passkey** is pressed, then `GET /passkeys` no longer lists that id, the row is gone, and the same session still renders `/account`
- Given a credential revoked, when that authenticator is used on `/sign-in`, then the assertion is refused and the existing sentence shows; the magic link still signs in
- Given either switch off, when either action is posted, then `passkeys_off`; given no session, then the sign-in redirect
- Given the new migration applied, when `run-rls-gate.sh` runs, then it is green and `passkey_labels` exists in neither database
- Given `pnpm check`, `pnpm build`, `node --test` and axe-core on `/account` with both dialogs open in turn, then all green and zero violations

## Spec Change Log

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

`// ponytail: one laptop glyph; a per-row glyph the day a device type is stored` ·
`// ponytail: 3s race on list(); a real AbortSignal if the library ever exposes one`

## Verification

Run by the Dev run on the real infrastructure (R-82); every key read into a command's environment by name,
never printed. Fill in every result.

**Commands:**
- `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH; cd apps/web && pnpm check && pnpm build && pnpm test` -- expected: green; `passkey-name-rule.test.ts` runs its four cases
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0; then, as the control, run it once with the migration file renamed away -- expected: `SCHEMA DRIFT` naming `passkey_labels` (the gate sees the drop)
- `env $(grep '^SUPABASE_DB_URL' tools/probe/.env | xargs) psql "$SUPABASE_DB_URL" -f supabase/migrations/20260907120000_drop_passkey_labels.sql` (Deploy run) then `… -c "\dt public.passkey_labels"` -- expected: `Did not find any relation`
- `env $(grep '^SUPABASE_\|^PASSKEY_TEST_' tools/probe/.env | xargs) python3 tools/probe/run-verify-passkeys.py` (Deploy run, against app.inflozo.com) -- expected: every step PASS, the control refused, exit 0; paste the run
- `python3 tools/doc-audit.py --check` twice -- expected: green (the new tool has its row)
- axe-core 4.12.1 over `/account` — closed, rename open, confirm open -- expected: 0 violations each; a Tab walk lands on Cancel first in the confirm

**Manual checks (if no CLI):**
- `/account` at 1440 and 390 beside `S12 Billing.dc.html` S12a: the trailing pair's size, radius, glyph size and hover fills read off the frame

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
   Under the button, one of two sentences: "No passkey on this device yet — sign in with a magic link, then
   add one under Account settings." or "We couldn't sign you in with a passkey. Use a magic link instead."
   Either is right; which one appears is written down by the Dev run. The magic link works as always. Add the phone's passkey again from Account settings if you
   want it back.
6. **URL:** https://app.inflozo.com/account · **Do:** press the bin on your last remaining passkey and
   remove it · **See:** the card shows only "Add a passkey". You are still signed in, and the magic link
   is the way in until you add one again. (Add it back afterwards.)
