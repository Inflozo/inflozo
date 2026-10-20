---
title: 'Story 7.18c — The editor''s lock and save leftovers'
type: 'bugfix'
created: '2026-10-20'
status: 'in-review'
baseline_commit: '6095de06ede01b2b1617f59e3f24ca2ea00647ca'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-18b-choosing-the-site-and-pre-flight-s-warnings.md']
---

## In plain English

After this story, when Inflozo can never save your work — the project was deleted in another window, this browser is now
signed in to a different account, or Inflozo could not accept a change — the save icon turns to a red **Can't sync**
that says which, instead of promising to send it "when the connection returns", and Run checks says the same. Closing the
window that is editing now always lets your other window take over in about fifteen seconds, as it usually does, and a window that turns
read-only after you typed in its first moment tells you what it could not include. If Inflozo cannot load your connected
sites, the deploy wizard's site list says so instead of looking empty.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1 and 2 were ruled by the owner (2026-10-20), each option 1: R-275 and R-276.** "Ruled values" in Design
Notes is the one table they set. **This is Story 7.18c (R-259):** the editor's lock and save
leftovers, on the editor Stories 5.8, 5.17, 5.24e, 7.18a and 7.18b built.

**Problem:**
- **DW-304.** The sync route answers 404 for a project deleted elsewhere or another account's session, and 400 or 422 for
  a body or document it will not take (`sync/route.ts:85,190` · `:91-115,147` · `:103-129`). `flush` sends all three to
  the Retrying backoff (`editor.tsx:2130` → `:2151`), whose panel says "we will send it when the connection returns"
  (`save-state.tsx`), and retries for ever. Run checks and Switch then say R-274's "Try again once they're saved." All
  untrue: nothing will ever send it.
- **DW-307.** A going page's `leave` matches only the beat it last HEARD (`lock/route.ts:134-152`). A beat still in
  flight moves the row past it, so that close matches nothing and the other window waits ~60 s instead of a check-in
  (R-228 accepted this until now). The reverse order — the leave lands, then the in-flight beat — revives the row too.
- **DW-308.** A first opener paints optimistically as holder (`editor.tsx:1408`). If it types and its first `acquire`
  then finds another session's live row, `land()` makes it a reader with the typing still in its journal, unsent and
  unsaid: the displaced test needs a confirmed generation it never had (`:2319`), and DW-203's wall stops the send
  (`:2039`).
- **DW-381.** `shipStateOf` logs a failed sites read and counts it as none (`lib/deploy.ts:626,639`), so the wizard's
  picker opens empty and Destination hides "Choose a site", which looks like having no other site.

**Approach:**
- **A seventh save state, "Can't sync" (Question 1).** `flush` maps 404 to *gone* and 400/422 to *change*
  (`refusalOf`, pure, in `lib/journal.ts`), stops the backoff, and shows B6's red panel with the ruled sentence. Run
  checks and Switch say the same sentence. A 401 stays Signed out (R-213), and any other failure stays Retrying.
- **The lock row gains a page id** (a `Schema` push first, R-99): two columns, `page_id` (the page that last wrote the
  row) and `page_left` (that page has gone). A leave matches its own page; a late beat from a page that left matches
  nothing; a reload's new page keeps the row.
- **`land()` tells a never-confirmed holder turned reader** what it typed, in `LOCK_COPY.displaced`, and clears its
  journal in memory only.
