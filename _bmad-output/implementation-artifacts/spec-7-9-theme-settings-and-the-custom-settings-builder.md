---
title: 'Story 7.9 — Theme Settings and the custom-settings builder'
type: 'feature'
created: '2026-10-09'
status: 'in-progress'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '0b6fdcd0832a23e566b54e9e2af4274463050b8e'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story the Theme settings page (the one that today holds only Light only / Light + Dark and Clear dark
overrides) grows its first real knob — **Posts per page**, the number of posts each archive page of your site shows
before it paginates, which you set here because Ghost has no setting for it — and the greyed Count on your main post
feed now says "Change it in Theme settings." with a working link to this page. Beside it sits the **Custom settings**
card: a meter reading how many of your seventeen Ghost theme settings you have used, the notice that a setting's key
freezes once you deploy or export, and the list of settings you have promoted, each of which you can relabel, regroup,
hide behind another setting or delete (with a warning), and a **Promote a control** form that turns a toggle
or a choice control from one of your sections into a setting the site's owner will later change in Ghost Admin without
opening Inflozo (you ruled so on 2026-10-09), above a read-only **Site basics** group showing the linked site's title,
logo and accent as Ghost holds them. Nothing reaches a theme yet: the settings are stored and checked against Ghost's own
rules now, and Story 7.10 writes them into the theme.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/projects/<id>/settings` holds D6a's project-mode block alone (R-131). FR-Q1's first field,
`posts_per_page`, has no surface, so the main feed's greyed Count cannot say where its size is set (DW-254, R-118) and
every "posts per page" sentence in the product still points at nothing. FR-Q2's custom-settings builder — the one place
Ghost's rules for a theme setting (five types, two groups, six-digit hex, select defaults, no image default, twenty slots
with three held for the dark built-ins, keys frozen once deployed or exported) are made visible and enforced before a
theme is ever compiled — does not exist, and the `custom_settings` table has waited since Story 1.2 with its cap and
freeze triggers and no writer.

**Approach:** Build the rest of D6a on the existing settings route, as R-131 left it: Posts per page first (a stepper,
tabular numerals, `projects.posts_per_page`), then Site basics read from the linked site (Question 2, ruled option 1), then the built
mode block, then the Custom settings card — meter, freeze notice, the project's settings as rows with edit and delete,
and the Promote form for toggle, segmented and named-select controls (Question 1, ruled option 1). Every rule a stored setting must meet
lives in ONE core module both the server actions and Story 7.10's emitter read, and is executed against both pinned
gscans rather than asserted. The main feed's Count gains D5c's second sentence and its link. No migration: every
column, grant and trigger this story needs exists in `20260904120000_complete_schema.sql`, so there is no Schema phase
(R-99).

## Boundaries & Constraints

**Always:**
- The frame is `D6 Theme Settings Completed.dc.html` **D6a** (`:54-66` Posts per page, `:69-100` Site basics,
  `:139-235` the Custom settings column) and **D6b** (`:241-290`); the built mode block stays byte-for-byte as R-131
  built it. The Kit's `Stepper`, `Select`, `Toggle`, `TextInput`, `ConditionRow`, `HelperCaption`, `CounterChip`,
  `dialog.ts` and `greyed.ts` are the components; nothing is drawn twice.
- The rules are **data in one core module** (`packages/section-runtime/src/custom-settings.ts`): Ghost's five types,
  its two groups, the hex rule, the select rules, the image rule, the key shape, the reserved keys, the caps and the
  visibility rule — read by this story's actions, this story's tests and Story 7.10's `config.custom` emitter. The
  server actions validate with it BEFORE the insert, and the database's own constraints (`hex6_colour`,
  `no_image_default`, `key ~ '^[a-z][a-z0-9_]*$'`, the cap trigger, `custom_settings_key_frozen`, the column grants)
  stay the floor beneath them: a refused write is mapped to the module's sentence, never shown as a Postgres code.
- **Counts are derived.** The meter's "17" is `SETTING_CAP − RESERVED_SETTING_KEYS.length`, the "20" is `SETTING_CAP`,
  and both are printed on the page because D6a's prompt says Ghost's limits MUST be printed; neither is typed twice.
- **Keys:** generated lowercase snake_case from the label (`show_the_tag`), at least **two** characters (gscan reads a
  one-character key as no key, `010-package-json.js:225`, both pins), unique per project (`unique (project_id, key)`;
  a collision takes `_2`, `_3`, … as `claim()` does for partials), **never a reserved key**, and **never editable after
  creation**: the `update` grant lists `label, options, default_value, group_name, visibility_condition, bound_to,
  position, updated_at` and no `key`, so "a rename changes the label only" is the database's rule and the form shows the
  key read-only once the row exists. The freeze notice is D6a's sentence verbatim.
- **Group:** `site_wide` is stored for Site wide; the emitter (7.10) omits `group` for it and writes `homepage` or `post`
  otherwise — gscan accepts `undefined`, `post`, `homepage` and nothing else (`:175-180`).
- **Visibility:** `{ key, value }` on another setting of THIS project whose key is two or more characters; the value is
  one of that setting's options (a select) or `true`/`false` (a boolean); a setting can never name itself; deleting a
  setting another setting's condition names clears that condition in the same write. The NQL it becomes
  (`key:'value'` / `key:true`) was executed on `@tryghost/nql` 0.13.1 in this Create.
- **Delete asks first** (R-134's shape, focus on Cancel) and the sentence warns that re-creating the same key later
  would bring the site owner's stored value back (FR-Q2). A setting that is not yet frozen is deleted with a one-line
  confirm that names it; the resurrect sentence appears only when `frozen_at` is set, because before a deploy there is
  no stored value to resurrect.
- **R-98:** every control that starts work says so (`Submit`'s required `busy`, `useSubmitting`), `loading.tsx` draws
  these rows' own skeleton, and every form posts without JavaScript. **R-192:** in a read-only editor session the whole
  page is read-only — every editing control greyed and unclickable, the values readable.
- Every "posts per page" sentence links to this page and never into Ghost Admin (FR-Q1, R-10 #13); the Count's words
  stay `DATA_WORDS`' (R-170), one list.
- Review and the owner's test run on production (R-82): the cap trigger, the key grant and the freeze trigger are
  executed through an RLS session on a test account, on the owner's in-session go.

**Ask First:**
- Questions 1 and 2 are ruled (option 1 on both, owner, 2026-10-09); a change to either scope is a new question, not a
  Dev decision.
- Any change to `custom_settings`' columns, grants or triggers — none is planned; a need for one is a Schema phase and
  a question.
- The three reserved keys' names: `color_scheme` is FR-Q5's; `dark_accent_color` and `dark_logo` are this spec's
  proposal for Story 7.11 to confirm or rename IN THE ONE LIST. Dev does not invent a fourth.

**Never:**
- No `config.custom`, no `{{@custom.*}}`, no compile change of any kind — Story 7.10 emits user settings together with
  the lines that read them (GS100), Story 7.11 the three built-ins.
- No text-prop promotion, no D6c confirm, no lock pill, no marks strip, no accent promotion, no pack-switch warning,
  no "contrast is in your hands" caution, no parking, no canvas preview of a setting — all Story 7.10's.
- No Credits row (Story 7.28, FR-J15), no Translations and no left rail: D6a's rail (Site basics · Navigation · Social
  accounts · Translations · Code injection) names surfaces this page does not have yet, and R-118/R-131 keep it absent
  rather than greyed until Story 7.12 gives the page a second surface.
- No `frozen_at` write: Story 7.18 (deploy) and 7.26 (export) stamp it. No stepper or swatch-row promotion: Ghost has no
  number type, and colour promotion is accent-only in v1 (FR-Q3).
- No edit to the design export, no hand-edit of a generated file, no count written down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Posts per page saved | + pressed at 12 | `projects.posts_per_page` = 13; the stepper reads 13, says "Saving…" while it posts; the editor's main feed paginates at 13 on next read (`revalidateProject`) | N/A |
| Posts per page out of range | a posted value of 0, 101, `12.5`, `abc`, or absent | refused before the write with the module's sentence: "Posts per page is a whole number from 1 to 100."; the stored value stands | the − is spent at 1 and the + at 100 (`aria-disabled`, never `disabled`) |
| Count's second sentence | the main feed's Data group in the editor | the greyed Count reads "This feed is sized by your theme's Posts per page. Change it in Theme settings." and a "Theme settings ↗" link to `settingsPath(project.id)`; the harness editor, which has no project, draws the sentence and no link | N/A |
| Promote a toggle | Which control = Latest Post · Primary action (`toggle`, value `on`), Label "Show the button", Group Homepage | a row `{ key: 'show_the_button', type: 'boolean', default_value: 'true', options: null, group_name: 'homepage', bound_to: {kind:'control', instanceId, controlKey:'primary-action'} }`; the list gains the row, the meter steps | N/A |
| Promote a choice | Latest Post · Headline size (`segmented`, values medium/large/display, value `large`) | `type: 'select'`, `options: [{value:'medium',label:'Medium'},{value:'large',label:'Large'},{value:'display',label:'Display'}]`, `default_value: 'Large'` — the labels are what Ghost's panel shows (D6a: "Named values only"), the values what the markup needs; `valueWords` names both | a control with fewer than two values is not offered (gscan: `options.length < 2` fails) |
| Label → key | "Show the Button!" · "  Wide  " · "W" · "Show tag" twice | `show_the_button` · `wide` · refused ("A key needs at least two letters") · `show_tag`, then `show_tag_2` | a label that leaves no key (an emoji) is refused with the sentence |
| Reserved key | label "Color scheme" → `color_scheme` | refused: "color_scheme is one of the three dark-mode settings every Inflozo theme carries." | N/A |
| The cap | 16 rows stored, a 17th promoted · 17 stored, an 18th | the 17th lands and the meter reads "17 OF 17"; the 18th is refused BEFORE the insert with "You have used all 17 of your theme settings. Delete one to promote another." — and the trigger's `23514` maps to the same sentence if it is ever reached | the Promote button greys at the cap with that reason (UX-DR3) |
| Group outside Ghost's two | the Select offers Site wide · Homepage · Post only | `site_wide` stored; nothing else is possible to type | N/A |
| Visibility set | on `show_the_button` (boolean), "Only show when" Headline size is Display | `visibility_condition: { key: 'headline_size', value: 'Display' }` — the option's LABEL, which is what Ghost stores and compares; the row's caption reads "Only when Headline size is Display" | the condition's Select offers every OTHER setting of the project; a setting with no other setting draws the row greyed with "Promote a second control to show this one conditionally." |
| Visibility's target deleted | `headline_size` deleted while `show_the_button` names it | one confirm, one transaction: the row goes and the condition is cleared; the caption disappears | N/A |
| Label edit on a frozen row | `frozen_at` set, label changed, key unchanged | label saved; the key field is read-only and the row carries "Key frozen since <date>" | a direct key change is `42501` from the grant, mapped to "This key is frozen — it was deployed or exported." |
| Delete | an unfrozen row · a frozen row | "Delete Show the button?" with "Nothing is deployed yet, so nothing is lost." · the same with "If you later promote a control with the key show_the_button, the value your site's owner set in Ghost comes back." | focus opens on Cancel (R-134) |
| Select default outside its options · image default · colour not 6-digit hex | module inputs | each refused with its sentence; `hex6_colour` and `no_image_default` are the floor | unit rows, since no UI in this story can produce them |
| Read-only session (R-192) | a second window holds the lock | every stepper, field, select, toggle and button greyed, values readable, no form posts | N/A |
| Another user's project | an id the caller does not own | every write reaches zero rows (RLS) and the action answers "We couldn't save that just now." | never a 500 |
| Scripts off | any form | the stepper's − and + and every Promote / Save / Delete are real submits; the page re-renders with the result | the confirm dialog is the scripted layer over a form that still posts |

</frozen-after-approval>

## Code Map

**The page and its actions: `apps/web/app/(app)/app/(authed)/projects/[id]/settings/`**

- `page.tsx` — R-131's page: `projectOf`, `editorData`, the back link and the `ThemeSettings` mount (`:40-63`). This story
  reads `posts_per_page` off the same cached row (`read.ts:73`, already selected) and adds the settings rows and, for
  Site basics, the linked site's `title`, `url` and `site_settings.brand` (the editor's own read, `read.ts:222`).
- `theme-settings.tsx` — D6a's mode block (`:1-205`); its header comment lists what was absent and why. Posts per page
  goes above it and the Custom settings card beside it; the comment is rewritten to say what this story built and what
  is still Story 7.10's and 7.28's.
- `actions.ts` — `setProjectMode` is the pattern (`:50-67`): `idOf`, the caller's session, one column, `revalidateProject`.
  New: `setPostsPerPage`, `promoteControl`, `updateSetting`, `deleteSetting`.
- `loading.tsx` — the skeleton; every new row gets its own bars (`busy.test.ts` walks it).

**The rules, one module — `packages/section-runtime/src/custom-settings.ts` (new, core)**

- Reads `CONTROL_TYPES` and `valueWords` from `@inflozo/library` (`vocabulary.ts:169`, `:187`); exported through
  `packages/section-runtime/src/index.ts`.
- The engine's `DATA_WORDS.mainCount` (`controls.ts:376`) gains D5c's second sentence; the row at `:423` is unchanged.

**The editor's Count**

- `apps/web/components/controls/data-group.tsx:136-146` — the Count `Stepper` with `greyed: { reason }`; the link is
  drawn under `reason()` here from a `settingsHref` prop.
- `apps/web/components/controls/sidebar.tsx:396` — `DataGroup`'s mount; `editor.tsx:5809` mounts the `Sidebar` and
  already knows `settingsPath(project.id)` (`:4969`, the ⋯ menu's row). `apps/web/app/(app)/app/harness/editor/layout.tsx`
  mounts the same sidebar with no project.
- `apps/web/lib/editor.ts:167-168` — `SETTINGS`, `settingsPath`.

**The Kit**

- `apps/web/components/kit/stepper.tsx` — `Stepper` (`min`, `max`, `onStep`, `greyed`); `select.tsx:82` `Select`;
  `toggle.tsx:16` `Toggle`; `input.tsx:30` `TextInput`; `condition-row.tsx` — field · operator · value, static today
  (`:7-20`): this story gives it `onField`/`onValue`/`onRemove`; `labels.tsx` — `HelperCaption`, `CounterChip`,
  `SectionHeader`; `dialog.ts` — `sheet`, `title`, `openOnCancel`, `closeOnBackdrop`; `greyed.ts` — `Greyed`, `reason`,
  `greyedProps`, `ReadOnly`; `submit.tsx` — `Submit`, `BusyLabel`, `useSubmitting`.
- `apps/web/lib/paywall.ts:107` — `adminAt(url, anchor)` builds a Ghost Admin settings address; Site basics adds its
  anchor beside it rather than a second builder.
- `apps/web/lib/probe-rule.ts:170-199` — `Brand { accent, logo, nav }`, `isAccent`, `imageUrl`; `style-pack.ts:329`
  `siteAccentOf(siteSettings)`.

**The database, read only**

- `supabase/migrations/20260904120000_complete_schema.sql` — `projects.posts_per_page` `:226-227` (`>= 1`, default 12)
  and its update grant `:1210-1212`; `custom_settings` `:304-340` (enums `:304-305`, the table `:307-327`, the cap
  trigger `:330-340`); the freeze guard `:92-106` and its trigger `:1369`; the insert grant `:1059-1061`; the update
  grant `:1216-1219`; `select, delete` `:1041-1042`; the owner policy `:816-827`.

**Tests this story extends**

- `apps/web/data-group.test.ts:33` — holds `mainCount` to the spec's sentence; `apps/web/dark-mode.test.ts:109-112` reads
  `actions.ts`; `apps/web/busy.test.ts` walks every `loading.tsx`; `packages/section-runtime/src/controls.test.ts`.
- `packages/theme-compiler/gate/gate.test.ts:36-50` — `BASE` and `runGscan`, the harness the rules' gscan rows use.

**Read in source this Create (standing rule 1)**

- gscan 6.4.2 and 4.49.7, `lib/checks/010-package-json.js:159-231` — byte-identical over the custom-settings range
  (`diff` executed): `> 20` keys, `isSnakeCase`, the five types, the two groups (`undefined` allowed), select
  `options.length < 2` and default-in-options, boolean default `true`/`false`, colour `/^#[0-9a-f]{6}$/i`, image default
  forbidden, description ≤ 100, visibility parsed as NQL and its keys matched by `/[a-zA-Z_][a-zA-Z0-9_.]+:/` (`:225`,
  the two-character floor).
