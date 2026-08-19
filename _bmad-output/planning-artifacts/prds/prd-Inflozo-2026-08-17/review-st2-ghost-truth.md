---
title: Inflozo PRD — Ghost Platform Truth Review (ST2)
reviewer: Ghost Platform Truth
date: 2026-08-18
verdict: CHANGES REQUIRED
sources: Ghost `main` @ v6.58.0-rc.0 (latest release v6.57.1) · gscan 6.4.2 (= the version Ghost 6.58 bundles) · @tryghost/nql 0.13.4
method: sparse clone of TryGhost/Ghost + raw-file fetch of TryGhost/gscan + runnable experiments against `spike-compiler/theme-output/`
---

# Ghost Platform Truth Review

**Verdict: CHANGES REQUIRED.** 3 CRITICAL, 4 HIGH, 10 MEDIUM, 7 LOW.

The PRD's Ghost knowledge is, on the whole, unusually good — the membership-template
fossil, the `tokenPermissionCheck` allowlist, the seeded `$5/mo` Default Product, the
`@site`-keys-are-always-defined rule, the `page-{slug}` precedence trap, the
`GS010-PJ-GHOST-API-PRESENT` warning, and the empirical 0-error/0-warning gate all
hold up byte-for-byte against source. See **Verified correct** below; that list is
long and should not be re-litigated.

But three claims are false in a way that breaks a shipped feature, and one of them
(the locale file) ships a *visibly* broken live site with no gate anywhere in the
toolchain that can catch it. Two more false claims caused the PRD to **delete
capability Ghost actually has**, on a stated rationale that is wrong.

A recurring pattern worth naming: **the citation-backed research companions are more
accurate than the PRD body.** In at least one case (`limit:`) the PRD body asserts the
exact opposite of what its own normative companion and its own research file say, with
a correct source citation sitting in the research. The regression risk is in the
distillation step, not in the research.

---

## Environment actually used

| Thing | Version | How established |
|---|---|---|
| Ghost latest release | **v6.57.1** | `api.github.com/repos/TryGhost/Ghost/releases/latest` |
| Ghost `main` | **6.58.0-rc.0** | `ghost/core/package.json` |
| gscan bundled by Ghost | **6.4.2** | `ghost/core/package.json` → `"gscan": "6.4.2"` |
| gscan installed & run here | **6.4.2** | `npm install gscan` in a clean temp dir |
| @tryghost/nql | **0.13.4** | `npm install @tryghost/nql` |

---

## Empirical gscan result (FR-J6's headline claim)

**CONFIRMED, and reproducible.** Run against `spike-compiler/theme-output/` with
gscan 6.4.2 — i.e. a *newer* gscan than the PRD was written against, and the exact
version Ghost itself will run on upload:

```
[baseline] v5: CLEAN 0/0
[baseline] v6: CLEAN 0/0
```

Zero errors, zero warnings, zero recommendations, on both specs. **Newer gscan does
not change the verdict.** The `checkVersion` Ghost passes is `v${majorVersion}`
(`ghost/core/core/server/services/themes/validate.js`), so a Ghost 6 host checks `v6`
— which is what I ran.

Directed experiments, same harness:

| Mutation | v5 | v6 |
|---|---|---|
| add `engines: {"ghost-api": "v5"}` | `WARNING GS010-PJ-GHOST-API-PRESENT` | same |
| custom setting declared but unreferenced | **`ERROR GS100-NO-UNUSED-CUSTOM-THEME-SETTING`** | same |
| `group: "site wide"` | `RECOMMENDATION GS010-PJ-CUST-THEME-SETTINGS-GROUP` | same |
| `color` default `#fff` (3-digit) | **`ERROR GS010-PJ-CUST-THEME-SETTINGS-COLOR-DEFAULT`** | same |
| `{{@custom.x}}` referenced only in a partial invoked from `index.hbs` | CLEAN | CLEAN |
| `{{@custom.x}}` referenced only in `default.hbs` | CLEAN | CLEAN |
| `{{@custom.x}}` referenced only in an **orphan** partial | **`ERROR GS100`** | same |

The partial-traversal result is good news for FR-J1's partial-extraction mandate:
gscan follows `{{> partial}}` invocations transitively, so a `{{@custom.*}}` reference
inside a real partial counts. Only orphan partials don't.

---

# CRITICAL

## C1 — FR-Q6 / Appendix B: "exactly one locale file" ships a site rendering raw translation keys

**PRD claim (FR-Q6, restated verbatim in Appendix B):**
> "**The theme ships exactly one locale file**, named for the project's language and
> carrying the whole catalog — English defaults with the user's overrides applied over
> them — **so every key always resolves and no second file can disagree with it**; when
> the project language is English that single file *is* `en.json`."

Paired with:
> "**Language is stored on the project**, defaulted from the connected site's
> `@site.locale` at first link and **always user-editable**."

**What Ghost actually does.**

`{{t}}` picks a backend on a labs flag
(`ghost/core/core/frontend/helpers/t.js`):

```js
if (labs.isSet('themeTranslation')) { ... themeI18next.t(text, bindings); }
else { ... themeI18n.t(text, bindings); }
```

`themeTranslation` is listed in **`PRIVATE_FEATURES`** in
`ghost/core/core/shared/labs.js:51` — "only visible if the developer experiments flag
is enabled". **On every ordinary Ghost site the legacy backend runs.** Both are
initialised with the **site's** locale setting, not the theme's:

```js
themeI18n.init({activeTheme: settingsCache.get('active_theme'),
                locale: settingsCache.get('locale')});
```

The legacy loader (`ghost/core/core/frontend/services/theme-engine/i18n/i18n.js`):

```js
_loadStrings(locale) {
    locale = locale || this.locale();
    try { return this._readTranslationsFile(locale); }   // locales/<SITE locale>.json
    catch (err) {
        if (err.code === 'ENOENT') {
            this._handleMissingFileError(locale);
            if (locale !== this.defaultLocale()) {        // defaultLocale() === 'en'
                this._handleFallbackToDefault();
                return this._loadStrings(this.defaultLocale());   // locales/en.json
            }
        } ...
        return {};                                        // <-- empty resource
    }
}
```

and the missing-key path (`ThemeI18n` forces `_stringMode = 'fulltext'`):

```js
if (this._stringMode === 'fulltext') { fallback = msgPath; }
...
return get(this._strings, lookupPath) || fallback;        // key echoed verbatim
```

confirmed by the shipped comment in `theme-i18n.js`:
`_handleMissingKeyError() { // This case cannot be reached in themes as we use the key as the fallback }`.

**The resolution chain is: `locales/{SITE_LOCALE}.json` → `locales/en.json` → `{}`.**
There is no third step and no theme-declared locale.

**Why it matters.** Take FR-Q6's own first-class use case: a French project.

- Project language `fr` → theme ships **only** `locales/fr.json`.
- The connected site's `locale` setting is `en` (Ghost's default, and the value most
  English-speaking owners of a French-language publication never change — and which
  FR-Q6 explicitly permits to diverge, since project language is "always user-editable").
- Ghost looks for `locales/en.json` → **ENOENT** → `locale === 'en'` so no fallback
  branch runs → `strings = {}`.
