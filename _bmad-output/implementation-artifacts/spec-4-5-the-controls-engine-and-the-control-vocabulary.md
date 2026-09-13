---
title: 'Story 4.5 — The controls engine and the control vocabulary'
type: 'feature'
created: '2026-09-13'
status: 'in-review'
baseline_commit: '4a67e48655e8d3b2870681c6048c6ad764994c29'
owner_test: issues
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Every section in the library already lists its own settings — how many columns, which way it lines
up, what sits behind it — but nothing yet turns that list into something a person can press, so
nobody can change how a section looks. This story builds that panel out of words and pictures only,
never pixel sizes or colour codes: a setting another one has switched off turns grey and says why in
a sentence, a list such as a row of features can be added to, trimmed and put in a new order by
dragging or with the keyboard, and a link can point at a post, a Portal page such as Upgrade, Ghost's
own search, a web address or an email. You will see it on one internal page — a sample section on the
left and its panel on the right, every change showing on the section the moment you make it — which is
how the panel will behave inside the editor once Epic 5 builds it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every design declares its controls in `design.json`, but the declaration is a shape with
nothing behind it. `ControlDef.type` is a free string (`packages/library/src/registry.ts:16`), the
three universal controls are three names with no values (`vocabulary.ts:133`), a dependency can be
declared but nothing ever greys a control, and nothing turns an instance's values into the section
root's `data-*` attributes — the runtime has no control input and ships whatever the author typed on
the root (`packages/section-runtime/src/core.ts:90-136`, `:785`). The content half of the vocabulary —
a link that can be a Portal action or Ghost search, an icon, a date, an item list — has no value shape
and no editor, and the runtime refuses `data-items` outright (`core.ts:394-408`), so an authored list
cannot render at all. Until this exists, 4.10's pilots cannot be edited and Epic 5 has no panel to
mount.

**Approach:** Close the vocabulary as data in `packages/library` and refuse everything outside it;
build the pure engine where the architecture puts it, `packages/section-runtime/src/controls.ts`
(`ARCHITECTURE-SPINE.md:622`), and make **both emitters read it through one door** — they stamp the
resolved controls on the root and render `data-items`, link records, icons and image ids themselves, so
a greyed or illegal value cannot reach either output; then compose the Kit's existing controls into a
working sidebar and put it beside a sample section on one internal page, the way `/kit` and
`/style-guide` were shown before the editor existed.

## Boundaries & Constraints

