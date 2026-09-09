---
title: 'Story 3.4 — Take my brand from my site in one click'
type: 'feature'
created: '2026-09-08'
status: 'in-review'
baseline_commit: 'f848baaf4186660296a2f56e7161bc9ab72e4736'
review_loop_iteration: 5
owner_test: issues
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
  touching nothing writes exactly what Question 1 ruled. **AND THE CAPTION OVER THE CARDS HANDS THE
  CHOICE TO THEM (the owner's Question 6 ruling, option 1, 2026-09-09 — this sentence is his
  renegotiation of this block).** At the cap *and* with cards — the downgrade state — S2c reads
  *"You're at your project limit, so no new project — pick the one to wear your brand."*: it keeps
  the limit and **names no project**, because one card per project already does. Before it, that
  state printed the naming sentence of his Question 5 ruling, so the caption announced the answer
  and the cards underneath asked the question; at the cap with a **single** project that naming
  sentence is unchanged and still runs. Choosing a card writes `style_pack` and
  **nothing else** — `linked_site_id` is untouched, because FR-B5 gives a project at most one site
  and a chooser must not silently move a binding.
- **No captured thumbnail, ever, in v1.** The card's drawing is `placeholderFor`'s three colours and
  nothing else. FR-B1 defers auto-captured thumbnails out of v1 — "a wrong thumbnail is worse than
  none" — and prescribes the Style-Pack placeholder in their place; `projects.thumb_path` stays
  unused, the `thumbnails` bucket stays unprovisioned, and no headless browser runs anywhere.
