---
title: 'Story 7.24 — Theme naming, frozen per site'
type: 'feature'
created: '2026-11-27'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-19-the-first-deploy-credential-step-and-its-decline-path.md']
---

## In plain English

When you ship a project to a Ghost site for the first time, the first screen of Ship it now tells you exactly what the theme will
be called on your site — for example `inflozo-name-test` — and says that this name is permanent there, and that renaming the
project later only changes its name inside Inflozo. If another Inflozo project (yours, or another Inflozo account connected to the
same Ghost site) already uses that name, your project's theme gets its own name, such as `inflozo-name-test-2`, and the screen
says why, so one project can never overwrite another's theme. Once a theme has landed on a site its name never changes there,
whatever you rename, prune or ship next.

No question for the owner. Two routine calls, said in Design Notes: "one site" means one Ghost site, whichever Inflozo account
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
- [ ] `apps/web/lib/deploy.ts`:
  - `themeNameFor` as in Always;
  - `ShipState.newTheme` and `suffixedFrom`;
  - `shipStateOf({ …, held })`;
  - the five words;
  - `themeNameOf`'s comment updated (the suffix lives in `themeNameFor`).
- [ ] `apps/web/server/deploy/held-names.ts` (new):
  - `heldNamesIn` and `heldNames` as in Always;
  - its header carries the finding: why the address and not the site record, and why not Ghost's list (Design Notes).
