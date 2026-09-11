---
title: 'Story 3.9 — The deferred-work sweep at the end of Epic 3'
type: 'chore'
created: '2026-09-11'
status: 'in-progress'
baseline_commit: 'f91501a6651847d08db17e1b4e2a5624e1209862'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
closes_deferred: [DW-3, DW-5, DW-6, DW-22, DW-16, DW-17, DW-18, DW-20, DW-21, DW-24, DW-26, DW-28, DW-31, DW-34, DW-35, DW-36, DW-37, DW-45, DW-53, DW-56, DW-61, DW-67, DW-69, DW-72, DW-73, DW-74, DW-79, DW-80, DW-83, DW-85]
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

- [ ] `apps/web/app/(app)/app/(authed)/not-found.tsx` — **new.** M9's words in the app's Kit,
  rendered inside the shell. One control — *Take me home* to `/` — because *Browse sections* has no
  destination (UX-DR3: absent, not greyed). **The second sentence drops its count, ruled by the
  owner 2026-09-11 (Question 3, option 1):** *"We looked everywhere — it's not in any of them."*
  The frame's *"We looked through all 18 variants"* is not copied, because a count written down
  goes stale and nothing would catch it on a 404 page (standing rule 4). The house comment records
  every departure from the frame and why.
- [ ] `apps/web/app/(app)/app/(authed)/[...unbuilt]/page.tsx` — **new**, and this is the half a
  nested `not-found.tsx` cannot do: an unmatched URL renders the **root** not-found, so a catch-all
  inside the group is what puts `/assets`, `/billing`, `/suggestions` and `/docs` inside the shell.
  It calls `notFound()` and nothing else. **No `loading.tsx` on it** — that is what lets it answer
  a real HTTP 404 rather than committing 200 before the page runs.
- [ ] `apps/web/app-routes.test.ts` (or its sibling) — assert the catch-all does not shadow a built
  route: every route directly under `(authed)` still resolves to its own page.
- [ ] `tools/probe/run-verify-ghost-admin.py` — `rendered()` stops matching Next's `could not be
  found` and matches the app's own sentence; `brand-none`, `brand-ownership` and the `?site=`
  forgery follow it. **DW-74's arrival control becomes reliable in the same change**: the forged
  press now lands on a page whose sentence is inside `<main>`, which is the "what varies is when it
  appears, not which branch was taken" the entry's eighth run established. Re-run the step enough
  times to show it — it failed three of four before.
- [ ] Measure and record the **status code** on both shapes: the catch-all (expect 404) and
  `notFound()` from `/sites/brand`, which has a skeleton and therefore still commits 200. **DW-67
  closes its page half and stays open, narrowed**, for that one remaining route; amend the entry
  with the measurement rather than closing it.
- [ ] Measure the two `Failed to load resource` console lines a dashboard load produces today
  (`<Link>` prefetching `/sites` and `/assets`) and record whether the catch-all ends them.
- [ ] **DW-18's app half**: the app host's unmatched URLs are now served by a dynamic route that
  carries the nonce, so the `'strict-dynamic'` policy no longer blocks every script on them.
  Re-execute the Playwright console read on `app.inflozo.com/<nonsense>` — the entry's measurement
  was "every script on it blocked". The marketing half is **Question 1**.
- [ ] axe at 1440, 834 and 390 on the in-shell not-found: zero violations, one coral focus ring.

### Group B — the code that needs the migration (DW-24, DW-69)

- [ ] `apps/web/app/(app)/app/(authed)/projects/actions.ts` — `createProject` and
  `duplicateProject` catch `23505` on the slug index and retry `uniqueSlug`; the comment beside
  `uniqueSlug` in `lib/projects.ts` stops saying the database has no backstop.
- [ ] `apps/web/app/(app)/app/(authed)/sites/actions.ts` — `useBrand` catches `23505` on the
  `linked_site_id` index and re-runs `brandTarget`, which lands the press on the project the other
  press made. **The existing idempotence is not replaced** — it is what handles the common case and
  is proved live by `brand-rerun` and `brand-picker`; this is the structural floor under it.
- [ ] `apps/web/projects.test.ts` — the retry's decision is pure and tested; the catch itself is in
  a `'use server'` module and is covered by the harness.

### Group C — the named one-liners

- [ ] **DW-3** — `@types/node` to the `24.x` line in `apps/web` and the three core packages, one
  `pnpm install`, `pnpm check` and `pnpm build` green. The lockfile moves; that is the entry's
  whole reason for deferring it and is fine inside a story that owns the install.
- [ ] **DW-6** — `"type": "module"` in `apps/web/package.json`, then **execute**: `pnpm test`
  (the four MODULE_TYPELESS_PACKAGE_JSON lines must be gone) and `pnpm build` (Next 16.3.1 under
  an ESM package is a claim about an external platform — standing rule 1). **If the build objects,
  record the output in `## Verification`, revert, and leave DW-6 open with the evidence.** Do not
  argue with it either way.
