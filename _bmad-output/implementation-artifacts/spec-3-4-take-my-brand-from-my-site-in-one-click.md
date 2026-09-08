---
title: 'Story 3.4 — Take my brand from my site in one click'
type: 'feature'
created: '2026-09-08'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story, connecting a Ghost site is followed by one screen that shows Inflozo what it just
read off your site — your accent colour, your logo and your menu links — and asks, in one click,
whether to keep them. Press **Use your brand** and Inflozo makes you a project for that site, named
after it and already wearing your colour, so your dashboard is yours before you have chosen anything;
press **Skip** and nothing is taken. Two things FR-C4 also promises — copying your Ghost announcement
bar into an Inflozo section, and then offering to switch Ghost's own bar off — are **not** in this
story and cannot be: no section can be placed on a page until the editor exists (Epic 4/5), and
switching Ghost's bar off before Inflozo can publish a replacement (Epic 7) would take the bar off
your live site with nothing behind it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.3 reads `GET /admin/settings/` at connect and stores the announcement, Portal
and code-injection facts — but not the brand, and FR-C4's whole surface is unbuilt: `S2c` is drawn
and never rendered, `projects.style_pack` is `{ preset: 'paper' }` for every project ever made, and
`projects.linked_site_id` (FR-B5) has no writer at all, so a connected site's card can only ever say
"0 projects". A user connects their site and lands on a list.

**Approach:** Add a fifth reader to the same settings payload — `brandOf` — so `site_settings.brand`
carries accent, logo, icon, cover, nav, title and description. Connect then redirects to **S2c** on
its own route instead of straight to `/sites`; **Use your brand** writes the brand into a project's
`style_pack` and links that project to the site, **Skip** goes to `/sites`, and the offer stays
re-runnable from a link on the site's card. The announcement seed, the A2 placement, the consented
"turn Ghost's own bar off" and the canvas's live-content switch are **deferred with their reasons and
their owning epics** (DW-66) — this story leaves the values they need already stored.

## Boundaries & Constraints

**Always:**
- **The brand rides the read that already happens.** `brandOf` is a fifth pure reader over the flat
  record `settingsOf` already builds (`probe-rule.ts`), added to `probePatch`'s output as
  `site_settings.brand`. **No second Admin call, no new path, no allowlist item** — connect,
  **Re-check plan** and Story 3.7's cron keep being the same function.
- **The shape of `navigation`, `accent_color`, `logo`, `icon` and `cover_image` is EXECUTED, never
  assumed** (standing rule 1). `announcement_visibility` arrives as a JSON *string* (§39), so
  `navigation` may too: `brandOf` admits **both** an already-parsed array and a JSON string that
  parses to one — the idiom `allowlistOf` uses — and **Dev records what T1 and T3 actually answer,
  key by key, in MEASUREMENTS §40** before the reader is trusted.
- **Every value that reaches an attribute is validated at the boundary.** `accent_color` is kept only
  if it matches `#rgb`/`#rrggbb` — it is painted as an inline `style`, so an unvalidated string is a
  CSS injection into Inflozo's own chrome. `logo`/`icon`/`cover` are kept only if they parse as
  **`https:` URLs** (`img-src` admits `data:`, and a `data:` SVG is script). Nav entries keep `label`
  and `url` but are **rendered as text pills with no `href`**, which is what the frame draws.
- **The screen is `S2 Onboarding.dc.html` S2c** (`:150-196`) and matches it: "Nice site. Want to keep
  the vibe?", "We pulled these from {host} — your call.", the 760px split card — **Your site today**
  with the site's logo, title and host, **Accent color** with its swatch, **Navigation** as pills and
  "Fonts stay yours — pick a pairing once you're in the editor."; the right half's mini homepage
  painted in the accent under "Your homepage, already wearing your brand." — then **Use your brand**
  and **Skip**. It sits where the connect wizard sits, centred in the same shell. Widths 1440 / 834 /
  390; one coral focus ring; zero axe violations at 1440 and 390.
- **One frame departure, and it is a fact Inflozo does not have:** the frame prints the accent's NAME
  ("Burnt orange"). Ghost answers a hex and nothing else, so the swatch is captioned with the **hex
  in mono** — the card's own idiom for a machine value (the address). Naming a colour would be
  asserting what was not read.
- **A card that offers nothing is not drawn.** With no accent, no logo and no nav readable, connect
  redirects to `/sites` as it does today and the card carries no brand link (UX-DR3).
