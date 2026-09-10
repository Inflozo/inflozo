---
title: 'Story 3.7 — The daily health check, the reconnect email, and the card''s connection controls'
type: 'feature'
created: '2026-09-10'
status: 'in-review'
baseline_commit: 'a0748b7ad9a4a6fda3cb557544f8bbc80ebb6003'
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story Inflozo checks every connected Ghost site once a day on its own, and tells you when
one needs attention: the card on your **Sites** page turns from a green **Connected** to an amber
**Reconnect needed** with the reason and the date beside it, and you get one email about it — one,
not a stream. You can also ask for the check yourself: the **⋯** on any site card now has
**Re-check connection**, which goes and talks to your Ghost while an amber dot pulses and the card
says **Checking…**, then shows the fresh answer and the new "Checked just now". The same **⋯** menu
now holds **Use this site's brand**, which used to be a link under the card.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Ghost key that was regenerated, an integration that was deleted, a Ghost that was
downgraded — none of these announce themselves. Inflozo finds out the next time somebody presses a
button, and the population most at risk is precisely the population that deployed once and stopped
signing in. Today nothing re-validates a stored credential after connect, `sites.health` has been
`healthy` on every row since Story 1.2 created the column, and the **Reconnect needed** state that
`S11 Sites.dc.html` draws and that `EXPERIENCE.md` promises as Manage keys' second entry point does
not exist. Three ledger entries wait on this story for the same reason: **DW-62** (a site connected
before Story 3.3 has never been probed at all), **DW-63** (the probe rewrites `ghost_version`
without connect's "4.x and older" rule) and **DW-78** (`admin_key_id` is never backfilled).

**Approach:** One function, `checkSite()`, and two callers — AD-33's daily cron for Epic 3, and the
customer's own **Re-check connection** on the ⋯ menu. It runs the probe Story 3.3 already built
(`probeSite`, which re-validates against `GET /admin/config/`, re-detects the version, re-runs the
`customThemes` probe and re-reads Portal and the announcement bar), adds the live `routes.yaml` read
and connect's version rule, then decides one thing: is this site healthy. A **transition** — and only
a transition — writes a `site_health` row into the notifications table AD-25 says this epic must
fill, and sends FR-P1's third email if the rolling 7-day cap allows it. Recovery resolves the row it
opened. The card reads the state and the open notification is where its reason and date come from, so
no column is added and this story has **no Schema phase**.

**And the card's controls come back to one place.** The owner's instruction of 2026-09-10 moves
**Use this site's brand** off the card body and into the ⋯, where the frame already puts every other
per-site action; **Re-check connection** joins it as the frame's own first row. DW-57's rule holds:
3.7 adds INTO the menu 3.5 built and onto the state line 3.3 made, and moves nothing else.

## Boundaries & Constraints

**Always:**

- **One health check, two callers, one code path.** `checkSite()` is the whole of it; the cron and
  the menu row differ only in who they act for and what they answer with. A second code path is how
  "the daily check is the same check you can ask for" quietly becomes false — the argument
  `server/site-probe.ts` already makes in its own header for its three callers, one level up.
- **`checkSite()` calls `probeSite()`; it does not re-implement it.** Everything FR-C5 lists except
  the routes read is already in that function and already executed against T1 and T3.
- **The decision is pure and lives in `lib/health-rule.ts`**, where `node --test` reaches the
  transitions no live Ghost can be made to produce: healthy→unhealthy, unhealthy→healthy,
  unhealthy→unhealthy, and each of those with and without the 7-day cap in the way. The cron and the
  action carry no branching of their own about what to send.
- **The email sends on a TRANSITION and never otherwise**, is capped at one per site per rolling 7
  days from `sites.last_health_email_at`, and a site that is already unhealthy sends nothing at all.
  A flapping site therefore writes notification rows and no email — FR-C5's own sentence, and
  FR-P2's guarantee that Inflozo does not nudge.
- **Recovery resolves.** A site returning to healthy stamps `resolved_at` on its open `site_health`
  notification row and clears `last_health_email_at`, so the next genuine outage is a fresh
  transition and not one the cap is still holding down. AD-25 names `resolved_at` as what makes the
  prune exemption safe rather than unbounded.
- **This story is the first emitter of `notifications`, so it DECLARES the `site_health` payload
  shape beside the enum and validates on write** (AD-25). `link` is `/sites?manage=<siteId>` — the
  Manage keys popup, which is what "Reconnect needed" is for; `data` carries `{ site_id, reason }`
  and no user text, because E13 builds its reader over rows three epics wrote.
- **The reason and the date on the card come from the open notification row**, read once per render
  for the whole list, exactly as the projects tally already is. `sites.health` is the state; the
  notification is the record of the transition. Nothing new is added to `sites`.
- **The version rule applies at re-detection (DW-63).** A Ghost that now reports 4.x or older is
  **unhealthy** with its own reason, and `ghost_version` is not overwritten with a version the
  chokepoint would then pin `Accept-Version` to. `versionVerdict` in `lib/connect-rule.ts` is the
  one rule; it is called, not restated.
- **The first cron run is a BACKFILL, not only a refresh (DW-62).** Every connected site is checked
  on the first pass, including the two the owner connected before the probes existed.
- **`GET /settings/routes/yaml/` is read with the stored Admin key alone** — executed on both
  majors, 200 each (`MEASUREMENTS.md` §37's trailing block, 2026-09-09) — hashed to
  `routes_live_sha256` and stamped into `routes_verified_at`. **Drift is a comparison against
  `routes_last_offered`, which nothing writes until Epic 7**, so today the read RECORDS and compares
  against nothing. Say that in the route's header rather than shipping a comparison that silently
  always passes.
- **A routes read that fails does not make a site unhealthy.** Health is about the credential and the
  version; `routes.yaml` is a file that may legitimately not be readable. It is logged by code and
  the rest of the check stands — the same rule `probeSite` already applies to itself.
- **R-98 on every new control.** **Re-check connection** is a real `<form action={recheckConnection}>`
  in the menu, its row `aria-disabled` + `aria-busy` with its own present-tense label while it works;
  it is not a `<button onClick>` and it is not an `<a href>` that mutates on a GET. **Reconnect** on an
  unhealthy card is a `PanelLink` to the Manage keys panel, which already carries its own busy state.
- **The Checking… state costs no client component.** The card's state line swaps to the amber dot and
  **Checking…** through a CSS `:has()` on the submit's own `aria-busy`, which the Kit already sets.
  With scripts off there is no busy attribute and no swap, which is correct — the click is a document
  navigation and the browser reports it. Under `prefers-reduced-motion: reduce` the pulse stops, by
  `globals.css`'s existing global rule; nothing new is needed for that and nothing may opt out of it.
- **Every word of the new copy lives in one object** beside `DISCONNECT` and `KEYS` in
  `lib/connect-rule.ts`, and the no-number assertion in `connect-rule.test.ts` is extended to cover
  it (standing rule 4). The 7-day cap and the daily schedule are constants that the copy never names.
- **The cron is AD-33's, at AD-33's home**: `apps/web/app/api/cron/site-health/route.ts`, its schedule
  in `apps/web/vercel.json` beside the purge job's, its owning epic named in the route's own header,
  `CRON_SECRET` checked before any database read, and a non-200 whenever anything failed — the purge
  route is the pattern and its reasons transfer whole.
- **Never a credential, an address or a site title in a log line** (spine, Security floor). The cron
  logs counts and codes.

**Ask First:**

- Any change to `ADMIN_WRITES`. Every call this story makes is a `GET`.
- Any new column on `sites`, or any migration at all. This story is specified to need none, and one
  appearing means the reason-and-date decision above was wrong — say so rather than adding it
  quietly, because a migration means an R-99 Schema phase pushed first, on its own.
- Adding a second scheduled job. AD-33's v1 set is closed; adding one means adding an owner.

**Never:**

- **Never send more than one email per healthy→unhealthy transition**, and never a reminder. FR-P2
  permits no nudges and the compatibility notice is the only carve-out — which is not in this story
  (see Question 1).
- **Never build the notifications centre.** This story writes rows; the bell and the feed are E13's
  (Story 13.4). A row written today with no reader is exactly what AD-25 asks for.
- **Never write `sites.capability` outside `probeSite`.** Preview-only sets and clears itself through
  the probe this check already calls; nothing here asserts it a second time.
- **Never let the health check disconnect a site or touch a credential.** An unhealthy site is a
  connected site with a badge. `disconnected_at` has one writer and it is Story 3.5's.
- **Never claim to have recognised another Ghost's key** (R-100). An unhealthy site whose Admin key
  is refused says Ghost refused it and offers the way to fix it; it does not diagnose why.
- **Never add a greyed control.** **Reconnect** appears only on an unhealthy card, where it can act;
  on a healthy card it is absent, not greyed (UX-DR3).

</frozen-after-approval>

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Daily run, healthy site | `health='healthy'`, Ghost answers `config/` 200 | `probeSite` writes what it always writes; `health` stays `healthy`, `last_checked_at` stamped, routes hashed. No notification, no email | N/A |
| Daily run, first ever check | A site connected before Story 3.3 (**DW-62**) | The same, and it is a BACKFILL: capability, Portal, announcement and brand are populated for the first time | A probe failure is a health failure like any other |
| Healthy → unhealthy | Ghost answers 401 `UNKNOWN_ADMIN_API_KEY` | `health='unhealthy'`; one `site_health` notification row with the reason, the date and `link=/sites?manage=<id>`; the email sends; `last_health_email_at` stamped | The email failing is logged and the row still stands — a send never undoes what it reports on (`lib/email.ts`) |
| Unhealthy → unhealthy | The same site the next day | Nothing sent, nothing inserted; `last_checked_at` moves. The open notification row is untouched | N/A |
| Unhealthy → healthy | The key was re-pasted through Manage keys | `health='healthy'`; the open row gets `resolved_at`; `last_health_email_at` cleared (R-101) | N/A |
| Two transitions inside 7 days | Healthy → unhealthy → healthy → unhealthy, all in one week | Two notification rows and **two** emails — the fix in between started the count again (**R-101**, owner, 2026-09-10). Healthy → unhealthy → unhealthy is two rows and **one** email: the second is not a transition | N/A |
| Ghost downgraded to 4.x | `config/` 200, `version` `4.48.0` (**DW-63**) | `health='unhealthy'` with the "no longer supported" reason; `ghost_version` **not** overwritten, so the chokepoint keeps pinning a major it can talk to | N/A |
| `routes.yaml` unreadable | 404, 403, or a body that is not YAML | Logged by code; `routes_live_sha256` and `routes_verified_at` left where they were; **health unaffected** | N/A |
| `routes.yaml` read | 200 on either major | `routes_live_sha256` = sha256 of the bytes, `routes_verified_at` stamped. No drift verdict — `routes_last_offered` is null until Epic 7 | N/A |
| Site has no Admin key | `credentials_present.admin` false | Skipped entirely: not checked, not marked unhealthy, `last_checked_at` untouched. A partially credentialed site is a first-class state (UX-DR7), not a fault | N/A |
| Disconnected record | `disconnected_at` set | Never selected. FR-C6's kept record is not a site | N/A |
| Cron called without the secret | No or wrong `Authorization` | 401 before any database read | An unset `CRON_SECRET` is also 401 |
| Cron: one site throws | Ten sites, one whose Ghost times out | The other nine complete; the run answers 500 so the red line exists in Vercel's log (DW-46 until NFR-9's Sentry) | Each site is its own `try` — `runPurge`'s shape |
| **Re-check connection** pressed | A connected site, the caller's own | The row says its present-tense label and refuses a second press; the card's state line shows the amber pulsing dot and **Checking…**; on return the badge, the reason and "Checked just now" are the fresh answer | A check that could not be finished redirects with `?health=<siteId>`, and that one card says so in `HEALTH.failed`'s words |
| **Re-check connection**, scripts off | The same, no JavaScript | The form posts natively, the page reloads with the fresh answer. No busy label and no pulse — the browser's own progress is the signal | Same redirect |
| **Re-check connection** on someone else's site | A forged `site_id` | Nothing happens and nothing is written — `siteOf` reads through the caller's session and RLS answers nothing | Returns quietly, as the four actions beside it do |
| **Use this site's brand** in the ⋯ | A site whose settings carry a brand | The same `PanelLink` behaviour it has today, one level up: plain click opens `/sites?brand=…` over the list, modified click and scripts-off take `/sites/brand?site=…` | Unchanged |
| …with no brand to offer | `hasBrand(brand)` false | The row is **absent**, not greyed (UX-DR3) | N/A |
| Unhealthy card | `health='unhealthy'` | Amber dot, **Reconnect needed**, the reason and date under it, and a **Reconnect** button that opens Manage keys — EXPERIENCE.md's promised second entry point | N/A |

## Code Map

- `apps/web/lib/health-rule.ts` -- **new, pure, and where the whole decision lives.** `healthOf(probe,
  version)` → `{ health, reason }` from `ProbeSummary`'s code plus `versionVerdict`; `transitionOf({
  was, now })` → `'opened' | 'resolved' | null`; `emailAllowed({ transition, lastEmailAt, now })` →
  boolean, holding the rolling-7-day cap as its one constant; `HEALTH_REASONS`, the code→sentence
  table, with no number and no date format in it. `node --test` covers the four transitions and both
  sides of the cap. Nothing here reaches a database or a network.
- `apps/web/server/site-health.ts` -- **new: `checkSite({ siteId, userId, route })`, the one health
  check.** Calls `probeSite()` (unchanged), then `call()` once more for `settings/routes/yaml/` and
  hashes it, then applies `healthOf`. Writes `health`, `last_checked_at` and the two `routes_*`
  columns through `supabaseAdmin()` — AD-7 makes all four server-asserted, which is why this file
  joins `server-wiring.test.ts`'s privileged-importer list beside `site-probe.ts`. It also carries
  the notification write and the email, because a transition is not something a caller may forget to
  act on. Returns `{ health, reason, changed }` for the caller's redirect and log line.
  **DW-78 closes here:** the check decrypts once a day anyway, so where `private.site_credentials`
  has a null `admin_key_id` it is filled from the key in hand, through `server/ghost-admin` and
  nowhere else — the lazy-fill-on-every-`call()` the ledger rejects is still rejected.
- `apps/web/app/api/cron/site-health/route.ts` -- **new: AD-33's Epic 3 cron, at AD-33's home.**
  `apps/web/app/api/cron/purge-accounts/route.ts` is the pattern and every one of its decisions
  transfers: `export const dynamic = 'force-dynamic'`, the `authorized()` check before any read,
  `Cache-Control: no-store`, each site its own `try`, and a 500 whenever anything failed. It selects
  `sites` where `disconnected_at is null` and `credentials_present->>'admin' = 'true'`, ordered by
  `last_checked_at` nulls first — which is the index the schema already draws (`:176`) and which makes
  the first run a backfill (**DW-62**). Its header names Epic 3 and FR-C5.
  `authorized()` is lifted out of `purge-rule.ts` into a shared home rather than copied.
- `apps/web/vercel.json` -- one `crons` entry beside the purge job's, at a different hour so the two
  never share a cold start.
- `apps/web/lib/health-email.ts` -- **new: FR-P1's third email.** `deletion-email.ts`'s header already
  says a transactional email is drawn from `supabase/auth/magic-link.html` and names this story; that
  file's shell — the paper, the 400px card, the mark, the ink button, the footer, the five escapes —
  moves into `apps/web/lib/email-shell.ts` and both callers use it. The email says which site, what
  Ghost said, the date, and one button to the Manage keys popup; it does not diagnose (R-100) and it
  never promises a second email.
- `apps/web/lib/connect-rule.ts` · `apps/web/connect-rule.test.ts` -- a `HEALTH` object beside `KEYS`:
  the two menu rows' labels and their busy twins, the two badge words, the **Checking…** word, the
  reason sentences' wrapper, the card's **Reconnect** label, and the one failure line. Extend the
  existing no-number assertion to it rather than writing a second one.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- **one new export, `recheckConnection`.** Its
  own route constant beside `DISCONNECT_ROUTE` and the three key routes (`:68-76`) — stamping this
  write `sites/connect` is the defect the review of 2026-09-09 caught. It is `recheckPlan`'s twin
  (`:612`): `siteOf`, `checkSite`, `revalidatePath`, and **both ways out redirect** — success to
  `/sites`, failure to `/sites?health=<id>` — for the reason `recheckPlan`'s own comment records.
- `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` -- **two rows added above the rule, in the
  frame's order** (`S11 Sites.dc.html:78-80`): **Re-check connection** with the frame's refresh glyph
  (the Kit's `Refresh`, `icons.tsx:140`, which is that glyph already), and **Use this site's brand**
  — the owner's instruction of 2026-09-10 — with a new swatch glyph. The rule and Disconnect stay
  below. **Re-check connection is a `<form>`, not an `<a>`**, because it mutates; its row uses
  `useSubmitting()` + the Kit's row class, the shape `account-menu.tsx`'s Sign out row already is.
  The frame's **Reconnect** row is drawn only on an unhealthy card, where it can act (UX-DR3).
- `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` -- **the brand block is deleted**, its
  `PanelLink`, `BRAND_COPY.offer` import and the `hasBrand` branch with it. `site-menu.tsx` receives
  `brand: boolean` and draws the row instead. The four probe blocks are untouched.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- the card's state line becomes the three
  states (`Connected` mint / `Reconnect needed` marigold / `Checking…` marigold, pulsing), the reason
  and date caption under the unhealthy one, and the **Reconnect** `PanelLink`. One more read beside
  the projects tally: the caller's open `site_health` notification rows, joined in memory the way
  `projectCounts` already is. `?health=` reads exactly as `?recheck=`, `?disconnect=` and `?moved=`
  do (`:88-95`), so one card owns the failure and no other claims it. DW-57 binds: nothing joins the
  pills line, the ⋯ stays in the header row's `margin-left:auto` slot.
- `apps/web/components/kit/icons.tsx` -- one new glyph, the brand swatch. **It is an extrapolation and
  the comment says so** (R-74): no frame draws a brand row in this menu, and the export's own brand
  symbol is S2c's 28px accent disc (`S2 Onboarding.dc.html:173`), which is a fill and not a line
  glyph — so the disc is drawn in the Kit's own hand at 1.5 stroke to sit beside `Key` and `Refresh`.
- `apps/web/app/globals.css` -- one `@keyframes` for the dot and its class. Nothing opts out of the
  `prefers-reduced-motion` block at `:169`; the pulse degrades through it like every other animation.
- `apps/web/server-wiring.test.ts` · `apps/web/busy.test.ts` · `apps/web/app-routes.test.ts` -- the
  three auditors that must stay green. `site-health.ts` and the cron route join the privileged
  importer list with their reasons; `busy.test.ts` gains the menu's new submit control. It is `tsc`
  inside `pnpm check`, not `busy.test.ts`, that guards a Kit `Submit`'s `busy` prop — recorded at
  Story 3.5's review and not to be leaned on again.
- `apps/web/health-rule.test.ts` -- the pure tests: four transitions, both sides of the cap, the
  version rule at re-detection, and the reason table carrying no number.
- `tools/probe/run-verify-site-health.py` -- this story's live steps against T1 and T3 (R-82),
  `run-verify-ghost-admin.py` as the pattern; **the docstring's step list is derived from the source,
  never retyped** (standing rule 4, and the correction Story 3.4 needed three times).
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-62, DW-63 and DW-78 close here.**
  **DW-64 stays open and is amended** to name this story's **Re-check connection** beside B15's
  **Re-check plan**: there are now two manual re-probe controls and still no throttle, deliberately —
  it is the customer's own site, their own key and their own Ghost, and a cooldown wants a rule
  nobody has decided. **DW-65 stays open**: the cron is the unattended writer the entry predicted,
  and it collides with nothing today because it is the only writer that runs while nobody is looking.
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:126,128,333` --
  standing rule 3. The Sites row gains the health badge as built; the Manage Keys row's *"and any
  'Reconnect needed' once Story 3.7 builds that state"* becomes a fact; the State Patterns row's
  *"health check spinner on the badge only"* is amended to the amber pulsing dot and **Checking…**
  the owner asked for on 2026-09-10.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/lib/health-rule.ts` + `apps/web/health-rule.test.ts` -- the pure decision: `healthOf`,
      `transitionOf`, `emailAllowed`, `HEALTH_REASONS` -- so the four transitions and the 7-day cap are
      executed rather than read off a route file.
- [x] `apps/web/lib/email-shell.ts` + `apps/web/lib/health-email.ts` -- lift the magic-link shell out
      of `deletion-email.ts`, then FR-P1's third email on it -- one email vocabulary, not two.
- [x] `apps/web/server/site-health.ts` -- `checkSite()`: `probeSite`, the routes read and hash,
      `healthOf`, the `sites` write, the notification row, the email, and DW-78's `admin_key_id`
      backfill -- one health check with two callers and no second code path.
- [x] `apps/web/app/api/cron/site-health/route.ts` + `apps/web/vercel.json` -- AD-33's Epic 3 cron on
      the purge route's shape, ordered `last_checked_at` nulls first -- so the first run is DW-62's
      backfill and the schedule has one home.
- [x] `apps/web/lib/connect-rule.ts` + `apps/web/connect-rule.test.ts` -- the `HEALTH` copy object and
      the extended no-number assertion -- one home for the words (standing rule 4).
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `recheckConnection` with its own route
      constant, redirecting both ways -- the audit log names the write that made it.
- [x] `apps/web/components/kit/icons.tsx` + `apps/web/app/globals.css` -- the brand swatch glyph and
      the pulse keyframes -- drawn in the Kit's hand, degrading under the existing reduced-motion rule.
- [x] `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` + `site-notices.tsx` -- add **Re-check
      connection** and **Use this site's brand** to the ⋯; delete the card's brand link -- the owner's
      instruction, and DW-57's "3.7 adds INTO this menu".
- [x] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- the three-state line, the reason and
      date, **Reconnect** on an unhealthy card, the open-notification read and `?health=` -- the badge
      the frame draws and Manage keys' second entry point.
- [x] `apps/web/server-wiring.test.ts` · `busy.test.ts` · `app-routes.test.ts` -- the two new
      privileged importers with their reasons, and the menu's new submit control.
- [x] `tools/probe/run-verify-site-health.py` -- the live steps against T1 and T3, with a deliberately
      broken credential on T3 and a real Resend send (R-82).
- [x] `deferred-work.md` · `EXPERIENCE.md` -- close DW-62, DW-63, DW-78; amend DW-64; propagate the
      three EXPERIENCE.md rows (standing rule 3).

### Review Findings (code review, 2026-09-10)

Five layers ran — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the
Real-infra verifier (R-82) — and every finding below was read at its location before it was rated.

- [x] [Review][Decision] **Ruled: option 2 (owner, 2026-09-10) — R-101; the clear is back and the tests say so.** The rolling 7-day cap can never fire — recovery clears `last_health_email_at`, so a site that flaps inside one week sends two emails. The frozen spec says both "capped at one per rolling 7 days" and "recovery clears the stamp"; the PRD's own FR-C5 says "regardless of transitions, at most one health email per site per rolling 7 days". The code now follows the PRD; the frozen bullet awaits the owner — **Question 2** below.
- [x] [Review][Patch] The cap survives recovery, the stamp is written only for a send that landed, and the whole write plan is pure and executed under `node --test` [apps/web/server/site-health.ts:194-212, apps/web/lib/health-rule.ts]
- [x] [Review][Patch] The email's preheader and body say "did not let us in" for every reason, including a Ghost that let us in and is too old [apps/web/lib/connect-rule.ts — `HEALTH.emailPreheader`, `HEALTH.emailBody`]
- [x] [Review][Patch] The `sites` write is not a compare-and-set: a cron pass and a Re-check on the same site can both see `healthy`, both open a row and both email; a disconnect between the read and the write is written over [apps/web/server/site-health.ts:194-212]
- [x] [Review][Patch] `runHealthChecks` has no time budget: BATCH × three 15-second calls is far past the function's limit, and a killed function answers no 500 and no log line [apps/web/lib/health-rule.ts:172, apps/web/app/api/cron/site-health/route.ts]
- [x] [Review][Patch] Story 3.4's harness still reads the brand offer off the card body and clicks a link that is now inside the closed ⋯ popover [tools/probe/run-verify-ghost-admin.py:1553-1557, 1659]
- [x] [Review][Patch] AD-25's `site_health` payload is neither declared nor validated on write: the writer, the card's reader and `resolveNotice` each spell `{ site_id, reason }` for themselves, and the four reason lookups use `in`, which answers true for `toString` [apps/web/lib/health-rule.ts, apps/web/server/site-health.ts:230-264, apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx:475]
- [x] [Review][Patch] `split_part(secret, ':', 1)` on a secret with no colon writes the whole secret into the non-secret `admin_key_id` column [apps/web/server/ghost-admin/index.ts:495]
- [x] [Review][Patch] `checkSite` returns a `changed` field nobody reads [apps/web/server/site-health.ts:131]
- [x] [Review][Patch] The harness: later steps index `copy` when the `copy` step failed and abort with a traceback; a no-op ternary at `config-200`; the notice link retyped rather than read from `keysPopupPath`; the docstring's `--url https://app.inflozo.com` example names a host on which the route 404s by construction [tools/probe/run-verify-site-health.py]
- [x] [Review][Patch] Nothing executes `CallResult.text` on a 200 with a non-JSON body — a `routes-stored` step reads `routes_live_sha256` back after `cron-run` and compares it to the sha the run hashed itself [tools/probe/run-verify-site-health.py]
- [x] [Review][Patch] This spec's Verification: the deployed command must use the apex (`app.inflozo.com` rewrites every path under `/app`, so `/api/cron/site-health` is a 404 there — reproduced, with `purge-accounts` as the control); the Dev row's "does not exist on the deployed build yet" was the wrong cause; the unhealthy→recovery round trip through `checkSite` is the owner's steps 6–8 and must say so; the matrix row says "could not reach Ghost" where the copy says "couldn't finish" [this file]
- [x] [Review][Patch] The key-id backfill runs after a refused probe, unlike the routes read, and the header does not say why [apps/web/server/site-health.ts:157]
- [x] [Review][Patch] An undecided site never moves `last_checked_at`, so it stays at the head of the nulls-first queue; `BATCH` such sites would starve every other — the ceiling is unnamed [apps/web/lib/health-rule.ts:155]
- [x] [Review][Patch] The ledger: DW-64 says the double-tap "no longer reaches the server", which is true only with scripts on; DW-65 restates the schedule as a literal "05:40" [_bmad-output/implementation-artifacts/deferred-work.md]
- [x] [Review][Patch] Story 9.1's FR line cites "FR-P1 email (3)'s one carve-out" — email (3) is this story's reconnect alert; the compatibility notice is FR-P2's carve-out [_bmad-output/planning-artifacts/epics.md:3558]
- [x] [Review][Patch] `recheckConnection`'s header says a forged `site_id` reaches `checkSite` and lands on `?health=<id>`; `siteOf` returns null first and the action returns quietly [apps/web/app/(app)/app/(authed)/sites/actions.ts:654-659]
- [x] [Review][Patch] DW-63's `floor.ok` gate on `ghost_version` in `probeSite` is observed by nothing [apps/web/health-rule.test.ts]

