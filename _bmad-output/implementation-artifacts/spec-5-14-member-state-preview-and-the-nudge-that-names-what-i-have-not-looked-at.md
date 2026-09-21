---
title: 'Story 5.14 — Member-state preview, and the nudge that names what I have not looked at'
type: 'feature'
created: '2026-09-21'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '02685eaac078a9c5bbf9b5c551d131092a07810d'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A new **View as** button beside "Template" at the top of the editor lets you see your page as each of
three visitors: someone who is not signed in, a free member, and a paying member. Choosing one redraws the
page at once, so the header's "Sign in" and "Subscribe" turn into "Account" and the newsletter band's email
box turns into "Signed in". A small coral tag beside the button, such as **"2 not viewed"**, counts the
visitors you have not yet looked at this page as, and the list under the button names them, so a members'
version of a page never goes out unseen; it only reminds you and never stops you.

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
- **The record and the marker.** Record per canvas which visitors have been looked at, in the column that has
  been waiting. Draw S4d's "N not viewed" marker beside the toggle, and put its words on each unviewed row of
  the menu.
- **What does not change.** No runtime change and no migration, so there is **no Schema phase**.

## Boundaries & Constraints

**Always:**

- **The canvas is the site, for the chosen visitor, through ONE door.**
  - `renderSection(… { member })` and Story 4.10's `gateMembers` decide everything. No surface renders a
    visitor its own way.
  - Anonymous is Ghost's `@member === null`. Free is a member with `paid: false`. Paid is a member with
    `paid: true`.
  - That is Ghost's own rule, `paid: status !== 'free'` (`update-local-template-options.js:27-40`, identical on
    6.58.0 and 5.130.6). So `comped`, and Ghost 6's `gift`, both preview as Paid. The menu offers exactly three
    rows (B9: "only").
- **View as is a MODE** (`EXPERIENCE.md:230`). It is session state beside `mode` and `device`: never in the
  URL, never stored, back to Anonymous on reload, and kept across a canvas switch.
- **Looking is never an edit.**
  - Nothing reaches `commit()`, the journal or `⌘Z`.
  - An untouched canvas stays untouched. AD-22 names `project_template_prefs` as the home for "FR-D16's viewed
    member states" for exactly this reason.
- **The viewed record is per canvas**, in `project_template_prefs.member_states_viewed`.
  - It is written through the caller's own session, as `setPreviewSubject` is.
  - A visitor counts as viewed the moment the canvas is shown in that state.
- **Any change to a page makes its other visitors unviewed again** (Question 1, option 1, as drafted).
  - A change to a canvas's doc leaves that canvas viewed only in the visitor on screen.
  - A change to the site doc (the header or footer, which appear on every page) does the same for the canvas
    on screen, and empties every other canvas's record.
  - Undo and redo are changes. A hydrate is not.
- **The nudge reminds and never blocks.**
  - S4d's marker sits beside the toggle and is absent when nothing is unviewed (UX-DR3).
  - Every dot has its word beside it; colour never carries the signal alone.
- **A section whose Member visibility excludes the visitor is not drawn**, exactly as today (Question 2,
  option 1, as drafted). Its Layers row stays, and the panel's caption names the visitor being previewed.
- **No key binds View as.** FR-D11 calls it set-and-forget context, and R-145's table gains no row.

**Ask First:**