- **Both buttons are `<form action={…}>`** with a hidden site id, so the screen works with JavaScript
  off — the whole of Story 3.3's `site-notices.tsx` is the pattern.
- **The project write goes through the user's own session** (`supabaseServer()`), as every write in
  `projects/actions.ts` does, so RLS is exercised. `site_settings.brand` is server-asserted and is
  written only by the probe. **No new `supabaseAdmin()` importer and no new chokepoint importer.**
- **`style_pack` is E6's column and this widens it deliberately.** `stylePackSchema` is already
  `.loose()`; it gains an optional `brand` and `placeholderFor` prefers `brand.accent` over the
  preset's, so the dashboard card visibly wears the site's colour. DW-66 tells E6 the key exists and
  what wrote it.
- **Seeding is idempotent and consented.** The offer is a link, never a stored state machine; pressing
  it twice writes the same pack twice. `// ponytail:` says so.
- **No migration.** `projects.style_pack`, `projects.linked_site_id` and `sites.site_settings` all
  exist (schema `:208-230`, `:157`).
- R-81: every phase commits and pushes as `Story 3.4 - <Phase> - <one line>`. R-82: Review and the
  harness run against `app.inflozo.com`, T1 and T3, every key read by name from `tools/probe/.env`.

**Ask First:**
- Any second Admin API call, any non-GET, any change to `ADMIN_WRITES` — including
  `announcement_clear`, which exists and stays **unused** in this story.
- Any new column or migration; any write to a test Ghost (this story writes to none).
- Any change to what "Use your brand" does with an existing project beyond the owner's ruling below.

**Never:**
- The announcement seed, the placed A2 design, the consented "turn Ghost's own bar off", and the
  canvas's switch to live content — DW-66, and the reason is that no section can be placed until
  Epic 4/5 defines `project_templates.doc`, no A2 design exists until the library is built, and no
  deploy exists until Epic 7, so clearing Ghost's bar would empty the live site's bar with nothing
  behind it. **P8's safety is by sequencing and the sequence is not there yet.**
- Font import (S2c's own "Fonts stay yours" line settles it; FR-C4 is accent + logo + nav).
- Writing Ghost anything. Storing, logging or returning a `codeinjection_*` value.
- Renaming an existing project, or changing a project's `slug` (FR-J10 — a slug is frozen once a
  binding exists). A seed writes `style_pack` and, where it creates the row, nothing else.
- Editing the design export, a `record` document, or a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Brand read | T1 / T3 settings payload | `site_settings.brand` carries accent, logo, icon, cover, nav, title, description beside `announcement`, `code_injection`, `portal_button` and `public_url` | N/A |
| `navigation` as a JSON string | `"[{\"label\":\"Essays\",\"url\":\"/essays/\"}]"` | parsed to the same array as the already-parsed shape | unparseable → `nav: []` |
| Hostile accent | `accent_color: "red;background:url(x)"` | `accent: null`, no swatch, no inline style written | N/A |
| Hostile logo | `logo: "data:image/svg+xml,…"` or `javascript:…` | `logo: null`, the initial letter tile is drawn instead | N/A |
| Nothing readable | no accent, no logo, no nav | connect redirects to `/sites`; no S2c, no card link | N/A |
| Use your brand, no project | brand present, 0 projects | a project named from the site's title, `linked_site_id` set, `style_pack.brand` written; the site card reads "1 project" and the dashboard card wears the accent | insert fails → the page says so, the site stays connected |
| Use your brand, at the cap | Free, 1 project already | **the owner's ruling (Question 1)** decides which project is seeded and what the page says | N/A |
| Someone else's site id | `?site=` a stranger's row | the page 404s and the action writes nothing (RLS: the read returns no row) | N/A |
| Re-run | the card's brand link, pressed again | S2c again; seeding again writes the same pack | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/lib/probe-rule.ts` + `apps/web/probe-rule.test.ts` -- **`brandOf(settings)`** beside
  `announcementOf` (`:70-86` is the shape and the comment to follow), returning
  `{ accent, logo, icon, cover, nav, title, description }` with every field validated as above;
  **`navOf`** admitting the array and the JSON-string container (`allowlistOf` at `:135-140` is the
  idiom); **`BRAND_COPY`** holding every S2c sentence, so the harness and the tests read the app's
  own words (`PREVIEW_COPY` at `:150-175` is the pattern). `probePatch` (`:230-272`) gains
  `brand: brandOf(settings)` in the same spread that builds `site_settings` — **nothing else in the
  patch changes**, and `previous` still carries `public_url` through untouched.
