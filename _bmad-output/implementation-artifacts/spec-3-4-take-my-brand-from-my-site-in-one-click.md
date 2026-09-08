---
title: 'Story 3.4 — Take my brand from my site in one click'
type: 'feature'
created: '2026-09-08'
status: 'in-review'
baseline_commit: 'f848baaf4186660296a2f56e7161bc9ab72e4736'
review_loop_iteration: 1
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
  it twice writes the same pack twice — onto the project already made for this site, found by
  `linked_site_id`, never onto a new one. `// ponytail:` says so.
- **THE SECOND PRESS ASKS, AND WHERE THERE IS A CHOICE IT OFFERS ONE (the owner's Question 3 ruling,
  2026-09-08, with his A1 and B1 — this clause is his renegotiation of this block).** When the brand
  is going onto a project that already exists AND the caller has more than one, S2c says *"You
  already put your brand on “X”. Apply it again?"* and draws **one card per project** under it —
  each with the project's **own 64×44 wireframe painted from its own Style Pack** (`ProjectThumb`,
  the dashboard card's drawing at the size `design-picker.tsx` draws one), its name, and a marker on
  the project this site is already on, which is **pre-selected**. **One screen, not two** (A1), and
  **only when there is more than one project** (B1) — Free includes one, and a chooser with a single
  option is a step rather than a choice. The cards are **real `<input type="radio">` inside the
  existing form**, so the chooser works with JavaScript off like everything else on this screen; the
  Kit's `RadioCards` is presentational and posts nothing, so this borrows its tokens and not its
  markup. **Purely additive:** the pre-selected card is what `brandTarget` would have chosen, so
  touching nothing writes exactly what Question 1 ruled. Choosing a card writes `style_pack` and
  **nothing else** — `linked_site_id` is untouched, because FR-B5 gives a project at most one site
  and a chooser must not silently move a binding.
- **No captured thumbnail, ever, in v1.** The card's drawing is `placeholderFor`'s three colours and
  nothing else. FR-B1 defers auto-captured thumbnails out of v1 — "a wrong thumbnail is worse than
  none" — and prescribes the Style-Pack placeholder in their place; `projects.thumb_path` stays
  unused, the `thumbnails` bucket stays unprovisioned, and no headless browser runs anywhere.
