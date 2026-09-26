---
title: 'Story 5.20 — Tier-bound surfaces and the Paywall editor'
type: 'feature'
created: '2026-09-26'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '33ef6b830c971f2db70d17a817420210ad95d544'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

You get a Paywall screen in the editor — open **Template ▾** and choose **Paywall** under **Template surfaces** — that
shows what a reader meets where a paid post stops: the start of the article, Ghost's cut, and the box that asks them to
subscribe, as a logged-out visitor, a free member or a paid member sees it, with your site's tiers counted beside it.
Until the paywall designs arrive with Epic 10 that box is Ghost's own, which is exactly what your readers see today, and
when your site has members switched off the screen says so, gives the two steps to turn them back on and checks again
when you press **Re-check** — the Sites screen and any sign-up section you place say it too. Behind the scenes, every
design from now on is refused if it could show a sign-up button your site cannot take or a tier your site keeps hidden.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-H6 and FR-D16's gated half have nothing built. `paywall` is a reserved segment that 404s, and no canvas
draws a post body, so a paywall has nowhere to be seen. Nothing records whether a site has members switched on:
`sites.site_settings` holds no member field, and neither connect nor the daily check keeps one, so nothing can warn. No
design rule stops a sign-up button shipping outside the site's own capability flag, or a tier query returning tiers the
site hides — and Ghost's `/tiers/` **does** return hidden tiers (executed at this Create on T1 and T3). The library holds
no A32 design until Epic 10, so the editor has nothing to choose between.