- Every `{{t}}` in the theme falls back to its key. Because FR-Q6 mandates
  **dotted keys**, the visitor sees literally `pagination.older_posts`,
  `error.page_not_found`, `card.read_more` — across the entire site.

The mirror case also fails: project `en` + site locale `de` reads `de.json` (absent) →
falls back to `en.json` (present) → **works**. So the failure is precisely
*"shipped file is not `en.json` and does not exactly match the site's `locale`
setting"* — i.e. exactly the non-English case the Translations module exists to serve.

**Nothing catches it.** gscan's translation check
(`gscan/lib/checks/070-theme-translations.js`) is 38 lines and only does
`JSON.parse` on any `locales/*.json`. **A theme with zero locale files passes.** There
is no gscan rule tying a locale filename to anything. FR-J6's 0/0 gate is green on a
theme that renders raw keys to every visitor.

The stated rationale is also inverted: *"no second file can disagree with it"* — but
`en.json` is not a competing file, it is **the fallback Ghost is coded to look for**.
Omitting it is what creates the failure.

**Severity: CRITICAL.** A shipped, deployed, gscan-green site displaying machine keys
as visitor-facing chrome, for the module's primary use case.

**Fix (small, and it matches source exactly):**

1. **Always emit `locales/en.json`** carrying the full English-default catalog. This
   is the terminal fallback Ghost is hard-coded to try.
2. When the project language ≠ `en`, emit **`locales/{lang}.json` in addition**,
   carrying the same catalog with the user's overrides applied.
3. Reword FR-Q6: *"The theme ships `locales/en.json` (English defaults) always, plus
   `locales/{lang}.json` when the project language is not English. Ghost resolves
   `locales/{site_locale}.json` and falls back only to `locales/en.json`, so `en.json`
   is what guarantees every key resolves."*
