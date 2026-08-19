---
title: Inflozo PRD — External-Claims Verification
reviewed: prd.md v2.3, sections-inventory.md, addendum.md
date: 2026-08-18
method: current Ghost source (TryGhost/Ghost main, TryGhost/gscan main), Ghost docs, Ghost(Pro) pricing, Dodo Payments docs, fantasma.io
---

# External-Claims Verification — Inflozo PRD

## Verdict

**The PRD's picture of Ghost is right about the platform and wrong about the credential.**

Almost every claim about what Ghost *can do* checks out: theme upload and activate over the Admin API, the 20-setting cap and its five types, `{{t}}` + `locales/`, native pagination on tag and author archives, a browser-safe wide-open-CORS Content API, Ghost 6's `limit=all` cap. Dodo Payments supports the billing model as described, and its fee schedule matches Appendix F to the cent. Fantasma is $99/yr as stated.

What the PRD gets wrong is narrower and more dangerous: **Ghost applies a hard method allowlist to integration tokens** (`themes: ['POST','PUT']`, `settings: ['GET']`, `config: ['GET']`, `site: ['GET']`). Four load-bearing designs sit on the wrong side of that list:

1. **Theme download is impossible with a Custom Integration key** — not "undocumented and version-dependent" as FR-J13 hedges, but blocked with a 403 on every version and every host. The "safe installs" differentiator has no primary path.
2. **routes.yaml upload is likewise impossible** with an integration key — FR-I4's "may attempt automated upload first" can never succeed.
3. **But routes.yaml *download* IS allowed** — so FR-I4's premise that "Inflozo cannot observe whether the Labs upload was completed" is false, and the fragile URL-probe verification is unnecessary.
4. **Plan/capability detection IS possible** via `GET /admin/config/` (`hostSettings.limits`) — FR-C2's flat "no detection API exists", repeated three times in the PRD, is wrong.

Two further items are structural rather than credential-related: `GET /admin/site/` is **unauthenticated**, so FR-C2's connect-time Admin key validation validates nothing; and `engines.ghost-api` — which FR-J1 mandates — is a **gscan warning** in the v5 and v6 specs, making the "0 errors, 0 warnings" gate (G3 / FR-J6 / NFR-6b) structurally unreachable as specified.

Counts across 50 verified claims: **33 CONFIRMED · 9 CONTRADICTED · 2 STALE · 6 UNVERIFIABLE**.

None of this is fatal to the product. All of it is fatal to specific sentences in the PRD, and two of them (C1, C6) will be discovered by E7 in the worst possible way — as an acceptance criterion that cannot pass.

---

## Claims table

