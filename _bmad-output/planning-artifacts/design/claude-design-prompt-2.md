# Inflozo — Design Prompt 2: Responsive System & Completion

> **How to use:** paste this document on its own, into a new session inside the existing Inflozo design project. It is **self-contained** — §0.1 below restates every binding rule from the original prompt, so you do not need that document in context. The project's existing frames (S1–S13, M1–M9, the Calibration Set, the Editor Sidebar Kit) are your **component reference**: reuse their buttons, inputs, panels, badges and spacing verbatim rather than inventing new ones.
>
> Where this document and any earlier brief disagree, **this one wins** — it encodes decisions made after those frames were produced. §0.2 lists what changed.

---

## 0.1 Inherited design system (binding — restated in full)

**Personality: "Playful Pro."** The polish, precision and spatial confidence of Framer, warmed with the friendliness of Canva. Professional enough that a founder trusts it with their brand; playful enough that choosing a section feels like a slot machine you always win.

**Product promise the design must radiate:** *building a beautiful site feels like play, and nothing you do can make it ugly.*

**Colour**

| Token | Value | Use |
|---|---|---|
| `paper` | `#F7F5F2` | app background — warm off-white, never pure white |
| `surface` | `#FFFFFF` | cards, panels, bars |
| `ink` | `#1C1B1A` | primary text, primary buttons |
| `ink-soft` | `#6E6A64` | secondary text, labels |
| `line` | `#E7E2DB` | hairlines, dividers |
| `coral` | `#FF5941` | THE accent: primary actions, selection, focus |
| `coral-deep` | `#E84B34` | accent hover/pressed |
| `coral-tint` | `#FFEDE8` | selected backgrounds, accent washes |
| `marigold` | `#FFB100` | Pro badges, celebration, warnings-lite |
| `mint` | `#1FA97A` | success, "Live" states |
| `sky` | `#4E7FFF` | informational chips, docs links |
| `danger` | `#E5484D` | destructive, deploy failures |

One accent per view — coral leads; marigold is Pro/celebration seasoning only. Large coral fields are for marketing; in-app coral is buttons, selection outlines and small fills. Dark surfaces appear in-app **only** inside the canvas when previewing dark mode — app chrome is always light.

**Typography.** Display/headings *Bricolage Grotesque* (28–72 px, tighten tracking when large). UI/body *Inter* (13 px dense, 14 px default, 16 px body). Mono *JetBrains Mono* for URLs, version chips, YAML, keys. Scale 12 · 13 · 14 · 16 · 20 · 24 · 32 · 44 · 60 · 72. Weights: Inter 400/500/600, Bricolage 500–800.

**Shape, depth, space.** Radii: inputs/chips 8, buttons/cards 12, panels/modals 16, floating pill bars 24, thumbnails 10. Shadows warm, never grey-blue: `sm 0 1px 2px rgba(28,27,26,.06)` · `md 0 4px 16px rgba(28,27,26,.08)` · `lg 0 12px 40px rgba(28,27,26,.14)`. 4 px spacing grid; panel padding 16/20; gutters 24 app / up to 120 marketing. Hairlines, not heavy borders.

**Icons & illustration.** Lucide, 1.5 px stroke, 16/20 px. Empty states and 404s: simple ink line drawings with one coral or marigold accent shape — never corporate blob-people. Section thumbnails are abstract wireframe mini-diagrams (ink lines + coral highlight on `paper`).

**Motion.** Fast and springy, never floaty. Standard 160 ms ease-out; overlays 200 ms scale(0.98→1)+fade; drag has slight spring with 2° tilt; hover lifts 1–2 px. Design switching: 180 ms horizontal slide-fade. Style Pack switch: 300 ms crossfade. **Exactly one confetti moment exists in the product — first successful deploy** — and it respects reduced-motion.

**Voice.** Short, warm, confident, lightly playful. Reuse: deploy button **"Ship it"** ("Ship update" thereafter); success toast **"Live! Your site just got gorgeous."**; gscan step **"Checking your theme (Ghost will love it)"**. Delete and billing flows stay serious — never cutesy there.

**Principles**

1. **The canvas is sacred.** Render a real website — zero grids, outlines or badges at rest. Editing affordances appear on hover/selection and vanish on exit.
2. **Chrome recedes.** App chrome is quiet so the user's site is the most colourful thing on screen.
3. **Direct manipulation first.** Click text to type, drag to reorder, switch designs on the section itself. The sidebar is the second way to do everything.
4. **Named values, visual choices.** Diagrams, swatches and words (Compact / Comfortable / Spacious) — never px, hex or CSS anywhere in the UI.
5. **Every state designed.** Empty, loading (skeletons, not spinners), error and success are first-class.

