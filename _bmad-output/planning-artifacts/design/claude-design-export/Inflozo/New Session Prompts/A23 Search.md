# Inflozo — Design Prompt 3: A23 Search

> **How to use:** paste this entire file into a fresh session in the Inflozo design project. It contains the master brief (§1–§4) and the one category block for this run. Do not add other categories.
>
> §1–§4 are restated from Design Prompt 3. If you have the original document, replace §1–§4 with its exact text — that version is the binding one.

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

1. **Token-driven, always.** The same section must survive re-skinning across 12 Style Packs with **only tokens changing**. If a pack change would tempt you to move an element, the design is wrong. A section that only looks good in one pack is a defect, however beautiful.
2. **Structure is the design.** What distinguishes two designs in a category is *arrangement*, not colour or font. Those come from the pack.
3. **Same category, same content.** Every design within a category draws from one shared field list. Design #7 may use fewer fields than #3, but it must never need a field the category doesn't have — users switch between designs with their content preserved, and a field with nowhere to live is content lost.
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

**The control panel** — the sidebar as the user sees it for *this* design: the Design picker at the top, then this design's own 4–7 controls with their exact named values (Compact / Comfortable / Spacious — never px or hex).

**The written spec**, beside the frames: content fields (names, types, optional, limits) · controls with their complete value lists · data (what it pulls from Ghost and what happens when that data is missing) · responsive rule in words · empty state · accessibility notes.

**Per category, additionally:**
- **One design rendered in three packs, light and dark** (6 frames) — the tokenisation proof.
- **One stress frame** — that category's worst realistic content.
- **The category's shared field list** — the union of everything its designs need. This is the contract that makes design-switching safe.

---

## 5. The category for this session

| ID | Category | Designs | Notes |
|---|---|---|---|
| A23 | Search | 15 | Binds live Ghost data; the spec must state what happens with 0, 1 and many items. |

Pack: **Paper**, as every category before it.

---

## 6. Continuity — read the finished categories first

Categories are run in order, so everything before this one is drawn and specified in this project. Each has a canvas file per design, a `<ID>-0 Category Proof.dc.html` holding its tokenisation proof, stress frame, shared field list and roster, and a `<ID> … — Spec.md` written specification. **Open the most recent category's proof file and spec doc before designing anything.**

**Components established in A1 Headers, carried forward verbatim:**

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
| Avatar + meta row — 24 px circle, initials fallback, "Name · date" at 13 px | A1·6, A1·7 |
| Overflow "More" menu, member pill + account menu, takeover, floating panel | A1·1, A1·14, A1·6, A1·16 |

**Paper tokens.** Light: background `#FBF9F5` · surface `#FFFFFF` · hover surface `#F4F0E8` · text `#232019` · muted `#6B6459` · border `#EBE5DB` · accent `#D96C3F` · contrast `#232019` carrying `#FBF9F5` text. Dark: background `#171511` · surface `#211D17` · text `#F2EDE4` · muted `#A79E8F` · border `#332E27` · accent `#E0805A` · contrast `#EDE7DA` carrying `#171511` text. Radius 8. Heading Georgia, body Inter; JetBrains Mono for frame labels only.

**Imagery placeholders.** Striped fill `repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)` in light, `(45deg,#3A342B 0 10px,#332E26 10px 20px)` in dark, with a mono caption naming the crop.

**Motion.** 160 ms ease-out, one transition per state change, thresholds unchanged under reduced-motion.

---

## 7. Rules this project added to §3, learned the hard way

1. **Content parity across frames.** Every frame of a design draws the same authored content. Only what a stated rule names may differ by width. A frame quietly carrying less than its siblings is a defect.
2. **Label frames by the width they are actually drawn at.** A dark frame drawn at 1040 is "desktop 1040", not "desktop"; a frame showing an arrangement that only exists above a breakpoint must be drawn above that breakpoint.
3. **One rule, one place.** A rule stated in a frame caption, its spec card and the spec doc must read identically. Every element that leaves at some width needs a stated destination at that width.
4. **Named values only** in controls. A value that would fail contrast is disabled with its ratio shown, never silently allowed.
5. **Prose: plain and factual.** No invented statistics, no "X, not Y" constructions, no aphorism endings, no stacked superlatives, no unsourced absolutes. Flag every invented detail on the frame and in the spec's Flagged line.
6. **6 controls plus the Design picker** is the working norm; 7 is the ceiling.
7. **Frame set per design:** desktop 1440 light, the behaviour states, a hover/focus states frame, tablet 834 always, mobile 390 in both its states, dark desktop, an annotated accessibility frame, the control panel, the spec card.
8. **Designs may hand off to other designs** where a design cannot exist at a width or without a precondition — established in A1·11 and A1·15. Say when you use it.

---

## 8. What A23 must settle

1. This is the surface A1·9 Search-Forward opens — match its result row and its keyboard model.
2. Empty query, no results, and many results, including the count announcement.
3. Filters by tag or author, and whether they are part of the design or a control.
4. What indexes: title, excerpt, tag, body — and what the spec promises.

Flag every answer you invent, on the frame and in the spec.

— End of prompt —
