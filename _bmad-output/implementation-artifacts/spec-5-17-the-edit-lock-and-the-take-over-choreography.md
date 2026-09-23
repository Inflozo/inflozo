---
title: 'Story 5.17 — The edit lock and the take-over choreography'
type: 'feature'
created: '2026-09-23'
status: 'ready-for-dev'
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

- **The two questions under `## Questions for the owner`** — what the other session is *called*, and *unsaved* vs
  *unsynced*. Every user-visible string in this story waits on them; build the mechanism first and wire the words
  last.
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
| Displaced holder | its next beat changes 0 rows, or a broadcast arrives, or a read shows a generation past its own | **read-only**; assertive notice stating its own last `unsynced_edits`; journal cleared unconditionally on the next hydrate | N/A |
| Realtime unreachable | channel never subscribes, or drops | everything still works on the heartbeat floor (≤ ~15 s); nothing is announced about the transport | reconnect is attempted; never block the editor on it |
| Tab closed while holding | `visibilitychange` / unmount | the existing `'unload'` flush, then a best-effort release | if the release does not land, the row goes stale in ~60 s and the next opener acquires it |

## Code Map

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

- [ ] `tools/probe/record-edit-lock.py` -- **FIRST, before any UI.** Against the real Supabase (R-82, keys in
      `tools/probe/.env`), with two real user sessions minted the way
      `generate_link` + `verifyOtp` already gives a script one: execute (a) a filtered `UPDATE` that returns its
      changed rows and returns **none** when the filter misses; (b) the CAS at `lock_generation N → N+1` filtered on
      `N`, twice concurrently, asserting exactly one wins; (c) a non-advancing holder change, asserting `42501` from
      `guard_lock_takeover`; (d) a Realtime **broadcast** channel per project — subscribe, send, receive, measure
      the round trip, and record whether it needs a publication or a policy. Record every verdict in
      `MEASUREMENTS.md` as the **first execution of §AD2's transport claim**. -- the whole approach rests on these
      four facts and every one is currently a hypothesis (standing rule 1).
- [ ] `apps/web/lib/lock.ts` -- new: the pure rules, no I/O, `node --test`-reachable as `journal.ts` is. `isStale`,
      `nextGeneration`, `displacedBy(heldGeneration, rowGeneration)`, the party a session is in
      (`holder | reader | requesting | displaced`), and the nudge timer's restart rule. -- pure rules unit-test
      without a browser, which is what made Story 5.8's journal provable.
- [ ] `apps/web/lib/journal.ts` -- add `'release'` to `FlushCall` and teach `flushDecision` that it always flushes;
      add the generation half of AD-15's clearing rule **beside** `hydrationFor`, not inside it, replacing the
      comment at `:270`. -- `hydrationFor` stays the one revision rule; the generation test is independent by design.
- [ ] `apps/web/lib/lock-client.ts` -- new: the I/O. Acquire (INSERT, then CAS on `23505`), heartbeat (filtered
      UPDATE carrying `unsyncedEdits`), nudge write and clear, release (DELETE filtered on my session), take-over
      (CAS), and the three-layer transport: `BroadcastChannel` for same-browser, a Supabase Realtime broadcast
      channel per project, and the heartbeat as the floor. -- one file owns every write to `edit_locks`, so the
      protocol cannot drift across call sites.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- extend `EditorData` with the lock's server
      truth at first paint (holder session, generation, `unsynced_edits`, heartbeat age), beside `revision` and
      `autosave`. -- a reader must not flash an editable shell before the client learns it is a reader.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- hold the lock state beside `autosave`
      and mirror it in `latest`; **one early return in `commit()`** when not the holder; mount the heartbeat,
      the transport and the release on unmount/`visibilitychange`; dim the settings `<aside>` to 55 %; add the
      **second, assertive** live region beside `#editor-said` and never widen that one. -- `commit()` is the one
      door, so the guard is one line and cannot be forgotten at a call site.
- [ ] `apps/web/components/editor/lock-bar.tsx` -- new: **B5a**. The bar above the canvas — `Lock` glyph, the
      sentence, **Request editing** on the right as a real secondary button (the frame draws a `<span>`; that is a
      drawing shortcut). -- the reader's whole affordance, and D8g will reuse the bar verbatim when 7.18 lands.
- [ ] `apps/web/components/editor/lock-request.tsx` -- new: **B5b**, a **popover, not a modal** — 440 wide, the
      identity row, the sync-position strip (mint dot, the sentence, the mono count), **Hand over** (ink primary) /
      **Keep editing** (secondary), and the countdown. Announced assertively. The countdown **restarts** on any
      interaction inside it, focus included. -- the holder is mid-sentence and must not be interrupted by a modal.
- [ ] `apps/web/components/editor/lock-takeover.tsx` -- new: **B5c**, a `<dialog>` opened with `openOnCancel` —
      440 wide, radius 16, the head block, the inset danger panel with the count and the honest second sentence,
      **Take over anyway** (danger fill) / **Wait** (`data-cancel`). **Never itemises the loss.** -- this is the
      component Stories 7.18 and 7.26 will reuse for D8g, so it takes its strings as props.
- [ ] `apps/web/lock.test.ts` -- new: the I/O matrix's cases against `lib/lock.ts` — staleness, the CAS outcomes,
      the displaced test, the timer restart, and that a Remix reports **one** edit. -- the matrix is the contract.
