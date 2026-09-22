---
title: 'Story 5.14 — Member-state preview, and the nudge that names what I have not looked at'
type: 'feature'
created: '2026-09-21'
status: 'done'
owner_test: passed
review_loop_iteration: 1
baseline_commit: '02685eaac078a9c5bbf9b5c551d131092a07810d'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A new **View as** button beside "Template" at the top of the editor lets you see your page as each of
three visitors: a **Logged out user**, a **Free member** and a **Paid member**, the same names everywhere.
Choosing one redraws the page at once, so the header's "Sign in" and "Subscribe" turn into "Account" and the
newsletter band's email box turns into "Signed in". In the list under the button, a small **coral dot** marks
each visitor you have not yet looked at this page as, so a members' version of a page never goes out unseen;
it only reminds you and never stops you. And a link you make with the text toolbar now looks like your Style
Pack's links, dark ink with an orange underline (orange in dark mode), instead of the browser's plain blue.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-D16 is unbuilt at the surface and half built underneath.

- **The rendering already exists.** Story 4.10 renders every section for a chosen visitor on both emitters
  (`RenderInput.member`, `gateMembers`), and `/pilots` already switches it.
- **The editor cannot use it.** The editor pins the visitor to a constant, `PREVIEWS = 'anonymous'`
  (`editor.tsx:187-189`, "until Story 5.14's View as"). So nobody designing a page can see the version a
  member gets. A section set to "Paid members" simply leaves the canvas, and there is no way to look at it.
- **The storage is waiting.** The nudge needs a per-canvas record of which visitors have been looked at.
  That column, `project_template_prefs.member_states_viewed`, has been in the complete-schema migration
  since the start with no reader and no writer.

**Approach:**

- **The control.** Replace the constant with S4a's **View as** control in the top bar's centred group, using
  S4d's menu: three visitors, no tiers. Hold the chosen visitor as session state, as the mode and the device
  are held.
- **One door.** Hand the visitor to the one door every canvas surface already paints through:
  `renderSection`'s existing `member` option. That covers the editor canvas, the panel's caption, the
  Section Picker's cards and the Design ring's tiles.
- **The record and the dots.** Record per canvas which visitors have been looked at, in the column that has
  been waiting. Put a coral dot on each unviewed row of the toggle's own menu, and nothing beside the toggle
  (**R-169**, owner, 2026-09-21, replacing S4d's "N not viewed" marker).
- **What does not change.** No migration, so there is **no Schema phase**, and the runtime's render is untouched.
  The one change under `packages/` is the owner's **R-173** (2026-09-21): the token block gives a plain link the
  pack's link style.

## Boundaries & Constraints

**Always:**

- **The canvas is the site, for the chosen visitor, through ONE door.**
  - `renderSection(… { member })` and Story 4.10's `gateMembers` decide everything. No surface renders a
    visitor its own way.
  - The Logged out user (`anonymous`) is Ghost's `@member === null`. Free is a member with `paid: false`. Paid is
    a member with `paid: true`.
  - That is Ghost's own rule, `paid: status !== 'free'` (`update-local-template-options.js:27-40`, identical on
    6.58.0 and 5.130.6). So `comped`, and Ghost 6's `gift`, both preview as Paid. The menu offers exactly three
    rows (B9: "only").
  - **Each visitor has one name** (**R-170**, owner, 2026-09-21): S4d's row title — Logged out user · Free member ·
    Paid member — on the button, in the menu, in the panel's caption and in the announcement. "Anonymous" is not
    used. The Controls panel's Member visibility list keeps its audience words (Logged out · Free members · Paid
    members).
- **View as is a MODE** (`EXPERIENCE.md:230`). It is session state beside `mode` and `device`: never in the
  URL, never stored, back to the Logged out user on reload, and kept across a canvas switch.
- **Looking is never an edit.**
  - Nothing reaches `commit()`, the journal or `⌘Z`.
  - An untouched canvas stays untouched. AD-22 names `project_template_prefs` as the home for "FR-D16's viewed
    member states" for exactly this reason.
- **The viewed record is per canvas**, in `project_template_prefs.member_states_viewed`.
  - It is written through the caller's own session, as `setPreviewSubject` is.
  - A visitor counts as viewed the moment the canvas is shown in that state.
- **Any change to a page makes its other visitors unviewed again** (**R-167**, owner, 2026-09-21).
  - A change to a canvas's doc leaves that canvas viewed only in the visitor on screen.
  - A change to the site doc (the header or footer, which appear on every page) does the same for the canvas
    on screen, and empties every other canvas's record.
  - Undo and redo are changes. A hydrate is not.
- **The nudge reminds and never blocks** (**R-169**, owner, 2026-09-21).
  - Each unviewed row of the menu carries one coral dot. Nothing sits beside the toggle, and a row that has been
    viewed carries no dot (UX-DR3).
  - The dot's word, "Not viewed", is in the row for screen readers only. The dot's presence is a shape, so colour
    never carries the signal alone.
- **A section whose Member visibility excludes the visitor is left out of the page**, exactly as that visitor
  sees it and exactly as today (**R-168**, owner, 2026-09-21). It is never ghosted, labelled or outlined on the
  canvas. Its Layers row stays, and the panel's caption names the visitor being previewed.
- **No key binds View as.** FR-D11 calls it set-and-forget context, and R-145's table gains no row.

**Ask First:**

- Any change under `packages/`. The runtime already takes the visitor, and a change there moves
  `check-snapshots` and the render matrix. *Asked once, as Question 3. The answer is R-173, the token block's link
  rule, and nothing else under `packages/` changes.*
- Any migration.

**Never:**

- **Never print a member's own details.** No `@member` field reaches a design or a page (R-28, AD-38). The
  binding check's refusal (`packages/library/src/contexts.ts:186-188`) stays exactly as it is.
- **Never emit `{{#has any="@member"}}`.** Nothing emits `{{#has` today. Ghost's `has` helper cannot see
  `@member` anyway: `has.js:128` picks only `site`, `config` and `labs`, read on both majors.
- **Never a colour literal in a `.tsx`** (`tokens.test.ts:125`).
- **Never an `aria-label` over visible words** (WCAG 2.5.3, Story 5.13's lesson).
- **Not built here.** Each item is left to the story that owns it:
  - Ghost's announcement strip following the visitor: Story 5.21, whose criteria already say so.
  - The "Gated content — shown with sample text" indicator, `access` worked out per visitor, and DW-128's
    reading time: Story 5.20, the first canvas that draws a gated body.
  - The pre-deploy row listing unviewed pages: Story 7.18's Pre-flight step.
  - B9's "Also in this menu" copy of View as: the IA places the eye in the top bar, and D5e's drawn menu has
    no such row.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Opening | Any canvas, first visit | The trigger reads "View as · Logged out user" (R-170). The canvas is the signed-out render, byte for byte what it is today. This canvas's record gains `anonymous`. In the menu, the other two rows each carry a coral dot, and nothing sits beside the trigger (R-169). | N/A |
| Choosing Paid | Menu → Paid member | Repainted as a paid member: Rail's Sign in and Subscribe become Account, and the Inline Row's form becomes "Signed in". The trigger names the visitor. `#editor-said` announces it. The record gains `paid`. | N/A |
| Member visibility | A section set to Paid members, viewed as Free | Not drawn. Its Layers row stays. The panel's caption names "a free member". | N/A |
| All three viewed | Record holds all three | No row of the menu carries a dot (UX-DR3). | N/A |
| Reload | After viewing all three | View as is back to the Logged out user. The record comes back from `project_template_prefs`, so no dot comes back. | N/A |
| A change (R-167) | Any edit to this canvas's doc, undo and redo included | The record becomes `[visitor on screen]`, and the other two rows are dotted again. | N/A |
| Header or footer change | An edit to the site doc | The canvas on screen becomes `[visitor]`. Every other canvas with a record becomes `[]`. Only rows that change are written. | N/A |
| Canvas switch | Home → Post | View as is unchanged. Post records the visitor. The menu dots Post's own record. | N/A |
| Picker and ring | `⌘K`, or the Design block, under Paid | Cards and tiles render as a paid member. | N/A |
| Save refused | The upsert fails (offline, RLS) | The session's record stands. The canvas is unaffected. | Logged, not said: a lost record only brings the reminder back after a reload |
| Stored junk | The column holds a value that is not a visitor | Ignored on read. | N/A |
| Keyboard | Tab to View as, then Enter, ↓, Enter, Esc | Opens, moves, picks (repainted and announced), closes, and focus returns to the trigger. | N/A |
| Pilots, snapshots, matrix | `/pilots`, `check-snapshots`, the render matrix | Unchanged. The one change under `packages/` (R-173) restyles only a plain link, and no design's markup or default content holds one. | N/A |
| A typed link (R-173) | A link made with the text toolbar, in light and dark, on each ground a design offers | Light: ink words with the accent underline. Dark: accent words. On a contrast ground the words keep the ground's own colour and the underline takes the contrast accent. A design that styles its own links keeps them. Never the browser's blue. | N/A |

</frozen-after-approval>

## Code Map

**The editor:** `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`

- `:187-189` is `PREVIEWS`, the constant this story deletes. It has three readers:
  - `:828`, in `paint()`
  - `:2196`, the panel's `visibility.previews`
  - `components/editor/section-preview.tsx:131`
- Two comments are wrong and get corrected: `:170-185` (the ABSENT list, "View as (5.14)") and `:1909-1911`
  (it says View as "lands beside" the right-hand cluster). Every drawn top bar puts it in the centred group.
- Precedents to follow:
  - `:294-301`: `mode` and `device` as session state, and the wording model for the new state's comment.
  - `:315-326`: Story 5.13's per-canvas `subjects` map, keyed by `templateKeyOf(key)`. `viewed` has the same
    shape.
- `:441-442` is `latest`. The visitor joins it, because `paint()` reads through it in the same task.
- Where the pages change:
  - `:453-465`, `commit(written, touched)`, is every edit. `touched` is `'site'` or a canvas's `template_key`.
  - `:533-552`, `restore`, is undo and redo.
  - R-167's rule runs in these two and nowhere else. It never runs on the hydrate (`:1293-1298`).
- `:722-730`, `flip`, is the mode's re-stamp. A visitor change **cannot** reuse it: `gateMembers` removes
  elements on the canvas (`core.ts:1508`), so a visitor change is a **repaint**.
- `:754-773`, `chooseSubject`, is the precedent: update `latest` first, then `paint()`, then `setSaid`, then
  the write in a transition behind a turn guard.
- `:791-846` is `paint()`. `:1236-1243` is the `[key]` effect that runs on a canvas switch.
- The top bar:
  - `:1835`: the 48px header.
  - `:1902-1908`: D5a's centred group, holding the switcher alone since R-130 removed the marker chip.
  - `:1915-1942`: the right-hand cluster (dice, sun, device track, Theme settings).
  - `:2211-2213`: `#editor-said`.

**Components to build on:**

- `apps/web/components/editor/template-switcher.tsx`:
  - `:152-166` is the trigger skin to share: `h-8 rounded-sm border bg-surface px-3`, a `text-control-label
    font-medium text-ink-soft` label, a 12.5px/600 value and a 12px chevron.
  - `:167-224` is the `popover="auto"` menu opened with `openMenu`.
  - `:54-63` is `Mark`, the rule that a shape never travels without its word.
- `apps/web/components/editor/source-pill.tsx` is Story 5.13's rich menu: `openMenu`, `arrowKeys`, and the card
  `rounded border-line bg-surface p-[6px] shadow-lg` at `:156`.
- `apps/web/lib/menu.ts`:
  - `Placement.align` (`:29-34`) offers `'left' | 'right'` only.
  - `anchorTo` is at `:36-55`.
  - `openMenu`'s next-frame flip and clamp is at `:101-119`.
  - `arrowKeys` is at `:141-158`.
- `apps/web/components/kit/icons.tsx` has `Eye` (`:154`), `Person` (`:445`) and `Check`, each S4d's own path.
  It has no crown.
- `apps/web/components/kit/badge.tsx:60-78` has `StatusChip tone='recommended'`: `bg-coral-tint
  text-coral-text`, which was the marker's palette until R-169 took the marker out.
- `apps/web/components/controls/sidebar.tsx`:
  - `VisibilityRow.previews` is at `:67-74`.
  - `PREVIEWING` (`:214-218`) moves to `lib/view-as.ts`.
  - The R-124 caption is at `:358-375`.
- `apps/web/components/editor/section-preview.tsx`:
  - `:127-136` hard-codes `member: 'anonymous'`.
  - `:154` is the paint effect's dependency list. Story 5.13's review found that a value the paint reads must
    be in it.
  - Its callers are `section-picker.tsx:329` and `design-picker.tsx:76`.
- `apps/web/lib/canvas.ts:65-104`, `renderSection`, **already** takes `member` (`:73-74`, `:98-99`). No change.

**Runtime and library (read-only):**

- `packages/section-runtime/src/core.ts`:
  - `RenderInput.member` (`:197-201`): "the visitor the CANVAS previews … `comped` previews as `paid` … Default
    `anonymous`. The theme ignores it."
  - `visibility` (`:202-204`), `refuseConditionsAndMembers` (`:1448-1488`), `MEMBER_GATE` (`:1493-1497`) and
    `gateMembers` (`:1502-1519`).
- `packages/library/src/vocabulary.ts:345` is `MEMBER_STATES = ['everyone', 'anonymous', 'free', 'paid']`. The
  three visitors are **derived** from it.
- `packages/library/designs/a1/1/index.html:17-21`, Rail:
  - Account is shown for `free` and for `paid`. The two renders are identical.
  - Sign in and Subscribe are shown for `anonymous`, inside `@site.allow_self_signup`.
- `packages/library/designs/a22/1/index.html:10-29`, Inline Row: the form is shown for `anonymous`, and
  "Signed in · Manage your preferences" for `free` and for `paid`, again identical.

**Server, data and tests:**

- `(editor)/read.ts`:
  - `EditorData.subjects` is typed at `:111-115`.
  - The prefs select is at `:135`, the shape guard at `:231-239`, and the return at `:240-262`.
- `(editor)/actions.ts:38-63` is `setPreviewSubject`, which the new action is shaped like.
- `supabase/migrations/20260904120000_complete_schema.sql:257-270` defines the table:
  - `member_states_viewed text[] not null default '{}'` is at `:264`, commented "FR-D16's 'states you have not
    looked at' nudge".
  - The key is `(project_id, template_key)`, and there is no CHECK on the values.
  - Its policies and grants are in place (`:789`, `:814-854`, `:1016-1027`).
- `apps/web/app/(app)/app/harness/editor/page.tsx:85-109` is the harness's `EditorData`. It is typed, so a new
  field is a compile error until the harness supplies it.
- `tools/probe/run-verify-editor.cjs`, the deployed walk:
  - Step 2's centring check (`:356`, `:375`) measures `#editor-template` alone.
  - Step 37 (`:1770-1800`) pins the default visitor, and its caption expectation is now read from
    `lib/view-as.ts` (R-170 renamed the visitor).
  - Step 89 (`:3719-4012`) is Story 5.13's, and step 79's block starts at `:4013`.
- `tools/keyboard/journey.spec.mjs`:
  - `open()` is at `:38` and `said()` at `:54`.
  - The UX-DR9 Tab walk presses `all.length * 2 + 14` times (`:175`), a budget written down by hand.
  - `apps/web/lib/keymap.ts` gains no row.

**Frames:**

- `S4 Editor.dc.html:33` is S4a's centred group: Template ▾ Home, a gap of 8, then View as ▾ Anonymous (the
  value is "Logged out user" since R-170). The View as trigger is:
  - `gap:7px; height:32px; padding:0 11px`, `#FFF`, a `1px #E7E2DB` border, radius 8
  - a 13px eye, "View as" at 12/500 in `#6E6A64`, the value at 12.5/600, and a 12px chevron
