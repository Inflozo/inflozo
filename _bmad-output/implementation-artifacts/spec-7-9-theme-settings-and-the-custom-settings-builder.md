---
title: 'Story 7.9 — Theme Settings and the custom-settings builder'
type: 'feature'
created: '2026-10-09'
status: 'in-review'
owner_test: pending
review_loop_iteration: 1
baseline_commit: '0b6fdcd0832a23e566b54e9e2af4274463050b8e'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story the Theme settings page (the one that today holds only Light only / Light + Dark and Clear dark
overrides) grows its first real knob — **Posts per page**, the number of posts each archive page of your site shows
before it paginates, which you set here because Ghost has no setting for it — and the greyed Count on your main post
feed now says "Change it in Theme settings." with a working link to this page. Beside it sits the **Custom settings**
card: a meter reading how many of your seventeen Ghost theme settings you have used, the notice that a setting's key
freezes once you deploy or export, and the list of settings you have promoted, each of which you can regroup,
hide behind another setting or delete (with a warning), and a **Promote a control** form that turns a toggle
or a choice control from one of your sections into a setting the site's owner will later change in Ghost Admin without
opening Inflozo (you ruled so on 2026-10-09), above a read-only **Site basics** group showing the linked site's title,
logo and accent as Ghost holds them. Nothing reaches a theme yet: the settings are stored and checked against Ghost's own
rules now, and Story 7.10 writes them into the theme. Since your rulings of 10 October: the Light only / Light + Dark block
sits flat on the page as the drawing shows it; **Which control** lists your controls page by page, each with its section,
its choices and the one in force now; the label and the group fill themselves in; a box under the form says what your
site's owner will see in Ghost and what it changes; and a setting's name is set once, at Promote, because Ghost names a
setting by its key and nothing can rename it there.

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
(R-99). *(Amended on Question 7's ruling, option 2, owner, 2026-10-10: one migration after all —
`delete_custom_setting()`, so a delete and the conditions it clears are one save — pushed first as a Schema phase.)*

## Boundaries & Constraints

**Always:**
- The frame is `D6 Theme Settings Completed.dc.html` **D6a** (`:54-66` Posts per page, `:69-100` Site basics,
  `:139-235` the Custom settings column) and **D6b** (`:241-290`); the built mode block stays as R-131
  built it, except that it sits flat in the column under its rule as D6a draws it, not in D6b's detail card (Question 4,
  ruled option 1, owner, 2026-10-10). The Kit's `Stepper`, `Select`, `Toggle`, `TextInput`, `ConditionRow`, `HelperCaption`, `CounterChip`,
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
  position, updated_at` and no `key`. **Named once (Question 6, ruled option 1, owner, 2026-10-10):** Ghost has no label
  for a theme setting and names each by its key (read in Ghost's admin source, 5.130.6 and 6.58.0), so the key is made
  from Label in Ghost and shown read-only in the Promote form too (D6a draws it so, `:197-202`), the action works it out
  again rather than reading a posted key, the stored label is `ghostName(key)`, and Edit shows the label and key
  read-only and never writes either. The freeze notice is D6a's sentence verbatim.
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
  these rows' own skeleton, and every form is a plain form (the page itself needs JavaScript: it streams behind its
  skeleton — Question 3, ruled option 1). **R-192:** in a read-only editor session the whole
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
| Label → key | "Show the Button!" · "  Wide  " · "W" · "Show tag" twice | `show_the_button` · `wide` · refused ("A key needs at least two letters") · `show_tag`, then `show_tag_2` — each stored with the label Ghost makes of it ("Show the button", "Show tag 2") | a label that leaves no key (an emoji) is refused with the sentence |
| Reserved key | label "Color scheme" → `color_scheme` | refused: "color_scheme is one of the three dark-mode settings every Inflozo theme carries." | N/A |
| The cap | 16 rows stored, a 17th promoted · 17 stored, an 18th | the 17th lands and the meter reads "17 OF 17"; the 18th is refused BEFORE the insert with "You have used all 17 of your theme settings. Delete one to promote another." — and the trigger's `23514` maps to the same sentence if it is ever reached | the Promote button greys at the cap with that reason (UX-DR3) |
| Group outside Ghost's two | the Select offers Site wide · Homepage · Post only | `site_wide` stored; nothing else is possible to type | N/A |
| Visibility set | on `show_the_button` (boolean), "Only show when" Headline size is Display | `visibility_condition: { key: 'headline_size', value: 'Display' }` — the option's LABEL, which is what Ghost stores and compares; the row's caption reads "Only when Headline size is Display" | the condition's Select offers every OTHER setting of the project; a setting with no other setting draws the row greyed with "Promote a second control to show this one conditionally." |
| Visibility's target deleted | `headline_size` deleted while `show_the_button` names it | one confirm, one transaction: the row goes and the condition is cleared; the caption disappears | N/A |
| Edit on a frozen row | `frozen_at` set, group changed | group saved; the label and the key are read-only (Question 6 — Ghost names a setting by its key), the label reads `ghostName(key)`, and the row carries "Key frozen since <date>" | a direct key change is `42501` from the grant, mapped to "This key is frozen — it was deployed or exported."; a posted `label` is not read |
| Which control (Question 5) | Pilot sections: Latest Post on Home, a header on every page | the menu is headed by each page its controls are on — Every page, then D5b's canvases in order — and each row reads its control, its section, every value and "now <the one in force>"; a second instance of a name reads "<section> (2)" | N/A |
| What your site's owner will see (Question 5) | Headline size on Latest Post (Home) chosen | Label in Ghost starts as "Headline size", the key as `headline_size`, Group in Ghost as Homepage; the box reads "In Ghost's Design panel, under Homepage, your site's owner will see "Headline size", a list set to Large. It changes Headline size on Latest Post, on your Home page." and follows every change to the label or group | with the cap reached or nothing to offer, the box is not drawn |
| Delete | an unfrozen row · a frozen row | "Delete Show the button?" with "Nothing is deployed yet, so nothing is lost." · the same with "If you later promote a control with the key show_the_button, the value your site's owner set in Ghost comes back." | focus opens on Cancel (R-134) |
| Select default outside its options · image default · colour not 6-digit hex | module inputs | each refused with its sentence; `hex6_colour` and `no_image_default` are the floor | unit rows, since no UI in this story can produce them |
| Read-only session (R-192) | a second window holds the lock | every stepper, field, select, toggle and button greyed, values readable, no form posts | N/A |
| Another user's project | an id the caller does not own | every write reaches zero rows (RLS) and the action answers "We couldn't save that just now." | never a 500 |
| Scripts off | any form | not offered: the app needs JavaScript (Question 3, ruled option 1, as Story 3.9's Question 5 — `EXPERIENCE.md` § Where the floor stops). The route streams behind its `loading.tsx`, so with scripts off it stays on its skeleton; every control is still a plain form's submit, so a press before the page's scripts run posts natively | no check runs with scripts off |

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

- `apps/web/components/kit/stepper.tsx` — `Stepper` (`min`, `max`, `onStep`, `greyed`); `select.tsx:82` `Select` (since
  Question 5 its rows pass `group`, `icon`, `contents` and `menuWidth` to `Menu`, which draws a heading per group);
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

- [x] `packages/section-runtime/src/custom-settings.ts`, `index.ts`, `custom-settings.test.ts` — the module: `SETTING_CAP`
  (20), `RESERVED_SETTING_KEYS` (`color_scheme`, `dark_accent_color`, `dark_logo` — one list, 7.11's to confirm),
  `USER_SETTING_CAP` derived, `GHOST_SETTING_TYPES`, `GHOST_SETTING_GROUPS`, `settingKey(label)`, `claimKey(taken, key)`,
  `settingOf(controlDef, value)` (toggle → boolean; segmented / named-select → select with `[{value, label}]` options and
  the current value's label as default), `checkSetting(row, others)` (every rule in § The rules, each failure one of
  `SETTING_WORDS`' sentences), `visibilityNql({key, value})`, `postsPerPage(v)` (1–100 integer or a sentence). Tests:
  the I/O matrix's module rows, and a gscan row — a `BASE` theme whose `package.json` carries `custom` built from the
  module's output plus a `{{@custom.key}}` reader per key passes both pinned gscans with no `GS010-PJ-CUST-*` finding,
  and a control with each rule broken fails the matching code.

  -- FR-Q2's rules as data, executed on both gscans (standing rule 1).
- [x] `packages/section-runtime/src/controls.ts:376` — `mainCount` becomes the two sentences; `controls.test.ts` and
  `apps/web/data-group.test.ts:33` hold the new text.

  -- DW-254's first half; one list (R-170).
- [x] `apps/web/components/controls/data-group.tsx`, `sidebar.tsx`, `editor.tsx:5809` — a `settingsHref?: string` threaded
  from the editor to the Count row; drawn as D5c's "Theme settings ↗" link under the greyed reason; the harness passes
  none and draws none.

  -- DW-254's link; a door arrives with the thing it opens (R-118).
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` — `setPostsPerPage` (writes `posts_per_page`
  alone, `revalidateProject`); `promoteControl` (reads the project's docs through `editorData`, finds the instance and
  control, builds the row with the module, checks it against the project's other settings, inserts through the caller's
  session; maps `23514` and `23505` to the module's sentences); `updateSetting` (label, group, visibility, default —
  never key); `deleteSetting` (clears conditions that name it, then deletes, one `sync`-style order: condition writes
  first so a failure leaves no dangling condition). Every action is `(previous, formData)` and works with scripts off.

  -- the writers the table has waited for since Story 1.2.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/theme-settings.tsx`, `page.tsx` — D6a in order: **Posts per
  page** (`Stepper` 1–100, the `posts_per_page` chip, the caption verbatim, "Saving…" while it posts), **Site basics**
  (Question 2, ruled: title · logo · accent rows, or the one caption), the built mode block untouched, the **Custom settings** card: header with the meter chip "n OF 17", the
  two captions verbatim, the freeze notice verbatim, the rows (label · "Design · Control →" · key chip · type word ·
  the condition caption when set · Edit · Delete), the empty state "Nothing promoted yet.", the **Promote a control** form
  (Question 1, ruled: Which control as a `Select` over the project's placed toggle / segmented / named-select controls named
  "Layer · Control"; Label in Ghost; Key, generated live and editable before Promote; Group in Ghost; Only show when
  with the Kit's `ConditionRow`, optional; Promote; D6a's two closing captions). The delete confirm in `dialog.ts`'s
  sheet, focus on Cancel. `ReadOnly` over the whole card in a read-only session.

  -- the surface, matching the frame (R-74).
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/loading.tsx` — bars for each new row, in the page's order.

  -- R-98; `busy.test.ts`.