- Any change under `packages/`. The runtime already takes the visitor, and a change there moves
  `check-snapshots` and the render matrix.
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
| Opening | Any canvas, first visit | The trigger reads "View as · Anonymous". The canvas is the signed-out render, byte for byte what it is today. This canvas's record gains `anonymous`. The marker reads "2 not viewed". | N/A |
| Choosing Paid | Menu → Paid member | Repainted as a paying member: Rail's Sign in and Subscribe become Account, and the Inline Row's form becomes "Signed in". The trigger names the visitor. `#editor-said` announces it. The record gains `paid`. | N/A |
| Member visibility | A section set to Paid members, viewed as Free | Not drawn. Its Layers row stays. The panel's caption names "a free member". | N/A |
| All three viewed | Record holds all three | The marker is absent (UX-DR3). No menu row carries "Not viewed". | N/A |
| Reload | After viewing all three | View as is back to Anonymous. The record comes back from `project_template_prefs`, so the marker stays absent. | N/A |
| A change (Q1) | Any edit to this canvas's doc, undo and redo included | The record becomes `[visitor on screen]`, and the marker reads "2 not viewed". | N/A |
| Header or footer change | An edit to the site doc | The canvas on screen becomes `[visitor]`. Every other canvas with a record becomes `[]`. Only rows that change are written. | N/A |
| Canvas switch | Home → Post | View as is unchanged. Post records the visitor. The marker counts Post's own record. | N/A |
| Picker and ring | `⌘K`, or the Design block, under Paid | Cards and tiles render as a paying member. | N/A |
| Save refused | The upsert fails (offline, RLS) | The session's record stands. The canvas is unaffected. | Logged, not said: a lost record only brings the reminder back after a reload |
| Stored junk | The column holds a value that is not a visitor | Ignored on read. | N/A |
| Keyboard | Tab to View as, then Enter, ↓, Enter, Esc | Opens, moves, picks (repainted and announced), closes, and focus returns to the trigger. | N/A |
| Pilots, snapshots, matrix | `/pilots`, `check-snapshots`, the render matrix | Unchanged: nothing under `packages/` changes. | N/A |

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
  - The Q1 rule runs in these two and nowhere else. It never runs on the hydrate (`:1293-1298`).
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
  text-coral-text`, which is the marker's palette.
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
  - Step 37 (`:1770-1800`) pins the Anonymous default and stays valid.
  - Step 89 (`:3719-4012`) is Story 5.13's, and step 79's block starts at `:4013`.
- `tools/keyboard/journey.spec.mjs`:
  - `open()` is at `:38` and `said()` at `:54`.
  - The UX-DR9 Tab walk presses `all.length * 2 + 14` times (`:175`), a budget written down by hand.
  - `apps/web/lib/keymap.ts` gains no row.

**Frames:**

- `S4 Editor.dc.html:33` is S4a's centred group: Template ▾ Home, a gap of 8, then View as ▾ Anonymous. The
  View as trigger is:
  - `gap:7px; height:32px; padding:0 11px`, `#FFF`, a `1px #E7E2DB` border, radius 8
  - a 13px eye, "View as" at 12/500 in `#6E6A64`, the value at 12.5/600, and a 12px chevron
- `S4 Editor.dc.html:391-416` is S4d:
  - The menu (`:399-404`):
    - 260 wide, radius 12, padding 6
    - "Preview as" at 11/600 in uppercase, with letter-spacing .04em
    - rows padded `9px 10px`, each a 15px icon, a 13/500 title and an 11px caption
    - the current row carries a trailing 13px `#E84B34` check and **no tint**
  - The marker (`:405`): 20px high, `0 8px` padding, radius 24, `#FFEDE8` and `#C2381F` at 10.5/600, with a 5px
    dot, reading "2 not viewed".
  - The gated label (`:410`) is Story 5.20's.
