# Inflozo — Design Prompt 3: A2 Announcement Bars

> **How to use:** paste this entire file into a fresh session in the Inflozo design project. It contains the master brief (§1–§4) and the one category block for this run. Do not add other categories.
>
> §1–§4 below are restated from Design Prompt 3. If you have the original document to hand, replace §1–§4 with its exact text — it is the binding version.

---

## 1. What this is, and why it is different

The Inflozo section library is **485 designs across 34 categories**. Every one is being designed before any is built.

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

**The written spec**, beside the frames:
- **Content fields** — exact names, types, whether optional, any limits.
- **Controls** — each with its complete list of allowed values.
- **Data** — what it pulls from Ghost, if anything, and what happens when that data is missing or empty.
- **Responsive rule** — in words, what happens at each width.
- **Empty state** — what renders when optional content is absent.
- **Accessibility notes** — heading level, focus order, anything needing a label.

**Per category, additionally:**
- **One design rendered in three packs, light and dark** (6 frames) — the tokenisation proof.
- **One stress frame** — that category's worst realistic content.
- **The category's shared field list** — the union of everything its designs need. This is the contract that makes design-switching safe.

---

## 5. The category for this session

| ID | Category | Designs | Notes |
|---|---|---|---|
| A2 | Announcement Bars | 15 | Site-wide, above the header. Dismissible; audience targeting (everyone / logged out / free / paid). |

Pack: **Paper**, as A1.

---

## 6. Continuity — A1 is complete in this project

Sixteen header designs are drawn and specified. Files: `A1-0 Category Proof.dc.html` (tokenisation proof, stress frame, shared field list, roster, open decisions) and `A1-1 Rail` … `A1-16 Reveal`, plus `A1 Headers — Spec.md`. Read A1-0 and the spec doc first; A1-1 Rail is the component reference.

**Reuse verbatim — do not redesign:**

| Component | Where it was set |
|---|---|
| Logo lockup — 26 px accent rounded-square mark + wordmark, 10 px gap | A1·1 |
| Nav item — 15 px, muted resting, text + 2 px accent underline active | A1·1 |
| Dropdown panel — 248 px, surface, hairline, md shadow, two levels | A1·1, A1·7 |
| Primary button — accent fill, 14 px/600, padding 9×17, radius token | A1·1 |
| Ghost action — muted 14 px text in a bar; bordered full-width in a drawer | A1·1 |
| Drawer — 64 px close row, heading-font items 22–26 px, actions pinned to the foot | A1·1, A1·2 |
| Search affordance — 38 px button with a 19 px glyph; 44 px target; field in the drawer | A1·2 |
| Icon button — 38 px box, 8 px radius, bare / outlined / filled | A1·14 |
| Overflow "More" menu, member pill + account menu, takeover, floating panel | A1·1, A1·14, A1·6, A1·16 |

**Paper tokens.** Light: background `#FBF9F5` · surface `#FFFFFF` · hover surface `#F4F0E8` · text `#232019` · muted `#6B6459` · border `#EBE5DB` · accent `#D96C3F` · contrast `#232019` carrying `#FBF9F5` text. Dark: background `#171511` · surface `#211D17` · text `#F2EDE4` · muted `#A79E8F` · border `#332E27` · accent `#E0805A` · contrast `#EDE7DA` carrying `#171511` text. Radius 8. Heading Georgia, body Inter; JetBrains Mono for frame labels only.

**Motion.** 160 ms ease-out, one transition per state change, thresholds unchanged under reduced-motion.

---

## 7. Rules this project added to §3, learned the hard way

1. **Content parity across frames.** Every frame of a design draws the same authored content — same nav items, same actions, same children. Only what a stated rule names may differ by width. A frame quietly carrying less than its siblings is a defect.
2. **Label frames by the width they are actually drawn at.** A dark frame drawn at 1040 is "desktop 1040", not "desktop"; if a frame shows an arrangement that only exists above a breakpoint, draw it above that breakpoint.
3. **One rule, one place.** A rule stated in a frame caption, its spec card and the spec doc must read identically. Every element that leaves a bar at some width must have a stated destination at that width.
4. **Named values only** in controls. A value that would fail contrast is disabled with its ratio shown, never silently allowed.
5. **Prose: plain and factual.** No invented statistics, no "X, not Y" constructions, no aphorism endings, no stacked superlatives, no unsourced absolutes. Flag every invented detail on the frame and in the spec's Flagged line.
6. **6 controls plus the Design picker** is the working norm; 7 is the ceiling.
7. **Frame set per design:** desktop 1440 light, the behaviour states, a hover/focus states frame, tablet 834 always, mobile 390 closed and open, dark desktop, an annotated accessibility frame, the control panel, the spec card.

---

## 8. Three decisions carried forward, unconfirmed

1. **No design ever turns into another design.** ~~A1·11 becomes A1·1 below 1200; A1·15's collapsed state is A1·1; A1·4 and A1·8 fall back to A1·1 when their preconditions are absent.~~ **Settled by the design patch pass (Part A·A8), ruled to apply in all 33 categories:** a placed design is the design that renders. It hides what does not apply; the panel may advise, never switch. A2 may not rely on hand-off. **It still adapts, by four permitted moves only** — reflow, hide, scroll and collapse — all of which keep the design's own type, colour, spacing and claim. **Responsiveness is a requirement, not a control:** a design that cannot hold together at 390 is redrawn with its own narrow arrangement or cut and its number retired, never served as a different design.
2. **`contrast` is defined per mode in every pack** — near-ink in light, pale warm neutral in dark. A2 will need it: a bar on contrast is the obvious default treatment.
3. **The member block reads tier and renewal date from Ghost** (A1·14) — relevant to A2's audience targeting, which needs the same member state.

---

## 9. What A2 must additionally settle

- **Stacking.** A2 sits above every A1 design. Draw it above A1·1 Rail as the baseline, and check it against A1·4 Overlay (an opaque bar over a transparent header) and A1·8 Utility + Nav (three stacked bands before the reader reaches a headline).
- **Dismissal.** Where the close control sits, how it reads at 390, whether dismissal persists per session or per browser, and what the header does when the bar goes — the page must not jump.
- **Audience targeting.** Everyone / logged out / free members / paid members, and what the editor shows when previewing an audience the current user is not in.
- **Height and reflow.** A bar is the one section whose height moves everything below it, including a sticky header's offset and in-page anchor targets.

— End of prompt —