**Acceptance Criteria:**

- **Given** a connected site whose Ghost answers `config/` **When** the daily cron runs **Then**
  `last_checked_at` moves, the capability, Portal, announcement and version are re-read, the live
  `routes.yaml` is hashed into `routes_live_sha256`, `health` stays `healthy`, and no email is sent.
- **Given** a connected site whose Admin key Ghost now refuses **When** the check runs **Then**
  `health` becomes `unhealthy`, one `site_health` notification row is written with the reason, the
  date and a link to the Manage keys popup, and exactly one email is sent.
- **Given** that same site **When** the check runs again the next day **Then** nothing is sent and no
  second row is written.
- **Given** an unhealthy site whose key is re-pasted **When** the next check runs **Then** `health`
  returns to `healthy`, the open row is stamped `resolved_at`, and `last_health_email_at` is cleared
  (**R-101**, the owner's ruling on Question 2, 2026-09-10).
- **Given** a site that goes unhealthy, is fixed, and goes unhealthy again inside seven days **When**
  the second transition happens **Then** a second notification row is written and a second email is
  sent — the fix started the count again (**R-101**). **Given** a site that stays unhealthy **When**
  it is checked again **Then** no row and no email: not a transition.
- **Given** a Ghost that now reports 4.x **When** the check runs **Then** the site is `unhealthy` with
  its own reason and `ghost_version` is not overwritten (**DW-63**).
- **Given** a site connected before Story 3.3 **When** the first cron run happens **Then** it is
  probed for the first time and its capability, Portal and announcement are populated (**DW-62**).
- **Given** the cron is called without `CRON_SECRET` **When** it runs **Then** it answers 401 before
  reading anything.
- **Given** the Sites page **When** a site is unhealthy **Then** its card shows the amber
  **Reconnect needed** badge with the reason and date, and a **Reconnect** control that opens Manage
  keys — and **matches the frame** `S11 Sites.dc.html` S11a's second card (`:84-102` — the amber badge at `:94`, the **Reconnect** button at `:99` wearing the frame's own refresh glyph, and the reason caption at `:100`).
