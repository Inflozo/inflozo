---
title: Ghost Membership Pages
status: normative-companion
role: normative companion to prd.md — the source of truth for A30's compileTarget and for every membership surface Inflozo emits. Settles the members-template question left open in sections-inventory.md §A30.
created: 2026-08-18
updated: 2026-08-18
source: Ghost core v6.58.0-rc.0, Portal (apps/portal) at the same ref, GScan 6.4.2, Ghost Admin (apps/ember-admin), Casper 5.12.1, Source 1.7.1, docs.ghost.org full corpus
---

# Ghost Membership Pages — Normative Reference

**Status:** Research appendix. Every claim carries a source: a docs URL, a Ghost core source path, or a file in a real theme.

**Verified against:**

| Source | Version / ref |
|---|---|
| Ghost core | `v6.58.0-rc.0` — `TryGhost/Ghost` @ `b6ca85fd74e62d79c562b81064cb33289452fa62` |
| Portal | `apps/portal` in the same monorepo, same ref |
| Ghost Admin (editor UI) | `apps/ember-admin` in the same monorepo, same ref |
| GScan | `TryGhost/gscan` v6.4.2 |
| Casper | 5.12.1 (`TryGhost/Casper`, `main`) |
| Source | 1.7.1 (`TryGhost/Source`, `main`) |
| Live install cross-check | Ghost 6.44.0 at `/home/ghost/Dev/travio/versions/6.44.0` (used where the sparse checkout omitted a module) |
| Docs | `https://docs.ghost.org/llms-full.txt`, 712 KB, pulled verbatim 2026-08-18 |