- **`ShipState.sites` is `null` when the read failed;** the picker says Question 2's sentence in place of the list.

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** Every frame lives in `claude-design-export/Inflozo/`.
  - **Can't sync:** B6's red panel (`B Missing Surfaces.dc.html:1379-1385`), extrapolated as R-213's Signed out was: its
    `danger-tint` fill, radius, padding, ink and type; the title is the state's own word; one link in Retry now's style
    where one is ruled. The indicator is the Kit's (R-142: a Tabler glyph in a filled circle, the label on hover and to
    assistive tech).
  - **The first-moment typist's notice:** B5a's bar (`:1469-1488`), its sentence slot showing `lost` as a displaced
    session's does (`lock-bar.tsx`'s `notice`).
  - **The picker's sentence:** inside 7.18b's picker (undrawn; S8a's card per row, `S8 Deploy.dc.html:50-55`), set as
    its lead paragraph is.
- **One list per thing (R-170).** The panel, Run checks, Switch and every check read one `REFUSED_COPY`
  (`lib/journal.ts`); the picker's sentence is `SWITCH_WORDS.unread`; the notice is `LOCK_COPY.displaced`.
- **R-190's word is "unsynced", never "unsaved"** — which is why the state is "Can't sync" and not "Not saved".
- **The refusal is the route's status, never a guess.** 404 → *gone*; 400 and 422 → *change*; 401 → Signed out; 409 and
  423 unchanged; everything else → Retrying.
- **DW-308's clear is in memory only.** The on-device record is never reset or written by it (the AC: in the
  same-browser race it is the holder's).
- **The page id is opaque.** The route checks it with `isUuid` before it reaches a filter string, and compares it only.
- **R-98:** no new control here starts work; "Go to Projects" is a link. `busy.test.ts` stays green.
- **R-82:** Review and test on production's Supabase and Vercel. This story makes no Ghost call, so no T1 write.

**Ask First:**
- Questions 1 and 2 were ruled (R-275, R-276). Dev builds the ruled options from "Ruled values".
- Applying the Schema migration to production (R-99): an in-session R-83 ask, then the pooler.
- Any string beyond "Ruled values".

**Never:**
- **Other stories' scope:** the advisory lock and its span (7.25, DW-379); history (7.22, DW-380); the first-deploy steps
  (7.19, 7.20).
- **Out of bounds here:**
  - a Retry now on Can't sync;
  - telling "deleted" from "another account" (the route answers both as one 404, `sync/route.ts:189-190`, by design);
  - resetting or rewriting the on-device record from `land()`;
  - Realtime for the lock (R-191);
  - a server read of the sites from the picker (Question 2's option 2, unless ruled).
- Editing `claude-design-export/`, a `record` document or a generated file; writing a count down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Gone (404) | a flush answered 404 | Can't sync, *gone* sentence and Go to Projects; the backoff stops; the journal is kept | a visit back to the tab tries once (Signed out's rule); a 200 then rests green |
| Refused change (400, 422) | a flush answered 400 or 422 | Can't sync, *change* sentence; the backoff stops | the next edit (an Undo included) is sent at once, autosave on or off; a 200 rests green |
| Still refused | an edit or visit sends again and meets 404/400/422 | Can't sync stays, its sentence by the new status | — |
| Signed out (control) | 401 | R-213's Signed out, unchanged | — |
| Dropped (control) | network error, 5xx, timeout | Retrying with its countdown, unchanged | — |
| Run checks after a refusal | the flush ends refused | the wizard says that refusal's sentence; no job | — |
| Run checks, merely unsent | the flush leaves edits owed, no refusal | R-274's sentence, unchanged | — |
| Switch after a refusal | as Run checks | `switchSite` is not called; the refusal's sentence | — |
| Fallback | no IndexedDB, then a refusal | Can't sync, the same sentence (it names no device) | — |
| Close, beat landed first (DW-307) | page P's beat lands, then P's leave | the leave matches P: backdated, `page_left`; free after the grace + one poll | — |
| Close, leave landed first | P's leave lands, then P's in-flight beat | the beat matches nothing; the row stays backdated | — |
| Reload | P leaves, page Q (same session) beats | Q's beat keeps the row (`page_id` Q, `page_left` false) | a late leave from P then matches nothing |
| Back-forward restore | P's pagehide left, then `pageshow` persisted | P mints a new page id; its next beat keeps the row | — |
| Old tab mid-deploy | a page-less beat; a page-less leave | the beat works as today; the leave is a 400 and the row goes stale (~60 s) | transitional only |
| First-moment typist (DW-308) | optimistic holder, typed N edits, first answer: another session's live row | reader; assertive region and B5a say `displaced(N)`; journal empty in memory; nothing sent | N = 0 → nothing said; the record on the device untouched |
| Confirmed holder (control) | the first answer holds | nothing said; editing continues | — |
| Sites unread (DW-381) | the sites or linking read failed | `ShipState.sites` null; the picker says `unread`, no list, no Use this site; Choose a site shows on a project with no site | — |
| Sites read, none (control) | the read succeeded, no other site | as 7.18b: no sentence; no Choose a site | — |

</frozen-after-approval>

## Code Map

Paths under `apps/web/` unless written in full. `E` = `app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`.

**The save (DW-304).**
- `sync/route.ts` (`projects/[id]/sync/`): 401 `:82`; 404 `:85,190` (the RPC's one answer to "not yours" and "no such
  project", `:189`); 400 `:91,93,98,99,115,147`; 422 `:103,107,112,123,125,129`; 423 `:150`; 502 `:162,187`.
- `E` `flush` `:2007-2168`: R-213's 401 `:2078-2085` (its comment names DW-304), 409 `:2086`, 423 `:2102`, the
  throw into the backoff `:2130`, the `catch` `:2151`. `scheduleRetry` `:1982`, `stopRetrying` `:1975`, `rest` `:1754`
  (keeps a flush's state through an edit), `toFallback` `:1762`, `store` `:1773` (fallback flushes every change,
  `:1775-1778`), `retryNow` `:2171`, the visit-back retry `:4478`.
- `E` `flushForShip` `:2502-2507` (true when nothing is left) and `switchSiteNow` `:2532-2535` (R-274's sentence on
  false); the wizard's `flush` prop `deploy-wizard.tsx:290`, mounted `E:6830`; Run checks `deploy-wizard.tsx:473-487`
  (`W.editsUnsent` at `:482`).
- `lib/journal.ts`: `FlushCall` `:251`, `flushDecision` `:262`, the machine's comment `:306-336` (its R-213 paragraph
  names DW-304, `:320-321`), `SyncState` `:337`, `SyncLabel` `:350`, `labelOf` `:358`, `panelOpen` `:368`,
  `SIGNED_OUT_COPY` `:376` (the shape `REFUSED_COPY` follows).
- `components/editor/save-state.tsx`: the panel `:72-126` — its id picks between `editor-retrying` and
  `editor-signed-out` (`:80`), title `:86`, sentence `:92`, the link or Retry now `:99-126`. Mounted `E:5762`.
- `components/kit/persistence-indicator.tsx`: `PersistenceState` `:33-39`, the exhaustive `look` `:43-55` (a seventh
  name will not compile without a fill and a glyph). `components/kit/icons.tsx`: the sync glyphs `:178-222`, each a
  Tabler path at `strokeWidth` 2.5, the header's exceptions `:40-55`; Tabler `x` is `M18 6l-12 12` + `M6 6l12 12`
  (`packages/library/icons/tabler.json`). The Kit page lists every state, `app/(app)/app/(authed)/kit/page.tsx:508-516`.
- `lib/deploy.ts:286` `editsUnsent` (R-274) stays for the merely-unsent case.

**The lock (DW-307, DW-308).**
- `lock/route.ts` (`projects/[id]/lock/`): body `:77` (`beat: heard`), `leaveBeat` 400 `:89`, `beat()` `:117-124`,
  `release` `:126-132`, `leave` `:134-152`, `takeover` `:171-192`, same-session acquire `:220-227`, insert `:209-212`,
  stale CAS `:235-247`. `COLUMNS` `:53` (the read needs no new column).
- `lib/lock.ts`: `leaveStamp` `:57` (kept), `leaveBeat` `:66-73` and `leaveBacks` `:75-78` (go), `LockRow.beat`
  `:112-115` and `rowFrom`'s `beat` `:141` (go), `partyOf` `:184-193`, `LOCK_COPY.displaced` `:314`.
- `lib/lock-client.ts`: `LockCall` `:24-34` (`beat?` goes, `page?` comes), `askLock` `:45`, `judgeThisLoad`'s
  `pageshow` `:142-149` (where a restore mints a new page id), `tabSession` `:174`, `tabSessionKept` `:166`.
- `E`: the opening lock `:1404-1417` (`holder: isStale(heldOnServer)` — the optimistic first paint), `heldGeneration`
  `:1420`, `lost` `:1431`, `poll` `:2585-2625`, `leaving` `:2654-2671` (its `ponytail:` names DW-307), `land`
  `:2310-2372` (the displaced branch `:2319-2336`, the flip `:2362-2371`), `dropJournal` `:2301-2308` (resets the
  record — DW-308 must NOT call it), `owedNow` `:2280`, DW-203's wall and its `ponytail:` naming DW-308 `:2030-2039`,
  the hydrate `:4341-4443` (`reading` `:4341`, the local adopt `:4369-4431`). Every `askLock` call is in `E` (seven).
- `components/editor/lock-bar.tsx:33-60`: `notice` fills B5a's sentence slot; mounted `E:5941`.
- Schema: `edit_locks` `SCHEMA.sql:543-554`; INSERT grant `:1174-1180`; UPDATE grant `:1334-1346`; select/delete
  `:1125`; the guards `:1445-1456`. Latest migration `supabase/migrations/20261020120000_preflight_facts.sql` (the shape
  a 7.18c migration follows: header comment, `add column if not exists`, `comment on`). `edit_locks` has no
  service-role grant (`server/edit-lock.ts:7`), so every proof runs as `authenticated`.
- Readers of the row that do not change: `(editor)/read.ts:314-317`, `server/edit-lock.ts:13`.

**The sites (DW-381).**
- `lib/deploy.ts`: `ShipState.sites` `:583-585`, `shipStateOf` `:610-668` (the log `:626`, the fold `:639`).
  `read.ts:545-552` passes `null` on a failed read; `(editor)/actions.ts:211-212` is the server's own re-read for a
  switch and stays as it is.
- `lib/site-switch.ts`: `SWITCH_WORDS` `:69-86`; `switchPlan` takes `sites`.
- `deploy-wizard.tsx`: `planFor` `:548-549`, `openPicker` `:550-554`, `const sites` `:652`, the picker `:668-771`
  (lead `:672`, the list `:674-703`, Use this site `:712-724`), the no-site card `:787-801` (Choose a site `:792`).

**Tests and harnesses to extend.**
- `journal.test.ts:159-175` (every state named, labels unique, `panelOpen`'s kinds); `flushDecision` rows `:218-272`.
- `lock.test.ts`: the leave tests `:266-318` — `:312` slices the route's source on `leaveBeat(heard)` and asserts the
  heard-beat filter, so it is rewritten for the page filter; `partyOf` `:51,:63`.
- `read.test.ts:67-83` (`:82-83` asserts a failed read is `[]` — flipped); `site-switch.test.ts:24-73,:99`;
  `deploy.test.ts:217,232`; `settings.test.ts:199` (a `LockRow` fixture with `beat`).
- Harness `app/(app)/app/harness/editor/layout.tsx`: headers `:60-137`, `READER_LOCK` `:171-179` (has `beat`), `shipOf`
  `:386-403`, `withPreflight` `:408`; its own `acquire` reaches no database, so journeys answer `**/lock` themselves.
- `tools/keyboard/journey.spec.mjs`: R-213's journey `:6165-6227` — its loop `:6216-6227` asserts 422/502/404/400 stay
  Retrying (flipped for 404/400/422; 502 stays the control); DW-241 `:6383` (`row()` `:6386`); DW-244 `:6455`; DW-223's
  held route `:6536-6560`; D8g's intent filter `:8786-8800`; the picker block `:9039` (`sitePicker` `:9053`), the
  no-site control `:9139-9146`, unsent switch `:9191`.
- `tools/probe/run-verify-editor.cjs`: step 61 glyphs `:3429-3450` (`glyph58`, "six states" `:3431`), step 66c `:3592`,
  step 69 `:3661-3702`, step 8 Signed out `:7008-7164`; the last step is 114 (`:12207-12634`).
- `tools/probe/run-verify-lock.cjs`: DW-240 (a) `:738-776`, (b) `:779-822`, DW-244 `:827-915`, the first-frame reader
  `:310-333`.
- RLS gate: `supabase/tests/rls.sql` is byte-identical to the architecture `RLS-TEST.sql` (`run-rls-gate.sh:34-48`
  refuses drift; `:90-98` diffs SCHEMA.sql against the migrations). Templates: the column-grant audit `:585-608`
  (`edit_locks` at `:596`), the F4 CAS block `:816-890` (the heartbeat filtered on the holder `:875-880`), and
  7.18b's block `:2679-2789` (coalesce on a comment `:2708`, a statement run twice with `row_count` `:2730-2749`). The
  withheld-migration control is manual (MEASUREMENTS:3576-3578).

## Tasks & Acceptance

**Dev gate.** Both questions are ruled (R-275, R-276). The Schema push is made, green, and applied to production on the
owner's in-session go (R-99), before any code that writes the columns is pushed. Every production call — the apply, the
lock walk's control, the walks — runs in the orchestrating session on the owner's in-session go, never in an
implementation subagent (the owner's go of 2026-10-20 covers the apply and one lock-walk control run before the Dev push).

**Execution — the `Schema` push (alone, first; R-99):**
- [x] `supabase/migrations/20261021120000_edit_lock_page.sql` -- add `edit_locks.page_id text` (null, or 1–64
  characters) and `page_left boolean not null default false`; grant `authenticated` INSERT (`page_id`) and UPDATE
  (`page_id`, `page_left`); a `comment on` each naming DW-307 and what it holds; re-runnable (`if not exists`); the header
  says why no service-role grant -- the leave's own page, in a column (DW-307).
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the two columns in
  `edit_locks` (`:543-554`) and both grant lines (`:1177-1180`, `:1343-1346`) -- the gate diffs it against the migrations.
- [x] `…/RLS-TEST.sql`, then copied byte-identical to `supabase/tests/rls.sql` -- the column-grant audit gains the new
  grants; a **7.18c block**: (1) both columns' types, default and comments (coalesce, as 7.18b's); (2) as the tenant on
  its own lock, the Design Notes' two statements in every ordering, each `row_count` asserted — P's beat then P's leave
  → 1; P's leave then P's beat → 0 and the row still backdated; P's leave then Q's beat → 1 with `page_id` Q and
  `page_left` false; Q's beat then P's leave → 0; a leave over a row already older than the stamp → 0; (3) the
  control: the heard-beat leave after P's in-flight beat → 0 (DW-307 reproduced, so the fixture is real); (4) another
  tenant's lock unchanged by each -- one gate, run in Postgres.

**Execution — Dev:**
- [x] `lib/journal.ts` -- `SyncState` gains `{ kind: 'refused'; why: 'gone' | 'change' }`; `SyncLabel` and `labelOf`
  the ruled label; `panelOpen` includes it; `refusalOf(status)` (404 → `'gone'`, 400 · 422 → `'change'`, else null);
  `REFUSED_COPY` (title, `gone`, `change`, `projects`) from "Ruled values"; the machine's comment says seven states and
  drops the DW-304 sentence -- one pure rule `node --test` reaches.
- [x] `components/kit/icons.tsx`, `components/kit/persistence-indicator.tsx`, `app/(app)/app/(authed)/kit/page.tsx` --
  `SyncRefused` (Tabler `x`, noted in the header's list) and the seventh `look` row on `bg-danger-text`; the Kit page
  shows it -- R-142's indicator, one more state.
- [x] `components/editor/save-state.tsx` -- the refused panel in B6's shape: id `editor-refused`, `REFUSED_COPY.title`,
  its sentence by `why`, **Go to Projects** (a link in Retry now's style, same tab) for `gone` only, nothing for
  `change` -- B6 extrapolated as R-213's was.
- [x] `E` -- `flush`: `refusalOf(answer.status)` before the `!answer.ok` throw → stop the backoff, `attempt` 0,
  `signedOut` false, `setSync({ kind: 'refused', why })`, keep the journal, no retry; `rest` keeps `refused` as it keeps
  `retrying` and `signed-out`; a 200 leaves it; `store` sends an edit at once while `why` is `change`; the visit back to
  the tab (`:4478`) tries once while refused; `flushForShip` answers `null` (all sent), the refusal's sentence, or
  `DEPLOY_WORDS.editsUnsent`; `switchSiteNow` refuses with that sentence; the comments at `:2078-2080` updated -- DW-304.
- [x] `components/editor/deploy-wizard.tsx` -- `flush: () => Promise<string | null>`; Run checks says the sentence it
  answers (`:477-486`) -- Pre-flight's own flush tells the truth.
- [x] `lib/lock.ts` · `lib/lock-client.ts` -- delete `leaveBeat`, `leaveBacks`, `LockRow.beat` and `rowFrom`'s `beat`;
  `pageId()` minted once per page load, re-minted on a `pageshow` that is `persisted`; `LockCall.page` replaces `beat`
  -- DW-307's client half.
- [x] `lock/route.ts` -- `page` read and checked with `isUuid` (400 `Bad page`), required for `leave`; `beat()`, the
  insert, the stale CAS and `takeover` write `page_id` (and `page_left: false`) when a page is sent, `beat()` with
  `.or('page_left.is.false,page_id.neq.<page>')`; `leave` as Design Notes (`.eq('page_id', page)`,
  `.eq('page_left', false)`, `.gt('heartbeat_at', leaveStamp(now))`, writing `page_left: true`); the file's header
  rewritten -- DW-307's server half.
- [x] `E` -- every `askLock` carries `page: pageId()`; `leaving` sends `{ intent: 'leave', session, page }` (release
  where `tabSessionKept` is false, as now); the `ponytail:` at `:2659-2664` replaced by what now holds -- DW-307.
- [x] `E` -- `land()`: an optimistic holder (`was.holder`, `heldGeneration` null) whose answer is another session's
  live row: `typed` = this page's edits (`adoptedUpTo`), the in-memory journal emptied (state and `latest`, never
  `local.current`), the indicator rested, and when `typed > 0` `setAnnounced`/`setLost(LOCK_COPY.displaced(typed))`;
  the hydrate records `adoptedUpTo` and asks `latest.current.lock.holder` again after its read; the `ponytail:` at
  `:2034-2038` rewritten (Design Notes' ceiling) -- DW-308.
- [x] `lib/deploy.ts` · `lib/site-switch.ts` · `deploy-wizard.tsx` -- `ShipState.sites: readonly SwitchSite[] | null`
  (null: the sites or linking read failed); `SWITCH_WORDS.unread`; the picker draws it as its lead's next paragraph in
  place of the list and Use this site, and says it in the polite region on open; "Choose a site" shows when `sites` is
  null or non-empty; every reader of `sites` handles null -- DW-381.
- [x] `app/(app)/app/harness/editor/layout.tsx` -- `x-inflozo-harness-ship: sites-failed` (as `full`, `sites: null`),
  documented with the other shapes; `READER_LOCK` loses `beat` -- the journeys' state.
- [x] `journal.test.ts` · `lock.test.ts` · `read.test.ts` · `settings.test.ts` · `deploy.test.ts` -- `refusalOf` over
  every status the route answers (401, 409, 423, 502 and a network failure as controls); seven distinct labels and
  `panelOpen`'s three kinds; `REFUSED_COPY`; the route's beat and leave statements read from its source (as `:312`
  does) with the page filters; `pageId` stable within a load; `shipStateOf` → `sites: null` on either failed read,
  `[]` on a read with none; the `beat` fixtures gone -- the I/O matrix's pure rows.
- [x] `tools/keyboard/journey.spec.mjs` -- (a) R-213's loop flipped: 404 → gone panel with Go to Projects, 400 and
  422 → change panel, no `/sync` request for 6 s after each (502 still Retrying, the control); an Undo in *change* sends
  at once and a 200 rests green; (b) Run checks and Switch after a 422 say the change sentence (an aborted sync, R-274's
  — the control); (c) DW-308: the first `acquire` held (D8g's intent filter + DW-223's held route), one edit typed,
  the acquire answered with another session's live row → the assertive region and `#editor-lock-reason` say
  `displaced(1)`, no `/sync` request, the IndexedDB record's journal as it was before the answer; control: the same
  with `held: true` says nothing; (d) `sites-failed` → the picker's sentence, no radio, no Use this site, Choose a site
  on a no-site project; the empty-sites control at `:9139` unchanged -- every behaviour with its control.
- [x] `tools/probe/run-verify-editor.cjs` -- **step 115** on production: (a) a throwaway project, deleted from a second
  page; the editor's ⌘S → Can't sync, the *gone* sentence, the `x` glyph (`glyph58`), Go to Projects, and no `/sync`
  for 6 s; (b) DW-308 with two pages of one context — B's first acquire held until A holds and B has typed — then B
  says `displaced(1)` and sends nothing; step 61's comment says seven states -- R-82 on the real stack.
- [x] `tools/probe/run-verify-lock.cjs` -- a DW-307 stop beside DW-240's: the holder's beat reaches the server but its
  answer is held (`route.fetch`, then hold), the holder closes, the reader acquires within the grace plus one poll;
  its control is the same stop run against production before the Dev push lands, where the wait is ~60 s -- the bug
  shown, then gone.
- [x] Docs -- PRD FR-D10 (`:228`), FR-D18 (`:238`), the data model (`:697`) and Appendix H (`:1457`, seven names);
  EXPERIENCE `:158`, `:186`, `:319`, `:375-376` (a Can't sync row), `:554`, `:768`, F2 `:1049`; `addendum.md` `:44`,
  `:47`, `:71`; MEASUREMENTS §65 (a dated note: closed by the page id, `:4386`'s "Story 7.18" corrected) and §87 (the
  gate's orderings and the walk's stop, with output); R-228's entry (a closing note); `epics.md:1776` (a dated note on
  5.8's "sixth"); DW-304, DW-307, DW-308, DW-381 closed with resolutions; the epic context's 7.18c sub-bullet -- each
  finding reaches its document, then `grep -rn` for "six states", "only six", `leaveBeat`, `leaveBacks` and
  "connection returns" finds nothing stale (standing rule 7).

**Acceptance Criteria:**
- Given an open editor whose save the route refuses with 404, 400 or 422, when the flush answers, then the indicator
  is **Can't sync** with that cause's ruled sentence, nothing says "when the connection returns", and no retry runs.
- Given any refusal for good, when Run checks or Switch flush first, then the wizard says the same sentence and starts
  nothing.
- Given the editing window closes while its check-in is in flight — in either order of landing — when the other window
  polls, then it takes the lock within the leave's grace plus one poll; and a reload still keeps the lock.
- Given a window that typed before its first answer and then finds another session editing, when it turns
  read-only, then it is told "This session had N unsynced edits; they were not included." with N its own typing, and
  the record on the device is untouched.
- Given the sites read failed, when the picker opens, then it says Question 2's sentence and draws no empty list.
- Given each surface, when compared with its frame, then it matches: Can't sync's panel B6's red panel
  (`B Missing Surfaces.dc.html:1379-1385`) as Signed out extends it; the notice B5a's bar (`:1469-1488`) with the
  sentence in its slot; the picker's sentence 7.18b's picker, set as its lead.
- Given the migration withheld, when the RLS gate runs, then the 7.18c block aborts at its first check.

### Review Findings

Five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor as subagents; the Real-infra verifier in
the main session, on the owner's in-session go). 1 decision for the owner, 15 patches (all applied), 5 deferred, 11 dismissed.

- [x] [Review][Decision] One sentence for a failed sites read — the Sites page's own and R-276's picker sentence say one
  failure two ways (R-170). Question 3, ruled option 1 (R-277), built.
- [x] [Review][Patch] An Undo landing while a refused save is out was never sent [`(editor)/editor.tsx` `flush`'s refused branch]
- [x] [Review][Patch] Autosave's 3-minute tick re-sent a refused save in both causes [`(editor)/editor.tsx` the timer effect]
- [x] [Review][Patch] The hydrate's second "still holder?" came before its last await [`(editor)/editor.tsx` the hydrate]
- [x] [Review][Patch] The lock walk's DW-307 stop had no control left to run [`tools/probe/run-verify-lock.cjs` `flightStop`]
- [x] [Review][Patch] The beat's refusing `or` half ran nowhere on the real stack [`tools/probe/run-verify-lock.cjs`]
- [x] [Review][Patch] The stop counted any leave, and logged a `beat` field the client no longer sends [`tools/probe/run-verify-lock.cjs`]
- [x] [Review][Patch] Walk step 115a expected Projects for an account left with no project (the app sends it to `/start`) [`tools/probe/run-verify-editor.cjs`]
- [x] [Review][Patch] "Every ordering" overclaimed: P's late beat after Q's names P again [`lock/route.ts` header · `supabase/tests/rls.sql` (2f)]
- [x] [Review][Patch] The other tenant's final check passed with the row missing [`supabase/tests/rls.sql` · `RLS-TEST.sql`]
- [x] [Review][Patch] The length check was claimed, never exercised [`supabase/tests/rls.sql` · `RLS-TEST.sql`]
- [x] [Review][Patch] The insert check's `[^}]*` let a `page_left` through; `...mark` counted, not placed; `STALE_MS` unpinned [`apps/web/lock.test.ts`]
- [x] [Review][Patch] No journey for: a take-over while Can't sync, a fall-back while Can't sync, `adoptedUpTo`, the hydrate's second ask [`tools/keyboard/journey.spec.mjs`]
- [x] [Review][Patch] DW-307's resolution claimed a red-then-green walk that never ran [`deferred-work.md`]
- [x] [Review][Patch] A restated "four journeys" missed two [`epic-7-context.md`]
- [x] [Review][Patch] Step 115's comment restated "six seconds" [`tools/probe/run-verify-editor.cjs`]
- [x] [Review][Defer] A 413 (or any status outside 404/400/422) still Retrying for ever [`lib/journal.ts` `refusalOf`] — deferred, pre-existing (DW-383, Story 15.5)
- [x] [Review][Defer] The save panel's sentence is never said to a screen reader [`components/editor/save-state.tsx`] — deferred, pre-existing (DW-384, Story 15.2)
- [x] [Review][Defer] An editor open on a deleted project polls the lock route into a 502 every heartbeat [`lock/route.ts`] — deferred, pre-existing (DW-385, Story 15.5)
- [x] [Review][Defer] The sync route's 423 path can reset the holder's on-device record in DW-308's window [`(editor)/editor.tsx` `flush`] — deferred, pre-existing (DW-386, Story 15.5)
- [x] [Review][Defer] The lock route's page-id statements run nowhere in CI [`lock/route.ts`] — deferred, pre-existing (DW-387, Story 15.1)

## Spec Change Log

**Dev (2026-10-20) — readings and departures, each a routine call told in one line (none changes what a surface does):**
- **`pageId`'s test lives in `tab-session.test.ts`,** beside the module-per-load harness `lock-client.ts`' other per-load rule
  already uses; `lock.test.ts` holds the route's statements.
- **The harness has two failed-sites shapes:** `sites-failed` (as `full`, `sites: null`) and `sites-failed-unlinked` (no site,
  `sites: null`) — journey (d)'s "Choose a site on a no-site project" needs the second.
- **Can't sync stays drawn while the edit that may cure it is out,** as Signed out stays through its attempt (R-213), so the
  panel never flickers shut once per keystroke; a 200 then rests green.
- **The DW-308 branch is the spec's own condition** (`was.holder`, `heldGeneration` null, another session's row), so it also
  reaches a holder whose row vanished and whose re-acquire met another session's row (the poll clears `heldGeneration`
  first): that tab too is told what it typed, rather than keeping it unsent and unsaid.
- **`leaving` no longer releases when it heard no beat:** a kept tab always sends `leave` with its page (a page that never
  wrote the row matches nothing), and a tab whose id is not kept still releases.
- **Go to Projects is a plain link** (`/` on `app.inflozo.com`, `/app` on localhost — the sync route's prefix rule), a full
  navigation in this tab, as Sign in is a plain link.
- **`actions.ts` changes by one optional chain** (`sites?.[0]`): `shipStateOf`'s `sites` is nullable in its type; the
  server's re-read is otherwise as it was.
- **Walk step 115b opens B before A** (the main session, at the audit): B must paint optimistically, which it cannot once A's
  live row is in its own server render.
- **The lock walk's DW-307 stop runs after DW-244's**, with both sessions put back in the editor first, so DW-244 runs in the
  state it always ran in (the main session, after its first production run).
- **Walk step 115 uses its own throwaway account `editor-harness-e-…`,** and the walk's start sweep now catches a killed
  run's `e` account too.
- **MEASUREMENTS §65 keeps its 2026-10-02 text** (an execution record naming the heard-beat helpers as they were then), with a
  dated note that the page id closed it — so the standing-rule-7 grep still finds those two names there and nowhere live.
  Retrying's own sentence ("…when the connection returns") is unchanged: a dropped connection does return.

**Review (2026-10-20) — five layers, then production in the main session; every patch a routine call that makes the frozen
intent true where it was not, none changing what a surface is meant to do. One finding is the owner's: Question 3.**
- **The Undo that cures *change* is never left unsent.** An edit that landed while a save was out sent nothing (one request at a
  time, and `store` sends at once only once the refusal is known), so an Undo made in that moment sat under "Undo it" until
  the next edit. Now a *change* refusal whose journal moved since the request left sends again the moment it lets go; the
  same refusal again moves no stamp, so it cannot loop.
- **No clock re-sends a refused save.** Autosave's 3-minute tick still sent while Can't sync held, in both causes — against
  AC 1's "no retry runs" and the comments' "only a visit back tries again". The tick now skips while it holds; an edit
  (*change*) and a visit back (both) still ask. The harness gained `x-inflozo-harness-autosave: on` to show it.
- **The hydrate asks "still holder?" after its last await too** (`parseStoredCards`), where the adopt follows — the Dev's ask
  sat one await early.
- **The lock walk's DW-307 stop got a control it can run**: the same stop with a leave that cannot match (its page taken out,
  the route's 400), which must NOT free the lock within the grace and one poll — the ~60 s the bug cost, shown on the real
  stack in the same run. The stop also requires a leave naming its page that MATCHED (`won`), reads the row from the going
  tab's Projects page (the other session reloads the moment it gains), and beats once from the page that left — the `or`'s
  refusing half, which nothing reached on the real stack.
- **Walk step 115a** seeds E's other project before Go to Projects: an account left with no project is sent on to `/start`
  (the app's own rule; the Review's first run met it), so the list it lands on is the control.
- **One three-event ordering still misses** — P leaves, Q beats, then P's in-flight beat lands and names P again; Q's leave
  before its next beat then misses (~60 s, once) and Q's next beat heals it. Named as a `ponytail:` beside the route's
  statements and asserted as it is by the RLS block's (2f); the "every ordering" claims now say which.
- **Checks that could not fail:** the other tenant's final check is read `into strict` (three null subqueries passed it with
  the row gone); the length check is exercised (empty and 65 characters, 23514); `lock.test.ts` reads the whole insert
  object, places `...mark` in the take-over and the stale CAS, and pins `STALE_MS - LEAVE_GRACE_MS` to the block's 50 s.
- **New journeys, each red against the code without what it holds:** the in-flight Undo; the tick's silence (with its control,
  the tick that does send an owed edit); a take-over while Can't sync (the indicator leaves it); a fall-back while Can't sync
  (the panel stays — every edit then goes up, the control); a reload that adopted an owed edit and typed one more is told 1;
  an answer landing while this device's copy is still opening adopts nothing.
- **Owner's manual test step 6** says what an alias with no other project sees (the New project screen).
- **Question 3, ruled option 1 the same day (R-277):** the Sites page's banner for a failed read says R-276's sentence. It
  lives once, as `SITES_EMPTY.unread` (`lib/connect-rule.ts`, the Sites list's words), and `SWITCH_WORDS.unread` reads it;
  the page's own literal is gone.
- **Deferred, each with an owner on its card** (`deferred-work.md`, `epics.md`): DW-383 (a 413 still Retrying, 15.5), DW-384
  (the panel's sentence never said to a screen reader, 15.2), DW-385 (a deleted project's editor polling into 502s, 15.5),
  DW-386 (the sync route's 423 path resetting the holder's record in DW-308's window, 15.5), DW-387 (the lock route's
  statements in CI, 15.1); DW-382 re-owned to 15.1 with the Review's runs.
- **Dismissed after reading the code:** 400 as *change* (R-275's table; every 400 the route answers is a body the editor's own
  client cannot send); no control on *change*, and fallback's *change* naming no tab (both ruled — the matrix's Fallback
  row); a deleted project's record kept on the device (the matrix: "the journal is kept"); the DW-308 branch reaching a
  holder whose row vanished, and counting only this page's typing (the Dev's change log and Design Notes); a first answer
  with no row (unreachable: an acquire answers its row or a 502); the wizard's `?? W.editsUnsent` (the type needs it);
  `deploy.test.ts`' source regexes (the journeys execute the same); *gone*'s other-account cause on production (the owner's
  test, steps 8–10); a `page_left` row in the F3 audit (F3 lists server-asserted columns; the 7.18c block asserts the grant).

## Design Notes

**Ruled values — the one table the two questions set.** Dev builds this table; a different ruling changes it and nothing
else. *(Ruled: option 1 of each — R-275 and R-276, owner, 2026-10-20.)*

| Key | Value (option 1) | Where |
|---|---|---|
| The state's label and panel title | **Can't sync** | `SyncLabel`, the Kit's `PersistenceState`, `REFUSED_COPY.title` |
| Its glyph | Tabler `x` in the red circle (`bg-danger-text`), as Retrying and Signed out are red | `SyncRefused`, `kit/icons.tsx` *(routine judgement)* |
| *gone* (404) | "Your changes can't reach this project: it was deleted, or this browser is now signed in to another account." | `REFUSED_COPY.gone` |
| *gone*'s link | **Go to Projects** → the app's Projects page (`shell.tsx:53`'s `/`), same tab | `REFUSED_COPY.projects` |
| *change* (400, 422) | "Inflozo couldn't accept your latest change. Undo it, and your work will sync again." | `REFUSED_COPY.change` |
| *change*'s control | none — Undo sits beside the indicator (R-143), and an edit in this state is sent at once | — |
| Run checks and Switch after a refusal | the panel's sentence, word for word | `flushForShip` |
| The picker, sites unread | "Your connected sites couldn't be loaded just now. Reload the page to try again." | `SWITCH_WORDS.unread` |
| The Sites page, sites unread *(Question 3, the Review — R-277)* | the same sentence, one line of words read by both | `SITES_EMPTY.unread`, which `SWITCH_WORDS.unread` reads |

**Why a seventh state and not Retrying's words.** R-213 set the precedent: a refusal of a different kind gets its own
state in the same red panel, and Retrying keeps meaning "the connection, and it will pass". A countdown over a refusal
that cannot pass is the false sentence DW-304 is about. *gone* still tries once on a visit back to the tab, because
signing back in to the right account cures it (the cookie jar is shared — R-213's executed fact).

**The lock's page id, every ordering of a beat and a leave** (P is the going page, Q its reload, both with the tab's one session `S`):

```
beat/acquire(X):  set heartbeat_at = now, page_id = X, page_left = false
                  where holder = S and (page_left = false or page_id <> X)
leave(P):         set heartbeat_at = leaveStamp(now), page_left = true
                  where holder = S and page_id = P and page_left = false and heartbeat_at > leaveStamp(now)
```

- P beats, its beat lands, then P leaves: `page_id` is P → the leave matches (DW-307's case).
- P leaves, then P's in-flight beat lands: `page_left` and `page_id = P` → the beat matches nothing.
- P leaves, Q beats inside the grace: `page_id <> Q` → Q keeps the row (DW-240 unchanged).
- Q beats, then P's late leave: `page_id` is Q → nothing (DW-240's second stop unchanged).
- `heartbeat_at > leaveStamp(now)` is `leaveBacks` moved into the statement: a row already stale is never revived.
- The page id is minted once per page load in `lock-client.ts` and again on a back-forward restore (`pageshow` with
  `persisted`), whose `pagehide` already left.
- A takeover and a stale acquire write the new holder's page too. Hand over's `release` and a tab whose id this
  browser does not keep (`tabSessionKept`) still DELETE.
- Mid-deploy, a page-less beat works as today and a page-less leave is a 400; that old tab's row goes stale in ~60 s,
  R-228's ceiling, once.

**DW-308's count is what this page typed.** `unsyncedEdits` over the journal with `synced` raised to the highest seq
the hydrate adopted (`adoptedUpTo`). Otherwise a tab that adopted the on-device record's leftovers — which the holder in
the same browser adopted too and will send — would be told they "were not included". The hydrate also asks again after
its read: a session that turned reader meanwhile adopts nothing (DW-203's rule).
`ponytail:` the on-device record keeps what this page typed (the AC: in the same-browser race it is the holder's). On
another device, a later gain of the lock re-reads it by §AD1.1, so it comes back only if the holder wrote nothing since.

## Owner's manual test

You test as **`umngkmr+site718@gmail.com`** (on Pro since Story 7.18b's test), and once as your own account. Use **two
tabs of one Chrome window** unless a step says windows. Addresses that need a project's id are written `<A>` (Throwaway
7.18c) and `<B>` (Account 7.18c): copy each from the address bar when it opens.

Not in this test, because no hand can make them happen: the split second in which a closing window checks in, typing
before the server's first answer (well under a second), a change Inflozo refuses, and a failed read of your sites. The
machine proves each (Verification).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+site718@gmail.com` | The New project screen (the alias has no project yet; it is on Pro). |
| 2 | `https://app.inflozo.com/` | New project (tab 1) | Press **New project** in the top bar → **Blank canvas**, name it, create. | `Throwaway 7.18c` | Its editor opens: project **A**. |
| 3 | `https://app.inflozo.com/` | Projects (tab 2) | Open a second tab here. On **Throwaway 7.18c** press ⋯ → **Delete**, type its name and confirm. | `Throwaway 7.18c` | It leaves the list. |
| 4 | `https://app.inflozo.com/projects/<A>` | Editor (tab 1) | Press ⌘K, add any design, then press ⌘S. Hover the save icon. | — | The icon turns red with an ✕, and hovering says **Can't sync**. A red panel opens under it: "Your changes can't reach this project: it was deleted, or this browser is now signed in to another account." and **Go to Projects**. There is no countdown. |
| 5 | `https://app.inflozo.com/projects/<A>` | Editor (tab 1) | Wait one minute. | — | Still **Can't sync**; it never says "Retrying". |
| 6 | `https://app.inflozo.com/projects/<A>` | Editor (tab 1) | Press **Go to Projects**. | — | Projects, without Throwaway 7.18c. (If the alias has no other project, Inflozo goes on to the New project screen instead — that is right too.) |
| 7 | `https://app.inflozo.com/` | New project (tab 1) | Press **New project** in the top bar → **Blank canvas**, create. In its editor add any design and press ⌘S. | `Account 7.18c` | Project **B**; the icon is the green check. |
| 8 | `https://app.inflozo.com/` in tab 2 | Account menu | Sign out. Sign in as **your own account** in tab 2 and open its link. | `umngkmr@gmail.com` | Your own Projects in tab 2. |
| 9 | `https://app.inflozo.com/projects/<B>` | Editor (tab 1) | Click tab 1 and add another design. | — | The icon turns red: **Can't sync**, with step 4's sentence. |
| 10 | `https://app.inflozo.com/` in tab 2 | Account menu | Sign out, sign in as the alias again, then click back to tab 1. | `umngkmr+site718@gmail.com` | Within a few seconds the icon is the green check again: the work reached project B. |
| 11 | `https://app.inflozo.com/projects/<B>` in two **windows** side by side | Editor | Open B in a second window: one window edits, the other reads along. Close the one that edits. Once the other can edit, open B in a new window and close the editing one again — three times in all. | — | Each time, within about 15–25 seconds, the remaining window's reading-along bar goes away and you can edit there. |
| 12 | `https://app.inflozo.com/projects/<B>` in the same two windows | Editor | With both windows open, press reload in the window that edits. | — | It comes back still editing; the other window keeps reading along. |
| 13 | `https://app.inflozo.com/` | Projects | Delete **Account 7.18c** (type its name). | `Account 7.18c` | The alias holds no project again, as it did before this test. |

## Questions for the owner

Questions 1 and 2 were ruled on 2026-10-20, each option 1 (R-275, R-276); Question 3, raised at the Review, was ruled the
same day, option 1 (R-277). "Ruled values" in Design Notes holds what they set; none is open.

### Question 1 — When Inflozo can never save your work, what does the save message say?

**In plain English.** Sometimes Inflozo refuses a save in a way that trying again can never fix: the project was deleted
in another window, this browser is now signed in to a different account, or Inflozo could not accept a change (a fault
on our side; rare). Today the save icon turns red, counts down, says "we will send it when the connection returns", and
retries for ever. Run checks then says "Try again once they're saved." Both are untrue.

**An example.** "Field Notes" is open in the editor. In another tab you delete Field Notes from Projects. Back in the
editor you change a heading, and the icon says: "Retrying, second attempt — Your work is safe on this device. Nothing is
lost if you close the tab — we will send it when the connection returns." It never will.

1. **(RECOMMENDED) A seventh state, "Can't sync", in the same red panel; the retrying stops; one sentence per cause.**
   - Project deleted, or another account: "Your changes can't reach this project: it was deleted, or this browser is now
     signed in to another account." with a **Go to Projects** link. Coming back to the tab tries once more, so signing
     back in to the right account recovers on its own.
   - A change refused: "Inflozo couldn't accept your latest change. Undo it, and your work will sync again." The Undo
     arrow sits right beside the icon, and the next change is sent at once.
   - Run checks and Switch say the same sentence.
2. **The same "Can't sync" state with one sentence for every cause:** "Your latest changes can't reach Inflozo, and
   trying again won't help." No link.
3. **Keep "Retrying" and its countdown,** and only drop "when the connection returns" for these three. It still retries
   for ever, uselessly.

**Ruled: option 1 (owner, 2026-10-20) — R-275.** *"A seventh state, "Can't sync", in the same red panel; the retrying
stops; one sentence per cause."*

### Question 2 — If Inflozo cannot load your connected sites, what does the site list say?

**In plain English.** When the editor opens, it reads your connected Ghost sites for the deploy wizard's **Switch** list.
If that read fails (rare: a database hiccup), the list opens empty today, which looks like you have no other site.

**An example.** You have three connected sites. You press Ship it → **Switch**, and the list is empty except for "Go to
Sites".

1. **(RECOMMENDED) A sentence in place of the list:** "Your connected sites couldn't be loaded just now. Reload the page
   to try again." Go to Sites and Back stay. On a project with no site, **Choose a site** still shows, so the sentence
   is reachable there too.
2. **The same sentence with a "Try again" button** that reads the sites again without reloading the page. A little more
   to build.
3. **Hide Switch and Choose a site** when the read fails; only Go to Sites stays. Nothing explains why.

**Ruled: option 1 (owner, 2026-10-20) — R-276.** *"A sentence in place of the list: "Your connected sites couldn't be
loaded just now. Reload the page to try again." Go to Sites and Back stay. On a project with no site, Choose a site still
shows, so the sentence is reachable there too."*

### Question 3 — The same failure has two sentences. Should they be one?

**In plain English.** When Inflozo cannot load your connected sites, two places now say so, in different words. The Sites
page (since before this story) says one sentence; the deploy wizard's site list (your Question 2 ruling) says another. Your
rule is one name for one thing (R-170). Changing the Sites page is outside what you ruled, so it is yours to say.

**An example.** A database hiccup while you work. On **Sites** you read "We couldn't load your sites just now. Try again in
a moment." In the editor, Ship it → **Switch** reads "Your connected sites couldn't be loaded just now. Reload the page to
try again."

1. **(RECOMMENDED) One sentence, yours from Question 2, in both places.** The Sites page also says "Your connected sites
   couldn't be loaded just now. Reload the page to try again." — reloading works there too. One line of words, read by both.
2. **Keep both as they are.** Each page keeps its own sentence.
3. **One sentence, the Sites page's, in both places.** The wizard says "We couldn't load your sites just now. Try again in a
   moment." instead.

**Ruled: option 1 (owner, 2026-10-20) — R-277.** *"One sentence, yours from Question 2, in both places. The Sites page also
says "Your connected sites couldn't be loaded just now. Reload the page to try again." — reloading works there too. One line
of words, read by both."*

## Verification

R-82's real services for this story: production's **Supabase** (the migration, applied through
`SUPABASE_DB_POOLER_URL` on the owner's in-session go, read back) and **Vercel** (`app.inflozo.com`). No Ghost call is
made, so T1 is not touched (R-238).

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, with the 7.18c block's PASS lines; on a scratch copy without
  the migration (MEASUREMENTS:3576-3578's method) it aborts at the 7.18c block's first check.
- Production, after the apply -- expected: `information_schema.columns` shows `edit_locks.page_id` (text, nullable) and
  `page_left` (boolean, not null, default false), `col_description` both comments, and
  `information_schema.column_privileges` the INSERT and UPDATE grants to `authenticated`.
- `pnpm check` -- expected: green; the new `journal.test.ts`, `lock.test.ts` and `read.test.ts` cases among the package's
  own printed count.
- `pnpm keyboard` -- expected: green, the four new journeys with their controls passing; each new assertion first seen
  red against HEAD's behaviour (R-213's loop still says Retrying for 404 at HEAD).
- `node tools/probe/run-verify-lock.cjs` against production -- expected: the DW-307 stop waits ~60 s before the Dev push
  lands (red, the control) and frees within the grace plus one poll after it; DW-240 (a) and (b) still green, which
  executes PostgREST's `or` filter on the real stack.
- `node tools/probe/run-verify-editor.cjs` from a clean worktree at the deployed sha -- expected: step 115 PASS, and
  steps 8, 61 and 69 unchanged.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.
- `grep -rn --exclude=.env -e 'leaveBeat' -e 'leaveBacks' -e 'only six' -e 'six states' apps tools _bmad-output/planning-artifacts`
  -- expected: nothing stale.

**Manual checks:**
- The owner walks "Owner's manual test" on `app.inflozo.com` after Deploy (R-80).

**Executed — Dev (2026-10-20, Node 24.18.1, on the Schema head 28ce5f6e; an implementation subagent — no production call):**
- `pnpm check` — exit 0 (lint, typecheck and every package's tests, each suite's own printed count: library 285, ghost-shim 47,
  section-runtime 441, theme-compiler 220, app 941, tools 13; 0 failing). Mutation checks, each restored green: `refusalOf` with
  400 dropped, the route's leave without `.eq('page_left', false)`, and `shipStateOf` folding a failed read to `[]` each turned
  a test red.
- `pnpm keyboard` — exit 0, 287 passed (19.9 min); the DW-308 journey re-run alone after its hydration wait was added, 1
  passed. The four new or flipped journeys were first seen RED against HEAD's behaviour (the refusal branch, the DW-308
  branch and the unread-sites flag each put back as HEAD has them): R-213's loop at "404 is Can't sync" (Received
  "Retrying"); DW-308 at "said assertively" (Received ""); Run checks after a 422 at the change sentence (Received R-274's);
  R-276 at "sites-failed: the ruled sentence" (not found). Their controls (a 502, an aborted save, `held: true`, the
  empty-sites read) passed.
- **The main session's Matrix Test Audit (four rows with no check in their state), closed:** "Gone (404)"'s error column and
  "Still refused" by a visit and by an edit — journey `7.18c · R-275, the error column` (the record on this device unchanged
  after the 404 and Undo still live; a visit back sends exactly one request at once, a 404 keeping *gone*, a 200 resting on
  Synced; in *change* an edit goes up at once and a 404 switches the panel to *gone*'s sentence and Go to Projects);
  "Fallback" — `7.18c · R-275 in fallback` (R-227's erase, then 404 and 422 each Can't sync with its sentence, nothing about
  the device); "DW-308, N = 0" — the DW-308 journey's third arm (a reader, the assertive region and B5a's sentence
  unchanged, no `/sync`, the record untouched). `--repeat-each 3`: 9 passed. Red first, each at its own line: HEAD's refusal
  branch → "Can't sync" received "Retrying" (error column, and fallback's "404: Can't sync, in fallback too"); HEAD's visit
  back → "the visit back sent one request at once" received 0; no send-at-once in *change* → "the edit itself went up, at
  once" received 0; the `typed > 0` guard removed → "the assertive region unchanged" received "This session had 0 unsynced
  edits; they were not included." Restored, then `pnpm check` exit 0 (app 941, 0 failing). The whole `pnpm keyboard` after
  these is the main session's.
- `bash supabase/tests/run-rls-gate.sh` — exit 0 twice (the second after a comment-only change to the 7.18c block in both
  byte-identical copies), no SCHEMA DRIFT, the 7.18c block's ten PASS lines (MEASUREMENTS §87).
- `python3 tools/doc-audit.py --check` — PASS on the second run (the first regenerated the index and the board).
- The standing-rule-7 grep (`leaveBeat`, `leaveBacks`, "only six", "six states", "connection returns") — no live hit: the
  two helper names survive only in MEASUREMENTS §65's 2026-10-02 execution text (dated note beside it), and "connection
  returns" only in Retrying's own sentence, the frame, the rulings and the tests that assert it is absent from Can't sync.
- **Left for the Review (R-82):** walk step 115 from a clean worktree at the deployed sha, the lock walk's DW-307 stop after the
  Dev deploy, and CI on the Dev head.

**Executed — Dev, the main session (2026-10-20, Node 24.18.1, on the final tree):**
- `pnpm check` — exit 0: library 285, ghost-shim 47, section-runtime 441, theme-compiler 220, app 941, tools 13 — each suite's
  own printed count, 0 failing.
- `pnpm keyboard` (the whole suite, nothing else running) — exit 0, **289 passed** (16.6 min), 0 failed, 0 flaky.
- `bash supabase/tests/run-rls-gate.sh` — exit 0, no SCHEMA DRIFT, the 7.18c block's ten PASS lines; the two copies
  byte-identical (`cmp`).
- The standing-rule-7 grep over tracked files (`git ls-files apps tools _bmad-output/planning-artifacts`; untracked build
  output such as `.next-harness/` excluded) — `leaveBeat` / `leaveBacks` only in MEASUREMENTS §65's 2026-10-02 execution text
  (with the dated note), no "only six" or "six states"; "connection returns" only in Retrying's own sentence and the files
  that quote or assert it (the frame, the prototype, the rulings, epics.md's AC, the tests, a comment naming what DW-304 was).
- **The I/O matrix, row by row → the check that ran in that state:** Gone, Refused change, Signed out and Dropped (the
  controls) → R-213's journey (its loop: 502 Retrying; 404 gone + Go to Projects; 400, 422 change; no `/sync` for longer
  than the backoff's first wait; an Undo in *change* sent at once, a 200 green) and `7.18c · R-275, the error column` (the
  journal kept, a visit back's one request, Still refused by a visit and by an edit); Run checks after a refusal, merely
  unsent, Switch after a refusal → `7.18c · R-275: after a save refused for good (a 422)…`; Fallback → `7.18c · R-275 in
  fallback`; the four lock orderings and a leave over a stale row → the RLS gate's 7.18c block, with its heard-beat control;
  Reload and Back-forward restore → the gate's (2c)/(2d) and `tab-session.test.ts`' page-id test; Old tab mid-deploy →
  `lock.test.ts` (a page-less beat carries no `or`, a page-less leave is a 400); First-moment typist, N = 0 and Confirmed
  holder → the DW-308 journey's three arms; Sites unread and Sites read, none → `read.test.ts` and the R-276 journey with
  its empty-sites control. Every one of these ran in the two runs above.
- **The lock walk against production BEFORE the Dev push** (`run-verify-lock.cjs` from a detached worktree at the deployed
  `28ce5f6e`, the new stop as an uncommitted copy in `tools/probe-debug/`; the keys read inside the process via a scratchpad
  launcher, never on argv; the owner's in-session go — "1. Go, both", then "1. Yes, up to two runs"): **three runs, no result
  for the DW-307 stop, each void and said so** (MEASUREMENTS §87 (b)): run 1 — its control unmet (the held beat never
  reached the server, `"beatLanded":"unsent"`, journeys were running on the same machine), 87 PASS / 5 FAIL; run 2 — its
  control met (`"beatLanded":200,"fetchMs":605`, the leave 200) but void, the stop having been moved after DW-244 whose going
  tab stays on Projects, so the other session was not in the editor to poll (108659 ms) — fixed: both sessions are put back
  in the editor first; 88 PASS / 4 FAIL; run 3 — died at Hand over before the stop. DW-240 (a) and (b) and DW-244 PASSED in
  run 2. The early stops' intermittent failures on HEAD's code are DW-382, the Review's to re-read. The bug itself is shown
  by the RLS gate's control (§65's heard-beat leave after the in-flight beat: 0 rows).
- **Walk step 115b reordered** (the main session's read of the subagent's step): with A opened first, B's own server render
  saw A's live row and B read along from its first paint — never the optimistic first paint DW-308 is about — so B now opens
  first, its lock calls held, A opens and holds, then B types and its held acquire meets A's row.

**Real services the Dev phase hit (R-82):** **Vercel** + **Supabase production** — `app.inflozo.com` (deployment
`dpl_gaHZftLS3r4r417RpN2f1yB8LuCQ`, READY at `28ce5f6e`, read with `VERCEL_TOKEN` / `VERCEL_TEAM_ID`), three lock-walk runs,
each with its own throwaway account made and deleted through `SUPABASE_URL` + `SUPABASE_SECRET_KEY` ("no fixture leaked —
16 before · 16 after", every run). **GitHub Actions** (`GITHUB_TOKEN`, read-only): the Schema push's CI — `rls`, `check`,
`deploy` success; Render matrix success. No Ghost call: T1 untouched (R-238).

**Executed — Schema phase (2026-10-20, pushed alone before any code, R-99):**
- `bash supabase/tests/run-rls-gate.sh` — exit 0: no SCHEMA DRIFT (`SCHEMA.sql` carries both columns LAST in `edit_locks`,
  their comments, and both grant lines), every earlier block passing, and the 7.18c block's PASS lines: both columns typed,
  defaulted and commented, `authenticated` holding INSERT (`page_id`) and UPDATE (`page_id`, `page_left`) and no INSERT on
  `page_left` (behaviourally too: 42501 on the tenant's own project); the control — HEAD's heard-beat leave after P's
  in-flight beat changes 0 rows (DW-307 reproduced); P's beat then P's leave → 1, backdated with `page_left`; P's leave then
  P's beat → 0, still backdated; P's leave then Q's beat → 1, `page_id` Q, `page_left` false; Q's beat then P's leave → 0;
  a leave over a row older than its stamp → 0; neither statement reaches another tenant's lock, which stays as its own
  session wrote it.
- Control, over a scratch copy of `supabase/` without `20261021120000_edit_lock_page.sql` and with HEAD's `SCHEMA.sql`
  (`INFLOZO_ARCH_DIR`): exit 3 at the 7.18c block's first check ("edit_locks.page_id (text, nullable) and page_left
  (boolean, not null, default false) are missing"), 7.18b's block passing first.

**Real services the Schema phase hit (R-82):**
- **Supabase production** (`SUPABASE_DB_POOLER_URL`, read inside the script, never on argv; the owner's in-session go,
  "1. Go, both"): before — `edit_locks` with its nine columns, no grant or check on the new names, 5 rows; the migration
  applied in one transaction; after — `page_id` text nullable with its comment and `edit_locks_page_id_check`
  (`char_length` 1–64), `page_left` boolean not null default false with its comment, `authenticated` holding
  INSERT(`page_id`), UPDATE(`page_id`), UPDATE(`page_left`) (and the table-wide SELECT), the same 5 rows, none carrying a
  page or `page_left`.

**Executed — Review (2026-10-20, the main session, Node 24.18.1; four review layers as subagents, every production call here,
on the owner's in-session go — "1. Go, up to 3 runs each"):**
- **CI on the Dev head `d8bf78bd`** (`GITHUB_TOKEN`, read in-process): CI `check`, `rls`, `deploy` success; Render matrix
  success. **Vercel** (`VERCEL_TOKEN` / `VERCEL_TEAM_ID`): `dpl_AAPUStVpTGZoVoiDbWT3ETBB8qM8` READY at `d8bf78bd`.
- **Production's schema (R-99), read only through `SUPABASE_DB_POOLER_URL`** (read in-process, nothing printed): `page_id` text
  nullable, no default, its comment, `edit_locks_page_id_check` (`char_length` 1–64); `page_left` boolean not null default
  false, its comment; `authenticated` holding INSERT(`page_id`), UPDATE(`page_id`), UPDATE(`page_left`); the negative
  control — `has_column_privilege` false for `authenticated` INSERT on `page_left` and for `anon` UPDATE on `page_id`.
- **The lock walk** (`run-verify-lock.cjs` from a detached worktree at `d8bf78bd`; runs 2–3 the patched stop as a
  `tools/probe-debug/` copy; keys read in-process by a scratchpad launcher, never on argv) — three runs, MEASUREMENTS §87 (c):
  run 1 (the Dev's stop) 2 FAIL, 90 PASS: DW-307 31424 ms over its bound, cause unrecorded by that walk, and one early stop
  (DW-382); run 2 the real stop PASS (14892 ms, the leave `won`, the late beat left the row at 50767 ms) with the control's
  criterion wrong (fixed) and DW-240 (a)'s own control unmet (DW-382), then a `goto` timeout at R-214; **run 3 0 FAIL, 95
  PASS** — the control holding the lock until the row went stale on its own (51055 ms, 60211 ms old at the gain), the real
  close freeing it in 11158 ms, its leave matched (ageMs 50064), and a beat from the page that left reviving nothing
  (ageMs 50638); no fixture leaked (16 before · 16 after), every run.
- **The editor walk** (`run-verify-editor.cjs` from the same worktree): run 1, the whole walk, 0 FAIL, 261 PASS then a HARNESS
  ERROR (a 30 s paint wait after step 53, before steps 61, 69 and 115 — a hold, not a result); run 2, a cut of steps 1–5 and
  115, 1 FAIL, 57 PASS — Go to Projects landed on `/start` for an account left with no project (the app's rule; the step
  re-expected, seeding E's other project first); **run 3, the same cut from the patched walk, 0 FAIL, 58 PASS**: ⌘S on the
  project deleted from a second page → Can't sync, the hover and live region "Can't sync", Tabler `x`, B6's fill, radius and
  padding, the *gone* sentence, Go to Projects in this tab, no request for longer than the backoff's first wait, Projects
  listing the other project and not the deleted one; B opened first, its lock held, typed one edit, then read along told
  "This session had 1 unsynced edit; they were not included." assertively and in B5a's slot, sent nothing (revision 0 → 0),
  A the control still editing; zero CSP violations; accounts and projects counted back. Steps 8, 61 and 69 did not run in a
  Review run (run 1 died before them; the cuts carry steps 1–5 and 115); they read nothing this story changed.
- **The Review's patches, locally, on the final tree:** `pnpm check` — exit 0 (library 285, ghost-shim 47, section-runtime 441,
  theme-compiler 220, app 941, each suite's own printed count, 0 failing); a mutation of the insert (a `page_left` slipped
  in) turns `lock.test.ts` red. `bash supabase/tests/run-rls-gate.sh` — exit 0, no SCHEMA DRIFT, the 7.18c block's PASS lines
  with the length check and (2f); the control — a scratch copy of both byte-identical files with the other tenant's row
  deleted first — exits 3 at "another tenant's lock is gone". The six new journeys — 6 passed; **all six FAILED against the
  code without what each holds, each at its own assertion** ("the Undo was sent and landed", "gone: no tick sends it again",
  "Can't sync is over", "still Can't sync — never 'Syncing every change to the cloud'", "told what THIS page typed: one",
  "it adopted nothing"), then the tree restored byte-identical (`cmp`). `pnpm keyboard` (the whole suite, nothing else
  running) — exit 0, **295 passed** (33.6 min), 0 failed, 0 flaky.

**Real services the Review hit (R-82):** **Supabase production** (the pooler, read only; three lock-walk and three editor-walk
runs, each with its own throwaway accounts made and deleted through `SUPABASE_URL` + `SUPABASE_SECRET_KEY`); **Vercel**
(`app.inflozo.com`, deployment `dpl_AAPUStVpTGZoVoiDbWT3ETBB8qM8` at `d8bf78bd`); **GitHub Actions** (read only). No Ghost
write (R-238): run 1 stopped before steps 113–114, the walk's T1 steps, and the cuts leave them out. The walks ran at the Dev
head, and the Review's own patches change nothing they press: the resend acts only on *change*, the tick only after three
minutes of autosave, and the hydrate's later ask is a no-op for a holder — the journeys hold all three.
- **The Review's deploy** `72f7d396` (read with `GITHUB_TOKEN` and `VERCEL_TOKEN` / `VERCEL_TEAM_ID`): CI `check` (the whole
  keyboard suite with it), `rls` and `deploy` success; the Render matrix success; Vercel `dpl_2AJHwQHhf4UPWAyGsUYUMcrsAGug`
  READY at `72f7d396` on `app.inflozo.com`. Deploy and the owner's test follow (R-80); Question 3 waits for him.

**Executed — Review, the owner's ruling (2026-10-20, R-277, Question 3 option 1; the main session, Node 24.18.1):**
- `site-switch.test.ts`' R-277 test — the ruled words, `SWITCH_WORDS.unread` the same sentence as `SITES_EMPTY.unread`, the
  Sites page drawing `{SITES_EMPTY.unread}` with no literal of its own; the control: the page's old sentence put back turns
  it red (1 failing), the page then restored byte-identical (`cmp`). `pnpm check` — exit 0 on the final tree (library 285,
  ghost-shim 47, section-runtime 441, theme-compiler 220, app 942 — each suite's own printed count, 0 failing); the picker's
  R-276 journey over the new wiring — 1 passed. The Sites page's failed read cannot be reached by a hand on production (a database hiccup); the
  test holds the wiring and `connect-rule.test.ts` holds that an unread list is that banner.

**Executed — Deploy (2026-10-20, the main session, Node 24.18.1):**
- `Deployment: dpl_5YgADvd1pnexWm7W1vvpuzZEVpTM` — READY, production, built from `811fba01` (the head, the last code change:
  R-277's one sentence), the newest production deployment (Vercel API, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT` read
  in process, never on argv); `https://app.inflozo.com/sign-in` answers 200. CI at `811fba01` (`GITHUB_TOKEN`): `check` (the whole
  keyboard gate inside it), `rls` and `deploy` success; the Render matrix success.
- Schema: `edit_locks.page_id` and `page_left` were applied at the Schema phase and read back there and at the Review (R-99);
  nothing has touched the schema since, `RLS-TEST.sql` is green in the `rls` job at the head. Nothing to apply at Deploy.
- The owner's test account (read only, `SUPABASE_URL` and `SUPABASE_SECRET_KEY` read in process): `umngkmr+site718@gmail.com`
  exists, `entitlements.state` `pro_active`, no project and no connected site — so the test starts on the New project screen and
  can make A and B. Nothing was written; no Ghost call (T1 untouched, R-238).
- `owner_test: pending` — the owner's manual test above is next, on `https://app.inflozo.com`.