**Always:**
- **The export decides what the panel is built from; the PRD and the rulings decide what it does**
  (R-74). The frames: `Editor Sidebar Kit.dc.html` (every control's anatomy) · `S4 Editor.dc.html` S4c
  (the Quick Controls card over the accordion groups) · `B Missing Surfaces.dc.html` B2 (a design's own
  panel) · `P0-0 Greyed Control Pattern.dc.html` (greyed and absent) · `P0-3 Item List Controls.dc.html`
  (the authored list and the Ghost-sourced card) · `P0-1 Inline Text Toolbar.dc.html` (its link
  popover) · `P0-2 Icon Slot and Picker.dc.html` (its picker) · `D5 Canvas Markers and Template
  Switcher.dc.html` ("Reset this design"). Where a frame's behaviour disagrees with a ruling, the ruling
  is built and Design Notes names the row.
- **One source for the sidebar, the validator and both emitters** (FR-F7). The value an emitter writes
  for a control comes from `resolveControls()` and nowhere else; a greyed control's own stored value, a
  value outside its offered set and an unknown control name never reach either output.
- **Controls are closed-valued; content props hold content.** The five control types — `segmented ·
  stepper · toggle · named-select · swatch-row` — write `data-{name}` on the root (AD-3). The content
  editors — Text Field (`text`), Text Area (`richtext`), Link Picker (`url`), Image Picker (`image`),
  Icon Picker (`icon`), Date Picker (`date`), Item List (`array`) — edit `contentSchema` props. No
  units, no hex, no CSS keyword and no `Inherit` anywhere (FR-F2, R-23).
- **Greyed versus absent is P0-0's, unchanged** (UX-DR3, R-33, R-68): greyed keeps the value in force
  legible, puts one sentence in the caption slot, stays in the tab order `aria-disabled` and never
  `disabled` (`apps/web/components/kit/greyed.ts:19-35`), and is never a tooltip; one value switched off
  inside a live control greys the same way; a control that could never act is not drawn and its group
  carries one note in its place. **Remove never greys** (R-12, UX-DR4).
- **The universal trio is declared once, in full** (FR-F3, R-23): Background role (Swatch Row: Base ·
  Surface · Accent · Contrast · Image, `prd.md:948` — five, and no sixth, R-103), Vertical spacing
  (Compact · Comfortable · Spacious), Top divider (None · Line · Fade), at the schema defaults
  `sections-inventory.md:800` names — Base, Comfortable, None. Exempt from the cap, never a Quick
  Control, narrowed only with a reason, never renamed or added to. **A design whose look is what is
  behind it locks the row with no value marked and says why** (R-69), as `A1-4 Overlay.dc.html:86` draws
  it — "Transparent over the hero is this design" — and its root carries no `data-bg`; locking at one
  value stays available to a design that merely paints no ground in the stack (A20·14 at Background).
- **A Ghost-bound repeat is never an Item List** (FR-F1): it gets P0-3's Ghost-sourced card — a live
  Count (1–100, FR-H2) and Order, read-only rows, and Add, Remove and drag greyed with "These come from
  Ghost, so there is nothing to add here." (owner-ruled 3 September 2026, `P0-3 Item List
  Controls.dc.html:94`).
- **Every new sink is closed by allow-list in the shared core, with a test that the vector is inert and
  the legitimate case still works** (AD-36): link attributes are a closed set, a Portal action is one of
  four, an icon is a key of the vendored set whose drawing is rebuilt from validated path attributes, and
  an image is an asset id resolved only through `RenderInput.assets` (AD-27(b)).
- **Purity** (AD-1): `controls.ts` takes no clock, no `Intl` and no locale method; the Date Picker's
  timezone name is handed in, never read from a machine.
- **Cite or execute.** Portal's and Ghost search's click behaviour was read in their source for this
  spec (Design Notes); nothing about them is asserted beyond that.
- **Counts are derived.** No count of icons, controls, designs or refusals is written into code, docs or
  tests.

**Ask First:**
- **Both questions are ruled (owner, 2026-09-13) and nothing waits on them** — R-103: Background role
  keeps its five roles and there is no "None"; R-104: the icon picker offers every Tabler icon, outline
  and filled, grouped by Tabler's own categories. Read the rulings under "## Questions for the owner"
  before the tasks.
- A new directive, a change to AD-3's one-attribute rule, a fifth mark, or any npm dependency — drag,
  popovers, dates and icons are met by the platform and by vendored data.
- Anything that reaches into Epic 5's stories: dark-override authoring and emission (5.6, AD-30), carry
  / park / default (5.11), Source, hand-picked and the main feed (5.19), the inline toolbar (5.3),
  Member Visibility (5.4), undo and persistence (5.8).

**Never:**
- Never edit the design export (R-74).
- Never install `@tabler/icons` or ship icons as a sprite or a font; the whole set, outline and filled
  (R-104), is vendored data with Tabler's MIT licence beside it (R-26, R-92).
- Never a "None", or any sixth Background role value (R-103).
- Never offer a live Add, Remove or drag on a Ghost-bound repeat.
- Never a colour picker, a slider, or a pixel, rem, percent or hex value at section level (Appendix C,
  `prd.md:1006`).
- No editor route, no canvas selection, no persistence and no design switching — the review page is an
  internal surface like `/kit`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A control change | `card` set to `raised` | the canvas root's `data-card` is written inside the input handler; both emitters stamp `data-card="raised"` | N/A |
| Greyed by a dependency | `align=center`, stored `rule=line`, `rule.disabledBy.inForce: "none"` | `rule` greys with its reason; both emitters write `none`; the stored `line` is kept and returns when `align` changes back | setting `rule` returns the reason and changes nothing |
| A narrowed universal | the design offers Background role as Base · Surface · Contrast | Accent and Image greyed inside the live row with the design's reason; Base in force by default | setting Accent returns the reason |
| A no-value lock (R-103) | a design declares Background role `values: []` with its reason | the row greyed with nothing marked and the reason under it; no `data-bg` on either emitter's root | setting any role returns the reason |
| Stored junk | `controls.card = "12px"`; a stored name `x" onload="y` | the default is stamped; the unknown name is stamped nowhere | ignored, never thrown — a stored record is data, not a type |
| Add at the ceiling | 6 features, `max: 6` | Add greyed with the ceiling sentence; Duplicate refused the same way | `addItem` returns the sentence |
| Remove at the floor | 2 features, `min: 2` | Remove stays active; the floor sentence appears under the list; nothing is removed; the sentence clears on the next edit | `removeItem` returns the sentence |
| Reorder | item 3 moved to 1, by drag or `⌥↑` | the array and the canvas order change together; "Moved to position 1 of 3" is announced | an index out of range is refused |
| An authored array renders | `features` with N items | N copies on both emitters, identical trees, per-item props read from item i; zero items renders nothing | a `data-items` inside another `data-items` or inside a `data-repeat` refuses by name |
| A Portal link | `{ "portal": "account/plans" }` | `href="#" data-portal="account/plans"` on both emitters; never `upgrade` | an action outside the four is an unset link |
| Ghost search | `{ "search": true }` | `href="#" data-ghost-search` | any other `search` value is an unset link |
| An external link | `{ "href": "https://x.example/", "newTab": true, "rel": ["sponsored", "evil"] }` | `target="_blank" rel="noreferrer sponsored"` | `javascript:` becomes `#` (AD-36 1); an unknown rel is dropped |
| FR-F8's unset destination | `archive.link` empty, `data-empty="hide"` on its element | the element is absent from the canvas and from the theme | N/A |
| An icon | `features[0].icon = "rocket"`, and `"heart-filled"` | the outline rocket in Tabler's stroke wrapper and the filled heart in its fill wrapper, inline, once, `aria-hidden="true"`, `currentColor`, identical on both emitters | a name not in the set (`"><script>`) is an empty slot; a drawing whose path attributes fail validation is not emitted; a design with an icon prop rendered without `icons` refuses by name |
| An image | `image = "feature-03"` with `assets` mapping it | `src` is the mapped URL on both emitters | an id with no entry, or a URL stored in its place, is unset |
| A date | `nextIssue = "2026-10-01"` | the value in `datetime` and as text, unconverted | anything but `YYYY-MM-DD` is unset |
| Editing text that carries marks | `"Hello world"` with `strong` 6–11, edited to `"Hello, world"` | `strong` becomes 7–12 | a mark the edit cuts through is clamped to what survives, or dropped if nothing does |
| The Ghost-sourced Count | `latest` declared `limit: 3`, Count set to 5 | the canvas shows 5 rows; the theme's `{{#get}}` carries `limit="5"`; a hand-picked `ids` binding has no Count | a stored 0, 101 or 3.5 is ignored and the declared limit stands |
| The cap | a design with more than 15 controls of its own | refused as `control-cap`; the universal trio and the Data group are not counted | N/A |
| One name, one value set | two designs of a category declare `columns` with different values | `categoryControlUnion` refuses, naming both | R-53 |
| Section reset | several controls, an Order and a Count changed | every control and data control back to its default; the words, the items and stored dark overrides untouched | N/A |

</frozen-after-approval>

## Code Map

- `packages/library/src/registry.ts` — the entry the engine reads. `ControlDef` `:12-24` (`type: string`
  with "4.5 owns the engine" `:15`, `disabledBy` `:21`, `darkOverride` `:23`), `PropDef` `:27-35` (no
  label, no `icon` or `date`), `DataBinding` `:48-56` (the comment `:53-54` names this story as the
  warns-past-25 panel; that panel is 5.19's), `DesignJson` `:59-86`, `SectionRegistryEntry` `:89-114`,
  `recoverQuickControls` `:122-124` (the first five, no floor — ruled at 4.1), `assembleEntry`
  `:149-177`.
- `packages/library/src/vocabulary.ts` — the rules as data. `BINDABLE_ATTRS` `:50-54` (already carries
  `data-portal`), `safeUrl` `:64-70` (http, https, mailto, tel, relative), `UNIVERSAL_CONTROLS` `:133`
  (names only, read as names by `validate.ts:152`, `:219-222`, `:333` and
  `tools/stress/test-vocabulary.mjs:55` — keep the list and derive it), `MARKS` `:152`, `LINK_RELS`
  `:156` ("4.5's Link Picker offers exactly this list"), `data-items` `:338-344`, `data-ghost-search`
  `:459-463`, `CONSUMED_DIRECTIVES` `:470-471`.
- `packages/library/src/validate.ts` — `validateMarkup` `:68-227` (root controls `:143-155` and
  `:211-224`, the prop-kind check `:179-184`), the control block of `validateDesignJson` `:327-359`
  (executed during planning: it accepts `"12px"`, `"#ff0000"`, `"Inherit"`, an unknown type, a
  dependency cycle and thirty controls), `validateCategoryContent` `:387-421`, `validateDesign`
  `:425-439` (hands the markup check control NAMES only, `:432-433`). `validate.test.ts` control cases
  `:246-256`, `:285-292`, `:343-348`, `:365-378`, `:408-434` — `only()` asserts one code, so new
  required fields change these fixtures.
- `tools/stress/test-vocabulary.mjs` — binds this story three ways: the on-disk reference validates
  clean `:83-91`, it uses every directive `:93-97` (so no new directive), and every refusal code has a
  test `:106-114`.
- `packages/library/fixtures/reference-design/design.json:6-14`, `index.html:5-8` (the root's
  hand-written controls and universals), `style.css:11-15` (the only universal selectors anywhere),
  `fixtures/content.json:1-19`.
- `packages/library/src/orbit-weekly.ts` — the review page's sample data: `posts()` `:75`, `tags()`
  `:78`, `authors()` `:79`, `site()` `:82` (`timezone: "Etc/UTC"`), `resolveSource` `:248`; the image
  pool is `packages/library/orbit-weekly/images/`.
- `packages/section-runtime/src/core.ts` — the one walk. `RenderInput` `:90-136`, `UserText` `:185-217`
  (the mark allow-list is looked up by path, `:214`), `RENDERED_DIRECTIVES` `:225-241` and the derived
  `REFUSED_DIRECTIVES` `:246-248`, `refuseUnrendered` `:394-408`, `applyProps` `:710-772` (`data-prop`
  `:719-738`, `data-prop-attr` `:741-763` with the scheme check `:757`), `renderTree` `:777-846`,
  `expandRepeats` `:853-900` (the pattern `data-items` copies; a query's limit caps rows `:885-888`),
  `renderTheme` `:905-917`, `renderCanvas` `:920-923`.
- `packages/section-runtime/src/marks.ts` — `Mark` `:21-28`, `RichText` `:34`, `openTag` `:64-77` (the
  link attributes today), `serializeMarks` `:103-165`.
- `packages/section-runtime/src/agreement.test.ts` (the control-attribute survival case `:118-131`) and
  `ad36.test.ts` (the scheme vector `:24-58`, the `a`-mark vector `:197-217`) — the proofs to extend.
- `packages/section-runtime/src/tokens.ts` — `REFERENCE_TOKENS` `:69`; the swatch colours come from here,
  because `apps/web` may carry no colour literal (`apps/web/tokens.test.ts:125`).
- `eslint.config.js:22-25` — `CORE` is derived, so `controls.ts` and `icons.ts` are linted under AD-1
  with no edit; `:98-126` bans `performance` and `Date.now` in every package file, tests included, which
  is why the 100 ms measurement happens in the browser.
- `apps/web/components/kit/` — the look the panel is built from, all stateless today: `greyed.ts:13-51`,
  `segmented.tsx:11-66` (moon `:34`, every option a tab stop `:51`), `stepper.tsx:6-49`,
  `toggle.tsx:7-44`, `swatch-row.tsx:12-63` (`:45`), `select.tsx` `Select` `:9-41` and `Menu`
  `:74-102`, `moon-badge.tsx:7-11`, `quick-controls-card.tsx:6-10`, `accordion.tsx:8-37`,
  `labels.tsx:6-38`, `input.tsx` `TextInput` `:23-119` (controlled) and `Multiline` `:121-137`
  (uncontrolled), `image-control.tsx` `AssetRow` `:7`, `button.tsx` `AddButton` `:84-91` and
  `IconButton` `:94`, `icons.tsx:9-18` (Tabler is the library's, not the app's — R-92),
  `tooltip.tsx:4-5` (never a reason).
- `apps/web/lib/menu.ts` — `anchorTo` `:36`, `openMenu` `:66`, `arrowKeys` `:112`, `nextIndex` `:141`:
  every menu in the app is `popover="auto"`, placed from the trigger's rect.
- `apps/web/app/(app)/app/(authed)/kit/page.tsx:34-56` (the review surface, and why `force-static`
  cannot return) and `style-guide/frame/route.ts:5-32` with `apps/web/lib/style-guide.ts` — the shapes
  the new page copies; `apps/web/next.config.ts:8-28`; `busy.test.ts:123-142`;
  `app-routes.test.ts:44,56,136,207`; `style-guide.test.ts:84-103`; `csp.ts:72-88` (scripts need a
  nonce, inline styles do not).
- `supabase/migrations/20260904120000_complete_schema.sql:248-249` — an instance already stores
  `controls`, `parkedControls` and `darkOverrides`; nothing reads them, and the engine takes the same
  slice as plain values.
- **Read-only evidence.** `prd.md` FR-F1 `:267`, FR-F2 `:268`, FR-F3 `:269`, the universal paragraph
  `:271`, FR-F4 `:272`, FR-F5 `:273`, FR-F8 `:274`, FR-F6 `:275`, FR-F7 `:276`, §7.3 `:559`, the Portal
  set `:928`, Appendix C `:939-1006`, NFR-1 `:473`, E4 and E5 ownership `:796`, `:804`;
  `sections-inventory.md:35`, `:800`; `reconcile-designs-decisions.md` R-12 `:468-479`, R-23 `:663-674`,
  R-26 `:741-752`, R-27 `:756-768`, R-33 `:846-851`, R-50/R-53/R-56 `:1006-1012`, R-68/R-69
  `:1075-1076`, R-92 `:1668-1679`, and §A24's R-103 and R-104, added with the rulings;
  `ARCHITECTURE-SPINE.md` layers `:56-61`, AD-1 `:92-96`, AD-3
  `:105-109`, AD-4 `:111-117`, AD-27 `:307-314`, AD-30 `:331-339`, capability map `:622`;
  `MEASUREMENTS.md` §29c `:2276-2293`; `epics.md` UX-DR3/4/10/19 `:288-289`, `:295`, `:304`, Stories
  5.3 `:1586`, 5.4 `:1635`, 5.6 `:1678`, 5.11 `:1820`, 5.19 `:2039`; `EXPERIENCE.md` `:148-150`,
  `:285-289`, `:454-461`, `:475-478`, `:518-524`; `DESIGN.md` `:180-183`, `:333-338`, `:438-455`,
  `:479-483`, `:509-524`, `:556-561`.
- **The frames** (the export, never edited): `Editor Sidebar Kit.dc.html` `:25`, `:32-39`, `:44-48`,
  `:63-66`, `:85-93`, `:99-104`, `:109-112`, `:132-153`, `:177-179`, `:195-198`, `:256-262`; `S4
  Editor.dc.html` S4c `:337-363`; `B Missing Surfaces.dc.html` B2 `:472-619`; `P0-0 Greyed Control
  Pattern.dc.html` `:24-25`, `:70`, `:80-82`, `:130-131`, `:140-165`; `P0-3 Item List Controls.dc.html`
  `:25`, `:35-52`, `:59-97`, `:101-134`, `:138-172`; `P0-1 Inline Text Toolbar.dc.html` `:66-135`; `P0-2
  Icon Slot and Picker.dc.html` `:56-173`, `:267-292` (its chips, its "curated" header and its Social group
  of nine are superseded by R-104); `A1-4 Overlay.dc.html:86` with `A1 Headers - Spec.md:351` (the
  no-value lock R-103 builds on); `D5 Canvas Markers and Template Switcher.dc.html`
  `:93`, `:352`; `S14 Editor Cards.dc.html` `:174-190`; `A26-8 Tag Row.dc.html` `:69-82` (FR-F8 drawn);
  `P0 Editor Primitives - Spec.md` P0·0 `:18-113`, the link popover `:167-196`, P0·2 `:220-286`, P0·3
  `:290-342`, the library rules `:611-703`, P0·9's absent sentence `:748-755`; for R-103, `prd.md:222` (FR-D5) and `:631` (§7.4 — a
  template is an ordered list of sections, one partial each, none inside another), `A28 Comments -
  Spec.md:1253-1276` (Slim's "coloured panel" premise), and for the rulings it settled, `A28
  Comments - Spec.md:39-45` and `A29 Archive Headers - Spec.md:1195`.

## Tasks & Acceptance

**Execution:**

- [x] `packages/library/src/vocabulary.ts` -- declare the control vocabulary as data: `CONTROL_TYPES`
  (the five), `UNIVERSALS` (each a full control — label, type, values, default — with Background role
  marked mode-scoped, FR-D7), `UNIVERSAL_CONTROLS` derived from it, `PORTAL_ACTIONS` (Sign up · Sign in ·
  Account · Upgrade → `signup · signin · account · account/plans`, `prd.md:928`), `CONTROL_CAP` (15,
  FR-F3) and the refused CSS-wide words (`inherit · initial · unset · revert`) -- AD-34: the rules are
  data in the library, one copy for the validator, the engine and the panel; Background role's five roles
  are R-103's.
- [x] `packages/library/src/registry.ts` -- widen the entry: `ControlDef` gains `type` as the closed
  union, a required `label` and `group` (`arrangement` or `style`), optional `valueLabels`, and
  `disabledBy.inForce`; `DesignJson` and `SectionRegistryEntry` gain `universals` (an empty `values` is R-103's no-value lock; per universal:
  `values`, `default?`, `reason`) and `absent` (`{ group, note }`), carried by `assembleEntry`; `PropDef`
  gains a required `label`, the `icon` and `date` types, and on an `array` `min`, `max`, `item`, `atMin`
  and `atMax`; one `Link` type that a `url` prop and the `a` mark share (`href?` · `portal?` · `search?`
  · `ref?` · `newTab?` · `rel?`); and `categoryControlUnion(designs)`, which refuses one name carrying
  two value sets (R-53); correct the comment at `:53-54` -- FR-F7's one schema per design and one union
  per category from one source: the union is generated, never authored.
- [x] `tools/vendor-icons.py` · `packages/library/icons/tabler.json` ·
  `packages/library/icons/LICENSE-tabler.txt` · `packages/library/src/icons.ts` ·
  `packages/library/src/icons.test.ts` · `packages/library/{package.json,tsconfig.json}` -- vendor the
  whole set (R-104): download `@tabler/icons` at a pinned version from the npm registry, refuse to write
  unless the tarball's `sha512` matches the pinned integrity and its `LICENSE` is MIT, and write every icon
  from Tabler's own files — its category and its tags (as strings) from `icons.json`, its outline drawing
  from `tabler-nodes-outline.json`, and its filled drawing, where Tabler has one, from
  `tabler-nodes-filled.json` — with the version, capture date and command, beside Tabler's licence text
  verbatim; a filled icon's key is its name plus `-filled`, and the script refuses to write if an outline
  name already ends that way; `icons.ts` exports the lookup, the category list derived from the set and
  sorted, and the licence text, through its own `exports` subpath (`./icons`) so importing the
  vocabulary never pulls the drawings; the test asserts every icon has a category, the nine Ghost
  platforms are present (`P0 Editor Primitives - Spec.md:260-261`), outline drawings use only `path` with
  `d`, `fill`, `opacity` and `stroke` and filled ones only `path` with `d` and `fill`, and no drawing
  carries a brace; add `icons` to the `tsconfig.json` `include` with `resolveJsonModule` (Story 4.4's
  `orbit-weekly` wiring) and a catalogue row for the script in `tools/doc-audit.py` -- R-26, R-92 and
  R-104: Tabler is the sections' set, drawn inline and whole, and its licence travels with it.
- [x] `packages/library/src/validate.ts` · `packages/library/src/validate.test.ts` -- the refusals, each
  fired alone by a test (`test-vocabulary.mjs:106-114` derives the list): an unknown control type; a
  missing label or group; values that break their type's grammar (`on`/`off` for a toggle, ascending
  consecutive integers for a stepper, kebab words for the rest, the roles for a swatch row) and a
  `valueLabels` key that is not a value; `inherit` or another CSS-wide word anywhere; more than
  `CONTROL_CAP` own controls; a dependency cycle; an `inForce` outside the values; a universal narrowing
  that is not a subset, has no reason, or drops the default without naming another (an empty list is
  R-103's no-value lock and needs only its reason); a root that carries a no-value-locked universal; an
  absent note that is empty or names no group; a root control value outside its offered set
  (`validateMarkup` gains an optional `controlValues`, so the stress archetypes that pass names still
  validate); a prop with no label, an array whose bounds disagree or lack their sentences, an icon
  default not in the set, a date default that is not `YYYY-MM-DD`; `data-prop` accepts `icon` and `date`
  props (`:179-184`); update the existing fixtures so each case still fires only its own code, and
  correct the comment at `:243-244` -- one refusal per rule the panel, the validator and the emitters
  share.
- [x] `packages/library/fixtures/reference-design/design.json` · `packages/library/fixtures/content.json`
  -- give every control a label and group and every prop a label -- the on-disk reference must keep
  validating clean end to end (`test-vocabulary.mjs:83-91`).
- [x] `packages/library/fixtures/controls/1/{design.json,index.html,style.css}` ·
  `packages/library/fixtures/controls/content.json` -- the sample the review page renders: a small
  feature-row section, flat CSS over the reference tokens only, using only directives the runtime
  renders, with the controls, content and words Design Notes lists; assembled through the real
  `assembleEntry` and kept outside `designs/` -- the panel can only be proved against a design, and no
  category exists yet.
- [x] `packages/section-runtime/src/marks.ts` -- add `linkAttributes(link)`, the one function that turns
  a link record into its closed attribute set (`href` through `safeUrl`, `data-portal` from
  `PORTAL_ACTIONS`, a valueless `data-ghost-search`, `target` and `rel` from `LINK_RELS`, and nothing for
  a record with no valid destination), and have `openTag` (`:64-77`) call it; add `editText(value,
  next)`, which shifts marks after the edited run and clamps or drops the ones it cuts -- AD-4: marks
  become markup at one place, and a sidebar edit must not lose a customer's bold.
- [x] `packages/section-runtime/src/controls.ts` · `packages/section-runtime/src/controls.test.ts` -- the
  engine, pure: `resolveControls` (every declared control and universal → its value in force, and no
  entry for a no-value lock), `sidebar`
  (Quick Controls as `recoverQuickControls` returns them, then Content in markup order via the library's
  `scanTags`, Arrangement, Style with the universal trio at its foot, and Data only when the design
  declares a query — each row carrying label, options, marked value, greyed reason, moon, changed flag,
  and each group its absent notes), `setControl`, `resetControl`, `resetSection`, `addItem`,
  `duplicateItem`, `removeItem`, `moveItem` with its announcement, `setData`, and `withData` for the
  Ghost-sourced Count and Order; the test is the I/O matrix, every row, with the floor and ceiling
  sentences read from `content.json` and never written in code -- the capability map's home for FR-F
  (`ARCHITECTURE-SPINE.md:622`).
- [x] `packages/section-runtime/src/core.ts` -- one door: `RenderInput` gains `controlSchema`,
  `universals`, `controls`, `data`, `assets` and `icons`; `renderTree` (`:777-846`) stamps `resolveControls` on
  the root when a schema is given (the authored root stands when it is not, so every existing render is
  unchanged), merges `withData` into `dataBindings`, renders `data-items` on both emitters (canvas: one
  copy per item, props read from item i; theme: N static copies whose user text is parked like any
  other, the mark allow-list still looked up by the `[]` path), writes a link record through
  `linkAttributes` on a `data-prop-attr` `href` entry (`:741-763`), draws an `icon` prop from `icons` —
  the library's lookup, handed in so the core never imports the drawings — rebuilding each `<path>` from
  validated attributes inside Tabler's stroke wrapper, or its fill wrapper for a `-filled` key, and
  refusing by name a design with an icon prop rendered without the lookup, and resolves an `image` prop
  through `assets`; add `data-items` to `RENDERED_DIRECTIVES` (`:225-241`)
  -- AD-3 and FR-F7 by construction: neither emitter can write a value the engine did not resolve, and an
  authored list gets its render path (`docs/section-authoring.md:343-354`).
- [x] `packages/section-runtime/src/agreement.test.ts` · `packages/section-runtime/src/ad36.test.ts` ·
  `packages/section-runtime/src/index.ts` -- prove it and export it: both emitters stamp identical
  control attributes and produce identical `data-items` trees, link attributes, inline icons and image
  sources, and a greyed control's stored value is in neither output; each new vector is inert and its
  legitimate case works — a Portal action outside the four, a `javascript:` link, a `search` that is not
  `true`, a rel outside the list, an icon name carrying markup, a lookup handing back a drawing with a
  hostile `d` or an extra attribute, a no-value-locked universal, an item title carrying `{{title}}`, a
  stored control name carrying a quote -- §7.3's exit criterion covers everything this story adds, in
  `pnpm check` and therefore in CI.
- [x] `docs/section-authoring.md` -- the authoring contract for controls: the five types and their
  grammars, `label`, `group`, `valueLabels`, `disabledBy` with `inForce`, the universal trio and
  narrowing with a reason, absent notes, the cap, the content editors and their value shapes (a link
  record, an icon name, an asset id, a date), array bounds and their sentences, `data-items` rendered
  since 4.5 (the partition note `:232-237`), how a link and an icon are emitted, where Tabler's licence
  lives, and the new refusal rows; correct the warns-past-25 owner at `:159-161` to 5.19 -- a shipped
  deliverable that every design in Epics 9–11 is written against.
- [x] `apps/web/components/kit/{segmented,stepper,toggle,swatch-row,select,accordion,input,image-control,button}.tsx`
  · `apps/web/app/(app)/app/(authed)/kit/page.tsx` -- give the Kit's controls their behaviour without
  changing what they draw: optional value and change props; a radio group as one tab stop moved with
  the arrows (`lib/menu.ts:141`'s `nextIndex`); one option greyed inside a live row; a controlled
  `Multiline`; a greyed `AddButton`; an actionable `AssetRow`; no hooks in these files, so `/kit` still
  renders them statically; update `/kit`'s call sites where a prop's shape moves -- R-74: the panel is
  built from the Kit, never beside it.
- [x] `apps/web/components/controls/{sidebar,item-list,link-picker,icon-picker,image-picker}.tsx` -- the
  client components Epic 5 will mount: the sidebar draws `sidebar()`'s model with the Kit's pieces —
  the Quick Controls card, the four accordions (a group's absent note after its own controls and before
  the universal trio), the moon badge with the words "Dark override" beside it (UX-DR8), a reset icon beside
  a changed control's label, "Reset this design" at the panel foot, the Swatch Row's roles in the
  reference token colours (Base `--bg-page`, Surface `--bg-surface`, Accent `--accent`, Contrast
  `--bg-contrast`, Image the Kit's image glyph), Text Field and Text Area as the Kit's `TextInput` and
  `Multiline` editing through `editText`, and the Date Picker as the Kit's input with `type="date"` and
  the site's timezone in its caption; the item list
  is P0-3's authored list (range line, a Move button per row with pointer drag — 2° tilt, none under
  reduced motion — and `⌥↑`/`⌥↓` announced politely, the overflow's Duplicate and Remove, the floor
  sentence, and a selected row opening that item's fields beneath the list) and P0-3's Ghost-sourced
  card; the link picker is P0-1's popover over sample resources (Pages · Posts · Tags · Authors, each
  omitted when empty; the four Portal chips always last; the Ghost search chip; one "Link to …" row for
  a pasted URL or typed email; Open in new tab, on by default for an external URL, and the three rel
  toggles, both offered only for a URL or an internal destination; the closed field reading `Portal ·
  Upgrade` over `account/plans`); the icon picker is P0-2's, reshaped by R-104 (search over names and
  tags; a segmented Outline · Filled · Both deciding which styles show, at Outline when it opens — the
  style the drawn picker shows; a select of "All categories" and each of Tabler's categories in place of
  the drawn chips, which cannot hold them; the grid grouped under Tabler's category names, as P0-2 already
  groups its grid under caps labels, with Both showing an icon's two styles side by side; the recent
  eight with its empty sentence; 38 px cells; the no-match sentence; "Tabler Icons · MIT"; Remove icon
  from a filled slot; the drawings loaded when the picker first opens); the image picker is the Kit's asset row over the sample pool; every
  popover is `popover="auto"` placed by `lib/menu.ts`, takes focus and returns it -- Epic 5 mounts these
  rather than drawing them again.
- [x] `apps/web/lib/controls-review.ts` · `apps/web/app/(app)/app/(authed)/controls/{page.tsx,review.tsx,frame/route.ts}`
  -- the owner's surface: the page (server, `metadata` with a title and `robots: noindex`, behind the
  session guard, dynamic, no `<main>`) reads the sample off disk, assembles and validates it, and hands the client the entry, the
  reference token values for the swatches, the Orbit Weekly rows for the query, the link picker's
  resources and the image pool; `review.tsx` holds the instance, writes a control's resolved attributes
  onto the canvas root inside the input handler, and re-renders the section with `renderCanvas` for
  content, handing it the icon lookup it loads from `@inflozo/library/icons` when it mounts; `frame/route.ts` guards itself like `style-guide/frame/route.ts:17-32` and serves the canvas
  document — reference tokens, the sample's stylesheet, an empty mount point and no script, so no nonce
  is needed -- Story 4.4's review-page shape, because the editor does not exist yet and R-80 needs a
  deployed screen.
- [x] `apps/web/package.json` · `apps/web/next.config.ts` · `apps/web/busy.test.ts` ·
  `apps/web/controls.test.ts` -- add `@inflozo/section-runtime` as a `workspace:*` dependency (already in
  `transpilePackages`, `next.config.ts:19-24`); trace the files the review reads for both routes (copy
  `:8-12`, `:25-28`); exempt `controls` in `NO_SKELETON` with its reason (copy `:132-142` — reached only
  by typing the path); test that the frame route guards before building a body, that the canvas document
  carries no script, that every directory the review reads is traced, and that the assembled sample
  validates clean -- the fences `style-guide.test.ts:84-103` put around Story 4.4's page.
- [x] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md`
  · `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` ·
  `_bmad-output/implementation-artifacts/deferred-work.md` ·
  `_bmad-output/implementation-artifacts/epic-4-context.md` -- propagate (standing rule 3), then grep
  the repository for every old name and shape (standing rule 7): AD-4 (`:115-116`) gains the shared link
  record and the one attribute function; §7.3 (`prd.md:559`) says the closed-value rule is the controls'
  and names the content editors; R-104 reaches FR-F1 (`prd.md:267`), Appendix C's Icon Picker row
  (`:950`) and DESIGN.md § Icons (`:556-561`), which stop saying "curated" and say the whole set, outline
  and filled, grouped by Tabler's own categories; open ledger entries for what was found here and is
  owned elsewhere — A28's 10 Slim, drawn locked at "None", is built as A1·4's no-value lock (R-103); a
  formatted, localised display of an authored date; Image focus (R-51, P0-9) with no owning story and no
  emission rule under AD-3; Tabler's licence file and FR-J3's icon budget in the emitted theme (R-26, no
  Epic 7 story); the callout card's panel carries a "Background role" of its own with other values (Base ·
  Surface · Tint · Accent, `P0 Editor Primitives - Spec.md:586`), one name with two value sets against R-53,
  for the card-panels story (FR-Q7); A1·4 needs to know whether the section below it carries a picture
  (`A1 Headers - Spec.md:183`, R-8) while the adjacency vocabulary asks only about the section above
  (`packages/library/src/vocabulary.ts:147-149`), for A1's category story; and category spec tables that
  list the universal row open where the drawn panel locks it (`A22 Newsletter - Spec.md:1271` against
  `A22-14 Slide-in Card.dc.html:67`, with more found in A19, A22, A24, A25 and A31), which every category
  story must build from the panel; tick R-103's and R-104's targets in `reconcile-designs-decisions.md` §A24 as each
  lands; add Story 4.5's Dev sub-bullets to the epic context -- a finding is not closed until it reaches
  the document that governs it.

**Acceptance Criteria:**

- Given the review page open beside `Editor Sidebar Kit.dc.html`, `S4 Editor.dc.html` S4c, `B Missing
  Surfaces.dc.html` B2, `P0-0 Greyed Control Pattern.dc.html` and `P0-3 Item List Controls.dc.html`, when
  the panel is compared, then **it matches the frames**: a Quick Controls card holding the design's first
  three to five controls, then Content, Arrangement, Style and Data in that order (Arrangement, not
  Layout — FR-F3), every control drawn as the Kit draws it, the greyed row and the absent note as P0-0
  draws them, the authored list and the Ghost-sourced card as P0-3 draws them, the link popover as `P0-1
  Inline Text Toolbar.dc.html` draws it and the icon picker as `P0-2 Icon Slot and Picker.dc.html` draws
  it, reshaped by R-104 — and no universal control in the Quick Controls card.
- Given the sidebar, when a control, a content field or an item changes, then the canvas paints the
  change in the same frame as the input, and a content re-render completes inside 100 ms — measured in
  the browser at Review on the deployed page under 4× CPU throttle and recorded under Verification,
  because NFR-1's gate is manual-only (`prd.md:473`).
- Given only a keyboard, when the owner's test is walked, then every control, popover and list works: a
  radio group is one tab stop moved with the arrows, a popover takes focus and returns it on close, an
  item moves with `⌥↑`/`⌥↓` and is announced, and a greyed control stays reachable and is read with its
  reason (UX-DR10) — and axe-core at WCAG 2.1 AA reports zero violations on the page.
- Given a control another control disables, when the section renders on either emitter, then the root
  carries the value in force and never the stored one, and the sidebar, the validator and both emitters
  took it from the one declaration (FR-F7).
- Given the sample and the reference fixture, when they are validated, then both are clean, and every
  refusal the validator gained fires in a test on its own.
- Given the designs of one category, when its union is generated, then it is derived from their control
  lists and a name carrying two value sets is refused (FR-F7, R-53).
- Given the link picker, when a destination is chosen, then the Portal chips are always all four and
  always last, Upgrade compiles to `account/plans`, Ghost search compiles to `data-ghost-search`, and
  new tab and rel are stored in the link record and compiled from it, offered only where they can act
  (FR-F6).
- Given the icon picker, when it opens, then it offers every Tabler icon grouped under Tabler's own
  categories, and Outline · Filled · Both decides which styles show (R-104); and given an icon placed in a
  section, when it renders, then it is Tabler's drawing in the chosen style, inline where it is used, once
  per use, with no sprite and no font, and Tabler's MIT licence text ships beside the set in the library
  (FR-F1, R-26).
- Given a design that paints no ground of its own, when its panel is drawn and it renders, then its
  Background row is locked with no role marked and its sentence under it, and neither emitter writes
  `data-bg` on its root (R-103, R-69).
- Given a mode-scoped control with a stored dark override, when the panel is drawn, then it carries the
  moon badge and the words "Dark override", and a mode-scoped control without one carries neither
  (FR-F5, UX-DR8).
- Given a changed control, when its reset icon is pressed, then it returns to its default and the reset
  leaves; and when "Reset this design" is pressed, then every control and data control returns to its
  default while the words, the items and the stored dark overrides stay (FR-F4).
- Given a link to a page Ghost does not publish, when its destination is empty, then its row renders
  nothing on either emitter, and it appears once a destination is set (FR-F8).
- Given the gate, when `python3 tools/doc-audit.py --check`, `pnpm check` and the `tools/stress` gscan
  gate run, then all are green with 0 errors and 0 warnings on both majors, and no count a tool derives
  is written down.

### Review Findings

Five layers ran on 2026-09-13 (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier). The deployed walk found nothing; every patch below is applied; the five deferrals are DW-117 to DW-121.

- [x] [Review][Patch] Duplicate at the ceiling was refused by the engine and swallowed by the panel — its sentence now reaches the list's status line like Remove's at the floor [apps/web/components/controls/item-list.tsx]
- [x] [Review][Patch] A `data-repeat` inside a `data-items` was refused nowhere and would bake one `{{#get}}` per item on the theme — refused by name, with the reverse case's test [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] A design whose only binding is hand-picked drew an empty Data accordion — the Data group follows the other groups' rule and is drawn only with rows or a note [packages/section-runtime/src/controls.ts]
- [x] [Review][Patch] A greyed row whose stored value differed from its default carried a reset icon, and the moon lit for a dark override outside the control's values — neither now [packages/section-runtime/src/controls.ts]
- [x] [Review][Patch] `linkAttributes` dispatched on key presence, so a record round-tripped with `portal: null` beside a valid `href` was an unset link — a null or undefined key is absent [packages/section-runtime/src/marks.ts]
- [x] [Review][Patch] A `url` prop default naming no destination validated clean and rendered as an unset link — refused as `unset-default-link`, three cases each firing alone [packages/library/src/validate.ts]
- [x] [Review][Patch] `categoryControlUnion` compared values only, so one name as two types passed — refused, naming both designs [packages/library/src/registry.ts]
- [x] [Review][Patch] A failed icon download left the canvas blank with an unhandled rejection, and the picker cached the rejection forever — the canvas says so and the picker retries [apps/web/app/(app)/app/(authed)/controls/review.tsx · apps/web/components/controls/icon-picker.tsx]
- [x] [Review][Patch] Filled with a category that has no filled icons read "Nothing for ''" with a Clear search that did nothing — its own sentence [apps/web/components/controls/icon-picker.tsx]
- [x] [Review][Patch] A second pointer on another handle overwrote a live drag [apps/web/components/controls/item-list.tsx]
- [x] [Review][Patch] A popover closed before its first frame was still placed, observed and focused [apps/web/components/kit/select.tsx]
- [x] [Review][Patch] A query with no declared limit and no stored Count showed every row while the panel said Ghost's default [apps/web/app/(app)/app/(authed)/controls/review.tsx]
- [x] [Review][Patch] The link picker formatted post dates in `en-US`, a second date rule against DW-106 — the stored day is shown; a row with no `url` no longer yields the string "undefined" [apps/web/lib/controls-review.ts]
- [x] [Review][Patch] `vendor-icons.py` crashed with a traceback on a missing tarball member or a `tabler.json` without `captured` — both are refusals or fallbacks now [tools/vendor-icons.py]
- [x] [Review][Patch] `CONTROL_WORD_RE` restated `CONTROL_NAME_RE` — one is derived from the other [packages/library/src/vocabulary.ts]
- [x] [Review][Patch] The runtime's icon-attribute grammar was proved on three icons — every vendored drawing, outline and filled, now passes through `iconSvg` under test [packages/section-runtime/src/controls.test.ts]
- [x] [Review][Patch] An `a` mark's Portal and search destinations had no test on either emitter — the four actions, one outside, and search are asserted [packages/section-runtime/src/ad36.test.ts]
- [x] [Review][Patch] `queryRows` and `linkResources` had no test — both orders and every resource's URL are asserted [apps/web/controls.test.ts]
- [x] [Review][Patch] The deployed measurements AC 2 asks for were never recorded on production — the Review run's figures are under Verification, and its harness is committed [tools/probe/run-verify-controls.cjs]
- [x] [Review][Patch] An empty Arrangement or Style group is omitted, which FR-F3's four groups did not say — recorded as an extrapolation in Design Notes
- [x] [Review][Patch] The PRD's Icon Picker row still measured the icon budget "at E4" while DW-108 hands it to Epic 7 [prd.md Appendix C]
- [x] [Review][Defer] The frame route's sign-in guard is asserted by reading the source text, not by calling the handler [apps/web/controls.test.ts] — deferred, pre-existing (Story 4.4's shape; DW-117)
- [x] [Review][Defer] `tools/design-patch-prompts.py` still says "curated Tabler set" [tools/design-patch-prompts.py:522] — deferred, pre-existing (the record of a prompt run on 2026-08-25; DW-118)
- [x] [Review][Defer] `validateMarkup`'s `controlValues` check runs on unit fixtures only; the stress archetypes pass names [tools/stress/test-vocabulary.mjs] — deferred, pre-existing (no category design exists yet; DW-119)
- [x] [Review][Defer] An `a` mark with no valid destination emits `<a>` with no href while the `url` prop sink hides its element [packages/section-runtime/src/marks.ts] — deferred (both inert; DW-120)
- [x] [Review][Defer] No test renders the on-disk `index.html` through both emitters; `controls.test.ts` retypes it [packages/section-runtime/src/controls.test.ts] — deferred (needs a DOM in `apps/web`, a dependency the spec reserves; DW-121)

## Spec Change Log

- **2026-09-13, Review (iteration 1).** Five layers ran (Blind Hunter, Edge Case Hunter, Verification Gap,
  Acceptance Auditor, Real-infra verifier); the deployed walk held 78 of 78 checks with no finding. Patched
  from the other layers: a Duplicate refused at the ceiling is now said, like Remove at the floor; a Ghost
  repeat inside an authored item is refused by name (the reverse of the nesting already refused); a hand-picked
  list alone draws no empty Data group; a greyed row carries no reset icon and the moon lights only for an
  override the control can use; a link record with `portal: null` is a link, not an unset one; a url prop
  default that names no destination is refused (`unset-default-link`); the category union refuses one name
  with two types as well as two value sets; a failed icon download says so on the canvas and the picker
  retries it; a second pointer cannot take over a live drag; a popover closed before its first frame is not
  observed; a query with no declared limit shows Ghost's default rows, as the panel says; the link picker's
  post dates are the stored day (DW-106); `vendor-icons.py` refuses rather than crashes on a missing tarball
  member. Proofs added: every vendored drawing passes the runtime's grammar; an `a` mark's Portal and search
  destinations on both emitters; the review page's two query orders and every link resource. The deployed
  harness is committed as `tools/probe/run-verify-controls.cjs`. No question is open for the owner.

## Design Notes

**Controls and content are two halves of one vocabulary.** §7.3 says every Appendix C type resolves to
a finite set of named values (`prd.md:559`). That is true of the five types that write the root and
false of the seven that edit content — a heading is free text, a link is a record, a picture is an id.
So the five live in `controlSchema` and the seven are what a `contentSchema` prop's type selects; the
panel composes both and the validator holds each to its own rule. The PRD sentence is corrected rather
than obeyed literally.

**Where a ruling overrides a frame, and where a frame is extrapolated.**
- S4c names the second accordion "Design" and puts Density and Colours in the Quick Controls card; FR-F3
  names the group Arrangement, and the universal controls are never Quick Controls. Built as FR-F3.
- The category kits draw the trio as a group of its own; FR-F3 names four groups. The trio sits as one
  block at the foot of Style, in the kits' order.
- A Quick Control appears once. S4c repeats the design picker in its accordion, not a control.
- A group with nothing in it is not drawn (Review, 2026-09-13). FR-F3 names four groups; no frame draws an
  empty accordion, and a design with nothing to arrange would otherwise open to a heading over nothing. A group
  whose controls could never act still appears, because its absent note is what it holds. Data follows the
  same rule: a hand-picked list alone (R-20) has no Count or Order and draws no group.
- No frame draws a per-control reset. It sits beside the label of a control whose value differs from its
  default, as the Kit's Undo glyph in a 20 px ink-soft icon button named "Reset <label>" — *on the owner's
  finding 1 (2026-09-13); it was the word "Reset" in D5's 12 px ink-soft until then.* "Reset this
  design" is D5's and has no confirm — D5 draws none, and S14's confirm exists because a card reset
  reaches every post — and it resets controls only, S14's "Posts keep their content." rule.
- P0-3 greys the Ghost-sourced list's Add, Remove and drag; FR-F1 says a Ghost-bound repeat never gets
  an Item List. They agree: P0-3's first line is that the Ghost-sourced list "is **not** this" — it is a
  Count and an Order over read-only rows, which is what FR-F1 asks for, and its greyed Add tells the
  truth rather than lying. Only Count and Order are built; Source, hand-picked and the main feed are
  5.19's.
- R-69's no-value-marked case reaches a universal control too, and A1·4 draws it: its Background row is
  "LOCKED" with no colour marked and "Transparent over the hero is this design" under it
  (`A1-4 Overlay.dc.html:86`). R-103 makes that the shape for a design whose look is what is behind it —
  A22·14, A15·5, A14·9 and A16·10 draw the same lock with a word in the value slot ("None", "Transparent",
  "the set is the ground"), and A28's 10 Slim draws it as "None" — so its root carries no `data-bg` and
  nothing paints over what is behind. The build draws the lock as A1·4 does, "LOCKED" and the sentence,
  because a word like "None" in that slot reads as a sixth value. A dependency's `inForce` is still always
  one of its control's own values.
- The absent note sits where the control would have been, in its group (`P0 Editor Primitives -
  Spec.md:67-68`), not pinned to the panel foot as B2 drew it before P0-0 existed.
- Open in new tab is on by default for an external URL, as P0-1 draws it. New tab and rel are not
  offered for Portal, search or email, because they could never act there (R-68).
- The Date Picker has no frame: it is the Kit's input with the browser's own calendar, which is what
  "calendar popover" asks for without a date library.
- *Found at Dev.* P0-1 draws the link popover's search state and filled state as two panels; the build
  keeps search on top and the filled state beneath it in one panel, the same parts in P0-1's order,
  because steps 11 and 12 press a chip or Remove link on a link that is already set
  (`apps/web/components/controls/link-picker.tsx:20-25`).
- *Found at Dev.* The icon picker's Outline · Filled · Both and its category select carry the visible
  labels "Style" and "Category", which R-104's two new controls need to be named for axe; its recent eight
  last for the page session, since saving is 5.8's. The image pool's popover has no frame and is the Kit's
  menu surface holding the asset row's cells (`image-picker.tsx:7-12`).
- *Found at Dev.* `DESIGN.md` § Icons said "1.5px stroke at 16 and 20px", the Lucide brief's figure; the
  export ships Tabler verbatim at stroke 2 (`P0 Editor Primitives - Spec.md:228`), so the build draws stroke
  2 and the DESIGN.md line was corrected to the export (R-74: on disagreement the export is right).

**One link record, two homes.** A `url` prop and an `a` mark hold the same record; a bare string in a
`url` prop is still a URL link, so every existing fixture and test stays valid. `ref` is kept for Epic 7's
compile-time re-validation (FR-F6) and this story renders `href`:

```json
{ "href": "https://orbit-weekly.example/the-night-shift-at-the-port-of-algeciras/",
  "ref": { "kind": "post", "id": "905700000000000000000001" } }
{ "portal": "account/plans" }
{ "search": true }
```

**Why `href="#"` is right for Portal and search — read in source, 2026-09-13.** `portal@~2.51` (served
to Ghost 5.130.6) binds `querySelectorAll("[data-portal]")` to a `clickHandler` whose first statement
is `a.preventDefault()`, then reads `dataset.portal`; `portal@~2.69` (Ghost 6.58.0) does the same in an
async handler; `sodo-search@~1.8` binds `[data-ghost-search]` to a handler that calls
`e.preventDefault()` and opens the popup (`MEASUREMENTS.md` §29c records the triggers). The hash never
moves the page while the script runs, and with JavaScript off nothing happens — which P0-4 already says.

**Icons are data, not a dependency — and the core never imports them.** Tabler publishes every icon as a
list of path nodes (`tabler-nodes-outline.json`, and `tabler-nodes-filled.json` for the icons that also come
filled), so the vendored set is those nodes plus the category and tags search needs. The emitted `<svg>`
wraps them in Tabler's own attributes — for outline a 24 viewBox, `fill="none"`, `stroke="currentColor"`,
stroke 2 with round caps and joins; for filled `fill="currentColor"` — with `aria-hidden="true"`. The whole
set is about 2.5 MB of drawing data, so the runtime is handed the library's lookup rather than importing
it: the review page and the picker load it when they first need it, Epic 7 will hand it to the compiler,
and the runtime rebuilds every `<path>` from validated attributes, so no caller can pass markup through
it (AD-36). Under R-104 the drawn picker's header, "A curated set from Tabler Icons…", is no longer true
and reads "Every Tabler icon, in outline and filled." instead, and its Social / Brands chip of nine gives
way to Tabler's own Brand category. The nine-platform rule stays with the social-link rows that read
Ghost's nine fields, which their categories build (A1, A3, A21).

**An image is an id, and the render resolves it** (AD-27(b)). Both emitters look the id up in
`RenderInput.assets`; the review page hands them the Orbit Weekly pool, and Epic 7 will hand them the
theme's asset paths, so no core code learns what an asset URL looks like.

**A date is the site's wall-clock day, stored unconverted** (`prd.md:952`). `YYYY-MM-DD` in the site's
timezone: nothing converts it, so no clock and no `Intl` enters the core. Printing it as a written-out,
localised date needs the locale and Ghost's timezone handling, and is recorded as a gap rather than
invented here.

**The sample section**, `packages/library/fixtures/controls/`. Controls, in order: **Columns** (stepper
2 · 3 · 4, default 3, Arrangement) · **Card style** (named select Flat · Outlined · Raised, default
Outlined, Style) · **Alignment** (segmented Left · Centre, values `start`/`center`, default Left,
Arrangement) · **Show icons** (toggle, on, Style) · **Rule under heading** (segmented None · Line,
default Line, Style; disabled while Alignment is Centre, in force None: "Not available while the
heading is centred.") · **Image position** (segmented Top · Side, Arrangement) · **Card tint** (segmented
None · Soft · Strong, Style, mode-scoped). Background role narrowed to Base · Surface · Contrast: "This
design is drawn for plain grounds, so accent and image are not offered." One absent note in Style, in
P0-9's own words: "There is no image focus here. This design places your photograph at its own shape,
so nothing is cropped and there is nothing for focus to choose." Content: the eyebrow "This week at
Orbit Weekly"; the heading "Seven links, checked by hand"; **Next issue**, a date, 2026-10-01; a picture,
`feature-03`, described as "Cargo cranes over a harbour at night"; the link "Read the latest issue"; an archive row "Browse the archive" with no destination;
**Features** (2–6, item "feature": Seven links with the link icon, Checked by hand with a check, Every
Thursday with a calendar; a new one lands as "A new feature" with a star; floor "A feature row needs at
least 2 features."; ceiling "The row holds 6 features. Remove one to add another."); and **From the
archive**, a `{{#get}}` of the latest three posts. The review page starts with one stored dark override,
on Background role, and none on Card tint.

## Verification

**Commands:**
- `python3 tools/doc-audit.py --check` -- expected: exits 0; run twice, since its sub-tools regenerate on
  the first failure.
- `PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH pnpm check` -- expected: green, including
  `controls.test.ts`, `agreement.test.ts`, `ad36.test.ts`, `validate.test.ts`, `icons.test.ts` and
  `tools/stress/test-vocabulary.mjs`.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: 0 errors and 0
  warnings on both majors, with the runtime now stamping controls and rendering `data-items`.
- `python3 tools/vendor-icons.py`, run twice -- expected: exits 0 having checked the tarball's integrity
  and MIT licence, and the second run leaves `git status --porcelain packages/library/icons` empty.
- **Real infrastructure, at Review (R-82):** Playwright against `https://app.inflozo.com/controls`,
  signed in through Supabase's `generate_link` as `tools/probe/run-verify-dashboard.py` does (the
  `SUPABASE_` keys, read into the environment only) -- expected: every step of the owner's test holds;
  axe-core at WCAG 2.1 AA reports zero violations; the item list reorders with the keyboard alone; under
  4× CPU throttle the control attribute is written in the input's own frame and a content re-render
  finishes inside 100 ms, both recorded here. Negative control: `curl -sI
  https://app.inflozo.com/controls` with no session answers 307 to `/sign-in`, and `/controls/frame`
  answers 303.
- **Deploy:** `GET https://api.vercel.com/v6/deployments` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and
  `VERCEL_PROJECT` -- expected: production READY at the Review commit.
- **No migration and no Ghost call.** This story changes no table, so R-99 owes no Schema phase; the
  canvas calls no Ghost, so the test servers T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com` are not
  touched, and the two Ghost facts it relies on were read in source, below.

**What ran at Create, 2026-09-13:**
- `npm view @tabler/icons version dist.tarball license` → `3.46.0`,
  `https://registry.npmjs.org/@tabler/icons/-/icons-3.46.0.tgz`, `MIT`. The tarball, downloaded and
  unpacked in the scratchpad, carries `icons.json` (a `category` and `tags` per icon),
  `tabler-nodes-outline.json` (every outline icon as `path` nodes using only `d`, `fill`, `opacity` and
  `stroke`) and `LICENSE`; all nine Ghost platforms exist as `brand-*` icons; the everyday icons Question
  2 names sit under Communication (`mail`), Map (`map-pin`, `rocket`), Shapes (`heart`) and Buildings
  (`home`).
- `curl -sL https://cdn.jsdelivr.net/ghost/portal@~2.51/umd/portal.min.js`, the same for `portal@~2.69`,
  and `https://cdn.jsdelivr.net/ghost/sodo-search@~1.8/umd/sodo-search.min.js` → the `preventDefault()`
  handlers quoted in Design Notes.
- **For R-104**, the same tarball's `tabler-nodes-filled.json`: every filled icon also exists in outline
  under the same name, no outline name ends in `-filled`, filled drawings use only `path` with `d` and
  `fill`, and the filled SVGs wrap them in `fill="currentColor"`; every icon in `icons.json` carries a
  category, some tags are numbers rather than strings, and the whole set — both styles, categories and
  tags — is about 2.5 MB of compact JSON. The heart the owner's test uses exists in both styles; the rocket
  exists in outline only.
- **For R-103**, `A1-4 Overlay.dc.html:86` draws the no-value lock, and `prd.md:222` (FR-D5) with `:631`
  (§7.4) make a template an ordered list of sections, each compiled as its own partial and none placed
  inside another.
- **R-103 re-checked on the owner's challenge, the same day** — every category's spec and drawn panel,
  swept by descriptor tuple (`python3 tools/export-roster.py`: every design whose ground is `transparent`,
  and the `overlay`, `sticky` and `edge rail` archetypes) and by text (`transparent`, `over the hero`,
  `overlap`, `sticky`, `pinned`, `floating`, `Background role` near `LOCKED`). Something other than the
  page sits behind: A1·4, the hero (`A1 Headers - Spec.md:319-321`); A6·13's card, the footer (`A6 CTA
  Banners - Spec.md:681`, `:719`); every pinned or floating bar or card — A1's sticky headers
  (`A1 Headers - Spec.md:211`, `:347`), A2's sticky bars, 10 Pill and 11 Toast (`A2 Announcement Bars -
  Spec.md:56-66`, `:556`, `:604`), A3·16, A22·14, A24·13, A29·14, A32·11 and A34·7; and A32, A33 and A34,
  which render inside the article or the feed (`A32 Paywall - Spec.md:49`, `:401`; `A25 Post Content
  Layouts - Spec.md:212-213`). In every one the see-through look comes from a locked row, the design's own
  ground or a control of its own, and no drawn row offers a see-through choice.

**What ran at Dev, 2026-09-13:**
- **Real services (R-82).** Dev touched none of Supabase, Vercel, Resend, Dodo, T1 `ghost6.inflozo.com` or
  T3 `ghost5.inflozo.com`: the story adds no table (no Schema
  phase under R-99), calls no Ghost, and its deployed screen does not exist until this push reaches
  production, so the walk on `https://app.inflozo.com/controls`, the throttled 100 ms measurement, the
  signed-out 307/303 control and the Vercel READY check are the Review run's, listed above. The one external
  service Dev reached is the **npm registry**: `python3 tools/vendor-icons.py` downloaded
  `https://registry.npmjs.org/@tabler/icons/-/icons-3.46.0.tgz`, matched its `sha512` to the pinned
  integrity, found an MIT `LICENSE`, and wrote the set with the licence beside it; a second run wrote
  byte-identical files (`sha256sum packages/library/icons/*` unchanged, the `captured` date kept).
- `PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH pnpm check` → exit 0: lint and typecheck clean,
  every package's tests pass — `controls.test.ts` carries one test per I/O-matrix row, each asserting both
  emitters; `agreement.test.ts` and `ad36.test.ts` carry the new vectors, each inert with its legitimate
  case working; `tools/stress/test-vocabulary.mjs` passes, including "every refusal code the validator can
  return has a test that it fires" and "the on-disk controls sample validates clean".
- `cd tools/stress && node build.js && node gate.js theme` → Ghost 5.x via gscan 4.49.7 and Ghost 6.x via
  gscan 6.4.2, both ERRORS 0 WARNINGS 0. (`npm install` there failed on a file permission; the installed
  `node_modules` was current and the gate ran.)
- `python3 tools/doc-audit.py --check`, twice → the first run regenerated the story board, the second PASS
  with 0 warnings.
- **In a local browser, not yet the deployed site:** owner's-test steps 2–16 walked with Playwright on the
  dev server, keyboard-only included, against a temporary unguarded copy of the page (deleted afterwards —
  a local session could not be signed in). axe-core at WCAG 2.1 AA: zero violations at 390 and 1280 px. A
  content re-render took about 1 ms, and about 4.5 ms under 4× CPU throttle. The walk found the icon
  picker's popover opening above the viewport, fixed in `apps/web/components/kit/select.tsx`. These are
  local figures; the acceptance criteria's measurements are the deployed page's, at Review.

**What ran for the owner's four findings, 2026-09-13** (a scratch Playwright harness, the passkeys harness's
`load_env` and `Admin` imported, keys read into the process by name only):
- **Supabase Auth Admin API** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`), once per run: `POST /admin/users` →
  200, `POST /admin/generate_link` (magiclink) → 200, the fixture signed in through `/auth/confirm`, then
  `DELETE /admin/users/<id>` → 200, and the user count read before and after — 9 and 9, so nothing leaked.
- **Before the fix, on production** — `https://app.inflozo.com/controls` at `af369c2b`, 1440×900: the canvas
  iframe `border-box`, `clientHeight` 988 against a document of 990 (a 2 px inner scroll range); a 400 px wheel
  over the canvas moved the canvas 2 px and the page 0; the panel 48 px from the right edge with a 12 px
  radius and 530 px tall; the Link popover's right edge at 1449 of 1440. Each finding reproduced.