- **Given** the ⋯ menu **When** it is opened **Then** it shows **Re-check connection** and **Use this
  site's brand** above the rule with **Manage API keys**, and **Disconnect** in red below it — and
  **matches the frame** `S11 Sites.dc.html`'s menu (`:77-82`), whose Re-check row and glyph are its
  own; the brand row is the owner's addition of 2026-09-10 and its glyph is extrapolated from S2c's
  accent swatch (R-74).
- **Given** **Re-check connection** is pressed **When** the check is in flight **Then** the row says
  its present-tense label and is `aria-disabled` + `aria-busy` (R-98), a second press does nothing,
  and the card's state line shows an amber pulsing dot and **Checking…** until the answer lands.
- **Given** a browser with JavaScript off **When** **Re-check connection** is pressed **Then** the
  form posts natively and the page reloads with the fresh answer.
- **Given** `prefers-reduced-motion: reduce` **When** a check is in flight **Then** the dot does not
  pulse and the words are unchanged.
- **Given** any of these paths **When** anything is logged **Then** no credential, address or site
  title appears in a log line.
- **Given** the whole story **When** it is complete **Then** no migration was added and no column was
  added to `sites` — this story has no Schema phase (R-99).

## Design Notes

**The frame, and the three departures from it.** `S11 Sites.dc.html` S11a draws the ⋯ with four rows
— Re-check connection, Reconnect, Manage API keys, a rule, Disconnect — and draws the unhealthy card
with the amber dot, **Reconnect needed**, an outline **Reconnect** button and a caption beside it
("Key regenerated Aug 15"). All of that is built. Three departures, each recorded here and in
`HEALTH`'s own comment (R-74):

