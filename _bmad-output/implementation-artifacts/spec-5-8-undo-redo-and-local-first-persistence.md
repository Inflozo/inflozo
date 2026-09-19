---
title: 'Story 5.8 — Undo, redo, and local-first persistence'
type: 'feature'
created: '2026-09-19'
status: 'done'
owner_test: passed
review_loop_iteration: 1
baseline_commit: '6c73e5d9f573c8e2ab98b44dde9dc0dad669157e'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story the editor **keeps your work**. Everything you do — typing, changing a control,
reordering, hiding, deleting a section — is written to your own browser the instant you do it, and sent up
to the server a few minutes later, when you close the tab, or the moment you press ⌘S. Close the laptop,
come back tomorrow, and your page is exactly where you left it.

It also gives you a **way back**. Two small arrows appear at the right of the top bar: the left one undoes
your last change, the right one puts it back — and **⌘Z and ⇧⌘Z do the same** (your ruling R-141). It
remembers your last hundred changes, and it remembers
them **through a reload** — so if you delete the wrong section, go and make tea, come back and reload the
page, the arrow still brings it back with everything you had typed into it.

A small **coloured circle** beside your project's name tells you the truth at all times, and each state has its
own little picture inside it as well as its own colour. **Green with a tick** means everything on your screen is
on the server. **Grey with a clock** means you have made changes that are written safely on this computer but
have not gone up yet. **Orange with an up-arrow** means they are going up now, and **red** means the connection
dropped and we are trying again. Hover over it and it tells you in words. It never says your work is safe when
it is not — and the two arrows sit right beside it, because undo and "where is my work" are the same question.

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
  No local record → the server's doc, an empty journal. **One recognition sits in front of it since the Review
  (2026-09-19):** a revision exactly one ahead, with edits owed, whose owed docs on the server ARE the local
  ones, is this editor's own tab-close flush landing unheard — nothing differs, so nothing is replaced and the
  journal stays (`ownFlushLanded`, `lib/journal.ts`). Another session's write cannot pass it: its doc differs.
- **The canvas does not paint until the local store has answered.** A reload must never flash the cloud
  document over the local one.
- **The sync writes only the docs the journal names**, and `projects.revision` moves in the same
  transaction. A synthesized doc is never written — writing one would materialise an untouched canvas and
  break AD-22 — and the journal names only docs `commit()` touched, so this is true by construction.
- **The RPC is compare-and-set on `revision`.** A mismatch writes nothing and returns the current revision.
  `authenticated` has no UPDATE grant on `projects.revision` (`schema:1209-1212`), so the client cannot
  advance it and there is no second path to invent.
- **The indicator answers to B6's five names, exactly** (`prd.md:1335`, `EXPERIENCE.md:314`) and **never a
  spinner**. **R-142 and R-144 (owner, 2026-09-19) changed how it shows them, not which they are**: it is a
  TABLER GLYPH IN A COLOURED CIRCLE rather than a dot and a printed label, the five names are the `title` a
  hover shows and the name a polite live region announces, and at rest it reports what is OWED — green with
  nothing to send, grey the moment there is. The Kit component's five-member union is still the compile error
  for a sixth (`components/kit/persistence-indicator.tsx`), and every state has its own SHAPE as well as its own
  hue, so colour is never the only signal.
- **⌘Z, ⇧⌘Z and ⌘S are bound on the editor shell and are inert while a field or a `contenteditable` holds
  the caret** — the browser's own undo owns the text being typed, and taking it would break inline editing
  (Story 5.3). Outside a field they are `preventDefault`ed, so the browser's page-level undo never competes.
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
- **No single-key shortcut here** — `[` `]`, `1` `2` `3`, `L`, `.`, `P`, `⇧R`, `Esc`. They carry UX-DR11's
  focus condition (live only while the shell holds focus, never inside a text field or a `contenteditable`),
  which is verified as one keyboard journey and not one key at a time, so they stay Story 5.9's entire —
  as `.` stayed at 5.6 and `1` `2` `3` at 5.7. **R-141 (owner, 2026-09-19) draws the line at the modifier:
  ⌘Z, ⇧⌘Z and ⌘S ARE built here**, beside the arrows they drive, because a ⌘-modified binding cannot
  collide with typing on the canvas and carries no focus condition to verify.
- **No "Download a copy".** B6 draws it beside Retry now; **R-140 (owner, 2026-09-19)** leaves it out —
  nothing in Inflozo reads such a file back in. Absent, never greyed and never captioned (UX-DR3), and the
  panel's reassurance sentence stays exactly as drawn.
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
| An edit | any `commit()` — typing, a control, a reorder, a hide, a delete | one transaction appended; the circle turns GREY with its clock (*"Saved on this device"*); no await on the interaction path | a failed local write → fallback mode |
| The timer | 3 minutes since the last flush, unsynced entries exist | *"Syncing"* → RPC → and the resting state now reads *"Synced"* and STAYS there until the next edit (R-144 — no fade, no timer) | network failure → Retrying |
| The timer, nothing unsynced | no entries above the synced watermark | **no request at all**; the indicator does not move | N/A |
| ⌘S | any state, unsynced entries exist | an immediate flush, exactly as the timer's | as above |
| ⌘S, nothing unsynced | — | the circle is ALREADY the green check (R-144), so the press re-asserts it and sends nothing. No request, which was always the rule | N/A |
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
| ⌘Z / ⇧⌘Z | the shell holds focus (R-141) | undo / redo, identical to the arrows — one handler, not two | N/A |
| ⌘Z with the caret in a text prop | inline editing under way | **the editor does nothing**; the browser's own undo owns the words being typed (Story 5.3) | N/A |
| ⌘Z with nothing to undo | an empty journal | nothing happens and nothing is announced; the arrow is already `aria-disabled` | N/A |
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
  **"Download a copy"** — which **R-140 (owner, 2026-09-19) leaves unbuilt**, so the panel carries Retry now
  alone. Its note: *"One indicator, five labels, one dot that changes colour —
  never a spinner… The expanded panel appears only on Retrying, and its first sentence is the reassurance
  rather than the error."*
