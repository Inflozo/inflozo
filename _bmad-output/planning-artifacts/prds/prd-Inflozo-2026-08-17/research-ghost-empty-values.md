---
title: Ghost Empty & Fallback Data
status: normative-companion
role: normative companion to prd.md — the evidence base for FR-H8 empty-value handling
created: 2026-08-18
source: web research against Ghost docs, Ghost core source, Casper 5.12.1, Source 1.7.1
---

# Ghost Themes: Missing, Empty and Fallback Data — Research Reference

**Purpose.** Decide how the Inflozo visual theme builder should behave when a design element is bound to a Ghost field that turns out to be empty.

**Sources read (not from memory).**

| Source | Version / ref | URL |
|---|---|---|
| Casper (Ghost default theme) | `5.12.1`, `main` | <https://github.com/TryGhost/Casper> |
| Source (Ghost default theme) | `1.7.1`, `main` | <https://github.com/TryGhost/Source> |
| Ghost core helpers | `main` | <https://github.com/TryGhost/Ghost/tree/main/ghost/core/core/frontend/helpers> |
| Ghost setup service | `main` | <https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/auth/setup.js> |
| Ghost default settings | `main` | <https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/data/schema/default-settings/default-settings.json> |
| Ghost fixtures | `main` | <https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/data/schema/fixtures/fixtures.json> |
| Handlebars `if`/`unless` | `master` | <https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/helpers/if.js> |
| Ghost theme docs | live | <https://docs.ghost.org/themes/helpers> |
| HTML Standard (images) | live | <https://html.spec.whatwg.org/multipage/images.html> |
| MDN `:empty` | live | <https://developer.mozilla.org/en-US/docs/Web/CSS/:empty> |

---

## 1. Guard patterns in real themes

### 1.1 The catalog

Every distinct guard pattern found in Casper and Source, with what it protects against.

---

#### Pattern A — Hide the whole element (`{{#if x}}…{{/if}}`)

The single most common pattern. The element and its wrapper both disappear.

`Casper/index.hbs:34-36` — <https://github.com/TryGhost/Casper/blob/main/index.hbs>

```handlebars
{{#if @site.description}}
    <p class="site-description">{{@site.description}}</p>
{{/if}}
```

`Casper/post.hbs:28-30`

```handlebars
{{#if custom_excerpt}}
    <p class="article-excerpt">{{custom_excerpt}}</p>
{{/if}}
```

`Source/post.hbs:16-18` — <https://github.com/TryGhost/Source/blob/main/post.hbs>

```handlebars
{{#if custom_excerpt}}
    <p class="gh-article-excerpt is-body">{{custom_excerpt}}</p>
{{/if}}
```

`Casper/author.hbs:41-43`

```handlebars
{{#if bio}}
    <div class="post-card-excerpt">{{bio}}</div>
{{/if}}
```

`Source/author.hbs:17-19`

```handlebars
{{#if bio}}
    <p class="gh-article-excerpt">{{bio}}</p>
{{/if}}
```

**Protects against:** an empty block element that still occupies its own margin/line box. Note that in Casper the `<p class="site-description">` is `font-size: 6rem` (`Casper/assets/css/screen.css:187-194`) — an unguarded empty `<p>` there would leave a ~6.6rem-tall gap in the hero.

---

#### Pattern B — Substitute a different real field (`{{#if x}}…{{else}}…{{/if}}`)

Not "hide": **swap in another genuine data source.** This is how Ghost themes express "show A, else show B".

`Casper/default.hbs:31-37` — logo falls back to the site title *as text*:

```handlebars
<a class="gh-head-logo{{#unless @site.logo}} no-image{{/unless}}" href="{{@site.url}}">
    {{#if @site.logo}}
        <img src="{{@site.logo}}" alt="{{@site.title}}">
    {{else}}
        {{@site.title}}
    {{/if}}
</a>
```

`Source/partials/components/navigation.hbs:5-11` — identical strategy:

```handlebars
<a class="gh-navigation-logo is-title" href="{{@site.url}}">
    {{#if @site.logo}}
        <img src="{{@site.logo}}" alt="{{@site.title}}">
    {{else}}
        {{@site.title}}
    {{/if}}
</a>
```

`Casper/index.hbs:27-33` — logo falls back to an `<h1>` site title:

```handlebars
{{#match @custom.navigation_layout "Logo on cover"}}
    {{#if @site.logo}}
        <img class="site-logo" src="{{@site.logo}}" alt="{{@site.title}}">
    {{else}}
        <h1 class="site-title">{{@site.title}}</h1>
    {{/if}}
{{/match}}
```

`Casper/post.hbs:38-44` — missing avatar falls back to an inline SVG icon partial:

```handlebars
{{#if profile_image}}
<a href="{{url}}" class="author-avatar" aria-label="Read more of {{name}}">
    <img class="author-profile-image" src="{{img_url profile_image size="xs"}}" alt="{{name}}" loading="eager" />
</a>
{{else}}
<a href="{{url}}" class="author-avatar author-profile-image" aria-label="Read more of {{name}}">{{> "icons/avatar"}}</a>
{{/if}}
```

`Casper/post.hbs:75` and `Source/partials/feature-image.hbs:11` — alt text falls back to the title:

```handlebars
alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
```

`Casper/tag.hbs:32-38` — tag description falls back to a *computed* string:

```handlebars
<div class="post-card-excerpt">
    {{#if description}}
        {{description}}
    {{else}}
        {{plural ../pagination.total empty=(t "A collection of 0 posts") singular=(t "A collection of 1 post") plural=(t "A collection of {numberOfPosts} posts" numberOfPosts=../pagination.total)}}
    {{/if}}
</div>
```

**This is the closest analogue to the Inflozo binding question and deserves the most weight — see §7.**

`Source/partials/components/header-content.hbs:66` and `:72` — a **user-authored theme setting** with the Ghost field as the fallback:

```handlebars
<h1 class="gh-header-title is-title">{{#if @custom.header_text}}{{@custom.header_text}}{{else}}{{@site.description}}{{/if}}</h1>
```

`Source/partials/components/footer.hbs:7-12` — the same chain, twice:

```handlebars
<h2 class="gh-footer-signup-header is-title">
    {{#if @custom.signup_heading}}{{@custom.signup_heading}}{{else}}{{@site.title}}{{/if}}
</h2>
<p class="gh-footer-signup-subhead is-body">
    {{#if @custom.signup_subheading}}{{@custom.signup_subheading}}{{else}}{{@site.description}}{{/if}}
</p>
```

`Source/partials/components/cta.hbs:10-15` — again:

```handlebars
<h2 class="gh-cta-title is-title">
    {{#if @custom.signup_heading}}{{@custom.signup_heading}}{{else}}{{@site.title}}{{/if}}
</h2>
<p class="gh-cta-description is-body">
    {{#if @custom.signup_subheading}}{{@custom.signup_subheading}}{{else}}{{@site.description}}{{/if}}
</p>
```

Note the priority order: **the text the user typed into theme settings wins; the Ghost field is the fallback.** And note the element is *never hidden* — the `<h1>`/`<p>` always renders in these layouts.

---

#### Pattern C — Fall back to a translated literal (`{{#unless x}}…{{else}}…{{/unless}}`)

`Source/partials/components/post-list.hbs:12-16`

```handlebars
{{#if showTitle}}
    <h2 class="gh-container-title">
        {{#unless title}}{{t "Latest"}}{{else}}{{title}}{{/unless}}
    </h2>
{{/if}}
```

**Protects against:** an empty section heading. Ghost's own theme is willing to hard-code a literal string (`"Latest"`) as the fallback for a missing field. It does not hide the heading.

---

#### Pattern D — Class modifier instead of element removal (`{{#unless x}} class{{/unless}}`)

