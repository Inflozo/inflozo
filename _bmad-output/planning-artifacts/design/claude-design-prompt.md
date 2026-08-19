# Inflozo — Master Design Prompt (for Claude Design)

> **How to use:** paste this entire document as the project brief. Generate screens in the order listed (§5 then §6), desktop-first at 1440 px. Every screen must obey the design system in §2 and the principles in §3 exactly — consistency across screens matters more than novelty within one.

---

## 1. What you are designing

**Inflozo** is a visual drag-and-drop website builder for Ghost CMS. Users assemble their site from a library of 480+ professionally designed sections on a 100% WYSIWYG canvas, restyle everything with one-click Style Packs, flip any placed section through sibling designs with their content preserved ("Variant Shuffle"), and deploy a clean Ghost theme to their live site in one click. Freemium: Free plan + Pro at $15/mo. Audience: Ghost publishers, newsletter creators, and indie founders with **zero coding or design skills**.

The product promise the design must radiate: *building a beautiful site feels like play, and nothing you do can make it ugly.*

**Personality: "Playful Pro."** The polish, precision, and spatial confidence of Framer — warmed up with the friendliness and approachability of Canva. Professional enough that a founder trusts it with their brand; playful enough that choosing a hero section feels like a slot machine you always win.

---

## 2. Design System (binding)

### 2.1 Color

| Token | Value | Use |
|---|---|---|
| `paper` | `#F7F5F2` | app background — warm off-white, never pure white pages |
| `surface` | `#FFFFFF` | cards, panels, bars |
| `ink` | `#1C1B1A` | primary text, primary buttons |
| `ink-soft` | `#6E6A64` | secondary text, labels |
| `line` | `#E7E2DB` | hairline borders, dividers |
| `coral` | `#FF5941` | THE accent: primary actions, selection, focus, brand moments |
| `coral-deep` | `#E84B34` | accent hover/pressed |
| `coral-tint` | `#FFEDE8` | selected backgrounds, accent washes |
| `marigold` | `#FFB100` | Pro badges, sparkle moments, warnings-lite |
| `mint` | `#1FA97A` | success, "Live" states, gscan pass |
| `sky` | `#4E7FFF` | informational chips, links in docs |
| `danger` | `#E5484D` | destructive, deploy failures |

Rules: one accent per view — coral leads; marigold appears only as Pro/celebration seasoning. Large fields of coral are reserved for marketing; in-app coral is buttons, selection outlines, and small fills. Dark surfaces appear in-app **only** inside the canvas when the user previews dark mode — the app chrome itself is always light.

### 2.2 Typography

- **Display / headings:** *Bricolage Grotesque* — the personality carrier. Use its character at 28–72 px; tighten letter-spacing slightly at large sizes.
- **UI / body:** *Inter* — 13 px UI dense (sidebars), 14 px UI default, 16 px body.
- **Mono:** *JetBrains Mono* — URLs, version chips (`v1.4`), yaml preview, keyboard keys.
- Scale: 12 · 13 · 14 · 16 · 20 · 24 · 32 · 44 · 60 · 72. Weight: Inter 400/500/600; Bricolage 500–800.

### 2.3 Shape, depth, space

- Radii: inputs & chips 8, buttons & cards 12, panels & modals 16, floating pill bars 24, thumbnails 10.
- Shadows (warm, never gray-blue): `sm 0 1px 2px rgba(28,27,26,.06)` · `md 0 4px 16px rgba(28,27,26,.08)` · `lg 0 12px 40px rgba(28,27,26,.14)` for overlays.
- Spacing on a 4 px grid; panel padding 16/20; page gutters 24 (app) / up to 120 (marketing).
- Hairlines everywhere instead of heavy borders; generous whitespace is part of the "pro."

### 2.4 Iconography & illustration

Lucide icons, 1.5 px stroke, 16/20 px in UI. Illustration style for empty states and 404s: simple ink line-drawings with a single coral or marigold accent shape — hand-drawn warmth, never corporate blob-people. Section thumbnails in pickers are abstract wireframe mini-diagrams (ink lines + coral highlight block on `paper`).