- Ghost 6.58.0 (`registry.npmjs.org/ghost/-/ghost-6.58.0.tgz`): `core/shared/custom-theme-settings-cache/
  custom-theme-settings-service.js:107-133` validates a stored value the same way (select in options, boolean, hex), and
  `:214-224` removes a stored setting whose key is gone or whose type changed and resets a select value that is no longer
  an option — the mechanism behind FR-Q2's "renaming erases the site owner's stored value"; `core/frontend/services/
  theme-engine/config/index.js:3` `allowedKeys = ['posts_per_page', 'image_sizes', 'card_assets']` and `defaults.json`
  (Ghost's own default is 5); `core/frontend/services/routing/controllers/collection.js:31-48` — a route's `limit:`
  beats the theme's, else `parseInt(posts_per_page)` when `> 0`.
- `@tryghost/nql` 0.13.1 (the repo's): `layout:'Wide'` → `{layout:"Wide"}`, `show_reader_count:true` → `{…:true}`,
  `layout:'Wide Open'` parses; a bare word throws.

**Documents**

- `prd.md:361-365` FR-Q1–Q5; `epics.md:3334-3368` this card, `:3370-3417` Story 7.10's, `:2886-2944` Epic 7's preamble.
- `EXPERIENCE.md:174-176` the IA rows; `:746` B17's correction; `:1836-1890` the A6 prompt; `:1795-1803` D5c.
- `reconcile-designs-decisions.md:2715-2730` R-131; `:2809-2820` R-134.
- `deferred-work.md:7235-7250` DW-254.
- `D5 Canvas Markers and Template Switcher.dc.html:347-348` — the Count's two sentences and the link.

## Tasks & Acceptance

**Execution:**

- [ ] `packages/section-runtime/src/custom-settings.ts`, `index.ts`, `custom-settings.test.ts` — the module: `SETTING_CAP`
  (20), `RESERVED_SETTING_KEYS` (`color_scheme`, `dark_accent_color`, `dark_logo` — one list, 7.11's to confirm),
  `USER_SETTING_CAP` derived, `GHOST_SETTING_TYPES`, `GHOST_SETTING_GROUPS`, `settingKey(label)`, `claimKey(taken, key)`,
  `settingOf(controlDef, value)` (toggle → boolean; segmented / named-select → select with `[{value, label}]` options and
  the current value's label as default), `checkSetting(row, others)` (every rule in § The rules, each failure one of
  `SETTING_WORDS`' sentences), `visibilityNql({key, value})`, `postsPerPage(v)` (1–100 integer or a sentence). Tests:
  the I/O matrix's module rows, and a gscan row — a `BASE` theme whose `package.json` carries `custom` built from the
  module's output plus a `{{@custom.key}}` reader per key passes both pinned gscans with no `GS010-PJ-CUST-*` finding,
  and a control with each rule broken fails the matching code.

  -- FR-Q2's rules as data, executed on both gscans (standing rule 1).
- [ ] `packages/section-runtime/src/controls.ts:376` — `mainCount` becomes the two sentences; `controls.test.ts` and
  `apps/web/data-group.test.ts:33` hold the new text.

  -- DW-254's first half; one list (R-170).
- [ ] `apps/web/components/controls/data-group.tsx`, `sidebar.tsx`, `editor.tsx:5809` — a `settingsHref?: string` threaded
  from the editor to the Count row; drawn as D5c's "Theme settings ↗" link under the greyed reason; the harness passes
  none and draws none.

  -- DW-254's link; a door arrives with the thing it opens (R-118).
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` — `setPostsPerPage` (writes `posts_per_page`
  alone, `revalidateProject`); `promoteControl` (reads the project's docs through `editorData`, finds the instance and
  control, builds the row with the module, checks it against the project's other settings, inserts through the caller's
  session; maps `23514` and `23505` to the module's sentences); `updateSetting` (label, group, visibility, default —
  never key); `deleteSetting` (clears conditions that name it, then deletes, one `sync`-style order: condition writes
  first so a failure leaves no dangling condition). Every action is `(previous, formData)` and works with scripts off.

  -- the writers the table has waited for since Story 1.2.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/theme-settings.tsx`, `page.tsx` — D6a in order: **Posts per
  page** (`Stepper` 1–100, the `posts_per_page` chip, the caption verbatim, "Saving…" while it posts), **Site basics**
  (Question 2, ruled: title · logo · accent rows, or the one caption), the built mode block untouched, the **Custom settings** card: header with the meter chip "n OF 17", the
  two captions verbatim, the freeze notice verbatim, the rows (label · "Design · Control →" · key chip · type word ·
  the condition caption when set · Edit · Delete), the empty state "Nothing promoted yet.", the **Promote a control** form
  (Question 1, ruled: Which control as a `Select` over the project's placed toggle / segmented / named-select controls named
  "Layer · Control"; Label in Ghost; Key, generated live and editable before Promote; Group in Ghost; Only show when
  with the Kit's `ConditionRow`, optional; Promote; D6a's two closing captions). The delete confirm in `dialog.ts`'s
  sheet, focus on Cancel. `ReadOnly` over the whole card in a read-only session.

  -- the surface, matching the frame (R-74).
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/loading.tsx` — bars for each new row, in the page's order.

  -- R-98; `busy.test.ts`.
