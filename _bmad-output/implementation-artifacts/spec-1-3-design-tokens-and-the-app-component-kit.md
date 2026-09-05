---
title: 'Story 1.3 — Design tokens and the app component kit, taken from the export'
type: 'feature'
created: '2026-09-05'
status: 'in-progress'
baseline_commit: 'f83a46ae414455c8aa95149b0d14d4d9a5adf2c1'
review_loop_iteration: 0
owner_test: none
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md', '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md']
---

## In plain English

Nothing a customer uses changes in this story: it builds the box of parts every later screen is assembled from — the colours, the type, the spacing, and every button, input, badge and switch that Claude Design drew for the app's sidebar — so that the sign-in page and the dashboard in the next two stories are built from those parts rather than drawn again. You will be able to open one internal page, `app.inflozo.com/kit`, and see every part laid out in the same order and at the same width as the design frame, which is how anyone checks that the app looks like the design. A greyed-out control on that page always carries its reason in a sentence underneath it, because that is a rule of the design and the parts are built so it cannot be broken.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stories 1.4 and 1.5 are the first product screens and every later epic draws on the same chrome; today `apps/web` has one Tailwind import and two placeholder pages, so each screen would re-derive colours, type and controls from the frames — the exact drift R-74 forbids.

**Approach:** Transcribe the export's values into one Tailwind 4 `@theme` token layer under `DESIGN.md`'s recorded names, self-host the three faces, build one React component per group of the Editor Sidebar Kit with the P0-0 greyed-with-reason pattern enforced by the component's type, and ship an internal gallery route that renders every component in the Kit's own order and width — so "matches the frame" is checked by looking, and the token values are checked by a test that greps the export.

## Boundaries & Constraints