- **After the fix, on the local dev server** (`next dev` with `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`,
  the real Supabase project) — every check PASS: inner scroll range 0 px, and the same wheel moved the page
  320 px and the canvas 0; the panel 0 px from the right edge, top 0, 900 px tall, radius 0, a 1 px left
  border, 280 wide; the changed control's reset is an icon with no text and it leaves once pressed; Collapse
  hides the panel and focuses Show controls, Enter restores it and focuses Collapse controls, and the canvas
  refits with a 0 px range; the Link popover at 1092–1432 of 1440, with its control — anchored at the
  trigger (left 1177) it would have ended at 1517; axe-core at WCAG 2.1 AA zero violations at 1440 and 390.
- `pnpm check` → exit 0 after the fix.
- **After findings 1–4 were fixed, on production** — **Vercel** `GET /v6/deployments` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`,
  `VERCEL_PROJECT`) → the production deployment for `166f87d0` READY; the same harness against
  `https://app.inflozo.com/controls` → every check PASS with the local figures above (inner range 0 px, the wheel
  moving the page 320 px and the canvas 0, the panel flush at 0 px, 900 tall, square, 280 wide; the reset an
  icon; collapse and expand with focus following; the Link popover at 1092–1432 of 1440 against a 1517 control;
  axe zero violations at 1440 and 390), and the Supabase fixture user deleted with the count back at 9.
  Negative control, signed out: `curl -sI https://app.inflozo.com/controls` → 307 to `/sign-in`,
  `/controls/frame` → 303.