- [ ] `apps/web/lib/paywall.ts:107` — `adminAt` gains the anchor Site basics links to (`settings`), so one function builds
  every Ghost Admin address (Question 2, ruled).

  -- one builder, one shape.
- [ ] `apps/web/settings.test.ts` (new) — the actions' refusals by shape (no id, bad range, a key the module refuses, the
  cap sentence), `mainCount`'s link present with a project and absent without, the page's read-only state; the gate's
  `pnpm check` runs it.

  -- the I/O matrix's app rows.
- [ ] `_bmad-output/implementation-artifacts/deferred-work.md` DW-254 → done with the commit; `epic-7-context.md` — the
  Theme Settings block gains this story's Create and Dev sub-bullets (refresh, never recompile); `epics.md` Story 7.10's
  card carries the Create's note (landed at Create, 2026-10-09) and Epic 7's preamble its "Given owners" list; `docs/project-context.md` unchanged.

  -- propagate, never localise (standing rule 3); end with a grep for the old sentence.

**Acceptance Criteria:**

- Given the settings page of a project, when it opens, then Posts per page is the first row, reads the project's value
  with its `posts_per_page` chip and D6a's caption, and **matches the frame** D6a `:54-66`; the mode block below it is
  R-131's unchanged; the Custom settings card matches D6a `:139-235` for every part this story builds, and D6b's Light-only
  pattern still holds.
