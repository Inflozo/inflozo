---
title: 'Story 5.8 — Undo, redo, and local-first persistence'
type: 'feature'
created: '2026-09-19'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story the editor **keeps your work**. Everything you do — typing, changing a control,
reordering, hiding, deleting a section — is written to your own browser the instant you do it, and sent up
to the server a few minutes later, when you close the tab, or the moment you press ⌘S. Close the laptop,
come back tomorrow, and your page is exactly where you left it.

It also gives you a **way back**. Two small arrows appear at the right of the top bar: the left one undoes
your last change, the right one puts it back. It remembers your last hundred changes, and it remembers
them **through a reload** — so if you delete the wrong section, go and make tea, come back and reload the
page, the arrow still brings it back with everything you had typed into it.

A small dot and a word beside your project's name tell you the truth at all times: **"Saved on this
device"** while you work, **"Syncing"** while it is going up, **"Synced"** when it is safe on the server,
and **"Retrying · 12s"** with a calm explanation if your connection drops. It never says your work is safe
when it is not.

## Intent

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

**Problem:** Nothing the editor does survives anything. Six stories of editing — typing, controls, dark
overrides, reordering, hiding, deleting — live in one React `useState` and are gone on a reload, a crash, or
a stray ⌘R (`editor.tsx:233-234`, "Edits live here for the session"). Nothing writes `project_templates`, there
is no undo of any kind, and the top bar's "Saved" and its undo/redo arrows are drawn in S4a and absent.

**Approach:** One IndexedDB store per project holds **the document and the journal**, written off the
interaction path on every `commit()`. The journal **is** the undo stack — one gesture is one transaction is
one undo step is one edit (AD-15, AD-16) — so undo surviving a reload costs nothing extra. A single
`security definer` RPC upserts the touched docs and advances `projects.revision` in one transaction, called
from one route handler on the 3-minute timer, on tab close and on ⌘S. On hydrate, one comparison decides
everything: the cloud revision equals the local `base_revision` → keep both the doc and the journal; it
differs → the cloud replaces the doc and the journal is cleared.

## Boundaries & Constraints

**Always:**
- **The local write never blocks the interaction path** (FR-D10, NFR-1). `commit()` returns before the
  IndexedDB transaction settles; nothing awaits it, and a failed write changes the indicator, never the edit.
- **One gesture = one transaction = one undo step = one edit** (AD-16). `commit()` is the only door to the
  session's docs and therefore the only place a transaction is opened. A Variant Shuffle (5.11) and a Style
  Pack change (6.3) inherit this by going through the same door — there is nothing for them to add.
- **The journal record is `{ seq, txn, docKey, before, after }`** — the touched doc either side of the
  transaction. `addendum.md` §AD4 makes the record shape the Architect's ("the transaction id is
  load-bearing for the edit count and must survive any reshape"), and it does. See Design Notes for why
  before/after beats an inverse-op log here.
- **The hydrate comparison is `projects.revision` vs the local `base_revision`, and nothing else**
  (AD-15, `addendum.md` §AD1.1). Equal → doc kept, journal kept. Differs → doc replaced, journal cleared.
  No local record → the server's doc, an empty journal.
- **The canvas does not paint until the local store has answered.** A reload must never flash the cloud
  document over the local one.
- **The sync writes only the docs the journal names**, and `projects.revision` moves in the same
  transaction. A synthesized doc is never written — writing one would materialise an untouched canvas and
  break AD-22 — and the journal names only docs `commit()` touched, so this is true by construction.
- **The RPC is compare-and-set on `revision`.** A mismatch writes nothing and returns the current revision.
  `authenticated` has no UPDATE grant on `projects.revision` (`schema:1209-1212`), so the client cannot
  advance it and there is no second path to invent.
- **The indicator's labels are B6's five, exactly** (`prd.md:1335`, `EXPERIENCE.md:314`) — one dot, one
  label, **never a spinner**. The Kit component already exists and its five-member union is the compile
  error that enforces it (`components/kit/persistence-indicator.tsx`).
- **`navigator.storage.persist()` is requested once per project mount**, and its answer is never shown:
  loss to eviction is a stated limitation, not a requirement (FR-D9).
- **The fallback is honest.** If IndexedDB is unavailable or a write fails, the editor switches to immediate
  per-change cloud sync and the indicator reads *"Syncing every change to the cloud"* — never a false
  "Saved on this device" (FR-D10).
- **An undo entry whose design the library no longer holds no-ops with a notice, never half-applying**
  (FR-D9). The whole restored doc is checked against the library before any of it is applied.
