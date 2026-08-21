# Inflozo — Design Prompt 3: The Complete Section Library

> **How to use:** this prompt runs **once per category, 34 times**. Paste §1–§4 (the master brief) plus the one category block from §6 you are working on, into a fresh session in the Inflozo design project. Do not attempt more than one category per session — consistency degrades and sessions run out of room.
>
> Run the categories in the order given in §6. That order is deliberate: it matches the build order, so each category is designed immediately before it is built and approved.
>
> **This prompt is self-contained.** §2 restates the binding design system. You do not need the earlier prompts in context, though the project's existing frames are your component reference.

---

## 1. What this is, and why it is different

The Inflozo section library is **485 designs across 34 categories**. Every one is being designed here before any is built.

**This pass produces two things at once**, and the second matters as much as the first:

1. **The designs** — what each section looks like, at three widths, in light and dark.
2. **The specification** — the exact content fields, the control list, the data binding, the responsive collapse rule and the empty state for every design. A developer must be able to build from your output without asking a question.

A frame without its specification is half-delivered. Write the spec beside every design.

---

## 2. Design system (binding)

**Personality: "Playful Pro."** Framer's polish and spatial confidence, warmed with Canva's friendliness. The promise the work must radiate: *building a beautiful site feels like play, and nothing you do can make it ugly.*

**Colour tokens** — sections use **role tokens only**, never literal colours:

| Role | Meaning |
|---|---|
| `background` | the page ground |
| `surface` | cards, panels, raised areas |
| `text` | primary reading colour |
| `text-muted` | meta, captions, secondary |
| `border` | hairlines and dividers |
| `accent` | the pack's one accent — actions and active states |
| `contrast` | inverted band colour |

Design every section in the **Paper** pack. Section colour comes from these seven roles and nothing else. Accent appears once or twice per section — a primary action, an active state — never as decoration.

**Typography.** Each pack supplies a heading font and a body font; design against the pack's pairing, not a named typeface. One display moment maximum per section. Eyebrows 13 px uppercase, tracked. Body never below 15 px. Meta 13–14 px in `text-muted`.

**Shape, depth, space.** Radius comes from the pack's radius token — use it consistently, never mix. Warm shadows only: `sm 0 1px 2px rgba(28,27,26,.06)` · `md 0 4px 16px rgba(28,27,26,.08)`. Internal 8 px grid. Default section vertical padding reads as Comfortable (~96 px desktop). Hairlines, never heavy borders.

**Imagery.** Warm, editorial, human. Consistent radius from the pack token. Subtle scrims when text overlays images — never heavy black gradients. Every image must look intentional at its crop.

**Dark mode.** Re-tuned, never inverted: backgrounds deepen, surfaces lift one step, image scrims adjust, accent re-checked for AA contrast.

**Motion.** Fast and springy, never floaty. 160 ms ease-out standard. All motion respects reduced-motion. Behaviours do **not** run while editing — design the resting state as the primary frame.

**Content.** Orbit Weekly, a fictional publication, throughout. Believable post titles, real-sounding human names, warm editorial photography. **Never lorem ipsum. Never "Headline Here".**

---

## 3. The rules that keep 485 designs coherent

1. **Token-driven, always.** The same section must survive re-skinning across 12 Style Packs with **only tokens changing**. If a pack change would tempt you to move an element, the design is wrong. This is the single most important rule here — a section that only looks good in one pack is a defect, however beautiful.
2. **Structure is the design.** What distinguishes two designs in a category is *arrangement*, not colour or font. Those come from the pack.
3. **Same category, same content.** Every design within a category draws from one shared field list. Design #7 may use fewer fields than #3, but it must never need a field the category doesn't have — because users switch between designs with their content preserved, and a field with nowhere to live is content lost.
4. **Reuse ruthlessly.** Components established in earlier categories carry forward verbatim. A button, card, avatar or meta row designed in A1 is the same in A24.
5. **Minimal controls.** 4–7 per design. If you want an eighth, something else is not earning its place.
6. **The squint test.** At 25% zoom the section still reads as one composition with an obvious focal point.
7. **The ugly test.** Imagine the worst reasonable user content — a 90-character headline, a missing image, one post where six were expected. The design must stay composed.
8. **Flag invention.** Where the brief is thin and you had to decide something, say so on the frame. Invented detail that looks authoritative is worse than a flagged gap.

---

## 4. What every design must deliver

For **each design** in the category:

