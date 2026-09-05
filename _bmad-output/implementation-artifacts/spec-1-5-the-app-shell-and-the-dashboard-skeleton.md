---
title: 'Story 1.5 — The app shell and the dashboard skeleton'
type: 'feature'
created: '2026-09-05'
status: 'in-review'
baseline_commit: 'db959b1817cc6313c204f18a9f9a56593038a7d9'
review_loop_iteration: 1
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
  `ProBadge` or `FreeBadge`. A **64px top bar** (`border-b line`, padding 0 24, gap 12): the search
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
  carries its reason.* Below a `line` rule (padding-top 18): **"Style Pack"** 12px/500 ink-soft with
  **"Change it any time, in any project."** 11px ink-soft at the right, and a three-column grid (gap 6)
  holding one cell — the kit's `PackCell` for **Paper**, active (the coral ring), "Ag" in Georgia,
  its three dots — with no pencil and no New pack cell (the pack editor is E6's). Footer: the kit's
  `Button` ghost 36 "Cancel" and `Button` coral 44 "Create project" (the frame's 14px/600 label).
- **D4b, at the cap**: the same sheet with **all four doors greyed** (gap 9), each carrying a pill at
  the right instead of a reason — **"Free includes 1 project"** 11.5px marigold-text on marigold-tint,
  `rounded-pill`, padding 3/10; no Style Pack row; between the doors and the footer the **upgrade
  block** — `border marigold-line`, `surface`, `rounded`, padding 14/16, gap 13: **"Free includes 1
  project. Pro gives you 25."** 13.5px/600 and **"Your project stays exactly as it is either way."**
  12px ink-soft-aa leading 1.5, with S3c's "Go Pro — $15/mo" pill at the right linking to `/billing`;
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
- Any token whose value greps nowhere in the export — the `avatar` colours, the door hexes and the
  D4b gold button are deliberately *not* new tokens (Design Notes); only `shadow-modal` is added.
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
| Land, no projects | signed in, zero rows | S3b: the shell, the illustration, the two sentences, "New project"; the account chip says Free | N/A |
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
- `apps/web/app/globals.css:80` + `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` front matter -- `--shadow-modal: 0 12px 40px rgba(28,27,26,.25)` and its `elevation.modal` twin (`tokens.test.ts:47` requires the value to occur in the export; D4a and S12c carry it). Nothing else is added — see Design Notes for every hex that was mapped to an existing name instead
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
   truncate. Found by looking at the 1440 screenshot.

## Design Notes

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

**Why the doors are drawn and not dropped.** D4a's own caption is a design instruction: *all four
doors stay drawn and each carries its reason.* The cut line makes three of them another epic's, so they
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
and are his to confirm in `**2. On your phone there are two of your initial — one in the top bar and one at the bottom of the ☰ drawer. Which one should go?**

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


## Owner's manual test` below.

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

## Owner's manual test

Your account is on the Free plan, so you will see the Free side of every screen — the one project, the
polite refusal of a second, the Go Pro pill. The Pro side (up to 25 projects, duplicate succeeding) is
proved by the Dev run with a throwaway account and recorded above; say the word if you would like your
own account switched to Pro for a look — it is one row, and it is switched back the same way.

**Six links are expected to show "not found" today, and that is not a fault:** Sites and Assets in the
sidebar, and Account settings, Billing & plan, Suggestions and Docs in your account menu, plus the Go
Pro pill. Each is drawn and linked now so the shell is complete; their own epics fill them in. If you
would rather not see them until then, say so in your findings and it is changed in this story.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://app.inflozo.com/ | Dashboard, empty (S3b) | Sign in with your magic link as in 1.4 | — | Instead of the holding page: a left column with "Inflozo", Projects (highlighted), Sites, Assets, and at the bottom a round initial, your email and a "Free" tag; a top bar with a "Search projects…" box and a red "New project" button; in the middle a small sketch of a page and "Every great site starts somewhere. Yours starts with hundreds of gorgeous sections." with a second red "New project" |
| 2 | same | Dashboard | Click Sites, then Assets, then use the browser's Back | — | "This page could not be found" for both — expected until Epics 3 and 8 |
| 3 | same | Account menu (S3d) | Click your initial at the bottom of the left column | — | A menu opens upward: your initial and email, then Account settings, Billing & plan (with a "Free" tag), Suggestions, Docs, a line, Sign out. Press Escape to close it |
| 4 | same | New project sheet (D4a) | Click "New project" | — | A white sheet over a dimmed dashboard: "New project", four choices — Blank canvas is selected; Start from a starter, Duplicate an existing project and Redesign one of my sites are greyed with a short reason under each; below, "Style Pack" with one card, Paper; Cancel and a red "Create project" |
| 5 | same | Dashboard (S3a) | Click "Create project" | — | The sheet closes and one card appears: a small wireframe on cream, "Untitled project", a "Sample content" tag and "Updated today" on the right |
| 6 | same | At the cap (S3c · D4b) | Click "New project" again | — | The sheet opens with all four choices greyed, each with a "Free includes 1 project" pill, a box saying "Free includes 1 project. Pro gives you 25." with a gold "Go Pro — $15/mo" pill, and "Create project" greyed out. Press Cancel. Beside your card the grid now shows a dashed tile: ✦, "Upgrade to add more", the same sentence, the same pill |
| 7 | same | Rename | Click the ⋯ on the card → Rename | `Field Notes` | A small window "Rename project" with the name in a box; type the new name, press Save; the card now says "Field Notes" and still "Updated today" |
| 8 | same | Rename, refused | ⋯ → Rename, clear the box, press Save | (empty) | The box goes red with "Give it a name — up to 80 characters." and nothing is saved; Cancel |
| 9 | same | Duplicate at the cap | ⋯ → Duplicate | — | The same "Free includes 1 project" sheet as step 6 — a copy would be a second project. Cancel |
| 10 | same | Delete (S12c-shaped) | ⋯ → Delete | first `field notes`, then `Field Notes` | A window "Delete Field Notes?" with a red circle, "This project will be permanently deleted. This cannot be undone.", and "Type Field Notes to confirm". The cursor starts on Cancel. With `field notes` the red Delete button stays faded and does nothing; with `Field Notes` exactly it goes solid, and pressing it removes the card — you are back on the empty dashboard |
| 11 | same | Search | Create a project again (steps 4–5), rename it `Harbour Letter`, then type in the search box and press Enter | `harb` · then `zzz` | With `harb` the card stays; with `zzz` the grid says "No projects match “zzz”." Clear the box and press Enter to see the card again. ⌘K (Ctrl+K on Windows) jumps the cursor into the box |
| 12 | same, on your phone | Dashboard at 390 | Open the address on your phone | — | A short top bar: ☰, "Inflozo", a search icon and your initial; a full-width red "+ New project"; your card below it, one per row; nothing cut off, nothing scrolling sideways |
| 13 | same, phone | Drawer | Tap ☰ | — | A white panel slides in from the left with Projects, Sites, Assets, your initial and email with the "Free" tag at the bottom, and an ✕ to close |
| 14 | same, phone | Dropdown | Tap your initial top-right | — | The same menu as step 3, dropping down from your initial, with the "Free" tag beside your email |
| 15 | same, phone | Sheet and delete | Tap "+ New project", Cancel; then ⋯ → Delete on your card, Cancel | — | Both windows fill the width with a small margin and every button is reachable |
| 16 | same | Sign out | Open the account menu → Sign out | — | The Sign In card from 1.4 |

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
