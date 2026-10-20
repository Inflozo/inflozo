---
title: 'Story 7.18c — The editor''s lock and save leftovers'
type: 'bugfix'
created: '2026-10-20'
status: 'ready-for-dev'
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
owner's in-session go (R-99), before any code that writes the columns is pushed.

**Execution — the `Schema` push (alone, first; R-99):**
- [ ] `supabase/migrations/20261021120000_edit_lock_page.sql` -- add `edit_locks.page_id text` (null, or 1–64
  characters) and `page_left boolean not null default false`; grant `authenticated` INSERT (`page_id`) and UPDATE
  (`page_id`, `page_left`); a `comment on` each naming DW-307 and what it holds; re-runnable (`if not exists`); the header
  says why no service-role grant -- the leave's own page, in a column (DW-307).
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the two columns in
  `edit_locks` (`:543-554`) and both grant lines (`:1177-1180`, `:1343-1346`) -- the gate diffs it against the migrations.
- [ ] `…/RLS-TEST.sql`, then copied byte-identical to `supabase/tests/rls.sql` -- the column-grant audit gains the new
  grants; a **7.18c block**: (1) both columns' types, default and comments (coalesce, as 7.18b's); (2) as the tenant on
  its own lock, the Design Notes' two statements in every ordering, each `row_count` asserted — P's beat then P's leave
  → 1; P's leave then P's beat → 0 and the row still backdated; P's leave then Q's beat → 1 with `page_id` Q and
  `page_left` false; Q's beat then P's leave → 0; a leave over a row already older than the stamp → 0; (3) the
  control: the heard-beat leave after P's in-flight beat → 0 (DW-307 reproduced, so the fixture is real); (4) another
  tenant's lock unchanged by each -- one gate, run in Postgres.

**Execution — Dev:**
- [ ] `lib/journal.ts` -- `SyncState` gains `{ kind: 'refused'; why: 'gone' | 'change' }`; `SyncLabel` and `labelOf`
  the ruled label; `panelOpen` includes it; `refusalOf(status)` (404 → `'gone'`, 400 · 422 → `'change'`, else null);
  `REFUSED_COPY` (title, `gone`, `change`, `projects`) from "Ruled values"; the machine's comment says seven states and
  drops the DW-304 sentence -- one pure rule `node --test` reaches.
