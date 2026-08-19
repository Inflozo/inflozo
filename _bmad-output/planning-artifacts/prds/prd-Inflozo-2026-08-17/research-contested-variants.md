---
title: Contested Section Variants — Ghost Truth
status: normative-companion
role: normative companion to prd.md — the source of truth for the six contested section variants (A7 #12, A32 #12, A32 #10, A29 #13, A27 #11, A19 #11) and for the Admin API key security policy
created: 2026-08-18
source: Ghost core source (git, commit fe7771d), installed Ghost 6.45.0 runtime, gscan 6.3.0, docs.ghost.org
---

# Contested Section Variants — Ghost Truth

**Status:** Research appendix. Every claim below carries a citation: a Ghost core source path with quoted code, an installed-runtime file, or a docs URL.

**Verified against:**

| Source | Version / ref |
|---|---|
| Ghost core (git) | `TryGhost/Ghost` commit `fe7771d1ebd84df74ad99bb8eed2cfe842022769` (2026-08-18), sparse checkout of `ghost/core` |
| Ghost runtime (installed) | `6.45.0` at `/home/ghost/Dev/arvo/versions/6.45.0` — used to enumerate schema columns and read resolved `node_modules` |
| gscan | `6.3.0` (bundled with Ghost 6.45.0) |
| `@tryghost/bookshelf-order` | `2.2.1` |
| `@tryghost/kg-default-nodes` | `2.1.2` |
| `@tryghost/helpers` | `1.1.106` |

Source URLs below use the pinned commit:
`https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/<path>`

---

## Executive summary

Two of the six review findings were **wrong**, and one of them (A7 #12) was wrong in a way that removes the entire reason to ask for an Admin API key.

| Variant | Review said | Truth | Verdict |
|---|---|---|---|
| A7 #12 Founding Member | member count is Admin-API-only | **`{{total_members}}` is a first-class core theme helper** — server-side, no key, no JS | **KEEP** (with rounding constraint) |
| A32 #12 Progress Tease | impossible | browser gets **only** the free preview, but `{{reading_time}}` is computed on the **full** post — a real denominator exists | **REDEFINE** |
| A32 #10 Blurred Preview | (contested intent) | trivially possible; theme should own `partials/content-cta.hbs` for a reliable hook | **KEEP** (redefined intent) |
| A29 #13 Filter Bar | needs Admin API | Content API only, `{{content_api_key}}` supplies the key | **REDEFINE** |
| A27 #11 Discover Shuffle | no random order | correct — no random order anywhere; client-side shuffle over Content API | **REDEFINE** |
| A19 #11 Quote Feature | no pull-quote field | correct — no such field | **REDEFINE** |

**Admin API key: never ask for it. Not once, not for any variant.** See §1.

---

## 1. SECURITY — Admin API keys and theme custom settings

### 1.1 What an Admin API key grants

A Ghost Admin API key is `<id>:<secret>`; the secret signs a short-lived HS256 JWT whose `kid` header names the key id
([`services/auth/api-key/admin.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/services/auth/api-key/admin.js)):

```js
let JWT_OPTIONS_DEFAULTS = {
    algorithms: ['HS256'],
    maxAge: '5m'
};
```

The key is bound to a hardcoded role at save time
([`models/api-key.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/models/api-key.js)):

```js
// enforce roles which are currently hardcoded
// - admin key = Adminstrator role
// - content key = no role
if (this.hasChanged('type') || this.hasChanged('role_id')) {
    if (this.get('type') === 'admin') {
        return Role.findOne({name: attrs.role || 'Admin Integration'}, ...)
```

The `Admin Integration` role's permission grant, verbatim from
[`data/schema/fixtures/fixtures.json`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/data/schema/fixtures/fixtures.json) (line 1013):

```json
"Admin Integration": {
  "mail": "all", "notification": "all", "post": "all", "setting": "all",
  "slug": "all", "tag": "all", "theme": "all", "user": "all", "role": "all",
  "invite": "all", "redirect": "all", "webhook": "all", "action": "all",
  "member": "all", "label": "all", "member_custom_field": "all",
  "automated_email": "all", "email_design_setting": "all",
  "email_preview": "all", "email": "all", "snippet": "all",
  "product": ["browse","read","add","edit"],
  "offer": ["browse","read","add","edit"],
  "newsletter": ["browse","read","add","edit"],
  "comment": "all", "link": "all", "mention": "browse", "collection": "all",
  "recommendation": "all", "automation": ["browse","read","edit"],
  "member_signin_url": "read", "gift_link": "manage"
}
```

Read that list carefully. An Admin API key is **not** "read a member count". It is:

- `member: "all"` — read, edit, delete, and **export** every member record, including every email address. Full PII / GDPR breach.
- `member_signin_url: "read"` — `GET /ghost/api/admin/members/:id/signin_urls`
  ([`admin/routes.js:176`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/endpoints/admin/routes.js#L176)).
  This mints a magic link that logs the bearer in **as any member**. Silent impersonation of paying subscribers.
- `theme: "all"` — upload and activate an arbitrary theme zip. Attacker-controlled Handlebars and arbitrary files under `content/themes/`. Full site takeover.
- `user: "all"` + `invite: "all"` + `role: "all"` — create an Administrator invite and take over the Ghost admin account.
- `setting: "all"` — rewrite site settings including `codeinjection_head`, i.e. persistent XSS on every page for every visitor.
- `post: "all"` — publish, edit, delete anything; `email: "all"` — send email to the whole list from the site's own domain.

Ghost's own docs say the same in plain words
([docs.ghost.org/admin-api](https://docs.ghost.org/admin-api)):

> "The admin API key must be kept private, therefore token authentication is not suitable for browsers or other insecure environments."
>
> "It is not safe to swap keys for tokens in the browser, or in any other insecure environment."

### 1.2 Are `@custom.*` values exposed publicly?

Answer in three parts. Two are "no", and the third is the one that matters.

**(a) Not via any public API.** Custom theme settings are served by one endpoint, and it is Admin-only
([`admin/routes.js:412-413`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/endpoints/admin/routes.js#L412)):

```js
router.get('/custom_theme_settings', mw.authAdminApi, http(api.customThemeSettings.browse));
router.put('/custom_theme_settings', mw.authAdminApi, http(api.customThemeSettings.edit));
```

There is no `custom_theme_settings` route in
[`content/routes.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/endpoints/content/routes.js) — confirmed by enumeration. Nor is any custom setting in the public settings allowlist
([`shared/settings-cache/public.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/shared/settings-cache/public.js), 60 keys, all site-branding/portal/labs).

**(b) Not baked into "compiled output".** There is no compiled theme output. Values live in the DB, are held in `customThemeSettingsCache`, and are injected into the Handlebars data frame per request
([`theme-engine/middleware/update-global-template-options.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/theme-engine/middleware/update-global-template-options.js)):

```js
const themeSettingsData = customThemeSettingsCache.getAll();
hbs.updateTemplateOptions({
    data: { site: {...}, labs: labsData, config: themeData, custom: themeSettingsData }
});
```

The `x-ghost-preview` header only **overrides** custom values for a preview render; it cannot read stored ones
([`theme-engine/preview.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/theme-engine/preview.js)).

**(c) But a theme can only *use* a custom setting by printing it.** This is the decisive fact. `@custom.x` is a Handlebars data value. Handlebars in Ghost cannot make an HTTP request — there is no server-side fetch primitive available to a theme. So the only way a theme can act on an Admin API key stored in `@custom.admin_api_key` is to emit it into the rendered page (as text, an attribute, or a JS string) and have browser JS sign the JWT. **Storing the key is only useful if you leak it.** The storage is private; the use is not, and there is no use that isn't.

And it does not even fail closed. Ghost's Admin API CORS allowlist explicitly includes the **site's own hostname**
([`web/api/middleware/cors.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/middleware/cors.js)):

```js
function getUrls() {
    const blogHost = url.parse(urlUtils.urlFor('home', true)).hostname;
    const adminHost = url.parse(urlUtils.urlFor('admin', true)).hostname;
    const urls = [];
    urls.push(blogHost);
    ...
}
```

...and in a standard Ghost install the Admin API is same-origin with the frontend anyway (`https://site.com/ghost/api/admin/`). **Do not rely on CORS to save you.** Browser JS on a Ghost theme can call the Admin API successfully. The only thing stopping an attacker is not having the key — and the theme would be handing it to them.

> Note for contrast: the **Content** API mounts plain permissive CORS
> ([`content/routes.js:14`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/endpoints/content/routes.js#L14)):
> `router.use(cors({maxAge: config.get('caching:cors:maxAge')}));` — `origin: *`, by design.

### 1.3 VERDICT

> **Putting an Admin API key in a Ghost theme custom setting is unsafe. Inflozo must never offer, request, accept, or store an Admin API key — at build time, deploy time, or runtime.**

Blast radius of one leaked Admin key: full member list exfiltration (every subscriber email), silent login-as-any-member, arbitrary theme upload (site takeover / arbitrary file write), persistent XSS via `codeinjection_head`, Administrator account creation, and the ability to email the entire subscriber list from the customer's own domain. This is a total compromise of the customer's publication and of their readers' PII, from a value that any visitor can read with View Source. For a product that generates themes for other people's sites, one such leak is a breach across every customer who enabled that section.

Also note the owner's framing cost: the 20-setting cap is real (gscan `hasTooManyCustomThemeSettings`, §1.5), so this proposal would spend a scarce slot on a live grenade.

### 1.4 Safe alternatives for privileged data

Ranked, laziest-that-works first:

**(c) Do without — and prefer this.** For the one variant that motivated the request (A7 #12 member count), Ghost already ships `{{total_members}}` server-side with no key at all (§2). The Admin API was never needed. Before building any proxy, check whether a core helper or the Content API already covers it — for all six variants here, it does.

**(a) Deploy-time bake.** Inflozo's server holds an OAuth-ish/one-time-use credential, calls the Admin API once during theme publish, and writes the resulting scalar into the generated theme as a literal. Cost: staleness (the number is frozen at publish; a site that publishes monthly shows a month-old count), plus Inflozo now custodies a full-takeover credential for every customer — a very large liability for a scalar. Only justifiable for values with no other source and low volatility. **Not needed for any of the six.**

**(b) Runtime proxy.** Inflozo hosts `GET https://api.inflozo.com/v1/site/:siteId/member-count`, holds the credential server-side, caches aggressively, returns only the rounded scalar. The theme fetches it with plain JS and no secret. This is the correct shape *if* privileged data is ever genuinely required. Costs: Inflozo becomes a runtime dependency of customer sites (uptime, latency, CORS, rate limiting, abuse), and still custodies Admin keys. **Not needed for any of the six.** Do not build it speculatively.

For everything in this document, the answer is (c) plus the Content API — no Inflozo server involvement, no keys the user must paste.

### 1.5 Supporting facts about custom settings

Ghost/gscan constraints, from
[`gscan/lib/checks/010-package-json.js`](https://github.com/TryGhost/gscan/blob/main/lib/checks/010-package-json.js) (v6.3.0 as installed):

```js
if (customSettingsKeys.length > 20) {
    markFailed('hasTooManyCustomThemeSettings');
}
...
const knownSettingsTypes = new Set(['select', 'boolean', 'color', 'image', 'text']);
...
const knownSettingsGroups = new Set(['post', 'homepage']);
```

So: **20 settings maximum** (real, enforced by theme validation), keys must be `snake_case`, types are limited to `select | boolean | color | image | text`, and `group` (which controls where the setting appears in the Ghost admin sidebar) may only be `post` or `homepage`. There is no `password`/secret type — another signal that this store was never intended for credentials.

---

## 2. A7 #12 "Founding Member" — live member count

### 2.1 The review was wrong

Ghost ships two core theme helpers for exactly this. From
[`frontend/services/helpers/register-ghost-helpers.js:53-54`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/helpers/register-ghost-helpers.js#L53):

```js
registry.registerHelper('total_members', require('../../helpers/total_members'));
registry.registerHelper('total_paid_members', require('../../helpers/total_paid_members'));
```

[`frontend/helpers/total_members.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/total_members.js) in full:

```js
const {SafeString} = require('../services/handlebars');
const {memberCountRounding, getMemberStats} = require('../utils/member-count');

module.exports = async function total_members () {
    if (this.total) {
        return new SafeString(memberCountRounding(this.total));
    } else {
        let memberStats = await getMemberStats();
        const {total} = memberStats;
        return new SafeString(total > 0 ? memberCountRounding(total) : 0);
    }
};
module.exports.async = true;
```

The data comes from the **internal** stats API, called server-side inside the render, with no key
([`frontend/utils/member-count.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/utils/member-count.js)):

```js
async function getMemberStats() {
    let memberStats = this.data || await api.stats.memberCountHistory.query();
    const {free, paid, comped, gift} = memberStats.meta.totals;
    let total = free + paid + comped + gift;
    return {free, paid, comped, gift, total};
}
```

Docs: [docs.ghost.org/themes/helpers/data/total_members](https://docs.ghost.org/themes/helpers/data/total_members) — *"The `total_members` helper outputs a rounded number of total members from your Ghost publication in a human readable format."*

gscan recognises both as known helpers, so a theme using them validates
(`gscan/lib/specs/v5.js:18`):

```js
let knownHelpers = ['total_members', 'total_paid_members', 'comment_count', 'comments',
  'recommendations', 'readable_url', 'content_api_url', 'content_api_key', 'social_url'];
```

### 2.2 The one real constraint: privacy rounding

Output is **rounded down and suffixed**, never exact
([`frontend/utils/member-count.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/utils/member-count.js)):

```js
const memberCountRounding = (memberCount) => {
    if (memberCount <= 50)      return numberWithCommas(memberCount);
    if (memberCount <= 100)     return `${numberWithCommas(rounding(memberCount, 10))}+`;
    if (memberCount <= 1000)    return `${numberWithCommas(rounding(memberCount, 50))}+`;
    if (memberCount <= 10000)   return `${numberWithCommas(rounding(memberCount, 100))}+`;
    if (memberCount <= 100000)  return `${numberWithCommas(rounding(memberCount, 1000))}+`;
    if (memberCount <= 1000000) return `${humanNumber(rounding(memberCount, 10000)).toLowerCase()}+`;
    return `${humanNumber(rounding(memberCount, 100000)).toLowerCase()}+`;
};
```

So a site with 1,225 members renders `1,200+`, not `1,200`. **The copy must be written around a string, not a number**: `Join {{total_members}} members` → "Join 1,200+ members". Never `Join {{total_members}} members` in a sentence that implies exactness, and never attempt arithmetic on it — it is a `SafeString`, not a number.

Second constraint: sites with 0 members render `0`. The variant must hide itself in that case. There is no `{{#if}}`-able numeric form, so gate on `{{#if @site.members_enabled}}` (a real public setting — see `settings-cache/public.js`) and accept that a brand-new site shows `Join 0 members` unless the section also has an explicit "hide count" boolean. Recommend the boolean.

### 2.3 Recommendation — **KEEP as defined**, with corrected copy

| Aspect | Answer |
|---|---|
| **Definition** | `A7 #12 Founding Member`: headline + benefit list + Portal CTA + a social-proof line rendering `{{#if @custom.a7_show_member_count}}{{t "Join {count} members" count=(total_members)}}{{/if}}`. Also offer `{{total_paid_members}}` as a `select` between `all` / `paid`. |
| **Data source** | Core helper `{{total_members}}` → internal stats API, server-side |
| **Needs JS?** | No |
| **Needs a key?** | **No** — this is the finding that kills the Admin-API-key proposal |
| **No-JS degradation** | N/A — fully server-rendered |
| **Canvas preview** | Yes, faithfully. The canvas substitutes a plausible rounded literal (`"1,200+"`). Because the real output is *always* a rounded string, the canvas sample is structurally identical to production output — no fidelity gap. Sample must include the `+`. |
| **Copy constraint** | Number is rounded down with a `+` suffix. String, not integer. |
| **Not recommended** | A manually-typed number custom setting. It burns one of 20 slots, goes stale, and is strictly worse than a live helper that already exists. |

### 2.4 On "Dashi does this"

Investigated. Dashi is a commercial Ghost theme by Bright Themes
([brightthemes.com/themes/dashi](https://brightthemes.com/themes/dashi), demo `dashi.brightthemes.com`). Its documented custom settings are colour scheme, homepage layout, and post template
([brightthemes.com/docs/dashi](https://brightthemes.com/docs/dashi)) — **no member-count setting or feature is documented**. Whatever the owner remembers seeing is almost certainly either (a) the `{{total_members}}` helper, which any theme can use and which is the correct answer regardless, or (b) a member-only **post count** trick, which is a different thing and is done with `{{#get}}`
([gloathost.com](https://www.gloathost.com/blog/show-your-member-only-post-count-in-a-ghost-theme/)):

```hbs
{{#get "posts" filter="visibility:members,visibility:paid" limit="all"}}
    Become a member to support {{@site.title}} and get access to {{posts.length}} member-only posts.
{{/get}}
```

That second pattern is worth having as an alternate `select` value on A7 #12 (`count_source: members | paid_members | member_posts`) — it is free, server-side, keyless, and gives new sites a non-zero number to show. Caveat: `limit="all"` is capped at 100 in Ghost 6 (§5.2), so `{{posts.length}}` maxes out at 100. Use `{{pagination.total}}` inside the `{{#get}}` block instead, which reports the true total.

---

## 3. A32 #12 "Progress Tease" — "you've read 30%"

### 3.1 What the browser actually receives for a gated post

**Only the free preview. Ghost truncates server-side.** From
[`api/endpoints/utils/serializers/output/utils/post-gating.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/utils/serializers/output/utils/post-gating.js):

```js
const memberHasAccess = membersService.contentGating.checkPostAccess(attrs, frame.original.context.member);

if (!memberHasAccess) {
    const paywallIndex = (attrs.html || '').indexOf('<!--members-only-->');

    if (paywallIndex !== -1) {
        attrs.html = attrs.html.slice(0, paywallIndex);
        _updateTextAttrs(attrs);
    } else {
        ['plaintext', 'html', 'excerpt'].forEach((field) => {
            if (attrs[field] !== undefined) {
                attrs[field] = '';
            }
        });
    }
}
```

Two branches, both important:

1. Post **has** a paywall card → html is sliced at the marker. The paid remainder never leaves the server.
2. Post has **no** paywall card → `html`, `plaintext` and `excerpt` are all set to `''`. **There is no preview at all.** Any progress UI must handle this.

The marker itself is emitted by the Koenig paywall card
(`@tryghost/kg-default-nodes@2.1.2`, `nodes/paywall/paywall-renderer.js`):

```js
const element = document.createElement('div');
element.appendChild(document.createComment('members-only'));
// `type: 'inner'` will render only the innerHTML of the element
return { element, type: 'inner' };
```

This gating applies to the **theme render too**, not just the Content API: the frontend entry controller resolves posts through `require('../proxy').api`
([`frontend/services/data/entry-lookup.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/data/entry-lookup.js), `frontend/services/proxy.js:95 → api: require('../../server/api').endpoints`), i.e. the same `mappers/posts.js` → `gating.forPost` pipeline.

So the owner's instinct ("this should be implemented by JavaScript") is right about *where* the code runs, but JS alone has no denominator — the paid body simply isn't there to measure.

### 3.2 A denominator does exist: `reading_time` is computed pre-gating

This is the non-obvious finding. In
[`mappers/posts.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/utils/serializers/output/mappers/posts.js), the call order is:

```
line  64:  extraAttrs.forPost(frame.options, model, jsonModel);   // computes reading_time
line 100:  gating.forPost(jsonModel, frame);                       // truncates html
line 136:  clean.post(jsonModel, frame);
```

`extraAttrs` runs **first**, on the untruncated html
([`output/utils/extra-attrs.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/utils/serializers/output/utils/extra-attrs.js)):

```js
// 4. Add `reading_time` if no columns were requested, or if `reading_time` was requested via `columns`
if (noColumnsRequested || columnsIncludesReadingTime) {
    if (attrs.html) {
        let additionalImages = 0;
        if (attrs.feature_image) { additionalImages += 1; }
        attrs.reading_time = readingMinutes(attrs.html, additionalImages);
    }
}
```

And the theme helper prefers the precomputed value over recomputing from the (now truncated) html
(`@tryghost/helpers@1.1.106`, `lib/reading-time.js`):

```js
const time = post.reading_time || readingMinutes(post.html, imageCount);
```

**Therefore `{{reading_time}}` on a paywalled post reports the reading time of the FULL post, including the part the visitor cannot see.** That is a legitimate, server-supplied denominator, available with no key and no Admin API. It is also exposed on the Content API for gated posts, same mapper.

`gating.forPost` recomputes `plaintext`/`excerpt` after truncation (`_updateTextAttrs`) but **does not** recompute `reading_time` — verified by reading the function in full. No word-count field exists on posts at all; the posts schema has no `word_count` column (enumerated from `data/schema` on Ghost 6.45.0: `id, uuid, title, slug, mobiledoc, lexical, html, comment_id, plaintext, feature_image, featured, type, status, locale, visibility, email_recipient_filter, created_at, updated_at, published_at, published_by, custom_excerpt, codeinjection_head, codeinjection_foot, custom_template, canonical_url, newsletter_id, show_title_and_feature_image`).

### 3.3 Precision limits — what JS can *honestly* show

The denominator is coarse. `readingMinutes` rounds to whole minutes
(`@tryghost/helpers/lib/utils/reading-minutes.js`):

```js
export function estimatedReadingTimeInMinutes({wordCount, imageCount}) {
    const wordsPerMinute = 275;
    const wordsPerSecond = wordsPerMinute / 60;
    let readingTimeSeconds = wordCount / wordsPerSecond;
    for (var i = 12; i > 12 - imageCount; i -= 1) { readingTimeSeconds += Math.max(i, 3); }
    let readingTimeMinutes = Math.round(readingTimeSeconds / 60);
    return readingTimeMinutes;
}
```

`Math.round` to minutes at 275 wpm means the full-post word count is known only to **±137 words**. On a 2-minute post that is a ±25pp error on the percentage; on a 10-minute post, ±5pp. Images also contribute up to 12s each, further blurring the mapping from minutes back to words.

So an honest JS implementation:

- **can** compute the preview's word count exactly (it's in the DOM)
- **can** estimate the full word count as `reading_time × 275`
- **must** present the ratio as approximate, bucketed, and clamped — never as a precise "30%"
- **must** hide itself entirely when `reading_time <= 2` (error too large) or when the preview is empty (the no-paywall-card branch)

### 3.4 Recommendation — **REDEFINE**

Redefine A32 #12 from "you've read 30%" to a **reading-progress tease** with an honest, hedged number and a fully server-rendered fallback.

| Aspect | Answer |
|---|---|
| **Definition** | Rendered inside/above the paywall CTA on a gated post. **Baseline (server-rendered, always present):** `{{t "You've reached the end of the free preview — {time} in total." time=(reading_time)}}`. **JS enhancement (progressive):** a bar + label `About X% read` where `X = round5(previewWords / (readingTimeMinutes × 275) × 100)`, clamped to 5–95, rendered only when `readingTimeMinutes >= 3` and `previewWords > 0`. The theme emits `data-reading-minutes="{{reading_time minute="1" minutes="%"}}"` on the section for the script to read. |
| **Data source** | `{{reading_time}}` (core helper, computed pre-gating on the full post) + DOM word count of the delivered preview |
| **Needs JS?** | Only for the percentage/bar. The sentence is server-rendered. |
| **Needs a key?** | No |
| **No-JS degradation** | Full sentence with the real total reading time; no bar, no percentage. Nothing is missing or broken. |
| **Canvas preview** | Yes, with an explicit caveat. The canvas renders the bar at a fixed sample percentage (e.g. 35%) plus the sentence with a sample reading time. Faithful in layout and copy; the *number* is synthetic — but so is every number in the canvas, and the builder never reads post body HTML, so it could not compute a real one anyway. Acceptable. |
| **Honesty guard** | Copy must say "About X%" / "~X%", never a bare precise percentage. Section must self-hide when `reading_time < 3` or the preview is empty. |

---

## 4. A32 #10 "Blurred Preview"

### 4.1 The owner's clarified intent is correct and easy

Blurring the **last visible free-preview block, immediately before the gate CTA** operates entirely on content the browser already has. No missing data, no API, no JS. It is a CSS mask/gradient. Confirmed straightforward.

(For the record, the reverse — blurring content the server never sent — remains impossible, per §3.1. The clarified intent avoids that entirely.)

### 4.2 Exactly where the paywall cut falls in the emitted DOM

`{{content}}` on a gated post does not emit the raw html; it delegates to the `content-cta` template
([`frontend/helpers/content.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/content.js)):

```js
if (!_.isUndefined(this.access) && !this.access) {
    return restrictedCta.apply(self, args);
}
```
```js
function restrictedCta(options) {
    ...
    const data = createFrame(options.data);
    return templates.execute('content-cta', this, {data});
}
```

And `content-cta.hbs` begins with the truncated html, unwrapped
([`frontend/helpers/tpl/content-cta.hbs`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/tpl/content-cta.hbs)):

```hbs
{{{html}}}
<aside class="gh-post-upgrade-cta">
    <div class="gh-post-upgrade-cta-content" style="background-color: {{@site.accent_color}}">
    ...
```

Combined with a typical theme wrapper — the official Source theme, `post.hbs:54-56`:

```hbs
<section class="gh-content gh-canvas is-body{{#if @custom.enable_drop_caps_on_posts}} drop-cap{{/if}}">
    {{content}}
</section>
```

the emitted DOM for a gated post is:

```html
<section class="gh-content">
  <p>…free preview block 1…</p>
  <p>…free preview block 2…</p>
  <p>…LAST VISIBLE BLOCK — this is the blur target…</p>
  <aside class="gh-post-upgrade-cta"> … </aside>
</section>
```

**Answer to "does Ghost wrap the visible portion?" — No.** The preview blocks are emitted bare as direct siblings of the `<aside>`. The theme must handle it.

### 4.3 How to target the tail reliably

Two options; take the second.

**Option A (no theme file, modern CSS):** `:has()` previous-sibling selection —

```css
.gh-content > *:has(+ aside.gh-post-upgrade-cta) {
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, transparent 100%);
}
```

Works, requires no extra file, and degrades to "no blur" on old browsers. But it depends on `.gh-post-upgrade-cta` staying a *direct* sibling under the theme's content wrapper.

**Option B — recommended: own the partial.** A theme may override the core CTA template by shipping `partials/content-cta.hbs`; theme partials are registered after core ones and win
([`theme-engine/engine.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/theme-engine/engine.js)):

```js
const hbsOptions = {
    partialsDir: [config.get('paths').helperTemplates],   // core tpl/ first
    ...
};
if (partialsPath) {
    hbsOptions.partialsDir.push(partialsPath);            // theme partials last → override
}
```

Confirmed as the documented community pattern
([brightthemes.com/blog/ghost-content-cta](https://brightthemes.com/blog/ghost-content-cta): *"To override it, you must create `partials/content-cta.hbs` in your theme."*).

Inflozo therefore ships:

```hbs
{{! partials/content-cta.hbs }}
<div class="inflozo-gated-preview">{{{html}}}</div>
<aside class="gh-post-upgrade-cta inflozo-gate">
  ...Inflozo's own gate markup, matching the chosen A32 variant...
</aside>
```

```css
.inflozo-gated-preview > :last-child {
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 30%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 30%, transparent 100%);
}
```

`:last-child` is universally supported, the hook is Inflozo-owned and cannot drift with core, and the same partial is the natural home for A32 #12's progress tease (§3.4) and for the gate CTA copy. One file solves three variants.

**Complications to encode in the section definition:**

1. **Empty preview.** When the author forgot the paywall card, `html` is `''` (§3.1) — `.inflozo-gated-preview` is empty, `:last-child` matches nothing, no blur. Degrades silently and correctly. But the gate CTA then appears with zero content above it; the A32 variants must look acceptable in that state.
2. **`{{content}}` must be the only content emitter.** If a theme calls `{{content words="..."}}` the truncate branch runs *before* the access check? No — the access check is first (`if (!_.isUndefined(this.access) && !this.access) return restrictedCta(...)`), so `words=`/`characters=` are ignored on gated posts. Inflozo's post template should not rely on truncation on gated posts.
3. **Blur vs. mask.** Use `mask-image` (a fade), not `filter: blur()`. `filter: blur()` on a text block bleeds outside the box and forces a stacking context; a mask gradient is one property, GPU-cheap, and doesn't affect layout. Also add `pointer-events` untouched — the text is still selectable, which is fine because it is free content by definition.
4. **Accessibility.** A fade is purely decorative; the text remains in the accessibility tree and readable by screen readers. This is correct — do **not** add `aria-hidden`, and do not clip it with `overflow:hidden` + fixed height, which would hide free content from assistive tech.

### 4.4 Recommendation — **KEEP as defined** (with the clarified intent)

| Aspect | Answer |
|---|---|
| **Definition** | `A32 #10 Blurred Preview`: Inflozo-owned `partials/content-cta.hbs` wrapping `{{{html}}}` in `.inflozo-gated-preview`; CSS `mask-image` fade on `> :last-child`; gate CTA below. Optional `@custom` boolean to disable the fade. |
| **Data source** | The already-delivered free preview HTML. Nothing else. |
| **Needs JS?** | No |
| **Needs a key?** | No |
| **No-JS degradation** | Identical — it is pure CSS. On browsers without `mask-image` (none current), the tail simply renders unfaded. |
| **Canvas preview** | Yes, faithfully — it is a CSS effect over placeholder body text, and the canvas already renders placeholder body text without reading real post HTML. Full fidelity. |

---

## 5. A29 #13 "Filter Bar Attached" — sort/filter strip on an archive

### 5.1 No Admin API needed. The Content API is public and browser-safe.

Ghost's own docs ([docs.ghost.org/content-api](https://docs.ghost.org/content-api)):

> "Content API keys are safe for use in browsers and other insecure environments, as they only ever provide access to public data."

Content API auth is a plain query-string key lookup, no signing
([`services/auth/api-key/content.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/services/auth/api-key/content.js)), and the key's role is `null` (`models/api-key.js`: *"content key = no role"*). CORS is wide open by design
([`content/routes.js:14`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/api/endpoints/content/routes.js#L14)).

**And the user does not have to paste anything.** Ghost ships `{{content_api_key}}` and `{{content_api_url}}` as theme helpers
([`register-ghost-helpers.js:13-14`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/services/helpers/register-ghost-helpers.js#L13)):

```js
registry.registerHelper('content_api_key', require('../../helpers/content_api_key'));
registry.registerHelper('content_api_url', require('../../helpers/content_api_url'));
```

`{{content_api_key}}` emits Ghost's built-in internal frontend key
([`frontend/helpers/content_api_key.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/content_api_key.js) → `frontend/services/proxy.js`):

```js
getFrontendKey: async () => {
    try {
        const key = await internalKeys.get('ghost-internal-frontend');
        return key.secret;
    } ...
}
```

This is **the same key Ghost itself injects for sodo-search**
([`frontend/helpers/ghost_head.js:155-166`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/ghost_head.js#L155)):

```js
function getSearchHelper(frontendKey) {
    const adminUrl = urlUtils.getAdminUrl() || urlUtils.getSiteUrl();
    const {scriptUrl, stylesUrl} = getFrontendAppConfig('sodoSearch');
    ...
    const attrs = { key: frontendKey, styles: stylesUrl, 'sodo-search': adminUrl, ... };
    const dataAttrs = getDataAttributes(attrs);
    let helper = `<script defer src="${scriptUrl}" ${dataAttrs} crossorigin="anonymous"></script>`;
    return helper;
}
```

So Ghost core already puts this exact key in a `data-key` attribute in the `<head>` of every page of every Ghost site. A theme doing the same is doing precisely what core does. Both helpers are gscan-known (`gscan/lib/specs/v5.js:18`), so themes using them validate. **Zero custom settings consumed, zero user setup, no Admin API.**

### 5.2 What `GET /content/posts/` actually supports

Options declared on the endpoint
([`api/endpoints/posts-public.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/posts-public.js)):

```js
options: [
    'include', 'filter', 'fields', 'formats', 'limit', 'order',
    'page', 'debug', 'absolute_urls', 'collection', 'skipPagination'
],
```
```js
const ALLOWED_INCLUDES = ['tags', 'authors', 'tiers', 'sentiment'];
```

So **yes** to `filter`, `order`, `limit`, `page`.

**Orderable fields.** `order` is parsed by `@tryghost/bookshelf-order@2.2.1`:

```js
match = /^([a-z0-9_.]+)\s+(asc|desc)$/i.exec(rule.trim());
if (!match) { return; }               // invalid syntax → rule silently dropped
...
const matchingOrderAttribute = orderAttributes.find(a => a.endsWith(field));
if (!matchingOrderAttribute) { return; }   // unknown field → silently dropped
```

and `orderAttributes` is derived straight from the schema (`models/base/index.js`):

```js
orderAttributes: function orderAttributes() {
    return Object.keys(schema.tables[this.tableName])
        .map(key => `${this.tableName}.${key}`)
        .filter(key => key.indexOf('@@') === -1);
},
```

with posts adding `posts_meta` columns and two raw cases (`models/post.js`):

```js
orderAttributes: function orderAttributes() {
    let keys = ghostBookshelf.Model.prototype.orderAttributes.apply(this, arguments);
    let postsMetaKeys = _.without(ghostBookshelf.model('PostsMeta').prototype.orderAttributes(), 'posts_meta.id', 'posts_meta.post_id');
    return [...keys, ...postsMetaKeys];
},
orderRawQuery: function orderRawQuery(field, direction, withRelated) {
    if (field === 'sentiment') { ... }
    if (field === 'email.open_rate' && ...) { ... }
},
```

**Orderable on the Content API (practically useful subset):**
`published_at`, `updated_at`, `created_at`, `title`, `slug`, `featured`, `visibility`, `type`, `status`, `uuid`, `id`, `custom_excerpt`, `feature_image`, `canonical_url`, plus `posts_meta` columns (`meta_title`, `email_subject`, `feature_image_alt`, …). `sentiment` requires `include=sentiment`. `email.open_rate` is Admin-only.
**Not orderable:** anything computed — `reading_time`, tag name, author name, comment count, and (critically) **random**.

**Filterable fields** are NQL over the same columns plus these relation expansions (`models/post.js` `filterExpansions`):

```js
{key: 'primary_tag',    replacement: 'tags.slug',    expansion: 'posts_tags.sort_order:0+tags.visibility:public'},
{key: 'primary_author', replacement: 'authors.slug', expansion: 'posts_authors.sort_order:0+authors.visibility:public'},
{key: 'authors', replacement: 'authors.slug'},
{key: 'author',  replacement: 'authors.slug'},
{key: 'tag',     replacement: 'tags.slug'},
{key: 'tags',    replacement: 'tags.slug'},
```

So `filter=tag:design`, `filter=tags:[design,code]`, `filter=primary_author:jane`, `filter=featured:true`, `filter=visibility:paid`, `filter=published_at:>'2026-01-01'` all work.

Restrictions worth knowing:
- `email` and `password` are stripped from any Content API filter
  ([`api/endpoints/utils/api-filter-utils.ts`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/utils/api-filter-utils.ts)):
  `const CONTENT_API_RESTRICTED_FIELDS = new Set(['password','email']);`
- Public context forces published-only (`models/post.js`):
  ```js
  enforcedFilters: function enforcedFilters(options) {
      return options.context && options.context.public ? 'status:published' : null;
  },
  defaultFilters: function defaultFilters(options) {
      ...
      return options.context && options.context.public ? 'type:post' : 'type:post+status:published';
  },
  ```

**`limit` is hard-capped at 100 in Ghost 6.** From
[`core/shared/max-limit-cap.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/shared/max-limit-cap.js):

```js
// Prior to Ghost 6.x we allowed any limit value, including 'all', but as sites
// grew in size it led to performance issues and mis-use of the API.
// After Ghost 6.x we only allow a max limit of 100.
const limitConfig = {
    get allowLimitAll() { return config.get('optimization:allowLimitAll') || false; },
    get maxLimit()      { return config.get('optimization:maxLimit') || 100; },
    exceptionEndpoints: ['/ghost/api/admin/posts/export/', '/ghost/api/admin/emails/']
};
...
if (limit === 'all') { return limitConfig.maxLimit; }
const numericLimit = parseInt(String(limit), 10);
if (isNaN(numericLimit) || numericLimit > limitConfig.maxLimit) { return limitConfig.maxLimit; }
```

enforced by middleware mounted on the whole API app
([`web/shared/middleware/max-limit-cap.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/web/shared/middleware/max-limit-cap.js), mounted at `web/api/app.js:24`):

```js
req.query.limit = cappedLimit;
```

**and the same cap applies to `{{#get}}`** ([`frontend/helpers/get.js:200`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/get.js#L200)):

```js
// Adjust limit to Ghost's max allowed value (default: 100 and no limit=all)
if (options.limit) {
    options.limit = applyLimitCap(options.limit);
}
```

So: **100 posts per request, paginate with `page` for more.**

**One escape hatch worth noting.** `GET /content/search-index/posts/` sets its limit internally and therefore bypasses the middleware cap
([`api/endpoints/search-index-public.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/server/api/endpoints/search-index-public.js)):

```js
const options = {
    filter: 'type:post',
    limit: '10000',
    order: 'updated_at DESC',
    columns: requiredUrlColumns('posts', ['id','slug','title','excerpt','url','updated_at','visibility']),
    ...urlRelationsForRouting()
};
```

Up to **10,000 posts in one public request** — but only those seven fields. **No `feature_image`, no `tags`, no `published_at`.** That makes it unsuitable for a visual card grid or tag filtering, so A29/A27 should use `/content/posts/` with `limit=100&include=tags`. Flag it as a future option if a text-only archive variant is ever wanted.

### 5.3 The no-JS story is the important design constraint

A theme cannot add filtered routes: Ghost's dynamic routing lives in `routes.yaml`, which is a **site-level file uploaded separately in Ghost Admin → Settings → Labs**, not part of a theme package. Inflozo ships a theme; it cannot ship routes. And Ghost's channel/collection controllers do not honour arbitrary `?filter=` / `?order=` query parameters on frontend URLs.

So the only server-rendered filtering available to a theme is **links to routes Ghost already has**: `/tag/:slug/`, `/author/:slug/`, and the paginated index. That is the honest no-JS baseline, and it is a good one.

### 5.4 Recommendation — **REDEFINE**

Redefine A29 #13 from "sort/filter strip" to a **progressively-enhanced filter strip**: real links first, client-side refetch as an enhancement.

| Aspect | Answer |
|---|---|
| **Definition** | A horizontal strip attached above the archive grid. **Baseline (server-rendered):** `{{#get "tags" limit="12" order="name asc" filter="visibility:public"}}` renders `<a href="{{url}}">{{name}}</a>` chips plus an "All" chip pointing at the archive root — real navigation, real Ghost routes. **JS enhancement:** click is intercepted, the grid is refetched from `{{content_api_url}}posts/?key={{content_api_key}}&limit=12&include=tags&filter=tag:<slug>&order=<order>`, cards are re-rendered, `history.pushState` keeps the URL honest. A `select` custom setting chooses the sort axis offered (`published_at desc` / `published_at asc` / `title asc` / `featured desc,published_at desc`). |
| **Data source** | Content API `GET /content/posts/` (+ `{{#get "tags"}}` for the chips) |
| **Needs JS?** | Only for in-place filtering/sorting. Navigation works without it. |
| **Needs a key?** | A **Content** API key — supplied automatically by `{{content_api_key}}`. **The user pastes nothing. Zero custom settings consumed. No Admin API.** |
| **No-JS degradation** | Chips are ordinary links to `/tag/:slug/` archives. Sort options that have no route (e.g. "title A–Z") must be **hidden when JS is absent** — render them via the script, not the template, or mark the strip `hidden` and unhide in JS. |
| **Canvas preview** | Yes, structurally. The canvas renders the chip row and grid from placeholder tags/posts; the "active chip" state is previewable. Live refetch is not simulated — the canvas shows one static filtered state. Acceptable, and consistent with how the canvas treats every list. |
| **Hard limits to encode** | `limit` max 100 per request; orderable fields restricted to real columns (§5.2); `filter` cannot touch `email`/`password`; only published posts are ever returned. |

---

## 6. A27 #11 "Discover Shuffle" — randomized picks

### 6.1 Confirmed: no random ordering anywhere in Ghost

`{{#get}}` passes `order` through to the same parser as the API
(`@tryghost/bookshelf-order@2.2.1`):

```js
match = /^([a-z0-9_.]+)\s+(asc|desc)$/i.exec(rule.trim());
if (!match) { return; }
```

Every rule must be `<field> asc|desc`, and `<field>` must resolve against `orderAttributes()` (schema columns) or `orderRawQuery()` (only `sentiment` and `email.open_rate`). There is no `random`, no `rand()`, no seed parameter, and no raw-SQL escape hatch exposed to themes or to the Content API. `{{#get}}` also inherits the 100 cap (`get.js:200`). **Confirmed: server-side randomisation is impossible.**

### 6.2 The client-side approach and its real limits

Over-fetch, then shuffle in the browser.

- **Pool size:** one Content API request returns at most **100** posts (§5.2). Sites with more than 100 posts will always shuffle within a 100-post window unless the script pages. Paging N times costs N round trips; two pages (200 posts) is a reasonable ceiling before the latency is user-visible.
- **Window bias:** the pool is whatever `order` selected — by default the 100 most recent. So "shuffle" honestly means *"a random pick from the 100 most recent posts"*, not *"a random pick from the archive"*. Say so in the section description; do not imply archive-wide randomness.
- **Cheap bias fix:** randomise the `page` parameter first (`page = 1 + floor(random × min(totalPages, 5))`, reading `meta.pagination.pages` from a cheap first call), then shuffle within that page. One extra request, much better coverage. Optional; skip unless a customer asks.
- **Shuffle correctness:** use Fisher–Yates. `array.sort(() => Math.random() - 0.5)` is not a uniform shuffle and is a classic 3am bug.
- **Caching:** Content API responses are `Cache-Control: public` (`content/app.js`: `apiApp.use(shared.middleware.cacheControl('public', {maxAge: config.get('caching:contentAPI:maxAge')}))`). Randomising client-side (not server-side) is therefore also the *cache-friendly* choice — every visitor hits the same cached response and gets a different order.

### 6.3 Recommendation — **REDEFINE**

| Aspect | Answer |
|---|---|
| **Definition** | `A27 #11 Discover Shuffle`: a card row of N posts (N from a `select`: 3/4/6). **Baseline (server-rendered):** `{{#get "posts" limit=N order="published_at desc" filter="id:-{{id}}"}}` — a normal "latest posts" row, fully functional. **JS enhancement:** on load, fetch `{{content_api_url}}posts/?key={{content_api_key}}&limit=100&include=tags&fields=id,title,slug,url,feature_image,excerpt,published_at&filter=id:-<currentId>`, Fisher–Yates shuffle, render the first N, and expose a "Shuffle again" button that reshuffles the already-fetched pool with no new request. |
| **Data source** | Content API `GET /content/posts/` |
| **Needs JS?** | Only for the randomisation. The row renders and is useful without it. |
| **Needs a key?** | Content API key via `{{content_api_key}}`. No user input, no custom setting, no Admin API. |
| **No-JS degradation** | A "Latest posts" row. Section heading copy must therefore be neutral (e.g. "More reading") rather than "Random picks", so the no-JS render isn't a lie. The "Shuffle again" button is injected by the script, so it never appears without JS. |
| **Canvas preview** | Yes. The canvas shows one static arrangement of placeholder cards plus the shuffle affordance. Randomness is inherently un-previewable; a static sample is the faithful representation. |
| **Hard limits to encode** | Pool ≤ 100 posts per request → "random from the 100 most recent", not archive-wide. State this in the section's help text. |

---

## 7. A19 #11 "Quote Feature" — pull-quote from the post

### 7.1 Confirmed: Ghost has no pull-quote field

Enumerated from `data/schema` on Ghost 6.45.0:

- `posts`: `id, uuid, title, slug, mobiledoc, lexical, html, comment_id, plaintext, feature_image, featured, type, status, locale, visibility, email_recipient_filter, created_at, updated_at, published_at, published_by, custom_excerpt, codeinjection_head, codeinjection_foot, custom_template, canonical_url, newsletter_id, show_title_and_feature_image`
- `posts_meta`: `id, post_id, og_image, og_title, og_description, twitter_image, twitter_title, twitter_description, meta_title, meta_description, email_subject, frontmatter, feature_image_alt, feature_image_caption, email_only`

No `pull_quote`, no `quote`, no `highlight`. Confirmed.

### 7.2 The two candidate substitutes

**(a) `custom_excerpt` styled as a quote.** Real, first-class, author-controlled. Available in the template as `{{excerpt}}`, which prefers `custom_excerpt`
([`frontend/helpers/excerpt.js`](https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/ghost/core/core/frontend/helpers/excerpt.js)):

```js
if (this.custom_excerpt) {
    excerptText = String(this.custom_excerpt);
} else if (this.excerpt) {
    excerptText = String(this.excerpt);
} else {
    excerptText = '';
}
```

Note the fallback: with no `custom_excerpt`, `{{excerpt}}` returns the first 500 chars of plaintext — which as a "pull quote" is a mid-sentence fragment in quotation marks. **That is worse than showing nothing.** The variant must therefore branch on `custom_excerpt` specifically, not on `excerpt`:

```hbs
{{#if custom_excerpt}}<blockquote class="inflozo-pullquote">{{custom_excerpt}}</blockquote>{{/if}}
```

Also note the gating interaction (§3.1): on a gated post with no paywall card, `excerpt` is blanked — but `custom_excerpt` is a separate column and survives. Verified in `post-gating.js`: only `['plaintext','html','excerpt']` are cleared.

**(b) First `<blockquote>` from the post body.** Requires reading and parsing `{{content}}` HTML. Two disqualifying problems for this product:

1. **Canvas fidelity.** The builder's canvas never reads post body HTML by policy. A body-derived pull-quote is therefore un-previewable in principle — the canvas would show a placeholder quote that has no relationship to what production renders. Every other variant in this document previews faithfully; this one structurally cannot.
2. **Implementation cost and fragility.** Server-side there is no HTML-parsing helper available to a theme. Client-side it means `querySelector('.gh-content blockquote')`, cloning nodes, and handling the case where there is no blockquote (most posts) — a JS-only feature that renders nothing for the majority of posts, with a visible layout shift when it does fire. It also silently duplicates content already visible further down the page.

### 7.3 Recommendation — **REDEFINE**

Redefine A19 #11 from "pull-quote from the post" to **"Excerpt Quote"** — same visual, honest source.

| Aspect | Answer |
|---|---|
| **Definition** | `A19 #11 Excerpt Quote`: a large-type `<blockquote>` treatment of `{{custom_excerpt}}`, with optional attribution line `— {{primary_author.name}}`. Renders **only** when `custom_excerpt` is set; the section is absent otherwise. Section help text tells the author: *"Set the post's Excerpt in Ghost's post settings sidebar — that text appears here as a pull quote."* |
| **Data source** | `custom_excerpt` (posts table column), via `{{#if custom_excerpt}}` |
| **Needs JS?** | No |
| **Needs a key?** | No |
| **No-JS degradation** | N/A — fully server-rendered |
| **Canvas preview** | Yes, faithfully. `custom_excerpt` is a scalar field the canvas already models; no post body HTML is involved. Full fidelity, unlike option (b). |
| **Rejected** | First-blockquote-from-body. Un-previewable by the canvas by design, JS-only, fires for a minority of posts, duplicates visible content. Do not build it. |
| **Explicitly not** | Falling back to `{{excerpt}}`. Its auto-generated 500-char plaintext fallback produces a mid-sentence fragment in quote marks — worse than an absent section. |

---

## 8. Consolidated answer table

| # | Variant | Verdict | Data source | JS? | Key? | No-JS | Canvas |
|---|---|---|---|---|---|---|---|
| 1 | A7 #12 Founding Member | **KEEP** | `{{total_members}}` core helper | No | **None** | N/A | Faithful |
| 2 | A32 #12 Progress Tease | **REDEFINE** — reading-progress tease, approximate + hedged | `{{reading_time}}` (pre-gating, full post) + DOM word count | Bar only | None | Server-rendered sentence | Faithful (synthetic %) |
| 3 | A32 #10 Blurred Preview | **KEEP** (clarified intent) | Delivered free-preview HTML | No | None | Identical (pure CSS) | Faithful |
| 4 | A29 #13 Filter Bar | **REDEFINE** — progressive filter strip | Content API `/content/posts/` | Enhancement only | `{{content_api_key}}` (auto) | Tag/author links | Structural |
| 5 | A27 #11 Discover Shuffle | **REDEFINE** — client shuffle over ≤100-post pool | Content API `/content/posts/` | Enhancement only | `{{content_api_key}}` (auto) | Latest-posts row | Static sample |
| 6 | A19 #11 Quote Feature | **REDEFINE** — Excerpt Quote from `custom_excerpt` | `custom_excerpt` column | No | None | N/A | Faithful |

**Net effect on the 20-setting budget: zero settings spent.** No variant requires the user to paste a key. The Admin API is not used anywhere.

---

## 9. Sources

Ghost core, commit `fe7771d1ebd84df74ad99bb8eed2cfe842022769` — base `https://github.com/TryGhost/Ghost/blob/fe7771d1ebd84df74ad99bb8eed2cfe842022769/`:

- `ghost/core/core/server/services/members/content-gating.js`
- `ghost/core/core/server/api/endpoints/utils/serializers/output/utils/post-gating.js`
- `ghost/core/core/server/api/endpoints/utils/serializers/output/mappers/posts.js`
- `ghost/core/core/server/api/endpoints/utils/serializers/output/utils/extra-attrs.js`
- `ghost/core/core/server/api/endpoints/utils/api-filter-utils.ts`
- `ghost/core/core/server/api/endpoints/posts-public.js`
- `ghost/core/core/server/api/endpoints/settings-public.js`
- `ghost/core/core/server/api/endpoints/custom-theme-settings.js`
- `ghost/core/core/server/api/endpoints/search-index-public.js`
- `ghost/core/core/server/web/api/endpoints/admin/routes.js`
- `ghost/core/core/server/web/api/endpoints/content/routes.js`
- `ghost/core/core/server/web/api/endpoints/content/app.js`
- `ghost/core/core/server/web/api/middleware/cors.js`
- `ghost/core/core/server/web/shared/middleware/max-limit-cap.js`
- `ghost/core/core/server/services/auth/api-key/admin.js`
- `ghost/core/core/server/services/auth/api-key/content.js`
- `ghost/core/core/server/models/api-key.js`
- `ghost/core/core/server/models/post.js`
- `ghost/core/core/server/models/base/index.js`
- `ghost/core/core/server/data/schema/fixtures/fixtures.json`
- `ghost/core/core/shared/max-limit-cap.js`
- `ghost/core/core/shared/settings-cache/public.js`
- `ghost/core/core/frontend/helpers/content.js`
- `ghost/core/core/frontend/helpers/tpl/content-cta.hbs`
- `ghost/core/core/frontend/helpers/reading_time.js`
- `ghost/core/core/frontend/helpers/total_members.js`
- `ghost/core/core/frontend/helpers/total_paid_members.js`
- `ghost/core/core/frontend/helpers/content_api_key.js`
- `ghost/core/core/frontend/helpers/content_api_url.js`
- `ghost/core/core/frontend/helpers/excerpt.js`
- `ghost/core/core/frontend/helpers/ghost_head.js`
- `ghost/core/core/frontend/helpers/get.js`
- `ghost/core/core/frontend/utils/member-count.js`
- `ghost/core/core/frontend/services/proxy.js`
- `ghost/core/core/frontend/services/data/entry-lookup.js`
- `ghost/core/core/frontend/services/helpers/register-ghost-helpers.js`
- `ghost/core/core/frontend/services/theme-engine/engine.js`
- `ghost/core/core/frontend/services/theme-engine/preview.js`
- `ghost/core/core/frontend/services/theme-engine/handlebars/template.js`
- `ghost/core/core/frontend/services/theme-engine/middleware/update-global-template-options.js`

Installed runtime, Ghost `6.45.0` (`/home/ghost/Dev/arvo/versions/6.45.0`):

- `core/server/data/schema` (column enumeration)
- `content/themes/source/post.hbs`
- `node_modules/.pnpm/@tryghost+bookshelf-order@2.2.1/.../lib/bookshelf-order.js`
- `node_modules/.pnpm/@tryghost+helpers@1.1.106/.../lib/reading-time.js`, `lib/utils/reading-minutes.js`
- `node_modules/.pnpm/@tryghost+kg-default-nodes@2.1.2.../.../nodes/paywall/paywall-renderer.js`
- `node_modules/.pnpm/gscan@6.3.0/.../lib/checks/010-package-json.js`, `lib/specs/v5.js`

Docs and web:

- https://docs.ghost.org/admin-api
- https://docs.ghost.org/content-api
- https://docs.ghost.org/themes/helpers/data/total_members
- https://docs.ghost.org/themes/helpers/data/total_paid_members
- https://brightthemes.com/themes/dashi , https://brightthemes.com/docs/dashi
- https://brightthemes.com/blog/ghost-content-cta
- https://www.gloathost.com/blog/show-your-member-only-post-count-in-a-ghost-theme/
- https://www.spectralwebservices.com/blog/introducing-a-new-helper/ (`{{content_api_key}}`, Ghost 5.96+)