- [ ] `apps/web/server/deploy/project-input.ts` -- read `heldNamesIn` when unbound, and take the name from `themeNameFor`.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` -- `heldNames` beside the ship reads when linked, handed
  to `shipStateOf`.
- [ ] `apps/web/server-wiring.test.ts` -- `server/deploy/held-names.ts` joins the allow-list with its reason: names only, scoped to
  a site the caller owns.

*The screen:*
- [ ] `apps/web/components/editor/deploy-wizard.tsx` -- Destination: the pill, D1a's box and the chip as in Always. Hooks:
  `data-theme-name` on the name (kept), `data-theme-new` on the box, `data-first-deploy` on the pill.
- [ ] `apps/web/app/(app)/app/harness/editor/layout.tsx` -- every shape carries `newTheme` (true unless `shipped`/`live`) and
  `suffixedFrom: null`. A new shape, `taken`, is `full` named `inflozo-pilot-sections-2` from `inflozo-pilot-sections`.
  Document it in the header.

*Tests* (each new assertion seen red under a planted reversion):
- [ ] `apps/web/deploy.test.ts` -- `themeNameFor`:
  - free;
  - held → `-2`;
  - `-2` held → `-3`;
  - `-2` held alone → the base;
  - bound beats held.
- [ ] `apps/web/read.test.ts` -- `shipStateOf`:
  - `newTheme` and `suffixedFrom` from the binding and `held`;
  - a `held` read of null logged and counted as none;
  - its own `bindings`' other projects folded in;
  - re-expect `:94`.
- [ ] `apps/web/held-names.test.ts` (new) -- `heldNamesIn` over a recorded fake client:
  - another account's same-url binding held;
  - a disconnected record's held;
  - this project's own excluded;
  - another url's not held;
  - a `siteId` not the caller's → `[]` with no second query;
  - sorted.
- [ ] `apps/web/deploy-input.test.ts`:
  - unbound and held → `package.json` and the filename carry `-2`;
  - bound with zero deploy rows and the base held → the bound name, with no held read.
- [ ] `apps/web/deploy-run.test.ts` -- a name claimed between Pre-flight and Ship it: Ship it re-makes the artefact and uploads
  under the next free name.
- [ ] `tools/keyboard/journey.spec.mjs` -- 7.24 (keyboard only, below the sentinel):
  - (a) `first`: the pill, "Theme to be created", the name, the permanence line, "new theme · v1", then Tab to Next;
  - (b) `full`: the same with no pill;
  - (c) `shipped`: "Theme", no line, no pill, `v2 → v3`;
  - (d) `taken`: `inflozo-pilot-sections-2` with the suffix sentence before the permanence sentence;
  - re-expect 7.18a's `:8845`.
- [ ] `tools/keyboard/floor.spec.mjs` -- 7.24 at 1440, 820 and 390 under `first` and `taken`:
  - D1a's pill and box geometry `:47`, `:69-76`;
  - a long name truncating, never wrapping;
  - the line wrapping inside the box;
  - no sideways scroll.
- [ ] `tools/probe/run-verify-editor.cjs`:
  - add step 124 and `STEP124_PLANT` (the Verification's run, under `T1_WRITES=1`), written at Dev and never run there;
  - make every step that derives a theme name with `themeNameOf(slug)` read the stored binding's `theme_name` instead.

*Propagation* (standing rules 3 and 7; end with `grep -rn "collision suffix is Story 7.24's\|themeNameOf(" apps/web tools`):
- [ ] PRD FR-J10 (`prd.md:429`), a dated note covering:
  - the suffix is resolved across every account's bindings to one address;
  - "cannot be detected in advance" holds for what Inflozo checks — a staff token does lift `GET /themes/` (VERIFY 9), and the
    rule does not read it (Design Notes).
- [ ] `EXPERIENCE.md` -- the Deploy Destination row `:191`, a dated note: D1a's box, pill and chip as built, and the suffix
  sentence.
- [ ] `epics.md` Story 7.25's card -- a dated line, "Raised by Story 7.24's Create". AD-19's lock is keyed on `site_id`, so two
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

## Spec Change Log

## Design Notes

**"One site" is one Ghost site, whichever account connected it.** A routine call, not a question:
- Ghost's theme names live on the Ghost, not in an Inflozo account.
- Within one account a collision cannot happen, because slugs are unique per account (DW-24). Read per site record, the epic's
  suffix criterion could never fire.
- Two accounts on one Ghost is real: an agency and its client, or the owner's test accounts on T1.
- Without the suffix, the second account's upload replaces the first's theme, and makes it live when it is the active one (R-264).

The read returns names only. Anyone who can connect the site holds its Admin key, and already sees those themes in Ghost Admin.

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

## Owner's manual test

**Before you start:** on your go, Deploy plants two new Free test accounts, both connected to T1 (`ghost6.inflozo.com`):
- **A**, `umngkmr+names724a@gmail.com`: a project **"Name test"**, already shipped to T1 with Deploy only. T1 keeps Casper live,
  and A's theme `inflozo-name-test` sits on T1 unused.
- **B**, `umngkmr+names724b@gmail.com`: its own project **"Name test"**, linked to T1, nothing shipped. Its Safety net is already
  answered "Not now" and its backup confirmed, so its wizard has four steps.

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
5. **URL:** `https://app.inflozo.com/projects`. **Screen:** Projects. **Do:** on "Name test", open its menu, choose **Rename**,
   and save. **Type:** `Renamed test`. **See:** the card reads "Renamed test".
6. **URL:** `https://app.inflozo.com/projects/<B's project id>`. **Do:** press **Ship it**. **See:** still `inflozo-name-test-2`.
   Close it.
7. **URL:** `https://ghost6.inflozo.com/ghost/#/settings/design/edit` (Deploy checks this path and the button's name in Ghost's
   admin source). **Screen:** Ghost Admin, Design & branding. **Do:** sign in to Ghost as yourself, then press **Change theme**.
   **See:** among the installed themes, both `inflozo-name-test` and `inflozo-name-test-2`, with Casper still active.

**After the test:** say "passed", or list what you saw. On your go, Claude then deletes both test themes from T1, which stays on
Casper.

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
- **`STEP124_PLANT=<a email>,<b email>`** (Deploy): plants the owner's test above — A shipped Deploy only, B linked with the decline
  and backup recorded — and stops.
- **Vercel:** the deployment is READY from the Dev head.
- **The owner's test above (R-80).**