- `apps/web/lib/style-pack.ts` + `apps/web/style-pack.test.ts` -- `stylePackSchema` (`:21`) gains an
  optional `brand` object; `placeholderFor` (`:57-66`) returns the preset with `accent` overridden by
  `brand.accent` when it is a valid hex. **Keep `Object.hasOwn`** — the review of 2026-09-05 is in
  that comment. The file's header gains what this story put in the column and that E6 owns it.
- `apps/web/app/(app)/app/(authed)/sites/brand/page.tsx` -- **new, server component**: S2c. Reads the
  site through `supabaseServer()` (`.eq('id', …)`, RLS scopes it to the caller), `notFound()` on no
  row or no brand, renders the frame from `BRAND_COPY`, posts to the two actions. `robots: noindex`,
  `title: '… · Inflozo'` — `sites/connect/page.tsx` is the pattern for the route's shape, its
  centring and its metadata.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `connectSite`'s tail (`:327-330`): the
  redirect becomes `/sites/brand?site={siteId}` when the freshly probed row has a brand, `/sites`
  otherwise. **Two new exports** (a `'use server'` module may export only async functions — the
  file's own header at `:70-77` records why they live here): `useBrand(formData)` and
  `skipBrand(formData)`, each `signedIn()`, each scoped `.eq('user_id', user.id)`, each
  `revalidatePath` on `SITES` and `DASHBOARD` and redirecting.
- `apps/web/lib/projects.ts` -- **reused, not rewritten**: `slugify`, `uniqueSlug`, `nextUntitled`
  and `NAME_MAX` give the created project its name and slug from the site's title. A site with no
  title falls back to its host, then to `nextUntitled`.
- `apps/web/app/(app)/app/(authed)/projects/actions.ts:96-113` -- **read-only evidence** of the
  create shape the seed copies (`user_id`, `name`, `slug`, `style_pack`) and of `atCap`/`names()`,
  which the seed reuses rather than re-deriving.
- `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` -- the brand offer as the block list's
  **first** entry: a plain link to `/sites/brand?site={id}`, **not a Banner** (a Banner tells or
  asks; this offers). Shown while the site has a readable brand. **DW-57 binds**: the pills line
  stays metadata, the state line stays the connection's.
- `apps/web/app/(app)/app/(authed)/sites/page.tsx:82-91` -- `site_settings` is **already selected**;
  the row type gains `brand` and passes it to `SiteNotices`. The projects tally at `:91` and
  `projectCounts` are what turn a seeded link into "1 project" on the card — no change needed.
- `apps/web/csp.ts:60` -- **read-only evidence**: `img-src 'self' data: https:` already admits a
  customer's logo. **No CSP change in this story.**
- `apps/web/app-routes.test.ts` -- **read-only evidence**: the new page is inside `(authed)`, so it
  needs no entry in `PUBLIC` or `SELF_GUARDED`; the test proves it.
- `supabase/migrations/20260904120000_complete_schema.sql:208-230` (`projects.style_pack`,
  `slug`, `linked_site_id`) and `:157` (`sites.site_settings`) -- **read-only evidence. No migration
  in this story.**
- `tools/probe/run-verify-ghost-admin.py` -- the `connect` step's landing assertion moves to
  `/sites/brand`; new steps after it: `brand-keys` (the **integration** key's `GET /admin/settings/`
  really carries `accent_color`, `logo`, `icon`, `cover_image`, `navigation`, `title` and
  `description` on T1 and T3, with the shape each arrives in recorded), `brand-screen` (S2c on the
  deployed site, its values matching the row), `brand-seed` (**Use your brand** → a project exists,
  `linked_site_id` set, `style_pack.brand.accent` equal to the site's, the site card reading
  "1 project" and the dashboard card painted in it), `brand-skip` (→ `/sites`, no project written),
  `brand-js-off` (both forms post with scripts disabled), `brand-none` (a seeded row with no brand
  redirects to `/sites` and draws no link) and `axe-brand` at 1440 and 390. The docstring names every
  step, in order.
- `tools/doc-audit.py:355-362` -- the harness row's description follows its new subject; same path,
  no new row.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` --
  **§40 appended at Dev**: what the integration key's `GET /admin/settings/` answers for the seven
  brand keys on T1 and T3, the container shape of `navigation` named exactly.
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-66** (below) and DW-54 left as it
  is: this story adds no Admin write, so `write-denied` is still Epic 7's.
- `_bmad-output/implementation-artifacts/epic-3-context.md` -- the auto-brand paragraph updated to
  what was built and what was deferred; propagate, never localise.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/probe-rule.ts` + `probe-rule.test.ts` -- `brandOf`, `navOf`, `BRAND_COPY`, and
      `brand` in `probePatch` -- every I/O matrix row that is a parsing or validation question,
      green before anything renders it
- [ ] Execute `GET /admin/settings/` against T1 and T3 for the seven brand keys and **write
      MEASUREMENTS §40** -- the reader is not trusted until the shape is read (standing rule 1)
- [ ] `apps/web/lib/style-pack.ts` + `style-pack.test.ts` -- the optional `brand` and the accent
      override -- the dashboard card wears the site's colour, E6 still owns the column
- [ ] `apps/web/app/(app)/app/(authed)/sites/brand/page.tsx` -- S2c from the frame -- both forms work
      with JavaScript off, nothing offered is nothing drawn
- [ ] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- the redirect, `useBrand`, `skipBrand` --
      the user's own session writes `projects`; the owner's ruling decides the at-cap path
- [ ] `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` + `page.tsx` -- the re-run link --
      DW-57 respected, the offer is a link and not a state machine
- [ ] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- every new step its
      docstring names -- R-82, re-runnable
- [ ] `deferred-work.md` (DW-66) + `epic-3-context.md` -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result by
      variable name, no value printed

**Acceptance Criteria:**
- Given a site connected on T1 or T3, when the connect probe runs, then `sites.site_settings.brand`
  carries the seven values **alongside** `public_url`, `announcement`, `code_injection` and
  `portal_button` — none of them lost — and `settings_read_at` is stamped by the same write
- Given that connect, when it finishes, then the browser lands on **S2c** and the screen **matches
  the frame** (`S2 Onboarding.dc.html:150-196`): the heading and sub-heading, the split card with
  **Your site today**, the accent swatch **captioned with its hex**, the navigation pills, the
  "Fonts stay yours" line, the right half's homepage in the accent, and **Use your brand** beside
  **Skip** — at 1440, 834 and 390, with zero axe violations at 1440 and 390
- Given **Use your brand**, when it is pressed, then a project exists for that site with
  `linked_site_id` set and `style_pack.brand.accent` equal to the site's accent; the Sites card reads
  **1 project**; and the dashboard card's placeholder is painted in that accent
- Given **Skip**, when it is pressed, then the browser goes to `/sites`, **no project is written**,
  and the site card still carries the brand link, so the offer can be taken later
- Given a site whose settings carry no accent, no logo and no navigation, when it is connected, then
  the browser goes straight to `/sites`, `/sites/brand?site=` for it 404s, and no link is drawn
- Given a `?site=` naming another user's row, when the page is opened or either action is posted,
  then nothing is read, nothing is written and the caller gets a 404 — RLS, not a check
- Given every control this story adds, when JavaScript is off, then each is a form that posts a
  server action and works (proved as wiring on the live site, as 3.3's `notices-js-off` is)
- Given the source tree, when `node --test` runs, then no new `supabaseAdmin()` importer and no new
  chokepoint importer appear in `server-wiring.test.ts`, and `tokens.test.ts` still finds
  `style-pack.ts` the one place a colour literal lives
- Given the deployed site, when `tools/probe/run-verify-ghost-admin.py` runs against T1 and T3, then
  every step in its docstring passes in order, `brand-keys` included
- Given `ADMIN_WRITES`, when this story is finished, then it is **unchanged** and
  `announcement_clear` has still never been called

## Spec Change Log

## Design Notes

**Why the brand rides the probe and not a new call.** FR-C4 says "on the same read" and Story 3.3
already makes that read on the stored key through `call()`. A second call at connect would be a
second code path that **Re-check plan** and Story 3.7's cron would then have to grow too — which is
exactly how "the daily check re-runs the connect probe" quietly becomes false. One reader added to
one payload keeps three callers identical and costs nothing.

**Why `navigation`'s shape is executed and not assumed.** `announcement_visibility` comes back from
Ghost as a JSON *string* — `"[\"visitors\"]"` — which §15h and §39 both had to measure rather than
guess. `navigation` is the same kind of setting and may or may not do the same thing. Writing
`brandOf` to admit both containers is cheap; asserting one and being wrong would put an empty menu on
S2c with nothing failing. **Dev executes it and §40 records it**, as 3.3 did for the announcement.

**Why the swatch is captioned with a hex.** The frame says "Burnt orange". Nothing Inflozo reads
knows that name — Ghost answers `#D96C3F`. A colour-naming table would be inventing a fact per hex,
and getting one wrong on the user's own brand is worse than showing them the value they set. The
address on the site card is already printed in mono for the same reason.

**Why the brand offer is a link and not a state.** "Skippable and re-runnable" (FR-C4) wants two
things, and a `brand_seeded_at` column would give a third — a difference between skipped and used
that no screen in this epic shows. The link is always there while there is something to offer, and
seeding twice writes the same pack. `// ponytail: the offer is a link; the seed is idempotent. A
column when a screen needs to tell skipped from used.`

**What cannot be built, said plainly.** Half of FR-C4 is the announcement bar: its text becomes a
placed **A2** design, its visibility maps onto **show to**, its background onto the **Background**
role, and only then is "turn Ghost's own bar off" safe. Placing a section needs
`project_templates.doc`, whose shape Story 4.1 defines; A2 needs a library that Epics 9–10 build; and
the clear needs a deploy (Epic 7) or the user's live bar disappears with nothing replacing it. So
this story **stores what the seed will need and builds none of it** — 3.3 already put
`site_settings.announcement` there verbatim, and DW-66 names the story that finishes the job. The
owner sees the deferral in his own words in "In plain English" rather than discovering it later.

## Questions for the owner

### Question 1 — when you press "Use your brand", which project wears it?

You have just connected `ghost6.inflozo.com`. Inflozo read your accent colour, your logo and your
four menu links, and is showing them to you. You press **Use your brand**. What should happen?

There is one wrinkle worth knowing: your plan limits how many projects you can have — **Free
includes 1**. So if you already have a project, there may be no room to make another.

1. **Inflozo makes a project for that site, named after it ("Ghost6"), wearing your brand — and if
   you are already at your project limit, it puts the brand on the project you most recently worked
   on instead and tells you which one on the screen. (RECOMMENDED)** You always end up with
   something to open, which is what the First Run screen (Story 3.8) promises: connect → brand → a
   project. It is also the only option where you can see anything happen today.
2. **Inflozo only ever brands a project you already made** — the one you most recently worked on —
   and makes a new one only if you have none at all. Nothing new appears if you already have
   projects, so your dashboard never grows a project you did not ask for.
3. **Inflozo saves the brand on the site and changes nothing else.** The next project you make for
   that site wears it. Safest, but nothing at all happens on screen when you press the button, and
   there is no "make a project for this site" door yet — so today it would look like the button did
   nothing.

### Question 2 — half of this story cannot be built yet. Where should the other half go?

Story 3.4 promises four things. Two can be built now (read your brand; put it on a project). Two
cannot: **copying your Ghost announcement bar into an Inflozo section**, and then **offering to
switch Ghost's own bar off**. Both need the page editor, which is Epic 4/5, and the second also needs
Inflozo to be able to publish to your site, which is Epic 7 — switching your bar off today would take
it off your live site with nothing replacing it.

For example: your site has a bar that says "Free shipping this week". Inflozo has already saved that
sentence, its colour and who it shows to. It just cannot put it on a page yet.

1. **Build the brand half now; the announcement half becomes a tracked item (DW-66) and is built by
   the story that first places a section on a page, in Epic 4 or 5. (RECOMMENDED)** Epic 3 finishes
   on schedule, nothing is forgotten, and the work happens where it is actually possible.
2. **Leave Story 3.4 open and finish it after the editor exists.** Epic 3 would not close, and
   stories 3.5 to 3.8 would be built with one story still half done behind them.
3. **Make it a new story at the end of Epic 3 (a "3.9"), the way First Run became 3.8.** It is
   planned and visible on the board now — but it could not actually be built until Epics 4 and 5 are
   done, so Epic 3 would still not close.

## Owner's manual test

On the live site after the Deploy run. **The new screen appears when a site is connected**, so you
need a site that is not connected yet, and you will need a menu and an accent colour set on it.

1. **Before you start:** open https://app.inflozo.com/sites and tell me which of your two test
   servers — `ghost6.inflozo.com` or `ghost5.inflozo.com` — is **not** on that page. If both are
   there, say so and I will clear one record for you (one line, your data, on your say-so). Call the
   one you are going to connect **your test site** below.
2. **URL:** https://&lt;your test site&gt;/ghost/#/settings/design/brand · **Screen:** Ghost Admin,
   Brand · **Do:** set **Accent color** to `#D96C3F` and Save · **See:** Ghost confirms it saved.
3. **URL:** https://&lt;your test site&gt;/ghost/#/settings/navigation · **Do:** make sure there are
   a few menu items — add `Essays`, `Notes`, `Archive` if it is empty — and Save.
4. **URL:** https://&lt;your test site&gt;/ghost/#/settings/integrations · **Do:** Add custom
   integration → name it `Inflozo owner test` → Save · **See:** an API URL, an Admin API key and a
   Content API key. Keep this tab open.
5. **URL:** https://app.inflozo.com/sites · **Do:** **Connect site** → **Done — next** → type your
   test site's address and paste its two keys → **Connect** · **See:** instead of the Sites list, a
   new full screen: **"Nice site. Want to keep the vibe?"** and under it *"We pulled these from
   &lt;your test site&gt; — your call."*
6. **Do:** look at the card in the middle · **See:** on the left, **YOUR SITE TODAY** with your
   site's name and address, an **Accent color** dot in your orange with `#D96C3F` beside it, your
   menu items as small pills, and the line *"Fonts stay yours — pick a pairing once you're in the
   editor."*; on the right, a small drawing of a homepage with an orange button in it, captioned
   *"Your homepage, already wearing your brand."*
7. **Do:** on your phone, open the same screen · **See:** the two halves stack, nothing runs off the
   edge, and both buttons are reachable.
8. **Do:** back on the computer, press **Skip** · **See:** the Sites page, your site's card, and on
   it a link offering to use the site's brand. Nothing else changed — the card still reads
   **0 projects**.
9. **Do:** press that link · **See:** the same screen as step 5. **Do:** press **Use your brand** ·
   **See:** what you asked for in Question 1 above.
10. **URL:** https://app.inflozo.com/ · **Screen:** your dashboard · **See:** the project's card, and
    the little wireframe drawing on it is painted in **your orange**, not the default.
11. **URL:** https://app.inflozo.com/sites · **See:** the site's card now reads **1 project**.
12. **Cleanup:** nothing to undo on Ghost — this story wrote nothing to your site. Delete the
    `Inflozo owner test` integration if you want to.

**What you cannot test yet, and why.** Your Ghost announcement bar is **not** copied into Inflozo and
Inflozo does **not** offer to switch it off — that is Question 2 above. Both settings are already
saved on your site's record, so nothing is lost; the screen for them arrives with the page editor.

## Verification

To be run at Dev and again at Review, on the real infrastructure (R-82), Node 24 on `PATH`
(`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`). Every key is named by its
variable; no value is printed.

**Commands:**
- `pnpm check` (root: `eslint .`, `tsc --noEmit`, `node --test '*.test.ts'`) -- expected: exit 0,
  every existing test still green plus the new `probe-rule` and `style-pack` cases
- `node --test probe-rule.test.ts style-pack.test.ts` -- expected: every I/O matrix parsing and
  validation row green, the hostile accent and hostile logo rows included
- `pnpm build` (`next build`) -- expected: `ƒ /app/sites/brand` present, dynamic, inside the guard
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS, 0 warnings, no new catalogue row
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, schema unchanged (no migration)
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected: the keys present by name, and
  playwright, axe and the postgres driver resolvable. It starts no browser, so it proves none of the
  UI steps
- `python3 tools/probe/run-verify-ghost-admin.py` -- expected: every step in the docstring passes in
  order against **T1 `GHOST6_*` and T3 `GHOST5_*`** and the deployed `app.inflozo.com`, including
  `brand-keys`, `brand-screen`, `brand-seed`, `brand-skip`, `brand-js-off`, `brand-none` and
  `axe-brand`; axe reports zero violations at 1440 and 390. **This story writes to no Ghost** — the
  only step that ever did, `injection-live`, is 3.3's and is unchanged
- `git grep -n 'announcement_clear'` -- expected: `admin-rule.ts` and its test only; no caller

**Manual checks (if no CLI):**
- `sites.site_settings` for the harness's throwaway site, read through the pooler
  (`SUPABASE_DB_POOLER_URL`, read-only): `brand` present **beside** `public_url`, `announcement`,
  `code_injection` and `portal_button`, none of them lost
- `private.credential_audit`: still one `vault_decrypt` and two `admin_read` rows per probe — this
  story added no Admin call
- The real services this story touched, named in the Dev record: the live Supabase project, the
  deployed Vercel production build on `app.inflozo.com`, and Ghost T1 (6.58.0) and T3 (5.130.6)