1. **A fifth row, "Use this site's brand", first.** The owner's instruction of 2026-09-10. It goes at
   the top because it is the one item that does something *for* the customer rather than *about* the
   connection, and because it is replacing the most prominent thing on the card — a coral link. It
   appears only where there is a brand to offer, absent otherwise (UX-DR3). Routine judgement, taken
   here; the manual test puts it in front of him.
2. **"Re-check connection", not "Check connection".** The owner wrote *Check connection*; the frame's
   own row says *Re-check connection*, and it sits three lines from B15's existing **Re-check plan**,
   which reads as its sibling. The frame's word is used. The manual test shows him the word so he can
   say otherwise in one line.
3. **"Reconnect" is drawn only on an unhealthy card.** As a permanent ⋯ row it would be a second name
   for **Manage API keys** directly beneath it — a menu with two rows that open the same panel is a
   menu that teaches people not to read it. On the unhealthy card it is the recovery action, which is
   what the frame draws it as, and it is Manage keys' second entry point that `EXPERIENCE.md:128`
   has been promising since Story 3.6.

**Why the reason and the date are not columns.** The state is `sites.health`; the record of the
transition — what happened, when, and where to go about it — is exactly the `site_health` notification
row AD-25 requires this epic to write, and `resolved_at` is what closes it. Two new columns would
duplicate a row that has to exist anyway, and would cost an R-99 Schema phase for the privilege. One
extra read per Sites render buys both.
`ponytail: one open-notification read per render, joined in memory like the projects tally; a
health_reason column the day that read shows up in a measurement.`