- `S4 Editor.dc.html:391-416` is S4d:
  - The menu (`:399-404`):
    - 260 wide, radius 12, padding 6
    - "Preview as" at 11/600 in uppercase, with letter-spacing .04em
    - rows padded `9px 10px`, each a 15px icon, a 13/500 title and an 11px caption
    - the current row carries a trailing 13px `#E84B34` check and **no tint**
  - The marker (`:405`): 20px high, `0 8px` padding, radius 24, `#FFEDE8` and `#C2381F` at 10.5/600, with a 5px
    dot, reading "2 not viewed". **Not built: R-169** replaced it with a coral dot on each unviewed row.
  - The gated label (`:410`) is Story 5.20's.
- `B Missing Surfaces.dc.html:1417` is B9: "View as, which offers Anonymous, Free member and Paid member only".
  Its "only" binds; its "Anonymous" is superseded by R-170's "Logged out user".
- `EXPERIENCE.md`:
  - `:161`: the IA row (S4d + B9, the "top bar eye", three states)
  - `:230`: View as is a mode
  - `:735`: S4d, re-specified

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/view-as.ts` — **new, and pure**, following `ring.ts`, `device.ts` and
      `preview-subject.ts`, so that `node --test` reaches it. It holds:
  - `VISITORS`: `MEMBER_STATES` without `'everyone'`, in its order.
  - The words, exactly as drawn:
    - `LABEL`: "View as"
    - `ROWS`: S4d's three titles and captions. Since **R-170**, each title is the visitor's ONE name and the
      trigger prints it too, so the `VALUE` list that held S4a's "Anonymous" is gone.
    - `HEADING`: "Preview as"
    - `NOT_VIEWED`: "Not viewed", the dot's word for screen readers (R-169)
  - `PREVIEWING`, **moved** here from `sidebar.tsx`, so the panel's caption and the live region read one list.
    Since R-170 it is **derived** from the row titles: "a logged out user", "a free member", "a paid member".
  - `VIEW_AS_SAID(v)`, which returns "The canvas is previewing {PREVIEWING[v]}."
  - `readViewed(raw)`: the known visitors in canonical order, with junk dropped.
  - `seen(record, v)`: returns the **same array** when `v` is already in it, so the caller writes only when
    something changed.
  - `unviewed(record)`.
  - ~~`markerWords(n)`~~: removed with the marker (R-169).
  - `afterChange(records, touched, onScreen, visitor)`: returns **only the records that change**, under
    R-167's rule.
- [x] `apps/web/view-as.test.ts` — **new**. It covers every matrix row over the pure half:
  - `VISITORS` is asserted against `MEMBER_STATES`, never against a list written in the test.
  - `seen` keeps the same array when nothing changes.
  - `afterChange` is tested for a canvas edit, and for a site edit where other canvases' empty records are not
    returned.
  - Since R-169 and R-170: the dotted rows through `unviewed`, and every name and sentence derived from `ROWS`.
- [x] `apps/web/lib/menu.ts` — `Placement.align` gains `'center'`.
  - The menu's centre sits under the trigger's, as in S4d `:399` (`left:50%; transform:translateX(-50%)`).
  - It is placed in `openMenu`'s next-frame pass, where the menu has a width, and clamped by the same rule.
- [x] `apps/web/components/kit/icons.tsx` — add `Crown`, copying S4d `:403`'s path verbatim. R-92 says a
      glyph the export draws is read from the export.
- [x] `apps/web/components/editor/view-as.tsx` — **new**. Three parts:
  - **The trigger**, S4a's, with id `editor-view-as`: `h-8 rounded-sm border border-line bg-surface
    px-[11px] gap-[7px]`, hovering to `border-line-strong`, with the 13px `Eye`, "View as" in `TemplateSwitcher`'s
    label class, the value at 12.5px/600, and S4a's 12px chevron. The value slot is as wide as the widest of the
    three words: stack the words in one grid cell, with the two not showing set to `invisible`. That way,
    switching visitor never moves Template.
  - **The menu**, S4d's:
    - `popover="auto"`, opened with `openMenu(…, { side: 'down', align: 'center' })`
    - 260px wide, `rounded`, `p-[6px]`, `shadow-lg`, headed "Preview as"
    - three rows, `px-[10px] py-[9px] gap-[10px] rounded-sm`, each with its 15px `Eye` / `Person` / `Crown`, a
      13/500 title and an 11px `ink-soft` caption, and `arrowKeys` between them
    - the current row carries a 13px `text-coral-deep` `Check` and no tint, as S4d draws it
    - each **unviewed** row carries **one coral dot** in the same trailing slot (**R-169**): 8px, `rounded-full
      bg-coral-deep`, with "Not viewed" beside it as `sr-only` text. The current row is always viewed, so the check
      and the dot never meet.
  - ~~**The marker**~~: **not built (R-169).** Nothing sits beside the trigger, and the trigger is described by
    nothing.
- [x] `(editor)/actions.ts` — add `setViewedStates(projectId, rows: { templateKey, states }[])`.
  - **Validation:** `isUuid`; every key passes `canvasOfTemplateKey(key) !== null`; every state is in
    `VISITORS`; states are deduplicated; at most one row per canvas.
  - **The write:** **one** upsert of `{ project_id, user_id, template_key, member_states_viewed, updated_at }`
    on `project_id,template_key`, through the caller's session.
  - It names nothing else, so it can never clear a subject, and `setPreviewSubject` can never clear a record.
  - A failure logs `{ code }` and answers `{ error }`.
- [x] `(editor)/read.ts` — add `member_states_viewed` to the prefs select, and return
      `EditorData.viewed: Record<string, Visitor[]>` through `readViewed`. A failed read uses the existing log
      and returns nothing.
- [x] `apps/web/app/(app)/app/harness/editor/page.tsx` — add `viewed: {}` to the fixture.
- [x] `editor.tsx`:
  - Add `viewAs`, starting at the Logged out user, as session state beside `mode` and `device`, and put it in
    `latest`.
  - **Delete `PREVIEWS`.** `paint()` passes the visitor from `latest`. The panel's `previews` and both
    `SectionPreview` callers take `viewAs`.
  - `chooseVisitor(v)`: update `latest` first, then `paint()`, then `setSaid(VIEW_AS_SAID(v))`.
  - Add `viewed` state, read from `EditorData.viewed`, recorded through `seen` on `[key, viewAs]` once the
    editor is hydrated.
  - Apply `afterChange` inside `commit()` and `restore()`.
  - Send writes through **one** promise chain so answers land in order. A refusal is logged and never said.
  - Place `<ViewAs>` right after `<TemplateSwitcher>` in the centred group.
  - Correct the two comments listed in the Code Map.
- [x] `apps/web/components/controls/sidebar.tsx` — import `PREVIEWING` from `lib/view-as.ts`. The caption
      itself does not change.
- [x] `section-preview.tsx`, with its callers `section-picker.tsx:329` and `design-picker.tsx:76` — add an
      optional `member`.
  - It defaults to `'anonymous'`, so `/controls` is unchanged.
  - It is passed to `renderSection` and added to the paint effect's dependency list.
- [x] `tools/probe/run-verify-editor.cjs`:
  - **Step 2** measures the centred **group** against the bar (S4a), not `#editor-template` alone.
  - **Step 90**, new, on the **deployed** editor. It checks:
    - The trigger's words (R-170's name, and "Anonymous" nowhere in the bar), 32px height and eye; the group
      centred to within 2px in all three visitors.
    - S4d's menu: the heading, three rows (no tier row and no comped row), and the current row highlighted
      with no tick (R-172; it was S4d's check until the owner's finding).
    - Paid: Rail shows Account and no Sign in; the Inline Row shows "Signed in" and no form. Free: the same.
      The Logged out user: back again.
    - A section set to Paid members is absent for Free and present for Paid.
    - The panel's caption names the visitor, and `#editor-said` announces the choice.
    - R-169's dots go 2 → 1 → none, on exactly the visitors not yet viewed, each 8px in `coral-deep` with its word
      held for a screen reader; no marker is in the bar.
    - A reload restores the Logged out user and brings no dot back, and the stored row really holds all three.
    - One edit brings the dots back on the other two rows.
    - A canvas switch keeps the visitor.
    - A `⌘K` card for the Inline Row under Paid shows "Signed in".
    - At 1440 and 1280, the trigger's box does not intersect the right-hand cluster's, and a project name at its
      limit ends clear of the group beside the widest canvas label.
    - No key changes the visitor.
    - Zero CSP violations (step 5) and zero axe violations (step 8).