| # | Claim | PRD location | Verdict | Source |
|---|---|---|---|---|
| 1 | Theme upload via Admin API works with a Custom Integration key | FR-J8, §7.2, P8 | CONFIRMED | [admin/middleware.js allowlist](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/admin/middleware.js) · [fixtures.json](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/data/schema/fixtures/fixtures.json) · [docs](https://docs.ghost.org/admin-api/themes/overview) |
| 2 | Theme activate is a separate documented call | FR-J8 | CONFIRMED | [admin/routes.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/admin/routes.js) |
| 3 | "Deploy only" vs "deploy and activate" are separable | FR-J8 | CONFIRMED | same as #2 (`PUT /themes/:name/activate` is independent of `POST /themes/upload`) |
| 4 | Theme **download** is an internal, undocumented Admin API capability that may work per version/host | FR-J13 | **CONTRADICTED** | endpoint exists but integration tokens are blocked — [middleware.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/admin/middleware.js) (`themes: ['POST','PUT']`) |
| 5 | Ghost(Pro) 2026 lineup is Starter / Publisher / Business | FR-C2 | CONFIRMED | [ghost.org/pricing](https://ghost.org/pricing/) |
| 6 | Ghost(Pro) Starter does not permit custom themes; Publisher or higher required | FR-C2, §7.6, FR-N4 | CONFIRMED | [ghost.org/pricing](https://ghost.org/pricing/) · [themes.js `limitService.isLimited('customThemes')`](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/api/endpoints/themes.js) |
| 7 | The deploy error is the authoritative Starter signal (upload deterministically fails) | FR-C2, FR-J8 | CONFIRMED | [themes.js upload](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/api/endpoints/themes.js) forces `errorIfWouldGoOverLimit('customThemes', {value: '.'})` → `HostLimitError` |
| 8 | **No detection API exists** — Ghost exposes no endpoint reporting plan or theme-upload permission | FR-C2, FR-C5, §7.6, Appendix I | **CONTRADICTED** | [config.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/api/endpoints/config.js) (`permissions: false`) returns [`hostSettings`](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/public-config/config.js); `config: ['GET']` is integration-allowlisted |
| 9 | Connect validation = mint Admin JWT, call Admin `site` endpoint | FR-C2 | **CONTRADICTED** | `/site` uses `publicAdminApi`, which has **no auth middleware** — [middleware.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/admin/middleware.js) |
| 10 | Ghost version is readable at connect | FR-C2, FR-C5 | CONFIRMED | [public-config/site.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/public-config/site.js) returns `version` (also in Content API `/settings/`) |
| 11 | Content API key is browser-safe; client-side reads work cross-origin | FR-C3, FR-H4, P5, §7.2 | CONFIRMED | [content/routes.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/content/routes.js) mounts bare `cors()` = `ACAO: *` · [docs](https://docs.ghost.org/content-api/) |
| 12 | Appendix B `@site` surface (incl. members_enabled, paid_members_enabled, comments_enabled, locale, navigation) is Content-API readable | Appendix B, FR-C4, FR-H6 | CONFIRMED | [settings-cache/public.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/shared/settings-cache/public.js) |
| 13 | Tiers are bindable from the Content API | FR-H6, Appendix B | CONFIRMED | [content/routes.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/content/routes.js) `GET /tiers` |
| 14 | The Content API never returns members-only content (gated bodies not previewable) | FR-D16 | CONFIRMED | [post-gating.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/api/endpoints/utils/serializers/output/utils/post-gating.js) |
| 15 | Content API is cacheable and effectively unmetered | P5, FR-H4, NFR-1 | UNVERIFIABLE | docs say "fetch as often as you like"; a `content_api_key` brute-force limiter exists in [defaults.json](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/shared/config/defaults.json); no published Ghost(Pro) edge limits |
| 16 | routes.yaml has **no official public API** for upload; Ghost Admin (Labs) is the only path | FR-I4 | CONFIRMED *(for the reason stated + a stronger one)* | endpoint exists ([admin/routes.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/web/api/endpoints/admin/routes.js)) but needs `setting: edit` ([settings.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/api/endpoints/settings.js)) and integrations get `settings: ['GET']` only |
| 17 | Inflozo may attempt automated routes upload "where the Ghost version accepts the community-known internal endpoint" | FR-I4 | **CONTRADICTED** | not version-dependent — blocked for all integration tokens on all versions (same sources as #16) |
| 18 | "In the manual flow Inflozo cannot observe whether the Labs upload was completed"; verify by fetching a representative route URL | FR-I4 | **CONTRADICTED** | `GET /settings/routes/yaml` needs only `setting: browse` and **is** integration-allowlisted — the live routes.yaml is directly readable |
| 19 | Ghost caps themes at 20 custom settings | FR-Q2, FR-Q5, P3, Appendix B | CONFIRMED | [docs](https://docs.ghost.org/themes/custom-settings) · gscan `GS010-PJ-CUST-THEME-TOTAL-SETTINGS` (error) in [v4.js](https://github.com/TryGhost/gscan/blob/main/lib/specs/v4.js) |
| 20 | The five types are select / boolean / color / image / text; image forbids a default; groups are Site wide / Homepage / Post; visibility is NQL | FR-Q2, FR-Q3, Appendix B | CONFIRMED | [docs](https://docs.ghost.org/themes/custom-settings) · gscan `GS010-PJ-CUST-THEME-SETTINGS-*` rules |
| 21 | 3 reserved dark-mode slots + 17 user slots = the real cap | FR-Q2, FR-Q5 | CONFIRMED (arithmetic valid against the real cap of 20) | as #19 |
| 22 | `{{t}}` + `locales/` ship in themes; site publication language selects the file; `en.json` guarantees resolution | FR-Q6, FR-H5, §7.4 | CONFIRMED | [theme-i18n.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/frontend/services/theme-engine/i18next/theme-i18n.js) · [docs](https://docs.ghost.org/themes/helpers/utility/translate) |
| 23 | Placeholders use `{single-brace}` syntax | FR-Q6 | CONFIRMED | [i18n-core.js](https://github.com/TryGhost/Ghost/blob/main/packages/i18n/lib/i18n-core.js) (`prefix: '{'`, `suffix: '}'`) |
| 24 | User-supplied override strings are feasible (arbitrary language, user-authored values) | FR-Q6 | CONFIRMED | locale files are plain key→string JSON shipped inside the theme zip; readable-English keys are the documented fallback mechanism ([docs](https://docs.ghost.org/themes/helpers/utility/translate)) |
| 25 | Only compiler chrome strings are translatable; Portal/comments/search UI is not theme-translatable | FR-Q6 (implied scope) | CONFIRMED | Ghost ships separate `portal`/`comments`/`search` namespaces outside the theme — [packages/i18n/locales](https://github.com/TryGhost/Ghost/tree/main/packages/i18n/locales) |
| 26 | Tag and author archives carry a native paginated `posts` context and `/page/N/` URLs, so `{{#get}}` is not needed | FR-H2, inventory "Main-feed rule" | CONFIRMED | [docs pagination](https://docs.ghost.org/themes/helpers/utility/pagination) |
| 27 | Pagination context is page / pages / total / next / prev | Appendix B, A34 | CONFIRMED | [docs pagination](https://docs.ghost.org/themes/helpers/utility/pagination) |
| 28 | Ghost has no per-collection page size; `posts_per_page` is global | FR-I2, FR-Q1 | CONFIRMED | [docs routing](https://docs.ghost.org/themes/routing) — collections take a template + filter, not a page size |
| 29 | Ghost 6 removed `?limit=all`; max 100 per page; pagination required on 6.x, identical on 5.x | Appendix B, §7.6 #6 | CONFIRMED | [max-limit-cap.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/shared/max-limit-cap.js) · [docs/changes](https://docs.ghost.org/changes) — note it **caps silently**, it does not error |
| 30 | `engines: {ghost-api: v5}` is the correct declaration and "covers both 5.x and 6.x" | FR-J1, §7.4, NFR-7 | **CONTRADICTED** | gscan v5/v6 `GS010-PJ-GHOST-API-PRESENT`, level **warning**: "The `ghost-api` version is no longer used and can be removed" — [v5.js](https://github.com/TryGhost/gscan/blob/main/lib/specs/v5.js) |
| 31 | Every compile can hit gscan 0 errors / 0 warnings | G3, FR-J6, NFR-6b, Appendix H | **CONTRADICTED** as specified | #30 plus `GS110-NO-MISSING-PAGE-BUILDER-USAGE` (warning) — [v5.js](https://github.com/TryGhost/gscan/blob/main/lib/specs/v5.js), [110-page-builder-usage.js](https://github.com/TryGhost/gscan/blob/main/lib/checks/110-page-builder-usage.js) |
| 32 | Theme names unique per site; collision auto-resolves and never overwrites another project's theme | FR-J10 | **CONTRADICTED** | collision detection needs `GET /themes/`, blocked for integrations; Ghost silently overwrites a same-named theme — [storage.js `setFromZip`](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/themes/storage.js) |
| 33 | Ghost 5.x is a normal supported deploy target (T3, NFR-7) | §4, NFR-7, FR-C2 | **STALE** | Ghost 5 LTS support ended **January 2026** — [docs/faq/major-versions-lts](https://docs.ghost.org/faq/major-versions-lts/) |
| 34 | Theme zip contents (bundled fonts + hashed images) are unconstrained | FR-J3, FR-K5, §7.4 | UNVERIFIABLE | Ghost enforces zip size limits with codes `COMPRESSED_TOO_LARGE` / `ENTRY_TOO_LARGE` / `TOTAL_TOO_LARGE` — [upload-size-limit-reporter.js](https://github.com/TryGhost/Ghost/blob/main/ghost/core/core/server/services/themes/upload-size-limit-reporter.js); byte values are host config |
| 35 | Dodo supports subscriptions, plan changes/downgrades, cancel-at-period-end | FR-L1, FR-L2, FR-L3 | CONFIRMED | [subscription integration guide](https://docs.dodopayments.com/developer-resources/subscription-integration-guide) (4 proration modes) · [customer portal](https://docs.dodopayments.com/features/customer-portal) |
| 36 | Dodo is merchant of record; handles tax | FR-L1, NFR-8, Appendix F | CONFIRMED | [accepted countries](https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories) · [dodopayments.com/pricing](https://dodopayments.com/pricing) |
| 37 | Fee model 4% + 40¢, +1.5% international, +0.5% subscription, $30 disputes; net $13.70–13.93 on $15 | Appendix F, §7.6 | CONFIRMED (arithmetic verified) | [dodopayments.com/pricing](https://dodopayments.com/pricing) |
| 38 | Webhooks: activated / renewed / payment failed / cancelled drive the entitlement machine | FR-L2 | UNVERIFIABLE (naming mismatch) | Dodo's documented vocabulary is `subscription.active/updated/on_hold/failed/renewed`, `payment.succeeded/failed` — [webhooks](https://docs.dodopayments.com/developer-resources/webhooks); "past due" maps to `on_hold`, no `cancelled` event documented in the integration guide |
| 39 | Webhook handlers idempotent + signature-verified | FR-L2, NFR-3 | CONFIRMED | [webhooks](https://docs.dodopayments.com/developer-resources/webhooks) — Standard Webhooks, `webhook-id` for idempotency, HMAC-SHA256 |
| 40 | Billing page links a Dodo customer portal with invoices | FR-L4 | CONFIRMED | [customer portal](https://docs.dodopayments.com/features/customer-portal) |
| 41 | Yearly-default checkout with monthly one click away | FR-L1 | CONFIRMED (merchant-side product choice, no platform obstacle) | [subscription integration guide](https://docs.dodopayments.com/developer-resources/subscription-integration-guide) |
| 42 | Dodo has no blocking regional/business-type restriction for this business | §7.6 (implied) | UNVERIFIABLE | eligibility keyed to **director/owner ID issuing country** across 182 territories; digital-goods only — [accepted countries](https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories) |
| 43 | Fantasma Pro is $99/yr | §1.5 | CONFIRMED | [fantasma.io/pricing](https://www.fantasma.io/pricing) |
| 44 | Fantasma has ~155 presets | §1.5 | CONFIRMED | [fantasma.io/pricing](https://www.fantasma.io/pricing) ("155+ presets", Pro) |
| 45 | Fantasma is form-based, no inline WYSIWYG | §1.5 | CONFIRMED | [fantasma.io](https://www.fantasma.io/) ("Drag, drop, and configure sections… Point and click") |
| 46 | Fantasma is "a solid build→export pipeline" | §1.5 | **CONTRADICTED** | Pro includes "Publish to Ghost" via Admin API key and connected-site preview — [fantasma.io/pricing](https://www.fantasma.io/pricing) |
| 47 | Fantasma has no membership/monetization sections, no versioning/rollback, no image optimization, no gscan/perf story; "one Source-derived aesthetic (a known user complaint)" | §1.5 | UNVERIFIABLE | not listed on [fantasma.io](https://www.fantasma.io/) or [/pricing](https://www.fantasma.io/pricing) — absence from marketing copy is not absence from the product |
| 48 | Fantasma is "the one shipping" / "only shipping" visual Ghost builder | §1.1, §1.5 | UNVERIFIABLE | no competitor surfaced in search, but an exhaustive-market negative is unprovable |
| 49 | Ghost theme shops sell static themes at $89–149 one-time | §1.5 | **STALE / imprecise** | official marketplace spans $35–$149, clustering $69–99 — [ghost.org/themes](https://ghost.org/themes/) |
| 50 | Supabase passkeys are Beta, need `@supabase/supabase-js` ≥ 2.105.0 with explicit opt-in | FR-A2, §7.1, §7.6 | CONFIRMED | [Supabase changelog, 28 May 2026](https://supabase.com/changelog/46458-passkeys-for-supabase-auth-beta) · [docs](https://supabase.com/docs/guides/auth/passkeys) |

---

## Findings by severity

### CRITICAL — a differentiator rests on a claim that is false

#### F1 · Theme download is unreachable with a Custom Integration key (FR-J13, §1.4 #5, E7)

`GET /ghost/api/admin/themes/:name/download/` exists and the `Admin Integration` role even holds the `theme: read` permission — but Ghost applies a second, harder gate to integration tokens before permissions are consulted:

```js
// web/api/endpoints/admin/middleware.js — tokenPermissionCheck
const allowlisted = { …, themes: ['POST', 'PUT'], … };
…
next(new errors.NoPermissionError({message: 'API tokens do not have permission to access this endpoint', statusCode: 403}));
```

`GET` is not in the `themes` list. Every theme download attempt with an Admin API key returns **403 on every Ghost version and every host** — self-hosted 5.x, self-hosted 6.x, Ghost(Pro) alike. `GET /themes/` and `GET /themes/active` are blocked by the same line.

FR-J13 frames this as version/host variance and makes "verifying it per Ghost version/host on all four §4 targets" an acceptance criterion. That criterion can only ever fail, on all four targets, and E7 is where it gets discovered.

**Recommended wording (FR-J13):** delete "internal, undocumented Admin API capability … verifying it per Ghost version/host on all four §4 targets is an acceptance criterion". Replace with:

> Ghost's Admin API exposes a theme-download endpoint, but Ghost blocks all `GET /themes/*` requests made with an integration token (`themes: ['POST','PUT']` allowlist) — so a Custom Integration can never capture a snapshot. **The designed degraded path is therefore the default path, not a fallback:** before Inflozo's first activation on a site, the user is told no snapshot could be captured and that Ghost retains the previous theme under Settings → Design, with guidance to reactivate it there. Rollback between Inflozo-built versions is unaffected — it redeploys Inflozo's own stored artifacts and needs no download endpoint. *(Optional Pro enhancement, out of v1 scope: accept a Ghost **Staff Access Token** from an Owner/Admin user as a second credential; staff tokens bypass the integration allowlist and can download themes.)*

Also revise §1.4 #5: "a snapshot of the site's previous theme before Inflozo's first activation" is not deliverable with the stated credential — the honest promise is "Ghost's own Settings → Design retains your previous theme, and every Inflozo deploy is one-click reversible".

#### F2 · The compile gate cannot be green as specified (FR-J1 / §7.4 / NFR-7 vs G3 / FR-J6 / NFR-6b)

gscan's v5 and v6 specs both carry:

```js
'GS010-PJ-GHOST-API-PRESENT': {
    level: 'warning',
    rule: 'Remove "engines.ghost-api" from package.json',
    details: 'The "ghost-api" version is no longer used and can be removed.'
}
```

FR-J1 mandates emitting `ghost-api: v5`; §7.4 bakes it into the theme skeleton; NFR-7 claims it is *what* covers 5.x and 6.x. All three are wrong at once: it is not a compatibility mechanism (Ghost no longer uses it), and emitting it guarantees a warning on **every single compile**, against G3 ("warnings surfaced, always"), FR-J6 ("Target for all library output: 0 errors, 0 warnings") and NFR-6b ("gscan 0/0").

A second guaranteed warning comes free: `GS110-NO-MISSING-PAGE-BUILDER-USAGE` (warning) fires unless page templates gate markup with `{{#if @page.show_title_and_feature_image}}` — nothing in FR-I1/§7.4 emits it.

**Recommended wording:**
- FR-J1: "Output: a complete Ghost 5.x/6.x-compatible theme (Handlebars; **no `engines.ghost-api` declaration — gscan v5+ warns on its presence and Ghost no longer reads it**)".
- §7.4: strike `ghost-api v5` from the `package.json` comment.
- NFR-7: "generated themes support Ghost 5.x and 6.x — compatibility comes from the helper surface used (Appendix B), verified by gscan against the v6 spec and by golden tests on live 5.x and 6.x, not from any declaration in `package.json`".
- FR-I1 / §7.4: add `page.hbs` must gate its title/feature-image markup with `{{#if @page.show_title_and_feature_image}}` (gscan GS110).
- FR-J6: keep 0/0 as the target, and add the standing v6 compile constraints the library must satisfy: exactly one argument in `{{#if}}`/`{{#unless}}` (fatal), no `{{twitter_url}}`/`{{facebook_url}}` (use `{{social_url type=…}}`), no AMP templates, no recursive layout inheritance, and `{{#get}}` limits ≤ 100.

---

### HIGH — stated flatly, and wrong

#### F3 · "No detection API exists" is false (FR-C2, FR-C5, §7.6, Appendix I)

`GET /ghost/api/admin/config/` is declared `permissions: false`, is in the integration allowlist (`config: ['GET']`), and returns `hostSettings: config.get('hostSettings')` — which on Ghost(Pro) carries the host limit block, `customThemes` included. Absence of `hostSettings` (self-hosted) means unlimited.

This turns FR-C2's "ask the user which plan the site is on" — a friction step sitting directly in G1's <10-minute budget — into an automatic capability probe.

**Recommended wording (FR-C2):**

> Plan awareness: after validation, read `GET /ghost/api/admin/config/` and inspect `hostSettings.limits` for a `customThemes` limit; when present the connection is marked **Preview-only** automatically. The shape of `hostSettings` is undocumented and host-controlled, so this is a **probe with a fallback**: when it is absent or unrecognised, fall back to asking the user which Ghost(Pro) plan the site is on. In all cases the deploy attempt's error response remains the authoritative signal.

Update §7.6's risk row and the Appendix I "Preview-only" gloss to match, and add `hostSettings.limits` shape to the §7.6 "Verify at build time" list.

#### F4 · Connect-time Admin key validation validates nothing (FR-C2)

`GET /ghost/api/admin/site/` is mounted on `publicAdminApi`, whose middleware chain contains **no authentication step at all** (`[cors, urlRedirects, prettyUrls, tokenPermissionCheck]`). A request with a malformed, revoked, or entirely fabricated Admin key returns 200. FR-C2's validation therefore passes any string the user pastes; the failure surfaces later, at first deploy, as "Ghost said no" — exactly the experience FR-C2 exists to prevent.

**Recommended wording (FR-C2):** "mint the short-lived Admin JWT and call an **authenticated** Admin API endpoint — `GET /config/`, which both proves the key and returns `hostSettings` for plan detection (F3) and `version`. (`GET /site/` is public and must not be used to validate a key.)"

#### F5 · routes.yaml: the automation hedge is impossible; the verification pessimism is unnecessary (FR-I4)

Both halves of FR-I4 are wrong, in opposite directions:

- **Upload:** `POST /settings/routes/yaml` requires `setting: edit`; integrations get `settings: ['GET']`. "Where the connected Ghost version is verified to accept the community-known internal routes endpoint, Inflozo may attempt automated upload first" describes a capability that does not exist on any version. Keeping it invites E7 to build and test a path that always 403s.
- **Verification:** `GET /settings/routes/yaml` requires only `setting: browse` and **is** allowlisted. Inflozo can read the site's live routes.yaml at any time. "In the manual flow Inflozo cannot observe whether the Labs upload was completed" is false, and the "fetch a representative route URL" probe plus the "Routes unverified" reminder state are a weaker substitute for a byte comparison.

**Recommended wording (FR-I4):**

> `routes.yaml` is included in the theme zip **and** uploading it to Ghost requires a separate step in Ghost Admin (Settings → Labs). Ghost's routes-upload endpoint requires `setting: edit`, which Custom Integrations do not hold — so the guided "one more step" card (download button + Labs instructions) is the only upload path, on every Ghost version and host. **Verification is authoritative, not inferred:** Inflozo reads the site's live `routes.yaml` via the Admin API (`GET /settings/routes/yaml`, permitted to integrations) and compares it byte-for-byte with the compiled routes. The "one more step" card resurfaces whenever they differ — including route removals, a routeless project deploying after a routed one, and rollbacks — and clears itself the moment the live file matches. No "unverified" limbo state is needed.

This also lets FR-C5's daily health check detect routes drift caused outside Inflozo.

#### F6 · Theme-name collision cannot be detected (FR-J10)

`GET /themes/` is blocked for integrations, so Inflozo cannot enumerate a site's installed themes. Ghost's `setFromZip` **overwrites** a theme whose name matches (signalled only by an `X-Cache-Invalidate` response header). FR-J10's promise — "Theme names are unique per site; a collision at first deploy to a site auto-resolves with a slug suffix … never overwriting another project's deployed theme" — has no API to stand on. The realistic exposure is small (two Inflozo projects with the same slug on one site, or a pre-existing theme literally named `inflozo-{slug}`), but the sentence claims a guarantee.

**Recommended wording (FR-J10):** "Theme names are unique per site **within Inflozo's own records** — Inflozo tracks the frozen name per site and suffixes on its own collisions (`inflozo-blog-2`). Ghost's theme list is not readable with an integration key, so a collision with a theme Inflozo did not deploy cannot be detected in advance; the `inflozo-` prefix makes it vanishingly unlikely, and the first-deploy confirmation names the theme that will be created."

#### F7 · Competitive claims about Fantasma are unsourced and one is wrong (§1.5)

Fantasma Pro ships "Publish to Ghost" (Admin API key connection) and connected-site preview. Describing it as "a solid build→export pipeline" is inaccurate, and it quietly removes deployment from Inflozo's differentiator list. The remaining shortcomings — no membership/monetization sections, no versioning/rollback, no image optimization, no gscan/perf story, "one Source-derived aesthetic (a known user complaint)" — appear nowhere in Fantasma's public material either way. §1.5 states them flatly and they carry the $15/mo-vs-$99/yr justification, so they will end up on the marketing site (FR-N1/N3) as factual comparative claims about a named competitor.

**Recommended wording (§1.5):**

> Fantasma (fantasma.io, Free + Pro $99/yr) is the most prominent shipping visual Ghost builder: a capable builder with 155+ section presets, connected-site preview and direct publishing to Ghost on Pro. As of August 2026 its public product material describes form-based sidebar editing rather than inline WYSIWYG, a single Source-derived aesthetic, and makes no mention of membership/monetization sections, deploy versioning or rollback, image optimization, or a gscan/performance story. Inflozo's $15/mo is justified by WYSIWYG fidelity, library scale (487 variants vs 155+ presets), Ghost-native monetization depth, safe installs and evergreen updates.

Add a note that any competitor claim reused on the marketing site must be re-verified at publish time and dated.

#### F8 · Dodo's event vocabulary does not match FR-L2's state machine

FR-L2 names "subscription activated / renewed / payment failed / cancelled". Dodo documents `subscription.active`, `subscription.updated`, `subscription.on_hold`, `subscription.failed`, `subscription.renewed`, plus `payment.succeeded` / `payment.failed`. There is no documented `subscription.cancelled` in the integration guide, and Inflozo's `pro_past_due` corresponds to Dodo's `on_hold` — whose own dunning/grace timing is Dodo-controlled and may not equal Inflozo's 7-day grace.

**Recommended wording (FR-L2):** map states to Dodo's actual event names (`subscription.active → pro_active`, `subscription.on_hold`/`payment.failed → pro_past_due`, `subscription.renewed → pro_active`, `subscription.failed`/expiry → `free`), state that cancellation is detected from `subscription.updated` plus a direct subscription read, and note that Inflozo's 7-day grace is **Inflozo's** window, reconciled against Dodo's on-hold state rather than assumed to match it. Add "confirm the full Dodo event catalogue (Developer → Webhooks → Event catalog)" to §7.6's build-time list.

---

### MEDIUM — true-but-costly, or stated without a source

#### F9 · Ghost 5.x reached end of life in January 2026 (§4 T3, NFR-7, FR-C2, Appendix F)

Ghost's own LTS policy page puts 5.x support through January 2026; 6.x is the only supported line. The PRD mandates a permanent self-hosted 5.x droplet (T3) as a **deployable** target, serialized in CI, and Appendix F pays for it. Supporting 5.x connections is defensible — real users lag. Maintaining a 5.x *deploy target and CI lane* as a launch blocker is not obviously worth it.

**Recommended wording:** keep FR-C2's acceptance of 5.x, and reframe T3 as "a self-hosted Ghost 5.x droplet (owner-provided) — **5.x reached end of life in January 2026**; retained as a compatibility target for lagging sites, and the first candidate to drop if launch schedule pressure requires it". Note the EOL in NFR-7 too, so the Architect does not treat 5.x parity as permanent.

#### F10 · Theme zip size has limits and the PRD has no budget (FR-J3, FR-K5, §7.4)

Ghost rejects oversized theme uploads with `COMPRESSED_TOO_LARGE`, `ENTRY_TOO_LARGE` and `TOTAL_TOO_LARGE` (host-configured byte values; Ghost(Pro) Starter is separately documented at a 5 MB upload limit). Inflozo bundles self-hosted woff2 subsets, all referenced images at up to 2400 px, per-section CSS and pre-generated responsive sizes — a media-heavy project can plausibly exceed a few MB.

**Recommended wording (FR-J3):** add "the compiler enforces a theme-size budget and surfaces it pre-deploy (total zip, per-entry, and uncompressed total); Ghost rejects oversized theme uploads with `COMPRESSED_TOO_LARGE` / `ENTRY_TOO_LARGE` / `TOTAL_TOO_LARGE`, and the exact host limits are undocumented — probe them on the §4 targets and set the budget below the lowest observed." Add to §7.6's build-time list.

#### F11 · Content API request volume is unbounded by the PRD (P5, FR-H4, NFR-1)

Ghost documents the Content API as cacheable and unmetered, and open CORS makes the client-side design work — but Ghost ships a `content_api_key` brute-force limiter, and Ghost(Pro) sites sit behind an edge the PRD does not model. The editor fans out reads across canvas, Section Picker previews and Link Picker search.

**Recommended wording (FR-H4):** add "client-side Content API reads are batched and de-duplicated per resource, with a per-session request ceiling; on 429 or repeated failure the editor falls back to Orbit Weekly with a named cause (as with CORS/mixed-content failures in FR-C2)".

#### F12 · Appendix F's Ghost(Pro) test-infra costs are stale

Appendix F assumes "Ghost(Pro) Publisher ~$31 monthly billing, Ghost(Pro) Starter ~$11". Current list prices are Publisher $29/mo billed yearly (higher billed monthly) and Starter $18/mo billed monthly / $15 yearly. Starter is understated by roughly 60%; total fixed cost moves up a few dollars a month. Break-even at 8–9 Pro subscribers is not materially threatened, but the number should be right.

Also worth noting for T4: Ghost(Pro) Starter has **no paid subscriptions**, so tier/paywall behaviour (FR-H6) cannot be exercised there at all — T4 verifies only the Preview-only block path, which is what §4 says, but Appendix E/FR-H6 acceptance work must target T1–T3.

---

### LOW

#### F13 · Theme-shop price range overstated (§1.5)
"$89–149 one-time" is the top half of the official marketplace's $35–$149 range (typical cluster $69–99). Recommend "$35–149 one-time (most $69–99)" — the comparison still favours Inflozo and stops being contestable.

#### F14 · "The one shipping builder" / "only shipping visual Ghost builder" (§1.1, §1.5)
No competitor surfaced, but an exhaustive-market negative cannot be sourced. Recommend "the most prominent shipping visual Ghost builder".

#### F15 · `@site.locale` naming (Appendix B, FR-Q6)
Correct in theme context. The Content API `/settings/` response exposes the same value under both `lang` and `locale` keys — worth one parenthetical in Appendix B so the editor reads the right field.

---

## What to add to §7.6 "Verify at build time"

The existing list is good. Given the above, items 3 and 4 should be **deleted** (both are now settled: neither endpoint is reachable with an integration key, on any version or host) and replaced with:

3. `hostSettings.limits` shape on Ghost(Pro), for automatic Preview-only detection (F3) — probe on T2 and T4.
4. Ghost theme-upload size limits on each §4 target, to set the compiler's theme-size budget (F10).
7. Dodo's full webhook event catalogue and on-hold/dunning timing, against FR-L2's state machine (F8).
8. gscan's current warning set for the v6 spec, re-run before E7 exit (F2).
