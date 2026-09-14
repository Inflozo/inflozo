---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md
  - _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/
---

# Inflozo - Epic Breakdown

## Overview

This document is the complete epic and story breakdown for Inflozo. **It expands PRD §8; it does not
re-plan it.** §8 already fixes the epic numbers, their titles, their sequence, their exit criteria and
every FR's owning epic. Every epic number and title below is §8's, verbatim — the story board keys the
category gate off the titles *The Shell Block* and *The Gated Library Pipeline*.

**Three rules govern every story here.**

1. **Counts are derived, never restated** (standing rule). Every library figure on this page came from
   `python3 tools/inventory-gen.py --check` and `python3 tools/export-roster.py`, run 2026-09-04. Where a
   number appears it is a snapshot of a derivation, not a maintained value.
2. **Matches the frame** (ruling R-74, `reconcile-designs-decisions.md` §A10). Every story with a surface
   names the frame it is built from — `EXPERIENCE.md` § Information Architecture gives every surface its
   frame — and carries a *matches the frame* acceptance criterion. The design authority is
   `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/`, which is never edited.
3. **The owner tests every screen himself, on the deployed site** (ruling R-80 as amended 2026-09-04).
   Every story with a screen is written so a non-engineer can test it: its spec carries `## In plain
   English` and `## Owner's manual test`, both derivable from the acceptance criteria below without
   guessing. His findings are fixed inside that story, never by a design pass.

**Where this document deliberately differs from the skill's defaults**, because §8 already decided:

| The skill would flag | §8's ruling |
|---|---|
| E0, E4 and E15 are "technical layers", not user value | Overruled — E0 is two blocking spikes, E4 is the runtime every category is authored against, E15 owns the launch gates |
| E1 and E13 both touch the dashboard (file churn) | Overruled — §8's E1 cut line names exactly what is in and out, and E13 closes it |
| E4 → E7 is a forward dependency between epics | Overruled — the **E4/E7 joint compile gate** is §8's design and is recorded as E7's closing story |
| A library category story is not independent | Overruled — R-85 makes a category a *run* of consecutive one-session stories, and the run is sequential by design |
| A UX polish or design-system epic should exist | Overruled — UX requirements fold into the §8 epic that owns the surface |

---

## Requirements Inventory

### Functional Requirements

Extracted from PRD §5. **132 FRs**, derived by counting `FR-<domain><n>` entries in §5 rather than from
any stated total. Ordered as §5 orders them — by dependency, not alphabetically.

**FR-A · Authentication & Accounts**

- **FR-A1** Sign-up and sign-in via magic link (Supabase Auth email OTP), branded template. No passwords exist anywhere in the product.
- **FR-A2** Passkey (WebAuthn) support via Supabase Auth, behind a feature flag: magic link first, then a post-onboarding nudge to register.
- **FR-A3** Account → Security lists registered passkeys, auto-named from the authenticator AAGUID, with rename and revoke.
- **FR-A4** Email change with re-verification; an address already registered to another account is rejected upfront, before any verification email is sent.
- **FR-A5** Account deletion: full cascade, suggestion anonymisation, 14-day soft-delete with one-click restore, explicit subscription handling across the window, snapshot download offered throughout, purge on the deadline regardless, no further email.
- **FR-A6** Sessions persist 30 days rolling; sign-out-everywhere is available.

**FR-B · Projects & Dashboard**

- **FR-B1** Dashboard project cards: a static Style-Pack-derived placeholder image, name, linked-site or sample-content badge, last-deploy chip, updated-at. Auto-captured thumbnails are deferred out of v1.
- **FR-B2** Create project from Starter template, Blank canvas, or Redesign proposals; Style Pack chosen at creation. Duplicate is **not** one of this surface's paths (owner, 2026-09-06, ruling **R-93**) — the capability stays on a project's ⋯ menu, FR-B3.
- **FR-B3** Rename, duplicate, delete (type-name-to-confirm) on every project, with the live-theme warning and the snapshot-survives rule.
- **FR-B4** Plan caps enforced at creation time with a contextual upgrade prompt (Free 1, Pro 25).
- **FR-B5** A project targets at most one connected site at a time, switchable; unlinked projects render the bundled sample dataset.
- **FR-B6** Dashboard also surfaces a connected-sites strip with health badges, an asset quota meter, and a "What's new" changelog popover.
- **FR-B7** Notifications centre: per-user feed of deploy outcomes, site health, Ghost-compatibility notices, billing events, library updates and announcements; unread badge, mark-all-read, 90-day retention with health and compatibility notices exempt from the prune.

**FR-C · Ghost Site Connections**

- **FR-C1** Connect flow — one credential pair now, the Staff Access Token deferred to first deploy. The no-token path is a designed path: no snapshot, no drift check, no automated routes upload, and deploy itself unaffected. A partially credentialed project is a first-class state.
- **FR-C2** Server-side validation by minting the Admin JWT and calling the authenticated `GET /admin/config/` — never `GET /admin/site/`. Reports the Ghost version (5.x/6.x accepted, 4.x rejected), probes `hostSettings.limits.customThemes` for Preview-only, computes the code-injection boolean and discards it, and reads Portal's floating-button state and the announcement-bar settings.
- **FR-C3** Key security: Admin keys and the Staff Access Token encrypted in Supabase Vault, never sent to any client, all Admin calls proxied server-side with per-request short-lived JWTs. The token's full-Administrator scope is disclosed where it is requested.
- **FR-C4** Auto-branding: a one-click "Use your brand" card seeding accent, logo and navigation, and offering the site's announcement bar as a seeded A2 section with a one-click "turn Ghost's own bar off".
- **FR-C5** Multi-site (Free 1, Pro 10); a daily health check re-validating credentials, version, the Preview-only probe, live `routes.yaml` drift, Portal button and announcement settings; the once-per-transition "Reconnect needed" email under a one-per-site-per-7-days ceiling; and the per-Ghost-release compatibility broadcast with its narrow redeploy exemption.
- **FR-C6** Disconnecting never deletes projects or snapshots; snapshots bind to the site record id, never the raw URL, and orphan after 90 days with a notice and a download offer.
- **FR-C7** Redesign proposals: a one-click pass rendering 2–3 whole-site starter × Style Pack combinations on the user's real content, which must differ in layout structure; re-runnable from the dashboard.
- **FR-C8** Key rotation and reconnect: per-site Manage keys handling a partially credentialed site as an ordinary state. A site's URL is immutable — a domain move is a disconnect plus reconnect.

**FR-D · Editor Core**

- **FR-D1** Layout: slim top bar, collapsible left Layers panel, centre canvas, right Controls sidebar; the canvas carries zero editing chrome. The floor is a **device test, not a width test**: a coarse pointer below 834 gets the Small Screen Notice; a desktop-class device holds the editor at 200% browser zoom.
- **FR-D2** Hover state: 1px outline, name tag, Previous/Next design arrows, duplicate, delete, drag handle, and a hairline "+" between sections.
- **FR-D3** Click selects a section; Esc deselects; clicking a text element inside a selection enters inline editing.
- **FR-D4** Inline editing of every text prop, with a floating toolbar offering exactly four marks — bold, italic, underline, link. Rich text is stored as **text plus mark ranges**, never as an HTML string; the compiler is the single serialisation point.
- **FR-D5** Layers panel: ordered list, drag reorder, per-instance rename, duplicate/delete, visibility toggle; site-wide singletons as a pinned group; at most one Post Content section per layout, refused at placement; non-placeable treatments never appear; CTA-bearing sections carry the member-visibility control.
- **FR-D6** Template switcher: Home, Post, Page, Tag, Author, Membership (Signup/Signin/Member Home), 404, conditional Private, plus custom templates. Synthesis applies to exactly seven templates, and synthesised templates are visible and marked.
- **FR-D7** Light/Dark authoring with mode-scoped controls, the moon badge, per-section "Clear dark overrides", and the project-level Light only / Light + Dark setting. No visitor mode-toggle is offered on a pinned colour scheme.
- **FR-D8** Device preview — Desktop / Tablet 834 / Mobile 390, display only, resizing the canvas in both axes to a real device size.
- **FR-D9** Undo/redo: 100-step history over content, controls, ordering, shuffles and pack changes; persists locally across reloads; cleared on a superseding hydrate.
- **FR-D10** Local-first persistence: every change written immediately to local storage, cloud sync on an interval and at defined moments, manual ⌘S, four indicator states, and an honest fallback when local storage is unavailable.
- **FR-D11** Keyboard map: ⌘K · `[` `]` · ⌘D · Del · ⌘Z/⇧⌘Z · ⌘S · 1/2/3 · L · `.` · Esc. Later states carry no shortcut, deliberately.
- **FR-D12** Section Picker: full-screen overlay, category rail, search, live previews in the project's own pack and content, Free/Pro badges, context filtering on `bindingContext` and `compileTarget`, non-placeable treatments absent.
- **FR-D13** Variant Shuffle: cycles a section through its category's designs in place, carrying content and control values under the carry/park/default rule, restricted to designs sharing the instance's binding context and compile target.
- **FR-D14** Canvas is site-width, fit-to-viewport, no zoom in v1, no cap on sections per template; holds NFR-1 on the 40-section fixture, degrading gracefully beyond it.
- **FR-D15** Content-source pill naming the site or sample content, and the preview subject.
- **FR-D16** Member-state preview — Anonymous / Free member / Paid member — with the proven `@member` field set, the shimmed announcement strip following visibility, gated bodies always rendering the fixture, and a nudge naming the states not yet looked at.
- **FR-D17** Site Remix: one action re-rolls pack and/or every placed design with all content preserved. Never-lose-content covers **control values** as well as content props, and the gate is mechanical.
- **FR-D18** Edit lock: one editing context per project across tabs, browsers and devices, with the request/no-response/take-over protocol and the unsynced-edit count stated in edits. Deploy and ZIP export require the lock.
- **FR-D19** Design navigation — the library's primary control: `[` `]`, hover arrows, and the sidebar Design picker showing position. Switching obeys **carry, park, default**.
- **FR-D20** Preview toggle: JavaScript behaviours do not run on the canvas while designing; layout-affecting CSS always does. Each module declares `edit-safe`, and the non-edit-safe ones render in their resting state.
- **FR-D21** Paginated preview: any canvas showing a paginated feed can be previewed on page 2, deliberately a middle page carrying both a previous and a next link.
- **FR-D22** Preview subject: every single-resource canvas renders one chosen resource — the fixture by default, overridable once a site is connected, persisted per canvas and named in the pill.

**FR-E · Style Packs**

- **FR-E1** Every pack token is either **computed** or **authored**, and Appendix D says which per row; the author is asked only for genuine judgement. Full token set per pack, including the 30-pairing font pool.
- **FR-E2** 12 curated presets ship with hand-tuned paired light + dark palettes; switching restyles the canvas live in ≤ 300 ms.
- **FR-E3** Every token is user-editable per project, per mode, with a live AA contrast check that warns and never blocks. Custom packs are per-project by design.
- **FR-E4** Tokens compile to CSS custom properties with **one** declared dark selector list and nothing else in the theme selecting on mode. Three inputs decide the mode in a normative precedence: the visitor's choice, then the owner's pin, then the system preference.
- **FR-E5** Auto-branding seeds accent colour and logo into the active pack.

**FR-F · Control System**

- **FR-F1** Controls come from a shared vocabulary of simple, visual, named-value types, including **Item List** for authored repeating blocks — never for a Ghost-bound repeat. Remove never greys.
- **FR-F2** No units, no hex, no CSS concepts at section level; width is not a per-section control.
- **FR-F3** Sidebar structure: 3–5 Quick Controls, then Content / **Arrangement** / Style / Data groups. Controls are per design, ≈ 15 visible per design, plus the three universal controls. A control another control disables is greyed **with the reason shown**, never hidden.
- **FR-F4** Per-control and whole-section reset; every control change paints optimistically within one frame and re-renders inside the 100 ms budget.
- **FR-F5** Mode-scoped controls carry a moon badge when a dark override exists.
- **FR-F6** Link Picker is Ghost-aware: internal resources, Portal actions compiled to real `data-portal` values, external URL, email, and Ghost search via `data-ghost-search`. `newTab` and `rel` are part of the stored mark record.
- **FR-F7** Controls are schema-driven from the section registry — one schema powers sidebar, validation, defaults, dark-capability flags and the compiler. A control may declare what disables it, and the declaration carries the reason. One schema per design, one union schema per category.
- **FR-F8** A link to a page Ghost does not publish is authored, never assumed: a Text Field plus a Link Picker, rendering nothing until a destination is set.

**FR-G · Section Library**

- **FR-G1** The library ships every category and design inventoried in Appendix A, which **is** the count, generated from the design export. Appendix A is normative and a GA floor; the placeable/non-placeable split is declared there.
- **FR-G2** Every category ships at least 2 Free-tier designs — exactly the first two of every category — distributed across contexts, with the floor guaranteed for every context reachable from the seven synthesizable templates and `private.hbs`.
- **FR-G3** Section registry entry format, with `contentSchema` as the category's union and `controlSchema`/`quickControls[]` per design; `bindingContext` and `compileTarget` as the filter placement and shuffle obey; `ghostCompat` authored with the design; annotated HTML, not Handlebars, as the source; plain CSS consuming Style Pack properties only.
- **FR-G4** Every design responsive 390 → 1440+ with no horizontal overflow, its collapse behaviour designed against the 15 structural archetypes; WCAG 2.1 AA; token-driven only; functional with JS disabled, with a written no-JS degradation statement per module and two named waivers.
- **FR-G5** Uniqueness bar: designs within a category differ in layout/structure, asserted mechanically over a **structural descriptor tuple** whose first five slots are closed vocabularies checked by literal match.
- **FR-G6** Section CI: every design renders in the matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in both CSS and JS.
- **FR-G7** The behaviour-module rulebook: a fixed registry, all vanilla with zero third-party runtime dependencies, a design may declare several modules, each declares its no-JS degradation and whether it is `edit-safe`, `core` is platform, and ten behaviours need no module at all.
- **FR-G8** Browser baseline: Baseline "Widely Available" pinned by date (`widelyAvailableOnDate: 2026-08-18`), three tiers with a version-controlled Tier-2 allowlist, a closed list of three vendor prefixes, enforced by three build-time tools.

**FR-H · Data Binding & Content**

- **FR-H1** The Ghost data surface available for binding is catalogued in Appendix B — deliberately two different lists, because `{{#get}}` accepts a narrower set than the Content API exposes.
- **FR-H2** The Data control group; exactly **one section per paginated template is the designated main feed**, bound to the native paginated context and sized by `posts_per_page` or the route's own `limit:`, and it alone exposes the Pagination style control. All other feeds are `{{#get}}`-driven with a fixed count. The main feed owns the template's empty state, and designation has a defined lifecycle.
- **FR-H3** The Orbit Weekly sample dataset — a feed sized so a middle page and a partial page both exist — plus three fixtures: the style-guide post generated from Ghost's own renderers, the comments fixture at 14 comments across 9 threads, and the style-guide page.
- **FR-H4** With a linked site, real content is fetched **client-side** with SWR caching, batching and de-duplication, and silent fallback that **names the cause**. The canvas never reads post or page body HTML. Zero items has three distinct behaviours.
- **FR-H5** Canvas rendering and helper shim: sections render from their annotated-HTML source, Handlebars is never parsed in the browser, and the shim implements the Appendix B subset. Two of Ghost's own injected surfaces are shimmed — Portal's floating button and the announcement strip — and neither is a section.
- **FR-H6** Tier-bound surfaces show live tier data; **tier presence never implies tier purchasability**; the paywall is a template surface with its own editor, not a placeable section; every member ask is gated on the site's own capability flag; a member's own details are never server-rendered.
- **FR-H7** Context-aware binding as **prevention, not warning**: only bindings valid in the current template's render context are ever offered, per the normative matrix, keyed on template, scope and connected Ghost version.
- **FR-H8** Empty-value handling: every bound prop compiles inside a guard derived from the bound field, never from a helper argument; text falls back to its static value, media hides its element. The avatar is the one designed substitute, and it has two forms.

**FR-I · Templates & Routing**

- **FR-I1** `home.hbs` is emitted; the standard template set always compiles, with untouched templates synthesised before assembly; `page.hbs` gates on `@page.show_title_and_feature_image`; there is no members template family — a designed membership page compiles to `custom-{name}.hbs` and emits no route; the emptying rule is general and differs by template class.
- **FR-I2** Routes Manager: a visual builder for `routes.yaml` — collections with per-collection page size, a rich filter builder with normative NQL mappings, channels, custom routes, taxonomy prefixes, a live YAML pane and validation. The builder never emits redundant or nested parentheses; published date is offered with relative syntax.
- **FR-I3** Custom templates compiled as `custom-{name}.hbs`, with the naming and collision scheme enforced at the naming step and renaming a deployed template not offered at all.
- **FR-I4** `routes.yaml` uploads automatically via `POST /settings/routes/yaml` with the staff token, verified by reading the file back byte-for-byte; the guided Labs card remains as the designed fallback.
- **FR-I5** Projects that never open the Routes Manager compile with Ghost's default routing. Two routes are emitted on demand — all-tags and all-authors, only when a design links to them — and `/search/` is never emitted by anyone.
- **FR-I6** Template-binding flow: a deploy that emitted `custom-*.hbs` ends on a checklist naming each file and the exact dropdown label Ghost will derive, with the click-path and a deep link. It is a checklist, not a notification, and it says plainly that Inflozo cannot verify the binding.

**FR-Q · Theme Settings**

- **FR-Q1** A dedicated Theme Settings surface configuring global values compiled into `package.json`, starting with `posts_per_page`. Every surface mentioning posts-per-page links here, never into Ghost Admin.
- **FR-Q2** Custom settings builder over Ghost's exact five types, with the 20-setting cap metered, 3 slots reserved for the dark built-ins, generated snake_case keys, and keys immutable once deployed or exported.
- **FR-Q3** A custom setting takes effect by binding; the compiled theme reads `{{@custom.*}}` instead of the baked value. Shuffling away parks the binding rather than deleting it; deleting or hiding warns; compile rejects dangling bindings. Ghost's comment accent is linked to, never written.
- **FR-Q4** The canvas previews custom settings at their defaults, including the three dark built-ins' **resolved** fallback chains.
- **FR-Q5** Dark-mode built-ins always declared **and always referenced** — `color_scheme`, dark accent, dark logo — with real fallback logic on every project, which is what keeps `GS100` unreachable. Colour promotion is accent-only in v1.
- **FR-Q6** Translations module: every compiler-generated visitor-facing chrome string lives in one catalog with dotted keys and English defaults; `.hbs` consumes them exclusively via `{{t}}`, module strings resolve at compile into `data-i18n-*`; `credit.*` is a locked namespace; the theme always ships `en.json` plus the project-language file, emitted from one catalog in one pass. RTL is not supported in v1.
- **FR-Q7** Ghost card design module: every Koenig card designed from a dedicated surface with per-card reset and a live preview against the style-guide fixture. Emission is `card_assets: { exclude: [...] }` — never `false` — which drops Ghost's CSS **and** JS, so four cards ship a vendored equivalent.
- **FR-Q8** Translation override validation on entry and again at compile: it **refuses, it does not repair**, because one unbalanced brace returns a whole-page 500 across the entire site.
- **FR-Q9** Treatment selection fallback: non-placeable treatments are selected from Theme Settings whenever their would-be host section is absent, and emission never depends on a host existing.
- **FR-Q10** Share destinations are one ordered, site-wide list stored on the project doc, emitted as real `<a href>` URLs; an empty list renders no share affordance at all.

**FR-J · Theme Compiler & Deploy**

- **FR-J1** Compiler input and mechanism: sections authored as annotated HTML, walked, substituted, serialised with `outerHTML`, markers and opaque tokens resolved in a final pass. Handlebars is never parsed, evaluated or printed. User content is emitted **inert**. Output quality is a requirement, with a normative formatting contract.
- **FR-J2** `package.json` emission, including the normative `image_sizes` map, `engines.ghost: ">=5.0.0"`, never `engines.ghost-api`, `card_assets` per FR-Q7, and `posts_per_page` coerced to an integer.
- **FR-J3** Assets and fonts: referenced assets only, content-hashed, emitted as a fixed rendition set; fonts self-hosted and statically subset; section CSS and JS emitted **per design**, with a measured dead-CSS strip; a theme-size budget enforced and surfaced pre-deploy.
- **FR-J4** JS bundling in two files with two origins: `main.js` from the module registry, emitted only if used; `cards.js` as Ghost's own vendored MIT card behaviour, declared as such.
- **FR-J5** Generated markup follows Ghost theme requirements, with `{{post_class}}` on the wrapping `<article>`, a theme-authored `srcset`, `data-portal` attributes, the paywall partial and `{{t}}` for every chrome string.
- **FR-J6** gscan gate at a pinned version, errors blocking, target 0 errors / 0 warnings, one failure mode replaced with Inflozo's own explanation, and a mapping scoped to the reachable shortlist.
- **FR-J7** Artifacts and retention: last 10 per project on Pro, last 3 on Free, with **pinning as part of the retention rule** — the limit stated, a pruned artifact absent rather than greyed, and at most N−1 pinned, enforced in the database.
- **FR-J8** Deploy: server-side upload with optional Activate as two distinct buttons, the five-stage progress UI, Cancel only before uploading, and the **partial success** state — uploaded but not activated — recorded as one, with six named consequences.
- **FR-J9** Rollback and deploy history per project × site, with the pin control, the pre-Inflozo snapshot row above the versions, and the `uploaded`-not-`activated` row actioned as re-activate. Rollback needs no edit lock and is exempt from Pro exit gating.
- **FR-J10** Theme naming `inflozo-{project-slug}`, auto-incremented semver, the name **frozen per site at first deploy**, with collision handling and the first-deploy confirmation naming the exact theme.
- **FR-J11** Deploys rate-limited 10/hour per site and idempotent, with the count taken **per account over compiles** so the export path cannot evade it, and a per-site advisory lock around deploy-and-activate.
- **FR-J12** Theme ZIP export on all plans, including for a read-only over-cap project; export gating mirrors deploy gating exactly; every export is recorded.
- **FR-J13** Pre-Inflozo snapshot at first upload, read with the Staff Access Token, with a pre-deploy consent gate, a designed degraded path where the token is absent, and restore scope signature-gated on the `package.json` marker rather than the theme name.
- **FR-J14** Library updates and redeploy: a machine-readable changelog, a mandatory confirm step whenever the library has advanced, a backward-compatibility contract in which designs are superseded and never deleted, and a monthly post-launch cadence.
- **FR-J15** Credits and white-label: the credit in README and footer by default, Pro can disable per project, and the compiler appends a minimal credit line where a Free design has no visible footer.
- **FR-J16** Pre-deploy drift detection comparing a **content manifest**, never zip bytes, against what Inflozo last deployed, targeting the frozen theme name; it stops the deploy on any difference, names files by the user's own layer names, and **fails open**. Identity is content, not path, so a layer rename produces no drift signal.
- **FR-J17** Emitted-theme quality gate in addition to gscan, asserting what gscan does not measure, and stopping at the edge of `{{content}}`.

**FR-K · Asset Library**

- **FR-K1** Global per-account library with grid view, search, type filter and sort. There is **no Video asset type** — A15 is embeds only, and nothing fetches from the provider.
- **FR-K2** Upload with client-side optimisation through native `canvas.toBlob('image/webp')`, a 2400 px long-edge cap, a 10 MB input cap and SVG sanitisation; optimisation is destructive by design and the UI states the trade-off.
- **FR-K3** Quota metering with an always-visible meter (Free 100 MB, Pro 5 GB) and upload-time enforcement.
- **FR-K4** Per-asset usage tracking in a server-side index recomputed on project-doc upsert, with delete re-verified against the client's live document.
- **FR-K5** Editor delivery via Supabase Storage CDN; at deploy, referenced assets bundled into the zip.
- **FR-K6** Asset detail actions: Replace (propagating across all projects), Copy URL, Download.

**FR-L · Plans & Billing**

- **FR-L1** Plans per Appendix F; Dodo hosted checkout as merchant of record, yearly pre-selected with monthly one click away, and explicit consent to immediate delivery plus a waiver of the withdrawal right recorded with the order.
- **FR-L2** Webhooks driving an entitlements state machine mapped to **Dodo's actual event vocabulary**, with no `subscription.cancelled`, the dispute-opened transition and its manual restore edge, a 7-day grace that is Inflozo's own window, no refunds and no mid-cycle cancellation.
- **FR-L3** Free-tier gating: open canvas, gated exits, with an itemised sheet offering **a remediation that actually exists** per item — three for placeable sections and a fourth, revert-to-Free, for the Pro non-placeable treatments. Downgrade is block-until-resolved; Inflozo never auto-deletes.
- **FR-L4** Billing page: plan, renewal date, invoices, upgrade/cancel/resume, plan-limit meters.
- **FR-L5** Contextual upgrade prompts at exactly four moments, and never while playing with Pro sections on canvas.

**FR-M · Suggestions Board**

- **FR-M1** Custom-built on Supabase with three categories and four statuses.
- **FR-M2** Signed-in users submit and upvote once per suggestion, with rate limits, length caps and harder throttling for new accounts.
- **FR-M3** Public read-only board on the marketing site and the identical board in-app; text appears immediately, an attached image only after admin approval.
- **FR-M4** Admin claim: status, merge, hide, image approval. **The first admin is seeded from the owner's own account at setup**, and the claim survives the Test → Live cutover.

**FR-N · Marketing Website**

- **FR-N1** Nine pages plus auth entry points and legal, including a Refund & Cancellation policy; statically generated on the same Next.js app; the Contact page relays via Resend.
- **FR-N2** Sections Gallery: an SSG page per category, each design a live render in a same-origin iframe with a per-preview light/dark toggle, badge, name and deep link. The SEO engine.
- **FR-N3** Home: product narrative with an animated editor mock as the hero demo.
- **FR-N4** Docs in MDX, enumerated page by page, each carrying a "Suggest an edit" affordance.
- **FR-N5** The blog/changelog runs on Ghost with an Inflozo-built theme — dogfooding, linked from the footer as proof.

**FR-O · Starter Templates**

- **FR-O1** 10 starters ship, each a complete pre-wired project. **Starters ship no membership template at all**, so no `routes.yaml` is emitted and the confetti moment stays uninterrupted.
- **FR-O2** Starter chooser with full-page scrollable previews and a light/dark toggle before creation.
- **FR-O3** Starters are seeds — after creation they are ordinary projects with no linkage back.
- **FR-O4** At least Quiet and Ledger are composed exclusively of [Free] designs end to end.

**FR-P · Transactional Email**

- **FR-P1** Exactly five user-facing transactional emails via Resend — magic link, email-change verification, "Reconnect needed", payment failed/grace, deploy failure — plus a sixth, the annual renewal reminder. **Its condition is resolved: the owner ruled on 2026-09-04 that Dodo does not send it, so Inflozo must** — see Story 12.8 and the propagation note under *Questions for the owner*.
- **FR-P2** No marketing, digest or nudge emails in v1, with two non-discretionary carve-outs — the Ghost-compatibility notice, and the annual renewal reminder, **which is now active rather than conditional** (owner, 2026-09-04).
- **FR-P3** Owner-relay emails: the marketing contact form and the docs "Suggest an edit" affordance, with honeypot and rate limiting.

### NonFunctional Requirements

- **NFR-1 Performance (app)** — editor TTI < 3 s (p75, warm); all canvas interactions hold 60 fps, criterion p95 frame time ≤ 16.7 ms with no long task > 50 ms across a 3-second trace; control-change render < 100 ms; local-first persistence adding no perceptible latency; dashboard LCP < 2 s. **Reference environment:** a mid-tier laptop at 4× CPU throttle; **stress fixture:** a 40-section template. The gate is **manual-only**, run before each release, never on CI.
- **NFR-2 Performance (output)** — Lighthouse is **not** measured on generated themes. Instead the compiler asserts, in CI and without a Ghost host: correct `srcset`/`sizes`; woff2-only preloaded fonts, subset for latin projects and full-face otherwise; no render-blocking JS; a CSS budget of ≤ 50 KB gzipped over the subset a template actually reaches; no layout shift from unguarded elements, with every emitted guard proven to resolve to a real bound field. **JS budget < 40 KB gzipped for a maximal design**, enforced by `size-limit` as a developer-facing warning, not a build failure. Zero console errors on every template of every compiled fixture theme.
- **NFR-3 Security** — RLS on every table keyed to `auth.uid()`; credentials in Supabase Vault, server-only; short-lived Admin JWTs per call; deploy and upload rate limits; Dodo webhook signature verification; SVG sanitisation. **No Admin API key ever reaches a Ghost theme.** The canvas renders no untrusted HTML: every Content-API value enters the DOM as a text node, `codeinjection_*` is never read into the canvas, every URL-valued field is scheme-validated, excerpts render text-only. CSP with no `'unsafe-eval'`, `connect-src` composed per session, `frame-ancestors 'self'`.
- **NFR-4 Reliability** — autosave offline queue with retry/backoff; idempotent deploys with immutable artifacts; background health checks; Supabase spend-cap alarms; PITR enabled with a restore drill exercised before launch.
- **NFR-5 Accessibility** — axe-core, WCAG 2.1 AA, **zero violations**, pass/fail. Scope: every shipped design **and the Inflozo app itself**, including the fixture renders and the six synthesised templates. An image that is the sole content of a link carries a non-empty `alt`. The app is keyboard-complete, including reorder and focus management across the canvas iframe boundary. The scan stops at the edge of `{{content}}`.
- **NFR-6 Quality automation** — **(a)** render matrix: every design × 3 packs × light/dark × 3 viewports, 1% pixel threshold, pinned renderer, owner-approved mass rebaseline. **(b)** compile CI: nightly synthetic themes covering 100% of designs → gscan 0/0. **(c)** fidelity in three layers: (c1) committed compiled-output snapshots diffed per commit, (c2) shim contract tests against recorded real-Ghost output, (c3) nightly perceptual diff of canvas against a real Ghost target over a risk-weighted rotation covering every design within 30 days. **(d)** E2E against the running stack, including **one keyboard-only journey** run with no pointer events. Only (c3) and (d) touch a real Ghost.
- **NFR-7 Compatibility** — visitor floor is FR-G8's pinned Baseline; generated themes support Ghost 5.x and 6.x, with compatibility coming from the helper surface rather than a `package.json` declaration; T3 is permanent; Ghost 4.x rejected at connect.
- **NFR-8 Privacy/compliance** — GDPR export discharged by Supabase's own tooling within 30 days, no in-app export surface in v1; delete is FR-A5; **analytics on the marketing site only** — the authenticated app ships no analytics and no telemetry, which is what makes G1/G2 manual or moderated measurements.
- **NFR-9 Observability** — Sentry app and server, structured deploy logs with per-stage timing and gscan output, Supabase usage alerts at 60/80/95%.

### Additional Requirements

From `ARCHITECTURE-SPINE.md`. **No starter template is specified** — the repo is greenfield and its
structure is the spine's Structural Seed, which is E1 Story 1.1's subject.

**The paradigm, which is a constraint on every epic:** *functional core / imperative shell, with the core
shared verbatim between browser and server.* The core is pure and deterministic — annotated HTML plus a
project doc in, canvas DOM and `.hbs` text out — performs no I/O, holds no clock, and imports nothing from
Next.js, Supabase or Node. Arrows point one way; **a design that needs the shell has been designed wrong.**

- Packages and their dependency rule: `packages/library` (data, depends on nothing) → `packages/section-runtime`, `packages/ghost-shim`, `packages/theme-compiler` (pure) → `apps/web` (shell) → platform. Tailwind styles `apps/web` and **only** `apps/web`; the design stylesheets are flat CSS in `packages/library`, excluded from Tailwind's content globs.
- **AD-1** the core is the same code on both sides, proven by `packages/section-runtime/src/agreement.test.ts` comparing node by node, with the two differences that *must* exist asserted positively. *(Story 4.2 moved the proof there from `tools/stress/`, where CI never ran it.)*
- **AD-2** the section library is data, never code · **AD-3** a control is one attribute on the section root and a design switch replaces the set · **AD-4** user text is text-plus-marks and becomes markup at exactly one place · **AD-5** brace-safe emission.
- **AD-6** every RLS-protected table carries `user_id` and every policy has one shape · **AD-7** server-only data is a table with RLS on and no policy · **AD-8** the client never writes a fact the server asserts · **AD-9** immutable columns are frozen by trigger · **AD-31** AD-8 and AD-9 bind columns and RLS is not the mechanism.
- **AD-10** two Ghost APIs, two paths, and they never swap; the write allowlist stays at four.
- **AD-11** compile sizing is measured · **AD-12** image renditions are made in the browser at upload · **AD-13** nothing large crosses a function boundary · **AD-14** compile is a pure function of what it was handed.
- **AD-15** the journal is the undo stack and clears only on a superseding hydrate · **AD-16** `unsynced_edits` is the only count that exists · **AD-27** the project doc has one schema, one owner, one version.
- **AD-17** every theme declares **and references** all three dark built-ins · **AD-18** the theme stylesheet declares Ghost's two font variables — a gscan rule the PRD never names.
- **AD-19** deploy-and-activate holds a Postgres advisory lock keyed on the site · **AD-20** every long job is backed by its row from the first stage · **AD-24** one error envelope, one gscan mapping · **AD-34** the quality gate is a compile stage and is measured as one.
- **AD-21** editing chrome lives inside the iframe as pseudo-elements · **AD-22** absence is the signal for an untouched template · **AD-30** a dark override resolves to a token and exactly one file selects on mode.
- **AD-23** an external-platform fact enters only as a recorded fixture · **AD-25** notifications are written by the epic that emits them · **AD-33** every scheduled job has an owning epic and one home.
- **AD-26** two stacks after launch, one migration path, Test first · **AD-28** one entitlement resolver, one exit gate · **AD-29** durability is stated per store, and Storage is not Postgres · **AD-32** storage is governed separately, and a cascade deletes rows, not bytes.
- **AD-35** a design file has one owning epic, and a pre-gate pilot is provisional.
- **AD-36** an untrusted value never reaches an interpreting sink un-validated — four executed instances (URL schemes, helper arguments, attribute names, bound CSS values), each shipping a runnable assertion that the vector is inert **and** the legitimate case still works. Six further instances are named by the design pass and owed the same treatment.
- **AD-37** the build decides the page; the render never re-decides it. **No render-time design substitution** — fourteen categories specified otherwise and all are refused — and **adjacency is a compile-time fact** answered by the compiler.
- **AD-38** a member's own data is never server-rendered by an Inflozo theme, because `cacheMembersContent` can serve a member-identifying page to a different member on the same tier.
- **Conventions that bind stories:** design identity `{categoryId}/{n}`, stable forever · kebab-case on disk, with the layer-name → partial slug collision rule stated because determinism is not uniqueness · snake_case plural tables · `{ code, message, detail?, action? }` error shape · one `zod` schema per boundary, with two named boundaries `zod` cannot serve (ICU parsing for translation overrides, DOMPurify with a **named configuration** for SVG, server-side for `suggestion-images`) · mutation only through a server route or action · local-first editor state with IndexedDB as the session source of truth · secrets never in `NEXT_PUBLIC_*` · CSP composed per session in `proxy.ts`, with the no-`unsafe-eval` half **not yet verified and a requirement on E5** · feature flags as rows in `feature_flags`, exactly two in v1.
- **Pinned stack** (read from the live registry 2026-08-19): Node 24.x · TypeScript 7.0.2 · Next 16.3.1 with `proxy.ts` · React 19.2.8 pinned explicitly as a peer · pnpm 11.22.0 workspaces, no Turborepo until a build is measurably slow · Tailwind 4.x in `apps/web` only · `@supabase/supabase-js` 2.112.3 · Supabase Postgres 17 with Auth, Storage, Vault, Realtime · `jsdom` 30.0.1 server-side only · **`gscan` 6.4.2 pinned** · `handlebars` 4.7.9 **test-only, never shipped** · `zod` 4.4.3 · `@formatjs/icu-messageformat-parser` · `DOMPurify` · `stylelint-plugin-use-baseline` 1.4.6 (1.4.5 until Story 4.8, which found it refusing Widely rows) · `browserslist-config-baseline` 0.5.0 · `eslint-plugin-compat` 7.0.2 · `size-limit` + `@size-limit/file` 13.0.3, **brotli**, which is what NFR-2's 40 KB means · `web-features` 3.35.0 · `resend` 6.20.0 · `dodopayments` 2.47.0 behind a swappable billing adapter · Playwright pinned in one container image with fonts · Vercel Pro, `maxDuration` 300 s / `memory` 2048 MB.
- **Two facts for E2, read from the registry rather than the PRD:** the WebAuthn surface landed in `@supabase/auth-js` **2.75.0**, so the PRD's ≥ 2.105.0 floor is a safe over-pin rather than a capability boundary.
- **The database proof already exists:** `SCHEMA.sql`, `PRELUDE.sql` and `RLS-TEST.sql`, the last a **gate** that aborts on failure. E1's schema story builds against them rather than beside them.

### UX Design Requirements

From the bmad-ux spine pair — `DESIGN.md` (visual identity, tokens) and `EXPERIENCE.md` (IA, behaviour,
states, interaction, accessibility, journeys). **`EXPERIENCE.md` Appendix A is the owner's Claude Design
work and is not story material**; it is cited here only where it names the frame a surface is built from.

- **UX-DR1 · Every surface names its frame.** `EXPERIENCE.md` § Information Architecture is a complete surface → frame table, and every story with a surface below carries its frame and a *matches the frame* criterion (R-74). The `D1`–`D8` canvases — first-deploy gates, deploy history completed, drift report, dashboard sheets, canvas markers and template switcher, theme settings, and the editor below 1440 — are the frames for the surfaces that had none before the Appendix A export landed on 2026-09-04. There is no `D7`.
- **UX-DR2 · Tokens and components come from the export, not from re-derivation.** `Calibration Set.dc.html` is the token and type scale, `Editor Sidebar Kit.dc.html` is the control vocabulary, `R Responsive System.dc.html` is the collapse ladder. A surface with no frame is extrapolated from the nearest one that has — same components, same tokens.
- **UX-DR3 · Greyed vs absent is a designed distinction and a user must be able to tell them apart.** Could-never → **absent**, and the panel says why; could-but-not-now → **greyed**, always with the reason as one sentence in the helper-caption slot, **never a tooltip** (`P0-0 Greyed Control Pattern.dc.html`, rulings R-33, R-68). A greyed control whose value is not its own marks no value and names the value in force (R-69). An empty list is neither greyed nor absent — it is drawn as the empty list it is.
- **UX-DR4 · Item List semantics.** Add · Remove · drag, on an array the user typed, never on a Ghost-bound repeat. **Remove never greys** — at the floor it stays active and explains itself (R-12).
- **UX-DR5 · The design picker always shows position** ("Design 7 of 18"), `]` past the last returns to the first, and switching carries, parks and defaults.
- **UX-DR6 · Every empty state is designed, not omitted.** § State Patterns answers "what does this show when it has nothing to show" for Dashboard, Editor, Control Sidebar, Section Picker, Layers, Routes Manager, Assets, Deploy History, Notifications, Sites, Paywall Editor, Suggestions, the main feed, a secondary `{{#get}}` feed and a user-authored section — each with its loading, error and refusal columns.
- **UX-DR7 · Partial and degraded states are first-class, not errors.** Partially credentialed · Preview-only (sky, not danger) · uploaded-not-activated · read-only project (export still works) · read-only session · no local storage · offline · `pro_past_due`.
- **UX-DR8 · Colour classifies; it never carries the only signal, and neither does shape.** Every state has a text equivalent — four persistence *labels* and one dot, the word **Pro** beside the ✦, "Auto-generated" beside the hollow dot, "has image" beside the marker, "Dark override" captioning the moon badge.
- **UX-DR9 · The focus model across the canvas iframe boundary** — §7.3's named deliverable, discharged in `EXPERIENCE.md`: the canvas is one tab stop between Layers and the Controls sidebar, is reachable and escapable by keyboard, and selection survives the crossing.
- **UX-DR10 · Keyboard completeness beyond FR-D11's global map.** Layers and every reorderable list: ↑↓ move focus, **`⌥↑`/`⌥↓` move the section itself** with the canvas following and the move announced, `Enter` selects, `Space` toggles visibility. Item lists take the same pattern. Section Picker: arrows across the grid, `Enter` places, `Esc` closes and **returns focus to the invoking position**. Design picker: ←→ mirroring `[` `]`. Assets: the drop zone is **also a file input with a visible "Choose files" button** — a drag-only upload has no keyboard path. Every menu, popover and sheet traps focus and returns it. **A drag with no keyboard equivalent is a defect.**
- **UX-DR11 · WCAG 2.1.4 Character Key Shortcuts.** Every single-character shortcut is live **only while the editor shell holds focus**, never while a text field or `contenteditable` has it. axe-core does not detect this.
- **UX-DR12 · Live regions.** Canvas status (polite: the design and its position after `[`/`]` or a Shuffle, the pack after a switch, the section count after a Remix) · persistence indicator (polite) · deploy progress (polite) · Backup Gate's master confirm becoming available (polite) · **edit-lock request and takeover notice (assertive)**.
- **UX-DR13 · One timed interaction exists** — the edit-lock nudge, a **no-response** timer that stops the moment the holder interacts with the popover at all, including focusing it.
- **UX-DR14 · A confirm whose primary action is irreversible opens with focus on the cancelling action** (D8f draws the rule; it is a rule, not a list).
- **UX-DR15 · Reduced motion honoured throughout**, including the confetti moment, the 300 ms pack crossfade, the 180 ms design slide-fade and the drag tilt — each becoming an instant state change, never a removed affordance.
- **UX-DR16 · The app floor is 834 on a coarse pointer** (R-76 as amended by R-87). At 834+ the editor's four-part shape holds and Layers collapses first (D8a); at 720 on a fine pointer — a 1440 display at 200% browser zoom — it reflows rather than redirecting (D8b); below 834 on a coarse pointer, **Small Screen Notice** (D4f). Sign In, Dashboard, Billing, Suggestions and every marketing page stay fully usable at 390.
- **UX-DR17 · The canvas is a viewport, not a column.** Device preview resizes **both** axes to a real device size (390 × 844, not a 390-wide column of infinite height). There is no user zoom: the only scale is fit-to-screen, reported in a mono chip — "viewport 390 × 844 · shown at 55%". **B11's Zoom control is re-specified: keep the chip, remove the control.**
- **UX-DR18 · Touch.** The tablet range is touch-first: 44 px minimum targets, hover affordances that also appear on tap-and-hold, and no interaction discoverable only by hover.
- **UX-DR19 · Component behaviours** — greyed control · absent control · item list · design picker · section on canvas · inline toolbar (a mark a field does not permit is **absent, not greyed**, with a fixed button order) · site-wide singleton with its page count and its affects-every-template confirm · Pro badge (**no upgrade sheet on click, ever**) · persistence indicator (one dot and the labels `B Missing Surfaces` B6 draws — five, never a spinner) · feedback banner · wizard step rail (4 steps normally, **6 on the first deploy to a site**) · typed confirm, only where the action is irreversible and account-wide.
- **UX-DR20 · Three re-specifications the frames drew and the spine corrected**, each of which a story must build as re-specified rather than as drawn: **B8** loses the "Keep Free designs only" tick-box (R-77) · **B22**'s redesign proposals are one card per whole-site combination, not per section (R-78) · **B11**'s zoom picker becomes a report-only chip (UX-DR17).
- **UX-DR21 · What verifies each floor item**, because axe-core reliably detects only one of them: axe-core over the app surfaces for reason text, names, roles and labels; **NFR-6(d) E2E's keyboard-only journey** for cross-boundary focus order, the `Esc` ladder, keyboard reorder and single-key inertness inside a text field; a manual screen-reader pass per surface once per release for live regions; NFR-6(a) with the query forced for reduced motion; NFR-6(a) as a viewport case for 200% zoom.
- **UX-DR22 · Two things `EXPERIENCE.md` deliberately left open for the architect at step 6**, and they are named inside the stories that must settle them rather than invented here: the **URL scheme** for a project, a template and a template surface (and what browser Back does across them), and **which parts of the editor shell sit inside the iframe canvas boundary** and which outside.

### FR Coverage Map

**Every FR is owned by exactly one epic**, apart from the three splits §8 documents explicitly. Ownership
below is §8's, not re-derived. Coverage was checked mechanically: 132 FRs extracted, 132 assigned.

| Epic | FRs owned |
|---|---|
| **E0** De-risking Spikes | *none* — two blocking spikes (the FR-D4 mark path, and §7.6's verify-at-build list) |
| **E1** Foundations & Design System | FR-A1 · FR-B3 · FR-B4 · FR-B5 · FR-P1 emails (1)–(2) |
| **E2** Accounts & Passkeys | FR-A2 · FR-A3 · FR-A4 · FR-A5 · FR-A6 |
| **E3** Sites & Connections | FR-C1 · FR-C2 · FR-C3 · FR-C4 · **FR-C5 (the health check half — the compatibility watch is E9's, DW-87)** · FR-C6 · FR-C8 · FR-P1 email (3) |
| **E4** Section Runtime Platform | FR-F1–F8 · FR-G3 · FR-G7 · FR-G8 · FR-H1 · FR-H3 · FR-H5 · FR-H7 · FR-H8 · **FR-Q6 (the string-catalog format half)** |
| **E5** Editor Shell | FR-D1–D22 · FR-H2 · FR-H4 · FR-H6 |
| **E6** Style Packs | FR-E1 · FR-E2 · FR-E3 · FR-E4 · FR-E5 |
| **E7** Compiler, Deploy & Routes | FR-I1–I6 · FR-J1–J17 · FR-K5 · FR-Q1–Q5 · FR-Q7–Q10 · **FR-Q6 (the Translations surface and `locales/` emission half)** · FR-P1 email (5) |
| **E8** Asset Library | FR-K1 · FR-K2 · FR-K3 · FR-K4 · FR-K6 |
| **E9** The Shell Block | **FR-G1 · FR-G4 · FR-G5 · FR-G6, for Group 1 only** (Headers & Navigation, Announcement Bars, Footers) · **FR-C5 (the compatibility watch, moved from E3 on 2026-09-10 — DW-87)** |
| **E10** The Gated Library Pipeline | **FR-G1 · FR-G4 · FR-G5 · FR-G6, for every category outside Group 1** |
| **E11** Starters | FR-G2 · FR-O1 · FR-O2 · FR-O3 · FR-O4 |
| **E12** Billing & Entitlements | FR-L1–L5 · FR-P1 emails (4) and (6) · FR-P2 |
| **E13** Suggestions, Notifications & Dashboard Completion | FR-M1–M4 · FR-B1 · FR-B2 · FR-B6 · FR-B7 · FR-C7 |
| **E14** Marketing Site & Docs | FR-N1–N5 · FR-P3 |
| **E15** Hardening & Launch | *none* — owns the launch gates |

**The four documented splits, and nothing else is split.**

1. **FR-P1 splits per email**, because each email belongs to the epic that emits its event: (1) magic link and (2) email change → **E1**; (3) "Reconnect needed" → **E3**; (4) payment failed / grace and (6) the annual renewal reminder → **E12**; (5) deploy failure → **E7**.
2. **FR-Q6 splits format from surface**: the catalog's keys, English defaults and the `{{t}}` contract are **E4**'s, because E4 writes the library's first chrome strings and every design is constrained by them; the Translations *surface* and the `locales/` emission are **E7**'s.
3. **FR-C1 splits connect from first deploy.** The connect wizard's one credential pair is **E3**'s; **the first-deploy credential step is E7's** — §8 says so in E7's own paragraph — because the Staff Access Token request, its decline path and all three graceful degradations behind it are deploy-time surfaces and none of them exists at connect. *(Found by the step-6 stress test, finding F5: the first pass named three splits and this is a fourth.)*
4. **FR-G1, FR-G4, FR-G5 and FR-G6 are shared** between **E9** (Group 1) and **E10** (every other category), because each quantifies over the whole library and between them the two epics cover every category.

**Two things that are NOT splits and are recorded so they are not read as ones.** **FR-H5 stays E4's** — §8 calls the canvas shims "a work split, not a second owner", so E4 defines what the shims must render and E5's Story 5.21 builds them inside the canvas. And §8's E1 cut line puts FR-B1's
**static Style-Pack placeholder** inside E1 — "IN, because it no longer waits on anything". **FR-B1 remains
E13's**; E1 delivers that one element early under E13's ownership, and E13 closes the rest of the card.

---

## Epic List

**Sixteen epics, E0 through E15, in §8's order.** §4's build order is binding and comes first: the FR-D4
mark-emission spike, then the E0 platform-verification spike, then **the complete shell block** — every
design in Group 1, the export being the count, not a minimal shell — then **the gated categories in
inventory order beginning with Heroes**.

**The library epics run sequentially. There are no waves.** Each category's owner gate blocks the next
category from starting, and no two category stories are ever in flight at once. There are **as many owner
gates as there are categories, the shell block's three included** — the count is the category count and is
never maintained as a separate number.

### Epic 0: De-risking Spikes

Prove the two premises this document has twice been damaged by building on, before the work that rests on
them. **Owns no FRs; owns two blocking spikes.**
**FRs covered:** none.
**Status: closed by execution.** Both spikes ran and closed at step 2 — the mark path in
`packages/section-runtime/src/{ad36,agreement}.test.ts` (moved there by Story 4.2 so `pnpm check` runs them) and the verify-at-build list in
`MEASUREMENTS.md` and `VERIFY-AT-BUILD.md`. **This epic therefore carries no stories.**

### Epic 1: Foundations & Design System

A user can sign in on production and see, name, duplicate and delete their projects. The repo, the pure/shell
package split, CI/CD to production Vercel, the design tokens and components **taken from the export**, magic-link
auth and the Resend transport all exist — and, since the owner's ruling of 2026-09-06, the product wears the
**new identity** (the Nest icon mark, its lockups, favicon and app icon) everywhere a logo is drawn, the faded
background watermarks alone excepted.
**FRs covered:** FR-A1, FR-B3, FR-B4, FR-B5, FR-P1 emails (1)–(2).

### Epic 2: Accounts & Passkeys

A user owns their account: registers a passkey and signs in with it, changes their email safely, ends every
session everywhere, and can leave — with a 14-day window to change their mind and their snapshots offered
before the purge.
**FRs covered:** FR-A2, FR-A3, FR-A4, FR-A5, FR-A6.

### Epic 3: Sites & Connections

A user connects their own Ghost site with **one credential pair**, sees it validated, takes their brand from
it in one click, and manages several sites whose health is checked daily. The Staff Access Token is not asked
for here.
**FRs covered:** FR-C1, FR-C2, FR-C3, FR-C4, FR-C5 (the daily health check; its compatibility watch is E9's — DW-87), FR-C6, FR-C8, FR-P1 email (3).

### Epic 4: Section Runtime Platform

The machine every design in the library is authored against exists and is proven: one source, two emitters
that agree node by node, the controls engine, the Ghost helper shim, the fixtures, `core`, the Baseline
tooling and the string catalog's format.
**FRs covered:** FR-F1–F8, FR-G3, FR-G7, FR-G8, FR-H1, FR-H3, FR-H5, FR-H7, FR-H8, FR-Q6 (format half).

### Epic 5: Editor Shell

A user builds a page: places sections, edits text on the canvas, cycles the design ring, reorders layers,
switches templates and modes and devices, shuffles, remixes, and never loses a content prop or a control value
doing it.
**FRs covered:** FR-D1–D22, FR-H2, FR-H4, FR-H6.

### Epic 6: Style Packs

A user changes the whole look of their site in one click, edits any token per mode with contrast checked live,
and gets a hand-paired dark palette they never had to author.
**FRs covered:** FR-E1, FR-E2, FR-E3, FR-E4, FR-E5.

### Epic 7: Compiler, Deploy & Routes

A user ships: the project becomes a real, hand-editable Ghost theme that passes gscan 0/0, uploads to their own
site, activates, and can be rolled back — with their previous theme archived first, drift caught before it is
overwritten, routes uploaded automatically, and every theme setting and translation they configured emitted.
**FRs covered:** FR-I1–I6, FR-J1–J17, FR-K5, FR-Q1–Q5, FR-Q7–Q10, FR-Q6 (surface half), FR-P1 email (5).

### Epic 8: Asset Library

A user uploads their own images once and uses them everywhere, sees exactly how much room is left, and can
replace a file behind every project that uses it.
**FRs covered:** FR-K1, FR-K2, FR-K3, FR-K4, FR-K6.

### Epic 9: The Shell Block

Every site-wide chrome design ships — Headers & Navigation, Announcement Bars, Footers — plus every template
the compiler emits. **Not a minimal shell.** This epic is the prerequisite for every gate that follows: nothing
renders on a real Ghost site without templates, a header and a footer, and it establishes the components every
later category reuses.
**FRs covered:** FR-G1, FR-G4, FR-G5, FR-G6 — for Group 1 only.

### Epic 10: The Gated Library Pipeline

The rest of the library ships, **one category at a time in inventory order beginning with Heroes**, each behind
§4's blocking owner gate.
**FRs covered:** FR-G1, FR-G4, FR-G5, FR-G6 — for every category outside Group 1.

### Epic 11: Starters

A user starts from a finished site rather than an empty canvas: ten complete pre-wired projects, two of them
Free end to end.
**FRs covered:** FR-G2, FR-O1, FR-O2, FR-O3, FR-O4.

### Epic 12: Billing & Entitlements

A user upgrades, is billed correctly by a merchant of record, keeps every Pro capability through a 7-day grace,
and — if they downgrade — is asked to resolve what is over rather than having anything deleted.
**FRs covered:** FR-L1–L5, FR-P1 email (4) and email (6) — **no longer conditional; the owner ruled on
2026-09-04 that Dodo does not send it** — and FR-P2.

### Epic 13: Suggestions, Notifications & Dashboard Completion

A user asks for what they want and votes on what others asked for; learns what happened while they were away;
and gets the dashboard whole — every badge, every chip, every creation path.
**FRs covered:** FR-M1–M4, FR-B1, FR-B2, FR-B6, FR-B7, FR-C7.

### Epic 14: Marketing Site & Docs

A stranger finds Inflozo through a category page, sees every design rendered live, understands the price, reads
how to do the thing they are stuck on, and signs up.
**FRs covered:** FR-N1–N5, FR-P3.

### Epic 15: Hardening & Launch

Everything the Definition of Done requires that is not a feature: the E2E suite with its keyboard-only journey,
the final matrix and scan sign-off, the manual performance gate, the restore drill, the legal pages, the
Ghost(Pro) gate and the Test → Live cutover.
**FRs covered:** none — owns the launch gates.

### The five pilot sections, fixed here because E4, E5 and E6 all gate on them

**The number is the identity.** Names were re-derived with `python3 tools/export-roster.py` on 2026-09-04 and
that tool is the source if they move again.

| Pilot | Why it is in the set |
|---|---|
| **A1 #1** (Headers & Navigation) | Site-wide singleton: lives on `default.hbs`, compiles to `partials/header.hbs`, binds `@site.navigation` and `@site.logo`, changes every template at once |
| **A17 #1** (Post Grids) | Dynamic feed: `{{#foreach}}` over the native paginated context, extracts `post-card` invoked with **no params**, carries the main-feed designation and pagination |
| **A22 #1** (Newsletter / Subscribe) | Members-aware: `@member` gating, the show-to control, Portal `data-portal` actions, member-state preview |
| **A24 #1** (Post Headers) | Wrapper context: valid only inside `{{#post}}` on `post.hbs` — the axis of FR-H7 easiest to get backwards, and silent when it is |
| **A4 #2** (Heroes) | Static and control-dense: rich text with all four marks, a guarded media binding with `srcset`, and the heaviest control set in the library |

### Two forward dependencies that are §8's design and are recorded, not removed

- **The E4/E7 joint compile gate.** Held by both epics and evaluated when E7 lands — E4 cannot verify it alone
  because the compiler is E7's, and E7 cannot verify it against sections that do not exist. **It is E7's closing
  story.** The T4 clause inside it is deferred with T4 itself and is carried forward to §4's pre-launch
  Ghost(Pro) gate rather than blocking either epic.
- **The post-body trio.** A25's designs, the card design module and the style-guide fixture are one feature area
  specified in one pass, with three separate build homes — the fixture is **E4**, the card module and its
  `cards.css` emission are **E7**, A25's designs are a gated **E10** category. **A25's owner gate cannot open
  until the card module emits**, and both depend on the fixture existing in E4. Emission order is fixed:
  `cards.css` first, then the per-design stylesheets — A33 owns the card interiors, A25 owns the column they sit in.

### Per-FR coverage map

Read left to right; every FR appears exactly once except the four documented splits, which appear in both
owning epics and say which half.

| FR | Epic | FR | Epic | FR | Epic | FR | Epic |
|---|---|---|---|---|---|---|---|
| FR-A1 | E1 | FR-D9 | E5 | FR-G7 | E4 | FR-J11 | E7 |
| FR-A2 | E2 | FR-D10 | E5 | FR-G8 | E4 | FR-J12 | E7 |
| FR-A3 | E2 | FR-D11 | E5 | FR-H1 | E4 | FR-J13 | E7 |
| FR-A4 | E2 | FR-D12 | E5 | FR-H2 | E5 | FR-J14 | E7 |
| FR-A5 | E2 | FR-D13 | E5 | FR-H3 | E4 | FR-J15 | E7 |
| FR-A6 | E2 | FR-D14 | E5 | FR-H4 | E5 | FR-J16 | E7 |
| FR-B1 | E13 | FR-D15 | E5 | FR-H5 | E4 | FR-J17 | E7 |
| FR-B2 | E13 | FR-D16 | E5 | FR-H6 | E5 | FR-K1 | E8 |
| FR-B3 | E1 | FR-D17 | E5 | FR-H7 | E4 | FR-K2 | E8 |
| FR-B4 | E1 | FR-D18 | E5 | FR-H8 | E4 | FR-K3 | E8 |
| FR-B5 | E1 | FR-D19 | E5 | FR-I1 | E7 | FR-K4 | E8 |
| FR-B6 | E13 | FR-D20 | E5 | FR-I2 | E7 | FR-K5 | E7 |
| FR-B7 | E13 | FR-D21 | E5 | FR-I3 | E7 | FR-K6 | E8 |
| FR-C1 | E3 | FR-D22 | E5 | FR-I4 | E7 | FR-L1 | E12 |
| FR-C2 | E3 | FR-E1 | E6 | FR-I5 | E7 | FR-L2 | E12 |
| FR-C3 | E3 | FR-E2 | E6 | FR-I6 | E7 | FR-L3 | E12 |
| FR-C4 | E3 | FR-E3 | E6 | FR-J1 | E7 | FR-L4 | E12 |
| FR-C5 | E3 · E9 | FR-E4 | E6 | FR-J2 | E7 | FR-L5 | E12 |
| FR-C6 | E3 | FR-E5 | E6 | FR-J3 | E7 | FR-M1 | E13 |
| FR-C7 | E13 | FR-F1 | E4 | FR-J4 | E7 | FR-M2 | E13 |
| FR-C8 | E3 | FR-F2 | E4 | FR-J5 | E7 | FR-M3 | E13 |
| FR-D1 | E5 | FR-F3 | E4 | FR-J6 | E7 | FR-M4 | E13 |
| FR-D2 | E5 | FR-F4 | E4 | FR-J7 | E7 | FR-N1 | E14 |
| FR-D3 | E5 | FR-F5 | E4 | FR-J8 | E7 | FR-N2 | E14 |
| FR-D4 | E5 | FR-F6 | E4 | FR-J9 | E7 | FR-N3 | E14 |
| FR-D5 | E5 | FR-F7 | E4 | FR-J10 | E7 | FR-N4 | E14 |
| FR-D6 | E5 | FR-F8 | E4 | FR-N5 | E14 | FR-O1 | E11 |
| FR-D7 | E5 | FR-G1 | **E9** (Group 1) · **E10** (the rest) | FR-O2 | E11 | FR-O3 | E11 |
| FR-D8 | E5 | FR-G2 | E11 | FR-O4 | E11 | FR-P3 | E14 |
| FR-Q1 | E7 | FR-G3 | E4 | FR-Q5 | E7 | FR-Q8 | E7 |
| FR-Q2 | E7 | FR-G4 | **E9** (Group 1) · **E10** (the rest) | FR-Q9 | E7 | FR-Q10 | E7 |
| FR-Q3 | E7 | FR-G5 | **E9** (Group 1) · **E10** (the rest) | FR-Q7 | E7 | FR-P2 | E12 |
| FR-Q4 | E7 | FR-G6 | **E9** (Group 1) · **E10** (the rest) | FR-Q6 | **E4** (catalog format) · **E7** (Translations surface, `locales/`) | FR-P1 | **E1** (1,2) · **E3** (3) · **E12** (4,6) · **E7** (5) |

---

## Epic 0: De-risking Spikes

Prove the two premises before the work that rests on them. **Owns no FRs.**

**Closed by execution — this epic has no stories.** Both spikes ran and closed at step 2.

- **(a) The FR-D4 mark-emission spike.** The mark path is demonstrated end-to-end with a runnable test
  covering all four marks, paste normalisation and the escaping cases; the brace-safe emission rule that
  replaced the original escaping remedy is **AD-5**, and the assertions live in
  `packages/section-runtime/src/ad36.test.ts`. `packages/section-runtime/src/agreement.test.ts`
  additionally proves the two-emitter agreement AD-1 rests on. *(Both were in `tools/stress/` until
  Story 4.2 moved them into the package, which is what puts them in `pnpm check` and so in CI.)*
- **(b) The platform-verification spike.** Every §7.6 verify-at-build item executed against a real Ghost and
  recorded in `MEASUREMENTS.md` and `VERIFY-AT-BUILD.md`, against T1 `ghost6.inflozo.com` (6.58.0) and T3
  `ghost5.inflozo.com` (5.130.6).

*Exit (met):* the mark path demonstrated end-to-end; every §7.6 item marked confirmed, refuted or still-open,
with refutations raised as scope changes before their dependent epic began.

---

## Epic 1: Foundations & Design System

A user can sign in on production and see, name, duplicate and delete their projects. The repo, the pure/shell
package split, CI/CD to production Vercel, the design tokens and components taken from the export, magic-link
auth and the Resend transport all exist.

> **The schema story is whole-model by §8, and the skill's "tables only when needed" rule is overruled there.**
> §7.5 is a sketch, not a specification. Story 1.2 builds the **full** schema and its RLS from §5 — including
> `notifications`, which E3, E7 and E12 all write to long before E13 renders it. Without it every later epic
> carries an un-storied migration.

### Story 1.1: The repository, the package split and CI/CD to production

As the Inflozo build,
I want the monorepo, its four packages and a green deploy to production Vercel,
So that every later story lands in the structure the architecture mandates rather than beside it.

**Acceptance Criteria:**

**Given** a greenfield repository
**When** the workspace is created
**Then** it carries `packages/library`, `packages/section-runtime`, `packages/ghost-shim`,
`packages/theme-compiler` and `apps/web`, with the dependency arrows pointing one way only
**And** a lint rule fails the build if a core package imports from Next.js, Supabase, Node or `apps/web`
**And** Tailwind's content globs cover `apps/web` and exclude `packages/library`, so the design stylesheets are
never scanned and never purged
**And** every pinned version in the spine's Stack table is the version installed, `gscan` at 6.4.2 and
`handlebars` 4.7.9 as a dev dependency that is never shipped
**And** `pnpm build` and the test suite run green in CI and the app deploys to production Vercel on push to `main`
**And** that one deployment serves **both production domains** — `inflozo.com` (marketing) and
`app.inflozo.com` (the app) — which is the spine's two-domains-one-deployment shape and the PRD's
pre-launch mandate that every test runs on the real production domains, never a `vercel.app` preview URL
**And** the three domains — already attached to the production Vercel project by the owner on 2026-09-04,
where they currently return 404 because that project has no application yet — serve this deployment instead,
so the story is not done while any of them still 404s

**FRs:** none directly — this is the Structural Seed. · **Owner test:** yes — he opens `inflozo.com` and
`app.inflozo.com` and sees this deployment answer on each instead of the 404 they return today; there is no
screen to judge yet, only that the domains went live.

### Story 1.2: The whole data model and its row-level security

As the Inflozo build,
I want the complete schema and its RLS in one migration set,
So that no later epic carries an un-storied migration and no table ships without a policy.

**Acceptance Criteria:**

**Given** §5's requirements as the source, not §7.5's eight-row sketch
**When** the schema is applied
**Then** it carries every table §5 implies, explicitly including `notifications`, `edit_locks`, `entitlements`,
`deploy_jobs`, `asset_usages`, `site_snapshots`, `project_site_bindings`, the theme-settings definitions, the
translation overrides, the export record, the routes state on `sites`, and the per-deploy variant manifest
**And** every RLS-protected table carries `user_id` and every policy has AD-6's one shape
**And** server-only data is a table with RLS **on and no policy** (AD-7), never a table without RLS
**And** immutable columns are frozen by trigger (AD-9), not by convention
**And** `PRELUDE.sql` then `SCHEMA.sql` then `RLS-TEST.sql` run against a PostgreSQL 17 container and
**`RLS-TEST.sql` passes as a gate**, aborting on failure rather than printing one
**And** RLS is verified on **every** table the story creates, not a subset.

**FRs:** none directly — foundation for all. · **Owner test:** none (no screen). · **Verification:** real
Supabase project, per R-82.

### Story 1.3: Design tokens and the app component kit, taken from the export

As a designer of every later surface,
I want the tokens, type scale and control components lifted from the export rather than re-derived,
So that every screen Inflozo ships is the one Claude Design drew.

**Acceptance Criteria:**

**Given** `Calibration Set.dc.html`, `Editor Sidebar Kit.dc.html` and `R Responsive System.dc.html`
**When** the token layer and component kit are built
**Then** the tokens, type scale, spacing and colour roles are the Calibration Set's values, and `DESIGN.md`'s
recorded token names are the names used
**And** every sidebar control, panel, badge and state in the Editor Sidebar Kit has a component, including the
greyed-with-reason pattern from `P0-0 Greyed Control Pattern.dc.html` (UX-DR3)
**And** the three app widths are 1440 / 834 / 390 and the collapse ladder is `R Responsive System`'s (UX-DR16)
**And** no second interface vocabulary is introduced beside the export's
**And** a component gallery route renders every component in light and dark for review.

**FRs:** none directly. · **Frame:** `Calibration Set.dc.html` · `Editor Sidebar Kit.dc.html` ·
`R Responsive System.dc.html`. · **UX-DRs:** UX-DR2, UX-DR3, UX-DR16, UX-DR19. · **Owner test:** none (an
internal gallery, not a product screen).

### Story 1.4: Sign in with a magic link

As someone with a Ghost site,
I want to sign in with a link sent to my email and no password anywhere,
So that getting into Inflozo takes one click and I have no password to lose.

**Acceptance Criteria:**

**Given** the Sign In screen
**When** I enter my email and ask for a link
**Then** the screen echoes the address I typed, states the link is valid for 15 minutes, counts down to when I
may resend, and offers "Use a different email"
**And** the email arrives through Resend on the branded Supabase Auth template
**And** clicking the link signs me in and my session persists 30 days rolling
**And** **no password field exists anywhere in the product**
**And** the resend countdown blocks nothing — the link itself stays valid and "Use a different email" is always
available (UX-DR13)
**And** the screens match frames S1a, S1b and S1c, and S1c draws the page behind the OS sheet and nothing of the
sheet itself
**And** the screens are fully usable at 390 (UX-DR16).

**FRs:** FR-A1, FR-P1 emails (1)–(2). · **Frame:** `S1 Sign In.dc.html` S1a · S1b · S1c. · **Owner test:** yes.
· **Verification:** production domain, real Resend send, real Supabase Auth (R-82).

### Story 1.5: The app shell and the dashboard skeleton

As a signed-in user,
I want an app shell and a list of my projects I can create, rename, duplicate and delete,
So that I have somewhere to start and somewhere to come back to.

**Acceptance Criteria:**

**Given** I am signed in
**When** I land on the dashboard
**Then** I see the authenticated shell — top bar, account menu, navigation — and my projects as cards showing
**name and updated-at**, each with a **static placeholder derived from the project's Style Pack** so cards stay
distinguishable without claiming to be a preview
**And** I can create a blank project, rename one, duplicate one, and delete one behind a **type-the-name**
confirm
**And** creating a project past my plan cap is refused at creation time with a contextual upgrade prompt
(Free 1, Pro 25)
**And** a project targets at most one connected site at a time, and an unlinked project renders the bundled
sample dataset
**And** with no projects the empty state is S3b's — "Every great site starts somewhere…" — and a New project
action, not a blank page (UX-DR6)
**And** the dashboard is fully usable at 390 (UX-DR16).

**Out of this story, by §8's cut line, because the things they display do not exist yet:** linked-site badges
and deploy-status chips (E3, E7), the other three creation paths, the connected-sites strip, the asset quota
meter, the changelog popover and the notifications bell (all E13).

**FRs:** FR-B3, FR-B4, FR-B5 — plus FR-B1's static placeholder, delivered early under **E13's** ownership. ·
**Frame:** `S3 Dashboard.dc.html` S3a · S3b empty · S3c Free · S3d account menu. · **Owner test:** yes.

*Exit:* sign in on production; the skeleton exactly as cut above; **RLS verified on every table the schema
story creates**, not on a subset.

### Story 1.6: The new identity everywhere

As a user of Inflozo on any of its surfaces,
I want to see the product's real logo — the icon mark with the wordmark — wherever Inflozo names itself,
So that the app, the emails and the site read as one product and not as a placeholder.

**Acceptance Criteria:**

**Given** the new identity is in the design export (`design/claude-design-export/Logo/`, added by the owner on
2026-09-06: five SVG marks, the lockup rules in its README, and the launch animation)
**When** any surface of the product draws a logo
**Then** it draws the **new mark or lockup** taken from that export — the app shell's top bar and sidebar, the
☰ drawer, the Sign In card, the app's error page, the marketing pages, the magic-link email, and the
browser-tab favicon and app icon — with the light mark on light surfaces and the dark mark on dark ones
**And** the **huge faded background wordmarks stay exactly as they are** (the Sign In watermark and any surface
drawn like it) — the owner's ruling, 2026-09-06
**And** every place a logo is drawn is **found by grepping the app and the frames**, never listed by hand, so
none is missed
**And** the lockup follows the README's rules — mark height 1.85× the wordmark's cap height, clear space 0.28×
the mark's height, Bricolage Grotesque 800 at −0.035em, never below 600 weight, never letterspaced positive
**And** the launch animation is used **at most once**, only where the owner asks, and respects
`prefers-reduced-motion`; nothing else in the product animates because of this story
**And** the marks are the export's own SVGs, inlined or served as static assets — never redrawn by hand — and
every page still reports zero axe-core violations
**And** the frames the export draws with the old wordmark are **not edited** (R-74); this story departs from
them on the owner's ruling, recorded beside the code.

**FRs:** none new — the identity of every surface FR-A1 and FR-B3–B5 already deliver. · **Frame:**
`design/claude-design-export/Logo/export/Inflozo Logo/` (README.txt, `assets/*.svg`, `Inflozo Logo.html`) for
the marks; the surfaces keep their own frames (`S1`, `S3`, `M1`…). · **Owner test:** yes. · **Origin:** DW-31.

---

## Epic 2: Accounts & Passkeys

A user owns their account: registers a passkey and signs in with it, changes their email safely, ends every
session everywhere, and can leave — with a 14-day window to change their mind.

### Story 2.1: Register a passkey and sign in with it

As a returning user,
I want to register a passkey and use it instead of waiting for an email,
So that signing in is instant on the device I actually use.

**Acceptance Criteria:**

**Given** I am signed in via magic link
**When** I open Account → Security
**Then** I am offered passkey registration, and a post-onboarding nudge offers it once
**And** a registered passkey is auto-named from its authenticator AAGUID
**And** subsequent sign-ins offer **passkey as primary and magic link as fallback**
**And** the whole passkey module sits behind the `passkeys` row in `feature_flags`, read server-side per
request and defaulting to off, so it can be disabled **without a redeploy** if the experimental API changes
**And** the flag is a database row, never an environment variable, because an env-var change on Vercel applies
only to new deployments.

**FRs:** FR-A2. · **Frame:** `S12 Billing.dc.html` S12a (Security lives on this surface) · `S1 Sign In.dc.html`
S1c. · **Owner test:** yes. · **Verification:** real Supabase Auth on production, passkey round-trip (R-82).

### Story 2.2: See, rename and revoke my passkeys

As a user with several devices,
I want to see which passkeys are registered and remove one I no longer use,
So that a lost device does not keep access to my account.

**Acceptance Criteria:**

**Given** I have registered one or more passkeys
**When** I open Account → Security
**Then** each is listed with its auto-derived name, and I can rename it and revoke it
**And** revoking takes effect immediately for that credential
**And** the list matches frame S12a.

**FRs:** FR-A3. · **Frame:** `S12 Billing.dc.html` S12a. · **Owner test:** yes.

### Story 2.3: Change my email address safely

As a user whose address has changed,
I want to move my account to a new email and be told immediately if it is already taken,
So that I never wait on a verification email that was never going to work.

**Acceptance Criteria:**

**Given** I enter a new email address
**When** that address is already registered to another account
**Then** it is **rejected upfront with "already in use", before any verification email is sent**
**And** otherwise a verification email is sent to the **new** address and the change lands only when it is
confirmed
**And** the email is FR-P1's email (2), sent through Resend on the branded template.

**FRs:** FR-A4. · **Frame:** `S12 Billing.dc.html` S12a. · **Owner test:** yes. · **Verification:** real Resend
send (R-82).

### Story 2.4: End every session everywhere

As a user who signed in on a device I no longer have,
I want one action that signs me out everywhere,
So that losing a laptop is not losing my account.

**Acceptance Criteria:**

**Given** I have sessions on several devices
**When** I use sign-out-everywhere
**Then** every session is invalidated, including the current one
**And** ordinary sessions persist 30 days rolling until then.

**FRs:** FR-A6. · **Frame:** `S12 Billing.dc.html` S12a. · **Owner test:** yes.

### Story 2.5: Ask to delete my account, and be able to change my mind

As a user who is leaving,
I want to delete my account, download what I would lose, and have two weeks to change my mind,
So that leaving is final when I mean it and recoverable when I do not.

**Acceptance Criteria:**

**Given** I choose to delete my account
**When** I confirm by typing my name
**Then** a 14-day soft-delete window opens and the confirmation email states the deadline
**And** **auto-renew on my Dodo subscription stops immediately**, so I am never charged again while the purge
is pending, and my entitlements are retained at their current level until the purge
**And** every retained pre-Inflozo snapshot is listed with its site and offered as a download, at deletion time
and in the confirmation email, **throughout the window**
**And** signing in during the window offers a one-click **Restore account** that cancels the purge, offers
one-click resume of auto-renew at the same plan and price, and **says plainly when the paid period ended
meanwhile** — restoring on Free under FR-L3's over-limit rules if it did
**And** the confirm opens with focus on the cancelling action (UX-DR14) and is a typed confirm because the
action is irreversible and account-wide (UX-DR19)
**And** the screen matches frame S12c and uses its serious voice.

**FRs:** FR-A5 (the request, the window and the restore). · **Frame:** `S12 Billing.dc.html` S12c. ·
**Owner test:** yes.

### Story 2.6: The purge, the cascade and the anonymisation

As a departed user,
I want everything of mine actually gone on the deadline,
So that the GDPR commitment is kept rather than turned into indefinite retention.

**Acceptance Criteria:**

**Given** the 14-day window has expired without a restore
**When** the purge runs
**Then** projects, templates, assets, connections and deploy artifacts cascade
**And** suggestions-board posts are **anonymised** — author becomes "Deleted user" and any uploaded image is
removed — while the user's votes and notification rows are **deleted**
**And** the purge **proceeds on the deadline regardless of whether snapshots were downloaded or declined**
**And** **no further email is sent** — deliberately, because FR-P2 permits no nudges and the deadline was stated
when the user chose it
**And** a cascade deletes rows, not bytes: the Storage objects are governed separately and are removed by the
same job (AD-32)
**And** the job is a scheduled job with **one owning epic and one home** (AD-33).

**FRs:** FR-A5 (the purge). · **Owner test:** none (a background job). · **Verification:** real Supabase, a
seeded account purged end to end (R-82).

*Exit:* passkey sign-in round-trip on production; deletion cascade verified end-to-end.

---

## Epic 3: Sites & Connections

A user connects their own Ghost site with one credential pair, sees it validated, takes their brand from it in
one click, and manages several sites whose health is checked daily.

> **Connect asks for one credential pair and stops.** The Staff Access Token is **E7's**, requested at first
> deploy where its purpose is visible in context. This epic's wizard ends at a connected, previewable,
> **partially credentialed** site — which is a first-class state, not an error.
> **FR-C7's redesign proposals are not in this epic** — they need the runtime, the packs and the starters, and
> are owned by E13.

### Story 3.1: The server-side Admin proxy and Vault credential storage

As a user handing Inflozo my Ghost keys,
I want them encrypted server-side and never sent to a browser,
So that a credential that could take over my site never leaves the server.

**Acceptance Criteria:**

**Given** a stored Ghost credential
**When** any Admin API call is made
**Then** it is proxied through a server route that **mints a short-lived Admin JWT per request**
**And** the Admin API key and the Staff Access Token are encrypted at rest in Supabase Vault via
`site_credentials` and are **never sent to any client**
**And** the **Content API key is delivered to the browser deliberately**, because it is browser-safe by Ghost's
own design — the distinction is the key's scope, not the act of delivering it
**And** the two Ghost APIs run on two paths that never swap (AD-10), and the write allowlist stays at four
**And** no credential is ever logged: `codeinjection_*` payloads are never stored or logged either.

**FRs:** FR-C3. · **Owner test:** none (no screen). · **Verification:** real Supabase Vault and a real Ghost
Admin call against T1 (R-82).

### Story 3.2: The connect wizard — URL, integration guide, and the two keys

As someone with a Ghost site,
I want guided steps to create an integration and paste two keys,
So that my site is connected and designable in minutes rather than after three trips to Ghost Admin.

**Acceptance Criteria:**

**Given** I start the connect flow
**When** I enter my Ghost URL
**Then** I am shown guided, screenshotted instructions to create a **Custom Integration** in Ghost Admin
**And** I paste the **Content API key and the Admin API key from that one integration** — and **the Staff
Access Token is not requested here**
**And** validation is server-side: the Admin JWT is minted and the **authenticated `GET /admin/config/`** is
called; `GET /admin/site/` is **never** used to validate a key, because it returns 200 for a fabricated key
**And** the Ghost `version` is reported — 5.x and 6.x accepted, **4.x and older rejected with a friendly
"please update Ghost"**
**And** the Content API key is verified client-side with a `settings` read
**And** an `http://` URL is warned at connect, because live-content editing needs HTTPS from the browser
**And** on Ghost(Pro) the API URL is the site's `*.ghost.io` **admin domain**, while the public `url` is read
from `GET /admin/site/` and is what the Sites card, "View site" and Deploy Live link to
**And** the project is connected, previewable and fully designable at the end, in the **partially credentialed**
state (UX-DR7)
**And** the screens match frames S2b·1 and S2b·2, and the same pair as a modal is S11b.

**FRs:** FR-C1, FR-C2 (validation). · **Frame:** `S2 Onboarding.dc.html` S2b·1 · S2b·2 · `S11 Sites.dc.html`
S11b. · **Owner test:** yes. · **Verification:** T1 (6.58.0) and T3 (5.130.6) connected for real (R-82).

### Story 3.3: The connect-time probes — Preview-only, code injection, Portal and the announcement bar

As a user whose Ghost plan or settings limit what Inflozo can do,
I want that detected rather than asked about,
So that I am never made to declare a plan and never surprised later.

**Acceptance Criteria:**

**Given** a validated connection
**When** the connect probes run
**Then** `hostSettings.limits.customThemes` is read: where it forbids custom themes the site is marked
**Preview-only automatically**, and its absence (self-hosted) means unlimited
**And** where `hostSettings` is present but unreadable, the flow **asks which plan the site is on** as the
declared fallback
**And** connect computes **one boolean** for whether head or foot code injection is set, surfaces a one-time
notice that the live page can legitimately differ from the canvas, and **discards the payload** — the injected
content is never returned to a client, never stored, never logged and never enters a render path
**And** Portal's floating subscribe button state is read, and **if the setting cannot be read Inflozo asks —
one question, defaulting to on** — with the answer stored on the connection
**And** the announcement bar's content, background and visibility are read on the same call, for FR-C4's seed
**And** Preview-only is presented in **sky, not danger** (UX-DR7), and the Preview-Only Notice says what it is
and what clears it
**And** the probe sits behind the `ghostpro_preview_probe` feature-flag row.

**FRs:** FR-C2 (the probes). · **Frame:** `B Missing Surfaces.dc.html` B15 Preview-Only Notice. · **Owner
test:** yes. · **Verification:** T1 and T3 for the self-hosted path; the Ghost(Pro) half is carried to §4's
launch gate with T4.

### Story 3.4: Take my brand from my site in one click

As a user who has just connected a site,
I want Inflozo to read my brand and offer it,
So that the canvas looks like mine before I have chosen anything.

**Acceptance Criteria:**

**Given** a successful connect
**When** the auto-branding card appears
**Then** it offers, in one click, the site's accent colour, logo and navigation seeded into the active project's
Style Pack, and switches the canvas to live content
**And** where the site has an announcement bar set, **it is offered as a seed too** — the text becomes the
message prop of a placed A2 design, `announcement_visibility` maps onto the **show to** control and
`announcement_background` onto the Background role — after which it is an ordinary Inflozo section
**And** **seeding is a copy, never a live binding**, because Ghost's announcement text is not readable at
render time
**And** once seeded, a one-click **"turn Ghost's own bar off"** is offered — consented, never silent — and
declining leaves both bars stacked, which is a legitimate choice
**And** the card is skippable and re-runnable later from the Style panel
**And** the screen matches frame S2c.

**FRs:** FR-C4. · **Frame:** `S2 Onboarding.dc.html` S2c. · **Owner test:** yes. · **Verification:** T1 with a
real announcement bar set (R-82).

### Story 3.5: My sites, their caps, and disconnecting one

As a user with more than one publication,
I want a list of my connected sites and a safe way to disconnect one,
So that I can manage several sites without ever losing a project or a safety net.

**Acceptance Criteria:**

**Given** the Sites surface
**When** I view it
**Then** each connected site shows a health badge, and the connection cap is enforced (Free 1, Pro 10)
**And** with no sites, the connect card **is** the whole page (UX-DR6); at the Free cap, S11c's ghost slot
**And** disconnecting a site **never deletes projects** — affected projects fall back to sample content
**And** disconnecting **never deletes the site's pre-Inflozo snapshot**: snapshots bind to the **site record
id, not the raw URL**, so a disconnected record and its snapshot are retained and re-adopted when that same
record is reconnected
**And** reconnecting a URL for which no record is retained creates a **new** site record with no snapshot
association — Inflozo never adopts a snapshot on a URL match alone
**And** the **90-day countdown starts here** — this story is the only writer of `disconnected_at`, and the
deadline is derived from it, never stamped into `site_snapshots.purge_after` (which carries FR-A5's 14-day
clock alone). **The purging job itself — the notice, the download offer, and the purge proceeding on its
deadline whether or not the offer was taken — is Story 7.20's**, beside the snapshot it deletes, because
nothing captures a snapshot until FR-J13's first upload *(the owner's ruling, 2026-09-09; DW-75)*
**And** the screens match S11a and S11c.

**FRs:** FR-C5 (the caps), FR-C6. · **Frame:** `S11 Sites.dc.html` S11a · S11c. · **Owner test:** yes.

### Story 3.6: Manage keys, and a partially credentialed site as an ordinary state

As a user who rotated a key or wants to add the token later,
I want a per-site key screen that shows what I have and what each thing enables,
So that a missing credential reads as a choice rather than a fault.

**Acceptance Criteria:**

**Given** the Manage keys flow for a site
**When** I open it
**Then** **each credential shows present or absent with what it enables** — never an error badge (UX-DR7)
**And** I can re-paste the Custom Integration's Admin and Content keys and the Staff Access Token, test the
connection, and save, which re-encrypts to Vault
**And** the token can be **added at any time or removed again**, and removing it **degrades the three
token-dependent capabilities rather than disconnecting the site**
**And** adding it retroactively enables the snapshot from that point forward and **the UI does not pretend it
can reconstruct a snapshot of a theme already replaced**
**And** **a site's URL is immutable — there is no edit-URL-in-place**, and the screen says why: it would carry
one site's record, snapshot and first-upload flag onto a different live Ghost install
**And** a domain move is a disconnect plus reconnect, and a new-site connect whose credentials match an existing
record hints "Moved domains? … your old site's snapshot is kept for 90 days"
**And** there is **no plan field** in this flow — Preview-only is probed, not declared
**And** it is reachable from the site card and from every "Reconnect needed" state
**And** **a credential coming OUT writes a row in `private.credential_audit`, and so does one going in** —
`public.credential_action` gains the value that names a removal, and both `remove()` and `store()` audit
through it, so the one record that exists to be trusted stops being silent about the half of the traffic
that takes keys away (**DW-76**; the owner's ruling at Story 3.5's Question 3, option 1, 2026-09-09 — the
entry lands in the story that next changes the log, and this is it)
**And** the screen matches S11d and B20 as re-specified.

**FRs:** FR-C8. · **Frame:** `S11 Sites.dc.html` S11d + `B Missing Surfaces.dc.html` B20. · **Owner test:** yes.

### Story 3.7: The daily health check, the reconnect email and the compatibility watch

*The compatibility watch left this story on 2026-09-10 — the owner's ruling at Story 3.7's Question 1,
option 1 (**DW-87**). It is built by **Story 9.1**, the first story that ships designs to customers and
the first in which any design declares `ghostCompat`; there is no library for the broadcast to verify
until then. The title is kept as written so the sprint tracker's key for this story does not move. What
3.7 builds is the daily check, the "Reconnect needed" badge, the once-per-transition email and the two
⋯ rows the owner added the same day.*

As a user who deployed once and stopped signing in,
I want to be told when my site needs attention,
So that I find out from Inflozo rather than from a broken page.

**Acceptance Criteria:**

**Given** a connected site
**When** the daily background health check runs
**Then** it re-validates stored credentials against `GET /admin/config/`, re-runs version detection so a Ghost
upgrade lifts stale version-dependent behaviour **without reconnecting**, re-runs the `customThemes` probe so
Preview-only **sets and clears without any user action**, re-reads the live `routes.yaml` to detect routes
drift, and re-reads Portal's button state and the announcement settings so both canvas shims track the site
**And** failure sets a **"Reconnect needed"** badge with the reason and date
**And** the email sends **once per healthy→unhealthy transition** (at most one reminder), is suppressed while
the outage persists, resets on recovery, and is capped at **one health email per site per rolling 7 days, the
count starting again when the site is fixed** (R-101, 2026-09-10) — a site that stays broken logs to the
notifications centre only
**And** ~~on each Ghost release, one broadcast to every account on every plan~~ and ~~that compatibility
notice is the one carve-out FR-P2 allows to reach email~~ — **both moved to Story 9.1 by the owner's ruling,
2026-09-10 (DW-87)**: the broadcast is only as good as the library check behind it and no design exists to
check. This story still builds the channel that notice will ride — FR-P1's "Reconnect needed" email and its
shell — so the receiving story adds a trigger and a template, not a mechanism
**And** the `site_health` notification rows are written by this epic (AD-25) into the table Story 1.2 created, and the
scheduled job has one owning epic and one home (AD-33).

**FRs:** FR-C5 (the check), FR-P1 email (3). *(FR-C5's compatibility watch is Story 9.1's — DW-87.)* · **Frame:** `S11 Sites.dc.html` S11a (the badge and its ⋯ menu). `S3 Dashboard.dc.html` S3e + `B Missing Surfaces.dc.html` B21 draw the notifications centre, which is Story 13.4's reader over the rows this story writes. The email is a transactional send, not a drawn surface. · **Owner test:** yes (the badge, the two new ⋯ rows and the email). ·
**Verification:** real Resend send and a deliberately broken credential on T3 (R-82).

### Story 3.8: First Run — the three doors after the first sign-in

*Added 2026-09-08 by the owner's ruling on Story 3.2's Question 1 (DW-19, closed): the drawn First Run screen
is built as Epic 3's last story, after 3.4, so its Recommended door runs all the way through.*

As someone who has just signed in for the first time,
I want to be shown my three ways to start,
So that I connect my Ghost site first rather than landing on an empty page.

**Acceptance Criteria:**

**Given** an account with no project and no site
**When** its first sign-in completes
**Then** it lands on **First Run** — "Let's make your Ghost site gorgeous." with three cards: **Connect your
Ghost site** marked Recommended, **Start from a starter**, **Blank canvas** — and the line "You can do all of
this later."
**And** Connect leads into Story 3.2's handshake and on through 3.4's auto-brand; Blank canvas opens the New
Project Sheet; Start from a starter is greyed with its reason in the caption until Epic 11's chooser exists
(a door stays drawn and carries its reason)
**And** it is shown once: an account that has a project or a site, or that chose a door, goes to the dashboard
**And** the screen matches frame S2a at 1440, 834 and 390.

**FRs:** FR-C1 (the entry to connect), FR-B2 (the creation paths). · **Frame:** `S2 Onboarding.dc.html` S2a. ·
**Owner test:** yes. · **Verification:** a fresh throwaway account on `app.inflozo.com` lands on First Run
and, after connecting T1, never sees it again (R-82).

### Story 3.9: The deferred-work sweep at the end of Epic 3

*Added 2026-09-11 by the owner: stop at the end of Epic 3, go through every open entry in the
deferred-work ledger, and close the ones we now know enough to close — leaving untouched anything
that waits on a capability a later epic builds.*

As the owner watching a ledger that has only ever grown,
I want every deferred item that can be finished now to be finished now,
So that the list left open is the list that is genuinely blocked, and nothing closable is hiding
behind it.

**Acceptance Criteria:**

**Given** the deferred-work ledger at the end of Epic 3
**When** every open entry is triaged
**Then** each one is either closed by a change that makes its claim false, or left open with the
story that owns it named — and **no entry is deleted or renumbered**
**And** the six drawn-but-unbuilt nav destinations land on **Inflozo's own not-found page inside the
shell**, answering HTTP 404, rather than on the framework's bare 404 outside it
**And** one migration makes four sentences structural that were comments: a project's slug unique
per user, FR-B5's "at most one project per site", the credential log's three outcomes, and the one
user reference in the schema that cascades neither way
**And** the checks the ledger says are missing exist and each has a control that fails when the
thing it protects is reverted (standing rule 2)
**And** the two documents a fresh session reads first are findable rather than walls of prose
**And** `pnpm check`, `pnpm build`, the RLS gate and the documentation gate are all green, with the
documentation gate now running in CI as well as in the local hook.

**FRs:** none new — this story makes existing FRs structural (FR-B5, FR-J10) and closes verification
debt against FR-A5, FR-B2, FR-B3, FR-C3 and FR-C8. · **Frame:** `M9 404.dc.html`, extrapolated into
the app shell under R-74; the departures are recorded in the spec. · **Owner test:** yes (the
not-found page, and a pass over the screens the small fixes touch). · **Verification:** the
constraints read back off the production pooler after the hand-applied migration, the deployed site
driven for the 404s and the dashboard guards, the RLS gate with its control (R-82, R-99).


*Exit:* T1–T3 connected and validated **with the token absent**, and the partially credentialed state
round-tripped through Manage keys; on T4 the connect-time probe sets Preview-only and clears it when the probe
changes. **The deploy-error half of the Starter path is verified at the E4/E7 joint gate**, because FR-C2 makes
the deploy error authoritative and no deploy exists until E7.

---

## Epic 4: Section Runtime Platform

The machine every design in the library is authored against exists and is proven: one source, two emitters that
agree node by node, the controls engine, the Ghost helper shim, the fixtures, `core`, the Baseline tooling and
the string catalog's format.

> **`core` and the module registry are platform work, not per-section work**, and FR-G8's Baseline tooling
> exists before the first category is built, since every stylesheet is authored against it.
> **The string catalog's keys, English defaults and `{{t}}` contract are defined here, not in E7** — E4 writes
> the library's first chrome strings and every design is constrained by them, so the format cannot arrive three
> epics later. E7 owns the Translations *surface* and the `locales/` emission.

### Story 4.1: The registry format and the annotated-HTML authoring vocabulary

As a developer authoring every design in the library,
I want a registry entry format and a documented authoring vocabulary,
So that 466 designs are written against one contract instead of 466 conventions.

**Acceptance Criteria:**

**Given** the registry contract
**When** a design is authored
**Then** its entry carries `{ id, category, name, tier, bindingContext, compileTarget, contentSchema,
controlSchema, quickControls[], html, css, js?, dataBindings?, ghostCompat, darkCapabilities, previewSeed }`
**And** `contentSchema` is the **category's union** while `controlSchema` and `quickControls[]` are **per design**
**And** `bindingContext` takes only `none · post · posts · tag · tags · author · authors · tiers · error ·
private` — **there is deliberately no `page` value**, because a page and a post are the same resource, and what
differs is expressed through `compileTarget`
**And** `compileTarget` is **a refusal, not a hint**: `any` is withdrawn wherever it was a lie, a design
emitting `{{pagination}}` is restricted to paginated targets, and a `{{#get}}`-performing design excludes
`error.hbs` and `private.hbs`
**And** `quickControls[]` is **recovered mechanically** as the first 3–5 entries of a design's own control list,
read from the design level and never from the category's union
**And** section source is **annotated HTML, not Handlebars**, and its authoring format and directive vocabulary
are a **documented, shipped deliverable**
**And** `css` is plain CSS consuming Style Pack custom properties only, authored outside the app's build
pipeline and **explicitly excluded from any Tailwind processing**
**And** `contentSchema` declares which **inline binding tokens** each prop accepts and nothing else in braces is
substituted — an allow-list by construction, never a general substitution pass
**And** the identity is `{categoryId}/{n}`, stable forever
**And** the section content and control schemas are **generated from `design.json`**, never hand-maintained twice.

**FRs:** FR-G3. · **Owner test:** none (a format and its documentation).

### Story 4.2: The section runtime — one source, two emitters, proven to agree

As the product's central promise,
I want the canvas and the shipped theme produced by the same pure code,
So that "what you see is what ships" is proven by construction rather than argued.

**Acceptance Criteria:**

**Given** one annotated-HTML source and a project doc
**When** the runtime renders
**Then** two emitters produce canvas DOM and `.hbs` text from the same core, which performs **no I/O, holds no
clock, and imports nothing from Next.js, Supabase or Node**
**And** `packages/section-runtime/src/agreement.test.ts` compares the two **node by node** — element tree, classes and
attribute names identical, because those three are what a design's stylesheet selects on
**And** the **two differences that must exist** are asserted **positively**, so nobody can "fix" them into
agreement: a repeat expands against real rows on one side and becomes `{{#foreach}}` on the other, and a binding
resolves to a value on one side and becomes a mustache on the other
**And** a control is **one attribute on the section root**, and a design switch **replaces the set** (AD-3)
**And** user text is text-plus-marks and becomes markup at **exactly one place** (AD-4), under brace-safe
emission (AD-5)
**And** **the build decides the page and the render never re-decides it** (AD-37): there is no render-time design
substitution, and adjacency is answered by the compiler from the placement list
**And** **one reference token set ships with the runtime** — the full custom-property contract at a single set of
values — because a design's CSS consumes Style Pack custom properties *exclusively*, so without it nothing renders
on the canvas at all. **E6 replaces it with the twelve authored packs and does not change the contract.** *(Added
by the step-6 stress test, finding F2: E5's canvas and Section Picker render "in the project's current Style
Pack" three epics before E6 authors one.)*
**And** every AD-36 sink is closed with a runnable assertion that the vector is inert **and** the legitimate case
still works — URL schemes allow-listed in the **shared core** so both renderers inherit it, helper arguments
validated against each helper's own grammar rather than concatenated, bindable attribute names allow-listed with
`style` and every `on*` absent, and bound CSS values parsed to hex/`rgb()`/`hsl()` with a pack-token fallback.

**FRs:** FR-G3 (the runtime half). · **Owner test:** none (no screen). · **Verification:** the agreement and
AD-36 test suites run green.

### Story 4.3: The Ghost helper shim, and its contract tests against recorded real-Ghost output

As a designer working on a canvas,
I want Ghost's helpers resolved faithfully in the browser,
So that the canvas shows what Ghost will actually render.

**Acceptance Criteria:**

**Given** the Appendix B surface
**When** the shim resolves a value
**Then** it implements the subset the library uses — `{{#foreach}}`, `{{#get}}` mapped to Content API queries
with NQL filters, `{{img_url}}` **emitting Ghost-shaped sized URLs and `srcset`, not pass-through**, `{{date}}`,
`{{reading_time}}`, `{{#match}}`, `{{#if @member}}`, `{{navigation}}`, `{{asset}}`, `{{content}}`, `{{title}}`,
`{{excerpt}}`, `{{custom_excerpt}}`, `{{url}}`, `{{tags}}`, `{{authors}}`, `{{t}}`, the pagination context, the
four core helpers and the truthy helpers
**And** **Handlebars is never parsed or executed in the browser**
**And** the two count helpers render a sample value on an unlinked project and the real rounded string on a
linked one, **always as a string**
**And** **`{{content_api_key}}` never renders a real key on the canvas** — the shim emits an inert placeholder
**And** all Content-API values render as **text nodes, never through `innerHTML`**, every URL-valued field is
scheme-validated to `http`/`https`, and excerpts render text-only and sanitised — all three living in
`ghost-shim` so both renderers inherit them
**And** `{{#get}}` filters may reference **only template-level context, never the current render context** — a
registry-level constraint binding on every design authored under E9–E11
**And** **NFR-6(c2) shim contract tests** assert each shimmed helper's output against **recorded real-Ghost
output** for a recorded input set, per-commit and offline, with **image URLs compared, not normalised away**
**And** every external-platform fact enters only as a recorded fixture (AD-23).

**FRs:** FR-H1, FR-H5 (the shim). · **Owner test:** none (no screen). · **Verification:** recordings captured
from T1 and T3 (R-82).

### Story 4.4: Orbit Weekly and the three fixtures

As every design in the library,
I want a sample dataset and a generated article to be judged against,
So that a section drops in looking finished and a reading design has something real to wrap.

**Acceptance Criteria:**

**Given** the bundled dataset
**When** a canvas renders unlinked
**Then** its feed is sized by FR-H3's two rules — at `posts_per_page` 12 there is a first page, a **true
middle page** carrying both a previous and a next link, and a partial last page, and the feed never equals
`posts_per_page` — at the owner's Q2 sizes (Story 4.4, 2026-09-13: 52 posts, 15 featured, 16 authors with
portraits and bios, 6 tiers, 5 newsletters, twelve press logos), plus tags, nav and brand assets, all imagery
internally produced
**And** **every Data-group Source returns a usable set**: featured, every tag (at least 3 posts), every author
(at least 6, by co-authorship), and featured posts are spread across tags and authors so a combined filter also
returns something
**And** **(1) the style-guide post** is generated **from Ghost's own renderers, never hand-written** — recorded from
what a real Ghost prints on each major and split per block into a checked-in fixture (Story 4.4) — covering every class-affecting card variant, and it
renders **inside the same wrapper the shipped theme uses**, loading **the theme stylesheet, then a simulated
`cards.min.css` carrying only the chunks not in the exclude list, in that order**, plus the four vendored card
scripts
**And** **(2) the comments fixture** renders **14 comments across 9 threads**, five carrying one reply, one with
a deliberately long body and one in the signed-out state
**And** **(3) the style-guide page** is the same body on a `page.hbs` fixture
**And** all three are **checked in and diff per-commit**, so a Ghost target bump surfaces as a visible fixture
diff rather than silent drift
**And** the fixtures are **excluded from every feed**
**And** the fixtures are Inflozo-authored and trusted by construction, which is exactly why they can be rendered
when real body HTML cannot — NFR-3's never-read rule over the *user's* body HTML is untouched.

**FRs:** FR-H3. · **Frame:** `C Post Body.dc.html` C4 Style-Guide Fixture. · **Owner test:** yes (the fixture is
visible on every body). · **Verification:** regenerated from Ghost's renderers at the pinned target.

### Story 4.5: The controls engine and the control vocabulary

As a user who is not a developer,
I want controls that offer words and pictures rather than units and hex,
So that I can change how a section looks without learning CSS.

**Acceptance Criteria:**

**Given** the shared vocabulary
**When** a design declares its controls
**Then** the types available are Segmented Control, Stepper, Toggle, Named Select, **Swatch Row** (Style Pack
roles — never a colour picker), Image Picker, **Icon Picker** (every Tabler icon, outline and filled, grouped by
Tabler's own categories — R-104; **inline SVG once per use**, never a sprite or an icon font, licence text
shipped in the theme), Link Picker, Text Field/Area, Date Picker
and **Item List**
**And** **Item List is offered only where the array is authored** by the user; a Ghost-bound repeat gets a
**count** instead, because an Add button there would be a lie
**And** **Remove never greys** — at the floor it stays visible and active and clicking it produces the floor and
the reason as one sentence under the list (UX-DR4)
**And** reorder is drag **with a keyboard equivalent** (UX-DR10)
**And** **no units, no hex, no CSS concepts at section level**, and width is not a per-section control
**And** the sidebar is 3–5 Quick Controls then **Content / Arrangement / Style / Data** groups — *Arrangement*,
not "Layout", because the design itself is chosen in the design picker above
**And** the cap of ≈ 15 visible controls governs **a single design**, not the category's union, and the three
universal controls — Background role, Vertical spacing, Top divider — are exempt, are declared once, and are
never Quick Controls
**And** a design **may offer fewer values of a universal control and must say why**; renaming and inventing are
refused, an `Inherit` value is refused anywhere, and "Vertical spacing" keeps one meaning
**And** **a control another control disables is greyed with the reason shown as a sentence, never a tooltip and
never hidden** (UX-DR3), with the dependency declared in the schema so the sidebar, the validator and the
compiler read one source
**And** a control that could never do anything in this design is **absent, and the panel says why** (UX-DR3)
**And** per-control and whole-section reset exist, every change paints optimistically **within one frame**, and
the re-render completes inside the **100 ms** budget
**And** mode-scoped controls carry a moon badge when a dark override exists
**And** the Link Picker is Ghost-aware — internal resources, **Portal actions compiled to real `data-portal`
values with Upgrade emitting `account/plans`, never `upgrade`**, external URL, email, and **Ghost search via
`data-ghost-search`** — with `newTab` and `rel` part of the **stored mark record**, not editor-only state
**And** a link to a page Ghost does not publish is a Text Field plus a Link Picker that **renders nothing until
a destination is set**
**And** there is **one control schema per design and one union schema per category**, both generated from the
same authored source, never maintained twice.

**FRs:** FR-F1, FR-F2, FR-F3, FR-F4, FR-F5, FR-F6, FR-F7, FR-F8. · **Frame:** `Editor Sidebar Kit.dc.html` ·
`P0-0 Greyed Control Pattern.dc.html` · `B Missing Surfaces.dc.html` B2 · `P0-3` item list. · **UX-DRs:** UX-DR3,
UX-DR4, UX-DR19. · **Owner test:** yes.

### Story 4.6: Context-aware binding and empty-value guards

As a user placing a section on a template,
I want bindings that cannot be wrong,
So that I never build a page that renders silently empty.

**Acceptance Criteria:**

**Given** the normative matrix in `appendix-b1-template-contexts.md`
**When** the editor offers a binding
**Then** **only bindings valid in the current template's render context are ever presented — there is no path by
which a user can construct an invalid one**
**And** the matrix is keyed on **template**, **scope** (top level vs inside `{{#foreach}}`) and **connected Ghost
version**, so fields introduced after a target's version are not offered for that site
**And** on `page.hbs` the root carries `post` and `page` as **two keys onto one object**, and **Inflozo emits
`{{#post}}` on both templates** so one design compiles identically to both
**And** moving or duplicating a section onto another template **re-validates every binding**, and bindings
unavailable in the destination must be re-pointed or reverted to static **before the move completes**
**And** every bound prop compiles inside a guard, and **the guard is derived from the bound field, never from a
helper argument** — the spike emitted `{{#if YYYY}}` from a date format string, which is a guard on an
identifier that does not exist, so the block never renders and the content is silently and permanently lost
**And** guards use `{{#if}}` exclusively — `{{#has}}` is not a null check
**And** **text** bindings fall back to the static value the prop held before it was bound; **media** bindings
hide the element they occupy, guarding **the element and never the attribute**, and a media guard encloses any
`srcset`, because an unguarded `srcset` renders a malformed attribute the browser resolves as a relative URL
**And** the **avatar is the one designed substitute and has two forms**: a user-authored list bakes **two
initials** at compile, a Ghost-sourced author shows **one letter in pure CSS**, because `{{split}}` arrived in
Ghost 6.5 and is a gscan error below it — and **a design must not mix the two forms in one component**.

**FRs:** FR-H7, FR-H8. · **Owner test:** none (a prevention rule, verified by the absence of invalid offers). ·
**Verification:** the matrix asserted against T1 and T3 renders.

### Story 4.7: `core` and the behaviour-module registry

As every generated theme,
I want one shared platform module and a fixed registry of behaviours,
So that no theme ships a line of third-party JavaScript and every module degrades honestly.

**Acceptance Criteria:**

**Given** the registry in `research-section-js-libraries.md` §2
**When** `core` is built
**Then** it carries the module registry, the `data-i18n-*` reader, one shared `IntersectionObserver` factory, an
`AbortController` teardown path, and the **`matchMedia('(prefers-reduced-motion: reduce)')` gate every animating
module passes through**
**And** **all vanilla, zero third-party runtime dependencies** — compile CI asserts that `assets/js/` contains
**only files authored in the Inflozo repository**, with `cards.js` the single declared exception
**And** the licence filter for any future proposal is MIT, BSD-2/3-Clause, Apache-2.0 or ISC only, re-verified
**at the pinned version**, because users may resell the themes Inflozo generates
**And** a design may declare **several** modules and the compiler emits the union; each design owns its own CSS
and its own JS and **removing a design removes both**
**And** **every module declares its no-JS degradation and whether it is `edit-safe`**, both as acceptance
criteria, in the one per-module table — `edit-safe` meaning the module may run inside the editor canvas without
interfering with editing, and anything not edit-safe is **suppressed on the canvas with its section in its
resting state**; `lightbox` is the defining not-edit-safe case
**And** a module declaration **may carry the width below which the script runs**, and where it does, its no-JS
line describes the state on **both** sides of that width
**And** the **ten behaviours that need no module at all** are implemented as such: `<details>`, `<a href="#top">`
with `scroll-behavior`, CSS `columns`, `:has()`, `position: sticky`, **server-side `{{#if @member}}` for every
member-visibility swap**, CSS transitions, `<audio controls>`, and Ghost's native pagination.

**FRs:** FR-G7. · **Owner test:** none (no screen).

### Story 4.8: The Baseline floor and the three tools that enforce it

As every stylesheet and module in the library,
I want a browser floor pinned by date and enforced without a build step,
So that what a section may legally use never widens with no commit behind it.

**Acceptance Criteria:**

**Given** `browserslist-config-baseline` at `widelyAvailableOnDate: 2026-08-18`
**When** the floor is resolved
**Then** it is Chrome/Edge 121, Firefox 122, Safari and iOS Safari 17.2, **computed rather than restated**
**And** **the pin is a date, not a version list**, so every widening is a reviewable diff and bumping the date
**requires a render-matrix re-run**
**And** three tiers apply: **Tier 1** anything Baseline Widely on the pinned date, unrestricted; **Tier 2** a
short version-controlled allowlist of Baseline *Newly* features, usable **only where the fallback is the
design's own unstyled state**, carrying no layout, contrast or interaction; **Tier 3** everything else fails the
build
**And** the Tier-2 allowlist carries `backdrop-filter` behind an opaque or gradient scrim, `text-wrap: balance`,
`text-wrap: pretty`, `scrollbar-width`/`scrollbar-color`, `@starting-style`, **`<details name>`**, `mask-image`
and `fetchpriority`; `scrollbar-gutter` is Tier 3
**And** the `<details name>` entry carries its expiry — it reaches Widely on 2027-03-03, beyond this pin, so it
is **required** and **recomputed rather than assumed** when the pin moves
**And** scroll-driven animations are not Baseline, so `reading-progress` and `reveal` use `IntersectionObserver`;
`popover` is Newly only, so modals use native `<dialog>`
**And** **vendor prefixes are a closed list of three** — the `-webkit-box` line-clamp trio,
`-webkit-text-size-adjust: 100%`, and `-webkit-user-select` beside `user-select` — and any other prefixed
declaration is a CI failure
**And** CSS Nesting is forbidden despite being Baseline Widely, for §7.1's flat hand-editable-output reason
**And** enforcement is `stylelint-plugin-use-baseline` over the flat stylesheets at `available: "widely"` plus
the allowlist, `eslint-plugin-compat` over the modules against the pinned browserslist, and `size-limit` over
the compiled `assets/js/main.js` — **all three build-time only, never entering a generated theme**.

**FRs:** FR-G8. · **Owner test:** none (build tooling).

### Story 4.9: The string catalog — keys, English defaults and the `{{t}}` contract

As every visitor-facing chrome string a theme prints,
I want one catalog with stable dotted keys,
So that improving a default never renames a key and never orphans a user's override.

**Acceptance Criteria:**

**Given** `appendix-h1-string-catalog.md` as the normative source
**When** the catalog format is defined
**Then** keys are **dotted `namespace.name`, never the English string itself**, each with an English default
**And** `.hbs` output consumes catalog strings **exclusively via Ghost's `{{t}}`** with `{placeholder}` hash
params, never hard-coded literals, and compile validation enforces it
**And** **strings written by bundled JS are out of `{{t}}`'s reach**, because Ghost never runs
`assets/js/main.js` through Handlebars: those keys resolve at compile time and are emitted as **`data-i18n-*`
attributes on their module's mount element**, which validation asserts instead — the `{{t}}`-only rule is
scoped to `.hbs` output explicitly
**And** **`credit.*` is a locked namespace**: it compiles through the same path but is not listed in the
Translations surface and is not overridable on any plan, and an override reaching the compiler for a `credit.*`
key **fails the build rather than being silently dropped**
**And** catalog keys sit inside the backward-compatibility contract — **append-only, never reworded in place**,
and a superseded key ships a migration map carrying the user's override forward
**And** the library's first chrome strings are written against this catalog, so every design authored in E9–E11
is constrained by it from the first one.

**FRs:** FR-Q6 (the format half — the surface and `locales/` emission are E7's). · **Owner test:** none (a
format).

### Story 4.10: The five pilot sections, editor-perfect, with the snapshot harness

As the proof that this platform works,
I want the five hardest sections in the library rendering perfectly on canvas,
So that no category is authored against a runtime nobody has stressed.

**Acceptance Criteria:**

**Given** the five pilots — **A1 #1**, **A17 #1**, **A22 #1**, **A24 #1**, **A4 #2**, identified by number
**When** they are authored against this platform
**Then** each renders **editor-perfect on canvas** in light and dark
**And** each exercises the case it is in the set for: A1 #1 the site-wide singleton binding `@site.navigation`
and `@site.logo`; A17 #1 the dynamic feed over the native paginated context extracting `post-card` **invoked
with no params**; A22 #1 `@member` gating with Portal actions; A24 #1 the wrapper context valid only inside
`{{#post}}` on `post.hbs`; A4 #2 rich text with all four marks plus a guarded media binding with `srcset` and
the heaviest control set in the library
**And** their compiled `.hbs` snapshots are **committed and diffing per-commit** (NFR-6(c1))
**And** the fixtures ship with them and diff the same way
**And** each pilot is marked **provisional until its category's gate** (AD-35), because a pre-gate pilot is not
an approved design
**And** **"compiles byte-identical" is deliberately not an exit criterion here** — it belongs to the E4/E7 joint
gate, because the compiler is E7's.

**FRs:** the exit proof for FR-F1–F8, FR-G3, FR-H5, FR-H7, FR-H8. · **Frame:** each pilot's own
`<ID>-<n> <Name>.dc.html` and its `<ID>-0 Category Proof.dc.html`. · **Owner test:** yes.

### Story 4.11: The render matrix and the accessibility scan that runs on it

As every one of the 33 owner gates,
I want the render matrix to exist before the first category needs it,
So that a gate is not blocked on a harness nobody built.

**Acceptance Criteria:**

**Given** §4's statement that **the render matrix renders locally and needs no Ghost**, which is why it can be
built here rather than waiting on the compiler
**When** the matrix is built over the five pilot sections
**Then** it renders **every design × 3 reference Style Packs × light/dark × 3 viewports** — the count derived
from the inventory and moving with it, never restated independently
**And** it produces **Playwright screenshot baselines with diff gates**, failing a design above **1% differing
pixels at a per-pixel tolerance of 0.1**
**And** the renderer is **pinned**: one fixed Playwright/Chromium version, in one fixed container image, **with
fonts installed in the image**, animations and caret disabled — **the runner is part of the baseline**
**And** **the NFR-5 axe-core scan runs on these same renders**, at WCAG 2.1 AA and **zero violations**, at
near-zero marginal cost — **no second matrix exists**
**And** the scan's scope includes **the fixture renders and the six synthesized templates**, not only placed
designs
**And** the matrix **pins its fixtures**: A32 on a gated `post.hbs`, A33 on the style-guide post, A34 on the
bundled feed at its first, a middle and its partial last page, A25 on the style-guide post *and* page, the six synthesized stacks as
themselves, and **an empty tag pinned as a fixture** so the main feed's empty state is a render like any other
**And** **reduced motion is a matrix case with the query forced, and 200% browser zoom is a viewport case**
(UX-DR21)
**And** **baseline regeneration has a rule before it is ever needed**: a change to a Style Pack, a shared
primitive or the pinned renderer invalidates the whole set at once, so a mass rebaseline **requires the owner's
approval on a sampled visual review** — one design per category, both modes — lands as its own commit touching
baselines only, and names the change that caused it
**And** the cadence is set here: **the full matrix nightly and before each release; per-commit runs cover only
the designs a commit touched.**

**FRs:** none — this builds NFR-6(a) and the NFR-5 scan that rides on it. · **Owner test:** none (a harness). ·
**Note:** §8 assigns the (c1) and (c2) layers to E4 by name and leaves (a) unowned; it is placed here because
§4 states the matrix needs no Ghost, and because **every category gate from E9 onward requires it green**.

*Exit:* the five pilot sections render editor-perfect on canvas and their compiled `.hbs` snapshots are
committed and diffing per-commit; **the fixture set ships here**. "Compiles byte-identical" is the joint gate's,
not E4's.

---

## Epic 5: Editor Shell

A user builds a page: places sections, edits text on the canvas, cycles the design ring, reorders layers,
switches templates and modes and devices, shuffles, remixes, and never loses a content prop or a control value
doing it.

> **The two Ghost-surface shims are built here against E4's contract** — a work split, not a second owner.
> **FR-H5 stays E4's**, defining what the shims must render and how they stay inert; Portal's floating button
> and Ghost's announcement strip are *canvas* work and land with the canvas.
> **FR-H2's main-feed designation lifecycle belongs to E5.** E7 emits what E5 designated.

### Story 5.1: The editor shell, the canvas boundary and the URL scheme

As a user opening a project,
I want the four-part editor with a canvas carrying no editing chrome,
So that what I look at while designing is the site itself.

**Acceptance Criteria:**

**Given** a project
**When** I open it
**Then** I get a slim top bar, a collapsible left **Layers** panel, a centre **canvas** and a right **Controls**
sidebar
**And** with nothing hovered or selected **the canvas is a pixel-faithful render of the site** and carries
**zero editing chrome**
**And** editing chrome lives **inside the iframe as pseudo-elements** (AD-21), and the canvas iframe is
same-origin, which is why the CSP is `frame-ancestors 'self'` and not `'none'`
**And** **this story settles and records the two things `EXPERIENCE.md` deliberately left open for the
architect** (UX-DR22): the **URL scheme** for a project, a template and a template surface — including what
browser Back does across them — and **which parts of the shell sit inside the iframe boundary and which
outside**. Both are written into the spec, not left to the implementation.
**And** the **`script-src 'self'` with no `'unsafe-eval'` half of the CSP is verified on the real canvas** —
§18's probe proved the mechanism on a minimal app, and only a real canvas can show that nothing in the editor
reaches for `new Function`. This is a requirement on this story, not a measured property inherited from the spine.
**And** the shell matches frame S4a.

**FRs:** FR-D1 (the layout). · **Frame:** `S4 Editor.dc.html` S4a. · **Owner test:** yes. · **Verification:**
CSP headers checked on the deployed app (R-82).

### Story 5.2: Hover, selection and the insertion affordance

As a user pointing at a section,
I want it to tell me what I can do to it without cluttering the page,
So that the canvas stays the site and the controls stay out of the way.

**Acceptance Criteria:**

**Given** a rendered canvas
**When** I hover a section
**Then** I get a 1px outline, a floating name tag, and quick actions — **Previous / Next design ◀ ▶**,
Duplicate, Delete and a drag handle
**And** between sections a hairline **"+"** insertion affordance appears on hover
**And** clicking selects the section, giving a persistent outline and its sidebar controls, and **Esc**
deselects
**And** clicking a text element inside a selected section enters inline editing
**And** with nothing selected the Control Sidebar says "Nothing selected. Click any section on the canvas — its
controls appear here." (UX-DR6)
**And** hover affordances also appear on **tap-and-hold** on a touch device, and no interaction is discoverable
only by hover (UX-DR18)
**And** the states match frames S4b hover and S4c selected.

**FRs:** FR-D2, FR-D3. · **Frame:** `S4 Editor.dc.html` S4b · S4c. · **Owner test:** yes.

### Story 5.3: Inline editing, the four marks and the link picker

As someone writing copy,
I want to type directly on the page and format with four marks,
So that writing feels like writing and never like filling in a form.

**Acceptance Criteria:**

**Given** a text prop
**When** I click into it on the canvas
**Then** I edit it in place, line breaks honoured, with the schema's per-prop character limit enforced
**And** selecting text raises a small floating toolbar offering **exactly four marks — bold, italic, underline,
link** — available on any text prop, headlines included
**And** **a mark a field does not permit is absent, not greyed**, with a fixed button order so the shapes stay
recognisable at any width (UX-DR19)
**And** the value is stored as **text plus an ordered list of `{start, end, mark, href?}` ranges over exactly
those four marks — never as an HTML string** — with `newTab` and `rel` carried in the same record
**And** canvas editing is **raw `contenteditable` mapped to schema props by data-attributes**, so **no editor
library's DOM enters the iframe** and the rendered markup stays byte-comparable to shipped markup
**And** every text prop is **also** editable in the sidebar's Content group, editing the same structure, which
is why both editors show marks
**And** pasted content is **stripped to these four marks**
**And** a prop bound to a Ghost Admin text setting is **plain-text-locked while bound**, which is a truncation
of the mark list rather than a parse
**And** the Link Picker searches the user's own posts and pages as I type
**And** clicking an **icon slot** on the canvas, filled or empty, opens the **Icon Picker** anchored to it — the
component Story 4.5 built, mounted rather than drawn again — and an empty slot shows as P0-2's dashed placeholder
only while its section is selected (owner, 2026-09-13, DW-115)
**And** the toolbar matches `P0-1 Inline Text Toolbar.dc.html`, link entry matches B4b, and the icon slot and
picker match `P0-2 Icon Slot and Picker.dc.html` as R-104 reshapes it.

**FRs:** FR-D4, FR-F1 (the Icon Picker's canvas entry). · **Frame:** `P0-1 Inline Text Toolbar.dc.html` · `B Missing
Surfaces.dc.html` B4b · `P0-2 Icon Slot and Picker.dc.html`. · **Owner
test:** yes.

### Story 5.4: The Layers panel, reordering, and the two kinds of singleton

As a user with a long page,
I want an ordered list I can drag, rename, hide and delete from,
So that I can work on structure without hunting down the canvas.

**Acceptance Criteria:**

**Given** the active template
**When** I open Layers
**Then** I see its sections in order, can drag to reorder with the canvas following live, rename per instance,
duplicate, delete, and toggle visibility — and **hidden sections are excluded from compilation but retained**
**And** **site-wide sections** (headers, announcement bars, footers) appear in **every** template's Layers as a
pinned "Site-wide" group with a globe badge and a page count; editing one changes every template; they **cannot
be duplicated**; deleting or hiding one asks a confirm noting it affects every template
**And** **a layout may carry at most one Post Content section**, and the Section Picker **refuses the second
placement and says why** — "this layout already prints the article" — rather than accepting it and warning later
**And** **non-placeable treatments never appear in Layers** and are excluded from placement, drag, reorder,
duplicate and delete
**And** **CTA-bearing sections carry a member-visibility control** — Everyone / Logged out / Free members / Paid
members
**And** **hiding every section is not emptying**: a fully hidden template is designed and compiles an empty body;
only removing every section returns a template to untouched
**And** keyboard: **↑↓ move focus, `⌥↑`/`⌥↓` move the section itself with the canvas following and the move
announced, `Enter` selects, `Space` toggles visibility** (UX-DR10, UX-DR12)
**And** a template with no sections shows only the Site-wide card (UX-DR6)
**And** the panel matches B7 and its keyboard focus state matches D8e.

**FRs:** FR-D5. · **Frame:** `B Missing Surfaces.dc.html` B7 · `D8 Editor Below 1440.dc.html` D8e. · **UX-DRs:**
UX-DR10, UX-DR12, UX-DR19. · **Owner test:** yes.

### Story 5.5: The template switcher and the synthesised templates

As a user designing a whole site,
I want to move between every page type my theme will emit,
So that nothing ships that I could not have looked at first.

**Acceptance Criteria:**

**Given** the top bar
**When** I open the template switcher
**Then** it offers Home, Post, Page, Tag archive, Author archive, **Membership as a group of three (Signup ·
Signin · Member Home)**, 404, a **conditional Private** canvas, and any custom templates — with **+ New
template** deep-linking into the Routes Manager creation flow
**And** the Private row **appears only once a Private Site Gate is called for, and is absent rather than
greyed** when it is not
**And** **synthesis applies to exactly seven templates** — `home.hbs`, `index.hbs`, `post.hbs`, `page.hbs`,
`tag.hbs`, `author.hbs`, `error.hbs` — which, untouched, render their normative Synthesis Defaults **as the
starting canvas**, with header, footer and style inherited from Home by reference and archives carrying a
designated main feed
**And** every other canvas — the membership pages, Private, every custom template — **opens empty and emits
nothing until designed**
**And** each synthesised template carries an **auto-generated marker** in the top bar and at the head of Layers
until the first edit materialises the stack, and the marker carries **its words, not only a dot** (UX-DR8)
**And** synthesis is **not a deploy-time-only mechanism**: the six render on canvas exactly as they will compile,
which is what puts them inside NFR-5's scan and NFR-6(a)'s matrix
**And** **the Post and Page canvases are peers** — the Post Content section is placeable, designable and
design-pickable on both, with the same ring and the same per-design controls, holding independent placements
**And** the switcher matches D5b complete and the marker matches D5a.

**FRs:** FR-D6. · **Frame:** `D5 Canvas Markers and Template Switcher.dc.html` D5b · D5a. · **Owner test:** yes.

### Story 5.6: Light and dark authoring

As a user whose site has two modes,
I want to design the dark one without authoring a second palette,
So that dark mode is prepaid rather than a project of its own.

**Acceptance Criteria:**

**Given** a Light + Dark project (the default, because every preset ships a hand-paired dark palette)
**When** I use the sun/moon toggle
**Then** the canvas re-renders in the other mode, and mode-scoped controls — Background role, per-mode image
swaps, mode-specific toggles — **apply to the active mode only** and show a **moon badge captioned "Dark
override"** where one exists (UX-DR8)
**And** **"Clear dark overrides"** is available per section, and the project surface reports how many sections
carry one
**And** switching the project to **Light only** hides the toggle, compiles without dark support, and leaves
existing dark overrides **inert rather than deleted** — they reapply if dark is re-enabled
**And** switching between Light only and Light + Dark **never affects the custom-settings cap**, because all
three dark built-ins are declared and referenced on every project
**And** where `color_scheme` is Light or Dark rather than Auto, **the visitor `mode-toggle` control is not
offered and the panel says why** — it is not drawn disabled, because the design carrying it is simply not a
design this project can use
**And** the project-mode row and the clear-overrides row match D6a.

**FRs:** FR-D7. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a · `S4 Editor.dc.html` S4a. · **Owner
test:** yes.

### Story 5.7: Device preview, and the canvas as a viewport

As a user checking a design on a phone,
I want the canvas to become a phone rather than a narrow column,
So that a sticky header sticks and a full-screen hero fills.

**Acceptance Criteria:**

**Given** the device toggles
**When** I pick Desktop, Tablet (834) or Mobile (390)
**Then** the canvas resizes in **both axes to a real device size** — 390 × 844 for mobile, **not a 390-wide
column of infinite height**
**And** the size and the automatic scale are reported in a mono chip — "viewport 390 × 844 · shown at 55%"
**And** **there is no user zoom control**: the only scale is fit-to-screen. **B11's drawn "Fit / 55%" picker is
re-specified — keep the chip, remove the control** (UX-DR17, UX-DR20)
**And** device preview is **display only** and is unrelated to a Preview-only connection
**And** sections are auto-responsive and there is **no per-breakpoint editing**
**And** there is **no hard cap on sections per template**, and the editor holds NFR-1 on the 40-section fixture;
beyond it behaviour degrades gracefully — slower is acceptable, and **"lockup" is bounded as any main-thread
block over 5 seconds**, which is the clause's pass/fail condition
**And** the states match B11a and B11b as corrected.

**FRs:** FR-D8, FR-D14. · **Frame:** `B Missing Surfaces.dc.html` B11a · B11b. · **UX-DRs:** UX-DR17, UX-DR20. ·
**Owner test:** yes.

### Story 5.8: Undo, redo, and local-first persistence

As a user who just deleted the wrong thing,
I want it back, even after a reload,
So that nothing I do in this editor is ever unrecoverable.

**Acceptance Criteria:**

**Given** I am editing
**When** any change happens
**Then** it is written **immediately to local browser storage**, writes never block the UI, and editing speed is
unaffected
**And** cloud sync runs periodically (default every 3 minutes), on tab close, on lock release, and **before any
deploy or export**, with manual ⌘S always available
**And** the indicator shows **Saved on this device · Syncing · Synced · Retrying** — four **labels** and one dot,
**never a spinner**, with the expanded panel appearing only on Retrying and counting down ("Retrying · 12s")
(UX-DR8, UX-DR19)
**And** where local storage is unavailable or a write fails, the editor **falls back to immediate per-change
cloud sync and says so in the indicator — never a false "Saved on this device"**
**And** turning periodic cloud autosave off shows an explicit data-loss warning
**And** undo/redo covers 100 **edits, not operations** — a Variant Shuffle is **one** edit however many ops it
costs — over content, controls, ordering, shuffles and Style Pack changes
**And** because control schemas are per design, an undo entry restores the **parked value alongside the design**,
and an entry whose design no longer exists **no-ops gracefully with a notice, never half-applying**
**And** the journal persists locally across reloads, and the app requests persistent storage via
`navigator.storage.persist()` — with loss to browser eviction a **stated limitation, not a requirement**
**And** on a hydrate that **supersedes** the local document — a takeover, or any lock acquisition where the cloud
revision differs from the local doc's base revision — **the local undo journal is cleared**, because its entries
reference a superseded document; an ordinary reload against a matching revision **keeps its journal**
**And** the testable claim is scoped to match: **the journal is present and replayable after a reload within the
same session**
**And** **no operation count is ever surfaced anywhere in the product** (AD-16)
**And** the indicator matches B6 as extended.

**FRs:** FR-D9, FR-D10. · **Frame:** `B Missing Surfaces.dc.html` B6. · **Owner test:** yes.

### Story 5.9: The keyboard map, and keyboard completeness

As a user who works from the keyboard,
I want every action reachable without a mouse,
So that the editor is usable rather than merely compliant.

**Acceptance Criteria:**

**Given** the editor
**When** I use the shortcuts
**Then** the complete global set works: **⌘K** insert section · **`[` `]`** previous/next design · **⌘D**
duplicate · **Del** delete · **⌘Z / ⇧⌘Z** · **⌘S** save now · **1/2/3** device preview · **L** layers · **`.`**
dark toggle · **Esc** deselect · **P** Preview Mode · **⇧R** Site Remix · **⌘⏎** Ship it
**And** **every single-character shortcut is live only while the editor shell holds focus, and never while a
text field or a `contenteditable` has it** — WCAG 2.1.4, which axe-core does not detect, so it is verified by the
E2E keyboard journey (UX-DR11, UX-DR21)
**And** ⌘-modified shortcuts are unaffected by that rule
**And** **the states added after the map carry no shortcut, deliberately** — the paginated preview, the preview
subject, the auto-generated marker and the member-state toggle are set-and-forget context, not per-edit actions
**And** **standard within-component keyboard behaviour is not a shortcut and is required**: Section Picker arrows
across the grid with `Enter` to place and **`Esc` returning focus to the invoking position**; design picker ←→
mirroring `[` `]`; every menu, popover and sheet moving focus in, trapping it, and returning it to the invoking
control (UX-DR10)
**And** the canvas is **one tab stop between Layers and the Controls sidebar**, reachable and escapable by
keyboard, with focus landing on the canvas container rather than inside the rendered site (UX-DR9)
**And** **a drag with no keyboard equivalent is a defect** — every drag surface has one.

**FRs:** FR-D11. · **Frame:** no surface of its own — behaviour over `S4 Editor.dc.html` S4a, `D8 Editor Below 1440.dc.html` D8e, `S5 Section Picker.dc.html` S5a and `B Missing Surfaces.dc.html` B1a, each of which it must not alter. · **UX-DRs:** UX-DR9, UX-DR10, UX-DR11. · **Owner test:** yes. · **Verification:** the NFR-6(d)
keyboard-only journey, run with no pointer events.

### Story 5.10: The Section Picker

As a user adding a section,
I want to browse the library already wearing my own brand,
So that I choose what will look right rather than what looks right in someone else's screenshot.

**Acceptance Criteria:**

**Given** ⌘K or "+ Add section"
**When** the Picker opens
**Then** it is a full-screen overlay with a left category rail, search, and **live previews rendered in the
project's current Style Pack with the project's content source**
**And** Free/Pro badges are shown, and **a Free user can add any Pro section** — the canvas is open and
enforcement happens at the exits
**And** insertion lands **at the invoked position**
**And** the Picker **filters on context**: it offers only designs whose `bindingContext` and `compileTarget`
match the template being edited, so a design binding a resource the template lacks is **never presented**
**And** the **non-placeable treatments are absent from the rail entirely**
**And** a search with no matches keeps the category rail and says what was searched for (UX-DR6)
**And** previews are lazily rendered with skeletons, holding NFR-1
**And** the overlay matches S5a and S5c dark.

**FRs:** FR-D12. · **Frame:** `S5 Section Picker.dc.html` S5a · S5c. · **Owner test:** yes.

### Story 5.11: The design ring — navigation, shuffle, and carry / park / default

As a user browsing what a category can look like,
I want to cycle designs in place and get back exactly what I had,
So that browsing the ring is safe rather than a gamble with my own work.

**Acceptance Criteria:**

**Given** a placed section
**When** I press `[` or `]`, use the hover arrows, or click a thumbnail in the sidebar's **Design** picker
**Then** the section changes design in place, and the picker **shows position — "Design 7 of 18"** — so the ring
is legible rather than endless, with `]` past the last returning to the first (UX-DR5)
**And** **"Design" is the only term** — not layout, not variation, not variant
**And** the rule is **carry, park, default**: a control present in both designs **carries** its value; one
present only in the design being left is **parked against that design so returning restores it exactly**; one
present only in the design being entered takes its **default**
**And** **Variant Shuffle** cycles the same ring but chooses for the user, carrying content props and control
values under the same rule
**And** both are **restricted to designs sharing the instance's `bindingContext` and `compileTarget`**, and where
a category's designs differ on those the ring is **partitioned** — A29 tag vs author, A31 error vs private vs
custom page — while **A30 declares an explicit `surface` partition** (signup · signin · member home) that neither
crosses, because those surfaces differ in form markup and content model rather than render context
**And** props a design does not use are **preserved invisibly and restored if shuffled back**
**And** a design renders only as many list items as its structure fits, surplus items are preserved invisibly,
and the sidebar states the count — "8 items · 3 shown in this design"
**And** the change is announced politely — *"Design 8 of 18 — Image Backdrop"* (UX-DR12)
**And** the picker matches B1a, the on-section nav matches B1b, and shuffle matches `S6 Variant Shuffle.dc.html`.

**FRs:** FR-D13, FR-D19. · **Frame:** `B Missing Surfaces.dc.html` B1a · B1b · `S6 Variant Shuffle.dc.html`. ·
**UX-DRs:** UX-DR5, UX-DR12. · **Owner test:** yes.

### Story 5.12: Site Remix

As a user who wants a different look without redoing the work,
I want one action that re-rolls the whole canvas and keeps every word I wrote,
So that exploring costs nothing.

**Acceptance Criteria:**

**Given** a built canvas
**When** I use Site Remix
**Then** the Style Pack and/or every placed section's design is re-rolled, with **all content preserved** via
the shared per-category content model
**And** **every re-roll obeys the `bindingContext` / `compileTarget` restriction on every template Remix
touches**
**And** scoped re-roll is offered — pack only, designs only — with **single-step undo**
**And** **site-wide singletons are excluded unless explicitly included**, and the non-placeable treatments are
**never** re-rolled
**And** the section count after a re-roll is announced politely (UX-DR12)
**And** **the drawn "Keep Free designs only" tick-box is not built** — Remix always re-rolls from the whole
library, because FR-L3's exit sheet is the mechanism the product already has (UX-DR20, ruling R-77)
**And** the surface matches B8 **as re-specified**.

**FRs:** FR-D17 (the action). · **Frame:** `B Missing Surfaces.dc.html` B8 as re-specified. · **UX-DRs:**
UX-DR20. · **Owner test:** yes.

### Story 5.13: The content-source pill and the preview subject

As a user previewing with my own site,
I want to know which post I am looking at and change it,
So that the canvas is reproducible rather than an accident of query order.

**Acceptance Criteria:**

**Given** a canvas
**When** I look at the content-source pill
**Then** it reads "Previewing with: {site} / Sample content" and is switchable when a site is linked
**And** once a site is linked it **also names the preview subject** — which post, page, tag or author the
single-resource canvases are rendering
**And** untouched, and always before a site is linked, **the subject is the fixture**: the style-guide post on
Post, the style-guide page on Page, and a fixed Orbit Weekly tag and author on the archives
**And** once connected I may **override the subject** from the same picker the Data group uses, per canvas,
persisted with the project
**And** this is not cosmetic: a subject **with** a feature image and one **without** produce structurally
different markup under the media guards, so an unstated subject makes the canvas non-reproducible and NFR-6(c1)'s
diffs noisy
**And** a subject that disappears from the connected site — deleted, unpublished or newly gated — **falls back to
the fixture and says so, rather than emptying the canvas**
**And** the pill matches B9 and the picker matches D5e.

**FRs:** FR-D15, FR-D22. · **Frame:** `B Missing Surfaces.dc.html` B9 · `D5 Canvas Markers and Template
Switcher.dc.html` D5e. · **Owner test:** yes.

### Story 5.14: Member-state preview, and the nudge that names what I have not looked at

As a user designing for members,
I want to see the page as each kind of visitor,
So that I never ship a logged-in state nobody has seen.

**Acceptance Criteria:**

**Given** the top-bar eye
**When** I switch member state
**Then** the canvas renders as **Anonymous / Free member / Paid member** — **three states** — and Appendix B's
fourth status `comped` **previews as Paid**, differing in billing rather than access
**And** members-aware sections re-render accordingly — nav auth links, subscribe CTAs, the paywall — **and so
does the shimmed announcement strip**, which follows `announcement_visibility`, so a bar set to paid members only
is absent while previewing as Anonymous
**And** the bindable member object is exactly `uuid · email · name · firstname · avatar_image · subscriptions ·
paid · status`, and is `null` when logged out
**And** **`{{#has any="@member"}}` is always false** and is never emitted as a logged-in test
**And** **gated post bodies are never previewed from the connected site** — the browser-safe Content API never
returns members-only content, so a gated body renders the **style-guide fixture** behind a "gated content — shown
with sample text" indicator, and the fidelity layers exclude gated-body equivalence
**And** the editor **tracks which member states each canvas has been viewed in and surfaces the unchecked
combinations** — a quiet marker beside the toggle, and again in the pre-deploy check — which **never blocks**,
and is what makes the owner's manual member-state pass at each category gate reliable rather than dependent on
memory
**And** the toggle matches S4d as corrected, with B9.

**FRs:** FR-D16. · **Frame:** `S4 Editor.dc.html` S4d · `B Missing Surfaces.dc.html` B9. · **Owner test:** yes.

### Story 5.15: Behaviours off while designing, and the Preview toggle

As a user editing a rotator,
I want it to hold still,
So that the section stops fighting me while I work on it.

**Acceptance Criteria:**

**Given** the canvas while editing
**When** a section declares behaviour modules
**Then** **layout-affecting CSS is always live** — sticky, hover, transitions — because it changes what the
design *is*
**And** **JavaScript behaviour is suppressed unless the module declares `edit-safe`**, and a suppressed section
renders **in its resting state** with a **PAUSED chip on the behaviour itself**, not in a status bar
**And** edit-safe modules — sticky/shrink headers, scroll reveal, tabs, accordions — **run always**, because
designing their open and closed states requires it
**And** **`lightbox` is not edit-safe**: a modal opening over the canvas when I click an image to edit its caption
is the defining case
**And** the **Preview toggle hides all editing chrome and runs everything for real**, and returns
**And** the declaration is part of the module contract, **not a per-instance setting**
**And** the states match B3a editing and B3b preview.

**FRs:** FR-D20. · **Frame:** `B Missing Surfaces.dc.html` B3a · B3b. · **Owner test:** yes.

### Story 5.16: Previewing page 2

As a user designing pagination,
I want to see the second page,
So that a pagination treatment is designable at all.

**Acceptance Criteria:**

**Given** a canvas showing a paginated feed
**When** I switch to the page-2 preview
**Then** the canvas renders page 2, **deliberately a middle page carrying both a previous and a next link** —
the only state in which a numbered treatment shows its full range
**And** "Back to page 1" is offered
**And** the shim supplies the page-2 context and the fixture carries enough posts for a second page to exist
under the project's `posts_per_page`
**And** it carries **no keyboard shortcut**, deliberately
**And** the state matches D5d.

**FRs:** FR-D21. · **Frame:** `D5 Canvas Markers and Template Switcher.dc.html` D5d. · **Owner test:** yes.

### Story 5.17: The edit lock and the take-over choreography

As a user who left the project open on another machine,
I want one editing context and an honest account of what was lost,
So that two tabs never quietly overwrite each other.

**Acceptance Criteria:**

**Given** a project already open elsewhere
**When** I open it
**Then** I get **read-only mode** with a "Request editing" nudge and the banner "…is editing this site — you are
reading along" (UX-DR7)
**And** on accept, the current holder **syncs its changes to the cloud, releases the lock and becomes
read-only**, and the requester gains edit rights
**And** the lock heartbeat carries the holder's **unsynced-edit count in user-perceived edits, never raw
operations** — a shuffle is one edit however many ops it costs — because this number appears verbatim in the
string that tells a user what they lost
**And** if a nudge goes unanswered the requester is told "No response; that session has X unsaved edits" and may
**take over anyway**: the lock transfers and the requester refreshes to the last synced snapshot
**And** a revived former holder becomes read-only and is told concretely what was lost — "That session had 14
unsaved edits; they were not included" — and those edits are **not recoverable**
**And** **the nudge timer is a no-response timer, not a decision timer: it stops the moment the holder interacts
with the popover at all, including focusing it** (UX-DR13)
**And** the request is announced **assertively**, and so is the takeover notice (UX-DR12)
**And** the takeover confirm **opens with focus on the cancelling action** (UX-DR14)
**And** **Deploy and ZIP export require the lock**: from a read-only session, Ship it or Export first prompts a
take-over surfacing "X unsaved edits exist elsewhere", so a stale cloud snapshot can never silently ship
**And** the states match B5a, B5b, B5c and the fourth state D8g.

**FRs:** FR-D18. · **Frame:** `B Missing Surfaces.dc.html` B5a · B5b · B5c · `D8 Editor Below 1440.dc.html` D8g.
· **UX-DRs:** UX-DR12, UX-DR13, UX-DR14. · **Owner test:** yes.

### Story 5.18: Live content from the connected site

As a user with a real site,
I want the canvas to show my real posts,
So that I am designing against my content rather than someone else's.

**Acceptance Criteria:**

**Given** a linked site
**When** the canvas needs content
**Then** it is fetched **client-side** from the site's Content API with SWR-style caching (60 s) and silent
fallback to Orbit Weekly on network failure with a subtle indicator
**And** reads are **batched and de-duplicated per resource** across the canvas, Section Picker previews and Link
Picker search, under a per-session request ceiling
**And** on HTTP 429 or repeated failure the editor falls back to Orbit Weekly **and names the cause** — because
Ghost rate-limits Content API keys and Ghost(Pro) sits behind an edge Inflozo does not model (UX-DR6)
**And** the canvas reads **list and metadata fields only and never post or page body HTML**: `{{content}}`
resolves to the style-guide fixture on `post.hbs` and `page.hbs` alike
**And** where the site has fewer or zero items than a section requests, the canvas renders what exists plus an
**editor-only indicator** — "this site has 2 posts; section shows up to 6" — while compiled sections render
gracefully with fewer
**And** **zero items has three distinct behaviours**: the designated main feed renders its **own declared empty
state and is never back-filled**; a secondary `{{#get}}` feed renders **nothing at all, heading and container
together**; a bound prop that is not a feed follows the media/text guards
**And** **the empty-state rule governs feeds**: items pulled from Ghost render the designed empty state, items
the user **authored** render **nothing at zero**, because an editor who has typed no steps is mid-build, not
looking at an error.

**FRs:** FR-H4. · **Frame:** `B Missing Surfaces.dc.html` B9 (the content-source pill and its fallback indicator) · `S4 Editor.dc.html` S4a. · **Owner test:** yes. · **Verification:** T1 with a real Content API key, and a forced 429
(R-82).

### Story 5.19: The Data group and the main-feed designation

As a user with a blog archive,
I want exactly one feed on the page to be the real, paginated one,
So that my archive paginates correctly and every other feed stays fixed.

**Acceptance Criteria:**

**Given** a dynamic section
**When** I open the Data group
**Then** I get Source (Latest / Featured / By tag / By author / Hand-picked posts), Count, Order, and show/hide
toggles for date, author, excerpt, reading time and tag chip
**And** on every natively paginated template — index, custom collections, channels, and the **tag and author
archives** — **exactly one section is the designated main feed**, bound to the native paginated `posts` context
**never `{{#get}}`**, sized by the global `posts_per_page` **or by the route's own `limit:` where the template is
reached through a collection that sets one**, and the canvas reads whichever value actually applies
**And** the main feed **alone** exposes **Pagination style: Numbered / Load More / Infinite scroll**, and
load-more designs are main-feed-only
**And** all other feeds are `{{#get}}`-driven with a fixed Count that **caps at 100** and never emits
`limit="all"`; a design may cap its own Count below the global and **the panel states the reason**
**And** designation has a lifecycle **owned by this epic**: the first feed placed on a paginated template
auto-designates; archives start with one from the Synthesis Defaults; a channel created in the Routes Manager is
given one at creation; deleting or hiding it transfers designation to the next feed section; the user may
reassign it anytime; and the editor **marks the main feed visibly**
**And** a paginated template with **zero** feed sections is allowed, and the archive case keeps its warning
because `tag.hbs` and `author.hbs` have no second file to fall through to
**And** **hand-picked order is the drawn order** — picked references are held in the order dragged and handed to
the template in that order, **never re-sorted by `published_at`** — because `filter="id:[…]"` discards the
requested order and a re-sort silently renumbers an ordinal design
**And** hand-picked has **no hard cap**: the panel **warns past 25** and lets the user proceed, worded for the
case that bites — **the budget is per page, not per section** — with the pre-deploy check warning per template
**And** the Data group's `fallback` field **selects how the designed empty state renders and never what else to
show instead**
**And** the marker matches D5c.

**FRs:** FR-H2. · **Frame:** `D5 Canvas Markers and Template Switcher.dc.html` D5c. · **Owner test:** yes. ·
**Depends on E10:** the main-feed designation and its Pagination control are built here; **A34's ten treatments
arrive in E10**, and the two meet at A34's owner gate. *(Declared by the step-6 stress test, finding F3.)*

### Story 5.20: Tier-bound surfaces and the Paywall editor

As a user running a paid newsletter,
I want my real tiers on the page and a paywall I can design,
So that the membership half of my site is designed rather than inherited.

**Acceptance Criteria:**

**Given** `{{#get "tiers"}}`-bound surfaces
**When** a site is connected
**Then** they show live tier names, prices, currency and benefits; sample tiers otherwise
**And** **tier presence never implies tier purchasability**: Ghost seeds an active `$5/mo · $50/yr` "Default
Product" at install, so **every emitted paid CTA compiles inside `{{#if @site.paid_members_enabled}}`, never
inside a tier-count check**, and every tier query filters `type:paid+visibility:public`
**And** **every member ask is gated on the site's own capability flag** — a free ask wraps in `{{#if
@site.allow_self_signup}}`, a paid ask in `{{#if @site.paid_members_enabled}}` — warned at connect and again
pre-deploy
**And** **the paywall is a template surface, not a placeable section**: its designs are selected in a standalone
**Paywall editor** with its own canvas, one design active per project, compiling to `partials/content-cta.hbs`,
and it is **absent from the Section Picker, from Layers and from Shuffle**
**And** a member ask on an ordinary canvas is an existing CTA section carrying the member-visibility control, not
a paywall
**And** the editor's **empty state is "members switched off"** (`members_signup_access` = none) — **not** "no paid
tiers", because Ghost's paywall renders on every gated post whether or not a paid tier exists, so a free
newsletter gating posts to members is exactly a site this editor serves — with two numbered steps and a Re-check
(UX-DR6)
**And** **the warning never fires on synthesised instances**, so an untouched project is never warned about a
section its user did not place
**And** **a member's own details are never server-rendered** — no `@member.email`, name or billing detail reaches
the page; anything identifying is a hand-off to Ghost's own account panel (AD-38)
**And** the editor matches C3a and its empty state matches C3b as corrected.

**FRs:** FR-H6. · **Frame:** `C Post Body.dc.html` C3a · C3b. · **Owner test:** yes. · **Verification:** T1 with
members enabled and T3 with members off (R-82). · **Depends on E10:** the editor is built and tested here against
whatever paywall designs exist; **A32's twelve arrive in E10**, and the two meet at A32's own owner gate. Same
shape as §8's declared A25 → FR-Q7 dependency. *(Declared by the step-6 stress test, finding F3.)*

### Story 5.21: The two Ghost-surface shims on the canvas

As a user designing a header,
I want Ghost's own announcement strip on the canvas above it,
So that I am designing against the page that will actually exist.

**Acceptance Criteria:**

**Given** the connection's stored settings snapshot, refreshed daily
**When** the canvas renders
**Then** **Portal's floating subscribe button** is drawn `position: fixed` in the bottom corner, **only when the
connection says the button is enabled**, exactly where edge-rail and corner designs put their own furniture
**And** **Ghost's announcement bar** is drawn as a strip pinned to the very top of the canvas, **above everything
the theme renders**, because that is where `{{ghost_head}}` puts it — showing the real text in its real
background, **occupying real vertical space and pushing the design down rather than overlaying it**, and honouring
the member-state toggle
**And** this is what makes the stacking **visible while designing rather than discovered after deploy**: an
Inflozo announcement bar, a transparent-overlay header and a sticky header all sit *below* Ghost's strip on the
real site
**And** both render **inside** the canvas iframe where Ghost puts them, and both are **non-interactive,
non-selectable, absent from Layers, excluded from Shuffle and Remix, and never compiled into anything**
**And** both are **NFR-6(c3) exclusion regions**, because Ghost's real markup is Ghost's to render
**And** the strip **disappears the moment the user clears Ghost's bar**, which is where the two-bar stack
resolves into one.

**FRs:** the canvas half of FR-H5 (the contract stays E4's). · **Frame:** `S4 Editor.dc.html` S4a — both shims are Inflozo-drawn approximations of Ghost's own markup inside that canvas, and are NFR-6(c3) exclusion regions for exactly that reason. · **Owner test:** yes. · **Verification:** T1 with a
real announcement bar and Portal button (R-82).

### Story 5.22: The editor's responsive floor

As a user on a tablet, and as a user who zooms,
I want the editor to reflow rather than evict me,
So that zooming to read is not treated as using a phone.

**Acceptance Criteria:**

**Given** a device and a viewport
**When** I open a project
**Then** on a **coarse pointer below 834** — a phone — I land on the **Small Screen Notice**, which says the
editor needs a wider screen and offers what genuinely works from a phone: **the project's deploy history with
one-tap rollback, the sites list and billing**
**And** on a **coarse pointer at 834 and above** — a tablet — I get the editor as drawn: the Layers panel as an
icon rail, the Controls sidebar as an overlay with a scrim, **every target at least 44 px**, and one overflow
menu (UX-DR18)
**And** on a **fine pointer the floor is never met**: a 1440 display at 200% browser zoom presents roughly a
720 px viewport and **keeps the editor**, reflowing rather than redirecting — the Layers panel collapses to an
icon rail, the Controls sidebar becomes an overlay panel, and the canvas keeps its own scroll
**And** **this is browser zoom, which Inflozo does not own and may not defeat** (WCAG 1.4.4) — it is not the
canvas scale FR-D14 refuses, and the two never meet
**And** the Dashboard, Sign In, Billing, Suggestions and every marketing page stay **fully usable at 390**
**And** the states match D8a at 834, D8b at 720 and D4f at 390.

**FRs:** FR-D1 (the floor). · **Frame:** `D8 Editor Below 1440.dc.html` D8a · D8b · `D4 Dashboard Sheets and
Blocks.dc.html` D4f. · **UX-DRs:** UX-DR16, UX-DR18. · **Owner test:** yes.

### Story 5.23: The play-loop gate

As the only gate on the product's central claim,
I want never-lose-content proven mechanically,
So that "you can play with this" is a tested property rather than a promise.

**Acceptance Criteria:**

**Given** the 40-section stress fixture
**When** **20 consecutive Variant Shuffles across the placed sections** are followed by **a full Site Remix
re-roll**
**Then** **every content prop and every control value that held a value before holds the same value after — zero
loss**
**And** the **round trip is asserted explicitly**: shuffle away from a design carrying a control the next design
does not declare, shuffle back, and **the parked value is restored exactly**
**And** every re-roll obeyed the `bindingContext` / `compileTarget` restriction
**And** the whole assertion runs **programmatically over the project doc — no telemetry, no human judgment**
**And** the full editing loop on the five pilot sections holds **60 fps** on NFR-1's reference environment: p95
frame time ≤ 16.7 ms with **no long task > 50 ms** across a 3-second trace of drag, reorder, Variant Shuffle and
control changes.

**FRs:** FR-D17 (the gate). · **Owner test:** none (a programmatic assertion). · **Verification:** the reference
laptop at 4× CPU throttle, manual-only — a CI number would be noise presented as a gate.

*Exit:* full editing loop on the five pilot sections at 60 fps on NFR-1's reference environment and fixture, and
the play-loop gate green.

---

## Epic 6: Style Packs

A user changes the whole look of their site in one click, edits any token per mode with contrast checked live,
and gets a hand-paired dark palette they never had to author.

### Story 6.1: The token engine — computed or authored, and nothing in between

As a pack author,
I want to be asked only for the decisions that are genuinely judgement,
So that twelve packs cannot disagree about a value none of them chose.

**Acceptance Criteria:**

**Given** the token set
**When** a pack is authored
**Then** **every token is either COMPUTED or AUTHORED and Appendix D says which per row** — there is no third
state, and a new token enters Appendix D marked one or the other
**And** values that **follow** from colours the pack already declares — on-contrast text, dark elevation, scrim
strength defaults, tabular figures, pill radius defaults, drop-cap ratio — are **computed by the token system and
never asked for**
**And** the author is asked only for the handful that are genuine judgement, such as scrim strength and pill
radius — two or three real decisions per pack rather than twelve
**And** the token set per pack is colours × 2 modes (background, surface, text, muted text, border, accent,
on-accent), heading and body font from the curated pool, radius scale (Sharp/Soft/Round), spacing density
(Compact/Comfortable/Airy — **a pack-level token, distinct from the per-section Vertical spacing scale**), site
width (Narrow/Normal/Wide) and gutters (**Tight/Normal/Loose — its own scale, deliberately not the Vertical
spacing labels**), button style, shadow level and link style
**And** sections span the site width by default and stay responsive within it.

**FRs:** FR-E1. · **Owner test:** none (the engine).

### Story 6.2: The twelve presets and the font pool

As a user choosing a look,
I want twelve finished packs, each already dark-ready,
So that dark mode is prepaid rather than a project.

**Acceptance Criteria:**

**Given** the pack roster
**When** I browse it
**Then** **12 curated presets** ship, each with **hand-tuned paired light + dark palettes**
**And** the font pairing pool is the curated **30 Google Fonts pairings enumerated in Appendix D**, each
declaring its two families, the weights shipped, and **whether it ships as a variable or a static face** —
because all three determine `@font-face` emission and bundle size
**And** fonts are **self-hosted in generated themes at compile**, and generated themes make **no third-party font
requests**
**And** the roster matches S7a.

**FRs:** FR-E2 (the presets). · **Frame:** `S7 Style Packs.dc.html` S7a. · **Owner test:** yes.

### Story 6.3: The pack-switcher moment

As a user trying looks on,
I want the whole canvas to restyle in front of me,
So that choosing feels like a decision rather than a page load.

**Acceptance Criteria:**

**Given** a built canvas
**When** I switch Style Pack
**Then** the entire canvas restyles live in a **≤ 300 ms crossfade** — a designed moment
**And** the new pack is announced politely (UX-DR12)
**And** under `prefers-reduced-motion` the crossfade becomes an **instant state change, never a removed
affordance** (UX-DR15)
**And** the mid-switch state matches S7b.

**FRs:** FR-E2 (the moment). · **Frame:** `S7 Style Packs.dc.html` S7b. · **Owner test:** yes.

### Story 6.4: Editing tokens, per mode, with contrast checked live

As a user with a brand of my own,
I want to change any token and be warned before I break contrast,
So that I keep control and still get told when I am about to make something unreadable.

**Acceptance Criteria:**

**Given** the active pack
**When** I edit a token
**Then** **every token is user-editable per project**, with the colour pickers and the font pairing list living
**here and only here**
**And** per-mode palette editing is available
**And** token edits run a **live AA contrast check on token pairings and warn on failures — a warning, never a
block** — and responsibility transfers to the user at that point, which is what makes the transfer fair
**And** **custom packs are deliberately per-project**: there is no account-level custom pack library in v1, and
duplicating a project is how a look is carried forward
**And** the editor and creation states match S7c and S7d.

**FRs:** FR-E3. · **Frame:** `S7 Style Packs.dc.html` S7c · S7d. · **Owner test:** yes.

### Story 6.5: Mode resolution — three inputs, one precedence, one file

As every generated theme,
I want exactly one place that decides light or dark,
So that a pack change or a mode change can never break a layout.

**Acceptance Criteria:**

**Given** the compiled theme
**When** the mode is resolved
**Then** tokens compile to CSS custom properties — **light values on `:root`, dark values under one declared
selector list — and nothing else in the theme selects on mode at all**
**And** the precedence is normative: **the visitor's explicit choice wins, then the site owner's pinned setting,
then the system preference**
**And** **system preference is `@media (prefers-color-scheme: dark)`, pure CSS, so it works with JavaScript
disabled** — this is what `color_scheme: Auto` means, and Auto is not a third palette but the absence of a pin
**And** **the owner's pin is server-rendered as a body class** (`scheme-light` / `scheme-dark`), because that is
the one mode signal present in the HTML Ghost sends, and it composes with `{{body_class}}`
**And** **the visitor's override is `[data-mode]`**, set by the `mode-toggle` module and persisted for them
**And** the two markers are **layers, not rivals** — both resolve into the **same token block**
**And** **sections consume tokens exclusively**: no section stylesheet ever selects on `prefers-color-scheme`, on
a scheme class or on `data-mode`
**And** a dark override resolves to a token, and exactly one file selects on mode (AD-30).

**FRs:** FR-E4. · **Owner test:** none (a theme mechanism, visible through 6.3). · **Verification:** on the
canvas in all three states, plus a unit assertion over the emitted token block — **not on T1/T3, because the
compiler is E7's and does not exist yet.** The on-Ghost confirmation of all three states lands at the **E4/E7
joint gate (Story 7.35)**, which is where a compiled theme first reaches a real Ghost. *(Corrected by the step-6
stress test, finding F1: this line originally named T1 and T3, which E6 cannot reach.)*

### Story 6.6: Auto-branding seeds the pack

As a user who just took my brand from my site,
I want it to land in the pack,
So that the two features are one action rather than two.

**Acceptance Criteria:**

**Given** auto-branding has run
**When** the "Use your brand" card is accepted
**Then** the **accent colour and logo are seeded into the active pack**
**And** the Style panel shows the seeded values as ordinary editable tokens afterwards
**And** the flow is re-runnable later from the Style panel.

**FRs:** FR-E5. · **Frame:** `S2 Onboarding.dc.html` S2c · `S7 Style Packs.dc.html` S7c. · **Owner test:** yes.

*Exit:* live restyle < 300 ms; all 12 packs verified across the five pilot sections in both modes.

---

## Epic 7: Compiler, Deploy & Routes

A user ships: the project becomes a real, hand-editable Ghost theme that passes gscan 0/0, uploads to their own
site, activates, and can be rolled back — with their previous theme archived first, drift caught before it is
overwritten, routes uploaded automatically, and every theme setting and translation they configured emitted.

> **The first-deploy credential step is E7's** — the Staff Access Token request, its decline path, and all three
> graceful degradations behind it, because each is a deploy-time surface and none exists at connect.
> **The always-reference mechanism is E7's** — every compile emits all three dark built-ins with their fallback
> chains, in every project, which is what keeps `GS100` unreachable.
> **The E4/E7 joint compile gate is this epic's closing story (7.33).**

### Story 7.1: Theme assembly — the mechanism, and the formatting contract

As every theme Inflozo generates,
I want to be assembled without Handlebars ever being parsed,
So that the canvas and the shipped output agree by construction.

**Acceptance Criteria:**

**Given** a project doc, a Style Pack, a routes config and referenced assets
**When** the compiler runs
**Then** sections authored as annotated HTML are walked, content and control values substituted, Handlebars block
helpers injected **as HTML comment markers**, serialized with `outerHTML`, and markers and expression tokens
resolved in a final pass
**And** **Handlebars is never parsed, evaluated or printed anywhere in the product** — no partial evaluator, no
AST printer
**And** two mechanics discovered in the spike are binding: Handlebars expressions are carried through
serialization as **opaque ASCII tokens** swapped back afterwards, so expressions containing quotes survive inside
attributes; and **comment-wrapped markers are unwrapped before token substitution**, because substituting first
makes a marker Inflozo inserted indistinguishable from a comment a section author wrote
**And** **user content is emitted inert**: any Handlebars syntax a user types is escaped to literal characters
and is never interpreted by Ghost
**And** compile is a **pure function of what it was handed** (AD-14)
**And** output is hand-editable and production grade: repeating markup whose content comes from **Ghost** is
extracted into real partials **invoked with no parameters** (because `{{#foreach}}` supplies the context), while
markup whose content comes from the **design** is inlined and baked; class names derive from section names; one
organized stylesheet carries the tokens at its top; section boundaries carry comments; `package.json` is complete
**And** **the compiler emits consistently indented output directly — Prettier is not used and cannot be**, since
it throws on Ghost partial syntax and silently deletes the doctype
**And** the formatting contract is normative because NFR-6(c1)'s snapshots diff against it: **two-space
indentation**, one attribute per line once a tag exceeds the line budget, a blank line between section boundaries
and none inside them, and **`{{!-- {Layer name} · {Category} · {Design} --}}`** as the boundary comment, bound to
the same layer-name source the filename is bound to so a rename moves both together
**And** **no builder fingerprints appear anywhere in the output**
**And** the layer-name → partial slug function is **stated**, with its collision rule, because *deterministic is
not unique*: a conventional slug maps `Hero` and `HERO` to the same file.

**FRs:** FR-J1. · **Owner test:** none (no screen).

### Story 7.2: `package.json` emission

As a Ghost server receiving a theme,
I want a complete and correct manifest,
So that the theme installs, sizes images and declares its settings honestly.

**Acceptance Criteria:**

**Given** a compile
**When** `package.json` is emitted
**Then** it carries project-derived name, description and version, with **`name` lowercase matching
`^([a-z0-9]+-)*[a-z0-9]+$`**, valid semver, an RFC-valid `author.email`, and `keywords` containing
`"ghost-theme"`
**And** **`engines.ghost: ">=5.0.0"`**, because `>=6.0.0` would contradict NFR-7's public 5.x support with
nothing to catch it
**And** **`engines.ghost-api` is never emitted**, because gscan carries it as a standing warning on both the v5
and v6 specs — and the two keys are **different keys**, only the latter withheld
**And** `card_assets: { exclude: [...] }` per the designed cards, **never a blanket `true` and never `false`**
**And** `posts_per_page` from Theme Settings emitted as a **JSON number ≥ 1, coerced to integer**, because `"12"`
from a form field trips `GS010-PJ-CONF-PPP-INT` at **error** level and blocks the deploy
**And** the normative **`image_sizes` map** — `xs 150 · s 400 · m 750 · l 1200 · xl 2000` — is emitted, and
**compile asserts that every `size=` argument in emitted `.hbs` exists as a key in it**, because with no map every
sized URL silently returns the original and gscan does not validate `image_sizes` at all
**And** the **three ceilings are never conflated**: these five keys size Ghost-hosted content images, FR-J3's
`400 / 800 / 1600 + original` covers theme-bundled assets, and FR-K2 caps uploads at 2400 px
**And** `custom` carries the three dark built-ins **on every project** plus any user-defined settings,
cap-enforced.

**FRs:** FR-J2. · **Owner test:** none. · **Verification:** gscan at the pinned version against both specs.

### Story 7.3: Synthesis Defaults and the emptying rules

As a user who designed only a home page,
I want a complete, coherent theme anyway,
So that my site does not have four broken page types I never looked at.

**Acceptance Criteria:**

**Given** a project with untouched templates
**When** it compiles
**Then** **templates with no doc are synthesized per the Synthesis Defaults before assembly**, so a standard file
is never emitted empty and the defaults are not specification-only
**And** the standard set always compiled is `default.hbs` (head, fonts, tokens, header/footer partials,
`{{ghost_head}}`/`{{ghost_foot}}`, `{{body_class}}`), `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`,
`author.hbs`, `error.hbs` — and **`home.hbs` is emitted whenever the Home canvas differs from the generic post
feed**, which is the ordinary case
**And** `page.hbs` gates its title and feature-image markup on **`{{#if @page.show_title_and_feature_image}}`**,
and **that is the only property from the `@page.*` namespace the compiler may ever emit**
**And** **there is no members template family**: a designed membership page compiles to **`custom-{name}.hbs` at
the theme root** and **emits no route**; Inflozo **never emits `page-{slug}.hbs`**, because that form is matched
against the live slug, detaches silently on a retitle, and outranks the user's explicit dropdown choice
**And** membership templates compile **only when designed** — no dead files ship — and `private.hbs` and
`partials/content-cta.hbs` follow the same conditional pattern
**And** **the emptying rule is general and differs by class**: the seven synthesizable templates re-synthesize
from the defaults on the next compile; every conditional template **stops emitting entirely**; and **one class
does not stop** — a Routes Manager custom template with a route pointing at it keeps emitting even when emptied,
because a route whose template is missing raises `IncorrectUsageError` and the URL returns 500
**And** **emptying a custom template warns before it takes effect, naming the consequence**, because Ghost's own
fallback to `page.hbs` is silent and "the page still loads, wearing a different design" is exactly the failure a
user discovers weeks later
**And** **absence is the signal for an untouched template** (AD-22)
**And** the warning matches D5f.

**FRs:** FR-I1. · **Frame:** `D5 Canvas Markers and Template Switcher.dc.html` D5f. · **Owner test:** yes (the
warning).

### Story 7.4: Assets, fonts, per-design CSS and the dead-code strip

As a visitor to a generated site,
I want to download only what the page actually uses,
So that the theme is fast because it is small, not because it was minified.

**Acceptance Criteria:**

**Given** a compile
**When** assets are emitted
**Then** **only assets actually referenced** are copied into `assets/images/` with content-hashed filenames,
**each as a fixed rendition set — 400 / 800 / 1600 px plus the original** — so `srcset` has real files behind it
**And** fonts are **self-hosted**: woff2 subsets of the project's pairing bundled into `assets/fonts/` with
`@font-face` and `font-display: swap`, **preloaded**
**And** **subsetting is static, by script range, never content-driven**, because the theme renders posts written
after deploy: latin + latin-ext by default, and a project whose language falls outside that range **ships the
full face**, with the size consequence surfaced in the budget rather than silently absorbed
**And** **section CSS and JS are emitted per *design*, not per category, and both leave when the design does**
**And** the compiler **strips the CSS the placed designs cannot reach**, and the strip is **measured, not
asserted**: compile CI reports emitted CSS bytes against bytes reachable from the placed designs' selectors, and
a gap is a build warning
**And** **the strip is sound only because a design never becomes another design at render, and compile CI asserts
exactly that**: no emitted stylesheet may contain a rule reachable only under another design's root attribute
**And** global CSS is the token block + base/reset + shared primitives + `cards.css`
**And** the **theme-size budget is enforced and surfaced pre-deploy** — total zip, per-entry and uncompressed
total — because Ghost rejects oversized uploads with `COMPRESSED_TOO_LARGE`, `ENTRY_TOO_LARGE` and
`TOTAL_TOO_LARGE`; the real limits are **probed on the §4 targets** and the budget set below the lowest observed,
and a project over budget is told **which assets are responsible before it attempts a deploy**
**And** the theme stylesheet declares Ghost's two font variables (AD-18)
**And** the CSS budget of ≤ 50 KB gzipped is computed **over the subset a given template reaches**, from the
compiler's own record of which stylesheets each template pulls in, with the whole-file size reported alongside and
not the gate.

**FRs:** FR-J3. · **Frame:** `S8 Deploy.dc.html` S8b — the over-budget message surfaces in Pre-flight. · **Owner test:** yes (the over-budget message). · **Verification:** upload limits probed on
T1 and T3.

### Story 7.5: JS bundling — two files, two origins

As the zero-third-party-dependency claim,
I want Ghost's vendored card code kept in its own file,
So that the claim is literally true rather than approximately true.

**Acceptance Criteria:**

**Given** a compile
**When** JavaScript is emitted
**Then** `assets/js/main.js` carries the behaviour modules from the registry, **bundled only if used** — a module
is emitted when a design that declares it is placed and leaves when that design does — vanilla, no framework,
`defer`red
**And** **every module carries its catalog strings as `data-i18n-*` attributes on its mount element; no module
contains a visitor-facing literal**
**And** `assets/js/cards.js` is **a separate file with a separate origin** — Ghost's own MIT card behaviour,
vendored because the `card_assets` exclude drops Ghost's JS along with its CSS — emitted **only for designed
audio, video, gallery and toggle cards**, and **declared as such in the theme README**
**And** compile CI asserts by inspection of `assets/js/` that `main.js` is **repo-authored code and nothing
else**, with `cards.js` the single declared exception
**And** `size-limit` with the **`file` preset** measures the compiled `main.js` against the **40 KB brotli**
budget, as a **developer-facing warning, not a build failure**, and it never appears in the editor — the user has
no lever to pull in response to it.

**FRs:** FR-J4. · **Owner test:** none.

### Story 7.6: Ghost-correct markup

As a Ghost site,
I want markup that uses the helpers Ghost actually provides,
So that members styling, images and Portal actually work.

**Acceptance Criteria:**

**Given** emitted templates
**When** they render on Ghost
**Then** they carry `{{ghost_head}}`, `{{ghost_foot}}`, `{{body_class}}`, and **`{{post_class}}` on the wrapping
`<article>` — never on `<body>`**
**And** because `{{post_class}}` does **not** carry members-visibility classes, the theme **emits those itself**
(`{{#unless access}} post-access-{{visibility}}{{/unless}}`), or every members site silently loses its gated-card
styling
**And** no deprecated helpers are used
**And** `{{img_url}}` is paired with a **theme-authored `srcset`**, because the helper returns a single URL string
and emits no `srcset` at all — composed from `image_sizes` for Ghost content and from the rendition set for
bundled assets — with WebP and lazy loading below the fold for Ghost-hosted images
**And** Portal actions emit real `data-portal` attributes, and the paywall renders via the `content-cta.hbs`
partial at the members-only cutoff
**And** **all chrome strings emit via `{{t}}` against the shipped `locales/` files — no hard-coded visitor-facing
literals**
**And** **motion respects `prefers-reduced-motion`, gated once rather than per module**: every animating module
passes through `core`'s gate, and CSS-only continuous motion sits inside `@media (prefers-reduced-motion:
no-preference)` (UX-DR15).

**FRs:** FR-J5. · **Owner test:** none. · **Verification:** rendered on T1 and T3.

### Story 7.7: The gscan gate

As a user about to deploy,
I want errors caught here and explained in English,
So that I am never sent to a file that is not the problem.

**Acceptance Criteria:**

**Given** a compiled theme
**When** the gscan gate runs server-side
**Then** **errors block the deploy** with human-readable mapping and warnings are surfaced but deployable
**And** the target for all library output is **0 errors, 0 warnings**
**And** **one failure mode is not passed through verbatim**: a malformed `visibility` string cascades into ~19
errors including a bogus JSON-parse failure reported against a perfectly valid `package.json` — Inflozo detects
that signature and **replaces it with its own explanation naming the real cause**
**And** the mapping is **scoped to the reachable shortlist** — the rules Inflozo's own output can trip, not
gscan's full set — and **any unmapped rule falls back to a stated verbatim format** (rule code, gscan's message,
the file, a docs link), so **no compile ever surfaces a raw stack trace**
**And** **`GS100` is on the shortlist and can never fire**, because the dark built-ins are referenced on every
compile — and if a future gscan bump changes that trigger, three settings in every shipped theme go red at once,
which is why the trigger is re-proved on a fixture rather than assumed
**And** **version policy:** one pinned gscan version at or above the newest bundled by any supported target, so a
theme passing Inflozo's gate is not rejected by the target's own gate on upload; **a gscan upgrade lands only
behind a library release with a full re-run of the whole inventory, never silently**
**And** there is **one error envelope and one gscan mapping** (AD-24)
**And** the Pre-flight step matches S8b as extended.

**FRs:** FR-J6. · **Frame:** `S8 Deploy.dc.html` S8b. · **Owner test:** yes. · **Verification:** gscan 6.4.2
against both the v5 and v6 specs.

### Story 7.8: The emitted-theme quality gate

As the "marketplace-quality" claim,
I want a gate that measures what gscan does not,
So that the claim rests on something rather than on gscan's zero.

**Acceptance Criteria:**

**Given** a compiled theme
**When** the quality gate runs, **in addition to gscan and before deploy**
**Then** it asserts valid HTML; a `lang` attribute and viewport meta; correct heading order; **an accessible name
for every link and control**; `alt` handling satisfying NFR-5 on both the image-only-link and figure cases; **AA
contrast on emitted text against the Style Pack's own tokens**; the presence of every required template; **no
inline event handlers**; and CSS linting clean against the Baseline floor
**And** the gate exists because **a theme with no `lang`, no viewport, no `alt`, an inline `onclick`,
`<h4>→<h1>→<h6>` heading order, 1.5:1 body contrast and four missing templates scores 0/0 on both gscan specs**,
while Ghost's own Casper and Source each *fail* a rule
**And** **the gate stops at the edge of `{{content}}`**: its heading-order and accessible-name assertions do not
inspect the inside of a post body, because Ghost emits its own markup there and a gate that walked into it would
fail on a customer's content
**And** the gate is a **compile stage and is measured as one** (AD-34)
**And** an **image that is the sole content of a link carries a non-empty `alt`**, falling back through
`feature_image_alt` then the post title.

**FRs:** FR-J17. · **Frame:** `S8 Deploy.dc.html` S8b. · **Owner test:** yes (a failure message). ·
**Verification:** run against Casper and Source as the negative control.

### Story 7.9: Theme Settings and the custom-settings builder

As a user who wants their site owner to change something without redeploying,
I want to define Ghost theme settings from Inflozo,
So that the theme ships with knobs rather than baked values.

**Acceptance Criteria:**

**Given** the Theme Settings surface, reachable from the editor as a sibling of the Routes Manager
**When** I configure it
**Then** it carries `posts_per_page` (default 12) and the global theme config Inflozo manages, compiled into
`package.json`
**And** **every surface that mentions "posts per page" links here, never into Ghost Admin**, because
`posts_per_page` is a key in the theme's own `package.json` and **Ghost Admin has no such setting to link to**
**And** the custom settings builder lets me define name, type from **Ghost's exact five** (select / boolean /
color / image / text), options, default, Ghost Admin group (Site wide / Homepage / Post) and an optional
visibility condition on another setting
**And** **Ghost recognises exactly two `group` values** — `homepage` and `post` — and any other string is
bucketed into "Site wide" and rendered there, which is where a site-wide setting belongs; the only consequence is
a gscan **recommendation**
**And** **colour defaults must be 6-digit hex**: three-digit shorthand, named colours and a missing default each
trip an **error** and block the deploy
**And** the **20-setting cap is enforced with a visible meter**, with **3 slots and their keys reserved for the
dark built-ins in every project, Light-only included**, so user-defined settings cap at 17 and toggling dark mode
can never overflow the cap or collide with a built-in key
**And** keys are generated lowercase snake_case, select defaults are validated against options, and defaults on
image settings are disallowed
**And** **setting keys are immutable once deployed or exported** — renaming would erase the site owner's stored
value, so a rename changes the label only — and deleting a setting warns that re-creating the key would resurrect
the stored value
**And** the surface matches D6a Pro and D6b Free.

**FRs:** FR-Q1, FR-Q2. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a · D6b. · **Owner test:** yes.

### Story 7.10: Promoting a control to a Ghost Admin setting

As a user handing a site to its owner,
I want to expose one control in Ghost Admin,
So that they can change it themselves without coming back to Inflozo.

**Acceptance Criteria:**

**Given** a section control or the accent token
**When** I flag it "expose to Ghost Admin"
**Then** its Ghost type follows from what is promoted — **Toggle → boolean · Segmented / Named Select → select ·
Image Picker → image · text prop → text · accent → color** (colour promotion is **accent-only in v1**)
**And** promoting a **text prop shows an upfront confirm** — "This text won't support formatting while it's
editable in Ghost Admin — bold, italic, underline, and links will be removed and disabled" — and on confirm any
existing marks are stripped and formatting is disabled for as long as the binding exists, re-enabling when it is
removed
**And** the compiled theme reads `{{@custom.*}}` at render time instead of the baked value
**And** **shuffling away is not deleting**: moving to a design that does not declare a bound control **parks the
binding along with its value**, the setting is not emitted while that design is inactive, and returning restores
both — the warning says "this Ghost setting won't appear while this design is in use" rather than threatening loss
**And** **deleting or hiding the section is different and does warn about the binding**, and compile validation
**rejects dangling bindings**, so a theme never ships dead Ghost Admin settings or unread `{{@custom.*}}` values
**And** **promotion is visible and warned at pack switch**: a promoted value compiles as the Ghost Admin
*default* and Ghost keeps whatever the site owner stored, so switching packs restyles the canvas while the live
site keeps the owner's old accent — the Style panel shows which tokens are promoted and warns before the switch
lands
**And** promoting the accent shows a **one-time caution** — "once this lives in Ghost Admin, contrast is in your
hands"
**And** promoted colours compile as an **inline token block in `default.hbs`**, because runtime values cannot
live in static CSS
**And** the canvas previews custom settings at their defaults, **including the dark built-ins' resolved fallback
chains** — an unset dark logo previews as the light logo or the wordmark, an unset dark accent as the light
accent — because previewing the *declared* default rather than the *resolved* one would show a state visitors
never see
**And** **Ghost's comment accent colour is linked to, never written**, and the write allowlist stays at four
**And** the builder matches D6a's right column and the text-prop confirm matches D6c.

**FRs:** FR-Q3, FR-Q4. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a right column · D6c. · **Owner
test:** yes.

### Story 7.11: The three dark built-ins, always declared and always referenced

As every project, Light-only included,
I want the same three settings compiled with real fallback logic,
So that `GS100` can never fire and there is no compiler special case.

**Acceptance Criteria:**

**Given** any project
**When** it compiles
**Then** it emits **the same three built-in custom settings** — `color_scheme` (Auto/Light/Dark), **Dark accent
color** (default = the pack's hand-paired dark accent) and **Dark logo** — leaving 17 slots for user-defined
settings
**And** **`default.hbs` names each key on every compile**, so `GS100` — which fires on a `@custom` key declared
and never referenced — **can never fire**, and there is **no compiler special case**: one mechanism in the theme,
the same on every project
**And** **"referenced" means real fallback logic, not a token mention**: `dark_logo` falls back to the light
logo and then to the wordmark; the dark accent falls back to the light accent; and `color_scheme` drives the body
class the mode resolution reads
**And** a Light-only project therefore ships three settings whose logic is **present and quiet**, and the moment
its owner fills one in, in Ghost Admin, it works — **with no redeploy and no visit to Inflozo**
**And** **`color_scheme` is the single source of the site's mode and nothing offers a second selector**:
`{{comments mode=…}}` **derives** from this value rather than exposing its own control
**And** promoting the accent creates the *light* setting while its dark counterpart already exists in every
project, so both modes stay owner-controllable as a pair.

**FRs:** FR-Q5. · **Owner test:** none. · **Verification:** gscan on a Light-only fixture, both specs.

### Story 7.12: The Translations surface, `locales/` emission, and override validation

As a user publishing in German,
I want every label the theme prints to be mine,
So that a visitor never meets an English string I did not choose.

**Acceptance Criteria:**

**Given** the Translations surface, a sibling of Theme Settings
**When** I open it
**Then** it lists **the overridable catalog with English defaults** and lets me override any label in any
language
**And** **`credit.*` is not listed and is not overridable on any plan**, on Free or Pro
**And** **the theme always ships `en.json`, plus the project-language file when the project language is not
English** — because Ghost's i18n falls back to `en` **and falls back to the file**, so a theme shipping only
`de.json` would render **raw translation keys**
**And** **the two files cannot disagree by construction**: the compiler emits both from the **one** catalog in
the same pass, so the key sets are equal and only the values differ; when the project language is English there
is one file and it *is* `en.json`
**And** **language is stored on the project**, defaulted from `@site.locale` at first link, always user-editable,
and switching to a site whose locale differs **warns before the switch**, because the overrides were written in
the old language
**And** **RTL is not supported in v1**: selecting an RTL language code — or linking a site whose locale is one —
requires a **blocking acknowledgement** that generated themes are LTR-only, recorded and repeated as a pre-deploy
warning
**And** **overrides are validated on entry: validation REFUSES, it does not repair**. Braces are reserved for ICU
placeholders and **there is no way to type a literal brace at all** — the standard ICU escape `'{'` **throws**
against the bundled `intl-messageformat`, and the numeric-entity form parses but renders as a visible `&#123;`
because `{{t}}` HTML-escapes its output. So the validator **names the offending character in the user's own
string and says that braces mark a placeholder**
**And** compile **re-validates as a backstop and fails the build** rather than emitting an unparseable catalog —
because one unbalanced brace escapes ICU's own error handling and returns a **whole-page 500 across the entire
site**, not a fallback string
**And** parsing uses `@formatjs/icu-messageformat-parser`, because `zod` cannot parse ICU
**And** a consequence worth keeping: **`{{t}}` escapes, so an override cannot inject markup** — this input's risk
is the 500, not injection
**And** **the scope limit is stated plainly**: strings inside Portal, native comments and the Sodo search overlay
belong to Ghost's i18n namespaces and cannot be reached by a theme catalog
**And** the canvas renders the user's overridden strings via the `{{t}}` shim, and ZIP export includes the locale
file
**And** the surface matches B18 as re-specified.

**FRs:** FR-Q6 (the surface and `locales/` emission halves), FR-Q8. · **Frame:** `B Missing Surfaces.dc.html`
B18. · **Owner test:** yes.

### Story 7.13: The Ghost card design module and `cards.css`

As a reader of a post,
I want the author's callouts and galleries to look like the rest of the site,
So that the reading experience is designed rather than inherited.

**Acceptance Criteria:**

**Given** the Editor Cards surface
**When** I design a card
**Then** I can design **every Ghost editor card** from a surface listing the card types, showing which have been
customised, and offering **reset to Ghost's default per card**, with each panel keeping to the same 4–7 control
discipline and a live preview beside it **rendered against the style-guide fixture**
**And** **emission is `card_assets: { exclude: [...] }` naming that card, so Ghost emits nothing for it** — no
competing stylesheet, no specificity contest — and **`!important` is not the mechanism**
**And** **`card_assets: false` is forbidden**, because a card Ghost ships in a future release is not in the
exclude list and must keep Ghost's defaults rather than arriving unstyled on every user's site
**And** **excluding a card drops both its stylesheet and its JavaScript**, so the four cards whose behaviour
depends on Ghost's JS — **audio, video, gallery and toggle** — ship Inflozo's vendored MIT equivalent whenever
designed; without it players are inert, gallery proportions collapse and toggles never open
**And** **`header` and `header_v2` are separate exclude names and both must be listed**
**And** **colour controls are not offered for `header_v2`, `signup` and `cta`**, whose colours the post author
sets inline per post — a control that silently loses to an inline style is worse than no control
**And** those same three are **excluded from a Contrast Band's inversion**: a band's plane may run behind them but
their surfaces stay the author's
**And** **gallery width is Ghost's, not the treatment's** (hard-coded `kg-width-wide`), embed cards carry no width
class at all, and **the HTML card emits no wrapper element** so it cannot be a target of the Rules or Contrast
Band values
**And** **the public-preview cut is an HTML comment** (`<!--members-only-->`), not a component
**And** **card corners come from the pack's radius token and are not offered per card** — recorded as declined so
it is not proposed again
**And** icons inside a treatment are **inline SVG from the vendored Tabler set (R-104), once per use**
**And** **emission order is fixed: `cards.css` first, then the per-design stylesheets**, so per-design rules
override `cards.css` on the `.kg-*` classes they legitimately style — **A33 owns the card interiors, A25 owns the
column they sit in**
**And** excluding a card **restores gscan's Koenig rules for it**, so checking scales with what Inflozo wrote
**And** the surface matches S14a–e.

**FRs:** FR-Q7. · **Frame:** `S14 Editor Cards.dc.html` S14a–e. · **Owner test:** yes. · **Depends on E10:** the
module and its `cards.css` emission are built here; **A33's six treatments arrive in E10** and are delivered
*against* this module, which §8 requires to land first. *(Declared by the step-6 stress test, finding F3.)*

### Story 7.14: Treatment selection from Theme Settings

As a user whose project has no post-content section,
I want to style my cards anyway,
So that a treatment is never unreachable because its host is absent.

**Acceptance Criteria:**

**Given** a project with no host section for a treatment
**When** I open Theme Settings
**Then** the non-placeable treatments — Koenig card styling and pagination styling — are **selectable there**
**And** a project with no post-content section still styles its cards, and a template with no feed still carries
a pagination treatment for when one is added
**And** **emission never depends on a host section existing**, and the selection **survives that section's
removal**.

**FRs:** FR-Q9. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a. · **Owner test:** yes.

### Story 7.15: Share destinations — one ordered, site-wide list

As a reader,
I want the same share options wherever I meet them on a site,
So that two share rows never disagree.

**Acceptance Criteria:**

**Given** Theme Settings
**When** I set share destinations
**Then** a project declares **one ordered list**, and **every design that offers sharing renders that list in
that order**
**And** it is **stored as one row on the project doc**, not per section — a per-section list is how two share
rows end up disagreeing
**And** destinations are emitted as **real `<a href>` URLs built at compile from the post's own canonical URL**:
no script, no SDK, no third-party button, and the whole set works with JavaScript off
**And** **copy-link is the one destination needing a script**, and it is the `share` module's only job
**And** **Ghost's own Portal share page is not used**, and the reason is a Ghost fact: it does not exist on
Ghost 5 — where the link silently opens the **sign-in** modal — and where it does exist it is a shadow-DOM iframe
a theme cannot style, with a fixed order and no Mastodon
**And** the default list ships as an ordered set the owner may reorder or trim, and **an empty list renders no
share affordance at all** rather than an empty container.

**FRs:** FR-Q10. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a. · **Owner test:** yes.

### Story 7.16: The Routes Manager

As a user who wants a section of my site at its own URL,
I want to build collections and routes visually,
So that I never hand-write YAML.

**Acceptance Criteria:**

**Given** the Routes Manager, reachable from the template switcher
**When** I build routing
**Then** I can define **collections** — URL prefix, filter, assigned template and **a page size per collection**,
defaulting to the global `posts_per_page` — with drag-to-reorder precedence
**And** **a per-collection limit is genuinely offered**, because a `routes.yaml` route carrying an explicit
`limit:` **overwrites `@config.posts_per_page` at render time for that route**; leaving it unset emits no `limit:`
and inherits the global
**And** I can define **channels** (filtered post streams with their own path and RSS feed), **custom routes**
(static path → custom template) and taxonomy prefixes
**And** a **live YAML preview pane** and validation run before save: path collisions, unknown templates, filter
syntax, **custom-template filename collisions, and any attempt to rename a filename this project has already
deployed**
**And** the filter builder's field→NQL mappings are **normative**: tag → `tag:{slug}` · author → `author:{slug}` ·
primary tag/author → `primary_tag:`/`primary_author:` · featured → `featured:true|false` · visibility →
`visibility:{public|members|paid}` · has-feature-image → `feature_image:-null`; All/Any groups compile to `+` and
`,` with parenthesized nesting
**And** **the builder never emits redundant or nested parentheses and flattens single-child groups**, because NQL
parses `((tag:news))` into a garbage key **silently, with no error and no exception** — sibling groups are safe,
only nesting corrupts — and validation asserts this **on the emitted string**
**And** **published date is offered with relative syntax**: `published_at` with `>` `<` `>=` `<=` over an absolute
ISO date or a relative `now-{n}{d|w|M|y}` term, **offering the relative form first** because "the last 30 days" is
what a collection usually means — and Ghost **re-parses the filter per request**, so a relative filter tracks the
clock rather than freezing at compile
**And** **relative dates are a `routes.yaml` capability and not a Data-group one**, because a fixed-Count feed
with a relative filter would render a different set on every request
**And** the builder **emits NQL and never parses it**, so validation is a **round trip over what the builder
produced** — and **the round trip asserts the parsed result is the intended filter, not merely that parsing
succeeded**, since a success-only check is blind to exactly the parenthesis failure
**And** custom templates compile as `custom-{name}.hbs`, with the naming and collision scheme enforced **at the
naming step**: I type a display name, **see the derived filename and the Ghost dropdown label it will produce**,
and am refused a name colliding with another template in the project or one already deployed
**And** **renaming a deployed template is not offered at all, and the UI says why** — Ghost stores the filename on
every page that selected it and never repairs it
**And** custom templates appear in the template switcher as designable canvases, and **"+ New template" is a
shortcut that deep-links into this flow** — one creation flow, two entry points
**And** deleting a custom template or its route **warns when the template has designed content**, the canvas is
deleted with it and recoverable via undo, and an editor viewing it switches to Home with a notice
**And** with no routing the empty state is S9d's — "Your site uses Ghost's default routing. Nice and simple."
(UX-DR6) — and a YAML error is S9b's line-numbered error blocking the deploy with the reason on the Ship button
**And** the surfaces match S9a, S9b, S9d, S9c and S9e as re-specified.

**FRs:** FR-I2, FR-I3. · **Frame:** `S9 Routes.dc.html` S9a · S9b · S9c · S9d · S9e. · **Owner test:** yes.

### Story 7.17: Uploading `routes.yaml`, and the guided fallback

As a user whose site needs routing,
I want Inflozo to upload it,
So that managing routing is the value rather than being walked through Ghost's manual step.

**Acceptance Criteria:**

**Given** a project with routing and a Staff Access Token
**When** it deploys
**Then** `routes.yaml` is uploaded **automatically** via **`POST /settings/routes/yaml`**, `multipart/form-data`,
file under the field name `routes` — which works because the integration allowlist that blocks `setting: edit`
binds **integration** tokens only, while a **staff** token carries a `user_id`, skips the allowlist, and an
Administrator or Owner holds `setting: all`
**And** the upload is **immediately verified by reading the file back byte-for-byte**
**And** **the guided Labs card remains as the designed fallback** for the cases that genuinely cannot use it — no
token supplied, a revoked or rotated token, or a non-Owner connection — and it is a **designed surface, not a
warning toast**
**And** **projects that never open the Routes Manager compile with Ghost's default routing, with no exception**:
a designed membership page emits no route, so a project can ship fully designed signup, signin and member-home
pages and still deploy with **no `routes.yaml` at all**
**And** **two routes are emitted on demand and only when a design that links to them is actually placed** —
all-tags and all-authors, because Ghost serves neither natively — so a site is never given a page it does not use
**And** **`/search/` is never emitted by anyone**, `{{ghost_head exclude="search"}}` is never emitted, and **no
Inflozo design may bind ⌘K**, which sodo-search already takes — a lint rule on the emitter, not a probe
**And** the fallback card matches B16 as corrected.

**FRs:** FR-I4, FR-I5. · **Frame:** `B Missing Surfaces.dc.html` B16. · **Owner test:** yes. · **Verification:**
a real upload and byte-comparison read-back on T1 and T3 (R-82).

### Story 7.18: The deploy wizard

As a user ready to ship,
I want a wizard that compiles, checks, uploads and activates,
So that shipping is one flow with one honest outcome.

**Acceptance Criteria:**

**Given** the Ship it action (or ⌘⏎)
**When** the wizard runs
**Then** it is **4 steps normally and 6 on the first deploy to a site**, with a numbered step rail whose count
grows (UX-DR19)
**And** step 1 is the destination: the site, **"Deploy & activate" and "Deploy only" as two distinct buttons**,
and **the theme name**
**And** **Compiling and Checking are the Pre-flight step and run before "Ship it"; Ship it uploads the artefact
they produced** — one compile per deploy, on **one `deploy_jobs` row** from the first stage (AD-20), and a stale
artefact re-runs Compiling first
**And** the progress UI is **Compiling → Checking → Uploading → (Activating) → Live**, each stage announced
politely (UX-DR12)
**And** **Cancel is available during Compiling and Checking; once Uploading starts the deploy runs to
completion** — S8c greys Cancel with its reason, "Once it starts, it finishes"
**And** errors surface as **a human sentence and the action that fixes it**: auth failed → reconnect CTA; version
mismatch; Starter-plan block
**And** a successful activation ends on **Deploy Live — the product's one confetti moment** — which **respects
`prefers-reduced-motion`** (UX-DR15)
**And** the wizard requires the **edit lock**, so a stale cloud snapshot can never silently ship
**And** the screens match S8a, S8b, S8c, S8d and S8d′ on failure.

**FRs:** FR-J8 (the wizard). · **Frame:** `S8 Deploy.dc.html` S8a–d · S8d′. · **Owner test:** yes. ·
**Verification:** real deploys to T1 and T3 (R-82).

### Story 7.19: The first-deploy credential step, and its decline path

As a user being asked for Owner-level access,
I want to be told exactly what it is and what I lose by saying no,
So that I can decline and still ship.

**Acceptance Criteria:**

**Given** the first deploy to a site
**When** step 2 runs
**Then** the Staff Access Token is requested **here, where its purpose is visible in context and the user has
already seen the product work** — never at connect
**And** **the request states plainly that it is a full-Administrator credential**: it is not a scoped theme-read
grant, Ghost has no such thing, and holding it means Inflozo *could* do anything the site Owner could. Neither the
safe-installs promise nor P8 may be written as though it were narrower
**And** **an Administrator's token is enough** — `theme: all` and `setting: all` — and **the Owner is not
required**; Inflozo may verify the role with `GET /admin/users/me/?include=roles`
**And** **the decline path is a designed path, not a degradation notice**: the deploy screen states **which three
protections are being declined — the pre-Inflozo snapshot, the pre-deploy drift check and the automated
`routes.yaml` upload — once, without nagging**
**And** **deploy itself is unaffected**: the Admin API key uploads and activates a theme on its own, so **a user
may decline permanently and still ship**
**And** the token can be added later at any time from Manage keys, and adding it **enables the snapshot from that
point forward** without pretending to reconstruct one
**And** the screens match D1b and D1c declined.

**FRs:** the deploy-time half of FR-C1 (E7's by §8). · **Frame:** `D1 First-Deploy Gates.dc.html` D1b · D1c. ·
**Owner test:** yes.

### Story 7.20: The backup gate and the pre-Inflozo snapshot

As a user about to have my theme replaced,
I want my current theme archived first,
So that "safe installs" is a mechanism rather than a slogan.

**Acceptance Criteria:**

**Given** the first upload to a site — **including a deploy-only one**, because manual activation in Ghost Admin
must not bypass the safety net
**When** the snapshot runs
**Then** the currently active theme is downloaded and archived as a restorable artifact, **excluded from asset
quota and exempt from history-retention pruning**
**And** it is read with the **Staff Access Token**, because Ghost's `tokenPermissionCheck` allowlists only
`themes: ['POST','PUT']` for Custom Integration tokens, so **every `GET /themes/*` with an Admin API key returns
403 on every Ghost version and every host**
**And** a **pre-deploy gate before the first deploy to a site** asks the user to confirm they hold their own copy
of the current theme and `routes.yaml`, with **a disabled master confirm until the last row is ticked** — and the
master confirm becoming available is **announced politely**, because a button silently turning on is invisible
without it (UX-DR12)
**And** the gate **offers the two as downloads only when the token is present**, and **otherwise names the Ghost
Admin path** for each, described and linked for the connected version rather than hard-coded — it never promises
a file it cannot fetch
**And** where the token is absent or revoked the degraded path is a **designed flow, not a warning toast**: before
activation the user is told no snapshot could be captured, and that **Ghost retains the previous theme under
Settings → Design**, with guidance to reactivate it there
**And** **restore scope is signature-gated on the `package.json` marker, not the theme name**, because a user can
export a theme, rename its package and install it manually — keying on the name would let Inflozo capture its own
theme as that site's "original". **A theme carrying the marker is never captured as a snapshot.**
**And** restoring is a one-click redeploy that skips *Inflozo's* gscan gate — but **Ghost validates every upload
with its own gscan**, so an old fork can be rejected on the way back in; that case has a designed fallback too,
offering the zip as a download and pointing at Settings → Design
**And** snapshots are stored **per site record id**, survive project deletion and disconnect/reconnect, and are
offered as a download before account purge
**And** **FR-C6's 90-day orphan purge is built here** *(moved from Story 3.5 by the owner's ruling, 2026-09-09;
DW-75, AD-33)*: a snapshot whose site record has been disconnected for 90 days — the deadline **derived from
`sites.disconnected_at`**, which Story 3.5 already writes, never from `site_snapshots.purge_after` — is purged
after a notice and a download offer, and **the purge proceeds on its deadline whether or not the offer was
taken**; objects before rows, through `drainPrefix`, as `purge-accounts` does
**And** the gate matches D1d self-hosted, D1d′ with the shortcut ticked and D1e Ghost(Pro); the running and
degraded snapshot states match B12a and B12b as corrected.

**FRs:** FR-J13. · **Frame:** `D1 First-Deploy Gates.dc.html` D1d · D1d′ · D1e · `B Missing Surfaces.dc.html`
B12a · B12b. · **Owner test:** yes. · **Verification:** a real snapshot captured from T1 and restored (R-82).

### Story 7.21: Pre-deploy drift detection

As a user who hand-edited the live theme,
I want to be stopped before it is overwritten,
So that work I did outside Inflozo is never silently destroyed.

**Acceptance Criteria:**

**Given** any deploy after the first to a given site
**When** the drift check runs
**Then** it reads the live theme with the Staff Access Token and compares a **content manifest — relative path →
SHA-256 of file contents, line endings normalized** — against the manifest of what Inflozo **last deployed there**
**And** **zip bytes are never compared**, because Ghost re-zips on download and a byte comparison would report
drift on every single deploy
**And** the comparison targets **the frozen theme name for this project × site**, not merely whatever theme
happens to be active, so a user who activated something else is not misread
**And** on any difference the deploy **stops** and shows exactly which files changed, were added or were removed
— **named by the user's own layer names wherever a file is a section partial, never by raw paths** — and offers to
download the live theme before overwriting it
**And** **the check fails open**: a revoked token, a network failure, a missing theme or a 403 reports **"couldn't
verify" and the deploy proceeds** — drift is never asserted without two manifests in hand
**And** it is **skipped on the first deploy**, where there is nothing of Inflozo's to compare against
**And** the requirement is **zero false positives**, which binds the compiler as much as the check: **a compiled
filename must never change when the user changed nothing**
**And** **identity is content, not path**: every generated file carries a fingerprint, so **a layer rename
produces no drift signal at all** — a path-keyed manifest would read a rename as a deletion plus an addition
**And** the "Overwrite and ship anyway" confirm **opens with focus on the cancelling action** (UX-DR14)
**And** the three states match D3a drift found, D3b could not verify and D3c no drift — **and D3c is a passing
row, present rather than absent**.

**FRs:** FR-J16. · **Frame:** `D3 The Drift Report.dc.html` D3a · D3b · D3c. · **Owner test:** yes. ·
**Verification:** a hand-edited theme on T1 producing a real drift report (R-82).

### Story 7.22: Artifacts, retention and pinning

As a user relying on rollback,
I want to know exactly how many versions I have and keep the ones that matter,
So that a list that looks complete actually is.

**Acceptance Criteria:**

**Given** a successful compile
**When** the artifact is stored
**Then** the zip goes to a `deploy-artifacts` bucket, **excluded from the user's asset quota**, retained **last 10
per project on Pro and last 3 on Free**
**And** **the limit is stated, not implied**: the count is printed on both plans, alongside the reason it is a
real bound — **these artifacts are not regenerable**, because rebuilding an old design against today's library
produces a different theme, which is why rollback replays a stored file rather than recompiling
**And** **the history never shows a version it cannot restore**: a pruned artifact is **absent from the list,
never a greyed row with a dead Restore button**
**And** **at most N−1 versions may be pinned** — 9 of 10 on Pro, 2 of 3 on Free — **enforced in the database**, so
deploying can never be blocked by pinning
**And** the pin control therefore needs a **visible refusal with its reason** rather than a silent failure, and
**unpinning is always allowed by design**, so nobody can trap themselves
**And** **pinned versions count against the same total**
**And** **the pre-Inflozo snapshot is outside this count entirely** and is listed as the site's original theme
rather than as a version
**And** artifacts are **immutable** (NFR-4), and durability is stated per store — **Storage is not Postgres**
(AD-29).

**FRs:** FR-J7. · **Frame:** `D2 Deploy History Completed.dc.html` D2a · D2b. · **Owner test:** yes.

### Story 7.23: Deploy history, rollback and restore-to-original

As a user who just shipped something wrong,
I want one click back,
So that regret is cheap.

**Acceptance Criteria:**

**Given** deploy history per project × site
**When** I open it
**Then** each row lists version, timestamp, gscan summary and an active badge, and **any retained artifact
redeploys in one click**
**And** each row carries a **pin control** obeying the three retention rules
**And** the list carries **two rows that are not ordinary versions**: **the pre-Inflozo snapshot**, above the
versions, outside the count, actioned as **restore original**; and an **`uploaded`-but-not-`activated` row**,
shown **without an active badge** and actioned as **re-activate rather than as a recompile**
**And** **rollback is exempt from the Pro exit gating** — restoring an artifact that already ran is always
allowed, on any plan
**And** **rollback and snapshot restore redeploy stored artifacts, not the working document, so they never
require the edit lock**
**And** the Roll back confirm **opens with focus on the cancelling action** (UX-DR14)
**And** with no deploys the empty state is "Nothing shipped yet" **and the limit is stated anyway** (UX-DR6)
**And** the history is reachable from a phone, because it is what the Small Screen Notice offers
**And** the screens match S8e and D2a Pro pinning, D2b pin refusal and D2c Free.

**FRs:** FR-J9. · **Frame:** `S8 Deploy.dc.html` S8e · `D2 Deploy History Completed.dc.html` D2a · D2b · D2c. ·
**Owner test:** yes. · **Verification:** a real rollback on T1 and T3 (R-82).

### Story 7.24: Theme naming, frozen per site

As a user with several projects and sites,
I want theme names that never collide or orphan,
So that rollback history stays coherent.

**Acceptance Criteria:**

**Given** a first deploy
**When** the theme name is set
**Then** it is `inflozo-{project-slug}` with **auto-incremented semver per deploy**, shown in Ghost Admin and the
history list
**And** **the name freezes per site at the project's first deploy to that site**, each site getting its own frozen
name, and deploying the project to a different site later freezes a fresh name there
**And** **renaming the project afterwards changes its display name in Inflozo only**, so renames never orphan old
themes in Ghost Admin
**And** **the name also freezes on a deploy-only upload**, because the name is claimed the moment a theme lands
— matching the snapshot trigger, so the two rules agree by design rather than by coincidence
**And** uniqueness is scoped to what Inflozo can know: Ghost blocks `GET /themes/` for Custom Integration tokens,
so the frozen name is tracked in Inflozo's own **per-project × site binding record, exempt from artifact
pruning**, so pruning can never lose it and re-derive a fresh name
**And** a collision between two Inflozo projects on one site **auto-resolves with a slug suffix, surfaced to the
user, and never deadlocks**
**And** a collision with a theme Inflozo did not deploy cannot be detected in advance, so **the first-deploy
confirmation names the exact theme that will be created** so the user can catch it
**And** the confirm matches D1a, including its permanence line.

**FRs:** FR-J10. · **Frame:** `D1 First-Deploy Gates.dc.html` D1a. · **Owner test:** yes.

### Story 7.25: Rate limits, the compile budget and the advisory lock

As the platform,
I want deploys serialized and counted honestly,
So that a runaway is visible and two projects never interleave on one site.

**Acceptance Criteria:**

**Given** deploys and exports
**When** the limit is applied
**Then** deploys are rate-limited **10/hour per site** and are idempotent
**And** **the count is per-account over compiles, whatever they are called**, with the per-site deploy limit
sitting inside it — because export runs **the same compile pipeline** and writes a row with a null `site_id`, so a
per-site count would miss it entirely and an account could compile without limit by exporting
**And** the per-account compile budget is **billing hygiene, not capacity**, sized against a measured number —
one deploy costs $0.000427 — and sized to be invisible to every honest user
**And** **deploy + activate holds a per-site Postgres advisory lock**, so two projects targeting the same site
**serialize rather than interleave** — theme activation is globally stateful and **a rate limit is not a mutex**
**And** a failed upload **never leaves a partially active theme**
**And** **the §4 test targets are exempt from the rate limit**, because a single DoD run is 30 serialized deploys
which the limit alone would stretch past three hours before compile time.

**FRs:** FR-J11. · **Owner test:** none.

### Story 7.26: Theme ZIP export

As a user who wants to leave, or to install by hand,
I want to download my theme on any plan,
So that read-only never means locked in.

**Acceptance Criteria:**

**Given** any project
**When** I export
**Then** I download its compiled theme zip, **Free included** — **including a project that is read-only because
the account is over its Free project cap**, because read-only means not editable, never locked in
**And** a project containing Pro sections on a Free account is blocked per the exit rule, and **export gating
mirrors deploy gating exactly**
**And** **every export is recorded** — project, version, timestamp — because setting keys freeze "once deployed
**or exported**" and that rule needs a fact to test against
**And** export requires the edit lock, and from a read-only session it first prompts a take-over
**And** the exported theme includes the `locales/` files.

**FRs:** FR-J12. · **Frame:** `S8 Deploy.dc.html` S8a · S8e (Ship it ▾), and `S8 Deploy.dc.html` S8a′ where the destination is Preview-only and export replaces deploy. · **Owner test:** yes.

### Story 7.27: Library updates and the consent step

As a user redeploying a year later,
I want to be told what changed before it ships,
So that a live site never changes except through something I chose.

**Acceptance Criteria:**

**Given** a project whose last deploy used an older library
**When** I deploy
**Then** the project shows an **"Updates available"** notice with a **human-readable summary generated from a
machine-readable library changelog** — one entry per change carrying its kind (new design · superseded design ·
schema migration · catalog key · Style Pack), the ids it touches and one line of prose — **grouped by category
and naming the project's affected placed sections**
**And** "advanced beyond" is a **fact rather than a guess**, because **each deploy records its library version and
the variant manifest it shipped** on its deploy row
**And** **compiles always use the current library version** — a single live library, no per-project pinning — so
**any redeploy includes all library changes since the last deploy**, and there is no way to redeploy without them
**And** because the update is inseparable from the redeploy, **a mandatory confirm step lists the changes before
compile proceeds**
**And** **a live site never changes except through a user-initiated redeploy plus this confirmation**, with one
exemption: the compatibility redeploy, which re-ships a design that already ran — and **that exemption is narrow
and carries only the compatibility fix**, never a pending library advance, a Style Pack change or an unconfirmed
design update
**And** the deploy record **distinguishes a compatibility redeploy from a library-update redeploy**, so the two
cannot be conflated after the fact
**And** the backward-compatibility contract holds: **designs are never deleted, only superseded** — hidden from
the Picker, placed instances keep rendering — schema changes are append-only or ship a migration map, and the
string catalog is inside the contract too
**And** because designs are never deleted, **a placed section can fail to resolve only when a schema migration
fails**: that case, and only that case, degrades to **the design in the same category sharing the instance's
`bindingContext` and `compileTarget` with the greatest content-schema overlap**, with a visible notice — **never
a silent re-render, never a failed load, and no deletion path to build**
**And** user-facing copy about the library is **count-agnostic** — "hundreds of gorgeous sections" — because the
count moves monthly
**And** the notice matches B14a and the confirm matches B14b as re-specified.

**FRs:** FR-J14. · **Frame:** `B Missing Surfaces.dc.html` B14a · B14b. · **Owner test:** yes.

### Story 7.28: Credits and white-label

As a Pro user,
I want to remove the credit from my own site,
So that the theme is mine.

**Acceptance Criteria:**

**Given** a generated theme
**When** it is emitted
**Then** it includes a "Built with Inflozo" credit in **both README.md and the theme footer** by default
**And** **Pro accounts can disable both per project; Free deploys and exports always retain credits**
**And** the A3 footer sections' credit toggle **is this same per-project setting surfaced in context** —
Pro-gated, **locked on for Free with the reason shown**, "Credits stay on with the Free plan."
**And** **if a Free design has no visible footer section, the compiler appends a minimal credit line to
`default.hbs`'s footer region**
**And** what the credit *says* is not a question: `credit.*` is a locked catalog namespace on both plans
**And** the toggle matches D6a Pro and D6b Free greyed with its reason (UX-DR3).

**FRs:** FR-J15. · **Frame:** `D6 Theme Settings Completed.dc.html` D6a · D6b. · **Owner test:** yes.

### Story 7.29: Deploy-time asset bundling

As a generated theme,
I want the images it references inside it,
So that the site does not depend on Inflozo's CDN after deploy.

**Acceptance Criteria:**

**Given** a deploy
**When** the zip is assembled
**Then** referenced assets are **bundled into the zip**, and the editor serves them from the Supabase Storage CDN
before that
**And** bundled assets carry the fixed rendition set, **never Ghost's `image_sizes` map**, because Ghost never
resizes theme-bundled assets and a `srcset` built from the wrong set is a live defect
**And** nothing large crosses a function boundary (AD-13).

**FRs:** FR-K5. · **Owner test:** none. · **Verification:** a deployed theme on T1 rendering its bundled images.

### Story 7.30: The post-deploy template-binding checklist

As a user who designed a membership page,
I want to be told the one step left and exactly what to click,
So that the last step is not a thing I had to already know.

**Acceptance Criteria:**

**Given** a deploy that emitted one or more `custom-*.hbs` files
**When** it succeeds
**Then** it ends on a **"one step left" card naming each emitted template, its exact filename and the exact
dropdown label Ghost will derive from it** — the transform is fixed, so the label is **shown rather than
guessed** — with the click-path in Ghost Admin and a deep link to the page editor of the connected site
**And** **it is a checklist, not a notification**: each template has a done-state the user marks themselves
**And** **Inflozo says plainly that it cannot verify the binding**, because the assignment lives on Ghost's page
row and the Content API does not expose which template a page selected — **saying "we can't see whether you did
this" is the honest version**
**And** **it is not a modal that must be dismissed to reach the confetti** — the deploy succeeded
**And** it is reachable afterwards from the template switcher and the site card
**And** **a project whose deploy emitted no custom template never sees the flow** — which is every starter's
first deploy, so the confetti stays clean
**And** one notification is raised when the flow is unopened a day after such a deploy — **once, never again**
**And** the card matches B19 as corrected.

**FRs:** FR-I6. · **Frame:** `B Missing Surfaces.dc.html` B19. · **Owner test:** yes.

### Story 7.31: The deploy-failure email

As a user whose deploy failed while I was away,
I want to be told,
So that I find out from Inflozo rather than from my site.

**Acceptance Criteria:**

**Given** a failed deploy
**When** the failure is recorded
**Then** FR-P1's email (5) is sent via Resend
**And** **an upload that succeeded while activation failed sends no failure email**, because the theme uploaded,
the user is in the product looking at the result, and the state is recoverable in one click
**And** the outcome is also written to the notifications table by this epic (AD-25).

**FRs:** FR-P1 email (5). · **Frame:** none — a transactional email is not a drawn surface; the owner sees its in-product counterpart on `S8 Deploy.dc.html` S8d′ and in the notifications feed. · **Owner test:** yes. · **Verification:** a real forced failure on T3 and a real
Resend send (R-82).

### Story 7.32: Partial success — uploaded, not activated

As a user whose activation failed,
I want to be told the truth,
So that "failed" is not written over something that worked.

**Acceptance Criteria:**

**Given** an upload that succeeded while activation failed
**When** the outcome is recorded
**Then** it is a **partial success, not a failure**: the deploy row's `status` is **`uploaded`** and its
`activated` flag is **false**
**And** **(1)** the artifact is **retained** like any successful compile and appears in history **without an
active badge**, so a retry is a **one-click re-activation rather than a recompile**
**And** **(2)** the **theme name freezes**, because the name is claimed the moment a theme lands
**And** **(3)** the **drift baseline does not move**, because drift compares against what Inflozo last put
**live**, and an uploaded-but-inactive theme is not what visitors are served
**And** **(4)** the site's active theme is **still the previous one, untouched** — nothing is half-applied
**And** **(5)** the user is told plainly — **"Your theme is on your site but isn't live yet"** — with a
re-activate action, because "failed" would be wrong and silence would be worse
**And** **(6)** it **sends no deploy-failure email**
**And** the wizard state matches D2e, the history row matches D2d, and the deploy-only ending matches D2f —
"Uploaded on purpose, not live, with Activate one click away" (UX-DR7).

**FRs:** FR-J8 (the partial-success half). · **Frame:** `D2 Deploy History Completed.dc.html` D2d · D2e · D2f. ·
**Owner test:** yes.

### Story 7.33: Compile CI — synthetic themes over the whole library

As every category gate,
I want a nightly assembly proving the whole library still compiles,
So that a defect in a shared primitive is caught by CI rather than by a user's deploy.

**Acceptance Criteria:**

**Given** §4's statement that **compile CI needs only gscan** — no Ghost host
**When** it runs nightly
**Then** it assembles **synthetic themes covering 100% of designs** and each scans **gscan 0 errors / 0
warnings** at the pinned version, against **both the v5 and v6 specs**
**And** it asserts the checks the compiler's own stories declared but which only a whole-library run can
exercise: that **`assets/js/` contains only files authored in the Inflozo repository**, with `cards.js` the
single declared exception; that **no emitted stylesheet contains a rule reachable only under another design's
root attribute**, which is what makes the dead-CSS strip sound rather than usually-right; that **every `size=`
argument in emitted `.hbs` exists as a key in `image_sizes`**; and that **every emitted guard resolves to a real
bound field**, since a guard on an identifier that does not exist passes a presence check and renders nothing
**And** it reports **emitted CSS bytes against the bytes reachable from the placed designs' selectors**, and a
gap is a build warning
**And** it runs `size-limit` over `assets/js/main.js` at the **40 KB brotli** budget as a **developer-facing
warning, not a build failure**
**And** the **FR-J17 quality gate runs in the same lane**, so a category gate has one sheet to read.

**FRs:** none — this builds NFR-6(b). · **Owner test:** none (a CI lane). · **Verification:** gscan 6.4.2, both
specs.

### Story 7.34: The canvas-vs-real-Ghost comparison harness

As the first gated category and every one after it,
I want the real-Ghost comparison to exist before the gate that needs it,
So that the shell block does not stall on a harness scheduled for E15.

**Acceptance Criteria:**

**Given** §4's ruling that **NFR-6(c3) is a dependency of the library epics, not of hardening** — "the comparison
harness and the T1 droplet must exist before the **first** gated category — not at E15"
**When** the harness is built, here, immediately before E9 opens
**Then** it renders **the canvas against the same page deployed to a real Ghost target**, at the render matrix's
**1% threshold on its pinned renderer**, with **animations frozen** for the comparison
**And** it honours the **exclusion regions**, which are §1.2's carve-outs and are named because this is the test
that enforces them: **the post and page body** (the canvas shows the fixture, the live page shows the author's
own HTML), **Portal's floating button and Ghost's announcement strip** (both Inflozo-drawn approximations of
Ghost's own markup), **Ghost's native comments and search overlay**, and **any region the site's own code
injection touches**
**And** an **intentional change is approved in one click rather than re-baselined by hand**
**And** the cadence is set here: nightly over a **risk-weighted rotating batch sized to the serialization
budget**, such that **every design has been compared within 30 days**, front-loading the designs most likely to
diverge — anything sticky or fixed, the Koenig card treatments, member-state-dependent sections, announcement
bars and edge rails
**And** runs are **serialized per target**, because theme activation is globally stateful, so concurrent runs
queue and never interleave
**And** **the T1 droplet is confirmed available to it**, which is the other half of §4's precondition
**And** **the CI lane is a costed line item, not an aside**.

**FRs:** none — this builds NFR-6(c3). · **Owner test:** none (a harness). · **Verification:** T1 (6.58.0) and
T3 (5.130.6), a real deploy compared against a real canvas (R-82). · **Blocks:** E9 Story 9.1 cannot open until
this is done.

### Story 7.35: The E4/E7 joint compile gate — E7's closing story

As both E4 and E7,
I want one gate neither epic can pass alone,
So that "canvas and shipped output agree" is verified rather than assumed on each side.

**Acceptance Criteria:**

**Given** the five pilot sections and the finished compiler
**When** the joint gate runs
**Then** **the five pilot sections compile from the same source they render from**
**And** the compiled theme passes **gscan 0 errors / 0 warnings**
**And** it **deploys to T1–T3**
**And** the pilot project is **deployed and rolled back on all Ghost deploy targets**
**And** routes **round-trip through the guided card and verify by byte comparison of the live `routes.yaml`**
**And** **the T4 clause is deferred with T4 itself and is not an exit condition for either epic**: a deploy
attempt against T4 failing with the friendly Starter message and setting Preview-only is **carried forward to §4's
pre-launch Ghost(Pro) gate**, owned by E15
**And** **neither E4 nor E7 exits until this gate is green.**

**FRs:** the joint exit proof. · **Frame:** no new surface — the gate is walked through `S8 Deploy.dc.html` S8a–e and the five pilots' own frames. · **Owner test:** yes. · **Verification:** T1 (6.58.0) and T3 (5.130.6), real
deploys and a real rollback (R-82).

*Exit:* pilot project deployed **and rolled back on all Ghost deploy targets**; routes round-trip verified by
byte comparison; **the E4/E7 joint gate green**.

---

## Epic 8: Asset Library

A user uploads their own images once and uses them everywhere, sees exactly how much room is left, and can
replace a file behind every project that uses it.

### Story 8.1: Upload, optimise and sanitise

As a user with my own photographs,
I want them optimised in my browser before they upload,
So that my site is fast without me knowing what WebP is.

**Acceptance Criteria:**

**Given** the upload path
**When** I drag-drop or multi-select files
**Then** raster images convert to **WebP at q≈82 with a max long edge of 2400 px** through the browser's
**native `canvas.toBlob('image/webp')`**, supported by every browser inside the floor — Safari gained it in 16.4,
below the 17.2 the pin sets, so the claim has margin
**And** a bundled encoder or server-side transcode exists **only as a runtime fallback** for a browser reporting
no WebP encode support — shipping it unconditionally would add ~300 KB of wasm no supported browser needs
**And** the input cap is **10 MB per file**, and S10b's size line reads "up to 10 MB each"
**And** **SVGs are sanitised** with DOMPurify under the named configuration `USE_PROFILES: { svg: true,
svgFilters: true }` and `FORBID_TAGS: ['foreignObject','use','style','script','set','animate','handler']` —
because "sanitized with DOMPurify" without a configuration is not a specification
**And** because the client may write Storage directly, **`suggestion-images` are sanitised again server-side
before approval can be granted**, since one user's file reaches every visitor there
**And** the original filename is preserved as the display name
**And** **optimisation is destructive by design** — originals are not retained — and the UI states the trade-off:
"Images are optimized (WebP, max 2400 px); originals aren't stored"
**And** **no browser silently uploads an unoptimized original**
**And** **the drop zone is also a file input with a visible "Choose files" button**, because a drag-only upload
has no keyboard path (UX-DR10)
**And** per-file progress shows a **real byte count** (UX-DR6)
**And** the states match S10a–d and D8d.

**FRs:** FR-K2. · **Frame:** `S10 Assets.dc.html` S10a–d · `D8 Editor Below 1440.dc.html` D8d. · **Owner test:**
yes.

### Story 8.2: The library grid

As a user with a lot of images,
I want to find one,
So that the library stays usable as it grows.

**Acceptance Criteria:**

**Given** the Assets surface
**When** I open it
**Then** it is a **global per-account library used across all projects**, in a grid with search, a type filter
(Image / SVG / Logo) and sort (Newest / Name / Size)
**And** **there is no Video asset type** — A15 is embeds only, every video reaches a section as an oEmbed URL, and
**nothing fetches from the provider**: neither Inflozo's server nor the browser contacts YouTube, Vimeo or any
other provider at any point
**And** the embed card's **title, description and poster are authored fields the customer fills in** — required,
not fetched
**And** consequently **no `assets/media` directory is ever created**
**And** with nothing uploaded the empty state is the **drop zone with the accepted types** (UX-DR6)
**And** the library integrates with the editor's Image Picker.

**FRs:** FR-K1. · **Frame:** `S10 Assets.dc.html` S10a. · **Owner test:** yes.

### Story 8.3: The quota meter

As a user near my limit,
I want to see it before I hit it,
So that running out is never a surprise.

**Acceptance Criteria:**

**Given** the library page
**When** I view it
**Then** an **always-visible meter** shows usage against the plan quota — **Free 100 MB, Pro 5 GB**
**And** **upload-time enforcement** blocks an upload that would exceed the quota, with an upgrade prompt
**And** an over-quota library goes **read-only — existing files stay, uploads blocked** — until the user deletes
below the cap; **Inflozo never auto-deletes** (UX-DR7)
**And** deploy artifacts and pre-Inflozo snapshots are **excluded from the quota**.

**FRs:** FR-K3. · **Frame:** `S10 Assets.dc.html` S10a. · **Owner test:** yes.

### Story 8.4: Usage tracking and safe deletion

As a user about to delete an image,
I want to know where it is used,
So that I never blank a section by accident.

**Acceptance Criteria:**

**Given** an asset
**When** I view it
**Then** a **"Used in 3 projects" chip** is shown
**And** **usage is tracked in a server-side index recomputed when a project doc is upserted**, never derived by
scanning every doc at render time — N document scans per page load does not survive contact with a real library
**And** the index is therefore **stale by up to one cloud-sync interval**, so **delete re-verifies against the
client's live document before proceeding**, so the warning is never wrong in the direction that loses a user's
image
**And** deleting a used asset **warns and lists the affected projects**, replaces it with a placeholder in
canvases, and **compile blocks until resolved**
**And** the delete-in-use confirm is S10c's, serious, and **opens with focus on the cancelling action** (UX-DR14).

**FRs:** FR-K4. · **Frame:** `S10 Assets.dc.html` S10c. · **Owner test:** yes.

### Story 8.5: Replace, copy URL, download

As a user who updated my logo,
I want to swap the file behind the asset,
So that every project using it updates at once.

**Acceptance Criteria:**

**Given** an asset's detail view
**When** I use its actions
**Then** **Replace** swaps the file behind the asset and **every usage across all projects updates**
**And** **Copy URL** and **Download** are available
**And** a replace runs the same optimisation and sanitisation path as an upload.

**FRs:** FR-K6. · **Frame:** `S10 Assets.dc.html` S10d. · **Owner test:** yes.

*Exit:* quota enforcement and usage tracking verified end-to-end, including a replace that propagates across
projects. Deploy-time bundling is E7's, so this epic does not gate the compiler.

---

## Epic 9: The Shell Block

Every site-wide chrome design ships, plus every template the compiler emits. **Not a minimal shell.** Nothing
renders on a real Ghost site without templates, a header and a footer, so this epic is the prerequisite for
every gate that follows — and it establishes the components every later category reuses: nav, drawer, logo,
button, link column, social row, inline newsletter form.

> **A category is a run of consecutive one-session stories** (ruling R-85). The first story delivers the
> category's shared content model, its stylesheet and its first designs; each later story adds the next designs
> and their behaviour modules against that model. **Stories open in order, each only after the previous one is
> done**, the owner tests every one as it lands, and **the category's owner gate is its last story**.
>
> **A category's story run cannot open until its per-design specs exist.** Since the 2026-08-31 merge those are
> the export's own `<ID> <Name> - Spec.md` files, and `sections-inventory.md` is generated from them —
> `python3 tools/inventory-gen.py --check` printing "current" is the test, and it passes today for every category.
>
> **Sizing — ruled by the owner on 2026-09-04: four designs per story, and the first story's four are the two
> [Free] designs plus two Pro.** Every story in every category therefore carries four designs, except a final
> story taking the remainder. The Free pair ships in a category's first story, which is what makes a category
> usable by a Free account the moment its first story lands.
>
> **One imbalance, named rather than smoothed over** *(step-6 stress test, finding F4)*. **A category's first
> story does strictly more than the others** — the shared content model and the stylesheet *plus* four designs,
> against four designs alone. It is the one story in each run most likely to overrun a single session, and R-85
> puts the model and the stylesheet there deliberately, so splitting it would contradict the ruling. **A1 is
> the calibration point:** the very first story of the very first category is where this is measured. If
> Story 9.1 overruns, resize the *later* stories of each run rather than the first, and say so on the board —
> do not discover it silently thirty categories in.

### A1 · Headers — 15 designs, 4 stories

*Per-design specs: `A1 Headers - Spec.md` in the export. Frames: `A1-<n> <Name>.dc.html` and `A1-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 9.1: A1 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Headers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A1 Headers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A1 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Rail · #2 Split Rail · #3 Stacked Masthead · #4 Overlay are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A1-<n> <Name>.dc.html` — and the category's `A1-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **FR-C5's compatibility watch is built here** *(moved from Story 3.7 by the owner's ruling, 2026-09-10; **DW-87**)*, because this is the first story in which any design declares `ghostCompat` and therefore the first story in which the broadcast has anything to verify: on each Ghost release, **one broadcast to every account on every plan** — normally a confirmation that the library was verified against it using each design's `ghostCompat`, and where the release does affect shipped designs, a notice naming the affected categories and recommending a redeploy through FR-J14. It is the **one carve-out FR-P2 allows to reach email** and it **rides the "Reconnect needed" channel Story 3.7 already built** — the `notifications` rows, the email shell and the send path all exist, so this story adds a trigger and a template and no mechanism. The rows are the `ghost_compat` kind, which **AD-25 now names E9's** rather than E3's. **If this story overruns its session, this is the piece that moves to Story 9.4** — A1's owner gate — never a design: the epic's own sizing note says to resize the later stories of a run, and this is not a design

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A1); FR-C5 (the compatibility watch), FR-P2's compatibility carve-out (the one email that watch may send), FR-B7 (the `ghost_compat` rows). · **Frame:** `A1-<n> <Name>.dc.html` · `A1-0 Category Proof.dc.html`. The compatibility notice is a transactional send and an in-app row, not a drawn surface; `S3 Dashboard.dc.html` S3e + `B Missing Surfaces.dc.html` B21 are Story 13.4's reader over it. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82), plus a real Resend send for the broadcast.

#### Story 9.2: A1 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Floating Pill · #6 Drawer-First · #7 Mega Bar · #8 Utility + Nav are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A1-<n> <Name>.dc.html` — and the category's `A1-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A1). · **Frame:** `A1-<n> <Name>.dc.html` · `A1-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.3: A1 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #10 Contrast Band · #11 Side Rail · #12 Boxed are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A1-<n> <Name>.dc.html` — and the category's `A1-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A1). · **Frame:** `A1-<n> <Name>.dc.html` · `A1-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.4: A1 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Centre Nav · #14 Icon Utilities · #15 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A1-<n> <Name>.dc.html` — and the category's `A1-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A1). · **Frame:** `A1-<n> <Name>.dc.html` · `A1-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A2 · Announcement Bars — 14 designs, 4 stories

*Per-design specs: `A2 Announcement Bars - Spec.md` in the export. Frames: `A2-<n> <Name>.dc.html` and `A2-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 9.5: A2 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Announcement Bars on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A2 Announcement Bars - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A2 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Rule · #2 Split · #3 Badge · #4 Two-Line are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A2-<n> <Name>.dc.html` — and the category's `A2-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A2). · **Frame:** `A2-<n> <Name>.dc.html` · `A2-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.6: A2 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Announcement Bars on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Capture · #6 Countdown · #7 Dateline · #8 Ticker are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A2-<n> <Name>.dc.html` — and the category's `A2-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A2). · **Frame:** `A2-<n> <Name>.dc.html` · `A2-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.7: A2 — designs #9–11

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Announcement Bars on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Rotator · #10 Pill · #11 Toast are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A2-<n> <Name>.dc.html` — and the category's `A2-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A2). · **Frame:** `A2-<n> <Name>.dc.html` · `A2-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.8: A2 — designs #12–14 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Announcement Bars on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #12 Takeover · #14 Edge are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A2-<n> <Name>.dc.html` — and the category's `A2-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A2). · **Frame:** `A2-<n> <Name>.dc.html` · `A2-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A3 · Footers — 16 designs, 4 stories

*Per-design specs: `A3 Footers - Spec.md` in the export. Frames: `A3-<n> <Name>.dc.html` and `A3-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 9.9: A3 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Footers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A3 Footers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A3 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Minimal Line · #2 Columns · #3 Two-Tier · #4 Newsletter Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A3-<n> <Name>.dc.html` — and the category's `A3-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A3). · **Frame:** `A3-<n> <Name>.dc.html` · `A3-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.10: A3 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Centred Stack · #7 Big Type · #8 Sitemap are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A3-<n> <Name>.dc.html` — and the category's `A3-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A3). · **Frame:** `A3-<n> <Name>.dc.html` · `A3-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.11: A3 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Latest Posts · #10 Contact Block · #11 Colophon · #12 Card are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A3-<n> <Name>.dc.html` — and the category's `A3-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A3). · **Frame:** `A3-<n> <Name>.dc.html` · `A3-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 9.12: A3 — designs #13–16 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Tags · #14 Image Band · #15 Wrap · #16 Mini Bar are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A3-<n> <Name>.dc.html` — and the category's `A3-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A3). · **Frame:** `A3-<n> <Name>.dc.html` · `A3-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

**The Shell Block — 12 stories across 3 categories, 45 designs.** Counts derived from `tools/export-roster.py`, never restated.

*Exit:* **three owner gates passed, one per category** — Headers & Navigation, Announcement Bars, Footers, each
taken in turn and each blocking the next, exactly as a library category's gate does. **The epic does not exit on
a single shell-wide sign-off; it exits when its third gate does.**

---

## Epic 10: The Gated Library Pipeline

The remainder of the library, built **one category at a time in inventory order, beginning with Heroes**, each
behind §4's blocking owner gate.

> Same granularity rule, same gate, same sequencing — **one category at a time in inventory order beginning
> with Heroes**, each behind §4's blocking owner gate, and **no two category stories ever in flight at once**.
> Four designs per story, the first story's four being the two [Free] plus two Pro (owner, 2026-09-04).
>
> **Two ordering constraints inside this epic, both §8's.** **A25's owner gate cannot open until E7's card design
> module emits**, because a reading design assessed against Ghost's default card styling is being assessed
> against markup the finished theme will never render. And **A33's treatments are delivered against that module**,
> which must therefore land first.

### A4 · Heroes — 17 designs, 5 stories

*Per-design specs: `A4 Heroes - Spec.md` in the export. Frames: `A4-<n> <Name>.dc.html` and `A4-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.1: A4 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Heroes on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A4 Heroes - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A4 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Flush Left · #3 Split · #4 Full Bleed are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A4-<n> <Name>.dc.html` — and the category's `A4-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A4). · **Frame:** `A4-<n> <Name>.dc.html` · `A4-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.2: A4 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Heroes on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Image Under · #6 Big Type · #7 Masthead · #8 Card are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A4-<n> <Name>.dc.html` — and the category's `A4-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A4). · **Frame:** `A4-<n> <Name>.dc.html` · `A4-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.3: A4 — designs #9–11

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Heroes on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Contrast Band · #10 Video Poster · #11 Subscribe are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A4-<n> <Name>.dc.html` — and the category's `A4-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A4). · **Frame:** `A4-<n> <Name>.dc.html` · `A4-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.4: A4 — designs #12–14

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Heroes on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #12 Offset Image · #13 Latest Post · #14 Full Height are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A4-<n> <Name>.dc.html` — and the category's `A4-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A4). · **Frame:** `A4-<n> <Name>.dc.html` · `A4-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.5: A4 — designs #15–17 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Heroes on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #16 Pull Quote · #17 Slim are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A4-<n> <Name>.dc.html` — and the category's `A4-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A4). · **Frame:** `A4-<n> <Name>.dc.html` · `A4-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A5 · Features — 16 designs, 4 stories

*Per-design specs: `A5 Features - Spec.md` in the export. Frames: `A5-<n> <Name>.dc.html` and `A5-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.6: A5 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Features on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A5 Features - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A5 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Three Up · #2 Two Up · #3 Four Up · #4 Cards are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A5-<n> <Name>.dc.html` — and the category's `A5-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A5). · **Frame:** `A5-<n> <Name>.dc.html` · `A5-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.7: A5 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Features on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Rows · #7 Alternating Media · #8 Media Top are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A5-<n> <Name>.dc.html` — and the category's `A5-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A5). · **Frame:** `A5-<n> <Name>.dc.html` · `A5-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.8: A5 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Features on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Bento · #10 Contrast Band · #11 Checklist · #12 Tabs are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A5-<n> <Name>.dc.html` — and the category's `A5-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A5). · **Frame:** `A5-<n> <Name>.dc.html` · `A5-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.9: A5 — designs #13–16 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Features on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Spotlight · #14 Scroller · #15 Index · #16 Panel are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A5-<n> <Name>.dc.html` — and the category's `A5-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A5). · **Frame:** `A5-<n> <Name>.dc.html` · `A5-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A6 · CTA Banners — 15 designs, 4 stories

*Per-design specs: `A6 CTA Banners - Spec.md` in the export. Frames: `A6-<n> <Name>.dc.html` and `A6-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.10: A6 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using CTA Banners on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A6 CTA Banners - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A6 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Flush Left · #3 Split · #4 Card are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A6-<n> <Name>.dc.html` — and the category's `A6-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A6). · **Frame:** `A6-<n> <Name>.dc.html` · `A6-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.11: A6 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within CTA Banners on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Inline Form · #7 Full Bleed Image · #8 Image Split are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A6-<n> <Name>.dc.html` — and the category's `A6-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A6). · **Frame:** `A6-<n> <Name>.dc.html` · `A6-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.12: A6 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within CTA Banners on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Slim · #11 Reasons · #12 Pair are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A6-<n> <Name>.dc.html` — and the category's `A6-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A6). · **Frame:** `A6-<n> <Name>.dc.html` · `A6-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.13: A6 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within CTA Banners on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Overlap · #14 Members · #15 Signature are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A6-<n> <Name>.dc.html` — and the category's `A6-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A6). · **Frame:** `A6-<n> <Name>.dc.html` · `A6-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A7 · Pricing and Tiers — 15 designs, 4 stories

*Per-design specs: `A7 Pricing and Tiers - Spec.md` in the export. Frames: `A7-<n> <Name>.dc.html` and `A7-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.14: A7 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Pricing and Tiers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A7 Pricing and Tiers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A7 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Cards · #2 Table · #3 Stack · #4 Split Head are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A7-<n> <Name>.dc.html` — and the category's `A7-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A7). · **Frame:** `A7-<n> <Name>.dc.html` · `A7-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.15: A7 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Pricing and Tiers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Single Tier · #7 Highlight · #8 Slim Row are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A7-<n> <Name>.dc.html` — and the category's `A7-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A7). · **Frame:** `A7-<n> <Name>.dc.html` · `A7-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.16: A7 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Pricing and Tiers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Price · #10 Tabs · #11 Free and Paid · #12 Ledger are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A7-<n> <Name>.dc.html` — and the category's `A7-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A7). · **Frame:** `A7-<n> <Name>.dc.html` · `A7-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.17: A7 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Pricing and Tiers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Members · #14 Assurances · #15 Both Prices are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A7-<n> <Name>.dc.html` — and the category's `A7-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A7). · **Frame:** `A7-<n> <Name>.dc.html` · `A7-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A8 · Testimonials — 15 designs, 4 stories

*Per-design specs: `A8 Testimonials - Spec.md` in the export. Frames: `A8-<n> <Name>.dc.html` and `A8-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.18: A8 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Testimonials on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A8 Testimonials - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A8 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Single · #2 Three Up · #3 Two Up · #4 Grid are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A8-<n> <Name>.dc.html` — and the category's `A8-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A8). · **Frame:** `A8-<n> <Name>.dc.html` · `A8-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.19: A8 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Testimonials on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Wall · #6 Split Head · #7 Slider · #8 Portrait are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A8-<n> <Name>.dc.html` — and the category's `A8-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A8). · **Frame:** `A8-<n> <Name>.dc.html` · `A8-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.20: A8 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Testimonials on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Contrast Band · #10 Big Quote · #11 Faces · #12 Rows are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A8-<n> <Name>.dc.html` — and the category's `A8-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A8). · **Frame:** `A8-<n> <Name>.dc.html` · `A8-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.21: A8 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Testimonials on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Highlight · #14 Slim Line · #15 Overlap are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A8-<n> <Name>.dc.html` — and the category's `A8-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A8). · **Frame:** `A8-<n> <Name>.dc.html` · `A8-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A9 · FAQ — 14 designs, 4 stories

*Per-design specs: `A9 FAQ - Spec.md` in the export. Frames: `A9-<n> <Name>.dc.html` and `A9-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.22: A9 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using FAQ on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A9 FAQ - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A9 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Accordion · #2 Two Column · #3 Open List · #4 Cards are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A9-<n> <Name>.dc.html` — and the category's `A9-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A9). · **Frame:** `A9-<n> <Name>.dc.html` · `A9-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.23: A9 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within FAQ on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Grouped · #7 Index · #8 Contrast Band are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A9-<n> <Name>.dc.html` — and the category's `A9-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A9). · **Frame:** `A9-<n> <Name>.dc.html` · `A9-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.24: A9 — designs #9–11

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within FAQ on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Numbered · #10 Image Split · #11 Tabs are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A9-<n> <Name>.dc.html` — and the category's `A9-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A9). · **Frame:** `A9-<n> <Name>.dc.html` · `A9-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.25: A9 — designs #12–14 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within FAQ on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Slim · #14 Ask are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A9-<n> <Name>.dc.html` — and the category's `A9-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A9). · **Frame:** `A9-<n> <Name>.dc.html` · `A9-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A10 · Stats and Numbers — 15 designs, 4 stories

*Per-design specs: `A10 Stats and Numbers - Spec.md` in the export. Frames: `A10-<n> <Name>.dc.html` and `A10-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.26: A10 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Stats and Numbers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A10 Stats and Numbers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A10 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Row · #2 Cards · #3 Grid · #4 Single are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A10-<n> <Name>.dc.html` — and the category's `A10-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A10). · **Frame:** `A10-<n> <Name>.dc.html` · `A10-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.27: A10 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Stats and Numbers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Lead Stat · #6 Split Head · #7 Contrast Band · #8 Ledger are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A10-<n> <Name>.dc.html` — and the category's `A10-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A10). · **Frame:** `A10-<n> <Name>.dc.html` · `A10-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.28: A10 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Stats and Numbers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Bars · #10 Image Split · #11 Inline · #12 Sourced are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A10-<n> <Name>.dc.html` — and the category's `A10-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A10). · **Frame:** `A10-<n> <Name>.dc.html` · `A10-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.29: A10 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Stats and Numbers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Slim · #14 Change · #15 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A10-<n> <Name>.dc.html` — and the category's `A10-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A10). · **Frame:** `A10-<n> <Name>.dc.html` · `A10-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A11 · Logo Walls — 15 designs, 4 stories

*Per-design specs: `A11 Logo Walls - Spec.md` in the export. Frames: `A11-<n> <Name>.dc.html` and `A11-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.30: A11 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Logo Walls on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A11 Logo Walls - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A11 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Row · #2 Caption Row · #3 Grid · #4 Boxed are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A11-<n> <Name>.dc.html` — and the category's `A11-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A11). · **Frame:** `A11-<n> <Name>.dc.html` · `A11-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.31: A11 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Logo Walls on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Cards · #6 Split Head · #7 Contrast Band · #8 Marquee are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A11-<n> <Name>.dc.html` — and the category's `A11-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A11). · **Frame:** `A11-<n> <Name>.dc.html` · `A11-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.32: A11 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Logo Walls on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Rail · #10 Slim · #11 Named · #12 Tiers are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A11-<n> <Name>.dc.html` — and the category's `A11-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A11). · **Frame:** `A11-<n> <Name>.dc.html` · `A11-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.33: A11 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Logo Walls on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Dense · #14 Inline · #15 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A11-<n> <Name>.dc.html` — and the category's `A11-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A11). · **Frame:** `A11-<n> <Name>.dc.html` · `A11-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A12 · About and Team — 15 designs, 4 stories

*Per-design specs: `A12 About and Team - Spec.md` in the export. Frames: `A12-<n> <Name>.dc.html` and `A12-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.34: A12 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using About and Team on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A12 About and Team - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A12 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Grid · #2 Cards · #3 Rows · #4 Story and Team are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A12-<n> <Name>.dc.html` — and the category's `A12-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A12). · **Frame:** `A12-<n> <Name>.dc.html` · `A12-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.35: A12 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within About and Team on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Portraits · #7 Contrast Band · #8 Founder are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A12-<n> <Name>.dc.html` — and the category's `A12-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A12). · **Frame:** `A12-<n> <Name>.dc.html` · `A12-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.36: A12 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within About and Team on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Faces · #10 Directory · #11 Slim · #12 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A12-<n> <Name>.dc.html` — and the category's `A12-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A12). · **Frame:** `A12-<n> <Name>.dc.html` · `A12-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.37: A12 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within About and Team on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Rail · #14 Reveal · #15 Groups are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A12-<n> <Name>.dc.html` — and the category's `A12-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A12). · **Frame:** `A12-<n> <Name>.dc.html` · `A12-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A13 · Process — 15 designs, 4 stories

*Per-design specs: `A13 Process - Spec.md` in the export. Frames: `A13-<n> <Name>.dc.html` and `A13-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.38: A13 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Process on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A13 Process - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A13 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Three Up · #2 Track · #3 Rows · #4 Cards are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A13-<n> <Name>.dc.html` — and the category's `A13-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A13). · **Frame:** `A13-<n> <Name>.dc.html` · `A13-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.39: A13 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Process on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Contrast Band · #7 Alternating Media · #8 Rail are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A13-<n> <Name>.dc.html` — and the category's `A13-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A13). · **Frame:** `A13-<n> <Name>.dc.html` · `A13-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.40: A13 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Process on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Numbers · #10 Panel · #11 Walkthrough · #12 Media Top are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A13-<n> <Name>.dc.html` — and the category's `A13-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A13). · **Frame:** `A13-<n> <Name>.dc.html` · `A13-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.41: A13 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Process on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Slim Bar · #14 Index · #15 Sticky Rail are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A13-<n> <Name>.dc.html` — and the category's `A13-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A13). · **Frame:** `A13-<n> <Name>.dc.html` · `A13-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A14 · Galleries — 15 designs, 4 stories

*Per-design specs: `A14 Galleries - Spec.md` in the export. Frames: `A14-<n> <Name>.dc.html` and `A14-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.42: A14 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Galleries on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A14 Galleries - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A14 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Grid · #2 Masonry · #3 Mosaic · #4 Panel are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `lightbox` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A14-<n> <Name>.dc.html` — and the category's `A14-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A14). · **Frame:** `A14-<n> <Name>.dc.html` · `A14-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.43: A14 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Galleries on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Contrast Band · #7 Carousel · #8 Filmstrip are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `lightbox`, `carousel + lightbox` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A14-<n> <Name>.dc.html` — and the category's `A14-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A14). · **Frame:** `A14-<n> <Name>.dc.html` · `A14-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.44: A14 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Galleries on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Full Bleed · #10 Lead and Grid · #11 Overlay · #12 Captioned Rows are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `lightbox` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A14-<n> <Name>.dc.html` — and the category's `A14-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A14). · **Frame:** `A14-<n> <Name>.dc.html` · `A14-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.45: A14 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Galleries on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Contact Sheet · #14 Index · #15 Boxed are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `lightbox` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A14-<n> <Name>.dc.html` — and the category's `A14-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A14). · **Frame:** `A14-<n> <Name>.dc.html` · `A14-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A15 · Video and Embeds — 15 designs, 4 stories

*Per-design specs: `A15 Video and Embeds - Spec.md` in the export. Frames: `A15-<n> <Name>.dc.html` and `A15-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.46: A15 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Video and Embeds on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A15 Video and Embeds - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A15 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Player · #2 Split · #3 Panel · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `video-facade` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A15-<n> <Name>.dc.html` — and the category's `A15-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A15). · **Frame:** `A15-<n> <Name>.dc.html` · `A15-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.47: A15 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Video and Embeds on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Full Bleed · #6 Cover · #7 Grid · #8 Lead and Grid are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `video-facade` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A15-<n> <Name>.dc.html` — and the category's `A15-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A15). · **Frame:** `A15-<n> <Name>.dc.html` · `A15-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.48: A15 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Video and Embeds on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Carousel · #10 Playlist · #11 Chapters · #12 Embed Card are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `carousel + video-facade`, `tabs + video-facade`, `video-facade` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A15-<n> <Name>.dc.html` — and the category's `A15-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A15). · **Frame:** `A15-<n> <Name>.dc.html` · `A15-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.49: A15 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Video and Embeds on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Thumb Rows · #14 Slim Bar · #15 Tabs are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `video-facade`, `tabs + video-facade` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A15-<n> <Name>.dc.html` — and the category's `A15-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A15). · **Frame:** `A15-<n> <Name>.dc.html` · `A15-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A16 · Contact — 15 designs, 4 stories

*Per-design specs: `A16 Contact - Spec.md` in the export. Frames: `A16-<n> <Name>.dc.html` and `A16-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.50: A16 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Contact on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A16 Contact - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A16 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Split · #2 Centred · #3 Card · #4 Panel are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `contact-form req.` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A16-<n> <Name>.dc.html` — and the category's `A16-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A16). · **Frame:** `A16-<n> <Name>.dc.html` · `A16-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.51: A16 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Contact on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Details Grid · #7 Map Split · #8 Locations are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `contact-form req.`, `none` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A16-<n> <Name>.dc.html` — and the category's `A16-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A16). · **Frame:** `A16-<n> <Name>.dc.html` · `A16-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.52: A16 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Contact on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Slim Bar · #10 Big Type · #11 Enquiry Types · #12 Boxed are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `none`, `contact-form req.` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A16-<n> <Name>.dc.html` — and the category's `A16-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A16). · **Frame:** `A16-<n> <Name>.dc.html` · `A16-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.53: A16 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Contact on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Directory · #14 Reasons · #15 Cover are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `none`, `contact-form req.` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A16-<n> <Name>.dc.html` — and the category's `A16-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A16). · **Frame:** `A16-<n> <Name>.dc.html` · `A16-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A17 · Post Grids — 18 designs, 5 stories

*Per-design specs: `A17 Post Grids - Spec.md` in the export. Frames: `A17-<n> <Name>.dc.html` and `A17-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.54: A17 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Post Grids on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A17 Post Grids - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A17 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Three Up · #2 Two Up · #3 Four Up · #4 Cards are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None; core is assumed by the theme and never declared per design. Edit-safe: yes — nothing on this design moves`, `loads o`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; both 636 cells`, `their excerpts and their meta are server-r`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical`, `including the stress frame's short last row.`, `None. Edit-safe: yes — the hover shadow is a CSS transition on the card and does not run while a card is being edited. J` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A17-<n> <Name>.dc.html` — and the category's `A17-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A17). · **Frame:** `A17-<n> <Name>.dc.html` · `A17-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.55: A17 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Grids on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Lead and Grid · #6 Split Head · #7 Contrast Band · #8 Overlay are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None. Edit-safe: yes — the lead is a grid-column placement`, `not a script. JS off: pixel-identical`, `lead cell included.`, `None. Edit-safe: yes — Head sticky is CSS position: sticky`, `not a module. JS off: pixel-identical; the head stays beside`, `None. Edit-safe: yes — the inversion is a token substitution. JS off: pixel-identical`, `band and all.`, `None. Edit-safe: yes — the scrim is a CSS gradient over a server-rendered image. JS off: pixel-identical; title`, `tag and` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A17-<n> <Name>.dc.html` — and the category's `A17-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A17). · **Frame:** `A17-<n> <Name>.dc.html` · `A17-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.56: A17 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Grids on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Ledger · #11 Masonry · #12 Bento are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; the design is type and hairlines. typewriter considered an`, `None. Edit-safe: yes — nothing sorts`, `filters or measures. JS off: pixel-identical; every row`, `its tag and its abbreviat`, `None — and this is where that claim is worth most`, `because the layout it imitates normally cannot make it: three server-`, `None. Edit-safe: yes — the composition is grid-template-columns`, `explicit grid-row spans`, `aspect-ratio boxes and a grid-` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A17-<n> <Name>.dc.html` — and the category's `A17-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A17). · **Frame:** `A17-<n> <Name>.dc.html` · `A17-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.57: A17 — designs #13–15

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Grids on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Thumb Side · #14 Dense · #15 Filtered are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None. Edit-safe: yes — Thumbnail side Right is row-reverse and nothing else in the row moves. JS off: pixel-identical. l`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; a wall of 196 px cells is markup and one grid rule. The th`, `filter-strip. Edit-safe: yes — the module only marks the current pill`, `at every width; the scrollable row below 767 is n` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A17-<n> <Name>.dc.html` — and the category's `A17-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A17). · **Frame:** `A17-<n> <Name>.dc.html` · `A17-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.58: A17 — designs #16–18 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Grids on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #16 Load More · #17 Panel · #18 Edge to Edge are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `load-more. Edit-safe: no — it appends posts the editor did not place. JS off`, `quoted: "Ghost's numbered /page/2/ paginat`, `None. Edit-safe: yes — the panel is a container`, `not a behaviour. JS off: pixel-identical; the full-bleed band below 767`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; the band`, `its zero gutter and its scrim at Text Over are C` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A17-<n> <Name>.dc.html` — and the category's `A17-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A17). · **Frame:** `A17-<n> <Name>.dc.html` · `A17-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A18 · Post Lists — 15 designs, 4 stories

*Per-design specs: `A18 Post Lists - Spec.md` in the export. Frames: `A18-<n> <Name>.dc.html` and `A18-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.59: A18 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Post Lists on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A18 Post Lists - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A18 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Rows · #2 Thumb Rows · #3 Slim · #4 Dated are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None; core is assumed by the theme and never declared per design. Edit-safe: yes — nothing runs. JS off: pixel-identical`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical (loading="lazy" is HTML`, `not a script). lightbox refused —`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical — the truncation is CSS. filter-strip considered and not de`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; the date column is server-rendered from each post's publis` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A18-<n> <Name>.dc.html` — and the category's `A18-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A18). · **Frame:** `A18-<n> <Name>.dc.html` · `A18-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.60: A18 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Lists on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Grouped · #6 Split Head · #7 Contrast Band · #8 Row Cards are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `group-headings — Ghost cannot tell that the month changed between two posts`, `so the headings are cut in by the browser f`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical. Sticky head refused`, `as in A8`, `6 and A17`, `6.`, `None. Edit-safe: yes — the inversion is a token substitution. JS off: pixel-identical. Print: on white`, `without the band`, `None. Edit-safe: yes — the lift does not run while editing. JS off: pixel-identical — the hover lift is a CSS transition` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A18-<n> <Name>.dc.html` — and the category's `A18-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A18). · **Frame:** `A18-<n> <Name>.dc.html` · `A18-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.61: A18 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Lists on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Lead and List · #11 Numbered · #12 Panel are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None. Edit-safe: yes — nothing runs. JS off: pixel-identical. reveal and typewriter both considered and refused.`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; the lead and its picture are server-rendered. lightbox not`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical — the numerals are rendered into the markup`, `not by a CSS c`, `None. Edit-safe: yes — the panel is a container`, `not a behaviour. JS off: pixel-identical. accordion considered and refu` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A18-<n> <Name>.dc.html` — and the category's `A18-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A18). · **Frame:** `A18-<n> <Name>.dc.html` · `A18-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.62: A18 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Lists on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Timeline · #14 Index · #15 Load More are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `None. Edit-safe: yes — nothing runs. JS off: pixel-identical; the rail`, `the markers and the dates are markup and CSS. sc`, `None. Edit-safe: yes — nothing runs. JS off: pixel-identical — and Alphabetical is server-side`, `so it needs none. filter`, `load-more. Edit-safe: no — it appends rows the editor did not place; the module does not run while editing`, `so the edito` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A18-<n> <Name>.dc.html` — and the category's `A18-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A18). · **Frame:** `A18-<n> <Name>.dc.html` · `A18-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A19 · Featured and Spotlight — 15 designs, 4 stories

*Per-design specs: `A19 Featured and Spotlight - Spec.md` in the export. Frames: `A19-<n> <Name>.dc.html` and `A19-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.63: A19 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Featured and Spotlight on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A19 Featured and Spotlight - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A19 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Split · #2 Full Bleed · #3 Card · #4 Poster are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A19-<n> <Name>.dc.html` — and the category's `A19-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A19). · **Frame:** `A19-<n> <Name>.dc.html` · `A19-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.64: A19 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Featured and Spotlight on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Big Type · #7 Overlap · #8 Lead and Two are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A19-<n> <Name>.dc.html` — and the category's `A19-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A19). · **Frame:** `A19-<n> <Name>.dc.html` · `A19-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.65: A19 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Featured and Spotlight on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Alternating · #10 Pair · #11 Lead and Rail · #12 Picks are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A19-<n> <Name>.dc.html` — and the category's `A19-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A19). · **Frame:** `A19-<n> <Name>.dc.html` · `A19-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.66: A19 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Featured and Spotlight on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Quote · #14 Slim · #15 Carousel are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A19-<n> <Name>.dc.html` — and the category's `A19-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A19). · **Frame:** `A19-<n> <Name>.dc.html` · `A19-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A20 · Tag Collections — 15 designs, 4 stories

*Per-design specs: `A20 Tag Collections - Spec.md` in the export. Frames: `A20-<n> <Name>.dc.html` and `A20-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.67: A20 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Tag Collections on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A20 Tag Collections - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A20 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Chips · #2 Tiles · #3 Cards · #4 Rows are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A20-<n> <Name>.dc.html` — and the category's `A20-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A20). · **Frame:** `A20-<n> <Name>.dc.html` · `A20-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.68: A20 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Tag Collections on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split Head · #6 Contrast Band · #7 Index · #8 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `group-headings` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A20-<n> <Name>.dc.html` — and the category's `A20-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A20). · **Frame:** `A20-<n> <Name>.dc.html` · `A20-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.69: A20 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Tag Collections on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Rail · #10 Lead and Rest · #11 Ledger · #12 Panel are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `carousel` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A20-<n> <Name>.dc.html` — and the category's `A20-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A20). · **Frame:** `A20-<n> <Name>.dc.html` · `A20-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.70: A20 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Tag Collections on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Overlay · #14 Slim · #15 Filter Bar are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `filter-strip` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A20-<n> <Name>.dc.html` — and the category's `A20-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A20). · **Frame:** `A20-<n> <Name>.dc.html` · `A20-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A21 · Author Showcases — 15 designs, 4 stories

*Per-design specs: `A21 Author Showcases - Spec.md` in the export. Frames: `A21-<n> <Name>.dc.html` and `A21-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.71: A21 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Author Showcases on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A21 Author Showcases - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A21 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Grid · #2 Cards · #3 Rows · #4 Split Head are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A21-<n> <Name>.dc.html` — and the category's `A21-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A21). · **Frame:** `A21-<n> <Name>.dc.html` · `A21-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.72: A21 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Author Showcases on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Founder · #7 Panel · #8 Faces are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A21-<n> <Name>.dc.html` — and the category's `A21-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A21). · **Frame:** `A21-<n> <Name>.dc.html` · `A21-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.73: A21 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Author Showcases on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Directory · #11 Rail · #12 Carousel are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `group-headings at On`, `carousel` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A21-<n> <Name>.dc.html` — and the category's `A21-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A21). · **Frame:** `A21-<n> <Name>.dc.html` · `A21-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.74: A21 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Author Showcases on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Lead and Rest · #14 Image Band · #15 Slim are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A21-<n> <Name>.dc.html` — and the category's `A21-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A21). · **Frame:** `A21-<n> <Name>.dc.html` · `A21-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A22 · Newsletter — 16 designs, 4 stories

*Per-design specs: `A22 Newsletter - Spec.md` in the export. Frames: `A22-<n> <Name>.dc.html` and `A22-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.75: A22 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Newsletter on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A22 Newsletter - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A22 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Inline Row · #2 Card · #3 Split · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A22-<n> <Name>.dc.html` — and the category's `A22-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A22). · **Frame:** `A22-<n> <Name>.dc.html` · `A22-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.76: A22 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Newsletter on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Panel · #6 Image Split · #7 Cover · #8 Big Type are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A22-<n> <Name>.dc.html` — and the category's `A22-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A22). · **Frame:** `A22-<n> <Name>.dc.html` · `A22-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.77: A22 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Newsletter on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Slim Bar · #10 Choice · #11 Reasons · #12 Issue Preview are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A22-<n> <Name>.dc.html` — and the category's `A22-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A22). · **Frame:** `A22-<n> <Name>.dc.html` · `A22-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.78: A22 — designs #13–16 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Newsletter on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Boxed · #14 Slide-in Card · #15 Two Up · #16 Quote are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `slide-in-card` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A22-<n> <Name>.dc.html` — and the category's `A22-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A22). · **Frame:** `A22-<n> <Name>.dc.html` · `A22-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A24 · Post Headers — 16 designs, 4 stories

*Per-design specs: `A24 Post Headers - Spec.md` in the export. Frames: `A24-<n> <Name>.dc.html` and `A24-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.79: A24 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Post Headers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A24 Post Headers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A24 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Flush Left · #3 Split · #4 Image Top are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A24-<n> <Name>.dc.html` — and the category's `A24-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A24). · **Frame:** `A24-<n> <Name>.dc.html` · `A24-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.80: A24 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Full Bleed · #6 Edge to Edge · #7 Card · #8 Contrast Band are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A24-<n> <Name>.dc.html` — and the category's `A24-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A24). · **Frame:** `A24-<n> <Name>.dc.html` · `A24-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.81: A24 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Overlap · #10 Big Type · #11 Dateline · #12 Rail are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A24-<n> <Name>.dc.html` — and the category's `A24-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A24). · **Frame:** `A24-<n> <Name>.dc.html` · `A24-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.82: A24 — designs #13–16 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Sticky · #14 Share Row · #15 Slim · #16 Two Column are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `reading-progress + header-scroll`, `share` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A24-<n> <Name>.dc.html` — and the category's `A24-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A24). · **Frame:** `A24-<n> <Name>.dc.html` · `A24-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A25 · Post Content Layouts — 12 designs, 3 stories

*Per-design specs: `A25 Post Content Layouts - Spec.md` in the export. Frames: `A25-<n> <Name>.dc.html` and `A25-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.83: A25 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Post Content Layouts on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A25 Post Content Layouts - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A25 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Measured · #2 Plain · #3 Sheet · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `toc`, `heading anchor` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A25-<n> <Name>.dc.html` — and the category's `A25-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A25). · **Frame:** `A25-<n> <Name>.dc.html` · `A25-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.84: A25 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Content Layouts on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Full Bleed · #6 Hanging Heads · #7 Sticky Index · #8 Index Top are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `lightbox`, `heading anchor`, `toc scroll-spy`, `toc` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A25-<n> <Name>.dc.html` — and the category's `A25-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A25). · **Frame:** `A25-<n> <Name>.dc.html` · `A25-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.85: A25 — designs #9–12 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Content Layouts on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Share Rail · #10 Marginalia · #11 Ruled · #12 Numbered are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `heading anchor` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A25-<n> <Name>.dc.html` — and the category's `A25-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A25). · **Frame:** `A25-<n> <Name>.dc.html` · `A25-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A26 · Post Footers — 15 designs, 4 stories

*Per-design specs: `A26 Post Footers - Spec.md` in the export. Frames: `A26-<n> <Name>.dc.html` and `A26-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.86: A26 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Post Footers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A26 Post Footers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A26 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Author Bio · #2 Rows · #3 Card · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `share`, `share member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A26-<n> <Name>.dc.html` — and the category's `A26-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A26). · **Frame:** `A26-<n> <Name>.dc.html` · `A26-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.87: A26 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Split · #6 Slim · #7 Next and Prev · #8 Tag Row are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `share member-form`, `share` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A26-<n> <Name>.dc.html` — and the category's `A26-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A26). · **Frame:** `A26-<n> <Name>.dc.html` · `A26-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.88: A26 — designs #9–12

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Share Row · #10 Big Type · #11 Portrait · #12 Subscribe are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `share`, `member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A26-<n> <Name>.dc.html` — and the category's `A26-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A26). · **Frame:** `A26-<n> <Name>.dc.html` · `A26-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.89: A26 — designs #13–15 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Post Footers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #13 Rail · #14 Ledger · #15 Grid are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `share`, `share member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A26-<n> <Name>.dc.html` — and the category's `A26-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A26). · **Frame:** `A26-<n> <Name>.dc.html` · `A26-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A27 · Related Posts — 12 designs, 3 stories

*Per-design specs: `A27 Related Posts - Spec.md` in the export. Frames: `A27-<n> <Name>.dc.html` and `A27-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.90: A27 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Related Posts on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A27 Related Posts - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A27 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Three Up · #2 Rows · #3 Thumb Rows · #4 Panel are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A27-<n> <Name>.dc.html` — and the category's `A27-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A27). · **Frame:** `A27-<n> <Name>.dc.html` · `A27-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.91: A27 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Related Posts on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Lead and List · #7 Rail · #8 Overlay are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A27-<n> <Name>.dc.html` — and the category's `A27-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A27). · **Frame:** `A27-<n> <Name>.dc.html` · `A27-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.92: A27 — designs #9–12 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Related Posts on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Carousel · #11 Index · #12 Next Up are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `carousel` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A27-<n> <Name>.dc.html` — and the category's `A27-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A27). · **Frame:** `A27-<n> <Name>.dc.html` · `A27-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A28 · Comments — 10 designs, 3 stories

*Per-design specs: `A28 Comments - Spec.md` in the export. Frames: `A28-<n> <Name>.dc.html` and `A28-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.93: A28 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Comments on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A28 Comments - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A28 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Rule · #2 Split Head · #3 Panel · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A28-<n> <Name>.dc.html` — and the category's `A28-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A28). · **Frame:** `A28-<n> <Name>.dc.html` · `A28-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.94: A28 — designs #5–7

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Comments on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Boxed · #6 Rail · #7 Disclosure are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `accordion` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A28-<n> <Name>.dc.html` — and the category's `A28-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A28). · **Frame:** `A28-<n> <Name>.dc.html` · `A28-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.95: A28 — designs #8–10 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Comments on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #8 Prompt · #9 Big Count · #10 Slim are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A28-<n> <Name>.dc.html` — and the category's `A28-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A28). · **Frame:** `A28-<n> <Name>.dc.html` · `A28-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A29 · Archive Headers — 14 designs, 4 stories

*Per-design specs: `A29 Archive Headers - Spec.md` in the export. Frames: `A29-<n> <Name>.dc.html` and `A29-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.96: A29 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Archive Headers on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A29 Archive Headers - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A29 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Split Head · #3 Contrast Band · #4 Panel are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A29-<n> <Name>.dc.html` — and the category's `A29-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A29). · **Frame:** `A29-<n> <Name>.dc.html` · `A29-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.97: A29 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Archive Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Full Bleed · #6 Image Split · #7 Rail · #8 Bar are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A29-<n> <Name>.dc.html` — and the category's `A29-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A29). · **Frame:** `A29-<n> <Name>.dc.html` · `A29-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.98: A29 — designs #9–11

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Archive Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Boxed · #11 Filter are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `count-up`, `filter-strip` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A29-<n> <Name>.dc.html` — and the category's `A29-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A29). · **Frame:** `A29-<n> <Name>.dc.html` · `A29-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.99: A29 — designs #12–14 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Archive Headers on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #12 Portrait · #13 Index · #14 Sticky are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — none — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A29-<n> <Name>.dc.html` — and the category's `A29-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A29). · **Frame:** `A29-<n> <Name>.dc.html` · `A29-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A30 · Members Pages — 13 designs, 4 stories

*Per-design specs: `A30 Members Pages - Spec.md` in the export. Frames: `A30-<n> <Name>.dc.html` and `A30-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.100: A30 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Members Pages on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A30 Members Pages - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A30 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Split Pitch · #3 Card · #4 Panel are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A30-<n> <Name>.dc.html` — and the category's `A30-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A30). · **Frame:** `A30-<n> <Name>.dc.html` · `A30-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.101: A30 — designs #5–7

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Members Pages on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Contrast Band · #6 Cover · #7 Image Split are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `member-form` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A30-<n> <Name>.dc.html` — and the category's `A30-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A30). · **Frame:** `A30-<n> <Name>.dc.html` · `A30-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.102: A30 — designs #8–10

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Members Pages on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #8 Tiers · #9 Big Type · #10 Boxed are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `member-form`, `price-toggle` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A30-<n> <Name>.dc.html` — and the category's `A30-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A30). · **Frame:** `A30-<n> <Name>.dc.html` · `A30-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.103: A30 — designs #11–13 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Members Pages on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #11 Rail · #12 Ledger · #13 Steps are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `member-form`, `scroll-spy` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A30-<n> <Name>.dc.html` — and the category's `A30-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A30). · **Frame:** `A30-<n> <Name>.dc.html` · `A30-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A31 · Error and Utility — 10 designs, 3 stories

*Per-design specs: `A31 Error and Utility - Spec.md` in the export. Frames: `A31-<n> <Name>.dc.html` and `A31-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.104: A31 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Error and Utility on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A31 Error and Utility - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A31 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Centred · #2 Split Reason · #3 Card · #4 Boxed are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A31-<n> <Name>.dc.html` — and the category's `A31-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A31). · **Frame:** `A31-<n> <Name>.dc.html` · `A31-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.105: A31 — designs #5–7

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Error and Utility on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Panel · #6 Contrast Band · #7 Cover are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A31-<n> <Name>.dc.html` — and the category's `A31-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A31). · **Frame:** `A31-<n> <Name>.dc.html` · `A31-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.106: A31 — designs #8–10 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Error and Utility on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #8 Elsewhere · #9 Directory · #10 Display are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A31-<n> <Name>.dc.html` — and the category's `A31-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A31). · **Frame:** `A31-<n> <Name>.dc.html` · `A31-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A32 · Paywall — 12 designs, 3 stories

*Per-design specs: `A32 Paywall - Spec.md` in the export. Frames: `A32-<n> <Name>.dc.html` and `A32-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.107: A32 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Paywall on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A32 Paywall - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A32 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Fade · #2 Card · #3 Panel · #4 Contrast Band are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core`, `member-form at one value` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A32-<n> <Name>.dc.html` — and the category's `A32-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A32). · **Frame:** `A32-<n> <Name>.dc.html` · `A32-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.108: A32 — designs #5–8

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Paywall on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Boxed · #6 Split Pitch · #7 Tiers · #8 Ledger are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core`, `member-form at one value`, `price-toggle` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A32-<n> <Name>.dc.html` — and the category's `A32-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A32). · **Frame:** `A32-<n> <Name>.dc.html` · `A32-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.109: A32 — designs #9–12 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Paywall on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #9 Big Type · #10 Cover · #11 Sticky Bar · #12 Meter are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `core`, `dismiss at one value`, `reading-progress` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A32-<n> <Name>.dc.html` — and the category's `A32-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A32). · **Frame:** `A32-<n> <Name>.dc.html` · `A32-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A33 · Koenig Card Treatments — 6 designs, 2 stories

*Per-design specs: `A33 Koenig Card Treatments - Spec.md` in the export. Frames: `A33-<n> <Name>.dc.html` and `A33-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.110: A33 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Koenig Card Treatments on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A33 Koenig Card Treatments - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A33 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Plain · #2 Card · #3 Panel · #4 Wide are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `accordion`, `core` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A33-<n> <Name>.dc.html` — and the category's `A33-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A33). · **Frame:** `A33-<n> <Name>.dc.html` · `A33-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.111: A33 — designs #5–6 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Koenig Card Treatments on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Full Bleed · #6 Contrast Band are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `accordion`, `core` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A33-<n> <Name>.dc.html` — and the category's `A33-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A33). · **Frame:** `A33-<n> <Name>.dc.html` · `A33-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

### A34 · Pagination Styles — 10 designs, 3 stories

*Per-design specs: `A34 Pagination Styles - Spec.md` in the export. Frames: `A34-<n> <Name>.dc.html` and `A34-0 Category Proof.dc.html`. The category's story run opens only once `python3 tools/inventory-gen.py --check` prints "current" for it.*

#### Story 10.112: A34 — the content model, the stylesheet and designs #1–4

As a user choosing how this part of my site looks,
I want this category to exist with its first designs,
So that I can start using Pagination Styles on my own site.

**Acceptance Criteria:**

**Given** the category's per-design spec `A34 Pagination Styles - Spec.md`, which exists today
**When** this story lands
**Then** the category's **shared content model** is authored once — the `contentSchema` union every design in A34 remaps against — and it is the domain FR-D19's park-and-restore rule operates over
**And** the category's **stylesheet** is authored as plain CSS consuming Style Pack custom properties only, outside the app's build pipeline and excluded from Tailwind
**And** designs #1 Numbers · #2 Prev and Next · #3 Bar · #4 Pill are built against that model — **the category's two [Free] designs (#1 and #2) plus its first two Pro designs (#3 and #4)** (owner, 2026-09-04), so a Free user has something placeable in this category from its very first story
**And** each carries its **own per-design control schema**, whose first 3–5 entries are recovered mechanically as its Quick Controls
**And** the category's responsive collapse behaviour follows its **structural archetypes** at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `none` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A34-<n> <Name>.dc.html` — and the category's `A34-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A34). · **Frame:** `A34-<n> <Name>.dc.html` · `A34-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.113: A34 — designs #5–7

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Pagination Styles on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #5 Counter · #6 Load More · #7 Endless are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `none`, `load-more`, `infinite-scroll` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A34-<n> <Name>.dc.html` — and the category's `A34-0 Category Proof.dc.html` tokenisation proof, stress frame and roster

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A34). · **Frame:** `A34-<n> <Name>.dc.html` · `A34-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

#### Story 10.114: A34 — designs #8–10 (owner gate)

As a user choosing how this part of my site looks,
I want the next designs in this category,
So that I can choose more widely within Pagination Styles on my own site.

**Acceptance Criteria:**

**Given** the shared content model and stylesheet delivered by this category's first story
**When** this story lands
**Then** designs #8 Contrast Band · #9 Cards · #10 Slim are built **against that same model**, each with its own per-design control schema
**And** all of them are **Pro**, because `[Free]` is exactly the first two designs of the category and nothing else, and both shipped in its first story
**And** each design's collapse behaviour follows its archetype at 1440 / 834 / 390, with no horizontal overflow
**And** the behaviour modules these designs declare — `none` — are **authored beside them in this story**, never deferred to a module project, and **the story is not done while a declared module is missing its no-JS degradation statement**
**And** every design is **token-driven only**, **functional with JavaScript disabled** — the server-rendered state is the real one — and passes **WCAG 2.1 AA**
**And** each design declares a **structural descriptor tuple** whose first five slots are closed vocabularies, and **no two designs in this category share one**, asserted by `tools/tuple-check.py`
**And** each design declares its `bindingContext`, `compileTarget`, `ghostCompat`, `darkCapabilities` and `previewSeed`, and `compileTarget` is a **refusal, not a hint**
**And** each renders in the NFR-6(a) matrix, compiles into a sample theme passing gscan, holds a screenshot baseline, and passes the FR-G8 Baseline checks in **both CSS and JS**
**And** each design **matches its frame** — `A34-<n> <Name>.dc.html` — and the category's `A34-0 Category Proof.dc.html` tokenisation proof, stress frame and roster
**And** **this story carries the category's owner gate** (§4). §4's automated sheet is green across **every
design in the category**: the category deployed to a real Ghost target and rendered live; NFR-6(c3)'s
canvas-vs-real-Ghost comparison green for every design under its stated exclusions; the NFR-5 accessibility scan
green on every design; compile CI and the FR-J17 quality gate green; the NFR-6(a) render matrix green across
device widths, colour modes and Style Packs; and FR-D17's preservation check green across the category's **full
design ring** — cycle it with `[` and `]` and confirm no content prop **and no control value** is lost
**And** **then the owner, by hand, as a user**: composes a page from the category's designs, deploys it with the
product's own deploy button, views it on the live Ghost site, exercises the controls, confirms the rendered
result changes as designed, and approves
**And** **the automated sheet is a precondition for the owner's review, never a substitute for it — and his
review is never a substitute for the sheet**
**And** **the next category does not begin until this gate passes.**

**FRs:** FR-G1, FR-G4, FR-G5, FR-G6 (for A34). · **Frame:** `A34-<n> <Name>.dc.html` · `A34-0 Category Proof.dc.html`. · **Owner test:** yes. · **Verification:** deployed and rendered on T1 and T3 (R-82).

**The Gated Library Pipeline — 114 stories across 30 categories, 421 designs.** Counts derived from `tools/export-roster.py`, never restated.

*Exit:* **every** category in the epic has passed its own owner gate. There is no epic-level shortcut — the epic
exits when its last category does, and **a category that has not passed cannot be carried forward as a known
gap**.

---

## Epic 11: Starters

A user starts from a finished site rather than an empty canvas: ten complete pre-wired projects, two of them
Free end to end.

> **One story per starter.** A starter is a whole pre-wired project — Home, Post, Page, Tag, Author and 404 all
> designed, a pack chosen and sample content mapped — so each is its own build session and its own owner test.

### Story 11.1: The Free-tier floor, verified across the whole library

As a Free user,
I want something I can actually put on every canvas I can reach,
So that "Free" is a usable plan rather than a tour.

**Acceptance Criteria:**

**Given** the finished library
**When** the Free floor is verified
**Then** **every category ships at least 2 Free-tier designs, and `[Free]` is exactly the first two of every
category and nothing else** — so the total is two per category and is **derived, never restated**
**And** where a category's designs split across `compileTarget`s or `bindingContext`s, **the Free options are
distributed across those contexts rather than clustered in one**
**And** the floor is **guaranteed for every context reachable from the seven synthesizable templates and for
`private.hbs`**
**And** it is **explicitly not guaranteed** for contexts a user reaches only by opting into an optional surface —
custom page templates created in the Routes Manager, and A30's member-home surface — where a Free user may find
only Pro options
**And** that is exactly why the exit sheet must offer **"remove the section" alongside "swap to a Free design"**,
because there is not always something to swap to
**And** each category's `[Free]` marker is read **from its own roster**, never mapped positionally onto a roster
that has since lost or gained a design
**And** verification runs over the whole library, not a sample.

**FRs:** FR-G2. · **Owner test:** none (a verification pass). · **Verification:** `tools/inventory-gen.py --check`
and `tools/export-roster.py` over the finished library.

### Story 11.2: The starter chooser

As a new user,
I want to see each starter as a whole page before I pick one,
So that I choose a site rather than a thumbnail.

**Acceptance Criteria:**

**Given** the starter chooser
**When** I browse it
**Then** each starter shows a **full-page scrollable preview with a light/dark toggle, before creation**
**And** all ten are listed, filterable, with a **"Start empty" escape**
**And** **starters are seeds**: after creation the project is an ordinary project **with no linkage back**
**And** the chooser is reachable from First Run and from the New Project Sheet — one flow, two entry points
**And** the surface matches B23a, whose roster is Appendix E's since 2026-09-04.

**FRs:** FR-O2, FR-O3. · **Frame:** `B Missing Surfaces.dc.html` B23a. · **Owner test:** yes.

### The ten starters — one story each, 11.3 to 11.12

Each starter is a **complete pre-wired project**: Home, Post, Page, Tag, Author and 404 all designed, its Style
Pack pre-selected, Orbit Weekly mapped. Each is its own build session and its own owner test, and each carries
the same shape of acceptance criteria against its own composition.

#### Story 11.3: Aurora — newsletter-first personal brand

As a new user whose site is a newsletter-first personal brand,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Aurora** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Tangerine**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Signup Hero, Issue Preview, Featured Split, Post List Editorial Rules, big-ask paywall
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.4: Gazette — magazine

As a new user whose site is a magazine,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Gazette** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Ink**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Magazine Cover hero, Magazine Mixed grid, Topic Tabs, masthead authors, serif post templates
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.5: Signal — tech blog

As a new user whose site is a tech blog,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Signal** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Orbit**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Split Editorial hero, Bento grid, TOC-right posts, stats band
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.6: Foundry — startup blog + marketing home

As a new user whose site is a startup blog + marketing home,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Foundry** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Slate**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Center Stage hero, Features Bento, Logo Wall, Pricing Toggle Cards, CTA band
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.7: Quiet — ultra-minimal writer

As a new user whose site is a ultra-minimal writer,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Quiet** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Quiet**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Center Stage hero (A4 #1), Editorial Rules list (A18 #1), Narrow Classic reading (A25 #1), Author Bio Card close (A26 #1)
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** **it is composed exclusively of [Free] designs end to end**, so a Free account can ship it with **zero swaps** — asserted against the roster, not by inspection (FR-O4)
**And** the owner tests it on a deployed site.

**FRs:** FR-O1, FR-O4. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.8: Pulse — podcast

As a new user whose site is a podcast,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Pulse** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Neon**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Poster Modal hero, Episode List, platform CTA band, guest showcases
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.9: Bloom — lifestyle / food

As a new user whose site is a lifestyle / food,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Bloom** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Meadow**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Collage hero, Photo Square grid, Galleries Masonry, recipe-friendly posts
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.10: Chapter — author / book site

As a new user whose site is a author / book site,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Chapter** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Berry**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Portrait Intro hero, book spotlight, testimonial wall, mailing-list close
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.11: Ledger — business / finance publication

As a new user whose site is a business / finance publication,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Ledger** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Paper**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Split Editorial hero (A4 #2), Classic Cards grid (A17 #1), Big Number Row stats (A10 #1), Hard Stop Card paywall (A32 #2)
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** **it is composed exclusively of [Free] designs end to end**, so a Free account can ship it with **zero swaps** — asserted against the roster, not by inspection (FR-O4)
**And** the owner tests it on a deployed site.

**FRs:** FR-O1, FR-O4. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

#### Story 11.12: Studio — portfolio + blog

As a new user whose site is a portfolio + blog,
I want a starter that already looks like one,
So that I begin from a finished site rather than an empty canvas.

**Acceptance Criteria:**

**Given** the finished library
**When** **Studio** is composed
**Then** all standard templates are designed — Home, Post, Page, Tag, Author and 404 — its Style Pack **Mono**
is pre-selected, and Orbit Weekly is mapped onto it
**And** its composition is Offset Card hero, Bento gallery, About Founder Letter, project collections
**And** **it ships no membership template at all — not even an undesigned one** — so Ghost's native Portal serves
those flows, **no `routes.yaml` is emitted**, and its **first deploy needs no step in Ghost Admin beyond the theme
upload itself**: the user is never sent into Ghost's page editor for a page they did not ask for, and **the
confetti moment stays uninterrupted**
**And** it deploys **0 errors / 0 warnings on gscan to all Ghost deploy targets** (T1–T3)
**And** it is a **seed**: after creation the project is an ordinary project with **no linkage back**
**And** its tier and paywall behaviour is accepted on **T1–T3 only**, because Ghost(Pro) Starter has no paid
subscriptions, so T4 can neither create tiers nor gate a post — T4's scope is the Preview-only block path and
nothing else
**And** the owner tests it on a deployed site.

**FRs:** FR-O1. · **Frame:** the starter's canvases are composed from the library's own
frames — `<ID>-<n> <Name>.dc.html` per placed design — and it is previewed through `B Missing Surfaces.dc.html`
B23a. · **Owner test:** yes. · **Verification:** deployed to T1–T3 with a 0/0 gscan result (R-82).

*Exit:* every starter deploys **0/0 gscan to all Ghost deploy targets**; at least Quiet and Ledger are Free end to
end; the Free-tier floor verified across the whole library.

---

## Epic 12: Billing & Entitlements

A user upgrades, is billed correctly by a merchant of record, keeps every Pro capability through a 7-day grace,
and — if they downgrade — is asked to resolve what is over rather than having anything deleted.

### Story 12.1: Checkout

As a user who wants Pro,
I want to pay without a dark pattern,
So that I know what I am agreeing to.

**Acceptance Criteria:**

**Given** the upgrade path
**When** I check out
**Then** checkout is **Dodo hosted, with Dodo as merchant of record** handling taxes, at **monthly $15 / yearly
$150**
**And** it **pre-selects yearly** (two months free) with **monthly one click away, and both prices always shown —
never a dark pattern**
**And** **there is no time-boxed Pro trial**: the open canvas is the trial
**And** checkout **collects explicit consent to immediate delivery of the digital service and an explicit waiver
of the statutory withdrawal right, recorded with the order** — without which the no-refund policy is not lawfully
enforceable in EU/UK markets
**And** **on return from checkout the server verifies the subscription state directly and grants `pro_active`
without waiting for the webhook**, so a paying user is never blocked at an exit gate by webhook lag
**And** the plan mix is modelled at **60% yearly / 40% monthly**, because the same fee schedule nets materially
less per month on $150 than on $15
**And** the sheet matches S12b and Pricing matches M5.

**FRs:** FR-L1. · **Frame:** `S12 Billing.dc.html` S12b · `M5 Pricing.dc.html`. · **Owner test:** yes. ·
**Verification:** a real Dodo test-mode transaction, then live-mode (R-82).

### Story 12.2: Webhooks and the entitlement state machine

As the product's single source of who may do what,
I want one resolver driven by Dodo's real events,
So that entitlement is never inferred from an event name that does not exist.

**Acceptance Criteria:**

**Given** Dodo's actual event vocabulary
**When** a webhook arrives
**Then** it is **signature-verified and handled idempotently**, over `subscription.active`,
`subscription.renewed`, `subscription.on_hold`, `subscription.failed`, `subscription.updated`,
`payment.succeeded` and `payment.failed`
**And** **there is no documented `subscription.cancelled`**: cancellation is detected from
`subscription.updated` **plus a direct read of the subscription**, never inferred from an event name that does
not exist
**And** the transitions are `free → pro_active` · `pro_active → pro_past_due` · `pro_past_due → pro_active` ·
`pro_past_due → free` on grace expiry · `pro_active → free` **at period end** when auto-renew has stopped ·
`pro_active → free` **immediately on a dispute being opened**
**And** **the reverse edge exists, because disputes are not all fraud**: `free → pro_active` **restored by manual
support action**, recorded with the reason and the resolving Dodo event, restoring **the remainder of the original
paid term** rather than starting a new one — and the mechanism is **deliberately manual**, because auto-restoring
on an unverified event is how an account flips twice
**And** restoration **lifts every downgrade consequence at once and sends no email**, because the user asked for
it and is present when it happens
**And** a plan switch (monthly ↔ yearly) arrives as `subscription.updated` and **changes price and period only,
never entitlement**
**And** **the 7-day grace is Inflozo's own window, reconciled against Dodo's `on_hold` state rather than assumed
equal to it**
**And** policy: **no refunds and no mid-cycle cancellation** — cancelling stops auto-renew, access continues to
the end of the paid period, then downgrades
**And** **Inflozo never auto-deletes anything, on any path**
**And** there is **one entitlement resolver and one exit gate** (AD-28), and `entitlements` has exactly three
states — `free`, `pro_active`, `pro_past_due` — with **`pro_past_due` never shown as a plan**.

**FRs:** FR-L2. · **Owner test:** none (a state machine). · **Verification:** real Dodo events replayed against
the live webhook endpoint, with one negative control (R-82).

### Story 12.3: The exit gates and the Pro-sections sheet

As a Free user who has been playing with Pro sections,
I want to be told exactly what is blocking me and what I can do about each one,
So that the sheet gives me a way out rather than only a price.

**Acceptance Criteria:**

**Given** a project containing Pro sections on a Free account
**When** I deploy, export, or open any surface exposing compiled theme code
**Then** it **blocks**, with an itemised "Pro sections in this design" sheet offering **per item a remediation
that actually exists for that item**
**And** **placeable sections get three**: upgrade · **swap to a Free design via Shuffle** · **remove it** — and
the third is not decorative, because some binding contexts have no Free design to swap to
**And** **the Pro non-placeable treatments get a fourth**, because none of the first three applies: they are
*selected*, not placed, Shuffle and Remix never touch them, and there is no canvas instance to remove — so the
remediation is **revert to the Free design of that treatment**, which always exists because the first-two rule
guarantees it
**And** each reverts **on its own selection surface** — the Paywall editor, the card design module, the main
feed's Pagination control — **or from Theme Settings where the host section is absent**
**And** the count of affected treatments is **derived, not asserted**, and moves if any category's Free floor moves
**And** **`routes.yaml` is exempt** from the code-surface clause: it contains no section code, and the Routes
Manager is granted to Free unconditionally
**And** **hidden sections are excluded from compilation and therefore never trigger exit gates**
**And** the canvas stays open: **Free users can place, shuffle and edit any Pro section**, marked with a subtle ✦
badge, and **there is never an upgrade sheet on clicking the badge** (UX-DR19)
**And** the sheet matches B13a as corrected.

**FRs:** FR-L3 (the exit gates). · **Frame:** `B Missing Surfaces.dc.html` B13a. · **Owner test:** yes.

### Story 12.4: Downgrade, and block-until-resolved

As a user who downgraded,
I want to choose what to give up,
So that nothing of mine is deleted for me.

**Acceptance Criteria:**

**Given** an account that is over a Free limit
**When** the over-limit state applies
**Then** **existing deployed themes are never touched**
**And** **all but one project become read-only, and the user chooses which stays editable** (default: most
recently updated); read-only projects **stay viewable, stay exportable, and become editable again on Pro**
(UX-DR7)
**And** the same **block-until-resolved** pattern governs every over-limit resource: while connections exceed the
cap **deploys are blocked until the user disconnects down to it** (each site's snapshot surviving); an over-quota
asset library **goes read-only until the user deletes below the cap**; retained artifacts above Free's 3 are
**kept but no new ones are retained**
**And** **there is no dormant or frozen connection state** — a connection either counts against the cap or is
disconnected
**And** an **itemised sheet lists exactly what is over and by how much**
**And** **safety operations remain available throughout for connected sites** — rollback, snapshot restore and the
compatibility redeploy — noting that they execute via the site's Admin API, so a disconnected site has neither
until reconnected, and a reconnection performed to run a restore counts against the cap like any other
**And** the sheets match D4c itemised, D4d "Which project stays editable?" and D4e the read-only project.

**FRs:** FR-L3 (the downgrade rules). · **Frame:** `D4 Dashboard Sheets and Blocks.dc.html` D4c · D4d · D4e. ·
**Owner test:** yes.

### Story 12.5: The billing page

As a paying customer,
I want to see what I am paying, when it renews, and my receipts,
So that I am never surprised by a charge.

**Acceptance Criteria:**

**Given** the Billing page
**When** I open it
**Then** it shows current plan, renewal date, invoices via the **Dodo customer portal link**, upgrade / cancel /
resume, and **plan-limit meters**
**And** cancelling stops auto-renew and states plainly when access ends
**And** invoices match S12d and the page matches S12a
**And** it is **fully usable at 390**, because it is one of the three things the Small Screen Notice offers
**And** **FR-A5's two Dodo calls land here with the adapter**: auto-renew stops the moment an account asks to be
deleted, and Restore offers one-click resume at the same plan and price, saying plainly when the paid period
ended meanwhile — deferred from Story 2.5 by ruling **R-97** (owner, 2026-09-07; `deferred-work.md` DW-42).

**FRs:** FR-L4. · **Frame:** `S12 Billing.dc.html` S12a · S12d. · **Owner test:** yes.

### Story 12.6: The four contextual upgrade prompts

As a Free user,
I want to be asked to upgrade only where it is relevant,
So that the product does not nag me.

**Acceptance Criteria:**

**Given** the Free plan
**When** an upgrade prompt appears
**Then** it appears at **exactly four moments**: the 2nd project, the 2nd site, quota exceeded, and a Pro-section
deploy/export block
**And** **there is never a blocking interstitial anywhere else — and never while playing with Pro sections on
canvas**
**And** each prompt routes to the Upgrade Sheet, S12b.

**FRs:** FR-L5. · **Frame:** `S12 Billing.dc.html` S12b. · **Owner test:** yes.

### Story 12.7: The grace banner and the payment-failed email

As a user whose card bounced,
I want a week and a clear message,
So that a bank decline does not strand me mid-deploy.

**Acceptance Criteria:**

**Given** `pro_past_due`
**When** the state is entered
**Then** FR-P1's email (4) is sent via Resend, and a **grace banner** appears on every surface
**And** **during grace a past-due customer keeps every Pro capability** — the rule is deliberately generous, and
withdrawing capability the moment a card bounces would be the retention dark pattern the billing policy forbids
**And** the banner states **7 days and what does not happen**, and **`pro_past_due` is never shown as a plan**
**And** a late payment recovers to `pro_active`; only grace expiry downgrades
**And** the banner matches B24 as corrected.

**FRs:** FR-P1 email (4), the FR-L2 banner. · **Frame:** `B Missing Surfaces.dc.html` B24. · **Owner test:** yes.
· **Verification:** a real Dodo failed-payment event and a real Resend send (R-82).

### Story 12.8: The annual renewal reminder, and the no-nudge rule

As an annual subscriber,
I want advance notice before I am charged again,
So that a $150 renewal is never a surprise — and so the product meets its statutory obligations.

**Acceptance Criteria:**

**Given** that **Dodo's own *Upcoming Renewal Reminder* is ~2 days ahead and off by default**
(`MEASUREMENTS.md` §23c, `SCHEMA.sql`), so **the statutory timing is Inflozo's to own** — Round 4's decision of
2026-08-20, reaffirmed as **R-88** on 2026-09-04
**When** an annual subscription approaches its auto-renewal date
**Then** Inflozo sends its own reminder **30 days ahead**, via Resend, naming the renewal date and the amount
**And** **Dodo's ~2-day reminder is left on** — the two fire at different moments and complement rather than
duplicate: ours is the heads-up, Dodo's is the final nudge, and **enabling Dodo's is a launch-checklist item**
**And** it is **automated, never a manual task**: AD-33's **seventh cron**, owned by this epic, driven off the
subscription's own renewal date rather than off a calendar someone maintains
**And** it is **idempotent as a database fact rather than as something the cron must remember**:
`renewal_reminders`' primary key `(user_id, period_end)` **is** the never-send-twice rule, and because it is
keyed on the renewal being announced, **a renewal date that moves earns a fresh reminder**
**And** **a silent failure of that job means nobody is warned at all, so it sits on the NFR-9 alerting path**
**And** it is sent for **annual renewals only** *(ruling **R-89**, 2026-09-04)* — **which withdraws the 7-day
monthly leg of the 2026-08-20 decision** — because twelve reminders a year to a monthly subscriber is precisely
the nudge pattern FR-P2 forbids and the statutory basis attaches to the annual term
**And** **no DDL changes are needed for that narrowing**: the table and its key are unchanged and monthly rows
are simply never written
**And** a subscription whose auto-renew has already been stopped **is not reminded**, there being no charge coming
**And** it is one of exactly **two non-discretionary carve-outs** from FR-P2, the other being the
Ghost-compatibility notice
**And** **"Theme updates available" is surfaced in-app only, never by email**, and the routine per-release
confirmation that the library was verified **stays in-app**.

**FRs:** FR-P1 email (6), FR-P2. · **Frame:** none — a transactional email is not a drawn surface. · **Owner
test:** yes. · **Verification:** a real Resend send against a real Dodo annual subscription approaching renewal
(R-82).

*Exit:* live-mode $15 transaction; downgrade rules verified; entitlement transitions verified against real Dodo
events.

---

## Epic 13: Suggestions, Notifications & Dashboard Completion

A user asks for what they want and votes on what others asked for; learns what happened while they were away;
and gets the dashboard whole.

### Story 13.1: The board — submit and vote

As a user with an idea,
I want to post it and vote on others,
So that what gets built is shaped by the people using it.

**Acceptance Criteria:**

**Given** the suggestions board, **custom-built on Supabase with no third-party**
**When** I use it
**Then** categories are **Section idea / Feature / Integration** and statuses are **Open / Planned / Building /
Shipped**
**And** signed-in users submit title, description and an optional image, and **upvote once per user per
suggestion**
**And** **there are no comments in v1**
**And** abuse controls apply: **per-user rate limits on submissions and votes, title and body length caps, and
harder throttling for new accounts**
**And** images go through the asset upload pipeline — type and size limits, **and server-side sanitisation**,
because an approved image reaches every visitor
**And** the surfaces match S13a and the submit sheet S13b, with S13c as the empty state (UX-DR6).

**FRs:** FR-M1, FR-M2. · **Frame:** `S13 Suggestions.dc.html` S13a · S13b · S13c. · **Owner test:** yes.

### Story 13.2: The public board and the in-app board

As a visitor deciding whether to sign up,
I want to see what is being built,
So that the roadmap is evidence rather than a claim.

**Acceptance Criteria:**

**Given** the board
**When** it is viewed
**Then** a **public read-only board lives on the marketing site and the identical board lives in-app**
**And** both sort by **Top / New / Status**
**And** the marketing board **fetches live data client-side**, so the marketing site stays statically generated
**And** **suggestion text appears immediately**, while **an attached image renders on the public board only after
admin approval** — until then it is visible in-app to its author and to the admin.

**FRs:** FR-M3. · **Frame:** `S13 Suggestions.dc.html` S13a. · **Owner test:** yes.

### Story 13.3: Moderation and the admin claim

As the owner,
I want to moderate the board from day one,
So that a board that ships with no admin does not ship with no one who can grant the first one.

**Acceptance Criteria:**

**Given** the admin claim
**When** the product is set up
**Then** **the first admin is seeded from the owner's own account at setup**, not granted by a flow
**And** an admin can **edit status, merge duplicates, hide spam and approve suggestion images for the public
board**
**And** the claim lives on the user row and **survives the Test → Live cutover**, which migrates suggestions and
votes — an admin claim that did not migrate would leave the live board unmoderated on day one
**And** further admins are granted by an existing admin.

**FRs:** FR-M4. · **Frame:** `S13 Suggestions.dc.html` S13a — the admin controls are extrapolated onto the board's own rows, same components, same tokens. · **Owner test:** yes.

### Story 13.4: The notifications centre

As a user who closed the tab,
I want to find out what happened,
So that a deploy outcome is never lost because I was not looking.

**Acceptance Criteria:**

**Given** the bell in the dashboard and editor top bars
**When** I open it
**Then** I see a per-user feed of **deploy outcomes, site health changes, Ghost-compatibility notices, billing
events, library "updates available" notices and product announcements**
**And** there is an **unread badge and mark-all-read**
**And** retention is **90 days — but site-health and compatibility notices are exempt from the prune** and are
retained **until read or resolved**, because the population they are written for is precisely the population that
deployed once and stopped signing in
**And** it is **in-app only except where FR-P1 names an email for the same event**
**And** it renders over the table E1 created, and **each event is written by the epic that emits it** (AD-25) —
E3's health, E7's deploys, E12's billing
**And** with nothing in it the empty state is "Nothing yet. Deploy outcomes land here even if you closed the
tab." (UX-DR6)
**And** the surfaces match S3e and B21.

**FRs:** FR-B7. · **Frame:** `S3 Dashboard.dc.html` S3e · `B Missing Surfaces.dc.html` B21. · **Owner test:**
yes.

### Story 13.5: The project card, completed

As a user with several projects,
I want to see at a glance which is live and where,
So that the dashboard tells me the state of my sites.

**Acceptance Criteria:**

**Given** the dashboard
**When** I view my project cards
**Then** each shows the **static Style-Pack placeholder**, project name, **linked-site badge (favicon + name) or
"Sample content" badge**, **last-deploy status chip (Live vX / Never deployed / Failed)** and updated-at
**And** a Failed chip carries **"See what failed →"** (UX-DR6)
**And** **auto-captured canvas thumbnails are deferred out of v1** and are not built — no headless browser and no
server-side render of the section runtime exists anywhere in the product, and **a wrong thumbnail on a dashboard
is worse than none**
**And** loading shows skeleton cards
**And** the card matches S3a.

**FRs:** FR-B1. · **Frame:** `S3 Dashboard.dc.html` S3a. · **Owner test:** yes.

### Story 13.6: The New Project Sheet — every creation path FR-B2 names

As a user starting something new,
I want every way in from one place,
So that starting is one decision rather than four routes.

**Acceptance Criteria:**

**Given** the "New project" action
**When** the sheet opens
**Then** it offers every path FR-B2 names: **Starter template · Blank canvas · Redesign proposals**
(for connected sites)
**And** **the Duplicate door is not built and does not return** — owner ruling **R-93** (2026-09-06):
duplicating a project is an action on a project already in front of the user and lives on its ⋯ menu
(FR-B3), so D4a's fourth door and the project picker inside it are deliberately not implemented
**And** the **Style Pack is chosen at creation and is changeable anytime**
**And** at the Free cap the sheet opens on the Upgrade Sheet path (UX-DR6)
**And** the states match D4a and D4b at the Free cap **except that door**, which the export still draws
and this story does not build — the export is never edited (R-74), and Story 1.5's spec is where the
override was first recorded and executed.

**FRs:** FR-B2. · **Frame:** `D4 Dashboard Sheets and Blocks.dc.html` D4a · D4b, less the Duplicate door
(R-93). · **Owner test:** yes.

### Story 13.7: The connected-sites strip, the asset meter and what's new

As a user with several sites,
I want their health where I already am,
So that I do not have to go looking.

**Acceptance Criteria:**

**Given** the dashboard
**When** I view it
**Then** it surfaces a **connected sites strip with health badges** showing "3 of 10", an **asset quota meter**,
and a **"What's new" changelog popover**
**And** the strip matches B25.

**FRs:** FR-B6. · **Frame:** `B Missing Surfaces.dc.html` B25 · `S3 Dashboard.dc.html` S3a. · **Owner test:**
yes.

### Story 13.8: Redesign proposals

As a user who just connected an existing site,
I want to see it redesigned two or three ways with my own content,
So that the decision is made from my own data rather than from a demo.

**Acceptance Criteria:**

**Given** a connected site after auto-branding
**When** I run "redesign my site"
**Then** **2–3 whole-site starter × Style Pack combinations** are rendered **populated with my real content**
**And** **variety is an acceptance criterion: proposals must differ in layout structure, not merely palette**
**And** picking one **creates the project pre-assembled**
**And** it is **re-runnable anytime from the dashboard's New project path for any connected site**, not just
during onboarding
**And** **it is built as re-specified, not as drawn**: B22's card, its **NOW / PROPOSED pairing** and above all
its **argued-from-your-own-data sentence** are kept — **one per whole-site combination, not one per section** —
and **B22's per-section swap model is not built** (UX-DR20, ruling R-78)
**And** it lands here because the runtime, the packs and the starters it composes all exist by now.

**FRs:** FR-C7. · **Frame:** `B Missing Surfaces.dc.html` B22 as re-specified. · **UX-DRs:** UX-DR20. · **Owner
test:** yes.

*Exit:* public read + authed vote on production; notification feed live and carrying the events E3, E7 and E12
already emit; every dashboard element present.

---

## Epic 14: Marketing Site & Docs

A stranger finds Inflozo through a category page, sees every design rendered live, understands the price, reads
how to do the thing they are stuck on, and signs up.

### Story 14.1: The marketing pages and the legal set

As a stranger,
I want to understand what this is and what it costs,
So that I can decide.

**Acceptance Criteria:**

**Given** inflozo.com
**When** I browse it
**Then** the pages exist: **Home, Features, How It Works, Sections Gallery, Pricing, Suggestions, Docs, Contact,
Changelog**, plus auth entry points and legal
**And** legal includes **Terms, Privacy and a Refund & Cancellation policy** stating the no-refund and
cancel-stops-auto-renew terms — **required by Dodo, and the public statement the checkout consent refers to**
**And** everything is **statically generated on the same Next.js app**, with the suggestions board fetching live
data client-side
**And** the marketing host carries a **static CSP** while the app host carries the nonce policy — setting a CSP
header does not force dynamic rendering, so **marketing keeps SSG and still carries a policy**
**And** **privacy-respecting analytics may run here and only here** — the authenticated app ships no analytics
and no telemetry in v1
**And** every page is **fully usable at 390** (UX-DR16)
**And** Pricing matches M5 and lists **Free and Pro only**, because those are the only two anyone can buy.

**FRs:** FR-N1. · **Frame:** `M1 Home` … `M9 404`, `M5 Pricing.dc.html`. · **Owner test:** yes.

### Story 14.2: The two owner-relay flows

As someone stuck,
I want to reach a human,
So that I am not left with a FAQ.

**Acceptance Criteria:**

**Given** the Contact page and the docs
**When** I submit either
**Then** the **marketing contact form** and the docs **"Suggest an edit"** affordance relay to the owner's address
**via Resend**, with the **platform as sender and the submitter as reply-to**
**And** both carry a **honeypot and rate limiting** against spam
**And** **every docs page carries the "Suggest an edit" affordance**.

**FRs:** FR-P3. · **Frame:** `M8 Contact.dc.html` (the form) · `M7 Docs.dc.html` (the "Suggest an edit" affordance). · **Owner test:** yes. · **Verification:** a real Resend relay (R-82).

### Story 14.3: The Sections Gallery

As someone searching for "Ghost hero sections",
I want to land on a page showing them all, live,
So that I can see the product before I sign up.

**Acceptance Criteria:**

**Given** the gallery
**When** it renders
**Then** there is an **SSG page per category**, each design shown as a **live render using the same section
runtime and Orbit Weekly data**, in a **same-origin iframe — the same hosting model as the editor canvas**,
because it is the same runtime and **the gallery renders no untrusted HTML either, so a `sandbox` attribute would
buy nothing and fork the component**
**And** each preview carries a **light/dark toggle, a Free/Pro badge, the design name and a deep link**, with an
**"Open in Inflozo" CTA**
**And** category pages carry **per-category OG images and sitemap coverage**, and are the SEO engine
**And** **the gallery renders every design in the inventory**, including the non-placeable treatments, in the
host contexts declared for them
**And** copy about the library is **count-agnostic** — "hundreds of gorgeous sections" — never a number.

**FRs:** FR-N2. · **Frame:** `M4 Gallery.dc.html`; per-category pages are extrapolated from it — same components, same tokens. · **Owner test:** yes.

### Story 14.4: The home page and the editor mock

As a stranger on the home page,
I want to see the thing that makes this different,
So that I understand in five seconds.

**Acceptance Criteria:**

**Given** the home page
**When** it loads
**Then** it carries the product narrative with **an animated editor mock — the design-shuffle moment as the hero
demo** — then feature grid, how-it-works, gallery teaser, Style Pack strip, pricing teaser, FAQ and final CTA
**And** the animation **respects `prefers-reduced-motion`** (UX-DR15)
**And** it matches M1.

**FRs:** FR-N3. · **Frame:** `M1 Home.dc.html`. · **Owner test:** yes.

### Story 14.5: The docs

As a user stuck on a step,
I want a page about exactly that step,
So that I finish rather than give up.

**Acceptance Criteria:**

**Given** the docs, in MDX
**When** I browse them
**Then** every enumerated page exists and is non-empty: Getting started · **Assigning a designed template to a
Ghost page** (what the filename is, what the dropdown label will say, and **why Inflozo cannot confirm it for
you**) · Connecting your Ghost site, with the custom-integration walkthrough and screenshots, and **the Staff
Access Token as a separate, later, optional step — what it unlocks, that it is Owner-level, and exactly what a
user gives up by declining it** · Deploying & rollback · **Hosting requirements** · routes.yaml upload step ·
Theme Settings & custom settings · Style Packs · Asset Library · Plans & billing · Troubleshooting · FAQ
**And** **the Hosting requirements page does not ship claiming verified Ghost(Pro) behaviour until §4's gate
clears**, because it currently describes a Starter limitation inferred from an unobserved payload
**And** every page carries the "Suggest an edit" affordance.

**FRs:** FR-N4. · **Frame:** `M7 Docs.dc.html`; every docs page is extrapolated from it. · **Owner test:** yes. · **Depends on:** the Ghost(Pro) gate (E15) for the Hosting page's claim.

### Story 14.6: The dogfooded changelog

As a sceptic,
I want proof Inflozo builds real Ghost themes,
So that the claim is demonstrated rather than asserted.

**Acceptance Criteria:**

**Given** the changelog
**When** it is published
**Then** **the blog/changelog runs on Ghost with an Inflozo-built theme**, linked from the footer as proof
**And** the dogfood project is one of the three record sets migrated at the Test → Live cutover.

**FRs:** FR-N5. · **Frame:** the changelog runs on Ghost wearing an Inflozo-built theme, so its frames are the library's own, not an app frame. · **Owner test:** yes. · **Verification:** a real Ghost site running an Inflozo-built theme.

*Exit:* the gallery renders every design in the inventory; every docs page exists and is non-empty; **Lighthouse
≥ 95 on the marketing site** — Inflozo's own host, so the no-Lighthouse rule, which scopes to *generated themes*
running on the user's host, does not apply here.

---

## Epic 15: Hardening & Launch

Everything the Definition of Done requires that is not a feature. **Owns no new FRs; owns the launch gates.**

### Story 15.1: The E2E suite, including the keyboard-only journey

As the product,
I want a real user's journey exercised end to end,
So that the stack is tested as a user meets it.

**Acceptance Criteria:**

**Given** Playwright against the running stack — **pre-launch: production, per §4's mandate**
**When** the suite runs
**Then** it covers **auth, connect, build, shuffle, dark authoring, deploy to all Ghost deploy targets, rollback,
billing in Dodo test mode, and quotas**
**And** it carries **one keyboard-only journey — sign in, connect, place a section, cycle the ring with `]` and
`[`, deploy — run with no pointer events**, verifying the keyboard rows of the Accessibility Floor
**And** that journey is **the named verifier** for cross-boundary focus order, the `Esc` ladder, keyboard reorder
in Layers and item lists, and **single-key shortcuts being inert inside a text field** (UX-DR21)
**And** the two layers that touch a real Ghost are **serialized per target**, because theme activation is
globally stateful, so concurrent runs queue and never interleave.

**Owner test:** none (automated). · **Verification:** production stack, T1–T3 (R-82).

### Story 15.2: Final render-matrix and accessibility sign-off

As the launch gate,
I want one final confirmation across the whole library and the app,
So that nothing regressed after its category gate.

**Acceptance Criteria:**

**Given** the finished library
**When** the sign-off runs
**Then** the **render matrix** runs across every design × 3 reference packs × light/dark × 3 viewports, at the 1%
threshold on the pinned renderer, **and the axe-core scan runs on those same renders at zero violations**
**And** the scope includes **the fixture renders, the six synthesised templates, and the Inflozo app itself**
**And** **this is a re-confirmation, not the first run** — every design already cleared both at its category gate
**And** axe-core additionally runs **over the app surfaces** for reason text on greyed controls, accessible names,
roles and labels (UX-DR21)
**And** **reduced motion is verified by the matrix with the query forced**, and **200% browser zoom as a viewport
case** (UX-DR21)
**And** a **manual screen-reader pass per surface** verifies the live-region announcements, once for this release
(UX-DR12, UX-DR21)
**And** any mass rebaseline requires **the owner's approval on a sampled visual review** — one design per
category, both modes — landing as its own commit touching baselines only and naming the change that caused it.

**Owner test:** yes (the sampled visual review, if a rebaseline is needed).

### Story 15.3: NFR-6(c3) rotation coverage

As the fidelity guarantee,
I want proof every design has actually been compared against a real Ghost,
So that "within 30 days" is a fact rather than a schedule.

**Acceptance Criteria:**

**Given** the nightly risk-weighted rotating batch
**When** coverage is confirmed
**Then** **every design has been compared against real Ghost at least once**
**And** the rotation front-loads the designs most likely to diverge — anything sticky or fixed, the Koenig card
treatments, member-state-dependent sections, announcement bars and edge rails
**And** the comparison's **exclusion regions** are honoured: the post and page body, Portal's floating button,
Ghost's announcement strip, native comments, the search overlay, and any region the site's own code injection
touches
**And** animations are frozen for the comparison
**And** **the CI lane is a costed line item, not an aside**.

**Owner test:** none. · **Verification:** T1 and T3 (R-82).

### Story 15.4: The manual performance gate

As the performance claim,
I want it measured on the reference machine,
So that the number means something.

**Acceptance Criteria:**

**Given** NFR-1's reference environment — a mid-tier laptop at 4× CPU throttle — and the 40-section fixture
**When** the gate is run before release
**Then** editor TTI < 3 s (p75 of 10 timed runs, **warm**), all canvas interactions hold **60 fps** (p95 frame
time ≤ 16.7 ms, **no long task > 50 ms** over a 3-second trace), control-change render < 100 ms, and dashboard LCP
< 2 s
**And** the gate is **manual-only and never run on CI**, because a shared runner is not that machine and 4×
throttle on it is not reproducible — **a CI number would be noise presented as a gate**
**And** a cold first visit is **measured but not gated**.

**Owner test:** none. · **Verification:** the reference laptop.

### Story 15.5: Reliability — alarms and the restore drill

As the product's own safety net,
I want recovery exercised before launch rather than after an incident,
So that PITR is a capability rather than a setting.

**Acceptance Criteria:**

**Given** the production Supabase project
**When** reliability is verified
**Then** **Postgres point-in-time recovery is enabled for user work-product and a restore drill is exercised**
**And** **Supabase spend-cap alarms and usage dashboards** exist, with usage alerts at **60 / 80 / 95%** of
included quotas
**And** the autosave offline queue retries with backoff, and deploys are idempotent with immutable artifacts
**And** Sentry covers app and server, with structured deploy logs carrying per-stage timing and gscan output —
**and no user content, no Ghost credentials and no `codeinjection_*`, ever**.

**Owner test:** none. · **Verification:** a real restore drill on the production project (R-82).

### Story 15.6: G1 and G2, measured rather than asserted

As the only gate on the ease-and-play half of the product thesis,
I want the two goals measured with real people,
So that they are gates rather than aspirations.

**Acceptance Criteria:**

**Given** a **moderated 8-user test**
**When** it runs
**Then** it produces both p75 figures: **G1 first-deploy time**, instrumented and met on the connect path, and
**G2 the never-lose-content play loop**, green on the preservation gate
**And** **E15 owns the measurement and cannot waive it**, while the paths being measured belong to E3 (connect,
where the credential deferral is what makes G1's ten minutes reachable) and E5 (the play loop)
**And** because the app ships **no analytics and no telemetry**, this is necessarily a **manual or moderated
measurement**
**And** the beauty half of the thesis **carries no gate at all and is marked as ambition** — this is recorded so
it is not mistaken for one.

**Owner test:** yes (he runs or observes the sessions).

### Story 15.7: The Ghost(Pro) launch gate

As the one claim in this product nobody has observed,
I want a real Ghost(Pro) Starter payload captured,
So that the Preview-only path stops being documented-as-untested.

**Acceptance Criteria:**

**Given** a Ghost(Pro) Starter site — a trial suffices — **which the owner acquires when this gate opens**
**When** the gate runs
**Then** what **`GET /admin/config/` actually returns** is captured and recorded as a fixture
**And** **the Preview-only detection is verified against that recording**
**And** **a deploy attempt against T4 fails with the friendly Starter message and sets Preview-only**, and a
successful deploy elsewhere clears it — the clause carried forward from the E4/E7 joint gate
**And** **clearing this gate is what releases any marketing aimed at Ghost(Pro) users**, and the docs Hosting
Requirements page, which may not ship claiming verified Ghost(Pro) behaviour until then
**And** it is a **blocking gate before public launch**.

**Owner test:** yes. · **Verification:** a real Ghost(Pro) Starter site (T4). · **Note:** the owner already
holds this as an action item with a trigger — buy the Starter trial when E13 closes and E14 opens.

### Story 15.8: The Test → Live cutover

As the launch itself,
I want the three record sets carried across,
So that the public board does not reset to zero on launch day.

**Acceptance Criteria:**

**Given** go-live
**When** the cutover runs
**Then** a **fresh infrastructure set is provisioned as Live** — new Supabase project, Vercel production
environment, live Dodo — and takes over the production domains
**And** the existing pre-launch stack, **including Ghost targets T1–T4, becomes the permanent Test environment**
on test domains — a **costed line item, not a pre-launch expense that ends at GA**
**And** exactly **three record sets are exported from Test and imported into Live**: **suggestions**, their
**votes**, and the **dogfood project** that builds Inflozo's own Ghost theme. **Everything else starts empty.**
**And** **the admin claim migrates with them**, or the live board is unmoderated on day one
**And** from the first customer onward, **all testing runs exclusively against Test; real-user data exists only in
Live**
**And** legal pages, including the Refund & Cancellation page, are live.

**Owner test:** yes. · **Verification:** the real cutover (R-82).

*Exit:* **Definition of Done (§4) met** — every FR implemented; **every category owner gate passed**, one per
category, the shell block's three included; every design green on the render matrix and the accessibility scan;
every emitted theme green on the quality gate; ten starters deployable end to end to all Ghost deploy targets;
marketing site live with the full gallery; billing verified with real Dodo test-mode → live-mode transactions;
rollback verified; docs complete; **the Ghost(Pro) gate cleared**; and **G1 and G2 measured, not asserted**.

---

## Validation

Run at step 4 and checked mechanically rather than by eye, because a coverage list cannot audit itself.

| Check | Result |
|---|---|
| **FR coverage** | **132 of 132.** Every FR in §5 is cited by at least one story's `FRs:` line. Extracted from the PRD and matched against the story metadata by script; nothing missing, nothing invented. |
| **Epic ownership** | 132 assigned, matching §8 exactly, with the **four** documented splits (FR-P1 per email, FR-Q6 format vs surface, FR-C1 connect vs first deploy, FR-G1/G4/G5/G6 shell block vs gated pipeline) and no others. **FR-C1 was missed on the first pass and added by the step-6 stress test, finding F5.** |
| **UX-DR coverage** | **22 of 22.** UX-DR2–UX-DR22 are cited by name in the stories that implement them. **UX-DR1 is discharged structurally rather than by citation:** **every owner-tested story that has a drawn surface names the frame it is built from**, verified by script over the metadata blocks — which is what R-74 asks for. The only owner-tested stories carrying no frame are E15's launch gates, which are procedures the owner runs rather than screens. |
| **Owner-test verdict** | **Every** story metadata block carries an explicit `Owner test:` verdict — the check is *all of them*, never a count — so no story is ambiguous about whether R-80 applies to it. |
| **Story sizing** | **266 stories.** Every story is scoped to one build session. The library runs are the R-85 shape at the owner's ruled sizing — four designs per story, the first story's four being the two [Free] plus two Pro. |
| **Starter template** | The architecture specifies **none** — the repo is greenfield and its structure is the spine's Structural Seed, which is Story 1.1. There is therefore no "set up from starter template" story to write, and its absence is deliberate rather than an omission. |

**Four of the skill's own checks fail against §8, and each is overruled by it rather than worked around.**

1. **"Tables only when needed."** Overruled for **Story 1.2** by §8's explicit whole-model instruction. §7.5 is a
   sketch; without one schema story every later epic carries an un-storied migration, and `notifications` in
   particular is written by E3, E7 and E12 long before E13 renders it.
2. **"No technical-layer epics."** Overruled for **E0, E4 and E15**. E0 is two blocking spikes that exist because
   this document has twice been damaged by building on an unverified premise; E4 is the runtime every one of the
   466 designs is authored against; E15 owns the launch gates.
3. **"No file churn across epics."** Overruled for **E1/E13** (the dashboard) — §8's cut line names exactly what
   is in and out and E13 closes it — and for **E4/E5** (the canvas), where FR-H5's contract and the canvas work
   are a deliberate work split with a single owner.
4. **"No forward dependencies."** Overruled for **E4 → E7**, which is the **E4/E7 joint compile gate**, recorded
   as **Story 7.33** rather than restructured away; and for **A25 → FR-Q7**, where A25's owner gate cannot open
   until E7's card module emits. Both are §8's design.

**Within-epic story order was checked in one direction only, and that is deliberate.** Each story depends on
previous stories and never on later ones. The library epics are the strongest case: a category's stories open in
order, each after the previous is done, and no two category stories are ever in flight at once.

---

## Questions for the owner

**Both answered on 2026-09-04. The stories above are adjusted to match.** One new question follows from the
second ruling, and it is the only thing on this page still open.

### 1. How many designs should one library story carry? — ANSWERED

> **Ruled: "Four per story 2 free and 2 pro designs"** *(owner, 2026-09-04)*

**Applied.** Every story in every category carries **four designs** — a final story takes the remainder — and
**a category's first story is designs #1–4: its two [Free] designs plus its first two Pro**. The library is
therefore **126 stories**: 12 in the shell block and 114 in the gated pipeline, across 33 categories and 466
designs, all derived from `tools/export-roster.py`.

**One thing worth stating, because it is what the ruling can and cannot mean.** "2 free and 2 pro" describes a
category's **first** story only. It cannot describe the later ones: ruling **R-17** fixes `[Free]` as *exactly*
the first two designs of every category and nothing else, so a category holds two Free designs in total and both
are in its first story. Every later story is four Pro designs. **If you meant to change the Free tier itself —
more than two Free designs per category — say so and I will raise it properly**, because that would move FR-G2,
Appendix F.1, the derived Free count and FR-L3's exit sheet together, and it is not a change to make quietly.

**What the ruling improved, and it is not only cosmetic:** the Free pair now ships in a category's **first**
story rather than being split across the first two, so a Free account has something placeable in that category
the moment its first story lands.

### 2. Does Dodo already send the annual renewal reminder? — ANSWERED

> **Ruled: "It does not. We need to send automated reminders for subscriptions"** *(owner, 2026-09-04)*

**Applied.** FR-P1's condition is resolved: the annual renewal reminder is **email #6, unconditional**, and
**Story 12.8 is unblocked and rewritten to build it** — sent automatically ahead of the charge, driven off the
subscription's own renewal date, idempotent so a webhook replay never sends a second copy, and carved out of
FR-P2's no-nudge rule as one of exactly two carve-outs.

### 3. Should the reminder cover monthly subscriptions too, or annual only? — ANSWERED

> **Ruled: "Only annually"** *(owner, 2026-09-04 — recorded as **R-89**)*

**Applied,** and it turned out to matter more than the question suggested. **This reverses the monthly leg of a
decision you took on 2026-08-20**, which was *30 days (annual) / 7 days (monthly)*. The 30-day annual reminder
stands; the 7-day monthly one is not built. No database change was needed — `renewal_reminders` and its key are
unchanged, and monthly rows are simply never written. **Say the word if you want the monthly leg back.**

### What the propagation actually found — and one correction to the answer above

**Ruling 2 was landed in the PRD, and checking the repository first changed what got written.** Grepping for the
old claim, as standing rule 7 requires, turned up two things this run had not been told:

1. **Dodo *does* have an "Upcoming Renewal Reminder"** — but it is **~2 days ahead and off by default**
   (`MEASUREMENTS.md` §23c, `SCHEMA.sql`). So "Dodo does not send it" is right about **what matters** — the
   timing is far short of a statutory annual notice, and it is off unless someone turns it on — but it is **not**
   literally true, and writing it into the PRD as a flat fact would have been exactly the external-platform claim
   standing rule 1 exists to stop. **The PRD now states the timing, not a denial**, and the outcome is unchanged:
   Inflozo sends its own at 30 days and leaves Dodo's on, because the two fire at different moments.
2. **You had already decided this on 2026-08-20.** Round 4 settled it, `renewal_reminders` is already in
   `SCHEMA.sql` with `(user_id, period_end)` as its never-send-twice rule, AD-33 already carries the cron, and
   `ARCHITECTURE-SPINE.md` already said **six** transactional emails. **Only the PRD had not been told** — which
   is precisely the R-79 failure class, and it is now closed.

**Landed as R-88 and R-89:** `prd.md` FR-P1, FR-P2, §7.6 item 6 and §8's E12 line · `SCHEMA.sql`'s comment ·
`MEASUREMENTS.md` §23c, **annotated rather than rewritten**, because a dated decision is not edited to match a
later one · the ruling ledger in `reconcile-designs-decisions.md` §A16 · and Story 12.8 above.

---


*End of the epic breakdown. Generated at step 6 from PRD §8, `ARCHITECTURE-SPINE.md`,
`reconcile-designs-decisions.md` §A10/A13/A14/B, and the `ux-Inflozo-2026-09-03` spine pair, against the design
export as it stood on 2026-09-04. Every count on this page was derived by `tools/inventory-gen.py` and
`tools/export-roster.py` at generation time and is a snapshot of a derivation, never a maintained value.*
