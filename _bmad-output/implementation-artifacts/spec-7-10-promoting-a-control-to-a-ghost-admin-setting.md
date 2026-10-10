---
title: 'Story 7.10 — Promoting a control to a Ghost Admin setting'
type: 'feature'
created: '2026-10-10'
status: 'in-review'
baseline_commit: '48e32444b3659feec646961737c1d5854bbc7db5'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story you can hand a section's switch, choice, text or picture — or your Style Pack's accent colour — to your
site's owner: beside each one in the editor's right-hand panel a small "Let your site's owner change this in Ghost" button
opens Theme settings with the form already filled in, and once promoted the control carries an "In Ghost" tag. Promoted
text drops its bold, italic, underline and links while it stays in Ghost (you confirm that first, and they come back if you
delete the setting), clicking it shows a lock where its toolbar was, and Inflozo asks first before you delete or hide its
section, or switch Style Packs while your accent is in Ghost. Behind the scenes the theme Inflozo builds now carries every
promoted setting into Ghost's own Design panel and reads it on every page — proved by machine on the test Ghost in this
story, and on your own sites once the deploy wizard arrives in Story 7.18.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 7.9 built the form that turns a switch or a choice into a stored Ghost theme setting, and nothing reaches
a theme: `compileTheme` writes no `config.custom` and no template reads `{{@custom.*}}` (`compile.ts:222-224`). The rest
of FR-Q3 and FR-Q4 is unbuilt: a text prop, a picture and the accent cannot be promoted; the editor can neither start a
promotion nor show one; nothing warns before a delete, a hide, a shuffle or a pack switch changes what Ghost holds; and
DW-351's cap race can still put an eighteenth user setting into a theme.