**Why the Checking… state needs no client component.** The Kit's busy behaviour already puts
`aria-busy="true"` on a submitting control, and the ⋯ menu is a DOM descendant of the card's
`<article>` even while the popover is in the top layer. So the state line selects on it:
`group-has-[[data-recheck][aria-busy=true]]` swaps the mint line for the amber one. No state, no
context, no card-wide client boundary, and the scripts-off behaviour falls out for free.
`ponytail: :has() off the submit's own aria-busy; a client card component the day two controls need
to disagree about what "busy" means.`

**Why the cron and the button are one function.** `server/site-probe.ts`'s header makes this argument
already for its own three callers, and this is the same argument one level up. A daily check that is
not literally the check a customer can ask for is a daily check nobody can reproduce when it says
something surprising.

**What the email is drawn from.** Not a frame — `deletion-email.ts` records that a transactional email
is not a drawn surface and names this story while doing it. The nearest drawn thing is the sign-in
email the same person has already received, so this rides its shell, which moves to
`lib/email-shell.ts` now that it has a second caller.

## Questions for the owner

Two. The first was asked at Create and **ruled the same day**; it is recorded here because the
ruling moved work out of this story and the propagation it required is listed with it. The second
was found at review on 2026-09-10 and **ruled the same day** (R-101).

### Question 1 — the "Ghost released a new version" announcement: build it now, or when there is a library to check?

**What it is.** The plan for this story has two halves. The first is everything above: Inflozo checks
your customers' sites every day and tells them when one needs attention. The second is a different
thing that happens to live in the same story — **one announcement to every Inflozo customer each time
the Ghost team releases a new version of Ghost**, saying either "we checked our designs against it and
all is well" or "these kinds of sections are affected, we recommend re-publishing".

**Why I am asking rather than just building it.** That announcement is supposed to be backed by a
check: Inflozo re-tests **its own library of ready-made sections** against the new Ghost and reports
what it found. **There is no library yet.** The sections customers will drag onto the canvas are built
in Epics 9, 10 and 11, and re-publishing a site is Epic 7. So if I build the announcement today, it is
a box you type a message into and a button that emails everybody — with nothing behind it, and no
"re-publish" link for anyone to follow.

**An example.** It is like printing "safety-checked by our workshop" stickers before the workshop
exists. The sticker machine works perfectly. There is just nothing being checked.

**What it costs either way.** Building it now is roughly a day of work that will need revisiting once
the library exists. Leaving it out costs nothing today — no customer can see a gap, because the thing
it would announce has not shipped.

**Your options:**

1. **Split it out, and build it in the story that first ships the section library to customers.**
   This story then does the daily health check, the reconnect email and the two new menu buttons — all
   of it, finished — and the announcement is written down in the ledger with its new home so it cannot
   be lost. **(RECOMMENDED)** — the announcement is only as good as the check behind it, and the check
   needs the library.
2. **Build it now anyway, as a message you write and send by hand.** You would get a page where you
   type an announcement and send it to every account, and we wire the real library check into it
   later. Useful only if you expect to want to email all your customers about something before the
   library ships.
3. **Build it now and wire it to Ghost's release feed automatically.** Not recommended, and not
   really available: we already established that Ghost's release notes cannot be read as structured
   data, so somebody writes the sentence either way.

**Ruled: option 1 (owner, 2026-09-10).** Split out, and filed as **DW-87** with its home named:
**Story 9.1** — A1 Headers' content model, stylesheet and designs #1-4, the first story that ships
designs to customers and the first in which any design declares `ghostCompat`. Propagated the same
day (standing rule 3): Story 3.7's two compatibility bullets in `epics.md` are struck with this
ruling's date, Story 9.1 gains the acceptance criterion, **AD-25** is amended so the spine says E3
writes `site_health` and **E9** writes `ghost_compat` rather than E3 writing both, and
`epic-3-context.md`'s requirement line says the same. **This story is unchanged by the ruling** — it
was already specified without the broadcast, and everything the notice will need to travel is built
here: the `notifications` rows, the email shell and FR-P1's "Reconnect needed" channel the notice
rides. The receiving story adds a trigger and a template, not a mechanism.