- **Findings 5 and 6, before, on production at `166f87d0`, with real scrollbars** (Chromium launched without
  `--hide-scrollbars`): collapsed, the canvas carried a 15 px scrollbar at a 0 px range at 1440, 1536 and
  1920; the window scrolled 436 px (1440) and 526 px (1536, 1920) beside the panel.
- **Findings 5 and 6, after, on the local dev server** (the real Supabase project, same fixture sign-in, users
  9 → 9): at 1440×900, 1536×864 and 1920×1080, expanded and collapsed, the window's scroll range 0 px, the canvas
  showing its 8 px bar exactly when it has something to scroll (a 281–503 px range), and the canvas filling its
  pane to 24 px above the window's foot; a 400 px wheel over the canvas scrolled the canvas 281 px and the
  window 0; with Content open the panel 900 px tall at the right edge, square, 280 wide, an 8 px bar, and a
  wheel over it scrolled the panel 300 px and the window 0; findings 1, 3 and 4's checks still PASS; axe-core
  at WCAG 2.1 AA zero violations at 1440 and 390, with a positive control — an image with no `alt` injected
  into the same page is reported as `image-alt`.
- **Findings 5 and 6, after, on production** — Vercel's production deployment for `776790c2` READY; the same
  real-scrollbar harness against `https://app.inflozo.com/controls` → all 29 checks PASS with the local figures
  above (window range 0 px at every width, expanded and collapsed; the canvas bar present exactly when there is a
  range; the wheel scrolling the canvas 281 px and the window 0; the panel scrolling itself 300 px; findings 1, 3
  and 4 still held; axe zero violations at 1440 and 390 with its `image-alt` control caught); the Supabase fixture
  deleted, users 9 → 9; signed out, `/controls` → 307 to `/sign-in` and `/controls/frame` → 303.