- **R-98 on every new pressable control:** Retry now and the autosave toggle swap their label and go
  `aria-disabled` + `aria-busy` while they work. `busy.test.ts` walks the tree and will say so.
- Every write goes through the **caller's own session** (`supabaseServer()`), so RLS decides what exists for
  them; another user's project id reaches zero rows rather than an error.

**Ask First:**
- Any **merge** of a local document with a differing cloud one. `addendum.md` §AD1.1 is explicit: no merge
  path exists in v1. A conflict is resolved by replacement, at hydrate, and by nothing else.
- Any second place a save state is displayed. One indicator (B6), one place (S4a's bar).
- Surfacing an **operation** count anywhere, in any form, including a log written for display (AD-16).
- Changing the 3-minute interval, the 100-edit depth or the retry backoff **as behaviour** rather than as
  the §AD4 defaults they are.

**Never:**
- **No ⌘Z / ⇧⌘Z here** unless Question 2 rules otherwise. The global keyboard map is Story 5.9's, entire —
  the same reason 5.6 built the sun and not `.`, and 5.7 the device track and not `1` `2` `3`. **⌘S is the
  exception and it is built here**, because it is not a map entry but a clause of AD-15's flush contract,
  and 5.8's own acceptance criteria name it.
- **No edit lock, no heartbeat, no takeover, no `edit_locks` write.** All of it is Story 5.17's. The
  takeover half of AD-15's journal-clearing rule (`lock_generation` advancing) therefore has nothing to read
  and is not built; the revision half is, and is reachable today.
- **No flush on lock release, deploy or export.** Those callers arrive with 5.17 and Epic 7; the flush
  function they will call is built here and exported.
- **No `parkedControls`.** The field does not exist in `doc-schema.ts` and its writer is Story 5.11. FR-D9's
  "restores the parked value alongside the design" is satisfied by construction — a journal entry restores
  the whole doc — and needs no code of its own.
- **No server-side doc migration.** FR-J14's maps run lazily on hydrate, on the client (AD-15).
- **No new spinner, anywhere.** Colour never carries the only signal: the dot always has its word.
- **No claim about what the browser will keep.** `persist()` is requested; its answer is not a promise.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| An edit | any `commit()` — typing, a control, a reorder, a hide, a delete | one transaction appended; indicator → *"Saved on this device"*; no await on the interaction path | a failed local write → fallback mode |
| The timer | 3 minutes since the last flush, unsynced entries exist | *"Syncing"* → RPC → *"Synced"* → after 4 s back to *"Saved on this device"* (B6's "fades to the resting label") | network failure → Retrying |
| The timer, nothing unsynced | no entries above the synced watermark | **no request at all**; the indicator does not move | N/A |
| ⌘S | any state, unsynced entries exist | an immediate flush, exactly as the timer's | as above |
| ⌘S, nothing unsynced | — | *"Synced"* for 4 s, then rest — the press is always acknowledged | N/A |
| Tab close | `visibilitychange` → `hidden`, unsynced entries exist | one `fetch(..., { keepalive: true })` to the sync route | nothing is shown — the tab is going |
| Sync fails | offline, or a 5xx | *"Retrying · {n}s"* counting down; B6's panel opens **only** here; backoff 5 s → 10 s → 20 s → 40 s → 60 s (capped) | the local doc is untouched; nothing is lost |
| Retry now | pressed in the panel | the backoff resets and the flush fires at once; the button says *"Retrying…"*, `aria-busy` | a further failure restarts the countdown |
| Another session wrote | RPC finds `revision <> base_revision` | **nothing is written**; the app's one dialog: this project was changed somewhere else, Reload / Not now. Reload → hydrate → doc replaced, journal cleared | Not now → the indicator rests at *"Saved on this device"*, which is true; the next flush asks again |
| Reload, same revision | local `base_revision` = `projects.revision` | the local doc wins, the journal survives, undo still reaches back 100 edits | N/A |
| Reload, differing revision | someone else synced | the cloud doc replaces the local one and **the journal is cleared** (AD-15) | N/A |
| First visit on a device | no local record for this project | the server's docs; an empty journal; `base_revision` = `projects.revision` | N/A |
| No IndexedDB | private mode, or `open` throws / is blocked | fallback: every `commit()` flushes immediately; indicator *"Syncing every change to the cloud"* permanently | a failed flush still shows Retrying |
| A local write fails mid-session | quota exceeded | the same fallback, from that moment; the indicator changes in the same task, never a stale "Saved on this device" | N/A |
| Undo | ≥ 1 entry, pointer not at the head | the touched doc is restored to the entry's `before`; the canvas repaints; politely announced | N/A |
| Redo | ≥ 1 undone entry | the entry's `after` is restored | N/A |
| An edit while undone > 0 | the user undoes twice then types | the undone tail is **discarded** and the new transaction appended — the ordinary editor rule | N/A |
| 101st edit | the journal holds 100 | the oldest entry is dropped; undo reaches back exactly 100 edits | N/A |
| Undo past a vanished design | a restored doc names a `designId` the library no longer holds | **nothing is applied**; a notice names the design; the pointer does not move | never half-applied |
| Undo across canvases | the last edit was on `post`, the user is on `home` | the doc is restored and the switcher's dot updates; the canvas shown does not change | N/A |
| Undo the last section off a synthesizable canvas | AD-22's round trip | `committed()` decides it exactly as a forward edit does — the default stack and its marker return | N/A |
| Autosave off | `profiles.autosave_enabled = false` | the **timer alone** stops. The local journal, tab close and ⌘S are unchanged (AD-15) | N/A |
| Turning autosave off | the Account toggle | the app's one dialog states what it costs, focus on Cancel; only a confirm writes | a failed write leaves the toggle where it was and says so |
| A 40-section canvas | the stress fixture | a `commit()` still returns without waiting on the write; no main-thread block over 5 s | slower is acceptable |
| Another user's project id | posted to the sync route | zero rows, the same answer as "no such project" | a refusal, never a leak |

</frozen-after-approval>

## Code Map

**The frames, read**
- `B Missing Surfaces.dc.html:1351-1388` — **B6 · PERSISTENCE, FIVE STATES**, the frame this story is built
  from. Five rows, each a 6px dot and a 12.5px label at 150px: *"Saved on this device"* (`#C9C2B8`, resting,
  soft ink) · *"Syncing"* (`#FF5941`, ink, 500) · *"Synced"* (`#1FA97A`, soft ink) · *"Retrying · 12s"*
  (`#C4383C`, ink, 500) · *"Syncing every change to the cloud"* (`#C9C2B8`, soft ink). Then the panel
  (`:1379-1386`): `#FDECEC`, 10px radius, 11/12 padding — *"Retrying, third attempt"* at 12px/600 `#8E2C30`,
  the reassurance at 11.5px, and two controls, **"Retry now"** (28px, white, `#F0CFD0` border) and
  **"Download a copy"** (Question 1). Its note: *"One indicator, five labels, one dot that changes colour —
  never a spinner… The expanded panel appears only on Retrying, and its first sentence is the reassurance
  rather than the error."*
- `S4 Editor.dc.html:32` — **where the indicator sits**: in the 48px bar, third item, directly after the
  project name, a 6px dot and a 12px label in `#6E6A64`.
- `S4 Editor.dc.html:41-43` — **the undo/redo pair**: two 28 × 28 buttons, `border-radius:8px`, `gap:2px`,
  hover `rgba(28,27,26,.05)`, 14px 1.5-weight strokes (`M9 14L4 9l5-5` + `M4 9h11a5 5 0 0 1 0 10h-3`,
  mirrored for redo), the unavailable one at `opacity:.35`. They sit between the device track and Ship it.
- `S12 Billing.dc.html` S12a's right column — the Account card the autosave toggle joins, extrapolated from
  the Email and Sessions cards beside it exactly as Sessions was (R-74).

**Two divergences from the frames, both recorded rather than guessed**
- **S4a draws the resting indicator as a GREEN dot and the word "Saved".** B6 governs the labels and the dot
  colours — `prd.md:1335` is explicit ("The persistence indicator's labels are the drawn ones … B6") and
  `EXPERIENCE.md:314` repeats it — so the resting state is a **grey** dot and *"Saved on this device"*, and
  "Saved" is never printed. Same shape as R-137: one frame governs the geometry, the other everything else.
- **B6's panel is drawn as a card in a catalogue, not as a popover.** In the bar it is anchored under the
  indicator; its ink, fill, radius, type and both controls are B6's verbatim (R-74's extrapolation rule).

**The normative mechanism**
- `prds/…/addendum.md:13-41` — §AD1 and §AD1.1: the op-log, ops vs edits, the flush list, autosave-off, and
  the three-row hydrate table. **Normative mechanism**, cited by FR-D9/FR-D10.
- `prds/…/addendum.md:59-72` — §AD4: IndexedDB, the record shape and the 100-edit depth are **defaults with
  rationale**, owned by the Architect. `base_revision`, the lock-generation test and one-transaction-per-gesture
  are explicitly **not** tunable.
- `architecture/…/ARCHITECTURE-SPINE.md:198-209` — AD-15 (journal = undo stack; the flush contract; lazy
  client-side doc migrations) and AD-16 (`unsynced_edits` is the only count).
- `prd.md:226-227` — FR-D9 and FR-D10 entire.

**What already exists and is reused, never rebuilt**
- `apps/web/components/kit/persistence-indicator.tsx` — **built by Story 1.3 from B6**. The five-label union
  is a compile error for any sixth; the `seconds` prop is the countdown. Mount it; do not touch it.
- `apps/web/app/…/[id]/(editor)/editor.tsx:319-326` — **`commit()`, the one door.** Every doc write in the
  editor already routes through it (`:567` a control, `:846` an operation, `:967` a state change), so the
  journal hooks exactly one function. It already resolves AD-22's round trip through `committed()`.
- `apps/web/lib/round-trip.ts` — `committed()`, `EMPTY_DOC`, `templatesOpen`. Importless-but-for-types, which
  is why `node --test` reaches it; the model for where this story's pure rules go.
- `apps/web/lib/device.ts` + `apps/web/editor.test.ts` — the standing precedent: pure rules in a `.ts` the
  test can import, the `.tsx` left untested (`node --test` strips types but cannot load a `.tsx`).
- `apps/web/app/…/[id]/settings/actions.ts` — the write pattern (caller's session, `revalidatePath`,
  `(previous, formData)` so a form drives it with scripts off). **`clearProjectDarkOverrides` closes DW-197
  here**: its doc-by-doc loop with no transaction and no revision check adopts the RPC this story defines.
- `apps/web/app/…/account/` — `page.tsx`, `actions.ts`, `sessions-card.tsx` (the extrapolated-card pattern),
  `loading.tsx`. The toggle's card follows `sessions-card.tsx` exactly.
- `apps/web/components/kit/toggle.tsx` (36 × 20, coral when on) · `kit/dialog.ts` (`sheet`, `title`,
  `openOnCancel`, `closeOnBackdrop` — the one 460px vocabulary) · `kit/banner.tsx` · `kit/button.tsx`
  (`IconButton`) · `kit/icons.tsx` (gains `Undo` and `Redo`).
- `apps/web/lib/editor.ts` — `SETTINGS` / `settingsPath` is the precedent for a **static sibling of
  `[template]`** that never reaches `canvasFromSegment` (R-131). `SYNC` / `syncPath` join it there.
- `supabase/migrations/20260907150000_account_deletion_window.sql:45-117` — the `security definer` RPC
  pattern, verbatim: `language plpgsql security definer set search_path = public`, keyed on `auth.uid()`,
  then `revoke execute … from public, anon` and `grant execute … to authenticated`.

**The database, read**
- `supabase/migrations/20260904120000_complete_schema.sql:231-232` — `projects.revision bigint not null
  default 0`, "the single monotonic revision every local doc carries as its base_revision".
- `:1292-1303` — `guard_revision()`, the trigger that makes it monotonic.
- `:1209-1212` — **`authenticated` is granted UPDATE on `projects` for eight columns and `revision` is not
  one of them.** This is why the sync is an RPC and not a client write.
- `:244-255` — `project_templates` and its `template_key_shape`. **The regex carries two backslashes
  (`\\.hbs`), so under `standard_conforming_strings = on` it refuses every `custom:` key** — executed on
  production, DW-193. `:267-269` — `project_template_prefs` carries the identical bug.
- `:118` — `profiles.autosave_enabled boolean not null default true`, "the toggle is per USER, not per
  device"; `:1232` — it is already owner-writable, so the toggle needs no grant.
- `:504` — `edit_locks.lock_generation`. Read for context only; **nothing here writes it** (5.17).
- `architecture/…/SCHEMA.sql:267,282` — the same constraint in the cumulative picture. It is **live**, not
  `record` (`INDEX.md:70`), and `supabase/tests/run-rls-gate.sh:98` diffs the database the migrations build
  against the one SCHEMA.sql builds — so the two change together or the gate goes red.
- `architecture/…/RLS-TEST.sql` — the gate that **aborts**. DW-193: "the migration's story should add one
  [a `custom:` insert], so the gate would have caught this."

**The harness**
- `tools/probe/run-verify-editor.cjs` — 60 steps today; 61 onward are this story's. Two throwaway accounts
  through the Auth Admin API, A seeded by `tools/probe/seed-editor-project.mjs`, magic-link sign-in
  (`:170-173`). **B exists and is the second-writer control.** Step 5's CSP session is the standing rule:
  every Epic 5 story that adds a gesture runs it inside that session and reads its zero afterwards.

**Deferred work this story is the named owner of**
- **DW-193** (high) — the `template_key_shape` fix on both tables. Its Schema phase.
- **DW-197** (medium) — the project-level Clear's missing transaction and revision check.
- **DW-198** (low, the Clear half) — a multi-canvas stored override is reachable without planting rows once
  saving exists, so step 53 (b) stops being a one-section proof.

## Tasks & Acceptance

**Execution — Schema phase first, alone, before any code that needs it (R-99):**
- [ ] `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql` -- new migration: drop and
      re-add `template_key_shape` on **both** `project_templates` and `project_template_prefs` with a single
      backslash; create `public.sync_project_doc(uuid, jsonb, bigint) returns bigint` as `security definer set
      search_path = public`, keyed on `auth.uid()`, compare-and-set on `revision`, upserting each key of the
      jsonb object and advancing `revision` in the one transaction; `revoke execute … from public, anon` and
      `grant execute … to authenticated` -- DW-193 and the only writer of `revision` there can be.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the same
      two changes in the cumulative picture -- the RLS gate diffs the two databases and refuses to run if
      they drift.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` and its
      `supabase/tests/` copy -- assert a `custom:custom-signup.hbs` key **inserts**, that the new function is
      executable by `authenticated` and not by `anon`, and that the RPC refuses a stale `base_revision` and
      another user's project -- byte-identical copies, `cmp -s` in the gate.
- [ ] Apply the migration by hand through `SUPABASE_DB_POOLER_URL`, then push `Story 5.8 - Schema - …` alone.

**Execution — Dev:**
- [ ] `apps/web/lib/journal.ts` -- new, pure and `node --test`-reachable: the journal's rules (`append`,
      `undo`, `redo`, the 100-edit trim, the undone-tail discard, `unsyncedEdits` as distinct transaction ids
      above the watermark, the docs a flush must send), the indicator's state machine and the retry backoff
      -- so every rule that can be got wrong is testable without a browser.
- [ ] `apps/web/lib/local-store.ts` -- new: the IndexedDB door. One database per user, two object stores
      (`meta`, `journal`), keyed by project id; open, read, append, trim, clear, and
      `navigator.storage.persist()`. **Every function fails soft** — a rejected open or a failed write
      resolves to `null` and the caller enters fallback mode.
- [ ] `apps/web/lib/editor.ts` -- add `SYNC` / `syncPath` beside `SETTINGS`, and keep `sync` out of
      `canvasFromSegment` -- R-131's static-sibling rule, applied a second time.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` -- new: POST, the caller's own session,
      the body parsed through `docSchema` per key before it is trusted, one `rpc('sync_project_doc', …)`,
      answering the new revision or a conflict -- one path for the timer, ⌘S and `keepalive` at tab close.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- add `revision` to `projectOf`'s
      select and to `EditorData` -- the hydrate comparison needs the cloud revision as server truth, exactly
      as 5.6 made `dark_enabled` server truth.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hook `commit()` to open a
      transaction and append; gate the first paint on the local read; add the hydrate comparison, the flush
      timer, `visibilitychange`, ⌘S, the undo/redo pair in the bar and the indicator beside the project name
      -- `commit()` is already the one door, so the journal hooks one function.
- [ ] `apps/web/components/editor/save-state.tsx` -- new: the Kit indicator wired to the state machine, and
      B6's Retrying panel anchored beneath it with its reassurance sentence and Retry now (R-98's busy
      label) -- the panel opens on Retrying and on nothing else.
