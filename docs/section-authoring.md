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
  set and the allow-lists), `registry.ts` (the types and the assembly), `validate.ts` (the refusals).
- The runnable reference: `packages/library/fixtures/reference-design/` — every directive, once.
- The controls: `node --test` in `packages/library`, and `node test-vocabulary.mjs` in `tools/stress`.

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
| the design's `design.json` | `name`, `tier`, `bindingContext`, `compileTarget`, `controlSchema`, `dataBindings`, `ghostCompat`, `darkCapabilities`, `previewSeed`, and AD-35's `provisional` |
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

**`contentSchema` is the category's union. `controlSchema` and `quickControls[]` are per design.**
A registry entry therefore describes **one design against its category's shared content model**.

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
    { "name": "cols",  "type": "stepper",      "values": ["2", "3", "4"],            "default": "3" },
    { "name": "card",  "type": "segmented",    "values": ["flat", "outlined", "raised"], "default": "raised" },
    { "name": "meta",  "type": "named-select", "values": ["none", "date", "author-date"], "default": "author-date" },
    { "name": "align", "type": "segmented",    "values": ["start", "center"],        "default": "start" },
    { "name": "badge", "type": "toggle",       "values": ["on", "off"],              "default": "on" },
    { "name": "rule",  "type": "segmented",    "values": ["none", "line"],           "default": "none",
      "disabledBy": { "control": "align", "whenValue": "center",
                      "reason": "a centred head has no rule to sit under" } }
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

**The three universal controls — `bg`, `spacing`, `divider` — are declared once, never per design.**
They sit on every section root, are exempt from the ≈15 cap and are never Quick Controls. A design
may offer **fewer values** of one and must say why; renaming, inventing and an `Inherit` value are
all refused (R-23).

**A query is declared here and referenced by key from the markup** — never written into an
attribute. That is what makes AD-36's "validated, never interpolated" hold by construction: there is
nowhere in the markup a filter could be composed. A key is a lowercase identifier and never a source
name (`posts`), which a `data-repeat` would read as a context path; every declared query must be
referenced by a `data-repeat`, so a misspelt key (`latst`) fails as an unreferenced declaration. The
query's `limit` is the only limit: a `data-repeat-limit` on the same element is refused as a second
copy of one number. **R-20's hand-picked order** is `"ids": ["…", "…"]` in place of `filter`,
`limit` and `order` — one single-id get per entry, in that order, with no cap; the sidebar warns
past 25 (4.5), the validator does not.

### `content.json` — one per **category**

```json
{
  "category": "a17",
  "props": {
    "title":      { "type": "richtext", "marks": ["strong", "em"], "default": "Latest posts" },
    "subtitle":   { "type": "richtext", "marks": ["strong", "em", "u", "a"],
                    "tokens": ["members"], "default": "Read by {members} people." },
    "cta.label":  { "type": "text", "default": "View all" },
    "cta.url":    { "type": "url",  "default": "/archive/" },
    "logos":        { "type": "array", "default": [] },
    "logos[].src":  { "type": "image" },
    "logos[].name": { "type": "text", "default": "A partner" }
  }
}
```

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
defaults to `hide`, guarding the **element** and never the attribute. Writing `data-empty` chooses
the other one. The guard is always the **bound field**, never a helper argument. On a list-form
`data-bind-attr` the media case is **any** entry into a URL attribute, and the element is guarded on
that entry's field. A **content** prop into a URL attribute (`data-prop-attr="src:hero"`) is not a
binding and keeps the authored placeholder when unset; `data-empty="hide"` hides it. The canvas falls
back wherever Handlebars' `{{#if}}` would — `''`, `0`, `false` and `[]` are all empty — and a
`data-empty` value outside `hide`/`fallback` is refused, not ignored.

**Not every directive below is rendered yet, and the rest REFUSE rather than leak.** Story 4.2's
runtime emits the proven eight plus `data-bind-style` and `data-module`; everything else in the set
throws with a sentence naming the directive, until the story that owns it lands. The partition is
derived from this vocabulary and asserted by a test, so a directive added here cannot be silently
forgotten by the runtime.

