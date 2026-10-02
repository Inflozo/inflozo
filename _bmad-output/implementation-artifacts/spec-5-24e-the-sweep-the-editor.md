---
title: 'Story 5.24e — The sweep: the editor'
type: 'chore'
created: '2026-10-02'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '0e8dcbb0b6418b11e862f0db86cf809e6d1ce85f'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

After this story, when your sign-in runs out the editor says so and offers a **Sign in** button instead of blaming
the connection, and signing out first sends any work not yet sent, then wipes this browser's copy — asking you first
if the work cannot be sent. You will see small fixes across the editor: each Layers row has a little picture of its
own kind of section, pointing at a row outlines its section without moving the page, a paste from Google Docs keeps
its bold and italic, the Section Picker's search behaves, the sample article's audio and video play, a list that shows
fewer items keeps its "2–6" range, and Layers lists Ghost's Subscribe button only when your site shows it, in the icon
your site chose. Out of sight, reloading or closing the window that is editing no longer hands editing to your other
window, a sign-up section's settings warn in the Sites screen's words when your site cannot take its sign-up, and
every other entry closes with a check that fails if the fix is undone.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Group E of the sweep's triage (R-211) is the ledger's open entries about the editor. Re-derived at this
Create from `deferred-work.md` at `0e8dcbb0`, it matches this story's card exactly:
- DW-102, 181, 187, 188, 189, 198, 199, 202, 203, 205, 207, 212, 223, 225, 226, 229, 235, 240, 241, 242, 243, 244,
  248, 250, 256, 258, 259, 270, 273, 274, 275, 277, 278, 280, 281, 282, 283 and 290;
- DW-300, from Story 5.24c's review;
- DW-302 and DW-303, from Story 5.24d's review.

Six of them carry the owner's rulings of 2026-09-28: R-213 (DW-202), R-214 (DW-203), R-215 (DW-277), R-216 (DW-274),
R-217 (DW-188) and R-218 (DW-212).

**Approach:** Close each entry by a change that makes its claim false, with a control seen red when the change is
reverted (standing rule 2).
- Seven read-only passes checked Story 5.24a's plan against HEAD. They ran each fix and its control in a scratch copy;
  where the plan was wrong, the task below is the corrected one (Design Notes list the corrections).
- Three findings belong to later stories and become new entries at this Create, each named in its story's card:
  - **DW-304**: a save the server refuses for good — Story 7.18.
  - **DW-305**: a paid ask on an invite-only site — Story 9.1.
  - **DW-306**: an announcement bar below the header — Story 9.5.

The order:
1. **Question 1** decides one sentence of R-213. Dev may build everything else first; the Dev commit waits for the
   ruling.
2. **Offline:** the app, the CI check, the keyboard gate and the documents, each change with its control.
3. **The main session:** DW-278's recording on T1 and T3, on the owner's go in that session.
4. **The walks:**
   - each walk change's control is planted against production as a LOCAL RUN;
   - then the push;
   - then the clean committed walks on the deployed build (Verification).

There is no migration, so there is no Schema phase (R-99). This was executed at this Create: the lock's new `leave`
rides the existing `heartbeat_at` UPDATE grant and the owner's policy.

## Boundaries & Constraints

**Always:**

- **The ledger is the source.** Dev re-derives Group E at HEAD first (Verification's first command); a verdict that no
  longer holds is re-made, never forced. An entry closes only on evidence — a change whose control was seen red with it
  reverted — as `status: done <date>` with a `resolution:` naming Story 5.24e and that evidence. **No entry is deleted
  or renumbered.** DW-304, DW-305 and DW-306 stay open with their owners.
- **One name per thing (R-170).** Every new sentence lives once, in the list its siblings live in (`lib/journal.ts`,
  `LOCK_COPY`, `lib/ring.ts`, `lib/paywall.ts`); tests import it, never retype it.
- **Read-only means visibly disabled (R-192).** Losing the lock closes what edits and keeps what only views.
- **R-98.** A control that starts work swaps to its present-tense label and goes `aria-disabled` + `aria-busy` until
  the work lands; `apps/web/busy.test.ts` stays green.
- **A walk edited in the commit it verifies proves less.**
  - Each walk change's control is a planted run against production with `APP_ORIGIN=https://app.inflozo.com` (it
    prints "LOCAL RUN"), and the plant is reverted afterwards.
  - The clean committed walk on the deployed build is the result.
  - Walks run alone. A run that dies is re-run, and the SAME line dying twice is a signal.
- Keys by variable name only (`docs/project-context.md`); `--exclude=.env` on every recursive grep over `tools/`.
- Counts are derived (standing rule 4). Every rename ends with a grep for the old name (standing rule 7). Node 24 for
  app code.

**Ask First:**

- **DW-278's recording writes to T1 and T3.** It steps Portal's icon through the five presets on both majors, then
  puts each site back, T3's own `icon-5` included.
  - Ask the owner in the Dev session itself: "Write to the test sites for 5.24e".
  - Run it in the main session, never through a subagent.
- **The live-content walk without `NO_429=1`.**
  - Say first, in plain words, that T1's post reads will be blocked from his network for an hour, on purpose.
  - Run `NO_429=1` first, and the 429 step last, alone.
- **A render-matrix re-baseline** (R-116): DW-102's playable media may change a photographed video frame; the owner
  approves a re-baseline.
- **A closure bigger than its triage says** stops; the entry is re-homed to one named later story whose card gains the
  sentence with its DW id.

**Never:**

- No edit to the design export (R-74).
- No migration (R-99).
- No new npm dependency (the media files are assets).
- No BMAD update (R-91).
- No new GitHub secret: the Vercel token the workflow already holds reads DW-302's two values.
- No run of a `record-*.py`; never `--help` on one. DW-278's recorder is the only test-site write, and it is Ask First.
- No `record-shim.py` re-record for DW-270. The canvas's live reads are compared against no fixture, and the theme's
  `POSTS_INCLUDE` stays `tags,authors`.
- No edit to a finished story's spec. A correction lands in the ledger, the register or `MEASUREMENTS.md`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A save refused for sign-in | `/sync` answers 401 | **Signed out**: R-213's sentence and a **Sign in** link (new tab, `…/sign-in`); no Retry now; the backoff keeps trying | back on `visible` → one try → Synced |
| … and this browser's copy erased | 401 while the editor is in fallback | Question 1's sentence | — |
| A dropped connection | network error, 502, timeout | Retrying, as today | — |
| A refusal signing in cannot cure | 404, 400, 422 | Retrying, as today — DW-304, Story 7.18 | — |
| An editor action signed out | `setViewedStates`, `setPreviewSubject`, `recheckSite` | the action's own refusal; the tab stays put | — |
| Sign out, nothing owed | no unsynced record | erase `inflozo-doc-<user>`, sign out | an erase that fails still signs out |
| Sign out, work owed | unsynced records | each sent as `{ base, docs }`; all 200 → erase → sign out | 409 or no answer → cannot send |
| Sign out, cannot send | offline, a refusal | "Sign out with unsent work?" — **Wait** focused, **Sign out anyway** | anyway → erase → sign out |
| Two tabs of one browser | a tab opens reading along beside the holder | it adopts no journal, sends nothing, records no View as | — |
| The holder reloads | `pagehide` → `leave` | the row stays its own for a 10 s grace; the reload reclaims it | a late leave carrying an old beat changes nothing |
| The holder closes | `pagehide` → `leave` | another session acquires after the grace, no later than its check-in at HEAD | the unload flush landing inside the grace is taken |
| My request replaced | a third session asks over mine | mine keeps "Asking…"; **kept** only when the holder cleared it; ended when the holder or generation moved | — |
| The lock lost with a menu open | holder → reader | every popover, dialog and inline field closes; view controls stay live | — |
| A Google Docs paste | `<b style="font-weight:normal">` around `font-weight:700` and `font-style:italic` spans | bold and italic kept, as the field's allowed marks | the wrapper alone, or 400/500 → unmarked |
| A capped search | the posts list capped, a term typed | after 300 ms one `title:~'…'` read, quotes escaped, `order` sent; rows merged | under 2 characters → no read; the share spent → client-side and the capped line |
| A slug | `café`, `a--b`, `-lead`, `trail-` | valid — one grammar | `中文`, `ā`, a quote → refused |
| Hand-picked past 100 | 150 picks | two chunked reads; 150 rows in pick order | — |
| A `tiers` post | `visibility: tiers`, the paid tier among its tiers | Paid member: the whole article; Free member: cut | — |
| `portal_button` unreadable | the key absent | assumed off; Sites asks, "No, it's off" first | — |
| Layers' Ghost rows | the button off; no announcement to show | no row for that surface; no group when none | a hidden row's id is kept and comes back hidden |
| A sign-up section's line | a free ask on an invite-only or paid-only site; a paid ask without Stripe | the Sites screen's sentence; both when both apply | members off: 5.20's line |
| Settings missing keys | `announcement`, `brand`, `codeinjection_*` absent | the stored values stand | a first read with nothing stored writes nulls |
| A pointer on a Layers row | hover, no click | its section's outline and name tag; no pill, no hairline, no scroll | click → R-156's reveal |
| A site-wide move | a footer dragged, ⌥↑'d or gripped above a header; a header placed after a footer | clamped to its band; the site doc is stored in canvas order | at the band's end ⌥↑ does nothing |
| DW-302's check | `Accept-Profile` private, storage, vault · public, graphql_public | 406 PGRST106 · 404 PGRST205 and a hint naming exactly `public, graphql_public` | Vercel or Supabase unreachable → exit 1, "could not ask" |
| The connect wizard | `next dev`, StrictMode on, Connect pressed | the action's POST leaves | — |

</frozen-after-approval>

## The triage