### 2.5 Motion

Fast and springy, never floaty: standard 160 ms ease-out; overlays 200 ms scale(0.98→1)+fade; drag uses a slight spring with 2° tilt on the dragged card; hover lifts 1–2 px. Variant Shuffle: 180 ms horizontal slide-fade between designs. Canvas restyle on Style Pack switch: 300 ms crossfade. **One confetti moment exists in the entire product: first successful deploy** — brief coral/marigold burst, respects reduced-motion.

### 2.6 Voice (copy in mocks must use this tone)

Short, warm, confident, lightly playful. Examples to reuse: deploy button **"Ship it"** (subsequent: "Ship update"); success toast **"Live! Your site just got gorgeous."**; empty dashboard **"Every great site starts somewhere. Yours starts with 480 gorgeous sections."**; gscan step **"Checking your theme (Ghost will love it)"**; delete confirm stays serious. Never cutesy in destructive or billing flows.

---

## 3. Design principles

1. **The canvas is sacred.** Inside the canvas, render a *real website* — zero grids, outlines, or badges at rest. All editing affordances appear on hover/selection and vanish on exit.
2. **Chrome recedes.** App chrome is quiet (paper + ink + hairlines) so the user's site is the most colorful thing on screen. Coral punctuates; it never wallpapers.
3. **Direct manipulation first.** Click text to type. Drag to reorder. Shuffle arrows on the section itself. The sidebar is the second way to do everything, not the first.
4. **Named values, visual choices.** Controls show diagrams, swatches, and words (Compact / Comfortable / Spacious) — never px, hex, or CSS anywhere.
5. **Every state designed.** Empty, loading (skeletons, not spinners, in content areas), error, and success states are first-class in every screen below.

---

## 4. Core components (establish once, reuse everywhere)

- **Buttons:** Primary (ink fill, white text; coral reserved for THE action of a surface — e.g., Ship it), Secondary (surface + hairline), Ghost (text + hover wash), Danger. Sizes 32/36/44. Icon-leading optional.
- **Inputs:** 8 px radius, hairline, focus = coral 2 px ring at 40% + coral caret. Search inputs with leading icon and ⌘K key hint chip.
- **Segmented control:** pill container on `paper`, active segment `surface` with sm shadow.
- **Layout Picker:** grid of 64×44 mini-diagrams (wireframe style, coral active ring).
- **Swatch Row:** five 24 px role circles (Base/Surface/Accent/Contrast/Image) — active gets coral ring; "Image" swatch shows a tiny photo glyph.
- **Stepper:** − value + with tabular numerals.
- **Toggle:** 36×20, coral when on.
- **Cards:** surface, 12 radius, sm shadow, hover md + 1 px lift.
- **Badges:** Pro = marigold tint pill with ✦; Free = line-bordered pill; Live = mint dot + label; version chips mono.
- **Toasts:** bottom-center pill, icon + message + optional action, auto-dismiss.
- **Modals:** 16 radius, lg shadow, scrim `rgba(28,27,26,.4)`.
- **Panels/accordions:** 13 px section labels, uppercase, ink-soft, 0.04 em tracking.
- **Tooltips:** ink fill, white 12 px text, 6 px radius, with keyboard-key variant.
- **Moon badge:** tiny 12 px moon dot on a control that carries a dark-mode override.

---

## 5. App screens (generate in this order)

### S1 · Sign in / Sign up
Centered 400 px card on `paper` with a faint oversized Bricolage "Inflozo" wordmark cropped behind. Email field + "Send magic link" primary; passkey button beneath ("Sign in with a passkey", fingerprint icon). States: (a) default, (b) **magic-link sent** — envelope line-illustration, "Check your inbox ✨", resend link with 30 s countdown, (c) passkey OS-prompt moment (dimmed card + system-sheet placeholder). Footer: Terms/Privacy. No passwords anywhere.