- [ ] `apps/web/components/kit/icons.tsx` -- add `Undo` and `Redo` from `S4 Editor.dc.html:41-43` -- the
      arrows are two `IconButton`s inline in the bar and need no component of their own.
- [ ] `apps/web/app/(app)/app/(authed)/account/saving-card.tsx` and `account/actions.ts` and `account/page.tsx`
      -- the per-user autosave toggle, its confirm carrying the data-loss sentence with focus on Cancel, and
      the card rendered beside Sessions -- FR-D10's toggle, in the place `EXPERIENCE.md:702` puts it.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` -- move
      `clearProjectDarkOverrides` onto the same RPC -- **closes DW-197**: one transaction, one revision check,
      and one definition of what a guarded doc write is.
- [ ] `apps/web/journal.test.ts` -- new: the matrix's journal, indicator and backoff rows as unit tests,
      including the 100-edit trim, the undone-tail discard, the vanished-design refusal and `unsyncedEdits`.
- [ ] `apps/web/editor.test.ts` -- `sync` resolves as no canvas and collides with no canvas path -- the same
      three assertions `settings` carries.
- [ ] `tools/probe/run-verify-editor.cjs` -- steps 61+ inside step 5's CSP session: an edit survives a
      reload, undo reaches through it, the journal clears when account B writes and the revision moves, the
      indicator's four reachable labels, and the fallback with IndexedDB refused.