- [x] `apps/web/lib/paywall.ts:107` — `adminAt` gains the anchor Site basics links to (`settings`), so one function builds
  every Ghost Admin address (Question 2, ruled).

  -- one builder, one shape.
- [x] `apps/web/settings.test.ts` (new) — the actions' refusals by shape (no id, bad range, a key the module refuses, the
  cap sentence), `mainCount`'s link present with a project and absent without, the page's read-only state; the gate's
  `pnpm check` runs it.

  -- the I/O matrix's app rows.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` DW-254 → done with the commit; `epic-7-context.md` — the
  Theme Settings block gains this story's Create and Dev sub-bullets (refresh, never recompile); `epics.md` Story 7.10's
  card carries the Create's note (landed at Create, 2026-10-09) and Epic 7's preamble its "Given owners" list; `docs/project-context.md` gains Question 3's pitfall line ("The app needs JavaScript; its forms do not", Dev, 2026-10-09).

  -- propagate, never localise (standing rule 3); end with a grep for the old sentence.
- [x] *(Question 4, ruled option 1, owner, 2026-10-10)* `theme-settings.tsx`'s `ModeBlock` and `loading.tsx` — the block
  flat in the column under a `line-faint` rule, as D6a `:102-121` draws it; R-131's card (D6b's detail shape) gone.

  -- the page reads as one surface, as the frame does (R-74).