### S2 · Onboarding (first run)
Full-screen, three large choice cards after a one-line welcome ("Let's make your Ghost site gorgeous."): **Connect your Ghost site** (recommended tag; Ghost logo, "we'll bring in your colors, logo and posts"), **Start from a starter** (fan of 3 mini template previews), **Blank canvas** (playful empty frame illustration). Below: "You can do all of this later." Also design the **connect sub-step:** URL field → keys step with annotated screenshot placeholder of Ghost Admin, two paste fields, "Where do I find these?" expandable — then the **auto-branding moment:** split card showing "their site today" favicon/logo/accent chips → "Use your brand" primary + "Skip".

### S3 · Dashboard
Left rail (icon + label): Projects, Sites, Assets, Suggestions, Billing, Docs; bottom: account chip. Top bar: search, "What's new" sparkle icon with popover, **New project** primary. Content: project cards grid (canvas thumbnail 16:10, name, linked-site favicon+name or "Sample content" chip, status chip Live v4 / Never deployed / Failed, ⋯ menu: Rename Duplicate Delete). Sites strip above grid: connected site pills with health dot. Right edge: slim asset-quota meter. States: rich (6 projects), **empty** (illustration + "New project" + the empty-state line from §2.6), Free-plan variant (1 project + dashed "Upgrade to add more" ghost card with marigold ✦).

### S4 · Editor — default state (the flagship; spend the most care here)
- **Top bar (48 px):** left — back chevron + project name (inline-editable) + autosave dot ("Saved" fades in/out); center — **template switcher** segmented pill (Home · Post · Page · Tag · Author · Members · 404 · +); right — sun/moon toggle, device trio (desktop/tablet/mobile), member-state eye dropdown (Anonymous/Free/Paid), undo/redo, **Ship it** coral primary with dropdown caret (Deploy · Deploy & activate · History).
- **Left Layers panel (240 px, collapsible to rail):** ordered section rows (grip dots, wireframe mini-thumb, name, eye toggle), drag-reorder with springy ghost; bottom "+ Add section".
- **Canvas:** centered site render on a `#EDEAE6` backdrop with subtle page shadow — shown populated with a believable blog (use the "Orbit Weekly" fictional publication: warm imagery, real-looking posts). **At rest: absolutely no editing chrome.**
- **Right Controls sidebar (280 px):** with nothing selected → Page tab (Style Pack card preview + "Change", dark-mode setting, posts-per-page). 
- Design **three sub-states as separate frames:** (a) rest, (b) **hover** on a section — 1 px coral outline, name tag top-left, floating quick-action cluster top-right (◀ ▶ shuffle, duplicate, trash, grip) + hairline "+ Add section" line pulsing between sections, (c) **selected** — persistent outline + sidebar showing the section's controls: 3–5 Quick Controls, then Content / Layout / Style / Data accordions using every control type from §4 (include one moon-badged control and a Pro-badged variant thumbnail).

### S5 · Editor — Section Picker overlay
Full-screen overlay (200 ms rise) on scrimmed editor. Left rail: search ("Find a section… ⌘K"), category list with counts (Heroes 18, Features 16, …), Free-only filter toggle. Main: masonry of **live section previews rendered in the user's current Style Pack** — each card: preview, name, Free/Pro badge, hover lift + "Add" button. Top-right: light/dark preview toggle. Pro card clicked on Free plan → slide-up **upgrade sheet** (marigold ✦, plan compare mini-table, "Go Pro — $15/mo").

### S6 · Editor — Variant Shuffle moment
Hero frame for marketing too: a selected hero section mid-shuffle — outgoing design sliding left at 40% opacity, incoming design at full, same headline/copy/image persisting across both; ◀ ▶ arrows visible, small "4 / 18" counter chip, sidebar Layout group highlighting the changed Layout Picker selection; caption-level microcopy "Same words. New look. [ and ] to shuffle."

### S7 · Editor — Style Pack panel
Sidebar expanded state: current pack card (name, font pairing sample "Ag", 6 color dots) + grid of 12 pack cards (mini palette + font glyph; hover shows instant-preview hint). Below: token editors — mode tabs (Light/Dark), color rows with swatch + role name, font pairing selector (30 pairings list with live "Aa" rendering), radius/density/button-style segmented controls. Include a second frame: **mid-switch crossfade** where the canvas behind visibly changes packs.