- `S4 Editor.dc.html:32` — **where the indicator sits**: in the 48px bar, third item, directly after the
  project name, a 6px dot and a 12px label in `#6E6A64`.
- `S4 Editor.dc.html:41-43` — **the undo/redo pair**: two 28 × 28 buttons, `border-radius:8px`, `gap:2px`,
  hover `rgba(28,27,26,.05)`, 14px 1.5-weight strokes (`M9 14L4 9l5-5` + `M4 9h11a5 5 0 0 1 0 10h-3`,
  mirrored for redo), the unavailable one at `opacity:.35`. They sit between the device track and Ship it.
  **R-141 gives them ⌘Z and ⇧⌘Z**; the frame draws no shortcut hint and none is added.
- `S12 Billing.dc.html` S12a's right column — the Account card the autosave toggle joins, extrapolated from
  the Email and Sessions cards beside it exactly as Sessions was (R-74).

**Three rulings of the owner's, taken on his read of the Dev build (2026-09-19)**
- **R-142 — the indicator is an ICON IN A CIRCLE, not a dot and a label.** B6's five states, meanings and hues
  survive; the state is carried by a Tabler glyph and B6's five words move to the hover and to a polite live
  region. It is measurably SAFER than the dot: three of B6's four dots are under 3:1 against the bar's paper
  (1.62 · 2.86 · 2.75 · 4.85) and were legal only because the label carried the meaning, and coral *"Syncing"*
  against mint *"Synced"* is **1.04:1** — the pair that separates "still sending" from "safe". The fill is each
  hue's deeper `-text` value so white sits on it at 5.28–5.41:1 (`marigold-solid`'s precedent). Glyphs:
  `check` · `clock` · `arrow-up` · `exclamation-mark` · `upload`, each emitted from
  `packages/library/icons/tabler.json` and asserted against it by the harness — R-130's second stated exception.
- **R-143 — the undo/redo pair sits after the indicator**, not in S4a's right-hand cluster. Only the position
  moves; the buttons are still `S4 Editor.dc.html:41-43`'s own. Story 5.22 inherits one consequence: the pair
  will not collapse into D8b's `⋯` with the rest of the right cluster.
- **R-144 — the resting state reports what is OWED.** Green with nothing to send, grey the moment there is.
  B6's four-second "Synced" flash and the timer behind it are gone; the state is derived from `unsynced(journal)`.

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
- [x] `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql` -- new migration: drop and
      re-add `template_key_shape` on **both** `project_templates` and `project_template_prefs` with a single
      backslash; create `public.sync_project_doc(uuid, jsonb, bigint) returns bigint` as `security definer set
      search_path = public`, keyed on `auth.uid()`, compare-and-set on `revision`, upserting each key of the
      jsonb object and advancing `revision` in the one transaction; `revoke execute … from public, anon` and
      `grant execute … to authenticated` -- DW-193 and the only writer of `revision` there can be.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the same
      two changes in the cumulative picture -- the RLS gate diffs the two databases and refuses to run if
      they drift.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` and its
      `supabase/tests/` copy -- assert a `custom:custom-signup.hbs` key **inserts**, that the new function is
      executable by `authenticated` and not by `anon`, and that the RPC refuses a stale `base_revision` and
      another user's project -- byte-identical copies, `cmp -s` in the gate.
- [x] Apply the migration by hand through `SUPABASE_DB_POOLER_URL`, then push `Story 5.8 - Schema - …` alone.

**Execution — Dev:**
- [x] `apps/web/lib/journal.ts` -- new, pure and `node --test`-reachable: the journal's rules (`append`,
      `undo`, `redo`, the 100-edit trim, the undone-tail discard, `unsyncedEdits` as distinct transaction ids
      above the watermark, the docs a flush must send), the indicator's state machine and the retry backoff
      -- so every rule that can be got wrong is testable without a browser.
- [x] `apps/web/lib/local-store.ts` -- new: the IndexedDB door. One database per user, two object stores
      (`meta`, `journal`), keyed by project id; open, read, append, trim, clear, and
      `navigator.storage.persist()`. **Every function fails soft** — a rejected open or a failed write
      resolves to `null` and the caller enters fallback mode.
- [x] `apps/web/lib/editor.ts` -- add `SYNC` / `syncPath` beside `SETTINGS`, and keep `sync` out of
      `canvasFromSegment` -- R-131's static-sibling rule, applied a second time.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` -- new: POST, the caller's own session,
      the body parsed through `docSchema` per key before it is trusted, one `rpc('sync_project_doc', …)`,
      answering the new revision or a conflict -- one path for the timer, ⌘S and `keepalive` at tab close.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- add `revision` to `projectOf`'s
      select and to `EditorData` -- the hydrate comparison needs the cloud revision as server truth, exactly
      as 5.6 made `dark_enabled` server truth.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hook `commit()` to open a
      transaction and append; gate the first paint on the local read; add the hydrate comparison, the flush
      timer, `visibilitychange`, the undo/redo pair in the bar and the indicator beside the project name; bind
      **⌘Z, ⇧⌘Z and ⌘S** on the shell, inert while a field or a `contenteditable` holds the caret (R-141)
      -- `commit()` is already the one door, so the journal hooks one function, and the shortcuts call the
      same two handlers the arrows do rather than a second implementation.