- [x] `tools/keyboard/journey.spec.mjs` — add one journey:
  - Tab reaches View as; Enter opens it; ↓ moves; Enter picks, and the canvas is repainted and announced.
  - Esc closes the menu and focus returns to the trigger.
  - Pressing each single key changes no visitor.
  - The UX-DR9 Tab budget is **derived** from the header's own focusable controls, instead of `+14` (standing
    rule 4).
- [x] **Documents** (standing rule 3, then grep for the old wording, standing rule 7):
  - `prd.md` FR-D16 (`:233`, `:235`):
    - Name the member object as R-4's eight fields, of which R-28 and AD-38 let none be printed.
    - Say that `comped`, and Ghost 6's `gift`, preview as Paid.
    - Replace the "(FR-J13)" citation with the deploy wizard's Pre-flight step (FR-J8, S8b).
    - State R-167's expiry rule in its second paragraph, and R-168's "left out, never ghosted" in its first.
  - `prd.md` Appendix B's `@member` line (`:926`), which lists four of the eight fields.
  - `epics.md` (Story 5.14's own criteria were rewritten with R-167 and R-168 at Create, 2026-09-21):
    - Story 5.20 gains the gated indicator and `access` worked out per visitor, with DW-128.
    - Story 7.18 gains the Pre-flight member-state row. It reads `unviewed` over this column for every canvas
      that ships, and never blocks.
  - `MEASUREMENTS.md` gains one section recording the source reads, each with its command:
    - `update-local-template-options.js:27-40`
    - `has.js:128`
    - the announcement audience, `announcement-bar-settings.js`, whose `paid_members` includes comped
    - `member-bread-service.js:135`'s `gift`
  - `deferred-work.md`:
    - DW-128 moves to Story 5.20.
    - A new entry: §4 names no member-state pass, although FR-D16 relies on one.
- [x] **The owner's two rulings on the deployed build** (2026-09-21), recorded as **R-169** and **R-170** in
      `reconcile-designs-decisions.md`:
  - **R-169:** `view-as.tsx` loses the marker and puts the coral dot on each unviewed row, and `lib/view-as.ts`
    loses `markerWords`.
  - **R-170:** `lib/view-as.ts` loses `VALUE`, the trigger prints the row title, and `PREVIEWING` is derived from
    the titles.
  - **Tests:** `view-as.test.ts`; the keyboard journey (the name, the dots, and no marker); the deployed walk's
    step 90, its step 8 axe state, and step 37's caption, now read from the module.
  - **Found while re-measuring the bar:** `editor.tsx`'s project-name limit grows from `50% - 320px` to
    `50% - 360px`. The centred group now holds View as, so a long name ran up to 25px under it. Step 90 measures it.
  - **Documents** (standing rule 3, then a grep for "Anonymous" and "not viewed", standing rule 7):
    - `prd.md`: FR-D16's two paragraphs, FR-H5's strip sentence, and Appendix A's A32 row
    - `sections-inventory.md`: the A32 row
    - `epics.md`: FR-D16's summary line and Story 5.14's criteria
    - `EXPERIENCE.md`: the IA row and S4d's row
    - `epic-5-context.md`
- [x] **The owner's third round on the deployed build** (2026-09-21), recorded as **R-171** and findings 4, 5 and 7:
  - **R-171:** `components/editor/bar-menu.tsx` is new: the one trigger shape, card, heading, scrolling list and row
    that both menus now use.
    - `template-switcher.tsx` takes the shared parts: a Tabler glyph per canvas, `CANVASES[key].caption` as the one
      line, the state mark trailing (its word as its title and `sr-only`), no tint, and no `aria-label`.
    - `view-as.tsx` takes them too and loses the trigger's eye.
    - `kit/icons.tsx` gains eleven glyphs emitted from `tabler.json`, `CanvasCustom` among them for Story 7.16.
    - `lib/editor.ts` gains the captions and `CUSTOM_TEMPLATE_CAPTION`.
  - **Scrolling (finding 4):** the list scrolls inside a card that stops at 420px or 70% of the window, and
    `focusCurrent` opens each menu on its checked row.
  - **Click outside (finding 5):** `lib/menu.ts`'s `closeMenus()` runs from the canvas document's `pointerdown`.
  - **Tests:** `editor.test.ts` checks the captions. The walk's steps 40, 43 and 90 check the glyphs, the lines, the
    trailing marks, the scrolling, opening on the checked row, the eyeless trigger and a canvas press. The keyboard
    journey checks that each menu opens on its checked row.
  - **Documents:** the ledger (R-171), `prd.md` FR-D6, `epics.md` (UX-DR8, Story 7.16, and Story 5.22's narrow top
    bar), `DESIGN.md`'s carve-out, and `EXPERIENCE.md`'s Template Switcher row.
- [x] **The owner's fourth round** (2026-09-21), findings 8 and 9, **R-172**:
  - `bar-menu.tsx`'s row is `relative`, so its `sr-only` words stay inside the scrolling list. Its popover class
    `BAR_POPOVER` also sets `overflow-visible`, so the popover never scrolls and the card's shadow is drawn.
  - The row in force takes `bg-coral-tint` and a semibold name, and carries no tick in either menu.
  - **Tests:** the walk's step 40 reads the popover's own scroll, and it and step 90 read the tint in place of the
    tick.
  - **Documents:** the ledger (R-172) and `EXPERIENCE.md`'s Template Switcher row. `DESIGN.md` already names
    `coral-tint` as the ground of a selected row, so it needs no change.
- [x] **The owner's answer to Question 3** (2026-09-21), finding 6, **R-173**:
  - `packages/section-runtime/src/tokens.ts` — `LINK_RULES`, appended to `referenceTokensCss()`. A plain link, an
    `<a>` with no class, reads `--link-color` and `--link-decoration` at zero specificity. On a contrast, accent or
    image ground it keeps the ground's own words, and on contrast the underline takes `--accent-on-contrast`.
    `reference-tokens.css` is regenerated from it.
  - **Tests:** `tokens.test.ts` holds the rule to zero specificity, to contract tokens only and no literal colour,
    and to the recoloured grounds. Its control, the same rule with specificity, fails it. The walk's step 20 reads
    the pasted link's colour and underline on production.
  - **Documents:** the ledger (R-173, and a pointer on R-112), `prd.md` FR-E1 and FR-D4, `epics.md` (Story 5.14
    and Story 6.1), `docs/section-authoring.md`, and `deferred-work.md`'s DW-155, whose `--accent-on-contrast` is now
    drawn.

**Acceptance Criteria:**

- **Given** the editor at 1440
  **When** it opens
  **Then** the centred group holds Template and **View as · Logged out user** (words and chevron, no eye since R-171,
  in the Template trigger's own shape). The group
  is centred in the bar. **It matches the frame**, S4a `:33`, with R-170's name for the value.
- **Given** View as is pressed
  **Then** S4d's menu opens: "Preview as", then Logged out user / Free member / Paid member, each with its
  caption and icon, and the current row **highlighted** with the coral tint (R-172, in place of S4d's check). No
  tier or comped row appears (B9: "only"). **It matches
  the frame**, S4d `:399-404`.
- **Given** a visitor is chosen
  **Then** the canvas repaints as that visitor through `renderSection`'s one door. The members-aware pilots
  change (Rail's actions, the Inline Row's form), a section's Member visibility is honoured, the trigger names
  the visitor, and `#editor-said` announces it.
- **Given** a canvas viewed as fewer than three visitors
  **Then** each unviewed row of the menu carries one coral dot, with "Not viewed" for screen readers, and
  nothing sits beside the trigger (**R-169**). Once all three are viewed, no row carries a dot.
- **Given** a reload
  **Then** View as is the Logged out user and the dots reflect the stored record.
- **Given** any change to the page's doc, or to the header or footer
  **Then** the record follows R-167's rule, and only the records that changed are written.
- **Given** the Section Picker or the Design ring under a visitor
  **Then** the previews render as that visitor.
- **Given** the keyboard
  **Then** View as is reachable and operable, and Esc returns focus to the trigger. No single key reaches it,
  and the `?` card lists no row for it.
- **Given** a choice (R-98)
  **Then** the canvas has repainted before a busy label could describe anything, and the background write
  carries none. No route is added, so no skeleton is owed. `busy.test.ts` stays green.
- **Given** `pnpm check`
  **Then** `tools/check-snapshots.mjs` and the render matrix are unchanged. The one file under `packages/` in the
  diff is the token block (R-173), and it restyles only a plain link, which no design's markup or default content
  holds.
- **Given** a link typed with the text toolbar (**R-173**)
  **Then** it takes the pack's link style, never the browser's blue: in light, ink words with the accent underline;
  in dark, the accent words. On a contrast ground it keeps the ground's own words, with the contrast accent
  underline. A design that styles its own links keeps them.

### Review Findings

Code review, 2026-09-21, five layers at `f313b1b0` (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance
Auditor, Real-infra verifier). No acceptance criterion is violated; nothing needed the owner's decision.

- [x] [Review][Patch] `closeMenus()` could throw from the canvas's `pointerdown`: hiding an outer auto popover closes the ones nested in it, and `hidePopover()` throws on a closed one — each is now asked `:popover-open` first [apps/web/lib/menu.ts]
- [x] [Review][Patch] One stored row whose key no canvas owns made every header or footer change's record write refuse WHOLE (`afterChange` walks every key; `setViewedStates` refuses the batch for one unknown key) — `editorData` now leaves such a row out [(editor)/read.ts]
- [x] [Review][Patch] A refused `afterChange` write failed on the WRONG side: the database kept "viewed" for a page since changed, so after a reload the reminder was silent. Refused rows now ride the next write [(editor)/editor.tsx `recordViewed`]
- [x] [Review][Patch] R-167's call in `restore()` (undo and redo) had no check at any level — deleting it failed nothing. The CI-run keyboard journey now edits, views all three, undoes, and reads the dots back; CONTROL: with the call commented out the new test went red (37 passed, 1 failed), restored → 38 passed [tools/keyboard/journey.spec.mjs]
- [x] [Review][Patch] Comments contradicting R-169/R-172 beside assertions that are right: "S4d's marker", "the check on the current row only", "no tint on the current row", "checked with no tint" [harness/editor/page.tsx · tools/probe/run-verify-editor.cjs]
- [x] [Review][Defer] A preview-subject choice landed LATE on production in one of two completed walks (step 89: reload after 1.2s showed the previous article; the row held the new one a moment later) [(editor)/editor.tsx] — deferred, DW-223
- [x] [Review][Defer] R-173's `:where(a:not([class]))` is document-wide, and a pack that sets `--link-decoration: none` leaves a typed link on a contrast, accent or image ground with no sign at all [packages/section-runtime/src/tokens.ts] — deferred to Epic 6, DW-224
- [x] [Review][Defer] Two tabs of one project each write their own whole record, so the later one can restore visitors the other tab's edit had reset [(editor)/editor.tsx] — deferred, DW-225

Dismissed, with the reason: the upsert naming `user_id` (the same shape `setPreviewSubject` has had since 5.13; a
project has one owner and RLS's WITH CHECK holds — the verifier read both policies on production); a failed prefs read
overwriting a good record (costs reminders, never silence — the spec's stated safe side); "viewed" recorded before the
frame paints, a visitor change mid-inline-edit, the centred menu's clamp and the name's `calc` width (the deployed walk
measures each); the colour literals in the walk (they are the computed answers to derived tokens, read on production).

**The real infrastructure (R-82), 2026-09-21.** Vercel: production `READY` from `f313b1b0`. Supabase production
through `SUPABASE_DB_POOLER_URL`, read-only: all six columns the code names exist, the `(project_id, template_key)` key
the upsert conflicts on exists, both RLS policies present; control `no_such_column_control` → missing (R-99: no
migration, no mismatch). **Standing rule 1 on the upsert, now through the two server actions themselves on
`app.inflozo.com`** (a throwaway account, deleted after; users 13 → 13): subject then record, and record then subject —
both columns survive in both orders; a later record replaces the array; control: a PATCH naming `preview_subject: null`
does clear it. The action's own refusals — a state `gold`, the key `site`, two rows for one key, no rows — each
answered the refusal sentence and left the row byte-identical; with no cookies it wrote nothing; the table with no
session answered `42501`. The deployed walk, three runs: the first died at 167 PASS on the known Playwright timeout
(not a result); the second 1 FAIL, 519 PASS (step 89, DW-223); the third 0 FAIL, 520 PASS. `pnpm check` exit 0 and
`pnpm keyboard` 38 passed after the patches. Not touched and not claimed: T1, T3, Resend, Dodo. The patches above are
not yet walked on production — the Deploy phase's walk does that.

## Spec Change Log

- **2026-09-21, the owner renegotiated two frozen lines on the deployed build `d4d6e266`** (the human owns the
  intent, so the frozen block was amended on his word):
  - **R-169:** *"Remove '2 not viewed' text. Instead just show a coral dot in the dropdown items."*
    - Changed: Approach's "The record and the marker", Boundaries' "The nudge reminds and never blocks", and the
      Opening, All three viewed, Reload, A change and Canvas switch rows of the matrix.
    - S4d's marker is not built.
  - **R-170:** *"rename Anonymous to Logged out user … All of these should be same to avoid confusion."*
    - Changed: the Opening and Reload rows, the Boundaries' member bullets and the View-as-is-a-mode bullet.
    - "a paying member" became "a paid member" in the rows that name the visitor, and the sentence the panel
      and the live region say is derived from the menu's titles.
  - Unchanged: R-167, R-168, the record, the one door, and everything else in the block.
  - Recorded: this spec's `## Owner's test findings` and the ledger.
- **2026-09-21, the owner answered Question 3 with option 2, "Fix it inside this story now"** (**R-173**). That
  answer is the "Ask First" the block's `packages/` line required, so the block moved on his word:
  - Changed: Approach's "What does not change" (one change under `packages/`, the token block's link rule), the
    Ask First line (asked and answered), the Pilots, snapshots, matrix row, and a new row, A typed link.
  - Unchanged: no migration and no Schema phase; the render, the record, the one door and every other row.
  - Recorded: finding 6, Question 3, the ledger.

## Design Notes

**Why nothing under `packages/` changes for View as.**

- Story 4.10 built the whole mechanism: `RenderInput.member`, `MEMBER_GATE` for the theme, and `gateMembers`,
  which on the canvas **removes** an element gated to another visitor.
- It also built the refusals: `member: 'comped'` is refused with "(comped previews as paid)".
- The editor never used any of it, because nothing could set the visitor.
- This story is the setter. The runtime's existing tests are the control: `agreement.test.ts:1172-1245`'s truth
  table, and `check-snapshots.mjs:496-516`'s member arms.

**Where R-173's link rule lives, and why it cannot hide a link.**

- **In the token block**, `tokens.ts`'s `referenceTokensCss()`. It is the one stylesheet every surface that draws a
  section already loads: the canvas, `/pilots`, `/controls`, the render matrix, and Epic 6's pack blocks in the
  theme's `default.hbs`. It reads the two tokens R-112 gave values that nothing read.
- **Only a plain link.** The rule matches an `<a>` with no class. That is every link the `a` mark writes
  (`marks.ts`'s `openTag`), and each link of the navigation partial `core.ts` builds, which A1-1 styles itself.
  Every anchor a design authors carries its class.
- **At zero specificity** (`:where`), so any rule a design writes wins. A4-13's `.a4-13__sub a` keeps its own look,
  and A1-1's navigation keeps its `text-decoration: none`.
- **Never invisible.** Paper's light link is ink, and its contrast ground is ink too. On a contrast, accent or image
  ground the link keeps the words the section already set, and on contrast the underline takes the contrast
  accent. `data-bg` is the attribute both emitters stamp on every section root for its Background role.
- **The ground is read from `data-bg` alone.** A design drawn on a ground of its own must lock the Background role
  at that ground, or write its own link rule (`docs/section-authoring.md`). No built design is drawn that way, and
  the sweep measured the real fill behind every text element of every built one.
- **No mode is named** (AD-30). The tokens carry the mode.
- **Epic 6 must carry it.** A pack's token block that is not emitted through `referenceTokensCss()` would lose the
  rule, so Story 6.1's criteria now name it.

**Why View as sits beside Template, and not where the code comment says.**

- Every drawn top bar puts the eye in the centred group, immediately right of Template: S4a–c, S6, S7, S14,
  P0-6, D8 and M1.
- Below 1440, D8 keeps it in the bar (`D8 Editor Below 1440.dc.html:33`). The overflow menu holds device, undo,
  redo, dark mode and export, not View as.
- The comment at `editor.tsx:1909-1911` was an earlier story's guess and never a ruling.
- R-130 removed a **chip** from that group ("a notification adjacent to the Template dropdown"). It did not
  remove the group's second control. So step 2's centring check moves from the switcher to the group, exactly
  as S4a centres it.
- The value slot is as wide as its widest name, so a change of visitor never moves Template. (The marker that
  once hung outside the centring is gone, R-169.)
- At 1440 and 1280 there is room between the trigger and the right-hand cluster, and step 90 measures it at
  both widths. On narrower windows the two eventually meet. Those widths are Story 5.22's responsive floor.
- **The left side needed room too, and the first build missed it.** A group that holds View as reaches 213px
  left of centre with the widest canvas label, "Member home". The project name's limit (`50% - 320px`) was
  sized for the switcher alone, so a long name ran up to 25px under the group. It is now `50% - 360px`, which
  leaves 15px. Step 90 measures it with a long name at 1440 and 1280.

**The menu names what is unviewed, with a dot (R-169).**

- S4d draws a count ("2 not viewed") beside the button. The story's own title, and FR-D16's "surfaces the
  unchecked combinations", ask for names.
- The first build drew the count as drawn and put the marker's own chip, "Not viewed", on each unviewed row.
  On that build the owner ruled: no count, and a coral dot on each unviewed row instead (R-169).
- So the menu is the one place the reminder lives. The dot is D5b's 8px row mark in the check's own
  `coral-deep`, and it sits in the check's slot, so the row reads "viewed ✓ / not yet ●".
- Its word is kept for screen readers. This departs, on the owner's word and for this control alone, from
  R-130's "the shape never travels alone", which D5b's switcher rows keep.
- Without the chip, the unviewed rows' captions fit on one line again, as S4d draws them.

**One name per visitor (R-170).**

- The frames use two words for the first visitor. The trigger reads **Anonymous** (S4a, S4d `:374`, FR-D16 and
  B9), and the menu row reads **Logged out user / Not signed in** (S4d `:401`).
- The first build drew both, as Story 5.13 built D5e's mixture of words. The owner ruled: *"All of these should
  be same"*.
- So each visitor's one name is its menu row's title, and the trigger, the panel's caption and the announcement
  all read it: "Logged out user", "a free member", "a paid member". `PREVIEWING` is derived from the titles, so
  the sentence cannot drift from the list.
- The panel's Member visibility select keeps A22's own audience words ("Logged out", beside "Free members" and
  "Paid members", R-124), which the owner named as the model.

**The member object: a later ruling governs an earlier sentence.**

- FR-D16's "the bindable member object is exactly `uuid · email · name · firstname · avatar_image ·
  subscriptions · paid · status`" dates from the PRD's first commit (2026-08-19). It adds that three of those
  fields, `firstname`, `avatar_image` and `subscriptions`, are "exactly what a member-home design needs".
- R-4 (2026-08-27) kept exactly that set as Ghost's proven maximum.
- R-28 and AD-38, from the same step, forbid printing six of those eight fields. The mechanism is the public
  cache keyed on tier alone, confirmed in source (MEASUREMENTS §31b).
- R-28 and AD-38 name FR-I6, FR-H6 and FR-F6 among the requirements they bind, and not FR-D16, so FR-D16's
  sentence was never brought into line.
- So nothing in the product binds `@member`. The canvas previews the **tier**, which is the only part of the
  object a design may test, through `data-members`. The PRD sentence is corrected as a propagation (a Dev task),
  not reinterpreted in code.
- The eight fields and `null` when logged out are Ghost's own. They were read in source today on both majors,
  with `paid: status !== 'free'`. That same line is why comped previews as Paid, and why Ghost 6.58.0's `gift`
  (`member-bread-service.js:135`), a status FR-D16 does not name, does too.

**Why the gated-body indicator is Story 5.20's.**

- The indicator annotates a **body**. No canvas draws one today:
  - no Post Content design exists (A25 arrives in Epic 10)
  - `renderSection` passes no `fixtures`
- The default Post subject, the style-guide post, is `visibility: members`. An indicator keyed on the subject
  alone would therefore describe, on every Post canvas, an article that is not on screen. That breaks 5.13's
  rule that a pill describes the canvas, never the paperwork.
- Story 5.20's Paywall editor is the first canvas that draws a gated body. C3a says "View as stays in the chrome
  because switching to Paid member is the only way to check that the cut disappears"
  (`C Post Body.dc.html:1548`).
- Deciding the cut also needs `access` for each visitor, which is Ghost's `checkPostAccess` in
  `members/content-gating.js`. DW-128's withheld reading time needs that same value. So the indicator, `access`
  and DW-128 land together there. This is R-118's rule: a surface arrives with the story that makes it true.
- NFR-6(c)'s "exclude gated-body equivalence" needs no code. (c3) is not built yet and already excludes the
  whole body (Story 7.34). (c1) and (c2) compare no bodies.

**Where the other two borrowed parts land.**

- **The announcement strip.** Story 5.21's criteria already say "honouring the member-state toggle". It reads
  the same `viewAs` this story adds. Ghost's audience rule was read in source today: `visitors`,
  `free_members`, and `paid_members` meaning any status except free, identical on both majors.
- **The pre-deploy half.** FR-D16 points at FR-J13, which is 7.20's first-deploy backup gate. The check that
  runs on every deploy is Pre-flight, in Story 7.18 (S8b), and no Epic 7 story carries a member-state
  criterion. 7.18 gains one, reading this story's column through `unviewed`.

**Why a refused write is logged and not said.**

- Story 5.13 surfaced a refused subject because a subject is an explicit choice that would silently be lost.
- The viewed record is bookkeeping. Losing it costs one reminder that reappears after a reload, while
  announcing it would interrupt someone who changed nothing.
- The writes go through one promise chain, so a later record can never be overwritten by an earlier answer
  that arrives late.

**What the owner will notice about Free and Paid today.**

- Both members-aware pilots draw the same thing for Free and for Paid:
  - Rail has two identical Account links.
  - The Inline Row has two identical "Signed in" slots.
- So on "Pilot sections", Free and Paid look alike **unless a section's Member visibility separates them**. The
  manual test uses exactly that.
- The categories that draw real differences arrive in Epics 9 and 10: A1's per-action states, A30, and A32.

## Verification

**As built.** Where the build departs from the spec's letter, and why:

- **The trigger's value is left-aligned in its fixed slot** (`text-left`). A button centres its text, which put the
  slot's spare width on both sides of "Anonymous" and opened the gap after "View as" to about 11px. Measured in the
  harness after the change: the word sits **7px** after "View as" for all three visitors, as S4a draws it.
- **The centred menu is placed with a plain `left`, not S4d's `translateX(-50%)`.** It is set in `openMenu`'s
  next-frame pass, so the clamp that follows measures the box it moves, which is the spec's own condition.
- **An undo that restores a canvas that is not on screen leaves that canvas viewed by nobody.** R-167 says a changed
  page is viewed only as the visitor on screen, and nobody is looking at a page that is not on screen. Tested in
  `view-as.test.ts`.
- **The keyboard journey is two tests.** One is the walk: Tab, Enter, ↓, Enter, Esc and back. The other presses every
  printable key, plus Space, Enter, Delete and Backspace, and checks that the `?` card has no row for View as.
- **Step 8 gains one axe run with S4d's menu open** (with the marker showing, until R-169 took it out), so its zero
  covers the new surface.
- **Edits beyond the spec's document list:**
  - the R-167 and R-168 ledger targets ticked in `reconcile-designs-decisions.md`
  - `docs/section-authoring.md`'s `data-members` table now names Ghost 6's `gift`
  - an as-built note in `epic-5-context.md`
- **S4d's 260px menu, with a "Not viewed" chip on each unviewed row, wrapped those rows' captions to two lines.**
  *Superseded by R-169:* the chip became an 8px dot, and every caption fits on one line again.

**What covers the matrix rows that the deployed walk does not drive:**

- **Save refused** is walked by the keyboard harness, which has no database, so every write there is refused. The
  View as journey asserts the refusal is **logged** (the console warning), **never said** (`#editor-said` still names
  the visitor), and that the session's record stands: after the pick, only Paid member's row keeps its dot (R-169).
- **Header or footer change** is `afterChange`'s site half, tested in `view-as.test.ts`: the canvas on screen goes
  to `[visitor]`, every other record goes to `[]`, and empty or missing records are not returned. The editor calls it
  on the same line as a canvas edit, and a canvas edit is on the deployed walk.
- **The ring half of Picker and ring is true by construction.** The Design block draws tiles only for a ring longer
  than one, and every ring in the shipped library has length 1, so no tile exists to look at. `member` reaches each
  `Tile` through the same `preview` object as `subject`.

**Run at Dev (2026-09-21), locally, Node 24.18.1:**

- `pnpm check`: **exit 0**. Lint, typecheck and every package test passed:
  - `apps/web`: **457, 0 fail**, `view-as.test.ts`'s 12 among them
  - `packages/library`: **165**
  - `packages/section-runtime`: **220**
  - `packages/ghost-shim`: **34**
  - `packages/theme-compiler`: **1**
  - `node tools/check-snapshots.mjs`: **PASS, unchanged**, *5 designs at 10 targets match 6 committed snapshot
    files*. No file under `packages/` or `supabase/` is in the diff, so there is no Schema phase (R-99).
- `node --test apps/web/view-as.test.ts`: **12 tests, 0 fail**.
- `pnpm keyboard`: **37 passed**, including the View as walk, "no key binds View as" and UX-DR9's Tab walk, whose
  budget is now counted off the page. `apps/web/next-env.d.ts` was left clean.
- **Controls (standing rule 2).** Each break below was made on purpose, made its test fail, and was put back
  byte for byte (checked with `cmp`):
  - no `paint()` in `chooseVisitor`: the View as journey failed on its repaint assertion
  - `afterChange` with its site half removed: `view-as.test.ts` went to **1 fail, 11 pass**, on the header-or-footer
    test
  - the refusal *said* through `#editor-said`: the journey failed on *said*, with "The looked-at record could not
    be saved."
- `bash tools/matrix/run-matrix-gate.sh`: **passed**. *180 cases · 5 designs · 1 packs · 0 violations*, 182
  Playwright tests, and no file under `tools/matrix/` changed.
- `python3 tools/doc-audit.py --check`: **PASS twice**, 0 warnings.
- **Geometry in the harness editor at 1440×900**, measured in Chromium:
  - The centred group spans 542.5 to 897.5, which is centred to **0px** in the 1440 bar. It holds Template (148)
    then 8px then View as (**199 × 32**).
  - The marker is **2px** off the trigger's right edge, 20px high and vertically centred on the trigger.
  - The menu is **260** wide. Its centre is the trigger's centre, and it sits 6px below the trigger.
  - Set beside a render of S4d's own markup (`S4 Editor.dc.html:391-416`), the rows, heading, check and marker
    match its words, sizes, inks and radii.

**Real infrastructure at Dev (R-82):**

- **Supabase production.** Standing rule 1 on the upsert was executed ahead of Review:
  - Setup: one throwaway account through the Auth Admin API (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`), seeded with
    "Pilot sections". Its own session came from a magic-link `verifyOtp` over `SUPABASE_PUBLISHABLE_KEY`.
  - The writes: each server action's own payload through supabase-js 2.115.0, RLS on.
  - **Subject first, then record:** answered **201** then **200**, and both columns survived.
  - **Record first, then subject:** the INSERT half answered **201** and the UPDATE half **200**, and both survived.
  - A later record **replaces** the array (`["free"]`), and the subject is kept.
  - **The control:** a write that names `preview_subject: null` does clear it, and the same read sees that. So
    "survived" was a reading that could have failed.
  - **With no session**, a read and a write both answered **`401 / 42501`**.
  - Result: **0 FAIL**, users **13 → 13**, and the account was deleted in `finally`.
  - Review repeats this through the two server actions themselves. It adds the action's own refusal of a state that
    is not a visitor, which the actions' validation decides.
- **Ghost's own source, read in both releases' npm tarballs** (`ghost-6.58.0.tgz`, `ghost-5.130.6.tgz`): the four
  facts in `MEASUREMENTS.md` §46 were read again independently, with the same lines found:
  - the member block: `:27-40` on 6 and `:25-38` on 5, identical
  - `has.js:128`, and `evaluateList` at `:109-119`
  - the announcement audience: `:35-41`, differing only in the `require` path
  - `members.status`: `isIn` at `:440` on 6 (with `gift`) and `:449` on 5
  - `member-bread-service.js:135` on 6
  This is read in source, not recorded on T1 or T3.
- **Not touched, and not claimed:** T1, T3, Resend and Dodo.

**GitHub Actions and Vercel, at the Dev push `d4d6e266`.** Read with `GITHUB_TOKEN`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`
and `VERCEL_PROJECT`, by name:

- `CI` **success**: `check` (with `pnpm keyboard`), `rls` and `deploy` all passed. `Render matrix` **success**.
- Production is `dpl_Cd2TKiR2ZERF2fUjXbeHLCE9y5PH`, **READY**, with `githubCommitSha` `d4d6e266` = `HEAD`.

**The deployed walk (2026-09-21), against `https://app.inflozo.com` at `d4d6e266`.** This is R-82's own test:
`node tools/probe/run-verify-editor.cjs` with `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`
and `VERCEL_PROJECT`, under Node 24.

- **0 FAIL, 515 PASS.** Users went **13 → 13**, and both throwaway accounts were deleted in `finally`.
- **Step 2:** the centred group spans 542.5 to 897.5 in the 1440 bar, which is centred, and holds `editor-template`
  then `editor-view-as`.
- **All 22 of step 90's checks passed on production:**
  - **The trigger** is named "View as Anonymous" by its own words: the eye, 32px, and `aria-label` null.
  - **The marker** reads "2 not viewed". It is 2px off the trigger, 20px high, radius 24px, `rgb(255, 237, 232)` on
    `rgb(194, 56, 31)`, at 10.5px/600. It clears the right-hand cluster by **150px at 1440 and 70px at 1280**, and
    the group stays centred at both widths.
  - **S4d's menu:** "Preview as" drawn uppercase, then exactly `anonymous · free · paid`. The check is on the current
    row only, with no tint. The menu is 260 wide and centred to **0px**.
  - **Paid:** Rail shows `["Account"]`; the Inline Row has no form and shows "Signed in"; `#editor-said` says "The
    canvas is previewing a paying member."; the marker reads "1 not viewed" and names Free.
  - **Free:** the marker is absent. **Anonymous:** the signed-out render comes back. Template's left edge stayed at
    542.5 in all four states.
  - **The stored row** holds `member_states_viewed = ["anonymous","free","paid"]` against this user's id: the
    column's first writer. After a reload, View as is back to Anonymous and the marker is absent.
  - **Every printable key**, plus Space, Enter, Delete and Backspace, moved no visitor, and after a reload the record
    still held.
  - **R-167:** one edit (Member visibility → Paid members) brought back "2 not viewed", naming Free and Paid.
  - **R-168:** for a free member the section is left out (3 of 4 roots) while Layers keeps all 4 rows, and the caption
    reads "The canvas is previewing a free member, so this section is not drawn here." For a paying member the section
    is drawn, with no caption.
  - **Home → Post:** Paid is kept, Post's own record gives "2 not viewed", and Rail shows `["Account"]`.
  - **⌘K under Paid:** the Inline Row's card draws "Signed in" and no form.
- **Other steps that cover this story:**
  - step 5: the scripted session records **zero** CSP violations, with View as inside it
  - step 8: axe finds **zero** violations with the marker showing and the menu open
  - step 37: still passes at the Anonymous default
  - step 79: `/harness/editor` and `/harness/canvas` both answer **404**
- ***Stated plainly:*** the first walk against the same deployment ended **2 FAIL, 513 PASS**. Both failures were step
  36, Story 5.4's check on the section pill during a canvas scroll, and every step-90 check passed in that run too. The
  second walk passed step 36. Story 5.9 saw the same failure and recorded it only in its spec. It is now **DW-222**,
  with the failed run's numbers.

**The owner's two findings (R-169, R-170), run at Dev (2026-09-21), locally, Node 24.18.1:**

- `pnpm check`: **exit 0**.
  - `apps/web` ran **456** tests with 0 fail. That is one fewer than before, because the marker's words and their
    test went with the marker.
  - `node tools/check-snapshots.mjs`: **PASS, unchanged**.
  - No file under `packages/` or `supabase/` is in the diff.
- `node --test apps/web/view-as.test.ts`: **11 tests, 0 fail**. One of them asserts that every name and sentence
  comes from `ROWS` and that none says "Anonymous".
- `pnpm keyboard`: **37 passed**, and `apps/web/next-env.d.ts` was left clean.
- **Control (standing rule 2):** I put a dot on every row that is not the current one, and the View as journey
  failed on *"one visitor is left to look at"*. The file was then put back byte for byte, checked with `cmp`.
- **The harness editor at 1440, measured in Chromium:**
  - The trigger is **218 × 32**, reading "View as Logged out user", with no marker. The centred group still
    measures centred.
  - The menu dots only the unviewed rows. Each dot is 8px in `coral-deep`, and every caption fits on one line.
  - **With a project name at its limit**, the gap between the left cluster and the group was **41px** with Home and
    **15px** with "Member home", at both 1440 and 1280. The old `50% - 320px` gave **1px** with Home and **−25px**
    with Member home, which is the finding recorded under the task list.
- `python3 tools/doc-audit.py --check`: **PASS twice**.

**The deployed walk at `6f2944ef` (2026-09-21), the owner's two findings on production.**

- **CI** (`GITHUB_TOKEN`): `check`, `rls` and `deploy` all passed, and `Render matrix` passed.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production `dpl_2yWtYkEt4pot9v5CfmSgK7HE2zh9`,
  **READY**, built from `6f2944ef` = `HEAD`.
- **The walk:** `node tools/probe/run-verify-editor.cjs` with `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and the three
  Vercel keys, under Node 24. Result: **0 FAIL, 515 PASS**, users **13 → 13**, and both throwaway accounts were
  deleted in `finally`. All 22 of step 90's checks passed:
  - **R-170:** the trigger reads "View as Logged out user", named by its own words, and "Anonymous" is nowhere in
    the bar. The control reads the bar's own words back.
  - **R-169:** no marker, and no "not viewed", in the bar. In the menu, `["free","paid"]` each carry one dot, 8 × 8,
    `rgb(232, 75, 52)`, with the word held at 1px for a screen reader.
  - The dots go `["free"]` → `[]` as visitors are looked at. After a reload there are none. After one edit (R-167)
    `["free","paid"]` are dotted again. On Post, the dots follow Post's own record: `["anonymous","free"]`.
  - `#editor-said` says "The canvas is previewing a paid member.", and R-168's caption says "a free member".
  - Clearances measured: the trigger clears the right-hand cluster by **238px** at 1440 and **158px** at 1280.
  - **The long-name check:** a project name at its limit ends **15px** clear of the group beside the widest canvas
    label, which the walk measured as "Member home", at both widths.
  - Step 37's caption expectation, now read from the module, passed. Step 5's CSP count was zero, step 8's axe was
    zero with the menu and its dots open, and step 79 answered 404.
- ***Stated plainly:***
  - The first walk of this deployment ended **2 FAIL, 513 PASS**. Both failures were step 66b, the known save-on-tab-hide
    flake **DW-220**, now with this run's evidence, and every step-90 check passed in that run too.
  - The next attempt died on a 30s `waitForURL` timeout at **0 FAIL, 489 PASS**. That is the known harness flake, and
    not a result.
  - The one after that is the clean run recorded above.

**The owner's third round (R-171 and findings 4, 5 and 7), run at Dev (2026-09-21), locally, Node 24.18.1:**

- `pnpm check`: **exit 0**. `apps/web` ran **457** tests with 0 fail, `editor.test.ts`'s caption test among them.
  `check-snapshots`: **PASS, unchanged**.
- `pnpm keyboard`: **37 passed**, with `next-env.d.ts` left clean.
  - The first run failed the View as walk: *Expected "Free member", Received "Logged out user"*.
  - The cause: each menu first opened on its checked row from a second frame, scheduled from the popover's `toggle`.
    That frame could land AFTER a fast ↓ and take focus back, so Enter pressed the wrong row.
  - The fix: `openMenu`'s own frame, the one frame that focuses at all, now focuses and scrolls to the checked row.
    The rerun passed.
- **The harness editor, measured in Chromium:**
  - **The Template list:** every row leads with its Tabler glyph and carries its own line; the state mark trails the
    name; "Auto-generated" and "Empty" are `sr-only`; and Home, the current row, has the check with no tint.
  - **Scrolling:** the card measures **284 × 420**, and the list scrolls inside it at **378 of 538px**. With real
    scrollbars turned on, the Kit's slim rounded thumb sits inside the card under the heading. Every caption fits on
    one line, after three membership captions were shortened for the indented rows.
  - **View as:** the trigger's only glyph is its chevron.
  - **Click outside:** a press on the canvas closed each open menu.
  - **Narrow windows:** the Template card stayed inside the window at **1024 × 700** and **834 × 600**.
  - **The bar's own limit, 1280 down to 880:** the group clears the right-hand cluster by **6px at 960** and meets it
    at **940 (−4)**. That is recorded on Story 5.22's card.

**The fourth round (findings 8 and 9, R-172), run at Dev (2026-09-21), locally:**

- `pnpm check`: **exit 0**, with `apps/web` at **457, 0 fail** and `check-snapshots` **unchanged**.
- `pnpm keyboard`: **37 passed**.
- **The second scrollbar, measured in the harness with real scrollbars turned on.**
  - Before the fix, the popover itself was `284 × 420` on screen but scrolled `546` tall, with a 15px scrollbar of
    its own (`offsetWidth` 299). The overflow was the `sr-only` words of rows scrolled out of the list, standing
    unscrolled.
  - After the fix, the popover's client, scroll and offset boxes are all **284 × 420**, and only the list scrolls
    (378 of 538).
- **The highlight.** In both menus the current row takes the coral tint with its name at 600, and no row draws a tick.
  The card's shadow now shows around both menus.

**The deployed walk at `545b815e` (the third round), stated plainly.**

- Its first attempt died on a harness timeout, which is not a result.
- The second ran to its end at **2 FAIL, 517 PASS**, and every new R-171 stop passed:
  - step 40's glyphs, one-liners and in-card scroll
  - step 43's list opening on 404, `scrollTop` 160
  - step 90's eyeless trigger and the canvas press closing both menus
- **The two FAILs were step 90's stored record.** It read `["anonymous"]` for the whole 10-second wait, and after a
  reload the list dotted Free. By the step's second reload the record held all three: the writes landed, late.
- **A targeted probe on production could not reproduce it.** It used the same two canvas presses, then Paid, Free and
  the logged out user, and each case stored all three within **606ms** and **239ms**. That run also found that Chrome
  reports some of these server-action requests as `ERR_ABORTED` about 600–700ms in, while the write still lands.
- **This run was not clean:** I had a local harness compiling beside it, loading the same machine. The walk of the
  fourth round, below, is the record.

**The deployed walk at `52c1ff3f` (2026-09-21), the fourth round on production, run with nothing else on the
machine.**

- **CI** (`GITHUB_TOKEN`): `check`, `rls` and `deploy` passed, and `Render matrix` passed.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production `dpl_HtaEKbrQHjSHMuaZp4F4qQjCCNdK`,
  **READY**, built from `52c1ff3f` = `HEAD`.
- **The walk:** `node tools/probe/run-verify-editor.cjs` with `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and the three
  Vercel keys. Result: **0 FAIL, 519 PASS on its first attempt**, with users **13 → 13**. All 23 of step 90's checks
  passed. Among them:
  - **Step 40 (R-171, R-172):**
    - every Template row has its glyph and its own line under "Templates"
    - Home, the current row, reads `rgb(255, 237, 232)`; every other row is transparent, and no row has a tick
    - the list scrolls **378 of 538** inside a **420** card
    - `popoverScrolls: false`, so there is one scrollbar
  - **Step 43:** opened on 404, the list lands on it, focused and in view, with `scrollTop` **160**.
  - **Step 90:**
    - View as's current row is highlighted with no tick.
    - A canvas press closes both menus.
    - The stored record holds **`["anonymous","free","paid"]`**, and after the reload no dot comes back. The lag seen
      at `545b815e` did not recur.
  - Steps 36 and 66b, the two known intermittents, both passed. Step 5's CSP count was zero. Step 8's axe found zero
    violations with the menu and its dots open.

**R-173, the typed link (2026-09-21), on this machine before the push.**

- `node tools/stress/test-vocabulary.mjs`: **21 checks passed**, so `reference-tokens.css` holds exactly the bytes
  `referenceTokensCss()` emits.
- **`tokens.test.ts`'s R-173 test, and its control.** The same rule written as `a:not([class])`, which has
  specificity, **failed** it ("not zero-specificity"). The file was then restored and compared byte for byte.
- `pnpm check`: exit 0.
  - `packages/section-runtime` **221** pass, one of them new; `packages/library` 165, `ghost-shim` 34,
    `theme-compiler` 1, `apps/web` 457; none fail.
  - `check-snapshots: PASS — 5 designs at 10 targets match 6 committed snapshot files`, unchanged.
- `bash tools/matrix/run-matrix-gate.sh`: **180 cases · 5 designs · 1 packs · 0 violations — passed**, and no
  baseline changed. No design's pixels moved, in either mode or at any width.
- `pnpm keyboard`: **37 passed**.
- **A sweep in the keyboard harness** (`INFLOZO_HARNESS=1 next dev` and a scratch script) put a plain link into
  **every element that holds words** in every placed section. It did so on base, surface and contrast, in light and
  dark: 126 links over 30 rows.
  - **None was blue.**
  - The lowest contrast of a link's words against the ground behind it, on a ground its design offers, was
    **5.91:1** (dark, surface).
  - On contrast, the words took the ground's own text (15.46:1 light, 14.8:1 dark), and the underline took the
    contrast accent (7.99:1, 6.28:1).
  - A4-13's sub kept its own link style.
  - I checked pictures of a link in the newsletter's blurb by eye, in all four states.

**The deployed walk at `27877769` (2026-09-21), R-173 on production, run with nothing else on the machine.**

- **CI** (`GITHUB_TOKEN`): the `CI` run (`check`, `rls`, `deploy`) and `Render matrix` both succeeded.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production `dpl_ApmFUPMyBWFeSyuX5DHSEKrDDNqR`,
  **READY**, built from `27877769` = `HEAD`.
- **The walk:** `node tools/probe/run-verify-editor.cjs` with `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and the three
  Vercel keys.
  - The first attempt died on a harness timeout at 0 FAIL, which is not a result.
  - The second ran to its end at **0 FAIL, 520 PASS**, with users **13 → 13**.
- **Step 20, the new check:** the pasted link read `rgb(35, 32, 25)` words, `underline`, and an `rgb(217, 108, 63)`
  underline, on the `base` ground in `light`. Those are Paper's ink and accent, and not the browser's blue.
- Everything else held. All 23 of step 90's checks passed, and so did steps 36 and 66b, the two known
  intermittents. Step 8's axe found zero violations, including with the link panel open.
- **After the walk**, a sweep of the design export's grounds sharpened the words: the rule reads the ground from
  `data-bg` alone, so a design drawn on a ground of its own locks the Background role there or writes its own link
  rule (`docs/section-authoring.md`). Only `tokens.ts`'s comment and the documents changed. `reference-tokens.css`
  is byte-identical, which `test-vocabulary.mjs` checks (21 passed), and `pnpm lint` and the typecheck are green.

**Commands:**

- `pnpm check`. Expected:
  - lint, typecheck and every package test green, including `view-as.test.ts`
  - `node tools/check-snapshots.mjs` **unchanged**, the control: the one file under `packages/` in the diff is the
    token block (R-173), which restyles only a plain link
- `node --test apps/web/view-as.test.ts`. Expected: every I/O row over the pure module.
- `pnpm keyboard`. Expected: the View as journey and the UX-DR9 walk, whose budget is now derived, green in
  CI's `check` job.
- `node tools/probe/run-verify-editor.cjs` against `https://app.inflozo.com`. Run it with `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT`, under Node 24. Expected:
  - 0 FAIL, with step 2 (the group) and step 90 included
  - step 37 still green at the Anonymous default
  - zero CSP violations, and zero axe WCAG 2.1 AA violations
- `bash tools/matrix/run-matrix-gate.sh`. Expected: green and unchanged.
- `python3 tools/doc-audit.py --check`. Expected: exit 0. Run it twice, because its sub-tools regenerate on
  the first failure.

**Real services this story touches (R-82):**

- **Supabase** on production, through the signed-in user's own session (the walk's throwaway accounts):
  `project_template_prefs.member_states_viewed`. This story is its **first reader and first writer**.
- **Standing rule 1 applies to the upsert.** Supabase-js's upsert updates only the columns it names, and that
  is a claim until it is executed. At Review, on the real database, in this order:
  1. Plant a subject with `setPreviewSubject`.
  2. Write a record with `setViewedStates`.
  3. Read both back. Both must survive.
  4. Repeat in the reverse order.
  5. Negative controls: a state that is not a visitor is refused by the action, and the table answers
     `401 / 42501` with no session.
- **The deployed app** on `app.inflozo.com`.
- **Not touched, and not claimed:** T1, T3, Resend and Dodo. The canvas previews the bundled publication until
  Story 5.18, and nothing here sends mail or takes payment. **R-173 included:** no theme built from these sections
  reaches a Ghost site before Epic 7, so its rule is checked on T1 and T3 when a theme first ships the token block
  (Story 6.1's criterion).

**The Deploy (2026-09-21), `f0005884`.** Deployment: `dpl_Fs4iwTwodCJ6vBJjf2m53Xp2Nemy`
(`inflozo-cfxhfoc46-umangkagathara.vercel.app`), served on `https://app.inflozo.com`.

- **CI** (`GITHUB_TOKEN`): run `35628673782` (`check`, `rls`, `deploy`) and `Render matrix` `35628673750` all succeeded.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): production `dpl_Fs4iwTwodCJ6vBJjf2m53Xp2Nemy`, **READY**,
  built from `f0005884ee2954cd817d57ee18176a8994d96429` = `HEAD`.
- **Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`): the owner's-test project `b6d4db35-8e5e-45e1-a70f-4daa28916d51`
  ("Pilot sections") exists.
- **Production** (no key): both `/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` and `.../post` on `https://app.inflozo.com`
  answer 307 to `/sign-in` when logged out.
- No schema change in this story, so no migration to apply. `owner_test` stays `pending`.

## Owner's manual test

Do this on the real site after Deploy confirms the build. Use the **Pilot sections** project, the one seeded to
your account at Story 5.1. **Step 6** is your ruling **R-167** (any change brings the reminder back), **steps 7
and 8** are **R-168** (a hidden section is left out of the page), and **steps 1 to 5** are your two findings on
this build, **R-169** (a coral dot in the list, nothing beside the button) and **R-170** (one name for each
visitor), and **steps 2a to 2c** are **R-171** (the two lists look alike) and your findings on scrolling and on
clicking outside, and **steps 13 to 15** are **R-173** (a link you type looks like your Style Pack's links), all
from 2026-09-21.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the middle of the top bar. | — | Two buttons that look alike: **"Template Home"** and right beside it **"View as Logged out user"**, with no eye. **Nothing** sits to the right of them: no "not viewed" tag. On the page, the header shows **Sign in** and **Subscribe**, and the newsletter band shows its email box. |
| 2 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press **View as**. | — | A list headed **PREVIEW AS** with three rows, each with its icon on the left: "Logged out user — Not signed in" **highlighted in pale coral** (the one you are on), then "Free member" and "Paid member", each with a small **coral dot** at its right end, meaning "not looked at yet". Hold the pointer on a dot and it says **Not viewed**. |
| 2a | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click anywhere on the page itself, below the list. | — | The list **closes**. Open it again and press Esc: it closes too. |
| 2b | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press **Template**. | — | A list headed **TEMPLATES** that looks like the View as list: every row has an **icon** on the left (a house for Home, an article for Post, a page for Page, a tag, a person for Author, a person-plus for Signup, a door-arrow for Signin, a person-in-circle for Member home, "404" for 404), the name, and **one grey line** saying what the template is — "Your site's front page", "A single article", "Where visitors join" and so on. On the right of each row is its small mark: a filled dot for a designed page, a hollow dot for an auto-generated one, a crossed-out circle for an empty one — with **no "Auto-generated" or "Empty" words**. Hold the pointer on a mark and it says what it means. **Home is highlighted**, and no row has a tick. |
| 2c | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | the open Template list | Scroll the list with your mouse wheel or trackpad. | — | The list **scrolls inside its card**, with **one** thin rounded scrollbar inside the card and none outside it, and the card stays the same height. The page behind does not move. Click on the page: the list closes. |
| 3 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | the open list | Choose **Paid member**. | — | The page changes at once. The header's Sign in and Subscribe become **Account**, and the newsletter's email box becomes **"Signed in · Manage your preferences"**. The button reads "View as Paid member". Open the list again: **Paid member is highlighted**, and only **Free member** still has a dot. |
| 4 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Choose **Free member**. | — | The page looks like the paid one, because these sample sections treat both kinds of member the same (step 7 shows the difference). Open the list: **no row has a dot** — you have looked at Home all three ways. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | **Reload the page**, then open the list. | — | "View as" is back to **Logged out user**. Like the device and light/dark buttons, it is not saved. **No dots**: the editor remembered that you looked at Home all three ways. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the newsletter's heading, "One letter a week, on Friday morning", add a word, then open the View as list. | add `really` | The dots come back on **Free member** and **Paid member**. The page changed, so those two views are out of date. |
| 7 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home, right-hand panel | With the newsletter selected, set **Member visibility** to **Paid members**. | — | The band **disappears**, because a logged out user never sees it. The panel says "The canvas is previewing a logged out user, so this section is not drawn here." |
| 8 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Switch View as to **Paid member**, then to **Free member**. | — | For Paid member the band is **back**. For Free member it is **gone** again, and the panel's sentence now says "a free member". |
| 9 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Set Member visibility back to **Everyone**, and remove the word you added in step 6. | — | The band is back for every visitor, and the heading reads as it did. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Editor, Post | Switch Template to **Post**, then open the View as list. | — | View as keeps the visitor you had chosen. Post counts on its own: the two visitors you have not looked at Post as each carry a **dot**. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Editor, Post | Switch View as to **Paid member**, then press `⌘K` and look at a **Newsletter** card. | — | The card shows "Signed in" rather than an email box, because the picker previews what you are viewing as. Press Esc to close it. |
| 12 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Editor, Post | Press `?`. | — | The shortcuts card has **no row for View as**. It has no key, on purpose, because it is set-and-forget. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Switch Template back to **Home**. Click into the newsletter's grey text under its heading and select the word **corrections** (double-click it, or drag across it). In the small toolbar press the **link** button, type `night`, choose the post, then press **Done**. | `night` → *The night shift at the port of Algeciras* | **corrections** is **dark ink with a thin orange underline**, not blue, and a little darker than the grey words around it. |
| 14 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press the **sun** button in the top bar (its tip says "Preview dark mode"), then press it again. | — | In dark mode the word is **orange**, underlined in orange. Back in light it is ink again. |
| 15 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home, right-hand panel | With the newsletter selected, set **Background role** to **Contrast**. Then set it back to **Base**, select **corrections** again and press **Remove link** in the toolbar. | — | On the dark band the word is **light like the text around it**, with a **pale orange** underline, so it never disappears. Afterwards the band and the word are as they were. |

## Owner's test findings

**1. "Remove '2 not viewed' text. Instead just show a coral dot in the dropdown items. Dot means that list items is
yet to be viewed."** (the owner, 2026-09-21, on the deployed build `d4d6e266`). **Fixed in this story; ruled as
R-169.**

- The coral tag beside the button is gone.
- In the list, each visitor you have not looked at this page as carries one coral dot at the right end of its
  row. The row you are on never has one: since your finding 9 it is highlighted instead.
- A screen reader still hears "Not viewed" on those rows, because the word is there for it and hidden from the
  eye.
- With the tags gone, the grey second lines fit on one line again.

**2. "Rename Anonymous to Logged out user like it is in Controls and View as dropdown value. All of these should
be same to avoid confusion."** (the same day). **Fixed in this story; ruled as R-170.**

- The button now reads "View as **Logged out user**", the same name as the list's first row.
- The panel's sentence and the announcement use the same names: "a logged out user", "a free member" and "a paid
  member", no longer "a visitor who is not signed in" and "a paying member".
- All of them come from one list, so they cannot drift apart again.
- The Controls panel's Member visibility list is unchanged: Everyone · Logged out · Free members · Paid members.
  You named it as the model, and its entries are groups of visitors rather than one visitor.

**Found while fixing them:** a very long project name could run under the middle of the top bar, because the
middle group now holds two buttons. The name now stops shorter, leaving a gap. The walk measures it with a long
name.

**3. "Add icons for dropdown items in Template at top. Use relevant icons from Tabler icons. Use a relevant icon for any
custom template a user may create. Remove eye icon from the View As dropdown. Just keep the icons in the dropdown
items. Both Template and View as dropdown to look similar. Add relevant one liners below the template name. Add
'Custom template' one liner below custom templates. Remove Auto generated and Empty text from right of list items.
Instead show the relevant icons there which are currently shown on left."** (the owner, 2026-09-21, on `6f2944ef`).
**Fixed in this story; ruled as R-171.**

- The two buttons and their lists are now built from one set of parts, so they look alike and cannot drift apart.
- **The Template list:**
  - Every row has a Tabler icon, and one grey line under the name saying what the template is.
  - The auto-generated and empty marks moved to the right of the row. The words "Auto-generated" and "Empty" are
    gone from the screen.
  - Holding the pointer on a mark shows its word, and a screen reader still reads it.
- **Custom templates** you create later (the Routes Manager, Story 7.16) will show Tabler's "template" icon and the
  line "Custom template". Both are ready and recorded on that story.
- The eye is gone from the View as button. Its list keeps its icons.

**4. "If dropdown list grows in size, add scrollbar and ensure the dropdown looks good with scrollbar for vertical
scrolling. Do not increase the height of dropdown much."** **Fixed in this story.**

- Both lists stop at the height the Template list already had, and scroll inside their card with the app's thin
  rounded scrollbar.
- The heading stays put while the list scrolls.
- A list opens on the ticked row, scrolled into view. On 404, the Template list's last row, you land on 404 rather
  than at the top.

**5. "Clicking anywhere outside the dropdowns should close the dropdowns."** **Fixed in this story.** A click on the
page itself (the canvas) did not close an open list. That is because the page sits in a frame of its own, which the
browser's own "click outside" never hears. Now a press on the page closes any open list, as a press anywhere else in
the editor already did.

**6. "Any text that is made an anchor link using the text controls becomes blue. Is there any story to make anchor
link designs?"**

- **Part of this exists.** Your ruling R-112 (15 Sep) already decided how a link looks: ink words with an orange
  underline, and orange words in dark mode. Story 6.1 makes that look a per-Style-Pack setting.
- **The missing part:** no story connects that look to a link made with the text toolbar inside a section. So the
  browser's default blue shows on the canvas, and a published site would show the same.
- Fixing it changes the engine that draws every section, which this story's spec says to ask about first.
  **Question 3 below.**
- **Fixed in this story; ruled as R-173** (your answer to Question 3). A link you make with the text toolbar is now
  dark ink with an orange underline, and orange in dark mode. On a dark (Contrast) band it takes the band's light
  text with a pale orange underline, so it never disappears. A section that draws its own links, like the Hero's
  small text, keeps its own look.

**7. "Ensure all changes are responsive."**

- Both lists narrow to fit the window, stop at 70% of a short window's height, and truncate a long line rather than
  wrapping it. Measured at 1440, 1024 × 700 and 834 × 600.
- **One limit remains:** the top bar itself. With both buttons in its middle, it clears the right-hand buttons down to
  about 960px wide and touches them below about 950px, measured in the harness from 1280 down to 880.
- Below that width, the right-hand buttons should move into one overflow menu, as the design for narrow screens
  draws. That is Story 5.22's job, and its story card now says so.

**8. "When there is a scrollbar in dropdown, there are two scrollbars. One is inside the dropdown container and one is
outside."** (the owner, 2026-09-21, on `545b815e`). **Fixed in this story.**

- The outside one belonged to the list's pop-up box itself, and was caused by the words kept for screen readers
  ("Empty", "Not viewed").
- Those words are hidden by placing them absolutely. Without a positioned row around them, they stood at their
  unscrolled places below the card, so the pop-up box grew a scrollbar of its own.
- Each row now holds its own words. The pop-up box can no longer scroll at all: only the list inside the card does.
- A side effect the designs wanted: the card's soft shadow now shows. Before, the pop-up box clipped it.

**9. "For active template or view as — instead of showing a tick mark, show that list item as highlighted."** (the
same day). **Fixed in this story; ruled as R-172.**

- In both lists, the row you are on is highlighted in pale coral with its name in bold, and no row has a tick.
- A screen reader is still told which one is current.

*`owner_test` stays `pending`* rather than moving to `issues`: these arrived during Dev, from the owner looking at
the deployed build early, and are fixed inside the Dev phase, as Story 5.13's scroll finding was. His formal test of
the finished story, the manual test above, has not run yet.

## Questions for the owner

### Question 1 — When should a page's "looked at" record run out?

**In plain English.** The new coral tag counts the kinds of visitor you have not yet looked at a page as.
Once you have looked at Home as all three, the tag disappears. The question is what brings it back.

**An example.** You look at Home as a logged-out visitor, a free member and a paid member, and the tag goes.
Later, working as a logged-out visitor, you reword the "Signed in" line from the side panel. Only members ever
see that line.

1. **Any change to the page brings it back (RECOMMENDED).**
   - After the rewording, Home's tag reads "2 not viewed" again.
   - The check before you publish (Story 7.18) would list Home.
   - It is never wrong about what you have seen. The cost is that it will be on screen often while you are
     still designing. It never stops you.
2. **Once looked at, always looked at.**
   - The tag goes away for good after the first pass on each page. This is the quietest option.
   - It could never remind you about the "Signed in" wording, which is exactly the kind of forgetting the
     reminder exists to catch.
3. **Only changes to who sees what bring it back.** Those are adding, removing or swapping a section, or
   changing a section's Member visibility.
   - Quieter than option 1.
   - It misses the rewording in the example above.

Under options 1 and 3, a change to the header or footer counts for every page, because they appear on every
page.

**Ruled: option 1 (owner, 2026-09-21).** *"Any change to the page brings it back."* Recorded as **R-167**. A
change to a canvas's doc, undo and redo included, leaves that canvas viewed only as the visitor on screen. A
change to the header or footer does the same for the canvas on screen, and empties every other canvas's
record, because they appear on every page. A hydrate is not a change. `afterChange` in `apps/web/lib/view-as.ts`
is the one place the rule is decided, and `commit()` and `restore()` are its only callers. The reminder still
never blocks, and the record is still never part of the doc, the journal or `⌘Z` (AD-22). Story 7.18's
Pre-flight step reads the same record.

### Question 2 — A section hidden from the visitor you are viewing as: leave it out, or show it faded?

**In plain English.** Any section that carries **Member visibility** can be set to show only to some visitors.
When you view the page as a visitor who cannot see a section, the editor has to decide how to draw that
section. The design notes suggest one answer. The rule that the page on screen is the real page suggests
another.

**An example.** Your newsletter band is set to "Logged out" only, and you switch View as to Paid member.

1. **Leave it out, exactly as a paid member sees the page (RECOMMENDED).**
   - The band disappears and the page closes up.
   - Its row stays in Layers. When you select it, the panel says "The canvas is previewing a paying member, so
     this section is not drawn here."
   - This is what the editor already does today, and it keeps the page on screen the real page with nothing
     drawn over it.
2. **Show it faded to 40% with a small "Hidden for this audience" label**, as the design notes suggest.
   - You can still click it on the page.
   - But the page no longer looks like what a paid member gets, and a label sits on your design.
3. **Show it normally, with a dashed outline and a line such as "Not shown to paid members"**, as the
   announcement-bar notes suggest.
   - The easiest to edit.
   - The least like the real page.

**Ruled: option 1 (owner, 2026-09-21).** *"Leave it out, exactly as a paid member sees the page."* Recorded as
**R-168**. On the canvas, `gateMembers` leaves out a section whose Member visibility excludes the visitor being
previewed, as Stories 4.10 and 5.4 already built it. Nothing is ghosted, labelled or outlined over the page. Its
Layers row stays, and R-124's caption names the visitor ("The canvas is previewing a paying member, so this
section is not drawn here"), now following View as rather than a constant. This supersedes the P0·4 spec's 40%
ghost with its "Hidden for this audience" pill (`P0 Editor Primitives - Spec.md:376-377`, flagged ⚑ and never
accepted) and A2-0's dashed outline (`A2-0 Category Proof.dc.html:44`), which no story had built. A2's own
`audience` control, when its Epic 9 story builds it, follows the same rule. The export is untouched (R-74);
`reconcile-designs-decisions.md` is the record.

### Question 3 — Links typed into a section's text show the browser's plain blue. Where should they be fixed?

**In plain English.** You already decided how a link should look (ruling R-112, 15 September): the words stay in the
text colour with an orange underline, and in dark mode the words turn orange. Each Style Pack will get its own link
look later (Story 6.1). But no story connects that look to a link you make with the text toolbar inside a section.
So today the browser's default blue shows on the canvas, and a published site would show the same, because the theme
is built from the same section styles. Fixing it is a small change to the engine that draws every section, in the
editor and in the published theme alike. This
story's spec says to ask before changing that engine.

**An example.** In the Hero's title you select "Friday", press the link button and paste an address. Today "Friday"
turns bright blue and underlined. After the fix it stays dark ink with an orange underline, and in dark mode it turns
orange.

1. **Fix it in its own small story, straight after this one (RECOMMENDED).**
   - The same fix, and View as's review stays about View as.
   - The change reaches every link on every page and in the published theme, so it gets its own check on your two
     Ghost test sites.
2. **Fix it inside this story now.**
   - The same fix, reviewed and tested together with View as.
   - This story takes longer to finish.
3. **Leave it for the Style Packs** (Epic 6, Story 6.1).
   - Nothing changes until then, and links stay blue.

**Ruled: option 2 (owner, 2026-09-21).** *"Fix it inside this story now."* Recorded as **R-173**. A link typed with the
text toolbar takes R-112's link look, from the Style Pack's own `--link-color` and `--link-decoration` tokens, on the
canvas and in the published theme alike. It is fixed inside Story 5.14; this ruling is the "ask first" the spec's
`packages/` boundary required.
