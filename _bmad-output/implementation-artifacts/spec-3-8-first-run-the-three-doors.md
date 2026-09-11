---
title: 'Story 3.8 — First Run: the three doors after the first sign-in'
type: 'feature'
created: '2026-09-11'
status: 'in-review'
baseline_commit: 'c5f21b8f1ae81d238a804bcd4eeae716df9fd5c0'
owner_test: pending
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

Right now, somebody who signs up for the first time lands on an empty Projects page with one
button on it and no idea that connecting their Ghost site is the thing to do first. After this
story they land on a welcome screen instead — **"Let's make your Ghost site gorgeous."** with three
cards: **Connect your Ghost site** (marked *Recommended*), **Start from a starter**, and **Blank
canvas**, and the quiet line *"You can do all of this later."* underneath. Pressing the recommended
card runs them straight into the handshake you already tested in Story 3.2, on through the brand
offer from Story 3.4, and out the other side with a project wearing their own colours.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `S2 Onboarding.dc.html` draws **S2a First Run** and `EXPERIENCE.md`'s Information
Architecture lists it as the first surface after sign-in, but nothing builds it: a new account lands
on S3b, the Projects empty screen, whose single control makes a blank project — the *least*
recommended of the three doors and the one that leaves the customer with no site, no brand and
sample content. DW-19 named this gap; the owner closed it on 2026-09-08 by ruling First Run to be
Epic 3's last story, planned after 3.4 so the Recommended door runs all the way through.

**Approach:** One route and one rule. `/start` draws S2a's three doors; the dashboard sends an
account there while it has no project and no connected site. Every door already has its
destination built — **Connect** is an `<a href="/sites/connect">` into 3.2's full-page handshake,
which redirects on success to 3.4's brand offer and makes the project; **Blank canvas** opens the
same New Project Sheet the dashboard opens; **Start from a starter** is greyed with its reason
until Epic 11's chooser exists. So this story adds a screen and a redirect and no new capability
at all. No column, no migration, **no Schema phase**.

## Boundaries & Constraints

**Always:**

- **The three doors' words live in one module and nowhere else** (`lib/first-run.ts`), and the
  starter door's two sentences are shared with `new-project-sheet.tsx`, which draws the same door.
  The two surfaces cannot be allowed to disagree about what a starter is.
- **The rule that decides First Run is pure and under `node --test`.** It takes what the dashboard
  already knows — whether the projects read failed, how many projects, whether any site is
  connected, whether the URL carries anything — and answers one boolean.
- **A failed read is not an empty account.** `(dashboard)/page.tsx:82` already carries that scar;
  the redirect inherits it. A failed *projects* read and a failed *sites* read both render the
  dashboard rather than redirecting.
- **A control that could never act is absent; one that cannot act *yet* is greyed with its reason**
  (UX-DR3), one sentence in the helper-caption slot, never a tooltip.
- **R-98 on both halves:** the route carries its own `loading.tsx` drawing the three cards *this*
  route shows, and any control that starts work says so.

- **Nothing is remembered about First Run** — the owner's ruling on Question 1 (option 1,
  2026-09-11). It is not a one-time event with a mark against the account; it is simply what
  "Projects" looks like while you have no site and no project, and it stops being that the moment
  you have one. So the rule is derived from the two counts on every render and from nothing stored.

**Ask First:**

- Nothing outstanding. Question 1 is ruled; if a second decision surfaces during Dev, it goes under
  `## Questions for the owner` in R-83 shape and the run stops there.

**Never:**

- **No migration, no new column, and no `auth.users` metadata key.** A remembered "seen it" mark is
  the option the owner did not take — do not reintroduce one as a convenience.
- **Nothing behind the starter door.** Epic 11 owns the chooser; this story greys the door.
- **The New Project Sheet is not re-implemented.** `<NewProjectSheet>` and `openNewProject()` are
  imported as the dashboard imports them.
- **The export is not edited** (R-74). The four departures below are recorded here.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First sign-in | `/` · projects 0 · connected sites 0 · no query string | redirect to `/start`; S2a's three doors | N/A |
| Has a project | `/` · projects ≥ 1 | the dashboard; no sites read is made at all | N/A |
| Has a site only | `/` · projects 0 · connected sites ≥ 1 | the dashboard's S3b empty screen | N/A |
| Projects read failed | `/` · read error | the dashboard's red Banner | never redirect — an unread account is not an empty one |
| Sites read failed | `/` · projects 0 · sites read error | the dashboard | never redirect — the safe side is the page that already works |
| Restored / sign-out-failed | `/?restored=1` · `/?signed-out-failed=1` | the dashboard, banner intact | a query string of any kind suppresses the redirect, so no hint is ever swallowed |
| Disconnected only | projects 0 · every site row has `disconnected_at` | `/start` | a disconnected record is not a site (FR-C6) |
| Scripts off | `/start` | Connect and the logo navigate; Blank canvas cannot open a `<dialog>` | same as the dashboard's own New project button — parity, not a regression |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/S2 Onboarding.dc.html:24-71` —
  **the frame.** S2a: 44px Bricolage heading, three 352px cards (radius 12, padding 28, gap 20,
  1px `#E7E2DB`, shadow `0 1px 2px`), a 140px illustration band in each, 22px title, 14px
  `#6E6A64` body; the Recommended badge at top 16 / right 16 in `#FFEDE8` on `#C2381F`; 48px
  between the heading, the card row and the footer line; the card row's gap 24.
- `apps/web/app/(app)/app/(authed)/(dashboard)/page.tsx:60-84` — the projects read, `unread`,
  `atCap`; **:78-82** is the "a failed read is not an empty account" scar the redirect inherits.
  **:200** renders `<NewProjectSheet>`. *(Dev: the page is UNCHANGED. The redirect went into a new
  `(dashboard)/layout.tsx` instead — `loading.tsx` beside the page is a Suspense boundary, so a
  redirect from the page can only be delivered as a client navigation; see `## Spec Change Log`.)*
- `apps/web/app/(app)/app/(authed)/sites/connect/page.tsx` — the Connect door's destination, and
  the precedent for a full-screen onboarding beat centred inside the shell.
