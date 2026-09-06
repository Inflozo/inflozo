---
title: 'Story 1.5 — The app shell and the dashboard skeleton'
type: 'feature'
created: '2026-09-05'
status: 'in-review'
baseline_commit: 'db959b1817cc6313c204f18a9f9a56593038a7d9'
review_loop_iteration: 3
owner_test: issues
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md', '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md']
---

## In plain English

After this story, signing in lands you on a real dashboard instead of the holding page: a left sidebar
with the Inflozo wordmark, Projects · Sites · Assets, and your account at the bottom; a top bar with a
project search and a red "New project" button; and your projects as cards, each with a small wireframe
picture, its name, a "Sample content" tag and when it was last touched. You can make a blank project,
rename it, duplicate it and delete it (after typing its name), and on the Free plan the second project
is refused politely with "Free includes 1 project. Pro gives you 25." and a Go Pro pill rather than a
blank error. Sites, Assets, Account settings, Billing & plan, Suggestions and Docs are drawn and linked
but show "not found" until their own epics build them — expected, not a fault — and everything works on
a phone, where the sidebar folds into a ☰ drawer.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A signed-in user lands on 1.4's one-line holding page. Nothing lists, creates, renames,
duplicates or deletes a project; the app has no shell for any later surface to sit in; and the plan cap
(FR-B4) and the one-site-per-project rule (FR-B5) have no surface. Every epic from E3 on needs a
dashboard to come back to.

**Approach:** The authenticated route group gains the S3 shell — sidebar, top bar, account menu, ☰ drawer
at 390 — and the dashboard page renders the user's projects as S3's cards from the `projects` table
through the user's own RLS-scoped session, with four server actions (create blank, rename, duplicate,
delete behind a typed name) and one server-side `resolveEntitlement` whose plan table is Appendix F.1
expressed once as data. "New project" opens the D4a sheet with Blank canvas as the one live door; at
the cap it opens as D4b, and the grid shows S3c's upgrade tile. Cards carry a static placeholder drawn
from the project's Style Pack, and the only pack that exists today is Paper.

## Boundaries & Constraints

**Always:**
- **The frames are `S3 Dashboard.dc.html` — S3a, S3b empty, S3c Free, S3d account menu (desktop popover
  and mobile dropdown), S3 · mobile · 390 and S3 · mobile — menu open — and `D4 Dashboard Sheets and
  Blocks.dc.html` D4a and D4b** (EXPERIENCE.md § Information Architecture, Dashboard and account).
  Values are read off the frames, never rounded (F-111); geometry is the frame's and colours are the
  token layer's names (1.4's precedent for S1's field). At 1440: a **220px sidebar** (`border-r line`,
  padding 24/12/16) carrying the wordmark "Inflozo" (display 20px/800, tracking −0.02em, padding
  0 12 24), the nav — **Projects · Sites · Assets**, each 13px with a 16px icon, padding 8/12, radius
  `sm`, gap 10; the active item 600 ink on `surface` with `shadow-sm`, the others 500 ink-soft — and at
  the bottom the **account chip**: 30px round avatar (the initial, 12px/600), name 13px/600, email
  11px ink-soft (max-width 100px, ellipsis) — the name is `profiles.display_name`, and while nothing sets it (E2) the email stands in the name slot with no second line — and at `margin-left:auto` the plan badge — the kit's
  `ProBadge` or `FreeBadge`. **AMENDED BY THE OWNER, 2026-09-06 — his finding 2, and the second
  renegotiation the freeze asks for: the chip carries NO plan badge and does not clip.** The badge was
  taking the width the address needed, and the address is what the name slot holds until E2 sets a
  display name. It becomes the drawer's own row at the sidebar's size — 30px avatar, one line at
  13px/600, the whole address wrapped rather than cut — which is what he asked for in as many words:
  *"remove the Free/Pro plan and show full email. Just like we have in mobile."* The badge is not lost:
  it rides the **Billing & plan** row inside the menu the chip opens, in both variants, exactly as his
  ruling of 2026-09-05 put it on the phone's. S3d draws the chip with the badge and the ellipsis; the
  export is untouched (R-74) and this is the record. A **64px top bar** (`border-b line`, padding 0 24, gap 12): the search
  field first — 320×36, `rounded-sm`, hairline `line`, padding 0 10, the frame's magnifier at 15px,
  placeholder "Search projects…" 13px ink-soft-aa, and a mono "⌘K" chip (11px, `line` border, radius
  5px, padding 1/5); then at `margin-left:auto` the kit's `Button` coral 36 "New project" with the
  frame's 14px plus icon. The body is padding 24, gap 20, no heading and no count; the grid is
  `gap-5`, three columns at 1440.
- **The card**: `surface`, `border line`, `rounded` (12), `shadow-sm`, overflow hidden; hover `shadow-md`
  and `-translate-y-px`. On top the **placeholder**, `aspect-ratio 16/10`, `border-b line`, padding
  18/24, the frame's card-2 wireframe (the unlinked, never-deployed card — a 1.5 project's exact
  state): a 40%×14 bar radius 3, a 55%×7 bar radius 2, then three equal 44px blocks radius 5 with the
  middle one at 85% — **coloured from the project's Style Pack**: block background = the pack's
  surface, the headline bar = the pack's text colour, the middle block = the pack's accent, the two
  outer blocks and the sub-bar = `line` and `line-strong` (FR-B1: derived from the pack's accent and
  surface; never a captured thumbnail). Below: padding 14/16, gap 8; row 1 the name 14px/600 and the
  **⋯** trigger (ink-soft, tracking 2px, 600; hover and open state ink); row 2 the **"Sample content"**
  badge (11px ink-soft, `line` border, `rounded-pill`, padding 2/9) and, at `margin-left:auto`, the
  updated-at line — **"Updated today"** or **"Updated Aug 19"**, 11.5px ink-soft, D4d's format, in the
  slot the deploy chip takes on the frame.
- **The ⋯ menu** (S3c): 160px, `surface`, `border line`, `rounded`, `shadow-lg`, padding 6, opening
  down under the trigger; items **Rename · Duplicate · — · Delete**, each 13px/500, padding 8/12,
  radius `sm`, gap 9, a 15px icon (the frame's pencil, copy and trash paths); hover `paper`; Delete in
  `danger-text` with its trash in `danger`, hover `danger-tint`; the separator a `line` hairline with
  margin 4/8. Escape and a click outside close it; focus returns to the trigger.
- **S3b empty state**: the body centres, gap 24, the frame's 160×120 SVG verbatim (the dashed page,
  the `line` bar, the coral bar, the marigold sparkle, the dot and the swoosh), then **"Every great site
  starts somewhere."** display 28px/700 tracking −0.01em and **"Yours starts with hundreds of gorgeous
  sections."** 15px ink-soft, then the kit's `Button` coral 44 "New project" with the plus. The top
  bar keeps its own "New project" — the frame draws both (UX-DR6: never a blank page).
- **S3c at the cap**: the grid's next cell after the cards is the **upgrade tile** — `border-[1.5px]
  dashed line-strong`, `rounded`, min-height 280, centred, gap 10; ✦ 20px marigold-text; **"Upgrade to
  add more"** 14px/600 ink; **"Free includes 1 project. Pro gives you 25."** 13px ink-soft centred,
  max-width 200, leading 1.5; a **"Go Pro — $15/mo"** pill (13px/600, marigold-tint on marigold-text,
  padding 6/14, `rounded-pill`); hover `border-marigold`. The whole tile links to `/billing`. Every
  figure in it is read from the plan table, never typed.
- **S3d account menu**: opens **up** from the sidebar chip — 240px, `surface`, `border line`, `rounded`,
  `shadow-lg`, padding 6; a header (32px avatar, name 13px/600, email 11px ink-soft, `border-b line`,
  padding 10/12, margin-bottom 4); items 13px/500, padding 9/12, radius `sm`, gap 10, 15px icons, hover
  `paper`: **Account settings · Billing & plan (with the plan badge at `margin-left:auto`) ·
  Suggestions · Docs · — · Sign out**. At 390 it drops **down** from the 32px avatar in the top bar —
  280px, header 36px avatar, name 15px, email 12px, the badge in the header, items 15px, padding 13/12,
  16px icons. Sign out posts 1.4's `signOut()`.
- **S3 at 390**: a 60px top bar (padding 0 12 0 6, `border-b line`) — a 44px ☰ button, the wordmark
  at 19px/800, then at `margin-left:auto` a 44px search button and the 32px avatar; the body padding
  16/20, gap 16, with **"+ New project"** first — full width, 48px, 15px/600, coral-text, radius 12 —
  then the cards in one column, gap 14, the placeholder a fixed 150px, the name 15px. ☰ opens the
  **drawer**: 300px, left, full height, `surface`, `shadow-lg`, padding 20/14/16, the wordmark 20px
  and a 44px close ✕ in its header, the nav at 15px (padding 12/14, 18px icons; the active item on
  `paper`), and at the bottom the account row above a `line` hairline (32px avatar, name 14px/600,
  email 11px, the badge); a `scrim` behind it. The dashboard is fully usable at 390 (UX-DR16): no
  horizontal scroll, every action reachable.
- **D4a, the New project sheet** — a centred `<dialog>`: 560px (full width less 20px at 390), `surface`,
  `rounded-lg`, `shadow-modal` (the export's 0 12px 40px at .25), padding 26, gap 20, the `scrim`
  behind; "New project" display 22px/700 tracking −0.01em and the kit's `IconButton` ✕ on the right.
  Four **doors** in a column, gap 10, each padding 12/13, `rounded-thumb`, gap 11, a 16px radio circle,
  title 13px/600, description 12px ink-soft (the kit's radio-card tokens: selected `border-coral
  bg-coral-tint` with the coral dot, rest `border-line hover:border-line-strong`): **Blank canvas —
  "An empty page and every design."** is the one live door and is selected; **Start from a starter —
  "Ten full sites, ready to wear your brand."**, **Duplicate an existing project — "A copy to try
  things on, with nothing at stake."** and **Redesign one of my sites — "We look at your posts and
  suggest whole-site designs."** are drawn greyed in the frame's treatment with the kit's P0-0 tokens
  (`grey-field`, `grey-border`, title and description `ink-faint`, `cursor-not-allowed`) and each
  carries its reason on a third line, 11.5px marigold-text with the frame's alert-circle at 12px:
  "Starters aren't here yet." · "Duplicate a project from its ⋯ menu." · "Connect a Ghost site first."
  (the frame's own sentence). The frame's own caption is the rule: *all four doors stay drawn and each
  carries its reason.* **AMENDED BY THE OWNER, 2026-09-06 — ruling R-93, and this is the renegotiation the
  freeze above asks for: the Duplicate door is removed outright, not greyed.** Duplicating is an action on
  a project already in front of the user and lives on its ⋯ menu (FR-B3), which is where this story built
  it; three doors remain — Blank canvas live and selected, Start from a starter and Redesign one of my
  sites greyed with their reasons. D4a's caption still governs the doors that *are* drawn. The export is
  untouched (R-74) and FR-B2 is amended to match. Below a `line` rule (padding-top 18): **"Style Pack"** 12px/500 ink-soft with
  **"Change it any time, in any project."** 11px ink-soft at the right, and a three-column grid (gap 6)
  holding one cell — the kit's `PackCell` for **Paper**, active (the coral ring), "Ag" in Georgia,
  its three dots — with no pencil and no New pack cell (the pack editor is E6's). Footer: the kit's
  `Button` ghost 36 "Cancel" and `Button` coral 44 "Create project" (the frame's 14px/600 label).
- **D4b, at the cap**: the same sheet with **every door greyed** (gap 9 — the three R-93 leaves), each carrying a pill at
  the right instead of a reason — **"Free includes 1 project"** 11.5px marigold-text on marigold-tint,
  `rounded-pill`, padding 3/10; no Style Pack row; between the doors and the footer the **upgrade
  block** — `border marigold-line`, `surface`, `rounded`, padding 14/16, gap 13: **"Free includes 1
  project. Pro gives you 25."** 13.5px/600 and **"Your project stays exactly as it is either way."**
  12px ink-soft-aa leading 1.5, with S3c's "Go Pro — $15/mo" pill at the right linking to `/billing`;
  **AMENDED BY THE OWNER, 2026-09-06 — his finding 3: the card is D4b's own, not S3c's quieter
  reading of it.** The fill is the frame's warm tint (`marigold-tint-soft`) inside the same
  `marigold-line` hairline, and the call to action is the frame's **solid gold button** — 38px, radius
  12, padding 0/18, 13.5px/600, white on `marigold-solid` — rather than a marigold-tint pill. It was
  built as the pill so that one call to action had one look, and he read the result as the card not
  being prominent enough. **S3c's tile in the grid keeps its pill**, because that is what S3 draws
  there; the two are different frames and now read as the frames draw them. `marigold-solid` is the
  frame's own hover gold and not its resting one — the resting gold under white type is 3.61:1 and
  fails AA at this size, so the shade steps down one (4.74:1) and the hover goes one further to
  `marigold-text` (5.54:1). **Ruled by the owner on 2026-09-06 — question 4, option 1: it stays as built.**
  "Create project" drawn as the frame draws it disabled — `paper-sunk`, `ink-faint`, `aria-disabled`,
  the reasons being the pills. On Pro at 25 the pills and the block read "Pro includes 25 projects"
  and there is no Go Pro. Every figure from the plan table.
- **Rename and delete have no frame and are extrapolated from S12c**, the nearest typed confirm: a
  460px `<dialog>` (`surface`, `rounded-lg`, `shadow-modal`, padding 26, gap 18), a title in display
  20px/700 tracking −0.01em, body 13px ink-soft leading 1.5, and a right-aligned footer of the kit's
  `Button` secondary 36 "Cancel" plus the primary. **Rename**: "Rename project", the kit's `TextInput`
  "Name" prefilled, `Button` primary 36 "Save". **Delete**: S12c's 38px `danger-tint` circle with the
  trash, **"Delete {name}?"**, "This project will be permanently deleted. This cannot be undone." (no
  wit — serious voice; the live-theme warning is E7's), then "Type" · the name in S12c's mono chip
  (12px, `paper`, `line` border, radius 5, padding 1/6) · "to confirm" as the label of a 40px mono
  field (13px, `border-danger`, `caret-danger`, the one ring), and `Button` danger 36 "Delete project",
  `aria-disabled` at 45% opacity until the typed text (trimmed) equals the name exactly. **Every confirm opens
  with focus on Cancel** (EXPERIENCE.md § Destructive confirms). Escape cancels; the server action
  re-checks the typed name and never trusts the client.
- **Data.** Cards come from `projects` ordered `updated_at desc` through the user's own session (the
  spine's Mutation row: the client's session writes only AD-6 owner-policy tables, and `projects` is
  one); every write is a server action with the user-scoped client, so RLS is exercised by every
  mutation rather than bypassed. A blank project is `{ user_id, name, slug, style_pack }` with
  `name` "Untitled project" (then "Untitled project 2", "3", … counting the user's existing names),
  `slug` = slugified name, `style_pack` = `{ preset: 'paper' }`. Duplicate copies every column
  `authenticated` may insert (name, style_pack, dark_enabled, language, posts_per_page,
  credit_enabled, linked_site_id, rtl_ack_at) under the name "Copy of {name}" and a fresh slug.
  Rename changes `name` only — `slug` is never rewritten (FR-J10: a rename after first deploy
  changes the display name only, and the trigger freezes it once bound). A name is trimmed, 1–80
  characters, one zod schema shared by the client field and the action. Delete is one `delete` by id.
- **The cap.** `resolveEntitlement(userId)` in `apps/web/lib/entitlement.ts` reads the user's
  `entitlements` row (RLS-scoped select) and returns `{ plan, caps, reasons: [] }`; `free` or no row →
  Free, `pro_active` and `pro_past_due` → Pro (Appendix F.1's third column: during grace every Pro
  capability is kept). Appendix F.1's numeric rows live once, as data, in `apps/web/lib/plan.ts`
  (Free 1 project, Pro 25; the sites, storage, per-upload and history rows beside them for the epics
  that read them; the $15/mo price). Create and duplicate count the user's projects and refuse at or
  over the cap with `{ code: 'at_cap' }`; the page decides D4a or D4b from the same count and passes
  it to the sheet, and an `at_cap` result that arrives anyway (a race) flips the open sheet to D4b.
- **FR-B5**: `linked_site_id` is one nullable column and stays null here; every 1.5 project is unlinked
  and therefore wears "Sample content" — the badge is FR-B5's visible half, and nothing in this story
  links a site (E3).
- **Search** filters the cards by name, case-insensitive substring, as a GET form (`?q=`) the page reads
  — no client state crosses the layout/page boundary; ⌘K (and Ctrl+K) focuses the field. At 390 the
  44px search button reveals the same field full-width under the top bar and focuses it.
- **Loading is skeleton cards** (`loading.tsx`): three card-shaped blocks in `paper-sunk` — never a
  spinner (UX state patterns, Dashboard row).
- **Every control carries the one ring** (`ring` from `greyed.ts`), every icon is the frame's own path
  added to `icons.tsx` (R-92), and every surface passes axe-core at WCAG 2.1 AA at 1440, 834 and 390.
  Dialogs are native `<dialog>` via `showModal()` (focus trap, Escape, `::backdrop` in `scrim`);
  menus are `popover="auto"` (light-dismiss and Escape are the platform's). Nothing inline-scripted:
  1.4's nonce CSP stays at zero violations.
- **The shell lives in `(authed)/layout.tsx`** so every later authenticated surface — Sites, Assets,
  Billing — is inside it by where its file sits; `/kit` inherits it too.
- **Destinations that later epics build are real links to their addresses and 404 until then** —
  Sites `/sites` (E3), Assets `/assets` (E8), Account settings `/account` (E2), Billing & plan and Go
  Pro `/billing` (E12), Suggestions `/suggestions` (E13), Docs `https://inflozo.com/docs` (E14) — the
  same way 1.4's Terms · Privacy links were accepted. **Keyboard shortcuts is absent** from the menu:
  there is no editor and so nothing to list (UX-DR3: could never act here → absent); Story 5.9 adds it.
  The frame's "Connect a site" button on the Redesign door is absent for the same reason (E3).
- **R-81 / R-82 / R-83 / R-80** as the epic context binds them: commit and push after this and every
  phase; review and test on the real Supabase and the production domains, keys read from
  `tools/probe/.env` by variable name and never printed; the owner tests on `app.inflozo.com`.

**Ask First:**
- Any new table, column or migration — none is expected; `projects` and `entitlements` carry
  everything this story reads and writes.
- Any dependency beyond the pinned set — none is expected; dialogs, popovers and forms are the
  platform's.
- Any token whose value greps nowhere in the export — the `avatar` colours and the door hexes are
  deliberately *not* new tokens (Design Notes); `shadow-modal` is added, and on 2026-09-06 the owner's
  finding 3 added `marigold-tint-soft` and `marigold-solid` with it, both values the export's own.
- Moving the delete confirm or the rename away from the S12c extrapolation above.