`Casper/default.hbs:31`

```handlebars
<a class="gh-head-logo{{#unless @site.logo}} no-image{{/unless}}" href="{{@site.url}}">
```

`Source/tag.hbs:7`

```handlebars
<section class="gh-archive{{#if feature_image}} has-image{{/if}}{{#if @custom.show_publication_info_sidebar}} has-sidebar{{/if}} gh-inner">
```

`Source/partials/components/header-content.hbs:1`

```handlebars
<section class="gh-header is-{{#match headerStyle "Magazine"}}magazine{{else …}}classic{{/match}}{{#if @custom.background_image}}{{#if @site.cover_image}} has-image{{/if}}{{/if}} gh-outer">
```

**Protects against:** layout rules that must differ when the optional content is absent. The element stays; CSS adapts. Note the nested double-guard in `header-content.hbs` — the class is only applied when the setting is on **and** the image exists.

---

#### Pattern E — Block helper as an implicit existence guard (`{{#primary_tag}}`, `{{#author}}`, `{{#tag}}`, `{{#post}}`)

`Casper/post.hbs:16-20`

```handlebars
{{#primary_tag}}
    <span class="post-card-primary-tag">
        <a href="{{url}}">{{name}}</a>
    </span>
{{/primary_tag}}
```

Handlebars' built-in block-context behavior: if `primary_tag` is falsy, the block does not render at all. Source prefers the explicit form for the same field — `Source/post.hbs:12-14`:

```handlebars
{{#if primary_tag}}
    <a class="gh-article-tag" href="{{primary_tag.url}}">{{primary_tag.name}}</a>
{{/if}}
```

**Both themes guard `primary_tag`; they just use different syntax.** Source's explicit form with dotted access is the clearer one to generate.

---

#### Pattern F — Feature-flag guards (`{{#if @site.members_enabled}}`)

`Casper/post.hbs:102-118` — four nested guards before rendering a signup CTA:

```handlebars
{{#if @site.members_enabled}}
{{#unless @member}}
{{#unless @site.comments_enabled}}
{{#if access}}
    <section class="footer-cta outer">
        <div class="inner">
            {{#if @custom.email_signup_text}}<h2 class="footer-cta-title">{{@custom.email_signup_text}}</h2>{{/if}}
            …
        </div>
    </section>
{{/if}}
{{/unless}}
{{/unless}}
{{/if}}
```

`Source/partials/components/cta.hbs:1-6` — same idea, guards on membership *and* on having enough posts:

```handlebars
{{#if @site.members_enabled}}
    {{#unless @member}}
        {{#match @custom.header_style "!=" "Landing"}}
        {{#match @custom.header_style "!=" "Search"}}
        {{#match @custom.header_style "!=" "Off"}}
        {{#match posts.length ">=" 7}}
```

`Casper/default.hbs:44-70` and `Source/partials/components/navigation.hbs:21-49` use `{{#unless @site.members_enabled}}…{{else}}…{{/unless}}` to restructure the whole header actions area.

**`@site.members_enabled` is always guarded and is never output as a value** — it is a boolean switch, not display data.

---

#### Pattern G — Guard the *query result*, not the field (`{{#get}}` + `{{#if}}`)

`Casper/post.hbs:128-140`

```handlebars
{{#get "posts" filter="id:-{{id}}" limit="3" as |more_posts|}}
    {{#if more_posts}}
        <aside class="read-more-wrap outer">
            …
        </aside>
    {{/if}}
{{/get}}
```

`Source/post.hbs:71-84` — identical shape with `{{#if next}}`.

**Protects against:** rendering an empty "Read more" section with a heading and zero cards on a site with only one post — a real fresh-install condition.

---

#### Pattern H — Partial-block failover for a missing partial

`Casper/default.hbs:86-93` and `Source/partials/components/footer.hbs:19-26`

```handlebars
{{#social_accounts @site}}
    <a href="{{href}}" target="_blank" rel="noopener" aria-label="{{name}}">
        {{#> (concat "icons/" type)}}
            {{!-- Fallback rendered when no per-platform icon partial exists --}}
            <span>{{name}}</span>
        {{/undefined}}
    </a>
{{/social_accounts}}
```

A Handlebars *partial block*: if the dynamically-named partial `icons/<type>` does not exist, the block body renders instead. The comment is Ghost's own. **Protects against:** a social platform with no shipped icon rendering an empty link.

---

#### Pattern I — CSS-level empty guard (`:not(:empty)`) plus an HTML-comment whitespace hack

This one is the most instructive for the Inflozo decision.

`Source/partials/post-card.hbs:32-44` — a footer whose every child is conditional:

```handlebars
<footer class="gh-card-meta">
    {{#unless access}}
        {{^has visibility="public"}}
            {{> "icons/lock"}}
        {{/has}}
    {{/unless}}<!--
 -->{{#if @custom.show_author}}
        <span class="gh-card-author">{{{t "By {authors}" authors=(authors autolink="false" separator=", ") }}}</span>
    {{/if}}
    {{#if @custom.show_publish_date}}
        <time class="gh-card-date" datetime="{{date format="YYYY-MM-DD"}}">{{date format="DD MMM YYYY"}}</time>
    {{/if}}<!--
 --></footer>
```

`Source/assets/css/screen.css:983-985`

```css
.gh-card-meta:not(:empty) {
    margin-top: 8px;
}
```