- [x] *(Question 5, ruled option 3, owner, 2026-10-10)* `lib/theme-settings.ts` — `pageOf` (the site doc as "Every page",
  D5b's canvases in order, page 2 after its page 1, and the group each suggests), `placedControls` walking the docs in that
  order and carrying `control`, `section`, `page`, `group`, `category`; `choicesOf`, `startOf`, and `THEME_WORDS`' `now`,
  `willGet`, `gets`. The Kit's `Menu` learns `group` (a heading drawn as D6a's rail heading, `:42`) and `Select` passes
  `group`, `icon`, `contents` and `menuWidth` through. The Promote form: each row a `LayerThumb`, the control and its
  section, its values and "now <value>"; the label starting at the control's name and the group at the page's, each until
  changed; the "What your site's owner will see" box (D6c's "What ships", `:303`, extrapolated) before Promote.
  `settings.test.ts` holds the order, the pages, the groups and the sentences; the walk's step 104d reads them deployed.

  -- the owner's finding before his test: he could not tell what a control was or where it appeared (R-80).
- [x] *(Question 6, ruled option 1, owner, 2026-10-10)* `custom-settings.ts`' `ghostName` (Ghost's own function, read in
  both majors' admin source) with its test; `promoteControl` works the key out from the label and stores `ghostName(key)`
  as the label, never reading a posted key; `updateSetting` neither reads nor writes a label; the page names every setting
  by `ghostName(key)` (rows, conditions, the delete confirm) and Edit shows the label and key read-only with
  `THEME_WORDS.nameFixed`. The walk's 104e reads the shown key, and 104g and 104j edit a group instead of a label.

  -- a claim about Ghost that was false (standing rule 1): a label could never have been renamed in Ghost.
- [x] Propagation: `epics.md` — Story 7.9's card corrected ("a setting is named once") and its three rulings, Story 7.10's
  card given "promote from the editor itself" word for word (R-195) and named-once, Epic 7's preamble gains "Given owners by
  Story 7.9's Dev"; `prd.md` FR-Q2's "rename changes the label only" corrected with its date and source; `epic-7-context.md`
  a sub-bullet. Ends with a grep for "rename changes the label".

  -- propagate, never localise (standing rule 3); a propagation list cannot audit itself (rule 7).

**Acceptance Criteria:**

- Given the settings page of a project, when it opens, then Posts per page is the first row, reads the project's value
  with its `posts_per_page` chip and D6a's caption, and **matches the frame** D6a `:54-66`; the mode block below it is
  R-131's, flat in the column under its rule as D6a `:102-121` draws it (Question 4); the Custom settings card matches D6a
  `:139-235` for every part this story builds, and D6b's Light-only pattern still holds.
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
- Given a stored setting, when its group, default or visibility is edited, then neither its key nor its label changes and
  neither can be edited — the label is the name Ghost makes of the key (Question 6); when it is deleted, a confirm opens on Cancel, names it, and — if `frozen_at` is set — warns that
  re-creating the key would bring the site owner's stored value back; any condition naming it is cleared in the same
  transaction.
- Given a visibility condition, when it is set, then it names another setting of this project by a key of two or more
  characters and one of that setting's values, never itself, and `visibilityNql` of it parses on `@tryghost/nql`.
- Given every rule in the module, when a `package.json` built from its output is scanned, then both pinned gscans report
  no `GS010-PJ-CUST-*` finding, and each deliberately broken input fails its matching code — proved in a test that runs
  in `pnpm check`.
- Given a read-only editor session (R-192), when the settings page opens, then every editing control is greyed and
  unclickable and every value is readable; and no surface here promises to work with scripts off (Question 3, ruled
  option 1).
- Given the page, when it loads, then `loading.tsx` draws these rows' own skeleton (R-98) and `busy.test.ts` passes.
- Given the Promote form (Question 5), when Which control is opened, then its rows are headed by the page each control is
  on, in `pageOf`'s order, and each reads the control, its section, every value and the one in force; when a control is
  chosen, Label in Ghost starts at the control's name, the key at its words, Group in Ghost at the page's group, and the
  box above Promote reads `THEME_WORDS.gets` for that control, name and group, following every change.
- Given any label typed at Promote (Question 6), when it is promoted, then the stored key is `claimKey(settingKey(label))`
  whatever else was posted, the stored label is `ghostName(key)`, and that is the name the row, the conditions, the delete
  confirm and Edit print.

### Review Findings (2026-10-10)

Five layers ran: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, and the real-infra verifier (run in
the main session on the owner's in-session go, R-82 — results under § Verification). Every finding was read in the code
before it was rated; each patch's test was turned red by a mutation and restored byte for byte.

- [x] [Review][Decision] Delete is two ordered writes, not one transaction — the criterion says "cleared in the same
  transaction"; one save needs a database function, which is a Schema phase this spec rules out without a question. Put to
  the owner as **Question 7**; ruled option 2 (owner, 2026-10-10): `delete_custom_setting()`, pushed first as a Schema
  phase, then `deleteSetting` calls it [actions.ts `deleteSetting`, `20261010120000_delete_custom_setting.sql`]
- [x] [Review][Patch] A label that leaves no key ("🎉", "2", "!!!") was refused "A setting needs a label." — since Question
  6 the label is the key's words, so the label rule fired first; the key is now checked first and the matrix's sentence
  ("A key needs at least two letters.") answers [custom-settings.ts `checkSetting`]
- [x] [Review][Patch] Which control was remembered by its place in the list, so a revalidation that added or dropped a row
  could move the choice to another control under a typed label; it is remembered by the control's own id
  [theme-settings.tsx `PromoteForm`]
- [x] [Review][Patch] Two settings could each show only when the other did, which can hide both in Ghost's panel for good;
  a chain of conditions that comes back to the setting is refused with `SETTING_WORDS.cycle` [custom-settings.ts
  `checkSetting`]
- [x] [Review][Patch] Site basics drew three identical rows; Question 2 ruled "the drawing as drawn", and D6a draws the
  title locked with "Change this in Ghost — it appears in email too", the logo with "from Ghost" and the link, and the
  accent on a white field with "from Ghost" and no lock or link [theme-settings.tsx `SiteBasicsGroup`, `Basic`]
- [x] [Review][Patch] A control another one greys (`disabledBy`, e.g. Latest Post's Secondary action while Primary action
  is Off) was offered at its stored value, so "now …" and the setting's start disagreed with the canvas; it is read in
  force through `resolveControls` [lib/theme-settings.ts `placedControls`]
- [x] [Review][Patch] The delete confirm said "nothing is lost" while it cleared other settings' conditions silently; it
  now names them ("The “Only show when” on Show the button is removed too.") [theme-settings.tsx `DeleteForm`]
- [x] [Review][Patch] Edit still opened in a read-only session — a disabled fieldset never disables a `<summary>` (R-192);
  the page refuses the disclosure itself [theme-settings.tsx `EditForm`]
- [x] [Review][Patch] Focus fell to the page after a saved Edit (its Save hidden) and a delete (its row gone); it returns to
  Edit, and waits at the card's heading [theme-settings.tsx `EditForm`, `DeleteForm`]
- [x] [Review][Patch] `conditionOf` and `refusalOf` were held only by regexes over the source; moved to
  `lib/theme-settings.ts` and run — a switch's `true`/`false` as JSON, the trigger's own message (read from every
  migration, the last definition winning) mapping to the cap sentence, a column check's `23514` not [actions.ts,
  settings.test.ts]
- [x] [Review][Patch] Two values printed alike would give Ghost's panel the same word twice and 7.10 no way back; such a
  control is not offered [custom-settings.ts `settingOf`]
- [x] [Review][Patch] An accented letter was dropped from a key ("Café" → `caf`, which Ghost shows as "Caf"); it keeps its
  letter (`cafe`) [custom-settings.ts `settingKey`]
- [x] [Review][Patch] The condition-value refusal named the target by its stored label; it names it as everything else
  on the page does, `ghostName(key)` (R-170) [custom-settings.ts `checkSetting`]
- [x] [Review][Patch] A promote whose docs read threw reached the error boundary; it answers the one sentence
  [actions.ts `promoteControl`]
- [x] [Review][Patch] Edit drew a Select for every non-boolean row, which would post an empty default for Story 7.10's
  colour, picture and text rows; it draws a default only for the two kinds this story makes [theme-settings.tsx
  `EditForm`]
- [x] [Review][Patch] The logo's name read a trailing `/` or a query string; `fileName` takes the path's last part
  [lib/theme-settings.ts]
- [x] [Review][Patch] "on your Home page 2 page" for a section only on a page 2 [lib/theme-settings.ts `THEME_WORDS.gets`]
- [x] [Review][Patch] A row whose control is no longer placed drew a stray "→" [theme-settings.tsx `SettingItem`]
- [x] [Review][Patch] The live condition row's value box was a silent Tab stop before a field is chosen; it says it is
  unavailable (`aria-disabled`) [condition-row.tsx]
- [x] [Review][Patch] The walk could not tell a stored typed label from Ghost's name, never read Only show when greyed,
  and claimed its forced read-only submit proved more than it does: 104e reads "Show tag 2", 104d reads the greyed row and
  then the live one, 104f the confirm's new line, 104i Edit refused (and says plainly what its forced submit proves), 104l
  Site basics as drawn [run-verify-editor.cjs]
- [x] [Review][Patch] Ghost 5's half of two source claims was unread: 5.130.6 read in source — its `collection.js` caps no
  archive and it has no `max-limit-cap`; its admin declares `settings-x` at `/settings` [custom-settings.ts
  `POSTS_PER_PAGE`, paywall.ts `adminAt`]
- [x] [Review][Patch] Epic 7's preamble listed the 7.10 hand-over but not the 7.12 one (R-195) [epics.md]
- [x] [Review][Patch] A test message said the writers "post with scripts off" (Question 3 ruled otherwise); the Minus
  icon's comment named a default it does not have [settings.test.ts, icons.tsx]
- [x] [Review][Patch] This spec: Site basics' design note, "with the NQL parsed" (the parse is gscan's), written-down
  test counts, the project-context line the task said was unchanged, and owner's-test steps 4 (each press is one step),
  10 (the new confirm line) and 12 (Site basics as drawn) [this file]
- [x] [Review][Defer] The deployed walk dies when the browser holds a promote's POST or cancels its answer's body — three runs
  at 104e's first promote, a 74-second hold reproduced by probe — DW-352, owned by Story 15.1 [run-verify-editor.cjs
  `posted104`] — deferred, the walk's environment, not the product
- [x] [Review][Defer] Two promotes landing in the same instant at sixteen can store eighteen — the cap trigger counts
  without a lock — DW-351, owned by Story 7.10's emitter [complete_schema.sql:331] — deferred, needs a trigger change

