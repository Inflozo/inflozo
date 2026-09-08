---
title: 'Story 3.3 — The connect-time probes: Preview-only, code injection, Portal and the announcement bar'
type: 'feature'
created: '2026-09-08'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story, connecting a Ghost site does not just check the keys — it *looks* at the site and
works things out for itself, so nobody is ever asked "which Ghost plan are you on?" when Inflozo can
find out. It reads whether your site has code injection switched on and, if it does, shows you one
sky-blue note on the Sites page that says your live pages can legitimately look different from the
canvas — you press **Got it** and it never comes back for that site. It also quietly reads Ghost's
subscribe-button setting and your announcement bar (both used by later stories), and if the site
turns out to be on a Ghost plan that forbids custom themes it marks the site **Preview-only** — sky,
not red — with a short card saying what that means and the two things that clear it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.2 connects a site and reads `GET /admin/site/` for the public url, and stops
there. FR-C2's four probes are unbuilt: `hostSettings.limits.customThemes` (Preview-only), the
one-boolean code-injection check and its one-time notice, Portal's floating-button state, and the
announcement bar's three settings that FR-C4 seeds from. Four `sites` columns exist and nothing
writes them (`capability`, `capability_source`, `site_settings` beyond `public_url`,
`code_injection_notice_shown_at`), the `ghostpro_preview_probe` flag row is seeded off with no
reader, B15 is drawn and unbuilt, and DW-54 records that `call()` — the decrypt path — has had no
product caller since the verify route was deleted.

**Approach:** One server-side probe over a **stored** credential — `call()` on `GET /admin/config/`
and `GET /admin/settings/` — that returns a patch and writes it: `ghost_version`, `capability`,
`capability_source`, and `site_settings` gaining `code_injection` (one boolean, payload discarded),
`portal_button` with its source, and the three `announcement_*` values. Connect runs it after
`store()`; **Re-check plan** re-runs it; Story 3.7's cron will call the same function. The Sites card
gains a Preview-only chip on its state line and, below it, whichever of four blocks applies — the
one-time code-injection notice, the Portal question, the plan question, and B15's Preview-Only
Notice. The Ghost(Pro) branch reads the flag row and stays off in production.

## Boundaries & Constraints

**Always:**
- **The probe runs on a STORED key, through `call()`** (`server/ghost-admin/index.ts:211`), never on
  a key held in a variable. That is deliberate: it is the first product caller of the decrypt path
  and closes DW-54's third gap, and it makes connect, Re-check and 3.7's cron literally the same
  code. Two GETs, `config/` and `settings/`, each leaving its own `admin_read` audit row and each
  preceded by a `vault_decrypt` row (`index.ts:181-203`).
- **Probes, never questions.** A question exists on exactly one path each: the plan question only
  when `hostSettings` is present and its shape cannot be read; the Portal question only when
  `portal_button` is not a boolean in the payload. There is no plan field anywhere else and no
  question in the happy path (FR-C2, FR-C8).
- **Preview-only is behind `ghostpro_preview_probe`** — read through `lib/flags.ts`'s reader pattern,
  per request, fail-closed. Flag off (the production seed) → `capability` stays `full`,
  `capability_source` stays `probe`, and the plan question is never asked. `hostSettings` absent
  means self-hosted and unlimited (executed, MEASUREMENTS §15h item 2).
- **`customThemes` is an allowlist of theme names, not a boolean** (read in source, EXPERIENCE.md
  F5). Inflozo's theme name is `inflozo-{project-slug}` and is not frozen until first deploy
  (FR-J10), so at connect the test is whether the allowlist admits **any** name Inflozo could ever
  use — an entry beginning `inflozo-`. No such entry → Preview-only. The Ghost(Pro) payload is
  **unobserved** (⛔ §4 T4): the rule is pure and unit-tested against a synthesised Starter payload
  labelled as unobserved, and only the absence branch is executed live.
- **The code-injection payload is computed to one boolean and discarded.** `codeinjection_head` and
  `codeinjection_foot` are read, OR'd into `site_settings.code_injection`, and neither string is
  stored, returned to a client, logged, or put anywhere a render path could reach (NFR-3, FR-C2).
- **The notice is one-time and the fact is the column.** It shows while
  `site_settings.code_injection` is true and `code_injection_notice_shown_at` is null; **Got it**
  stamps the column and it never returns for that site.
