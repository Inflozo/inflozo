---
title: Ghost Theme Binding Contexts
status: normative-companion
role: normative companion to prd.md — the source of truth for FR-H7 and Appendix B.1 (Template Context Matrix)
created: 2026-08-18
source: web research against Ghost docs, Ghost core source, Casper 5.12.1, Source 1.7.1
---

# Ghost Theme Binding Contexts — Normative Reference

**Status:** Research appendix. Every claim below carries a source: a docs URL, a Ghost core source path, or a file in the official Casper/Source themes.

**Verified against:**

| Source | Version / ref |
|---|---|
| Ghost core | `v6.58.0-rc.0` (`TryGhost/Ghost`, sparse checkout of `ghost/core/core/frontend`, `ghost/core/core/shared`, `ghost/core/core/server/data/schema`) |
| Version diff | `v5.130.6` (latest 5.x) vs `v6.0.0`, `v6.57.1`, HEAD — see [§17](#17-ghost-5x-vs-6x) |
| GScan | `TryGhost/gscan` v6.4.2 — the version both official themes pin as their `test` step |
| Casper | `5.12.1` (`TryGhost/Casper`, `main`) |
| Source | `1.7.1` (`TryGhost/Source`, `main`) |
| Official docs | `https://docs.ghost.org` — full corpus pulled as `https://docs.ghost.org/llms-full.txt` (712 KB, verbatim) |
| express-hbs | `TryGhost/express-hbs`, `master`, `lib/hbs.js` |

> Note on doc URLs: `ghost.org/docs/themes/*` now 301-redirects to `docs.ghost.org/themes/*`. Both forms appear in Ghost's own source comments. Citations below use the canonical `docs.ghost.org` form.

**Method note:** where the published docs and the shipping code disagree, this document states the disagreement explicitly and follows the code. Four such disagreements were found; they are flagged inline with **DOCS/CODE CONFLICT** and collected in [§13](#13-docs-vs-code-conflicts).

---

## 1. Summary of the rules

These are the load-bearing rules. Everything in the per-template matrices follows from them.

**R1 — A single-resource template's top level is a *wrapper object*, not the resource.**
`post.hbs`, `page.hbs`, `post-{slug}.hbs`, `page-{slug}.hbs` and `custom-{name}.hbs` are rendered with `{post: {...}}` (plus `{page: {...}}` for pages), *not* with the post as the root context. `{{title}}` at the top level of `post.hbs` renders **empty**. You must open `{{#post}}...{{/post}}` first.
Source: `ghost/core/core/frontend/services/rendering/format-response.js` — `formatResponse()` returns `let entry = {post: post}` and conditionally `entry.page = post`. Corroborated by both official themes: `Casper/post.hbs:7` and `Source/post.hbs:4` both open `{{#post}}` before any field access.

**R2 — A list template's top level *is* flat: `posts` + `pagination` live at the root.**
`index.hbs`, `home.hbs`, `tag.hbs`, `author.hbs` receive `{posts: [...], pagination: {...}}` at the root, plus the matched taxonomy object under its own key (`tag`, `author`).
Source: `format-response.js` — `formatPageResponse()` sets `response.posts = result.posts` and `response.pagination = result.meta.pagination`, then unwraps each `result.data` key (`response[name] = data[0]` for single objects).

**R3 — Missing variables are silently empty. Never an error.**
Ghost compiles templates with `handlebars.compile(source, {preventIndent: true})` — `strict` is **not** set, so Handlebars runs in its default non-strict mode. An unresolved path renders as an empty string and `{{#if missing}}` takes the `else` branch. See [§12b](#b-what-happens-when-a-theme-references-a-variable-not-in-context).
Source: `ghost/core/core/frontend/services/theme-engine/engine.js`.

**R4 — `@site`, `@custom`, `@config`, `@labs` are global; `@member`, `@page` are per-request.**
`@site`/`@labs`/`@config`/`@custom` are installed once per request by `updateGlobalTemplateOptions`; `@member`, request-adjusted `@site.url`/`@site.admin_url`, and preview `@custom` by `updateLocalTemplateOptions`. `@page` is injected later still, by the response formatter, because it needs the resolved entry.
Source: `services/theme-engine/middleware/{index,update-global-template-options,update-local-template-options}.js`; `services/rendering/format-response.js`.

**R5 — Every `@site` key always exists; unset ones are `null`, never `undefined`.**
`settingsCache.getPublic()` pre-seeds every allowlisted key to `null` and coalesces with `?? null`. So `{{#if @site.logo}}` is the correct and sufficient guard — there is no "key missing" case to defend against.
Source: `ghost/core/core/shared/settings-cache/cache-manager.js:240-261`; allowlist at `ghost/core/core/shared/settings-cache/public.js`.

**R6 — `@member` is always *defined* and is `null` for logged-out visitors — including when members are disabled.**
`const member = req.member ? {...} : null`. It is never `undefined`, so `{{#if @member}}` is always safe and always false for anonymous traffic.
Source: `services/theme-engine/middleware/update-local-template-options.js`.

**R7 — Ghost's data helpers return `SafeString`. Double-stache is correct almost everywhere.**
`{{content}}`, `{{excerpt}}`, `{{title}}`, `{{navigation}}`, `{{pagination}}`, `{{ghost_head}}`, `{{tags}}`, `{{authors}}` and ~30 others return `SafeString`, so `{{ }}` emits their HTML unescaped and correctly. Triple-stache is needed only for `{{{body}}}`, `{{{block "..."}}}`, and raw un-wrapped HTML strings. See [§12g](#g-escaping-and-triple-stache).
Source: `helpers/content.js` (its header comment says so explicitly), `helpers/title.js`, `helpers/excerpt.js`; SafeString audit across `ghost/core/core/frontend/helpers/*.js`.

**R8 — Nested partial directories work: `{{> "sections/home/hero"}}` → `partials/sections/home/hero.hbs`.**
Undocumented but load-bearing in both official themes. express-hbs walks `partialsDir` recursively with `readdirp` and registers each partial under `dirname + basename` relative to the partials root.
Source: `express-hbs/lib/hbs.js:162-179`; usage at `Casper/post.hbs` (`{{> "icons/fire"}}`), `Source/default.hbs` (`{{> "components/footer"}}`, `{{> "typography/fonts"}}`).

**R9 — `error.hbs` and `private.hbs` are ordinary templates with full global access.**
Both get `@site`, `@custom`, `@member`, `@config` and all helpers. The docs' claim that error templates "shouldn't use any theme helpers" is a robustness *recommendation*, not a capability limit, and Ghost's own default theme ignores it. See [§12a](#a-is-site-available-in-every-template).

**R11 — The theme API is effectively stable across the 5→6 boundary; version-sensitive items are mid-6.x additions.**
The `core/frontend` diff at v6.0.0 is 8 deletions (all AMP) plus 13 modifications, and the helper directory is byte-identical at 49 files. Only three things actually break at 6.0: the `{{#get}}` limit cap, AMP removal, and extension-less theme-root files no longer being served. Everything else — the social `@site` fields, `{{split}}`, `{{json}}`, `{{color_to_rgba}}`, `{{contrast_text_color}}`, `{{#social_accounts}}` — arrived *during* 6.x. Write minimum versions as `>= 6.N`, never as "Ghost 6". Full detail in [§17](#17-ghost-5x-vs-6x).

**R10 — There is no `error` context and no `home`-only data.**
`{{#is "error"}}` never matches — `error` is not among the contexts `setResponseContext` can push. And `home.hbs` receives exactly the same data as `index.hbs`; the only difference is which file is chosen.
Source: `services/rendering/context.js` (pushes only `paged`, `home`, router contexts, `private`, `page`, `post`, `tag`); `docs.ghost.org/themes/contexts/index-context` ("The data available on the home page is exactly the same as described in the index context").

---

## 2. Template resolution order (normative)

Ghost picks the first template in an ordered list that exists in the theme. Source for all of the below: `ghost/core/core/frontend/services/rendering/templates.js`.

| Request kind | Lookup order (first existing wins) | Fallback |
|---|---|---|
| Single post | `post-{slug}.hbs` → `{custom_template}.hbs` → `post.hbs` | `post.hbs` (required) |
| Single page | `page-{slug}.hbs` → `{custom_template}.hbs` → `page.hbs` → `post.hbs` | `post.hbs` |
| Home (`/`) | `home.hbs` → `index.hbs` | `index.hbs` (required) |
| Post list `/page/N/` | `index.hbs` | `index.hbs` |
| Tag archive | `tag-{slug}.hbs` → `tag.hbs` → `index.hbs` | `index.hbs` |
| Author archive | `author-{slug}.hbs` → `author.hbs` → `index.hbs` | `index.hbs` |
| Error | `error-{code}.hbs` → `error-{N}xx.hbs` → `error.hbs` | Ghost's built-in `core/frontend/views/error.hbs` |
| Private site gate | `private.hbs` | Ghost's built-in `apps/private-blogging/lib/views/private.hbs` |
| `routes.yaml` custom route | the route's `template:` list, in order | route's `defaultTemplate`, else a thrown error |

Exact mechanics, quoted from `templates.js`:

- `getEntryTemplateHierarchy` starts `['post']`; for a page it unshifts `'page'`; then unshifts `custom_template` if the entry has one; then unshifts the slug template. Net order for a page with a custom template selected: `['page-{slug}', '{custom}', 'page', 'post']`.
- `getEntriesTemplateHierarchy` starts `['index']`, unshifts `routerOptions.name` (e.g. `tag`, `author`), then `{name}-{slug}` when `slugTemplate` is set, then any `routes.yaml` templates, then `frontPageTemplate` (`'home'`) when the path is `/`.
- `getErrorTemplateHierarchy` returns `['error-{code}', 'error-{N}xx', 'error']`.

`home.hbs` is wired as `frontPageTemplate: 'home'` on the collection router (`services/routing/collection-router.js:117`), which is why it only ever renders `/` — matching the docs' "This template is only used to render `/`" (`docs.ghost.org/themes/structure`).

**`custom-{name}.hbs` is not a context.** It is an alternate *file* for the post/page entry context, selectable per-post in Admin. Its data and rules are identical to `post.hbs`/`page.hbs`. Docs: `docs.ghost.org/themes/contexts/post` — "a 'global' custom post template… available in a dropdown in the post settings menu".

### Context values (`{{#is}}` / `{{body_class}}`)

`setResponseContext` (`services/rendering/context.js`) builds `res.locals.context` as an **array**, in this order:

1. `paged` — if `req.params.page` parses to > 1
2. `home` — if the relative URL is exactly `/`
3. everything in `res.routerOptions.context` — `['index']` for the default collection, `['tag']`/`['author']` for taxonomies, `['page']` for static pages, `['post']` for collection entries
4. `private` — if the relative URL starts `/private/`
5. `page` / `post` / `tag` — derived from the fetched data, if not already present

Supported values per `docs.ghost.org/themes/helpers/functional/is`: `home`, `index`, `post`, `page`, `tag`, `author`, `paged`, `private`. Note that `home` and `index` co-occur on `/`, and `index` + `paged` co-occur on `/page/2/`.

---

## 3. The global `@` variables

### `@site`

**Availability:** every template, unconditionally, including `error.hbs` and `private.hbs`. Installed by `services/theme-engine/middleware/update-global-template-options.js` from `settingsCache.getPublic()`.

**Complete field list** — this is the allowlist in `ghost/core/core/shared/settings-cache/public.js`, which is authoritative and **larger than the documented list** at `docs.ghost.org/themes/helpers/data/site`:

| Field | Documented? | Fresh-install default | Can be empty? |
|---|---|---|---|
| `title` | yes | `'Ghost'` | no (seeded) |
| `description` | yes | `'Thoughts, stories and ideas'` | yes — user may clear it |
| `logo` | yes | `''` | **yes — empty on fresh install** |
| `icon` | yes | `''` | **yes — empty on fresh install** |
| `cover_image` | yes | `https://static.ghost.org/v5.0.0/images/publication-cover.jpg` | yes — user may clear it |
| `accent_color` | yes | `'#FF1A75'` | no (seeded) |
| `locale` | yes | `'en'` | no (seeded) |
| `lang` | **no** | alias of `locale` | no |
| `timezone` | yes | `'Etc/UTC'` | no (seeded) |
| `url` | yes | from config, request-adjusted | no |
| `admin_url` | yes | from config | no |
| `navigation` | yes | `[{Home,/},{About,/about/}]` | yes — user may empty it |
| `secondary_navigation` | yes (indirectly) | `[{Sign up,#/portal/}]` | yes |
| `facebook` | yes | `'ghost'` | yes |
| `twitter` | yes | `'@ghost'` | yes |
| `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin` | partly | `null` | **yes — null on fresh install**; also **added in v6.36.0**, absent on 5.x — see [§17](#17-ghost-5x-vs-6x) |
| `codeinjection_head`, `codeinjection_foot` | yes | `''` | yes |
| `meta_title`, `meta_description` | yes | `null` | **yes — null on fresh install** |
| `og_title`, `og_description`, `og_image` | yes | `null` | **yes — null on fresh install** |
| `twitter_title`, `twitter_description`, `twitter_image` | yes | `null` | **yes — null on fresh install** |
| `members_enabled`, `allow_self_signup`, `members_invite_only`, `paid_members_enabled`, `donations_enabled` | yes | *calculated, not stored* | boolean/null |
| `members_signup_access` | **no** | `'all'` | no |
| `members_support_address` | yes | `'noreply'` | no |
| `comments_enabled` | yes | `'all'` → coerced to boolean `!== 'off'` | no |
| `comments_access` | yes | *derived* from raw `comments_enabled` | no |
| `signup_url` | yes | *computed per request* | no |
| `recommendations_enabled` | yes | `false` | no |
| `portal_button` | yes | `false` | no |
| `portal_name` | yes | `true` | no |
| `portal_plans` | yes | `["free"]` | no |
| `portal_button_style` | yes | `'icon-and-text'` | no |
| `portal_button_signup_text` | yes | `'Subscribe'` | no |
| `portal_button_icon` | yes | `null` | yes |
| `portal_signup_terms_html` | yes | `null` | yes |
| `portal_signup_checkbox_required` | yes | `false` | no |
| `portal_default_plan` | **no** | — | — |
| `outbound_link_tagging` | **no** | `true` | no |
| `firstpromoter_account` | **no** | — | yes |
| `default_email_address`, `support_email_address` | **no** | *calculated* | — |
| `editor_default_email_recipients` | **no** | — | — |
| `labs` | **no** | `{}` | no |
| `site_uuid` | **no** | `null` at schema level | — |
| `transistor_portal_enabled` / `_heading` / `_description` / `_button_text` / `_url_template` | **no** | — | — |

Defaults sourced from `ghost/core/core/server/data/schema/default-settings/default-settings.json`.

Three `@site` values are **not** plain settings reads:

- `signup_url` — `'#/portal'`, or a Feedly RSS subscribe URL when `members_signup_access === 'none'` (`update-global-template-options.js`).
- `comments_enabled` — exposed to themes as a **boolean** (`siteData.comments_enabled !== 'off'`) while `comments_access` carries the original `all`/`paid`/`off` string (same file). The stored setting is a string; the theme-facing value is not.
- `url` / `admin_url` — recomputed per request so http/https matches the incoming scheme (`update-local-template-options.js`).

### `@custom`

Theme settings declared under `config.custom` in `package.json`. Available in every template. Global values from `customThemeSettingsCache.getAll()`; per-request preview overrides merged in `update-local-template-options.js`.
Docs: `docs.ghost.org/themes/helpers/data/custom`, `docs.ghost.org/themes/custom-settings`. Real declarations: `Casper/package.json` and `Source/package.json` under `config.custom`.

Types are `select`, `boolean`, `color`, `text` (from the two official themes' declarations). `select` and `text` are compared with `{{#match}}`; `boolean` with `{{#if}}` or `{{#match}}`. A `visibility` string (e.g. `"header_style:[Landing, Search]"`) conditionally hides a setting in Admin — see `Source/package.json`.

### `@config`

Per `docs.ghost.org/themes/helpers/data/config`, "there is only one property which will be passed through": `@config.posts_per_page`.

**Code shows two.** `update-global-template-options.js` sets:

```js
const themeData = {
    posts_per_page: activeTheme.get().config('posts_per_page'),
    image_sizes: activeTheme.get().config('image_sizes')
};
```

So `@config.image_sizes` also exists and is undocumented. Additionally, a `routes.yaml` route with an explicit `limit:` **overwrites `@config.posts_per_page` at render time for that route** (`services/routing/controllers/collection.js`) — so `@config.posts_per_page` is not necessarily the `package.json` value.

Default when unset: 5 (`docs.ghost.org/themes/structure`). Casper sets 25, Source sets 12.

### `@member`

Available in every template. `null` when logged out or when members are off. Fields, from `update-local-template-options.js`:

| Field | Documented? | Notes |
|---|---|---|
| `@member.uuid` | yes | |
| `@member.email` | yes | |
| `@member.name` | yes | |
| `@member.firstname` | yes | `name.split(' ')[0]`; `undefined` if `name` is unset |
| `@member.paid` | yes | `req.member.status !== 'free'` |
| `@member.subscriptions` | yes | array; `default_payment_card_last4` defaults to `'****'` |
| `@member.avatar_image` | **no** | present in code, absent from the `@member` attribute list in the docs |
| `@member.status` | **no** | raw status string; absent from the docs list |

Subscription sub-fields (`plan.*`, `customer.*`, `tier.*`, `next_payment.*`, `offer`, `offer_redemptions`, `cancel_at_period_end`, `current_period_end`, …) are documented at `docs.ghost.org/themes/members`.

### `@page`

Exactly one field: `@page.show_title_and_feature_image` (boolean, default `true`).
Docs: `docs.ghost.org/themes/helpers/data/page`.

It is injected by `services/rendering/format-response.js`, not by middleware, "because we need access to the rendered entry's data which isn't available in middleware". Critically, the underlying property is **deleted from the post object** so themes are forced through `@page`:

```js
// services/proxy.js — prepareContextResource
delete resource.show_title_and_feature_image;
```

**`@page` is NOT set on every template.** This is a real trap. The two injection paths differ:

| Render path | Function | `@page` set? |
|---|---|---|
| Single entry (`post.hbs`, `page.hbs`, `post-{slug}`, `page-{slug}`, `custom-*`) | `formatResponse()` | **Always** — seeded `{show_title_and_feature_image: true}`, then overwritten from the entry when it is a page |
| List (`index.hbs`, `home.hbs`, `tag.hbs`, `author.hbs`) | `formatPageResponse()` | **Only** when the route has an associated page object — the guard is `if (isPage(result.data?.page?.[0]))`, which is true for a `routes.yaml` custom-routed page, false for an ordinary feed |
| `error.hbs`, `private.hbs` | neither | **No** |

So `{{@page.show_title_and_feature_image}}` on a plain `index.hbs` is `undefined` → **falsy**, not `true`. `{{#match @page.show_title_and_feature_image}}` there renders nothing. Since local template options live on `res.locals`, this is per-request — there is no leakage from a previous entry render.

Default is `true` on every entry render, so `@page.show_title_and_feature_image` is truthy on `post.hbs` too — it is only *meaningfully* toggleable on pages. Both official themes gate only their page templates on it (`Casper/page.hbs:13`, `Source/page.hbs:9`), which is exactly the safe usage.

### `@labs`

Undocumented as a top-level reference but real: `update-global-template-options.js` sets `data.labs` from `labs.getAll()`. The docs use it in one `{{#has}}` example — `{{#has all="@labs.subscribers,@labs.publicAPI"}}` (`docs.ghost.org/themes/helpers/functional/has`) — without ever defining it. Treat as unstable.

### Loop-local `@` variables

Valid **only** inside `{{#foreach}}`. Set in `helpers/foreach.js`:

| Variable | Type | Meaning |
|---|---|---|
| `@index` | number | 0-based iteration |
| `@number` | number | 1-based iteration |
| `@key` | string | object key, when iterating an object |
| `@first` | boolean | `index === from - 1` |
| `@last` | boolean | last iteration |
| `@even` / `@odd` | boolean | see conflict note below |
| `@rowStart` / `@rowEnd` | boolean | only when `columns=` is passed |

**DOCS/CODE CONFLICT — `@even`/`@odd` parity.** The docs say "`@even` (boolean) - true if the `@index` is even" (`docs.ghost.org/themes/helpers/functional/foreach`). The code says:

```js
frame.even = index % 2 === 1;
frame.odd  = !frame.even;
```

For the first item (`index === 0`, `@number === 1`), the docs imply `@even` is true; the code makes it **false**. `@even`/`@odd` track the **1-based `@number`** parity, not `@index`. Trust the code: the first item is odd.

---

## 4. `default.hbs`

**Not a routable template.** It is a layout that other templates inherit via `{{!< default}}` on their first line (`Casper/post.hbs:1`, `Source/index.hbs:1`).

| Question | Answer |
|---|---|
| Top-level context | Whatever the **child** template was rendered with. `default.hbs` shares the child's root context. |
| `{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}` | Resolve against the child's root, so on a post render they are **empty** (see R1); on a list render they are empty too. Do not use bare resource fields here. |
| `@site` / `@custom` / `@config` / `@labs` | Yes |
| `@member` | Yes |
| `@page` | Only when the child render set it — i.e. entry templates. Undefined on feed/error/private renders |
| Loop `@` vars | No (unless inside a `{{#foreach}}` in this file) |
| Paginated `posts` at top level | Only when the child render supplied it (i.e. list contexts). Not reliable — do not depend on it here. |
| Requires `{{#get}}` | Anything resource-specific |

**Required helpers.** `docs.ghost.org/themes/structure`: "you must make use of the required helpers: `{{asset}}`, `{{body_class}}`, `{{post_class}}`, `{{ghost_head}}`, `{{ghost_foot}}`." `{{ghost_head}}` goes just before `</head>`, `{{ghost_foot}}` just before `</body>` (`docs.ghost.org/themes/helpers/utility/ghost_head_foot`).

**Child content injection.** `{{{body}}}` — triple-stache, mandatory. Named slots via `{{{block "name"}}}` + `{{#contentFor "name"}}` in the child (`docs.ghost.org/themes/helpers/utility/block`). Real usage: `Casper/default.hbs:77`, `Source/default.hbs:56` — both `{{{body}}}`.

**Constraint from the docs:** "Inherited template files, files that contain `{{{block "block-name"}}}`, cannot be templates used directly by Ghost. `post.hbs`, `page.hbs`, `index.hbs` can inherit other template files and use the `contentFor` helper but cannot contain block definitions."

Cross-context safety: what is safe in `default.hbs` is `@site`, `@custom`, `@member`, `@config`, `{{navigation}}`, `{{#is}}` guards, and `{{body_class}}`. Casper's `default.hbs` uses exactly this set plus `{{#match @custom.*}}` (verified by `@`-variable scan: `@custom.*`, `@member`, `@site.*` only).

---

## 5. `index.hbs`, `home.hbs`

`home.hbs` is `index.hbs` for `/` only, with identical data (R10). Everything below applies to both.

**Context:** `index`; plus `home` on `/`; plus `paged` on `/page/N/`.

### Top level

| Binding | Resolves to |
|---|---|
| `posts` | Array of post objects for this page of the feed |
| `pagination` | `{page, prev, next, pages, total, limit}` |
| `{{title}}` | **Empty.** The `title` helper reads `this.title`; the root has no `title`. |
| `{{url}}`, `{{excerpt}}`, `{{feature_image}}` | **Empty / nothing.** No resource is in scope at the root. |
| `{{@site.title}}` | Site title — this is what you want here |
| `{{meta_title}}` | Context-aware; see [§12e](#e-title-vs-sitetitle-on-indexhbs) |
| `@site`, `@custom`, `@config`, `@labs`, `@member` | All available |
| `@page` | **Not set** on an ordinary feed → `undefined`, falsy. Set only if the route is a `routes.yaml` custom-routed page. See [§3 `@page`](#page) |
| Loop `@` vars | Not available at top level |

Docs: `docs.ghost.org/themes/contexts/index-context` — "The `index` context provides templates with access to an array of post objects and a pagination object. As with all contexts, all of the `@site` global data is also available."

The docs' own example confirms the split precisely: `{{@site.title}}` in the header, `{{title}}` only inside `{{#foreach posts}}`.

### Inside `{{#foreach posts}}`

Full post scope. `{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}`, `{{feature_image_alt}}`, `{{feature_image_caption}}`, `{{featured}}`, `{{visibility}}`, `{{access}}`, `{{published_at}}`, `{{primary_tag}}`, `{{primary_author}}`, `{{tags}}`, `{{authors}}`, `{{reading_time}}`, `{{post_class}}`, `{{excerpt words="26"}}`, `{{date}}` — all resolve to the current post.

Plus loop vars `@index`, `@number`, `@first`, `@last`, `@even`, `@odd`, `@key`, and `@rowStart`/`@rowEnd` when `columns=` is passed.

Parent scope reachable with `../` — the docs' `author.hbs` example uses `{{plural ../pagination.total ...}}`.

**Content gating caveat:** posts are returned regardless of `visibility` unless you filter. `{{#foreach posts visibility="paid"}}` narrows it (`docs.ghost.org/themes/members`). Their bodies remain gated regardless — only the listing is affected.

**`{{#foreach}}`'s `visibility` default is asymmetric by collection type.** The docs state one rule: "By default, `foreach` only displays data that is public… Set `visibility` to `all` to show all data or to `none` to show hidden data" (`docs.ghost.org/themes/helpers/functional/foreach`). The code adds an exception for posts and newsletters (`helpers/foreach.js`):

```js
let visibility = options.hash.visibility;
if (_.isArray(items) && items.length > 0 && checks.isPost(items[0])) {
    visibility = visibility || 'all';
}
// ...same block again for checks.isNewsletter(items[0])
```

| Collection | Default `visibility` | Effect |
|---|---|---|
| `posts` | `'all'` | Members-only and paid posts **do** appear in feeds |
| `newsletters` | `'all'` | All newsletters appear |
| `tags` | public | Internal tags (`#name`) are **hidden** — pass `visibility="all"` to include |
| `tiers` | public | Hidden tiers are excluded |

So "only public data by default" is true for tags and tiers, and false for posts and newsletters. Plan feed-gating logic around the post rule.

**Pagination:** `{{pagination}}` renders Ghost's `helpers/tpl/pagination.hbs`, overridable by placing `partials/pagination.hbs` in the theme (`docs.ghost.org/themes/helpers/utility/pagination`). Inside it: `{{page}}`, `{{pages}}`, `{{page_url prev}}`, `{{page_url next}}`.

`{{pagination}}` **throws** if `this.pagination` is absent — `helpers/pagination.js` raises `IncorrectUsageError` with "The `{{pagination}}` helper was used outside of a paginated context." This is one of the few hard failures in the theme layer.

### Requires `{{#get}}`

Featured posts as a separate block, posts by another tag/author, tag or author lists, tiers, newsletters, post counts, anything beyond page N of the native feed.

### Real-theme reference

`Casper/index.hbs`, `Source/index.hbs`, `Source/home.hbs`. Source delegates the whole feed to `{{> "components/post-list" feed="index" postFeedStyle=@custom.post_feed_style showTitle=true showSidebar=@custom.show_publication_info_sidebar}}` — a good example of hash-param passing (see [§12i](#i-partial-hash-parameters)).

---

## 6. `post.hbs`, `post-{slug}.hbs`, `custom-{name}.hbs` (post)

**Context:** `post`.

### Top level

| Binding | Resolves to |
|---|---|
| `post` | The post object |
| `{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}` | **Empty at the top level.** Wrap in `{{#post}}`. (R1) |
| `posts` / `pagination` | **Absent.** No native feed on an entry template. `{{pagination}}` throws here. |
| `@site`, `@custom`, `@config`, `@member`, `@labs` | Available |
| `@page.show_title_and_feature_image` | Available, always `true` for posts |

### Inside `{{#post}}...{{/post}}`

> **Recorded, Story 4.6 (2026-09-14):** `meta_title` and `meta_description` are listed below and in the tag and author sections because Ghost's docs list them, but inside a resource block `{{meta_title}}` prints Ghost's page-meta *helper* (the page title, never the resource's field) on both 5.130.6 and 6.58.0, so neither is a bindable field in `packages/library/contexts/matrix.json`; `page` printed empty inside the post block too. The recording outranks the lists (appendix B.1's order of authority).

Documented attributes (`docs.ghost.org/themes/contexts/post`): `id`, `comment_id`, `title`, `slug`, `excerpt`, `custom_excerpt`, `content`, `url`, `feature_image`, `feature_image_alt`, `feature_image_caption`, `featured`, `page`, `meta_title`, `meta_description`, `published_at`, `updated_at`, `created_at`, `primary_author`, `primary_tag`, `tags`.

Members-related, from `docs.ghost.org/themes/members`: `access` (boolean — does this viewer have access), `visibility` (`public` | `members` | `paid`).

Nested scopes: `{{#primary_tag}}`, `{{#primary_author}}`, `{{#foreach tags}}`, `{{#foreach authors}}`.

**`{{url}}` must be the helper, not the attribute.** `docs.ghost.org/themes/contexts/post`: "Always open a context and use `{{url}}` explicitly for *all* resources… use `{{#post}}{{url}}{{/post}}` instead of `{{post.url}}`."

**`{{content}}` and gating.** When `access` is false, `{{content}}` emits Ghost's upgrade CTA instead of the body (`helpers/content.js` → `templates.execute('content-cta', ...)`). Override with `partials/content-cta.hbs` (`docs.ghost.org/themes/members`).

**Adjacent posts:** `{{#prev_post}}` / `{{#next_post}}` (`docs.ghost.org/themes/helpers/utility/prev_next_post`) — native, no `{{#get}}` needed.

### Requires `{{#get}}`

Related/recommended posts, "more by this author", "same primary tag", post counts, tiers. The canonical patterns are in `docs.ghost.org/themes/helpers/functional/get`:

```handlebars
{{#post}}
  {{#get "posts" filter="primary_tag:{{primary_tag.slug}}" limit="3"}}...{{/get}}
  {{#get "posts" filter="authors:{{primary_author.slug}}+id:-{{id}}" limit="3"}}...{{/get}}
{{/post}}
```

Note the docs' warning: filters must use raw data attributes (`{{published_at}}`), not helpers (`{{date}}`), "as helper functions do not get called inside of a filter."

### Real-theme reference

`Casper/post.hbs`, `Source/post.hbs` — both open `{{#post}}` on line 7 / line 4 respectively and never touch bare fields outside it.

---

## 7. `page.hbs`, `page-{slug}.hbs`, `custom-{name}.hbs` (page)

**Context:** `page`.

Identical to `post.hbs` in every respect except:

1. The root object carries **both** `post` and `page` keys pointing at the same object (`format-response.js`: `entry.page = post`). You still open `{{#post}}` — both official themes do (`Casper/page.hbs:7`, `Source/page.hbs:4`). `docs.ghost.org/themes/contexts/page`: "A page is just a special type of post, so the data object is called a post, not a page."
2. `@page.show_title_and_feature_image` is genuinely toggleable and **must** be honoured — gate the title and feature-image markup on it, or the editor's toggle does nothing (`docs.ghost.org/themes/helpers/data/page`).
3. `page` (the boolean attribute on the post object) is `true`.
4. The page URL is always `/{slug}/` and is **not** configurable, unlike post permalinks (`docs.ghost.org/themes/contexts/page`).

Pattern from both themes:

```handlebars
{{#post}}
  {{#match @page.show_title_and_feature_image}}
    <h1>{{title}}</h1>
    {{> "feature-image"}}
  {{/match}}
  {{content}}
{{/post}}
```

---

## 8. `tag.hbs`, `tag-{slug}.hbs`

**Context:** `tag` (+ `paged` on `/tag/{slug}/page/N/`).

### Top level

| Binding | Resolves to |
|---|---|
| `tag` | The matched tag object |
| `posts` | Array of posts carrying that tag, for this page |
| `pagination` | Full pagination object |
| `{{title}}` | **Empty.** A tag has `name`, not `title` — and the root is not the tag anyway. |
| `{{url}}`, `{{feature_image}}` | Empty at root; available inside `{{#tag}}` |
| `@site`, `@custom`, `@config`, `@member`, `@labs` | Available |

### Inside `{{#tag}}...{{/tag}}`

`id`, `name`, `slug`, `description`, `feature_image`, `meta_title`, `meta_description`, `url`, `accent_color`.
Docs: `docs.ghost.org/themes/contexts/tag`.

Note there is **no `title`** on a tag — use `{{name}}`. And no `count.posts` unless fetched via `{{#get "tags" include="count.posts"}}`.

### Inside `{{#foreach posts}}`

Same as [§5](#5-indexhbs-homehbs).

### Requires `{{#get}}`

Post count for the tag, sibling/related tags, any other tag's posts.

Real-theme reference: `Casper/tag.hbs`, `Source/tag.hbs`.

---

## 9. `author.hbs`, `author-{slug}.hbs`

**Context:** `author` (+ `paged`).

### Top level

| Binding | Resolves to |
|---|---|
| `author` | The matched author object |
| `posts` | Array of that author's posts, this page |
| `pagination` | Full pagination object |
| `{{title}}` | **Empty.** Authors have `name`. |
| `@site`, `@custom`, `@config`, `@member`, `@labs` | Available |

### Inside `{{#author}}...{{/author}}`

`id`, `name`, `slug`, `bio`, `location`, `website`, `url`, `profile_image`, `cover_image`, `meta_title`, `meta_description`, and social handles: `facebook`, `twitter`, `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin`.
Docs: `docs.ghost.org/themes/contexts/author`.

The docs' `author.hbs` example demonstrates reaching the parent scope from inside the author block: `{{plural ../pagination.total empty='No posts' singular='% post' plural='% posts'}}`.

Real-theme reference: `Casper/author.hbs`, `Source/author.hbs` — both iterate the social handles through nested icon partials (`{{> "icons/bluesky"}}` etc.).

---

## 10. `error.hbs`, `error-404.hbs`, `error-{N}xx.hbs`

**Context:** **none of the standard contexts.** `error` is not a context value — `{{#is "error"}}` never matches (R10).

### Data

Exactly three keys, set in `ghost/core/core/frontend/web/middleware/error-handler.js`:

```js
{
    message: err.message,
    statusCode: err.statusCode,
    errorDetails: err.errorDetails || []
}
```

| Binding | Resolves to |
|---|---|
| `{{statusCode}}` | HTTP status code |
| `{{message}}` | Error message |
| `{{errorDetails}}` | Array; empty `[]` unless it's a theme error. Each entry has `rule` and a `failures` array of `{ref, message}`. |
| `{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}` | **Empty** — no resource in scope |
| `posts` / `pagination` | **Absent** |
| `@site`, `@custom`, `@config`, `@member`, `@labs` | **Available** — see below |

Docs: `docs.ghost.org/themes/contexts/error`.

### `@site` in error templates — confirmed

The error handler renders through `res.render(res._template, data, ...)`. The `updateGlobalTemplateOptions` / `updateLocalTemplateOptions` middlewares have already installed `@site`, `@custom`, `@member` and `@config` onto the render options for the request, so they survive into the error render.

Confirmed three ways:
1. **Ghost's own default error template** — the docs' `error.hbs` example uses `{{@site.url}}` (`docs.ghost.org/themes/contexts/error`).
2. **Casper's `error.hbs`** uses `{{@site.logo}}`, `{{@site.url}}`, `{{@site.title}}` (lines 32-36, 49).
3. **Casper's `error-404.hbs`** uses `{{@site.url}}` (line 20).

**DOCS/CODE CONFLICT — helper restrictions in error templates.** The docs state:

> "Error templates shouldn't use any theme helpers, with the exception of `{{asset}}`, or extend the default template… The only error template that is permitted to use helpers is the `error-404.hbs` template file."

Casper's shipping `error.hbs` violates this comprehensively: `{{meta_title}}` (line 20), `{{asset}}` (23), `{{img_url}}` (33), `{{t}}` (49, 54), `{{#if}}` and `{{#foreach}}` (52-65). And `error-404.hbs` opens with `{{!< default}}` — extending the default template, which the docs also advise against — and runs a `{{#get "posts"}}` query (line 29).

**Resolution:** the docs' rule is a *robustness recommendation*, not an enforced capability limit. Its rationale is sound and stated in Casper's own comment block:

> "Because 500 errors in particular usually happen when a server is struggling, this template is as simple as possible. No template dependencies, no JS, no API calls. This is to prevent rendering the error-page itself compounding the issue causing the error in the first place."

**Normative guidance:** `@site` and helpers *work* in all error templates. Follow Casper's split — `error-404.hbs` may be rich (it extends `default.hbs` and runs `{{#get}}`); `error.hbs` should be self-contained with no layout inheritance and no API calls, because it is the template that renders when things are already broken.

**Failure mode:** if the error template itself throws, Ghost falls back to `core/frontend/views/error.hbs` (`error-handler.js:109`) and ultimately to a bare HTML string containing "Oops, seems like something went wrong" plus the escaped message (`errorFallbackMessage`). An error raised *before* the theme middlewares run would render without `@site` — a narrow edge case, but the reason `error.hbs` should not hard-depend on globals for structural markup.

**Error templates are genuinely optional.** Casper ships both `error.hbs` and `error-404.hbs`; **Source ships neither** — its theme root contains only `author`, `default`, `home`, `index`, `page`, `post` and `tag`. Source therefore serves Ghost's built-in error view on every error. Useful evidence that a theme is complete and shippable without any error template.

---

## 11. `private.hbs`

**Context:** `private`. Detected by URL prefix `/private/` (`services/rendering/context.js`). `{{#is "private"}}` matches.

There is **no `contexts/private` page** in the docs — `private` appears only in the structure page and in the `{{#is}}` context list. The findings below are from source.

### Data

From `ghost/core/core/frontend/apps/private-blogging/lib/router.js`:

```js
let data = {};
if (res.error) {
    data.error = res.error;
}
```

| Binding | Resolves to |
|---|---|
| `{{error.message}}` | `'Incorrect access code.'` after a failed submit; otherwise `error` is absent |
| `{{#if error}}` | The only useful conditional on this page |
| `{{input_password}}` | Ghost helper rendering `<input type="password" name="password">`. Accepts `class`, `placeholder`, `data-1p-ignore`. Source: `apps/private-blogging/lib/helpers/input_password.js` |
| `{{title}}`, `{{url}}`, `{{excerpt}}`, `{{feature_image}}` | **Empty** |
| `posts` / `pagination` | **Absent** |
| `@site`, `@custom`, `@config`, `@member`, `@labs` | **Available** |

### `@site` in `private.hbs` — confirmed

Ghost's own default private template (`apps/private-blogging/lib/views/private.hbs`) uses `{{@site.locale}}`, `{{@site.title}}`, `{{@site.url}}`, `{{@site.icon}}`, `{{@site.description}}`, `{{@site.cover_image}}`, `{{@site.accent_color}}`, `{{@site.admin_url}}` and `{{@site.allow_self_signup}}`, plus the helpers `{{img_url}}`, `{{asset}}`, `{{t}}`, `{{json}}`, `{{color_to_rgba}}`, `{{contrast_text_color}}` and `{{input_password}}`. That is the strongest possible citation — it is the file Ghost falls back to when a theme has no `private.hbs`.

**Form mechanics:** the form is `method="post"` to the same `/private/` URL with a `password` field. A `?r=` query param carries the post-login redirect target, host-validated against the site URL (`lib/middleware.js`, `getRedirectUrl`).

**Note:** when `@site.allow_self_signup` is true, Ghost's default template *also* renders a members subscribe form alongside the access-code gate. A custom `private.hbs` that only renders the password field loses that affordance.

**Neither Casper nor Source ships a `private.hbs`** — both fall back to Ghost's built-in view. So there is no official-theme reference implementation for this template; the Ghost default view cited above is the only worked example.

---

## 12. Specific questions

### (a) Is `@site` available in every template?

**Yes — including `error.hbs` and `private.hbs`.** No exceptions found.

**Mechanism.** `services/theme-engine/middleware/index.js` mounts three middlewares on every frontend request: `ensure-active-theme`, `update-global-template-options`, `update-local-template-options`. The second installs `@site` (plus `@labs`, `@config`, `@custom`) via `hbs.updateTemplateOptions`; the third installs `@member` and the request-adjusted `@site.url`/`@site.admin_url` via `hbs.updateLocalTemplateOptions`.

These are Handlebars **runtime options**, not per-render template data — which is what makes the guarantee hold. In `express-hbs/lib/hbs.js`:

```js
ExpressHbs.prototype.updateTemplateOptions = function (templateOptions) {
  this._options.templateOptions = templateOptions;          // instance-global
};
ExpressHbs.prototype.updateLocalTemplateOptions = function (locals, localTemplateOptions) {
  return (locals._templateOptions = localTemplateOptions);  // per-request, on res.locals
};
```

and at render time (line 493):

```js
res = template(localsClone, _.merge({}, self._options.templateOptions, localTemplateOptions));
```

The merged object becomes the `@` data frame. So **every** `res.render()` in the process picks up the globals — including the error handler's direct `res.render(res._template, data, ...)` call, which bypasses `renderer.renderer` entirely. Two consequences:

- Globals are merged in at *render*, independent of the `data` object each route builds. That is why `error.hbs` gets `@site` despite its data being only `{message, statusCode, errorDetails}`.
- `_options.templateOptions` is **instance-global and persists between requests**, so `@site`/`@config`/`@custom`/`@labs` remain populated even on a request whose middleware chain was cut short — provided the process has served at least one normal request.

**Docs citation:** every context page repeats the formula "As with all contexts, all of the `@site` global data is also available" — `docs.ghost.org/themes/contexts/{index-context,page,post,tag,author}`. And `docs.ghost.org/themes/helpers/data/site` opens: "The `@site` property provides access to global settings, which are **available anywhere in your theme**."

**Code citations for the two contested templates:**
- error: `Casper/error.hbs:32-36,49` and `Casper/error-404.hbs:20`; docs example at `docs.ghost.org/themes/contexts/error` uses `{{@site.url}}`.
- private: `ghost/core/core/frontend/apps/private-blogging/lib/views/private.hbs` — Ghost's own fallback, uses nine distinct `@site` fields.

**Sole caveat:** an error thrown *before* `update-global-template-options` runs (e.g. no active theme) renders Ghost's built-in fallback view, not yours. Don't build required page structure on `@site` inside `error.hbs`.

### (b) What happens when a theme references a variable not in context?

**Silent empty string. Never an error. No warning in production.**

Ghost compiles with:

```js
onCompile: function onCompile(exhbs, source) {
    return exhbs.handlebars.compile(source, {preventIndent: true});
}
```

— `ghost/core/core/frontend/services/theme-engine/engine.js`. Only `preventIndent` is set. Handlebars' `strict` and `assumeObjects` options are **not** enabled, so Handlebars uses its default lenient resolution: an unresolved path yields `undefined`, which the output stage renders as `''`.

**Does it differ between `{{foo}}` and `{{#if foo}}`?** No — both see the same `undefined`, they just do different things with it:

| Expression | Missing `foo` | Notes |
|---|---|---|
| `{{foo}}` | renders `''` | indistinguishable from `foo` being `""` or `null` |
| `{{#if foo}}` | takes `{{else}}` | `undefined` is falsy |
| `{{foo.bar}}` | renders `''` | no "cannot read property of undefined" — Handlebars guards each segment |
| `{{#foo}}...{{/foo}}` | block skipped | block-with-falsy-value behaves like `{{#if}}` |
| `{{someHelper}}` where the helper exists but its data doesn't | depends on the helper | most return `''`; see exceptions below |

**Evaluation rules for `{{#if}}`**, quoted from `docs.ghost.org/themes/helpers/functional/if`:

> "Any passed in value which is equivalent to `false`, `0`, `undefined`, `null`, `""` (an empty string) or `[]` (an empty array) is considered false, and any other value is considered true… Any property which doesn't exist or is not set will always evaluate false. Empty arrays or objects will be false."

**Important exceptions — helpers that DO throw:**

| Helper | Failure |
|---|---|
| `{{pagination}}` | Throws `IncorrectUsageError` when `this.pagination` is missing or malformed — "The `{{pagination}}` helper was used outside of a paginated context." Also throws if `page`/`pages`/`limit`/`total` are undefined or non-numeric. Source: `helpers/pagination.js` |
| `{{> "name"}}` (inline partial) | Throws a page error if the partial doesn't exist. `docs.ghost.org/themes/helpers/utility/partials`: "the inline form throws a page error and breaks the rendered page." Use the block form `{{#> (concat ...)}}...{{/undefined}}` for a fallback. |
| `{{#get}}` | Does not throw on empty results, but **can abort on timeout**, returning an empty collection plus a visible `<span data-aborted-get-helper>Could not load content</span>` and an `X-Ghost-Degraded-Render` response header. Source: `helpers/get.js`, `services/rendering/renderer.js` |

In non-production environments Ghost lowers the Handlebars logger to level 0 (`engine.js`), so missing-value warnings surface in dev but not in production. `{{log value}}` is available for explicit debugging (`docs.ghost.org/themes/helpers/utility/log`).

**Design consequence:** a typo in a binding name is invisible at runtime. There is no fail-fast. Validation must come from GScan and from tests, not from the renderer.

### (c) Which `@site` fields can be empty on a fresh Ghost install?

Two distinct questions, because of R5: *no key is ever missing* — the question is only which are `null` or `''`.

**Empty on a genuinely fresh install (never populated by setup):**

| Field | Fresh value | Why |
|---|---|---|
| `logo` | `''` | Optional. **The single most common false assumption.** Casper guards it: `{{#if @site.logo}}` (`Casper/error.hbs:32`, `Casper/default.hbs`). |
| `icon` | `''` | Optional |
| `meta_title`, `meta_description` | `null` | Optional SEO overrides |
| `og_title`, `og_description`, `og_image` | `null` | Optional |
| `twitter_title`, `twitter_description`, `twitter_image` | `null` | Optional |
| `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin` | `null` | Optional — and **entirely absent before v6.36.0** |
| `codeinjection_head`, `codeinjection_foot` | `''` | Optional |
| `portal_button_icon`, `portal_signup_terms_html` | `null` | Optional |

**Seeded with a non-empty default (but user-clearable):**

| Field | Fresh value |
|---|---|
| `title` | `'Ghost'` |
| `description` | `'Thoughts, stories and ideas'` |
| `cover_image` | `https://static.ghost.org/v5.0.0/images/publication-cover.jpg` |
| `accent_color` | `'#FF1A75'` |
| `locale` | `'en'` |
| `timezone` | `'Etc/UTC'` |
| `facebook` | `'ghost'` |
| `twitter` | `'@ghost'` |
| `navigation` | `[{Home,/},{About,/about/}]` |
| `secondary_navigation` | `[{Sign up,#/portal/}]` |

**Never empty (config- or code-derived):** `url`, `admin_url`, `signup_url`, `members_enabled`, `allow_self_signup`, `members_invite_only`, `paid_members_enabled`, `comments_enabled`, `comments_access`, `members_signup_access`, `recommendations_enabled`, `portal_*` booleans.

**Direct answers to the examples asked:** `description` — optional, seeded but clearable. `logo` — optional, **empty on fresh install**. `cover_image` — seeded to a Ghost stock image, clearable. `icon` — optional, **empty on fresh install**.

Source: `ghost/core/core/server/data/schema/default-settings/default-settings.json`, group `site`; allowlist `ghost/core/core/shared/settings-cache/public.js`; null-fill logic `cache-manager.js:240-261`.

Note `members_enabled`, `allow_self_signup`, `members_invite_only`, `paid_members_enabled`, `donations_enabled`, `default_email_address` and `support_email_address` are **absent from `default-settings.json`** — they are calculated fields derived from other settings, typed `boolean|null` in `cache-manager.js`'s `PublicSettingsCache` typedef.

**Practical rule:** guard `logo`, `icon`, and all social handles with `{{#if}}`. Everything else has a usable default, but nothing is guaranteed — `{{#if}}` is never wrong, because `getPublic()` guarantees the key exists.

### (d) Which post/page fields can be empty or null on a real post?

| Field | Can be empty? | Notes |
|---|---|---|
| `feature_image` | **Yes** | Entirely optional. Both official themes guard it: `{{#if feature_image}}`. Docs' `{{#if}}` example is literally this case. |
| `feature_image_alt`, `feature_image_caption` | **Yes** | Optional even when `feature_image` is set. `feature_image_caption` is HTML, converted to `SafeString` by `prepareContextResource` |
| `custom_excerpt` | **Yes** | Optional. Both themes guard: `{{#if custom_excerpt}}` (`Casper/post.hbs:28`, `Source/post.hbs:16`) |
| `excerpt` | No | Auto-generated from content — first 500 chars of plaintext when `custom_excerpt` is unset (`docs.ghost.org/themes/helpers/data/excerpt`). Empty only if the post has no content. |
| `primary_tag` | **Yes** | Null when the post has no tags. "Each post has a list of **0 or more** tags" (`docs.ghost.org/themes/contexts/post`). Both themes guard it. |
| `tags` | **Yes** | Empty array. `{{#foreach tags}}...{{else}}...{{/foreach}}` handles it. Internal tags (`#name`) are filtered out by default — pass `visibility="all"` to include them. |
| `primary_author` | **No** in practice | Every post has at least one author. Not structurally guaranteed, but no path in Ghost produces an authorless published post. |
| `published_at` | **Yes — null on a draft** | Only reachable via preview routes in a theme; published posts always have it. `{{date}}` falls back to the current date when `published_at` is absent (`docs.ghost.org/themes/helpers/data/date`) — so a missing date renders as *today*, not as blank. Actively misleading; guard explicitly if drafts are reachable. |
| `meta_title`, `meta_description` | **Yes** | Optional overrides. Use `{{meta_title}}` (context-aware, always yields something) rather than the raw attribute. |
| `canonical_url` | **Yes** | Optional |
| `content` / `html` | **Yes** | `helpers/content.js` explicitly normalises `if (this.html === null) { this.html = ''; }`. Also emptied by member gating — hence the `access` check. |
| `access` | No | Always boolean on members-enabled sites |
| `visibility` | No | Always one of `public`, `members`, `paid` |
| `featured` | No | Boolean, defaults `false` |
| `page` | No | Boolean, defaults `false` |
| `show_title_and_feature_image` | **n/a** | **Deleted from the post object.** Only via `@page`. Source: `services/proxy.js`, `prepareContextResource` |
| `codeinjection_head` / `_foot` (per-post) | **Yes** | Optional; surfaced through `{{ghost_head}}`/`{{ghost_foot}}`, not read directly |

Attribute lists: `docs.ghost.org/themes/contexts/post` and `docs.ghost.org/themes/contexts/page`.

**Highest-risk assumptions in practice:** `feature_image`, `custom_excerpt` and `primary_tag`. All three are null on ordinary, correctly-authored posts, and all three are guarded in both official themes.

### (e) `{{title}}` vs `{{@site.title}}` on `index.hbs`

| Expression | On `index.hbs` (top level) |
|---|---|
| `{{title}}` | **Empty string.** |
| `{{@site.title}}` | The site title, e.g. `'Ghost'` |
| `{{meta_title}}` | Context-aware — see below |

**Why `{{title}}` is empty.** `title` is a *registered helper*, not a path lookup — so it wins over any same-named property. Its entire body is:

```js
module.exports = function title() {
    return new SafeString(escapeExpression(this.title || ''));
};
```

— `ghost/core/core/frontend/helpers/title.js`. On `index.hbs`, `this` is the root context `{posts, pagination}`, which has no `title`, so it returns `''`. The `|| ''` means it degrades silently rather than printing `undefined`.

The docs' own `index.hbs` example makes the distinction unambiguous: `{{@site.title}}` in the page header, `{{title}}` only inside `{{#foreach posts}}` where `this` is a post (`docs.ghost.org/themes/contexts/index-context`).

**Yes, there is a `{{meta_title}}` distinction — and it is significant.** `{{meta_title}}` is a separate, fully context-aware helper (`helpers/meta_title.js` → `core/frontend/meta/title.js`). Its resolution ladder:

| Context | `{{meta_title}}` yields |
|---|---|
| `home` | `@site.meta_title` or `@site.title` |
| `index` + `paged` | `@site.title` + `' (Page N)'` |
| `post` | post `meta_title` or post `title` |
| `page` | page `meta_title` or page `title` |
| `tag` | tag `meta_title` or `tag.name - {site title}` |
| `tag` + `paged` | tag `meta_title` or `tag.name - {site title} (Page N)` |
| `author` | `author.name - {site title}` |
| `author` + `paged` | `author.name - {site title} (Page N)` |
| fallback (incl. error) | `{site title}` + page string |

The `(Page N)` suffix appears only when `pagination.total > 1`, and is overridable via a `page=` hash param. Source: `core/frontend/meta/title.js:11-65`.

**Consequences:**
- `{{meta_title}}` never returns empty on a normal page — it always falls through to the site title. That is why Casper safely uses `<title>{{meta_title}}</title>` in `error.hbs` (line 20).
- `{{meta_title}}` reads context from `options.data.root.context`, so it works at the top level of *any* template without opening a block — unlike `{{title}}`.
- **Rule:** use `{{meta_title}}` in `<title>`/meta tags, `{{@site.title}}` for site branding, and `{{title}}` only inside a post scope.

### (f) `@member` behaviour per context

**Availability: universal.** Set by `update-local-template-options.js`, which runs on every frontend request before routing. It is present in every template — `index`, `home`, `post`, `page`, `tag`, `author`, `error`, `private`, custom routes, and inside every partial and `{{#foreach}}`.

**Value:**

```js
const member = req.member ? { uuid, email, name, firstname, avatar_image, subscriptions, paid, status } : null;
```

| Situation | `@member` | `{{#if @member}}` |
|---|---|---|
| Logged-in member | object | true |
| Logged-out visitor | `null` | false |
| **Members feature disabled** | `null` | false |

**Is it available when members are disabled?** **Yes — the variable exists and is `null`.** `req.member` is only populated by the members middleware for an authenticated member; with members off, nothing populates it, so the ternary yields `null`. It is never `undefined`, so `{{#if @member}}` is safe unconditionally — no `@site.members_enabled` pre-check is needed for correctness.

That said, both official themes *do* pair the two, because they want to hide member UI entirely rather than just its logged-in branch:

```handlebars
{{#if @site.members_enabled}}
  {{#if @member}} ... {{else}} ... {{/if}}
{{/if}}
```

— pattern visible in `Source/partials/components/navigation.hbs` and `Source/partials/components/header.hbs` (both reference `@site.members_enabled` and `@member`), and `Casper/default.hbs`.

**Context-specific notes:**

- **`post.hbs`** — `@member` is the identity; `access` (on the post) is the authorisation. They are distinct: `@member` can be truthy while `access` is false for a paid post held by a free member. Gate content on `access`, gate UI on `@member`.
- **`index.hbs` / feeds** — `@member` does not filter `posts`. Gated posts still appear; use `{{#foreach posts visibility="paid"}}` to filter (`docs.ghost.org/themes/members`).
- **`error.hbs` / `private.hbs`** — available. Ghost's default `private.hbs` doesn't use `@member` but does use `@site.allow_self_signup` to decide whether to offer signup.
- **`@member.subscriptions`** — array, iterate with `{{#foreach @member.subscriptions}}`. `{{cancel_link}}` and `{{price plan}}` only work inside that loop. `next_payment` is `null` for inactive subscriptions — the docs say "always guard access with `{{#if}}`."
- **`@member.firstname`** — `undefined` when `name` is unset (`req.member.name && req.member.name.split(' ')[0]`), which is common since name capture is optional at signup.
- **Caching** — a page whose markup branches on `@member` cannot be cached identically for all visitors. On Ghost(Pro) member-dependent markup is resolved client-side by Portal for anonymous-cacheable pages. Relevant to any spec assuming server-rendered per-member content.

### (g) Escaping and triple-stache

**Yes, Ghost escapes `{{variable}}` by default** — it uses stock Handlebars semantics, where `{{ }}` HTML-escapes and `{{{ }}}` does not. Ghost exposes the escaper as `instance.escapeExpression = instance.handlebars.Utils.escapeExpression` (`services/theme-engine/engine.js`).

**But Ghost's helpers largely make triple-stache unnecessary**, by returning `SafeString`. From `helpers/content.js`:

> "Turns content html into a safestring so that the user doesn't have to escape it or tell handlebars to leave it alone with a triple-brace."

**Helpers returning `SafeString`** (audit of `ghost/core/core/frontend/helpers/*.js`): `asset`, `authors`, `body_class`, `comment_count`, `comments`, `concat`, `content`, `content_api_key`, `content_api_url`, `date`, `encode`, `excerpt`, `get`, `ghost_foot`, `ghost_head`, `json`, `link`, `link_class`, `match`, `navigation`, `plural`, `post_class`, `readable_url`, `reading_time`, `search`, `split`, `t`, `tags`, `tiers`, `title`, `total_members`, `total_paid_members`, `url`. Plus `pagination`, `recommendations` and `cancel_link`, which return `SafeString` indirectly via `templates.execute()` (`services/theme-engine/handlebars/template.js` wraps its output in `new hbs.SafeString(...)`).

Two of these escape their input *before* wrapping, so they are safe rather than merely unescaped:
- `title` — `new SafeString(escapeExpression(this.title || ''))`
- `excerpt` — `_.escape(excerptText)` then `SafeString`

**What genuinely needs `{{{ }}}`:**

| Expression | Why |
|---|---|
| `{{{body}}}` | Layout injection point in `default.hbs`. Mandatory. `Casper/default.hbs:77`, `Source/default.hbs:56` |
| `{{{block "name"}}}` | Named layout slot. `docs.ghost.org/themes/helpers/utility/block` |
| `{{{rule}}}` | Inside `{{#foreach errorDetails}}` — a raw HTML-bearing string with no helper wrapper. `Casper/error.hbs:58`; same in the docs' error example |
| Raw HTML attributes fetched via `{{#get}}` | Content API strings are not `SafeString`; wrap or triple-stache deliberately |

**Empirical check — the only triple-staches in either official theme:**

```
Casper/default.hbs:77   {{{body}}}
Casper/error.hbs:58     {{{rule}}}
Source/default.hbs:56   {{{body}}}
```

Three occurrences across two complete production themes. That is the practical answer: `{{{ }}}` is for layout plumbing and for `errorDetails`, essentially nothing else.

**Notable non-cases** — these look like they need triple-stache but must **not** get it:
- `{{content}}` — already `SafeString`
- `{{excerpt}}` — already `SafeString`, and pre-escaped
- `{{feature_image_caption}}` — converted to `SafeString` by `prepareContextResource`, sanitised to `a`, `b`, `i`, `span` with `href`/`style` (`services/proxy.js`). The source comment: "feature_image_caption contains HTML, making it a SafeString spares theme devs from triple-curlies."
- `{{ghost_head}}` / `{{ghost_foot}}` — `SafeString`
- `{{navigation}}` / `{{pagination}}` — `SafeString`
- `@site.codeinjection_head` — do not output directly; `{{ghost_head}}` already emits it

Triple-staching an already-`SafeString` value is harmless (SafeString bypasses escaping either way) but signals a misunderstanding and is a genuine XSS footgun if the expression is later changed to a raw attribute.

### (h) Nested partial directories

**Yes. `{{> "sections/home/hero"}}` resolves to `partials/sections/home/hero.hbs`.** Arbitrary nesting depth.

**The docs never state this.** `docs.ghost.org/themes/helpers/utility/partials` says only "All partials are stored in the `partials/` directory of the theme," and `docs.ghost.org/themes/structure` shows a flat `/partials/list-post.hbs` example. This is a documentation gap, not a limitation.

**Source-level proof.** Ghost registers partials through express-hbs (`services/theme-engine/engine.js`):

```js
const hbsOptions = {
    partialsDir: [config.get('paths').helperTemplates],
    ...
};
if (partialsPath) {
    hbsOptions.partialsDir.push(partialsPath);
}
```

express-hbs walks each directory **recursively** with `readdirp` and names each partial by its path relative to the partials root (`express-hbs/lib/hbs.js:162-179`):

```js
readdirp(self.partialsDir[count], { fileFilter: '*' + self._options.extname })
  .on('data', function (entry) {
    var source = fs.readFileSync(entry.fullPath, 'utf8');
    var dirname = path.dirname(entry.path);
    dirname = dirname === '.' ? '' : dirname + '/';
    var name = dirname + path.basename(entry.basename, self._options.extname);
    name = name.split('\\').join('/');   // windows path fix
    self.registerPartial(name, source, entry.fullPath);
  })
```

So `partials/sections/home/hero.hbs` registers as `sections/home/hero`. Forward slashes always, on every platform.

**Proof from shipping themes:**

| Theme | Call site | File |
|---|---|---|
| Casper | `{{> "icons/fire"}}` (`post.hbs`) | `partials/icons/fire.hbs` |
| Casper | `{{> "icons/search"}}` (`default.hbs`) | `partials/icons/search.hbs` |
| Source | `{{> "components/footer"}}` (`default.hbs`) | `partials/components/footer.hbs` |
| Source | `{{> "components/post-list"}}` (`index.hbs`, `home.hbs`, `tag.hbs`, `author.hbs`) | `partials/components/post-list.hbs` |
| Source | `{{> "typography/fonts"}}` (`default.hbs`) | `partials/typography/fonts.hbs` |

Casper ships 15 partials under `partials/icons/`; Source ships 7 under `partials/components/`, 4 under `partials/typography/`, and 19 under `partials/icons/`.

**Two consequences worth specifying:**

1. **Two partial roots, theme wins.** Ghost's built-in template directory is registered *first* and the theme's `partials/` *second*, and `registerPartial` overwrites by name. That is the documented mechanism by which `partials/pagination.hbs` and `partials/navigation.hbs` override Ghost's defaults (`docs.ghost.org/themes/helpers/utility/pagination`, `.../data/navigation`). It also means a theme partial named e.g. `content-cta` silently overrides a Ghost internal — intended for `content-cta.hbs` (`docs.ghost.org/themes/members`), a hazard otherwise.
2. **Dynamic partial names must use the block form.** `{{#> (concat "icons/" type)}}fallback{{/undefined}}` falls back gracefully; the inline form `{{> (concat ...)}}` "throws a page error and breaks the rendered page" (`docs.ghost.org/themes/helpers/utility/partials`). The closing tag really is `{{/undefined}}`.

### (i) Partial hash parameters

**Yes — and they are used heavily in Source.** Documented at `docs.ghost.org/themes/helpers/utility/partials`:

```handlebars
{{> "call-to-action" heading="Sign up now"}}
```

```handlebars
<!-- partials/call-to-action.hbs -->
{{#if heading}}<h2>{{heading}}</h2>{{/if}}
```

**Real usage — `Source/home.hbs`:**

```handlebars
{{> "components/featured" showFeatured=@custom.show_featured_posts limit=4}}
{{> "components/header" headerStyle=@custom.header_style}}
{{> "components/post-list" feed="home" postFeedStyle=@custom.post_feed_style showTitle=true showSidebar=@custom.show_publication_info_sidebar}}
```

`Source/post.hbs` uses `{{> "post-card" lazyLoad=true}}`; `Source/default.hbs` uses `{{> "components/navigation" navigationLayout=@custom.navigation_layout}}`.

**What hash params can express:**

| Value kind | Supported | Example |
|---|---|---|
| String literal | yes | `feed="archive"` |
| Number literal | yes | `limit=4` |
| Boolean literal | yes | `showTitle=false`, `lazyLoad=true` |
| Path reference to context data | yes | `post=this`, `tag=primary_tag` |
| `@` variable reference | yes | `postFeedStyle=@custom.post_feed_style` |
| Sub-expression result | yes | `title=(concat "a" "b")` |
| **Array literal** | **no** | no `[...]` syntax in Handlebars |
| **Object literal** | **no** | no `{...}` syntax in Handlebars |

**The limits, precisely:**

1. **No literal arrays or objects.** Handlebars has no literal syntax for either. You can only *pass a reference* to an array/object that already exists in context — e.g. `{{> "list" items=posts}}` works, `{{> "list" items=["a","b"]}}` does not parse.
2. **Partials inherit the full parent context anyway.** "Partials will inherit context and make that context available within the partial file" (`docs.ghost.org/themes/helpers/utility/partials`). Hash params *add to* that context; they do not replace it. This is why `{{> "post-card"}}` inside `{{#foreach posts}}` needs no arguments — the post is already `this`.
3. **Passing a bare object switches the context.** `{{> "partial" someObject}}` (positional, no `=`) sets the partial's `this` to `someObject`. That is the only way to "pass an object", and it replaces rather than augments the context.
4. **No defaults.** An unpassed param is `undefined` → falsy → renders empty. Defaults must be written as `{{#if param}}...{{else}}...{{/if}}` inside the partial.
5. **Not type-checked.** `showTitle="false"` (a non-empty *string*) is **truthy**; `showTitle=false` (boolean) is falsy. Source consistently uses unquoted booleans. `{{#match}}` compares type as well as value — `{{#match feature_image 'true'}}` "Always returns false" (`docs.ghost.org/themes/helpers/functional/match`).

**Design consequence for a spec:** a partial's interface is effectively *scalars plus context inheritance*. To hand a partial structured data, either put it in the surrounding context and let inheritance carry it, fetch it inside the partial with `{{#get}}`, or pass it positionally as the partial's whole context. There is no way to express a structured literal at the call site.

---

## 13. Docs vs code conflicts

Four confirmed. In each case this document follows the code.

| # | Topic | Docs say | Code / shipping themes say | Follow |
|---|---|---|---|---|
| 1 | `@even` / `@odd` in `{{#foreach}}` | "`@even` — true if the `@index` is even" (`docs.ghost.org/themes/helpers/functional/foreach`) | `frame.even = index % 2 === 1` — parity of the **1-based `@number`**, so the first item is **odd** (`helpers/foreach.js`) | Code |
| 2 | Helpers in error templates | "Error templates shouldn't use any theme helpers, with the exception of `{{asset}}`… The only error template that is permitted to use helpers is `error-404.hbs`" (`docs.ghost.org/themes/contexts/error`) | `Casper/error.hbs` uses `{{meta_title}}`, `{{img_url}}`, `{{t}}`, `{{#if}}`, `{{#foreach}}`, `@site.*`; `Casper/error-404.hbs` extends `{{!< default}}` and runs `{{#get}}` | Code — the docs' rule is a robustness recommendation. See [§10](#10-errorhbs-error-404hbs-error-nxxhbs) |
| 3 | `@config` fields | "there is only one property which will be passed through: `@config.posts_per_page`" (`docs.ghost.org/themes/helpers/data/config`) | `update-global-template-options.js` also sets `image_sizes`; and `controllers/collection.js` overwrites `posts_per_page` per-route when `routes.yaml` sets `limit` | Code |
| 4 | Nested partials | Never mentioned; structure page shows only a flat `/partials/list-post.hbs` | `express-hbs/lib/hbs.js:162-179` registers recursively by relative path; Casper and Source both rely on it in every template | Code — see [§12h](#h-nested-partial-directories) |

Two further **documentation gaps** (docs silent rather than wrong):

- `@member.avatar_image` and `@member.status` exist in `update-local-template-options.js` but are absent from the `@member` attribute list in `docs.ghost.org/themes/members`.
- Roughly a dozen `@site` fields in the `public.js` allowlist are undocumented: `lang`, `members_signup_access`, `portal_default_plan`, `outbound_link_tagging`, `firstpromoter_account`, `default_email_address`, `support_email_address`, `editor_default_email_recipients`, `labs`, `site_uuid`, and the five `transistor_portal_*` keys.

---

## 14. What requires `{{#get}}`

`{{#get}}` makes a server-side Content API query before render (`docs.ghost.org/themes/helpers/functional/get`). Anything below is **not** in native context and needs it.

| Need | Native? | Query |
|---|---|---|
| Next page of the current feed | yes (`pagination`) | — |
| Featured posts as a separate block | no | `{{#get "posts" filter="featured:true"}}` |
| Related posts by primary tag | no | `{{#get "posts" filter="primary_tag:{{primary_tag.slug}}"}}` |
| More by this author | no | `{{#get "posts" filter="authors:{{primary_author.slug}}+id:-{{id}}"}}` |
| All tags / tag cloud | no | `{{#get "tags" limit="100" include="count.posts"}}` |
| All authors | no | `{{#get "authors"}}` |
| Membership tiers and prices | no | `{{#get "tiers" include="monthly_price,yearly_price,benefits"}}` |
| Newsletters for a signup form | no | `{{#get "newsletters"}}` |
| Post counts per tag/author | no | `include="count.posts"` |
| Posts on `page.hbs` (e.g. a landing page feed) | no | `{{#get "posts"}}` |
| Posts on `post.hbs` | no | `{{#get "posts"}}` |
| Any cross-context data | no | — |

**Resources:** `posts`, `tags`, `authors`, `tiers`, `newsletters`.

**Constraints:**
- Default `limit` 15; **max 100 in Ghost 6.x**. `ghost/core/core/shared/max-limit-cap.js` states it directly: *"Prior to Ghost 6.x we allowed any limit value, including 'all', but as sites grew in size it led to performance issues… After Ghost 6.x we only allow a max limit of 100."* Configurable via `optimization:maxLimit` / `optimization:allowLimitAll`. **This is the one genuine breaking 5.x→6.0 change in the theme layer** ([§17](#17-ghost-5x-vs-6x)) and GScan v6 now warns on both `limit="all"` and `limit>100`.
- "Read" queries (by `id`/`slug`) accept only `include`.
- Block params: `{{#get "posts" as |articles pages|}}` — second param is the pagination object.
- `{{else}}` on `{{#get}}` fires only on **error**, not on empty results — use `{{else}}` inside the inner `{{#foreach}}` for the empty case.
- Helpers do not execute inside `filter` strings; pass raw attributes (`{{published_at}}`, not `{{date}}`).
- **Timeout/abort:** a slow `{{#get}}` is aborted, yields an empty collection plus a visible `<span data-aborted-get-helper>Could not load content</span>`, sets `X-Ghost-Degraded-Render: aborted-get-helper`, and caps public caching at 60s (`helpers/get.js`, `services/rendering/renderer.js`). Templates must degrade gracefully.

---

## 15. Cross-template availability matrix

`Y` = available. `—` = not present (renders empty). `blk` = only inside the named block.

| Binding | default | index / home | post / page | tag | author | error | private |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `@site.*` | Y | Y | Y | Y | Y | Y | Y |
| `@custom.*` | Y | Y | Y | Y | Y | Y | Y |
| `@config.posts_per_page` | Y | Y | Y | Y | Y | Y | Y |
| `@member` | Y | Y | Y | Y | Y | Y | Y |
| `@labs` | Y | Y | Y | Y | Y | Y | Y |
| `@page.show_title_and_feature_image` | inherit | —* | **Y** | —* | —* | — | — |
| `posts` (native feed) | inherit | **Y** | — | **Y** | **Y** | — | — |
| `pagination` | inherit | **Y** | — | **Y** | **Y** | — | — |
| `post` (object) | inherit | — | **Y** | — | — | — | — |
| `page` (object) | inherit | — | Y (pages only) | — | — | — | — |
| `tag` (object) | inherit | — | — | **Y** | — | — | — |
| `author` (object) | inherit | — | — | — | **Y** | — | — |
| `{{title}}` | — | — | blk `{{#post}}` | — | — | — | — |
| `{{url}}` | — | blk `foreach` | blk `{{#post}}` | blk `{{#tag}}` | blk `{{#author}}` | — | — |
| `{{excerpt}}` | — | blk `foreach` | blk `{{#post}}` | blk `foreach` | blk `foreach` | — | — |
| `{{feature_image}}` | — | blk `foreach` | blk `{{#post}}` | blk `{{#tag}}` | — | — | — |
| `{{content}}` | — | blk `foreach` | blk `{{#post}}` | blk `foreach` | blk `foreach` | — | — |
| `{{meta_title}}` | Y | Y | Y | Y | Y | Y | Y |
| `{{pagination}}` | — | **Y** | **throws** | **Y** | **Y** | throws | throws |
| `{{navigation}}` | Y | Y | Y | Y | Y | Y | Y |
| `{{ghost_head}}` / `{{ghost_foot}}` | Y | Y | Y | Y | Y | Y | Y |
| `{{body_class}}` | Y | Y | Y | Y | Y | Y | Y |
| `{{post_class}}` | — | blk `foreach` | blk `{{#post}}` | blk `foreach` | blk `foreach` | — | — |
| `{{statusCode}}` / `{{message}}` / `{{errorDetails}}` | — | — | — | — | — | **Y** | — |
| `{{error.message}}` | — | — | — | — | — | — | **Y** |
| `{{input_password}}` | — | — | — | — | — | — | **Y** |
| `@index` / `@number` / `@first` / `@last` / `@even` / `@odd` | blk `foreach` | blk `foreach` | blk `foreach` | blk `foreach` | blk `foreach` | blk `foreach` | blk `foreach` |
| `{{#is "..."}}` | Y | Y | Y | Y | Y | *(no `error` ctx)* | Y (`private`) |

\* `@page` is injected only on entry renders (always) and on `routes.yaml` custom-routed pages (conditionally). On an ordinary feed, error page or private page it is **undefined and therefore falsy** — see [§3 `@page`](#page). Do not assume it defaults to `true` outside entry templates.

`custom-{name}.hbs` follows the `post`/`page` column. `post-{slug}.hbs` follows `post`. `page-{slug}.hbs` follows `page`. `tag-{slug}.hbs` follows `tag`. `author-{slug}.hbs` follows `author`. `error-404.hbs` and `error-{N}xx.hbs` follow `error`.

---

## 16. Members / subscribe templates

**There are no dedicated members or subscribe template files in Ghost 6.x.** No `account.hbs`, `signup.hbs`, `signin.hbs` or `subscribe.hbs` appears in the template hierarchy in `services/rendering/templates.js`, and neither Casper nor Source ships one.

Members UI is delivered three ways:

1. **Portal** — Ghost's embedded members app, driven by URLs (`#/portal/signup`, `#/portal/signin`, `#/portal/account`) or `data-portal` attributes. No template involved. `docs.ghost.org/themes/members`.
2. **Data attributes on your own markup** — `data-members-form`, `data-members-email`, `data-members-name`, `data-members-newsletter`, `data-members-label`, `data-members-error`, `data-members-signout`, `data-members-manage-billing`, `data-members-otc`. These work in any template.
3. **A `routes.yaml` custom route** pointing at an ordinary page or a `custom-*.hbs` template, then `{{#foreach @member.subscriptions}}` inside it.

The docs' worked account-page example cites `TryGhost/Lyra`'s `members/account.hbs` — **Lyra is a legacy Ghost 3.x-era theme** and that path reflects a members-templates convention Ghost no longer uses. Do not treat `members/account.hbs` as a supported Ghost 6 template location.

Two members-adjacent **overridable partials** do exist:

| Partial | Purpose | Ghost default |
|---|---|---|
| `partials/content-cta.hbs` | Replaces the upgrade CTA `{{content}}` renders when `access` is false | `helpers/tpl/content-cta.hbs` |
| `partials/pagination.hbs` | Replaces `{{pagination}}` output | `helpers/tpl/pagination.hbs` |
| `partials/navigation.hbs` | Replaces `{{navigation}}` output | `helpers/tpl/navigation.hbs` |

Ghost's `helpers/tpl/` also contains `cancel_link.hbs`, `gift-toast.hbs` and `recommendations.hbs`, which are registered as partials and therefore overridable by same-named theme partials — none of which is documented as an override point. Treat overriding them as unsupported.

---

## 17. Ghost 5.x vs 6.x

Verified by diffing `ghost/core/core/frontend/` between **v5.130.6** (latest 5.x) and **v6.0.0**, **v6.57.1** and HEAD (`v6.58.0-rc.0`), plus the GScan v5/v6 rule specs (`TryGhost/gscan` v6.4.2) and `docs.ghost.org/changes`.

### The headline: the 5→6 boundary is almost a no-op for themes

The `core/frontend` diff at v6.0.0 is **8 deletions (all AMP) and 13 modifications**. The helper directory is **49 files at both v5.130.6 and v6.0.0 — identical**. Everything else attributed to "Ghost 6" landed *during* the 6.x line as additive minor releases.

> **Specification rule:** never write "Ghost 6 has X" for the items below. Write "Ghost ≥ 6.N". A theme declaring `"engines": {"ghost": ">=5.0.0"}` — as both Casper 5.12.1 and Source 1.7.1 do — runs on both majors, which is why the official themes still carry that range.

### Actual breaking changes at 6.0 (only three)

| Change | Impact on themes | Source |
|---|---|---|
| **`{{#get}}` limit capped at 100; `limit="all"` no longer returns all** | **Breaking.** v6.0.0 replaced the v5 `getHelperLimitAllMax` check with `applyLimitCap()`. Overridable via `optimization:maxLimit` / `optimization:allowLimitAll`. | `ghost/core/core/shared/max-limit-cap.js` (new at v6.0.0); `helpers/get.js`; `docs.ghost.org/changes` — "Return max 100 results from APIs" |
| **AMP removed** | The `amp` context is no longer pushed; `meta.ampUrl` and the meta-layer `@site.amp` are gone. `apps/amp/` (7 files) and `meta/amp-url.js` deleted; `amp` branches stripped from `og-image.js`, `og-type.js`, `twitter-image.js`, `schema.js`, `context-object.js`, `canonical-url.js`, `url.js`. | `services/rendering/context.js` @ v6.0.0; `docs.ghost.org/changes` |
| **Extension-less theme-root files no longer served** | `web/middleware/static-theme.js` gained `if (!path.extname(req.path)) return next();`. Missing assets now correctly 404. A `fallthrough` allowlist covers `robots.txt`, `sitemap*.xml`, `sitemap.xsl`. | `web/middleware/static-theme.js` @ v6.0.0; `docs.ghost.org/changes` |

### Additive during 6.x — `@site` fields

**No `@site` field was ever removed.** In v5.130.6 the only social fields were `facebook` and `twitter`.

| Field(s) | Added in |
|---|---|
| `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin` | **v6.36.0** (absent v6.35.0) |
| `admin_url` | **v6.22.1** (absent v6.22.0) — *corrected by Story 4.6 (2026-09-14), which read the npm release between them; this row said v6.23.0, the next tag it was compared at* |
| `transistor_portal_enabled` / `_heading` / `_description` / `_button_text` / `_url_template` | **v6.19.0** (absent v6.18.0) |

Evidence: `ghost/core/core/shared/settings-cache/public.js` and `services/theme-engine/middleware/update-local-template-options.js` at the named tags.

*Story 4.6 (2026-09-14): measured from the 5.0.0 floor rather than across 5.130.6 → 6.x, several keys this file treats as always present are 5.x additions — `comments_enabled`/`comments_access` 5.3.0, `portal_signup_*` 5.42.0, `recommendations_enabled` 5.61.0, `allow_self_signup` 5.62.0, `donations_enabled` 5.120.2. The gates live in `packages/library/contexts/matrix.json`; the source readings are `packages/library/contexts/fixtures/ghost-source.json` and MEASUREMENTS §41.*

### Additive during 6.x — helpers

**Five added, none ever removed.**

| Helper | Added in |
|---|---|
| `{{split}}` | **v6.5.0** |
| `{{json}}`, `{{color_to_rgba}}`, `{{contrast_text_color}}` | **v6.23.0** |
| `{{#social_accounts}}` | **v6.38.0** |

`{{#social_accounts}}` is a **block** helper requiring an explicit positional source — `{{#social_accounts @site}}` — and throws `IncorrectUsageError` without one. It yields `{type, href, username, name}` per iteration plus the standard loop `@` vars. Note the key split: the theme-facing `type` is `x`, while the underlying settings field is `twitter` (`helpers/social_accounts.js`). Docs: `docs.ghost.org/themes/helpers/data/social_accounts`.

**Behaviour changes during 6.x:**

- `{{twitter_url}}` and `{{facebook_url}}` are marked `@deprecated` in JSDoc and now raise GScan warnings. Still functional. Replacement: `{{social_url type="twitter"}}` / `{{social_url type="facebook"}}`.
- `{{comments}}` — `locale` is now always passed to the comments app; in v5 it was gated behind the `i18n` labs flag.
- `{{t}}` — a new i18next-backed path exists behind the `themeTranslation` labs flag; legacy `themeI18n` remains the default.
- `{{ghost_foot}}` — now injects a gift-link toast when `res.locals._giftLink` is set, overridable by a theme-supplied `partials/gift-toast.hbs`. New overridable surface with no v5 equivalent, and **undocumented** (absent from `llms-full.txt`).
- `{{content}}` — `downsize` → `downsize-cjs`. Packaging only.

### Verified STABLE across 5.x → 6.x

These were checked and found unchanged — useful because they are the load-bearing facts in this document:

- **Template resolution.** `services/rendering/templates.js` differs only by a refactor (`_private` → `templates`). `getErrorTemplateHierarchy`, `getEntriesTemplateHierarchy`, `getEntryTemplateHierarchy` and `pickTemplate` are logically identical. All slug/custom/error hierarchies in [§2](#2-template-resolution-order-normative) hold on both majors.
- **`@member` shape** — `uuid, email, name, firstname, avatar_image, subscriptions, paid, status`. Byte-identical v5.130.6 → HEAD. (Confirms `avatar_image`/`status` are long-standing, not new.)
- **`@page`** — `format-response.js` does not appear in the v5.130.6 → HEAD diff. Shape and injection rules stable.
- **`@custom`, `@config`, `@labs`** — sources in `update-global-template-options.js` unchanged.
- **`@site.signup_url`, `@site.comments_enabled`, `@site.comments_access`, `@site.recommendations_enabled`** — all present and byte-identical in v5. These are **v5 features, not v6 additions.**
- **`{{social_url}}`** — source byte-identical. Its wider platform coverage in 6.x is purely a consequence of `@site` gaining the fields at v6.36.0; the helper never changed.
- **Unchanged helpers** — `body_class`, `comment_count`, `content_api_key`, `content_api_url`, `encode`, `foreach`, `img_url`, `is`, `link_class`, `navigation`, `pagination`, `plural`, `post_class`, `raw`, `readable_url`, `recommendations`, `search`, `social_url`, `tiers`, `title`, `total_members`, `total_paid_members`. **`foreach`, `is`, `title` and `pagination` being unchanged means the `@even`/`@odd` conflict, the context list, the empty-`{{title}}` rule and the pagination throw all apply identically to 5.x.**
- **`{{match}}`, `{{link}}`, `{{has}}`** — comment/refactor diffs only.

### GScan rules (theme validation)

`gscan/lib/specs/v6.js` inherits `v5.js` by merge/union. The rule-ID sets are **disjoint: v5 has 75 rules, v6 adds 7 and overrides none.** So **no v5 rule changed level or fatality in v6** — v6 is purely additive. Fatal-rule count goes 22 → 24.

| New v6 rule | Level |
|---|---|
| `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` — `{{#if}}`/`{{#unless}}` take exactly one argument; use `{{#match}}` to compare | **error, fatal** |
| `GS130-NO-RECURSIVE-LAYOUT` — a template must not inherit a layout from itself, directly or transitively | **error, fatal** |
| `GS090-NO-LIMIT-ALL-IN-GET-HELPER` | warning |
| `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER` | warning |
| `GS001-DEPR-TWITTER-URL` | warning |
| `GS001-DEPR-FACEBOOK-URL` | warning |
| `GS001-DEPR-AMP-TEMPLATE` — matches `<html amp>` / `<html ⚡>` | warning |

The two new **fatal** rules are the ones that matter for a build pipeline: multi-argument `{{#if}}` and recursive layout inheritance now fail a theme outright.

`knownHelpers` gains 7 entries in v6: `split`, `json`, `color_to_rgba`, `contrast_text_color`, `raw`, `search`, `social_accounts`. Note `raw` and `search` **exist in Ghost 5 core** but were absent from GScan's v1–v5 `knownHelpers` chain — so they only validate cleanly under the v6 ruleset.

`gscan/lib/utils/versions.json` sets both `default` and `canary` to `v6`. `gscan/lib/utils/labs-enabled-helpers.js` is currently **empty** — no helper is labs-gated in the v6 ruleset.

GScan also deliberately rejects the **inline** dynamic-partial form `{{> (concat "icons/" type)}}`; only the block form is accepted — consistent with [§12h](#h-nested-partial-directories).

### One cross-check worth noting

GScan's internal scope rule (`gscan/lib/ast-linter/rules/internal/scope.js`) allowlists these `@` globals, not version-gated: `site`, `member`, `setting`, `config`, `labs`, `custom`, `page`. `@setting` appears in that allowlist but is **not** installed by any middleware traced in [§3](#3-the-global--variables) and is not documented. Treat `@setting` as a GScan-linter artifact, not an available binding.

---

## 18. Contested or unverified

Everything below is either unconfirmed or deliberately out of scope. Nothing in §§1-16 depends on it.

**Could not verify (7 items):**

1. **Whether `@labs` is a supported public API.** It is set in `update-global-template-options.js` and used in one docs example for `{{#has}}`, but has no reference page. Assume unstable.

2. **Exact `{{#get}}` timeout threshold.** `helpers/get.js` reads `config.get('optimization:getHelper:timeout:level')` and a threshold value; the default numeric threshold lives in a config defaults file outside the sparse checkout. The abort *behaviour* is confirmed; the default duration is not.

3. **`error.hbs` behaviour on the very first request after boot, if that request errors before theme middleware.** The merge mechanism is confirmed (see [§12a](#a-is-site-available-in-every-template)) and `_options.templateOptions` persists between requests, so this reduces to a cold-start-only window. Not reproduced or timed. The §10 caution against structural dependence on globals in `error.hbs` stands as defensive practice rather than a demonstrated failure.

4. **`{{#get}}` deduplication (`_queryCache`) and degraded-render semantics.** `update-local-template-options.js` installs a `Map` when the `getHelperDeduplication` labs flag is set; `generateCacheKey`, `querySimplePath`, `res.locals.degradedRender` and the `X-Ghost-Degraded-Render` header all exist at HEAD. Which released 6.x version shipped it, and whether it is documented, was not determined. Affects performance and failure presentation, not data availability.

5. **Exact 6.x version introducing the `{{ghost_foot}}` gift-link toast.** Confirmed present at v6.50.0, v6.55.0 and v6.57.1; not bisected below v6.50.0. Whether the `partials/gift-toast.hbs` override is publicly documented is also unconfirmed — it does not appear in `llms-full.txt`.

6. **Whether `@site.transistor_portal_*` is genuinely theme-facing.** Confirmed in `public.js` from v6.19.0, so it does reach `@site`, but there is no mention anywhere in the docs corpus. Treat as undocumented and unstable.

7. **Nothing was executed at runtime.** Every claim in this document derives from source, shipping theme code, GScan rule source, or docs text. No Ghost 5 or Ghost 6 instance was booted to observe actual rendering. The highest-value follow-up would be a scratch Ghost install to empirically confirm the four docs/code conflicts in [§13](#13-docs-vs-code-conflicts) — particularly the `@even`/`@odd` parity — and the "`{{title}}` renders empty on `index.hbs`" rule in [§12e](#e-title-vs-sitetitle-on-indexhbs).

**Deliberately out of scope:** `routes.yaml` dynamic routing beyond how it selects templates and overrides `@config.posts_per_page`; the `{{#collection}}` helper (present in `helpers/collection.js`, undocumented on the theme docs site); RSS/AMP/email-post/preview/unsubscribe render paths; GScan's full rule set; i18n/`{{t}}` and the `locales/` directory.

**Known-stable, verified:** template resolution order, context derivation, the `@site` allowlist and its fresh-install defaults, `@member` shape and null-ness, `@page`'s single field, missing-variable semantics, SafeString/escaping, nested partials, and partial hash-param limits. Each is cited to a specific file and, where possible, corroborated by both official themes.

---

## ⚠️ Corrected by execution — 2026-08-20 (Round 2, VERIFY-AT-BUILD 14b)

This companion and its counterpart disagreed on whether the tiers endpoint filters by `visibility`.
**Both were half right**, and the disagreement is now closed by running it against Ghost **5.130.6**
and **6.58.0**, with identical results on each.

With one paid tier set to `visibility: none` alongside the public Free tier:

| query | `tiers.length` | rows `{{#foreach}}` yields |
| --- | --- | --- |
| `{{#get "tiers" limit="all"}}` — no filter | **2** | **1** (the public tier only) |
| `filter="visibility:public"` | 1 | 1 |
| `filter="visibility:none"` | 1 | **0** |
| `filter="type:paid"` | 1 | **0** |

**The mechanism:** the visibility filter is applied to the **serialized rows**, after the count is
taken. `tiers.length` is the pagination total and does not respect it. A companion that inspected the
rows concluded "it filters"; one that inspected the count concluded "it does not". Neither
generalisation holds, and neither reading is safe to carry forward on its own.

**Consequences.** FR-H6's explicit `visibility:public` filter is safe — count and rows agree under it.
The live hazard is emptiness-testing: `{{#if tiers.length}}` on an *unfiltered* get renders a pricing
section with a heading and no cards on any site whose only paid tier is hidden. That is now a library
authoring rule in `sections-inventory.md`.

**Note on `limit="all"`,** used in the probe above: `GS090-NO-LIMIT-ALL-IN-GET-HELPER` is a **v6-spec
warning** (absent from the v5 spec in both gscan majors), as is `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`.
Emitted themes must not use it.