**Acceptance Criteria:**
- Given any edit in the editor, when it lands, then the interaction returns before the local write settles
  and the indicator reads *"Saved on this device"* (FR-D10, NFR-1).
- Given a section deleted with text typed into it, when the page is reloaded and undo pressed, then the
  section returns **with its text and every control value** (FR-D9's whole promise).
- Given a Variant Shuffle or a Style Pack change when those stories land, when it is undone, then **one**
  press undoes it however many operations it cost — because both go through `commit()` (AD-16).
- Given 100 edits, when the 101st lands, then undo still reaches back exactly 100 and no further.
- Given a reload whose cloud revision equals the local `base_revision`, when the editor hydrates, then the
  local doc and the journal both survive; given a differing revision, then the cloud doc replaces the local
  one and the journal is cleared (AD-15, `addendum.md` §AD1.1).
- Given autosave off, when three minutes pass, then nothing is sent — and ⌘S and tab close still flush.
- Given a browser with no IndexedDB, when the editor loads, then it syncs every change immediately and the
  indicator reads *"Syncing every change to the cloud"*, never *"Saved on this device"*.
- Given a failing connection, when a flush fails, then the indicator counts down and B6's panel opens —
  and it opens in no other state.
- Given the whole story, **no number of operations is displayed, stored in a heartbeat, or logged for
  display, anywhere** (AD-16).
- Given the finished story, when the top bar and the Retrying panel are compared with the frames, then the
  indicator **matches `B Missing Surfaces.dc.html` B6** — five labels, one dot, its four colours, no spinner,
  the panel only on Retrying — and the arrows **match `S4 Editor.dc.html` S4a** — 28 × 28, 8px radius, 2px
  apart, the unavailable one at `opacity:.35` — with the two divergences recorded in the Code Map and no
  others (R-74).

## Spec Change Log

## Design Notes

**Why `{ before, after }` and not an inverse-op log.** `addendum.md` §AD4 hands the record shape to the
Architect and keeps only the transaction id load-bearing. Three things decide it here. (1) The doc is small
and one transaction touches exactly one doc — `commit(written, touched)` already names it — so an entry is
one template's JSON, not the project's. (2) FR-D9 requires "**never half-applying**" when a design has
vanished from the library: with a whole-doc restore that is one check before one assignment, where an
inverse-op replay would have to be validated op by op and unwound on the third. (3) FR-D9 also requires the
**parked value restored alongside the design** — free, because the doc that comes back is the doc that was
there. An op-log would have to model parking explicitly, in a story where `parkedControls` does not yet
exist. The transaction id survives the reshape, which is what §AD4 protects.

**Why one RPC and not a route that writes.** `authenticated` has no UPDATE grant on `projects.revision`
(`schema:1209-1212`) — AD-31's deliberate choice, because a client that picks its own revision can start
above any legitimate one. So `revision` can only move inside a `security definer` function. Once there, the
upserts belong inside it too: one plpgsql body is one transaction, which is exactly what DW-197 found
missing from the Clear. The route handler exists only because `fetch(..., { keepalive: true })` at tab close
cannot call a Server Action.

**The indicator's machine, in full.** Five states and four transitions, and nothing else may drive it:

```
idle ── commit ────────────▶ "Saved on this device"   (grey)
  └──── flush starts ──────▶ "Syncing"                (coral)
          ├── ok ──────────▶ "Synced" (mint) ──4s──▶ "Saved on this device"
          └── fail ────────▶ "Retrying · {n}s" (danger) + B6's panel
no IndexedDB ─────────────▶ "Syncing every change to the cloud"  (grey, sticky)
```

B6's *"Fades to the resting label after a few seconds"* is the fourth transition, and the resting label is
*"Saved on this device"* — which stays true after a sync, because the local store is always written. It is
the weaker of the two truths, deliberately: the indicator's resting claim is the one that is always
verifiable on this device.

**Turning autosave off asks first.** It is the one toggle that removes a protection, and the warning has to
be read *before* the protection goes — so it uses the app's one dialog (`kit/dialog.ts`, 460px, focus on
Cancel, R-115/UX-DR14) rather than a banner that appears after the fact. Turning it back **on** asks
nothing. A routine judgement call, recorded here rather than put to the owner.

