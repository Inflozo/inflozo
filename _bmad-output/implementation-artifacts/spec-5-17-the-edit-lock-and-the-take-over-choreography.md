---
title: 'Story 5.17 — The edit lock and the take-over choreography'
type: 'feature'
created: '2026-09-23'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: 'f92409a17bfa06a29e4471d858ca5a527859206e'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Open the same project twice — a second tab, or your laptop and then your phone — and **only one of them can
edit**: the other gets a bar across the top saying the site is being edited somewhere else, with a **Request
editing** button, and its canvas stays perfectly readable while its settings panel dims and stops responding.
Press **Request editing** and a small card appears in the editing session saying so; **Hand over** sends its work
to the cloud first and then lets go, and you start editing where it left off. If nothing answers within half a
minute you are told so, with **how many edits that session has not sent yet**, and you may take over anyway —
and the session you took it from is told plainly, the next time anyone looks at it, exactly how many of its edits
never reached the server and are gone for good.

## Intent

**Problem:** Nothing writes `edit_locks` today. Two tabs of one project both edit, both write the same IndexedDB
record and the same cloud snapshot, and one quietly overwrites the other — that is DW-203, and the editor's own
code says so in two places (`journal.ts:270`, `editor.tsx:1621`, both naming this story). FR-D18 has been fully
schematised since the complete-schema migration and has **zero lines of application code**.

**Approach:** The client drives the whole protocol against the row the schema was built for, with **no new SQL**.
Acquisition and take-over are an **optimistic compare-and-swap on `lock_generation`** — read the row, write the new
holder at `generation + 1` filtered on the generation just read — which is exactly the shape
`guard_lock_takeover` was written to enforce and which the `authenticated` UPDATE grant already permits
(`…complete_schema.sql:1254-1257`). A heartbeat every ~15 s carries `unsynced_edits`, which `unsyncedEdits(j)`
(`journal.ts:140`) has computed and exported since Story 5.8 and which nothing has yet rendered. Detection has
three layers, cheapest first: `BroadcastChannel` for same-browser tabs (free), a Supabase Realtime **broadcast**
channel per project for everything else (§AD2), and the heartbeat's own round trip as the floor — so the
choreography degrades to ≤ ~15 s rather than breaking if Realtime is unreachable.

**Probably no Schema phase, and Dev's first act settles it.** Nothing in the protocol above needs a migration *if*
PostgREST can express a filtered UPDATE that returns the rows it changed. That is a claim about Supabase and it is a
hypothesis until executed (standing rule 1) — so it is executed first, against the real project, before any UI is
written. If it fails, the fallback is one `security definer` RPC in `sync_project_doc`'s shape, and **that is a
migration, which means a Schema phase pushed on its own before Dev (R-99)** — see **Ask First**.

## Boundaries & Constraints

**Always:**

- **One editing context per project, across tabs, browsers and devices** (FR-D18). `commit()`
  (`editor.tsx:587`) is the **one door** every change passes, so the read-only guard is one early return there and
  nowhere else.
- **The count is EDITS, never operations** (AD-16, §AD2). It is `unsyncedEdits(j)` — distinct unsynced transaction
  ids — and a Variant Shuffle or a Site Remix is **one** edit however many ops it costs, which `remixFold`
  (`lib/remix.ts:63`) already guarantees by folding to one `commit`. **No op count is surfaced, stored in the
  heartbeat or logged for display.**