**Method note.** Where the published docs and the shipping code disagree, this document states the disagreement and **follows the code**. Five such disagreements were found; they are flagged inline as **DOCS/CODE CONFLICT** and collected in [§11](#11-contested-or-unverified).

**Relationship to the other companions.** This file extends `research-ghost-binding-contexts.md` §16 and Appendix B.1 §3/§7, which already established that no members template family exists. It does not contradict either on that point. It **does** contradict `research-ghost-binding-contexts.md` on one secondary claim (tier visibility filtering) — see [§11.1](#111-contradiction-with-research-ghost-binding-contextsmd-tier-visibility).

---

## 0. RECOMMENDATION

### The mechanism

**Target `custom-{name}.hbs`, selected from the Template dropdown in Ghost's page editor — mechanism (ii).**

Concretely, Inflozo emits `custom-membership.hbs` (and siblings) at the theme root, and instructs the user to create an ordinary Ghost Page and pick **"Membership"** from the editor's Template dropdown.

### The single strongest reason

**It is the only mechanism that survives a rename.**

A page's slug is user-editable and changes whenever the user retitles the page in the editor. `page-{slug}.hbs` is matched against that live slug at render time, so renaming "Membership" to "Join" silently stops the template applying — the page falls back to `page.hbs`, then `post.hbs`, and the user's designed page evaporates with no error anywhere. Ghost compiles templates non-strictly ([Appendix B.1 §0](appendix-b1-template-contexts.md)), so nothing in the chain warns.

`custom_template` is by contrast a **stored string column on the post row** (`ghost/core/core/server/data/schema/schema.js:96` — `custom_template: {type: 'string', maxlength: 100, nullable: true}`). It is set once by an explicit user choice and is never derived from, or invalidated by, the slug. Renaming the page, changing its slug, moving it in navigation — none of it touches the binding. Grepping the whole server tree, `custom_template` appears in exactly one non-test location outside the render path: the schema definition. Ghost never clears it, never revalidates it against the active theme.

This matters more than it sounds. A30 is 15 designs that a user will place, publish, then rename six weeks later when the marketing copy changes. Mechanism (i) breaks at exactly that moment, invisibly, on a live site.

### Comparison on the five stated criteria

| | (i) `page-{slug}.hbs` | **(ii) `custom-{name}.hbs` + dropdown** | (iii) routes.yaml → template | (iv) — see below |
|---|---|---|---|---|
| **routes.yaml required?** | No | **No** | **Yes** — and it lives outside the theme | — |
| **Survives page rename / slug change?** | **No — silently stops applying** | **Yes — stored on the post row** | Route URL survives; a `data: page.{slug}` binding does **not** | — |
| **Appears in the editor UI?** | Appears in the dropdown list, but selecting anything is **disabled** when the slug matches | **Yes — this is the mechanism the dropdown exists for** | No — invisible to the editor entirely | — |
| **Label** | n/a (slug-derived, not chosen) | **Filename-derived, title-cased**: `custom-membership.hbs` → "Membership" | n/a | — |
| **Must the theme declare anything in `package.json`?** | No | **No** | No | — |
| **If the theme is replaced** | Template vanishes; page falls back to `page.hbs`→`post.hbs`. Graceful. | Dangling `custom_template` string is **ignored**; falls back to `page.hbs`→`post.hbs`. Graceful, **and re-binds automatically if a theme with the same filename returns**. | routes.yaml persists in `content/settings/`, still points at a template that no longer exists → **the URL throws `IncorrectUsageError` (500)** | — |

Sources for each cell are in [§1](#1-template-resolution-order), [§2](#2-how-custom-namehbs-is-surfaced-and-labelled) and [§11.4](#114-what-a-broken-routesyaml-data-binding-does).

### Why not the others

**(i) `page-{slug}.hbs` — rejected on robustness.** Beyond the rename problem, it has a second failure mode that is worse: it wins *over* an explicit user choice. `getEntryTemplateHierarchy` unshifts the slug template **last**, so it lands at the head of the list, ahead of `custom_template` (`templates.js:85-101`). If a theme shipped both `page-membership.hbs` and `custom-membership.hbs` and the user's page slug were `membership`, the slug template would render even though the user picked something else in the dropdown. Ghost Admin knows this and **disables the dropdown** in that case, showing "Post URL matches page-membership" (`apps/ember-admin/app/components/gh-psm-template-select.hbs`). So mechanism (i) actively takes control away from the user. Inflozo must not emit `page-*.hbs` for membership at all.

**(iii) routes.yaml → template — rejected on cost and blast radius.** It requires writing `content/settings/routes.yaml`, which is site-global configuration living **outside the theme** (`docs.ghost.org/themes/routing` — "All of Ghost's routing configuration is defined in `content/settings/routes.yaml`"). That means: Inflozo must own a file it does not otherwise own, a file the user may also be editing, a file that outlives the theme. When the user switches themes the route remains and 500s. And a route with no `data:` has **no Ghost page behind it at all** — the user cannot edit the heading, cannot change the title, cannot even see the page exists in Ghost Admin. Adding `data: page.{slug}` to fix that reintroduces the exact slug fragility of mechanism (i), on top of the routes.yaml cost. It is strictly worse than (ii) on every axis.

It remains the right mechanism for A31's `/coming-soon/`-style routed utility pages, where "no Ghost page behind it" is the *point*. It is the wrong mechanism for a page the user is meant to edit.

**(iv) Things we had not considered — checked and rejected as the primary target:**

- **A plain Ghost Page with no special template at all.** Every membership affordance — `data-portal`, `data-members-form`, `@member`, `{{#get "tiers"}}` — works in `page.hbs`, i.e. on any page. A user could build a membership page today with Ghost's editor cards and Portal buttons and no theme work whatsoever. This is genuinely the lowest-cost path and is what most sites do. It is not a *design* surface though: it gives the user the theme's generic page frame, not a designed layout. Inflozo's value is the designed frame, so (ii) it is. **But this is why the recommendation costs the user a step, not a capability** — see "What it costs" below.
- **`post-{slug}.hbs` / a post rather than a page.** Same slug fragility, plus the page appears in the post feed and RSS. No.
- **Overriding `partials/content-cta.hbs`.** Real and supported (`docs.ghost.org/themes/members` — "The default CTA can be overridden by providing a `./partials/content-cta.hbs` template file in your theme"), already A32's target, and orthogonal to A30.
- **Portal customisation from the theme.** Not available. Portal's markup, copy and styling come from `apps/portal`; a theme can influence only the accent colour and the `portal_*` settings, all of which are set in Ghost Admin, not in the theme. See [§5](#5-native-member-facing-urls).
- **The `signup` Lexical card.** Ghost's editor ships a signup card (`data-lexical-signup-form`, `apps/portal/src/app.jsx:301-307`). It is editor content, not a theme surface, and Inflozo cannot emit it.

### What it costs

1. **A manual step the user must take, once per page.** Inflozo cannot create the Ghost Page or select the template for it — both are Admin actions on the connected site. The product must ship an explicit instruction ("Create a page, then choose *Membership* under Template") and should verify it. This is the single biggest cost of the recommendation and it is unavoidable: **no mechanism lets a theme both design a page and bring that page into existence.**
2. **The dropdown does not exist until the theme ships at least one `custom-*.hbs`.** `gh-psm-template-select.hbs` renders the whole form group inside `{{#if this.customTemplates}}`. Neither Casper nor Source ships a single custom template, so on a stock Ghost the Template dropdown **is not in the editor at all**. Users will not have seen it before. Screenshot it in the instructions.
3. **Naming is load-bearing and one-way.** The dropdown label is derived from the filename by a fixed transform ([§2](#2-how-custom-namehbs-is-surfaced-and-labelled)). "Membership" requires `custom-membership.hbs`. There is no override.
4. **Renaming the emitted template file breaks existing pages.** The inverse of the strength: `custom_template` stores the *filename*. If Inflozo ever renames `custom-membership.hbs` to `custom-join.hbs` in a later version, every page pointing at the old name silently falls back. Template filenames are a **public API of the generated theme** and must be treated as frozen once shipped.
5. **`{{#get "tiers"}}` will return a paid tier on sites that cannot take payment.** Ghost seeds a `$5/mo` "Default Product" tier at install ([§6](#6-rendering-tiers-and-prices)). A membership page must gate its paid CTAs on `@site.paid_members_enabled`, not on the presence of tiers.

### What this means for A30's 15 variants

`compileTarget` for A30 resolves to **`custom-{name}.hbs` (entry)** — which per Appendix B.1 §3 follows the `page` row exactly: wrapper root, open `{{#post}}`, honour `@page.show_title_and_feature_image`.

But the 15 variants do **not** all survive. Per [§10](#10-the-account-page-question):

| Variants | Surface | Verdict |
|---|---|---|
| #1, #3–#8, #13, #14 (9) | Signup / membership marketing | **Fully designable.** Re-point to `custom-{name}.hbs`. This is the category's real centre of gravity. |
| #2, #9, #10 (3) | Signin | **Designable with a caveat.** `data-members-form="signin"` renders a real, themed signin form on any page. The one-time-code entry step is a Portal modal Inflozo cannot design. |
| #11, #12 (2) | Account | **Partially designable, and inadvisable.** See [§10](#10-the-account-page-question). Recommend cutting or re-scoping to an account *landing* page that defers to Portal. |
| #15 (1) | "Magic-Link Sent" confirmation | **Not a page.** This is the `.success` class state of a `data-members-form`, not a URL Ghost can route to. Re-scope as a form state inside the signup/signin variants, or cut. |

Three of the four owner-facing labels in the PRD ("design your signup page", "design your signin page", "design your account page") are deliverable at 9/15, 3/15 and 0/15 fidelity respectively. **"Design your account page" cannot be delivered as written.** Say so in the product copy.

---

## 1. Template resolution order

**Source:** `ghost/core/core/frontend/services/rendering/templates.js`, verbatim at v6.58.0-rc.0.

### Pages

`getEntryTemplateHierarchy(postObject, context)` (`templates.js:85-101`):

```js
const templateList = ['post'];
let slugTemplate = 'post-' + postObject.slug;

if (context === 'page') {
    templateList.unshift('page');
    slugTemplate = 'page-' + postObject.slug;
}

if (postObject.custom_template) {
    templateList.unshift(postObject.custom_template);
}

templateList.unshift(slugTemplate);
```

Net order for a page, first existing file wins:

```
page-{slug}.hbs  →  {custom_template}.hbs  →  page.hbs  →  post.hbs
```

### Posts

```
post-{slug}.hbs  →  {custom_template}.hbs  →  post.hbs
```

`post.hbs` is required by the theme spec, so the chain always terminates (`docs.ghost.org/themes/structure` — "Two template files are required: `index.hbs` and `post.hbs`").

### Selection

`pickTemplate` (`templates.js:112-142`) walks the list and returns the first for which `themeEngine.getActive().hasTemplate(templateName)` is true. `hasTemplate` is a flat `indexOf` against every `.hbs` in the theme except partials and assets (`theme-engine/active.js:87-89`, list built by gscan's `extractTemplates`, `gscan/lib/read-theme.js:214-236`).

### Does `page-{slug}.hbs` still resolve in Ghost 6?

**Yes.** It is the first entry in the hierarchy and is unchanged from Ghost 5. Confirmed both in code above and in docs: `docs.ghost.org/themes/contexts/page` — "Custom templates for specific pages are determined using `page-:slug.hbs`, with the `:slug` matching the static page's slug… Ghost looks for a template which matches the slug (`page-:slug.hbs`) first, then looks for `page.hbs` and finally uses `post.hbs`."

**It sits ahead of the explicitly chosen custom template.** This is the decisive ordering fact and the reason Inflozo must not emit `page-*.hbs`: a slug template overrides a deliberate user choice.

### Other request kinds (for completeness)

| Request | Order |
|---|---|
| Home `/` | `home.hbs` → `index.hbs` |
| Post list `/page/N/` | `index.hbs` |
| Tag archive | `tag-{slug}.hbs` → `tag.hbs` → `index.hbs` |
| Author archive | `author-{slug}.hbs` → `author.hbs` → `index.hbs` |
| Error | `error-{code}.hbs` → `error-{N}xx.hbs` → `error.hbs` → Ghost's built-in |
| routes.yaml custom route | the route's `template:` list in order, else **throw** |

Sources: `templates.getEntriesTemplateHierarchy` (`templates.js:48-72`), `templates.getErrorTemplateHierarchy` (`templates.js:23-34`), `templates.setTemplate` (`templates.js:174-198`). The routes.yaml throw is `static-routes-router.js:109-113`.

This section is consistent with `research-ghost-binding-contexts.md` §2; nothing here contradicts it.

---

## 2. How `custom-{name}.hbs` is surfaced and labelled

**Short answer: the label is derived from the filename, by a fixed transform, in GScan. Not from `package.json`, and not overridable.**

### The pipeline, end to end

**Step 1 — GScan extracts the custom-template list at theme validation time.**
`gscan/lib/read-theme.js:168-212`, `extractCustomTemplates()`:

```js
const generateName = function generateName(templateName) {
    let name = templateName;
    name = name.replace(/^(post-|page-|custom-)/, '');
    name = name.replace(/-/g, ' ');
    name = name.replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
    });
    return name.trim();
};
...
_.each(allTemplates, function (templateName) {
    if (templateName.match(/^(post-|page-|custom-)/) && !templateName.match(/\//)) {
        toReturn.push({
            filename: templateName,
            name: generateName(templateName),
            for: generateFor(templateName),
            slug: generateSlug(templateName)
        });
    }
});
```

`generateSlug` returns **`null` for `custom-*`** and the captured slug for `page-*` / `post-*`. `generateFor` returns `['page','post']` for `custom-*`, `['page']` for `page-*`, `['post']` for `post-*`.

**Step 2 — Ghost stores that list on the active theme.**
`ghost/core/core/frontend/services/theme-engine/active.js:49-50` — `// all custom .hbs templates (e.g. custom-about)` / `this._customTemplates = checkedTheme.templates.custom;`

**Step 3 — the Admin API serves it.**
`ghost/core/core/server/services/themes/to-json.js:44`:
```js
_.find(themeResult, {active: true}).templates = bridge.getActiveTheme().customTemplates;
```

**Step 4 — Ghost Admin splits the list on `slug`.**
`apps/ember-admin/app/models/theme.js`:
```js
customTemplates: computed('templates.[]', function () {
    return (this.templates || []).filter(t => isBlank(t.slug));
}),
slugTemplates: computed('templates.[]', function () {
    return (this.templates || []).filter(t => !isBlank(t.slug));
}),
```
Because `generateSlug` nulls the slug only for `custom-*`, **`customTemplates` is exactly the `custom-*.hbs` set** and `slugTemplates` is exactly the `page-*` / `post-*` set.

**Step 5 — the dropdown renders.**
`apps/ember-admin/app/components/gh-psm-template-select.hbs`:
```hbs
{{#if this.customTemplates}}
    <div class="form-group for-select" data-test-custom-template-form>
        <label for="author-list">Template</label>
        <span class="gh-select {{if this.matchedSlugTemplate "disabled"}}">
            <OneWaySelect @value={{this.selectedTemplate}}
                @options={{this.customTemplates}}
                @optionValuePath="filename"
                @optionLabelPath="name"
                ...
                @disabled={{this.matchedSlugTemplate}} />
        </span>
        {{#if this.matchedSlugTemplate}}
            <p>Post URL matches {{this.matchedSlugTemplate.filename}}</p>
        {{/if}}
    </div>
{{/if}}
```

`@optionLabelPath="name"` — the label is GScan's `name`. `@optionValuePath="filename"` — the stored value is the bare filename without `.hbs`. A "Default" option with `filename: ''` is prepended in `gh-psm-template-select.js:26-34`.

### Consequences that bind Inflozo

| Fact | Consequence |
|---|---|
| Label = filename, title-cased, hyphens → spaces | `custom-membership.hbs` → **"Membership"**. `custom-join-us.hbs` → **"Join Us"**. There is no other way to set the label. |
| The regex is `!templateName.match(/\//)` | **A custom template in a subdirectory is invisible.** `custom/membership.hbs` and `partials/custom-x.hbs` never reach the dropdown. Custom templates must sit at the **theme root**. |
| Extraction happens in GScan at validation/activation | Adding a template requires a theme re-upload (or `ghost restart` on a local install) before it appears. |
| `for: ['page','post']` for `custom-*` | Ghost Admin does **not** currently filter the dropdown by `for` — `customTemplates` is unfiltered in `gh-psm-template-select.js`. A `custom-membership.hbs` is therefore offered on **posts as well as pages**. Inflozo cannot restrict it to pages. |
| The whole block is inside `{{#if this.customTemplates}}` | **A theme with no `custom-*.hbs` has no Template dropdown at all.** Verified: Casper 5.12.1 and Source 1.7.1 ship zero custom templates (`ls Casper/*.hbs` → `author, default, error-404, error, index, page, post, tag`; `ls Source/*.hbs` → `author, default, home, index, page, post, tag`). |
| `@disabled={{this.matchedSlugTemplate}}` | If the theme also ships `page-{that-page's-slug}.hbs`, the dropdown is **disabled** and reads "Post URL matches page-{slug}". |
| Stored in `posts.custom_template`, `maxlength: 100` | `ghost/core/core/server/data/schema/schema.js:96`. Filename must be ≤ 100 chars. |

### Naming constraints, consolidated

- Must begin `custom-` to be a *custom* template (rather than a slug template).
- Must be at the theme root, no `/` in the path.
- Everything after `custom-` becomes the label via `-`→space + title-case. Use lowercase-hyphenated names; anything else produces an odd label (`custom-FAQ.hbs` → "FAQ" survives because `\b\w` only uppercases, but `custom-membership_page.hbs` → "Membership_page").
- ≤ 100 characters including the `custom-` prefix.
- GScan has **no** check that validates or restricts custom-template names beyond the above (`grep -rn "custom-" gscan/lib/checks/` returns only unrelated custom-*settings* checks).

### `package.json`: nothing to declare

**The theme declares nothing in `package.json` for any of the four mechanisms.** Ghost's theme config loader accepts exactly three keys:

`ghost/core/core/frontend/services/theme-engine/config/index.js`:
```js
const allowedKeys = ['posts_per_page', 'image_sizes', 'card_assets'];
```

(`config.custom` is handled separately, by GScan, for custom *theme settings* — unrelated to templates.) There is no `templates`, `custom_templates` or label key anywhere in the schema. `docs.ghost.org/themes/structure` lists the optional `package.json` properties and template declaration is not among them.

---

## 3. The render context on each candidate

**The wrapper rule applies to all three page-backed candidates. It does not apply to a routes.yaml route with no `data:`.**

**Source:** `ghost/core/core/frontend/services/rendering/format-response.js`.

### (i) `page-{slug}.hbs` and (ii) `custom-{name}.hbs` selected on a page — identical

Both are `routerOptions.type === 'entry'` renders (`templates.js:174-198`) and go through `formatResponse()`:

```js
let entry = {
    post: post
};

if (context?.includes('page') || (context?.includes('preview') && post.type === 'page')) {
    entry.page = post;
    ...
}
```

**Top level:** the keys `post` and `page`, both pointing at the **same object**. Plus the universal set (`@site.*`, `@custom.*`, `@config.*`, `@member`, `{{navigation}}`, `{{body_class}}`, `{{ghost_head}}`, `{{ghost_foot}}`, `{{asset}}`, `{{#is}}`, `{{t}}`, `{{meta_title}}`) per Appendix B.1 §2. Plus `@page.show_title_and_feature_image`, injected by the same function into local template options.

**Bare resource fields at the top level render EMPTY.** `{{title}}` outside a block is a registered helper returning `this.title || ''` and the root is the wrapper, not the post. This is Appendix B.1 §3a and it holds here unchanged.

**Inside `{{#post}}`** (or `{{#page}}` — see below): the full post scope — `title`, `slug`, `url`, `excerpt`, `custom_excerpt`, `content`, `feature_image`, `feature_image_alt`, `feature_image_caption`, `featured`, `page`, `visibility`, `access`, `published_at`, `updated_at`, `created_at`, `primary_author`, `primary_tag`, `tags`, `authors`, `meta_title`, `meta_description`, plus `{{post_class}}`, `{{content}}`, `{{date}}`, `{{img_url}}`, `{{reading_time}}`. Source: `docs.ghost.org/themes/contexts/page`.

**`{{#post}}` vs `{{#page}}` on a page.** Both work — `entry.page = post` puts the same object under both keys, and neither is a registered helper (there is no `page.js` or `post.js` in `ghost/core/core/frontend/helpers/`; both are plain Handlebars block-with-context). **Use `{{#post}}`**: it is what the docs prescribe ("When outputting a static page, you can use the same `{{#post}}{{/post}}` block expression" — `docs.ghost.org/themes/helpers/data/post`) and what both official themes do (`Casper/page.hbs:7`, `Source/page.hbs:4`). This is consistent with Appendix B.1 §3, which is correct but understates the case: `{{#page}}` is not broken, merely non-idiomatic.

**No `posts`, no `pagination`.** `{{pagination}}` **throws** here (Appendix B.1 §0). Any post list on a membership page must come from `{{#get}}`.

**`@page` is always set on an entry render**, defaulting to `{show_title_and_feature_image: true}` and overridden by the page's own toggle (`format-response.js:77-107`).

### (iii) routes.yaml → template

`routerOptions.type === 'custom'` → `controllers.static` → `formatPageResponse(response, /* pageAsPost */ true, locals)` (`routing/controllers/static.js:68-70`).

**Root is flat.** Each declared `data:` key is unwrapped to a top-level object under its own name (`format-response.js:44-57` (the `_.each(result.data, …)` unwrap)).

**With `data: page.membership`, the root gets BOTH `page` and `post`:**
```js
if (pageAsPost && response.page) {
    response.post = response.page;
}
```
So a routed template with a page data binding is, in practice, context-compatible with an entry template — `{{#post}}` works. `@page.show_title_and_feature_image` is also populated, because `formatPageResponse` checks `isPage(result.data?.page?.[0])` (`format-response.js:26-41`).

**With no `data:` at all, the root is empty** apart from the universal set. `posts`/`pagination` appear only if the route declares a collection or channel.

This refines Appendix B.1 §3's `custom-{name}` **(route)** row, which says "declared data keys only" — accurate, but it omits the `pageAsPost` duplication. Not a contradiction; an addition.

### GScan's page-builder rule applies theme-wide, not per file

`GS110-NO-MISSING-PAGE-BUILDER-USAGE` (**warning** level, `gscan/lib/specs/v5.js:728-732`, inherited by v6) requires `@page.show_title_and_feature_image` to be referenced. Critically, the check accumulates across **all** non-partial `.hbs` files and only fails if the property is used nowhere (`gscan/lib/checks/110-page-builder-usage.js:25-60`). So a `custom-membership.hbs` need not itself honour the toggle as long as `page.hbs` does — but since FR-J6 gates on 0 warnings, Inflozo's emitted `page.hbs` must reference it regardless.

---

## 4. How a theme launches Portal

### Two equivalent syntaxes, one parser

| Form | Mechanism |
|---|---|
| `<a href="#/portal/signup">` | Hash change; parsed in `fetchLinkData` via `linkRegex = /^\/portal\/?(?:\/(\w+(?:\/\w+)*))?\/?$/` (`apps/portal/src/app.jsx:661`) |
| `<a data-portal="signup">` / `<button data-portal="signup">` | Click listener attached at init to `document.querySelectorAll('[data-portal]')` (`app.jsx:221-229`); reads `target.dataset.portal` (`app.jsx:186`) |

Both feed the **same** function, `getPageFromLinkPath(path)` (`app.jsx:1044-1175`), so the value set is identical. `data-portal` needs no `href`; Casper and Source both use it with and without one.

**Styling hooks:** every `[data-portal]` element gets `gh-portal-close` on init and swaps to `gh-portal-open` while the modal is open (`app.jsx:225`, `app.jsx:232-242`). Documented at `docs.ghost.org/themes/members`.

**Attachment is one-shot at Portal init.** `setupCustomTriggerButton` queries the DOM once. Buttons injected later by client-side script are not wired.

### The EXACT supported values

Enumerated verbatim from `getPageFromLinkPath` (`apps/portal/src/app.jsx:1044-1175`). This is the complete set; **the docs never publish it.**

| `data-portal` value | Opens |
|---|---|
| *(absent value / bare `data-portal` / `""`)* | `default` — resolved by logged-in state, see below |
| `signup` | Signup screen |
| `signup/{tierId}` | Signup screen scoped to that tier |
| `signup/{tierId}/monthly` | **Straight to Stripe checkout**, monthly price of that tier — no modal, a loading state then a redirect |
| `signup/{tierId}/yearly` | Same, yearly price |
| `signup/free` | Signup, free plan |
| `signup/monthly` | Signup, monthly (site default plan) |
| `signup/yearly` | Signup, yearly (site default plan) |
| `signin` | Signin screen |
| `account` | Account home |
| `account/plans` | **Account → plans** (this is the real "upgrade" action) |
| `account/profile` | Account → edit profile |
| `account/newsletters` | Account → newsletter preferences |
| `account/newsletters/help` | Email-receiving FAQ |
| `account/newsletters/disabled` | Email-suppression FAQ |
| `support` | Tips & donations screen |
| `support/success` / `support/error` | Donation result screens |
| `recommendations` | Recommendations modal (documented at `docs.ghost.org/themes/helpers/data/recommendations`) |
| `gift` | Gift-subscription screen — **invalidated and dismissed if `paid_members_enabled` is false** (`app.jsx:193-198`) |
| `gift/redeem/{token}` | Gift redemption |
| `share` | Share modal |
| `offers/{offerId}` | Applies an offer; no modal page — routed through `handleSignupQuery` |

**Everything else falls through to `default`** (`app.jsx:1172-1174`: `return {page: 'default'};`).

`default` is then resolved in `getContextPage` (`app.jsx:1222-1231`):
```js
if (!page || page === 'default') {
    const loggedOutPage = isInviteOnly({site}) || !hasAvailablePrices({site}) ? 'signin' : 'signup';
    page = member ? 'accountHome' : loggedOutPage;
}
```
— logged in → **Account home**; logged out with self-signup → **Signup**; logged out, invite-only or no prices → **Signin**.

### `upgrade` is NOT a supported value — and Ghost's own default theme uses it

**DOCS/CODE CONFLICT #1.** `Source/partials/components/post-list.hbs:105` ships:
```hbs
<button class="gh-button" data-portal="upgrade">{{t "Upgrade"}}</button>
```
There is no `upgrade` branch in `getPageFromLinkPath`, and `grep -rn "upgrade" apps/portal/src/` finds no link path — only CSS class names, a Stripe `checkoutType`, and copy strings. So `data-portal="upgrade"` resolves to `default`. In Source's markup it sits inside `{{#if @member}}{{#unless @member.paid}}`, so the visitor is a logged-in free member and `default` → `accountHome` — which happens to render "You currently have a free membership, upgrade to a paid subscription for full access." (`apps/portal/src/components/pages/AccountHomePage/components/account-welcome.jsx:67`). It appears to work by accident.

**Inflozo must emit `account/plans`, not `upgrade`.** That is also the current official house style — the `partials/content-cta.hbs` shipped by Bulletin, Dawn, Digest, Edition, Journal and Solo uses `data-portal="account/plans"` for the upgrade path.

Same trap, same cause: **`data-portal="signout"` is not supported either.** Signing out is `data-members-signout` (`docs.ghost.org/themes/members`), an entirely different attribute handled by the members data-attribute layer, not by Portal's link parser. At least one shipping third-party theme (`KONTEMI-com/ghost-theme-ledger`, `custom-account.hbs:29`) gets this wrong and renders a "Sign out" button that opens Portal's account screen instead.

### The non-Portal alternative: `data-members-*` on the theme's own markup

These render **the theme's own HTML**, not a Portal modal, and work in **any** template. Full set, from `docs.ghost.org/themes/members`:

`data-members-form` (values: none, `signin`, `signup`, `subscribe`), `data-members-email`, `data-members-name`, `data-members-newsletter`, `data-members-label`, `data-members-error`, `data-members-autoredirect`, `data-members-otc="true"`, `data-members-signout`, `data-members-manage-billing` (+ `data-members-return`).

Form state is exposed as classes on the `<form>`: `loading`, `success`, `error`.

**This is the mechanism that makes a designed signup/signin form possible at all.** A `data-portal` button hands the visitor to Ghost's UI; a `data-members-form` keeps them in Inflozo's design.

---

## 5. Native member-facing URLs

**Ghost serves no member-facing HTML page. There is no `/account/`, `/signup/` or `/signin/` for a theme to influence, style, or override.**

The only member-facing mount is `/members/`, and it is an **API surface**:

`ghost/core/core/server/web/parent/frontend.js:20`
```js
frontendApp.lazyUse('/members', require('../members'));
```

Every route in that app is JSON or a redirect (`ghost/core/core/server/web/members/app.js`): `/members/api/member`, `/members/api/session`, `/members/api/entitlements`, `/members/api/integrity-token`, `/members/api/comments`, `/members/api/create-stripe-checkout-session`, `/members/api/create-stripe-billing-portal-session`, `/members/api/subscriptions/:id`, `/members/webhooks/stripe`, plus `/members/.well-known` (`frontend/web/site.js:107-110`). The one HTML-ish route is `createSessionFromMagicLink` at the app root, which consumes `?token=` and **redirects** — it renders nothing.

Ghost also serves `/unsubscribe/` (`routing/unsubscribe-router.js:14`), `/email/:uuid/` (`email-router.js:15`) and `/p/:uuid/` (`preview-router.js:15`). None is themeable membership UI.

**Can a theme style Portal at all?** Barely, and not from the theme:

- Portal renders in a **shadow-DOM'd iframe** injected by `{{ghost_head}}`; theme CSS does not reach inside it.
- The accent colour is passed through as a script `data-` attribute (`ghost_head.js:132-140`).
- Everything else — button text, tier display, signup terms, whether the floating button shows — is the `portal_*` settings block, set in Ghost Admin at `/ghost/#/settings/portal/edit`, not in the theme. Those settings are readable from `@site` / the Content API (`shared/settings-cache/public.js`) but not writable by a theme.
- The only theme-side styling hooks are the `gh-portal-open` / `gh-portal-close` classes Portal adds to **your** trigger element.

`{{ghost_head}}` is required in every theme, so Portal is always present when enabled; a theme cannot opt out.

---

## 6. Rendering tiers and prices

### Does `{{#get "tiers"}}` work in a page template?

**Yes, and in every template.** `{{#get}}` is an ordinary async helper with no context dependency; `tiers` is one of six allowed resources (`ghost/core/core/frontend/helpers/get.js:22-41`: `posts`, `tags`, `pages`, `authors`, `tiers`, `newsletters`). It resolves to the `tiersPublic` controller.

### Fields returned

`ghost/core/core/server/api/endpoints/utils/serializers/output/tiers.js`, `serializeTier()`:

```js
const serialized = {
    id, name, description, slug,
    active: json.status === 'active',
    type, welcome_page_url, created_at, updated_at,
    visibility, benefits, currency,
    monthly_price: json.monthlyPrice,
    yearly_price: json.yearlyPrice,
    trial_days: json.trialDays
};

if (!Array.isArray(serialized.benefits)) {
    serialized.benefits = null;
}

if (serialized.type === 'free') {
    delete serialized.currency;
    delete serialized.monthly_price;
    delete serialized.yearly_price;
}
```

`benefits` is an array of plain strings. Prices are integers in the smallest currency unit — format with `{{price monthly_price currency=currency}}` (`docs.ghost.org/themes/helpers/data/price`).

### What `include` is needed: **none**

**DOCS/CODE CONFLICT #2.** The docs' canonical example is
```hbs
{{#get "tiers" include="monthly_price,yearly_price,benefits" limit="100" as |tiers|}}
```
(`docs.ghost.org/themes/helpers/data/tiers`, `docs.ghost.org/themes/helpers/functional/get`). The `include` is a **no-op**, twice over:

1. `tiers-public.js` allowlists only `limit, fields, filter, order, debug, page` as options. `include` is not among them and is dropped by the API framework before the serializer ever sees it.
2. The input serializer adds those three relations **unconditionally** for the Content API — `ghost/core/core/server/api/endpoints/utils/serializers/input/tiers.js:72-86`:
   ```js
   if (localUtils.isContentAPI(frame)) {
       // CASE: content api can only have active tiers
       forceActiveFilter(frame);

       // CASE: content api includes these by default
       const defaultRelations = ['monthly_price', 'yearly_price', 'benefits'];
       ...
   }
   ```

Passing `include` is harmless and matches every published example, so **Inflozo should emit it anyway** for readability and forward-compatibility — but must not treat it as load-bearing, and must not tell users that omitting it loses prices. (One shipping theme, `curiositry/undefined-ghost-theme`, omits it and its author evidently believed it mattered; in fact its signup page is broken for a different reason — `data-members-plan`, a dead Ghost 3.x attribute.)

### `limit`

Ghost 6 caps `limit` at 100 and no longer honours `limit="all"` — `ghost/core/core/shared/max-limit-cap.js:45-48`: `// 'all' is no longer supported so gets capped to maxLimit` → returns 100. Applied by `get.js:200-202`. `limit="all"` therefore degrades silently rather than erroring. No real site has >100 tiers; emit `limit="100"`.

### What comes back on a site with no paid tiers

Ghost seeds **two** tiers at install (`core/server/data/schema/fixtures/fixtures.json`, model `Product`):

```json
{"name": "Free",            "slug": "free",            "type": "free", "active": true, "visibility": "public"}
{"name": "Default Product", "slug": "default-product", "type": "paid", "active": true, "visibility": "public",
 "currency": "usd", "monthly_price": 500, "yearly_price": 5000}
```

Both are `active: true`, and the Content API's only forced filter is `active: true`. So:

**On a brand-new site with no Stripe connected, `{{#get "tiers"}}` returns a Free tier AND a $5/mo · $50/yr paid tier.** The paid tier carries real-looking prices and a real `id`, so `data-portal="signup/{id}/monthly"` will render — and clicking it cannot complete, because Portal's signup screen suppresses paid plans when `paid_members_enabled` is false.

**This is the single most likely way an Inflozo membership page ships broken.** The correct guards:

```hbs
{{#if @site.paid_members_enabled}}
  {{#get "tiers" filter="type:paid" include="monthly_price,yearly_price,benefits" limit="100" as |tiers|}}
    ...
  {{/get}}
{{/if}}
```

`filter="type:paid"` is the pattern used by the two best modern third-party implementations (`adrianoamalfi/astrix-ghost` `custom-membership.hbs:21`; `KONTEMI-com/ghost-theme-ledger` `custom-membership` templates). Gate on `@site.paid_members_enabled` for the checkout affordance itself.

If there genuinely are no paid tiers, `{{#get}}` returns an **empty collection, not an error** — `{{#foreach}}` renders nothing and the surrounding markup remains. Design the empty state (Appendix H / FR-H8 territory).

### Ordering and pagination

Tiers come back in ascending monthly price (`docs.ghost.org/content-api/tiers` — "Tiers are returned in order of increasing monthly price"). The `meta.pagination` block is **synthesised, not real** — `ghost/core/core/server/services/tiers/tiers-api.js:56-69` hardcodes `page: 1, pages: 1, limit: tiers.length, total: tiers.length`. Do not paginate tiers.

---

## 7. Members disabled or restricted

### The four settings, and how they are derived

Three of the four are **calculated fields**, not stored settings — all derived from one stored value, `members_signup_access`, plus the Stripe keys.

`core/server/services/settings-helpers/settings-helpers.js:22-82`:
```js
isMembersEnabled()      { return this.settingsCache.get('members_signup_access') !== 'none'; }
isMembersInviteOnly()   { return this.settingsCache.get('members_signup_access') === 'invite'; }
allowSelfSignup()       { return this.settingsCache.get('members_signup_access') === 'all'; }
isStripeConnected()     { return this.getActiveStripeKeys() !== null; }
arePaidMembersEnabled() { return this.isMembersEnabled() && this.isStripeConnected(); }
```

Wired up at `core/server/services/settings/settings-service.js:161-165`. `members_signup_access` takes one of **`'all'` · `'invite'` · `'paid'` · `'none'`** (values confirmed by Portal's own predicates, `apps/portal/src/utils/helpers.js:256-292`).

| Site state | `members_enabled` | `allow_self_signup` | `members_invite_only` | `paid_members_enabled` |
|---|---|---|---|---|
| `members_signup_access: 'all'`, Stripe connected | true | true | false | true |
| `'all'`, no Stripe | true | true | false | **false** |
| `'paid'` | true | false | false | Stripe-dependent |
| `'invite'` | true | false | **true** | Stripe-dependent |
| `'none'` | **false** | false | false | **false** |

### `@member`

**Unaffected by all of it.** `@member` is always *defined* and is `null` for anonymous visitors, **including when members are disabled entirely** — `const member = req.member ? {...} : null` (`theme-engine/middleware/update-local-template-options.js`). `{{#if @member}}` is safe unconditionally and needs no `@site.members_enabled` pre-check for correctness. This restates `research-ghost-binding-contexts.md` R6 / Appendix B.1 §2 and is unchanged.

Pair the two only to hide member UI **wholesale** — e.g. suppress the whole membership section when `members_enabled` is false, because with members off there is no one for it to serve.

### `data-portal` triggers

**They go completely inert only when Portal is not loaded, and the condition for that is narrower than "members disabled".**

`ghost/core/core/frontend/helpers/ghost_head.js:121-152`, `getMembersHelper()`:
```js
// Do not load Portal if both Memberships and Tips & Donations and Recommendations are disabled
if (!settingsCache.get('members_enabled') && !settingsCache.get('donations_enabled') && !settingsCache.get('recommendations_enabled')) {
    return '';
}
```

So:

| Condition | Portal script | `data-portal` buttons |
|---|---|---|
| Members on | injected | work |
| Members **off**, but donations **or** recommendations on | **still injected** | click handlers attach; Portal opens, but signup/signin screens are gated by its own predicates |
| Members off, donations off, recommendations off | **not injected** | **fully inert** — no listener, no `gh-portal-close` class, the click does nothing (`href="javascript:"` links do nothing; `href="#/portal/signup"` merely writes a hash) |

This is a genuine dead-UI risk: a membership page whose buttons silently do nothing. Guard the whole section on `@site.members_enabled`.

The Stripe script is separately gated: `if (settingsCache.get('paid_members_enabled')) { membersHelper += '<script async src="https://js.stripe.com/v3/"></script>'; }` (`ghost_head.js:149-151`). Without it, checkout cannot run at all.

Within Portal, the screens degrade rather than error (`apps/portal/src/components/pages/signup-page.jsx:716-727`, `signin-page.jsx:138-194`): invite-only suppresses the signup form, `!isSigninAllowed` (i.e. `'none'`) suppresses signin, and `!hasAvailablePrices` collapses the plan chooser. `data-portal="gift"` is explicitly invalidated when paid members are off (`app.jsx:193-198`).

### `{{#get "tiers"}}`

**Entirely unaffected.** The tiers endpoint's only forced filter is `active: true` (§6). It does not consult `members_signup_access`, `members_enabled` or Stripe state. A site with members set to `'none'` still returns its seeded Free and paid tiers to `{{#get "tiers"}}`.

**This is the trap restated:** tiers being present tells you nothing about whether anyone can subscribe. Gate on `@site.paid_members_enabled`, never on tier count.

### What Inflozo can detect via the Content API

**All of it.** The Content API's `/settings/` endpoint returns `settingsCache.getPublic()` verbatim:

`ghost/core/core/server/api/endpoints/settings-public.js`:
```js
return Object.assign({},
    settingsCache.getPublic(), {
        url: urlUtils.urlFor('home', true),
        version: ghostVersion.safe,
        labs: labs.getAll()
    }
);
```

and the public allowlist (`ghost/core/core/shared/settings-cache/public.js`) includes **`members_enabled`, `members_signup_access`, `paid_members_enabled`, `allow_self_signup`, `members_invite_only`, `donations_enabled`, `recommendations_enabled`, `comments_enabled`**, plus the whole `portal_*` block.

**DOCS/CODE CONFLICT #3.** `docs.ghost.org/content-api/settings` publishes a response example containing none of these — it stops at `members_support_address` and `url`. The example is abridged/stale; the code returns the full public allowlist. Trust the code.

| Inflozo needs to know | Detect via |
|---|---|
| Are members on at all? | `GET /content/settings/` → `members_enabled` |
| Can visitors self-serve signup? | `allow_self_signup` (`'all'` only) |
| Invite-only? | `members_invite_only`, or `members_signup_access === 'invite'` |
| Paid signup possible / Stripe connected? | **`paid_members_enabled`** — this is the Stripe-connected signal, there is no separate one |
| Which tiers, at what price? | `GET /content/tiers/` |
| Will Portal even load? | `members_enabled \|\| donations_enabled \|\| recommendations_enabled` |

Note there is **no** direct "is Stripe connected" field; `paid_members_enabled` is the composite (`members_enabled && isStripeConnected()`). For a site with `members_signup_access: 'none'` but Stripe connected, `paid_members_enabled` is false and Inflozo cannot distinguish that from "no Stripe". Acceptable — the user-visible outcome is identical.

**Editor consequence.** These are exactly the signals that should drive A30's availability and its warnings: when `members_enabled` is false, an A30 section is decoration; when `paid_members_enabled` is false, every paid CTA is decoration. Per FR-H7's prevention-not-warning stance, that argues for making the paid-tier controls unavailable rather than flagging them — the same reasoning as Appendix B.1 §0.

---

## 8. Reserved and special slugs

### The config-level protected list

`ghost/core/core/shared/config/overrides.json:17-19`:
```json
"slugs": {
    "protected": ["ghost", "rss", "amp"]
}
```

Enforced at slug generation (`ghost/core/core/server/models/base/plugins/generate-slug.js:100-101`):
```js
const protectedSlugs = _.union(urlUtils.getProtectedSlugs(), Model.protectedSlugs || []);
slug = _.includes(protectedSlugs, slug) ? slug + '-' + baseName : slug;
```
`baseName` is the table name minus its trailing `s`, so a page titled "Ghost" becomes **`ghost-post`**, not `ghost`. Tags additionally protect `new` (`models/tag.js:221`).

### Paths mounted ahead of the pages router

A page whose slug collides with any of these is **unreachable** — the earlier router answers first. Mount order, in order:

| Path | Source |
|---|---|
| `/members/`, `/webmentions/`, `/gift/` | `ghost/core/core/server/web/parent/frontend.js:20-22` (mounted before the whole site app) |
| `/unsubscribe/` | `routing/unsubscribe-router.js:14` |
| `/email/:uuid/` | `routing/email-router.js:15` |
| `/p/:uuid/` | `routing/preview-router.js:15` |
| **every `routes:` entry in `routes.yaml`** | `router-manager.js:120-121` |
| collections (default `/` with permalink `/{slug}/`) | `router-manager.js:127-128` |
| **pages — `/:slug/`** | `router-manager.js:132-133` |
| `/tag/:slug/`, `/author/:slug/` | `router-manager.js:138-139` |

Plus flat files served before routing: `/robots.txt`, `/favicon.ico`, `/sitemap.xml`, `/sitemap.xsl` (`frontend/web/routers/serve-public-file.js:135-179`), and `/rss/` from the collection's RSS router (`routing/rss-router.js:15`).

`/private/` is Ghost's password gate and pushes the `private` context (`services/rendering/context.js`).

### Do any of these break the candidate mechanisms?

**No — and specifically, every slug Inflozo would want is safe.**

`membership`, `subscribe`, `pricing`, `plans`, `join`, `signup`, `signin`, `login`, `account` are **all unreserved**. A page at `/account/` works; a page at `/signup/` works. Ghost's own docs used to route `/signup/` and `/account/` via routes.yaml (the Lyra pattern) precisely because nothing else claims them.

Two real caveats:

1. **`routes.yaml` beats pages.** If the user has *any* `routes:` entry matching the page's URL, the page is shadowed. Worse, if a routes.yaml route declares `data: page.{slug}`, Ghost **301-redirects the page's native `/{slug}/` URL to the route's URL** (`docs.ghost.org/themes/routing` — "it will also automatically redirect the original URL of the content to the new one"; implemented via `_respectDominantRouter`, `routing/parent-router.js:85-115`). A user who once tried the Lyra recipe and left `/account/: members/account` in their routes.yaml will find that a new page slugged `account` is redirected away. Inflozo should read the site's routes.yaml before recommending a slug.
2. **A page's URL is always `/{slug}/` and cannot be changed.** `docs.ghost.org/themes/contexts/page` — "The URL used to render a static page is always `/:slug/`. This cannot be customised, unlike post permalinks." Confirmed in `routing/static-pages-router.js:16-19` (`// @NOTE: Permalink is always /:slug, not configure able`). So with mechanism (ii), the URL is whatever the user's slug is — Inflozo cannot pin `/membership/`. This is an argument for *recommending* a slug in the instructions, not for depending on one.

**Neither caveat is specific to `custom-{name}.hbs`** — both apply equally to every page-backed mechanism. Mechanism (i) is additionally exposed because for it the slug is not merely the URL but the binding.

---

## 9. What real membership themes actually ship

Surveyed 29 themes by cloning and grepping: all 25 official `TryGhost/*` themes, plus four inspectable third-party themes; plus four commercial themes assessed from vendor documentation only (flagged as such).

### The dominant pattern is: **nothing at all**

**22 of 25 official themes ship no membership page template of any kind** — no `members/`, no `page-*`, no membership `custom-*`. That includes **both** current official themes:

- **Casper 5.12.1** — templates are exactly `author, default, error-404, error, index, page, post, tag`. Membership is four lines in `default.hbs:61-67` (`data-portal="signin"`, `"signup"`, `"account"`) plus a bare `data-portal` CTA at `post.hbs:109`. No `{{#get "tiers"}}` anywhere.
- **Source 1.7.1** — templates are `author, default, home, index, page, post, tag`. Same three Portal links in `partials/components/navigation.hbs:38-46`, plus `data-portal="upgrade"` (broken, §4) and `data-portal="recommendations"` in `partials/components/post-list.hbs`. One `data-members-form` — an inline newsletter box, `partials/email-subscription.hbs`. No `{{#get "tiers"}}`.

`custom-*.hbs` does appear in the official corpus, but **never for membership** — only for feature-image layout variants (`Dawn/custom-{full,narrow,no}-feature-image.hbs`, `Edition/custom-*`, `Headline/custom-{full,wide}-feature-image.hbs`).

**`page-{slug}.hbs`: zero occurrences across all 29 themes.** Not one, membership or otherwise.

### The legacy pattern: routes.yaml → `members/*.hbs` (a Lyra fossil)

`members/account.hbs` is not a Ghost convention. It is one 2020 file, copied forward.

- **`TryGhost/Lyra`** — the theme Ghost's docs still cite. **The repository is archived.** `engines.ghost: ">=4.0.0"`, never updated for Ghost 5 or 6; the last commit touching `members/` was **2021-03-09**. Its `routes.yaml` is the origin of the pattern:
  ```yaml
  routes:
    /signup/: members/signup
    /signin/: members/signin
    /account/: members/account
  ```
  **This is a routes.yaml route pointing at an arbitrary template path — not a template family Ghost resolves.** Lyra predates Portal and uses zero `data-portal`. Its signup page is **broken on Ghost 6**: it uses `@price.monthly` and `data-members-plan="Monthly"`, both removed.
- **`TryGhost/Pico`** — byte-identical routes.yaml; `members/` frozen 2021-03-09; its account-page action buttons are commented out in the shipped source.
- **`TryGhost/Starter`** — ships `members/*.hbs` but **ships no routes.yaml at all**, so those three files are dead code out of the box. Ghost staff confirmed on the forum that you must add the routes yourself (forum.ghost.org/t/how-do-i-use-starters-custom-membership-templates/39864). Its `members/signup.hbs:16` is the only `{{#get "tiers"}}` in the entire official corpus — and its checkout button uses the dead `data-members-plan`.
- Third-party descendants **`Inoryum-Ltd/aesto`** (2024) and **`curiositry/undefined-ghost-theme`** (2025) carry Lyra's markup and Lyra's English prose forward verbatim, typos included.

Every one of these requires the site owner to hand-upload a `routes.yaml`. None of them gains anything from doing so that `custom-*.hbs` would not give for free — which is exactly why the newer themes stopped.

### The modern pattern: `custom-{name}.hbs`

All of it recent, all of it outside the official corpus:

- **`adrianoamalfi/astrix-ghost`** (v0.2.5, 2026-07, `engines.ghost: ">=6.0.0"`) — the only true Ghost-6-declared theme with readable source. Ships `custom-membership.hbs`, **no routes.yaml**, relies purely on the Template dropdown. Its `custom-membership.hbs` renders the page's own editable content first (`{{#post}}…{{content}}{{/post}}`) and then appends tiers:
  ```hbs
  {{#get "tiers" filter="type:paid" include="monthly_price,yearly_price,benefits" limit="6" as |tiers|}}
  ...
  <a class="gh-button" href="#/portal/signup/{{id}}/monthly" data-portal="signup/{{id}}/monthly">{{t "Choose this plan"}}</a>
  ```
  **This is the closest thing to a reference implementation of what Inflozo should emit.** Note the structure: designed frame + user-editable body + generated tier block.
- **`KONTEMI-com/ghost-theme-ledger`** (2026-04) — routes.yaml pointing *at* `custom-*` names, so the same files are also dropdown-selectable. Belt and braces.
- **Writter** (ThemeForest / electronthemes, v4.5.4, Sep 2025, $69) — commercial, source not inspectable, **but its documentation is decisive**: it ships `custom-membership.hbs`, `custom-account.hbs`, `custom-signin.hbs`, `custom-signup.hbs`, and its activation instructions are *"Create a new page and open the page settings panel… Select the page template: Membership at the bottom dropdown. Publish the page."* — Template dropdown, with a *recommended* slug (`/membership/`) that is cosmetic. Its shipped routes.yaml has an **empty** `routes:` block. The same vendor's **earlier** documentation described root `signin.hbs`/`signup.hbs` + a mandatory routes.yaml upload. **A commercial vendor migrated off routes.yaml onto the Template dropdown between versions.** That is the strongest available market signal, and it points where this document points.

### Is a designed account page a thing in practice?

**No. Treat it as extinct.** Details in §10, but the survey evidence:

- Zero official themes have one. `Starter/members/account.hbs` is prose only — "Nice, you're a subscriber!" — with no `@member.subscriptions`, no `{{cancel_link}}`, no billing.
- The only two live, correct designed account pages found are `aesto` (2024) and — partially — `ghost-theme-ledger`. `aesto` is verbatim Lyra.
- `ghost-theme-ledger/custom-account.hbs` is **44 lines total**: it reads `@member.paid` for a badge, then delegates everything to `data-portal="account"`, `"account/profile"`, `"signout"`. No subscriptions loop, no cancel link. **That delegating shell is the pattern with a future**, and it is what an Inflozo "account page" should be if one ships at all.
- **Penang** (Aspire Themes, $149, marketed explicitly as *"a membership-focused Ghost theme"*) documents **no** membership, pricing, account or signin page. Its only documented custom templates are Tags, Authors and Contact. A $149 membership theme in 2026 ships gating plus Portal, and nothing else.

### Bonus: `partials/content-cta.hbs`

Six official themes ship an override (Bulletin, Dawn, Digest, Edition, Journal, Solo), and they are near-identical. `Solo/partials/content-cta.hbs:14-21` is the house style and is worth copying for A32:
```hbs
{{#if @member}}
    <button class="gh-btn gh-primary-btn" href="#/portal/account/plans" data-portal="account/plans">{{t "Upgrade now"}}</button>
{{else}}
    <button class="gh-btn gh-primary-btn" href="#/portal/signup" data-portal="signup">{{t "Subscribe now"}}</button>
    <span class="gh-cta-link" href="#/portal/signin" data-portal="signin">{{t "Already have an account?"}} {{t "Sign in."}}</span>
{{/if}}
```

---

## 10. The account-page question

**Blunt answer: of Inflozo's three intended surfaces, one is fully designable, one is mostly designable, and "design your account page" cannot be delivered as promised. Cut it or rename it.**

| Surface | Verdict |
|---|---|
| **Signup / membership landing** | **Fully designable.** Ship it. |
| **Signin** | **Designable, with one Portal seam.** Ship it with a caveat. |
| **Account** | **Not deliverable as "design your account page."** Re-scope to a delegating landing page, or cut. |

### Signup — fully designable

Everything a signup page needs works on an ordinary page with a `custom-*.hbs` template:

- Free / email-capture signup entirely in the theme's own markup: `<form data-members-form>` + `data-members-email` (+ `data-members-name`, `data-members-label`, `data-members-newsletter`, `data-members-error`), with `loading` / `success` / `error` classes for state (`docs.ghost.org/themes/members`).
- Tier and price rendering via `{{#get "tiers"}}` (§6).
- Paid checkout via `data-portal="signup/{id}/monthly"` — a direct Stripe redirect, no Portal modal (§4, `app.jsx:1016-1041`).
- Everything is server-rendered HTML the designer controls.

**The one thing outside the design:** Stripe's own checkout page. Unavoidable on any platform.

### Signin — designable, with a Portal seam

`<form data-members-form="signin">` renders a themed signin form anywhere. Adding `data-members-otc="true"` enables one-time codes — but per the docs, "successful submission of the form will display a modal via portal, no custom handling necessary". **That modal is Portal's, and Inflozo cannot design it.** So a designed signin page is real up to the point of submission, after which the visitor either goes to their email (magic link — the form's own `success` state, designable) or sees a Portal modal (OTC — not designable).

Ship signin, and either omit `data-members-otc` to keep the whole flow in-design, or accept the modal. Recommend omitting it by default and exposing it as a control.

### Account — the honest answer

**What genuinely works on an ordinary page:**

- `@member`, `@member.paid`, `@member.email`, `@member.name`, `@member.firstname`, `@member.uuid`
- `{{#foreach @member.subscriptions}}` with the full Stripe-derived shape: `plan.*`, `status`, `start_date`, `current_period_end`, `cancel_at_period_end`, `default_payment_card_last4`, `tier.name`, `next_payment.*`, `offer`, `offer_redemptions`
- `{{price plan}}`, `{{cancel_link}}` (cancel/resume), `data-members-manage-billing` (opens Stripe's billing portal), `data-members-signout`

So a themed account page is *technically* buildable. Five reasons not to promise one:

**1. It is display-only for everything that matters.** Change email, change name, change newsletter preferences, change or upgrade plan — none has a theme-level attribute. Each requires handing off to Portal (`data-portal="account/profile"`, `"account/newsletters"`, `"account/plans"`). A "designed account page" is therefore a designed *cover sheet* over Portal, not a replacement for it. That is precisely what the one modern implementation found in the wild does (`ghost-theme-ledger/custom-account.hbs`, 44 lines, all delegation).

**2. There is no protected URL.** Ghost serves no `/account/` (§5). Inflozo's account page would be an ordinary public page at whatever slug the user chose, visible to logged-out visitors, with **nothing redirecting them to signin**. Portal does that redirect for its own account screens (`app.jsx:722-732`: a logged-out visitor requesting an account page is sent to signin with a return URL). A theme page must hand-roll the `{{else}}` branch and will still leak the page's existence.

**3. Server-rendered member PII is a caching hazard.** Ghost normally marks any request from a logged-in member `Cache-Control: private` (`frontend/web/middleware/frontend-caching.js:60-66`). But with the experimental `cacheMembersContent:enabled` config, member responses are cached **publicly, keyed only by tier**, with an `X-Member-Cache-Tier` header (`frontend-caching.js:81-92`). A page that server-renders `{{@member.email}}` or `{{default_payment_card_last4}}` would then be cached and served to **other members on the same tier**. Portal is immune: it fetches `/members/api/member` client-side, per visitor. Off by default, opt-in, but a page containing card digits and email addresses is exactly the wrong thing to put on the wrong side of that switch.

**4. Portal is always there anyway.** `{{ghost_head}}` is required, so Portal ships on every page of every theme. `data-portal="account"` gives the user a complete, localised, accessible, maintained account UI for one attribute. A designed alternative has to beat that, and it starts behind.

**5. The market has already answered.** Zero official themes ship one. A $149 membership-focused commercial theme ships none. The only complete implementations are Lyra's 2021 markup copied forward. See §9.

### Recommendation for A30

- **Keep and re-point:** #1, #3–#8, #13, #14 (9 variants) → `custom-{name}.hbs`, page-backed. This is the category.
- **Keep with a caveat:** #2, #9, #10 (3 signin variants) → same target; document the OTC seam.
- **Re-scope:** #11 "Account Panel" and #12 "Account Minimal List" → a single **"Member Home"** variant: greeting, plan badge from `@member.paid`, subscription summary from `@member.subscriptions`, and buttons that delegate (`account/plans`, `account/profile`, `account/newsletters`, `data-members-signout`). Do not render email or card digits. Do not call it "your account page".
- **Cut or re-scope:** #15 "Magic-Link Sent" is **not a page**. It is the `.success` class state of a `data-members-form`. There is no URL for it. Fold it into the signup/signin variants as a designed success state.

Net: **A30 goes from 15 page designs to 12 page designs + 1 form state**, all on one compile target.

### The product copy

"Design your signup page" — true. "Design your signin page" — true. **"Design your account page" — not true.** The nearest honest claim is *"Design a member home page that hands off to Ghost's account panel."* If the owner needs the account bullet, that is the sentence.

---

## 11. Contested or unverified

Claims here are either unverified, or contradict a published source or a prior companion. **7 items.**

### 11.1 CONTRADICTION with `research-ghost-binding-contexts.md`: tier visibility

That companion states (§4 table and §"Content API defaults"): *"`tiers` | public | Hidden tiers are excluded."* The Ghost docs agree: *"The tiers endpoint returns a list of tiers for the site, filtered by their visibility criteria"* (`docs.ghost.org/content-api/tiers`).

**I could not find any such filter in the code, and believe both are wrong.** Evidence:

- `ghost/core/core/server/api/endpoints/utils/serializers/input/tiers.js` — the only Content-API-conditional filtering is `forceActiveFilter(frame)`, which adds `{active: true}` and nothing else.
- `ghost/core/core/server/api/endpoints/tiers-public.js` — no visibility handling; `options` are `limit, fields, filter, order, debug, page`.
- `ghost/core/core/server/api/endpoints/utils/serializers/output/tiers.js` — emits `visibility: json.visibility` and filters nothing.
- `ghost/core/core/server/services/tiers/tiers-api.js:49-70` — `browse()` calls `this.#repository.getAll(options)` with no visibility predicate.

**Conclusion: `{{#get "tiers"}}` returns tiers with `visibility: 'none'` as well as `'public'`.** Practical effect: an Inflozo tier block should filter explicitly — `filter="type:paid+visibility:public"` — rather than trusting the API to hide hidden tiers.

**Confidence: high on the code reading, medium on the conclusion** — I did not run a live request against a site with a hidden tier, and a filter could in principle be applied in the Bookshelf layer of `tier-repository.js`, which I read only for `visibility` references (10 hits, all property accessors, none a query predicate). **This should be confirmed empirically before the claim is relied on.** Until then, the explicit `visibility:public` filter is correct either way and costs nothing.

### 11.2 The `data-portal="upgrade"` behaviour chain

That `upgrade` is unsupported is **certain** (there is no branch for it in `getPageFromLinkPath`, and no link path named `upgrade` anywhere in `apps/portal/src/`). That it resolves specifically to Account-home for a logged-in free member is **traced through the code but not observed running**: `{page:'default'}` → `getContextFromState()` → `getContextPage()` → `member ? 'accountHome' : ...`. Confidence high; not empirically confirmed.

The recommendation (emit `account/plans`) does not depend on this chain being exactly right.

### 11.3 The exact `data-portal` value list is from source only

The docs publish only `signup`, `signin`, `recommendations`, and `signup/TIER_ID/{monthly,yearly}`; `account` appears only via Casper's and Source's markup. **The complete table in §4 is derived from `apps/portal/src/app.jsx:1044-1175` alone.** It is a client-side JS file with no compatibility guarantee and no changelog. Values outside the four documented ones (`account/plans`, `account/newsletters`, `support`, `gift`, `share`, `offers/{id}`) should be treated as **working but undocumented**, and re-verified against Portal on each Ghost minor Inflozo certifies against.

Note also two branches in that function that are **unreachable dead code** — `path === 'signup/free'`, `'signup/monthly'`, `'signup/yearly'` are matched earlier by `customPricesSignupRegex` and never reached. They produce identical results, so this is a curiosity, not a risk.

### 11.4 What a broken routes.yaml `data:` binding does

A `routes.yaml` route whose `data: page.{slug}` no longer resolves (page renamed or deleted) goes through `routing/controllers/static.js:38-45` → `processQuery` → an API `read` → `.catch(renderer.handleError(next))`. **I expect a 404, but did not verify it.** The missing-*template* case is verified and is a 500: `static-routes-router.js:109-113` throws `IncorrectUsageError({message: 'Missing template ... for route ...'})`.

Either way the conclusion holds — mechanism (iii) fails hard where (ii) fails soft — but the specific status code for the broken-data case is unverified.

### 11.5 No empirical run

**Nothing in this document was tested against a running Ghost.** A local Ghost 6.44.0 install exists at `/home/ghost/Dev/travio/` but was not started, to avoid side effects on the owner's site. Every claim is from source reading, docs, or shipped theme files. The highest-value empirical checks, if the owner wants them, in priority order:

1. Rename a page that has a `custom_template` selected; confirm the template still applies. *(This is the load-bearing claim of the whole recommendation.)*
2. `{{#get "tiers"}}` on a site with a hidden tier — settles §11.1.
3. The Template dropdown's label rendering for a multi-word name (`custom-join-us.hbs` → "Join Us").
4. `data-portal="upgrade"` for a logged-in free member — settles §11.2.

### 11.6 Commercial themes assessed from documentation only

**Writter, Arkai, Penang and the Bright Themes article were not inspected as source.** Writter's template filenames and activation instructions come from `electronthemes.com/docs/ghost/writter`; the "vendor migrated off routes.yaml" inference rests on comparing that page against an older `electronthemes.github.io/writter` doc site whose title says "Ghost Portfolio Theme", so it is possible those are two different products. The §9 market-signal argument is therefore **suggestive, not proven**. It is corroboration for a conclusion the code already supports on its own; it is not load-bearing.

### 11.7 `for: ['page','post']` is currently ignored by Admin

GScan emits a `for` array on each custom template, and Ghost Admin's `gh-psm-template-select.js` does **not** filter the dropdown by it — `customTemplates` is returned unfiltered. So `custom-membership.hbs` is offered on posts too. This is a reading of current Admin code, not documented behaviour, and could change. Inflozo should not depend on the template being offered on posts, nor on it being hidden there.

---

## 12. Summary of docs/code conflicts

| # | Topic | Docs say | Code says | Section |
|---|---|---|---|---|
| 1 | `data-portal="upgrade"` | Not documented; **shipped by Source 1.7.1** | Unsupported — falls through to Portal's default screen. Use `account/plans`. | §4 |
| 2 | `{{#get "tiers" include="..."}}` | `include="monthly_price,yearly_price,benefits"` required | No-op. Content API adds those three relations unconditionally; `include` is not even an allowed option on the endpoint. | §6 |
| 3 | Content API `/settings/` response | Example stops at `members_support_address` | Returns the full public allowlist including `members_enabled`, `paid_members_enabled`, `members_signup_access`, all `portal_*` | §7 |
| 4 | Tier visibility filtering | "filtered by their visibility criteria" | No visibility filter found; only `active: true` is forced. **Flagged as unverified — see §11.1** | §6, §11.1 |
| 5 | `members/account.hbs` as a theme path | `docs.ghost.org/themes/members` cites Lyra's `members/account.hbs` as a worked example | Lyra is **archived**, targets `ghost >=4.0.0`, its `members/` code is frozen at 2021-03-09, and its signup page uses removed Ghost 3.x APIs. There is no members template family; that path only ever worked because Lyra's own `routes.yaml` pointed at it. | §9 |

Conflicts 1–3 and 5 are confirmed by direct code reading. Conflict 4 is flagged as unverified.
