# Authoring a section

**The contract every one of the library's designs is written against.** A section is **annotated
HTML** — plain, valid HTML carrying `data-*` directives — plus its own flat stylesheet, its optional
behaviour module and two schemas. One source, two renderers: the canvas DOM and the `.hbs` text.
They agree **by construction**, not by comparison, which is the whole reason the source is HTML and
not Handlebars (PRD §7.3).

A section file **opens directly in a browser during authoring and renders as plain HTML**. That is
most of why annotated HTML won, and it is a property to preserve: if a directive would stop a file
rendering on its own, it is the wrong directive.

- The contract as data and code: `packages/library/src/` — `vocabulary.ts` (the closed directive
  set, the control vocabulary and the allow-lists), `registry.ts` (the types and the assembly),
  `validate.ts` (the refusals), `icons.ts` (the vendored Tabler set, its own `@inflozo/library/icons`
  subpath).
- The controls engine: `packages/section-runtime/src/controls.ts` — the sidebar, the edits and the one
  resolution both emitters stamp *(Story 4.5)*.
- The runnable reference: `packages/library/fixtures/reference-design/` — every directive, once. The
  controls sample, `packages/library/fixtures/controls/`, is the section the internal controls review
  page renders beside its panel.
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
  quickControls[], html, css, js?, dataBindings?, ghostCompat, darkCapabilities, previewSeed }