- **Findings 7 and 8, before, on production at `d25b194a`** (same fixture sign-in, users 9 → 9): searching "e"
  and "the" in both Link fields left the popover off the window every time — top 451 and bottom 1335 (79 rows),
  top 653 and bottom 1293 (76 rows); the check for finding 8 did not reach the category list on that run (its
  row locator matched the drag handle), and was corrected before the fix was measured.
- **Findings 7 and 8, after, on the local dev server** (the real Supabase project, users 9 → 9): all 11 checks
  PASS — both Link fields, both queries, the popover wholly inside the window (8–648 and 252–892 of 900) with its
  search field visible; the Category list 320 px tall with 42 rows, scrolling inside its own list, on screen
  (183–503), its last category, Zodiac, reachable and chosen; and the 29 workspace checks for findings 1–6 re-run
  with no FAIL.
- **Findings 7 and 8, after, on production** — Vercel's production deployment for `786829c9` READY; against
  `https://app.inflozo.com/controls` the same 11 checks PASS with the local figures (popovers 8–648 and 252–892 of
  900, the search visible; the Category list 320 px, 42 rows, scrolling inside itself, Zodiac reached and
  chosen), and the 29 workspace checks for findings 1–6 re-run with no FAIL; the fixture users deleted, 9 → 9.
