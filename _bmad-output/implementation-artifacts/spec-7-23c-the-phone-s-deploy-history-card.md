---
title: 'Story 7.23c — The phone''s Deploy history card (split from Story 7.23 by R-290)'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
baseline_commit: 7d97297f5b1a12efd1daa742e66b762495069755
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-23a-roll-back-and-re-activate-from-history.md', '{project-root}/_bmad-output/implementation-artifacts/spec-5-22-the-editor-s-responsive-floor.md']
---

## In plain English

After this story, opening a project on a phone shows a **Deploy history** card on the "The editor needs a bigger screen."
page: which version is live on your Ghost site and since when, and a **Roll back to v4** button for the version before it.
Tapping it opens the same small box as History on a laptop — it checks your site first, lists anything someone changed by hand
with a download, and has **Cancel** — and tapping **Roll back** there switches your site in seconds. The card then shows the
version you went back to as live, with a button to roll forward again.

No question for the owner. The phone's Roll back opens the same box as the laptop's, with the same check (FR-J9 as built, R-291),
so "one-tap" means the button sits right on the card; Design Notes says why. Nothing waits on the owner but the in-session gos
for the writes.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On a phone a project opens on D4f's Small Screen Notice (Story 5.22, R-201), never the editor. The notice offers
only **Your sites**. D4f also draws a **Deploy history** card with a one-tap Roll back, and R-118 held it back until a Roll back
existed. Story 7.23a built Roll back, so a bad ship still cannot be undone from a phone.

**Approach:**
- **D4f's card** goes above the links card under "What works here". It reads the project's History once as the notice opens,
  through the History route that already exists (GET `projects/[id]/history`). It draws the linked site's **Live** version, and
  the version before it with **Roll back to v{n}** — 7.23a's undo row (`historyRows`' `emphasis`).
- **The Roll back is 7.23a's, whole.** It opens S8e's confirm on Cancel and runs R-291's drift check first, with the same
  put-back, words and refusals. That confirm and its check move out of `DeployHistory` into one exported component, so the drawer
  and the card mount the same thing. Nothing is copied.
- **No server change.** The route's GET, its `act: 'check'` and `act: 'live'` POSTs, and `history/live` already answer
  everything the card needs.

**Frame (R-74):**
- `D4 Dashboard Sheets and Blocks.dc.html` D4f `:401-414` is the card:
  - the clock tile, "Deploy history", and "Live `v5` · today 2:14 PM";
  - the bordered row: the `v4` chip, "Aug 14 · 9:02 AM", and the 44px coral-outline **Roll back to v4**.
  - The epic's card cites `:401-413`, one line short: `:414` closes the card.
  - It sits first under "WHAT WORKS HERE" (`:400`), above the Your sites card (`:415`).
- **The confirm at 390 is extrapolated.** No frame draws it on a phone. It is S8e's confirm (`S8 Deploy.dc.html:337-345`) as 7.23a
  built it, at the width the phone leaves (its `max-w-[calc(100vw-20px)]`), with D8a's 44px touch targets.
