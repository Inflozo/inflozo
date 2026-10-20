---
title: 'Story 7.18b — Choosing the site, and Pre-flight''s warnings'
type: 'feature'
created: '2026-10-19'
status: 'done'
baseline_commit: 'b4e1a23cf24064ab5cd7d89bf9956787aead9487'
owner_test: passed
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-18a-the-deploy-wizard.md']
---

## In plain English

After this story, the deploy wizard's first step has a **Switch** link (and **Choose a site** when a project has no site
yet) that points the project at any of your connected Ghost sites, and it warns you first when that site speaks another
language or already belongs to another of your projects. Before you ship, Pre-flight now also reminds you of what you may
have missed — pages nobody looked at as each kind of visitor, sign-ups your site cannot take, settings Ghost will forget,
starting words you never translated, a language your site does not use, and more — and none of these stops you, except a
right-to-left language you have not acknowledged. Ship it also refuses, in plain words, to send a theme to a site the
project no longer points at.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1–5 were ruled by the owner (2026-10-19), each option 1: R-267 to R-271.** "Ruled values" in Design Notes is
the one table they set. **This is Story 7.18b (R-259):**
choosing the site, and Pre-flight's warning-only rows, on Story 7.18a's wizard.

**Problem:**
- **A project can never change its site.** The one writer of `projects.linked_site_id` is "Use your brand"'s insert
  (`sites/actions.ts:939`). A project made with New project or Duplicate has no site, and its Destination says so with
  no way forward but Sites, which cannot link it either. S8a draws **Switch** (`S8 Deploy.dc.html:54`); 7.18a left it out.
