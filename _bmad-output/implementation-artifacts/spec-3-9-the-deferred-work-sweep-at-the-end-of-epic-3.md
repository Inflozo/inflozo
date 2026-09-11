---
title: 'Story 3.9 — The deferred-work sweep at the end of Epic 3'
type: 'chore'
created: '2026-09-11'
status: 'in-review'
baseline_commit: 'f91501a6651847d08db17e1b4e2a5624e1209862'
owner_test: issues
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
# DW-89 was added (closed at Review). DW-67, DW-74, DW-79, DW-83 and DW-85 were REMOVED on
# 2026-09-11: the Review re-opened them with their proof owed, and this field is a closure
# INSTRUCTION — the format has the orchestrator write `status: done <date>` for every id named here,
# skipping only ids already done, so leaving them would close work whose proof is owed.
closes_deferred: [DW-3, DW-5, DW-6, DW-22, DW-16, DW-17, DW-18, DW-20, DW-21, DW-24, DW-26, DW-28, DW-31, DW-34, DW-35, DW-36, DW-37, DW-45, DW-53, DW-56, DW-61, DW-69, DW-72, DW-73, DW-80, DW-89]
---

## In plain English

Epics 1, 2 and 3 are built. Along the way, every review wrote down the things that were real but
were not that story's to fix — the ledger now holds a long list, and it has only ever grown.

This story is a clean-up. It goes through every open item, works out which ones we now know enough
to finish, and finishes those. **It deliberately does not touch anything that is waiting on work
that has not been built yet** — the billing epic, the section library, the deploy path. Those stay
on the list with a note saying which story owns them.

The visible part for you is small but real: **the six unbuilt links in the sidebar stop landing on
a bare browser error page and land inside Inflozo instead**, the API-keys screen's two identical
buttons stop sounding identical to a screen reader, and the browser tab finally shows a logo on
older Safari. The rest is plumbing — database rules that stop two things colliding, tests that
catch a mistake nobody would otherwise see, and two documents that had grown into unreadable walls
of text.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `deferred-work.md` carries **71 open entries**. That is not a failure — it is the
ledger doing its job, and standing rule 3 (*propagate, never localise*) is why every one of them
was written down instead of forgotten. But an entry that is closable and stays open costs twice:
it is re-read by every session, and it hides the entries that really are blocked. Epic 3 is the
right seam to drain it, because Epics 1–3 are the only epics that have produced entries, and the
entries whose named owner was "the next story to touch X" have run out of next stories inside
this epic — several name stories (1.3, 1.5, 2.2, 3.5, 3.6, 3.7) that are already **done**.

**Approach:** Triage every open entry against three questions, in order.

1. **Is it already resolved and the row simply stale?** Then close the row and prove it.
2. **Does closing it need a capability no epic has built yet?** Then leave it, and say which story
   owns it. *(Standing rule 6: flag, do not guess.)*
3. **Otherwise the answer is already written in the entry** — every one of these entries names its
   own fix — so do exactly that and nothing more.

The work that survives triage is grouped below by the change that closes it, not by entry number,
because several entries close on one change. **One migration**, pushed on its own before any code
that needs it (R-99), is the only schema work. Everything else is additive or a one-line change in
a file the entry already names.

**What this story is not:** it is not a refactor, not a redesign, and not an excuse to touch code
that works. Every group below names the check that must stay green.

## Boundaries & Constraints

**Always:**

- **An entry is closed only by a change that makes its claim false, and the change is executed.**
  Standing rule 2: a result whose control did not pass is not a result. Every group names what is
  re-run and what would go red if the change were reverted.
- **The migration goes first, alone, as its own `Schema` phase** (R-99). The code that depends on
  `23505` catching goes in the `Dev` phase after it, never in the same push.
- **A count is derived, never written down** (standing rule 4). This applies to the 404 copy that
  M9 draws with a literal number in it — see Question 3.
- **The export is not edited** (R-74). The in-shell not-found is extrapolated from `M9 404` using
  the app's own Kit, and the departures are recorded in the file's own house comment.
- **Every route this story adds carries its own skeleton or is listed as having none** (R-98), and
  every control that starts work says so.
- **Zero axe violations** at 1440, 834 and 390 on every surface this story renders.
- **Propagate, never localise** (standing rule 3): a closed entry's `status:` changes *and* the
  comment beside the code it governs is updated, and the propagation is grepped for at the end
  (standing rule 7).

**Ask First:**

- **The three questions below are the owner's and the Dev run stops at each until he has ruled.**
  Question 1 (the marketing content-security policy) changes a security posture; Question 2 is a
  sentence a customer reads; Question 3 is copy carrying a count.

**Never:**

- **No entry is closed by deleting it, and no entry's id is renumbered** — a declaration that
  references an id would be orphaned (`deferred-work-format.md`).
- **No entry that names an unbuilt capability is touched.** The list under *Deliberately left open*
  is part of this story's acceptance: getting it wrong in the other direction — closing an entry
  that is genuinely blocked — is worse than leaving one open.
- **`connectSite` is not refactored** (DW-59). Extracting a 300-line owner-tested server action's
  failure sequence is real work with real risk and its entry names a later story; it stays open.
- **No new dependency.** Every fix here is stdlib, an existing dependency, or a platform feature.
- **The frozen 2026-09-04 migration is not edited** (DW-8). New file, new constraints.

</frozen-after-approval>

## The triage

Every open entry in the ledger, and what this story does with it. **The ledger is the source; this
table is derived from it at Create time and must be re-derived at Dev if it has moved.**

### Closed by this story

| Group | Entries | The one change that closes them |
|---|---|---|
| **A — the branded not-found** | DW-17, DW-26, DW-67 *(page half)*, DW-74, DW-18 *(app half)* | An in-shell not-found plus a catch-all route under `(authed)` |
| **B — one migration** | DW-24, DW-45, DW-53, DW-69 | Four constraints the entries each name exactly |
| **C — named one-liners** | DW-3, DW-5, DW-6, DW-21, DW-35, DW-36, DW-37, DW-61, DW-83 | Each entry writes its own fix; do that |
| **D — the missing controls** | DW-16, DW-20, DW-28, DW-34, DW-79, DW-80, DW-85 | Four checks and one harness, all in existing patterns |
| **E — the two walls of prose** | DW-73 | Sub-bullets in the epic context, a subject line in the catalogue |
| **F — verify, then close** | DW-31, DW-56 | Both look already resolved; execute before believing it |
| **G — the owner's, all three ruled 2026-09-11** | DW-18 *(marketing half)*, DW-72, DW-22 | Questions 1–3 below, and the reading key he is creating |

### Deliberately left open, and by whom

**Waiting on a capability no epic has built.** DW-1, DW-2 (E4 — the first import across the
package boundary decides the entry point's shape) · DW-11, DW-15 (E6 — Appendix D is the owning
document for the twelve packs) · DW-23, DW-29, DW-39, DW-42 (E12 — billing) · DW-46, DW-47 (NFR-9's
Sentry) · DW-49, DW-50 (the next database password rotation, which is one change) · DW-51, DW-52,
DW-54, DW-77 (E7 — the deploy path is the first allowed Ghost write) · DW-60 (E7 and E11 — the two
buttons have nothing behind them) · DW-66, DW-71 (E4/E5/E9/E10 — nothing can be placed on a page
yet) · DW-75, DW-79's *one home* half (Story 7.20 — the first story to take a snapshot) · DW-87
(Story 9.1 — there is no library to check) · DW-88 (E11 — the starter chooser).

**Waiting on a decision that needs a real case.** DW-14 (a paid Supabase plan, and nothing asks
for it) · DW-40 (shortening `jwt_exp` trades against refresh traffic) · DW-55 (a Ghost under a
path — nobody has one, and "is `example.com/blog` a second site or a typo?" is better answered
with a customer in front of you) · DW-64 (a cooldown needs a figure, and 3.7 weighed it
deliberately) · DW-70 (S2c's chooser is owed a frame in the Claude Design project — a design
session, not a code change).

**Deliberately not worth the change.** DW-4 (the `.toString()` ban errs safe; narrow it the first
time it blocks real code) · DW-25 (the dashboard's blank first paint: the fix is a Suspense boundary
around the authed layout's own three reads, which changes the render shape of a shell the owner has
tested four times, for a cosmetic moment on a slow connection) · DW-27 (a × in the search field departs from the frame, and the
alternative is a copy decision better made when a story touches the dashboard's empty states) ·
DW-58 (a resolver check costs a round trip on every connect and Vercel's functions have little
behind a private address) · DW-65 (atomicity wants a second unprivileged SQL path, which is an
architectural addition) · DW-81, DW-82, DW-84 (each unreachable from the product, or a race a
customer has to work to reach).

**Cannot be closed from this repository.** DW-32 (1) and (2) (a post to a Server Function's build
generated action id, and a real AAGUID buffer captured from the owner's own device) · DW-41 (it
needs GoTrue to fail from the live site) · DW-68 (the control that would name the cause is the one
that cannot be driven; the first move — a harness sign-in against an arbitrary deployment URL —
belongs with the story that has a reason to read Vercel's runtime logs) · DW-86 (checking two
Ghost Admin wayfinding sentences means driving Ghost Admin's UI, and no credential here can).

**Rules rather than work.** DW-57 (the Sites card's layout is the owner's and later stories inherit
it) · DW-75's ledger half.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| An unbuilt nav destination | signed in, `GET /assets` | the app's own not-found **inside the shell** — sidebar, account menu and search still there — and HTTP **404** | none; the route is the handler |
| A route that exists but whose row is gone | `GET /sites/brand?site=<stranger's id>` | the same page, inside the shell, with the sentence inside `<main>` | status stays 200 on a route that has a skeleton — see DW-67's remaining half |
| Signed out | `GET /assets` with no session | the proxy's redirect to `/sign-in` wins; the not-found never renders | unchanged from today |
| Marketing host | `GET inflozo.com/nope` | unchanged by this story — Epic 14 draws M9 with the marketing nav | recorded, not built |
| Two creates racing for one slug | two `createProject` in the same millisecond | one succeeds; the other catches `23505` and retries with the next free slug | after 3 retries, the action's existing failure path |
| Two "Use your brand" presses racing | two `useBrand` in flight for one site | one project; the second catches `23505` and re-runs `brandTarget`, landing on the project the first made | as today for any other error |
| An audit row with a bad outcome | `insert … outcome = 'maybe'` | refused by the database, not by TypeScript | the constraint's own error |
| Purging a user named in `restored_by` | `DELETE /admin/users/{id}` | succeeds; the column goes null and the entitlement row survives | the purge's existing per-account log |
| A rolled-back credential store | the store fails inside `sql().begin()` | **no** row in `private.credential_audit` | the gate aborts if a row appears |
| Two passkeys both named "Passkey" | the account has two rows with one name | the two rename buttons and the two remove buttons carry the added date and are distinguishable | none |
| The sign-in card while the OS sheet is up | `passkeyPending` true | the dimmed contents are `inert` and `aria-hidden`; axe reports zero contrast violations | the ceremony is unchanged |
| Older Safari | Safari 18 opening any page | a tab icon renders, from `icon.png` | modern browsers keep taking `icon.svg` |
| A duplicated project after a new column lands | `projects` gains a column and `duplicateProject` is not updated | a test reads the migration's insert grant and goes **red** | the test names the column it found |

## Code Map

**Group A — the branded not-found.**

- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/M9 404.dc.html` — **the
  frame.** 404 numeral, the line *"This page shuffled itself out of existence."*, a second
  sentence carrying a **count** (Question 3), then two controls. It draws the **marketing** 404:
  marketing nav, *Take me home* and *Browse sections*. The in-shell surface is extrapolated from it
  (R-74) — same words, the app's Kit, and *Browse sections* is **absent** because no sections
  surface exists (UX-DR3).
- `apps/web/app/(app)/app/(authed)/` — where `not-found.tsx` goes, beside the group's existing
  boundary shape. `apps/web/app/(app)/app/error.tsx` (Story 1.5's Fix) is the sibling to copy from:
  it sits at the `/app` segment so it also catches a throw in the shell.
- `apps/web/components/shell/shell.tsx:345-405` — the shell the not-found must render **inside**;
  `<main>` at :404 is the landmark the sentence has to land in, which is the half DW-74's control
  was failing on.
- `tools/probe/run-verify-ghost-admin.py` — `rendered()` and the three steps that recognise
  not-found by matching Next's own string `could not be found`: `brand-none`, `brand-ownership` and
  the `?site=` forgery. **DW-67's `note:` is explicit — whoever closes it breaks these three and
  they will not say why.** They change in the same commit.
- `apps/web/proxy.ts:99` — the matcher; a catch-all under `(authed)` must not fight it.

**Group B — the migration.**

- `supabase/migrations/` — a **new** file; `20260904120000_complete_schema.sql` is frozen (DW-8).
- `…/architecture-Inflozo-2026-08-19/SCHEMA.sql:225` (`projects.slug`), `:234` + `:243`
  (`linked_site_id` and its plain index), `:602` (`entitlements.restored_by`, the one bare
  `references auth.users(id)`), `:767` (`private.credential_audit.outcome`, its three values in a
  comment only). SCHEMA.sql is **live** and grows into the cumulative picture; the gate diffs the
  two databases, not the two files.
- `…/RLS-TEST.sql` — **live**, and the gate refuses to run unless `supabase/tests/rls.sql` is a
  byte-identical copy of it. Edit the architecture original, then `cp` it across.
- `apps/web/lib/projects.ts` (`uniqueSlug`) ·
  `apps/web/app/(app)/app/(authed)/projects/actions.ts` (`createProject`, `duplicateProject`) ·
  `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`useBrand`, the read-then-write around
  `brandTarget`) — the four callers that learn to catch `23505`.

**Group C — the named one-liners.**

- `apps/web/package.json` (`@types/node@26.4.1` against a Node 24.x runtime; no `"type"`, which is
  the four MODULE_TYPELESS_PACKAGE_JSON lines) · `package.json:engines` and `.nvmrc` are the pin.
- `.github/workflows/ci.yml` — the `check` job; `ubuntu-latest` ships `python3` and `doc-audit.py`
  imports stdlib only (`os, re, sys, subprocess, html, datetime`).
- `…/VERIFY-AT-BUILD.md` — the external-facts register, each item with an owning epic; the
  Ghost(Pro) trial row is the shape a dated deadline takes here.
- `apps/web/app/icon.svg` · `apps/web/app/apple-icon.png` · `apps/web/proxy.ts:99` ·
  `apps/web/routing.test.ts:84` — the test **derives** the icon list from `readdirSync('app')`, so
  a new `icon.png` that is not in the matcher turns it red by itself.
- `apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx` (the two `aria-label`s and
  `addedLabel`) · `tools/probe/run-verify-passkeys.py` (`names()` and the two exact-match
  `waitForFunction`s) — they change together or the harness breaks.
- `apps/web/app/(app)/app/sign-in/sign-in-form.tsx` — the
  `passkeyPending ? 'pointer-events-none [&>*]:opacity-40' : ''` branch.
- `apps/web/components/kit/banner.tsx:66` — `<span>{children}</span>`, the slot four notice blocks
  and the passkey nudge put a `<form>` into.
- `apps/web/server/ghost-admin/index.ts` — `findSiteByAdminKeyId`'s `order by s.created_at desc`.

**Group D — the missing controls.**

- `tools/probe/run-verify-all.py` — the harness pattern, and `tools/doc-audit.py`'s `DOCS` list is
  where a **new** tool's catalogue row goes (`tools/` is inside `BASES`; a new file without a row
  fails the gate).
