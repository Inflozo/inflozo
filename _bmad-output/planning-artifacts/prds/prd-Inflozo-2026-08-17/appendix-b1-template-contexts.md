---
title: Inflozo Appendix B.1 — Template Context Matrix
status: normative-companion
role: normative companion to prd.md — the matrix FR-H7 points at. The editor offers a binding only where this file says it is available. Distilled from research-ghost-binding-contexts.md, which remains the citation-backed evidence base.
created: 2026-08-18
updated: 2026-09-14
---

# Appendix B.1 — Template Context Matrix (normative)

FR-H7 makes context-aware binding **prevention, not warning**: the editor offers only bindings valid in the current template context, and an invalid binding is made unavailable rather than flagged. This file is the source of truth for "valid".

**Executed, Story 4.6 (2026-09-14).** This matrix is now DATA — `packages/library/contexts/matrix.json`, the one copy the runtime, the tests and the editor read — and every row of it is asserted against what T1 (6.58.0) and T3 (5.130.6) printed and against Ghost's own source at every version gate (`python3 tools/probe/record-contexts.py`, MEASUREMENTS §41). Where the recording and this prose disagreed, the recording won and the prose below is corrected in place, each correction marked *(recorded, Story 4.6)*. A field no recording could show is named in the data as `unverified` with its reason. **Where this file and `matrix.json` disagree, the data file is right.**

**Source.** Every claim here is distilled from `research-ghost-binding-contexts.md` (178 citations, verified against Ghost v6.58.0-rc.0, Casper 5.12.1, Source 1.7.1, GScan 6.4.2, and the v5.130.6→v6.0.0 diff). That file is the evidence; **this file is the contract**. The order of authority, since Story 4.6: `matrix.json` and its recordings first (executed), the research second (read in source and docs), this prose last — where two disagree, the higher one is right and the lower is a bug to report, not work around; the research's documented `meta_title`/`meta_description` resource attributes are the one such case so far (they print Ghost's page-meta helper inside a resource, *recorded*). An implementer should not need to open the research to answer "is this binding offerable here?".

---

## 0. Why prevention, not a warning

**Ghost compiles templates without strict mode.** `handlebars.compile(source, {preventIndent: true})` — `strict` and `assumeObjects` are not set. An out-of-context binding therefore:

- renders an **empty string**, with no error, at **build, deploy and runtime**;
- takes the `{{else}}` branch of any `{{#if}}` guarding it, silently;
- passes **gscan** — gscan lints helper names and `@`-global names, not whether a resource is in scope;
- passes the FR-J6 0-errors-0-warnings gate;
- reaches the visitor as a blank region on a live site.

There is no fail-fast anywhere in the chain. A warning the user can dismiss produces a silently broken site; the only reliable enforcement point is the moment of offering. Hence FR-H7. The same fact makes this matrix load-bearing: nothing downstream will catch an error in it.

Two helpers are the exceptions that *do* throw, and they are the only hard failures in the theme layer:

| Helper | Throws when |
|---|---|
| `{{pagination}}` | `this.pagination` is absent or malformed — "used outside of a paginated context". Fatal on `post`, `page`, `error`, `private`. |
| `{{> "name"}}` (inline partial form) | The partial does not exist. Use the block form `{{#> (concat …)}}fallback{{/undefined}}` for dynamic names. |

---

## 1. The three axes

The editor resolves an offer from exactly three inputs.

| Axis | Values | Governed by |
|---|---|---|
| **Template** | `default`, `index`, `home`, `post`, `page`, `tag`, `author`, `error`, `error-404`, `error-{N}xx`, `private`, `post-{slug}`, `page-{slug}`, `tag-{slug}`, `author-{slug}`, `custom-{name}` (entry), `custom-{name}` (route) | §3 master matrix |
| **Scope** | top level · inside `{{#post}}` / `{{#page}}` / `{{#tag}}` / `{{#author}}` · inside `{{#foreach posts}}` · inside `{{#get}}` · inside a partial | §3 + §4 |
| **Connected Ghost version** | the connected site's reported version; unlinked projects use the project's compile target | §6 |

**Decision procedure.** Given `(template, scope, version)`:

1. Universal set — `@site.*`, `@custom.*`, `@config.*`, `@member`, `{{meta_title}}`, `{{navigation}}`, `{{body_class}}`, `{{ghost_head}}`, `{{ghost_foot}}`, `{{asset}}`, `{{#is}}` — always offerable (§2). Subtract any field failing the §6 version gate.
2. Add the template's **top-level** set from §3.
3. If the scope is a resource block or a `{{#foreach}}`, add that block's set from §4; the parent scope stays reachable via `../`.
4. Everything else in §5 is offerable **only** by inserting a `{{#get}}` — which the editor does on the user's behalf when a section declares itself `{{#get}}`-driven (FR-H2). Never offer a §5 field as a plain binding.

**Re-validation.** Moving or duplicating a section re-runs this procedure against the destination. Bindings that become unavailable must be re-pointed or reverted to static **before the move completes** (FR-H7) — never silently dropped, because a dropped binding renders empty and §0 says nothing will catch it.

---

## 2. Available in every template, unconditionally

| Binding | Rule |
|---|---|
| `@site.*` | Every key **always exists**. Unset keys are `null`, never missing — the settings cache pre-seeds the whole allowlist. **`{{#if @site.x}}` is therefore always a sufficient guard**; there is no "key absent" case to defend against, on any template, on any version where the field exists. |
| `@member` | Always **defined**; `null` for logged-out visitors **and when members are disabled entirely**. `{{#if @member}}` is safe unconditionally — no `@site.members_enabled` pre-check is needed for correctness (pair them only to hide member UI wholesale). |
| `@custom.*` | The theme's own `config.custom` settings (FR-Q2/Q5). Available everywhere including `error` and `private`. |
| `@config.posts_per_page` | Available everywhere. **Not necessarily the `package.json` value** — a `routes.yaml` route with an explicit `limit:` overwrites it at render time for that route. |
| `{{meta_title}}` | Context-aware and never empty — falls through to the site title. Use it in `<title>`/meta; it works at the top level of **any** template without opening a block, unlike `{{title}}`. |
| `{{navigation}}`, `{{body_class}}`, `{{ghost_head}}`, `{{ghost_foot}}`, `{{asset}}`, `{{#is}}`, `{{t}}` | Available everywhere. |

**`@member` is identity, `access` is authorisation.** They are distinct: `@member` can be truthy while a post's `access` is false (free member, paid post). Gate **UI** on `@member`; gate **content** on `access`.

**`@labs`** is set by middleware but has no docs reference page. **Not offerable.** Same for `@setting`, which appears in gscan's linter allowlist but is installed by no middleware — a linter artifact, not a binding.

---

## 3. Master matrix — one row per template

`—` = not present; renders empty (§0).