**A conflict mid-session.** `addendum.md` §AD1.1 resolves a differing revision at **lock acquisition**, and
there is no lock until 5.17 — but a second tab is reachable today. The smallest honest answer, inventing no
vocabulary: the RPC refuses, and the editor opens the app's one dialog offering a reload. A reload *is* a
hydrate, so it runs §AD1.1's second row exactly — doc replaced, journal cleared. Declining leaves the
indicator at *"Saved on this device"*, which is true, and the next flush asks again.

## Verification

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, **after** the Schema phase — the gate applies
  every migration to one database and SCHEMA.sql to another and diffs them, so it is the proof that the
  constraint fix and the RPC landed in both. It aborts rather than reporting.
- `pnpm check` -- expected: lint, typecheck and every package test green, including `journal.test.ts`,
  `editor.test.ts`'s `sync` assertions, `busy.test.ts` (Retry now and the toggle) and `tokens.test.ts` (no
  hex under `apps/web`).
- `node tools/probe/run-verify-editor.cjs` -- expected: every step PASS with step 5's CSP violation count
  still zero after the new gestures. A HARNESS ERROR with no FAIL is not a result — re-run.
- `pnpm --filter @inflozo/web build` -- expected: the route table gains `/app/projects/[id]/sync` and the
  two editor routes are unchanged.