- **THE OWNER RULED THE AT-CAP PATH (Question 1, option 1, 2026-09-08), and the screen says which
  project it will brand BEFORE the press, not after.** S2c counts the caller's projects against
  `atCap` at render: with room, the helper caption under **Use your brand** says a project will be
  made for the site; at the cap it names the project that will be branded instead — **the project
  for this site where there is one, and otherwise the most recently updated** (`updated_at desc`,
  the dashboard's own order). *(The first half of that is his **Question 4** ruling, 2026-09-08 —
  this clause is his renegotiation of this block. Before it, the cap always took the most recently
  updated row, so the ticked card and the card labelled "This site's project" could differ, against
  AC 6. One row now wears the brand on both sides of the cap whenever this site has a project, so a
  downgrade cannot move it.)* The form carries that
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
  compose the button's caption and the hidden decision field. Every value it reads back out of the
  jsonb column and puts into an attribute — the accent, the logo and the menu — is **re-validated
  here**, not trusted from the write: `hasBrand` is an OR, so a record admitted on its logo alone
  carried an unchecked accent into an inline `style` (review 2, 2026-09-08).
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `connectSite`'s tail (`:327-330`): the
  redirect becomes `/sites/brand?site={siteId}` when the freshly probed row has a brand, `/sites`
  otherwise. **Two new exports** (a `'use server'` module may export only async functions — the
  file's own header at `:70-77` records why they live here): `useBrand(formData)` and
  `skipBrand(formData)`, each `signedIn()`, and each reading and writing through the caller's own
  session so that **RLS is the guard rather than an `.eq('user_id', …)` we remembered** — which is
  what `brand-ownership` executes. `useBrand` re-counts against `atCap`, refuses a stale decision
  (Boundaries, the owner's Question 1 ruling) and `revalidatePath`s `SITES` and `DASHBOARD` before
  redirecting; `skipBrand` writes nothing at all, so it revalidates nothing and only redirects.
  (Review 2, 2026-09-08: this paragraph described `.eq('user_id')` filters and a `skipBrand`
  revalidate that were deliberately not built — propagate, never localise.)
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
- `apps/web/app/(app)/app/(authed)/page.tsx` -- **one line and its comment**: `.order('id')` breaks
  the dashboard's `updated_at` tie, because two projects saved in the same millisecond let S2c and
  `useBrand` name different rows and the press bounced for ever. The tie-break is real; the reason
  first written beside it — that it decides "the row the brand lands on" — was a reach and was
  narrowed at review 3. *(The Code Map named neither this file nor the next one until review 4.)*
- `tools/story-board.py` -- **not this story's screen, but this story's diff, and it changes the
  board for EVERY story**: `REAL_SERVICE` learns the production domains, so a Verification that names
  `app.inflozo.com` is no longer told it named no real service (found on this story at review 3) —
  **anchored at review 4**, because the first writing of it also matched `owner@inflozo.com`; and
  `question_blocks` requires a blank line before a heading, so a wrapped prose line beginning
  "Question 1" stops starting a block. `demo()` carries a case for each, both directions.
- `tools/probe/run-verify-ghost-admin.py` -- the `connect` step's landing assertion moves to
  `/sites/brand`; the story's own steps, **in the order the run emits them** (the docstring is the
  list and it is derived from the source, never retyped): `brand-keys` (the **integration** key's
  `GET /admin/settings/` really carries `accent_color`, `logo`, `icon`, `cover_image`, `navigation`,
  `title` and `description` on T1 and T3, with the shape each arrives in recorded), `brand-screen`
  (S2c on the deployed site, its values matching the row), **`brand-logo`** (the `<img>` half of the
  logo slot, driven off a fixture row patched through the service role — no Ghost written),
  **`brand-failed-line`** (the `&failed=1` sentence, asserted both ways), `brand-js-off` (both forms
  post with scripts disabled), `axe-brand` at 1440 and 390, `brand-skip` (→ `/sites`, no project
  written), `brand-seed` (**Use your brand** → a
  project exists, `linked_site_id` set, `style_pack.brand.accent` equal to the site's, the site card
  reading "1 project" and the dashboard card painted in it), `brand-atcap` (the caption names the
  project before the press), **`brand-stale`** (the empty decision S2c itself emits at the cap writes
  nothing), **`brand-forged-project`** (the other half of that same guard: a `project_id` the caller
  does not carry writes nothing, and with the clause gone the post makes a project past the cap),
  `brand-none` (a seeded row with no brand
  redirects to `/sites` and draws no link), **`brand-rerun`** (the offer pressed again on Pro, where
  there is room), **`brand-picker-js-off`**, **`axe-brand-picker`**, **`brand-picker`** (the chooser,
  and the proof that the pack is merged and not replaced, and — since review 5 — that the preset
  floor really runs, its fixture carrying no `preset` at all), **`brand-atcap-picker`** (the
  Question 4 and Question 6 rulings in the only state that reaches them) and
  **`brand-ownership`**, last of them (a second account's real site id forged into both forms).
  *(This list is the third the bullet has carried: it was corrected for omission at review 2, for
  omission again at review 4, and for ORDER at review 5, when `brand-skip` sat four positions late
  and `brand-ownership` five early. The docstring — which is derived from the source — was right
  each time. A retyped copy of a derived list is the thing standing rule 4 is about; read the
  docstring, and treat this as prose about the shape rather than as the list.)*
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
  brand** names the project that will be branded — **the project for this site where there is one,
  and otherwise the most recently updated** (the owner's **Question 4** ruling, 2026-09-08; before
  it this criterion said "the most recently updated" unconditionally, which after that ruling named
  a different row from AC 6b and was corrected at review 3) — and pressing it writes
  `style_pack.brand` onto that project and **changes nothing else about it**: not its name, not its
  `slug`, not its `linked_site_id`
- Given a decision that has gone stale between render and press, when **Use your brand** is posted,
  then nothing is written and the browser returns to S2c with the true caption
- Given a caller with **more than one project** whose brand would go onto one that already exists,
  when S2c is opened, then it **asks** rather than tells — *"You already put your brand on “X”.
  Apply it again?"* with room, and at the cap the sentence the owner ruled at **Question 6**
  (option 1, 2026-09-09), *"You're at your project limit, so no new project — pick the one to wear
  your brand."*, which keeps the limit and **names no project, because the cards do** (before that
  ruling this state printed the naming sentence, so the caption answered and the cards then asked)
  — and draws **one card per project** — each
  carrying that project's own Style-Pack wireframe, the two drawings visibly different where the
  Style Packs are — with the project this site is already on **pre-selected**; and when a different
  card is chosen and pressed, then the brand lands on **that** project and nothing else about it
  moves, and the project count is unchanged
- Given that caller is **also at the project cap** — a downgrade, the only way to be at the cap with
  more than one project — when S2c is opened, then the **same** card is pre-selected: the project
  for this site, carrying the "This site's project" label, and not the most recently updated one
  (the owner's **Question 4** ruling, 2026-09-08). The cap decides only which project is named when
  this site has none — **and the caption over those cards names none at all** (his **Question 6**
  ruling, option 1, 2026-09-09): at the cap with a choice it keeps the limit and hands the choice
  to the cards, while at the cap with a **single** project it still names the row, because there
  the caption is the only thing that can (his Question 5, untouched)
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

### Review Findings

Second review, 2026-09-08 — five layers (blind hunter, edge-case hunter, verification-gap,
acceptance auditor, real-infra), 20 findings after dedup, 8 dismissed with reasons.

- [x] [Review][Decision] **RULED — option 1 (owner, 2026-09-08).** At the cap with several projects,
      the pre-selected card is now the site's own project on both sides of the cap; `brandTarget`
      falls back to the most recently updated row only when this site has no project. Executed as
      `brand-atcap-picker`. *(As raised:)* the pre-selected card was not the site's
      project — `brandTarget` returns the most recently updated row (Question 1) while AC 6 and the
      Question 3 ruling both say the project this site is already on is pre-selected, so the ticked
      card and the card marked "This site's project" can differ. Two of the owner's own rulings point
      at different cards; put to him as **Question 4** rather than guessed (standing rule 6). Only
      reachable on Pro at 25 projects. `apps/web/lib/probe-rule.ts` (`brandTarget`)
- [x] [Review][Patch] The second press told rather than asked wherever there was one project — the
      owner's Question 3 sentence was tied to the cards, though his B1 scoped only the cards, and his
      own manual test step 12 expected the question [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx]
- [x] [Review][Patch] `atLimitPick` named no project, against AC 4 — and was the one caption no step
      and no criterion ever reached; the three captions are now `willCreate` / `willBrand` /
      `alreadyOn` and `willRebrand` and `atLimitPick` are gone [apps/web/lib/probe-rule.ts]
- [x] [Review][Patch] S2c painted `brand.accent` into two inline `style` attributes and mapped the raw
      `nav` array, while re-validating the logo one line above and while `style-pack.ts` re-validates
      the same accent — `hasBrand` is an OR, so a record admitted on its logo alone carried both
      unchecked [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx:131]
- [x] [Review][Patch] The DW-68 retry wrapped `page.goto` only; the review's own four full runs failed
      three times, every one on a `waitForURL` after a form submission, so the run died with
      `navRetries` at 0. Now `goto`, `waitForURL` and `reload` through one helper
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The retry count printed at the end of the `try`, so the run that most needed it
      — one that hung and then failed — never printed it. Moved into the `finally`
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The cap's own half of `useBrand`'s guard was asserted nowhere: every step posts
      a real project id, so an empty decision at the cap — the body S2c itself emits — was never
      executed, and AC 5's stale decision had no proof at any level. New step **`brand-stale`**
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] AC 8 ("given the chooser, when JavaScript is off") and axe were both asserted on
      the one S2c state that has no chooser — both run before any project exists. New steps
      **`brand-picker-js-off`** and **`axe-brand-picker`** [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The `updated_at, id` tiebreak was added to S2c and `useBrand` while both claim
      parity with "the dashboard's own order", which still ordered on one column — the tie case is
      exactly what the tiebreak is for [apps/web/app/(app)/app/(authed)/page.tsx]
- [x] [Review][Patch] The offer URL was written out twice, in `sites/actions.ts` and in the Sites
      card; one rename would have drifted them apart with nothing failing (standing rule 7). One
      `brandPath` [apps/web/lib/probe-rule.ts]
- [x] [Review][Patch] The failure line rendered after both buttons; a `role="status"` already present
      at first paint is not announced, and it is the reason the customer is being asked to press again
      [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx]
- [x] [Review][Patch] **The owner's manual test could not be performed.** Step 13 told him to make a
      second project, which Free's cap of 1 forbids, and never said the chooser needs Pro or how to
      get there; step 12's expected sentence was the chooser's, which a one-project account never
      sees. Steps 12–15 rewritten, with the Pro switch offered as step 1's idiom already does
- [x] [Review][Patch] The Code Map described an implementation deliberately not built — `.eq('user_id',
      user.id)` filters where RLS is the guard, and a `revalidatePath` in `skipBrand`, which writes
      nothing; `## Verification` named neither `brand-picker` nor the new steps
- [x] [Review][Defer] Two presses in flight can still make two projects for one site and walk past the
      cap — the idempotence is the application's, not the schema's; the fix is a partial unique index,
      which is a migration and so the owner's ("Ask First") — deferred as **DW-69**
- [x] [Review][Defer] Every `notFound()` in the app renders Next's own unstyled 404 — there is no
      `not-found.tsx` anywhere in `apps/web` — while `M9 404` is drawn in the export. One route-group
      question with the HTTP-200 finding; folded into **DW-67**, deferred, pre-existing
- [x] [Review][Defer] The harness fails roughly three runs in four on the DW-68 hang, so a red run is
      not by itself a regression. Measured across four consecutive full runs; **DW-68** amended with
      what the retry did and did not cover

### Review Findings — third review, 2026-09-08

Five layers (blind hunter, edge-case hunter, verification-gap, acceptance auditor, real-infra), 44
findings after dedup, 13 patched, 3 deferred, one put to the owner, the rest dismissed with reasons.
**The full harness ran green on the deployed site and every claim in `## Verification` held under
execution with negative controls** — the findings below are what five layers found *besides* that.

- [x] [Review][Patch] **A pack that lost its `preset` lost its BRAND with it, and the card silently
      reverted to Paper.** `placeholderFor` read `brand` out of `stylePackSchema.safeParse`, and
      `preset` is required — so any pack without one failed the whole parse and took a perfectly
      good accent with it, making AC 3 false with nothing failing. `useBrand`'s merge
      (`{ ...pack, brand }` over whatever the column holds, and `style_pack` is in the caller's own
      UPDATE grant) is a path that produces exactly that pack. **Three layers met this
      independently, and the fourth met it from the other end:** the real-infra layer found the
      Review 2 record's own boundary line, `placeholderFor({brand:{accent:'#FF1A75'}})` →
      `#FF1A75`, **does not reproduce** — it returns Paper. The brand is now read off the raw
      column (it is re-validated by `isAccent` either way, so the parse was never what made it
      safe), the merge floors on `defaultStylePack()` so the stored row stays valid too, and a new
      `style-pack.test.ts` case pins it. **Negative control: the new test fails against the old
      code and passes against the new.** That also makes the Review 2 line true as written rather
      than editing a dated record [apps/web/lib/style-pack.ts]
- [x] [Review][Patch] `epic-3-context.md`'s auto-brand paragraph still described the pre-fix
      behaviour — neither the Question 3 nor the Question 4 ruling ever reached it, so it said the
      cap sends the brand to the most recently updated project and never mentioned the chooser.
      Propagate, never localise [_bmad-output/implementation-artifacts/epic-3-context.md]
- [x] [Review][Patch] **AC 4 and AC 6b named different rows for the same state.** AC 4 still said
      "the most recently updated" unconditionally, which the Question 4 ruling had replaced; the
      criterion is now the ruling [this spec, Acceptance Criteria]
- [x] [Review][Patch] **The harness docstring was not in execution order**, against the Code Map's
      "names every step, in order" and `## Verification`'s "passes in order". `brand-rerun` and the
      whole picker block were documented before `brand-skip` though they run after `pro-connect-t3`;
      `brand-atcap`/`brand-stale`/`brand-none` were documented last though they run right after
      `brand-seed`; `brand-ownership` sat before `ownership`; `brand-picker` before its own js-off
      step; and `browser-js` among the browser steps though it runs in `main()` before a key is
      read. Reordered and re-derived from the source. (The real-infra layer checked MEMBERSHIP and
      found nothing missing — both are true, and only order was wrong) [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **`browser-js` claimed a guarantee it does not give, and the claim was
      executed rather than argued.** Its docstring, its inline comment and the `doc-audit.py` row
      all said it catches both the redeclaration and the temporal-dead-zone shadowing that bit this
      file at Dev. `node --check` exits **0** on the shadowing case — it is valid syntax — and the
      file's own note beside the `same` helper already said so, so the repository contradicted
      itself in three places. All three narrowed to what the gate really answers (standing rule 1)
      [tools/probe/run-verify-ghost-admin.py, tools/doc-audit.py]
- [x] [Review][Patch] The `doc-audit.py` catalogue row stopped at the Fix-1 step list: `brand-stale`,
      `brand-picker-js-off`, `axe-brand-picker` and `brand-atcap-picker` were all missing — the last
      being the executed proof of the owner's Question 4 ruling [tools/doc-audit.py]
- [x] [Review][Patch] **The logo slot had no live proof of either outcome.** §40 records `logo` as
      an empty string on both majors, so the branch every run renders is the monogram tile — and
      `brand-screen` asserted the swatch, the pills, the headings and the captions but never the
      slot. It now asserts the live branch by the row: the tile carries the first **code point** of
      the site's own Ghost title, uppercased, with no image beside it. The `<img>` half stays
      unit-proved only, and deliberately: writing a logo to a test Ghost is an Admin write and this
      story makes none ("Ask First") [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The chooser's radio inputs carried no `outline-none`, so a keyboard user got
      the UA outline on the 16px dot **and** the coral ring on the card — two focus indicators,
      which `greyed.ts:60`'s `ring` exists to prevent and which axe cannot see, so
      `axe-brand-picker` passing was not evidence against it [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx]
- [x] [Review][Patch] **A card whose project is bound to a DIFFERENT site said nothing**, sitting
      beside one marked "This site's project" and so reading as unbound — while picking it paints
      this site's brand onto a project bound elsewhere. Two layers met it independently. It now
      carries "Another site's project" in the same slot and the same idiom; the behaviour is
      unchanged and `linked_site_id` is still never written, so no binding moves
      [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx]
- [x] [Review][Patch] `rgbOf` threw on a null accent — reachable, because `hasBrand` is an OR and a
      site can qualify on its logo or menu alone — which would have killed the whole run as an
      opaque `browser` failure instead of failing the step that asked
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **The retry count was lost in exactly the case it exists for.** `run_browser`
      read the `note:` lines off captured stdout only on a run that returned; on the 1200s
      subprocess timeout — the DW-68 hang itself — it discarded them. `TimeoutExpired` carries what
      the child had already written, and they are printed from it now
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] `brand-stale`'s detail string dereferenced `afterStale[0]` unguarded, so an
      empty list turned a meaningful failure into a crash; and the retry note printed a
      **predicate's source** where it means to print a URL, because `waitForURL` takes a function —
      the one line a reader goes to after a hang [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The dashboard's `.order('id')` comment claimed the tie-break decided "the row
      the brand lands on". It does not: `brandTarget` runs on S2c's own read and again on
      `useBrand`'s own read, and a posted choice is resolved by id, so the dashboard's ordering
      reaches neither. The tie-break is real and worth keeping; the reason beside it was a reach
      [apps/web/app/(app)/app/(authed)/page.tsx]. Two cites of the `projects` UPDATE grant pointed
      at `:1201`, which is the `revoke`; the `grant` is `:1202` (standing rule 7)
- [x] [Review][Decision] **RULED — option 1 (owner, 2026-09-09).** The caption is two sentences now
      — *"You're at your project limit. We'll put your brand on “X”."* — keeping the limit and
      dropping the cause. One string changed; the choice is untouched. *(As raised:)* **the at-cap
      caption gave the limit as the REASON for a choice the limit no longer makes.** After the Question 4 ruling the site's own project wins on both sides of
      the cap, so "You're at your project limit, **so** we'll put your brand on “X”." states a cause
      that is no longer there. The project named is correct; only the clause is stale. Put to the
      owner as **Question 5** rather than rewritten, because his own manual test step 12 quotes the
      sentence verbatim — the wording is his [apps/web/lib/probe-rule.ts, `BRAND_COPY.willBrand`]
- [x] [Review][Defer] The chooser is a surface with **no frame** and was never drawn back into the
      export, which is R-74's second half; and at 25 projects it renders 25 stacked cards with no
      scroll bound and no design for that state, which nothing has ever looked at — every live proof
      runs with two cards. **DW-70**
- [x] [Review][Defer] `icon`, `cover` and `description` are read, stored and copied into every
      branded project's pack, and **nothing reads them anywhere**; `style-pack.ts` says they are
      "stored for the epic that uses it" and names no epic. `hasBrand` narrows to `Brand` while
      checking only `nav` and one of accent/logo/nav, so the same fields are the ones its predicate
      does not check. **DW-71**
- [x] [Review][Defer] Two connected sites with the same Ghost title make two projects with the same
      name — the create branch dedupes the slug and not the name, though `lib/projects.ts` carries
      the taken-names idiom. Deferred rather than patched because the suffix a customer reads is a
      naming decision, and `copyName`'s "Copy of X" is the wrong sentence for a brand seed. **DW-72**

**What could not be verified, and no claim is made about it.** Connect's "no brand to offer" arm —
`redirect(hasBrand(…) ? BRAND : SITES)`'s false side, AC 11's landing — **is executed by nothing and
cannot be driven from here.** Both test Ghosts answer an accent and a menu, and a connect re-probes
and re-writes the brand it just read, so the state is only reachable when the probe itself fails.
`brand-none` covers the route's 404 and the missing link, which is the rest of that criterion, but
the landing is unpinned: a regression there turns a successful connect into a framework 404. It is
recorded here rather than papered over, and the honest reading of the green run is "every assertion
held", not "every branch ran".

**And the 834 width is drawn by nothing (review 5, 2026-09-09).** AC 2 and Boundaries both say
"1440 / 834 / 390", and the run reaches 834 only through `shoot()`, which returns immediately unless
`SHOTS_DIR` is set — no command in `## Verification` passes `--shots`, and no review or fix record
reports having run it. `axeAt` covers 1440 and 390, which is what those criteria say and what the
run proves. So the tablet width is **asserted at no level**: the responsive behaviour there rests on
the same Tailwind `tablet:` breakpoints the rest of the app uses, which is a reason to expect it and
not a proof of it. It is also the width at which nobody has seen the chooser at all, since
`shoot(page, 's2c')` fires on the first S2c visit, before any project exists. The owner's manual
test walks 390 (step 14) and 1440 throughout; 834 is the gap, and it is named here rather than
counted as covered.

**Dismissed, with the reason.** The concurrent double press is **DW-69**, already deferred by the
last review for the reason that has not changed (the fix is a migration, which is "Ask First") —
re-raised by a layer that could not see the ledger. `brandOf` was reported as leaving `icon` and
`cover` unvalidated; it does not — both go through `imageUrl`, and the finding was about `hasBrand`'s
predicate, which is DW-71. `brandKept` was reported as possibly `undefined` and so deleting the row's
brand on restore; it is `… .brand || {}` and cannot be. `skipBrand` as a link rather than a form —
the **third** time this has been raised, and Boundaries freezes both controls as forms. An unbounded
Ghost menu stored twice and drawn as unbounded pills — a large menu is the customer's own data, not a
payload, and clamping it would be inventing a limit no frame states; noted here, not patched. A logo
URL that 404s rendering a broken `<img>` — `imageUrl` proves the scheme, not the fetch, and the only
fix that helps needs JavaScript, which this screen deliberately does not use. Every reconnect landing
on S2c — that is "re-runnable" working, and the harness's `skipS2c` is how three pre-existing steps
walk past a screen they are not about. `audit` is documented early and runs late — pre-existing, not
this story's.

**Dismissed, with the reason.** `skipBrand` could be a link rather than a form — Boundaries freezes
both controls as forms, and it is the second time this has been raised. `connectSite`'s second
`sites` read is deliberate and its comment says why (a failed probe still leaves a previous probe's
brand — the FR-C6 re-adopt path). `ProjectThumb` duplicating `Placeholder` — two drawings at two
sizes, chosen deliberately and recorded in the file. The chooser appearing only on a second press —
that is Question 1's ruled behaviour, not an omission. `useBrand` returning silently on an
unparseable `site_id` — a crafted post is not a press, and it is `recheckPlan`'s existing shape. The
connect redirect's false branch being unexecuted — both sides call the same `hasBrand` on the same
value, which is the reason already recorded in the first review's dismissals. `brand-keys` making
`--check` depend on the live Ghosts — that is standing rule 1 being executed, and it is why the step
exists. "25 allowed" in a run's detail line — a log sentence, not a count anything derives from,
though the phrase was dropped where it cost nothing.

### Review Findings — fourth review, 2026-09-09

Five layers (blind hunter, edge-case hunter, verification-gap, acceptance auditor, real-infra), 41
findings after dedup, 14 patched, one put to the owner, the rest dismissed with reasons.
**The real-infra layer confirmed through the Vercel API that `app.inflozo.com` serves HEAD
(`52a5b58f`) before trusting any live assertion, then re-executed every claim in `## Verification`,
the Review 3 record and Fix record 3 — all held, with negative controls at both the unit and the
live-API boundary**, including the `placeholderFor({brand:{accent:'#FF1A75'}})` line that review 3
made true. The findings below are what five layers found *besides* that.

- [x] [Review][Decision] **RULED — option 1 (owner, 2026-09-09).** The caption at the cap AND with
      cards became *"You're at your project limit, so no new project — pick the one to wear your
      brand."*, which keeps the limit and names no project because the cards do; `willBrand` is
      untouched and still runs at the cap with a single project. Executed as `brand-atcap-picker`,
      which asserts the ruled sentence and that the naming one is gone from that screen, while
      `brand-atcap` proves it still alive one state over. AC 6, AC 7 and the Boundaries clause were
      corrected in the Fix. *(As raised:)* **The at-cap caption TELLS while the cards beside it ASK, and two of the
      owner's own rulings point at the two halves.** Downgraded to Free with two projects — AC 7's
      state — S2c prints *"You're at your project limit. We'll put your brand on “Ghost6”."* (the
      Question 5 ruling) and then draws a card per project asking which (the Question 3 ruling).
      The caption states an answer to the question the cards are still asking. `caption` branches
      on `capped` and `choosing` branches on `rows.length > 1`, so the two are decided by different
      predicates; `brand-atcap-picker` asserts exactly this pair live. **AC 6 and the frozen
      Boundaries clause both say S2c "asks" in this state**, so the shipped behaviour and the
      spec's own prose disagree — but the behaviour is what he ruled twice, and choosing between
      his rulings is not the review's to do (standing rule 6). Put to him as **Question 6**; AC 6
      and Boundaries are corrected in the Fix, once he has ruled
      [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx, the `caption`/`choosing` pair]
- [x] [Review][Patch] **The `<img>` half of the logo slot had never rendered, and the recorded
      reason for that was wrong.** §40 records `logo` as an empty string on both majors, so every
      run draws the monogram tile; the `<img>` branch — **what a customer whose Ghost carries a
      logo gets, which is most of them** — was left "unit-proved only" because writing a logo to a
      test Ghost is an Admin write this story does not make. Nothing here needs Ghost: `brand-none`
      already drives S2c off a fixture row patched **through the service role**, which is a
      Supabase write, and the same handle reaches the logo. New step **`brand-logo`**: exactly one
      `<img>` carrying that src and the monogram tile not drawn beside it, restored in a `finally`
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **The failure line the customer sees when a press does nothing was asserted
      by its own string length and by nothing else, at any level.** All four of `useBrand`'s failure
      branches redirect to `&failed=1`; `probe-rule.test.ts` asserts `BRAND_COPY.failed.length > 0`,
      no harness step ever loaded the flagged URL, and `.tsx` cannot be reached by `node --test` at
      all — so deleting the block that renders it would have shipped green and the matrix's "insert
      fails → the page says so" rested on a non-empty string. New step **`brand-failed-line`**,
      asserted **both ways** [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **Nothing in the repository could tell `useBrand`'s merge from a replace.**
      The chooser's fixture project was inserted with `style_pack: { preset: 'paper' }`, which is
      byte-identical to `defaultStylePack()`, so a write that replaced the whole column passed
      every assertion in the file while the action's docstring claims "a pack E6 has since written
      survives untouched". The fixture now carries a key the default does not (`mode`), and
      `brand-picker` asserts it survives the press [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **`REAL_SERVICE`'s widening matched an email address.** `\b(?:app|www)?\.?inflozo\.com`
      puts a word boundary in front of an *optional* group, so it matched `owner@inflozo.com`,
      `my-inflozo.com`, `staging.inflozo.com` and the bare words in prose — and this pill is the one
      thing that tells the owner a spec's `## Verification` named no real service (R-82). Executed:
      all four matched. Anchored, and `demo()` now asserts both directions, which is the only reason
      the first version's breadth was invisible [tools/story-board.py]
- [x] [Review][Patch] **The blank line a question heading must follow was tested as the two bytes
      `\n\n`.** `endswith('\n\n')` is false for a CRLF spec and false for a "blank" line holding a
      space or a tab — and the check DROPS a heading it does not recognise, so the question under it
      merges into the one above and vanishes from the owner's inbox, which is the failure the check
      was added to prevent, in the other direction. Three layers met it. Now a regex, with three
      `demo()` cases [tools/story-board.py]
- [x] [Review][Patch] **A transient read failure on S2c rendered the not-found page**, telling a
      customer his own site is gone. The projects read two lines below has taken the opposite
      position since review 2 ("A COUNT THAT COULD NOT BE READ IS NOT A COUNT OF ZERO") and
      `sites/page.tsx` since 3.3 — two reads in one `Promise.all` were answering it two ways. Same
      in `useBrand`, where the three write branches all redirect with a reason while the site read
      404'd [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx, sites/actions.ts]
- [x] [Review][Patch] `throw projectsError` threw a raw `PostgrestError` — a plain object, not an
      `Error`, carrying `details` and `hint`, which PostgREST fills with **row values**, straight
      into the server log and the error digest. Every other reader in this epic logs `{ code }`
      alone, and the epic's "never log" rule is about content, not only credentials. One
      `readFailed` helper now covers both reads
      [apps/web/app/(app)/app/(authed)/sites/brand/page.tsx]
- [x] [Review][Patch] **The merge floored the hole and not the wrong shape, while the comment
      claimed both.** `{ ...defaultStylePack(), ...held }` repairs an *absent* `preset` but writes a
      present-but-wrong-typed one straight back, so the row it stores still fails `stylePackSchema`
      — and `style-pack.test.ts`'s own new case constructs exactly `{ preset: 7 }` as "a thing this
      column can really carry". The render was safe either way (review 3 made `placeholderFor` read
      the brand off the raw column), so the defect was the claim's scope; the floor is now the whole
      required field [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] **The harness docstring's last inversion.** Review 3's patch claims it was
      "reordered and re-derived from the source"; `axeAt(page, 'brand-picker')` emits its step at
      call time, and it is called **before** `step('brand-picker')` runs. Two layers derived the same
      pair independently, and the run log agrees. Against AC 14, the Code Map's "names every step,
      in order" and `## Verification`'s "passes in order" [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **Review 3's `:1201` → `:1202` correction missed the third occurrence** —
      standing rule 7, in the review that invoked it. `style-pack.ts`, `probe-rule.ts` and
      `sites/actions.ts` were all corrected; the test file beside `style-pack.ts` was not
      [apps/web/style-pack.test.ts:49]
- [x] [Review][Patch] A clause was dropped out of the `useBrand` merge comment in the same review-3
      edit that carried the `:1202` correction, leaving a load-bearing sentence without its verb
      [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] **`ProjectThumb`'s doc did not describe `ProjectThumb`.** It claims to be "the
      dashboard card's drawing shrunk… a project looks in the chooser exactly as it looks on the
      dashboard"; its bars are 55%/75% against `Placeholder`'s 40%/55%, because a 40% bar in 64px
      is nine pixels. The claim is the colours and the layout, and it is written that way now
      [apps/web/app/(app)/app/(authed)/placeholder.tsx]
- [x] [Review][Patch] **Two restated counts** (standing rule 4, and the rule the tooling has broken
      twice): the harness printed "the seven FR-C4 keys" beside `BRAND_KEYS`, which is the source,
      and called `brandOf` "the FIFTH reader" in a comment. The print derives `len(BRAND_KEYS)` now
      and the prose carries no number [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The Code Map named neither file this story also changed — the dashboard's
      `page.tsx` (the `updated_at, id` tie-break) and `tools/story-board.py` (the `REAL_SERVICE`
      domains and `question_blocks`, which change the board for **every** story, not this one) —
      and its harness bullet still listed the Dev step set, omitting nine steps including
      `brand-atcap`, the executed proof of the Question 1 ruling. It was patched at review 2 for
      the same omission and had drifted again [this spec, Code Map]

**Dismissed, with the reason.** The concurrent double press is **DW-69** and the fix is still a
migration ("Ask First") — re-raised by two layers that cannot see the ledger. `hasBrand` narrowing to
`Brand` while checking only `nav` and one of accent/logo/nav is **DW-71**, raised again in its own
words. `skipBrand` as a link rather than a form — the **fourth** time, and Boundaries freezes both
controls as forms. An unbounded Ghost menu and an unclamped title — dismissed at review 3 for the
reason that has not changed: a large menu is the customer's own data, not a payload. `useBrand`
having no explicit cap check of its own, relying on `brandTarget` returning a row whenever `capped`
— true, and it holds because no plan has a cap of 0; `PLANS` is a literal in one file and a second
guard for a configuration that does not exist is the speculative kind. `brand: z.unknown().optional()`
being dead weight in a `.loose()` schema — it is the column's documentation of a key this story added
and the comment beside it explains the `unknown`; deleting it buys nothing. `style-pack.ts` importing
`probe-rule.ts` inviting a cycle — no cycle exists and the one-rule-in-one-place reason is recorded
in both files. The chooser's focus and selection resting on `:has()` — baseline in every browser this
app targets. A successful press saying nothing on arrival at `/sites` — that is the ruled design; the
tally is the change. `notFound()` from inside a server action having no asserted *appearance* —
`brand-ownership` asserts the substance, that nothing was written. `brand-screen` and `skipS2c`
assuming both test Ghosts answer a brand — true, and they are our own controlled fixtures; a step
that goes red when someone clears T1's accent is the harness working. The `preamble` pop dropping a
headless, optionless question — a deliberate, documented trade-off with no signal that could tell it
from prose, and erring the other way puts an unanswerable sentence in the owner's inbox for ever.

### Review Findings — fifth review, 2026-09-09

Five layers (blind hunter, edge-case hunter, verification-gap, acceptance auditor, real-infra), 29
findings after dedup, 15 patched, 2 deferred, 12 dismissed with reasons, **none for the owner** —
every one of his six questions carries a `Ruled:` line and no fix here needed a decision that is his.
**The real-infra layer confirmed through the Vercel API that `app.inflozo.com` aliases the reviewed
commit before trusting any live assertion, re-executed every claim in `## Verification` and in the
Review 3, Review 4 and both Fix records, and added two negative controls of its own** — a Ghost
Admin key with one hex digit flipped (401 on both majors) and `BRAND_COPY.atLimitChoose` pointed at
the pre-ruling sentence (`probe-rule.test.ts` went red and back green). All held.

- [x] [Review][Patch] **"the FIFTH reader" is not a restated count, it is a WRONG one**, in four live
      places at once. The readers that take the flat record `settingsOf` builds are `injectionFlag`,
      `portalState`, `announcementOf` and `brandOf` — four. `settingsOf` BUILDS the record rather
      than reading it and `capabilityOf` takes `hostSettings`, a different payload; the header said
      "the three readers" before this story, so +1 was always four. Two layers derived it
      independently. The number is gone from all four, and `probe-rule.ts` now carries why it is
      gone rather than a corrected figure — the sixth reader would have made it wrong again
      [apps/web/lib/probe-rule.ts ×3, _bmad-output/implementation-artifacts/epic-3-context.md]
- [x] [Review][Patch] **`useBrand` has FIVE `&failed=1` branches and every document said four**
      (`actions.ts:577,608,616,677,699`) — a restated count in the story whose previous review
      patched two others. De-numbered in the harness docstring, its inline comment and the
      doc-audit row [tools/probe/run-verify-ghost-admin.py, tools/doc-audit.py]
- [x] [Review][Patch] **`connectSite`'s landing read was the third reader in this one story asked
      "is a failed read an absence?" and the only one still answering by silence.** Its `error` was
      not even destructured, so a transient PostgREST failure sent a successful connect to `/sites`
      indistinguishably from "this site has nothing to offer". Review 4 gave the opposite rule to
      the other two reads of the same table **in this same change** — propagate, never localise,
      missed inside one commit. Three layers met it. The landing stays `/sites` deliberately (with
      no readable row there is nothing to say whether S2c would 404, and the card's own offer link
      is the recovery); what changed is that the failure now names itself in the log
      [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] **The `!picked` half of `useBrand`'s staleness guard was executed by nothing,
      at any level** — and the cap's second guard sits behind it. `brand-stale` posts the EMPTY
      decision and takes the other half of the ternary; every other step presses a real button, so
      `picked` is always found. Delete the clause and a post naming an unknown project id falls
      through to the INSERT branch and makes a project **past the Free cap**, with the whole run
      green. New step **`brand-forged-project`**, and the project count is the assertion, so it
      proves the paywall as well as the guard [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **`brand-failed-line` proved the sentence and not the branches.** It typed the
      flagged URL itself, so it showed the copy renders off `?failed=1` and nothing about anything
      ever SETTING the flag — the same shape of gap the step was added to close, one level up. Two
      layers. It now drives a real branch: a press whose `project_id` input is REMOVED (which is
      `decision_missing`, not the blank value `brand-stale` posts) is asserted to land back on S2c
      carrying `failed=1` and printing the line [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **Review 4's preset floor was indistinguishable from its own absence.** The
      floor repairs a `preset` that is absent or not a string so the STORED row stays parseable;
      `brand-picker`'s fixture carried `preset: 'paper'`, which is byte-identical to
      `DEFAULT_PRESET`, so deleting or inverting the floor left every assertion green. The fixture
      now carries **no `preset` at all**, which turns the step's existing `preset === 'paper'`
      assertion into the floor under execution — while `mode: 'dark'` goes on discriminating
      merge-from-replace, so one fixture proves both halves [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **`brand-ownership` had no control that the forged POST ever reached the
      server** (standing rule 2). `forgeBrand` returns true because it FOUND the button and called
      `click()`, `networkidle` was swallowed with `.catch(() => {})`, and the assertion is negative —
      so a press that had not landed satisfied "the projects are byte-identical" for the wrong
      reason. Both actions have an observable server answer and the step now waits for it: the
      forged **Use your brand** reaches `useBrand`, whose site read returns no row through RLS, so
      the not-found page renders; the forged **Skip** redirects to `/sites`
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **The same defect, found in the review's own new step and in `brand-stale`
      beside it.** Both refuse and redirect back to `/sites/brand` — the path the press started on —
      so `waitForURL(pathname === '/sites/brand')` is already true when called and returns before
      the server has answered, and `s2cHeading` is on the old document too: the rows could be read
      BEFORE the action ran, which is a false "nothing was written" in the two steps that exist to
      rule exactly that out. One `pressAndLand` helper now waits on the action's own POST and both
      steps assert it. Raised against the patch this review had just written, and propagated to the
      step that already shipped with it [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] **The owner cannot see the one screen his Question 6 ruling changed.** His
      manual test goes Free-with-one (step 12, the naming caption), Pro-with-two (step 13, the
      chooser with room), mobile (14), then cleanup — so the DOWNGRADE state, Free while still
      holding two projects, is never rendered for him. `atLimitChoose` was the only sentence in the
      story with a live harness proof and no owner-test step, in the story whose Fix changed nothing
      else. New step 15 puts him back on Free **before** he deletes the spare project; cleanup is
      now 16 [this spec, `## Owner's manual test`]
- [x] [Review][Patch] **DW-71's owner-facing line contradicted its own title and reason.** Title:
      "three brand keys are stored for no reader". `plain:` "The other **four** (your site icon,
      your cover picture, your **title** and your description) are saved and nothing reads them" —
      but `title` names the created project, as the entry's own `reason:` says. The `plain:` line is
      the one the owner reads and it was the wrong one
      [_bmad-output/implementation-artifacts/deferred-work.md]
- [x] [Review][Patch] **`question_blocks` could still lose a question from the owner's inbox, from
      the other side.** Review 4 made a heading require a blank line above it; a `### Question 2`
      written directly under a paragraph or a list item is valid Markdown that renders as a heading
      and was then DROPPED, merging its question into the one above — the exact failure the check
      exists to prevent, for the second time in the opposite direction. Two layers. The blank-line
      guard is now asked only of the BARE shapes (`Question 1`, `**2.`), which are the ones wrapped
      prose can imitate; a `#` heading cannot be, so it never needed the guard. `demo()` case added
      [tools/story-board.py]
- [x] [Review][Patch] **The preamble pop was discarding exactly the shape R-83 exists to flag.** It
      removes a first block with no options and no ruling — which is the definition of a shapeless
      question, and the board's own fixture asserts those are real. Review 4 dismissed this for want
      of a signal that could tell a preamble from a question; **a question mark is that signal**, and
      spec 2.3's preamble carries none. Two layers re-raised it with the discriminator, which is
      what reopened it. `demo()` case added, and the mark is read off the block's whole text because
      a one-line block has its line in the title and an empty `ask` [tools/story-board.py]
- [x] [Review][Patch] **The Code Map's harness step list was out of emission order — the THIRD drift
      of one bullet** (omission at review 2, omission at review 4, order now): `brand-skip` four
      positions late and `brand-ownership` five early, in the bullet whose own words are "in the
      order the run emits them … derived from the source, never retyped". The docstring was right
      every time. Re-derived mechanically from the source, and the bullet now says outright that it
      is prose about the shape and the docstring is the list [this spec, Code Map]
- [x] [Review][Patch] `logoShot` is assigned inside `brand-logo`'s `try` and read after the
      `finally`, so anything that threw in between — a navigation timeout, DW-68's own hang —
      arrived undefined and died as a `TypeError` reported as the opaque `browser` step, hiding
      which assertion was even being made. A red `brand-logo` names itself
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] `brandPath` is the one definition of S2c's URL and `BRAND_FAILED` builds the
      failure URL by APPENDING `&failed=1` to it, so a "tidier" `/sites/brand/${siteId}` would
      silently produce one path segment with no flag, no sentence and nothing failing — the drift
      the extraction was made to prevent (standing rule 7). The coupling is recorded where the
      rename would happen. Also recorded: `useBrand`'s one failure branch that CANNOT redirect
      (`siteOf` refused, so there is no usable site id for `BRAND_FAILED`), because the comment
      beside it says every failure branch speaks [apps/web/lib/probe-rule.ts, sites/actions.ts]

- [x] [Review][Defer] **The 404 assertions are pinned to a framework string a tracked fix will
      change** — recorded as a `note:` on **DW-67** itself, where the change that closes it will be
      read [tools/probe/run-verify-ghost-admin.py `rendered()`]
- [x] [Review][Defer] **The two documents a fresh session reads first are each one unbroken wall of
      prose** — **DW-73**, because the fix is structural and touches a generator
      [_bmad-output/implementation-artifacts/epic-3-context.md, tools/doc-audit.py]

**Deferred, not patched.** The three 404 assertions (`brand-none`, `brand-ownership`, the `?site=`
forgery) recognise the not-found page by matching **Next's own default string**, and DW-67 in this
same diff commits to replacing it with a real `not-found.tsx` from `M9 404` — whose words will not be
those, so three steps go red for a reason unrelated to what they assert. Recorded as a `note:` on
DW-67 itself rather than fixed here, because the fix belongs in the change that closes it. And
`epic-3-context.md`'s Auto-brand bullet and the doc-audit harness row are each now a single unbroken
paragraph of many hundreds of words — the two files a fresh session reads first; real, and a
rewrite is not this story's.

**Dismissed, with the reason.** The concurrent double press is **DW-69** and its fix is still a
migration ("Ask First") — raised again by a layer that cannot see the ledger. `hasBrand` narrowing to
`Brand` while checking three of its keys is **DW-71**. The unbounded Ghost menu, and now the
unbounded card list — dismissed at review 3 for the reason that has not changed: a customer's own
data is not a payload. The chooser's focus resting on `:has()` — baseline in every browser this app
targets, and dismissed at review 4. `REAL_SERVICE` matching a bare `inflozo.com` in prose — the
marketing site genuinely IS that domain, `demo()` asserts it deliberately, and the real-infra layer
that re-executed the regex called it correct; narrowing it would fail the marketing-site case.
`brand-logo` asserting the `<img>`'s src rather than that the bytes load — the step exists to
discriminate the image branch from the monogram tile, which it does; asserting the pixels would test
Ghost's CDN. `ProjectThumb` being a hand-copy of `Placeholder`, and every thumbnail looking alike
while one preset ships — both already admitted in the components' own comments. "No route from the
chooser to a NEW project" — his Question 3 ruled that a second press re-brands rather than making
one. Sites connected before 3.4 carrying no `brand` key — `probeSite` is the same function on
connect, **Re-check plan** and 3.7's cron, so it backfills; and no customer pre-dates this story.
Three harness null-guards (`beforeRerun[0]`, `secondId`, `brand-stale`'s hidden field) — the states
that would trip them are excluded by construction at those points in the run.

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

**Fix, 2026-09-09 — the owner's two test findings, and the standing ruling they became (R-98).**
Neither finding is about this story's own behaviour, so **nothing in the frozen sections changes**:
S2c does what Intent and Boundaries say it does, with the same two forms, the same server actions
and the same words. What changed is that its controls now say they are working, and that the routes
around it draw their own shape while they load.

- **Finding 1 — a new shared control, and it is an old one moved.** `components/kit/submit.tsx`:
  `Submit`, a Kit button with a **required** `busy` label, and `useSubmitting()` for a control that
  is not a Kit button. Both are `account-menu.tsx`'s Sign out row lifted verbatim — the released
  in-flight ref, the click guard, `aria-disabled` over `disabled` — and that row now imports them
  rather than keeping its own copy. **The diagnosis is exactly one line:** a form in a **client**
  component reads its own `useActionState` pending and every one said something; a form in a
  **server** component has no hook to read and every one said nothing. Three files, seven controls,
  S2c's two among them. `Submit` is a client component *inside* each form, so `site-notices.tsx`
  and S2c stay server renders and both keep working with scripts off.
- **Finding 1, the link half.** The Sites card's brand offer was an `<a href>` — a document
  navigation, so the press left the page standing, unchanged, until the next one painted. It is a
  `next/link` now, which makes the press a soft navigation answered by the destination's skeleton,
  and prefetches the route on hover so there is usually nothing to wait for.
- **One control outside the three files, found by the check rather than by reading.** The ⋯ menu's
  **Duplicate** closed the menu at the press, which took the one place the click could be reported
  off the screen with it. The menu now closes when the action **lands** — the rule the two dialogs
  beside it already followed — and the item reads `Duplicating…` in between.
- **Finding 2 — three skeletons, and one that had drifted.** `sites/loading.tsx` (the site card:
  monogram, title, mono host, pills, state line — no image band), `sites/brand/loading.tsx` (S2c's
  760 split card) and `account/loading.tsx` (the stacked cards). `(authed)/loading.tsx` is the
  dashboard's alone now and matches today's project card, which had gained a badge row and a ⋯.
  The file had **predicted this in writing** — "the first sibling page that needs its own skeleton
  moves the dashboard and this file into their own route group" — and Sites arrived in Epic 3
  without it, which is why a `ponytail:` note in code is not a propagation (standing rule 3).
- **The check, because a rule with no check is the state that produced the findings.**
  `apps/web/busy.test.ts` walks the tree: every submit control must carry a busy label **in its own
  window**, and every route with a `page.tsx` must have a `loading.tsx` of its own or be recorded
  as an exception with its reason. Its subjects are derived from the directory tree, never listed.
  **Its own first version was wrong and the control caught it**: it asked whether the file
  contained a pending-ish word anywhere, and `restore/page.tsx` — whose Sign out button had no busy
  state whatever — passed on the word "deleting" three hundred lines away. Narrowed to a window at
  the control, it named `project-menu.tsx:237`, which is how Duplicate was found.
- **The durable half — his "ensure this is included in all future specs and stories".** Ruling
  **R-98** in `reconcile-designs-decisions.md` §A21, and from there into `docs/project-context.md`
  (the facts every BMAD run loads, so it reaches Create, Dev and Review of every later story),
  `EXPERIENCE.md` § State Patterns (the rule, and an **In flight** row in the partial-states table)
  and `DESIGN.md` (§ Loading tightened, § Busy added). The design export is **not** edited (R-74):
  the frames draw a button's resting state and are silent on its in-flight one, so this
  extrapolates rather than contradicts.

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

## Review 3 record — what was executed, and what each service answered (R-82)

Run 2026-09-08 against **CI's deployment of `57d635a3`** on `app.inflozo.com` — this review's own
patches, deployed (`rls` ✔ `check` ✔ `deploy` ✔, production `READY` on that sha through the Vercel
API by `VERCEL_TOKEN`) — with **T1** `ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com`
5.130.6, and the live Supabase project over PostgREST, GoTrue and the transaction pooler. Every key
named by its variable; no value printed or recorded.

| Command | Result |
|---|---|
| `pnpm check` | **exit 0.** **230 tests** in `apps/web` (229 + the new `style-pack` case), 1 in each of the three packages. `tokens.test.ts` still finds `style-pack.ts` the one place a colour literal lives |
| `pnpm build` | **exit 0**, `ƒ /app/sites/brand` still dynamic inside the `(authed)` guard |
| `node --test style-pack.test.ts` | **8 pass, 0 fail** — and its **negative control ran**: with `placeholderFor` reverted to reading `brand` off the parse, the new case **fails** (7 pass, 1 fail) and with the fix it passes. The bug and the test were each proved against the other |
| `python3 tools/doc-audit.py --check` (twice) | first pass regenerated and failed on it, second **PASS, 0 warnings** — the documented behaviour of the sub-tools |
| `bash supabase/tests/run-rls-gate.sh` | untouched: **no migration** in this review, and DW-69 says why the one it wanted is still not written |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **all steps passed** — `keys`, `browser-js`, `vault-off-rest`, `settings-keys` and `brand-keys` against both live Ghosts |
| `python3 tools/probe/run-verify-ghost-admin.py` | **63 steps, 0 failures, on the FIRST run**, every step in the docstring in order — which is the first run of this story where the docstring's order is the run's order. **0 navigation retries** (DW-68 did not manifest) |
| `git grep -n 'announcement_clear'` | `admin-rule.ts` and its test only. **No caller**; `ADMIN_WRITES` unchanged |

### What the deployed site answered on the review's own change

| Step | In the run's own words |
|---|---|
| `brand-screen` | The new assertion, live for the first time: *"The logo slot: the row's logo is **null**, so the LIVE branch is the **monogram tile carrying "G"** with **0** image(s) beside it = true"* — the tile carrying the first code point of the site's own Ghost title, read off the rendered page rather than assumed. §40's "logo is an empty string on both majors" is now a fact this run re-proves every time rather than one the reader trusted |
| `brand-atcap` | The caption still names the project (*"You're at your project limit, so we'll put your brand on “Ghost6”."*) and pressing left 1 project, the same row, name, slug and `linked_site_id` untouched. **This is the sentence Question 5 asks about** — it is correct about the project and stale about the cause |
| `brand-rerun` | On Pro with room the caption **asks** and names the site's project; the second press left **1** project |
| `brand-picker` | Two cards, two distinct wireframe colours `["rgb(217, 108, 63)", "rgb(255, 26, 117)"]`, pre-selected on the site's project |
| `brand-atcap-picker` | Downgraded to Free with 2 projects: the ticked card is "Ghost6" **and** it is the same card carrying "This site's project" — the Question 4 ruling, with its discriminating control still answering "a DIFFERENT row" for the pre-ruling rule |

### Controls, including the one that failed

- **THE ONE DEFECT WAS PROVED BOTH WAYS.** The new `style-pack.test.ts` case was executed against
  the **old** `placeholderFor` and **failed**, then against the new one and passed. A test that has
  not been seen to fail is not evidence, and this one has been.
- **A claim in the repository was executed and found false.** `browser-js` was documented in three
  places as catching both the redeclaration and the temporal-dead-zone shadowing. `node --check`
  exits **0** on a block-scoped `const` that shadows a module-level helper — valid syntax — so it
  catches one of the two. The file's own note beside the `same` helper had said so all along, and
  the three places that contradicted it are narrowed. Cite or execute, never assert.
- **`brand-screen`'s new assertion discriminates.** It is `imgs === 0 && some span reads "G"`, read
  with `allInnerTexts` off the rendered document — a page that drew the `<img>` branch, or drew no
  tile, fails it. It is asserted **by the row** (`row.title`'s first code point) and not against a
  constant, so it stays true for a site with a different title.
- **DW-68 did not manifest on this run** — 63 steps, 0 retries, green on the first attempt, where
  the real-infra layer needed four runs for one green earlier the same day. **No claim is made
  either way:** the cause is still unknown, the control that would settle it still cannot be driven
  (the harness cannot sign in against a preview URL), and one clean run is not evidence that a
  probabilistic hang is gone.
- **What was NOT executed, and is not claimed.** Connect's "no brand to offer" landing (AC 11's
  first half) is unreachable from here — both test Ghosts answer a brand, and a connect re-probes
  and rewrites the brand it just read, so the branch needs the probe itself to fail. The logo
  `<img>` branch is unit-proved only, because writing a logo to a test Ghost is an Admin write this
  story does not make. Both are recorded above under *What could not be verified*.

**Real services this review touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.

## Fix record 3 — the owner's Question 5 ruling, executed (R-82)

Run 2026-09-09 against CI's deployment of **`21cdf201`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔, production `READY` on that sha through the Vercel API by `VERCEL_TOKEN`), with **T1**
`ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6, and the live Supabase project
over PostgREST, GoTrue and the transaction pooler. Every key named by its variable; no value printed.

**63 steps, 0 failures** — on the **third** attempt; the two before it are recorded below rather than
discarded. `pnpm check` exit 0 with **230 tests**; `doc-audit --check` PASS twice; no migration, so
the RLS gate is untouched.

**The change is one string.** `BRAND_COPY.willBrand` went from *"You're at your project limit, **so**
we'll put your brand on “X”."* to two sentences that claim no relation between them. Nothing else
moved: the three captions are still three, `brandTarget` is untouched, and no harness step needed an
edit — `SAY` evaluates the app's own module, so the assertion followed the ruling by itself. That is
the whole reason the copy lives in `BRAND_COPY` and not in the page.

**`brand-atcap`, in the run's own words:** *"at the Free cap of 1 the caption NAMED the project it
would brand (**"You're at your project limit. We'll put your brand on “Ghost6”."**) = true, and no
longer promised a new one = true; pressing it left 1 project — the same row (true) with its name,
slug and `linked_site_id` untouched"*. `brand-rerun` beside it still reads the with-room sentence
that asks, and `brand-stale` still gets the true caption back after a refused press — so the ruling
changed the one caption it was about and no other.

### The two runs that failed first, and what they measured

Neither reached a brand step; both died in **Story 3.2's** part of the run, before anything this fix
touches.

| Run | Died at | Shape |
|---|---|---|
| 1 | `#s2b-admin-key-error` (the `malformed` step) | `locator.waitFor`, 30s, **0 navigation retries** |
| 2 | `#s2b-api-url-error` (the `not-a-url` step) | `locator.waitFor`, 30s, **0 navigation retries** |
| 3 | — | **63 PASS, 0 FAIL, 0 retries** |

**They are DW-68, and they sharpened it.** Both elements — and two of the three failures the review's
real-infra layer saw the day before (`text=Ghost said no`, `#s2b-admin-key-error`) — are inline field
errors rendered by the Kit's `Input` (`components/kit/input.tsx:105`) **from a server action's
result**. So what the harness is waiting for is a **POST to an authed route coming back**, not a
navigation, which is exactly why every one of them reports `0 navigation retries`: the retry wrapper
covers `goto`, `waitForURL` and `reload`, and none is involved. **DW-68 is amended with this**: the
entry's "sends no response" is right, but the thing failing to respond is at least as often a server
action as a document, and anyone reading Vercel's runtime logs for it should look for hung POST
invocations to `(authed)` routes. **No cause is claimed** and the control that would settle one still
cannot be driven. The mitigation was deliberately **not** widened again, for the reason Fix record 2
already gave: a `locator.waitFor` is an assertion nearly everywhere in this file, and retrying
assertions hides real failures.

**Real services this fix touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.

## Review 4 record — what was executed, and what each service answered (R-82)

Run 2026-09-09 against **CI's deployment of `533aa616`** on `app.inflozo.com` — this review's own
patches, deployed (`rls` ✔ `check` ✔ `deploy` ✔; the sha confirmed through the Vercel API by
`VERCEL_TOKEN` **before** any live assertion was trusted) — with **T1** `ghost6.inflozo.com` 6.58.0
and **T3** `ghost5.inflozo.com` 5.130.6, and the live Supabase project over PostgREST, GoTrue and the
transaction pooler. Every key named by its variable; no value printed or recorded.

| Command | Result |
|---|---|
| `pnpm check` | **exit 0.** **230 tests** in `apps/web`, 1 in each of the three packages. `tokens.test.ts` still finds `style-pack.ts` the one place a colour literal lives |
| `pnpm build` | **exit 0**, `ƒ /app/sites/brand` still dynamic inside the `(authed)` guard |
| `python3 tools/doc-audit.py --check` (twice) | first pass regenerated and failed on it, second **PASS, 0 warnings** — the documented behaviour of the sub-tools |
| `story-board.py demo()` | **passes**, including the five new cases this review added: three line-ending/whitespace shapes of the blank line before a question heading, and `REAL_SERVICE` asserted in **both** directions |
| `bash supabase/tests/run-rls-gate.sh` | untouched: `git diff` over `supabase/` since the baseline is **empty** — no migration in this story, and DW-69 says why the one it wanted is still not written |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **all steps passed** — `keys`, `browser-js`, `vault-off-rest`, `settings-keys` and `brand-keys` against both live Ghosts |
| `python3 tools/probe/run-verify-ghost-admin.py` | **65 steps, 0 failures**, every step in the docstring in order. **2 navigation retries** — a run that rode over two hangs and said so |
| `git grep -n 'announcement_clear' -- apps/ packages/ supabase/ tools/` | `admin-rule.ts:103` and its test only. **No caller**; `ADMIN_WRITES` unchanged |

### The three steps this review added, in the run's own words

| Step | What the deployed site answered |
|---|---|
| `brand-logo` | *"with an https: logo on the row S2c drew **1** image(s) `["https://ghost6.inflozo.com/content/images/size/w256h256/inflozo-review-4.png"]` and the monogram tile **not at all**"* — the `<img>` branch, rendered for the first time in this story's life. The row was patched **through the service role** and put back in a `finally`; **no Ghost was written** |
| `brand-failed-line` | *"S2c asked for with &failed=1 printed "We couldn’t save that just now. Try again in a moment." = true, and the same screen without the flag did not = true"* — the matrix's "insert fails → the page says so", asserted **both ways** |
| `brand-picker` (widened) | *"**THE PACK WAS MERGED AND NOT REPLACED**: the fixture's own `mode` came back as "dark" beside preset "paper""* — the action's "a pack E6 has since written survives untouched" under execution rather than in a comment |

### Controls, including the ones that failed

- **THE DOCSTRING ORDER WAS DERIVED, NOT READ.** The claim that failed two reviews running is now
  checked by machine: the run's own 65 emitted step names were parsed out of the log and compared
  with the docstring's, **in order** — 57 single-name bullets match exactly, and the remaining eight
  (`axe-sites · axe-sheet · axe-connect · axe-keys`, `vault-off-rest`, `no-secret-leak`,
  `injection-live`, `pro-connect-t3`) are named in grouped bullets, checked by membership. Review 3
  asserted this order and was wrong about `brand-picker`/`axe-brand-picker`; this states it because
  it ran.
- **TWO RUNS FAILED BEFORE THE GREEN ONE AND NEITHER WAS THIS STORY.** The first died at
  **`#s2b-api-url-hint`** — `waitForSelector`, 30s, **0 navigation retries** — which is **Story 3.2's**
  part of the run, before any brand step, and is exactly the shape Fix record 3 recorded for its own
  two failures (`#s2b-admin-key-error`, `#s2b-api-url-error`): an inline field element rendered from a
  **server action's result**, so what is hanging is a POST coming back and not a navigation, which is
  why the retry wrapper reports zero. **DW-68, unchanged, and no cause is claimed.**
- **ONE FAILURE WAS THE REVIEWER'S OWN TOOLING AND IS RECORDED RATHER THAN QUIETLY RE-RUN.** An
  earlier attempt reported `could not create the fixture user: HTTP 422` and a leaked user. The cause
  was **two harness runs racing** — a detached poller of mine had started a second run — not a defect
  in the story. The harness's own startup sweep cleared the stale `ghost-admin-harness-*` account on
  the next run (*"swept 1 stale … user(s) an earlier run left behind"*), and the green run's user
  count returned to where it started.
- **`brand-logo` discriminates.** It is `srcs.length === 1 && srcs[0] === LOGO && tile === false`, read
  off the rendered document: a page that drew the monogram as well, or drew no image, or drew a
  different src, fails it. Its negative control is every other run of `brand-screen`, which asserts
  the **opposite** branch (0 images, the tile carrying the title's first code point) on the same
  screen minutes earlier — the two steps prove each other.
- **`brand-failed-line` discriminates.** It asserts the sentence present with the flag **and absent
  without it**, in the same step, so a screen that printed the failure line unconditionally fails it.
- **The merge proof discriminates.** `mode: 'dark'` is a key `defaultStylePack()` does not carry, so
  a `useBrand` that replaced the column would return `mode: undefined` and fail. Before this the
  fixture's pack was byte-identical to the default and no assertion in the repository could tell the
  two apart.
- **What was NOT executed, and is not claimed.** Unchanged from review 3 and stated again rather than
  dropped: connect's "no brand to offer" landing (AC 11's first half) is unreachable from here,
  because both test Ghosts answer a brand and a connect re-probes and rewrites the brand it just
  read. The preset-floor patch (`{ ...held, preset: DEFAULT_PRESET }` where the held preset is not a
  string) is proved by reasoning and `tsc`, not by execution: reaching it needs a project row whose
  `style_pack.preset` is already the wrong type, which nothing in the harness writes and which only
  the customer's own session could create.

**Real services this review touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.

## Fix record 4 — the owner's Question 6 ruling, executed (R-82)

Run 2026-09-09 against CI's deployment of **`8dab7947`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔; the sha confirmed through the Vercel API by `VERCEL_TOKEN` before any live assertion was
trusted), with **T1** `ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6, and the
live Supabase project over PostgREST, GoTrue and the transaction pooler. Every key named by its
variable; no value printed.

**65 steps, 0 failures — on the FIRST run**, 1 navigation retry. `pnpm check` exit 0 with **230
tests**; `pnpm build` exit 0 with `ƒ /app/sites/brand` still dynamic; `doc-audit --check` PASS twice;
no migration, so the RLS gate is untouched.

**The change is one sentence and one branch.** `BRAND_COPY.atLimitChoose` is new and the caption
branch gained a `choosing` arm inside its `capped` arm. `brandTarget`, the cards, the pre-selection,
the hidden decision field and everything `useBrand` writes are **untouched**, and `BRAND_COPY.willBrand`
is untouched — it still runs at the cap with a single project, which is every Free customer, because
there the caption is the only thing on the screen that can say which row wears the brand.

### The two sentences, live, in the same run

| Step | In the run's own words |
|---|---|
| `brand-atcap-picker` | *"THE CAPTION HANDS THE CHOICE OVER rather than pre-answering it (his Question 6, option 1): it printed **"You're at your project limit, so no new project — pick the one to wear your brand."** = true, and the sentence that NAMES a project — the one this screen printed before the ruling — **is gone** = true"* — with the Question 4 ruling still holding beside it: the ticked card is "Ghost6", the same card carrying "This site's project", where the pre-ruling rule *"would have ticked … a DIFFERENT row"* |
| `brand-atcap` | *"at the Free cap of 1 the caption NAMED the project it would brand (**"You're at your project limit. We'll put your brand on “Ghost6”."**) = true"* — the sentence the step above refuses, proved **alive** in the same run at the cap with one project |

### Controls, including the one that failed

- **THE UNIT ASSERTIONS WERE PROVED BOTH WAYS.** `BRAND_COPY.atLimitChoose` was pointed at the
  pre-ruling naming sentence and `node --test probe-rule.test.ts` **failed** — 23 pass, 1 fail, on
  *"it names no project — the cards do"* — then restored and passed 24, 0. A test that has not been
  seen to fail is not evidence, and this one has been.
- **THE LIVE STEP DISCRIMINATES IN BOTH DIRECTIONS IN ONE ASSERTION.** `brand-atcap-picker` is
  `cappedCaption && !oldCaption`: a screen that printed the ruled sentence **and** the naming one —
  the shape a half-applied ruling would produce — fails it. Asserting only the new sentence would
  have passed on exactly that page.
- **THE PAIR IS THE CONTROL.** `brand-atcap` and `brand-atcap-picker` assert opposite things about
  the same sentence in the same run, so neither can be satisfied by the caption simply disappearing:
  one requires it present, the other requires it absent, and they differ only in whether cards are
  drawn.
- **The two caption names review 2 deleted stayed deleted.** `atLimitPick` and `willRebrand` are
  still asserted absent from `BRAND_COPY` (standing rule 7, grepped across the repository). The new
  key is deliberately **not** called `atLimitPick`: that one named no project on a screen that drew
  **no cards**, so nothing on it said which project would be branded and no step or criterion ever
  reached it. This one names no project **because the cards do**, and it is reached by a step and by
  two criteria. The test's comment now records that the reason for the old deletion no longer holds.
- **What was NOT executed, and is not claimed.** Unchanged from review 4 and stated again rather than
  dropped: connect's "no brand to offer" landing (AC 11's first half) is unreachable from here, and
  the preset-floor patch is proved by reasoning and `tsc` rather than by execution.

**Real services this fix touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.

## Review 5 record — what was executed, and what each service answered (R-82)

Node 24 on `PATH`. Every key read by variable name; no value printed, and no value appears in this
record.

**The deployment was identified before anything live was trusted.** `GET api.vercel.com/v6/deployments`
and `/v4/aliases` (`VERCEL_TOKEN`) → `app.inflozo.com`, `inflozo.com` and `www.inflozo.com` all alias
one deployment whose `githubCommitSha` is **`b4703219`** — the commit under review. This review's own
patches are a comment, one `console.error` and harness/tooling changes, so the deployed build is
**behaviourally identical** to the patched tree and every live assertion below is about the code in
this diff.

| Command | Result |
|---|---|
| `pnpm check` (`eslint .`, `tsc --noEmit`, `node --test '*.test.ts'`) | **exit 0**, every suite green |
| `python3 tools/doc-audit.py --check` ×2 | first regenerated `INDEX.md`/`INDEX.html`/`STORY-BOARD.html` (its sub-tools regenerate on failure), second **PASS, 0 warnings** |
| `python3 tools/story-board.py --check` | `story board: current` — `demo()` green, including the four cases this review added |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | all steps passed, **`browser-js` PASS** (the embedded Playwright script parses with this review's edits) |
| `python3 tools/probe/run-verify-ghost-admin.py` | **66 steps, 0 FAIL, exit 0** against T1 `GHOST6_*`, T3 `GHOST5_*` and the deployed `app.inflozo.com` |

### The three steps this review added or strengthened, in the run's own words

- **`brand-forged-project`** (new) — "a press carrying a project_id no project of this caller's
  carries (`00000000-…-dead`) wrote NOTHING and came back to S2c: still 1 project, still "Ghost6",
  true caption, and the POST was seen to answer before the rows were re-read". This is the `!picked`
  clause, executed for the first time at any level, and the project count is the paywall's proof too.
- **`brand-failed-line`** (strengthened) — "AND A REAL BRANCH NOW DRIVES IT: a press whose
  `project_id` input was REMOVED (`decision_missing`, not the blank value `brand-stale` posts)
  landed back on `/sites/brand` carrying `failed=1` (true) and printing the sentence (true)."
- **`brand-picker`** (strengthened) — "AND THE PRESET FLOOR TOO: the fixture was inserted with NO
  preset, so a stored "paper" is review 4's repair running, not the fixture's own value being echoed
  back", beside the `mode: "dark"` that goes on proving the merge.
- **`brand-ownership`** and **`brand-stale`** (controls added) — "EACH POST WAS SEEN TO LAND before
  the rows were re-read", and "the action's POST was seen to answer first = true, because a re-read
  that raced the press would report 'nothing written' for the wrong reason".

### Controls, including the one that failed

- **The run that failed, and why it is recorded.** The **second** of three full runs failed at
  `browser`: `locator.waitFor: Timeout 30000ms exceeded` waiting for S2c's heading at the
  connect landing — **22 steps in, upstream of every step this review touched** (`pressAndLand` is
  declared 350 lines below it and nothing there references it). Before re-running, the ground was
  checked rather than assumed: `dig +short @1.1.1.1` resolved `app.inflozo.com` and
  `ghost6.inflozo.com`, and `curl` got the expected 307 to `/sign-in`. The third run was green at 66
  steps. It is DW-68's documented hang on that navigation, and it is written down rather than
  quietly re-run.
- **Both `story-board.py` fixes discriminate, executed in both directions.** Restoring review 4's
  rule (a blank line demanded of *every* heading) → `SELF-CHECK FAILED — a heading with no blank line
  above it was swallowed`. Removing the question-mark signal from the preamble pop → `SELF-CHECK
  FAILED — a shapeless question was dropped as a preamble`. Restored, `story board: current` both
  times. These are the fixes whose first versions were invisible precisely because nothing executed
  the comparison.
- **`brand-forged-project` discriminates as a pair with `brand-picker`**, in the same run and against
  the same action: a **valid** chosen project id writes the brand onto that row (`brand-picker`), and
  an id the caller does not carry writes nothing (`brand-forged-project`). One step alone asserting
  an absence would prove nothing; the two together say the guard is what makes the difference.
- **No key was printed and none leaked.** `no-secret-leak` scanned every response body this run
  produced for the keys it typed and found none.
- **Ghost was written by nothing this story owns.** The only Ghost write in the run is 3.3's
  `injection-live`, signed with the staff tokens and restored to `null` on both servers.
  `git grep announcement_clear` → `admin-rule.ts` and its test only, still no caller.

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

### Question 4 — at your project limit, with several projects, which card should already be ticked?

This one only happens on **Pro**, and only when you have filled it: 25 projects, all of them used,
and you press "use this site's brand" on a site whose project already exists. Inflozo shows you a
card for each project and ticks one of them for you before you choose.

Two things you have already ruled point at **different cards**, and I did not want to pick for you.

For example: you have 25 projects. One of them, "Ghost6", is the project for `ghost6.inflozo.com` —
you made it months ago and have not touched it since. Yesterday you were working on "Field Notes",
which has nothing to do with that site. You press the brand link on the Ghost6 card today. Which
card should already be ticked when the screen opens?

Nothing is broken either way — every card is there and you can tick whichever you like before
pressing. This is only about which one is ticked **for** you if you press without looking.

**Ruled: option 1** (owner, 2026-09-08). The project that belongs to the site is the one already
ticked, so the tick and the "This site's project" label sit on the same card. `brandTarget` now
prefers the project linked to this site on **both** sides of the cap, and falls back to the most
recently updated one only when this site has no project at all — which is the only branch where
Question 1 still decides. Executed on the live site as **`brand-atcap-picker`**.

1. **"Ghost6" — the project that belongs to this site. (RECOMMENDED)** It is the card already
   labelled "This site's project", so the tick and the label sit together and the screen reads as
   one sentence. It is also what your Question 3 ruling asked for in your own words — "the project
   this site is already on **pre-selected**" — and it means pressing without looking refreshes the
   colour on the site's own project, which is what the button appears to offer.
2. **"Field Notes" — the project you worked on most recently.** *This is what was built before the
   ruling.* It is your Question 1 ruling applied exactly as written: at the limit, the brand goes
   onto the most recently updated project. The cost is that the ticked card and the card marked
   "This site's project" can be two different cards, which looks like a mistake even though it is
   not.
3. **Nothing is ticked — you must pick a card before the button works.** No default can ever be
   wrong. But it turns one press into two for everybody who reaches this screen, and it is the one
   shape that does not work the same way as every other screen in the app.


### Question 5 — one sentence on the screen now gives a reason that is no longer true

This is about **wording only**. Nothing is broken, nothing is chosen differently, and no project
moves whichever way you rule. It needs you because your own manual test (step 12) quotes the
sentence word for word, so changing it changes your test script.

When you press **Use your brand** on a site whose project already exists, and you are at your project
limit, the caption under the button says:

> You're at your project limit, so we'll put your brand on "Ghost6".

That sentence was written before your **Question 4** ruling. Back then the limit really was the
reason: at the limit Inflozo took the most recently updated project. After your ruling, the project
that belongs to the site wins **whether or not** you are at the limit — so Inflozo would have chosen
"Ghost6" with room to spare too. The limit is no longer why.

For example: you are on Free, which includes one project. You connected `ghost6.inflozo.com` last
month and pressed the button, so you have a project called "Ghost6". Today you change your accent
colour in Ghost and press the brand link again. The screen tells you that you are at your limit, as
if that were the reason it is not making you something new — when in fact it would have refreshed
"Ghost6" either way.

Two facts are worth saying on that screen, and the options differ in which they keep: **which project
gets the brand**, and **that you cannot have another one right now**.

**Ruled: option 1** (owner, 2026-09-09). The caption is two short sentences — *"You're at your
project limit. We'll put your brand on “Ghost6”."* — so the screen still tells someone at the cap
why no new project appears, and no longer claims the limit is the reason it chose that project.
`BRAND_COPY.willBrand` is the change and it is the whole change: the captions are still three, the
choice `brandTarget` makes is untouched, and his manual test step 12 now quotes the new sentence.
Executed on the live site as `brand-atcap`, which reads the app's own copy rather than a retyped
one, so the step needed no edit to follow the ruling.

1. **Keep the limit, drop the false cause — two short sentences: "You're at your project limit. We'll
   put your brand on "Ghost6"." (RECOMMENDED)** You still learn both things, and nothing on the
   screen claims a reason that is not there. It is the smallest change from what you have already
   read and tested.
2. **Say only which project: "We'll put your brand on "Ghost6", the project for this site."** The
   shortest and the truest, and it matches the sentence used when you have room. The cost is that
   someone at the limit who expected a brand-new project is not told why they did not get one.
3. **Use the same sentence you get with room: "You already put your brand on "Ghost6". Apply it
   again?"** One caption fewer in the product, and the screen asks rather than tells everywhere. Same
   cost as option 2, plus you would no longer be told about the limit anywhere on this screen.


### Question 6 — one screen tells you the answer and then asks you the question

This is **wording only** again, and it affects **one rare screen**: the one you see if you were on
Pro with two projects and then went back to Free. Nothing is broken and no project moves whichever
way you rule. It needs you because your **Question 3** ruling and your **Question 5** ruling both
land on this one screen and they point different ways.

**What you see today.** You had two projects on Pro. You go back to Free, which includes one. You
open **Use your brand** for your site. The screen says:

> You're at your project limit. We'll put your brand on "Ghost6".

…and directly underneath it draws **two cards**, one per project, with "Ghost6" already ticked, under
the heading **Which project?**

So the sentence announces the answer, and then the cards ask you the question. Both are yours: the
sentence is your Question 5 ruling, the cards are your Question 3 ruling. Neither is wrong on its
own; together they read as though the screen has stopped listening.

**Your options:**

1. **Say both in one sentence, then show the cards.** The caption becomes *"You're at your project
   limit, so no new project — pick the one to wear your brand."* You still learn about the limit, and
   the sentence hands the choice to the cards instead of pre-answering it. One new sentence, used
   only on this screen. **(RECOMMENDED)**
2. **Use the asking sentence you already get with room:** *"You already put your brand on "Ghost6".
   Apply it again?"* No new wording at all — this sentence already exists in the product. The cost is
   that this is the one screen where the limit is never mentioned, so someone who expected a new
   project is not told why they did not get one.
3. **Leave it exactly as it is.** Nothing to build, nothing to test again, and the ticked card does
   tell you the same thing the sentence does. The cost is the one you can see above: the screen
   answers and then asks.

**Ruled: option 1** (owner, 2026-09-09). The caption becomes *"You're at your project limit, so no
new project — pick the one to wear your brand."* — one new sentence, used only on this screen. You
still learn about the limit, and the sentence hands the choice to the cards instead of pre-answering
it. `BRAND_COPY.willBrand` is untouched and still runs at the cap with a single project, which is
every Free customer; `brandTarget`, the cards and what is written are all untouched. Executed as
`brand-atcap-picker`, which now asserts the ruled sentence **and** that the naming one is gone from
that screen.


## Owner's manual test

On the live site after the Deploy run. **The new screen appears when a site is connected**, so you
need a site that is not connected yet, and you will need a menu and an accent colour set on it.

1. **Before you start:** both test servers were on https://app.inflozo.com/sites, so
   `ghost6.inflozo.com`'s record was cleared for you (one line, your data, 2026-09-09) — it is a
   disconnect, not a delete, so nothing about it was lost. **`ghost6.inflozo.com` is your test site**
   for every step below; `ghost5.inflozo.com` was not touched.
2. **URL:** https://ghost6.inflozo.com/ghost/#/settings/design/brand · **Screen:** Ghost Admin,
   Brand · **Do:** set **Accent color** to `#D96C3F` and Save · **See:** Ghost confirms it saved.
3. **URL:** https://ghost6.inflozo.com/ghost/#/settings/navigation · **Do:** make sure there are
   a few menu items — add `Essays`, `Notes`, `Archive` if it is empty — and Save.
4. **URL:** https://ghost6.inflozo.com/ghost/#/settings/integrations · **Do:** Add custom
   integration → name it `Inflozo owner test` → Save · **See:** an API URL, an Admin API key and a
   Content API key. Keep this tab open.
5. **URL:** https://app.inflozo.com/sites · **Do:** **Connect site** → **Done — next** → type
   `ghost6.inflozo.com` and paste its two keys → **Connect** · **See:** instead of the Sites list, a
   new full screen: **"Nice site. Want to keep the vibe?"** and under it *"We pulled these from
   ghost6.inflozo.com — your call."*
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
    the "use this site's brand" link on the card again · **See:** the line under **Use your brand**
    no longer promises a new project. On the **Free** plan, which includes **one** project, you have
    just used it, so the line tells you both things in two short sentences — *"You're at your
    project limit. We'll put your brand on “Ghost6”."* — which is **your Question 5 ruling**
    (option 1, 2026-09-09): it used to say the limit was the *reason*, and after your Question 4
    ruling it is not. Because you have one project there are **no cards to choose from** — that is
    your B1. **Do:** press **Use your brand** · **See:** the Sites page, and the
    card still reads **1 project** — **not 2**.
13. **Now the chooser, with something to choose. This step needs the Pro plan**, because Free
    includes one project and a chooser needs two — there is no billing to go through and nothing to
    pay. **Do:** tell me when you are at this step and I will switch your account to Pro for the
    test and back again afterwards (one line, your data, on your say-so). Then: **URL:**
    https://app.inflozo.com/ · **Do:** make a second project (**New project**), call it anything ·
    **Do:** go back to https://app.inflozo.com/sites and press the brand link again · **See:** this
    time the screen **asks** — *"You already put your brand on “Ghost6”. Apply it again?"* — and
    under it *"Which project?"* with **one card per project**: each with a small wireframe drawing
    **painted in that project's own colours**, its name beside it, and the card for this site's
    project **already selected** and outlined in coral. The site's project wears **your orange**;
    the new one wears the default. **Do:** click the other card, then **Use your brand** · **See:**
    the Sites page. **Do:** open https://app.inflozo.com/ · **See:** the project you picked is now
    the one wearing your orange, and the other one kept its own. Nothing was renamed, and there are
    still **2 projects**.
14. **Do:** on your phone, open the brand screen once more · **See:** the cards stack, the drawings
    stay legible, and you can tap one.
15. **The one screen your Question 6 ruling changed — and it is the last thing to look at before
    cleanup.** It only appears if you are back on **Free** while **still holding the two projects**,
    which is what happens to anyone who downgrades. **Do:** tell me you are at step 15 and I will put
    you back on Free **before** you delete the spare project. Then: **URL:**
    https://app.inflozo.com/sites · **Do:** press the brand link on the site's card · **See:** the
    line above the cards now reads *"You're at your project limit, so no new project — pick the one
    to wear your brand."* — it tells you about the limit and then **hands you the choice**, instead
    of naming a project the way step 12 did. That is **your Question 6 ruling** (option 1,
    2026-09-09). Both cards are still there with one already ticked, and pressing **Use your brand**
    still puts the brand on the ticked one and makes **no** new project — the count stays **2**.
16. **Cleanup:** nothing to undo on Ghost — this story wrote nothing to your site. Delete the
    `Inflozo owner test` integration if you want to, and the spare project you made in step 13. Your
    account is already back on Free from step 15.

**What you cannot test yet, and why.** Your Ghost announcement bar is **not** copied into Inflozo and
Inflozo does **not** offer to switch it off — that is Question 2 above. Both settings are already
saved on your site's record, so nothing is lost; the screen for them arrives with the page editor.

### Your re-test, 2026-09-09 — the two things you found

Your findings are fixed. **Steps 1 to 16 above still hold and you do not need to walk them again**;
these five are the new ones. They are quick, and on a fast connection the first two are quick to the
point of being hard to catch — that is the fix working, and each step says what to do if it goes by
too fast to see.

17. **The button says what it is doing.** **URL:** https://app.inflozo.com/sites · **Do:** press the
    **use this site's brand** link on your site's card, then on the screen that opens press
    **Skip** and watch the button you pressed · **See:** for the moment before the page changes it
    reads **Skipping…** instead of **Skip**, and pressing it again does nothing. Press **Use your
    brand** the same way and it reads **Taking your brand…**. *If it is too fast to see:* it is
    proved on the live site by the run below (step `busy-label`), which holds the request open on
    purpose and reads the button while it waits. **Every button in the app now does this** — Connect,
    Create project, Delete, Send link, Got it, Re-check plan, Sign out and the rest.
18. **The ⋯ menu's Duplicate.** **URL:** https://app.inflozo.com/ · **Do:** press the **⋯** on a
    project card and press **Duplicate** · **See:** the menu **stays open** and the item reads
    **Duplicating…**, then the menu closes by itself and the new card is there. It used to shut
    instantly and leave you with nothing to look at.
19. **The loading shimmer matches the cards.** **Do:** press **Sites** in the left menu · **See:**
    for a moment, grey cards shaped like **site** cards — a square tile with two lines beside it,
    two small pills, and a line at the bottom — and **not** the big picture box the project cards
    have. Then press **Projects** · **See:** the shimmer there has the picture box, because that is
    what a project card has. *If it is too fast to see:* the same run proves it (step
    `skeleton-shape`), and it fails if the wrong one is drawn.
20. **The Account page too** — it was showing project cards while it loaded, which you did not
    report but is the same fault. **Do:** press **Account** in the menu under your name · **See:**
    a shimmer of stacked wide cards, not a grid of three.
21. **Nothing else moved.** **Do:** anything from steps 5 to 13 above that you want to spot-check ·
    **See:** the same screens, the same words, the same buttons. This fix changed how the controls
    behave while they work and what the pages draw while they load. **It changed nothing about what
    any of them do.**

## Verification

To be run at Dev and again at Review, on the real infrastructure (R-82), Node 24 on `PATH`
(`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`). Every key is named by its
variable; no value is printed.

**Deploy (2026-09-09).** App code only — no migration, so nothing else to deploy. The push of
`3a82bed5` (the fifth review, already green above) built on CI (`VERCEL_TOKEN`, `VERCEL_PROJECT`,
`VERCEL_TEAM_ID`): GitHub Actions run `34302152793` **completed / success**
(`GITHUB_TOKEN`, `actions/runs?head_sha=3a82bed5…`), and the production deployment
`dpl_3bzGvgQHjtvntKeAr8TmbTQT411j` is **READY**, `target: production`, `meta.githubCommitSha` equal
to `3a82bed56c4db0d5770a84f0e98a12c4c1acd055`, aliased to `app.inflozo.com` (and `inflozo.com`,
`www.inflozo.com`) — confirmed through the Vercel API before anything below is trusted, the same
control the reviews above already used.

**Deployment:** https://app.inflozo.com (`dpl_3bzGvgQHjtvntKeAr8TmbTQT411j`)

**Test-environment prep (2026-09-09), mislabeled and corrected.** `ghost6.inflozo.com`'s site record
was disconnected (soft; FR-C6, nothing lost) and the manual test steps below were pointed at it by
name, so the owner had one un-connected test server to walk step 5 with — no code changed. That
commit's subject said `Story 3.4 - Test - …`, which build-sequence.md's Record prompt reserves for
the owner's own reported result (the one path that sets `owner_test: issues` in the same commit) —
`owner_test` here stayed `pending`, so the board's `NEXT_AFTER['Test'] = 'Fix'` read it as a finding
that was never filed and offered "Fix your findings" with nothing to fix. Not rewritten (a pushed
commit is never amended); this commit's own phase word is `Deploy` — continued deploy-adjacent prep,
which is what it actually was — so the trail reads `Test` (awaiting the owner) again. **`tools/hooks/commit-msg`
now blocks a `Test`-phase commit whose spec does not read `owner_test: issues`**, so this specific
mistake cannot recur.

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
  `brand-none` and `axe-brand`, plus the first review's two — **`brand-rerun`** (the offer pressed
  a second time on Pro, where there is room: one project before and one after) and
  **`brand-ownership`** (a second account's real site id forged into S2c's own two forms) — the
  Fix's **`brand-picker`** (the chooser: a card per project, each in its own colours, and the one
  chosen is the one written) and **the second review's three**: **`brand-stale`** (an empty
  decision posted at the cap writes nothing — the paywall's own half of `useBrand`'s guard, and
  the matrix's "cap changed under the page"), **`brand-picker-js-off`** (the chooser read off a
  fresh server document, real radios inside the posting form) and **`axe-brand-picker`** (axe with
  the cards drawn) — **the fourth review's two**: **`brand-logo`** (the `<img>` half of the logo
  slot, which no run had ever drawn, off a fixture row patched through the service role and put back
  in a `finally` — no Ghost is written) and **`brand-failed-line`** (the `&failed=1` sentence
  printed with the flag and absent without it) — and the ruling's own **`brand-atcap-picker`** (downgraded to Free with two
  projects: at the cap AND with a choice, the ticked card is the project for this site). Axe reports zero violations at 1440 and 390 on both S2c states. **This story
  writes to no Ghost** — the only step that ever did, `injection-live`, is 3.3's and is unchanged
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

## Fix record — the owner's Question 3 ruling, executed (R-82)

Run 2026-09-08 against CI's deployment of **`1bf541bd`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔), T1 and T3 as above. **59 steps, 0 failures** — the review's 58 plus **`brand-picker`**.
**1 navigation retry** (DW-68), reported rather than smoothed away.

`pnpm check` exit 0 with **229 tests**; `pnpm build` exit 0 with `ƒ /app/sites/brand` still dynamic
inside the guard; `doc-audit --check` PASS twice; no migration, so the RLS gate is untouched.

**`brand-picker`, in the run's own words.** With two projects the second press **asked** — *"You
already put your brand on “Ghost6”. Apply it again?"* and *"Which project?"* — and drew **2 cards**,
pre-selected on the project this site is already on. The two wireframes computed to
`["rgb(217, 108, 63)", "rgb(255, 26, 117)"]`: **the site's accent on the branded card and the default
on the fresh one, two distinct colours**, so the drawings really do tell the projects apart. That is
the assertion that matters for the owner's ask, and it is read off the rendered page with
`getComputedStyle`, not off a class name. Choosing **"Field Notes"** put the brand on **that** row
and changed nothing else about it — name, slug and a null `linked_site_id` intact — while "Ghost6"
kept its own binding to the site. **Still 2 projects: a chooser, never a factory.**

The step also asserts the two drawings are **`new Set(thumbs).size === 2`**, which is the control
that matters here: a chooser whose pictures all matched would be telling the customer nothing, and
that is precisely the failure FR-B1 warns about ("a wrong thumbnail is worse than none"). Today the
colours differ because one project wears the site's accent and the other Paper's; when E6 gives
projects genuinely different Style Packs the same drawing gets more informative on its own, with no
further work — `placeholder.tsx`'s own note says packs look alike until then.

`brand-rerun` still passes beside it with **one** project and **no cards drawn** — the owner's B1,
executed: a chooser with a single option is a step and not a choice.

## Review 2 record — what was executed, and what each service answered (R-82)

Run 2026-09-08 against **CI's deployment of `46d1553c`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔ — confirmed through the Vercel API by `VERCEL_TOKEN`, production `READY` on that sha),
with **T1** `ghost6.inflozo.com` 6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6, and the live
Supabase project over PostgREST, GoTrue and the transaction pooler. Every key named by its variable;
no value printed or recorded.

| Command | Result |
|---|---|
| `pnpm check` | **exit 0.** 229 tests in `apps/web`, 1 in each of the three packages. `tokens.test.ts` still finds `style-pack.ts` the one place a colour literal lives |
| `pnpm build` | **exit 0**, `ƒ /app/sites/brand` still dynamic inside the `(authed)` guard |
| `python3 tools/doc-audit.py --check` (twice) | first run regenerated `STORY-BOARD.html` and failed on it, second **PASS, 0 warnings** — the documented behaviour of the sub-tools, not a fault |
| `bash supabase/tests/run-rls-gate.sh` | untouched: **no migration** in this review, and DW-69 says why the one it wanted was not written |
| `python3 tools/probe/run-verify-ghost-admin.py --check` | **all steps passed**, `browser-js` included — it caught nothing this time, which is what a green parse gate looks like |
| `python3 tools/probe/run-verify-ghost-admin.py` | **62 steps, 0 failures**, every step in the docstring in order — the Fix's 59 plus **`brand-stale`**, **`brand-picker-js-off`** and **`axe-brand-picker`**. **1 navigation retry** (DW-68), reported |
| Ghost `GET /admin/settings/` on T1 and T3 | re-executed independently of the harness with `GHOST6_ADMIN_API_KEY` / `GHOST5_ADMIN_API_KEY`, integration key alone: **200 / 200**, all seven brand keys present, `navigation` a **JSON string on both majors** — byte-for-byte MEASUREMENTS §40. **Negative control:** the same call with the key's secret half zeroed → **401 Unauthorized**, so the 200s prove authentication and not a cached route |
| The boundary, executed against the app's own modules | `placeholderFor({brand:{accent:'#FF1A75'}})` → `#FF1A75`; **negative control** `accent:'red;background:url(x)'` → Paper's `#D96C3F`, the injection never reaching the inline `style`; `preset:'__proto__'` → `#D96C3F`; `imageUrl('data:image/svg+xml,…')` and `imageUrl('javascript:…')` → `null`; `navOf('{{{')` → `[]` |
| `git grep -n 'announcement_clear'` | `admin-rule.ts` and its test only. **No caller**; `ADMIN_WRITES` unchanged |

### The three steps this review added, in the run's own words

| Step | What the deployed site answered |
|---|---|
| `brand-stale` | At the Free cap, a press carrying an **empty decision** — the body S2c itself emits before any project exists, and what a second tab that filled the cap leaves behind — wrote **nothing**: 1 project, the same row, and the browser back on S2c with the **true** caption naming it. The paywall's own half of `useBrand`'s guard, executed for the first time; every other step presses a real button and so posts a real project id |
| `brand-picker-js-off` | The chooser in the document a scripts-off browser is served: **2 real `<input type="radio" name="project_id">`, one per card, inside the `method=post` form** carrying the hidden `site_id` and the submit button, exactly **1** pre-checked and **0** leftover hidden decision fields. AC 8 had been recorded against the one S2c state that has no chooser |
| `axe-brand-picker` | **Zero violations** at WCAG 2.1 AA, 1440 and 390, with the cards drawn; no horizontal scroll. `axe-brand` runs before any project exists, so the radio cards had never been looked at |

Two pre-existing steps changed their answer, and both are the patches landing: `brand-rerun` now
reads the caption that **asks** ("You already put your brand on “Ghost6”. Apply it again?") where it
used to read one that told, and `brand-atcap` still reads the sentence that **names** the project —
which is now the only caption that mentions the limit.

### Controls, including the one that failed

- **`brand-ownership` failed on run 1 and the failure was the harness's own.** The step compares two
  reads of the caller's projects and compared them **in PostgREST's order**, so a list that came
  back in a different order failed an assertion whose subject is the rows. Nothing had written:
  `linkedToForeign` was 0 and the count was unchanged on the same run. Two things changed rather
  than one — `projectsOf` gained the `id` tiebreak the app's three readers were given this review
  (standing rule 7: the propagation list missed the harness's own reader), and the comparison is now
  keyed by id **and prints both sides when they differ**, because a boolean cost this review a run it
  could not explain. Run 2 passed.
- **THE DW-68 WIDENING PROVED ITSELF, on a run rather than on an argument.** Run 2 hung on
  `page.waitForURL((u) => u.pathname === '/sites')`, retried once and passed — a `waitForURL`, which
  is precisely the class the old `goto`-only wrapper never saw and which killed **three of the four**
  full runs the real-infra layer executed before it was widened. The note line names the method now,
  so the next occurrence says which one.
- **The negative control on the Ghost read** (a zeroed key → 401) and **the boundary's negative
  controls** (a hostile accent, a `data:` logo, an unparseable menu) are in the table above; each was
  executed rather than reasoned.
- **What is still NOT settled, and no claim is made about it:** whether the DW-68 hang is this
  deployment's, the platform's or the network's. The control that would answer it — the same run
  against the previous deployment — still cannot be driven, because the harness cannot sign in
  against a preview URL. The pass above should be read as "every assertion held", not as "the hang is
  gone".

**Real services this review touched, by name:** Ghost **T1** (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`,
`GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` for 3.3's unchanged `injection-live` only) and
**T3** (`GHOST5_*`, the same four) — **read-only from this story's code**; the live **Supabase**
project over PostgREST, GoTrue and the transaction pooler (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`SUPABASE_DB_POOLER_URL`); the **Vercel** production deployment serving `app.inflozo.com`, and the
Vercel API by `VERCEL_TOKEN` to confirm which commit it serves. **Resend and Dodo are not on this
story's path** and were not called.

## Fix record 2 — the owner's Question 4 ruling, executed (R-82)

Run 2026-09-08 against CI's deployment of **`909f87b4`** on `app.inflozo.com` (`rls` ✔ `check` ✔
`deploy` ✔, production `READY` on that sha through the Vercel API by `VERCEL_TOKEN`), T1 and T3 as
above. **63 steps, 0 failures** — the review's 62 plus **`brand-atcap-picker`**. `pnpm check` exit 0
with 229 tests (`brandTarget`'s block gained three assertions rather than a new test); `pnpm build`
exit 0 with `ƒ /app/sites/brand` still dynamic inside the guard; `doc-audit --check` PASS on the
second pass; no migration.

**The change is one line and it is a simplification.** `brandTarget` was
`capped ? projects[0] : projects.find(linked)`; it is now
`projects.find(linked) ?? (capped ? projects[0] : undefined)`. The project for this site wins on
**both** sides of the cap, and the cap decides only what happens when this site has no project —
which is the one branch where Question 1 still rules. A consequence worth naming: **a downgrade can
no longer move the brand to a different project**, because the target no longer depends on the plan
whenever the binding exists.

**`brand-atcap-picker`, in the run's own words.** The only state that reaches "at the cap AND with a
choice" is a **downgrade** — Pro with two projects, then Free, which includes one — so the step
flips the entitlement through the service role as `pro-connect-t3` already does, and puts it back in
a `finally`. Downgraded to Free with 2 projects: the ticked card is **"Ghost6"**, the project for
this site, and it is **the same card that carries "This site's project"** — the tick and the label
on one card, which is what he ruled. The caption names it too.

**The control that makes it a control.** The step prints the row the **pre-ruling** rule would have
ticked — the first card in the page's own `updated_at desc, id desc` order — and the run answered
**"a DIFFERENT row"**. Had the two been the same row, the step would have said so rather than
claiming a proof it had not made; a chooser test that cannot tell the old rule from the new one is
not evidence for either.

**One run failed before this one, and it did not recur.** Run 1 against this deployment timed out
after 30s on `s2cHeading(page).waitFor()` — the S2c heading after the real T1 connect — with
**0 navigation retries**, so nothing the DW-68 wrapper covers was involved. Run 2 passed the same
step and every other one. Nothing between the last green deployment and this one touches connect
(`f81beb7e` is spec and harness only; `909f87b4` changes `brandTarget`), so it is recorded as a
**third manifestation of the DW-68 family — this time a locator wait rather than a navigation** —
and the retry was deliberately **not** widened to cover `locator.waitFor`, because a locator wait is
an assertion nearly everywhere else in this file and retrying those would hide real failures. The
cause remains open and no claim is made about it.

## Owner's test findings

Tested on `app.inflozo.com` on **2026-09-09**. **Two findings**, and they are one complaint told
twice: **the screen does not say it is working.** Neither is about S2c in particular — he walked the
brand screen and reported what he saw **across the app** — and each carries the same second half:
*"Please do a thorough check and ensure this is included in all future specs and stories."* So each
finding has **two halves**: the app as it stands today (fixed in this story, R-80 as amended) and the
rule that keeps it from coming back (bound where every future story reads it — see *The durable half*
below). His words first, then the triage.

1. **"When I click a button, there is no way the user know if something is happening in background.
   The button does not says anything. Can we show some kind of button state and label change so user
   know that something is happening. This is almost all buttons/links. Please do a thorough check and
   ensure this is included in all future specs and stories."**

   *What was seen:* every form on the site submits with the button unchanged — **Use your brand**,
   **Skip**, **Connect**, **Create project**, **Delete**, **Send the link**, all of them. The work
   behind some of them is a round trip to Ghost or to Supabase and is not instant, so between the
   click and the new page the screen is identical to the screen before the click.

   *Whose:* **every story that shipped a form, and this one owns the sweep.** It is not a defect of
   S2c — S2c inherited it. The rule is missing, not broken.

   *Verified before it is written down, not assumed:* `components/kit/button.tsx` has **no busy or
   pending state at all**, and deliberately no `disabled` either (its own comment: the Kit draws no
   disabled full-size button). `useFormStatus` appears **exactly once in the whole app** —
   `components/shell/account-menu.tsx`'s `SignOut`, which says `Signing out…` while it is in flight,
   uses `aria-disabled` rather than `disabled` so the control keeps focus and stays announced, and
   holds a ref so one impatient double-tap does not send two submits. **That one is the pattern**;
   the finding is that it was never lifted out of that file. Fourteen files carry a `<form>` or a
   form action.

   *And the rule it is missing from:* `EXPERIENCE.md`'s **State Patterns** table designs Empty,
   Loading, Error and Refusal for every surface — there is **no in-flight column**. That absence is
   why a story can be written, built, reviewed and passed with no busy state and nothing catches it.

2. **"When the Projects or Sites are being loaded. They are showing a generic shmmer. I want the
   loading shimmer to match the cards they show. Please do a thorough check and ensure this is
   included in all future specs and stories."**

   *Whose:* **this is a rule the project already has and did not keep.** `DESIGN.md` (Visual
   Language, *Loading*) rules "skeletons **matching the shape that is coming**, and coral progress
   bars where a real byte count exists. Never a spinner", and `EXPERIENCE.md`'s State Patterns table
   says "skeleton cards" for the Dashboard. So finding 2 needs no new ruling — it needs the rule
   applied and a check that would fail if it were not.

   *Verified:* the app has **one** route skeleton, `app/(app)/app/(authed)/loading.tsx`, and it draws
   three **project** cards — a 150px / 16:10 image band over two grey lines. `/sites` has **no
   `loading.tsx` of its own**, so it inherits that one; a site card is a 40px square monogram, a
   title, a mono host with an external-link glyph and pill badges, with **no image band anywhere on
   it**. That mismatch is the "generic shimmer" he saw on Sites. The dashboard's own skeleton is the
   right family but is now short of the card it shadows, which has gained a badge row and a menu.
   `/sites/brand`, `/sites/connect` and `/account` have no skeleton at all.

   *The file predicted this in writing.* `loading.tsx`'s own `ponytail:` comment says "this boundary
   covers every `(authed)` child, and today the dashboard is the only page with a shape … **The
   first sibling page that needs its own skeleton moves the dashboard and this file into their own
   route group.**" Sites arrived in Epic 3 and that move was never made. The deferral was recorded in
   the code and nowhere a story would read it — which is standing rule 3, *propagate, never localise*,
   caught by the owner instead of by the project.

**The durable half — "ensure this is included in all future specs and stories".** Both findings ask
for the same thing twice, so it lands **once**, at the Fix run, in the places a future story actually
reads: `EXPERIENCE.md`'s State Patterns gains the missing **in-flight** column beside Empty, Loading,
Error and Refusal; `DESIGN.md`'s *Loading* line gains the busy-control rule next to the skeleton rule
it already carries; and `docs/project-context.md` — the persistent facts every BMAD workflow loads —
gains the one-line acceptance rule, which is what puts it in front of the Create, Dev and Review
phases of every story after this one. A ruling number in `reconcile-designs-decisions.md` and a
`DW-` row for anything the sweep cannot finish inside Epic 3 go with them. **A rule with no check is
the state we are already in**, so the sweep leaves a step in the deployed-site harness for each half
that fails if the busy state or the matching skeleton goes away.

**Scope of the "thorough check" at Fix.** Every form action and every navigating link in the app —
the fourteen files above, not only the two screens named — and every route that lists cards. What the
sweep cannot fix inside this story is written down with its owning epic rather than quietly dropped;
the editor's own controls (Epics 4–7) are not built yet and inherit the rule through the durable half
rather than through a patch here.