```

**An entry is ASSEMBLED, never authored.** Nothing in the tree is a file shaped like the list above.
It is built — `assembleEntry()` in `registry.ts` — from four inputs:

| Input | What it contributes |
|---|---|
| the design's directory path, `designs/{category}/{n}` | `id`, `category` |
| the design's `design.json` | `name`, `tier`, `bindingContext`, `compileTarget`, `controlSchema`, `universals`, `absent`, `dataBindings`, `ghostCompat`, `darkCapabilities`, `previewSeed`, and AD-35's `provisional` |
| the **category's** `content.json`, at `designs/{category}/content.json` | `contentSchema` |
| the design's other three files — `index.html`, `style.css`, `behaviour.js` | `html`, `css`, `js` |
| recovered, never written | `quickControls[]` |

(`design.json` is the fourth file and has its own row. The entry also carries the structural
descriptor tuple, so FR-G5's "no two designs in a category share one" has something in the registry
to read.)

So **"registry entry" and "`design.json`" are different lists**, and reading one as the other is the
mistake this section exists to remove. `design.json` carries no `id` — identity is the path, and an
authored id is a second source that can disagree with it. It carries no `quickControls` either.

**Identity is `{categoryId}/{n}` and is stable forever.** `a17/1` is that design for the life of the
product; renaming it, re-tiering it or redrawing it does not move it.

**`contentSchema` is the category's union. `controlSchema`, `universals`, `absent` and
`quickControls[]` are per design** — the assembly carries `universals` as `{}` and `absent` as `[]`
when a design declares none. A registry entry therefore describes **one design against its category's
shared content model**. The category's **control** union is the other direction and is **generated,
never authored**: `categoryControlUnion(designs)` in `registry.ts` builds it from the designs' own
lists and refuses one control name carrying two value sets, naming both designs (FR-F7, R-53) — where
two designs genuinely differ, they differ by name.

**`quickControls[]` is recovered mechanically** as the first 3–5 entries of the **design's own**
control list, in order — read from the design level, never from the category's union, which is the
storage domain FR-D19 parks against and not a sidebar. A `quickControls` array written into a
`design.json` is a **validation failure**, not an override: the two documents cannot drift if only
one of them is authored. A design that declares fewer than three controls has fewer Quick Controls;
FR-F3 says designs legitimately expose different controls, and a floor would be an invented rule.

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
    { "name": "cols",  "type": "stepper",      "label": "Columns",             "group": "arrangement",
      "values": ["2", "3", "4"], "default": "3" },
    { "name": "card",  "type": "segmented",    "label": "Card style",          "group": "style",
      "values": ["flat", "outlined", "raised"], "default": "raised" },
    { "name": "meta",  "type": "named-select", "label": "Post details",        "group": "style",
      "values": ["none", "date", "author-date"], "default": "author-date",
      "valueLabels": { "author-date": "Author and date" } },
    { "name": "align", "type": "segmented",    "label": "Alignment",           "group": "arrangement",
      "values": ["start", "center"], "default": "start",
      "valueLabels": { "start": "Left", "center": "Centre" } },
    { "name": "badge", "type": "toggle",       "label": "Editor's pick badge", "group": "style",
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
| `segmented` | Segmented Control | lowercase kebab words — `start`, `author-date` |
| `named-select` | Named Select | lowercase kebab words |
| `stepper` | Stepper | ascending **consecutive** integers, as strings — `"2" · "3" · "4"`; never a unit and never a gap |
| `toggle` | Toggle | exactly `on` and `off` |
| `swatch-row` | Swatch Row | the pack's roles only — `base · surface · accent · contrast · image` (`BACKGROUND_ROLES`); never a colour |

Every control declares:

- **`name`** — kebab-case, because it becomes `data-{name}`. A name whose attribute is already a
  directive (`items`, `prop`) or Ghost's own `data-portal` is refused: the attribute must mean nothing
  but the control.
- **`label`** — the row title the panel prints, in words.
- **`group`** — `arrangement` or `style`, the accordion it sits in when it is not a Quick Control.
  **Content** and **Data** are not control groups: content props fill the first, and a declared
  query's Count and Order fill the second.
- **`values`** and a **`default`** among them. **No CSS-wide word anywhere in a declaration** —
  `inherit`, `initial`, `unset`, `revert`, in a value, a default, a `valueLabels` key or a dependency
  — and so no `Inherit` (FR-F2, R-23).
- **`valueLabels`**, optional — the words the panel prints where a value is not already its own word
  (`start` → "Left"). An unlabelled value prints as itself with its first letter raised and hyphens as
  spaces, which is why `meta` above labels only `author-date`. A label for a value the control does not
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
(FR-F3's ≈15); the universal trio and the Data group are not counted. The first 3–5 are the Quick
Controls (§1).

**The three universal controls — `bg`, `spacing`, `divider` — are declared once, never per design,
and in full** (`UNIVERSALS`). They sit on every section root — R-103's no-value lock below is the one
absence — are exempt from the cap, are never Quick Controls, and the panel draws them as one block at
the foot of Style.

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
of `content · arrangement · style · data`, the note a sentence. The panel prints it after the group's
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
a hand-picked `ids` query has neither. Both fold into the query through `withData`, so the canvas rows
and the theme's `{{#get}}` read the same numbers.

### `style.css`

Plain CSS consuming **Style Pack custom properties only** — `var(--…)`, flat, no nesting, no
generated class names, no CSS-in-JS, and **explicitly outside any Tailwind processing**: utility
classes are structurally incompatible with token-only styling. Every control appears as an attribute
selector on the root (`.feed[data-cols="3"] .feed__grid { … }`).

### `behaviour.js`

Optional, and from FR-G7's registry only. It declares its no-JS degradation and whether it is
`edit-safe`. 4.7 owns the registry; the markup's half is `data-module`.

---

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
`data-initials`**, the typed avatar (see *The avatar's two forms*). Everything else in the set throws
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
| `data-module` | a module name | consumed | consumed — 4.7's registry reads the name |

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
to be an Inflozo partial counting something Ghost does not expose. Tracked as an open question
rather than settled here.

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
| 13 | static and bound text in one node | `data-text="Read in {reading_time} minutes"` |
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

**Row 4 · member visibility.** Server-rendered on both emitters — client-side member gating would be
both slower and a flash-of-wrong-content bug. Every Portal fragment inside a member ask carries
register 45(c)'s sentence: **with JavaScript off, nothing happens** (R-5).

```html
<div class="band__gate" data-members="anonymous">…the ask…</div>
<p class="band__thanks" data-members="paid" data-prop="paidNote">Thank you for subscribing.</p>
```

**Row 5 · position.** `@first` spans, and "featured" reaches a grid through `Source: Featured only`
— cross-iteration state is not expressible and is not attempted (R-1). Numbering **restarts on every
page**, and the specs say so.

```html
<span class="card__rank" data-index="number">1</span>
<span class="card__flag" data-when="first" data-t="a17.editors_pick">Editors pick</span>
```

**Row 6 · pagination.** Ghost's own. It restricts the design's `compileTarget` (R-7), and that
restriction is checked when the design is validated, not when it renders.

```html
<nav class="pager" aria-label="Pagination">
  <a class="pager__prev" data-pagination="prev" href="#">Newer</a>
  <span class="pager__numbers" data-pagination="numbers">1 / 1</span>
  <a class="pager__next" data-pagination="next" href="#">Older</a>
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
than guessed at.

```html
<a class="tier__cta" data-bind-attr="data-portal:signup/{id}">Choose this plan</a>  <!-- inside a tiers repeat: id is the tier's -->
<p class="stat" data-text="Read in {reading_time} minutes">Read in 5 minutes</p>
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
| 1 | `{{#get}}` blocks | row 2 above — `data-repeat` + `dataBindings` |
| 2 | member visibility | row 4 above — `data-members` |
| 3 | chrome strings | `data-t="key"`, `data-t-attr="attr:key"` |
| 4 | `srcset` / `sizes` | `data-bind-srcset="path\|img_url"` |
| 5 | control → `data-{control}` on the root | **not a directive** — generated from `controlSchema` |

**Exit 3 · strings.** Visitor-facing literals live in one catalog under dotted `namespace.name` keys,
never the English string itself. `.hbs` output consumes them **exclusively** through `{{t}}`.
Strings written by bundled JS are **out of `{{t}}`'s reach** — Ghost never runs a theme's JS through
Handlebars — so those resolve at compile and emit as `data-i18n-*` attributes on the module's mount
element. 4.9 owns the catalog and its format; this document owns only how markup reaches it.

```html
<button class="hdr__menu" type="button" data-t="a1.menu_open"
        data-t-attr="aria-label:a1.menu_open">Menu</button>
<input class="form__email" type="email" data-t-attr="aria-label:a22.email;placeholder:a22.email_placeholder">
```

A `placeholder` is a visitor-facing string like any other, so `data-t-attr` reaches it; a design
carries **no** English literal in a `placeholder`, a `<noscript>` or anywhere else a visitor reads.

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

### Two the harness proved and this vocabulary keeps

| Directive | Why it stays |
|---|---|
| `data-module="lightbox"` | declares which behaviour module owns a subtree — FR-G3's `js?` field, in markup. 4.7 owns the registry of names. |
| `data-members-form="subscribe"` | Portal reads `form[data-members-form]` **itself** and applies the `loading` / `success` / `error` classes; executed against both majors. The designed states are real; the no-JS promise is not, so the library ships a designed `<noscript>` notice beside it. |

`data-ghost-search` is the third and is Ghost's, not Inflozo's: opening Ghost's native search is a
single attribute on any button or link (R-24, FR-F6), which is what makes deleting A23 a
simplification rather than a loss of capability.

**These three are the only directives that SURVIVE into the emitted theme**, because something on
the live site reads them — Portal reads `data-members-form`, sodo-search reads `data-ghost-search`,
and Portal parses `data-portal`. Every other directive is **consumed** by the compiler and must be
gone from every emitted file; AD-34's leak assertion checks exactly that, over
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
| `data-initials` on a prop the category does not declare, on a prop that is not `text`, or inside a `data-repeat` | *(Story 4.6)* R-2. Two initials are baked only from a name the user typed; a person from Ghost shows one letter in CSS. The first two by the validator, the last by the runtime. |
| `bindingContext: page` | a page and a post are one resource; the difference is the product, and that is `compileTarget`. |
| pagination + a non-paginated target | R-7. Outside a paginated context `{{pagination}}` is a fatal render. |
| a `{{#get}}` + `error.hbs` or `private.hbs` | R-7. An error page that queries the database compounds the outage. |
| a hand-written `quickControls[]` | FR-G3. It is recovered from the design's own control list; two authored copies drift. |
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
| a control `type` outside `segmented · stepper · toggle · named-select · swatch-row`, or a control with no `label` or no `group` (`arrangement` · `style`) | *(Story 4.5)* Appendix C's control vocabulary is closed, and a text, link, picture, icon, date or list is a content prop, not a control. The panel prints a row title in words and puts the row in an accordion. |
| values that break their type's grammar — a toggle that is not exactly `on`/`off`, a stepper that is not ascending consecutive integers, a swatch row offering anything but the pack's roles, a named value that is not a kebab word — or a `valueLabels` key that is not a value | *(Story 4.5)* the grammar is what keeps the attribute selector, the panel's drawing and the stored value the same thing. A label for a value nobody can pick is a typo. |
| `inherit`, `initial`, `unset` or `revert` anywhere in a control or a `universals` narrowing | *(Story 4.5)* FR-F2, R-23 — no `Inherit`, and no other CSS-wide word, at section level. |
| more than `CONTROL_CAP` of one design's own controls | *(Story 4.5)* FR-F3. The universal trio and the Data group are not counted. |
| a control name whose attribute is already a directive (`items`) or Ghost's `data-portal` | *(Story 4.5)* AD-3. A control's attribute must mean nothing but the control. |
| controls that disable each other round a circle, or an `inForce` outside the control's own values | *(Story 4.5)* no value in force could be decided for any of them; what renders while a control is greyed is always one of its own values. |
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

### What the validator deliberately does **not** check

It is **lexical** — a regex over each tag's attribute run — because its job here is to refuse an
unknown directive and a malformed value, and that is a token-level question. Four things need a real
parse and belong to Story 4.2, which brings one for the emitters:

1. nesting depth and repeat containment,
2. a `data-else` with no `data-if` sibling,
3. a media guard that does not enclose its `srcset`,
4. a bare `{{ … }}` written into authored markup where `data-helper` belongs — section source is
   annotated HTML, **not** Handlebars, and today only review catches an author who forgets it.

Where a binding is **legal** — a `data-repeat` over a context path that does not exist (`post.tagz`), a
post field at the top of `index.hbs` — is a question about the tree and the target, not the tokens.
Since Story 4.6 the runtime's scope walk asks the context matrix at every render that names its target,
and `checkBindings` asks it without rendering (see *Where a binding is legal*). The validator still
checks the declared-query direction lexically — every declared key must be referenced.

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