- The states the frame does not draw are extrapolated in the card's own shape, in History's own words (R-170):
  - loading, nothing shipped, not linked, nothing live, and a failed read;
  - a refusal under the row (7.23a's per-row line).

**The epic's criteria, word for word (R-195), and how this story meets each:**
- **Given** a project opened on a phone (Story 5.22's Small Screen Notice), **when** the notice shows, **then** the project's
  deploy history with one-tap rollback is one of its rows *(Story 5.22's card: "one row today, Your sites; Stories 7.23 and 12.5
  add theirs — R-118")*.
  — The card above Your sites. Billing stays absent, Story 12.5's.
- **And** the history is reachable from a phone, because it is what the Small Screen Notice offers, and this story adds D4f's
  Deploy history card to that notice — the live version and a one-tap Roll back to the one before it — which Story 5.22 built
  without it (R-118).
  — The live line and the undo row. The Roll back is one tap away on the card, behind 7.23a's confirm (Design Notes).
- **And** *(Story 7.22's Dev, moved by R-290)* **this story adds** the phone card. — Built here.
- **And** the card matches D4f at 390 (R-290). — The first acceptance criterion.

## Boundaries & Constraints

**Always:**
- **Where and when.** The card lives only in the notice, so only on a phone (R-201's `PHONE`, asked once by `editor.tsx`'s gate).
  - It reads History once, as the notice mounts, through the same request the drawer makes. The harness's `historyRead`,
    `historyAct` and `historyCheck` seams reach it through the gate.
  - Nothing else starts: no lock, no sync, no IndexedDB. The only Ghost read is the check a Roll back sends, after the
    customer's tap.
- **What it draws** comes from one pure rule, `phoneCard(answer)` in `lib/retention.ts`, over `historyRows(answer)`, checked in
  this order:
  1. **nothing shipped** (no rows): "Nothing shipped yet" (`HISTORY_WORDS.empty`), no row;
  2. **not linked** (`linkedSiteId` null): "This project isn't linked to a site.", no row;
  3. **nothing live:** no stored `live` row of the linked site. That covers after Restore original, a Deploy only, or a live
     version no longer kept. The card says "None of your kept versions is live on your site.", no row;
  4. **live:** "Live `v{n}` · {time}", the version in mono. The time is `cardTime` (D4f's own form: "today 2:14 PM"; another day
     "Aug 14 9:02 AM"; the year once it is not this year) of the Live row's `acceptedAt`, the time History shows.
     - **the undo:** the row History marks `emphasis` — the linked site's next stored row after its Live one, another site's rows
       skipped, only as a Roll back. It gets the `v{n}` chip, `timeLabel`'s time, and **Roll back to v{n}**
       (`HISTORY_WORDS.rollBackName`: the visible label and the name).
     - No such row (a first ship, or the one before is gone): the header alone.
- **The card's shape (D4f `:401-414`), every word from `HISTORY_WORDS`:**
  - the card: surface, `line` hairline, radius 12, `shadow-sm`, 14px padding, 11px between its parts;
  - its header: the 34px `paper` tile with the Kit's `HistoryClock` at 16 in `ink-soft-aa` (D4f's hand sits at 15.5 — the Kit's
    one drawing, named as `ViewportChip` names its roundings), then "Deploy history" as an `h3` (13.5px, 600, `tabIndex={-1}`) and
    the line in 12px `ink-soft-aa` (the version in mono at 11);
  - the row: a `line` border, radius 10, 9 × 11 padding, 9px gaps. Its parts:
    - the chip as History draws it;
    - the time in 11.5px `ink-soft`, taking the free width;
    - the Kit's `coral-outline` Button at 44 high, with D4f's 14px padding, 13px 600 type, the `thumb` radius and `RollBack` at 13.
  - The row wraps, so the button drops under the chip and time where the width runs out (v10, another year's date, a 320px
    phone). There is never a sideways scroll, and the button's label never breaks.
- **Loading (R-98):** the card in its own shape — the tile, two `paper-sunk` bars and a 44px row bar — with `aria-busy` and
  History's "Loading history…" for a screen reader. Never a spinner.
- **A failed read:** "Couldn't load your deploy history. Reload this page to try again." where the lines go. Your sites still
  works.
- **The Roll back.** A tap opens the shared confirm for the undo row, exactly as History's undo opens it:
  - on Cancel (UX-DR14);
  - the check at once, with "Comparing with your live theme…" and the Roll back waiting;
  - then D3c's line, D3a's list with "Download the live theme first" (DW-391's one way), or D3b;
  - Pre-flight's dropped-settings block where Ghost will forget a setting;
  - "Rolling back…" (R-98), and Cancel and Esc waiting while the put-back is out.

  At 390 the confirm is `calc(100vw - 20px)` wide and a long drift list scrolls inside it.
- **The endings, said once (UX-DR12)** in the notice's own polite region, every sentence 7.23a's (`actSaid`):
  - **live / uploaded / gone:** the confirm closes, the sentence is said, the card reads History again, and focus goes to the
    card's heading. After a Roll back the card reads "Live v4" with **Roll back to v5**, the way forward again;
  - **refused** (Ghost's 422 with its detail in mono, `busy`, `disconnected`, 502): said under the row in its own `role="status"`
    line, as History's rows say it; focus goes back on the card's Roll back; nothing is read again;
  - **stale** (409 `live`/`elsewhere`, or a request whose fate is unknown): the card reads History again. The sentence is then
    said under the row if that version is still the undo, else in the region with focus on the heading. As in History, a lost
    answer that landed is said as live.
- **One confirm.** S8e's confirm and R-291's check leave `DeployHistory` whole, as one exported component in
  `deploy-history.tsx`. It keeps:
  - the markup and every `data-history-*` hook;
  - the check's ticket (an answer for a closed opening is dropped);
  - the put-back call, "Rolling back…" and `data-unstoppable`;
  - opening on Cancel, and focus back on whatever opened it when it closes.

  It hands its ending (the put-back's outcome, or the check's refusal) to its caller and says when a put-back is out. The drawer
  keeps its own `settle`, and its pins and Restore original wait exactly as now; the card has its own.
- **One set of History requests.** `editor.tsx`'s read, pin, act, check and restore functions, and the two Download addresses,
  become one module that both the editor and the notice use. Same bodies, same logs, same `/app` prefix rule.
- **Touch targets.** `globals.css`' coarse-pointer 44px rule (D8a) gains `[data-small-screen]` beside `[data-editor]`. The
  confirm's Cancel, Roll back and Download therefore reach 44px on a phone, as they already do on a tablet.
- **Any plan, any lock:** the card reads no plan and needs no lock (FR-J9). A desktop session holding the edit lock does not stop
  the phone's Roll back.

**Ask First:**
- **Every production write and every T1 write needs the owner's in-session go**, asked in R-83's shape, run in the main session
  and never by a subagent. Word each ask for the run's whole set of writes. That covers:
  - walk step 123;
  - Deploy's `STEP123_PLANT`;
  - the cleanup after the owner's test.

**Never:**
- A change to the History route, the put-back, the check or any table. Every answer the card needs exists (no Schema phase).
- A second copy of S8e's confirm, R-291's check or the History requests.
- A Roll back on the phone without the confirm and its check.
- More on the card than D4f draws: no pin, no Re-activate, no Restore original, no full list, no limit line.
- Billing's row (Story 12.5).
- Mounting the editor, or starting the lock, sync, IndexedDB or any Ghost read before a tap, on a phone.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| The undo | v5 live on the linked site, v4 stored | "Live v5 · today 2:14 PM"; row: `v4`, "Aug 14 · 9:02 AM", **Roll back to v4** (44px) | N/A |
| Roll back | tap → confirm on Cancel, D3c → tap Roll back | "Rolling back…"; "v4 is live on {host}." once; card re-read: Live v4, **Roll back to v5**; focus on the heading | N/A |
| Cancel | Cancel, Esc or the backdrop, the check reading or done | closes; nothing sent; focus back on the card's Roll back | N/A |
| Drift found | a hand edit on the live theme | D3a's list in the confirm, its foot, **Download the live theme first**; Roll back still allowed; the list scrolls inside at 390 | the Download's 404/401/502 said under it (DW-391) |
| Check couldn't run | no token, Ghost unreachable, the request fails | D3b's row and cause; Roll back allowed | logged by status |
| Another site between | v3 live (linked), v2 on another site, v1 (linked) | the undo is v1 | N/A |
| Live, no undo | a first ship; the one before pruned or another site's | the header alone | N/A |
| D2d above live | v3 `uploaded` (newest), v2 live, v1 | "Live v2", undo v1 | N/A |
| Nothing live | after Restore original; a Deploy only; the live version no longer kept | "None of your kept versions is live on your site.", no row | N/A |
| Not linked | versions kept, no linked site | "This project isn't linked to a site.", no row | N/A |
| Nothing shipped | no versions | "Nothing shipped yet", no row | N/A |
| Loading | the read out | the card's own skeleton, `aria-busy`, "Loading history…" (sr-only) | N/A |
| Read failed | GET not ok, or the network | "Couldn't load your deploy history. Reload this page to try again." | logged by status |
| Refused | Ghost's 422; 409 `busy` / `disconnected`; 502 | under the row (Ghost's detail in mono); focus back on Roll back; card unchanged | logged |
| Gone | 404 — pruned since the read | the confirm closes; said once; card re-read; focus on the heading | N/A |
| Stale | 409 `live`/`elsewhere`; the request's answer lost | card re-read; said under the row if still the undo, else in the region (a landed one said as live) | logged |
| Reading along, any plan | the lock held on a laptop; Free or lapsed | the Roll back works | N/A |
| Narrow | 320px phone; v10; another year's date | the row wraps the button under; no sideways scroll | N/A |
| Not a phone | a tablet or a desktop at any zoom | the editor, and History's drawer unchanged | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/components/editor/small-screen-notice.tsx` -- D4f's notice (Story 5.22):
  - `SmallScreenNotice({ name })` `:31`;
  - "What works here" `:69-82`, where the card goes above the links card `:73`;
  - the header comment's "ONE ROW, NOT THREE" `:16-18`, which this story updates (two of three).

  The links card's classes (`rounded border border-line bg-surface shadow-sm`, the 34px `paper` tile, `ink-soft-aa` icon) are
  the card's own.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - the gate `Editor` `:803-808`, which hands the notice `name` alone today;
  - its doc comment `:790-802` and the THE FLOOR paragraph `:264-274` ("no live read ever starts there");
  - the harness seams `historyRead`/`historyPin`/`historyAct`/`historyCheck`/`historyRestore` `:578-591`;
  - the History requests `:2604-2653` (`historyUrl`, `readHistory`, `pinHistory`, `actHistory`, `checkHistory`,
    `restoreHistory`), and `landed` `:2640-2645`, which stays the editor's;
  - the drawer's mount `:7052-7074` (`liveHref`, `originalHref`);
  - imports `isApp` `:96`, `historyPath` `:55`, `historyLiveDownloadPath` `:106`.
- `apps/web/components/editor/deploy-history.tsx` -- 7.22/7.23a/7.23b's drawer. What moves out:
  - the state `asking`/`opens`/`checked`/`checking`/`acting` `:132-146` and `reading`;
  - the confirm's open effect `:185-187`, `cancelConfirm` `:191-194`, `putBack` `:198-205`, `checkFirst` `:209-217`;
  - the confirm's markup `:649-761`.

  What stays: `settle` `:221-253` (the drawer's endings), the Roll back press in `action` `:363-371`, `restoreBack` `:257-285`
  (uses `acting`), `toggle` `:287` (waits on `acting`), and the drawer's `onCancel`/`onKeyDown` `:582-595` (read `acting`).
  `chip` `:310-314` is the version chip the card's row draws.
- `apps/web/lib/retention.ts`:
  - `historyRows` `:267-292` (`emphasis` `:287-291`), `timeLabel`/`dateHalf` `:305-322` (the clock half to share with `cardTime`);
  - `HISTORY_WORDS` `:338-454` (`empty`, `loading`, `rollBackName`, `said`, `refused`);
  - `actSaid` `:483-498`, `actOutcomeOf`, `checkOutcomeOf`;
  - `versionLabel`/`versionNumber` from `lib/deploy.ts`.
- `apps/web/lib/renders.ts:111` `useSaid` -- the one polite region's hook.
- `apps/web/lib/floor.ts` -- `PHONE`, `isPhone` (R-201); unchanged.
- `apps/web/app/globals.css:393-404` -- the coarse 44px rule, scoped `:where([data-editor])`.
- `apps/web/components/kit/`:
  - `button.tsx`: `coral-outline` `:39` and size `44` `:52` (`h-11 px-5 text-ui rounded`; the card overrides padding, type and
    radius to D4f's);
  - `icons.tsx`: `HistoryClock` `:418`, `RollBack` `:433`;
  - `dialog.tsx`: `openOnCancel`, `closeOnBackdrop`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/history/route.ts` -- GET and POST `{ deploy, act: 'live' | 'check' }`, read
  only for this story. `lib/editor.ts:339` `historyPath`; `lib/drift.ts:269` `historyLiveDownloadPath`.
- Harness:
  - `app/(app)/app/harness/editor/layout.tsx` mounts `Editor` with every history seam `:379`; the header docs are `:167-189`;
  - `actions.ts`' `harnessHistory` `:166`, whose values the card's states reuse: `rollback` (v5 live, v4 undo), `free`, `empty`
    (no header), `fail`, `original-restored` (nothing live), `elsewhere`, `uploaded`, and `refused`/`busy`/`disconnected`/
    `rollback-gone` for `harnessAct`;
  - `harnessCheck` `:269` answers by `x-inflozo-harness-check`.
- Tests:
  - `tools/keyboard/floor.spec.mjs`: `device()` `:23`, `watchMount` `:29`; 5.22's phone test `:76-120`, whose `:88`/`:95`
    expect Deploy history ABSENT; 7.23a's floor `:1117`;
  - `tools/keyboard/journey.spec.mjs`: 7.23a's journeys `:11302-11910`; the pointer-free sentinel `:165`;
  - `tools/probe/run-verify-editor.cjs`: step 97 `:7432-7476` (the phone on production), whose check `:7462` expects Deploy
    history ABSENT; step 121/`STEP121_PLANT` `:447-465` and step 122 (the patterns); the header's plant list `:9-18`; the last step
    is 122.
- **Ghost:** nothing new is claimed. The put-back, the check and their T1 facts are 7.23a's (§91, VERIFY 61, VERIFY 76).

## Tasks & Acceptance

**Dev gate:** nothing waits on the owner but the in-session gos for the writes.

**Execution:**

*The rule:*
- [x] `apps/web/lib/retention.ts`:
  - `phoneCard(answer)` → `{ kind: 'empty' } | { kind: 'unlinked' } | { kind: 'notLive' } | { kind: 'live'; live: HistoryRow; undo:
    HistoryRow | null }`, over `historyRows`, in Always' order;
  - `cardTime(at, now, tz?)`, sharing `timeLabel`'s clock half;
  - `HISTORY_WORDS` gains:
    - D4f's "Deploy history" (`:405`) and "Live" (`:406`);
    - "This project isn't linked to a site.";
    - "None of your kept versions is live on your site.";
    - "Couldn't load your deploy history. Reload this page to try again.";

    each reused where one already says it (R-170).

*The requests and the confirm:*
- [x] `apps/web/components/editor/history-requests.ts` (new) -- `historyRequests({ projectId, prefix, seams })` →
  `read`/`pin`/`act`/`check`/`restore` and `liveHref`/`originalHref`. It holds `editor.tsx`'s bodies, moved, with their logs.
  `editor.tsx` uses it; `landed` stays the editor's.
- [x] `apps/web/components/editor/deploy-history.tsx` -- export the confirm as Always' "One confirm" states. `DeployHistory`
  mounts it nested as today, and its header comment names the move. No drawer behaviour changes.

*The card:*
- [x] `apps/web/components/editor/small-screen-notice.tsx`:
  - `SmallScreenNotice({ name, history })` draws the Deploy history card above the links card: states, shape, Roll back and
    endings as Always states, with one polite region;
  - the header comment: two rows of D4f's three now, Billing Story 12.5's.
- [x] `editor.tsx` -- the gate hands the notice `historyRequests(...)` built from `project.id`, the pathname's prefix and the
  props' seams. Update the floor paragraph and the gate's comment: no Ghost read before a tap.
- [x] `apps/web/app/globals.css` -- the 44px rule's scope becomes `:where([data-editor], [data-small-screen])`, with its
  comment.

*Harness:*
- [x] `app/(app)/app/harness/editor/actions.ts` and `layout.tsx` -- `x-inflozo-harness-history` gains:
  - `first`: v1 live alone;
  - `unlinked`: two versions, `linkedSiteId` null.

  Document both in the header's doc.

*Tests* (each assertion seen red under a planted reversion):
- [x] `apps/web/lib/retention.test.ts`:
  - `phoneCard` for every state row of the matrix: another site between, D2d above live, a pruned live, a first ship, not
    linked, empty;
  - `cardTime` (today, another day, another year, a time zone).
- [x] `tools/keyboard/journey.spec.mjs` -- 7.23c, on the iPhone 13 descriptor, keyboard only (below the sentinel, pointer-free):
  - (a) the card's anatomy and words. The Tab order runs back link → **Roll back to v5** → Your sites. Enter opens the confirm on
    Cancel, the check says "Comparing…" then D3c. Esc puts focus back on the card's Roll back;
  - (b) Roll back confirmed: "Rolling back…" with `aria-busy`, Esc doing nothing while it is out, said once, the card read again
    (switch the header the way 7.23a's `rollback-gone` is used), focus on the heading;
  - (c) refused: Ghost's 422 with its detail, `busy`, `disconnected` — under the row, focus back on Roll back;
  - (d) gone; (e) the request fails; (f) D3a found, with the Download reachable by Tab.
- [x] `tools/keyboard/floor.spec.mjs`:
  - re-expect 5.22's phone test: the card present (no header: "Nothing shipped yet"), Billing absent, still one link row in the
    section;
  - add 7.23c at 390 (iPhone 13) and at 320 × 568 (a touch phone):
    - the card's geometry against D4f `:401-414` (padding, radius, tile, the 44px button, the row's gaps), and each state's shape
      (`rollback`, `first`, `original-restored`, `unlinked`, `empty`, `fail`, loading held);
    - a tap on Roll back opening the confirm within the viewport, with `found` scrolling inside;
    - every target in the notice and its open confirm at least 44px;
    - no sideways scroll;
    - no lock or sync request.
- [x] `tools/probe/run-verify-editor.cjs`:
  - re-expect step 97: the card present in A's project's state, Billing absent, Your sites one 56px row;
  - add step 123 and `STEP123_PLANT`: the Verification's run, under `T1_WRITES=1`, written at Dev and never run there.

*Propagation* (standing rules 3 and 7; end with a grep for "Deploy history and Billing", "ONE ROW" and "7.23c"):
- [x] Planning documents:
  - FR-J9: a dated note, the phone card as built;
  - `EXPERIENCE.md`: the Small Screen Notice paragraph `:70-73` and its IA row `:138`, a dated note;
  - Story 5.22's card in `epics.md` stays as dated.

**Acceptance Criteria:**
- **Matches the frame.** Given the notice at 390 on an iPhone 13 with v5 live and v4 kept, when it has read History, then the
  card matches D4f `:401-414`:
  - its place, above Your sites;
  - its tile, title and line;
  - its row, with the 44px coral-outline **Roll back to v4**.

  The extrapolated states keep the card's shape.
- **The phone's Roll back, really.** Given "Phone test" with v1 and v2 shipped live to T1, on a phone on production, when Roll back
  to v1 is tapped and confirmed after the check:
  - T1's active theme files equal v1's `content_manifest`;
  - v1's own row is updated, with no row added;
  - the card reads Live v1 with **Roll back to v2**.
- **The check runs on the phone.** Given a hand edit on T1's live theme, when the phone's Roll back opens the confirm, then D3a
  names the file, its Download serves a zip equal to T1's live theme with the page staying, and the Roll back still completes.
- **The drawer is unchanged.** Given the editor at 1440, when `pnpm keyboard` runs, then 7.23a's and 7.23b's journeys and floor
  pass with no edit to their expectations.
- **A phone starts nothing else.** Given the notice, when it has read History and no Roll back was tapped, then there is no lock
  or sync request, no `edit_locks` row and no `inflozo-*` database.

### Review Findings

*Story 7.23c's Review (2026-11-26): five layers — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier — then walk steps 97 and 123 on production and T1 (Verification). No question for the owner; nothing deferred.*

- [x] [Review][Patch] Deploy's plant would always fail: `STEP123_PLANT` read History after `leave123` had put the page on
  about:blank, where the route's fetch is cross-origin with no session — so the plant's own check threw and its account was
  deleted. The page goes back to the app first [`tools/probe/run-verify-editor.cjs` step 123's plant]
- [x] [Review][Patch] History's real requests ran in no test: every journey reaches `history-requests.ts` through the harness's seams,
  and `deploy.test.ts` matched the restore's text only, so a put-back sent as `act: 'check'` (or the reverse) passed every gate.
  `history-requests.test.ts` calls each request against a stubbed `fetch` and reads back its method, address and body; seen red with
  `live` and `check` swapped, green restored byte for byte [`apps/web/history-requests.test.ts`; `frame-guard.test.ts`' "only test"
  comment]
- [x] [Review][Patch] Walk 123 emptied the card's polite region by hand (`replaceChildren`), the pattern that crashed the editor at
  7.3: the words already said are now marked and an ending is a new span with words [`run-verify-editor.cjs` `phoneBack123`,
  `ended123`, `card123`]
- [x] [Review][Patch] The card and the confirm read their times against the moment they mounted: a phone left open past midnight
  would label the version a Roll back just made live with yesterday's date. The card takes a fresh clock with each read, the confirm
  with each opening [`small-screen-notice.tsx`; `deploy-history.tsx` `RollBackConfirm`]
- [x] [Review][Patch] The refusal under the card's row was the drawer's markup copied: one `RowNote` in `deploy-history.tsx` now draws
  both, and the card's row is `relative` as the drawer's is, so the empty note sits in it [`deploy-history.tsx`;
  `small-screen-notice.tsx`]
- [x] [Review][Patch] Walk 97's re-expected check named the Roll back for a live card but never its "Live v{n} · …" line
  [`run-verify-editor.cjs` step 97]
- [x] [Review][Patch] Step 123's header and its NOT RUN note said "five Roll backs" (there are four put-backs: (d) is cancelled and (f)
  refused at the check) — worded without a count; the step's scrub lacked the Supabase key [`run-verify-editor.cjs`]
- [x] [Review][Patch] Stale words: the harness's "two more states" over a list of four (`actions.ts`); a 7.23b journey comment naming
  `restoreHistory`, gone into `historyRequests` (`journey.spec.mjs`); Epic 5's context "reading History once" (it reads again after a
  Roll back); this spec's Verification expecting journeys (a)–(f) where (g) exists

Dismissed after reading the code: the confirm's put-back no longer waiting on a drawer pin (the row's Roll back is `aria-disabled`
while a pin is out and the confirm is modal, so it cannot open then); the close event racing the stale ending's focus (`close()` queues
its event before the re-read's request is sent); the check moved into an effect (the floor's one-request count is green in the gate);
a tap during a re-read (the server answers a stale row, and the card reads again); "one-tap" meaning the button on the card (R-291
puts every Roll back behind its check — Design Notes); the forward Roll back's label (7.23a's word, R-170); no retry on a failed read,
no Re-activate, no dangling time (the spec's own states; `accepted_at` is a database timestamp); the notice's height (its body
scrolls); the seams' type (checked structurally where `Editor` passes its props); the coral literal and the 15.5 clock note (the
frame's own values); the plain `<button>` (Change Log 5); the refusal heard as status and description (History's own pattern);
`clockHalf`'s order (nothing calls `timeLabel` at load); a 200 with no rows (the route's contract).

## Spec Change Log

**Dev (2026-11-26).** Each entry is outside the frozen block and was made where the build met a fact the plan did not hold.

1. **Journey (a)'s Tab order reads "Roll back to v4", not "Roll back to v5".** Under the harness's `rollback` the card is Live v5 with
   the undo v4 — the matrix's own first row and the first acceptance criterion. "Roll back to v5" is the button AFTER the Roll back
   (journey (b)'s re-read, the matrix's second row), so (a) asserts v4 and (b) asserts v5.
2. **The harness gains a third value, `rolled-back`** (Tasks named `first` and `unlinked`): `rollback` after its Roll back to v4
   landed — v4 live and accepted newest, v5 the next row and the undo. Journey (b) switches to it while the put-back is held, as
   7.23a's `rollback-gone` is used, so the re-read proves the matrix's "Live v4, **Roll back to v5**" rather than only that a read
   happened; journey (e) uses it for "a lost answer that landed is said as live". `harnessAct` answers it `live`. Documented in
   `actions.ts` and `layout.tsx`.
3. **The confirm keeps a `backTo` for its focus.** Chromium restores focus to the opener when a modal `<dialog>` closes, so a
   planted reversion of `backTo` stays green in every journey; it is kept for a tap that does not focus the button it lands on
   (iOS Safari), where the platform has nothing to restore. The owner's manual test on a real phone is its check.
4. **The undo row's time is `grow`, not `flex-1`.** Tailwind's `flex-1` is a zero basis, so the row never wrapped at 320 and the time
   broke instead; `grow` keeps the max-content basis, so the button drops under the chip and the time (the floor's 320 stop held it
   red first).
5. **The card's button is the Kit's `coral-outline` variant and `ring` at D4f's own 44**, not `<Button size={44}>` with overrides:
   `button.tsx` says a class passed to `Button` cannot reliably outrank its size (both are utilities; the stylesheet's order
   decides), so the size is written once, on the card, from `variants['coral-outline']`.
6. **The main session's matrix audit (Dev, 2026-11-26) added four checks and fixed one walk read**, each new check seen red under a
   planted reversion and green restored:
   - **journey (g)**, the matrix's *Stale* row for a 409: under `elsewhere` (Live v3, another site's v2 skipped, the undo v1) the
     put-back answers `elsewhere`, the card reads History again once, and v1 still the undo puts the sentence under the row with focus
     back on the Roll back. No journey held the 409 half of the stale branch: (e) holds only the lost answer;
   - **the floor's backdrop**, the *Cancel* row's third way: tapped while the check reads, the confirm closes and the check is the only
     request for v4 — nothing sent, nothing said, the card unchanged;
   - **the harness's `long`** (v11 live, the undo v10) **and a narrow stop** with the page's clock in February 2027: the *Narrow* row's
     v10 and another year's date wrap the button under the chip and the time at 390 and at 320, its label whole, nothing sideways;
   - **the floor's D4f stop holds the page's clock in November 2026.** The harness's versions are dated that month, and D4f's row is one
     line at 390 with a date of this year. From 1 January 2027 every harness date carries its year and the 390 row wraps by design, so
     the stop would have gone red on New Year's Day: seen red with the clock moved to 2027;
   - **walk steps 97 and 123 read the card's Roll back name from its text.** The button carries no `aria-label` (its visible label is its
     name, `rollBackName`), so the first draft's `getAttribute('aria-label')` was always null and every check comparing it would have
     failed at the Review on T1.

## Design Notes

**Why the phone's Roll back opens the confirm and runs the check — a routine call, not a question.** "One-tap" (R-76, D4f's
prompt) and "one click" (FR-J9) have always meant that the action is one button away, with S8e's confirm. The design drew that
confirm for the same Roll back, FR-J9 as built puts Roll back "behind S8e's confirm", and EXPERIENCE says "the roll-back confirm
stays exactly as drawn". R-291 made a Roll back check the site first, because without the check a hand edit made in Ghost Admin
is replaced with no warning and no copy. That holds on a phone just as on a laptop, and a phone is where taps land by accident.
A direct one-tap rollback would undo R-291 on one device.

**Why the card reads the History route, not new server props.** R-201 decides "phone" in the browser, as the project opens. The
server cannot know, so it draws the skeleton for every device. The History GET is the one source of what is kept and live; it
needs no lock and no plan, and it reads no Ghost. A second read path would be a second rule for "which version is live".

**The confirm moves; it is not copied.** Its 110 lines carry R-291's ticket, S8c's "once it starts, it finishes", UX-DR14's
focus and the DW-391 Download. Two copies would drift at the next ruling. The drawer keeps everything that is the drawer's:
- its `settle`, which focuses ✕ and re-reads the list;
- its pins and Restore original, which wait while a put-back is out;
- `data-unstoppable` on the drawer for R-192's sweep.

The card's endings differ only in where focus lands: the card's heading, since a phone has no ✕.

**The undo is History's own `emphasis` row.** No second rule for "the one before it". After a Roll back the version left behind
becomes the next row (7.23a orders by `accepted_at`), so the card's button turns into the way forward, as History's coral-outline
undo does.

**Two time forms in one card are the frame's.** D4f writes the live line "today 2:14 PM" and the row "Aug 14 · 9:02 AM"
(`timeLabel`'s, History's own). `cardTime` gives the first and shares the clock half with `timeLabel`.

## Owner's manual test

**Before you start:** Deploy planted one new Free test account on your go (2026-11-27, about 7:24 AM your time), connected to T1
(`ghost6.inflozo.com`): `umngkmr+phone723c@gmail.com`, project **"Phone test"**.
- v1 and then v2 were shipped live. The home page headline reads "Version 1" or "Version 2" to match; it reads "Version 2" now.
- One small invisible change was then made to v2's Home template on T1, as if someone had edited the theme in Ghost Admin. Your
  first Roll back finds it.

You need a **phone**, held upright. On the phone:
- sign in at `https://app.inflozo.com/sign-in` with that address;
- open the link that arrives, on the phone too;
- keep a second tab on `https://ghost6.inflozo.com`.

1. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` on the phone. **Screen:** "The editor needs a bigger
   screen." **Do:** scroll down to "WHAT WORKS HERE". **Type:** nothing. **See:**
   - first, a white card: a clock icon, **Deploy history**, and "Live **v2** · today 7:24 AM" (on a later day, "Nov 27 7:24 AM");
   - inside it, a box with `v1`, "Today · 7:24 AM" (on a later day, "Nov 27 · 7:24 AM"), and an orange-outlined **Roll back to
     v1** button;
   - under the card, **Your sites** as before;
   - no sideways scrolling.
2. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` (the same page). **Do:** tap **Roll back to v1**. **See:**
   - a box titled "Roll back to v1?" with "Your live site switches to v1 instantly. v2 stays in history — nothing is lost.";
   - "Comparing with your live theme…" for about a second;
   - then a warning listing **one file that changed on your site**, named **Home**, a line saying Rolling back replaces it, a **Download the live
     theme first** button, and **Cancel** and **Roll back** at the bottom.
3. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` (the same page), the box open. **Do:** tap **Download the live theme first**. **See:** a zip downloads (your phone may
   ask where to keep it), and the box stays open.
4. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` (the same page). **Do:** tap **Cancel**. **See:** the box closes and the card is unchanged. Reload
   ghost6.inflozo.com: it still reads "Version 2".
5. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` (the same page). **Do:** tap **Roll back to v1**, wait for the check, then tap **Roll back**. **See:**
   - the button says "Rolling back…";
   - then the box closes, and the card reads "Live **v1** · today" with a box for `v2` and **Roll back to v2**;
   - reload ghost6.inflozo.com: it reads "Version 1".
6. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` (the same page). **Do:** tap **Roll back to v2**. **See:** this time a green line, "Nothing changed on your site since
   v1". **Do:** tap **Roll back**. **See:** the card reads "Live **v2**" with **Roll back to v1**, and ghost6.inflozo.com reads
   "Version 2".
7. **URL:** `https://app.inflozo.com/projects/6b386937-ba70-4aea-88a3-2f306ff43d55` on a **laptop**, window at least 1366 px wide, signed in with the same address.
   **Do:** press the clock icon left of **Ship it**, then **Roll back** on v1. **See:** History as before (v2 with the green
   **Live** dot), and the same box as on the phone. **Do:** press **Cancel**.

**After the test:** say "passed", or list what you saw. On your go, Claude then puts T1 back on Casper and removes the test theme
from T1.

## Verification

**Commands:**
- `pnpm check` -- expected: green. That is lint, typecheck and every package test, among them `retention.test.ts`,
  `history-requests.test.ts` (the Review's) and `busy.test.ts`. The run prints its own counts; never write one down.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `pnpm keyboard` -- expected: journeys 7.23c (a)–(g), 7.23a's and 7.23b's unchanged, 5.22's phone floor re-expected and 7.23c's
  floor at 390 and 320 all green.
- `grep -rn "Deploy history and Billing\|ONE ROW, NOT THREE" apps/web tools` -- expected: nothing stale.

**Real infrastructure** (R-82; each on the owner's in-session go, in the main session, from a clean worktree at the deployed sha):
- **Walk step 97, re-expected,** on production: the phone's notice with the card in A's project's state.
- **Walk step 123, on production and T1,** with a throwaway Free account and an iPhone 13 context (coarse pointer, 390 × 844):
  - connect T1 through the wizard and ship v1 then v2 ("Version n" on Home);
  - (a) the phone opens the project: `PHONE` true, no editor, no lock or sync call, and the card reads Live v2 and Roll back to v1
    at D4f's geometry, with no sideways scroll;
  - (b) tap Roll back to v1: the confirm on Cancel and the check's D3c "since v2". Confirm it:
    - T1's active theme downloaded with the staff token equals v1's `content_manifest`;
    - v1's row is updated and the row count is unchanged;
    - the card reads Live v1 and Roll back to v2;
  - (c) a hand edit uploaded on T1 under the frozen name with the Admin API key. The phone's Roll back finds it (D3a names the
    file), and the Download is followed to a zip equal to T1's live theme with the page staying. Confirmed, v2 is live. The
    control: the next Roll back checks clean;
  - (d) Cancel sends nothing: no `act: 'live'` POST, and T1 unchanged;
  - (e) a desktop session holding the lock, and the phone's Roll back still landing;
  - (f) the site disconnected: the check's 409 said under the row; reconnected after;
  - finally: T1 back on its own theme, the frozen theme deleted, the account deleted, users and projects counted back.

  **Ghost 5's half** (T3, R-238) is postponed to DW-326's pass at Story 15.7.
- **`STEP123_PLANT=<address>`** (Deploy): (a)'s ships and (c)'s invisible hand edit on v2, live. It stops there, for the owner's
  test above.
- **Vercel:** the deployment is READY from the Dev head.
- **The owner's test above (R-80).**

**Executed — Deploy (2026-11-27, Node 24; keys by their variable names, read in-process, no value printed; the production and T1
writes on the owner's in-session go, "1. Go", up to 3 runs, run in the main session):**
- **Deployment: `dpl_GxvLaPGUUb4qXR9vLaXGZ9CqL9sQ`** (`inflozo-apqmjun2v-umangkagathara.vercel.app`), READY, target production,
  built from `0eb7c4c5` (the Review's commit, which carries the Review's app changes — `RowNote` and the fresh clocks), aliased to
  `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`, `v6/deployments` and
  `v13/deployments/{id}`); `https://app.inflozo.com/sign-in` and `https://inflozo.com/` answer 200. Before it, production was the Dev
  head's `dpl_J2hEDi5XAsoArDCM82TqEMoTsp3m`.
- **CI on `0eb7c4c5`** (`GITHUB_TOKEN`, read only): run 45874560904 — `rls`, `check` (the whole keyboard gate among it) and `deploy`
  success; the Render matrix (45874560572) success.
- **Schema: none.** The story changes no table and has no Schema phase (R-99); `git diff --stat 7d97297f 0eb7c4c5 -- supabase` is
  empty, so there is no migration to apply and no RLS gate to re-run (CI's `rls` is green on the commit above).
- **Before the plant, read only:** T1's themes with `GHOST6_STAFF_ACCESS_TOKEN` (`GET themes/`, 200): `casper*`, `racer`, `source`,
  `inflozo-ghost6`, no test theme (7.23b's plant was cleared); the plant address not among production's 25 users
  (`SUPABASE_SECRET_KEY`, the Auth Admin list).
- **The owner's test plant** — walk step 123's `STEP123_PLANT=umngkmr+phone723c@gmail.com` with `T1_WRITES=1`, as a cut copy (steps
  1–5, then 123, then the walk's `finally`) from a clean detached worktree at the deployed `0eb7c4c5` (`tools/probe/.env` linked in,
  never copied), the launcher reading `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_POOLER_URL`, `VERCEL_TOKEN` and
  `VERCEL_TEAM_ID` in-process and the step its own `GHOST6_*` keys. **Run 1 of 3: 0 FAIL, 44 PASS**, first time (one `stall` note,
  step 5's 30 s GET of the project page retried once); the walk confirmed Vercel serving its HEAD before it started:
  - T1 on `casper` at the start, `routes.yaml` read; T1 connected through the wizard; **"Phone test"**
    (`6b386937-ba70-4aea-88a3-2f306ff43d55`) v1 then v2 shipped (Deploy & activate), `/` "Version 1" then "Version 2", v2 live under
    `inflozo-phone-test`;
  - v2's files with an invisible hand edit (a Handlebars comment) to `home.hbs` uploaded under `inflozo-phone-test` with the Admin API
    key, active at once (R-264); T1's download differing from v2 by that file alone (R-291); `/` still "Version 2"; the History route
    Live v2 with the undo v1, the card's rule `live`. The owner's first Roll back to v1 names "Home" in D3a's block;
  - the step-1 throwaways deleted; users 25 → 26 and projects 18 → 19 (one each kept by the plant); zero CSP violations.
- **Read back afterwards, GET only** (`GHOST6_STAFF_ACCESS_TOKEN`, `SUPABASE_SECRET_KEY`): T1's themes `casper`, `racer`, `source`,
  `inflozo-ghost6`, `inflozo-phone-test*`, its `/` 200 reading "Version 2"; the account on `free`; Phone test linked to a connected
  `https://ghost6.inflozo.com` (`disconnected_at` null); deploys 1.0.0 `uploaded` and 2.0.0 `live`, both `inflozo-phone-test`.

**Executed — Review, the main session (2026-11-26, Node 24; every key read inside the process from `tools/probe/.env` by its variable
name, never on argv, no value printed; the owner's in-session go for walk steps 97 and 123, "1. Go", up to three runs each):**
- **CI on the Dev head `f3bb27e1`** (`GITHUB_TOKEN`): run 45863606017 — `rls`, `check` (the whole `pnpm keyboard` gate with it) and
  `deploy` success; the Render matrix success. **Vercel** (`VERCEL_TOKEN`): `dpl_J2hEDi5XAsoArDCM82TqEMoTsp3m` READY from `f3bb27e1`,
  aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com`. Control: before it, production was `dpl_C4gx…` at the Create.
- **The Real-infra verifier (read-only):**
  - **R-99 holds with nothing to apply:** no file under `supabase/` and none under the History route changed. Production, read through
    `SUPABASE_DB_POOLER_URL` in `BEGIN READ ONLY` transactions: every column the route and the put-back read or write on `projects`,
    `deploys`, `site_snapshots`, `sites` and `deploy_jobs` answers a `LIMIT 0` select; `deploy_status` carries `uploaded` and `live`;
    `pin_version(uuid,uuid,integer)` exists. Controls: a column that does not exist, `42703`; a function that does not, no row.
  - **The route signed out** on production: the card's GET **401** "Not signed in", a POST `act: 'check'` **401**, `history/live` 303
    to `/sign-in`, the project page 307; `/harness/editor` **404** — production has no harness, so the card reads the real route.
  - **The deployed script carries the card's sentences:** "None of your kept versions is live on your site.", "Couldn't load your
    deploy history…" and "This project isn't linked to a site." in the chunk that holds "The editor needs a bigger screen." on
    `f3bb27e1`; all three absent on `7d97297f` (the control), and a sentence the app never says in no chunk on either.
  - T1's themes (staff token): `casper` active, `racer`, `source`, `inflozo-ghost6`. Control: the same read with no token, 403.
- **Walk step 97, re-expected — on the Dev head's deployment** (a cut of steps 1–5 and 97 from a clean worktree at `f3bb27e1`, the
  review's patched walk in its `tools/probe-debug/`): **0 FAIL, 49 PASS.** The iPhone 13 opens A's "Pilot sections" on D4f's notice,
  no editor and no canvas; the card first under What works here and above the one 56px Your sites row, in A's state as the route
  answers A's own session ("Nothing shipped yet", `empty`); Billing absent; no lock or sync request and no `edit_locks` row after 5s;
  nothing sideways; zero CSP violations; users 25 → 25, projects 18 → 18.
- **Walk step 123 — on the same deployment and T1, run 1:** **0 FAIL, 58 PASS**, first time:
  - T1 on `casper` at the start (`routes.yaml` read); N connected T1 through the wizard; v1 then v2 shipped, `/` "Version 1" then
    "Version 2", v2 live under `inflozo-phone-test`; the route answering v2 Live and v1 the undo;
  - (a) the phone a phone by `PHONE`, no editor, no canvas, no lock or sync request, no `edit_locks` row, no `inflozo-` database; the
    card "Live v2 · today 10:58 PM" with "Roll back to v1" at D4f's geometry (14 padding, radius 12, 11 gap, the 34 tile, the row
    9 × 11 at radius 10 with a 9 gap, the button 44 high, 14 across, 13px 600, radius 10), above Your sites, nothing sideways;
  - (b) the confirm "Roll back to v1?" on Cancel; the check REAL on T1: D3c "Nothing changed on your site since v2"; confirmed: "v1 is
    live on ghost6.inflozo.com." said once, focus on the heading, the card "Live v1" with "Roll back to v2"; T1's download at **zero**
    differences from v1's `content_manifest`, `/` "Version 1"; v1's own row live with the newest `accepted_at`, rows 2 → 2;
  - (c) a hand edit to `home.hbs` uploaded with the Admin API key, live; the phone's check FINDS it — D3a naming "Home" with
    "Download the live theme first", which downloaded `inflozo-phone-test-live.zip` equal to T1's live manifest with the page and
    the confirm staying; the Roll back still went — v2 live at zero differences, the edit replaced; the control: the next Roll back
    checked clean "since v2" and went;
  - (d) Cancel after the check: the check the only POST, T1 unchanged, the card unchanged, focus back on the Roll back;
  - (e) N's 1440 editor holding the lock, the phone's Roll back to v2 landed ("Version 2");
  - (f) the site stamped disconnected: the check's 409 said under the row — "Reconnect ghost6.inflozo.com in Sites to roll back." —
    focus back on the Roll back, nothing in the region, nothing sent to Ghost; the stamp cleared and read back;
  - finally: T1 `casper*` with `racer`, `source` and `inflozo-ghost6`, the run's theme deleted, `routes.yaml` 130 → 130 bytes; N's
    objects 0, T1 disconnected, N deleted; users 27 → 27, projects 20 → 20 inside the step and 25 → 25, 18 → 18 for the run; zero CSP
    violations. The plant's path (Deploy's) is not this run's: its read-from-about:blank fix is a page load before the read.
- **The review's patches, locally:** `pnpm check` exit 0 — every package 0 failing, each printing its own count, the web package's run
  among them `history-requests.test.ts` (seen red with `live` and `check` swapped in `history-requests.ts`, green restored byte for
  byte). `pnpm keyboard`, whole (42.4 min): 383 passed, 5 failed — all five at `open()` waiting for the editor's first layer row
  (5 s) in one burst under the machine's load (5.19's ⌘D and Hand-picked, the pill, FR-D21's page 2, DW-257), none touching History
  or the notice; the five re-run alone, 5 of 5 green. Every 7.23c journey and floor, and 7.22's, 7.23a's and 7.23b's, green in the
  whole run. `node --check tools/probe/run-verify-editor.cjs` clean. CI runs the whole gate again on the Review push.
- **The Review's app changes run on the deployed site from the Review's push on** (`RowNote`, the fresh clocks): the walk ran on the Dev
  head's deployment with the Review's walk; Deploy's `STEP123_PLANT` and the owner's test are on the Review's deployment.

**Executed — Dev, the main session (2026-11-26, Node 24; every key read inside the script from `tools/probe/.env` by its variable
name, never on argv, no value printed):**
- **T1 `ghost6.inflozo.com`** (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`), read-only, `GET themes/` with the staff token: **200**,
  `casper` active, with `racer`, `source` and `inflozo-ghost6` installed and inactive — T1 is on its own theme, so step 123 can start
  from it. Nothing was written to T1.
- **Not hit in Dev:** production (Supabase, the app), Resend and Dodo. This story changes no table, sends no email and reads no plan; the
  card's one read and its Roll back are the History route, unchanged, whose real answers are walk steps 97 and 123's. Both are written
  and have never run: they are the Review's, from a clean worktree at the deployed sha, step 123 and `STEP123_PLANT` on the owner's
  in-session go (`T1_WRITES=1`). Vercel's READY from the Dev head is read after the push (the Review reads CI on the Dev head first).
- **The matrix audit** (each row to a check that ran in that row's state):
  - *The undo*, *Live, no undo*, *Nothing live*, *Not linked*, *Nothing shipped*, *Read failed*, *Loading*: the floor's D4f stop at
    390 and 320 (`rollback`, `first`, `original-restored`, `unlinked`, `empty`, `fail`, the read held), with `phoneCard`'s unit tests;
    *Another site between* and *D2d above live*: `retention.test.ts`, and journey (g) draws the first on the phone;
  - *Roll back*: journey (b); *Cancel*: journey (a) (Esc and Cancel, the check done), the floor's tap of Cancel and its backdrop while
    the check reads (added), and 7.23a (q) for Cancel and Esc while the shared confirm's check reads;
  - *Drift found*: journey (f) and the floor's `found` scrolling inside at 320; its Download's 404/401/502 is the shared
    `SignedDownload`, held by 7.23b (e1)–(e4); *Check couldn't run*: the shared confirm's D3b, held by 7.23a (o) — the card has no code
    of its own there;
  - *Refused*: journey (c) (Ghost's 422 with its detail, `busy`, `disconnected`); a 502 with a code takes the same branch as `busy`
    (`actOutcomeOf`); *Gone*: journey (d); *Stale*: journey (e) for the lost answer, landed or not, and (g) for the 409 (added);
  - *Reading along, any plan*: the card reads no lock and no plan (the floor: no lock or sync request), and the put-back reads neither
    (7.23a's `put-back.test.ts`); the real lock held on a laptop is walk step 123 (e);
  - *Narrow*: the floor's 320 stop wraps the v4 row, and the narrow stop (added) wraps v10 with another year's date at 390 and 320;
    *Not a phone*: 7.22's, 7.23a's and 7.23b's journeys and floors at 1440, 1280 and 820, unedited.
  - **Matches the frame:** the floor measures D4f `:401-414` at 390 — the card's 14 padding, 12 radius and 11 gap, the 34 `paper` tile
    with the clock at 16, the 13.5/600 `h3`, the 12px line with the version in mono 11, the row's 9 × 11 padding, 10 radius and 9 gap,
    the 44px coral-outline button 14 across in 13px 600 with the glyph at 13, its place above Your sites, and D4f's one line.
- **Each check the audit added seen red under a planted reversion**, then restored byte for byte (sha256): the stale branch without
  `live`/`elsewhere` (journey (g): the re-read count 2, wanted 3); the confirm's backdrop test removed (the floor at 390 and 320: still
  open); the confirm's close sending a put-back (the floor: 2 and 3 requests for v4, wanted 1); the undo row without `flex-wrap` (the
  narrow stop at both widths); the D4f stop's clock in 2027 (390: "D4f's one line" false).
- **The gates, on the final tree:** `pnpm check` exit 0 — every package 0 failing, each printing its own count, the web package's
  run among them `retention.test.ts`' six 7.23c tests, `deploy.test.ts` and `busy.test.ts`; `bash tools/keyboard/run-keyboard-gate.sh`
  (`pnpm keyboard`, the whole gate) exit 0 with no failure — 7.23c (a)–(g) and its floor at 390 and 320, 5.22's phone floor
  re-expected, and 7.22's, 7.23a's and 7.23b's journeys and floors unedited among them; `node --check tools/probe/run-verify-editor.cjs`
  clean.

**Executed — Dev, the implementation pass (2026-11-26, Node 24; local only — it made no production, Vercel, Resend, Dodo or T1
call, so walk steps 97 and 123 are written, never run here; they are the main session's on the owner's in-session go):**
- `pnpm check` — exit 0 (lint, typecheck and every package test; `retention.test.ts`' new `phoneCard`/`cardTime` tests, and
  `deploy.test.ts`' restore assertion re-pointed at `history-requests.ts`, where the request now lives). Each new unit assertion
  was seen red under a planted reversion of `phoneCard` or `cardTime` (unlinked before empty; another site's Live row counted; the
  next row as the undo; no undo; the newest row assumed live; `cardTime` written as `timeLabel`).
- `python3 tools/doc-audit.py --check` — the first run regenerated the story board (STALE, as after any spec edit), the second PASS.
- `pnpm keyboard`'s three specs, against an `INFLOZO_HARNESS=1 next dev` started by hand (the gate script's own command) — the
  whole run green with no failure: journeys 7.23c (a)–(f) on the iPhone 13 descriptor; 7.22's, 7.23a's and 7.23b's journeys and
  floors with no edit to their expectations; 5.22's phone floor re-expected; 7.23c's floor at 390 (iPhone 13) and 320 (iPhone SE).
  Seen red under planted reversions, each restored and read back: an ending that neither re-reads nor focuses the heading
  ((b), (d), (f)); a stale answer not read again ((e)); a refusal said in the region ((c)); the confirm sending no check (every
  7.23c journey and 7.23a (m) — the drawer shares it); the coarse rule without `[data-small-screen]` (the floor's 44px sweep of
  the open confirm at both widths); `flex-1` on the row's time (the 320 wrap). Change log 3 records the one plant that stayed
  green (`backTo`, which Chromium's own dialog focus-restore covers).
- `grep -rn "Deploy history and Billing\|ONE ROW, NOT THREE" apps/web tools` — nothing (the `ONE ROW` hits left are other
  components' own words). `7.23c`'s and the notice's stale sentences: Epic 5's context gained a dated sub-bullet; Story 5.22's
  card in `epics.md` and its spec (a record) stay as dated.