Read those two together. Every child of `.gh-card-meta` is optional, so the footer *can* legitimately render empty. Rather than leave a stray 8px, Source applies the margin **only when the element is non-empty**. And because `:empty` does **not** match an element containing whitespace — MDN: *"Children can be either element nodes or text (including whitespace). Comments, processing instructions, and CSS `content` do not affect whether an element is considered empty"*, and the Selectors Level 4 whitespace-tolerant behavior *"no browser currently supports"* (<https://developer.mozilla.org/en-US/docs/Web/CSS/:empty>) — the `<!--` … `-->` comments exist purely to swallow the newline-and-indent between the conditional blocks so that `:empty` actually matches.

The same `:not(:empty)` guard is repeated at `screen.css:1060`, `:1230`, `:1537`, `:1696` for each layout variant.

**Takeaway: when the Ghost core team could not avoid a sometimes-empty container, they went to considerable lengths to make the empty case collapse to zero space — not to fill it with a placeholder.**

---

### 1.2 Always guarded vs. always bare

Result of a full grep of every `.hbs` in both themes.

**Always guarded — no bare usage anywhere in either theme:**

| Field | Guard used |
|---|---|
| `feature_image` | `{{#if}}` wrapping the entire `<figure>`/`<a>` (Casper `post.hbs:64`, `page.hbs:18`, `tag.hbs:11`, `partials/post-card.hbs:6`; Source `partials/feature-image.hbs:1`, `partials/post-card.hbs:3`) |
| `feature_image_alt` | `{{#if}}…{{else}}{{title}}{{/if}}` inside `alt` |
| `feature_image_caption` | `{{#if}}` wrapping `<figcaption>` |
| `@site.logo` | `{{#if}}…{{else}}{{@site.title}}{{/if}}` (never hidden — always substituted) |
| `@site.cover_image` | `{{#if}}` (Casper `index.hbs:8`, Source `header-content.hbs:7`) |
| `@site.icon` | `{{#if}}` (Source `post-list.hbs:92`) |
| `@site.description` | `{{#if}}` in Casper `index.hbs:34` and Source `post-list.hbs:96`; `{{else}}` **fallback target** in Source `header-content.hbs:66,72`, `footer.hbs:11`, `cta.hbs:14` |
| `custom_excerpt` | `{{#if}}` in all four sites |
| `excerpt` | `{{#if}}` (Casper `post-card.hbs:61`; Source `post-card.hbs:28`) |
| `primary_tag` | `{{#primary_tag}}` (Casper) / `{{#if primary_tag}}` (Source) |
| author `bio` | `{{#if bio}}` |
| author `profile_image` | `{{#if}}…{{else}}{{> "icons/avatar"}}{{/if}}` in post context; plain `{{#if}}` on author pages |
| author `cover_image` | `{{#if}}` (Casper `author.hbs:12`) |
| author `location`, `website`, `twitter`, `facebook`, `linkedin`, `bluesky`, `threads`, `mastodon`, `tiktok`, `youtube`, `instagram` | one `{{#if}}` each |
| tag `description` | `{{#if}}…{{else}}{{plural …}}{{/if}}` (Casper) / `{{#if}}` (Source) |
| `reading_time` | `{{#if reading_time}}` |
| `comments` | `{{#if comments}}` |
| `@site.members_enabled` | `{{#if}}` / `{{#unless}}` — switch only, never output |
| `@site.comments_enabled`, `@site.recommendations_enabled`, `@site.paid_members_enabled`, `@site.members_invite_only`, `@member`, `access` | `{{#if}}` / `{{#unless}}` |
| every `@custom.*` setting | `{{#if}}` or `{{#match}}` |

**Always bare — never guarded in either theme:**

| Field | Where |
|---|---|
| `@site.title` | Casper `default.hbs:35,83`, `index.hbs:31`; Source `navigation.hbs:9`, `footer.hbs:34`, `post-list.hbs:95` |
| `@site.url` | every `href="{{@site.url}}"` |
| `@site.locale` | `<html lang="{{@site.locale}}">` |
| post `title` | Casper `post.hbs:26`, `page.hbs:16`; Source `post.hbs:15`, `page.hbs:11`, `post-card.hbs:23` |
| tag / author `name` | Casper `tag.hbs:30`, `author.hbs:38`; Source `tag.hbs:10`, `author.hbs:14` |
| `url` | `href="{{url}}"` everywhere |
| `content` | `{{content}}` |
| `authors` | `{{authors}}` |
| `date` | `{{date format="…"}}` |
| `meta_title` | `<title>{{meta_title}}</title>` |
| `post_class`, `body_class` | class attributes |

**The rule the official themes follow:** *fields Ghost guarantees are non-empty are used bare; everything optional is guarded.* `@site.title`, post `title` and `name` are required at the database/UI level, so they are never checked. Every nullable field is checked, without exception.

**One caveat worth knowing.** Casper uses `alt="{{title}}"` on the tag cover image (`tag.hbs:22`) and the author cover image (`author.hbs:23`), but tag and author objects have no `title` property — they have `name`. Ghost's `title` helper is `return new SafeString(escapeExpression(this.title || ''));` (<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/frontend/helpers/title.js>), so those render `alt=""`. The official theme ships an unguarded expression that is always empty. It is harmless (`alt=""` is valid and marks the image decorative) but it demonstrates that even Ghost's own theme is not perfectly disciplined.

---

## 2. Handlebars truthiness in Ghost

### 2.1 What `{{#if}}` treats as falsy

Ghost does not replace Handlebars' `if`. It is the stock implementation.

<https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/helpers/if.js>

```js
instance.registerHelper('if', function (conditional, options) {
  if (arguments.length != 2) {
    throw new Exception('#if requires exactly one argument');
  }
  if (isFunction(conditional)) {
    conditional = conditional.call(this);
  }
  // Default behavior is to render the positive path if the value is truthy and not empty.
  // The `includeZero` option may be set to treat the conditional as purely not empty based on the
  // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
  if ((!options.hash.includeZero && !conditional) || isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});
```

<https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/utils.js#L84>

```js
export function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}
```

Ghost's docs state the same rules (<https://docs.ghost.org/themes/helpers/functional/if>):

> The if helper takes a single value, and evaluates whether it is true or false. Any passed in value which is equivalent to `false`, `0`, `undefined`, `null`, `""` (an empty string) or `[]` (an empty array) is considered false, and any other value is considered true.

### 2.2 The truth table

| Value | `{{#if}}` | Notes |
|---|---|---|
| `false` | **falsy** | |
| `null` | **falsy** | what Ghost returns for an unset image/text column |
| `undefined` | **falsy** | what you get for a misspelled field name |
| `""` (empty string) | **falsy** | |
| `[]` (empty array) | **falsy** | special-cased in `isEmpty` |
| `{}` (empty object) | **truthy** | `isEmpty` only special-cases arrays. The docs claim "Empty arrays or objects will be false" — **the docs are wrong about objects.** An empty object passes `{{#if}}`. |
| `0` | **falsy** by default | `includeZero=true` flips it: `{{#if x includeZero=true}}` |
| `"0"` (string zero) | **truthy** | non-empty string |
| `" "` (whitespace only) | **truthy** | **a single space passes every guard in both themes** |
| `"false"` (string) | **truthy** | |
| `NaN` | **falsy** | |

**Two traps for a builder:**

1. **Whitespace-only is truthy.** A user who types a space into the Ghost description field gets `<p class="site-description"> </p>` through Casper's guard. Ghost's setup service defends against this at write time with `.trim()` (§6), but the Admin settings form does not necessarily. If the builder does its own emptiness check anywhere, it should trim; if it relies on `{{#if}}`, it inherits this behavior.
2. **Empty object is truthy**, contradicting the docs. Relevant if you ever bind to a nested object rather than a scalar.

### 2.3 Does Ghost add its own truthy helpers?

Yes — two, and neither is a drop-in for `{{#if}}`.

**`{{#match}}`** (<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/frontend/helpers/match.js>) deliberately reimplements `if`'s logic. The source comment says so:

```js
/**
 * This is identical to the built-in if helper, except inverse/fn calls are replaced with false/true
 * https://github.com/handlebars-lang/handlebars.js/blob/…/lib/handlebars/helpers/if.js#L9-L20
 */
function isEmptyValue(value) {
    if (!value && value !== 0) {
        return true;
    } else if (Array.isArray(value) && value.length === 0) {
        return true;
    } else {
        return false;
    }
}
```

With one argument, `{{#match x}}` is exactly `{{#if x}}`. With two, it is `===`. With three, the middle argument is an operator: `=`, `!=`, `>`, `>=`, `<`, `<=`, `~` (contains), `~^` (starts with), `~$` (ends with).

Critically, `match` compares **by type as well as value** (<https://docs.ghost.org/themes/helpers/functional/match>):

```handlebars
{{!-- Returns true/false --}}
{{#match feature_image true}}...{{else}}...{{/match}}

{{!-- Always returns false --}}
{{#match feature_image 'true'}}...{{else}}...{{/match}}
```

`match` also works in non-block position, returning a `SafeString` of `"true"`/`"false"`.

**`{{#has}}`** (<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/frontend/helpers/has.js>) is **not** a general truthiness test. It only accepts a fixed set of named attributes:

```js
const validAttrs = ['tag', 'author', 'slug', 'visibility', 'id', 'number', 'index', 'any', 'all'];
```

`{{#has feature_image}}` is **not valid syntax** — you must write `{{#has any="feature_image"}}`. With no recognised attribute the helper logs `Invalid or no attribute given to has helper` and returns `undefined`, meaning **neither the `{{#has}}` block nor the `{{else}}` block renders.**

### 2.4 `{{#if x}}` vs `{{#has x}}` — the actual difference

| | `{{#if x}}` | `{{#has …}}` |
|---|---|---|
| Syntax | positional argument | named attributes only, from the fixed list |
| Purpose | is this one value truthy | ask a *question* about the current context |
| Emptiness test | Handlebars `isEmpty` | lodash `_.isEmpty` (for `any`/`all`) |
| Multiple values | no | yes — multiple attributes are OR'd |
| Docs | <https://docs.ghost.org/themes/helpers/functional/if> | <https://docs.ghost.org/themes/helpers/functional/has> |

Ghost's docs put it as: *"`{{#has}}` is like `{{#if}}` but with the ability to do more than test a boolean. It allows theme developers to ask questions about the current context."*

**A genuine landmine.** The `any`/`all` forms use lodash's `_.isEmpty`, not Handlebars' `isEmpty`:

```js
function evaluateList(type, expr, obj, data) {
    return expr.split(',').map(function (prop) {
        return prop.trim().toLocaleLowerCase();
    })[type](function (prop) {
        if (prop.match(/^@/)) {
            return _.has(data, prop.replace(/@/, '')) && !_.isEmpty(_.get(data, prop.replace(/@/, '')));
        } else {
            return _.has(obj, prop) && !_.isEmpty(_.get(obj, prop));
        }
    });
}
```

`_.isEmpty` returns `true` for **numbers and booleans** — `_.isEmpty(5) === true`, `_.isEmpty(true) === true` — because they have no enumerable own properties. So `{{#has any="reading_time"}}` is **false even when `reading_time` is 7**. `{{#has any="…"}}` is only reliable for strings, arrays and objects. Note also that `evaluateList` lowercases each property name, so camelCase property paths will not resolve.

Both themes use `{{#has}}` only for its intended questions — `{{#has visibility="members"}}`, `{{#has index="0"}}`, `{{#has index="1,2"}}` (Casper `partials/post-card.hbs:4,26`) — never as a null check.

**For the builder: emit `{{#if}}`. Never emit `{{#has}}` for an emptiness guard.**

---

## 3. Ghost's own fallback helpers

### 3.1 There is no coalescing helper

Confirmed against the complete utility-helper index (<https://docs.ghost.org/themes/helpers/utility>):

> asset, block, body_class, color_to_rgba, concat, contrast_text_color, encode, ghost_head, ghost_foot, link_class, log, json, pagination, partials, plural, post_class, prev_post, next_post, reading_time, search, split, translate

And the functional-helper index (<https://docs.ghost.org/themes/helpers/functional>): `foreach`, `get`, `has`, `if`, `is`, `match`, `unless`.

**There is no `{{or}}`, no `{{and}}`, no `{{not}}`, no `{{default}}`, no `{{coalesce}}`, and no default-value parameter on any data helper.** Ghost ships no subexpression logic helpers at all. A theme cannot write `{{or a b}}` or `{{#if (or a b)}}` without adding a custom helper, which Ghost does not permit in themes.

### 3.2 `{{#unless}}` exists

It is Handlebars' built-in, registered alongside `if` in the same file:

```js
instance.registerHelper('unless', function (conditional, options) {
  if (arguments.length != 2) {
    throw new Exception('#unless requires exactly one argument');
  }
  return instance.helpers['if'].call(this, conditional, {
    fn: options.inverse,
    inverse: options.fn,
    hash: options.hash,
  });
});
```

Ghost documents it (<https://docs.ghost.org/themes/helpers/functional/unless>) and notes it *"uses the exact same conditional evaluation rules as `{{#if}}`"* — and advises against `{{#unless}}…{{else}}`:

> If you want, you can also include an else block, although in the majority of cases, if you need an else, then using `{{#if}}` is more readable

Both themes use `{{#unless}}` heavily, including with `{{else}}` (Casper `default.hbs:52-70`, Source `navigation.hbs:29-49`).

### 3.3 The idiomatic "show A, else show B"

**`{{#if A}}{{A}}{{else}}{{B}}{{/if}}`, written inline, on one line.** That is the entire convention. Every instance in both themes:

| Location | Chain |
|---|---|
| `Source/header-content.hbs:66,72` | `@custom.header_text` → `@site.description` |
| `Source/footer.hbs:8` | `@custom.signup_heading` → `@site.title` |
| `Source/footer.hbs:11` | `@custom.signup_subheading` → `@site.description` |
| `Source/cta.hbs:11` | `@custom.signup_heading` → `@site.title` |
| `Source/cta.hbs:14` | `@custom.signup_subheading` → `@site.description` |
| `Casper/default.hbs:32-36`, `Casper/index.hbs:28-32`, `Casper/error.hbs:32-37`, `Source/navigation.hbs:6-10`, `Source/footer.hbs:31-35` | `@site.logo` → `@site.title` |
| `Casper/post.hbs:75`, `page.hbs:29`, `post-card.hbs:18`, `Source/feature-image.hbs:11`, `post-card.hbs:14` | `feature_image_alt` → `title` |
| `Casper/post.hbs:38-44`, `Source/post.hbs:25-31` | `profile_image` → `{{> "icons/avatar"}}` |
| `Casper/tag.hbs:33-37` | tag `description` → `{{plural}}` post count |
| `Source/post-list.hbs:14` | `title` → `{{t "Latest"}}` |
| `Source/post-card.hbs:12` | `imageSizes` param → literal `"320px"` |
| `Source/post-card.hbs:24-31` | `custom_excerpt` → `excerpt` (via `{{#if}}` then `{{#unless}}{{#if}}`) |
| `Casper/default.hbs:88-91`, `Source/footer.hbs:21-24` | `{{#> (concat "icons/" type)}}` partial block → `<span>{{name}}</span>` |

There are **fourteen distinct fallback chains** across the two official themes. This is not a marginal pattern — it is a primary one.

### 3.4 Helpers with fallback behavior built in

Some Ghost helpers coalesce internally, so the theme does not have to:

- **`{{excerpt}}`** (<https://docs.ghost.org/themes/helpers/data/excerpt>) — *"If the post's `custom_excerpt` property is set, then the helper will always output the `custom_excerpt` content… When both `html` and `custom_excerpt` properties are not set… the output is generated from the post's `excerpt` property."* A three-level fallback inside one helper.
- **`{{title}}`** — `escapeExpression(this.title || '')`; coalesces to `''` rather than printing `undefined`.
- **`{{plural}}`** — takes an explicit `empty=` string: `{{plural count empty="No posts" singular="1 post" plural="% posts"}}`.
- **`{{meta_title}}` / `{{ghost_head}}`** — Ghost computes all SEO metadata itself with its own fallback chain (post `meta_title` → post `title` → site title). **The theme's body markup has no effect on the meta tags.** This matters in §7.

---

## 4. The empty-render failure modes

What actually happens when an optional field is unguarded. Ranked by severity.

### 4.1 Real problems

---

**(a) `srcset` becomes a list of bogus relative URLs the browser will actually fetch. — Severity: high.**

This is the worst one and it is not obvious.

Take Casper's post feature image (`post.hbs:69-74`) with the `{{#if feature_image}}` wrapper removed and `feature_image` null. `{{img_url}}` returns `undefined`, which Handlebars renders as the empty string, so the attribute becomes:

```html
srcset=" 300w,
         600w,
         1000w,
         2000w"
src=""
```

Per the HTML Standard's *"parse a srcset attribute"* algorithm (<https://html.spec.whatwg.org/multipage/images.html#parsing-a-srcset-attribute>):

> Splitting loop: Collect a sequence of code points that are ASCII whitespace or U+002C COMMA characters from input given position. … Collect a sequence of code points that are not ASCII whitespace from input given position, and let url be the result. … If url ends with U+002C (,): Remove all trailing U+002C COMMA characters from url.

Walk it through: leading whitespace is skipped, then the non-whitespace run `300w,` is collected as the URL, and the trailing comma is stripped — leaving **`url = "300w"` with an empty descriptor list**, which the descriptor parser resolves to density `1x`. The same happens for `600w`, `1000w`, `2000w`.

The browser therefore has four legitimate-looking candidates and will request one of them **resolved against the document's base URL**. On a post at `/coming-soon/`, that is a real network request to `https://site.com/coming-soon/300w` → 404. The intended width descriptors are silently reinterpreted as filenames.

This is a genuine broken request per page, not a cosmetic issue, and it is invisible in a screenshot.

---

**(b) `<a href="">` links to the current page. — Severity: medium.**

An empty URI reference is a same-document reference under RFC 3986 §4.2 and resolves to the current document. `<a href="">Read more</a>` is a live link that reloads the page. Users click it; it appears to do nothing. Crawlers follow it.

Relevant wherever a bound field supplies a URL — author `website`, a custom link setting. Both themes guard these (`{{#if website}}`, Casper `author.hbs:50-52`, Source `author.hbs:11-15`).

---

**(c) An empty block element still occupies vertical space. — Severity: medium, and design-dependent.**

An empty `<p>` is not zero-height: it establishes a line box and carries its own margins. Its impact scales with the element's own type scale. Casper's `.site-description` (`assets/css/screen.css:187-194`):

```css
.site-description {
    display: inline-block;
    z-index: 10;
    max-width: 960px;
    font-size: 6rem;
    font-weight: 700;
    line-height: 1.1;
}
```

At `font-size: 6rem; line-height: 1.1`, an empty `<p class="site-description">` leaves roughly a **6.6rem hole** in the hero. This is precisely why `index.hbs:34` guards it.

It also breaks structural selectors. Casper's description styling depends on its position relative to siblings (`screen.css:196, 204, 211`):

```css
.site-description:first-child { … }
:is(.site-logo, .site-title) + .site-description {
    max-width: 640px;
    margin-top: 16px;
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1.4;
}
.site-logo + .site-description { margin-top: 20px; }
```

An empty-but-present `<p>` still matches `:first-child` and still consumes the `+` adjacency, so it can alter how a *sibling* is styled — not just leave a gap.

Ghost's own answer to the unavoidable case is `:not(:empty)` (Source `screen.css:983`, §1.1 Pattern I). That is a direct admission that empty containers cause spacing bugs.

---

**(d) Empty flex/grid items still consume a track. — Severity: medium.**

Both themes lay feeds out with grid/flex. An empty `<div>` that is a grid item still occupies a cell and still triggers `gap`. Hiding requires removing the element or `display: none` — `:empty { display: none }` is the CSS equivalent, and Source's `:not(:empty)` is the softer form of the same fix.

---

**(e) Empty headings are an accessibility failure. — Severity: medium.**

An `<h1>` or `<h2>` with no text content is a WCAG problem: screen-reader heading navigation announces an empty heading, and it appears in the document outline as a blank entry. This is a real defect, not cosmetic.

Note this is exactly what Source produces when `@custom.header_text` **and** `@site.description` are both empty (`header-content.hbs:66`):

```html
<h1 class="gh-header-title is-title"></h1>
```

Ghost's own theme has this hole. It is mitigated in practice because `@site.description` is effectively never empty (§6) — which is the point.

---

### 4.2 Not real problems

---

**`<img src="">` does not re-request the page in a modern browser.**

This is a widely repeated claim that is now false. Per the *"update the image data"* algorithm (<https://html.spec.whatwg.org/multipage/images.html>):

> If the element does not use `srcset` or `picture` and it has a `src` attribute specified whose value is not the empty string, then set selected source to the value of the element's `src` attribute

An empty `src` fails that condition, no source is selected, and the request state becomes *broken* — no fetch occurs. The legacy "empty src reloads the page" behavior was removed from the spec and from browsers.

**What you actually get** is a broken-image element: `alt` text is displayed (or nothing if `alt=""`), and the element still occupies layout space if it has CSS dimensions. Cosmetic-to-medium — but see 4.1(a), because in Casper and Source the `src` is never alone; the `srcset` alongside it *is* a real fetch problem.

---

**`alt=""` is valid.**

An empty `alt` is the correct, spec-sanctioned way to mark an image decorative. Casper ships it unintentionally on tag/author cover images (§1.2). Not a bug in itself — though an unintentional one means a meaningful image is hidden from assistive technology.

---

**Empty inline elements collapse.**

An empty `<span>` with no padding/border occupies no space. Harmless.

---

**`{{img_url}}` on `null` does not error.**

It returns `undefined` silently and logs nothing (see §5). No 500, no theme error page. This is why the failure is easy to miss in testing.

---

### 4.3 Summary table

| Failure | Real or cosmetic | Why |
|---|---|---|
| `srcset` with empty URLs → fetches `300w`, `600w`… | **Real, high** | Spec-mandated parse; genuine 404 requests |
| `<a href="">` → links to current page | **Real, medium** | RFC 3986 same-document reference |
| Empty block element occupies margin/line box | **Real, medium** | Scales with type size; Casper hero ≈ 6.6rem gap |
| Empty element breaks `:first-child` / `+` selectors | **Real, medium** | Can restyle *siblings* |
| Empty grid/flex item consumes a track and `gap` | **Real, medium** | |
| Empty `<h1>`/`<h2>` | **Real, medium** | WCAG heading failure |
| `<img src="">` re-requests the page | **Myth** | Spec: no fetch, state = broken |
| Broken-image placeholder | Cosmetic | Occupies space only if sized |
| `alt=""` | Cosmetic / valid | Marks decorative |
| `{{img_url null}}` | Harmless | Returns `undefined`, no warning |

---

## 5. Images specifically

### 5.1 What `{{img_url feature_image size="m"}}` outputs when `feature_image` is null

<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/frontend/helpers/img_url.js>

```js
module.exports = function imgUrl(requestedImageUrl, options) {
    // CASE: if no url is passed, e.g. `{{img_url}}` we show a warning
    if (arguments.length < 2) {
        logging.warn(tpl(messages.attrIsRequired));
        return;
    }

    // CASE: if url is passed, but it is undefined, then the attribute was
    // an unknown value, e.g. {{img_url feature_img}} and we also show a warning
    if (requestedImageUrl === undefined) {
        logging.warn(tpl(messages.attrIsRequired));
        return;
    }

    // CASE: if you pass e.g. cover_image, but it is not set, then requestedImageUrl is null!
    // in this case we don't show a warning
    if (requestedImageUrl === null) {
        return;
    }
    …
```

**Answer:**

- It returns bare `undefined` — a JavaScript `return;`. Handlebars renders `undefined` as the empty string.
- It **does not omit the attribute.** The template already wrote `src="` and `"`; the helper only fills the gap. You get `src=""`, not a missing `src`.
- It **does not error.** No exception, no theme error page.
- The three cases are distinguished by logging, not by output — and all three produce identical markup:

| Input | Log | Output |
|---|---|---|
| `{{img_url}}` (no argument) | `warn: Attribute is required e.g. {{img_url feature_image}}` | empty string |
| `undefined` (misspelled field, e.g. `feature_img`) | same warning | empty string |
| `null` (field exists, not set) | **silent** | empty string |

The `null` case being silent is deliberate and commented as such. It means **the normal, expected empty-image case produces no signal anywhere** — not in the logs, not in the HTML, not as an error. A builder cannot detect it at render time; it must be prevented at template-generation time.

### 5.2 The correct guard pattern

Wrap the entire image element — not the attribute:

```handlebars
{{#if feature_image}}
    <figure class="…">
        <img srcset="…" sizes="…" src="{{img_url feature_image size="xl"}}"
             alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}">
    </figure>
{{/if}}
```

Ghost's own `img_url` documentation leads with exactly this (<https://docs.ghost.org/themes/helpers/data/img_url>):

```handlebars
{{#post}}
  {{!-- Outputs post's feature image if there is one --}}
  {{#if feature_image}}
      <img src="{{img_url feature_image}}">
  {{/if}}
```

Guarding the *attribute* rather than the element is wrong — it leaves the `<img>` in the DOM with an empty `src` and a bogus `srcset`.

### 5.3 What Casper and Source do

**Source centralises it in one partial** — `partials/feature-image.hbs`, the whole file:

```handlebars
{{#if feature_image}}
    <figure class="gh-article-image">
        <img
            srcset="{{img_url feature_image size="s"}} 320w,
                    {{img_url feature_image size="m"}} 600w,
                    {{img_url feature_image size="l"}} 960w,
                    {{img_url feature_image size="xl"}} 1200w,
                    {{img_url feature_image size="xxl"}} 2000w"
            sizes="(max-width: 1200px) 100vw, 1120px"
            src="{{img_url feature_image size="xl"}}"
            alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
        >
        {{#if feature_image_caption}}
            <figcaption>{{feature_image_caption}}</figcaption>
        {{/if}}
    </figure>
{{/if}}
```

The guard is *inside* the partial, so `post.hbs:50`, `page.hbs:15` and `tag.hbs:15` can call `{{> "feature-image"}}` bare and cannot forget it. **This is the pattern the Inflozo compiler should imitate: put the guard in the generated component, not in the caller.**

**Casper repeats the block inline** in four places — `post.hbs:64-83`, `page.hbs:18-35`, `tag.hbs:11-25`, `partials/post-card.hbs:6-36` — each with its own `{{#if feature_image}}`. Same semantics, more duplication.

### 5.4 Sizes are theme-defined, not Ghost-defined

`size="m"` has **no fixed meaning.** It resolves against `config.image_sizes` in the theme's own `package.json` (`img_url.js:93-103` reads `options.data.config.image_sizes`).

Casper (`package.json`) and Source (`package.json`) ship *different* scales:

| Key | Casper | Source |
|---|---|---|
| `xxs` | 30 | — |
| `xs` | 100 | 160 |
| `s` | 300 | 320 |
| `m` | 600 | 600 |
| `l` | 1000 | 960 |
| `xl` | 2000 | 1200 |
| `xxl` | — | 2000 |

Per the docs (<https://docs.ghost.org/themes/responsive-images>):

> Ghost automatically generates copies of images at the specified sizes, and works like a cache, so the image sizes can be changed at any time. It's recommended to have no more than 10 image sizes so media storage doesn't grow out of control.

> Images are generated on the first request for each image at a particular size.

Also from the same page — a hard constraint worth recording:

> Dynamic image sizes are *not* compatible with externally hosted images (except inserted images from Unsplash). If you store your image files on a third party storage adapter, then the image URL returned will be determined by the external source.

Confirmed in `img_url.js:49-61`: non-internal images are returned unchanged (with an Unsplash special case). **A builder that emits `size=` for an externally-hosted image gets the original URL back at full resolution, with no error.**

Requesting a size key that is not in `package.json` silently yields the unresized original.

### 5.5 How `srcset` is built

Both themes use the same shape: `srcset` with `w` descriptors, an explicit `sizes`, and a `src` fallback pointing at a mid-to-large size.

Casper post hero (`post.hbs:68-78`), largest `src`, eager:

```handlebars
<img
    srcset="{{img_url feature_image size="s"}} 300w,
            {{img_url feature_image size="m"}} 600w,
            {{img_url feature_image size="l"}} 1000w,
            {{img_url feature_image size="xl"}} 2000w"
    sizes="(min-width: 1400px) 1400px, 92vw"
    src="{{img_url feature_image size="xl"}}"
    alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
    fetchpriority="high"
    loading="eager"
/>
```

Casper feed card (`partials/post-card.hbs:11-19`), mid `src`, lazy:

```handlebars
<img class="post-card-image"
    srcset="… size="s"}} 300w, … size="m"}} 600w, … size="l"}} 1000w, … size="xl"}} 2000w"
    sizes="(max-width: 1000px) 400px, 800px"
    src="{{img_url feature_image size="m"}}"
    alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
    loading="lazy"
/>
```

Source feed card (`partials/post-card.hbs:5-16`) adds `format="webp"` on every srcset entry, keeps the original format for `src`, and parameterises `sizes`:

```handlebars
<img
    srcset="{{img_url feature_image size="xs" format="webp"}} 160w,
            {{img_url feature_image size="s" format="webp"}} 320w,
            {{img_url feature_image size="m" format="webp"}} 600w,
            {{img_url feature_image size="l" format="webp"}} 960w,
            {{img_url feature_image size="xl" format="webp"}} 1200w,
            {{img_url feature_image size="xxl" format="webp"}} 2000w"
    sizes="{{#if imageSizes}}{{imageSizes}}{{else}}320px{{/if}}"
    src="{{img_url feature_image size="m"}}"
    alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}"
    {{#if lazyLoad}}loading="lazy"{{/if}}
>
```

Three fallbacks in one element: `imageSizes` → `"320px"`, `feature_image_alt` → `title`, and `format="webp"` in `srcset` with the original format in `src` for older browsers.

Conventions both themes share:
- above-the-fold hero → `fetchpriority="high" loading="eager"`, `src` = largest size
- feed cards → `loading="lazy"` (Source passes `lazyLoad=true` as a partial parameter), `src` = `m`
- `alt` always falls back to `title`, never left empty

### 5.6 What the `{{#if feature_image}}` wrapper typically encloses

| Theme / file | Wrapper encloses |
|---|---|
| `Source/partials/feature-image.hbs` | `<figure>` + `<img>` + guarded `<figcaption>` |
| `Casper/post.hbs:64-83` | `<figure class="article-image">` + `<img>` + guarded `<figcaption>` |
| `Casper/page.hbs:18-35` | same |
| `Casper/partials/post-card.hbs:6-36` | `<a class="post-card-image-link">` + `<img>` + the members-only lock badge |
| `Casper/tag.hbs:11-25` | `<div class="post-card-image-link">` + `<img>` |
| `Casper/author.hbs:12-28` | `<div class="post-card-image-link">` + `<img>` (author `cover_image`) |
| `Source/partials/post-card.hbs:3-18` | `<figure class="gh-card-image">` + `<img>` |
| `Casper/index.hbs:7-23` | doubly guarded: `{{#if @custom.show_publication_cover}}` **then** `{{#if @site.cover_image}}` |

**Always the semantic wrapper, never just the `<img>`.** And note Casper `partials/post-card.hbs:51-57`, where the absence of a feature image changes *other* markup — the lock icon moves into the title when there is no image to overlay it on:

```handlebars
<h2 class="post-card-title">
    {{#unless access}}
    {{^has visibility="public"}}
        {{#unless feature_image}}
            {{> "icons/lock"}}
        {{/unless}}
    {{/has}}
    {{/unless}}
    {{title}}
</h2>
```

---

## 6. Fresh-install reality

### 6.1 `@site` defaults

From `default-settings.json` (<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/data/schema/default-settings/default-settings.json>):

| Field | Default value | Empty on fresh install? |
|---|---|---|
| `title` | `"Ghost"` | **No** — and overwritten by the setup wizard |
| `description` | `"Thoughts, stories and ideas"` | **No** — see 6.2 |
| `cover_image` | `"https://static.ghost.org/v5.0.0/images/publication-cover.jpg"` | **No** — a real hosted stock image |
| `accent_color` | `"#FF1A75"` | No |
| `locale` | `"en"` | No |
| `timezone` | `"Etc/UTC"` | No |
| `navigation` | `[{"label":"Home","url":"/"},{"label":"About","url":"/about/"}]` | No |
| `secondary_navigation` | `[{"label":"Sign up","url":"#/portal/"}]` | No |
| `facebook` | `"ghost"` | No |
| `twitter` | `"@ghost"` | No |
| **`logo`** | `""` | **YES — empty** |
| **`icon`** | `""` | **YES — empty** |
| `codeinjection_head` / `_foot` | `""` | Yes (irrelevant to layout) |
| `meta_title`, `meta_description`, `og_image`, `og_title`, `og_description`, `twitter_image`, `twitter_title`, `twitter_description` | `null` | **YES — all null** (consumed by `{{ghost_head}}`, which has its own fallbacks) |
| `members_signup_access` | `"all"` | → `@site.members_enabled` is **true** |
| `comments_enabled` | `"all"` | true |
| `recommendations_enabled` | `false` | false |

### 6.2 `@site.description` is effectively never empty — this is the key finding

The setup wizard accepts a description (`authentication.js:57`) and writes it here — <https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/auth/setup.js#L82-L108>:

```js
async function doSettings(data, settingsAPI) {
    const context = {context: {user: data.user.id}};
    const user = data.user;
    const blogTitle = data.userData.blogTitle;
    const description = data.userData.description ? data.userData.description.trim() : null;

    let userSettings;

    if (!blogTitle || typeof blogTitle !== 'string') {
        return user;
    }

    userSettings = [
        {key: 'title', value: blogTitle.trim()},
        {key: 'description', value: description || tpl(messages.sampleBlogDescription)}
    ];
    …
```

with

```js
const messages = {
    …
    sampleBlogDescription: 'Thoughts, stories and ideas.',
    …
};
```

Three things follow:

1. If the user leaves the description blank during setup, Ghost writes **`"Thoughts, stories and ideas."`** — not an empty string.
2. The value is `.trim()`ed, so a whitespace-only entry also becomes the sample text. Ghost defends against the whitespace-truthiness trap at the write boundary (§2.2).
3. Even if setup is skipped entirely, the schema default is `"Thoughts, stories and ideas"`.

**`@site.description` is non-empty on every fresh Ghost site.** For it to be empty, a user must go into Admin → Settings after setup and deliberately clear the field. This is decisive for §7.

### 6.3 The shipped content

From `fixtures.json` (<https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/data/schema/fixtures/fixtures.json>) — Ghost ships **two** pieces of content plus one tag and one user.

**Post: "Coming soon"** (`slug: coming-soon`)

| Field | Value | Empty? |
|---|---|---|
| `title` | `"Coming soon"` | No |
| `feature_image` | `"https://static.ghost.org/v4.0.0/images/feature-image.jpg"` | **No** |
| `mobiledoc` | short welcome paragraph | No |
| `featured` | `false` | falsy |
| `status` | `published` | |
| `visibility` | `public` | |
| tags | **`News`** — via the relation `{"coming-soon": ["News"]}` | No, so `primary_tag` resolves |
| **`custom_excerpt`** | *not set* | **YES — empty** |
| **`feature_image_alt`** | *not set* | **YES — empty** |
| **`feature_image_caption`** | *not set* | **YES — empty** |

**Page: "About this site"** (`slug: about`)

| Field | Value | Empty? |
|---|---|---|
| `title` | `"About this site"` | No |
| **`feature_image`** | *not set* | **YES — empty** |
| **`custom_excerpt`** | *not set* | **YES — empty** |

Note that the default navigation links to `/about/`, so **the very first page a new user is likely to click has no feature image.**

**Tag: "News"** — `description: null`, `meta_title: null`, `meta_description: null`, and no `feature_image`. Casper's `tag.hbs:11` guard and its `{{plural}}` description fallback both fire on a fresh install.

**Owner user** — `name: "Ghost"` (replaced by the setup wizard), and **no `bio`, no `profile_image`, no `cover_image`, no `website`, no `location`, and no social handles at all.** Every author guard in both themes fires. Casper's `post.hbs` renders `{{> "icons/avatar"}}` instead of an avatar; Casper's and Source's author pages render name-only cards.

### 6.4 What a first-time Inflozo user actually sees

| Binding | Fresh-install state |
|---|---|
| `@site.title` | populated (from setup) |
| `@site.description` | **populated** — user's text or `"Thoughts, stories and ideas."` |
| `@site.cover_image` | **populated** — Ghost's stock cover |
| `@site.logo` | **empty** |
| `@site.icon` | **empty** |
| `@site.members_enabled` | **true** |
| post `title` | populated |
| post `feature_image` | populated on the post, **empty on the About page** |
| post `custom_excerpt` | **empty** on both |
| post `excerpt` | populated (auto-generated from content) |
| `primary_tag` | populated (`News`) on the post; **empty on the page** |
| `reading_time` | populated (small) |
| author `name` | populated |
| author `bio` | **empty** |
| author `profile_image` | **empty** |
| author `cover_image`, `location`, `website`, socials | **empty** |
| tag `description`, tag `feature_image` | **empty** |

**Summary: the empty-field problem on a fresh install is overwhelmingly about images and author metadata, not about site text.** A builder that reasons "the user's site will be empty at first, so text bindings will render blank" is reasoning from a false premise.

---

## 7. The design question — recommendation

### 7.1 Restating it precisely

The user places a hero subtitle, types "Words that matter", and binds it to `@site.description`. At render time `@site.description` is empty. Options:

- **(a) HIDE** — emit `{{#if @site.description}}<p class="hero-sub">{{@site.description}}</p>{{/if}}`. The element vanishes.
- **(b) FALL BACK** — emit `{{#if @site.description}}{{@site.description}}{{else}}Words that matter{{/if}}` inside a `<p>` that always renders.

There is a third possibility that must be ruled out first.

### 7.2 The one option that is definitively wrong

**Never emit a bare `{{@site.description}}`.** Both official themes guard every optional field without exception (§1.2), the failure modes are real (§4), and the failure is silent — `{{img_url}}` on `null` logs nothing (§5.1), and an empty `<p>` produces no error anywhere. Whatever else is decided, the compiler must always emit a guard. Both (a) and (b) satisfy this; the unguarded case must not be reachable.

### 7.3 What Ghost themes actually do

Both behaviors have precedent, which is why the question is genuinely open. But they are not used interchangeably — there is a discernible rule.

**Ghost themes hide when there is no meaningful substitute:**

- `feature_image` → hide the whole `<figure>`. There is nothing sensible to put in a hero image's place.
- `@site.cover_image` → hide.
- author `cover_image`, `bio`, `location`, socials → hide.
- `custom_excerpt` → hide (Casper) or fall through to `excerpt` (Source).

**Ghost themes substitute when a sensible alternative exists — fourteen separate chains (§3.3):**

- `@site.logo` → `@site.title` as text. **Never hidden.** Five separate locations.
- `profile_image` → an inline avatar SVG. **Never hidden** in post context.
- `feature_image_alt` → `title`.
- tag `description` → a computed `{{plural}}` post count.
- section `title` → the literal `{{t "Latest"}}`.
- `@custom.header_text` → `@site.description`.
- `@custom.signup_heading` → `@site.title`; `@custom.signup_subheading` → `@site.description`.

**The principle both themes obey: never render an empty box.** Either put something real in it, or take the box out. The forbidden state is an element that renders but is blank — which is exactly what an unguarded binding produces, and exactly what Source's `:not(:empty)` CSS plus HTML-comment whitespace hack (§1.1 Pattern I) exists to neutralise in the one case they could not design away.

### 7.4 Which side does a bound design element fall on?

**It has a meaningful substitute — the user typed one.**

This is the crux. The static text is not tool boilerplate like "Lorem ipsum" or "Your tagline here". It is authored content: the user wrote it, saw it on the canvas, and approved the design containing it. That makes the (b) fallback structurally identical to Source's `header-content.hbs:66`:

```handlebars
{{#if @custom.header_text}}{{@custom.header_text}}{{else}}{{@site.description}}{{/if}}
```

Both are "two authored sources, use whichever exists". The priority order differs — Source puts the theme setting first and the Ghost field second, whereas the builder would put the Ghost field first and the typed text second — but the shared property is the one that matters: **the element always renders, and it renders empty only if both sources are empty.**

A Ghost theme developer looking at generated output like `{{#if @site.description}}{{@site.description}}{{else}}Words that matter{{/if}}` would recognise it immediately. It is a normal, idiomatic Ghost template.

### 7.5 The four dimensions

**Layout stability — favours (b), strongly.**

The user composed a specific layout. Casper's `.site-description` is `font-size: 6rem` with `:first-child` and `+`-adjacency rules (`screen.css:187-215`, §4.1c). A hero subtitle disappearing from a design that was built around it does not "close up neatly" — it changes vertical rhythm, can restyle its siblings through adjacency selectors, and leaves a composition the user never saw or approved. Hiding is safe when the *theme author* anticipated both states and wrote CSS for both, as Casper did. In a builder, nobody wrote the no-subtitle variant.

**First-run experience — favours (b), but the risk is smaller than it looks.**

`@site.description` is populated on every fresh install — either the user's own setup text or `"Thoughts, stories and ideas."` (§6.2). **For text bindings the fallback will almost never fire.** It is insurance, not the common path. That both lowers the stakes and removes the main argument against (b): there is little risk of a stale builder string being visible on a real site, because the bound field will normally have content.

Where empties genuinely dominate on a fresh install is images and author fields (§6.4) — and those are precisely the fields Ghost's own themes handle by hiding.

**What happens when the user later fills the field in — favours (b), clearly.**

- With **(b)**, the box is occupied at all times. Filling the field is a *text swap*: no reflow, no layout shift, no CLS. Clearing it later returns the design text. It degrades gracefully in both directions.
- With **(a)**, filling the field makes an element *pop into existence*. Everything below it moves. The user's first experience of "I added a description" is an unexplained layout jump — and on a hero element that is a large one.

**SEO — near-neutral, with a small edge to (b).**

The critical de-risking fact: Ghost generates all SEO metadata inside `{{ghost_head}}`, independently of body markup, with its own fallback chain (§3.4). Casper's `default.hbs` head is only `<title>{{meta_title}}</title>` plus `{{ghost_head}}`. **Whichever option is chosen has zero effect on `<meta name="description">`, Open Graph, Twitter cards, or structured data.** The SEO question is confined to on-page text.

On that narrow question: an empty `<h1>`/`<h2>` is an accessibility and outline defect (§4.1e), so (a) is better than *unguarded*, and (b) is better than (a) because a heading with real text is better than a missing one. The usual objection to fallbacks — boilerplate duplicated across thousands of sites — does not apply, because the fallback string is whatever this particular user typed, not a tool-supplied default.

**Accessibility — favours (b).** No empty headings; no removed landmark; assistive-technology output matches what the user designed.

### 7.6 Recommendation

**Default to (b) FALL BACK for text bindings. Default to (a) HIDE for media bindings. Expose it as a per-binding toggle. Never allow the unguarded third state.**

Concretely:

| Binding target | Default | Generated |
|---|---|---|
| Text — `@site.description`, `@site.title`, `custom_excerpt`, `bio`, tag `description`, `@custom.*` | **fall back to typed text** | `{{#if X}}{{X}}{{else}}Typed text{{/if}}` inside the element |
| Image — `feature_image`, `@site.cover_image`, `@site.logo`, `profile_image`, author `cover_image` | **hide the element** | `{{#if X}}<figure>…</figure>{{/if}}` |
| Link `href` | **hide the element** | never emit a possibly-empty `href` (§4.1b) |
| Boolean — `@site.members_enabled`, `featured`, `access` | **hide** | switch, never rendered as a value |

**Two refinements worth taking:**

1. **For `@site.logo` specifically, follow Casper and Source and fall back to `@site.title` as text**, not to hiding — all five occurrences across both themes do this, and it is the one image field with a universally sensible textual substitute. `@site.logo` is empty on every fresh install (§6.1), so this path fires constantly.
2. **Put the guard inside the generated component, the way Source's `partials/feature-image.hbs` does** (§5.3) — one guarded partial that callers invoke bare, rather than a guard repeated at every call site as Casper does. It makes "forgot the guard" structurally impossible rather than a lint rule.

**Why this split rather than one flat answer:** it is precisely the rule the official themes follow. Substitute when a real alternative exists; remove the element when none does. For a bound design element the user *has* supplied an alternative — they typed it — so text bindings get the substitution. For an image binding they have not supplied an alternative image, so the element goes, exactly as `{{#if feature_image}}` does in every template in both themes.

**Surface it in the UI.** When a user binds an element, show the binding *and* the fallback: `@site.description → "Words that matter"`. That makes the behavior legible, lets them clear the fallback to opt into hiding, and matches how a Ghost developer already reads `{{#if a}}{{a}}{{else}}{{b}}{{/if}}`.

**And put the whitespace guard in.** `{{#if}}` treats `" "` as truthy (§2.2). Ghost's own setup service `.trim()`s before writing (§6.2) but Admin does not guarantee it everywhere. If Inflozo ever evaluates emptiness itself — in the canvas preview, for instance — trim first, so the preview and the rendered site agree.

---

## Appendix — quick reference for the compiler

```handlebars
{{!-- TEXT binding, default: fall back to the user's typed text --}}
<p class="hero-sub">{{#if @site.description}}{{@site.description}}{{else}}Words that matter{{/if}}</p>

{{!-- TEXT binding, user chose "hide when empty" --}}
{{#if @site.description}}<p class="hero-sub">{{@site.description}}</p>{{/if}}

{{!-- IMAGE binding, default: hide the whole element --}}
{{#if feature_image}}
    <figure class="hero-img">
        <img srcset="{{img_url feature_image size="s"}} 320w,
                     {{img_url feature_image size="m"}} 600w,
                     {{img_url feature_image size="l"}} 960w,
                     {{img_url feature_image size="xl"}} 1200w"
             sizes="(max-width: 1200px) 100vw, 1120px"
             src="{{img_url feature_image size="xl"}}"
             alt="{{#if feature_image_alt}}{{feature_image_alt}}{{else}}{{title}}{{/if}}">
    </figure>
{{/if}}

{{!-- LOGO binding: fall back to site title as text (what Casper and Source do) --}}
<a class="brand{{#unless @site.logo}} no-image{{/unless}}" href="{{@site.url}}">
    {{#if @site.logo}}<img src="{{@site.logo}}" alt="{{@site.title}}">{{else}}{{@site.title}}{{/if}}
</a>

{{!-- BOOLEAN / feature binding: guard only, never output --}}
{{#if @site.members_enabled}}{{#unless @member}} … {{/unless}}{{/if}}
```

**Rules for the generator**

1. Every optional field gets a guard. No exceptions — both official themes have none.
2. Emit `{{#if}}`. Never `{{#has}}` (§2.4 — `_.isEmpty` breaks on numbers and booleans).
3. Guard the element, never just the attribute (§5.2) — an unguarded `srcset` produces real 404 requests (§4.1a).
4. `size=` keys must exist in the generated `package.json` `config.image_sizes`; they are theme-defined (§5.4).
5. `alt` always falls back to `title`; never emit a bare possibly-empty `alt`.
6. Never emit a possibly-empty `href` (§4.1b).
7. If a generated container's children are all conditional, add `:not(:empty)` to its spacing rules and strip inter-block whitespace with `<!-- -->`, as Source does (§1.1 Pattern I) — `:empty` does not match whitespace in any current browser.