- Given the main feed's Data group in the editor, when the Count is read, then it is greyed with "This feed is sized by
  your theme's Posts per page. Change it in Theme settings." and a "Theme settings ↗" link that opens the settings page;
  no sentence in the product sends a user into Ghost Admin for posts per page.
- Given the stepper, when + or − is pressed, then the control says "Saving…" (`aria-busy`, never `disabled`), the value
  lands in `projects.posts_per_page`, the editor's main feed paginates at it on its next read, and 0 or 101 cannot be
  reached or posted.
- Given the Custom settings card, when it is read, then the meter prints the count of this project's settings over the
  derived user cap, the twenty and the three are printed in D6a's sentence, the freeze notice is D6a's, and with no
  settings the card says so.
- Given a project with a placed section carrying a toggle or a choice control, when the
  owner promotes it with a label and a group, then a `custom_settings` row exists with a generated two-or-more-character
  lowercase snake_case key that is not reserved and not taken, the type Ghost gives that control, the control's current
  value as default (a select's options as `{value, label}` pairs), and the row appears in the list with the meter stepped.
- Given seventeen settings, when an eighteenth is promoted, then it is refused before the insert with the module's
  sentence and the Promote control greys with the same reason; the database trigger's refusal maps to the same words.
- Given a stored setting, when its label, group, default or visibility is edited, then the key does not change and cannot
  be edited; when it is deleted, a confirm opens on Cancel, names it, and — if `frozen_at` is set — warns that
  re-creating the key would bring the site owner's stored value back; any condition naming it is cleared in the same
  transaction.
- Given a visibility condition, when it is set, then it names another setting of this project by a key of two or more
  characters and one of that setting's values, never itself, and `visibilityNql` of it parses on `@tryghost/nql`.
- Given every rule in the module, when a `package.json` built from its output is scanned, then both pinned gscans report
  no `GS010-PJ-CUST-*` finding, and each deliberately broken input fails its matching code — proved in a test that runs
  in `pnpm check`.
- Given a read-only editor session (R-192), when the settings page opens, then every editing control is greyed and
  unclickable and every value is readable; given scripts off, every form still posts and answers.
- Given the page, when it loads, then `loading.tsx` draws these rows' own skeleton (R-98) and `busy.test.ts` passes.

## Spec Change Log

## Design Notes

### What D6a draws and what this story builds of it

| D6a region | Lines | This story | Else |
|---|---|---|---|
| Top bar (Orbit Weekly / Theme settings · Saved · Preview · Ship update) | `:30-41` | the back arrow and heading R-131 built | Preview and Ship are the editor's and Story 7.18's |
| Left rail (Site basics · Navigation · Social accounts · Translations · Code injection) | `:42-49` | absent (R-118, as R-131 ruled it) | Story 7.12 adds Translations and may add the rail |
| Posts per page | `:54-66` | **built** | — |
| Site basics (title · logo · accent, "from Ghost", "Change this in Ghost ↗") | `:69-100` | **built** (Question 2, option 1) | — |
| This project · Clear dark overrides | `:102-121` | R-131, unchanged | — |
| Credits | `:123-137` | absent | Story 7.28 |
| Custom settings: meter, captions, freeze notice, rows | `:139-178` | **built** | the `header_bg` row's pack-switch caption is 7.10's (accent) |
| Promote a control | `:180-235` | **built** for toggles and choice controls (Question 1, option 1) | text props, image props, the accent and D6c are 7.10's |
| D6b Credits Free | `:245-262` | absent | Story 7.28 |
| D6b Light-only pattern | `:265-290` | R-131, unchanged | — |

### The rules — `custom-settings.ts`, each with its source

- **Types:** `select · boolean · color · image · text` (gscan `:170`, Ghost's service `:107-133`). This story creates
  `boolean` and `select` only; the module knows all five because 7.10 adds `text`, `image` and `color`.
- **Groups:** `site_wide · homepage · post` stored; emitted as no `group`, `homepage`, `post` (gscan `:175-180`). FR-Q2's
  "any other string is bucketed into Site wide" is Ghost Admin's behaviour and the PRD's ruling; nothing here can produce
  another string.
- **Key:** `^[a-z][a-z0-9_]*$` (the column check) and length ≥ 2 (gscan `:225`); `settingKey` lowercases, maps every
  run of non-`[a-z0-9]` to one `_`, trims `_`, drops a leading digit's prefix (`2nd_line` → `nd_line`), and returns `''`
  when nothing survives; `claimKey` appends `_2`, `_3`, … while taken, as `slug.ts`'s `claim` does with `-`.
- **Reserved:** `RESERVED_SETTING_KEYS` — the three dark built-ins every project emits (FR-Q5). A reserved key is
  refused on creation and never counted in the user meter; `USER_SETTING_CAP = SETTING_CAP − RESERVED_SETTING_KEYS.length`
  is the trigger's 17 derived, and a test asserts the two agree by reading the migration's `>= 17`.
- **Select:** two or more options, default among them (gscan `:185-190`, Ghost `:109-114`). Stored as `[{value, label}]`;
  the EMITTED `options` are the labels and the emitted `default` the default's label, because Ghost's panel prints option
  strings verbatim (D6a's "Named values only — Ghost's panel will show Narrow, Comfortable, Wide"); 7.10 maps a chosen
  label back to the control's value when it emits the attribute. `label` is `valueWords(def.valueLabels, value)`, so
  the panel and Ghost say the same word (R-170).
- **Boolean:** default `true`/`false` as the string `'true'`/`'false'` in `default_value text`; emitted as a JSON boolean.
- **Colour:** `/^#[0-9a-f]{6}$/i` (gscan `:198`, Ghost `:122`, the column check). **Image:** no default (gscan `:203`, the
  column check). **Description:** none is offered, so the ≤ 100 rule has nothing to check.
- **Visibility:** `{ key, value }` → `key:'value'` for a string, `key:true|false` for a boolean. The key must be another
  setting of the project with a key of two or more characters; the value is one of that setting's option LABELS (a
  select) or `true`/`false` (a boolean), because the emitted `options` are the labels and Ghost compares the value it
  stores against the condition: `headline_size:'Display'`. Executed: `layout:'Wide'` and `layout:'Wide Open'` parse on
  `@tryghost/nql` 0.13.1. A label carrying `'` or `\` is refused as a condition value with a sentence rather than
  escaped — no library value contains one today (`valueWords` only raises a letter and swaps hyphens for spaces).
- **Posts per page:** an integer 1–100. The floor is the column's; the ceiling is FR-H2's 100 — the same number the
  Count stops at, and Ghost 6's default API `maxLimit` — read as a hypothesis for the archive query and checked at Dev in
  Ghost 6.58.0's API input validators (Verification); if the archive query is not capped there, the ceiling stays as a
  product choice and the caption says why.

### The stored shapes

- `bound_to`: `{ kind: 'control', instanceId, controlKey }` — the schema comment's own shape; `instanceId` is the placed
  instance's id in the project doc, `controlKey` the design's control `name`. 7.10 adds `kind: 'prop'` and `kind: 'token'`.
- `visibility_condition`: `{ key, value }` or `null`.
- `position`: the row's place in the list, assigned at creation as count + 1; the list is ordered by it.
- `options`: `[{ value, label }]` for a select, `null` otherwise.

### Which controls the Promote form offers (Question 1, ruled option 1)

The project's docs through `editorData` (the same read the page already makes), every visible instance on every stored
canvas and the site doc, each control of type `toggle`, `segmented` or `named-select` from the design's `controlSchema`,
named "Layer name · Control label" as D6a's rows do ("Home hero · Split Form →"); a control already promoted on that
instance is not offered again. Stepper and swatch-row are not offered (Never). Text props, image props and the accent
join in Story 7.10 with the type each takes.

### Site basics (Question 2, ruled option 1)

Three read-only rows from the linked site: `sites.title`, `site_settings.brand.logo` (through `imageUrl`), and
`brand.accent` (through `siteAccentOf`, drawn as a swatch with its hex), each with D6a's "from Ghost" chip and
"Change this in Ghost ↗" to `adminAt(url, 'settings')`. A missing value reads "Not set in Ghost". A project with no
linked site draws the group's heading and one caption — "Connect a Ghost site and its title, logo and accent appear
here." — with a link to Sites (UX-DR3: could-not-now, with its reason). The accent's caption is D6a's: it feeds
`--ghost-accent-color`, which the Style Pack maps to its accent role. Nothing is written (AD-10's P8: read, never write).

### Why no Schema phase

Every column (`projects.posts_per_page`, the whole `custom_settings` table), every grant (insert without `frozen_at`,
update without `key` or `frozen_at`, select and delete), the owner policy, the cap trigger and the freeze guard exist in
`20260904120000_complete_schema.sql` and are applied on production (Story 1.2's gate runs the file). The RLS gate
`bash supabase/tests/run-rls-gate.sh` already proves the policy; this story adds no SQL (R-99).

### Facts this spec rests on (standing rule 1)

Read in source this Create: gscan's custom-settings checks on both pins (identical range, `diff` executed); Ghost
6.58.0's value validation and its sync-on-activate (the resurrect and the type-change removal); Ghost's theme config
`allowedKeys` and `collection.js`'s page size. Executed: `@tryghost/nql` 0.13.1 parses the condition strings above.
Hypothesis, to be read at Dev: Ghost 6's API `maxLimit` applies to the collection controller's browse (the stepper's
100). Nothing was executed on T1 — this story writes no theme and reads no Ghost.

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, signed in as yourself. The URLs
are **Pilot sections** (`b6d4db35-8e5e-45e1-a70f-4daa28916d51`) and **Ghost 6 Project**
(`21d868cf-1262-4ad2-9a44-091fbf653a04`); you ruled option 1 on both questions, so every step below applies. Step 4 puts
Posts per page back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open the **⋯** menu at the top right and choose **Theme settings**. | — | The Theme settings page. **Posts per page** is the first row: a − 12 + stepper, a small `posts_per_page` chip, and "How many posts your archives show before paginating. Your theme owns this — Ghost has no setting for it." Below it, the This project and Clear dark overrides rows you tested in Story 5.6, unchanged. |
| 2 | the same page | Theme settings | Press **+** once. | — | The stepper says "Saving…" for a moment, then reads **13**. Reload the page: still 13. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the **Three Up** post grid, open **Data** in the right-hand panel and look at **Count**. | — | Count is greyed at **13** and reads "This feed is sized by your theme's Posts per page. Change it in Theme settings." with a **Theme settings ↗** link. Click it: the Theme settings page opens. |
| 4 | the same page | Theme settings | Press **−** once. Then hold − down to the bottom, and + up to the top. | — | Back to 12 and saved. The − goes pale and stops at **1**; the + goes pale and stops at **100**. Set it back to 12. |
| 5 | the same page | Theme settings | Look at the **Custom settings** card. | — | "Custom settings" with a chip reading **0 OF 17**, the sentence about Ghost's twenty and the three dark-mode built-ins, "Keys freeze once you deploy or export — pick them like you mean it.", and "Nothing promoted yet." |
| 6 | the same page | Promote a control | Under **Promote a control**, open **Which control**, choose **Latest Post · Primary action**; type the label; leave Group on **Site wide**; press **Promote**. | Label: `Show the button` | The key fills itself as `show_the_button` while you type. Promote says "Promoting…", then a row appears: **Show the button** · Latest Post · Primary action → · `show_the_button` · boolean. The chip reads **1 OF 17**. |
| 7 | the same page | Promote a control | Promote a second control: **Latest Post · Headline size**, Group **Homepage**. | Label: `Headline size` | A second row: `headline_size` · select. The chip reads **2 OF 17**. |
| 8 | the same page | Custom settings | On the **Show the button** row press **Edit**; set **Only show when** to Headline size · is · Display; change the label; save. | Label: `Show the big button` | The row now reads **Show the big button**, the key is still `show_the_button` (it cannot be typed into), and a caption reads "Only when Headline size is Display". |
| 9 | the same page | Custom settings | Promote **Latest Post · Primary action** again. | — | It is not in the list of controls any more — it is already promoted. |
| 10 | the same page | Custom settings | Press **Delete** on **Headline size**. | — | A small window: "Delete Headline size?" with "Nothing is deployed yet, so nothing is lost.", focus on **Cancel**. Press **Delete**: the row goes, and the "Only when…" caption on Show the big button goes with it. Chip: **1 OF 17**. Delete Show the big button too: **0 OF 17**, "Nothing promoted yet." |
| 11 | the same page | Theme settings | Look between Posts per page and This project. | — | **Site basics** with one line: "Connect a Ghost site and its title, logo and accent appear here." and a link to Sites — this project links no site. |
| 12 | `https://app.inflozo.com/projects/21d868cf-1262-4ad2-9a44-091fbf653a04/settings` | Theme settings | Look at **Site basics**. | — | Three rows — Site title, Logo, Accent colour — each marked "from Ghost" with "Change this in Ghost ↗"; a value Ghost never gave reads "Not set in Ghost". The link opens that site's Ghost Admin settings in a new tab (it may ask you to sign in to Ghost). |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings`, in a second window | Theme settings, read-only | Open the project in a second window first (it shows read-only), then open its Theme settings there. | — | Every stepper, field, menu and button is greyed and does nothing; the values are readable. Close the second window. |

## Questions for the owner

Questions 1 and 2 were ruled option 1 (owner, 2026-10-09). Dev builds the Promote form for toggles and choice controls, and Site basics, as this spec describes them. Question 3 was raised at Dev and is open; everything else in this story is built and waits in the working tree for it.

### Question 1 — Where the "Promote a control" form is built: this story or Story 7.10

**In plain English.**
- A Ghost theme setting in Inflozo is always made by promoting one of your section controls (the plan, FR-Q3; the
  database keeps a binding on every setting row). The form that does it — "Which control · Label in Ghost · Key · Group
  in Ghost · Only show when · Promote" — is drawn on the right of the Theme settings page (D6a).
- This story's card says you can define a setting's name, type, options, default, group and condition. Story 7.10's card
  says what type each control becomes and that "the builder matches D6a's right column". Both describe the same form,
  so one story has to own it.
- Story 7.10 is already the big one: it writes the settings into the theme, strips formatting from a promoted text, warns
  before a pack switch, previews settings on the canvas, and parks a setting when you shuffle a design away.

**Example.** With option 1, after this story you open Theme settings, pick "Latest Post · Primary action", type "Show
the button" and press Promote; the setting is stored and listed, and the meter reads 1 OF 17. It reaches your theme in
Story 7.10. With option 2, this story shows the Posts per page row and an empty Custom settings card, and the first
setting you can make arrives with Story 7.10.

1. **Build the form here for toggles and choice controls** (Toggle → true/false, Segmented and Named Select → a list of
   named values), with the list, edit and delete around it. Text, pictures and the accent colour join in Story 7.10,
   where their confirms and warnings live. Story 7.10's type lines for those two kinds are then "built in 7.9", noted
   on its card word for word (R-195). **(RECOMMENDED)**
2. **Build the form in Story 7.10.** This story builds Posts per page, the Count link, the meter, the notice, the empty
   card and the rules, and the first setting you can make arrives with 7.10 — so steps 6–10 of your test move there.
3. **Build the whole form here, text props and the accent included,** with D6c's confirm and the pack-switch warning.
   This story then also changes the editor's text toolbar (the lock pill) and the Style panel, and grows by about half.

**Ruled: option 1 (owner, 2026-10-09).**

### Question 2 — Site basics: show your Ghost site's title, logo and accent here, or leave it out

**In plain English.**
- The Theme settings drawing (D6a) has a **Site basics** group: your site's title, its logo and its accent colour, each
  marked "from Ghost" with a "Change this in Ghost" link. Inflozo only reads these — Ghost owns them.
- No story in the plan owns that group. When the page was first built (Story 5.6, R-131) it was left out as "Epic 7's".
- Inflozo already stores all three for a linked site (your Sites page's brand read, Story 6.6), so showing them costs
  three read-only rows and a link.

**Example.** With option 1, Ghost 6 Project's Theme settings shows "Site title · Ghost 6 · from Ghost · Change this in
Ghost ↗", its logo and its accent swatch; Pilot sections, which links no site, says "Connect a Ghost site and its
title, logo and accent appear here." With option 2 the group is not there, and the page goes from Posts per page
straight to This project.

1. **Show it here, read-only, from the linked site** — the drawing as drawn, with the one-line caption when no site is
   linked. **(RECOMMENDED)**
2. **Leave it out** and give the group to a later story — Story 7.18 (the deploy wizard, which first needs the site's
   details) is the nearest — noted on that card word for word (R-195).
3. **Drop it from the product.** The frame keeps the drawing; the plan records that Site basics is never built, because
   the Sites page already shows the brand.

**Ruled: option 1 (owner, 2026-10-09).**

### Question 3 — With JavaScript switched off, Theme settings never finishes loading (raised at Dev, 2026-10-09)

**In plain English.**
- This story promises that every Theme settings form still works for someone whose browser has JavaScript switched off
  (the "Scripts off" row).
- Dev tested it, and it cannot hold on any page that shows grey loading bars while it loads. With JavaScript off the
  grey bars stay for ever and the real page never appears, so there is nothing to press. With JavaScript on, nothing is
  wrong.
- Six signed-in pages show such bars, Projects, Sites and Account among them, and the same cause applies to each. The
  editor itself already needs JavaScript.

**Example.** Switch JavaScript off in Chrome and open Theme settings: you see the grey bars where Posts per page and
Custom settings belong, and they never turn into the stepper and the Promote form.

1. **Signed-in pages need JavaScript, like the editor.** Keep the grey bars and stop promising that these pages work
   with JavaScript off. This story drops its "JavaScript off" check, and the old notes in the code that made the same
   promise are corrected. **(RECOMMENDED)**
2. **Keep the promise on all six pages.** With JavaScript off, a small rule hides the grey bars and shows the real page.
   It appears below the app's frame rather than in its place, and this story grows by a check on each of the six pages.
3. **Theme settings only.** Remove its grey bars so it works with JavaScript off, and leave the other five as they
   are. Theme settings then shows a blank space while it loads, which breaks your loading-bars rule (R-98) on this one
   page.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, including `custom-settings.test.ts` (the rules,
  the gscan rows on both pins through `runGscan`), `controls.test.ts` and `data-group.test.ts` (the two sentences),
  `settings.test.ts` and `busy.test.ts`.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green; no new file under `tools/` or `docs/`.
- `bash supabase/tests/run-rls-gate.sh` -- expected: the gate passes unchanged (no SQL in this story).
- `pnpm keyboard` -- expected: green; the editor walk's Data-group stop reads the Count's new sentence where it already
  reads the old one.
- At Dev, read in Ghost 6.58.0's source (the tarball in this session's scratchpad, re-extracted fresh if missing):
  `core/server/api/endpoints/utils/validators/input/*` for `maxLimit` and whether `collection.js`'s `pathOptions.limit`
  passes through it -- expected: a cited line either way; the stepper's 100 keeps or gains its caption accordingly.

**Real infrastructure (Review, R-82, on the owner's in-session go — production writes):**
- Vercel READY at the Dev head, CI `check` / `rls` / `deploy` green, `matrix` green.
- Through an RLS session (`generate_link` + `verifyOtp`, the pattern in memory) on a `+alias` test account's project:
  seventeen `custom_settings` inserts land; the eighteenth is refused `23514`; an update to `key` is refused `42501`; a
  `label` update lands; every row is deleted afterwards and the project read back clean. Through the pooler as the owner's
  script, one row's `frozen_at` is set, a `key` change on it is refused by `custom_settings_key_frozen`, a `label` change
  lands, and the row is deleted.
- On production, as the owner's own account: the manual test above, after Deploy.

**Manual checks (if no CLI):**
- D6a `:54-66` and `:139-235` beside the deployed page at 1440: the same rows, in the same order, with the frame's
  sentences verbatim; D6b `:265-290` still holds on a Light-only project.