**Real infrastructure (R-82) — the Review phase names what it hit:**
- **Supabase (production, `SUPABASE_DB_POOLER_URL`)** — the constraint fix executed: all three
  `custom:custom-*.hbs` keys insert where they were refused with `23514`, inside a rolled-back transaction,
  with `index` as the control that the probe could insert at all. DW-193's own probe, re-run for its close.
- **Supabase (production)** — the RPC executed as a real signed-in user: a correct `base_revision` writes
  and returns `revision + 1`; a stale one writes nothing and returns the current revision; another user's
  project id writes nothing. Zero rows left behind.
- **The deployed editor (`app.inflozo.com`)** — the journal surviving a reload, undo after it, and the
  cleared journal when account B advances the revision between two loads of account A.
- **Vercel** — the deployment READY at the Deploy commit, recorded by id.

**Manual checks:**
- `navigator.storage.persist()` is requested once and its answer is shown nowhere.
- The Retrying panel exists in no other state, and no spinner exists anywhere in the story.

## Owner's manual test

Run on the deployed site, on the **"Pilot sections"** project Story 5.1 seeded. **This is the first story
whose work you can leave and come back to** — so unlike every editor test before it, do *not* rush it in one
sitting. Step 6 asks you to close the tab on purpose.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the top bar, just after the project name. | — | A small **grey dot** and the words **"Saved on this device"**. Nothing is spinning. |
| 2 | same | Top bar, right | Look between the three device buttons and the right-hand end. | — | Two small **arrows**, one curving left and one curving right. Both are faded — there is nothing to undo yet. |
| 3 | same | Canvas, Home | Click a headline and type something into it. | type `Tuesday letters` over the headline | The left arrow **wakes up** the moment you stop typing. The words beside your project name still read "Saved on this device". |
| 4 | same | Top bar | Press the **left arrow** once. Then press the **right arrow** once. | — | Your headline goes back to what it was, then returns to `Tuesday letters`. One press each way — not one press per letter. |
| 5 | same | Canvas, Home | Click a whole section to select it, and delete it with the bin in the little pill. Then press the **left arrow**. | — | The section disappears, then comes **straight back** — in the same place, with everything you had typed into it. |
| 6 | same | Editor | Press **⌘S** (Ctrl+S on Windows). Watch the words beside your project name. | — | They change to **"Syncing"** with an orange dot, then **"Synced"** with a green one, then settle back to "Saved on this device" after a few seconds. |
| 7 | — | — | **Close the tab completely.** Make a cup of tea. Then open the URL in step 1 again. | — | Your `Tuesday letters` headline is **still there**. This is the whole story. |
| 8 | same | Top bar | Press the **left arrow** a few times. | — | It still undoes the changes you made **before** you closed the tab — the history survived too. |
| 9 | same | Canvas, Home | Make one small change. Now **switch your wifi off**, wait about three minutes, and watch the words beside your project name. | change any headline | They go to **"Retrying · 12s"** in red, counting down. A small pink panel opens underneath: *"Retrying, third attempt"* and *"Your work is safe on this device. Nothing is lost if you close the tab — we will send it when the connection returns."* |
| 10 | same | The pink panel | Switch your wifi back on and press **"Retry now"**. | — | The button says it is retrying, then the panel closes and the words go **"Syncing" → "Synced"**. Nothing you typed was lost. |
| 11 | `https://app.inflozo.com/account` | Account | Scroll to the new **Saving** card and read it. | — | A row saying your work is sent to the cloud every few minutes, with the switch **on**. |
| 12 | same | Account | Turn the switch **off**. | — | A box asks first and tells you plainly what it costs — your work would then only be sent when you close the tab or press ⌘S, and a browser that clears its storage could lose it. The **Cancel** button is the one already selected. |
| 13 | same | Account | Press Cancel. Then turn it off again and confirm this time. Then turn it back on. | — | Turning it off needs the confirm each time; turning it back **on** asks nothing. |
| 14 | step 1's URL | Editor | Open the editor in **two** browser tabs. Make a change in the first and press ⌘S. Then make a change in the second and press ⌘S. | any headline in each | The second tab tells you the project was changed somewhere else and offers to **reload**. Nothing of yours is silently thrown away, and reloading shows you the first tab's change. *(A proper "one editor at a time" is Story 5.17; this is the honest stop-gap until then.)* |