**Never:**
- Linked-site badges, deploy-status chips, the starter / duplicate-door / redesign creation paths,
  the connected-sites strip, the storage meter in the sidebar, the What's-new sparkle and popover,
  the notifications bell (the epic's cut line: E3, E7, E13) — absent, not greyed, not stubbed.
- A `<select>` of projects on the Duplicate door, a name field in the create sheet, a Tangerine cell or
  a New pack cell — none is drawn live for this story.
- Opening a project: the card is not a link (the editor and its URL scheme are Story 5.1's).
- A service-role client in the app, a browser Supabase client, or anything in `NEXT_PUBLIC_*`.
- A captured or rendered thumbnail (FR-B1), a spinner, a tooltip carrying a reason, a `disabled`
  attribute on a kit `Button`, coral for anything but the surface's one action, marigold for anything
  but Pro and the upgrade tile.
- Writing a count down: "Free includes 1 project", "Pro gives you 25", "$15/mo" and the 80-character
  limit are read from `plan.ts` and the name schema wherever they appear.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Land, no projects | signed in, zero rows | S3b: the shell, the illustration, the two sentences, "New project"; the account chip says Free — **AMENDED BY THE OWNER, 2026-09-06 (finding 2): the chip carries no badge; "Free" is on the menu's Billing & plan row** | N/A |
| Land, projects | rows exist | S3a: cards ordered by `updated_at desc`, each with placeholder · name · Sample content · "Updated today" / "Updated Aug 19" | N/A |
| Create, under cap | "New project" → D4a → Create project | insert; sheet closes; the new card "Untitled project" (or "… 2") is first; `updated_at` = now | insert fails → the kit's error Banner in the sheet, "We couldn't create that just now. Try again in a moment." |
| Create, at cap (Free, 1) | "New project" with 1 project | the sheet opens as D4b: greyed doors with "Free includes 1 project" pills, the upgrade block, Create disabled; the grid already shows S3c's tile | `at_cap` from the action (race) → the open sheet flips to D4b |
| Create, at cap (Pro, 25) | 25 projects | D4b with "Pro includes 25 projects", no Go Pro; no tile in the grid | as above |
| Rename | ⋯ → Rename → "Field Notes" → Save | `name` updated, `slug` untouched, `updated_at` bumped by the trigger; the card re-sorts to first | blank or > 80 chars → the field's helper-caption sentence "Give it a name — up to 80 characters."; `aria-invalid`; nothing sent |
| Duplicate, under cap | ⋯ → Duplicate | a new row "Copy of Field Notes", same pack and settings, fresh slug; first in the grid | insert fails → the kit's error Banner above the grid: "We couldn't duplicate that just now." |
| Duplicate, at cap | Free with 1 | refused: the sheet opens as D4b (the same contextual prompt as create) | `{ code: 'at_cap' }` |
| Delete, wrong name | ⋯ → Delete → "field notes" | Delete stays `aria-disabled` at 45%; nothing sent | N/A |
| Delete, right name | typed exactly "Field Notes" → Delete project | row gone; card gone; zero rows → S3b | the action compares server-side; mismatch → `{ code: 'name_mismatch' }`, the dialog stays with "That's not this project's name." |
| Search | `?q=fie` | only cards whose name contains "fie" (case-insensitive); no matches → "No projects match “fie”." 13px ink-soft in the grid's place, the empty illustration not shown | N/A |
| Another user's project | user B, project of A | invisible to B's list; B's rename/delete/duplicate by A's id → zero rows affected, `{ code: 'failed' }` — RLS, executed in Verification | N/A |
| Plan badge | `entitlements.state` free · pro_active · pro_past_due · no row | Free · ✦ Pro · ✦ Pro · Free | N/A |
| 390 | phone width | ☰ · wordmark · search · avatar; full-width "+ New project"; one column; drawer and dropdown as S3; no horizontal scroll | N/A |
| Keyboard | Tab through the shell and a card | sidebar → search → New project → cards' ⋯ → chip; ⋯ opens with Enter, arrows move, Escape closes and returns focus; every confirm opens on Cancel | N/A |
| Signed out | any of these URLs | 307 to `/sign-in` (1.4's guard, unchanged) | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/layout.tsx` -- today the guard alone (`currentUser()` → `redirect('/sign-in')`); gains the shell: reads the user and `resolveEntitlement`, renders `<Shell user plan>` around `children`. The comment there ("everything under /app is behind the guard by where its file sits") becomes true of the shell as well
- `apps/web/app/(app)/app/(authed)/page.tsx` -- 1.4's holding page, **replaced whole** (its own comment says so): reads `searchParams.q`, the projects (`select … order updated_at desc`), the entitlement's cap and the count; renders the grid of `ProjectCard`s, S3b's empty state, S3c's tile at the cap, or the no-match line; passes `atCap` to the sheet. `metadata.title` "Projects · Inflozo", noindex as `sign-in/page.tsx:27`
- `apps/web/app/(app)/app/(authed)/loading.tsx` (new) -- three skeleton cards in the card's own shape; `components/kit/loading.tsx:4` is the list-shaped `Skeleton` and is the wrong shape here
- `apps/web/app/(app)/app/(authed)/projects/actions.ts` (new, `'use server'`) -- `createProject()`, `renameProject(id, name)`, `duplicateProject(id)`, `deleteProject(id, typed)`; each `supabaseServer()` → the user-scoped write → `revalidatePath` on the dashboard's **internal** path (`/app` — execute it, the rewrite in `routing.ts:25` is why it is not `/`); the result union `{ ok: true } | { error: { code: 'at_cap' | 'bad_name' | 'name_mismatch' | 'failed'; message } }`; `console.error` without the name (logs carry no user content). Only async exports, as `sign-in/actions.ts:12` explains; the pure parts live next door
- `apps/web/lib/plan.ts` (new, pure) -- Appendix F.1 as data: `PLANS = { free: {…}, pro: {…} }` with `projects`, `sites`, `storageMb`, `uploadMb`, `history` and `PRICE = { monthly: 15, yearly: 150 }`; `planFor(state?: EntitlementState)`; `cap` sentence helpers so "Free includes 1 project" is composed, never typed. `apps/web/plan.test.ts`: free/absent → free, `pro_past_due` → pro, the sentence pluralises
- `apps/web/lib/entitlement.ts` (new, server) -- `resolveEntitlement(userId)`: one select on `entitlements` (own row) → `{ plan, caps: PLANS[plan], reasons: [] }`. The spine's single resolver (AD-28 / the `resolveEntitlement` rule); `subscriptions` and `reasons` are E12's to add here. Split from `plan.ts` exactly as `server.ts` is split from `cookies.ts` (`next/headers` is unreachable under `node --test`)
- `apps/web/lib/style-pack.ts` (new, pure) -- the one zod schema for `projects.style_pack` (`{ preset: string }` today — the spine's rule (a): E6 owns the column and E1's placeholder reads it *through the same schema three epics early*), `PRESETS` with Paper's three values read off D4a's cell dots — surface `#FBF9F5`, accent `#D96C3F`, text `#232019` — and `placeholderFor(stylePack)` → `{ surface, accent, text }` falling back to Paper for a preset it does not know, so a card never renders empty when E6 widens the shape. Paper's accent is pack data, not a chrome token (`pack-cell.tsx:6`); DW-11 says E6 re-sources every pack from Appendix D, and this file is where that lands
- `apps/web/lib/projects.ts` (new, pure) -- `nameSchema` (zod, trim, 1–80), `nextUntitled(names)`, `copyName(name)` (clamped to the schema's maximum), `slugify(name)`, `updatedLabel(updatedAt, now)` ("Updated today" / "Updated Aug 19", and "Updated Aug 19, 2025" for another year, `Intl.DateTimeFormat('en', …)`, UTC — `// ponytail: server UTC; the viewer's zone if "today" ever reads wrong at midnight`), `matchesName(typed, name)` (the typed value trimmed, then exact). `apps/web/projects.test.ts` holds each, including the 80-char edge, "Untitled project 2", the same-day and other-day labels, and that `slugify('Copy of Field Notes')` is `copy-of-field-notes`
- `apps/web/components/shell/shell.tsx` (new, server) -- the sidebar and top bar at 1440 and the 60px bar at 390 (`tablet:` is the seam — S3 draws 1440 and 390 and the sidebar holds from `tablet` up); the nav via `next/link` with the active item from `usePathname` in a tiny client `NavLink`; the search form — its field a small client `SearchField` reading `useSearchParams` for its value (a layout receives no query) and owning ⌘K; the "New project" button that opens the sheet
- `apps/web/components/shell/account-menu.tsx` (new, client) -- the chip/avatar trigger and the S3d popover (`popover="auto"`, positioned from the trigger's rect on open — up at 1440, down at 390); items as `next/link`s; Sign out as a form posting `signOut` from `sign-in/actions.ts:57`
- `apps/web/components/shell/drawer.tsx` (new, client) -- the ☰ `<dialog>` at 390: nav, account row, close
- `apps/web/app/(app)/app/(authed)/project-card.tsx` (new, server) + `placeholder.tsx` (new) -- the card and its wireframe with the pack's three colours as inline `style` (they are pack data, the site's system, never Tailwind classes)
- `apps/web/app/(app)/app/(authed)/project-menu.tsx` (new, client) -- the ⋯ `popover="auto"` menu and the two S12c-shaped `<dialog>`s (rename, delete) with `useActionState` over the actions; the delete button's `aria-disabled` follows `matchesName`
- `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx` (new, client) -- D4a / D4b in one `<dialog>`, chosen by `atCap`; `useActionState(createProject)`; an `at_cap` result flips it
- `apps/web/components/kit/icons.tsx` -- add the frames' own paths: `Projects` (four rects), `Globe`, `Image`, `Plus`, `MenuLines`, `Copy`, `Person`, `Card`, `Lightbulb`, `Book`, `Logout`, `AlertCircle`; `Search`, `X`, `Pencil`, `Trash`, `ChevronDown` already exist (`icons.tsx`)
- `apps/web/components/kit/pack-cell.tsx:11` -- `PackCell` gains an optional `onEdit`; without it the pencil is not rendered (a dead "Edit Paper" button would be a lie; the editor is E6's). `/kit` keeps passing one so the gallery is unchanged
- `apps/web/app/globals.css:80` + `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` front matter -- `--shadow-modal: 0 12px 40px rgba(28,27,26,.25)` and its `elevation.modal` twin (`tokens.test.ts:47` requires the value to occur in the export; D4a and S12c carry it). Nothing else is added — see Design Notes for every hex that was mapped to an existing name instead. **Two colours joined it on 2026-09-06** (the owner's finding 3): `--color-marigold-tint-soft` and `--color-marigold-solid`, each with its `colors.*` twin in DESIGN.md, both values the export's own and both asserted by the same two token tests
- `apps/web/app-routes.test.ts:33` -- already discovers every `page.tsx`; the new page is inside `(authed)` and needs no entry. `loading.tsx` is not a page
- `apps/web/routing.ts:22-31` -- read-only: `app.inflozo.com/x` is rewritten to `/app/x`, so links are written as `/sites`, `/billing`… and `revalidatePath` takes `/app`
- `supabase/migrations/20260904120000_complete_schema.sql` -- read-only, the grants this story lives inside: insert `(id, user_id, name, slug, style_pack, dark_enabled, language, posts_per_page, credit_enabled, linked_site_id, rtl_ack_at)`, update `(name, style_pack, dark_enabled, language, posts_per_page, credit_enabled, linked_site_id, rtl_ack_at, updated_at)`, `projects_touch` bumps `updated_at`, `projects_slug_frozen` holds only once a binding exists, `entitlements` is select-only to `authenticated`, the `(user_id, updated_at desc)` index is the list's order
- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/S3 Dashboard.dc.html` · `D4 Dashboard Sheets and Blocks.dc.html` · `S12 Billing.dc.html` (S12c) -- the frames; read the inline styles, never the CSS variables. `EXPERIENCE.md:118-124, 309, 482` and `prd.md:189-193, 1150-1152` (Appendix F.1) -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/plan.ts` + `apps/web/plan.test.ts` -- Appendix F.1 as data and `planFor` -- one table, expressed once, with its check
- [x] `apps/web/lib/style-pack.ts` -- the column's schema, Paper, `placeholderFor` -- E6's boundary, declared once and read early
- [x] `apps/web/lib/projects.ts` + `apps/web/projects.test.ts` -- the name rules, the labels, the slug -- every branch under `node --test`
- [x] `apps/web/lib/entitlement.ts` -- `resolveEntitlement` -- the spine's single resolver
- [x] `apps/web/app/globals.css` + `DESIGN.md` -- `shadow-modal` -- the frame's value, named once
- [x] `apps/web/components/kit/icons.tsx` + `pack-cell.tsx` -- the frames' icons; the optional pencil -- R-92, and no dead control
- [x] `apps/web/components/shell/` shell, account-menu, drawer -- S3's shell at 1440 and 390 -- the surface every later story sits in
- [x] `apps/web/app/(app)/app/(authed)/layout.tsx` -- the shell around the guard -- by file position
- [x] `apps/web/app/(app)/app/(authed)/projects/actions.ts` -- the four actions with the cap -- FR-B3, FR-B4, through RLS
- [x] `apps/web/app/(app)/app/(authed)/` page, loading, project-card, placeholder, project-menu, new-project-sheet -- S3a/b/c, D4a/b, the S12c extrapolations -- the story's surface
- [x] Verification -- every matrix row on the deployed site with fixture users, recorded below -- R-82
- [x] **Fix run (2026-09-05)** -- the owner's eight findings: the centred delete confirm, the drawer's outside-tap and focus, the phone's account menu moved into ☰ per his ruling, the phone's search focus, and `app/(app)/app/error.tsx` -- his test of the deployed site, R-80
- [x] **Second Fix run (2026-09-06)** -- the owner's three findings: the Duplicate door removed from the New project sheet (R-93), the sidebar chip made the drawer's row — no plan badge, the whole address — and D4b's upgrade card brought back to the frame's warm tint and solid gold button -- his second test of the deployed site, R-80

**Acceptance Criteria:**
- Given `https://app.inflozo.com/` at 1440 with no projects, when it renders, then it **matches frame S3b** — the sidebar with Projects active, Sites and Assets, the account chip with the Free badge; the top bar with "Search projects…", ⌘K and "New project"; the illustration, both sentences and the centred "New project" — with the storage meter, bell and sparkle absent (R-74; the cut line).
- Given projects, when the dashboard renders, then it **matches frame S3a**'s shell and card — placeholder, name, "Sample content", "Updated …", ⋯ — with no favicon, no domain and no deploy chip, ordered most-recently-updated first (FR-B1's static placeholder, FR-B5's badge).
- Given the ⋯ trigger, when it opens, then the menu **matches S3c** — Rename, Duplicate, a rule, Delete in danger — and Rename and Delete open their S12c-shaped confirms with focus on Cancel; Delete stays disabled until the exact name is typed (FR-B3; EXPERIENCE.md § Destructive confirms).
- Given a Free account with one project, when "New project" or ⋯ → Duplicate is used, then the sheet opens as **D4b** with "Free includes 1 project. Pro gives you 25." and Go Pro, Create disabled, and the grid shows **S3c's** upgrade tile; given a Pro account, the 26th is refused the same way without Go Pro (FR-B4, Appendix F.1).
- Given "New project" under the cap, when the sheet opens, then it **matches D4a** with Blank canvas live and selected, the three other doors greyed with their reasons, Paper as the one Style Pack cell, and Create project inserts a row the card then shows.
- Given the account chip, when it opens, then the popover **matches S3d** (desktop up, mobile down) with Keyboard shortcuts absent, and Sign out ends the session as in 1.4.
- Given 390 wide, when the dashboard, the drawer, the dropdown, the sheet and both confirms render, then they **match S3 · mobile and S3 · mobile — menu open** and nothing scrolls sideways (UX-DR16).
- Given two fixture users, when each exercises every action against the other's project id through the deployed site and the REST API, then nothing is visible or changed — RLS held, and `bash supabase/tests/run-rls-gate.sh` is green on every table the schema story created (the epic's exit).
- Given every surface in every state at 1440, 834 and 390, when axe-core runs, then zero violations; Tab reaches every control with the one ring; the console shows zero CSP violations (NFR-5, NFR-3).
- Given a push to `main`, when CI runs, then `check` and `rls` are green and `deploy` publishes the dashboard.

### Review Findings — second review, 2026-09-05, after the Fix run

Five layers over the whole diff since the baseline, the Real-infra verifier on the live deployment of the
Fix commit (`93e100ee`). No finding is the owner's to decide; none is deferred; twelve were dismissed as
noise or as behaviour the frozen Boundaries themselves ask for.

- [x] [Review][Patch] Duplicate refused by the cap in a race opens D4a, not D4b — the `at_cap` returns never revalidate, so the page's `atCap` is stale [apps/web/app/(app)/app/(authed)/projects/actions.ts:79]
- [x] [Review][Patch] The slug collides after a rename ("Untitled project" renamed keeps `untitled-project`; the next create takes it again) and for names that differ only by punctuation — derive it from the taken slugs, never the names [apps/web/app/(app)/app/(authed)/projects/actions.ts:85]
- [x] [Review][Patch] `copyName`'s clamp can end in a space (never matches the trimmed taken set, so the second duplicate reuses the name) and its taken branch is asserted by no test [apps/web/lib/projects.ts:43]
- [x] [Review][Patch] A dialog closed after a failed action reopens with the stale Banner or sentence — the sheet, rename and delete [apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:124]
- [x] [Review][Patch] A menu anchored `down` near the bottom of the viewport (a card's ⋯ in the last row at 390) is clipped and cannot be scrolled to; `up` on a short viewport goes negative; a scroll leaves the fixed menu floating [apps/web/lib/menu.ts:31]
- [x] [Review][Patch] An expired session inside an action answers "Try again in a moment", which cannot succeed — it should send the user to sign in [apps/web/app/(app)/app/(authed)/projects/actions.ts:64]
- [x] [Review][Patch] The search is a plain GET form, a full document navigation: on the phone Enter resets the field's open state and the box the user just typed into vanishes [apps/web/components/shell/shell.tsx:90]
- [x] [Review][Patch] ⌘K compares `event.key !== 'k'`, so Shift or Caps Lock kills it, and it fires under an open modal [apps/web/components/shell/shell.tsx:191]
- [x] [Review][Patch] The drawer open across the 834 seam (a tablet rotated) is hidden by `tablet:hidden` while still modal — the page is inert and nothing is on screen [apps/web/components/shell/shell.tsx:320]
- [x] [Review][Patch] `openNewProject` calls `showModal()` on a sheet that may already be open [apps/web/components/shell/shell.tsx:53]
- [x] [Review][Patch] `TextInput` given both `error` and `greyed` loses the error's `aria-describedby` to `greyedProps`'s spread [apps/web/components/kit/input.tsx:117]
- [x] [Review][Patch] The ⋯ trigger has no open-state ink; S3c draws it in ink while its menu is open [apps/web/app/(app)/app/(authed)/project-menu.tsx:136]
- [x] [Review][Patch] The drawer's account trigger overrides its visible name with `aria-label="Account"` (WCAG 2.5.3 Label in Name) [apps/web/components/shell/account-menu.tsx:158]
- [x] [Review][Patch] The capped "Create project" is `aria-disabled` with no `aria-describedby` to the cap sentence — a screen reader hears "dimmed" and no reason [apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:208]
- [x] [Review][Patch] The doors' `<ul>` is `list-none` without `role="list"`, so VoiceOver drops the list semantics [apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:146]
- [x] [Review][Patch] S3a has no `<h1>` — every card name is an `<h2>` under nothing [apps/web/app/(app)/app/(authed)/page.tsx:287]
- [x] [Review][Patch] The layout swallows a `profiles` read error with no log, unlike `resolveEntitlement` [apps/web/app/(app)/app/(authed)/layout.tsx:28]
- [x] [Review][Patch] The `?q` normalisation (a repeated key arrives as an array) and the filter live in the page where no test reaches them [apps/web/app/(app)/app/(authed)/page.tsx:236]
- [x] [Review][Patch] `internal()` re-implements `routing.ts`'s prefix strip in a client file `node --test` cannot import [apps/web/components/shell/shell.tsx:45]
- [x] [Review][Patch] A `story-board.py` self-check failure surfaces in the gate as "STALE — run story-board.py", which would not fix it [tools/doc-audit.py:720]
- [x] [Review][Patch] `demo()` pins neither `**Ruled** — option 1` (bold, dash) nor `Ruled — option 1` (plain, dash), the boundary the docstring describes [tools/story-board.py:1901]
- [x] [Review][Patch] Two departures from the frozen Data boundary — `linked_site_id` not copied, the duplicate's name suffixed — are in Verification's table but not in the Spec Change Log [this spec]
- [x] [Review][Patch] DW-17 does not mention the two `Failed to load resource` console lines every dashboard load logs from prefetching `/sites` and `/assets`; DW-18 writes "eight" where the live count is already ten [_bmad-output/implementation-artifacts/deferred-work.md]

### Review Findings — third review, 2026-09-06, after the second Fix run

Five layers over the whole diff since the baseline, the Real-infra verifier on the live deployment of
HEAD (`c7cab9eb`, code last changed in `95023994`): every Verification claim re-executed and held on the
real Supabase, Vercel, GitHub and both production domains, with a passed negative control. No finding is
the owner's to decide; two are deferred as pre-existing; twelve were dismissed as noise, as behaviour the
frozen Boundaries or the frames ask for, or as already recorded (DW-17's `not-found` half, the frame's own
"Ten full sites", the matrix's own failure sentences, `/` on localhost, the Docs row's external address, an
email-less account, `PLANS`' rows for later epics, Go Pro's 404 today, the Duplicate Banner's persistence,
menu clipping at widths no trigger reaches, a viewport shorter than a menu, and the sheet mounting under a
failed read the action re-checks anyway).

- [x] [Review][Patch] "Create project" submitted again while the first is in flight makes a second project on Pro — the button's label swap closes nothing and React queues form actions; and `pending` alone cannot guard it, being state that turns true on the next render (executed: three `requestSubmit()` in one tick made three rows) [apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:222]
- [x] [Review][Patch] A race's `at_cap` result outlives the room a later delete makes — the sheet stayed D4b with `atCap` already false [apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:142]
- [x] [Review][Patch] The rename field keeps an abandoned or refused edit; reopened, it shows that instead of the project's name — the boundary says "prefilled" [apps/web/app/(app)/app/(authed)/project-menu.tsx:216]
- [x] [Review][Patch] `openMenu` re-anchors, re-arms and focuses into a menu on the ⋯ toggle's closing click, and its `scroll` listener outlives every close but a scroll — one more armed per open [apps/web/lib/menu.ts:55]
- [x] [Review][Patch] ⌘K under an open popover moves focus to the search field and leaves the menu orphaned [apps/web/components/shell/shell.tsx:201]
- [x] [Review][Patch] The sidebar account popover does not close as one of its rows is followed — latent only while every destination 404s outside the shell [apps/web/components/shell/account-menu.tsx:188]
- [x] [Review][Patch] A `ProjectMenu` rendered outside `DuplicateScope` degrades to a GET form posting `?id=…` — refused at render instead [apps/web/app/(app)/app/(authed)/project-menu.tsx:86]
- [x] [Review][Patch] `names()` drops the pre-count's error, so the caller logs `code: undefined` [apps/web/app/(app)/app/(authed)/projects/actions.ts:81]
- [x] [Review][Patch] The failed-read branch has no `<h1>`, and the skeleton is `aria-hidden` with nothing said in its place [apps/web/app/(app)/app/(authed)/page.tsx:69 · loading.tsx:10]
- [x] [Review][Patch] `story-board.py`'s self-check catches only `AssertionError` and `doc-audit.py` keys on a string, so a crash in `demo()` still reads "STALE — run story-board.py" (executed: a `KeyError` now exits 2 with the SELF-CHECK line); and an unbolded `Ruled (owner, date): option 1` label's colon was not seen past the parenthetical [tools/story-board.py:1979 · tools/doc-audit.py:728]
- [x] [Review][Patch] `proxy.ts` re-writes the `/app` segment predicate `routing.ts` already holds — now exported as `isApp` and reused [apps/web/proxy.ts:54]
- [x] [Review][Patch] R-93's propagation ledger still showed `new-project-sheet.tsx` unticked though the change landed in `95023994`; and the Matrix's first row still said the chip carries Free — amended inline, as the Boundaries were [reconcile-designs-decisions.md:1707 · this spec]
- [x] [Review][Defer] The four actions' guards — the cap, the typed name, the zero-row answer — are consulted by no repeatable check: the predicates are under `node --test`, the call path only by each phase's live pass [apps/web/app/(app)/app/(authed)/projects/actions.ts:107] — deferred, pre-existing (DW-20)
- [x] [Review][Defer] `doc-audit.py --check` runs only in the local pre-commit hook; CI never runs it, so a clone without `core.hooksPath` publishes past it [.github/workflows/ci.yml] — deferred, pre-existing (DW-21)

## Spec Change Log

Every entry below is a change to the Code Map's plan, made during Dev and executed rather than reasoned.
The frozen Intent, Boundaries and Matrix are untouched.

1. **`PackCell` takes `editable`, a flag, and not the Code Map's `onEdit` handler.** `/kit` is a Server
   Component and "keeps passing one" is not possible with a function: a function on a host element's prop
   cannot cross the flight boundary, which is React's "Event handlers cannot be passed to Client Component
   props". The flag does exactly what the Code Map asked for — the sheet renders no pencil, the gallery
   keeps its own — and E6 turns it into the handler at the moment there is an editor to open. Reasoned in
   the comment beside the prop.
2. **The four actions take `(previous, formData)`, not positional arguments.** Each is driven by
   `useActionState` from the dialog that owns it, which is the Code Map's own instruction two lines later;
   the ids and the typed name ride in the form, so every one of them also posts with JavaScript off.
3. **Duplicate is ONE action for the whole grid, held by a `DuplicateScope` around it.** The matrix puts
   its failure Banner *above the grid*, and a per-card `useActionState` can only put it inside whichever
   card was clicked. The scope owns the action and the banner; each card's Duplicate is still a real
   `<form>` posting its own id. Nothing else in the story needs context.
4. **`components/kit/input.tsx`'s `TextInput` gained `name` and `error`.** The Code Map asks the rename
   confirm to use the kit's field, and the kit's field had no `name` (so it submitted nothing) and no
   refusal slot. `error` renders the sentence in P0-0's helper-caption slot with `aria-invalid` and
   `aria-describedby`, which is 1.4's precedent on the sign-in field, now in the kit where the next story
   inherits it.
5. **`tokens.test.ts` names `lib/style-pack.ts` as the one file that may carry a colour literal.** The gate
   forbids a hex anywhere under `apps/web`, and Paper's three values are not app tokens — they are the
   user's SITE's system (`pack-cell.tsx`), applied as inline `style` because Tailwind's palette is cleared
   on purpose. The exemption is one named path and the test asserts the file still exists, so it cannot
   spread and cannot rot.
6. **`DESIGN.md`'s `components.modal.shadow` moved to `{elevation.modal}` with the new token.** Adding
   `elevation.modal` and leaving the component row reading `{elevation.lg}` beside it would be two answers
   to one question in the same file; the export draws every modal at .25 (propagate, never localise).
7. **The shell draws the search field and "New project" on the dashboard only.** The shell is in the
   layout, so `/kit` — and Sites and Assets when they arrive — inherit it. A project search and a "New
   project" button on a surface with no sheet to open would be two controls that could never act there,
   which UX-DR3 says are absent, not greyed.
8. **The `⋯` menu and the account menu are `popover="auto"` positioned from the trigger's rect in
   JavaScript**, as the Code Map says for the account menu, and the same for the card menu — CSS anchor
   positioning is not in every browser the app supports, so `lib/menu.ts` writes fixed coordinates from
   the trigger's edges (never its width, which a `display:none` popover does not have yet).

9. **The drawer is inside `shell.tsx`, and `components/shell/drawer.tsx` was never created.** The Code
   Map names it as its own client file and the ticked task line says "shell, account-menu, drawer". It is
   the `<dialog ref={drawer}>` at the end of `shell.tsx` instead, because the drawer renders the same
   `nav()` and the same account row as the sidebar and lifting it out would have meant passing both
   across a module boundary to save nothing. Behaviour is the Code Map's; the file is not. Recorded by
   the review (2026-09-05), which found it against the Code Map rather than against the screen.
10. **`shell.tsx` is one `'use client'` module, not the Code Map's server component with a `NavLink` and
   a `SearchField` inside it.** The shell owns three pieces of browser state — the drawer's `<dialog>`
   ref, the 390 search field's open/closed, and the ⌘K listener — and they sit in the same tree as the
   nav and the top bar, so splitting it would have been three client islands and a server wrapper that
   held nothing of its own. The cost is that the sidebar and top bar ship to the browser; the page
   itself still crosses as a server-rendered `children`. Recorded by the review (2026-09-05); E5, which
   adds the editor's own shell, is where the split is worth making if it ever is.
11. **The rename field carries `maxLength`, the schema's own `NAME_MAX`.** The frozen boundary asks for
   "one zod schema shared by the client field and the action" and the matrix's Rename row ends "nothing
   sent"; the field had neither, so an 81-character name round-tripped to the server to be refused.
   `maxLength` is the native half of that schema and needs no second copy of the number. The BLANK name
   still posts and is refused by the action, deliberately: `required` would raise the browser's own
   validation bubble, and P0-0 puts a refusal in the helper-caption slot and never in a tooltip. Applied
   by the review (2026-09-05).

**The Fix run (2026-09-05), from the owner's test of the deployed site.** His eight findings are under
`## Owner's test findings`; these are the changes they caused. **The frozen Intent, Boundaries and Matrix
are untouched, by rule**, so where a fix moves away from what they say, the entry below is the record —
the same way 1.4 recorded its own two owner-ruled departures.

12. **The phone's account menu moved from the top bar into the ☰ drawer, and the top-bar avatar is gone.**
   The frozen boundary says *"at `margin-left:auto` a 44px search button and the 32px avatar"* and *"At 390
   it drops **down** from the 32px avatar in the top bar"*; both are now false on purpose. **Owner's ruling,
   2026-09-05, question 2 option 1** — he read the top-bar initial and the drawer's account row as one
   control duplicated. They were not (the first opened the menu, the second was a label), which is why it
   was asked rather than guessed; the ruling merges them, so the drawer's row is the trigger and the menu
   opens UP from it. `AccountMenu`'s second variant is renamed `topbar` → `drawer` to say so. Everything in
   the menu — Account settings, Billing & plan, Suggestions, Docs, Sign out — is still reachable on a phone,
   two taps in rather than one, and the 1440 sidebar chip is untouched.
13. **Two riders from the same ruling.** The drawer's account row shows `display_name` if there is one and
   OTHERWISE THE WHOLE EMAIL, with no `truncate` and no `max-w-[100px]` — his words: *"Right now the email
   is clipped and shows three dots."* The 300px drawer has the room the 220px sidebar does not, which is why
   only the sidebar chip still clips (defect 5 above stands). And the plan badge leaves that row — *"we are
   already showing it in the menu that opens along with Billing and Plan row"* — so the badge now rides the
   **Billing & plan row in both menus**; the 390 frame drew it in the menu header, and no menu now carries
   it twice.
14. **The delete confirm is centred: the disc above the title, not beside it.** His words: *"The Delete
   Project Popup needs a better design. With the icon in top center. And overall better visuals."* The
   frozen boundary describes S12c's left-aligned 38px disc; it is now 52px, centred above a centred title
   and sentence, with a `danger-tint` ring at 50% behind it, the typed-name label centred, and the footer
   two equal-width 44px buttons instead of a right-aligned pair at 36 — which is also a full-width tap
   target at 390. The icon is the **trash** the ⋯ menu's Delete already wears rather than a warning
   triangle: one delete, one symbol, and the frozen boundary asked for the trash in the first place.
   Everything load-bearing is unchanged — the typed name, the server-side re-check, focus on Cancel,
   Escape. **Rename is deliberately untouched**: it is not destructive, and a one-field form is
   right-aligned like every other form in the app.
15. **A tap outside the ☰ drawer closes it, and ☰ no longer hands focus to the wordmark.** A modal
   `<dialog>` gives Escape and a focus trap but not light dismiss, so the scrim's click is caught on the
   dialog and answered with a rect test — the panel's own padding is also the dialog element, and a target
   test alone would close it on a tap inside. And `showModal()` focuses the first focusable thing in the
   panel, which was the wordmark, ringed: the dialog takes the focus itself (`tabIndex={-1}`, `outline-none`),
   which a screen reader announces and Tab still walks out of. **The confirms and the New project sheet do
   NOT get light dismiss**: a destructive confirm a stray tap dismisses is what the typed name exists to
   prevent.
16. **The phone's search field is focused by being rendered.** The button set the state and then chased the
   field with `requestAnimationFrame`, which fires before React has committed the element — so the tap
   revealed the field and left the cursor nowhere. `autoFocus` runs on mount, and mount is what the tap
   causes. ⌘K is unchanged and still finds whichever field is visible.
17. **`apps/web/app/(app)/app/error.tsx` is new, and closes half of DW-17.** See Design Notes for why it
   sits at the `/app` segment and not inside `(authed)`, and `## Verification` for what the Fix run could
   and could not prove about findings 3 and 8.

**Three departures from the frozen Data boundary, recorded by the second review (2026-09-05).** Each was
applied by a review as a patch and had reached Verification's tables but not this log, which is where a
departure lives; none needs the owner, because each keeps a rule the PRD already states.

18. **A duplicate does not copy `linked_site_id`.** The boundary lists it among the columns Duplicate
   copies; the action deliberately does not select it. It is null on every 1.5 project, and copying it
   would have made a duplicate inherit E3's binding the moment E3 lands — two projects on one site, which
   FR-B5 forbids. Applied by the first review; the comment beside the select is the reason.
19. **A duplicate's name steps away from names already taken — "Copy of X 2", "3", …** The boundary
   says "Copy of {name}"; duplicating twice wrote two rows with one name and, since the slug is derived
   from the name, one slug, and `projects.slug` has no unique constraint to refuse it. Applied by the
   first review as `copyName(name, taken)`; the second review trims the clamp (a cut on a space left a
   trailing blank that never matched) and asserts the branch.
20. **The slug is unique among the user's slugs, not merely "slugified name".** A rename keeps its slug
   (FR-J10), so "Untitled project" renamed to "Field Notes" still holds `untitled-project` and the next
   blank project took it again — the live database showed exactly that row (`name = "Test"`,
   `slug = "untitled-project"`). `uniqueSlug(base, taken)` appends `-2`, `-3`, … against the slugs the
   user already has, for create and duplicate both. Applied by the second review.

**Five defects the executed pass found and fixed, each with the control that found it.**

1. **Every popover was permanently on screen.** `className="flex …"` on a `popover` element beats the user
   agent's `[popover]:not(:popover-open){display:none}` — so the ⋯ menu rendered inside every card and its
   three items sat in the tab order. Found by a Playwright click at 390 that a 15px icon "from the `<main>`
   subtree" intercepted. `open:flex` (Tailwind 4's `:is([open], :popover-open)`) is the fix, and the
   compiled CSS is grepped for it.
2. **Every modal opened flush against the top-left corner.** A modal `<dialog>` is centred by the UA's
   `inset:0; margin:auto`, and Tailwind's Preflight resets `margin:0` on `*`. `m-auto` restores it;
   `boundingBox()` now reports D4a at x=440 in a 1440 viewport and the delete confirm at x=10 in a 390 one.
3. **No confirm opened on Cancel.** React applies `autoFocus` once at mount and leaves no `autofocus`
   ATTRIBUTE in the DOM, which is what `showModal()` looks for — so the rename dialog opened on its name
   field. Both confirms now focus `[data-cancel]` after `showModal()`.
4. **D4a and D4b failed axe with six and eight `color-contrast` violations.** P0-0's greyed ink on P0-0's
   greyed field is 2.2:1 — a WCAG 1.4.3 "inactive user interface component", which axe cannot infer. The
   greyed door carries `aria-disabled` on the container, which is the kit's own greyed treatment
   (`greyedProps`) and is what makes the exemption legible to the tool. Proved by a probe run in the page:
   the same text is reported when plain and skipped when `aria-disabled`, and `aria-allowed-attr` stays
   clean.
5. **The account chip broke out of the 220px sidebar.** The frame's chip truncates the email in the SECOND
   line, and until E2 sets a display name the email is in the FIRST — so the name slot is what has to
   truncate. Found by looking at the 1440 screenshot. **Superseded on 2026-09-06 by the owner's finding 2:**
   the plan badge leaves the chip, and the 195px the row then measures fits the column's 196 without any
   truncation at all — the badge was the overflow, not the address. The two account rows are now one
   piece of code at two sizes, so the desktop cannot drift from the phone again.
6. **The token layer gained two colours, and the Code Map said it would gain only `shadow-modal`.**
   The owner's finding 3 asked for D4b's card as the frame draws it, and the frame's card is a fill and a
   button fill that no existing name carried: `marigold-tint-soft` (`#FFFDF6`, the export's warm card and
   notice-block fill, 29 occurrences across six frames) and `marigold-solid` (the gold a Go Pro button is
   filled with, 44 occurrences across ten). Both are transcriptions, both have their `colors.*` twin in
   DESIGN.md, and both are asserted by `tokens.test.ts` — which also caught the first draft of the change
   writing a hex into a `.tsx` comment and failed the build on it.

## Design Notes

**Where this story now departs from the frames, and on whose authority.** Four places, every one of them
the owner's own words on the deployed site (R-80), and R-74 makes the export the design authority *until
he rules otherwise* — which is exactly what these are. From his first test (2026-09-05): (1) **The phone
has one initial, not two**, and it lives at the bottom of the ☰ drawer where it opens the account menu;
`S3 · mobile · 390` draws an avatar in the top bar and `S3 · mobile — menu open` draws an account row
below it, and his ruling merges the pair. (2) **The delete confirm is centred** — the disc above the title
rather than beside it, and two equal buttons rather than a right-aligned pair; that surface has no frame
at all, so the S12c extrapolation is what moved, which the frozen Boundaries put under "Ask First" and he
has now answered. From his second test (2026-09-06): (3) **The New project sheet has three doors**, the
Duplicate one removed outright rather than greyed — ruling **R-93**, which is a change to what the surface
*does* and therefore amends FR-B2 rather than living only here. (4) **The sidebar chip at 1440 carries no
plan badge and does not clip**: it is the drawer's own row at the sidebar's size, which is the ruling of
2026-09-05 extended to the desktop on his word — the badge was taking exactly the width the address needed,
and it still rides the Billing & plan row inside the menu. **The export itself is not edited** — it never
is by a story — and if he wants `S3d`, `S3 · mobile · 390`, `S3 · mobile — menu open` and `D4a/D4b`
redrawn to match, that is a design pass of its own. Nothing else moved: the top bar at 1440, S3a/b/c, the
rename confirm and D4b's *behaviour* are as they were.

**D4b's upgrade card, and the one place a frame's value could not be taken whole.** The owner's finding 3
asked for the frame's card, and it is now the frame's card: `marigold-tint-soft` inside the
`marigold-line` hairline, radius 12, padding 14/16, and a solid gold button at 38px, radius 12, padding
0/18, 13.5px/600 in white. The **fill of that button is the frame's hover gold, not its resting one**, and
that is the whole of the departure: white on the resting gold measures **3.61:1**, and WCAG AA asks 4.5:1
of 13.5px semibold text, so the button as drawn would have been the one axe-core violation in a story
whose acceptance criteria say zero. Its own hover shade is **4.74:1** and passes, so it is the resting
fill and the hover steps once more to `marigold-text` (**5.54:1**). Both values are the frame's own and
neither was invented. The alternative — the frame's exact gold and a failing contrast check — was the
owner's to take rather than a story's, and it was put to him as **question 4** below; **he ruled on
2026-09-06 for the deeper gold, so what is deployed is what stands.** Measured with the WCAG relative
luminance formula and confirmed by axe-core on the deployed card, which reports nothing.

**Why S3c's tile did NOT take the gold button too.** It was built as a marigold-tint pill on the reasoning
that one call to action should have one look, and that reasoning is what made D4b quieter than its frame.
The frames disagree with it: `S3 Dashboard.dc.html:337` draws the tile's pill in `marigold-tint` on
`marigold-text` and `D4 :165` draws the sheet's as a solid gold button, and they are different surfaces.
Both are now as their own frame draws them, and the tile is unchanged by this Fix run.

**The app's error boundary sits at `/app`, not inside `(authed)`, and that is the whole point of it.**
An `error.tsx` catches throws in its segment's children — its own segment's LAYOUT included only if the
boundary is a level up. The shell is `(authed)/layout.tsx`, and `revalidatePath` after any of the four
writes re-renders the shell and the page together, so a boundary inside `(authed)` would have covered
exactly half of what the owner met. At `/app` it covers both, at the cost of the sidebar disappearing
while the message is on screen; a second boundary inside the group is the upgrade if that ever matters,
and the `ponytail:` comment beside it says so. It logs `error.digest` and nothing else — logs carry no
user content (spine, Security floor).

**The 1.4 rule for a frame's values, applied here.** Geometry is read off the frame and never rounded;
colours are the token layer's names, and where a frame draws a hex that has no name the nearest named
token carries it rather than a new token being minted — S1's field took the Kit's tokens at S1's size
in 1.4, and this story does the same in eight places: the frame's `rgba(28,27,26,.04)` nav hover is
`paper-sunk` (the kit's ghost hover); D4a's selected door `#FFF9F7` is `coral-tint` (the kit's radio
card); D4a's greyed door (`#FBF9F5`, `#8B857C`, `#DDD6CB`) is P0-0's `grey-field` / `ink-faint` /
`grey-border`; the reason icon's `#B87A00` takes the sentence's `marigold-text`; D4b's solid gold
"Go Pro" button (`#B87A00`, hover `#9E6800`) is drawn as S3c draws the same call to action, a
marigold-tint pill, so one CTA has one look; D4b's upgrade-block `#FFFDF6` is `surface` with the
`marigold-line` hairline doing the work; the disabled Create's `#A39C91` is `ink-faint`; the frame's
avatar (`#2F4A3E` on `#F4EFE6`) is the *fixture publication's* brand — Orbit Weekly's favicon wears
the same pair — so a real user's avatar takes the frame's other avatar treatment, ink on paper
(Maya's portfolio's "M"). The only addition is `shadow-modal`, because the export draws every modal at
.25 and the token layer had no name for it.

**Why the doors are drawn and not dropped.** *(Amended 2026-09-06 by R-93: the Duplicate door is the one
exception and is dropped, on the owner's ruling. What follows governs the three that remain.)* D4a's own
caption is a design instruction: *all four doors stay drawn and each carries its reason.* The cut line makes three of them another epic's, so they
are greyed in the frame's treatment with a one-sentence reason in the frame's slot — the reason is the
product's way of saying "not here yet" (UX-DR3) and the frame's own sentence ("Connect a Ghost site
first.") is reused where it is true today. Two controls that are absent rather than greyed — the
Redesign door's "Connect a site" button and the menu's Keyboard shortcuts — are absent because there is
nothing for them to open at all, which is the other half of the same rule.

**Why unbuilt destinations are links.** The nav and the account menu are the shell, and the shell is IN.
Each item links to the address its surface will have; until that epic lands the address answers "not
found", exactly as inflozo.com/terms did in 1.4 and was accepted. The owner's test names every one of
them as expected. If he rules otherwise the fix is inside this story (R-80).

**Why the search is a GET form.** The field is in the layout and the cards are in the page; the URL
is the one piece of state both already share, so `?q=` needs no client state and no context. Enter
searches; ⌘K focuses. `// ponytail: Enter-to-search; live filtering is a router.replace on input if the
owner wants it`.

**Why the placeholder's colours are inline styles.** They are the Style Pack's — the site's system,
never the app's (`pack-cell.tsx`), and Tailwind's palette is cleared on purpose. Layout from S3's card
2, colours from the pack: with one pack every card looks alike today, and that is the truthful state
until E6 makes packs differ.

**Why create and duplicate count then insert.** A trigger could enforce the cap in the database, but
the cap depends on the plan, and the PRD asks for a *contextual prompt at creation time*, which is an
application answer. `// ponytail: count-then-insert; a double-submit is closed by the pending state, and a
trigger on projects reading entitlements is the upgrade if a race ever lands two`.

```ts
// projects/actions.ts — the shape every dialog reads
type Result =
  | { ok: true }
  | { error: { code: 'at_cap' | 'bad_name' | 'name_mismatch' | 'failed'; message: string } }
```

## Verification

Executed 2026-09-05 by the Dev run against the real Supabase project (R-82), with the app running from
this repository at `localhost:3000` so the browser passes could drive it. Every key was read into a
command's environment from `tools/probe/.env` and is named here by its variable only — no value was
printed, logged or committed. **Two fixture users were created through the admin API and both were
deleted at the end**; the live database is back to the owner's own accounts, and their `profiles` and
`entitlements` rows cascaded with them.

**Gate and build**

| Command | Result |
|---|---|
| `pnpm check` | green — lint, typecheck, and every `apps/web` test passing, including the new `plan.test.ts` (7) and `projects.test.ts` (8) |
| `pnpm build` (in `apps/web`) | the route table unchanged from 1.4: `○ /` · `○ /_not-found` · `ƒ /app` · `ƒ /app/auth/confirm` · `ƒ /app/kit` · `ƒ /app/sign-in` · `ƒ Proxy (Middleware)`. Actions, `loading.tsx` and components are not routes |
| `python3 tools/doc-audit.py --check` | first run FAIL (STORY-BOARD stale, the documented behaviour); `python3 tools/story-board.py`; second run **PASS, 0 warnings** |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, every assertion PASS, zero FAIL lines — the epic's exit, on every table the schema story created |
| `grep -o ':is(\[open\][^)]*)' .next/static/chunks/*.css` | `:is([open],:popover-open,:open)` — the variant the menus' hidden state depends on really compiles |

**Supabase (real)** — `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`

| Step | Result |
|---|---|
| two fixture users created, each signed in through `/app/auth/confirm` with an admin-minted `token_hash` | 200, session cookies written by 1.4's own route |
| A, empty | S3b: "Every great site starts somewhere.", sidebar `Projects / Sites / Assets`, the chip's badge **Free** |
| A creates from D4a | one row, `("Untitled project", "untitled-project")`; the sheet closed; the card reads `Untitled project / ⋯ / Sample content / Updated today` |
| A creates again (Free, 1 of 1) | the sheet opens as **D4b** — every door greyed with a `Free includes 1 project` pill, no Style Pack row, the block `Free includes 1 project. Pro gives you 25.` + `Your project stays exactly as it is either way.` + `Go Pro — $15/mo`, Create greyed |
| the grid at the cap | S3c's tile: `✦ / Upgrade to add more / Free includes 1 project. Pro gives you 25. / Go Pro — $15/mo` |
| rename to a blank name, then to 81 characters | refused both times with `Give it a name — up to 80 characters.`; nothing sent |
| rename to `Field Notes` | `("Field Notes", "untitled-project")` — **the slug is untouched** (FR-J10); the dialog closed |
| ⋯ → Duplicate at the cap | the D4b sheet opened instead of a write |
| delete, typing `field notes`, and the greyed button clicked with `force` | `aria-disabled="true"`; **1 row still there** |
| delete, typing `Field Notes` | 0 rows; the dashboard returned to S3b |
| A set to `pro_active` by the secret key | ✦ Pro on the chip, **no upgrade tile**, create and ⋯ → Duplicate both succeeded: `("Copy of Untitled project", "copy-of-untitled-project")` beside `("Untitled project", "untitled-project")` |
| **RLS, as B against A's project id** | `select` → `[]` · `update` → `[]` · `delete` → `[]` · `insert` with A's `user_id` → **42501**; A's two rows unchanged, and B's dashboard showed **0 cards** and the empty state |
| both fixtures deleted | the live database is the owner's accounts only |

**The deployed site — `https://app.inflozo.com`, commit `f23954b5`, after CI's `check` · `rls` · `deploy`
all reported success.** The same fixture pass was run again against the live deployment rather than the
local one, because R-82 asks for the real infrastructure and a local server is not it. The Supabase project
is the live one throughout (its REST and Auth hosts are `{ref}.supabase.co`, the ref read from
`SUPABASE_URL` and never written down; the project's own config API is `https://api.supabase.com/v1/projects/{ref}`).

| Step on `app.inflozo.com` | Result |
|---|---|
| the magic link's `/auth/confirm` | 200 at `https://app.inflozo.com/`, `x-inflozo-policy: app-nonce` |
| S3b, S3a, D4a, D4b, the delete confirm at 1440, and S3b + the drawer at 390 | **axe-core: clean on every one** |
| D4a's box | `x = 440` in a 1440 viewport — centred, the `m-auto` fix holding in the production build |
| create · rename · delete | one row `("Untitled project","untitled-project")`; renamed to `("Field Notes","untitled-project")` — **slug untouched**; deleted with the typed name, back to S3b |
| the ⋯ menu | `Rename / Duplicate / Delete`, focus stepping to **Rename**; both confirms opened on **Cancel** |
| S3c's tile and D4b's block | `Free includes 1 project. Pro gives you 25.` + `Go Pro — $15/mo`, composed from `plan.ts` |
| `entitlements.state = pro_past_due` | the chip reads **✦ Pro** — F.1's third column, the row AD-28 exists to keep from diverging, executed rather than asserted |
| no horizontal scroll at 390 | none |
| **console CSP violations across the whole pass** | **zero** |
| the fixture user | deleted; the live database is the owner's accounts only |

**The deployed shape**

| Check | Result |
|---|---|
| `https://app.inflozo.com/` signed out | **307 → `https://app.inflozo.com/sign-in`** (1.4's guard, unchanged); `/kit` the same |
| `/sites` · `/assets` · `/account` · `/billing` · `/suggestions` on `app.inflozo.com` | **404 each** — drawn, linked, and answering "not found" until their epics land, exactly as the owner's test says to expect |
| console CSP violations on every app surface visited | **zero.** The three the run recorded are on the MARKETING page at `localhost`, whose static policy carries no nonce while `next dev` inlines its own bootstrap — 1.4's shape, unchanged by this story, and absent from the app host (`x-inflozo-policy: app-nonce`, `'nonce-…' 'strict-dynamic'`) |

**Playwright + axe-core 4.12.1** (this machine, `headless-browser-tooling`), WCAG 2.0/2.1 A and AA

| Surface | 1440 | 834 | 390 |
|---|---|---|---|
| S3b empty · S3a with cards · the ⋯ menu open · rename · delete · D4a · D4b · the account popover | **zero violations each** | S3a zero | S3a, the drawer, the dropdown and the delete confirm — zero each |
| no horizontal scroll | — | none | none, including with the search field open and a confirm open |

| Keyboard | Result |
|---|---|
| Tab from the top of the dashboard | `Inflozo → Projects → Sites → Assets → account chip → search → New project → ⋯ → upgrade tile` |
| ⋯ with Enter | opens and focus steps to **Rename**; ArrowDown → Duplicate → Delete; ArrowUp → Duplicate; **Escape closes and returns focus to the ⋯** |
| the account chip with Enter | opens on **Account settings**; ArrowDown → Billing & plan |
| both confirms | open on **Cancel** |
| ⌘K / Ctrl+K | focuses the field named `q` |

**Re-executed independently at the close of the Dev run (2026-09-05), against the live deployment.**
Every command below was run again from scratch rather than read from the table above, and two matrix rows
that the first pass had not covered were executed for the first time.

| Command / check | Result |
|---|---|
| `pnpm check` | green — **54 tests, 54 pass, 0 fail, 0 skipped** in `apps/web`. Nothing is filtered out or disabled, so every covering test in the matrix audit really ran |
| `pnpm build` | `○ /` · `○ /_not-found` · `ƒ /app` · `ƒ /app/auth/confirm` · `ƒ /app/kit` · `ƒ /app/sign-in` · `ƒ Proxy (Middleware)` — the 1.4 table exactly, no new route |
| `python3 tools/doc-audit.py --check` twice | **PASS, 0 warnings** both times |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0** — run independently before the implementation landed and green then too, so the gate is a result and not an artefact of this story |
| `gh run view` on head (`GITHUB_TOKEN`) | `check: success` · `rls: success` · `deploy: success` |
| `https://app.inflozo.com/` signed out | **307 → `/sign-in`** |
| `https://app.inflozo.com/sign-in` | **200**, `x-inflozo-policy: app-nonce`, `script-src 'self' 'nonce-…'` |
| `/sites` `/assets` `/account` `/billing` `/suggestions` | **404 each**; `https://inflozo.com/docs` **404** — the six future destinations, drawn and linked, as the owner's test says to expect |
| `https://inflozo.com/` | **200** — marketing untouched by this story |

**A fixture user round-tripped on the deployed site** — `SUPABASE_URL`, `SUPABASE_SECRET_KEY`

**Deploy (2026-09-05)** — the push of the Review commit, confirmed on the real stack (R-82; PRD §4, AD-26:
production is the stack under test). No schema change in this story, so nothing beyond app code to deploy.

| Check | Result |
|---|---|
| `gh run list --branch main` (`GITHUB_TOKEN`) | commit `d677a159` — `check` ✓ `rls` ✓ `deploy` ✓ |
| Vercel deployments (`VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`) | `dpl_27Ftr4NiH4htjcYP6EE9yE2gpvtq`, state **READY**, built from `d677a159` |
| Aliases on that deployment | `inflozo.com`, `app.inflozo.com`, `www.inflozo.com` (→ `inflozo.com`), plus the probe and account preview aliases |
| `curl -sI https://app.inflozo.com/sign-in` | **200**, the nonce CSP header present |
| `curl -sI https://app.inflozo.com/` signed out | **307** → `/sign-in`, unchanged |
| `curl -sI https://inflozo.com/` | **200** |

Deployment: `inflozo-p3pavnpq3-umangkagathara.vercel.app` (`dpl_27Ftr4NiH4htjcYP6EE9yE2gpvtq`)

| Step | Result |
|---|---|
| admin-created user → `profiles` / `entitlements` | **1 and 1**, `state = free` — 1.2's triggers fired |
| `/auth/confirm` with an admin-minted `token_hash` | **303 → `https://app.inflozo.com/`** |
| `GET /` with the cookie | **200**, and the delivered HTML carries `Inflozo`, `Projects`, `Sites`, `Assets`, `Search projects…`, `New project`, **"Every great site starts somewhere."**, **"Yours starts with hundreds of gorgeous sections."** and the **Free** badge — S3b, rendered by the real deployment |
| `input[type=password]` on that page | **0** |
| the nonce, header and body from the **same** response | **15 scripts, 15 nonced, exactly one distinct nonce in the page, and it equals the header's**. (Compared across two requests it never matches — each response mints a fresh nonce, which is the point) |
| `DELETE /auth/v1/admin/users/{id}` | `profiles` **[]**, `entitlements` **[]** — cascaded |

**Deploy (2026-09-06)** — the push of the third Review commit (`8b95c285`), confirmed on the real stack
(R-82; PRD §4, AD-26: production is the stack under test). No schema change since the last deploy, so
nothing beyond app code to deploy.

| Check | Result |
|---|---|
| `gh run list --branch main` (`GITHUB_TOKEN`) | commit `8b95c285` — `check` ✓ `rls` ✓ `deploy` ✓ (run `34008998712`) |
| Vercel deployments (`VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`) | `dpl_2m64KuF6unbMLYSNDkYMGHQyqMZR`, state **READY**, built from `8b95c285` |
| Aliases on that deployment | `inflozo.com`, `app.inflozo.com`, `www.inflozo.com` (→ `inflozo.com`), plus the probe and account preview aliases |
| `curl -sI https://app.inflozo.com/sign-in` | **200**, the nonce CSP header present |
| `curl -sI https://app.inflozo.com/` signed out | **307** → `/sign-in`, unchanged |
| `curl -sI https://inflozo.com/` | **200** |

Deployment: `inflozo-47810pd9u-umangkagathara.vercel.app` (`dpl_2m64KuF6unbMLYSNDkYMGHQyqMZR`)

**The two matrix rows the first pass had not executed.** Both were run against `app.inflozo.com` with a
fixture user holding **exactly 25 projects** and `entitlements.state = pro_active`.

| Matrix row | Result |
|---|---|
| *Create, at cap (Pro, 25)* | the page carries **"Pro includes 25 projects"**; **"Go Pro" appears zero times**, **"Free includes" zero times**, and **"Upgrade to add more" zero times** — the Pro cap refuses without the upsell and the grid grows no tile, which is the row's whole point |
| *Search* — `?q=harb` | **one card**, "Harbour Letter"; `?q=HARB` **the same one card**, so the match is case-insensitive as the row says |
| *Search* — `?q=zzz` | **zero cards**, the line **"No projects match"**, and the S3b illustration **not** shown — the row's exact distinction between "no matches" and "no projects" |
| cleanup | every fixture user deleted; the live database holds the owner's two accounts. One `projects` row remains and is **not** a fixture: it belongs to one of the owner's own accounts, created while this run was in progress. It is left alone — and it is incidental live evidence for FR-J10, because it reads `name = "Test"` with `slug = "untitled-project"`, a rename that did not rewrite the slug |

**One deviation from the matrix's Keyboard row, recorded rather than forced.** It reads
`sidebar → search → New project → cards' ⋯ → chip`, and the run produces the chip *with the sidebar*,
before the search field. The chip is inside the sidebar in the drawing and in the DOM, so document order
already is visual order (WCAG 2.4.3); moving it after the cards would need a positive `tabindex`, which is
the one thing an accessibility floor should not carry. Everything else in that row holds exactly.

**The code review, 2026-09-05 — re-executed against the real infrastructure (R-82), then patched.**
Every claim in the tables above was run again from scratch by a reviewer that had not seen the Dev run,
against the live Supabase project, `https://app.inflozo.com` and `https://inflozo.com`, with the keys read
into each command's environment from `tools/probe/.env` by variable name and never printed. **Every one
held**, and the pass carried its own controls, which is what makes them results rather than green text:
an axe positive control (a deliberately broken element in the clean page WAS reported: `button-name`,
`image-alt`), a forged session cookie refused (`307`, still signed out), the nonce compared across two
responses and different each time, B's insert with A's `user_id` refused `42501`, and A's own
`entitlements` PATCH refused `42501` (select-only to `authenticated`). Five fixture users were created and
all five deleted; the live database holds the owner's two accounts.

| Re-executed | Result |
|---|---|
| `pnpm check` · `pnpm build` · `bash supabase/tests/run-rls-gate.sh` · `doc-audit.py --check` ×2 | green; route table unchanged; RLS exit 0, zero FAIL lines |
| `gh run view` on HEAD | `check: success` · `rls: success` · `deploy: success` |
| the deployed shape — `/` signed out, the nonce CSP, the six future destinations, `inflozo.com` | 307 → `/sign-in`; `x-inflozo-policy: app-nonce`; 404 each; 200 |
| RLS as B against A's project — select · update · delete · insert | `[]` · `[]` · `[]` · **42501** |
| S3b · S3a · D4a · D4b · the ⋯ menu · both confirms · the account popover, at 1440 / 834 / 390 | axe-core zero violations on every one; no horizontal scroll; zero console CSP violations |
| the Pro-at-25 row, the search rows, `pro_past_due` → Pro, D4a centred at x=440 | each held |
| Tab order | `Inflozo → Projects → Sites → Assets → account chip → search → New project → ⋯` — the owner's ruling below, executed |

**What the review then found, and what was done about it.** Sixteen findings survived triage across five
layers; the ones that were the owner's to decide were none — the one candidate, the greyed doors' contrast,
was settled by measurement instead (below). Every finding was applied as a patch in this story:

| Fixed | Was |
|---|---|
| a rename that FAILED now says so — a Banner above the form (`project-menu.tsx`) | only `bad_name` was rendered, so a failed rename left the dialog open, unchanged and silent |
| `at_cap` from Duplicate opens the D4b sheet, the matrix's own row | only `'failed'` was rendered, so a duplicate refused by the cap in a second tab was a click that did nothing |
| a duplicate takes a name no other project has, so its slug is fresh (`copyName`) | duplicating twice wrote two rows with ONE name and ONE slug, and `projects.slug` has no unique constraint to refuse it — FR-J10 makes that slug the emitted theme name |
| `linked_site_id` is no longer selected into a duplicate | it was spread into the insert; null today, and an inherited site binding the moment E3 lands (FR-B5) |
| a failed projects read renders the error Banner, not S3b | `data ?? []` showed the first-run illustration to a user who HAS projects, and cleared `atCap` with it, lifting the plan cap |
| `?q=a&q=b` no longer throws | a repeated key arrives as an array and `q.trim()` 500'd the dashboard |
| `placeholderFor` uses `Object.hasOwn` | `PRESETS['__proto__']` is TRUTHY, so `??` never reached the fallback and the card painted `undefined` colours — proved by control |
| `/kit` renders a `div`, not a second `<main>` | the shell's `<main>` now wraps it, so the document had two main landmarks — invalid HTML, and `/kit` was never in the axe matrix |
| the greyed "Create project" carries `${ring}` | it was focusable with the user agent's outline instead of the one ring |
| the rename field carries `maxLength={NAME_MAX}` | an 81-character name round-tripped to be refused; the matrix says "nothing sent" |
| `atCap(plan, count)` is one predicate in `plan.ts`, asserted in `plan.test.ts` | FR-B4's comparison was written out at three call sites and executed by no test — **control: inverting `>=` to `>` left `pnpm check`, `pnpm build` and the RLS gate all green**; the new test refuses it |
| `style-pack.test.ts` (new) holds the fallback branch | nothing imported the module — **control: removing the guard fails the new test** |
| `story-board.py --check` now runs its own `demo()` self-check | the assertions lived in `--demo`, which the gate never invokes, so the ruling parser that decides whether the owner SEES a question was unchecked — **control: restoring the pre-fix parser now exits 2, where it previously regenerated the board and went green through the pre-commit retry** |
| `currentUser` and `resolveEntitlement` are `cache()`d | the layout and the page each read `entitlements` independently, so a failed read degrading to Free on one and not the other would draw a Pro badge over a Free cap on one screen; and `getUser()` ran three times per render |

**The patches themselves, on the real deployment.** The patched code is not the code the pass above
re-executed, so it was published and checked in turn: CI on `8249dd9f` reported `check: success` ·
`rls: success` · `deploy: success`, and against `https://app.inflozo.com` afterwards — `/` signed out
**307 → `/sign-in`** and `/kit` **307**, so wrapping `currentUser` in `cache()` left the guard exactly
where it was; `/sign-in` **200** with `x-inflozo-policy: app-nonce`; `https://inflozo.com/` **200**,
marketing untouched. The four patches that change what a person SEES — the rename Banner, the duplicate
race opening D4b, the error Banner over S3b, and the fresh duplicate name — are on the owner's own screens
and are his to confirm in `## Owner's manual test` below.

**Dismissed on measurement, not argument.** A layer read the greyed doors' `aria-disabled` as silencing
axe rather than fixing contrast. Measured: the reason sentence (`marigold-text` on `grey-field`) is
**4.83:1** and D4b's cap pill **5.01:1** — both pass AA on their own. Only the inactive door's title and
description (2.21:1) and the disabled Create label (2.15:1) sit below, and those are exactly what WCAG
1.4.3's "inactive user interface component" exemption covers. Every piece of information a user needs to
act is above 4.5:1, so P0-0's treatment stands and no owner question arises.

**Deferred, as DW-16 and DW-17.** Three of the five defects the Dev pass found were browser-only, and no
repeatable check holds them — deleting `open:` from the ⋯ menu leaves the whole gate green (DW-16, Story
15.1 owns it). The `(authed)` group has no `error.tsx` or `not-found.tsx`, so a layout throw or one of the
six future destinations leaves the shell entirely (DW-17, the first story with a second real screen).

### The Fix run — 2026-09-05, the owner's eight findings

Executed against the real Supabase project (R-82) and against **the live `https://app.inflozo.com` and
`https://inflozo.com`**, with a headless Chromium driving the pages. One throwaway account,
`story-1-5-fix@inflozo.com`, was created through the Supabase admin API, signed in with a real
`generate_link` token, used for every pass below and **deleted at the end**; its `profiles` and
`entitlements` rows cascaded with it. Every key was read into a command's environment from
`tools/probe/.env` and is named here by its variable only.

**Findings 3 and 8 — what the error actually is, and what was and was not proved.** The page the owner
saw is Next's **client-side** global error, not a 500: the two are different files with different
sentences, and only the client one ends *"Reload to try again, or go back."* (grepped out of the built
client bundle — the server's says *"A server error occurred. Reload to try again."*). So an uncaught
error in the BROWSER, and no boundary anywhere under `/app` to catch it — DW-17, which the owner has now
met. **The throw itself was not reproduced**, and the attempts are recorded because a negative result is
one: eight delete cycles across `next dev`, a local `next build && next start`, and the live site; with
and without a `?q=` search; deleting the last project so S3b comes back; the owner's own step 2 (click
Sites, browser Back) before deleting; and a fuzz pass over the paths that CAN throw
(`showModal()`/`hidePopover()` on a dialog or popover in the wrong state) — double-clicking "New project",
Escape-and-reopen on the sheet, on the ⋯ menu and on the delete confirm, and a double-click on "Delete
project". Zero page errors in every one. The fix is therefore the boundary rather than a guess at a cause:
whatever throws, the owner now gets the app's own sentence and a **Try again** button instead of a bare
page, and `error.digest` reaches the log so a recurrence is identifiable.

| Claim | Command / control | Result |
|---|---|---|
| the error page is the CLIENT boundary's, not the server's | `grep -hoE "Reload to try again[^\"]*" .next/server/chunks/ssr/node_modules__pnpm_*.js` | both strings present: `Reload to try again.` (server) and **`Reload to try again, or go back.`** (client) — the owner's wording is the client one |
| delete does not throw | 8 delete cycles, dev + local prod + live, with and without `?q=`, plus the 404-and-Back flow | every cycle ended on S3b with **zero** `pageerror` and zero console errors |
| dialogs and popovers do not throw when driven wrongly | double-click New project · Escape+reopen sheet · Escape+reopen ⋯ · Escape+reopen delete · double-click Delete project, live | zero `pageerror` |
| the new boundary compiles into the route tree | `pnpm build` | route table unchanged: `○ /` · `○ /_not-found` · `ƒ /app` · `ƒ /app/auth/confirm` · `ƒ /app/kit` · `ƒ /app/sign-in` — an `error.tsx` is a boundary, not a route |

**Findings 2, 4, 5, 6 and 7 — every one proved in a real browser**, at 390 with touch on the production
build, and the 1440 side re-checked in the same run so the ruling cannot have broken the sidebar:

| Finding | Control | Result |
|---|---|---|
| 6 · one initial on the phone | every `button[popovertarget^="account-menu"]`, with `offsetParent` | two triggers in the document, **neither visible** at 390 until ☰ is open — the top bar carries none |
| 6 · the row opens the menu | tap the drawer's row → `#account-menu-mobile:popover-open` | true, and the menu draws above the modal drawer (top layer) |
| 6 · the whole address, unclipped | `scrollWidth > clientWidth` on the row's text | **false** — no ellipsis; the row reads `story-1-5-fix@inflozo.com` in full |
| 6 · no badge on the row, one in the menu | text of the row · text of the Billing row · text of the menu header | row: no `Free` · **Billing & plan → `Free`** · header: none |
| 6 · Sign out still reachable on a phone | `#account-menu-mobile button[type=submit]` | `Sign out` present |
| 6 · the desktop is untouched | `#account-menu` at 1440, opened from the chip | present, and the badge still rides Billing & plan |
| 5 · ☰ does not ring the wordmark | `document.activeElement` after `showModal()` | **`DIALOG`**, not the wordmark; `a[href="/"]:focus-visible` is false |
| 4 · a tap outside closes the drawer | click at (370, 500) — outside a 300px panel | `dialog[open]` gone |
| 4 · a tap inside does not | click at (150, 700) — inside it | `dialog[open]` still there |
| 7 · the search icon focuses the box | tap the 44px search button, then read `document.activeElement` | `input[name="q"]` |
| 2 · the icon is top-centre | rects of the disc, the `<h2>` and the dialog | disc **above** the title and centred to within 2px; **52px**; title `text-align: center` |
| 2 · two equal buttons | the footer's rects at 390 | `Cancel` and `Delete project`, **154 × 44** each |
| 2 · the confirm still confirms | open it, type the name in the wrong case, then exactly | wrong: `aria-disabled="true"` and nothing sent · exact: the row is deleted and S3b returns |
| 2 · it still opens on Cancel | `document.activeElement.hasAttribute('data-cancel')` | true |
| axe-core, WCAG 2.1 A + AA | the open delete confirm · the phone with ☰ open · 1440 with the account menu open | **zero violations** in all three |
| the gate | `pnpm lint` · `pnpm typecheck` · `pnpm test` | green — 59 `apps/web` assertions, 0 failing |

**A defect found while hunting findings 3 and 8, deferred as DW-18, and not this story's.** A statically
prerendered page can run no script under either policy, because the nonce is stamped per request and a
prerendered page's HTML was written at build time. Executed on the live site: `https://inflozo.com/`
reports **two blocked inline scripts** and throws `Minified React error #412`, uncaught; the app host's
prerendered 404 (`https://app.inflozo.com/sites`) reports **eight blocked scripts** and boots no
JavaScript at all. **The control passed**: `app.inflozo.com/sign-in` and the dashboard are dynamic, carry
the nonce, and report zero blocked scripts and no error in the same run — so this is the prerendered
routes, not the policy as such. Nothing visible is broken today; the policies are Story 1.4's and the
marketing pages are Epic 14's, and the fix is a real three-way choice that belongs with whoever owns them.
It also means **Story 1.4's "console 0 CSP violations" claim did not hold for marketing**.


### The second review — 2026-09-05, after the Fix run

Five layers over the whole diff since the baseline, with the Real-infra verifier executing the Fix run's
claims against the live deployment of `93e100ee` (R-82) — CI `check` · `rls` · `deploy` all success on
that commit, the production Vercel deployment READY from it, and the delivered client chunk carrying the
new boundary's sentence, so the site under test was the Fix code. Two fixture users were created and both
deleted; the live database holds the owner's two accounts and no fixture. Every key was read into a
command's environment by variable name and none printed.

| Re-executed, live | Result |
|---|---|
| the Fix run's finding 2 · 4 · 5 · 6 · 7 rows, each | **held** — the centred confirm (disc above, 52px, two 154×44 buttons, opens on Cancel); a tap outside closes ☰ and one inside does not; ☰ focuses the `DIALOG`; the search icon focuses `input[name=q]`; no account trigger visible in the 390 top bar, the drawer's row opens the menu in the top layer, the whole address unclipped (`scrollWidth == clientWidth`), the badge on Billing & plan only, Sign out present, the 1440 chip untouched |
| the boundary, not only its compilation | **held** — a page throw on `/app?q=__boom__` and a layout throw (via a temporary header, reverted) both rendered *We couldn't show that just now.* with Try again and the back link; Next's own sentence absent; `digest` logged |
| the deployed shape, the forged cookie, RLS as B against A, the plan badge | 307 → `/sign-in` for `/` and `/kit`; a garbage cookie value 307; B's select/update/delete `[]` and B's insert with A's `user_id` **42501**, B's own insert 201 (the positive control); `free` → Free, `pro_active` → ✦ Pro, `pro_past_due` → ✦ Pro |
| axe-core 4.12.1, WCAG 2.x A/AA — 1440 with the menu open, 390 with ☰, ☰ + the menu, the delete confirm | zero violations each; **positive control** reported `button-name` and `image-alt` on an injected pair |
| DW-18 | reproduced: `inflozo.com` two blocked scripts and one page error; `app.inflozo.com/sites` ten blocked; the dynamic `/sign-in` zero — the count moved from eight to ten between builds, so the ledger now says "every script on it" |

**What the layers found, and what was done.** Twenty-three findings survived triage; none was the owner's
to decide, none was deferred, twelve were dismissed as noise or as behaviour the frozen Boundaries ask
for (a duplicate copies `rtl_ack_at` because the boundary lists it; Docs and the five app destinations
link and 404 by the boundary's own rule; `reasons: []` is AD-28's shape; the `not-found` half is DW-17's).
Every one of the twenty-three was applied as a patch in this story:

| Fixed | Was |
|---|---|
| the `at_cap` refusal revalidates the page before answering (`refusedAtCap`) | a Duplicate refused by the cap in a race opened **D4a** with a live Create — the sheet's flip only listened to `createProject`, and the page's `atCap` was stale; Verification's earlier table claimed this fixed and it was not |
| the slug is `uniqueSlug(slugify(name), slugs)` for create and duplicate, and `names()` reads the slugs | a rename keeps its slug (FR-J10), so "Untitled project" renamed left `untitled-project` for the next blank project to take again — the live database already held that pair; and two names differing only in punctuation slugged the same |
| `copyName`'s clamp trims; its taken branch, `uniqueSlug` and `filterProjects` are asserted (`projects.test.ts`, 63 tests) | a cut on a space left a trailing blank that never matched the trimmed set, so the second copy reused the first's name — **control: ignoring `taken` left every test green**; now four fail |
| a dialog closed on a failure reopens clean (`seen`, set `onClose`) — the sheet, rename, delete | the stale Banner or sentence stayed until the next attempt |
| `openMenu` flips a menu that would overrun the bottom or the top, and a scroll closes it | a card's ⋯ in the last row at 390 opened a menu cut off by the viewport, unreachable and unscrollable; a scroll left it floating |
| an ended session inside any action `redirect`s to sign-in (`signedIn()`) | "Try again in a moment", which could never succeed |
| the search is `next/form` with the router's own path as its action | a bare GET was a full navigation: on the phone, Enter threw the field away and left the results with no box to clear |
| ⌘K lower-cases the key and is inert under an open modal | Shift or Caps Lock killed it; under a modal it mounted the phone's field behind the dialog |
| the drawer `<dialog>` has no `tablet:hidden` | opened at 390 and rotated across 834 it was an invisible modal holding the page inert |
| `openNewProject` skips `showModal()` on an open sheet | a second open threw `InvalidStateError` in older engines |
| `TextInput` joins the error's and the reason's `aria-describedby` after the spread | `greyedProps` overwrote the error id |
| the ⋯ trigger is ink while its menu is open (`[&:has(+:popover-open)]:text-ink`, grepped from the built CSS) | S3c's open state was not drawn |
| the drawer's account trigger has no `aria-label` | "Account" overrode the visible name (WCAG 2.5.3) |
| the capped Create is described by the cap sentence (`aria-describedby="new-project-cap"`); the doors' `ul` is `role="list"`; S3a carries an sr-only `<h1>` | "dimmed" with no reason; Safari dropping the list; card `<h2>`s under no heading |
| the layout logs a `profiles` read error by code | swallowed |
| `stripApp` lives in `routing.ts` and is under test; the shell imports it | a private copy in a client file `node --test` cannot import |
| `doc-audit.py` reports a sub-tool's SELF-CHECK failure as itself — **control: breaking the assertion printed `story-board.py: story board: SELF-CHECK FAILED`, not STALE** | the gate said "run story-board.py", which would not have fixed it |
| `demo()` pins `**Ruled** — option 1` as ruled and `Ruled — option 1` as not | the boundary the docstring describes was held by nothing |
| Spec Change Log 18–20; DW-17 and DW-18 amended | three departures from the frozen Data boundary lived only in Verification's table; the prefetch 404 noise and a hardcoded count |

**The patches, executed before they were committed** — a local `next start` of the production build against
the real Supabase project (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` in the server's environment,
`SUPABASE_SECRET_KEY` for the admin API and the reads), one fixture user signed in through `/auth/confirm`
and deleted at the end (the live database: the owner's two accounts, zero fixtures, zero project rows).

| Claim | Result |
|---|---|
| a rename keeps its slug and the next create takes a fresh one | `("Field Notes","untitled-project")` then `("Untitled project","untitled-project-2")`; two duplicates `copy-of-field-notes` and `copy-of-field-notes-2` — **4 rows, 4 distinct slugs** |
| Duplicate/Create refused by the cap in a race opens D4b | Free, zero rows, dashboard open; a row inserted behind it with the secret key; New project opened the stale D4a; Create → the SAME open sheet turned D4b (the cap pills, the greyed Create), the grid grew the `Race` card and the upgrade tile, no reload (`window.__mark` survived); **control: still one row** |
| a failure is spent on close | the delete confirm's server-side `name_mismatch` (the row renamed behind it) showed *That's not this project's name.*; Cancel, reopen → the sentence **absent**, the field empty |
| the ⋯ trigger's open-state ink | `rgb(110,106,100)` closed → `rgb(28,27,26)` (the title's ink) while `:popover-open` → reverted |
| a menu flips rather than overruns; a scroll closes it | a ⋯ at `top=794` of 844: the menu at `659–788`, above the trigger; `scrollBy(-200)` → not open; **control: the top card's menu opens down** |
| the phone's search survives Enter | `?q=harb` → one card, the field still on screen with `harb`, no reload; `?q=zzz` → *No projects match*, field still there |
| ⌘K with Shift; under a modal | `K` + Ctrl focuses `#q`; with the delete confirm open, focus stays on its Cancel |
| the drawer across the seam | ☰ at 390 then a 1024 viewport: still open, `300×768`; Escape → closed, no rect |
| the sheet's re-open guard | a second open on an open sheet: still open, zero errors |
| an ended session inside an action | cookies cleared, rename submitted → `/sign-in`, no failure sentence, the row unchanged |
| axe-core 4.12.1 A/AA — S3a, D4a, D4b at 1440, the drawer at 390 | **zero** each; one `<h1>` (sr-only "Projects"); `ul[role=list]`; the greyed Create described by the cap sentence; the drawer trigger's accessible name = its visible email; the positive control reported `button-name`, `image-alt` |
| the build | the route table unchanged; `has(+:popover-open)` in the emitted CSS; `pnpm check` green, **63 tests, 63 pass**; the gate PASS twice |

One `best-practice` (not WCAG) note from that run — the sidebar's wordmark sat outside any landmark — was
taken as well: both bars are `<header>`s now, one visible at a time.

**The patches on the real deployment.** The review commit `6cb8982d` was pushed; CI reported `check` ·
`rls` · `deploy` all success (`GITHUB_TOKEN`), and the newest production deployment,
`dpl_2CxLFAyjda8m59JkbZ9nL9QWtjPg`, is READY from that commit (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`,
`VERCEL_PROJECT`). A fresh fixture user on the live site, deleted at the end (the database: the owner's two
accounts, zero project rows):

| On `https://app.inflozo.com`, after the deploy | Result |
|---|---|
| the delivered S3a HTML | carries the sr-only `<h1>Projects</h1>` — new to this commit, so the live code is this code |
| create · rename to Field Notes · (Pro) create · Duplicate | `untitled-project` kept by the rename; the next create `untitled-project-2`; the copy `copy-of-field-notes` |
| 390: search icon, `harb`, Enter | `?q=harb`, one card, the field still on screen with `harb`, no reload |
| the ⋯ trigger while open; the delete confirm reopened after Cancel | the title's ink, reverting; the field empty and no alert |
| ☰ at 390, then a 1024 viewport | still open; Escape closes |
| axe-core A/AA — S3a, D4b at 1440, the drawer at 390 | zero each; the positive control reported `button-name`, `image-alt` |
| `/` and `/kit` signed out · `/sign-in` · `inflozo.com` · console CSP violations signed in | 307 → `/sign-in` both · 200, `x-inflozo-policy: app-nonce` · 200 · zero |

**Deploy (2026-09-06)** — confirming the push of the second Review commit (`b42d37fa`) built and published
(PRD §4, AD-26: production is the stack under test). No schema change in this story since the last Deploy,
so nothing beyond app code to confirm.

| Check | Result |
|---|---|
| `gh run list --branch main` (`GITHUB_TOKEN`) | HEAD `b42d37fa` — `check` ✓ `rls` ✓ `deploy` ✓ |
| Vercel deployments (`VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`) | `dpl_AmtoTZCoEagCLPW7igNBnEEBy6Cj`, state **READY**, built from `b42d37fa` |
| Aliases on that deployment | `inflozo.com`, `app.inflozo.com`, `www.inflozo.com` (→ `inflozo.com`), plus the probe and account preview aliases |
| `curl -sI https://app.inflozo.com/sign-in` | **200**, the nonce CSP header present |
| `curl -sI https://app.inflozo.com/` signed out | **307** → `/sign-in`, unchanged |
| `curl -sI https://inflozo.com/` | **200** |

Deployment: `inflozo-dwe1s98i8-umangkagathara.vercel.app` (`dpl_AmtoTZCoEagCLPW7igNBnEEBy6Cj`)

### The second Fix run — 2026-09-06, the owner's three findings

Executed against the **real Supabase project** (R-82) with the production build of this repository
serving at `localhost:3000`, so a browser could drive it before the code existed anywhere to deploy;
then re-executed against `https://app.inflozo.com` after CI published it (the table below the first).
Keys were read into each command's environment from `tools/probe/.env` by variable name and never
printed. **Fixture users were created through the admin API and every one was deleted at the end**; the
live database is back to the owner's own accounts.

**The controls first, because a result whose control did not pass is not a result.** axe-core reported
`button-name(1)` and `image-alt(1)` the moment a bare `<button>` and an unlabelled `<img>` were appended
to the page it had just called clean — so "clean" is a reading and not a silence. And the token gate
caught its own violation on the way through: the first draft of `new-project-sheet.tsx` carried the
frame's resting gold *inside a comment*, and `tokens.test.ts`'s colour-literal grep failed the build on
it, which is the rule working rather than a rule being described.

**Gate and build**

| Command | Result |
|---|---|
| `pnpm check` | **green** — lint, typecheck, 63 tests in `apps/web`, 63 pass, 0 fail. The two new colours pass both token tests: each value occurs verbatim in the export, and each has its `colors.*` twin in DESIGN.md |
| `pnpm build` | route table unchanged — `○ /` · `○ /_not-found` · `ƒ /app` · `ƒ /app/auth/confirm` · `ƒ /app/kit` · `ƒ /app/sign-in` · `ƒ Proxy (Middleware)` |

**Finding 1 — the Duplicate door is gone** (R-93)

| Check | Result |
|---|---|
| the doors in the open sheet | **3** — `Blank canvas` · `Start from a starter` · `Redesign one of my sites` |
| the string "Duplicate" anywhere in the sheet | **absent** |
| the same three at the cap | each carrying `Free includes 1 project`, as D4b does |
| duplicating still reachable | ⋯ → **Duplicate** on a card, unchanged and untouched by this run — the owner's own reason for the removal |
| axe on D4a with three doors | **zero violations** |

**Finding 2 — the sidebar chip: no plan badge, the whole address**

| Check | Result |
|---|---|
| the chip's text at 1440 | `F / <the account's address>` — one line under the initial |
| "Free" or "Pro" inside the chip | **false** |
| the address is whole | `scrollWidth <= clientWidth` → **true**; no ellipsis, nothing clipped |
| the chip inside the 220px column | **195px** wide, and the column's content box is 196 — it fits without the badge, which is what the badge had been costing |
| the badge is not lost | the menu the chip opens reads **`Billing & plan / Free`** — the row he named, in both variants |
| the drawer's row at 390 | unchanged and identical in shape: `F / <the address>`, no badge |
| axe on the dashboard and on the open menu | **zero violations each** |

**Finding 3 — D4b's upgrade card, measured against the frame**

| Property | The frame (`D4 :160`, `:165`) | Built |
|---|---|---|
| card background | `#FFFDF6` | `rgb(255, 253, 246)` ✓ |
| card hairline | `#F5E3B8` | `rgb(245, 227, 184)` ✓ |
| card radius · padding | 12 · 14/16 | `12px` · `14px 16px` ✓ |
| button height · radius · padding | 38 · 12 · 0/18 | `38px` · `12px` · `18px` ✓ |
| button type | 13.5px/600, white | `13.5px` · `600` · `rgb(255, 255, 255)` ✓ |
| button fill | `#B87A00`, hover `#9E6800` | `rgb(158, 104, 0)` — **the frame's hover gold as the resting fill**, hover `marigold-text`. The frame's resting gold under white is 3.61:1 and fails AA; this is 4.74:1 and the hover 5.54:1. **Ruled by the owner, 2026-09-06 — question 4, option 1: it stays** |
| axe on D4b, 1440 and 390 | — | **zero violations**, colour-contrast included |
| S3c's tile in the grid | `marigold-tint` pill on `marigold-text` (`S3 :337`) | `rgb(255, 244, 214)` on `rgb(138, 97, 0)` — **unchanged**, as its own frame draws it |

**The rest of the surface, re-run because two shell files and the token layer changed**

| Check | Result |
|---|---|
| create · the card · the cap | one row `("Untitled project", "untitled-project")`; the second attempt opened **D4b**; the grid grew S3c's tile |
| the capped Create button | `aria-disabled`, `aria-describedby="new-project-cap"` — the cap sentence still reads aloud as its reason |
| ☰ at 390 — focus on open | `document.activeElement` is the **DIALOG**, so nothing inside it is ringed (his finding 5 of the first test, still holding) |
| horizontal scroll at 390, dashboard and open sheet | **none** |
| axe-core 4.12.1, WCAG 2.0/2.1 A + AA — S3b, S3d's popover, D4a, D4b at 1440; the drawer and D4b at 390 | **zero violations on every one** |
| console CSP violations on the app host | **zero.** Two were recorded during the pass and both are located at `http://localhost:3000/` — the **marketing** page, which is **DW-18** and Story 1.4's header, not this story's. `curl -sI` on `/app/sign-in` returns `x-inflozo-policy: app-nonce` with `script-src 'self' 'nonce-…' 'strict-dynamic'`, locally and on `app.inflozo.com` alike |
| every fixture user | **deleted**; `projects` rows left behind: **0** |

**Re-executed against the deployed site.** The pass above drove a production build at `localhost`, which
is not the real infrastructure R-82 asks for, so every one of its checks was run again — the same script,
`BASE=https://app.inflozo.com` — against the published Fix commit.

| On `https://app.inflozo.com` | Result |
|---|---|
| CI on `95023994` (`GITHUB_TOKEN`) | `check: success` · `rls: success` · `deploy: success` |
| Vercel (`VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`) | `dpl_6gUut8sNChdVQL8DAyMB3Q2P4fTo`, state **READY**, built from `95023994` |
| the deployed shape | `/sign-in` **200** · `/` signed out **307** · `inflozo.com` **200** · `/sites` **404** — unchanged by this run |
| finding 1 — the doors | **3**: `Blank canvas` · `Start from a starter` · `Redesign one of my sites`; "Duplicate" absent from the sheet; the same three greyed with the plan pill at the cap |
| finding 2 — the chip | `F / <address>`, no `Free`/`Pro`, `scrollWidth <= clientWidth` **true**, **195px** in the 196px column; the menu's row reads `Billing & plan / Free` |
| finding 3 — the card | background `rgb(255, 253, 246)` · hairline `rgb(245, 227, 184)` · radius `12px` · padding `14px 16px`; the button `rgb(158, 104, 0)` on white, `38px`, radius `12px`, `13.5px`/`600`, padding-left `18px`. S3c's tile still `rgb(255, 244, 214)` on `rgb(138, 97, 0)` |
| axe-core — S3b · S3d's popover · D4a · D4b at 1440, the drawer and D4b at 390 | **zero violations on every one** |
| horizontal scroll at 390 | **none** |
| **console CSP violations** | **zero** — which also identifies the two the local pass saw as the marketing page's (DW-18), not the app's |
| every fixture user | **deleted**; `projects` rows left behind: **0** |

**The earlier fixes, re-run on the same deployment, because two shell files and the token layer changed
under them.** With a `pro_active` fixture, so the cap refused nothing.

| Earlier finding | Result today |
|---|---|
| ⋯ → **Duplicate**, now the only route to a copy | `("Untitled project","untitled-project")` + `("Copy of Untitled project","copy-of-untitled-project")` — two rows, two names, two slugs |
| the ⋯ menu itself | `Rename / Duplicate / Delete` |
| the delete confirm (his finding 2, first test) | opens on **Cancel**, title `text-align: center`, dialog at x=490 in a 1440 viewport, and the two buttons **199px each** — equal, as he asked |
| the ☰ drawer's outside tap (finding 4) | a click at (360, 400) with the panel open → `dialog.open` **false** |
| the phone's search focus (finding 7) | tapping the magnifier leaves `document.activeElement` as the field named **`q`** |
| the app's own error page (findings 3 and 8) | `app/(app)/app/error.tsx` present and unchanged |


### The third review — 2026-09-06, after the second Fix run

Five layers ran over the whole diff since the baseline (`db959b18..c7cab9eb`): Blind Hunter, Edge Case
Hunter, Verification Gap, Acceptance Auditor and the Real-infra verifier, the last against the **live
deployment** with keys read from `tools/probe/.env` by variable name and never printed. Every fixture user
was deleted at the end of each pass; the census afterwards is the owner's two accounts and nothing else.

**What the Real-infra verifier re-executed on the real services, before any patch**

| Claim | Result |
|---|---|
| CI on HEAD `c7cab9eb` (`GITHUB_TOKEN`, `GET /repos/Inflozo/inflozo/actions/runs?head_sha=…`) | `check: success` · `rls: success` · `deploy: success` — and the same on `95023994` and `15326a26` |
| production is HEAD (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`, `GET /v6/deployments?target=production`) | `dpl_6RiDathugApPubmVSJzVUdps7qPu`, **READY**, `githubCommitSha c7cab9eb`, aliases `inflozo.com` · `app.inflozo.com` · `www.inflozo.com` |
| `https://app.inflozo.com/` signed out · `/sign-in` · `https://inflozo.com/` · `/sites` | **307 → `/sign-in`** with `x-inflozo-policy: app-nonce` · **200**, `script-src 'self' 'nonce-…' 'strict-dynamic'` · **200**, `marketing-static` · **404** |
| two fixtures signed in through `/auth/confirm` on the app host | **303 → `/`**, session cookie set |
| S3b · the chip (whole address, no Free/Pro, nothing with `scrollWidth > clientWidth`) · the menu's `Billing & plan Free` row | held |
| D4a: three doors, "Duplicate" absent; create → `("Untitled project","untitled-project")`; the card; S3c's tile | held |
| D4b at the cap: the sentence, three pills, `Go Pro — $15/mo` at `rgb(158,104,0)` 38px radius 12, Create `aria-disabled` with `aria-describedby="new-project-cap"` | held |
| rename → `("Field Notes","untitled-project")` — slug untouched | held |
| **RLS, the negative control** — B's own JWT and the publishable key against A's project id | `GET` **200 []** · `PATCH` **200 []** · `DELETE` **200 []** · `POST` with A's `user_id` **403 42501**; the positive control, A's JWT on the same path → `200 [{id…}]` |
| delete: opens on **Cancel**; `field notes` → `aria-disabled`, a forced click leaves **1 row**; `Field Notes` → **0 rows**, S3b | held |
| axe-core 4.12.1 (WCAG 2.0/2.1 A+AA): S3b, S3d, D4a, D4b at 1440; S3a, the drawer, D4b at 390 | **zero violations each**; the control — an appended bare `<button>` — flagged `button-name` |
| horizontal scroll at 1440 and 390 (dashboard, drawer, sheet) · console CSP violations on the app host · console errors | none · **0** · none |
| `pnpm check` (Node 24) · `python3 tools/doc-audit.py --check` twice | exit 0, 63 tests pass · PASS both |

**The patches, executed before they were committed** — a production build of this tree (`next build`,
`next start -p 3005`; two stale servers from earlier sessions still held 3000 and 3001 and served old code,
which a first run against 3001 exposed) against the **real Supabase**, one fixture, every check with its
control where one exists.

| Patch | Executed | Result |
|---|---|---|
| double submit | `pro_active` fixture; three `requestSubmit()` on the sheet's form in one tick | **one** row. Control: two submits each after the last settled → **two more** rows. Before the ref, the same three calls made **three** rows — the `pending`-only first draft of this patch failed this exact check |
| `raced` spent on close | page at 0 projects, a row inserted by REST from "another tab", Create → `at_cap`, the sheet flipped to D4b; Escape; the row deleted through the UI; New project again | the sheet is **D4a** again — Create live, no `[role=button][aria-disabled]` |
| rename field reset | type "Abandoned", Cancel, reopen; clear, Save (refused with the hint), Cancel, reopen | the field reads **`Untitled project`** both times and no hint remains |
| ⋯ toggle and the scroll listener | click ⋯ (open, focus on Rename), click ⋯ again; open, Escape, then scroll; open, scroll | **closed** · no page error, still closed · the control: a scroll with the menu open still closes it |
| ⌘K under a menu | ⋯ open, Ctrl+K | the menu **stays open** and the field is not focused; the control: Ctrl+K with nothing open focuses `q` |
| account popover closes on a row | click the chip, click Account settings with navigation held back so the shell stays | `#account-menu` **not** `:popover-open` |
| CSP · console · teardown | the whole pass | **0** violations, no errors; the fixture and its rows deleted; census: 2 users, 0 fixtures |
| `story-board.py` self-check | a copy of the script with `demo()` raising `KeyError` | exit **2**, last stderr line `story board: SELF-CHECK FAILED — KeyError: 'fixture-missing'` |
| the pure patches | `pnpm check` after every edit | lint, typecheck and 63 tests green; `tsc --noEmit` clean on `proxy.ts`'s import of `isApp` |

**Re-executed against the deployed site.** The Review commit `85adbf47` was pushed, CI published it, and the
same script — `BASE=https://app.inflozo.com` — was run again, because the local build is not the real
infrastructure R-82 asks for.

| On `https://app.inflozo.com` | Result |
|---|---|
| CI on `85adbf47` (`GITHUB_TOKEN`) | `check: success` · `rls: success` · `deploy: success` |
| Vercel (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`) | `dpl_S2Vqh8EsTq2VwMaY3rZZr7oVKEbG`, state **READY**, built from `85adbf47` |
| the deployed shape | `/` signed out **307 → `/sign-in`** · `inflozo.com` **200** — unchanged |
| double submit · `raced` spent · rename reset · ⋯ toggle and scroll · ⌘K under a menu · popover closing on a row | **every check PASS, every control PASS** — the same lines as the local table above, on the published build |
| CSP violations · console errors | **0** · none |
| the fixture user | **deleted**; `projects` rows left behind: **0**; census: the owner's two accounts, no fixtures |

The story stays **in review**: Deploy and the owner's own test follow, and Done is written on his word (R-80).

## Questions for the owner

**1. When you press Tab through the dashboard, your account chip is reached with the left column rather than last. Is that right?**

Your story's test script lists the keyboard order as *left column → search box → New project → a card's ⋯ →
your account chip*, with the chip last. What the built page actually does is *Inflozo → Projects → Sites →
Assets → your account chip → search box → New project → ⋯*. The chip comes at the end of the **left column**
because that is exactly where it sits on the screen — the bottom of that column — and the Tab key follows
what your eye follows.

*Example:* sign in and press Tab five times. The fifth press lands on your initial at the bottom left,
because you have just walked down that column — Inflozo, Projects, Sites, Assets, then your account. The
sixth press crosses to the top bar and lands in the search box. To make the chip come last instead, it
would have to be lifted out of its natural place in the page's order and forced to the end, which is the
one trick accessibility guidance tells you not to use, and it would leave the Tab order no longer matching
the picture on screen.

1. **Leave it as built — the chip is reached at the bottom of the left column, before the search box. (RECOMMENDED)** — Tab follows the screen, top to bottom and left to right, so nothing jumps around; it keeps the accessibility check clean, and it is what apps with a left column normally do.
2. Force the chip to come last, after the cards — your written order is honoured to the letter, but the Tab order stops matching the picture and the page has to carry the one technique accessibility guidance warns against.
3. A different order — tell me the order you want and it is changed inside this story.

Nothing is blocked by this: the dashboard is built, deployed and working either way. It is here because
the decision belongs to you, and options 2 and 3 are each a small change inside this same story.

**Ruled (owner, 2026-09-05): option 1 — "Leave it as built — the chip is reached at the bottom of the left
column, before the search box."** No code changes: the Tab order stays `Inflozo → Projects → Sites → Assets
→ account chip → search → New project → ⋯`, which is document order and therefore screen order (WCAG 2.4.3),
and no positive `tabindex` enters the app. The matrix's Keyboard row keeps its written order as the reading
it was given; this ruling is the record of what the built page does instead, and the two agree on everything
else in that row.

**2. On your phone there are two of your initial — one in the top bar and one at the bottom of the ☰ drawer. Which one should go?**

You are right that it looks like a duplicate, and both are drawn that way in `S3 Dashboard.dc.html` — the
phone frame puts your initial at the top right, and the "menu open" frame puts your initial, email and Free
tag at the bottom of the drawer. They are not the same control, though, and that is the catch: **the one in
the top bar is the only way to reach Account settings, Billing & plan, Suggestions, Docs and Sign out on a
phone.** The one in the drawer is a label — it shows who you are and nothing opens when you tap it. So
removing the top-bar one on its own would take Sign out off your phone entirely.

*Example:* today, on your phone, tapping ☰ shows Projects · Sites · Assets and your initial at the bottom
(nothing happens if you tap it), and tapping your initial at the top right drops down the menu with Sign out
in it. With option 1 the top bar keeps ☰, "Inflozo" and the search icon only, and your initial at the bottom
of the drawer becomes the thing you tap for that menu — one initial on the screen, and Sign out two taps away
instead of one.

1. **Move the menu into the drawer: no initial in the top bar, and the one at the bottom of the drawer opens the account menu. (RECOMMENDED)** — one initial on the phone, which is what you asked for, and nothing is lost: everything in that menu is still reachable, just from inside ☰. It is how most phone apps with a ☰ drawer do it.
2. Keep both as the frames draw them — the top-bar initial opens the menu, the drawer one stays a label. Nothing changes.
3. Remove the initial, email and Free tag from the bottom of the drawer instead, and keep the top-bar one as the menu — also one initial, and Sign out stays one tap away, but the drawer loses the line that tells you which account you are in.

This one is yours because it moves the phone away from the frames, and the export is the design authority
(R-74) until you say otherwise. Whichever you choose is a small change inside this story.

**Ruled (owner, 2026-09-05): option 1 — "Move the menu into the drawer — no initial in the top bar, the
drawer's bottom avatar row opens the account menu."** With three further instructions in his words:
*"Claude design should have this in. I want to show the full name (if available) else email in the bottom
avatar row. Right now the email is clipped and shows three dots. Remove Free label from the row as we are
already showing it in the menu that opens along with Billing and Plan row."*

What that binds, for the Fix run:

- **At 390 the top bar is ☰ · "Inflozo" · the search icon, and nothing else.** The 32px avatar and its
  dropdown leave the top bar entirely; `AccountMenu`'s `topbar` variant becomes the drawer's, triggered by
  the account row at the bottom of the ☰ panel and opening **upward** from it, since that is now where it
  sits. Every destination in it — Account settings, Billing & plan, Suggestions, Docs, Sign out — stays
  reachable on a phone, two taps in rather than one.
- **The drawer's account row shows one line: `display_name` if there is one, otherwise the email, and it is
  not clipped.** No `truncate` and no `max-w-[100px]` on it; the row has the drawer's full 300px less the
  avatar to spend, and a long address wraps or shrinks rather than ending in an ellipsis. The **sidebar
  chip at 1440 is untouched** — it has 220px and the ellipsis there is the frame's own treatment.
- **The Free / ✦ Pro badge leaves the drawer row.** The menu keeps it, and because the owner names the
  Billing & plan row, the phone's menu now carries it there exactly as the desktop menu does, rather than
  in the menu header — one badge per menu, not two.
- **This overrides the frames for the phone, and deliberately.** `S3 · mobile · 390` draws the avatar in
  the top bar and `S3 · mobile — menu open` draws the account row with its badge in the drawer; the owner
  has ruled otherwise and this spec is the record of it. **The export itself is not edited** — it is the
  design authority under R-74 and is never touched by a story. Redrawing these two frames to match is a
  design pass of its own and is not this story's; say the word and it is scheduled separately.

**3. You asked to take "Duplicate an existing project" out of the New project window. Should it stay out for good — including in the later story that finishes that window?**

It is out of this story either way: the door goes, and duplicating stays where you said it belongs, on a
project card's ⋯ menu. The open bit is **Story 13.6**, the story whose whole job is to finish that window.
It is written today as *"all four creation paths"* — Starter · Blank canvas · Duplicate · Redesign — with a
little picker inside the Duplicate door for choosing which project to copy. If nothing is said, that story
will put the door back.

*Example:* today the window lists four choices and three are greyed out. After this fix it lists three —
Blank canvas (the one that works), Start from a starter, and Redesign one of my sites. When Story 13.6 is
built, months from now, it either keeps listing three or goes back to four, and this is the moment to say
which.

1. **Out for good — three doors, and duplicating lives only on a project's ⋯ menu. (RECOMMENDED)** — one
   way to do one thing, which is what you said; the window is shorter and the choice is easier; and
   Story 13.6's wording is corrected now, while it is cheap, instead of the door quietly coming back.
2. Out of this story only — Story 13.6 puts it back with its project picker, as the design draws it. The
   window you see today is tidier, but the same complaint returns when 13.6 lands.
3. Something else — tell me and it is written down.

Whichever you pick, the design file is **not** edited: the drawing keeps four doors and this spec is the
record that you ruled otherwise (R-74). Nothing is blocked by this question — the Fix run can start now.

**Ruled (owner, 2026-09-06): option 1 — "Out for good — three doors, duplicating only on a project's ⋯
menu."** Recorded as standing ruling **R-93** in `reconcile-designs-decisions.md` §A18, because it changes
what a surface *does* and therefore belongs to the PRD rather than to a story (build-sequence standing
rule 6: the PRD decides behaviour, the export decides what a surface is built from).

What it binds:

- **This story removes the door.** `DOORS` in `new-project-sheet.tsx` loses `Duplicate an existing
  project`; the sheet lists **Blank canvas** (live, selected), **Start from a starter** and **Redesign one
  of my sites**, each greyed with its reason as before. At the cap the same three carry the plan's pill.
  Nothing else about the sheet changes.
- **Duplicating is not lost and is not moved.** It is already on a project card's ⋯ menu, built and tested
  in this story, and that is now its only entry point — which is the owner's reason: *"they can directly
  click on the three dots menu of a project and click duplicate."*
- **Story 13.6 does not put it back.** Its heading, its acceptance criteria and its frame line in
  `epics.md` are amended to name the paths FR-B2 names and to say in as many words that D4a's fourth door
  and the project picker inside it are deliberately not implemented.
- **FR-B2 is amended, and it is the reason this needed a ruling rather than a fix.** The PRD listed
  Duplicate as one of the creation paths, so removing the door alone would have left an approved decision
  contradicting the built product — the case standing rule 6 says to stop and ask on. FR-B2 now names the
  paths this surface offers and states where duplicating lives instead; FR-B3, which is where the ⋯ menu's
  duplicate was defined all along, is untouched.
- **The export is not edited.** `D4a` and `D4b` keep four doors, `EXPERIENCE.md` Appendix A keeps the
  prompt they were drawn from exactly as it was run, and `ux-designs/prototype/` keeps showing the drawn
  frame — all three are records of the design, and the design is unchanged. R-93 is the record that the
  product diverges from it here, deliberately.

Propagated the same day: `prd.md` FR-B2 and §8 E13 · `epics.md` FR-B2 and Story 13.6 · `EXPERIENCE.md`
§ Information Architecture · this spec's Boundaries · `reconcile-designs-decisions.md` §A18.

**4. The Go Pro button on the "Free includes 1 project" card: the design's exact gold is a shade too light to read as white text. Which do you want?**

You asked for the upgrade card to be as prominent as the design draws it, and it now is — the warm cream
card, the hairline, and a solid gold button instead of the pale pill. One thing had to give by a hair.
The design paints that button in a gold that, with white writing on it, is **3.6 times** lighter-to-darker.
The accessibility standard this project is built to asks for **4.5**. Below that, some people genuinely
cannot read the words — and the automatic check this story runs on every screen would report it as the one
failure on an otherwise clean dashboard.

The design already contains a second, slightly deeper gold: the shade the same button turns when you hover
your mouse over it. That one measures **4.7** and passes. The button on the live site is that shade now,
and it darkens once more when you hover.

*Example:* put the two side by side and they are the same gold — one is a touch richer, the way a colour
looks in shade rather than in sun. Nobody would spot the difference without the two together; the check
does, and so would a customer reading it on a phone in daylight.

1. **Keep it as built — the design's own deeper gold, which passes. (RECOMMENDED)** — the card looks like
   the design, the check stays clean, and every customer can read the button. Both shades are the
   designer's own, so nothing has been invented.
2. Use the design's exact gold and accept the failure — the button is a hair lighter, and this story's
   accessibility check reports one violation from now on, which every later story inherits.
3. Something else — name a gold, or ask for the button in another colour entirely, and it is changed
   inside this story.

Nothing is blocked by this: the card is built, deployed and working. It is here because a design value and
an accessibility floor genuinely disagree, and that is yours to settle rather than mine (standing rule 6).

**Ruled (owner, 2026-09-06): option 1 — "Keep it as built — the design's own deeper gold, which passes."**
**No code changes**, because the deployed button already wears it: `marigold-solid` stays `#9E6800` at rest
and `marigold-text` on hover, both the frame's own values, and D4b's card is otherwise the frame's exactly.
The record of the departure lives in the token layer beside the value, in `DESIGN.md`'s `colors.*` entry, in
this spec's Boundaries and in Design Notes; **`D4 Dashboard Sheets and Blocks.dc.html` is not edited** — it
is the design authority (R-74) and a story never touches it.

**What this ruling does NOT yet decide.** It settles this button. The same collision — a frame's colour that
measures below 4.5:1 where it carries words — will recur in later epics, and whether "take the frame's own
nearest passing shade" becomes a standing rule for all of them is a separate decision and is not made here.
Until it is, a later story meeting the same fork stops and asks, as this one did.

**5. Your account row will show a name above and the email below — but there is no name yet. What should the top line say until you can type one?**

You asked for the row to read like `S3b`: the name in bold on top, the email very small and grey under
it, and the Free/Pro tag at the end. `S3b` draws it with **Maya Chen** on top and
`maya@orbitweekly.com` under — but Maya is the fixture, and the place where a real person types their
name is **Account settings**, which **Epic 2** builds. Nothing in the product sets it today, so the top
line has nothing of yours to put in it. That is also why the row currently shows your address on the
one line: there was only one thing to show.

*Example:* signed in as `you@example.com` with no name saved, option 1 shows a single small grey
`you@example.com` beside your initial with **Free** at the end, and the bold line appears the day Epic 2
lets you save "Umang". Option 2 shows **You** on top with `you@example.com` under it. Option 3 shows
**You@example** — the part before the @, capitalised — on top with the full address under it.

1. **No stand-in: until Epic 2, the row is your initial, your email on the small grey line, and the Free tag — and the bold name line appears by itself the day you save a name. (RECOMMENDED)** — nothing invented, nothing to undo later, and your address is shown whole rather than cut. It is `S3b`'s row with the line that has no content yet simply not drawn.
2. The words **"Your account"** on the bold line until you save a name, with the email small underneath — `S3b`'s exact two-line shape from day one, at the cost of a line that says nothing about you.
3. The part of your address before the @, capitalised, as a stand-in name — `Umngkmr` for yours, `Info` for `info@acme.com`. Two real lines, but the top one can read like nonsense.

Whichever you pick: the **Free / ✦ Pro tag comes back to the end of the row** in both places, as you
asked, and the email line is given the whole width the row has rather than the frame's 100px cap, so a
long address shrinks or wraps instead of ending in three dots. The phone's top bar is untouched — ☰,
Inflozo and the search icon, with the account row inside ☰ — which is your ruling of 2026-09-05.

**6. Sign out: a "are you sure?" popup first, or just tell you it is working?**

Your words were *"no message or confirmation popup … no idea whether they are actually signing out"*,
which can mean either of two things, and they are different products. The slowness underneath it is a
defect either way and is being fixed with finding 3 — the button today gives no sign at all while it
waits, which is what makes the wait feel broken.

*Example:* you click Sign out. Option 1: the row immediately reads **"Signing out…"** and greys, and the
sign-in screen you land on says **"You've been signed out."** at the top. Option 2: a small window asks
**"Sign out of Inflozo?"** with Cancel and Sign out first, then the same. Option 3: only the
"Signing out…" state, and the sign-in screen looks exactly as it does today.

1. **Tell you it is working, and confirm it happened: "Signing out…" on the button, then "You've been signed out." on the sign-in screen. No extra click. (RECOMMENDED)** — it answers "is anything happening?" without making you click twice every time; signing out by accident costs one magic link, so a guard rail is not worth the friction.
2. Ask first — a confirm window, then the same two messages. Safest against a mis-tap on a phone, one extra tap every time.
3. Just "Signing out…" and nothing on the sign-in screen — the smallest change, but nothing tells you it finished rather than failed.


## Owner's manual test

Your account is on the Free plan, so you will see the Free side of every screen — the one project, the
polite refusal of a second, the Go Pro pill. The Pro side (up to 25 projects, duplicate succeeding) is
proved by the Dev run with a throwaway account and recorded above; say the word if you would like your
own account switched to Pro for a look — it is one row, and it is switched back the same way.

**Your three findings of 2026-09-06 — what changed, and what to look at this time.**

| Your finding | What to do | What you should see |
|---|---|---|
| 1 · the New project window | Click "New project" on your computer | **Three** choices, not four. "Duplicate an existing project" is gone for good, and duplicating is on a card's ⋯ menu where you said it belongs. The other two greyed doors and their reasons stay — the starters are Epic 11 and connecting a site is Epic 3 |
| 2 · the email cut off in the left column | Look at the bottom left of the dashboard | Your **whole email address**, not cut off with three dots, and **no "Free" tag beside it**. The tag has moved inside — click the row and it is on the "Billing & plan" line, exactly as it is on your phone |
| 3 · the upgrade card | Create a project so you are at your limit, then click "New project" | The card behind the choices is now a **warm cream card with a solid gold "Go Pro — $15/mo" button**, instead of the pale pill it had. Nothing it does has changed — it was always refusing the second project and always said why; it now looks the way the design draws it. The exact shade of that gold was question 4, and **you ruled on it — the deeper gold stays**, so there is nothing further to look at here |

**Your earlier eight findings — what changed, and what to look at.** Numbered as you wrote them, not
as the steps above. Finding 1 needed no change and is answered under `## Owner's test findings`.

| Your finding | What to do | What you should see |
|---|---|---|
| 2 · the delete window | ⋯ → Delete on a card, on your computer and on your phone | The red bin in a pink disc at the **top, centred**, the title and sentence centred under it, and two equal buttons instead of a small pair in the corner |
| 3 and 8 · the error page | Delete a project a few times, with and without something typed in the search box | The card goes and the empty dashboard comes back, every time. **If anything ever does go wrong now you will see Inflozo's own page** — "We couldn't show that just now.", a red "Try again" and a link back — instead of the bare browser error. Tell me if you see it, and what you had just done |
| 4 · tapping outside the menu | On your phone, tap ☰, then tap the greyed area to the right | The panel closes. Tapping inside it does not |
| 5 · the box around the logo | On your phone, tap ☰ | No box, ring or outline around "Inflozo" or anything else in the panel |
| 6 · two initials | On your phone, look at the top bar, then tap ☰ | **One** initial now, at the bottom of the ☰ panel, and tapping it opens your account menu. The top bar has ☰, "Inflozo" and the search icon only. Your whole email is on that row, not cut off, and the "Free" tag has moved to the Billing & plan line inside the menu |
| 7 · the search icon | On your phone, tap the search icon | The box appears with the cursor already in it |

**Six links are expected to show "not found" today, and that is not a fault:** Sites and Assets in the
sidebar, and Account settings, Billing & plan, Suggestions and Docs in your account menu, plus the Go
Pro pill. Each is drawn and linked now so the shell is complete; their own epics fill them in. If you
would rather not see them until then, say so in your findings and it is changed in this story.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://app.inflozo.com/ | Dashboard, empty (S3b) | Sign in with your magic link as in 1.4 | — | Instead of the holding page: a left column with "Inflozo", Projects (highlighted), Sites, Assets, and at the bottom a round initial with **your whole email beside it and no "Free" tag** (your finding 2); a top bar with a "Search projects…" box and a red "New project" button; in the middle a small sketch of a page and "Every great site starts somewhere. Yours starts with hundreds of gorgeous sections." with a second red "New project" |
| 2 | same | Dashboard | Click Sites, then Assets, then use the browser's Back | — | "This page could not be found" for both — expected until Epics 3 and 8 |
| 3 | same | Account menu (S3d) | Click your initial at the bottom of the left column | — | A menu opens upward: your initial and email, then Account settings, Billing & plan (with a "Free" tag — **this is where the tag lives now**), Suggestions, Docs, a line, Sign out. Press Escape to close it |
| 4 | same | New project sheet (D4a) | Click "New project" | — | A white sheet over a dimmed dashboard: "New project", **three** choices — Blank canvas is selected; Start from a starter and Redesign one of my sites are greyed with a short reason under each. **"Duplicate an existing project" is gone** (your finding 1); below, "Style Pack" with one card, Paper; Cancel and a red "Create project" |
| 5 | same | Dashboard (S3a) | Click "Create project" | — | The sheet closes and one card appears: a small wireframe on cream, "Untitled project", a "Sample content" tag and "Updated today" on the right |
| 6 | same | At the cap (S3c · D4b) | Click "New project" again | — | The sheet opens with all **three** choices greyed, each with a "Free includes 1 project" pill, and a **cream card** saying "Free includes 1 project. Pro gives you 25." with a **solid gold "Go Pro — $15/mo" button** on it (your finding 3), and "Create project" greyed out. Press Cancel. Beside your card the grid still shows the dashed tile: ✦, "Upgrade to add more", the same sentence, and there the pale pill, because that is what its own drawing has |
| 7 | same | Rename | Click the ⋯ on the card → Rename | `Field Notes` | A small window "Rename project" with the name in a box; type the new name, press Save; the card now says "Field Notes" and still "Updated today" |
| 8 | same | Rename, refused | ⋯ → Rename, clear the box, press Save | (empty) | The box goes red with "Give it a name — up to 80 characters." and nothing is saved; Cancel |
| 9 | same | Duplicate at the cap | ⋯ → Duplicate | — | The same "Free includes 1 project" sheet as step 6 — a copy would be a second project. Cancel. **This is now the only way to duplicate, which is what you asked for** |
| 10 | same | Delete (redrawn on your word) | ⋯ → Delete | first `field notes`, then `Field Notes` | A window with a **red bin in a round pink disc at the top, centred**, "Delete Field Notes?" and "This project will be permanently deleted. This cannot be undone." centred under it, then "Type Field Notes to confirm", then **two equal buttons**, Cancel and a red Delete project. The cursor starts on Cancel. With `field notes` the red button stays faded and does nothing; with `Field Notes` exactly it goes solid, and pressing it removes the card — you are back on the empty dashboard |
| 11 | same | Search | Create a project again (steps 4–5), rename it `Harbour Letter`, then type in the search box and press Enter | `harb` · then `zzz` | With `harb` the card stays; with `zzz` the grid says "No projects match “zzz”." Clear the box and press Enter to see the card again. ⌘K (Ctrl+K on Windows) jumps the cursor into the box |
| 12 | same, on your phone | Dashboard at 390 | Open the address on your phone | — | A short top bar: ☰, "Inflozo" and a search icon — **and no initial beside it any more**; a full-width red "+ New project"; your card below it, one per row; nothing cut off, nothing scrolling sideways |
| 13 | same, phone | Drawer | Tap ☰ | — | A white panel slides in from the left with Projects, Sites, Assets, and at the bottom your initial with **your whole email address beside it, not cut off with three dots** and no "Free" tag; an ✕ to close. Nothing on the panel has a box drawn around it when it opens |
| 14 | same, phone | The account menu, now inside ☰ | Tap ☰, then tap your initial at the bottom of the panel | — | The same menu as step 3 opens **upwards from that row**: your initial and email, Account settings, Billing & plan **with the "Free" tag**, Suggestions, Docs, a line, Sign out |
| 15 | same, phone | Closing the panel | Tap ☰, then tap the greyed area to the right of the panel | — | The panel closes. Tapping inside it does not close it |
| 16 | same, phone | Sheet and delete | Tap "+ New project", Cancel; then ⋯ → Delete on your card, Cancel | — | Both windows fill the width with a small margin and every button is reachable; the delete window's bin, title and two buttons are centred as in step 10 |
| 17 | same, phone | Search | Tap the search icon in the top bar | — | The search box appears under the bar **with the cursor already in it** and the keyboard up — you can type straight away |
| 18 | same | Sign out | Open the account menu (the chip at the bottom left on a computer, or ☰ → your initial on a phone) → Sign out | — | The Sign In card from 1.4 |

## Owner's test findings

You tested the deployed dashboard on `app.inflozo.com` on 2026-09-05. **The findings arrived on Story
1.4's prompt and they are this story's** — every one of them names a screen from the table above: your
"Step 4" is step 4's New project sheet, the delete window is step 10, and the rest are steps 12 to 14 on
your phone. Story 1.4 is the magic link, and you passed and closed it the day before. Recorded here, in
your words:

1. **"Step 4: The New Project modal does not match the one created in Claude Design? Is it expected? Will
   it be worked upon in future stories."** — *Mostly expected; the one part that is not is named below.*
2. **"The Delete Project Popup needs a better design. With the icon in top center. And overall better
   visuals."**
3. **"After deleting I got error: This page couldn't load. Reload to try again, or go back. Url:
   https://app.inflozo.com/?q=test"**
4. **"On mobile devices, clicking outside the sidebar menu should close it."**
5. **"On mobile devices, opening the sidebar menu, focuses the logo and shows a focus border around it
   which does not looks good."**
6. **"On mobile devices, there are two avatr user menu. One in sidebar and another in header right. Can we
   remove the header avatar."** — *this one takes the only route to Sign out on a phone with it, so it was
   asked as question 2 above; ruled on 2026-09-05 — the menu moves into the drawer.*
7. **"On mobile devices, when we click search icon, the focus should be added to the search box."**
8. **"Sometimes, after deleting a project I get an error: This page couldn't load. Reload to try again, or
   go back. URL: https://app.inflozo.com/"**

**Finding 1 — what is expected, and what is not.** `D4a` draws four doors with **Start from a starter**
first and selected, a project picker sitting inside the Duplicate door, a "Connect a site" button on the
Redesign door, and three Style Pack cells — Paper, Tangerine and "+ New pack". The built sheet has **Blank
canvas** as the one live door and the other three greyed with their one-line reason, and a single Paper
cell. **Every one of those differences is deliberate and is in this spec's Boundaries**, because there is
nothing behind those doors to open yet: the ten starters are Epic 11, the whole four-path sheet with its
project picker is **Story 13.6**, connecting a Ghost site is Epic 3, and a second Style Pack and the pencil
that edits one are Epic 6. The frame draws the finished product; this story draws the same sheet with only
the door that works. **So yes — future stories fill it in, and D4a's own caption is the reason all four
stay on screen rather than being hidden.**

The one difference that is *not* the frame's instruction is the **order**: the frame puts "Start from a
starter" first and "Blank canvas" second, and the build puts the only usable door first. That was a choice
made when this story was written, not the frame's. Say the word and it goes back to the frame's order
inside this story.

**Findings 3 and 8 are the same defect** — a project deleted, and the page that comes back throws instead
of rendering; the `?q=test` in one of the two URLs says the search term surviving the delete is part of it.
The bare grey page you saw is the second half: the `(authed)` group has no `error.tsx`, which is already
written down as **DW-17**, so anything that throws inside the shell replaces the whole screen instead of
showing a sentence inside it. The Fix run owns both halves — the throw first, then the boundary.

**Findings 2, 4, 5 and 7 are plain defects of this story** and need no ruling from you: the delete window
is an extrapolation with no frame of its own, so its icon can move to the top and centre; the ☰ drawer is a
native modal that does not close on an outside tap unless it is told to; the drawer hands focus to the first
thing in it, which is the wordmark; and the phone's search field is focused a beat too early to take it.

### What the Fix run did, 2026-09-05 — one line each

| Your finding | What was done |
|---|---|
| 1 · the New project sheet | **No change, and none is due here.** The greyed doors and the single Paper card are this story's deliberate state; Epic 11 (starters), Story 13.6 (the whole four-path sheet), Epic 3 (connect a site) and Epic 6 (packs and the pack editor) fill them in. The one thing that is this story's — the frame puts "Start from a starter" first and the build puts Blank canvas first — is left as built because you did not ask for it; say the word and it is one line |
| 2 · the delete window | Redrawn centred: a 52px pink disc with the bin **above** the title, title and sentence centred under it, the typed-name label centred, and two equal 44px buttons. Rename is deliberately untouched |
| 3 and 8 · the error page | The app now has its own error page (`app/(app)/app/error.tsx`), so the bare browser one is unreachable from anything under `app.inflozo.com`. **The throw itself was not reproduced** — eight delete cycles on the live site and two local builds, with and without a search, plus your own step 2 (Sites → Back) and a deliberate fuzz of every dialog, all clean. What you saw is Next's own page for an uncaught browser error, and it appeared because nothing was there to catch it (DW-17). If it happens again, you now see Inflozo's page and a "Try again" — tell me what you had just done |
| 4 · tapping outside ☰ | A tap on the greyed area closes the panel; a tap inside does not. The confirms and the New project sheet deliberately do **not** get this — a delete window a stray tap dismisses is the thing typing the name exists to prevent |
| 5 · the ring on the logo | The panel itself takes the focus when it opens, so nothing inside it is ringed, and Tab still walks into it |
| 6 · two initials | Your ruling, built: no initial in the top bar, the drawer's row opens the menu upwards, the whole address on that row unclipped, and the Free tag moved to the Billing & plan line |
| 7 · the search icon | The box is focused by appearing rather than chased a frame later, so the cursor is in it and the keyboard is up |

**One thing found while hunting findings 3 and 8, and it is not this story's.** The public home page at
`inflozo.com` loads and looks right, but none of its code runs — the security header the site sends blocks
it, and the browser records an error behind the scenes. Nothing on that page needs code today, so nothing
is visibly wrong; the moment a button or a form goes on it, that button would not work. Recorded as
**DW-18** with the evidence. The header is Story 1.4's and the marketing pages are Epic 14's, so it is
fixed there rather than inside a story about the dashboard.

### The owner's second test — 2026-09-06, three findings

He tested the redeployed dashboard on `app.inflozo.com` on 2026-09-06, after the Deploy commit `402ef996`.
Read against the live database at the time of writing: his account is **Free with one project**
(`Untitled project`, created 2026-09-06 00:56 UTC), so it is **at the cap right now** — which matters to
finding 3 below. In his words:

1. **"The New Project popup is different than what Claude Design has in S2a · onboarding screen. Is it
   expected and is part of another story? If now, we need to fix it. Remove option of 'Duplicating a
   project' as they can directly click on the three dots menu of a project and click duplicate."**
2. **"The avatar row in sidebar of desktop still cuts off the email and show FREE. I want to remove the
   Free/Pro plan and show full email. Just like we have in mobile."**
3. **"When project limit is exhausted make necessary changes in the New Project popup - disable creations
   and show the message why. Also add a prominent card to upgrade."**

**Finding 1, first half — the frame he compared it to is not this window's frame, and that is the whole
answer to "is it expected".** `S2a` is the **First Run** screen in `S2 Onboarding.dc.html`: a full page, not
a popup, headed "Let's make your Ghost site gorgeous." with three large cards — *Connect your Ghost site*
(marked Recommended), *Start from a starter*, *Blank canvas*. The New project window's frame is **`D4a`**
in `D4 Dashboard Sheets and Blocks.dc.html`, which EXPERIENCE.md § Onboarding records as having been drawn
*from* S2a plus B23a but is its own frame with its own four doors. So the built window is not meant to
match S2a and never was. Measured against **D4a**, the differences are the ones already recorded above
after his first test and each is another story's: the ten starters are **Epic 11**, the Duplicate door's
project picker and the finished four-path window are **Story 13.6**, the Redesign door's "Connect a site"
button is **Epic 3**, and the second Style Pack cell and the pencil that edits one are **Epic 6**. None of
those is fixed here.

**Finding 1, second half — removing the Duplicate door is this story's, and it overrides the frame.** The
door is four lines of `DOORS` in `new-project-sheet.tsx`; taking it out is a deletion, not a build. What it
costs is not code: **D4a's own caption is a design instruction** — *"All four doors stay drawn and each
carries its reason. A door the customer can't open is still information about the product."* — and rulings
R-33 and R-68 say the same thing generally (greyed with the reason, never hidden). The owner has ruled
against it for this door, which is his to do; the record of the override lives here and **the export is not
edited** (R-74). The one thing genuinely still open is whether **Story 13.6**, whose acceptance criteria say
"all four paths" and draw a project picker inside the Duplicate door, keeps it out too — asked as
question 3 above. It does not block the Fix run.

**Finding 2 — this story's, and the smallest of the three.** The sidebar chip at 1440 was deliberately left
as the frame draws it when the phone's row was fixed on his last ruling: `account-menu.tsx` truncates the
name slot (which holds the email until Epic 2 sets a display name) and puts the plan badge at
`margin-left:auto`. He now rules the other way for the desktop too. Removing the badge gives the row back
roughly the width the badge was taking, which is what was pushing the address into an ellipsis, and the
drawer's treatment — the whole address, wrapped rather than cut — is already written next door and is what
this row becomes. The **plan badge is not lost**: the menu the chip opens carries it on the Billing & plan
row, exactly as the phone's does since his last ruling.

**Finding 3 — already built and already executed, with one part genuinely weaker than the frame.** Every
behaviour he asks for is on the live site today and is in `## Verification` above: at the cap the window
opens as **D4b** with all four doors greyed and a `Free includes 1 project` pill on each, no Style Pack row,
the block reading `Free includes 1 project. Pro gives you 25.` and `Your project stays exactly as it is
either way.`, **Create project drawn disabled** with that sentence as its spoken reason, and the dashboard
grid carrying S3c's dashed **Upgrade to add more** tile beside his card. Since his account is at the cap as
this is written, pressing "New project" shows it now. Two readings of the finding are therefore possible —
he wrote it before creating his project and never reopened the window at the cap, or he saw it and did not
find it prominent enough — and **one concrete gap sits underneath both**: `D4b` draws the call to action as
a **solid gold button** (`#B87A00`, white text, 38px, radius 12, hover `#9E6800`) on a warm tinted card
(`#FFFDF6` on a `#F5E3B8` hairline), and the build draws a **marigold-tint pill on white**, deliberately, to
avoid a second gold button beside S3c's tile. Against the frame the built card is the quieter of the two,
which is exactly the complaint. The Fix run brings that card back to D4b — the frame's warm tint and the
frame's solid gold button — and no behaviour changes, because none of it is missing.

**What is NOT fixed in this story, and where it goes.**

| Not this story | Whose it is |
|---|---|
| The ten starters behind "Start from a starter" | **Epic 11** |
| The project picker inside the Duplicate door, and the finished four-path window | **Story 13.6** |
| The "Connect a site" button on the Redesign door | **Epic 3** |
| A second Style Pack cell, "+ New pack" and the pencil that edits one | **Epic 6** |
| The **First Run** screen S2a itself — three cards on first sign-in — which no story in `epics.md` owns | recorded as **DW-19**; a story has to claim it before Epic 3 or it is simply never built |

**One thing found while answering finding 1, and it is not a defect of this story.** `S2a` — the First Run
screen — is drawn in the export, is listed in `EXPERIENCE.md` § Onboarding, has a page of its own in both
prototypes, and **is named by no story in `epics.md`**: the searches find `S2b·1`, `S2b·2` and `S2c` owned
by Epic 3's stories and nothing anywhere claiming S2a. Recorded as **DW-19** rather than fixed, because
deciding whether a first-run screen exists at all — and which epic builds it — is a planning decision, not
a dashboard story's.

### What the second Fix run did, 2026-09-06 — one line each

| Your finding | What was done |
|---|---|
| 1 · the New project window | **The Duplicate door is gone**, on your ruling R-93 — three doors now, Blank canvas live and the other two greyed with their reasons. Duplicating is unchanged on a card's ⋯ menu, which is where you said it belongs and where this story had already built it. `epics.md`, the PRD's FR-B2 and Story 13.6 were amended the same day so the door does not quietly come back months from now. The drawing keeps four doors and is not edited (R-74) |
| 2 · the email cut off, and the "FREE" tag | **The left column's account row is now the phone's row**, at the sidebar's size: the whole address on one line, wrapped rather than cut, and no plan badge. The badge was taking exactly the width the address needed — removing it gave the row back 195px of the column's 196. The badge still rides the **Billing & plan** line inside the menu, in both places. The two rows are now literally one piece of code, so they cannot drift apart again |
| 3 · the upgrade card | **D4b's card, as D4b draws it**: the warm cream fill inside its gold hairline, and a solid gold 38px "Go Pro" button in place of the pale pill. Nothing it *does* changed — every behaviour you asked for was already live and is in `## Verification` — this was the card being quieter than its drawing. The dashboard tile beside your card keeps its pale pill, because that is what *its* drawing has. One thing was yours to settle and you settled it: **question 4, option 1** — the design's exact gold is 3.6:1 under white text where the accessibility floor asks 4.5:1, so the button keeps the design's own next shade down (4.7:1), which is what is deployed |

**Nothing else moved.** The delete window, the drawer, the search focus, the error page and the phone's
account menu are exactly as your first test left them, and every one was re-run in this pass.

### The owner's third test — 2026-09-06, three findings

He tested the redeployed dashboard on `app.inflozo.com` on 2026-09-06, after the Deploy commit
`8eb95cbf`. In his words:

1. **"Make the avatar menu like in S3b · dashboard — empty · 1440 for desktop and mobile. Name above and
   very small and subtle email below it. With FREE/Pro label at end. As earlier ruled, do not add avatar
   in top header in mobile. Keep that in the sidebar for both mobile and desktop."**
2. **"When I click Sign out, there is no message or confirmation popup. Also it takes a lot of time to
   sign out. User has not idea whether they are actually signing out or what is happening."**
3. **"Vercel is bom1::iad1::jr8ll-1788664244568-baa9745ff6be and and Supabase is in Germany.. That might
   add to latency so want to move vercel to Germany. Guide me step by step or if you can do that with API
   keys?"**

**Finding 1 — this story's, and it reverses this morning's ruling on purpose; one thing has to be settled
before it can be built.** `S3b`'s chip is `Maya Chen` at 13px/600 with `maya@orbitweekly.com` at 11px
ink-soft under it (`max-width:100px`, ellipsis) and a `Free` pill at `margin-left:auto` — read off the
frame, lines 223–241 of `S3 Dashboard.dc.html`. His finding 2 of earlier the same day took the badge off
and put the whole address on the single bold line, precisely because the badge was taking the width the
address needed; he now wants the frame's two-line row back, badge included, in both columns. The catch is
that **there is no name to put on the top line**: `profiles.display_name` is null until **Epic 2** builds
Account settings, so `nameOf()` returns the email and `secondLineOf()` returns null — restore the frame's
row literally and the bold line holds the address while the small line holds nothing, which is the
clipping complaint again. Asked as **question 5**. The rest of the finding needs no ruling and is
unchanged from his 2026-09-05 ruling: no avatar in the phone's top bar (☰ · Inflozo · search), the account
row at the bottom of the sidebar at 1440 and at the bottom of the ☰ drawer at 390, one piece of code.

**Finding 2 — two defects in one, and both are this story's.** *No feedback:* Sign out is 1.4's
`signOut` server action inside a plain `<form>` in `account-menu.tsx` with no pending state, so the menu
sits there looking untouched until the document is replaced — nothing says the click landed. What he
wants said, and whether a confirm window comes first, is **question 6**. *The wait:* `signOut()` awaits
`supabase.auth.signOut()`, which is a network round trip from the function to the Supabase auth server
**before** the redirect — and finding 3 is why that round trip is long. The two are one fix.

**Finding 3 — executed, not asserted, and he is right.** Read on 2026-09-06 from the two platforms'
own APIs with the keys in `tools/probe/.env`:

| Read | Result |
|---|---|
| Vercel `GET /v9/projects/{VERCEL_PROJECT}` | `serverlessFunctionRegion = "iad1"`, `resourceConfig.functionDefaultRegions = ["iad1"]`, `fluid: true`, `nodeVersion 24.x` |
| Vercel `GET /v2/teams/{VERCEL_TEAM_ID}` | `billing.plan = "pro"` |
| Supabase `GET /v1/projects` | project `Inflozo` → `region = "eu-central-1"`, `ACTIVE_HEALTHY` |

So every page render and every server action runs in **Washington DC** and reaches a database in
**Frankfurt** — one Atlantic crossing per query, and several per screen. The `bom1` in his header is only
the edge that received his request (Mumbai); `iad1` is where the code ran. Vercel's **`fra1` is
eu-central-1**, the same AWS region as the database, so the crossing disappears; the team is on **Pro**,
where the function region is a project setting rather than a fixed default, and it applies **on the next
deployment**, not retroactively. It is also nearer to him: Mumbai → Frankfurt is shorter than Mumbai →
Washington.

**This is the case the spine already anticipated, so it is a propagation and not just a switch.**
`ARCHITECTURE-SPINE.md` § Deferred says *"One region (`iad1`) until latency is a measured complaint"* —
this is the measured complaint. The Fix run therefore: measures the dashboard's server timing from the
live site before the change, sets the region, redeploys through CI, measures again, records both numbers
in `## Verification`, and **amends that spine line** with the date, the reason and the two figures.
Nothing about the deployment's shape changes — one region still, one deployment still serving both
domains.

