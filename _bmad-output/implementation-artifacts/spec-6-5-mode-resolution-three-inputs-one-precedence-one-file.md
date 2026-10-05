---
title: 'Story 6.5 — Mode resolution: three inputs, one precedence, one file'
type: 'feature'
created: '2026-10-05'
status: 'in-review'
baseline_commit: '53e20026acd5e8e3ac171dbf446d0a5dc87be06c'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md']
---

## In plain English

After this story every theme Inflozo builds decides light or dark in one place and in one fixed order: your Light or
Dark setting in Ghost Admin, then — when you leave it on Auto — a visitor's own choice, then their device's setting
(as you ruled, R-239: a visitor's earlier choice waits while you pin, and returns if you go back to Auto). A section you gave a
different look for dark mode, such as Contrast in dark, keeps that look for dark-mode visitors on your real site, not
only in the editor, whichever of the three made the page dark and even with JavaScript switched off. Nothing in the
editor looks different (you will see this on your own site once publishing arrives in Epic 7), apart from one fix on
the Pilot sections page, where a dark-only background now shows in the Dark preview; the proof runs on your test site
ghost6.inflozo.com for about a minute.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The token block decides light or dark from two of FR-E4's three inputs — the device's setting and
`data-mode` — and never reads the owner's pin, the `scheme-light` / `scheme-dark` body class Epic 7's themes will carry
(AD-17). Nothing says what a visitor's choice saved under Auto does once the owner pins (DW-316), and AD-30's title says
one file selects on mode while its rule allows two. A section's own dark override reaches only the editor, which
re-stamps `data-bg`: a shipped theme has one markup for both modes, and the designs answer each ground with descendant
rules keyed on `data-bg`, so nothing can carry an override to a visitor (DW-195). And Story 6.1's T1/T3 recording
switched dark on two ways at once (DW-318).

**Approach:** One declared list of mode conditions, `MODE_SELECTORS` in `tokens.ts`, in the precedence the owner ruled
(R-239), from
which the token block writes its dark map twice — in the system preference's `@media` block and under one rule
carrying the two explicit markers — reading the body-class pin on `:root` through `:has(> body.scheme-…)`. A design
states each value of a mode-scoped control as custom properties on its root (a new validator rule; the pilots and
fixtures refactored with no pixel moved), so a section's dark override becomes those properties for that one section
(`data-instance`), emitted into the token block under the same conditions by `darkOverrideCss`. The keyboard gate proves
every combination of the three inputs and every override in Chromium, a probe theme on T1 reads each input alone, and
AD-30, FR-E4 and the authoring guide say so.

## Boundaries & Constraints

**Always:**
- Exactly one file in a generated theme names a mode: the token block. Every mode-naming selector in it is built from
  `MODE_SELECTORS` — the system-preference block and the explicit rule for the pack, and the same two for each
  per-instance rule. No other stylesheet in the theme, the library or the canvas chrome selects on a mode
  (`validate.ts`'s `untokened` keeps refusing designs).
- The dark values are one map (`modeTokens(pack, 'dark')`) written twice, each copy exactly the per-mode properties.
  `:root` keeps every property in light, the width bands are unchanged, and `packTokensCss` still ends with `LINK_RULES`,
  whose bytes do not change.
- The canvas keeps previewing dark as Story 5.6 built it (`data-mode` on its `<html>`, the dark slice re-stamped through
  `storedFor`), and every value it draws today is unchanged: the editor's canvas, the previews, the render matrix's
  photographs and the snapshots. `/pilots` changes only by its fix.
- The refactored stylesheets draw every element exactly as HEAD's do, on every ground a design offers, in both modes,
  under every reference pack.
- Every value that reaches CSS or a root attribute is validated where it does (AD-36). The hook is a hash, so its
  alphabet is fixed; a hook outside it, two placed sections with one hook, or a mode-scoped value with no root rule is
  refused by name, never escaped and never skipped.
- `packages/section-runtime` stays AD-1 pure, and `tokens.ts` still imports no library (DW-323).
- Counts are derived, never written down (standing rule 4) — in code, tests, docs and messages.
- The ruled precedence (R-239) lives in ONE place, `MODE_SELECTORS` (Design Notes' "Ruled values"); nothing else in
  the theme or the plan restates it.

**Ask First:**
- **The write to T1** (the recorder): ask the owner in the Dev session itself and run it in the main session, never
  through a subagent (`RESET-PROTOCOL.md` § Ghost). It uploads one probe theme, activates it for the reading, restores
  the previous theme and deletes the probe in a `finally`, reading both back. Only if Ghost's draft preview cannot be
  read, record-cards' own article is published for the run and returned to draft. T3 is retired (R-238): no Ghost 5 leg
  runs, and §69 says that half is DW-326's.
- A design whose look on some ground cannot be stated as root custom properties without moving a pixel: stop and ask
  before changing the look or the rule.
- A photograph the render matrix reports as moved: stop. This story is meant to move none, so a moved one is a defect
  to fix, not a rebaseline to ask for.

**Never:**
- No change to the editor's dark preview, its flip or its `.` key; no new mode signal — no `data-mode-dark`, no `-dark`
  twin and no second attribute for an override (AD-30).
- No `light-dark()` (Baseline Newly at FR-G8's pin, and colours only); no `color-scheme` declaration (it restyles native
  controls and scrollbars — a look nobody asked for); no inline `style` on a root (AD-3); no CSS nesting (§7.1).
- No `mode-toggle` module, visitor control or persistence code. Epic 9's A1 stories build the module (Story 9.1); this
  story states what it does under a pin and puts that sentence in 9.1's criteria.
- No compiler, no `default.hbs`, no `color_scheme` custom setting and no `{{#match @custom.color_scheme}}` chain —
  Epic 7's (Stories 7.4, 7.11). The on-Ghost confirmation of a compiled theme stays at Story 7.35.
- No Light-only variant of the block: Epic 7's compile decides what a `dark_enabled = false` project emits, and hands
  `darkOverrideCss` nothing.
- No edit to the design export (R-74); no new or moved baseline; no `image-swap` word (no design draws a per-mode
  image).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| System dark, nothing else | dark device, no `data-mode`, no scheme class | dark | — |
| System light, visitor dark | light device, `data-mode="dark"`, no class | dark | — |
| System dark, visitor light | dark device, `data-mode="light"`, no class | light | — |
| The owner pins Dark | `<body class="… scheme-dark">`, light device, no `data-mode` | dark | — |
| The owner pins Light | `scheme-light`, dark device, no `data-mode` | light | — |
| A choice saved under Auto, then a pin | `scheme-light` + `data-mode="dark"`; `scheme-dark` + `data-mode="light"` | the pin's mode (R-239) | — |
| JavaScript off | dark device, no `data-mode`, no class | dark — pure CSS | — |
| An unknown visitor value | `data-mode="auto"` | treated as no choice | — |
| The canvas | `data-mode` light or dark on its `<html>`, a bare `<body>`, any pack | exactly as today | — |
| Override, Base → Contrast | root `data-bg="base"` + `data-instance`, override `bg: contrast`; dark from each input alone | every element's computed style equals the canvas's Contrast in dark; in light, Base exactly | — |
| Override, Contrast → Base | root `data-bg="contrast"`, override `bg: base` | in dark, exactly the canvas's Base — a plain link takes the pack's link look again | — |
| A design's own mode-scoped control | `controls/1`'s `tint: none`, override `strong` | as above, for `tint` | — |
| An override nothing renders | a stored override this design does not offer, or one parked under another design | no `data-instance`, no rule (`darkOverridesInForce`) | — |
| No override at all | `darkOverrideCss([])`; `instance` absent | `''`; both emitters' output byte-identical to today | — |
| A hostile hook | `instance: 'x"]{}'` handed to an emitter | refused by name (AD-36) | throw |
| Two sections, one hook | `darkOverrideCss` handed two keys whose hashes collide, or one key twice | refused, naming both keys | throw |
| A value with no root rule | an override in force whose value the stylesheet never states | refused by `darkOverrideCss`, naming design and value | throw |
| A descendant rule on a mode-scoped attribute | `.x[data-bg="contrast"] .x__title { … }` in a design | `mode-scoped-rule`, naming the selector | validation failure |
| A root rule that paints | `.x[data-bg="contrast"] { color: … }`, or a property not named `--x-…` | `mode-scoped-rule`: the root's own custom properties only | validation failure |
| Uneven grounds | two or more values offered, one with no root rule, or rules declaring different properties | `mode-scoped-rule`, naming the value and what it lacks | validation failure |
| A design writes the hook | `data-instance` in its markup or stylesheet, or a control named `instance` | refused (`editor-attribute`'s neighbour; `bad-control-name`) | validation failure |
| `/pilots` in Dark | a pilot's Background set to Contrast while Dark is shown | drawn as Contrast in dark; Light shows the light value | — |

</frozen-after-approval>

## Code Map

**The token block (`packages/section-runtime`, AD-1 pure):**
- `src/tokens.ts` — `packTokensCss` (:381-394) emits `:root`, `@media (prefers-color-scheme: dark)` on
  `:root:not([data-mode="light"])` (:388), `:root[data-mode="dark"]` (:389), the two bands, then `LINK_RULES`
  (:365-369: the plain link, then two ground rules keyed on `[data-bg]` that keep a coloured ground's words with a
  forced underline). `modeTokens(pack, 'dark')` (:240-276) is the per-mode map; `block()` (:335), `indent()` (:339).
  The header comment (:376-380) names this story as the one to add the pin. `TOKEN_ROWS` is untouched: the hook and a
  design's own properties are not pack tokens.
- `src/reference.ts` — `referenceTokensCss()` (:35-41) is the header plus `packTokensCss(REFERENCE_PACK)`, and
  `reference-tokens.css` its committed output. **Regenerate with**
  `node -e "import('$PWD/packages/section-runtime/src/reference.ts').then(m=>process.stdout.write(m.referenceTokensCss()))" > packages/section-runtime/reference-tokens.css`
  (Node 24). Story 6.1's one-liner imports `tokens.ts` and fails since 6.3; this one was checked byte-identical at
  Create.
- `src/tokens.test.ts` — `blocks()` (:35-42) splits on blank lines and names a chunk by its text before `{`; :228-235
  hard-code the heads and the exact set per pack (Paper, Tangerine, Ink); :234 each dark head declares exactly
  `PER_MODE`; :242 reference = header + Paper; :245-251 every block ends with `LINK_RULES`; :253-301 the link rules.
- `src/controls.ts` — `storedFor` (:180-192, the canvas's dark slice), `scoped` (:167, mode-scoped by declaration,
  never by name), `darkOverridesInForce` (:283-285): the one rule for which overrides render. The hook and the emitter
  both read it.
- `src/core.ts` — `RenderInput` (:125-226; 5.19's optional `feed` is the precedent for a field whose absence keeps the
  output byte-identical); `stampControls` (:1317-1337) strips every root `data-*` but directives, `data-portal` and
  `data-i18n-*` (:1323-1327), then stamps the resolved controls, each re-checked (AD-36); both emitters stamp the root
  at :1721 (`renderTree` :1639-1646, `renderTheme` :1859, `renderCanvas` :1883).
- `src/agreement.test.ts` — compares element tree, classes and attribute NAMES node by node (:59-101); :882, :908 and
  :1045-1047 pin whole opening tags. So the hook is optional and stamped after the controls.
- `src/ad36.test.ts` (:637-647) — hostile pack values refused by `packTokens` / `packTokensCss`: the new refusals'
  precedent. `src/index.ts` — the exports.

**The library:**
- `packages/library/src/vocabulary.ts` — `FOREIGN_ATTR_RE` (:222, reserved control names: `portal`, `mode`, `kg-`,
  `i18n-`, `members-`), `BACKGROUND_ROLES` (:247), the `bg` universal with `darkOverride: true` (:269-279),
  `CUSTOM_PROPERTY_RE` (:594).
- `packages/library/src/validate.ts` — `validateMarkup`'s root attributes (:240-304; `editor-attribute` :249-255 refuses
  `data-inflozo-*`); `bad-control-name` (:636-638); `validateDesign` (:919); `attributeSelectors` (:968) and
  `validateStylesheet` (:1054) read attribute selectors but not selector structure or declarations, and the new pass
  goes beside them; `untokened` (:1092) and `darkCapabilityFailures` (:1113) stay. `tools/check-snapshots.mjs` times
  hostile inputs through every reader, so the new one reads its input once.
- `packages/library/src/validate.test.ts` — refusals fire through `only(over, code)` beside a clean control.
- The designs, `packages/library/designs/{a1/1,a4/13,a17/1,a22/1,a24/1}/style.css` — every root's unconditional rule
  paints `background: var(--bg-page); color: var(--text-body)` (e.g. `a4/13:6`), so Base is the default and no rule
  names `[data-bg="base"]`. Every design that offers Contrast answers it with descendant rules: words in
  `--text-on-contrast`; A17's muted `color-mix(in srgb, var(--text-on-contrast) 78%, var(--bg-contrast))` with 12 % fills
  and 20 % hairlines; `--accent-on-contrast` underlines, outlines and decoration colours, some on `:hover` /
  `:focus-visible` descendants (a17/1:98-100, a24/1:77-78); reversed buttons and avatars (a4/13:37, a22/1:45, a24/1:79).
  On Surface, a field or a secondary button sits on `--bg-page` (a22/1:43, a4/13:39). `a1/1:60-62`'s comment prescribes
  a descendant rule for a future Contrast offer.
- The fixtures, `packages/library/fixtures/{controls/1,controls/2,controls/3,paywall/1,paywall/2,reference-design}/style.css`
  — the same pattern. `controls/1` also declares `tint` (`darkOverride: true`, design.json:15), whose two rules (:31-32)
  paint `.cx__feature` at the same specificity as `data-card="raised"`'s and win by source order.
- `tools/stress/test-vocabulary.mjs` — :223-228 hold `reference-tokens.css` byte-equal to the engine; :232-251 accept a
  `var(--x)` with no fallback only for a declared token.
- `docs/section-authoring.md` — "A control is one attribute on the section root… the design's stylesheet selects on
  it" (:207-211); `darkCapabilities` (:188-205); a typed link and its ground (:587-603); reserved names (:1614).

**The canvas and the app:**
- `apps/web/lib/canvas.ts` — `renderSection` (:239-309) hands its options to `renderCanvas`; `wearPack` (:198-205)
  replaces the whole `1-tokens` style on a switch, which is one reason the canvas never carries per-instance rules.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — `queryKey` (:916, `${doc}:${instanceId}`);
  `slice` (:2354-2361) is the stamp input of `restampAll` (:2363-2382) and of a control change (:4858-4874); `partOf`
  renders through `renderSection(doc, entry, { ...i, controls: storedFor(entry, i, now.mode) }, …)` (:3128).
  `apps/web/dark-mode.test.ts` holds those lines by source (:47, :50; :52 forbids `scheme-dark` in the editor).
- `apps/web/app/(app)/app/(authed)/pilots/review.tsx` — **the defect found at Create:** `paint` renders `s` with its
  light `controls` (:138) and `onChange` stamps `next.controls` (:170), never `storedFor`, while the Sidebar, given
  `mode` (:281), writes a dark override in Dark. So on `/pilots` an override is saved and its moon shown, and the canvas
  never draws it.
- `apps/web/lib/pilots.ts` — `pilotsCanvasDocument` (:188-207): `<html lang="en" data-mode="light">`, `1-tokens` (Paper
  from disk, any other preset `packTokensCss`), a bare `<body>`. `apps/web/pilots.test.ts` (:184, :191, :206, :214) and
  `apps/web/pack-edit.test.ts` (:80-89) compare served blocks with the engine. `apps/web/lib/controls-review.ts`'s
  `samples()` / `paywallSamples()` are the fixture entries the harness canvas also carries.

**The gates:**
- `tools/keyboard/` — `run-keyboard-gate.sh` boots `next dev` with `INFLOZO_HARNESS=1`; `playwright.config.mjs`'s
  `testMatch` lists `journey.spec.mjs` and `floor.spec.mjs`, so a new spec is added there. CI's `check` job runs the gate
  before `pnpm check` (`ci.yml:58-59`), so it blocks deploy. A Chromium check never goes inside `pnpm check`: Vercel's
  build reruns that with no browser. The harness serves the real canvas document at `/app/harness/canvas?v=…&pack=…`
  (`apps/web/app/(app)/app/harness/canvas/route.ts:55-67`), with the pilots and the fixtures. Specs import TS directly
  under Node 24 (`journey.spec.mjs:525, :953, :3611`).
- `tools/matrix/cases.mjs` — `pilot`, `renderInput`, `renderCanvas` (:201-234) render a design in Node exactly as the
  editor does, and `matrix.spec.mjs` writes the JSDOM render into the canvas document (:20, :186). The matrix shows dark
  by `data-mode` alone (:190-196), so the precedence change moves no photograph. It photographs Base, and Contrast only
  for a design that draws a `--button-fill` button under an Outline pack (`cases.mjs:131`): Surface, A17 and A24 on
  Contrast, and the fixtures, are never photographed — which is why the refactor carries its own sweep.
- `tools/probe/record-token-links.py` — the probe-theme recorder to copy: upload, activate, nonce, Chromium, then a
  `finally` that restores and deletes (MEASUREMENTS §68). It set `colorScheme` and `data-mode` together (:148-155,
  DW-318). Helpers: `record-shim.py` (`load_env`, `start_guard`, `restore_and_delete`), `record-contexts.py` (`gate`,
  `zip_bytes`, `Void`), `run-verify-core.py` (Chromium, Node 24), `record-cards.py` (the draft article, `to_draft`).
  MEASUREMENTS' last section is §68, so this story's is §69. `tools/probe/run-verify-pilots.cjs` walks `/pilots` in
  Light and Dark (:129-149). `tools/doc-audit.py` needs a catalogue row for a new `tools/probe/*` file.

**Propagation targets:** `prd.md` FR-E4 (:257-263), FR-D7 (:225), FR-Q5 (:363); `ARCHITECTURE-SPINE.md` AD-30
(:352-360), AD-17 (:221-225), the FR-E row (:645); `epics.md` Story 6.5's card (:2826-2857), Story 7.4 (:3017, the token
block at :3040), Story 7.35 (:4017), Story 9.1 (:4231); `deferred-work.md` DW-195 (:5508), DW-316 (:8605), DW-318
(:8642), DW-326 (:8793); `docs/section-authoring.md`; `epic-6-context.md`; `tokens.ts`' header.

## Tasks & Acceptance

**Question 1 is ruled (R-239, option 1), so Dev may open.** The tasks build the ruled option; Design Notes' "Ruled
values" table keeps what the declined options would have changed.

**Execution:**
- [x] `packages/section-runtime/src/tokens.ts` -- `MODE_SELECTORS` (the media query, the system selector, the explicit
  list — Design Notes); `packTokensCss` writes the dark map under both from it and nothing else changes in the block;
  `GROUND_LINKS`, a plain link's declarations per Background value, built from the same strings `LINK_RULES` is built
  from, its bytes unchanged; the header comment says the pin landed and the token block is the one file naming a mode
  -- one declared list of mode conditions
- [x] `packages/section-runtime/src/dark-override.ts` (new) -- `darkHook(entry, state, key)`: an FNV-1a hash of `key` as
  eight hex digits when an override of this section is in force (`darkOverridesInForce`), else `undefined`;
  `darkOverrideCss(placed)`: for each `{ key, entry, state }` with an override in force, the dark value's root
  declarations read from `entry.css` through the library's one reader of those rules (the validator's, below), emitted
  under `MODE_SELECTORS`' two conditions scoped `[data-instance="<hook>"]`,
  and for `bg` the value's `GROUND_LINKS` under the same conditions at specificity (0,0,1); `''` for none; refuses a
  colliding hook and a value with no root rule, by name -- DW-195's expression, the token block's per-instance part
- [x] `packages/section-runtime/src/core.ts` -- `RenderInput.instance?: string`, stamped by `stampControls` after the
  controls as `data-instance`, re-checked against the hash's alphabet (AD-36) and removed by the strip like every root
  `data-*` it owns -- both emitters carry the hook from one input; absent, output byte-identical
- [x] `packages/section-runtime/src/index.ts` -- export `MODE_SELECTORS`, `GROUND_LINKS`, `darkHook`,
  `darkOverrideCss` -- Epic 7 and the gate read them
- [x] `packages/section-runtime/reference-tokens.css` -- regenerate (Code Map's one-liner) -- the canvas, the matrix and
  the style guide read these bytes
- [x] `packages/section-runtime/src/tokens.test.ts`, `dark-override.test.ts` (new), `controls.test.ts` (both emitters'
  roots, beside its dark-render case at :673-684) -- the block's heads are
  `:root`, the media block, the one explicit rule and the two bands; every mode-naming selector is one of
  `MODE_SELECTORS`'; both dark copies exactly `PER_MODE`; `LINK_RULES` unchanged and last; `darkOverrideCss` over the I/O
  matrix's rows (Base → Contrast, Contrast → Base, `tint`, none, a collision, a value with no root rule) with each rule's
  specificity asserted; the hook stamped only from `instance` and refused outside its alphabet -- the card's unit
  assertion over the emitted block
- [x] `packages/library/src/validate.ts`, `vocabulary.ts`, `validate.test.ts` -- `mode-scoped-rule` (Design Notes § The
  authoring rule), its reader of a stylesheet's mode-scoped root rules exported once, so `darkOverrideCss` parses
  nothing of its own; `data-instance` refused in a design's markup and stylesheet; `instance` joins `FOREIGN_ATTR_RE`;
  each refusal fired beside a clean control -- the rule Epic 9 authors against, enforced
- [x] `tools/stress/test-vocabulary.mjs` -- a `var(--x)` with no fallback is also accepted where `--x` is declared by that
  stylesheet's own mode-scoped root rules -- a design's own properties are declared by construction
- [x] every design and fixture `style.css` that selects on a mode-scoped attribute (Code Map's two lists) -- each
  ground's answers moved into root custom properties per the rule, every element reading them; `a1/1`'s comment
  rewritten to the rule -- the library meets its rule, every pixel unchanged (the sweep, below)
- [x] `apps/web/lib/canvas.ts`, `editor.tsx` -- `renderSection`'s options gain `instance`, passed to `renderCanvas`;
  `partOf` and `slice` hand `darkHook(entry, state, queryKey(i))` -- the canvas draws the markup the theme ships
- [x] `apps/web/app/(app)/app/(authed)/pilots/review.tsx`, `apps/web/dark-mode.test.ts` -- `paint` and `onChange` take
  `storedFor(entry, state, mode)`; the source guard holds both -- the defect found at Create: a dark override on
  `/pilots` is drawn
- [x] `tools/keyboard/mode.spec.mjs` (new), `playwright.config.mjs`, `run-keyboard-gate.sh`'s header -- the truth table
  and the agreement sweep (Design Notes § The proofs), each behind its controls -- the card's "on the canvas in all three
  states", in CI before deploy
- [x] `tools/probe/record-mode-resolution.py` (new) + its `tools/doc-audit.py` row -- the T1 recorder (Design Notes § The
  proofs), MEASUREMENTS §69, docstring on any flag, run on the owner's in-session go (Ask First) -- DW-318, and the pin
  composed with `{{body_class}}` on a real Ghost *(Dev, 2026-10-05: built, catalogued, smoke-run locally with no Ghost,
  then run on T1 in the main session on the owner's in-session go — §69 written, every row as ruled)*
- [x] `tools/probe/run-verify-pilots.cjs` -- a Dark stop: a pilot's Background set to Contrast while Dark is shown draws
  Contrast (the root's `data-bg` and its computed background), and Light draws the light value -- the `/pilots` fix on
  the deployed site, at Review
- [x] propagation -- `prd.md` FR-E4 (the ruled order; "one declared selector list" as built; the override's
  expression) and FR-D7 / FR-Q5 where they restate the order; `ARCHITECTURE-SPINE.md` AD-30 (title and rule: one file,
  the token block, with a per-mode image swap's one generic rule there; the expression named; R-239) and
  the FR-E row; `docs/section-authoring.md` (the rule with Design Notes' example, the link paragraph, `instance`
  reserved); `epics.md` (6.5's card with the ruling; 7.4: the token block is `packTokensCss` followed by
  `darkOverrideCss` over every placed section — none on a Light-only project; 7.35: the three inputs and one override
  confirmed on the compiled theme on T1; 9.1: the module under a pin, word for word); `deferred-work.md` (DW-195, DW-316
  and DW-318 closed with their proof; a new entry for the module's two open questions — the flash before a deferred
  script, and two states against three — owned by Story 9.1; DW-326's list gains §69's Ghost 5 half); `epic-6-context.md`
  (a dated Dev sub-bullet); then a grep for the old selectors (`:root:not([data-mode="light"])` alone, the bare
  `:root[data-mode="dark"]` head) and for every "two files" / "base stylesheet" mode sentence -- standing rules 3 and 7 *(Dev:
  done; DW-318 closed on §69)*

**Acceptance Criteria:**
- Given any pack, when its block is emitted, then `:root` carries every property in light, the dark map appears exactly
  twice — under the system-preference block and under the one rule whose selector list carries the pin and the
  visitor's choice — each copy exactly the per-mode set; the bands and `LINK_RULES` are unchanged; and every selector in
  the block that names a mode is one of `MODE_SELECTORS`'.
- Given R-239's precedence, when the keyboard gate's truth table runs, then every combination of device, pin and
  visitor resolves as Design Notes' table says for option 1, under every reference pack, behind its controls.
- Given a section carrying a dark override, when its theme markup and `darkOverrideCss` are drawn and dark comes from
  any one input alone, then every element looks exactly as the canvas draws the dark value; in light, exactly as it
  draws the light value.
- Given the refactored stylesheets, when the sweep compares them with HEAD's on every offered ground, both modes and
  every reference pack, then every element's computed style is unchanged, and the render matrix stays green with no
  baseline written.
- Given T1 and the owner's in-session go, when the recorder runs, then §69 records dark through each input alone and
  the pin composed with `{{body_class}}`, every row as `MODE_SELECTORS` predicts, behind controls, with the site
  restored and read back.
- Given the documents, when the story is done, then FR-E4, AD-30 and the authoring guide state the same precedence and
  the same expression, and Stories 7.4, 7.35 and 9.1 carry what they now owe.
- Given a story with no surface (the card's Owner test is none: a theme mechanism), when it deploys green, then it is
  Done on the Deploy commit, with no frame to name and no "matches the frame" criterion (R-74 binds surfaces; R-80).

### Review Findings

Review of 2026-10-05, the diff since `53e20026`: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor
and the Real-infra verifier. No finding needed the owner's decision.

- [x] [Review][Patch] A root value with an unclosed parenthesis passed the reader and, copied into the token block, would swallow every later section's rule; a value wrapped over two lines was refused for the wrong reason [packages/library/src/validate.ts — `parensBalance`, whitespace folded]
- [x] [Review][Patch] Another rule could declare a mode-scoped property (`.x:hover { --x-ink: … }`), or two mode-scoped controls share one — the canvas would settle it by the cascade, a visitor's per-section rule by specificity, so the two could draw different looks; now refused by `mode-scoped-rule` [packages/library/src/validate.ts — one owner per property]
- [x] [Review][Patch] A rule the stylesheet never closes was never read, so a descendant rule on the ground inside it was never refused [packages/library/src/validate.ts — the open rules are flushed]
- [x] [Review][Patch] `darkHook` stamped a hook for an override equal to its light value, which `darkOverrideCss` writes no rule for, and such a section could throw a collision; both now ask one rule [packages/section-runtime/src/dark-override.ts — `changing`]
- [x] [Review][Patch] The per-section plain-link rule (`GROUND_LINKS` at (0,0,1)) was matched by no element in any committed browser check — no design's default content draws a class-less link; the sweep now draws one in every section, with a control that withholds only the link rules [tools/keyboard/mode.spec.mjs]
- [x] [Review][Patch] The sweep drew an override only from each input alone, never R-239's own rows (the pin over a visitor's opposite choice); both added [tools/keyboard/mode.spec.mjs]
- [x] [Review][Patch] The forced `:hover` / `:focus-visible` half had no control: a selector the browser refused was dropped silently and nothing said a state was ever read; now named and counted. The properties read gain `background-image`, `fill`, `stroke`, `opacity` [tools/keyboard/mode.spec.mjs]
- [x] [Review][Patch] The JavaScript-off check had no pin row, though the pin is the one server-rendered input [tools/keyboard/mode.spec.mjs]
- [x] [Review][Patch] Three sentences still stated the old order or the old "two files": PRD §8's E6 paragraph, `epic-6-context.md`'s lead bullet, `epic-4-context.md`'s dark-override bullet (standing rule 7) [prd.md:815, epic-6-context.md:55, epic-4-context.md:237]
- [x] [Review][Patch] A17 #1's new comment said every accent mark is the contrast accent on Contrast; the pager's hover underline is not, and never was [packages/library/designs/a17/1/style.css:9]
- [x] [Review][Patch] The recorder's cleanup raised only its first failure, so a theme error could hide an article left published; every failure is now printed [tools/probe/record-mode-resolution.py]
- [x] [Review][Patch] The authoring guide did not say the value is double-quoted, that a one-value control needs no rule, that no other rule declares a mode-scoped property, or what happens at compile when a value has no rule [docs/section-authoring.md]
- [x] [Review][Patch] The pilots walk's Pack-menu check (Story 6.3, DW-325) read the old frame under the new address and failed twice on the deployed site; it now waits for the frame's own address [tools/probe/run-verify-pilots.cjs:171]
- [x] [Review][Defer] A17 #1's pager hover underline is the brand accent on a Contrast ground [packages/library/designs/a17/1/style.css:83] — deferred, pre-existing; DW-329, Story 10.54
- [x] [Review][Defer] No committed check holds a non-default ground to an expected token (the matrix draws defaults and two Contrast cases), and `disabledBy` may name a mode-scoped control [tools/matrix/cases.mjs:131] — deferred, needs new baselines (R-116) and a ruling only if a design wants it; DW-330, Story 9.1
- [x] [Review][Defer] The section key is built by each caller, a hook collision is a bare throw, and the editor's hook and `/pilots`' dark draw are held in CI by source-text tests only [packages/section-runtime/src/dark-override.ts] — deferred to the first story that compiles the hook; DW-331, Story 7.4
- [x] [Review][Defer] The recorder's upload sits outside its `try`, an interrupt during restore skips the draft return, and the publish fallback tests status, not the `scheme-dark` class [tools/probe/record-mode-resolution.py:332] — deferred: a live-server cleanup path is not rewritten untested; DW-332, Story 15.7

Dismissed, with the reason each was read against the source: a browser without `:has()` (below FR-G8's pin, and the
system selector needs it too); the hook not stamped when an entry has no control schema (neither emitter stamps any
control there, so the canvas draws no override either); A24 #1's two `initial` properties (they hold the look, proven
by the refactor's sweep); `check-snapshots`' class pick (it throws by name if a design ever has no class below its
root); a colour literal in a root value (`untokened` already refuses a hex or a colour function anywhere in a design's
stylesheet; a named colour is that check's own stated limit, older than this story); the tool
counts quoted in the Dev record (dated tool output, not a count the project restates).

## Spec Change Log

## Design Notes

**Ruled values** — R-239 (owner, 2026-10-05) chose option 1; the other rows stay as what was declined. In all three
options the system selector is the same: `:root:not([data-mode="light"]):not(:has(> body.scheme-light))` inside
`@media (prefers-color-scheme: dark)`.

| Question 1 | `MODE_SELECTORS.explicit` | Story 9.1's sentence (the module) |
|---|---|---|
| **1 — ruled (R-239), built** | `:root:has(> body.scheme-dark), :root[data-mode="dark"]:not(:has(> body.scheme-light))` | "The module offers no control on a page whose body carries `scheme-light` or `scheme-dark` (R-34) and keeps a choice saved under Auto; the token block, not the module, makes the pin win, so the choice applies again once the site is on Auto." |
| 2 — declined | the same | "…offers no control on a pinned page (R-34) and deletes a saved choice there." |
| 3 — declined | `:root[data-mode="dark"], :root:not([data-mode="light"]):has(> body.scheme-dark)` | "…offers no control on a pinned page (R-34); a choice saved under Auto still applies there." FR-E4's order stands as written. |

What each option resolves to — the two options differ in two rows only:

| The pin | The visitor's saved choice | Options 1 and 2 | Option 3 |
|---|---|---|---|
| Auto (no class) | none | the device | the device |
| Auto (no class) | Light / Dark | light / dark | light / dark |
| `scheme-light` | none or Light | light | light |
| `scheme-light` | Dark | **light** | **dark** |
| `scheme-dark` | none or Dark | dark | dark |
| `scheme-dark` | Light | **dark** | **light** |

**Why `:has()`, and why the dark map is written twice.** The pin is a body class (AD-17, FR-E4: the one mode signal in
Ghost's HTML, composing with `{{body_class}}`). Declaring the dark values on `body` would leave `<html>`'s background and
its own reads light; `:root:has(> body.scheme-dark)` keeps every declaration on `:root`. `:has` is Tier 1: executed at
Create, web-features gives `css.selectors.has` `baseline: high` since 2026-06-19, before FR-G8's 2026-08-18 pin
(`tools/check-baseline.mjs:367` lists it). A media query cannot sit in a selector list, so one map is written twice from
one declared list. That is FR-E4's "one declared selector list" as built, and FR-E4 is amended to say so. The canvas
(a bare body, `data-mode` always set) resolves exactly as today under every option.

**The authoring rule** (AD-30, amended; what Epic 9 writes against). A selector that names a mode-scoped control's
attribute — `bg`, or a design's own `darkOverride` control — is exactly `.<root>[data-<name>="<value>"]`: the root's
class (its markup's first element's first class) and that one attribute, with nothing before or after and one compound
per rule. It declares custom properties only, each named `--<root>-…` (so it can never re-point a pack token, which
would recolour the panels and fields that sit on their own fill). Where two or more values are offered, each has exactly
one such rule and all declare the same property names, so an override replaces the whole set. A value that paints
nothing declares its property `initial` and the reader falls back (`var(--cx-tint-bg, var(--bg-elevated))` keeps
`tint: none` under `data-card`'s look). Every other rule reads those properties and names no mode-scoped value. Example,
A22 #1 (Base, Surface, Contrast), abridged:

```css
.a22-1 { background: var(--a22-1-ground); color: var(--a22-1-ink); }
.a22-1[data-bg="base"] { --a22-1-ground: var(--bg-page); --a22-1-ink: var(--text-body); --a22-1-quiet: var(--text-muted); --a22-1-field: var(--bg-surface); --a22-1-cta: var(--button-fill); --a22-1-cta-text: var(--button-text); }
.a22-1[data-bg="surface"] { --a22-1-ground: var(--bg-surface); --a22-1-ink: var(--text-body); --a22-1-quiet: var(--text-muted); --a22-1-field: var(--bg-page); --a22-1-cta: var(--button-fill); --a22-1-cta-text: var(--button-text); }
.a22-1[data-bg="contrast"] { --a22-1-ground: var(--bg-contrast); --a22-1-ink: var(--text-on-contrast); --a22-1-quiet: var(--text-on-contrast); --a22-1-field: var(--bg-surface); --a22-1-cta: var(--text-on-contrast); --a22-1-cta-text: var(--bg-contrast); }
.a22-1__eyebrow, .a22-1__blurb, .a22-1__note, .a22-1__proof { color: var(--a22-1-quiet); }
.a22-1__field { background: var(--a22-1-field); }
.a22-1__button { background: var(--a22-1-cta); color: var(--a22-1-cta-text); }
```

**The per-instance rule.** For the section keyed `home:auto-home-4` (hook `h`), A22 #1 light Base, override Contrast,
option 1:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-mode="light"]):not(:has(> body.scheme-light)) [data-instance="h"] { --a22-1-ground: var(--bg-contrast); /* …the Contrast rule's declarations */ }
  :where(:root:not([data-mode="light"]):not(:has(> body.scheme-light)) [data-instance="h"]) a:where(:not([class]), [class=""]) { color: inherit; text-decoration-line: underline; text-decoration-color: var(--accent-on-contrast); }
}
:root:has(> body.scheme-dark) [data-instance="h"], :root[data-mode="dark"]:not(:has(> body.scheme-light)) [data-instance="h"] { /* the same */ }
:where(:root:has(> body.scheme-dark) [data-instance="h"], :root[data-mode="dark"]:not(:has(> body.scheme-light)) [data-instance="h"]) a:where(:not([class]), [class=""]) { /* the same */ }
```

**Executed at Create** (a scratch page in the repository's Chromium 1228, not committed). The planned selectors resolved
all eighteen combinations exactly as each table says, for option 1 and for option 3. The per-instance property and link
rules won from each input alone, in both directions (Base → Contrast, and Contrast → Base, where the plain link took the
pack's dark link colour and decoration again). A design's own link rule kept winning, and a Contrast section with no
override kept `LINK_RULES`' look. The control held too: with the override block disabled, the section stayed Base in dark.

The property rule beats the design's root rule, always (0,2,0), at (0,3,1) or above. The link rule sits at (0,0,1): it
beats `LINK_RULES`' zero-specificity ground rules, which still key on the light value's attribute, whatever their order,
and loses to any link rule a design writes for itself (R-173). `GROUND_LINKS` is what that rule declares per value:
Base and Surface the pack's link (`color: var(--link-color); text-decoration: var(--link-decoration)`); Contrast,
Accent and Image the ground's words with a forced underline, Contrast's in `--accent-on-contrast` — the declarations
`LINK_RULES` already writes, from one set of strings.

**The hook.** `data-instance`, its value an FNV-1a hash (eight hex digits) of the section's key: the editor's
`queryKey`, `${template_key}:${instanceId}`. Epic 7 hashes the same key for the file it compiles the section into. An id
is unique only within its doc (`doc-schema.ts:78-80`; Home's page-2 copy shares Home's), and a stored id is any string
(`:25`). A hash of the doc-qualified key is unique across the project, so Epic 7 can write one block for the whole theme.
It is also safe in an attribute and in a CSS string by construction, with nothing to escape. It is stamped only on a
root carrying an override in force. ponytail: 32 bits, and a collision is refused at emit; widen the hash if a project
ever meets one.

**The proofs.**
- *The truth table* (`mode.spec.mjs`, the harness canvas document, every reference pack). For every combination of
  device (`page.emulateMedia({ colorScheme })`), pin (`scheme-light` / `scheme-dark` / none on `<body>`) and visitor
  (`data-mode` light / dark / removed), read every per-mode property on `:root` and compare it with `packTokens`' light
  or dark map, as the ruled table says. Controls, each voiding the run: `matchMedia('(prefers-color-scheme: dark)')`
  reports the emulated scheme; the class and the attribute read back as set; with the `1-tokens` style disabled,
  `--bg-page` reads empty.
- *The agreement sweep* (the same spec). Take every design and fixture on the harness canvas, every mode-scoped control
  with two or more offered values, and every ordered pair of distinct values (light L, dark K). Render each twice through
  `tools/matrix/cases.mjs`' `renderInput` / `renderCanvas` with JSDOM, as `matrix.spec.mjs` does. The canvas way:
  controls `{C: K}`. The theme way: controls `{C: L}`, override `{C: K}`, `instance` set, and `darkOverrideCss` in its own
  `<style>` after `1-tokens`. Make dark from each input alone (the device with no attribute or class; `data-mode="dark"`
  on a light device; `scheme-dark` on a light device). Every element's computed `color`, `background-color`,
  `border-*-color`, `outline-color`, `text-decoration-line`, `text-decoration-color` and `box-shadow` must be equal — read
  at rest and, for every element the design styles under `:hover` or `:focus-visible`, with that state forced through
  CDP's `CSS.forcePseudoState` (no pointer, so the gate's keyboard-only rule holds). In light, from each light input
  alone, the theme way must equal the canvas way with `{C: L}`. Controls: the media control above; with the override
  `<style>` disabled, at least one pair differs, so the block is what makes them agree.
- *The refactor's sweep* (Dev, once, recorded in Verification). The same comparison, between HEAD's stylesheets
  (`git show <base>:…`) and the new ones: every design and fixture × every offered value of each mode-scoped control ×
  light and dark (`data-mode`) × every reference pack, the forced `:hover` / `:focus-visible` states included. Every
  element's computed style must be equal, behind a planted one-value change that must be detected. The render matrix, which runs every design on a push that touches the runtime
  (`matrix.yml:52`), is the second net.
- *The T1 recording* (`record-mode-resolution.py`, §69). The probe theme's `default.hbs` carries the regenerated
  `reference-tokens.css` verbatim, then `darkOverrideCss` for one placed section (A22 #1's canvas render at its
  defaults — static HTML, no `{{` — with its stylesheet, Base in light, override Contrast). Then come `{{ghost_head}}`,
  §68's contrast section and plain links, `{{{body}}}` and `{{ghost_foot}}`, inside
  `<body class="{{body_class}}{{#is "post"}} scheme-dark{{/is}}{{#is "author"}} scheme-light{{/is}}">`. So `/` is Auto,
  record-cards' draft article (`/p/{uuid}/`) is pinned Dark, and the site's author page is pinned Light: a server-rendered
  class composed with `{{body_class}}`, with no setting written (the `@custom.color_scheme` chain is Story 7.11's, proved
  at 7.35). Chromium reads every combination — device × the three pages × visitor `data-mode` (none, light, dark): every
  per-mode property on `:root`, §68's link rows (now one input at a time) and the overridden section's ground, against the
  ruled table. Controls, each voiding the run: the page is this run's (nonce); `document.body.classList` carries exactly
  the expected pin (whether the draft preview's context is "post" is a hypothesis, so a miss voids the run and is never
  guessed past); the media control; the token `<style>` disabled leaves `--bg-page` empty; the classed link keeps its
  own colour. §69 says what it does NOT say: nothing here was compiled by Inflozo's emitter, and Ghost 5's half is
  DW-326's.

**Routine calls, each stated rather than asked:**
- The pin is read on `:root` through `:has()`, above.
- The canvas keeps re-stamping for its dark preview (5.6, R-132). The theme's per-instance block is proven equal to it,
  rather than replacing it.
- `LINK_RULES` keeps its bytes, and a per-instance link rule wins by specificity, so R-173 and §68 stay as proven.
- The hook is a hash and appears only where an override is in force.
- A per-mode image swap's one generic rule lives in the token block — AD-30's text only, since no design draws one
  (DW-196's `image-swap` waits for one).
- `/pilots` draws a dark override: a defect found at Create, verified by the deployed walk, not an owner test, because
  the card says none.
- T3's half is postponed to DW-326 (R-238).

## Questions for the owner

The owner ruled Question 1 on 2026-10-05 (R-239). No question is open.

### Question 1 — When you pin your site to Light or Dark, what happens to a visitor who had already picked the other? (DW-316)

**In plain English.** In Ghost Admin your site's colour scheme is Auto, Light or Dark. On Auto, a header can show
visitors a small moon button, and their browser remembers what they pick. Your ruling R-34 says a pinned site shows no
moon button, because a visitor's switch would undo your choice. Nothing yet says what happens to a choice a visitor made
while the site was still on Auto. The plan's written order — the visitor's choice, then your setting, then the device —
would let that old choice keep winning.

**An example.** Your site is on Auto. A reader presses the moon and reads in Dark. A month later you set the site to
Light. The next time that reader comes back:

1. **Your setting wins; their old choice waits (RECOMMENDED).** They see Light, like everyone else, and no moon button.
   Their choice stays in their browser, so if you set the site back to Auto they see Dark again, as they had picked. The
   plan's order becomes "your setting, then the visitor's choice, then the device".
2. **Your setting wins; their old choice is forgotten.** They see Light. If you go back to Auto, they start again from
   their device's setting.
3. **Their old choice keeps winning.** They still see Dark, and the page has no moon button to change it, so they stay
   in Dark until they clear their browser's data. This is the plan's order as written, and R-34 says a pin must not
   allow it.

Options 1 and 2 build the same theme; they differ only in what Epic 9's moon button does with the saved choice.

**Ruled: option 1 (owner, 2026-10-05).** *"Your setting wins; their old choice waits"* — recorded as **R-239**. The
token block makes the pin win (`MODE_SELECTORS.explicit`, Design Notes' ruled row), so the visitor's choice applies only
on a site left on Auto, and the saved choice stays saved for a return to Auto. Dev writes FR-E4's order as "the owner's
pin; on Auto, the visitor's explicit choice; then the system preference", amends AD-30, and pastes the module's
sentence into Story 9.1's criteria word for word.

## Verification

**Commands:**
- Code Map's regeneration one-liner -- expected: `git diff packages/section-runtime/reference-tokens.css` shows the two
  dark heads' selectors changed, and no value and no link rule moved.
- `node --test packages/section-runtime/src/tokens.test.ts packages/section-runtime/src/dark-override.test.ts packages/library/src/validate.test.ts`
  -- expected: pass; the block-shape and `darkOverrideCss` cases red against HEAD; `mode-scoped-rule` red against HEAD's
  pilots, and green once refactored.
- `node tools/stress/test-vocabulary.mjs` -- expected: pass.
- `pnpm check` -- expected: green (lint, typecheck, every package test, the `pnpm test` tail, `check-snapshots` with no
  snapshot changed).
- `pnpm keyboard`, whole, never `--grep` before a Dev commit (6.2's lesson) -- expected: green with `mode.spec.mjs`'
  controls reported. Red when `MODE_SELECTORS.explicit` is swapped to option 3's (the truth table catches a wrong
  precedence), and red when the override `<style>` is withheld (the sweep catches a missing block); each reverted.
- The refactor's sweep -- expected: zero differences, every design and fixture × value × mode × reference pack, the
  planted change detected.
- `bash tools/matrix/run-matrix-gate.sh` -- expected: green, no baseline written.
- `python3 tools/doc-audit.py --check` (twice) and `bash supabase/tests/run-rls-gate.sh` -- expected: green. No
  migration, so no Schema phase.
- `python3 tools/probe/record-mode-resolution.py`, on the owner's in-session go -- expected: T1 (6.58.0), every
  combination as the ruled table predicts, every control held, §69 written, the site back on its previous theme with no
  probe theme left, read back. No Ghost 5 leg (R-238, DW-326).

**At Review, on the deployed site (R-82):**
- `run-verify-pilots.cjs` with its new Dark stop; `run-verify-editor.cjs`' flip (step 47) and dark-override steps
  (around 53) — the editor's preview unchanged, and `data-instance` present on an overridden root and gone once it is
  cleared.

**Executed — Dev phase (2026-10-05), Node 24.18.1; nothing deployed before the Dev push:**
- **The regeneration one-liner** -- `git diff packages/section-runtime/reference-tokens.css` shows the two dark heads'
  selectors changed (`:root:not([data-mode="light"]):not(:has(> body.scheme-light))` inside the media block, and
  `:root:has(> body.scheme-dark), :root[data-mode="dark"]:not(:has(> body.scheme-light))`), no value and no link rule
  moved.
- **The unit tests** -- `tokens.test.ts`, `dark-override.test.ts` (new), `controls.test.ts` and `validate.test.ts` pass;
  the block-shape and `darkOverrideCss` cases import what HEAD does not have, and `mode-scoped-rule` refused every one of
  HEAD's pilots and fixtures before the refactor (the validator run over all of them, by name) and none after.
- **`node tools/stress/test-vocabulary.mjs`** -- every check passed, its own-property control caught.
- **`pnpm check`** -- exit 0: lint, typecheck, every package test, the `pnpm test` tail, `check-snapshots` with no
  snapshot changed. One change outside the story's files: `check-snapshots`' "one class changed" control now changes a
  class BELOW the root — the root's class is what the mode-scoped rules are written on, so changing it was refused by the
  validator before any snapshot was compared (the control's intent kept: it is caught as a drifted template).
- **`pnpm keyboard`, whole** -- exit 0, every journey, floor and mode test passed, `mode.spec.mjs` reporting its controls
  (the media query, the inputs read back, the token block off leaving `--bg-page` empty, the withheld block making pairs
  differ). **Controls, each a scratch edit, restored:** `MODE_SELECTORS.explicit` swapped to option 3's turned the truth
  table red (a Light pin with a visitor's Dark read dark); the per-section `<style>` withheld turned the sweep red at the
  first pair. The first whole run also showed a race in 6.4's warning journey — Shift+Tab sent before the picker placed
  focus on its hex field, failing 1 run in 5 when repeated alone; it now waits for that focus (green 12 of 12), and the
  second whole run was clean.
- **The refactor's sweep** (a scratch script, not committed) -- HEAD's stylesheets (`git show 53e20026:…`) against the
  new ones, rendered as the editor renders: every design and fixture (the reference design included) × every offered
  value of each mode-scoped control × every other control one value at a time × light and dark × every reference pack,
  every element's FULL computed style compared, and every element a stylesheet styles under `:hover` / `:focus-visible`
  read with that state forced through CDP — **zero differences**. **Control:** one value planted in A22 #1's Contrast
  rule was detected on every row it reaches.
- **`bash tools/matrix/run-matrix-gate.sh`** -- exit 0, its own line "0 violations · 0 of 394 drawn cases scroll
  sideways … — passed"; no photograph moved and no baseline written.
- **`python3 tools/doc-audit.py --check`** twice -- the first regenerated the story board, the second passed.
  **`bash supabase/tests/run-rls-gate.sh`** -- exit 0. No migration, so no Schema phase.
- **`tools/stress`'s gscan harness** -- 0 errors / 0 warnings on both majors (its "Could not parse CSS stylesheet" line
  is jsdom reading `default.hbs`'s Handlebars-filled `<style>`, as before this story).
- **The T1 recorder** -- built, catalogued and smoke-run locally with no Ghost (its theme gscan 0/0 on both majors, its
  driver and judge over a hand render of each pin), then **run on T1 in the main session on the owner's in-session go**
  (asked in this Dev session, R-83: *"Yes, run it now"*): `python3 tools/probe/record-mode-resolution.py` -- exit 0,
  *"MEASUREMENTS.md §69 written — every row held on T1, behind its controls"*. Every combination of device × page (`/`
  Auto, the draft article through Ghost's draft preview `/p/{uuid}/` pinned Dark, `/author/priya-raman/` pinned Light) ×
  visitor `data-mode` (none, light, dark) PASS on every per-mode `:root` property, §68's plain links, A22 #1's ground
  (Contrast in dark from each input alone, Base in light) and the overrides-off control (Base in every mode). The draft
  preview's context WAS `post` (the hypothesis held — the article was never published). Read back afterwards in-process
  (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY` from `tools/probe/.env`, never printed): active
  theme `casper`, no probe theme left, `inflozo-style-guide-article` status `draft`. No Ghost 5 leg (R-238; DW-326).
- **Added at the orchestrator's matrix audit** -- the I/O matrix's "JavaScript off" row had no check that ran with
  scripts off (the truth table sets its inputs through `page.evaluate`). `mode.spec.mjs` gains *"JavaScript off: the
  device alone decides, pure CSS"*: every reference pack × both devices in a `javaScriptEnabled: false` context, the page
  carrying the pack's block and a script that would write the other mode — its `data-mode` reading back absent is the
  control that JavaScript was off.
- **Re-run by the orchestrator on the final tree** -- `pnpm keyboard`, whole: exit 0, *"192 passed (9.0m)"*, the truth
  table *"72 combinations across the reference packs, every one as ruled; controls held"*, the JavaScript-off test, and
  the agreement sweep *"186 ordered pairs … control — 180 of them differ with the block withheld"*. `pnpm check`: exit 0.
  `node tools/stress/test-vocabulary.mjs`: *"33 checks passed"*. `bash tools/matrix/run-matrix-gate.sh`: exit 0, *"0
  violations … — passed"*, no baseline written.
- **The deployed walks** -- `run-verify-pilots.cjs`' Dark stop and `run-verify-editor.cjs`' hook checks (steps 48 and 49:
  `data-instance` on the overridden root through the flip and the repaint, gone after Reset) are written and
  syntax-checked, not run: they run once the Dev push has deployed.

**Executed — Review phase (2026-10-05), Node 24.18.1:**
- **CI on the Dev head `b7943c9a`, read first** (GitHub's API, `GITHUB_TOKEN` read in-process) -- `check`, `rls` and
  `deploy` success, and the render matrix's own workflow success: the Dev build deployed.
- **The Real-infra verifier, read-only on T1** (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`, read
  in-process through `record-shim.py`'s `load_env`; GETs only) -- `GET /ghost/api/admin/themes/`: `casper` active, no
  `inflozo-probe-*` theme installed; `GET /ghost/api/admin/posts/slug/inflozo-style-guide-article/`: `status: draft`,
  its `updated_at` older than the recorder's run, so it was never published; `GET /ghost/api/admin/config/`: 6.58.0;
  `GET /`: 200 with no probe marker. **Negative controls:** the same calls with a zeroed secret answered 401 and with no
  Authorization header 403; the Content API answered 404 for the draft's slug while `posts/?limit=1` answered 200, so
  the key works and the draft is not public. §69's rows, pins, `<body class=…>` line and colours agree with the
  recorder's source and with `reference-tokens.css` at HEAD. §69's rows were NOT re-recorded: that is a theme upload on
  T1, which needs the owner's go, and nothing in Review changed what the recorder uploads' selectors say.
- **No migration** (`git diff --stat 53e20026 HEAD -- supabase/` is empty), so R-99 owes no schema check.
- **After the patches** -- `node --test` over `validate.test.ts`, `dark-override.test.ts`, `controls.test.ts` and
  `tokens.test.ts`: all pass, the new refusals each beside a clean control; `node tools/stress/test-vocabulary.mjs`:
  pass; `pnpm check`: exit 0 (every real design and fixture passes the tightened `mode-scoped-rule`, no snapshot
  changed); `pnpm keyboard`, whole: exit 0, the truth table as ruled, the JavaScript-off check now with each pin, and
  the agreement sweep with a plain link drawn in every section, R-239's two pin-over-visitor rows, and its three
  controls reported (the block withheld, the link rules withheld on every Background pair whose link look changes,
  forced-state readings taken).

- **CI on the Review head `c0c86314`** -- `check`, `rls`, `deploy` and the render matrix success; Vercel serves
  `dpl_HRRPLJcPDdrhJpxhPFkoDZUaqSoY`, READY, built from `c0c86314` (each walk asks Vercel and refuses any other commit).
- **The deployed walks, run in the main session on `app.inflozo.com` and the live Supabase** (`SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, read in-process and handed through the environment, never on
  a command line; each walk's throwaway accounts deleted, the user count read before and after):
  - `run-verify-pilots.cjs` -- **0 FAIL**, every check PASS on its third run. This story's Dark stop: Inline Row's
    Background set to Contrast while Dark is shown is DRAWN as Contrast (`data-bg="contrast"`, its computed ground the
    pack's dark contrast), Light draws Base, and Dark again draws Contrast. **Its first two runs each had one FAIL, the
    same line** — Story 6.3's Pack-menu check (DW-325) read Paper's `--bg-page` under Mono's address. Read as a signal,
    not re-run past: the check waited a fixed time after the frame's `src` attribute changed and then read the OLD
    document, still readable until the new one commits. It now waits for the frame's own address; with that the same
    deployment reads Mono's token under Mono and Paper's under Paper. A defect of the walk, not of the page.
  - `run-verify-editor.cjs` -- **0 FAIL**, every check PASS. Step 47's flip unchanged (nothing repainted, selection,
    scroll and caret kept); step 48: the overridden root carries `data-instance` (eight hex digits), through the flip's
    re-stamp and through a repaint; step 49: Reset removes the override and the hook with it (`null`).
- **Real services this phase hit (R-82):** T1 `ghost6.inflozo.com` (read-only), Vercel (the deployment asked for by
  commit), Supabase (the walks' accounts and projects, on production), GitHub Actions (the runs read). Resend and Dodo:
  nothing here sends mail or touches billing. T3: retired (R-238).

**The I/O matrix, row by row → the check that ran and passed** (step-03's Matrix Test Audit):
- System dark · system light + visitor dark · system dark + visitor light · the owner pins Dark · pins Light · a choice
  saved under Auto, then a pin · an unknown visitor value (`auto`) -- `mode.spec.mjs`' truth table (device × pin × visitor
  none/light/dark/`auto`, every reference pack, the ruled oracle), and on a real Ghost §69 (T1).
- JavaScript off -- `mode.spec.mjs`' JavaScript-off test (above).
- The canvas, exactly as today -- the truth table's no-class rows; `controls.test.ts`' byte-identical render without
  `instance`; `check-snapshots` with no snapshot changed; the render matrix with no photograph moved.
- Override Base → Contrast · Contrast → Base · a design's own `tint` -- `dark-override.test.ts` (each rule and its
  specificity) and the agreement sweep (every ordered pair of every mode-scoped control on the harness canvas, dark from
  each input alone and light from each light input, at rest and under forced `:hover` / `:focus-visible`); Base →
  Contrast also on T1 (§69).
- An override nothing renders · no override at all -- `dark-override.test.ts` (*"nothing in force writes nothing"*) and
  `controls.test.ts` (*"absent, the render is byte-identical"*).
- A hostile hook -- `controls.test.ts` (*"outside its alphabet, refused by name"*), on both emitters.
- Two sections, one hook · a value with no root rule -- `dark-override.test.ts` (*"refused by name, never skipped"*).
- A descendant rule · a root rule that paints · uneven grounds -- `validate.test.ts`' `mode-scoped-rule` test, each
  refusal beside its clean control.
- A design writes the hook -- `validate.test.ts`: `instance-attribute` in markup and in a stylesheet, and `instance` in
  `bad-control-name`'s list.
- `/pilots` in Dark -- `apps/web/dark-mode.test.ts`' source guard on `paint` and `onChange` (in `pnpm check`); the
  deployed proof is `run-verify-pilots.cjs`' new Dark stop, at Review.

**Real services this phase hit (R-82):** the Ghost test server **T1** `ghost6.inflozo.com` (6.58.0) alone — one probe
theme uploaded, activated and deleted, the previous theme restored, all read back (above). **Not touched in Dev, and
why:** Supabase (no migration and no data path changed — the RLS gate ran on its local PostgreSQL 17 container); Vercel
(nothing deploys until the Dev push; the deployed walks are Review's); Resend and Dodo (nothing here sends mail or
touches billing); T3 (retired, R-238).
