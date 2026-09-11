---
title: 'Story 3.8 — First Run: the three doors after the first sign-in'
type: 'feature'
created: '2026-09-11'
status: 'ready-for-dev'
baseline_commit: 'c5f21b8f1ae81d238a804bcd4eeae716df9fd5c0'
owner_test: pending
review_loop_iteration: 0
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
  **:200** renders `<NewProjectSheet>`. The redirect goes in above the render.
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

- [ ] `apps/web/lib/first-run.ts` — **new.** S2a's words (heading, the three doors with their
  titles, consequences and the Recommended mark, the footer line) and `showsFirstRun()`, the pure
  rule over `{ unread, projects, sites, hasQuery }`. Export the starter door's two sentences by
  name so the sheet can import them.
- [ ] `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx` — import the starter door's
  `consequence` and `reason` from `lib/first-run.ts` instead of holding its own copies. One home
  for one sentence.
- [ ] `apps/web/app/(app)/app/(authed)/start/page.tsx` — **new.** S2a inside the shell, centred as
  `/sites/connect` is; `resolveEntitlement` for the sheet's `plan`; renders `<NewProjectSheet
  atCap={false} …>` so the Blank door has something to open; `metadata.title`, `robots: noindex`.
- [ ] `apps/web/app/(app)/app/(authed)/start/doors.tsx` — **new**, client. The three cards: Connect
  as an `<a href="/sites/connect">` with the Recommended badge, Starter greyed with its reason,
  Blank as a button calling `openNewProject()`. One focus ring (`ring`), 44px touch targets at 390.
- [ ] `apps/web/app/(app)/app/(authed)/start/loading.tsx` — **new.** Three card outlines in the
  doors' own shape (the 140px band, the title, the two-line body), `aria-busy`, an `sr-only` line.
- [ ] `apps/web/app/(app)/app/(authed)/(dashboard)/page.tsx` — read the connected-site count **only
  when** the projects read succeeded and returned none, then `redirect('/start')` on
  `showsFirstRun(...)`. Filter `disconnected_at is null`, through the user's own session, `head`
  count only.
- [ ] `apps/web/first-run.test.ts` — **new.** Every row of the matrix against `showsFirstRun`, plus
  an assertion that `new-project-sheet.tsx` and `doors.tsx` both read the starter sentences from
  `lib/first-run.ts` (read out of the source, `busy.test.ts`'s idiom).
- [ ] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` — amend the
  **First Run** row: built at `/start`, reached from `/` while the account has no project and no
  connected site, and the four departures below. Propagate, never localise (standing rule 3).
- [ ] `_bmad-output/implementation-artifacts/deferred-work.md` — note against **DW-19** that the
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
   this app has and the one the owner has already tested twice.

**Why a redirect rather than a branch inside the dashboard.** A `loading.tsx` can only draw one
shape, and `(dashboard)/loading.tsx` draws project cards — the owner's finding 2 on Story 3.4 is
precisely that a skeleton must match what is coming. First Run on its own route gets its own
skeleton; the dashboard keeps the one it has.

**Why the redirect fires only on a bare `/`.** `restoreAccount` lands on `/?restored=1` and the
failed sign-out on `/?signed-out-failed=1`, and both sentences are on the dashboard. One rule —
*any* query string renders the dashboard — needs no list of hints to keep in step with, and gives
a typed `/?` as the escape hatch to the empty Projects page.

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

## Verification

**R-82: the review and the owner's test run on the real infrastructure**, never on mocks alone —
record what each service returned by the key's variable name, never its value.

**Commands:**

- `cd apps/web && pnpm check` — expected: lint, `tsc` and `node --test` all green, `first-run.test.ts`
  included (Node 24 on PATH).
- `node --test apps/web/first-run.test.ts` — expected: every matrix row green, and the shared-sentence
  assertion green.
- `python3 tools/doc-audit.py --check` — expected: exit 0, twice, after the EXPERIENCE.md amendment.
- `bash supabase/tests/run-rls-gate.sh` — expected: green and **unchanged**; this story adds no SQL.
- A real sign-up on `app.inflozo.com` with a throwaway address (R-82), then a real connect against
  **T1** `ghost6.inflozo.com` with `GHOST6_*` from `tools/probe/.env` — expected: First Run on the
  first landing, the handshake, S2c, a project, and the dashboard on the next sign-in.
- axe-core over `/start` at 1440, 834 and 390 — expected: zero violations, the greyed door included.