- **Finding 9, on the local dev server** (the real Supabase project, users 9 → 9), five features on the list:
  control — no slot before any drag, and the canvas's five titles readable; dragging row 4 up to position 2 and
  row 1 down to position 4, each time a dashed, `aria-hidden` slot one row tall showed at exactly the landing
  row's original top (341 and 427), that row had slid aside (341 → 384, 427 → 384), the drop produced exactly
  the predicted order on the canvas, and the slot was gone with every row back on its resting top; `⌥↓` still
  moved a row one place — 12 of 12 PASS. The first run of this check read no titles (a class name from the unit
  test's inline markup, not the sample's) and its order checks failed; it was corrected, and each order check
  now also requires five titles and an order that differs from the start.
- **Finding 9, on production** — Vercel's production deployment for `bed27dc3` READY; the same check against
  `https://app.inflozo.com/controls` → 12 of 12 PASS with the local figures (slots at 341 and 427, rows slid to 384,
  the predicted orders on the canvas, `⌥↓` intact); the fixture user deleted, 9 → 9.

**What ran at Review, 2026-09-13** (`tools/probe/run-verify-controls.cjs`, `SUPABASE_URL` and
`SUPABASE_SECRET_KEY` read into the environment by name; HEAD `4ea84461`, before the review's patches):
- **Vercel** `GET /v6/deployments?target=production` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) → the
  newest production deployment `4ea84461` READY.