**Core components** — reuse from the existing frames: Buttons (Primary ink fill; coral reserved for THE action of a surface; Secondary surface+hairline; Ghost; Danger — sizes 32/36/44) · Inputs (8 radius, hairline, focus = coral 2 px ring at 40% + coral caret) · Segmented control · **Design Picker** (grid of 64×44 wireframe mini-diagrams, coral active ring) · Swatch Row · Stepper · Toggle (36×20, coral on) · Cards (surface, 12 radius, sm shadow, hover md + 1 px lift) · Badges (Pro = marigold tint pill with ✦; Free = line-bordered; Live = mint dot; version chips mono) · Toasts (bottom-centre pill) · Modals (16 radius, lg shadow, scrim `rgba(28,27,26,.4)`) · Panel labels (13 px uppercase ink-soft, 0.04 em tracking) · Tooltips (ink fill, white 12 px, keyboard-key variant) · Moon badge (12 px dot marking a control with a dark-mode override).

**Restraint check before finishing any frame:** one coral action per surface · marigold only on Pro/celebration · canvas free of chrome at rest · hairlines not heavy borders · warm shadows only.

---

## 0.2 What changed since the original brief

Design decisions made since the original prompt. Several invalidate assumptions in existing frames.

| Change | Consequence for design |
|---|---|
| **"Layout" is renamed "Design"** | The sidebar's first control selects among a section's *designs*. Navigate with `[` / `]`, with Previous/Next arrows, or by clicking a thumbnail. It is not a sub-arrangement within one design. |
| **Controls are per-design, not per-category** | Each design of a section carries its own minimal control set. A hero with no image offers no image controls. Keep to ~4–7 controls per design. |
| **Behaviours are off while editing** | Animations, countdowns, rotators and modals do not run on the canvas. A **Preview toggle** runs everything live and hides all editing chrome. Layout-affecting CSS (sticky, hover) stays live always. |
| **Users design every Ghost editor card** | An entirely new module — see Part C. |
| **Post content becomes a designed section** | With a design picker, on both posts *and* pages — see Part C. |
| **Canvas is a viewport that scrolls internally** | Device preview resizes it in **both** width and height to a real device size, with a separate zoom control for fitting it on screen. Mobile preview must look like a phone viewport, not a narrow column. |
| **Routes upload is automatic** | The guided manual card is now a *fallback* for when the credential is missing, not the primary flow. |
| **Ghost(Pro) Starter is "Preview-only"** | Not "Manual deploy". Existing frames say the wrong thing. |
| **Counts are final** | **485** designs · **34** categories · **70** Free · **12** Style Packs · **30** font pairings · Pro **$15/mo** · projects **25** · sites **10** · history **Free 3 / Pro 10** · assets **10 MB** per file. |

---

## Part A — The Responsive System

**The problem to solve.** 485 designs cannot each be designed at three widths. But every design in the library reduces to one of a small number of **structural archetypes**, and responsive behaviour is a property of the archetype, not of the individual design. Design the archetypes and the whole library is covered.

**Breakpoints.** Desktop **1440** · Tablet **834** · Mobile **390**. These are fixed. What happens *at* each is what you are defining.

### A.1 The archetypes

For each archetype below, produce a **three-frame strip** (1440 → 834 → 390) showing the same content collapsing. Annotate every frame with the rule in words, because the rule is the deliverable — the picture is the proof.

1. **Grid of N** — N equal cards (features, post grids, testimonials, team, logos, stats). Define the ladder for N = 2, 3, 4 and 6.
2. **Split 50/50** — copy one side, media the other (heroes, features, newsletter, contact). Define which side leads when stacked, and whether media crops or shrinks.
3. **Asymmetric split** — lead item plus supporting column (magazine post grids, featured post).
4. **Stack** — already vertical; define only padding and type-scale reduction.
5. **Horizontal bar** — announcement bars, utility strips, pagination, filter strips. Define truncation, wrapping and dismissal at 390.
6. **Nav bar** — the header archetype. Define the drawer transition point and what survives in the collapsed bar.
7. **Edge rail** — back-to-top towers, share rails, TOC sidebars. These generally *disappear* or relocate on mobile; define which and where they go.
8. **Overlay** — transparent headers, image-backdrop heroes, scrims. Define how text legibility is preserved when the image aspect changes.
9. **Feed + pagination** — post lists with their pagination treatment attached.
10. **Form** — signup, contact, search. Define field stacking and button width.
11. **Carousel / scroll strip** — the archetype that *gains* utility on mobile. Define peek amount and whether it becomes a carousel only below a breakpoint.
12. **Table / comparison** — pricing tables, plan comparisons. Define whether it scrolls horizontally or restacks into cards.
13. **Media frame** — the image treatments (rounded, browser chrome, tilt) at each width.
14. **Sticky element** — headers, CTAs, sticky cards. Define behaviour and height at each width.
15. **Article body** — the post-content archetype: measure, TOC, drop cap, share rail (see Part C).

