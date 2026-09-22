---
title: 'Story 5.15 — Behaviours off while designing, and the Preview toggle'
type: 'feature'
created: '2026-09-22'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: 'a16f5a5cdca2950da2661b71909a25116aa4ff09'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A new **Preview** button at the right end of the top bar, or the **P** key, hides every editing tool and shows your
page the way a visitor gets it, with its moving parts running, and **Back to editing** (or **Esc**) brings everything
back exactly as you left it. While you design, a moving part that would get in your way holds still, and a small grey
**PAUSED** tag marks it when you point at its section. On your pages today the only such parts are the header's phone
menu and the newsletter's sign-up form, so at phone size your header lists its links while you design and shows its
menu button in Preview; the menu that opens from that button, and every other moving part, arrive with their own
designs in Epics 9 and 10.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D20 is unbuilt, and the runtime it needs is built but never called.

- **The canvas runs no behaviour at all.** Story 4.7 wrote `core`, whose `{ editing: true }` already holds still every
  module that is not edit-safe (`core.js:43`). Nothing calls it. The canvas document carries no script
  (`pilots.test.ts:62`), and the editor paints with `mountSections`, which puts **every** mount into its JavaScript
  branch with nothing running (`canvas.ts:108-111`).
- **So nothing is ever paused and nothing can be previewed.** There is no PAUSED mark, no Preview, and `P` is still an
  owed row of the key map (`keymap.ts:103`, R-145).
- **DW-136 is this story's.** The canvas has no road to `core`: no `{ editing: true }` call, no `stop()`, and no error
  hook.

**Approach:**

- **The editor runs `core` itself, against the canvas window, on every paint.** While designing it passes
  `{ editing: true }`; in Preview it passes `{ editing: false }`.
- **`core` never enters the canvas as a script.** The canvas carries no script and no nonce, and the policy refuses
  `eval`. So `core.js` becomes importable: one exported declaration, which `bundle()` pastes into `main.js` without the
  keyword, so no theme's `main.js` ever carries an `export`.
- **A mount the editing rule holds still stays at rest.** At rest means its no-JavaScript state (FR-G7(4)). It carries
  B3a's PAUSED chip whenever its section is pointed at or selected (Question 2).
- **B3a's Preview pill and `P`** hide every piece of editing chrome, repaint, and run every module. **B3b's floating
  bar, `Esc` or `P`** come back.
- No migration, so there is **no Schema phase**.

## Boundaries & Constraints

**Always:**

- **One decision, and it is `core`'s.** Whether a mount runs is `core`'s editing rule over the registry's `editSafe`
  (R-21, research §7); the editor keeps no second list. `core` hands back the mounts it held still, and the chips read
  exactly that list.
- **At rest means the no-JavaScript branch** (`prd.md` FR-G7(4), `core.js:14-16`, `section-authoring.md:765-768`).
  - A paused mount carries no `js-enabled`.
  - The editor's canvas stops using `mountSections`' blanket class. `/pilots` and the Section Picker's cards keep it.
- **Preview runs everything the build carries.** A registry module that no file implements yet mounts as a **no-op**,
  so Preview draws its JavaScript branch the way `/pilots`, the picker and the render matrix already do. Today that is
  every module (FR-G7(2)).
- **The canvas stays contained in both modes.** A link never navigates it, and a form never submits (AD-21's traps,
  `editor.tsx:1198`). In Preview, every other press reaches the page.
- **Preview is a mode, like the device** (`EXPERIENCE.md:230`).
  - It is session state: never in the URL, never stored, back to editing on reload.
  - It is never an edit: nothing reaches `commit()`, the journal or `⌘Z`.
  - View as, the mode, the device and the preview subject all carry into it.
- **In Preview, everything the editor draws is gone except B3b's floating bar.**
  - Gone: the top bar, Layers, Controls, the skip link, both outlines, the name tag, the Pro badge, the section pill,
    the insertion hairline, the mark toolbar, the lock pill, every PAUSED chip, the viewport chip and the content-source
    pill.
  - They are hidden, never unmounted, so every panel comes back exactly as it was. A selection survives Preview and
    shows again on return.
- **Keys** (R-145, UX-DR11).
  - `P` is a single key bound in `KEYMAP` and listed on the `?` card, and it carries the focus condition.
  - In Preview only `P`, `Esc`, `1` `2` `3` and `⌘S` act. Every other binding does nothing.
- **One name** (R-170): **Preview** on the pill, the card's row, the bar's name and the announcement. The way back is
  **Back to editing**.
- **The chip never exists at rest** (FR-D1, AD-21, walk step 3). This is Question 2's recommended answer, and it is
  re-cut if the owner rules otherwise. The chip is chrome in the canvas layer, which exists only while a section is
  hovered or selected, and no `data-inflozo-*` attribute marks the mount.
- **Tokens only** in `.tsx` (`tokens.test.ts:125`). Every glyph the frames draw is read from the frames (R-92).

**Ask First:**

- **Any change under `packages/` beyond what this story names:** `core.js`'s `export`, `report` and `paused`;
  `core.d.ts`; `bundle()` stripping its one keyword; and the package's `./core` export. None of those moves a render,
  and `check-snapshots` and the render matrix unchanged are the control.
- **Any change to a registry `editSafe` value.** That is Question 1's.
- **Any migration.**

**Never:**

- **Never a script in the canvas document.** `pilots.test.ts:29, :62, :103` assert there is none.
- **Never `eval` or `new Function`.** Production refuses them, but `next dev` allows `'unsafe-eval'` (`csp.ts:73`), so a
  harness would pass and production would fail.
- **Never write a behaviour module here, and never edit a pilot.** Each module is written by its first category story
  (FR-G7(2), AD-35).
