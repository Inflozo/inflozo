---
title: Verification of mechanical [Ghost truth] claims from validation-report.md
status: verification
created: 2026-08-18
---

# Verification of mechanical [Ghost truth] claims

Independent verification of the 17 findings tagged **[Ghost truth]** in the `### Medium (54)` (10 findings) and `### Low (25)` (7 findings) sections of `validation-report.md`. Posture: skeptical of the claim, not of the PRD. Nothing below is asserted from memory; every verdict cites a file read from primary source, and every gscan severity was additionally proved by running gscan against a fixture that triggers it.

## Sources actually used

| Source | Pin | How read |
|---|---|---|
| Ghost `main` (= 6.x line, `ghost/core` version `6.58.0-rc.0`) | `291bddb60954491c10f2b744dc7efd94eff2e7a5` | raw.githubusercontent + GitHub trees API |
| Ghost `5.x` branch | `85a96d1588e3bdf04dcd2dadc6d01cf4da79c4a0` | raw.githubusercontent |
| gscan `6.4.2` (npm; identical to gscan `main` @ `b26772567a44506c51c13fa89f86d3df0b6684ec`) | `6.4.2` | `npm install gscan`, source read + **executed** against fixtures |
| `@tryghost/nql` `0.13.1` (gscan's bundled copy) | `0.13.1` | executed |
| `intl-messageformat` `5.4.3` (the version `ghost/core/package.json` pins) | `5.4.3` | executed |

gscan fixtures were run under **both** `checkVersion: 'v5'` and `checkVersion: 'v6'` wherever the claim touches severity or version scope.

---

## Summary table

| # | Claim (short) | Verdict |
|---|---|---|
| 1 | `"Site wide"` is not a valid custom-settings group | **PARTIALLY CORRECT** — group fact right; "doesn't land where intended" is **false** |
| 2 | Colour defaults must be 6-digit hex, error level | **CONFIRMED** |
| 3 | `package.json` required keys + `posts_per_page` type rule | **CONFIRMED** (one rule-code label to fix) |
| 4 | `{{#get}}` limit capped at 100; new v6 gscan warnings | **PARTIALLY CORRECT** — Ghost **6 only**; cap is config-overridable; v5 unaffected |
| 5 | Translation overrides are ICU and never validated | **PARTIALLY CORRECT** — never validated ✓, but a stray brace is **worse** than stated: whole-page 500, not "An error occurred" |
| 6 | `@member` missing `uuid`, `firstname`, `avatar_image`, `subscriptions` | **CONFIRMED** |
| 7 | The `{{#get}}` resource list in the PRD is wrong | **PARTIALLY CORRECT** — facts right, framing wrong; deleting "Settings" would be a **regression** |
| 8 | `@site.lang` correct for API, gscan **error** in a theme | **CONFIRMED** |
| 9 | `{{img_url}}` does not emit `srcset` | **CONFIRMED** |
| 10 | `themeTranslation` labs flag changes translation semantics | **CONFIRMED** |
| 11 | NQL mis-parses `((tag:news))` | **CONFIRMED** |
| 12 | gscan can crash on a malformed `visibility` string | **PARTIALLY CORRECT** — it does **not** crash; it silently cascades into **19 errors** incl. `GS010-PJ-PARSE` |
| 13 | `GS001-DEPR-CURR-SYM` errors on bare `currency_symbol` | **PARTIALLY CORRECT** — `.hbs` only; a CSS class in a `.css` file does **not** trip it |
| 14 | `GS001-DEPR-CSS-PATS` / `-CSS-AT` error on CSS selectors | **CONFIRMED** (with two exact-regex caveats) |
| 15 | `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` new in v6 and fatal | **CONFIRMED** |
| 16 | `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a warning; trigger | **PARTIALLY CORRECT** — warning ✓, but "anywhere in the theme" excludes **orphan partials** |
| 17 | Routes method is `POST` not `PUT` | **CONFIRMED** |

**Counts:** 17 checked — **10 CONFIRMED**, **7 PARTIALLY CORRECT**, **0 REFUTED**, **0 UNVERIFIABLE**.
No claim is wholly wrong, but **three** carry a sub-assertion that is factually false and would damage the PRD if pasted verbatim: **#1** (settings "doesn't land where intended"), **#7** (implying `Settings` must leave the Content API list), **#12** (framed as a crash, which understates it *and* mis-describes the failure mode). **#13** would over-broaden the compiler's denylist for no reason.

---

# REFUTED sub-assertions (read these first)

None of the 17 findings is refuted end to end. Four sub-assertions inside otherwise sound findings are refuted, and each is exactly the kind of thing that historically got a working feature deleted:

### R1 — "the setting also doesn't land where intended" (finding #1) — **FALSE**

Ghost Admin buckets **any** group string that is not `homepage` or `post` into the Site-wide section and renders it under the heading `Site wide`:

```tsx
const group = (setting.group === 'homepage' || setting.group === 'post') ? setting.group : 'site-wide';
...
title: id === 'site-wide' ? 'Site wide' : (id === 'homepage' ? 'Homepage' : 'Post')
```
`apps/admin/src/settings/app/components/settings/site/design-modal.tsx:126,137` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/apps/admin/src/settings/app/components/settings/site/design-modal.tsx#L126-L137

The Admin API type says so explicitly:

```ts
// homepage and post are the only two groups we handle, but technically theme authors can put other things in package.json
group?: 'homepage' | 'post' | string
```
`apps/admin-x-framework/src/api/custom-theme-settings.ts:21-22` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/apps/admin-x-framework/src/api/custom-theme-settings.ts#L21-L22

No server-side validation strips or rejects the value (`ghost/core/core/shared/custom-theme-settings-cache/custom-theme-settings-service.js` validates `type`, `options` and value — never `group`). So `group: "Site wide"` appears exactly where the author intended; the *only* consequence is a gscan recommendation. Do not put "the setting doesn't land" in the PRD.

### R2 — "`settings` is not a resource, so Appendix B's list is wrong" (finding #7) — **framing is FALSE**

`settings` is a real **Content API** endpoint. Appendix B and FR-H1 both say *Content API resources*, not *`{{#get}}` resources*. Deleting `Settings` from that sentence removes a true fact.

```js
router.get('/settings', mw.authenticatePublic, http(api.publicSettings.browse));
```
`ghost/core/core/server/web/api/endpoints/content/routes.js:37` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/server/web/api/endpoints/content/routes.js#L37

### R3 — "gscan can crash" (finding #12) — **FALSE, and the truth is worse**

The `.map` on `null` is real, but it is swallowed by the `JSON.parse` try/catch in `checkPackageJSON` and reported as a **parse failure**, cascading every package.json rule to fail. Proven by running it — see §12.

### R4 — "`GS001-DEPR-CURR-SYM` … a pricing section with a class like `.price__currency_symbol`" implies CSS (finding #13) — **half FALSE**

The rule has no `css: true`, so the deprecations check only scans `.hbs` files for it. A `.price__currency_symbol` rule in `assets/css/screen.css` does **not** trip it. The same class name in a `class="…"` attribute inside a `.hbs` file **does**. See §13.

---

# Claim-by-claim

## 1. `"Site wide"` is not a valid custom-settings group — **PARTIALLY CORRECT**

**Report wording:** *"FR-Q2: "Site wide" is not a Ghost group value. `010-package-json.js:176-180` knows exactly two: `post` and `homepage`. "Site wide" is what Admin shows when `group` is **omitted**; emitting it trips `GS010-PJ-CUST-THEME-SETTINGS-GROUP` (verified: RECOMMENDATION on both specs, so it doesn't break the 0/0 counter — but the setting also doesn't land where intended). Fix: restate FR-Q2 and assert `group` is absent or one of the two literals."*

**True:**
```js
const knownSettingsGroups = new Set(['post', 'homepage']);
// Ignore undefined values as "groups" is an optional property
if (customSettingsKeys.some(key => typeof packageJSON.config.custom[key].group !== 'undefined'
        && !knownSettingsGroups.has(packageJSON.config.custom[key].group))) {
    markFailed('unknownCustomThemeSettingsGroup');
}
```
`lib/checks/010-package-json.js:175-179` — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/010-package-json.js#L175-L179 (the report's cited line range `176-180` is off by one; the Set is on 175).

Severity proved by execution (fixture `fx/a`, a `color` setting with `group: "Site wide"`):
```
--- v5 ---   recommendation   GS010-PJ-CUST-THEME-SETTINGS-GROUP
--- v6 ---   recommendation   GS010-PJ-CUST-THEME-SETTINGS-GROUP
```

**False:** the closing parenthetical. See **R1**.

**Paste-ready correction:**
> `config.custom.<key>.group` must be **absent**, or exactly `"post"` or `"homepage"` — gscan's `knownSettingsGroups` set holds only those two (`010-package-json.js:175`), and any other value trips `GS010-PJ-CUST-THEME-SETTINGS-GROUP` at **recommendation** level on both the v5 and v6 specs (non-blocking). Ghost Admin buckets every non-`homepage`/`post` group — including an omitted one — into the section headed **Site wide**, so an unknown literal still renders where intended; emit no `group` key rather than the string `"Site wide"`.

## 2. Colour defaults must be 6-digit hex at error level — **CONFIRMED**

**Report wording:** *"Color-setting defaults must be 6-digit hex (FR-Q5, FR-Q3, Appendix D). `!/^#[0-9a-f]{6}$/i` at `level: 'error'` — no 3-digit shorthand (verified ERROR on `#fff`), no 8-digit alpha, no `rgb()`, no named colors, and a *missing* default also fails. Appendix D states no hex format anywhere. Fix: make `#rrggbb` normative in Appendix D and normalise at compile."*

```js
case 'color':
    if (!/^#[0-9a-f]{6}$/i.test(entry.default)) {
        markFailed('invalidCustomThemeSetingColorDefault');
    }
    break;
```
`lib/checks/010-package-json.js:197-201` — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/010-package-json.js#L197-L201

`GS010-PJ-CUST-THEME-SETTINGS-COLOR-DEFAULT` — `level: 'error'`, not fatal, on **both** v5 and v6 specs.

Every sub-case proved by execution:

| `default` | Result |
|---|---|
| `#fff` | FAIL error |
| `#FF00AA` | pass |
| `#ABCDEF` | pass (case-insensitive flag) |
| `#ff00aa88` | FAIL error |
| `red` | FAIL error |
| `rgb(0,0,0)` | FAIL error |
| *(key absent)* | FAIL error |
| `"#FFF000 "` (trailing space) | FAIL error |

Every element of the claim holds, including "a *missing* default also fails" (`/^…$/.test(undefined)` → `"undefined"` → no match).

## 3. `package.json` required keys + a type rule — **CONFIRMED** (one label to fix)

**Report wording:** *"FR-J2's `package.json` spec omits two gscan-required keys and a type rule. Missing: `author.email` present and valid (**error**), `keywords` containing `"ghost-theme"` (warning), `name` matching `/^([a-z0-9]+-)*[a-z0-9]+$/` (**error**), `version` semver-valid (**error**), and `config.posts_per_page` a **number** ≥ 1 (**error** — `"12"` as a string straight out of a form field fails, while omitting it is only a recommendation). Fix: enumerate the full required shape and coerce `posts_per_page` to an integer at compile."*

Source (`lib/checks/010-package-json.js`, https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/010-package-json.js):

```js
if (!packageJSON.config || _.isNil(packageJSON.config.posts_per_page)) {
    markFailed('configPPPIsRequired');
    passedRulesToOmit.push('configPPIsInteger');
} else if (!_.isNumber(packageJSON.config.posts_per_page) || packageJSON.config.posts_per_page < 1) {
    failed = _.without(failed, packageJSONValidationRules.configPPPIsRequired);
    markFailed('configPPIsInteger');
}
```
(lines 96-101) — `_.isNumber("12") === false`, so the string form fails exactly as claimed.

Levels (read from spec, then proved by running fixture `fx/a`, identical on v5 and v6):

| Condition | Code | Level |
|---|---|---|
| `author.email` absent | `GS010-PJ-AUT-EM-REQ` | **error** |
| `author.email` invalid | `GS010-PJ-AUT-EM-VAL` | **error** |
| `keywords` lacks `"ghost-theme"` | `GS010-PJ-KEYWORDS` | warning |
| `name` not lowercase | `GS010-PJ-NAME-LC` | **error** |
| `name` fails `/^([a-z0-9]+-)*[a-z0-9]+$/gi` | `GS010-PJ-NAME-HY` | **error** |
| `version` not semver | `GS010-PJ-VERSION-SEM` | **error** |
| `posts_per_page` not a number, or < 1 | `GS010-PJ-CONF-PPP-INT` | **error** |
| `posts_per_page` absent | `GS010-PJ-CONF-PPP` | recommendation |

Fixture run output (both versions):
```
error GS010-PJ-CONF-PPP-INT / GS010-PJ-AUT-EM-REQ / GS010-PJ-NAME-LC / GS010-PJ-NAME-HY / GS010-PJ-VERSION-SEM
warning GS010-PJ-KEYWORDS
```

**One correction:** the regex `/^([a-z0-9]+-)*[a-z0-9]+$/` the report quotes belongs to `GS010-PJ-NAME-**HY**` and gscan applies it with the `gi` flags (line 114), so it is **case-insensitive** — `"MyTheme"` passes it. Lowercase is enforced by the *separate* rule `GS010-PJ-NAME-LC` (line 110). Both are errors, so the practical requirement is unchanged; only the rule attribution needs to be right if the PRD names codes.

**Paste-ready correction (append to FR-J2):**
> The compiler must emit: `name` (lowercase, and matching `/^([a-z0-9]+-)*[a-z0-9]+$/` — two separate error rules, `GS010-PJ-NAME-LC` and `GS010-PJ-NAME-HY`), `version` (semver-valid, `GS010-PJ-VERSION-SEM`, error), `author.email` (present and RFC-valid, `GS010-PJ-AUT-EM-REQ` / `-VAL`, both errors), `keywords` containing `"ghost-theme"` (`GS010-PJ-KEYWORDS`, warning), and `config.posts_per_page` as a **JSON number ≥ 1** — never a string; `"12"` from a form field trips `GS010-PJ-CONF-PPP-INT` at **error** level, while omitting the key entirely is only a recommendation (`GS010-PJ-CONF-PPP`). Coerce to integer at compile. Levels identical on the v5 and v6 specs.

## 4. `{{#get}}` limit capped at 100; new v6 warnings — **PARTIALLY CORRECT** (version scope + config override)

**Report wording:** *"`{{#get}}` limit is capped at 100, and >100 is a new v6 gscan warning (FR-H2, FR-H5). `shared/max-limit-cap.js` — "After Ghost 6.x we only allow a max limit of 100," and `limit='all'` silently becomes 100; gscan v6 adds `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`. FR-H2's Count control has no stated ceiling. Fix: cap Count at 100 in the editor with the reason inline, plus a compile assertion."*

**Confirmed on Ghost 6.** `ghost/core/core/shared/max-limit-cap.js` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/shared/max-limit-cap.js:
```js
// After Ghost 6.x we only allow a max limit of 100. This shared module provides
// the core limit capping logic that can be used by both middleware and helpers.
```
```js
if (limit === 'all') { return limitConfig.maxLimit; }
const numericLimit = parseInt(String(limit), 10);
if (isNaN(numericLimit) || numericLimit > limitConfig.maxLimit) { return limitConfig.maxLimit; }
```
`get.js` calls it: `options.limit = applyLimitCap(options.limit);` (`ghost/core/core/frontend/helpers/get.js:202`).

gscan v6 rules confirmed by execution (fixture `fx/b` with `limit="all"`, `limit="200"`, `limit="100"`):
```
v5: (neither rule exists)
v6: warning GS090-NO-LIMIT-ALL-IN-GET-HELPER      index.hbs
    warning GS090-NO-LIMIT-OVER-100-IN-GET-HELPER index.hbs
```
`limit="100"` produced no finding. Both are **warning**, non-fatal.

**Two corrections the PRD needs, because this product supports Ghost 5 and 6:**

1. **The cap is Ghost 6 only.** `shared/max-limit-cap.js` returns **404 on the `5.x` branch**. Ghost 5's `get.js` caps `limit="all"` *only* when the operator has set `getHelperLimitAllMax`:
   ```js
   if (options.limit === 'all' && config.get('getHelperLimitAllMax')) {
       options.limit = config.get('getHelperLimitAllMax');
   }
   ```
   `5.x` `ghost/core/core/frontend/helpers/get.js:117-118` — https://github.com/TryGhost/Ghost/blob/85a96d1588e3bdf04dcd2dadc6d01cf4da79c4a0/ghost/core/core/frontend/helpers/get.js#L117-L118
2. **100 is a default, not a constant.** `maxLimit` reads `config.get('optimization:maxLimit') || 100`, and `limit="all"` is honoured outright when `config.get('optimization:allowLimitAll')` is set. A self-hoster can move both.

**Paste-ready correction:**
> On **Ghost 6**, `{{#get}}` limits are capped server-side: `limit="all"` silently becomes the cap and any numeric limit above it is clamped (`shared/max-limit-cap.js`). The cap defaults to **100** and is operator-overridable via `optimization:maxLimit`, with `optimization:allowLimitAll` restoring `limit="all"`; Inflozo must assume the defaults. **Ghost 5 has no such cap** — `limit="all"` returns everything unless the operator set `getHelperLimitAllMax`. gscan **v6 only** adds `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`, both **warning** (non-blocking); the v5 spec has neither. FR-H2's Count control is therefore capped at 100 for a 0-warning v6 scan, and the compiler never emits `limit="all"`.

## 5. Translation overrides are ICU MessageFormat and never validated — **PARTIALLY CORRECT** (the failure is worse than stated)

**Report wording:** *"FR-Q6's user overrides are ICU MessageFormat and are never validated. The legacy `{{t}}` backend runs every string — including the fallback — through `intl-messageformat`, so `{` and `}` are syntax, not literals; a stray brace throws at render and the visitor sees **"An error occurred"** in place of the label, on every page that renders it. Fix: compile every override with `intl-messageformat` at save time and reject/flag failures; assert the override's placeholder set matches the catalog entry's."*

**CONFIRMED — ICU, and every string goes through it.** `ghost/core/core/frontend/services/theme-engine/i18n/i18n.js` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/services/theme-engine/i18n/i18n.js:
```js
const MessageFormat = require('intl-messageformat');
...
_formatMessage(string, bindings) {
    let currentLocale = this.locale();
    let msg = new MessageFormat(string, currentLocale);
    try {
        msg = msg.format(bindings);
    } catch (err) {
        this._handleFormatError(err);
        msg = new MessageFormat(this._fallbackError(), currentLocale);
        msg = msg.format();
    }
    return msg;
}
```
Themes run in `fulltext` mode (`i18n/theme-i18n.js:13`, `this._stringMode = 'fulltext'`), so `_getCandidateString` sets `fallback = msgPath` — i.e. the English source string from `{{t "..."}}` is itself formatted through ICU when no override exists. The claim "including the fallback" is exactly right.

**CONFIRMED — never validated.** gscan's only translation check is a JSON parse:
```js
try { JSON.parse(file.content); } catch (error) { failures.push({ref: file.file, message: 'Unable to parse'}); }
```
`lib/checks/070-theme-translations.js:22-28` — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/070-theme-translations.js#L22-L28
(`GS070-VALID-TRANSLATIONS`: error, **fatal**, identical v5/v6 — but only for unparsable JSON.)

Proved by running gscan on a theme whose `locales/en.json` is valid JSON with an ICU-broken value `"Weiter lesen {"`: **no** GS070 finding, theme otherwise clean.

**WRONG — the visitor does not see "An error occurred".** `new MessageFormat(string, locale)` sits **outside** the `try`. `intl-messageformat@5.4.3` (the pin in `ghost/core/package.json:192`) parses eagerly in the constructor. Executed:

| String | Outcome |
|---|---|
| `"Read more"` | ctor OK → `"Read more"` |
| `"Cost: $100 {sale}"` | ctor OK → interpolates |
| `"{count, plural, one {# post} other {# posts}}"` | ctor OK → `"2 posts"` |
| `"50% off {"` | **CTOR THROWS** `Expected "'", ",", [0-9], or any character but end of input found.` |
| `"A { stray brace"` | **CTOR THROWS** `Expected "," but "b" found.` |
| `"Braces }{ reversed"` | **CTOR THROWS** |

The throw escapes `_formatMessage` → escapes `themeI18n.t` → escapes the `{{t}}` helper → surfaces as the `err` argument in `res.render(...)`'s callback, which does `return req.next(err)`:
```js
res.render(res._template, data, function (err, html) {
    if (err) { ... return req.next(err); }
```
`ghost/core/core/frontend/services/rendering/renderer.js:34-43` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/services/rendering/renderer.js#L34-L43

So a single stray brace takes down **the entire page**, not one label. "An error occurred" (`_fallbackError()`) is reachable only from `format()`-time errors (bad/missing bindings), not from bad syntax.

**Paste-ready correction:**
> FR-Q6 overrides — and the English catalog defaults they replace — are compiled as **ICU MessageFormat** by the legacy `{{t}}` backend (`intl-messageformat@5.4.3`), so `{` and `}` are syntax, never literals, and a `%`/`$`/`#` is safe but a bare brace is not. Nothing validates them: gscan's `GS070-VALID-TRANSLATIONS` runs `JSON.parse` and nothing else, so an ICU-invalid override ships a clean scan. The failure mode is **not** a degraded label: `new MessageFormat(...)` is constructed outside `_formatMessage`'s try/catch, so a syntax error throws out of the `{{t}}` helper into `res.render`'s error callback and Ghost serves its **error page for the whole route** (`rendering/renderer.js:34-43`). The `"An error occurred"` fallback only covers format-time binding errors. Therefore: compile every catalog default and every user override through `intl-messageformat` at save time, reject on throw, and assert the override's placeholder set matches the catalog entry's.

## 6. `@member` shape is incomplete — **CONFIRMED**

**Report wording:** *"Appendix B's `@member` shape is incomplete. Missing `uuid`, `firstname`, `avatar_image`, `subscriptions` — exactly what member-greeting, member-home and manage-your-plan surfaces want, currently foreclosed. Two related facts to carry: `@member` is `null` (never `undefined`, never `{}`), so `{{#if @member}}` is correct unconditionally; and `{{#has any="@member"}}` is **always false**, because `has.js` only picks `['site','config','labs']` out of the data frame."*

The full frame, verbatim:
```js
const member = req.member ? {
    uuid: req.member.uuid,
    email: req.member.email,
    name: req.member.name,
    firstname: req.member.name && req.member.name.split(' ')[0],
    avatar_image: req.member.avatar_image,
    subscriptions: req.member.subscriptions && req.member.subscriptions.map((sub) => {
        return Object.assign({}, sub, {
            default_payment_card_last4: sub.default_payment_card_last4 || '****'
        });
    }),
    paid: req.member.status !== 'free',
    status: req.member.status
} : null;
```
`ghost/core/core/frontend/services/theme-engine/middleware/update-local-template-options.js:26-40` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/services/theme-engine/middleware/update-local-template-options.js#L26-L40
**Byte-identical on the `5.x` branch** (lines 25-38), so this holds for both supported Ghost majors.

PRD `prd.md:638` currently reads: *"`@member` … null | { name, email, status: free/paid/comped, paid flag }"* — four of the eight keys. Claim confirmed.

Both corollaries confirmed:
- **`null`, never `undefined`/`{}`** — the ternary's else-branch is the literal `null`, so `{{#if @member}}` is unconditionally correct.
- **`{{#has any="@member"}}` is always false** — `const data = _.pick(options.data, ['site', 'config', 'labs']);` (`ghost/core/core/frontend/helpers/has.js:128`), and the `@`-prefixed branch resolves against that `data` only: `_.has(data, prop.replace(/@/, ''))` (line 114). `member` is never in the picked set. https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/helpers/has.js#L128

One addition worth carrying: each entry in `subscriptions` has `default_payment_card_last4` defaulted to the literal `'****'`, which is what a manage-your-plan surface renders when no card is on file.

## 7. The `{{#get}}` resource list — **PARTIALLY CORRECT** (facts right, framing wrong, proposed deletion is a regression)

**Report wording:** *"Appendix B's `{{#get}}` resource list is wrong (FR-H1, FR-H5). The real `RESOURCES` are posts, pages, tags, authors, tiers, **newsletters** — `settings` is **not** a `{{#get}}` resource (it is reached as `@site`), and `newsletters` is missing from the catalog while being directly relevant to the A-series subscribe/newsletter sections."*

**The `{{#get}}` facts are exactly right:**
```js
const RESOURCES = {
    posts:       {alias: 'postsPublic'},
    tags:        {alias: 'tagsPublic'},
    pages:       {alias: 'pagesPublic'},
    authors:     {alias: 'authorsPublic'},
    tiers:       {alias: 'tiersPublic'},
    newsletters: {alias: 'newslettersPublic'}
};
```
`ghost/core/core/frontend/helpers/get.js:22-40` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/helpers/get.js#L22-L40
Anything else is rejected: `if (!RESOURCES[resource]) { ... invalidResource ... }` (line 418). **Identical on the `5.x` branch** — no version split.

**The framing is wrong.** Neither PRD site presents a `{{#get}}` list:
- `prd.md:205` (FR-H1): *"It reflects the Ghost **Content API** resources — Posts, Pages, Tags, Authors, Tiers, Settings"*
- Appendix B header: *"What Inflozo may bind, per the Ghost **Content API** (Posts, Pages, Tags, Authors, Tiers, Settings)"*

`GET /ghost/api/content/settings/` is a genuine Content API endpoint (`content/routes.js:37`). Striking `Settings` on the strength of this finding would delete a true statement — the exact failure this review exists to prevent. The Content API list is *incomplete* (it also omits `newsletters`, `offers`, `recommendations`, `search-index`), not *wrong*.

**Paste-ready correction (additive, deletes nothing):**
> Appendix B / FR-H1: keep `Settings` — it is a real Content API endpoint (`GET /ghost/api/content/settings/`) and is what `@site` is built from — and **add Newsletters** to the Content API list. Then state the narrower fact separately: **`{{#get}}` accepts exactly six resources — `posts`, `pages`, `tags`, `authors`, `tiers`, `newsletters`** (`frontend/helpers/get.js` `RESOURCES`; identical on Ghost 5 and 6). `settings` is **not** among them — site settings are reached as `{{@site.*}}`, never via `{{#get}}` — and any other string throws `Invalid "<resource>" resource given to get helper`. `newsletters` is currently absent from the catalog despite being the natural binding for the A-series subscribe sections.

## 8. `@site.lang` is API-correct and a gscan error in a theme — **CONFIRMED**

**Report wording:** *"`@site.lang` is correct for the API and a gscan **error** in a theme (Appendix B). Both `lang` and `locale` map to the same setting in `public.js`, but in compiled `.hbs` both spellings are error-level trips (`GS001-DEPR-SITE-LANG`, `GS001-DEPR-LANG`). Appendix B is normative for the compiler as well as the editor, so it currently reads as permission to emit `{{@site.lang}}`. Fix: append the scope marker — readable via the Content API only; compiled templates emit `{{@site.locale}}`."*

API side:
```js
lang: 'locale',
locale: 'locale',
```
`ghost/core/core/shared/settings-cache/public.js:20-21` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/shared/settings-cache/public.js#L20-L21 — **identical on `5.x`** (lines 14-15). Both keys, one underlying `locale` setting. Confirmed.

Theme side — rule definitions read from the spec:
- `GS001-DEPR-SITE-LANG` — `level: 'error'`, `regex: /@site\.lang/g`, no `css` flag → template scan
- `GS001-DEPR-LANG` — `level: 'error'`, `regex: /{{\s*?lang\s*?}}/g`

Both **error, non-fatal, identical on the v5 and v6 specs**. Proved by execution — fixture `fx/b` with `<html lang="{{@site.lang}}">`:
```
v5: error GS001-DEPR-SITE-LANG ["default.hbs"]
v6: error GS001-DEPR-SITE-LANG ["default.hbs"]
```

Note the regex is a bare substring match with no Handlebars awareness: the literal text `@site.lang` anywhere in **any `.hbs` file** — including inside an HTML comment — is an error. Appendix B already documents the dual-key API fact; the missing half is the emission constraint.

**Paste-ready correction (append to Appendix B's `@site` note):**
> Scope marker: the dual `lang`/`locale` keys exist on the **Content API response only**. In compiled `.hbs`, `{{@site.lang}}` is a gscan **error** (`GS001-DEPR-SITE-LANG`, error on both v5 and v6 specs) and so is the bare `{{lang}}` helper (`GS001-DEPR-LANG`, error). The compiler emits `{{@site.locale}}` exclusively; the literal string `@site.lang` must not appear in any `.hbs` file, comments included — the rule is a plain `/@site\.lang/g` substring match over template content.

## 9. `{{img_url}}` does not emit `srcset` — **CONFIRMED**

**Report wording:** *"FR-H5: `{{img_url}}` does not emit `srcset`. The helper returns one URL string; `srcset` appears in no Ghost helper — themes concatenate several `{{img_url … size="x"}}` calls by hand. FR-H5 is the *shim's* contract, so a contract test written literally against it tests the wrong thing. Two behaviours to pin: an unknown `size=` silently degrades to the unsized URL, and a `null` image renders empty silently while an `undefined` property renders empty **plus** a per-render server warning — which is a stronger argument for FR-H8's media guards than the one FR-H8 gives."*

`ghost/core/core/frontend/helpers/img_url.js` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/helpers/img_url.js — the helper's single return path is one URL string:
```js
return maybeEnsureRelativePath(getImageUrl(applyImageSizes(requestedImageUrl)));
```
No `srcset` anywhere in the file. The helper list I enumerated from `frontend/helpers/` (56 files) contains no srcset-emitting helper. Confirmed.

All three pinned behaviours confirmed:

- **unknown `size=` → unsized URL, silently:**
  ```js
  if (!imageSizes || !imageSizes[requestedSize]) { return imagePath; }
  ```
  `ghost/core/core/frontend/utils/images.js:80-82` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/frontend/utils/images.js#L80-L82
- **`null` → empty, silent:**
  ```js
  // CASE: if you pass e.g. cover_image, but it is not set, then requestedImageUrl is null!
  // in this case we don't show a warning
  if (requestedImageUrl === null) { return; }
  ```
  (`img_url.js:40-43`)
- **`undefined` → empty **plus** a server warning:**
  ```js
  if (requestedImageUrl === undefined) { logging.warn(tpl(messages.attrIsRequired)); return; }
  ```
  (`img_url.js:33-36`) — and the zero-argument case `{{img_url}}` warns identically (lines 27-30).

The PRD text the finding targets is real: `prd.md:209` (FR-H5) says `{{img_url}}` emits *"Ghost-shaped sized URLs and `srcset`, not pass-through"*.

## 10. The `themeTranslation` labs flag changes translation semantics — **CONFIRMED**

**Report wording:** *"Forward risk: the `themeTranslation` labs flag changes translation semantics (§7.6). It is currently in `PRIVATE_FEATURES`, so the legacy ICU backend ships. When promoted, `{{t}}` moves to i18next with `keySeparator: false` (so FR-Q6's flat dotted keys keep working) but different file-resolution details and `{name}` interpolation instead of ICU — so **ICU plural/select syntax in an override would stop working, silently**. Fix: add as a §7.6 watch item and constrain the catalog to plain `{placeholder}` interpolation only, which costs nothing today and removes the migration entirely."*

Every element verified:

- **In `PRIVATE_FEATURES`** — `ghost/core/core/shared/labs.js:50` lists `'themeTranslation'` inside `const PRIVATE_FEATURES = [...]`. https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/shared/labs.js#L41-L60
- **The flag is the switch** — `ghost/core/core/frontend/helpers/t.js:34-49`:
  ```js
  if (labs.isSet('themeTranslation')) {
      ...
      return themeI18next.t(text, bindings);
  } else {
      ...
      return themeI18n.t(text, bindings);   // legacy ICU
  }
  ```
- **New backend = i18next with the claimed options** — `packages/i18n/lib/i18n-core.js:49-85`:
  ```js
  const interpolation = { prefix: '{', suffix: '}' };
  ...
  i18nextInstance.init({
      lng,
      nsSeparator: false,
      keySeparator: false,
      returnEmptyString: false,
      ...
  });
  ```
  https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/packages/i18n/lib/i18n-core.js#L46-L86
  The only i18next import is `require('i18next')` — **no `i18next-icu` plugin**, so ICU `{count, plural, …}` is not interpreted; i18next would treat the braces as interpolation tokens and emit mangled output with no error. "Silently stop working" is accurate.
- **`keySeparator: false` preserves flat dotted keys** — confirmed, and `nsSeparator: false` additionally preserves keys containing `:`.
- **Different file resolution** — new backend: `<themePath>/locales/<locale>.json`, falling back to `en.json`, else an empty resource so interpolation still runs (`i18next/theme-i18n.js:50-83`). Legacy: `[basePath, activeTheme, 'locales']` + `<locale>.json` with an `en.json` fallback (`i18n/theme-i18n.js:33-35`). Similar but not identical. Confirmed.

The recommended mitigation (constrain the catalog to plain `{placeholder}` interpolation) is sound: `{name}` behaves identically under both backends — verified above for ICU (`"Hello {name}"` → `"Hello x"`) and it is exactly i18next's configured `prefix`/`suffix` pair.

## 11. NQL mis-parses doubled parentheses — **CONFIRMED**

**Report wording:** *"NQL silently mis-parses doubled parentheses: `nql('((tag:news))').parse()` returns `{"yg":{"tag":"news"}}` — garbage, no error. FR-I2's builder emits parentheses mechanically from All/Any groups, so it must not emit a group wrapper around a single nested group or a single condition. Fix: a normalisation pass plus a unit test. (FR-I2's parenthesised-nesting rule itself is correct.)"*

Executed against `@tryghost/nql@0.13.1`:

| Input | `.parse()` |
|---|---|
| `tag:news` | `{"tag":"news"}` |
| `(tag:news)` | `{"tag":"news"}` |
| `((tag:news))` | **`{"yg":{"tag":"news"}}`** |
| `(((tag:news)))` | **`{"yg":{"yg":{"tag":"news"}}}`** |
| `((tag:news+featured:true))` | **`{"yg":{"$and":[{"tag":"news"},{"featured":true}]}}`** |
| `(tag:news)+(featured:true)` | `{"$and":[{"tag":"news"},{"featured":true}]}` |
| `((tag:news)+(featured:true))` | `{"$and":[{"tag":"news"},{"featured":true}]}` |

Exact reproduction, no exception thrown. Two refinements for the fix:
- The trigger is **any** immediately-doubled `((`, not only a single condition inside — `((a+b))` corrupts too. The normalisation rule is therefore: *never emit `(` immediately followed by `(`*, and never wrap a lone condition in parens.
- Nesting compounds (`(((…)))` → two nested `yg` keys), so normalisation must be applied to a fixpoint, not one pass.

**Caveat on scope:** `0.13.1` is gscan's bundled copy. Ghost's `ghost/core/package.json` declares `"@tryghost/nql": "catalog:"` (a pnpm catalog reference), so I could not read Ghost's resolved NQL version from the manifest. The defect is in NQL's grammar and has no version guard I found, but if you want the version-exact statement, resolve it from `pnpm-workspace.yaml`. Treat "Ghost runs this exact NQL build" as **unverified**; "NQL 0.13.1 does this" is proven.

## 12. gscan on a malformed `visibility` string — **PARTIALLY CORRECT** (not a crash; a 19-error cascade)

**Report wording:** *"gscan can crash on a malformed `visibility` string: `entry.visibility.match(/[a-zA-Z_][a-zA-Z0-9_.]+:/).map(...)` — non-global regex, `.match()` returns `null` with no `key:` token, so `.map` throws outside `applyRule`'s guard. Never emit a `visibility` value without at least one `key:` token. Corollary: the non-global regex means only the **first** clause of `"a:true+b:false"` is validated."*

The defective line is real:
```js
const referencedKeys = entry.visibility.match(/[a-zA-Z_][a-zA-Z0-9_.]+:/).map(k => k.slice(0, -1));
```
`lib/checks/010-package-json.js:225` — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/010-package-json.js#L225
It is also reached unconditionally: the NQL syntax check above it (lines 217-221) catches its own error and falls through, so an already-invalid `visibility` still hits line 225.

**But it does not crash.** Run with `visibility: "true"` (no `key:` token) — gscan returned normally, no exception reached the caller:
```
errors: 19  warnings: 6  fatal: false
GS010-PJ-PARSE  error  [{"ref":"package.json","message":"Cannot read properties of null (reading 'map')"}]
error codes: GS010-PJ-PARSE, GS010-PJ-NAME-REQ, GS010-PJ-NAME-LC, GS010-PJ-NAME-HY,
GS010-PJ-VERSION-SEM, GS010-PJ-VERSION-REQ, GS010-PJ-AUT-EM-VAL, GS010-PJ-AUT-EM-REQ,
GS010-PJ-CUST-THEME-TOTAL-SETTINGS, GS010-PJ-CUST-THEME-SETTINGS-CASE,
GS010-PJ-CUST-THEME-SETTINGS-TYPE, GS010-PJ-CUST-THEME-SETTINGS-SELECT-OPTIONS,
GS010-PJ-CUST-THEME-SETTINGS-SELECT-DEFAULT, GS010-PJ-CUST-THEME-SETTINGS-BOOLEAN-DEFAULT,
GS010-PJ-CUST-THEME-SETTINGS-COLOR-DEFAULT, GS010-PJ-CUST-THEME-SETTINGS-IMAGE-DEFAULT,
GS050-CSS-KGWW, GS050-CSS-KGWF, GS100-NO-UNUSED-CUSTOM-THEME-SETTING
```
The `package.json` was perfectly valid JSON. The `TypeError` is swallowed by the `try { JSON.parse(...); validatePackageJSONFields(...) } catch` block in `checkPackageJSON` (lines 361-381), whose catch marks **every** package.json rule failed and attributes the TypeError message to `GS010-PJ-PARSE`. `applyRule`'s guard is not involved at all — `010-package-json.js` does not use `applyRule`.

Operationally this is *worse* than a crash: a crash is visible and attributable; this produces 16 fabricated package.json errors and a "cannot parse" message on a file that parses fine, sending a debugging session in entirely the wrong direction.

**Corollary CONFIRMED — only the first clause is validated.** Executed:

| `visibility` | Result |
|---|---|
| `style:bold` (known key) | no finding |
| `style:bold+bogus:x` (2nd key unknown) | **no finding** — bug |
| `bogus:x+style:bold` (1st key unknown) | `GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-VALUE` (error) |

`GS010-PJ-CUST-THEME-SETTINGS-VISIBILITY-SYNTAX` and `-VALUE` are both **error**, non-fatal, identical on v5 and v6.

**Paste-ready correction:**
> The compiler must never emit a `config.custom.<key>.visibility` string lacking at least one `<key>:` token. gscan dereferences `String.match()`'s result without a null check (`010-package-json.js:225`), and the resulting `TypeError` is swallowed by `checkPackageJSON`'s JSON-parse catch — so instead of crashing, gscan reports `GS010-PJ-PARSE` ("Cannot read properties of null (reading 'map')") against a `package.json` that parses fine and **cascades every other package.json rule to failed — 19 errors from one bad string**. Two further consequences of the same line: the regex is non-global, so only the **first** `key:` clause of a compound expression such as `a:true+b:false` is ever checked against the known-settings list; and the NQL syntax check above it does not short-circuit, so a syntactically invalid `visibility` reaches the same dereference.

## 13. `GS001-DEPR-CURR-SYM` on the bare string — **PARTIALLY CORRECT** (`.hbs` only)

**Report wording:** *"`GS001-DEPR-CURR-SYM` is an **error** on the bare string `currency_symbol` (`/currency_symbol/g` over template content, context-insensitive). A pricing section with a class like `.price__currency_symbol`, or an HTML comment mentioning it, is an error — relevant because FR-J1 mandates class names derive from section names."*

Rule definition (`lib/specs/v5.js:702-708`, inherited unchanged into v6 via `_.merge`):
```js
level: 'error',
rule: 'Replace <code>{{[#].currency_symbol}}</code> with <code>{{price currency=currency}}</code>.',
helper: '{{[#].currency_symbol}}',
regex: /currency_symbol/g
```
Error on both specs, non-fatal. Context-insensitivity confirmed by execution — fixture `fx/b`'s `default.hbs` containing only:
```html
<!-- currency_symbol note -->
<span class="price__currency_symbol">x</span>
```
→ `error GS001-DEPR-CURR-SYM ["default.hbs"]` on both v5 and v6. Both the comment and the class attribute trip it.

**The correction:** the rule has **no `css: true` flag**, and `001-deprecations.js` routes on exactly that:
```js
if (template && !check.css && !skipTemplateCheck) { ... }        // .hbs branch
else if (css && check.css && !skipTemplateCheck) { ... }         // .css branch
```
`lib/checks/001-deprecations.js:26,37` — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/checks/001-deprecations.js#L26-L37
So `CURR-SYM` scans `.hbs` **only**. A `.price__currency_symbol { }` rule living in `assets/css/screen.css` is not a finding. The report's phrasing "a pricing section with a class like `.price__currency_symbol`" reads as a CSS-selector prohibition and would over-broaden the denylist.

**Paste-ready correction:**
> The literal substring `currency_symbol` must not appear anywhere in any **`.hbs`** file — `GS001-DEPR-CURR-SYM` matches `/currency_symbol/g` against raw template content with no Handlebars awareness, at **error** level on both the v5 and v6 specs. Class attributes and HTML comments both trip it (verified). It does **not** scan `.css` files (the rule carries no `css: true` flag), so the same token in a stylesheet is safe — but because FR-J1 derives class names from section names and those class names are emitted into `class="…"` attributes in `.hbs`, `currency_symbol` belongs on the reserved-token denylist for **section and control names**.

## 14. `GS001-DEPR-CSS-PATS` / `GS001-DEPR-CSS-AT` — **CONFIRMED** (with two regex caveats)

**Report wording:** *"`GS001-DEPR-CSS-PATS` is an error on `.page-template-*` CSS selectors and `GS001-DEPR-CSS-AT` on `.archive-template`. Same FR-J1 class-name-derivation exposure. Fix: add both to the compiler's reserved-class-name denylist."*

```
GS001-DEPR-CSS-PATS   level: error   css: true   regex: /\.page-template-\w+[\s{]/g
GS001-DEPR-CSS-AT     level: error   css: true   regex: /\.archive-template[\s{]/g
```
Both **error**, non-fatal, identical on the v5 and v6 specs. Proved by execution — fixture `fx/b`'s `assets/css/screen.css`:
```css
.page-template-about { color: red; }
.archive-template { color: blue; }
```
→ both fire on both versions, `ref: assets/css/screen.css`.

Two caveats worth carrying into the denylist implementation (neither invalidates the claim):
1. Because these rules carry `css: true`, the `.hbs` branch is skipped — the tokens are **only** matched in `.css` files. This is the mirror image of §13. A `class="page-template-about"` attribute in a template is not a finding; the CSS rule that styles it is.
2. Both regexes require a trailing `\s` or `{`. `.page-template-about,` (comma-joined selector list) and `.page-template-about` at end-of-file do **not** match, and `.page-template` with no `-suffix` never matches. A denylist should still be stricter than the regex — do not build a compiler that relies on the gap.

## 15. `GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` is new in v6 and fatal — **CONFIRMED**

**Report wording:** *"`GS090-NO-INVALID-CONDITIONAL-ARGUMENTS` is new in v6 and **fatal**: `{{#if}}`/`{{#unless}}` must take exactly one argument. FR-H8 mandates `{{#if}}` guards on every bound prop, so the compiler must never emit a two- or zero-argument conditional. Also new-and-fatal in v6: `GS130-NO-RECURSIVE-LAYOUT` (a `{{!< default}}` inside `default.hbs`)."*

Spec (`lib/specs/v6.js:13-18` and `58-63`) — https://github.com/TryGhost/gscan/blob/b26772567a44506c51c13fa89f86d3df0b6684ec/lib/specs/v6.js#L13-L18:
```js
'GS090-NO-INVALID-CONDITIONAL-ARGUMENTS': {
    level: 'error',
    fatal: true,
    rule: 'Use exactly one argument in <code>{{#if}}</code> and <code>{{#unless}}</code> helpers',
```
```js
'GS130-NO-RECURSIVE-LAYOUT': {
    level: 'error',
    fatal: true,
    rule: 'Templates must not recursively inherit layouts',
```
Both are declared in `v6.js`'s own `rules` object and are **ABSENT** from `v5.js` (programmatically confirmed against both spec modules).

Proved by execution — fixture `fx/d` with `{{#if @site.title @site.description}}`, `{{#unless}}`, and `{{!< default}}` inside `default.hbs`:
```
==== v5   hasFatalErrors: false     (neither rule exists)
==== v6   hasFatalErrors: true
  error FATAL GS090-NO-INVALID-CONDITIONAL-ARGUMENTS  index.hbs (L1), index.hbs (L2)
  error FATAL GS130-NO-RECURSIVE-LAYOUT               default.hbs
    → "Recursive layout inheritance detected: default.hbs -> default.hbs"
```
Both the two-argument and the zero-argument form fire, exactly as claimed, and `{{#if @site.title}}` alone passes. `hasFatalErrors: true` is what blocks a theme upload. Claim fully confirmed, version scope correct.

## 16. `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a warning — **PARTIALLY CORRECT** (one exclusion in the trigger)

**Report wording:** *"`GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a **warning**, not an error, and requires `@page.show_title_and_feature_image` anywhere in the theme, not specifically in `page.hbs` (the `ref: page.hbs` is cosmetic). FR-I1's framing is directionally right and overstates both severity and file-scoping. Sibling `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` (warning) fires on any other `@page.x`."*

**Severity CONFIRMED:** `GS110-NO-MISSING-PAGE-BUILDER-USAGE` and `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` are both `level: 'warning'`, non-fatal, on **both** the v5 and v6 specs — read from spec and confirmed in every fixture run below.

**`ref` is cosmetic — CONFIRMED.** `findPageTemplateRef` returns `page.hbs` if it exists, else the first `page-*.hbs`, else the hard-coded string `'page.hbs'` even when no such file exists (`lib/checks/110-page-builder-usage.js:8-22`). The failure is always attributed there regardless of where the property was or wasn't found.

**Trigger — mostly right, one exclusion.** The property list is `pageBuilderProperties: ['show_title_and_feature_image']` (one entry). `eachFile` scans files matching `/(?<!partials\/.+?)\.hbs$/` — a negative lookbehind that **excludes partials as scan entry points**. Six fixture runs:

| Where `{{@page.show_title_and_feature_image}}` lives | Result |
|---|---|
| nowhere | **FAIL** warning, `ref=page.hbs` |
| `page.hbs` | pass |
| `post.hbs` only | pass |
| `index.hbs` only | pass |
| a partial **included by** `page.hbs` | pass |
| an **orphan** partial (not included anywhere) | **FAIL** warning, `ref=page.hbs` |

So "anywhere in the theme" is true for any non-partial template, and true for partials *reached from* one (the AST linter follows `{{> partial}}` through `partialVerificationCache`) — but an orphan partial does not count.

**Sibling CONFIRMED by execution:** `{{@page.bogus_property}}` in `page.hbs` →
```
warning GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE  "{{@page.bogus_property}} is not a known @page property"  ref: page.hbs
```

**Paste-ready correction:**
> `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is a **warning** (non-fatal, identical on the v5 and v6 specs), not an error — it does not block a deploy. It fires when `{{@page.show_title_and_feature_image}}` (the sole entry in the spec's `pageBuilderProperties`) appears in **no** non-partial `.hbs` template, nor in any partial reachable from one; an orphan partial does not satisfy it. The reported `ref: page.hbs` is cosmetic — `findPageTemplateRef` emits that path unconditionally, even when no `page.hbs` exists. The sibling `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` (also warning) fires on any other `@page.*` property, so the compiler must emit `@page.show_title_and_feature_image` and nothing else from that namespace.

## 17. Routes method is `POST`, not `PUT` — **CONFIRMED**

**Report wording:** *"FR-I4's method name: `PUT /settings/routes/yaml` → **`POST`**. Covered by the FR-I4 critical's fix, listed separately because the string appears in FR-I4 verbatim."*

```js
router.get('/settings/routes/yaml', mw.authAdminApi, http(api.settings.download));
router.post('/settings/routes/yaml',
    mw.authAdminApi,
    apiMw.upload.single('routes'),
    apiMw.upload.validation({type: 'routes'}),
    http(api.settings.upload)
);
```
`ghost/core/core/server/web/api/endpoints/admin/routes.js:89-95` — https://github.com/TryGhost/Ghost/blob/291bddb60954491c10f2b744dc7efd94eff2e7a5/ghost/core/core/server/web/api/endpoints/admin/routes.js#L89-L95

No `PUT` route exists on that path (the file's ten `router.put` registrations are all on other resources). Two details worth carrying into FR-I4 alongside the method fix, both visible in the same five lines: the request is **`multipart/form-data` with the file under the field name `routes`** (`upload.single('routes')`), not a raw YAML body, and it passes through `upload.validation({type: 'routes'})`. `GET` on the same path downloads the current file.

---

## Method notes / limits of this verification

- gscan severities were **never** taken from the report or from docs. Each was read from `lib/specs/v5.js` / `lib/specs/v6.js` programmatically, then re-proved by running `gscan.check()` + `gscan.format()` on a purpose-built fixture under both `checkVersion: 'v5'` and `'v6'`. Fixtures live in `/tmp/claude-1000/-home-ghost-Dev-Inflozo/800a5718-073e-49bd-a03f-48dd7acea8ed/scratchpad/fx/{a,b,c,d}` (ephemeral).
- Ghost `main` was confirmed to be the 6.x line (`ghost/core/package.json` → `6.58.0-rc.0`), not a 7.x pre-release, before citing it as "current Ghost 6".
- Claims with a possible v5/v6 split were checked on the `5.x` branch too: `@member` shape (identical), `settings-cache/public.js` `lang`/`locale` (identical), `{{#get}}` `RESOURCES` (identical), `max-limit-cap.js` (**absent on 5.x** — the only real split found).
- **One residual gap, stated plainly:** Ghost's resolved `@tryghost/nql` version could not be read from `ghost/core/package.json` (it declares `"catalog:"`, a pnpm catalog reference). §11's NQL defect is proven against `@tryghost/nql@0.13.1`; that Ghost's runtime resolves to the same build is **not verified**.