- `B Missing Surfaces.dc.html:1417` is B9: "View as, which offers Anonymous, Free member and Paid member only".
- `EXPERIENCE.md`:
  - `:161`: the IA row (S4d + B9, the "top bar eye", three states)
  - `:230`: View as is a mode
  - `:735`: S4d, re-specified

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/view-as.ts` — **new, and pure**, following `ring.ts`, `device.ts` and
      `preview-subject.ts`, so that `node --test` reaches it. It holds:
  - `VISITORS`: `MEMBER_STATES` without `'everyone'`, in its order.
  - The words, exactly as drawn:
    - `LABEL`: "View as"
    - `VALUE`: S4a's Anonymous · Free member · Paid member
    - `ROWS`: S4d's three titles and captions
    - `HEADING`: "Preview as"
    - `NOT_VIEWED`: "Not viewed"
  - `PREVIEWING`, **moved** here from `sidebar.tsx`, so the panel's caption and the live region read one list.
  - `VIEW_AS_SAID(v)`, which returns "The canvas is previewing {PREVIEWING[v]}."
  - `readViewed(raw)`: the known visitors in canonical order, with junk dropped.
  - `seen(record, v)`: returns the **same array** when `v` is already in it, so the caller writes only when
    something changed.
  - `unviewed(record)`.
  - `markerWords(n)`: "`n` not viewed", or `null` at 0.
  - `afterChange(records, touched, onScreen, visitor)`: returns **only the records that change**, under Q1's
    rule.
- [ ] `apps/web/view-as.test.ts` — **new**. It covers every matrix row over the pure half:
  - `VISITORS` is asserted against `MEMBER_STATES`, never against a list written in the test.
  - `seen` keeps the same array when nothing changes.
  - `afterChange` is tested for a canvas edit, and for a site edit where other canvases' empty records are not
    returned.
  - The marker's words at 2, 1 and 0.
- [ ] `apps/web/lib/menu.ts` — `Placement.align` gains `'center'`.
  - The menu's centre sits under the trigger's, as in S4d `:399` (`left:50%; transform:translateX(-50%)`).
  - It is placed in `openMenu`'s next-frame pass, where the menu has a width, and clamped by the same rule.
- [ ] `apps/web/components/kit/icons.tsx` — add `Crown`, copying S4d `:403`'s path verbatim. R-92 says a
      glyph the export draws is read from the export.
- [ ] `apps/web/components/editor/view-as.tsx` — **new**. Three parts:
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
    - each **unviewed** row carries the marker's chip, reading "Not viewed", in the same trailing slot. The
      current row is always viewed, so the check and the chip never meet.
  - **The marker**, S4d's: `h-5 px-2 rounded-pill bg-coral-tint text-coral-text`, 10.5px/600, with a 5px
    `bg-coral-text` dot.
    - It is placed **absolutely**, 2px from the trigger as S4d draws it, so the centred group never moves as it
      comes and goes.
    - The trigger is `aria-describedby` the marker.
- [ ] `(editor)/actions.ts` — add `setViewedStates(projectId, rows: { templateKey, states }[])`.
  - **Validation:** `isUuid`; every key passes `canvasOfTemplateKey(key) !== null`; every state is in
    `VISITORS`; states are deduplicated; at most one row per canvas.
  - **The write:** **one** upsert of `{ project_id, user_id, template_key, member_states_viewed, updated_at }`
    on `project_id,template_key`, through the caller's session.
  - It names nothing else, so it can never clear a subject, and `setPreviewSubject` can never clear a record.
  - A failure logs `{ code }` and answers `{ error }`.
- [ ] `(editor)/read.ts` — add `member_states_viewed` to the prefs select, and return
      `EditorData.viewed: Record<string, Visitor[]>` through `readViewed`. A failed read uses the existing log
      and returns nothing.
- [ ] `apps/web/app/(app)/app/harness/editor/page.tsx` — add `viewed: {}` to the fixture.
- [ ] `editor.tsx`:
  - Add `viewAs`, starting at Anonymous, as session state beside `mode` and `device`, and put it in `latest`.
  - **Delete `PREVIEWS`.** `paint()` passes the visitor from `latest`. The panel's `previews` and both
    `SectionPreview` callers take `viewAs`.
  - `chooseVisitor(v)`: update `latest` first, then `paint()`, then `setSaid(VIEW_AS_SAID(v))`.
  - Add `viewed` state, read from `EditorData.viewed`, recorded through `seen` on `[key, viewAs]` once the
    editor is hydrated.
  - Apply `afterChange` inside `commit()` and `restore()`.
  - Send writes through **one** promise chain so answers land in order. A refusal is logged and never said.
  - Place `<ViewAs>` right after `<TemplateSwitcher>` in the centred group.
  - Correct the two comments listed in the Code Map.
- [ ] `apps/web/components/controls/sidebar.tsx` — import `PREVIEWING` from `lib/view-as.ts`. The caption
      itself does not change.
- [ ] `section-preview.tsx`, with its callers `section-picker.tsx:329` and `design-picker.tsx:76` — add an
      optional `member`.
  - It defaults to `'anonymous'`, so `/controls` is unchanged.
  - It is passed to `renderSection` and added to the paint effect's dependency list.
- [ ] `tools/probe/run-verify-editor.cjs`:
  - **Step 2** measures the centred **group** against the bar (S4a), not `#editor-template` alone.
  - **Step 90**, new, on the **deployed** editor. It checks:
    - The trigger's words, 32px height and eye; the group centred to within 2px in all three visitors, with
      and without the marker.
    - S4d's menu: the heading, three rows (no tier row and no comped row), and the check on the current row
      only.
    - Paid: Rail shows Account and no Sign in; the Inline Row shows "Signed in" and no form. Free: the same.
      Anonymous: back again.
    - A section set to Paid members is absent for Free and present for Paid.
    - The panel's caption names the visitor, and `#editor-said` announces the choice.
    - The marker goes 2 → 1 → absent. The unviewed rows' chips name exactly the visitors not yet viewed.
    - A reload restores Anonymous and keeps the marker absent, and the stored row really holds all three.
    - One edit brings back "2 not viewed".
    - A canvas switch keeps the visitor.
    - A `⌘K` card for the Inline Row under Paid shows "Signed in".
    - At 1440 and 1280, the marker's box does not intersect the right-hand cluster's.
    - No key changes the visitor.
    - Zero CSP violations (step 5) and zero axe violations (step 8).