- [x] `apps/web/components/editor/save-state.tsx` -- new: the Kit indicator wired to the state machine, and
      B6's Retrying panel anchored beneath it with its reassurance sentence and Retry now (R-98's busy
      label) -- the panel opens on Retrying and on nothing else.
- [x] `apps/web/components/kit/icons.tsx` -- **already there, and byte-identical to the frame**: Story 1.3 read both
      paths off `S4 Editor.dc.html:41-43` when it built the Kit, so nothing was added. What DID change is
      `components/kit/button.tsx`: `IconButton` hardcoded its class string and took `className` in `...rest`, where a
      caller's class would have replaced the size, the radius, the hover and the focus ring. No caller had ever passed
      one; S4a's pair is the first, because the unavailable arrow is drawn at `opacity:.35`. It is APPENDED now.
- [x] `apps/web/app/(app)/app/(authed)/account/saving-card.tsx` and `account/actions.ts` and `account/page.tsx`
      -- the per-user autosave toggle, its confirm carrying the data-loss sentence with focus on Cancel, and
      the card rendered beside Sessions -- FR-D10's toggle, in the place `EXPERIENCE.md:702` puts it.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` -- move
      `clearProjectDarkOverrides` onto the same RPC -- **closes DW-197**: one transaction, one revision check,
      and one definition of what a guarded doc write is.
- [x] `apps/web/journal.test.ts` -- new: the matrix's journal, indicator and backoff rows as unit tests,
      including the 100-edit trim, the undone-tail discard, the vanished-design refusal and `unsyncedEdits`.
      The shortcut's own rule is pure too -- which key, in which focus state, means what -- so it is tested
      here and not only in the browser.
- [x] `apps/web/editor.test.ts` -- `sync` resolves as no canvas and collides with no canvas path -- the same
      three assertions `settings` carries.
- [x] `tools/probe/run-verify-editor.cjs` -- steps 61+ inside step 5's CSP session: an edit survives a
      reload, undo reaches through it **by ⌘Z as well as by the arrow**, ⌘Z is inert with the caret in a text
      prop, the journal clears when account B writes and the revision moves, the indicator's four reachable
      labels, the Retrying panel carrying **one** control, and the fallback with IndexedDB refused.

**Acceptance Criteria:**
- Given any edit in the editor, when it lands, then the interaction returns before the local write settles
  and the indicator reads *"Saved on this device"* (FR-D10, NFR-1).
