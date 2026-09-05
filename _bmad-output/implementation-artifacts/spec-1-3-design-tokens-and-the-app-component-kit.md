---
title: 'Story 1.3 — Design tokens and the app component kit, taken from the export'
type: 'feature'
created: '2026-09-05'
status: 'ready-for-dev'
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
- [ ] `apps/web/app/globals.css` -- the `@theme` block: every `colors.*` → `--color-*` (plus `--color-grey-field` / `--color-grey-border` from P0-0), `rounded.*` → `--radius-*`, `elevation.*` → `--shadow-*`, `--breakpoint-mobile/tablet/desktop` 390 / 834 / 1440, `--text-body/ui/ui-dense/panel-label/control-label/helper-caption`, `--ease-out`, `--duration-fast: 160ms`, `--duration-overlay: 200ms`; `@theme inline` for the three font variables; `@custom-variant coarse (@media (pointer: coarse))` as `app-floor`'s condition; base: body on paper in ink, `::placeholder` in ink-soft-aa, `prefers-reduced-motion: reduce` zeroing transitions. The 4px grid is Tailwind's default `--spacing` and is not redeclared -- one token layer, `DESIGN.md`'s names, native Tailwind 4
- [ ] `apps/web/app/layout.tsx` -- the three `next/font/google` faces with the frames' axes, their variables on `<html>`, `font-ui` on `<body>` -- self-hosted at build, no runtime request to Google, nothing for 1.4's CSP to allow
- [ ] `apps/web/components/kit/icons.tsx` -- the Tabler icons the Kit draws, inline `<svg>` in `currentColor`, stroke 1.5, `aria-hidden` unless labelled; MIT notice at the top; membership derived from the Kit, never fixed here
- [ ] `apps/web/components/kit/greyed.ts` -- `type Greyed = { reason: string; value?: null }` and `greyedProps(id, greyed)` (`aria-disabled`, `aria-describedby`, `data-greyed`) -- UX-DR3 by construction, in one place
- [ ] `apps/web/components/kit/*.tsx` -- one file per Kit group, named after it (`labels`, `accordion`, `input`, `segmented`, `design-picker`, `swatch-row`, `stepper`, `toggle`, `visibility`, `grip`, `select`, `radio-card`, `button`, `badge`, `tooltip`, `quick-controls-card`, `pack-cell`, `layers-row`, `condition-row`, `banner`, `toast`, `loading`, `image-control`, `empty-panel`, `shortcut-row`, and from the S/B frames `canvas-pill`, `persistence-indicator`, `moon-badge`); Tailwind utilities on the tokens only; `'use client'` only where a control holds state; every control accepts `greyed?: Greyed` and renders the reason under itself -- the vocabulary, once
- [ ] `apps/web/app/(app)/app/kit/page.tsx` -- the gallery: the token sheet first (each colour as a swatch with name and value, the radii, the shadows, the type roles in their faces, the breakpoints), then every group in the Kit's order inside a 280px column on paper, each state the frame draws as its own instance (rest · greyed with reason · selected · icon button disabled at 35%), the components that float over the canvas on an `ink` ground; `metadata.robots = { index: false }`; statically prerendered -- the review surface
- [ ] `apps/web/tokens.test.ts` -- reads the `@theme` block: (a) every hex / rgba value occurs in some `.dc.html` under the export; (b) every `colors.*`, `rounded.*` and `elevation.*` key in `DESIGN.md`'s front matter has its `--color-*` / `--radius-*` / `--shadow-*` twin; (c) no `.tsx` under `apps/web` contains a hex colour literal -- "matches the frame" and "no second vocabulary" as a gate, run by `pnpm check`

**Acceptance Criteria:**
- Given `Calibration Set.dc.html`, `Editor Sidebar Kit.dc.html` and `R Responsive System.dc.html`, when the token layer is built, then its values are theirs (every colour and shadow value greps in the export) and its names are `DESIGN.md`'s recorded names — the test asserts both.
- Given the Editor Sidebar Kit, when the gallery renders, then every control, panel, badge and state the Kit draws has a component (one per section, `:31`–`:274`) including the greyed-with-reason pattern, and the gallery at 280px **matches the frame** section for section, in the Kit's order (R-74).
- Given any control with `greyed`, when it renders, then the reason is one sentence in the helper-caption slot under the control and is announced with it, never a tooltip; and `greyed` without a `reason` does not compile (UX-DR3).
- Given the token layer, when the breakpoints are read, then they are 390 / 834 / 1440 under `DESIGN.md`'s names and `app-floor` is a coarse-pointer condition, never a bare width (UX-DR16, R-87).
- Given `apps/web`, when its `.tsx` files are scanned, then no hex colour literal exists outside `globals.css` — no second interface vocabulary beside the export's.
- Given the deployed `https://app.inflozo.com/kit`, when axe-core runs on it, then zero violations at WCAG 2.1 AA, and Tab reaches every interactive component with the one ring.
- Given a push to `main`, when CI runs, then `check` (lint, typecheck, the token test, `next build`) is green and `deploy` publishes the gallery.

## Spec Change Log

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

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every test green, `apps/web/tokens.test.ts` included
- `pnpm build` -- expected: `/app/kit` in Next's route table as a static page
- `python3 tools/doc-audit.py --check` -- expected: exit 0
- After the `deploy` job (R-82, the real domain, never a preview URL): `curl -s -o /dev/null -w '%{http_code}\n' https://app.inflozo.com/kit` -- expected: `200`
- axe-core over the deployed page with the machine's playwright 1.61.1 + axe-core 4.12.1: `page.goto('https://app.inflozo.com/kit')`, `page.addScriptTag({ path: axe })`, `axe.run()` -- expected: `violations.length === 0`
- Negative control (standing rule 2): change one token value to a hex that occurs nowhere in the export and run `pnpm test` -- expected: the token test fails

**Manual checks (if no CLI):**
- Open the gallery beside `Editor Sidebar Kit.dc.html`, both at 280px: same groups, same order, same states. Tab through it and see one ring, everywhere.

## Questions for the owner

**1. The plan says the parts page should show every part "in light and dark", but the design has no dark version of the app. Which do you want?**

Claude Design drew the whole app in one look: warm, light paper. The only dark things it drew are the sites your customers build — those do have a light and a dark mode — and two small spots inside the app: the little pills that float over the canvas, and the dark chrome around the paywall editor. There is no dark version of a button, an input or a badge anywhere in the design, and the rule you set on 2026-09-02 says the app is built from what was drawn, never from something made up beside it.

*Example:* a button on the parts page. Option 1 shows it once, on light paper, exactly as drawn. Option 2 first sends Claude Design a prompt to draw a dark app, then shows the button twice. Option 3 shows it once and corrects the plan's sentence.

1. **Show every part in the light look, and show the few parts that live on dark ground (the canvas pills, the paywall chrome) on that dark ground. Nothing invented. (RECOMMENDED)** — it is exactly what was drawn, it costs nothing, and if a dark app is ever wanted it is a design prompt later, not a rebuild.
2. Draw a dark version of the app in Claude Design first, then build both here — a new design prompt, a re-export and a re-check of every frame before this story can start, for a feature the product plan does not have.
3. Light only, and correct the plan's sentence to say so — option 1 minus the two dark spots.

**Ruled (owner, 2026-09-05): option 1 — every part in the light look, and the parts that live on dark ground (the canvas pills, the paywall chrome) shown on that ground. Nothing invented.** The gallery renders the three canvas pills and the paywall editor's surround on `ink` / `ink-deep`; no dark palette exists for anything else.