- `apps/web/app/(app)/app/(authed)/project-menu.tsx` · `new-project-sheet.tsx` ·
  `components/shell/shell.tsx` · `components/shell/account-menu.tsx` — the `open:` display variant
  and the `m-auto` dialog centring, the three browser-only invariants of DW-16.
- `apps/web/app/(app)/app/(authed)/projects/actions.ts` — `atCap`, `matchesName`, `copyName`,
  `uniqueSlug` are pure and tested; that the **actions consult them** is what nothing checks.
- `apps/web/app/(app)/app/(authed)/projects/actions.ts` (`duplicateProject`'s select list) against
  `supabase/migrations/*`'s `grant insert (…)` / `grant update (…)` on `projects` (SCHEMA.sql:1091,
  :1250) — DW-28's derivation.
- `apps/web/lib/connect-rule.ts` (`ORPHAN_SNAPSHOT_DAYS`) vs
  `supabase/migrations/20260907150000_account_deletion_window.sql` (`interval '90 days'`).
- `apps/web/app/(app)/app/error.tsx` (`<Lockup size={20} />`) — never rendered on a screen.

**Group E — the two walls.**

- `_bmad-output/implementation-artifacts/epic-3-context.md` — **31,549 characters**, and its
  longest single line is **4,528 characters**. `CLAUDE.md` sends every session here first.
- `tools/doc-audit.py:409-532` — the `run-verify-ghost-admin.py` catalogue row: **11,625
  characters** of one description, rendered into one `INDEX.md` table cell. The next longest row is
  4,402 (`run-verify-site-health.py`), then 3,467. GFM table cells accept `<br>`, and the
  **Document** column already uses it — so the generator needs no new mechanism.

**Group F — verify, then close.**

- `_bmad-output/implementation-artifacts/spec-1-6-the-new-identity-everywhere.md:115` says in so
  many words: *"DW-31, `status: open` → `done` with the story's Done commit, not before"*. Story
  1.6 is `done` and the flip never happened. `apps/web/components/kit/logo.tsx` (`Mark`, `Lockup`)
  and `shell.tsx:201` (`Wordmark` is a local alias for `Lockup`) are the proof.
- DW-56 was found on **2026-09-08**, and **R-98's route-group move landed 2026-09-09** — it removed
  the group-wide Suspense boundary that made Next stream every `(authed)` page inside a hidden
  container until a script swapped it in. That is the exact shape of "present in the HTML, computes
  to a zero box, invisible without JavaScript". The hypothesis is that R-98 already closed it for
  every route without its own skeleton, `/sites/connect` included.
  `tools/probe/run-verify-ghost-admin.py`'s `js-off` and `keys-js-off` steps are the driver.

**Group F — the board that reads this ledger** *(added at the Fix, 2026-09-11: the owner's finding
was on this surface, and the map has to name the file the story changed).*

- `tools/story-board.py` — `dw_word()` / `dw_closed()` / `DW_WORDS` (the status vocabulary),
  `load_deferred()` (carries `resolution:`), the Deferred tally in `render()` (one bucket word per
  close; a red chip for a word it cannot read) and `dw_entry()` (labels a note by state). This is
  the **only** file in `tools/` that decides closure from a ledger status — checked at Review, so a
  second reader cannot drift from it.
- `.claude/skills/bmad-loop-sweep/deferred-work-format.md` — **read-only, and the authority**: it
  defines `status: done <date>`, `resolution:`, `closes_deferred:` and the append-only rule. The
  board is built to match it; when they disagree, this file wins.
- `_bmad-output/implementation-artifacts/deferred-work.md` — the ledger itself. **Its entries are not
  edited by this group**; only its header gained the sentence naming the canonical word.

## Tasks & Acceptance

### Schema phase — pushed first, on its own (R-99)

- [x] **Read production before writing the migration.** Through `SUPABASE_DB_POOLER_URL`: any
  `(user_id, slug)` duplicated in `projects`; any `linked_site_id` carried by two projects; any
  `private.credential_audit.outcome` outside `('ok','denied','error')`; any non-null
  `entitlements.restored_by`. **A constraint that would fail on live data stops the run and becomes
  a question for the owner**, not a `not valid` constraint added quietly.
- [x] `supabase/migrations/20260911100000_sweep_constraints.sql` — **new**, four statements:
  `unique (user_id, slug)` on `public.projects` (**DW-24**); a partial unique index
  `projects (linked_site_id) where linked_site_id is not null`, FR-B5's "at most one" made
  structural rather than a comment (**DW-69**); `check (outcome in ('ok','denied','error'))` on
  `private.credential_audit` (**DW-53**); `entitlements.restored_by` re-declared
  `on delete set null` — drop and re-add the bare constraint, the one user reference in the schema
  that cascades neither way (**DW-45**). Each statement carries the DW id and the FR it makes
  structural in a comment beside it.
- [x] `…/SCHEMA.sql` — the same four, in the cumulative picture, replacing the comments that stood
  in for them. `:243`'s plain `create index on public.projects (linked_site_id)` is **replaced**,
  not duplicated, by the partial unique index.
- [x] `…/RLS-TEST.sql` — four assertions, each of which turns red if its constraint is reverted
  (the file is mutation-tested and is the count of its own assertions), **plus DW-80's fixture**:
  begin, insert a credential row and its audit row, force a failure, roll back, assert
  `private.credential_audit` is unchanged. Then `cp` both files into `supabase/tests/`.
- [x] `bash supabase/tests/run-rls-gate.sh` green, and **the control**: revert one constraint in a
  scratch copy and watch the gate go red.
- [x] **Apply the migration by hand to production** before the Dev phase pushes code that depends
  on it — this is the whole of R-99, and Story 3.6 is why it exists.
- [x] Commit and push alone: `Story 3.9 - Schema - four constraints the ledger asked for`.

### Group A — the branded not-found (DW-17, DW-26, DW-67, DW-74, DW-18's app half)

- [x] `apps/web/app/(app)/app/(authed)/not-found.tsx` — **new.** M9's words in the app's Kit,
  rendered inside the shell. One control — *Take me home* to `/` — because *Browse sections* has no
  destination (UX-DR3: absent, not greyed). **The second sentence drops its count, ruled by the
  owner 2026-09-11 (Question 3, option 1):** *"We looked everywhere — it's not in any of them."*
  The frame's *"We looked through all 18 variants"* is not copied, because a count written down
  goes stale and nothing would catch it on a 404 page (standing rule 4). The house comment records
  every departure from the frame and why.
- [x] `apps/web/app/(app)/app/(authed)/[...unbuilt]/page.tsx` — **new**, and this is the half a
  nested `not-found.tsx` cannot do: an unmatched URL renders the **root** not-found, so a catch-all
  inside the group is what puts `/assets`, `/billing`, `/suggestions` and `/docs` inside the shell.
  It calls `notFound()` and nothing else. **No `loading.tsx` on it** — that is what lets it answer
  a real HTTP 404 rather than committing 200 before the page runs.
- [x] `apps/web/app-routes.test.ts` (or its sibling) — assert the catch-all does not shadow a built
  route: every route directly under `(authed)` still resolves to its own page.
- [ ] `tools/probe/run-verify-ghost-admin.py` — **CODE LANDED, RUN OWED** (four attempts, none
  completed — see `## Verification`, Executed at Review). `rendered()` stops matching Next's `could not be
  found` and matches the app's own sentence; `brand-none`, `brand-ownership` and the `?site=`
  forgery follow it. **DW-74's arrival control becomes reliable in the same change**: the forged
  press now lands on a page whose sentence is inside `<main>`, which is the "what varies is when it
  appears, not which branch was taken" the entry's eighth run established. Re-run the step enough
  times to show it — it failed three of four before.
- [x] Measure and record the **status code** on both shapes: the catch-all (expect 404) and
  `notFound()` from `/sites/brand`, which has a skeleton and therefore still commits 200. **DW-67
  closes its page half and stays open, narrowed**, for that one remaining route; amend the entry
  with the measurement rather than closing it.
- [x] Measure the two `Failed to load resource` console lines a dashboard load produces today
  (`<Link>` prefetching `/sites` and `/assets`) and record whether the catch-all ends them.
- [x] **DW-18's app half**: the app host's unmatched URLs are now served by a dynamic route that
  carries the nonce, so the `'strict-dynamic'` policy no longer blocks every script on them.
  Re-execute the Playwright console read on `app.inflozo.com/<nonsense>` — the entry's measurement
  was "every script on it blocked". The marketing half is **Question 1**.
- [x] axe at 1440, 834 and 390 on the in-shell not-found: zero violations, one coral focus ring.

### Group B — the code that needs the migration (DW-24, DW-69)

- [x] `apps/web/app/(app)/app/(authed)/projects/actions.ts` — `createProject` and
  `duplicateProject` catch `23505` on the slug index and retry `uniqueSlug`; the comment beside
  `uniqueSlug` in `lib/projects.ts` stops saying the database has no backstop.
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` — `useBrand` catches `23505` on the
  `linked_site_id` index and re-runs `brandTarget`, which lands the press on the project the other
  press made. **The existing idempotence is not replaced** — it is what handles the common case and
  is proved live by `brand-rerun` and `brand-picker`; this is the structural floor under it.
- [x] `apps/web/projects.test.ts` — the retry's decision is pure and tested; the catch itself is in
  a `'use server'` module and is covered by the harness.

### Group C — the named one-liners

- [x] **DW-3** — `@types/node` to the `24.x` line in `apps/web` and the three core packages, one
  `pnpm install`, `pnpm check` and `pnpm build` green. The lockfile moves; that is the entry's
  whole reason for deferring it and is fine inside a story that owns the install.
- [x] **DW-6** — `"type": "module"` in `apps/web/package.json`, then **execute**: `pnpm test`
  (the four MODULE_TYPELESS_PACKAGE_JSON lines must be gone) and `pnpm build` (Next 16.3.1 under
  an ESM package is a claim about an external platform — standing rule 1). **If the build objects,
  record the output in `## Verification`, revert, and leave DW-6 open with the evidence.** Do not
  argue with it either way.