- Given a section deleted with text typed into it, when the page is reloaded and undo pressed, then the
  section returns **with its text and every control value** (FR-D9's whole promise).
- Given a Variant Shuffle or a Style Pack change when those stories land, when it is undone, then **one**
  press undoes it however many operations it cost — because both go through `commit()` (AD-16).
- Given 100 edits, when the 101st lands, then undo still reaches back exactly 100 and no further.
- Given the editor shell has focus, when ⌘Z or ⇧⌘Z is pressed, then it does exactly what the arrow does —
  and given the caret is inside a text prop, then the editor does nothing and the browser's own undo keeps
  the words (R-141, and Story 5.3's inline editing is untouched).
- Given a failing flush, when B6's panel opens, then it carries **"Retry now" and no second control** (R-140).
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
  indicator carries **B6's five states, their meanings and their hues**, with no sixth and no spinner and the
  panel only on Retrying — shown as **R-142's glyph in a circle** rather than B6's dot and label, and resting
  as **R-144** says — and the arrows **match `S4 Editor.dc.html` S4a** — 28 × 28, 8px radius, 2px apart, the
  unavailable one at `opacity:.35` — sitting where **R-143** puts them. Every departure from the frames is one
  of the five recorded in the Code Map and there are no others (R-74).
- Given the indicator in any of its five states, then that state has **its own glyph as well as its own hue**,
  so colour is never the only signal, and its name reaches a hover and a polite live region (R-142,
  `EXPERIENCE.md`'s accessibility floor).

### Review Findings

Review of 2026-09-19 — five layers over `6c73e5d9..9ad1ac47`. Every patch below is applied and ticked.

- [x] [Review][Patch] **HIGH — the tab-close flush never read its answer, so the editor conflicted with its own save.** `visibilitychange → hidden` is also an ordinary tab switch: the write landed, `base` stayed old, and the next ⌘S opened "changed somewhere else" against the user's own write (reproduced: `dialogs 1`). It now goes through the one `flush()` — answer read, in-flight guard kept, `keepalive` only under the browser's ~64KiB cap [editor.tsx `leaving`, `flush`]
- [x] [Review][Patch] **HIGH — a reload with edits owed cleared the undo history**, because the reload's own flush moved the revision under the page; FR-D9 held only when a ⌘S came first, which is how step 67 had passed. `ownFlushLanded` recognises the editor's own write on hydrate, and the sync route answers 200 rather than 409 when a stale-base request carries exactly what the server already holds (the flush that lands after the new page read the old revision; a lost answer retried) [lib/journal.ts · sync/route.ts]
- [x] [Review][Patch] A flush asked for while one was in flight was dropped — in fallback that edit was held nowhere; ⌘S mid-flight did nothing. It is now owed and sent when the first lands [editor.tsx `flush`]
- [x] [Review][Patch] An edit or an undo during Syncing or Retrying overwrote the indicator and flickered the red panel shut; and Retrying overwrote FALLBACK, so the next success said "Saved on this device" about a device holding nothing. Fallback is now read from the device, and only the flush leaves its own states [editor.tsx `rest`, `toFallback`]
- [x] [Review][Patch] The Retrying panel said "Your work is safe on this device" in fallback, where it is not. It says "Your latest changes have not reached the cloud yet. Keep this tab open…" there; the frame's sentence is untouched everywhere else [save-state.tsx]
- [x] [Review][Patch] ⌘Z was dead after using any panel control: `holdsCaret` counted checkboxes, ranges, colour wells and selects as holding a caret. Text fields only [lib/journal.ts]
- [x] [Review][Patch] ⌘Z and ⇧⌘Z changed the document under an open dialog [editor.tsx `onShortcut`]
- [x] [Review][Patch] The sync route passed an illegal template key to the RPC, where it became a 502 the editor retried for ever; it is a 422 at the route, and `__proto__` with it [sync/route.ts]
- [x] [Review][Patch] The live region announced the retry countdown every second; it carries the state alone, the hover keeps the seconds [persistence-indicator.tsx]
- [x] [Review][Patch] The indicator showed green "Synced" before the local store had answered [editor.tsx]
- [x] [Review][Patch] Leaving the editor by a link sent nothing (no `visibilitychange` on a soft navigation); a failed flush could schedule retries from an unmounted editor; "tenth attempt" for ever after ten; the tab never closed its IndexedDB handle for another tab's upgrade [editor.tsx · save-state.tsx · local-store.ts]
- [x] [Review][Patch] The harness: step 70's CSP zero was unscoped and failed on the Projects page's violation (step 14 scopes the same check); nothing drove a tab switch, a reload with edits owed, the route's 409/422, or an edit in fallback. Steps 66b, 66c and 70's edit are new, and step 67 now reloads with an edit owed [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] **HIGH, found by the deployed walk — a sync request that never answers left the editor on "Syncing" for good**, and with the in-flight guard held every later save was refused too (deployed run 8 at `02cd7f7a`: ⌘S → `["Syncing"]`, `revision 9 → 9`, and steps 66b–66c dead behind it; the verifier's run 5 at `9ad1ac47` is the same stall). The request now gives up after 20s and becomes Retrying like any other failure; if the write did land, the route's "already there" answer makes the retry a 200 [editor.tsx `flush`] — harness step 69b holds a request open and reads Retrying, then Retry now → Synced
- [x] [Review][Defer] The deployed editor page intermittently takes over 30s to finish loading for the harness, so no walk of `9faf014c` completed [tools/probe/run-verify-editor.cjs · the `[id]` editor route] — deferred → DW-204
- [x] [Review][Defer] The Projects page ships a zod that runs its `Function("")` JIT probe under the CSP (refused, harmless, but a recorded violation) [apps/web — `/`] — deferred, pre-existing → DW-201
- [x] [Review][Defer] A sync refusal that retrying cannot fix (401 after the session expires, 404, 422) still shows Retrying with the connection sentence [editor.tsx `flush`] — deferred → DW-202
- [x] [Review][Defer] Two tabs of one project share one local record and interleave their journals; the local database outlives sign-out and project deletion [local-store.ts] — deferred to Story 5.17's lock and the account stories → DW-203

Dismissed as noise or as ruled: Ctrl+Y (R-141 names the two gestures), "⌘S" in copy on Windows (the spec's own word throughout), a declined conflict asking again (the spec's stated behaviour), body-size caps (Vercel's own), `done.applied` unchecked (the route maps it to the status), and ten smaller ones.

## Spec Change Log

**Dev, 2026-09-19 — the owner's three rulings on his read of the build: R-142, R-143, R-144.** He asked for the
status text gone and the dot alone; I countered with measurements — three of B6's four dots are under 3:1 against
the bar's paper and coral *"Syncing"* against mint *"Synced"* is 1.04:1, so the label was the only thing keeping
the indicator legible and removing it would have broken the one rule `EXPERIENCE.md` uses this very component to
illustrate. He ruled a better answer than any of the three options I offered: **an icon in a circle**, which makes
colour and shape redundant with each other and needs no printed word at all. The three rulings are written up in
`reconcile-designs-decisions.md` §A10 and their divergences listed in this spec's Code Map. `EXPERIENCE.md`'s
state row and its accessibility floor, and `prd.md`'s FR-D10 label paragraph, all moved with them.


**Schema phase, 2026-09-19 — `sync_project_doc` returns `jsonb`, not `bigint`.** A routine judgement
call, recorded rather than put to the owner, because the frozen text it serves is unchanged. The Tasks
line named `returns bigint`; a bigint cannot carry the verdict. On success the answer is `p_base + 1`,
and the COMMONEST conflict — one other tab having flushed exactly once — leaves the current revision at
`p_base + 1` too, so the two answers are the same number and the client would read a refusal as a
success and drop the work it had not sent. That is the matrix's *"Another session wrote"* row failing
silently, which is the one failure this story exists to prevent. The return is therefore
`{"applied": bool, "revision": bigint}`. The frozen Boundary is satisfied literally — a mismatch still
"writes nothing and returns the current revision", in the object's `revision` — and the gate now stands
on the collision itself (`RLS-TEST.sql`, Story 5.8's block, assertion B2a).

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

**⌘Z is one handler, not a second implementation.** R-141 is a sequencing ruling, not a behavioural one: the
key calls the same `undo()` the arrow's `onClick` calls, so the two can never drift. Its only rule of its own
is the guard — while `editing.current` is set or the active element is a field, the handler returns without
`preventDefault`, so the browser's native undo owns the words being typed and Story 5.3's inline editing is
untouched. Everywhere else it `preventDefault`s, so the browser's page-level undo never competes for the
gesture. `⌘S` is guarded the same way in reverse: it always `preventDefault`s, because the browser's Save
Page As is never what the press meant.

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

### Executed at Dev — 2026-09-19

**R-82: every check below hit a real service**, recorded by the key's variable name and never its value.
`SUPABASE_DB_POOLER_URL` (production, PostgreSQL 17.6 — the Schema phase's apply and both of its proofs) ·
`SUPABASE_URL` + `SUPABASE_SECRET_KEY` (the two harnesses' fixtures, and every read-back below, against the **live**
Supabase). No Ghost server, Resend or Dodo is in this story's path and none was touched.

#### The Schema phase, on production (pushed alone, before any code — R-99)

```
template_key_shape, BOTH tables            two backslashes -> ONE, applied through SUPABASE_DB_POOLER_URL
  custom:custom-signup.hbs                 INSERTS (was 23514)      \
  custom:custom-signin.hbs                 INSERTS (was 23514)       > inside a rolled-back transaction
  custom:custom-member-home.hbs            INSERTS (was 23514)      /
  custom:custom-signup\xhbs                REFUSED 23514            <- control: the cause, now gone
  custom:% rows left behind                0
public.sync_project_doc(uuid,jsonb,bigint) prosecdef t · search_path=public · returns jsonb
  authenticated EXECUTE                    true
  anon EXECUTE                             false
  a matching base_revision                 {"applied": true,  "revision": base+1}   and the doc written
  a STALE base_revision                    {"applied": false, "revision": base+1}   and NOTHING written
  another user's project id                null, nothing written
  rows left behind                         0 (rolled back; revision back to its starting value)
```

#### The gates

```
bash supabase/tests/run-rls-gate.sh    exit 0 — 100 PASS notices, this story's eight among them
  CONTROL, executed: with the migration withheld the proof ABORTS at DW-193's insert (exit 3) — the hole the
  ledger named, and the reason the gate was green for it all along (nothing in it had ever inserted a `custom:` key)
pnpm check                             exit 0 — lint, typecheck, every package suite `fail 0`
                                       (library 149 · theme-compiler 1 · ghost-shim 34 · section-runtime 200 ·
                                        web 386 · stress 8 — counts printed by the run, never written down here)
pnpm --filter @inflozo/web build       exit 0 — the route table gains `ƒ /app/projects/[id]/sync`; `[id]`,
                                       `[id]/[template]` and `[id]/settings` are unchanged
python3 tools/doc-audit.py --check     PASS (0 warnings), twice
```

#### `run-verify-editor.cjs` — the whole walk, twice, against a production build on the live Supabase

```
0 FAIL, 378 PASS   (APP_ORIGIN=http://localhost:3100, APP_PREFIX=/app — a LOCAL run and it says so)
step 5's CSP zero  [] in both documents, across Story 5.8's edits, undos, redos, ⌘Z, ⇧⌘Z, ⌘S, its two
                   reloads and its Retrying panel — with BOTH eval controls passing and the recorder's own
                   control seeing the two refusals, so the zero is a result
step 61  B6 at rest: the resting label, a GREY dot, no spinner; S4a's pair at 28 × 28, 8px radius, 2px apart,
         immediately right of the device track, both at opacity .35, both `aria-disabled` and both still tabbable
step 62  one gesture (a Delete through the Layers ⋯) removes the section and wakes undo; the indicator keeps
         the resting label — the write never touched the interaction path
step 63  ONE press of the left arrow brings the whole section back; ONE press of the right takes it away
step 64  R-141: ⌘Z and ⇧⌘Z do exactly what the arrows do
step 65  R-141: with the caret in Three Up's title (Story 5.3's own `caretInto`), ⌘Z does NOT undo the editor's
         last change — with a control first that the letters really went in
step 66  ⌘S: Syncing → Synced → the resting label; `projects.revision` advanced by EXACTLY one and the stored
         doc is the edited one
step 67  a reload comes back to the LOCAL document; the history came with it; undo reaches THROUGH the reload
         and brings the deleted section back (5 presses — the typing after it comes off first)
step 68  a second writer advances `projects.revision`: the cloud doc replaces the local one, the journal is
         CLEARED, both arrows sleep (AD-15, §AD1.1's second row)
step 69  B6's panel opens on Retrying at the frame's own fill, radius and padding, first line counting the
         attempt and SECOND line the reassurance, carrying "Retry now" AND NO SECOND CONTROL (R-140), no
         spinner; Retry now closes it and nothing was lost
step 70  with IndexedDB refused, the editor still opens and paints and the indicator reads "Syncing every
         change to the cloud" — never "Saved on this device" (FR-D10), in its own context with its own CSP zero
step 53  D6a's project-level Clear, now on the RPC (DW-197), still empties every override across every canvas
```

#### `run-verify-saving.cjs` — FR-D10's toggle, the one surface the editor walk cannot reach

```
0 FAIL, 12 PASS   (its own throwaway account through the Auth Admin API, deleted in a `finally`)
the card is on /account in its neighbours' own shell; its sentence says the work is ALWAYS kept on the device
and ALSO sent every few minutes; turning it OFF asks first in the app's one 460px dialog opening on Cancel;
the dialog states what it costs (AD-15: the timer alone stops); Cancel writes NOTHING; confirming writes
`profiles.autosave_enabled = false` per USER; turning it back ON asks nothing. Every assertion is read back off
the DATABASE and not off the switch.
```

#### Two controls that changed what was built, rather than confirming it

**The step-15 and step-12 failures were CONTROLLED before they were diagnosed** (standing rule 2). The whole walk
was re-run against the PRE-STORY product — the working tree stashed, the new files moved aside, rebuilt and served —
and both steps passed there (484 PASS, and `step 15 … yyyy…` on all 29 frames). So both were this story's, and the
diagnosis followed: step 12 asserted that a reload throws the session away, which is exactly what this story
inverts, and step 15 was then measuring a header whose `data-on-scroll` a surviving session had set to `static`.

**Undoing a deletion after a sync was REFUSED, and that was a real defect** (`run-verify-editor.cjs` step 67).
`read.ts` handed over only the designs the SERVER'S docs name, so deleting the only section using one, letting the
flush go up and reloading left `entries` without it — FR-D9's vanished-design guard then refused the undo as though
the library had dropped the design, and a local doc naming it could not be painted at all, so the hydrate fell back
to the cloud and would have thrown the customer's work away. Fixed by handing over every PLACEABLE design (five
today, ~68 KB, read from `pilotIds()`), which is also what Stories 5.10 and 5.11 will need. The growth is
**DW-200**.

#### Re-executed after R-142/143/144 — 2026-09-19

```
run-verify-editor.cjs                  0 FAIL, 384 PASS  (the indicator's own steps rewritten for the rulings)
  step 61  R-144: at rest with nothing owed the circle is GREEN and says Synced
  step 61  R-142: a 16px circle carrying Tabler `check` in white, its name on the hover, nothing animating
           — the GLYPH asserted by its own path data, read out of packages/library/icons/tabler.json, so two
           states can never silently come to share one icon
  step 61  R-143: the pair sits immediately after the indicator and no longer after the device track, with the
           buttons still S4a's own 28 x 28 / 8px / 2px
  step 62  R-144: one edit turns it GREY with Tabler `clock` — and it is a different GLYPH, not just a colour
  step 66  R-144: after ⌘S it goes green and STAYS — no timer, no fade back to grey
  step 69  R-142: red wears `exclamation-mark`, and the countdown rides in the name the hover shows
  step 70  R-142: the no-storage state is GREY like the resting one and told apart by its glyph, never its colour
pnpm check                             exit 0 — every package `fail 0`, journal.test.ts now 24
```

**And the CSP control was strengthened rather than re-run until it passed.** It failed twice — the recorder saw
only one of the two eval refusals — while both documents demonstrably threw `EvalError`. A flat count to two also
could not tell "both documents refused" from "the editor refused twice", which is the very thing the control is
for. It now waits for a refusal from EACH document by url, and still fails if either never arrives.

#### The matrix, row by row — what covers each, and the four that are the owner's to drive

Every row of `## I/O & Edge-Case Matrix` is covered by a check that RAN and PASSED above, except where noted.

| Row | Covered by |
|---|---|
| An edit · Undo · Redo · ⌘Z / ⇧⌘Z · ⌘Z in a text prop · ⌘Z with nothing to undo | `run-verify-editor` 61–65, 67 |
| The timer, nothing unsynced · ⌘S with nothing unsynced · Autosave off | `journal.test.ts` — `flushDecision`, the one function all three read, extracted at Dev so they stopped being three conditions at three callers |
| ⌘S | `run-verify-editor` 66, and `projects.revision` read back off the database |
| The timer (firing on its own) | the walk itself: step 61 opens on **revision 9** without a single ⌘S before it, so the 3-minute timer had flushed repeatedly during the run |
| Tab close | proved by the walk BREAKING on it: `freshLoad` had to be reordered because the departing editor's `keepalive` POST landed on top of the seed it had just restored (`leaveEditor`'s comment is the record). A flush that did not fire could not have overwritten anything |
| Sync fails · Retry now | `run-verify-editor` 69 — the route aborted at the browser, the panel read off the frame's own values |
| Reload, same revision · Reload, differing revision · First visit on a device | `run-verify-editor` 67, 68, 61 |
| No IndexedDB | `run-verify-editor` 70, in its own context with its own CSP zero |
| An edit while undone > 0 · 101st edit · Undo past a vanished design · Undo across canvases · Undo the last section off a synthesizable canvas | `journal.test.ts` |
| Turning autosave off | `run-verify-saving.cjs`, read back off `profiles` |
| A 40-section canvas | `run-verify-editor` 60 — a `commit()` still returns without waiting, longest main-thread task 153 ms against FR-D14's 5 s bound |
| Another user's project id | `RLS-TEST.sql`'s Story 5.8 block, and executed on production |
| **Another session wrote** (the DIALOG half) | the RPC's refusal is proved three ways — the gate, production, and `run-verify-editor` 68's hydrate. The DIALOG itself is **not driven**: it needs two live browser sessions, which is the owner's manual test step 14 and the Review phase's account-B walk |
| **A local write fails mid-session** (quota) | **not driven.** `openLocal`'s every path fails soft and `toFallback()` is the one handler, which step 70 exercises from the other direction (the store refused at open). Inducing a quota refusal mid-session needs a browser flag no harness here sets |

#### What is owed at Review, and is not claimed here

The walk above is a **LOCAL** production build against the live Supabase, and it says so in its own first line. The
**deployed** run on `app.inflozo.com` is the Review phase's, after CI publishes this push — as is the second-writer
case driven by account B through a real browser rather than by the service key, and the render matrix.

### Executed at Review — 2026-09-19

**Production first (R-99), through `SUPABASE_DB_POOLER_URL`, PostgreSQL 17.6, every write rolled back.** Both
`template_key_shape` constraints carry one backslash; `sync_project_doc(uuid,jsonb,bigint)` is there, `security
definer`, EXECUTE to `authenticated` and not `anon`; every column the code writes exists
(`profiles.autosave_enabled`, `projects.revision`, `projects.dark_enabled`, `project_templates.doc`). As the owner:
a matching base → `{"applied": true, "revision": 1}`; **the control**, a stale base → `{"applied": false}` and 0
rows; another user → NULL; `custom:custom-signup\xhbs` → refused by `template_key_shape`. Nothing remained after
ROLLBACK. HEAD `9ad1ac47` was what Vercel served (`READY`), CI green.

```
bash supabase/tests/run-rls-gate.sh                 exit 0 — 100 PASS notices
run-verify-saving.cjs  (APP_ORIGIN=https://app.inflozo.com)   12 PASS, 0 FAIL — the deployed site
run-verify-editor.cjs  (deployed, 9ad1ac47)         ONE complete run: 384 PASS, 1 FAIL — step 70's unscoped CSP
                                                    check tripping on the Projects page (patched above; DW-201).
                                                    Step 66 failed ONCE in a run that then died on page.goto
                                                    timeouts and passed in the complete run — a HARNESS ERROR with
                                                    no clean FAIL is not a result, and the deployed re-walk below
                                                    is what settles it.
```

**The patches, against a production build on the live Supabase (a LOCAL run and it says so):**

```
run-verify-editor.cjs  patched build                0 FAIL, 389 PASS, twice
  step 66b  tab hidden with an edit owed → grey → green, revision +1; the next ⌘S is +1 again and NO dialog
  step 66c  stale base + different doc → 409 · bad doc → 422 · illegal key → 422 · none wrote;
            stale base + the doc the server already holds → 200, nothing written
  step 67   reload WITH an edit owed: the local doc, the history and FR-D9's undo-through-reload all hold
  step 70   in fallback one change with no ⌘S moves projects.revision (and a second puts it back)
THE CONTROL, executed: the SAME harness against the UNPATCHED editor and route →
  step 66b FAIL (`synced false`, then `dialogs 1` — the editor conflicting with itself)
  step 66c FAIL (illegal key → 502; the already-held doc → 409)
pnpm check                                          exit 0
```

**The deployed walk at `02cd7f7a` (`app.inflozo.com`, Vercel READY on that commit).** Eight attempts; this
machine's link stalls (`page.goto: Timeout 30000ms` at a different step each time — a HARNESS ERROR is not a result).
Run 6: **390 PASS, 0 FAIL**, every Story 5.8 step among them, then died on a later `page.goto`. Run 8 completed:
383 PASS, **7 FAIL, all one cause** — step 66's sync POST never answered and the editor sat on "Syncing". That is a
real defect whichever end stalled, patched above (the 20s limit), proved locally by step 69b: **0 FAIL, 390 PASS**.

**The deployed walk at `9faf014c` — NOT A RESULT, and said so.** Six attempts, **0 FAIL in every one**, and every
one died on `page.goto: Timeout 30000ms` loading the signed-in editor page (`/projects/<id>`, `waitUntil: 'load'`)
before reaching step 61; the furthest got to step 46. Plain requests from the same machine answer in ~0.3s (six
`curl`s of `/sign-in`), and the same walk against a local build on the same Supabase never stalls — so the stall is
between this machine's browser and the deployed editor page, or in that page on Vercel, and nothing here tells the two
apart (DW-204). Story 5.8's own steps therefore stand on the local production-build run above (0 FAIL, 390 PASS) and
on run 6 at `02cd7f7a` (390 PASS, 0 FAIL on the deployed site, before the 20s limit went in). **The owner's test on
the deployed site is the remaining proof.**

**Not driven by any harness, and said so:** the two-live-browsers conflict dialog (the owner's test walks it) and a
mid-session quota refusal. **Owed after this push deploys:** one complete walk on `app.inflozo.com`.

### Executed at Deploy (2026-09-19)

- `GET https://api.vercel.com/v6/deployments` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) — the
  production deployment built from HEAD (`4ea52bc7`, the Review commit) is **READY**.
  `Deployment: dpl_831viYkJjfd81xzKfrGBh5gR457F` (`inflozo-ha5cqpu8b-umangkagathara.vercel.app`, serving
  `app.inflozo.com`). `GET https://api.github.com/repos/Inflozo/inflozo/commits/4ea52bc7.../check-runs`
  (`GITHUB_TOKEN`) — `check`, `rls`, `matrix` and `deploy` all `completed success` on this commit.
- No migration owed here — the Schema phase (`79685613`) already applied `20260919120000_doc_sync_and_
  template_key_shape.sql` to production and the Review phase re-verified it live (`SUPABASE_DB_POOLER_URL`,
  above); `git diff --stat 79685613..4ea52bc7 -- supabase` is empty, so nothing further landed for R-99 to
  check.

## Owner's manual test

Run on the deployed site, on the **"Pilot sections"** project Story 5.1 seeded. **This is the first story
whose work you can leave and come back to** — so unlike every editor test before it, do *not* rush it in one
sitting. Step 6 asks you to close the tab on purpose.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the top bar, just after the project name. Hover over the little circle. | — | A small **green circle with a tick** — everything on this page is on the server. Hovering says **"Synced"**. Nothing is spinning. |
| 2 | same | Top bar | Look immediately to the right of that circle. | — | Two small **arrows**, one curving left and one curving right, right beside the circle where you asked for them. Both are faded — there is nothing to undo yet. |
| 3 | same | Canvas, Home | Click a headline and type something into it. Then look at the circle again. | type `Tuesday letters` over the headline | The left arrow **wakes up**, and the circle turns **grey with a little clock** — your change is safe on this computer and has not gone up yet. Hovering says "Saved on this device". |
| 4 | same | Top bar | Press the **left arrow** once. Then press the **right arrow** once. | — | Your headline goes back to what it was, then returns to `Tuesday letters`. One press each way — not one press per letter. |
| 4b | same | Editor | Now do the same with the keyboard: **⌘Z**, then **⇧⌘Z** (Ctrl+Z and Ctrl+Shift+Z on Windows). | — | Exactly what the arrows did. **This is your ruling R-141** — it is why undo works the way your hands expect. |
| 4c | same | Canvas, Home | Click **into** a headline so the cursor is blinking in it, type a few letters, and press **⌘Z**. | type `abc` | Only your **letters** come back out, one step at a time — the editor keeps its hands off while you are typing, which is the browser's own undo doing its ordinary job. Click away from the headline first, and ⌘Z goes back to undoing whole changes again. |
| 5 | same | Canvas, Home | Click a whole section to select it, and delete it with the bin in the little pill. Then press the **left arrow**. | — | The section disappears, then comes **straight back** — in the same place, with everything you had typed into it. |
| 6 | same | Editor | Press **⌘S** (Ctrl+S on Windows). Watch the circle. | — | It goes **orange with an up-arrow** for a moment while it sends, then **green with a tick** — and it **stays green**. It does not drift back to grey, because there is nothing left to send. That is your ruling R-144: green means the server has it. |
| 7 | — | — | **Close the tab completely.** Make a cup of tea. Then open the URL in step 1 again. | — | Your `Tuesday letters` headline is **still there**. This is the whole story. |
| 8 | same | Top bar | Press the **left arrow** a few times. | — | It still undoes the changes you made **before** you closed the tab — the history survived too. |
| 9 | same | Canvas, Home | Make one small change. Now **switch your wifi off**, wait about three minutes, and watch the circle. | change any headline | It goes **red with an exclamation mark**, and hovering it counts down — *"Retrying · 12s"*. A small pink panel opens underneath: *"Retrying, third attempt"* and *"Your work is safe on this device. Nothing is lost if you close the tab — we will send it when the connection returns."* *(This panel is what moves into the notification system when you build it — see the note under the table.)* |
| 10 | same | The pink panel | Read the panel, then switch your wifi back on and press **"Retry now"**. | — | There is **one** button in it, "Retry now" — the drawing had a second, "Download a copy", and your ruling R-140 left it out. The button says it is retrying, then the panel closes and the circle goes **orange → green**. Nothing you typed was lost. |
| 11 | `https://app.inflozo.com/account` | Account | Scroll to the new **Saving** card and read it. | — | A row saying your work is sent to the cloud every few minutes, with the switch **on**. |
| 12 | same | Account | Turn the switch **off**. | — | A box asks first and tells you plainly what it costs — your work would then only be sent when you close the tab or press ⌘S, and a browser that clears its storage could lose it. The **Cancel** button is the one already selected. |
| 13 | same | Account | Press Cancel. Then turn it off again and confirm this time. Then turn it back on. | — | Turning it off needs the confirm each time; turning it back **on** asks nothing. |
| 14 | step 1's URL | Editor | Open the editor in **two** browser tabs. Make a change in the first and press ⌘S. Then make a change in the second and press ⌘S. | any headline in each | The second tab tells you the project was changed somewhere else and offers to **reload**. Nothing of yours is silently thrown away, and reloading shows you the first tab's change. *(A proper "one editor at a time" is Story 5.17; this is the honest stop-gap until then.)* |

**One judgement call, stated rather than asked.** You said errors can move to the notification system once it
exists. B6's pink Retrying panel is **kept until that system is built** — removing it now would leave a failed save
with no explanation at all, only a red circle, and R-118's own logic is that a thing arrives with the story that
makes it work rather than leaving before its replacement does. The moment notifications land, the panel's two
sentences and its "Retry now" move there and this surface becomes the circle alone. Say the word and it goes sooner.

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

**Ruled: option 1 (owner, 2026-09-19).** Leave the button out for now. Recorded as **R-140** in
`prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` §A10 — R-118 applied a sixth time, and the first time to
a control with no future story named at all. The Retrying panel carries **"Retry now" and nothing else**; its
reassurance sentence is untouched.

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

**Ruled: option 1 (owner, 2026-09-19).** Build ⌘Z and ⇧⌘Z here too, with the arrows. Recorded as **R-141** in
`prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` §A10, which draws the line the two previous stories did
not need: **a ⌘-modified binding may land with the control it drives; a single-key one may not**, because only the
single-key ones carry UX-DR11's focus condition and that condition is verified as one journey, not one key at a time.
So this story builds **⌘Z, ⇧⌘Z and ⌘S**; `[` `]`, `1` `2` `3`, `L`, `.`, `P`, `⇧R` and `Esc` stay Story 5.9's, which
still builds and tests the complete map.