Derived at this Create from the ledger at `0e8dcbb0`: exactly the card's list, and no other open entry names Story
5.24e. Each entry was read in full, and its plan (Story 5.24a's § The four stories after this one) was checked against
HEAD by seven read-only passes that ran the fix and its control in a scratch copy.

| Entry | Closed by | Its evidence lands at |
|---|---|---|
| DW-202 (R-213) | the sixth state on a 401; the editor's three actions refuse instead of redirecting; the tail is DW-304 | Dev (journey); Review (walk) |
| DW-203 (R-214) | sign-out sends, erases, asks when it cannot send; a tab reading along adopts and sends nothing | Dev (unit, journey); Review (walk) |
| DW-205 | one announcer every live region uses, so a repeat is spoken again | Dev (journey) |
| DW-223 | the pick waits in this tab's `sessionStorage` until its action answers | Dev (journey); Review (step 89 variant) |
| DW-225 | only the lock's holder records what was looked at | Dev (journey); Review (lock walk) |
| DW-235 | `docRefusal()`, shared by the route and `read.ts`; a 422 before the write | Dev (unit); Review (step 66c) |
| DW-240, DW-244 | a `leave` that backdates the beat inside a 10 s grace; a poll at the staleness edge | Dev (unit, SQL); Review (lock walk) |
| DW-241 | losing the lock closes every menu, dialog and inline field | Dev (journey) |
| DW-242 | already fixed by Story 5.22's layout-effect gate; the dead self mark deleted; a journey holds it | Dev (journey) |
| DW-243 | `askedNow()` — "kept" only when the holder cleared the request | Dev (unit) |
| DW-248 | a debounced title search at Ghost while the posts list is capped | Dev (unit); Review (live walk, simulated) |
| DW-250 | a stored Tag or Author subject paints in one round | Dev (unit) |
| DW-258 | one slug grammar, as Ghost's slugify really writes | Dev (unit, gscan) |
| DW-259 | hand-picked ids read in chunks | Dev (unit) |
| DW-270 | `tiers` included on the reads checked per visitor, and kept | Dev (unit); Review (live walk, simulated) |
| DW-300 | FR-H7 decides it: no version means the floor; the entry's helper wording corrected | Dev (unit) |
| DW-273 | the untouched box follows the linked site's major | Dev (unit) |
| DW-274 (R-216) | one list read by the Sites notice and the panel line; the paid-ask gap is DW-305 | Dev (unit, journey) |
| DW-275 | the Paywall sheet loads on the first Paywall paint | Dev (unit, journey) |
| DW-277 (R-215) | unreadable means off; a Layers row only for what the site shows | Dev (unit, journey) |
| DW-278 | the site's chosen icon stored and drawn | Dev (unit; the recording, Ask First) |
| DW-280 | an absent key leaves the stored value standing — code injection's too | Dev (unit) |
| DW-283 | MEMBERS OFF whole or absent | Dev (floor) |
| DW-187, DW-189 | site-wide moves clamped to their band; the head band's order is DW-306 | Dev (unit, journey, floor) |
| DW-188 (R-217) | a row's pointer outlines its section and never scrolls | Dev (floor); Review (walk) |
| DW-199 | the skeleton's card fits as the real card fits | Dev (floor) |
| DW-226, DW-229 | the chip honours the declared width; PAUSED gets a spoken sentence | Dev (unit, journey) |
| DW-256 | the chrome host declares Tailwind's four shadow variables | Dev (journey) |
| DW-281 | a Layers picture per category, from S4 and D8 | Dev (journey) |
| DW-290 | the chrome's faces and sheet prepared in idle time | Dev (journey); the 4× trace by hand |
| DW-102 | in-house audio and video served from the app | Dev (unit); Review (ranged GET, walk) |
| DW-181 | pasted weight, style and decoration read as the field's marks | Dev (unit); the owner's paste |
| DW-198 | the sidebar picks the swatches for both modes; `clearProject()` | Dev (journey, unit) |
| DW-207 | the three Section Picker leftovers | Dev (journey) |
| DW-212 (R-218) | the header keeps its range | Dev (unit); Review (controls walk) |
| DW-282 | the read-only rows' keys carry their kind | Dev (journey) |
| DW-302 | a stdlib check in the `rls` job, reading the two values from Vercel | Dev (planted); CI on the push |
| DW-303 | a harness mount of the wizard and a keyboard-gate stop | Dev (journey) |

## Code Map

All anchors are at `0e8dcbb0`.
- `E` = `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/`.
- `P` = `apps/web/app/(app)/app/(authed)/projects/[id]/`.
- Node 24: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`.
- **The live Layers and pill files are `components/controls/layers.tsx` and `components/controls/section-pill.tsx`.**
  5.24a's plan named `components/editor/…`, which does not exist.

**Saving and signing out**

- `P/sync/route.ts`, the statuses it answers:
  - `:47` 401;
  - `:50` and `:114` 404 (a deleted project, or another account's session);
  - `:56-67` 400;
  - `:70-81` the key, schema and surface checks (422 at `:73`, `:75`, `:79`);
  - `:95-101` the lock check, run only when a `session` is sent;
  - `:117-129` a refused write whose docs are already stored answers 200.
  - `:15-17` claims parity with `read.ts`, which it lacks.
  - Proxy and layout: neither answers it, so route handlers sit outside `(authed)`'s guard.
- `E/editor.tsx`:
  - `flush` `:1563`; it throws on every non-OK but 409/423 at `:1643`; catch `:1656`; `scheduleRetry` `:1540`;
  - the request-start line `:1587`; `rest` `:1424-1428`; `toFallback` `:1432-1437`; `syncUrl`'s prefix rule `:1561`;
  - the visibility listener `:3419-3426`, with the unload flush `:3414-3428` (keepalive under 60 KB `:1601`);
  - the hydrate `:3321-3392` (the local record adopted `:3333-3380`, with no look at the lock);
  - `commit`'s lock check `:1397`; the 423 sentence `:1635-1640`; `dropJournal` `:1706-1712`;
  - the displaced session drops owed work `:1725-1733`;
  - `recordViewed` `:1326-1342`; `chooseSubject` `:2256-2286`;
  - no account menu in the editor (`:5264-5265`; the shell's is `components/shell/shell.tsx:306`).
- `E/actions.ts`: `setPreviewSubject` `:41`; `signedIn()` (which redirects) at `:49`, `:114`, `:156`; the View-as upsert
  writes whole arrays `:118-127`. Next navigates whatever the caller catches (`apps/web/lib/action-redirect.ts:1-5`).
- `apps/web/lib/journal.ts`: the states `:225-249`; `unsynced` `:62`; `flushPayload` `:179`.
  `components/kit/persistence-indicator.tsx:33-52` holds R-142's glyph and fill per state.
  `components/editor/save-state.tsx`:
  - the panel `:67-104`;
  - the fallback sentence rule `:80-82`, which is B6's own (`:1388`);
  - Retry now `:87-101`.
- `apps/web/lib/local-store.ts`: the database `inflozo-doc-<userId>` `:100` (no `deleteDatabase` anywhere); it closes
  on `versionchange` `:111`.
- Sign-out entry points:
  - `components/shell/account-menu.tsx:289`;
  - `app/(app)/app/restore/page.tsx:133` (a server component);
  - `(authed)/account/sessions-card.tsx:33` → `signOutEverywhere` (`account/actions.ts:410`).
  - The shell is handed `{ email, displayName }` only (`(authed)/layout.tsx:56`).
  - After sign-in the new tab lands on `/` (`auth/confirm/route.ts:39`); `sign-in/page.tsx:41` sends a signed-in visitor
    to `/`.
- What this browser keeps per user:
  - IndexedDB: the work;
  - `localStorage` `inflozo-ghost-hidden:<projectId>`: ids only (`lib/ghost-surfaces.ts:312`; the try/catch helpers
    `:311-330` are the pattern);
  - `sessionStorage`: the lock's session id, per tab (`lib/lock.ts:45`, read in `lib/lock-client.ts:111-121`).
- `components/editor/lock-takeover.tsx`: its strings are props, but `:80` hard-codes `LOCK_COPY.lossIsFinal`;
  `components/kit/dialog.ts` `openOnCancel`.
- `E/read.ts`:
  - `:183` reads `preview_subject`;
  - `:195` selects the site row (no `ghost_version`);
  - `:204-233` the placement refusals: a treatment `:214-218`, an unknown design `:219-224`, a non-paywall design on
    a surface `:225-227`, a file the design never compiles to `:228-232`;
  - `:343` calls `siteWith`.
  - `lib/pilots.ts` `pilot()` is the home for `docRefusal`.

**The edit lock**

- `P/lock/route.ts`:
  - `INTENTS` `:54` (the "SIX INTENTS" comment `:32`);
  - `release` is a DELETE on the session alone `:122-128`;
  - `acquire` INSERTs at generation 1 `:183-191`;
  - a holder change clears the request columns `:157-158`, `:217-218`.
- `apps/web/lib/lock.ts`:
  - `rowFrom` `:90-109` turns `heartbeat_at` into `ageMs`, so the client holds no beat;
  - `SELF_MARK` / `selfMarkScript` `:47-63` (dead);
  - `stillAsking` `:172-174`;
  - `unsynced_edits` means "as last reported" (`:72`).
- `lib/lock-client.ts`: `LockIntent` `:20`; `askLock` returns null on 401 (`:53`).
- `E/editor.tsx`:
  - `leaving` sends `release` `:1944-1948`; the poll `:1880-1915`, with its extra acquire `:1909-1913`;
  - Hand over `:1788`; the shell recognises itself in a layout effect `:1865-1875` (the dead mark `:1867-1869`);
  - "kept" `:1755-1756`; the requester's ~30 s timer `:1969-1977`;
  - the 5.22 layout-change close `:3458-3462`; the skeleton gate `:722-726`;
  - Site Remix closes only by remount (`:4574-4582`, `components/editor/remix-dice.tsx:164`); Clear dark overrides
    `:5307`;
  - `paint()` ends an inline field `:2522-2524`; `land()` does not.
- `apps/web/lib/menu.ts:162-165` `closeMenus`. `components/controls/sidebar.tsx:557-596` is the Reset box, which stays
  open with Reset design disabled.
- The dead mark also lives in `E/layout.tsx:39-46`, `apps/web/app/globals.css:404-408` and `apps/web/lock.test.ts:253-269`.
  The harness's `READER_LOCK` is `app/(app)/app/harness/editor/layout.tsx:117-125`.
- Database, executed in a `postgres:17` container built from the prelude and every migration:
  - `heartbeat_at` is in `authenticated`'s UPDATE grant (`complete_schema.sql:1255`);
  - the owner and parent policies admit the owner's row (`:825`, `:849`);
  - the triggers fire only on a rewound generation or a changed holder (`:1361`, `:1365`).
- `tools/probe/run-verify-lock.cjs`:
  - it opens two browser contexts, which share no IndexedDB (`:237-238`);
  - B opens reading along around `:327`;
  - `afterFlush` `:456`; the fixture's autosave off `:222`.
  - `run-verify-editor.cjs`'s `handBack` is `:333-338`, with its comment `:327-331`.

**Live content**

- `apps/web/lib/live-content.ts`:
  - `REQUEST_CEILING` `:47`; `LIST_LIMIT` `:49`; the lists `:84-89`; `slugShaped` `:94-95`;
  - `subjectRead` `:105-106`; `feedRead` `:117`; `INCLUDE.posts` `:123`;
  - `bindingReads`' ids branch `:134-140`;
  - `POST_FIELDS` `:220`; `entryRow` `:258-270`; the field-for-field test `:323-334`;
  - `EditorSite` `:510-516`; `siteWith` `:541`.
- Search is client-side `includes()` in three places:
  - `components/controls/link-picker.tsx:184-189` (its capped line `:226-230`);
  - `apps/web/lib/preview-subject.ts:147-151`;
  - `components/controls/data-group.tsx:280-281` (capped line `:408`; `PICK_LACKING` `:310`), fed by `editor.tsx:3587`.
  - The editor props: `:1024`, `:1029`, `:3587`; the capped line `:4420`; `bindingReads`' caller `:2186`.
- `apps/web/lib/canvas.ts`: the subject-free reads already go out in the first round (`:125-131`); `sitePage`
  `:127-137` returns early on an unresolved subject. The visitor check is `seen()` (`orbit-weekly.ts:348`).
- `packages/library/src/vocabulary.ts:479` holds `GHOST_SLUG_RE`, whose comment is false. The tests that change:
  `apps/web/live-content.test.ts:49-60`, `:32`, `:62-78` and `:619`; `packages/library/src/validate.test.ts:641`.
- `packages/ghost-shim/src/index.ts`: `feedExprs` `:651`, `:699-711`. `:600` and MEASUREMENTS §15g cite nql 0.12.7;
  Ghost 5 resolves 0.12.6, with the same nql-lang.
- `packages/library/src/contexts.ts`:
  - the universal loop skips non-`@` paths `:321`;
  - `sort` has no helper branch `:303-306`;
  - a helper's `since` is read only in `bindable(…, use:'helper')` `:221-227`;
  - renders pass no version `:251-254`.
  - Tests: `contexts.test.ts:302-310`, `:312-323`.
- Ghost, read in source (npm tarballs, both pins; the chains resolved from each tarball's lockfile):
  - the posts input serializer wraps a filter as `(<f>)+type:post`;
  - nql-lang's STRING token `['](\\['"]|[^'"])+?[']` is identical in 0.6.3 and 0.7.0;
  - mongo-knex compiles `~` to `lower(title) LIKE ? ESCAPE '*'`;
  - Ghost 5's `slugFilterOrder` (`input/posts.js:94-97`) puts a `slug:[…]` match into raw SQL when no `order` is sent;
  - any answer under 400 resets the brute counter (`brute.js:93-105`; MEASUREMENTS §51).
  - Slugs: `tag.js:125-131` → `security.string.safe` → `slugify` → unidecode 0.1.8. Its `utf8_rx` reads UTF-16 code
    units as UTF-8 bytes, so a Latin-1 letter followed by a character in U+00A0–U+00BF is not transliterated. A slug can
    therefore keep U+00D7 and U+00DF–U+00FE (`« Café »` → `café`; executed on the pinned packages).
  - Imports slugify with `requiredChangesOnly` (`post.js:868`), so `--` and edge hyphens survive.
  - `tiers` is an allowed include on posts and pages (`posts-public.js`, `pages-public.js`); the mapper returns a
    `tiers` post's paid tiers (`mappers/posts.js:68-70` on 5, `:86-88` on 6).

**Ghost's own surfaces, the Paywall, the sign-up line**

- `apps/web/lib/probe-rule.ts`:
  - `portalState` `:85-87` treats unreadable as on, and its comment `:56-66` says why;
  - `imageUrl` `:178`;
  - `settingsPatch`'s rule `:634-639`;
  - the unconditional `announcement`/`brand` writes `:640`, `:642`;
  - `members`' guard `:646-647`, the shape to copy.
- `sites/site-notices.tsx`: it asks while the source is `'default'` (`:137`), with "Yes" primary "because Portal
  defaults to ON" (`:176-187`).
- Other readers of the stored assumption:
  - `sites/actions.ts:563-579` `answerPortal`;
  - `storedSurfaces` (`probe-rule.ts:612`);
  - `tools/probe/run-verify-ghost-admin.py:4581-4597`, which clicks "Yes" as the primary.
- `apps/web/lib/ghost-surfaces.ts`: `buttonMarkup` `:282` always draws `userIcon`; `readMarks` reads the announcement
  (`:86`). The Admin settings browse carries `portal_button_icon` (`server/site-settings.ts:50,137`). Read on 2026-10-02:
  T1 `null`, T3 `icon-5`; both have `portal_button` false.
- Portal's `trigger-button` (2.69.339 `:104-143`; 2.51.5 the same) draws the button's glyph as follows:
  - text-only draws no glyph;
  - a member gets the person at 34 px;
  - `icon-1`…`icon-5` draw a 24×24 white SVG, with identical paths across the two versions;
  - any other value draws `<img>` 26×26 `alt=""`;
  - otherwise it draws the person (26 px with a label, 34 px alone).
  - `apps/web/tokens.test.ts:190` refuses a colour no recorded page carries.
- `editor.tsx:4397-4409`: both Ghost rows show whenever `shimsOn(key, site)` holds. Ghost's `isFilled` (`ghost_head.js`
  6.58.0 `:177`) means content plus a non-empty audience.