**Approach:** One module decides everything about a promotion — what each control, text prop, picture and the accent
becomes in Ghost, the binding's shape, whether it is live, parked or dangling, and the words — and the compiler, Theme
settings and the editor read it. The compiler writes `config.custom` in the same change as every `{{@custom.*}}` that
reads it: a root attribute per promoted control, `{{@custom.key}}` in place of baked text, `{{img_url}}` for a picture,
and an inline block in `default.hbs` for the accent that the token block reads through `var()` (AD-30). It refuses a
dangling binding and an over-cap project, and is proved 0/0 on both pinned gscans and on T1. Theme settings gains the three
new kinds with D6c's confirm and the accent caution; the editor gains the promote action, the "In Ghost" tag, P0-1's lock
pill and the four warnings. **Written to the owner's rulings of 2026-10-10 on Questions 1–4** (§ Rulings this spec is
written to). No migration: `bound_to` is `jsonb`, and every type, check and grant this story needs exists since Story 1.2, so
there is no Schema phase (R-99).

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** The builder is `D6 Theme Settings Completed.dc.html` D6a's right column (`:139-235`), its colour row
  and pack-switch caption included (`:168-177`); the text-prop confirm is D6c (`:291-317`); the lock pill is
  `P0-1 Inline Text Toolbar.dc.html`'s plain-text-locked state (section `P0-1 plain-text-locked`) and `P0 Editor Primitives
  - Spec.md:183-187`. **No frame draws** the promote action or the "In Ghost" tag: they are extrapolated from
  `Editor Sidebar Kit.dc.html`'s 28px icon buttons, ink tooltips and mono chips and D6a's "from Ghost" chip (`:87`, `:98`).
  The delete/hide ask takes D5f's dialog shape (`D5 Canvas Markers and Template Switcher.dc.html` D5f); the pack-switch
  ask is R-134's sheet over `S7 Style Packs.dc.html` S7a. Nothing is drawn twice: the Kit's components, `dialog.ts`,
  `greyed.ts`, `CanvasNote` and `MoonBadge`'s slot are the parts.
- **One module.** Everything a promotion IS lives in `packages/section-runtime/src/custom-settings.ts`: the type each kind
  becomes, the binding shape (`control` · `prop` · `token`), a binding's state (live · parked · deleted · hidden ·
  changed), the start value, and every sentence the compiler throws. The compiler, Theme settings and the editor import
  it; no second copy of any rule (7.9's design).
- **The canvas decides the start (Question 1, ruled option 1).** The compile derives each setting's `type`, `options` and `default` from
  the design and the doc **in force** (`resolveControls`; a text prop's words; the pack's light accent) — never from the
  stored `default_value` or `options`, which stay the record of what was promoted. Theme settings prints the start the
  canvas holds and no longer edits it.
- **Formatting is out of force, never deleted.** A promoted rich text keeps its marks in the doc; while bound, the canvas,
  the panel and the theme read it as P0-1's plain-text lock (`RichText.plainText`, `marks.ts:28-31`), so deleting the
  setting brings the formatting back exactly as D6c promises ("Demote it later and the formatting comes back"). The
  binding is the one source of the lock; nothing writes `plainText` into a stored doc.
- **What Ghost keeps and forgets is said, not hidden (Question 2, ruled option 2).** Ghost keeps a setting's stored value
  at every redeploy and deletes it the moment a deploy leaves the key out (read in source, both majors — § Facts). The
  shuffle note and the delete confirm say so in § Words; the deploy wizard's Pre-flight warning is Story 7.18's, on its
  card word for word since the ruling.
- **AD-14.** Compile stays pure and byte-deterministic: the settings arrive as values (`CompileInput.settings`), emitted
  in `position` order, `custom` last in `config` and absent when nothing is live.
- **AD-36.** A key reaches `{{@custom.<key>}}` only after the module's shape check (`^[a-z][a-z0-9_]*$`, two or more
  characters, not reserved); an option label reaches a `{{#match}}` argument only when it carries none of `"` `'` `\` `{`
  `}` (otherwise the control is not offered and a stored binding to it is refused); every reader is a double-stash, never
  `{{{`; nothing a customer typed enters a helper argument.
- **AD-30 / AD-3.** The inline block in `default.hbs` sets one plain custom property from `{{@custom.*}}` and names no
  mode; `screen.css`'s token block stays the one file that does. A promoted control is still one root attribute, the
  stylesheet unchanged, and the dead-CSS strip keeps every value of it (`strip.ts`).
- **GS100 and GS090 by construction.** Every emitted key has a reader and every reader a key, asserted by the compile
  before it returns; a `{{#match}}` compares a select only with its emitted option labels; a visibility condition names
  only emitted keys of two or more characters. Both pinned gscans (4.49.7 at `v5`, 6.4.2 at `v6`) score the compiled
  theme 0/0.
- **The cap (DW-351).** The compile refuses a project with more than `USER_SETTING_CAP` user settings with
  `SETTING_WORDS.cap`, before anything renders.
- **R-98, R-192, R-170.** Every new control that starts work carries the Kit's busy label; in a read-only session every
  promote action is greyed and unfollowable (a disabled fieldset does not disable a link — 7.9's `<summary>` lesson) and
  every tag still reads; every new sentence is in § Words, one list, the person always "your site's owner".
- **Real infrastructure (R-82).** The theme is proved on T1 (6.58.0) on the owner's in-session go; the app on production at
  Review. Ghost 5's half waits for DW-326 (R-238).

**Ask First:**
- Questions 1–4 are ruled (owner, 2026-10-10: options 1, 2, 1 and 1); a change to any of them is a new question, not a
  Dev decision.
- Any change to `custom_settings`' columns, grants or triggers — none is planned; a need for one is a Schema phase and a
  question.
- Every T1 write (theme uploads, the probe picture, `PUT /custom_theme_settings/`) and every production write — the owner's
  go in the session that makes it, made in the main session, never through a subagent.

**Never:**
- No 7.11 work: no `color_scheme`, `dark_accent_color` or `dark_logo` emitted, no dark fallback chain, no `{{comments}}`
  change. No write to Ghost's own accent: the allowlist stays four (AD-10, `ghost-admin-rule.test.ts:69`).
- No promotion of a stepper or a swatch row (Ghost has no number type; colour promotion is the accent alone in v1), of a
  `url`, `date`, `icon` or `array` prop, of a prop carrying `tokens` (R-27 — Ghost would print the braces), or of a field
  inside a list.
- No re-bind control, no deploy surface (Story 7.18), no `frozen_at` write (Stories 7.18 and 7.26), no edit to the design
  export, no hand-edit of a generated file, no count written down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Promote from the panel | Latest Post selected; the action beside Headline size pressed | Theme settings opens at `/projects/<id>/settings?promote=<id>` with Which control on Headline size (Latest Post), Label "Headline size", Key `headline_size`, Group Homepage | an id not offered (already promoted, gone, another project's) opens the form on its first row, as 7.9 does; the param is compared, never parsed into markup |
| Promote a plain text prop | Latest Post · Headline (`text`) | a row `{type:'text', default_value:'<its words>', options:null, bound_to:{kind:'prop', instanceId, path:'headline'}}`; no confirm (nothing to strip) | a `tokens` prop, a `url`/`date`/`icon`/`array` prop or a list's field is never offered |
| Promote a rich text prop | Latest Post · Sub (`richtext`, one link) | D6c's confirm first, focus on Cancel: the line with its link and without, "The link is dropped; its words stay."; **Promote it** stores `type:'text'` with the words alone; the doc keeps the link | Cancel stores nothing; a POST without the acknowledgement is refused with `SETTING_WORDS.confirm` |
| Promote a picture | the fixture section's Picture (`image`) | a row `{type:'image', default_value:null, bound_to:{kind:'prop', …}}` | — |
| Promote the accent | the Style Pack card's action, then Promote | the caution first; **Promote it** stores `{type:'color', default_value:<pack light accent>, bound_to:{kind:'token', token:'accent'}}`; the row carries D6a's colour caption | a second accent row is never offered; a POST without the acknowledgement is refused |
| Bound text on the canvas | the promoted Sub clicked | no toolbar; in its place the lock pill "Sub — plain text, set in Ghost"; ⌘B/⌘I/⌘U/⌘K do nothing and nothing flashes; typing edits the words (the start); the link is not drawn | — |
| Demote | the Sub setting deleted in Theme settings | in the editor Sub's toolbar returns and its link is drawn again | — |
| Compile a switch | `primary-action` as `show_the_button`, canvas On | `custom.show_the_button = {type:'boolean', default:true}`; the root reads `data-primary-action="{{#match @custom.show_the_button true}}on{{else match @custom.show_the_button false}}off{{else}}on{{/match}}"` | — |
| Compile a choice | `headline-size` as `headline_size`, canvas Display | `options ["Medium","Large","Display"]`, `default "Display"`; the attribute is the same chain over the three labels, its `{{else}}` the start's value; every `[data-headline-size=…]` rule survives the strip | a label carrying `"` `'` `\` `{` `}`: not offered; a stored binding to it refused with `SETTING_WORDS.changed` |
| Compile text | Sub as `sub` | `{type:'text', default:'<words>'}`; every place the design prints `sub` reads `{{@custom.sub}}`; the element shows only while the value has words, else the prop's own empty behaviour (a catalog label's `{{t "…"}}`; otherwise left out — DW-349's rule) | — |
| Compile a picture | Picture as `picture` | `{type:'image'}`, no default; `src` reads `{{img_url @custom.picture}}` while set, else the section's own picture, or the element is left out when it has none | — |
| Compile the accent | the accent as `accent_colour`, pack light accent `#D96C3F` | `{type:'color', default:'#D96C3F'}`; `default.hbs`'s head carries `<style>:root{--setting-accent: {{@custom.accent_colour}};}</style>`; `screen.css`'s light block writes `var(--setting-accent, #D96C3F)` wherever it wrote the accent as itself; the dark blocks and the canvas's token block are byte-identical to today | — |
| Hidden by its condition | Ghost hides `show_the_button` (its condition false), so it renders as `null` | a switch or a choice draws its start (the `{{else}}`); a text is left out; a picture shows the section's own | — |
| Parked | Latest Post shuffled to a design without `primary-action` | no `custom` entry and no reader for it; a condition on another setting that names it is left off that setting; the editor notes it on the section and in `#editor-said`; Theme settings' row says so | shuffling back makes it live again (FR-D19 restores the value) |
| Section deleted | Latest Post, carrying a promoted control, deleted | the editor asks first (ONE dialog — the binding's sentence joins the site-wide or D5f ask when one fires); afterwards the row says so and the compile refuses with `SETTING_WORDS.deleted` | ⌘Z brings the section and the binding back |
| Section hidden | the same section hidden | the same ask; the row says so; the compile refuses with `SETTING_WORDS.hidden` | Show brings it back |
| Kind changed | a stored binding whose design control is no longer a switch or choice of the same type (a library update) | the compile refuses with `SETTING_WORDS.changed`; the row says so | — |
| Over the cap (DW-351) | eighteen user rows stored (two promotes in one instant) | the compile refuses with `SETTING_WORDS.cap` before rendering | — |
| A short condition key | a stored condition naming a one-character key | refused by `checkSetting` before rendering; 7.7's cascade is never reached | — |
| Pack switch, accent promoted | choose another pack | the ask first; **Keep** changes nothing; **Switch** switches; undo and redo never ask | accent not promoted: no ask, as today |
| The cap reached | seventeen rows | every promote action greyed with `SETTING_WORDS.cap` | — |
| Read-only (R-192) | another window holds the lock | every promote action greyed and not followed; tags still read | — |

</frozen-after-approval>

## Code Map

**The rules — `packages/section-runtime/src/custom-settings.ts` (215 lines, Story 7.9; re-exported `index.ts:172-177` and
`@inflozo/section-runtime/custom-settings`)**

- `PROMOTED_TYPE` `:41-43` (toggle → boolean, segmented/named-select → select, stepper/swatch-row → null) · `settingOf`
  `:131-138` (a select's options as `{value, label}`, its default a LABEL; null below two values or for duplicate labels) ·
  `checkSetting` `:154-195` (rule order: cap, key, label, taken, type, group, per type, visibility incl. `cycle`) ·
  `conditionValues` `:142-143` · `visibilityNql` `:147` · `ghostEntry` `:207-215` (one row as `config.custom` carries it;
  `site_wide` omits `group`) · `SETTING_WORDS` `:70-96` · `ghostName` `:109-110` · `keyRefusal` `:120-125`.
- `packages/library/src/vocabulary.ts` — `CONTROL_TYPES` `:169`, `valueWords` `:188-192`, `PROP_TYPES` `:235`
  (`text · richtext · url · image · icon · date · array`); `registry.ts` `PropDef` `:79-105` (`marks`, `tokens`,
  `catalog`, `maxChars`). The validator does not limit `valueLabels`' characters (`validate.ts:683-687`), hence the
  module's own refusal.

**The theme emitter — `packages/section-runtime/src/`**

- `core.ts` — `stampControls` `:1380-1406` writes `data-{name}` with a closed value on BOTH emitters (`:1790`) and throws
  on anything else (`:1401`); `applyProps` `:1225-1271` (theme: `users.put(path, v, 'text', def)` `:1262-1265`; the
  existing theme-only expression in place of text is a catalog prop's `{{t "key"}}` token `:1251-1255`); an image prop
  resolves through `input.assets` and lands as a baked attribute `:1338-1357`; `Tokens` `:255-306` (`put(expr)` with no
  role writes the expression in place — the `data-bind-attr` precedent `:925-932`); `bindExpr` `:497-503`, `srcsetExpr`
  `:518-522`, `wrapGuard` `:555-560`; `renderTheme` `:1935-1959`, `renderTree` `:1709-1870`.
- `marks.ts` — `RichText` `:32` with `plainText` (`:28-31`, "FR-Q3's lock"); `allowedMarks` `:190-195` returns `[]` for
  it; `serializeMarks` `:258-366` filters stored marks through that list (`:268-270`); `textOf` `:416` is private.
- `controls.ts` — `resolveControls` `:146-155`; `markupProps(entry.html)` (the props a design prints, used by `sidebar`
  `:509-516`); `switchControls` `:591` (FR-D19's park and restore; `parkedControls` in the doc, `doc-schema.ts:70`); a
  hidden instance is `hidden: true` (`doc-schema.ts:44`), skipped by the compile (`compile.ts:645`).
- `tokens.ts` — `packTokensCss` `:445-463` (the `ghostFonts` option `:449-451` is the theme-only precedent);
  `modeTokens` `:263-299`: the accent reaches `--accent` `:279`, and through `SCALES` the solid button fill `:108`, an
  outline's border and words `:126-127` and the accent link style `:137`; the tint `:121-122` and `--accent-on-contrast`
  `:285` are computed from it.
- Tests: `agreement.test.ts` (controls rows `:143-153`, `:1052-1072`; `:1054` holds the two root tags byte-equal) and
  `ad36.test.ts` (groups `(1) URL` · `(2) helper argument` · `(3) attribute name` · `(4) CSS colour`; the lock strips a
  link `:232-233`; control vectors `:472-511`).

**The compiler — `packages/theme-compiler/`**

- `src/compile.ts` — `CompileInput` `:63-102` (no settings field); `packageJson` `:225-248` (`config` = `posts_per_page`,
  `image_sizes`, `card_assets` `:241-244`; the placeholder comment `:222-224`); `compileTheme` `:600` — refusals then
  `pkg` `:616`, the per-instance `renderTheme` `:660-676`, `default.hbs`'s head `:778-800` (fonts `:787`, stylesheet
  `:788`, `MAIN_JS_TAG` `:790`, `{{ghost_head}}` last `:793`), `screen.css` `:805-814`, the strip's roots `:811`, the
  final checks `:855-867` (`checkTripleStashes` `:299-306`, `checkGhostMarkup` `:375-444`, `checkChromeText` — mustaches
  stripped before V1).
- `src/strip.ts` `:31-95` — `stripCss(css, root, roots)`; a name no root carries is never judged (`:85`), a rule is kept
  iff some root matches every attribute it wants (`:95`).
- `src/compile.test.ts` — helpers `:45-186`; pins this story must keep or move deliberately: `:486-513` (`package.json`'s
  text), `:516` (no `custom` without settings), `:663`/`:670` and `:812` (head adjacencies), `:817` (`default.hbs` names
  no mode).
- `gate/custom-settings.test.ts` `:31-112` (7.9: a hand-built theme from `ghostEntry` with one reader per key, both pins);
  `gate/verdict.ts` (`GS100` → `setting_unused` `:45`, `:87-98`; the visibility cascade `:112-136`); `gate/quality.ts`
  reads a block inside an attribute by its first branch (`:228-257`) and never judges a `<style>` element (`:91`).
- `tools/pilot-theme.mjs` `compilePilots` `:155-166`, `SCAFFOLD` `:114-117`; `tools/check-snapshots.mjs` gscan rows
  `:760-784`, `:1173-1183` (run by `pnpm test`).

**Theme settings — `apps/web/app/(app)/app/(authed)/projects/[id]/settings/` and `apps/web/lib/theme-settings.ts`**

- `page.tsx` `:47-89` — reads `params` only (no `searchParams`); `editorData(id)`, `custom_settings` by `SETTING_COLUMNS`
  ordered by `position`, the linked site.
- `theme-settings.tsx` — `ThemeSettings` `:72-118`; `Basic` `:209-221` (the "from Ghost" chip is a plain mono span
  `:215`); `AccentCaption` `:198-205`; `CustomSettings` `:225-259`; `SettingItem` `:263-292`; `EditForm` `:294-351`
  (Default drawn for boolean/select only `:331-344`); `DeleteForm` `:425-465`; `PromoteForm` `:498-572` (opens on
  `controls[0]` `:512`; posts `instance`/`control` `:523-525`; the box `:544-549`); the header comment `:48-51` lists this
  story's parts as absent.
- `actions.ts` — `promoteControl` `:186-233` (inserts `bound_to:{kind:'control', …}` `:220-226`), `updateSetting`
  `:238-272` (writes `default_value` `:255`, `:262`), `deleteSetting` `:278-290` (`delete_custom_setting()`); the doc
  write precedent is `clearProjectDarkOverrides` through `sync_project_doc()` (not needed here).
- `lib/theme-settings.ts` — `storedSchema` `:22-35`; `boundControl` `:51-54` ("7.10 adds `prop` and `token`");
  `Promotable` `:59-69`; `pageOf` `:80-92`; `placedControls` `:102-135` (stored, visible instances, in force);
  `startOf`/`choicesOf` `:138-142`; `promotable` `:145-151`; `boundLabels` `:154-159`; `THEME_WORDS` `:218-282`
  (`accentCaption` `:229`, `deleteBody`, `gets`, `defaultValue`).
- `apps/web/settings.test.ts` — matches source text in places (`:22-29` the cap trigger; `:152-153`; `:248-264` the
  actions' lines), so a rewrite moves those assertions deliberately.

**The editor — `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/` and `apps/web/components/`**

- `read.ts` `editorData` `:188-381` (`EditorData` `:100-186`) — reads no `custom_settings` today.
- `components/controls/sidebar.tsx` — `ControlField` `:149-238` builds the label row's `aside` (`MoonBadge` `:170`, the
  reset button `:171-181`); `field()` `:316-369`: `RichField` `:319-321` (no `aside` slot, `rich-field.tsx:129-132`),
  `ImagePicker` `:329-330` (no `aside` slot, `image-picker.tsx:15-79`), `TextInput` with `aside` `:353-365`; mounted at
  `editor.tsx:5809-5850` (`settingsHref` `:5849`, none in the harness).
- `components/controls/mark-toolbar.tsx` — `InlineTools` `:153-254` (null when no mark is allowed `:218`), `CanvasNote`
  `:258-271` (the lock pill); `lib/inline.ts` `allowed = allowedMarks(…)` `:96`, keys `:239-252`.
- `editor.tsx` — the lock pill for Ghost's words `:3788-3790`; `startEditing` `:3385-3459`; paint `:3154-3159`; `onRemove`
  `:4679-4690`; `onToggleHidden` `:4691-4701`; `askFirst` `:4629-4633` with its dialog `:5906-5970`; D5f's dialog
  `:5977-6015`; `onDesign` `:4517-4524` (every shuffle door); `choosePack` `:2472-2475`, `commitPack` `:1667-1677`,
  `savePack` `:2498-2507`, Remix `:4584-4609` (its own confirm `components/editor/remix-dice.tsx:207`); the Style Pack
  card `:5873` (`style-pack.tsx` `StylePackCard` `:73-110`).
- `lib/editor.ts` — `settingsPath` `:169`, `emptiesCustomTemplate` `:133-134`, `EMPTY_TEMPLATE_ASK` `:139-149`.
- `components/kit/` — `icons.tsx` `ExternalLink` `:448`, `Lock` `:471`; `moon-badge.tsx:10-14`; `labels.tsx` `CounterChip`
  `:30-34`; `greyed.ts` `ReadOnly` `:67-69`.
- The harness — `apps/web/app/(app)/app/harness/editor/layout.tsx` (fixture props typed against `EditorData`, switched by
  `x-inflozo-harness-*` headers); the only real ring is `packages/library/fixtures/controls/1..3` (design 1: `icons`
  toggle, `heading` richtext, `picture` image; design 3 has neither `icons` nor `picture`).
- Walks — `tools/keyboard/journey.spec.mjs` (harness, keyboard only); `tools/probe/run-verify-editor.cjs` (production;
  last step 104, next 105).

**Ghost and gscan, read in source this Create** — § Facts. The T1 recorder is `tools/probe/record-theme-assembly.py`
(MEASUREMENTS §77 is the last; this story's run is §78).

**Documents** — `epics.md:3410-3485` (this card), `:2886-2977` (Epic 7's preamble), `:3785` (Story 7.18), `:4602` (Story
9.1); `prd.md:362-365` (FR-Q2 – FR-Q5); `EXPERIENCE.md:174-175`, `:1836-1891`; `deferred-work.md:9502-9520` (DW-351);
DW-150 (A1's authored logo, Story 9.1).

## Tasks & Acceptance

**Execution:**

- [x] `packages/section-runtime/src/custom-settings.ts`, `custom-settings.test.ts` — add, beside 7.9's rules: the
  `Binding` type and `bindingOf(json)` (`control` {instanceId, controlKey} · `prop` {instanceId, path} · `token`
  {token:'accent'}; anything else null); `PROMOTED_PROP_TYPE` (text/richtext → text, image → image, the rest null) and
  `propSettingOf(def, value)` (null for a `tokens` prop; a text default is the words alone, `plainText(value)`; an image
  has none); `accentSettingOf(pack)` (`color`, the pack's light accent); `settingOf` refusing a label that carries `"` `'`
  `\` `{` `}`; `bindingState(binding, docs, entries, type)` → `live` (with the first holder in `pageOf`'s order) · `parked`
  · `deleted` · `hidden` · `changed`, over stored docs, page 2s included; `startOf(binding, …)` (the start the compile and
  the page print); `SETTING_WORDS` gains `deleted`, `hidden`, `changed`, `confirm` (§ Words). Tests: each kind's type and
  start, every refusal, each state, the label refusal.

  -- one module, so the compiler, the page and the editor cannot disagree about what a promotion is.
- [x] `packages/section-runtime/src/core.ts` — `RenderInput.promoted?` `{ controls: Record<name, {key, type, options, start}>,
  props: Record<path, key> }`, read by the THEME emitter only: after `stampControls`, a promoted control's root attribute
  becomes one role-less token — the `{{#match}}` chain of § What each kind becomes; a promoted text prop prints
  `{{@custom.key}}` wherever the design prints it, guarded so an empty value takes the prop's own empty behaviour; a
  promoted picture's `src` reads `{{img_url @custom.key}}` while set (and `srcsetExpr` of it only where the element carries
  `sizes`), else the section's own picture. The canvas ignores `promoted`. `agreement.test.ts` gains a row asserting both
  emitters agree but for the promoted attribute and text, each difference asserted positively; `ad36.test.ts` gains the
  hostile key, the hostile option label and a hostile text default (each inert or refused, the legitimate one working).

  -- AD-3's promoted form, `data-{control}="{{@custom.key}}"`, made real without touching the canvas.
- [x] `packages/section-runtime/src/tokens.ts` — `packTokensCss(pack, { ghostFonts, settingAccent })` and an exported
  `SETTING_ACCENT = '--setting-accent'`: with `settingAccent`, every light-block value the accent feeds (it moves with the accent — the review, 2026-10-10) that is, or contains, the light accent
  (compared without regard to case) reads `var(--setting-accent, <hex>)`; computed shades and the dark blocks are
  untouched; with no option the bytes are today's. Tests: the canvas call unchanged, the theme call's light values, the dark map identical.

  -- FR-Q3's runtime accent where the token block already writes it (AD-30).
- [x] `packages/theme-compiler/src/compile.ts`, `src/strip.ts`, `compile.test.ts`, `strip.test.ts` — `CompileInput.settings?`
  (each stored row's `key`, `type`, `group_name`, `visibility_condition`, `bound_to`, `position`); before rendering: the key
  rules, the cap (`SETTING_WORDS.cap`, DW-351), and `bindingState` — `deleted`/`hidden`/`changed` throw their sentences
  naming `ghostName(key)`, `parked` is left out; each live setting's entry is `ghostEntry` of the derived row, checked with
  `checkSetting` against the others, with a condition naming a parked key dropped; `promoted` handed to each holder's
  `renderTheme`; `config.custom` last in `config`, in `position` order, absent when empty; the accent's inline `<style>` in
  `default.hbs`'s head (its own element, not the fonts' `@font-face` one) and `packTokensCss(…, { settingAccent: true })`;
  the strip's roots read a promoted control as matching every value; a final assertion that the keys and the readers are the
  same set. `CompiledTheme` gains `custom: { emitted, parked }` (keys) for Story 7.18. Tests: the I/O matrix's compile rows,
  each refusal reached, determinism (one input, one byte string), and the pins listed in the Code Map kept or moved on
  purpose.

  -- the theme reads `{{@custom.*}}`, and `GS100` cannot fire because the declaration and the reader are one change.
- [x] `packages/theme-compiler/gate/custom-settings.test.ts` — a theme COMPILED by `compileTheme` (a switch, a choice with a
  condition, a plain text, a rich text, a picture and the accent promoted, plus a parked one) scores 0/0 on both pinned
  gscans and an empty `qualityGate`; the controls: one reader removed is `GS100`, a match against a label that is not an
  option is `GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH`, a condition naming the parked key is
  `GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-VALUE`.

  -- the claim executed on both checkers, each with a control that fails (standing rule 2).
- [x] `tools/pilot-theme.mjs`, `tools/check-snapshots.mjs` — a second pilot compile with settings (a4/13's `primary-action`
  and `headline-size`, its `sub`, a17/1's `title`, the accent) gated 0/0 on both gscans, an empty quality verdict, `cssFailures`
  sound and `themeFailures` clean; the existing pilot compile and every per-design snapshot unchanged.

  -- CI holds the real library with promotions on every commit.
- [x] `tools/probe/record-theme-assembly.py` — `SECTION = '78'`: the pilots compiled with the settings above plus one fixture
  ring section with `picture`, uploaded to T1; `GET /ghost/api/admin/custom_theme_settings/` lists each key at its start;
  a `PUT` per kind changes the page (the attribute, the words, `--setting-accent`, the picture — a probe PNG uploaded when
  T1 has none, 7.2's Question 4); a hidden condition draws the start; a redeploy with a new start keeps the stored value; a
  redeploy without one key loses it and the next brings it back at its start (the Question 1 and 2 facts, executed); Casper
  restored and read back. Written and checked locally at Dev; run in the main session on the owner's in-session go;
  MEASUREMENTS §78.

  -- standing rule 1: the Ghost behaviour this story's words rest on, executed on T1.
- [x] `apps/web/lib/theme-settings.ts`, `apps/web/settings.test.ts` — `placedControls` offers props (`propSettingOf`, a
  page's text, rich text and picture, never a list's field) and the accent (one row under a "Style Pack" heading, after the
  pages); `Promotable` gains `kind`, `path` and `id` (the `?promote=` value, built by one function from the binding);
  `boundControl` gives way to `bindingOf`; `promotable` and `boundLabels` read every kind; each row's state and start come
  from the module; `THEME_WORDS` gains § Words and loses `defaultValue`.

  -- the page offers what the card names, from the same rule the compiler uses.
- [x] `.../settings/page.tsx`, `theme-settings.tsx`, `actions.ts`, `loading.tsx` — the page reads `searchParams.promote`
  and the project's pack; `PromoteForm` opens on that row when offered; Promote on a rich text opens D6c's confirm and on the
  accent the caution (both `dialog.ts` sheets, focus on Cancel, **Promote it** busy while it posts); rows print their start
  and their state's caption, the accent row D6a's colour caption; `EditForm` keeps Group and Only show when and drops
  Default (Question 1); Site basics' accent caption and link as Question 3 rules; the frozen delete sentence as Question 2
  rules. `promoteControl` accepts the three new kinds (refusing a rich text or the accent without the posted
  acknowledgement), writes `bound_to` from `bindingOf`'s shape and the start at promotion; `updateSetting` writes no
  `default_value`. The skeleton keeps the page's shape.

  -- D6a's right column and D6c, completed.
- [x] `.../(editor)/read.ts`, `apps/web/app/(app)/app/harness/editor/layout.tsx` — `editorData` reads the project's
  `custom_settings` (`SETTING_COLUMNS`, `storedSettings`) as `settings`; the harness hands `[]`, and under
  `x-inflozo-harness-promoted: on` plants the fixture ring section's `icons`, `heading` and `picture` and the accent as
  promoted.

  -- the editor learns what is promoted; the keyboard walk can see it with no database.
- [x] `apps/web/components/controls/sidebar.tsx`, `rich-field.tsx`, `image-picker.tsx` — `RichField` and `ImagePicker` gain
  the `aside` slot the other Kit controls have; every promotable control or prop row carries, in that slot, either the
  promote action (an icon button with `ExternalLink`, named and titled from § Words, linking to the settings page with
  `?promote=`; greyed with `SETTING_WORDS.cap` at the cap) or the "In Ghost" tag (D6a's mono "from Ghost" chip, titled
  from § Words); a bound rich text's field is plain. `Sidebar` takes the project's settings path and the bindings.

  -- the owner's Question 5, option 3 (Story 7.9), word for word on this card.
- [x] `.../(editor)/editor.tsx`, `style-pack.tsx`, `apps/web/lib/editor.ts` — a bound text paints as its `plainText` lock (a
  render-time copy), its inline session allows no mark, and selecting it shows the lock pill in the toolbar's place;
  deleting or hiding a section that carries a binding asks first in one dialog (§ Words); a shuffle that parks a binding
  shows a `CanvasNote` on the section and says it in `#editor-said`; the Style Pack card carries the accent's action or tag;
  every door that switches the pack (a cell, a new pack, Remix with the pack) asks first while the accent is promoted, undo
  and redo never. Every action, tag and ask greys or holds in a read-only session.

  -- P0-1's plain-text lock and FR-Q3's four warnings.
- [x] `tools/keyboard/journey.spec.mjs` — 7.10 journeys on the harness with the promoted header: the action's `href` exact,
  the tag's name, the lock pill with ⌘B inert, the delete ask (Keep, then Delete and ⌘Z), the park note when `]` reaches
  design 3, the pack-switch ask (Keep, Switch, ⌘Z silent), and under `x-inflozo-harness-lock: reader` every action greyed;
  each behind its control.

  -- the editor half proved on every commit (`pnpm keyboard`).
- [x] `tools/probe/run-verify-editor.cjs` — step 105, written and syntax-checked at Dev, run at Review on production: the
  panel's action opens the form filled; a plain text, a rich text (D6c), the accent (caution) promoted and stored field by
  field; the tags; the lock pill and the link not drawn; the pack-switch ask; the delete and hide asks with the rows' states
  and ⌘Z; the rows' starts; a demote bringing the link back; the read-only window; every row deleted and the project read
  back clean.

  -- R-82: the stack, not only the wiring.
- [x] Propagation — `epics.md` (landed with the rulings at Create, 2026-10-10: this card's four notes; Story 7.18's card
  carries Question 2's Pre-flight sentence and Story 9.1's Question 4's hand test, each word for word; Epics 7 and 9's
  preambles list both, R-195 — Dev re-reads them and changes nothing unless the build moves a fact); `prd.md` FR-Q2 (the resurrect
  sentence) and FR-Q3 (what Ghost keeps and forgets; formatting out of force) with dates and sources; `epic-7-context.md`
  sub-bullets; `deferred-work.md` DW-351 → done; `docs/section-authoring.md` (how a promoted control, text and picture
  emit); MEASUREMENTS §78. End with a grep for "comes back" and "maps to its accent role" (standing rule 7).

  -- propagate, never localise (standing rule 3).

**Acceptance Criteria:**

- Given Theme settings, when a promotion of any kind is made, then the builder **matches the frame** — D6a's right column
  (`:139-235`), the accent row with D6a's colour caption (`:168-177`) — and a rich text's confirm **matches D6c**
  (`:291-317`): its title, its sentence, WHAT SHIPS before and after, its closing line, Cancel and **Promote it**.
- Given a promoted text, when it is selected on the canvas, then the selection shows, the toolbar does not, and the lock
  pill **matches P0-1's plain-text-locked state** — "{Setting} — plain text, set in Ghost"; ⌘B, ⌘I, ⌘U and ⌘K do nothing;
  typing edits its words; and when the setting is deleted, its formatting is drawn again.
- Given a placed toggle, choice, text, rich text or picture in the right-hand panel, or the accent on the Style Pack card,
  when the panel draws it, then it carries the promote action (named "Let your site's owner change {name} in Ghost") or,
  once promoted, the "In Ghost" tag — extrapolated from the Editor Sidebar Kit and D6a's "from Ghost" chip (R-74); and when
  the action is pressed, Theme settings opens with the form filled in for that exact control (Story 7.9's Question 5,
  option 3).
- Given a project with promoted settings, when it compiles, then `config.custom` carries every live user setting,
  cap-enforced, with its type, options, start, group and condition, and every key is read by `{{@custom.key}}` in the same
  theme; a parked setting is neither declared nor read; a dangling, changed or over-cap project is refused with the
  module's sentence before anything renders (FR-Q3, DW-351).
- Given the compiled theme, when both pinned gscans and `qualityGate` run over it, then each scores 0/0 / empty, and a
  removed reader, an unknown match value and a condition naming a parked key each fail their own code.
- Given a promoted accent, when the project compiles, then `default.hbs` carries the one inline block that sets
  `--setting-accent` from `{{@custom.*}}` and names no mode, `screen.css`'s token block reads it through `var()` with the
  pack's values as fallbacks, and the canvas's token block is byte-identical to today's (AD-30).
- Given a promoted control, when the stylesheet is stripped, then every one of its values survives (`stripCss`), and the
  root carries one attribute (AD-3).
- Given every new sink — a key in `{{@custom.*}}`, an option label in `{{#match}}`, a text start in `package.json` — when
  `ad36.test.ts` runs, then each is inert or refused beside a legitimate case that works (AD-36).
- Given a theme setting's key, when it is made or compiled, then it is at least two characters long, and every condition
  the compile writes names keys of two or more characters (from Story 7.7's Create).
- Given the canvas, when a promoted setting is drawn, then it is drawn at its start — the control's value, the words, the
  section's picture, the pack's accent — and in Dark the logo is Ghost's own and the accent the pack's dark accent, the
  values Story 7.11's built-ins resolve to while unset (FR-Q4).
- Given a section carrying a promoted setting, when it is deleted or hidden, then one dialog asks first, naming the
  settings; and when it is shuffled to a design that does not declare the bound control, then the note says Question 2's
  words and the setting is parked, not deleted.
- Given the accent is promoted, when the pack is switched from any door but undo and redo, then the ask comes first; and
  when the Style Pack card is drawn, it shows the accent as promoted.
- Given Ghost's comment colour, when Theme settings speaks of it, then it links to Ghost's own accent and never writes it,
  and `ADMIN_WRITES` is unchanged (`ghost-admin-rule.test.ts`).
- Given any new control that starts work, when it is pressed, then it carries the Kit's busy label (R-98, `busy.test.ts`);
  and given a read-only session, when the editor or Theme settings opens, then every promote action is greyed and does
  nothing, and every tag reads (R-192).
- Given T1, when the compiled theme with promotions is uploaded, then Ghost lists each setting at its start, a change in
  Ghost reaches the page, and the keep-and-forget facts hold as § Facts reads them (MEASUREMENTS §78).

### Review Findings (2026-10-10)

Five layers ran: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the real-infra verifier (CI,
Vercel, production's schema read-only, T1 read-only, signed-out routes), with the deployed editor walk run in the main
session on the owner's in-session go (R-82) — results under § Verification. Every finding was read in the code before it
was rated.

- [ ] [Review][Decision] The render matrix never ran on the Dev head: GitHub refused to start the job — "recent account
  payments have failed or your spending limit needs to be increased" — on this push and the two before it, and nothing
  re-ran it, while this push changes the shared runtime every design renders through. Put to the owner as **Question 5**
  [`.github/workflows/matrix.yml`, run 38058081445]
- [x] [Review][Patch] A promoted accent on a pack whose accent is also another of its colours — Mono, accent and text both
  `#000000` — handed the site's owner the body text, the contrast ground and the error colour too, because the light block
  was rewritten wherever the hex appeared; only the tokens the accent feeds follow it now [tokens.ts `packTokensCss`]
- [x] [Review][Patch] Remix parked a promoted setting without a word — the park note lived in `onDesign`, which Remix never
  passes; Remix's sentence and the section's note now say it [editor.tsx `remixed`]
- [x] [Review][Patch] The ↗ was drawn on a hidden section and on an untouched canvas, where Theme settings offers nothing,
  so the form opened on another control with no word; it is drawn only where the form offers it, and a promoted one's tag
  still reads [editor.tsx `promotion`, sidebar.tsx]
- [x] [Review][Patch] Placing a header or footer that replaces a site-wide section carrying a promoted setting deleted it
  without the ask; it asks first, in the same dialog [editor.tsx `onPlace`]
- [x] [Review][Patch] Keep in the pack-switch ask threw away a pack just made with New pack; Keep now keeps the new pack in
  the list and the pack in force as it was [editor.tsx `savePack`]
- [x] [Review][Patch] A refusal while D6c's confirm or the accent's caution was open was drawn behind the modal sheet; the
  sheet closes on any answer, so the sentence is seen [theme-settings.tsx `PromoteForm`]
- [x] [Review][Patch] Deleting or hiding one copy of a section whose other copy (page 1 or page 2) still carries the setting
  asked with a sentence that was not true; it asks only when no other visible copy keeps it [editor.tsx `promotedOn`]
- [x] [Review][Patch] A catalog text promoted into an attribute lost its translated fallback once emptied in Ghost, which
  the same text in an element keeps [core.ts `applyProps`]
- [x] [Review][Patch] A bound rich text with no value at all was handed to the editor unlocked, so its marks were offered
  [theme-settings.ts `locked`]
- [x] [Review][Patch] A visible section on a design the library no longer has was called "hidden"; it is "changed"
  [custom-settings.ts `bindingState`]
- [x] [Review][Patch] The "In Ghost" tag's explanation lived only in a `title`, which a screen reader, a keyboard and a touch
  never reach; it is read out beside the tag too [sidebar.tsx `InGhost`]
- [x] [Review][Patch] Nothing ran the lock's save path: typing into a locked text keeps its marks shifted and stores no
  `plainText`, the canvas and the panel save through `unlocked`, the sheet posts `confirmed`, and the editor reads the
  project's settings — each now held [settings.test.ts]
- [x] [Review][Patch] Keyboard journeys for what had none: ⌘U and ⌘K inert under the lock, the panel's rich field locked,
  the pack-switch ask from New pack and from Remix, Remix's park note, the site-wide ask's joined sentence, the replacement
  ask, and no ↗ on a hidden section [journey.spec.mjs]
- [x] [Review][Patch] Step 105 promoted no plain text on production, which its task names; 105 promotes Latest Post's
  headline (no confirm) and reads it stored [run-verify-editor.cjs]
- [x] [Review][Patch] §78's root-tag rows printed 110 characters of a multi-line tag — broken table cells, cut before the
  attribute each row tests — and its command line wrote a count by hand; the recorder prints the attribute it tests, the
  cells are put on one line, the count is gone [record-theme-assembly.py, MEASUREMENTS §78]
- [x] [Review][Patch] Comments that said something untrue: `matchChain` named a `promotedValue` that does not exist, and
  `namesOn` claimed the rows' order; the harness built a setting's label with its own regex instead of `ghostName`
  [custom-settings.ts, theme-settings.ts, harness layout.tsx]
- [x] [Review][Patch] Four words the build added were missing from § Words (R-170): the empty form's sentence, the ask's
  title, the "Style Pack" heading and the accent's row [spec § Words]
- [x] [Review][Defer] A promoted setting the compile refuses while Theme settings shows it as healthy, refused in the
  compile's own words — owner Story 7.18's Pre-flight [compile.ts `customSettings`] — deferred, DW-353
- [x] [Review][Defer] A promoted picture over a section's own picture asks for one size on either branch — owner Story
  7.29 [core.ts] — deferred, DW-354
- [x] [Review][Defer] `custom_settings.bound_to`'s column comment names two shapes — owner Story 7.18's Schema migration
  [complete_schema.sql, SCHEMA.sql] — deferred, DW-355

Dismissed, each read in the code: the page row's and the compile's sentences differ (§ Words gives each its own); "control"
in 7.9's sentences and the frozen delete's (§ Words and D6a's own "Promote a control"); a text's start not printed (§ Words:
"none for a text or a picture"); formatting lost by typing under the lock (executed: `replaceRange` over a locked value
shifts its marks and keeps them); `gate.test.ts`' 15-second wait; two `startOf`s in two modules; a failed settings read
drawing no tag (the documented safe side; Theme settings stays the truth); DW-351 closed (the spec rules the compile's
refusal its close); `--accent-on-contrast` following the accent where it IS the accent (the task's own rule); no picture
promoted on production (Question 4: no pilot takes one; proved on T1, §78); D5f's joined sentence unwalked (the site-wide
dialog's join is walked, and both pass `promoted` the same way).

## Spec Change Log

- **Dev, 2026-10-10 — a choice's `{{#match}}` branches take the three-argument form.** § What each kind becomes writes
  `{{#match @custom.k "Medium"}}`; the build writes `{{#match @custom.k "=" "Medium"}}`. Ghost's `match.js` reads `"="` as
  the same strict equality (its `default:` arm — read in source, 6.58.0 and 5.130.6, which differ by a comment), and gscan's
  `GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH` checks only a three-argument match
  (`lint-no-unknown-custom-theme-select-value-in-match.js`, `params.length === 3`, executed) — so the two-argument form
  would let the task's GS090 control pass vacuously. Behaviour is unchanged; Story 7.10's card carries the line.
- **Dev, 2026-10-10 — a control another greys follows its promoted controller in the theme.** No row covered it, and
  without it a4/13's secondary action would stand alone once the site's owner turned the promoted primary off in Ghost,
  breaking the design's own `disabledBy` ("A secondary action needs a primary beside it."). The theme writes the
  follower's attribute as the controller's `{{#match}}` chain, each leaf the follower's own value or chain (`core.ts`;
  `matchChain`'s `write`), a promoted follower keeping its reader where the canvas forces it; the strip keeps every value
  of a follower. Proved in `compile.test.ts` with its control (nothing promoted: baked as before); the pilot compile now
  ships it. Recorded in `docs/section-authoring.md`. Also: `gate.test.ts`'s leftover-directory check waits for a directory
  another test file has in flight to go, instead of comparing all of `os.tmpdir()` (it went red once under `pnpm check`;
  a planted leak still fails it).
- **Dev, 2026-10-10 — the matrix audit closed two rows at Dev.** *Section hidden*'s ask and *The cap reached* had no
  test that ran: `pnpm keyboard` gains the hide ask (Keep it, Hide section, Show asking nothing) behind its control, and
  the cap (every ↗ greyed with `SETTING_WORDS.cap`, in the panel and on the Style Pack card) under a new harness value,
  `x-inflozo-harness-promoted: full`, which stores the user's share of settings bound to no placed section.
- **Dev, 2026-10-10 — an emptied text is empty in two spellings** (T1, §78, read in source): Ghost's API answers `''` from
  its cache (`custom-theme-settings-service.js:153`) while its base model writes `null` (`setEmptyValuesToNull`,
  `core/server/models/base/plugins/data-manipulation.js:16-19`), which the next activation reads. `{{#if}}` reads both as
  empty, so the recorder's rows read "still empty"; its first two T1 runs were void on that row alone.
- **Dev, 2026-10-10 — the accent's inline block is guarded** `{{#if @custom.k}}…{{/if}}`: a colour its condition hides renders
  as `null`, and `--setting-accent: ;` would empty every `var()` reading it rather than fall back to the pack's hex.
- **Review, 2026-10-10.** Five layers; the findings and their dispositions are § Review Findings. Amended outside the
  frozen block: the tokens task's "every light-block value that is, or contains, the light accent" now reads **every value
  the accent feeds** — Mono's accent is also its text, and the literal rule handed the site's owner the body text and the
  contrast ground (`followAccent`: a token follows only when its value moves with the accent); the Remix door says a park as
  a shuffle does; the ↗ is drawn only where Theme settings offers the section (a visible instance of a stored doc), the
  tag where it is promoted; a site-wide placement that replaces a promoted section asks in the delete ask, and on page 2
  R-180's own ask then follows it (two asks, in that corner only); Keep in the pack-switch ask keeps a pack just made with
  New pack in the list, unworn; the delete or hide ask stays silent where another visible copy of the section (a page 1
  and its stored page 2) keeps the setting live; step 105 gains 105l (a plain text promoted on production). § Words gains
  the words the build added; §78's evidence cells and its upload count are corrected (MEASUREMENTS, formatting and a count
  only — the verdicts are the run's).

## Design Notes

### Rulings this spec is written to

All four were ruled by the owner on 2026-10-10, each the recommended option, so the spec stands as written; the rows each
ruling governs are named here.

| Question | Ruled (owner, 2026-10-10) | Rows it governs |
|---|---|---|
| 1 — where a promoted value starts | option 1: the canvas decides; Theme settings shows the start; Edit loses Default | Always · "The canvas decides"; the compile task; the Theme settings task (`EditForm`, `updateSetting`); owner's test step 3 |
| 2 — what Ghost forgets at a deploy | option 2: the words in § Words, and Story 7.18's Pre-flight warning | § Words rows *park note* and *frozen delete*; the propagation task's Story 7.18 line |
| 3 — the accent caption and the comments link | option 1: Site basics' accent row | the Theme settings task's Site basics clause; owner's test step 10 |
| 4 — pictures | option 1: built now, proved by machine; the hand test moves to Story 9.1 | the propagation task's Story 9.1 line; the owner's test note |

### What each kind becomes

| Promoted | Ghost type | Options · start (derived at compile, Question 1) | The theme reads |
|---|---|---|---|
| Toggle | `boolean` | start = the value in force (`on` → `true`) | `data-x="{{#match @custom.k true}}on{{else match @custom.k false}}off{{else}}<start>{{/match}}"` |
| Segmented / Named Select | `select` | options = `valueWords` labels (D6a: "Named values only"); start = the label in force | `data-x="{{#match @custom.k "Medium"}}medium{{else match @custom.k "Large"}}large{{else}}<start value>{{/match}}"` |
| Text prop (`text`, `richtext`) | `text` | start = the words in force, marks dropped | `{{#if @custom.k}}…{{@custom.k}}…{{else}}<the prop's own empty behaviour>{{/if}}` at every place the design prints it |
| Image prop | `image` | none — Ghost forbids an image default | `{{#if @custom.k}}{{img_url @custom.k}}{{else}}<the section's picture>{{/if}}`, or the element guarded when there is none |
| The accent | `color` | start = the pack's light accent (always `#rrggbb`, `tokens.ts:233`) | `<style>:root{--setting-accent: {{@custom.k}};}</style>` in `default.hbs`'s head; `var(--setting-accent, #hex)` in the light block |

The `{{else}}` is reached only when Ghost renders the setting as `null` — a condition hiding it (§ Facts). Ghost's `match`
is strict equality, so a boolean is compared with the literals `true` and `false`. The chain is Casper's and Source's own
shape (`{{#match …}}…{{else match …}}…{{else}}…{{/match}}` inside an attribute, `default.hbs:50` in Source). The text
guard is DW-349's rule (an emptied typed text is hidden), and "delete means delete": an owner who empties a promoted text
in Ghost removes it from the page.

### The binding and its states

`bound_to` is `{kind:'control', instanceId, controlKey}` (7.9), `{kind:'prop', instanceId, path}` or `{kind:'token',
token:'accent'}` — the schema's own `jsonb`, so no migration (the column comment's list predates the `prop` kind; the
module's `Binding` type is the one statement of it). A binding is **live** when some stored doc holds a visible instance
of that id whose design declares the control (`controlSchema`) or prints the prop (`markupProps`); **parked** when the
instance is there and visible but its design does not (a shuffle, FR-D19); **hidden** when every holder is hidden;
**deleted** when no stored doc holds it; **changed** when the kind it now derives differs from the stored `type` or its
labels are refused. The accent is always live. The start and the options come from the first live holder in `pageOf`'s
order. Theme settings, the editor and the compile ask the same function.

### The accent in the theme

The token block computes several tokens from the accent: the solid button fill is the accent itself (`tokens.ts:108`), an
outline's border and words use it where it reads (`:126-127`), the accent link style uses it (`:137`), while the tint
(`:121-122`) and `--accent-on-contrast` (`:285`) are new colours computed from it. With the accent promoted, the light
block writes `var(--setting-accent, #hex)` wherever its value is, or contains, the light accent, so buttons, links and
accent grounds follow the site owner's colour; the computed shades keep the pack's values — which is exactly why the
caution says contrast is in their hands. Dark is untouched until Story 7.11's dark built-in. Ghost validates a colour as
`#rrggbb` before storing it (`custom-theme-settings-service.js:127-133`), so the runtime value is a colour and the inline
block cannot carry anything else.

### Words (R-170: one list, in `lib/theme-settings.ts` and `custom-settings.ts`)

| Where | Words |
|---|---|
| Promote action (name and tooltip) | `Let your site's owner change ${name} in Ghost` |
| "In Ghost" tag (text · title) | `In Ghost` · `Your site's owner changes “${ghostName(key)}” in Ghost. Your canvas sets where it starts, on your first deploy.` |
| Lock pill (P0-1) | `${ghostName(key)} — plain text, set in Ghost` |
| D6c confirm | title `Promote “${label}” to Ghost?` · body `Ghost's own settings are plain text, so bold, italic, underline and links will be removed from this field while it stays promoted.` · box `WHAT SHIPS` · a link alone: `The link is dropped; its words stay.`, otherwise the marks named in that order, e.g. `The bold and the link are dropped; the words stay.` (none when the line carries none) · `Demote it later and the formatting comes back.` · `Cancel` · `Promote it` |
| Accent caution | title `Promote your accent to Ghost?` · body `Once this lives in Ghost Admin, contrast is in your hands. Inflozo checks your Style Pack's colours, never one your site's owner picks in Ghost.` · `Cancel` · `Promote it` |
| Accent row caption (D6a `:176`) | `This points at a Style Pack colour role. Switching packs changes what this setting is pointing at.` |
| Row start | `starts ${start}` for a switch, a choice and the accent; none for a text or a picture |
| Row: parked · hidden · deleted · changed | `Won't appear in Ghost while ${section} uses ${design}.` · `Its section is hidden. Show the section or delete this setting before your next deploy.` · `Its section is gone. Delete this setting, or bring the section back, before your next deploy.` · `${name} was promoted from a control that has changed. Delete it and promote it again.` |
| "What your site's owner will see" (7.9's `gets`) | the kind's word: `a switch` · `a list` · `a text box` · `an empty picture slot` (with `Until they choose one, your section shows its own picture.`) · `a colour`; the accent changes `your Style Pack's accent, on every page` |
| Delete or hide ask (one dialog) | `${names} ${is/are} promoted to Ghost from this section. Once it is ${deleted/hidden}, your next deploy stops until you delete ${it/them} in Theme settings or bring the section back.` |
| Park note (Question 2) | `${name} won't appear in Ghost while this design is in use.` and, once its key is frozen (deployed or exported), `Deploy before you switch back and Ghost forgets what your site's owner chose.` — 7.9's rule for the delete window's second sentence |
| Pack-switch ask | title `Switch to ${pack}?` · body `Your accent is a Ghost setting. Switching packs restyles your canvas, but once you have deployed, your live site keeps the accent Ghost holds until your site's owner changes it there.` · `Keep ${current}` · `Switch` |
| Frozen delete (Question 2, replaces 7.9's) | `Promote a control with the key ${key} again before your next deploy and the value your site's owner set in Ghost comes back. After that deploy, Ghost forgets it.` |
| Site basics' accent (Question 3, replaces `accentCaption`) | `Ghost's own comments and card buttons use this colour. Your Style Pack's accent is separate.` · `Change this in Ghost ↗` (`adminAt(url, 'settings')`) |
| Built at Dev, recorded at Review (R-170) | the delete-or-hide ask's title `Delete ${name}?` · `Hide ${name}?` and its buttons `Keep it` · `Delete section` · `Hide section`; Which control's heading for the accent `Style Pack` and its row `Accent`; the form with nothing left `Nothing on your canvases is left to promote.` (7.9's said "No switch or choice…") |
| Compile refusals (`SETTING_WORDS`) | deleted: `${name} is promoted from a section that is no longer on your site. Delete the setting in Theme settings, or bring the section back.` · hidden: `${name} is promoted from a hidden section. Show the section, or delete the setting in Theme settings.` · changed: as the row · confirm: `Confirm first — promoting this changes what your theme carries.` · cap: 7.9's |

### What the frames draw and what this story builds

| Surface | Frame | This story |
|---|---|---|
| Custom settings rows, Promote a control | D6a `:139-235` | the three new kinds, their rows and states; the accent row's caption `:176` |
| Text-prop confirm | D6c `:291-317` | built for a rich text (a plain `text` prop has no formatting to lose) |
| Lock pill | P0-1 plain-text-locked; P0 spec `:183-187` | built — the pill Story 5.3 made for Ghost's own words (R-122), naming the setting |
| Promote action, "In Ghost" tag | none — Editor Sidebar Kit (icon buttons, tooltips, chips) + D6a "from Ghost" | extrapolated (R-74), placed in each control's `aside` slot beside `MoonBadge` |
| Delete/hide ask · pack-switch ask | D5f · S7a + R-134's sheet | extrapolated in those shapes |
| Site basics' accent | D6a `:93-101` | the caption corrected and the link added (Question 3) |

### Readings told to the owner, one line each

- **Formatting while promoted** is out of force, not deleted: D6c's "Demote it later and the formatting comes back" is
  kept literally, and FR-Q3's "stripped" holds for what ships and what the canvas draws.
- **D6c's confirm is for rich text only**: a plain `text` prop cannot carry formatting, so promoting one has nothing to
  confirm.
- **Not promotable**: a prop carrying `tokens` (Ghost would print `{members}` as typed), links, dates, icons, lists and
  their fields; a control whose value labels carry a quote, a backslash or a brace.
- **A setting Ghost hides by its condition** draws the section's start; a hidden text is left out.
- **After a site's first deploy** Ghost keeps its stored value, so changing a promoted control on the canvas changes where a
  fresh install starts, not the live site; the "In Ghost" tag says so.
- **One story.** The editor half and the compile half are one user goal across layers (the scope standard keeps them
  together); the spec is long, as every spec here is.

### Facts this spec rests on (standing rule 1)

Read in source this Create — Ghost 6.58.0 and 5.130.6 from `registry.npmjs.org`, extracted fresh in this session's
scratchpad, read-only; gscan from the repo's own pins:

- **Ghost keeps a stored value and forgets a dropped key.** On activation `_syncRepositoryWithTheme` destroys a stored
  setting whose key is gone or whose type changed, resets a select whose value is no longer an option, keeps every other
  stored value, and seeds a new key from its default (6.58.0 `core/shared/custom-theme-settings-cache/custom-theme-settings-service.js:214-266`;
  5.130.6 `CustomThemeSettingsService.js:175-227`, the same logic — the files differ only by 6's added
  `copySettingsBetweenThemes`). Stored settings are per theme name, which Inflozo freezes per site (Story 7.24).
- **A setting a condition hides renders as `null`** (`HIDDEN_SETTING_VALUE`, `:14`, applied `:324-336`; 5.130.6 `:14`,
  `:291-294`).
- **`{{#match}}`** is byte-identical on both majors but a comment (`core/frontend/helpers/match.js`): two arguments compare
  with `===`; Casper and Source chain `{{else match}}` inside attributes on both majors.
- **Source's `default.hbs:20-25`** sets `--background-color: {{@custom.site_background_color}}` in an inline `<style>` —
  the shape AD-30 asks for.
- **Comments take Ghost's accent.** `{{comments}}` reads `@site.accent_color` (6.58.0 `helpers/comments.js:47-49`, the same
  lines in 5.130.6); `{{ghost_head}}` writes `--ghost-accent-color` (6.58.0 `helpers/ghost_head.js:468`, 5.130.6 `:345`). In
  this repo nothing but Ghost's vendored card CSS and the app's own previews reads `--ghost-accent-color`, so Site basics'
  "which your Style Pack maps to its accent role" is not true (Question 3).
- **gscan** (6.4.2 and 4.49.7, `010-package-json.js:215-232` / `:223-229`): a condition may name only declared keys
  (`GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-VALUE`); `specs/v4.js` — `GS090-NO-UNKNOWN-CUSTOM-THEME-SETTINGS` (a reader with no
  key) and `GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH` (a match value not among a select's options) are errors,
  as `GS100` is; `GS090-NO-IMG-URL-IN-CONDITIONALS` warns only on `img_url` as an `{{#if}}` argument, which nothing emits.

Hypotheses, executed at Dev on T1 (§78): every row of § What each kind becomes renders as written, and the keep/forget
facts above hold on a real upload. Nothing of Ghost 5 is executed (R-238, DW-326).

## Owner's manual test

Do this on the real site after Deploy confirms the build, on a laptop at full width, signed in as yourself. The projects are
**Pilot sections** (`b6d4db35-8e5e-45e1-a70f-4daa28916d51`) and **Ghost 6 Project** (`21d868cf-1262-4ad2-9a44-091fbf653a04`);
Deploy confirms both addresses. Written to your rulings of 2026-10-10. **Not in this test, and why:** moving a promoted
control by shuffling (every section has one design until Epic 9 — the keyboard walk proves it on a test ring), a picture
(its hand test moved to Story 9.1 by your ruling on Question 4), and the theme reaching Ghost (no deploy until Story 7.18 —
the test Ghost proves it).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click **Latest Post**. In the right-hand panel find **Headline size**; beside its name is a small ↗ button. Hover it, then click it. | — | The hover reads "Let your site's owner change Headline size in Ghost". Clicking opens **Theme settings** with **Promote a control** already on Headline size (Latest Post): Label "Headline size", Key `headline_size`, Group **Homepage**, and the box saying what your site's owner will see. |
| 2 | the same page | Theme settings | Press **Promote**, then the back arrow to the editor, and click **Latest Post** again. | — | A row **Headline size · Latest Post · Headline size → headline_size · select**, "starts Large" (or whatever it is set to). In the editor, Headline size shows a small grey **In Ghost** tag where the ↗ was; hovering it reads "Your site's owner changes “Headline size” in Ghost. Your canvas sets where it starts, on your first deploy." |
| 3 | the same editor | Editor, Home | Set Headline size to **Display**, then open Theme settings from the **⋯** menu. | — | The Headline size row now says "starts Display". Its **Edit** shows Group and Only show when, and no Default list. |
| 4 | the same editor | Editor, Home | In Latest Post's line under the headline, select the word **Thursday**, press **⌘K**, type the address and press **Enter**. Then in the panel's **Content** group press the ↗ beside **Sub**, and on Theme settings press **Promote**. | `https://example.com` | Thursday is underlined as a link. On Promote a window asks **Promote “Sub” to Ghost?** with D6c's sentence, a **WHAT SHIPS** box showing the line with Thursday linked and then without, "The link is dropped; its words stay.", "Demote it later and the formatting comes back.", with focus on **Cancel**. Press **Promote it**: a row **Sub · text**. |
| 5 | the editor | Editor, Home | Click the Sub line. Press **⌘B**. Type a word at the end. | ` again` | No formatting toolbar; in its place a pill with a lock: "Sub — plain text, set in Ghost". ⌘B does nothing and nothing flashes. Thursday is no longer drawn as a link. The typed word saves. |
| 6 | the editor | Editor, Home | Press **Esc** until nothing is selected. On the **Style Pack** card press its ↗, then on Theme settings press **Promote**. | — | Theme settings opens on **Accent** under a **Style Pack** heading, Label "Accent colour", Group **Site wide**. Promote opens a window: "Promote your accent to Ghost?" — "Once this lives in Ghost Admin, contrast is in your hands…". Press **Promote it**: a row **Accent colour · colour · starts #…**, with a yellow note: "This points at a Style Pack colour role. Switching packs changes what this setting is pointing at." |
| 7 | the editor | Editor, Home | Look at the Style Pack card, press **Change**, and choose a different pack. Press **Keep …**. Choose it again and press **Switch**. Then press **⌘Z**. | — | The card shows **In Ghost** for the accent. Choosing a pack asks "Switch to {pack}?" with the sentence about your live site keeping Ghost's accent; Keep changes nothing; Switch switches; ⌘Z switches back without asking. |
| 8 | the editor | Layers | On **Latest Post**, open **⋯** and choose **Delete**. Press **Keep it**. Do it again and press **Delete section**. Open Theme settings. Come back and press **⌘Z**. | — | One window: "Headline size and Sub are promoted to Ghost from this section. Once it is deleted, your next deploy stops until you delete them in Theme settings or bring the section back." Keep it changes nothing. After deleting, both rows say "Its section is gone. …". ⌘Z brings Latest Post back and the rows' notes go. |
| 9 | the editor | Layers | On Latest Post choose **Hide**, then **Show** again. | — | The same window with "hidden"; while hidden the two rows say "Its section is hidden. …"; after Show they are normal. |
| 10 | `https://app.inflozo.com/projects/21d868cf-1262-4ad2-9a44-091fbf653a04/settings` | Theme settings | Look at **Site basics** → **Accent colour**. | — | Under it: "Ghost's own comments and card buttons use this colour. Your Style Pack's accent is separate." and **Change this in Ghost ↗**, which opens that site's Ghost Admin settings in a new tab. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings` | Theme settings | Delete **Sub**, **Headline size** and **Accent colour** (each asks first; nothing is deployed, so nothing is lost). Go back to the editor and click the Sub line. | — | The toolbar is back and **Thursday is a link again** — the formatting came back. Headline size and the Style Pack card show their ↗ buttons again. |
| 12 | the editor, in a second window | Editor, read-only | Open the project in a second window (it shows read-only) and select Latest Post. | — | Every ↗ is greyed and does nothing. Close the second window. |

## Questions for the owner

All four were raised at this story's Create and ruled by the owner in chat on 2026-10-10, each the recommended option
(1, 2, 1 and 1). The spec is written to those rulings (§ Rulings this spec is written to); Story 7.18's and Story 9.1's
cards and Epics 7 and 9's preambles carry the two moved requirements word for word (R-195).
Question 5 was raised at Review and is open.

### Question 1 — Where a promoted control's starting value is set

**In plain English.**
- When you promote a control, your theme ships a starting value for it. Ghost uses that starting value on your first
  deploy; from then on it keeps whatever is stored — what your site's owner picks.
- Story 7.9's **Edit** lets you change that starting value in Theme settings, separately from your canvas. But the plan
  for this story says the canvas holds it ("editing the text edits the Ghost setting", P0-1), and that switching Style Packs
  changes the accent's starting value. Left as it is, one setting would have two starting values.

**Example.** You promote **Headline size** while it is Large. Later you set the canvas to Display, while Theme settings'
Edit still says Large. Which one does your theme ship?

1. **The canvas decides.** What your section shows is the starting value. Theme settings prints it on each row ("starts
   Display"), and Edit keeps Group and Only show when without its Default list. **(RECOMMENDED)**
2. **Both places, one value.** Theme settings' Default moves the control on your canvas too; text and the accent stay
   canvas-only.
3. **Theme settings decides.** While promoted, the control greys in the right-hand panel ("its starting value is set in
   Theme settings"), and the canvas shows Theme settings' value; promoted text is then edited in Theme settings, not on the
   canvas.

**Ruled: option 1 (owner, 2026-10-10).**

### Question 2 — Ghost forgets a setting's value when a deploy leaves it out

**In plain English.**
- Read in Ghost's own code, versions 5 and 6: when a deploy leaves a setting out of the theme, Ghost deletes the value
  your site's owner stored for it. Bringing the setting back later starts it again from its starting value.
- Two places in the plan assume otherwise. This story's shuffle note was to say only "this Ghost setting won't appear while
  this design is in use", and not threaten loss — but a deploy while it is parked does lose the owner's choice. And Story
  7.9's delete window says promoting the same key again brings the owner's value back — true only until your next deploy.

**Example.** Your site's owner sets "Show the button" to Off. You shuffle Latest Post to a design with no button and deploy,
then shuffle back and deploy again: "Show the button" returns On, its starting value — not Off.

1. **Say it plainly where you act.** The shuffle note: "Show the button won't appear in Ghost while this design is in use.
   Deploy before you switch back and Ghost forgets what your site's owner chose." The delete window: "…comes back if you
   promote it again before your next deploy. After that deploy, Ghost forgets it."
2. **Option 1, and the deploy wizard warns too.** Story 7.18's Pre-flight names any setting already deployed that this
   deploy would drop, and says Ghost will forget its value — added to its card word for word. **(RECOMMENDED)**
3. **Keep the plan's words** as they are.

**Ruled: option 2 (owner, 2026-10-10).**

### Question 3 — Site basics' accent sentence is wrong, and where the "comments" link goes

**In plain English.**
- Under Site basics' **Accent colour**, Theme settings says it "Feeds --ghost-accent-color, which your Style Pack maps to
  its accent role." The second half is not true: no Style Pack reads Ghost's accent. Ghost's accent colours Ghost's own
  parts — its comments and its card buttons. It is corrected in every option below.
- This story must also say plainly that comments take their colour from Ghost's accent, with a direct link to it.

**Example.** Today: "Feeds --ghost-accent-color, which your Style Pack maps to its accent role." With option 1: "Ghost's own
comments and card buttons use this colour. Your Style Pack's accent is separate." and **Change this in Ghost ↗** under it,
as the logo row has.

1. **In Site basics' accent row**, which is Ghost's accent: the corrected sentence names comments, with the link under it.
   **(RECOMMENDED)**
2. **Beside your promoted accent in Custom settings** (shown once the accent is promoted), with Site basics' sentence
   corrected but no link there.
3. **Both places.**

**Ruled: option 1 (owner, 2026-10-10).**

### Question 4 — Pictures: no design on your projects takes one yet

**In plain English.**
- This story lets you promote a picture field, so your site's owner can replace the picture in Ghost.
- None of the five pilot sections on your projects has a picture you choose: each takes its pictures from Ghost (post
  images, the site logo). The first one arrives with Story 9.1 — a header's own logo (DW-150, R-240).
- So you cannot try it on the live site in this story. The machine can: a test theme on the test Ghost with a picture
  setting, changed through Ghost.

**Example.** In Story 9.1 you place a header with its own logo; with option 1 its picture field already has the ↗ button,
and promoting it gives your site's owner a "Logo" picture under Design in Ghost.

1. **Build it now, proved by machine; your hand test of it moves word for word to Story 9.1.** **(RECOMMENDED)**
2. **Move picture promotion itself to Story 9.1**, word for word.

**Ruled: option 1 (owner, 2026-10-10).**

### Question 5 — GitHub did not run the picture check of every section on this story's code (raised at Review, 2026-10-10)

**In plain English.**
- Every push runs an automatic check that photographs every section design and compares it with its approved picture
  (the "render matrix"). It is the check that would catch this story changing how any section looks.
- On this story's three pushes GitHub refused to start that check. The reason GitHub gives is: "The job was not started
  because recent account payments have failed or your spending limit needs to be increased." The same refusal hit the
  main check's first try on the Dev push, which you re-ran by hand; the picture check was never re-run.
- This story changes code every section is drawn with, so the picture check matters here. It does not stop the site
  deploying (R-116), so the live site is unaffected meanwhile.

**Example.** If the change to the colour block had moved one section's colours, the picture check would have shown it
red, with the before-and-after pictures. Today nothing has looked.

1. **Fix the payment in GitHub's Billing & plans, then press "Re-run all jobs" on the Render matrix run for this story's
   Review push** (I will give you the link at Deploy). It compares every design against its picture. **(RECOMMENDED)**
2. Fix the payment and let tonight's automatic full run (03:00 IST) check it instead — one day later, same coverage.
3. Leave it for now and go on without the picture check on this story.

**Ruled:** _(awaiting the owner)_

## Verification

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package's tests green — `custom-settings.test.ts`, `compile.test.ts`,
  `strip.test.ts`, `agreement.test.ts`, `ad36.test.ts`, `gate/custom-settings.test.ts` (both pins), `quality.test.ts`,
  `settings.test.ts`, `busy.test.ts`, `ghost-admin-rule.test.ts` (unchanged) — and `tools/check-snapshots.mjs`' new pilot
  rows; each runner prints its own count.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green.
- `bash supabase/tests/run-rls-gate.sh` -- expected: passes unchanged (no SQL in this story).
- `pnpm keyboard` -- expected: green, the 7.10 journeys included.
- `node --check tools/probe/run-verify-editor.cjs` and `python3 tools/probe/record-theme-assembly.py`'s local half (read its
  docstring first — a recorder's `--help` runs a real upload) -- expected: syntax clean; the local gate 0/0 on both gscans.

**Real infrastructure (R-82):**
- **T1** (Dev, main session, the owner's in-session go): §78 as the recorder task states — every key listed at its start, a
  change per kind reaching the page, the hidden condition, the keep and forget facts, Casper restored and read back.
- **Production** (Review, the owner's in-session go): CI `check`/`rls`/`deploy` and `matrix` green and Vercel READY at the
  Dev head; step 105 of the deployed walk, its user count equal before and after; then the owner's manual test.
- **Not touched, and why:** Resend and Dodo (nothing mails or bills); Supabase gets no migration (the RLS gate runs locally;
  production is touched by the walk's own writes); T3 is retired (R-238).

**Manual checks (if no CLI):**
- D6a `:139-235` and D6c `:291-317` beside the deployed page at 1440; P0-1's plain-text-locked frame beside the canvas pill.

**Results (Dev, 2026-10-10, main session, Node 24):**
- `pnpm check` — green over the final tree: lint, typecheck and every package's tests, the 7.10 rows in
  `custom-settings.test.ts`, `agreement.test.ts`, `ad36.test.ts`, `tokens.test.ts`, `compile.test.ts` (the follower row
  with its nothing-promoted control), `strip.test.ts`, `gate/custom-settings.test.ts` (both pins, each control failing
  its own code), `settings.test.ts`, `busy.test.ts` and `ghost-admin-rule.test.ts` unchanged; `check-snapshots` PASS with
  the promoted pilot rows (0/0 on 4.49.7 and 6.4.2, each with its GS100 control, quality empty, the strip sound with its
  control) and every per-design snapshot unchanged. `gate.test.ts`' leftover check now waits out another file's run in
  flight; a planted leak (the gate's `rm` removed) still fails it.
- `pnpm keyboard` — the full gate green; after the hide and cap journeys were added, every 7.10 journey and 6.2's re-run
  green.
- `node --check tools/probe/run-verify-editor.cjs` — clean (step 105 runs at Review).
- The recorder's local half — the pilots, the four promoted trees and both paywall probes 0/0 on both pinned gscans, the
  pilots' quality verdict empty; the start tree's secondary action reads the primary's setting.
- `bash supabase/tests/run-rls-gate.sh` — passed unchanged (run by the Dev subagent; this story touches no SQL).

**Real services this story hit at Dev (R-82):**
- **T1** `ghost6.inflozo.com` (6.58.0), on the owner's in-session go (2026-10-10), keys read by `shim.load_env()` as
  `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN` and `GHOST6_CONTENT_API_KEY`: `python3 tools/probe/record-theme-assembly.py`,
  three runs. Runs 1 and 2 were void on one recorder row each (an emptied text's spelling, change log) and wrote nothing;
  run 3 held every row and wrote **MEASUREMENTS §78**. Admin `themes/upload/` and `themes/<name>/activate/` answered 200
  for each upload; `GET custom_theme_settings/` listed every key at its start (`show_the_button` true, `headline_size`
  Large, `sub` and `title` their words, `accent_colour` `#D96C3F`, `picture` null); `PUT custom_theme_settings/` per kind
  reached `/` (the root `medium`, both texts, `--setting-accent` `#1A2B3C`, the picture); the primary off hid Headline
  size in Ghost and the root drew `large` while Ghost stored Medium (the control), and the secondary action went off with
  it; Sub emptied left the page; the `restarted` deploy kept Medium under its new default Display; the `without_sub`
  deploy dropped Sub and the next brought it back at its start. Every earlier §70–§77 row re-ran and held. The probe
  theme's stored settings were cleared (`[]`), Casper re-activated and read back, every probe theme deleted (installed
  now: casper, racer, source). No new picture uploaded — this month's `/content/images/2026/10/inflozo-probe-rendition.png`
  was reused.
- **Not touched at Dev, and why:** Supabase production and Vercel (the Dev push deploys through CI; Review reads both and
  runs step 105 on production, R-82); Resend and Dodo (nothing mails or bills); T3 (retired, R-238 — the Ghost 5 half is
  DW-326's).

**The matrix rows whose only run is Review's** (Theme settings has no harness, so each is a step 105 read on production,
with the source-level rows in `settings.test.ts` meanwhile): D6c's confirm opening on Cancel and Cancel storing nothing
(105d); the accent caution (105f); an id `?promote=` does not offer opening the form on its first row, never parsed (105a,
added at this Dev); a demote drawing the link again (105j; the harness's unpromoted control journey is its local
equivalent).

**Results (Review, 2026-10-10, main session, Node 24; the owner's in-session go for the live checks):**
- **CI and Vercel at the Dev head `94065e62`** (GitHub and Vercel APIs, `GITHUB_TOKEN` / `VERCEL_*` read in-process): CI
  run 38058081466 — attempt 1's `check` and `rls` were refused by GitHub before starting (no runner, no steps); attempt 2,
  re-run by the owner, `check` (16 steps), `rls` and `deploy` green; `dpl_6HNoZZ7UgETzvEcKADFq5PPdbaXn` READY at
  `94065e62` and aliased to app.inflozo.com. **The Render matrix never ran**: runs 38046521341, 38052237437 and
  38058081445 (this story's three pushes) were refused with GitHub's annotation "recent account payments have failed or
  your spending limit needs to be increased" — Question 5.
- **Production's schema (R-99)**, read through `SUPABASE_DB_POOLER_URL` in one `BEGIN READ ONLY` transaction, rolled back:
  `custom_settings` has no check, rule or trigger that reads `bound_to` or `type` (the cap, key-frozen and touch triggers
  match `20260904120000_complete_schema.sql` line for line); `ghost_setting_type` holds `text`, `image` and `color`; each
  production CHECK evaluated over the three new shapes passes, with its control refused (`'red'` fails `hex6_colour`, a
  picture with a default fails `no_image_default`, `'number'::ghost_setting_type` answers `22P02`).
- **Signed out**, `/projects/<id>/settings?promote=…` (a prop id, `token:accent`, a markup payload, a non-uuid project) and
  the editor answer 307 to `/sign-in` with `no-store`, the payload never reflected; the control, `/sign-in`, answers 200.
- **T1** (read-only; `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`): Casper active, `racer` and
  `source` installed, no probe theme, `custom_theme_settings` Casper's alone, `/` served by Casper with no 7.10 reader;
  controls — a forged token 401, a wrong Content key 401.
- **The deployed editor walk on `94065e62`** (`run-verify-editor.cjs`, throwaway accounts through the service key, the
  user count 14 → 14 after every run): **six runs, none reached step 105**, and none failed a 7.10 check. Run 1 died at
  step 92 (Story 5.16's Tag page 2) under a conflict dialog; run 2 at step 8's magic link; run 3 — **739 PASS, 0 FAIL**,
  step 104's re-expected reads included — at 104h's forced submit, its POST held past 20 s (DW-352); run 4, beside this
  review's niced local tests, FAILED 104c's 15-second heading wait (Vercel's rows: the four `/settings` loads answered in
  0.3–0.7 s — the browser, not the app) and died at the next wait; run 5 at step 1's magic link, with no Vercel row for it
  (DW-204: it never left the machine); run 6, a debug copy waiting 90 s for a navigation and 120 s for an action's answer
  (recorded here, never committed), **728 PASS, 0 FAIL**, died at 104d's promote on `response.text()` — "No data found for
  resource", DW-352's second form. Runs 3 to 6 ran from a clean worktree at the Dev head, so the review's edits were not
  under them. Step 105 (and the review's 105l) is run on the Review head once CI deploys it.
- **Local, over the review's tree:** `pnpm check` green (lint, typecheck, every package's tests — the runtime's
  `tokens.test.ts` with every preset and Mono, `custom-settings.test.ts`, `agreement.test.ts`'s catalog-attribute row,
  `settings.test.ts`' lock round trip and source pins, both pinned gscans, `check-snapshots` PASS); `pnpm keyboard` whole
  green, the new 7.10 journeys in it, each new one turned red by its fix reverted (the ↗ on a hidden section, the replacement ask, Keep on a
  New pack, Remix's park note) and restored byte for byte; the tokens, unknown-design, catalog-attribute and save-path
  patches each turned red the same way.