- **A holder change advances `lock_generation` in the same statement** (AD-15's take-over protocol). The trigger
  `edit_locks_takeover_advances` enforces it against the service role too; the client must never try to route
  around it.
- **The displaced session clears its journal unconditionally**, decided by the **generation** test and independent
  of the revision test — that is why a take-over whose new holder has written nothing still clears (AD-15,
  `journal.ts:270`'s named seam). The revision half already exists in `hydrationFor`; this story adds the other half
  and does not alter the first.
- **Hand over flushes BEFORE it releases.** A new `FlushCall` member (`journal.ts:156`) and a call site; the flush
  function itself is Story 5.8's and is not rewritten. Unsynced work never crosses a lock boundary (AD-15's flush
  contract).
- **The request and the take-over notice are announced ASSERTIVELY** (UX-DR12, EXPERIENCE.md:552-553). `#editor-said`
  is the editor's **polite** region and stays polite — changing its `aria-live` would make every design-ring
  announcement shout. This story adds a **second, assertive** region and nothing else uses it.
- **The nudge timer RESTARTS on any interaction with the popover, focus included — it does not stop** (F-079,
  EXPERIENCE.md:1027). A holder who focuses the card and then does nothing has not answered, so §AD4's ~30 s runs
  again from their last interaction and the requester's take-over is then offered. See *Design Notes* for the
  wording this corrects.
- **The take-over confirm opens with focus on the cancelling action** (UX-DR14, R-115, D8f). `openOnCancel`
  (`components/kit/dialog.ts:52`) already does exactly this; the cancelling button carries `data-cancel`.
- **B5b prints "edits", never "changes"** — §AD2 makes *edits* canonical in every user-visible string, and the A9
  item-4 correction pass of 2026-09-04 fixed B5c and D8f but never reached B5b (EXPERIENCE.md:1049-1051).
- **Every surface says WHERE, never WHO** (**R-189**). The other editing context is always the same person, so no
  string names one, no avatar carries initials, and **"Or message Rosa" does not exist**. The frames' shapes,
  escalation and treatment are untouched; only their words are.
- **An edit on the device and not on the server is "unsynced", everywhere** (**R-190**). The word *unsaved* appears
  nowhere in the product — the indicator on the same screen says "Saved on this device" and then "Synced", so
  *unsaved* would contradict it.
- **B5c never itemises the loss per section.** The frame once drew "Home hero — design and two controls · …"; that
  detail **does not exist** and cannot — the heartbeat carries one number (EXPERIENCE.md:1042-1051).
- **The canvas stays fully legible and the sidebar dims to 55%** — controls *visible* so the reader can see what is
  set, and readable by a screen reader, but nothing responds (B5a, EXPERIENCE.md:1026). A control pressed in a
  read-only session **never moves, not even for a frame**.
- **Every new pressable control says it is working** — `aria-disabled` + `aria-busy` + a label swap, never
  `disabled` (R-98). `apps/web/busy.test.ts` audits it and will go red otherwise.
- **The surfaces match their frames** (R-74): `B Missing Surfaces.dc.html` **B5a** · **B5b** · **B5c**, as
  re-specified by `EXPERIENCE.md` F2 where the two disagree.

**Ask First:**

- **Both owner questions are RULED (2026-09-23) and nothing waits on them** — **R-189** (say where, never who; there
  is no Rosa) and **R-190** (*unsynced*, never *unsaved*). The settled strings are in *Design Notes*, and they are
  the strings: a surface that invents its own wording is wrong even if it reads well (R-170).
- **If the compare-and-swap cannot be expressed through PostgREST** (a filtered UPDATE returning its rows), the
  fallback is one `security definer` RPC. **Stop, say so, and push it as a `Schema` commit on its own before any
  Dev code** (R-99) — and mirror it into `SCHEMA.sql`, or `run-rls-gate.sh`'s `pg_dump` diff fails.
- **If Supabase Realtime broadcast needs a publication, an RLS policy on `realtime.messages`, or a plan the project
  does not have** — that is a schema or a cost decision, not an engineering one.

**Never:**

- **Do not build D8g, the deploy-and-export gate.** *Ship it* is Story 7.18 and ZIP export is Story 7.26, both
  `backlog`; `keymap.ts:113` reserves the row with no keys and `probe-rule.test.ts:183-185` asserts the product's
  copy never says "Ship it" or "export". A take-over prompt for a button that does not exist cannot be reached, and
  naming it would break UX-DR3. **Deferred as DW-238**, to be built by 7.18 and 7.26 from the component this story
  leaves them.
- **No merge path, and no recovery of orphaned edits.** The message is honest rather than reassuring
  (EXPERIENCE.md:1031-1040).
- **Do not key the local store by tab** (DW-203's other half). The lock IS the answer to two writers: the second tab
  is read-only, so it has no writer. Clearing `inflozo-doc-<userId>` on sign-out stays the account-deletion story's.
- **Do not confuse this read-only with FR-L3's.** A project read-only because a Free account is over its cap (D4e)
  shares the visual treatment and has a different banner, a different remedy and still exports. This story touches
  neither.
- **Do not re-use `#editor-said`** for the assertive messages, and do not add a toast — F2's notices are live regions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| First opener | no `edit_locks` row | plain `INSERT`; holder at `lock_generation = 1` (not in the INSERT grant, so it defaults); editing enabled | `23505` means another session inserted first → fall through to the CAS path |
| Second opener, lock live | row exists, `heartbeat_at` within ~60 s, another `holder_session_id` | **read-only**: B5a bar, sidebar at 55 %, `commit()` refuses | N/A |
| Same session reloads | row exists, `holder_session_id` is mine | lock kept, no generation change; journal kept iff `revision == base_revision` (unchanged `hydrationFor`) | N/A |
| Stale lock | `heartbeat_at` older than ~60 s | CAS `generation N → N+1` filtered on `N`; acquired silently, no confirm | 0 rows changed → someone beat us; re-read and become the reader |
| Heartbeat | every ~15 s, filtered on `project_id` **and** my `holder_session_id` | `heartbeat_at = now()`, `unsynced_edits = unsyncedEdits(journal)` | 0 rows changed ⇒ **displaced** (see below). Network error ⇒ retry next beat, no state change |
| Request editing | reader presses it | `nudge_requested_by` / `nudge_requested_at` written; broadcast sent; reader shows a waiting state with its own ~30 s | write fails → the button reports it and stays pressable |
| Holder receives it | nudge seen (broadcast, BroadcastChannel or its own next beat) | B5b popover, **announced assertively**, countdown ~30 s | N/A |
| Holder interacts with the popover (focus included, no answer) | any `focus`/`pointerdown`/`keydown` inside it | countdown **restarts** from that moment (F-079) | N/A |
| Hand over | holder presses it | `flush('release')` **first**; on success `DELETE` the row; holder flips to read-only | flush fails → the row is **not** deleted, the popover says so and stays; the lock is never released over unsent work |
| Keep editing | holder presses it | nudge columns cleared; requester told, and no take-over is offered from this request | N/A |
| Nudge unanswered ~30 s | requester's timer runs out | "No response; that session has **X** unsynced edits" + **take over anyway** | X is read from the row; if the row has vanished, the lock is free — acquire normally |
| Take over | requester confirms | CAS to a new `holder_session_id` at `generation N+1`, filtered on `N`; then hydrate from the cloud snapshot | 0 rows ⇒ the generation moved under us → re-read and report the new state, never retry blindly. A `42501` means the guard refused a non-advancing write — a bug, surfaced, never swallowed |
| Take over with nothing owed | the holder's `unsynced_edits` is `0` | the confirm still asks — it still ends another session — but the danger panel is **absent** (not empty) and the confirm is not a danger fill: nothing is being lost | N/A |
| Displaced holder | its next beat changes 0 rows, or a broadcast arrives, or a read shows a generation past its own | **read-only**; assertive notice stating its own last `unsynced_edits`; journal cleared unconditionally on the next hydrate | N/A |
| Realtime unreachable | channel never subscribes, or drops | everything still works on the heartbeat floor (≤ ~15 s); nothing is announced about the transport | reconnect is attempted; never block the editor on it |
| Tab closed while holding | `visibilitychange` / unmount | the existing `'unload'` flush, then a best-effort release | if the release does not land, the row goes stale in ~60 s and the next opener acquires it |

## Code Map

**EXECUTED FIRST, 2026-09-23 — `MEASUREMENTS.md` §50, `tools/probe/record-edit-lock.py`.** The four
hypotheses this approach rests on are now facts, against the real Supabase project, through the
`authenticated` role under RLS and the column grants:

- **The CAS is expressible through PostgREST. THERE IS NO SCHEMA PHASE and no migration.**
  `PATCH /edit_locks?project_id=eq.<id>&lock_generation=eq.<N>` with `Prefer: return=representation`
  returns the row it changed, and returns `[]` at **HTTP 200** — not an error — when the filter
  misses. Two sessions racing the same CAS produced exactly one winner (control: the uncontended CAS
  immediately before, one row).
- **`guard_lock_takeover` answers `42501`** to a holder change at an unchanged generation; PostgREST
  surfaces it as **HTTP 403** with the SQLSTATE in the body. Control: the same change with the
  generation advanced is accepted.
- **`lock_generation` really is outside the INSERT grant** — an INSERT naming it is `42501`, a plain
  INSERT defaults it to 1, and a second INSERT for the same project is `23505` at HTTP **409**.
- **`edit_locks` is absent from the `service_role` grant loop** (`…complete_schema.sql:1163-1177`).
  The service key cannot so much as `select` from it, silently returning nothing. Every read and
  write of this table — in the app, in the harness, in the probe — is a **user session's**.

**AND THE ONE THING THAT CHANGES THE SHAPE: THERE IS NO BROWSER SUPABASE CLIENT.**
`apps/web/lib/supabase/server.ts` is "THE ONLY PLACE A SUPABASE CLIENT IS MADE"; there is no
`NEXT_PUBLIC_*` key anywhere in `apps/web`; and `lib/supabase/cookies.ts` sets the session cookie
`httpOnly: true` *because* the app has no browser client. So "the client drives the whole protocol"
cannot mean the browser PATCHing PostgREST — it means **the browser drives it through one of the
app's own route handlers**, exactly as Story 5.8's flush does (`projects/[id]/sync/route.ts`). The
route calls `supabaseServer()`, which is the same `authenticated` role, the same RLS and the same
grants §50 executed, so **every fact above transfers unchanged**. The design is untouched; only the
hop is.

**The Realtime layer is the one part with nowhere to live, and it is the owner's** (the spec's own
Ask First). §50: a **public** broadcast channel `lock:<project id>` works — subscribed, received in
23–38 ms, payload intact, and another project's channel stayed out — but its topic is joinable by
anyone holding the publishable key and a project id. A **private** channel is refused outright
(`CHANNEL_ERROR: Unauthorized: You do not have permissions to read from this Channel topic`) and
needs an RLS policy on `realtime.messages`, which is a migration. Either way the **browser** cannot
open the socket without a browser-side client and a script-readable session. **Layer 2 was therefore
put to the owner (Question 3) and ruled out of v1 — R-191, 2026-09-24; layers 1 and 3 — `BroadcastChannel`
and the ~15 s heartbeat floor — are built, and the matrix's "Realtime unreachable" row is the shipped
behaviour rather than a fallback.**

**The database — everything exists, nothing is used.**

- `supabase/migrations/20260904120000_complete_schema.sql:500-511` — `create table public.edit_locks`: `project_id`
  PK, `user_id`, `holder_session_id`, `lock_generation bigint default 1`, `heartbeat_at`, `unsynced_edits`,
  `nudge_requested_by`, `nudge_requested_at`, `created_at`; index on `heartbeat_at`. **No expiry column** — the
  ~60 s staleness is a client-side comparison against `heartbeat_at`.
- `…:513-536` — `guard_lock_takeover()`: a changed `holder_session_id` at a `lock_generation <= old` raises `42501`.
- `…:1352-1366` — `guard_lock_generation()` (monotonic) and **both** `before update` triggers. Neither fires on INSERT.
- `…:802`, `:816-828`, `:841-853` — RLS on, `edit_locks_owner` (permissive, `user_id = auth.uid()`) and
  `edit_locks_parent_owned` (**restrictive**, `owns_project(project_id)`).
- `…:1038-1044` `select, delete` · `…:1085-1091` INSERT columns (**`lock_generation` deliberately absent**) ·
  `…:1254-1257` UPDATE columns (**`lock_generation` present** — this is what makes the CAS possible).
- `…:1249-1253` — **read this comment before writing the protocol.** The schema author defers the protocol to this
  story by name.
- `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql:85-116` — `sync_project_doc`, the shape to
  copy **only if** the CAS route fails.
- `supabase/tests/rls.sql:645-655` (required triggers), `:677-685` (rewind blocked), `:816-837` (**F4**, the
  take-over block) — the assertions to extend. `supabase/tests/run-rls-gate.sh` refuses to run unless
  `supabase/tests/rls.sql` is byte-identical to `architecture-…/RLS-TEST.sql`: **edit the architecture copy, then
  `cp`**.

**The one door for every `edit_locks` write — new, in `sync/route.ts`'s shape.**

- `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` — **the model, and it is followed
  line for line**: `export const dynamic = 'force-dynamic'`, `currentUser()` rather than `signedIn()`
  so an expired session gets a status the editor can read, `isUuid` on the id, `no()`/`json()` with
  `Cache-Control: no-store`, and the Postgres **code** logged, never the message.
- `apps/web/lib/editor.ts:130` — `syncPath()`. The lock route's address is its neighbour, and
  `editor.tsx:761`'s `syncUrl()` is the `isApp(pathname)` rule both fetches share.

**The editor — the named seams.**

- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx:587` — **`commit()`, the one door.** The
  read-only guard is one early return here.
- `…editor.tsx:543` — `latest` ref, the read-through every handler uses; `:437-471` the state block. **There is no
  context, provider or store in the editor** — the lock's state is `Editor`'s own, exactly as `autosave` and
  `revision` are.
- `…editor.tsx:763-838` — `flush(why)`; `:781` the fetch, `:798` `keepalive`, `:807-814` the 409 conflict dialog.
  `'release'` is a new `FlushCall`, not a new function.
- `…editor.tsx:1624-1688` — the hydrate effect; `:1621-1622` **the comment that names this story**.
- `…editor.tsx:2795-2830` — the conflict `<dialog>`: the nearest model for B5c (`data-cancel` at `:2818`, opened via
  `openOnCancel` at `:812`).
- `…editor.tsx:2713-2715` — `<p id="editor-said" aria-live="polite">`, driven by `said` (`:511`). **Polite. Leave it.**
- `…editor.tsx:2387` and `:2618` — the two `<aside>`s (Layers, Sidebar). The settings sidebar is what dims.
- `…editor.tsx:2290-2400` — the top bar, where B5a's bar sits above.
- `…(editor)/read.ts:76-130` — `EditorData`; the lock's server-truth fields join it beside `revision` (`:94`) and
  `autosave` (`:101`). `editorData()` at `:131`.
- `…(editor)/layout.tsx:37` — mounts `<Editor>` inside its Suspense boundary.

**Persistence — Story 5.8's, reused not rewritten.**

- `apps/web/lib/journal.ts:140` — **`unsyncedEdits(j)`**, distinct unsynced `txn` ids. Exported, unit-tested
  (`apps/web/journal.test.ts:95-105`), **rendered nowhere**. It was written for this story.
- `apps/web/lib/journal.ts:156` (`FlushCall`), `:167` (`flushDecision`), `:173` (`flushPayload`), `:250`
  (`FLUSH_MS`), `:253` (backoff).
- `apps/web/lib/journal.ts:262-274` — `Hydration` and `hydrationFor`, with **the comment naming this story**. The
  generation test is added **beside** it, not inside it: `hydrationFor` stays the revision rule.
- `apps/web/lib/local-store.ts:25-41`, `:100`, `:156`, `:175` — the IndexedDB door and `MetaRow.baseRevision`.
- `apps/web/lib/remix.ts:63` — `remixFold`, the proof that a Remix is one edit.

**Kit and components — reuse, do not invent.**

- `apps/web/components/kit/dialog.ts:52-56` — **`openOnCancel`**, UX-DR14 already satisfied; `:26-42` `sheet`,
  `sheetBox`, `title`; `:74-84` `closeOnBackdrop`.
- `apps/web/components/kit/submit.tsx:53-74` `useSubmitting()`, `:98-114` `BusyLabel`, `:124-149` `Submit`
  (`busy` is required).
- `apps/web/components/kit/icons.tsx:449` — **`Lock`**, B5a's padlock. No new icon is needed.
- `apps/web/components/kit/button.tsx`, `banner.tsx` (`role="alert"` on `kind="error"`),
  `persistence-indicator.tsx:34-51` (the five printed state names — the vocabulary Question 2 must agree with).
- `apps/web/components/controls/sidebar.tsx` — the panel that dims.
- `apps/web/lib/menu.ts:69` `openMenu` / `:162` `closeMenus` — **B5b is not anchored to a trigger and does not use
  them**; it arrives unbidden.
- `apps/web/components/kit/greyed.ts:13-28` — `Greyed` and `greyedProps`, which throw without a reason. Use only if
  a per-control treatment turns out to be needed; the frame dims the container.

**Tests and harnesses.**

- `apps/web/busy.test.ts` — R-98's auditor; every new pressable control must satisfy it.
- `apps/web/journal.test.ts` — where `unsyncedEdits` is already tested; the generation rule's unit tests join it.
- `tools/probe/run-verify-saving.cjs` — Story 5.8's deployed harness, the sibling this story's lock harness copies.
- `tools/probe/run-verify-editor.cjs` — the editor journeys. **Known-flaky**: it dies mid-run on Playwright
  timeouts and steps 36 / 66b-c FAIL intermittently on untouched code (DW-222, DW-220); re-run and record both runs.

**No application code touches `edit_locks`, `lock_generation`, `unsynced_edits` or Supabase Realtime today.**
Grepped; the only hits are the two comments above and a docstring aside in
`tools/probe/run-verify-account-purge.py:48`.

## Tasks & Acceptance

**Execution:**

- [x] `tools/probe/record-edit-lock.py` -- **FIRST, before any UI.** Against the real Supabase (R-82, keys in
      `tools/probe/.env`), with two real user sessions minted the way
      `generate_link` + `verifyOtp` already gives a script one: execute (a) a filtered `UPDATE` that returns its
      changed rows and returns **none** when the filter misses; (b) the CAS at `lock_generation N → N+1` filtered on
      `N`, twice concurrently, asserting exactly one wins; (c) a non-advancing holder change, asserting `42501` from
      `guard_lock_takeover`; (d) a Realtime **broadcast** channel per project — subscribe, send, receive, measure
      the round trip, and record whether it needs a publication or a policy. Record every verdict in
      `MEASUREMENTS.md` as the **first execution of §AD2's transport claim**. -- the whole approach rests on these
      four facts and every one is currently a hypothesis (standing rule 1).
      **DONE 2026-09-23 — §50. (a) (b) (c) all held; the CAS is expressible, so there is NO SCHEMA PHASE.
      (d) public broadcast works at 23-38 ms, private is refused without a policy on `realtime.messages`,
      and the browser has no Supabase client to open either — see the Code Map and Question 3.**
- [x] `apps/web/lib/lock.ts` -- new: the pure rules, no I/O, `node --test`-reachable as `journal.ts` is. `isStale`,
      `nextGeneration`, `displacedBy(heldGeneration, rowGeneration)`, the party a session is in
      (`holder | reader | requesting | displaced`), and the nudge timer's restart rule. -- pure rules unit-test
      without a browser, which is what made Story 5.8's journal provable.
- [x] `apps/web/lib/journal.ts` -- add `'release'` to `FlushCall` and teach `flushDecision` that it always flushes;
      add the generation half of AD-15's clearing rule **beside** `hydrationFor`, not inside it, replacing the
      comment at `:270`. -- `hydrationFor` stays the one revision rule; the generation test is independent by design.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/lock/route.ts` -- new: **the one door every `edit_locks`
      write passes**, in `sync/route.ts`'s shape and for its reason — a tab that is going cannot call a Server
      Action, and the release rides a `keepalive` fetch. One POST with an `intent` (`acquire` · `beat` · `nudge` ·
      `keep` · `release` · `takeover`), each an INSERT, a CAS or a filtered UPDATE through `supabaseServer()`.
      -- the browser holds no Supabase client and no key (Code Map); this is the only hop that can reach the row,
      and one route means one place the compare-and-set can be got wrong.
- [x] `apps/web/lib/lock-client.ts` -- new: the I/O, addressed at the route above rather than at PostgREST.
      Acquire (INSERT, then CAS on `23505`), heartbeat (filtered UPDATE carrying `unsyncedEdits`), nudge write and
      clear, release (DELETE filtered on my session), take-over (CAS), and the transport that the browser CAN have:
      `BroadcastChannel` for same-browser tabs and the heartbeat as the floor beneath it. **Supabase Realtime is
      Question 3's and is not built** -- one file owns every call, so the protocol cannot drift across call sites.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- extend `EditorData` with the lock's server
      truth at first paint (holder session, generation, `unsynced_edits`, heartbeat age), beside `revision` and
      `autosave`. -- a reader must not flash an editable shell before the client learns it is a reader.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hold the lock state beside `autosave`
      and mirror it in `latest`; **one early return in `commit()`** when not the holder; mount the heartbeat,
      the transport and the release on unmount/`visibilitychange`; dim the settings `<aside>` to 55 %; add the
      **second, assertive** live region beside `#editor-said` and never widen that one. -- `commit()` is the one
      door, so the guard is one line and cannot be forgotten at a call site.
- [x] `apps/web/components/editor/lock-bar.tsx` -- new: **B5a**. The bar above the canvas — `Lock` glyph, the
      sentence, **Request editing** on the right as a real secondary button (the frame draws a `<span>`; that is a
      drawing shortcut). -- the reader's whole affordance, and D8g will reuse the bar verbatim when 7.18 lands.
- [x] `apps/web/components/editor/lock-request.tsx` -- new: **B5b**, a **popover, not a modal** — 440 wide, the
      identity row, the sync-position strip (mint dot, the sentence, the mono count), **Hand over** (ink primary) /
      **Keep editing** (secondary), and the countdown. Announced assertively. The countdown **restarts** on any
      interaction inside it, focus included. -- the holder is mid-sentence and must not be interrupted by a modal.
- [x] `apps/web/components/editor/lock-takeover.tsx` -- new: **B5c**, a `<dialog>` opened with `openOnCancel` —
      440 wide, radius 16, the head block, the inset danger panel with the count and the honest second sentence,
      **Take over anyway** (danger fill) / **Wait** (`data-cancel`). **Never itemises the loss.** -- this is the
      component Stories 7.18 and 7.26 will reuse for D8g, so it takes its strings as props.
- [x] `apps/web/lock.test.ts` -- new: the I/O matrix's cases against `lib/lock.ts` — staleness, the CAS outcomes,
      the displaced test, the timer restart, and that a Remix reports **one** edit. -- the matrix is the contract.
- [x] `apps/web/journal.test.ts` -- extend for `'release'` and the generation-clearing rule. -- the journal's
      existing proofs are where this half belongs.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` -- add the CAS
      assertions in the file's existing shape (do the forbidden write, expect `42501`), then
      `cp` to `supabase/tests/rls.sql`. -- the gate refuses to run on a drifted copy.
- [x] `tools/probe/run-verify-lock.cjs` -- new: the deployed walk, two real browser contexts on
      `app.inflozo.com`, covering every row of the matrix that has a screen. -- R-82; a review that did not touch
      the real site is not a review.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- append **DW-238**: D8g, the deploy-and-export
      take-over, owned by Stories 7.18 and 7.26; and **DW-239**: §AD2's Realtime transport layer, which needs a
      browser-side Supabase client the app does not have (Question 3). -- the AC names D8g and it is unbuildable
      today; a deferral that is not written down is a deferral that is lost.
- [x] `_bmad-output/planning-artifacts/epics.md` + `…/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` -- correct
      UX-DR13 and § Time limits from "stops" to "restarts from the last interaction", citing F-079. -- standing
      rule 3: the ruling never reached the two documents that summarise it, and three places now disagree.

**Four things execution changed, and each is a comment beside the code it governs:**

- **There is no browser Supabase client, so the protocol runs through one of the app's own route handlers**
  (`MEASUREMENTS.md` §50(d)). `lock/route.ts` is `sync/route.ts`'s shape under the caller's own session — the same
  `authenticated` role, the same RLS and the same grants §50 executed — so the design is untouched and only the hop is.
- **The first poll must be `acquire`, and it cannot ask the STATE.** The opening state is optimistic — a first paint
  with no row shows an editable shell rather than making the customer wait a round trip — so a poll that read it sent
  the very first call as a `beat`, which matched no row: the first opener became the reader of a lock that did not
  exist and only acquired ~15 s later. It asks `heldGeneration`, which is set only when the server confirmed the lock
  is ours. **And a session that is no longer the holder clears it**, or a holder whose ROW VANISHED beat a row that
  was not there for ever — the displacement test cannot fire on a null row.
- **The release rides `pagehide` alone; the unmount does not release.** A soft navigation out of the editor and back
  raced itself, because the new mount's `acquire` and the old one's `release` carry the SAME session id from
  `sessionStorage` — so the release deleted the row the re-acquire had just inserted. The same id is what makes not
  releasing free: the tab comes back, re-reads its own row and beats. And the take-over's own reload suppresses the
  release outright (`keeping`), or the `pagehide` deleted the row the take-over had just won and the displaced
  session — testing `displacedBy(1, 1)` — was never told. **It is also `pagehide` and not the matrix's
  `visibilitychange`**, deliberately: *hidden* is an ordinary tab switch too, and releasing there would hand the lock
  to the other tab the moment you looked away (and would break the owner's own steps 10–11, where the holder keeps
  the lock while unwatched). A release that never lands is the matrix's own error column: stale in ~60 s.
- **`run-verify-editor.cjs` runs five browser contexts on one project**, which since FR-D18 is five editing sessions
  of one person. `context.close()` does not wait for the `pagehide` release and a closed tab's lock is live for
  §AD4's ~60 s, so every context after the first opened as a reader — the lock working exactly as it should. It now
  hands the lock back before each context goes (`handBack`).

**Acceptance Criteria:**

- Given a project already open and editing elsewhere, when I open it, then I get read-only mode — the canvas fully
  legible, the settings sidebar at 55 % and still readable by a screen reader, no control moving when pressed — with
  a bar naming the other session and a **Request editing** button, **and the bar matches frame B5a**.
- Given I press **Request editing**, when the other session is alive, then it shows the request as a **popover, not
  a modal**, stating its sync position before asking, with **Hand over** and **Keep editing** and a ~30 s countdown,
  announced **assertively**, **and it matches frame B5b**.
- Given the holder presses **Hand over**, when its flush succeeds, then it releases the lock and becomes read-only
  and I gain edit rights; and when its flush fails, then it keeps the lock and says so, so unsynced work never
  crosses the boundary.
- Given the holder focuses the popover and does nothing, when ~30 s passes from that moment, then the countdown has
  restarted from the interaction rather than stopping, and the take-over is then offered (F-079).
- Given my request goes unanswered, when the timer runs out, then I am told "No response; that session has X
  unsynced edits" with X taken from the heartbeat, and **take over anyway** is offered; the confirm **matches frame
  B5c**, never itemises the loss, and **opens with focus on the cancelling action**.
- Given I take over, when the write lands, then `lock_generation` has advanced by exactly one in the same statement
  as the holder change, and I am editing the last synced snapshot.
- Given a session that has been taken over from, when it next reaches the server, then it flips to read-only, is
  told **assertively** how many of its edits were not included, and its local journal is cleared unconditionally —
  decided by the generation test, with no revision comparison involved.
- Given a Variant Shuffle or a Site Remix of any size, when its edit count is reported anywhere, then it counts as
  **one** edit, and no operation count appears in any string, any heartbeat or any log.
- Given Supabase Realtime is unreachable, when a second session opens or a request is sent, then the choreography
  still completes on the heartbeat alone within ~15 s and nothing about the transport is shown to the user.
- Given two sessions race to acquire a free or stale lock, when both write, then exactly one holds it and the other
  becomes a reader without an error surface.

## Design Notes

**Why a compare-and-swap and not an RPC.** `lock_generation` is in the `authenticated` UPDATE grant and out of the
INSERT grant, the monotonic trigger forbids a rewind, and `guard_lock_takeover` forbids a holder change that does
not advance it. That is a CAS token, and the schema's own comment at `:1249-1253` says the protocol was left to this
story. The read-modify-write race that would normally force a `security definer` function is closed by the filter:
writing `holder = me, generation = N+1` **filtered on `generation = N`** changes zero rows if anyone moved first.
The security argument that usually motivates the RPC does not apply here at all — **`projects.user_id` is one
account and team seats are explicitly out of v1** (`prd.md:1298`, Appendix G), so every session that can reach the
row is the same person's. The whole of this story is one user's devices negotiating with each other.

**That fact is also why the copy was a question, and it is now ruled.** Every string on B5a, B5b and B5c named
another *person* — "Rosa", "Dai", a "DM" avatar, "Or message Rosa" — and none of them can happen in v1. The owner
ruled **R-189** (say where, never who) and **R-190** (*unsynced*, never *unsaved*) on 2026-09-23.

**The strings, settled. These are the strings.**

| Where | What it says |
|---|---|
| B5a, the reader's bar | **"You are editing this site somewhere else — you are reading along here"** · button **Request editing**, which swaps to **Asking…** while in flight (R-98) |
| B5b, title | **"Your other session wants to edit"** |
| B5b, body | *"If you hand over, your unsynced edits are sent first. You keep reading along."* |
| B5b, sync strip — nothing owed | mint dot · *"All your edits are synced"* · mono **"0 pending"** |
| B5b, sync strip — N owed | grey dot · *"N unsynced edits will be sent first"* · mono **"N pending"** |
| B5b, actions | **Hand over** (ink primary) · **Keep editing** (secondary) · *"Expires in 30s"* |
| The requester, unanswered | **"No response; that session has X unsynced edits"** · **Take over anyway** |
| B5c, heading | **"Take over from your other session?"** |
| B5c, body | *"That session has not responded for &lt;duration&gt;. It has edits that never reached the server."* — the duration is time since the request was sent; the second sentence is absent when nothing is owed |
| B5c, danger panel | *"X unsynced edits will be lost"* / *"They exist only in that session. We cannot retrieve them from here."* — the whole panel is **absent** when X is 0 |
| B5c, actions | **Take over anyway** (danger fill) · **Wait** (`data-cancel`, focus opens here). **No "Or message Rosa".** |
| The displaced session | the B5a bar, plus assertively: **"This session had X unsynced edits; they were not included."** |

Two routine judgements sit inside R-189 and are recorded there rather than asked. B5b's 32 × 32 avatar **keeps its
size and its place** — the mark-then-ask shape is what makes the popover readable — and carries the Kit's `Lock`
(`icons.tsx:449`), B5a's own padlock, instead of initials. And the displaced session's sentence reads **"This
session"**, not the approved "That session", because it is read *by* the session it is about; one pronoun, so the
sentence is true from where it is read.

**Two extrapolations from the frames, both within R-74.** Nothing draws the requester's waiting state or a take-over
with nothing owed. The first is R-98's own rule and needs no new surface — the pressed button says **Asking…** and
the bar is unchanged. The second reuses B5c with its danger panel absent rather than zeroed (UX-DR3: absent, never
empty), because a confirm that says "0 unsynced edits will be lost" in red is a warning about nothing.

**The three transport layers, cheapest first.** `BroadcastChannel` is free and covers the overwhelmingly common
case (two tabs — which is DW-203 verbatim). Supabase Realtime **broadcast** — ephemeral pub/sub, not Postgres
Changes, so it needs no publication and therefore no migration — covers another browser or device. The heartbeat's
own ~15 s round trip is the floor underneath both, which is what lets the story ship even if Realtime disappoints.
`addendum.md:45` is the only statement of this transport in the whole project and **nothing has ever executed it**;
`MEASUREMENTS.md` has zero occurrences of "realtime" or "broadcast". The probe task closes that.

**The wording this story corrects, with its ruling.** F-079 ruled that F2's holder countdown **restarts** on
interaction rather than stopping (`reconcile-designs-decisions.md:1313-1314`), and `EXPERIENCE.md:1027` states it at
length — *"It does not stop"*. Three other places still carry the earlier summary: `UX-DR13` (`epics.md:298`),
`EXPERIENCE.md:557` (§ Time limits) and this story's own AC in `epics.md:2189-2190`. **Restart is the built
behaviour**, taken as routine judgement because it is already ruled; the three wordings are corrected as a task
(standing rule 3). The behaviours agree in effect — a timer that restarts on interaction still only runs out when
nobody is there — so this is a wording fix, not a reversal.

**The constants.** Heartbeat ~15 s, nudge ~30 s, stale ~60 s — §AD4's defaults, which the Architect owns. The frame
draws "Expires in 60s"; `EXPERIENCE.md:1063` rules that difference explicitly **not a finding**, so this story takes
§AD4's ~30 s and B5b prints it. Load-bearing by contrast and **not** tunable: the revision comparison, the
generation test and `unsynced_edits` as the sole surfaced count (`addendum.md:72`).

**What D8g leaves behind.** `lock-takeover.tsx` takes its heading, body and confirm label as props precisely so that
Story 7.18 renders *"Take over to ship?"* through it and Story 7.26 does the same for export, with no second
component and no second vocabulary. That is the whole of what this story owes them; the gate itself belongs where
deploy and export are written.

## Verification

**R-82 — the real services this story hit, and what each returned.** Keys were read from
`tools/probe/.env` into a command's environment and never printed; each is named below by its
variable name alone.

**Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`) — the production
project, 2026-09-23:

- `env $(grep -E '^SUPABASE_(URL|SECRET_KEY|PUBLISHABLE_KEY)=' tools/probe/.env | xargs) python3 tools/probe/record-edit-lock.py`
  — **all four facts executed, each with a control that passed**, recorded as `MEASUREMENTS.md` §50.
  The filtered UPDATE returned its changed row (HTTP 200, 1 row) and `[]` at HTTP 200 when the filter
  missed, with the row unmoved; two sessions racing one CAS produced **exactly one winner** (1 row vs
  0 rows) beside an uncontended control that changed 1 row; a holder change at an unchanged generation
  returned **HTTP 403, SQLSTATE `42501`** from `guard_lock_takeover`, beside a control at `N → N+1`
  that was accepted; an INSERT naming `lock_generation` was `42501`, a plain INSERT defaulted it to 1,
  and a second INSERT was **HTTP 409, `23505`**. Realtime: a **public** broadcast channel
  `lock:<project id>` subscribed and delivered in **23–38 ms** with another project's channel staying
  out (the isolation control), and a **private** channel was refused —
  `CHANNEL_ERROR: Unauthorized: You do not have permissions to read from this Channel topic`.
  The fixture account and its two projects were deleted in a `finally` and the Admin-API user count
  came back to its starting value.
- It also executed a fact nothing had asserted: **the service role cannot read `edit_locks` at all**
  (absent from the `service_role` grant loop), returning nothing with no error. Every read and write
  of that table — app, harness and probe — goes through a user session.