- **Never "preview in a new tab"** (B3's notes, `:717`): that is the deploy preview URL's job.
- **Not built here, each left to the story that owns it:**
  - a chip that knows a module's declared width (the new DW below)
  - Preview on `/controls`
  - the narrow top bar's overflow (Story 5.22)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Opening | Any canvas | Every section is at rest: Rail's `.a1-1__bar` and the Inline Row's form carry no `js-enabled`. No chip and no `data-inflozo-*` attribute: the page at rest is the site. At Desktop the page looks as it does today. | N/A |
| Pointing | Hover Rail, or select it | Its outline and name tag, plus one PAUSED chip 8px inside the bottom-left corner of `.a1-1__bar`. On the Inline Row the chip sits on its form. Three Up and Latest Post get none. Moving away takes the chip with the outline. | N/A |
| Mobile, editing | `3` | Rail's links are listed under its logo and there is no menu button: the no-JavaScript branch (`a1/1/style.css:94`). | N/A |
| Enter Preview | The pill, or `P` with the shell focused | One repaint, and every declared mount gets `js-enabled` (no-op stand-ins). The chrome is hidden. The stage is the whole window, with R-137's fit (1:1 in a 1440 × 900 window). B3b's bar sits at the bottom-left, focus lands on Back to editing, and `#editor-said` says "Preview. Press Escape or P to come back." | N/A |
| Mobile, Preview | The bar's phone button, or `3` | Rail shows its menu button and hides its links (`style.css:96-97`). Pressing the button does nothing, because no `nav-drawer` file exists yet. | N/A |
| A press in Preview | Hover, click a section, click a link, submit the form, type in the email box | Nothing hovers or selects. The link and the submit go nowhere. The box takes typing, `p` included. | N/A |
| Keys in Preview | `L` `.` `[` `]` `⌘K` `⇧R` `Del` `⌘D` `⌘Z` `?` | Each does nothing. `1` `2` `3` change the device, `⌘S` saves, and `P` or `Esc` come back. | N/A |
| Leave Preview | Back to editing, `Esc` or `P` | One repaint, and every mount that is not edit-safe is at rest again. The chrome is back, and a selection made before Preview is still selected with its panel. Focus returns to where it was (the pill if that element is gone). The editor announces "Back to editing." | N/A |
| A dialog in the page | A module's own `<dialog>` is open in Preview | `Esc` closes that dialog first, because `onEscape`'s guard gives the key to an open dialog. The next `Esc` comes back. | N/A |
| Typing | The caret in a canvas field or a panel field | `p` types a p and nothing previews (WCAG 2.1.4). | N/A |
| Repaint and restamp | A visitor change, a canvas switch, an undo, a mode flip, a control change | A repaint stops `core` and starts it again over the new nodes. A restamp keeps the nodes, so running mounts survive it. | N/A |
| A module throws | A future module throws as it mounts | `core` hands the error to the editor's `report`, which logs it with the module's name. The mount stays at rest, and nothing is thrown from a timer. | Logged, never said |
| Pilots, snapshots, matrix | `/pilots`, `check-snapshots`, the render matrix | Unchanged: no render changes. This is the control. `main.js` differs from the baseline's only by `core.js`'s own edits (`report`, `paused`), carries no `export`, and still runs with JavaScript on and off. | N/A |

</frozen-after-approval>

## Code Map

**The runtime** (Story 4.7, `packages/library/`):

- `modules/core.js` — `function core(win, modules, options)` (`:17`).
  - `:14-16` is the no-JavaScript rule.
  - `:23` is `report`, which throws from `win.setTimeout` (DW-136(b)).
  - `:29-31` is the one scan. `:34-41` reports a malformed declaration and an unknown name **before** the editing skip
    at `:43`, so the canvas must hand `core` **every** registry row.
  - `start` is `:103-120` and `halt` is `:122`. The handle, with `stop()`, is returned at `:143`.
  - Every platform object is reached through `win` (`:3-4`), which is what lets the editor call it with the canvas
    window.
- `modules/registry.json` — each module's `editSafe` and `animates`, in research §7's order.
  - `nav-drawer` (`:4`) and `member-form` (`:17`) are the only rows any design declares (`designs/a1/1/index.html:4`,
    `designs/a22/1/index.html:11`), and both are `false`.
  - No feature module has a file, so `modules/` holds only `core.js`, `core.test.mjs` and the registry.
- `src/modules.ts`:
  - `bundle()` (`:95-123`) pastes each source verbatim inside one wrapping function, `core` first, then
    `core(window, rows)` with no options.
  - `topLevelShape` (`:170-190`) refuses any top level but one `function <fn>(…) { … }`, and it refuses `export`.
  - `checkThemeJs` (`:129-167`) byte-compares `main.js` with `bundle()`.
- `package.json` — `exports` is `.` and `./icons` only. `src/index.ts` is "the rulebook" (AD-2), so `core` gets a
  subpath of its own.
- `eslint.config.js:181-182` lints `packages/library/modules/*.js` as `sourceType: 'script'`. Its comment at `:41-43`
  says these files are "never run by the product".
- The tests:
  - `modules/core.test.mjs:68` loads `core` by `win.eval`. `:124` is the editing test, `:176` is `stop()` and `:245`
    runs a bundle with JavaScript on and off.
  - `src/modules.test.ts:51` and `:59-70` hold `bundle`'s shape refusals.
- `tools/stress/build.js:209-218` globs `modules/*.js` (which `core.d.ts` does not match) and bundles `[]`. Its theme
  must still pass the gate on both majors.

**The canvas:**

- `apps/web/lib/canvas.ts:106-111` — `mountSections` sets the blanket `js-enabled`. `/pilots`
  (`pilots/review.tsx:124`) and `section-preview.tsx:133` keep it, and the editor stops calling it (`editor.tsx:905`).
- `apps/web/lib/pilots.ts:123-136` — the canvas document: four style blocks and `#canvas`, and no script.
  `pilots.test.ts:42-63` holds every `canvas-chrome.css` selector to `[data-inflozo-`. This story adds no rule there.
- `apps/web/lib/canvas-layer.ts`:
  - `chromeLayers` (`:105-123`) makes the `page` and `view` shadow hosts.
  - `pinned` (`:133-136`) sends a sticky root to `view`. Rail is sticky.
  - `place()` (`:139-167`) places `fill`, `top-left`, `top-right` (B10's 8px) and `above`. It gains `bottom-left`.
- **CSP.** `/canvas` gets the app's nonce policy (`csp.ts:72-91`, `proxy.ts:80`), and the canvas route never reads the
  nonce.
  - Parent-realm code acting on the canvas window compiles nothing inside the canvas. That is reasoned, not yet
    executed.
  - It has precedent on production: `wire(doc)`'s listeners, and `win.matchMedia` in `reveal()` (`editor.tsx:1524`).

**The editor**, `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`:

- **State and handlers:**
  - `:305-318` is the session state for `mode`, `device` and `viewAs`. `preview` joins them, with the same comment
    shape, and it joins `latest` (`:476-477`).
  - `mark()` (`:741-756`) and `restampAll()` (`:768-777`) keep the nodes. `chooseVisitor` (`:841-847`) is the
    precedent: write `latest` first, then `paint()`, then `setSaid`.
  - `paint()` (`:865-921`):
    - It ends a field being edited (`:881-883`), renders each section, calls `mountSections` (`:905`), `takeStamps`,
      `sectionRoots`, `wire(doc)` and `mark()`.
    - `core` is stopped before the markup is replaced and started after `wire`.
  - `run()` (`:1107-1140`) has a `default:` arm, so a `'preview'` case must be written or the key silently does nothing.
  - `onShortcut` (`:1142-1160`) is where Preview's key rule goes.
  - `onEscape` (`:1171-1189`): the Preview rung goes after the popover and dialog guard and before `escDeselects`,
    both on `:1176`.
- **`wire(doc)` (`:1193-1312`):**
  - `:1198` prevents `submit`, `dragstart`, `auxclick`, `dragover` and `drop`. That line stays.
  - `mousedown` (`:1211-1230`) starts editing or prevents the default.
  - `pointerover` and `pointerout` (`:1247-1258`) call `point()`.
  - The touch-hold machine is `:1259-1298`.
  - `click` (`:1299-1308`) prevents the default and calls `choose`.
  - In Preview each of these stands down, except that a click on `a[href]` is still prevented.
- **The mount effect (`:1343-1373`):** its cleanup stops `core`.
- **The chrome layer (`:1543-1581`):** hosts exist only while `showing`. `layerFor` picks the host from the root, and
  the rAF loop places every element.
- **Portalled chrome (`:2155-2190`):** the chips join it.
- **Shell layout:**
  - The 48px header is `:1926-2050`, and its right-hand cluster is `:2022-2049`: dice, sun, `DeviceSwitch`, then
    `#editor-theme-settings` (`:2042-2048`).
  - `aside#editor-layers` is `:2053-2095` and `aside#editor-controls` is `:2241-2316`.
  - The stage `<section aria-label="Canvas">` is `:2098-2127`, with `px-7 py-8` (R-138 and R-139). The card is
    `rounded-[6px] shadow-canvas-page`.
  - The iframe is `:2137-2153`.
  - `ViewportChip` is `:2194`, `SourcePill` is `:2199-2205`, `InlineTools` is `:2208` and `SectionPill` is
    `:2209-2237`.
  - `#editor-said` is `:2321-2323`.
- **Comments to correct:**
  - `:190-199`, the ABSENT list, is stale on 5.8 and 5.10, and it never names Preview.
  - `:1086` says `P` carries no keys.

**The key map:**

- `apps/web/lib/keymap.ts`:
  - The `Gesture` union is `:31-38`, and the `P` row is `:103`: `{ action: 'Preview Mode', chips: ['P'], story:
    '5.15' }`.
  - `L` (`:95`) is the model for `shift: false`.
  - `SINGLE_KEY` (`:123-125`) derives the focus condition. The tense at `:10-11` is stale.
- `apps/web/keymap.test.ts`:
  - `:118` still names `P` as owed.
  - `:159-160` expects `['deselect']` as the one live row with no keys.
  - `:186-207` (`⇧R`) is the model for a `P` test.

**The components:**

- `apps/web/components/editor/device-switch.tsx`:
  - `DeviceSwitch` (`:28-69`) is `#editor-device` with `radioKeys` and `tabStop`. A second instance needs its own `id`,
    as `ModeToggle` does (R-151).
  - `ViewportChip` (`:84-95`) is the chip precedent: `rounded-pill border border-line-strong bg-paper px-2 py-[2px]
    text-[9.5px] text-ink-soft-aa`. Those are B11's `#F4F1EC` and `#D8D2C7` mapped to their nearest tokens.
- `mode-toggle.tsx:29-48` — the name names the destination, there is no `aria-pressed` (5.6's review), and `onMouseDown`
  is prevented.
- `apps/web/components/kit/icons.tsx` — `Eye` (`:259`) and `EyeOff` (`:265`) are S4d's drawings. The device glyphs
  (`:480-501`) are S4a's, which Story 5.7 made the editor's. There is no pause glyph.
- `apps/web/components/kit/canvas-pill.tsx` — B4's ink pill (10px radius, 4px padding). B3b draws its own recipe.
- `apps/web/app/globals.css:31-51` and `:99-106` — `paper`, `paper-sunk`, `ink`, `ink-soft-aa`, `line`, `line-strong`,
  `surface` and `shadow-modal`. B3b's `.24` is `modal`'s `.25`.

**The tests that assert today's behaviour, and change:**

- `tools/keyboard/journey.spec.mjs`:
  - `:396-422` is the card test: `P` moves from the dead list to the live one.
  - `:424-445` is the deferred-key test, which keeps only `⌘⏎`.
  - `:544-566` is the printable-key sweep, which presses `p`. After it, the sweep must leave Preview, as it already
    closes a dialog.
- `tools/probe/run-verify-editor.cjs`:
  - Step 3 (`:429-443`) is zero `data-inflozo-*` at rest, and it stays green.
  - Step 4 (`:445-476`) compares roots' `outerHTML` with `/pilots'`. `js-enabled` must be removed from both sides.
  - Step 5 is the CSP session (`:259-273`, `:479-486`, `:4461-4462`).
  - Step 8 is axe (`:4655-4758`).
  - Step 77 (`:3227-3264`) and step 78 (`:3266-3274`) say "no P".
  - Step 90's key sweep is `:4349-4359`. Its room check (`:4136`, `:4225-4232`) measures the cluster the pill joins.

**The frames and documents:**

- **`B Missing Surfaces.dc.html` B3, `:627-718`:**
  - **B3a** (`:636-682`):
    - The bar is `:639-652`.
    - The pill is `:645-649`: white, a 1px `line` border, `pill` radius, `4px 10px 4px 8px` padding and a 7px gap.
      Its eye (`:646`) is 13px at stroke 1.6. "Preview" is 12/600, and the mono `P` cap is 10px on `paper-sunk`,
      `ink-soft-aa`, with a 4px radius and `1px 5px` padding.
    - The chip is `:658-661`: `paper` / `line-strong` (as mapped above), `pill` radius, `2px 8px` padding and a 5px
      gap. Its pause glyph (`:659`) is 9px at stroke 2.4, and "PAUSED" is literal capitals at 9.5/600, letter-spacing
      .02em.
    - The caption is `:681`.
  - **B3b** (`:684-713`):
    - The site runs edge to edge (`:686`).
    - The bar (`:700-710`) is ink, `pill` radius, 5px padding and gap 2, at `bottom:18px`. Inside it:
      - Back to editing (`:701-705`): 34px high, radius 20, `0 15px` padding, a 14px eye-with-slash at stroke 1.7,
        13/600 white words and a mono `esc` cap at 10.5px on white/16.
      - A divider (`:706`), then three 34px device buttons (`:707-709`), the current one on white/14.
    - The caption is `:712`.
  - **The notes** (`:717`): "Coming back is *esc* as well as the button, and going in is *P*".
- **`EXPERIENCE.md`:**
  - `:155` is the IA row: Preview Mode, B3a · B3b, `P` · Preview.
  - `:230` says Preview is a mode.
  - `:389` is the key table.
  - `:429-432` covers the chip.
  - `:460-464` is the Esc ladder, which has no Preview rung.
  - `:885` is the journey beat.
- **`prd.md`:** FR-D1 `:218` (zero chrome at rest), FR-D11 `:228` (it names no `P` and no `⇧R`), FR-D20 `:243`,
  FR-G7(3) `:295` and FR-G7(4) `:297`.
- **`research-section-js-libraries.md` §7 (`:576-652`):**
  - `:606` still says E4 confirms the values.
  - The table starts at `:619`.
  - `cards.js` (`:652`) says "Story 5.15 confirms both values on the real canvas".

## Tasks & Acceptance

**Execution:**

- [ ] `packages/library/modules/core.js` — three changes, all within DW-136:
  - `export` on its one declaration.
  - `options.report(error)`, used in place of the timer throw when it is given (DW-136(b)).
  - The handle returns `paused`: the mount elements the editing rule skipped at `:43`, in document order.
  - The header comment's "A CLASSIC script, never an ES module" becomes "one exported declaration, which `bundle()`
    pastes into the classic `main.js` without the keyword". Nothing else in the file changes.
- [ ] `packages/library/modules/core.d.ts` — **new**. It types `core(win, modules, options?)`:
  - `modules` is `readonly [name, fn, { editSafe, animates }][]`.
  - `options` is `{ editing?: boolean; report?: (error: unknown) => void }`.
  - The return is `{ stop(): void; readonly paused: readonly Element[] }`.
- [ ] `packages/library/package.json` — `"./core": "./modules/core.js"` in `exports`. The root index stays the
      rulebook.
- [ ] `packages/library/src/modules.ts`:
  - `topLevelShape` accepts exactly one **exported** declaration of the expected name, and still refuses anything else.
  - `bundle()` removes that one `export ` before pasting, so `main.js` never carries one.
- [ ] `eslint.config.js:181-182` — `sourceType: 'module'` for `packages/library/modules/*.js`. `no-undef` and
      `compat/compat` are kept. Correct the comment at `:41-43`.
- [ ] `packages/library/modules/core.test.mjs`:
  - **Import** `core` rather than `win.eval` it, and call it from the test's realm against a jsdom window. That is the
    shape the editor uses.
  - New tests:
    - `report` receives a mount's throw and a malformed declaration, and nothing is thrown from a timer.
    - `paused` is exactly the skipped mounts under `{ editing: true }`, and it is empty without editing.
  - `:245`'s bundle, with JavaScript on and off, still runs.
- [ ] `packages/library/src/modules.test.ts`:
  - The shape tests require `export function <fn>` and refuse a bare declaration.
  - The start-call test (`:51`) pastes the source without `export`.
  - A bundle of the real `core.js` is its header, then the source with exactly its one `export ` removed, then the
    start call, and it holds no `export` anywhere.
- [ ] `apps/web/lib/preview.ts` — **new and importless**, like `lib/device.ts`, so `keymap.ts` can read it and stay
      importless. It holds the words, each written once: `PREVIEW` ("Preview"), `BACK` ("Back to editing"), `PAUSED`
      ("PAUSED"), `PREVIEW_SAID` ("Preview. Press Escape or P to come back.") and `BACK_SAID` ("Back to editing.").
- [ ] `apps/web/lib/behaviours.ts` — **new**, and pure apart from calling `core`, so `node --test` reaches it. It holds:
  - `CANVAS_MODULES`: every `MODULES` row, in registry order, as `[name, fn, row]`. `fn` is the module's own function,
    and a no-op where no file exists yet. That fallback carries a `ponytail:` note naming FR-G7(2) and the day it goes.
  - `startBehaviours(win, editing, report)`, the one call of `core` in the app.
- [ ] `apps/web/behaviours.test.ts` — **new**:
  - `CANVAS_MODULES` holds every registry row in order.
  - **Every file in `packages/library/modules/` other than `core.*` and the registry is imported into it.** The list is
    derived from the directory, so the first module file lands red until the canvas runs it.
- [ ] `apps/web/lib/keymap.ts`:
  - The `P` row goes live: `{ gesture: 'preview', action: PREVIEW, chips: ['P'], keys: ['p'], shift: false }`. The
    card's words come from `lib/preview.ts`, so the pill, the card and the bar read one name (R-170).
  - `'preview'` joins `Gesture`.
  - Correct the tense at `:10-11`, and the header's "its one import" line (`:24`), which now names two importless
    modules.
- [ ] `apps/web/keymap.test.ts`:
  - `:118` loses `'P'`.
  - Add a `P` test on `⇧R`'s model: `p` is `preview`, `⇧P` is nothing, in a field it is nothing, and `SINGLE_KEY` holds
    it.
- [ ] `apps/web/lib/canvas-layer.ts` — `place()` gains `'bottom-left'`: 8px inside the anchor's bottom-left corner. An
      anchor with no box keeps its element hidden.
- [ ] `apps/web/components/kit/icons.tsx` — three glyphs, each copied verbatim from its frame (R-92):
  - `Pause` (B3a `:659`)
  - `PreviewEye` (B3a `:646`)
  - `PreviewEyeOff` (B3b `:702`)
- [ ] `apps/web/components/editor/device-switch.tsx` — `DeviceSwitch` gains an `id` and an `ink` tone for B3b's bar:
      34px icon buttons, the current one on `surface/14`, hovering to `surface/12`. The glyphs stay S4a's.
- [ ] `apps/web/components/editor/preview-toggle.tsx` — **new**. Two parts:
  - **`PreviewButton`**, B3a's pill, with id `editor-preview`.
    - The eye, "Preview" and the `P` cap, which is `aria-hidden`. The button carries `aria-keyshortcuts="P"`, and its
      name is its word.
    - It hovers to `line-strong`.
  - **`PreviewBar`**, B3b's bar: `role="toolbar"`, named `PREVIEW`, id `editor-preview-bar`.
    - Ink, `rounded-pill`, `p-[5px]`, `shadow-modal`, fixed 18px above the window's bottom and 18px from its left.
    - It holds the **Back to editing** button (`aria-keyshortcuts="Escape"`, the `esc` cap `aria-hidden`), a divider,
      and the ink `DeviceSwitch`.
- [ ] `editor.tsx`:
  - **The state.** `preview` is session state beside `mode`, `device` and `viewAs`, and it is in `latest`.
    `enterPreview` and `leavePreview` each write `latest`, set the state, `paint()` and `setSaid`, then move the focus:
    - Entering moves focus to Back to editing and remembers where it was.
    - Leaving returns focus there, or to the pill if that element is gone.
  - **`paint()`:**
    - Stop the running handle.
    - Write the markup with `mount.innerHTML`, not `mountSections`.
    - After `wire(doc)`, start `startBehaviours(doc.defaultView, !preview, report)`, where `report` logs to
      `console.error` with the module's name.
    - Keep the handle and its `paused`. The mount effect's cleanup stops it.
  - **The chips.** One chip for each paused mount inside the hovered root and inside the selected root, portalled into
    `layerFor(root)` and placed `bottom-left` by the rAF loop.
    - Classes: `ViewportChip`'s palette, Inter 9.5/600 with tracking .02em, the 9px `Pause` glyph and a 5px gap. The
      chip is `aria-hidden` and carries no pointer events.
    - None in Preview.
  - **`wire(doc)` in Preview** reads `latest.current.preview`:
    - No `point()`, no `choose()`, no editing, no lock pill, and no hold.
    - `mousedown` is not prevented.
    - `click` is prevented only on `a[href]`.
    - `:1198`'s list stays.
  - **The keys.**
    - `run()` gains `case 'preview'`, a toggle.
    - `onShortcut` in Preview passes only `preview`, `save` and the three device gestures.
    - `onEscape` gets the Preview rung, placed after its popover and dialog guard.
  - **The shell in Preview:**
    - The header, both asides, their `Rail`s, the skip link, `ViewportChip`, `SourcePill`, `InlineTools` and
      `SectionPill` are all `hidden`, never unmounted.
    - `showing` (`:1546`) is false in Preview, so the chrome layer is dropped and no outline, tag, badge, lock pill or
      chip can exist. The selection itself stays in state.
    - The stage loses its padding, and the card loses its radius and shadow.
    - `PreviewBar` renders.
  - **The pill** goes last in the right-hand cluster, after Theme settings. B3a puts it immediately left of the ship
    button, which Story 7.18 places to its right.
  - Correct the comments at `:190-199` and `:1086`.
- [ ] `apps/web/lib/canvas.ts` — `mountSections`' comment says it is `/pilots'` and the picker's JavaScript-on look,
      and that the editor's canvas is `core`'s.
- [ ] `tools/keyboard/journey.spec.mjs`:
  - Update `:408`, `:414`, `:433` and the sweep at `:544-566`: press `Escape` when Preview is on, as the sweep already
    does for a dialog.
  - New journeys:
    - `P` enters and each of the three ways comes back, with focus in and out.
    - The top bar, both asides and the section pill are hidden, and the bar is shown.
    - `.a1-1__bar` and `.a22-1__form` have no `js-enabled` while designing, have it in Preview, and lose it again on
      return.
    - A hovered Rail carries exactly one `[data-chrome="paused"]` in its layer, and there is none at rest.
    - `L` `.` `[` `?` do nothing in Preview, and `1` `2` `3` change the device.
    - A `p` typed in a panel field is a letter.
    - The Tab budget stays derived.
- [ ] `tools/probe/run-verify-editor.cjs` — the deployed walk:
  - Step 4 compares with `js-enabled` removed from both sides; the class is `core`'s, and step 91 reads it.
  - Step 5's session gains Preview in and out with `core` running. Its violations sentence names them.
  - Step 8 scans a hovered Rail with its chip, and Preview.
  - Steps 77 and 78: `P` is live, and only `⌘⏎` is owed.
  - Step 90's sweep leaves Preview after `p`, and its 1280 room check stays positive with the pill in the cluster.
  - **Step 91**, new:
    - At rest there is no chip. On hover, Rail and the Inline Row each carry one chip: B3a's painted size and colours,
      clear of the name tag and the section pill.
    - `js-enabled` is absent while designing, present in Preview and absent after.
    - At Mobile the menu button is displayed only in Preview.
    - A link and a submit in Preview leave the page where it is.
    - The pill and the bar match B3a and B3b.
    - Zero CSP violations with `core` running, behind step 5's `EvalError` control.
- [ ] **Documents** (standing rule 3, then a grep for `Preview Mode`, `story: '5.15'`, `never run by the product` and
      `A CLASSIC script` under standing rule 7). Written here for the RECOMMENDED options, and re-cut when the owner
      rules:
  - `prd.md`:
    - FR-D11 names `P` (Preview) and `⇧R` (Site Remix, which 5.12 missed).
    - FR-D20's example list follows the table (Question 1), and the chip rule follows Question 2.
    - FR-G7(4) says the editor calls `core` against the canvas.
  - `epics.md`:
    - The FR-D11 (`:96`) and FR-D20 (`:105`) summaries.
    - Story 5.15's criteria.
    - `:5549`, `:5571` and `:5677` stop restating an edit-safe value and cite the registry. `:5549`'s "yes" is the
      export's inverted sense (DW-133).
    - Story 5.22: the right-hand cluster now meets the centred group at about 1190px, not 950px.
  - Research §7:
    - `:606` says each module's first category story confirms its value on this canvas (VERIFY-AT-BUILD row 50).
    - The `cards.js` row's confirmation moves to Story 5.20, the first canvas that draws a post body.
  - `ARCHITECTURE-SPINE.md`:
    - AD-21's PAUSED clause: chrome in the layer, not `::after`.
    - The repo tree's "never runs" (`:494`).
    - The CSP row: the canvas still carries no script, and `core` runs from the editor.
  - `docs/section-authoring.md`:
    - The module shape is `export function`, and `bundle` strips the keyword.
    - The Editing and `main.js` paragraphs.
    - `report` and `paused`.
  - `EXPERIENCE.md`:
    - `:429-432`: the chip, and at rest.
    - `:885`: a countdown ticks while you design too.
    - `:460-464`: the Esc ladder's Preview rung.
    - `:389`: "Preview".
  - `reconcile-designs-decisions.md`:
    - A pointer under R-120's PAUSED clause.
    - An erratum under R-21, whose title reads its own sense backwards.
  - `deferred-work.md`:
    - Close DW-133 with Question 1's ruling, and DW-136.
    - New entries:
      - A width-declared module (`accordion:768`) is chipped at every width. The owner is the first width-declared
        design on the canvas.
      - `restampAll` and the control fast path strip a root-level mount's `data-i18n-*` (`editor.tsx:768-777`,
        `:1918-1920`). The owner is the first design with strings on a root mount.
    - Append to DW-164: epics' "none" module lists for 9.1–10.41 against §2.1, A1-16 Reveal being in no story, and
      designs "declaring" `core`.
    - Append to DW-150: A1 spec `:185`'s "pinned open while selected".
  - `epic-5-context.md`: sub-bullets under "Behaviours hold still while designing".

**Acceptance Criteria:**

- **Given** the editor at 1440, **when** it opens, **then** the right-hand cluster ends with the Preview pill:
  eye · Preview · `P`. **It matches the frame**, B3a `:645-648`, and its name is "Preview".
- **Given** a section with a paused behaviour, **when** it is hovered or selected, **then** that behaviour carries
  B3a's PAUSED chip: pause glyph, "PAUSED" at 9.5/600, the `paper` / `line-strong` pill. The chip sits 8px inside the
  mount's bottom-left corner, clear of the name tag, the Pro badge and the section pill. **It matches the frame**, B3a
  `:658-660`, and at rest there is none (Question 2).
- **Given** the editor, **when** Preview is entered by the pill or by `P`, **then** every editing surface is hidden and
  B3b's bar is shown at the bottom-left, with Back to editing, `esc`, the divider and the three devices, the current
  one lit. Every declared mount is running, and no hover, click or tap selects or outlines anything. **It matches the
  frame**, B3b `:686-712`.
- **Given** Preview, **when** Back to editing, `Esc` or `P` is pressed, **then** the editor is exactly as it was: panels,
  selection, device, mode and View as. Every mount that is not edit-safe is at rest again, and focus has returned.
- **Given** the shell holds focus, **when** `?` is pressed, **then** the card lists `P` as "Preview", and `P` is bound
  only while the shell holds focus. **Given** Preview, **when** any other key is pressed, **then** only `P`, `Esc`,
  `1` `2` `3` and `⌘S` act.
- **Given** Preview, **when** a link or a form's submit is pressed, **then** the canvas does not navigate and nothing is
  submitted.
- **Given** the pill (R-98), **when** it is pressed, **then** the canvas has repainted before a busy label could
  describe anything. No route is added, so no skeleton is owed, and `busy.test.ts` stays green.
- **Given** `pnpm check`, **when** it runs, **then** `check-snapshots` and the render matrix are unchanged, `main.js`
  carries no `export` and runs with JavaScript on and off, and `derive-module-reach.py --check` is green.

## Spec Change Log

## Design Notes

**Why `core` runs from the editor, and why `core.js` gains `export`.**

- **Nothing can run inside the canvas.**
  - The canvas document carries no script. Its route never reads the nonce, and it is cached `immutable`, while a nonce
    is per request.
  - The policy refuses `eval` on production.
  - So DW-136's "likely shape", a canvas-side wrapper evaluating `bundle`'s strings, cannot run.
- **`core` was written to be called from outside.** Every platform object is reached through `win` (`core.js:3-4`), and
  every module is held to `el.ownerDocument` (`section-authoring.md:747-749`).
  - So `core(frame.contentWindow, rows, { editing })` from the editor's own bundle compiles nothing inside the canvas.
  - The editor already acts on that window on production, through `wire(doc)` and `win.matchMedia`.
  - That this raises zero violations is a **hypothesis until step 91 executes it** (standing rule 1).
- **To be imported, `core` needs an `export`, and a classic `main.js` cannot carry one.** So the rule becomes one
  exported declaration, with `bundle()` removing the keyword.
  - `checkThemeJs` compares a theme's `main.js` with `bundle()` over the same sources, so the check itself is
    untouched, and no `export` ever reaches a theme.
  - Future modules follow the same shape, which is how the editor will import them.
- **What stays for `core.test.mjs`.** It keeps its jsdom, and it now calls `core` the way the editor does.

**At rest is the no-JavaScript branch, and the frame draws something else.**

- **What the rule says.** FR-G7(4), `core.js:14-16` and `section-authoring.md:765-768` all say a module held still while
  editing leaves its mount in its no-JavaScript state.
- **The case that settled it.** Story 4.7 chose this because of `reveal`: its JavaScript branch hides content, and with
  nothing running that content would stay hidden forever.
- **What B3a draws instead.** B3a draws frozen JavaScript looks: the rotator "on phrase 3 of 3", with a chip reading
  "3 OF 3". Build-sequence standing rule 6 says the frames decide what a surface is built from, and the PRD decides what
  it does. So the chip's look is B3a's, and the resting state is FR-G7(4)'s.
- **The one visible consequence on the owner's pages.** At Mobile, Rail shows its links listed under the logo while he
  designs, and its menu button only in Preview. Since Story 5.1 the canvas had shown the button, through `mountSections`.
  The manual test says so.

**Why a no-op stands in for a module with no file.**

- **No feature module exists.** FR-G7(2) has each one written by its first category story, and on the canvas only the
  provisional pilots declare a module before its file exists.
- **With no stand-in, `core` cannot be used at all.** It reports every unknown name, even while editing
  (`core.js:34-41`), and a row with no function would throw on its first mount in Preview.
- **What the no-op gives.** Preview draws those mounts in their JavaScript branch, which is exactly what `/pilots`, the
  picker's cards and the render matrix draw. So Preview agrees with the matrix, the one reference for "the site".
- **It is temporary, and a test keeps it honest.** The day a module file lands, `behaviours.test.ts` fails until the
  canvas imports it.

**Where the chip is drawn, and where it sits.**

- **Not as `::after`.** R-120's clause and AD-21's rule text say PAUSED is `::after` inside the frame. At the 1440
  window's 0.6 fit, B3a's 9.5px words would paint at 5.7px in the design's own font. They would also take over a
  design's own `::after` on that element, and they would need a positioned mount.
- **In the chrome layer instead.** Those are the name tag's three reasons for leaving (R-120's amendment), so the chip
  joins the tag in the chrome layer, at one screen pixel per unit. The rest-is-zero invariant is untouched, because the
  layer only exists while a section is hovered or selected.
- **In the bottom-left corner.** B3a sets it at the behaviour's trailing end, in flow, which a chip drawn over a design
  cannot do. A section's top corners already belong to the name tag (top-left) and the pill and Pro badge (top-right,
  R-125). A full-width mount such as Rail's bar is only a few dozen screen pixels tall at the 1440 window's 0.6 fit,
  and the pill covers most of its right end. Step 91 measures the clearance.

**The rest of the frame, as built.**

- **B3b's bar sits 18px from the bottom-left of the window.** Its literal `left:112px` is a place inside a 700px
  drawing. The left edge keeps the bar beside a phone-sized page, not over it, and B3b's caption names 390 as "the main
  reason to be in here".
- **Some drawn parts are the editor's own.**
  - The device glyphs are S4a's: Story 5.7 made them the editor's, and B3b redraws them at another weight.
  - B3b draws Mobile lit over a desktop page. The lit button is always the current device.
- **Some drawn parts are not built.** "Ship update" (B3a `:650`) is Story 7.18's "Ship it". B3a's "3 OF 3" chip is the
  rotator module's own concern, arriving in Epic 9, and every chip here reads "PAUSED".
- **The word "Preview".** R-170 gives the mode one name. "Preview dark mode" (the sun's name) and "Preview as" (View
  as's heading) use the verb for other things, and they stay.

**What the owner can and cannot see.**

- **No behaviour moves anywhere in the product yet.** The PAUSED chips and Preview's JavaScript branch are visible on
  his pages. A real function actually running is proved by `core.test.mjs`, the same code path the editor calls.
- **The CI journey proves the wiring,** the class flipping on the real editor, on every commit.
- **No samples.** R-158's shape, sample designs on `/controls`, is not repeated. This is a routine call, stated in one
  line to the owner.

**Room in the top bar.** Story 5.14 measured the right-hand cluster clear of the centred group down to about a 955px
window. The pill adds about 118px, so they now meet at about 1190px. The 1280 check stays positive (about 44px), and
anything narrower is Story 5.22's responsive floor.

**Known ceiling.** A width-declared module (`accordion:768`, R-38) is chipped at every width, although at a wide width
it would not run even in Preview. No pilot declares a width, so this is a new DW entry and not code.

## Verification

**Commands** (under Node 24):

- `pnpm check`. Expected:
  - lint green, with `packages/library/modules/*.js` now linted as ES modules;
  - typecheck green;
  - every package test green, including `core.test.mjs`, `modules.test.ts`, `keymap.test.ts` and
    `behaviours.test.ts`;
  - `node tools/check-snapshots.mjs` **unchanged**.
- `pnpm keyboard`. Expected: the Preview journeys and the updated sweep are green in CI's `check` job.
- **The control for `main.js`.** `modules.test.ts`'s new assertion is the byte check: the bundle is the source minus
  its one keyword, with no `export` anywhere. `core.test.mjs:245` runs that bundle with JavaScript on and off. Then
  `cd tools/stress && npm install && node build.js && node gate.js theme`. Expected: 0 errors and 0 warnings on both
  majors.
- `python3 tools/derive-module-reach.py --check`. Expected: green, because no `editSafe` value moved.
- `bash tools/matrix/run-matrix-gate.sh`. Expected: green and unchanged.
- `node tools/probe/run-verify-editor.cjs` against `https://app.inflozo.com`, with `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT`. Expected:
  - 0 FAIL, including steps 3, 4, 77, 78, 90 and 91;
  - step 5 at zero violations, with Preview and `core` in its session, behind its `EvalError` control;
  - step 8 at zero axe violations in Preview and on a chipped hover.
- `python3 tools/doc-audit.py --check`, run twice. Expected: exit 0.

**Real services this story touches (R-82):**

- **Vercel production**, `app.inflozo.com`: the deployed editor, the canvas document's policy headers, and the walk.
- **Standing rule 1 applies to the parent-realm call.** "Code in the editor's realm acting on the canvas window raises no
  violation under the canvas's policy" is reasoned, not measured. At Review, on production, step 91 records:
  - `securitypolicyviolation` events with `core` running in both modes;
  - `js-enabled` read back on the mounts.

  Its negative control is `win.eval('1')` from the editor against the canvas window, which must throw `EvalError`.
  Record the result in `MEASUREMENTS.md`.
- **Supabase** is touched only through the walk's throwaway sign-in. No table is read or written by this story.
- **Not touched, and not claimed:** T1, T3, Resend and Dodo. Nothing here reaches Ghost, sends mail or takes payment.

## Owner's manual test

Do this on the real site after Deploy confirms the build. Use the **Pilot sections** project, the one seeded to your
account at Story 5.1, in a desktop browser window about 1440 wide.

**Steps 1 to 3 assume Question 2 is ruled option 1**: tags only on the section you point at. If you rule otherwise, those
steps change to match your ruling before Deploy. Question 1 changes no step, because none of the four parts it asks
about is on your pages yet.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the right end of the top bar, then at the page. | — | After "Theme settings", a white pill with an eye, the word **Preview** and a small grey **P**. Nothing on the page carries a PAUSED tag, and the page looks exactly as it did before this story. |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Point at the header, without clicking. | — | Its outline and name tag, and a small grey tag with a pause sign reading **PAUSED** near the header's bottom-left corner. Move the pointer away and the tag goes with the outline. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Point at the newsletter band ("One letter a week, on Friday morning"), then at the three-column band and at the latest-post band. | — | The newsletter shows **PAUSED** at the bottom-left of its email form, because the sign-up does nothing while you design. The other two show no tag: they have no moving part. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press the **phone** button in the top bar. | — | The page becomes phone-sized. The header now **lists its links under the logo** and shows **no menu button**, because its phone menu is paused while you design. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home, phone size | Press **Preview**. | — | The top bar, both side panels and every outline disappear, and the phone-sized page stands alone on the grey ground. At the bottom-left is a dark bar: **Back to editing** with a small **esc**, a thin line, and three device buttons, the phone one lit. The header now shows its **menu button** (three lines) and hides its links, as on the live site. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Preview | Press the menu button. Then click a link in the page. Then type an email into the newsletter box and press **Subscribe**. | `test@example.com` | The menu button does nothing yet: the menu that opens from it arrives with the header designs in Epic 9. The link goes nowhere and nothing is sent, because in Preview a link or a form never leaves the page. The email box takes your typing. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Preview | Point at a section and click it. | — | No outline, no name tag, no PAUSED tag, and nothing selected. |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Preview | Press the **desktop** button in the dark bar. | — | The page returns to desktop size, as large as the window allows, with no editing tools around it and the dark bar over its bottom-left corner. |
| 9 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Preview | Press **Back to editing**. | — | Everything comes back as it was: the top bar, both panels, the device you chose, and any section you had selected before step 5. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the grey ground beside the page. Press **P**, then **Esc**. Then press **P** twice. | — | P goes into Preview and Esc comes back. P also comes back. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click into the newsletter heading and type a **p**. Then press **⌘Z**. | `p` | The heading gets a p and nothing previews. ⌘Z takes the p away. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the grey ground and press **?**. | — | The shortcuts card has a row **Preview — P**. Esc closes it. |

## Questions for the owner

### Question 1 — Tabs, fold-out panels, fade-in-on-scroll and shrinking headers: keep them moving while you design, or hold them still like the rest?

**In plain English.** Some designs will have parts that move or change, by themselves or on a click. While you design,
most of them hold still, and Preview shows them moving. For four of them our documents disagree. The requirement and
this story's card say that tabs, fold-out panels ("accordions"), content that fades in as you scroll, and headers that
shrink as you scroll keep moving while you design. The table the product actually reads says they hold still, like the
full-screen photo viewer and the carousel you ruled on before. None of the four is built yet, so nothing on your pages
changes today. The answer decides every later design that has one.

**An example.** A pricing section with three tabs: Monthly, Yearly, Lifetime. Held still, the canvas shows all three
price panels one under another, so you can click into any price and change it, and Preview shows the tabs. Kept moving,
the canvas shows the tabs as visitors see them, and you reach the Yearly panel by clicking its tab first.

1. **Hold all four still while you design; Preview shows them moving (RECOMMENDED).**
   - Nothing you placed is ever hidden, and nothing moves under your pointer: tabs stack, fold-out panels stay the way
     the section is set, fading content simply shows, and the header keeps its full size.
   - We correct the requirement's sentence and this story's card to match the table.
2. **Keep all four moving while you design.**
   - The canvas is closer to the live site for these four.
   - A hidden tab panel is reached only through its tab, fading content fades in again after every change, and a
     shrinking header can slide away while you scroll the canvas.
   - We change the table's four rows.
3. **Keep tabs and fold-out panels moving, and hold the other two still.**
   - The two whose open and closed states you design stay live, and the two that move on their own hold still.

Whichever you choose, a countdown keeps ticking while you design, because the table says ticking digits get in the way
of nothing. The drawing for this screen shows one stopped.

**Ruled:** _(awaiting the owner)_

### Question 2 — Should the PAUSED tag show all the time while you design, or only on the section you point at?

**In plain English.** A part that holds still while you design gets a small grey PAUSED tag right where it sits. The
drawing for this screen shows the tags all the time, as "the one exception" to a clean page. The requirement says that
with nothing pointed at or selected, the page carries no editing marks at all, so it looks exactly like your site.

**An example.** Your header's phone menu holds still at every size, because the rule is per moving part, not per screen
width. With tags shown all the time, every page you design would carry a PAUSED tag on its header, even at desktop size,
where that menu does nothing you can see.

1. **Only on the section you point at or select (RECOMMENDED).**
   - The page at rest stays exactly your site.
   - Point at the header and the tag appears on its bar. Move away and it goes.
   - A still part is not marked until you point at its section.
2. **All the time while you design, as drawn.**
   - You see at a glance which parts of every page move.
   - Your header carries a tag on every page, and the requirement's sentence gains this one exception.
3. **All the time, but only on parts that move by themselves** (a countdown, a rotating headline, a scrolling ticker).
   Parts that wait for a click, like the phone menu or a sign-up form, show it only when you point at them.
   - This needs a new "moves by itself" mark on every moving part in the table.

**Ruled:** _(awaiting the owner)_
