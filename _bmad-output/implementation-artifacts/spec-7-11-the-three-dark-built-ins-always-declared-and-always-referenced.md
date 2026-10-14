---
title: 'Story 7.11 — The three dark built-ins, always declared and always referenced'
type: 'feature'
created: '2026-10-14'
status: 'in-review'
owner_test: none
review_loop_iteration: 0
baseline_commit: 'ab27d534892d9fa656b30e8aeab4f1b5dc267a5d'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story every theme Inflozo builds carries three settings your site's owner can change in Ghost's own Design
panel, on every project, Light only included: **Color scheme** (Auto, Light or Dark), **Dark accent color** and **Dark
logo**. Each one works the moment it is changed in Ghost — the site pins itself to light or dark, takes the new dark accent,
or shows the dark logo whenever it is drawn dark — with no redeploy and no visit to Inflozo. There is nothing new to click
in Inflozo: the test Ghost proves it in this story, and your own sites get it with the deploy wizard in Story 7.18.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A compiled theme declares no `config.custom` unless a control is promoted, and `default.hbs` opens
`<body class="{{body_class}}">` with nothing after it (`compile.ts:928`). So the owner's pin that `MODE_SELECTORS` reads
(R-239, Story 6.5) can never reach a real site, the dark accent is baked into the token block, and nothing shows a dark logo.
FR-Q5 and AD-17's three built-ins are unbuilt, and Story 7.2 emits no `custom` on purpose, so this story declares them
together with the lines that read them.

**Approach:** One module states the three built-ins and their starts. The compiler declares them in `config.custom` on every
project, after any promoted setting, and reads each one in `default.hbs` with real fallback logic:
- `color_scheme` writes the pin's body class.
- The dark accent and the dark logo become custom properties in `default.hbs`'s one settings `<style>`. The token block's
  dark blocks read them through `var()`: the dark accent wherever the pack's dark accent feeds a value, and the dark logo as
  `content` on every picture that prints Ghost's logo. The runtime stamps that picture `data-site-logo`.

`{{comments}}` stays bare, because Ghost's widget already takes its mode from the colours the pin resolves (§ Facts). Both
pinned gscans must score Light-only and Light + Dark themes 0/0. Chromium's truth table and T1 prove the mechanism. No
migration, so no Schema phase (R-99).

**Written to the owner's rulings of 2026-10-14 on Questions 1 and 2, both option 1** (§ Rulings this spec is written to).
Question 2's sentence is on Story 7.18's card word for word, and Epic 7's preamble lists it (R-195).

## Boundaries & Constraints

