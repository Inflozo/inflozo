# Epic 5 Context: Editor Shell

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->
<!-- HOW THIS FILE GROWS (DW-73, Story 3.9, 2026-09-11): the bullet is the REQUIREMENT and it stays
     one or two sentences. Everything a story settles goes in an INDENTED SUB-BULLET under it, led in
     bold by the story or ruling that decided it. Append a sub-bullet; never lengthen the lead. -->

## Goal

Build the editor a user designs in — the shell around a same-origin canvas that is the site itself, and everything done on it: inline text, Layers, templates, modes, devices and previews, the design ring, Shuffle and Remix, local-first saving with undo, the edit lock, live Ghost content, the main feed and the membership surfaces. It carries the product's central promise: choosing a design is play, nothing typed or set is ever lost, and the canvas agrees with the shipped theme by construction. **Exit:** the full editing loop on the pilot sections holds 60 fps on the reference laptop and 40-section fixture, and the play-loop gate is green. Epic 7's deploy and export depend on this epic's doc, lock and flush.

## Stories

- Story 5.1: The editor shell, the canvas boundary and the URL scheme
- Story 5.2: Hover, selection and the insertion affordance
- Story 5.3: Inline editing, the four marks and the link picker
- Story 5.4: The Layers panel, reordering, and the two kinds of singleton
- Story 5.5: The template switcher and the synthesised templates
- Story 5.6: Light and dark authoring
- Story 5.7: Device preview, and the canvas as a viewport
- Story 5.8: Undo, redo, and local-first persistence
- Story 5.9: The keyboard map, and keyboard completeness
- Story 5.10: The Section Picker
- Story 5.11: The design ring — navigation, shuffle, and carry / park / default
- Story 5.12: Site Remix
- Story 5.13: The content-source pill and the preview subject
- Story 5.14: Member-state preview, and the nudge that names what I have not looked at
- Story 5.15: Behaviours off while designing, and the Preview toggle
- Story 5.16: Previewing page 2
- Story 5.17: The edit lock and the take-over choreography
- Story 5.18: Live content from the connected site
- Story 5.19: The Data group and the main-feed designation
- Story 5.20: Tier-bound surfaces and the Paywall editor
- Story 5.21: The two Ghost-surface shims on the canvas
- Story 5.22: The editor's responsive floor
- Story 5.23: The play-loop gate

## Requirements & Constraints

