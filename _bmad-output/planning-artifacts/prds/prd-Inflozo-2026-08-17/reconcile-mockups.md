# Mockup ↔ PRD Reconciliation

**Date:** 2026-08-17 · **Inputs:** `_bmad-output/planning-artifacts/design/mockups/*.dc.html` (S1–S13, M1–M9, Calibration Set, Editor Sidebar Kit) vs `prd.md` v1.0 + `addendum.md`.
**Tags:** `stale-design` (mockup predates a PRD decision — update the design) · `prd-gap` (mockup shows UI no FR covers — PRD must decide) · `consistent` (matches; listed only where confirmation is useful).

---

## 0. Cross-cutting stale numbers (appear on many screens)

These recur across S3, S5, S8, S11, S12, M1, M5 and are all **stale-design** vs Appendix F / §5:

| Mockup says | PRD says (Appendix F / FRs) | Screens |
|---|---|---|
| "480 / 480+ sections" | 487 variants, 34 categories (FR-G1) | S2, S3b, M1, M2, M4, M5, S5b, S12b |
| Free = "120 sections" (count-gated library) | Free: **canvas all 487**, deploy/export [Free]-only (68) — open canvas, gated exits (FR-L3) | S5b, S12b, M1, M5 |
| Pro sites = 3 | Pro: **10** connections (FR-C5) | S5b, S11c, S12a/b, M1, M5 |
| Pro projects = "Unlimited" | Pro: **25** (FR-B4) | S12a/b, M1, M5 |
| Free assets = 500 MB | Free: **100 MB** (FR-K3) | S3b/c, S5b, S12b, M1, M5 |
| Deploy history: Free "last 2", Pro "full" | Free **last 3**, Pro **last 10** per project (FR-J7) | S8e, S12a/b, M1, M5 |
| "Ghost 5.x" (compat check, site rows, footer credit) | **Ghost 6.x**, `ghost-api: v5` engines (NFR-7, FR-J1); site rows show Ghost 5.87/5.82 | S8b, S11a, M1, M5, M6, M7, M8 |
| Upload cap "up to 30 MB each" | **10 MB/file** (FR-K2) | S10b |

---

## S1 · Sign In

- **consistent** — Magic link primary, no passwords, passkey offered as sign-in option (FR-A1/A2). Magic-link-sent state with resend timer.
- **stale-design (minor)** — Passkey OS prompt shows domain `inflozo.app` while M1's editor mock shows `app.inflozo.com`. Pick one domain.

## S2 · Onboarding