- **THE OWNER RULED THE AT-CAP PATH (Question 1, option 1, 2026-09-08), and the screen says which
  project it will brand BEFORE the press, not after.** S2c counts the caller's projects against
  `atCap` at render: with room, the helper caption under **Use your brand** says a project will be
  made for the site; at the cap it names the project that will be branded instead — the most
  recently updated one (`updated_at desc`, the dashboard's own order). The form carries that
  decision as a hidden field — the project's id, or empty for "make one" — and **`useBrand`
  re-counts and refuses a decision that has gone stale**, redirecting back to S2c so the caption is
  true again rather than silently rebranding a project the screen did not name. `refusedAtCap`
  (`projects/actions.ts:87-91`) is the precedent: the page's count can be one tab out of date, so
  the action re-renders rather than acts on it.
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
| Use your brand, at the cap | Free, 1 project already | the caption names that project; pressing brands it — `style_pack.brand` written, **name, slug and `linked_site_id` untouched** | N/A |
| Cap changed under the page | caption said "make one", a second tab filled the cap | `useBrand` re-counts, writes nothing, and redirects back to S2c with the true caption | N/A |
| Someone else's site id | `?site=` a stranger's row | the page 404s and the action writes nothing (RLS: the read returns no row) | N/A |
| Re-run, one project | the card's brand link, pressed again | S2c again; seeding again writes the same pack **onto the same project** — never a second one | N/A |
| Re-run, two or more projects | the brand link, pressed again | S2c **asks** ("You already put your brand on “X”. Apply it again?") and draws a card per project, each with its own wireframe in its own colours, the project for this site pre-selected | N/A |
| A card chosen | the customer picks a different project's card | the brand goes onto **that** project's `style_pack`; its name, `slug` and `linked_site_id` are untouched, and the project count does not move | a project id that is not the caller's is not in his own list → nothing written, back to S2c |

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
  centring and its metadata. It also counts the caller's projects (`atCap`, `lib/plan.ts:47`) to
  compose the button's caption and the hidden decision field.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `connectSite`'s tail (`:327-330`): the
  redirect becomes `/sites/brand?site={siteId}` when the freshly probed row has a brand, `/sites`
  otherwise. **Two new exports** (a `'use server'` module may export only async functions — the
  file's own header at `:70-77` records why they live here): `useBrand(formData)` and
  `skipBrand(formData)`, each `signedIn()`, each scoped `.eq('user_id', user.id)`, each
  `revalidatePath` on `SITES` and `DASHBOARD` and redirecting. `useBrand` re-counts against `atCap`
  and refuses a stale decision (Boundaries, the owner's Question 1 ruling).
- `apps/web/app/(app)/app/(authed)/placeholder.tsx` -- **`ProjectThumb`** beside `Placeholder`: the
  dashboard card's wireframe at **64×44**, the size `design-picker.tsx` draws a mini diagram at
  (`Editor Sidebar Kit.dc.html:71`), painted from the same `placeholderFor`. It is the owner's
  Question 3 thumbnail, and it is **FR-B1's** placeholder rather than a capture — the two live in
  one file so a change to either is read beside the other.
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
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-66 written at Dev** (the owner
  ruled Question 2, option 1): the announcement seed, the A2 placement, the consented "turn Ghost's
  own bar off" and the canvas's live-content switch, each with its owning epic and what this story
  already stored for it. DW-54 is left as it is — this story adds no Admin write, so `write-denied`
  is still Epic 7's.
- `_bmad-output/implementation-artifacts/epic-3-context.md` -- the auto-brand paragraph updated to
  what was built and what was deferred; propagate, never localise.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/probe-rule.ts` + `probe-rule.test.ts` -- `brandOf`, `navOf`, `BRAND_COPY`, and
      `brand` in `probePatch` -- every I/O matrix row that is a parsing or validation question,
      green before anything renders it
- [x] Execute `GET /admin/settings/` against T1 and T3 for the seven brand keys and **write
      MEASUREMENTS §40** -- the reader is not trusted until the shape is read (standing rule 1)
- [x] `apps/web/lib/style-pack.ts` + `style-pack.test.ts` -- the optional `brand` and the accent
      override -- the dashboard card wears the site's colour, E6 still owns the column
- [x] `apps/web/app/(app)/app/(authed)/sites/brand/page.tsx` -- S2c from the frame -- both forms work
      with JavaScript off, nothing offered is nothing drawn
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- the redirect, `useBrand`, `skipBrand` --
      the user's own session writes `projects`; the owner's ruling decides the at-cap path
- [x] `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx` + `page.tsx` -- the re-run link --
      DW-57 respected, the offer is a link and not a state machine
- [x] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- every new step its
      docstring names -- R-82, re-runnable
- [x] `deferred-work.md` (DW-66) + `epic-3-context.md` -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by
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
- Given a caller **at their project cap**, when S2c is opened, then the caption under **Use your
  brand** names the project that will be branded — the most recently updated — and pressing it
  writes `style_pack.brand` onto that project and **changes nothing else about it**: not its name,
  not its `slug`, not its `linked_site_id`
- Given a decision that has gone stale between render and press, when **Use your brand** is posted,
  then nothing is written and the browser returns to S2c with the true caption
- Given a caller with **more than one project** whose brand would go onto one that already exists,
  when S2c is opened, then it **asks** rather than tells and draws **one card per project** — each
  carrying that project's own Style-Pack wireframe, the two drawings visibly different where the
  Style Packs are — with the project this site is already on **pre-selected**; and when a different
  card is chosen and pressed, then the brand lands on **that** project and nothing else about it
  moves, and the project count is unchanged
- Given a caller with **exactly one project**, when S2c is opened, then **no cards are drawn** — a
  chooser with one option is a step and not a choice (the owner's B1)
- Given the chooser, when JavaScript is off, then it still posts: the cards are real radio inputs
  inside the form the button submits
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

**Review, 2026-09-08.** Fourteen findings from five layers, all patched inside the story; no
behaviour was added that the frozen sections did not already promise, and one change is put to the
owner as **Question 3** because Boundaries' own "Ask First" names it.

- **The seed was not idempotent below the cap** — the one defect that reached the customer. The
  offer link never retires, and `useBrand`'s `else` branch inserted unconditionally, so a second
  press with room made a **second project** for the same site: same name, slug `ghost6-2`, the same
  `linked_site_id`, and the card's tally climbing. It contradicted Boundaries' "Seeding is
  idempotent", the matrix's **Re-run** row and the function's own docstring. The rule is now one
  pure function, `brandTarget` — at the cap the most recently updated project (the owner's
  Question 1 ruling, unchanged), with room **the project already made for this site**, and only
  when there is none is one made. S2c's caption and `useBrand`'s write read the same function, and
  `probe-rule.test.ts` holds every branch. **Question 3** is the owner's word on it.
- **A failed seed said nothing.** The matrix says "insert fails → the page says so"; all four
  failure branches logged a code and returned, so the press looked like a dead button. Each now
  redirects to `/sites/brand?site=…&failed=1` and S2c prints one line — the shape `recheckPlan`
  already uses, and the only one that survives scripts off.
- **The cross-account claim was not executed.** `brand-none` forged a uuid **no account carries**,
  which RLS never had to refuse, while the acceptance criterion says "the page is opened **or
  either action is posted**". New step **`brand-ownership`**: the second account's real site id,
  opened as a page and then forged into S2c's own **Use your brand** and **Skip** forms.
- **New step `brand-rerun`**, after `pro-connect-t3`: the only state in the run with room to spare,
  and the branch that carried the defect above. Every brand step before it runs on a Free account
  whose cap of 1 the first press fills.
- **`hasBrand` narrowed wider than it checked** — `nav` was never required to be an array (S2c then
  threw on `brand.nav.length`) and `logo` was any string, not an `https:` URL, though the page puts
  it in an `<img src>`. Both closed, and `imageUrl` is exported so S2c re-validates the logo it
  reads back out of the column, as `style-pack.ts` re-validates the accent.
- **Nine smaller ones, each one line:** `id` breaks the `updated_at` tie in both queries (a shared
  millisecond made the page and the action name different rows and the press bounce for ever); the
  page no longer treats a failed projects read as a count of zero; the at-cap merge no longer
  assumes `style_pack` is an object (it is in the caller's own UPDATE grant); `brand-none` restores
  the fixture in a `finally`; `siteOf`'s log code names the brand actions; **"Fonts stay yours"**
  left the navigation block, so it survives a site with no menu (AC 2 enumerates it); the initial
  tile takes a whole code point, not half a surrogate pair; `brand-seed` asserts the accent on the
  block the placeholder paints rather than on any of three; and the created project is named from
  the host S2c actually showed.
- **One thing the review could not settle, and did not pretend to: DW-68.** Seven consecutive full
  harness runs each lost exactly one navigation to an authed route to a 60-second timeout, at a
  different place every time, while PostgREST, GoTrue, the pooler, the edge and DNS all measured
  healthy in the same window. The harness now retries a timed-out navigation **once** and prints the
  count with the result — a run that rode over a hang says so, and the clean run below says **1**.
  The control that would settle whether it is this deployment cannot be run today, so no claim is
  made either way.
- **Dismissed, with the reason:** `skipBrand` does not 404 for a stranger's row — the same criterion
  says "nothing is read", and 404ing would require reading; it writes nothing, which is the
  substance. `skipBrand` stays a form (Boundaries freezes both buttons as forms). A probe cannot
  wipe a stored brand with nulls — `site-probe.ts` returns before `probePatch` on a failed or
  unreadable read. Connect's landing and S2c's 404 cannot diverge: both call the same `hasBrand` on
  the same value.

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

**Why the at-cap message is a caption and not a confirmation.** The owner's ruling asks the screen to
say which project gets the brand. Saying it *after* the write is a notification about something
already done to an existing project; saying it *before* is consent, and it is the idiom this app
already uses ("a greyed control shows its reason in the helper caption"). It costs one count the page
can make anyway and one hidden field, and it turns "the page promised a new project and rebranded an
old one" from a possible outcome into a redirect.

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

**Ruled: option 1** (owner, 2026-09-08). A project is made for the site and wears the brand; at the
project limit the brand goes onto the most recently updated project instead, and **S2c names it in the
caption under the button before the press**, so the screen tells you which one while you can still
choose. The stale-decision guard in Boundaries and the two matrix rows are that ruling in force.

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

**Ruled: option 1** (owner, 2026-09-08). Story 3.4 ships the brand half. The announcement seed, the A2
placement and the consented "turn Ghost's own bar off" become **DW-66**, written at Dev, owned by the
story that first places a section on a page (Epic 4/5), with the clear waiting on Epic 7's deploy.
Epic 3 closes on 3.5–3.8 as planned.

1. **Build the brand half now; the announcement half becomes a tracked item (DW-66) and is built by
   the story that first places a section on a page, in Epic 4 or 5. (RECOMMENDED)** Epic 3 finishes
   on schedule, nothing is forgotten, and the work happens where it is actually possible.
2. **Leave Story 3.4 open and finish it after the editor exists.** Epic 3 would not close, and
   stories 3.5 to 3.8 would be built with one story still half done behind them.
3. **Make it a new story at the end of Epic 3 (a "3.9"), the way First Run became 3.8.** It is
   planned and visible on the board now — but it could not actually be built until Epics 4 and 5 are
   done, so Epic 3 would still not close.

### Question 3 — you press "Use your brand" a second time. Should Inflozo make a second project?

The review found that it did. Boundaries says pressing the offer twice should write the same brand
onto the same project — but the code only did that when you were **at your project limit**. With
room to spare it made a **brand-new project every single press**.

For example, on Pro (25 projects allowed): you connect `ghost6.inflozo.com` and press **Use your
brand** — you get a project called "Ghost6". The link stays on the site's card for ever, because
"skippable and re-runnable" means it never goes away. You press it again next week to refresh the
colour. Before the fix: a **second** "Ghost6". Press it five times, five "Ghost6"s, and the card
reads "5 projects".

I have fixed it the way option 1 describes, because a project factory is not defensible and your
Boundaries already said "pressing it twice writes the same pack twice". But your spec's **Ask
First** list says *"any change to what Use your brand does with an existing project"* is yours, so
here it is. **You can change it at your test — nothing else depends on it.**

**Ruled: a fourth option, the owner's own (2026-09-08).** A second press **says what it already did
and asks** — *"You already put your brand on “Ghost6”. Apply it again?"* — and where there is more
than one project it offers **one card per project**, each carrying that project's **own wireframe in
its own colours**, with the project this site is already on **pre-selected**. He then ruled the two
follow-ups: **A1**, one screen rather than two — the sentence, the cards, then the button, which is
also the only shape that works with JavaScript off; and **B1**, the cards appear **only when there is
more than one project**, because Free includes one and a chooser with one option is a step and not a
choice. Two things this deliberately is not: not a `<select>` (a native one cannot hold a drawing,
and a custom menu would need JavaScript), and **not a captured thumbnail** — FR-B1 defers those out
of v1 and prescribes exactly this instead, a Style-Pack drawing that stays "visually distinguishable
without claiming to be a preview". **It is purely additive:** the pre-selected card is what
`brandTarget` would have written on its own, so a customer who touches nothing gets the behaviour
ruled at Question 1.

1. **The second press puts your brand on the project Inflozo already made for that site, and the
   screen says so before you press: "We'll put your brand on "Ghost6", the project for this site."
   (RECOMMENDED)** — *this is what is built and proved now.* One site keeps one project, refreshing
   the brand is one press, and the screen never promises something different from what it does. At
   your project limit nothing changes: it still names the project you most recently worked on, as
   you ruled at Question 1.
2. **The second press does nothing and the screen says the site already has a project, with a link
   to open it.** Safest — it can never change a project you have since styled by hand — but
   "re-runnable" then stops meaning anything, and there is no way to pick the colour up again after
   you change it in Ghost.
3. **Leave the link off the card once a site has a project**, so there is no second press at all.
   Fewest moving parts, but the offer disappears from a card for a reason nothing on screen
   explains, and you could never take the brand again.

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
9. **Do:** press that link · **See:** the same screen as step 5, and under **Use your brand** one
   short line saying what it will do — either that it will make a project for this site, or, if you
   are already at your project limit, naming the project it will brand instead. **Do:** press **Use
   your brand** · **See:** the Sites page, and the line was right.
10. **URL:** https://app.inflozo.com/ · **Screen:** your dashboard · **See:** the project's card, and
    the little wireframe drawing on it is painted in **your orange**, not the default.
11. **URL:** https://app.inflozo.com/sites · **See:** the site's card now reads **1 project**.
12. **Press the offer link a SECOND time** — this is **Question 3**, your own ruling. **Do:** press
    the "use this site's brand" link on the card again · **See:** *"You already put your brand on
    “Ghost6”. Apply it again?"* and the two buttons. Because you have **one** project, there are no
    cards to choose from — that is your B1. **Do:** press **Use your brand** · **See:** the Sites
    page, and the card still reads **1 project** — **not 2**.
13. **Now the chooser, with something to choose.** **URL:** https://app.inflozo.com/ · **Do:** make a
    second project (**New project**), call it anything · **Do:** go back to
    https://app.inflozo.com/sites and press the brand link again · **See:** the same question, and
    under it **one card per project** — each with a small wireframe drawing **painted in that
    project's own colours**, its name beside it, and the card for this site's project **already
    selected** and outlined in coral. The site's project wears **your orange**; the new one wears the
    default. **Do:** click the other card, then **Use your brand** · **See:** the Sites page. **Do:**
    open https://app.inflozo.com/ · **See:** the project you picked is now the one wearing your
    orange, and the other one kept its own. Nothing was renamed, and there are still **2 projects**.
14. **Do:** on your phone, open the brand screen once more · **See:** the cards stack, the drawings
    stay legible, and you can tap one.
15. **Cleanup:** nothing to undo on Ghost — this story wrote nothing to your site. Delete the
    `Inflozo owner test` integration if you want to, and the spare project you made in step 13.

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
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected: the keys present by name,
  **`browser-js` PASS** (the review added it: the embedded Playwright script parses, checked before
  a key is read), and playwright, axe and the postgres driver resolvable. It starts no browser, so
  it proves none of the UI steps
- `python3 tools/probe/run-verify-ghost-admin.py` -- expected: every step in the docstring passes in
  order against **T1 `GHOST6_*` and T3 `GHOST5_*`** and the deployed `app.inflozo.com`, including
  `brand-keys`, `brand-screen`, `brand-seed`, `brand-atcap`, `brand-skip`, `brand-js-off`,
  `brand-none` and `axe-brand`, plus the review's two — **`brand-rerun`** (the offer pressed a
  second time on Pro, where there is room: one project before and one after) and
  **`brand-ownership`** (a second account's real site id forged into S2c's own two forms); axe
  reports zero violations at 1440 and 390. **This story writes to no Ghost** — the
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

## Dev record — what was executed, and what each service answered (R-82)

Run 2026-09-08, Node 24.18.1 on `PATH`. Every key is named by its variable; no value was printed
and none is recorded here.

| Command | Result |
|---|---|
| `GET /admin/settings/` on **T1** `ghost6.inflozo.com` 6.58.0 with `GHOST6_ADMIN_API_KEY` and on **T3** `ghost5.inflozo.com` 5.130.6 with `GHOST5_ADMIN_API_KEY` — the integration key alone, no staff token | **200 / 200.** All seven brand keys present in both payloads. `navigation` is a **JSON string** on both majors, `logo` and `icon` are **empty strings**, `cover_image` an https URL, `accent_color` a hex, `description` **null on T1** and a string on T3. Written up key by key as **MEASUREMENTS §40**; the reader was written against it, not ahead of it |
| `pnpm check` (`eslint .`, `pnpm -r typecheck`, `node --test`) | **exit 0.** 228 tests in `apps/web` pass — the 30 in `probe-rule.test.ts` and `style-pack.test.ts` include every new brand case — plus 1 in each of the three packages |
| `node --test probe-rule.test.ts style-pack.test.ts` | **30 pass, 0 fail.** Every I/O-matrix row that is a parsing or validation question: the JSON-string and array containers, an unparseable menu, the hostile accent, the hostile logo (`data:`, `javascript:`, `http:`), "nothing readable", and the patch keeping `public_url`, `announcement`, `code_injection` and `portal_button` beside the new `brand` |
| `pnpm build` (`next build`) | **exit 0**, and `ƒ /app/sites/brand` is in the route table — dynamic, inside the `(authed)` guard, so it needs no `app-routes.test.ts` entry |
| `python3 tools/doc-audit.py --check` (twice) | **PASS, 0 warnings.** No new catalogue row: the harness kept its path and its description follows its new subject |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, 82 PASS, 0 FAIL, against a PostgreSQL 17 container with every file in `supabase/migrations/`. **No migration in this story** — `projects.style_pack`, `projects.linked_site_id` and `sites.site_settings` all already exist |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **RESULT: all steps passed.** `keys` PASS (every variable by name), `vault-off-rest` PASS (§21j re-executed), `settings-keys` PASS, and the new **`brand-keys` PASS** against both live Ghosts — `{"T1": {…, "navigation": "json-string"}, "T3": {…, "navigation": "json-string"}}`. Playwright, axe-core and the `postgres` driver all resolved. It starts no browser, so it proves none of the UI steps |
| `git grep -n 'announcement_clear' -- apps/web packages tools` | `admin-rule.ts:103` and its test only. **No caller** — this story added no Admin write and `ADMIN_WRITES` is unchanged |

### The full harness, on the deployed site — `python3 tools/probe/run-verify-ghost-admin.py`

Run against **`app.inflozo.com`** serving CI's deployment of `6588fe8c` (`rls` ✔ `check` ✔ `deploy` ✔),
with **T1** `ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6.
**RESULT: all steps passed — 55 steps, 0 failures**, every step in the docstring in order. The
story's own eight, in the run's own words:

| Step | What the deployed site answered |
|---|---|
| `brand-keys` | Both majors carry all seven keys, and `navigation` is `"json-string"` on **both** — the live container is the string, not the array |
| `connect` | T1 connected from a bare host, the row complete, and the browser landed on **`/sites/brand?site=3ce18c3b…`** — S2c naming the site it just read, not the list |
| `brand-screen` | The accent `#FF1A75` **captioned as the hex** and really painted on the swatch; the menu `["Home","About"]` drawn as **2 text pills with 0 links**; "Your site today", "Fonts stay yours", "Your homepage, already wearing your brand.", both buttons, and the caption saying a project will be **made** |
| `brand-js-off` | `[{"method":"post","action":true,"encoded":1,"site":1,"decision":1,"submits":1},{…,"decision":0,…}]` — **both** forms progressively enhanced, exactly one carrying the hidden decision |
| `axe-brand` | **Zero violations** at WCAG 2.1 AA, 1440 and 390; no horizontal scroll |
| `brand-skip` | **0 projects written**, the browser back on `/sites`, and the card still carrying "Use this site's brand" — the offer survives a skip |
| `brand-seed` | 1 project named **"Ghost6"** (the site's own Ghost title), slug `ghost6`, **`linked_site_id` set**, `style_pack.brand.accent` `#FF1A75` equal to the site's; the card reads **"1 project"**; the dashboard card's three wireframe blocks compute to `["rgb(231, 226, 219)", "rgb(255, 26, 117)", "rgb(231, 226, 219)"]` — **the accent is painted** |
| `brand-atcap` | At the Free cap the caption **named** the project ("…put your brand on “Ghost6”.") and no longer promised a new one; pressing it left **1** project, the same row, **name, slug and `linked_site_id` untouched** — the owner's Question 1 ruling, live |
| `brand-none` | With the brand stripped: **0 offer links** and the route renders the **not-found** page — as does a `?site=` that is not the caller's, RLS returning no row |

Every pre-existing step still passes, including the ones this story moved through S2c (`re-adopt`,
`pro-connect-t3`), `ownership`, `audit` and `injection-live` — which confirms again that **this
story writes to no Ghost**: `injection-live` is 3.3's and is unchanged.

**Three defects the run found, all three in the harness and none in the product** — recorded because
"a result whose control did not pass is not a result":

1. A block-scoped `const same` shadowed the module-level `same()` helper, putting every earlier step
   in the same block into its temporal dead zone. Renamed, and a scan for that whole class of
   shadowing is in the file's own tooling now.
2. `Boolean(form.getAttribute('action'))` called four wired forms unwired: React emits `action=""`,
   and the empty string **is** the progressive enhancement. `notices-js-off` next door had the
   idiom (`!== null`) and this had copied the idea without it.
3. `brand-js-off` read the DOM S2c was reached by — a client-side redirect, built from an RSC
   payload, which carries neither `method="POST"` nor the `$ACTION_*` fields, because React emits
   those only when it renders on the **server**. It now fetches S2c as a fresh document, which is
   what a scripts-off browser is served. Both other js-off steps already did.

**One measured fact about the product, and it is not this story's:** a page in `(authed)` that calls
`notFound()` renders the not-found page but answers **HTTP 200**, because `(authed)/loading.tsx` is a
Suspense boundary over the whole group and the status is committed before the page component runs.
It is true of every authed route, the pages are `robots: noindex`, and the fix is the route-group
split `loading.tsx`'s own `ponytail:` note already names. Recorded as **DW-67**; `brand-none`
asserts the page the customer sees and records the status beside it.

**Real services this story touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); and the **Vercel** production deployment serving `app.inflozo.com`.
**Resend and Dodo are not on this story's path** and were not called.


## Review record — what was executed, and what each service answered (R-82)

Run 2026-09-08 against **CI's deployment of `f796a6e8`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔), with **T1** `ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6, and the
live Supabase project over PostgREST and the transaction pooler. Every key named by its variable; no
value printed or recorded.

| Command | Result |
|---|---|
| `pnpm check` | **exit 0.** 229 tests in `apps/web` (228 + `brandTarget`'s), 1 in each of the three packages. `tokens.test.ts` caught a hex in a comment the review had written and the comment was reworded — the guard doing its job |
| `node --test probe-rule.test.ts style-pack.test.ts` | **31 pass, 0 fail** — the new `brandTarget` block holds all four of its branches, and `hasBrand` now refuses a record with no `nav` array and a `logo` that is a string but not `https:` |
| `pnpm build` | **exit 0**, `ƒ /app/sites/brand` still dynamic inside the `(authed)` guard |
| `python3 tools/doc-audit.py --check` (twice) | **PASS, 0 warnings** |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, 82 PASS, 0 FAIL. **No migration** — the review added none |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **all steps passed**, including the review's new **`browser-js`** and `brand-keys` against both live Ghosts |
| `python3 tools/probe/run-verify-ghost-admin.py` | **58 steps, 0 failures**, every step in the docstring in order — 55 from Dev plus `browser-js`, `brand-rerun` and `brand-ownership`. **It reports 1 navigation retry** (DW-68), and that is recorded rather than smoothed away |
| `git grep -n 'announcement_clear'` | `admin-rule.ts` and its test only. **No caller**; `ADMIN_WRITES` unchanged |

### The two steps the review added, in the run's own words

| Step | What the deployed site answered |
|---|---|
| `brand-rerun` | On **Pro** with 1 project and 25 allowed — room to spare, the state no earlier step could reach — the caption named the project for this site rather than promising a new one, and pressing **Use your brand** a second time left **1 project**, the same row, name and slug, with the card still reading "1 project". This is the defect, gone |
| `brand-ownership` | `/sites/brand?site=` a row a **different account** owns rendered the not-found page; that id forged into S2c's own **Use your brand** and **Skip** forms and submitted from the fixture's session wrote nothing — the caller's projects byte-identical, and **0** linked to the stranger's site. The acceptance criterion's "or either action is posted", executed for the first time |

### Controls, including the one that failed

- **The new `brand-seed` assertion was wrong before it was right.** The review first asserted the
  accent on the **last** wireframe block; run 1 failed and printed the three computed colours, and
  `placeholder.tsx` says the accent is the **middle** one. Corrected against the source, and it now
  also asserts the accent is on **no other** block.
- **`brand-rerun` was proved to fail.** Run 1 of the review, against the pre-fix deployment, is the
  negative control: the second press made a second project and the step said so.
- **`browser-js` was proved to fail.** A deliberate redeclaration makes `--check` exit non-zero with
  the SyntaxError named; restoring the file makes it pass. It caught a real redeclaration in the
  review's own new step before a single live run was spent on it.
- **A hypothesis was disproved and its change reverted.** "The streamed `load` event never fires" led
  to navigating on `commit`; run 6 then timed out on `commit` too, so the change was taken back out
  rather than left in as unjustified machinery. DW-68 carries the open question.
- **The control that would have settled DW-68 could not be run** — the harness cannot sign in against
  a preview URL, so `--url` at the previous deployment dies at the first browser step. No claim is
  made about whether the hang is this deployment's, and none should be read into the pass.

**Real services this review touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.