- `apps/web/lib/canvas.ts`:
  - `SURFACE_MAJOR = '6'` `:274`, used for the article `:300` and the box `:304`;
  - `withoutMedia` `:276-283`, used `:303`.
  - `sites.ghost_version` is written at connect (`lib/connect-rule.ts:775`) and by the probe (`server/site-probe.ts:125`);
    `versionVerdict` (`connect-rule.ts:130`) is pure.
  - `paywallPage` is called at `editor.tsx:2661`. `packages/ghost-shim/src/contract.test.ts:1012-1035` holds the box to
    both recordings.
- `apps/web/lib/pilots.ts:126-129` inlines `surfaceCss()`: 69,185 of 124,335 bytes (10,379 of 22,872 gzipped).
  - The canvas is one document per editor mount: a constant `src` `editor.tsx:766`, no `key` `:4816`.
  - Canvases switch by `paint()` into it (`:2516`, `:2654`). Selectors: `journey.spec.mjs:2641`,
    `run-verify-editor.cjs:6030,6072`.
  - `csp.ts:81` admits a same-origin sheet.
- `apps/web/lib/paywall.ts`: `membersNotice` `:76-86`; `askLine` `:121-123` reads `membersOff` alone. `memberAsks`
  (`packages/library/src/validate.ts:84`) gives a free ask for `data-members-form` and `data-portal="signup"`, and a paid
  ask for `signup/{tier}/…`, `offers` and `account/plans`. Only a22/1, a free ask, carries one today. The panel note is
  `editor.tsx:4994-5004`.
- `editor.tsx`:
  - the MEMBERS OFF chip is `w-0 max-w-fit grow truncate` at `:4557`;
  - `data-surface-chip`'s whole-or-absent `:4486` is the precedent;
  - its comments are `:4437-4440` and `:4553-4554`;
  - C3b's card is up on the same `offCard` (`:4241`, `:4882`).

**Layers and the canvas chrome**

- `apps/web/lib/editor.ts`: `canvasStack` `:185-190` draws `a3/` last. `categoryOf` in
  `packages/library/src/placement.ts:40` parses the same prefix, and no declared field orders site-wide sections.
- `editor.tsx`:
  - `rowsOf` `:3720-3741`; `moveTo` `:4116-4123`; `onPlace` appends a site-wide section `:4088-4090`;
  - `screenRows` `:2807-2822`; `gripMove` `:4168`;
  - `point()` `:2393-2398`, fed by the canvas's listeners `:3120-3184`, the pill's leave `:4377` and a paint `:3775`;
  - the chrome draws from `pointed` (`:3656-3657`; `CanvasChrome` `:630-655`); the pill `:4907`;
  - R-156's `on.selectRow` `:4297-4303`, `railRow` `:4322`, `reveal()` `:3514-3536`; `pointGhost` `:2461`.
- `components/controls/layers.tsx`: the rows `:204-266`; "NOT BUILT, DELIBERATELY" `:81-82`; ⌥↑/⌥↓ `:378-386`; the
  drop `:423-436`. The insert hairline is `apps/web/lib/canvas-chrome.css:43-46`.
- `tools/probe/run-verify-editor.cjs` parks the pointer at (120,400), "over Layers", at `:610`, `:857` … `:4704`, then
  reads the page at rest (`:858`, `:1516`). `run-verify-lock.cjs:402` parks at (40,450).
- `E/editor-skeleton.tsx`: the card `aspect-[1440/900] max-h-full w-full` `:50`; the ground `:43` lacks the stage's
  `coarse:pb-[52px]` (`editor.tsx:4803`). The real fit is capped at 1 (`lib/device.ts:40-41`). `@container` precedent:
  `section-picker.tsx:229`.
- The live regions:
  - `said` is `useHanded('')` (`editor.tsx:1227`) in `#editor-said` (`:5113`), with its callers;
  - the assertive `announced` `:1138`;
  - `components/controls/item-list.tsx:66`, `data-group.tsx:259`, `(authed)/controls/review.tsx:88` follow the same
    pattern.
  - `handed` passes updaters through (`lib/renders.ts:85-95`). The ⌘D journey is `journey.spec.mjs:291-315`.
- `apps/web/lib/behaviours.ts:63-67` `movesByItself`; `behaviours.test.ts:21-27` asserts the wrong answer at `:23`.
  - The chips: `editor.tsx:3701-3713`. The chip is `aria-hidden` (`:677-700`); `choose()` `:2371-2390` says nothing.
  - core's rule: `core.js:46-49` before `:51-57`. The iframe is the device's width (`:4829-4831`); `pickDevice`
    repaints nothing (`:2042-2053`).
  - The fixture's `marquee` declares no width (`packages/library/fixtures/controls/1/index.html:20`).
- `apps/web/lib/canvas-layer.ts`:
  - `sheetFor` `:48-60`; `addFonts` `:65-89`; `chromeLayers` `:105`;
  - the host style `:117-120` declares only `--tw-border-style:solid` (comment `:116`).
  - The chrome effect is `editor.tsx:3663-3678`. `CanvasNote` is `components/controls/mark-toolbar.tsx:258-272`. Tailwind
    4.3.3's `.shadow-*` reads `--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow` and
    `--tw-ring-shadow`, each `@property` with `initial-value: 0 0 #0000`, which an adopted sheet does not register.
- `components/kit/layers-row.tsx`: `LayerThumb` `:110-119` is Hero's glyph, drawn by the rows (`:69`, `:87`) and the
  rail (`editor.tsx:365`, `railRows` `:4282`). `categoryOf` is already imported (`editor.tsx:7`).
- `requestIdleCallback` is not Baseline (web-features 3.35.0); Safari lacks it (`eslint.config.js:199-200`).
  `tools/perf/fps-trace.mjs` prints no first-selection figure (`:193-201`).

**Panels, the picker, paste, media**

- `apps/web/lib/style-guide.ts:77-91`: `withImages` maps `/images/` only.
  - `csp.ts:76-90` (`default-src 'self'`) is the one policy on every app request (`proxy.ts:61,80`); the matcher is
    `:101`.
  - `routing.test.ts` keeps `public/` folders outside the matcher.
  - `paywall.test.ts:214-228` asserts 5.20's "requests no media"; `style-guide.test.ts:61-69` is the images' sibling.
  - The audio card's time comes from the clip (`vendor/cards/js/audio.js:79-83`).
- Encoders installed: GStreamer (`x264enc`, `lamemp3enc`, `mp4mux`). A ranged GET of a `public/` file answers 206
  (executed on `app.inflozo.com/connect/integration.png`).
- `packages/section-runtime/src/marks.ts`: `MarkNode` `:367-373`; `TAG_MARKS` `:600`; `readMarks` `:608-661`; the pushes
  `:636`, `:644`. Tests: `marks.test.ts:151`. FR-D4 (`prd.md:221`) limits marks to four.
- `components/controls/sidebar.tsx`: `mode` defaults to `'light'` `:260`; `control()` `:296`; the read-only keys
  `read-${r.path}` / `read-${r.name}` `:464-465`. a22/1 declares both a `blurb` prop and a `blurb` control
  (`designs/a22/1/design.json:13`).
  - The swatches are picked by the callers: `editor.tsx:5070`, `pilots/review.tsx:257`, `controls/page.tsx:38` →
    `review.tsx:371`.
  - `/pilots` never passes `mode` (`pilots/review.tsx:252-262`).
  - The project Clear's fold sits inline in `P/settings/actions.ts:103-123`; `clearDarkOverrides` is
    `packages/section-runtime/src/doc-edit.ts:150`. `ROLE_TOKENS` is in `apps/web/lib/controls-review.ts`.
  - Walk step 53 (b) reads `home`'s `instances[0]` alone (`run-verify-editor.cjs:2633-2636`, `:2748-2776`).