### S8 · Deploy flow + history
Ship-it opens a 480 px modal: site row (favicon, URL, "Preview-only" variant for Ghost(Pro) Starter with explainer), radio Deploy / Deploy & activate, then progress stages as a vertical checklist with animated states — Compiling → **Checking your theme (Ghost will love it)** with gscan chip flipping to `0 errors · 0 warnings` in mint → Uploading → Activating → **Live!** with the product's single confetti burst + "View site ↗" + version chip `v5`. Also design **failure state** (danger icon, human message "Ghost said no — your Admin key expired", Reconnect CTA) and the **History drawer:** version rows (v5 Live mint dot, timestamp, gscan chip, ⟲ Roll back button; confirm popover).

### S9 · Routes & Templates manager
Two-pane surface: left — Collections list (cards: path `/tutorials/`, filter chip `tag:tutorials`, template, posts-per-page) + Custom routes + taxonomy row; right — **live routes.yaml preview** in mono with syntax tint, validation banner (mint pass / danger with inline error). "+ New collection" sheet with Link-Picker-style tag search. Empty state: "Your site uses Ghost's default routing. Nice and simple."

### S10 · Asset Library
Toolbar: search, type filter chips, sort, quota meter ("312 MB of 5 GB"), **Upload** primary. Grid of image cards (hover: name, size, "Used in 3 projects" chip, ⋯). Drag-over state: full-surface coral dashed drop zone "Drop images — we'll optimize them ✨". Upload toast showing WebP conversion ("Optimized: 4.2 MB → 380 KB"). Delete-in-use warning modal listing affected projects.

### S11 · Sites & Connections
Site cards: favicon, title, URL, Ghost version chip, health dot (Connected / Reconnect needed / Preview-only with marigold info icon), linked projects count, ⋯ (Re-check, Reconnect, Disconnect). "+ Connect site" repeats S2's connect sub-flow as a modal. Free-plan variant: second slot as dashed upgrade ghost card.

### S12 · Billing & Account
Plan card (Free or Pro): price, renewal date, limit meters (projects, sites, storage, deploy history) as slim bars; Upgrade (marigold ✦ accents) / Manage in Dodo portal ↗ / Cancel. Below: Security section — passkey list rows (device icon, auto-name, added date, rename/revoke), "Add a passkey" button; email + change flow; danger zone (Delete account, typed confirm). Include the **Upgrade modal** used app-wide: side-by-side Free vs Pro table, coral "Go Pro", yearly toggle showing "$150/yr — 2 months free".

### S13 · Suggestions board (in-app)
Header tabs Top / New / Planned / Building / Shipped; category filter chips. Suggestion rows: upvote pill (▲ 128, coral when voted), title, snippet, category chip, status chip (Open line / Planned sky / Building marigold / Shipped mint). "+ Suggest something" sheet (title, description, optional image drop). Empty state: "Tell us what to build next."

---

## 6. Marketing website screens

Marketing shares the design system but turns the volume up: bigger Bricolage, more coral, paper background with occasional full-bleed coral or ink bands, generous 120 px section rhythm. Nav: wordmark left; Features · How it works · Sections · Pricing · Docs; right: Sign in ghost + **Start free** coral. Footer: mega grid + big cropped "Inflozo" wordmark + "Changelog — built with Inflozo on Ghost" proof link.

