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
  - **Story 5.11's planning (2026-09-20, read in the runtime and executed over the library):** the rule is
    SMALLER THAN IT READS, and the reason is FR-G3: `contentSchema` is the CATEGORY's union and a ring never
    leaves its category, so content, items and `data` carry across a swap UNTOUCHED and only `controlSchema`
    — per design (FR-F7) — needs carry / park / default. `parkedControls` is keyed by design id and parks
    `controls` AND `darkOverrides` together, because a dark override is a second value of the same control
    (AD-30, `storedFor`) and "restored exactly" means both; it lives inside `project_templates.doc`, which is
    `jsonb`, so there is no migration and **no Schema phase**. What does NOT exist anywhere: a per-design item
    cap (FR-D13's "8 items · 3 shown in this design") — `PropDef.max` is the union's ceiling and cannot narrow
    per design, and CSS decides the fit, so the design must DECLARE it: `data-items-limit` joins `DIRECTIVES`
    beside `data-repeat-limit` and is applied inside `expandItems`, the ONE function both emitters share, so
    agreement holds by construction. A30's `surface` partition also has no field, so `SectionRegistryEntry`
    gains an optional one that nothing declares until Epic 10. **AND THE LIBRARY HOLDS NO RING AT ALL** — every
    category in `packages/library/designs/` holds exactly one design — so the whole rule would be asserted
    vacuously; the proof is a SECOND FIXTURE DESIGN in `packages/library/fixtures/controls/`, which is a real
    validated category with an authored array and a `darkOverride` control, is already read by `controls.test.ts`
    and by the deployed `/controls`, and is not the shipped library (AD-35 untouched). **DW-209 is this story's**
    (the wheel over 5.10's "+" pill), and the frames disagree once: B1b draws an ink pill at the section's
    top-LEFT with the counter, Shuffle and a `⋯`, while S4b and `S6:67` both draw the counter and arrows in the
    white quick-action pill at `top:10px;right:10px` that Story 5.4 already built and R-125 already placed — so
    S4b + S6 govern the pill and B1b governs the affordance.
  - **Story 5.11 built it (2026-09-20):** ONE pure function decides what carries, parks and defaults —
    `switchControls(from, to, state)` in `controls.ts` — and ONE doc operation calls it, `switchDesign` in
    `doc-edit.ts`, so the panel's thumbnails and ◀ ▶, the section pill's ◀ ▶, `[` / `]` and the pill's Shuffle (its
    ONE seat since the owner's test amended R-159, below) are four doors onto one rule and every swap is one `apply` → `commit`, one journal entry and one `⌘Z`. A RESTORED
    VALUE WINS OVER A CARRIED ONE (**R-160**, owner, 2026-09-20, Story 5.11's Q3) in the single case where both exist (a shared control changed on an intermediate
    design) and the record is CLEARED in the same breath, because "exactly as you left it" is the promise the ring
    is sold on. Membership is the library's: `ringFor`/`samePartition` beside `offeredOn`, comparing
    `bindingContext` and `compileTarget` as EQUAL SETS rather than an intersection — a narrower set is a different
    ring, or a swap would take a section off a template it is already on — plus A30's new optional `surface`, which
    nothing declares. `data-items-limit` joined `DIRECTIVES` with `data-repeat-limit`'s grammar and its orphan
    guard, applied inside `expandItems`; `itemsShown` had to live in `controls.ts` and NOT `core.ts`, because core
    imports controls. **`instanceSchema.designId` widened from `a\d+` to `categoryOf`'s own rule**, so the harness
    can store a `controls/n` section. The panel block is a SIBLING of `Sidebar` and not a row in it (FR-F3), and
    each strip tile is a positioned box with a TRANSPARENT BUTTON OVER IT: a preview is an `<iframe>`, and
    interactive content inside a `<button>` is axe's `nested-interactive`. **DW-209 was EXECUTED and fixed** — a
    wheel over a pill scrolled the canvas 0px against the iframe's 500px, so both pills now forward their wheel; a
    customer felt the same stall. Every ring in the shipped library is length 1, so in the editor itself every one
    of these controls is ABSENT (UX-DR3) and the block reads "1 of 1" beside its `Design` label; the rule is walked on the deployed
    `/controls` and, on every commit, by `pnpm keyboard` over the three fixture designs.
  - **Story 5.12's planning (2026-09-20, read in the journal and executed over the library):** Remix needs NO
    new mechanism — `ringFor` + `switchDesign` are the whole of it, and the only real decision is the
    TRANSACTION. `commit(written, touched)` journals ONE doc and `undo()` restores ONE doc
    (`journal.ts:109-119`, whose header says so in words), so a re-roll that touched the site doc as well
    would cost two `⌘Z` presses and FR-D17's single-step undo would be false — which is why **R-161** scopes
    the dice to the current canvas and leaves `journal.ts` untouched (the tick-box and the `txn`-grouped undo
    land with the first site-wide ring; `unsyncedEdits` already counts by `txn`). The fold is one loop over
    `switchDesign` into one next doc and ONE `commit`, so FR-D9's "never half-applying" is one check before
    one assignment. **FR-D17's "pack only" scope cannot exist yet**: `lib/style-pack.ts` calls Paper *"the
    only pack that exists today"*, E6 owns the column and the editor neither reads nor writes it — so B8's
    whole "Re-roll what" group is ABSENT (UX-DR3, R-118 again), and so is its "Every page" row, which FR-D17
    never asked for. The picks are pure and importless in `apps/web/lib/remix.ts` beside `ring.ts`, handed
    their `random` (AD-1) and reusing `shuffleTo` rather than a second "a different member of this ring".
    No toast: EXPERIENCE.md:541 makes the section count a POLITE canvas-status announcement and `#editor-said`
    is the one live region, while R-143 already gave undo its single seat. `parkedControls` and the doc schema
    are untouched, so there is **no Schema phase**.
  - **Story 5.12 built it (2026-09-20):** Remix added NO mechanism — `apps/web/lib/remix.ts` is one pure picker
    (`remixPicks` = one `shuffleTo` over each section's own `ringFor`) and `editor.tsx`'s `onRemix` folds every pick
    through `switchDesign` into ONE next doc and ONE `apply` → `commit`, so the whole re-roll is one journal entry,
    one `⌘Z` and one lit Undo arrow, and FR-D9's "never half-applying" is one check before one assignment.
    **THE COUNT IS THE PICKS** — `remixable` IS `remixPicks` counted, so the confirm can never say six and move five
    (standing rule 4). R-161 is one line in the handler: the picks are taken from `docs[templateKeyOf(key)]` alone,
    so the site doc is never touched and `journal.ts` is unchanged. The door is `components/editor/remix-dice.tsx`:
    ModeToggle's geometry, icon-only with `REMIX_WORDS` as name and title, an 18px CSS 3D cube whose faces, hairline
    and pips are `globals.css`'s `.remix-dice__*` rules in `--color-surface` / `--color-line` / `--color-coral`
    (`tokens.test.ts:125` forbids a hex in a `.tsx`), rolling on ONE inline `transform` — a random face plus two
    whole turns, so the value always changes and `transitionend` is guaranteed. **THE RE-ROLL LANDS ON THAT EVENT
    AND ON NOTHING ELSE — and since R-164 the confirm opens on the PRESS, before anything rolls**, which is what
    makes the reduced-motion degrade free: `globals.css` flattens the roll and the re-roll arrives at once, with no timer to keep in step (`emulateMedia` proves it in the journey — `test.use({
    reducedMotion })` is a CONTEXT option and was silently ignored by this gate's own context). It leads the
    right-hand cluster rather than following the sun, because R-135 does not render `ModeToggle` at all on a
    Light-only project and a dice after it would move. `⇧R` is `keymap.ts`'s first SHIFTED single key (`shift: true`,
    or a bare `r` would bind too) and reaches the same handle `run(gesture)` uses, so the key and the button are one
    control down to the animation. R-162: the same component is mounted on `/controls` over that page's own
    `ControlState`, and its existing key effect widened to accept `remix` rather than growing a second key table.
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
    - **Story 5.10 built it (2026-09-20):** the filter is ONE pure query — `offeredOn(entry, file)` in
    `packages/library/src/placement.ts` (`isPlaceable` ∧ `compileTarget` ∧ a non-empty `bindingContext` intersection
    with `CONTEXTS_BY_TARGET`, the appendix-B1 §3/§5 table) — and the rail, the grid, the counts and all three empty
    states are readers of `apps/web/lib/picker.ts` over it, so nothing that cannot work is ever drawn. **A SITE-WIDE
    DESIGN IS ASKED ABOUT TWO FILES, NOT ONE** (found by executing): a header compiles to `default.hbs` alone, so a
    picker asking only about `home.hbs` offered no Headers category at all, which R-152 requires — `offeredHere`
    therefore takes the canvas's file AND the site's, and `isSiteWide` decides where a placement lands. The
    `bindingContext` table is paired with the validator rule `context-unreachable`, so a wrong table breaks a build
    instead of shrinking a rail. The category's DISPLAY NAME joined `CategoryContent` (`content.json`, validated
    non-empty and never the bare id) and rides the entry as `categoryTitle`. `insertSection` joined `doc-edit.ts`
    beside `duplicateSection`, and the placement goes through `apply` → `commit`, so it is one edit, one journal
    entry and one `⌘Z` — a site-wide REPLACEMENT is a remove and an insert inside that one transaction. The overlay
    is a native modal `<dialog>`, which gives `Esc`, the focus trap and the return of focus for nothing and makes
    every single-key binding go quiet while it is open with no new guard. Each card's preview is `renderSection`
    into an **`inert`** `/canvas` iframe at Desktop width, created on intersection — `inert` is what keeps R-149 at
    one rule on one element. **`ModeToggle` gained an `id` parameter**, because R-151's second one duplicated
    `editor-mode`, which the deployed walk reads by id. `pilots.test.ts`'s chrome-selector reader learned at-rules
    (a `@keyframes` block carries no selector; a `@media` wrapper's inner rules are still held to the key), because
    the hairline needs both and `globals.css` cannot reach the canvas document. **DW-190 is CLOSED**: the picker's
    own refusal line is the home a refusal with no section to sit on was waiting for.
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
  - **Story 5.17's planning (2026-09-23), and two rulings that decide every string.** The whole DB side already
    exists and NOTHING uses it: the table, both guard triggers and the RLS gate's F4 assertions have been there since
    the complete-schema migration, and `unsyncedEdits(j)` (`journal.ts:140`) was written, tested and rendered nowhere
    by Story 5.8. **No migration is expected**: `lock_generation` is in the UPDATE grant and out of the INSERT grant,
    so acquire and take-over are an OPTIMISTIC COMPARE-AND-SWAP (`generation N → N+1` filtered on `N`) that
    `guard_lock_takeover` was written to enforce — executed against the real Supabase as the story's first task
    before any UI, because that is a PostgREST claim and therefore a hypothesis. Transport has three layers, cheapest
    first: `BroadcastChannel` (same browser, free), a Supabase Realtime BROADCAST channel (ephemeral, so no
    publication and no migration), and the heartbeat's own ~15 s round trip as the floor — `addendum.md:45` is the
    only statement of that transport in the project and **nothing has ever executed it**. **D8g, the deploy/export
    gate, is NOT built**: Ship it (7.18) and Export (7.26) do not exist, so the prompt is unreachable — DW-238, and
    `lock-takeover.tsx` takes its strings as props so those two render it.
  - ***The owner's two rulings, the same day.*** **R-189 — there is no Rosa.** A project carries one `user_id` and
    team seats are out of v1, so the other editing context is ALWAYS the same person; B5a/B5b/B5c keep their shapes
    and escalation and lose the person: *"You are editing this site somewhere else — you are reading along here"*,
    *"Your other session wants to edit"*, *"Take over from your other session?"*, **"Or message Rosa" withdrawn**,
    the avatar carrying the Kit's `Lock` instead of initials, and the displaced session reading *"**This** session
    had X unsynced edits; they were not included."* **R-190 — `unsynced`, never `unsaved`**, in every string, because
    the indicator on the same screen prints "Saved on this device" then "Synced" (R-170 a third time). The stored
    column stays `unsynced_edits` and the count stays EDITS, never ops (AD-16).
  - ***Two wordings this story corrects, not reverses.*** F-079 ruled the holder's countdown **restarts** on any
    interaction including focus; `UX-DR13` and EXPERIENCE.md § Time limits still say "stops", and so did this story's
    own AC. Restart is the built behaviour and the three wordings are a task (standing rule 3). And §AD4's ~30 s is
    the countdown, not B5b's drawn "60s" — EXPERIENCE.md rules that difference explicitly not a finding.
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
  - **Story 5.13's planning (2026-09-20, read in the schema, the runtime and the frames):** the pill and the
    subject need NO new mechanism and NO migration — `project_template_prefs.preview_subject` (`{kind, id, slug}`)
    has been in the complete-schema migration since day one with **no reader anywhere in `apps/web`**, its grants
    and both policies are in place, and DW-193 fixed its `template_key_shape` on this table too at 5.8. The seam is
    ONE OPTIONAL ARGUMENT on the one function that already decides what a template hands a section —
    `templateContext(target, feed, subject?)` — threaded through `renderSection`, the single door the editor,
    `section-preview.tsx` and `/pilots` all paint through; passing nothing keeps today's render, which is why
    `tools/check-snapshots.mjs` (NFR-6(c1)) and the render matrix are untouched **and is the story's control**.
    A separate pure `resolveSubject(file, stored)` answers *which subject, and did the stored one survive*, because
    `templateContext` returns a render context and has no way to report a fallback. **AND THE ARCHIVES WERE WRONG
    BEFORE ANYONE CHOSE ANYTHING** (executed): `templateContext` gives `tag.hbs` and `author.hbs` the WHOLE bundled
    feed, the same rows `home.hbs` gets, so a Tag canvas renders a feed Ghost would never serve — `a17/1`, the only
    design compiling there, renders it faithfully so nothing looks broken. `appendix-b1-template-contexts.md` §3 is
    decisive: a list template is flat at the root with the taxonomy object alongside, and its `posts` are that
    taxonomy's. Which canvases have a subject is DERIVED from `placement.ts`'s `NATIVE` table (a file whose native
    set holds a singular resource), never a list of four; `NATIVE` is module-private and `CONTEXTS_BY_TARGET` folds
    `GETTABLE` into it, so the story exports ONE query, `nativeResourceOf(file)`, over the same table. The fixture
    subjects for the archives cannot be hidden rows the way `subjects.post` and `subjects.page` are — an archive's
    posts come from the feed — so they join `dataset.subjects` as SLUGS of rows that already exist. No shortcut
    (FR-D11 names the preview subject *"set-and-forget context"*), no journal entry, **no Schema phase**.
  - **As built (Story 5.13, 2026-09-21):** the seam is exactly one optional argument — `templateContext(target,
    feed, subject?)` — threaded through `renderSection`'s `o` object, and a two-argument call still answers what it
    answered before: asserted as the FIRST test in `orbit-weekly.test.ts` and byte for byte by
    `tools/check-snapshots.mjs` and the render-matrix gate, both unchanged and green. `resolveSubject(file, stored)`
    and `fixtureSubject(file)` are pure and sit beside `subjectKindOf`, which widens `placement.ts`'s new
    `nativeResourceOf(file)` by the one distinction a RESOURCE cannot draw (§4.2: `page.hbs` carries the same `post`
    object and is a different product). `dataset.subjects` gained `tag: field-notes` and `author: rosa-menendez` as
    slugs of rows that already exist. `apps/web/lib/preview-subject.ts` is the pure half of the surface — the words,
    D5e's rows, the search and the two sentences — and its `SubjectSource` argument is the seam Story 5.18 moves;
    `components/editor/source-pill.tsx` is B9's pill at R-166's 24px with D5e's menu on `openMenu`'s own
    `popover="auto"` vocabulary. The pill carries **no `aria-label`**: a hand-written name over visible text fails
    WCAG 2.5.3 the moment the two are punctuated differently, so the button's name is its own words plus one
    `sr-only` line. `(editor)/actions.ts` is the first writer of `project_template_prefs` and `read.ts` its first
    reader; a failed prefs read is logged and answered with NONE, because the fixture is a correct canvas and a
    preference must never black out an editor.
- **Zero items has three answers.** The main feed shows its designed empty state and is never back-filled, a secondary `{{#get}}` feed renders nothing, a bound prop follows its guard, and a user-authored list renders nothing at zero.
- **One main feed per natively paginated template, designated by this epic.** It binds the native `posts` context sized by `posts_per_page` or the route's `limit:` and alone offers Pagination style; other feeds cap Count at 100 and never emit `limit="all"`, and hand-picked order is the dragged order, warned past 25.
  - **Story 5.16's planning (2026-09-22, read in the runtime, the frames and Ghost's source on both majors) — SUPERSEDED
    by the owner's R-178 to R-180 and the *As built* sub-bullet below, kept as the record of the first plan:** page 2
    needs NO migration and NO new mechanism beyond one seam. `FeedState` has no page 2 (`middle` is page 3 of the
    bundled five), so `templateContext` gains `'second'` plus `feedPages(target, subject)`, the one question asked
    before offering it. What Home's page 2 IS stays R-127's `indexStack`, rendered at `index.hbs` (Ghost puts
    `home.hbs` first only at exactly `/`, `templates.js:67`), and **the page enters at `stackOf`, not at the paint**,
    because roots, picks, marks, restamps, the panel's fast path and every edit are aligned with `latest.stack`.
    **THE PAGE'S ADDRESS WAS WRONG BEFORE ANYONE ASKED FOR PAGE 2** (DW-218): every branch answered `currentUrl: '/'`
    and the header renders at `default.hbs`, which always gets `/`, while Ghost sets `nav-current` on an exact
    `relativeUrl` match only (`utils.js:61`, executed on both majors) and Rail draws it — so the canvas address comes
    from one function and is handed to every section. It is offered on the canvas's own `isMainFeed` section, read
    never written: synthesis sets it on every untouched Home, Tag and Author page, and the owner's Ghost 5 Project Home
    kept one, while his Pilot sections Home (seeded before the flag) has none. Only a17/1 draws a pager; only Home's
    feed reaches five pages; Field Notes and Reporting reach two and no writer reaches two. D5d's numbered pager is
    R-109's, not built. **No Schema phase.**
  - **R-176 · R-177 (owner, 2026-09-22, Story 5.16's Q1 and Q2).** **R-176:** where a page has no page 2 — a one-page
    archive, a hidden main feed — no page-2 preview is offered at all, not even greyed; where it exists it is the real
    one (Ghost 404s past the last page, `channel.js:55-60`). **R-177:** page 2 is edited exactly as page 1 is — every
    section it shows, on the canvas, in Layers and by key — and stands for every page after it: a change there is
    made to that section, so pages 3, 4, 5… and page 1 carry it, and no page 3 or later is offered. Only a row page 2
    leaves out (Home, above the main feed) is greyed, superseding D5d's greyed layers. The one piece of page-1
    arithmetic was `invokedAt`, which moves to identity, and a placement from above the feed on Home's page 2 lands
    directly below it.
    - *Amended the same day by **R-178** (owner, 2026-09-22):* page 1 and page 2 are SEPARATE designs. Page 2 starts
      as a copy of page 1 and follows it until the first change made on page 2, which makes it page 2's own; nothing
      done on page 2 changes page 1; pages 3, 4, 5… show page 2's design. It holds on Tag and Author pages too — only a
      separate page-2 design lets R-177 and R-178 both hold, and Ghost's `paged` context (page 2 on) is what the theme
      switches on. So R-177's "page 1 carries it" and the page-aware `stackOf` over `indexStack` above no longer
      describe page 2. The spec went back to `draft`, to be re-planned once its Questions 3 (on Home, does page 2 start
      from the post grid down, as R-127 had it, or with all of page 1?) and 4 (can the site-wide header and footer be
      changed from page 2?) are ruled.
    - ***R-179 · R-180** (owner, 2026-09-22, Story 5.16's Q3 and Q4), and the re-plan.* **R-179:** page 2 starts as an
      EXACT copy of page 1 — every section, a Home's band above the grid included — on Home, Tag and Author alike, and
      each section of page 2 and its settings is then changed on its own ("style" is a section's settings; the Style
      Pack stays one per site). **R-180:** the site-wide header and footer CAN be changed from page 2 and change
      everywhere; FR-D5's existing dialog asks before Hide and Delete as always, and on page 2 before the first change
      to each (read as such, and stated to the owner). **As planned:** page 2 is a DOC OF ITS OWN — Home's under
      `index` (a key the schema accepted from day one), Tag's and Author's under `tag-paged` and `author-paged`, which a
      migration adds first, so **5.16 has a Schema phase** (R-99). Until its first change a page 2 follows page 1 as a
      live copy stored nowhere (AD-22: only an edit materialises); the first change stores it; an undo back, or emptying
      it, returns it to following. `pageTwoStack` replaces `indexStack` (AD-27(d)) — own doc, else exact copy, else for
      a Home with no main feed R-127's Synthesis Default fallback, kept for 7.3. A design placeable on `home.hbs` may sit
      on `index.hbs` (one rule in `placement.ts`), or R-179's copy of a Home holding a22/1 or a4/13 would black out
      `read.ts`. Page 2's rows are a whole doc, so ⌘K's `invokedAt` and the pill's drag need no change, and no layer is
      greyed on page 2.
    - ***As built (Story 5.16, 2026-09-22).*** The Schema phase went first and alone (`c8eff23d`, applied through the
      pooler and read back, MEASUREMENTS §48 (g)). **`docs` holds what is STORED**: a page 2 that follows holds nothing,
      and `lib/page-two.ts` derives its live copy through the runtime's `pageTwoStack` wherever it is read — the stack
      (`stackOf(docs, canvas, page)`, page 2's rows stamped with page 2's key and file), Layers, and every edit, which
      reads `editedDoc` (`apply`, `withState`'s one-key map, `moveTo`, Remix, the pill's drag). `commit()` writes the
      TOUCHED key alone, so a map carrying a copy can never store it, and the flush, the local store and the hydrate
      needed no change at all. `committed()` is page 2's round trip: zero instances store the empty doc (a zero-instance
      row reads as following, AD-22) and say `back`; the first change's journal `before` is the stored nothing, so its
      undo follows again. **The page is keyed to its canvas** (`shownPage`), so the render that shows another canvas is
      already page 1, and the `[key]` effect makes it stick. `switchPage` is the one door (row, pill, an undo that took
      page 1's main feed away, a subject whose archive fits one page — the last two say why, "Back to page 1: …");
      it CARRIES the selection by instance id, which the copy shares with page 1, and the panel is keyed across pages
      (`acrossPages`), so focus stays on D5d's row. **The address**: `templateContext` computes every page's own
      (`listOf` + `addressOf`, pinned to the shim's `pageUrl`), `second` throws past a one-page list, `feedPages` reads
      the same rows, and `paint()` hands the page's `currentUrl` to every section as `renderSection`'s new `url` —
      `/pilots`, `check-snapshots` and the matrix pass none and are byte-unchanged. `placement.ts`'s `compilesTo` is the
      one Home-and-index rule (`read.ts`, `synthesize`'s drop, `offeredOn`). **R-180** is a hold in `commit()`: on page
      2 a site-wide change is kept in FR-D5's dialog as the `change` kind (`apply` answers a `HELD` symbol, so nothing
      announces a change that has not landed), the confirm lands it, Cancel repaints, the Hide/Delete confirm counts as
      the ask, and every change of page empties the asked set. The pill is `components/editor/page-two-pill.tsx`; on
      page 2 the ground's top padding is 50px (the 38px pill 4px down, plus R-138's 8), measured, and the pill meets
      the chip below about 1205px with both panels open (Story 5.22's card). Page 2 keeps its own "looked at" record,
      and `afterChange`'s `followers` runs out a following page 2's with page 1's. Two readings differ from the spec's
      Code Map and are the behaviour's: the viewed-record effect reads the page-aware key (R-167's own record), and D5b's
      "empty" dots and the Section Picker keep the canvas's own file (identical offers, cards unchanged). CI walks it:
      the harness Home's post grid carries `isMainFeed`, derived from `SYNTHESIS_DEFAULTS`, and the journeys cover the
      entry, following and forking, R-180, the pill, the no-key sweep and page 2 stopping being offered; the deployed
      walk's step 92 covers the rest on production.
    - ***The owner, after Dev (2026-09-22).*** **R-181**: under D5d's row, the Kit's helper caption "Pages 3, 4, 5 and on
      use page 2's design." (`LATER_PAGES`), the radio group's description. **`{page_number}`**, a token every text
      field would accept, is the spec's Questions 5 to 7 — it amends R-27's per-field token lists. Ruled the same day:
      **R-182** (the canvas shows the page's own number; the name stays `{page_number}`, since Ghost has no `{{page}}`
      helper and the token never passes through `{{t}}`; nothing shows a number the user did not type), **R-183**
      (nothing where a page has no number) and **R-184** (its own story: **Story 5.16a**, straight after this one).
    - ***Story 5.16a built it (2026-09-23).*** **The offer and the value are two rules, and that is the whole shape.**
      `placeholdersOffered(def, { page, siteWide })` in `vocabulary.ts` is the ONE answer to "which placeholders does
      this field offer here" — the prop's own, plus `page_number` only when the canvas shows page 2 and the section is
      not site-wide (**R-186**, **R-187**) — and both field kinds, the tests and every later placeholder ask it, because
      a rule with two implementations is a rule with one bug. The VALUE is unrestricted: `page_number` joins
      `TOKEN_SET` and every prop's `declared` list, so a token typed into a header by hand still prints 2 on page 2 and
      nothing elsewhere. **`{page_number}` is a SIBLING CONSTANT of `INLINE_TOKENS`, never a fourth member**, so
      `validate.ts` still refuses a design that declares it (naming R-182), and a second refusal,
      `no-placeholder-description`, is what makes R-185's "all future placeholders" a gate rather than a habit: every
      declared token needs a line in `PLACEHOLDERS`, which is what the menu prints. **THE THEME'S CONSTANT COULD NOT
      SPELL `@root`** — the recorder (`tools/probe/record-page-number.py`, MEASUREMENTS §49) found gscan refuses every
      `@root.…` path as GS120-NO-UNKNOWN-GLOBALS, an ERROR on BOTH majors, so `PAGE_NUMBER_HBS` is
      `{{#if pagination.prev}}{{pagination.page}}{{/if}}`; the guard printed nothing at `/`, 2 and 3 on pages 2 and 3
      and nothing on a post, a page and the 404, on T1 and T3 alike, and the 70-section theme gates 0/0 with the
      expression in it. The one place the spellings differ is inside `{{#foreach}}`, measured and priced at zero: no
      design puts a `data-prop` inside a `data-repeat` (`docs/section-authoring.md` says so). **ESCAPING AND
      SUBSTITUTION ARE NOW INTERLEAVED** in `serializeMarks` — each literal piece escaped on its own, the replacement
      inserted between them — so a typed `{{page_number}}` emits the constant between `&#123;` and `&#125;` and never a
      triple-stache (AD-5's one stated exception, bounded in the SPINE). **`UserText` learned its two sinks**, and that
      was a real hole the AD-36 vector caught: parking an attribute value through the same door put the live expression
      into an `href`, so `put(path, value, 'attribute')` leaves the token exactly as typed there. The canvas side is one
      more field of a call `paint()` already made — `site.pagination?.page`, handed to every section beside `url`, ONLY
      on page 2; page 1 and Post/Page/404 hand none and the token resolves to the EMPTY string, while the two EDITING
      sinks (`lib/inline.ts`, the panel's redraw) pass no token values at all and so show it as typed, which is what
      makes clicking into the words work. **P0-1's chip row is gone** (R-185): `TokenRow` deleted with both call sites,
      the braces sentence withdrawn from the product, and `components/controls/placeholder-menu.tsx` is the one `{}`
      trigger and menu, built from `bar-menu.tsx`'s new `PlaceholderRow` (a `<li>` with two buttons, because
      `BarMenuRow` IS a button) and placed by `openMenu`. `TextInput` gained the `aside` slot every control row already
      had. Nothing stored changed, so there was **no Schema phase**.
    - ***The owner's test of it, the same day (2026-09-23).*** **R-188** — five findings on R-185's menu and one
      ruling on the `{{#foreach}}` limitation. The two row actions are Tabler `copy` and `text-plus`, **glyphs with no
      words**, each naming itself through `title` and `aria-label`; **Copy answers with a tick** (Tabler `check`) **for
      two seconds**; **Insert CLOSES the menu**, reversing R-185's first reading; **the description is never cropped**
      and wraps to as many lines as it needs; and every row carries `BarMenuRow`'s own hover. The last two live in
      `PlaceholderRow` itself, so the placeholder menu and the Template switcher cannot drift apart (R-171, R-74).
      Question 4, ruled option 1: the `{{#foreach}}` note **stays a written note**, and `tools/stress/test-vocabulary.mjs`'s
      R-188 sweep — inside `pnpm check` — fails by name the day an editable prop appears inside a `data-repeat`, rather
      than forbidding it outright.
- **Tier presence is not purchasability.** Paid asks sit inside `@site.paid_members_enabled`, free asks inside `@site.allow_self_signup`, tier queries filter `type:paid+visibility:public`, the paywall is a template surface with its own editor, and nothing member-identifying is server-rendered (AD-38).
  - **Story 5.14's planning (2026-09-21, read in the runtime, the schema and the frames, and in Ghost's source on
    both majors):** member-state preview needs NO runtime change and NO migration. Story 4.10 built
    `RenderInput.member`, `MEMBER_GATE` and `gateMembers` — on the canvas an element gated to another visitor is
    REMOVED, so a visitor change is a REPAINT, never 5.6's re-stamp — `/pilots` already switches it, and the
    editor pinned it to `PREVIEWS = 'anonymous'`, whose three readers are the paint, R-124's caption and the
    picker/ring previews. `project_template_prefs.member_states_viewed text[]` has been in the complete-schema
    migration since day one with no reader (AD-22 names it), so **no Schema phase**. View as is a MODE like the
    device (`EXPERIENCE.md:230`): session state, never stored. It sits beside Template in the centred group, where
    every drawn bar puts it (S4a–c, S6, S7, S14, P0-6, D8, M1) — the right-cluster comment was a guess, and R-130
    removed a chip from that group, not its second control. **The member object was read in source:**
    `update-local-template-options.js:27-40` gives exactly FR-D16's eight fields and `null`, with
    `paid: status !== 'free'`, so `comped` AND Ghost 6's `gift` (`member-bread-service.js:135`, which no document
    names) preview as Paid; `has.js:128` picks only `site`, `config` and `labs`, so `{{#has any="@member"}}` can
    never be true. FR-D16's "bindable member object" (2026-08-19) predates R-4, R-28 and AD-38 (2026-08-27), which
    let none of the six identifying fields be printed and whose targets missed FR-D16 — so nothing binds
    `@member` and the canvas previews the TIER. Three borrowed parts land elsewhere (R-118): Ghost's strip →
    5.21 (its criteria already honour the toggle; the audience rule `visitors · free_members · paid_members`, paid
    meaning any status but free, was read on both majors); the "Gated content — shown with sample text"
    indicator, `access` per visitor (`checkPostAccess`) and DW-128 → 5.20, the first canvas that draws a gated
    body (no canvas draws a body today, and the default Post subject is `visibility: members`, so a
    subject-keyed indicator would describe an article that is not on screen); the Pre-flight row → 7.18 (FR-D16
    cites FR-J13, which is 7.20's backup gate). Also found: §4 names no member-state pass though FR-D16 relies on
    one (a DW at Dev), and on every pilot Free and Paid render alike (Rail's two Account links, the Inline Row's two
    "Signed in" slots), so only a section's Member visibility separates them before Epics 9 and 10.
  - **As built (Story 5.14, 2026-09-21):** `PREVIEWS` is gone and the visitor is `viewAs`, session state in `latest`
    beside the mode and the device, handed to `renderSection`'s existing `member` — so the canvas, R-124's caption, the
    Section Picker's cards and the Design ring's tiles all paint it through the one door, and a choice is `paint()`
    (update `latest`, paint, then `#editor-said`) because `gateMembers` removes elements. `apps/web/lib/view-as.ts` is
    the pure half: `VISITORS` derived from `MEMBER_STATES`, S4a's and S4d's words, `PREVIEWING` (moved out of
    `sidebar.tsx`, so the caption and the live region read one list), `readViewed`, `seen` (the SAME array when nothing
    changed, so nothing is written), `unviewed`, `markerWords` and R-167's `afterChange`, which returns only the
    records that change and is called by `commit()` and `restore()` alone; an undo that restores a canvas NOT on screen
    leaves it viewed as nobody. The record is written by `setViewedStates`, one upsert naming only its own column,
    through ONE promise chain, and a refusal is logged and never said — the harness has no database, so `pnpm keyboard`
    walks that refusal on every commit. `components/editor/view-as.tsx` is S4a's trigger (the value slot as wide as its
    widest word, the three words stacked in one grid cell, so Template never moves; no `aria-label`), S4d's menu on
    `openMenu`'s new `align: 'center'` (centred in the next-frame pass, where the menu has a width, then clamped by the
    same rule) and S4d's marker hung absolutely 2px off the trigger — measured on the frame — so the centred group
    (`#editor-centre`, now what step 2 measures) never moves. `Crown` joined `kit/icons.tsx` from S4d `:403`. The
    UX-DR9 Tab budget in `journey.spec.mjs` is now COUNTED off the page: View as made the hand-written `+ 14` one short.
    §4's missing member-state pass is DW-221, and DW-128 moved to Story 5.20. Found at Dev: in S4d's 260px menu an
    unviewed row's "Not viewed" chip leaves the caption about 112px, so those captions wrap to two lines where the frame
    draws one (the frame draws no chip). Both the 260 and the chip are the spec's, so it is built as specified and the
    owner's test (step 2) names the wrap for him to judge (R-80); a wider menu would be a departure from S4d. The
    trigger's value is LEFT-aligned in its fixed slot, so each word sits S4a's 7px after "View as".
  - **The owner's findings on the deployed build `d4d6e266` (2026-09-21): R-169 and R-170.**
    - **R-169:** the "N not viewed" marker and the rows' "Not viewed" chips are gone. Each unviewed row of the menu
      carries one 8px `coral-deep` dot in the check's slot, with its word kept `sr-only`, and nothing sits beside the
      trigger. That also ends the caption wrap noted above.
    - **R-170:** each visitor has ONE name, S4d's row title: "Logged out user · Free member · Paid member".
      - It appears on the trigger, in the menu, in R-124's caption and in `#editor-said`.
      - `VALUE` is gone, and `PREVIEWING` is derived from the titles: "a logged out user", "a free member", "a paid
        member".
      - The Controls panel's audience list keeps "Logged out · Free members · Paid members".
    - **Also found:** the wider centred group let a long project name run 25px under it, so the name's limit is now
      `calc(50% - 360px)`. Step 90 measures it.
  - **The owner's third round (2026-09-21), R-171:** the Template and View as menus now share one anatomy,
    `components/editor/bar-menu.tsx`.
    - The shared parts: D5b's trigger shape, S4d's card and uppercase heading, a list that scrolls inside a card
      capped at 420px or 70vh on the Kit's slim scrollbar, and rows of glyph · name over one line · trailing slot.
      The current row has the check and no tint.
    - Template rows: an eleven-glyph Tabler set emitted from `tabler.json` into `kit/icons.tsx`, including
      `CanvasCustom` for Story 7.16, and `CANVASES[key].caption`. R-130's marks moved to the trailing slot, with their
      words given as a title and as `sr-only` text.
    - View as lost its trigger eye.
    - `openMenu` now opens every menu on its `aria-current` row, focused and scrolled into view. A second frame from
      `toggle` raced fast keyboards, as the journey executed.
    - `lib/menu.ts`'s `closeMenus()`, run from the canvas document's `pointerdown`, closes open popovers on a canvas
      press, because light dismiss never hears the iframe.
    - Links typed with the text toolbar render browser blue, because no stylesheet applies R-112's `--link-color` /
      `--link-decoration` to an inline `a` mark. That is Question 3, awaiting the owner. It touches `packages/`.
  - **The owner's fourth round (2026-09-21), R-172:** the row in force is highlighted, `coral-tint` with a semibold name,
    and is not ticked, in both menus.
    - "Two scrollbars" was the POPOVER scrolling: an unpositioned row let its absolute `sr-only` words escape the
      list, so the popover grew a scrollbar of its own.
    - Fixed by `relative` rows, plus `overflow-visible` on the popover (`BAR_POPOVER`), which also lets the card's
      `shadow-lg` show. The app's other popovers keep the UA's `overflow: auto`, which clips a child's shadow. That
      follows from the CSS and was not measured on them.
  - **R-173 (owner, 2026-09-21, Story 5.14's Q3, option 2): a typed link takes the pack's link style.** The token
    block (`tokens.ts`'s `LINK_RULES`) gives every `<a>` with no class `--link-color` and `--link-decoration` at zero
    specificity, and on a contrast, accent or image ground the link keeps the ground's words. So any later story that
    draws links in a section writes its own rule only when it wants a different look, and then draws it on every
    ground it offers. The ground is read from `data-bg` alone, so a design drawn on a ground of its own locks the
    Background role there or writes its own rule (`docs/section-authoring.md`).
- **Behaviours hold still while designing.** Layout CSS is always live; module JavaScript runs on the canvas only for edit-safe modules, the others render at rest with a PAUSED chip on the behaviour, and Preview runs everything without chrome.
  - **Story 5.15's planning (2026-09-22, read in the runtime, the CSP and the frames, and swept over the library):**
    `core` (Story 4.7) already holds still every module that is not edit-safe (`core.js:43`), and NOTHING CALLS IT:
    the canvas document carries no script and no nonce (`pilots.test.ts:62`), the policy refuses `eval` on
    production, and the editor paints with `mountSections`, whose blanket `js-enabled` puts every mount in its
    JavaScript branch with nothing running. So THE EDITOR CALLS `core` AGAINST THE CANVAS WINDOW on every paint —
    `core` reaches every platform object through `win` (`core.js:3-4`) — which needs `core.js` importable: ONE
    EXPORTED DECLARATION, which `bundle()` pastes into the classic `main.js` without the keyword (DW-136, owned
    here, whose "evaluate `bundle`'s strings" cannot run under the policy). At rest is FR-G7(4)'s no-JavaScript
    branch, not B3a's frozen JavaScript looks, so at Mobile Rail lists its links while designing and shows its menu
    button only in Preview. NO FEATURE MODULE HAS A FILE — the pilots' `nav-drawer` and `member-form` are declared
    before their category stories write them (FR-G7(2)) — so a registry module with no file mounts as a no-op, and
    Preview draws its JavaScript branch as `/pilots`, the picker and the render matrix do. The chip is chrome in the
    canvas layer, not R-120's `::after` (inside the frame its 9.5px words would paint at 5.7px at the 0.6 fit), 8px
    inside its mount's bottom-left corner because the section's top corners belong to the tag and the pill (R-125).
    `P` lands in `KEYMAP` (R-145); in Preview only `P`, `Esc`, `1` `2` `3` and `⌘S` act, and a link or a form still
    never leaves the canvas. No migration and **no Schema phase**.
  - **R-174 · R-175 (owner, 2026-09-22, Story 5.15's Q1 and Q2).** **R-174:** `header-scroll`, `reveal`, `tabs` and
    `accordion` HOLD STILL while designing, as research §7 and `registry.json` already say, and Preview shows them
    moving; FR-D20's run-always example list and the story card are corrected to the table, closing DW-133. **R-175:**
    the PAUSED chip is drawn ONLY on the section pointed at or selected, and ONLY on a held-still part that MOVES BY
    ITSELF — on a timer or as the page scrolls, with nothing pressed; a part that waits for a press or a submit never
    carries one. `registry.json` gains `movesByItself` on every row, the one place that says which (`animates` is
    `core`'s motion gate and is `false` on `header-scroll`). So TODAY'S LIBRARY DRAWS NO CHIP ANYWHERE — both pilot
    modules wait for a press — and CI draws one on controls fixture 1, which declares `marquee` for exactly that.
  - **As built (Story 5.15, 2026-09-22):** `core.js` is ONE EXPORTED DECLARATION (`packages/library/package.json`'s
    `./core`, typed by `modules/core.d.ts`) and `bundle()` removes that one keyword as it pastes, so `main.js` carries
    none — `core.test.mjs` holds the real file's bytes and still runs the bundle with JavaScript on and off; it gained
    `options.report` (DW-136(b)) and the handle's `paused`, and nothing else in it moved. `apps/web/lib/behaviours.ts`
    is the app's ONE call (`startBehaviours`) over `CANVAS_MODULES` — every registry row, a no-op standing in where no
    module file exists (FR-G7(2)), and `behaviours.test.ts` goes red the day a file lands un-imported — plus R-175's
    `movesByItself`, read through `parseModuleDeclaration`. `paint()` stops the old handle, writes the markup PLAIN
    (`mountSections` is `/pilots`' and the picker's now) and starts `core` after `wire(doc)`; a restamp keeps the nodes,
    so running mounts survive it. The chip is portalled into the chrome layer and placed by `place()`'s new
    `bottom-left`. Preview is `preview` in `latest` beside the device: the chrome HIDDEN (never unmounted), `showing`
    and `layerFor` false, `mark()` writing no state mark, the stage unpadded and the card square, B3b's bar
    (`components/editor/preview-toggle.tsx`) the one piece of chrome, its devices a second `DeviceSwitch` (an `id` and
    an `ink` tone). `P` is `KEYMAP`'s row with `lib/preview.ts`'s one name (R-170), `IN_PREVIEW` is the set of gestures
    that act there, and `onEscape`'s Preview rung sits above every other, after the popover and dialog guard. EXECUTED,
    not only reasoned: in Chromium 149 against a page pair carrying the app's nonce policy, `core` run from the parent
    realm raised zero violations and `eval` called on the child window threw `EvalError` — step 5's new control on
    production. Measured in the harness: the cluster now meets View as between 1190 and 1195px (44px of room at 1280).
    New: DW-226 (a width-declared mover chipped at every width), DW-227 (an autoplaying carousel unchipped), DW-228 (a
    re-stamp strips a root mount's `data-i18n-*`, which matters now that edit-safe mounts keep running through it).
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
  - **R-158 · R-159 (owner, 2026-09-20, Story 5.11's Q1 and Q2).** **R-158:** the shipped library holds ONE
    design per category, so the design ring has nowhere to ride and the whole carry / park / default claim
    would be asserted vacuously — **no design is authored here** (`packages/library/designs/` untouched,
    AD-35, in his own words *"I do not want to build all designs. Just a couple of samples enough for
    testing"*) and the samples are **two more fixture designs** in `packages/library/fixtures/controls/`,
    giving a ring of THREE (two make `◀` and `▶` identical and cannot show a value parked against design 1
    surviving while the customer is on design 3). The deployed **`/controls`** review page mounts the picker
    over them, so the owner and `run-verify-controls.cjs` exercise the rule on production (R-82); the
    keyboard harness takes the same ring, so `pnpm keyboard` walks it on every commit (R-146). The editor
    itself reads **"1 of 1"** beside its `Design` label, with the arrows and Shuffle **absent** (UX-DR3), and gains them the day
    Epic 9 fills a category, because every count is derived. **R-159:** Shuffle is built in **BOTH** places —
    S6`:140`'s **`Try a design`** card at the foot of the panel's Design block (the one place that shows
    where a shuffle would take you BEFORE the press) and a control in the section's pill **with the ring,
    before the divider**, because that divider separates *which design* from *this section*; in the pill it
    is **icon-only** (the Kit's `Refresh`, its words as accessible name and hover title) through
    `DESIGN.md:534-536`'s carve-out, the one R-132 and R-136 already use. **R-159 also settles the pill**:
    B1b draws an ink pill top-LEFT with the counter, Shuffle and a `⋯`, while S4b and `S6:67` draw the
    counter and arrows in the white quick-action pill Story 5.4 built and R-125 placed — two frames agree
    and R-118 already said `◀ ▶` arrive in S4b's, so **S4b + S6 govern the pill and B1b governs the
    affordance**; B1b's `⋯` is not built (R-126 stands).
  - **R-161 · R-162 · R-163 (owner, 2026-09-20, Story 5.12's Q1–Q3, option 1 each).** **R-161:** Site Remix
    re-rolls **the canvas you are looking at** and leaves the header and footer alone — B8's *"Include the
    header and footer"* tick-box and its "Every page" row are ABSENT, not greyed (UX-DR3, R-118), because
    including a site-wide section means a second doc and therefore a second `⌘Z`, and FR-D17 makes single-step
    undo a hard requirement; it is also unprovable today, the header category holding one design. **R-162:**
    the dice is built in BOTH places — the editor's top bar and the deployed **Controls review** page, which
    already carries R-158's three fixture designs — so the owner watches a real re-roll on production while his
    own editor's confirm tells the truth ("nothing to remix yet", **Close** alone, R-12's shape as R-134 already
    answers an empty Clear). No shipped design is authored (AD-35, R-158 stands). **R-163:** the control is a
    **rolling 3D cube** — six faces on `--color-surface` with a `--color-line` edge and `--color-coral` pips,
    ~900ms with a settling curve, icon-only with its words as accessible name and hover title
    (`DESIGN.md:534-536`'s carve-out) — and it is **R-92's THIRD stated exception**: R-130 and R-142 admitted a
    Tabler path the owner named, this admits a drawing of our own in token colours, because the export draws no
    Site Remix control at all (`EXPERIENCE.md:154` gives `⇧R` as the surface's only door) and no icon set has a
    tumbling die. **Amended by R-164:** the confirm opens on the press; it is the confirmed RE-ROLL that lands on the
    roll's own `transitionend` (or `transitioncancel`), so `globals.css`'s reduced-motion block both flattens the
    roll and lands the re-roll at once, with no timer to keep in step with the CSS.
  - **R-165 · R-166 (owner, 2026-09-20, Story 5.13's Q1 and Q2, option 1 each).** **R-165:** the
    preview-subject picker is built **now**, over the bundled publication — FR-D22's *"once a site is connected"*
    names where the rows come from, not whether the surface exists, so D5e is drawn in full (the SUBJECT group,
    its search, the style-guide entry first, the feed's posts with dates and the **"has image"** marker in WORDS)
    and Story 5.18 swaps the source behind it and rebuilds nothing. It is R-158's shape one story on: the claim
    that a subject with a feature image and one without are structurally different pages is proved by hand on
    bundled data (`a24/1` binds `src:feature_image` with a `srcset`, so FR-H8's guard removes the whole element)
    rather than asserted vacuously. B9's **connected** state and its SOURCE group stay ABSENT, not greyed (UX-DR3,
    R-118 again) — until 5.18 every canvas renders the bundled publication, so the pill reads *"Sample content"*
    on every project **including one whose `linked_site_id` Story 3.4 already set**, because the pill describes
    the canvas and never the paperwork. **R-166:** the pill is built at **24px** rather than B9's drawn 27–30px,
    because `EXPERIENCE.md:159` puts it at the canvas foot where the ground is R-139's 32px, and at
    `ViewportChip`'s 4px inset a drawn pill lands between one pixel clear and two pixels over the card's bottom
    edge at Tablet, Mobile and a short-window Desktop — R-138's measured failure with no margin. `py-8` does not
    move and **no page card loses a pixel**; 24px is above WCAG 2.5.8's floor and is the same trade `ViewportChip`
    already makes in the opposite corner. B9 governs the pill in every other respect and D5e governs the menu; the
    export is untouched (R-74) and `reconcile-designs-decisions.md` is the record.
  - **B9 governs the pill and D5e governs only the menu, and no question was owed (Story 5.13's Create).** The two
    frames disagree — B9 draws a light border-style pill at a 24px radius, D5e a 30px item inside an ink
    `#1C1B1A` bar at 10px/4px. `epics.md`'s own AC rules it (*"the pill matches B9 and the picker matches D5e"*),
    and B9's Notes agree from the other side: of the four surfaces in that row *"two are ink pills that float over
    the canvas … the other two are status … the source pill is a border style"*. D5e inherited the ink treatment
    from the D5 prompt's blanket *"THE PILL SPEC IS SHARED AND ALREADY SET"* line, which generalised a rule B9 had
    scoped to the other two.
  - **R-167 · R-168 (owner, 2026-09-21, Story 5.14's Q1 and Q2, option 1 each).** **R-167:** a page's "looked at"
    record runs out at ANY change to the page — a canvas edit, undo and redo included, leaves that canvas viewed
    only as the visitor on screen; a header or footer edit does the same for the canvas on screen and empties every
    other canvas's record; a hydrate is not a change. `afterChange` in `lib/view-as.ts` decides it once, for
    `commit()` and `restore()`, and only the records that change are written. **R-168:** a section whose Member
    visibility excludes the visitor being previewed is LEFT OUT, exactly as that visitor sees the page — as 4.10 and
    5.4 already built it — never ghosted at 40 % with a "Hidden for this audience" pill (P0·4's ⚑, never accepted)
    nor outlined (A2-0); its Layers row stays and R-124's caption names the visitor, and A2's own `audience`
    control inherits the rule in Epic 9. S4d governs the toggle, its menu and its "N not viewed" marker; the menu's
    unviewed rows carry the marker's own "Not viewed" chip, which is how the nudge NAMES what S4d only counts.
    - *Amended on the deployed build by **R-169** and **R-170** (owner, 2026-09-21):* the marker and its chips became
      one coral dot on each unviewed row of the menu, and the trigger's "Anonymous" became "Logged out user". See
      Story 5.14's as-built note above.
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
  - **5.13's half is settled and is no longer a lean (R-165, owner, 2026-09-20):** the subject picker is built at
    5.13 over the bundled publication, whose rows are pure and already in the repo, and Story 5.18 changes only
    where those rows come from. 5.16's page 2 still needs 5.19.
  - **5.14's lean is settled too (2026-09-21):** 5.14 builds the visitor and 5.21's strip reads it (its criteria
    already honour the toggle); the gated-body indicator, `access` per visitor and DW-128 move to 5.20, the first
    canvas that draws a gated body; and the pre-deploy half of the nudge is 7.18's Pre-flight row.
  - **5.16's lean is settled as well (2026-09-22, a routine call stated to the owner):** page 2 is offered on the
    section that already carries `isMainFeed`, which synthesis has set since 5.5, so it lands before 5.19; 5.19 adds
    the Pagination control above its row and the lifecycle that marks a placed feed, and rebuilds nothing here.
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