- `components/editor/section-picker.tsx`:
  - the title `:156`; the dialog `:165`; `on` `:197`; `tabStop` `:208`;
  - the refusal `:255-257`, cleared only at open or close (`editor.tsx:4036`, `:5300`; the picker's props `:5296`).
  - `lib/keymap.ts:205-209` keeps ⌘K off inside fields. R-37's refusal is `placementRefusal`
    (`packages/library/src/placement.ts:55-58`).
  - The harness's library map is `harness/editor/layout.tsx:128-133` (its site doc `:32-34`; Home `:136-138`).
- `components/controls/item-list.tsx:105-107` prints `shownInThisDesign(count, shown)` (`lib/ring.ts:88-92`), with
  comments at `:17` and `:100-104`. Tests: `ring.test.ts:106-108`; `run-verify-controls.cjs:571-573` (and `:223`, the
  uncapped line).
  - The fixture: Features is min 2, max 6, three items (`fixtures/controls/content.json:11`); design 2's
    `data-items-limit="2"` (`2/index.html:24`).
  - The sentence is also in FR-D13 (`prd.md:230`), Story 5.11's card (`epics.md:1927`) and `controls.ts:225`.
- `journey.spec.mjs:162-170` refuses any pointer API (pointer stops go in `floor.spec.mjs`); `:493` listens for one
  unrelated warning only.

**The two checks**

- `.github/workflows/ci.yml:71-76`: `rls` runs `run-rls-gate.sh` alone; GitHub holds `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID` and `VERCEL_TOKEN` (read with `GITHUB_TOKEN`, names only).
- `tools/probe/run-verify-ghost-admin.py`:
  - `schemas-off-rest` `:5131-5155`;
  - the sibling loader `:676-681`, `_deletion` `:686`;
  - the docstring `:37-41`.
- There is no `NEXT_PUBLIC_*` in `apps/web` (`lib/supabase/server.ts:11-14`); the Vercel names are `SUPABASE_URL` and
  `SUPABASE_PUBLISHABLE_KEY`.
  - Executed read-only with the token: `GET https://api.vercel.com/v10/projects/{p}/env?teamId={t}&target=production`
    lists both as `encrypted`; `GET /v1/projects/{p}/env/{id}?teamId={t}` returns each value (the CLI's own pair,
    `vercel@62.1.0` `getEnvRecords`).
  - `tools/hooks/pre-commit:46` would block committing the key.
- Propagation for DW-302:
  - `RLS-TEST.sql:990-1005` → `supabase/tests/rls.sql:1004-1005` (byte-identical);
  - `ARCHITECTURE-SPINE.md:152`; `SCHEMA.sql:52-55`; `tools/probe/RESET-supabase.sql:48`;
  - `tools/doc-audit.py:897-899` still names the review's old control. Catalogue rows: `BASES`/`EXT` `:1540-1541`; the
    precedent `:1096`; the journey row `:1168`.
- `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx`:
  - 5.24d's fix `:136-140` (comment `:133-135`); `connectSite` imported `:19`, called `:119`;
  - `startTransition` `:180` sends a POST carrying `next-action`.
  - `sites/actions.ts:230` `signedIn()` throws without Supabase. `content-check.ts:38-41` makes a cross-origin GET with a
    preflight, which Playwright 1.61.1 answers under `page.route`.
  - Harness gate precedent: `harness/error/page.tsx`. Lists that name every harness route:
    `apps/web/app-routes.test.ts:55-59` `HARNESS_ONLY` and `run-verify-editor.cjs:6101` (step 79).

## Tasks & Acceptance

**Execution — saving and signing out (R-213, R-214):**

- [ ] `lib/journal.ts`, `components/kit/persistence-indicator.tsx`, `components/editor/save-state.tsx`, `E/editor.tsx` —
  **R-213 (DW-202).** A sixth state, `{ kind: 'signed-out' }`, labelled **Signed out**. `panelOpen` is true for it.
  - The Kit: a sixth member, filled `bg-danger-text`, with a Tabler glyph of its own so shape tells it from Retrying
    (R-142).
  - On `status === 401`, `flush` takes it. The backoff (5 · 10 · 20 · 40 · 60 s, no countdown shown) keeps running.
  - `:1587`, `rest` and `toFallback` keep `signed-out` exactly as they keep `retrying`.
  - The `visible` branch of the listener at `:3419-3426` calls `retryNow()` while signed out. The cookie jar is shared,
    so a sign-in in another tab rides this tab's next fetch (executed).
  - The panel shows:
    - the title **Signed out**;
    - the sentence, imported from `lib/journal.ts` — R-213's words; in fallback, Question 1's;
    - one **Sign in** link in Retry now's style: an `<a>` to the app's `/sign-in`, with `syncUrl`'s `/app` prefix rule
      (`:1561`), `target="_blank"` and `rel="noopener"`;
    - no Retry now.
  - 404, 400, 422 and every other status stay Retrying (DW-304).
- [ ] `E/actions.ts:49,114,156` — **R-213's other half.** `setPreviewSubject`, `setViewedStates` and `recheckSite`
  check `currentUser()` and answer their existing refusals. Today their `signedIn()` redirects a signed-out tab to
  `/sign-in`, which is the owner's declined option 3 by accident.
  - **Controls:**
    - A journey stop beside `journey.spec.mjs:1696`, using `page.route('**/sync')`:
      - abort → ⌘S → "Retrying" and "when the connection returns" (the stop's own control);
      - 401 → "Signed out", the sentence (imported), a Sign in link with `target=_blank` ending `/sign-in`, and no
        `#editor-retry-now`; Enter on the link opens a page and the editor's URL is unchanged;
      - 200 `{"applied":true,"revision":1}` plus a `visibilitychange` → "Synced";
      - 422 → "Retrying".
    - A `server-wiring.test.ts` row: no export of `E/actions.ts` calls `signedIn()`.
    - Each is red at HEAD.
- [ ] `lib/local-store.ts`, `components/shell/account-menu.tsx`, `(authed)/layout.tsx:56`, `restore/page.tsx`,
  `account/sessions-card.tsx`, `components/editor/lock-takeover.tsx`, `lib/journal.ts` — **R-214 (DW-203).**
  - `local-store.ts` gains a read that lists the records, and `erase(userId)` (`indexedDB.deleteDatabase`, fail-soft).
  - Its `versionchange` close calls the editor's `toFallback()`, so an open editor stops claiming the device holds its
    work.
  - One client function, `signOutFlow({ owed, send, erase, signOut, ask })`, serves the account menu's Sign out, the
    restore page's and Sign out everywhere:
    - it sends every record whose journal is `unsynced` as `flushPayload(journal, docs)` with `{ base: baseRevision,
      docs }` to `syncPath`, **without** `session`;
    - the revision CAS still guards: a 409 counts as cannot send, and an already-stored record answers 200
      (`sync/route.ts:117-129`);
    - all sent → erase → the server action;
    - any failure → it asks first.
  - Each form's action becomes that client function. The shell is handed the user's `id`.
  - The ask is `lock-takeover.tsx` with its strings as props, plus a prop for its danger line (`:80`). The words live in
    `lib/journal.ts` and are derived from B5c (R-170):
    - heading "Sign out with unsent work?";
    - danger panel `LOCK_COPY.willBeLost(n)` and "Signing out erases this browser's copy.";
    - confirm (danger, a Kit `Submit`, busy "Signing out…") "Sign out anyway";
    - cancel "Wait", focused on open (`openOnCancel`).
  - `ponytail:` a record orphaned in this browser lands even while another device holds the lock unflushed. That
    device's next flush then gets the existing 409 flow. The upgrade is acquiring the lock per record.
  - **Controls:**
    - A unit test of `signOutFlow` with fakes, red with any step reordered or the ask skipped:
      - nothing owed → erase then sign out;
      - all 200 → send, erase, sign out;
      - a failure → ask; Wait → no erase and no sign-out; anyway → erase, sign out.
    - A deployed walk at Review: `indexedDB.databases()` lacks `inflozo-doc-<id>` after sign-out (it survives at HEAD),
      and the owed edit is in `project_templates`.
- [ ] `E/editor.tsx` (`flush`, the hydrate) — **DW-203's two-tab half, open at HEAD.** Executed: a tab reading along in
  the same browser adopts the holder's pending journal and sends it when hidden, takes the 423, then drops the holder's
  on-device record. Now:
  - `flush` returns unless this tab holds the lock;
  - the hydrate skips the local record when the tab opens reading along.
  - **Control:** two pages in ONE context, the second with `x-inflozo-harness-lock: reader`
    (`journey.spec.mjs:2686`). B shows its own state, sends no `/sync` POST when hidden, and A's pending row survives.
    Red at HEAD.
- [ ] `lib/pilots.ts`, `E/read.ts:204-233`, `P/sync/route.ts`, `tools/check-traces.mjs` — **DW-235.**
  `docRefusal(key, doc, held = {})` beside `pilot()` returns `read.ts`'s sentences, the one-instance surface rule
  included.
  - `read.ts` throws with it.
  - The route calls it per key before the lock read and the RPC, replacing `:76-79` and the surface-count line.
  - `check-traces.mjs` gains the sync route's trace (`projects/[id]/sync/route.js.nft.json`, needing `designs`): it now
    reads the library off disk, and a lost trace would refuse every save.
  - **Controls:**
    - `docRefusal('home', a24/1)` matches `/never home\.hbs/`; `('post', a24/1)` is null.
    - The route calls it before `rpc('sync_project_doc'`, as `editor.test.ts:228` holds its precedent. Red at HEAD.
    - Review: step 66c posts `{home: a24}` → 422, run only with the fix deployed.
- [ ] `lib/preview-subject.ts`, `E/editor.tsx` — **DW-223.**
  - Helpers keyed `inflozo-subject:<projectId>:<templateKey>`, try/catch, taking a `Store` (as `ghost-surfaces.ts:311-330`).
  - `chooseSubject` writes before the action and clears on its answer.
  - The hydrate lets a pending pick win and sends it again.
  - **Controls:** `preview-subject.test.ts` cases for the helpers; a journey on the harness Post canvas that holds the
    `next-action` POST, picks, reloads at once and reads the pick on the pill. Review: step 89's variant on production
    holds every action and reloads at once — the old article at HEAD.
- [ ] `E/editor.tsx` (`recordViewed`) — **DW-225.** A write is queued, and sent inside the `viewedWrites` chain, only
  while this tab holds the lock: a window reading along records nothing (5.24a's routine call 5). **Control:** two pages
  in one context — the reader changes View as → no action POST carrying `"states"`; the holder → one. Red at HEAD.

**Execution — the edit lock:**

- [ ] `lib/lock.ts`, `P/lock/route.ts`, `lib/lock-client.ts`, `E/editor.tsx`, `harness/editor/layout.tsx`,
  `lock.test.ts` — **DW-240, DW-244.**
  - `LEAVE_GRACE_MS = 10_000` beside `STALE_MS`: three times the measured reload gap, and under `HEARTBEAT_MS` and
    `NUDGE_MS`.
  - `LockRow.beat` is the raw `heartbeat_at`, opaque and compared only.
  - A new intent `leave` updates `heartbeat_at` to `now − STALE_MS + LEAVE_GRACE_MS`, filtered on project, session and
    `beat` (a string of 64 characters or fewer that `Date.parse` reads). The "SIX INTENTS" comment loses its number.
  - `leaving` sends `leave` with the latest beat (`release` without one). Hand over and the walk's `handBack` keep
    `release`.
  - The poll, when not holding and a live row's `STALE_MS − ageMs < HEARTBEAT_MS`, polls once more at that moment plus
    250 ms. A closed tab is then freed no later than at HEAD.
  - `READER_LOCK` and `lock.test.ts`'s `row()` gain `beat: null`.
  - **Controls:**
    - A `lock.test.ts` case for the grace, live until it ends and stale after.
    - The SQL, executed: a late leave carrying the old beat changes 0 rows where HEAD's DELETE changed 1.
    - `run-verify-lock.cjs`, two stops (LOCAL RUN controls), each red at HEAD:
      - A reloads while B is told to poll inside the gap (`BroadcastChannel` `released`); the row stays A's at the same
        generation and B keeps its bar;
      - the outgoing leave is held until A's reloaded beat has answered; the row is A's and fresh.
    - A third, DW-244's: A holds one unsynced edit and its flush is held 4 s while it leaves; the edit lands and B then
      acquires. HEAD answers 423.
- [ ] `E/editor.tsx` (one effect after `:1965`) — **DW-241.** While `!lock.holder`:
  - `closeMenus()`;
  - close every `[data-editor] dialog[open]` — Site Remix, the Reset box, Clear dark overrides, Rename, the site-wide
    Hide confirm, the Section Picker;
  - end an inline field being typed in (`paint()`'s own end, `:2522-2524`).
  - It covers `land()`'s flip, Hand over and the 423 path. **Control:** a keyboard stop routes the lock held then taken,
    opens ⌘K, a Layers ⋯ and ⇧R, and posts `took-over` on the lock's channel. The bar is visible, the `:popover-open`
    count is 0 and `dialog[open]` is 0. Red at HEAD (four of five open).
- [ ] `lib/lock.ts:47-63`, `E/layout.tsx:39-46`, `globals.css:404-408`, `E/editor.tsx:1867-1869`, `lock.test.ts:253-269`
  — **DW-242.** Already fixed by Story 5.22's gate. The shell mounts from a layout effect and recognises itself in one,
  before the first paint: 0 of 156 frames painted greyed, against 161 of 161 for a genuine reader. The self mark is dead
  code and goes. **Control:** a journey stop with an rAF sampler, a self arm and a genuine-reader arm. It is red with
  `:1865`'s layout effect turned into `useEffect`.
- [ ] `lib/lock.ts` (`stillAsking` → `askedNow(row, askedOf)`), `E/editor.tsx:1755-1756`, `lock.test.ts:72-77` —
  **DW-243.** `askedNow` returns one of three answers:
  - **ended**: the row is null, or the holder or generation moved;
  - **kept**: the request columns are null;
  - **waiting**: otherwise.

  A replaced request keeps "Asking…" and hears the holder's one answer (Design Notes, routine call 4). No column.
  **Control:** cases for replaced, taken over and the holder's reload, two of them red with HEAD's logic.

**Execution — live content:**

- [ ] `lib/live-content.ts`, `E/editor.tsx`, `link-picker.tsx`, `lib/preview-subject.ts`, `data-group.tsx` — **DW-248.**
  - `searchRead('posts', term)` builds `filter=title:~'<t>'`, where `t` is the trimmed term of 2–100 characters with
    `'` and `"` backslash-escaped. It sends `limit=15` and `order=published_at desc` (always — Ghost 5's
    `slugFilterOrder`).
  - `SEARCH_SHARE = REQUEST_CEILING / 5`; `SEARCH_DEBOUNCE_MS = 300`.
  - The editor runs one debounced search, only while `LISTS.post` is capped. Each term is its own 60 s cache key. At the
    share it falls back to client-side search with the capped line. Rows merge by id into the props at `:1024`, `:1029`
    and `:3587`.
  - The three components report their typed term through `onQuery`; their capped line shows while the box is empty.
  - Posts only; pages, tags and writers stay client-side.
  - **Controls:**
    - `live-content.test.ts` rows: the escapes, the explicit order, the bounds, the merge — red at HEAD.
    - Review: the live-content walk with a capped list simulated by `page.route` (DW-251's precedent) types a fragment
      and expects one `title:~` read after the pause and its row.
- [ ] `lib/canvas.ts` (`sitePage` `:127-137`) — **DW-250.** It no longer returns at `:131`. While the subject is
  unresolved it reads a stored site subject as the likely answer (`unresolved && o.stored?.source === 'site'`) for
  `source.pages` and `sitePieces`.
  - `{ nothing }` is judged only once resolved.
  - A gone slug costs one `200 []`, never a 4xx.
  - **Control:** a `live-content.test.ts` round-count row: a stored Tag or Author takes 1 round (3 at HEAD), a gone one 2,
    and Home and Post stay 1.
- [ ] `packages/library/src/vocabulary.ts`, `lib/live-content.ts`, the two tests — **DW-258.**
  - `GHOST_SLUG_RE = /^[a-z0-9_×ß-þ-]+$/`, as Ghost's slugify really writes; its comment is corrected.
  - `slugShaped` is a string of 191 characters or fewer matching it, imported from `@inflozo/library` (the "importless"
    header is stale).
  - `live-content.test.ts:49-60`: `café` stays valid; `a--b`, `-lead` and `trail-` become valid; `中文` and `ā` are
    refused. `validate.test.ts:641`: `é` becomes valid.
  - **Control:** red at HEAD on `café`. gscan on a stress theme emitting `tag:'café'`, both majors (`tools/stress`),
    0 errors and 0 warnings — a hypothesis until run.
- [ ] `lib/live-content.ts` (`bindingReads`), `E/editor.tsx:2186`, its tests — **DW-259.**
  - Picks are de-duplicated, sorted and chunked by `LIST_LIMIT`, each chunk its own key.
  - `siteRows` flat-maps the chunks; `siteTotal` is 0 until every chunk has landed. This also ends the false "Not on
    {site}" on picks 101 and up (`data-group.tsx:310`).
  - FR-H2's "no hard cap" stands.
  - **Control:** 150 picks against a look answering at most 100 — all 150 rows in pick order. Red at HEAD.
- [ ] `lib/live-content.ts` (`subjectRead`, `feedRead`, `entryRow`) — **DW-270.**
  - `tiers` is added to the includes of the reads `seen()` re-checks per visitor.
  - `entryRow` keeps `tiers` mapped through `TIER_FIELDS`, as tags and authors are.
  - `INCLUDE.posts` and the theme's `POSTS_INCLUDE` stay as they are.
  - **Control:** the include is sent; the whitelist drops `monthly_price_id`; on `sitePage` a paid visitor gets `access`
    true and a free one false. Red at HEAD.
  - Review: the walk simulates a `tiers` post by `page.route`. Neither test site holds one (read 2026-10-02).
- [ ] `packages/library/src/contexts.ts`, `contexts.test.ts`, `deferred-work.md` — **DW-300.** No change to the rule.
  - FR-H7 ("prevention, not warning"; "fields introduced after a target's version … are not offered") decides it: with
    no version, the offer is the floor's.
  - A comment beside `versionAtLeast` says so.
  - The entry's resolution records that bare helpers are never offered at any version (`:321`, `:303-306`); what "no
    version" withholds is the `@site.*` and scope keys carrying a `since`.
  - **Control:** a `contexts.test.ts` row — no helper-kind key in any offer at any version, plus `@site.threads` absent
    with no version and present at 6.36.0.

**Execution — Ghost's own surfaces, the Paywall, the sign-up line:**

- [ ] `lib/probe-rule.ts`, `sites/site-notices.tsx`, `lib/ghost-surfaces.ts`, `E/editor.tsx:4397-4409`,
  `run-verify-ghost-admin.py:4581-4597` — **R-215 (DW-277).**
  - `portalState`'s unreadable branch is `false`, with its comment rewritten.
  - The Sites question makes **"No, it's off"** primary. The recommended answer is the stored assumption.
  - `rowsOn(surfaces, members, parse)`:
    - the bar's row shows when `announcementFor` holds for some visitor (Ghost's `isFilled`);
    - the button's row shows when `portalFor(…, 'anonymous') !== null`, i.e. `portal_button` on and sign-up not Nobody.
  - `ghostRows` is filtered by it and is `undefined` when empty.
  - `ghostChosen` clears if its row vanishes after a re-read. A hidden row's id stays and returns hidden.
  - **Controls:**
    - `probe-rule.test.ts:95-113`, `:272-275` move to `false`; a `ghost-surfaces.test.ts` `rowsOn` case.
    - The DW-279 journey: no `[data-ghost-rows]` before the held answer lands, both rows after.
    - All red at HEAD.
- [ ] `lib/probe-rule.ts`, `lib/ghost-surfaces.ts`, `tools/probe/record-ghost-surfaces.cjs` — **DW-278.**
  - `portalState` stores `portal_button_icon`: one of the five presets, or an https URL through `imageUrl`, else null.
  - `Surfaces.portal.icon` is re-checked by `storedSurfaces`; `portalFor` passes it.
  - `buttonMarkup` draws the preset's recorded SVG, or `<img alt="">` at 26×26 through `escapeUserText`.
  - `tokens.test.ts:190` holds the presets to a recorded page. So `record-ghost-surfaces.cjs` steps through the five
    icons on both majors and puts each site back (**Ask First**).
  - **Control:** a `ghost-surfaces.test.ts` case per branch, red at HEAD.
- [ ] `lib/probe-rule.ts` (`settingsPatch`) — **DW-280.** A per-field guard: a key Ghost sent is a reading, and an
  absent key keeps the stored field. The guard covers the announcement, the brand **and the `codeinjection_*` pair**,
  which has the same flaw. A first read with nothing stored still writes nulls. **Control:** a `probe-rule.test.ts`
  case, red at HEAD.
- [ ] `E/read.ts:195,343`, `lib/live-content.ts` (`siteWith`), `lib/canvas.ts` (`paywallPage`), `E/editor.tsx:2661` —
  **DW-273.**
  - The site row's `ghost_version` reaches `site.major` through `versionVerdict`.
  - The box uses `o.major ?? SURFACE_MAJOR`; the article stays 6, its card CSS being Ghost 6's.
  - An unlinked project or unknown version draws 6.
  - **Control:** `paywall.test.ts` (major 5 → 5's box; none → 6's) and a `siteWith` case, red at HEAD.
- [ ] `lib/pilots.ts:126-129`, both `/canvas` routes, `E/editor.tsx` (`paint()`), `journey.spec.mjs:2641`,
  `run-verify-editor.cjs:6030,6072` — **DW-275.**
  - The canvas document no longer inlines `surfaceCss()`.
  - Both canvas routes answer `?sheet=surface` with it, as `text/css` under `caching.document`.
  - On a surface with no `link[data-order="2b-surface"]`, `paint()` inserts the link before `[data-order="3-pilots"]`
    and returns. Its `load`/`error` marks it landed and paints again.
  - The selectors become `[data-order="2b-surface"]`.
  - **Controls:** `pilots.test.ts` (no `surfaceCss()` in the document), red at HEAD; a journey stop — Home has no sheet;
    at the first Paywall paint the media is `all`, `.gh-content` computes `display: grid`, and the canvas opens at the
    cut.
- [ ] `lib/paywall.ts`, the Sites notice — **R-216 (DW-274).** One list of `{ask, fact, Sites sentence}` that
  `membersNotice` and `askLine` both read (R-170):

  | Site fact | Free ask | Paid ask |
  |---|---|---|
  | members off | 5.20's line | 5.20's line |
  | invite-only | the Sites sentence | no line — DW-305 |
  | paid-only | the Sites sentence | no line |
  | no Stripe | no line | the Sites sentence |

  Both sentences show when both facts apply. **Control:** a `paywall.test.ts` case over the table, red at HEAD; the
  5.20 members-off journeys stay green.
- [ ] `E/editor.tsx:4557` and its comments — **DW-283.** MEMBERS OFF becomes `shrink-0 … compact:hidden`, copying
  `data-surface-chip`. C3b's card title says "Members are switched off" at every width, so nothing is lost.
  **Control:** a `floor.spec.mjs` stop at 600 × 960, `hasTouch` and `isMobile`, members off, on `/paywall`:
  - `[data-paywall-off]` is visible (its own control);
  - `barMeasure().outside` is `[]`;
  - the chip, if shown, is whole.
  - Red at HEAD.

**Execution — Layers and the canvas chrome:**

- [ ] `lib/editor.ts`, `components/controls/layers.tsx`, `E/editor.tsx`, the harness — **DW-187, DW-189.**
  - `isSiteFooter(designId)` names the `a3/` prefix once.
  - `landWithin(footers, from, to)` clamps a site-wide move into its band: headers and bars first, footers last. A page
    doc is unchanged.
  - `LayerRow.footer` is set in `rowsOf`. The clamp is called by Layers' `dragTo` (the dashed slot), the ⌥-arrows (at
    the band's end the key does nothing), `gripMove`, and `moveTo` — the one door every commit passes.
  - `onPlace` inserts a site-wide non-footer before the first footer. The site doc is then always stored in canvas
    order, so `screenRows`' tops rise in order.
  - The harness gains a stand-in footer, harness-only, reached by a request header the way the harness's other fixtures
    are, and never in `packages/library` (the first real footer is Story 9.9's).
  - **Controls:**
    - an `editor.test.ts` case beside `:121`: every from/to over made-up site docs leaves the doc equal to
      `canvasStack` — red unclamped;
    - a journey stop: ⌥↑ on the stand-in footer stays below the header;
    - a `floor.spec.mjs` stop: the footer's grip dragged to the top, and the slot stays in the footer band.
- [ ] `components/controls/layers.tsx`, `E/editor.tsx`, `run-verify-editor.cjs` and `run-verify-lock.cjs` (the parks) —
  **R-217 (DW-188).**
  - A row's `onPointerEnter`/`onPointerLeave` (not touch) call `point({ …, via: 'layers' })`.
  - A Layers-sourced hover draws the section's outline and name tag, with no pill, no `data-inflozo-insert` hairline and
    never a scroll. Ghost rows may reuse `pointGhost`.
  - Keyboard focus keeps D8e's ring only.
  - The comment at `layers.tsx:81-82` is rewritten.
  - The walks' pointer parks move off the rows.
  - **Control:** a `floor.spec.mjs` stop with the canvas at the top:
    - over the first row → one `[data-chrome="hover"]` over its section;
    - over a row whose section is below the fold → `scrollY` unchanged after 600 ms and no `[data-section-pill]`;
    - away → none.
    - Red at HEAD.
- [ ] `components/kit/layers-row.tsx`, `E/editor.tsx` (`rowsOf`, `railRows`), `epics.md` — **DW-281.**
  - `LayerThumb` takes a glyph per category: a1 Header, a4 Hero, a17 Post Grid, a22 Newsletter and a3 Footer, drawn as
    `S4 Editor.dc.html:54-58` draws them at 30×21. Every other category, the fixtures and the Ghost rows get Hero.
  - The rail draws D8a's 34×24 (`:66-70`) and D8b's 26×19 (`:196-200`).
  - The selected tile's thumb border takes D8's tint (`:67`, `:197`) from the token layer's nearest value
    (`--color-coral-tint-strong`), never a new hex. The S4 Footer's `#3B382F` likewise maps to the nearest ink token.
  - `LayerRow` and `RailItem` carry `category`.
  - Epic 9's and Epic 10's preambles gain one line: "a category's first story adds its Layers picture, extrapolated from
    S4 and D8's five (R-74); A1, A3, A4, A17 and A22 have theirs (Story 5.24e), and A2's nearest is B7's announcement
    glyph".
  - **Control:** a journey stop at 1440 (rows) and at 1024 (rail). Each thumb's `data-glyph` matches the harness's
    names. Red at HEAD.
- [ ] `lib/canvas-layer.ts:117-120` — **DW-256.** The host's style adds `--tw-inset-shadow`, `--tw-inset-ring-shadow`,
  `--tw-ring-offset-shadow` and `--tw-ring-shadow`, each `0 0 #0000`, and its comment says why. **Control:** DW-182's
  journey (`:1161-1208`): the limit note's computed `box-shadow` is not `none`. A `shadow-md` probe in the editor's own
  document computes one, which is the stop's control.
- [ ] `lib/canvas-layer.ts`, `E/editor.tsx:3663-3678`, `tools/perf/fps-trace.mjs` — **DW-290.**
  - `prepareChrome(doc)` (`addFonts` and `sheetFor`) is exported; `chromeLayers` calls it.
  - An effect on `paints` schedules it with `requestIdleCallback ?? (fn => setTimeout(fn, 1))`. It adds nothing to the
    DOM.
  - `fps-trace.mjs` gains a measure around the first pick, taken after the faces load.
  - **Control:** a journey stop — after the paint and before any gesture, the canvas's `document.fonts` holds the
    `inflozo-chrome` faces, with zero chrome hosts. Red at HEAD.
  - By hand, at 4×: the first selection's long task, before and after, recorded. The fix is expected under 5.23b's
    248–255 ms and near the 141–149 ms measured with the faces left out; the Controls panel's first mount stays. Not a
    gate (NFR-1).
- [ ] `E/editor-skeleton.tsx` — **DW-199.**
  - The ground gains `@container-size coarse:pb-[52px]`.
  - The card becomes `w-[min(100cqw,100cqh*1440/900,1440px)] aspect-[1440/900]`, with `data-skeleton-card`. This also
    closes the missing 1440 cap and the touch padding.
  - **Control:** a `floor.spec.mjs` stop at 1440×600 and 2560×1440, with 1440×900 as its control. A context with
    JavaScript off reads the server's skeleton; one with it on reads the real card. They must be equal within 1 px. Red
    at HEAD.
- [ ] `lib/` (one announcer hook), `E/editor.tsx` (`said`, `announced`), `item-list.tsx:66`, `data-group.tsx:259`,
  `controls/review.tsx:88` — **DW-205.**
  - The state is `{ words, n }`; `set(w)` bumps `n`; the region renders `<span key={n}>{words}</span>`. This is the
    technique React Aria's LiveAnnouncer and react-aria-live document.
  - All five regions use it.
  - **Control:** the ⌘D journey (`:291-315`) — the second identical ⌘D adds one node to `#editor-said`. Red at HEAD.
- [ ] `lib/behaviours.ts`, `behaviours.test.ts`, `E/editor.tsx` (the chips, the Controls panel) — **DW-226, DW-229.**
  - `movesByItself(declaration, width)` is false when a width is declared and `width >= below`, which is core's own
    `(width < Npx)`. The chips pass `device.width`, which joins the memo's dependencies.
  - An sr-only line in the Controls panel while the selected root has a chip, in 5.24a's words (routine call 6): "PAUSED
    — this part moves by itself on your site; it holds still while you design, and Preview runs it".
  - **Controls:**
    - `behaviours.test.ts` (rewritten `:21-27`), red at HEAD.
    - R-175's journey (`:1570-1667`): `.cx` (the fixture's `marquee`) carries the sentence once and the Rail none; with
      `data-module="marquee:768"` there is no chip at Desktop and one after `3`.
    - The first real part is Story 9.1's `header-scroll`.

**Execution — panels, the picker, paste, media:**

- [ ] `apps/web/public/orbit-weekly/media/` (new), `lib/style-guide.ts`, `lib/canvas.ts`, `proxy.ts:101`, the tests —
  **DW-102.**
  - Generate, in-house, every `/media/` name `corpus.json` uses: video with GStreamer's `videotestsrc pattern=ball` →
    x264 constrained-baseline → `mp4mux faststart=true`; audio with a `sine` → `lamemp3enc`. The commands go in a
    comment.
  - `withImages` gains the `/media/` → `/orbit-weekly/media/` swap.
  - The canvas uses the same mapping in place of `withoutMedia` — one treatment of the URL.
  - The proxy matcher gains `orbit-weekly/`.
  - **Controls:**
    - a sibling of `style-guide.test.ts:61-69`: every corpus `/media/` name exists under `public/orbit-weekly/media/`, and
      no document keeps `orbit-weekly.example/media/`;
    - `paywall.test.ts:214-228` becomes "its media is same-origin";
    - `routing.test.ts` is red until the matcher lists the folder.
    - Review: a ranged GET answers 206, and the editor walk's zero-CSP check holds.
- [ ] `packages/section-runtime/src/marks.ts`, `marks.test.ts` — **DW-181.**
  - `MarkNode` gains an optional `style` (`fontWeight`, `fontStyle`, `textDecoration`). `DOMParser` and jsdom both carry
    it (executed).
  - `ownMarks(c)` beside `TAG_MARKS`:
    - the tag's mark, unless the element's own weight is set and not heavy, or its own `font-style` is `normal`;
    - plus `strong` for `bold`/`bolder`/≥600 (CKEditor 5's rule; ≥500 would bold a web page's computed 500);
    - `em` for `italic`;
    - `u` for `underline` in the decoration.
  - `:636` and `:644` push every allowed mark. Still only the four.
  - `ponytail:` a child's `font-weight:400` does not clear a parent's bold. Google Docs' wrapper cancels itself.
  - **Control:** two cases, red at HEAD:
    - Google Docs' shape, cited from ProseMirror, CKEditor 5 and Lexical (whole-paste bold at HEAD);
    - the `font-weight:normal` wrapper alone stays unmarked, and 600, 700 and `bold` are strong while 400, 500 and
      `normal` are not.
  - The owner's paste on the deployed site is the execution against Google Docs itself.
- [ ] `components/controls/sidebar.tsx`, its three callers, `packages/section-runtime/src/doc-edit.ts`,
  `P/settings/actions.ts` — **DW-198.**
  - `SidebarProps.swatches` becomes `Record<Mode, Record<string, string>>` and `mode` is **required**, so the typecheck
    finds a caller that forgets it. `control()` passes `swatches[mode]`.
  - The callers:
    - the editor passes the record whole;
    - `/pilots` passes both and `mode={mode}`, so a change made while previewing dark there becomes a dark override, as
      in the editor;
    - `/controls` passes both and `mode="light"`.
  - `clearProject(docs)` beside `clearDarkOverrides` returns only the changed docs. The action calls it.
  - **Controls:**
    - a journey stop compares each Background-role dot with the canvas's token (through `ROLE_TOKENS`, colours normalised
      by a probe element) before and after `.` — red with `editor.tsx:5070` as `swatches.light`;
    - a two-canvas `clearProject` unit test — red at HEAD.
- [ ] `components/editor/section-picker.tsx`, `E/editor.tsx:5296`, the harness — **DW-207.**
  - `chosen = searching ? '' : category` feeds the title, `on` and `tabStop`. A rail row ends a search.
  - `onBrowse` (search change and rail choice) clears the refusal.
  - The `<dialog>`'s `onKeyDown` takes ⌘K by `shortcutFor`, then focuses and selects `#picker-search`.
  - The harness's library map gains a stand-in `a25/1` (`pilot('a24/1')` re-id'd, `category: 'a25'`) so R-37's refusal
    is reachable.
  - **Controls:** three keyboard stops, each red at HEAD:
    - the refusal clears on typing;
    - a category, then typing — **All sections** is `aria-checked`;
    - ⌘K in the search — the selection runs from 0 to the end of the text.
- [ ] `lib/ring.ts`, `components/controls/item-list.tsx`, `ring.test.ts`, `run-verify-controls.cjs:571-573` —
  **R-218 (DW-212).**
  - `shownInThisDesign(count, shown, min?, max?)` appends ` · {min}–{max}` when both are known; `item-list.tsx:106`
    passes `list.min` and `list.max`.
  - The comments change, and so does the walk's assertion, to `/^3 items · 2 shown in this design · 2–6$/`.
  - **Control:** `shownInThisDesign(3, 2, 2, 6) === '3 items · 2 shown in this design · 2–6'`, red at HEAD.
- [ ] `components/controls/sidebar.tsx:464-465` — **DW-282.** The keys become `read-prop-…` and `read-control-…`.
  **Control:** a journey stop that collects `console` errors matching `/Encountered two children with the same key/`,
  selects the Inline Row and expects none. Red at HEAD.

**Execution — the two checks:**

- [ ] `tools/probe/check-schemas-off-rest.py` (new), `ci.yml` (`rls`), `run-verify-ghost-admin.py`, the propagation
  files, `tools/doc-audit.py` — **DW-302.**
  - The script is stdlib only. `check(url, key, unexposed, exposed)` is `schemas-off-rest`'s assertion moved unchanged:
    - three schemas answer 406 `PGRST106`;
    - the exposed pair answers 404 `PGRST205`;
    - the hint names exactly `public, graphql_public`.
  - `from_vercel()` reads only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (the env list, then two by-id GETs).
  - `__main__` uses the environment when both are set, otherwise Vercel. It prints one line, never a value, and exits
    0 or 1. It fails closed: "could not ask" is told apart from "exposed".
  - The `rls` job runs it after the gate, with the three Vercel secrets. R-116 holds: `deploy`'s `needs` stays
    `[check, rls]`.
  - `schemas-off-rest` calls the script (one copy of the rule).
  - The propagation list in the Code Map is updated, with a catalogue row for the script and `doc-audit.py:897-899`'s
    control corrected.
  - **Controls (planted, each FAIL):** `graphql_public` in the must-be-unexposed list; `public` alone expected; a wrong
    project id. CI on the Dev push: the `rls` log carries the PASS line.
- [ ] `apps/web/app/(app)/app/harness/connect/page.tsx` (new), `app-routes.test.ts:55-59`, `run-verify-editor.cjs:6101`,
  `connect-wizard.tsx:133-135`, `journey.spec.mjs`, `doc-audit.py:1168` — **DW-303.**
  - The page is `if (!HARNESS) notFound(); return <ConnectWizard step="keys" />`, as `harness/error/page.tsx` is.
  - `HARNESS_ONLY` and step 79's list gain it.
  - The stop:
    - routes `https://harness-ghost.example/ghost/api/content/settings/**` to a 200 with CORS;
    - aborts the page's own POST;
    - waits for `next-route-announcer` (hydrated);
    - fills the three fields;
    - presses Enter on Connect;
    - awaits a POST carrying `next-action` (15 s).
  - **Control:** red with `alive.current = true` (`:138`) removed — "Connecting…" stays. Executed red and green.

**Execution — the main session (Ask First):**

- [ ] **DW-278's recording**, on the owner's go in the Dev session: `record-ghost-surfaces.cjs` steps through the five
  presets on T1 and T3, then puts each site back and reads it back (T3's `icon-5`, T1's `null`, `portal_button` false).

**Execution — the close:**

- [ ] **`deferred-work.md`.** Every entry whose evidence exists closes. DW-304, DW-305 and DW-306 (written at this
  Create) stay open with their owners. DW-300's resolution corrects its helper wording.
- [ ] **The documents** (standing rule 3), each change dated and citing its ruling:
  - `prd.md`:
    - FR-D10's states and Appendix H's "the only five" (R-213);
    - FR-C2's default (R-215; its Story 5.21 note);
    - FR-H5's stale "absent from Layers";
    - FR-H6's panel line (R-216);
    - FR-D13's sentence (R-218).
  - `EXPERIENCE.md`:
    - `:146` Layers (R-217);
    - `:158`, `:317`, `:372-373`, `:551`, `:755` (the sixth state);
    - `:163` Ghost's Own Surfaces (R-215);
    - `:833` (the default).
  - `addendum.md`'s lock timings: `LEAVE_GRACE_MS`.
  - The register: R-213–R-218's "⬜ built" targets become ✅ with this story's Dev.
  - `epics.md`:
    - Story 5.11's card (`:1927`), a dated note: R-218;
    - the Epic 9 and Epic 10 preamble lines (DW-281).
  - `MEASUREMENTS.md`, a section each:
    - the NQL term grammar;
    - the slugify finding;
    - `include=tiers`;
    - the lock's leave;
    - DW-302's CI wiring;
    - DW-278's icons;
    - §15g's version, corrected by a dated note.
- [ ] **The registers.** `epic-5-context.md` gains this story's Dev sub-bullet.
- [ ] **Standing rule 7.** Grep for:
  - `stillAsking`, `SELF_MARK`, `selfMarkScript`, `withoutMedia`, `slugShaped`'s old pattern;
  - `'Retrying'` alone where `signed-out` must follow;
  - `swatches.light`, `read-${`;
  - the old FR-D13 sentence;
  - `defaulting to *on*`;
  - every DW id this story touched.
- [ ] **The gates.** All green, every new check seen red on its control first:
  - `pnpm check` (Node 24);
  - `pnpm keyboard`;
  - `bash supabase/tests/run-rls-gate.sh`;
  - `node tools/check-traces.mjs` after `pnpm build`;
  - `python3 tools/doc-audit.py --check`, twice.

**Acceptance Criteria:**

- **The group.**
  - *Given* Group E re-derived at HEAD,
  - *when* this story is done,
  - *then* every entry is closed by a change whose control was seen red with the change reverted, and its
    `resolution:` names that evidence;
  - *and* DW-304, DW-305 and DW-306 are open, each named in its owner's card, and no entry was deleted or renumbered.
- **The rulings.**
  - *Given* R-213 to R-218,
  - *when* each one's line is removed,
  - *then* its stop goes red;
  - *and* FR-D10, FR-C2, FR-H6, FR-D13 and EXPERIENCE.md say what was built, and the register's targets are ticked.
- **The frames (R-74).**
  - *Given* each touched surface,
  - *when* it is opened on the deployed build,
  - *then* it **matches its frame**:
    - Layers' pictures — `S4 Editor.dc.html:54-58`, `D8 Editor Below 1440.dc.html:66-70` and `:196-200`;
    - the row-driven hover — S4b's outline (`S4 Editor.dc.html:181`, extrapolated);
    - the site-wide group — B7 (`B Missing Surfaces.dc.html:1538-1581`);
    - the Section Picker — `S5 Section Picker.dc.html` S5a (`:25`, `:34`, `:40`);
    - the save state's sixth — B6 (`B Missing Surfaces.dc.html:1351-1388`, extrapolated);
    - the sign-out ask — B5c (`:1516-1535`, extrapolated);
    - the lock's surfaces — B5a (`:1469`), B5b (`:1491`);
    - the preview subject — B9 and D5e (`D5 Canvas Markers and Template Switcher.dc.html:189-217`);
    - the Paywall — `C Post Body.dc.html` C3a (`:1423-1472`) and C3b's chip (`:1653`);
    - the style-guide article — C4 (`:1686`);
    - the capped list's header — `P0-3 Item List Controls.dc.html` (`:101`, `:105`, `:117`, extrapolated);
    - the canvas pill's shadow — `P0-1 Inline Text Toolbar.dc.html:142`;
    - the skeleton — S4a's card;
    - PAUSED — B3a (`B Missing Surfaces.dc.html:637-681`);
    - Ghost's floating button — Ghost's own look (`MEASUREMENTS.md` §55 and DW-278's recording).
- **Accessibility.** *Given* the editor, Projects with the sign-out ask open, `/style-guide` and `/controls`, *when*
  axe runs at 1440, 834 and 390, *then* it finds zero violations.
- **R-98.** *Given* the sign-out ask, *when* **Sign out anyway** is pressed, *then* it reads "Signing out…" and is
  `aria-disabled` and `aria-busy` (never `disabled`) until the sign-out lands; `busy.test.ts` is green.
- **The gates.**
  - *Given* `pnpm check`, `pnpm keyboard`, the RLS gate, the trace check and the documentation gate,
  - *when* the Dev push is built,
  - *then* all are green and CI's `rls` log shows DW-302's PASS;
  - *and* the deployed editor, lock, live-content and controls walks pass with no `FAIL`.
- **The owner's test (R-80).** *Given* the deployed build, *when* the owner follows § Owner's manual test, *then* each
  step shows what it says.

## Spec Change Log

*Empty until the first review loop.*

## Design Notes

**One question is the owner's.** Question 1 sets two of his rulings against each other in one case (standing rule 6).
Every other call below is technical or already ruled, so it is stated here in one line each.

**Routine calls made here.**

1. **Three findings are re-homed, not built here.**
   - **DW-304** is R-213's tail, Story 7.18's. R-213 is limited to "a refusal that signing in cures". A 404 (the project
     deleted, or this browser now another account's) or a 400/422 needs a sentence nobody has ruled. 7.18's pre-deploy
     flush meets the same refusal, and its Create asks for that sentence.
   - **DW-305** is R-216's gap, Story 9.1's. Portal blocks every sign-up on an invite-only site, paid ones too, and no
     Sites sentence says so. A1's free-member upgrade ask (`account/plans`) is the first paid ask a design can carry.
   - **DW-306** is the head band's order, Story 9.5's. With DW-187's clamp, a bar may sit below the header. The
     inventory calls A2 "above header", so A2's first story decides it.
2. **DW-187's rule is 5.24a's routine call 2.** A site-wide move stays inside its band, so Layers' order is the page's.
   It also covers ⌥-arrows and placement, which the plan missed.
3. **R-214 sends owed records without `session`.** The route's ABSENT branch refuses nothing and the revision CAS
   guards, so the same browser's open editor later answers 200 from the already-stored check. Acquiring the lock per
   record would refuse exactly that window. The cross-device ceiling is marked with `ponytail:`.
4. **DW-243's replaced asker keeps "Asking…"** and hears the holder's one answer. It needs no new words, and every
   sentence stays true (R-191 already accepts that a third device is not v1's shape).
5. **The R-214 ask's words are derived from B5c** (R-170, R-74). The owner sees them in his test, step 17. A finding
   there is fixed inside this story (R-80).
6. **R-215 reads "the site shows it" as Ghost's own rules.** That is `isFilled` for the bar, and `portal_button` on
   with sign-up not Nobody for the button (Portal's `isSigninAllowed`). The ruling's title says "only when the site
   shows it".
7. **DW-102 puts the media in `public/`**, not `packages/`. A static file answers byte ranges (Safari asks for them)
   and needs no trace entry. The canvas drops `withoutMedia`, since 5.20's reason (a refused host) is gone.
8. **DW-181 bolds at 600**, CKEditor 5's rule. ProseMirror's 500 would bold a web page's computed `font-weight: 500`
   (executed in Chromium). The clipboard shapes of Word Online and Apple Notes are not cited anywhere public. The
   owner's paste is the execution against Google Docs, and the rest are optional rows marked as hypotheses.
9. **DW-258's source read settles it** (standing rule 1 accepts "read in its source", and the source was executed). No
   T1 write.
10. **DW-283 is whole or absent**, as 5.22's NOT A PAGE SECTION chip was. C3b's card says the same at every width.

**Where 5.24a's plan was wrong at HEAD.**

- **DW-203:** the two-tab half was **not** closed by the edit lock. 5.24a's Question 4 told the owner it was, and the
  register's R-214 says so; both are corrected by a dated note at this Create.
- **R-213:** the editor's own server actions redirect a signed-out tab to `/sign-in`, and the plan did not see it.
  Step 14 of the plan's owner test cannot show R-213's sentence after a same-browser sign-out (Question 1). Its step 15
  needs an account menu the editor does not have.
- **DW-242:** already fixed by Story 5.22's gate, and the self mark is dead code.
- **DW-240:** the client held no beat to filter on. Hand over must keep its DELETE. A closed tab needs the edge poll,
  or it frees up to grace + 15 s late. The plan's "within a few seconds" (step 11) was never true across windows: the
  wait is one check-in, about 15 s.
- **DW-241:** the Reset box does not close at HEAD, and Site Remix closes only by remount.
- **DW-250:** Home never took two rounds. A stored Tag or Author took three.
- **DW-258:** both grammars were wrong (unidecode's Latin-1 bug; imports keep `--`).
- **DW-259:** picks past 100 are also called "unpublished or deleted".
- **DW-270:** no re-record is needed. The reads are the visitor-checked ones, not `INCLUDE.posts`.
- **DW-300:** bare helpers are never offered at any version; FR-H7 decides the rest.
- **DW-275:** no new route — a query on the canvas route.
- **DW-277:** the Sites question's primary flips with the default.
- **DW-278:** the presets must be recorded (`tokens.test.ts:190`), and T3 has stored `icon-5` since 2026-09-26.
- **DW-102:** the "no encoder" reason is stale; the data-URI route cannot carry media under the CSP.
- **DW-198:** the callers pick the swatches, and `/pilots` never passes `mode`.
- **DW-207:** no fixture files are needed, and "click a card" would place the card.
- **R-218:** FR-D13 and Story 5.11's card keep the old sentence, and the ruling's targets miss FR-D13.
- **DW-187:** placement and ⌥-arrows reach the same state as a drag.
- **R-217:** the walks' pointer parks land on rows.
- **DW-199:** it also covers large screens and touch padding.
- **DW-205:** four more regions have the same fault.
- **DW-226:** it needs `device.width` in the memo.
- **DW-290:** the Controls panel's first mount remains.

**Known ceilings, stated for the owner's test.**

- A signed-out holder's beat answers 401, so its lock goes stale. If the project is opened elsewhere before this tab
  sends, this tab is displaced and B5c's rule applies.
- After **Sign in**, the new tab lands on Projects. Go back to the editor tab rather than reopen the project there.

## Questions for the owner

One question is open. Dev may build everything else first; the Dev commit waits for your answer.

### Question 1 — Signed out in another tab of this browser: what should the editor's message say? (R-213 and R-214)

**In plain English.** Two of your rulings meet in one case.
- **R-213** gives the editor a signed-out message: "You've been signed out. Your work is safe on this device — sign in
  again and it will be sent."
- **R-214** makes signing out erase this browser's copy of your work, after first sending it.

So if you sign out in another tab of the same browser while the editor is still open, that editor has no copy on the
computer any more. Anything you type in it afterwards lives only in the open tab, and "safe on this device" would not be
true. The save message's own rule is never to say "on this device" when the device holds nothing (B6, FR-D10).

**An example.** The editor is open in one tab. In a second tab you open Projects and sign out: your work is sent
first, then this browser's copy is erased. You go back to the editor tab and type a word. The editor cannot send it,
because you are signed out. It cannot keep it on the computer, because the copy is gone. The word lives only in that
open tab until you sign in again.

1. **A second sentence for that one case (RECOMMENDED).** "You've been signed out. Your latest changes have not
   reached the cloud yet — keep this tab open, sign in again and they will be sent."
   - Same red panel, same **Sign in** button.
   - Your sentence stays for every other case: signed out on another device, or the sign-in simply running out.
2. **Keep your one sentence, and make it true.** The open editor writes this browser's copy again after the sign-out
   erased it. Your work would then stay on this computer after you signed out, which is what R-214 exists to stop.
3. **One sentence for every case.** "You've been signed out. Sign in again and your work will be sent." This drops
   "safe on this device" everywhere, including where it is true.

**Ruled:** _(awaiting the owner)_

## Owner's manual test

Do this on the real site after Deploy, in Chrome on a desktop about 1440 wide, signed in as yourself. Two projects are
used, as they stood on production at this Create (read-only, 2026-10-02):
- **Pilot sections**: a hero, a post grid and a header, with no site linked.
- **Ghost 5 Project**: newsletters, two post grids, a hero and a header, linked to ghost5.

Where a step changes something in Ghost Admin or Inflozo, it says how to put it back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Ghost 5 Project, Home | Look at the small picture at the start of each Layers row. | — | Each kind of section has its own picture: the header, the newsletters, the post grids and the hero differ. Before, every row had the same one. |
| 2 | same, window narrowed to about 1000 wide | the tile strip that replaces Layers | Look at the tiles, then click one. | — | The tiles show the same per-kind pictures, and the chosen tile's picture gets a tinted edge. |
| 3 | same, full width | Ghost 5 Project, Home | Scroll the page to the top. Rest the pointer on the first **Newsletter** row in Layers. Then rest it on the last **Newsletter** row (the page's own last section). Then click that row. | — | The first: its section gets the thin coral outline and name tag, and no floating toolbar. The last: the page does not move. The click scrolls it into view. |
| 4 | same | Ghost 5 Project, Home | Select the first Newsletter section and click into its blurb text on the page. Paste a line copied from a Google Doc. Then press ⌘Z. | a Google Doc line with one **bold** and one *italic* word | The bold word stays bold, the italic word stays italic, and the rest is plain. ⌘Z takes the paste away. |
| 5 | same | Section Picker | Press ⌘K. Click **Headers** in the left list, then type in the search. Press Tab twice, then ⌘K. | `grid` | While you search, **All sections** is the marked row. The second ⌘K puts the cursor back in the search with `grid` selected. |
| 6 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f/post` | Ghost 5 Project, Post | Open the **Previewing with** pill at the foot, choose a different article, and reload at once (⌘R). | — | After the reload the page still shows the article you chose. |
| 7 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Ghost 5 Project, Home | Look at **From your Ghost site** at the foot of Layers. | — | Only **Announcement bar**. ghost5's floating Subscribe button is off, so it is not listed. |
| 8 | `https://ghost5.inflozo.com/ghost/`, then step 7's URL | Ghost Admin → Settings → Membership → Portal, then the editor | Switch the portal button on and save. Reopen the Ghost 5 Project's Home. Afterwards switch it off again. | — | **Subscribe button** is listed again. The floating button, bottom right of the page, wears ghost5's chosen icon, not the plain person. |
| 9 | `https://ghost5.inflozo.com/ghost/`, then step 7's URL | Ghost Admin → Settings → Membership → Subscription access, then the editor | Choose **Only people I invite** and save. Reopen the Ghost 5 Project's Home and select the first Newsletter section. Afterwards set it back to **Anyone can sign up**. | — | The section's settings say: "Only people you invite can join ghost5.inflozo.com, so free sign-up forms show nothing there." — the Sites screen's own sentence. |
| 10 | `https://app.inflozo.com/style-guide` | Style guide | Scroll to the audio card and a video card; press play on each. | — | The audio plays a short tone and the video a short clip. Before, nothing played. |
| 11 | `https://app.inflozo.com/controls` | Controls | Press ▶ beside **1 of 3** once, then open **Content**. | — | The Features list's header reads "3 items · 2 shown in this design · 2–6". |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` in two windows side by side (⌘N) | Pilot sections, Home | Window A is editing; B shows the grey reading-along bar. Reload A about ten times, a few seconds apart. | — | A keeps editing every time, and B keeps reading along. |
| 13 | same | Pilot sections | In A, hide one section (its ⋯ → Hide) and straight away close A's tab. Wait. Afterwards show the section again. | — | Within about fifteen seconds B can edit, and the section is hidden in B. |
| 14 | same, A editing again | Pilot sections | In A press ⌘K. In B press **Request editing**, wait for **Take over**, and press it. | — | A's Section Picker closes by itself as A turns read-only, and its controls grey out. |
| 15 | Chrome: step 12's URL; another browser (Safari or Firefox): `https://app.inflozo.com/account` | the editor in Chrome, Account in the other browser | In the other browser, sign in and press **Sign out everywhere**. In Chrome, add one word to the post grid's title and press ⌘S. Press **Sign in** in the red panel, sign in in the new tab, then come back to the editor tab. Afterwards delete the word. | one word | "You've been signed out. Your work is safe on this device — sign in again and it will be sent." with **Sign in**. Back in the editor tab the save mark turns green, and a reload keeps the word. |
| 16 | step 12's URL, plus `https://app.inflozo.com/` in a second tab of the same browser | the editor, then Projects | In the second tab, sign out (avatar → **Sign out**). Back in the editor tab, add one word to the title. Then press **Sign in** and sign in. | one word | The sentence you rule in Question 1. After you sign in, the word is sent. |
| 17 | window A: step 12's URL; window B: `https://app.inflozo.com/` | the editor and Projects, side by side | In B, switch autosave off (Account → Saving), go back to Projects, and reload A. Add one word to A's title. Turn Wi-Fi off. In B: avatar → **Sign out**, then press **Wait**. Turn Wi-Fi on and sign out again in B. Close window A. Sign in and open Pilot sections. Afterwards delete the word and switch autosave back on. | one word | The first time: "Sign out with unsent work?", "1 unsynced edit will be lost", "Signing out erases this browser's copy.", with the focus on **Wait**. The second time there is no question, and you are signed out. After signing in, the word is there. |
| 18 | `https://ghost5.inflozo.com/ghost/`, then step 6's URL | Ghost Admin → a post → Post settings → Post access, then the editor | Set one post's access to **Specific tier(s)** with the paid tier, and Update. In **Previewing with**, choose that post. Set **View as** to Paid member, then Free member. Afterwards put the post's access back. | — | Paid member: the whole article, no cut. Free member: cut at the line. |
| 19 | Pilot sections → **Template ▾ → Template surfaces → Paywall** | Paywall canvas | Open it. | — | Ghost's own box looks exactly as before. |
| 20 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Pilot sections, Home | Select the hero and click the post's title on the page. | — | The small "… — set in Ghost" pill has a soft shadow under it. |

## Verification

**Commands** (Node 24: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`):

- The group, re-derived at HEAD from each entry's living owners. Expected: § The triage's list.
  `python3 -c "import re, importlib.util as u; s=u.spec_from_file_location('b','tools/story-board.py'); b=u.module_from_spec(s); s.loader.exec_module(b); d=b.load_deferred(open('_bmad-output/implementation-artifacts/deferred-work.md').read()); print(sorted((x['id'] for x in d if not b.dw_closed(x) and '5.24e' in b.story_refs(re.sub(r'\*\(.*?\)\*', '', x.get('owner') or '', flags=re.S))), key=lambda i: int(i[3:])))"`
- `pnpm check`. Expected: exit 0, with the new unit tests among them.
- `pnpm keyboard`. Expected: every journey and floor stop green, the new ones included.
- `pnpm build && node tools/check-traces.mjs`. Expected: exit 0, with the sync route's trace held.
- `bash supabase/tests/run-rls-gate.sh`. Expected: exit 0.
- `env $(grep -E '^SUPABASE_(URL|PUBLISHABLE_KEY)=' tools/probe/.env | xargs) python3 tools/probe/check-schemas-off-rest.py`,
  then the same with only `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` set (from `VERCEL_TEAM_ID` and
  `VERCEL_PROJECT`). Expected: PASS twice; each planted list FAILs.
- `python3 tools/probe/run-verify-ghost-admin.py --check`. Expected: `schemas-off-rest` PASS through the script.
- `cd tools/stress && node build.js && node gate.js theme`, with a scratch stress section emitting `tag:'café'`.
  Expected: 0 errors and 0 warnings on both majors. Its `node_modules` is root-owned: run it directly, after a root
  `pnpm install`.
- By hand: `node tools/perf/fps-trace.mjs` at 4× on a production harness build, before and after. Expected: the first
  selection's long task recorded, under 5.23b's 248–255 ms.
- `python3 tools/doc-audit.py --check`, twice. Expected: green.

**After the push, on the deployed build:**
- CI: `check`, `rls` (with DW-302's PASS line) and `deploy` succeed, read with `GITHUB_TOKEN` by name.
- The deployment is READY on Vercel (`VERCEL_TOKEN`).
- The walks, each with 0 FAIL:
  - `node tools/probe/run-verify-editor.cjs`;
  - `run-verify-lock.cjs`;
  - `run-verify-controls.cjs`;
  - `run-verify-live-content.cjs` — `NO_429=1` first on both majors, then the 429 step alone, said first (Ask First).
- axe at 1440, 834 and 390 on the editor, Projects with the sign-out ask, `/style-guide` and `/controls`. Expected: zero
  violations.

**Real services:**
- `app.inflozo.com`, through the editor, lock, live-content and controls walks.
- Supabase: the lock rows, View-as rows and owed edits read back, the session ended by Sign out everywhere, and DW-302's
  five GETs.
- Vercel's API: DW-302's narrow read and the deployment state.
- GitHub's API: the CI runs.
- T1 and T3: reads for DW-248, DW-258 and DW-270, and DW-278's recording — writes, on the owner's in-session go.
