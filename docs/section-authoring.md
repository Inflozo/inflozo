# Authoring a section

**The contract every one of the library's designs is written against.** A section is **annotated
HTML** — plain, valid HTML carrying `data-*` directives — plus its own flat stylesheet, the behaviour
modules it declares from FR-G7's registry, and two schemas. One source, two renderers: the canvas DOM and the `.hbs` text.
They agree **by construction**, not by comparison, which is the whole reason the source is HTML and
not Handlebars (PRD §7.3).

A section file **opens directly in a browser during authoring and renders as plain HTML**. That is
most of why annotated HTML won, and it is a property to preserve: if a directive would stop a file
rendering on its own, it is the wrong directive.

- The contract as data and code: `packages/library/src/` — `vocabulary.ts` (the closed directive
  set, the control vocabulary and the allow-lists), `registry.ts` (the types and the assembly),
  `validate.ts` (the refusals), `icons.ts` (the vendored Tabler set, its own `@inflozo/library/icons`
  subpath), `modules.ts` (FR-G7's registry as code reads it, `bundle` and `checkThemeJs` — Story 4.7).
- The behaviour modules: `packages/library/modules/` — `core.js`, `registry.json`, and one file per
  feature module as its first category writes it *(Story 4.7)*.
- The browser floor: the pin in the root `package.json`, the Tier-2 allowlist in
  `packages/library/baseline.json`, the stylesheet rules in the root `stylelint.config.mjs`, and
  `tools/check-baseline.mjs`, which proves them against each other *(Story 4.8)*.
- The controls engine: `packages/section-runtime/src/controls.ts` — the sidebar, the edits and the one
  resolution both emitters stamp *(Story 4.5)*.
- The runnable reference: `packages/library/fixtures/reference-design/` — every directive, once. The
  controls sample, `packages/library/fixtures/controls/`, is the section the internal controls review
  page renders beside its panel.
- **The designs** *(Story 4.10)*: `packages/library/designs/{category}/content.json` and
  `packages/library/designs/{category}/{n}/` — `index.html`, `style.css`, `design.json`. **The directory is the
  design list**; nothing else names the designs. The first five are the pilots (PRD §8), each `"provisional": true`
  (AD-35): authored ahead of its category's gate, its snapshot expected to change once more when its category story
  re-authors it, and never edited by another epic — a defect found in one is raised against its category. The
  internal `/pilots` review page draws them beside the panel.
- **The snapshots** *(Story 4.10, NFR-6(c1))*: `packages/library/snapshots/{category}/{n}/template.hbs` and
  `partials/{name}.hbs` — each design's compiled theme text with its content and controls at their defaults,
  **generated, never edited**: `node tools/check-snapshots.mjs --update` writes them, and the same check without
  the flag (last in `pnpm test`, so in CI) fails on any drift, naming the file and its first differing line. They
  sit beside the designs, not inside, because Epic 7's formatting (Story 7.1) re-baselines them without touching a
  design. One snapshot per design: a section never opens `{{#post}}`, so its text does not vary by target, and the
  check renders every `compileTarget` against the one file — and runs `checkBindings` at each (DW-130).
- The controls: `node --test` in `packages/library`, and `node test-vocabulary.mjs` in `tools/stress`;
  the engine's proofs are `controls.test.ts`, `agreement.test.ts` and `ad36.test.ts` in
  `packages/section-runtime`.

> **⚠ Writing a literal Handlebars expression into an example.** The design export's kits carry this
> warning and it applies to any file Claude Design renders: a bare `{{ … }}` is a value hole and
> renders **empty**. Write it with zero-width entities — `{&#8203;{` — inside a `.dc.html` frame.
> In this document and in a `.hbs` snippet inside a fenced code block it is safe as it stands.

---

## 1 · The registry entry

FR-G3's entry is

```
{ id, category, name, tier, bindingContext, compileTarget, contentSchema, controlSchema,
  html, css, js?, dataBindings?, ghostCompat, darkCapabilities, previewSeed }
```

**An entry is ASSEMBLED, never authored.** Nothing in the tree is a file shaped like the list above.
It is built — `assembleEntry()` in `registry.ts` — from four inputs:

| Input | What it contributes |
|---|---|
| the design's directory path, `designs/{category}/{n}` | `id`, `category` |
| the design's `design.json` | `name`, `tier`, `bindingContext`, `compileTarget`, `controlSchema`, `universals`, `absent`, `dataBindings`, `ghostCompat`, `darkCapabilities`, `previewSeed`, and AD-35's `provisional` |
| the **category's** `content.json`, at `designs/{category}/content.json` | `contentSchema` |
| the design's `index.html` and `style.css` | `html`, `css` |
| recovered from `index.html`'s `data-module` names, in registry order, omitted when there are none *(Story 4.7)* | `js` |

(`design.json` is the third authored file and has its own row. The entry also carries the structural
descriptor tuple, so FR-G5's "no two designs in a category share one" has something in the registry
to read.)

So **"registry entry" and "`design.json`" are different lists**, and reading one as the other is the
mistake this section exists to remove. `design.json` carries no `id` — identity is the path, and an
authored id is a second source that can disagree with it.

**Identity is `{categoryId}/{n}` and is stable forever.** `a17/1` is that design for the life of the
product; renaming it, re-tiering it or redrawing it does not move it.

**`contentSchema` is the category's union. `controlSchema`, `universals` and `absent` are per
design** — the assembly carries `universals` as `{}` and `absent` as `[]`
when a design declares none. A registry entry therefore describes **one design against its category's
shared content model**. The category's **control** union is the other direction and is **generated,
never authored**: `categoryControlUnion(designs)` in `registry.ts` builds it from the designs' own
lists and refuses one control name with two types, carrying two value sets, or sitting in two groups, naming both designs
(FR-F7, R-53, R-113) — where two designs genuinely differ, they differ by name. The row title a customer reads sits
where the register files it for that design (§2).

**Nothing is pinned above the settings groups** *(the owner's ruling R-113, Story 4.10's test, 2026-09-15)*. FR-G3
once carried `quickControls[]`, recovered from the first three to five entries of a design's control list and drawn
as a card above the accordions. It is withdrawn: a control's place in the panel is its `group` (§2), and its place
inside that group is its place in `controlSchema`.

### The rule of the content model — R-102

> **A content prop never crosses a category boundary.** The category's union is the widest a prop
> ever reaches.

Owner's ruling, 2026-09-11 (Story 4.1 Question 1, option 1: *"each section keeps its own words"*).
Two categories that ask for the same thing each carry their **own** prop. A Newsletter section's
signup heading and a Footer's signup heading are two props with two values; a customer who wants the
same words in both types them twice.

There is **no shared prop, no shared namespace to hang one on, and no cross-category carry.** The
refusal is the load-bearing half: a shared prop would mean editing a footer silently rewrites a
section on another page, and it would leave a customer who wants the footer's signup to read more
tersely no way to separate them at all. When `email*` or `newsletter*` turns up in a second
category's union, the answer is to declare it again there — not to reach for a shared namespace.

---

## 2 · The two authored files

### `design.json` — one per design

```json
{
  "name": "Three-up cards",
  "tier": "free",
  "bindingContext": ["posts", "tags"],
  "compileTarget": ["home.hbs", "index.hbs", "tag.hbs", "author.hbs"],
  "controlSchema": [
    { "name": "cols",  "type": "stepper",      "label": "Columns",             "group": "layout",
      "values": ["2", "3", "4"], "default": "3" },
    { "name": "card",  "type": "segmented",    "label": "Card style",          "group": "style",
      "values": ["flat", "outlined", "raised"], "default": "raised" },
    { "name": "post-details", "type": "named-select", "label": "Post details", "group": "content",
      "values": ["none", "date", "author-date"], "default": "author-date",
      "valueLabels": { "author-date": "Author and date" } },
    { "name": "align", "type": "segmented",    "label": "Alignment",           "group": "layout",
      "values": ["start", "center"], "default": "start",
      "valueLabels": { "start": "Left", "center": "Centre" } },
    { "name": "badge", "type": "toggle",       "label": "Editor's pick badge", "group": "content",
      "values": ["on", "off"], "default": "on" },
    { "name": "rule",  "type": "segmented",    "label": "Rule under heading",  "group": "style",
      "values": ["none", "line"], "default": "none",
      "disabledBy": { "control": "align", "whenValue": "center", "inForce": "none",
                      "reason": "Not available while the heading is centred." } }
  ],
  "universals": {
    "bg": { "values": ["base", "surface", "contrast"],
            "reason": "This design is drawn for plain grounds, so accent and image are not offered." }
  },
  "absent": [
    { "group": "style",
      "note": "There is no image focus here. This design places your photograph at its own shape, so nothing is cropped and there is nothing for focus to choose." }
  ],
  "dataBindings": {
    "latest": { "source": "posts", "filter": "featured:true", "limit": 9, "order": "published_at desc" }
  },
  "ghostCompat": { "minVersion": "5.0.0", "helpers": ["foreach", "get", "img_url", "date"] },
  "darkCapabilities": ["tokens"],
  "previewSeed": "orbit-weekly",
  "provisional": false,
  "descriptor": {
    "archetype": "feed", "containment": "none", "ground": "surface",
    "itemCount": "many", "mediaPlacement": "top",
    "emphasis": "the first card is flagged, and nothing else is emphasised"
  }
}
```

**`bindingContext` and `compileTarget` are sets, not scalars.** `sections-inventory.md` already
declares them as sets in its own normative prose — *"`bindingContext: tags` (+ `posts` on the
designs that show them)"* — and FR-D12 / FR-D13 filter by **intersection**, which a set answers and
a scalar cannot. Both are written in **every** `design.json` — a category's designs usually share
the set, and FR-G3's "per design where a category's designs differ" is answered by each design
carrying its own; there is no category-level field to declare them once.

**`bindingContext` takes ten values and there is no `page`:**
`none · post · posts · tag · tags · author · authors · tiers · error · private`.
A page and a post are the **same resource** — on `page.hbs` Ghost's root carries `post` and `page`
as two keys onto one object. What genuinely differs is the **product**, and that is `compileTarget`.
`@site` and `@member` are universal and narrow nothing.

**`compileTarget` is a refusal, not a hint (R-7).** `any` is withdrawn wherever it was a lie. Legal
targets are `default.hbs · home.hbs · index.hbs · post.hbs · page.hbs · tag.hbs · author.hbs ·
error.hbs · private.hbs`, plus `custom-{name}.hbs` for a membership or Routes-Manager template.
Two restrictions are enforced at validation, not left to render:

- a design emitting **pagination** is restricted to paginated targets (`home` · `index` · `tag` ·
  `author`). Outside them `{{pagination}}` is a **fatal render**, not a warning.
- a design performing a **`{{#get}}`** excludes `error.hbs` and `private.hbs`. An error page that
  queries the database compounds the outage it is reporting.

**A control is one attribute on the section root, and it is closed-valued.** Every control writes
`data-{name}="{named-value}"` on the root and the design's stylesheet selects on it. No free text,
no units, no hex outside the Style Pack, and no per-section width. A control that declares a
dependency carries **the reason** in the schema (R-33), so the sidebar greys it and prints that one
sentence, the validator refuses the value and the compiler never emits it — from one source.

#### Controls — the closed half *(Story 4.5)*

**Controls and content are two halves of one vocabulary.** The control **types** below are the only
things that write the root, and each is held to a closed value grammar. Everything a customer
types, links, picks or lists is a **content prop** in `content.json`, edited by one of the content
editors in the next part and held to its own value shape. Nothing else is a control: a text, a link, a
picture, an icon, a date or a list declared in `controlSchema` is refused as `control-type`.

The vocabulary is data in `packages/library/src/vocabulary.ts` — `CONTROL_TYPES`, `CONTROL_GROUPS`,
`UNIVERSALS`, `BACKGROUND_ROLES`, `CSS_WIDE_KEYWORDS`, `CONTROL_CAP` — and **one engine reads it for
the sidebar, the validator and both emitters** (FR-F7): `packages/section-runtime/src/controls.ts`'s
`resolveControls` is the only thing either emitter stamps on a root.

| `type` | Panel control | Value grammar |
|---|---|---|
| `segmented` | Segmented Control — pills | lowercase kebab words — `start`, `author-date` — and **two to four of them, each short enough for its pill** (R-114, below) |
| `named-select` | Named Select — a dropdown | lowercase kebab words; every choice too long for pills is one, and a short one may be |
| `stepper` | Stepper | ascending **consecutive** integers, as strings — `"2" · "3" · "4"`; never a unit and never a gap |
| `toggle` | Toggle | exactly `on` and `off` |
| `swatch-row` | Swatch Row | the pack's roles only — `base · surface · accent · contrast · image` (`BACKGROUND_ROLES`); never a colour |

Every control declares:

- **`name`** — kebab-case, because it becomes `data-{name}`. A name whose attribute is already a
  directive (`items`, `prop`) or Ghost's own `data-portal` is refused: the attribute must mean nothing
  but the control.
- **`label`** — the row title the panel prints, in words.
- **`group`** — the accordion its **role** names (R-113): `settings` · `content` · `layout` · `style`. The
  panel draws Section Settings, Content, Layout, Style and Data in that order; *Which group a setting sits in*,
  below, is the decision. **Data** is not a control group: a declared query's rows fill it.
- **`values`** and a **`default`** among them. **No CSS-wide word anywhere in a declaration** —
  `inherit`, `initial`, `unset`, `revert`, in a value, a default, a `valueLabels` key or a dependency
  — and so no `Inherit` (FR-F2, R-23).
- **`valueLabels`**, optional — the words the panel prints where a value is not already its own word
  (`start` → "Left"). An unlabelled value prints as itself with its first letter raised and hyphens as
  spaces, which is why `post-details` above labels only `author-date`. A label for a value the control does not
  have is refused as a typo.
- **`darkOverride`**, optional — the control is mode-scoped and accepts a second value in dark mode
  (FR-D7); the panel draws the moon badge with the words "Dark override" only once one is stored
  (FR-F5).