- **Portal defaults to on.** Unreadable → `portal_button: true`, `portal_button_source: 'default'`,
  and the one question appears; answering writes the boolean and `'declared'`. Readable →
  `'probe'`, no question. The daily check re-reads it (3.7), so `'probe'` always wins later.
- **The announcement is READ and STORED, not rendered.** `announcement_content`,
  `announcement_background` and `announcement_visibility` (a JSON *string*, §15h item 21) go into
  `site_settings.announcement` verbatim, for FR-C4's seed in Story 3.4. Nothing in this story draws
  a bar.
- **The frame is `B Missing Surfaces.dc.html` B15** (`:1188-1225`) and the Preview-Only Notice
  matches it: the sky panel with its info glyph, the cause sentence in Ghost's terms, the
  **What clears this** pair — "Publisher or higher" (EXPERIENCE.md:628, never "Creator") and
  self-hosted — and **Re-check plan**. The card's own state chip is sky and reads "Preview-only".
  Widths 1440 / 834 / 390; one coral focus ring; zero axe violations at 1440 and 390.
- **DW-57 binds the card.** The pills line stays metadata; the Preview-only chip joins the **state
  line** beside "Connected", because it is the connection's state; nothing moves what the owner
  moved. The ⋯ button is still absent (3.5).
- **A probe failure is not a connect failure.** `config/` has already passed with the typed key by
  the time the probe runs; a probe that throws leaves the site connected, `capability` `full`,
  `settings_read_at` untouched, and logs a code with no value. The user sees a connected site.
- **Never log a key, never echo one, never name a value.** Every `console.error` carries a code
  (spine, Security floor).
- R-81: every phase commits and pushes as `Story 3.3 - <Phase> - <one line>`. R-82: Review and the
  harness run against `app.inflozo.com`, T1 and T3, every key read by name from `tools/probe/.env`.

**Ask First:**
- Any Admin API path beyond `config/` and `settings/`; any non-GET; any change to `ADMIN_WRITES`.
- Any new `sites` column or migration — this story needs none.
- Any **write to a test Ghost's settings** from the harness (Question 1). Until he rules, the
  harness reads only.
- Storing, logging or returning any part of a `codeinjection_*` value, for any reason.

**Never:**
- The Staff Access Token (E7). The announcement-bar seed, the A2 placement and the consented
  "turn Ghost's own bar off" (3.4). The ⋯ menu, Disconnect, S11c's ghost slot (3.5). Manage keys
  (3.6). The daily check, the reconnect email, "Reconnect needed" (3.7). Export theme zip and
  Ship it — neither path exists in any epic yet, and a control that could never act is absent, not
  greyed (UX-DR3); they arrive with E11 and E7.
- A second privileged client, a second `postgres` importer, SQL naming `vault.` or `private.`
  outside `server/ghost-admin/`.
- Asking the user anything the probe can answer. Editing the design export, a `record` document, or
  a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Self-hosted connect | T1 / T3, key stored | `config/` has no `hostSettings` → `capability: 'full'`, `capability_source: 'probe'`; `settings/` fills `site_settings`; `settings_read_at` stamped | N/A |
| Code injection set | `codeinjection_head` non-empty | `site_settings.code_injection: true`; the sky notice on the card; the payload is nowhere in the DB, the response or the HTML | N/A |
| Notice dismissed | **Got it** pressed | `code_injection_notice_shown_at` stamped; the notice is gone and stays gone across reloads and re-probes | a failed write logs a code and the notice stays |
| No code injection | both keys empty/absent | `code_injection: false`; no notice, ever | N/A |
| Portal readable | `portal_button: false` | `site_settings.portal_button: false`, `portal_button_source: 'probe'`; no question | N/A |
| Portal unreadable | key absent or not a boolean | `portal_button: true`, source `'default'`; the one question, "Yes" preselected as the default | answering writes `'declared'` |
| Announcement present | the three keys | `site_settings.announcement = { content, background, visibility }` verbatim; nothing drawn | missing keys stored as null |
| Ghost(Pro), flag on, no `inflozo-` entry | `hostSettings.limits.customThemes: ['casper', …]` (**synthesised — unobserved**) | `capability: 'preview_only'`, source `'probe'`; the chip and B15 | N/A |
| Ghost(Pro), flag on, unreadable shape | `hostSettings` present, `limits` not an object | `site_settings.plan_ask: true`; the plan question | answer sets `capability` + source `'user_declared'`, clears `plan_ask` |
| Flag off (production seed) | any `hostSettings` | `capability` untouched (`full`); no chip, no B15, no plan question | flag read fails → off |
| Re-check plan | pressed on a Preview-only card | the same probe re-runs; a site that now allows custom themes clears to `full` on its own | probe failure → the card is unchanged and a banner says to try again |
| Probe throws | Ghost times out after `store()` | site stays connected; `capability` `full`; `settings_read_at` untouched; a code logged | N/A |
| No stored key | `call()` answers `credential_missing` | probe returns nothing written | logged, connect still succeeds |