**Frames**
- **Desktop 1440** — light mode. The primary frame.
- **Mobile 390** — showing the collapse.
- **Tablet 834** — only where it differs meaningfully from a simple narrowing. Say so when you skip it.
- **Dark mode** — desktop only, unless dark changes the structure.

**The control panel** — the sidebar as the user sees it for *this* design: the Design picker at the top, then this design's own 4–7 controls with their exact named values (Compact / Comfortable / Spacious — never px or hex). Designs in the same category will have *different* control sets; that is correct and expected.

**The written spec**, beside the frames. **All ten fields, every time** — this list is normative and
is the exact list the reconciliation pass checks each design against (`sections-inventory.md` §"What
each design carries"). A design missing any of them is half-delivered and will come back.

- **Descriptor** — the one-line structural identity: what makes this design *this* design.
- **Structural descriptor (the tuple)** — `archetype · containment · ground · item-count class ·
  media placement · emphasis mechanism`, the six slots separated by a space, a middle dot, and a
  space. ⚠️ **This is machine-checked, and free prose is not.** The uniqueness rule runs on the
  *tuple*, because two designs can be described differently in English and still be the same
  design. **It must stay unique within its category once every design's control list is written**
  — controls stop distinguishing designs at that point, so the tuple is the only thing left that
  does.

  **The first five slots are closed sets.** Write the exact word on its own — no parenthetical, no
  qualifier, no synonym, nothing appended. The check is a literal match, so `few (2–4)` **fails**
  where `few` passes.

  | Slot | Allowed values |
  |---|---|
  | archetype | the fourteen in the next bullet |
  | containment | `none` · `card` · `box` · `pill` |
  | ground | `page` · `surface` · `contrast` · `image` · `transparent` · `accent` |
  | item-count class | `none` · `one` · `few` · `many` · `variable` |
  | media placement | `none` · `left` · `right` · `top` · `bottom` · `background` · `inline` · `edge` · `full-bleed` |

  **Containment is a property of the SECTION, not of the items inside it.** A bare section whose
  posts happen to be drawn as cards is `none` — those cards are the *item's* geometry. Use `card`,
  `box` or `pill` only when the section itself sits in one. This is the single most likely slot to
  get wrong: most card grids are `none · page`.

  **Ground is what the section rests on**, which is how two otherwise identical designs earn their
  places — the same header on `surface` and on `contrast` are two designs, and this slot is what
  says so. `page` is the page's own background; `transparent` means the section has no ground of
  its own and shows what is beneath it.

  What the count values *mean* — a gloss, never write it into the tuple: `none` = no repeating
  unit · `one` = exactly one · `few` = 2–4 · `many` = 5 or more · `variable` = the author decides
  how many. The sixth slot, **emphasis mechanism**, is the only open one: a free phrase of at most
  four words naming the single device that distinguishes this design.

  **What this check can and cannot promise.** It verifies that every design makes a distinct
  structural claim. It cannot verify the claim is true — designs differing only in density, scale,
  motion or alignment reach the same five closed slots and rest on the emphasis phrase, which no
  machine reads. Uniqueness beyond structure, containment and ground is a judgement, not a gate.

- **Archetype** — which responsive archetype it collapses under: grid-of-N, split, stack, bar, nav,
  edge rail, overlay, feed, form, carousel, table, media frame, sticky, or article body. This
  supplies its default collapse ladder, so the responsive rule below only has to state the
  *departures* from it.
- **Responsive rule** — in words, what happens at each width; and where it cannot follow its
  archetype, the bespoke behaviour.
- **Content fields** — the subset of the category union it uses: exact names, types, optionality, limits.
- **Controls** — its own list **in sidebar order**, each with its complete closed value set, Quick
  Controls first.
- **Data** — what it binds from Ghost, and its behaviour at **0, 1 and many** items.
- **Empty state** — what renders when optional content is absent.
- **Behaviour module** — which module it declares, if any; whether that module is **edit-safe**; and
  ⚠️ **its no-JS degradation, written out.** That is an acceptance criterion, not a footnote — a
  design whose module is missing its degradation statement is not done.
- **Accessibility notes** — heading level, focus order, anything needing a label.

**Where the specs go:** into `prds/prd-Inflozo-2026-08-17/sections-inventory.md`, which already
carries this schema and the two-layer structure (category union, then per-design) they slot into.
**The frames go in `design/`; the specifications do not.** They are the half that the build reads.

**Per category, additionally:**
- **One design rendered in three packs, light and dark** (6 frames) — the tokenisation proof.
- **One stress frame** — that category's worst realistic content.
- **The category's shared field list** — the union of everything its designs need. This is the contract that makes design-switching safe.

---

## 5. Order of work

Run the categories in §6's order. It follows the build order exactly:

1. **The shell block first** — A1, A2, A3. Site-wide furniture. Everything else appears inside it, so it must exist first.
2. **Then A4 Heroes** — the flagship, and the pilot for control density.
3. **Then the rest**, in the order listed.

**⚠️ If each category is a separate chat — which is what this prompt intends — that review cannot
happen on its own.** A fresh session has no memory of what earlier categories established, so the
continuity has to be carried by hand: close each session by asking for a **component inventory**
(name · what it is · which category first established it, cumulative rather than reset), and paste
that inventory above the master brief when you open the next one. Without it the library drifts one
category at a time, and the reconciliation pass finds thirty variants of a button that should have
been one. The copy-ready blocks for both halves are on `BUILD-BOARD.html`.

Each session opens by reviewing the previous category's output for components to reuse, and closes with the category's shared field list.

---

## 6. The 34 categories

**Group 1 — Structure & Chrome (47) · the shell block, design first**

| ID | Category | Designs | Notes |
|---|---|---|---|
| A1 | Headers & Navigation | 16 | Site-wide. Includes sticky and sticky-shrink behaviour, transparent overlay, and a drawer pattern. Establishes nav, logo, button and drawer components for the whole library. |
| A2 | Announcement Bars | 15 | Site-wide, above the header. Dismissible; audience targeting (everyone / logged out / free / paid). |
| A3 | Footers | 16 | Site-wide. Establishes link columns, social row and the newsletter inline form. |

**Group 2 — Marketing Sections (199)**

| ID | Category | Designs |
|---|---|---|
| A4 | Heroes | 18 |
| A5 | Features | 16 |
| A6 | CTA Banners | 15 |
| A7 | Pricing & Tiers | 15 |
| A8 | Testimonials | 15 |
| A9 | FAQ | 15 |
| A10 | Stats & Numbers | 15 |
| A11 | Logo Walls | 15 |
| A12 | About & Team | 15 |
| A13 | Process / How It Works | 15 |
| A14 | Galleries | 15 |
| A15 | Video & Embeds | 15 |
| A16 | Contact | 15 |

**Group 3 — Ghost Content Sections (109)** — these bind live Ghost data; the spec must state what happens with 0, 1 and many items

| ID | Category | Designs |
|---|---|---|
| A17 | Post Grids | 18 |
| A18 | Post Lists | 15 |
| A19 | Featured & Spotlight | 15 |
| A20 | Tag Collections | 15 |
| A21 | Author Showcases | 15 |
| A22 | Newsletter / Subscribe | 16 |
| A23 | Search | 15 |

**Group 4 — Template-Specific (102)**

| ID | Category | Designs | Notes |
|---|---|---|---|
| A24 | Post Headers | 16 | |
| A25 | Post Content Layouts | 12 | Wraps the article body. Controls: measure, drop cap, type scale, table of contents (off/left/right), share rail. Design against the style-guide fixture. |
| A26 | Post Footers | 15 | |
| A27 | Related Posts | 12 | |
| A28 | Comments | 10 | Wrappers around Ghost's own comments block — design the frame, not the comments. |
| A29 | Archive Headers | 14 | |
| A30 | Members Pages | 13 | Full-page membership designs. Signup and sign-in forms are themeable; account is display-only, and everything that changes a subscription hands off to Ghost's own Portal. |
| A31 | Error & Utility | 10 | 404, 500, private-site gate. |

**Group 5 — Treatments (28)** — not placed on a canvas; they style something Ghost renders

| ID | Category | Designs | Notes |
|---|---|---|---|
| A32 | Paywall / Content CTA | 12 | Rendered mid-article at the members-only cut. Blur and fade apply to the **visible** end of the free preview only — the browser never receives the hidden text. |
| A33 | Koenig Card Treatments | 6 | Site-wide card styling. Design **with** the card design module from Prompt 2 Part C — same surface. |
| A34 | Pagination Styles | 10 | Attach beneath a feed. |

**Total: 485.**

---

## 7. Scope, stated honestly

At three-to-four frames plus a control panel per design, this pass is roughly **1,500–2,000 frames**. That is the deliberate cost of designing everything before building anything. Two things follow:

- **Never rush a category to cover more ground.** One well-specified category beats three vague ones, and the next category inherits the previous one's quality.
- **Consistency outranks novelty.** By category ten you should be reusing far more than you invent. If you are still inventing components late in the run, something earlier was under-designed.

— End of Design Prompt 3 —