### Question 2 — after a site recovers, should the 7-day email cap still count, or start again?

**What it is.** When a site breaks, Inflozo emails you once. To make sure you are never nagged, there
is also a rule that says: **no more than one of these emails per site per week**, whatever happens.
The plan for this story had one more line in it: *when the site is fixed, forget the week's count*.
The review found that those two lines cannot both be true — a site that breaks, gets fixed, and
breaks again the same afternoon would get **two** emails in one day, because the fix wiped the count.

**An example.** Your Ghost key is regenerated on Monday and you get the email. You paste the new
key in on Tuesday and the card goes green. On Wednesday somebody regenerates it again. With the
plan's extra line you get a second email on Wednesday; without it you get none until the following
Monday, and the card and the notifications list still show what happened.

**What the PRD says.** FR-C5's own words are "regardless of transitions, at most one health email
per site per rolling 7 days". The review has made the code follow that sentence, so the week's count
is kept across a fix. The spec's plan still carries the old line, and it is yours to strike.

**Your options:**

1. **Keep the week's count across a fix** — one email per site per week, full stop; the card and
   the notifications list carry every later break. **(RECOMMENDED)** — it is what the PRD says and
   what the code now does; nothing more to build.
2. **Start the count again when a site is fixed** — a second break the same week emails again. One
   line of code goes back; the PRD's sentence would need to change to match.

**Ruled: option 2 (owner, 2026-09-10).** Filed as **R-101** in `reconcile-designs-decisions.md`.
The week's count starts again when a site is fixed: `writePlan` clears `last_health_email_at` on a
recovery, `health-rule.test.ts` asserts it, the matrix row and the acceptance criterion above say
two emails for break → fix → break in one week, and the PRD's FR-C5 sentence is amended to match.
The frozen "Recovery resolves" bullet stands as written.

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. You will need the Ghost site you connected
for Story 3.5 or 3.6, and Ghost Admin open in another tab. **Steps 6 and 7 deliberately break a site
and then fix it** — nothing is lost, and step 7 puts it back.

1. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** sign in and look at your
   connected site's card. · **See:** a green dot and **Connected**, and under it **Checked …** with
   how long ago. Nothing below the card says "Use this site's brand" any more — that link has moved.
2. **URL:** same · **Screen:** Sites · **Do:** click the **⋯** on the card. · **See:** the menu now
   has five things: **Use this site's brand** at the top with a small colour-swatch symbol, then
   **Re-check connection** with a circular-arrow symbol, then **Manage API keys**, then a thin line,
   then **Disconnect** in red. *(You asked for "Check connection"; the drawn design calls this row
   "Re-check connection" and there is already a "Re-check plan" button elsewhere on this page, so I
   used the drawn wording — say the word and I will change it.)*
3. **URL:** same · **Screen:** Sites · **Do:** click **Use this site's brand**. · **See:** exactly what
   the old link under the card did — the brand window opens over your Sites list, your cards still
   behind it, the top bar still above it.
4. **URL:** same · **Screen:** Sites · **Do:** close that window, open the **⋯** again and click
   **Re-check connection**. · **See:** the menu row changes its own words to say it is working and
   stops responding to a second click; **at the bottom of the card the green Connected turns into an
   amber dot that gently pulses, with the word Checking…**. A moment later it goes back to green
   **Connected** and the line under it now reads **Checked just now**.
5. **URL:** same · **Screen:** Sites · **Do:** press **Re-check connection** again and, while it is
   working, press it again as fast as you can. · **See:** nothing bad — one check, one answer. The
   card never goes blank and no second window appears.
6. **URL:** Ghost Admin → **Settings → Integrations → Inflozo** · **Screen:** Ghost Admin · **Do:**
   press **Regenerate** on the **Admin API key** and do **not** copy it anywhere. Then go back to
   `https://app.inflozo.com/sites` and press **⋯ → Re-check connection**. · **See:** after the amber
   **Checking…**, the card settles on an **amber dot and "Reconnect needed"**, with a short line under
   it saying your Ghost refused the key and today's date. A **Reconnect** button appears on the card;
   pressing it opens the same **API keys** window you know from Story 3.6.
7. **URL:** your email inbox · **Screen:** your inbox · **Do:** wait a minute or two. · **See:** **one**
   email from Inflozo naming that site, saying what Ghost said and offering a button that takes you
   straight to that site's API keys window. Then press **⋯ → Re-check connection** on the card again,
   twice. · **See:** the card stays **Reconnect needed** and **no second email arrives** — that is the
   rule working, not a failure.
8. **URL:** `https://app.inflozo.com/sites` · **Screen:** the API keys window · **Do:** copy the new
   Admin API key out of Ghost Admin, paste it in, save, then press **⋯ → Re-check connection**.
   **Dummy data:** the regenerated Admin API key. · **See:** the card goes back to a green
   **Connected** with **Checked just now**, and the reason line is gone.
9. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** if your computer or browser
   has "reduce motion" turned on (macOS: System Settings → Accessibility → Display → Reduce motion),
   turn it on and press **Re-check connection** once more. · **See:** the card still says
   **Checking…** with the amber dot, but the dot does not pulse. *(Skip this step if you would rather
   not change that setting — it is a nicety, not a defect if untested.)*

## Verification

Run all of these; every one must be green before the phase is committed. **R-82: the review and the
owner's test run on the real infrastructure**, never on mocks alone — record what each service
returned, by the key's variable name and never its value.

**Commands:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) -- expected exit 0: lint and
  types clean, every test passing, `health-rule.test.ts`, `busy.test.ts`, `app-routes.test.ts`,
  `server-wiring.test.ts` and `connect-rule.test.ts` among them. Report the count the run prints;
  never carry one forward.
- `pnpm build` -- expected exit 0, "Compiled successfully", and the route table showing
  `ƒ /api/cron/site-health` beside `ƒ /api/cron/purge-accounts`.
- `bash supabase/tests/run-rls-gate.sh` -- expected exit 0. **There is no migration in this story**, so
  this is a control and not a gate on a change: it must pass unchanged, and a schema drift reported
  here means something added a column that this spec says it must not.
- `python3 tools/doc-audit.py --check`, twice -- expected PASS with 0 warnings (the first call
  regenerates, as its sub-tools do).
- `python3 tools/probe/run-verify-site-health.py --check` -- expected all steps passing, printing this
  story's copy read out of the app itself rather than retyped.
- `python3 tools/probe/run-verify-site-health.py` (its default is the apex, `https://inflozo.com`) --
  expected all steps passing against the deployed build. **Never `--url https://app.inflozo.com`:**
  `routing.ts` rewrites every path on the app host under `/app`, so `/api/cron/site-health` is a 404
  there by construction (reproduced at review with `purge-accounts` as the control) and Vercel
  invokes the schedule on the apex.

**Real services this story must touch (R-82), and what each must be seen to answer:**

- **T1 `ghost6.inflozo.com` (6.58.0)** and **T3 `ghost5.inflozo.com` (5.130.6)**, keys read by name
  from `tools/probe/.env` — `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST5_URL`,
  `GHOST5_ADMIN_API_KEY`. `GET /admin/config/` 200 on both (the healthy control);
  `GET /settings/routes/yaml/` 200 on both, with the sha256 recorded.