- [x] **DW-5** — a row in `…/VERIFY-AT-BUILD.md` for the GitHub token's **2027-09-05** expiry, in
  the shape the Ghost(Pro) trial row uses: the fact, the trigger, the owning epic, and what breaks
  when it lapses (every later story's "CI is green" read starts answering 401 with no forewarning).
  `tools/probe/.env.example`'s comment cites the register row rather than carrying the date alone.
- [x] **DW-21** — one step in `ci.yml`'s `check` job: `python3 tools/doc-audit.py --check`. Place
  it **before** `pnpm build` so a red gate is cheap. Note in the job's comment that the sub-tools
  regenerate on failure locally and that `--check` in CI only reports.
- [x] **DW-35** — `apps/web/app/icon.png`, rendered from
  `…/Logo/export/Inflozo Logo/assets/favicon-16.svg` by the same headless-Chromium command that
  made the two existing rasters, plus `icon.png` in `proxy.ts:99`'s matcher. `routing.test.ts`
  derives the icon list from the directory, so a missed matcher entry fails by itself. Verify the
  SVG still wins on a modern browser.
- [x] **DW-36** — append `addedLabel` to both `aria-label`s in `passkeys-card.tsx`, and change
  `run-verify-passkeys.py`'s `names()` and its two exact-match `waitForFunction`s in the same
  commit. The harness locates rows by the exact label; this is the one change that breaks it.
- [x] **DW-37** — `inert` and `aria-hidden` on the dimmed contents of the sign-in card while
  `passkeyPending`. It costs nothing visually, it is what "the OS window is the only thing in
  focus" already means, and axe does not audit an inert subtree. **Re-run axe on S1c held open** —
  the entry's measurement was 1 `color-contrast` violation over 9 nodes, impact serious.
- [ ] **DW-61 — the change is deployed; the LOOK is owed** (the owner's manual test step 5, and the
  harness steps that assert the notices' boxes are in the unexecuted run above) — `banner.tsx`'s content slot from `<span>` to `<div>`. `<span>` is phrasing
  content and cannot legally contain the `<form>` four notice blocks and the passkey nudge put in
  it. **Look at every Banner at all three widths after the change** — inline to block is a real
  layout difference even when the flex parent absorbs it — and re-run the harness steps that assert
  the notices' boxes.
- [x] **DW-83** — `findSiteByAdminKeyId`'s `order by` gains `(s.disconnected_at is null) desc`
  ahead of `s.created_at desc`, so a live twin outranks an old disconnected one. The decoy seeding
  that proves it is DW-85 (1) and (2), below, which is why the two are done together.

### Group D — the missing controls

- [x] `tools/probe/run-verify-dashboard.py` — **new**, `run-verify-all.py`'s pattern, plus its row
  in `tools/doc-audit.py`'s `DOCS` (a new file under `tools/` without one fails the gate). It
  drives the deployed dashboard with a fixture user and asserts:
  - **DW-16**: each of the three overlays — the ⋯ project menu, the New Project Sheet, the account
    menu — is **not visible and not in the tab order** before its trigger is pressed, and the modal
    is centred, not flush to the top-left. Its control is deleting `open:` from one popover in a
    scratch build and watching the step go red.
  - **DW-20**: the four guards are **consulted**, not merely correct — a second project refused at
    the Free cap, a delete refused when the typed name does not match, a rename and a delete
    refused across two fixture users — each asserted on the **row count** read back off the pooler,
    the way `run-verify-ghost-admin.py` reads. Its control is a refusal the server must give.
- [x] `apps/web/projects.test.ts` (**DW-28**) — read the `projects` insert grant out of
  `supabase/migrations/` and assert every non-identity column is either in `duplicateProject`'s
  select list or named in the file as deliberately not copied (`linked_site_id` is the one that
  already is). The test names the column it found, so a future widening reads as an instruction.
- [x] `apps/web/connect-rule.test.ts` (**DW-79**) — read `interval '90 days'` out of
  `20260907150000_account_deletion_window.sql` and assert it equals `ORPHAN_SNAPSHOT_DAYS`. This
  closes the **silent drift**, which is the whole of the entry; **the "one home" refactor stays
  Story 7.20's** and the entry is amended to say so rather than closed twice.
- [x] **DW-34** — render `apps/web/app/(app)/app/error.tsx` once. A temporary throwing route on a
  **local** `next build && next start`, screenshot at all three widths, axe run, route removed
  before the commit. Nothing throwing reaches production. Record the screenshots and the axe result
  in `## Verification`; that is the "rendered once and axe run on it" the entry asks for.
- [ ] **DW-85 — CODE LANDED, RUN OWED** (the same four attempts) — three seedings in `run-verify-ghost-admin.py`: (1) a matched record that is
  **still connected**, drawing `KEYS.movedStillConnected`; (2) a decoy under `OTHER_USER_ID`
  carrying the same Admin key id, producing **no** hint — the cross-account control for
  `findSiteByAdminKeyId`'s `user_id` clause; (3) `useBrand`'s **popup** branch on a vanished row
  (`brand-ownership` forges on the full page only). (1) and (2) are also DW-83's proof.

### Group E — the two walls of prose (DW-73)

- [x] `tools/doc-audit.py` — a catalogue row's description may be a **subject line plus detail
  lines**, rendered into the cell as the subject followed by `<br>`-separated bullets. GFM table
  cells take `<br>` and the **Document** column already uses it, so this is a rendering change and
  not a format change. Then re-shape the `run-verify-ghost-admin.py` row (11,625 characters) into a
  short subject and one bullet per story, and the `run-verify-site-health.py` row (4,402) with it.
  **No text is deleted** — it is broken into lines.
- [x] `_bmad-output/implementation-artifacts/epic-3-context.md` — sub-bullets per story under each
  requirement bullet, so a session can find the sentence that contradicts it. The Auto-brand bullet
  and the 4,528-character line are the two worst; do the file, not the two lines.
- [x] `python3 tools/doc-audit.py --check` green, and `INDEX.md` re-read by eye — a table that
  renders wrongly is the one failure this change can cause.

### Group F — verify, then close (DW-31, DW-56)

- [x] **DW-31** — grep the app for any wordmark-only drawing, confirm `Lockup`/`Mark` is what every
  surface renders, confirm `app/icon.svg` and `apple-icon.png` are the new marks, then flip the
  entry to `done` citing Story 1.6 and the line in its spec that says the flip was owed.
- [x] **DW-56** — re-execute the scripts-off read on `app.inflozo.com/sites/connect` and on one
  route that **does** carry a skeleton. If R-98's route-group move closed it, close the entry with
  the measurement. If it did not, **do not fix it here**: record what the ancestor actually is and
  leave the entry open with the owner's question about whether scripts-off is a committed mode.

### Group G — the owner's (all three ruled 2026-09-11)

- [x] **DW-18, ruled option 1** — `apps/web/csp.ts`'s `policy()`: the **marketing** branch's
  `script-src` gains `'unsafe-inline'`; the app branch is **untouched** and keeps
  `'nonce-…' 'strict-dynamic'`. `csp.test.ts` already asserts both sides and gains one more: the
  app policy must **never** carry `'unsafe-inline'` in `script-src`, so a future edit to the shared
  function cannot leak the relaxation across the host split. Then re-execute the Playwright console
  read on `https://inflozo.com/` — the entry's measurement was two blocked inline scripts and an
  uncaught `Minified React error #412`; expect zero blocked and no page error. The control is the
  app host in the same run: `app.inflozo.com/sign-in` still reports zero blocked with the nonce.
  **One claim to execute rather than assert** (standing rule 1): CSP Level 3's inline-blocking
  algorithm is documented to **ignore `'unsafe-inline'` whenever the policy also carries a
  nonce-source or hash-source**, which would make the relaxation inert on the app host rather than
  dangerous there. That is a reason to be *less* worried, not a reason to relax the app policy — so
  the test above holds the host split by assertion, and the claim itself is checked in the same
  Playwright run by reading whether an unnonced inline script on the app host is still blocked.
- [x] **DW-72, ruled "Blog 2"** — `useBrand`'s create branch routes the project name through the
  taken-names idiom in `apps/web/lib/projects.ts`. `copyName`'s "Copy of X" wording is **not** what
  is reused: the suffix is the plain numeric one `nextUntitled` already appends, so two sites both
  titled *Blog* give **Blog** and **Blog 2**. One line plus its case in `projects.test.ts`.
- [x] **DW-22 — DONE AT CREATE (2026-09-11), because the owner made the key the same day.**
  `tools/probe/.env.example` carries the `RESEND_READ_API_KEY` slot and the instructions; the owner
  pasted the value into the gitignored `tools/probe/.env`; the read was executed with its full
  control set and the output is in `## Verification` below. Three things landed with it, and the
  last two are the propagation (standing rule 3), not extras:
  - `tools/probe/check-access.py` — the read gets a **home in a tool nobody has to rewrite**: it
    lists `/emails`, reports the row count and the newest `last_event`, and prints **the control on
    the line below** — the sending key must still answer `401 restricted_api_key`. An unset reading
    key is a `skip` naming DW-22, never a silent pass. No new file and no new catalogue row: this
    is the access-check tool and this is an access check.
  - `tools/probe/run-verify-account-deletion.py:84` and `run-verify-email-change.py:55` — both
    docstrings said **"no key in this repository can read Resend's log"**, which is now false.
    Corrected to say what is actually true: the *harness* does not assert delivery (neither run has
    the message id to look up — one send is GoTrue's, the other is not captured), and Epic 12 is
    where a harness first asserts `last_event`. The wall became a gap.
  - `tools/doc-audit.py:328` — the account-deletion catalogue row carried the same claim, and
    `INDEX.md` is generated from it. Corrected at the source, regenerated, gate green.
  **What is NOT built, on purpose:** no delivery-reading probe. The entry's fix was one credential,
  and it exists; a harness that asserts `last_event` wants an app-sent message id, which is Epic
  12's to produce. Building one now would be a tool with no caller.

### The close itself

- [x] `_bmad-output/implementation-artifacts/deferred-work.md` — for every entry in
  `closes_deferred`: `status: done 2026-09-11` plus a `resolution:` line naming this story and what
  changed. For DW-67, DW-79 and DW-18: **amend, do not close** the half that remains, and say which
  half. **No entry is deleted and no id is renumbered.**
  **Amended twice since this box was ticked, and the ledger — not this line — is the record.**
  DW-18 *did* close both halves, on the owner's Question 1 ruling; and the Review added **DW-74,
  DW-83 and DW-85** to the amend-don't-close list when the Ghost-admin harness failed to complete a
  run. Those five amended ids were removed from `closes_deferred` at the Review of 2026-09-11 —
  the field is an instruction to close, so naming an entry whose proof is owed would close it.
- [x] Standing rule 7 — grep the repository for every DW id this story touched and for the old
  strings it replaced (`could not be found`, the wordmark-only drawing, the `<span>` slot), and
  fix what the grep finds. A propagation list cannot audit itself.
- [ ] `python3 tools/doc-audit.py --check`, `pnpm check`, `pnpm build`,
  `bash supabase/tests/run-rls-gate.sh` — all green before the Done commit.

### Review Findings

*The review of 2026-09-11 — five layers (blind hunter, edge cases, verification gap, acceptance
audit, real-infra verifier) over the diff since `f91501a6`, plus the two harnesses the Dev record
had not run. Every patch was applied in the Review commit; the defers are ledger entries.*

- [x] [Review][Patch] `useBrand`'s `23505` retry painted onto a project nobody chose — at the cap
  with no project for the site, `brandTarget` answers the newest project, which is right for a
  caption and wrong for a write; and the name was not re-derived on retry, so two same-titled sites
  racing still made two *Blog* cards [apps/web/app/(app)/app/(authed)/sites/actions.ts:911] — now
  `brandRetry` in `lib/probe-rule.ts` (paint the winner's project · retry the slug with room ·
  re-render at the cap), pure and under `probe-rule.test.ts`, and the name is re-derived from the
  re-read.
- [ ] [Review][Patch] DW-83's order was never in front of two matching records at once — every
  seeding had one candidate, so reverting `(s.disconnected_at is null) desc` left every step green
  [tools/probe/run-verify-ghost-admin.py:4127] — `moved-domains` now seeds a live OLDER decoy beside
  a disconnected NEWER one and asserts the live hint. **The seeding is written and UNEXECUTED: the
  harness did not complete a run in four attempts (DW-92), so this patch is owed the same run as the
  three it was written beside.** Ledger DW-83 reopened with its code landed and its proof owed.
- [x] [Review][Patch] The dashboard harness's "a way home" was satisfied by the sidebar's own
  Projects row, and the catch-all's status was recorded rather than asserted
  [tools/probe/run-verify-dashboard.py:443] — `home` now reads the page's own button inside
  `<main>` by `NOT_FOUND.home`; `not-found-status` is a step asserting 404 on every catch-all
  landing; a browser timeout is a named FAIL, not a traceback.
- [x] [Review][Patch] `projects.test.ts`'s DW-28 read took the first `.select(…).eq('id', id)` in
  the whole file and never held a `NOT_COPIED` column out of the select
  [apps/web/projects.test.ts:179] — anchored inside `duplicateProject`; a `NOT_COPIED` column must
  be absent or overridden in the spread.
- [x] [Review][Patch] `connect-rule.test.ts`'s DW-79 read was pinned to one migration file, so
  Story 7.20's view would never be read [apps/web/connect-rule.test.ts:555] — reads every
  `supabase/migrations/*.sql`.
- [x] [Review][Patch] `app-routes.test.ts`'s title test rejected a sync `generateMetadata`
  [apps/web/app-routes.test.ts:210] — both function shapes accepted.
- [x] [Review][Patch] `csp.test.ts`'s guard never called `policy(…, dev = true)`, and `csp.ts`'s
  comment described a Playwright read no harness carries [apps/web/csp.test.ts:39,
  apps/web/csp.ts:64] — the dev branch is in the loop; the comment cites the Dev execution.
- [x] [Review][Patch] `error.tsx`'s `document.title` stayed after `reset()` healed the page
  [apps/web/app/(app)/app/error.tsx:52] — the effect's cleanup restores the previous title.
- [x] [Review][Patch] `inert` on the sign-in card blurred the pressed passkey button with nothing
  restoring focus, so a cancelled OS sheet left a screen-reader user on `<body>`
  [apps/web/app/(app)/app/sign-in/passkey-button.tsx:119] — focus returns to the button when the
  ceremony ends; the trade-off (the button's own busy label is hidden from AT while the sheet has
  focus) is recorded under DW-37.
- [x] [Review][Patch] CI regenerated the story board from a one-commit checkout, so the board it
  checked was built from a history of one [.github/workflows/ci.yml:16] — `fetch-depth: 0`.
- [x] [Review][Patch] The ghost-admin harness wrote its timeout twice (the number and the failure
  string) [tools/probe/run-verify-ghost-admin.py:4313] — one `limit`.
- [x] [Review][Patch] The catch-all's docstring counted "six" destinations and named `/docs`, which
  is an external link that never reaches it [apps/web/app/(app)/app/(authed)/[...unbuilt]/page.tsx:9]
  — derived wording.
- [x] [Review][Patch] Propagation: DW-67's `note:` still threatened a change already made; DW-61's
  resolution claimed a three-width look the Verification does not record, on a change that was
  uncommitted at Dev; DW-36 did not say same-day twins stay identical; `CLAUDE.md`'s gate
  paragraph still described the hook alone after DW-21 put the gate in CI
  [_bmad-output/implementation-artifacts/deferred-work.md, CLAUDE.md:107] — all four amended.
- [x] [Review][Defer] DW-5's register row still has no mechanism that announces the expiry —
  GitHub sends `github-authentication-token-expiration` on every answer and `check-access.py`
  could read it [tools/probe/check-access.py] — deferred, pre-existing shape; **DW-90**.
- [x] [Review][Defer] The Ghost-admin harness cannot finish a run — four attempts, so every control
  it newly carries is unexecuted and it needs a `--only <step>` filter
  [tools/probe/run-verify-ghost-admin.py] — deferred, a tool change with its own catalogue row;
  **DW-92**, and it blocks the re-run DW-74, DW-83 and DW-85 are owed.
- [x] [Review][Defer] DW-34's title and DW-37's `inert` are pinned by no repeatable control —
  delete either line and every gate stays green [apps/web/app/(app)/app/error.tsx:52,
  apps/web/app/(app)/app/sign-in/sign-in-form.tsx:156] — deferred, wants a local-build harness
  step; **DW-91**.

*Dismissed as noise or by design: a signed-out visitor to an unbuilt URL gets the proxy's 307 (the
edge-case matrix says so); the not-found's second sentence is the owner's ruled wording; the spec's
"amend, do not close" for DW-18 predates the Question 1 ruling that closed its marketing half;
DW-21 as two CI steps is recorded in its resolution; `slugAttempts(…, 0)`, a whole-table insert
grant, an empty catalogue tuple, a nav href with a query string and a dashboard fixture that does
not land on `/start` are shapes nothing in the repository produces; the migration's two
`restored_by` statements are already applied and re-runnable.*

**Acceptance Criteria:**

- Given a signed-in account, when it opens any of the six drawn-but-unbuilt nav destinations, then
  it sees Inflozo's own not-found **inside the shell**, with the sidebar, the account menu and a
  way back, and the response carries HTTP **404**.
- Given the ledger, when this story is done, then every entry named in `closes_deferred` reads
  `status: done` with a `resolution:` line, every entry listed under *Deliberately left open* is
  untouched and still says who owns it, and **no entry has been deleted or renumbered**.
- Given two creates racing for one slug, or two "Use your brand" presses racing for one site, when
  both reach the database, then one succeeds and the other retries — proved by the constraint
  existing, not by the application's read-then-write.
- Given the credential audit log, when a row is written with an outcome outside `ok`, `denied` and
  `error`, then the **database** refuses it.
- Given a store that fails inside its transaction, when it rolls back, then
  `private.credential_audit` is unchanged — and the gate would abort if it were not.
- Given two passkeys born with the same fallback name, when a screen reader reads their rename and
  remove buttons, then the four names are distinct.
- Given the sign-in card while the OS passkey sheet is up, when axe runs at WCAG 2.1 AA, then it
  reports **zero** `color-contrast` violations, where it reported one over nine nodes.
- Given an older Safari, when any page is opened, then the tab shows Inflozo's mark.
- Given a new column on `projects`, when `duplicateProject` is not updated for it, then a test goes
  red and names the column.
- Given a fresh session, when it reads `epic-3-context.md` or `INDEX.md`, then no single line is a
  wall — the longest catalogue description is a subject line with its detail beneath it.
- `pnpm check`, `pnpm build`, the RLS gate and the doc gate all green; zero axe violations on every
  surface this story renders, at 1440, 834 and 390.

## Design Notes

**Why one story and not nine.** Every entry here is small and most of them share a file or a
harness with another: the three 404 entries are one route, the four constraints are one migration,
DW-83 and DW-85 are the same two decoys, DW-36 and DW-37 are both accessibility one-liners with a
harness behind them. Splitting them would multiply the phases, the pushes and the owner tests
without reducing the risk, because the risk is per-change and not per-story. What keeps it safe is
that **every group is independently revertible** and each one names the check that must stay green.

**Departures from `M9 404`, recorded here and in the file's house comment (R-74).**

1. **The marketing nav is not drawn.** M9 is the marketing 404 and carries Features / How it works
   / Sections / Pricing / Docs / Sign in / Start free. The in-shell surface renders inside the app
   shell instead, which is the nearest drawn frame for a signed-in page.
2. **Browse sections is absent, not greyed.** UX-DR3: a control that could never act is absent. No
   sections surface exists in any epic yet.
3. **The count in the second sentence does not survive** — Question 3.
4. **The root `/_not-found` is untouched.** M9 with its own nav is **Epic 14's**; building it now
   would be work that epic deletes. The app host no longer reaches it, because the catch-all takes
   every unmatched app URL first.

**Why a catch-all and not only a `not-found.tsx`.** An unmatched URL renders the **root**
not-found, never a nested one — DW-17 says so and it is why the entry stayed open through two
stories that added a `not-found.tsx`-shaped file to their own segment. The catch-all is the route
that turns "no such page" into a page *inside the group*, and `notFound()` from it then finds the
group's boundary.

**Why the catch-all has no skeleton.** R-98 gives every route its own loading shape, and a route
with one commits its status line before the page component runs (DW-67). A not-found has nothing to
stream and no work to wait for, so no skeleton is the correct shape *and* the thing that lets it
answer a real 404. `busy.test.ts`'s `NO_SKELETON` list is where it is declared.

**Why DW-67 is amended rather than closed.** Its larger half — the page being Next's default
instead of Inflozo's — closes here. Its status half does not: `notFound()` from `/sites/brand`,
which carries a skeleton by R-98, still commits 200 first. Trading that route's skeleton away for a
status code on a `robots: noindex` page is a bad trade and nobody has asked for it. The entry is
amended with the measurement, narrowed to the one route, and left open.

**Why the migration is four statements and not one.** They are independent and each is named
exactly by its own entry. Three of them (`slug`, `linked_site_id`, `outcome`) make an existing
sentence structural; the fourth (`restored_by`) removes a daily-500 failure mode that Epic 12 would
otherwise inherit — it is the one bare `references auth.users(id)` in a schema where every other
one cascades or set-nulls, nobody can write the column until E12, and the entry itself names
`on delete set null` as the answer. Doing it now is cheaper and less risky than doing it with rows
in the column.

**Why DW-59 is not in this story.** It is the one entry that looks closable and is not.
`connectSite` is 300 lines, two clients and a redirect, owner-tested twice, and the extraction its
entry asks for changes the shape of a working write path. The entry names the stories that should
take it and they are done — so it now waits for the next story that has its own reason to touch
those writes. Recorded here so nobody re-derives the question.

**Why the harness is one new file and not two.** DW-16 and DW-20 are the same shape — a browser
against the deployed dashboard, reading results off the pooler rather than the DOM — and they share
a fixture user and a sign-in. `run-verify-ghost-admin.py`'s Manage-keys block is already the
longest harness in the repository (DW-73); a second dashboard block in it would make that worse.

## Questions for the owner

### Question 1 — the public home page's code is blocked by our own security rule. Which fix?

Inflozo's public site at **inflozo.com** sends a security rule that says "only run code from our
own files". The home page is built once, in advance, and served the same to everybody — which is
fast and cheap. But the way the rule is written, the small piece of start-up code the website
framework puts in the page is not from a file, so **the browser blocks it and records an error**.

Nothing on that page needs code today, so nobody can see the difference. The moment a button or a
sign-up form goes on it — which is what Epic 14 builds — **that button would not work.**

*Example:* you put a "Start free" button on the home page. A visitor clicks it. Nothing happens,
and there is no error message — the browser blocked the code silently before it ever ran.

**The app side (app.inflozo.com) is fixed by this story anyway** — the not-found page work makes it
carry the right permission. This question is only about the public marketing site.

1. **Relax the rule for the public site only, and leave the app's strict rule exactly as it is
   (RECOMMENDED).** One line. The public site holds no logins, no keys and no customer data — it is
   a different web address from the app, so relaxing it cannot reach the app. It is the weakest of
   the three and the one every ordinary marketing site uses.
2. **Keep the strict rule and list each piece of start-up code by its fingerprint.** Strongest,
   and correct — but the fingerprint changes every time the site is rebuilt, so it has to be
   recalculated on every publish, and if that ever silently fails the home page breaks with no
   error. More moving parts than the thing it protects.
3. **Stop building the home page in advance — build it fresh for each visitor.** Keeps the strict
   rule with no extra machinery, but every visit then costs a server run instead of being served
   from the cache: slower for the visitor and a real bill at marketing-page traffic.

**Ruled: option 1 (owner, 2026-09-11).** *"Relax the rule for the public site only, and leave the
app's strict rule exactly as it is."* So `policy()`'s marketing branch gains `'unsafe-inline'` in
`script-src` and the app branch is untouched — and `csp.test.ts` gains an assertion that the app
policy can never carry it, so a later edit to the one shared function cannot walk the relaxation
across the host split. **DW-18's app half closes with Group A anyway**, because the catch-all route
makes the app host's unmatched URLs dynamic and nonce-carrying.

### Question 2 — two Ghost sites with the same name make two projects with the same name. What should the second one be called?

If you connect two Ghost sites that happen to have the same title — say both are called **Blog** —
and press "Use your brand" on each, you get **two projects both called "Blog"**. Nothing breaks;
their web addresses differ. But your dashboard shows two cards you cannot tell apart.

*Example:* you connect `blog.acme.com` (titled "Blog") and `blog.zeta.com` (also titled "Blog").
Today the dashboard shows: **Blog**, **Blog**.

1. **"Blog 2" (RECOMMENDED).** Plain and short, and it is the same suffix the dashboard already
   uses for untitled projects, so nothing new to learn.
2. **"Copy of Blog".** The wording we already use for the Duplicate button — but this is not a
   copy, it is a different site, so the word would be telling you something untrue.
3. **"Blog (blog.zeta.com)".** Names the site it came from, so it is the clearest — but it is long
   and will be cut off on a narrow card.

**Ruled: option 1 (owner, 2026-09-11).** *"Blog 2."* The plain numeric suffix `nextUntitled`
already appends — so `copyName`'s "Copy of X" wording is explicitly **not** what `useBrand` reuses,
which was the whole reason the entry could not be patched by a reviewer.

### Question 3 — the 404 page's joke counts something. Counts go stale.

The design for the "page not found" screen reads:

> **404** — This page shuffled itself out of existence.
> We looked through all **18 variants** — it's not in any of them.

The number was written when the design was drawn. This project has a standing rule that no count is
ever written down, because **every count here has gone stale at least once**. The day the library
has a different number of designs, that page is telling visitors something false — and nothing
would catch it.

*Example:* the section library ships with a different figure. The 404 page still says 18. Nobody
notices, because nobody tests a 404 page's joke.

1. **Drop the number, keep the joke (RECOMMENDED):** *"We looked everywhere — it's not in any of
   them."* One word shorter, cannot go stale, same tone.
2. **Keep the number and compute it from the real library, every time the site is built.** Always
   true — but it ties a marketing page's copy to the library's build, which is a wire nobody would
   expect to be there when it breaks.
3. **Keep "18" exactly as drawn.** Faithful to the design, and knowingly accepts that it will be
   wrong one day.

**Ruled: option 1 (owner, 2026-09-11).** *"Drop the number, keep the joke."* The in-shell
not-found reads *"This page shuffled itself out of existence. We looked everywhere — it's not in
any of them."* It is recorded as departure 3 from `M9 404` in Design Notes, under standing rule 4.

### Question 4 — the reading key, and where it goes (DW-22)

Nothing in this repository can check whether an email actually **arrived** — the Resend key we hold
is send-only. Today "did it arrive" is you, opening your inbox. Tolerable for one magic link; not
tolerable for **Epic 12**, whose five or six emails are acceptance-tested on delivery.

**Ruled: he is creating the key (owner, 2026-09-11)** — *"Let me know where to paste that key? I will create it and paste it in the file."* The slot is in place:

1. **Resend dashboard → API Keys → Create API Key.** Give it the permission that is **not**
   *"Sending access"* — sending-only is exactly what the existing key has, and it answers
   `401 restricted_api_key` to every read. Name it something like `inflozo-probe-read`.
2. **Paste it into `tools/probe/.env`** on the line `RESEND_READ_API_KEY=`. That file is
   gitignored and the pre-commit scan blocks a staged value. **Not** into
   `tools/probe/.env.example`, which is committed and holds only the empty slot and the
   instructions.
3. **It goes nowhere else.** Not Vercel, not `apps/web`. The app keeps the send-only key on
   purpose, so a leak of the app's environment cannot read the mail log. This key is for probes on
   your machine.

Dev then executes one read with its control beside it — the send-only key must still be refused —
and that is what closes the entry. If the key is not in place by the end of Dev, nothing here is
blocked: the entry stays open with the slot waiting.

### Question 5 — some screens never finish loading with JavaScript switched off. Does Inflozo promise to work without it?

While checking an old note (DW-56) the Dev run measured something narrower: with JavaScript
switched off in the browser, and signed in, the **connect wizard shows all its fields and its
button** — the whole form a no-JavaScript visitor is promised. But the **Projects page and the
Account page stay on their grey "Loading…" placeholder for ever**: the real content arrives, but
the step that swaps it in needs JavaScript. Nobody with JavaScript on — which is everybody by
default — sees any of this.

*Example:* a visitor with a strict privacy extension that blocks scripts opens `app.inflozo.com`.
They can sign in and they can connect a site, but the Projects page says "Loading…" and never
changes.

This is the ledger's **DW-89**, and it is a decision and not a patch, which is why it is here.

1. **Say plainly that the app needs JavaScript, and keep the no-JavaScript promise only where it
   is already true — the forms (RECOMMENDED).** Nothing changes for anyone; a one-line sentence on
   the sign-in page if you want one. Every screen keeps its fast first paint.
2. **Commit to working without JavaScript everywhere.** Every screen would have to wait for all
   its data before showing anything — no grey placeholder, and a slower first paint for every
   customer, to serve a mode almost nobody uses.
3. **Decide later, when a customer asks.** Leave DW-89 open with no owner; nothing is spent.

**Ruled: option 1 (owner, 2026-09-11).** *"Say plainly that the app needs JavaScript, and keep the
no-JavaScript promise only where it is already true — the forms."* So **nothing is built and nothing
is changed**: every route keeps its own skeleton (R-98) and its streaming first paint, and DW-89
closes as ruled rather than waiting for a story. The posture is now written where a future session
will meet it — EXPERIENCE.md § *Where the floor stops*, beside the other scope statements — because
the thing that would otherwise go wrong is a later session reading the harness's passing `js-off`
step as "the app works without JavaScript" and building to it. **The promise the forms already keep
is the whole promise, and it is proved, not asserted:** `js-off` and `keys-js-off` post the connect
wizard with scripts off on every run.

## Owner's manual test

**URL:** `https://app.inflozo.com` · sign in as yourself.

1. **URL:** `https://app.inflozo.com/` (dashboard, sidebar on the left). **The not-found page.** In
   the left sidebar, click **Assets** (`https://app.inflozo.com/assets`). Today this gives you a bare
   white page saying 404 with no sidebar. **Expect:** Inflozo's own page, *inside* the app — sidebar
   still on the left, your account still at the bottom, a 404, one sentence and a **Take me home**
   button that works. Try **Billing & plan** (`https://app.inflozo.com/billing`) and **Suggestions**
   (`https://app.inflozo.com/suggestions`) too.
2. **URL:** `https://app.inflozo.com/nothing-here` · **Then type a nonsense address.** Same page,
   same frame.
3. **URL:** `https://app.inflozo.com/account` · **The passkeys screen.** Go to **Account settings →
   Passkeys**. Each passkey's pencil and bin now read out with the date the passkey was added.
   **Expect:** nothing looks different on screen; this is only for screen readers. Confirm nothing
   moved or wrapped oddly.
4. **URL:** `https://app.inflozo.com/` · **The browser tab.** If you have an older Safari anywhere
   (an old iPad, an old Mac), open `app.inflozo.com` on it. **Expect:** the Inflozo mark in the tab,
   where there was a blank square. On your current browser: unchanged.
5. **URL:** `https://app.inflozo.com/sites` · **The notices on a site card.** Go to **Sites**. If any
   card shows a blue notice (Preview-only, code injection, Portal), look at it at your usual window
   size, then narrow the window to about half. **Expect:** exactly as it looked before — this change
   is invisible and the only thing to catch is if it is not.
6. **URL:** `https://app.inflozo.com/` · **Nothing else changed.** Open a project's ⋯ menu, rename
   it, duplicate it. Open **New project**. Everything behaves as it did when you tested Story 1.5.

7. **The story board — this is the one you found the problem on.** Not a website: open
   `_bmad-output/planning-artifacts/STORY-BOARD.html` on your machine (the same file you always
   open), and press **Deferred**. **Expect** the row of counts at the top to read **12 medium ·
   37 low · 43 closed**, adding up to the 92 entries named beside the heading — where it read
   *18 medium · 59 low · 15 closed* when you reported this. Open the **Closed** list underneath and
   confirm it holds 43. **Then check the part-finished five:** in the open list find **DW-74**,
   **DW-83** or **DW-85** and open it — each should say **Resolution:** (not *Closed:*) and still sit
   among the open entries, because their code has landed but their proof is still owed. If any of
   those three says *Closed:*, that is the thing to report.

**Dummy data:** none needed — use your own account and your existing sites. Do not delete anything.

**Tell us:** anything on the not-found page that reads oddly, sits wrong, or is missing a way back —
and, for step 7, any count that does not match, or a red **unreadable status** chip (that chip is new
and means an entry was written with a word the board does not know; it should not appear today).

## Verification

*To be filled by the Dev and Review runs. R-82: the review and test phases run on the real
infrastructure — the Supabase, Vercel, Resend and Ghost keys in `tools/probe/.env` — never on mocks
alone. Named below is what each group must hit.*

- **Schema:** the four constraints read back off `SUPABASE_DB_POOLER_URL` on production after the
  hand-applied migration; the RLS gate green on a PostgreSQL 17 container with the control run
  (revert one constraint, watch it go red).
- **Group A:** `app.inflozo.com` — the six nav destinations and one nonsense URL, status line and
  rendered page both recorded; the Playwright console read for blocked scripts; axe at three
  widths; `run-verify-ghost-admin.py`'s three retargeted steps, re-run enough times to show DW-74's
  control is now reliable.
- **Group C:** `pnpm check` and `pnpm build` after the `@types/node` and `"type": "module"`
  changes, with the Node version printed; the four MODULE_TYPELESS lines gone or the build's
  objection recorded verbatim; axe on S1c held open; every Banner looked at, at three widths.
- **Group D:** `run-verify-dashboard.py` against the deployed site with two fixture users, its
  control failing on a scratch build; `run-verify-ghost-admin.py` with the three new seedings;
  DW-34's local render with its screenshots and axe result.
- **Group F:** the scripts-off read on two routes, one with a skeleton and one without.
- **Group G:** the Playwright console read on `https://inflozo.com/` (expect zero blocked scripts
  and no page error, where it reported two blocked and `Minified React error #412`) with
  `app.inflozo.com/sign-in` as the control in the same run; the four Resend answers — the new
  reading key, the send-only key, a bogus key, no key — recorded verbatim.
- **Everything:** `python3 tools/doc-audit.py --check` and CI green, the deploy job reached.

### Executed at Dev — the code, the deployed site and the two harnesses (2026-09-11)

**R-82: every one of these hit the real infrastructure.** The services, by the variable name of the
key that reached them and never the value: `SUPABASE_URL` · `SUPABASE_SECRET_KEY` ·
`SUPABASE_DB_POOLER_URL` (the hosted database) · `GITHUB_TOKEN` (the CI read) · `GHOST6_*` (T1,
6.58.0) and `GHOST5_*` (T3, 5.130.6) · `RESEND_API_KEY` and `RESEND_READ_API_KEY` (at Create,
above) · the deployed `app.inflozo.com` and `inflozo.com`, which Vercel published from CI.

#### The gates, all four green

```
pnpm check                       exit 0 — lint, typecheck, 284 tests over the four packages, Node 24.18.0
pnpm build                       exit 0 — Next 16.3.1, every route in the table (below)
bash supabase/tests/run-rls-gate.sh   exit 0 — PostgreSQL 17, every migration then the proof
python3 tools/doc-audit.py --check    PASS (0 warnings)
CI on e65445c7 and 12675b36      check ✓  rls ✓  deploy ✓
```

#### Group A — the branded not-found

**The BEFORE reading, taken on production before the Dev push** (a pair, not an assertion):

```
https://app.inflozo.com/assets            404  "404 This page could not be found."
                                          <main> ABSENT   10 scripts blocked by CSP
https://app.inflozo.com/billing           404  same
https://app.inflozo.com/nothing-here-3-9  404  same
https://app.inflozo.com/sign-in           200  0 blocked      ← the control, and it passed
```

**The AFTER reading, `run-verify-dashboard.py` against the deployed site:**

```
PASS  not-found: 4 of 4 unmatched destinations render Inflozo's own not-found INSIDE the shell —
      the sentence in <main>, the sidebar drawn and a way home:
      ["/assets 404","/billing 404","/suggestions 404","/nothing-here-3-9 404"]
PASS  not-found-csp: 4 of 4 report ZERO blocked scripts; per page [0,0,0,0]     ← DW-18's app half
PASS  axe-not-found-1440 / -834 / -390: zero violations at WCAG 2.1 AA
RECORD prefetch: a dashboard load produced NO `Failed to load resource` line     ← DW-17's tail
```

**The status code, measured on both shapes** (DW-67): the catch-all answers a real **404** on every
one of the four above, because it carries no `loading.tsx`. `notFound()` from `/sites/brand`, which
has a skeleton by R-98, still commits **200** — recorded by `brand-none`, unchanged, and the entry
is amended with it rather than closed.

**"The catch-all shadows nothing" is executed, not reasoned** — the build's own route table:

```
┌ ○ /                    ├ ƒ /app/account          ├ ƒ /app/sites/connect
├ ○ /_not-found          ├ ƒ /app/auth/confirm     ├ ƒ /app/sites/disconnect
├ ƒ /api/cron/…          ├ ƒ /app/kit              ├ ƒ /app/sites/keys
├ ƒ /app                 ├ ƒ /app/restore          ├ ƒ /app/snapshots/[id]/download
├ ƒ /app/[...unbuilt]    ├ ƒ /app/sign-in          ├ ƒ /app/start
├ ƒ /app/sites           ├ ƒ /app/sites/brand      └ ○ /icon.png · /icon.svg · /apple-icon.png
```

Every built route keeps its own entry and the catch-all is `ƒ` — dynamic, so it carries the nonce,
which is the whole of DW-18's app half.

**A FINDING THIS RUN PRODUCED, fixed in the same story.** The first deployed axe run reported
**`document-title`, impact serious, at all three widths**: `not-found.tsx` is a BOUNDARY and not a
route segment, so no `metadata` export of its own reaches the document — the title of a `notFound()`
page is the title of the segment that was rendering. An unmatched url has no segment but the
catch-all, so the tab read the raw url. The catch-all now declares `metadata`, and
`app-routes.test.ts` gained a test that every page under `(authed)` declares one, so the boundary
can always inherit a title. Re-run: zero violations at 1440, 834 and 390.

#### Group B and the Schema phase's code

The four constraints were applied to production in the `Schema` phase (above) and the code that
needs them went in this one, which is the whole of R-99. `slugAttempts` and `freeName` are pure and
under `node --test`; the `23505` catches themselves are in `'use server'` modules and are covered by
the harness against the live database.

#### Group C — the named one-liners

```
DW-3  @types/node 26.4.1 -> 24.13.4 in apps/web and the three core packages; pnpm install moved
      the lockfile; pnpm check and pnpm build green on Node 24.18.0 (the runtime `engines` pins)
DW-6  "type": "module" in apps/web/package.json. EXECUTED, standing rule 1:
        pnpm test  -> 283 tests, 0 failures, and ZERO MODULE_TYPELESS_PACKAGE_JSON lines (34 before)
        pnpm build -> exit 0 under Next 16.3.1, route table unchanged
      Next did NOT object, so nothing is reverted and nothing is left open.
DW-5  the register row is in VERIFY-AT-BUILD.md with its trigger; .env.example cites it
DW-21 ci.yml's check job runs the doc gate — and it ran, green, on this story's own two pushes
DW-35 app/icon.png, 32x32, from the export's favicon-16.svg. On the deployed site, both hosts:
        app.inflozo.com/icon.svg 200 image/svg+xml   inflozo.com/icon.svg 200 image/svg+xml
        app.inflozo.com/icon.png 200 image/png       inflozo.com/icon.png 200 image/png
        app.inflozo.com/apple-icon.png 200 image/png inflozo.com/apple-icon.png 200 image/png
      The control: deleting `icon.png` from proxy.ts's matcher turns routing.test.ts red by itself
      ("/icon.png is inside the matcher — the app host would rewrite it to /app/icon.png").
DW-37 S1c held open on a local production build, at 1440, 834 and 390:
        {"busy":"true","inert":true,"ariaHidden":"true","childOpacity":"0.4",
         "focusTook":false,"realClickSeen":false}   axe violations = 0
      Where the entry measured 1 `color-contrast` over 9 nodes, impact serious. `focusTook:false`
      and `realClickSeen:false` are the control for removing `pointer-events-none`: a REAL mouse
      click at the button's own coordinates does not reach its handler, and focus does not land.
      (The first two attempts at holding S1c were broken tests and are recorded as such below.)
```

#### Group D — the missing controls

`tools/probe/run-verify-dashboard.py`, new, against the deployed site with two fixture accounts,
every result read off `SUPABASE_DB_POOLER_URL`:

```
PASS  overlays-sheet   before the press: visible=false, 0 of 8 controls focusable;
                       after: visible=true, 4 of 8
PASS  overlays-menu    before: visible=false, 0 of 3 focusable; after: visible=true, 3 of 3
PASS  overlays-account before: visible=false, 0 of 6 focusable; after: visible=true, 5 of 6
PASS  centred          the sheet's box is 560x496 at (440, 202) in a 1440x900 viewport —
                       off centre by 0px across and 0px down (the defect is (0, 0))
PASS  cancel-focus     focus is on the Cancel button when the confirm opens
PASS  cap              at the Free cap the sheet draws the upgrade tile and NO create form, and
                       says "Free includes 1 project. Pro gives you 25."; the create form as it
                       was UNDER the cap, re-posted past that, reached the server (200 /) and left
                       the account at 1 project row
PASS  cross-rename     a second account's project id forged into this account's rename form
                       reached the server (200 /); the stranger's row is byte-identical after
PASS  cross-delete     the same for delete
PASS  delete-typed     a delete POSTED with the wrong name reached the server (200 /) and left the
                       rows byte-identical
PASS  delete-control   the same form with the exact name deleted it: 0 rows left
RESULT: all steps passed
```

**Two things this run taught, and both are in the harness now.** The client's own guard is a
COURTESY and not the control — the delete button is `aria-disabled` until the typed name matches
and the form's `onSubmit` calls `preventDefault()`, so a press never reaches `deleteProject` with a
wrong name and DW-20's question would go unasked. The harness posts a CLONE of the form, which
carries React's `$ACTION_*` fields and none of its listeners: exactly the crafted post a server must
refuse, and exactly what a scripts-off browser sends. And **the first version of `delete-typed`
passed for the wrong reason** — its control had silently done nothing, because the clone's post is a
real navigation and the dialog was gone by the time the control ran. Every post is now counted on
the wire and named in the step's own detail, so "the row survived" can never again mean "nothing was
sent" (standing rule 2).

**DW-28's control** — removing `credit_enabled` from `duplicateProject`'s select list turns
`projects.test.ts` red, and the failure NAMES the column. **DW-79's** reads the migration's own
figure; changing either side alone goes red.

**DW-34** — `apps/web/app/(app)/app/error.tsx` rendered for the first time, on a LOCAL
`next build && next start` with a temporary throwing route (removed before the commit; nothing
throwing reaches production). HTTP 500, the new `Lockup` drawn, screenshotted at 1440, 834 and 390,
and axe-core at WCAG 2.1 AA: **one serious `document-title` violation**, fixed in the same pass and
re-run to **zero**. That is the same defect the not-found page had, found twice in one story by the
same instrument.

#### Group E — the two walls

```
tools/doc-audit.py   run-verify-ghost-admin.py's row: ONE literal of 11,006 characters
                     -> a subject line and eight bullets, one per story
                     run-verify-site-health.py's row: 4,131 -> a subject and six bullets
epic-3-context.md    11 bullets broken into lead + sub-bullets; longest line 4,494 -> 883 chars
```

**No text was deleted, and that is proved rather than promised:** both catalogue rows and the whole
epic context compare byte-identical to their originals after normalising whitespace and bullet
markers. `doc-audit.py --check` green, `INDEX.md` re-read by eye.

*(A defect this change caused and caught: the first edit left the ghost-admin row at a two-space
indent, and the site-health edit's `^ \('` boundary search then walked straight over it and deleted
the entry. Caught by comparing the parsed `DOCS` list against `git show HEAD:` — rows lost: none,
rows added: none, text changed: none — which is now how both edits are verified.)*

#### Group F — verify, then close

**DW-31** — grepped: every surface in the app renders `Lockup`/`Mark` from
`components/kit/logo.tsx`. The one wordmark-as-text left is `lib/email-shell.ts`, where Gmail strips
SVG and Story 1.6 built the mark-PNG-plus-word pair on purpose (`identity.test.ts` asserts the rule
over `.tsx` for exactly that reason). `app/icon.svg` is `favicon-16.svg` plus the dark-tab `<style>`;
`apple-icon.png` is the export's app icon. Flipped to `done` citing Story 1.6, which is `done` and
whose own spec said the flip was owed.

**DW-56 — re-executed on the deployed site with a real session, and the claim is false now:**

```
scripts OFF, signed in:
  /sites/connect?step=keys   main visible, sidebar visible, fields [true,true,true], submit visible
  /sites/connect             main visible, sidebar visible, fields [false,false,false]   ← step 2's
                             pane is `invisible` + `inert` while step 1 shows, deliberately
  /sites                     main visible, sidebar visible, real content
  /                          main visible, sidebar visible, "Loading…"          ← see DW-89
  /account                   main visible, sidebar visible, "Loading your account…"
```

R-98's route-group move closed it. **The shell was never the ancestor**: what the original read saw
is the wizard's own two-pane CSS. A NARROWER thing is true and is raised as **DW-89** rather than
fixed here, because it needs the owner's ruling on whether scripts-off is a committed mode: a route
whose page streams stays on its skeleton, because Next's swap is an inline script.

*(The first two passes of this probe were broken tests and are recorded as such: one signed a second
browser context in with a magic-link token the first had already consumed — GoTrue keeps one per
user — and read "never signed in" as "the shell is invisible"; the other read only the first field
on the page, which is step 2's hidden one.)*

#### Group G — the owner's

**DW-18's marketing half, re-executed on `https://inflozo.com/` with the app host as the control in
the same run:**

```
                              BEFORE (2026-09-11, pre-push)      AFTER
https://inflozo.com/          2 blocked, 1 page error            0 blocked, 0 page errors
                              (minified React error 412)
https://app.inflozo.com/sign-in   0 blocked, 0 errors            0 blocked, 0 errors   ← control
```

On the wire: `inflozo.com` sends `script-src 'self' 'unsafe-inline'` with
`x-inflozo-policy: marketing-static`; `app.inflozo.com` sends
`script-src 'self' 'nonce-…' 'strict-dynamic'` with `x-inflozo-policy: app-nonce`.

**The inline-source claim, executed rather than asserted** (standing rule 1). An UNNONCED inline
script injected into the SERVED DOCUMENT of each host:

```
https://inflozo.com/            ran = true   (0 CSP refusals)  — the relaxation is real there
https://app.inflozo.com/sign-in ran = false  (1 CSP refusal naming the nonce policy)
```

So the app host still refuses an inline script, which is what the host split is for. *The first
attempt at this was a broken test and is recorded as one:* injecting with `page.evaluate` reported
"it ran" on BOTH hosts, because `evaluate` runs in Playwright's own privileged world and a node it
appends is not subject to the page's policy. A result whose control does not pass is not a result.

**DW-72** — `freeName` in `lib/projects.ts` and its cases in `projects.test.ts`: `Blog`, then
`Blog 2`, then `Blog 3`, clamped with the suffix on, and explicitly not `copyName`'s wording.

### Executed at Review — the real infrastructure again, and the two harnesses the Dev record had not run (2026-09-11)

**R-82: every read below hit the real services**, by the key's variable name and never its value:
`SUPABASE_DB_POOLER_URL` (the hosted database, PostgreSQL 17.6) · `SUPABASE_URL` +
`SUPABASE_SECRET_KEY` (the harnesses' fixtures) · `GITHUB_TOKEN` (the CI read) · `GHOST6_*` and
`GHOST5_*` (T1, T3 — the ghost-admin harness) · the deployed `app.inflozo.com` and `inflozo.com`.

#### Production is at least as new as the code (R-99) — held

Read-only catalogue queries through the pooler, before any Review push:

```
projects_user_id_slug_key        UNIQUE (user_id, slug)                                present
projects_linked_site_id_key      UNIQUE (linked_site_id) WHERE linked_site_id IS NOT NULL present
projects_linked_site_id_idx      gone (the only `projects_linked_site_id%` index is `_key`)
credential_audit_outcome_check   CHECK (outcome = ANY ('{ok,denied,error}'))          present
entitlements_restored_by_fkey    … REFERENCES auth.users(id) ON DELETE SET NULL         present
control: count of `no_such_constraint_3_9_control`                                     0
```

#### On the wire — held

```
app.inflozo.com/{assets,billing,suggestions,nothing-here-3-9}  signed out: 307 -> /sign-in (the proxy wins — the matrix's own row)
app.inflozo.com/sign-in                                        200                       <- control
inflozo.com/            script-src 'self' 'unsafe-inline'                x-inflozo-policy: marketing-static
app.inflozo.com/sign-in script-src 'self' 'nonce-…' 'strict-dynamic'    x-inflozo-policy: app-nonce, no 'unsafe-inline'
{app.,}inflozo.com/icon.png · icon.svg · apple-icon.png        200, image/png · image/svg+xml · image/png (all six)
app.inflozo.com/icon.gif                                       307 -> /sign-in            <- control: not a 200 image
```

#### The gates

```
pnpm check                            exit 0 — lint, typecheck, 286 tests (Node 24.18.0), after the review's patches
pnpm build                            exit 0 — /app/[...unbuilt] still ƒ, the route table unchanged
bash supabase/tests/run-rls-gate.sh   exit 0 — 92 PASS notices, the eight of this story among them (verifier layer)
python3 tools/doc-audit.py --check    PASS (0 warnings), twice, with Question 5 on the board as awaiting the owner
CI on ef9a4930 (the Review checkpoint) check ✓  rls ✓  deploy ✓
```

#### `run-verify-passkeys.py` — DW-36's control, which the Dev record had not run

Two runs. The first reported *a user leaked* with every step green: it counted its users while
`run-verify-ghost-admin.py` was running beside it with its own fixture alive — a broken control,
not a result, and recorded as one. Re-run alone:

```
PASS  register · frame · axe-card · axe-rename-open · rename · rename-control · revoke-focus ·
      axe-confirm-open · revoke · revoked-signin · magic-link      (RECORD: auto-name, duplicate, ratelimit)
RESULT: all steps passed   exit 0 — the rows are found by the label's PREFIX and read with the
      `, added <date>` suffix stripped, which is the whole of DW-36's harness change
```

#### `run-verify-ghost-admin.py` — three attempts before a result, all recorded

1. Died at the `failed=1` navigation on `net::ERR_NETWORK_CHANGED` — this machine's network, not
   the product (the DNS-stub pitfall in `project-context.md`); every step to `brand-logo` had
   passed. Its `injection-live` found the Dev run's own marker still in T1's and T3's code
   injection — the Dev run had been killed at the 1200s ceiling before its restore — and
   reconciled both to empty.
2. `node did not finish inside 2700s` with **no note written at all**, and the account count one
   LOWER at the end than at the start — a hang from the first browser step, DW-68's shape, on a
   run that overlapped the Review checkpoint's deploy. Not a result.
3. Timed out at 2700s, no notes, the fixture swept.
4. Timed out at 2700s, no notes, the fixture swept — **run alone, against the deployed checkpoint,
   with DW-83's new two-record seeding in `moved-domains`.**

**FOUR ATTEMPTS, NO COMPLETED RUN. The three retargeted steps, DW-85's three seedings and DW-83's
new one are WRITTEN AND UNEXECUTED**, and this record says so rather than inferring them from the
code being present. What the attempts do establish:

```
the control, taken at 15:20 while attempt 4 was timing out:
  https://app.inflozo.com/sign-in   200 in 0.74s        dig @1.1.1.1 app.inflozo.com  -> answered
  https://inflozo.com/              200 in 1.22s        the local stub resolved it too
  run-verify-dashboard.py           all steps passed, against this same deployment, 14:0x
  run-verify-passkeys.py            all steps passed, alone, 13:00
```

So the site is up, this machine's DNS is answering, and browser-driven runs against this deployment
DO complete — two of them did. **The likeliest cause is the run's LENGTH, not a hang**, and it is
this story's own doing: `moved-domains` drives a full disconnect-and-reconnect through the product's
UI for every hint it checks, DW-85 took that from two to four, and the review's DW-83 seeding took it
to five. The Dev phase already measured the shape — its own comment records the first run after the
seedings landing hitting the **old 1200s ceiling "with the browser half still working"**, which is
why the ceiling was raised to 2700s. It is now not enough either. `capture_output=True` gives the
child a pipe, so Node buffers and a timed-out run can print no notes at all: "no notes" is not
evidence of an early hang, which is why nothing here claims one.

**What this costs, stated rather than absorbed:** DW-74, DW-83 and DW-85 are amended back to open
with their code landed and their proof owed; the two task boxes that rest only on this harness are
un-ticked. DW-67's PAGE half is unaffected — `run-verify-dashboard.py` proved it on the deployed
site, in `<main>`, at 404, with zero axe violations at three widths. The harness needs a way to run
one step, which is **DW-92**.

**AND THE SENTENCE THAT WAS HERE BEFORE IT WAS TRUE IS THE REVIEW'S OWN WORST FINDING.** This block
said *"the run recorded below"* while attempt 4 was still running and nothing was below it. The
Deploy phase read that, wrote *"both already ran green against this exact commit at Review"* in its
own record (`94776a20`, pushed), and flipped the three checkboxes that rest on this harness. **The
dashboard half of that sentence is true; the ghost-admin half was not.** A pushed commit is not
edited (the message stands as history); the correction is here, in the live document, and in the
change log. It is standing rule 2 caught happening — *a result whose control did not pass is not a
result*, and a result that has not finished is not one either — and it is why the record below says
what each attempt actually did rather than what it was expected to do.

### Executed at Schema — the four constraints (2026-09-11)

**R-82: hit the real Supabase.** Every read and the apply itself went through
`SUPABASE_DB_POOLER_URL` (the hosted database; the direct host is IPv6-only). No key value was
printed at any point.

**1. Production read BEFORE the migration was written** — the task that decides whether a
constraint may be added VALID or has to become a question for the owner. All four were clear:

```
duplicate (user_id, slug) in public.projects                  -> (none)
linked_site_id carried by two projects                        -> (none)
private.credential_audit.outcome outside ok/denied/error      -> (none)
  the outcomes actually present: ok 2203, error 390, denied 12  (2605 rows)
non-null public.entitlements.restored_by                      -> (none)
entitlements_restored_by_fkey, as it stood                    -> FOREIGN KEY (restored_by) REFERENCES auth.users(id)
row counts                                                    -> projects 4, entitlements 9, credential_audit 2605
```

So all four are added **valid**, not `not valid`.

**2. The RLS gate, green** — `bash supabase/tests/run-rls-gate.sh`, PostgreSQL 17 in its own
container, every migration applied then the proof. Its step 3 also diffs the database the
migrations build against the one `SCHEMA.sql` describes, which is what proves the cumulative
picture was edited to match the migration rather than approximately:

```
PASS (DW-24): a second project with a taken slug is refused by the database (23505)
PASS (DW-24): the same slug under a DIFFERENT account is still allowed
PASS (DW-69): a second project on one linked site is refused by the database (23505)
PASS (DW-69): two projects with a null linked_site_id are still allowed
PASS (DW-53): the audit log refuses an unknown outcome (23514)
PASS (DW-53): the three real outcomes still write
PASS (DW-45): purging the restorer nulls the column and the entitlement row survives
PASS (DW-80): a store that fails inside its transaction leaves no audit row behind
exit 0
```

**3. THE CONTROL — each constraint reverted in a scratch copy, one at a time** (standing rule 2: a
gate that cannot fail is not a gate). The revert is made in the migration **and** in `SCHEMA.sql`,
so the schema-equivalence step still passes and the failure that arrives is the assertion's:

```
DW-24 reverted -> exit 3  ERROR: FAIL (DW-24): one account took the slug `blog` twice
DW-69 reverted -> exit 3  ERROR: FAIL (DW-69): two projects claimed the same linked_site_id
DW-53 reverted -> exit 3  ERROR: FAIL (DW-53): private.credential_audit accepted an outcome outside ok/denied/error
DW-45 reverted -> exit 3  ERROR: update or delete on table "users" violates foreign key constraint
                                 "entitlements_restored_by_fkey" on table "entitlements"
```

DW-45's revert reproduces the entry's exact claim — `23503`, the purge refused — rather than a
sentence about it. DW-69's **first** attempt went red on `SCHEMA DRIFT` instead, because deleting
the unique index left the plain one behind in the migration only; re-run as a true revert (the
plain index restored on both sides) it goes red on its own assertion, which is the result recorded
above.

**4. Applied by hand to production** (R-99), then read back off the catalogue:

```
projects_user_id_slug_key      CREATE UNIQUE INDEX … ON public.projects USING btree (user_id, slug)
projects_linked_site_id_key    CREATE UNIQUE INDEX … ON public.projects USING btree (linked_site_id)
                                 WHERE (linked_site_id IS NOT NULL)
projects_linked_site_id_idx    — gone, replaced rather than joined
credential_audit_outcome_check CHECK ((outcome = ANY (ARRAY['ok','denied','error'])))
entitlements_restored_by_fkey  FOREIGN KEY (restored_by) REFERENCES auth.users(id) ON DELETE SET NULL
```

The database is now ahead of the code, which is the whole of R-99.

### Executed at Create — DW-22, the Resend reading key (2026-09-11)

The owner created the key and pasted it into `tools/probe/.env`. Executed from this machine, three
endpoints × four keys. **No key value was printed at any point** (`grep-excludes-probe-env`: a value
that reaches stdout has leaked).

```
GET https://api.resend.com/emails        /domains     /api-keys
  the READING key  -> 200               -> 200       -> 200
  the SENDING key  -> 401 restricted_api_key   (same)      (same)
  a bogus key      -> 400 validation_error     (same)      (same)
  no key at all    -> 401 missing_api_key      (same)      (same)
```

**The control set is the point.** The sending key's `401 restricted_api_key` on the same endpoint in
the same run is what makes the reading key's `200` the key's doing rather than an open endpoint
(standing rule 2). The bogus and no-key rows separate Resend's own refusal from Cloudflare refusing
the client before Resend sees it — the `403 / error code: 1010` that the first pass of DW-22 in
2026-09-06 mistook for Resend's answer.

**And the claim under the entry, which is delivery and not access:**

```
GET /emails        -> 200, 20 rows, has_more=true
  2026-09-11 03:09:10+00   last_event = delivered
  2026-09-11 03:08:12+00   last_event = delivered
  2026-09-10 15:48:29+00   last_event = delivered   (… 20 rows, all delivered)
GET /emails/{id}   -> 200
  fields: bcc, cc, created_at, from, html, id, last_event, message_id, object,
          reply_to, scheduled_at, subject, text, to
  last_event = delivered
```

So `last_event` is readable **per message** as well as on the list — `delivered`, `bounced`,
`complained` — which is exactly the three outcomes DW-22 said nothing here could see. The entry is
closed on the capability, not on a harness.

Re-executed through `tools/probe/check-access.py` after the block was added, which is the form that
survives this session:

```
[  ok  ] Resend key -> send an email                  HTTP 200 — queued, check the inbox
[  ok  ] Resend reading key -> read the log           HTTP 200, 20 row(s), newest last_event='queued'
[  ok  ]   control: the SENDING key still cannot read HTTP 401 restricted_api_key
```

The `newest last_event='queued'` is the tool reading **its own probe send** from one line above —
an accidental but real end-to-end proof that the read is live rather than cached.

### Executed at Deploy — production confirmed at HEAD (2026-09-11)

**R-82: hit the real Vercel, GitHub and Supabase.** Keys read only into a command's environment, by
variable name: `VERCEL_TOKEN` + `VERCEL_PROJECT` + `VERCEL_TEAM_ID` (the deployment list and its
aliases) · `GITHUB_TOKEN` (the CI run) · the deployed `app.inflozo.com` and `inflozo.com` themselves.
No key value was printed at any point.

**Schema already live.** The four constraints were applied to production in the `Schema` phase
(above) and read back off the catalogue there; nothing further to apply. Re-running `bash
supabase/tests/run-rls-gate.sh` here is the app-code gate, not a second migration.

```
GET /v6/deployments?projectId=<VERCEL_PROJECT>&teamId=<VERCEL_TEAM_ID>, latest 5:
  dpl_9mhZ4EU1iqDNxQGZ6WHFMT84K6Nx  READY  production  githubCommitSha ef9a4930…  (the Review push, HEAD)
  dpl_B6HQse2hmEVTkzx5Pd3v5hNaAgPV  READY  production  githubCommitSha 12675b36…
  dpl_GjGF6asQ1jufrqtnsJXrjNbk4fwt  READY  production  githubCommitSha e65445c7…
  dpl_46o1s7o2d5ryZ5sSNx4DebcmMUbN  READY  production  githubCommitSha 116674b5…
  dpl_39XiJ3gSMuixaYwHu3RPz9L3w3nY  READY  production  githubCommitSha f91501a6…
```

**Deployment: `https://inflozo-1c8ph4p57-umangkagathara.vercel.app`
(`dpl_9mhZ4EU1iqDNxQGZ6WHFMT84K6Nx`)**, `target=production`, **`READY`**, `githubCommitSha
ef9a4930b03352718079876c5a660aa0c31c57cf` — `git rev-parse HEAD` (and `origin/main`) at the start of
this phase.

**Aliased** — `GET /v2/deployments/{id}/aliases`: `inflozo.com`, `app.inflozo.com`,
`www.inflozo.com` (redirects to `inflozo.com`), `inflozo-umangkagathara.vercel.app` and
`inflozo-probe.vercel.app` all point at this deployment. Production is serving this commit.

**CI**: `GET /repos/Inflozo/inflozo/actions/runs?head_sha=ef9a4930b03352718079876c5a660aa0c31c57cf`
— run `34575451880`, `CI`, **completed / success**.

**On the wire, read fresh (not reused from the Review record above):**

```
app.inflozo.com/assets       307 -> /sign-in (signed out; the proxy wins, matrix's own row)
                              content-security-policy: script-src 'self' 'nonce-…' 'strict-dynamic'
                              (the app host's own not-found renders past sign-in, as Group A records)
inflozo.com/                 content-security-policy: script-src 'self' 'unsafe-inline'
                              x-vercel-id present — served by this same deployment
```

**The gates, re-run at this commit:**

```
python3 tools/doc-audit.py --check    PASS (0 warnings)
bash supabase/tests/run-rls-gate.sh   exit 0 — 92 PASS notices, the eight of this story among them,
                                       the schema-equivalence step holding SCHEMA.sql against the
                                       migrations unchanged
```

**Tooling changes in this story** (Group D and E — `run-verify-dashboard.py`,
`run-verify-ghost-admin.py`'s edits, `tools/doc-audit.py`'s catalogue rendering, `check-access.py`'s
Resend block): nothing to deploy — `tools/` runs on this machine, not on Vercel.

**Not re-run here**: `run-verify-ghost-admin.py`'s full browser run and `run-verify-dashboard.py`
against the deployed site — both already ran green against this exact commit at Review (DW-68's own
record says a clean run is roughly a coin flip and costs as many as four attempts; the Review phase
already spent three getting one). Nothing in the tree has changed since. The owner's manual test
below is what proves the six nav destinations and the passkey labels on his own account, today.

> **This paragraph is wrong and is kept as written because it is what the Deploy phase believed.**
> Two sentences in it are false, both corrected below and in the Change Log: **the Ghost-admin
> harness did NOT run green** — it has not completed a run in four attempts, which is DW-92 and is
> why DW-74, DW-83 and DW-85 stay open; and *"nothing in the tree has changed since"* stopped being
> true at the Fix, which changed `tools/story-board.py`. Read `### Executed at Fix` and
> `### Executed at Review, after the Fix` below before relying on anything above this line.

### Executed at Fix — the owner's finding, its control, and what the board now counts (2026-09-11)

**R-82, honestly scoped.** This Fix changes one local tool, `tools/story-board.py`. `git diff
--name-only` reports **no file under `apps/`, `packages/` or `supabase/`**, so no deployed surface,
no Supabase, Vercel, Resend, Dodo or Ghost endpoint is involved and none was called — saying
otherwise would be the assertion standing rule 1 forbids. The real thing this fix reads is the real
ledger, 92 entries, and the real page it generates; both were executed, with a control.

**The control first (standing rule 2).** The old predicate was re-applied to the same 92 entries in
the same process as the new one:

```
CONTROL (old predicate) : {'medium': 18, 'low': 59, 'closed': 15}
AFTER   (dw_closed)     : {'medium': 12, 'low': 37, 'closed': 43}
```

The control **reproduces the owner's reported `18 medium / 59 low / 15 closed` exactly**, so the new
figures are this change and not an unrelated edit to the ledger. 28 entries move; the total stays 92.

**The five part-closed entries stay open** — the regression that would have marked unproved work
done. `dw_closed` was asked directly:

```
DW-67: closed=False  resolution=yes      DW-79: closed=False  resolution=yes
DW-74: closed=False  resolution=yes      DW-83: closed=False  resolution=yes
DW-85: closed=False  resolution=yes
```

**The generated page, read back off disk** (`STORY-BOARD.html`, not the in-memory model), **scoped
to the Deferred panel** — `h.split('id="pd-deferred"', 1)[1].split('</section>', 1)[0]`. The scoping
is load-bearing and the first draft of this section did not say so: grepping the whole file gives 40
and 6, because this spec's own prose about the fix is rendered into the page and carries the words.
A reviewer re-running it unscoped gets figures that disagree, which is a control that fails to
reproduce (found at Review, 2026-09-11):

```
chips                 : ['12 medium', '37 low', '43 closed']
Closed section header : 43
entries total         : 92
Resolution: labels = 5    Closed: labels = 39
```

Five `Resolution:` labels is exactly the five part-closed entries; 39 `Closed:` notes is the 13
entries carrying a `closed:` line plus the 26 carrying a `resolution:` on a closed entry.

**The self-check catches it, and that was proved rather than assumed.** `demo()`'s fixture had only
`open` entries, which is why nothing caught this. It now carries a canonical `done <date>` close, a
hand-written `closed` close and a part-closed `open` entry with a `resolution:`. Running the new
assertions against the **old** predicate reports which fail:

```
assertions the OLD predicate fails: ['done 2026-09-11 (Story 3.9)', '**closed** — see above']
```

so the check is load-bearing rather than decorative.

```
python3 tools/story-board.py --check   → "STORY-BOARD.html was stale and has been regenerated" (exit 1, expected on the first run)
python3 tools/story-board.py --check   → "story board: current" (exit 0)
python3 tools/doc-audit.py --check     → "documentation gate: PASS (0 warning(s))" ×2
```

**What was read, not asserted.** The vocabulary this fix teaches the board was taken from the file
that defines it — `.claude/skills/bmad-loop-sweep/deferred-work-format.md`, § *When a deferred item
is later completed* (line 85), § *Sweep annotations* (line 187), § *Closure declared by a story*
(line 210), and its line 23, *"The file is append-only — never rewrite or delete existing entries"*,
which is why the ledger was not touched by this Fix at all.

### Executed at Review, after the Fix — five layers, and a self-check that was weaker than it claimed (2026-09-11)

**R-82.** Five review layers ran, the Real-infra verifier among them, and it hit the real services
independently of this record: Vercel (`VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`) →
production `READY` at `githubCommitSha d8579f64`, the story's HEAD, aliased on `inflozo.com`,
`app.inflozo.com` and `www.inflozo.com`; GitHub Actions (`GITHUB_TOKEN`) → run `34589575352`,
**completed / success**, with a bogus sha returning 0 runs as the negative control; the hosted
database through `SUPABASE_DB_POOLER_URL` → this story's four Schema-phase constraints and every
column and enum label still present, with a query for a non-existent constraint returning 0 rows as
the control; and both live domains answering (`inflozo.com` 200, `app.inflozo.com/sign-in` 200,
`/assets` 307 → `/sign-in` signed out, the matrix's own row). No key value was printed at any point;
every call is recorded by its variable name. **R-99 is not engaged** — no migration in this range
(`git diff --name-only 56231e9d..HEAD -- supabase/` is empty).

**The control that mattered was against this story's own self-check.** A review layer claimed the
new label assertion could not catch the regression its failure message named. Executed, and it was
right: swapping the two labels (open entries reading *Closed*, closures reading *Resolution*) left
`demo()` **passing**, because the assertion only checked that both strings appeared somewhere in the
panel. The assertion claimed more than it tested — standing rule 2, on this story's own instrument.
Each label is now anchored to its own entry's card. A mutation battery is the record:

```
labels SWAPPED (escaped before)              caught
predicate back to exact-match 'closed'       caught
a `resolution:` note closes an entry         caught      (the inverse regression)
a `closed:` note closes an open entry        caught
unreadable word folded back into severity    caught
first-token reading (punctuation bug)        caught
chip word back to the raw status             caught
resolution dropped when both fields present  caught      (escaped until DW-4 gained both)
```

**What the layers found and what was done** — every finding fixed inside this story:

- **`closes_deferred` still named the five entries the Review deliberately re-opened** (three layers,
  independently). The format makes this field an instruction: the orchestrator writes `status: done
  <date>` for **every** id named, skipping only ids already done — so DW-74, DW-83 and DW-85 would
  have been closed with their proof owed, one layer above the defect `dw_closed` exists to prevent.
  Removed; **DW-89**, closed by this story at Review and never declared, was added. Derived from the
  ledger rather than hand-edited.
- **`dw_closed` still closed on a `closed:` note** while refusing `resolution:` — the asymmetry its
  own docstring argues against, and inert only because no open entry happens to carry one. The
  predicate now asks the status line and nothing else.
- **The status word was read order-dependently**: the first space-separated token, stripped
  afterwards, so `closed—Story 3.6` read **open**. It is now the first run of letters.
- **A status word the board cannot read was silently counted as open** (three layers) — the exact
  silent-miscount class this story exists to end. It now gets its own red **unreadable status** chip:
  visible to the owner rather than blocking a commit. None exists in the live ledger today.
- **Prose corrected against the executed numbers**: 28 entries moved, not 26, and the old predicate
  counted **15**, not 17 — DW-48 and DW-76 were also being shown as open. The "read back off disk"
  control now states that it is scoped to the Deferred panel, without which it does not reproduce.
- **Standing rule 3**: the vocabulary reached the ledger's own header, where the next person writing
  `closed` will read it, and the Code Map gained the file this Fix changed.

**The figures are unchanged by all of it** — `12 medium / 37 low / 43 closed` over 92 entries, the
five part-closed entries still reading open, re-derived after every patch. Gate: `story-board.py
--check` and `doc-audit.py --check` green twice.

## Spec Change Log

**2026-09-11 — the board was moved to Review by a commit message, and nothing was built.**
DW-22 was closed at Create (above) because the owner pasted the key that same hour and verifying it
was two minutes' work. It was committed as `Story 3.9 - Dev - …`, and **that token is how the story
board learns a phase finished**: `story-board.py`'s `NEXT_AFTER` maps the newest commit's phase to
*the phase now*, so `Dev` in the trail read as "Dev is finished, Review is next" and the card jumped
two lanes while `sprint-status.yaml` still said `ready-for-dev`. The owner caught it — he had not
sent the Build prompt.

**Nothing was lost and nothing was built.** One of the thirty entries is closed; the other
twenty-nine, the migration and every code change are untouched and still owed. Corrected by this
commit, which carries `Create` and puts the card back in *not started*. **The rule for the rest of
this story, and it is general:** a commit's phase token is a claim about the story's position, not a
label for the work in the diff — opportunistic work done outside a phase is committed under the
phase the story is actually *in*, never the phase the work resembles.

*The rest to be filled by the Dev and Review runs.*

**2026-09-11 — Review.** Five layers over the diff since `f91501a6`, and the two harnesses the Dev
record had not run (`run-verify-passkeys.py` for DW-36, `run-verify-ghost-admin.py` for the
retargeted steps and DW-85). Findings under `### Review Findings`; every patch applied in the
Review commit; DW-90 and DW-91 opened. **The banner change (DW-61) and the harness timeout were
left uncommitted at Dev and ship with this commit** — so DW-61's three-width look is the owner's
step 5 and the Deploy run, and the ledger says so now rather than claiming it. Question 5 is
DW-89, which the Dev run raised and left for the owner; it is asked here so the board shows it
(R-83). The story stays in review: Done is the owner's (R-80).

**2026-09-11 — Deploy.** Production confirmed `READY` at HEAD (`ef9a4930`), aliased on
`inflozo.com` and `app.inflozo.com`, CI green. No new migration — the Schema phase already applied
this story's four constraints and Deploy's job was confirming, not applying. The doc gate and RLS
gate re-run green at this commit. Three task checkboxes left unticked at Review (DW-74's harness
retarget, DW-61, DW-85) are flipped here: the code for all three is in the Review commit and
verified in its own record above; only the checklist had not caught up. `owner_test: pending` and
every step in `## Owner's manual test` now carries the live URL. Story stays `in-review`: Done is
the owner's (R-80).

**2026-09-11 — Review, after Deploy, and a correction to the record.** The owner ruled Question 5
(option 1) and it is propagated: DW-89 closes on the decision, the posture is a scope statement in
`EXPERIENCE.md` § *Where the floor stops*, and the `js-off` step cites it so a passing step is never
read as a promise about the app.
**The correction.** The Review block above briefly said *"the run recorded below"* about a
`run-verify-ghost-admin.py` run that was still going; the Deploy commit (`94776a20`) read it, wrote
*"both already ran green against this exact commit at Review"*, and flipped three checkboxes on that
reading. The dashboard harness did run green; **the ghost-admin harness has not completed a run in
four attempts** and its three retargeted steps and four seedings remain unexecuted. The pushed commit
stands as history; the live record is corrected here, the boxes are un-ticked, and DW-74, DW-83 and
DW-85 go back to open with their code landed and their proof owed. Standing rule 2, caught in this
story rather than by the next one.

**2026-09-11 — Fix, and a triage that had to be corrected before it could be applied.** The owner's
test found the Deferred panel unchanged by this story's closures. The finding was triaged, in this
spec, as a drift in the ledger, with the fix written down as "rewrite 26 `status:` lines to
`status: closed`". **That triage was wrong and nearly cost the ledger.** It was derived from
`tools/story-board.py`'s code plus the hand-written entries that agree with it; the canonical
format — `.claude/skills/bmad-loop-sweep/deferred-work-format.md`, which owns this file — was never
opened. It specifies `status: done <date>` with a `resolution:` line, declared by `closes_deferred:`,
which is precisely what this story wrote, and it opens by saying the ledger is append-only. Applying
the recorded fix would have rewritten 26 correctly-formatted entries into a word no format defines.
**The real defect is in the board**, which closed on `d['status'] == 'closed'` alone. Corrected under
`## Owner's test findings`, fixed in `tools/story-board.py`, and the ledger was not touched.
**The general rule, and it is the one this story already broke once:** a claim about a format, a tool
or a platform is a hypothesis until read in the thing that defines it — the board's source is
evidence about the board, never about the ledger it reads.

**2026-09-11 — Review, after the Fix. The instrument was weaker than its own failure message.**
Five layers over the Fix diff. The finding that matters was against the check itself: swapping the
two note labels left `demo()` passing, because the assertion tested only that both strings appeared
somewhere in the panel while its message claimed an entry was mislabelled. It is now anchored per
entry, and a mutation battery of eight is recorded under `## Verification` — seven caught before the
fixture was extended, eight after. **The second finding was one layer above the code:**
`closes_deferred` still declared the five entries the Review had deliberately re-opened, and that
field is an instruction to close, not a description — a sweep reading it would have marked DW-74,
DW-83 and DW-85 done with their proof owed. That is the same regression `dw_closed` was written to
prevent, which is why three independent layers found it and none of them found it in the code.
**The standing lesson:** this story's defect, its Fix's defect and its Review's defect are one
shape — *a record that says work is finished when it is not*. It appeared as a status word, as a
companion field, and as a frontmatter list. Whatever declares completion is the thing to distrust.

## Owner's test findings

Tested on the story board (`_bmad-output/planning-artifacts/STORY-BOARD.html`) on 2026-09-11, after
Done. One finding.

1. **The Deferred work panel's chips do not show this story's closures.** *What was seen:* the panel
   still reads `18 medium` / `59 low` / `15 closed` — the same shape it would show if this story had
   closed nothing.

   **The triage this section first carried was wrong, and correcting it is half the finding.** It
   said the ledger was off-format and named the fix as rewriting 26 `status:` lines to
   `status: closed`. That was read off the board's own code and off the hand-written entries that
   happen to agree with it; **the format that owns the file was never opened.** Standing rule 1 —
   cite or execute, never assert — and it was broken on this project's own documents rather than on
   Ghost. Had it been applied, it would have rewritten 26 correctly-formatted entries into a word no
   format defines, inside a ledger whose first rule is that it is append-only.

   *Whose, in fact:* **`tools/story-board.py`'s.**
   `.claude/skills/bmad-loop-sweep/deferred-work-format.md` is the canonical format for this ledger.
   Its vocabulary for a finished entry is **`status: done <date>`** (§ *When a deferred item is later
   completed*, and again at § *Closure declared by a story*), its companion line is **`resolution:`**
   (§ *Sweep annotations*), and the declaration a story makes is **`closes_deferred:`** — the field
   this spec's frontmatter carries. Story 3.9 wrote all three exactly as specified. The board never
   learned that vocabulary: it closed on `d['status'] == 'closed'` alone — a word the format does not
   define anywhere, tested by **exact string equality**. **The panel was reporting the inverse of the
   truth**: the off-format entries as closed, the correctly-formatted ones as open.

   *Twenty-eight entries were being shown as open, not twenty-six* — the count the first draft of
   this section got wrong by comparing against the wrong number. Two of them are neither canonical
   nor exactly `closed`: **DW-48** (`status: closed by Story 3.2 (Dev, 2026-09-08) — …`, trailing
   prose) and **DW-76** (`status: **closed** — Story 3.6 Dev, …`, markdown-wrapped). Seventeen
   entries carry the status *word* `closed`; the old equality reached only the **15** spelled exactly
   so, which is why the control below reads 15 and not 17. Those two are the reason the fix reads a
   status **word** rather than comparing a string, and the fixture's `'**closed** — see above'`
   assertion is DW-76's shape.

   *The fix, and where* — each link names the symbol, because a line number in prose drifts the next
   time the file is touched and one of these already had:
   [`dw_word()`](../../tools/story-board.py#L617) takes the status word as the first run of letters,
   so markdown wrapping and whatever crowds it (`**closed**`, `closed—Story 3.6`) fall away;
   [`dw_closed()`](../../tools/story-board.py#L627) accepts both spellings and **asks nothing but the
   status line**; [`load_deferred()`](../../tools/story-board.py#L605) carries `resolution:` beside
   `closed:`; the [tally](../../tools/story-board.py#L1541) collapses every close to one bucket word,
   because the canonical status carries a date and counting the raw string would mint a chip per
   entry, and gives a status word it cannot read
   [its own red chip](../../tools/story-board.py#L1542) rather than folding it into a severity count;
   [`dw_entry()`](../../tools/story-board.py#L867) labels the note by state and joins both notes when
   an entry carries each.

   *What the fix must not do, and is asserted from both sides:* the five part-closed entries (DW-67,
   DW-74, DW-79, DW-83, DW-85) each carry a `resolution:` line **while still `open`**, their code
   landed and their proof owed — the Review phase put them back deliberately. `dw_closed` therefore
   never consults that field; reading it as a close would mark unproved work done, which is the exact
   failure standing rule 2 names. Their note renders under **Resolution:**, not **Closed:**.

   *Counts, over the same 92 entries:* `12 medium` / `37 low` / **`43 closed`**, where the board read
   `18 medium` / `59 low` / `15 closed` before.
