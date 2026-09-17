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
- **Text is text plus marks, never HTML.** A string plus ordered ranges over exactly bold, italic, underline and link (the link record carries `newTab`/`rel`), edited through raw `contenteditable` with no editor-library DOM in the iframe; paste strips to the four, and the sidebar edits the same value.
- **Untouched is a real state.** An untouched synthesizable template shows its Synthesis Defaults under a worded marker and only an edit materializes it — never viewing, a preview subject or a member-state check; removing every section returns it to untouched, hiding does not, and other canvases open empty and emit nothing (AD-22).
- **Saving never costs speed.** Changes write locally without blocking; cloud sync runs on a timer (3 min, a per-user toggle with a data-loss warning), at tab close, on lock release, on ⌘S and before deploy or export, and says so when it falls back to per-change sync.
- **Undo counts edits.** One gesture is one transaction, one undo step and one edit (a Shuffle is one); 100 edits, replayable after a reload in the session, cleared only by a hydrate that supersedes the local doc, and no operation count is ever surfaced (AD-15, AD-16).
- **One editing context per project.** A second opener reads along and may request editing; the holder flushes then releases, an unanswered request may take over from the last synced snapshot, the displaced session is told its `unsynced_edits`, and deploy and export require the lock.
- **The canvas is a viewport.** The iframe is viewport-sized and scrolls internally, device preview resizes both axes (834; 390 × 844), the only scale is the automatic fit shown in a chip, and there is no zoom control, per-breakpoint editing or section cap.
- **Live content is read in the browser and degrades honestly.** Reads are cached 60 s, batched and de-duplicated across canvas, picker and link search under a per-session ceiling, and fall back to Orbit Weekly naming the cause on 429 (that Ghost rate-limits Content API keys is the PRD's statement, not a measurement); body HTML is never read — `{{content}}` is the style-guide fixture.
- **Zero items has three answers.** The main feed shows its designed empty state and is never back-filled, a secondary `{{#get}}` feed renders nothing, a bound prop follows its guard, and a user-authored list renders nothing at zero.
- **One main feed per natively paginated template, designated by this epic.** It binds the native `posts` context sized by `posts_per_page` or the route's `limit:` and alone offers Pagination style; other feeds cap Count at 100 and never emit `limit="all"`, and hand-picked order is the dragged order, warned past 25.
- **Tier presence is not purchasability.** Paid asks sit inside `@site.paid_members_enabled`, free asks inside `@site.allow_self_signup`, tier queries filter `type:paid+visibility:public`, the paywall is a template surface with its own editor, and nothing member-identifying is server-rendered (AD-38).
- **Behaviours hold still while designing.** Layout CSS is always live; module JavaScript runs on the canvas only for edit-safe modules, the others render at rest with a PAUSED chip on the behaviour, and Preview runs everything without chrome.
- **The canvas renders no untrusted HTML.** Content API values are text nodes, Ghost URLs are http/https only, excerpts are text-only, and `codeinjection_*` is never read in, though a browser settings read returned it on T3 (MEASUREMENTS §38b); no `'unsafe-eval'` is a requirement to prove on the real canvas, not a measured fact.
- **Keyboard-complete, with a device-test floor.** Single-key shortcuts work only while the shell holds focus, the canvas is one tab stop with a skip link and an `Esc` ladder, and every drag has a keyboard path; a coarse pointer below 834 gets the Small Screen Notice, while a desktop at 200% zoom keeps a reflowed editor (R-76, R-87).
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
  - **Story 5.2 moved the name tag and the outlines outside (2026-09-17, R-120, spine AD-21's second amendment — as built at ffa257e1, superseded by the next sub-bullet):** the tag, R-119's Pro badge and both outline boxes are elements in the editor document, inside the page card, anchored to the root with Floating UI (`@floating-ui/dom` 1.8.0, exact). The tag because inside the frame it would shrink with the fit, have no Inter and need a positioned root; the outlines because Chromium floors a border's or an outline's width to whole CSS pixels before the frame's scale applies (0.6px and 1.2px at 1440). Each box carries an inset box-shadow line, `globals.css` `canvas-outline-hover` (1px) and `canvas-outline-selected` (1.5px); `data-inflozo-hover` / `data-inflozo-selected` stay on the roots as state marks, and `canvas-chrome.css` holds no rule until painted chrome (5.10's hairline, 5.15's PAUSED, 5.3's empty slot) lands there. Verify a line's width as painted pixels from a device-scale screenshot, never computed style (`run-verify-editor.cjs` steps 10–11).
  - **Story 5.2, owner's finding (2026-09-17, AD-21's third amendment):** positioned from the editor document the boxes drifted 8–15px while the canvas scrolled (the compositor scrolls the iframe a frame ahead of the main thread). The boxes, tag and Pro badge are now portalled into `lib/canvas-layer.ts`'s shadow-root hosts on the canvas `<body>` — `page` (absolute) and `view` (fixed, for sticky/fixed roots), scaled by 1 / fit, adopting the editor's stylesheet, fonts added as `inflozo-chrome …` — and `@floating-ui/dom` is gone. Anything anchored from the editor document to a scrolling section lags the same way (5.4's pill): measure it with `run-verify-editor.cjs` step 15 (screencast frames against in-canvas markers during `Input.synthesizeScrollGesture`).
  - **Story 5.2 — `stampControls` strips the chrome attributes:** it removes every root `data-*` that is not a directive before stamping (`core.ts`), `data-inflozo-*` included, so whatever marks a root re-applies its attributes after every stamp and every paint (`editor.tsx` `mark()`). Any later chrome attribute on a root (5.3's, 5.21's PAUSED) inherits the rule.
- **A design switch replaces the root's attributes.** Undeclared ones go and their values park; a dark override is a second token-resolved value of the same control — never a `-dark` attribute or a mode selector in a design stylesheet — and `color_scheme` alone selects the mode (AD-3, AD-30).
- **CSP.** The app host uses a nonce with `'strict-dynamic'` and `frame-ancestors 'self'`; `connect-src` has been a static `'self' https:` since Story 3.2 (`apps/web/csp.ts`), though the PRD still says per-session (Story 5.1 corrected the spine).
  - **Story 5.1 verified the no-`'unsafe-eval'` half on the deployed editor (2026-09-17, the spine's CSP row, refreshed here at 5.2's Create):** `tools/probe/run-verify-editor.cjs` recorded zero violations behind an `EvalError` control, and the spine says the proof "is re-run at each Epic 5 story's Review" — so every Epic 5 story that adds a gesture adds it to that harness's step 5 session.
  - **Story 5.2 did (2026-09-17):** steps 10–13's hover, select, edits, reset and Esc run inside step 5's session and its zero is read after them; step 14's touch runs in its own `hasTouch` context, outside the CSP session.
- **The tables exist.** `edit_locks`, `project_templates`, `project_template_prefs`, `projects.revision` and `profiles.autosave_enabled` are in the complete-schema migration; changing them means a migration pushed first, alone (R-99).

## UX & Interaction Patterns

- **The export is the authority (R-74).** Each story names its frames — S4 the shell, D8 below 1440, D5 markers and switcher, `B Missing Surfaces` most satellites — and a frameless surface is extrapolated from the nearest.
- **Build as re-specified, not as drawn.** B11 has no zoom control; B8 no "Keep Free designs only" (R-77); S4c's pinned Quick Controls card is not built (R-113); S4d is three states with an unviewed marker and a gated indicator; P0-1 supersedes B4a; B5c states only a count of edits.
  - **R-118 (owner, 2026-09-17, Story 5.2's Q1):** a button on a hovered section arrives with the story that makes it work, absent until then — Duplicate, Delete and the drag handle with 5.4 (S4b's pill), ◀ ▶ with 5.11, the hairline "+" with 5.10, FR-D3's click on text with 5.3. Story 5.2 builds hover (outline, name tag), selection, the section panel, Esc, the empty state and tap-and-hold.
  - **R-119 (owner, 2026-09-17, Story 5.2's Q2):** on a Free plan a selected Pro design carries the Kit's `ProBadge` 8px inside its top-right corner (B10), on selection only and never pressable. S4b's pill wants the same corner; 5.4, which builds the pill, moves one of the two.
- **The settings panel is Section Settings · Content · Layout · Style · Data.** Nothing is pinned above, pills are for short choices (R-114), reset asks first (R-115); could-never is absent with a reason, could-but-not-now greyed with a caption, never a tooltip.
- **Colour never carries the only signal.** The indicator is a dot and a label, never a spinner; markers carry words; design, pack and Remix changes announce politely, lock notices assertively; reduced motion makes every transition instant.
- **Every editable list drags alike:** a dashed landing slot, nothing reorders until the drop, and `⌥↑`/`⌥↓` as the announced keyboard move.
- **Degraded states are designed.** A read-only session keeps the canvas legible with the sidebar dimmed under a reading-along bar; an irreversible confirm opens on cancel; pressed controls say what they are doing and every route has its own skeleton (R-98).

## Cross-Story Dependencies

- **5.1 first,** settling in its spec the URL scheme (project, template, template surface, browser Back) and which parts of the shell sit inside the iframe.
  - **Story 5.1 settled both (2026-09-17, spec § Design Notes):** `/projects/<uuid>` is Home and `/projects/<uuid>/{post,page,tag,author,error}` the rest (`apps/web/lib/editor.ts` is the scheme as data — the route, the Shell and the harness read it there); `/home` 308s; `index`, `private`, `custom-<slug>`, `paywall`, `cards` 404 until their stories. Canvas change is a soft-navigation push inside the `[id]` layout, which holds the editor so it stays mounted (5.8's flush hooks its unmount); modes and folds never enter the URL. Pages render nothing — the active canvas is read from the pathname.
- **5.8 underpins the loop:** its one-transaction-per-gesture journal makes a shuffle one edit (5.11, 5.12), gives 5.17 `unsynced_edits` and the superseding hydrate, and gives 5.23 a doc to assert over.
- **Earlier stories lean on later ones:** link search (5.3) and picker previews (5.10) share 5.18's fetch layer, 5.13's subject picker and 5.16's page 2 need 5.19, 5.14 needs 5.21's strip, 5.4's Post Content refusal lives in 5.10's picker, and 5.9's map spans the epic.
- **Across epics:** Epic 3's daily settings snapshot feeds the shims and members checks; Epic 6 replaces the token set; Epic 7 compiles the doc, gates deploy and export on the lock and flush, and repeats the warnings pre-deploy; A34's (5.19) and A32's (5.20) designs arrive in Epic 10.
- **Undeclared forward dependencies:** the library holds only the provisional pilots, so 5.11, 5.12 and 5.23's round trip have no second design to move to, and the repo's only 40-section fixture is `tools/stress`'s compile-sizing archetypes; the Synthesis Defaults and Post Content (5.4, 5.5) name designs Epics 9–10 author; pack re-roll and undo (5.12, 5.8) have one token set until Epic 6.
  - **Story 5.1, Question 1 ruled option 1 (owner, 2026-09-17)** — nothing places a section before 5.10, so the owner's tests of 5.2–5.9 run on "Pilot sections": the pilots across `site`, `home` and `post`, added once to his own account by 5.1's Deploy through `tools/probe/seed-editor-project.mjs`. Reuse it; never seed a second.
- **Sources disagree — ask, do not pick:** the indicator's label count (four in 5.8, five in B6); whether the nudge timer stops or restarts on interaction (5.17); which modules run while editing (DW-133); who builds `doc-schema.ts` (AD-27 names Epic 4, whose stories are all done without it); which canvas designs `index.hbs` once Home is edited (5.5); where the interactive hover actions and "+" live, since AD-21 places only non-interactive chrome.
  - **Settled (2026-09-17):** where the hover actions and "+" live is Story 5.1's AD-21 amendment (outside the frame); when they arrive is R-118.
- **Read the deferred-work ledger's Epic 5 entries at each Create:** DW-114 (5.1) and DW-163 (5.4) may need the owner, and DW-107 (image focus) and DW-122 (moving a section across templates) have no owner.