These were executed in the stress harness and keep their names and grammar unchanged; since Story 4.2 the implementation is `packages/section-runtime` and `tools/stress/compile.js` is a thin adapter over it.

| Directive | Grammar | Canvas | Theme |
|---|---|---|---|
| `data-prop` | a content prop path | the customer's literal text into the DOM | a marker, spliced into the emitted string after serialization |
| `data-prop-attr` | `attr:path` list, `;`-separated | the value onto the attribute | the same, through the marker path |
| `data-bind` | `path` or `path\|helper:arg` — a helper always takes its argument | the Ghost value, resolved | `{{path}}` / `{{helper path param="arg"}}` |
| `data-bind-attr` | `attr:spec` list, `;`-separated | the resolved value onto the attribute | the mustache, carried through serialization as an opaque token |
| `data-empty` | `hide` · `fallback` | `hide` removes the element; `fallback` keeps the authored text or attribute | `hide` wraps the element in `{{#if field}}`; `fallback` emits `{{#if field}}…{{else}}<authored>{{/if}}` |
| `data-repeat` | a Ghost context path, or a `dataBindings` key | expands against real rows | `{{#foreach …}}` / `{{#get …}}` |
| `data-repeat-limit` | 1–100 | slices the rows | `limit="n"` on the block |
| `data-partial` | a partial name | ignored | extracts the body to a parameterless partial |
| `data-bind-style` | `--custom-property:spec` | the value through `safeCssColor` — hex, `rgb()`/`hsl()` or the pack's accent token; a **named** colour is not parsed and falls back too | `style="{{#if field}}--prop: {{path}}{{/if}}"` — the value is Ghost's at render |
| `data-module` | a module name | consumed | consumed — 4.7's registry reads the name |

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
guard is the **first** entry's field — put the one that decides visibility first — and a first
entry that is a token template is refused, because a template has no single field to guard on. The spike parsed the field back out
of the built expression and took the last token, which is the **format string** — so it emitted a
guard on an identifier that does not exist, the block never rendered, and the content was silently
and permanently lost. A garbage guard is *present*, which is why "is there a guard?" passes while
the page is empty. `guardField()` is the derivation, and it is one function both emitters call.

### §7.3's gap table, row by row

| § | Construct | Directive |
|---|---|---|
| 1 | repeat over an **authored array**, baked at compile as N blocks | `data-items="logos"` |
| 2 | `{{#get}}` with filter / limit / order | `data-repeat="<key>"`, the key declared in `dataBindings` |
| 3 | two-armed conditional | `data-if="path"` + `data-else` on the sibling |
| 4 | member state over four closed values | `data-members="everyone\|anonymous\|free\|paid"` |
| 5 | positional helpers | `data-when="first\|last\|even\|odd"`, `data-index="number\|index"` |
| 6 | pagination | `data-pagination="prev\|next\|numbers"` |
| 7 | nested repeats | **no directive** — deepest-first ordering, already executed |
| 8 | ~~group-by / change detection~~ | **STRUCK (R-1)** — a header on a key change is not a compiler construct, it is the `group-headings` **behaviour module**. The row is kept struck because "add a group-by directive" is a proposal that would otherwise be made again. |
| 9 | bare-helper binding, no path | `data-helper="content\|comments\|navigation\|total_members\|statusCode\|message\|content_api_key"` |
| 10 | compile-target-conditional wrapper | `data-target="page.hbs"` on the subtree |
| 11 | mixed literal-and-bound attribute value | `data-bind-attr` gains R-27's `{token}` form |
| 12 | bound value into an inline custom property | `data-bind-style="--tag-accent:accent_color"` |
| 13 | static and bound text in one node | `data-text="Read in {reading_time} minutes"` |
| 14 | adjacency as a compile-time **input** | `data-needs="section-above\|image-above\|last-before-footer\|share-emitted\|duplicate-post"` |

**Row 1 · `data-items`** — the largest single gap in the library, and named nowhere else. It is
distinct from `data-repeat`, which names a **Ghost** source; an authored array is *user* data and is
baked at compile as N static blocks. Per-item props are written in full.

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
  <ol class="pager__numbers" data-pagination="numbers"></ol>
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
<a class="tier__cta" data-bind-attr="data-portal:signup/{tier}">Choose this plan</a>
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
the design's. A media guard must **enclose** it — the guard hides the element, never the attribute.

