---
title: 'Story 7.24 — Theme naming, frozen per site'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
baseline_commit: '09a3c7683b871e8a093e84f57ad09ce389b7bfc1'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-19-the-first-deploy-credential-step-and-its-decline-path.md']
---

## In plain English

When you ship a project to a Ghost site for the first time, the first screen of Ship it now tells you exactly what the theme will
be called on your site — for example `inflozo-name-test` — and says that this name is permanent there, and that renaming the
project later only changes its name inside Inflozo. If another Inflozo project (yours, or another Inflozo account connected to the
same Ghost site) already uses that name, your project's theme gets its own name, such as `inflozo-name-test-2`, and the screen
says why, so one project can never overwrite another's theme. Once a theme has landed on a site its name never changes there,
whatever you rename, prune or ship next.

One question for the owner, raised at the Review and ruled the same day (R-294: if the name changes after you saw it, the last
screen says so in one sentence). Two routine calls, said in Design Notes: "one site" means one Ghost site, whichever Inflozo account
connected it; and the row naming the theme stays on later ships, as 7.18a built it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The name half of FR-J10 already exists: `inflozo-{slug}`, `{n}.0.0` per deploy, frozen in `project_site_bindings` at
the first upload Ghost accepts, slug immutable once bound. Three things are missing:
- **The collision suffix.** The name is chosen from the slug alone. The binding is written only AFTER Ghost took the upload. So a
  second project whose name is already bound on the same Ghost uploads OVER the first project's theme, live included (R-264), and
  only then fails. Within one account this cannot arise, since slugs are unique per account (DW-24). Across two accounts connected
  to one Ghost — the owner's own test accounts on T1 do it every week — it can. Inflozo's database sees it only per site record.
- **D1a's confirmation.** Destination shows a "Theme" row on every ship. It lacks D1a's "Theme to be created", its permanence
  line, the "first deploy" pill and the "new theme · v1" chip.
- **Proof.** Nothing proves the freeze rules end to end on a real Ghost: deploy-only freezing, renaming, pruning, another site.

**Approach:**
- **One rule picks the name before the compile:** the binding's frozen name if there is one; otherwise `inflozo-{slug}`, or the
  first of `-2`, `-3`, … that no OTHER project has bound to a site with the same address, in any account (`uniqueSlug`, reused).
- **Destination and Pre-flight call that rule over the same read.** Ship it's re-read makes an artefact stale when the name moved
  meanwhile, so it is recompiled under the next free name and never stops.
- **D1a's pieces** are drawn on a project's first ship to the linked site. When the name was suffixed, one sentence says why.

**Frame (R-74):** `D1 First-Deploy Gates.dc.html` D1a `:28-93`:
- the "first deploy" pill beside "Ship it" `:47`;
- the theme box `:69-76`: "Theme to be created", the name in mono on the right, and the permanence line under it;
- the chip "new theme · v1" `:88`.

S8a `S8 Deploy.dc.html:23-75` stays the shape of a later ship. Two parts are extrapolated from D1a's own box, same components
and tokens:
- the suffix sentence, in the box's 11px helper line before the permanence sentence;
- the box on a project's first ship to a site another of the user's projects already used (no pill, since that is not the site's
  first deploy).