| Template | Top level | Only inside `{{#foreach}}` / resource block | Requires `{{#get}}` |
|---|---|---|---|
| `default` | Universal set only. Inherits **the child render's** root, so bare resource fields are empty on every render. `@page` only when the child set it. **Do not bind `posts`/`pagination` here** — present on list renders, absent on entry renders, and nothing distinguishes them at author time. | `{{#foreach}}` written in this file (e.g. `@site.navigation`) | Anything resource-specific |
| `index` | `posts`, `pagination` — **flat at the root** | `{{#foreach posts}}` → full post scope (§4.1) | §5 |
| `home` | Identical to `index` in every respect. Same data; only the file choice differs. Renders `/` only. | Same as `index` | §5 |
| `post` | `post` (object). **`{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}` render EMPTY at top level** (§3a). No `posts`, no `pagination` — `{{pagination}}` **throws**. `@page` always set, always `true`. | `{{#post}}` → full post scope (§4.2); `{{#prev_post}}` / `{{#next_post}}` native | §5 — including *any* post list on this template |
| `page` | Identical to `post`, with two differences: the root carries **both** `post` and `page` keys pointing at the same object (recorded: `{{#post}}{{title}}{{/post}}` and `{{#page}}{{title}}{{/page}}` print the same title on both majors); **`@page.show_title_and_feature_image` is genuinely toggleable and must be honoured**. *(Recorded, Story 4.6: there is no `page` attribute to bind — `{{page}}` inside the post block prints empty on a page, on both majors.)* | `{{#post}}` — **yes, `{{#post}}`, not `{{#page}}`.** Both official themes do this. A page is a post whose data object is called `post`. | §5 |
| `tag` | `tag` (object), `posts`, `pagination` — flat at the root. `{{title}}` empty (a tag has **`name`**, not `title`). | `{{#tag}}` → §4.3; `{{#foreach posts}}` → §4.1 | §5 + the tag's own post count (`include=count.posts`) |
| `author` | `author` (object), `posts`, `pagination` — flat at the root. `{{title}}` empty (authors have **`name`**). | `{{#author}}` → §4.4; `{{#foreach posts}}` → §4.1 | §5 + the author's post count |
| `error` | `{{statusCode}}`, `{{message}}`, `{{errorDetails}}`. Universal set available. **No `posts`, no `pagination`, no `@page`.** `{{pagination}}` throws. | `{{#foreach errorDetails}}` (each entry: `rule`, `failures[]` of `{ref, message}`) | §5 — but see the caution below |
| `error-404` | Same context as `error`. May be rich: extending `default.hbs` and running `{{#get}}` are both proven in Casper. | Same as `error` | §5 — allowed here |
| `error-{N}xx` | Same context as `error`. Follow the `error` caution. | Same as `error` | Permitted by Ghost; **§5 forbids it in Inflozo output** |
| `private` | `{{error.message}}` (only after a failed submit), `{{input_password}}`. Universal set available. No `posts`, no `pagination`, no `@page`. | — | §5 |
| `post-{slug}` | Follows **`post`** exactly. | | |
| `page-{slug}` | Follows **`page`** exactly. | | |
| `tag-{slug}` | Follows **`tag`** exactly. | | |
| `author-{slug}` | Follows **`author`** exactly. | | |
| `custom-{name}` **(entry)** — selected per-post in Ghost Admin | Follows **`post`** or **`page`**, depending on what the entry is. **Not a context of its own** — it is an alternate *file* for the entry context. | Same as `post` / `page` | §5 |
| `custom-{name}` **(route)** — reached by a `routes.yaml` route | Renders through the **list** path: the root is **flat**, and each `data:` key the route declares is unwrapped to a top-level object under its own name (`data: page.about` → `{{#page}}`). `posts`/`pagination` appear only if the route declares a collection or channel. `@page` set only when the route resolves a real page. **The editor knows the shape because Inflozo authored the route (FR-I2) — offer exactly the declared data keys, nothing more.** | Per declared key | §5 |
| **Members templates** | **No such template exists in Ghost 6.x.** There is no `account.hbs`, `signup.hbs`, `signin.hbs`, `subscribe.hbs` or `members/` directory in the template hierarchy, and neither official theme ships one. See §7. | | |

### 3a. The wrapper rule — the single most costly mistake available

**Single-resource templates render with a wrapper object, not the resource.**

`post.hbs`, `page.hbs`, `post-{slug}.hbs`, `page-{slug}.hbs` and entry `custom-*.hbs` receive `{post: {…}}` (plus `page:` pointing at the same object, for pages). The post is **not** the root context.

```handlebars
{{! WRONG — renders empty, silently, everywhere }}
<h1>{{title}}</h1>

{{! RIGHT }}
{{#post}}<h1>{{title}}</h1>{{/post}}
```

**List templates are the opposite shape.** `index.hbs`, `home.hbs`, `tag.hbs`, `author.hbs` receive `posts` and `pagination` **flat at the root**, with the matched taxonomy object alongside under its own key.

So the two families invert each other, and neither errors when confused. The editor must never offer a bare resource field at the top level of a single-resource template, and must never require a block to reach `posts`/`pagination` on a list template.

`{{title}}` is a *registered helper*, not a path lookup — it wins over any same-named property and returns `this.title || ''`. That `|| ''` is why the failure is invisible.

### 3b. `@page` is not set on list templates

`@page.show_title_and_feature_image` is injected by the response formatter, not by middleware, and the two paths differ:

| Render | `@page` set? |
|---|---|
| Entry (`post`, `page`, `post-{slug}`, `page-{slug}`, entry `custom-*`) | **Always** — seeded `true`, overwritten from the entry for pages |
| List (`index`, `home`, `tag`, `author`) | **Only** when the route resolves an associated page object — true for a `routes.yaml` custom-routed page, **false for an ordinary feed** |
| `error`, `private` | **Never** |

On a plain `index.hbs`, `@page.show_title_and_feature_image` is `undefined` → **falsy**, not `true`. `{{#match @page.show_title_and_feature_image}}` there renders nothing at all. Do not assume it defaults to `true` outside entry templates.