- `apps/web/app/(app)/app/(authed)/sites/brand/page.tsx:8-13` — where `connectSite` lands next;
  the Recommended door needs nothing here, it is already built.
- `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx:42-55` — `DOORS`, including the starter
  door's `consequence` and `reason` that move to `lib/first-run.ts` and are imported back.
- `apps/web/components/shell/shell.tsx:58-61,125-128` — `openNewProject()`, and `BARS`: `/start`
  is not in it, so the route draws no top bar, which is what the frame wants.
- `apps/web/components/kit/greyed.ts` — `greyedProps` / `reason` / `ring`, the P0-0 treatment.
- `apps/web/app/(app)/app/(authed)/(dashboard)/loading.tsx` — the skeleton idiom to copy.
- `apps/web/busy.test.ts:122-160` — `NO_SKELETON`; `/start` needs **no** entry because it gets a
  `loading.tsx`, and `app-routes.test.ts:44` is satisfied by the file sitting under `(authed)`.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx:41-61` — the house comment shape for a
  surface whose departures from its frame are deliberate.
- `apps/web/lib/connect-rule.ts:180-185` (`SITES_EMPTY`) — the precedent for a screen's words in a
  pure module.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/lib/first-run.ts` — **new.** S2a's words (heading, the three doors with their
  titles, consequences and the Recommended mark, the footer line) and `showsFirstRun()`, the pure
  rule over `{ unread, projects, sites, hasQuery }`. Export the starter door's two sentences by
  name so the sheet can import them.
- [x] `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx` — import the starter door's
  `consequence` and `reason` from `lib/first-run.ts` instead of holding its own copies. One home
  for one sentence.
- [x] `apps/web/app/(app)/app/(authed)/start/page.tsx` — **new.** S2a inside the shell, centred as
  `/sites/connect` is; `resolveEntitlement` for the sheet's `plan`; renders `<NewProjectSheet
  atCap={false} …>` so the Blank door has something to open; `metadata.title`, `robots: noindex`.
- [x] `apps/web/app/(app)/app/(authed)/start/doors.tsx` — **new**, client. The three cards: Connect
  as an `<a href="/sites/connect">` with the Recommended badge, Starter greyed with its reason,
  Blank as a button calling `openNewProject()`. One focus ring (`ring`), 44px touch targets at 390.
- [x] `apps/web/app/(app)/app/(authed)/start/loading.tsx` — **new.** Three card outlines in the
  doors' own shape (the 140px band, the title, the two-line body), `aria-busy`, an `sr-only` line.
- [x] `apps/web/app/(app)/app/(authed)/(dashboard)/layout.tsx` — **new, and it is the LAYOUT rather
  than the page: measured, see the Change Log.** Reads the connected-site count **only when** the
  projects read succeeded and returned none, then `redirect('/start')` on `showsFirstRun(...)`.
  Filter `disconnected_at is null`, through the user's own session, `head` count only.
- [x] `apps/web/routing.ts` · `apps/web/proxy.ts` — `SEARCH_HEADER`, set by the proxy on every app
  request (empty included, so a client-sent one is always overwritten) and read by the layout: Next
  gives `searchParams` to a page and not to a layout, and "any query string renders the dashboard"
  is half the rule.
- [x] `apps/web/app/(app)/app/(authed)/start/layout.tsx` · `apps/web/server/first-run.ts` — **new at
  Review (2026-09-11).** The other side of the door: an account with a project or a site is sent from
  `/start` back to `/`, and both layouts ask the one reader. `tools/probe/run-verify-first-run.mjs` —
  **new at Review**, the matrix executed against the deployed site, raw HTTP.
- [x] `apps/web/first-run.test.ts` — **new.** Every row of the matrix against `showsFirstRun`, plus
  an assertion that `new-project-sheet.tsx` and `doors.tsx` both read the starter sentences from
  `lib/first-run.ts` (read out of the source, `busy.test.ts`'s idiom).
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` — amend the
  **First Run** row: built at `/start`, reached from `/` while the account has no project and no
  connected site, and the four departures below. Propagate, never localise (standing rule 3).
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` — note against **DW-19** that the
  screen it named is built, and open an entry for the starter door's reason sentence to be removed
  by Epic 11 when the chooser exists.

**Acceptance Criteria:**

- Given an account with no project and no connected site, when it signs in, then it lands on
  **First Run** — the heading, the three cards in the frame's order with **Recommended** on the
  first, and "You can do all of this later." underneath.
- Given First Run, when **Connect your Ghost site** is pressed, then 3.2's handshake opens and a
  successful connect goes on to 3.4's brand offer without any further press.
- Given First Run, when **Start from a starter** is pressed or focused, then nothing happens and
  its reason is read out with it — greyed, with the sentence under it, never a tooltip.
- Given First Run, when **Blank canvas** is pressed, then the New Project Sheet opens — the same
  sheet, not a copy of it.
- Given an account that has a project **or** a connected site, when it signs in, then it lands on
  the dashboard and never on First Run.
- Given a URL carrying a query string (`?restored=1`, `?signed-out-failed=1`, `?q=`), when the
  dashboard renders, then it renders — the redirect never swallows a message.
- **Matches the frame** — `S2 Onboarding.dc.html` S2a — at 1440, 834 and 390, with the four
  departures in Design Notes and no others.
- `pnpm check` green, zero axe violations on `/start` at all three widths, one coral focus ring.

### Review Findings

*Code review, 2026-09-11 — every patch below APPLIED and re-executed (the table under `## Verification`). Five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier), every hypothesis executed before it was rated (standing rule 1). The real-infra layer re-drove the whole matrix on **app.inflozo.com** with a GoTrue fixture (23/23), confirmed R-99 through `SUPABASE_DB_POOLER_URL` (no migration; `sites.disconnected_at` and `projects` present), and ran `pnpm check`, the RLS gate and the doc gate green. No decision is the owner's: the two judgement calls below are routine and are stated as such.*