- [ ] `tools/keyboard/journey.spec.mjs` — add one journey:
  - Tab reaches View as; Enter opens it; ↓ moves; Enter picks, and the canvas is repainted and announced.
  - Esc closes the menu and focus returns to the trigger.
  - Pressing each single key changes no visitor.
  - The UX-DR9 Tab budget is **derived** from the header's own focusable controls, instead of `+14` (standing
    rule 4).
- [ ] **Documents** (standing rule 3, then grep for the old wording, standing rule 7):
  - `prd.md` FR-D16 (`:233`, `:235`):
    - Name the member object as R-4's eight fields, of which R-28 and AD-38 let none be printed.
    - Say that `comped`, and Ghost 6's `gift`, preview as Paid.
    - Replace the "(FR-J13)" citation with the deploy wizard's Pre-flight step (FR-J8, S8b).
  - `prd.md` Appendix B's `@member` line (`:926`), which lists four of the eight fields.
  - `epics.md`:
    - Story 5.14's criteria say where each moved item went.
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

**Acceptance Criteria:**

- **Given** the editor at 1440
  **When** it opens
  **Then** the centred group holds Template and **View as · Anonymous** (eye, words, chevron). The group is
  centred in the bar. **It matches the frame**, S4a `:33`.
- **Given** View as is pressed
  **Then** S4d's menu opens: "Preview as", then Logged out user / Free member / Paid member, each with its
  caption and icon, and the check on the current row. No tier or comped row appears (B9: "only"). **It matches
  the frame**, S4d `:399-404`.
- **Given** a visitor is chosen
  **Then** the canvas repaints as that visitor through `renderSection`'s one door. The members-aware pilots
  change (Rail's actions, the Inline Row's form), a section's Member visibility is honoured, the trigger names
  the visitor, and `#editor-said` announces it.
- **Given** a canvas viewed as fewer than three visitors
  **Then** S4d's marker reads "N not viewed" beside the trigger, and each unviewed row of the menu says "Not
  viewed". Once all three are viewed the marker is absent. **It matches the frame**, S4d `:405`.
- **Given** a reload
  **Then** View as is Anonymous and the marker reflects the stored record.
- **Given** any change to the page's doc, or to the header or footer
  **Then** the record follows Q1's rule, and only the records that changed are written.
- **Given** the Section Picker or the Design ring under a visitor
  **Then** the previews render as that visitor.
- **Given** the keyboard
  **Then** View as is reachable and operable, and Esc returns focus to the trigger. No single key reaches it,
  and the `?` card lists no row for it.
- **Given** a choice (R-98)
  **Then** the canvas has repainted before a busy label could describe anything, and the background write
  carries none. No route is added, so no skeleton is owed. `busy.test.ts` stays green.
- **Given** `pnpm check`
  **Then** `tools/check-snapshots.mjs` and the render matrix are unchanged, because no file under `packages/` is
  in the diff.

## Spec Change Log

## Design Notes

**Why nothing under `packages/` changes.**

- Story 4.10 built the whole mechanism: `RenderInput.member`, `MEMBER_GATE` for the theme, and `gateMembers`,
  which on the canvas **removes** an element gated to another visitor.
- It also built the refusals: `member: 'comped'` is refused with "(comped previews as paid)".
- The editor never used any of it, because nothing could set the visitor.
- This story is the setter. The runtime's existing tests are the control: `agreement.test.ts:1172-1245`'s truth
  table, and `check-snapshots.mjs:496-516`'s member arms.

**Why View as sits beside Template, and not where the code comment says.**

- Every drawn top bar puts the eye in the centred group, immediately right of Template: S4a–c, S6, S7, S14,
  P0-6, D8 and M1.
- Below 1440, D8 keeps it in the bar (`D8 Editor Below 1440.dc.html:33`). The overflow menu holds device, undo,
  redo, dark mode and export, not View as.
- The comment at `editor.tsx:1909-1911` was an earlier story's guess and never a ruling.
- R-130 removed a **chip** from that group ("a notification adjacent to the Template dropdown"). It did not
  remove the group's second control. So step 2's centring check moves from the switcher to the group, exactly
  as S4a centres it.
- The marker hangs outside the centring, and the value slot is as wide as its widest word. Neither the marker
  appearing nor a change of visitor moves Template.