**The local gates**, on Node 24 (the repo's `engines.node`; the shell's default is 22):

- `pnpm check` — **exit 0** on the code at `d66fa06f`. `apps/web` printed 508 tests / 508 pass / 0 fail,
  including the new `lock.test.ts` (with this phase's request-identity and `heldElsewhere` rules), the
  extended `journal.test.ts` and `editor.test.ts`, and R-98's `busy.test.ts` auditor, which walks
  `components/` and so reaches the three new surfaces; `packages/*` and the render-matrix suite green.
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, the `pg_dump` drift guard passing (so
  `RLS-TEST.sql` was edited and copied, not the other way round), with the new F4 assertions among
  the passes: *the CAS at generation N → N+1 filtered on N changes exactly one row*, *the losing CAS
  changes no row and the winner still holds the lock*, and *a displaced heartbeat changes nothing and
  `unsynced_edits` survives the take-over*. No SQL changed after it; CI's `rls` job ran the same gate green
  on every push since.
- `python3 tools/doc-audit.py --check` — **PASS (0 warnings)**, with both new probes catalogued.

**Vercel and the deployed site** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `GITHUB_TOKEN` to read the
runs). CI went **green on every Dev push** — `check` and `rls` passed, so `deploy` ran (DW-7); the first
push of 2026-09-24 carried its own date-stamp commit (`d3f6a427`, DW-132) so CI's gate stayed green —
and the walks below each ran against the deployment Vercel served **READY, built from this
checkout's HEAD**, which each walk verifies before it starts. The final state is
`dpl_G6VDH13jjZsfdkLe5eU1mdzMmani` **READY at `d66fa06f`**. The deployed walks were therefore run at
Dev rather than deferred, and the Matrix Test Audit's rows, the defects they exposed and each fix follow:

- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node tools/probe/run-verify-lock.cjs`
  — **0 FAIL, 65 PASS on `app.inflozo.com` at `d66fa06f`**, two real browser contexts of one account
  on their own fixture (autosave switched off through `profiles.user_id`, so no timer races the walk),
  covering every row of the I/O matrix that has a screen — including each row the audit below added.
  (Earlier runs, in order: 45 PASS at `d895c183`; 48 PASS at `d9e5f090`; 61 PASS + 2 FAIL of the walk's
  own pointer at `d3f6a427`; 56 PASS + 7 FAIL at `91c6fc58`; 64 PASS + 1 FAIL of the fixture's column at
  `2052bf5d` — every failure is accounted for below.) Among the passes, on the real site: B5a's bar in the ruled words
  with nobody named and the sidebar at `0.55` described by the bar's own sentence; `commit()` refusing
  with the Layers list unmoved and the revision unchanged; B5b a **popover** at 440 announced
  assertively; the countdown really counting (30s → 26s) and **focus restarting it** (26s → 29s,
  F-079); Hand over's flush landing **before** the row is deleted; B5c opening with focus on **Wait**,
  at 440/radius 16, never itemising the loss; the take-over advancing the generation **by exactly
  one** in the same statement as the holder change, with A then editing the last synced snapshot; and
  the displaced session told assertively *and shown in its bar* — *"This session had 1 unsynced edit;
  they were not included."* — with its journal cleared unconditionally. The fixture account was deleted and the user
  count came back (13 before · 13 after). It refuses a dirty tree or a deployment that is not HEAD.
- **The Matrix Test Audit found one row with no covering test, and the test found a real defect.**
  *"Same session reloads → row exists, `holder_session_id` is mine → lock kept, no generation
  change"* was the one row nothing exercised. Measured on `app.inflozo.com` at `d895c183`: after a
  reload the row was **gone** — the outgoing page's `pagehide` release lands after the new page's
  server render — so the first beat matched nothing, and the session then sat reading B5a's bar,
  *"You are editing this site somewhere else"*, **about its own tab, for a full ~14 s heartbeat**,
  with every edit silently refused. A customer's own F5 cost them the editor. **Fixed** in
  `editor.tsx`'s poll: a beat that finds **no row at all** means the lock is free, so it acquires at
  once instead of waiting for the next beat — bounded to exactly one extra call by `wasHolder`, which
  is read from `heldGeneration` rather than `holding` because `holding` stays true for a nudge's
  worth of time after Hand over and that pair would spin. `run-verify-lock.cjs` gains the row as
  three assertions — 2.5 s after a reload there is **no bar**, the generation is **unmoved** (1 → 1:
  the same session, not a take-over) and the **unsynced work is kept** — and all three PASS at
  `d9e5f090`. **Their control is the same observation before the fix** (standing rule 2): the bar
  exists exactly when `lock.holder` is false, and at `d895c183` it was on screen at every sample from
  0.5 s to 10 s after a reload, on every observation made (two probe runs, and step 93 below), so the
  2.5 s assertion would have failed there.
- **That fix was itself incomplete, and the editor walk said so twice at the same line.** Step 69 died
  at its wait for "Retrying" in two of four runs — never on the memory's list of flaky steps, and always
  right after step 68's same-tab navigation. A sampler on `app.inflozo.com` at `2052bf5d` showed why:
  after **every** navigation the session was the holder at 0.5 s, a **reader at 1 s** and the holder
  again by 2 s — five of five. The re-poll acquired at once, but only *after* `land` had flipped the
  state, so B5a's bar **flashed** over the customer's own tab on every reload and a Hide pressed in that
  second was silently refused. Now a beat that finds no row at all never lands: it goes straight to
  `acquire`, and only the acquire's answer sets the state. The walk's reload row no longer glances at
  2.5 s — it **samples every ~100 ms for 3 s** and fails on a single sighting.
- **The same audit found a second defect, under "Keep editing", and it was executed before it was
  fixed.** The holder dismissed a request by the asking **tab's id**, so one Keep editing silenced that
  tab for good. On `app.inflozo.com` at `d9e5f090`, two contexts of one account: the first request
  reached the holder, Keep editing cleared it and the requester was told — and then **the requester's
  SECOND request never reached the holder**, and after its 30 s the requester was offered **Take over
  anyway** for a request the holder had never been shown: a take-over with no consent step, which is
  the one thing the choreography exists to prevent. **Fixed** by giving a request an identity —
  `LockRow.request`, its session **and** the moment it was made, computed once in `rowFrom` where the
  route, `read.ts` and `node --test` all reach it — and dismissing *that*, at all three call sites.
  `lock.test.ts` gains the rule, and `run-verify-lock.cjs` the row. That repro is the negative control
  for the walk's new check.
- **The audit's remaining rows are now walked too**, where before only their pure rules were unit-tested:
  the reader's waiting state (**Asking…** + `aria-busy`, R-98); **Keep editing** (columns cleared, the
  requester told, no take-over offered, and the same tab's second ask reaching the holder); **a
  take-over with nothing owed** (B5b's "all synced · 0 pending", then B5c still asking but with no
  danger panel, no owed sentence and a confirm whose fill differs from the owed confirm's — compared,
  never a literal colour — and Wait taking nothing); and **a stale lock** (a holder whose lock route
  fails goes stale and the reader's own poll takes it **silently** at N+1 through the route's
  age-filtered CAS; the cut-off holder shows no bar — the heartbeat's "network error ⇒ no state
  change" — and once it can reach the server again it is displaced and told).
- **The extended walk's run at `91c6fc58` found a third defect: work crossed the lock boundary AFTER a
  take-over.** Run 4 (7 FAIL, 56 PASS) had two causes. Five failures were one fact: the second request's
  card came ~3 s after an 18 s *sleep* (a cold function on the nudge's write), so every check on it read
  nothing — the walk now **waits for** the card, two beats at most. The seventh was real: B was told
  *"This session had 0 unsynced edits"* although the same run proved its deletion never reached the
  cloud before the take-over. B's 3-minute autosave (it ticks from the page's load, not from the edit)
  had fired **after** the take-over and before B's next beat noticed it, and `/sync` — which knew nothing
  of the lock — **accepted the orphaned edit**: B5c's "will be lost" became false, the new holder was
  left to meet a 409, and B was told the opposite of what happened. That breaks this story's own AC
  ("when it next reaches the server … told how many of its edits were not included") and the
  addendum's "orphaned work is never merged, replayed or recovered". **Fixed where the work is
  written:** the flush carries its tab's lock session, `/sync` answers **423** when *another* session
  holds the lock (`heldElsewhere` in `lib/lock.ts`, unit-tested; a free lock and a tab that has not
  learned its id refuse nothing), and the editor reads a 423 as "taken over from" — no retry, no conflict
  dialog, one lock read that drives the displaced flow while the journal still holds the true count. The
  read and the RPC are two statements, so a take-over landing in the milliseconds between them still
  lets one write through (the revision CAS then answers the new holder with a 409) — closing that is a
  check inside `sync_project_doc`, a migration, noted beside the code. The walk now switches autosave
  **off** on its own fixture account, so no timer races it, and **presses ⌘S on B right after the
  take-over**, asserting the cloud still has the section B deleted.
- **And a fourth, found while rewriting the owner's test: the loss sentence was never SHOWN.** *"This
  session had 1 unsynced edit; they were not included."* went only to `#editor-announced`, which is
  `sr-only`, so a sighted person whose session was taken over saw the ordinary reading-along bar and was
  never told — against EXPERIENCE.md F2 (the revived holder is a *surface* carrying that sentence) and
  this spec's own "told plainly, the next time anyone looks at it". It now also fills B5a's own sentence
  slot until the session asks again or holds again, and — B5c's UX-DR3 ruling applied to the same loss —
  only when something was lost; with nothing lost the ordinary bar says all there is to say. The
  assertive announcement is unchanged.