**Approach:** Build the Paywall canvas as a template surface reached from the Template switcher. It shows the
style-guide article previewed as a Paid-members-only post. For a visitor who may not read it (Ghost's `checkPostAccess`,
ported once) the article is cut where C3a cuts it, with **Ghost's own box** beneath — recorded on both majors — until a
paywall design is chosen. For a visitor who may, the article is whole and carries S4d's indicator. The site's member
switches are recorded at connect, daily and on Re-check, and every warning reads that one record: C3b's screen on the
Paywall canvas, a notice on the Sites screen, and a line on a placed sign-up section (never a synthesized one). The
paywall is one doc with at most one instance, stored under a new `paywall` template key, so a Schema phase goes first.
Two validator rules enforce R-4 and FR-H6's tier filter on every design. Choosing a paywall design is built and proven on
two stand-in paywalls that never ship (R-158's shape); A32's own designs light it up in Story 10.107.

## Boundaries & Constraints

**Always:**

- **The surface (C3a, as corrected — *Design Notes*).**
  - `/projects/<id>/paywall` is a canvas the editor paints like any other: one soft navigation, the editor stays
    mounted, and it has R-98's skeleton or `NO_SKELETON`'s reason beside `[template]`'s.
  - It is reached from the Template switcher's new **Template surfaces** group, drawn in D5b's Membership group's
    shape (EXPERIENCE.md:218-222). The group holds **Paywall** alone: Cards arrives with Story 7.13 (R-118), and Error
    pages is D5b's existing 404 row.
  - The left panel stays **Layers**, with no rows and no "+ Add section", and holds C3a's "How readers reach it" card.
  - The top bar is ink (`--color-ink-deep`, DESIGN.md:310-313) and carries:
    - **NOT A PAGE SECTION** and **Back to post**;
    - View as, the sun, the devices, Undo/Redo, Theme settings and the save indicator.
  - The top bar does **not** carry Remix (FR-D17 never touches a treatment) or Ship (Story 7.18).
- **The article is the style-guide fixture, never a real body** (FR-D16, FR-H4). It is previewed as a **Paid-members
  only** post (C3a:1548). Its public-preview marker is simulated **after the fixture's seventh block**, where C3a cuts it
  (C3a:1423-1436).
- **Access per visitor is Ghost's own rule.** `postAccess(post, visitor)` ports `checkPostAccess` (read in source)
  over View as's three visitors: Logged out user → no member; Free member → `status: free`; Paid member → `status:
  paid`, holding every active paid tier, as Ghost 6's preview member does. It is ONE function, used by the cut, the
  indicator and the reading time.
  - **No access** → the preview blocks at 55% (context), then C3a's cut marker, then the box.
  - **Access** → the whole article, with S4d's "Gated content — shown with sample text" at the marker (Question 3).
- **The box.**
  - **Untouched:** Ghost's own `content-cta` markup and stylesheet, as recorded per major. Its accent passes
    `ghostColor` (NFR-3).
  - **Designed:** the paywall instance rendered at `partials/content-cta.hbs`. The post is at the ROOT
    (`content.js:28` executes the partial with the post as `this`), with the source in force's tiers and the visitor.
- **One design active per project.**
  - The `paywall` doc holds at most one instance.
  - Choosing a design from untouched is one `apply` → one `commit` → one `⌘Z`.
  - The ring is the paywall designs the library holds (A32 — none until 10.107), and is ABSENT while there are none
    (UX-DR3).
  - The two stand-ins exist only in the harness and the tests (AD-35, R-158).
- **One record of the member switches:** `sites.site_settings.members = { signup_access, paid_enabled }`.
  - It is copied from the Admin `settings/` the probe already reads. Executed read-only at this Create on both majors,
    those keys are present there.
  - It is written at connect, by the daily check (both call `probeSite`), and by Re-check.
  - Nothing else from `settings/` is copied, and never a Stripe key.
- **Every warning reads that record**, and a site with no record yet warns nothing.
  - **The Paywall canvas:** C3b's members-off screen (as Question 2 rules), while the canvas shows the site's content.
  - **The Sites screen:** a notice. It shows after connect and on every visit while the fact holds.
  - **A placed section whose design carries a member ask**, on a site with members switched off: a line in its panel.
    It is never shown on a synthesized (`auto-…`) instance (FR-H6).
- **Re-check** is a server action: one Admin read through `server/ghost-admin` (AD-10 — never a server-side Content
  read). It says "Re-checking…" while it runs (R-98). The Paywall canvas also re-checks in the background when it opens
  ("we re-check on open", C3b).
- **The tier line.** "{n} tiers · {m} free" counts the source in force's PUBLIC tiers. **Tiers in Ghost admin →**
  appears only for a linked site.
- **Two validator rules, on every design** (`validate.ts`). The pilots pass unchanged.
  - `member-ask-ungated` (R-4) applies to an element that asks a visitor to join:
    - `data-members-form`, or a `data-portal` whose action signs up, upgrades or opens plans.
    - It must sit inside a `data-if` on the site's own flag: `@site.allow_self_signup` for a free ask,
      `@site.paid_members_enabled` for a paid one. A tier-count check alone never satisfies it.
  - `tiers-unfiltered` (FR-H6): every `tiers` query's filter carries `type:paid+visibility:public`.
- **A link the USER pointed at a Portal ask is gated on both emitters** (R-4; DW-154's 5.20 half). This covers a
  link record `{ portal: 'signup' }` or `{ portal: 'account/plans' }` on a button prop or an inline `a` mark (5.3's Link
  Picker). The design cannot know it, so `linkAttributes`, the one link sink, decides it:
  - **The theme** wraps the element in `{{#if @site.allow_self_signup}}` for `signup` and
    `{{#if @site.paid_members_enabled}}` for `account/plans`. An inline mark keeps its words through `{{else}}`.
  - **The canvas** leaves the element out, or keeps the words unlinked, where the source in force's flag is false.
  - `signin` and `account` sign nobody up and stay ungated.
- **`partials/content-cta.hbs`** is the paywall category's one target, and no other category may declare it
  (`paywall-target`).
- **AD-38 holds by construction.** The binding check already refuses every `@member` path (`contexts.ts:186-188`), and
  a test asserts it on the partial.
- **DW-128, as Ghost does it** (Code Map):
  - The bare `{{reading_time}}` helper prints nothing only when the visitor's body is withheld with no preview AND the
    post's `reading_time` is 0. Otherwise it prints the WHOLE post's time.
  - The `{{t … minutes=reading_time}}` field is the whole post's for everyone.
- **R-192:** a design choice and the paywall's controls are edits, disabled while reading along. View as, Re-check and
  Back to post stay live.
- **R-170:** one name per thing. Every string is *Design Notes*' table, written once in `apps/web/lib/paywall.ts`.

**Ask First:**

- **Questions 1–3 are open.** Dev does not start until the owner rules them.
- **If the recorder finds that a members-only post is NOT withheld with Subscription access set to Nobody** — C3b's
  premise — stop and say so. Question 2 then falls away, and C3b is built as drawn.
- **If the recorder finds that `{{reading_time}}` prints nothing on a withheld post whose `reading_time` is above 0**,
  stop and say so. The canvas would then print nothing for every withheld body.
- **Anything that needs a migration beyond the `paywall` key:** stop — R-99.

**Never:**

- **No A32 design authored** (AD-35, R-158). The stand-ins never reach `packages/library/designs/`, the Section Picker,
  Layers, Shuffle or Remix.
- **No compile of `partials/content-cta.hbs`.** Its explicit `{{> "content-cta"}}` reference (MEASUREMENTS §15b) and its
  `{{{html}}}` preview line are Epic 7's (DW-261).
- **No Admin write.** Inflozo never flips Subscription access (P8, AD-10). The owner flips it by hand in Ghost admin
  during his test. The recorder and the live walk toggle it with the harness's staff token. The product never does.
- **None of A32's own editor parts:** P0·6's gate switcher, per-gate copy, the named-tier preview, `{{price}}`, a
  repeatable `benefits` (DW-262, DW-264).
- **No Theme settings row for the paywall.** The switcher's group is FR-Q9's fallback for it (EXPERIENCE.md:211).
- **No keyboard shortcut** (FR-D11), no "Showing" menu, and no paywall row in Layers or the Picker.
- **Never edit the export** (R-74) **or the pilots** (AD-35).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Open the Paywall canvas | Template ▾ → Paywall | ink top bar, NOT A PAGE SECTION, Back to post; Layers holds only the "How readers reach it" card; the strip reads "Showing: the cut only" | N/A |
| Untouched, Logged out user | no paywall doc | preview blocks at 55%, the coral cut marker, Ghost's own box: "This post is for paying subscribers only" · Subscribe now · Sign in | N/A |
| Untouched, Free member | same | Ghost's own box: "Upgrade your account" | N/A |
| Paid member | any paywall | no cut and no box; the whole article; "Gated content — shown with sample text" at the marker; "Showing: the whole post" | N/A |
| Sample content | no site, or the pill on Sample | Orbit Weekly's accent and tiers: "5 tiers · 1 free", no Ghost admin link | N/A |
| The site's content | T3 linked, connected | the site's accent; "1 tier · 1 free" (the hidden tier is not counted); Tiers in Ghost admin → `{url}/ghost/#/settings/tiers` | a failed tiers read: the line is absent, 5.18's note says why |
| Members off | record `signup_access: none`, the site's content | C3b's card, as Question 2 rules, with Open Ghost admin → `{url}/ghost/#/settings/members` and Re-check | N/A |
| Members off, Sample content | same record, the pill on Sample | the sample paywall; no card | N/A |
| Re-check | press, or open the canvas | "Re-checking…", `aria-busy`; the record and the canvas update; `#editor-said` says the result | Ghost unreachable or credential refused: "Could not check {site} just now." under the buttons, the record unchanged |
| No record yet | a site connected before this story | no warning anywhere; the canvas's background re-check fills it | N/A |
| A placed member ask, members off | Newsletter — Inline Row placed on Home | its panel says "Members are switched off on {site}, so this section's sign-up form shows nothing there." | N/A |
| A synthesized instance | an `auto-…` instance with a member ask | no line, ever (FR-H6) | N/A |
| Connect or the daily check | `signup_access` none · invite · paid, or `paid_enabled` false | the Sites notice's matching sentences (*Design Notes*) | N/A |
| Choose a design | the harness's stand-ins, untouched | one instance stored; "Design 1 of 2 · …" in the strip; "1 / 2" at the panel head; one `⌘Z` returns to Ghost's own box | N/A |
| ◀ ▶ | two stand-ins | 5.11's carry / park / default, one journal entry each | N/A |
| Reading along | B5a | the design choice and controls are disabled (R-192); View as, Re-check and Back to post are live | N/A |
| A design with an ungated ask | `data-portal="signup"` outside `data-if="@site.allow_self_signup"` | refused at assembly: `member-ask-ungated`, naming R-4 | the build fails by name |
| A tier query without the filter | `tiers` binding, no `type:paid+visibility:public` | refused: `tiers-unfiltered`, naming FR-H6 | the build fails by name |
| A button the user linked to Portal's Sign up | Latest Post's action, `{ portal: 'signup' }`, on a site where self-signup is off | the canvas leaves the button out; the theme wraps it in `{{#if @site.allow_self_signup}}`; `agreement.test.ts` node for node | N/A |
| An inline Upgrade link in text | an `a` mark, `{ portal: 'account/plans' }`, paid memberships off | the words stay, unlinked, on both emitters (`{{else}}` on the theme) | N/A |
| Another category targets the partial | `compileTarget` names `partials/content-cta.hbs` | refused: `paywall-target` | the build fails by name |
| `@member.email` on the partial | a binding | refused by the existing check (R-28) | N/A |
| Reading time, withheld, `reading_time` 0, no preview | a live T3 gated post, Logged out user | the bare helper prints nothing, as Ghost does | N/A |
| Reading time, withheld, `reading_time` above 0 | the fixture, Logged out user | the whole post's "9 min read", as Ghost does | N/A |

</frozen-after-approval>

## Code Map

**Executed read-only at this Create (2026-09-26, keys by name: `GHOST5_URL` · `GHOST5_CONTENT_API_KEY` ·
`GHOST5_ADMIN_API_KEY` and the same three `GHOST6_`). The recorder writes these up as MEASUREMENTS §54.**

- **Content API `GET /tiers/?include=monthly_price,yearly_price,benefits`.**
  - T3 returns three tiers:
    - Free — `free`, `public`.
    - "Ghost5" — `paid`, `public`, USD 500/5000.
    - **"Ghost5 Pro" — `paid`, visibility `none`**, USD 1500/15000, 7 trial days.
  - T1 returns the same three, named "Ghost6" and "Ghost6 Pro".
  - With `filter=type:paid+visibility:public`, each answers ONE row. No tier on either box has benefits.
  - **So Ghost does not hide a hidden tier, and §7.6 item 14(b) is settled by execution.**
- **Content API `GET /settings/`** returns the same on both majors: `members_enabled` true, `members_invite_only` false,
  `members_signup_access` `all`, `allow_self_signup` true, `paid_members_enabled` true (Stripe is connected on both
  boxes), and `portal_plans` `[free, monthly, yearly]`.
- **Admin API `GET /admin/settings/`, integration key.** Both majors carry the stored `members_signup_access` and the
  calculated `members_enabled`, `paid_members_enabled`, `allow_self_signup` and `members_invite_only`. They also carry
  every `stripe_*` key, secrets included, and **nothing may copy those**.

**Read in Ghost's source** (npm tarballs 5.130.6 and 6.58.0, 2026-09-26; one line number means both majors). These are
hypotheses until the first task RECORDS them (standing rule 1).

- **`checkPostAccess`** (`core/server/services/members/content-gating.js` 5:34-62, 6:65-85): the rules are, in order:
  - `public` → allow.
  - No member → block.
  - `members` → allow.
  - `paid` → the member matches `status:-free`.
  - `tiers` → the member holds one of `post.tiers`.
  - It carries **no members-enabled check**.
- **`forPost`** (`…/serializers/output/utils/post-gating.js` 5:85-121, 6:84-124) calls it UNCONDITIONALLY. Its comment,
  "unless members is enabled", is not implemented.
  - Without access, a `<!--members-only-->` cut keeps the html before it (the preview).
  - With no cut, `html`, `plaintext` and `excerpt` become `''`.
  - `reading_time` is untouched. It was computed from the whole html before gating (`extra-attrs.js` 5:61-71, 6:66-76;
    mapper order `mappers/posts.js` 5:46 vs :82, 6:64 vs :100).
- **Subscription access "Nobody" withholds exactly as before.** What it changes:
  - `@site.signup_url` becomes RSS (`update-global-template-options.js:12-17`).
  - `@labs.members` becomes false.
  - `{{ghost_head}}` drops Portal's script and the CTA stylesheet, but only when members, donations and recommendations
    are ALL off (`ghost_head.js` 5:51-55,74-76; 6:121-125,146-148).
  - **So the box still shows, and its buttons open nothing. This is the source of Question 2.**
- **`{{content}}`** (`core/frontend/helpers/content.js:50-52`, `restrictedCta` :18-29): when `access` is false it
  executes the `content-cta` template with `this` = **the post** and `data` = `@site`, plus `@member` without products.
- **Ghost's own box** (5 `core/frontend/helpers/tpl/content-cta.hbs:1-20`; 6 `:1-32`) is the same markup on both
  majors; 6 writes its words through `{{t}}`, so with no locale file the words are the same.
  ```hbs
  {{{html}}}
  <aside class="gh-post-upgrade-cta">
      <div class="gh-post-upgrade-cta-content" style="background-color: {{@site.accent_color}}">
          {{#has visibility="paid"}}<h2>This {{#is "page"}}page{{else}}post{{/is}} is for paying subscribers only</h2>{{/has}}
          {{#has visibility="members"}}<h2>This … is for subscribers only</h2>{{/has}}
          {{#has visibility="tiers"}}<h2>This … is for subscribers on the {{tiers}} only </h2>{{/has}}
          {{#if @member}}<a class="gh-btn" data-portal="account/plans" href="#/portal/account/plans" style="color:{{@site.accent_color}}">Upgrade your account</a>
          {{else}}<a class="gh-btn" data-portal="signup" href="#/portal/signup" style="color:{{@site.accent_color}}">Subscribe now</a>
              <p><small>Already have an account? <a data-portal="signin" href="#/portal/signin">Sign in</a></small></p>{{/if}}
      </div>
  </aside>
  ```
  Its CSS is `tpl/styles.js`, identical on both, and `{{ghost_head}}` injects it.
- **The `{{reading_time}}` helper** (`@tryghost/helpers`, `cjs/helpers.js:3647, 3657`) does
  `if (!post.html && !post.reading_time) return ''`, then `post.reading_time || readingMinutes(post.html)`.
  - MEASUREMENTS §41d recorded the empty case: every probe post's `reading_time` is 0.
  - `research-contested-variants.md:372-401` read the rest: a withheld post with a real reading time prints the WHOLE
    post's.
  - **DW-128's "Ghost prints no reading time for a body it withholds" holds only at 0.**
- **The `@site` flags** (`settings-helpers.js` :22-32; paid 5:79-81, 6:80-82):
  - `members_enabled` = `signup_access !== 'none'`.
  - `allow_self_signup` = `'all'`.
  - `paid_members_enabled` = enabled ∧ Stripe connected.
  - The values are `all · paid · invite · none` (`default-settings.json` 5:263-270, 6:330-337).
  - `public.js` (5:30-35, 6:37-42) returns all five to the Content API.
- **`/tiers/`**:
  - `input/tiers.js:10-25,72-74` ANDs `active:true`, and **nothing filters `visibility`**.
  - `include` is dropped (`Frame.js:56`), and `limit` / `page` / `order` / `fields` are ignored.
  - The order is not stable.
  - Setup seeds "Default Product" at $5/$50 and renames it to the site title (`fixtures.json:22-43`,
    `auth/setup.js:110-131`), hence "Ghost5"/"Ghost6".
- **Ghost Admin**, read in the shipped bundles.
  - **Settings → Membership → Access** has the anchor `#/settings/members` and holds **Subscription access**:
    - 5.130.6: *Anyone can sign up · Paid-members only · Invite-only · Nobody*.
    - 6.58.0: *Public · Paid-members only · Invite-only · Nobody*.
  - **Tiers** has the anchor `#/settings/tiers`.
  - C3b's path holds, so **E-5 is settled by reading**.
- **The preview's paid member.** Ghost 6 previews a paid member as a stand-in holding every active paid tier
  (`create-paid-member-shim.js` 6:18-41). That is the model for `postAccess`'s Paid member.

**The frames (R-74).**

- `C Post Body.dc.html` **C3a** (:1360-1550):
  - **Top bar:** ink; breadcrumb; **NOT A PAGE SECTION** :1377; View as :1379-1383; **Back to post** :1385; "Ship update"
    :1386 (absent).
  - **Left rail:** POST TEMPLATE :1394, TEMPLATE SURFACES :1401, and the **How readers reach it** card :1407-1413
    (tier line :1411, link :1412).
  - **The strip:** "Showing" :1419, the design chip :1420, and "The article above is context, not editable here" :1421.
  - **The article and the cut** :1423-1436. The 55% dim is at :1425, and the marker labels are at :1434-1435.
  - **The box:** :1437-1472.
  - **The panel:** :1475-1545 ("Paywall" · "4 / 12" · the Design grid · six controls · Reset :1542 · "6 CONTROLS"
    :1543).
  - **The notes:** :1548.
- **C3b** (:1552-1682): the empty state :1649-1678. It is A7 item 12's correction (EXPERIENCE.md:2004-2010; landed,
  `reconcile-designs-decisions.md:1437`). Its parts:
  - the MEMBERS OFF chip;
  - the title :1665 and sentence :1666;
  - steps :1669-1670;
  - Open Ghost admin :1673 and Re-check :1674;
  - the footnote :1676.
- **`S4 Editor.dc.html:408-414`** is S4d's gated body: a dashed rule, then the chip at :410 — `#FFF4D6`, `#8A6100`,
  9px/600, radius 4, `2px 7px`, `top:-8px`.
- **`D5 Canvas Markers and Template Switcher.dc.html` D5b** (:104-189) draws the switcher's groups. The Membership
  group is the shape the new group takes.
- **EXPERIENCE.md** (the doc gets a C3a→C3b fix and Question 2's correction in the doc task):
  - :168, the IA row;
  - :207-222, the Template surfaces group, reached through the switcher, "the left panel stays Layers on every canvas";
  - :271, the indicator's words;
  - :354, the State Patterns row. It says "C3a's empty-state shape", and the shape is C3b.
- **C1a:81** ("Open paywall editor →") and **C1d:1064** belong to A25's Post Content panel (DW-266).

**The scheme and the switcher.**

- `apps/web/lib/editor.ts`:
  - `CANVASES` :23-38 and `canvasesOf` :69.
  - `templateKeyOf` :79 and `canvasOfTemplateKey` :74.
  - `fileOfKey` :107-111. The comment at :105-106 names `paywall` (5.20).
  - `canvasFromSegment` :158-159 refuses `paywall` only because it is not a key.
  - `canvasOfPath` :165 is read by `editor.tsx:376` with `?? 'home'`: **a route the scheme does not know silently
    paints Home.**
  - `canvasStack` :172.
- `editor.test.ts:29` lists `paywall` among refused segments.
- `(editor)/[template]/layout.tsx:26-29` is the synchronous refusal.
- **Readers of `CANVASES` / `canvasesOf` that must each answer the paywall** (the Dev sweep: grep both names):
  - the switcher's rows and groups;
  - Layers' "Site-wide · N templates" count (`templatesOpen`);
  - the site-wide confirm;
  - R-167's `afterChange`;
  - `stackOf` / `canvasStack`. **The paywall draws no site doc.**
  - synthesis (`isSynthesizable('partials/content-cta.hbs')` is false, so R-130's `circle-off` "Empty" mark applies);
  - the Section Picker (`offeredOn` offers nothing there);
  - `keymap.ts` (⌘K has nothing to place);
  - page 2 (none).
- `components/editor/template-switcher.tsx`:
  - `GLYPH` :61-72 is typed per `CanvasKey`, so a new key without a glyph is a type error.
  - `row` :141-171.
  - Groups :175-178 (`before | membership | after`).
  - The Tabler glyphs come in through `tools/vendor-icons.py` → `components/kit/icons.tsx`.

**The server read, the actions and the record.**

- `(editor)/read.ts`:
  - `projectOf` :62.
  - The site select (`url, title, content_key, disconnected_at`) ~:180. It gains `site_settings`.
  - The instance loop :185-209 **throws** on a non-placeable design (:194-196) and on a target mismatch (:205-207).
    The paywall key must accept a paywall design, and only one.
  - `held` / `pilotIds` :267 load placeable designs only.
  - `designate` :274.
  - The prefs keep a row only for a canvas or page-2 key (:297).
- `(editor)/actions.ts`: `setPreviewSubject` :39 and `setViewedStates` :95-110 (it refuses an unknown key).
- `projects/[id]/sync/route.ts:41` `TEMPLATE_KEY` answers 422 at :72.
- `supabase/migrations/20260922120000_page_two_template_keys.sql` holds the constraint on both tables. Story 5.16's
  Schema commit `c8eff23d` is the pattern: SQL, `SCHEMA.sql`, `RLS-TEST.sql`, `supabase/tests/rls.sql`, applied through
  `SUPABASE_DB_POOLER_URL`, read back.
- `project_treatments` (`complete_schema.sql:702-712`) has `paywall_design_id`. It has no reader, no writer and no
  column for content or controls, so it is not used (DW-267).
- `apps/web/lib/probe-rule.ts`: `settingsOf` :31 and `probePatch` :553-585 (it gains `members`).
- `apps/web/server/site-probe.ts` `probeSite` :58-150. The daily `checkSite` (`server/site-health.ts:130`, :167) calls
  it, so the record is daily for free.
- `sites/site-notices.tsx`: `NoticeSite` :50-62 and `SiteNotices` :121-175. `Banner kind="info"` and `Ask` are the
  shapes.
- `apps/web/lib/live-content.ts`:
  - `Resource` :52 has `tiers`; `SETTINGS` :73; `INCLUDE.tiers` :117 (Ghost ignores it).
  - `bindingReads` :124.
  - `SITE_FIELDS` :206-209 already has `members_enabled`, `allow_self_signup` and `paid_members_enabled`.
  - `TIER_FIELDS` :218-221.

**The canvas.**

- `editor.tsx`:
  - `stackOf` :425, `viewAs` :447, `commit` :806, `chooseVisitor` :1714-1720, and `paint` :1803 (the member at :1889).
  - `pro` :2666 and `apply` :2825.
  - The top bar :3230: the switcher :3314, ViewAs :3317, RemixDice :3335, ModeToggle :3343, DeviceSwitch :3344, Theme
    settings :3350.
  - LockBar :3364, Layers :3390, SourcePill :3600, Sidebar :3723, and `#editor-said` :3793.
- `apps/web/lib/canvas.ts` `renderSection` :180-246 already takes `member`. Omitting a new argument must keep today's
  render: that is the control.
- `lib/pilots.ts:118` `pilotsCanvasDocument` carries the tokens, the design CSS and the chrome. It has no
  `.gh-content`, card CSS or Ghost CTA CSS.
- `app/(app)/app/(authed)/canvas/route.ts` and its harness twin.
- `lib/style-guide.ts`: `THEME_CSS` :81-127 (the 720 stand-in measure), `head` :129-139, `simulatedCardsCss`, and
  `cardScripts`. The canvas takes the article's CSS from here, never a copy.
- `packages/library/src/orbit-weekly.ts`: `blocks` :572 (the article has 30 blocks), `styleGuideBody` :583, and
  `previewFixtures` :635 (no caller).
  - The fixture carries **no** `<!--members-only-->` (`orbit-weekly.test.ts:341`).
  - Its seventh block (index 6) is "I asked eleven of them why October…", C3a's last visible paragraph.
- `packages/section-runtime/src/core.ts`:
  - `data-helper="content"` :945-950 writes a trusted fixture.
  - The bare `reading_time` goes to the shim's `readingTime` (:1076-1085).
  - A `{{t}}` field param prints the FIELD (:996-1010).
  - `gateMembers` :1553.
- `packages/ghost-shim/src/index.ts`:
  - `readingTime` :195-208 always floors at 1.
  - `bareHelper('content')` :621-633 refuses without a fixture.
  - `queriesOf` :536 adds `include` for posts only.
- The pilots print reading time through the FIELD (`a17/1:31`, `a24/1:17`, `data-t="post.reading_time
  minutes=reading_time"`), so DW-128 changes nothing any pilot shows today.
- **The user's Portal links.**
  - `packages/library/src/vocabulary.ts:298` `PORTAL_ACTIONS` lists `signup · signin · account · account/plans`.
  - `packages/section-runtime/src/marks.ts:94-110` `linkAttributes` writes `{ portal }` as `href="#" data-portal="…"`.
    It is the one link sink for a prop's `href` and for an inline `a` mark (`core.ts:1216-1218`).
  - Latest Post's two actions are link props (`a4/13/index.html:10-11`), so a user can point one at Sign up today, with
    no gate. That is DW-154's 5.20 half.
  - The pilots' own asks are design-authored and already gated: `a22/1:1,11` (`members_enabled`,
    `allow_self_signup`) and `a1/1:19` (`allow_self_signup`).
- `components/kit/canvas-pill.tsx:7` and `kit/page.tsx:540` name the paywall's ink surround; `globals.css:36` is
  `--color-ink-deep`.

**The library.**

- `packages/library/src/vocabulary.ts`: `COMPILE_TARGETS` :116-119 and `isCompileTarget` :123, `MEMBER_STATES` :345,
  `GET_SOURCES` :394.
- `placement.ts`:
  - `NON_PLACEABLE` / `isPlaceable` :23-40, `GETTABLE` :66, `NATIVE` :71-84, `CONTEXTS_BY_TARGET` :93-96, `compilesTo`
    :119.
  - `offeredOn` :127-134 and `ringFor` :188 already keep A32 out of the Picker, Layers, Shuffle and Remix.
- `validate.ts`: `data-portal` is skipped as Ghost's own (:175-177); `validateDataBinding` :349-389; `bad-compile-target`
  :463-464.
- `contexts/matrix.json`: `get.tiers` → `tier` :266; the tier scope :522-566 (`benefits` is a `list` with no `of`); the
  `@site` flags :116-130; `@site.members_signup_access` never offered :209.
- `packages/library/fixtures/controls/` is R-158's stand-in precedent. It is read by `controls.test.ts`, `/controls`
  and the harness.
- `synthesize.ts:68-89` synthesizes no paywall. Its instance ids are `auto-<file>-<n>` (:125), which is how a
  synthesized instance is told apart.

**The walks and the harness.**

- `tools/probe/record-shim.py` records into `packages/ghost-shim/fixtures/ghost{5,6}/`, from the template
  `tools/probe/theme-shim/index.hbs`. **Its docstring is its help: `--help` uploads a theme.** `contract.test.ts`
  asserts the recording.
- `tools/probe/run-verify-editor.cjs`: :5750 expects `paywall` to 404, and the highest step is 94 (:5286).
- `tools/probe/run-verify-live-content.cjs` links T1/T3 through the service key.
- `app/(app)/app/harness/editor/page.tsx` types `EditorData` literally. `tools/keyboard/journey.spec.mjs` is R-146's
  walk.
- `apps/web/busy.test.ts` `NO_SKELETON` :123.

## Tasks & Acceptance

**Execution:**

- [ ] **SCHEMA FIRST, ALONE (R-99)** — `supabase/migrations/20260926120000_paywall_template_key.sql`, `…/architecture-Inflozo-2026-08-19/SCHEMA.sql`, `RLS-TEST.sql`, `supabase/tests/rls.sql`:
  - `template_key_shape` accepts `paywall` on BOTH `project_templates` and `project_template_prefs`.
  - The migration is strictly wider and re-runnable: `drop … if exists`, then `add`.
  - The RLS proof accepts `paywall` and refuses the near-miss `paywal` as its control.
  - Apply it through `SUPABASE_DB_POOLER_URL`, read it back, and push `Story 5.20 - Schema - …` before any code.

  -- The one stored key the story adds. Code that writes it must never ship before it.
- [ ] **FIRST, before any code** — `tools/probe/theme-shim/index.hbs` + `tools/probe/record-shim.py`: add a `MEMBERS`
  group. It creates, with the staff token, a Paid-members-only post that has a long body and a `<!--members-only-->`
  card, and a short one with none. It deletes both in `finally`. Record on BOTH majors, anonymous:
  - `{{content}}` (the preview + Ghost's box), the CTA `<style>` that `{{ghost_head}}` injects, and whether Portal's
    script is present;
  - `{{reading_time}}` and the field `{{reading_time}}` inside `{{t}}` on both posts;
  - `{{#get "tiers"}}` plain and with `filter="type:paid+visibility:public"`.

  Then, on T3 only, set Subscription access to **Nobody** with the staff token and re-record the members post's page:
  - is it withheld;
  - does the box render;
  - Portal's script;
  - the CTA stylesheet;
  - Admin `settings/`' members keys.

  Restore **all** in `finally` and read it back. The control is the same page before the toggle. Extend
  `contract.test.ts` to assert every row. Write it up as MEASUREMENTS §54, including the Content API tier and
  settings reads above.

  -- Question 2's premise, DW-128's rule and Ghost's own box all rest on this.
- [ ] `packages/library/src/access.ts` (new, exported) -- `postAccess(post, visitor)`: Ghost's `checkPostAccess` over
  the three visitors (*Always*). Pure and importless but for types. -- One rule for the cut, the indicator and the
  reading time.
- [ ] `packages/library/src/vocabulary.ts`, `placement.ts`, `validate.ts`, `contexts/matrix.json` -- The paywall target:
  - `partials/content-cta.hbs` joins the targets.
  - `NATIVE` gains its row: the post at the root, plus the gettable resources.
  - The validator gets `paywall-target`, `member-ask-ungated` and `tiers-unfiltered`, each refusal naming its ruling.
  - `docs/section-authoring.md` gains the three rules.

  -- R-4 and FR-H6 enforced where every design is assembled.
- [ ] `packages/library/fixtures/paywall/1`, `/2` (+ `content.json`) -- Two stand-in paywalls. They are validated, never
  shipped, and non-placeable like A32.
  - Each carries a heading, a blurb, a free ask (`data-portal="signup"` inside `@site.allow_self_signup`) and a sign-in
    line.
  - `/2` adds a tier-name list (`{{#get "tiers" filter="type:paid+visibility:public"}}` inside
    `@site.paid_members_enabled`).
  - They differ in layout, so ◀ ▶ shows a change.

  -- The choosing half has something to choose (R-158's shape).
- [ ] `packages/library/src/orbit-weekly.ts` -- Three things:
  - `templateContext` answers `partials/content-cta.hbs` with the fixture post at the root: Paid-members-only, `access`
    per visitor, and its tiers.
  - `assemble` / `templateContext` take an optional visitor that recomputes each row's `access` through `postAccess`.
    Omitted, every call answers exactly as today.
  - `PREVIEW_CUT` names the simulated marker's index (6) in one place.

  -- The visitor reaches the rows, with the old call as the control.
- [ ] `packages/ghost-shim/src/index.ts` + `packages/section-runtime/src/core.ts` -- Two things:
  - `readingTime` follows Ghost's helper: nothing when the visitor's body is withheld with no preview and
    `reading_time` is 0. The bare `reading_time` path passes that state.
  - `contentCta({ visibility, member, accent, major })` returns Ghost's own box as recorded. The accent passes
    `ghostColor`.

  -- DW-128 as Ghost does it, and the untouched paywall as Ghost draws it.
- [ ] `packages/section-runtime/src/marks.ts` (`linkAttributes`) + `core.ts` -- A link record whose `portal` is
  `signup` or `account/plans` carries its gate:
  - **The theme** wraps the element, or keeps an inline mark's words in `{{else}}`.
  - **The canvas** drops the element, or keeps the words unlinked, where the site's flag is false.

  It is proven in `agreement.test.ts` and `ad36.test.ts`. -- R-4 for the asks a design cannot see, in the one link
  sink.
- [ ] `apps/web/lib/probe-rule.ts`, `sites/site-notices.tsx`, `(authed)/sites/*` -- The record and its notice:
  - `probePatch` writes `members: { signup_access, paid_enabled }` from `settings`, only those two, only when
    well-formed.
  - `NoticeSite` gains the field, and `SiteNotices` shows the member-capability `Banner` with *Design Notes*'
    sentences and **Open Ghost admin ↗**.

  -- FR-H6's "records at connect and daily", and R-4's connect warning.
- [ ] `apps/web/lib/editor.ts` (+ `editor.test.ts`) -- `paywall` joins the scheme as the first **template surface**:
  file `partials/content-cta.hbs`, label "Paywall", its caption, a `surface` flag.
  - `fileOfKey` answers the partial.
  - Every reader in the Code Map's sweep answers the surface: no site doc, no synthesis marker but R-130's, no Picker,
    no page 2.

  -- One scheme, so the route, the switcher and the harness learn the word once.
- [ ] `(editor)/read.ts`, `(editor)/actions.ts`, `projects/[id]/sync/route.ts` -- The server side:
  - `EditorData.site.members` comes from the record.
  - The `paywall` doc accepts only a paywall-surface design, at most one instance, and loads those entries (the
    harness hands the stand-ins).
  - `recheckMembers(projectId)` is one Admin `settings/` read through `server/ghost-admin` that writes the record and
    returns it.
  - `setViewedStates` and `TEMPLATE_KEY` accept `paywall`.

  -- The server truth the canvas paints from.
- [ ] `apps/web/lib/paywall.ts` (new, pure) -- It holds:
  - every string in *Design Notes*;
  - `tierLine`;
  - `membersNotice(members, site)`;
  - `askOf(entry)`: which asks a design carries, read from the same attributes the validator reads;
  - `warnsOn(instance)`: never `auto-`.

  -- `node --test` reaches it, as `lib/view-as.ts`.
- [ ] `components/editor/template-switcher.tsx` + `kit/icons.tsx` (via `tools/vendor-icons.py`) -- The **Template
  surfaces** group in D5b's Membership shape, with Tabler `lock` for Paywall. -- EXPERIENCE.md's entry point.
- [ ] `(editor)/editor.tsx` + `lib/canvas.ts` + `lib/pilots.ts` + the canvas route -- The Paywall canvas:
  - **The chrome.** The ink top bar, NOT A PAGE SECTION, Back to post, and no Remix. C3a's strip holds the "Showing"
    pill (static), the design chip and the note.
  - **The paint.** It has no site doc. It paints:
    - the article from `blocks`, with the marker after `PREVIEW_CUT`;
    - the box (the instance through `renderSection` at the partial, or `contentCta`), per `postAccess`;
    - the canvas document's article CSS, card CSS and Ghost's CTA CSS, taken from `style-guide.ts` and §54.
  - **The chrome in the canvas layer** (AD-21, keyed `data-inflozo-*`): the 55% dim, the cut marker with its two
    labels, and S4d's indicator.
  - **The members-off card** (`components/editor/paywall-notice.tsx`, C3b per Question 2), with Re-check (busy) and a
    background re-check on open.
  - **The panel head.** "Paywall", plus "n / m" when designed, or the Ghost's-own line. The ring and the controls
    through 5.11's picker and the Sidebar appear only when designs exist.
  - **Choosing a design** from untouched is one `apply`.
  - **The member-ask line** sits at a placed instance's panel head. It is 5.18's note shape, read from the record.

  -- C3a and C3b, painted by the one door.
- [ ] `components/controls/layers.tsx` -- On the paywall canvas: no rows, no "+ Add section", and C3a's card with
  `tierLine` over the source in force's public tiers. The link is shown for a linked site only.
  - The live count is one new read in 5.18's store, `tiers?filter=visibility:public`, made only on this canvas with the
    site's content.

  -- C3a's left panel, as EXPERIENCE.md re-specified it.
- [ ] `app/(app)/app/harness/editor/page.tsx` + `tools/keyboard/journey.spec.mjs` -- The harness hands in the
  stand-ins. The walk covers:
  - Template ▾ → Paywall;
  - View as through all three states (the cut, the box's words, the indicator);
  - choosing a stand-in, then ◀ ▶, a control, and one `⌘Z` back to Ghost's own box;
  - Re-check's busy label and its refusal (the harness has no database — 5.14's precedent);
  - Back to post;
  - zero chrome at rest on Home.

  -- R-146: the wiring on every commit.
- [ ] Tests:
  - `access.test.ts`: Ghost's truth table, both majors' rules.
  - `validate.test.ts`: each new refusal, with the pilots and the stand-ins passing.
  - `orbit-weekly.test.ts`: the control unedited; the partial's context; the visitor's `access`.
  - `ghost-shim` / `contract.test.ts`: `readingTime`'s four cases; `contentCta` equal to §54.
  - `agreement.test.ts`: both stand-ins at the partial, node for node.
  - `ad36.test.ts`: a crafted tier filter or Portal action is refused.
  - `apps/web/paywall.test.ts`: every string equal to *Design Notes*; `warnsOn` refuses `auto-`.
  - `probe-rule` / `server-wiring`: `members` copies two keys and never `stripe_*`.
  - `editor.test.ts`, `busy.test.ts`.

  -- The matrix is the contract.
- [ ] `tools/probe/run-verify-editor.cjs` (step 95) + `run-verify-live-content.cjs` -- The deployed walks (R-82):
  - **Step 95** walks the Paywall canvas on sample content in every state of the matrix above, and drops `paywall` from
    :5750's 404 list.
  - **The live walk.** On T1 it reads the site's box and accent, "1 tier · 1 free", and the admin link. On T3 it sets
    Subscription access to Nobody with the staff token (for under a minute, restored in `finally`), presses Re-check,
    reads the card and the Sites notice, restores, and Re-checks back.

  -- Proven on production, not a harness.
- [ ] Docs:
  - **MEASUREMENTS §54.**
  - **The spine.** AD-27(a0): the paywall is the `paywall` doc, and `paywall_design_id` is unwritten (DW-267).
  - **`prd.md`:**
    - FR-H6: the record, the members-off truth as Question 2 rules, and the tier filter settled by execution.
    - FR-D16: the indicator as Question 3 rules.
    - FR-D5's Theme-settings clause for the paywall.
    - Appendix B's `@site`/Tier fields.
    - §7.6 item 14(b).
  - **EXPERIENCE.md:** :354 (C3b, and the premise).
  - **`epics.md`:**
    - 5.20's criteria words: DW-128, and the rulings.
    - Stories 7.18, 7.3 and 7.6: DW-260 and DW-261.
    - Stories 10.107–10.109: DW-262 and DW-263.
    - Stories 10.14 and 10.83: DW-264 and DW-266.
  - **The ledger:** DW-128 closed with its resolution, DW-154's Portal-gating half, and DW-260 to DW-268.

  -- Standing rule 3.

**Acceptance Criteria:**

- **The frames.**
  - Given the Paywall canvas, when I open it and switch View as, then it **matches frame C3a as corrected** (*Design
    Notes*): the ink bar, NOT A PAGE SECTION, Back to post, the strip, the dimmed article, the cut marker and its two
    labels, the box, and the "How readers reach it" card.
  - Given a linked site with members switched off, when the canvas shows the site's content, then its screen **matches
    frame C3b as corrected** by A7 item 12 and by Question 2.
  - Given a Paid member on the canvas, when the article is whole, then the label **matches S4d's gated label**
    (`S4 Editor.dc.html:410`).
  - Given the Template switcher, when I open it, then the **Template surfaces** group matches D5b's Membership group's
    shape.
- Given an untouched paywall, when the canvas renders for each visitor, then the box is exactly Ghost's own for that
  visitor and major, node for node with MEASUREMENTS §54.
- Given the harness's stand-ins, when I choose one from untouched, then one instance is stored and one `⌘Z` returns to
  Ghost's own box. Given any render handed no paywall or visitor argument, when it paints, then it is byte-identical to
  today's — the snapshots, the matrix and `/pilots` are the control.
- Given the Admin settings read at connect, daily or on Re-check, when the probe runs, then `site_settings.members` holds
  exactly `signup_access` and `paid_enabled`, and no other settings key.
- Given a design with a member ask outside its flag, a tier query without `type:paid+visibility:public`, or a
  non-paywall design targeting the partial, when the library is assembled, then the build refuses it by name.
- Given a button or an inline link the user pointed at Portal's Sign up or Upgrade, when either emitter renders it,
  then it sits behind the site's own flag, and the canvas and the theme agree node for node.
- Given a placed section with a member ask on a members-off site, when I select it, then its panel says so; given the
  same design synthesized (`auto-…`), then nothing is said.
- Given Re-check, when I press it, then it says "Re-checking…" (`aria-busy`, never `disabled`) and the canvas and the
  record follow Ghost's answer; `busy.test.ts` stays green (R-98).
- Given a session reading along, when I open the Paywall canvas, then choosing a design and its controls are disabled
  (R-192), while View as, Re-check and Back to post work.

## Spec Change Log

## Design Notes

**Why the canvas is truthful before any design exists (Question 1's recommended option).** The approved plan (the
step-6 stress test's F3) builds this surface now and meets A32 at its own owner gate. With no A32 design, the honest
paywall is Ghost's own box, which is what a Ghost site renders until a theme overrides `content-cta`. So the canvas shows
that box, per visitor, rather than a placeholder. That state is permanent product behaviour: an untouched paywall
compiles nothing (FR-I1) and Ghost's box renders. The design ring is ABSENT while the library holds none (R-118, UX-DR3).
The two stand-ins prove the choosing half in CI, and 10.107 brings the real designs into the same code.

**Why a Paid-members-only post.** The drawing's own note (C3a:1548) says switching to Paid member is "the only way to
check that the cut disappears". On a paid post the three visitors show three different states: the paid gate, the
upgrade gate, and no cut. On a members-only post, Free and Paid would look alike. P0·6's gate switcher, which covers
members, paid and tiers posts, is A32's to declare (DW-262).

**Why a `paywall` doc and not `project_treatments`.** A paywall design has content and controls (A32's shared field
list), which `paywall_design_id` cannot hold. Every edit path — the journal, undo, sync, the lock — already works on
docs. AD-27's rule is "the doc gains a row per stored state, not a second store". So the choice lives in one place, and
`paywall_design_id` is left unwritten (DW-267).

**Why the record comes from Admin `settings/`.** AD-10 forbids a Content read through a server route. The probe already
reads Admin `settings/` at connect and daily, and the members keys are in it (executed). One record then serves the
Sites notice, the editor and Story 7.18's pre-deploy check. The canvas still renders `@site` flags from 5.18's live
read, and the background re-check on opening the Paywall canvas brings the two together.

**The frames, as corrected (R-74).**

- **C3a:**
  - View as is S4d's dropdown with R-170's names, not the drawn segmented control with "Anonymous".
  - "Ship update" is absent (Story 7.18).
  - The left rail's POST TEMPLATE / TEMPLATE SURFACES lists are the Layers panel plus the switcher's group
    (EXPERIENCE.md:218-222).
  - The six controls and the "Design 4 of 12 · Two Up" names are A32's, not current (A32 #4 is Contrast Band), and
    arrive with 10.107.
  - The drawn tiers ("Reader $5 · Supporter $12") are the source's own.
- **C3b** keeps its shape. Its words follow A7 item 12 and Question 2. Step 2's "pick a design" becomes "we re-check
  whenever you open this screen", because nothing can be picked until 10.107.
- **The Template surfaces group, the explainer card and the Sites notice** are extrapolated from D5b's Membership
  group, C3a:1407-1413 and the Sites screen's existing `Banner`s.

**Routine calls, each stated rather than asked.**

- The simulated marker sits after the fixture's seventh block, C3a's last visible paragraph.
- The article is dimmed in both states, because it is context on this canvas either way.
- The "Showing" pill is static text, never a menu (R-118).
- The canvas opens scrolled to the marker.
- The Paid member holds every active paid tier (Ghost 6's preview member).
- Warnings are never shown for a site with no record yet.
- The glyph is Tabler `lock`.
- The switcher row's mark is R-130's "Empty" while the paywall is untouched, because nothing is emitted.
- **Kept whole:** the story's one goal is the membership half. The record, the warnings and the rules are what the
  canvas's members-off state and every member ask stand on.

**What is not built, and where it went.**

- DW-260: the pre-deploy repeat of the member-capability warnings goes to Story 7.18.
- DW-261: `{{> "content-cta"}}` and `{{{html}}}` go to Stories 7.3 and 7.6.
- DW-262: A32's gate switcher, the per-gate copy, the named-tier preview and a way back to Ghost's own box go to 10.107.
- DW-263: 10.107–10.109's criteria still call A32 placeable and ring-cycled.
- DW-264: `{{price}}` and a repeatable `benefits` go to A7's first story, 10.14.
- DW-265: the A32 spec's "From Ghost, all" and "greeted by name" (the validator refuses both).
- DW-266: C1a/C1d's "Open paywall editor →" goes to 10.83.
- DW-267: `project_treatments.paywall_design_id` goes to 7.13.
- DW-268: Starter 11.11's "Hard Stop Card (A32 #2)" is not a current name.

**The words (R-170). These are the strings.** `{site}` is 5.18's site name, `{url}` its address, and `{n}`/`{m}` are
numbers.

| Where | What it says |
|---|---|
| Switcher group · row · caption | **Template surfaces** · **Paywall** · *"Where a members-only post stops"* |
| Top bar | **Not a page section** (uppercased by CSS) · **Back to post** |
| Strip | *"Showing: the cut only"* / *"Showing: the whole post"* · *"The article above is context, not editable here"* / *"The article is context, not editable here"* · **Design {n} of {m} · {name}** |
| Cut marker | **Ghost cuts here · public preview marker** (uppercased) · *"below this line never reaches the browser"* |
| Indicator | **Gated content — shown with sample text** |
| Layers card | **How readers reach it** · *"Ghost cuts the post at the author's Public preview marker and renders this block in its place. You cannot move it."* · *"{n} tiers · {m} free"* (one: "1 tier") · **Tiers in Ghost admin →** |
| Panel head | **Paywall** · **{n} / {m}** when designed · untouched: *"This is Ghost's own paywall — what your readers see today."* |
| Members-off card (Question 2, option 1) | **MEMBERS OFF** · **Members are switched off** · *"Members are switched off for {site} — subscription access is set to Nobody — so your posts for members still stop at the cut, but nobody can sign up there: Ghost stops loading its sign-up window."* · *"In Ghost admin, open Settings → Membership and set Subscription access to anyone or invite-only"* · *"Come back here — we re-check whenever you open this screen"* · **Open Ghost admin** (→ `{url}/ghost/#/settings/members`) · **Re-check** / **Re-checking…** · *"You can still work on your paywall with sample content — switch the canvas to Sample content below."* |
| Re-check, said | *"Members are on for {site}."* · *"Members are still switched off for {site}."* · refused: *"Could not check {site} just now."* |
| Sites notice | none: *"Members are switched off on {site} — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone up."* · invite: *"Only people you invite can join {site}, so free sign-up forms show nothing there."* · paid: *"New members must pay to join {site}, so free sign-up forms show nothing there."* · paid off: *"Paid memberships are off on {site} — Stripe is not connected — so paid sign-up buttons show nothing there."* · **Open Ghost admin ↗** |
| A placed member ask | *"Members are switched off on {site}, so this section's sign-up form shows nothing there."* |
| Refusals | `member-ask-ungated` (R-4) · `tiers-unfiltered` (FR-H6) · `paywall-target` (FR-H6) — each sentence names the rule and the fix |

## Verification

**Commands** (Node 24; keys by variable name only):

- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, with `paywall` accepted and `paywal` refused on both
  tables. The migration is applied to production through `SUPABASE_DB_POOLER_URL` and read back before the Schema push.
- `python3 tools/probe/record-shim.py` (read its docstring first — `--help` uploads) -- expected, on T1 and T3:
  - every `MEMBERS` row is recorded;
  - both posts are created and deleted;
  - T3's Subscription access is restored to `all` and read back;
  - the previous theme is restored and the probe theme deleted.

  It is written to §54, with both *Ask First* findings stated either way.
- `pnpm check` -- expected: exit 0, including:
  - `access.test.ts`, `validate.test.ts`, `agreement.test.ts` and `ad36.test.ts`;
  - `contract.test.ts` over §54;
  - `orbit-weekly.test.ts`'s control, unedited;
  - `paywall.test.ts` and `busy.test.ts`.
- `node tools/check-snapshots.mjs` and `bash tools/matrix/run-matrix-gate.sh` -- expected: no snapshot or baseline moves.
  No pilot prints the bare reading-time helper.
- `pnpm keyboard` -- expected: green, with the paywall journey among the passes.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: 0 errors / 0 warnings on both
  majors (a root `pnpm install` first, Node 24). It is unchanged, and it is the control that the validator's new rules
  refuse nothing already built.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node tools/probe/run-verify-editor.cjs`
  -- expected: 0 FAIL on `app.inflozo.com`, with step 95 among the passes. It is known-flaky (DW-222, DW-220), so record
  every run.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST5_URL|GHOST5_CONTENT_API_KEY|GHOST5_STAFF_ACCESS_TOKEN|GHOST6_URL|GHOST6_CONTENT_API_KEY)=' tools/probe/.env | xargs) NO_429=1 node tools/probe/run-verify-live-content.cjs`
  -- expected: 0 FAIL on both majors, with T3's toggle restored. Tell the owner before it runs: his Ghost 5 Project
  reads T3.
- `python3 tools/doc-audit.py --check`, twice -- expected: PASS.

## Owner's manual test

On the real site after Deploy, in a desktop browser about 1440 wide. Deploy confirms the URLs.

- Steps 1–9 use your **Ghost 5 Project**, which reads ghost5.inflozo.com.
- Step 10 uses **Pilot sections**.
- Steps 6 and 9 change a setting in ghost5's own admin, and step 9 puts it back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Open **Template ▾**. | — | Below the templates, a **Template surfaces** heading with one row, **Paywall** — "Where a members-only post stops". |
| 2 | same → `…/paywall` | Paywall | Choose **Paywall**. | — | The top bar turns dark, with **NOT A PAGE SECTION** and **Back to post**. The left panel shows no layers, only "How readers reach it", then **1 tier · 1 free**, then **Tiers in Ghost admin →**. Your hidden "Ghost5 Pro" tier is not counted. |
| 3 | same | Paywall | Look at the canvas, with View as on **Logged out user**. | — | "Showing: the cut only". The article's opening paragraphs are faded. A dashed coral line reads **GHOST CUTS HERE · PUBLIC PREVIEW MARKER**, with "below this line never reaches the browser". Under it is Ghost's own box, in your site's accent colour: "This post is for paying subscribers only", **Subscribe now**, "Already have an account? Sign in". |
| 4 | same | Paywall | Set **View as** to **Free member**, then **Paid member**. | — | As a Free member the box says **Upgrade your account**. As a Paid member the line and the box disappear, the whole article shows ("Showing: the whole post"), and a small amber label, **Gated content — shown with sample text**, marks where the cut was. |
| 5 | same | Paywall | Look at the settings panel on the right. Press **Tiers in Ghost admin →**. | — | The panel says **Paywall** and "This is Ghost's own paywall — what your readers see today." There are no designs to choose yet. The link opens ghost5's admin on its Tiers settings in a new tab. |
| 6 | `https://ghost5.inflozo.com/ghost/#/settings/members` | Ghost admin | Set **Subscription access** to **Nobody** and save. Back in the editor, press **Re-check**. | — | The button says **Re-checking…**, then the canvas shows the **Members are switched off** card: its sentence, the two numbered steps, **Open Ghost admin** and **Re-check**. |
| 7 | `…/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click **Newsletter — Inline Row** in Layers. | — | At the top of its settings: "Members are switched off on Ghost5, so this section's sign-up form shows nothing there." |
| 8 | `https://app.inflozo.com/sites` | Sites | Look at ghost5's card. | — | "Members are switched off on Ghost5 — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone up." with **Open Ghost admin ↗**. |
| 9 | ghost5's admin, then `…/paywall` | Ghost admin, Paywall | Set **Subscription access** back to **Anyone can sign up**. In the editor's Paywall, press **Re-check**. | — | Ghost's box comes back. The notice on Sites and the line on the Inline Row are gone. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/paywall` | Paywall (Pilot sections) | Look at the left panel and the box. | — | **5 tiers · 1 free**, with no Ghost admin link, and Ghost's box in Orbit Weekly's colours. Your Home, Post and other templates are unchanged: Template ▾ → Home. |

## Questions for the owner

### Question 1 — There are no paywall designs until Epic 10. What should the Paywall screen do until then?

**In plain English.** This story builds the screen where you design the box your readers meet when a post stops for
members — the paywall. The twelve paywall designs are drawn but are built in Epic 10 (Stories 10.107–10.109), so today
there is nothing to choose between. The plan says to build the screen now anyway and test it with "whatever designs
exist" — which is none.

**An example.** You open **Template ▾ → Paywall** on your Ghost 5 Project. With option 1 you see the start of an
article, a coral line where Ghost cuts it, and under it Ghost's own box — "This post is for paying subscribers only ·
Subscribe now" — exactly what your readers see today. Switching View as to Paid member makes the cut disappear. There
are no designs to pick yet. With option 3 the Template menu has no Paywall row until Epic 10.

1. **Build the screen now; until A32's designs exist it shows Ghost's own box. (RECOMMENDED)**
   - You can see today what each kind of reader meets at the cut, with your real tiers counted.
   - The members-off screen and its Re-check work on your real site.
   - Choosing and styling a design is built too. It is proven in the automated checks on two stand-in paywalls that
     never reach your editor.
   - The real designs appear with Story 10.107, and you test the whole thing at A32's own owner gate — the plan's own
     "the two meet at A32's gate".
   - Epic 10's paywall stories stay pure design work, like every other category.
2. **The same, and also put the two stand-in paywalls on the Controls review page**, so you can try choosing one on the
   live site now, as you did for the design ring (R-158).
   - A little bigger.
   - The stand-ins are thrown away when the real designs arrive.
3. **Move the Paywall screen to Epic 10, straight before A32's first story** — the shape of your R-195 and R-196.
   - This story then builds only what protects every site today: recording whether members are switched on, the
     warnings on the Sites screen and on sign-up sections, and the rules that keep every sign-up button behind your
     site's own switch.
   - The "Gated content — shown with sample text" label moves with the screen, since no other canvas draws an article
     yet.

**Ruled:** _(awaiting the owner)_

### Question 2 — With members switched off, the drawing says nothing is locked; Ghost's own code says posts still lock, behind a box that does nothing. What should the screen show?

**In plain English.** The drawing C3b shows a "Members are switched off" screen. It says that with Subscription access
set to Nobody "nothing on the site is gated and this block has nothing to appear on". I read Ghost's own code, both
versions, and switching members off does not unlock anything:

- A post set to members, or to paid members, still stops at the cut.
- The box shown there cannot sign anyone up, because Ghost stops loading its sign-up window.
- With donations and recommendations also off, Ghost drops the box's styling too.

This story's first step records that on your ghost5 test site before anything is built. If the recording disagrees, the
drawn screen stands as drawn and this question falls away.

**An example.** On your ghost5 site, Subscription access is set to Nobody. A reader opens one of your paid posts. It
stops after the first paragraphs and shows "This post is for paying subscribers only · Subscribe now" — and Subscribe
now does nothing.

1. **Keep the drawn screen, and correct its words to what Ghost does. (RECOMMENDED)**
   - It becomes: "Members are switched off for Ghost5 — subscription access is set to Nobody — so your posts for
     members still stop at the cut, but nobody can sign up there: Ghost stops loading its sign-up window."
   - The two numbered steps, **Open Ghost admin** and **Re-check** stay.
   - The footnote points you to Sample content, where you can keep working on the paywall.
2. **Keep the paywall on screen, and show the same corrected card above it as a warning**, so you see the dead box your
   readers see.
3. **No card.** The paywall shows as usual, and one warning line sits in the settings panel.

**Ruled:** _(awaiting the owner)_

### Question 3 — "Gated content — shown with sample text": which visitor sees that label?

**In plain English.** The editor never shows the real words of a locked post — Ghost does not give them out — so every
canvas shows the same sample article. This story's card says the label appears "wherever the visitor View as is
previewing may not read it". But the drawing S4d puts it on the locked part of the article while previewing as a **Paid
member**, someone who CAN read it. And on the Paywall screen, a visitor who cannot read it never sees the locked part at
all: they see the cut and the box, as Ghost serves them.

**An example.** A paid post on the Paywall screen. As a Logged out user or a Free member you see the start of the
article, the coral cut line and the box. As a Paid member the line and the box disappear and the whole article shows.

1. **The label marks where the locked part starts, for a visitor who can read it — as S4d draws it. (RECOMMENDED)**
   - As a Paid member you see the whole article with "Gated content — shown with sample text" where the cut was. It
     says that everything after it stands in for your real locked words.
   - A visitor who cannot read it sees exactly what Ghost sends them: the cut and the box.
2. **Also for a visitor who cannot read it.** Under the box, the rest of the article is drawn faded, with the label, so
   you see what they miss.
   - No reader's browser ever receives that text. The drawing C3a itself says "below this line never reaches the
     browser".

**Ruled:** _(awaiting the owner)_