- **Negative control, signed out:** `curl -sI https://app.inflozo.com/controls` → 307 to `/sign-in`;
  `/controls/frame` → 303 to `/sign-in`.
- **Supabase Auth Admin:** users before 9; `POST /auth/v1/admin/users` 200, `POST /auth/v1/admin/generate_link`
  (magiclink) 200, signed in through `/auth/confirm`, `DELETE /auth/v1/admin/users/{id}` 200; users after 9.
- **The owner's test, steps 1–18, on `https://app.inflozo.com/controls` at 1440×900 with real scrollbars → 78
  of 78 checks PASS, no page error.** The panel flush at 0 px, 900 tall, 280 wide, square, a 1 px left border,
  the window's scroll range 0 and the canvas scrolling inside its frame with an 8 px bar; the Quick Controls
  card holds Columns · Card style · Alignment · Show icons · Rule under heading and the groups run Content ·
  Arrangement · Style · Data; no `px`, `%` or hex anywhere in the panel with every group open; Columns 3 → 2 → 3
  with the icon-only reset appearing and leaving; Centre greys Rule under heading with its sentence and forces
  `data-rule="none"`, Left restores `line`; Style runs Card tint → "There is no image focus here." → Background
  role → Vertical spacing → Top divider, Accent and Image greyed, "Dark override" on Background role only,
  Contrast → `data-bg="contrast"`; "2–6 · 3 used", Add to 6 then greyed with its sentence, Remove to 2 then the
  floor sentence in `role="status"` that clears on the next change; mid-drag a dashed `aria-hidden` slot with the
  next row translated aside and the canvas order swapped on the drop; **keyboard-only:** Tab reaches a handle,
  `⌥↓` moves it, the polite live region reads "Moved to position 2 of 2" and focus follows; the icon picker opens
  at Outline · All categories, scrolls its grid without closing, finds "heart" under Shapes, Filled shows only
  `heart-filled`, Both shows both, the solid heart lands on the card, "Tabler Icons · MIT" at the foot; the link
  picker finds "The night shift at the Port of Algeciras" under Posts, the chips run Sign up · Sign in · Account
  · Upgrade · Ghost search, new tab and the three rel toggles appear for a post and not for Upgrade, which reads
  "Portal · Upgrade / account/plans"; the Archive URL row appears on the canvas and leaves on Remove link;
  `2026-11-01` with "Site time zone: Etc/UTC"; Replace swaps the picture; Show 5 · Oldest lists five titles
  oldest first, matching the canvas, "+ Add post" greyed with the Ghost sentence; Reset this design restores
  columns, alignment, background and the three newest posts while the two features, the icon, the date and the
  link stay; Collapse folds the panel with focus on "Show controls", Enter restores it with focus on "Collapse
  controls", and a reload brings the sample back.
- **axe-core 4.12.1 at WCAG 2.1 AA:** zero violations at 1440 and at 390; positive control — an `<img>` with no
  `alt` injected into the page is reported as `image-alt`.
- **4× CPU throttle** (CDP `Emulation.setCPUThrottlingRate`): Fewer Columns dispatched with a
  `requestAnimationFrame` sentinel armed first — `data-columns` read `2` immediately after the synchronous
  dispatch with the sentinel unfired, so the attribute is written in the input's own task; three eyebrow edits
  re-rendered the content in 4.0, 3.3 and 3.2 ms (`data-render-ms`), the whole handler under 14 ms — inside the
  100 ms NFR-1 asks for.
- **Ghost:** no code under review reaches a Ghost API; T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com` were
  not called. **No migration**, so no R-99 schema check was owed.
- After the review's patches: `pnpm check` green (lint, typecheck, every package's tests, the new proofs
  included), `node gate.js theme` ERRORS 0 WARNINGS 0 on both majors, `python3 tools/doc-audit.py --check` PASS.

**Manual checks (if no CLI):**
- The review page beside the frames the first acceptance criterion names, both at the sidebar's width:
  the groups in order, each control's anatomy, the greyed row, the absent note, the two lists, the link
  popover and the icon picker.

## Owner's manual test

The app is at `app.inflozo.com`. This page is internal — nothing links to it and search engines are told
to ignore it — so it is reached by typing its address. **Nothing on it is saved**: reloading brings back
the sample. Deploy records the deployment it runs on under "## Verification".

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|-----------|------------|---------------------|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in as you normally do. | — | Your dashboard. |
| 2 | `https://app.inflozo.com/controls` | Controls review | Type the address into the browser. | — | On the left, a sample section: a small line "This week at Orbit Weekly", the heading "Seven links, checked by hand", a picture, three feature cards with small icons, a "Read the latest issue" link and a "From the archive" list of three post titles. On the right, a panel flush against the window's right edge and as tall as the window, with square corners: the sample's name at its top beside a small panel button, then a white card holding Columns, Card style, Alignment, Show icons and Rule under heading; below it the headings Content, Arrangement, Style and Data; "Reset this design" at the very bottom. Nowhere a pixel size, a percentage or a colour code. The page itself never scrolls: the section scrolls inside its own frame and the panel scrolls on its own, each with one slim scrollbar and no arrow buttons. |
| 3 | same | Panel, white card | Press − beside Columns, then press the small reset arrow that appears beside its name. | — | The cards re-flow into two columns the moment you press, and a small curved arrow appears beside Columns (hovering it says "Reset Columns"). Pressing it brings back three columns, and the arrow goes away. |
| 4 | same | Panel, white card | Set Alignment to Centre. Press Line under "Rule under heading". Set Alignment back to Left. | — | The heading centres, and "Rule under heading" turns grey with "Not available while the heading is centred." under it; pressing Line does nothing. Back at Left, the rule returns as it was. |
| 5 | same | Panel, Style | Open Style. Press Contrast under Background role, then press Accent. | — | Card tint; a grey note beginning "There is no image focus here."; then Background role, Vertical spacing and Top divider. Background role shows five swatches — Base, Surface, Accent, Contrast, Image — with Accent and Image grey and "This design is drawn for plain grounds, so accent and image are not offered." under them, and a small moon with the words "Dark override" beside its name; Card tint has no moon. Contrast turns the section dark at once; Accent does nothing. |
| 6 | same | Panel, Content → Features | Open Content and find Features. Press "+ Add feature" until it stops working. | — | "2–6 · 3 used" beside Features, and three rows each with a handle, a name and a "…" button. Every press adds a card reading "A new feature" with a star; after the sixth, the button goes grey with "The row holds 6 features. Remove one to add another." |
| 7 | same | Features | On any row press "…" then Remove, until two remain; then press Remove once more. | — | Cards disappear one at a time. At two, Remove still presses but nothing disappears: "A feature row needs at least 2 features." appears under the list instead, and goes away after your next change. |
| 8 | same | Features | Drag the bottom row up to the top by its handle. Then press Tab until a row's handle is highlighted and press Option+Down (Alt+Down on Windows). | — | While you drag, the row lifts and a dashed empty box shows where it will land, the other rows sliding aside; the cards on the left follow the new order when you drop. With the keys, the row moves down one place. |
| 9 | same | Features | Press a row's name to open it and press its Icon. Scroll the grid a little, then type in the search. Switch Outline · Filled · Both to Filled, then to Both, and press the solid heart. | `heart` | At the top: Outline · Filled · Both, set to Outline, and "All categories". The icons sit under Tabler's category names — Animals, Arrows, Badges and on. Searching shows the outline heart under Shapes; Filled shows the solid heart instead; Both shows the two side by side. Pressing the solid heart puts it on that card. The picker's foot says "Tabler Icons · MIT". |
| 10 | same | Content, "Read the latest issue" | Press its Link field and type in the search. Pick the post, then press Done. | `night` | A Posts group listing "The night shift at the Port of Algeciras", then the chips Sign up · Sign in · Account · Upgrade and a Ghost search chip. After picking: "Open in new tab" and three Rel switches, and the field then shows the post. |
| 11 | same | The same Link field | Open it again, press Upgrade, press Done. Open it once more, press Ghost search, press Done. | — | First the field reads "Portal · Upgrade" with `account/plans` under it — never "upgrade" — and no new-tab or Rel options were offered. Then it reads "Ghost search". |
| 12 | same | Content, Archive link | Paste the address into its Link field, press the "Link to …" row that appears, then Done. Open it again and press Remove link. | `https://orbit-weekly.example/archive/` | "Browse the archive" appears on the section only once the link is set, and disappears again when it is removed. |
| 13 | same | Content, Next issue | Pick another day in the calendar. | 1 November 2026 | The section shows 2026-11-01 — the plain stored form; a written-out date is a later story's. Under the field, the site's time zone: Etc/UTC. |
| 14 | same | Content, Picture | Press Replace and choose another picture. | — | The section's picture changes. |
| 15 | same | Panel, Data | Open Data. Set Show to 5 and Order to Oldest. | — | "From the archive" lists five titles, oldest first. In the panel the posts are grey, and a grey "+ Add post" reads "These come from Ghost, so there is nothing to add here." — you choose how many and in what order, never which. |
| 16 | same | Panel foot | Press "Reset this design". | — | Every setting returns to how it started — three columns, Left, Base background, three posts newest first — while the words you changed and the features you added stay. |
| 17 | same | Panel, top | Press the small panel button beside the sample's name. Then press the same button on the thin strip left at the right edge. | — | The panel folds away to a thin strip and the section widens to fill the space, with no extra scrollbar appearing; pressing the strip's button brings the panel back as it was. |
| 18 | same | Whole page | Reload the page. | — | Everything is back to the sample. Saving arrives with the editor. |

If a step shows something different, note its number and what you saw — those are fixed inside this
story (R-80), not later.

## Owner's test findings

Tested on `https://app.inflozo.com/controls` on 2026-09-13, on the Dev deployment (`af369c2b`), before
Review. Four findings, each reproduced on production before it was fixed and fixed inside this story (R-80).

1. **The "Reset" words beside changed controls should be icons, to keep the panel minimal.** *Whose:* this
   story's — no frame draws a per-control reset, so its look was this story's extrapolation. *Fixed:* the
   Kit's Undo glyph in a 20 px icon button named "Reset <label>" (`apps/web/components/controls/sidebar.tsx`);
   Epic 5 mounts the same component, so the editor inherits it.
2. **The canvas had a scrollbar of its own, and the wheel over it would not scroll the page.** *Measured on
   production:* the canvas document was 2 px taller than its window (990 against 988), and a 400 px wheel over
   it moved the canvas 2 px and the page 0. *Cause:* the iframe was sized to the section's height, but the
   app's `box-sizing: border-box` spent 2 px of that on its border. *Fixed:* the height adds the border and
   rounds the section's height up (`controls/review.tsx`'s `fit`). *Superseded by finding 6's fix, which
   removed the sizing altogether.*
3. **The panel should be a sidebar like the left menu: flush to the right edge, no rounded corners, with a
   collapse button.** *Whose:* the look is S4c's — the editor's Controls sidebar is drawn 280 wide, flush
   right, a hairline on its left, paper, square (`S4 Editor.dc.html:337`); the review page had drawn it as a
   rounded card 48 px in from the edge. *Fixed:* docked at the viewport's height, scrolling on its own, the
   sample's name at its top. The collapse has no frame at full width; it is D8's Layers rail and panel glyph
   mirrored (`D8 Editor Below 1440.dc.html:194`), with focus moving to the button that replaces the pressed
   one. **The editor's own Controls sidebar is Story 5.1's**, and whether it collapses at full width is
   recorded for that story as DW-114.