```html
<img class="hero__img" data-bind-attr="src:feature_image|img_url:l"
     data-bind-srcset="feature_image|img_url" data-empty="hide" src="/cover.jpg" alt="">
```

**Exit 5 · controls.** There is no directive, and there must not be one: the root's control
attributes are **generated from `controlSchema`**, and the validator asserts the two match in **both
directions** — an attribute the schema does not declare is refused, and a control the root does not
carry is refused. That is what stops a stylesheet selecting on an attribute the design does not own.

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
| `srcset` in `data-bind-attr` or `data-prop-attr` | one expression per attribute cannot make a candidate list — that is `data-bind-srcset` — and a user-authored list would carry a later candidate's scheme past `safeUrl`. |
| a URL whose scheme is not `http`, `https`, `mailto`, `tel` or relative | AD-36 (1). Reduced to an inert, **visible** `#` — never silently dropped. `java\nscript:` is **rejected, not repaired**. |
| `data-empty` on an element with nothing to guard | FR-H8. A guard with no field emits `{{#if}}` on nothing — present, and empty. |
| `bindingContext: page` | a page and a post are one resource; the difference is the product, and that is `compileTarget`. |
| pagination + a non-paginated target | R-7. Outside a paginated context `{{pagination}}` is a fatal render. |
| a `{{#get}}` + `error.hbs` or `private.hbs` | R-7. An error page that queries the database compounds the outage. |
| a hand-written `quickControls[]` | FR-G3. It is recovered from the design's own control list; two authored copies drift. |
| an `id` in `design.json` | identity is the directory path. A second source can disagree with it. |
| an inline `style` beyond one custom property, or one whose value is not a pack token | AD-3's carve-out is exactly one declaration wide, and the boundary is machine-checkable. A static value is `var(--…)`: §7.3 allows no hex outside the Style Pack, and the bound form is `data-bind-style`. |
| a `data-repeat-limit` on a declared query, a query nothing references, a key that is a source name | one number in one place; a dead query is a misspelt repeat; `posts` as a key is ambiguous with the context path. |
| a `data-empty` on a token-template binding | the guard is the first entry's field, and a template has none. |
| a directive twice on one element · `data-repeat-limit` / `data-partial` with no `data-repeat` · `data-if` with `data-else` on one element · empty markup | a browser keeps the first duplicate silently; an orphan modifier is silently ignored; the two arms are siblings; a source with no root is nothing. |
| a `data-items` on a non-array prop, a `data-prop` on an array or image prop | the compiler would bake an array as text or repeat over a string. |
| a control disabled by itself, or by a value the other control does not have | the greyed-with-reason state could never fire (R-33). |
| a mark outside `strong · em · u · a`, tokens on a `url`/`image` prop, an `x[].y` with no `x` array, a `url` default that fails the scheme rule | AD-4's four marks; only text is substituted into; an item needs its array; an author's default is not user input. |
| a duplicated `bindingContext`/`compileTarget` value, a `minVersion` that is not a version, `helpers` that is not a list | sets are sets; FR-C5's watch compares a version and a helper list. |
| a root control attribute absent from `controlSchema`, **or** a declared control absent from the root | AD-3. The stylesheet must never select on an attribute the design does not own, and a control nothing carries is a sidebar writing into the void. |
| a universal control redeclared per design | R-23. Narrowing a universal's values is legal with a stated reason; renaming, inventing and `Inherit` are not. |
| a control with no values, or a default outside them | every control is closed-valued — that is what makes the data-attribute selector viable at all. |
| a control dependency with no reason | R-33. Greyed **with the reason shown**, never hidden and never a tooltip. |
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

One more belongs to Story 4.6, not 4.2: a `data-repeat` over a **context path that does not exist**
(`post.tagz`) is lexically a path and needs the binding matrix to refuse. Until then only the
declared-query direction is checked — every declared key must be referenced.

The ceiling is written down rather than left to be rediscovered; a `ponytail:` comment at the head of
`validate.ts` names it and the upgrade path.