- [ ] **DW-5** — a row in `…/VERIFY-AT-BUILD.md` for the GitHub token's **2027-09-05** expiry, in
  the shape the Ghost(Pro) trial row uses: the fact, the trigger, the owning epic, and what breaks
  when it lapses (every later story's "CI is green" read starts answering 401 with no forewarning).
  `tools/probe/.env.example`'s comment cites the register row rather than carrying the date alone.
- [ ] **DW-21** — one step in `ci.yml`'s `check` job: `python3 tools/doc-audit.py --check`. Place
  it **before** `pnpm build` so a red gate is cheap. Note in the job's comment that the sub-tools
  regenerate on failure locally and that `--check` in CI only reports.
- [ ] **DW-35** — `apps/web/app/icon.png`, rendered from
  `…/Logo/export/Inflozo Logo/assets/favicon-16.svg` by the same headless-Chromium command that
  made the two existing rasters, plus `icon.png` in `proxy.ts:99`'s matcher. `routing.test.ts`
  derives the icon list from the directory, so a missed matcher entry fails by itself. Verify the
  SVG still wins on a modern browser.
- [ ] **DW-36** — append `addedLabel` to both `aria-label`s in `passkeys-card.tsx`, and change
  `run-verify-passkeys.py`'s `names()` and its two exact-match `waitForFunction`s in the same
  commit. The harness locates rows by the exact label; this is the one change that breaks it.
- [ ] **DW-37** — `inert` and `aria-hidden` on the dimmed contents of the sign-in card while
  `passkeyPending`. It costs nothing visually, it is what "the OS window is the only thing in
  focus" already means, and axe does not audit an inert subtree. **Re-run axe on S1c held open** —
  the entry's measurement was 1 `color-contrast` violation over 9 nodes, impact serious.
- [ ] **DW-61** — `banner.tsx`'s content slot from `<span>` to `<div>`. `<span>` is phrasing
  content and cannot legally contain the `<form>` four notice blocks and the passkey nudge put in
  it. **Look at every Banner at all three widths after the change** — inline to block is a real
  layout difference even when the flex parent absorbs it — and re-run the harness steps that assert
  the notices' boxes.
- [ ] **DW-83** — `findSiteByAdminKeyId`'s `order by` gains `(s.disconnected_at is null) desc`
  ahead of `s.created_at desc`, so a live twin outranks an old disconnected one. The decoy seeding
  that proves it is DW-85 (1) and (2), below, which is why the two are done together.

### Group D — the missing controls

- [ ] `tools/probe/run-verify-dashboard.py` — **new**, `run-verify-all.py`'s pattern, plus its row
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
- [ ] `apps/web/projects.test.ts` (**DW-28**) — read the `projects` insert grant out of
  `supabase/migrations/` and assert every non-identity column is either in `duplicateProject`'s
  select list or named in the file as deliberately not copied (`linked_site_id` is the one that
  already is). The test names the column it found, so a future widening reads as an instruction.
- [ ] `apps/web/connect-rule.test.ts` (**DW-79**) — read `interval '90 days'` out of
  `20260907150000_account_deletion_window.sql` and assert it equals `ORPHAN_SNAPSHOT_DAYS`. This
  closes the **silent drift**, which is the whole of the entry; **the "one home" refactor stays
  Story 7.20's** and the entry is amended to say so rather than closed twice.
- [ ] **DW-34** — render `apps/web/app/(app)/app/error.tsx` once. A temporary throwing route on a
  **local** `next build && next start`, screenshot at all three widths, axe run, route removed
  before the commit. Nothing throwing reaches production. Record the screenshots and the axe result
  in `## Verification`; that is the "rendered once and axe run on it" the entry asks for.
- [ ] **DW-85** — three seedings in `run-verify-ghost-admin.py`: (1) a matched record that is
  **still connected**, drawing `KEYS.movedStillConnected`; (2) a decoy under `OTHER_USER_ID`
  carrying the same Admin key id, producing **no** hint — the cross-account control for
  `findSiteByAdminKeyId`'s `user_id` clause; (3) `useBrand`'s **popup** branch on a vanished row
  (`brand-ownership` forges on the full page only). (1) and (2) are also DW-83's proof.

### Group E — the two walls of prose (DW-73)

- [ ] `tools/doc-audit.py` — a catalogue row's description may be a **subject line plus detail
  lines**, rendered into the cell as the subject followed by `<br>`-separated bullets. GFM table
  cells take `<br>` and the **Document** column already uses it, so this is a rendering change and
  not a format change. Then re-shape the `run-verify-ghost-admin.py` row (11,625 characters) into a
  short subject and one bullet per story, and the `run-verify-site-health.py` row (4,402) with it.
  **No text is deleted** — it is broken into lines.
- [ ] `_bmad-output/implementation-artifacts/epic-3-context.md` — sub-bullets per story under each
  requirement bullet, so a session can find the sentence that contradicts it. The Auto-brand bullet
  and the 4,528-character line are the two worst; do the file, not the two lines.
- [ ] `python3 tools/doc-audit.py --check` green, and `INDEX.md` re-read by eye — a table that
  renders wrongly is the one failure this change can cause.

### Group F — verify, then close (DW-31, DW-56)

- [ ] **DW-31** — grep the app for any wordmark-only drawing, confirm `Lockup`/`Mark` is what every
  surface renders, confirm `app/icon.svg` and `apple-icon.png` are the new marks, then flip the
  entry to `done` citing Story 1.6 and the line in its spec that says the flip was owed.
- [ ] **DW-56** — re-execute the scripts-off read on `app.inflozo.com/sites/connect` and on one
  route that **does** carry a skeleton. If R-98's route-group move closed it, close the entry with
  the measurement. If it did not, **do not fix it here**: record what the ancestor actually is and
  leave the entry open with the owner's question about whether scripts-off is a committed mode.

### Group G — the owner's (all three ruled 2026-09-11)

- [ ] **DW-18, ruled option 1** — `apps/web/csp.ts`'s `policy()`: the **marketing** branch's
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
- [ ] **DW-72, ruled "Blog 2"** — `useBrand`'s create branch routes the project name through the
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

- [ ] `_bmad-output/implementation-artifacts/deferred-work.md` — for every entry in
  `closes_deferred`: `status: done 2026-09-11` plus a `resolution:` line naming this story and what
  changed. For DW-67, DW-79 and DW-18: **amend, do not close** the half that remains, and say which
  half. **No entry is deleted and no id is renumbered.**
- [ ] Standing rule 7 — grep the repository for every DW id this story touched and for the old
  strings it replaced (`could not be found`, the wordmark-only drawing, the `<span>` slot), and
  fix what the grep finds. A propagation list cannot audit itself.
- [ ] `python3 tools/doc-audit.py --check`, `pnpm check`, `pnpm build`,
  `bash supabase/tests/run-rls-gate.sh` — all green before the Done commit.

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

## Owner's manual test

**URL:** `https://app.inflozo.com` · sign in as yourself.

1. **The not-found page.** In the left sidebar, click **Assets**. Today this gives you a bare white
   page saying 404 with no sidebar. **Expect:** Inflozo's own page, *inside* the app — sidebar still
   on the left, your account still at the bottom, a 404, one sentence and a **Take me home** button
   that works. Try **Billing & plan** and **Suggestions** too.
2. **Then type a nonsense address**: `app.inflozo.com/nothing-here`. Same page, same frame.
3. **The passkeys screen.** Go to **Account settings → Passkeys**. Each passkey's pencil and bin
   now read out with the date the passkey was added. **Expect:** nothing looks different on screen;
   this is only for screen readers. Confirm nothing moved or wrapped oddly.
4. **The browser tab.** If you have an older Safari anywhere (an old iPad, an old Mac), open
   `app.inflozo.com` on it. **Expect:** the Inflozo mark in the tab, where there was a blank square.
   On your current browser: unchanged.
5. **The notices on a site card.** Go to **Sites**. If any card shows a blue notice (Preview-only,
   code injection, Portal), look at it at your usual window size, then narrow the window to about
   half. **Expect:** exactly as it looked before — this change is invisible and the only thing to
   catch is if it is not.
6. **Nothing else changed.** Open a project's ⋯ menu, rename it, duplicate it. Open **New project**.
   Everything behaves as it did when you tested Story 1.5.

**Dummy data:** none needed — use your own account and your existing sites. Do not delete anything.

**Tell us:** anything on the not-found page that reads oddly, sits wrong, or is missing a way back.

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