## Questions for the owner

### Question 1 — the drawing has a "Download a copy" button that nothing can read back in

When your connection drops, a small pink panel opens under the saving words. The drawing (B6) puts **two**
buttons in it: **"Retry now"**, which is obviously right and is being built, and **"Download a copy"**.

"Download a copy" would save a file of the page you are designing onto your own computer. The trouble is
that **nothing in Inflozo can read such a file back in**. There is no "open a file" anywhere in the product
and no story that adds one. So if you ever actually used the button, the file would sit on your desktop and
the only way to turn it back into a page would be for you to open it by hand.

**Example.** Your wifi drops in a café. You have twenty minutes of work in the browser and nothing has
reached the server. You press "Download a copy" and get a file called `pilot-sections.json`. You then close
the laptop, and the browser clears its storage overnight. Tomorrow you have a file you cannot feed back into
Inflozo.

Note what the panel already says without the button: *"Your work is safe on this device. Nothing is lost if
you close the tab — we will send it when the connection returns."* That sentence is the reassurance the
panel was drawn for, and it stays either way.

1. **Leave the button out for now.** (RECOMMENDED) — this is your own standing rule R-118, which we have
   now applied five times: a button arrives with the story that makes it work, and is simply absent until
   then, never greyed out. The panel keeps "Retry now" and its reassurance. If a "restore from a file" story
   is ever written, the button lands with it and works properly on day one.