</frozen-after-approval>

## Code Map

- `apps/web/lib/probe-rule.ts` + `apps/web/probe-rule.test.ts` -- **new, pure**: `injectionFlag(settings)`
  (one boolean from `codeinjection_head`/`_foot`, the payload never leaving the function),
  `portalState(settings)` → `{ portal_button, portal_button_source }`, `announcementOf(settings)`,
  `capabilityOf(hostSettings, flagOn)` → `{ capability, capability_source }` | `{ ask: true }` | null,
  and `PREVIEW_COPY` (B15's sentences, so the harness reads the app's own words rather than retyping
  them — `connect-rule.ts`'s `SITES_EMPTY` is the pattern). Server-only by convention; nothing in it
  imports React or the client.
- `apps/web/server/site-probe.ts` -- **new, server**: `probeSite({ siteId, userId, route })` — two
  `call()`s, `capabilityOf` behind the flag, one `supabaseAdmin()` update merging `site_settings`
  (never clobbering `public_url`), `settings_read_at` and `ghost_version`. Returns a summary for the
  caller's log line and never throws to it. **Joins two importer lists in `server-wiring.test.ts`
  with its reason.** Story 3.7's cron imports this same function.
- `apps/web/lib/flags.ts:36-70` -- extract the single-row read into `flagRow(key)` (the timeout, the
  fail-closed catch and the two `console.error` lines unchanged) and add
  `ghostProPreviewProbe = cache(...)` beside `passkeysEnabled`. `flags-rule.ts`'s `rowEnabled` is
  reused as-is.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts:305-310` -- after `store()` succeeds and before
  `revalidatePath`, `await probeSite(...)` inside its own try. **New exports in the same file** (a
  `'use server'` module may export only async functions): `dismissInjectionNotice(formData)`,
  `answerPortal(formData)`, `answerPlan(formData)`, `recheckPlan(formData)` — each `signedIn()`,
  each scoped `.eq('user_id', user.id)`, each `revalidatePath(SITES)`.
- `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` -- **new, server component**: the four
  blocks, in order — code-injection notice, plan question, Portal question, B15 — each a
  `<form action={…}>` so every control works with JavaScript off. `Banner kind="info"` for the first
  three (`components/kit/banner.tsx:15`, and the owner's ruled two-button exception for the
  questions); B15 is its own bordered block built from the frame.
- `apps/web/app/(app)/app/(authed)/sites/page.tsx:145-200` -- select `capability`,
  `capability_source`, `code_injection_notice_shown_at` alongside the existing columns; the
  Preview-only chip on the **state line** beside "Connected" (DW-57); `<SiteNotices site={…} />` as
  the card's last block. The file's header comment loses "the Preview-only chip (3.3)" from its
  absent list and gains what this story added and why the state line is where it went.
- `apps/web/server-wiring.test.ts:69-101` (`supabaseAdmin()` importers) and `:198-201` (the
  chokepoint's importers) -- add `server/site-probe.ts` with its reason: `capability`,
  `capability_source`, `site_settings` and `settings_read_at` are server-asserted (AD-7, schema
  :1040), and the probe is the decrypt path's product caller.
- `apps/web/server/ghost-admin/index.ts:211` (`call`), `:181` (`decrypt`), `admin-rule.ts:130`
  (`permitted` — a GET needs no allowlist item) -- **imported, unchanged**.
- `supabase/migrations/20260904120000_complete_schema.sql:709-717` -- read-only evidence: the
  `ghostpro_preview_probe` row exists and is seeded `false`; `sites` already carries every column
  this story writes (`:capability`, `capability_source`, `site_settings`, `settings_read_at`,
  `code_injection_notice_shown_at`). **No migration in this story.**
- `tools/probe/run-verify-ghost-admin.py` -- steps added after `connect`: `decrypt-path` (a
  `vault_decrypt` row and two `admin_read` rows for `config/` and `settings/` carrying the site id —
  DW-54's third gap), `settings-keys` (the **integration** key's `GET /admin/settings/` payload on
  T1 and T3 actually carries `portal_button`, the two `codeinjection_*` keys and the three
  `announcement_*` keys — §15h item 21 was measured with a staff token), `probe-selfhosted`
  (`capability` `full`, source `probe`, `site_settings` filled), `no-payload-leak` (no
  `codeinjection` key anywhere in `sites`, and neither payload in the rendered `/sites` HTML),
  `injection-notice` · `portal-question` · `plan-question` · `preview-notice` (each seeded on the
  throwaway user's own row through the service role — 3.2's `disconnected_at` fixture precedent —
  then driven in the browser on the deployed site, answered, and read back), and `axe-notices` at
  1440 and 390. The docstring names every step, in order.
- `tools/doc-audit.py:355-362` -- the harness row's description follows its new subject; same path,
  no new row.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` --
  **§39 appended at Dev**: what the integration key's `GET /admin/settings/` answers on T1 and T3,
  key by key, and the `hostSettings` absence re-confirmed on both.
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-54** amended (the decrypt path is
  executed live from this story; write-denied and staff-removed remain E7's), **DW-57** amended (the
  chip went on the state line, so 3.5 and 3.7 add to that line rather than the pills'), and a new
  entry for B15's Export theme zip and Ship it, absent until E11 and E7.
- `_bmad-output/implementation-artifacts/epic-3-context.md` -- the probe paragraph updated to what
  was built and executed; propagate, never localise.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/probe-rule.ts` + `apps/web/probe-rule.test.ts` -- the four pure readers and
      B15's copy -- every I/O matrix row that is a parsing question, green before anything calls it
- [ ] `apps/web/lib/flags.ts` -- `flagRow(key)` + `ghostProPreviewProbe` -- one reader, still
      fail-closed, still timed out
- [ ] `apps/web/server/site-probe.ts` + `server-wiring.test.ts` -- `probeSite` -- two `call()`s and
      one merged write, the decrypt path's product caller
- [ ] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- the probe after `store()`, and the four
      answer actions -- a probe failure never fails a connect
- [ ] `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` + `page.tsx` -- the chip on the state
      line and the four blocks -- B15 from the frame, DW-57 respected
- [ ] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- the nine new steps --
      R-82, re-runnable
- [ ] `MEASUREMENTS.md` §39 + `deferred-work.md` (DW-54, DW-57, the new B15 entry) +
      `epic-3-context.md` -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result by
      variable name, no value printed

**Acceptance Criteria:**
- Given a site connected on T1 or T3, when the probe runs, then `private.credential_audit` carries a
  `vault_decrypt` row and two `admin_read` rows — `config/` and `settings/` — each with the site's
  id, and `sites` shows `capability` `full`, `capability_source` `probe`, `settings_read_at`
  stamped, and `site_settings` carrying `code_injection`, `portal_button`, `portal_button_source`
  and `announcement` **alongside the `public_url` Story 3.2 wrote**
- Given a site whose Ghost has code injection set, when `/sites` is opened, then the sky notice is on
  that site's card with **Got it**; pressing it stamps `code_injection_notice_shown_at` and the
  notice does not return on reload or after a re-probe; and **no part of either payload** appears in
  `sites`, in any response body, or in the rendered HTML
- Given a site marked `preview_only`, when `/sites` is opened at 1440, 834 and 390, then the card's
  **state line** carries a sky **Preview-only** chip beside Connected, and below it the notice
  **matches the frame** (`B Missing Surfaces.dc.html:1188-1225`): the sky panel with its glyph, the
  cause sentence in Ghost's terms, **What clears this** 1 and 2 with **Publisher or higher**, and
  **Re-check plan** — with **Export theme zip** and **Ship it** absent, because neither path exists
  (UX-DR3)
- Given the `ghostpro_preview_probe` row off — the production seed — when any site is probed, then
  no site is ever marked `preview_only`, no plan question is asked, and no chip or notice is drawn
- Given a site whose `portal_button` could not be read, when `/sites` is opened, then one question is
  asked with **Yes** as the default; answering writes the boolean and `portal_button_source`
  `'declared'`; and no question is asked for a site whose setting read cleanly
- Given every control this story adds, when JavaScript is off, then each is a form that posts a
  server action and works (proved as wiring on the live site, as 3.2's `js-off` step is; the shell's
  own no-JS paint is DW-56 and not this story's)
- Given the source tree, when `node --test` runs, then `server/site-probe.ts` is on both importer
  lists with its reason, no file outside `server/ghost-admin/` names `vault.` or `private.`, and no
  file outside `probe-rule.ts` mentions `codeinjection`
- Given the deployed site, when `tools/probe/run-verify-ghost-admin.py` runs against T1 and T3, then
  every step in its docstring passes in order and axe reports zero violations at both widths

## Spec Change Log

## Design Notes

**Why the probe uses a stored key and not the one in hand.** At connect the Admin key is a variable
two lines away, and `fetchWithKey` would save a decryption. It is still wrong: **Re-check plan** and
Story 3.7's cron have no typed key and must run the identical probe, and a second code path is how
"the daily check re-runs the connect probe" quietly becomes false. One function, three callers, one
audit shape. It also gives DW-54's decrypt path its first product caller, which is the difference
between `call()` being tested and `call()` being used. `// ponytail: one extra config/ read at
connect so connect, Re-check and the cron are the same call.`

**`customThemes` at connect, before any theme name exists.** FR-J10 freezes `inflozo-{project-slug}`
at first deploy — at connect there is no project and no name, so "test the frozen name against the
allowlist" has nothing to test. The rule instead asks whether the allowlist could **ever** admit an
Inflozo theme: an entry beginning `inflozo-`. A Starter allowlist of Ghost's own themes admits none,
which is the answer FR-C2 wants. Written where the pure rule lives, because the day T4 arrives this
is the line the observed payload will confirm or refute.

**Four blocks, one component, no client JavaScript.** Each is a `<form action={serverAction}>` with a
hidden site id and a submit button, so every one of them works with scripts off and none of them
needs state. The two questions use `banner.tsx`'s owner-ruled two-button exception (his story 2.1
test); the code-injection notice merely tells, so it keeps the sentence and one **Got it**.

**Why the chip is on the state line.** DW-57 fixed the card's layout at the owner's test: the pills
line is metadata, the line below is the connection's state and its timestamp. Preview-only is a
property of the connection, not metadata about the site, so it sits beside **Connected** — and 3.5
and 3.7 now add to that line rather than reading the frame and undoing him. The ledger entry is
amended so the next story inherits the answer rather than re-deriving it.

**What cannot be executed, said plainly.** No Ghost(Pro) site exists (⛔ §4 T4, deferred to the launch
gate by the owner). So `capabilityOf`'s Preview-only branch runs against a **synthesised** payload in
a unit test that says so in its own name, and the live proof on T1 and T3 is the absence branch. The
B15 surface itself is proved on the deployed site against a **seeded** row — the same license 3.2's
harness used for a disconnected record and for Pro — so the screen is real even though the Ghost that
would cause it is not. The owner cannot reach it in his own test, and his test says so rather than
pretending.

## Questions for the owner

### Question 1 — may the test harness switch code injection on and off on your Ghost 5 test server?

The automatic test needs a site that *has* code injection set, to prove Inflozo notices it and shows
the note. Right now nothing in the product ever writes to your Ghost, and the test tools only read.
To test this end to end, the test tool would put one harmless line into the **Site footer** code
injection box on **ghost5.inflozo.com** (your Ghost 5 test server), check that Inflozo spots it, and
then put the box back exactly as it found it.

**Example:** it writes `<!-- inflozo probe -->` into that box, runs the check, and deletes it again —
about two seconds, on a test server, nothing a visitor would see.

1. **Yes — let the test tool set and unset it on ghost5 only, and restore it every time**
   **(RECOMMENDED).** The check runs on its own from then on, so if this ever breaks we find out
   before you do. Your ghost6 server is never written to.
2. **No — keep every test tool read-only.** Then the only proof is you doing it by hand at your test
   (steps 2 to 8 below), and nothing catches it automatically afterwards.
3. **Yes, but ask me each time.** Safest, and it means the test is not really automatic.

*Nothing waits on this answer* — the build goes ahead with the read-only version, and option 1 or 3
adds the step afterwards.

## Owner's manual test

On the live site after the Deploy run. You will change one setting on one of your Ghost test servers
and put it back at the end. **The note this story adds appears when a site is connected**, so you
need a site that is not connected yet.

1. **Before you start:** open https://app.inflozo.com/sites and tell me which of your two test
   servers — `ghost6.inflozo.com` or `ghost5.inflozo.com` — is **not** on that page. If both are
   there, say so and I will clear one record for you (one line, your data, on your say-so) so you
   can connect it fresh. Call the one you are going to connect **your test site** below.
2. **URL:** https://<your test site>/ghost/#/settings/code-injection · **Screen:** Ghost Admin, Code
   injection · **Do:** in the **Site footer** box type `<!-- inflozo test -->` and press Save ·
   **See:** Ghost confirms it saved.
3. **URL:** https://<your test site>/ghost/#/settings/integrations · **Do:** Add custom integration
   → name it `Inflozo owner test` → Save · **See:** an API URL, an Admin API key and a Content API
   key. Keep this tab open.
4. **URL:** https://app.inflozo.com/sites · **Do:** **Connect site** → **Done — next** → type your
   test site's address and paste its two keys → **Connect** · **See:** the window closes and the
   Sites page shows the card.
5. **Do:** look at the card · **See:** under everything else, a pale blue note: *"This site has code
   injection set in Ghost. Your live pages can legitimately look different from the canvas — Inflozo
   doesn't control that code."* with a **Got it** button.
6. **Do:** look at the rest of the card · **See:** nothing else changed — the address with its
   new-tab arrow, the **Ghost 6.58** (or **Ghost 5.130**) and **0 projects** pills on their own line,
   then **Connected** with **Checked just now** under it. There is **no** blue "Preview-only" chip,
   because a self-hosted Ghost can install any theme it likes.
7. **Do:** on your phone, open https://app.inflozo.com/sites · **See:** the same card in one column,
   the blue note inside it at full width, its **Got it** button reachable, nothing running off the
   edge.
8. **Do:** back on the computer, press **Got it** · **See:** the note disappears. Reload the page ·
   **See:** it stays gone — that note is shown once per site and never again.
9. **Cleanup:** in Ghost Admin, clear the **Site footer** code-injection box and Save, and delete the
   `Inflozo owner test` integration if you want to.

**What you cannot test yet, and why.** The **Preview-only** chip and its blue explanation card only
appear for a site on a Ghost(Pro) plan that forbids custom themes. You do not have such a site — the
Ghost(Pro) Starter trial is the launch-gate item (§4, T4), and buying it early would only start the
clock running. The screen is built, and the automatic test drives it on the real deployed site using
a stand-in record, so it is proved; you will see it for real when the trial arrives.

## Verification

To be run at Dev and again at Review, on the real infrastructure (R-82), Node 24 on `PATH`
(`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`). Every key is named by its
variable; no value is printed.

**Commands:**
- `pnpm check` (root: `eslint .`, `tsc --noEmit`, `node --test '*.test.ts'`) -- expected: exit 0,
  every existing test still green plus `probe-rule` and the two `server-wiring` list assertions
- `node --test probe-rule.test.ts` -- expected: every I/O matrix parsing row green, including the
  **synthesised, unobserved** Ghost(Pro) Starter payload and the flag-off branch
- `pnpm build` (`next build`) -- expected: `ƒ /app/sites` still dynamic and inside the guard
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS, 0 warnings, no new catalogue row
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, schema unchanged (no migration)
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected: every step in the docstring
  passes in order against **T1 `GHOST6_*` and T3 `GHOST5_*`** and the deployed `app.inflozo.com`,
  including the new `decrypt-path`, `settings-keys`, `probe-selfhosted`, `no-payload-leak`,
  `injection-notice`, `portal-question`, `plan-question`, `preview-notice` and `axe-notices`; axe
  reports zero violations at 1440 and 390

**Manual checks (if no CLI):**
- `private.credential_audit`, read through the pooler (`SUPABASE_DB_POOLER_URL`, read-only): a
  `vault_decrypt` row and two `admin_read` rows per probe, `detail` carrying no secret
- The real services this story touched, named in the Dev record: the live Supabase project, the
  deployed Vercel production build on `app.inflozo.com`, and Ghost T1 (6.58.0) and T3 (5.130.6)