`@page` is offerable on `page` (where it is meaningful and **must** be honoured — **FR-I1** and Appendix A §24 put the guard on A24's title and feature-image markup on `page.hbs`), tolerable on `post` (always `true`, so gating on it is a no-op), and **not offerable** anywhere else. `show_title_and_feature_image` is the **only** `@page.*` property the theme may emit: gscan's `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` warns on any other, and the missing-usage sibling is a warning too — the reason to honour the flag is that the user's Ghost Admin toggle otherwise does nothing, not that gscan asks.

### 3c. `error.hbs` — capability vs. prudence

`@site`, `@member` and every helper **do work** in `error.hbs` and `private.hbs`; Ghost's own default templates for both use them. The docs' claim that error templates "shouldn't use any theme helpers" is a **robustness recommendation**, not a capability limit — see §8.

Follow Casper's split, and encode it as an authoring rule:

- **`error-404.hbs`** may be rich: extend `default.hbs`, run `{{#get}}`, use any helper. **Inflozo does not emit it** (FR-I1's file list stops at `error.hbs`); this row documents Ghost's capability should that change.
- **`error.hbs` / `error-{N}xx.hbs`** must be self-contained in Inflozo output: no layout inheritance, no `{{#get}}`, no API calls. Ghost permits all three; this is Inflozo's rule, not a platform limit. It is the template that renders when the server is already struggling, and a `{{#get}}` there compounds the outage that caused it.

Consequence for A31: a 500-treatment design must not be `{{#get}}`-driven. A 404-treatment design may be.

---

## 4. Block scopes

### 4.1 Inside `{{#foreach posts}}` — list templates

Full post scope: `title`, `url`, `excerpt`, `feature_image`, `feature_image_alt`, `feature_image_caption`, `featured`, `visibility`, `access`, `published_at`, `primary_tag`, `primary_author`, `tags`, `authors`, `reading_time`, `post_class`, `{{content}}`, `{{date}}`, `{{excerpt words="26"}}`.

Loop-local `@` vars: `@index` (0-based), `@number` (1-based), `@first`, `@last`, `@even`, `@odd`, `@key`, and `@rowStart` / `@rowEnd` **only when `columns=` is passed**. Parent scope reachable with `../` (e.g. `../pagination.total`).

**`{{#foreach}}`'s visibility default is asymmetric — and it is not what the docs say.**

| Collection | Default `visibility` | Effect |
|---|---|---|
| `posts` | `'all'` | **Members-only and paid posts DO appear in public feeds by default** |
| `newsletters` | `'all'` | All appear |
| `tags` | public | Internal tags (`#name`) are hidden — pass `visibility="all"` |
| `tiers` | public | Hidden tiers excluded |

The docs state one rule ("only public data by default"); the code special-cases posts and newsletters to `'all'`. This is **Ghost's deliberate behaviour, not a paywall leak** — the cards show, the bodies stay gated by `access` — but it must be documented in the product or it reads as a bug. Narrow it with `{{#foreach posts visibility="paid"}}` where a section wants only gated posts.

`@member` does **not** filter `posts`. Gated posts appear in feeds regardless of who is looking.

### 4.2 Inside `{{#post}}` (and, on `page.hbs`, equivalently `{{#page}}`)

**On `page.hbs`, `{{#post}}` and `{{#page}}` open the same object.** The root carries `post` and `page` as **two keys onto one object** (§3), so either block scope reaches every field below. **Both official themes use `{{#post}}`**, and **Inflozo emits `{{#post}}` on both templates** — not because `{{#page}}` fails, but because one form compiles identically to both targets, which is what lets a design placed on a post and on a page share a partial (`prd.md` §7.4). `{{#page}}` is not interchangeable everywhere, though: on a **`routes.yaml` custom route** declaring `data: page.about`, the unwrapped key is `page` and `{{#page}}` is the **only** form (§3, custom-route row).

A section declaring `bindingContext: post` with `compileTarget: post.hbs, page.hbs` — A24 and A25 — is therefore making **one** declaration, not two: the *resource* is the same, and the enum needs no `page` value. What differs between the two templates is **not the binding but the product** (`prd.md` §5): a post is an article and carries comments, authors, related posts and a reading TOC; a page is a standing page — About, Our Story — and carries none of them. That distinction is enforced by `compileTarget`, not by `bindingContext`: A26 post footers, A27 related posts and A28 comments declare `post.hbs` only and can never be placed on a page. The one further `page.hbs`-specific obligation is the `@page.show_title_and_feature_image` guard of §3b — a guard, not a binding.

`id`, `comment_id`, `title`, `slug`, `excerpt`, `custom_excerpt`, `content`, `url`, `feature_image`, `feature_image_alt`, `feature_image_caption`, `featured`, `published_at`, `updated_at`, `created_at`, `primary_author`, `primary_tag`, `tags`, plus members fields `access` (boolean) and `visibility` (`public` | `members` | `paid`).

*(Recorded, Story 4.6 — three corrections on both majors.)* **`page` is not a field** here: it prints empty inside `{{#post}}` on a page. **`meta_title` and `meta_description` are not the post's fields in a theme:** `{{meta_title}}` is Ghost's page-meta helper and prints the page's title — the site title on a feed, "Site (Page 2)" on page 2 — whatever the post row carries, while `{{#if meta_title}}` reads the null field; the same holds inside a tag and an author. Neither is bindable. **`reading_time` is Ghost's helper over a number:** it prints "1 min read" over an API value of `0` (so a guard needs `includeZero=true`), and prints **nothing** on a post the visitor may not read, because it counts the withheld body.

Nested: `{{#primary_tag}}`, `{{#primary_author}}`, `{{#foreach tags}}`, `{{#foreach authors}}`.

**Always bind `{{url}}` as the helper inside an open context** — `{{#post}}{{url}}{{/post}}`, never `{{post.url}}`. Ghost's docs are explicit and the attribute form is not equivalent.

**`{{content}}` self-gates.** When `access` is false it emits Ghost's upgrade CTA instead of the body — overridden wholesale by `partials/content-cta.hbs`, which is exactly the surface A32's paywall designs compile into.

### 4.3 Inside `{{#tag}}`

`id`, `name`, `slug`, `description`, `feature_image`, `url`, `accent_color`. *(`meta_title` / `meta_description` removed — see §4.2, recorded.)*

**No `title`** — use `{{name}}`. **No `count.posts`** unless fetched via `{{#get "tags" include="count.posts"}}`; A29's post-count designs therefore need a `{{#get}}`, not a plain binding.

### 4.4 Inside `{{#author}}`

`id`, `name`, `slug`, `bio`, `location`, `website`, `url`, `profile_image`, `cover_image`, and social handles `facebook`, `twitter`, `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin`.

No `title`. No `count.posts` without `{{#get}}`.

---

## 5. Requires `{{#get}}`

Not in any native context. Offer these only through a `{{#get}}`-driven section (FR-H2), never as a plain binding.

| Need | Query |
|---|---|
| Featured posts as a separate block | `{{#get "posts" filter="featured:true"}}` |
| Related posts by primary tag | `{{#get "posts" filter="primary_tag:{{primary_tag.slug}}"}}` |
| More by this author | `{{#get "posts" filter="authors:{{primary_author.slug}}+id:-{{id}}"}}` |
| Any post list on `post` / `page` / `error` / `private` | `{{#get "posts"}}` |
| Tag list / tag cloud, tag post counts | `{{#get "tags" include="count.posts"}}` |
| Author list, author post counts | `{{#get "authors" include="count.posts"}}` |
| Tiers and prices | `{{#get "tiers" include="monthly_price,yearly_price,benefits"}}` |
| Newsletters for a signup form | `{{#get "newsletters"}}` |
| Anything beyond page N of the native feed | `{{#get "posts"}}` |

**Resources:** `posts`, `tags`, `authors`, `tiers`, `newsletters`. Nothing else.

**Constraints the compiler must respect:**

- Default `limit` 15; **max 100 on Ghost 6.x**, and `limit="all"` no longer returns all. This is the one genuine breaking 5→6 theme change. gscan v6 warns on both `limit="all"` and `limit>100`, so either costs the FR-J6 zero-warnings gate.
- `{{else}}` on `{{#get}}` fires **only on error**, never on empty results. Handle empty inside the inner `{{#foreach}}`'s `{{else}}`.
- Helpers do not execute inside `filter` strings — pass raw attributes (`{{published_at}}`), never `{{date}}`.
- Read queries (by `id`/`slug`) accept only `include`.
- Block params: `{{#get "posts" as |articles pages|}}` — the second is the pagination object.
- A slow `{{#get}}` is **aborted**: it yields an empty collection plus a visible `<span data-aborted-get-helper>Could not load content</span>` and sets `X-Ghost-Degraded-Render`. Every `{{#get}}`-driven section must degrade gracefully (FR-H8 guards cover this).
- **The abort is per get, not per template — measured, `MEASUREMENTS.md §30`, VERIFY item 47.** Each `{{#get}}` is raced on its own against `optimization.getHelper.timeout.threshold`, **5000 ms and identical on 5.130.6 and 6.58.0**. There is **no cumulative per-template budget**: 150 single-id gets on one template resolved in full on both majors, with no abort marker and no degraded header. Earlier text here read as a per-template threshold and was wrong; the number that actually bounds hand-picked order is **latency, ≈ 10 ms per get on Ghost 6 and ≈ 8 ms on Ghost 5**, not an abort.
- **Ghost 6 dedups identical gets within one render; Ghost 5 does not** (`get.js` `_queryCache`, register item 52). Never cost a design on the assumption that repeating a get is free.

---

## 6. Version gates

FR-H7's third axis. A field or helper added after the connected site's version **is not offerable** — it renders empty, silently (§0). Write minimums as `>= 6.N`, never "Ghost 6": the 5→6 boundary is almost a no-op for themes, and nearly everything attributed to "Ghost 6" landed *during* the 6.x line.

| Gated item | Minimum version | Effect below it |
|---|---|---|
| `@site.threads`, `.bluesky`, `.mastodon`, `.tiktok`, `.youtube`, `.instagram`, `.linkedin` — **the seven social fields** | **≥ 6.36.0** — *read in source, Story 4.6: absent from `public.js` and `default-settings.json` at 6.35.0, present at 6.36.0, unchanged through 6.38.0.* The design export's "the site's accounts arrived in 6.38.0" is the `{{#social_accounts}}` helper's release, not the keys' (ledger) | Field absent. Renders empty — and gscan passes it, because it allow-lists a global by its first segment only (`gscan@6.4.2/lib/ast-linter/internal/scope.js:4-32`, read 2026-09-13; the probe theme carrying every gated key passed 4.49.7 and 6.4.2 with 0 errors, MEASUREMENTS §41). Not offerable on 5.x or on 6.x below 6.36.0. |
| `@site.admin_url` | **≥ 6.22.1** — *read in source, Story 4.6: `update-local-template-options.js` adds it at 6.22.1; this row said 6.23.0* | Absent |
| `@site.comments_enabled`, `@site.comments_access` | ≥ 5.3.0 *(source, Story 4.6)* | Absent |
| `@site.portal_signup_terms_html`, `@site.portal_signup_checkbox_required` | ≥ 5.42.0 *(source, Story 4.6)* | Absent |
| `@site.recommendations_enabled` | ≥ 5.61.0 *(source, Story 4.6)* | Absent |
| `@site.allow_self_signup` | ≥ 5.62.0 *(source, Story 4.6)* | Absent |
| `@site.donations_enabled` | ≥ 5.120.2 *(source, Story 4.6)* | Absent |
| `{{#social_accounts}}` | ≥ 6.38.0 | Unknown helper — **gscan error**, blocks the FR-J6 gate |
| `{{json}}`, `{{color_to_rgba}}`, `{{contrast_text_color}}` | ≥ 6.23.0 | Unknown helper — gscan error |
| `{{split}}` | ≥ 6.5.0 | Unknown helper — gscan error |
| `{{#get}}` `limit > 100` / `limit="all"` | **works ≤ 5.x, capped ≥ 6.0.0** | Reverse gate: allowed on 5.x, capped on 6.x. Never emit either. |

**Not gated across the 5→6 boundary** — these are Ghost **5** features: `@site.signup_url` (present at 5.0.0), `{{social_url}}`, and the whole `@member` shape. *(Corrected, Story 4.6: `@site.comments_enabled`, `@site.comments_access` and `@site.recommendations_enabled` were listed here, and they are Ghost 5 features but not 5.0.0 ones — the floor FR-C2 accepts is 5.0.0, so each is gated at the release Ghost's source added it, in the table above.)* The `@member` shape (`uuid`, `email`, `name`, `firstname`, `avatar_image`, `subscriptions`, `paid`, `status` — byte-identical 5.130.6 → HEAD).

**Deprecated, still functional, but gscan-warned on 6.x:** `{{twitter_url}}`, `{{facebook_url}}`. Never emit them — use `{{social_url type="twitter"}}` / `{{social_url type="facebook"}}`. A warning costs the zero-warnings target.

**Removed at 6.0:** AMP entirely (`amp` context, `@site.amp`, `meta.ampUrl`), and extension-less theme-root files are no longer served. Neither is offerable on any target.

**Undocumented — never offer:** `@labs`, `@setting`, `@site.transistor_portal_*`, `@config.image_sizes` (real, but undocumented), and these ten other undocumented `@site` allowlist keys (`lang`, `members_signup_access`, `portal_default_plan`, `outbound_link_tagging`, `firstpromoter_account`, `default_email_address`, `support_email_address`, `editor_default_email_recipients`, `labs`, `site_uuid`).

---

## 7. Members templates do not exist

**There is no members template family in Ghost 6.x.** No `account.hbs`, `signup.hbs`, `signin.hbs`, `subscribe.hbs`, and no `members/` directory appears anywhere in the template hierarchy. Neither Casper nor Source ships one. The `members/account.hbs` path in Ghost's own docs example cites **Lyra, a Ghost 3.x-era theme**, and reflects a convention Ghost no longer uses.

Members pages are reachable three ways, and Inflozo's members designs compile to the third:

1. **Portal** — Ghost's embedded members app, driven by `#/portal/signup`, `#/portal/signin`, `#/portal/account` or `data-portal` attributes. No template involved; Ghost renders every string.
2. **`data-members-*` attributes on the theme's own markup** — `data-members-form`, `-email`, `-name`, `-newsletter`, `-label`, `-error`, `-signout`, `-manage-billing`, `-otc`. These work in **any** template.
3. **A `routes.yaml` custom route** pointing at a `custom-{name}.hbs`, with `{{#foreach @member.subscriptions}}` inside it for account UI.

**Binding rules for a members page** therefore follow the `custom-{name}` **(route)** row in §3: flat root, declared data keys only, plus the universal set. `@member` and its subscriptions are the payload; `{{#get "tiers"}}` supplies pricing.

Two members-adjacent partials **are** overridable and are real compile targets: `partials/content-cta.hbs` (replaces the upgrade CTA `{{content}}` renders when `access` is false — A32's target) and `partials/pagination.hbs` / `partials/navigation.hbs`. Ghost's `helpers/tpl/` also registers `cancel_link.hbs`, `gift-toast.hbs` and `recommendations.hbs` as partials, so a same-named theme partial silently overrides them — **treat overriding those three as unsupported**, and treat the shadowing risk as a reason to namespace Inflozo's own partials (§9).

---

## 8. Contested — verify at runtime before the library is authored

**Nothing in the research was executed against a running Ghost.** Every claim derives from source, shipping theme code, gscan rule source, or docs text. *(Story 4.6 executed part of this section — see the note under the table.)* Four docs-vs-code conflicts were found; in each the research follows the **code**, and so does this file. Standing 7.6 item: stand up a scratch Ghost install and confirm each empirically.

| # | Item | Docs say | Code says | This file follows | Blast radius if the code reading is wrong |
|---|---|---|---|---|---|
| 1 | **`@even` / `@odd` parity** — **the one that matters** | `@even` is true when **`@index`** is even, making the **first** item even | `frame.even = index % 2 === 1` — parity of the **1-based `@number`**, making the **first item ODD** | **Code: the first item is odd** | **Inverts zebra striping across the entire 484-design library.** Every alternating-row, alternating-column and checkerboard design is backwards, in the same direction, everywhere. Verify this first. |
| 2 | Helpers in error templates | Error templates "shouldn't use any theme helpers, with the exception of `{{asset}}`"; only `error-404.hbs` may | Casper's shipping `error.hbs` uses `{{meta_title}}`, `{{img_url}}`, `{{t}}`, `{{#if}}`, `{{#foreach}}`, `@site.*`; `error-404.hbs` extends `default.hbs` and runs `{{#get}}` | **Code** — the docs' rule is a robustness recommendation (§3c) | A31's error designs lose their designs and fall back to bare markup |
| 3 | `@config` fields | Only `@config.posts_per_page` is passed through | `image_sizes` is also set; and a `routes.yaml` `limit:` overwrites `posts_per_page` per route at render time | **Code** — but `image_sizes` stays un-offerable as undocumented (§6) | Minor: a Routes-Manager collection with a `limit:` would make `@config.posts_per_page` unreliable |
| 4 | Nested partial directories | Never mentioned; only a flat `partials/list-post.hbs` example | express-hbs walks `partialsDir` recursively and registers by relative path; Casper and Source rely on it in every template | **Code** — nested partials work (§9) | **Structural.** FR-Q3's `partials/sections/…` emission tree collapses to a flat directory, and the exported theme loses its organisation |

Also unverified at runtime, and worth confirming in the same session: the `{{title}}`-renders-empty rule on `index.hbs` (§3a), and the `{{#foreach posts}}` `visibility='all'` default (§4.1) — both are read from code and both are load-bearing for the whole library.

**Executed, Story 4.6 (2026-09-14, T1 6.58.0 and T3 5.130.6, MEASUREMENTS §41).** The `{{title}}`-renders-empty rule **holds**: a root `{{title}}` prints empty on `index.hbs`, `post.hbs` and `page.hbs` while `{{#post}}{{title}}{{/post}}` beside it prints the title. The `visibility='all'` default **holds** as far as it was touched: the first row of `/` on both servers is a paid post. Item 3's `@config.posts_per_page` prints the theme's value. Items 1 (`@even`/`@odd`), 2 and 4 were not in that recording and stay open; so do `private.hbs` (it needs private mode, which the recorder may not switch on), the route form of `custom-{name}` (FR-I2) and every Ghost version below the two servers', which were read in source only.

---

## 9. Partial mechanics

**Nested directories resolve.** `{{> "sections/home/hero"}}` → `partials/sections/home/hero.hbs`, at arbitrary depth, forward slashes on every platform. Undocumented but relied on by both official themes. This is what makes FR-Q3's per-section partial tree possible.

**Two partial roots; the theme wins.** Ghost's built-in template directory registers first, the theme's `partials/` second, and registration overwrites by name. This is the documented mechanism behind `partials/pagination.hbs` and `partials/navigation.hbs` overrides — **and the hazard**: a theme partial named `gift-toast`, `recommendations` or `cancel_link` silently overrides a Ghost internal (`content-cta` is the documented exception — see §7, where it is A32's supported compile target). Namespace generated partials (`sections/…`) so a section name can never collide with a Ghost internal by accident.

**Dynamic partial names must use the block form.** `{{#> (concat "icons/" type)}}fallback{{/undefined}}` degrades gracefully; the inline form `{{> (concat …)}}` throws a page error and breaks the render. gscan rejects the inline form outright.

**Hash params carry scalars and `@`-refs only.**

| Value kind | Supported |
|---|---|
| String / number / boolean literal | yes — `feed="index"`, `limit=4`, `showTitle=true` |
| Path reference to context data | yes — `post=this`, `tag=primary_tag` |
| `@` variable reference | yes — `style=@custom.post_feed_style` |
| Sub-expression | yes — `label=(t "card.read_more")` |
| **Array literal** | **no** — Handlebars has no syntax for it |
| **Object literal** | **no** — same |

Four consequences the compiler must encode:

1. **Structured data is passed by reference or not at all.** `items=posts` works; `items=["a","b"]` does not parse. To hand a partial structured data, put it in the surrounding context and let inheritance carry it, fetch it inside the partial with `{{#get}}`, or pass it positionally as the partial's whole context.
2. **Partials inherit the full parent context**, so `{{> "post-card"}}` inside `{{#foreach posts}}` needs **no parameters** — the post is already `this`. This is why the C7 partial rule works: content sourced from Ghost becomes a real partial invoked bare.
3. **No defaults.** An unpassed param is `undefined` → falsy → renders empty. Defaults are written `{{#if param}}…{{else}}…{{/if}}` inside the partial.
4. **Not type-checked, and `{{#match}}` compares type as well as value.** `showTitle="false"` (a non-empty string) is **truthy**; `showTitle=false` is falsy. Always emit unquoted booleans.

**A partial's interface is scalars plus context inheritance.** There is no way to express a structured literal at a call site — design section emission accordingly.

---

## 10. Template resolution order

Which file Ghost picks. Relevant to the editor because a design placed on `post.hbs` may be pre-empted by a more specific file.

| Request | Lookup order (first existing wins) |
|---|---|
| Single post | `post-{slug}` → `{custom_template}` → **`post`** (required) |
| Single page | `page-{slug}` → `{custom_template}` → `page` → **`post`** |
| Home `/` | `home` → **`index`** (required) |
| Post list `/page/N/` | `index` |
| Tag archive | `tag-{slug}` → `tag` → `index` |
| Author archive | `author-{slug}` → `author` → `index` |
| Error | `error-{code}` → `error-{N}xx` → `error` → Ghost's built-in view |
| Private gate | `private` → Ghost's built-in view |
| `routes.yaml` route | the route's `template:` list, in order → `defaultTemplate` |

Two consequences: `post.hbs` and `index.hbs` are the only **required** files (a page with no `page.hbs` falls through to `post.hbs`); and error templates are genuinely **optional** — Source ships none and serves Ghost's built-in view.

**Context values** (`{{#is}}` / `{{body_class}}`): `home`, `index`, `post`, `page`, `tag`, `author`, `paged`, `private`. `home` and `index` **co-occur** on `/`; `index` and `paged` co-occur on `/page/2/`. **There is no `error` context** — `{{#is "error"}}` never matches, on any template. Do not offer it.