2. **Build it now anyway.** — you get a real escape hatch in the one moment it matters, and because you are
   the only person running Inflozo today, you *could* restore such a file by hand if you ever had to. The
   cost is a button that half-works: it produces a file the product cannot take back, which is the kind of
   promise the rest of the product deliberately avoids making. If you pick this, I will also record the
   missing "read it back in" half as deferred work so it is not forgotten.

**Ruled:** _(awaiting the owner)_

### Question 2 — should ⌘Z undo, or does that wait for the keyboard story?

This story builds the two **arrows** in the top bar. Pressing them undoes and redoes, and they work with the
keyboard in the ordinary way (Tab to them, press Enter).

What it does **not** build, as written, is **⌘Z** — the shortcut every person alive reaches for. That is
because Story 5.9 is "the keyboard map", and it owns the whole list at once — ⌘K, `[` `]`, ⌘D, Del, **⌘Z /
⇧⌘Z**, ⌘S, 1/2/3, L, `.`, Esc, P, ⇧R, ⌘⏎ — and tests them together. We did exactly this twice already: Story
5.6 built the sun button but not its `.` shortcut, and Story 5.7 built the device buttons but not `1` `2`
`3`.

**Example.** You test this story, delete the wrong section, and instinctively press ⌘Z. Nothing happens, and
you have to find the small arrow in the top bar instead. That is correct behaviour for the plan as written —
but it will feel broken, and you will be testing undo without the thing most people mean by undo.

There is one wrinkle worth knowing: **⌘S is being built here regardless**, because there is no "save now"
button anywhere in the drawings, so without it there would be no manual save at all until 5.9.

1. **Build ⌘Z and ⇧⌘Z here too, with the arrows.** (RECOMMENDED) — undo is this story's entire point, and
   testing it without the shortcut tests half of it. These are ⌘-modified shortcuts, which Story 5.9's own
   rules treat differently from the single-key ones (`L`, `.`, `1` `2` `3`) and which cannot clash with
   typing on the canvas. Story 5.9 still builds and tests the complete map; it would simply find these two
   already working, exactly as it will find ⌘S.
2. **Keep the arrows only, and let ⌘Z arrive with Story 5.9.** — one story owns the keyboard, one list, one
   test, and no chance of two stories disagreeing about a shortcut. The cost is that between now and 5.9 the
   editor has undo that only a mouse can reach, and your test of this story will feel wrong.

**Ruled:** _(awaiting the owner)_