- [ ] `components/kit/icons.tsx`, `components/kit/persistence-indicator.tsx`, `app/(app)/app/(authed)/kit/page.tsx` --
  `SyncRefused` (Tabler `x`, noted in the header's list) and the seventh `look` row on `bg-danger-text`; the Kit page
  shows it -- R-142's indicator, one more state.
- [ ] `components/editor/save-state.tsx` -- the refused panel in B6's shape: id `editor-refused`, `REFUSED_COPY.title`,
  its sentence by `why`, **Go to Projects** (a link in Retry now's style, same tab) for `gone` only, nothing for
  `change` -- B6 extrapolated as R-213's was.
- [ ] `E` -- `flush`: `refusalOf(answer.status)` before the `!answer.ok` throw → stop the backoff, `attempt` 0,
  `signedOut` false, `setSync({ kind: 'refused', why })`, keep the journal, no retry; `rest` keeps `refused` as it keeps
  `retrying` and `signed-out`; a 200 leaves it; `store` sends an edit at once while `why` is `change`; the visit back to
  the tab (`:4478`) tries once while refused; `flushForShip` answers `null` (all sent), the refusal's sentence, or
  `DEPLOY_WORDS.editsUnsent`; `switchSiteNow` refuses with that sentence; the comments at `:2078-2080` updated -- DW-304.
- [ ] `components/editor/deploy-wizard.tsx` -- `flush: () => Promise<string | null>`; Run checks says the sentence it
  answers (`:477-486`) -- Pre-flight's own flush tells the truth.
- [ ] `lib/lock.ts` · `lib/lock-client.ts` -- delete `leaveBeat`, `leaveBacks`, `LockRow.beat` and `rowFrom`'s `beat`;
  `pageId()` minted once per page load, re-minted on a `pageshow` that is `persisted`; `LockCall.page` replaces `beat`
  -- DW-307's client half.
- [ ] `lock/route.ts` -- `page` read and checked with `isUuid` (400 `Bad page`), required for `leave`; `beat()`, the
  insert, the stale CAS and `takeover` write `page_id` (and `page_left: false`) when a page is sent, `beat()` with
  `.or('page_left.is.false,page_id.neq.<page>')`; `leave` as Design Notes (`.eq('page_id', page)`,
  `.eq('page_left', false)`, `.gt('heartbeat_at', leaveStamp(now))`, writing `page_left: true`); the file's header
  rewritten -- DW-307's server half.
- [ ] `E` -- every `askLock` carries `page: pageId()`; `leaving` sends `{ intent: 'leave', session, page }` (release
  where `tabSessionKept` is false, as now); the `ponytail:` at `:2659-2664` replaced by what now holds -- DW-307.
- [ ] `E` -- `land()`: an optimistic holder (`was.holder`, `heldGeneration` null) whose answer is another session's
  live row: `typed` = this page's edits (`adoptedUpTo`), the in-memory journal emptied (state and `latest`, never
  `local.current`), the indicator rested, and when `typed > 0` `setAnnounced`/`setLost(LOCK_COPY.displaced(typed))`;
  the hydrate records `adoptedUpTo` and asks `latest.current.lock.holder` again after its read; the `ponytail:` at
  `:2034-2038` rewritten (Design Notes' ceiling) -- DW-308.
- [ ] `lib/deploy.ts` · `lib/site-switch.ts` · `deploy-wizard.tsx` -- `ShipState.sites: readonly SwitchSite[] | null`
  (null: the sites or linking read failed); `SWITCH_WORDS.unread`; the picker draws it as its lead's next paragraph in
  place of the list and Use this site, and says it in the polite region on open; "Choose a site" shows when `sites` is
  null or non-empty; every reader of `sites` handles null -- DW-381.
- [ ] `app/(app)/app/harness/editor/layout.tsx` -- `x-inflozo-harness-ship: sites-failed` (as `full`, `sites: null`),
  documented with the other shapes; `READER_LOCK` loses `beat` -- the journeys' state.
- [ ] `journal.test.ts` · `lock.test.ts` · `read.test.ts` · `settings.test.ts` · `deploy.test.ts` -- `refusalOf` over
  every status the route answers (401, 409, 423, 502 and a network failure as controls); seven distinct labels and
  `panelOpen`'s three kinds; `REFUSED_COPY`; the route's beat and leave statements read from its source (as `:312`
  does) with the page filters; `pageId` stable within a load; `shipStateOf` → `sites: null` on either failed read,
  `[]` on a read with none; the `beat` fixtures gone -- the I/O matrix's pure rows.
- [ ] `tools/keyboard/journey.spec.mjs` -- (a) R-213's loop flipped: 404 → gone panel with Go to Projects, 400 and
  422 → change panel, no `/sync` request for 6 s after each (502 still Retrying, the control); an Undo in *change* sends
  at once and a 200 rests green; (b) Run checks and Switch after a 422 say the change sentence (an aborted sync, R-274's
  — the control); (c) DW-308: the first `acquire` held (D8g's intent filter + DW-223's held route), one edit typed,
  the acquire answered with another session's live row → the assertive region and `#editor-lock-reason` say
  `displaced(1)`, no `/sync` request, the IndexedDB record's journal as it was before the answer; control: the same
  with `held: true` says nothing; (d) `sites-failed` → the picker's sentence, no radio, no Use this site, Choose a site
  on a no-site project; the empty-sites control at `:9139` unchanged -- every behaviour with its control.
- [ ] `tools/probe/run-verify-editor.cjs` -- **step 115** on production: (a) a throwaway project, deleted from a second
  page; the editor's ⌘S → Can't sync, the *gone* sentence, the `x` glyph (`glyph58`), Go to Projects, and no `/sync`
  for 6 s; (b) DW-308 with two pages of one context — B's first acquire held until A holds and B has typed — then B
  says `displaced(1)` and sends nothing; step 61's comment says seven states -- R-82 on the real stack.
- [ ] `tools/probe/run-verify-lock.cjs` -- a DW-307 stop beside DW-240's: the holder's beat reaches the server but its
  answer is held (`route.fetch`, then hold), the holder closes, the reader acquires within the grace plus one poll;
  its control is the same stop run against production before the Dev push lands, where the wait is ~60 s -- the bug
  shown, then gone.
- [ ] Docs -- PRD FR-D10 (`:228`), FR-D18 (`:238`), the data model (`:697`) and Appendix H (`:1457`, seven names);
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

## Spec Change Log

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

**Why a seventh state and not Retrying's words.** R-213 set the precedent: a refusal of a different kind gets its own
state in the same red panel, and Retrying keeps meaning "the connection, and it will pass". A countdown over a refusal
that cannot pass is the false sentence DW-304 is about. *gone* still tries once on a visit back to the tab, because
signing back in to the right account cures it (the cookie jar is shared — R-213's executed fact).

**The lock's page id, every ordering** (P is the going page, Q its reload, both with the tab's one session `S`):

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
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+site718@gmail.com` | Projects. |
| 2 | `https://app.inflozo.com/` | Projects (tab 1) | **New project** → **Blank canvas**, name it, create. | `Throwaway 7.18c` | Its editor opens: project **A**. |
| 3 | `https://app.inflozo.com/` | Projects (tab 2) | Open a second tab here. On **Throwaway 7.18c** press ⋯ → **Delete**, type its name and confirm. | `Throwaway 7.18c` | It leaves the list. |
| 4 | `https://app.inflozo.com/projects/<A>` | Editor (tab 1) | Press ⌘K, add any design, then press ⌘S. Hover the save icon. | — | The icon turns red with an ✕, and hovering says **Can't sync**. A red panel opens under it: "Your changes can't reach this project: it was deleted, or this browser is now signed in to another account." and **Go to Projects**. There is no countdown. |
| 5 | same | Editor (tab 1) | Wait one minute. | — | Still **Can't sync**; it never says "Retrying". |
| 6 | same | Editor (tab 1) | Press **Go to Projects**. | — | Projects, without Throwaway 7.18c. |
| 7 | `https://app.inflozo.com/` | Projects (tab 1) | **New project** → **Blank canvas**, create. In its editor add any design and press ⌘S. | `Account 7.18c` | Project **B**; the icon is the green check. |
| 8 | any page (tab 2) | Account menu | Sign out. Sign in as **your own account** in tab 2 and open its link. | `umngkmr@gmail.com` | Your own Projects in tab 2. |
| 9 | `https://app.inflozo.com/projects/<B>` | Editor (tab 1) | Click tab 1 and add another design. | — | The icon turns red: **Can't sync**, with step 4's sentence. |
| 10 | any page (tab 2) | Account menu | Sign out, sign in as the alias again, then click back to tab 1. | `umngkmr+site718@gmail.com` | Within a few seconds the icon is the green check again: the work reached project B. |
| 11 | `https://app.inflozo.com/projects/<B>` in two **windows** side by side | Editor | Open B in a second window: one window edits, the other reads along. Close the one that edits. Once the other can edit, open B in a new window and close the editing one again — three times in all. | — | Each time, within about 15–25 seconds, the remaining window's reading-along bar goes away and you can edit there. |
| 12 | same | Editor | With both windows open, press reload in the window that edits. | — | It comes back still editing; the other window keeps reading along. |
| 13 | `https://app.inflozo.com/` | Projects | Delete **Account 7.18c** (type its name). | `Account 7.18c` | The alias holds only the projects it had before this test. |

## Questions for the owner

Questions 1 and 2 were ruled on 2026-10-20, each option 1 (R-275, R-276); none is open. "Ruled values" in Design Notes
holds what they set.

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