- [ ] `apps/web/journal.test.ts` -- extend for `'release'` and the generation-clearing rule. -- the journal's
      existing proofs are where this half belongs.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` -- add the CAS
      assertions in the file's existing shape (do the forbidden write, expect `42501`), then
      `cp` to `supabase/tests/rls.sql`. -- the gate refuses to run on a drifted copy.
- [ ] `tools/probe/run-verify-lock.cjs` -- new: the deployed walk, two real browser contexts on
      `app.inflozo.com`, covering every row of the matrix that has a screen. -- R-82; a review that did not touch
      the real site is not a review.
- [ ] `_bmad-output/implementation-artifacts/deferred-work.md` -- append **DW-238**: D8g, the deploy-and-export
      take-over, owned by Stories 7.18 and 7.26. -- the AC names it and it is unbuildable today; a deferral that is
      not written down is a deferral that is lost.
- [ ] `_bmad-output/planning-artifacts/epics.md` + `…/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` -- correct
      UX-DR13 and § Time limits from "stops" to "restarts from the last interaction", citing F-079. -- standing
      rule 3: the ruling never reached the two documents that summarise it, and three places now disagree.

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

**That fact is also why the copy is a question.** Every string on B5a, B5b and B5c names another *person* — "Rosa",
"Dai", a "DM" avatar, "Or message Rosa". None of them can happen in v1. See Question 1.

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

**Commands:**

- `pnpm check` -- expected: lint, typecheck and every package test green, including the new `apps/web/lock.test.ts`
  and the extended `journal.test.ts` and `busy.test.ts`.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, the drift guard passing (so the architecture copy was
  edited and copied, not the other way round) and the new CAS assertions among the passes.
- `python3 tools/doc-audit.py --check` -- expected: green on the second run; `deferred-work.md` and `epics.md` both
  change in this story.
- `env $(grep -E '^(SUPABASE|NEXT_PUBLIC_SUPABASE)' tools/probe/.env | xargs) python3 tools/probe/record-edit-lock.py`
  -- expected: all four facts executed against the real Supabase project, with a **control that passes** in each
  (standing rule 2) — notably a CAS on the correct generation succeeding beside the one that misses.
- `node tools/probe/run-verify-lock.cjs` -- expected: 0 FAIL on `app.inflozo.com`, two real browser contexts,
  covering every screened row of the I/O matrix.
- `node tools/probe/run-verify-editor.cjs` -- expected: no NEW failures. Steps 36 and 66b-c fail intermittently on
  untouched code (DW-222, DW-220): re-run and record both runs.

**Manual checks (if no CLI):**

- `MEASUREMENTS.md` carries a new section recording the Realtime broadcast round trip and whether it needed a
  publication or a policy — the first execution of `addendum.md:45`'s claim.
- The assertive region is a **second** element; `#editor-said` still reads `aria-live="polite"`.

## Owner's manual test

Do this on the real site after Deploy confirms the build, in a desktop browser about 1440 wide. You need **two tabs
of the same browser**, both signed in as you — that is all "two sessions" means here, and your laptop and your phone
behave the same way. Everything you type is taken back before the end.

Use **Pilot sections** — `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51`.

Steps 1–3 are the reader's bar (**B5a**). Steps 4–7 are the request and the hand-over (**B5b**). Steps 8–12 are the
no-response take-over and what the session you took it from is told (**B5c**). Step 13 is the one thing that must
*not* happen.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open it in **tab A** and click the hero's big headline. Type over it. | `Tab A was here` | The words change, and the save indicator beside the project's name turns to a grey clock — one edit is not on the server yet. |
| 2 | same | Editor, Home | Open the **same address in a second tab (tab B)** and wait for it to finish loading. | — | A bar across the top of tab B says the site is being edited somewhere else, with a **Request editing** button on the right. The page itself is perfectly readable. |
| 3 | tab B | Editor, Home | Try to click the hero's headline and type. Then look at the settings panel on the right. | `nope` | **Nothing happens** — no letters appear, and nothing jumps or flickers. The settings panel is dimmed but you can still read every setting. |
| 4 | tab B | Editor, Home | Press **Request editing**. | — | The button says it is asking, and tab B tells you it is waiting. |
| 5 | tab A | Editor, Home | Switch to tab A. | — | A small card has appeared — **not** a full-screen box. It says a request has arrived, tells you whether your work is on the server yet (it is not — you have 1 edit waiting), and offers **Hand over** and **Keep editing**, with a countdown of about 30 seconds. |
| 6 | tab A | Editor, Home | Move your mouse over the card and leave it there, without pressing anything, for a full minute. | — | The countdown keeps **starting again** rather than running out — a card you are looking at never hurries you. |
| 7 | tab A | Editor, Home | Press **Hand over**. | — | Your edit is sent first (the indicator goes green), then tab A gets the same reading-along bar tab B had. |
| 8 | tab B | Editor, Home | Switch to tab B. | — | The bar is gone. Click the headline and type — it works, and it already says **Tab A was here**, so nothing was lost. |
| 9 | tab B | Editor, Home | Type over the headline again. | `Tab B was here` | The words change and the indicator shows a grey clock. |
| 10 | tab A | Editor, Home | Switch to tab A, press **Request editing**, and then **switch away to any other tab and leave it for a minute**. | — | Do not touch tab B. |
| 11 | tab A | Editor, Home | Come back to tab A. | — | It says there was no response and names how many edits that session has not sent — **1** — and offers to take over anyway. |
| 12 | tab A | Editor, Home | Press it, read the box, then confirm. | — | A box in red asks first and says plainly that 1 edit will be lost and cannot be retrieved. **Your keyboard starts on the cancelling button**, not the red one. After you confirm, tab A is editing and the headline reads **Tab A was here** — tab B's word is gone, as the box said. |
| 13 | tab B | Editor, Home | Switch to tab B and look at it. | — | It now has the reading-along bar and a message telling you it had **1** unsent edit that was not included. Press **⌘Z** — **nothing comes back**, which is what the message promised. |

Afterwards: in the editing tab, press **⌘Z** until the headline reads what it did at the start, and check the
indicator turns green.

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_