### M1 · Home
1) **Hero:** eyebrow chip "The visual builder for Ghost"; Bricolage 72 px headline "Your Ghost site, gorgeous by drag & drop."; sub-line; Start free (coral) + Watch it work (ghost); beneath, a large editor mock in a browser frame showing S6's **Variant Shuffle mid-moment** — this animation concept is the hero demo. 2) Logo/proof strip (Ghost-community flavored). 3) Three-step How it works teaser (Connect → Play → Ship) with mini illustrations. 4) Feature bento: WYSIWYG canvas, 480+ sections, Style Packs (mini pack-switch crossfade), Dark mode, Variant Shuffle, One-click deploy with gscan chip. 5) **Sections gallery teaser:** masonry wall of real section previews drifting slowly, "Browse all 480+ →". 6) Style Pack strip: same hero section shown in 4 packs side-by-side. 7) Ghost-nativity band (ink background, white text): live tiers, paywall designs, portal buttons, routes.yaml. 8) Pricing teaser cards. 9) FAQ accordion. 10) Final CTA band: coral full-bleed, "Ship something gorgeous." + Start free (ink button on coral).

### M2 · Features
Alternating deep-dive rows with product frames: Canvas & WYSIWYG (S4 rest vs hover) · Section library (S5) · Variant Shuffle (S6) · Style Packs & dark mode (S7 + dark canvas) · Deploy, gscan & rollback (S8) · Ghost-native (paywall + tiers sections) · Routes (S9). Each row: eyebrow, 44 px heading, 2-line body, "and it's all point-and-click" flavored micro-caption.

### M3 · How it works
Numbered vertical journey (01 Connect — annotated Ghost Admin keys step; 02 Brand — auto-branding card moment; 03 Build — picker + shuffle; 04 Style — pack switch; 05 Ship — deploy checklist with confetti frame). Ends with CTA band. Design as a scroll-told story with sticky step numerals.

### M4 · Sections Gallery (the SEO engine)
Layout mirrors S5 publicly: left category rail with counts, top search + light/dark toggle + Free-only filter; masonry of live previews (Orbit Weekly content), each card: name, Free/Pro badge, "Open in Inflozo →". Category header block (H1 "Ghost Hero Sections", count, one-line SEO paragraph). Include one **category page** (Heroes) and the **gallery landing** (all categories as cover cards with counts).

### M5 · Pricing
Two cards centered: Free (line border) vs **Pro** (coral ring, "Everything, unlocked", ✦): $15/mo with Monthly/Yearly segmented toggle ("$150/yr — 2 months free" marigold note). Limits table beneath (projects, sites, sections, storage, rollback). Trust row: "Cancel anytime · Taxes handled · Powered by Dodo". Pricing FAQ accordion. Final CTA band.

### M6 · Suggestions (public)
Read-only variant of S13 with a "Sign in to vote" ghost state on upvote pills and a banner "Built in the open — tell us what's next."

### M7 · Docs
Three-pane docs layout: left nav tree (Getting started, Connect your site, Deploying & rollback, routes.yaml step, Hosting requirements, Style Packs, Assets, Billing, Troubleshooting), center MDX article (16 px Inter, mono snippets, screenshot frames, callout cards in coral-tint/sky-tint), right on-page TOC. Design the "Connect your Ghost site" article as the sample.

### M8 · Contact
Simple centered page: Bricolage "Say hello.", email as big type link, support expectations line, social row, mini-FAQ (3 items). No form theater.

### M9 · 404
Playful: line-illustration of a section block that wandered off the canvas, "This page shuffled itself out of existence.", Home + Browse sections buttons.

---

## 7. Output requirements

1. **Frames:** desktop 1440 px for every screen; add 390 px mobile companions for S1, S3, M1, M4, M5. The editor (S4–S8) is desktop-only.
2. **Order:** S1→S13 then M1→M9. Establish §4 components in S1–S4 and reuse them verbatim afterward — no re-invention per screen.
3. **Real content only:** use Orbit Weekly (fictional publication) for all site/canvas content — believable post titles, warm photography placeholders, human names. Never lorem ipsum; never "Product Name Here".
4. **States are deliverables**, not afterthoughts: every listed sub-state (hover, selected, empty, failure, sent, crossfade) gets its own frame or clearly-annotated variant.
5. **Copy:** write final-quality microcopy in the §2.6 voice everywhere; reuse the exact strings given.
6. **Accessibility:** AA contrast on all text (ink on paper passes; check coral usage — coral is for ≥16 px semibold text or non-text elements), visible focus rings, 44 px touch targets on mobile frames.
7. **Restraint check before finishing any screen:** one coral action per surface · marigold only on Pro/celebration · canvas free of chrome at rest · hairlines not heavy borders · warm shadows only.