4. Add a pre-deploy check: **warn when the project language ≠ the connected site's
   `locale` setting**, naming the consequence ("Ghost will read `locales/{site_locale}.json`;
   your translations are in `{lang}.json` and will not be used"). This is the only place
   the mismatch is visible, and it is a `GET /settings/` read the product already makes.

---

## C2 — FR-I2: "NQL has no relative-date syntax" is false; a real capability was deleted on a false premise

**PRD claim (FR-I2):**
> "**Published date is not offered:** NQL has no relative-date syntax, so 'within the
> last 30 days' cannot compile into a static `routes.yaml` at all, and a fixed date
> silently freezes — the field is dropped rather than shipped broken."

**What Ghost actually does.** `@tryghost/nql` 0.13.4, run directly:

```
published_at:>now-30d   => {"published_at":{"$gt":"2026-07-19 10:02:12"}}
published_at:>=now-30d  => {"published_at":{"$gte":"2026-07-19 10:02:12"}}
created_at:<now-1y      => {"created_at":{"$lt":"2025-08-18 10:04:54"}}
published_at:>now-30d+featured:true
  => {"$and":[{"published_at":{"$gt":"..."}},{"featured":true}]}
```

NQL has first-class relative-date literals (`now-30d`, `now-1y`, …) and they compose
with `+` / `,` / parenthesised groups.

And it does **not** freeze. The routes.yaml `filter` string is stored as a string and
handed to the API on **every request** —
`ghost/core/core/frontend/services/routing/controllers/collection.js` passes
`res.routerOptions` (which carries `filter`) into `dataService.fetchData(...)` per
request, and NQL parses it at query time. `now-30d` therefore resolves relative to the
*request*, which is exactly the semantics "within the last 30 days" needs.

**Provenance.** This claim did not come from Ghost. It originated as an unverified
assertion in an earlier internal review — `review-st-buildability.md:222` ("Ghost NQL
has **no relative-date syntax**") — was escalated to finding H1
(`review-st-buildability.md:370`), carried into `validation-report.md:194-195`, and was
then adopted into FR-I2 as settled platform fact. It was never checked against NQL.

**Why it matters.** A rolling "last 30 days" collection is one of the most-wanted
routes.yaml recipes, and the PRD forbids it in normative text on a false basis. Worse,
the PRD's confident *reason* ("cannot compile ... at all") will stop anyone downstream
from re-examining it.

**Severity: CRITICAL** — factually false and it deletes a shipped capability.

**Fix:** Restore Published date to the filter builder with relative-date semantics:
`within the last N days/weeks/months` → `published_at:>now-{N}d|w|m`, plus
`before/after {absolute date}` → `published_at:<|>{YYYY-MM-DD}`. Keep the "a fixed
date silently freezes" caution, but attach it to the *absolute* option only, where it
is true. Add the two forms to FR-I2's normative field→NQL mapping table.

---

## C3 — FR-I4: "no automated routes.yaml upload path, on any Ghost version or host" is false

**PRD claim (FR-I4):**
> "`PUT /settings/routes/yaml` requires the `setting: edit` permission and Ghost grants
> integrations `settings: ['GET']`, so the guided 'one more step' card (download button
> + Labs instructions) is the **only** upload flow... **There is no automated upload
> path, on any Ghost version or host.**"

**What Ghost actually does.** Two errors, one of which is load-bearing.

*(a) The route is `POST`, not `PUT`* —
`ghost/core/core/server/web/api/endpoints/admin/routes.js:89-96`:

```js
router.get('/settings/routes/yaml', mw.authAdminApi, http(api.settings.download));
router.post('/settings/routes/yaml',
    mw.authAdminApi,
    apiMw.upload.single('routes'),
    apiMw.upload.validation({type: 'routes'}),
    http(api.settings.upload)
);
```

There is no `PUT /settings/routes/yaml` in Ghost 6 at all.

*(b) The allowlist binds integration tokens only — and the PRD already collects a token
that bypasses it.* `ghost/core/core/server/web/api/endpoints/admin/middleware.js:17-42`:

```js
const tokenPermissionCheck = function tokenPermissionCheck(req, res, next) {
    if (!req.api_key) { return next(); }

    // CASE: user is requesting with staff token, check blocklist, else skip to permission system
    // Staff tokens have a user_id associated with them, integration tokens don't
    if (req.api_key?.get('user_id')) {
        const isDeleteAllContent   = req.method === 'DELETE' && (path === '/db/' || path === '/db');
        const isTransferOwnership  = req.method === 'PUT'    && (path === '/users/owner/' || ...);
        const isResetAuthentication= req.method === 'POST'   && (path === '/authentication/reset/' || ...);
        if (isDeleteAllContent || isTransferOwnership || isResetAuthentication) { ...NoPermissionError... }
        return next();                       // <-- allowlist never consulted
    }
    ...
    const allowlisted = { ... settings: ['GET'], themes: ['POST','PUT'], ... };
```

The staff-token blocklist is exactly three entries: delete-all-content, transfer-ownership,
reset-authentication. **Settings and themes are not on it.** A staff token falls
straight through to the permission system, where
`ghost/core/core/server/data/schema/fixtures/fixtures.json` grants:

```
Administrator: setting = all
Administrator: theme   = all
```

and `settings.upload` requires exactly `permissions: {method: 'edit'}`
(`ghost/core/core/server/api/endpoints/settings.js:167-178`).

So: **`POST /settings/routes/yaml` with the site Owner's Staff Access Token works.**
And FR-C1 *already mandates that the user provide that exact token* ("The Staff Access
Token is required, not optional"), for precisely the same class of reason — FR-J13 and
FR-J16 rely on the identical bypass to reach `GET /themes/*`. The PRD proves the
mechanism in one requirement and denies it in another.

This also settles the open item in FR-J10 — *"whether the Owner's Staff Access Token
lifts that block is a §7.6 verify-at-build item"* — **it does, definitively, in source,
for both `themes` and `settings`.** That item can be closed now rather than at build.

**Why it matters.** FR-I4 designs an entire first-class manual flow (guided card,
download button, Labs instructions, byte-for-byte drift verification, resurfacing
logic, daily health-check comparison) and FR-I5 builds a whole product argument on
top of it ("one manual Ghost Admin step fewer"). All of that is optional, not forced.
The manual flow is still worth keeping as the **fallback** for the staff-token-absent
case — but shipping it as the *only* path, when the token the product already requires
would automate it, is a self-inflicted UX cost justified by a false statement.

**Severity: CRITICAL** — a factually false platform claim that shapes a whole
requirement and its downstream product argument.

**Fix:**
1. Correct the method to `POST /settings/routes/yaml` (multipart, field name `routes`).
2. Rewrite FR-I4 as: *automated upload via the Owner's Staff Access Token is the
   primary path; the guided Labs card is the designed fallback for when the staff token
   is absent, revoked, or lacks Owner/Administrator role.* Keep FR-I4's byte-for-byte
   `GET /settings/routes/yaml` verification exactly as written — it is correct and it
   becomes the confirmation step for the automated path too.
3. Close FR-J10's §7.6 verify-at-build item with the source citation above.
4. Re-examine FR-I5's product claim, which currently trades on the manual step existing.

---

# HIGH

## H1 — FR-I2: "Ghost has no per-collection page size" is false, and contradicts the PRD's own companion

**PRD claim (FR-I2):**
> "define **collections** (URL prefix, filter, assigned template — page size is always
> the global `posts_per_page`, FR-Q1; **Ghost has no per-collection page size**)"

**What Ghost actually does.** routes.yaml collections **and** channels both accept a
`limit` key. `ghost/core/core/server/services/route-settings/route-settings-parser.ts`:

```ts
const LimitField = z.union([z.number(), z.literal('all'), z.string().regex(/^\d+$/).transform(Number)])
    .nullish().transform(v => v ?? undefined);
...
limit: LimitField,          // collection schema (line 247)
limit: LimitField,          // channel schema    (line 196)
```

And it is a page size, not a total — Ghost's own comment says so, verbatim, in
`ghost/core/core/frontend/services/routing/controllers/collection.js:31-48`
(identical block in `channel.js:32-48`):

```js
// CASE 1: routes.yaml `limit` is stronger than theme definition
// CASE 2: use `posts_per_page` config from theme as `limit` value
if (res.routerOptions.limit) {
    themeEngine.getActive().updateTemplateOptions({
        data: {config: {posts_per_page: res.routerOptions.limit}}
    });
    pathOptions.limit = res.routerOptions.limit;
} else {
    const postsPerPage = parseInt(themeEngine.getActive().config('posts_per_page'));
    if (!isNaN(postsPerPage) && postsPerPage > 0) { pathOptions.limit = postsPerPage; }
}
```

It overwrites `@config.posts_per_page` for that route and drives pagination.

**This is an internal contradiction, not just an external error.** The PRD's own
normative companion already states the truth:

- `appendix-b1-template-contexts.md:66` — "*`@config.posts_per_page` … **Not necessarily
  the `package.json` value** — a `routes.yaml` route with an explicit `limit:` overwrites
  it at render time for that route.*"
- `appendix-b1-template-contexts.md:269` — flags it as a live risk: "*a Routes-Manager
  collection with a `limit:` would make `@config.posts_per_page` unreliable*"
- `research-ghost-binding-contexts.md:201` — cites the correct file:
  "*(`services/routing/controllers/collection.js`)*"

The research was right; the distillation into FR-I2 inverted it.

**Severity: HIGH** — a false platform fact that removes a real control from the Routes
Manager, contradicting two normative companions.

**Fix:** Add an optional **Page size** field to each collection and channel in the
Routes Manager, defaulting to "use the theme default (`posts_per_page`)" and emitting
`limit: N` only when set. Correct FR-I2's parenthetical. Then resolve the B.1:269
concern the honest way: since `@config.posts_per_page` is unreliable per-route, the
main-feed section must not bind it for display purposes — which is already FR-H2's
design (the main feed uses the native paginated `posts` context, not a count).

## H2 — FR-H5 / Appendix B / FR-G3: "`{{#get}}` filters may reference only template-level context" is false, and the stated reason is wrong

**PRD claim (FR-H5):**
> "`{{#get}}` filters may reference only template-level context, never the current
> render context — this constrains the section library and is binding on FR-G3's
> registry contract."

**Appendix B repeats it with a rationale:**
> "because Handlebars is synchronous while `{{#get}}` resolves asynchronously — a
> `{{#get}}` filter may reference **only template-level context, never the current
> render context**"

**What Ghost actually does.** `ghost/core/core/frontend/helpers/get.js` interpolates
`{{...}}` inside the filter string **against `this` — the current block context**:

```js
function parseOptions(globals, data, options) {
    if (_.isString(options.filter)) {
        options.filter = resolvePaths(globals, data, options.filter);
    }
...
apiOptions = parseOptions(ghostGlobals, this, apiOptions);   // `this` = current context
```

```js
const regex = /\{\{(.*?)\}\}/g;
value = value.replace(regex, function (match, path) {
    path = pathAliases[path] ? pathAliases[path] : path;   // 'post.tags' -> 'post.tags[*].slug'
    if (path.charAt(0) === '@') { result = querySimplePath(globals, path.slice(1)); }
    else { result = querySimplePath(data, path); }          // data === current context
    return result.join(',');
});
```

So inside `{{#foreach posts}}`, `filter="id:-{{id}}"` resolves against the loop item —
this is how every "related posts" and "more from this tag" section in the Ghost
ecosystem is written, including Casper's.

The rationale is also wrong on its own terms: `{{#get}}` **is** an async helper
(`module.exports.async = true`), which is why the async story does not constrain it.

**The real restriction** is a path-segment grammar, and it is a genuinely useful
constraint the PRD should state instead:

```js
const VALID_SEGMENT = /^\w+(\[(\*|\d+)\])?$/;
...
throw new errors.IncorrectUsageError({
    message: `{{#get}} helper — unsupported path segment "${part}" in "${pathString}"`
});
```

i.e. each dot-segment must be `\w+` optionally followed by `[N]` / `[*]`. **No `../`
parent traversal, no `this.`, no subexpressions, no helpers, no quoted keys.**
`filter="id:-{{../post.id}}"` **throws** (a hard error, not an empty render). Two
aliases are predefined: `post.tags` → `post.tags[*].slug`, `post.author` → `post.author.slug`.
`ghostGlobals = _.omit(data, ['_parent','root'])`, so `@member.uuid` / `@site.*` /
`@index` work but `@root` and `@_parent` do not.

**Severity: HIGH** — the false restriction is explicitly "binding on FR-G3's registry
contract", i.e. it is currently constraining what the entire section library may
express, and it forecloses the single most common dynamic-section pattern in Ghost
theming (related/more-like-this feeds).

**Fix:** Replace the sentence in FR-H5 and in Appendix B with the real rule:
*"`{{#get}}` filters may interpolate `{{path}}` against the current render context and
against `@`-globals. Each dot-segment must match `^\w+(\[(\*|\d+)\])?$` — no `../`,
no `this.`, no subexpressions, no helpers; a violating path throws `IncorrectUsageError`
at render, so the registry must validate section-declared filter paths against that
grammar at authoring time."* Then reconsider which sections the library can now offer.

## H3 — FR-Q5 × gscan `GS100`: always-compiled dark built-ins can hard-fail the deploy gate

**PRD claim (FR-Q5 / FR-Q2):**
> "**Dark-mode built-ins:** Light+Dark projects **always compile three built-in custom
> settings** — `color_scheme` …, **Dark accent color** (color…), and **Dark logo**
> (image; falls back to the light logo when unset)"

**What gscan actually does.** `GS100-NO-UNUSED-CUSTOM-THEME-SETTING` is an **error**,
and it fires per declared-but-unreferenced key
(`gscan/lib/checks/100-custom-template-settings-usage.js`):

```js
const config = Object.keys(theme.customSettings);
const notUsedVariable = config.filter(x => !result.customThemeSettings.has(x));
notUsedVariable.forEach((name) => {
    log.failure({message: `config.custom.${name} is declared but never referenced from a template`,
                 ref: 'package.json'});
});
```

Verified empirically above: declaring one unreferenced setting turns a clean theme into
`ERROR GS100-NO-UNUSED-CUSTOM-THEME-SETTING` on both v5 and v6.

**Why it matters.** "Always compile" collides with "must always be referenced".
The concrete break: **`dark_logo`.** A Light+Dark project whose header uses a text
wordmark rather than an image logo — a common, fully supported design in any section
library — has no `{{@custom.dark_logo}}` anywhere in its templates. The compile then
fails FR-J6's gate with a hard error and the deploy is blocked, on a project the user
did nothing wrong in. Same exposure for `dark_accent` if a pack's dark accent is only
consumed through baked CSS rather than the inline token block, and for `color_scheme`
if a Light+Dark project's mode switching is ever emitted as pure CSS with no
`{{@custom.color_scheme}}` read (FR-Q5's "Auto follows the visitor's system preference
in pure CSS" is exactly the shape that risks this).

**Severity: HIGH** — a mandated compiler behaviour that can hard-block deploy for a
legitimate design.

**Fix:** Make the three built-ins **conditional on being referenced**, not
unconditional: declare a built-in in `package.json` only when the assembled templates
actually contain its `{{@custom.*}}` read. Keep the *slot reservation* (FR-Q2's 3-of-20)
unconditional — reserving a slot costs nothing and preserves the uniform cap — but
decouple reservation from emission. Add a compiler post-pass asserting
`declared_keys ⊆ referenced_keys` and failing the build with an Inflozo-side message
before gscan sees it, since gscan's message ("declared but never referenced from a
template") is not actionable for a user who never saw a `package.json`.

## H4 — FR-J3 / FR-J6: the 0/0 gate has three literal requirements the PRD never states

The spike hits 0/0 **by construction, not by luck** — `theme-output/assets/css/main.css`
contains all of:

```css
--gh-font-heading: var(--font-heading, ui-sans-serif, system-ui, sans-serif);
--gh-font-body:    var(--font-body, ui-serif, Georgia, serif);
.kg-width-wide { max-width: 1000px; margin-inline: auto; }
.kg-width-full { max-width: 100%; }
```

and `page.hbs:5` has `{{#if @page.show_title_and_feature_image}}`. **The PRD documents
only the third.** The other two are undocumented preconditions of its own headline
target, and both are easy to lose:

**(a) `.kg-width-wide` / `.kg-width-full` are ERRORS and are *not* skippable via
`card_assets`.** In `gscan/lib/specs/`, most Koenig card rules carry a
`cardAsset: 'gallery'|'bookmark'` key and are skipped when card assets are on — but
`GS050-CSS-KGWW` and `GS050-CSS-KGWF` carry **no** `cardAsset` key, so they are
unconditional `level: 'error'` for every v6 theme. FR-J3 says *"Section CSS is emitted
only for placed sections; global CSS = token block + base/reset + shared primitives +
`cards.css`"* — if `cards.css` is ever made conditional on Koenig cards being present,
or if a CSS minifier/purger drops selectors no template references (`.kg-*` classes
appear only in *post body HTML*, which the compiler never sees), the compile turns
**red**, not merely warned.

**(b) `GS051-CUSTOM-FONTS` is a warning that fires unless `--gh-font-heading` **and**
`--gh-font-body` both appear in the *same file*.** `gscan/lib/specs/v5.js:751-756`:

```js
'GS051-CUSTOM-FONTS': { level: 'warning',
    rule: `Missing support for custom fonts`,
    regex: /^(?=[\s\S]*--gh-font-heading)(?=[\s\S]*--gh-font-body)/ }
```

Both lookaheads are anchored at `^` of the same string, so they must co-occur in one
`.css` or `.hbs` file. This sits in direct tension with FR-J3's self-hosted-fonts
mandate: the compiler must emit *Ghost's* font-variable names regardless, purely to
keep the warning count at zero. The spike's `var(--gh-font-heading, var(--font-heading, …))`
indirection is the right trick and should be normative, not incidental.

**Severity: HIGH** — FR-J6's "0 errors, 0 warnings … confirmed empirically" is true
today but rests on three unstated invariants, one of which is an error-level trip.

**Fix:** Add to FR-J3 as normative emission rules: *"global CSS always emits
`--gh-font-heading` and `--gh-font-body` in the token block (aliasing the project's
self-hosted faces), and always emits `.kg-width-wide` / `.kg-width-full`; `cards.css`
is unconditional and is exempt from any unused-selector pruning."* Add all three to
FR-J6's compile-validation assertions so they are caught by Inflozo before gscan,
with an actionable message.

---

# MEDIUM

## M1 — FR-Q2: "Site wide" is not a Ghost group value

**Claim:** "Ghost Admin group (**Site wide** / Homepage / Post)".

**Actual** (`gscan/lib/checks/010-package-json.js:176-180`):

```js
const knownSettingsGroups = new Set(['post', 'homepage']);
// Ignore undefined values as "groups" is an optional property
if (customSettingsKeys.some(key => typeof packageJSON.config.custom[key].group !== 'undefined'
        && !knownSettingsGroups.has(packageJSON.config.custom[key].group))) {
    markFailed('unknownCustomThemeSettingsGroup');
}
```

There are exactly **two** group values. "Site wide" is what Ghost Admin shows when
`group` is **omitted** — it is the absence of a group, not a value. Emitting
`group: "site wide"` trips `GS010-PJ-CUST-THEME-SETTINGS-GROUP`
(verified empirically: `RECOMMENDATION` on both v5 and v6 — not a warning, so it does
not break FR-J6's 0/0 counter, but the setting also does not land where intended).

**Fix:** Restate FR-Q2 as *"Ghost Admin group: **Site wide** (emit no `group` key) ·
**Homepage** (`group: "homepage"`) · **Post** (`group: "post"`)"*. Add a compile
assertion that `group` is either absent or one of those two literals.

## M2 — FR-Q5 / Appendix D: color-setting defaults must be 6-digit hex

`gscan/lib/checks/010-package-json.js`, `case 'color'`:

```js
if (!/^#[0-9a-f]{6}$/i.test(entry.default)) { markFailed('invalidCustomThemeSetingColorDefault'); }
```

**`level: 'error'`.** No 3-digit shorthand (`#fff` → verified `ERROR` empirically), no
8-digit alpha (`#rrggbbaa`), no `rgb()`, no named colors, and **a missing default also
fails**. FR-Q5's "Dark accent color (color; default = the pack's hand-paired dark
accent)" and FR-Q3's accent promotion both feed Appendix D's pack values straight into
this. Appendix D does not state a hex format anywhere.

**Fix:** Make "accents are stored and emitted as `#rrggbb`" normative in Appendix D,
and normalise at compile (expand shorthand, strip alpha, reject named colors) rather
than trusting the pack table.

## M3 — FR-J2: the `package.json` spec omits two gscan-required keys and a type rule

FR-J2 lists: "project-derived name/description/version; `card_assets: true`; standard
`image_sizes` map; `posts_per_page` from Theme Settings; `custom` = …". Missing:

| Requirement | gscan rule | Level |
|---|---|---|
| `author.email` present **and** a valid email | `GS010-PJ-AUT-EM-REQ` / `-AUT-EM-VAL` | **error** |
| `keywords` array containing `"ghost-theme"` | `GS010-PJ-KEYWORDS` | warning |
| `name` lowercase, `/^([a-z0-9]+-)*[a-z0-9]+$/` | `GS010-PJ-NAME-LC` / `-NAME-HY` | **error** |
| `version` semver-valid | `GS010-PJ-VERSION-SEM` | **error** |
| `config.posts_per_page` a **number** ≥ 1 | `GS010-PJ-CONF-PPP-INT` | **error** |

The last one is a live trap: `"posts_per_page": "12"` (a string, e.g. straight out of a
form field) is an **error**, while *omitting* it is only a recommendation. Also worth
recording: **`image_sizes` is never validated by gscan** (zero occurrences across
`lib/checks/` and `lib/specs/`), so FR-J2's "standard `image_sizes` map" is
unconstrained by the gate — its correctness is entirely Inflozo's problem, and
`{{img_url size="x"}}` with an unknown `x` **silently returns the unsized URL**
(`ghost/core/core/frontend/utils/images.js`).

The spike's `package.json` already carries `author.email` and the `ghost-theme` keyword
— the PRD just never says they are required.

**Fix:** Enumerate the full required `package.json` shape in FR-J2, and coerce
`posts_per_page` to an integer at compile.

## M4 — FR-H2 / FR-H5: `{{#get}}` limit is capped at 100, and >100 is a new v6 gscan warning

`ghost/core/core/shared/max-limit-cap.js`:

```js
// After Ghost 6.x we only allow a max limit of 100.
get maxLimit() { return config.get('optimization:maxLimit') || 100; }
...
if (limit === 'all') { return limitConfig.maxLimit; }   // 'all' silently becomes 100
```

and gscan v6 adds two warnings: `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and
`GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`. FR-H2's Data control group exposes a **Count**
with no stated ceiling; a user setting Count = 150 on a `{{#get}}`-driven section emits
`limit="150"`, which (a) is silently capped to 100 at render and (b) costs a gscan
warning against FR-J6's 0-warning target.

**Fix:** Cap the Count control at 100 in the editor with the reason stated inline, and
add a compile assertion. Note Appendix B already says "max 100 per page" for editor
reads — extend the same rule to compiled `{{#get}}`.

## M5 — FR-Q6: user overrides are ICU MessageFormat and are never validated

The legacy `{{t}}` backend runs every string — **including the fallback** — through
`intl-messageformat` (`ghost/core/core/frontend/services/theme-engine/i18n/i18n.js`):

```js
let msg = new MessageFormat(string, currentLocale);
try { msg = msg.format(bindings); }
catch (err) {
    this._handleFormatError(err);
    msg = new MessageFormat(this._fallbackError(), currentLocale);   // "An error occurred"
    msg = msg.format();
}
```

So `{` and `}` are **syntax**, not literals. A user override containing a stray brace
(`"50% off {"`, or a Spanish string with a literal `{`) throws at render and the
visitor sees **"An error occurred"** in place of the label — on the live site, on every
page that renders it. FR-Q6 describes the Translations surface as a free-text override
list with no validation.

**Fix:** Validate every override by compiling it with `intl-messageformat` at save
time, and reject/flag failures in the Translations surface. Also assert that the
override's placeholder set matches the catalog entry's declared set (a missing
placeholder renders empty; an extra one throws).

## M6 — Appendix B: the `@member` shape is incomplete

**Claim:** "`@member` … null | { name, email, status: free/paid/comped, paid flag }".

**Actual** (`ghost/core/core/frontend/services/theme-engine/middleware/update-local-template-options.js`):

```js
const member = req.member ? {
    uuid, email, name,
    firstname: req.member.name && req.member.name.split(' ')[0],
    avatar_image,
    subscriptions: [...],
    paid: req.member.status !== 'free',
    status
} : null;
```

Missing from the catalog: **`uuid`, `firstname`, `avatar_image`, `subscriptions`**.
`firstname` and `avatar_image` are exactly what a member-greeting or member-home
section wants, and `subscriptions` is what a "manage your plan" surface needs — the
catalog currently forecloses all three.

Two related facts the catalog should carry: `@member` is `null` (never `undefined`,
never `{}`) so `{{#if @member}}` is the correct guard unconditionally; and
`{{#has any="@member"}}` is **always false**, because `has.js` only picks
`['site','config','labs']` out of the data frame.

## M7 — Appendix B: `{{#get}}` resources listed wrong

**Claim (FR-H1 / Appendix B):** "the Ghost Content API resources — **Posts, Pages,
Tags, Authors, Tiers, Settings**".

**Actual** (`ghost/core/core/frontend/helpers/get.js`):

```js
const RESOURCES = {
    posts: {alias: 'postsPublic'},       tags:    {alias: 'tagsPublic'},
    pages: {alias: 'pagesPublic'},       authors: {alias: 'authorsPublic'},
    tiers: {alias: 'tiersPublic'},       newsletters: {alias: 'newslettersPublic'}
};
```

**`settings` is not a `{{#get}}` resource** (it is reached as `@site`), and
**`newsletters` is missing** from the catalog. Since Appendix B is normative and the
shim contract (FR-H5) is written against it, both should be corrected: `newsletters`
is directly relevant to A-series subscribe/newsletter sections.

## M8 — Appendix B: `@site.lang` is correct for the API and a gscan **error** in a theme

**Claim:** "The Content API `/settings/` response exposes the site language as **both
`lang` and `locale`** — the same value under two keys… an implementation that reads
`lang` gets the same string".

True at the API — `ghost/core/core/shared/settings-cache/public.js` maps both
`lang: 'locale'` and `locale: 'locale'` onto the same underlying setting. But in
compiled `.hbs`, both spellings are **error-level** gscan trips:
`GS001-DEPR-SITE-LANG` (`/@site\.lang/g`) and `GS001-DEPR-LANG` (`/{{\s*?lang\s*?}}/g`).
Since Appendix B is normative for the compiler as well as the editor, the sentence
needs a scope marker — otherwise it reads as permission to emit `{{@site.lang}}`,
which fails the build.

**Fix:** Append: *"`lang` is readable via the Content API only; compiled templates must
emit `{{@site.locale}}` — `{{@site.lang}}` and `{{lang}}` are gscan errors."*

## M9 — FR-H5: `{{img_url}}` does not emit `srcset`

**Claim (FR-H5):** "`{{img_url}}` (emitting Ghost-shaped sized URLs and `srcset`, not
pass-through — NFR-6)".

The real helper returns a single URL string; `srcset` appears in no Ghost helper.
Themes build `srcset` by concatenating several `{{img_url … size="x"}}` calls by hand
(which is what FR-J5 correctly implies). The FR-H5 sentence conflates the *shim's*
output (markup, srcset included) with the *helper's* output (one URL), and FR-H5 is the
shim's contract, so a contract test written literally against it would test the wrong
thing.

Two behaviours the shim contract should pin, both from source: an **unknown `size=`
silently degrades to the unsized URL** (`ghost/core/core/frontend/utils/images.js`), and
a **`null` image renders empty silently while an `undefined` property renders empty
plus a per-render server warning** — which is the real reason FR-H8's media guards
matter, and a stronger argument than the one FR-H8 currently gives.

**Fix:** Reword to *"`{{img_url}}` (returns one Ghost-shaped sized URL; the shim
composes the multi-call `srcset` the compiler emits — NFR-6)"*.

## M10 — Forward risk: the `themeTranslation` labs flag changes translation semantics

`themeTranslation` is currently a **private** labs flag, so the legacy
`intl-messageformat` backend is what ships. When Ghost promotes it, `{{t}}` moves to
i18next, configured (per `packages/i18n`) with `keySeparator: false`, `nsSeparator: false`
and `interpolation = {prefix:'{', suffix:'}'}`.

Good news: `keySeparator: false` means FR-Q6's **flat dotted keys keep working** —
i18next will not try to interpret `pagination.older_posts` as a nested path. But the
file-resolution and fallback behaviour differ in detail (the i18next path explicitly
tries `{locale}.json` then `en.json` then an empty resource, and layers
`fallbackLng: ['en']` on top), and the interpolation engine changes from ICU to
i18next's simpler `{name}` substitution — which means **ICU plural/select syntax in an
override would stop working**, silently.

**Fix:** Add to §7.6 as a watch item, and constrain the catalog to plain `{placeholder}`
interpolation only — no ICU plural/select forms — so both backends behave identically.
This costs nothing today and removes the migration entirely.

---

# LOW

- **L1 — FR-I4 method name.** `PUT /settings/routes/yaml` → **`POST`** (see C3). Covered
  by C3's fix but worth calling out separately since the string appears in FR-I4 verbatim.
- **L2 — NQL silently mis-parses doubled parentheses.** `nql('((tag:news))').parse()`
  returns `{"yg":{"tag":"news"}}` — garbage, with no error. `(tag:news)` and
  `((tag:news,tag:tech)+featured:true)` are both fine. Since FR-I2's builder emits
  parentheses mechanically from All/Any groups, it must **not** emit a group wrapper
  around a single nested group or a single condition. Add a normalisation pass + a unit
  test. (FR-I2's parenthesised-nesting rule itself is **correct** — verified below.)
- **L3 — gscan can crash on a malformed `visibility` string.**
  `entry.visibility.match(/[a-zA-Z_][a-zA-Z0-9_.]+:/).map(...)` — non-global regex, and
  `.match()` returns `null` when there is no `key:` token, so `.map` throws a TypeError.
  This runs in `validatePackageJSONFields`, outside `applyRule`'s guard, so it propagates.
  Never emit a `visibility` value without at least one `key:` token. (Corollary: the
  non-global regex means only the **first** clause of `"a:true+b:false"` is validated —
  don't rely on gscan to catch a bad second reference.)
- **L4 — `GS001-DEPR-CURR-SYM` is an error on the bare string `currency_symbol`.**
  Regex `/currency_symbol/g` over template content — it does not care about context. A
  pricing section with a class like `.price__currency_symbol`, or an HTML comment
  mentioning it, is an **error**. Relevant because FR-J1 mandates "class names derive
  from section names".
- **L5 — `GS001-DEPR-CSS-PATS` is an error on `.page-template-*` CSS selectors**
  (`/\.page-template-\w+[\s{]/g`), and `GS001-DEPR-CSS-AT` on `.archive-template`. Same
  FR-J1 class-name-derivation exposure. Add both to the compiler's reserved-class-name
  denylist.
- **L6 — `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` is new in v6 and *fatal*.**
  `{{#if}}` / `{{#unless}}` must take **exactly one** argument (`node.params.length !== 1`).
  FR-H8 mandates `{{#if}}` guards on every bound prop, so the compiler must never emit
  a two-argument or zero-argument conditional. Also new-and-fatal in v6:
  `GS130-NO-RECURSIVE-LAYOUT` (a `{{!< default}}` inside `default.hbs` trips it).
- **L7 — `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a warning, not an error**, and it
  requires `@page.show_title_and_feature_image` to appear **anywhere in the theme**, not
  specifically in `page.hbs` (the `ref: page.hbs` in the output is cosmetic). FR-I1's
  "gscan's `GS110-…` requires it" is directionally right; the severity and the
  file-scoping are both slightly overstated. Sibling rule
  `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` (warning) fires on **any other** `@page.x`.

---

## Verified correct

Everything below I checked against Ghost/gscan source or ran, and it holds. Do not
re-litigate these.

**Auth, tokens and endpoints**

1. **`GET /admin/site/` is unauthenticated.** `routes.js:20` mounts it on
   `mw.publicAdminApi`, whose chain is `[cors, urlRedirects, prettyUrls, tokenPermissionCheck]`
   — **no `authenticate` step**. FR-C2's refusal to validate credentials with it is
   exactly right, and the reasoning is right.
2. **`GET /admin/config/` is authenticated** (`routes.js:23`, `mw.authAdminApi`) and
   `config: ['GET']` is on the integration allowlist. FR-C2 confirmed.
3. **`/config/` carries `version` and `hostSettings`.** The output serializer
   (`.../serializers/output/config.js`) picks exactly `['version', … 'hostSettings', …]`.
   FR-C2's plan probe has a real field behind it.
4. **`customThemes` is a real limit**, checked on both install and upload
   (`server/api/endpoints/themes.js:53, 116`). FR-C2's Preview-only auto-detection is
   well-founded.
5. **Integration tokens get `themes: ['POST','PUT']`, so every `GET /themes/*` is 403.**
   Verbatim in `admin/middleware.js:62`. FR-J13's central premise is exactly correct, on
   every version and host, as claimed.
6. **Integration tokens get `settings: ['GET']`.** Verbatim, `admin/middleware.js:74`.
   FR-I4's premise about *integration* tokens is correct (the error is only the
   "no path on any host" generalisation — C3).
7. **`GET /settings/routes/yaml` needs only `setting: browse`**
   (`api/endpoints/settings.js:180-197`, `permissions: {method: 'browse'}`) and *is*
   reachable. FR-I4's byte-for-byte verification design is sound and should be kept
   verbatim.
8. **`POST /settings/routes/yaml` needs `setting: edit`** (`settings.js:167-178`).
   Correct — the PRD only got the method letter and the reachability wrong.
9. **`GET /themes/:name/download` exists** (`routes.js:239`) — relevant to FR-J13/J16's
   snapshot and drift reads via the staff token.

**Compiler / gscan**

10. **`GS010-PJ-GHOST-API-PRESENT` is `level: 'warning'` on both v5 and v6.** Defined in
    `gscan/lib/specs/v4.js:33-38` and `v5.js:22-27`, never overridden in v6. Verified
    empirically both ways. FR-J1's decision to omit `engines.ghost-api` is correct and
    its stated reason is correct. The v3/v4 counterpart rules
    (`GS010-PJ-GHOST-API`, `-V01`, `-V2`) are explicitly `delete`d for v5/v6
    (`010-package-json.js:303-306, 328-331`), so **omitting the key costs nothing** —
    which is the non-obvious half of the claim, and it's right.
11. **0 errors / 0 warnings on `spike-compiler/theme-output/` under gscan 6.4.2, on
    both v5 and v6.** Reproduced from scratch. A newer gscan does not change the verdict.
12. **gscan 6.4.2 is exactly what Ghost 6.58 bundles**, so FR-J6's pin policy ("at or
    above the newest version bundled by any supported target") is satisfiable today with
    the version I tested.
13. **Ghost checks uploads against `v${majorVersion}`** (`themes/validate.js`), so a v6
    host runs the v6 spec — FR-J6's dual-spec gate is the right shape.
14. **The 20-setting cap is real** — `if (customSettingsKeys.length > 20)`,
    `010-package-json.js:162`, `level: 'error'`. FR-Q2's cap and meter confirmed.
15. **Exactly five custom-setting types**, verbatim:
    `new Set(['select','boolean','color','image','text'])`. FR-Q2's "Ghost's exact five"
    confirmed.
16. **Image settings must not carry a default** — `case 'image': if (entry.default) markFailed(...)`.
    FR-Q2 confirmed.
17. **snake_case keys required** — `/^[a-z0-9]+[a-z0-9_]*$/`. FR-Q2's key generation
    confirmed.
18. **`select` defaults are validated against `options`** (and `options` needs ≥ 2
    entries). FR-Q2's "validates select defaults against options" confirmed.
19. **`visibility` conditions are NQL** and are validated as such. FR-Q2's optional
    visibility condition is real.
20. **`COMPRESSED_TOO_LARGE` / `ENTRY_TOO_LARGE` / `TOTAL_TOO_LARGE` are the real error
    codes**, verbatim in `server/services/themes/upload-size-limit-reporter.js`, and the
    error details carry `observedBytes` / `limitBytes` / `entryName` — so FR-J3's
    "probe the real limits on the §4 targets" is not only possible, Ghost hands you the
    limit in the error body.
21. **gscan follows partials transitively** for custom-setting usage — verified
    empirically. FR-J1's partial-extraction mandate does not endanger GS100.
22. **`@custom`, `@site`, `@member`, `@page`, `@config` are all on gscan's known-globals
    allowlist** (`gscan/lib/ast-linter/rules/internal/scope.js:4-31`, plus `setting`,
    `labs`, and the `{{#foreach}}` frame vars). Nothing in the PRD's binding vocabulary
    trips `GS120-NO-UNKNOWN-GLOBALS`.
23. **`locales/*.json` only needs to parse** — gscan imposes no filename or key
    requirements (`070-theme-translations.js`). Correct as a *fact*; it is also why C1
    is invisible to the gate.

**Rendering, templates, context**

24. **`page-{slug}.hbs` outranks the user's Template-dropdown choice.**
    `rendering/templates.js` `getEntryTemplateHierarchy` unshifts `custom_template`
    first and `slugTemplate` **last**, so the resolution order is
    `[page-{slug}, custom-*, page, post]`. FR-I1's "never emit `page-{slug}.hbs`" rule
    and its stated reason are exactly right — this is a genuinely non-obvious trap and
    the PRD caught it.
25. **Custom templates are `custom-*.hbs` at the theme root, bound via the page's own
    `custom_template` column** (`postObject.custom_template` in the same function).
    FR-I1's membership-page mechanism is correct, and the "survives a retitle" claim
    follows directly.
26. **There is no members template family in Ghost 6.** Grepping the whole
    `frontend/` and `routing/` trees for `members/signup`, `members/signin`,
    `members/account` returns nothing. FR-I1's demolition of the fossil is correct — and
    `research-ghost-membership-pages.md:715` independently identifies the source
    (`TryGhost/Starter` ships the files with no routes.yaml).
27. **`content-cta.hbs` is the real paywall override point.**
    `frontend/helpers/content.js`: `return templates.execute('content-cta', this, {data});`,
    reached when `!_.isUndefined(this.access) && !this.access`. FR-H6/FR-J5 confirmed.
    The theme's `partials/content-cta.hbs` shadows the core default via `partialsDir`.
28. **`post.hbs` does not expose the post at top level.** `rendering/format-response.js`
    returns `{post: {...}}` (plus a `page` alias on pages); `body_class.js` reads
    `this.post || this.page`. Appendix B.1's central axis claim and FR-H7's
    single-resource rule are confirmed at source.
29. **`tag.hbs` / `author.hbs` expose `posts`, `pagination`, and a top-level `tag` /
    `author` object.** `render-entries.js` + `format-response.js`. Appendix B.1 confirmed.
30. **Tag and author archives are natively paginated with `/page/N/`.**
    `taxonomy-router.js` mounts `controllers.channel` and
    `urlJoin(permalinks, 'page', ':page(\\d+)')`; `meta/paginated-url.js` builds
    `/page/N/` for N>1 and the bare base URL for page 1. FR-H2's premise — that archives
    paginate identically to collections, so a fixed-Count `{{#get}}` feed would repeat —
    is correct.
31. **`{{pagination}}` throws** ("used outside of a paginated context") rather than
    rendering empty. Appendix B.1's exception table is right, and this is one of only two
    hard failures in the theme layer.
32. **Ghost compiles templates without strict mode**, so out-of-context bindings render
    empty with no error at build, deploy or runtime — the entire justification for
    FR-H7's prevention-not-warning stance. Confirmed.
33. **FR-I2's field→NQL mappings all parse correctly**, verified against
    @tryghost/nql 0.13.4:
    `tag:recipes` · `author:jane` · `primary_tag:news` · `primary_author:jane` ·
    `featured:true` / `featured:false` · `visibility:public|members|paid` ·
    `feature_image:-null` → `{"feature_image":{"$ne":null}}`. All correct.
34. **FR-I2's All/Any → `+` / `,` with parenthesised nesting is correct**:
    `(tag:news,tag:tech)+featured:true` → `{"$and":[{"$or":[…]},{"featured":true}]}`, and
    `(tag:news,tag:tech)+(visibility:public,visibility:paid)` nests correctly. (Only the
    doubled-paren edge case in L2 needs guarding.)

**Data surface**

35. **Ghost seeds an active paid tier at install**, byte-for-byte as the PRD says.
    `data/schema/fixtures/fixtures.json`:
    `{"name":"Default Product","slug":"default-product","type":"paid","active":true,
    "visibility":"public","currency":"usd","monthly_price":500,"yearly_price":5000}`
    — i.e. $5/mo and $50/yr, public, active, on a site that has never seen Stripe.
    FR-H6's "single most likely way a generated membership page ships broken" is a real
    trap and the PRD's read of it is exact. `research-ghost-membership-pages.md:510-511`
    quotes the same fixture correctly.
36. **`@site.paid_members_enabled` exists** as a public setting
    (`shared/settings-cache/public.js:42`). FR-H6's gate has a real field behind it.
37. **Every `@site` key is always defined, `null` when unset.**
    `shared/settings-cache/cache-manager.js:240-250`:
    ```js
    let settings = Object.fromEntries(Object.keys(this.publicSettings).map(key => [this.publicSettings[key], null]));
    for (const newKey in this.publicSettings) { settings[newKey] = this._doGet(this.publicSettings[newKey]) ?? null; }
    ```
    The cache pre-seeds the whole allowlist to `null` then overwrites. FR-H8's
    "`{{#if @site.x}}` is sufficient in all cases" and Appendix B.1 §2 are both exactly
    right, for the exact reason they state.
38. **The seven site-wide social fields landed in 6.36.0.** Bisected:
    `linkedin` is absent from `public.js` at `v6.35.0` and present at `v6.36.0`
    (and at 6.37/6.38/6.40). The seven are `threads, bluesky, mastodon, tiktok, youtube,
    instagram, linkedin` — `facebook` and `twitter` predate them. FR-H7's version-gating
    example is precise to the minor version.
39. **`{{#has}}` is not a null check and is false for numbers and booleans.**
    `helpers/has.js` `evaluateList` uses `_.has(obj, prop) && !_.isEmpty(_.get(obj, prop))`,
    and lodash `_.isEmpty` is `true` for every primitive number and boolean. So
    `{{#has any="reading_time"}}` on `reading_time: 5` is **false**. FR-H8's warning is
    correct and correctly reasoned. (Two bonus facts worth adding: `{{#has}}` lowercases
    property names, and `@`-lookups see only `site`/`config`/`labs`, so
    `{{#has any="@member"}}` is always false.)
40. **`@site` exposes both `lang` and `locale` mapping to the same underlying setting**
    (`public.js`: `lang: 'locale', locale: 'locale'`). Appendix B's observation is
    correct — it just needs the scope marker in M8.
41. **Ghost 6 caps list reads at 100 and no longer honours `limit=all`.**
    `shared/max-limit-cap.js` — "After Ghost 6.x we only allow a max limit of 100".
    Appendix B's query rule confirmed.
42. **`@member` is `null` for logged-out visitors and when members are disabled**, so
    `{{#if @member}}` is safe unconditionally. Appendix B.1 §2 confirmed at
    `update-local-template-options.js`.
43. **`{{#foreach}}` exposes `@index @number @key @first @last @even @odd @rowStart
    @rowEnd`.** Confirmed in `helpers/foreach.js`. (Two gotchas for the section library,
    not PRD errors: `@even` is `index % 2 === 1`, i.e. it tracks the 1-based `@number`
    so the first item is `@odd`; and `@rowStart`/`@rowEnd` are permanently `false`
    without a `columns=` hash.)
44. **`{{navigation}}` and `{{pagination}}` resolve theme partials named `navigation`
    and `pagination`**, which shadow Ghost's core defaults via `partialsDir`. FR-J1's
    "extract Ghost-content repeats into real partials invoked with no parameters" is the
    correct mechanism for both.
45. **`@config` carries `posts_per_page` and `image_sizes`** and is populated per-request
    in `update-global-template-options.js`. Appendix B.1 §2 confirmed (including its
    correct caveat about `limit:` — see H1).
46. **Ghost's own upload path re-runs gscan** (`themes/validate.js` requires `gscan` and
    calls `checkZip`/`check` with `checkVersion` and `labs`), and activation is gated on
    `!results.hasFatalErrors`. FR-J13's "Ghost validates every upload with its own gscan,
    so an old theme can be rejected on the way back in" is correct — with the useful
    refinement that Ghost blocks *activation* on **fatal** errors specifically, which is
    a narrower set than gscan's full error list.

**Research companions**

47. Spot-checks of `research-ghost-membership-pages.md` (§6 tier fixture at :510-511,
    §1/§9/§12 members-template findings) and `research-ghost-binding-contexts.md`
    (:201 on `limit:` overwriting `@config.posts_per_page`, citing
    `services/routing/controllers/collection.js`) all match current source exactly. The
    research files are trustworthy; **the defects in this review are almost entirely in
    the PRD body's distillation of them**, not in the research. The `limit:` case (H1)
    is the clearest instance: the research is right, the companion is right, and the PRD
    body asserts the opposite.

---

## What I could not verify

- **Ghost(Pro) Starter's 5 MB theme limit and the Starter/Publisher/Business lineup.**
  Host-side configuration, not in the open-source tree. The *mechanism* is confirmed
  (`limitService.isLimited('customThemes')`, `hostSettings.limits` in `/config/`), and
  the error codes carry `limitBytes`, so FR-J3's "probe the real limits on the §4
  targets" is the right approach and is achievable — but the specific numbers remain
  unverified from source.
- **Admin API rate limits on theme upload.** Ghost core's `spam` config
  (`shared/config/defaults.json:98+`) covers only authentication endpoints
  (`user_login`, `user_reset`, `global_block`, …) — there is **no** core rate limit on
  `POST /themes/upload`. FR-J11's 10/hour is therefore Inflozo's own policy, which is
  fine; any additional throttling on Ghost(Pro) is edge-side and, as FR-H4 already
  says, not modellable from here.
- **Portal's `data-portal` action set** (Appendix B). Portal lives in a separate
  package outside the sparse checkout; `research-ghost-membership-pages.md` §4 claims
  it was read from Portal's source and the PRD flags it as re-verified per Ghost minor.
  I did not independently re-derive it.
- **Appendix H-1's 131-key catalog** was not audited key-by-key against anything —
  there is nothing in Ghost to audit it *against*, since gscan imposes no key
  requirements and `{{t}}` accepts any string. Its correctness is entirely an internal
  consistency question, except for the ICU-syntax constraint in M5 and the fallback
  behaviour in C1, both of which bind it.

---

## Suggested triage order

1. **C1 (locale file)** — one-line emission change (`always ship en.json`) plus a
   pre-deploy mismatch warning. Highest severity, smallest fix, and it is invisible to
   every existing gate.
2. **C3 (routes.yaml upload)** — closes an open §7.6 item, removes a manual step, and
   corrects a factual statement. The staff token is already collected.
3. **H3 (GS100 × dark built-ins)** — can hard-block deploys for ordinary designs;
   fix is "declare only what's referenced".
4. **C2 + H1 (NQL relative dates, per-collection limit)** — both restore deleted
   capability; both are contradicted by material already in the workspace.
5. **H4 (undocumented 0/0 preconditions)** — write the three invariants down and assert
   them in compile validation before they are lost to a refactor.
6. **H2 (`{{#get}}` filter context)** — unblocks related-posts-class sections; replace
   the false restriction with the real segment grammar.
7. Everything in MEDIUM, most of which is one sentence each in FR-J2, FR-Q2, Appendix B.