- **A deliberately broken credential on T3** — the unhealthy CAUSE, executed rather than
  simulated: T3's key with one hex digit of its `kid` changed answers the 401
  `UNKNOWN_ADMIN_API_KEY` that `healthOf` turns into "Reconnect needed", and T3 itself is untouched
  (no `RESET-PROTOCOL.md` run owed). T1 stays the control (standing rule 2). **The round trip
  through `checkSite` on a real site row — amber, the email, the second press sending nothing, the
  recovery — is deferred to the owner's manual test, steps 6–8, on his own site** (R-80); no run
  before Deploy executes it, and this section says so rather than implying otherwise (review,
  2026-09-10).
- **A real Resend send** through `RESEND_API_KEY` / `RESEND_FROM` — one message, its id recorded, and
  the second transition inside the same week recorded as **not sent**.
- **Supabase** — the `notifications` row written and then `resolved_at` stamped, read back through
  the caller's own session so RLS is what proves it is theirs.
- **The deployed cron** — `GET /api/cron/site-health` with the wrong `Authorization` answering 401,
  and Vercel's own scheduled invocation observed in the log after Deploy.

### What the Dev phase ran, and what each answered (2026-09-10)

Every command below was executed at this story's Dev commit. Keys are named by their variable name
only; no value was printed, and no output recorded here carries one.

| Command | Answered |
|---|---|
| `pnpm check` (Node 24 on PATH) | exit 0 — `apps/web` **261 tests, 261 pass, 0 fail, 0 skipped**; `ghost-shim`, `section-runtime`, `theme-compiler` 1 pass each. `health-rule.test.ts`, `busy.test.ts`, `app-routes.test.ts`, `server-wiring.test.ts`, `connect-rule.test.ts`, `purge.test.ts` and `tokens.test.ts` among them |
| `pnpm build` | exit 0, "Compiled successfully", route table carries `ƒ /api/cron/site-health` beside `ƒ /api/cron/purge-accounts` |
| `bash supabase/tests/run-rls-gate.sh` | exit 0 — the control held unchanged, so **no column and no migration were added** (the last acceptance criterion, and R-99: this story has no Schema phase) |
| `python3 tools/doc-audit.py --check`, twice | PASS, 0 warnings, both runs |
| `python3 tools/probe/run-verify-site-health.py --check` | **all 11 steps PASS** — the live run below |
| `python3 tools/probe/run-verify-site-health.py --url https://app.inflozo.com` | The three `cron-*` steps answered **404**. Recorded at Dev as "the route does not exist on the deployed build yet"; **the review found the real cause** — the route existed (production was on the Dev commit) but the app host rewrites every path under `/app`, so it is a 404 there by construction. The command is the apex's, above |

**The real services this story hit (R-82), and what each returned:**

- **T1 `ghost6.inflozo.com`** — `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`. `GET /admin/config/` **200**,
  version `6.58.0`. `GET /settings/routes/yaml/` **200**, 130 bytes,
  `content-type: application/yaml; charset=utf-8`, **not JSON-parseable** — which is why
  `CallResult` had to start carrying `text`; sha256
  `b2d675260a6071be426ac6a67ea60da9428f6169e03e25cb14cc2d7ed74381a1`.