- **Pre-flight shows only the two gates, the routing and R-260's row.** Eleven warnings the PRD and earlier stories
  promised for the moment before a deploy have no row: FR-D16, FR-H2 (two), FR-H6, DW-297, the dropped settings (7.10's
  Q2), the changed built-ins (7.11's Q2), FR-Q6's RTL repeat and locale mismatch, and the untouched words (7.12's Q1).
- **7.18a's Review left four items here** (DW-374, DW-375, DW-377, DW-378).

**Approach:**
- **Switch** opens a site picker inside the wizard. Choosing a site runs one server action, `switchSite`, that relinks
  the project under the lock. A confirm comes first when the site belongs to another project (Question 1) or its stored
  language differs from the project's (FR-Q6). A project linked for the first time takes `languageAtLink`.
- **Pre-flight stores the facts only the compile knows** on the Deploy row, in one new column `deploys.preflight`
  (a `Schema` push first, R-99): the templates that ship, `config.custom` as shipped, FR-H2's guarded contexts, and the
  files carrying a free member ask. One pure module, `lib/preflight.ts`, turns those facts and the editor's own state into
  warning rows. The RTL block is a server verdict, like the routing block.
- **Ship it re-reads the project's link** and refuses a job whose site is no longer it (DW-374).

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** Every frame lives in `claude-design-export/Inflozo/`. Design Notes, "Words", holds every string.
  - **Switch:** S8a's site card, `S8 Deploy.dc.html:50-55` — "Switch" after the Connected chip, behind its divider.
  - **The picker (undrawn):** extrapolated from S8a's site card for each row and from D4d's radio list
    (`D4 Dashboard Sheets and Blocks.dc.html:177-226`), inside S8's 520px modal, with S11's chips (`S11 Sites.dc.html:60-117`).
  - **The confirm (undrawn):** S8e's dialog (`S8 Deploy.dc.html:337-345`), Cancel focused (UX-DR14).
  - **Pre-flight's rows:** S8b's warning rows (`S8 Deploy.dc.html:103-116`): the collapsed row with "Fix in editor", and
    the expanded row on `#FFFDF6`. A list inside an expanded row is extrapolated from that row.
  - **The refused-upload line:** under B15's panel as 7.18a draws S8a′ (`S8 Deploy.dc.html:245-262`).
- **The facts.**
  - Pre-flight's server facts come from the compile of STORED rows (7.18a's rule), never `editorData`.
  - The client's facts come from the editor's own state after Run checks' flush: its docs (synthesised docs included),
    the View as records, the members record, the language and the site.
  - "Since your last deploy" means this project's latest ACTIVATED deploy to the job's site. Ghost syncs a theme's
    settings at activation (Fact F2).
- **One rule per thing (R-170).**
  - FR-H6's sentences are `membersNotice`'s.
  - FR-H2's archive body is `FEEDLESS`'s.
  - The RTL, mismatch and untouched words are `TRANSLATION_WORDS`'.
  - A member ask is `asksIn`'s, for the panel and for Pre-flight alike.
  - "Fix in editor" is Pre-flight's one name for opening a canvas.
- **Warnings never block.** The one blocking row is the RTL one while `rtl_ack_at` is empty. It is a server verdict:
  `rtl_unacknowledged`, before compile.
- **Switch writes only `projects`** (`linked_site_id`, and `language` at a first link). It does so through the user's own
  session, after checking that the site is the user's own and connected. The foreign key checks existence only
  (`server/site-settings.ts:111-114`).
- **AD-10 is unchanged.** `ADMIN_WRITES` stays four, no new Ghost call is made, and Ghost's stored setting values are
  never read.
- **R-98:** every new control in flight swaps to its present-tense label, `aria-disabled` + `aria-busy`. `busy.test.ts`
  stays green.
- **R-82, R-238:** Review and test run on production and T1 only. Ghost 5's half goes to DW-326.

**Ask First:**
- Questions 1–5 were ruled (R-267–R-271). Dev builds the ruled options.
- Applying the Schema migration to production (R-99).
- Any string beyond "Words".
- Any change to `projects_linked_site_id_key`.
- If Ghost's admin source on either major has no address that opens the Design panel, stop and ask.

**Never:**
- **7.18c's scope:** DW-304, DW-307, DW-308.
- **Other stories' scope:** the first-deploy steps (7.19, 7.20); the collision suffix and D1a (7.24); the advisory lock
  (7.25); the theme-size budget (7.29); the failure email and DW-376's sentence (7.31); history and rollback (7.23).
- **Out of bounds here:**
  - a site picker anywhere but the wizard;
  - an "unlink" control (the move in Question 1 is the only unlink);
  - reading or writing Ghost's `custom_theme_settings`;
  - counting the routing warnings or the new rows in the gates' "{e} errors · {w} warnings" chip.
- Editing `claude-design-export/`, a `record` document or a generated file; writing a count down.

## I/O & Edge-Case Matrix

"The site" is the one picked or linked; "held" means another of the user's projects links it.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Switch opens | Destination with a linked site, connected or Preview-only | the picker lists the user's connected sites, the linked one chosen | — |
| Choose a site | no linked site; ≥1 connected site | "Choose a site" opens the same picker; with none connected, only "Go to Sites" | — |
| Same site | the linked site chosen | "Use this site" returns to Destination; nothing written | — |
| Plain switch | an unheld site, same stored language or none stored | `linked_site_id` written; Destination shows it; the editor follows the new site | a site gone or disconnected meanwhile → "That site is no longer connected." and nothing written |
| Held site (Q1, option 1) | another project links it | confirm names that project; on Switch, it is unlinked and this project linked | a 23505 race re-reads and asks again |
| Language differs (FR-Q6) | stored locale ≠ the project's language, exactly | confirm names both languages; the project keeps its language | — |
| First link | no linked site, language `en` | language := `languageAtLink(locale)`; the chosen row says so; no confirm for language | an RTL locale leaves `rtl_ack_at` empty → Pre-flight blocks |
| First link, language chosen | no linked site, language ≠ `en` | as "Language differs"; the language is kept | — |
| Unsent edits | the journal holds edits | the switch flushes first; if edits stay unsent, nothing is written and the wizard says why | — |
| Ship after a switch (DW-374) | `linked_site_id` ≠ the job's site, or null | `failed`, nothing uploaded, Question 3's sentence | `site_changed` · `site_unlinked` |
| Refused-upload site (DW-375, Q4) | `preview_only` with source `deploy_error` | B15's panel, the line, and Run checks | an accepted upload clears the mark (7.18a); a refused one marks it again |
| Probed Preview-only | `preview_only`, source not `deploy_error` | as 7.18a: no Run checks | — |
| RTL, unacknowledged | `isRtl(language)`, `rtl_ack_at` null | blocked before compile; Ship it greyed; link to Translations | `rtl_unacknowledged` |
| RTL, acknowledged | `rtl_ack_at` set | a warning row repeating B18's words and the date | — |
| Locale mismatch | language ≠ `en`, stored locale differs | a warning row and "Change it to {code} in Ghost ↗" | none with no stored locale |
| Untouched words | language ≠ `en`, `untouchedWords` non-empty | a row listing each section, "Fix in editor" each | — |
| Members (FR-H6) | `membersNotice` non-empty, and a placed (non-`auto-`) ask or a designed Paywall | a row with every sentence and the canvases | no record → nothing (R-4) |
| Free ask below 5.62 (DW-297, Q2) | Ghost 5.x, minor < 62; a file carries `@site.allow_self_signup` | a row naming the canvases and the update | an unparsable version → no row |
| Dropped settings | keys in the last activated deploy's `custom` that this one lacks | a row naming each by Ghost's label | no earlier activated deploy, or no facts on it → no row |
| Changed built-ins | `dark_accent_color` or `color_scheme` default ≠ the last activated deploy's | one row per key: the new start, what Ghost keeps, the Design panel link | as above |
| Feed-less archive (FR-H2) | `noindex` holds `tag` or `author` | a row per page with `FEEDLESS`'s body | — |
| Picks (FR-H2) | a shipped canvas's hand-picked ids + the site doc's > 25 | one row listing each canvas and its total | — |
| Unviewed (FR-D16) | a shipped canvas whose record lacks a visitor | one row listing each canvas and its missing visitors | Editor cards never listed |
| R-260 reading (DW-377, Q5) | the read in flight | "Checking that every post appears on a page…" | more than 2,000 posts → "We checked your newest 2,000 posts." |

</frozen-after-approval>

## Code Map

**7.18a's wizard (the base).**
- `components/editor/deploy-wizard.tsx`:
  - the props `:240-278`, mounted by `editor.tsx:6792-6811`;
  - Destination `:488-582`: no site `:497-504`, the site card `:507-526`, Preview-only `:527-535`, the full branch `:537-577`;
  - Pre-flight `:585-690`: `checkRows` `:373`, the `[data-check-rows]` list `:615-630`, routes `:631`, R-260's row
    `:632-647` (it hides `kind: 'reading'`), `W.warningsOnly` `:651`;
  - `FindingRow` `:887-916` (collapsible; marigold triangle; "Fix in editor");
  - the poll `:351-361` (`setTimeout` 1000) and the announcer `:399-415` / `:877-879`;
  - the confetti `:210` (no `iterations`).
- `lib/deploy.ts`:
  - `DeployCode` `:123-126`, `DEPLOY_WORDS` `:203-335`, `deployError` `:359-387`;
  - `placeOf`/`fileLabel` `:451-466`, `CheckRow` `:473-483`, `checkRows` `:487-519`;
  - `ShipState` `:541-557` (no `capability_source`, no locale), `uploadOnlyBlock` `:563-566`, `DeployView` `:569-584`.
- `server/deploy/run.ts`:
  - `clock` `:185-227`, `fail` `:231`;
  - `compileAndCheck` `:264` (it discards `theme.custom`, `:306-321`);
  - the Deploy write `:333` (`settings_snapshot` = the site's settings);
  - `start` `:344-347` (`site_id` set once);
  - `ship` `:389-410`: R-264's guard `:394-396`, the project read `:399-400`, `c.claim` `:403`;
  - `activate` `:458`, `view` `:548-567`.
- `server/deploy/project-input.ts:101-112`: `projects` (`language`, not `rtl_ack_at`), `sites`
  (`ghost_version`, `site_settings`), and the docs keyed by FILE `:137-147`.
- `server/deploy/deploy-io.ts`: `DEPLOY_COLUMNS` `:30`, `jobs.claim` `:64-67`, `capability` `:120-125`.
- `app/(app)/app/(authed)/projects/[id]/deploy/route.ts`:
  - `holds` (the lock with the user's own client) `:30-43`;
  - `preflight` reads `linked_site_id` `:69-75`;
  - `ship` `:87-95`.
- `(editor)/read.ts`:
  - the sites row `:326` (no `capability_source`);
  - the ship reads `:335-342`;
  - `shipStateOf` `:557-585` (unexported, untested);
  - `linkedSiteOf` `:596-600` (`site_settings.locale`).
- `(editor)/editor.tsx`:
  - `queriesOf` `:1011-1017` (`withData` + `feedQuery`), the source of the picks count;
  - `members` `:1170`, `viewed` `:1325`;
  - `readSitePosts` `:2504-2517` (the canvas's `LiveStore`, `REQUEST_CEILING` 500, `lib/live-content.ts:51-53`).

**Linking.**
- `sites/actions.ts`: `useBrand` `:736`, its insert `:939-943` (`languageAtLink`), and the comment on re-pointing
  `:831-835`. `recheckPlan` `:627-639` cannot clear a Ghost(Pro) `deploy_error` while the flag is off
  (`probe-rule.ts:477-487`).
- `supabase/migrations/20260911100000_sweep_constraints.sql:49-51`: `projects_linked_site_id_key` (one project per site,
  DW-69); `SCHEMA.sql:255-260`.
- The Sites list's own read `sites/(list)/page.tsx:195-200`. There is no shared reader. Plans: `lib/plan.ts:35-36`
  (Free 1 site, Pro 10).

**Language (Story 7.12).**
- `packages/library/src/languages.ts`: `languageAtLink` `:158-159`, `isRtl` `:155`.
- `lib/translations.ts`: `TRANSLATION_WORDS` `:42-93`, `untouchedRows` `:121-134`, `siteLocaleDiffers` `:137-138`.
- The Translations page: `nameOf`, the switch dialog `translations.tsx:296-316`, and `adminAt(url,
  'publication-language')` (`translations/page.tsx:62`).
- `starting-words.ts:32` `untouchedWords(docs keyed by template_key, library)`.

**The facts behind the rows.**
- `view-as.ts`: `unviewed` `:81`, `ROWS` `:43-47`, `NOT_VIEWED` `:55`.
- `main-feed.ts`: `visibleFeed` `:35`, `feedlessArchive` `:121-122`.
- `data-group.ts`: `FEEDLESS` `:80-81`, `SLOW_AFTER` `:67`, `PAST_SLOW` `:69-70`.
- `compile.ts`:
  - FR-H2's `guarded` `:1134-1142` over `PAGED_CONTEXTS` `:241`;
  - `CustomRecord` `:212`, the record `:828`, returned `:1299`;
  - `config.custom` written `:327`.
- `custom-settings.ts`: `builtInSettings` `:63-71`, `SCHEME_START` `:53`, `ghostName` `:169`.
- `paywall.ts`:
  - `FACTS` `:84-98`, `membersNotice` `:103`;
  - `AdminAnchor`/`adminAt` (no `design`);
  - `askOf` `:139` (markup only), `warnsOn` `:143`, `askLine` `:148-153`.
- `probe-rule.ts:597-600` `storedMembers`. The gap is that A4's `primaryAction.url` defaults to `{portal:'signup'}`
  (`a4/content.json:10`) and the compile gates it (`marks.ts:168-172` `linkGate`, `core.ts:1383-1388`), while `askOf`
  never sees it.
- `vocabulary.ts:412-415` `ASK_FLAGS`, `matrix.json:117-120`, and `connect-rule.ts:130-137` `versionVerdict`.

**DW-378's places.**
- `deploy-io.ts:64-67` (fake only, `deploy-run.test.ts:91`), `read.ts:557`.
- `routes/actions.ts:295` `resetRoutes` (regex only, `routes.test.ts:282-286`).
- `ghost-admin/index.ts:382,438` (`timeoutFor` values only, `ghost-admin-rule.test.ts:240-243`).
- `tools/check-traces.mjs:154-171` (four-file theme).
- The journeys: `journey.spec.mjs:8639`, `:8743`, `:8822`, `:8572`, `:8552-8570`, `:8620`, `:8950`, `:8962`.
- The walk: `tools/probe/run-verify-editor.cjs` step 113 `:11515` (step 114 follows it).

## Tasks & Acceptance

**Dev gate:** Questions 1–5 are ruled (R-267–R-271, Ruled values). The Schema phase is its own push, before any code (R-99).

**Execution — Schema phase (pushed first, alone):**
- [x] `supabase/migrations/20261020120000_preflight_facts.sql` — add `deploys.preflight jsonb` (null on every earlier
  row), with a `comment on column` naming its shape `{ templates, custom, noindex, freeAsks }`. Give the tenant SELECT on
  it as on 7.18a's two columns. Rationale: the facts the warning rows read, kept per deploy, so "since your last deploy"
  can compare.
- [x] `SCHEMA.sql` — the same column and comment. Rationale: the gate diffs `pg_dump -s`.
- [x] `supabase/tests/rls.sql` and `RLS-TEST.sql` (byte-identical) — the tenant reads `preflight` on its own deploy,
  never on another's, and writes it never. The server-asserted list names it. DW-378: the service role's
  `update deploy_jobs … where id = $1 and stage = 'awaiting_ship'` changes one row, and the same statement again changes
  none. Rationale: AD-31; `jobs.claim`'s condition run in Postgres.

**Execution — Dev:**
- [x] `packages/theme-compiler/src/compile.ts` — `CompiledTheme` gains `noindex: readonly string[]`, the deduped
  `guarded` contexts in emitted order. `compile.test.ts` holds a feed-less Tag (`['tag']`) and a theme with every feed
  (`[]`, the control). Rationale: the warning and the guard read one fact.
- [x] `apps/web/lib/paywall.ts` — `asksIn(entry, instance)` returns the asks a section makes:
  - its markup asks (`askOf`);
  - every `url` prop whose value — the instance's, else the design's default — is a Portal ask (`portalAsk`, as
    `linkGate` reads it);
  - every inline `a` mark to one.

  `askLine` reads `asksIn`, so the panel gains A4's and A1's default buttons. Also add `'design'` to `AdminAnchor`, read
  in both majors' admin bundles first (standing rule 1; Ask First). Rationale: one ask rule (R-170); a placed hero's
  "Sign up" is a placed ask.
- [x] `apps/web/lib/site-switch.ts` (new, pure) — `switchPlan({ project, site, sites })` returns `{ heldBy, firstLink,
  language, warnLanguage }` per the matrix. Add `SWITCH_WORDS`. Rationale: one rule for the picker, the confirm and
  `switchSite`.
- [x] `apps/web/lib/preflight.ts` (new, pure) — `preflightWarnings(facts)` returns the ordered rows of Design Notes'
  table, each `{ kind, title, body?, items: { text, canvas? }[], link? }`. Add `PREFLIGHT_WORDS`, and `picksOn(canvas,
  docs, library, …)`, moved out of `editor.tsx`'s `queriesOf` so the canvas and the count share it. The canvases that
  ship come from `templates` through `placeOf` and the page-2 keys; Editor cards is never one. Rationale: one rule module,
  unit-tested over the matrix.
- [x] `apps/web/lib/deploy.ts`:
  - `ShipState.site` gains `source` and `locale`, and `ShipState` gains `language`, `rtlAckAt` and `sites`
    (`{ id, title, host, url, capability, source, locale, heldBy: { id, name } | null }[]`);
  - `DeployView.deploy` gains `preflight`, and the view gains `previousCustom`;
  - `DeployCode` gains `site_changed`, `site_unlinked` and `rtl_unacknowledged`, each with its Words and fix;
  - Destination's new words go in `DEPLOY_WORDS`.

  Rationale: one wire type.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` — `shipStateOf` reads the additions, is exported,
  and is unit-tested (n, prev, liveHere, a disconnected site, Preview-only by each source, the sites list with `heldBy`).
  The sites and the user's linking projects are read with the user's own session. Rationale: DW-378; the picker's data.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts` — `switchSite(projectId, siteId, session,
  confirmed)`:
  - check the lock through the deploy route's `holds`, extracted into one shared helper;
  - read the site with `disconnected_at is null`;
  - re-run `switchPlan`, and answer `{ confirm }` when a confirm is owed and not given;
  - unlink the holding project (`where linked_site_id = site`), then link this one, with `language` at a first link;
  - on 23505, re-read and answer again.

  Rationale: FR-B5, Question 1, FR-Q6.
- [x] `apps/web/server/deploy/project-input.ts` and `run.ts`:
  - select `rtl_ack_at`, and block before compile with `rtl_unacknowledged`;
  - write `deploys.preflight` beside `gscan`/`quality` — every `.hbs` file, `config.custom` from the emitted
    `package.json`, `theme.noindex`, and the files containing `@site.allow_self_signup`;
  - in `ship()`, re-read `projects.linked_site_id` after R-264's guard and before `c.claim`, and `fail` with
    `site_changed`/`site_unlinked`;
  - `view` returns `preflight` and `previousCustom` (this project's latest activated deploy to the job's site, other
    than this one).

  `deploy-io.ts`' `DEPLOY_COLUMNS` and reads follow. Rationale: the server facts; DW-374.
- [x] `apps/web/components/editor/deploy-wizard.tsx`:
  - Switch on the site card, the Preview-only card included;
  - "Choose a site" on the no-site branch;
  - the picker view and the confirm;
  - Q4's line and Run checks for a `deploy_error` site;
  - the warning rows after R-260's, each as S8b's row;
  - R-260's reading row;
  - DW-378: announce each stage `stage_timings` shows entered since the last poll, in order, and confetti
    `iterations: 1`.

  Rationale: S8a, S8b, DW-375, DW-377.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:
  - hand the wizard its client facts: docs, entries, `viewed`, `members`, names and `picksOn`;
  - a switch flushes first, then calls `switchSite`, then re-reads the page's data so the canvas, the members record and
    Ship it follow the new site, with the wizard staying open on Destination;
  - `readSitePosts` reads through a reader of its own, newest first, capped at Q5's limit, with the site's total, never
    the canvas's `LiveStore`.

  Rationale: FR-B5, DW-377.
- [x] Tests:
  - `preflight.test.ts`, `site-switch.test.ts`, `paywall.test.ts` (`asksIn`, a hero pointed at an `href` as the
    control);
  - `deploy.test.ts`;
  - `deploy-run.test.ts`: the RTL block; both DW-374 codes, with an unchanged link as the control; the facts written;
    `previousCustom` taking the activated deploy, not an uploaded one;
  - `deploy-input.test.ts`: the real compile's facts;
  - `read.test.ts` (`shipStateOf`);
  - DW-378: `fetchWithKey` passing `timeoutFor(item)` (an injected fetch sees 120 s for `theme_upload` and 15 s
    otherwise), and `check-traces`' recorder run over the pilot theme;
  - `busy.test.ts`.
- [x] `tools/keyboard/journey.spec.mjs` (harness `x-inflozo-harness-ship` gains `refused` and a sites list):
  - the picker, held and language confirms, Cancel focused, and the first-link line;
  - each row kind and the RTL block;
  - Q4's line;
  - R-260's reading row over two pages;
  - DW-378's settles before "stays open" and "opens nothing", "Cancelling…" held on screen, the confetti's one
    iteration, and a 300 ms stage announced.

  Each journey has its control, and none is pointer-driven below the sentinel.
- [x] `tools/probe/run-verify-editor.cjs` — step 114, the Review's, on production and **writing nothing to T1**
  (Design Notes, "Walk").
- [x] Propagation at Dev:
  - **EXPERIENCE:** Deploy Destination's row gains Switch, the picker and the confirm. Pre-flight's "(extended)" row
    lists its rows.
  - **PRD:** dated notes on FR-B5, FR-H2, FR-H6 and FR-Q6.
  - **VERIFY-AT-BUILD:** the Design panel's address, and F2's per-theme reading.
  - **The ledger:** DW-253, 260, 297, 374, 375, 377 and 378 closed, and DW-145's Pre-flight half noted.
  - **The epic context:** Dev's bullet.
  - Finish with a grep for `askOf(` callers and the old `readSitePosts` path (standing rule 7).

**Acceptance Criteria:**
- Given Destination with a linked site, when it shows, then its card **matches S8a** with "Switch" after the Connected
  chip, behind its divider, muted until hover. The Preview-only card carries Switch too.
- Given the picker, when it opens, then it **matches the extrapolation**: S8a's card per row, D4d's radio and coral
  wash, and S11's chips. Focus starts on the chosen row. Esc and "Back" return to Destination.
- Given a confirm, when it opens, then it **matches S8e's dialog**, focus on Cancel, with each owed sentence (Question 1's,
  FR-Q6's).
- Given a finished Pre-flight, when warnings exist, then each is S8b's warning row in Design Notes' order. Each is
  collapsed with its title and "Fix in editor" where it names one canvas, and opens to its body and list. "Warnings won't
  block your deploy." shows, and Ship it stays pressable unless a block exists.
- Given an RTL project with no acknowledgement, when Run checks runs, then Pre-flight blocks before compiling, Ship it is
  greyed with "Acknowledge it in Translations to ship." and "Open Translations", and nothing is stored.
- Given a placed A4 hero with its default Sign up button on a site whose sign-up access is Nobody, when its panel and
  Pre-flight show, then both carry `membersNotice`'s sentence.
- Given a switch, when it lands, then the canvas, Layers' Ghost rows, the members record and Ship it's versions all read
  the new site without a manual reload.
- Given every new control, when pressed, then it swaps to its busy label (R-98).

## Spec Change Log

**Dev (2026-10-19) — readings and departures, each a routine call told in one line (none changes what a surface does):**
- **`shipStateOf` lives in `lib/deploy.ts`, re-exported by `read.ts`.** `node --test` cannot load `read.ts` (its `@/` imports and
  `next/headers`), so the rule moved beside the wire type it builds and `read.test.ts` reaches it there; `read.ts` still calls it
  with the reads, now including the user's connected sites and the projects linking them (both through the user's own session).
- **The editor follows the new site by mounting afresh.** The `(editor)` layout keys the editor on `linked_site_id`, so the
  switch's `router.refresh()` remounts it on the new site — its live store, members record, Ghost's two Layers rows and Ship it's
  versions all the new site's, as a way back from Theme settings already remounts it — and this tab's `SHIP_AFTER` ask (the
  take-over's own path) opens the wizard again on Destination. The modal therefore closes and reopens across the remount.
- **Languages are named by Translations' `nameOf`, which is `ownName`** — each language in its own speakers' words: "Deutsch",
  "العربية", "English". The confirm and the first-link line read so; the owner's manual test (steps 5 and 8) now says so —
  "العربية" — and walk step 114 expects `ownName`'s words.
- **The members row lists the sections whose ask the record STOPS** (`askStopped`, the panel line's own test), and a designed
  Paywall, over the canvases the compile shipped — a deploy kept before its facts lists none. A placed free form on a site that
  only lacks Stripe is not listed.
- **The panel's members-off line stays 5.20's** (`PAYWALL_WORDS.ask`, R-198) on a site set to Nobody; on every other fact it is
  `membersNotice`'s sentence. Pre-flight carries `membersNotice`'s sentences on both. The AC's "both carry `membersNotice`'s sentence" is read
  as "both warn, from R-216's one list": on an invite-only or paid-only site (the owner's test) the two are the same sentence.
- **The free-ask row prints the version as major.minor** ("It runs Ghost 5.40"), as Question 2's ruled sentence does; 5.62 is read
  from the context matrix's `since`, never restated.
- **The unviewed row lists each shipped canvas and its page 2** (Home page 2, Tag page 2, Author page 2), each under its own record
  (R-167), named as Theme settings names pages (`pageOf`); the picks row counts each shipped canvas's page 1 with its site doc.
- **A switch with edits it cannot send writes nothing and says Run checks' own sentence** (`editsUnsent`), the one sentence for
  unsent work (R-170) — no new string. **Choose a site opens the picker at once**, so its "Opening…" never shows.
- **`holdsLock` (`server/edit-lock.ts`) takes the caller's client**: `switchSite` hands its quiet session (R-213), the deploy route
  its own. The switch is two statements — the holder unlinked, then this project linked — never one transaction; a link that
  fails for another reason after the unlink leaves the site with no project until the next switch (stated beside the code).
- **Esc in the picker goes back to Destination, and in its confirm closes the confirm alone** — React carries a nested dialog's
  `cancel` and `close` up its own tree, so the wizard's handlers answer only their own dialog's events.
- **DW-378's announcer joins the stages a read missed**: "Compiling your theme. Checking your theme." in one announcement, in the
  order they started. 7.18a's Cancel journey (its first read) and D2e journey (the activation) now expect it.
- **The harness:** `x-inflozo-harness-ship` gains `refused` and `unlinked` and every shape but none a sites list (the linked one, one
  "Field Notes" holds, one set to German); `x-inflozo-harness-preflight: all` (Arabic, acknowledged, Ghost 5.40) and
  `x-inflozo-harness-picks: <n>`; the editor's new `switchTo` seam is `harnessSwitch` (`x-inflozo-harness-switch: gone` or
  `confirm-held`).
- **The main session's matrix audit (after the implementation) closed three gaps.** (1) `switchSite`'s server half had no test
  that ran — the held move's order, the first link's language, a confirm owed writing nothing, a site gone meanwhile, and the
  23505 race asking again: its loop is now `lib/site-switch.ts`' `switchWith` over an injected `SwitchIo` (`run.ts`' `DeployIo`
  pattern), the action its reads and writes, and `site-switch.test.ts` holds each row, mutation-checked (one pass instead of
  two, and the unlink skipped, each turn a test red). (2) The "Unsent edits" row had no journey: one now holds the switch
  writing nothing behind a refused save, in Run checks' sentence, and the same press sending it once the save lands (the
  control). (3) The AC's "the editor follows the new site" had no check of the canvas: walk step 114.1 now reads the canvas's
  `data-source` — the sample while B is unlinked (the control), T1's content after the switch, with no reload.
- **Step 114 is written, never run** (the Review's): production through a throwaway account `editor-harness-d-…` on Pro, T1 read
  only; its start sweep now catches a killed run's `d` account too.

**Review (2026-10-19) — five layers as subagents (Blind Hunter over the product and over the tests and tools, Edge Case Hunter,
Verification Gap, Acceptance Auditor) and the real-infra checks in the main session; every patch a routine call, none changing what
a surface is meant to do. Three findings are the owner's: Questions 6–8.**
- **Re-activate re-reads the project's link too** (DW-374's rule, extended): a project whose site was switched or moved away while
  it rested on D2e/D2f no longer activates its theme on a site another project now holds. `linkRefusal` is Ship it's and
  Re-activate's one check; the theme stays uploaded where it is, and S8d′ says "Activating failed" with the same two sentences.
- **A confirm covers only what it named** (`Confirmed`, `confirmedOf`, `confirmedFrom`): the confirm's Switch sends the project it
  named and whether it named two languages, and the server asks again unless that covers what is owed NOW — so a site another tab
  handed to a third project is never moved without that project being named. The action's argument is that shape or nothing (a
  truthy stranger confirmed nothing). A confirm the server asks for is said in the polite region when the open dialog's words change.
- **The lock check moved into `switchWith`** (`SwitchIo.holds`), so a tab reading along is refused by a test that runs.
- **R-134 at a first link:** a project holding translation overrides keeps its language and gets FR-Q6's confirm, as Translations
  never changes the language over overrides without its own confirm — routine call 2's "a language the customer chose is never
  overwritten", extended to words they typed. `ShipState.overridden` and the action's own count of `translation_overrides`.
- **The picker plans from the link the server reads** (`ShipState.linkedSiteId`): a project still linked to a DISCONNECTED site is
  no first link on either side (the picker promised the site's language; the server kept English).
- **"Switching…" holds until the re-read lands** (R-98): the editor's re-read runs in a transition (`relinking`), so Destination
  never redraws the old link with a live Run checks before the editor remounts on the new site.
- **The polite region:** a refusal after the checks (DW-374's two, Ship it's own) is said in its own words, never the checks'
  outcome again; an ending is keyed on the last stage it followed, so a Re-activate that ends on D2e again is said again.
- **Focus starts on the chosen row** (a selector list matches in document order, so the checked radio is asked for alone); the
  first-link line shows only when the language changes (never "English, {host}'s language" for a site that stores none).
- **Pre-flight:** a designed page 2 counts its own hand-picked posts (a page of its own, routine call 7); the mismatch title moved
  into `TRANSLATION_WORDS` (`mismatchOn`, R-170 — the words unchanged); `DEFAULT_LANGUAGE` for the literal. Q4's line is 12px ink-soft,
  S8a′'s caption.
- **Checks that could not fail:** the RLS gate's two comment checks passed on a column with NO comment (`null not like …` is null —
  `coalesce`, proved in a PG17 container: the old check passed, the new one raises, the control passes); the RTL rule's control
  now includes an unacknowledged German project that checks and a Hebrew one that blocks; the walk's kinds collapse built-in rows
  alone and its free-ask control compares the whole order; its audit check carries a positive control (the connect's own rows);
  `ghost-admin.test.ts` restores the real `AbortSignal.timeout` and never lets a shell's pooler URL reach its audit write;
  `check-traces`' pilot theme is removed whatever throws; the journeys' "Cancelling…" check is unconditional, the unsent-edits
  control asserts the flush landed, R-260's reads are polled, the rows' count is derived from the kinds, and the no-facts control
  anchors on a drawn row. New journeys: a confirm the server asks for (`confirm-held`, now answering with a third project unless
  the press named it), and a Re-activate said twice and refused by DW-374. New walk sub-steps: a first link writes German on
  production (`switchSite`'s own write), and R-270 from the stored `capability_source`.
- **Deferred, each with an owner on its card** (`deferred-work.md`, `epics.md`): DW-379 (a switch beside a deploy already past its
  claim, 7.25's lock), DW-380 (a refused or abandoned check's zip, 7.22's retention), DW-381 (a failed sites read drawn as an empty
  picker, 7.18c — a new sentence).
- **Dismissed after reading the code:** `updated_at` refused by a column grant (the walk's switches land on production); FR-Q6's
  confirm on an English project and the raw locale code in the mismatch title (the matrix and Words say so); the feed-less row
  for Home's page 2 and Routes templates, members items without "Fix in editor", built-ins only, no row before a deploy kept its
  facts (each as the matrix or Words reads); the picker's Preview-only chip (S8a's card per row, as Destination's own); a free-ask
  flag negated in a template (no design negates it).

## Design Notes

### Rulings this spec is written to

- R-74, R-80–R-83, R-98, R-99, R-145, R-167, R-170, R-195, R-238, R-259, R-260, R-264.
- 7.10's Q2 (dropped settings), 7.11's Q2 (changed built-ins), 7.12's Create and Q1 (locale lines, untouched words),
  5.20's R-4 and R-216 (asks), DW-69 (one project per site).
- **R-267 to R-271** (owner, 2026-10-19): Questions 1–5 below.

### Ruled values (the one table a ruling changes)

| Question | Ruled | What it sets |
|---|---|---|
| Q1 · R-267 | option 1 — move, after a confirm | A held site is offered. The confirm names the holding project, and Switch unlinks it, then links this one. |
| Q2 · R-268 | option 1 — keep the guard, say so | The compile is unchanged. Pre-flight's free-ask row names each canvas and "update Ghost". |
| Q3 · R-269 | option 1 — name both sites | `site_changed` and `site_unlinked`, each with its own sentence (Words). |
| Q4 · R-270 | option 1 — Run checks stays | A `deploy_error` Preview-only site shows the line and Run checks. Probed Preview-only is unchanged. |
| Q5 · R-271 | option 1 — newest 2,000, own reader | `POSTS_CHECKED = 2000`, a reader of its own, the reading row, and the "newest" line over the cap. |
| Q6 · R-272 (Review) | option 1 — the stopped sections only | The members row lists each placed section whose ask the record stops, and a designed Paywall; none, no row. |
| Q7 · R-273 (Review) | option 1 — both as built | On a Nobody site the panel keeps R-198's line; Pre-flight says the Sites sentences. |
| Q8 · R-274 (Review) | option 1 — one shorter sentence | `DEPLOY_WORDS.editsUnsent`, Run checks' refusal and a switch's alike (Words). |

### Routine calls, one line each (said to the owner, not asked)

1. **The language at a switch.** FR-Q6 defaults the language "at first link" and keeps it "always user-editable". So a
   switch never changes it. The confirm names both languages, and Translations is where the language changes.
2. **"First link"** is a link from no site while the language is still `en`. A language the customer chose is never
   overwritten; it gets the FR-Q6 confirm instead.
3. **"Differs"** compares the stored locale and the project's language exactly, case included, as Ghost reads the file
   (`i18n.js:187-199`). A site with no stored locale never warns (7.12's rule).
4. **Switch shows on the Preview-only card too.** S8a′ omits it, but that is the site a customer most needs to leave.
   FR-B5 decides.
5. **"Choose a site" is absent** when the user has no connected site. "Go to Sites" alone says what to do, as today.
6. **The picker lists connected sites only** (`disconnected_at is null`), newest first, as Sites lists them. A site
   whose key Ghost refuses is chosen like any other; its upload says why.
7. **The picks total** for a canvas adds the site doc's picks, because a header's or footer's lists load on that page
   too. The budget is per page.
8. **Never-opened canvases count as unviewed.** Nobody has looked at them, as the card asks. One row lists the canvases,
   not one row each.
9. **Members:** every sentence `membersNotice` gives for the site, once, beside the canvases holding a placed ask or the
   designed Paywall. That is the Sites screen's list (the card).
10. **The free-ask row includes synthesised asks.** The card says "compiled", and the row is a fact about the live site.
11. **Ghost's stored values are not read** (7.11's "this story's Create's to decide"). The Admin key's read of
    `custom_theme_settings` is unproven (§28), most sites hold no staff token, and the row can say what Ghost keeps
    without it.
12. **One column, not a warnings column.** `preflight` stores facts. The rows are derived at read, so a word change
    needs no migration.
13. **The order of the rows:** RTL, locale mismatch, untouched words, members, free asks, dropped settings, changed
    built-ins, feed-less archives, picks, then unviewed — what changes the live site first, reminders last.
14. **DW-378's short stage** is announced from `stage_timings`, which records every stage entered. No faster poll.

### Words

**Destination.**
- "Switch" (the frame's), and "Choose a site" (busy "Opening…") beside 7.18a's "Go to Sites".
- Q4's line: "Ghost(Pro) refused a custom theme on {host} when you last shipped. If you've upgraded the plan since, run
  the checks and ship — Ghost's answer clears this."

**The picker.**
- "Choose a site" · "This project ships to one connected site at a time."
- Each row: title, mono host, chip ("Connected" · `PREVIEW_COPY.chip`), and "Linked to {project}" when held.
- The first-link line: "This project will use {language}, {host}'s language."
- "Go to Sites" · "Back" · "Use this site" (busy "Switching…").
- The refusal: "That site is no longer connected."
- Unsent edits (R-274, Run checks' too): "Your latest edits haven't reached Inflozo yet. Try again once they're saved."

**The confirm.**
- "Switch to {host}?" · "Cancel" · "Switch" (busy "Switching…"), which are `TRANSLATION_WORDS`' cancel, switch and
  switching.
- Held (Q1): "{host} is {other}'s site now. Switching moves it here: {other} keeps its designs and its deploy history,
  and isn't linked to a site until you choose one for it."
- Language: "{host} is set to {site language}, but this project is in {project language}. Ghost shows a theme's words in
  the site's own language, so its visitors would see the English wording until the two match."
- Languages are named by Translations' `nameOf`.

**Ship refused (Q3).**
- `site_changed`: "This project now ships to {new host}, not {old host}, so nothing was sent. Go back and run the checks
  again."
- `site_unlinked`: "This project is no longer linked to {old host}, so nothing was sent."

**Pre-flight's rows** (title · body · items · link):

| Kind | Title | Body | Items | Link |
|---|---|---|---|---|
| RTL block | `rtlTitle` | — | — | caption "Acknowledge it in Translations to ship." · "Open Translations" |
| RTL repeat | `rtlTitle` | `rtlBody` + `acknowledged(iso)` | — | — |
| Mismatch | "Your Ghost site's language is {locale}, so visitors see the English wording, not your {language} labels." | — | — | `changeIn(code)` + `newTab` |
| Untouched | `untouchedTitle` | `untouchedLead` | `untouchedOn(layer, canvas)` + `quoted(words)` | "Fix in editor" each |
| Members | "{host} can't take every sign-up your pages ask for" | `membersNotice` sentences | "{layer} on {canvas}", or "Paywall" | "Change this in Ghost ↗" (`members`) |
| Free asks (Q2) | "Free sign-ups stay hidden on {host}" | "It runs Ghost {version}, and only Ghost 5.62 or later tells a theme that free sign-ups are open. Update Ghost to show them." | canvas labels | "Fix in editor" each |
| Dropped | "Ghost will forget {n} setting(s) on {host}" | "This version no longer has them, so when it goes live Ghost deletes the value your site's owner chose for each." | `ghostName(key)` | — |
| Built-in | "{Ghost label}'s starting value changed" | "This version starts it at {new}, but {host} keeps the value it already holds — {old}, unless it was changed in Ghost." | — | "Open Ghost's Design panel ↗" + `newTab` |
| Feed-less | "{Tag\|Author} page has no list of posts" | `FEEDLESS` | — | "Fix in editor" |
| Picks | "{n} page(s) load more than 25 hand-picked posts" | "Every pick is a database query on each visit, counting every hand-picked section the page shows, its header and footer included." | "{canvas}: {total} picks" | "Fix in editor" each |
| Unviewed | "Not viewed as every visitor" | "These pages ship without anyone looking at them as each visitor. View as, at the top of the editor, shows each one." | "{canvas}: {visitors}" (`ROWS` titles) | "Fix in editor" each |
| R-260 reading (Q5) | "Checking that every post appears on a page…" | — | — | — |
| R-260 capped (Q5) | 7.18a's sentence, then "We checked your newest 2,000 posts." | — | — | — |

### Walk (step 114, production, the Review's; no T1 write)

A throwaway account on Pro (the service key) connects T1 through the wizard, with "Use your brand" (project A). It adds
project B, and plants a second site row, `walk-114.invalid`, with `site_settings.locale = 'de'`.
1. **The first link and the move.** B's Destination offers "Choose a site". Choosing T1 shows the held confirm. Cancel
   writes nothing (the control). Switch moves T1 to B, and A reads unlinked.
2. **DW-374.** A Pre-flight of A, started before the move, shipped after it, fails `site_unlinked` with no upload (the
   audit holds no `theme_upload` row). B switched to the planted site with a Pre-flight for T1 fails `site_changed`.
3. **The language confirm.** The language confirm names English and German, and B's language is unchanged after it.
4. **Pre-flight's rows on T1.** Each row is planted through the service key and read back:
   - B set to Arabic unacknowledged → blocked, no Deploy row;
   - acknowledged → the repeat;
   - a members record of Nobody plus A4 #13 placed → the members row;
   - `ghost_version` planted `5.40.0` on the T1 row → the free-ask row (Q2), with `6.58.0` as the control;
   - an earlier activated deploy row with `preflight.custom` → the dropped and built-in rows;
   - a feed-less Tag → its row;
   - 26 picks → the picks row;
   - unviewed canvases → their row.
5. **DW-378's `resetRoutes`.** A planted unreadable routing is replaced by Start again, a readable one is untouched (the
   control), and the templates are kept.
6. **Restore.** Every planted row is reverted, both accounts are deleted, and users, projects and sites are counted back.

### Facts this spec rests on

- **F1. One project per site** — `projects_linked_site_id_key` (`20260911100000_sweep_constraints.sql:49-51`, DW-69),
  tested in `rls.sql:1349-1361`.
- **F2. Ghost syncs a theme's settings at activation.** It deletes a key the theme no longer declares, and keeps a stored
  value across a new default (7.10's and 7.11's source readings; MEASUREMENTS §78). Dev reads in 6.58.0's
  `custom-theme-settings-service.js` whether values are stored per theme name, and records it in VERIFY-AT-BUILD.
- **F3. `@site.allow_self_signup` exists from 5.62.0** (`matrix.json:117-120`, MEASUREMENTS §41(e)). Read in source and
  never executed: no Ghost below 5.130.6 is reachable. The row is proved by a planted version (walk 4) and stated so.
- **F4. Ghost reads `locales/<locale>.json` exactly, and falls back to `en.json` only when that file is missing**
  (FR-Q6, MEASUREMENTS §44).
- **F5. `capabilityOf` writes nothing for Ghost(Pro) while its flag is off** (`probe-rule.ts:477-487`), so Re-check plan
  cannot clear a `deploy_error` mark (DW-375).
- **F6. The Design panel's address** is unread. Dev reads it in both majors' admin bundles, as 7.12 read
  `publication-language` (Ask First).

## Owner's manual test

You test as a fresh account **on Pro**, so it can hold two projects: **`umngkmr+site718@gmail.com`, made fresh on Pro at
Deploy (2026-10-20, on your go — Question 9)**, with no project and no site yet. Before you start, in **ghost6.inflozo.com's Ghost Admin** make a custom integration
called **Owner test 7.18b**, and keep its Admin API key and Content API key open.

Addresses that need a project's id are written `<A>` and `<B>`. Copy each from the address bar when it opens.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+site718@gmail.com` | You land on Start. |
| 2 | `https://app.inflozo.com/sites` | Sites | Press **Connect a site**, finish with the integration's keys, and press **Use your brand** at the end. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**, and a project linked to it opens. This is project **A**. |
| 3 | `https://ghost6.inflozo.com/ghost/` → Settings → Membership, then `https://app.inflozo.com/sites` | Ghost, then Sites | In Ghost, note what **Subscription access** says, set it to the invite-only choice, and save. In Inflozo, press ⋯ on ghost6, then **Re-check connection**. | — | The ghost6 card says "Only people you invite can join ghost6.inflozo.com, so free sign-up forms show nothing there." (It may show a second sentence about paid memberships too.) |
| 4 | `https://app.inflozo.com/projects` | Projects | Press **New project**, choose **Blank canvas**, and create it. In its editor press ⌘K and add the newsletter design **Inline Row**. | — | Project **B** opens with Inline Row on Home. |
| 5 | `https://app.inflozo.com/projects/<B>/settings/translations` | Translations | Choose **العربية** (Arabic — Translations names each language in its own script), then press **Understood** on the right-to-left notice. | — | The language reads العربية, with "You acknowledged this on …". |
| 6 | `https://app.inflozo.com/projects/<A>` in window 1 | Editor A → wizard | Press **Ship it**, then **Run checks**. Leave it on the finished checks. | — | The site card reads ghost6 · **Connected** · **Switch**. Pre-flight finishes with Ship it pressable. |
| 7 | `https://app.inflozo.com/projects/<B>` in window 2 | Editor B → wizard | Press **Ship it**. | — | "This project isn't linked to a connected Ghost site yet." with **Choose a site** and **Go to Sites**. |
| 8 | `https://app.inflozo.com/projects/<B>` in window 2 | Choose a site | Press **Choose a site**, choose ghost6, and press **Use this site**. | — | The list shows ghost6 with "Linked to {A's name}". "Switch to ghost6.inflozo.com?" opens with **Cancel** focused. It says the site moves from A to this project, and that ghost6.inflozo.com is set to English while this project is in العربية — Arabic, named in its own script, as Translations names every language. |
| 9 | `https://app.inflozo.com/projects/<B>` in window 2 | The confirm | Press **Switch**. | — | Destination shows ghost6 · **Connected** · **Switch**, and a v1 chip. Behind the wizard the canvas shows ghost6's posts. |
| 10 | `https://app.inflozo.com/projects/<A>` in window 1 | Pre-flight | Press **Ship it**. | — | Nothing is sent: "This project is no longer linked to ghost6.inflozo.com, so nothing was sent." **Back** shows **Choose a site**. |
| 11 | `https://app.inflozo.com/projects/<B>` in window 2 | Destination → Pre-flight | Press **Run checks**. Open each warning. | — | 0 errors. The warnings are: **Right-to-left languages are not supported yet** with your date; the language line with "Change it to ar in Ghost ↗"; **Starting words you haven't retyped** with "Inline Row on Home:" and its words in quotes; **ghost6.inflozo.com can't take every sign-up your pages ask for** with the same sentences the Sites card shows and "Inline Row on Home"; and **Not viewed as every visitor** listing Home and the other pages. Then "Warnings won't block your deploy.". Ship it is pressable. |
| 12 | `https://app.inflozo.com/projects/<B>` in window 2 | Editor | Close the wizard. On Home, choose each of the three visitors in **View as**. Run the checks again. | — | Home is gone from the "Not viewed" list; the other pages stay — **Home page 2** among them, which is a page of its own. |
| 13 | `https://app.inflozo.com/projects/<B>/settings`, then `https://app.inflozo.com/projects/<B>` | Theme settings, then the wizard | Press **Promote a control**, choose **Note (Inline Row)**, and save. Then in the editor press **Ship it**, **Run checks**, **Ship it**. | — | Live, with confetti. |
| 14 | `https://app.inflozo.com/projects/<B>/settings`, then `https://app.inflozo.com/projects/<B>` | Theme settings, editor, wizard | Delete that setting. In the editor, choose any other Style Pack. On the **Tag** canvas, hide the list of posts in Layers. Then **Ship it**, **Run checks**. | — | Three more warnings: **Ghost will forget 1 setting on ghost6.inflozo.com** naming it; **Dark accent color's starting value changed** with the old and new colours and **Open Ghost's Design panel ↗** (it opens Ghost's Design settings in a new tab); and **Tag page has no list of posts** with **Fix in editor**. |
| 15 | `https://ghost6.inflozo.com/ghost/`, then `https://app.inflozo.com/sites` | Cleanup | In Ghost: set Subscription access back to what it was. Activate **Casper**, delete the `inflozo-…` theme, and delete the Owner test 7.18b integration. In Inflozo: ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was. |

## Owner's test findings

**Owner's test (owner, 2026-10-20): passed.** The owner walked "Owner's manual test" on the deployed site
(`dpl_CW8Sgt8hupNEPJSdganvFfjLLKy5`, `https://app.inflozo.com`) as `umngkmr+site718@gmail.com` and reported *"passed"*. No
findings.

## Questions for the owner

Questions 1–5 were ruled on 2026-10-19, each option 1 (R-267–R-271). Questions 6–8, raised at the Review, were ruled on
2026-10-20, each option 1 (R-272–R-274). Question 9 was asked and ruled in the Deploy session; none is open.

### Question 1 — The site you pick already belongs to another of your projects. What happens?

**In plain English.** Inflozo lets a site belong to one project at a time (a rule from Story 3.9). So when you press
**Switch** and pick a site that another of your projects already ships to, something has to give. Nothing in the plan
says what.

**An example.** "Field Notes" ships to blog.example.com. You duplicate it as "Field Notes 2026", redesign it, and want to
ship the new one to blog.example.com.

1. **(RECOMMENDED) Move the site to this project, after a confirm.** The confirm opens with Cancel focused: "blog.example.com
   is Field Notes's site now. Switching moves it here: Field Notes keeps its designs and its deploy history, and isn't
   linked to a site until you choose one for it."
2. **Grey the site out** with "Linked to Field Notes". To use it you first switch Field Notes to another site — impossible
   if you have no other site.
3. **Let two projects share one site.** Both could ship there and replace each other's theme. This undoes Story 3.9's
   rule and is a larger change. Not recommended.

**Ruled: option 1 (owner, 2026-10-19) — R-267.** *"Move the site to this project, after a confirm. The confirm opens with Cancel focused: "blog.example.com is Field Notes's site now. Switching moves it here: Field Notes keeps its designs and its deploy history, and isn't linked to a site until you choose one for it.""*

### Question 2 — Free sign-ups on a Ghost older than 5.62: keep them hidden?

**In plain English.** Every free "Sign up" button or form Inflozo ships shows only when the site's Ghost says it takes
free sign-ups. Ghost started saying that in version 5.62. Inflozo connects any Ghost 5, so on a site running 5.0 to 5.61
those asks stay hidden, always. (Read in Ghost's code; no Ghost that old runs anywhere we can try it.)

**An example.** Your newsletter "Inline Row" is on Home, and your site runs Ghost 5.40. Visitors never see the form.

1. **(RECOMMENDED) Keep them hidden, and say so in Pre-flight:** "Free sign-ups stay hidden on blog.example.com. It runs
   Ghost 5.40, and only Ghost 5.62 or later tells a theme that free sign-ups are open. Update Ghost to show them." It
   names each page and never blocks.
2. **Show them anyway below 5.62.** The theme is built differently for an old Ghost, and the ask always shows — even
   where the site takes no sign-ups, so a visitor can press Sign up and be turned away by Ghost.
3. **Use an older Ghost signal instead** ("members on, and not invite-only"). It is unproven (it needs Ghost's old code
   read and an old Ghost to test on), and it breaks Story 5.20's rule that one signal guards an ask.

**Ruled: option 1 (owner, 2026-10-19) — R-268.** *"Keep them hidden, and say so in Pre-flight: "Free sign-ups stay hidden on blog.example.com. It runs Ghost 5.40, and only Ghost 5.62 or later tells a theme that free sign-ups are open. Update Ghost to show them." It names each page and never blocks."*

### Question 3 — Ship it after the project's site changed: what does it say?

**In plain English.** With Switch, a project's site can change while another window sits on finished checks. Ship it now
refuses to send the theme anywhere but the project's current site. The story's card says the sentence is yours.

**An example.** In one window you run the checks for ghost6. In another you switch the project to blog.example.com, or
move ghost6 to another project. Back in the first window you press Ship it.

1. **(RECOMMENDED) Name both sites:** "This project now ships to blog.example.com, not ghost6.inflozo.com, so nothing was
   sent. Go back and run the checks again." When no site is linked any more: "This project is no longer linked to
   ghost6.inflozo.com, so nothing was sent."
2. **One sentence for both:** "This project's site changed after these checks ran, so nothing was sent. Go back and run
   them again."
3. **Your own words.**

**Ruled: option 1 (owner, 2026-10-19) — R-269.** *"Name both sites: "This project now ships to blog.example.com, not ghost6.inflozo.com, so nothing was sent. Go back and run the checks again." When no site is linked any more: "This project is no longer linked to ghost6.inflozo.com, so nothing was sent.""*

### Question 4 — A Ghost(Pro) site that refused a theme: how does it come back?

**In plain English.** When Ghost(Pro) refuses a custom theme, Inflozo marks the site Preview-only, and Ship it then shows no
**Run checks** for it. If you upgrade your Ghost(Pro) plan afterwards, nothing clears that mark. The Sites screen's
"Re-check plan" cannot read a Ghost(Pro) plan yet, and only an accepted upload clears it — which Ship it no longer offers.

**An example.** Your ship to a Ghost(Pro) Starter site is refused. You upgrade to Publisher. The next day Ship it still
says Preview-only, with no way to try.

1. **(RECOMMENDED) Keep Run checks for a site marked by a refused upload**, with one line under the Preview-only panel:
   "Ghost(Pro) refused a custom theme on {your site} when you last shipped. If you've upgraded the plan since, run the
   checks and ship — Ghost's answer clears this." An accepted upload clears the mark; a refused one sets it again.
2. **A button, "I've upgraded my plan"**, that clears the mark on your word. Ship it is then as normal.
3. **Leave it** until the Ghost(Pro) plan check is built at the Ghost(Pro) launch gate.

**Ruled: option 1 (owner, 2026-10-19) — R-270.** *"Keep Run checks for a site marked by a refused upload, with one line under the Preview-only panel: "Ghost(Pro) refused a custom theme on {your site} when you last shipped. If you've upgraded the plan since, run the checks and ship — Ghost's answer clears this." An accepted upload clears the mark; a refused one sets it again."*

### Question 5 — Checking every post on a very large site

**In plain English.** Pre-flight's "every post appears on Home or a collection" check (Story 7.18a) reads all your
published posts, 100 at a time, from the same allowance the canvas uses to draw your site. On a site with tens of
thousands of posts it uses that allowance up, and while it reads, Pre-flight shows nothing about it.

**An example.** On a site with 30,000 posts the check makes 300 requests today. The canvas then falls back to sample
content, and the row stays blank until it finishes.

1. **(RECOMMENDED) Check the newest 2,000 posts, with an allowance of its own.** While it reads: "Checking that every post
   appears on a page…". On a larger site the result adds "We checked your newest 2,000 posts." The canvas is never
   touched, and Ship it never waits for it.
2. **Check every post with an allowance of its own**, showing "Checked {n} of {total} posts…". That takes a minute or
   more on a very large site.
3. **Skip the check above 2,000 posts**, saying "Your site has more than 2,000 posts, so we didn't check that every one
   appears on a page."

**Ruled: option 1 (owner, 2026-10-19) — R-271.** *"Check the newest 2,000 posts, with an allowance of its own. While it reads: "Checking that every post appears on a page…". On a larger site the result adds "We checked your newest 2,000 posts." The canvas is never touched, and Ship it never waits for it."*

### Question 6 — Pre-flight's sign-up warning: which sections does it list?

**In plain English.** Pre-flight warns when your site's member settings stop a sign-up that your pages ask for. As built, it
lists only the sections those settings actually stop, so its title — "{site} can't take every sign-up your pages ask for" —
is always true. The plan's table reads more widely (every sign-up section, whenever the site has any member notice), so the
choice is yours.

**An example.** Your site has no Stripe, so paid sign-ups are off. Home has a free newsletter form and no paid button. The free
form works.

1. **(RECOMMENDED) List only the sections the settings stop** (as built). In the example: no warning, because nothing on your
   pages is stopped.
2. **List every sign-up section whenever the site has any member notice.** In the example: "ghost6.inflozo.com can't take every
   sign-up your pages ask for", listing the newsletter form — which works.

**Ruled: option 1 (owner, 2026-10-20) — R-272.** *"List only the sections the settings stop (as built). In the example: no warning, because nothing on your pages is stopped."*

### Question 7 — Sign-ups set to Nobody: does a section's own line keep its words?

**In plain English.** When a site's Subscription access is Nobody, a placed sign-up section's panel keeps Story 5.20's sentence
about "this section" (your ruling R-198), while Pre-flight says the Sites screen's sentence. The plan's check says both should say
the Sites sentence. The two rulings disagree, so this is yours.

**An example.** The site is set to Nobody, and a hero with Sign up is on Home. The panel says: "Members are switched off on
ghost6.inflozo.com, so this section's sign-up form shows nothing there." Pre-flight says: "Members are switched off on
ghost6.inflozo.com — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone
up."

1. **(RECOMMENDED) Keep both as built.** The panel speaks about the section (R-198), Pre-flight about the site. Both warn.
2. **The panel says the Sites sentence too**, word for word, and R-198's panel sentence is retired.

**Ruled: option 1 (owner, 2026-10-20) — R-273.** *"Keep both as built. The panel speaks about the section (R-198), Pre-flight about the site. Both warn."*

### Question 8 — The sentence when unsent edits stop a switch

**In plain English.** Choosing a site sends your latest edits first. If they cannot be sent, nothing is switched, and the picker
shows Run checks' sentence, which talks about "checking" — not quite right for a switch. A new sentence needs your word.

**An example.** Your connection drops for a moment, you press **Use this site**, and see: "Your latest edits haven't reached
Inflozo yet, so we can't check them. Try again once they're saved."

1. **(RECOMMENDED) One shorter sentence for both places:** "Your latest edits haven't reached Inflozo yet. Try again once they're
   saved."
2. **A second sentence for the switch alone:** "Your latest edits haven't reached Inflozo yet, so we can't switch the site. Try
   again once they're saved."
3. **Keep Run checks' sentence for both** (as built).

**Ruled: option 1 (owner, 2026-10-20) — R-274.** *"One shorter sentence for both places: "Your latest edits haven't reached Inflozo yet. Try again once they're saved.""*

### Question 9 — Your test account already existed: what to do with it?

**In plain English.** The test needs a fresh account on Pro. At Deploy, `umngkmr+site718@gmail.com` already existed: you had made
it on 2026-10-19, on Free, with ghost6 connected, one "Untitled project" linked to it, and one unfinished check. ghost6 itself was
clean (Casper live, no Inflozo theme).

**An example.** Kept as it was, step 2 ("Connect a site… Use your brand") would fail, because ghost6 was already connected there.

1. **(RECOMMENDED) Fresh start:** delete that account — its project, its ghost6 connection and its record with it, nothing on
   ghost6 changed — and make it again on Pro, so the test runs from step 1 as written.
2. **Keep it, set to Pro;** skip step 2 and use "Untitled project" as project A.
3. **A new alias instead** (`umngkmr+site718b@gmail.com`), leaving yesterday's account connected to ghost6.
4. **Not now.**

**Ruled: option 1 (owner, 2026-10-20), asked in the Deploy session.** *"Fresh start (RECOMMENDED)"*

## Verification

**Commands:**
- `python3 tools/doc-audit.py --check` — expected: exit 0, run twice after any new document.
- `pnpm check` — expected: exit 0, with the new tests passing and every design snapshot unchanged.
- `bash supabase/tests/run-rls-gate.sh` — expected: exit 0. With the 7.18b migration withheld, it aborts at the 7.18b
  block (the control).
- `pnpm keyboard` — expected: exit 0, with the new journeys and their controls.
- `node tools/check-traces.mjs` — expected: "every route carries its files", with the recorder run over the pilot theme.

**Real infrastructure (R-82; T1 only, R-238):**
- **Schema phase:** applied through `SUPABASE_DB_POOLER_URL` on the owner's go, and read back (`deploys.preflight`
  exists and is nullable, the tenant's SELECT holds, 7.18a's rows are untouched).
- **Walk step 114 on production at Review.** It writes to production through throwaway accounts and reads T1. Nothing is
  written to T1.
- **CI** `check`, `rls`, `deploy` and the render matrix green on the Review head, read with `GITHUB_TOKEN`; Vercel READY
  read with `VERCEL_TOKEN`.
- **Deploy:** the owner's Pro test account is made through the service key on his in-session go, and deleted after his
  test.
- **Ghost 5:** postponed to DW-326 (Story 15.7). DW-297's row cannot be executed on a Ghost below 5.62 (F3).

**Executed — Dev (2026-10-19, Node 24.18.1, on the Schema head 693e9836; the main session's final tree, after its matrix audit):**
- `pnpm check` — exit 0 (lint, typecheck and every package's tests): library 285 / ghost-shim 47 / section-runtime 441 /
  theme-compiler 220 / app 926 / tools 13 passing, 0 failing (each suite's own count, as it printed).
- The new unit files each passing: `site-switch.test.ts` (the plan, and `switchWith` — the server's half — row by row: a site gone
  or a failed read writing nothing, the same site writing nothing, the held move unlinking FIRST then linking, a failed unlink
  never linking, the first link's language, a differing language confirmed and never written, the 23505 race asking again with
  a cleared race linking as its control; mutation-checked — one pass instead of two, and the unlink skipped, each turned a test
  red, restored green), `preflight.test.ts`, `read.test.ts`; and the extended ones — `paywall.test.ts` (`asksIn`, the href
  control), `deploy.test.ts`, `deploy-run.test.ts` (the RTL block, both DW-374 codes and the unchanged-link control, the facts,
  `previousCustom`), `deploy-input.test.ts` (the real compile's facts), `ghost-admin.test.ts` (DW-378's budget — red with
  `timeoutFor()` in place of `timeoutFor(args.item)`, the mutation check, green restored), `compile.test.ts` (`noindex`, the
  every-feed control), `server-wiring.test.ts` (R-213: `switchSite` reads the user quietly and refuses on none).
- `pnpm keyboard` — exit 0, 282 passed (17.1 min): the 7.18b journeys — the unsent-edits switch and its control among them —
  and DW-378's settled 7.18a ones.
- `pnpm build` — exit 0. `node tools/check-traces.mjs` — "every route carries its files", the recorder now run over the pilot
  theme: all 568 files gscan4 and all 258 gscan6 touch carried.
- `python3 tools/doc-audit.py --check` — PASS on the second run (the first regenerated the board).
- Ghost's source, read (rule 1): both releases' npm tarballs (`registry.npmjs.org/ghost/-/ghost-6.58.0.tgz`, `…-5.130.6.tgz`),
  read, never installed — the Design panel's `design/edit` (VERIFY-AT-BUILD 75) and the custom theme settings sync per theme
  name (F2, VERIFY-AT-BUILD 76).
- **Real services at Dev:** none beyond the Schema phase's production apply (below) — the npm registry read only. Nothing
  touched T1 or production at Dev.
- **Not run at Dev, the Review's:** walk step 114 on production (T1 read only); CI on the Dev head; the RLS gate (no SQL
  changed since the Schema phase, where it ran with its control).

**Executed — Schema phase (2026-10-19, pushed alone before any code, R-99):**
- `bash supabase/tests/run-rls-gate.sh` — exit 0: no SCHEMA DRIFT, every earlier block passing, and the 7.18b block's PASS
  lines: `deploys.preflight` is nullable jsonb and its comment names `{templates, custom, noindex, freeAsks}`; `jobs.claim`'s
  condition (the service role's `update deploy_jobs … where id = $1 and user_id = $2 and stage = 'awaiting_ship'`) changes
  one row, and the same statement again changes none (DW-378); the tenant reads `preflight` on its own deploy and not on
  another's, cannot write it (42501), and the refused write leaves the server's value. The server-asserted list names
  `deploys.preflight`.
- Controls, over a scratch copy without `20261020120000_preflight_facts.sql` and with HEAD's `SCHEMA.sql`
  (`INFLOZO_ARCH_DIR`): exit 3 at the server-asserted list (`column "preflight" of relation "deploys" does not exist`);
  and, with that list's one line reverted, exit 3 at the 7.18b block itself ("deploys.preflight (jsonb, nullable) is
  missing"), 7.18a's block passing first.

**Real services the Schema phase hit (R-82):**
- **Supabase production** (`SUPABASE_DB_POOLER_URL`, read inside the script, never on argv; the owner's in-session go,
  "1. Go"): before — `deploys` without `preflight` (3 deploys, 3 deploy jobs, 3 with `quality`); the migration applied in
  one transaction; after — `preflight` jsonb nullable with its comment, 0 rows carrying it, the same 3 deploys, 3 jobs and
  3 `quality` values, and `authenticated` holding SELECT on it and neither INSERT nor UPDATE.

**Executed — Review (2026-10-19/20, the main session, Node 24.18.1; five review layers as subagents, every real-infra call here):**
- **CI on the Dev head** `f8d62354` (`GITHUB_TOKEN`, read in process): CI's `check`, `rls` and `deploy` success, the render matrix
  success; Vercel `dpl_6zWqkDbaMtiuDQiRoe3tQWS7FWcW` READY on `f8d62354` (`VERCEL_TOKEN`).
- **R-99, production's schema** (`SUPABASE_DB_POOLER_URL`, read in process, read only): `deploys.preflight` jsonb, nullable, its
  comment naming `{templates, custom, noindex, freeAsks}`; `authenticated` holds SELECT on it and nothing else; every column the
  code writes or reads is there (`projects.rtl_ack_at`, `sites.capability_source`, `deploys.preflight`). One deploy already carries
  facts (4 deploys, 4 jobs, 14 projects, 7 sites).
- **Walk step 114, run 1** (a cut: steps 1–5 + 114, from a clean worktree at the Dev head, no `T1_WRITES`): **0 FAIL, 66 PASS** —
  T1 connected through the wizard with "Use your brand" (project A); B's "Choose a site"; the picker's rows (T1 "Linked to
  Ghost6", the planted German site with its first-link line); S8e's held confirm on Cancel, Cancel writing nothing (the control),
  Switch moving T1 to B with A unlinked; the canvas painting the sample before and T1's content after, with no reload; A's
  Pre-flight from before the move refused `site_unlinked` and B's for T1 refused `site_changed` after B moved to the planted
  site, neither entering uploading, and `private.credential_audit` holding no theme write for T1; FR-Q6's confirm naming Deutsch
  and English with B's language kept; the RTL block (no Deploy row); every warning kind in Design Notes' order on T1 with the
  planted facts, and the 6.58.0 control without the free-ask row; DW-378's `resetRoutes` and its control; the disconnect
  (credentials all false) and the account deleted, users and projects counted back.
- **Walk step 114, run 2** (the same cut, the Review's extended step built from the patched walk, still at the Dev head):
  **0 FAIL, 68 PASS** — the audit's control holding (0 theme writes beside the connect's own 10 rows); A's FIRST link to the
  planted site writing `language = 'de'` on production with the row's "This project will use Deutsch, walk-114.invalid's
  language." (B's earlier switch kept English: the control); the free-ask control comparing the whole order; R-270 from the stored
  row (T1's row marked `deploy_error`: Q4's line and Run checks; marked `probe`: neither). T1 was read only in both runs.
- **The Review's patches, locally:** `pnpm check` — exit 0 (library 285, ghost-shim 47, section-runtime 441, theme-compiler 220,
  app 933, tools 13; 0 failing). Each new unit test failed with its line of code removed or altered, then passed restored: the
  lock check, the held and the language coverage, the overrides guard, the confirm's shape check, Re-activate's link guard, the
  RTL rule read as "anything but English", the page-2 picks, and `linkedSiteId` held only while connected.
  `bash supabase/tests/run-rls-gate.sh` — exit 0, the 7.18b block passing with the `coalesce`d comment check; in a scratch PG17
  container the old check PASSED on a column with no comment (the defect), the new one raised, and with the comment it passed
  (the control). `pnpm keyboard` — exit 0, 284 passed (16.1 min). The three journeys the Review wrote or extended each FAILED
  against their mutation, at their own line, then passed: the refusal said as the checks' outcome ("Checks finished: 0 errors, 1
  warning." for DW-374's sentence), the server's confirm unsaid (""), and an ending keyed once per job ("Activating v3." where
  "Your theme is on your site but isn't live yet." was owed). `pnpm build` — exit 0; `node tools/check-traces.mjs` — "every route
  carries its files" (568 and 258 files gscan4 and gscan6 touch, all carried).
- **The Review's deploy** `fcbc98a6` (CI's `check`, `rls` and `deploy` success, the render matrix success; Vercel
  `dpl_9BiTVdHtpBGKugJCYfmVggK2D8Gy` READY).
- **Walk step 114 on the Review's deploy** (the cut, from a clean worktree at `fcbc98a6`, T1 read only): run 3 died before its
  first check on a magic-link load that did not finish in 30 s (a HARNESS ERROR, the known DW-204 shape; account D was deleted and
  users and projects counted back); **run 4: 0 FAIL, 68 PASS** — the same checks as run 2, now over the Review's code: the held
  move with "Switching…" kept until the re-read, the wizard reopened on Destination on T1 and the canvas following it with no
  reload, both DW-374 refusals with no theme write in the audit beside its control, the first link writing German, every
  warning kind in order and its 6.58.0 control, R-270 from the stored row and its probe control, and the restore.

**Executed — the owner's rulings at the Review (2026-10-20, R-272 to R-274, each option 1; the main session, Node 24.18.1):**
- R-272 and R-273 keep the code as built; R-274 changes `DEPLOY_WORDS.editsUnsent` to the ruled sentence, which Run checks' refusal
  and the picker's both read (one name, R-170). `deploy.test.ts` holds the ruled words; the two journeys that press against unsent
  edits (7.18a's Run checks, 7.18b's switch) read the sentence from the list.
- `pnpm check` — exit 0 (library 285, ghost-shim 47, section-runtime 441, theme-compiler 220, app 934, tools 13; 0 failing).
  `bash tools/keyboard/run-keyboard-gate.sh --grep` over the two unsent-edits journeys — 2 passed, each drawing the ruled sentence;
  the whole keyboard gate runs in CI's `check` before this commit can deploy.

**Executed — Deploy (2026-10-20, the main session, Node 24.18.1):**
- `Deployment: dpl_CW8Sgt8hupNEPJSdganvFfjLLKy5` — READY, production, built from `f1777bde` (the head, the last code change: R-274's
  sentence), aliased to `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` (Vercel API, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and
  `VERCEL_PROJECT` read in process, never on argv); it is the newest production deployment. CI at `f1777bde`: `check` (the whole
  keyboard gate inside it), `rls`, `deploy` and the render matrix success (`GITHUB_TOKEN`).
- Schema: `deploys.preflight` was applied at the Schema phase and read back there and at the Review (R-99: nullable jsonb, its
  comment, `authenticated` SELECT only); `RLS-TEST.sql` is green in the `rls` job at the head and locally at the Review. Nothing to
  apply at Deploy.
- T1, read only with `GHOST6_STAFF_ACCESS_TOKEN` (in process): `casper` active, `racer` and `source` installed, no Inflozo theme;
  `routes.yaml` 130 bytes; Ghost 6.58. Nothing was written to T1.
- **The owner's test account** (Question 9, his in-session go; `SUPABASE_URL` and `SUPABASE_SECRET_KEY` read in process): the
  existing `umngkmr+site718@gmail.com` (made 2026-10-19 16:44 UTC, Free) had ghost6 disconnected THROUGH THE PRODUCT
  (`/sites/disconnect`, so Vault dropped its keys — `credentials_present` all false), its one stored zip removed from
  `deploy-artifacts` (200), and was deleted (200; users 16 → 15); it was then made again (200) and set to `pro_active` (204, read
  back), with no project and no site; users 15 → 16. No email was sent; Ghost was not called.
- `owner_test: pending` — the owner's manual test above is next, on `https://app.inflozo.com`.