**A dependency greys, and names the value that renders while it does.** `disabledBy` is `{ control,
whenValue, reason, inForce }`: while the named control's value in force is `whenValue`, this control is
greyed with `reason` in its caption slot (P0-0, R-33), **`inForce` is the value both emitters stamp**,
and the customer's own stored value is kept and returns when the other control changes back. Setting a
greyed control answers with its reason and changes nothing. `inForce` is always one of the control's
own values; a dependency on itself, on a control the design does not declare, on a value the other
control does not have, or round a circle of two or more is refused.

**The cap is one design's own controls.** More than `CONTROL_CAP` in one `controlSchema` is refused
(FR-F3's ≈15); the universal trio and the Data group are not counted.

**The three universal controls — `bg`, `spacing`, `divider` — are declared once, never per design,
and in full** (`UNIVERSALS`). They sit on every section root — R-103's no-value lock below is the one
absence — are exempt from the cap, and each names its `group` like any control: all three are how a section
looks, so the panel draws them as one block at the foot of Style (R-113, whose ruled example names them there).

| `name` | Label | Type | Values | Default |
|---|---|---|---|---|
| `bg` | Background role — mode-scoped | Swatch Row | Base · Surface · Accent · Contrast · Image — **five, and no sixth** (R-103) | Base |
| `spacing` | Vertical spacing | Segmented | Compact · Comfortable · Spacious | Comfortable |
| `divider` | Top divider | Segmented | None · Line · Fade | None |

A `controlSchema` never lists one; one there is refused as a redeclaration. A design **narrows** a universal in `universals`, by name — `{
values, default?, reason }`: `values` is a subset of the universal's own, `reason` is the sentence the
panel prints, and a `default` is needed only when the narrowing drops the universal's own. Renaming,
inventing and an `Inherit` value are all refused (R-23). In the panel the values a design does not
offer are **greyed inside the live row** with its sentence; a narrowing to one value locks the whole
row at that value.

**The no-value lock (R-103).** A design whose look *is* what is behind it — a header drawn over the
hero, a card that floats over scrolling content — narrows Background role to **`"values": []`** with
its reason and no default:

```json
"universals": { "bg": { "values": [], "reason": "Transparent over the hero is this design." } }
```

The row is drawn locked with **no role marked** and the sentence under it (`A1-4 Overlay.dc.html`),
`resolveControls` returns no entry for it, and **its root carries no `data-bg`** — the validator
refuses one written on the root, and neither emitter handed the schema stamps one. A design that
merely paints no ground of its own in the normal stack may lock at a value instead (`"values":
["base"]`), which looks the same on the page. Never a "None" and never a sixth role: a word in the value slot reads as a value.

**Absent, not greyed.** A control this design could **never** use is not drawn, and its group carries
one note where it would have been (P0-0, R-68): `absent` is a list of `{ group, note }`, the group one
of `settings · content · layout · style · data`, the note a sentence. The panel prints it after the group's
own controls and before the trio. It does not grey, because nothing switched it off and nothing brings
it back.

**A query is declared here and referenced by key from the markup** — never written into an
attribute. That is what makes AD-36's "validated, never interpolated" hold by construction: there is
nowhere in the markup a filter could be composed. A key is a lowercase identifier and never a source
name (`posts`), which a `data-repeat` would read as a context path; every declared query must be
referenced by a `data-repeat`, so a misspelt key (`latst`) fails as an unreferenced declaration. The
query's `limit` is the only limit: a `data-repeat-limit` on the same element is refused as a second
copy of one number. **R-20's hand-picked order** is `"ids": ["…", "…"]` in place of `filter`,
`limit` and `order` — one single-id get per entry, in that order, with no cap; the panel warns
past 25 (Story 5.19's Source panel), the validator does not.

**R-108's fixed query** *(Story 4.10)* is `"fixed": true` beside a declared `limit` **and** `order` — a hero
that always shows exactly one post: `{ "source": "posts", "limit": 1, "order": "published_at desc", "fixed":
true }`. A `filter` may sit beside it — `fixed` fixes the number and the order, nothing else. The design fixes its number and its order, so the panel offers no Show and no Order for it, and a
Count or Order stored under the same key (another design's, carried back by Story 5.11's shuffle) is never
folded in — `withData` treats it exactly as it treats `ids`. The theme's `{{#get}}` is the ordinary one; `fixed`
is the editor's, never Ghost's. Refused (`bad-get-fixed`): `fixed` that is not `true`, `fixed` beside `ids`, and
`fixed` without both `limit` and `order`.

#### Which group a setting sits in — R-113 *(Story 4.10, the owner's test)*

**Every setting sits in the accordion its role names, and nothing is pinned above them.** The panel draws Section
Settings, Content, Layout, Style and Data, in that order, each only when it holds something. The owner's words:
Content is "any content changes", Style "any visual/design changes", Layout "any layout changes", Data "controls to
choose source of data", and Section Settings holds only a setting that fits none of those. His ruled example is the
reading every other decision follows: Three Up puts its words, **Excerpt**, **Meta** and **Tag** in Content, **Per
row** and **First cell** in Layout, and **Image ratio** with the three universal controls in Style; Rail puts **On
scroll** alone in Section Settings, "which is how the header behaves, not its content, look or layout".

**Decide by asking, in this order — the first yes wins.** A behaviour is none of the first four, even when it draws
something (a close button, a lightbox), because the owner's own example sets it apart as "how the header behaves, not
its content, look or layout" — so each question below is about a setting that is not a behaviour.

1. **Data** — does it choose *which* Ghost content fills a list or a slot, how many or in what order? Where a list of
   items comes from (posts, tags, authors, staff, tiers, the site's navigation), a filter, the tag or author a list
   draws from, hand-picked posts, a count or order of Ghost items, what a query does when it finds nothing. A
   declared query's rows are the Data group; a design's own control never is (`control-group` says so).
2. **Content** — does it change *what* the visitor reads, sees or can press? A part shown or hidden, how much of a
   text shows (lines), which details or words appear, where one value comes from (typed, or the site's own
   description or member count; "From the excerpt · Off"), how many of the items already there show, and every
   authored text, link, picture and list.
3. **Layout** — does it change *where* things sit, or how far the section reaches, with the same content and the same
   look? Columns and items per row, alignment, which side a picture or a column sits on, the order and position of
   parts, splits, a cell spanning columns, the width or height of the section or of a region in it — a band, a bar, a
   cover, a tile, a card, a column — whatever its values are called, bleed against contained, how much one part
   overlaps another, how many items stay in view before the rest fold into another place in the section.
4. **Style** — does it change *how it looks*? The size of a thing inside the section (type, icons, avatars,
   thumbnails), image ratio and crop and focus, the treatment of cards and planes, rules, dividers, markers,
   shadows, scrims and tints — and where such a decoration sits (Rule: None · Above the tag · Below the meta) — the
   form a part takes (Button · Text link; Dots · Numbers; Outline · Solid), hover appearance, a picker of a design
   for a part, and **all spacing** — padding, gaps, insets, density, and a row's height or a band's inner depth that
   is its padding — because the ruled example puts Vertical spacing here.
5. **Section Settings** — none of the four: how the section *behaves*. What happens over time, while scrolling or on
   interaction, or who and where it is shown to: sticky or shrink on scroll, autoplay, loop, speed, count-up and
   reveal motion, a lightbox on click, dismissible, open on load, where a form sends what it collects, what one member
   state is shown, what the section does when the site has members or commenting switched off, member visibility
   wherever a panel carries it (the Layers panel or this one is Story 5.4's to settle).

**The tie-breakers.**

- **A setting that mixes Off, None or Hide with other values takes the role of what its other values change.**
  Avatar: Off · Small · Medium · Large is Style; Excerpt: Off · One line · Two · Three is Content; First cell: Off ·
  Spans two columns is Layout. A plain On · Off or Show · Hide of a part is Content — unless the part is a
  decoration (a rule, a scrim, a shadow), which is Style, or a behaviour, which is Section Settings.
- **Judge by the values and what the setting does, never by its title.** The export gives one title different
  settings in different categories — "Order: Newest · Oldest" chooses Ghost's rows (Data), "Order: Value first ·
  Label above" arranges a stat (Layout) — so **a title holds one group within its category**, except on a design the
  register names, and nothing holds a title across categories. **A control's `name` is the author's own word, and it
  holds one type, value set and group across the whole library** (R-53 as ruled, `categoryControlUnion` handed every
  design): two settings that differ take two names, as Centred's author line is `byline` beside Three Up's `meta`.
  The words a value prints are each design's own, from its frame — the export prints `center` as Centred on A22 #1
  and as Centre on A24 #1 — so R-53 compares values, never their words.
- **A region's size is Layout; the space inside or between is Style.** A band's, bar's, tile's or cover's height is
  Layout even on the Compact · Comfortable · Spacious ladder; a row's height that is its padding, a band's inner
  depth, a card's padding and a gap are Style.
- **A pressable part is Content; a decoration beside words is Style.** Dots and arrows that move a carousel are
  Content; an arrow or glyph after a link's words is Style. A different thing to press (a button, or a form with a
  field) is Content; the same thing drawn two ways (Button · Text link) is Style.
- **A list's source is Data; one value's source is Content.** "Source: Authored · From posts" is Data; "Value source:
  Typed · Member count" is Content. How many Ghost items a query fetches is Data; how many of what is already there
  shows ("Tags shown", "Quotes shown") is Content.
- **Who is reading, and what the site allows, is Section Settings; an empty query is Data.** "When members are
  disabled" and "Free members: the prompt only" are Section Settings; "When nothing matches" is Data.
- **Hover appearance is Style; what a click does is Section Settings.**
- **Inside a group, a design's controls keep their declared order**, and a control greyed by another in the same
  group is declared after it (`dependency-order`), so the reason under a grey row points up at a row already read.
  Across groups the panel's group order decides and a dependency is legal — the export's Three Up greys "Three lines"
  at Per row Four, a Layout row below Content — so its reason names the setting that greys it, as every drawn reason
  does. A
  design's root carries its controls in the same order, so declaring them in a new order re-baselines its snapshot.

**The kinds of setting the library has, and where each goes.** Swept from every category of the design export —
the examples are its own titles:

| Group | What it holds | Titles from the export |
|---|---|---|
| **Section Settings** | how the section behaves: over time, on scroll, on interaction, for whom and where | On scroll · Dismissible · Shows on · Speed · Interval · Transition · Count up · Lightbox · Open on load · Sticky head · Collapses to Menu · Member visibility · When a member is signed in · When members are disabled · Where it goes |
| **Content** | what the visitor reads, sees or can press, and where a single value comes from | Eyebrow · Description · Blurb · Excerpt · Meta · Tag · Label · Attribution · Numbering · Controls (Dots · Arrows) · Rail contents · Show date · Rows shown · Value source · Caption (From Ghost · Hide) · Group by · Back to top |
| **Layout** | where things sit and how far the section reaches | Alignment · Columns · Per row · Split · Division · Image side · Rail side · Text position · Head column · Foot · Overlap · Card width · Band width · Band edges · Measure · Height · Band height · Bar height · Nav items before More |
| **Style** | how it looks, and every kind of spacing | Title size · Name size · Image ratio · Crop · Image focus · Scrim · Rules · Divider · Separator · Marker · Cards · Plane · Button · Action (Button · Text link) · Link style · Pagination style · Card padding · Band padding · Inset · Gap · Density · Row height |
| **Data** | which Ghost content fills a list or a slot, how many, in what order, and what the query does when it finds nothing | Source · Content source · Filter · Tag or author · Hand-picked posts · Which post · Count · How many · Batch size · Order · Tiers · Nav children · When nothing matches |

**The register — `packages/library/control-groups.json`.** Every setting the export declares is filed there under its
category and the title the panel prints, with its group; where one design's setting of a title does something else
(A21's "Portrait" is Circle · Rounded square, and on 10 Directory Show · Hide), the entry names that design. It was
made on 2026-09-15 by two independent passes over the whole export against this rule, each disagreement settled into
the rule's words above, and one more sweep for one group per kind across categories (Story 4.10's `## Verification`
records the run). **A category story reads its designs' groups from it.** `tools/check-snapshots.mjs` holds every
built design's control to the entry its title names, and **fails a control whose title has no entry, or whose title
its own frame does not draw** (R-74): the story that gives a setting a title the register does not carry adds it, with
its group, so a setting cannot leave its group by being renamed in the same edit. A title filed under Data is a
query's setting, declared in `dataBindings`, never a control. Each title is the one the design's drawn panel prints
(DW-111) — the check reads the frame's own row, the title with one of the setting's values beside it (a toggle's
switch), so relabelling a setting to another row's title fails — and a labelled group's rows are filed under the titles
the panel prints ("Actions › Sign in" is "Sign in"); a few entries are fields (an icon slot, an authored list), which
are Content wherever they sit.

**When the export's titles would repeat in one panel** (R-13: one panel prints one title once, its accordions'
titles included), the export's usual practice decides which gives way:
- **A setting and a field** — the setting keeps its title and the field takes one of its own, as the export does in
  A27–A32 ("Heading text", "Description text", "Eyebrow text") and A22 #1 does ("Blurb text"). A17's "Title: Large ·
  Display" therefore stays "Title", and A17's Title field gives way when a design with that setting is built. Where a
  frame draws the pair apart another way, its words stand (A4-10's "Show how long it runs" beside its "How long it
  runs" field; A10-12's "Show marker" beside "Marker").
- **Two settings, or a setting and its accordion** — one takes the export's own other title for that setting: A4 #9's
  button style, drawn "Primary action" beside its Primary action toggle, is filed as "Action style" (A6's word), and A34
  #9's "Content" has A34's "Contents". With no other title in the export (A24 #15's and A34 #3's "Layout"), the story
  that builds the design names it. The register files a rename per design —
  `"Action style": { "group": "style", "renames": { "9": "Primary action" } }` — and the frame check reads the drawn row
  it replaces.
- Every such title is the owner's to see, under Questions for the owner (R-83), in the story that builds it. DW-166
  lists the repeats the export draws, category by category.

**Data appears when a design declares a query.** The ruled example also listed "Data — Show, Order" for Three Up; its
feed declares none, so its Data rows arrive with Story 5.19's Source and Count, and today the controls sample is the
panel that shows Show and Order in Data.

#### Pills or a dropdown — R-114 *(Story 4.10, the owner's test)*

**Pills are for short choices.** The owner's words: "Any property where the values are larger … we should show a
dropdown. With these large values, the pill design looks bad." A `segmented` control draws its values as pills of
equal width across the 280-wide panel, so it offers **two to four values, each at most `PILL_CHARS` characters, each
fitting its pill on one line with 2 px to spare either side**; anything else is a `named-select`. The validator
refuses the rest as `pill-words`, naming the value.

- **Characters, as he measures it:** "Spans two columns" is too long for pills (his example); "Flush left · Centred"
  and "Full bleed · Inset" are not — short phrases stay pills. The measure below also refuses his example, but by a
  pixel and a half: the cap is what keeps it a dropdown whatever the panel's width.
- **And a measure, because a word never wraps:** it widens its pill and squeezes the others. Eleven letters fit one
  of three pills as "Comfortable" (73 px, and 2 px either side, in 77.7) and do not as "Wholesomely" (80 px). `pillWidth` sums each
  character's width in the pill's own type, measured on the deployed panel, against the narrowest track the panel
  draws — with its own scrollbar showing. The deployed harness (`tools/probe/run-verify-pilots.cjs`) compares those
  widths with what the browser draws, so a font or size change is caught.
- **Checked against the whole export on 2026-09-15:** of the value sets it draws as pills, only the long phrases
  become dropdowns ("Spans two columns", "Above and below", "Comfortable 44"); the universal controls keep their pills.
- A short choice may still be a dropdown where its drawn panel draws one (DW-111); only a long one must be.
- A stepper, a toggle, a swatch row and a dropdown are never measured.

### `content.json` — one per **category**

```json
{
  "category": "a17",
  "props": {
    "title":      { "label": "Heading", "type": "richtext", "marks": ["strong", "em"], "default": "Latest posts" },
    "subtitle":   { "label": "Subheading", "type": "richtext", "marks": ["strong", "em", "u", "a"],
                    "tokens": ["members"], "default": "Read by {members} people." },
    "nextIssue":  { "label": "Next issue", "type": "date", "default": "2026-10-01" },
    "cta.label":  { "label": "Link text", "type": "text", "default": "View all" },
    "cta.url":    { "label": "Link", "type": "url",  "default": "/archive/" },
    "logos":        { "label": "Logos", "type": "array", "item": "logo", "min": 2, "max": 12,
                      "atMin": "A logo wall needs at least 2 logos.",
                      "atMax": "The wall holds 12 logos. Remove one to add another.",
                      "default": [{ "name": "Harbour Press" }, { "name": "Northline" }] },
    "logos[].src":  { "label": "Logo", "type": "image" },
    "logos[].alt":  { "label": "Logo description", "type": "text", "default": "" },
    "logos[].name": { "label": "Partner name", "type": "text", "default": "A partner" },
    "logos[].icon": { "label": "Icon", "type": "icon", "default": "star" }
  }
}
```

Every prop carries a **`label`**, the field title the panel prints, and a **`type`** — one of the
content editors below (`PROP_TYPES`).

`props` is **flat and keyed by dotted path**. A prop inside an authored repeat is written **in full**
— `logos[].name`, never a relative `name` — which is what lets the markup be read without a tree
walk, and what makes the directive readable on its own line.

**A prop declares which inline binding tokens it accepts, and nothing else in braces is substituted**
(R-27). `subtitle` above accepts `{members}` and only `{members}`; the editor shows exactly that set,
and `{anythingElse}` a customer types stays **literal text**. The token set is closed —
`members · term · n` — and free-form substitution is refused: an untrusted string reaching a
substitution pass is AD-36's subject, and an allow-list by construction is the only shape that
closes it rather than filtering it. A `richtext` prop also carries a per-prop **mark** allow-list
over the four permitted marks — `strong · em · u · a` (AD-4) — and a `url` prop's authored default
must pass the scheme rule as written, since a default is the author's text and not a visitor's.

**Two brace grammars, deliberately.** R-27's tokens are for the **customer's** text in a content
prop, closed to three names. A `{…}` in a **design-authored** directive value — `data-text`,
`data-bind-attr` — is a **binding path** under AD-36's path grammar, because the author is naming a
Ghost value, not typing prose. They share a spelling and nothing else.

#### The content editors — the other half *(Story 4.5)*

A content prop's `type` selects the editor the panel draws for it and the **value shape** it stores.
The controls' closed-value rule is not theirs — a heading is free text, a link is a record, a picture
is an id — and each shape has its own rule instead, enforced where the value is rendered.

| `type` | Editor | What it stores | How it renders, on both emitters |
|---|---|---|---|
| `text` | Text Field | a string | `data-prop` — text; into an attribute through `data-prop-attr` |
| `richtext` | Text Area | a string, or `{ text, marks? }` over the prop's own mark allow-list (AD-4) | `data-prop` — through `marks.ts`'s serializer; a sidebar edit goes through `editText`, which moves the marks with the text rather than dropping them |
| `url` | Link Picker | a **link record** — a bare string is `{ href }` | `data-prop-attr="href:…"` — through `linkAttributes`, below |
| `image` | Image Picker | an **asset id** — `feature-03`, never a URL | `data-prop-attr="src:…"` — the id resolved **only** through `RenderInput.assets` (AD-27(b)); an id with no entry, or a URL stored in its place, is unset |
| `icon` | Icon Picker | a **Tabler icon name** — `rocket`, or `heart-filled` for the filled drawing | `data-prop` on an empty element — drawn inline, below |
| `date` | Date Picker | **`YYYY-MM-DD`**, the site's wall-clock day, stored unconverted (a real calendar day, checked by arithmetic — `isIsoDate`) | `data-prop` prints it as text and `data-prop-attr="datetime:…"` writes it, both unconverted; anything else is unset. A written-out, localised date is a later story's |
| `array` | Item List | a list of item objects | `data-items` — one copy per item (§3, row 1) |

`data-prop` takes `text`, `richtext`, `icon` and `date` props; `data-items` takes an `array`.

**A link is one record, and a `url` prop and an `a` mark hold the same one** (AD-4, FR-F6):

```json
{ "href": "https://orbit-weekly.example/the-night-shift-at-the-port-of-algeciras/",
  "ref": { "kind": "post", "id": "905700000000000000000001" }, "newTab": false, "rel": ["sponsored"] }
{ "portal": "account/plans" }
{ "search": true }
```

Exactly one of `href`, `portal` and `search` is the destination. `portal` is one of the Portal
actions in `PORTAL_ACTIONS` — `signup · signin · account · account/plans`, offered as Sign up · Sign in
· Account · **Upgrade**, which is `account/plans` and never `upgrade`. `search` is exactly
`true`. `ref` is the internal resource the link was picked from, kept for Epic 7's compile-time
re-validation; the render reads `href`. `newTab` and `rel` are part of the **stored** record, `rel`
from `nofollow · noreferrer · sponsored` (`LINK_RELS`), and both act only on an `href` — they could
never act on a Portal modal or the search popup (R-68).

**A link becomes attributes in exactly one place** — `linkAttributes` in
`packages/section-runtime/src/marks.ts`, which the `a` mark and `data-prop-attr="href:…"` both call:

| Record | Emitted |
|---|---|
| `{ "portal": "account/plans" }` | `href="#" data-portal="account/plans"` |
| `{ "search": true }` | `href="#" data-ghost-search` |
| `{ "href": "https://x.example/", "newTab": true, "rel": ["sponsored"] }` | `href` through the scheme rule, `target="_blank"`, `rel="noreferrer sponsored"` — `noreferrer` is added for a new tab, and the list is sorted |
| a Portal action outside `PORTAL_ACTIONS`, a `search` that is not `true`, an empty `href` | **nothing — an unset link** |

`href="#"` is right for Portal and search because both scripts cancel the click themselves (read in
source, `MEASUREMENTS.md` §29c); with JavaScript off nothing happens. `javascript:` and every other
unsafe scheme is `#` (AD-36 1), and a rel outside the list is dropped. **An unset link is an unset
prop**: give a link a customer may leave empty `data-empty="hide"`, and it is absent on the canvas and
in the theme until a destination is set — FR-F8's "renders nothing until a destination is set".

```html
<a class="cx__link" data-prop="archive.label" data-prop-attr="href:archive.link" data-empty="hide">Browse the archive</a>
```

**An icon is Tabler's drawing, inline where it is used, once per use** (R-26, R-104) — no sprite and
no icon font. The runtime is **handed** the lookup — `iconDrawing` from `@inflozo/library/icons`, as
`RenderInput.icons` — and never imports the drawings; a design with an `icon` prop rendered without it
**refuses by name**. The element's content becomes an `<svg>` in Tabler's own wrapper — for an outline
a 24 viewBox, `fill="none"`, `stroke="currentColor"`, stroke 2 with round caps and joins; for a
`-filled` key `fill="currentColor"` — with `aria-hidden="true"`, because a section's icon is decoration
beside its words. **Every `<path>` is rebuilt from attributes that pass their grammar**, so a drawing
carrying anything else is not emitted (AD-36); a name not in the set is an empty slot, removed with
`data-empty="hide"`.

```html
<span class="cx__icon" data-prop="features[].icon"></span>
```

**The set is every Tabler icon, outline and filled** (R-104), each under the category Tabler files it
in. It is vendored data, not a dependency: `packages/library/icons/tabler.json`, written by `python3
tools/vendor-icons.py` from the pinned `@tabler/icons` tarball after checking its integrity and its MIT
licence, with **Tabler's licence verbatim beside it in `packages/library/icons/LICENSE-tabler.txt`**
(and exported as `TABLER_LICENSE`). `packages/library/src/icons.ts` is the code half — `iconDrawing`,
`ICONS` (names, categories and tags, without the drawings), `ICON_CATEGORIES` (derived from the set)
and `filledKey` — on its own `exports` subpath, so importing the vocabulary never pulls the drawings.
An icon prop's authored `default` must be a name in the set.

**An authored list declares its bounds, and says each in a sentence.** On an `array` prop: `item`,
the noun the panel uses ("+ Add logo"); `min` and `max`, whole numbers with the floor at or under the
ceiling and the starting items between them; `atMin`, the sentence Remove answers with at the floor,
and `atMax`, the sentence Add greys with at the ceiling — **each in the category's own words, never
written in code**. A floor above zero needs `atMin`, and a ceiling needs `atMax`; bounds on a prop
that is not an array are refused. At the ceiling Add and Duplicate are refused with `atMax`. **Remove
never greys** (R-12): at the floor it stays active, removes nothing and answers with `atMin`. A new item
lands last carrying its item props' defaults — `logos[].name`'s "A partner" — never an empty shell.
Reorder is drag or `⌥↑`/`⌥↓`, announced as "Moved to position n of N".

**A Ghost-bound repeat is never an Item List** (FR-F1): a `data-repeat` over a declared query gets the
Data group instead — a Count from 1 to 100 (FR-H2) and, for posts, an Order of Newest · Oldest — and
a hand-picked `ids` query has neither, nor has a `fixed` one *(Story 4.10, R-108)*. Both fold into the query
through `withData`, so the canvas rows and the theme's `{{#get}}` read the same numbers.

### `style.css`

Plain CSS consuming **Style Pack custom properties only** — `var(--…)`, flat, no nesting, no
generated class names, no CSS-in-JS, and **explicitly outside any Tailwind processing**: utility
classes are structurally incompatible with token-only styling. Every control appears as an attribute
selector on the root (`.feed[data-cols="3"] .feed__grid { … }`).

#### The browser floor — what a stylesheet may use *(Story 4.8, FR-G8)*

**The floor is a date, not a version list.** It is the root `package.json`'s
`"browserslist-config-baseline": { "widelyAvailableOnDate": "2026-08-18" }` — the one place every tool reads
it, because `browserslist-config-baseline` reads the pin from the working directory's `package.json`. The
browsers it resolves to are printed by `node tools/check-baseline.mjs` and written down nowhere, so no
version list here can go stale. The `browserslist` key itself lives in `packages/library/package.json` only:
browserslist walks up from a file, and a root key would reach the app's `next build`.

**Three tiers.**

- **Tier 1 — Baseline Widely on the pin: unrestricted**, load-bearing, anywhere. `mask-image` is Tier 1
  (`masks` became Widely on 2026-06-07), as are `:has()`, container queries, `color-mix()` and `subgrid` — each a
  legal row `tools/check-baseline.mjs` executes.
- **Tier 2 — the allowlist in `packages/library/baseline.json`.** Baseline **Newly** features, each with the
  date it becomes Widely, recomputed by the check from `web-features`: when the pin passes that date the
  check says "Tier 1, remove it". **One entry is not Baseline at all: `text-wrap: pretty`, kept by name by
  R-105** (no Firefox; ordinary line breaks are the unstyled state). It carries no date, and the day it
  becomes Baseline the check asks for its date. A second feature that is not Baseline needs its own ruling —
  the check refuses one.
- **Tier 3 — everything else.** `pnpm lint` refuses a Tier-3 **property or value** — `scrollbar-gutter`,
  `text-wrap: nowrap`, `animation-timeline`, `anchor-name`, `field-sizing`, `mask-mode` (the stylelint plugin's own
  data passes it; Safari lacks it, so it is refused by name) — and the check diffs the plugin against the pin over
  those rows. **A Tier-3 at-rule form or function is not caught by lint today** (executed at the 4.8 review:
  `@container style(--x: 1)`, `if()`, `sibling-index()` and `random()` all pass — the plugin knows an at-rule by
  its name only, and the diff covers `css.properties`). Until DW-139 closes, review refuses those by reading
  `web-features` at the pin, as it does for a module's APIs.

**Tier 2's conditions are review rules, not lint** — the linter cannot see what a declaration *does*:

- the fallback is the design's **own unstyled state**, and the section is complete and readable without it;
- a Tier-2 declaration carries **no layout, no contrast and no interaction** — nothing is positioned, sized,
  hidden, revealed or made legible by it;
- `backdrop-filter` sits **behind a scrim** that is legible on its own: where the blur is missing, the ground
  goes fully opaque (A3-16's Mini Bar).

**`@supports` may test a Tier-2 property and nothing else** (`inflozo/supports-tier-2`). Tier 1 never needs
a test, and a Tier-3 feature may not hide behind one — the plugin exempts whatever a condition tests. The
one shape it exists for:

```css
.minibar { background: var(--bg-surface); }
@supports (backdrop-filter: blur(1px)) {
  .minibar { background: color-mix(in srgb, var(--bg-surface) 80%, transparent); backdrop-filter: blur(12px); }
}
```

A selector test (`selector(:popover-open)`) or a Tier-3 property (`(animation-timeline: view())`) is refused.

**No nesting** (`max-nesting-depth: 0`, §7.1). CSS Nesting is Widely and still forbidden: the output is flat
and hand-editable. `.a { & .b {} }`, `.a { .b {} }` and `.a { @media (…) {} }` are all refused; write the
`@media` at the root with the rule inside it.

**Vendor prefixes: research §6.6's three, in their complete forms, and nothing else.**

| Need | Write exactly |
|---|---|
| excerpt truncation | `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N; overflow: hidden;` — all three prefixed declarations in one rule (`inflozo/prefix-pairs`); `overflow: hidden` is what makes the clamp visible, and review holds it, not lint |
| iOS text inflation | `-webkit-text-size-adjust: 100%` — no other value |
| non-selectable chrome | `-webkit-user-select: none; user-select: none;` — both, with one value; either alone is refused |

Any other prefix, in any position — a property (`-webkit-font-smoothing`, `-webkit-mask-image`), a value
(`display: -moz-box`), a function (`-webkit-linear-gradient()`), a pseudo-element (`::-webkit-scrollbar`), a
media feature or an at-rule (`@-webkit-keyframes`) — is refused by the rule that owns that position. A font-stack
keyword that starts with a dash is not a prefix: `font-family: 'Inter', -apple-system, sans-serif` — the export's
stack — passes, and the check keeps it passing.

**Run `pnpm lint`** — it runs ESLint and then `stylelint "packages/**/*.css"` with the root
`stylelint.config.mjs`. Ghost's vendored card CSS under `packages/library/orbit-weekly/vendor/` is not
linted: it is Ghost's, as `cards.js` is. `pnpm check` also runs `tools/check-baseline.mjs`, which diffs the
plugin against the pin row by row and proves each tool's control.

**Moving the pin is an owner decision, and it needs a render-matrix re-run** (FR-G8, NFR-6(a)): a later date
widens what every stylesheet may use. So is bumping `stylelint-plugin-use-baseline` or `web-features` —
the check turns either into a named list of rows to review.

### Behaviour modules — `data-module` *(Story 4.7)*

**A design ships no script of its own.** FR-G7 lets a generated theme run registry code only, so a design
**declares** the modules it needs and the compiler bundles them. There is no `behaviour.js`: a module is
written once, in `packages/library/modules/`, by the first category story that declares it (FR-G7(2)),
and every later design that declares it reuses that file.

**Declaring.** `data-module` on the element the module works on — one name per element:

```html
<section class="gal" data-module="lightbox"> … </section>
<div class="foot__cols" data-module="accordion:768"> … </div>
```

The name is a row of research §2.1, whose machine half is `packages/library/modules/registry.json`.
`core` is refused — it is the platform runtime, runs on every page and is never declared — and so is a
retired name (`search-overlay`, `command-palette`, `sort` …), with the ruling that retired it. A name
outside the registry is refused and pointed at the behaviours that need **no** module (FR-G7(5), §2.2):
`<details>`, an in-page anchor with `scroll-behavior`, CSS `columns`, `:has()`, `position: sticky`,
server-side member gating, CSS transitions, `<audio controls>` and Ghost's own pagination.

**A width** *(R-38)*. `name:N` runs the script only while `(width < Npx)` matches — `accordion:768` is
"collapses into sections under 768". N is a whole number of CSS pixels above zero. The module's no-JS
line must describe the state on **both** sides of that width, because above it the no-JS state and the
JavaScript state are the same thing. The stylesheet uses the same query, `@media (width < 768px)`, so CSS
and script flip at the same pixel.

**The union and `js`.** The entry's `js` is the declared names, recovered from the markup in registry
order and omitted when there are none. A theme's `main.js` carries the union of every placed design's
`js` (`moduleUnion`), so removing a design removes its names — unless another placed design declares them
too.

**What a module is handed.** A module file's top level is exactly **one function declaration**, named
for the module in camelCase (`nav-drawer` → `navDrawer`), called once per mount as `(el, ctx)`:

```js
// packages/library/modules/lightbox.js — a future module's shape
function lightbox(el, ctx) {
  const dialog = el.querySelector('dialog')
  el.querySelector('.gal__close').setAttribute('aria-label', ctx.t('close'))
  el.addEventListener('click', (e) => { if (e.target.closest('a.gal__img')) { e.preventDefault(); dialog.showModal() } }, { signal: ctx.signal })
}
```

| `ctx` | What it is |
|---|---|
| `signal` | aborts when the mount stops — pass it to every listener, and nothing leaks |
| `t(key, params)` | the mount element's `data-i18n-<key>`, with `{name}` filled from `params`; `''` when absent, and a placeholder with no param left as written (appendix H1 S5) |
| `observe(target, callback, { root, rootMargin, threshold })` | one shared `IntersectionObserver` per root, `rootMargin` and `threshold`; the target is unobserved when the mount stops |
| `reducedMotion` | true while `(prefers-reduced-motion: reduce)` matches — for motion that is incidental, such as a carousel's smooth scroll |

Nothing reaches a global it was not handed: `el.ownerDocument`, never `document`. Lint enforces the
letter of it — `no-undef` over `packages/library/modules/*.js` refuses a bare `window`, `document` or
`setTimeout` — and review holds the rest, since `el.ownerDocument.defaultView` is the window by another
road. `bundle` refuses a file whose top level is anything
but its one declaration — an `export`, an `import`, a second function or a statement.

**The floor reaches a module only partly by lint** *(Story 4.8)*. `compat/compat` (eslint-plugin-compat)
runs over the same files against the pin — from the repo root only: started anywhere else, ESLint refuses to run,
because the pin is read from the working directory — and it sees **bare globals only** (`lintAllEsApis: true`
changes nothing; executed): it refuses `requestIdleCallback`
and `window.ImageCapture` at Safari 17.2, and misses `win.ImageCapture`, `Object.groupBy`,
`Promise.withResolvers`, `AbortSignal.any()` and every instance method — so it never sees what `core` hands a
module as `win`. **Every other platform API a module uses is read against `web-features` at the pin before it
is used**, and the reading is recorded with the module, as MEASUREMENTS §42 did for `core` — which is how
`AbortSignal.any()` was found Newly, so Tier 3, and never used. On a module, `no-undef` already refuses the same
bare global; what `compat/compat` adds is the browser's name, and its real job is the check's control that the pin
reached the toolchain.

**`js-enabled` is on the mount, never on the page.** `core` sets the class on the element whose module
it mounts, **before** the module runs, and removes it when that mount stops or throws. JavaScript off,
suppression while editing, a reduced-motion stop and a width outside the declaration therefore all leave
that element in its no-JS CSS branch. Select on it in `style.css` (`.gal.js-enabled .gal__close { … }`),
and never write it into markup — the validator refuses it.

**Editing** *(R-21)*. A module whose `editSafe` is **no** in research §7 is not mounted on the canvas, and
its section renders at rest. The values are §7's, transcribed into the registry, never decided per design.

**The motion gate** *(FR-G4)*. `core` holds one `(prefers-reduced-motion: reduce)` query. A module whose
registry row `animates` is not started while it matches, mounts when the preference clears and stops when
it returns — because for each of those modules its reduced-motion state **is** its no-JS state. A module
whose reduced-motion state would differ from its no-JS state cannot use the gate; raise it before writing it.

**`main.js`.** `bundle(names, sources)` writes it: a header naming `core` and the modules, then one
wrapping function with `'use strict'` holding each file verbatim, `core` first, then
`core(window, rows)`. It is a **classic** script loaded `defer` (FR-J4) — never an ES module, because a
file carrying `export`, concatenated in, would be a SyntaxError that silently turns every site to its
no-JS state — and nothing in it lands on `window`. A module that appends markup carrying `data-module`
(`load-more` is the first) must add a rescan of what it inserted to `core`; today `core` scans once.

**`assets/js/`.** `checkThemeJs(files, sources)` is FR-G7(1) as one check: a theme's `assets/js/` holds
`main.js`, byte-identical to `bundle` of the names its header lists over the repo's own sources, and
Ghost's `cards.js`, and **nothing else**. `cards.js` is the one declared exception — Ghost's MIT card
behaviour shipped back to a Ghost site (FR-J4) — and it has its own row in research §7: with JavaScript
off the audio and video cards show no working player, the toggle stays closed and gallery rows lose
their proportions; it is edit-safe.

**The licence filter**, for any future proposal to bundle code Inflozo did not write: **MIT,
BSD-2-Clause, BSD-3-Clause, Apache-2.0 or ISC only**, re-verified **at the pinned version** rather than
trusted from the package's reputation — `typed.js` relicensed MIT → GPL-3.0 at 3.0.0 (research §5). The
answer today is zero: every module is vanilla, and the check above makes that literal.

## 3 · The directive vocabulary

Every directive, its grammar, what each emitter does with it, and an example. The set is **closed**:
a `data-*` attribute that is not below and is not a declared control on the root is refused by name.

### The proven eight

**`data-empty` is an OVERRIDE, not a switch** *(Story 4.2)*. FR-H8 says the unguarded state is
unreachable, so **every** Ghost binding compiles inside a guard whether or not a design writes
`data-empty`, and the behaviour **defaults by kind**: a text binding defaults to `fallback` (the
static value the prop held), and a binding into a URL-valued attribute — `href`, `src`, `poster` —
defaults to `hide`, guarding the **element** and never the attribute. On a **text** binding, writing
`data-empty` picks the other; a **media** binding always hides, and `data-empty="fallback"` on one
is refused *(Story 4.6)* — see *The media rule* below. The guard is always the **bound field**, never a
helper argument, and a field the context matrix types `number` guards as `{{#if f includeZero=true}}`
when the render names its template *(Story 4.6)*. On a list-form
`data-bind-attr` the media case is **any** entry into a URL attribute, and the element is guarded on
that entry's field. A **content** prop into a URL attribute (`data-prop-attr="src:hero"`) is not a
binding and keeps the authored placeholder when unset; `data-empty="hide"` hides it. The canvas falls
back wherever Handlebars' `{{#if}}` would — `''`, `0`, `false` and `[]` are all empty — and a
`data-empty` value outside `hide`/`fallback` is refused, not ignored.

**Not every directive below is rendered yet, and the rest REFUSE rather than leak.** Story 4.2's
runtime emits the proven eight plus `data-bind-style` and `data-module`; **Story 4.3 added
`data-bind-srcset`, `data-helper` and `data-pagination`**, the three the Ghost helper shim owns; and
**Story 4.5 added `data-items`**, the authored list (row 1 below); **Story 4.6 added
`data-initials`**, the typed avatar (see *The avatar's two forms*); **Story 4.9 added `data-t` and
`data-t-attr`**, the catalog's strings (exit 3); **Story 4.10 added `data-if` / `data-else` and
`data-members`**, rows 3 and 4 (exit 2). Everything else in the set throws
with a sentence naming the directive, until the story that owns it lands. The partition is derived from this vocabulary and asserted by a test, so a directive added
here cannot be silently forgotten by the runtime.

These were executed in the stress harness and keep their names and grammar unchanged; since Story 4.2 the implementation is `packages/section-runtime` and `tools/stress/compile.js` is a thin adapter over it.

| Directive | Grammar | Canvas | Theme |
|---|---|---|---|
| `data-prop` | a content prop path | the customer's literal text into the DOM; an `icon` prop's inline `<svg>` *(4.5)* | a marker, spliced into the emitted string after serialization; the same `<svg>` for an `icon` prop |
| `data-initials` *(4.6)* | a content prop path to a **`text`** prop the user types | the first letter of the first and of the last word — "Jane Doe" → JD, "Madonna" → M — through `data-prop`'s user-text path; an empty name keeps the authored text, or hides with `data-empty="hide"` | the same initials, baked at compile as a marker; refused inside a `data-repeat` |
| `data-prop-attr` | `attr:path` list, `;`-separated | the value onto the attribute; on `href` a link record through `linkAttributes`, on an `image` prop the asset id through `assets` *(4.5)* | the same, through the marker path |
| `data-bind` | `path` or `path\|helper:arg` — a helper always takes its argument | the Ghost value, resolved | `{{path}}` / `{{helper path param="arg"}}` |
| `data-bind-attr` | `attr:spec` list, `;`-separated | the resolved value onto the attribute | the mustache, carried through serialization as an opaque token |
| `data-empty` | `hide` · `fallback` — `fallback` on a text binding only | `hide` removes the element; `fallback` keeps the authored text or attribute | `hide` wraps the element in `{{#if field}}`; `fallback` emits `{{#if field}}…{{else}}<authored>{{/if}}`; a `number` field adds `includeZero=true` |
| `data-repeat` | a Ghost context path, or a `dataBindings` key | expands against real rows | `{{#foreach …}}` / `{{#get …}}` |
| `data-repeat-limit` | 1–100 | slices the rows | `limit="n"` on the block |
| `data-partial` | a partial name | ignored | extracts the body to a parameterless partial |
| `data-bind-style` | `--custom-property:spec` | the value through `safeCssColor` — hex, `rgb()`/`hsl()` or the pack's accent token; a **named** colour is not parsed and falls back too | `style="{{#if field}}--prop: {{path}}{{/if}}"` — the value is Ghost's at render |
| `data-module` *(4.7)* | a registry module name, optionally `:N` — the width in CSS pixels below which it runs | **kept** on the element, parsed; a bad value refuses | **kept** on the same element — `core` mounts on it on the live page |

**The three the shim owns** *(Story 4.3)*. Each is asserted against **recorded real-Ghost output**
from both majors — `packages/ghost-shim/fixtures/`, captured by `python3 tools/probe/record-shim.py`
— so the canvas column below is a recording and not a description.

| Directive | Grammar | Canvas | Theme |
|---|---|---|---|
| `data-bind-srcset` | `path\|img_url` — the size list is the shim's | one candidate per `image_sizes` key, at the recorded sized URLs | `srcset="{{img_url path size="xs"}} 150w, …"`, one candidate per key from the one map |
| `data-helper` | one of the bare helpers | the shim's resolved value, as a **text node**; `navigation` builds Ghost's own `<ul class="nav">`; `content`/`comments` render Story 4.4's fixture and **refuse** without one (FR-H3); `content_api_key` is an inert placeholder | the helper's own mustache — `{{content}}`, `{{total_members}}`, `{{content_api_key}}`; double braces, never triple |
| `data-pagination` | `prev` · `next` · `numbers` | `prev`/`next` get the resolved `page_url` and the element is removed where the page does not exist; `numbers` shows `page / pages` | `prev`/`next` emit `href="{{page_url pagination.prev}}"` inside `{{#if pagination.prev}}`; `numbers` emits `{{pagination.page}} / {{pagination.pages}}` |

Three things the review of Story 4.3 settled about those rows, each read in Ghost's own source
(`helpers/excerpt.js` at both target versions, `meta/generate-excerpt.js`): **`data-bind="excerpt"`
is Ghost's helper, not the field** — it prefers `custom_excerpt`, escapes the text (a `<em>` in a
custom excerpt prints literally, on the site and on the canvas), never truncates a custom excerpt and
cuts a computed one to 50 words; `data-bind="custom_excerpt"` is the plain field, and so is any
**dotted** form (`post.excerpt`, `../excerpt`), because Handlebars only calls a helper for a bare
name. `words=`/`characters=` cannot be passed through `data-bind` — the helper takes no argument in
the binding grammar. **`data-bind-srcset`
refuses `data-empty="fallback"`** *(refused since Story 4.6; it used to be swallowed)* — a candidate list
is the media case, so the guard always encloses the element, and an `<img>` carrying both `src:…|img_url:l` and `data-bind-srcset` on the
same field gets **one** guard. **A `dataBindings` entry with `ids`** compiles to one `{{#get}}` per
id, in the picked order (R-20), each around its own `{{#foreach}}` — use `data-partial` so the body
is emitted once and referenced from each.

**`data-pagination` restricts the design to a paginated target and the runtime refuses otherwise**
(R-7): a `{{pagination}}` outside a paginated context is a FATAL render, not a warning, so a render
that does not name a paginated target is refused rather than compiled. **`numbers` emits the page
indicator, not a list of numbered page links**, and the reason is Ghost's: the pagination context
carries `page` and `pages` and Handlebars has no way to loop a range, so numbered links would have
to be an Inflozo partial counting something Ghost does not expose. **R-109 (owner, 2026-09-15) settled
it: there is no row of clickable page numbers.** `numbers` stays the "5 / 11" indicator — exactly what Ghost
prints, the same on both majors and on the canvas — and A34's category story redraws A34 #1 Numbers to it
(DW-97 closed). `{{#match}}` compares numbers and `{{page_url n}}` takes one, so a short row is buildable but
inexact with no arithmetic; that is the option R-109 declined.

**`img_url`'s size argument is one of FR-J2's five `image_sizes` keys — `xs` · `s` · `m` · `l` ·
`xl`** — and anything else is refused **by name at bind time**. This is not strictness for its own
sake: Ghost generates a rendition per declared key and returns the **original** image for any other
`size=`, reporting nothing (gscan does not validate `image_sizes` at all), so a card would serve a
4000-pixel photograph behind a 300-pixel slot on the customer's site with nothing reporting it.
Recorded on both majors: `size="800"` returned exactly what `size=` omitted entirely. The widths
live in `packages/library`'s `IMAGE_SIZES` and are read by the shim, the probe theme and the gscan
harness — never restated.

**Every directive value is validated by this table's grammar before the runtime reads it** *(Story 4.2
review)*: a `data-repeat`, `data-repeat-limit` or `data-partial` value that is not its grammar is
refused by name, never interpolated into `{{#foreach}}`, and a `data-partial` or `data-repeat-limit`
with no `data-repeat` on the element is refused rather than shipped.

```html
<a class="card__link" data-bind-attr="href:url">
  <img class="card__img" data-bind-attr="src:feature_image|img_url:m" data-empty="hide"
       src="/placeholder.jpg" alt="">
  <h3 class="card__title" data-bind="title">A sample post title</h3>
  <time class="card__date" data-bind="published_at|date:D MMM YYYY">14 Mar 2026</time>
</a>
<a class="feed__all" data-prop="cta.label" data-prop-attr="href:cta.url;title:cta.title">View all</a>
```

**`data-prop-attr2` is retired.** It was never normative — FR-G3 and §7.3 name eight directives and
it was not among them; it existed only because an HTML attribute cannot repeat. Both attribute
directives now take a **semicolon-separated list**, which removes a numbered wart from a vocabulary
466 designs are written in. It is refused **by name**, so the message says what to write instead.

**A guard is derived from the bound FIELD, never from a helper argument.** `data-empty="hide"` on
`data-bind="published_at|date:YYYY"` guards on `published_at`. On a list-form `data-bind-attr` the
element is guarded on its **URL entry's** field — `alt:title;src:feature_image` guards on
`feature_image` — and on the first binding's field only when no entry binds `href`, `src` or `poster`;
a guard entry that is a token template is refused, because a template has no single field to guard on. The spike parsed the field back out
of the built expression and took the last token, which is the **format string** — so it emitted a
guard on an identifier that does not exist, the block never rendered, and the content was silently
and permanently lost. A garbage guard is *present*, which is why "is there a guard?" passes while
the page is empty. `guardField()` is the derivation, and it is one function both emitters call.

### Where a binding is legal — the context matrix *(Story 4.6)*

Ghost compiles themes without strict mode, so a binding used where its field does not exist prints an
**empty string** — no error at build, deploy or runtime, and gscan passes it (appendix B.1 §0). FR-H7
makes that a refusal. The rules are one data file, `packages/library/contexts/matrix.json`, proved
against what T1 and T3 printed and against Ghost's own source by `packages/library/src/contexts.test.ts`
(recorded by `python3 tools/probe/record-contexts.py`).

**The scope a design's markup is evaluated in** is its template's, then each enclosing `data-repeat`'s:

| Target | A section's top level is | So at the top level… |
|---|---|---|
| `post.hbs` · `page.hbs` · `custom-{name}.hbs` | **inside the post block the TEMPLATE opens** — `{{#post}}`, never `{{#page}}` | `title`, `url`, `feature_image`, `tags` (a repeat)… |
| `index.hbs` · `home.hbs` | the list root | `posts` (a repeat) and `pagination.*` — **not** `title` |
| `tag.hbs` · `author.hbs` | the archive root | `tag.*` / `author.*`, `posts`, `pagination.*` |
| `error.hbs` | the error root | `data-helper="statusCode"` / `"message"` |
| `default.hbs` | nothing of its own | the universal set only |

The universal set — `@site.*`, `@config.posts_per_page`, and `navigation`, `total_members`,
`content_api_key` as bare helpers — works everywhere, and an `@` path reads the root from any depth.
`@page.show_title_and_feature_image` is legal on the post-block templates and offered only on `page.hbs`
and `custom-{name}.hbs`. A `data-repeat` over a `dataBindings` key opens its source's row scope (a query
over `posts` holds post fields on any template); a context-path repeat opens the list it names; a
`data-items` list opens no Ghost scope. `../` reads one scope up. **`@custom.*` refuses** (theme settings
are FR-Q3's, Epic 7) and **`@member` refuses** (R-28: a member's details are never printed), each with
its own sentence.

**A bare `url` inside `data-repeat="@site.navigation"` is not the item's address** *(recorded on both majors,
Story 4.10)*. `{{label}}` there is the item's field, but `{{url}}` is Ghost's url HELPER, which recognises a
navigation item only when it carries `slug` and `current` — which only `{{navigation}}`'s own partial adds — and
printed `/` for every item. The matrix types it `helper`, so a design binding it is refused by name; link a nav
item through `data-helper="navigation"`, which renders Ghost's own `<ul class="nav">`, and fold or style it in the
stylesheet.

**A section never writes `{{#post}}`.** The template opens it once around every section, because FR-J5's
`<article class="{{post_class}}">` needs post context; a section opening a second would look up `post`
inside the post and print nothing. So one design is one byte-identical text on `post.hbs` and `page.hbs`:

```hbs
{{#post}}<article class="gh-article {{post_class}}">
  {{> "sections/post/a24-1"}}  {{! evaluated in post scope: title, url, feature_image }}
</article>{{/post}}
```

**Two functions answer, and the runtime asks one of them at every render that names its target:**

- `bindable(path, { target, scope, version?, use? })` → `null`, or the refusal sentence. `scope` is the
  enclosing repeats, outer first; `use` is `value` (the default), `repeat`, `condition` or `helper`. A list
  as a value is refused (*a list is a repeat source*), and so is a boolean (*a boolean is a condition*).
- `offerBindings({ target, scope, version? })` → `{ values, repeats, conditions, refused? }` — what Epic 5's binding
  surface may present; `refused` is set, and the three lists are empty, when the place itself cannot be built
  (an unknown target, an enclosing repeat that is not legal there). A list of plain values (`@site.portal_plans`,
  a tier's `benefits`) opens no scope and is offered as nothing. A key newer than the site's `version` is left out (an absent or unparseable version
  is the floor, 5.0.0), and nothing it returns is refused by `bindable` at the same place. **The version
  axis is the offer's:** a design already binding a newer key is not refused at render — on an older
  server the key is absent and the always-present guard hides it.

When `RenderInput.target` is named, both emitters walk the tree, give every Ghost path its scope —
`data-bind`, each `data-bind-attr` entry and each `{path}` of a token template, `data-bind-srcset`,
`data-bind-style`, a context-path `data-repeat`, `data-helper` — and **throw one error naming every
refused binding**. A render naming no target is not checked, as R-7's query refusal already accepts.
`checkBindings(doc, src, { target, dataBindings })` returns the same list without rendering — R-7's two target
refusals first (`data-pagination` off a paginated target, a `{{#get}}` on an error template), then every binding
the matrix refuses — and is the gate a move or duplicate onto another template must pass before it completes
(appendix B.1 §1); it throws without a target. **Pass the design's `dataBindings`:** a `data-repeat` not declared
there is read as a context path, so a query repeat handed no declaration is refused as a field that does not
exist. A `../` path climbs one scope per enclosing repeat, and a `{{#get}}` counts as a frame of its own around
its rows; `../@site.x` is refused — a `@` path reads the root wherever it sits and needs no `../`. No story
offers the move action yet.

**Which directives the walk reads is derived** *(Story 4.10, DW-131)*: every directive whose value names a Ghost
path carries `ghostPath: true` in `vocabulary.ts`, and `contexts.test.ts` fails if a rendered one is not walked —
so `data-if`'s condition, `data-text`'s tokens and every later path-carrying directive are checked like a binding.

**Two recorded facts the matrix encodes.** Inside a post, tag or author, `{{meta_title}}` and
`{{meta_description}}` are Ghost's *page* meta helpers — the site title on a feed — whatever the resource
carries, so neither is a bindable field. And `reading_time` is Ghost's helper over the field: it prints
the rounded "1 min read" (an API value of 0 included, hence the number guard) and prints **nothing** on a
post the visitor may not read, because it counts the body.

### The media rule, and the zero *(Story 4.6)*

**A binding into `href`, `src`, `poster` or `srcset` hides its element, and `data-empty="fallback"` on one
is refused** — by the validator (`media-fallback`) and by the runtime, with the same sentence. The only
fallback an attribute can carry is the design's authored placeholder, `/placeholder.jpg`, a relative URL
that 404s on the customer's site. A picture that falls back to the customer's *other* picture is a second
element — `data-if` / `data-else` once that directive renders. So FR-H8's "chosen per binding" is a text
binding's choice.

**Zero is a value.** Handlebars takes `{{#if}}`'s else branch for `0` unless `includeZero=true`, while
`{{f}}` prints `0`, so a count of zero would show the design's placeholder. When the render names its
target, a field the matrix types `number` guards as `{{#if f includeZero=true}}` on the theme and counts
`0` as present on the canvas. Both majors took the hash at upload and gscan 0/0 (its one-argument rule
counts positional parameters only).

```html
<span class="card__read" data-bind="reading_time">5 min</span>
<!-- post.hbs: {{#if reading_time includeZero=true}}{{reading_time}}{{else}}5 min{{/if}} -->
```

### The avatar's two forms *(Story 4.6, R-2)*

A person with no photograph shows initials, and the two sources of a person get two forms that never
meet in one list (`P0-5 Populate From Panel.dc.html`, rule 4 of `P0 Editor Primitives - Spec.md`):

- **A list the user typed** bakes **two** initials at compile through `data-initials` on a `text` prop:

  ```html
  <li class="people__item" data-items="people">
    <img class="people__photo" data-prop-attr="src:people[].photo;alt:people[].name" data-empty="hide" alt="">
    <span class="people__initials" data-initials="people[].name" aria-hidden="true">AB</span>
    <span class="people__name" data-prop="people[].name">A name</span>
  </li>
  ```

- **A person from Ghost** shows **one** letter through the design's own stylesheet over the bound name —
  the photograph's media guard removes the image, and the name stays:

  ```html
  <li class="byline" data-repeat="authors">
    <img class="byline__photo" data-bind-attr="src:profile_image|img_url:xs" alt="">
    <span class="byline__name" data-bind="name">A writer</span>
  </li>
  ```

  Two letters from Ghost would need `{{split}}`, which is Ghost 6.5+ and a gscan error below it. So
  `data-initials` on anything but a declared `text` prop is refused by the validator, and inside a
  `data-repeat` by the runtime, whatever the target — a list of Ghost people can never carry two letters.

### §7.3's gap table, row by row

| § | Construct | Directive |
|---|---|---|
| 1 | repeat over an **authored array**, baked at compile as N blocks | `data-items="logos"` — rendered since 4.5, on both emitters |
| 2 | `{{#get}}` with filter / limit / order | `data-repeat="<key>"`, the key declared in `dataBindings` |
| 3 | two-armed conditional | `data-if="path"` + `data-else` on the sibling |
| 4 | member state over four closed values | `data-members="everyone\|anonymous\|free\|paid"` |
| 5 | positional helpers | `data-when="first\|last\|even\|odd"`, `data-index="number\|index"` |
| 6 | pagination | `data-pagination="prev\|next\|numbers"` — rendered since 4.3; paginated targets only (R-7) |
| 7 | nested repeats | **no directive** — deepest-first ordering, already executed |
| 8 | ~~group-by / change detection~~ | **STRUCK (R-1)** — a header on a key change is not a compiler construct, it is the `group-headings` **behaviour module**. The row is kept struck because "add a group-by directive" is a proposal that would otherwise be made again. |
| 9 | bare-helper binding, no path | `data-helper="content\|comments\|navigation\|total_members\|statusCode\|message\|content_api_key"` — rendered since 4.3, by the shim |
| 10 | compile-target-conditional wrapper | `data-target="page.hbs"` on the subtree |
| 11 | mixed literal-and-bound attribute value | `data-bind-attr` gains R-27's `{token}` form |
| 12 | bound value into an inline custom property | `data-bind-style="--tag-accent:accent_color"` |
| 13 | bound tokens in one node, with no words of its own | `data-text="{pagination.page} / {pagination.pages}"` — its literal words are refused (`chrome-literal`, Story 4.9): English is a `data-t` key with the value as a param |
| 14 | adjacency as a compile-time **input** | `data-needs="section-above\|image-above\|last-before-footer\|share-emitted\|duplicate-post"` |

**Row 1 · `data-items`** — the largest single gap in the library, and named nowhere else. It is
distinct from `data-repeat`, which names a **Ghost** source; an authored array is *user* data and is
baked at compile as N static blocks. Per-item props are written in full.

**Rendered since Story 4.5, identically on both emitters.** The element is copied once per item, in
the array's order, and each copy's props are read from that item — `logos[].name` in copy *i* is item
*i*'s `name`; the theme bakes the N copies as static markup, and each item's text is parked and
serialized like any other user text, its mark allow-list looked up by the `[]` path. **Zero items
renders nothing.** A Ghost binding inside an item keeps its own guard. **A list renders at one level:**
a `data-items` inside another `data-items`, or inside or on a `data-repeat`, refuses by name — a
per-item path resolves against exactly one enclosing array. The panel's side of the same array is the
Item List (§2).

```html
<ul class="logos">
  <li class="logos__item" data-items="logos">
    <img class="logos__img" data-prop-attr="src:logos[].src;alt:logos[].alt" src="/logo.svg" alt="">
    <span class="logos__name" data-prop="logos[].name">A partner</span>
  </li>
</ul>
```

**Row 2 · a declared query.** A filter, a limit and an order live in `design.json` and are referenced
by key. There is no attribute in which one can be composed, so AD-36 holds by construction.

```html
<article class="card" data-repeat="latest" data-partial="post-card">…</article>
```
```json
"dataBindings": { "latest": { "source": "posts", "filter": "featured:true", "limit": 9,
                              "order": "published_at desc" } }
```

**Row 3 · the two arms.** `data-empty` stays the **one**-armed guard; `data-if` / `data-else` is the
two-armed form.

```html
<p class="card__excerpt" data-if="custom_excerpt" data-bind="custom_excerpt">The excerpt the author wrote.</p>
<p class="card__excerpt" data-else data-bind="excerpt">The excerpt Ghost generated.</p>
```

**Rendered since Story 4.10, on both emitters.** The theme is `{{#if path}}<the if arm>{{else}}<the else
arm>{{/if}}` — `{{#if}}` only, and a field the matrix types `number` adds `includeZero=true`; with no
`data-else` it is `{{#if path}}…{{/if}}`. The canvas keeps **exactly one** arm, by Handlebars' own `{{#if}}` test
(`''`, `0` without `includeZero`, `false`, `null` and `[]` take the else arm). Every guard a binding on either arm
adds nests **inside** the arm, and a media guard on the same field as the condition **is** the condition **on the
same element** — one `{{#if}}`, not two (a child guarding the same field still adds its own; harmless, DW-153):

```html
<img class="brand__logo" data-if="@site.logo" data-bind-attr="src:@site.logo" alt="">
<span class="brand__name" data-else data-bind="@site.title">Orbit Weekly</span>
```
```hbs
{{#if @site.logo}}<img class="brand__logo" alt="" src="{{@site.logo}}">{{else}}<span class="brand__name">…</span>{{/if}}
```

**What a condition may name.** `{{#if}}` tests truthiness, so a condition is legal wherever the context matrix
allows the path as a **condition** (a boolean — `@site.allow_self_signup`), as a **value** (`@site.logo`,
`custom_excerpt`, a count) or as a **repeat source** (`posts`: an empty list takes the else arm). `@member`, an
object, a helper and a misspelt field stay refused with `bindable`'s sentence; a value failing the path grammar is
AD-36's. Refused by name on both emitters: a `data-else` that is not the **next element sibling** of a `data-if`
(text and comments between them are fine), `data-if` and `data-else` on one element, and either arm of a pair on a
`data-repeat` or `data-items` element — the else arm would sit outside the copies the if arm makes, so put the
repeat inside the arm.

**Row 4 · member visibility.** Server-rendered on both emitters — client-side member gating would be
both slower and a flash-of-wrong-content bug. Every Portal fragment inside a member ask carries
register 45(c)'s sentence: **with JavaScript off, nothing happens** (R-5).

```html
<div class="band__gate" data-members="anonymous">…the ask…</div>
<p class="band__thanks" data-members="paid" data-prop="paidNote">Thank you for subscribing.</p>
```

**Rendered since Story 4.10 — exit construct 2.** Ghost's own member test, read in both releases
(`update-local-template-options.js`): `@member` is `null` signed out, and `@member.paid` is `status !== 'free'`,
so a **comped** member is paid.

| `data-members` | Theme | Canvas keeps it when `RenderInput.member` is |
|---|---|---|
| `everyone` | no wrapper | always |
| `anonymous` | `{{#if @member}}{{else}}…{{/if}}` | `anonymous` (the default) |
| `free` | `{{#if @member}}{{#if @member.paid}}{{else}}…{{/if}}{{/if}}` | `free` |
| `paid` | `{{#if @member.paid}}…{{/if}}` | `paid` (comped previews as paid) |

`{{#if}}` only — never `{{#unless}}`, never `{{#has}}` (FR-D16) — and no member field is ever printed (R-28). The
gate is the **outermost** wrapper of its element. Refused by name: a `data-members` inside another, and one
sharing its element with `data-repeat`, `data-items`, `data-if` or `data-else` — wrap it instead.

**A section's show-to** is `RenderInput.visibility` (one of the four states, default `everyone`) — Layers' Member
visibility, whose control is Story 5.4's. The section root is gated exactly as if it carried `data-members` with
that value, on both emitters, and on the canvas a visitor outside it gets `""`. A root carrying `data-members`
itself while `visibility` is not `everyone` is refused: one audience per section. **A member ask the markup itself
makes** — a subscribe form, a Sign in action — sits inside `data-if="@site.allow_self_signup"` (R-4): self-signup
implies members, so one condition hides every ask on an invite-only site. A link whose destination the customer
picks is not gated in markup; gating it by its Portal destination is Story 5.20's.

**Row 5 · position.** `@first` spans, and "featured" reaches a grid through `Source: Featured only`
— cross-iteration state is not expressible and is not attempted (R-1). Numbering **restarts on every
page**, and the specs say so.

```html
<span class="card__rank" data-index="number">1</span>
<span class="card__flag" data-when="first" data-t="card.featured">Featured</span>
```

**Row 6 · pagination.** Ghost's own. It restricts the design's `compileTarget` (R-7), and that
restriction is checked when the design is validated, not when it renders.

```html
<nav class="pager" data-t-attr="aria-label:pagination.label">
  <a class="pager__prev" data-pagination="prev" data-t="pagination.newer" href="#">Newer posts</a>
  <span class="pager__numbers" data-pagination="numbers">1 / 1</span>
  <a class="pager__next" data-pagination="next" data-t="pagination.older" href="#">Older posts</a>
</nav>
```

**Row 7 · nesting** needs nothing new. Repeats are processed **deepest-first** so an inner repeat's
tokens exist before the outer replacement carries them into the string; forward order ships them
raw. Executed, and the reason is written beside the code in `compile.js`.

**Row 9 · a bare helper.** `data-bind` requires a path and these have none.

```html
<div class="article__body kg-canvas" data-helper="content"></div>
```

**Row 10 · per-target markup.** A26–A28 aside, the case this exists for is A24's
`@page.show_title_and_feature_image` guard, which belongs on `page.hbs` and nowhere else. A
`data-target` may name only a template the design's `compileTarget` includes.

```html
<header class="post__head" data-target="page.hbs" data-if="@page.show_title_and_feature_image">
  <h1 class="post__title" data-bind="title">Page title</h1>
</header>
```

**Row 11 and row 13 · the token form.** Any value mixing static and bound text uses one mechanism:
each `{…}` run is a binding path, everything else is literal, and a stray brace is refused rather
than guessed at. *(Story 4.9)* In `data-text` the literal part may carry **no letter or digit**: a word
there is English no customer can translate, refused as `chrome-literal` — write the sentence as a
catalog key with the value as a param (`data-t="post.reading_time minutes=reading_time"`).

```html
<a class="tier__cta" data-bind-attr="data-portal:signup/{id}" data-prop="tierCta">Choose this plan</a>  <!-- inside a tiers repeat: id is the tier's -->
<p class="pager__of" data-text="{pagination.page} / {pagination.pages}">1 / 3</p>
```

**Row 12 · the inline custom property.** AD-3's one carve-out, made machine-checkable **by
construction**: the directive can write nothing but a single custom property, so there is no inline
declaration left for a gate to police. It exists because a tag's accent colour is set by its owner
in Ghost and is unknowable when the stylesheet is authored; the stylesheet still does all the
styling and only **reads** the variable.

```html
<li class="card__tag" data-bind-style="--tag-accent:accent_color">…</li>
```
```css
.card__tag { border-inline-start: 3px solid var(--tag-accent, var(--border-hairline)); }
```

**Row 14 · adjacency is an input, not a lookup.** Inflozo knows the whole page at compile — every
placed section, its order, its neighbours. Ghost's render knows far less, and not what the editor
saw. A design therefore **states what it needs to know** and the compiler answers it from the
placement list and bakes the answer in. There is no runtime `{{#if}}` for it and no probe (AD-37,
R-8, R-19).

```html
<section class="band" data-bg="surface" data-spacing="comfortable" data-divider="line"
         data-needs="section-above">…</section>
```

### The five exit constructs

| Exit | Construct | Directive |
|---|---|---|
| 1 | `{{#get}}` blocks | row 2 above — `data-repeat` + `dataBindings` (and R-108's `fixed`) |
| 2 | member visibility | row 4 above — `data-members`, rendered since 4.10, with the section's show-to |
| 3 | chrome strings | `data-t="key name=path"`, `data-t-attr="attr:key name=path"` — rendered since 4.9 |
| 4 | `srcset` / `sizes` | `data-bind-srcset="path\|img_url"` |
| 5 | control → `data-{control}` on the root | **not a directive** — generated from `controlSchema` |

**Exit 3 · strings** *(Story 4.9, FR-Q6)*. Every visitor-facing phrase a design prints — "Older posts", a
skip link, a button's accessible name — is a **catalog string**: a permanent `namespace.name` key with an
English default, in `packages/library/strings/catalog.json`, whose normative table is appendix-h1 §3. A
design never carries an English literal where a visitor reads it; the key must exist **before** the design
is authored (S9), and adding, rewording or retiring one is the owner's call. Keys are grouped by function,
not by category — one `card.read_more` for every card — and `node tools/check-catalog.mjs` holds the two
copies equal and prints the totals.

**The grammar.** `data-t` is the key, then one `name=path` param per placeholder in its default, separated by
spaces. A path is `data-bind`'s grammar, helper included; a helper's argument **runs to the end of the
value**, so a param written after it becomes part of the argument and is refused.

```html
<button class="hdr__search" type="button" data-ghost-search data-t="search.trigger_label">Search</button>
<p class="post__by" data-t="post.by author=primary_author.name">By Ana Lee</p>
<time class="post__updated" data-t="post.updated_on date=updated_at|date:D MMM YYYY">Updated 20 Aug 2026</time>
```

| Canvas | Theme |
|---|---|
| the shim's `t()` over the project's strings (`RenderInput.strings`, the catalog's English when none are handed): "Search", "By Ana Lee" | `{{t "search.trigger_label"}}` · `{{#if primary_author.name}}<p class="post__by">{{t "post.by" author=primary_author.name}}</p>{{/if}}` · `{{t "post.updated_on" date=(date updated_at format="D MMM YYYY")}}`, guarded on `updated_at` |

**The guard.** Each param is guarded on `guardField(path)` — with `includeZero=true` for a field the matrix
types `number` — and the element **hides** when one is empty, on both emitters. Recorded on both majors
(MEASUREMENTS §44): an empty param leaves a hole ("Page 1 of "), an omitted one renders "An error occurred",
so a call supplies **exactly** its key's placeholder set; and the only static fallback a `data-t` element
could have is its English sample, which V1 refuses. `data-empty` on a `data-t` element is therefore
refused, and so is a second text directive beside it. A plain param is the **field**, never the helper of
the same name: `minutes=reading_time` printed "0 min read" where `{{reading_time}}` prints "1 min read".

**The four attributes.** `data-t-attr` writes `alt`, `title`, `placeholder` and `aria-label` — the
attributes that hold visitor-facing text — in `data-t`'s grammar, entries split on `;`:

```html
<nav class="pager" data-t-attr="aria-label:pagination.label"> … </nav>
<input class="form__email" type="email" data-t-attr="aria-label:member.email_placeholder;placeholder:member.email_placeholder">
```

A key marked **js** (written by a module), **canvas** (the editor's own stand-in), retired or superseded is
refused in `data-t` and `data-t-attr`, each with its reason.

**A catalog string a customer may edit — S6.** A category's `text` prop may take its initial value from a
catalog key appendix-h1 marks **prop**. It declares `catalog` and **no** `default`:

```json
"submitLabel": { "label": "Button text", "type": "text", "catalog": "member.signup_cta" }
```

While the value is **empty** the theme emits `{{t "member.signup_cta"}}` and the canvas the handed string
("Subscribe"); the moment the customer types, the value is user text like any other. So the editor keeps a
catalog-linked prop empty until someone types into it, and a reset empties it again. `catalog` on a prop
that is not `text`, on a key not marked prop, or beside a `default` is refused (`catalog-prop`). The same prop
through `data-prop-attr` writes `alt`, `title`, `placeholder` or `aria-label` — the four `data-t-attr` writes —
and both emitters refuse it into `href`, `src` or `poster`, because neither a catalog string nor an override
passes `safeUrl` (AD-36).

**Strings a module writes — S5.** `{{t}}` cannot reach text JavaScript writes, so a module's row in
`packages/library/modules/registry.json` lists the js keys it writes as `strings`, and **both emitters stamp
one attribute per key on every mount of that module**, from the project's strings: strip the namespace,
`.` and `_` become `-`, prefix `data-i18n-` — `countdown.days` → `data-i18n-days`. The module reads it with
`ctx.t('days', { count })`. The canvas carries `data-i18n-days="{count} days"`; the theme carries the same
value with its braces as numeric entities, because an override is user text and Handlebars parses attribute
values (AD-5) — the browser decodes them, and `core` reads `{count}` intact. Every entry must be a live js
key, two keys may not derive one attribute, and a design never writes `data-i18n-*` itself. Only `countdown`
carries `strings` today, because appendix-h1 §3.3a names it; each other module's keys are declared by the
story that writes the module.

**Overrides.** `resolveStrings(overrides)` in `packages/library/src/catalog.ts` is the one door an override
passes: it returns every key's string, carries an override forward along the catalog's `migrations`, refuses a
blank one (R-106: Ghost prints the key for an empty value, so the build stops naming the phrase), and
**throws** — never drops — on a `credit.*` override (S7) or an unknown key. A render re-runs what it is
handed through it, so a tampered map fails at the canvas as it will at the compiler. Validating an
override's own text (V9, V10) and writing `locales/` are Epic 7's.

**Exit 4 · `srcset`.** The binding grammar produces exactly one expression per attribute, which is
not enough for a responsive image set, so it gets its own directive. The sizes are the shim's, not
the design's. A media guard must **enclose** it — the guard hides the element, never the attribute:
an unguarded `srcset` renders a malformed attribute the browser resolves as a relative URL, which is
a live 404 on the customer's site.

**`sizes` is NOT emitted and is not bindable** *(Story 4.3)*. `srcset` says what files exist;
`sizes` says how much of the viewport the image occupies, which is a fact about the **design's own
layout** — the design knows it and the runtime cannot. So a design writes `sizes` as an ordinary
static attribute in its markup, and `data-bind-srcset` emits the candidate list beside it.

```html
<img class="hero__img" data-bind-attr="src:feature_image|img_url:l"
     data-bind-srcset="feature_image|img_url" data-empty="hide" src="/cover.jpg" alt="">
```

**Exit 5 · controls.** There is no directive, and there must not be one: the root's control
attributes are **generated from `controlSchema`**, and the validator asserts the two match in **both
directions** — an attribute the schema does not declare is refused, and a control the root does not
carry is refused. That is what stops a stylesheet selecting on an attribute the design does not own.

**Since Story 4.5 the runtime generates them.** A render handed `controlSchema` (with the design's
`universals` and the instance's stored `controls`) removes every control attribute the author wrote on
the root and stamps `resolveControls`' output instead — each declared control and universal at its
value in force, a greyed control at its `inForce`, a stored value outside the offered set at the
default, an unknown stored name nowhere, and a no-value-locked universal not at all — with every name
and value re-checked against the vocabulary's grammar, so neither emitter can write a value the engine
did not resolve. A render with no schema keeps the authored root. The authored root is therefore what
the file shows when it is opened on its own: write the defaults there, and the validator checks each
value is one the design offers.

### The directives that survive into the theme

| Directive | Why it stays |
|---|---|
| `data-module="lightbox"` | *(Story 4.7)* `core` scans the live page for it and mounts the module on that element, so both emitters keep it where it was written. FR-G3's `js` is read from it. |
| `data-members-form="subscribe"` | Portal reads `form[data-members-form]` **itself** and applies the `loading` / `success` / `error` classes; executed against both majors. The designed states are real; the no-JS promise is not, so the library ships a designed `<noscript>` notice beside it — the reference fixture carries one; A22 #1's pilot does not until A22's category story brings R-5's key (DW-152). |
| `data-members-email` · `data-members-error` | *(Story 4.10)* Portal's own form attributes, read in `@tryghost/portal` 2.51.5 and 2.69.339 (the builds Ghost 5.130.6 and 6.58.0 pin): Portal submits `input[data-members-email]`'s value — a form without it **submits nothing** — and writes its message into `[data-members-error]`. Both take **no value** (a value on either is refused) and both emitters keep them where they were written. |

`data-ghost-search` survives too, and is Ghost's, not Inflozo's: opening Ghost's native search is a
single attribute on any button or link (R-24, FR-F6), which is what makes deleting A23 a
simplification rather than a loss of capability.

**Only the directives something on the live site reads SURVIVE into the emitted theme** — `core`
reads `data-module`, Portal reads `data-members-form`, sodo-search reads `data-ghost-search`, and Portal
parses `data-portal`. Every other directive is **consumed** by the compiler and must be
gone from every emitted file (Portal also reads `data-members-email` and `data-members-error`); AD-34's leak assertion checks exactly that, over
`vocabulary.ts`'s `CONSUMED_DIRECTIVES` rather than over a list restated in prose. A directive
added to the set without a `emitted: true` marker joins the assertion automatically.

---

## 4 · The refusals, and why each exists

Every one is `packages/library/src/validate.ts`, returning a **list** of failures rather than
throwing on the first, and every one is paired in `validate.test.ts` with a legitimate neighbour
that still passes — a guard that blocks everything is not a guard (AD-36).

| Refused | Reason |
|---|---|
| an unknown directive — `data-bound="title"` | the set is closed. Both renderers read these, and a late addition re-authors every design that predates it. |
| `data-prop-attr2` | retired; the list form replaced it. Named, so the message says what to write. |
| a bound attribute not on the allow-list — `onload`, `style` | AD-36 (3). `data-bind-attr="onload:featureImage"` once emitted a live event handler, with a gate on the far side of the pipeline the only thing standing between that design and a shipped theme. |
| a binding path with a brace, quote, whitespace or backslash | AD-36 (2). The path is parsed and the mustache rebuilt from validated parts, never concatenated. |
| an unknown helper, or an argument outside that helper's own rule | AD-36 (2). `img_url:800"}}<script>…` emitted a live script into every theme built from that design. A helper with no argument is refused too — the harness accepted one by accident and emitted `size="undefined"`. |
| an `img_url` size that is not an `image_sizes` key | *(Story 4.3)* Ghost returns the **original** image and reports nothing, so the defect is invisible until a customer's page loads a 4000-pixel file behind a 300-pixel card. `800` was a width, and a width was never a key. |
| `data-pagination` on a design whose targets are not all paginated | R-7. `{{pagination}}` outside a paginated context is a FATAL render. Refused by the validator against `compileTarget` **and** by the runtime against the render's own target. |
| `srcset` in `data-bind-attr` or `data-prop-attr` | one expression per attribute cannot make a candidate list — that is `data-bind-srcset` — and a user-authored list would carry a later candidate's scheme past `safeUrl`. |
| a URL whose scheme is not `http`, `https`, `mailto`, `tel` or relative | AD-36 (1). Reduced to an inert, **visible** `#` — never silently dropped. `java\nscript:` is **rejected, not repaired**. |
| `data-empty` on an element with nothing to guard | FR-H8. A guard with no field emits `{{#if}}` on nothing — present, and empty. |
| `data-empty="fallback"` on an element binding `href`, `src` or `poster`, or carrying `data-bind-srcset` (`media-fallback`) | *(Story 4.6)* FR-H8's media rule. The only fallback an attribute can carry is the design's placeholder, a relative URL that 404s on the customer's site. Refused by the validator **and** the runtime, with one sentence. |
| a binding the context matrix does not allow at its scope on the render's target — a post field at the top of `index.hbs`, a misspelt path, a list or boolean as a value, `@custom.*`, `@member` | *(Story 4.6)* FR-H7. Ghost prints it as a silent blank. **Refused by the runtime** when a render names its target, in one error naming every refused binding; `checkBindings` returns the list. |
| a `data-module` naming `core`, a retired module, a name outside the registry, or a width that is not a whole number above zero (`accordion:0`) | *(Story 4.7)* FR-G7: a theme runs registry code only. `core` is platform and never declared; a retired name must not come back, and the refusal carries its ruling; a behaviour outside the registry needs no module (§2.2). Refused by the validator as `bad-value` **and** by both emitters with the same sentence. |
| a `<script>` element, an `on*` handler or a `javascript:` URL in authored markup (`authored-script`) | *(Story 4.7 review)* FR-G7(1): every script a theme runs is the registry, bundled into `main.js`, and `checkThemeJs` proves `assets/js/` holds nothing else — so the one road left, a script written straight into the markup, is refused at the door. AD-36 (3) closed the bound form; this is the authored form. |
| a `js-enabled` class in authored markup (`js-enabled-authored`) | *(Story 4.7)* `core` sets it on the element whose module it mounts, and a design never does: authored, the section sits in its JavaScript branch with JavaScript off, while editing and under reduced motion. |
| a module file whose top level is not one function declaration of its camelCase name, or an `assets/js/` file other than `bundle`'s `main.js` and `cards.js` | *(Story 4.7)* FR-G7(1). `bundle` throws, naming the file; `checkThemeJs` returns a sentence per file. An `export` concatenated into a classic script is a SyntaxError that turns every site to its no-JS state. |
| a `data-t` or `data-t-attr` key that is not in the catalog, or is retired, superseded, js-marked, canvas-only, or written for `{{plural}}` (`catalog-key`) | *(Story 4.9)* V2. Ghost prints a missing key as the key itself, to every visitor; a js string is `data-i18n-*`'s, a canvas one never reaches a theme, a retired one is no design's, and a default carrying a bare `%` (`archive.posts_many`) is `{{plural}}`'s count — derived from the default, never marked — so it reaches a page only as a `(t …)` sub-expression inside that helper. Refused by the validator **and** both emitters, each with its reason. |
| a `{{t}}` call whose params are not exactly its key's placeholder set (`catalog-params`) | *(Story 4.9)* V4. Recorded on both majors: an omitted param renders "An error occurred", and an extra one is a name no translator sees. The message names what is missing and what is extra. Validator **and** runtime. |
| literal words in a `data-text` template (`chrome-literal`) · a `data-t-attr` attribute other than `alt`, `title`, `placeholder`, `aria-label` · `data-empty` or a second text directive on a `data-t` element · an authored `data-i18n-*` | *(Story 4.9)* V1's lexical half and S5: English outside the catalog cannot be translated; the four attributes are the ones that hold text; a `data-t` element hides when a param is empty; the emitters stamp `data-i18n-*` from the registry. |
| `catalog` on a prop that is not `text`, on a key not marked prop, or beside a `default` (`catalog-prop`) | *(Story 4.9)* S6. The catalog string is the default, so a second one would be ignored; only a prop-marked string may become editable. |
| a render naming its target whose markup prints a bare text node, or an `alt` / `title` / `placeholder` / `aria-label`, holding a letter or digit that no directive writes | *(Story 4.9)* V1's tree half. **Refused by the runtime**, beside FR-H7's scope check, in one error naming every literal; `checkChromeLiterals` returns the list. Exempt: text under `data-prop`, `data-bind`, `data-t`, `data-helper`, `data-initials`, `data-index`, `data-text` or `data-pagination="numbers"`; an attribute a directive writes; `alt=""`; text with no letter or digit. |
| `data-initials` on a prop the category does not declare, on a prop that is not `text`, or inside a `data-repeat` | *(Story 4.6)* R-2. Two initials are baked only from a name the user typed; a person from Ghost shows one letter in CSS. The first two by the validator, the last by the runtime. |
| `bindingContext: page` | a page and a post are one resource; the difference is the product, and that is `compileTarget`. |
| pagination + a non-paginated target | R-7. Outside a paginated context `{{pagination}}` is a fatal render. |
| a `{{#get}}` + `error.hbs` or `private.hbs` | R-7. An error page that queries the database compounds the outage. |
| an `id` in `design.json` | identity is the directory path. A second source can disagree with it. |
| an inline `style` beyond one custom property, or one whose value is not a pack token | AD-3's carve-out is exactly one declaration wide, and the boundary is machine-checkable. A static value is `var(--…)`: §7.3 allows no hex outside the Style Pack, and the bound form is `data-bind-style`. |
| a `data-repeat-limit` on a declared query, a query nothing references, a key that is a source name | one number in one place; a dead query is a misspelt repeat; `posts` as a key is ambiguous with the context path. |
| a `data-empty` on a token-template binding | the guard is the URL entry's field, or the first entry's when none binds a URL, and a template has none. |
| a directive twice on one element · `data-repeat-limit` / `data-partial` with no `data-repeat` · `data-if` with `data-else` on one element · empty markup | a browser keeps the first duplicate silently; an orphan modifier is silently ignored; the two arms are siblings; a source with no root is nothing. |
| a `data-items` on a non-array prop, a `data-prop` on an array, `url` or `image` prop | the compiler would bake an array as text or repeat over a string. `data-prop` takes `text`, `richtext`, `icon` and `date` *(Story 4.5)*. |
| a control disabled by itself, or by a value the other control does not have | the greyed-with-reason state could never fire (R-33). |
| a mark outside `strong · em · u · a`, tokens on a `url`/`image` prop, an `x[].y` with no `x` array, a `url` default that fails the scheme rule | AD-4's four marks; only text is substituted into; an item needs its array; an author's default is not user input. |
| a duplicated `bindingContext`/`compileTarget` value, a `minVersion` that is not a version, `helpers` that is not a list | sets are sets; FR-C5's watch compares a version and a helper list. |
| a root control attribute absent from `controlSchema`, **or** a declared control absent from the root | AD-3. The stylesheet must never select on an attribute the design does not own, and a control nothing carries is a sidebar writing into the void. |
| a universal control redeclared per design | R-23. Narrowing a universal's values is legal with a stated reason; renaming, inventing and `Inherit` are not. |
| a control with no values, or a default outside them | every control is closed-valued — that is what makes the data-attribute selector viable at all. |
| a control dependency with no reason | R-33. Greyed **with the reason shown**, never hidden and never a tooltip. |
| a control `type` outside `segmented · stepper · toggle · named-select · swatch-row`, or a control with no `label` or with a `group` outside `settings · content · layout · style` (`arrangement` is told it is `layout` now) | *(Story 4.5; the groups R-113's, Story 4.10)* Appendix C's control vocabulary is closed, and a text, link, picture, icon, date or list is a content prop, not a control. The panel prints a row title in words and puts the row in the accordion its role names. |
| a segmented control offering fewer than two or more than four values, a value longer than `PILL_CHARS` characters, or a value wider than its pill in the panel (`pill-words`) | *(Story 4.10)* R-114: pills are for short choices. The owner's example, "Spans two columns", is a dropdown; the fit is measured in the pill's own type (`pillWidth`), because a word never wraps — it widens its pill and squeezes the others. |
| one control name with two types, two value sets or two groups anywhere in the library; a built design's setting that `packages/library/control-groups.json` does not file, files under another group, or files under Data; one title printed twice in one panel, an accordion's title included | *(Story 4.10)* R-113, R-53, R-13: a name is a promise about what a control does, and a title is what the customer reads. `categoryControlUnion` returns the refusal naming both designs; `tools/check-snapshots.mjs` holds every built design to the register and every panel to R-13 on every commit. |
| a stylesheet rule selecting on a `data-*` attribute that is no declared control or universal (`stylesheet-control-undeclared`), or on a value the design does not offer for it (`stylesheet-control-value`) | *(Story 4.10's Fix)* AD-3 from the stylesheet's side: renaming a control and missing one rule leaves a setting that does nothing, with every other check green. `validateDesign` reads `style.css` when it is handed one, as `tools/check-snapshots.mjs` does. |
| values that break their type's grammar — a toggle that is not exactly `on`/`off`, a stepper that is not ascending consecutive integers, a swatch row offering anything but the pack's roles, a named value that is not a kebab word — or a `valueLabels` key that is not a value | *(Story 4.5)* the grammar is what keeps the attribute selector, the panel's drawing and the stored value the same thing. A label for a value nobody can pick is a typo. |
| `inherit`, `initial`, `unset` or `revert` anywhere in a control or a `universals` narrowing | *(Story 4.5)* FR-F2, R-23 — no `Inherit`, and no other CSS-wide word, at section level. |
| more than `CONTROL_CAP` of one design's own controls | *(Story 4.5)* FR-F3. The universal trio and the Data group are not counted. |
| a control name whose attribute is already a directive (`items`), Ghost's `data-portal`, the visitor's `data-mode`, a Koenig card's `data-kg-*` or a translation's `data-i18n-*` | *(Story 4.5; the last three Story 4.10's Fix)* AD-3. A control's attribute must mean nothing but the control, and a stylesheet may select on those. |
| JSON null anywhere in `design.json` or `content.json` (`json-null`, naming the path) | *(Story 4.10's Fix)* nothing there takes null — a field that does not apply is left out — and every later check reads through fields, so null is refused before any of them. |
| a built design's setting that is not a row its own frame draws — its title with one of its values (a toggle's switch), or the drawn title the register's per-design rename replaces | *(Story 4.10's Fix)* R-74 for a setting's words, run by `tools/check-snapshots.mjs`: relabelling a setting to another row's registered title would move it between groups with every other check green. |
| controls that disable each other round a circle, or an `inForce` outside the control's own values | *(Story 4.5)* no value in force could be decided for any of them; what renders while a control is greyed is always one of its own values. |
| a control greyed by another in its own group and declared before it (`dependency-order`) | *(Story 4.10)* R-113: a group draws its controls in declaration order, so the setting that greys a row sits above it and the reason reads in order. Across groups the panel's group order decides, and a dependency there is legal. |
| a `universals` entry naming no universal, offering a value the universal does not have, with no reason, or dropping the universal's default without naming an offered one — or a no-value lock that names a default | *(Story 4.5)* R-23: a design offers **fewer** of a universal's values, never others, and says why at the control. R-103's lock has no value in force at all. |
| a root carrying a no-value-locked universal, or a root control value outside the values this design offers | *(Story 4.5)* R-103: a design whose look is what is behind it paints no ground of its own, so the attribute is absent. The stylesheet must never select on a value the panel can never set. |
| an `absent` note with no group or no sentence | *(Story 4.5)* P0-0. The note sits in its group, where the control would have been, and says why it could never act. |
| a prop with no `label`, or a `type` outside the content editors | *(Story 4.5)* the panel titles every field in words, and the type selects its editor. |
| list bounds on a prop that is not an array, bounds that disagree (a floor over the ceiling, starting items outside them), or a floor or ceiling with no sentence | *(Story 4.5)* R-12 and P0-3: Remove answers at the floor and Add greys at the ceiling, each with one sentence in the category's words — never a sentence written in code. |
| an `icon` default that is not in the vendored Tabler set, a `date` default that is not `YYYY-MM-DD` | *(Story 4.5)* R-104's set is the only source of a drawing; a date is the site's wall-clock day, stored unconverted. |
| a `data-items` inside another `data-items` or on or inside a `data-repeat` · an `icon` prop rendered with no icon lookup | *(Story 4.5)* **refused by the runtime, by name.** A per-item path resolves against exactly one enclosing array; an icon is never silently left out (R-26). |
| an inline token outside `members · term · n` | R-27. An allow-list by construction, never a general substitution pass. |
| a `data-prop` naming a prop the category does not declare | R-102. Add it to **this** category's union; a prop never crosses a boundary. |
| a `content.json` from another category | R-102, at assembly. |
| `fixed` that is not `true`, `fixed` beside `ids`, or `fixed` without both `limit` and `order` (`bad-get-fixed`) | *(Story 4.10)* R-108: the design fixes the number and the order, so it states both; a hand-picked list is already fixed. Also refused at emission by the shim's `getQuery`, which re-runs the declaration's grammar. |
| a value on `data-members-email` or `data-members-error` | *(Story 4.10)* Portal reads the attribute, not a value; both are valueless, like `data-ghost-search`. |
| a `data-else` that is not the next element sibling of a `data-if` · either arm of a pair on a `data-repeat` or `data-items` · a `data-members` inside another, or on a `data-repeat`, `data-items`, `data-if` or `data-else` · a root `data-members` beside a show-to · a `member` or `visibility` outside the closed states | *(Story 4.10)* **refused by the runtime, by name**, on both emitters: the else arm follows its if arm; an arm beside a repeat would split the `{{#if}}` across the rows; member states do not nest and one element has one audience; one audience per section. |

### What the validator deliberately does **not** check

It is **lexical** — a regex over each tag's attribute run — because its job here is to refuse an
unknown directive and a malformed value, and that is a token-level question. Four things need a real
parse and belong to Story 4.2, which brings one for the emitters:

1. nesting depth and repeat containment,
2. a `data-else` with no `data-if` sibling — refused by the runtime since Story 4.10,
3. a media guard that does not enclose its `srcset`,
4. a bare `{{ … }}` written into authored markup where `data-helper` belongs — section source is
   annotated HTML, **not** Handlebars, and today only review catches an author who forgets it.

Where a binding is **legal** — a `data-repeat` over a context path that does not exist (`post.tagz`), a
post field at the top of `index.hbs` — is a question about the tree and the target, not the tokens.
Since Story 4.6 the runtime's scope walk asks the context matrix at every render that names its target,
and `checkBindings` asks it without rendering (see *Where a binding is legal*). The validator still
checks the declared-query direction lexically — every declared key must be referenced.

**V1's tree half is the runtime's too** *(Story 4.9)*. Whether an element's text is a literal depends on
its ancestors — a word under a `data-prop` is replaced, the same word beside it is English — so the
validator refuses only what it sees in one attribute (a `data-text` template's words), and the runtime
walks the tree for the rest whenever a render names its target, beside the binding check.
`checkChromeLiterals` asks it without rendering.

The ceiling is written down rather than left to be rediscovered; a `ponytail:` comment at the head of
`validate.ts` names it and the upgrade path.

---

## 5 · What a design previews against — Orbit Weekly and the three fixtures

*(Story 4.4.)* Every design's `previewSeed` is `"orbit-weekly"`, and that value now resolves:
`orbitWeekly.resolvePreviewSeed('orbit-weekly')` in `@inflozo/library` returns the Source resolver and
the fixtures; any other seed refuses by name. The data is `packages/library/orbit-weekly/`, the code
is `packages/library/src/orbit-weekly.ts`, and the proof is `src/orbit-weekly.test.ts`.

**The sample publication.** One file, `dataset.json`: feed posts, tags (six topics plus `newsletter`),
writers with portraits and bios, tiers (one Free, the rest paid), newsletters, navigation, brand and a
dozen press logos, all imagery drawn for it under `images/`. Its size is FR-H3's two rules, not a
number — the feed renders a first page, a middle page carrying both links and a partial last page, and
never equals `posts_per_page` — and the test asserts the rules. Every writer's archive fills because a
post may carry more than one author, as in Ghost; a card still shows one byline (`primary_author`).

**The fields a design may bind to, and where,** are the context matrix's (§3, *Where a binding is
legal*); the dataset carries the Content API's, by the dotted paths the shim reads — a
post's `id slug title url excerpt custom_excerpt feature_image feature_image_alt feature_image_caption
published_at updated_at created_at reading_time visibility featured access`, its `tags[]`, `authors[]`,
`primary_tag`, `primary_author`; a tag's `name slug url description accent_color visibility count.posts`;
an author's `name slug url bio profile_image cover_image website location count.posts`. Every count is
derived from the feed. Every URL sits on the reserved origin `https://orbit-weekly.example`, which the
canvas maps to where the images are served; a dataset image is never sized, because there is no Ghost
to size it (a rendition is asserted against `packages/ghost-shim/fixtures/` instead).

**A `dataBindings` entry fills from `orbitWeekly.resolveSource(binding)`**, which is what the editor
hands `getRows` on an unlinked project. It evaluates the grammar the Data group composes —
`field:value`, `field:-value`, `field:[a,b]`, joined by `+` — over `featured`, `tag`/`tags`,
`primary_tag`, `author`/`authors`, `primary_author`, `id`, `slug`, `visibility` on posts (and the
matching fields on tags, authors and tiers). An `or` (`,`), parentheses or a comparison **refuse by
name** rather than guess. With no `order` or `limit`, Ghost's own defaults apply, and those are asserted
against what both test servers returned, not restated. A filter that matches nothing is `[]`, and the
design draws its own empty state. A pager needing more pages than the feed has reads
`orbitWeekly.deepPagination()` — the depth is carried in `pagination` and no post is invented.

**`data-helper="content"` and `data-helper="comments"` resolve to the fixtures**, passed as
`RenderInput.fixtures = orbitWeekly.previewFixtures()`; without them the shim still refuses (FR-H3).

| Fixture | What it is | Where |
|---|---|---|
| 1 · the style-guide post | C4's article, *The four hundred domains that refuse to move* — one of each card in C4's order, **Ghost's own bytes**, recorded on both majors by `python3 tools/probe/record-cards.py` and split per block. Its variation sheet carries every class-affecting variant FR-H3 enumerates, labelled, from the same run. | `fixtures/ghost{5,6}/article.json` · `variations.json` · `variations.html` |
| 2 · the comments block | FR-H3's thread shape, drawn in Ghost's colours inside a dashed outline in both states, because `{{comments}}` emits a script and no DOM — nothing a theme writes reaches inside it. | `orbitWeekly.commentsFixture('member' \| 'signedout')` |
| 3 · the style-guide page | The same body created as a Ghost **page** (it prints byte-identical on both majors), and a page subject carrying `show_title_and_feature_image` for both states of the guard. | `fixtures/ghost{5,6}/page.json` · `orbitWeekly.subject('page')` |

The fixtures are in **no** Source and **no** count; they are reachable only as preview subjects
(`orbitWeekly.subject('post' | 'page')`). Three facts the recording settled, each now asserted: the
NFT card has **no Lexical renderer on either major**, so it is not in the fixture; the toggle card
renders **closed** only — open is what `toggle.js` sets on a click; and the signup card renders
`display: none` until Portal un-hides it, so the canvas does the same one thing Portal does.

**Looking at it.** `/style-guide` (behind sign-in, noindex, reached by typing the path) renders the
three fixtures inside `<main><article class="gh-content">`, loading the theme stylesheet, then the
simulated `cards.min.css` — the complement of the cards the user designed, today every chunk — then the
four vendored card scripts from `orbit-weekly/vendor/` (the directory carries every CSS chunk too, because the
simulated bundle is built from them). `/style-guide/variations` is the sheet. The recordings carry no
`?ref=` link tag: the recorder switches `outbound_link_tagging` off for the run and restores it.