Dismissed, each read in the code or the frame: D6a's own sentences ("…after your next deploy", "an editor never sees…",
the type words); the reserved key refused rather than claimed past, and Promote refusing after the press (the matrix's
rows); the toggle's `'on'` (the library's grammar refuses any other toggle value); duplicate numbering across pages (the
matrix's row); the 55% read-only dimming (the editor's B5a treatment, R-192); `42501` mapped to the frozen sentence (the
matrix's row, and no action can reach a `42501`); a lost stepper press (React's optimistic update renders in the sync lane —
`dispatchOptimisticSetState`, `lane: 2`, read in Next's bundled `react-dom`); the settings writers not consulting the edit
lock and the page reading it once (row-level writes the database guards; the matrix's case — a lock already held — holds);
`posts_per_page` above 100 written straight to the table (only the owner's own hand-made call reaches it); a disconnected
linked site's last values in Site basics (they are what Ghost gave; the Sites page carries the state); the delete's
pre-hydration press (R-131's pattern, Question 3); the stepper's `aria-busy` without `aria-disabled` (presses queue, the
criterion's own words); the skeleton's full shape; a design swapped under a bound control (Story 7.10's parking); and
small type sizes the Kit's components own.

## Spec Change Log

- **Dev, 2026-10-09 — Question 3, ruled option 1 (owner): the app needs JavaScript.** Dev executed that a route with a
  `loading.tsx` streams its page into a hidden holder only React's inline script reveals, so with scripts off Theme settings
  stays on its skeleton (a throwaway async route beside a `loading.tsx` under `next dev`: the skeleton with scripts off,
  the content with them on, and the content either way with no boundary — the control). The ruling restates Story 3.9's
  Question 5 (2026-09-11), already in `EXPERIENCE.md` § Where the floor stops, which this spec's Create missed. Amended
  inside the frozen block on that ruling: the R-98 bullet in Boundaries, the matrix's "Scripts off" row and the R-192
  criterion's last clause. Dropped: the deployed walk's step 104k. Corrected: the code notes on every streamed route (each `loading.tsx`)
  that promised a page works with scripts off (they now say plain form); notes on routes that render without a boundary
  (`/sites/keys`, `/sites/disconnect`, the connect wizard) were true and are unchanged.
- **Dev, 2026-10-10 — the owner's rulings on Questions 4, 5 and 6, before Review.** Looking at the deployed page, the owner
  asked whether it would yet be redrawn to D6 and how a customer could tell what a control is and where it appears. Ruled:
  Q4 option 1 (the mode block flat, as D6a draws it), Q5 option 3 (a clearer Which control, a label and group that fill
  themselves in and a "What your site's owner will see" box here; promoting from the editor itself in Story 7.10), and —
  raised in the same session after Ghost's admin source showed a setting has no label in Ghost — Q6 option 1 (a setting is
  named once). Amended inside the frozen block on those rulings: the frame bullet's mode-block clause, the Keys bullet, the
  matrix's "Label edit on a frozen row" (now "Edit on a frozen row") and "Label → key" rows, and two new rows for Which
  control and the box. FR-Q2's "rename changes the label only", in the PRD and on this story's card, is corrected with its
  source. Four tasks and three criteria added; the first criterion and the edit criterion amended; the owner's test steps
  1 and 6–9 rewritten.
- **Review, 2026-10-10.** Five layers; the findings and their dispositions are § Review Findings. Amended outside the frozen
  block: Site basics' design note (Question 2's "the drawing as drawn" — D6a's three rows are not alike), the task line on
  `docs/project-context.md`, the verification notes, and owner's-test steps 4, 10 and 12. Inside the frozen block nothing
  changed: the delete's "one transaction" is Question 7's, open.
- **Review, 2026-10-10 — Question 7, ruled option 2 (owner): a delete and the conditions it clears are one save.** A
  Schema phase after all: `20261010120000_delete_custom_setting.sql`, mirrored in `SCHEMA.sql` § 16 and proved in
  `RLS-TEST.sql` (and its copy), applied to production and pushed alone; then `deleteSetting` calls it. Amended inside the
  frozen block on that ruling: the Approach's "no migration" sentence. The matrix's "one transaction" and the criterion's
  "in the same transaction" now hold as written.

## Design Notes

### What D6a draws and what this story builds of it

| D6a region | Lines | This story | Else |
|---|---|---|---|
| Top bar (Orbit Weekly / Theme settings · Saved · Preview · Ship update) | `:30-41` | the back arrow and heading R-131 built | Preview and Ship are the editor's and Story 7.18's |
| Left rail (Site basics · Navigation · Social accounts · Translations · Code injection) | `:42-49` | absent (R-118, as R-131 ruled it) | Story 7.12 adds Translations and may add the rail |
| Posts per page | `:54-66` | **built** | — |
| Site basics (title · logo · accent, "from Ghost", "Change this in Ghost ↗") | `:69-100` | **built** (Question 2, option 1) | — |
| This project · Clear dark overrides | `:102-121` | R-131's, flat in the column as drawn (Question 4) | — |
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
- **Name (Question 6):** `ghostName(key)` — Ghost's admin names a setting from its key alone: the first letter raised,
  each `_` a space, API/CTA/RSS in capitals (Ghost 6.58.0 `core/built/admin/assets/index-BOJzlYiz.js` `mU`; 5.130.6
  `admin-x-settings/index-BVxh86CD.mjs` `iR`; called on `e.key` for all five types in each). The stored label is it.
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

**Question 5, ruled option 3 (owner, 2026-10-10).** The menu is grouped by page, in `pageOf`'s order — the site doc
first as "Every page" (a header or footer is on every page), then D5b's canvases, each page 2 straight after its page 1,
then any custom template by its file. Each row is the section's `LayerThumb`, the control's own name with the section
beside it, and every value with "now <the one in force>"; a heading is drawn as D6a's rail heading. Choosing a control
starts Label in Ghost at the control's name and Group in Ghost at the page's group — Home → Homepage, Post → Post, else
Site wide, the group Ghost shows everywhere — each until the user changes it. Above Promote, a box drawn as D6c's "What
ships" (`:303`) prints `THEME_WORDS.gets`: where in Ghost the setting appears (the frame's own "Ghost's Design panel", whose
groups are Site wide, Homepage and Post in both majors' admin source), what the site's owner sees (the name Ghost makes of
the key, a switch or a list, and its starting value), and what it changes (the control, its section, its page). "Your site's
owner" is the page's one name for that person (R-170); the chat's mock-up said "your customer". Promoting from the editor's
own panel, with an "In Ghost" tag, is Story 7.10's (on its card word for word, R-195).

### Site basics (Question 2, ruled option 1)

Three read-only rows from the linked site: `sites.title`, `site_settings.brand.logo` (through `imageUrl`), and
`brand.accent` (through `siteAccentOf`, drawn as a swatch with its hex), each drawn as D6a draws it (Question 2 ruled
"the drawing as drawn"; corrected at Review, 2026-10-10): the title in a locked field with D6a's "Change this in Ghost —
it appears in email too" under it, the logo in a locked field with the "from Ghost" chip and "Change this in Ghost ↗" to
`adminAt(url, 'settings')`, and the accent on a white field with its swatch and the chip. A missing value reads "Not set in Ghost". A project with no
linked site draws the group's heading and one caption — "Connect a Ghost site and its title, logo and accent appear
here." — with a link to Sites (UX-DR3: could-not-now, with its reason). The accent's caption is D6a's: it feeds
`--ghost-accent-color`, which the Style Pack maps to its accent role. Nothing is written (AD-10's P8: read, never write).

### Why no Schema phase — until Question 7

**Since Question 7 (option 2, owner, 2026-10-10) there is one:** `20261010120000_delete_custom_setting.sql` adds
`public.delete_custom_setting(p_project, p_setting)`, SECURITY INVOKER, which clears every condition naming the setting and
deletes it in one call, so a failure leaves both or neither. It changes no column, grant or trigger; the caller's RLS and
grants decide as the two PostgREST writes did. Applied to production through the pooler and read back before its Schema
push, which went alone, before `deleteSetting` calls it (R-99). The paragraph below is the Create's reasoning, kept as the
record of why there was none before.


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
Read in source at Dev, 2026-10-10 (Question 6): Ghost Admin's theme-settings panel in 6.58.0 (`design-and-theme-modal-
DWZguwWX.js`) and 5.130.6 (`admin-x-settings/modals-B5dtfzsB.mjs`) titles every setting `He(e.key)` / `io(e.key)` — the
key's words, through `mU` / `iR` — groups `homepage` and `post` under "Homepage" and "Post" and everything else under "Site
wide", draws a boolean as a switch and a select as a dropdown of its option strings, and reads no label.

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, signed in as yourself. The URLs
are **Pilot sections** (`b6d4db35-8e5e-45e1-a70f-4daa28916d51`) and **Ghost 6 Project**
(`21d868cf-1262-4ad2-9a44-091fbf653a04`); you ruled option 1 on both questions, so every step below applies. Step 4 puts
Posts per page back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Open the **⋯** menu at the top right and choose **Theme settings**. | — | The Theme settings page. **Posts per page** is the first row: a − 12 + stepper, a small `posts_per_page` chip, and "How many posts your archives show before paginating. Your theme owns this — Ghost has no setting for it." Further down, the This project and Clear dark overrides rows you tested in Story 5.6 sit flat on the page under a thin line — no white card or shadow around them, as the D6 drawing shows. |
| 2 | the same page | Theme settings | Press **+** once. | — | The stepper says "Saving…" for a moment, then reads **13**. Reload the page: still 13. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the **Three Up** post grid, open **Data** in the right-hand panel and look at **Count**. | — | Count is greyed at **13** and reads "This feed is sized by your theme's Posts per page. Change it in Theme settings." with a **Theme settings ↗** link. Click it: the Theme settings page opens. |
| 4 | the same page | Theme settings | Press **−** once. Then keep pressing **−** until it stops. | — | The first press puts it back to 12 and saves. The − goes pale and stops at **1** (each press is one step — holding does not repeat). The + stops at **100** the same way; the deployed walk checked that end, so you need not press 99 times. Press **+** eleven times to set it back to 12. |
| 5 | the same page | Theme settings | Look at the **Custom settings** card. | — | "Custom settings" with a chip reading **0 OF 17**, the sentence about Ghost's twenty and the three dark-mode built-ins, "Keys freeze once you deploy or export — pick them like you mean it.", and "Nothing promoted yet." |
| 6 | the same page | Promote a control | Under **Promote a control**, open **Which control** and read it. Then choose **Primary action** under the **Home** heading. Then type a new label and change **Group in Ghost** to **Site wide**, and press **Promote**. | Label: `Show the button` | The list is split by page — a small grey heading per page (**HOME**, and any other page your sections are on) — and each row shows a little picture of the section, the control's name in bold with the section's name (**Latest Post**) on the right, and under it its choices and the one it is set to now, e.g. "On · Off — now On". When you choose Primary action, **Label in Ghost** already says "Primary action", **Key** says `primary_action` in a grey box you cannot type into, **Group in Ghost** says **Homepage**, and a box above Promote headed **WHAT YOUR SITE'S OWNER WILL SEE** says "In Ghost's Design panel, under Homepage, your site's owner will see "Primary action", a switch set to On. It changes Primary action on Latest Post, on your Home page." (On or Off — whatever it is on your canvas now). As you type the label and change the group, the Key becomes `show_the_button` and the box follows: "…under Site wide, your site's owner will see "Show the button"…". Promote says "Promoting…", then a row appears: **Show the button** · Latest Post · Primary action → · `show_the_button` · boolean. The chip reads **1 OF 17**. |
| 7 | the same page | Promote a control | Choose **Headline size** under **Home** and press **Promote** without typing anything. | — | The label already reads "Headline size", the group **Homepage**, and the box "…your site's owner will see "Headline size", a list set to Large…" (whatever it is set to now). A second row: **Headline size** · `headline_size` · select. The chip reads **2 OF 17**. |
| 8 | the same page | Custom settings | On the **Show the button** row press **Edit**. Set **Only show when** to Headline size · is · Display, change **Group in Ghost** to **Post**, and press **Save**. | — | In the edit form, **Label in Ghost** and **Key** are grey and cannot be typed into, with the sentence "Ghost names a setting by its key, so its label is fixed once promoted. To rename one before you deploy, delete it and promote it again." After Save, the row still reads **Show the button** and a caption reads "Only when Headline size is Display". |
| 9 | the same page | Custom settings | Open **Which control** again. | — | **Primary action** and **Headline size** under Home are no longer in the list — they are already promoted. |
| 10 | the same page | Custom settings | Press **Delete** on **Headline size**. | — | A small window: "Delete Headline size?" with "Nothing is deployed yet, so nothing is lost." and "The “Only show when” on Show the button is removed too.", focus on **Cancel**. Press **Delete**: the row goes, and the "Only when…" caption on Show the button goes with it. Chip: **1 OF 17**. Delete Show the button too: **0 OF 17**, "Nothing promoted yet." |
| 11 | the same page | Theme settings | Look between Posts per page and This project. | — | **Site basics** with one line: "Connect a Ghost site and its title, logo and accent appear here." and a link to Sites — this project links no site. |
| 12 | `https://app.inflozo.com/projects/21d868cf-1262-4ad2-9a44-091fbf653a04/settings` | Theme settings | Look at **Site basics**. | — | Three rows, as the D6 drawing has them: **Site title** in a grey locked box with "Change this in Ghost — it appears in email too" under it; **Logo** in a grey locked box marked "from Ghost", with "Change this in Ghost ↗"; **Accent colour** in a white box with its swatch, marked "from Ghost". A value Ghost never gave reads "Not set in Ghost". The link opens that site's Ghost Admin settings in a new tab (it may ask you to sign in to Ghost). |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings`, in a second window | Theme settings, read-only | Open the project in a second window first (it shows read-only), then open its Theme settings there. | — | Every stepper, field, menu and button is greyed and does nothing; the values are readable. Close the second window. |

## Questions for the owner

Questions 1 and 2 were ruled option 1 (owner, 2026-10-09). Dev builds the Promote form for toggles and choice controls, and Site basics, as this spec describes them. Question 3 was raised at Dev and ruled option 1 the same day; it restates Story 3.9's Question 5. Questions 4 and 5 came from the owner looking at the deployed page after Dev, and Question 6 from Ghost's admin source read while answering them; all three were ruled in chat on 2026-10-10, before Review. Question 7 was raised at Review and ruled option 2 the same day: one save, through a database function pushed first.

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

**Ruled: option 1 (owner, 2026-10-09).**

### Question 4 — The Light only / Light + Dark block: flat like the drawing, or in its own card (raised by the owner, 2026-10-10)

**In plain English.**
- The owner asked whether Theme settings will be redrawn to the D6 drawing later. It is already the D6 build; what is
  missing belongs to other stories (Credits, Translations and the left menu, the text and picture promotions).
- One difference has no story: the This project / Clear dark overrides block sits in its own white card with a shadow,
  built that way when it was the only thing on the page. D6a draws it flat in the column, like everything around it.

**Example.** Today the block floats as a white card under Site basics; with option 1 it sits on the page under a thin line,
as Posts per page and Site basics do.

1. **Make it flat like D6a, inside Story 7.9** (a small change). **(RECOMMENDED)**
2. Leave it as a card.

**Ruled: option 1 (owner, 2026-10-10).**

### Question 5 — Making "Which control" easy to understand (raised by the owner, 2026-10-10)

**In plain English.**
- Each item in Which control read "section name · control name" and nothing else: not the page it is on, its choices, what
  it is set to now, or what the site's owner will see in Ghost. "Label in Ghost" started empty.

**Example.** A Three Up grid on Home and another on Tag read "Three Up · Columns" and "Three Up · Columns (2)".

- **A** — clearer list items: grouped by page, each with its section, its choices and its current value.
- **B** — a "What your site's owner will see" sentence under the form, with the label and group filled in for you.
- **C** — promote from the editor itself: a "Let my customer change this in Ghost" action on each toggle and choice in the
  right-hand panel, opening Theme settings already filled in, and an "In Ghost" tag on a promoted control.

1. A + B only, inside Story 7.9.
2. C only, inside Story 7.10.
3. **A + B now in Story 7.9, and C in Story 7.10.** Both stay in D6's look. **(RECOMMENDED)**
4. Leave it as drawn.

**Ruled: option 3 (owner, 2026-10-10).**

### Question 6 — How a setting's name works, now we know Ghost names a setting by its key (raised at Dev, 2026-10-10)

**In plain English.**
- Ghost has no separate "label" for a theme setting: it shows each setting under a name made from its key. Read in Ghost's
  own code, versions 5 and 6.
- The Edit form let you change "Label in Ghost" after promoting, but the key cannot change, so Ghost would never show the
  new name.

**Example.** The key `show_the_button` appears in Ghost Admin as "Show the button". Rename it to "Show the big button" in
Inflozo and Ghost still says "Show the button".

1. **Name it once.** What you type at Promote is exactly what Ghost shows; the key is made from it and shown read-only, as D6
   draws it; after Promote the name is fixed — to rename before your first deploy, delete it and promote it again. No
   database change. **(RECOMMENDED)**
2. **A separate list name.** Edit keeps a name field, renamed "Name in your list", that only changes Inflozo's list, with
   "Ghost shows: Show the button" beside it.
3. **Renamable until deploy.** The name and key change freely until the first deploy or export, then freeze. A database
   change pushed first (a Schema step) and more testing.

**Ruled: option 1 (owner, 2026-10-10).**

### Question 7 — Deleting a setting another one depends on: two quick saves, or one (raised at Review, 2026-10-10)

**In plain English.**
- When you delete a setting that another setting's "Only show when" names, Inflozo does two things: it removes that
  condition from the other setting, then deletes the one you chose.
- This story's rule says those two happen as ONE save, so they can never half-happen. Today they are two saves in a row:
  making them one needs a small addition to the database, which this story was told not to make without asking you.
- If the second save failed — a dropped connection at that exact moment — the condition would already be gone from the
  other setting while the one you chose stayed. You would see "We couldn't save that just now." and press Delete again.

**Example.** Show the button shows only when Headline size is Display. You delete Headline size. Today the condition on
Show the button is removed first, then Headline size is deleted. If the connection dropped between the two, Headline size
would still be there and Show the button would have lost its condition, which you would set again.

1. **Keep the two saves, condition first.** The worst case is one lost condition, set again by hand; the story's rule is
   reworded to say so. No database change. **(RECOMMENDED)**
2. **Make it one save.** A small database function deletes and clears together, pushed first on its own (a Schema step),
   then the page uses it, and the deployed walk runs again.

**Ruled: option 2 (owner, 2026-10-10).**

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

**Dev results (2026-10-09, Node 24.18.1).** The gates below were re-run by the orchestrator on the final tree. The mutation
controls are the implementation run's.

- **`pnpm check`** — exit 0: lint, the typecheck and every package's tests, `fail 0` in each of `library`, `ghost-shim`,
  `section-runtime`, `theme-compiler` and `apps/web`. This story's rows ran by name inside it: the rows in
  `custom-settings.test.ts`, the gscan rows in `gate/custom-settings.test.ts`, the rows in `settings.test.ts`, and
  the updated `controls.test.ts`, `data-group.test.ts` and `paywall.test.ts` rows.
- **Both pinned gscans (4.49.7 and 6.4.2), locally, through `runGscan`:**
  - The module's own output passes with no finding at all. Its control: with one `{{@custom.*}}` reader removed, gscan
    reports `GS100`.
  - Twenty settings pass, and a twenty-first is `GS010-PJ-CUST-THEME-TOTAL-SETTINGS`.
  - Each input the module refuses, emitted anyway, fails its own gscan code and no other.
  - A group outside Ghost's two is only a gscan recommendation.
  - A one-character condition key breaks gscan's own check (`:225`).
- **Controls (standing rule 2), from the implementation run.**
  - **Mutation runs.** Three breaks in the rules module and four in the app each turned their test red; each was restored
    afterwards.
  - **The weak assertion they exposed.** The before-the-write check read a missing call as "before". It now requires
    both calls to be present.
  - **The keyboard harness row.** The harness was made to pass the link deliberately, and the journey failed at that
    line (exit 1). The file was then restored.
- **`bash supabase/tests/run-rls-gate.sh`** — exit 0, unchanged; this story adds no SQL (R-99, no Schema phase).
- **`node --check tools/probe/run-verify-editor.cjs`** — exit 0. Step 52 is re-expected and step 104 is new. Both are
  written and syntax-checked, not run: the walk refuses a dirty tree and wants Vercel serving HEAD, so it runs at Review.
- **`pnpm keyboard`**, whole, on the final tree — exit 0, *"203 passed (9.8m)"*. The harness's no-link assertion ran
  inside `journey.spec.mjs:3848` ("5.19 · ⌘K places a second Three Up…"), which passed.
- **`python3 tools/doc-audit.py --check`**, twice — the second run PASS (the first regenerates the board).
- **Ghost 6.58.0, read in source** (`registry.npmjs.org/ghost/-/ghost-6.58.0.tgz`, extracted fresh in this session's
  scratchpad; read-only):
  - **The 100 limit.** `maxLimit` (`core/shared/max-limit-cap.js`, default 100) is applied in three places only:
    - by the HTTP API's middleware (`core/server/web/api/app.js:24`);
    - by the comments routes;
    - by `{{#get}}` (`core/frontend/helpers/get.js:202`).
  - **Archives are never capped.** `collection.js:31-48` takes a route's `limit:`, else `posts_per_page`, and no input
    validator under `core/server/api/endpoints/utils/validators/input/` reads `limit`.
  - **Result.** Posts per page's 100 is Inflozo's own ceiling, FR-H2's Count ceiling, and the stepper says so at its +
    end.
  - **The Admin address.** The admin bundle declares `{path:'settings'}`
    (`core/built/admin/assets/index-BOJzlYiz.js:67`), which `adminAt(url, 'settings')` targets.
- **Judgement call, recorded** *(superseded at Review by Question 7, ruled option 2: one save, `delete_custom_setting()`)*.
  `deleteSetting` is two ordered writes: the conditions naming the setting are cleared
  first, then the row is deleted. The matrix says "one transaction". A database transaction needs an RPC, which is a
  migration the spec rules out without a question. A failure between the two writes leaves the setting in place with its
  dependents' conditions already cleared. The customer sees "We couldn't save that just now." and can press Delete again.
- **Real services this phase hit (R-82):**
  - **registry.npmjs.org** — the Ghost 6.58.0 tarball, read.
  - **GitHub** — the Blocked push `78168785`, which carried the spec alone.
  - **Not touched, and why:**
    - **Supabase:** no migration, and the RLS gate ran on its local PostgreSQL 17 container. The production RLS session
      and the pooler's freeze check are Review's, on the owner's in-session go.
    - **Vercel:** nothing deploys before the Dev push. CI and READY are read at Review, and the deployed walk runs there.
    - **T1:** this story writes no theme and reads no Ghost.
    - **Resend and Dodo:** nothing here sends mail or touches billing.
    - **T3:** retired (R-238).

**Dev results (2026-10-10, the owner's rulings on Questions 4–6, Node 24.18.1).** Run on the final tree, in this order.

- **`pnpm check`** — exit 0: lint, the typecheck and every package's tests, `fail 0` in each (each runner prints its own count). The new rows ran by name: "Ghost names a setting by its
  key…", "Promote offers…" (rewritten), "each stored doc's page…", "what a menu row and…", "Question 4: …", and "every
  writer is…" with its Question 6 lines.
- **`pnpm keyboard`**, whole — exit 0, *"203 passed (10.1m)"*. The Kit's `Menu` changed for every menu in the app (a
  heading per `group`, each row inside a `Fragment`); no journey's menu moved.
- **Controls (standing rule 2), executed:** seven mutations, each restored byte for byte (the tree's diff hash identical
  before and after) — `ghostName` without its API/CTA/RSS raise, Home suggesting Site wide, the docs walked unsorted,
  `promoteControl` storing the posted label, `updateSetting` writing a label, the mode block given a shadow, and the box
  printing a switch's raw `false` — and each turned its test red; both files green again once restored.
- **Seen rendered, then removed:** a scratch harness page mounting `ThemeSettings` with stand-in controls, on
  `INFLOZO_HARNESS=1 next dev`, screenshotted at 1440 and 390 by the repo's Playwright: the flat mode block, Which control
  headed EVERY PAGE and HOME with each row's picture, name, section, values and "now …", the box's sentence following a
  typed label ("Article width" → `article_width`), and Edit's read-only label and key with their caption; at 390 the menu
  stays inside the 8px gutter and the page does not scroll sideways. The page was deleted and `next-env.d.ts` restored.
- **`node --check tools/probe/run-verify-editor.cjs`** — exit 0. Step 52 gains the flat-block reading; 104d gains Question
  5's two checks; 104e reads the key where it is now shown; 104g and 104j edit a group. Written and syntax-checked, not
  run: the walk wants Vercel serving HEAD, so it runs at Review.
- **`python3 tools/doc-audit.py --check`** — PASS after the board's regeneration.
- **Ghost, read in source** (`registry.npmjs.org/ghost/-/ghost-6.58.0.tgz` and `ghost-5.130.6.tgz`, extracted fresh in
  this session's scratchpad; read-only): Ghost Admin's theme-settings panel names every setting from its key alone (6.58.0
  `mU` in `index-BOJzlYiz.js`, used as `He(e.key)` in `design-and-theme-modal-DWZguwWX.js`; 5.130.6 `iR` in
  `admin-x-settings/index-BVxh86CD.mjs`, used as `io(e.key)` in `modals-B5dtfzsB.mjs`), groups under "Site wide",
  "Homepage" and "Post", draws a boolean as a switch and a select as a dropdown of its option strings; 6.58.0's modal is
  titled "Design", opened from Settings → "Design & branding".
- **Real services this pass hit (R-82):** registry.npmjs.org (the two tarballs, read). Not touched, and why: Supabase — no
  migration, and the RLS proofs are Review's on the owner's go; Vercel — nothing deploys before this push, and CI, READY and
  the deployed walk are Review's; T1 — nothing here writes a theme or reads a Ghost site (Ghost's own code was read
  instead); Resend and Dodo — nothing sends mail or bills; T3 — retired (R-238).

**The I/O matrix, row by row → the check that covers it.** Unit rows ran at Dev. The deployed walk's steps run at Review
and are syntax-checked now.

- **Posts per page saved:**
  - `settings.test.ts`, "every writer is…": the one column, written after the refusal.
  - The walk's 104a: + held mid-post shows "Saving…" with `aria-busy`, then 13 stored and read back.
  - The walk's 104c: the editor's Count greyed at 13.
- **Posts per page out of range:**
  - `custom-settings.test.ts`, "posts per page: a whole number…": 0, 101, `12.5`, `abc` and absent.
  - The walk's 104b: the spent steps are `type="button"` and `aria-disabled`; the hand-posts are refused and 50 stands;
    51 lands (the control).
- **The Count's second sentence:**
  - `controls.test.ts`, `data-group.test.ts` and `settings.test.ts`, "the Count's two sentences…".
  - `journey.spec.mjs` (keyboard gate): no link in the harness, with the bar's link as the selector's control.
  - The walk's 104c: the link opens Theme settings and never `/ghost/`.
- **Promote a toggle · Promote a choice:**
  - `custom-settings.test.ts`, "promote a toggle → boolean…".
  - `settings.test.ts`, "Promote offers…".
  - The walk's 104d: the stored rows field by field, the meter, and both controls leaving the list.
- **Label → key · reserved key:**
  - `custom-settings.test.ts`, "label → key…", "a reserved key is refused…" and, since Question 6, "Ghost names a setting
    by its key…" (`ghostName`, the round trip from a typed label).
  - `settings.test.ts`, "every writer is…": `promoteControl` never reads a posted key and stores `ghostName(key)`.
  - The walk's 104e: `show_tag_2` read in the read-only key box, "W" and "Color scheme", with no row inserted for either
    refusal; 104d's stored labels are `ghostName` of their keys.
- **The cap:**
  - `custom-settings.test.ts`, "the cap…".
  - `gate/custom-settings.test.ts`: 20 pass and 21 fail on both pins.
  - `settings.test.ts`: the derived 17 equals the trigger's, and `23514` is mapped.
  - The walk's 104h: 16 planted, the 17th lands, Promote greys with the sentence, and a forced post is refused with the
    count staying 17.
- **Group outside Ghost's two:**
  - `custom-settings.test.ts` (the group rule).
  - `gate/custom-settings.test.ts` ("only a gscan recommendation").
  - The Select offers the three groups alone (the walk's 104d).
- **Visibility set · its target deleted:**
  - `custom-settings.test.ts`, "visibility: …" (the NQL strings); the parse itself is gscan's own `@tryghost/nql`, in
    `gate/custom-settings.test.ts`, with a broken condition as its control.
  - `settings.test.ts`: conditions cleared before the delete.
  - The walk's 104f: the caption, `{key, value:'Display'}`, the confirm on Cancel, and afterwards the condition null with
    the caption gone.
- **Edit on a frozen row · Delete:**
  - `settings.test.ts`: no `key` and no `label` in the update, no posted label read, no `name="label"` in Edit; `42501`
    mapped; the two delete sentences; "Key frozen since".
  - The walk's 104g (frozen: no key or label input, Ghost's name shown, a group edit landing with key, label and stamp
    unchanged) and 104f (unfrozen); 104j replays a group edit.
- **Which control · What your site's owner will see (Question 5):**
  - `settings.test.ts`, "Promote offers…" (the order, the section, the page, the group, the picture's category), "each
    stored doc's page…" (`pageOf`) and "what a menu row and…" (`choicesOf`, `startOf`, `now`, `gets`).
  - The walk's 104d: the menu's headings equal the stored docs' pages in order, two rows read as the app derives them, and
    a chosen Headline size starts the label, key and group and prints `gets` in the box.
- **The mode block, flat (Question 4):**
  - `settings.test.ts`, "Question 4: …": the block's classes, and no card, shadow or padding of its own.
  - The walk's step 52: computed styles — a 1px rule above, no side border, no shadow, no fill — with the clear row's
    border as the control.
- **Select default outside its options · image default · colour not hex:**
  - `custom-settings.test.ts`, "Ghost's type rules…".
  - `gate/custom-settings.test.ts`: each fails its own code on both pins.
- **Read-only session (R-192):**
  - `settings.test.ts`, "R-192: the page reads along…".
  - The walk's 104i: a second context's lock, every control disabled, and forced posts change nothing.
- **Another user's project:**
  - The walk's 104j: A's four writes replayed under B's cookies, each refused with the sentence, A's data standing; under
    A's cookies, the control.
- **Scripts off:** not offered (Question 3, ruled option 1). No check runs with scripts off; step 104k was dropped.

**Review results (2026-10-10, Node 24.18.1), on the owner's in-session go for production (R-82).**

- **CI and Vercel at the Dev head `772080d3`:** run 38013771486 — `check`, `rls`, `deploy` success; Render matrix 38013771442
  success; `dpl_ExQ69LH6owi3wBVNuWxnkh94bkSd` READY from `772080d3` (and `c7e3d545`, `15b5a0be` each green and READY).
- **Production's schema is at least as new as the code (R-99)**, read through `SUPABASE_DB_POOLER_URL`: `custom_settings`
  carries every column the actions write; both enums hold Ghost's five types and three groups; `custom_settings_cap` and
  `custom_settings_key_frozen` are on the table; the `authenticated` update grant is `bound_to, default_value, group_name,
  label, options, position, updated_at, visibility_condition` — no `key`, no `frozen_at`; the cap function's source reads
  `>= 17`; `projects.posts_per_page` defaults to 12.
- **The floor, executed through an RLS session** (`generate_link` + `verifyOtp` over the publishable key, a throwaway
  `review-7-9-…@inflozo.com` account seeded by `seed-editor-project.mjs`, its own key reads in-process): the control first —
  an anonymous insert answers `401 42501`; seventeen inserts land; the eighteenth answers `400 23514` with "custom setting cap
  reached (17 user-defined + 3 reserved dark built-ins = Ghost's 20)" — the message `refusalOf` reads (second run); a `key`
  update answers `403 42501`, a `frozen_at` update `403 42501`; a `label` and `group_name` update lands (the control);
  `posts_per_page` 0 answers `23514` and 101 lands (the 100 is the app's alone — dismissed in § Review Findings). Through the
  pooler as the owner's script: `frozen_at` set once, then a `key` change on that row refused `42501` by
  `custom_settings_key_frozen`, un-freezing refused `42501`, a `label` change lands (the control). Every row deleted by the
  user, read back clean, the user deleted; the user count equal before and after (`0 FAIL, 21 PASS`, twice).
- **The deployed walk, run 1 on `772080d3`:** HARNESS ERROR at step 6's `openCard` (`page.waitForURL` timeout, a click's
  navigation), after 1266 PASS and 0 FAIL, with three `stall` notes — not a result (a harness death is re-run, never
  counted). It is re-run on the Review head once deployed, below.
- **The deployed walk, run 2 on the Review head `fff9a5a1`** (CI run 38019980656 `check`/`rls`/`deploy` success, matrix
  38019980675 success, `dpl_365CvTGFTDiPVYBiL1Y4HfhGAnu7` READY): `2 FAIL, 750 PASS`, the user count 14 → 14. Every new
  Review check passed — 104d's Only show when greyed then live, 104e's "Show tag 2", 104f's confirm line, 104i's Edit
  refused, 104l's Site basics as drawn. The two FAILs:
  - **104h** read the FIRST `aria-disabled` button in the Promote form for the greyed Promote, and this Review's own
    patch made the condition row's empty value box `aria-disabled` ahead of it (`greyed: ""`, the sentence and no submit
    otherwise as expected). The walk now picks the Promote by the reason it carries; the product is as intended.
  - **69b** (Story 5.17's stalled-sync Retry, code this story does not touch): Retrying shown (`gaveUp58: true`), then
    Synced not reached after Retry now (`unstuck58: false`). It passed in run 1 on the Dev head. Re-run below.
- **Runs 3, 4 and 5 on `d52974c5`** (the 104h selector fix; CI run 38022414545 `check`/`rls`/`deploy` success, matrix
  38022414458 success, `dpl_Hs6Ntbzx6djJfJSyDP7whW7rJZXo` READY). 69b passed in runs 3 and 4. All three died at the SAME line,
  104e's first promote (`run-verify-editor.cjs:7933`): runs 3 and 4 with `page.waitForResponse` 20 s and no Vercel request row
  for that POST in the next two and a half minutes (0 FAIL, 730 PASS each, before it); run 5, a diagnostic copy with the press
  instrumented, on `response.text()` — the answer arrived and its body was gone — after also losing step 66's ⌘S and four
  step-8 rows to syncs that did not land (those passed in runs 2, 3 and 4). A line dying twice is a signal, so it was sampled
  on production with probes replaying the walk's sequence on throwaway accounts (each deleted): 104d's two promotes and 104e's
  first, three rounds clean; the same after the walk's 104a–c preamble (a held post, the editor, the Count link, the
  hand-back, 104b's hand posts), three rounds clean; then seven promotes on one page, twice — the page logged one POST at
  04:54:28.192Z and Vercel's log has it arriving at 04:55:41.958Z with 762 ms of server time, and two answers were
  `net::ERR_ABORTED` after their 200 had arrived; every row was stored. `curl` POSTs from the same machine answered in
  0.35–0.40 s, twenty of twenty. **The hold is in the walk's browser, not the product: DW-352, owned by Story 15.1.**
- **104h's subject with the corrected selector**, as a probe on production (throwaway account, sixteen planted, the
  seventeenth promoted): `16 OF 17`, seventeen rows, no submit left, the greyed button reads "Promote" with the cap sentence —
  and the first `aria-disabled` button in the form is "Value: none", the condition row's empty value box, which is what run
  2's selector had read.
- **So every step-104 check has passed on production on this Review's app code at least once** — run 2 for all of them (104h's
  first by its probe), with the user count equal before and after every run. A clean single walk was not obtained today.

- **Ghost 5.130.6, read in source** (`registry.npmjs.org/ghost/-/ghost-5.130.6.tgz`, extracted fresh in this session's
  scratchpad; read-only): `core/frontend/services/routing/controllers/collection.js:31-48` sizes an archive by a route's
  `limit:` else `parseInt(posts_per_page)` when `> 0`, with no cap, and 5.130.6 has no `core/shared/max-limit-cap.js`; its
  admin declares `this.route("settings-x",{path:"/settings"})`, so `adminAt(url, 'settings')` holds on both majors.
- **`pnpm keyboard`**, whole, on the patched tree — exit 0, every journey passed (the runner prints its own count).
- **`pnpm check`** — exit 0 on the patched tree. **Controls (standing rule 2):** eight mutations — no cycle rule, the label
  checked before the key, no duplicate-label guard, no accent folding, the stored value in place of the in-force one, the
  cap read by another word, a switch's condition inverted, "page 2 page" — each turned its test red; the tree's diff hash
  identical before and after.

**Schema phase on Question 7's ruling (option 2, owner, 2026-10-10).**

- **`bash supabase/tests/run-rls-gate.sh`** — exit 0: the migrations and `SCHEMA.sql` build the same database, and Story
  7.9's block passes — one `delete_custom_setting`, SECURITY INVOKER; **a delete refused part-way (a trigger planted to
  refuse it, then removed) keeps the setting and its dependent's condition** — the transaction; the owner's delete removes
  the setting, nulls the condition naming it and keeps one naming another setting (the control against clearing too much);
  another tenant's setting answers false and stands, by its own project id and by the caller's; anon is refused `42501`.
- **Production, through `SUPABASE_DB_POOLER_URL`** (keys read in-process): no `delete_custom_setting` before; the file
  applied in one transaction; read back — one function, its body byte-identical to the file's, `prosecdef` false,
  `(p_project uuid, p_setting uuid) → boolean`; `authenticated` may execute it and `anon` may not.
- **PostgREST, as a throwaway user with RLS on:** the control first — anon's call answers `401 42501`; a setting that is not
  the caller's answers `false`; the user's call answers `true`, the setting is gone, the condition naming it is null and a
  condition naming another setting stands. The user deleted; the user count 14 → 14.