- **stale-design** — **No Redesign-proposals step.** S2c goes auto-branding → "Use your brand"/Skip and stops. FR-C7 requires a "redesign my site" pass after connect + auto-branding: 2–3 starter × pack combos rendered with the user's real content, pick one → project pre-assembled. A whole screen is missing.
- **stale-design** — S2d starter chooser shows **three** starters (Journal, Signal, Studio) as flat cards. PRD ships **10** starters (Appendix E; "Journal" isn't one of them) and FR-O2 requires full-page scrollable previews with a light/dark toggle before choosing.
- **prd-gap** — S2c auto-branding imports **fonts** ("Title: Georgia · Body: Helvetica"). FR-C4 seeds accent + logo + nav only — fonts aren't in the FR (and FR-E1 restricts fonts to the curated ~30-pairing pool, which Georgia/Helvetica aren't in). Decide: extend FR-C4 to font import (mapped to nearest pool pairing?) or fix the mockup. S13/M6's "Shipped" suggestion card and M3 step 02 repeat this claim.
- **stale-design (minor)** — Connect flow collects API URL as part of the paste step ("paste the three keys"); FR-C1 has URL entry first, then keys. Harmless reorder, but docs (M7) and S11b repeat the "three values" framing — align with whichever FR-C1 keeps.
- **consistent** — Three entry paths (Connect / Starter / Blank), skippable branding, guided integration screenshots (FR-C1, FR-C4, FR-B2 minus Duplicate which doesn't apply on first run).

## S3 · Dashboard

- **stale-design** — **No "Updates available — redeploy" notice** on any project card (FR-J14). Cards show status chips (Live vX / Never deployed / Failed) but no library-update state.
- **stale-design** — **New-project path lacks Redesign proposals.** FR-B2 lists four creation sources (Starter / Blank / Duplicate / Redesign proposals for connected sites); no new-project surface is mocked at all, and nothing hints at proposals.
- **prd-gap** — **Notifications center (S3e bell popover)** with deploy success/failure and feature notices. No FR covers in-app notifications; FR-P covers email only and FR-B6 covers only the "What's new" changelog popover. Decide: add an FR (what feeds it, read state, retention) or cut the bell.
- **stale-design (minor)** — FR-B6's "connected sites strip with health badges" isn't on the dashboard (sites live only behind the Sites nav item). Either the FR or the layout should give way.
- **consistent** — Project cards (thumbnail, name, site badge/"Sample content", status chip) per FR-B1; ⋯ menu Rename/Duplicate/Delete (FR-B3); What's-new popover (FR-B6); asset quota meter in sidebar (FR-B6); Free 1-project upgrade slot = one of the four allowed prompt moments (FR-B4, FR-L5); empty state ("480 gorgeous sections" number aside).

## S4 · Editor (+ S6 Variant Shuffle)

- **stale-design** — Persistence indicator shows only **"Saved"**. FR-D10 requires four states: **Saved locally / Syncing / Synced / Retrying** (local-first model, addendum A1). No autosave-toggle surface either.
- **stale-design** — **Layers panel has no pinned "Site-wide" group.** Header and Footer sit inline in the section list with no globe badge; FR-D5 requires headers/announcement bars/footers as a pinned Site-wide group whose edits affect every template.
- **stale-design** — **No inline formatting toolbar state.** FR-D4 requires a floating bold/italic/underline/link toolbar on any canvas text selection (Appendix C: Text control includes inline marks). No mockup state exists for it.
- **stale-design** — **No edit-lock states.** FR-D18/addendum A2 require a read-only mode with "Request editing" nudge, holder prompt, takeover with unsynced-edit count. None mocked.
- **stale-design** — **No Site Remix control** (FR-D17: whole-canvas re-roll, scoped pack-only/variants-only, single-step undo). Absent from top bar and panels.
- **stale-design** — **No content-source pill** ("Previewing with: {site} / Sample content", FR-D15). Top bar has project name, Saved, Template, View as, Ship it only.
- **stale-design** — Right-panel "Page" group has a **Posts per page stepper** as a page setting; FR-J2 derives `posts_per_page` from the Home feed section's Count control. One of the two must win (PRD currently says the section control).
- **prd-gap** — **"View as" previews specific paid tiers** (Orbit Supporter / Patron / Founding member with prices). FR-D16 specifies only Anonymous / Free member / Paid member. Tier-level preview is richer — decide whether to spec it (it affects the `@member` shim) or trim the menu.
- **prd-gap** — **"+ New template"** lives in the template switcher dropdown; FR-I3 creates custom templates in the Routes Manager only. Decide whether the switcher is a second creation point.
- **stale-design (minor)** — Free-user canvas states are unmocked: ✦ badge on placed Pro sections (FR-L3) never appears in any editor screen.
- **consistent** — Slim top bar + Layers + canvas + Controls layout (FR-D1); zero chrome at rest, hover quick-actions + "+ Add section" hairline (FR-D2); persistent selection with sidebar (FR-D3); variant counter "4 / 18" and [ ] shuffle with content preserved (FR-D13, S6); "Try a variant" sidebar carousel (FR-D13); quick controls + Content/Layout/Style/Data accordions (FR-F3); Swatch Row roles Base/Surface/Accent/Contrast/Image (FR-F1); dark toggle, device-preview and undo/redo present as top-bar icons (FR-D7/D8/D9); Ship-it menu with distinct Deploy & activate / Deploy only, Download theme, Download routes.yaml, History (FR-J8, FR-J12, FR-I4, FR-J9); template dropdown Home/Post/Page/Tag/Author/Members/404 (FR-D6 — Members collapsed to one entry vs three member templates, minor).

## S5 · Section Picker

- **stale-design (confirmed)** — **S5b "upgrade sheet on Pro-card click" is dead.** FR-D12/FR-L3: Free users add any Pro section to the canvas; no upgrade sheet on click, ever ("never while playing with Pro sections on canvas", FR-L5). Replacement: Add works for everyone; placed Pro sections carry a subtle ✦ badge; enforcement moves to the exits — deploy/export block with the itemized "Pro sections in this design" sheet (upgrade or Shuffle-swap each). The sheet's comparison table is also stale (120/480+, unlimited projects, 3 sites, 500 MB).
- **stale-design (minor)** — Category rail shows 11 categories with illustrative counts (Post Grids 14, Pricing 12, Newsletters 12, FAQs 8, Paywalls 6, Pagination 4 …). Appendix A is normative: 34 categories; Post Grids 18, Pricing 15, Newsletter 16, FAQ 15, Paywall 12, Pagination 10, etc. Fine as a mockup crop, but the numbers shouldn't survive into build.
- **consistent** — Full-screen overlay, left category rail, search ⌘K, previews rendered in the project's pack ("shown in your pack: Paper") with project content, Free/✦ Pro badges, hover Add (FR-D12). Dark preview toggle (S5c) and "Free only" filter are unspecced but harmless sugar.

## S7 · Style Packs

- **stale-design** — Pack roster diverges from Appendix D: mockup has Harbor, Neon Dusk, Cocoa, Mist, Butter; PRD ships Orbit, Mono, Ocean, Neon, Quiet. Also "Paper — Georgia · Inter": Georgia isn't in the Google-Fonts pool (Paper = Fraunces/Inter).
- **prd-gap** — **"Site width: Narrow/Standard/Wide" as a pack-level token.** FR-E1's token set has no site-width token (width is a per-section control, FR-F2). Decide: add it to FR-E1 or drop the control.
- **stale-design (minor)** — Pack editor (S7c/d) exposes 4 color roles ×2 modes (Base/Surface/Accent/Contrast); FR-E1 defines 7 (background, surface, text, muted text, border, accent, on-accent). Also missing shadow-level and link-style tokens from the panel.
- **consistent** — Live pack switching with crossfade + "Trying on Tangerine…" (FR-E2); per-project custom pack ("Maya's Warm", "+ New pack") with hand-tuned dark ("never just inverted") (FR-E3, Appendix D); "From your site" seeding (FR-E5/FR-C4); fonts and raw colors appear only here (P2).

## S8 · Deploy (+ history)

- **stale-design** — **No pre-activation snapshot messaging.** FR-J13: before Inflozo's first Activate, the current theme is archived and restorable; if capture fails, warn before proceeding. The wizard's step 1/2 says nothing about snapshotting the existing theme (the promise lives only in a marketing FAQ). Add to the first "Deploy & activate" on a site.
- **stale-design** — **No "Pro sections in this design" blocking sheet.** With gating moved to the exits (FR-L3/FR-J12), the deploy/export block-with-itemized-list is now a *primary* screen — and it's mocked nowhere (S5b's dead sheet was its predecessor).
- **stale-design** — **No routes.yaml "one more step" card post-deploy.** FR-I4: manual Labs upload guidance (download + instructions) is the primary documented flow; deploys never silently skip routes. The Live step (S8d) celebrates and ends. (Ship-menu "Download routes.yaml" exists, but the guided card is required.)
- **stale-design** — "Ghost 5.x compatible" pre-flight line → 6.x; history footer "Free keeps the last 2 versions" → Free 3 / Pro 10 (not "full").
- **stale-design (minor)** — Warning "hero.jpg is 2.1 MB … we'll convert it to WebP on upload" contradicts FR-K2 (images are WebP-optimized client-side at *asset upload*, so a 2.1 MB JPG shouldn't reach compile). Reword or cut.
- **prd-gap** — **Ghost(Pro) Starter handled as "Manual deploy"** (S8a′/S11: download theme + upload in Ghost Admin). FR-C2 says Starter connections are "Preview-only" and deploy attempts are *blocked* with a docs link. The mockup's manual-download path is arguably better (FR-J12 export exists for all plans anyway) — PRD should adopt or reject the "Manual deploy" capability label and flow.
- **prd-gap (minor)** — S8c "Cancel" mid-upload; FR-J8/J11 define idempotent deploys but no user-cancel semantics.
- **consistent** — Destination step with Deploy & activate vs Deploy only (FR-J8); gscan gate with human-readable results, "Warnings won't block your deploy" (FR-J6); progress stages Compile → Check → Upload → Activate (FR-J8); one confetti moment at Live (P6); failure state with reconnect CTA (FR-J8); history drawer with version/timestamp/changes/gscan 0·0/active badge and one-click rollback with confirm (FR-J9).

## S9 · Routes Manager

- **prd-gap** — **Channels.** "+ Custom route" offers "A channel — a filtered stream of posts … with its own page and RSS feed", and M2 markets "collections, channels and custom routes". FR-I2 defines collections, custom routes (path → template), and taxonomies — **no channels**. Decide in or out (real Ghost routes.yaml feature; adds filter-builder + template implications).
- **prd-gap (minor)** — Collection filter builder is much richer than the FR: All/Any condition groups over Tag, Author, Primary tag/author, Featured, Visibility, Published date, Has feature image, plus drag-to-reorder collection precedence. FR-I2 says only "tag/author filter". If the mockup is the intent, FR-I2 should say so (it drives NQL scope).
- **consistent** — Collections with path/template/posts-per-page, custom routes, taxonomy prefixes, live YAML pane, validation with friendly errors, "Deploys are blocked until routing is valid" (FR-I2), default-routing empty state (FR-I5).

## S10 · Assets

- **stale-design** — Drop zone "up to 30 MB each" → 10 MB (FR-K2).
- **stale-design (minor)** — Type filters "Photos / Logos / Illustrations" vs FR-K1's "Image / SVG / Logo".
- **prd-gap (minor)** — Asset detail actions **Replace**, **Copy URL**, **Download** aren't in FR-K; Replace-everywhere has real semantics (updates every usage across projects). Spec or cut.
- **consistent** — Global library, search/filter/sort, drag-drop upload with client-side WebP optimization + toast ("4.2 MB → 380 KB"), "Used in 3 projects" chip, delete-in-use warning listing affected projects with placeholder consequence, quota meter (FR-K1–K5).

## S11 · Sites

- **stale-design** — Free upsell "Pro connects up to 3" → 10 (FR-C5); Ghost 5.87/5.82 version chips → 6.x.
- **prd-gap** — "Manual deploy" capability label for Ghost(Pro) Starter (see S8 finding — same decision).
- **prd-gap (minor)** — **Manage API keys** modal (paste rolled keys, masked display, Test connection, "Save & re-check"). Implied by FR-C1/C5 reconnect but never specced as a distinct key-rotation flow; worth an FR line since it touches Vault handling (FR-C3).
- **consistent** — Site cards with health status ("Checked 2 minutes ago"), Reconnect-needed badge with cause ("Admin key expired Aug 15") per FR-C5; disconnect present (FR-C6); connect-as-modal reusing S2's flow; per-site project counts; upgrade slot = allowed 2nd-site prompt moment (FR-L5).

## S12 · Billing / Account

- **stale-design** — Plan meters all stale: "6 · unlimited" projects → 25; "2 of 3" sites → 10; "full history" → last 10; upgrade modal S12b repeats 120/480+/unlimited/3/500 MB/Last 2.
- **stale-design (minor)** — No `pro_past_due` grace-period banner state (FR-L2's 7-day grace is a required state).
- **stale-design (minor)** — Passkeys live on "Account & Billing"; FR-A2/A3 name an Account → Security page. Merging is fine but one doc should own the location.
- **consistent** — Renewal date, Dodo portal for manage/invoices, cancel visible in ≤3 clicks (G10), invoices popup, change email (FR-A4), typed-confirm account deletion with "your live Ghost sites stay up" (FR-A5, P8), passkey list with device names + add (FR-A3), "Cancel anytime · Taxes handled · Powered by Dodo" (FR-L1). No Pro trial anywhere — matches FR-L1.

## S13 · Suggestions (in-app) + M6 (public)

- **stale-design** — Filter categories Editor / Sections / Style Packs / Deploy / Billing vs FR-M1's **Section idea / Feature / Integration**. One taxonomy must win.
- **consistent** — Statuses Open/Planned/Building/Shipped (FR-M1); submit sheet title+details+optional image (FR-M2); upvotes; Top/New sorting (FR-M3); public board read-only with "Sign in to suggest" (M6, FR-M3); no comments (v1 scope).

## M1 · Marketing Home

- **stale-design** — Free-tier framing "120 sections" sells the old count-gate; per FR-L3 the sell is "play with all 487 on canvas, ship [Free] designs — or go Pro." Pricing teaser numbers, "480+", and "made for Ghost 5.x" footer all stale (see §0).
- **consistent** — Hero with animated editor mock (variant-shuffle as demo), feature grid, how-it-works, gallery teaser, style-pack strip, pricing teaser, FAQ, final CTA (FR-N3); footer "Changelog — built with Inflozo on Ghost" dogfooding link (FR-N5).

## M2 Features · M3 How It Works

- **stale-design** — Same number staleness (480+, Ghost 5.x, "Last 2" history). M3 step 02 repeats font import (see S2 prd-gap).
- **consistent** — Feature narrative matches differentiators (§1.4): real-thing canvas, library previews in your pack, shuffle, packs + hand-tuned dark, gscan/rollback, Ghost-native tiers/paywall/portal, visual routes. M3's five steps mirror the real flow.

## M4 · Sections Gallery

- **stale-design (minor)** — Category counts/roster illustrative vs Appendix A (34 categories, 487 variants; gallery must render all — E14 exit criterion). Per-preview light/dark toggle (FR-N2) not evident in the category-page cards.
- **consistent** — SSG per-category pages with SEO titles ("Ghost Hero Sections"), live-render cards with Free/✦ Pro badge + variant name, "Open in Inflozo" CTA, landing page of all categories (FR-N2).

## M5 Pricing · M7 Docs · M8 Contact · M9 404

- **stale-design** — M5: whole limits table stale (§0); "Custom Style Packs, saved & named" listed as **Pro-only** — Appendix F gives Style Pack editing to Free too. Free bullet "120 sections, all shuffle-ready" → open-canvas framing.
- **prd-gap** — **M8 contact form** ("Send message", reply-within-a-day). FR-N1 lists a Contact page but no form backend exists in the architecture (no server FR, and FR-P allows exactly five transactional emails). Decide: email-link-only page (matches A16's own constraint) or spec a form handler.
- **prd-gap (minor)** — M7 "Suggest an edit" docs-feedback popup — no FR; either cut or fold into contact/suggestions.
- **stale-design (minor)** — M7 docs nav is missing PRD-required topics: Plans & billing exists ("Billing") but no FAQ page, no explicit "routes.yaml upload step" doc (FR-N4 lists it; "Routes & routes.yaml" may cover it — confirm at content time).
- **consistent** — M5 monthly/yearly toggle with "$150/yr — 2 months free" (FR-L1); honest cancel FAQ ("your theme stays live forever" — P5/FR-L3 downgrade rule); M7 docs structure + key-security explanation (FR-C3); M9 404 on-brand.

## Editor Sidebar Kit + Calibration Set

- **prd-gap** — Kit includes a **slider** ("named ticks, never raw numbers") and a **date control** — neither is one of FR-F1's ten control types ("the vocabulary never grows per-section"). Date is defensible as Routes-Manager-only (S9c uses it outside section scope); the slider duplicates Segmented. PRD should either extend Appendix C or the kit drops them.
- **prd-gap** — Kit's color popover says "any color: spectrum + hue bar · **hex paste** for power users" and is presented as a *Controls-sidebar* component. P2/FR-F1/Appendix C forbid color pickers and hex anywhere at section level — raw color lives only in the Style Pack editor. Fine if the popover is scoped to the pack editor; the kit's framing ("allowed in the Controls sidebar") must be corrected or the PRD amended.
- **consistent** — Everything else maps cleanly to Appendix C: segmented/named values, stepper, toggles, layout-picker thumbnails, swatch-row roles, Ghost-aware condition rows, moon badge for dark overrides (FR-F5), Free/Pro/version badges, variant thumb, "warnings never block a deploy" banner voice. Calibration Set self-declares "Appendix A wins on any conflict" and matches its sections' structure; the stress test (long headline, missing image) aligns with FR-G4 robustness.

---

## Missing screens/states the recent decisions now require (roll-up)

1. **"Pro sections in this design" sheet** at deploy + export (replaces S5b) — itemized list, upgrade or Shuffle-swap each. (FR-L3, FR-J12)
2. **Inline formatting toolbar** on canvas text selection. (FR-D4)
3. **Site-wide layers group** with globe badge. (FR-D5)
4. **Persistence indicator** 4-state + autosave toggle. (FR-D10)
5. **Edit lock**: read-only banner, "Request editing" nudge, holder prompt, takeover-with-unsynced-count. (FR-D18)
6. **Site Remix** control + scoped re-roll UI. (FR-D17)
7. **Pre-activation snapshot** copy in first-activate deploy step (+ snapshot-failed warning). (FR-J13)
8. **"Updates available — redeploy"** notice on dashboard cards and/or editor. (FR-J14)
9. **Redesign proposals** step in onboarding and under New project. (FR-C7, FR-B2)
10. **routes.yaml "one more step"** card after deploy when routes are in play. (FR-I4)
11. **Theme-credit toggle** (Pro white-label per project) — surface unmocked. (FR-J15)
12. **`pro_past_due` grace banner**. (FR-L2)
13. **Member-state canvas states** for Free member / Paid member and quota-exceeded upgrade prompt — referenced but unmocked. (FR-D16, FR-L5)

## Open PRD decisions raised by the mockups (prd-gap roll-up)

1. In-app **notifications center** (S3e) — no FR.
2. **Auto-branding font import** (S2c/M3/S13) — FR-C4 covers accent/logo/nav only.
3. **Tier-level member preview** in View-as (S4d) — FR-D16 stops at free/paid.
4. **Channels** in the Routes Manager (S9e/M2) — FR-I2 omits them.
5. **Rich collection filter builder + collection ordering** (S9c) vs FR-I2's "tag/author filter".
6. **Ghost(Pro) Starter as "Manual deploy"** (download + guided manual upload) vs FR-C2's "Preview-only, deploys blocked".
7. **Site width as a Style Pack token** (S7) — not in FR-E1.
8. **Manage API keys / key-rotation flow** (S11d) — implied, unspecced.
9. **Asset Replace / Copy URL / Download** actions (S10d) — not in FR-K.
10. **Marketing contact form backend** (M8) — no FR, conflicts with five-email cap unless specced.
11. **Slider + date control and hex-paste color popover in the sidebar kit** vs the closed ten-control vocabulary (FR-F1, P2).
12. **"+ New template" in the template switcher** (S4a) vs Routes-Manager-only creation (FR-I3).
13. **Deploy cancel** mid-upload (S8c) — semantics unspecced.
14. **Docs "Suggest an edit"** popup (M7b) — no FR.

**Tally:** stale-design ≈ 31 distinct findings (8 of them the cross-cutting number set repeated across screens) · prd-gap = 14 · consistent: core flows (editor chrome, shuffle, packs, deploy wizard, assets, sites, billing, suggestions, marketing IA) all track the PRD well.