---

## 8. Addendum — Section Calibration Set (aesthetic reference, NOT per-variant specs)

**Purpose & status:** The product ships 480+ section variants, but those are *not* designed here — their structure is specified in the PRD (Appendix A) and their look is generated by Style Pack tokens at build time. This addendum exists to calibrate taste: it shows the engineering team what "marketplace-quality, token-driven, Playful Pro-adjacent" means at section level, and it supplies believable section artwork for the canvas, picker, and gallery frames in §5–§6. **Label every frame in this set "Calibration reference — not a spec."** Nothing here overrides the PRD; if a mock and Appendix A disagree, Appendix A wins.

### 8.1 The twelve sections

Render each as a standalone full-width frame (1200 px content region on the canvas backdrop), populated with Orbit Weekly content:

1. **Hero — "Split Editorial"** — oversized headline left, feature image right, meta row beneath.
2. **Post Grid — "Magazine Mixed"** — one lead story + supporting grid, full meta.
3. **Pricing — "Highlight Middle"** — three live Ghost tiers, center card raised with "popular" tag, monthly/yearly toggle.
4. **Paywall CTA — "Fade + Card"** — article fading into an upgrade card with tier buttons (this is a flagship differentiator; make it enviable).
5. **Testimonials — "Quote Grid"** — 3-up quote cards with avatars.
6. **Footer — "Mega Grid"** — brand column + link columns + newsletter row.
7. **Post Header — "Classic Center"** — tag chip, title, byline meta, wide feature image.
8. **Newsletter — "Split Benefit"** — benefit checks left, signup action right.
9. **FAQ — "Split Sticky"** — sticky heading + contact left, accordion right.
10. **Stats — "Big Number Row"** — four display-size stats with labels.
11. **Members Signup page — "Signup Center Card"** — brand, benefits, tier cards, free CTA.
12. **Pagination — "Load More Solid"** + **"Numbered Pills"** side by side as a compact strip.

### 8.2 Rendering matrix

To prove token-drivenness, do **not** design each section once. Render:
- Sections 1–4 in **three packs** (Paper, Tangerine, Ink), **light + dark** each → 6 frames per section.
- Sections 5–12 in **one pack of your choice**, light + dark → 2 frames each.
The same section across packs must be *identical in structure* — only tokens change (colors, fonts, radius, density, button style). If a pack change tempts you to move elements, the section design is wrong.

### 8.3 Section design language (the checklist every frame must pass)

- **Type hierarchy inside a section:** one display moment max (Bricolage-class scale is reserved for the pack's heading font); eyebrows 13 px uppercase tracked; body never below 15 px; meta 13–14 px in muted role.
- **Spacing rhythm:** internal 8 px grid; section vertical padding reads as Comfortable (~96 px) by default; elements group by proximity, not boxes.
- **Imagery treatment:** warm, editorial, human; consistent radius from the pack's radius token; subtle scrims (never heavy black gradients) when text overlays images; every image looks intentional at its crop.
- **Color discipline:** section-level color = pack roles only (Base/Surface/Accent/Contrast); accent appears once or twice per section (primary action, active state), never as decoration wallpaper.
- **Buttons & links:** exactly the pack's button style token; one primary per section.
- **Dark mode:** re-tuned, not inverted — backgrounds deepen, surfaces lift one step, imagery scrims adjust, accent re-checked for AA.
- **The squint test:** at 25% zoom the section should still read as one clear composition with an obvious focal point.
- **The ugly test:** try to imagine the worst reasonable user content (long headline, missing image, 1 post instead of 6) — the frame set should include one "stress" annotation showing the section still composed.

### 8.4 Placement in the output order

Generate this set **after M9**, as its own labeled group. Reuse its artwork inside S4–S6 and M1/M4 rather than inventing different section designs there — the calibration set and the product mocks must show the same world.

— End of design prompt —