**The epic's criteria, word for word (R-195), and how this story meets each:**
- **Given** a first deploy **When** the theme name is set **Then** it is `inflozo-{project-slug}` with **auto-incremented semver
  per deploy**, shown in Ghost Admin and the history list
  — As built (7.18a, 7.22's `nextVersion`), held by the tests below. The name is suffixed only on a collision.
- **And** **the name freezes per site at the project's first deploy to that site**, each site getting its own frozen name, and
  deploying the project to a different site later freezes a fresh name there
  — The binding per project × site (as built). A new site resolves afresh through the rule.
- **And** **renaming the project afterwards changes its display name in Inflozo only**, so renames never orphan old themes in
  Ghost Admin
  — As built: `renameProject` writes `name` only; `slug` is outside the update grant; `guard_slug` refuses it once bound (RLS
  gate). Walk step 124 proves it on production.
- **And** **the name also freezes on a deploy-only upload**, because the name is claimed the moment a theme lands — matching the
  snapshot trigger, so the two rules agree by design rather than by coincidence
  — As built (`run.ts` binds before the mode is read). Proved by the owner's test and walk 124.
- **And** uniqueness is scoped to what Inflozo can know: Ghost blocks `GET /themes/` for Custom Integration tokens, so the frozen
  name is tracked in Inflozo's own **per-project × site binding record, exempt from artifact pruning**, so pruning can never lose
  it and re-derive a fresh name
  — The binding is the authority, whatever is pruned (7.22 never deletes a binding). What Inflozo can know is every account's
  bindings to the same address. Design Notes says why Ghost's own list is not read.
- **And** a collision between two Inflozo projects on one site **auto-resolves with a slug suffix, surfaced to the user, and never
  deadlocks**
  — The rule, the suffix sentence on Destination, and the Ship-time re-resolve.
- **And** a collision with a theme Inflozo did not deploy cannot be detected in advance, so **the first-deploy confirmation names
  the exact theme that will be created** so the user can catch it
  — D1a's box names the name the rule picked. Pre-flight compiles the same name.
- **And** the confirm matches D1a, including its permanence line. — The first acceptance criterion.

## Boundaries & Constraints

**Always:**
- **One rule, `themeNameFor({ slug, bound, held })`** in `lib/deploy.ts`: `bound ?? uniqueSlug(themeNameOf(slug), held)`.
  - Destination (`shipStateOf`) and Pre-flight/Ship it (`compileInputOf`) call it. Nothing else derives a theme name.
  - **`held`** = the theme names bound by every project other than this one to any site record whose `url` equals the linked
    site's `url`, in any account. Disconnected site records count (their themes are still on the Ghost). The project's own
    binding is never held.
- **The held read is one server function, `heldNamesIn(db, { siteId, userId, projectId })`**, in
  `server/deploy/held-names.ts`. Three plain queries over the service role:
  1. the url of the site `siteId` **owned by `userId`** (none → `[]`);
  2. the ids of every site with that url;
  3. those sites' bindings' `theme_name`, where `project_id` is not this project.

  It returns sorted names only, never ids, accounts or projects. `heldNames(a)` is the same over `supabaseAdmin()`.
- **Destination's read (`read.ts`)** calls `heldNames` when a site is linked. `shipStateOf` takes `held` and folds in its own
  `bindings`' other projects. A failed read is logged and counted as none, like the other ship reads; Pre-flight's own read
  decides what ships.
- **Pre-flight's read (`compileInputOf`)** calls `heldNamesIn` with its handed client, ONLY when this project × site has no
  binding. The name enters `package.json` (`theme.name`) and the zip's filename as today, and stays in `reads`. So a name that
  moved between Run checks and Ship it makes the artefact stale, and it is recompiled under the next free name. A failed read
  throws, which is AD-20's infrastructure retry.
- **ShipState gains two fields:** `newTheme` (this project has no binding to the linked site) and `suffixedFrom` (the base
  `inflozo-{slug}` when the rule suffixed it, else null).
- **Destination (deploy-wizard `destination`), when the theme row shows (unchanged: not on a B15 Preview-only site):**
  - **`newTheme`:** D1a's box `:69-76`:
    - "Theme to be created", then the name in mono;
    - then one helper line: the suffix sentence when `suffixedFrom` is set, then the permanence sentence;
    - the chip reads "new theme · v{n}" `:88`.
  - **Not `newTheme`:** the row as 7.18a built it ("Theme", the name) and `W.chip(n, prev)`.
  - **The pill** "first deploy" `:47` sits beside the title while `ship.firstDeploy` is true (FR-J13's per-site first deploy).
  - **Words, in `DEPLOY_WORDS` (R-170):**
    - `themeNew`: "Theme to be created";
    - `permanent(host)`: "This name is permanent for {host}. Renaming the project later changes its name in Inflozo only.";
    - `suffixed(base, host)`: "{base} is already used on {host} by another Inflozo project, so this one gets its own name.";
    - `chipNew(n)`: "new theme · v{n}";
    - `firstDeployPill`: "first deploy".
- **Unchanged:** the bind after the upload Ghost accepts (deploy-only and D2e included), the 23505 `taken` path, the put-back,
  Restore original, drift and the snapshot, which all read the stored `theme_name`.

**Ask First:**
- **Every production write and every T1 write needs the owner's in-session go**, asked in R-83's shape, run in the main session,
  never by a subagent, worded for the run's whole set of writes. That covers:
  - walk step 124;
  - Deploy's `STEP124_PLANT`;
  - the cleanup after the owner's test.

**Never:**
- **A schema change.** The `unique (site_id, theme_name)` constraint stays as it is. No Schema phase.
- **Reading Ghost's theme list (`GET /themes/`) to pick a name** (Design Notes).
- **A second derivation of the name**, or the name chosen anywhere after the compile.
- **A name another project holds**, or the project's frozen name changing for any reason.
- **The advisory lock or the rate limit** (7.25), and any change to the `taken` path's sentence.
- **S8a's later-ship shape beyond the row as built.**

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Free name, site's first deploy | no binding anywhere on this address | `inflozo-name-test`; pill; D1a's box with the permanence line; "new theme · v1" | N/A |
| Held by another account | another account's project bound `inflozo-name-test` to the same url | `inflozo-name-test-2`; the suffix sentence then the permanence line | N/A |
| Next suffix held too | `…` and `…-2` held | `inflozo-name-test-3` | N/A |
| Another of my projects shipped here first | not the site's first deploy, this project unbound | D1a's box and chip, no pill | N/A |
| Frozen | this project's binding exists | the binding's name, whatever `held` says; "Theme" row; `W.chip(n, prev)`; no line, no pill | N/A |
| Renamed after freeze | name changed, slug and binding unchanged | the same name, next version | slug write refused by grant and `guard_slug` |
| Deploy only first | first ship uploaded, not activated (D2f) | bound; next Destination shows the frozen row | N/A |
| Versions pruned | old zips cleared (7.22) | the name from the binding, never re-derived | N/A |
| Another site | frozen on S1; first ship to S2 | resolved afresh for S2's address | N/A |
| Claimed meanwhile | name bound by another project between Run checks and Ship it | Ship's re-read: stale; recompiled under the next free name; ships | N/A |
| Held read fails at load | `heldNames` errors | logged; Destination shows the rule over the user's own bindings | Pre-flight reads again |
| Held read fails at Pre-flight | query error | AD-20's infrastructure retry, then the failure screen | logged |
| Bind race | two projects of one account bind one name at once | as today: `failed`, `deploy_running`; the next run resolves a free name | 7.25's lock closes it |
| Preview-only site | B15 | no theme row, as today | N/A |
| A theme Inflozo never recorded | a hand upload or deleted project's `inflozo-name-test` on the Ghost | not detected; D1a named it; Ghost replaces it | N/A |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/D1 First-Deploy Gates.dc.html` -- D1a `:28-93`:
  - the header `:44-50`, pill `:47` (mono 10/500 `ink-soft`, `line` border, pill radius, 2 × 9);
  - the site card `:64-68`;
  - the theme box `:69-76`: a column, gap 5, `line` border, radius 10, 11 × 13 padding; label 12 `ink-soft`; name mono 12.5/500 at
    `ml-auto`; the line 11px `ink-soft`, 1.55;
  - the radio cards `:77-86`, chip `:88`, Next `:89`.

  S8a, `S8 Deploy.dc.html:23-75`, has no theme box.
- `apps/web/lib/deploy.ts`:
  - `themeNameOf` `:126-128`, whose comment names "the collision suffix is Story 7.24's";
  - `DEPLOY_WORDS` `:250-…` (`theme` `:273`, `chip` `:274`);
  - `ShipState` `:747-791` (`firstDeploy` `:765`, `themeName` `:778`, `shipped` `:784`);
  - `shipStateOf` `:807-876`, whose binding find is `:826` and name `:872`.
- `apps/web/lib/projects.ts:92` `uniqueSlug(base, taken)` -- `base`, `base-2`, … the suffix to reuse (imports only `zod`).
- `apps/web/server/deploy/project-input.ts`:
  - `compileInputOf` `:104`, the parallel reads with the binding `:113`;
  - `bound` `:125`, `themeName` `:159`, `theme.name` `:172`, `reads.themeName` `:192`.
- `apps/web/server/deploy/run.ts`:
  - `readProject` `:179`, Ship's staleness `:646-662`;
  - the bind and the `taken` path `:702-709`, unchanged.

  `deploy-io.ts:146-153` `bind`, unchanged.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts`:
  - the ship reads `:339-349`, where the bindings to the linked site are read under the user's own RLS `:344`;
  - `shipStateOf(...)` `:550-565`.
- `apps/web/components/editor/deploy-wizard.tsx` `destination` `:1146-1238`:
  - the title row `:1149-1154`;
  - the theme row `:1194-1200` (`data-theme-name`);
  - the chip `:1216`.
- `apps/web/app/(app)/app/harness/editor/layout.tsx`:
  - the `x-inflozo-harness-ship` doc `:123-135`;
  - `shipOf` `:442-470`, whose `base` uses `themeNameOf('pilot-sections')`; `first` is the site's first deploy, `full` a first ship
    that is not.
- `apps/web/server-wiring.test.ts:216-235` -- the `supabaseAdmin` importers' allow-list, each with its reason.
- Tests to re-expect or extend:
  - `apps/web/deploy.test.ts:64` (`themeNameOf`);
  - `apps/web/read.test.ts:22,94`. `:94` builds another project's binding named like this one's, which now suffixes;
  - `apps/web/deploy-input.test.ts`, `apps/web/deploy-run.test.ts:514` (`taken`);
  - `apps/web/projects.test.ts:79-83` (`uniqueSlug`);
  - `supabase/tests/rls.sql:309-314` (`guard_slug` PASS).
- Keyboard:
  - `tools/keyboard/journey.spec.mjs:8844-8845`: 7.18a's `full` Destination asserts the name and `DW.chip(1, null)`, which
    becomes `chipNew`;
  - `tools/keyboard/floor.spec.mjs:845-850`: 7.19's floor at 1440, 820 and 390, the widths for D1a.
- Walk:
  - `tools/probe/run-verify-editor.cjs`: the header's plant list `:9-21`; the last step is 123 (`STEP123_PLANT`, the pattern);
  - steps 113/119/120/121/122/123 derive the theme with `themeNameOf(slug)` (`:11881`, `:14095`, `:14494`, `:14569`, `:15322`,
    `:15896`, `:16755`). A kept plant account's binding (e.g. `umngkmr+phone723c`'s `inflozo-phone-test` on T1) now suffixes a
    rerun's throwaway, so each must read the stored name.
- **Ghost:** nothing new claimed. VERIFY 30: Ghost names a theme by the zip's filename, and distinct filenames are distinct themes.
  VERIFY 9: the staff token lifts `GET /themes/`, unused here.

## Tasks & Acceptance

**Dev gate:** nothing waits on the owner but the in-session gos for the writes.

**Execution:**

*The rule:*
- [x] `apps/web/lib/deploy.ts`:
  - `themeNameFor` as in Always;
  - `ShipState.newTheme` and `suffixedFrom`;
  - `shipStateOf({ …, held })`;
  - the five words;
  - `themeNameOf`'s comment updated (the suffix lives in `themeNameFor`).
- [x] `apps/web/server/deploy/held-names.ts` (new):
  - `heldNamesIn` and `heldNames` as in Always;
  - its header carries the finding: why the address and not the site record, and why not Ghost's list (Design Notes).
- [x] `apps/web/server/deploy/project-input.ts` -- read `heldNamesIn` when unbound, and take the name from `themeNameFor`.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- `heldNames` beside the ship reads when linked, handed
  to `shipStateOf`.
- [x] `apps/web/server-wiring.test.ts` -- `server/deploy/held-names.ts` joins the allow-list with its reason: names only, scoped to
  a site the caller owns.

*The screen:*
- [x] `apps/web/components/editor/deploy-wizard.tsx` -- Destination: the pill, D1a's box and the chip as in Always. Hooks:
  `data-theme-name` on the name (kept), `data-theme-new` on the box, `data-first-deploy` on the pill.
- [x] `apps/web/app/(app)/app/harness/editor/layout.tsx` -- every shape carries `newTheme` (true unless `shipped`/`live`) and
  `suffixedFrom: null`. A new shape, `taken`, is `full` named `inflozo-pilot-sections-2` from `inflozo-pilot-sections`.
  Document it in the header.

*Tests* (each new assertion seen red under a planted reversion):
- [x] `apps/web/deploy.test.ts` -- `themeNameFor`:
  - free;
  - held → `-2`;
  - `-2` held → `-3`;
  - `-2` held alone → the base;
  - bound beats held.
- [x] `apps/web/read.test.ts` -- `shipStateOf`:
  - `newTheme` and `suffixedFrom` from the binding and `held`;
  - a `held` read of null logged and counted as none;
  - its own `bindings`' other projects folded in;
  - re-expect `:94`.
- [x] `apps/web/held-names.test.ts` (new) -- `heldNamesIn` over a recorded fake client:
  - another account's same-url binding held;
  - a disconnected record's held;
  - this project's own excluded;
  - another url's not held;
  - a `siteId` not the caller's → `[]` with no second query;
  - sorted.
- [x] `apps/web/deploy-input.test.ts`:
  - unbound and held → `package.json` and the filename carry `-2`;
  - bound with zero deploy rows and the base held → the bound name, with no held read.
- [x] `apps/web/deploy-run.test.ts` -- a name claimed between Pre-flight and Ship it: Ship it re-makes the artefact and uploads
  under the next free name.
- [x] `tools/keyboard/journey.spec.mjs` -- 7.24 (keyboard only, below the sentinel):
  - (a) `first`: the pill, "Theme to be created", the name, the permanence line, "new theme · v1", then Tab to Next;
  - (b) `full`: the same with no pill;
  - (c) `shipped`: "Theme", no line, no pill, `v2 → v3`;
  - (d) `taken`: `inflozo-pilot-sections-2` with the suffix sentence before the permanence sentence;
  - re-expect 7.18a's `:8845`.
- [x] `tools/keyboard/floor.spec.mjs` -- 7.24 at 1440, 820 and 390 under `first` and `taken`:
  - D1a's pill and box geometry `:47`, `:69-76`;
  - a long name truncating, never wrapping;
  - the line wrapping inside the box;
  - no sideways scroll.
- [x] `tools/probe/run-verify-editor.cjs`:
  - add step 124 and `STEP124_PLANT` (the Verification's run, under `T1_WRITES=1`), written at Dev and never run there;
  - make every step that derives a theme name with `themeNameOf(slug)` read the stored binding's `theme_name` instead.

*Propagation* (standing rules 3 and 7; end with `grep -rn "collision suffix is Story 7.24's\|themeNameOf(" apps/web tools`):
- [x] PRD FR-J10 (`prd.md:429`), a dated note covering:
  - the suffix is resolved across every account's bindings to one address;
  - "cannot be detected in advance" holds for what Inflozo checks — a staff token does lift `GET /themes/` (VERIFY 9), and the
    rule does not read it (Design Notes).
- [x] `EXPERIENCE.md` -- the Deploy Destination row `:191`, a dated note: D1a's box, pill and chip as built, and the suffix
  sentence.
- [x] `epics.md` Story 7.25's card -- a dated line, "Raised by Story 7.24's Create". AD-19's lock is keyed on `site_id`, so two
  accounts shipping to one Ghost do not serialize, and both can resolve the same free name in the same minutes. Key on the
  site's address, or say why not.

**Acceptance Criteria:**
- **Matches the frame.** Given Destination under `first` at 1440, when it shows, then it matches D1a `:28-93`:
  - the pill beside "Ship it";
  - the theme box with "Theme to be created", the name in mono and the permanence line;
  - the chip "new theme · v1" beside Next.

  Under `shipped` it keeps S8a's shape with 7.18a's row.
- **Two accounts, one Ghost, really.** Given two Free accounts on production, each with a project "Name test" connected to T1,
  when the first ships Deploy only and the second opens Ship it, then:
  - the second's Destination names `inflozo-name-test-2` with the suffix sentence;
  - after its Deploy only, T1's theme list (staff token) holds both themes;
  - the first's theme files on T1 still equal its `content_manifest`, so nothing was overwritten.
- **The name holds.** Given that second project bound, when it is renamed and ships again, then:
  - its `slug` is unchanged and the version is `2.0.0` under `inflozo-name-test-2`;
  - Destination shows the "Theme" row with no permanence line;
  - T1 gains no third theme.
- **One rule.** Given any state, then the name Destination shows and the name Pre-flight compiles come from `themeNameFor`, and
  `grep -rn "themeNameOf(" apps/web` finds it only inside `themeNameFor`, the harness and tests.

### Review Findings

*Story 7.24's Review (2026-11-27): five layers — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier (in the main session, on the owner's go) — then walk step 124 and the re-expected steps on production and T1
(Verification). One question for the owner, ruled (R-294) and built; two items deferred. Each patch is Spec Change Log 7–17.*

- [x] [Review][Decision] A name that moves after Destination showed it is never said — Pre-flight's fresh held read, or Ship it's
  re-make after a name was claimed meanwhile, can upload `-3` while D1a's box said `-2` and "permanent"; no later screen names the
  theme (the epic's "surfaced to the user", "names the exact theme that will be created"). Question 1, ruled option 1 (R-294):
  built — Spec Change Log 17.
- [x] [Review][Patch] Walk step 124b could never pass — `liveManifest` un-awaited; its overwrite claim rested on a manifest that
  cannot discriminate; the start guard's `like` matched longer names [`tools/probe/run-verify-editor.cjs` step 124]
- [x] [Review][Patch] A failed bindings read drew "Theme to be created" and the permanence line over a possibly frozen name
  [`apps/web/lib/deploy.ts` `shipStateOf`]
- [x] [Review][Patch] `heldNames` threw synchronously past `read.ts`' `.catch` when `supabaseAdmin()` throws
  [`apps/web/server/deploy/held-names-io.ts`]
- [x] [Review][Patch] `heldNamesIn` read other accounts' names for a caller whose own record is disconnected
  [`apps/web/server/deploy/held-names.ts`]
- [x] [Review][Patch] The pill's guard (only beside a theme row) was untested — the harness never made a no-row shape a first deploy
  [`apps/web/app/(app)/app/harness/editor/layout.tsx` · `tools/keyboard/journey.spec.mjs` 7.24 (e)]
- [x] [Review][Patch] D1a's name was cut with an ellipsis, hiding the exact permanent name the box exists to show
  [`apps/web/components/editor/deploy-wizard.tsx` · `tools/keyboard/floor.spec.mjs`]
- [x] [Review][Patch] "Within one account a collision cannot happen" is false (a suffixed name can meet a sibling's base); the dedupe
  comment's staleness claim; `read.ts`' header; the PRD note's §7.6 item [`lib/deploy.ts`, `held-names.ts`, `read.ts`, `prd.md`,
  `EXPERIENCE.md`, `epic-7-context.md`]
- [x] [Review][Patch] The owner's test kept accounts A and B, whose bindings would hold the name for every later account and refuse
  walk step 124 [this spec, After the test]
- [x] [Review][Patch] Walk 124c and the owner's step 5 went to `/projects`, which is not the Projects page — found by 124's first
  run on production [`tools/probe/run-verify-editor.cjs` 124c · this spec, step 5]
- [x] [Review][Patch] Walk 113f waited for a `done` B12b never lets come (stale since 7.20a: 113a declines the token)
  [`tools/probe/run-verify-editor.cjs` 113f]
- [x] [Review][Defer] Journey 7.23c (e) failed once in CI on the Dev head [`tools/keyboard/journey.spec.mjs` 7.23c (e)] — deferred,
  pre-existing (DW-406)
- [x] [Review][Defer] Walk 121 stopped at a different History drawer press in each of three runs; 7.24's part of it held
  [`tools/probe/run-verify-editor.cjs` step 121] — deferred, pre-existing path (DW-407)

## Spec Change Log

**Dev (2026-11-27).** Each entry is outside the frozen block, except where it says so, and was made where the build met a fact the
plan did not hold.

1. **`heldNames` lives in `server/deploy/held-names-io.ts`, not beside `heldNamesIn`** (the frozen Always names one file for both;
   behaviour unchanged). `held-names.ts` must load under `node --test` for `held-names.test.ts`, and a file that imports
   `supabaseAdmin` cannot: `lib/supabase/server.ts` imports `next/headers`, which Node's resolver cannot find without Next's bundler
   (executed: `ERR_MODULE_NOT_FOUND`). It is the codebase's own split — `put-back.ts`/`put-back-io.ts`, `snapshot.ts`/`snapshot-io.ts`.
   So `held-names-io.ts` (one line over `heldNamesIn`) is the file on `server-wiring.test.ts`' service-role list, the nineteenth, with
   the reason Tasks gave; `held-names.ts` carries the finding header.
2. **`STEP124_PLANT`'s B stores T1's Staff Access Token through Manage keys instead of recording a Not now.** The decline the plan
   named would make the owner's step 3 untrue: a first upload with no token asks Ghost's theme list with the Admin API key, Ghost
   refuses it (403, VERIFY 9's other half), and the job rests on B12b ("Deploy without a snapshot") before anything uploads — walk
   step 117c holds exactly that. With the token stored and the Backup step confirmed (the service key), B's wizard still has four
   steps, and its Ship it captures T1's own theme and uploads. "Before you start" and Verification's plant line are reworded to match.
3. **The suffix's base in `shipStateOf` is the rule itself with nothing held** (`themeNameFor({ slug, bound: null, held: [] })`), so the
   One rule criterion's grep finds `themeNameOf(` only inside `themeNameFor`, the harness and the tests.
4. **Every walk step that derived its theme name now asks `productThemeName`** (a top-level helper): the stored binding when there is
   one, else `themeNameFor` over every other project's stored binding at the site's address — the steps that named the theme before
   their first upload (113, 119, 120, 121, 122, 123) have no binding to read yet. Step 113 reads it once the project is linked, and
   its two first-ship chip expectations become `chipNew(1)`.
5. **The name in D1a's box needs no `min-w-0`.** `truncate`'s `overflow: hidden` already zeroes a flex item's automatic minimum (a
   planted `min-w-0` removal stayed green); the label carries `shrink-0`, without which a long name squeezed "Theme to be created"
   onto two lines (the floor's one-line check, seen red under that reversion).
6. **The main session's matrix audit added one test** for the I/O row "Another site" (frozen on S1, first ship to S2): nothing held
   that row by itself — the binding read's `site_id` filter was asserted nowhere. `deploy-input.test.ts`' "frozen on one site, a first
   ship to ANOTHER site resolves afresh there" binds the project on S and compiles for S2 at another address: unbound, the base name,
   the held read at S2's address. Its fake answers as a table would (an unfiltered read finds S's row), and it went red with
   `.eq('site_id', siteId)` removed from Pre-flight's binding read, green restored. Spec Change Log 2 was checked against
   `run.ts`' `ship()`: the first upload per site record captures unless `withoutSnapshot`, so a decline with no token rests on B12b.

**Review (2026-11-27).** Five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, the Real-infra verifier
in the main session). Patched, each outside the frozen block:

7. **Walk step 124b could never pass:** `liveDiff124` handed `compareManifests` the un-awaited `liveManifest` Promise (every file
   would read removed). Awaited, as 121's does. Its check sentence now says what proves no overwrite — T1 listing BOTH names — since X
   and Y compile the same fixture and an overwrite under the base would leave X's files equal to X's manifest too. And the start
   guard's held read matches the base or a suffix of it, never a longer name that merely starts with it (`inflozo-name-testing`).
8. **A failed bindings read drew D1a's box over a possibly frozen name** ("Theme to be created", the permanence line, maybe a suffix).
   `newTheme` and `suffixedFrom` now need a bindings read that answered; a failed one keeps 7.18a's row. `read.test.ts`, red under
   the reversion.
9. **`heldNames` throwing synchronously** (`supabaseAdmin()` with its key unset) escaped `read.ts`' `.catch` and failed the editor
   load: it is `async`, so the throw is a rejection counted as none.
10. **The caller's own record must be connected** for `heldNamesIn` to read anything (`.is('disconnected_at', null)` on the first
    query — a narrowing of Always' step 1): the Design Notes' reason ("anyone who can connect the site holds its Admin key") is no
    reason for a disconnected record, and neither caller draws a name for one (Pre-flight returns earlier; Destination draws no row).
    `held-names.test.ts`, red under the reversion. Its header now says what the address cannot match (one Ghost under two
    addresses), and a `ponytail:` line names the unindexed `sites.url` scan.
11. **The pill's guard was untested:** every harness shape but `first` said `firstDeploy: false`, where production counts an
    unlinked project and an unshipped Preview-only site as first deploys. The harness's `unlinked` and `preview` now carry
    `firstDeploy: true` (neither draws Run checks, so neither meets the Safety net), and journey 7.24 (e) holds no pill there and
    none while the site picker is open — red with `themeRow &&` removed. The box's branch reads the same `themeRow`.
12. **D1a's name is never cut** (a routine call under R-74, beside the epic's "names the exact theme that will be created so the
    user can catch it"): the Tasks' "a long name truncating, never wrapping" hid any name past about 24 characters on a phone, and
    slugs run to 80. The name stays on the label's row while it fits, else wraps onto its own line under the label, right-aligned,
    breaking anywhere. The floor's long-name rows now assert it whole, wrapped, under the label and inside the box — red under
    `truncate` restored. 7.18a's "Theme" row (a name already on the site) still truncates.
13. **Words:** "within one account a collision cannot happen" corrected in `lib/deploy.ts`, `held-names.ts`, the PRD note, these
    Design Notes and the epic context; the dedupe comment no longer claims the staleness hash reads the held set (it reads the name);
    `read.ts`' header names its one service-role read; the PRD note says VERIFY 9 answers its §7.6 item; EXPERIENCE's note says the
    name wraps. The Code Map's "re-expect `read.test.ts:94`" was a wrong premise (`:92` builds `inflozo-other`); Dev added `:96`.
14. **After the owner's test** Claude also deletes accounts A and B: their bindings at T1's address would otherwise hold
    `inflozo-name-test` and `-2` for every later account and refuse walk step 124's start.
15. **The Projects page is the app's root, not `/projects`** (found by walk step 124's first run on production: 124c timed out on
    "Options for Name test", because `/projects` only prefixes a project's own routes). 124c goes to `at('/')`, and the owner's step
    5 gives `https://app.inflozo.com/`.
16. **Walk step 113f had been stale since Story 7.20a** (found by its first run since then, here): 113a answers the Safety net
    with Not now, and since 7.20a a site record's first upload captures its live theme, which needs the staff token — so Ship it
    rests on B12b (`snapshot_needs_token`, 117c's case) and 113f waited for a `done` that never came, skipping 113g–113i. 113f now
    answers B12b with Deploy without a snapshot when it appears; later ships find the binding and capture nothing. Not this
    story's defect; this story's own parts of 113 (the name read through `productThemeName`, `chipNew(1)` at 113c and 113f) passed
    on the first run.
17. **R-294 (Question 1, option 1, owner 2026-11-27), built:** `movedFrom(ship, deploy.themeName)` in `lib/deploy.ts` — the name
    D1a's box showed, when this was a "Theme to be created" ship (`newTheme`) and the deploy row the route answers
    (`DeployView.deploy.themeName`, 7.18a's) names another; else null. Both endings — Live, and D2e/D2f — then say
    `DEPLOY_WORDS.themeMoved`: "It was uploaded as {shipped}, because {shown} was taken by another Inflozo project meanwhile.", one
    `text-ui-dense` `ink-soft` line (`data-theme-moved`), extrapolated from each ending's own helper lines (no frame draws it). A
    frozen name never moves, so a Theme-row ship says nothing more; nor does a ship whose bindings read failed (Spec Change Log 8).
    `deploy.test.ts` (red with the `newTheme` guard removed) and journey 7.24 (f) — D2f and Live with a moved name, and the control
    with the shown name — red with the line removed from either ending. No walk step: staging the race needs a third account's
    upload inside the minute; its parts are each proven — the re-resolve (`deploy-run.test.ts`), the route's `themeName` on
    production (walk 113d, 124), the sentence (journey (f)).

Dismissed, with the reason: the editor's held read while bound (Always names it beside the ship reads, which it runs parallel to);
the harness and journeys writing `-2` literally (expected values); the walk's own copy of the held read (an independent observer
over the product's `themeNameFor`); the pill outside the dialog's name (read in order after the heading); the suffix sentence's
words (frozen); `server-wiring.test.ts`' ordinals (the file's convention); a refused first upload's chip (a refused upload writes
no `uploaded` row); a suffixed name past `history/live`'s 120 (slugs run to 80); the floor in light only (the floor's convention).
Deferred: **DW-406**, the 7.23c (e) keyboard journey that failed once in CI on the Dev head (untouched path, 4/4 on re-run).

## Design Notes

**"One site" is one Ghost site, whichever account connected it.** A routine call, not a question:
- Ghost's theme names live on the Ghost, not in an Inflozo account.
- Within one account a collision almost never happens, because slugs are unique per account (DW-24). Read per site record, the
  epic's suffix criterion would almost never fire. *(The review, 2026-11-27: "never" was too strong — a suffixed name can meet a
  sibling's base in one account, `blog` suffixed to `inflozo-blog-2` beside a project slugged `blog-2`; the rule already counts the
  user's own other projects, so only the sentence was wrong. The frozen Intent's "cannot arise" carries the same overstatement.)*
- Two accounts on one Ghost is real: an agency and its client, or the owner's test accounts on T1.
- Without the suffix, the second account's upload replaces the first's theme, and makes it live when it is the active one (R-264).

The read returns names only. Anyone who can connect the site holds its Admin key, and already sees those themes in Ghost Admin
— so the caller's own record must be connected (the review: a disconnected record's former key is no such reason).