- **The owner's manual test is rewritten, because it could not be passed as written.** It used two
  **tabs**, and Story 5.8 sends a tab's work the moment you leave it, so by step 11 window B's edit was
  already in the cloud: it would have read "0 unsynced edits", shown no danger panel and kept "Tab B was
  here". It now uses two **windows side by side** with automatic sending switched off first (and back on
  at the end), step 6 says plainly that window B's own clock offers a take-over while you look at the
  card, step 13 describes the sentence as now shown, and the clean-up types the original headline back —
  a take-over starts from the cloud copy with no history, so the old "⌘Z until it reads what it did"
  could not have worked either.
- **A residual race is recorded rather than guessed at — DW-240.** `pagehide` cannot tell a reload from
  a close, so a reload still leaves a gap of about a round trip in which another open session's poll can
  take the lock (about one reload in ten when a second session is open). Nothing is lost silently when
  it does — the reloaded tab reads along and its flushes answer 423 — and each obvious fix costs
  something worse; the ledger row lists them.
- **The reload row's control, by the same instrument before and after:** a sampler that navigates the
  editor to itself eight times and reads the bar at 0.5 s to 8 s saw it **flash in 5 of 5** navigations
  at `2052bf5d` and **in 0 of 8** at `d66fa06f`.
- `node tools/probe/run-verify-editor.cjs` — **0 FAIL, 575 PASS on `app.inflozo.com` at `d66fa06f`**,
  first attempt, exit 0 — step 69 included. Before that, at `d9e5f090`: run 3 clean at 0 FAIL, 575 PASS,
  a complete walk. **Step 93 now passes** — the field reads *"The archive — page
  {page_number}"* where it read *"The archive"* at `d895c183`, the reload fix proven by an independent
  instrument — and so does **step 83**, which asserts a real deployment's build id and so could never
  pass on the local build the agent first ran (573 PASS, 1 FAIL there). **Every run is recorded,
  because two of them were not the flake they looked like:** at `d9e5f090` run 2 died with a `HARNESS
  ERROR` at step 69's 15 s wait and run 3 passed; at `2052bf5d` run 6 died at the same line and run 7
  passed. A `HARNESS ERROR` with no `FAIL` line is not a result (DW-222's rule), but the same line twice
  is not DW-222's random timeout either — it was the reload flash above, and at `d66fa06f` the walk
  passed step 69 on its first attempt. Neither the intermittent step 36 nor 66b-c failed in any run.

**Manual checks:**

- `MEASUREMENTS.md` §50 is the first section in the project to carry "realtime" or "broadcast" — the
  first execution of `addendum.md:45`'s transport claim.
- The assertive region is a **second** element: `#editor-said` still reads `aria-live="polite"`
  (`editor.tsx:3152`) and `#editor-announced` reads `aria-live="assertive"` (`:3160`).
- The word *unsaved* appears in no user-visible string; `lock.test.ts` asserts it over the whole
  `LOCK_COPY` list.

## Owner's manual test

Do this on the real site after Deploy confirms the build, in a desktop browser about 1440 wide. You need **two
windows of the same browser, side by side** (⌘N opens a second one), both signed in as you — that is all "two
sessions" means here, and your laptop and your phone behave the same way. Everything you change is put back at the end.

**Two things to set up first, and why.** *Windows, not tabs:* a tab you switch away from sends its work to the cloud
the moment you leave it, so with two tabs there would be nothing left to lose at step 12. *Automatic sending off:* the
editor otherwise sends your work every few minutes on its own, which would do the same. You switch it back on at the end.

Use **Pilot sections** — `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`.

Steps 1–3 are the reader's bar (**B5a**). Steps 4–7 are the request and the hand-over (**B5b**). Steps 8–12 are the
no-response take-over (**B5c**). Step 13 is what the session you took it from is told. Every sentence below is the
wording you ruled on 2026-09-23 — **R-189** (it says where, never who, and nobody is named) and **R-190**
(*unsynced*, never *unsaved*).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 0 | `https://app.inflozo.com/account` | Account, **Saving** | Switch off **Send my work to the cloud automatically**, then press **Turn it off**. | — | The switch shows off. |
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open it in **window A**, on the left. **Write down the hero's big headline as it reads now**, then click it and type over it. | `Window A was here` | The words change, and the save indicator beside the project's name turns to a grey clock — one edit is not on the server yet. |
| 2 | same | Editor, Home | Press **⌘N** for **window B**, open the same address there, and put it on the right so you can see both. | — | A bar across the top of window B reads **"You are editing this site somewhere else — you are reading along here"**, with a **Request editing** button on the right. The page itself is perfectly readable. **No name anywhere** — it never pretends someone else is in your account. |
| 3 | window B | Editor, Home | Try to click the hero's headline and type. Then look at the settings panel on the right. | `nope` | **Nothing happens** — no letters appear, and nothing jumps or flickers. The settings panel is dimmed, but you can still read every setting. |
| 4 | window B | Editor, Home | Press **Request editing**. | — | The button changes to **Asking…** and stays that way while it waits. |
| 5 | window A | Editor, Home | Look at window A. | — | A small card — **not** a full-screen box — headed **"Your other session wants to edit"**, with a padlock in the circle where a photo would go. Under it: *"If you hand over, your unsynced edits are sent first. You keep reading along."* and a strip reading **"1 unsynced edit will be sent first · 1 pending"**. Then **Hand over**, **Keep editing**, and *"Expires in 30s"*. |
| 6 | window A | Editor, Home | Rest the mouse on the card, without pressing anything, for a full minute. | — | The card's countdown keeps **starting again** rather than running out — a card you are looking at never hurries you. Window B, meanwhile, offers **Take over anyway** after about thirty seconds: that is its own clock, and **you leave it alone**. |
| 7 | window A | Editor, Home | Press **Hand over**. | — | Your edit is sent first (the indicator goes green), then window A gets the same reading-along bar window B had. |
| 8 | window B | Editor, Home | Look at window B, then click the headline and type. | — | The bar is gone and typing works — and the headline already says **Window A was here**, so nothing was lost. |
| 9 | window B | Editor, Home | Type over the headline again. | `Window B was here` | The words change and the indicator shows a grey clock. |
| 10 | window A | Editor, Home | Press **Request editing** in window A, then take your hands off and **do not touch window B**. Wait about forty seconds. | — | Window B shows the card, with **"1 unsynced edit will be sent first · 1 pending"**. Leave it. |
| 11 | window A | Editor, Home | Look at window A. | — | Its bar reads **"No response; that session has 1 unsynced edit"** and offers **Take over anyway**. |
| 12 | window A | Editor, Home | Press **Take over anyway**, read the box, notice where the keyboard is, then press the red **Take over anyway** inside the box. | — | A box headed **"Take over from your other session?"**, then *"That session has not responded for …"*, and a pink panel reading **"1 unsynced edit will be lost"** with *"They exist only in that session. We cannot retrieve them from here."* **Your keyboard starts on Wait**, not on the red button. There is **no "message someone" line**. Once you confirm, window A is editing and the headline reads **Window A was here** — window B's words are gone, as the box said. |
| 13 | window B | Editor, Home | Look at window B, then press **⌘Z**. | — | Its bar now reads **"This session had 1 unsynced edit; they were not included."**, with **Request editing** beside it. **⌘Z brings nothing back**, which is what the sentence promised. |

Afterwards: in window A, type the headline you wrote down at step 1 back in, press **⌘S**, and check the indicator
turns green — a take-over starts from the cloud copy with no history, so ⌘Z has nothing to undo there. Then open
`https://app.inflozo.com/account` and switch **Send my work to the cloud automatically** back on.

## Questions for the owner

### Question 1 — The drawings say "Rosa is editing this site". There is no Rosa. What should it say instead?

**In plain English.** The three drawings for this screen were made assuming two different people share a project —
they name a person ("Rosa is editing this site", "Dai wants to edit"), draw that person's initials in a circle, and
offer "Or message Rosa" as a way out. **Inflozo has no sharing.** A project belongs to one account, and team seats
are on the list of things deliberately left out of the first version. So the other session is **always you** — your
other tab, your laptop, your phone — and there is nobody to message.

The choreography itself is exactly right and does not change. Only the words do.

**An example.** You are editing your site on your laptop. You open the same project on your phone on the train. The
phone needs a sentence at the top of the screen. Today's drawing would make it say *"Umang is editing this site —
you are reading along"*, which reads as though you had a colleague.

1. **Say where, not who — "somewhere else" (RECOMMENDED).**
   - The bar: **"You are editing this site somewhere else — you are reading along here"**
   - The card: **"Your other session wants to edit"**
   - The red box: **"Take over from your other session?"** and *"That session has not responded for 4 minutes. It
     has edits that never reached the server."*
   - **"Or message Rosa" is removed.** There is nobody to message.
   - It is true whether the other one is a tab, a laptop or a phone, and it needs no guessing. It also reuses two
     sentences the specification already approved word for word — *"No response; that session has X … edits"* and
     *"That session had 14 … edits; they were not included."* — so the whole flow speaks with one voice.
2. **Say "your other window" everywhere.**
   - Warmer and more concrete: *"You are editing in another window"*, *"Take over from your other window?"*
   - It is wrong when the other one is your phone or a different computer, and we cannot always tell which it is.
3. **Keep the drawings exactly, using your own name.**
   - *"Umang is editing this site — you are reading along"*, with your initials in the circle.
   - Nothing is redrawn, and the sentences are ready for the day sharing ships.
   - It reads as though someone else is in your account, which is the one thing it must not suggest, and "Or message
     Rosa" would have to go anyway.

**Ruled: option 1 (owner, 2026-09-23)** — *"Say where, not who — 'somewhere else'."* Recorded as **R-189**. "Or
message Rosa" is removed, the avatar carries the Kit's `Lock` instead of initials, and the displaced session's own
sentence reads "**This** session had X unsynced edits" so it is true from where it is read. The settled strings are
the table in *Design Notes*.

### Question 2 — Is an edit that is on your computer but not on the server "unsaved" or "unsynced"?

**In plain English.** The same number is named twice in the approved wording, with two different words. The red box
says *"7 **unsynced** edits will be lost"*; the message to the session that lost them says *"That session had 14
**unsaved** edits; they were not included."* They are the same thing, and they sit a few seconds apart in the same
flow. You have asked before that one thing have one name everywhere, so this is yours to settle.

**An example.** The little indicator at the top of the editor already tells you, in its own words, **"Saved on this
device"** and then **"Synced"** when it reaches the server. So an edit that has been written to your computer but
not yet sent has genuinely been *saved* — it just has not been *synced*.

1. **"unsynced" everywhere (RECOMMENDED).**
   - *"7 unsynced edits will be lost"* · *"No response; that session has 7 unsynced edits"* · *"That session had 7
     unsynced edits; they were not included."*
   - It agrees with the indicator that is on the same screen. Calling them "unsaved" two inches under a badge that
     says "Saved on this device" would contradict it.
2. **"unsaved" everywhere.**
   - *"7 unsaved edits will be lost"*, and so on.
   - "Unsaved" is the plainer, more familiar word — most people know what an unsaved document is.
   - It says the opposite of what the indicator on the same screen says, and the honest meaning is not "you never
     saved it" but "it never left this device".
3. **"not sent to the server" spelled out.**
   - *"7 edits that never reached the server will be lost"*.
   - Nobody can misread it, and it is already the wording of the red box's second line.
   - It is long, and it cannot be used where a short count is needed — "that session has 7 …".

Whichever you pick, the number itself is unchanged: it counts **things you did**, not the machinery underneath, so a
Shuffle or a Site Remix is one edit however much it moved.

**Ruled: option 1 (owner, 2026-09-23)** — *"'unsynced' everywhere."* Recorded as **R-190**. *unsaved* appears
nowhere in the product; the stored column and the wire field stay `unsynced_edits`, which they already were.

### Question 3 — When you edit on your phone, how fast should your laptop notice? (raised at Dev, 2026-09-23)

**In plain English.** The plan had three ways for one session to tell the other one something: a free
one that works between two tabs of the same browser, a middle one through Supabase's live-messaging
service, and a slowest one that just waits for the next check-in with the server. Building it, two
things turned up that were never checked before.

The free one works and is **instant**. The slowest one works and takes **up to about fifteen seconds**.
The middle one **cannot be built as the app stands**: our pages talk to Supabase only from our own
server, never from your browser — that is deliberate, it is why our sign-in cookie cannot be read by
any script on the page — and the live-messaging service also refuses a private channel until we add a
permission rule to the database. Both of those are changes to how the product is built, not
engineering details, so they are yours.

Nothing is broken either way. Everything in this story works today; the only question is the delay.

**An example.** You are editing your site on your laptop. You pick up your phone and open the same
project, and press **Request editing**. With what is built now, your laptop shows the little card
within about fifteen seconds. Two tabs of the same browser on the laptop show it instantly.

1. **Leave it at about fifteen seconds. (RECOMMENDED)**
   - Two tabs of one browser — by far the commonest case, and the one that caused the original
     problem — are already instant, and cost nothing.
   - Laptop-to-phone waits up to about fifteen seconds, once, at the moment you ask to take over. The
     same delay runs the other way too: the card on the device you are asking can appear up to fifteen
     seconds late, so that device may have only about fifteen of its thirty seconds to answer before
     **Take over anyway** appears on yours. Both are always you, and the red box still says exactly how
     many edits a take-over would lose before anything is lost.
   - Nothing new is exposed, nothing is added to the database, and nothing costs more.
2. **Make other devices instant too.**
   - We would put a Supabase connection in the browser page itself. That means publishing a key into
     the page, letting the page read your signed-in session, and adding a permission rule to the
     database (a migration, applied by hand before it ships).
   - Instant everywhere, on any device.
   - It reverses a deliberate decision — today nothing about Supabase is reachable from the page — so
     it is a security change, and it would be its own story rather than part of this one.
3. **Ask the server more often instead — say every five seconds.**
   - No new key and no database change; the delay drops from about fifteen seconds to about five.
   - Every editing session would send three times as many background requests, all day, for a card
     that appears a handful of times ever — more battery on a phone and more cost on every plan.

Whatever you choose, the take-over itself, the warnings and the counts are unchanged — this is only
about how long the other session waits before it hears.

**Ruled: option 1 (owner, 2026-09-24)** — *"Leave it at about fifteen seconds."* Recorded as **R-191**. Supabase
Realtime is not used in v1: the lock signals over `BroadcastChannel` (same browser, instant) and its own ~15 s
heartbeat (everything else), which is what Dev built. DW-239 is closed with this ruling as its reason; reopening it is
its own story with a Schema phase (a browser-side client, a published key and a `realtime.messages` policy).
