---
title: Inflozo PRD
version: "2.3"
status: final
created: 2026-08-17
updated: 2026-08-18
---

# Inflozo — Product Requirements Document

**Intended consumers:** BMAD agents (Analyst → PM → Architect → SM → Dev → QA) via Claude Code. This PRD is the single source of truth. Appendices A–I are normative, not illustrative (Appendix A's full inventory lives in `sections-inventory.md`, same folder). User journeys are deliberately not authored here: journey and flow authorship is delegated to the UX workflow (bmad-ux), which must cover at minimum connect → first deploy, blank-canvas build, Free-plan ship, and downgrade recovery, using the §3 personas.

---

## 1. Goals & Background Context

### 1.1 Problem

Ghost is a world-class publishing platform with a primitive theming story. Customizing a Ghost site means hand-editing Handlebars templates, working within a marketplace of rigid pre-built themes, or hiring a developer. Visual building for Ghost is barely served: the one shipping builder, Fantasma, falls short on every axis that matters (see §1.5). Ghost publishers who care about design are still stuck choosing between "someone else's theme," a shallow builder, and "learn to code."

### 1.2 Product Vision

**Inflozo is the visual builder for Ghost CMS.** Users assemble their site by dropping pre-made, professionally designed sections onto a canvas that renders exactly what the live site will look like — 100% WYSIWYG. Inflozo compiles the design into a clean, valid, marketplace-quality Ghost theme and deploys it to the user's site in one click. The experience must be **extremely easy, genuinely fun, and the most beautiful UI/UX in the Ghost ecosystem** — closer to playing with a well-made toy than operating software.

### 1.3 Goals (measurable)

| # | Goal | Target |
|---|---|---|
| G1 | Connect Ghost site → branded canvas with the user's real content and colors | < 10 minutes (p75) end-to-end for a first-time user — including creating the Custom Integration in Ghost Admin (FR-C1) |
| G2 | Blank project → first successful deploy | < 15 minutes (p75) for a first-time user |
| G3 | Every deploy passes gscan | 0 errors, warnings surfaced, always |
| G4 | Generated theme quality | Lighthouse Performance ≥ 90 (mobile), Accessibility ≥ 95 — measured on library defaults and the 12 preset packs; user token edits can break AA (FR-E3 warns; responsibility transfers to the user) |
| G5 | Section library at launch | 34 categories, 487 unique variants (Appendix A) |
| G6 | Editor feel | 60fps interactions; every control change visible < 100 ms — pass/fail on the NFR-1 reference environment and stress fixture |
| G7 | Business | Freemium; Pro $15/mo or $150/yr via Dodo Payments; infra break-even at ~8–9 Pro subscribers (Appendix F) |
| G8 | Activation | ≥ 30% of signups reach first deploy within 7 days · counter: 7-day rollback rate < 10% |
| G9 | Conversion | ≥ 3% free→Pro within 90 days of signup · counter: refund/dispute rate < 2% |
| G10 | Retention | Pro monthly churn < 5% · counter: cancellation always completes in ≤ 3 clicks (no retention dark patterns) |

G8–G10 are internal business goals: the owner tracks them manually outside the product. No in-app analytics or telemetry requirement exists in v1 (NFR-8's privacy stance stands); instrumentation is added only if and when the owner requests it.

### 1.4 Differentiators

1. **Single-source WYSIWYG** — the canvas renders the *actual* section `.hbs` + CSS that ships in the theme. There is no separate preview implementation to drift out of sync (§7.3).
2. **Variant Shuffle** — flip a placed section through every sibling design in its category (up to 18) with the user's content preserved. Choosing a design becomes play.
3. **Auto-branding** — on connect, Inflozo reads the site's accent color, logo, title, and navigation from Ghost and seeds the project so the first canvas already looks like *their* site.
4. **Impossible to make ugly** — a strict vertical-stack model, a closed control vocabulary with no raw CSS values, and token-driven Style Packs mean every possible output is cohesive.
5. **Safe installs** — "an Inflozo theme never breaks your site" is a brand promise enforced in the pipeline: gscan-gated compiles, pre-deploy checks, a snapshot of the site's previous theme before Inflozo's first activation, and one-click rollback (FR-J6, FR-J9, FR-J13).
6. **Deep Ghost nativity** — live tiers pricing, members-aware sections, paywall CTA designs, Koenig card styling, portal actions, routes.yaml building. Inflozo is not a generic builder wearing a Ghost costume.
7. **Evergreen themes** — the section library is versioned and updated as Ghost evolves; users pick up improvements by signing in and redeploying (FR-J14). Competing themes are frozen at purchase time.

### 1.5 Competitive Landscape

Fantasma (fantasma.io, Pro $99/yr) is the incumbent — and only shipping — visual Ghost builder: a solid build→export pipeline, but form-based editing (no inline WYSIWYG), one Source-derived aesthetic (a known user complaint), no membership/monetization sections (tiers, paywalls), no deploy versioning or rollback, no image optimization, and no gscan/performance or code-quality story. Ghost theme shops sell static themes at $89–149 one-time. Inflozo's premium $15/mo is justified against both by WYSIWYG fidelity, library scale (487 variants vs ~155 presets), Ghost-native monetization depth, safe installs, and evergreen updates.

---

## 2. Product Principles (binding on all design & implementation decisions)

- **P1 — The canvas is sacred.** With nothing selected, the canvas shows the true website: no outlines, handles, grids, or badges. Affordances appear only on hover/selection and vanish on exit.
- **P2 — No CSS knowledge, ever.** Users never see pixels, hex codes, class names, or units at the section level. All values are named (Compact/Comfortable/Spacious), visual (layout thumbnails, swatches), or binary (toggles). Raw values exist in exactly one place: the Style Pack editor.
- **P3 — Bake by default, expose deliberately.** Section copy and control values are compiled into the theme. The generated theme exposes `@custom` settings only where the user deliberately configures them in the Theme Settings surface (FR-Q): the dark-mode built-ins (FR-Q5) plus any user-defined custom settings — always within Ghost's 20-setting cap, enforced with a visible meter.
- **P4 — One source of truth per section.** A section is its `.hbs` + CSS (+ optional JS). The editor renders it; the compiler ships it. No parallel React re-implementations of sections.
- **P5 — Deployed sites cost Inflozo $0.** Assets bundle into the theme zip and are served by the user's Ghost server. Ghost content loads in the editor client-side via the Content API (which is designed to be browser-safe and cacheable). Inflozo's infra pays only for editing sessions and the marketing site.
- **P6 — Delight in small doses.** Micro-interactions, playful copy, and one celebratory moment (first deploy) — never at the expense of speed or clarity.
- **P7 — Everything ships before launch.** The full library, all templates, all plans, all pages. Testing happens on the live Vercel + Supabase production stack against real Ghost instances (there are no users yet; see §4).
- **P8 — Ghost content is read-only.** Inflozo never creates, modifies, or deletes the user's Ghost content (posts, pages, tags, authors, tiers, settings). Deleting a section removes theme code from the project only. The Admin API is used solely for connection validation, theme upload/activate, the routes upload attempt (FR-I4), and the pre-activation snapshot (FR-J13).

---

## 3. Users & Roles

**One user role.** Every account has identical capabilities, differentiated only by plan (Free/Pro).

Personas (for tone and prioritization, not permissions):
- **The solo publisher** — writer/newsletter operator on Ghost; zero code skills; wants their site to look intentional. Primary persona.
- **The indie founder** — runs a company blog/changelog on Ghost; wants a marketing-grade homepage without a designer.
- **The creator with taste** — designer-adjacent; will use custom Style Pack editing, dark mode authoring, and routes.
- **The multi-site operator** — manages several Ghost sites (Pro; up to 10 connections, 25 projects).

An internal `admin` claim (Supabase custom claim, not a product role) gates suggestions-board moderation and support tooling.

---

## 4. Release Strategy & Definition of Done

- **Single GA release.** No beta, no waitlist-gated feature drip. 100% of this PRD ships before go-live.
- **Live-infrastructure testing (owner mandate — must-have).** Until go-live and the first customer, all testing runs on the real production infrastructure, exactly as an actual user would experience it: the production domains (**inflozo.com** marketing, **app.inflozo.com** app), production Supabase, real Resend sends, real Dodo transactions (test-mode → live-mode), plus live Ghost deploy targets:
  - **T1** — a self-hosted Ghost **6.x** on a DigitalOcean droplet (owner-provided)
  - **T2** — a Ghost(Pro) **Publisher** site
  - **T3** — a self-hosted Ghost **5.x** droplet (owner-provided), verifying 5.x compatibility
  - **T4** — a Ghost(Pro) **Starter** site (verifies the Preview-only path)

  **Deployable targets are T1–T3.** T4 exists to verify the Starter block path (FR-C2) — wherever an exit criterion says "all live Ghost deploy targets (§4)", it means: deploys succeed end-to-end on T1–T3, and the block path passes on T4.

  This is safe because the product has no users pre-launch. User-journey E2E tests exercise the production stack end-to-end as a real user; automated quality gates (render matrix, compile CI, golden fidelity — NFR-6) run on CI runners **against** these live Ghost targets, serialized per target (theme activation is globally stateful — concurrent runs queue, never interleave).
- **Definition of Done for GA:** every FR implemented; every section variant passes the render matrix (NFR-6); 10 starter templates deployable end-to-end to all live Ghost deploy targets (§4); marketing site live with full sections gallery; billing verified with real Dodo test-mode → live-mode transactions; rollback verified; docs complete.
- **No de-scope contingency (owner decision):** the full FR scope and the 487-variant inventory are not de-scopeable; if library waves slip, launch slips. The sections are the heart of the tool — every one must work perfectly (the NFR-6 gates enforce this).
- **Post-launch topology (Test vs Live):** at go-live, a fresh infrastructure set is provisioned as **Live** (new Supabase project, Vercel production environment, live Dodo) and takes over the production domains; the existing pre-launch stack — including Ghost targets T1–T4 — becomes the permanent **Test** environment on test domains. From the first customer onward, all testing (E2E, render matrix, golden fidelity) runs exclusively against Test; real-user data exists only in Live.

---

## 5. Functional Requirements

Requirements are numbered `FR-<domain><n>`. "Must" is the default force. Free/Pro gating is defined in Appendix F. Sections are ordered by dependency, not alphabetically — FR-Q (Theme Settings) sits between FR-I and FR-J because routing and theme settings both feed the compiler.

### FR-A · Authentication & Accounts

- **FR-A1** Sign-up and sign-in via **magic link** (Supabase Auth email OTP link) with branded email template. No passwords exist anywhere in the product.
- **FR-A2** **Passkey** support via Supabase Auth's native passkey (WebAuthn) capability. Because Supabase requires a signed-in session to register a passkey and the API is in Beta (as of May 2026; requires `@supabase/supabase-js` ≥ 2.105.0 with explicit opt-in), the flow is: magic link first → post-onboarding nudge + Account → Security page to register a passkey → subsequent sign-ins offer passkey as the primary, magic link as fallback. Feature-flag the passkey module so it can be disabled without redeploy if the experimental API changes.
- **FR-A3** Account → Security lists registered passkeys (auto-named from authenticator AAGUID) with rename and revoke.
- **FR-A4** Email change with re-verification of the new address; a change to an address already registered to another account is rejected upfront ("already in use") before any verification email is sent.
- **FR-A5** Account deletion: cascades projects, templates, assets, connections, and deploy artifacts; suggestions-board posts are anonymized (author becomes "Deleted user", any uploaded image is removed) and the user's votes and notification rows are deleted; cancels any active Dodo subscription; honors a 14-day soft-delete window then hard purge (GDPR). Signing in during the soft-delete window offers a one-click "Restore account" that cancels the purge.
- **FR-A6** Sessions persist 30 days rolling; a sign-out-everywhere action is available.

### FR-B · Projects & Dashboard

- **FR-B1** Dashboard shows projects as cards: auto-captured canvas thumbnail, project name, linked-site badge (favicon + name) or "Sample content" badge, last-deploy status chip (Live vX / Never deployed / Failed), updated-at.
- **FR-B2** Create project from: **Starter template** (Appendix E, with full-page scrollable preview in light and dark before choosing), **Blank canvas**, **Duplicate** of an existing project, or **Redesign proposals** (FR-C7, for connected sites). Style Pack chosen at creation (changeable anytime).
- **FR-B3** Rename, duplicate, delete (type-name-to-confirm) on every project. Deleting a project whose theme is live on a connected site warns that the site's active theme and its rollback history came from this project; the project's deploy artifacts are purged with it, while the per-site pre-Inflozo snapshot survives (FR-J13). Renaming after first deploy changes the display name only (FR-J10).
- **FR-B4** Plan caps enforced at creation time with a contextual upgrade prompt (Free: 1 project; Pro: 25).
- **FR-B5** A project targets at most one connected site at a time (switchable). Unlinked projects render the bundled sample dataset (FR-H3).
- **FR-B6** Dashboard also surfaces: a connected sites strip with health badges, an asset quota meter, and a "What's new" changelog popover.
- **FR-B7** **Notifications center:** a bell in the dashboard and editor top bars opens a per-user notification feed — deploy outcomes, site health changes (reconnect needed), billing events (payment failed / grace), library "updates available" notices (FR-J14), and product announcements. Unread badge, mark-all-read, 90-day retention. In-app only; email policy remains FR-P.

### FR-C · Ghost Site Connections

- **FR-C1** Connect flow: user enters their Ghost URL → guided, screenshotted instructions to create a **Custom Integration** in Ghost Admin → user pastes the **Admin API key** and **Content API key** → Inflozo validates both.
- **FR-C2** Validation (server-side): mint the short-lived Admin JWT and call the Admin API `site` endpoint; record Ghost version (5.x and 6.x accepted; 4.x and older rejected with a "please update Ghost" message); verify Content API key client-side with a `settings` read. Plan awareness (**no detection API exists** — Ghost exposes no endpoint reporting plan or theme-upload permission): **Ghost(Pro) Starter does not permit custom themes** (in Ghost's 2026 lineup — Starter/Publisher/Business — custom theme upload requires Publisher or higher). For Ghost(Pro) sites (`*.ghost.io` hostname), the connect flow informs the user of this and asks which plan the site is on; connections the user identifies as Starter are marked **Preview-only** with a clear explanation. The user may attempt a deploy regardless — the deploy attempt's error response is the authoritative signal: a rejected theme upload fails with a friendly explanation and a "check or upgrade your Ghost(Pro) plan (Publisher or higher)" prompt and docs link, and marks the connection Preview-only. The flag clears on the first successful deploy or when the user updates the site's plan via Manage keys (FR-C8). Live-content editing requires the site to be reachable over HTTPS from the browser (Content API fetches are client-side): `http://` URLs are warned at connect, and when client-side Content API reads persistently fail for a validated connection (CORS proxy, mixed content), the editor names the cause and falls back to sample content rather than failing silently.
- **FR-C3** Key security: Admin API keys are encrypted at rest with Supabase Vault and **never sent to any client**; all Admin API calls are proxied through server routes that mint the required short-lived JWT per request. The Content API key is browser-safe by Ghost's design and is delivered to the editor for direct client-side content fetches.
- **FR-C4** **Auto-branding:** on successful connect, fetch site settings (title, description, logo, icon, cover image, accent color, navigation) and present a one-click "Use your brand" card that seeds the active project's Style Pack accent + logo + nav and switches the canvas to live content. Skippable; re-runnable later from the Style panel.
- **FR-C5** Multi-site: Free 1 connection, Pro 10. Daily background health check re-validates keys and re-runs version detection (so a Ghost version upgrade lifts stale version-dependent behavior without reconnecting); the Preview-only flag is governed by FR-C2 (user-declared plan or deploy outcome — no API exposes it); failures set a "Reconnect needed" badge. The email notice sends once per healthy→unhealthy transition (at most one reminder), is suppressed while the outage persists, and resets on recovery — subsequent failures log to the notifications center (FR-B7) only. Regardless of transitions, at most **one health email per site per rolling 7 days** (a flapping site logs to the notifications center, never to email). **Compatibility watch (Pro):** the daily check also compares each connected site's Ghost version against the library's compatibility data; when a Ghost release affects something the site's deployed theme uses, the user gets an in-app notification (FR-B7, in-app only per FR-P2) recommending a redeploy through the FR-J14 flow.
- **FR-C6** Disconnecting a site never deletes projects; affected projects fall back to sample content. Disconnecting also never deletes the site's pre-Inflozo snapshot — snapshots are keyed by site URL and survive disconnect/reconnect (FR-J13).
- **FR-C7** **Redesign proposals:** after connect + auto-branding, offer a one-click "redesign my site" pass that renders 2–3 starter + Style Pack combinations populated with the user's real content; picking one creates the project pre-assembled. Variety is an acceptance criterion: proposals must differ in layout structure, not merely palette. Re-runnable: the same flow is available anytime from the dashboard's "New project" path for any connected site, not just during onboarding.
- **FR-C8** **Key rotation & site moves:** per-site "Manage keys" flow — re-paste Admin/Content keys, **edit the site URL in place** (for domain moves: the site record and its pre-Inflozo snapshot, FR-J13, survive the change), test the connection, save re-encrypts to Vault (FR-C3). Surfaced from the site card and from every "Reconnect needed" state. Reconnect-as-new-site is for genuinely new sites: when a new-site connect presents credentials matching an existing record, the flow hints "Moved domains? Edit the URL on the existing site instead."

### FR-D · Editor Core

- **FR-D1** Layout: slim top bar; collapsible left **Layers** panel; center **canvas**; right **Controls** sidebar. With nothing hovered/selected the canvas is a pixel-faithful render of the site (P1). Panels may remain visible; the canvas itself carries zero editing chrome.
- **FR-D2** Hover state on a section: 1px outline, floating name tag, and quick actions — Variant Shuffle ◀ ▶, Duplicate, Delete, drag handle. Between sections, a hairline "+" insertion affordance appears on hover.
- **FR-D3** Click selects a section (persistent outline + sidebar controls). Esc deselects. Clicking a text element inside a selected section enters inline editing.
- **FR-D4** **Inline editing:** every text prop is editable directly on canvas (line breaks honored; per-prop character limits from the section schema). Selecting text raises a small floating toolbar (Koenig/Medium-style) offering exactly four inline marks — **bold, italic, underline, link** (link via the Link Picker) — available on any text prop, headlines included (exception: a prop bound to a Ghost Admin text setting is plain-text-locked while bound — FR-Q3). Compiled output is clean `<strong>/<em>/<u>/<a>`; pasted content is stripped to these marks. Every text prop is *also* editable in the Content group of the sidebar (owner requirement). Clicking an image opens the asset picker popover.
- **FR-D5** **Layers panel:** ordered section list for the active template; drag to reorder with live canvas follow; per-instance rename; duplicate/delete; visibility toggle (hidden sections are excluded from compilation but retained). Site-wide sections (headers, announcement bars, footers) are single shared instances: they appear in every template's Layers panel as a pinned "Site-wide" group with a globe badge, and editing them changes every template (they compile into `default.hbs`). Site-wide singletons cannot be duplicated; deleting or hiding one asks a confirm noting it affects every template (hiding the footer still triggers FR-J15's Free credit fallback).
- **FR-D6** **Template switcher** in the top bar: Home, Post, Page, Tag archive, Author archive, Members (Signup / Signin / Account), 404, plus any custom templates created in the Routes Manager (FR-I). Templates the user hasn't touched compile from the normative **Synthesis Defaults** (`sections-inventory.md` § Synthesis Defaults — per-template default section stacks, all [Free] variants, with inheritance rules), so a home-only design still produces a complete, coherent theme: header/footer/style are inherited from the Home canvas by reference, body stacks come from the defaults tables, and archive defaults ship a designated main feed (FR-H2).
- **FR-D7** **Light/Dark authoring:** sun/moon toggle re-renders the canvas in the other mode. Mode-scoped controls (background role, per-mode image swaps, mode-specific toggles) apply to the active mode only and display a moon badge when a dark override exists; "Clear dark overrides" per section. Project setting: **Light only** or **Light + Dark** (default: **Light + Dark** — every preset ships a hand-paired dark palette, so dark is prepaid). Light-only projects hide the toggle and compile without dark support. Switching a Light + Dark project to Light only keeps existing dark overrides inert — nothing is deleted; they reapply if dark is re-enabled. Switching between Light only and Light + Dark never affects the custom-settings cap — the built-in slots are reserved unconditionally (FR-Q2).
- **FR-D8** **Device preview:** Desktop / Tablet (834) / Mobile (390) preview-only toggles. Sections are auto-responsive; there is no per-breakpoint editing.
- **FR-D9** Undo/redo: 100-step history covering content, controls, ordering, shuffles, and Style Pack changes. The undo stack persists locally (per browser) across reloads and sessions — a deleted section is recoverable with all its customizations via undo even after a reload (persistence model in FR-D10; durability is bounded by the browser — the app requests persistent storage via `navigator.storage.persist()`, but an evicting browser can still clear it, so the promise is scoped to "while browser storage survives"). Undo entries whose section schema no longer matches the current library no-op gracefully with a notice (never corrupt state). On any hydrate from the authoritative cloud snapshot (lock acquisition or takeover — FR-D10/FR-D18), the local undo journal is **cleared**: its entries reference a superseded document and must never replay (AD1).
- **FR-D10** **Local-first persistence:** every change is written immediately to local browser storage — writes never block the UI, and editing speed is unaffected (NFR-1). Cloud sync to Supabase runs periodically (default: every 3 minutes), on tab close, on lock release (FR-D18), and before any deploy or export. Manual save (⌘S) is always available. The periodic cloud autosave can be toggled per user; local persistence is always on. Indicator states: Saved locally / Syncing / Synced / Retrying (offline retry queue). If local storage is unavailable or a write fails (quota, private mode), the editor falls back to immediate per-change cloud sync and says so in the indicator — never a false "Saved locally". (Fallback mode is a degraded state exempt from NFR-1's no-added-latency clause; the indicator makes the mode visible. AD3's rejection of per-change sync applies to the default path only.) Turning the periodic cloud autosave off shows an explicit data-loss warning (browser storage can be evicted). On every lock acquisition (FR-D18), the cloud snapshot is authoritative: the local doc is replaced before editing resumes, so a stale local copy never overwrites synced work. (Mechanism: `addendum.md` §AD1.)
- **FR-D11** Keyboard: ⌘K insert section · [ and ] shuffle variant · ⌘D duplicate · Del delete · ⌘Z / ⇧⌘Z · ⌘S save now · 1/2/3 device preview · L layers · . (period) dark toggle · Esc deselect.
- **FR-D12** **Section Picker:** full-screen overlay with left category rail, search, and live previews rendered *in the project's current Style Pack* with the project's content source — the user browses the library already wearing their brand. Free/Pro badges; Free users can add any Pro section — the canvas is open; enforcement happens at the exits (FR-L3). Insertion lands at the invoked position.
- **FR-D13** **Variant Shuffle:** cycles the selected section through its category's variants in place. The shared per-category content model remaps the user's content; props a variant doesn't use are preserved invisibly and restored if shuffled back. The same rule governs list items: a variant renders only as many items as its structure fits (8 items shuffled into a 3-card layout shows 3); surplus items are preserved invisibly and reappear on shuffling back, and the sidebar shows the count ("8 items · 3 shown in this design"). Works via hover arrows, sidebar carousel, and [ ] keys.
- **FR-D14** Canvas is site-width, fit-to-viewport with vertical scroll. No zoom in v1. No hard cap on sections per template (a deliberate contrast to competitors' structural caps); the editor must hold NFR-1 performance on the 40-section stress fixture (NFR-1); beyond it, behavior degrades gracefully — slower is acceptable, lockups and state corruption are not.
- **FR-D15** Content-source pill: "Previewing with: {site} / Sample content", switchable when a site is linked.
- **FR-D16** **Member-state preview:** view canvas as Anonymous / Free member / Paid member; members-aware sections (nav auth links, subscribe CTAs, paywall) re-render accordingly. With a linked site, gated post bodies render Orbit Weekly stand-in text with a "gated content — shown with sample text" indicator: the browser-safe Content API never returns members-only content, so real gated bodies are not previewable (golden fidelity tests exclude gated-body equivalence).
- **FR-D17** **Site Remix:** one action re-rolls the whole canvas — Style Pack and/or every placed section's variant — with all content preserved via the shared per-category content model (FR-D13). Scoped re-roll (pack only / variants only), single-step undo, and never-lose-content are hard requirements. Site-wide singletons (header/announcement/footer) are excluded from Remix unless explicitly included.
- **FR-D18** **Edit lock (single active editor):** one editing context per project across tabs, browsers, and devices. Opening the project elsewhere yields read-only mode with a "Request editing" nudge. On accept, the current holder syncs its changes to the cloud, releases the lock, and becomes read-only; the requester gains edit rights. Locks carry a heartbeat whose payload includes the holder's unsynced-edit count. If a nudge goes unanswered, the requester is notified — "No response; that session has X unsaved edits" — and may take over anyway: the lock transfers, the requester refreshes to the last synced snapshot, and starts editing. A revived former holder becomes read-only and is told concretely what was lost — the message states the count in edits ("That session had 14 unsaved edits; they were not included"); those edits are not recoverable (the device's local journal is cleared on its next hydrate — FR-D9/AD1). **Deploy and ZIP export require the edit lock:** from a read-only session, invoking Ship it or Export first prompts a take-over — surfacing "X unsaved edits exist elsewhere" — so a stale cloud snapshot can never silently ship. (Mechanism: `addendum.md` §AD2.)

### FR-E · Style Packs

- **FR-E1** Token set per pack: colors ×2 modes (background, surface, text, muted text, border, accent, on-accent), heading font + body font (from a curated pool of ~30 Google Fonts pairings — self-hosted in generated themes at compile, FR-J3), radius scale (Sharp/Soft/Round), spacing density (Compact/Comfortable/Airy — a pack-level token, distinct from the per-section Vertical spacing scale Compact/Comfortable/Spacious), **site width (Narrow/Normal/Wide) + gutters (Compact/Comfortable/Spacious)** (sections span the site width by default and stay responsive within it), button style (Solid/Soft/Outline/Pill), shadow level (None/Subtle/Lifted), link style (Underline/Accent).
- **FR-E2** **12 curated presets** ship, each with hand-tuned paired light + dark palettes (Appendix D). Switching packs restyles the entire canvas live — this is a designed "wow" moment (≤ 300 ms crossfade).
- **FR-E3** Every token is user-editable per project (color pickers and font pairing list live here and only here — P2). Per-mode palette editing. Custom packs are deliberately per-project — there is no account-level custom pack library in v1 (duplicate a project to carry a look forward). Token edits run a live AA contrast check on token pairings and warn on failures (mirroring FR-Q5's promotion caution) — a warning, never a block.
- **FR-E4** Tokens compile to CSS custom properties in the generated theme: light values on `:root`, dark values in a `prefers-color-scheme: dark` media query (applied when `color_scheme` is Auto — pure CSS, so Auto works with JS disabled) and on `[data-mode="dark"]`, which the mode-toggle JS sets to override the system preference when the visitor picks a mode explicitly. Sections consume tokens exclusively, so pack changes can never break a layout.
- **FR-E5** Auto-branding (FR-C4) seeds accent color and logo into the active pack.

### FR-F · Control System (the closed vocabulary)

- **FR-F1** Controls come from a **shared vocabulary of simple, visual, named-value types**. Core set: **Layout Picker** (mini-diagram thumbnails), **Segmented Control**, **Stepper** (e.g. columns 2/3/4), **Toggle**, **Named Select** (word values only), **Swatch Row** (Style Pack roles: Base/Surface/Accent/Contrast/Image — never a color picker), **Image Picker** (opens Asset Library), **Icon Picker** (curated Lucide set), **Link Picker**, **Text Field/Area**, **Date Picker** (calendar popover, site timezone — e.g. countdown targets). The vocabulary may grow when a section genuinely needs a new type, provided the control stays simple and P2-compliant (visual/named values — never raw CSS, units, or hex). One shared type per need; no per-section one-offs.
- **FR-F2** No units, no hex, no CSS concepts at section level (P2). Spacing = Compact/Comfortable/Spacious. Site width and gutters are Style Pack tokens (FR-E1); sections span the site width by default — width is not a per-section control.
- **FR-F3** Sidebar structure: 3–5 **Quick Controls** pinned on top (chosen per section as the highest-impact decisions), then Content / Layout / Style / Data accordion groups. Hard cap ≈ 15 visible controls per section; Data group appears only on dynamic sections.
- **FR-F4** Per-control reset-to-default and whole-section reset. Every control change paints its optimistic UI within one frame; the resulting canvas re-render completes within G6's 100 ms budget on the NFR-1 reference environment (one budget per interaction — no competing numbers).
- **FR-F5** Mode-scoped controls carry a moon badge when a dark override exists (FR-D7).
- **FR-F6** **Link Picker** is Ghost-aware: internal pages/posts/tags/authors (live-searched from the connected site, or sample data), **Portal actions** (Sign up, Sign in, Account, Upgrade — compiled to `data-portal` attributes), external URL, and email. Internal link targets are re-validated against the connected site at compile; dead links (target deleted on Ghost) and links minted against a different site surface as pre-deploy warnings.
- **FR-F7** Controls are schema-driven from the section registry: one schema definition powers the sidebar UI, validation, defaults, dark-override capability flags, and the compiler (P4).

### FR-G · Section Library

- **FR-G1** The library ships with **34 categories and 487 unique variants** as inventoried in Appendix A. Appendix A is normative: every listed variant is a launch deliverable.
- **FR-G2** Every category includes **at least 2 Free-tier variants** so a Free user can ship a complete, good-looking site. Free variants are marked [Free] in Appendix A; all others are Pro.
- **FR-G3** Section registry entry format: `{ id, category, name, tier, contentSchema, controlSchema, quickControls[], hbs, css, js?, dataBindings?, darkCapabilities, previewSeed }`. The registry is data + files, versioned in the repo, and is the single input to both the editor runtime and the theme compiler.
- **FR-G4** Every variant must be: responsive 390 → 1440+ with no horizontal overflow; WCAG 2.1 AA (contrast via token pairs, focus-visible, semantic landmarks — the AA guarantee is scoped to shipped packs and library defaults; user token edits are warned, never blocked, FR-E3); token-driven only; functional with JS disabled (JS is progressive enhancement — marquees pause, accordions render open, load-more **and infinite scroll** fall back to numbered links, and Auto dark mode applies via the `prefers-color-scheme` media query — FR-E4).
- **FR-G5** Uniqueness bar: variants within a category must differ in **layout/structure**, not merely spacing or emphasis. A reviewer must be able to name what is structurally different about any two variants.
- **FR-G6** Section CI (see NFR-6): every variant renders in the matrix (3 Style Packs × light/dark × 3 viewports), compiles into a sample theme that passes gscan, and has a stored screenshot baseline for visual regression.

### FR-H · Data Binding & Content

- **FR-H1** The Ghost data surface available for binding is cataloged in Appendix B. It reflects the Ghost Content API resources — **Posts, Pages, Tags, Authors, Tiers, Settings** — plus Handlebars template context (`@site`, `@member`, pagination) available at render time on the live site.
- **FR-H2** Dynamic sections expose a **Data** control group: Source (Latest / Featured / By tag / By author / Hand-picked posts), Count, Order (Newest/Oldest), and show/hide toggles for meta (date, author, excerpt, reading time, tag chip). On every template Ghost natively paginates — **index, custom collections, and the tag and author archive templates** (Ghost serves archives the same paginated `posts` context and `/page/N/` URLs as collections; a `{{#get}}`-driven feed with a fixed Count renders identical content on every page of an archive) — exactly **one section is designated the main feed**: it is bound to the native paginated `posts` context (never `{{#get}}`), sized by the global `posts_per_page` (FR-Q1) instead of a Count, and it alone exposes **Pagination style: Numbered (`/page/2/`) / Load More / Infinite scroll** (designs in Appendix A §34). All other feed sections are `{{#get}}`-driven: fixed Count, never paginated. The editor marks the main feed visibly. A paginated template with **zero** feed sections is allowed (e.g. a feed-less marketing homepage): pre-deploy checks warn that the template's `/page/N/` URLs would duplicate the page, and the compiler emits an SEO guard on such templates (`noindex` beyond page 1 plus a canonical link to page 1) so Ghost's automatic pagination never produces indexable duplicates. Designation has a defined lifecycle: the first feed section placed on a paginated template auto-designates as the main feed (tag and author templates start with a designated main feed from the Synthesis Defaults); deleting or hiding it transfers designation to the next feed section (or the zero-feed rules apply); the user can reassign it anytime.
- **FR-H3** **Sample dataset "Orbit Weekly":** a bundled fictional publication — 12 posts with feature images/excerpts/reading times, 6 tags, 3 authors with portraits and bios, 2 tiers (Free + "Supporter" with monthly/yearly prices and benefits), nav, and brand assets. All imagery is internally produced (license-clean). Every section's `previewSeed` maps into this dataset so any section drops in looking finished.
- **FR-H4** With a linked site, the editor fetches real content **client-side** from the site's Content API (browser-safe, cacheable by design) with SWR-style caching (60 s) and silent fallback to Orbit Weekly on network failure (with a subtle indicator). When the site has fewer or zero items than a section requests, the canvas renders what exists plus an editor-only indicator ("this site has 2 posts; section shows up to 6"); compiled sections render gracefully with fewer items, and a section bound to zero items renders nothing on the live site.
- **FR-H5** **Helper-emulation layer:** the canvas renders real section `.hbs` via Handlebars-in-browser with a Ghost-helpers shim implementing the subset the library uses: `{{#foreach}}`, `{{#get}}` (mapped to Content API queries with NQL filters), `{{img_url}}` (URL pass-through / asset resolution), `{{date}}`, `{{reading_time}}`, `{{#match}}`, `{{#if @member}}`, `{{navigation}}`, `{{asset}}`, `{{content}}`, `{{title}}`, `{{excerpt}}`, `{{url}}`, `{{tags}}`, `{{authors}}`, `{{t}}` (string catalog + user overrides — FR-Q6), pagination context (`page`/`pages`/`total`/`next`/`prev`), truthy helpers — the full Appendix B surface. `{{comments}}` renders a styled placeholder on canvas (Ghost's comments UI is an injected members script that cannot run in the canvas iframe). Emulator fidelity is enforced by golden tests comparing canvas HTML to live-Ghost-rendered HTML for a fixture theme (NFR-6).
- **FR-H6** The `{{#get "tiers"}}`-bound sections (Pricing, paywall, members pages) show live tier names, prices, currency, and benefits from the connected site; sample tiers otherwise. Connect (and the daily health check, FR-C5) records whether membership and paid tiers are enabled on the site; placing portal/signup/paywall sections on a site with members disabled warns in the editor, and a pre-deploy check repeats it — a theme never ships dead signup forms unannounced.

### FR-I · Templates & Routing (routes.yaml)

- **FR-I1** Standard template set always compiled: `default.hbs` (synthesized shell: head, fonts, tokens, header/footer partials, `{{ghost_head}}`/`{{ghost_foot}}`, `{{body_class}}`), `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs`. Members templates (`members/signup.hbs`, `signin.hbs`, `account.hbs`) compile **only when the user has designed them**; designing one automatically adds its route (e.g. `/signup/` → the signup template) to `routes.yaml`, visible in the Routes Manager. Untouched members flows are served by Ghost's native Portal — no dead files ship. Removing every section from a designed members template returns it to untouched: its file and auto-added route are not emitted on the next compile. `private.hbs` follows the same conditional pattern: it compiles only when a Private Site Gate section (Appendix A §31) is designed.
- **FR-I2** **Routes Manager** (dedicated surface reachable from the editor): a visual builder for `routes.yaml` — define **collections** (URL prefix, filter, assigned template — page size is always the global `posts_per_page`, FR-Q1; Ghost has no per-collection page size) with a rich filter builder (All/Any condition groups over tag, author, primary tag/author, featured, visibility, published date, has-feature-image — compiled to NQL) and drag-to-reorder collection precedence; **channels** (filtered post streams with their own path and RSS feed); **custom routes** (static path → custom template); and taxonomy prefixes; plus a live YAML preview pane and validation (path collisions, unknown templates, filter syntax) before save. All of this ships in v1.
- **FR-I3** Custom templates created in the Routes Manager (compiled as `custom-{name}.hbs`) appear in the template switcher as designable canvases and are also assignable to individual Ghost pages from the Ghost editor (documented). The switcher's "+ New template" is a shortcut that deep-links into this Routes Manager flow — one creation flow, two entry points. Deleting a custom template (or its route) in the Routes Manager warns when the template has designed content — the canvas is deleted with it (recoverable via undo, FR-D9) — and the switcher drops the removed template; an editor viewing it switches to Home with a notice.
- **FR-I4** `routes.yaml` is included in the theme zip **and** uploading it to Ghost requires a separate step in Ghost Admin (Settings → Labs). Ghost exposes **no official public API** for routes upload, so the guided "one more step" card (download button + Labs instructions) is the primary, documented flow. Where the connected Ghost version is verified to accept the community-known internal routes endpoint, Inflozo may attempt automated upload first and fall back gracefully. Deploys never silently skip routes. Inflozo tracks the last routes.yaml **offered** per site (in the manual flow Inflozo cannot observe whether the Labs upload was completed); whenever the compiled routes differ from it — including route removals, a routeless project deploying after a routed one, and rollbacks — the "one more step" card resurfaces. After the user confirms upload, Inflozo verifies where possible by fetching a representative route URL on the live site; until verified, the site shows a "Routes unverified — did you upload routes.yaml?" reminder state. Drift is always surfaced, never assumed away.
- **FR-I5** Projects that never open the Routes Manager compile with Ghost's default routing (no routes.yaml surprises). Exception: designed members pages auto-emit their routes (FR-I1) — designing one is, in effect, opening routing.

### FR-Q · Theme Settings (global config & Ghost custom settings)

- **FR-Q1** A dedicated **Theme Settings** surface (reachable from the editor, sibling to the Routes Manager) configures global theme values compiled into `package.json`: `posts_per_page` (default 12) and any future config Inflozo manages. This replaces per-section derivation — feed sections' Count controls govern only their own `{{#get}}` queries.
- **FR-Q2** **Custom settings builder:** the user defines Ghost `@custom` settings for their theme — name, type (select / boolean / color / image / text — Ghost's exact five), options, default, Ghost Admin group (Site wide / Homepage / Post), optional visibility condition on another setting — compiled into `package.json` `config.custom` and thereafter editable by the site owner in **Ghost Admin → Design settings** without redeploying. Inflozo enforces Ghost's 20-setting cap with a visible meter — **3 slots and their keys are reserved for the dark-mode built-ins (FR-Q5) in every project, Light-only included**, so user-defined settings cap at 17 and toggling dark mode on or off can never overflow the cap or collide with a built-in key — generates lowercase snake_case keys, validates select defaults against options, and disallows defaults on image settings (Ghost rule). **Setting keys are immutable once deployed or exported** (export mirrors deploy, FR-J12 — a manually installed exported theme has stored values to protect too) — renaming a key on a later deploy is a breaking change that would erase the site owner's stored value, so the builder treats keys as permanent identifiers (rename changes the label only). Keys are unique per project; deleting a setting warns that re-creating the same key later would resurrect the site owner's stored value.
- **FR-Q3** A custom setting takes effect by **binding**, and its Ghost type follows from what is promoted — all five types are available: section controls flagged "expose to Ghost Admin" (**Toggle → boolean** · **Segmented / Named Select / Layout Picker → select** · **Image Picker → image** · **text prop → text** — Ghost Admin text settings are plain strings, so binding a text prop shows an upfront confirm: "This text won't support formatting while it's editable in Ghost Admin — bold, italic, underline, and links will be removed and disabled." On confirm, any existing inline marks are stripped and inline formatting is disabled for that prop for as long as the binding exists; removing the binding re-enables formatting) and the Style Pack accent token (**accent → color**; color promotion is accent-only in v1, FR-Q5). The compiled theme reads `{{@custom.*}}` at render time instead of the baked value for every bound control or token. Deleting, hiding, or shuffling away a section that carries a bound control warns about the binding; compile validation rejects dangling bindings (the setting must be re-bound or removed), so a theme never ships dead Ghost Admin settings or unread `{{@custom.*}}` values.
- **FR-Q4** The canvas previews custom settings at their defaults; compile validation + gscan cover the generated custom config.
- **FR-Q5** **Dark-mode built-ins:** Light+Dark projects always compile three built-in custom settings — `color_scheme` (Auto/Light/Dark — Auto follows the visitor's system preference in pure CSS, FR-E4; Light/Dark pin a mode), **Dark accent color** (color; default = the pack's hand-paired dark accent), and **Dark logo** (image; falls back to the light logo when unset) — leaving 17 slots for user-defined settings. The three built-in slots and keys are reserved in every project — Light-only projects simply don't compile them (FR-Q2) — so switching modes never overflows the cap. Color promotion is **accent-only in v1** (FR-Q3): promoting the accent creates the *light* setting, and its dark counterpart — the Dark accent built-in — already exists, so both modes stay owner-controllable as a pair. Other pack tokens have no dark built-in counterpart and are not promotable (deferred: Appendix G). Promoting the accent shows a one-time caution ("once this lives in Ghost Admin, contrast is in your hands" — AA cannot be re-validated post-deploy). Promoted colors compile as an inline token block in `default.hbs` (runtime values cannot live in static CSS).
- **FR-Q6** **Translations module:** every compiler-generated, visitor-facing **chrome string** — labels that are not user-editable text props: pagination ("Older posts", "Newer posts", "Page {page} of {pages}"), load-more/infinite-scroll labels, member form feedback (success/error/confirmation), error-page copy, search placeholder, skip-link, lightbox/gallery labels, "Read more"-type card labels — lives in one **standard string catalog** in the section registry. Sections and shared partials consume catalog strings exclusively via Ghost's `{{t}}` helper (readable-English keys, `{placeholder}` variables) — never hard-coded literals; compile validation enforces this. A dedicated **Translations** surface (sibling to Theme Settings, FR-Q1) lists the catalog with English defaults and lets the user override any label, in any language. Compiled themes ship `locales/` files: the site-language file carries the user's labels (language code defaults to the connected site's `@site.locale`, user-selectable for unlinked projects), and `en.json` always ships so every key resolves — Ghost selects the file from the site's publication-language setting. The canvas renders the user's overridden strings (via the `{{t}}` shim, FR-H5); ZIP export includes the locale files.

### FR-J · Theme Compiler & Deploy

#### Compile

- **FR-J1** Compiler input: project doc (per-template ordered section instances with content values, control values, dark overrides) + Style Pack + routes config + referenced assets. Output: a complete Ghost 5.x/6.x-compatible theme (Handlebars, `ghost-api: v5` engine declaration) matching the structure in §7.4.
- **FR-J2** `package.json`: project-derived name/description/version; `card_assets: true`; standard `image_sizes` map; `posts_per_page` from Theme Settings (FR-Q1); `custom` = the dark-mode built-ins (FR-Q5, Light+Dark projects) plus any user-defined custom settings from FR-Q2 (cap-enforced, P3).
- **FR-J3** Assets: only assets actually referenced by the project are copied into `assets/images/` with content-hashed filenames; fonts are **self-hosted** — the compiler bundles woff2 subsets of the project's font pairing (from the curated ~30-pairing pool, FR-E1) into `assets/fonts/` with `@font-face` and `font-display: swap`; generated themes make no third-party font requests (Google Fonts hotlinking is a documented GDPR liability for EU site owners, and a runtime dependency P5 forbids). Section CSS is emitted only for placed sections; global CSS = token block + base/reset + shared primitives + `cards.css` (Koenig treatment per Appendix A §33).
- **FR-J4** JS: behavior modules bundled only if used (mobile nav, load-more, infinite scroll, marquee, accordion, lightbox, TOC scroll-spy, count-up, mode toggle). Vanilla JS, no framework, deferred.
- **FR-J5** Generated markup follows Ghost theme requirements: `{{ghost_head}}`/`{{ghost_foot}}`, `{{body_class}}`, `{{post_class}}`, no deprecated helpers, `{{img_url}}` with `srcset` + WebP + lazy loading below the fold for Ghost-hosted content images (theme-bundled assets ship pre-generated responsive sizes from compile), portal `data-portal` attributes, paywall via `{{#unless access}}`; all chrome strings emit via `{{t}}` against the shipped `locales/` files (FR-Q6) — no hard-coded visitor-facing literals.
- **FR-J6** **gscan gate:** every compile runs gscan server-side. Errors block deploy with human-readable mapping; warnings are surfaced but deployable. Target for all library output: 0 errors, 0 warnings.
- **FR-J7** Artifacts: each successful compile stores the zip in a `deploy-artifacts` bucket (excluded from the user's asset quota). Retention: last 10 per project (Pro) / last 3 (Free).

#### Deploy & rollback

- **FR-J8** Deploy: server-side upload to the site's Admin API (themes upload endpoint) with optional **Activate** (owner requirement: "deploy only" vs "deploy and activate" are distinct buttons). Progress UI: Compiling → Checking (gscan) → Uploading → (Activating) → Live, with friendly error surfacing (auth failed → reconnect CTA; version mismatch; Starter-plan block per FR-C2). Cancel is available during Compiling/Checking; once Uploading starts, the deploy runs to completion (idempotent; rollback covers regret).
- **FR-J9** **Rollback:** deploy history per project×site lists version, timestamp, gscan summary, active badge; any retained artifact redeploys in one click. Rollback is exempt from FR-L3's Pro exit gating — restoring an artifact that already ran is always allowed, on any plan. Rollback and snapshot restore (FR-J13) redeploy stored artifacts, not the working document, so they never require the edit lock (FR-D18).
- **FR-J10** Theme naming: `inflozo-{project-slug}`, auto-incremented semver per deploy; version shown in Ghost Admin and the history list. **The theme name freezes per site, at the project's first deploy to that site** — each site gets its own frozen name, and deploying the project to a different site later freezes a fresh name there. Renaming the project afterwards changes its display name in Inflozo only, so renames never orphan old themes in Ghost Admin and rollback history stays coherent per site. Theme names are unique per site; a collision at first deploy to a site auto-resolves with a slug suffix (e.g. `inflozo-blog-2`), surfaced to the user — never overwriting another project's deployed theme, and never deadlocking on the frozen name.
- **FR-J11** Deploys are rate-limited (10/hour per site) and idempotent; a failed upload never leaves a partially active theme.

#### Lifecycle

- **FR-J12** **Theme ZIP export (all plans):** any project can download its compiled theme zip, Free included. Projects containing Pro sections on a Free account are blocked per FR-L3's exit rule. Export gating mirrors deploy gating exactly.
- **FR-J13** **Pre-activation snapshot ("safe installs"):** at Inflozo's first theme upload to a site (deploy-only included — manual activation in Ghost Admin must not bypass the safety net), download and archive the currently active theme as a restorable artifact (excluded from asset quota, exempt from history-retention pruning). Theme *download* is an **internal, undocumented** Admin API capability (Ghost's documented API covers upload/activate only — same problem class as the routes endpoint, FR-I4): verifying it per Ghost version/host on all four §4 targets is an acceptance criterion, and where it is unavailable the degraded path is a **designed flow**, not a warning toast — the user is told before activation that no snapshot could be captured, and that Ghost retains the previous theme under Settings → Design, with guidance to reactivate it there. **Restore scope is signature-gated:** every Inflozo-built theme carries identifying metadata (the `inflozo-*` name plus a `package.json` marker). Rollback and automated restore are guaranteed only for Inflozo-signed themes (rebuilt from Inflozo's own stored artifacts — no download endpoint needed); a third-party active theme is archived on a best-effort basis and otherwise never touched, and Inflozo does not guarantee restoring it beyond the snapshot or the Settings → Design guidance. Restoring a snapshot is a one-click redeploy. The snapshot is a per-site artifact keyed by site URL — it survives project deletion **and** site disconnect/reconnect, and is never re-captured while the active theme is an `inflozo-*` theme, so restore-to-original can never silently become restore-to-Inflozo. Domain changes are handled by editing the URL in Manage keys (FR-C8), which carries the site record and its snapshot to the new URL — a moved domain never strands a snapshot. Restoring the snapshot skips the gscan gate (it restores exactly what previously ran).
- **FR-J14** **Library updates & redeploy:** the section library and Style Packs are versioned with Ghost compatibility in mind. When the library advances beyond what a project's last deploy used, the project shows an "Updates available" notice with a human-readable summary of what changed (grouped by category, naming the project's affected placed sections). Compiles always use the current library version (a single live library, no per-project pinning — chosen for implementation simplicity); consequently **any redeploy includes all library changes since the project's last deploy** — there is no way to redeploy without them — and the canvas always renders the current library. Because the update is inseparable from the redeploy, the deploy flow makes it consensual: whenever the library has advanced since the project's last deploy, a **mandatory confirm step** lists the changes ("This deploy includes library updates: … — continue?") before compile proceeds. A live site never changes except through a user-initiated redeploy plus this confirmation. Library releases are bound by a **backward-compatibility contract**: variants are never deleted, only superseded (hidden from the Section Picker; placed instances keep rendering); section content/control schema changes are append-only or ship a migration map applied to existing project docs; and a placed section that no longer resolves degrades to the nearest current variant with a visible notice — never a silent re-render, never a failed load. **Post-launch cadence (retention commitment):** the library keeps growing after GA on a regular cadence — target: monthly drops of new variants and/or Style Packs — delivered through this update flow; the Evergreen differentiator (§1.4) is an ongoing commitment, not a launch artifact.
- **FR-J15** **Credits & white-label:** generated themes include a "Built with Inflozo" credit in both README.md and the theme footer by default. Pro accounts can disable both per project; Free deploys and exports always retain credits. The A3 footer sections' credit toggle is this same per-project setting surfaced in context — Pro-gated, locked on for Free. If a Free design has no visible footer section, the compiler appends a minimal credit line to `default.hbs`'s footer region.

### FR-K · Asset Library

- **FR-K1** **Global per-account** library (used across all projects), grid view with search, type filter (Image/SVG/Logo), and sort (Newest/Name/Size).
- **FR-K2** Upload via drag-drop/multi-select. **Client-side optimization before upload:** raster images convert to WebP (q≈82), max long edge 2400 px; input cap 10 MB/file; SVGs sanitized (script/foreignObject stripped). Original filename preserved as display name. Optimization is destructive by design — originals are not retained; the upload UI states the trade-off ("Images are optimized (WebP, max 2400 px); originals aren't stored"). Conversion must work on every supported browser (NFR-7): where the browser cannot encode WebP natively (Safari), a bundled encoder or server-side transcode covers it — no browser silently uploads unoptimized originals (acceptance criterion).
- **FR-K3** Quota metering with an always-visible meter on the library page (Free 100 MB / Pro 5 GB) and upload-time enforcement with upgrade prompt.
- **FR-K4** Per-asset usage: "Used in 3 projects" chip; deleting a used asset warns and lists affected projects (deleting replaces with a placeholder in canvases; compile blocks until resolved).
- **FR-K5** Editor delivery via Supabase Storage CDN (cached egress); at deploy, referenced assets are bundled into the zip (P5).
- **FR-K6** Asset detail actions: **Replace** (swaps the file behind the asset; every usage across all projects updates), **Copy URL**, **Download**.

### FR-L · Plans & Billing (Dodo Payments)

- **FR-L1** Plans per Appendix F. Checkout via Dodo hosted checkout (monthly $15 / yearly $150), Dodo as merchant of record (taxes handled by Dodo). Checkout pre-selects the **yearly** plan (two months free), with monthly one click away — both prices always shown, never a dark pattern. No time-boxed Pro trial: the open canvas (FR-L3) is the trial.
- **FR-L2** Webhooks (subscription activated / renewed / payment failed / cancelled) drive an `entitlements` state machine covering the full transition table: `free → pro_active` (activation), `pro_active → pro_past_due` (payment failed; 7-day grace, banner), `pro_past_due → pro_active` (late payment recovers), `pro_past_due → free` (grace expires), `pro_active → free` (cancellation at period end). Webhook handlers are idempotent and signature-verified. On return from Dodo checkout, the server verifies the subscription state directly and grants `pro_active` without waiting for the webhook — a paying user is never blocked at an exit gate by webhook lag.
- **FR-L3** **Free-tier gating — open canvas, gated exits:** Free users can place, shuffle, and edit any Pro section on canvas (marked with a subtle ✦ badge). Enforcement happens only at the exits: deploy, ZIP export, and any surface exposing compiled theme code all block for a project containing Pro sections, with an itemized "Pro sections in this design" sheet (upgrade or swap each to a Free variant via Shuffle). **Downgrade rules (explicit):** existing deployed themes are never touched; on the Free plan in an over-limit state, all but one project become read-only — the user chooses which stays editable (default: most recently updated); read-only projects stay viewable and become editable again on Pro. The same block-until-resolved pattern governs every over-limit resource — Inflozo never auto-deletes: while connections exceed the Free cap, deploys are blocked until the user disconnects down to it (each site's pre-Inflozo snapshot survives, FR-J13); an over-quota asset library goes read-only (existing files stay, uploads blocked) until the user deletes below the Free cap; retained artifacts above Free's 3 are kept but no new ones are retained. An itemized sheet lists exactly what is over and by how much. There is no dormant or frozen connection state — a connection either counts against the cap or is disconnected. Safety operations — rollback (FR-J9) and snapshot restore (FR-J13) — remain available throughout **for connected sites**; they execute via the site's Admin API, so a disconnected site has neither until reconnected (a reconnection performed to run a restore counts against the connection cap like any other). Hidden sections are excluded from compilation and therefore never trigger exit gates.
- **FR-L4** Billing page: current plan, renewal date, invoices (Dodo customer portal link), upgrade/cancel/resume, plan-limit meters.
- **FR-L5** Contextual upgrade prompts at exactly four moments: 2nd project, 2nd site, quota exceeded, Pro-section deploy/export block. Never a blocking interstitial elsewhere — and never while playing with Pro sections on canvas.

### FR-M · Suggestions Board

- **FR-M1** Custom-built on Supabase (no third-party). Categories: Section idea / Feature / Integration. Statuses: Open / Planned / Building / Shipped.
- **FR-M2** Signed-in users submit (title, description, optional image) and upvote (one per user per suggestion). No comments in v1. Abuse controls: per-user rate limits on submissions and votes, title/body length caps, harder throttling for new accounts; images go through the FR-K2 upload pipeline (type/size limits, sanitization).
- **FR-M3** Public read-only board on the marketing site; the identical board lives in-app. Sort by Top / New / Status. Suggestion text appears immediately; an attached image renders on the public board only after admin approval (until then it is visible in-app to its author and to the admin).
- **FR-M4** Admin claim: edit status, merge duplicates, hide spam, approve suggestion images for the public board (FR-M3).

### FR-N · Marketing Website

- **FR-N1** Pages: **Home, Features, How It Works, Sections Gallery, Pricing, Suggestions, Docs, Contact, Changelog**, plus auth entry points and legal (Terms, Privacy, Refund policy — required for Dodo). Statically generated on the same Next.js app (the suggestions board fetches live data client-side — FR-M3). The Contact page includes a simple form relaying to the owner via Resend (FR-P3).
- **FR-N2** **Sections Gallery** (the flagship, in the spirit of Flowbite Blocks / Tailwind Plus): SSG page per category; each variant shown as a live render (same section runtime, Orbit Weekly data, sandboxed iframe) with a per-preview light/dark toggle, Free/Pro badge, variant name, and deep link; "Open in Inflozo" CTA. Category pages are the SEO engine ("Ghost hero sections", "Ghost pricing sections", …) with per-category OG images and sitemap coverage.
- **FR-N3** Home: product narrative with an animated editor mock (variant-shuffle moment as the hero demo), feature grid, how-it-works, gallery teaser, Style Pack strip, pricing teaser, FAQ, final CTA.
- **FR-N4** Docs (MDX): Getting started · Connecting your Ghost site (custom integration walkthrough with screenshots) · Deploying & rollback · **Hosting requirements** (self-hosted and Ghost(Pro) tiers; Starter limitation) · routes.yaml upload step · Theme Settings & custom settings · Style Packs · Asset Library · Plans & billing · Troubleshooting · FAQ. Every docs page carries a "Suggest an edit" affordance relaying to the owner via Resend (FR-P3).
- **FR-N5** The blog/changelog runs on **Ghost with an Inflozo-built theme** (dogfooding; linked from the footer as proof).

### FR-O · Starter Templates

- **FR-O1** **10 starters** ship (Appendix E), each a complete pre-wired project: all standard templates designed, Style Pack chosen, sample content mapped. **Members templates are excluded by design:** starters ship them present-but-undesigned, so Ghost's native Portal serves those flows, no routes.yaml is emitted (FR-I1), and a starter's first deploy never requires the manual routes step (FR-I4) — the confetti moment stays uninterrupted. Users opt into designed members pages later.
- **FR-O2** Starter chooser shows full-page scrollable previews with light/dark toggle before creation.
- **FR-O3** Starters are seeds — after creation they are ordinary projects with no linkage back.
- **FR-O4** At least two starters — **Quiet** and **Ledger** — are composed exclusively of [Free] variants end-to-end, so a Free account can ship a starter with zero swaps. The other eight are Pro-flavored by design.

### FR-P · Transactional Email

- **FR-P1** Exactly five user-facing transactional emails exist in v1 (plus the two owner-relay flows in FR-P3), sent via **Resend**: (1) magic-link sign-in and (2) email-change verification (Supabase Auth templates, branded, routed through Resend SMTP), (3) site "Reconnect needed" health alert (FR-C5), (4) payment failed / grace-period notice (FR-L2), (5) deploy failure notice.
- **FR-P2** No marketing, digest, or nudge emails in v1. "Theme updates available" (FR-J14) is surfaced in-app only — never by email.
- **FR-P3** **Owner-relay emails:** the marketing contact form (FR-N1) and the docs "Suggest an edit" affordance (FR-N4) relay submissions to the owner's address via Resend — platform as sender, submitter as reply-to, honeypot + rate limiting against spam.

---

## 6. Non-Functional Requirements

- **NFR-1 Performance (app):** editor time-to-interactive < 3 s (p75, warm); all canvas interactions 60 fps; control-change render < 100 ms; persistence is local-first and asynchronous — saving must never add perceptible input latency (FR-D10's no-local-storage fallback is exempt, honestly labeled); Section Picker preview lazy rendering; dashboard LCP < 2 s. **Reference environment:** a mid-tier laptop with 4× CPU throttle (Chrome DevTools); **stress fixture:** a 40-section template. All NFR-1 and G6 targets are pass/fail on this environment and fixture; beyond the fixture, graceful degradation (FR-D14).
- **NFR-2 Performance (output):** generated themes score Lighthouse mobile Performance ≥ 90 and Accessibility ≥ 95 on the fixture content set; zero console errors; total theme JS < 30 KB gzipped for a maximal design.
- **NFR-3 Security:** RLS on every table keyed to `auth.uid()`; Admin API keys in Supabase Vault, server-only, decrypted per request; short-lived Admin JWTs minted per call; the canvas iframe is same-origin (§7.3 requires direct rect measurement and inline editing), so all Content-API-sourced HTML — post/page bodies, HTML cards, excerpts — is sanitized before entering the canvas (script, iframe, and event-handler stripping; editor-preview only, compiled output untouched); SVG sanitization; CSP on app and marketing; deploy + upload rate limits; Dodo webhook signature verification.
- **NFR-4 Reliability:** autosave offline queue with retry/backoff; deploys idempotent with immutable artifacts; background site health checks; Supabase spend-cap alarms and usage dashboards; Supabase Postgres point-in-time recovery (PITR) enabled for user work-product, with a restore drill exercised before launch.
- **NFR-5 Accessibility:** the app itself meets WCAG 2.1 AA (keyboard-complete editor including reorder via keyboard, focus management in overlays, reduced-motion support).
- **NFR-6 Quality automation:** (a) **Render matrix** — every section variant × 3 reference Style Packs × light/dark × 3 viewports → Playwright screenshot baselines with diff gates; (b) **Compile CI** — nightly assembly of synthetic themes covering 100% of variants → gscan 0/0; (c) **Golden fidelity tests** — fixture theme rendered by live Ghost vs. canvas emulator, DOM-normalized diff; (d) **E2E** — Playwright against the live stack (pre-launch: production, per §4's mandate; post-launch: the Test environment, §4) covering: auth, connect, build, shuffle, dark authoring, deploy to all live Ghost deploy targets (§4), rollback, billing (Dodo test mode), quotas.
- **NFR-7 Compatibility:** evergreen Chrome/Edge/Firefox + Safari 16.4+; generated themes support Ghost 5.x **and** 6.x (`ghost-api: v5` engines covers both); Ghost 4.x and older are rejected at connect with a friendly "please update Ghost" message.
- **NFR-8 Privacy/compliance:** GDPR export + delete; no third-party trackers beyond privacy-respecting analytics; Dodo handles tax as merchant of record.
- **NFR-9 Observability:** Sentry (app + server), structured deploy logs (per-stage timing, gscan output), Supabase usage alerts at 60/80/95% of included quotas.

---

## 7. Technical Assumptions & Architecture Direction (for the BMAD Architect)

### 7.1 Stack

- **Frontend/app:** Next.js (App Router, TypeScript) on **Vercel** — one codebase serving marketing (SSG) at **inflozo.com** and the authenticated product at **app.inflozo.com** (two domains, one deployment).
- **Backend:** **Supabase** — Postgres (+ RLS), Auth (magic link + experimental passkeys, `supabase-js` ≥ 2.105.0 pinned), Storage (buckets: `assets/{userId}/…`, `deploy-artifacts/{projectId}/…`, `thumbnails`), Vault for Admin key encryption.
- **Server compute:** Vercel Node.js functions (not Edge) for: compile + gscan + zip, Admin API proxy (JWT mint), Dodo webhooks, health checks (Vercel Cron), thumbnail capture.
- **Payments:** Dodo Payments hosted checkout + webhooks (fee model noted in Appendix F).
- **Email:** Resend for all transactional email (FR-P); Supabase Auth SMTP routed through Resend for consistent branding.
- **Rendering:** Handlebars runtime in a same-origin iframe for canvas (isolation via content sanitization — NFR-3, §7.3); identical `.hbs` sources consumed by the server compiler (P4). The Ghost-helpers shim (FR-H5) is a first-class, golden-tested package.

### 7.2 Content & data flow

- Editor → user's Ghost **Content API** directly from the browser (browser-safe key; API is read-only, cacheable; resources: posts, pages, tags, authors, tiers, settings; NQL filters, `include` params, `Accept-Version` pinned).
- Editor → Inflozo server → user's Ghost **Admin API** only for: connection validation, theme upload/activate, routes upload attempt. Never from the client.
- Deployed sites: zero runtime dependence on Inflozo (P5).

### 7.3 Single-source section runtime (mandated)

One section = one `.hbs` + one CSS module (+ optional JS behavior + schemas). The editor overlays interaction chrome *outside* the iframe DOM (outline/handles positioned via measured rects), so the rendered markup is byte-comparable to shipped markup. Inline editing maps contenteditable regions to schema props via data-attributes emitted by the runtime in editor mode only (stripped at compile). The canvas iframe is **same-origin** — rect measurement and contenteditable require it — so isolation comes from sanitizing all Content-API-sourced HTML before render (NFR-3), not from the iframe boundary. **Any proposal to re-implement a section as a React preview component is rejected by this PRD.**

### 7.4 Generated theme structure

```
inflozo-{slug}/
  package.json          # ghost-api v5, card_assets, image_sizes, posts_per_page, custom (FR-Q5 built-ins + FR-Q2 user settings)
  routes.yaml           # only if Routes Manager used
  default.hbs           # shell: fonts, token block link, header/footer partials, ghost_head/foot
  index.hbs  post.hbs  page.hbs  tag.hbs  author.hbs  error.hbs
  custom-{name}.hbs     # per Routes Manager
  members/signup.hbs  signin.hbs  account.hbs   # only if designed (FR-I1)
  private.hbs           # only if a Private Site Gate section is designed (FR-I1, Appendix A §31)
  partials/…            # one partial per placed section instance group + shared (nav, pagination, paywall…)
  locales/…             # en.json always + site-language file with the user's label overrides (FR-Q6)
  assets/fonts/…        # self-hosted woff2 subsets of the project's font pairing (FR-J3)
  assets/css/screen.css # tokens + base + used-section styles
  assets/css/cards.css  # Koenig treatment
  assets/js/main.js     # used behaviors only
  assets/images/…       # hashed, referenced assets only
  README.md             # install + routes.yaml step + credits
```

### 7.5 Data model sketch

| Table | Key fields |
|---|---|
| `profiles` | user_id, display_name, created_at |
| `projects` | id, user_id, name, slug, style_pack jsonb, dark_enabled, linked_site_id?, thumb_path, updated_at |
| `project_templates` | project_id, template_key, doc jsonb (ordered section instances: sectionId, variantId, content, controls, darkOverrides, hidden), updated_at |
| `sites` | id, user_id, url, title, ghost_version, capability (full/preview_only), status, content_key, admin_key_vault_ref, last_checked_at |
| `assets` | id, user_id, path, bytes, mime, w, h, hash, display_name, created_at |
| `deploys` | id, project_id, site_id, version, artifact_path, gscan jsonb, status, activated, created_at |
| `subscriptions` | user_id, dodo_customer_id, dodo_subscription_id, plan, status, period_end |
| `suggestions` / `suggestion_votes` | id, user_id, category, title, body, image_path?, status, votes count |

All rows RLS-scoped to `user_id` (suggestions publicly readable). Registry, Style Pack presets, starters, and Orbit Weekly live in the repo as versioned data, not in the DB.

### 7.6 Key risks & mitigations

| Risk | Mitigation |
|---|---|
| Supabase passkeys are experimental | Magic link is primary; passkeys feature-flagged; client lib pinned |
| Ghost(Pro) Starter blocks custom themes | Inform at connect + authoritative deploy-error signal (FR-C2 — no detection API exists); Preview-only mode; docs |
| Helper-emulator drift vs Ghost releases | Golden fidelity tests against live Ghost 5.x and 6.x in CI; pinned Accept-Version |
| routes.yaml API upload unsupported on some hosts | Guided manual fallback is a first-class flow (FR-I4) |
| Dodo is a young MoR ($30 disputes, payout terms) | Idempotent webhooks, entitlement grace, revenue monitoring; swappable billing adapter |
| Library scale (487 variants) slips schedule | Factory workflow + shared primitives (Epics 9–11); render-matrix CI catches regressions cheaply |
| Sodo (Ghost's bundled search) styling limits | Styled trigger always; fully custom overlay variant uses client-side Content API search |

**Verify at build time** — external-world facts this PRD relies on that can change; re-confirm each before the dependent epic starts:
1. Ghost(Pro) 2026 plan lineup and the Starter custom-theme restriction (FR-C2)
2. Supabase passkey API status and `supabase-js` ≥ 2.105.0 behavior (FR-A2)
3. The community-known internal routes endpoint, per connected Ghost version (FR-I4)
4. The internal theme-download endpoint, per Ghost version/host on all four §4 targets (FR-J13)
5. Dodo Payments fee schedule and MoR terms (Appendix F)
6. Ghost 6 API pagination behavior — `?limit=all` removed, max 100 per page (Appendix B)

---

## 8. Epic Breakdown (BMAD sequencing)

> Each epic lists goal → representative stories → exit criteria. The SM agent expands stories with full acceptance criteria; scope is bounded by §5 and appendices.

**E1 · Foundations & Design System** — Repo, Next.js app, Supabase schema + RLS, CI/CD to live Vercel, design tokens/components per the design references at `_bmad-output/planning-artifacts/design/`, magic-link auth, base navigation shell. *Exit:* sign in on production; dashboard skeleton; RLS verified.

**E2 · Accounts & Passkeys** — Security page, passkey register/list/rename/revoke behind flag, email change, deletion cascade. *Exit:* passkey sign-in round-trip on production.

**E3 · Sites & Connections** — Connect wizard, server Admin proxy + Vault, Starter plan-awareness flow (FR-C2), auto-branding card, redesign proposals (FR-C7), health checks, multi-site management. *Exit:* all live Ghost deploy targets (§4) connected; Starter-block path verified.

**E4 · Section Runtime Platform** — Registry format, Handlebars iframe runtime, helpers shim, Orbit Weekly dataset, schema-driven controls engine, golden fidelity harness. *Exit:* 5 pilot sections render editor-perfect and compile byte-identical.

**E5 · Editor Shell** — Canvas + hover/selection chrome, layers, sidebar, template switcher, inline editing, picker overlay, Variant Shuffle, Site Remix, undo/autosave, device + member-state + dark toggles, keyboard map. *Exit:* full editing loop on pilot sections at 60 fps.

**E6 · Style Packs** — Token engine, 12 presets (paired dark), pack switcher moment, token editors, font pool. *Exit:* live restyle < 300 ms; packs verified across pilot sections.

**E7 · Compiler, Deploy & Routes** — Theme assembly, gscan gate, artifacts, deploy/activate, rollback, deploy history, ZIP export, pre-activation snapshot, library-update redeploy flow (FR-J12–J15), Routes Manager with channels + filter builder, Theme Settings surface + custom-settings builder + Translations module (FR-Q), YAML handling. *Exit:* pilot project deployed + rolled back on all live Ghost deploy targets (§4); routes round-trip.

**E8 · Asset Library** — Uploads with client-side WebP pipeline, quotas, usage tracking, picker integration, zip bundling. *Exit:* quota + bundling verified end-to-end.

**E9 · Library Wave 1 (156)** — Structure & chrome (headers, bars, footers) + Ghost content categories (grids, lists, featured, tags, authors, newsletter, search). *Exit:* wave passes render matrix + compile CI.

**E10 · Library Wave 2 (199)** — Marketing categories (A4–A16, Heroes through Contact). *Exit:* same gates.

**E11 · Library Wave 3 (132) + Starters** — Template-specific + members + Ghost-native groups; assemble 10 starters. *Exit:* every starter deploys 0/0 gscan to all live Ghost deploy targets (§4).

**E12 · Billing & Entitlements** — Dodo checkout, webhooks, entitlement machine, downgrade rules, upgrade prompts, billing page. *Exit:* live-mode $15 transaction; downgrade rules verified.

**E13 · Suggestions Board & Notifications** — Suggestions tables, board UI (app + public), voting, moderation; in-app notifications center (FR-B7). *Exit:* public read + authed vote on production; notification feed live.

**E14 · Marketing Site & Docs** — All pages, sections gallery with live previews, SEO/OG pipeline, docs, changelog on dogfooded Ghost. *Exit:* gallery renders all 487 variants; Lighthouse ≥ 95 on marketing.

**E15 · Hardening & Launch** — Full E2E suite, visual-regression sign-off, perf/a11y audits, quota alarms, legal pages, launch checklist. *Exit:* Definition of Done (§4) met.

---

## Appendix A — Complete Section Inventory (normative)

The full normative inventory — per-category content models, controls, and all 487 variant descriptors — lives in **`sections-inventory.md`** (same folder). That file remains **Appendix A** for all cross-references in this PRD and downstream documents (e.g. "Appendix A §34" resolves to its A34). Summary: **34 categories · 487 variants · 68 Free** (the first two variants in every category are [Free]).

| # | Category | Variant count | Group |
|---|---|---|---|
| A1 | Headers & Navigation | 16 | Structure & Chrome |
| A2 | Announcement Bars | 15 | Structure & Chrome |
| A3 | Footers | 16 | Structure & Chrome |
| A4 | Heroes | 18 | Marketing Sections |
| A5 | Features | 16 | Marketing Sections |
| A6 | CTA Banners | 15 | Marketing Sections |
| A7 | Pricing & Tiers | 15 | Marketing Sections |
| A8 | Testimonials | 15 | Marketing Sections |
| A9 | FAQ | 15 | Marketing Sections |
| A10 | Stats & Numbers | 15 | Marketing Sections |
| A11 | Logo Walls | 15 | Marketing Sections |
| A12 | About & Team | 15 | Marketing Sections |
| A13 | Process / How It Works | 15 | Marketing Sections |
| A14 | Galleries | 15 | Marketing Sections |
| A15 | Video & Embeds | 15 | Marketing Sections |
| A16 | Contact | 15 | Marketing Sections |
| A17 | Post Grids | 18 | Ghost Content Sections |
| A18 | Post Lists | 15 | Ghost Content Sections |
| A19 | Featured & Spotlight | 15 | Ghost Content Sections |
| A20 | Tag Collections | 15 | Ghost Content Sections |
| A21 | Author Showcases | 15 | Ghost Content Sections |
| A22 | Newsletter / Subscribe | 16 | Ghost Content Sections |
| A23 | Search | 15 | Ghost Content Sections |
| A24 | Post Headers | 16 | Template-Specific Sections |
| A25 | Post Content Layouts | 12 | Template-Specific Sections |
| A26 | Post Footers | 15 | Template-Specific Sections |
| A27 | Related Posts | 12 | Template-Specific Sections |
| A28 | Comments | 10 | Template-Specific Sections |
| A29 | Archive Headers | 14 | Template-Specific Sections |
| A30 | Members Pages | 15 | Template-Specific Sections |
| A31 | Error & Utility | 10 | Template-Specific Sections |
| A32 | Paywall / Content CTA | 12 | Ghost Native Elements |
| A33 | Koenig Card Treatments | 6 | Ghost Native Elements |
| A34 | Pagination Styles | 10 | Ghost Native Elements |
| — | **Total** | **487** | |

Variant counts are mirrored from `sections-inventory.md`, which is normative; on any conflict the inventory wins.

---

## Appendix B — Ghost Data-Binding Catalog (normative)

What Inflozo may bind, per the Ghost Content API (Posts, Pages, Tags, Authors, Tiers, Settings) and theme template context. The helper shim (FR-H5) must cover exactly this surface.

**`@site` (Settings):** title, description, logo, icon, cover_image, accent_color, url, locale, timezone, navigation[], secondary_navigation[], members_enabled, paid_members_enabled, comments_enabled.
**Post/Page:** title, slug, url, excerpt, custom_excerpt, feature_image (+ feature_image_alt, feature_image_caption), published_at, updated_at, reading_time, featured, access, visibility, primary_tag, tags[], primary_author, authors[], comment counts (via `{{comments}}` context).
**Tag:** name, slug, description, feature_image, accent_color, url, count.posts (via `include=count.posts`).
**Author:** name, slug, bio, profile_image, cover_image, website, twitter, facebook, url, count.posts.
**Tier:** name, description, type (free/paid), currency, monthly_price, yearly_price, benefits[], welcome_page_url (via `include=monthly_price,yearly_price,benefits`).
**`@member` (live-site runtime; editor simulates via FR-D16):** null | { name, email, status: free/paid/comped, paid flag }.
**Pagination context:** page, pages, total, next, prev → drives A34.
**Portal actions (Link Picker → `data-portal`):** signup, signin, account, signup/{tier}, upgrade.
**`@custom` in generated themes:** the dark-mode built-ins (FR-Q5) plus user-defined settings from the Theme Settings builder (FR-Q2) — Ghost allows 5 setting types and caps themes at 20 settings; Inflozo enforces the cap with a visible meter (P3).
**Query rules:** all editor reads via Content API with NQL filters (e.g. `tag:slug`, `featured:true`), `include=tags,authors`, `limit`, `order`, pinned `Accept-Version`. `{{#get}}` in shipped themes mirrors the same filters. Ghost 6 removed `?limit=all` across its APIs: every list read paginates (max 100 per page) — pagination is required on 6.x and works identically on 5.x.

## Appendix C — Control Vocabulary Reference (normative)

| Type | UI | Allowed values | Notes |
|---|---|---|---|
| Layout Picker | mini-diagram thumbnails | per-section layouts | the primary "arrange without CSS" control |
| Segmented | 2–4 labeled/icon segments | named options | e.g. alignment Left/Center |
| Stepper | − n + | small integer ranges | columns, item counts |
| Toggle | switch | on/off | show/hide anything |
| Named Select | dropdown | word values only | e.g. aspect Natural/Square/Wide |
| Swatch Row | role swatches | Base/Surface/Accent/Contrast/Image | never a raw color picker |
| Image Picker | opens Asset Library | user assets / bound image | per-mode swap capable |
| Icon Picker | searchable grid | curated Lucide subset (~120) | consistent stroke |
| Date Picker | calendar popover | a date (site timezone) | countdowns, scheduled content |
| Link Picker | typed search sheet | internal pages/posts/tags/authors · portal actions · URL · email | Ghost-aware (FR-F6) |
| Text Field/Area | inline + sidebar | text + inline marks (bold/italic/underline/link), per-prop limits | floating selection toolbar on canvas (FR-D4) |

Forbidden anywhere at section level: pixel/rem/percent inputs, hex/RGB pickers, font pickers, custom CSS, class names. These live only in the Style Pack editor (fonts/colors) — and nowhere else. The vocabulary is open but disciplined (FR-F1): new simple, named-value control types may join when sections need them (Date Picker has already joined). A slider with named ticks is sanctioned for app surfaces only — the Routes Manager, Theme Settings, and the Style Pack editor, where it sits alongside their date pickers and color popover — never as a section-level control. The hex-paste color popover remains exclusive to the Style Pack editor (P2).

## Appendix D — Style Packs (12 presets, paired light + dark)

Each pack = full token set (FR-E1). Fonts come from the curated ~30-pairing Google Fonts pool.

| Pack | Vibe | Heading / Body |
|---|---|---|
| Paper | warm minimal default; ivory, soft ink | Fraunces / Inter |
| Ink | high-contrast editorial, B/W + one red | Libre Caslon / Source Serif |
| Orbit | indigo tech, cool surfaces | Space Grotesk / Inter |
| Tangerine | playful coral + cream | Bricolage Grotesque / Inter |
| Slate | composed corporate blue-gray | Instrument Sans / Inter |
| Meadow | organic greens, rounded warmth | Gantari / Nunito Sans |
| Dune | sand + terracotta, sun-washed | DM Serif Display / DM Sans |
| Mono | brutalist grayscale, sharp radii | Archivo / IBM Plex Mono accents |
| Ocean | deep teal, airy light mode | Sora / Inter |
| Berry | plum + blush, magazine-feminine | Playfair Display / Karla |
| Neon | dark-first electric (light mode derived) | Unbounded / Inter |
| Quiet | near-monochrome literary calm | Newsreader / Newsreader |

Dark palettes are hand-paired (not algorithmic inversions): backgrounds deepen, surfaces lift, accents re-tuned for contrast, imagery scrims adjusted. Packs must pass AA on every token pairing used by the library.

## Appendix E — Starter Templates (10)

Full projects: Home + Post + Page + Tag + Author + 404 designed; pack pre-selected; Orbit Weekly mapped. Members templates ship present-but-undesigned in every starter (Ghost's Portal serves those flows; no routes.yaml is emitted — FR-O1/FR-I1).

1. **Aurora** — newsletter-first personal brand (Tangerine): Signup Hero, Issue Preview, Featured Split, Post List Editorial Rules, big-ask paywall.
2. **Gazette** — magazine (Ink): Magazine Cover hero, Magazine Mixed grid, Topic Tabs, masthead authors, serif post templates.
3. **Signal** — tech blog (Orbit): Split Editorial hero, Bento grid, TOC-right posts, command-palette search, stats band.
4. **Foundry** — startup blog + marketing home (Slate): Center Stage hero, Features Bento, Logo Wall, Pricing Toggle Cards, CTA band.
5. **Quiet** — ultra-minimal writer (Quiet): Center Stage hero (A4 #1), Editorial Rules list (A18 #1), Narrow Classic reading (A25 #1), Author Bio Card close (A26 #1) — all [Free] (FR-O4).
6. **Pulse** — podcast (Neon): Poster Modal hero, Episode List, platform CTA band, guest (author) showcases.
7. **Bloom** — lifestyle/food (Meadow): Collage hero, Photo Square grid, Galleries Masonry, recipe-friendly Docs-style posts.
8. **Chapter** — author/book site (Berry): Portrait Intro hero, book (page) spotlight, testimonial wall, mailing-list close.
9. **Ledger** — business/finance publication (Paper): Split Editorial hero (A4 #2), Classic Cards grid (A17 #1), Big Number Row stats (A10 #1), Hard Stop Card paywall (A32 #2) — all [Free] (FR-O4).
10. **Studio** — portfolio + blog (Mono): Offset Card hero, Bento gallery, About Founder Letter, project (tag) collections.

## Appendix F — Plans, Limits & Unit Economics

| | Free | Pro — $15/mo · $150/yr |
|---|---|---|
| Projects | 1 | 25 |
| Site connections | 1 | 10 |
| Section library | canvas: all 487 · deploy/export: [Free] variants only (68) | All 487 |
| Asset storage | 100 MB | 5 GB |
| Per-upload cap | 10 MB (stored optimized) | 10 MB |
| Deploy history / rollback | last 3 | last 10 per project |
| Theme ZIP export | ✓ (with credits, Free variants only) | ✓ |
| Credit removal (white-label) | — | ✓ |
| Dark mode authoring · Routes · Style Pack editing | ✓ | ✓ |

**Economics basis:** core fixed ≈ $45/mo (Supabase Pro $25 + Vercel Pro $20) **plus launch-mandated test infrastructure ≈ $60–80/mo** (Ghost(Pro) Publisher ~$31 monthly billing, Ghost(Pro) Starter ~$11, two DO droplets ~$18, Resend ~$20 at modest volume, Sentry dev tier) → **total fixed ≈ $105–125/mo**. Supabase Pro includes 100 GB storage (then ~$0.021/GB), 250 GB egress + 250 GB cached egress (then $0.09/$0.03 per GB). Deployed sites consume no Inflozo egress (P5); editor asset traffic is CDN-cached; snapshot/deploy artifacts and notification rows are storage-cheap; render-matrix CI runs on CI runners (costed under test infra). Dodo: 4% + 40¢, +1.5% international, +0.5% subscription → net ≈ $13.70–13.93 on $15 depending on buyer geography. Worst-case Pro infra cost ≈ $0.15–0.60/user/mo → >95% infra margin at scale; **break-even ≈ 8–9 Pro subscribers**. Modeled 1,000 Free + 200 Pro: ≈ $110–160/mo infra vs ≈ $2,700/mo net.

**Retention modeling (deliberate no-lock-in):** themes work forever and export stays open, so an export-and-cancel cohort is expected — model a month-1 churn spike honestly in blended LTV. The offsetting retention levers, all value-based: post-launch library cadence (FR-J14), compatibility watch (FR-C5), and yearly-default checkout (FR-L1).

## Appendix G — Deferred (explicitly out of v1)

- Shareable preview links
- custom font uploads
- team seats/collaboration
- in-app compiled-code viewer (export covers v1)
- account-level custom Style Pack library
- AI copy or layout suggestions
- theme export marketplace
- per-breakpoint editing
- nested/columns free-form layout
- comments on suggestions
- app dark theme (the app chrome ships light; *authored sites* fully support dark)
- ActivityPub/social-web section group
- brand extraction from arbitrary URLs
- public deploy quality badges/reports
- live-site theme preview UX (deploy-without-activate exists, but no preview surfacing — previews would require a working Ghost install)
- promotion of non-accent color tokens to Ghost Admin (v1 is accent-only — FR-Q5; other tokens have no dark built-in counterpart)
- RTL layout (v1 generated themes are LTR). Translation itself ships in v1: section copy is user-authored via text props (any language), and chrome strings are user-overridable via the Translations module (FR-Q6 — `{{t}}` + `locales/`). Dates render via `{{date}}`, which follows the site's locale.

## Appendix H — Voice & Microcopy Canon (normative)

Copy across app and marketing is short, warm, confident, lightly playful — easy to understand with a bit of fun (owner directive). Canonical strings, reused verbatim: deploy button **"Ship it"** (subsequent: "Ship update"); success toast **"Live! Your site just got gorgeous."**; empty dashboard **"Every great site starts somewhere. Yours starts with 487 gorgeous sections."**; gscan step **"Checking your theme (Ghost will love it)"**. Rules: exactly **one confetti moment** in the product — first successful deploy (respects reduced-motion); destructive and billing flows stay serious, never cutesy; errors are human and name the fix ("Ghost said no — your Admin key expired" + Reconnect CTA).

## Appendix I — Glossary (normative)

One line per term; the defining requirement governs on any nuance.

| Term | Meaning | Defined in |
|---|---|---|
| Section / variant | A placeable design block; a variant is one structural design within a section category | FR-G1, FR-G5 |
| Variant Shuffle | Cycling a placed section through its category's sibling variants, content preserved | FR-D13 |
| Style Pack | The project's token set (colors ×2 modes, fonts, radius, spacing, width, buttons…) | FR-E1 |
| Token | A named Style Pack value compiled to a CSS custom property; sections consume tokens only | FR-E4 |
| Main feed | The one section per paginated template bound to Ghost's native paginated posts context | FR-H2 |
| Site-wide singleton | A shared single instance (header, announcement bar, footer) compiled into `default.hbs` | FR-D5 |
| Synthesis Defaults | The normative default section stacks used to compile templates the user hasn't touched | FR-D6, Appendix A companion |
| Pre-Inflozo snapshot | The archived previously-active theme, captured before Inflozo's first upload to a site | FR-J13 |
| Edit lock | The single-active-editor lock per project across tabs/devices; deploy/export require it | FR-D18 |
| Open canvas, gated exits | Free users may edit anything, including Pro sections; enforcement only at deploy/export | FR-L3 |
| Preview-only | A connection that cannot deploy (Ghost(Pro) Starter); set by user declaration or deploy error | FR-C2 |
| Promotion | Exposing a control or the accent token as a Ghost Admin `@custom` setting | FR-Q3 |
| Orbit Weekly | The bundled license-clean sample publication every section previews with | FR-H3 |
| Deploy artifact / rollback | A stored compiled theme zip; rollback redeploys one in one click, no edit lock needed | FR-J7, FR-J9 |
| Routes Manager | The visual `routes.yaml` builder (collections, channels, custom routes, taxonomies) | FR-I2 |
| Chrome strings | Compiler-generated visitor-facing labels, cataloged and user-overridable via the Translations module; ship via `{{t}}` + `locales/` | FR-Q6 |

— End of PRD —