### A.2 The exception list — designs that cannot follow their archetype

These need **bespoke 390 px frames** because their defining idea breaks under the default ladder. One frame each, annotated with what changed and why:

- **A1 Headers:** Command Bar · Mega Search · Sidebar Trigger · Tab Deck · Double Decker · Transparent Overlay · Mono Wordmark
- **A2 Announcement bars:** Ticker Marquee · Countdown · Rotating Messages · Dual Action · Pill Floating
- **A3 Footers:** Mega Grid · Sitemap Columns · Back-to-Top Tower · Big Wordmark
- **A4 Heroes:** Collage Grid · Stats Punch · Split Form · Magazine Cover · Ticker Base · Big Type Manifesto
- **Post content:** TOC Left · TOC Right · Share Rail · Wide Measure
- **Any design whose name implies a rail, a marquee, a takeover, a collage, or oversized type.**

### A.3 The stress frames

Responsive failure shows up with real content, not placeholder content. Produce one 390 px frame for each:

- A headline of 90 characters
- A post with no feature image, in a grid where every sibling has one
- A nav with 9 top-level items
- A pricing table with 4 tiers
- An author name of 40 characters beside a date
- A feed with exactly 1 post where the design expects 6
- A tag list with 12 tags

### A.4 Touch and density

At 390: 44 px minimum touch targets, thumb-reachable primary actions, no hover-only affordances anywhere, and a stated rule for how the section's vertical padding steps down from Comfortable.

---

## Part B — Surfaces that were never designed

Each of these exists in the specification and has no frame. Desktop 1440 unless noted.

### B.1 Editor surfaces

1. **Design navigation** — the `[` / `]` affordance, Previous/Next arrows, and the design thumbnail strip in the sidebar. Show "Design 7 of 18". This is the product's most-used control and has never been drawn.
2. **Per-design control sidebar** — three different designs of the *same* section, side by side, showing that their control sets genuinely differ. This is the frame that proves the model.
3. **Preview toggle** — chrome-off state, with the affordance to return. Show one behaviour actually running (a countdown or a rotator).
4. **Inline formatting toolbar** — floating bold / italic / underline / link on a canvas text selection, plus the link-entry state.
5. **Edit-lock states** — read-only mode with "Request editing"; the holder's incoming-request prompt; takeover confirmation showing the unsynced-edit count. Three frames.
6. **Persistence states** — Saved locally · Syncing · Synced · Retrying. Four states of one indicator.
7. **Layers panel with a pinned "Site-wide" group** — header, announcement bar and footer badged and separated from page sections.
8. **Site Remix control** — whole-canvas re-roll, with its scope options and single-step undo.
9. **Content-source pill** — "Previewing with: Orbit Weekly" vs "Sample content".
10. **Free-tier canvas state** — the Pro badge on placed Pro designs. Free users place anything; nothing is blocked on the canvas.
11. **Device preview** — the same page at desktop, tablet and mobile *inside the editor*, showing the canvas genuinely resized in both axes with the zoom control visible.

### B.2 Deploy and lifecycle

12. **Pre-deploy snapshot gate** — "we're archiving your current theme first", including the failure-to-capture warning state.
13. **Pro-content blocking sheet** — deploy/export blocked with an itemised list of the Pro designs in use and the two ways forward. This is now a *primary* screen, not an edge case.
14. **Library-update notice and confirm** — "Updates available — redeploy", on the project card and as a confirmation.
15. **Preview-only connection state** — the Ghost(Pro) Starter explanation, why deploy is unavailable, and what clears it. Replaces the incorrect "Manual deploy" framing.
16. **Routes fallback card** — shown only when automatic upload is unavailable.

### B.3 Configuration

17. **Theme Settings** — the global config surface, including the custom-settings builder where a user promotes a control to a Ghost theme setting.
18. **Translations surface** — the string catalogue with English defaults and per-string overrides, plus the RTL blocking acknowledgement.
19. **Membership page binding flow** — the in-product guidance for pointing a Ghost Page at a designed membership template, including where the template name appears in Ghost's own editor.
20. **Manage API keys modal** — masked keys, rotate, test connection, re-check.

### B.4 Dashboard and account

21. **Notifications centre** — bell popover with deploy outcomes and feature notices.
22. **Redesign proposals** — the post-connect "redesign my site" pass; missing from onboarding entirely.
23. **Starter chooser with all 10 starters** — current frame shows three.
24. **Past-due grace banner** — the 7-day grace state.
25. **Connected-sites strip** with health badges, on the dashboard.

---