4. **The Link field's panel opened too far right and was cut off.** *Measured on production:* its right
   edge at 1449 of a 1440 window. *Cause:* every picker popover is anchored at its trigger's left edge and
   is wider than a sidebar field. *Fixed:* `openPopover` (`apps/web/components/kit/select.tsx`), which every
   picker opens through, slides a popover left until it fits inside an 8 px gutter.

Tested again the same day, on the Fix deployment (`166f87d0`). Two more findings.

5. **Collapsing the panel put scrollbar arrows in the canvas; expanding it took them away.** *Measured on
   production with real scrollbars* (Playwright hides them unless told otherwise): collapsed, the canvas
   carried a 15 px vertical scrollbar at a 0 px scroll range, at 1440, 1536 and 1920. *Cause:* the section
   grows taller as it widens, so a canvas sized to its own section settles with the scrollbar showing —
   without it the section is a few pixels too tall, with it the section fits. *Fixed by finding 6's change:*
   nothing is sized to the section any more.
6. **Two scrollbars side by side on the right — the panel's and the page's — "looks really bad"; how do
   other page builders do it?** *Measured:* the window scrolled 436 px at 1440 beside the panel's own scroll.
   *How builders do it, and how Inflozo's own editor is drawn:* the editor is a workspace exactly the height
   of the window that never scrolls, and each pane scrolls itself — the canvas inside its own frame, the
   settings panel on its own. That is Webflow's, Framer's and Shopify's theme editor's shape, and it is S4's:
   a 1440×900 frame whose canvas pane fills its height (`S4 Editor.dc.html:28`, `:62-63`), with Story 5.22's
   "the canvas keeps its own scroll". Not a decision of the owner's, because the frame already draws it.
   *Fixed:* `controls/review.tsx` is that workspace at `tablet` and up — the window never scrolls, the canvas
   iframe fills its pane and scrolls inside itself, the panel scrolls on its own; below `tablet` the canvas is
   70 % of the screen's height over the stacked panel. Both scrollbars are a slim 8 px bar with no arrow
   buttons, drawn with `::-webkit-scrollbar` — the standard `scrollbar-width: thin` still drew arrows in
   Chromium on Linux, checked on a plain test box, and Chrome ignores the `::-webkit-` rules on an element
   that sets the standard ones. The canvas-sizing code from finding 2 was deleted.

Tested a third time the same day, on `776790c2`. Two more findings.

7. **Searching in the Link field adds a long list with a scrollbar, and the top of it cannot be seen.**
   *Measured on production:* searching "e" in the Link field listed 79 rows and ran the popover from its trigger
   to a bottom edge at 1335 of a 900 window (the Archive link's, 76 rows, to 1293); opened upward from low in
   the panel, the same growth runs past the top. *Cause:* `openPopover` placed a popover once, when it opened,
   and a search result list grows it afterwards. *Fixed:* `openPopover` keeps a popover inside the window
   every time it changes size (a `ResizeObserver` while it is open) — it slides rather than flipping, so it
   does not jump sides as the user types; and the link popover keeps its search at the top and the chosen
   destination with Done at the foot, with only the results scrolling between them
   (`apps/web/components/controls/link-picker.tsx`).
8. **The icon picker's Category list is very long.** *Measured:* 42 rows, the height of the window. *Fixed:*
   every Kit menu is at most 320 px — about nine rows — and scrolls inside its own box, so its border and
   radius stay whole; a select opens with focus on the row in force, so a long list opens scrolled to it
   (`apps/web/components/kit/select.tsx`'s `Menu` and `Select`). The icon grid's scrollbar, still drawn with
   arrows, now takes the same slim bar — one Kit class, `slimScrollbar` in `components/kit/greyed.ts`, for the
   panel, the link results, the menus and the grid.

Tested a fourth time the same day. One more finding, and one question answered.

9. **Dragging a feature works, but nothing shows where it will land; every editable list should show a
   dotted empty space.** *Whose:* this story's — P0-3 draws the drag handle and the tilt but no drop state, so
   the gap was the build's. *Fixed:* while a row is dragged, a dashed slot the size of the row, in the Kit's
   own dashed border (the "+ Add" button's), sits where it will land, and the rows between slide aside; nothing
   reorders until the drop. The rows are translated rather than moved in the DOM, so the dragged handle keeps its
   pointer capture and focus, and the slot is read against where the rows stood when the drag began, so it
   never chases rows that are already sliding (`apps/web/components/controls/item-list.tsx`). *For every other
   list:* the rule is written into EXPERIENCE.md § State Patterns ("Reordering by drag"), and DW-116 carries it
   to Story 5.4's Layers and Story 5.19's hand-picked list.

*Asked:* whether the canvas's icon picker, its text controls and inline editing are later stories. Checked in
`epics.md`: selection and click-to-edit are Story 5.2's, inline editing with the four-mark toolbar and link
search Story 5.3's — but opening the icon picker from an icon on the canvas is in no story. Logged as DW-115;
**ruled: Story 5.3 (owner, 2026-09-13)**, and the criterion is written into `epics.md` Story 5.3.

*Asked alongside finding 4, and answered in the session:* whether this page is only a picture of how controls would
look. The sample section is made up — it exists to exercise every kind of control — but the panel is not a
mock-up: its components and the engine behind them are the ones Epic 5 mounts in the editor, and every real
section draws its own settings through them.

## Questions for the owner

### Q1 — Does every section's Background row offer a sixth choice, "None — show whatever is behind"?

Every section has a Background row. The product document gives it five choices from your style pack:
**Base, Surface, Accent, Contrast and Image**. This story writes that list once, for the whole library,
and your rulings disagree about a sixth:

- **27 August (R-23):** "An Inherit value is refused", and the two designs that had one lose it.
- **29 August, when the Comments designs were drawn:** the row gains a new value — "None: show whatever
  is behind" — "available in every category", replacing the word Inherit.
- **30 August, when the Archive Headers designs were drawn:** "there is no 'Inherit' choice anywhere …
  the product is not being asked for a 'same as the page' value."

The product document still lists five.

**An example.** The Comments design "10 Slim" is drawn with its background locked at **None**. With
five choices it is locked at **Base** instead. On a real page the two look the same, because what sits
behind a section is the page itself, and the page is painted in Base.

**The options:**

1. **Five choices, no "None" (RECOMMENDED).** Matches the product document, R-23, your later 30 August
   ruling and this story's own checklist. Slim is locked at Base when the Comments designs are built,
   and looks the same. No section carries a swatch that usually looks exactly like Base.
2. **Six choices, "None" added everywhere.** Matches the 29 August ruling and the Slim drawing. The
   product document, the control table and R-23 are rewritten to say so, and every section shows six
   swatches, two of which usually look alike.

**Ruled: option 1 (owner, 2026-09-13).** Five choices and no "None" — recorded as **R-103**.

He asked in return whether "None" looks the same as "Base", and then — rightly — challenged the first
answer, which said it did "on every page". **Checked across every category on 2026-09-13** (the sweep is
under "## Verification"):

- **For a section in the normal stack of the page, yes.** Sections are placed one after another, never
  inside one another (`prd.md:222`, `:631`), so the page is behind them, painted in the style pack's
  background colour — the colour Base is (`packages/section-runtime/src/tokens.ts:21`; R-23 named that
  swatch Base). The "no ground of its own" designs all sit here — Comments Slim, the Big Type designs, the
  full-bleed gallery and video, Tag Collections' Slim — and their drawings that imagine being "dropped
  inside" a panel describe a placement Inflozo does not have.
- **Not everywhere, and that is where the first answer overreached.** The header drawn over the hero
  picture (A1·4 Overlay) has the hero behind it; A6·13 Overlap's card hangs over the top of the footer;
  everything that pins or floats has scrolling content behind it — headers and announcement bars set to
  Sticky, A2·11 Toast, A3·16 Mini Bar, A22·14 Slide-in Card, A24·13 and A29·14 Sticky, A32·11 Sticky Bar,
  A34·7's pinned pill; and the paywall, pagination and card treatments render inside the article or the
  feed.
- **None of those takes its see-through look from the Background row.** Each is locked with its reason
  (A1·4: "Transparent over the hero is this design", `A1-4 Overlay.dc.html:86`; A22·14: "None — the card is
  its own plane", `A22-14 Slide-in Card.dc.html:67`), keeps a solid or 92–94% ground of its own, or has its
  own control — and his own rulings refuse see-through while pinned (`A1 Headers - Spec.md:347`, `A2
  Announcement Bars - Spec.md:66`). **No design anywhere lets a person choose a see-through ground from the
  row**: every "None" or "Transparent" in the drawings is a locked row describing the design. So five
  choices takes nothing away, and where "None" would look different it would be the option those rulings
  refuse.

**The consequence built here:** a design whose look is what is behind it locks the row with no colour
marked and its own sentence, as A1·4 draws it — A22·14, A15·5, A14·9, A16·10 and Slim (A28·10) draw the same
lock in their own words — and its root carries no `data-bg`; a design that merely paints no ground in the
stack may lock at a colour instead (A20·14 at Background), which looks the same on the page. **Slim is
therefore built locked with no colour marked, rather than locked at Base as option 1 above said.**

### Q2 — Which icons does the icon picker offer?

The rulings say the picker offers "a curated set from Tabler Icons" that includes the nine social
networks Ghost stores, but nobody has chosen which icons are in it. Tabler has 5,130 outline icons today
(version 3.46.0, checked on 13 September), filed under 41 categories of Tabler's own. The picker is drawn
with six filters: All, Arrows, Interface, Media, Commerce and Social.

**An example.** Someone building a features row wants an envelope for "Email us", a map pin for "Visit
us" and a rocket for "Launch". Tabler files those under Communication, Map and Map — none of them one of
the drawn filters.

**The options:**

1. **Every Tabler outline icon except its brand logos, plus exactly the nine social networks
   (RECOMMENDED).** About 4,700 icons, chosen by one rule nobody has to keep up. Search finds anything,
   and the filters use Tabler's own categories. The editor loads about 1.2 MB of icon drawings when the
   picker opens; a customer's site only ever carries the icons actually placed on it.
2. **A hand-picked set of about 400**, like the drawn picker's "Search 420 icons". Smaller and quicker to
   browse, but someone chooses every icon, you review the list, and a customer will sometimes look for an
   icon that is not there.
3. **Only Tabler's categories that match the drawn filters — Arrows, System, Media and E-commerce — plus
   the nine networks.** About 1,400 icons and about a third of that download, also chosen by rule, but it
   leaves out everyday icons such as the envelope, the map pin, the heart and the house.

**Ruled: option 1, widened (owner, 2026-09-13):** *"Every tabler icon - grouped by how tabler does it in
category. Include Outlines and Filled icons too. User should be able to choose from Filled/Outline/Both and
then also see icson grouped by Categories."* Recorded as **R-104**.

What that builds:

- **Every icon Tabler publishes, its brand logos included** — each outline drawing, and the filled drawing
  of every icon Tabler also draws filled — each under the category Tabler files it in. There is no curated
  subset.
- **Outline · Filled · Both** at the top of the picker decides which styles show; the picker opens at
  Outline, the style the drawn picker shows. **All categories** and each of Tabler's own categories replace
  the six drawn filters, which cannot hold them, and the grid is grouped under Tabler's category names.
- **Two consequences, both handled.** The drawn "Social" group of exactly nine gives way to Tabler's Brand
  category, and the nine-platform rule stays with the social-link rows that read Ghost's nine fields. And
  the set is about 2.5 MB of drawing data, which the editor loads only when the picker or the canvas first
  needs it; a customer's site still carries only the icons placed on it.