**Always:**
- **No surface, so no owner test and no frame.** The compiled theme reaches a screen only through Story 7.18's deploy.
  R-74's frame rule and R-80's owner test therefore name nothing here (`owner_test: none`, the card's "Owner test: none").
  Theme settings already says it: "three are the dark-mode built-ins every Inflozo project declares" (`SETTING_WORDS.limits`).
- **One module.** The three built-ins, their keys, types, options and starts all live in
  `packages/section-runtime/src/custom-settings.ts`, beside `RESERVED_SETTING_KEYS`, which stays the one list of the keys.
  - The compiler reads the module, and no second copy of a key or a start exists.
  - The keys are AD-17's: `color_scheme`, `dark_accent_color`, `dark_logo`. 7.9 proposed them and 7.11 confirms them.
- **AD-17 — every compile, every project, no special case.** A Light-only project (`darkEnabled: false`) emits the same three
  settings and the same three readers by the same code path. Only `color_scheme`'s start depends on the project's mode
  (§ The starts). The pack's dark map stays in the token block on every project, as Story 7.4 left it.
- **AD-30 — the token block is the one file whose STYLE RULES name a mode.** Every rule that depends on the mode is built
  from `MODE_SELECTORS`: the dark accent's `var()` and the dark logo's rule. `default.hbs`'s settings `<style>` sets only
  plain custom properties from `{{@custom.*}}` and names no mode.
  - The body class is the pin's signal, which FR-E4 and AD-17 place on `<body>`. Its two class names come from one constant
    that `tokens.ts` exports, and `MODE_SELECTORS` is built from the same constant (its bytes unchanged).
- **GS100 and GS090 by construction.** The compile's last assertion (`compile.ts:1010-1017`) already holds the declared keys
  and the readers to one set, and the built-ins pass through it.
  - `color_scheme`'s chain compares only its own option labels, in `{{#match}}`'s three-argument form (7.10's finding: gscan
    checks a select's values in that form only).
  - Both pinned gscans (4.49.7 at `v5`, 6.4.2 at `v6`) score a Light-only and a Light + Dark compiled theme 0/0.
- **The cap.** The built-ins never count toward `USER_SETTING_CAP`, so 17 user settings plus 3 is 20, which passes. A user key
  equal to a built-in is refused as today (`keyRefusal`).
- **AD-14.** The compile stays pure and byte-deterministic, with the built-ins' starts derived from inputs it already has
  (`pack`, `darkEnabled`).
- **AD-36.**
  - The built-ins' reader paths are constants the compiler writes. They never pass through `customPath`, which refuses a
    reserved key on purpose.
  - A dark logo's value reaches CSS only as `url("{{@custom.dark_logo}}")`, double-stashed inside the settings `<style>`.
    Handlebars writes `"`, `<` and `>` as entities, so the value cannot close the string or the element.
  - Ghost stores a colour only as `#rrggbb` (§ Facts).
  - A hostile value is inert beside a legitimate one that works.
- **The canvas is unchanged.** `packTokensCss` with no option writes today's bytes. The only canvas change is the
  `data-site-logo` attribute, which nothing on the canvas reads.
- **Real infrastructure (R-82).** The theme is proved on T1 (6.58.0) at Dev, on the owner's in-session go. Ghost 5's half
  waits for DW-326 (R-238).

**Ask First:**
- **Questions 1 and 2 are ruled** (owner, 2026-10-14: option 1 and option 1). A change to either is a new question, not a Dev
  decision.
- If a browser Dev can run does not replace an `<img>`'s picture with CSS `content`, HALT and ask the owner, because the dark
  logo would stay the light one there. The browsers are Chromium, plus Firefox and WebKit through Playwright installed in the
  scratchpad.
- Every T1 write needs the owner's go in the session that makes it, made in the main session and never through a subagent.
  The writes are: theme uploads, `PUT /custom_theme_settings/`, and the site logo set for the run and restored.
- Any change to the database. None is planned.

**Never:**
- No editor or Theme settings change: no new row, word or control.
- No `mode=` on `{{comments}}` and no comments-mode control anywhere. The library's grammar already allows `data-helper` no
  argument, and this story pins that.
- No `visibility` condition on a built-in.
- No write to Ghost from the app: AD-10's allowlist stays four (`ghost-admin-rule.test.ts`), and Ghost's own accent is never
  written.
- No dark swap for a header's own authored logo: A1's `logo`/`logoLight` are Epic 9's (DW-150, R-240).
- No `mode-toggle` (Story 9.1) and no Pre-flight (Story 7.18).
- No edit to the design export, no hand-edit of a generated file, no count written down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Light + Dark project compiles | `darkEnabled: true`, pack Paper, no promoted setting | `config.custom` = `color_scheme {type:'select', options:['Auto','Light','Dark'], default:'Auto'}`, `dark_accent_color {type:'color', default:'#E0805A'}` (the pack's dark accent), `dark_logo {type:'image'}`. `<body class="{{body_class}}{{#match @custom.color_scheme "=" "Light"}} scheme-light{{else match @custom.color_scheme "=" "Dark"}} scheme-dark{{/match}}">`. The head's settings `<style>` sets the dark accent and dark logo properties, each guarded. | — |
| Light-only project compiles | `darkEnabled: false` | The same three entries and readers, with `color_scheme`'s default **Light** (Question 1). No section hook. The pack's dark map stands. | — |
| Promoted settings too | 7.10's accent and controls promoted | The user's entries first in `position` order, then the three built-ins. `CompiledTheme.custom.emitted` lists all of them in that order. | — |
| The pin in Ghost | `color_scheme` set to Dark / Light / Auto | `scheme-dark` / `scheme-light` / no class follows `{{body_class}}`. The dark map applies by `MODE_SELECTORS`' order: the pin beats the visitor, which beats the device (R-239). | Hidden or `null`: no class, the same as Auto |
| Dark accent changed in Ghost | `#3366FF` | `--setting-dark-accent: #3366FF` in the head. In both dark blocks, every value the dark accent feeds that is or contains the pack's dark accent reads `var(--setting-dark-accent, #E0805A)`. The light block and the computed shades are untouched. | — |
| Dark accent absent | Ghost never empties a colour (§ Facts), but the chain is present: the property is not set | With the accent promoted, `--setting-dark-accent` takes the promoted light accent (`{{else if}}`). With neither, the pack's dark accent stays (the `var()` fallback). | — |
| Dark logo set | A dark logo URL; a placed design prints `@site.logo` (A1 #1) | Under any of the three dark inputs, the stamped `<img data-site-logo>` draws the dark logo (`content: var(--setting-dark-logo)`). In light it draws its own `src`. | — |
| Dark logo unset | No value | `content` is invalid at computed-value time and falls back to `normal`, so the picture draws Ghost's logo in dark too. With no logo at all, the design's own wordmark shows. | — |
| Dark logo, no site logo | A dark logo set, `@site.logo` empty | The wordmark in both modes. Nothing prints a logo for `content` to replace. | — |
| No design prints a logo | No header placed | The reader stays in `default.hbs` and no rule matches. GS100 does not fire. | — |
| User key collides | A promotion keyed `dark_logo` | Refused with `SETTING_WORDS.reserved` (unchanged) | — |
| At the cap | 17 user settings | 20 entries; both gscans pass. | An 18th user row is refused with `SETTING_WORDS.cap` (unchanged) |
| A hostile dark logo | `x");}body{display:none}</style><script>…` stored through Ghost's API, which does not validate an image | Rendered as entities inside the string, so no rule, element or script is created. A legitimate URL draws. | — |
| Comments | A design with `data-helper="comments"` | Bare `{{comments}}`, no `mode=`. A design asking for an argument is refused by the validator. | — |
| A design authors the stamp | A design's markup writes `data-site-logo` | Refused by the validator, because the attribute is the runtime's alone. | — |
| The canvas | Any doc | The token block is byte-identical to today's, and the canvas DOM differs only by `data-site-logo` on a site-logo picture. | — |

</frozen-after-approval>

## Code Map

**The rules — `packages/section-runtime/src/custom-settings.ts`** (7.9, 7.10):
- `SETTING_CAP`, `RESERVED_SETTING_KEYS`, `USER_SETTING_CAP` `:37-42`. The comment at `:38-39` says "7.11 to confirm or rename
  HERE".
- `SETTING_WORDS.limits` / `reserved` `:87`, `:91`.
- `keyRefusal` `:141-146` refuses reserved keys, and `customPath` `:370-374` calls it, so built-in readers need their own
  path.
- `checkSetting` `:181` also refuses reserved keys through `keyRefusal`, so a built-in row is emitted with `ghostEntry`
  `:234-242` and held by the gscans, not by `checkSetting`.
- `accentSettingOf` `:292`, `matchChain` `:390-407` (the three-argument form; the reason is at `:382-386`).

**Tokens — `packages/section-runtime/src/tokens.ts`:**
- `modeTokens` `:263-299`: the accent feeds `--accent` `:279`, the button scale `:292-294`, the link scale `:296`, and the
  computed `--accent-on-contrast` `:285`.
- `MODE_SELECTORS` `:430-434` (its class names are literals today), `SETTING_ACCENT` `:437`, `followAccent` `:443-449`
  (light only; nudges the light accent's last digit).
- `packTokensCss` `:460-485`: the light block `:473`, `perMode` `:474-475`, the two dark blocks `:479-480`, the link rules
  `:482`.
- `tokens.test.ts` holds `MODE_SELECTORS` as the only mode-naming source and the canvas bytes.

**The runtime — `packages/section-runtime/src/core.ts`:**
- `data-bind-attr` `:917-947`: the theme branch writes `src="{{@site.logo}}"` and the canvas branch resolves it. The stamp
  goes here, on both emitters.
- `data-if`/`data-else` `:863-874` fold the media guard into one `{{#if @site.logo}}`.
- The bare helper `:1008-1019` writes `{{comments}}` with no argument, from `BARE_HELPERS`
  (`packages/library/src/vocabulary.ts:444-446`).
- A1 #1 is `packages/library/designs/a1/1/index.html:6-7` (logo `<img>`, wordmark `data-else`). Its emitted partial is
  `packages/library/snapshots/a1/1/template.hbs:13-23`, which gains the attribute.
- `agreement.test.ts`, `ad36.test.ts`.
- `packages/library/src/validate.ts`: the mode regex `:1312` (design sources never name a mode) and the `data-helper` argument
  rule. Read before adding the `data-site-logo` refusal.

**The compiler — `packages/theme-compiler/src/compile.ts`:**
- `CompileInput.darkEnabled` `:107-108`, used today only for the hook `:777`.
- `packageJson` `:262-286`: `custom` omitted when empty `:282`.
- `customSettings` `:658-693` (cap `:660`, keys `:661-664`, entries `:680-691`, record `:692`).
- `packTokensCss(…, { ghostFonts, settingAccent })` `:734`.
- `default.hbs` `:901-933`: the faces `:910`, 7.10's guarded accent `<style>` `:916-920`, the stylesheet `:921`, the body
  `:928`.
- `checkGhostMarkup` rule 2 `:436` needs only the class to START with `{{body_class}}`.
- The last assertion `:1010-1017`, `READER` `:707-709`.

**Tests that pin today's bytes. Move each on purpose, never silently.** All are in `compile.test.ts`:
- `:241` the bare body
- `:670`, `:812`, `:1014`, `:1021` head adjacencies
- `:817`, `:1365` "default.hbs names no mode"
- `:1364` the accent element's bytes
- `:1372-1373` the dark blocks with and without the accent, and no `@custom` without settings
- `:486-518`, `:516` `package.json` with no `custom`
- `:1317`, `:1324`, `:1391`, `:1395` 7.10's `custom` rows
- `:1240`, `:1244`, `:1248` plant a defect by `replace('<body class="{{body_class}}">', …)`, which would go VACUOUS once that
  line changes. Re-anchor each and assert the replace changed the text.

**The gate:**
- `gate/custom-settings.test.ts`: `compiledWithSettings` `:199-212`, the keys list `:219`, 20 vs 21 `:72-77`.
- `gate/gate.test.ts:177-205` (a GS100 fixture already carrying the three built-ins: prior art).
- `gate/quality.ts`: a block in an attribute reads as its first branch `:200-226`, and `<style>` is raw text `:91`. Proven on
  Casper's `<html>` chain at `quality.test.ts:237-239`.
- `gate/verdict.ts:87-98` (`setting_unused`).

**CI rows:**
- `tools/pilot-theme.mjs` `compilePilots` `:204-219`, `pilotSettings` `:179-197`.
- `tools/check-snapshots.mjs`: pilot gscans `:762-783`, `:1172-1184`, the body plant `:1064-1065`, 7.10's settings compile
  `:1284-1300`. **`:1314-1318` "declares no config.custom" is rewritten for this story.**

**Chromium:** `tools/keyboard/mode.spec.mjs`: `ruled` `:42-46`, the truth table `:61`, scripts off `:98`. Its header says the
compiled theme is not proved there.

**T1:**
- `tools/probe/record-theme-assembly.py`: `SECTION = '78'` `:203`; 7.10's rows `settings_compiled`/`settings_phase`
  `:1287`/`:1325`.
- **§78 invariants this story changes:** the bare tree declares nothing `:1320`, `listed() == {}` `:1369`, and the start
  tree's six keys `:1315-1317`.
- `tools/probe/record-mode-resolution.py` (§69; its pin came from `{{#is}}`, never `@custom.color_scheme` — docstring
  `:28-30`) holds the browser checks to reuse.
- Read docstrings only. A recorder's `--help` runs a real upload.

**Documents:**
- `epics.md:3524-3561` (this card), `:2886-2995` (Epic 7's preamble), Story 7.18's card, Story 10.93's card (`:7557`).
- `prd.md:365` (FR-Q4), `:366` (FR-Q5), FR-D7 `:225`, FR-E4 `:257-261`.
- `ARCHITECTURE-SPINE.md` AD-17 `:222-226`, AD-30 `:353-365`.
- MEASUREMENTS §5, §15c `:632`, §28, §69, §78 `:5724`.
- `tools/stress/build.js:140-200` (prior art, spelled `dark_accent_colour`).

## Tasks & Acceptance

**Execution:**

- [x] `packages/section-runtime/src/custom-settings.ts`, `custom-settings.test.ts`:
  - `builtInSettings({ pack, darkEnabled })` returns the three rows in `RESERVED_SETTING_KEYS`' order, each labelled
    `ghostName(key)`, `site_wide`, with no condition: `color_scheme` (select, options `Auto`/`Light`/`Dark`, default
    `SCHEME_START[mode]`), `dark_accent_color` (color, default `pack.dark.accent`) and `dark_logo` (image, no default).
  - `SCHEME_START` is § The starts' one table.
  - The comment on `RESERVED_SETTING_KEYS` says 7.11 confirmed AD-17's names.
  - Tests: each row's `ghostEntry`, both starts, and `USER_SETTING_CAP` unchanged.

  -- one module for every fact about a built-in.
- [x] `packages/section-runtime/src/tokens.ts`, `tokens.test.ts`:
  - Export `SCHEME_CLASS` (`light: 'scheme-light'`, `dark: 'scheme-dark'`) and rebuild `MODE_SELECTORS` from it, with its
    bytes unchanged.
  - Export `SETTING_DARK_ACCENT = '--setting-dark-accent'` and `SETTING_DARK_LOGO = '--setting-dark-logo'`.
  - `packTokensCss(pack, { …, darkSettings: true })`:
    - In both dark blocks, every value the dark accent FEEDS that is or contains the pack's dark accent reads
      `var(--setting-dark-accent, <hex>)`. This is `followAccent` generalised to a mode, so Mono keeps its text.
    - Under each of `MODE_SELECTORS`' two dark conditions it writes one rule, `<condition> [data-site-logo] { content:
      var(--setting-dark-logo); }`.
  - With no option, the bytes are today's.
  - Tests: the canvas call is unchanged, the light block is untouched by `darkSettings`, the dark values hold for every
    preset and Mono, and the logo rule appears under each dark condition and nowhere else.

  -- AD-17's "feed the same token block E6 owns", inside AD-30's one file.
- [x] `packages/section-runtime/src/core.ts`, `agreement.test.ts`, `ad36.test.ts`, `packages/library/src/validate.ts`:
  - An `<img>` whose `src` binds `@site.logo` carries `data-site-logo` on BOTH emitters.
  - The validator refuses a design that writes `data-site-logo` itself, and Dev checks the name collides with no directive
    and no leak assertion.
  - A1 #1's snapshot updates.
  - The validator's refusal of an argument to `data-helper` (`comments mode=dark`) is asserted.

  -- the one hook the dark logo's rule selects, the same on every design that prints Ghost's logo.
- [x] `packages/theme-compiler/src/compile.ts`, `compile.test.ts`:
  - `customSettings` appends `builtInSettings` after the user's entries, and `record.emitted` lists all of them.
  - `config.custom` is always present.
  - `<body>`'s class is the `color_scheme` chain after `{{body_class}}`: the Light and Dark branches write
    `SCHEME_CLASS`, Auto writes nothing.
  - `default.hbs` writes ONE settings `<style>` after the faces' element and before the stylesheet. It replaces 7.10's
    guarded element and holds `:root{` and each declaration guarded:
    - 7.10's `--setting-accent`, when promoted;
    - `--setting-dark-accent` from `{{#if @custom.dark_accent_color}}…{{else if <the promoted accent's path>}}…{{/if}}`,
      where the `else if` is written only when the accent is promoted;
    - `--setting-dark-logo: url("{{@custom.dark_logo}}");` inside `{{#if @custom.dark_logo}}`.
  - Then `}`.
  - `packTokensCss(…, { darkSettings: true })`.
  - Tests: the matrix's compile rows, both starts, determinism, every pin in the Code Map moved on purpose, and the three
    re-anchored plants failing as they should.

  -- the readers are the mechanism (AD-17), so GS100 cannot fire.
- [x] `packages/theme-compiler/gate/custom-settings.test.ts`:
  - A compiled Light-only theme and a Light + Dark one each score 0/0 on both pins with an empty `qualityGate`.
  - 17 user settings plus the 3 pass, and the keys list carries the built-ins.
  - Controls: each built-in's reader removed is `GS100` naming that key, and `color_scheme` matched against a label that is
    not an option is `GS090-NO-UNKNOWN-CUSTOM-THEME-SELECT-VALUE-IN-MATCH`.

  -- the card's "gscan on a Light-only fixture, both specs", each claim behind a control that fails (standing rule 2).
- [x] `tools/pilot-theme.mjs`, `tools/check-snapshots.mjs`:
  - Row `:1314-1318` becomes "the pilot compile without settings declares exactly the three built-ins and reads each".
  - A Light-only pilot compile is gated 0/0 on both pins with the quality verdict empty.
  - Every per-design snapshot is unchanged, except A1 #1's attribute.

  -- CI holds the real library on every commit.
- [x] `tools/keyboard/mode.spec.mjs`: a 7.11 test over the THEME's token block (`packTokensCss` with the theme options), set
  into a page:
  - Under every combination of device, pin and visitor: `--accent` and its fed values equal the dark accent property when
    dark resolves and it is set, and equal the pack's otherwise.
  - A stamped `<img>`'s computed `content` is the dark logo exactly when dark resolves and the property is set, and
    `normal` otherwise, with the picture's pixels changing accordingly.
  - Run in Chromium. Run the same page in Firefox and WebKit from a scratchpad install, record the result, and never commit
    a second browser.

  -- the chains, executed in a browser (standing rule 1).
- [x] `tools/probe/record-theme-assembly.py`, `SECTION = '79'`:
  - Upload the pilots compiled Light-only. `GET custom_theme_settings/` lists the three at their starts.
  - `/` carries `scheme-light`.
  - A `PUT` of `color_scheme` Auto, then Dark, changes the class, and the page resolves dark under the pin (reuse §69's
    browser check).
  - A `PUT` of `dark_accent_color` reaches the head and `--accent` in dark.
  - With T1's site logo set to a probe picture for the run (read first, restored after), a `PUT` of `dark_logo` draws it in
    dark and Ghost's logo in light.
  - Upload Light + Dark: `color_scheme` keeps its stored value under the new start (the Question 2 fact, re-executed).
  - Casper, the logo and the stored settings are restored and read back.
  - §78's rows expect the built-ins.
  - Written and gated locally at Dev, run in the main session on the owner's in-session go, recorded as MEASUREMENTS §79.

  -- R-82: Ghost renders what the compile wrote.
- [x] Propagation:
  - `prd.md` FR-Q5, with dated notes: the starts as ruled, the comments reading, and the logo's mechanism.
  - FR-Q4: the canvas previews the compiled default — the pack's dark accent, which Ghost seeds and never empties — as
    7.10's criterion already says.
  - AD-17 (keys confirmed, the mechanism) and AD-30 (the body class is the pin's signal; no style rule outside the token
    block names a mode).
  - MEASUREMENTS §79, and a dated note on §15c (comments-ui's `auto`, § Facts).
  - `docs/section-authoring.md`: the stamp, which is never authored; a helper takes no argument; the comments box's parent
    must compute its colour as `rgb()`.
  - `tools/stress/build.js`'s `dark_accent_colour` → `dark_accent_color`.
  - `epic-7-context.md` sub-bullets.
  - Story 7.18's card carries Question 2's sentence word for word, with Epic 7's preamble list (R-195). This landed with the
    ruling at Create (2026-10-14); Dev re-reads it and changes nothing unless the build moves a fact.
  - End with a grep for `dark_accent_colour` and "names no mode" (standing rule 7).

  -- propagate, never localise (standing rule 3).

**Acceptance Criteria:**

- **No compiler special case.** Given any project, when it compiles, then `config.custom` declares `color_scheme`,
  `dark_accent_color` and `dark_logo` with § The starts' values, after any user setting, and `default.hbs` reads all three.
  A Light-only project takes the same path, with only `color_scheme`'s start different.
- **Real fallback logic.** Given the compiled theme, when Ghost holds a value, then:
  - `color_scheme` writes the body class `MODE_SELECTORS` reads;
  - the dark accent reaches every dark value the pack's dark accent feeds, and falls back to the promoted light accent,
    then to the pack's;
  - the dark logo replaces Ghost's logo in dark, and falls back to it, then to the wordmark.
- **Works with no redeploy.** Given a deployed theme, when its owner changes any of the three in Ghost Admin, then the page
  changes on its next load (MEASUREMENTS §79).
- **GS100 never fires.** Given both pinned gscans and `qualityGate`, when they score a compiled Light-only and Light + Dark
  theme, then each is 0/0 / empty. A removed reader fails with `GS100` naming its key.
- **AD-30.** Given the theme's files, when they are searched for a mode, then only the token block's rules name one, and
  `default.hbs` names the pin's two class names only inside `<body>`'s `color_scheme` chain.
- **One selector.** Given a design with comments, when it compiles, then `{{comments}}` carries no `mode=`, and no design or
  control can pass one (R-34).
- **The canvas is unchanged.** Given the canvas, when it renders, then its token block is byte-identical and a site-logo
  picture carries `data-site-logo`.
- **AD-36.** Given a hostile dark logo, when the head renders, then it is inert beside a legitimate value that draws.

### Review Findings (2026-10-14)

Five layers ran: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the real-infra verifier (T1 read
only, Ghost's source, the local compile, both gscans and Chromium), with CI and Vercel read in the main session (R-82) —
results under § Verification. Every finding was read in the code before it was rated.

- [ ] [Review][Decision] A Dark logo address carrying a line break adds CSS rules, which the approved AD-36 line ("cannot
  close the string") and the matrix row "A hostile dark logo" ("no rule … is created") say cannot happen. Dev kept it as a
  routine call while titling it "for the owner", and the frozen words are the owner's, so it is **Question 3**
  [compile.ts `settingsStyle` · § Boundaries AD-36 · the matrix row]
- [x] [Review][Patch] Only `--accent` was pinned among the values the Dark accent color feeds, so the button fill and the
  link could stop following it with every check green. The fed set is now derived independently — the tokens a nudge of
  the pack's accent moves and that carry its hex — for every pack in both modes, Paper's pinned by name, and its control
  (the dark follow narrowed to `--accent`) goes red [tokens.test.ts]
- [x] [Review][Patch] The keyboard gate's logo check compared the first 40 characters of the address, which the light
  and dark squares share, so only the pixels told the two apart; it compares the whole address both ways [mode.spec.mjs]
- [x] [Review][Patch] The dark accent's fallback to a promoted accent was a string pin only; it is rendered through
  Handlebars 4.7.9 in all three states — set, missing with the accent promoted, neither [compile.test.ts]
- [x] [Review][Patch] "A user's condition can never name a built-in" had no test; each of the three is refused with
  7.10's sentence [compile.test.ts]
- [x] [Review][Patch] The ceiling's permission fact was read in Ghost 6.58.0 alone, and FR-Q5 cited §28's "a staff
  session", which an Editor also has. 5.130.6's `fixtures.json` was read at Review (Administrator only, no integration)
  and the fact replaces the citation [compile.ts, compile.test.ts, prd.md FR-Q5]
- [x] [Review][Patch] "Ghost's uploads carry neither `&` nor `=`" was asserted; it is cited (`ghost-storage-base`'s
  `getSanitizedFileName`, both majors), and the cost of an address that cannot load — an empty box in dark, executed in
  Chromium — is stated beside it [compile.ts, compile.test.ts]
- [x] [Review][Patch] AD-36 had no record of a value reaching CSS at runtime un-validated; its instance list carries the
  Dark logo, the ceiling, the permission fact and what would reopen it [ARCHITECTURE-SPINE.md AD-36]
- [x] [Review][Patch] Places that still said the old thing, each given a dated note: AD-17's re-proof pointed at
  `tools/stress/`; AD-30's theme token call lacked `darkSettings` and its "nothing else … names a mode" had no note;
  `tokens.ts` called the token block the one file that names a mode; Story 7.10's card said an unset dark accent
  previews as the light one and that `screen.css` is the one file naming a mode [ARCHITECTURE-SPINE.md, tokens.ts,
  epics.md]
- [x] [Review][Patch] The recorder could write into T1's own theme and mislead its own restore: the `finally` put the
  starts back into whichever theme was active (Casper declares a `color_scheme` of its own), a run that died after setting
  the probe's logo left the next run "restoring" to it, and the put-back was printed rather than checked. It puts back only
  into the probe, refuses to start on a leftover logo, and asserts the put-back as a CONTROL [record-theme-assembly.py
  `built_ins_phase`]
- [x] [Review][Patch] §79's start rows read back the run's own put (Ghost keeps a deleted theme's values), which "a Light
  only site starts pinned Light" did not say; a dated note in §79 says how to read them, and the recorder's wording says so
  from its next run [MEASUREMENTS §79, record-theme-assembly.py]
- [x] [Review][Patch] `check-snapshots` kept its own copy of the three keys; it reads `RESERVED_SETTING_KEYS`
  [check-snapshots.mjs]
- [x] [Review][Patch] The emitted-CSS lint read a compile with no promoted accent, so the `{{else if}}` branch never
  reached it; it lints the settings compile too, and refuses if that compile writes no `{{else if}}` [check-baseline.mjs]
- [x] [Review][Patch] Story 7.18 had no named source for "each built-in whose start has changed": `builtInSettings` over
  the last deploy's pack and mode and the new ones, since `CustomRecord` carries keys only [epic-7-context.md]
- [x] [Review][Defer] The dark logo's swap is checked in Chromium alone on every push; Firefox and WebKit ran once by
  hand — owner Story 15.1 [mode.spec.mjs, playwright.config.mjs] — deferred, DW-357
- [x] [Review][Defer] A header printing `@site.logo` on a ground of the other mode (a contrast band) would draw the wrong
  logo; A1 #1 offers no such ground — owner Epic 9, beside `logoLight` [deferred-work.md] — deferred, DW-150 (note added)
- [x] [Review][Defer] CI's `check` went red on the Dev head at the R-236 journey row (`#pack-editor-title` not found) with
  no screen changed, so the Dev head never deployed; it passed here cold — owner Story 15.1 [journey.spec.mjs:1736] —
  deferred, DW-350 (its fifth recurrence)

Dismissed, each read in the code: a Dark logo set on a site with no logo shows the wordmark (the frozen matrix row, and a
reading told to the owner at Create); a hint under Dark logo in Ghost (new words, which § Never rules out); T1 never read
Auto on a dark device (Ghost's half — no class under Auto — held on T1, and the CSS is the truth table's on every device);
Question 2's pack switch not run as such (§78 executed a stored value kept under a changed start, which a pack switch is);
the cap proved on a hand-built `package.json` (gscan reads only `config.custom`, and the compile's order and record are
pinned); the comments box's parent computing `rgb()` (DW-356's, Story 10.93); the Firefox/WebKit claim (already worded as
a dated one-off in AD-17 and here); dropping the promoted-accent fallback (the frozen matrix asks for it); a two-source logo
(Question 3's option 2); line numbers in the Code Map (Create's convention); `doc-audit --check` unrecorded at Dev (the
pre-commit hook ran it; the Review records it).

## Spec Change Log

- **Dev, 2026-10-14 — a line break in a Dark logo value adds CSS rules (a ceiling, for the owner).** § Boundaries' AD-36
  line says Handlebars writes `"`, `<` and `>` as entities so the value cannot close the string or the element. It cannot
  close the element; but Handlebars leaves a line break as it is, and a line break ends a CSS string (a bad-string token),
  so a value carrying one — `x\n");}#p{display:none}` — adds a CSS rule after `:root`'s. Executed in JSDOM
  (`compile.test.ts`, pinned as the ceiling) and in Chromium (`#p` computed `display: none`). Never an element or a
  script. Ghost does not validate an image setting, but only a staff session writes `custom_theme_settings` (§28: an
  integration token is refused) and an Administrator already holds Code Injection, so no one gains a power they lack. The
  matrix's own hostile value (no line break) is inert, as the row says. The Create's "§28 executed `url({{@custom.dark_logo}})`
  against hostile values" is narrower in the record: §28 executed colour values only. Built as written (the spec names the
  `url("…")` form). A second, harmless ceiling: Handlebars also writes `=` and `&` as entities, so a URL with a query
  string reaches CSS altered and does not load — Ghost's uploads carry neither.
  **Kept, as a routine call (main session, Dev, 2026-10-14):** read in Ghost 6.58.0's source
  (`core/server/data/schema/fixtures/fixtures.json`, the npm tarball, read only), `custom_theme_setting` is granted to the
  Administrator role alone — not Editor, Super Editor, Author, Contributor or any integration, Admin Integration included
  — and the Owner holds every permission. Whoever can write the Dark logo can already add any script to every page through
  Code Injection, so the ceiling gives nobody a power they lack; it is stated beside the code (`compile.ts`) and pinned in
  `compile.test.ts`, and no question goes to the owner. A future writer of `dark_logo` that is not an Administrator — an
  Inflozo write to Ghost, which AD-10's allowlist forbids today — would reopen it.
- **Dev, 2026-10-14 — the browsers.** `mode.spec.mjs`' 7.11 test passed in Chromium (the gate), and the same page passed
  in Firefox and WebKit from a scratchpad install (Playwright 1.61.1's `firefox-1532` and `webkit-2311`, WebKit's
  missing system libraries unpacked from Ubuntu's own `.deb`s beside it) — `content` replaces an `<img>`'s picture in all
  three, so § Ask First's halt did not apply. Nothing of the second browsers is committed.
- **Dev, 2026-10-14 — the recorder's §78 invariants moved for the built-ins** (every tree now declares the three after the
  user's settings, which the bare tree cannot clear), so the 7.10 phase puts them back to the bare tree's starts at its
  start and in its `finally`; the 7.7 cascade probe now adds its setting beside the built-ins instead of replacing
  `config.custom`. The local half gated every tree 0/0 on both gscans; the T1 run (§79) is the main session's.
- **Review, 2026-10-14.** Five layers; the findings and their dispositions are § Review Findings. The line-break ceiling
  above is **Question 3**, the owner's: the frozen § Boundaries AD-36 line and the matrix row "A hostile dark logo" stand
  as approved until he rules, and this log is the record of where the build departs from them. The permission fact is now
  read in both majors (5.130.6's `fixtures.json` too), and "Ghost's uploads carry neither" is read in `ghost-storage-base`
  (1.0.0 and 3.0.0). No compiled byte changed at Review, so §79 on T1 stands for this tree; no T1 write was made.

## Design Notes

### Rulings this spec is written to

Both were ruled by the owner on 2026-10-14, each the recommended option, so the spec stands as written.

| Question | Ruled (owner, 2026-10-14) | Rows it governs |
|---|---|---|
| 1 — which mode a site starts in | option 1: Light + Dark starts **Auto**, Light only starts **Light** | § The starts; the matrix's first two rows; the recorder's first rows |
| 2 — what a later Style Pack or mode change does to a deployed site | option 1: Story 7.18's Pre-flight says it — on its card word for word since the ruling | the propagation task's Story 7.18 line |

### The starts (one table; `SCHEME_START` and `builtInSettings` read it)

| Key | Ghost shows | Type | Start |
|---|---|---|---|
| `color_scheme` | Color scheme | select: `Auto` · `Light` · `Dark` | Light + Dark: `Auto`; Light only: `Light` (Question 1) |
| `dark_accent_color` | Dark accent color | color | the pack's dark accent (`pack.dark.accent`; Paper `#E0805A`) |
| `dark_logo` | Dark logo | image | none (Ghost forbids an image default) |

### What `default.hbs` carries (Paper, the accent promoted as `accent_colour`)

```hbs
    <style>:root{
      {{#if @custom.accent_colour}}--setting-accent: {{@custom.accent_colour}};{{/if}}
      {{#if @custom.dark_accent_color}}--setting-dark-accent: {{@custom.dark_accent_color}};{{else if @custom.accent_colour}}--setting-dark-accent: {{@custom.accent_colour}};{{/if}}
      {{#if @custom.dark_logo}}--setting-dark-logo: url("{{@custom.dark_logo}}");{{/if}}
    }</style>
  …
  <body class="{{body_class}}{{#match @custom.color_scheme "=" "Light"}} scheme-light{{else match @custom.color_scheme "=" "Dark"}} scheme-dark{{/match}}">
```

The token block's dark blocks then read `--accent: var(--setting-dark-accent, #E0805A);` (and each fed value the same way),
plus `… [data-site-logo] { content: var(--setting-dark-logo); }` under each dark condition. An unset `var()` with no
fallback makes `content` compute to `normal`, which is the picture's own `src`.

### Readings told to the owner, one line each

- **The keys stay as the architecture names them.** Ghost shows "Color scheme", "Dark accent color" and "Dark logo".
  - A promoted accent keeps 7.10's "Accent colour", spelled as Inflozo spells it.
  - Ghost's Design panel lists the three after your promoted settings.
- **Comments need no setting of their own.** Ghost's comments box reads the colour of the words around it and draws itself
  light or dark to match. So it follows the site's mode, a dark band included, with no `mode=` written (§ Facts). Writing
  the mode from the setting would draw dark words on a dark band.
- **A dark logo needs Ghost's logo to replace.** With no site logo, the wordmark shows in both modes. A header's own logo is
  Epic 9's.
- **The dark accent never empties.** Ghost refuses an empty colour. So "falls back to the light accent" only happens if the
  value is missing, and the chain still holds.
- **The canvas previews the starts.** In Dark the canvas shows the pack's dark accent and Ghost's logo, exactly what a fresh
  install shows. FR-Q4's "previews as the light accent" is corrected to that.

### Facts this spec rests on (standing rule 1)

Read in source this Create from Ghost 6.58.0 and 5.130.6's npm tarballs and their pinned gscans (6.4.2, 4.49.7), extracted
fresh in this session's scratchpad (`ghostsrc/g6`, `g5`, `gscan642`, `gscan4497`), read-only. Unless noted, the lines are the
same in both versions.

- **`{{comments}}`** takes only `mode`, `saturation`, `count` and `title`.
  - `mode` is honoured only as the lowercase `dark` or `light`. Anything else, or nothing, is `auto`
    (`core/frontend/helpers/comments.js:26-29`). It is written as `data-color-scheme` on the script tag
    (`core/frontend/utils/frontend-apps.js:20-34`).
  - Casper and Source call it bare (Casper `post.hbs` 6:94 / 5:91, Source `post.hbs` 6:62 / 5:57).
- **comments-ui's `auto`** reads the computed text colour of the script's own parent. Below 5:1 contrast against white it
  draws dark.
  - It re-reads only when that parent's `class` or `style` changes (a `MutationObserver`).
  - It paints no ground of its own.
  - Sources: `@tryghost/comments-ui` 1.6.445 (Ghost 6 loads `~1.6`, `defaults.json:322-325`) and 1.2.6 (Ghost 5, `~1.2`,
    `:224-227`), `umd/comments-ui.min.js`, minified.
  - A mid-visit toggle or device switch therefore leaves it stale until reload. That is DW-356, Story 10.93's.
- **A colour is never empty.** `updateSettings` checks `/^#[0-9a-f]{6}$/i` (`custom-theme-settings-service.js` 6 /
  `CustomThemeSettingsService.js` 5, `:127-133`).
  - An image or a text is not validated.
  - A stored image renders as an absolute URL (`core/server/models/custom-theme-setting.js:22-25`).
  - A condition-hidden setting renders `null` (`:14`).
- **Ghost seeds a new key from its default and keeps a stored value across a new default** (6: `:242-260`; 5: `:203-221`).
  Executed on T1 at §78 (Medium kept under a new start of Display). This is Question 2.
- **gscan** requires a select's, a boolean's and a colour's default, and forbids an image's (`010-package-json.js:184-206`,
  both pins). `GS100` fires on a declared key no template reads, and a `{{#if}}` guard or a partial counts as a read
  (MEASUREMENTS §5).
- **Ghost writes no colour-scheme class** (`helpers/body_class.js`) and has no site-level dark logo or scheme
  (`core/shared/settings-cache/public.js`).
  - Casper's own `color_scheme` (`Light`/`Dark`/`Auto`, default `Light`) writes a class on `<html>`.
  - Inflozo's pin is a `<body>` class by FR-E4.
- **MEASUREMENTS §28** executed a `<style>` holding `{{@custom.accent_colour}}` and `url({{@custom.dark_logo}})` against
  hostile values, and they held. **§69** executed the pin's precedence on T1, with the body class written by a probe
  `{{#is}}`.

Hypotheses, executed at Dev: an `<img>`'s computed `content` replaces its picture in Chromium (the truth table), and in
Firefox and WebKit if Playwright can install them (Ask First if not). Every matrix row on T1 (§79). Nothing of Ghost 5 is
executed (R-238, DW-326).

## Questions for the owner

Questions 1 and 2 were raised at this story's Create and ruled by the owner in chat on 2026-10-14, each the recommended
option (1 and 1). The spec is written to those rulings (§ Rulings this spec is written to). Story 7.18's card and Epic 7's
preamble carry Question 2's sentence word for word (R-195). **Question 3 was raised at Review (2026-10-14) and is open.**

### Question 1 — Which mode a new site starts in

**In plain English.**
- Every theme Inflozo builds now carries a **Color scheme** setting in Ghost: **Auto** (each visitor's phone or computer
  decides), **Light** or **Dark**.
- Your theme sets where it starts on your first deploy. Your site's owner can change it in Ghost at any time, with no
  redeploy.
- Projects come in two kinds, **Light + Dark** and **Light only**. Which start does each kind get?

**Example.** A visitor whose phone is set to dark mode opens a site built from a **Light only** project. With option 1 they
see it light, as you designed it. With option 2 they see your Style Pack's dark colours, without the per-section dark looks
a Light only project never had.

1. **Light + Dark starts on Auto; Light only starts on Light.** Each site starts the way its project was designed.
   **(RECOMMENDED)**
2. **Both start on Auto.** Light only sites also go dark for dark-mode visitors, using the Style Pack's dark colours.
3. **Both start on Light.** No site shows dark until its owner picks Auto or Dark in Ghost.

**Ruled: option 1 (owner, 2026-10-14).**

### Question 2 — After your first deploy, Ghost keeps the dark accent and the colour scheme it stored

**In plain English.**
- Ghost stores each setting's value at your first deploy and keeps it from then on. A later deploy with a new starting
  value does not replace it: Story 7.10 tested this on the test Ghost.
- So if you later switch Style Pack, your live site's dark accent stays the old pack's.
- And if you switch a Light only project to Light + Dark, your live site stays on Light.
- Either way, it lasts until your site's owner changes it in Ghost.

**Example.** You deploy with **Paper**, whose dark accent is orange (#E0805A), then switch to **Ocean** and deploy again.
Your light colours and the rest of the dark colours change to Ocean's, but in dark mode the accent is still Paper's orange.

1. **Say it at deploy.** Story 7.18's deploy check names each of the two whose starting value has changed since your last
   deploy, says what Ghost keeps, and links to Ghost's Design panel. This is added to Story 7.18 word for word. Nothing
   writes to your site that does not today. **(RECOMMENDED)**
2. **Inflozo updates Ghost's value at deploy, but only while your site's owner has never changed it.** This needs one new
   kind of write to your Ghost site (with the Staff Access Token), built in Story 7.18. Without that token, it says it as in
   option 1.
3. **Leave it unsaid.**

**Ruled: option 1 (owner, 2026-10-14).**

### Question 3 — A Dark logo address with a line break in it can add page styles

**In plain English.**
- In Ghost's Design panel your site's owner uploads a **Dark logo**. Ghost stores the picture's address, and the theme
  writes that address into the page's styles.
- If someone types that address by hand through Ghost's API and puts a line break in it, the text after the break becomes
  page styles of their own, on every page. It can hide or recolour things. It cannot add a script, a link or any other
  element.
- Only a Ghost **Administrator** or the **Owner** can change that setting (checked in Ghost 5's and Ghost 6's own code).
  Both can already add any script to every page through Ghost's **Code Injection**, so nobody gains a power they do not
  already have.
- The spec you approved says a bad address "creates no rule". That is wrong for this one case, and I can't change words
  you approved without you.

**Example.** An Administrator saves the Dark logo through the API as `x`, then a line break, then `");}main{display:none}`.
Every page then hides its main content. The same Administrator can already do exactly that by pasting
`<style>main{display:none}</style>` into Code Injection.

1. **Accept it as a stated limit.** I correct the two sentences in the spec. The limit stays written beside the code and
   in the architecture's safety rule (AD-36), with the one thing that would reopen it: Inflozo itself ever writing that
   setting. Nothing changes for visitors. (An address Ghost never makes for an upload, one with `?…=` in it, would also
   show an empty box in dark.) **(RECOMMENDED)**
2. **Remove it by drawing the Dark logo as a second picture.** Every design that prints your site's logo gets a second,
   hidden picture that shows in dark; a line break in a picture's address does nothing. This reworks this story's logo
   half, the canvas and A1 #1, and needs a new run on the test Ghost.
3. **Remove it with a small script.** The theme's script sets the Dark logo safely. Visitors with scripts turned off
   would see the normal logo in dark.

**Ruled:** _(awaiting the owner)_

## Verification

No owner test (`owner_test: none`): this story changes only the theme Inflozo builds. Story 7.18's deploy is the first time
it reaches a screen, and the test Ghost proves it here.

**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package's tests green — `custom-settings.test.ts`, `tokens.test.ts`,
  `agreement.test.ts`, `ad36.test.ts`, `validate.test.ts`, `compile.test.ts`, `gate/custom-settings.test.ts` (both pins,
  each control failing its own code), `quality.test.ts`, `ghost-admin-rule.test.ts` (unchanged) — and
  `tools/check-snapshots.mjs`' rows. Each runner prints its own count.
- `pnpm keyboard` -- expected: green, `mode.spec.mjs`' 7.11 test included and turned red by its fix reverted.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green.
- `bash supabase/tests/run-rls-gate.sh` -- expected: passes unchanged (no SQL).
- `python3 tools/probe/record-theme-assembly.py`'s local half (read its docstring first, because `--help` uploads) --
  expected: the local gate 0/0 on both gscans for the Light-only and Light + Dark trees.

**Real infrastructure (R-82):**
- **T1** (Dev, main session, the owner's in-session go): §79 as the recorder task states, recorded in MEASUREMENTS. Keys are
  read by `shim.load_env()` (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`) and never printed.
- **Production** (Review): CI `check`/`rls`/`deploy` and the render matrix green, and Vercel READY at the Dev head. Nothing
  else changes for a visitor or a customer until Story 7.18.
- **Not touched, and why:**
  - Supabase gets no migration.
  - Resend and Dodo: nothing mails or bills.
  - T3 is retired (R-238).

### Dev results (2026-10-14)

**Commands, run on the final tree (Node 24.18.1):**
- `pnpm check` — exit 0. Every 7.11 test is in its output and passed, in `custom-settings.test.ts`, `tokens.test.ts`,
  `agreement.test.ts`, `ad36.test.ts`, `validate.test.ts`, `compile.test.ts` (with the 7.2 `package.json` row and 7.10's
  accent row moved on purpose) and `gate/custom-settings.test.ts` (both pins), and `check-snapshots`' 7.11 rows, the Light
  only pilots 0/0 on gscan 4.49.7 at `v5` and 6.4.2 at `v6` among them.
- `pnpm build` — exit 0 (Theme settings' client bundle now carries `tokens.ts` and `colour.ts` through `SCHEME_CLASS`;
  both are pure).
- `pnpm keyboard` — green, `mode.spec.mjs:317` (the 7.11 test) included. **Control:** with `packTokensCss`' `darkSettings`
  forced off, the same test fails — `paper: the dark block reads the dark accent nowhere` — and `tokens.ts` was restored
  byte for byte (`cmp`).
- Firefox and WebKit (Playwright 1.61.1 in the scratchpad, never committed): the same page passed in both, so CSS
  `content` replaces an `<img>`'s picture in all three engines and § Ask First's halt did not apply.
- `bash supabase/tests/run-rls-gate.sh` — exit 0, unchanged (no SQL).
- The recorder's local half (inside the T1 run, before any upload): `built-ins-light_only` and `built-ins-light_dark` each
  0 errors / 0 warnings on gscan 4.49.7 (`v5`) and 6.4.2 (`v6`), with an empty quality verdict, as is every earlier tree.

**Real infrastructure (R-82):**
- **T1** `ghost6.inflozo.com` (6.58.0), on the owner's go in this session (2026-10-14), run in the main session:
  `python3 tools/probe/record-theme-assembly.py` read `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN` and `GHOST6_CONTENT_API_KEY`
  through `shim.load_env()`, never printed, and exited 0 with every row held behind its controls — MEASUREMENTS §79.
  What T1 returned for this story:
  - `GET /ghost/api/admin/custom_theme_settings/` listed exactly `color_scheme` (select, `Light`), `dark_accent_color`
    (color, `#E0805A`) and `dark_logo` (image, none) for the Light only upload.
  - `/` carried `scheme-light`. After `PUT` Auto it carried no scheme class, and after `PUT` Dark it carried `scheme-dark`.
    Chromium then read `--bg-page #171511` and `--accent #E0805A` (Paper's dark) on a light device and a dark device alike.
    The controls held: the media query reported each emulated device, and `--accent` read empty with the stylesheets off.
  - `PUT dark_accent_color #3366FF`: the head's settings `<style>` carried it, and `--accent` read `#3366FF` pinned Dark.
  - `PUT dark_logo`, with the site's logo cleared: no picture carried the stamp and the header drew its wordmark.
  - Then with the site's logo set to `/content/images/2026/10/inflozo-probe-rendition.png` (`PUT /ghost/api/admin/settings/`):
    the logo picture carried `data-site-logo`. Pinned Dark, its computed `content` was the Dark logo's `url(…)` while its
    `src` stayed Ghost's logo. Pinned Light, `content` was `normal` on both devices.
  - A Light + Dark redeploy (start `Auto`) kept the stored `Light`, `#3366FF` and the Dark logo, and `/` stayed pinned Light
    (Question 2's fact, re-executed).
  - Restored and read back: the built-ins at their starts, the site's logo back to none (the CONTROL row), Casper active,
    and the probe themes deleted (installed: `casper`, `racer`, `source`).
  - The same run re-ran §70–§78's rows on today's compile: all held, §78's with the built-ins beside the promoted settings.
- **Production:** untouched at Dev. CI and Vercel are the Review's reads, at the Dev head.
- **Not touched:** Supabase (no migration), Resend and Dodo (nothing mails or bills), T3 (retired, R-238).

### Review results (2026-10-14, main session, Node 24.18.1)

**Commands, on the Review tree:**
- `pnpm check` — exit 0. Every 7.11 row passed, the review's new ones among them: `tokens.test.ts`' independently derived
  fed set, `compile.test.ts`' rendered dark-accent chain and the three conditions naming a built-in, and `check-baseline`'s
  emitted-CSS row over the settings compile (no warning). Each runner prints its own count.
- **Control for the fed set (standing rule 2):** with the dark follow narrowed to `--accent` in `tokens.ts`, the new test
  failed `paper dark`; `tokens.ts` was put back byte for byte (`cmp`, `git diff` empty).
- **Control for the logo compare:** the old 40-character check passed on the LIGHT logo's address; the whole-address check
  does not, and passes on the dark one.
- `bash tools/keyboard/run-keyboard-gate.sh -g 'Story 7.11'` — 1 passed, 288 combinations, with the whole-address compare.
- `bash tools/keyboard/run-keyboard-gate.sh -g 'R-236 · the Style Pack panel'` — 1 passed (the row CI failed at Dev).
- `pnpm keyboard`, whole, on the final tree — exit 0, every stop passed, R-236 and the 7.11 mode test among them.
- `python3 tools/doc-audit.py --check`, twice — PASS, no warning.
- Chromium, a scratch page (never committed): an `<img>` whose `content` is a `url()` that cannot load draws the page's
  white at its centre; the same picture with no rule draws its own red. That is the "empty box" stated beside the code.
- `python3 -m py_compile tools/probe/record-theme-assembly.py` — clean. The recorder's changes are guards and wording; it
  was not run on T1 at Review, because no compiled byte changed and no T1 write was asked for.

**Real infrastructure (R-82):**
- **CI at the Dev head `980febcc`** (read with `GITHUB_TOKEN`, in-process): CI run 38601332100 — `rls` success, `check`
  failure at `journey.spec.mjs:1736` (R-236, `#pack-editor-title` not found; 226 stops passed, the 7.11 mode test among
  them), `deploy` skipped. Render matrix run 38601332139 — success. **Nothing of 7.11 reached production at Dev.** It is
  DW-350's fifth recurrence.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): no production deployment for `980febcc`; the newest
  READY is `dpl_DHVcw4abkhd8jfSRt41VvNoJGuEJ` at `ab27d534` (the Create).
- **T1** `ghost6.inflozo.com` (6.58.0), read only, by the real-infra verifier through `record-shim.py`'s `load_env()`
  (`GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`, never printed): `GET themes/` — `casper` active,
  `racer`, `source`, no probe theme left; `GET settings/` — `logo` none; `GET custom_theme_settings/` — Casper's own ten
  (its own `color_scheme` among them), no `dark_accent_color` or `dark_logo`; `GET /` — 200, no `scheme-*` class, no
  stamp, no `--setting-dark-accent`. **Control:** the same read signed with a key Ghost never issued answered `401 Unknown
  Admin API Key`. So §79's restore held.
- **Ghost's source** (npm tarballs, extracted and read only): `fixtures.json` in 6.58.0 and 5.130.6 grants
  `custom_theme_setting` to the Administrator role alone (the Owner holds every permission); 6.58.0's `updateSettings`
  checks a colour against `/^#[0-9a-f]{6}$/i` and leaves an image unchecked; `ghost-storage-base` 1.0.0 (5.130.6) and
  3.0.0 (6.58.0) name an upload with `getSanitizedFileName`, every character but `[\w@.]` to `-`.
- **The verifier's local reproduction:** both trees compiled (Light only twice, byte-identical), both pinned gscans 0/0
  with an empty quality verdict, GS100 and GS090 as controls, the stamp once, the canvas's token block unchanged, AD-36's
  hostile values through Handlebars 4.7.9 and JSDOM, and Chromium's truth table (pinned Dark and Auto on a dark device draw
  the set accent and the dark logo; with the options off nothing follows).
- **Production at the Review head `e824ca30`** (read after the push, the same in-process key reads): CI run 38607428595 —
  `rls`, `check` and `deploy` success (the R-236 row passed this time); Render matrix run 38607428603 — success. Vercel
  `dpl_6qBQy4WAtSh9SE9vecDVL95Nt5M9` READY, target production, aliased to `app.inflozo.com`, `inflozo.com` and
  `www.inflozo.com`; `https://inflozo.com/` and `https://app.inflozo.com/sign-in` answered 200. This is the first push of
  Story 7.11 to reach production; nothing changes for a visitor or a customer until Story 7.18 deploys a theme.
- **Not touched:** Supabase (no migration — no `supabase/migrations/` file in the diff), Resend and Dodo (nothing mails or
  bills), any T1 write, T3 (retired, R-238).

**The I/O matrix, row by row → the check that ran:**

| Row | Check(s) |
|---|---|
| Light + Dark project compiles | `compile.test.ts` "(7.11) a Light + Dark project…"; §79 `light_dark` upload |
| Light-only project compiles | `compile.test.ts` "(7.11) a Light only project…"; `check-snapshots` Light only rows; §79 starts |
| Promoted settings too | `compile.test.ts` "(7.11) the built-ins follow the user's settings…"; `gate/custom-settings.test.ts` 7.10 row (keys + built-ins, 0/0); §78 |
| The pin in Ghost (incl. null) | `custom-settings.test.ts` "the pin's reader" (no `{{else}}`: Auto/null write nothing); `mode.spec.mjs` truth table; §79 Auto/Dark/Light rows |
| Dark accent changed in Ghost | `tokens.test.ts` dark-accent rows (every preset, Mono); `mode.spec.mjs`; §79 `#3366FF` |
| Dark accent absent | `compile.test.ts` "a promoted accent is the dark accent's fallback before the pack's"; `mode.spec.mjs` (unset → the pack's) |
| Dark logo set | `tokens.test.ts` logo rule; `mode.spec.mjs` (computed `content` + pixels); §79 pinned Dark |
| Dark logo unset | `mode.spec.mjs` (`normal`, the light picture's pixels); §79 pinned Light (`normal`) |
| Dark logo, no site logo | `agreement.test.ts` (stamp only inside `{{#if @site.logo}}`; canvas wordmark, no stamp); §79 "the site has no logo" row |
| No design prints a logo | `gate/custom-settings.test.ts` (fixture prints no logo: 0/0, no GS100) |
| User key collides | `compile.test.ts` "(7.11) a user's key equal to a built-in is refused…"; `custom-settings.test.ts` door row |
| At the cap | `gate/custom-settings.test.ts` "the cap with the built-ins" (17 + 3 pass; 18th = `GS010-PJ-CUST-THEME-TOTAL-SETTINGS`); `compile.test.ts` cap row |
| A hostile dark logo | `compile.test.ts` "(7.11) AD-36: a hostile Dark logo is inert…" (the matrix's value inert, a legitimate URL draws; the line-break ceiling pinned — § Spec Change Log) |
| Comments | `compile.test.ts` and `agreement.test.ts` R-34 rows (bare `{{comments}}`; `comments mode=dark` refused) |
| A design authors the stamp | `agreement.test.ts`, `validate.test.ts`, `ad36.test.ts` (`site-logo-attribute`, markup and stylesheet) |
| The canvas | `tokens.test.ts` "the canvas's call and every non-dark byte stand"; `agreement.test.ts` stamp on both emitters; `check-snapshots` (only A1 #1's attribute moved) |