- **T3 `ghost5.inflozo.com`** — `GHOST5_URL`, `GHOST5_ADMIN_API_KEY`. `GET /admin/config/` **200**,
  version `5.130.6`. `GET /settings/routes/yaml/` **200**, the same 130 bytes and the same sha256, so
  **the read needs no Staff token on either major** (the claim `MEASUREMENTS.md` §37 made, executed
  here again as this story's own).
- **The unhealthy cause, executed — and a departure from the plan above, recorded rather than
  glossed.** The plan said *regenerate T3's Admin key through Ghost Admin*. What ran instead:
  T3's key with **one hex digit of its `kid` changed** — a key Ghost has never issued — answering
  **401 `UNKNOWN_ADMIN_API_KEY`**. It is the same lookup miss and therefore the same answer, because
  `api_keys` carries no install identity for Ghost to test against (§37, R-100); it leaves T3
  untouched, so no `RESET-PROTOCOL.md` run is owed and T1 stays the clean control (standing rule 2).
  **The regenerate-and-recover round trip is the owner's own test, steps 6–8**, on his site.
- **The app's own rule over what the wire answered** — `ghostCode(401, UNKNOWN_ADMIN_API_KEY)` →
  `ghost_unknown_key` → `unhealthy` with its sentence; both 200s → `healthy`; `4.48.0` →
  `unhealthy` / `ghost_too_old` (**DW-63**, the one branch no test Ghost can produce);
  `ghost_unreachable` → **undecided**, so no badge and no email.
- **Supabase** — `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`. The cron's own
  query on the live table: **HTTP 200, 2 sites due, both never checked** and therefore first on the
  next run — **DW-62's backfill in evidence**, and PostgREST accepting both the
  `credentials_present->>admin=eq.true` jsonb filter and the `last_checked_at` NULLS FIRST order
  (each would otherwise have been a 400 at 05:40 with nobody watching). A `site_health` row written
  for one throwaway account and read back through **each account's own session**: the owner sees 1
  open row, the other sees **0**, a user-session insert is **403** and a delete is **403**;
  `resolved_at` stamped through `resolveNotice`'s own `data->>site_id` filter, after which the owner
  sees **0** open. Every fixture deleted in a `finally`.
- **Resend** — `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TEST_INBOX`. One message, composed by the
  app's own `healthEmail` and not by the harness, accepted **2xx**, id
  `39408814-c43f-4dbe-80bf-2ca541867cb8`. A 2xx is where a harness's knowledge of an email ends
  (**DW-22**) — the owner reads the real one at step 7, and the *second* transition inside the same
  week is proved not-sent by `emailAllowed`'s executed cap rather than by a second send.
- **Vercel** — the schedule and the app agree by reading both sides: `vercel.json` schedules
  `40 5 * * *` on the path `CRON_PATH` names, one other job at a different hour, and a `route.ts`
  really there. `CRON_SECRET` is present by name. **The deployed cron's own 401 and Vercel's
  scheduled invocation in the log are the Deploy phase.**
- **Dodo** — not touched. This story reads no plan and writes no entitlement.

### What the Review phase ran, and what each answered (2026-09-10)

Five review layers ran over the diff since the baseline commit; the findings and their disposition
are under `### Review Findings` above (every patch applied; one question open for the owner). Every
command below ran at the review's own tree with the patches in; keys by variable name only.

| Command | Answered |
|---|---|
| `pnpm check` (Node 24 on PATH) | exit 0 — `apps/web` **268 tests, 268 pass, 0 fail, 0 skipped**; `ghost-shim`, `section-runtime`, `theme-compiler` 1 pass each. New among them: the write plan's four transitions and the stamp's two owners (the send and the fix, R-101), the out-of-time run, AD-25's payload round trip, the own-key reason lookup, the compare-and-set and DW-63's gate read off the source |
| `pnpm build` | exit 0, "Compiled successfully", route table carries `ƒ /api/cron/site-health` beside `ƒ /api/cron/purge-accounts` |
| `bash supabase/tests/run-rls-gate.sh` | exit 0 — the control held unchanged; **no migration and no column** (R-99) |
| `python3 tools/doc-audit.py --check`, twice | first run regenerated the story board (expected after a commit), second PASS, 0 warnings |
| `python3 tools/probe/run-verify-site-health.py --check` | **all 11 steps PASS**; the `notice-rls` row's `link` and `data` are now composed by the app's own `keysPopupPath` and `siteHealthData` |
| `python3 tools/probe/run-verify-site-health.py` (the apex) | **all 15 steps PASS** — `cron-no-header` 401 / `no-store` / `x-matched-path: /api/cron/site-health`, `cron-wrong-secret` 401, `cron-run` **200 `{checked: 2, unhealthy: 0, failed: 0}`**, and the new **`routes-stored`**: both live sites (T1 and T3) carry the sha this run hashed off the wire and a fresh `routes_verified_at` — `CallResult.text` executed end to end on a 200 that is not JSON |
| `python3 tools/probe/run-verify-site-health.py --url https://app.inflozo.com` | the three `cron-*` steps **404** (`x-matched-path: /404`), `purge-accounts` on the same host 404 as the control, the same route on the apex 401 — the host, not the route. The command and the docstring now say so |

**The real services the review hit (R-82), and what each returned:**

- **T1 `ghost6.inflozo.com`** and **T3 `ghost5.inflozo.com`** — `GHOST6_*`, `GHOST5_*`: `config/`
  200 on both (`6.58.0`, `5.130.6`); `settings/routes/yaml/` 200 on both, 130 bytes, sha256
  `b2d675260a6071be426ac6a67ea60da9428f6169e03e25cb14cc2d7ed74381a1`. **Negative control** on
  BOTH servers and BOTH endpoints: one hex digit of the `kid` changed → 401 `UNKNOWN_ADMIN_API_KEY`
  four times, with the good key's 200 alongside each.
- **Supabase** — `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, and the hosted
  schema read through `SUPABASE_DB_POOLER_URL` (R-99): every column the code writes is there —
  `sites.health` (enum `healthy, unhealthy`), `last_checked_at`, `last_health_email_at`,
  `routes_live_sha256`, `routes_verified_at`, `ghost_version`; `notifications` with
  `notification_kind` carrying `site_health`, `resolved_at`, `link`, `data`; owner-read and
  owner-mark policies only, no insert policy for `authenticated`; `private.site_credentials.admin_key_id`;
  the partial index on `sites(last_checked_at) where disconnected_at is null`. **After the deployed
  cron's run:** both live sites `health=healthy`, `last_checked_at` stamped (one had been NULL —
  **DW-62's backfill executed on production**), `routes_live_sha256` = the T1/T3 sha, and
  `admin_key_id` **non-null on both** (**DW-78's backfill executed on production**). The harness's
  `site_health` fixture row: owner sees 1, the other account 0, user-session insert 403, delete 403,
  `resolved_at` stamped through `data->>site_id`, owner then sees 0; deleted in the `finally`.
- **Resend** — `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TEST_INBOX`: one message per harness run,
  composed by `healthEmail`, 2xx each (ids `e39f3592-…`, `0829782a-…`, `f1bae3c6-…` from the
  verifier's runs; `869fe8ae-…` and `66d25424-…` from the post-patch runs, the last two carrying the
  corrected preheader and body). The second transition inside a week is proved not-sent by
  `writePlan`'s executed cap, not by a second send.
- **Vercel** — `VERCEL_TOKEN`, `VERCEL_PROJECT`, `VERCEL_TEAM_ID`: the latest READY production
  deployment was the Dev commit while the verifier ran, so the schema check above is against the
  code that was live. The scheduled invocation (`40 5 * * *` UTC) had not come round; the manual
  `cron-run` stands in for it until Deploy.
- **Dodo** — not touched.

**Not executed by any run, said plainly:** the unhealthy → recovery round trip through `checkSite`
on a real site row (amber card, the email to a real inbox, the capped second press, the recovery) —
that is the owner's steps 6–8, on his site, and the concurrent-write compare-and-set, which the
executed source assertion covers and no harness can race. **Story 3.4's harness**
(`run-verify-ghost-admin.py`) was patched for the moved brand row but **not re-run** here — it
drives a full connect on the deployed site and belongs to the Deploy phase, where it always runs;
its brand steps are the ones to watch there.

**The matrix audit.** Every row of the I/O & Edge-Case Matrix maps to a check that ran and passed
above. One row had none when the implementation returned — *`routes.yaml` unreadable* — and it now
has `health-rule.test.ts`'s **"an unreadable routes.yaml leaves health and both routes columns
alone"**: `healthOf` takes the probe and the version and nothing else, the two `routes_*` columns are
written only behind the answer, and each of `readRoutes`' three failure paths returns the same
`null`. Its control was run — making the spread unconditional turns it red, restoring the file turns
it green — because a test that cannot fail is not a test (standing rule 2).

### Deploy phase, 2026-09-10 — production confirmed READY at HEAD; no migration owed

**No schema.** This story adds no column and no migration (R-99: no Schema phase), so Deploy's job is
confirming HEAD is what production serves, not applying anything.

- **Deployment: `https://inflozo-c9wfzbqq6-umangkagathara.vercel.app`
  (`dpl_7X9NnLxzg1eMtAFnaQnbYJwW6ZVd`)**, `target=production`, **`READY`**, `githubCommitSha`
  `44efa14098a18dd8886682e05194945819bdcf22` — `git rev-parse HEAD` at the start of this phase
  (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`).
- **Aliased**: that deployment's own alias list carries `app.inflozo.com`, `inflozo.com`,
  `www.inflozo.com` — production is serving this commit.
- **CI**: `GET /repos/Inflozo/inflozo/actions/runs?head_sha=44efa14098a18dd8886682e05194945819bdcf22`
  (`GITHUB_TOKEN`) — run `34500150250`, `CI`, **completed / success**.
- `bash supabase/tests/run-rls-gate.sh` — exit 0, the control held unchanged.
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings**, both runs.

**The Story 3.4 harness (`run-verify-ghost-admin.py`), and what it found.** The Review phase patched
this harness for the moved brand row (the ⋯ menu, `site-menu.tsx`) but did not re-run it, naming
Deploy as where it belongs. `--check` (plumbing only) passed cleanly. The full run against
`https://app.inflozo.com` was attempted **three times** and every attempt hit **DW-68** — the
already-ledgered, open, intermittent hang on an authed page/action of the deployed app — before
completing: run 1 logged one retried `page.goto` to `/sites/brand?…` and then still failed to finish
inside the harness's 1200s ceiling; runs 2 and 3 produced no `note:` line at all, hanging somewhere in
the flow's first authed page with nothing to name. DW-68's own record already says a clean run is
roughly a coin flip and has cost as many as four runs before one landed (Story 3.6 Deploy); three
straight misses is bad luck within that, not new. **Read before being believed (DW-68's own rule):** a
raw HTTP check, not Playwright — create a fixture user via the Admin API, follow `/auth/confirm` with
its `hashed_token`, then `GET /sites` in the same session — answered **200 in 1.95s** and **200 in
0.84s** respectively, confirming the deployed app (including this story's new `notifications` read on
the Sites page) is fast and healthy right now. The hang is therefore Playwright/harness-side, the
shape DW-68 already describes, and not a product regression. **Not proved live by this harness as a
result**: the moved ⋯ menu rows and the brand-row relocation specifically — that is what the owner's
manual test steps 1–3 below prove directly, on his own account, today. Appended to DW-68's ledger
entry (standing rule 3) rather than opened as a new one.
- `python3 tools/probe/run-verify-site-health.py --check` and `... ` (apex) — not re-run in this
  phase: the Review phase already ran both to green against this exact commit (all 11, then all 15,
  steps PASS) and nothing has changed in the tree since.