**Why Ghost's own list is not read** (VERIFY 9: the staff token lifts it). The epic keeps "D1a names the theme" as the safeguard
here, and the read would only change behaviour for a theme named `inflozo-{slug}` that no Inflozo binding claims. That theme is
almost always this customer's own:
- a ZIP export uploaded by hand (7.26);
- or a deleted project's theme.

Replacing it is right. Suffixing would leave an orphan beside it, the very thing FR-J10 prevents. It would also cost a Ghost call
on every editor load, and only work where a token is stored.

**The race that remains is 7.25's.** The name is resolved at Pre-flight and again at Ship it, but bound only after Ghost accepts
the upload (the snapshot trigger's rule). Two projects resolving one free name inside the same upload can still collide:
- same account: the 23505 `taken` path, as today;
- two accounts: undetected.

Story 7.25's lock closes the first, and its card now asks it to consider the second.

**The row stays on later ships.** S8a draws no theme row. 7.18a added "Theme" on every ship (EXPERIENCE's Deploy Destination:
"and the theme name") and the owner tested it, so only D1a's first-ship form is new.

## Questions for the owner

Question 1 was raised at the Review (2026-11-27) and ruled the same day: option 1, recorded as **R-294**.

### Question 1 — What are you told if the theme's name changes after Ship it showed it to you?

**In plain English.** Ship it's first screen names the theme it will create — say `inflozo-name-test-2` — and says that name is
permanent. In one rare case the name can still change after that screen: another Inflozo account connected to the same Ghost ships
a project with the same name in the minutes between you opening the editor and pressing Ship it (or the editor could not read the
other accounts' names when it opened). Inflozo then picks the next free name and ships under it. It never overwrites anything, but
today nothing tells you: you would only see the other name later, in Ghost Admin.

**An example.** You open Ship it at 10:00 and see `inflozo-name-test-2`. At 10:02 an agency's account ships its own "Name test" to
the same Ghost and takes `-2`. You press Ship it at 10:05, and your theme lands as `inflozo-name-test-3`.

1. **(RECOMMENDED) Say it at the end.** When the name moved, the last screen adds one sentence, e.g. "It was uploaded as
   inflozo-name-test-3, because inflozo-name-test-2 was taken by another Inflozo project meanwhile." A small change, made in this
   story, so the screen never leaves you believing a name that was not used.
2. **Keep it as built.** Nothing is overwritten and Ghost Admin shows the real name; Story 7.25's lock will make the race rarer.
3. **Stop and show the first screen again** with the new name, so you confirm it before anything uploads. The safest, but it adds a
   stop the plan chose not to have ("recompiled under the next free name and never stops").

**Ruled: option 1 (owner, 2026-11-27).** *"1"* — **R-294**: both endings (Live, and D2e/D2f's "on your site") add the one sentence
when the deploy's theme name differs from the one D1a's box showed. Built in this story's Review (Spec Change Log 17).

## Owner's manual test

**Before you start:** on your go, Deploy plants two new Free test accounts, both connected to T1 (`ghost6.inflozo.com`):
- **A**, `umngkmr+names724a@gmail.com`: a project **"Name test"**, already shipped to T1 with Deploy only. T1 keeps Casper live,
  and A's theme `inflozo-name-test` sits on T1 unused.
- **B**, `umngkmr+names724b@gmail.com`: its own project **"Name test"**, linked to T1, nothing shipped. T1's Staff Access Token is
  already stored for it (through Manage keys) and its backup confirmed, so its wizard has four steps.

You sign in only as **B**.

1. **URL:** `https://app.inflozo.com/sign-in`. **Screen:** Sign in. **Do:** sign in with B's address and open the link that
   arrives. **Type:** `umngkmr+names724b@gmail.com`. **See:** your Projects page with "Name test".
2. **URL:** `https://app.inflozo.com/projects/<B's project id — Deploy fills it in>`. **Screen:** the editor. **Do:** press
   **Ship it**. **Type:** nothing. **See:**
   - "Ship it" with a small **first deploy** pill beside it;
   - the ghost6.inflozo.com card, Connected;
   - under it, a box: **Theme to be created** … `inflozo-name-test-2`, with one line under it: "inflozo-name-test is already used
     on ghost6.inflozo.com by another Inflozo project, so this one gets its own name. This name is permanent for
     ghost6.inflozo.com. Renaming the project later changes its name in Inflozo only.";
   - at the bottom, **new theme · v1** and **Run checks**.
3. **URL:** the same page. **Do:** choose **Deploy only**, press **Run checks**, wait for the checks to pass, then press **Ship
   it**. **See:** the ending saying the theme is on your site but not live. Reload `https://ghost6.inflozo.com`: still Casper.
4. **URL:** the same page. **Do:** close the wizard and press **Ship it** again. **See:**
   - no pill;
   - the box reads **Theme** … `inflozo-name-test-2`, with no line under it;
   - the chip reads **v2**.

   Close it.
5. **URL:** `https://app.inflozo.com/`. **Screen:** Projects. **Do:** on "Name test", open its menu, choose **Rename**,
   and save. **Type:** `Renamed test`. **See:** the card reads "Renamed test".
6. **URL:** `https://app.inflozo.com/projects/<B's project id>`. **Do:** press **Ship it**. **See:** still `inflozo-name-test-2`.
   Close it.
7. **URL:** `https://ghost6.inflozo.com/ghost/#/settings/design/edit` (Deploy checks this path and the button's name in Ghost's
   admin source). **Screen:** Ghost Admin, Design & branding. **Do:** sign in to Ghost as yourself, then press **Change theme**.
   **See:** among the installed themes, both `inflozo-name-test` and `inflozo-name-test-2`, with Casper still active.

**After the test:** say "passed", or list what you saw. On your go, Claude then deletes both test themes from T1, which stays on
Casper, and deletes the two test accounts A and B (their bindings go with them, so a later "Name test" on T1 is free again and walk
step 124's start guard can run).

## Verification

**Commands:**
- `pnpm check` -- expected: green. That is lint, typecheck and every package test, among them `deploy.test.ts`, `read.test.ts`,
  `held-names.test.ts`, `deploy-input.test.ts`, `deploy-run.test.ts` and `server-wiring.test.ts`. The run prints its own counts;
  never write one down.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, `guard_slug`'s PASS among it. No migration changes.
- `pnpm keyboard` -- expected: journeys 7.24 (a)–(d), 7.24's floor at 1440, 820 and 390, and 7.18a's and 7.19's journeys and
  floors (re-expected where named) all green.
- `python3 tools/doc-audit.py --check`, run twice -- expected: green.
- `grep -rn "collision suffix is Story 7.24's" apps/web` -- expected: nothing. `grep -rn "themeNameOf(" apps/web tools` --
  expected: `themeNameFor`, the harness and tests only.

**Real infrastructure** (R-82; each on the owner's in-session go, in the main session, from a clean worktree at the deployed sha):
- **Walk step 124 on production and T1**, with two throwaway Free accounts X and Y, each connecting T1 through the wizard with a
  project "Name test":
  - (a) X's Destination: `inflozo-name-test` (the control: no suffix when the name is free), the pill, the permanence line and
    "new theme · v1". X ships Deploy only: X's binding is `inflozo-name-test`, and T1 lists it, not active;
  - (b) Y's Destination: `inflozo-name-test-2` with the suffix sentence. Y ships Deploy only: Y's binding is `-2`; T1 (staff token,
    `GET themes/`) lists both; X's theme downloaded from T1 equals X's `content_manifest`;
  - (c) Y renamed (`slug` read back unchanged), Destination's "Theme" row with no line, and a second Deploy only: `2.0.0` under
    `-2`, with no third `inflozo-name-test*` on T1;
  - finally: both themes deleted from T1, T1 on `casper`, `routes.yaml` unchanged, both accounts deleted, users and projects
    counted back.

  **Ghost 5's half** (T3, R-238) is postponed to DW-326's pass at Story 15.7.
- **`STEP124_PLANT=<a email>,<b email>`** (Deploy): plants the owner's test above — A shipped Deploy only, B linked with T1's
  Staff Access Token stored through Manage keys and its backup confirmed (Spec Change Log 2), B's Destination read back naming
  `inflozo-name-test-2` with the suffix sentence — and stops.
- **Vercel:** the deployment is READY from the Dev head.
- **The owner's test above (R-80).**

**Executed — Dev (2026-11-27, Node 24; nothing written to production or T1, no key read):**
- `pnpm check` green; `bash supabase/tests/run-rls-gate.sh` green, `guard_slug`'s PASS ("projects.slug frozen once a theme name
  exists") among it; `pnpm keyboard` green in full (7.24 (a)–(d), its floor at 1440/820/390 under `first` and `taken`, 7.18a's
  re-expected journey and 7.19's journeys and floor among them); `pnpm build` green; `python3 tools/doc-audit.py --check` green on its
  second run.
- Each new assertion seen red under a planted reversion: the rule without its suffix, the held read without its owner clause, its
  `neq`, its dedupe/sort and its infrastructure mark, Pre-flight's held read skipped or always run, Ship it never stale, `shipStateOf`
  without its log, its fold, `newTheme` or `suffixedFrom`, `read.ts` handing no `held`; in the browser the pill and the suffix sentence
  removed, the chip and the box reverted, the label's `shrink-0` and the name's `truncate` removed.
- The main session re-ran `pnpm check` under Node 24 after its added test: green (apps/web's run prints its own count).
- `grep -rn "collision suffix is Story 7.24's" apps/web tools`: nothing. `grep -rn "themeNameOf(" apps/web tools`: inside
  `themeNameFor`, the harness and the tests only.
- **Not run at Dev, the Review's and Deploy's on the owner's in-session go:** walk step 124 (`T1_WRITES=1`, from a clean worktree at
  the deployed sha) and `STEP124_PLANT`; the re-expected walk steps 113 and 119–123 (`productThemeName`). `node --check` passes.

**Executed — Review (2026-11-27, Node 24, on the owner's in-session go: "1. Go for all" — walk step 124 and the re-expected steps
113 and 119–123, each at most three runs, all put back, plus read-only reads of production and T1):**
- **CI on the Dev head `961b8f2e` was red, so nothing of the story deployed:** run 45941413602's `check` stopped at `pnpm keyboard`,
  397 passed and journey 7.23c (e) failed once (focus never on the phone card's heading; untouched by this story).
  `--grep "7.23c · the phone" --repeat-each 4` locally: 28 passed. Recorded as **DW-406**. `rls` and the matrix were green.
- **Production, read-only (the service key read in-process by name, nothing printed):** every column the code reads exists
  (`sites` id, url, user_id, disconnected_at; `project_site_bindings` project_id, site_id, theme_name, user_id), and the control —
  an unknown column — is refused 42703 (R-99: no migration, and none needed). **`heldNamesIn` executed against production's
  PostgREST:** T1's address carries 14 site records in 14 accounts (one disconnected); the names it answers equal an independent
  read of every binding there (`inflozo-drift-test`, `-ghost6`, `-history-test`, `-phone-test`, `-restore-test`,
  `-rollback-test` — the kept plants and the owner's own); as the project bound to `inflozo-ghost6` its own binding is excluded
  (another project holds `inflozo-ghost6` there too — the overwrite this story ends, already on production); the controls answer
  `[]` — a site that is not the caller's, and an address that does not exist. Over that answer `themeNameFor` gives `name-test` →
  `inflozo-name-test` (free), `ghost6` → `inflozo-ghost6-2`, `phone-test` → `inflozo-phone-test-2`: so the re-expected walk steps'
  throwaways ship as `-2` beside the kept plants, which `productThemeName` reads.
- **T1, read-only (staff token):** `casper` active; `racer`, `source` and the owner's `inflozo-ghost6` installed, unused; no
  `inflozo-name-test*`.
- **Local:** the touched unit files 57/57, then `pnpm check` (below); the new assertions each seen red under a planted reversion —
  the caller's `disconnected_at` filter removed (`held-names.test.ts` 2 failed), `newTheme: bound === null` restored (`read.test.ts`
  1 failed), `themeRow &&` removed from the pill (journey 7.24 (e) failed), `truncate` restored on the name (the floor's six rows
  failed); green restored each time. `--grep "7\.24"`: 11 passed.
- **CI on the Review head `5d5d521f` green:** run 45951363094 — `check` (the full `pnpm keyboard` with journey 7.24 (e) and the
  inverted floor among it, then `pnpm check` and `pnpm build`), `rls` and `deploy`; the Render matrix green. **Vercel READY** as
  `dpl_Bb2JKkQDh5zZmoyJuofVdWninqkg` from `5d5d521f` on `app.inflozo.com`. (A local whole `pnpm keyboard` run beside another
  session's load — 4 cores at load 20 — voided itself on unrelated canvas journeys and was stopped; CI's is the record.)
- **The deployed walk, from a detached worktree at `5d5d521f`** (node_modules hard-linked, `tools/probe/.env` symlinked, keys
  read in-process by name), each step as a cut — steps 1–5, then the one step, then the walk's `finally` — under `T1_WRITES=1`:
  - **Step 124, run 1: 48 PASS, 1 FAIL** — (a) and (b) held: X's Destination `inflozo-name-test` with the pill, the permanence line
    alone and "new theme · v1" (the control: no suffix while free), X's Deploy only bound it and T1 listed it unused; Y's
    Destination `inflozo-name-test-2` with the suffix sentence before the permanence sentence and the pill, Y's Deploy only bound
    `-2`, T1 listed both, casper live, and X's files on T1 still equal X's manifest. (c) stopped at Projects: the walk went to
    `/projects`, which is not the Projects page (Spec Change Log 15). T1 put back, both accounts deleted, counts back.
  - **Step 124, run 2 (the fix, a cut from the patched walk): 50 PASS, 0 FAIL** — (a) and (b) again, and (c): Y renamed "Renamed
    test" on Projects, its slug read back `name-test`; Destination's "Theme" row naming `inflozo-name-test-2` with no line, no pill
    and the chip "v2"; a second Deploy only `2.0.0` under `-2`, the binding unchanged, exactly `inflozo-name-test` and `-2` on T1,
    casper live; finally T1 put back (casper active, both deleted, `routes.yaml` 130 → 130 bytes), both accounts' objects gone, T1
    disconnected on each, both deleted, users and projects counted back, zero CSP violations. **The criteria "Two accounts, one
    Ghost, really" and "The name holds" are met on production and T1.**
  - **Steps 119, 120, 122, 123 (re-expected through `productThemeName`): 60, 60, 66, 58 PASS, 0 FAIL**, each first time — their
    throwaways named `inflozo-drift-test-2`, `-history-test-2`, `-restore-test-2`, `-phone-test-2` beside the kept plants'
    bindings, the exact case the re-expectation was for.
  - **Step 113:** run 1 stopped at 113f on B12b (stale since 7.20a — Spec Change Log 16), after its 7.24 parts held (the name read
    once linked, `chipNew(1)` at 113c and 113f); run 2, patched: **83 PASS, 0 FAIL**, T1 put back.
  - **Step 121:** 75, 72 and 65 PASS with one stop each, at a different History drawer press every run (DW-407); its 7.24 part — the
    name `inflozo-rollback-test-2` through 121a–121h — held in all three. The go's three runs are spent.
  - T1 read back after the last run: `casper` active; `racer`, `source` and the owner's `inflozo-ghost6`; nothing of the walk's.
  - **Ghost 5's half** (T3, R-238) stays postponed to DW-326's pass at Story 15.7.

**Executed — the ruling (R-294, 2026-11-27, Node 24):** `deploy.test.ts` 35/35 (R-294's test red with `movedFrom`'s `newTheme` guard
removed); `--grep "7\.24"` 12 passed, journey 7.24 (f) red with the line removed from D2f's ending and, separately, from Live's;
`pnpm check` green. Walk step 124's three ships now also hold that no R-294 line is drawn when the name the box showed is the one
that landed (the real-infra control for the new line), for the run on the ruling's deployed head below.
- **The ruling's deploy:** CI run 45961847930 green on `e6774be1` (`check` with the full `pnpm keyboard`, `rls`, `deploy`), the
  Render matrix green; Vercel READY as `dpl_HFdZmBsBUKazFDZNeG5EZnaufiFx`. **Walk step 124, run 3 of the go's three, from a clean
  worktree at `e6774be1`: 49 PASS, 1 FAIL** — every claim held again, now with no R-294 line on any of the three endings (each
  landed under the name its box showed: the line's real-infra control). The one FAIL is the `finally`'s own cleanup sub-check:
  X's disconnect through the product (a fresh sign-in, then Disconnect) had not landed within 30 s when the account was deleted —
  the deletion took the site record with it. Read back afterwards: T1 on `casper` with only `racer`, `source` and the owner's
  `inflozo-ghost6`; production at T1's address 14 site records (one disconnected) as before the run, no `inflozo-name-test*`
  binding, 27 users and no `editor-harness` throwaway left.