- [x] [Review][Patch] **Blank canvas from the welcome screen strands the customer on it** [apps/web/app/(app)/app/(authed)/start/page.tsx] — EXECUTED on app.inflozo.com (browser, fixture account): press Blank canvas → Create project → the sheet closes, the URL stays `/start`, the three doors stay on screen, and one project now exists behind them. `createProject` revalidates the dashboard and the sheet only closes itself. High. Fix: `/start` gets its own guard, above its skeleton (a `start/layout.tsx`, the same reason the dashboard's is a layout): an account that has a project or a site is sent to `/` — which is also the reverse of the rule the acceptance criteria state ("never on First Run").
- [x] [Review][Patch] **`/start` has no reverse guard** [apps/web/app/(app)/app/(authed)/start/page.tsx] — EXECUTED: with a project on the account, `GET /start` answers 200 with the doors. A bookmark, Back after the handshake, or a typed URL shows the welcome screen to an account with work, and `atCap={false}` there is an assumption rather than the fact the comment claims. Same fix as above; the two layouts share one reader so there is one decider.
- [x] [Review][Patch] **The typed `/?` "escape hatch" does not exist** [apps/web/lib/first-run.ts] — EXECUTED: `new URL('http://a/?').search === ''`, so the proxy hands `''` and the redirect fires. The rule comment, the spec's Design Notes and one test case (`hasSearch('?')`, a value the proxy can never produce) all claim it. Drop the claim; the test records the fact instead.
- [x] [Review][Patch] **Projects is not marked current on `/start`** [apps/web/components/shell/shell.tsx] — `isActive('/start', '/')` is false, so no nav item carries `aria-current` on the screen the owner's ruling makes the Projects page (his test step 5 says so in words). Routine call: `/start` counts as `/` for the nav.
- [x] [Review][Patch] **The greyed starter door is a bare `<div>` with `tabIndex` and no role** [apps/web/app/(app)/app/(authed)/start/doors.tsx] — a keyboard user Tabs onto an unnamed stop; its two siblings are an `<a>` and a `<button>`. It becomes a `<button type="button">` carrying the same greyed props.
- [x] [Review][Patch] **Two undeclared departures from S2a** [apps/web/app/(app)/app/(authed)/start/doors.tsx] — the card titles carry `tracking-[-0.01em]` where the frame sets letter-spacing only on the 44px heading (removed, so it matches); the starter fan's centre card is cast at `.12` alpha in the frame and the token layer has `.08` and `.14` (recorded, with the 28px heading below tablet, under departure 4 in Design Notes and EXPERIENCE.md).
- [x] [Review][Patch] **No permanent executing check of the 307** [apps/web/first-run.test.ts] — the two halves of the rule meet at runtime (the proxy writes a header, the layout reads it); a proxy that stopped forwarding the header, or a Suspense boundary added above the layout, would ship green with every pure test still passing. The verifier's throwaway probe becomes `tools/probe/run-verify-first-run.mjs`, run at Review and Deploy against the deployed site; the test's tautology (`DASHBOARD.endsWith('layout.tsx')`) goes, and the "only writer" claim about `SEARCH_HEADER` becomes an assertion over the source tree.
- [x] [Review][Patch] **Comments and records that overclaim** — `routing.ts` names a `searchHeader()` that does not exist (it is `hasSearch`); `page.tsx` attributes the duplicate tab title to the owner's ruling, which ruled on memory and not on titles; `lib/first-run.ts` says "no count is typed in here" above a sentence that types "Ten"; DW-88 says deleting the reason "brings both doors alive together" when `doors.tsx` draws a greyed door by hand and the compiler will send Epic 11 there; the layout does not say why `disconnected_at is null` is the whole filter (connect inserts a row only after the Admin key validated, `sites/actions.ts`).
- [x] [Review][Patch] **Owner's manual test** — step 2 promises "three white cards" and the middle one is grey by design; nothing tells the owner what to do with the fixture address afterwards; and the path the review found broken — Blank canvas → Create — is never walked. The script is rewritten with those three in it.

**Dismissed with evidence:** *the soft navigation from `/start` to Projects flashes the project-card skeleton* — EXECUTED on app.inflozo.com with a mutation observer over the click: only the welcome screen's own skeleton painted, never the dashboard's. *The frozen "two sentences" wording vs the whole `STARTER_DOOR`* — the Change Log is the record and frozen text is not edited. *The sheet's Blank door keeps D4a's own sentence* — the constraint names the starter door, and D4a's words are D4a's. *A short-circuit on `hasQuery` before the projects count* — one head count per dashboard render, and a second decider beside `needsSiteCount` is the thing the Change Log refused. *A `count` of `null` without an error* — it renders the dashboard, the safe side. *Story status* — this workflow sets it.

## Design Notes

**The four departures from S2a, each deliberate (R-74).**

1. **It lives inside the app shell.** The frame draws a bare page with only the wordmark. So do
   S2b·1, S2b·2 and S2c, and all three are built inside the shell (`sites/connect/page.tsx`,
   `sites/brand/page.tsx`) — this is that same departure, and it is also what gives the customer a
   way to Sites, Assets and Billing from here. `/start` is not in `BARS`, so there is no top bar
   and no second call to action competing with the three cards.
2. **The starter door's count comes from the roster, not from the frame.** S2a says *"Three
   ready-made sites"*; Appendix E's roster is ten and the shipped New Project Sheet already says
   so. Counts are derived, never restated (standing rule 4) — hence one sentence in one module,
   imported by both surfaces.
3. **"colours", not "colors".** The product's shipped voice is British (`connect-rule.ts:211`).
4. **834 and 390 are extrapolated.** S2a is drawn at 1440 only; the cards collapse the way the
   dashboard grid already does — `grid-cols-1 tablet:grid-cols-3` — which is the one collapse rule
   this app has and the one the owner has already tested twice. Inside it: the 44px heading comes
   down to 28px below tablet (S3b's own display size), and the illustrations scale to the narrower
   cell at 834. One rounding at every width: the starter fan's centre card is cast at `.12` alpha
   in the frame and the token layer has `.08` and `.14`, so it takes `shadow-md`. *(Review: the
   card titles carried a letter-spacing the frame does not set; removed, so they match.)*

**Why a redirect rather than a branch inside the dashboard.** A `loading.tsx` can only draw one
shape, and `(dashboard)/loading.tsx` draws project cards — the owner's finding 2 on Story 3.4 is
precisely that a skeleton must match what is coming. First Run on its own route gets its own
skeleton; the dashboard keeps the one it has.

**Why the redirect fires only on a bare `/`.** `restoreAccount` lands on `/?restored=1` and the
failed sign-out on `/?signed-out-failed=1`, and both sentences are on the dashboard. One rule —
*any* query string renders the dashboard — needs no list of hints to keep in step with. *(Review:
this paragraph used to promise a typed `/?` as an escape hatch to the empty Projects page. It is
not one — WHATWG URL drops a bare `?`, so the proxy hands `''` and the redirect fires, executed —
and the owner's ruling wants none: the doors ARE that page.)*

**The door has two sides (review, 2026-09-11).** `start/layout.tsx` sends an account that has a
project or a site from `/start` back to `/`. Executed on app.inflozo.com before it existed: a
project made from the welcome screen's own Blank door closed the sheet and left the customer
standing on the three doors, and a typed `/start` drew them over an account with work. The
action's re-render runs the layout, so a Create from First Run now lands on the dashboard with
the new project on it. Both layouts ask one reader, `server/first-run.ts`. A routine call, not the
owner's: it is the acceptance criterion "never on First Run" read from the other side.

## Questions for the owner

### Question 1 — somebody sees the welcome screen, does nothing, and comes back tomorrow. What should they see?

The welcome screen is what a brand-new account meets. The moment somebody connects a Ghost site or
makes a project it is gone for good — that part is settled. What is not settled is the in-between:
somebody signs in, looks at the three cards, closes the tab, and comes back having pressed nothing.

**Example.** Priya signs up on Monday, sees the three cards, and shuts the laptop without pressing
any of them. On Tuesday she signs in again.

1. **She sees the three cards again.** **(RECOMMENDED)** Inflozo remembers nothing. The welcome
   screen simply *is* what "Projects" looks like while you have no site and no project, and it
   stops being that the moment you have one. Nothing to store and nothing to go stale — and the
   three cards are the most useful thing to show somebody who still has nothing.
2. **She sees the empty Projects page instead** — *"Every great site starts somewhere."* with one
   **New project** button. The welcome screen was a one-time event: Inflozo puts a mark on her
   account the first time it shows, and never shows it again.

**Ruled: option 1 (owner, 2026-09-11).** *"She sees the three cards again."* So Inflozo stores
nothing: the welcome screen is what the Projects page is while the account has no site and no
project. The spec was already written to this option, so nothing in the build moves — what the
ruling settles is that the remembered mark of option 2 is now a thing this story must **not** add.

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. **You need a brand-new account**, so
step 1 makes one with a plus-address — mail to it still arrives in your ordinary inbox. You will
also need a Ghost site's API URL and its two keys, as in Story 3.2. **Afterwards**, delete the
account from its Account page (or tell Claude the address) so fixtures do not pile up; a second
run of this script uses `firstrun2`.

1. **URL:** `https://app.inflozo.com/sign-in` · **Screen:** Sign in · **Do:** sign out if you are
   signed in, then ask for a magic link to a fresh address. **Dummy data:**
   `umngkmr+firstrun1@gmail.com` · **See:** the "check your email" card, and the email arrives.
2. **URL:** the link in that email · **Screen:** **First Run** · **See:** a big heading **"Let's
   make your Ghost site gorgeous."** and three cards side by side — **Connect your Ghost site**
   with a pink **Recommended** tag in its top-right corner, **Start from a starter** drawn grey with
   a short line under it, and **Blank canvas**. Under them, quietly: *"You can do all of this
   later."* The left nav is there with **Projects** highlighted; there is no search field and no
   "New project" button along the top.
3. **URL:** same · **Screen:** First Run · **Do:** click **Start from a starter**. · **See:**
   nothing opens. The card is greyed and the line under it says why.
4. **URL:** same · **Screen:** First Run · **Do:** click **Blank canvas**, then **Create project**
   in the sheet that opens. · **See:** you land on your **Projects** page with one project on it
   named **Untitled**. *(This is the path the review found broken: it used to leave you on the
   three cards with the project made behind them.)*
5. **URL:** same · **Screen:** Projects · **Do:** open the project's **⋯** menu and **Delete** it.
   · **See:** the welcome screen comes back — you have nothing again, so this *is* your Projects
   page, which is what you ruled on 2026-09-11. Nothing anywhere says "you have already seen this".
6. **URL:** same · **Screen:** First Run · **Do:** click **Projects** in the left nav. · **See:**
   the same welcome screen, Projects still highlighted.
7. **URL:** same · **Screen:** First Run · **Do:** click **Connect your Ghost site** and go through
   the handshake as in Story 3.2. **Dummy data:** your Ghost's API URL, Admin API key and Content
   API key. · **See:** the two-step handshake, then the **"Nice site. Want to keep the vibe?"**
   brand screen, then — after **Use your brand** — the dashboard with a project on it in your own
   colour.
8. **URL:** `https://app.inflozo.com/start` · **Screen:** Projects · **Do:** type that address
   yourself. · **See:** the dashboard with your project, not the welcome screen — it is gone the
   moment you have something.
9. **URL:** `https://app.inflozo.com/` · **Screen:** Projects · **Do:** sign out, sign back in with
   the same address. · **See:** the dashboard with your project. **The welcome screen does not come
   back.**
10. **URL:** `https://app.inflozo.com/` · **Screen:** Projects · **Do:** sign in on your ordinary
    account, the one with projects already. · **See:** your dashboard exactly as it was. You should
    never see the welcome screen on it.
11. **URL:** same · **Screen:** First Run at phone size · **Do:** on a fresh account (`firstrun2`),
    narrow the browser window to phone width (or open it on your phone). · **See:** the three cards
    stacked one above the other, each still readable, nothing cut off and no sideways scrolling.
12. **URL:** same · **Screen:** First Run at tablet size · **Do:** widen the window again to about
    the width of an iPad held upright (roughly 800–850 across). · **See:** the three cards still
    side by side but narrow, with the titles wrapping onto two or three lines. Nothing cut off, no
    sideways scrolling. **This is the width worth looking hardest at** — it is the one the design
    was never drawn at. If you would rather the cards stacked here too, say so and it changes
    inside this story.

## Verification`). Five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier), every hypothesis executed before it was rated (standing rule 1). The real-infra layer re-drove the whole matrix on **app.inflozo.com** with a GoTrue fixture (23/23), confirmed R-99 through `SUPABASE_DB_POOLER_URL` (no migration; `sites.disconnected_at` and `projects` present), and ran `pnpm check`, the RLS gate and the doc gate green. No decision is the owner's: the two judgement calls below are routine and are stated as such.*

- [x] [Review][Patch] **Blank canvas from the welcome screen strands the customer on it** [apps/web/app/(app)/app/(authed)/start/page.tsx] — EXECUTED on app.inflozo.com (browser, fixture account): press Blank canvas → Create project → the sheet closes, the URL stays `/start`, the three doors stay on screen, and one project now exists behind them. `createProject` revalidates the dashboard and the sheet only closes itself. High. Fix: `/start` gets its own guard, above its skeleton (a `start/layout.tsx`, the same reason the dashboard's is a layout): an account that has a project or a site is sent to `/` — which is also the reverse of the rule the acceptance criteria state ("never on First Run").
- [x] [Review][Patch] **`/start` has no reverse guard** [apps/web/app/(app)/app/(authed)/start/page.tsx] — EXECUTED: with a project on the account, `GET /start` answers 200 with the doors. A bookmark, Back after the handshake, or a typed URL shows the welcome screen to an account with work, and `atCap={false}` there is an assumption rather than the fact the comment claims. Same fix as above; the two layouts share one reader so there is one decider.
- [x] [Review][Patch] **The typed `/?` "escape hatch" does not exist** [apps/web/lib/first-run.ts] — EXECUTED: `new URL('http://a/?').search === ''`, so the proxy hands `''` and the redirect fires. The rule comment, the spec's Design Notes and one test case (`hasSearch('?')`, a value the proxy can never produce) all claim it. Drop the claim; the test records the fact instead.
- [x] [Review][Patch] **Projects is not marked current on `/start`** [apps/web/components/shell/shell.tsx] — `isActive('/start', '/')` is false, so no nav item carries `aria-current` on the screen the owner's ruling makes the Projects page (his test step 5 says so in words). Routine call: `/start` counts as `/` for the nav.
- [x] [Review][Patch] **The greyed starter door is a bare `<div>` with `tabIndex` and no role** [apps/web/app/(app)/app/(authed)/start/doors.tsx] — a keyboard user Tabs onto an unnamed stop; its two siblings are an `<a>` and a `<button>`. It becomes a `<button type="button">` carrying the same greyed props.
- [x] [Review][Patch] **Two undeclared departures from S2a** [apps/web/app/(app)/app/(authed)/start/doors.tsx] — the card titles carry `tracking-[-0.01em]` where the frame sets letter-spacing only on the 44px heading (removed, so it matches); the starter fan's centre card is cast at `.12` alpha in the frame and the token layer has `.08` and `.14` (recorded, with the 28px heading below tablet, under departure 4 in Design Notes and EXPERIENCE.md).
- [x] [Review][Patch] **No permanent executing check of the 307** [apps/web/first-run.test.ts] — the two halves of the rule meet at runtime (the proxy writes a header, the layout reads it); a proxy that stopped forwarding the header, or a Suspense boundary added above the layout, would ship green with every pure test still passing. The verifier's throwaway probe becomes `tools/probe/run-verify-first-run.mjs`, run at Review and Deploy against the deployed site; the test's tautology (`DASHBOARD.endsWith('layout.tsx')`) goes, and the "only writer" claim about `SEARCH_HEADER` becomes an assertion over the source tree.
- [x] [Review][Patch] **Comments and records that overclaim** — `routing.ts` names a `searchHeader()` that does not exist (it is `hasSearch`); `page.tsx` attributes the duplicate tab title to the owner's ruling, which ruled on memory and not on titles; `lib/first-run.ts` says "no count is typed in here" above a sentence that types "Ten"; DW-88 says deleting the reason "brings both doors alive together" when `doors.tsx` draws a greyed door by hand and the compiler will send Epic 11 there; the layout does not say why `disconnected_at is null` is the whole filter (connect inserts a row only after the Admin key validated, `sites/actions.ts`).
- [x] [Review][Patch] **Owner's manual test** — step 2 promises "three white cards" and the middle one is grey by design; nothing tells the owner what to do with the fixture address afterwards; and the path the review found broken — Blank canvas → Create — is never walked. The script is rewritten with those three in it.

**Dismissed with evidence:** *the soft navigation from `/start` to Projects flashes the project-card skeleton* — EXECUTED on app.inflozo.com with a mutation observer over the click: only the welcome screen's own skeleton painted, never the dashboard's. *The frozen "two sentences" wording vs the whole `STARTER_DOOR`* — the Change Log is the record and frozen text is not edited. *The sheet's Blank door keeps D4a's own sentence* — the constraint names the starter door, and D4a's words are D4a's. *A short-circuit on `hasQuery` before the projects count* — one head count per dashboard render, and a second decider beside `needsSiteCount` is the thing the Change Log refused. *A `count` of `null` without an error* — it renders the dashboard, the safe side. *Story status* — this workflow sets it.

## Design Notes

**The four departures from S2a, each deliberate (R-74).**

1. **It lives inside the app shell.** The frame draws a bare page with only the wordmark. So do
   S2b·1, S2b·2 and S2c, and all three are built inside the shell (`sites/connect/page.tsx`,
   `sites/brand/page.tsx`) — this is that same departure, and it is also what gives the customer a
   way to Sites, Assets and Billing from here. `/start` is not in `BARS`, so there is no top bar
   and no second call to action competing with the three cards.
2. **The starter door's count comes from the roster, not from the frame.** S2a says *"Three
   ready-made sites"*; Appendix E's roster is ten and the shipped New Project Sheet already says
   so. Counts are derived, never restated (standing rule 4) — hence one sentence in one module,
   imported by both surfaces.
3. **"colours", not "colors".** The product's shipped voice is British (`connect-rule.ts:211`).
4. **834 and 390 are extrapolated.** S2a is drawn at 1440 only; the cards collapse the way the
   dashboard grid already does — `grid-cols-1 tablet:grid-cols-3` — which is the one collapse rule
   this app has and the one the owner has already tested twice. Inside it: the 44px heading comes
   down to 28px below tablet (S3b's own display size), and the illustrations scale to the narrower
   cell at 834. One rounding at every width: the starter fan's centre card is cast at `.12` alpha
   in the frame and the token layer has `.08` and `.14`, so it takes `shadow-md`. *(Review: the
   card titles carried a letter-spacing the frame does not set; removed, so they match.)*

**Why a redirect rather than a branch inside the dashboard.** A `loading.tsx` can only draw one
shape, and `(dashboard)/loading.tsx` draws project cards — the owner's finding 2 on Story 3.4 is
precisely that a skeleton must match what is coming. First Run on its own route gets its own
skeleton; the dashboard keeps the one it has.

**Why the redirect fires only on a bare `/`.** `restoreAccount` lands on `/?restored=1` and the
failed sign-out on `/?signed-out-failed=1`, and both sentences are on the dashboard. One rule —
*any* query string renders the dashboard — needs no list of hints to keep in step with. *(Review:
this paragraph used to promise a typed `/?` as an escape hatch to the empty Projects page. It is
not one — WHATWG URL drops a bare `?`, so the proxy hands `''` and the redirect fires, executed —
and the owner's ruling wants none: the doors ARE that page.)*

**The door has two sides (review, 2026-09-11).** `start/layout.tsx` sends an account that has a
project or a site from `/start` back to `/`. Executed on app.inflozo.com before it existed: a
project made from the welcome screen's own Blank door closed the sheet and left the customer
standing on the three doors, and a typed `/start` drew them over an account with work. The
action's re-render runs the layout, so a Create from First Run now lands on the dashboard with
the new project on it. Both layouts ask one reader, `server/first-run.ts`. A routine call, not the
owner's: it is the acceptance criterion "never on First Run" read from the other side.

## Questions for the owner

### Question 1 — somebody sees the welcome screen, does nothing, and comes back tomorrow. What should they see?

The welcome screen is what a brand-new account meets. The moment somebody connects a Ghost site or
makes a project it is gone for good — that part is settled. What is not settled is the in-between:
somebody signs in, looks at the three cards, closes the tab, and comes back having pressed nothing.

**Example.** Priya signs up on Monday, sees the three cards, and shuts the laptop without pressing
any of them. On Tuesday she signs in again.

1. **She sees the three cards again.** **(RECOMMENDED)** Inflozo remembers nothing. The welcome
   screen simply *is* what "Projects" looks like while you have no site and no project, and it
   stops being that the moment you have one. Nothing to store and nothing to go stale — and the
   three cards are the most useful thing to show somebody who still has nothing.
2. **She sees the empty Projects page instead** — *"Every great site starts somewhere."* with one
   **New project** button. The welcome screen was a one-time event: Inflozo puts a mark on her
   account the first time it shows, and never shows it again.

**Ruled: option 1 (owner, 2026-09-11).** *"She sees the three cards again."* So Inflozo stores
nothing: the welcome screen is what the Projects page is while the account has no site and no
project. The spec was already written to this option, so nothing in the build moves — what the
ruling settles is that the remembered mark of option 2 is now a thing this story must **not** add.

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. **You need a brand-new account**, so
step 1 makes one with a plus-address — mail to it still arrives in your ordinary inbox. You will
also need a Ghost site's API URL and its two keys, as in Story 3.2.

1. **URL:** `https://app.inflozo.com/sign-in` · **Screen:** Sign in · **Do:** sign out if you are
   signed in, then ask for a magic link to a fresh address. **Dummy data:**
   `umngkmr+firstrun1@gmail.com` · **See:** the "check your email" card, and the email arrives.
2. **URL:** the link in that email · **Screen:** **First Run** · **See:** a big heading **"Let's
   make your Ghost site gorgeous."** and three white cards side by side — **Connect your Ghost
   site** with a pink **Recommended** tag in its top-right corner, **Start from a starter**, and
   **Blank canvas**. Under them, quietly: *"You can do all of this later."* The left nav is there;
   there is no search field and no "New project" button along the top.
3. **URL:** same · **Screen:** First Run · **Do:** click **Start from a starter**. · **See:**
   nothing opens. The card is greyed and a short line under it says why.
4. **URL:** same · **Screen:** First Run · **Do:** click **Blank canvas**. · **See:** the **New
   project** sheet you know from the dashboard opens over the screen. Close it with **Cancel**.
5. **URL:** same · **Screen:** First Run · **Do:** click **Projects** in the left nav. · **See:**
   the same welcome screen — you have nothing yet, so this *is* your Projects page, which is what
   you ruled on 2026-09-11. Nothing anywhere says "you have already seen this".
6. **URL:** same · **Screen:** First Run · **Do:** click **Connect your Ghost site** and go through
   the handshake as in Story 3.2. **Dummy data:** your Ghost's API URL, Admin API key and Content
   API key. · **See:** the two-step handshake, then the **"Nice site. Want to keep the vibe?"**
   brand screen, then — after **Use your brand** — the dashboard with a project on it in your own
   colour.
7. **URL:** `https://app.inflozo.com/` · **Screen:** Projects · **Do:** sign out, sign back in with
   the same address. · **See:** the dashboard with your project. **The welcome screen does not come
   back.**
8. **URL:** `https://app.inflozo.com/` · **Screen:** Projects · **Do:** sign in on your ordinary
   account, the one with projects already. · **See:** your dashboard exactly as it was. You should
   never see the welcome screen on it.
9. **URL:** same · **Screen:** First Run at phone size · **Do:** on the fresh account, narrow the
   browser window to phone width (or open it on your phone). · **See:** the three cards stacked one
   above the other, each still readable, nothing cut off and no sideways scrolling.
10. **URL:** same · **Screen:** First Run at tablet size · **Do:** widen the window again to about
    the width of an iPad held upright (roughly 800–850 across). · **See:** the three cards still
    side by side but narrow, with the titles wrapping onto two or three lines. Nothing cut off, no
    sideways scrolling. **This is the width worth looking hardest at** — it is the one the design
    was never drawn at. If you would rather the cards stacked here too, say so and it changes
    inside this story.

## Verification

**R-82: the review and the owner's test run on the real infrastructure**, never on mocks alone —
record what each service returned by the key's variable name, never its value.

**Commands:**

- `pnpm check` **from the repo root, not from `apps/web`** — expected: lint, `tsc` and `node --test`
  all green, `first-run.test.ts` included (Node 24 on PATH). *(Dev: `check` is a ROOT script — run
  from `apps/web` it answers `Command "check" not found`, which is what this line used to say.)*
- `cd apps/web && node --test first-run.test.ts` — expected: every matrix row green, and the
  shared-sentence assertion green. **From `apps/web`, not from the repo root:** the source assertions
  read their files by relative path, which is `busy.test.ts`'s own idiom and what `pnpm test` does.
- `python3 tools/doc-audit.py --check` — expected: exit 0, twice, after the EXPERIENCE.md amendment.
- `bash supabase/tests/run-rls-gate.sh` — expected: green and **unchanged**; this story adds no SQL.
- A real sign-up on `app.inflozo.com` with a throwaway address (R-82), then a real connect against
  **T1** `ghost6.inflozo.com` with `GHOST6_*` from `tools/probe/.env` — expected: First Run on the
  first landing, the handshake, S2c, a project, and the dashboard on the next sign-in.
- `env $(grep -E '^SUPABASE_(URL|SECRET_KEY|PUBLISHABLE_KEY)=' tools/probe/.env | xargs) node tools/probe/run-verify-first-run.mjs`
  — expected: every step green against **app.inflozo.com** (`APP_ORIGIN=http://localhost:3100
  APP_PREFIX=/app` points it at a local production build). Added at Review: the two halves of the
  rule meet at runtime in a header the proxy writes and a layout reads, and no pure test sees that.
- axe-core over `/start` at 1440, 834 and 390 — expected: zero violations, the greyed door included.
  **Dev, 2026-09-11 — RUN, on a PRODUCTION BUILD (`next build` + `next start`) against the real
  Supabase, with a fixture account created and deleted through GoTrue's admin API:** zero axe
  violations (WCAG 2.0/2.1 A and AA) at all three widths, no sideways scrolling at any of them, and
  every behaviour of the matrix — `/` answering **307 → /start**, `?restored=1`, `?signed-out-failed=1`,
  `?q=` and `?anything=else` each answering **200**, the heading, the three doors in the frame's order,
  **Recommended** on the first card only, the footer line, the starter door's reason on the page and in
  no tooltip, no top bar on the route, Connect's `href`, Blank opening the dashboard's own sheet and
  Cancel closing it, and the greyed door opening nothing. The remaining rows are the owner's, on the
  deployed site: a real sign-up and a real connect against T1.

### Re-executed at the end of Dev, independently of the implementation run (R-82)

**2026-09-11, on a PRODUCTION build (`next build` + `next start -p 3100`) against the REAL
Supabase.** Keys named, never printed.

| Command | Service | Returned |
|---|---|---|
| `pnpm check` (repo root, Node 24) | — | exit 0 · **275 tests, 275 pass, 0 fail**, the seven `first-run.test.ts` tests among them |
| `python3 tools/doc-audit.py --check` ×2 | — | exit 0 both times · `documentation gate: PASS (0 warning(s))` |
| `bash supabase/tests/run-rls-gate.sh` | PostgreSQL 17 container | exit 0, **unchanged** — this story adds no SQL |
| `pnpm build` | — | exit 0 · **`/app/start` in the route table** |
| the matrix probe — raw HTTP, **no browser, therefore no JavaScript at all** | **Supabase**: GoTrue admin + PostgREST (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`) | three fixture accounts created **HTTP 200** and deleted **HTTP 200**; site and project rows inserted **HTTP 201** |
| axe-core 4.12.1 driven by Playwright over `/start` | — | **zero violations** (WCAG 2.0/2.1 A + AA) at 1440, 834 and 390; no sideways scrolling at any width |

**Every matrix row that can be induced, executed — each with its control:**

- **First sign-in** — a bare `/` answered **307 → `/start`**, with no JavaScript involved anywhere.
- **Has a project** — the *same* account answered **307** with nothing and **200, with the project
  on the page**, after one row was inserted. That before/after is the control: it is the rule that
  decides, not the account.
- **Has a site only** — **200**, and it is S3b's own empty screen ("Every great site starts
  somewhere."), never First Run.
- **Disconnected only** — a site row carrying `disconnected_at` left the answer at **307 → `/start`**
  (FR-C6: a record Inflozo kept is not a site).
- **Restored / sign-out-failed** — `?restored=1`, `?signed-out-failed=1`, `?q=` and `?anything=else`
  each answered **200**, and the restored sentence was still on the page that rendered.
- **Scripts off** — `/start` is served **whole** by the server (the heading, the three doors, the
  starter's reason, the footer line), Connect is a plain `<a href="/sites/connect">`, and **both
  `<dialog>` elements are served closed**, so Blank canvas opens nothing — parity with the
  dashboard's own New project button, not a regression.
- **Projects read failed · Sites read failed** — the two rows that cannot be induced without
  breaking the database. Covered by `first-run.test.ts`'s pure cases (`unread: true`, `sites: null`),
  which ran and passed.

**The criteria that needed a browser:** Blank canvas opens the dashboard's own sheet and Cancel
closes it; the greyed starter door opens nothing; all three doors are reachable by Tab — the greyed
one included, because P0-0 keeps it in the order — and each takes the **coral focus ring**, measured
settling to `0 0 0 2px #c2381f`. *(Read in the same tick as the keypress it measures transparent:
the card carries `transition`, so the ring animates in. A harness trap, not a defect — noted because
it cost two passes to see.)*

The probe is throwaway by design — it creates and deletes its own accounts — and is **not** in the
permanent harness. Re-driving `/start` on the deployed site belongs to Review and to the owner's
test below.

### Re-executed at Review, after every patch (2026-09-11)

**Against the REAL Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`;
fixture accounts made and deleted through GoTrue's admin API), on **app.inflozo.com** for the
findings and on a local **production build** (`next build` + `next start -p 3100`) for the fixes,
because CI deploys the fixes only on the push that closes this phase.

| Command | Service | Returned |
|---|---|---|
| Real-infra layer's own probe on **app.inflozo.com** (the Dev commit, `908bdb7b`) | Supabase GoTrue + PostgREST, the deployed site | **23/23**: bare `/` **307 → /start**; `?restored=1`, `?signed-out-failed=1`, `?q=` **200**; site only **200** S3b; disconnected only **307**; project **200**; signed-out control **307 → /sign-in** |
| R-99 through `SUPABASE_DB_POOLER_URL` (PostgreSQL 17.6) | hosted database | no migration in the diff; `sites.disconnected_at`, its partial index and the `projects` columns present |
| Browser (Playwright) on **app.inflozo.com**, fixture with nothing: Blank canvas → Create | the deployed site | **Confirmed broken**: URL stayed `/start`, doors visible, sheet closed, one project made behind them |
| Browser on **app.inflozo.com**: click Projects from `/start`, mutation observer over the click | the deployed site | only the welcome screen's own skeleton painted, never the dashboard's — the "wrong skeleton on soft navigation" hypothesis **dismissed** |
| `GET /start` with a project, **app.inflozo.com** | the deployed site | **200** with the doors — the missing reverse guard, confirmed |
| `pnpm check` (repo root, Node 24) after the patches | — | exit 0; `first-run.test.ts` now nine tests, all green |
| `python3 tools/doc-audit.py --check` ×2 | — | PASS both times (the gate learned `.mjs`) |
| `tools/probe/run-verify-first-run.mjs` against the **patched local production build** | Supabase + the build | **24/24**, the two reverse-guard steps included: `/start` with a site **307 → /**, with a project **307 → /** |
| Browser on the patched build: Blank canvas → Create | the build | sheet closed, doors gone, landed on `/` — the dashboard on the app host; **Projects carries `aria-current="page"` on `/start`** |
| axe-core 4.12.1 over `/start` at 1440, 834, 390 on the patched build, with an `img` without `alt` as the positive control | the build | **zero violations** at all three; no sideways scrolling; the greyed door is a `BUTTON`, `aria-disabled`, `aria-describedby` its reason, in the Tab order; the control was reported |
| `tools/probe/run-verify-first-run.mjs` against **app.inflozo.com** after CI deploys this commit | the deployed site | *recorded below when the deploy lands* |

## Spec Change Log

- **2026-09-11, Dev — the redirect moved from `(dashboard)/page.tsx` to a new
  `(dashboard)/layout.tsx`, and it is a measurement, not a preference.** `(dashboard)/loading.tsx`
  is a Suspense boundary, so Next flushes the shell the moment the page awaits anything — and a
  `redirect()` **after** that flush cannot be an HTTP redirect. Executed on a production build
  (`next build` + `next start`, a real fixture account with no project and no site): `/` answered
  **200** with the dashboard document, the customer watched the **project-card skeleton for ~150ms**
  and only then arrived at the welcome screen, and with scripts off the redirect never arrived at
  all. Two things that is — the owner's finding 2 on Story 3.4 ("I want the loading shimmer to match
  the cards they show") reintroduced on the first screen a new customer ever sees, and a first run
  that needs JavaScript to begin. The control that pins the cause on the boundary rather than on the
  call: with `loading.tsx` moved away, the identical `redirect()` in the page answered **307 →
  /start**. `generateMetadata` was tried and streams the same way (also executed). From the layout,
  above the boundary, it is a real **307** before a byte of the dashboard is sent — verified on the
  same production build. Deleting the skeleton would also have fixed it and would have undone R-98.
- **2026-09-11, Dev — `SEARCH_HEADER` in `routing.ts`, set by `proxy.ts`.** A layout is not given
  `searchParams` (Next's own rule), and "any query string renders the dashboard" is half the rule,
  so the proxy hands the request's search string over. Set on **every** app request, empty string
  included, so a header a client sent is always overwritten rather than believed; `first-run.test.ts`
  asserts the proxy is its only writer. Spoofing it can only *suppress* First Run, never forge it.
- **2026-09-11, Dev — the illustrations are scaled and clipped at 834, which is an extrapolated
  width (departure 4).** The frame's drawings are drawn for a 352px card; at 834 the app's one
  collapse rule leaves a card ~117px wide inside its padding, and measured there the connect card's
  two 56px circles had squashed into **ovals** (a flex item's default is to shrink) and the starter
  fan spilled over the card's own edges onto the page. `shrink-0`, `overflow-hidden` on the band and
  `tablet:scale-[.6] desktop:scale-100` on each drawing. 1440 and 390 are untouched.
- **2026-09-11, Dev — `lib/first-run.ts` exports `needsSiteCount` beside `showsFirstRun`.** The
  layout must know whether the site count is worth a round trip *before* it spends one, and a caller
  restating those three conditions would be a second decider: one that drifted a condition stricter
  would pass `sites: null` and lose First Run with every test still green. It is the rule's own cheap
  half — `showsFirstRun = needsSiteCount(...) && sites === 0` — and the test asserts the coupling.
- **2026-09-11, Dev — `sites` is `number | null` and `null` means BOTH "not read" and "the read
  failed".** They are the same answer (render the dashboard), and collapsing them keeps the rule one
  expression. The matrix's two rows are still tested apart, because the layout reaches them by two
  different paths.
- **2026-09-11, Review — `/start` guards its other side, and the reader is one module.** A project
  made from the welcome screen's own Blank door left the customer on the three doors (the action
  revalidates the dashboard and the sheet only closes itself), and a typed `/start` drew the doors
  over an account with work — both executed on app.inflozo.com. `start/layout.tsx` sends an account
  with anything to `/`; a layout, for the reason the dashboard's is one. `server/first-run.ts` reads
  the two counts for both layouts, so there is one decider. The nav marks Projects current on
  `/start`. The starter door is a `<button>`, not a role-less `<div>`. The card titles lost a
  letter-spacing the frame does not set. The `/?` escape-hatch claim was false and is withdrawn.
  `tools/probe/run-verify-first-run.mjs` keeps the verifier's probe, so the runtime join of proxy
  header and layout is executed at every Review and Deploy rather than trusted.
- **2026-09-11, Dev — the sheet imports the whole `STARTER_DOOR`, not just its two sentences.** Its
  `title` was already identical, and the local `Door` type was identical too, so both travel with it
  and the sheet keeps no copy of anything. `first-run.test.ts` fails if either surface reintroduces
  one, by looking for the sentence itself rather than for the import.