**Always:**
- Token names are `DESIGN.md`'s front-matter names in Tailwind's namespaces (`--color-paper`, `--color-ink-soft-aa`, `--radius-thumb`, `--shadow-focus`, `--font-display`, `--breakpoint-tablet` …); every colour and shadow value occurs verbatim in the export (F-110's grep, now a test).
- The export is read-only (R-74). Where `DESIGN.md` and a frame disagree, the frame is right: read the value off the frame and correct `DESIGN.md` in the same commit — its own precedence rule.
- The two 2026-09-04 token rules hold everywhere: one focus ring (`shadow-focus`, 2px solid coral-text, on `focus-visible`); placeholder, hint and mono line-number text in `ink-soft-aa`, never `ink-faint`. `R Responsive System`'s "2px ring at 40%" line is stale and is not followed.
- A greyed control always carries its reason as one sentence in the helper-caption slot, never a tooltip, and the prop type makes it impossible to grey without a reason (UX-DR3; R-33, R-68, R-69). A control that could never act is absent — the caller's decision; the kit offers no "hidden" prop.
- Font sizes are read off the frame and never rounded to a scale step (F-111): 12.5 and 11.5 are ordinary.
- Icons are Tabler, inline `<svg>` paths in `currentColor` at 1.5px stroke (R-26, decision D1), with the MIT notice at the top of the icons file.
- Tailwind styles `apps/web` only; `@source not "../../../packages/library"` stays (spine, Styling).
- Zero axe-core violations on the gallery (NFR-5); every interactive component reachable by Tab.
- No hex colour literal in any `.tsx` under `apps/web` — the tokens are the only colour vocabulary.

**Ask First:**
- Any token or component the export does not draw. The answer is an Appendix A design prompt, never an invention (`DESIGN.md` Don'ts).
- Any new dependency. `next/font/google` and Tailwind are installed; an icon package is not needed.

**Never:**
- No app dark palette. The export draws none and `DESIGN.md` says there is no app dark mode in v1; dark ground exists in exactly two designed places (`ink-deep` template-surface chrome, `ink` canvas pills) and the gallery shows those components on that ground only. Ruled by the owner on 2026-09-05 (question 1, option 1): light as drawn, and the canvas pills and the paywall chrome on their dark ground.
- No Style Pack tokens. The Calibration Set's Paper / Tangerine / Ink light+dark values are the sites' system and belong to E6 (`packages/library/packs`, Story 6.1).
- No editor collapse behaviour. `R Responsive System` gives the app its three widths; the editor's own ladder (Layers to an icon rail, Controls to an overlay) is drawn in D8 and built in Story 5.22. This story ships the breakpoint tokens and the coarse-pointer `app-floor` condition — nothing that collapses.
- No `@inflozo/library` import. Nothing here reads the library, so DW-1 and DW-2 stay open for the first story that does (E4).
- No CSS-in-JS, no second component vocabulary, no Storybook, no editing of a frame, no hand-edit of a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Greyed control | `<Toggle checked greyed={{ reason: 'Off while the header sits over the hero image.' }} />` | The P0-0 treatment (fill `grey-field`, border `grey-border`, label in `ink-faint`, `cursor: not-allowed`), the stored value still visible, `aria-disabled="true"`, `aria-describedby` → the reason sentence (11.5px `ink-soft`) directly under the control, not editable | `greyed` without `reason` is a type error |
| Greyed, value not its own (R-69) | `<Segmented greyed={{ reason: 'The list you picked is the order.', value: null }} … />` | No segment marked active; the reason names the value in force | — |
| Pro badge clicked | any click | Nothing — no upgrade sheet, ever (UX-DR19) | — |
| Persistence indicator | one of the four labels | one dot + the label text, never a spinner | any other label is a type error |
| Feedback banner | `kind: 'info' \| 'success' \| 'notice' \| 'error'` | sky / mint / marigold / danger tint with the hue's text value; a link inside takes `sky-text`, never coral | — |
| Keyboard focus | Tab to any control | one ring (`shadow-focus`); hover on a row is the 40% wash, selection is `coral-tint`; focused-and-selected shows both (D8e) | — |
| Reduced motion | `prefers-reduced-motion: reduce` | every transition becomes an instant state change (`DESIGN.md` Motion) | — |
| Gallery route | `GET https://app.inflozo.com/kit` | 200, statically prerendered, `robots: noindex`; the token sheet, then every Kit group in the Kit's order at 280px | a component that throws fails `next build` |

</frozen-after-approval>

## Code Map

- `apps/web/app/globals.css` -- today `@import "tailwindcss"` + `@source not`; the `@theme` block lands here, plus the base rules the Kit's own `<style>` sets (`Editor Sidebar Kit.dc.html:15-18`: body on paper in ink, `::placeholder` in ink-soft-aa)
- `apps/web/app/layout.tsx` -- `next/font/google` for Bricolage Grotesque (opsz 12..96, wght 500–800), Inter 400/500/600, JetBrains Mono 400/500 — the exact axes every frame's `<link>` requests (`Calibration Set.dc.html:11`); exposed through `@theme inline` as `--font-display` / `--font-ui` / `--font-mono`
- `apps/web/app/(app)/app/page.tsx` -- the internal `/app` prefix (`routing.ts`): `app.inflozo.com/kit` is `app/(app)/app/kit/page.tsx`
- `apps/web/tsconfig.json` -- `@/*` alias, so `@/components/kit/...`
- `apps/web/package.json` -- `test` is `node --test '*.test.ts'` at the package root, so the token test lives beside `routing.test.ts`
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md:1-177` -- the front matter **is** the token record: `colors.*`, `typography.*`, `rounded.*`, `spacing.*`, `components.*`, `elevation.*`; § Components (`:404-470`) the per-component look; § Motion (`:512`) the only source for durations. Read-only source of names, corrected only when a frame disagrees
- `…/design/claude-design-export/Inflozo/Editor Sidebar Kit.dc.html` -- **the frame.** One `<section>` per group, all inline hex, no classes: labels `:31` · accordion `:44` · inputs `:53` · segmented `:63` · design picker `:71` · swatch row `:85` · micro-controls (stepper, toggle, eye, grip) `:99` · select rows `:109` · radio cards `:117` · buttons `:132` · badges & chips `:159` · tooltips `:185` · quick-controls card `:195` · pack cells `:204` · layers rows `:220` · condition row `:228` · banners `:238` · toast `:242` · loading `:246` · image control `:256` · empty panel `:266` · shortcut rows `:274`. Keyboard focus is not drawn here — `D8 Editor Below 1440.dc.html` D8e draws it
- `…/P0-0 Greyed Control Pattern.dc.html` -- `:25` the rule (text at the control, never a tooltip), `:76-82` the treatment and the announced form, `:89` all five greyed shapes, `:70-126` the five reason sentences (the wording pattern: "Not available / Off / Fixed at N while <the state that caused it>")
- `…/Calibration Set.dc.html:27-38` -- the Two Token Rules box; the rest is the sections' calibration (12 sections × 3 packs × light/dark) and is E6's
- `…/R Responsive System.dc.html:22-33` -- 1440 · 834 · 390; `:874-940` is the sites' global ladder (E4's); its focus line is stale
- `…/D8 Editor Below 1440.dc.html` -- D8e the focused layers row (ring over whichever state it is in); D8a 44px targets on touch
- `_bmad-output/planning-artifacts/ux-designs/prototype/styles.css:1-70` -- 5b's transcription of the same tokens, grep-verified against the export on 2026-09-04 (F-110): the reuse map for values; `:283-291` the greyed treatment (`--grey-field #F2EFEA`, `--grey-border #EAE5DD`); the component classes after it show the frames' construction (heights, paddings) but carry prototype scaffolding — read it, never import it
- `…/ux-Inflozo-2026-09-03/EXPERIENCE.md:279-300` -- § Component Patterns: the behavioural rule per component (greyed / absent, Pro badge, persistence indicator, banner)
- `apps/web/routing.test.ts` · `tools/stress/test-ad36.js` -- the `node --test` style; `.tsx` cannot run under it (no JSX strip), so the render check is `next build`'s prerender
- Headless axe: playwright 1.61.1 and axe-core 4.12.1 exist on this machine outside the repo (the tooling note); run against the deployed URL, never installed here

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/app/globals.css` -- the `@theme` block: every `colors.*` → `--color-*` (plus `--color-grey-field` / `--color-grey-border` from P0-0), `rounded.*` → `--radius-*`, `elevation.*` → `--shadow-*`, `--breakpoint-mobile/tablet/desktop` 390 / 834 / 1440, `--text-body/ui/ui-dense/panel-label/control-label/helper-caption`, `--ease-out`, `--duration-fast: 160ms`, `--duration-overlay: 200ms`; `@theme inline` for the three font variables; `@custom-variant coarse (@media (pointer: coarse))` as `app-floor`'s condition; base: body on paper in ink, `::placeholder` in ink-soft-aa, `prefers-reduced-motion: reduce` zeroing transitions. The 4px grid is Tailwind's default `--spacing` and is not redeclared -- one token layer, `DESIGN.md`'s names, native Tailwind 4
- [x] `apps/web/app/layout.tsx` -- the three `next/font/google` faces with the frames' axes, their variables on `<html>`, `font-ui` on `<body>` -- self-hosted at build, no runtime request to Google, nothing for 1.4's CSP to allow
- [x] `apps/web/components/kit/icons.tsx` -- the Tabler icons the Kit draws, inline `<svg>` in `currentColor`, stroke 1.5, `aria-hidden` unless labelled; MIT notice at the top; membership derived from the Kit, never fixed here
- [x] `apps/web/components/kit/greyed.ts` -- `type Greyed = { reason: string; value?: null }` and `greyedProps(id, greyed)` (`aria-disabled`, `aria-describedby`, `data-greyed`) -- UX-DR3 by construction, in one place
- [x] `apps/web/components/kit/*.tsx` -- one file per Kit group, named after it (`labels`, `accordion`, `input`, `segmented`, `design-picker`, `swatch-row`, `stepper`, `toggle`, `visibility`, `grip`, `select`, `radio-card`, `button`, `badge`, `tooltip`, `quick-controls-card`, `pack-cell`, `layers-row`, `condition-row`, `banner`, `toast`, `loading`, `image-control`, `empty-panel`, `shortcut-row`, and from the S/B frames `canvas-pill`, `persistence-indicator`, `moon-badge`); Tailwind utilities on the tokens only; `'use client'` only where a control holds state; every control accepts `greyed?: Greyed` and renders the reason under itself -- the vocabulary, once
- [x] `apps/web/app/(app)/app/kit/page.tsx` -- the gallery: the token sheet first (each colour as a swatch with name and value, the radii, the shadows, the type roles in their faces, the breakpoints), then every group in the Kit's order inside a 280px column on paper, each state the frame draws as its own instance (rest · greyed with reason · selected · icon button disabled at 35%), the components that float over the canvas on an `ink` ground; `metadata.robots = { index: false }`; statically prerendered -- the review surface
- [x] `apps/web/tokens.test.ts` -- reads the `@theme` block: (a) every hex / rgba value occurs in some `.dc.html` under the export; (b) every `colors.*`, `rounded.*` and `elevation.*` key in `DESIGN.md`'s front matter has its `--color-*` / `--radius-*` / `--shadow-*` twin; (c) no `.tsx` under `apps/web` contains a hex colour literal -- "matches the frame" and "no second vocabulary" as a gate, run by `pnpm check`

**Acceptance Criteria:**
- Given `Calibration Set.dc.html`, `Editor Sidebar Kit.dc.html` and `R Responsive System.dc.html`, when the token layer is built, then its values are theirs (every colour and shadow value greps in the export) and its names are `DESIGN.md`'s recorded names — the test asserts both.
- Given the Editor Sidebar Kit, when the gallery renders, then every control, panel, badge and state the Kit draws has a component (one per section, `:31`–`:274`) including the greyed-with-reason pattern, and the gallery at 280px **matches the frame** section for section, in the Kit's order (R-74).
- Given any control with `greyed`, when it renders, then the reason is one sentence in the helper-caption slot under the control and is announced with it, never a tooltip; and `greyed` without a `reason` does not compile (UX-DR3).
- Given the token layer, when the breakpoints are read, then they are 390 / 834 / 1440 under `DESIGN.md`'s names and `app-floor` is a coarse-pointer condition, never a bare width (UX-DR16, R-87).
- Given `apps/web`, when its `.tsx` files are scanned, then no hex colour literal exists outside `globals.css` — no second interface vocabulary beside the export's.
- Given the deployed `https://app.inflozo.com/kit`, when axe-core runs on it, then zero violations at WCAG 2.1 AA, and Tab reaches every interactive component with the one ring.
- Given a push to `main`, when CI runs, then `check` (lint, typecheck, the token test, `next build`) is green and `deploy` publishes the gallery.

## Spec Change Log

**Three corrections the frames forced, made under the spec's own precedence rule** ("where
`DESIGN.md` and a frame disagree, the frame is right: read the value off the frame and correct
`DESIGN.md` in the same commit"). None of them invents a value; each was read off the export.

1. **`danger-text` `#C4383C` added to `DESIGN.md`'s colours, and `components.button-danger.background`
   corrected to it.** Every other hue that carries words already had its `-text` twin; danger did not,
   so `{colors.danger}` `#E5484D` was being set in words — 3.91:1 on white and 3.42:1 on its own tint,
   both under WCAG AA, and axe-core said so on the first run (six nodes). The Kit has had the darker
   value all along: `:135` fills the danger button `#C4383C` under white type and `:113` sets the
   Delete menu row in it. Measured after the change: 5.28:1 on surface and on the fill, 4.62:1 on the
   tint. Now used by the danger button, its outline variant, the Delete row, the error banner and the
   error result chip.
2. **`EXPERIENCE.md` § Component Patterns said the persistence indicator has "Four labels".** The frame
   is headed `B6 · #6 · PERSISTENCE, FIVE STATES` and its own note reads "One indicator, five labels".
   The fifth exists because a browser with no local storage must never be told its work is saved on the
   device. The row now names the frame instead of a number, and `PersistenceState` is exactly those
   five — a sixth is a compile error.
3. **`next/font` refuses `axes` beside a weight list** (executed: `next build` fails outright, "Axes can
   only be defined for variable fonts when the weight property is nonexistent or set to `variable`").
   Bricolage Grotesque therefore loads as the variable face across `opsz` and `wght`, which is what the
   frames' `<link>` asks for — `12..96,500…800` is a range on the variable font, not four static cuts.

**Two readings a reviewer may disagree with, stated rather than buried.**

- **The danger outline button keeps `border-danger`, not the frame's `#F5C6C9`.** That hairline reads at
  1.5:1 on white and would be the visual boundary of a UI component, which WCAG 2.1 1.4.11 puts at 3:1;
  `danger` clears it at 3.91:1 and names the same hue. `DESIGN.md` records no border value for this
  button, so nothing was contradicted — but the frame does draw the lighter hairline, and this trades
  it for the contrast floor the spec calls non-negotiable.
- **Two groups do not fit the 280px column the way the Kit's own 352px panel does.** The swatch row's
  seven labels now wrap rather than clip (one class; every circle and label stays at its drawn size),
  and the condition row scrolls inside its own box. Neither reflows or hides anything, and no page-level
  horizontal scroll exists at 1440, 834 or 390.

**One prop tightened during verification.** `id` on the stateless controls was only a namespace for
`${id}-label` and `${id}-reason`; it is now also the element's own `id`, as it always was on the input.
The stepper additionally gained `role="group"` + `aria-labelledby`, which every sibling control already
had and which is why axe saw its greyed label as live text on the first run.

## Design Notes

**Why `@theme` and not a token file.** Tailwind 4 is installed and CSS-first: one `@theme` custom property is at once a CSS variable, a utility (`bg-paper`, `text-ink-soft-aa`, `rounded-thumb`, `shadow-focus`, `tablet:`) and a value a later story reads by name. One place, native, nothing generated.

**Why the greyed reason is a type.** The rule says "always with the reason" and the export cannot enforce it. `greyed?: { reason: string }` makes an unreasoned grey a compile error — a mechanism that closes the class, which this project prefers to a review that catches the instance.

```tsx
// components/kit/greyed.ts
export type Greyed = { reason: string; value?: null }   // value: null → R-69: mark no value
export function greyedProps(id: string, g?: Greyed) {
  return g ? { 'aria-disabled': true, 'aria-describedby': `${id}-reason`, 'data-greyed': '' } : {}
}
// in every control, last in its own row group — P0-0: the row never moves, the panel grows:
{greyed && <p id={`${id}-reason`} className="text-[11.5px] leading-[1.4] text-ink-soft">{greyed.reason}</p>}
```

**Where the values come from, precisely.** The frames define no CSS variables — executed: zero `var()` across the four frames, 1112 inline styles in the Calibration Set alone, and exactly two class names in the whole export. `DESIGN.md`'s front matter is the named transcription, re-verified against the 2026-09-04 export; 5b's stylesheet is the same transcription with the grep already done. The token test makes that grep permanent.

**Readings made here, stated so a reviewer can disagree.** (1) The Calibration Set's light and dark are the sections' — E6's. (2) `R Responsive System` gives the app its three widths and nothing else; the editor's collapse is D8 and Story 5.22 (`DESIGN.md` § Layout: "describes the sites, not this app"). (3) The `*-kit.js` files are section-category kits; what is reused is the pattern — render from a token object — not their code, and their pack accents disagree with the Calibration Set's, which is logged for E6 as DW-11. (4) The gallery sits under `(app)` with no auth today; Story 1.4's authenticated layout will put it behind sign-in, which suits an internal page.

## Verification

Run 2026-09-05 against the production build (`pnpm build`, then `next start`), with the export and
`DESIGN.md` read from disk. Every command below is reproducible; the browser checks use this machine's
playwright 1.61.1 and axe-core 4.12.1, which live outside the repo and were added to nothing.

**The gate**

| Command | Result |
|---|---|
| `pnpm check` (lint · typecheck · every test) | **PASS** — `apps/web` 16 tests, `tokens.test.ts` 9 of them, 0 fail |
| `pnpm build` | **PASS** — `/app/kit` in the route table as `○ (Static) prerendered as static content` |
| `python3 tools/doc-audit.py --check` | **PASS**, 0 warnings (after `tools/story-board.py`, as the hook does) |

**The token layer is the export's** — `tokens.test.ts`, run by `pnpm check`:

- every hex and `rgba()` in the `@theme` block occurs verbatim in some `.dc.html` under the export;
- every `--shadow-*` value occurs whole, geometry included, not merely its colour;
- every `colors.*`, `rounded.*` and `elevation.*` name in `DESIGN.md`'s front matter has its
  `--color-*` / `--radius-*` / `--shadow-*` twin (membership derived from the file, never listed);
- no `.tsx` under `apps/web` contains a hex colour literal;
- the three widths are 390 / 834 / 1440 and `app-floor` is `@media (pointer: coarse)`.

**Negative control (standing rule 2).** `--color-coral` set to `#AB12CD`, a value that greps nowhere in
the export: `pass 8 / fail 1`, `error: '--color-coral: #AB12CD occurs in no frame of the export'`.
Restored: `pass 9 / fail 0`. The test can fail, so its passing is a result.

**A control that did NOT pass, and what it cost.** The first axe run reported 0 violations against a
*stale* server — a second `next start` was still holding the port and serving HTML that pointed at a CSS
chunk the rebuild had replaced, which 500'd, so the page under test was unstyled (`--spacing` and
`--color-paper` both empty, every group 1424px wide). By standing rule 2 that reading was discarded, not
reported. Every figure below is from a single server whose served CSS chunk was confirmed `200` and whose
`section[aria-label="labels & text"]` measures 280px.

**Accessibility (NFR-5), on the built page**

- `axe.run({ runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] })` → **`violations: 0`**.
  The first run found **1 serious** (`color-contrast`, 6 nodes) — five of them danger-in-words, fixed by
  the `danger-text` correction above; the sixth the stepper's greyed label, fixed by giving its group the
  `aria-labelledby` every sibling control already had.
- **99 focusable elements** reachable by Tab; the ring is `0 0 0 2px rgb(194, 56, 31)` — coral-text, one
  ring, never the 40% wash.
- No page-level horizontal scroll at 1440, 834 or 390 (`scrollWidth === clientWidth` at each).

**Every row of the I/O & Edge-Case Matrix, executed in the browser**

| Row | What was asserted, and what came back |
|---|---|
| Greyed control | `aria-disabled="true"`, `aria-describedby="in-greyed-reason"`, value still `Soft dark`, `readOnly`, `tabIndex -1`; the reason is a `<p>` at `11.5px` in `rgb(110,106,100)` (ink-soft); fill `rgb(242,239,234)` (grey-field), track `rgb(234,229,221)` (grey-border), label `rgb(168,162,154)` (ink-faint), `cursor: not-allowed`; **`[title]` count on the page is 0** — never a tooltip |
| Greyed, value not its own (R-69) | `#seg-r69 [role=radio][aria-checked=true]` → **0 marked**; the reason reads "The list you picked is the order." |
| Pro badge clicked | the badge is a `SPAN`, clicking it leaves `dialog, [role=dialog]` at **0** — no upgrade sheet, ever |
| Persistence indicator | the five labels in the frame's order, each one dot + text; `.animate-spin, [class*=spinner]` → **0** |
| Feedback banner | sky-tint/sky-text, mint-tint/mint-text, marigold-tint/marigold-text, danger-tint/danger-text as computed rgb; the in-banner link computes `rgb(43,91,215)` — sky, never coral |
| Keyboard focus | one ring on focus; a selected layers row is `rgb(255,237,232)` (coral-tint) and focusing it keeps the tint **and** adds the ring — focused-and-selected reads as both (D8e) |
| Reduced motion | under `prefers-reduced-motion: reduce`, `transitionDuration` on a button is `1e-05s` — an instant state change |
| Gallery route | `GET /app/kit` → **200**, `robots` meta carries `noindex`, statically prerendered, token sheet first, then **24 sections** in the Kit's own order at **280px** |

The matrix's two type-error clauses were proved by compiling them, not by assertion:

```
__typecontrol.tsx(5,57): error TS2741: Property 'reason' is missing in type '{}' but required in type 'Greyed'.
__typecontrol.tsx(7,46): error TS2322: Type '"Saving…"' is not assignable to type 'PersistenceState'.
```

and the tree typechecks clean once that file is removed — so the errors are the controls', not the kit's.

**Real services this story hit (R-82).** None, and that is the story: the kit reads no service. It has no
database call, no session, no email, no payment and no Ghost request, so no key in `tools/probe/.env` was
opened or needed. The remote surface is the deployed page itself, which arrives when CI's `deploy` job
runs on this commit; `check` and `rls` gate it, and the deployed check is one command:

```
curl -s -o /dev/null -w '%{http_code}
' https://app.inflozo.com/kit     # expect 200
```

followed by the same axe run against that URL rather than localhost. Story 1.4 is the first story with a
key to name.

**Manual check (the frame, side by side).** The gallery was rendered at 1280px and read against
`Editor Sidebar Kit.dc.html`: same groups, same order, same states, group for group from labels & text
through shortcut rows, then the two surfaces the S/B frames add — the persistence indicator and, on the
only dark ground the app has, the canvas pill.


## Questions for the owner

**1. The plan says the parts page should show every part "in light and dark", but the design has no dark version of the app. Which do you want?**

Claude Design drew the whole app in one look: warm, light paper. The only dark things it drew are the sites your customers build — those do have a light and a dark mode — and two small spots inside the app: the little pills that float over the canvas, and the dark chrome around the paywall editor. There is no dark version of a button, an input or a badge anywhere in the design, and the rule you set on 2026-09-02 says the app is built from what was drawn, never from something made up beside it.

*Example:* a button on the parts page. Option 1 shows it once, on light paper, exactly as drawn. Option 2 first sends Claude Design a prompt to draw a dark app, then shows the button twice. Option 3 shows it once and corrects the plan's sentence.

1. **Show every part in the light look, and show the few parts that live on dark ground (the canvas pills, the paywall chrome) on that dark ground. Nothing invented. (RECOMMENDED)** — it is exactly what was drawn, it costs nothing, and if a dark app is ever wanted it is a design prompt later, not a rebuild.
2. Draw a dark version of the app in Claude Design first, then build both here — a new design prompt, a re-export and a re-check of every frame before this story can start, for a feature the product plan does not have.
3. Light only, and correct the plan's sentence to say so — option 1 minus the two dark spots.

**Ruled (owner, 2026-09-05): option 1 — every part in the light look, and the parts that live on dark ground (the canvas pills, the paywall chrome) shown on that ground. Nothing invented.** The gallery renders the three canvas pills and the paywall editor's surround on `ink` / `ink-deep`; no dark palette exists for anything else.