## Part C — The post-body trio (new product area)

These three are one surface and must be designed together. They are the product's answer to "what happens inside a blog post", and none of them exists today.

### C.1 The Ghost card design module

Ghost's editor produces ~20 card types — toggle, bookmark, callout, button, gallery, image, audio, video, file, product, header, embed, code, table, blockquote, signup, CTA. **The user designs every one of them.**

Design:
- **The module's home** — how a user browses the card types and sees which they've customised.
- **A card's design panel** — for three representative cards: **Callout** (simple: colour role, icon, border), **Bookmark** (complex: layout, thumbnail position, metadata density), **Gallery** (structural: gutter, corner radius, row proportions).
- **The live preview** beside the panel, showing that card rendered with real content.
- **A "reset to Ghost's default" affordance** per card.
- **Three cards where colour is not offered** (header, signup, CTA) — because their colours come from the post author in Ghost's editor. Show how that's explained without feeling like a missing feature.

Keep each card's controls minimal — the same 4–7 discipline as sections.

### C.2 The post content section

A placeable, designed section with its own design picker, on **posts and pages**. Controls include: measure (text column width), drop cap, type scale, table-of-contents (off / left / right, auto-hidden under 3 headings), share rail.

Design: the section on the canvas at desktop and mobile, its control panel, and the TOC in both positions. Show it containing real article content with headings, a pull-quote, an image and two card types — so the relationship to C.1 is visible.

### C.3 The paywall editor

Ghost renders the paywall block mid-article at the members-only cut. It is not a placeable section — it is its own **template surface with its own editor**, and it needs a canvas of its own.

Design:
- The editor surface itself — how a user gets there, and how it's obviously a different canvas from the page canvas.
- **Three of the twelve paywall designs**, populated with real tiers.
- The **preview treatment** control (None / Fade / Blur) applied to the *visible* end of the free preview — never to hidden content, which the browser never receives.
- The tier display options and the monthly/yearly toggle.
- The state where the site has no paid tiers configured.

### C.4 The style-guide fixture

The canvas never shows real article text. It shows a **style-guide article** containing one of every Ghost card type, a realistic heading profile, a pull-quote, lists, code and a table. Design this fixture as a full-page frame — it is what every user sees when they design a post template, so it must look like a genuinely nice article, not a test page.

---

## Part D — Corrections to existing frames

Fix in place; no new frames needed unless noted.

- **All stale numbers** per §0: 485 designs, 34 categories, 70 Free, 25 projects, 10 sites, Free 3 / Pro 10 history, 10 MB assets, Ghost 6.x, Pro $15/mo.
- **Style Pack roster** must be the shipping 12, not the invented set.
- **Pack editor** exposes **7** colour roles per mode, not 4.
- **Section picker** category rail shows the real 34 categories with real counts.
- **Free-tier framing:** "play with all 485 on the canvas, ship the Free designs — or go Pro." Never "120 sections".
- **Onboarding** does not import fonts during auto-branding — accent, logo and navigation only.
- **Posts-per-page** is derived from the home feed's Count control; remove the page-level stepper.
- **"View as"** offers Anonymous / Free member / Paid member only — no per-tier previews.
- **Remove the upgrade sheet** on Pro-section click. Free users place any design, always.
- **Remove the slider and date controls** from the sidebar kit — not part of the control vocabulary.
- **Remove the hex-paste colour picker** from the Controls sidebar — colour comes from the Style Pack.
- **Pick one domain** and use it everywhere.
- **Suggestions taxonomy:** Section idea / Feature / Integration.
- **Swatch Row** shows **7** colour roles, not 5 — background, surface, text, muted text, border, accent, contrast. The component itself needs updating, not just the pack editor.
- **Rename the "Layout Picker" component to "Design Picker"** everywhere it appears.

---

## Output requirements

1. **Order:** Part A (the system, and the most valuable output) → Part C (the new product area) → Part B (missing surfaces) → Part D (corrections).
2. **Annotate the rules.** For Part A especially, the written collapse rule beside each frame is the deliverable a developer will implement. A picture without its rule is half-delivered.
3. **Real content only** — Orbit Weekly throughout, per Prompt 1 §7.3. Never lorem ipsum.
4. **States are deliverables** — every failure, empty and loading state listed above gets its own frame.
5. **Accessibility** — AA contrast, visible focus rings, 44 px touch targets at 390, and no hover-only affordance anywhere in the mobile frames.
6. **Consistency over novelty** — reuse Prompt 1's components verbatim. If a new component is unavoidable, design it once and note it as an addition to the core set.
7. **Label anything speculative.** If a surface here is under-specified and you had to invent, say so on the frame. Invented detail that looks authoritative is worse than a flagged gap.

— End of Design Prompt 2 —