- At 1440 and 1280 there is room between the marker and the right-hand cluster, and step 90 measures it at
  both widths. On narrower windows the two eventually meet. Those widths are Story 5.22's responsive floor,
  and 5.22 inherits the marker in its measurements.

**The marker counts, and the menu names.**

- S4d draws a count ("2 not viewed"). The story's own title, and FR-D16's "surfaces the unchecked
  combinations", ask for names.
- The count is built as drawn, and each unviewed row in the menu carries the marker's own chip with its word.
  That is an extension of S4d's drawn menu made from S4d's own component, with no second vocabulary.
- With three visitors and the current one always viewed, "2 not viewed" is self-explanatory, and "1 not
  viewed" is answered by opening the menu.

**The words are the frame's, and the frame uses two for the first visitor.**

- The trigger reads **Anonymous**: S4a, S4d `:374`, FR-D16 and B9 all say so.
- The menu row reads **Logged out user / Not signed in** (S4d `:401`).
- Both are built as drawn (R-74), the way Story 5.13 built D5e's mixture of words.
- The panel's Member visibility select keeps A22's own "Logged out" (R-124).

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

**Commands:**

- `pnpm check`. Expected:
  - lint, typecheck and every package test green, including `view-as.test.ts`
  - `node tools/check-snapshots.mjs` **unchanged**, the control: no file under `packages/` is in the diff
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
  Story 5.18, and nothing here sends mail or takes payment.

## Owner's manual test

Do this on the real site after Deploy confirms the build. Use the **Pilot sections** project, the one seeded to
your account at Story 5.1. Two steps depend on how you rule the questions below. **Step 6** assumes
**Question 1** is ruled option 1, and **steps 7 and 8** assume **Question 2** is ruled option 1. If you rule
otherwise, those steps change to match your ruling before Deploy.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the middle of the top bar. | — | "Template · Home", and right beside it an eye with **"View as Anonymous"**. Just to its right is a small coral tag reading **"2 not viewed"**. On the page, the header shows **Sign in** and **Subscribe**, and the newsletter band shows its email box. |
| 2 | the same | Editor, Home | Press **View as**. | — | A list headed **PREVIEW AS** with three rows: "Logged out user — Not signed in" with a tick, then "Free member" and "Paid member". Each of the last two carries a small **"Not viewed"** tag. |
| 3 | the same | the open list | Choose **Paid member**. | — | The page changes at once. The header's Sign in and Subscribe become **Account**, and the newsletter's email box becomes **"Signed in · Manage your preferences"**. The button reads "View as Paid member", and the tag reads **"1 not viewed"**. |
| 4 | the same | Editor, Home | Press View as again and choose **Free member**. | — | The page looks like the paid one, because these sample sections treat both kinds of member the same (step 7 shows the difference). The coral tag is **gone**: you have looked at Home all three ways. |
| 5 | the same | Editor, Home | **Reload the page.** | — | "View as" is back to **Anonymous**. Like the device and light/dark buttons, it is not saved. The coral tag stays **away**: the editor remembered that you looked at Home all three ways. |
| 6 | the same | Editor, Home | Click the newsletter's heading, "One letter a week, on Friday morning", and add a word. | add `really` | The tag comes back: **"2 not viewed"**. The page changed, so the other two views are out of date. |
| 7 | the same | Editor, Home, right-hand panel | With the newsletter selected, set **Member visibility** to **Paid members**. | — | The band **disappears**, because a visitor who is not signed in never sees it. The panel says "The canvas is previewing a visitor who is not signed in, so this section is not drawn here." |
| 8 | the same | Editor, Home | Switch View as to **Paid member**, then to **Free member**. | — | For Paid member the band is **back**. For Free member it is **gone** again, and the panel's sentence now says "a free member". |
| 9 | the same | Editor, Home | Set Member visibility back to **Everyone**, and remove the word you added in step 6. | — | The band is back for every visitor, and the heading reads as it did. |
| 10 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/post` | Editor, Post | Switch Template to **Post**. | — | View as keeps the visitor you had chosen. Post counts on its own, so its tag reads **"2 not viewed"**. |
| 11 | the same | Editor, Post | Switch View as to **Paid member**, then press `⌘K` and look at a **Newsletter** card. | — | The card shows "Signed in" rather than an email box, because the picker previews what you are viewing as. Press Esc to close it. |
| 12 | the same | Editor, Post | Press `?`. | — | The shortcuts card has **no row for View as**. It has no key, on purpose, because it is set-and-forget. |

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_