- **The canvas is the site.** At rest it is a pixel-faithful render with zero chrome, and nothing on it substitutes a design or decides the page at render — page-dependent choices are build-time facts, and the editor advises (AD-37).
- **Never lose content.** Switching design carries a control both designs declare, parks one only the old design has (restored exactly on return) and defaults one only the new design has; props and list items a design does not show are kept invisibly, and Shuffle and Remix obey the same rule.
- **Only what can work is offered.** Picker, ring, Shuffle and Remix offer only designs whose `bindingContext` and `compileTarget` fit the template or instance (partitioned rings, plus A30's surface partition); invalid bindings are never presented, and non-placeable treatments never appear in Layers, Picker, Shuffle or Remix.
  - **Story 5.10's planning (2026-09-19, read in the source and executed over the library):** `placement.ts` was
    written AT 5.4 for this story — its header names the Picker as the caller `isPlaceable` and `placementRefusal`
    were waiting for — so the rail's absence rule and R-37's refusal both already exist. What does NOT exist is the
    `bindingContext` half: it has **no runtime reader anywhere** and **no template → resource table**, so
    `compileTarget.includes(file)` is the whole filter today and gives the same answer on every design in the repo.
    The table comes from `appendix-b1-template-contexts.md` §3 and §5, and is paired with a VALIDATOR rule — a design
    whose contexts fit none of its own targets is refused at assembly — because a wrong table would otherwise hide a
    design **silently**, which is this surface's worst failure. Also settled: the category display name has no home in
    code, so it joins `CategoryContent` (`content.json`, per category, already read by `assembleEntry`) rather than a
    second list that can drift; `doc-edit.ts` has no insert and gains one shaped exactly like `duplicateSection`;
    category order must be NUMERIC (`a17` sorts before `a4` as a string); and `read.ts` already ships every placeable
    design for this story (DW-200, which this story adds nothing to). **DW-190 closes here** — the picker is the
    refusal surface a section with no root had nowhere to show on. No migration and **no Schema phase**.
  - **The `⌘K` collision, found by reading (Story 5.10's Create):** `⌘K` is ALREADY the **link** mark inside an
    editing session (`lib/inline.ts:230`, `KEYS = { b, i, u, k: 'a' }`), and `shortcutFor` lets a `⌘`-modified gesture
    through with the caret in a field — only `undo` and `redo` are held back. Worse, a field that does not permit
    links returns *without* `preventDefault` ON PURPOSE so the key reaches the browser, so the picker would have
    swallowed it. `'add'` joins that one exclusion list in the SHARED function; it does not become a `SINGLE_KEY`, so
    it carries no WCAG 2.1.4 focus condition and still fires with a popover open.
  - **The preview is the canvas's own render, in its own frame (Story 5.10's Create):** a design's stylesheet carries
    media queries that key on the VIEWPORT, so a shadow root sized to a card would apply desktop rules at card width
    and draw a broken miniature — R-137 settled the identical point for the canvas. Each card therefore gets an
    `inert` `/canvas` iframe at Desktop width, fitted by transform, created only on intersection (NFR-1's "Section
    Picker preview lazy rendering"). **`inert` is what keeps R-149 at one rule on one element**: it was unavailable to
    the canvas, which must stay pointer-editable, and is available here because the card takes the press.
- **Text is text plus marks, never HTML.** A string plus ordered ranges over exactly bold, italic, underline and link (the link record carries `newTab`/`rel`), edited through raw `contenteditable` with no editor-library DOM in the iframe; paste strips to the four, and the sidebar edits the same value.
  - **Story 5.3 built it value-first (2026-09-18):** typing is read from the element as WORDS (`readText`), the one edit between the words before and after, anchored at the caret (`diffText`), is applied to the STORED value (`replaceRange`), and the element is rewritten from the serializer when their nodes differ (compared after `normalize()`, U+00A0 equal to a space). The page cannot hold a whole link record — `linkAttributes` writes a Portal link as `href="#" data-portal` and never writes `ref` — so reading markup back after a keystroke would drop every Portal link and every `ref`. Only a paste is read for marks (`readMarks`, over an inert `DOMParser` document, narrowed to the field's own allow-list). One controller runs the canvas element and the panel's rich Text Area (`apps/web/lib/inline.ts`); the marks functions sit beside the serializer in `packages/section-runtime/src/marks.ts`. A `\n` is `<br>` on both emitters, a link with no destination writes no anchor (DW-120), and `PropDef.maxChars` stops typing and paste with "{Label} holds {n} characters.".
- **Untouched is a real state.** An untouched synthesizable template shows its Synthesis Defaults under a worded marker and only an edit materializes it — never viewing, a preview subject or a member-state check; removing every section returns it to untouched, hiding does not, and other canvases open empty and emit nothing (AD-22).
- **Saving never costs speed.** Changes write locally without blocking; cloud sync runs on a timer (3 min, a per-user toggle with a data-loss warning), at tab close, on lock release, on ⌘S and before deploy or export, and says so when it falls back to per-change sync.
  - **Story 5.8's planning (2026-09-19, read in the schema and the grants):** `authenticated` has NO UPDATE grant on
    `projects.revision` (`schema:1209-1212`, AD-31), so the sync can only be a `security definer` RPC — one plpgsql
    body is one transaction, which is also what DW-197 found missing from the project-level Clear, so that action
    adopts it. One route handler wraps the RPC because `fetch(..., { keepalive: true })` at tab close cannot call a
    Server Action; the timer, ⌘S and tab close are then one path. `SYNC`/`syncPath` join `SETTINGS` in `lib/editor.ts`
    as a second STATIC sibling of `[template]` (R-131's precedent). The journal record is `{ seq, txn, docKey, before,
    after }` rather than an inverse-op log — `addendum.md` §AD4 hands the record shape to the Architect and keeps only
    the transaction id load-bearing, and a whole-doc restore is what makes FR-D9's "never half-applying" one check
    before one assignment and its "parked value restored alongside the design" free, in a story where
    `parkedControls` does not exist. **The story HAS a Schema phase** (R-99): DW-193's `template_key_shape` fix on
    both tables, plus the RPC. The indicator itself is NOT built — Story 1.3 built it from B6
    (`components/kit/persistence-indicator.tsx`), and its five-label union is the compile error that keeps a sixth out.
  - **R-140 (owner, 2026-09-19, Story 5.8's Q1):** B6's second panel control, **"Download a copy"**, is NOT built —
    nothing in Inflozo reads such a file back in. Absent, never greyed (UX-DR3); R-118 applied a sixth time, and the
    first time to a control with no future story named at all. The Retrying panel carries "Retry now" alone and its
    reassurance sentence is untouched.
- **Undo counts edits.** One gesture is one transaction, one undo step and one edit (a Shuffle is one); 100 edits, replayable after a reload in the session, cleared only by a hydrate that supersedes the local doc, and no operation count is ever surfaced (AD-15, AD-16).
- **One editing context per project.** A second opener reads along and may request editing; the holder flushes then releases, an unanswered request may take over from the last synced snapshot, the displaced session is told its `unsynced_edits`, and deploy and export require the lock.
- **The canvas is a viewport.** The iframe is viewport-sized and scrolls internally, device preview resizes both axes (834; 390 × 844), the only scale is the automatic fit shown in a chip, and there is no zoom control, per-breakpoint editing or section cap.
  - **R-137 (owner, 2026-09-19, Story 5.7's Q1) — Desktop is a viewport too, and there is ONE rule for three
    devices:** **1440 × 900** · **834 × 1112** (`D8a`, `EXPERIENCE.md:62`) · **390 × 844** (UX-DR17), fitted by
    `min(1, stageW/deviceW, stageH/deviceH)` and never magnified. It settles a contradiction between two approved
    frames — S4a`:63` draws the resting card filling the height, B11a`:740` draws it as a fixed 1440 × 900 with its
    chip, and that chip was deliberately kept through the A7 correction pass. **B11a governs the card's GEOMETRY**
    (device-sized, centred in the ground, a radius on all four corners, the skeleton following it) **and S4a governs
    everything else about it** (the ground, the ink, the shadow, the 6px radius). The iframe's CSS pixel size IS the
    device's, so media queries fire and `vh` resolves; the fit is a `transform` over it and never touches the CSS
    viewport (`prd.md:569`). A device change is a STYLE change, never a repaint — the selection, the stamps, the
    inline caret and the scroll survive it, and every section root is the same node. The device is session state like
    the mode: no column, no migration, **no Schema phase**. `1` `2` `3` stay Story 5.9's and the `⋯` collapse at 834
    stays Story 5.22's; FR-D14's fps gate stays Story 5.23's, while its **no-cap** and **5 s lockup bound** are 5.7's.
  - **R-138 · R-139 (owner, 2026-09-19, Story 5.7's Q2 and its Review) — the chip and the ground.** The invariant is
    that the viewport chip NEVER OVERLAPS the page card, on any device; measured on the deployed editor, a height-bound
    card rose under a chip pinned to the stage's corner (Tablet by 5px, folded Desktop to within 4px), because the chip
    is pinned while the card moves. Delivered as 4px/4px on the chip rather than `B Missing Surfaces.dc.html:740`'s
    drawn 9px/12px, and the ground's TOP padding at 32px rather than `S4 Editor.dc.html:62`'s 24px; the two offsets are
    the delivery, not the rule. R-139 then gives the ground the SAME 32px at the BOTTOM (`py-8`, in the editor and its
    skeleton), so no height-bound card stands on the window's edge — it amends R-138's "the other three sides stay
    S4a's" to the two sides. Cost: Tablet 71% and Mobile 93% on the 1440 stage; a width-bound Desktop does not move.
    The export is untouched (R-74); `reconcile-designs-decisions.md` is the record.
  - **As built (Story 5.7, 2026-09-19):** the device table, `fitFor`, the chip's words and the live region's sentence
    are `apps/web/lib/device.ts` — **pure and importless on purpose**, because `node --test` strips types but cannot
    load a `.tsx`, so the fit is unit-tested in `editor.test.ts` (`kit-button.test.ts:6-7` is the standing precedent).
    `components/editor/device-switch.tsx` holds S4a's icon radio group — reusing the Kit's own `radioKeys`/`tabStop`,
    never a second arrow implementation — and B11's chip, whose two rounded colours are named in its comment
    (`tokens.test.ts` forbids a hex under `apps/web`). The `ResizeObserver` moved from the page card to the stage
    `<section>`: the card is now the ANSWER (the device's size, fitted) and the stage is the question. The centring is
    on that same `<section>`, never a wrapper, or R-123's `e.target === e.currentTarget` would stop covering the
    letterbox beside a phone-shaped card. The chip renders AFTER the card so the card stays the ground's
    `firstElementChild`, which is how the harness and step 27's gutter find it.
- **Live content is read in the browser and degrades honestly.** Reads are cached 60 s, batched and de-duplicated across canvas, picker and link search under a per-session ceiling, and fall back to Orbit Weekly naming the cause on 429 (that Ghost rate-limits Content API keys is the PRD's statement, not a measurement); body HTML is never read — `{{content}}` is the style-guide fixture.
- **Zero items has three answers.** The main feed shows its designed empty state and is never back-filled, a secondary `{{#get}}` feed renders nothing, a bound prop follows its guard, and a user-authored list renders nothing at zero.
- **One main feed per natively paginated template, designated by this epic.** It binds the native `posts` context sized by `posts_per_page` or the route's `limit:` and alone offers Pagination style; other feeds cap Count at 100 and never emit `limit="all"`, and hand-picked order is the dragged order, warned past 25.
- **Tier presence is not purchasability.** Paid asks sit inside `@site.paid_members_enabled`, free asks inside `@site.allow_self_signup`, tier queries filter `type:paid+visibility:public`, the paywall is a template surface with its own editor, and nothing member-identifying is server-rendered (AD-38).
- **Behaviours hold still while designing.** Layout CSS is always live; module JavaScript runs on the canvas only for edit-safe modules, the others render at rest with a PAUSED chip on the behaviour, and Preview runs everything without chrome.
- **The canvas renders no untrusted HTML.** Content API values are text nodes, Ghost URLs are http/https only, excerpts are text-only, and `codeinjection_*` is never read in, though a browser settings read returned it on T3 (MEASUREMENTS §38b); no `'unsafe-eval'` is a requirement to prove on the real canvas, not a measured fact.
- **Keyboard-complete, with a device-test floor.** Single-key shortcuts work only while the shell holds focus, the canvas is one tab stop with a skip link and an `Esc` ladder, and every drag has a keyboard path; a coarse pointer below 834 gets the Small Screen Notice, while a desktop at 200% zoom keeps a reflowed editor (R-76, R-87).
  - **R-141 (owner, 2026-09-19, Story 5.8's Q2) — WHEN a binding is built splits on the modifier, and the reason is
    UX-DR11.** A **⌘-modified** binding may land with the control it drives: Story 5.8 builds `⌘Z`, `⇧⌘Z` and `⌘S`
    beside S4a's undo arrows, calling the same handlers rather than a second implementation, inert while a field or a
    `contenteditable` holds the caret so Story 5.3's inline editing keeps the browser's own undo. A **single-key**
    binding may not, because only it carries the focus condition (live only while the shell holds focus, WCAG 2.1.4)
    and that condition is verified as ONE keyboard journey, not one key at a time — so `[` `]`, `1` `2` `3`, `L`, `.`,
    `P`, `⇧R` and `Esc` all stay Story 5.9's. It narrows 5.9, never relieves it: 5.9 still builds and tests the
    COMPLETE map and finds three of them already passing. R-118 is untouched — it governs a control with no story to
    make it work, which is a different question.
  - **Story 5.9's planning (2026-09-19, executed in a browser and read in the frames):** R-141's "COMPLETE map" cannot
    be met here and the reason is R-118's own — **five of FR-D11's thirteen keys press a control no story has built**:
    `⌘K` (5.10), `[` `]` (5.11), `⇧R` (5.12), `P` (5.15), `⌘⏎` (7.18). So the map is ONE TABLE naming all thirteen with
    the story that lands each, and the bound set and the `?` sheet's rows are both DERIVED from it — the shape
    `lib/editor.ts`'s `CANVASES` + `CONDITIONAL` already uses, and the story's **Question 1**. **THE CANVAS BECOMES ONE
    TAB STOP BY `tabindex="-1"` ON THE IFRAME** — executed in Chromium 1228 through the repository's own Playwright:
    plain gives `layers → canvas → site-1 → site-2 → controls` and `-1` gives `layers → canvas → controls`, with click
    and programmatic focus untouched (`inert` would have taken the pointer with it and stopped the canvas being
    editable). D8c's skip link is still built as drawn, and `EXPERIENCE.md:444`'s "dozens of stops" is honestly now one
    — the keyboard path into a text prop is the panel (FR-D1). Already built and only TESTED here: `⌥F10` and the
    toolbar's `←`/`→` and `Esc` (`lib/inline.ts:251-255`, 5.3), the `Esc` ladder's first rung (5.3), and both
    `⌥`-arrow reorders (5.4, 4.5). The account menu's **Keyboard shortcuts** row is this story's by name
    (`account-menu.tsx:43-46`) and the editor draws NO account menu (`shell.tsx:295-297`), which is why `?` is asked as
    **Question 3** — it would be FR-D11's fourteenth key. **Question 2 is DW-167**: its "Ask First" named a dependency
    that has since arrived (`@playwright/test` is a root devDependency since 4.11), so the choice left is cost — a
    browser in `pnpm check` over a harness mount, against DW-16's precedent of closing the same gap with a DEPLOYED
    probe. Executed for it: `next dev` with NO Supabase environment is ready in 307 ms and serves every route outside
    `(authed)` (the marketing page 200, every authed page 500), because `proxy.ts:27-30` returns early and
    `server.ts:25-30` throws only when a client is built. No migration and **no Schema phase**.
  - **R-145 (owner, 2026-09-19, Story 5.9's Q1) — a shortcut arrives with the action it drives, so FR-D11's map is
    completed over six stories rather than one.** R-118 applied a seventh time and the first time to a KEY: a binding
    whose action has not been built is ABSENT — not bound, not listed in the `?` card, never greyed (UX-DR3). Story
    5.9 builds `L`, `.`, `1` `2` `3`, `Esc`, `⌘D`, `Del` and `?`, and finds `⌘Z`, `⇧⌘Z`, `⌘S` already passing;
    **`⌘K` lands with 5.10, `[` `]` with 5.11, `⇧R` with 5.12, `P` with 5.15 and `⌘⏎` with 7.18**, each now a
    criterion of that story and tested by it. The map is ONE TABLE naming all thirteen with the story that lands
    each, and the handler and the card's rows are both DERIVED from it. It narrows R-141's "5.9 tests the COMPLETE
    map" and nothing else.
  - **R-146 (owner, 2026-09-19, Story 5.9's Q2) — the keyboard journey runs on every commit, over a test-only mount
    of the real editor.** Inside `pnpm check` and so inside CI's `check` job, the only place a gate can block a
    deploy (R-116, which is why it is not a job of its own); the harness is a page answering `notFound()` unless
    `INFLOZO_HARNESS=1`, rendering the REAL `Editor` with the pilot fixture, typed against `EditorData` so drift is a
    compile error. **DW-167 closes with it** — its "a DOM is a dependency (Ask First)" lapsed when Story 4.11 made
    `@playwright/test` a root devDependency. R-82 is untouched: the same walk runs on the deployed editor at Review
    (`run-verify-editor.cjs` from step 71), because a harness proves the wiring and never the stack. The precedent it
    departs from is DW-16, closed at 3.9 by a deployed probe alone.
  - **R-147 (owner, 2026-09-19, Story 5.9's Q3) — `?` opens the shortcuts card, and it is FR-D11's fourteenth key.**
    `S3 Dashboard.dc.html:362` draws it on the account menu's row, Story 1.5 left that row for 5.9 by name, and the
    editor draws no account menu (`shell.tsx:295-297`) — so inside the editor `?` is the card's only door. It carries
    the identical single-key focus condition, and the card is the map's table printed through the Kit's shortcut rows
    (`Editor Sidebar Kit.dc.html:274-280`) inside `kit/dialog.ts`'s one vocabulary. The PRD's "complete set" is now
    thirteen actions plus the key that lists them, and R-147 is the record of the difference.
  - **Story 5.9 built it (2026-09-19):** the map is `apps/web/lib/keymap.ts` — pure, and its one import is
    `lib/device.ts`, so `node --test` reaches all of it and the three device rows are DERIVED from S4a's own track.
    `shortcutFor` and `holdsCaret` MOVED there from `lib/journal.ts` with Story 5.8's assertions verbatim
    (`keymap.test.ts`); a row with a `story` carries no `keys`, so a deferred key is bound by nothing and listed by
    nothing BY CONSTRUCTION, and `SINGLE_KEY` is derived from the same table so the caller needs no second list of
    which keys carry WCAG 2.1.4's condition. `editor.tsx` gained ONE `run(gesture)` dispatcher calling the very
    handlers the buttons call; `useFold.toggle` takes an UPDATER and `latest` gained the device, because a key bound
    once at mount would otherwise read the first render's `folded` and `device` for ever. THE CANVAS IS ONE TAB STOP:
    `tabIndex={0}` on the stage `<section>` and `tabIndex={-1}` on the iframe. The `Esc` ladder's rungs 2 and 3 are
    focus moves plus an announcement through `#editor-said`; rung 1 is Story 5.3's `preventDefault` and never reaches
    the handler. D8c's skip link is `sr-only` until focused and lands on the Controls sidebar's first control, the
    same place rung 3 does (`toChrome`). `onDuplicate`/`onRemove` gained their announcements, so the key and the pill
    announce through one place. **THE CANVAS HAS NO KEYBOARD PATH INTO INLINE EDITING and that is FR-D1 rather than a
    gap** — the panel is the keyboard's way into a text prop — so the journey drives every live-session claim (rung 1,
    `⌥F10`, the mark toolbar) through the panel's rich Text Area, which runs the same `lib/inline.ts` controller, and
    the canvas's own caret is walked on the deployed editor. **`next dev` needed its own `distDir`** (`next.config.ts`,
    keyed on `INFLOZO_HARNESS`): Next 16 allows one dev server per build directory, so without it `pnpm check` would
    fail for anyone with the app running. **AND THE GATE MAY NOT LIVE INSIDE `pnpm check`**: `apps/web/vercel.json`'s
    buildCommand runs `pnpm -w check` a SECOND time inside `vercel build`, in a browserless image that is not a
    Debian, so the first push had `check` green and `deploy` red and nothing published (CI run 35452356017). It is
    `pnpm keyboard`, run as its own step in the `check` job `deploy` needs — anything a future story adds to
    `pnpm test` runs on Vercel too.
  - **R-148 · R-149 (owner, 2026-09-19, Story 5.9's Review).** `Backspace` deletes the selected section exactly as
    `Del` does — one action, two hardware keys, one chip on the card, because a Mac laptop's "delete" key reports
    `Backspace`; both carry the single-key condition, so inside any text field `Backspace` deletes a character and
    nothing else. And **the canvas stays ONE tab stop**: axe-core refuses `tabindex="-1"` on a frame whose document
    holds a focusable element (`frame-focusable-content`, red on every scan at `27a638fa`), so NFR-5's zero holds for
    every rule on every element EXCEPT that rule on that element — a NODE FILTER in `run-verify-editor.cjs` step 8,
    never a disabled rule, with the keyboard journey (R-146) carrying the weight the scanner no longer does.
- **Performance is a manual gate.** TTI under 3 s warm, p95 frame ≤ 16.7 ms with no long task over 50 ms, control change under 100 ms, lockup = a main-thread block over 5 s — on the reference laptop at 4× throttle, never on CI.

## Technical Decisions

- **Shell and core.** `apps/web` fetches, persists and signals and hands the pure runtime plain values; core packages still read no clock, locale, `Intl` or I/O, but the editor may (DW-98's route for a site's timezone).
- **Mount Epic 4's parts, never redraw them.** The canvas emitter, `marks.ts` (`linkAttributes` is the one link sink), `resolveControls` (the only values stamped) and the `/controls` panel components, `offerBindings`/`checkBindings`, the shim (absolute URLs, an inert `{{content_api_key}}`), `orbitWeekly.resolveSource`, and one reference token set until Epic 6.
- **Pilots are provisional and not this epic's to edit.** `packages/library/designs/` is the list, a defect goes to its owning category (AD-35), and the render matrix is its own job that never blocks deploy (R-116).
- **One doc schema, one version.** Every reader and writer parses through one `zod` schema — main-feed flag on the instance (written only here), hidden, parked values, asset ids never URLs — synthesis is a core function shared with the compiler, and per-canvas preferences live in `project_template_prefs` (AD-27, AD-22).
- **The IndexedDB op-log is journal and undo stack.** The cloud keeps snapshots, never history; lock acquisition keeps the journal when `projects.revision` equals the doc's `base_revision` and replaces both when not, a takeover (`edit_locks.lock_generation` advancing, trigger-enforced) clears unconditionally, and doc migrations run lazily on hydrate.
- **Lock timings tune; comparisons do not.** Heartbeat ~15 s, nudge ~30 s and stale ~60 s are defaults, while the revision and generation tests and `unsynced_edits` are load-bearing; the Realtime-channel-plus-BroadcastChannel transport has no recorded execution — a hypothesis until a story runs it.
- **Chrome is `::after` inside the iframe, driven by `data-inflozo-*`.** It adds no DOM, follows its element's stacking and is never serialized; only the mark toolbar and its pickers sit outside, and the boundary has known traps — outside-click, wheel over popovers, in-page anchors, dropped files, two focus contexts (AD-21).
  - **Story 5.1 amended AD-21 (2026-09-17):** inside the canvas is the site and what is painted on it (outlines, name tag, insertion hairline, PAUSED, the empty icon slot) — CSS keyed on `data-inflozo-*` in `apps/web/lib/canvas-chrome.css`, appended to the one canvas document at `/canvas`; outside is everything pressable, **the hover quick actions and "+" included**, as one floating bar anchored to the hovered section (Floating UI, `contextElement`). The selected outline is the root's own `outline`, not `::after`. 5.2 builds on this, and `pilots.test.ts` holds every chrome selector to the key.
  - **Story 5.1, CSP (executed 2026-09-17):** zod runs its JIT probe (`new Function("")`) when a `z.object` is *constructed*, so a schema in a client bundle reports an eval violation under the app's policy; `doc-schema.ts` sets `z.config({ jitless: true })`. A new client-side schema anywhere in the editor must come after it, and `tools/probe/run-verify-editor.cjs` step 5 is the control (DW-174 is the dashboard's).
  - **Story 5.2 moved the name tag and the outlines outside (2026-09-17, R-120, spine AD-21's second amendment — as built at ffa257e1, superseded by the next sub-bullet):** the tag, R-119's Pro badge and both outline boxes are elements in the editor document, inside the page card, anchored to the root with Floating UI (`@floating-ui/dom` 1.8.0, exact). The tag because inside the frame it would shrink with the fit, have no Inter and need a positioned root; the outlines because Chromium floors a border's or an outline's width to whole CSS pixels before the frame's scale applies (0.6px and 1.2px at 1440). Each box carries an inset box-shadow line, `globals.css` `canvas-outline-hover` (1px) and `canvas-outline-selected` (1.5px); `data-inflozo-hover` / `data-inflozo-selected` stay on the roots as state marks, and `canvas-chrome.css` held no rule until Story 5.3's editing haze (the sub-bullet after next); painted chrome (5.10's hairline, 5.15's PAUSED, 9.1's empty slot — R-121) keys its rule there too. Verify a line's width as painted pixels from a device-scale screenshot, never computed style (`run-verify-editor.cjs` steps 10–11).
  - **Story 5.2, owner's finding (2026-09-17, AD-21's third amendment):** positioned from the editor document the boxes drifted 8–15px while the canvas scrolled (the compositor scrolls the iframe a frame ahead of the main thread). The boxes, tag and Pro badge are now portalled into `lib/canvas-layer.ts`'s shadow-root hosts on the canvas `<body>` — `page` (absolute) and `view` (fixed, for sticky/fixed roots), scaled by 1 / fit, adopting the editor's stylesheet, fonts added as `inflozo-chrome …` — and `@floating-ui/dom` is gone. Anything anchored from the editor document to a scrolling section lags the same way (5.4's pill): measure it with `run-verify-editor.cjs` step 15 (screencast frames against in-canvas markers during `Input.synthesizeScrollGesture`).
  - **Story 5.3 — the editing stamps, and where the toolbar and the pill sit (2026-09-18, AD-21's fourth amendment):** the canvas emitter is ASKED for stamps (`RenderInput.editing`): `data-inflozo-prop` (plus `data-inflozo-item` for an authored item's index) on each surviving text prop, `data-inflozo-ghost` with the field's plain name on each surviving Ghost word and helper (R-122, `packages/library/contexts/labels.json` + `ghostLabel`); `renderTheme` handed `editing` throws. The editor lifts them into a map as it mounts the canvas and removes them in the same task (`takeStamps`), so rest is still zero and step 4's `outerHTML` equality with `/pilots` still holds — the core test asserts that, stripped, the render is exactly the render without `editing`. P0-1's toolbar and its link panel are pressed, so they are OUTSIDE the frame and hide from the first canvas `scroll` until 150ms after the last (Story 5.2's finding: anything positioned from the editor document trails the compositor by a frame); the lock and limit pill takes no press, so it is chrome in the canvas layer (`place()`'s `above`) and scrolls with its words. The field being typed in carries one more keyed state mark, `data-inflozo-editing` (put on and taken off with `contenteditable` by `lib/inline.ts`), which `canvas-chrome.css` styles as a coral haze in place of the browser's focus ring (the owner's test, 2026-09-18) — the first rule the file has held since R-120; on a button-styled link prop (Latest Post's Subscribe) the haze is the ring alone, because the sheet loads after the design's at equal specificity and would otherwise take the button's fill (second review).
  - **Story 5.2 — `stampControls` strips the chrome attributes:** it removes every root `data-*` that is not a directive before stamping (`core.ts`), `data-inflozo-*` included, so whatever marks a root re-applies its attributes after every stamp and every paint (`editor.tsx` `mark()`). Any later chrome attribute on a root (9.1's empty slot — R-121 — or 5.21's PAUSED) inherits the rule.
- **A design switch replaces the root's attributes.** Undeclared ones go and their values park; a dark override is a second token-resolved value of the same control — never a `-dark` attribute or a mode selector in a design stylesheet — and `color_scheme` alone selects the mode (AD-3, AD-30).
  - **Story 5.6's planning (2026-09-18, read in the runtime and executed over the library):** Epic 4 already built every
    part of a dark override except a reader. `ControlState.darkOverrides`, `ControlDef`/`UniversalDef.darkOverride`,
    `ControlRow.moon` (`controls.ts:199`) and the Kit's `MoonBadge` all exist, the panel already draws the badge with the
    words "Dark override" (`sidebar.tsx:105`), and `REFERENCE_TOKENS.dark` plus `referenceTokensCss`'s
    `:root[data-mode="dark"]` block already make both modes reachable — `tokens.ts:165-172` RESERVES `data-mode` for the
    canvas's preview so no fourth mode signal exists, and `pilots/review.tsx:121` already flips it. So the preview is one
    attribute plus a re-stamp, never a repaint, and `resolveControls`/`stampControls` need no change: the mode picks the
    STORED SLICE handed to the one door. **`bg` / Background role is the library's ONLY `darkOverride: true`**
    (`vocabulary.ts:263`) and it is a universal, so every design has one and every pilot offers two or three values —
    while no design declares a mode-scoped control of its own, no design has a per-mode image swap, and
    `darkCapabilities` (`["tokens"]` on every pilot) is READ BY NOTHING. `projects.dark_enabled` and
    `instanceSchema.darkOverrides` both pre-exist, so the story has **no Schema phase**; the custom-settings cap cannot
    move, because the three dark built-ins are not rows and `enforce_custom_setting_cap()` is fixed at 17
    (`schema:304-305,329-340`) — AD-17: a `dark_enabled = false` project still emits and still references all three.
  - **AD-30's theme half is an OPEN GAP, filed at 5.6's Create, and it is Epic 7's:** AD-30`:345` says Background role
    "needs no second attribute at all", which holds on a canvas that has a live `data-mode` and does NOT hold in a
    shipped theme — one `data-bg` cannot be `base` for a light visitor and `contrast` for a dark one, a `-dark` twin is
    forbidden by the same paragraph, a design stylesheet naming a mode fails the build, and AD-3's only inline-`style`
    carve-out is bound Ghost data. Story 5.6 stores and previews faithfully and settles nothing about emission.
  - **Story 5.6 built it (2026-09-18):** ONE pure function decides what a mode means —
    `storedFor(entry, state, mode)` in `controls.ts`, the STORED SLICE the mode resolves from: in dark each
    `darkOverride: true` name takes its `darkOverrides` value and every other name keeps `controls`'. `resolveControls`,
    `stampControls` and `core.ts` are UNCHANGED and `RenderInput` gained no `mode`, so no mode reaches the theme
    emitter (`agreement.test.ts` and `ad36.test.ts` untouched and green — the control). `sidebar`, `setControl` and
    `resetControl` take `mode: Mode = 'light'`, so every existing caller and test compiled unchanged; a dark write
    lands in `darkOverrides` only where the RESOLVED control declares `darkOverride`, and a reset empties whichever map
    that same test names. THE FLIP IS ONE ATTRIBUTE PLUS A RE-STAMP, NEVER A REPAINT (`editor.tsx`'s `flip` →
    `restampAll` → `mark()`), which is what lets a caret, a text selection, the scroll and the selection survive it.
    The moon's guard moved from `d.values.includes` to `d.offered.includes` — the spec's frozen matrix row requires no
    moon for an override the design narrows away, and `values` lit one for a value nothing could stamp; the ONE
    definition is now `darkOverridesInForce`, which the badge, both R-133 entry points, its confirm's count and D6a's
    project count all read. `doc-edit.ts` gained `clearDarkOverrides` (the deliberate clear) and `darkOverrideCount`
    (derived over the docs, taking the library in `synthesize`'s `entryOf` shape). `referenceSwatches(mode)` paints the
    Background-role dots in the colours the canvas is actually painting. EXECUTED over the library (2026-09-18):
    `vocabulary.ts:263` is still the only `darkOverride: true` in `packages/library`, every pilot offers `bg` as
    base→surface at least, and no pilot declares a mode-scoped control of its own.
  - **R-118 applied a third time (Story 5.6's planning):** FR-D7's visitor `mode-toggle` refusal is NOT built in Epic 5 —
    the module is registered (`modules/registry.json:30`) but implemented by nothing and declared by no design, and
    `color_scheme` has no Inflozo column to read before Epic 7's Theme Settings, so R-34's condition is unreadable and
    there is nothing to refuse. A1's category story (Epic 9) owns it. S4's own "Dark mode / Readers get a moon toggle"
    sidebar row is that visitor setting and is STALE — `EXPERIENCE.md:652` and `:1783-1790` record D6a's project-mode
    block as its replacement; never build it.
- **CSP.** The app host uses a nonce with `'strict-dynamic'` and `frame-ancestors 'self'`; `connect-src` has been a static `'self' https:` since Story 3.2 (`apps/web/csp.ts`), though the PRD still says per-session (Story 5.1 corrected the spine).
  - **Story 5.1 verified the no-`'unsafe-eval'` half on the deployed editor (2026-09-17, the spine's CSP row, refreshed here at 5.2's Create):** `tools/probe/run-verify-editor.cjs` recorded zero violations behind an `EvalError` control, and the spine says the proof "is re-run at each Epic 5 story's Review" — so every Epic 5 story that adds a gesture adds it to that harness's step 5 session.
  - **Story 5.2 did (2026-09-17):** steps 10–13's hover, select, edits, reset and Esc run inside step 5's session and its zero is read after them; step 14's touch runs in its own `hasTouch` context, outside the CSP session.
- **The tables exist.** `edit_locks`, `project_templates`, `project_template_prefs`, `projects.revision` and `profiles.autosave_enabled` are in the complete-schema migration; changing them means a migration pushed first, alone (R-99).

## UX & Interaction Patterns

- **The export is the authority (R-74).** Each story names its frames — S4 the shell, D8 below 1440, D5 markers and switcher, `B Missing Surfaces` most satellites — and a frameless surface is extrapolated from the nearest.
- **Build as re-specified, not as drawn.** B11 has no zoom control; B8 no "Keep Free designs only" (R-77); S4c's pinned Quick Controls card is not built (R-113); S4d is three states with an unviewed marker and a gated indicator; P0-1 supersedes B4a; B5c states only a count of edits.
  - **R-118 (owner, 2026-09-17, Story 5.2's Q1):** a button on a hovered section arrives with the story that makes it work, absent until then — Duplicate, Delete and the drag handle with 5.4 (S4b's pill), ◀ ▶ with 5.11, the hairline "+" with 5.10, FR-D3's click on text with 5.3. Story 5.2 builds hover (outline, name tag), selection, the section panel, Esc, the empty state and tap-and-hold.
  - **R-119 (owner, 2026-09-17, Story 5.2's Q2):** on a Free plan a selected Pro design carries the Kit's `ProBadge` 8px inside its top-right corner (B10), on selection only and never pressable. S4b's pill wants the same corner; 5.4, which builds the pill, moves one of the two.
  - **R-121 (owner, 2026-09-17, Story 5.3's Q1):** clicking an icon on the canvas (P0-2's slot, the dashed placeholder while selected) and an icon before or after a button's words are Story 9.1's, where A1's buttons are the first designs that carry them; no Epic 5 story builds either, and until then an icon changes from the panel's Icon Picker field.
  - **R-123 (owner, 2026-09-18, at Story 5.3's review, amended the same day):** a press on NOTHING deselects, exactly as
    Esc does, ending any inline editing in the same press. **Three grounds:** the canvas ground below the last section
    (inside the frame), the editor's own ground around the page card, and the empty space below the Layers rows. It
    reverses Story 5.2's matrix row "click below the last section, the canvas ground or a Layers row → the selection
    stays"; a Layers ROW still keeps it, as do the Controls sidebar, the Layers header, the mark toolbar and the top bar,
    because the panel edits the selection (EXPERIENCE § the focus model (2)). The top bar was offered and declined: its
    empty space shrinks with every control still to land there. `editor.tsx`: the canvas document's `click` calls
    `choose(pickAt(target))` unconditionally, and the stage `<section aria-label="Canvas">` and the Layers row list each
    deselect on a primary `pointerdown` whose target is that container itself. **Story 5.4 owns all three Layers rules
    together** — the row's press, the drag's start and this ground's press.
  - **R-132 (owner, 2026-09-18, Story 5.6's Q2):** the canvas mode control is ONE button at S4a's position — the
    export's sun while light, the Kit's moon while dark — with `aria-pressed`, an accessible name naming the
    DESTINATION ("Preview dark mode" / "Back to light mode") and the mode now shown announced politely. S4a is
    COMPLETED, not superseded: it draws only the light state, unlabelled, and no frame anywhere draws a moon for it.
    UX-DR8 is satisfied through `DESIGN.md:534-536`'s carve-out — an accessible label where the layout genuinely
    cannot hold a word, which a 48px bar with View as, the device switch, undo/redo and Ship it still to land in it is.
  - **R-133 (owner, 2026-09-18, Story 5.6's Q3, answered off the menu — BOTH places):** per-section "Clear dark
    overrides" sits under "Reset this design" at the Controls panel's foot AND in the Layers row's `⋯` menu, with
    **ONE confirm, in `editor.tsx`**, exactly as Delete's and Hide's two paths already share one
    (`layers.tsx:51-52`). Each place follows its own neighbours and that is deliberate: the panel row is always
    present and says there is nothing to clear when there is nothing (R-12), the menu item is ABSENT when the section
    carries no usable override (UX-DR3, as Duplicate is on a site-wide row). **R-126 is extended, not reversed** — the
    `⋯` is still the row's only control and Hide/Show still leads its menu. No frame draws either surface
    (`reconcile-design-prompt.md:60` records the gap); both are extrapolated from the neighbour each sits beside.
  - **R-134 · R-135 · R-136 (owner, 2026-09-19, Story 5.6's Review).** The project-level "Clear dark
    overrides" ASKS FIRST — the app's one dialog (`kit/dialog.ts`, 460px), the count named in the sentence and
    derived from the docs, focus opening on Cancel (R-115, UX-DR14), and with nothing to clear it says so under the
    row instead of asking (R-12). On a Light-only project the EDITOR says nothing about dark: neither the panel row
    nor the `⋯` item is rendered — absent, never greyed, the same answer the sun gets — while Theme settings' own
    row is the one thing that greys with D6b's reason. And a CONTROL row draws the moon badge ALONE: "Dark override"
    is its accessible name and its hover `title`, never printed beside it, through `DESIGN.md:534-536`'s carve-out
    for a layout that cannot hold the word — D6a's project-level row, which has the width, still prints them.
    A control row's words are its name and title: read them with `getAttribute`/`aria-label`, never `textContent`,
    which includes an inline SVG's `<title>` (`run-verify-editor.cjs` step 48).
  - **R-150 · R-151 · R-152 (owner, 2026-09-19, Story 5.10's Q1–Q3, option 1 each).** **R-150:** S5a's rail-footer
    **`Free only`** toggle is NOT built — R-77's reasoning generalised from Site Remix to browsing the library, so
    every offered design is shown and the ✦ Pro tag is the only Pro signal (UX-DR19). **R-151:** the picker header's
    drawn sun/moon **segmented** becomes **R-132's one button that swaps its glyph**, at the segmented's position,
    flipping the SAME `mode` the canvas holds — so the picker and the page behind it can never disagree. **R-152:**
    site-wide designs ARE offered on every canvas and land in the Site-wide group rather than at the invoked position
    (the stack order is derived, `editor.test.ts:103`); **a second one in the same category REPLACES the first**, one
    edit, `⌘Z`-able; and in the owner's own words there is **no text message** — a site-wide design carries the Kit's
    **`Globe`** on its picker card with a hover `title` and the same words as its accessible name, so the mark arrives
    BEFORE the press. **Layers gains no glyph: R-126 stands.** The polite `#editor-said` announcement stays, being a
    screen reader's only access to a glyph and a hover, and not a visible message.
  - **R-126 (owner, 2026-09-18, on the deployed Story 5.4):** the Layers panel is drawn for its NAMES — the two groups
    the same shape with a hairline between (no card, no glyph, no footed note), `Site-wide` and its derived template
    count on one line, the name at `text-helper-caption`, and the `⋯` as the row's only control with Hide/Show leading
    its menu (`Space` on the row still toggles). `openMenu` clamps BOTH edges, for every menu in the app. B7 is
    superseded on those points and `reconcile-designs-decisions.md` is the record; a later Layers story starts there.
  - **R-124 (owner, 2026-09-18, Story 5.4's Q1, closing DW-163):** "who can see this section" is the FIRST ROW of the
    settings panel's Section settings and Layers draws nothing about it — where every drawing puts it (`A4-13`:256,
    `A22-1`:69) and where R-113 already filed it. A NAMED SELECT, not a pill row: R-114's own rule refuses its values
    ("Logged out" is 66 px against a 58.3 px pill), so `A22-1`'s drawn select wins over `A4-13`'s pre-R-114 pills. Its
    values are `A22 Newsletter - Spec.md:291`'s — Everyone (default) · Logged out · Free members · Paid members — the
    value is stored on the INSTANCE (`memberVisibility`) and handed to the render door as `RenderInput.visibility`,
    which Story 4.10 already honours on both emitters, and it is never declared in a `controlSchema` (DW-186).
  - **R-125 (owner, 2026-09-18, Story 5.4's Q2):** R-119's Pro tag keeps the selected section's top-right corner
    unchanged, and S4b's quick-action pill sits directly to its LEFT — its right edge a gap short of the tag's left
    while the tag shows, S4b's own 10 px inset when it does not. The name tag keeps the top-left, so nothing else
    enters either corner.
  - **R-122 (owner, 2026-09-17, Story 5.3's Q2):** a click on Ghost's own words in a selected section shows P0-1's lock pill naming them — "Post title — set in Ghost" — as chrome in the canvas's layer; the names are one list beside the context matrix (`labels.json`, `ghostLabel`). Story 7.10 reuses the pill for a text prop promoted to Ghost Admin, naming its setting.
- **The settings panel is Section Settings · Content · Layout · Style · Data.** Nothing is pinned above, pills are for short choices (R-114), reset asks first (R-115); could-never is absent with a reason, could-but-not-now greyed with a caption, never a tooltip.
- **Colour never carries the only signal.** The indicator is a dot and a label, never a spinner; markers carry words; design, pack and Remix changes announce politely, lock notices assertively; reduced motion makes every transition instant.
- **Every editable list drags alike:** a dashed landing slot, nothing reorders until the drop, and `⌥↑`/`⌥↓` as the announced keyboard move.
- **Degraded states are designed.** A read-only session keeps the canvas legible with the sidebar dimmed under a reading-along bar; an irreversible confirm opens on cancel; pressed controls say what they are doing and every route has its own skeleton (R-98).

## Cross-Story Dependencies

- **5.1 first,** settling in its spec the URL scheme (project, template, template surface, browser Back) and which parts of the shell sit inside the iframe.
  - **R-131 (owner, 2026-09-18, Story 5.6's Q1) adds the scheme's FIRST non-canvas segment, and moves the tree to
    hold it:** Theme settings ships now at `/projects/<id>/settings`, holding D6a's project-mode block and the
    project-level "Clear dark overrides" row and **nothing else** that screen draws (R-118 a fourth time; its left rail
    is Epic 7's too). `projects/[id]/layout.tsx` renders the **Editor** for every child segment, so a page nested there
    would come up inside the editor's chrome — the editor therefore descends into a `(editor)` route group, which is
    not a URL segment, and `[id]/layout.tsx` keeps only the `projectOf` 404 guard, above both children and above every
    Suspense boundary where R-98's second effect requires it. **No URL changes**; `run-verify-editor.cjs` steps 2, 6
    and 9 are the control. `settings` is named in `apps/web/lib/editor.ts` beside the canvases, and being a STATIC
    sibling of `[template]` it never reaches `canvasFromSegment`, so 5.5's no-awaited-refusal finding stands.
  - **Story 5.6 did the move (2026-09-18):** `projects/[id]/layout.tsx` is now the `projectOf` 404 guard and NOTHING
    else; the editor's layout, pages, `editor.tsx`, `editor-skeleton.tsx`, `read.ts` and `[template]/` live in
    `[id]/(editor)/`, and `settings/` (page, `loading.tsx`, `actions.ts`) sits beside them. `next build`'s route table
    is the control: the two editor routes are byte-identical and `/app/projects/[id]/settings` is added.
    `busy.test.ts`'s `NO_SKELETON` keys moved with the group — a `loading.tsx` at `[id]` would still be a boundary
    above the guard, and the group is what lets `settings/` have a skeleton of its own without standing over the
    editor. `SETTINGS`/`settingsPath` are in `lib/editor.ts` and `editor.test.ts` asserts `settings` resolves as no
    canvas.
  - **Story 5.1 settled both (2026-09-17, spec § Design Notes):** `/projects/<uuid>` is Home and `/projects/<uuid>/{post,page,tag,author,error}` the rest (`apps/web/lib/editor.ts` is the scheme as data — the route, the Shell and the harness read it there); `/home` 308s; `index`, `private`, `custom-<slug>`, `paywall`, `cards` 404 until their stories. Canvas change is a soft-navigation push inside the `[id]` layout, which holds the editor so it stays mounted (5.8's flush hooks its unmount); modes and folds never enter the URL. Pages render nothing — the active canvas is read from the pathname.
- **5.8 underpins the loop:** its one-transaction-per-gesture journal makes a shuffle one edit (5.11, 5.12), gives 5.17 `unsynced_edits` and the superseding hydrate, and gives 5.23 a doc to assert over.
  - **Story 5.5's review (2026-09-18, executed on production):** 5.8 is the first writer of `project_templates`, and the stored `template_key_shape` refuses every `custom:` key (two backslashes in the pattern) — so 5.8 **has a Schema phase** that fixes the constraint before its code ships (DW-193, R-99).
- **Earlier stories lean on later ones:** link search (5.3) and picker previews (5.10) share 5.18's fetch layer, 5.13's subject picker and 5.16's page 2 need 5.19, 5.14 needs 5.21's strip, 5.4's Post Content refusal lives in 5.10's picker, and 5.9's map spans the epic.
- **Across epics:** Epic 3's daily settings snapshot feeds the shims and members checks; Epic 6 replaces the token set; Epic 7 compiles the doc, gates deploy and export on the lock and flush, and repeats the warnings pre-deploy; A34's (5.19) and A32's (5.20) designs arrive in Epic 10.
- **Undeclared forward dependencies:** the library holds only the provisional pilots, so 5.11, 5.12 and 5.23's round trip have no second design to move to, and the repo's only 40-section fixture is `tools/stress`'s compile-sizing archetypes; the Synthesis Defaults and Post Content (5.4, 5.5) name designs Epics 9–10 author; pack re-roll and undo (5.12, 5.8) have one token set until Epic 6.
  - **Story 5.1, Question 1 ruled option 1 (owner, 2026-09-17)** — nothing places a section before 5.10, so the owner's tests of 5.2–5.9 run on "Pilot sections": the pilots across `site`, `home` and `post`, added once to his own account by 5.1's Deploy through `tools/probe/seed-editor-project.mjs`. Reuse it; never seed a second.
  - **Story 5.3's planning (2026-09-17, read in the pilots and swept across every category spec):** no pilot declares an `icon` prop, a character limit or an authored array — the controls fixture's `features[].icon` is the library's only icon prop — so a story that needs one on the canvas has nothing on "Pilot sections" to try it on. The first designs with an icon a customer picks arrive in Epic 9: every A1 header button takes one (Story 9.1), and A1·11 Side Rail adds row icons (9.3). The editor canvas prints catalog-linked props in the runtime's own English (`renderSection` hands no `strings`) and substitutes no inline token (it hands no `tokens`), so Newsletter — Inline Row prints `{members}` as written. The sweep also found four live designs no Epic 9/10 story names (DW-177), design notes that disagree about icons (DW-178), and pilot words declared `text` that their own category specs give the four marks (DW-179 — the owning category stories fix them, AD-35). The "Pilot sections" project links no site (`projects.linked_site_id` is null), so every canvas story before 5.18 previews Orbit Weekly there.
  - **Story 5.4's planning (2026-09-18, executed in the repo and read in the frames):** `RenderInput.visibility` already gates a section on BOTH emitters (Story 4.10, `core.ts` :200-202 and `gateMembers`), so Member visibility needs no runtime change — and it must never be declared as a design control, because a declared one would stamp a second, inert copy of the value on the root through `stampControls` (DW-186); it is an instance field beside `hidden`. R-114's own rule, run over its four values, refuses them as pills ("Logged out" is 66 px against a 58.3 px pill), so it is a NAMED SELECT — which `A22-1 Inline Row.dc.html:69` draws and `A4-13 Latest Post.dc.html:256`, drawn before R-114, does not. `doc-schema.ts` is strict at both levels, so every field a later story adds is `.default(…)` and never required, or every stored doc stops parsing on the next read. A React portal into the canvas document receives no React events, which is the mechanical reason AD-21 puts every pressable piece of chrome outside the frame. Also recorded: the register and the PRD disagree about which categories carry the row (DW-185), B7's "first time, then stop" has nowhere to remember a first time before 5.8 (DW-184), and the site doc's `a3/` footers compile last whatever the Site-wide card's order (DW-187).
  - **Story 5.5's planning (2026-09-18, read in the normative documents and executed against the library):** the "seven templates vs the six" is not a contradiction — **seven** is the synthesizable `.hbs` FILES (`sections-inventory.md:786`) and **six** is the CANVASES, because `home.hbs` and `index.hbs` share one (`:804-806`); FR-D6 states both in one sentence and no document says so. Synthesis is ONE core function (AD-27(d)), and today it resolves PARTLY: of the designs the Synthesis Defaults name, the library holds `a17/1` (so `tag` and `author` get their feed) and `a24/1` narrowed to `post.hbs` (so `page` gets nothing — DW-191), and none of A25, A26, A27, A28, A29, A31 or A3. So a default row the library cannot place is DROPPED with its reason and the dropped set is derived, while `editorData`'s loud refusals stay loud because they guard a user's STORED doc. Untouched is `project_templates`' absence (AD-22) and nothing here writes a row, so the round trip — materialise on the first edit, back to untouched when the last section goes, unchanged when every section is merely hidden (FR-D5) — is the whole proof. Also recorded: D5b's Private caption is circular against FR-D6's "called for" (DW-192), the three membership filenames are frozen public API and disagree at the first one (Question 3), and `TEMPLATES_OPEN` must stop counting canvases that emit nothing until designed.
- **Sources disagree — ask, do not pick:** the indicator's label count (four in 5.8, five in B6); whether the nudge timer stops or restarts on interaction (5.17); which modules run while editing (DW-133); who builds `doc-schema.ts` (AD-27 names Epic 4, whose stories are all done without it); which canvas designs `index.hbs` once Home is edited (5.5); where the interactive hover actions and "+" live, since AD-21 places only non-interactive chrome.
  - **Settled (2026-09-17):** where the hover actions and "+" live is Story 5.1's AD-21 amendment (outside the frame); when they arrive is R-118.
  - **Settled (2026-09-18, Story 5.5's Q1 — R-127):** `index.hbs` gets **no canvas, permanently** (`spec-5-1…md:373`'s reserved segment is closed), and once Home is designed it IS that doc **from its designated main feed onward** — everything above the feed dropped, the feed and everything below it kept in order. No designated main feed → the Synthesis Default stack, because `index.hbs` is always compiled (FR-I1). Untouched Home → unchanged (`sections-inventory.md:804-806`). One function, `indexStack` beside `synthesize`, called later by Story 7.3 and Story 5.16 (AD-27(d)).
  - **Also ruled at that Create (2026-09-18):** **R-128** — "+ New template" and the `FROM THE ROUTES MANAGER` heading are ABSENT until Story 7.16, R-118's rule applied a second time, nothing greyed and nothing captioned. **R-129** — the three membership canvases are `custom-signup.hbs` ("Signup"), `custom-signin.hbs` ("Signin") and `custom-member-home.hbs` ("Member home"); the filename is frozen public API and Ghost derives the label from it, so B19's `custom-membership.hbs` is superseded on the first row. Subscribe and Membership are ORDINARY custom page templates from the Routes Manager (FR-I3), not extra built-in rows.
  - **Story 5.5 built it (2026-09-18):** `synthesize(file, library)` and `indexStack(home, library)` are ONE pure core
    function pair in `packages/section-runtime/src/synthesize.ts`, over the normative Synthesis Defaults as a cited
    table; Story 7.3's compiler and Story 5.16's page-2 preview call the same ones (AD-27(d)). A default row the
    library cannot place is DROPPED with its reason and the dropped set is derived, while `editorData`'s refusals stay
    loud for STORED docs. `read.ts` applies synthesis and hands the editor `canvases`, `synthesized` and `dropped`, so
    D5a's marker is server truth; `editor.tsx`'s `commit()` is AD-22's round trip in ONE place (an edit materialises,
    the last section off gives the default stack back, hiding does neither). `isMainFeed` joined `doc-schema.ts` with
    its only writer, defaulted. The URL segment and the stored `template_key` stopped being the same string
    (`templateKeyOf`/`canvasOfTemplateKey`), `TEMPLATES_OPEN` became `templatesOpen` — the canvases that will actually
    SHIP, not every canvas — and D5a's Tag/Author labels replaced 5.1's "Tag archive"/"Author archive" (R-74). The
    Private canvas is conditional on the linked site reporting itself private; EXECUTED 2026-09-18, `sites.site_settings`
    carries no such flag, so the row is absent for every project today and `/private` 404s (DW-192).
- **Read the deferred-work ledger's Epic 5 entries at each Create:** DW-114 (5.1) may need the owner, DW-176 (the selection cleared by a canvas change) is CLOSED by 5.5's Dev, and DW-107 (image focus) and DW-122 (moving a section across templates) have no owner.
