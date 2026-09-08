---
title: 'Story 3.2 — The connect wizard: URL, integration guide, and the two keys'
type: 'feature'
created: '2026-09-08'
status: 'in-review'
review_loop_iteration: 1
baseline_commit: '3a530ebcec1adc5584999bbb52ca62374859c5f8'
owner_test: issues
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story a customer can connect their own Ghost site to Inflozo: they open **Sites**, which says
"One handshake and you're in." over a drawing until something is connected, and press **Connect site** —
from the empty screen or from the top bar, which searches sites the way the Projects bar searches
projects. A window opens with three numbered, screenshotted steps for making one "Inflozo" integration in
Ghost Admin, and then three fields for the site address and the two keys that integration shows. Inflozo
checks the Admin key against the real site on the server, checks the Content key from the browser, refuses
a site older than Ghost 5 with a friendly "please update Ghost", and then shows the site on the Sites page
as a card: its address with a new-tab arrow, its Ghost version, and **Connected** just above when it was
last checked. The Staff Access Token is not asked for — that comes at first deploy — so the site is
connected in the "partially credentialed" state the product treats as normal.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.1 built the locked box and the one door (`server/ghost-admin`) but nothing puts a
customer's key through it: the only caller is DW-48's bearer-gated verify route, a surface that stores a
credential for any `site_id` a caller names and must not outlive the proof. `/sites` is in the shell's nav
and has no page. FR-C1/FR-C2 describe the wizard in full; frames S2b·1, S2b·2 and S11b draw it.

**Approach:** Build `/sites` and its connect wizard from the frames — two steps, three fields, no token —
with a server action that validates the Admin key through `fetchWithKey` on `GET /admin/config/`, reads the
public url from `GET /admin/site/`, writes the `sites` row under the service role and `store`s the key;
the browser verifies the Content key with a `settings` read before submitting. Delete the verify route
(DW-48) and retarget its harness at the deployed wizard so R-82's proof survives. First Run (S2a, DW-19)
and the Ghost Admin screenshots go to the owner as questions; neither blocks the build.

## Boundaries & Constraints

**Always:**
- The frames govern what it is built from (R-74): `S2 Onboarding.dc.html` **S2b·1** (`:78-102`) and
  **S2b·2** (`:110-142`) full-page under the shell when the account has no site; `S11 Sites.dc.html`
  **S11b** (`:131-155`) as the dialog behind S11a's **Connect site** button (`:57`); the card on S11a
  (`:61`) for a connected site. Copy is the frame's, verbatim: "First, a quick handshake.", the three
  steps, "Done — next", "Now paste the three keys.", the three labels, "Where do I find these?", "Back",
  "Connect", "Connect your Ghost site / Same quick handshake as onboarding.", "Cancel". Widths 1440 / 834 /
  390; one coral focus ring; zero axe violations at 1440 and 390.
- Validation is server-side through **`fetchWithKey`** (`server/ghost-admin/index.ts:246`), path
  `config/`, no `Accept-Version` (the version is unknown), `siteId` null. **`GET /admin/site/` never
  validates** — it answers 200 to any key (FR-C2, executed: it answers with **no key at all**, §38). It
  is read **after** `config/` passed, through the same `fetchWithKey`, for `site.url`, `title`, `icon`.
- `version` from `config/`: major ≥ 5 accepted; anything lower refused with the friendly sentence and
  nothing written. The rule is pure (`lib/connect-rule.ts`) and unit-tested with `4.48.0`, `5.130.6`,
  `6.58.0`, and a missing version (refused as unreachable — a Ghost that answers no version is not one
  the product knows).
- The Content API key is verified **in the browser** with `GET {url}/ghost/api/content/settings/?key=…`,
  `Accept-Version: v5.0` (both majors answer 200 to it and send `access-control-allow-origin: *`,
  executed §38). A 401 stops the submit with the field error; the server never trusts a client claim
  about it — `credentials_present.content` means "a key is stored", nothing more.
- `http://` is **warned, not refused**, under the URL field the moment the field says so: the browser
  cannot check the Content key against a plain-http site from an https page (mixed content), and the
  editor will not load live content from it. Both test Ghosts answer **403** on plain http to the admin
  API (executed §38), so such a connect fails with Ghost's own answer, honestly.
- **The row is the server's** (AD-7): `supabaseAdmin()` writes `url`, `title`, `favicon_url`,
  `ghost_version`, `content_key`, `site_settings.public_url`, `settings_read_at`, and clears
  `disconnected_at`; then `store()` puts the Admin key in Vault and flips `credentials_present.admin`.
  `store` failing after the insert deletes the row it just made and answers `credential_store_unavailable`
  — "Nothing was connected". The action joins two importer lists with its reason (`server-wiring.test.ts`).
- **`sites.url` is what the customer typed, normalised** to an origin (scheme defaulting to https,
  lowercase host, no path, no trailing slash). **The public url lives in `site_settings.public_url`** —
  this story settles the epic's open home for it without a migration — and it, never `sites.url`, is what
  the card's address links to. On Ghost(Pro) the two differ by design (EXPERIENCE.md:113).
- The cap is enforced **here, server-side**: active sites (`disconnected_at is null`) counted through
  the caller's own session against `resolveEntitlement(user.id).caps.sites`; over it the action answers
  `at_cap` with S11c's sentence ("Free includes 1 site. Pro connects up to 10." — derived from `PLANS`,
  never typed). S11c's ghost slot itself is Story 3.5's.
- `unique (user_id, url)`: an **active** row for that url answers `already_connected`; a **disconnected**
  row (FR-C6, a record Inflozo kept) is **re-adopted** — updated in place, `disconnected_at` cleared, its
  key re-stored (the trigger drops the old secret, proved by 3.1's `rotated` step).
- The connect screen states plainly what the Admin key can do (FR-C3's honesty rule; spine, blast-radius
  rule; §21m executed: the key reads every member's email and can publish posts): one sentence in the
  helper-caption slot above Connect. Inflozo's four writes are named in the same breath.
- **Never log a key**, never echo one back: the action's response carries `{ code, message }` and the
  field errors; every `console.error` line names a code, never a value (spine, Security floor).
- CSP: `connect-src` on the app host becomes `'self' https:` (`csp.ts:19`, `:46`; `csp.test.ts:62-66`
  rewritten to hold it). Reason in Design Notes; the marketing host is untouched.
- JavaScript off: step 1 → step 2 is a link (`?step=keys`), the keys form posts the server action, the
  errors render server-side; only the browser Content-key check and the S11b dialog need JavaScript
  (without it, **Connect site** is a link to `/sites/connect`, the full-page pair).
- R-81: every phase commits and pushes as `Story 3.2 - <Phase> - <one line>`. R-82: Review and the
  harness run against `app.inflozo.com`, T1 and T3, keys read by name from `tools/probe/.env`.

**Ask First:**
- Any write to `sites` beyond the columns named above, any new column, any migration.
- Any Admin API path beyond `config/` and `site/` from this story, or any client-side use of the Admin key.
- Relaxing CSP beyond `connect-src 'self' https:` (no `http:`, no `*`), or touching `script-src`.
- Building S2a First Run or capturing screenshots with a login that is not in `tools/probe/.env` by name —
  both are the owner's (Questions 1 and 2).

**Never:**
- The Staff Access Token: no field, no mention on these screens (D1b is E7's).
- Probes: `hostSettings`, code injection, Portal, the announcement bar (3.3); auto-brand S2c (3.4); the ⋯
  menu, health badges, Re-check, Disconnect, S11c's slot, B25's strip (3.5); Manage keys (3.6); the
  daily check (3.7).
- A second privileged client, a second `postgres` importer, SQL naming `vault.` or `private.` outside
  `server/ghost-admin/`.
- `GET /admin/site/` as a validator; "expired" anywhere in copy (keys never expire, §37).
- Editing the design export, a `record` document, or a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Connect T1 | `ghost6.inflozo.com`, its Admin and Content keys, JS on | browser `settings` 200 → action: `config/` 200 `6.58.0` → `site/` → row + Vault → redirect `/sites`; card "Ghost6 · ghost6.inflozo.com · Connected · Ghost 6.58 · Checked just now" | N/A |
| Connect T3 | `https://ghost5.inflozo.com/`, its keys | same; `ghost_version` `5.130.6`; url stored `https://ghost5.inflozo.com` | N/A |
| Bare host typed | `orbitweekly.com` | normalised to `https://orbitweekly.com` before anything is called | N/A |
| Not a URL | `orbit weekly` | field error under API URL: "That doesn't look like a site address — try `https://yoursite.com`." | nothing called |
| Plain http | `http://ghost5.inflozo.com` | warning under the field as typed: "Most Ghost sites use https:// — use that if yours does. Without HTTPS the editor can't load your live content." Browser check skipped; on Connect, Ghost's 403 → `ghost_refused` sentence | no row |
| Wrong Content key (JS on) | valid url, key with a changed character | browser 401 `Unknown Content API Key` → field error "Ghost doesn't recognise this Content API key." | action never called |
| Malformed Admin key | `abc` | `credential_malformed` → under the field: "An Admin API key looks like `65a3f…:9c2b41d8e0f…` — an id, a colon, then a long secret." | no network call, no row |
| Unknown kid | right shape, `kid` Ghost never issued | 401 → `ghost_unknown_key` → "Ghost said no — this Admin API key doesn't match your site. Copy the whole key from the Inflozo integration and try again." | no row |
| Unreachable host | `https://nonexistent.inflozo.com` | `ghost_unreachable` → "We couldn't reach nonexistent.inflozo.com. Check the address — it's your Ghost site's own." | no row |
| Redirect | a host answering 3xx | `ghost_redirected` (answered, never followed) → "Your site sent us somewhere else. Connect with the address your site actually uses." | no row |
| Ghost 4 | `config/` answers `version: 4.48.0` | `ghost_too_old` → "Your site runs Ghost 4.48. Inflozo needs Ghost 5 or newer — please update Ghost, then connect." | no row; unit-proved (no 4.x server exists) |
| At cap | Free with one active site | `at_cap` → S11c's sentence in the form's banner | no row |
| Already connected | active row for that url | `already_connected` → "ghost6.inflozo.com is already connected." | no row |
| Disconnected record | row with `disconnected_at` set | re-adopted: same id, `disconnected_at` null, new version and keys | old secret dropped by trigger |
| Store fails | Vault/pooler refused after insert | row deleted, `credential_store_unavailable` → "We couldn't save your key just now. Nothing was connected — try again in a moment." | no orphan row |
| JS off | form posted directly | server validates Admin key, stores both keys; Content key unchecked (stated in Design Notes) | errors render in the same slots |
| No site yet | signed-in account, zero active rows | `/sites` **is** S2b·1; `?step=keys` is S2b·2 (EXPERIENCE.md:318) | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/sites/page.tsx` -- **new**: S11a when there are active sites (read
  through the user's own session, `disconnected_at is null`, newest first), and — **at Fix, the owner's
  finding 7** — an EMPTY SCREEN in S3b's shape when there are none: the browser-meets-plug drawing
  (Question 6), `SITES_EMPTY.title` / `.sub` (Question 5) and a centred **Connect site** that opens the
  sheet. `?step=` no longer means anything here; the full-page handshake is `/sites/connect`. `metadata`
  like the dashboard's (`page.tsx:32-35`); the top bar is the shell's, on both surfaces (finding 5).
  The card: letter disc, title, public url as a link (`site_settings.public_url`, fallback `url`) **with
  the new-tab glyph** (finding 4), then the metadata pills alone on their line — "Ghost {major.minor}",
  "n projects" from `projects.linked_site_id` — then "Connected" and "Checked {relative}" from
  `settings_read_at` as one close pair (finding 6, DW-57); the ⋯ button **absent** (3.5).
- `apps/web/app/(app)/app/(authed)/sites/connect/page.tsx` -- **new**: the full-page pair on its own
  route so the JS-off **Connect site** link has a destination; renders `ConnectWizard` with `step` from
  `?step=`.
- `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx` -- **new, client**: both steps in one
  component; `step` prop + optional `onStep` (the dialog passes it; the page lets the anchor navigate);
  `useActionState(connectSite)` on the keys form (`new-project-sheet.tsx:1-12` is the pattern, `Banner`
  for the form-level message, `TextInput`'s `error` prop for field errors — `input.tsx:13-40`); the URL
  field warns on `http://` as typed; on submit with JS the Content check runs first (`content-check.ts`)
  and a 401 blocks. Mono inputs (`mono`), the 4px progress bars, "1/2" / "2/2" in mono. **At Fix
  (findings 1, 2 and 3):** both steps are drawn into ONE grid cell — the hidden one `invisible` and
  `inert` — so the box is one size at every width and in both variants, the page card is S2b·2's 560 at
  both steps, and "Where do I find these?" is a subtle link at the top right of step 2 rather than the
  frame's bordered chevron row (`ChevronDown` is no longer imported).
- `apps/web/app/(app)/app/(authed)/sites/connect-dialog.tsx` -- **new, client**: S11b — a `<dialog>`
  (`kit/dialog.ts` `closeOnBackdrop`) around `ConnectWizard`, capped at the viewport now that its height
  is the taller step's. **At Fix (finding 5) the opener left this file for the shell**, where the top
  bar is: `ConnectSiteDialog` carries `id={CONNECT_SITE_DIALOG}` and the shell's button finds it by that
  id and opens it with `openOnCancel` — the dashboard's own split (`shell.tsx`'s button,
  `new-project-sheet.tsx`'s dialog). Every open is a fresh wizard (`key`, bumped on close).
- `apps/web/components/shell/shell.tsx` -- **at Fix, the owner's finding 5**: `BARS` is the table of the
  surfaces that carry a top bar — `/` searches projects and offers "New project", `/sites` searches sites
  and offers `ConnectSiteButton` — and the 64px bar, the phone's search toggle and ⌘K all read it, so
  Sites gets Projects' bar and no third branch is added. `ConnectSiteButton` is an
  `<a href="/sites/connect">` in `NewProjectButton`'s three sizes. **No bell** (Question 4, UX-DR3).
- `apps/web/components/kit/icons.tsx` -- **at Fix, finding 4**: `ExternalLink`, the export's own glyph
  (`P0-2 Icon Slot and Picker.dc.html:111`, `title="external"`) at the Kit's 1.5 stroke.
- `apps/web/app/(app)/app/(authed)/sites/content-check.ts` -- **new, client, pure fetch**:
  `checkContentKey(url, key)` → `'ok' | 'unknown_key' | 'unreachable' | 'skipped_http'`;
  `AbortSignal.timeout(10_000)`; never throws.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- **new, `'use server'`**: `connectSite(previous,
  formData)` in `projects/actions.ts`'s shape (`:1-60`: `ActionResult`, `fail`, `logged` without user
  content, `signedIn`); zod schema over the three fields; `normaliseSiteUrl`; entitlement + count;
  existing-row lookup; `fetchWithKey` twice; `supabaseAdmin()` insert/update; `store()`; compensating
  delete; `revalidatePath('/app/sites')`; `redirect('/sites')` on success.
- `apps/web/lib/connect-rule.ts` + `apps/web/connect-rule.test.ts` -- **at Fix**: `filterSites` (the
  search, over the title and both addresses — findings 5), `SITES_EMPTY` (the empty screen's words, so
  the harness reads the app's own rather than retyping them) and `CONNECT_SITE_DIALOG` (the id the shell
  and the page share). **New, pure**: `normaliseSiteUrl`
  (refuses non-URLs and non-http(s) schemes), `isPlainHttp`, `versionVerdict(version)` →
  `{ ok, major, minor }` | `ghost_too_old` | `unreachable`, `connectMessage(code, host)` — the I/O
  matrix's sentences, one per code, and `ghost_refused` for any other non-2xx from Ghost.
- `apps/web/lib/plan.ts:30-32, 47, 56-69` + `plan.test.ts` -- add `atSiteCap(plan, count)` and
  `includesSites(plan)` / `siteCapSentence(plan)` beside their project twins; derived from `PLANS`.
- `apps/web/server/ghost-admin/index.ts:104` (`store`), `:246` (`fetchWithKey` — `siteId`/`userId`
  optional, audit `admin_read` with `site_id` null) -- **imported, unchanged**. `admin-rule.ts:151`
  `adminUrl` (keeps a subdirectory install, refuses non-URLs), `:183` `majorOf`, `:208` `ghostCode`
  (the Ghost-cause → code map; `ghost_unknown_key`, `ghost_redirected`, `ghost_unreachable`).
- `apps/web/server-wiring.test.ts:69-101` -- the `supabaseAdmin()` importer list gains
  `sites/actions.ts` with its reason (server-asserted `sites` columns, AD-7); `:198-201, 262-286` — drop
  `VERIFY_ROUTE`, name `sites/actions.ts` as the chokepoint's only importer.
- `apps/web/csp.ts:17-19, 46` + `csp.test.ts:62-66` -- `connect-src 'self' https:`; the test's name and
  assertion follow; the marketing assertion (`undefined`) stays.
- `apps/web/app/api/ghost-admin/verify/route.ts`, `apps/web/server/ghost-admin/verify-queries.ts` --
  **deleted** (DW-48).
- `apps/web/public/connect/integration.png` -- **new**: the owner's screenshot of the saved "Inflozo"
  integration in Ghost Admin (title, description, the two keys and the API URL, keys blurred), copied from
  `_bmad-output/planning-artifacts/design/CustomIntegrationScreen.png` (644×408, ruled 2026-09-08). One
  image for the frame's one box (`S2 Onboarding.dc.html:97-98`), `<img>` with width/height and alt text
  naming what it shows; it sits under step 3, the step it illustrates.
- `apps/web/app/(app)/app/(authed)/layout.tsx` -- unchanged; `/sites` is inside the guard by where its
  file sits. `app-routes.test.ts` walks every `page.tsx` — the new pages are guarded by construction.
- `tools/probe/run-verify-ghost-admin.py` -- **at Fix**, four steps added and three retargeted:
  `first-run` is the empty screen, `sites-bar` reads the shell's bar (the 64px box, its 1px rule, the
  "Search sites…" placeholder, one control beside the field, zero bells), `same-size` measures the
  sheet's box at BOTH steps, `find-link` reads the link's tag, href, border and position, `handshake`
  is the full-page pair at `/sites/connect`, `card` reads the card's own boxes for findings 4 and 6,
  `search` drives the field on the deployed page, and `axe-empty` covers the new screen; `re-adopt`
  reaches the wizard through the empty screen's button, and `sheet-reopen` asks whether the fields are
  VISIBLE rather than present, because both panes are always in the DOM now. **Originally rewritten**, `run-verify-account-deletion.py:196-340`'s
  shape: Python mints a throwaway GoTrue user and its magic link (`generate_link`), a Node/Playwright
  half signs in and drives `/sites` on the deployed app (`PW_DIR`, `AXE_PATH` as there), and reads the
  pooler **read-only** through `apps/web/node_modules/postgres` (3.4.9, already installed) for
  `private.site_credentials`, `vault.secrets` existence and `private.credential_audit`. Steps in order:
  `keys` · `vault-off-rest` (kept: REST 404 ×3, `/sites` 200) · then per Ghost `connect` (T1, T3) ·
  `malformed` · `bogus-key` · `content-wrong-key` (browser, no POST left the page) · `http-warned` ·
  `already-connected` · `at-cap` (the throwaway is Free: T3 after T1 answers the sentence — so the order
  is T1 connect, then T3 as the cap proof) · `audit` (`admin_read` rows with null then real `site_id`) ·
  `axe` at 1440 and 390 · `user-gone` · `secret-gone` · `no-secret-leak`. The docstring names every step.
- `tools/doc-audit.py:355-362` -- the harness's catalogue description rewritten for its new subject
  (the row itself stays; same path, no new row).
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` §38
  (appended at Create, 2026-09-08) -- `GET /admin/site/` with no key; Content API CORS and `Accept-Version`;
  plain http → a 301 to https on both Ghosts when the call carries a key (corrected at Review — §38c's 403
  was measured with no key). §37 the 401 causes; §21m the blast radius; §21j Vault over REST.
- `_bmad-output/implementation-artifacts/deferred-work.md:491` DW-19 (First Run — Question 1), `:1134`
  DW-48 (closed at Dev), **DW-54** (added at Create: the three live proofs whose driver leaves with the
  route, and where each is re-driven), **DW-57** (added at Fix: the card's layout is the owner's, and
  3.3, 3.5 and 3.7 inherit it rather than the frame's).
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:107-117` (the
  surfaces and their frames), **`:318` Sites with none — AMENDED at Fix to the owner's empty screen,
  with the old wording quoted and the finding cited**, `:697-716` (J1 steps 3–5). The same sentence in
  `ux-designs/prototype/build.py` (5b's `nodraw` annotation for Sites, regenerated) and in
  `implementation-artifacts/epic-3-context.md` moved with it — propagate, never localise.
- `supabase/` -- **no migration**: no schema change in this story. `bash supabase/tests/run-rls-gate.sh`
  still runs at Verification because the harness's cascade proof depends on 3.1's trigger.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/connect-rule.ts` + `apps/web/connect-rule.test.ts` + `lib/plan.ts` + `plan.test.ts` --
      the URL normaliser, the version verdict, the sentences, the site cap -- pure and green first
- [x] `apps/web/csp.ts` + `csp.test.ts` -- `connect-src 'self' https:` -- the browser check is possible
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `connectSite` -- validate, write, store,
      compensate, redirect
- [x] `apps/web/app/(app)/app/(authed)/sites/{page,connect/page,connect-wizard,connect-dialog,content-check}.*`
      -- S2b·1, S2b·2, S11b, S11a's card -- the surface, from the frames
- [x] `apps/web/public/connect/integration.png` -- the owner's screenshot, copied in -- "guided, screenshotted"
- [x] delete `app/api/ghost-admin/verify/route.ts` + `server/ghost-admin/verify-queries.ts`;
      `server-wiring.test.ts` importer lists -- DW-48 -- the chokepoint's caller is the product
- [x] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- the harness retargeted at the
      deployed wizard -- R-82, re-runnable
- [x] `deferred-work.md` (DW-48 closed, DW-54's status) + `epic-3-context.md` -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by variable name

**Fix run, 2026-09-08 — the owner's seven test findings, each inside this story (R-80 as amended):**
- [x] Findings 1 and 2 -- `connect-wizard.tsx` + `connect-dialog.tsx` -- both steps in ONE grid cell, the
      page card one width -- the box cannot change size or move, so nothing behind it is uncovered
- [x] Finding 3 -- `connect-wizard.tsx` -- "Where do I find these?" as a subtle link at the top right,
      its own line below `tablet` -- the frame's bordered chevron row is gone
- [x] Finding 4 -- `components/kit/icons.tsx` + `sites/page.tsx` -- `ExternalLink`, the export's own
      glyph, beside the card's address
- [x] Finding 5 (amended) -- `components/shell/shell.tsx` + `lib/connect-rule.ts` -- Sites gets Projects'
      top bar: the rule, "Search sites…" matching a title or an address (`filterSites`, pure and tested),
      **Connect site** on the right. No bell — Question 4, ruled to Story 13.4
- [x] Finding 6 -- `sites/page.tsx` -- the pills keep their line, "Connected" moves just above
      "Checked …" and closer to it; one card component, so every card; **DW-57** binds 3.3, 3.5 and 3.7
- [x] Finding 7 -- `sites/page.tsx` + `sites/connect/page.tsx` -- `/sites` with nothing connected is an
      empty screen (Questions 5 and 6); the full-page handshake stays at `/sites/connect` for the no-JS
      link; `EXPERIENCE.md:318`, `epic-3-context.md` and 5b's annotation amended with it
- [x] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- the harness follows the
      surfaces it drives, with a measured step per finding -- R-82, re-runnable
- [x] Re-run `## Verification` on the real infrastructure and record it

**Acceptance Criteria:**
- Given a signed-in account with no site, when it opens `/sites` at 1440, 834 and 390, then the page is
  the **empty screen** — the browser-meets-plug drawing, `SITES_EMPTY.title` as the `<h1>`, `.sub` under
  it, and a centred **Connect site** — over the shell's own top bar, and **no handshake and no key field
  is on that route**; pressing either **Connect site** opens S11b (the owner's finding 7)
- Given `/sites/connect` at 1440, 834 and 390 — where **Connect site** leads with JavaScript off — then
  step 1 is S2b·1 and **matches the frame** (`S2 Onboarding.dc.html:78-102`: the two 4px bars with one
  coral, "1/2" mono, the 26px display headline, three 22px numbered discs in coral-tint, the screenshot,
  "Back" to `/sites` and the 44px ink "Done — next"); "Done — next" leads to S2b·2 and **matches the
  frame** (`:110-142`: both bars coral, "2/2", three 44px mono fields with the frame's labels and
  placeholders, "Back" and "Connect"); with JavaScript off the same two pages work and the form still
  submits. **Two departures the owner's test ruled** (R-80 as amended): the card is S2b·2's 560 at BOTH
  steps rather than the frame's 480 then 560, and "Where do I find these?" is a subtle link at the top
  right rather than the frame's bordered chevron row (`:135-138`)
- Given the connect sheet at any width, when "Done — next" is pressed, then the dialog's box is the same
  size and in the same place as it was — measured, not asserted — so nothing behind it is uncovered
  (his findings 1 and 2: it was 520×665.7 then 520×608.5 before the fix)
- Given the Sites top bar, then it is the shell's own — 64px with a 1px rule, the field placeholdered
  "Search sites…" matching a site's title or its address, **Connect site** as its only other control —
  and **no bell is drawn on any surface in this story** (his finding 5 as amended, ruled at Question 4)
- Given the T1 keys, when Connect is pressed, then `private.credential_audit` shows an `admin_read` row
  for `config/` with `site_id` null and then rows for `site/` with the new `site_id`; `sites` has one row
  with `ghost_version` `6.58.0`, `content_key`, `site_settings.public_url = 'https://ghost6.inflozo.com/'`,
  `credentials_present = {content: true, admin: true, staff: false}`; a `vault.secrets` row exists behind
  `admin_key_vault_ref`; the browser is on `/sites` showing the card, which matches the frame
  (`S11 Sites.dc.html:61`) minus the ⋯ button **and with the owner's own three changes to it**: the
  new-tab glyph on the address, the metadata pills alone on their line, and "Connected" just above
  "Checked …" and closer to it than to the pills (his findings 4 and 6, DW-57); and no response body
  carried a `kid:secret`
- Given a connected site, when **Connect site** is pressed with JavaScript on, then S11b opens and
  **matches the frame** (`:131-155`: 520 card, the title pair, ✕, "Cancel" and "Done — next"), Cancel and
  Esc close it with nothing sent; with JavaScript off the same button is a link to `/sites/connect`
- Given each row of the I/O matrix, when it is exercised, then the named code and sentence appear in the
  named slot and no `sites` row exists afterwards unless the row says one does
- Given the Free plan with one active site, when a second connect is attempted, then the action answers
  `at_cap` and the banner reads exactly `siteCapSentence('free')`
- Given the source tree, when `node --test` runs, then the verify route is gone, `sites/actions.ts` is
  the chokepoint's only importer and the second `supabaseAdmin()` importer, no file outside
  `server/ghost-admin/` names `vault.` or `private.`, and the app host's policy carries
  `connect-src 'self' https:` while the marketing host carries none
- Given the deployed site, when `tools/probe/run-verify-ghost-admin.py` runs against T1 and T3, then every
  step in its docstring passes in order, `user-gone` and `secret-gone` included, and axe reports zero
  violations at both widths

### Review Findings

Review 1, 2026-09-08 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier) over the diff `3a530ebc..156f5d08`, plus the harness driven against the deployed site
(`## Verification`, Review 1). Every patch below is applied in this review's commits; every defer has its
ledger row; the one decision is Question 3 under `## Questions for the owner`.

- [x] [Review][Decision] The consent line names two writes ("your theme and your routes file") while the
      frozen Boundaries say "Inflozo's four writes are named in the same breath" — **Ruled: option 1 (owner,
      2026-09-08), keep the sentence as it is**; the announcement-bar switch is Story 3.4's own consented
      yes/no, no code change [apps/web/lib/connect-rule.ts `ADMIN_KEY_CONSENT`]
- [x] [Review][Patch] The Dev commit truncated the spec from the last task line to the end of `## Questions
      for the owner` — the Acceptance Criteria, the change log, the Design Notes, the owner's manual test and
      both rulings — and spliced the Verification record into the task line, so the board showed no test and
      no rulings (R-80, R-83); restored from `3a530ebc`, frozen block byte-identical [spec]
- [x] [Review][Patch] §38c's "plain http → 403" was measured with no key: with the key both Ghosts answer a
      301 the chokepoint never follows, so the customer reads `ghost_redirected`'s sentence — five comments
      corrected, §38c amended, the harness's `http-connect` step executes the wizard's own shape
      [apps/web/lib/connect-rule.ts, sites/content-check.ts, csp.ts, MEASUREMENTS §38c]
- [x] [Review][Patch] React 19 resets a form after every action, a refusal included, so all three fields
      emptied on every server-side refusal (the owner's test step 5 would have needed everything re-pasted) —
      the values are state, the fields controlled; `malformed` asserts they survive
      [sites/connect-wizard.tsx, components/kit/input.tsx]
- [x] [Review][Patch] **A plain-`http://` address could not be submitted at all** — the Connect button
      did nothing, no POST, no error (executed on the deployed site, Review 2): the browser's Content-key
      check returns synchronously for a skipped `http://`, so the old re-entrant `form.requestSubmit()`
      fired nested inside the same submit event and React dispatched no action; the https path only
      worked because its real fetch delayed the resubmit. Replaced the `verified`-ref dance with a
      direct `startTransition(() => action(data))` — one path, no timing; the `http-connect` and
      `js-off` steps now exercise it on the live site [sites/connect-wizard.tsx]
- [x] [Review][Patch] Nothing closed S11b after a successful connect: the action redirects to the route the
      sheet lives on, the page re-renders in place and the sheet stayed open with the keys in it — the page
      keys the button on the number of cards; `pro-connect-t3` proves it [sites/page.tsx, sites/connect-dialog.tsx]
- [x] [Review][Patch] A reopened sheet showed the last attempt's banner, field error and typed keys — a fresh
      wizard per open; `sheet-reopen` [sites/connect-dialog.tsx]
- [x] [Review][Patch] The harness counted every form on the page (9 fields, three submit buttons — the shell's
      two Sign-out forms and Next's hidden action inputs) and could not pass on a correct page — locators
      scoped to the wizard's form [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] T3 never went through the product (the Free fixture met the cap first), S11b's in-sheet
      flow, a script-less post, a plain-http connect, FR-C6's re-adoption of a disconnected record and axe on
      S2b·2 and the open sheet were executed nowhere — steps `js-off`, `http-connect`, `dialog`, `sheet-submit`,
      `sheet-reopen`, `re-adopt`, `pro-connect-t3`, `axe-sheet`, `axe-keys`; the two fixture states no UI can
      make yet (a disconnected record, a Pro entitlement) are made by the service role
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The harness restated the cap sentence's shape, hardcoded the version floor and typed the
      warning's opening words — `connectMessage`, `HTTP_WARNING` and `siteCapSentence` are evaluated through
      Node from the app's own modules [tools/probe/run-verify-ghost-admin.py `app_text`]
- [x] [Review][Patch] `connect` asserted two of the card's five labels — now the title and address from
      `GET /admin/site/`, the address's `href`, `settings_read_at` and "Checked just now"
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] A `store()` failure on a re-adopted record restored only `disconnected_at` — every column
      the two writes touch is read first and put back, and the undo's own failure is logged
      [sites/actions.ts, connect-rule.test.ts]
- [x] [Review][Patch] `GET /admin/site/`'s `url` and `icon` became a link and an `<img>` unchecked — `isHttpUrl`
      [apps/web/lib/connect-rule.ts, sites/actions.ts]
- [x] [Review][Patch] IP literals (`127.0.0.1`, `10.0.0.1`, `169.254.169.254`, `[::1]`) passed the address rule
      the way `localhost` does not — refused [apps/web/lib/connect-rule.ts `normaliseSiteUrl`]
- [x] [Review][Patch] An empty Content API key connected the site silently with `content: false` and no
      sentence — `required` on all three fields, with or without JavaScript; `keys-step` counts them
      [sites/connect-wizard.tsx]
- [x] [Review][Patch] `settings_read_at` was stamped at insert, before the read it names — stamped with the
      `site/` read [sites/actions.ts]
- [x] [Review][Patch] A field over 300 characters was answered as a bad address under the URL, and the same
      address double-submitted met `unique (user_id, url)` and was told the connect failed — answered under its
      own field; `23505` is `already_connected` [sites/actions.ts]
- [x] [Review][Patch] `requestSubmit()` after the browser check on a form that had been detached (sheet
      closed, Back pressed) left the flag set and skipped the next check; a modified click on a step anchor in
      the sheet swallowed the new-tab intent [sites/connect-wizard.tsx]
- [x] [Review][Patch] A failed `projects` read made every card say "0 projects" as a fact — logged, pill
      absent [sites/page.tsx]
- [x] [Review][Patch] `revalidatePath` on the `at_cap` refusal alone — removed; the cap's count-then-write race
      carries the project cap's own `ponytail:` note [sites/actions.ts]
- [x] [Review][Patch] The comment said `Accept-Version` is sent on neither call; `site/` sends `v{major}.0`
      [sites/actions.ts]
- [x] [Review][Patch] Two sentences carried Markdown backticks into plain text under a field — removed; every
      sentence is asserted backtick-free [apps/web/lib/connect-rule.ts, connect-rule.test.ts]
- [x] [Review][Patch] `/sites/connect` was not asserted to stay inside the proxy matcher, and a file placed
      directly under `public/` was not walked [apps/web/routing.test.ts]
- [x] [Review][Patch] DW-48's location still read "to be created by 3.1"; DW-54 restated the harness's step list
      (already drifted), named neither the decrypt path nor that `re-adopt` now drives `rotated` live
      [deferred-work.md]
- [x] [Review][Patch] `sprint-status.yaml`'s `last_updated` lost its quotes at Dev [sprint-status.yaml]
- [x] [Review][Patch] The harness re-deleted a user its cascade step had already proved gone
      [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Defer] A Ghost installed under a path (`https://example.com/blog`) cannot connect: the frozen
      Boundaries normalise the address to an origin, though `adminUrl` would keep the path — DW-55
      [apps/web/lib/connect-rule.ts `normaliseSiteUrl`] — deferred, the approved contract
- [x] [Review][Defer] The decrypt path — `call()` reading `vault.decrypted_secrets` and signing with it — has
      no product caller until Story 3.3's settings read, so between the route's deletion and 3.3 it runs on no
      infrastructure — DW-54 [apps/web/server/ghost-admin/index.ts `call`] — deferred, 3.3's
- [x] [Review][Defer] With JavaScript off, the connect form's fields are in the HTML but not visible — the
      authed shell hides content until hydration. The connect form itself is correctly progressively enhanced
      (`method=post`, an `action` attribute, React's `$ACTION_*` fields — the harness's `js-off` step proves
      it); the visibility gate is shell-wide and predates Epic 3 — DW-56 [components/shell or the layout] —
      deferred, a shell question the owner rules on

Dismissed (4): the Sites grid's three columns at 834 (the dashboard's own convention; the app frames are
drawn at 1440 only); S11b's two-word step-3 difference from S2b·1 and the Kit's 36/44 button heights against
the frame's 38/40 (the Kit governs, as on every surface); a `select 1` on the pooler in `--check` (the full run
executes it and cleans up either way); `resolveEntitlement` throwing (it does not — a failed read resolves to
Free).

## Spec Change Log

- **2026-09-08, Dev — reconstructed at Review from the code's own comments, because the Dev commit lost this
  log with the rest of the tail (next entry).** (1) A `'use server'` module may export only async functions, so
  the result and code types the Code Map placed beside the action (`ActionResult`'s shape in `actions.ts`) live
  in `lib/connect-rule.ts` as `ConnectResult`, `ConnectCode` and `ConnectField`: `pnpm check` was green with
  them in `actions.ts` and `next build` was not (the wizard's import of the action failed to resolve).
  (2) Outside the Code Map, each for the frame's sake: `kit/input.tsx` gained `size` (S2b·2's 44px field),
  `hint` (the http warning — marigold, `role="status"`) and `onChange`; `proxy.ts`'s matcher excludes `connect/`
  and `routing.test.ts` walks every folder under `public/` so the screenshot is served on the app host;
  `identity.test.ts` exempts the mono `Inflozo` chip the frame draws at `S2 Onboarding.dc.html:97`;
  `connect-dialog.tsx` draws S11b's own 520 box rather than `kit/dialog.ts`'s 460 `sheet`; `content-check.ts`
  imports `connect-rule.ts` by relative path so `node --test` reaches it. (3) The harness's steps are its
  docstring's, not the Code Map's plan: `grants` is proved by `connect` itself, and `write-denied`, `rotated`
  and `staff-removed` left with the route (DW-54).
- **2026-09-08, Review 1.** The file as committed at `156f5d08` had lost everything from the last task line
  to the end of `## Questions for the owner` — the Acceptance Criteria, this log, the Design Notes, the
  owner's manual test and both of his rulings — and the Verification record was spliced into the task line.
  Restored from `3a530ebc`; the frozen block is byte-identical to the baseline again; nothing in it was
  rewritten.
- **2026-09-08, Review 1 — the frozen text overtaken by execution, recorded here rather than edited there:**
  (a) **Plain http is a 301, not a 403.** §38c measured `GET http://…/ghost/api/admin/config/` with no
  credential; the wizard's call carries the key, and with it both Ghosts answer `301 Location: https://…`
  (Express's redirect, once the key authenticates), which `fetchWithKey` never follows (`redirect: 'manual'`).
  The matrix's plain-http row therefore ends in `ghost_redirected`'s sentence — "Your site sent us somewhere
  else. Connect with the address your site actually uses." — not `ghost_refused`'s; no row either way. The
  verifier isolated the cause: no header → 403, `Authorization: Ghost garbage` → 400, an unissued kid → 401,
  the real key → 301. §38c carries the correction; the harness's `http-connect` step executes the wizard's
  own shape. (b) The matrix's two code spans (`https://yoursite.com`, `65a3f…:9c2b41d8e0f…`) are Markdown;
  the sentences carry no backticks. (c) `settings_read_at` is stamped by the `site/` read, not at insert — a
  read that failed leaves it as it was and the card says "Not checked yet". (d) `Accept-Version` is absent on
  `config/` only; `site/` carries `v{major}.0`, as every later call will. (e) The Content API key is
  `required` on the form, with or without JavaScript — "paste the three keys" means three; a crafted post
  without one still connects with `content: false`, the partially credentialed state, and Manage keys (3.6)
  is where it is added. (f) An IP literal is refused as an address, beside `localhost` and for the same
  reason.
- **2026-09-08, Review 1 — a real submit bug the new harness step surfaced:** a plain-`http://` address
  could not be submitted — the Connect button did nothing (no POST, no banner), executed on the deployed
  site. The wizard ran the browser Content-key check, then re-submitted the form with `form.requestSubmit()`
  guarded by a `verified` ref; when the check returned synchronously (a skipped `http://` never fetches) the
  nested submit fired inside the first submit event's own tick and React dispatched no action. The https
  path only worked because its real network fetch pushed the resubmit past the event. Fixed at root by
  dropping the re-entrant dance and invoking the action directly with `startTransition(() => action(data))`
  — fewer lines, one path, and JS-off still posts natively because the form keeps `action={action}`. The
  bug predates this story (the same dance shipped in Dev); no earlier test submitted an http address.
- **2026-09-08, Review 1 — behaviour the Dev build lacked, added:** the wizard's three values are React state
  (React 19 resets a form after its action, a refusal included, so uncontrolled fields emptied on every
  server-side refusal); the sheet is a fresh wizard on every open and is closed on a successful connect by
  the page keying the button on the number of cards; a `store()` failure on a re-adopted record restores every
  column the connect wrote; `GET /admin/site/`'s `url` and `icon` are checked to be http(s) URLs before they
  become a link or an `<img>`; a field over the ceiling is answered under its own field; a double-submitted
  address that meets `unique (user_id, url)` is `already_connected`; the projects tally is absent, not
  "0 projects", when its read fails.
- **2026-09-08, Review 1 — the harness:** locators scoped to the wizard's form (the shell's two Sign-out forms
  and Next's hidden action inputs made `form input` count 9 and `form button[type="submit"]` match three —
  executed, run 1); the app's sentences evaluated through Node from `lib/connect-rule.ts` and `lib/plan.ts`
  rather than parsed or retyped; steps added — `js-off`, `http-connect`, `dialog`, `sheet-submit`,
  `sheet-reopen`, `re-adopt`, `pro-connect-t3`, `axe-sheet`, `axe-keys` — the two fixture states no UI can
  make yet (a disconnected record, a Pro entitlement) made by the service role; `--shots DIR` for the frame
  comparison.

- **2026-09-08, Fix — the owner's seven test findings, and the frozen text two of them overtake.** The
  frozen I/O matrix's last row says "`/sites` **is** S2b·1; `?step=keys` is S2b·2 (EXPERIENCE.md:318)" and
  the frozen Boundaries name S2b·1 and S2b·2 "full-page under the shell when the account has no site". **His
  test outranks both** (R-80 as amended, and the same rule that made "Where do I find these?" a link rather
  than the frame's box): `/sites` with nothing connected is now the empty screen of his finding 7, and the
  full-page pair moved to `/sites/connect` — which the frozen Boundaries already required to exist, for the
  no-JavaScript link. Nothing else in the frozen block moves: the same two steps, the same three fields, the
  same server action, the same codes and sentences. Recorded here rather than edited there, as Review 1's
  corrections were. `EXPERIENCE.md:318` itself IS amended, because it is a live spine and not a frozen
  intent, and 5b's annotation and `epic-3-context.md` moved with it.
- **2026-09-08, Fix — the height jump was one bug behind two findings, and it was measured before it was
  fixed.** His finding 2 ("momentarily … I can see the project grid card in background") was triaged at the
  Test run as *probably* finding 1's height change and marked "to be reproduced before anything is changed".
  It was: a throwaway account with one site, on `app.inflozo.com`, reported the sheet at **520×665.7** at
  step 1 and **520×608.5** at step 2 — a 57.2px shrink that swept the top edge **28.6px down the page**, and
  the card behind sits exactly there. One cause, two findings, one fix: both panes share a grid cell, so the
  box is the taller of the two and cannot move. The same measurement found the full-page pair jumping
  480×694.7 → 560×661, which is why the page card is now one width.
- **2026-09-08, Fix — routine calls taken rather than asked.** (a) The two panes are always in the DOM,
  the hidden one `invisible` (it must keep its space) and `inert` (out of the tab order, out of the
  accessibility tree, out of axe's, with no script needed) — a measured `min-height` would have been one
  number per variant per breakpoint, stale the first time a sentence changed. (b) `ConnectSiteButton` moved
  into `shell.tsx` beside `NewProjectButton` and the sheet stayed on the page, which is the split the
  dashboard already uses; the two now share `CONNECT_SITE_DIALOG` rather than a component. (c) The sheet is
  capped at `100dvh - 20px` and scrolls, because one box the size of the taller step could otherwise outgrow
  a short viewport. (d) `SITES_EMPTY` lives in `lib/connect-rule.ts` so the harness reads the app's own
  words instead of retyping them — Review 1's rule for every sentence it asserts.

## Design Notes

**Why `connect-src 'self' https:`.** `csp.ts:17-19` kept the two test Ghosts as a stand-in "until the
session's real list arrives with Epic 3". The list cannot serve the connect moment: the origin being
checked is by definition not stored yet, and it can be any host on the public web. Enumerating stored
origins per request would also put a database read on every navigation for a directive that is a
second-line control — `script-src` with a nonce and `'strict-dynamic'` is what stops an injected script
from running at all, and `img-src` is already `https:`. `https:` is the narrowest value that makes the
FR's browser check possible for every customer; `http:` is left out on purpose (mixed content would block
it anyway, and the warning says so). The comment in `csp.ts` records this so the placeholder's promise
does not outlive it.

**Insert, then store, then compensate.** `store()` needs a `site_id` and checks the row is the caller's
(`index.ts:118-125`), so the row must exist first. The pair is not one transaction — `store` owns its own
`sql().begin` and the row is written by `supabaseAdmin()` — so a `store` failure deletes the row it just
made and answers "Nothing was connected". Reusing 3.1's tested `store` unchanged is worth the one
compensating delete. `// ponytail: insert then store with a compensating delete; one transaction inside
server/ghost-admin if credential_audit ever shows the pair half-done.`

**The public url's home.** `site_settings` is the jsonb 3.3 fills from `GET /admin/settings/`;
`public_url` sits beside those keys, read from `GET /admin/site/` at connect and by 3.7 daily. No column,
no migration; the card and every later "View site" read `site_settings.public_url ?? url`.

**The step anchor, once.** The wizard renders `<a href="?step=keys">` for "Done — next" and
`<a href="?step=integration">` for "Back" / "Where do I find these?"; when the dialog supplies `onStep`,
the click is intercepted and the step is local state. One element, both behaviours, no duplicate markup.

**JavaScript off and the Content key.** The browser check is the point of the FR — it proves the path the
editor will use. Without JavaScript nothing can run it, so the key is stored unchecked and the editor's
content-source pill (E5) is where a wrong one shows. The server does not repeat the check: a server-side
200 would prove the wrong thing (no CORS, no mixed content, no browser).

**The codes → sentences table** lives in `connectMessage()` and nowhere else; the UI passes a code and a
host. `ghost_refused` covers any Ghost answer the map does not name (a 403, a 429, a 5xx — plain http is
`ghost_redirected` since Review 1, §38c corrected) —
"Ghost refused the connection (HTTP 403). Check the address and the keys." — DW-52 stands.

**The harness after the route.** `grants` is proved by `connect` itself (a stored key on the deployed site
is the pooler hop). `write-denied` stays a unit contract (`ghost-admin-rule.test.ts`) until E7's deploy path
makes a live write; `rotated` re-drives on Manage keys (3.6); `staff-removed` on E7's decline/removal. DW-54
records the three so nobody believes they are still executed live.

**The consent line** (helper-caption slot above Connect, S2b·2 `:136-138`): "Your Admin API key lets
Inflozo read everything Ghost Admin can — members' email addresses included. Inflozo only ever writes your
theme and your routes file." FR-C3's honesty rule and the spine's blast-radius rule, in one sentence each.

**The three values are state (Review 1).** React 19 resets a form after its action returns — `requestFormReset`
runs for every action, a refusal included — so the wizard's uncontrolled fields emptied on every server-side
refusal, and the owner's test step 5 ("paste the real Admin API key; change the last character of the Content
key") would have meant re-pasting all three. The values are `useState` and the fields controlled; nothing typed
is ever echoed back by the server to achieve it (the sign-in form's `defaultValue` pattern echoes an email; a key
is not an email, and the harness's `no-secret-leak` sweep would have caught one).

**The sheet closes from outside (Review 1).** A connect made from S11b redirects to `/sites`, the very route the
sheet lives on; Next re-renders it in place, and an imperatively opened `<dialog>` stayed open over the new card
with the keys still in its fields. `sites/page.tsx` keys the button on the number of cards, so one more card
remounts it closed — no signal from the action, no effect in the dialog, one attribute. Every open is a fresh
wizard for the same reason (`key={opens}`): the sibling sheet's "no stale banner" finding.

**What Ghost answers is checked (Review 1).** `GET /admin/site/`'s `url` becomes the card's `href` and `icon`
becomes `favicon_url`; `isHttpUrl` refuses anything that is not an http(s) URL, and the value is otherwise kept
as sent — the public url carries its trailing slash (§38a). An IP literal typed as the address is refused beside
`localhost`: the function's fetch stays on public names, and a Ghost on a bare IP has no certificate the
browser's own Content-key check would trust.

**Plain http is a redirect (Review 1).** With a key, both Ghosts answer a plain-http admin call with a 301 to
https; the chokepoint never follows a redirect with a bearer, so the customer reads `ghost_redirected`'s
sentence, the audit row carries `status: 301`, and no row is written. The warning under the field still comes
first, as it is typed.

**Two fixture states the harness makes itself (Review 1).** FR-C6's re-adoption needs a disconnected record and
the second-site path needs Pro; Story 3.5's Disconnect and Epic 12's billing do not exist. The harness sets
`disconnected_at` and `entitlements.state` through the service role on its own throwaway user and nothing else,
which is the same license the account-deletion harness uses to seed its fixtures — every claim about what the
USER can do still goes through the user's own session in the browser.

**Three departures from the frame, all the owner's, all at his test (R-80 as amended; the export itself is
never edited, R-74).** They are written here, in the files' own comments and in `DW-57` so a later story
cannot "correct" them back. (1) **"Where do I find these?" is a link**, not the bordered chevron row the
frame draws (`S2 Onboarding.dc.html:135-138`) — he read that row as a dropdown that would not open; his
words stay the link's words. (2) **The card puts "Connected" just above "Checked …"**, not on the pills'
line (`S11 Sites.dc.html:70-75`), and the pair sits closer together than the card's other rows. (3) **The
connect card is one width and one height at both steps**, not 480 then 560 — the frame draws two boxes and
he pressed one button between them.

**Why both steps are always drawn.** The sheet shrank 57px between step 1 and step 2 (measured on the
deployed site before the fix, §Spec Change Log), and a modal `<dialog>` is centred, so half of that came off
each edge and the page behind showed through in the band it stopped covering — his findings 1 and 2, one
cause. The fix is structural rather than numeric: both panes occupy the same CSS grid cell, so the box is
always the taller of the two, at every width, in the sheet and on the page, and however the sentences
change. The pane that is not the step is `invisible` — it must still take its space, which `hidden` would
not — and `inert`, which removes it from the tab order and from the accessibility tree without a line of
script, so a scripts-off browser gets the same behaviour. `innerText` and axe both skip a `visibility:
hidden` subtree, which is why the harness asks whether the fields are VISIBLE rather than present.

**The Sites top bar is the shell's, and that is the whole of finding 5.** The shell's field already posted
to whatever page it was drawn on and ⌘K already found whichever copy was visible; only the word "projects"
and a `path === '/'` gate were hard-wired. `BARS` replaces the gate with a table of the surfaces that have a
bar — the noun for the label, the placeholder and the phone's button, and the surface's own action — so
Sites is a row rather than a branch in four places, and a third surface is a row too. **No bell**: it is
Story 13.4's, on every top bar at once when there is a feed behind it, and the owner ruled it out of this
story at Question 4. `filterSites` is `filterProjects`'s twin, pure and tested, matching a site's title or
its address because the card shows both.

## Owner's manual test

On the live site after the Deploy run. You will make one test integration on your Ghost 6 test server
and can delete it afterwards. **Rewritten at the Fix run for the screens your seven findings changed** —
steps 1, 2, 8, 10 and 12 are the new ones.

1. **URL:** https://app.inflozo.com/sites · **Screen:** Sites, first visit · **Do:** look · **See:** no
   handshake now — a drawing of a browser window meeting a plug, **"One handshake and you're in."** under
   it, then "Connect your Ghost site — it takes about a minute.", then a coral **Connect site**. Above it
   all, a bar like the Projects one: a search box saying **Search sites…**, another **Connect site** on the
   right, a hairline under both. **No bell** — that arrives with the notifications centre (Story 13.4).
2. **Do:** press the middle **Connect site** · **See:** a window opens with "Connect your Ghost site — Same
   quick handshake as onboarding.", "1/2", three numbered steps and the screenshot you supplied. **Do:**
   press **Done — next**, and watch the window's edges · **See:** the window does **not** change size and
   does **not** move, and nothing behind it appears. Press **Back**: same again.
3. **Do:** on step 2, look at the top right, under the window's title · **See:** **Where do I find these?**
   as a plain underlined link — not a box with a chevron. Press it: it goes back to step 1. Press **Cancel**
   or Escape to close the window.
4. **URL:** https://ghost6.inflozo.com/ghost/#/settings/integrations · **Screen:** Ghost Admin · **Do:**
   Add custom integration → name it `Inflozo owner test` → Save · **See:** an API URL, an Admin API key
   and a Content API key. Keep this tab open.
5. **URL:** https://app.inflozo.com/sites · **Do:** **Connect site** → **Done — next** → type
   `ghost6.inflozo.com` in API URL, `abc` in Admin API key, the real Content API key, press **Connect** ·
   **See:** under Admin API key: "An Admin API key looks like `65a3f…:9c2b41d8e0f…` — an id, a colon, then
   a long secret." Nothing connected.
6. **Do:** paste the real Admin API key; in Content API key change the last character; press **Connect** ·
   **See:** under Content API key, almost instantly: "Ghost doesn't recognise this Content API key."
7. **Do:** paste the correct Content API key; press **Connect** · **See:** the window closes and the Sites
   page shows one card.
8. **Do:** look at the card · **See:** the name, and under it the address with a small **new-tab arrow**
   after it — press it and your site opens in a new tab. Then a line with **Ghost 6.58** and **0 projects**
   and nothing else on it. Then, at the bottom, green **Connected** with **Checked just now** directly
   beneath it, the two closer together than anything else on the card.
9. **Do:** in the top bar's search box type `ghost6` and press Enter · **See:** the card stays. Type
   `zzz` and press Enter · **See:** "No sites match “zzz”." Clear the box and press Enter to get it back.
   (Searching the address works too: try `inflozo.com`.)
10. **Do:** press **Connect site** in the top bar → **Done — next** → type `http://ghost5.inflozo.com` ·
    **See:** under the field, as you type: "Most Ghost sites use https:// — use that if yours does. Without
    HTTPS the editor can't load your live content." Change it to `https://ghost5.inflozo.com`, paste that
    server's own keys (make a test integration there the same way), press **Connect** · **See:** on a Free
    account: "Free includes 1 site. Pro connects up to 10." and no second card. On Pro: a second card
    `Ghost5 · … · Ghost 5.130`, laid out exactly like the first.
11. **Do:** Connect site → Done — next → `ghost6.inflozo.com` with its keys again → Connect · **See:**
    "ghost6.inflozo.com is already connected."
12. **Do:** on your phone, open https://app.inflozo.com/sites · **See:** the same card, one column, a
    **Connect site** button full width above it, and the magnifying glass in the top bar opens a search box
    that says **Search sites…**. Open the connect window and press **Done — next** · **See:** it still does
    not jump.
13. Cleanup, optional: in Ghost Admin, delete the `Inflozo owner test` integration. The card stays
    "Connected" until Story 3.7's daily check exists — expected.

## Owner's test findings

Tested on app.inflozo.com on 2026-09-08. **Seven findings**: six in the owner's first message, then a
second message the same day that **amended finding 5** and **added finding 7**. They are on the two connect
screens, the connected-site card and the Sites page's own top bar and empty state — every one of them a
surface this story built, and all are fixed in this story by the Fix run (R-80 as amended). **No sub-story
is needed.**

**One part of one finding is not this story's**: the notifications bell that finding 5's amendment asks for
belongs to **Story 13.4** (Epic 13, the notifications centre), and it is not built here. **Question 4** puts
that to the owner. The triage for each finding is on the finding.

**All seven were fixed at the Fix run, 2026-09-08**, and each has a step in the deployed-site harness that
would fail if it came back: 1 and 2 → `same-size` (measured before the fix at 520×665.7 then 520×608.5, and
one box after it); 3 → `find-link`; 4 and 6 → `card`; 5 → `sites-bar` and `search`; 7 → `first-run` and
`axe-empty`. Three of them are deliberate departures from the frame and are recorded in Design Notes, in
the files' own comments and in **DW-57**, so a later story does not put the frame's version back. See the
Fix entries in the Spec Change Log for the frozen text his findings overtake, and for the routine calls
taken rather than asked.

1. **Can we make both the windows same size?**

   *What was seen:* the connect sheet's two steps are different heights, so the box jumps when you press
   **Done — next**. Both are S11b's 520 wide, so it is the height. Most of the difference is the
   screenshot you supplied — 644×408 rendered across the sheet, against the frame's 130px placeholder
   box (`S11 Sites.dc.html:149`).

   *Whose:* **this story's** — `connect-wizard.tsx`, `connect-dialog.tsx`, and the screenshot this story
   added on your Question 2 ruling. The full-page pair has the same complaint by construction: the frame
   draws step 1 at 480 wide and step 2 at 560, so that jump gets fixed with it.

2. **Momentarily when I click next to navigate to the second window — I can see the project grid card in
   background.**

   *Whose:* **this story's** — `connect-dialog.tsx`. The step change is local state inside an open sheet,
   so nothing behind it should move at all. **To be reproduced on the deployed site at Fix before
   anything is changed:** the likely cause is finding 1's height jump uncovering the cards through the
   40% scrim, but a guess here would repair the wrong thing.

3. **In 2nd window — "Where do I find these?" looks like a dropdown. But it should be a subtle link at the
   top near title on right. On mobile it should appear below the title. Then remove the existing dropdown.**

   *Whose:* **this story's** — `connect-wizard.tsx`. It is a **deliberate departure from the frame**, which
   draws exactly the bordered box with a chevron that reads as a dropdown
   (`S2 Onboarding.dc.html:135-138`). Your test outranks the frame (R-80 as amended); the export itself is
   never edited (R-74); the departure is written into the spec's rules at Fix so a later story does not
   "correct" it back to the box. Your words stay the link's words: "Where do I find these?".

   *One routine call taken rather than asked:* in the sheet the wizard draws no heading of its own — the
   sheet's own title "Connect your Ghost site" sits above it — so the link goes at the top right of step
   2's body, which lands directly under that title; on the full page it goes at the right of "Now paste
   the three keys.". Below `tablet` it drops to its own line under the title, as you asked.

4. **Add a new tab arrow icon near the website URL in connected sites card.**

   *Whose:* **this story's** — `sites/page.tsx`. The kit has no external-link icon yet, so one is added to
   `components/kit/icons.tsx` in the same Tabler line the rest are drawn in, rather than inlined on the
   card.

5. **Add a top border below the connect site button just like we have in projects page.**
   **Amended by the owner the same day:** *"Make it similar to Projects page. Just the search bar goes out.
   The bell should stay as it is for notifications. If it is easy to implement search bar — I would like to
   keep the search bar too, but it will search the sites by title or URL."*

   *Whose:* **this story's, except the bell** — `sites/page.tsx` and `components/shell/shell.tsx`. Three
   parts:

   - **The bar and its rule — this story's.** S11a draws a 64px bar with `border-bottom:1px solid #E7E2DB`
     above the grid (`S11 Sites.dc.html:49`); the build dropped the whole bar because what sat in it
     belonged to the dashboard. It comes back, with **Connect site** on its right, exactly as Projects
     carries **New project** in its own.
   - **The search field — this story's, and it is easy.** The shell's field already posts to whatever page
     it is drawn on, and ⌘K already finds whichever copy of it is visible; the only thing hard-wired to
     the dashboard is the word "projects" in its label and placeholder and the `path === '/'` gate around
     the bar. It becomes **"Search sites…"** — the frame's own placeholder (`S11 Sites.dc.html:52`) — it
     matches a site's **title or its address**, "No sites match "…"" is the empty result, and it is drawn
     even when nothing is connected, which is what Projects does. `filterSites` sits beside
     `filterProjects` in `lib/`, pure and under test, because the match is now over two fields.
   - **The bell — NOT this story's. It belongs to Story 13.4, the notifications centre** ("the bell in the
     dashboard and editor top bars", Epic 13). There is **no bell anywhere in the app today** — not on
     Projects, not on Sites — because a control with nothing behind it is left out rather than drawn dead
     (UX-DR3, and `shell.tsx:24-26` says so in the code). **Ruled at Question 4: it stays out of this story.**

6. **Move the green connected status just above the bottom "Checked 5 minutes ago". And keep the meta data
   pills (Ghost 6.58, 0 projects) in their existing line only. Gap between "Checked 5 minutes ago" and green
   "connected" should be less. Finalise this card design for all site cards on that page.**

   *Whose:* **this story's** — `sites/page.tsx`. One card component draws every card on the page, so
   "for all site cards" is satisfied by changing it once. Also a **deliberate departure from the frame**,
   which puts Connected on the same line as the two pills (`S11 Sites.dc.html:70-75`), recorded for the
   same reason as finding 3.

   *And it binds the later stories that add to this card*, so they inherit this layout and not the frame's:
   the ⋯ menu and the Free-cap ghost slot (3.5), the Preview-only chip (3.3), the health badges and
   "Reconnect needed" (3.7). Written into `deferred-work.md` at Fix so it cannot be missed.

7. **Show an empty screen when no site is connected. Just like projects, we show an empty screen: "Every
   great site starts somewhere. / Yours starts with hundreds of gorgeous sections." Similarly, on sites too
   design an empty screen. Add a different title, subtitle and image. Below that Connect Site button. Once we
   click connect site button, then the two step window should open in a popup.**
   *(Added by the owner, 2026-09-08, after the first six.)*

   *Whose:* **this story's** — `sites/page.tsx`.

   *What changes:* today `/sites` with nothing connected **is** the handshake — S2b·1 fills the page and
   `/sites?step=keys` is S2b·2. That goes. In its place, the shape of the Projects empty screen
   (`page.tsx:114-145`): a drawing, a display-size title, a quieter subtitle, and a centred **Connect site**
   button that opens the same sheet the bar's button opens. `?step=` stops meaning anything on `/sites`.

   *The full-page handshake does not disappear, it stops being `/sites`.* It stays at `/sites/connect`,
   which is where the **Connect site** link goes with JavaScript off — so the no-JS path this story proved
   on the live site (`js-off` in the harness) still lands somewhere real. Its step 1 "Back" now goes to
   `/sites` in every case, since `/sites` is no longer the same screen.

   *Two departures recorded here so a later story does not undo them:*
   - **The experience spine currently says the opposite.** Its Sites row reads "Sites with none: the connect
     card as the whole page" (`EXPERIENCE.md:318`). **Amended at Fix** to the owner's screen, with this
     finding cited.
   - **No frame draws this screen.** The export has S11a, S11b and S11c for Sites and no empty state; it is
     **extrapolated from the nearest one that has** — S3b, the Projects empty screen — same components, same
     tokens, its own words and its own drawing (R-74). **Ruled at Questions 5 and 6:** "One handshake and you're in." / "Connect your Ghost site —
     it takes about a minute.", over a browser window meeting a plug.

   *Routine calls taken rather than asked, each matching Projects:* the top bar with its search field and
   **Connect site** is drawn on the empty screen too; the empty screen's own button is the second one, as
   S3b's is (UX-DR6); and the drawing is `aria-hidden`, the title the page's `<h1>`.

## Questions for the owner

### Question 1 — the very first screen a new customer sees (DW-19)

The design has a screen called **First Run** — "Let's make your Ghost site gorgeous." with three cards:
*Connect your Ghost site (Recommended)*, *Start from a starter*, *Blank canvas* — shown once after the
first sign-in. It is drawn and in the walkthrough, but no story builds it, so today a new customer lands on
the empty Projects page. **Example:** Maya signs up, clicks her magic link, and sees the three cards; she
presses Connect and is on this story's handshake. Nothing in this story depends on the answer.

1. **Its own small story at the end of Epic 3, after auto-brand (3.4) exists** — so the Recommended door
   leads all the way through connect → your brand → a project, and the starter door can say "not yet" with
   a reason until Epic 11. **(RECOMMENDED)**
2. **Inside this story now** — the Connect card works; the other two are greyed with one line each.
3. **Not built** — the empty Projects page is the first screen, and the ledger records that decision.

**Ruled: option 1 (owner, 2026-09-08).** Story 3.8 "First Run — the three doors after the first sign-in" is
added to `epics.md` after 3.7 and to `sprint-status.yaml` as backlog; DW-19 is closed by that ruling.

### Question 2 — screenshots of Ghost Admin for the handshake steps

Step 1 shows real screenshots of Ghost Admin (Settings → Integrations → Add custom integration → the new
integration's keys). Taking them needs a login to ghost6.inflozo.com's admin, and there is none in
`tools/probe/.env` — only API keys, which cannot open the admin screens. **Example:** a picture of the
Integrations page with the "Add custom integration" button, cropped, so the customer sees exactly where
to click. Until they exist the build shows the design's grey placeholder box, so Dev is not blocked.

1. **You add a staff login for the test server to `tools/probe/.env`** as `GHOST6_ADMIN_EMAIL` and
   `GHOST6_ADMIN_PASSWORD` — an Administrator user made for this, not your own — and Dev captures the
   three pictures with a headless browser, re-capturable whenever Ghost's admin changes. **(RECOMMENDED)**
2. **You take the three screenshots yourself** on ghost6.inflozo.com and tell me where you put them.
3. **Ship with the placeholder box** and revisit when Ghost Admin's look is final for launch.

**Ruled: option 2 (owner, 2026-09-08).** The screenshot is at
`_bmad-output/planning-artifacts/design/CustomIntegrationScreen.png` — one picture of the saved integration
showing its keys, which is what step 3 describes; the Code Map and Tasks now name it.

### Question 3 — what the consent line promises about writes (Review 1)

The sentence above Connect reads: "Your Admin API key lets Inflozo read everything Ghost Admin can — members'
email addresses included. Inflozo only ever writes your theme and your routes file." Inflozo's allowed writes
are four: upload a theme, activate it, upload the routes file, and — only when you say yes on the auto-brand
card (Story 3.4) — switch off Ghost's own announcement bar. The spec's rules say "the four writes are named in
the same breath"; the sentence names two things. Nothing in this story waits on the answer. **Example:** Maya
reads the line, connects, and later the auto-brand card asks "turn Ghost's bar off?" — she was not told at
connect that Inflozo could.

1. **Keep the sentence as it is** — "your theme" covers uploading and activating it, and the announcement bar
   is asked about separately, at the moment it happens, with its own yes/no (Story 3.4). Nothing changes.
   **(RECOMMENDED)**
2. **Name all four now** — "Inflozo only ever writes your theme, your routes file and — if you say so later —
   switches off Ghost's announcement bar." One clause longer, on a screen that already asks for a lot.
3. **Name three** — "your theme, its activation and your routes file" — and leave the bar to Story 3.4's card.

**Ruled: option 1 (owner, 2026-09-08).** The consent line stands as it is: "Inflozo only ever writes your theme
and your routes file." The announcement-bar switch is a separate, consented yes/no at the moment it happens
(Story 3.4). No code change — `ADMIN_KEY_CONSENT` in `lib/connect-rule.ts` already carries this sentence.

### Question 4 — the notifications bell on the Sites bar (owner's finding 5, amended)

You asked for the bell to stay on the Sites top bar. **There is no bell in the app** — not on Projects, not
on Sites, not anywhere. Claude Design does draw one on Sites (`S11 Sites.dc.html:56`), and the build left it
out on the rule this project works to: a button with nothing behind it is left out rather than drawn dead.
Its real home is **Story 13.4, the notifications centre**, which gives it a feed — deploy outcomes, site
health changes, Ghost compatibility notices, billing events — an unread badge, mark-all-read, and puts it on
**every** top bar at once. **Example:** Maya connects her site, presses the bell, and reads "Orbit Weekly
deployed — 2 minutes ago". None of that exists until Epic 13; today the panel would be empty with no way to
fill it.

1. **Leave the bell to Story 13.4.** Sites gets the same bar Projects has — search on the left, **Connect
   site** on the right, the rule underneath — and the bell arrives on every page at once when there is
   something behind it. **(RECOMMENDED)**
2. **Draw the bell now, on Sites only, doing nothing when pressed.** It is there when you look. It is a dead
   control until Epic 13, which is the one thing UX-DR3 exists to prevent, and Sites would be the only page
   with one.
3. **Draw the bell now on every top bar, opening an empty panel** that says Story 13.4's own sentence —
   "Nothing yet. Deploy outcomes land here even if you closed the tab." Honest and complete-looking, but it
   is a slice of Story 13.4 built early, and 13.4 then has to be told not to build it twice.

**Ruled: option 1 (owner, 2026-09-08).** The bell is left to **Story 13.4** and arrives in its own story
only, on every top bar at once. The Sites top bar this story builds carries the **search field** and
**Connect site** and nothing else; **no bell is drawn on any surface in this story**, and UX-DR3 stands
unbroken — the frame's bell (`S11 Sites.dc.html:56`) stays out until there is a feed behind it.

### Question 5 — the words on the empty Sites screen (owner's finding 7)

Nothing in the design export draws this screen, so its words are a fresh write in the voice of the Projects
one ("Every great site starts somewhere." / "Yours starts with hundreds of gorgeous sections."). **Example:**
Maya signs in on day one, opens **Sites**, and reads a bold line, a quieter line under it, and presses
**Connect site**.

1. **"Your Ghost site, meet Inflozo."** / *"Connect it once — everything after that happens here."*
   The closest to the Projects screen's voice: a warm line, then the promise. **(RECOMMENDED)**
2. **"Nothing connected yet."** / *"Point Inflozo at your Ghost site and we'll take it from there."*
   Plainer — says the state first, then what to do.
3. **"One handshake and you're in."** / *"Connect your Ghost site — it takes about a minute."*
   The shortest, and it borrows the handshake's own word and its own "about a minute".

**Ruled: option 3 (owner, 2026-09-08).** The empty Sites screen reads **"One handshake and you're in."**
with **"Connect your Ghost site — it takes about a minute."** beneath it. The title is the page's `<h1>` at
the Projects screen's own display size; the subtitle is its quieter line. It borrows the handshake's own word
and its own "about a minute", so the empty screen and step 1 of the wizard agree.

### Question 6 — the drawing on the empty Sites screen (owner's finding 7)

The Projects screen's drawing is a dashed page outline with one coral block and one marigold sparkle
(`page.tsx:117-134`). The Sites one is drawn in the same hand — same dashed line, one coral shape, one
marigold sparkle, 160×120 — and only its subject differs. **Example:** at a glance it should read "your site,
connected", not "a page".

1. **A browser window meeting a plug** — a dashed browser outline on the left, a small coral plug on the
   right, a dashed line joining them and the marigold sparkle where they meet. Reads as connecting.
   **(RECOMMENDED)**
2. **A globe with a dashed ring** — the globe is already the Sites icon in the left nav, so the screen and
   the nav item say the same thing. Reads as "a site on the web" more than "connected".
3. **Two cards joined by a dashed line** — one plain, one coral, the sparkle on the join. Reads as "two
   things linked", closest to the Projects drawing but the least specific about what.

**Also decided as routine, not asked** (each matches the Projects page exactly, which is what you asked for):
the search field is drawn on the empty screen too; the empty screen's centred **Connect site** is a *second*
button alongside the bar's, as S3b's is; ⌘K focuses it on Sites as it does on Projects; and the search
matches a site's title **or** its address, case-insensitively, on a substring.
**Ruled: option 1 (owner, 2026-09-08).** **A browser window meeting a plug**: a dashed browser outline on
the left, a small coral plug on the right, a dashed line joining them and the marigold sparkle where they
meet. 160×120, `aria-hidden`, drawn in the same hand and the same tokens as the Projects screen's
(`page.tsx:117-134`) — dashed `currentColor` at 1.5, one `fill-coral`, one `fill-marigold`.


## Verification

Run at Dev on 2026-09-08, Node 24 on `PATH` (`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`).
Every key is named by its variable and no value was printed.

**The gates, all green:**
- `pnpm check` (root: `eslint .`, `tsc --noEmit` in every package, `node --test '*.test.ts'`) --
  **PASS**, exit 0: 198 tests in `apps/web`, 0 failures, plus one per core package. `connect-rule`,
  `plan`, `csp`, `routing`, `server-wiring`, `app-routes`, `identity` and `tokens` included.
  (`apps/web` has no `check` script of its own; `check` is the root's, which is what CI runs.)
- `node --test connect-rule.test.ts` -- **PASS**, 9/9: `4.48.0` refused as `ghost_too_old` with its
  major and minor, `5.130.6` and `6.58.0` accepted, a missing version refused as `ghost_unreachable`;
  `orbitweekly.com` -> `https://orbitweekly.com` and four other spellings to one origin; `orbit
  weekly`, `ftp://…`, `localhost` and a bare word refused; every code in `CONNECT_MESSAGES` has a
  non-empty sentence and **none of them contains "expire"**; `at_cap` deliberately has none, and
  `siteCapSentence('free')` is `Free includes 1 site. Pro connects up to 10.`, composed from `PLANS`;
  the browser Content-key check calls
  `https://ghost6.inflozo.com/ghost/api/content/settings/?key=…` with `Accept-Version: v5.0`, answers
  `unknown_key` on 401, `skipped_http` **without fetching at all** on an `http://` address, and
  `unreachable` (never a throw) on a 500 or a network error.
- `pnpm build` (`next build`) -- **PASS**. Route table: `ƒ /app/sites` and `ƒ /app/sites/connect`
  both dynamic and inside the guard; `/api/ghost-admin/verify` **absent**. This gate is the one that
  caught change-log item 1 while `pnpm check` was green.
- `python3 tools/doc-audit.py --check` (twice) -- **PASS**, 0 warnings. The harness row's description
  is rewritten for its new subject; no new row (same path).
- `bash supabase/tests/run-rls-gate.sh` -- **PASS**, exit 0, schema unchanged (no migration in this
  story). Includes DW-44's five: the trigger is `security definer` with a pinned `search_path`; a
  rotation deletes the secret behind the ref it replaced **and only that one**; nulling a ref deletes
  its secret under a role that may not touch the vault; deleting a site takes both its secrets;
  deleting an account takes its sites' secrets. That last one is what the harness's `secret-gone`
  step reads on the live project.

**The real infrastructure, executed from this machine:**
- **Supabase** (live project, `SUPABASE_URL` + `SUPABASE_SECRET_KEY`), through
  `python3 tools/probe/run-verify-ghost-admin.py --check` -- **PASS**. §21j re-executed rather than
  remembered: `GET /rest/v1/decrypted_secrets`, `/rest/v1/secrets` and `/rest/v1/site_credentials`
  each answered **404**, and the positive control `GET /rest/v1/sites` answered **200**. So the bound
  the design rests on still holds: a leaked API key yields references, not keys. The same run
  confirmed every key present by name (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_DB_POOLER_URL`, `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST6_CONTENT_API_KEY`,
  `GHOST6_VERSION`, `GHOST5_URL`, `GHOST5_ADMIN_API_KEY`, `GHOST5_CONTENT_API_KEY`,
  `GHOST5_VERSION`), that playwright, axe-core and the app's own `postgres` driver resolve, that the
  audit route the app stamps is `sites/connect`, and that the cap sentence composed from `PLANS` is
  the one above.
- **Ghost T1** `ghost6.inflozo.com` (`GHOST6_URL`, `GHOST6_ADMIN_API_KEY`) -- `GET /ghost/api/admin/config/`
  with **no `Accept-Version`**, the shape the wizard validates in: **HTTP 200, `version` `6.58.0`**,
  which equals `GHOST6_VERSION` — the value the harness's `connect` step asserts `sites.ghost_version`
  against. `GET /ghost/api/admin/site/` **with no credential at all**: **HTTP 200**, `url`
  `https://ghost6.inflozo.com/`, `title` `Ghost6`, `icon` null — §38a re-executed, and the reason
  `site/` is never a validator.
- **Ghost T3** `ghost5.inflozo.com` (`GHOST5_URL`, `GHOST5_ADMIN_API_KEY`) -- the same two calls:
  `config/` **HTTP 200, `version` `5.130.6`** (= `GHOST5_VERSION`); `site/` with no credential **HTTP
  200**, `url` `https://ghost5.inflozo.com/`, `title` `Ghost5`, `icon` null.
- **Vercel, Resend and Dodo** -- not touched by this story and nothing here claims otherwise: it adds
  no email, no billing call and no deployment step. Vercel serves the deploy in the next phase.

**What Dev could not execute, and where it runs.** The whole browser half needs the story deployed —
`python3 tools/probe/run-verify-ghost-admin.py` against `https://app.inflozo.com` is the Deploy run,
and its docstring names every step in the order the run prints them (the Review's record below is the
run's own output). It creates one throwaway Free account,
connects T1 for real, reads `private.credential_audit`, `private.site_credentials` and `vault.secrets`
read-only through the transaction pooler (`SUPABASE_DB_POOLER_URL`), and deletes the account again
with the Admin-API user count as its control.

**Executed facts this rests on** (§38, 2026-09-08, re-confirmed above where it was cheap to):
`GET /admin/site/` answers with no key at all on both majors and its `version` is two parts, so
`config/`'s three-part one is what is stored; the Content API `settings` read answers 200 with
`access-control-allow-origin: *` and the preflight allows `accept-version`; a Content key Ghost never
issued is a 401 `Unknown Content API Key`; plain http to the admin API is a 301 to https when the call carries
a key — 403 only with none, which is the shape §38c had measured (corrected at Review). What is **not**
executed and cannot be: a Ghost 4.x — no such server exists, so the refusal is proved on the rule
alone, in `connect-rule.test.ts`, with `4.48.0` and `4.0.0` injected.

**Manual checks (owed at Review, not done here):**
- The three frames beside the built pages at 1440 / 834 / 390 (screenshots in the Review's findings).
- Owner's test above on the production domain, after Deploy.

**Review 1, 2026-09-08 — executed on the real infrastructure, every key by name, no value printed.**

- **Real-infra verifier, from this machine.** `run-verify-ghost-admin.py --check` PASS (every key present by
  name; §21j re-executed: 404 ×3 with `/rest/v1/sites` 200). **T1** `GET /ghost/api/admin/config/` with the
  key and no `Accept-Version` → 200, `version` `6.58.0` = `GHOST6_VERSION`; `GET /ghost/api/admin/site/` with
  no credential → 200, `url https://ghost6.inflozo.com/`, `title Ghost6`, `icon null`. **T3** the same → 200
  `5.130.6` = `GHOST5_VERSION`; `site/` → 200 `https://ghost5.inflozo.com/`, `Ghost5`, `null`. **Content API**
  `GET /ghost/api/content/settings/?key=…` with `Accept-Version: v5.0` and `Origin: https://app.inflozo.com`
  → 200 with `access-control-allow-origin: *` on both; the key's last character changed → 401 `Unknown Content
  API Key` on both with the CORS header still `*` (the control the browser check relies on). **Negative
  controls:** an unissued kid → 401 `UNKNOWN_ADMIN_API_KEY` on both; **plain http with the real key → 301
  `Location: https://…` on both, not the 403 §38c recorded** — no header → 403, `Authorization: Ghost garbage`
  → 400, so the answer is decided by authentication and the redirect is what the wizard's own call meets.
  **Supabase** `GET /rest/v1/sites?limit=1` → 200 `[]`; `/rest/v1/site_credentials?limit=1` → 404 `PGRST205`.
  **Deploy state:** CI run 34178929268 for `156f5d08` succeeded (`GH_TOKEN` from `GITHUB_TOKEN`); Vercel
  production's newest deployment `READY` at `156f5d08` (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`);
  `https://app.inflozo.com/sites` → 307 `/sign-in` (the guard; a made-up path → 404 as control),
  `/api/ghost-admin/verify` → 404, `/connect/integration.png` → 200 `image/png`, 29032 bytes = the file.
  Unit gates: 58/58 across the seven story test files; `pnpm check` exit 0, 198 web tests.
- **Harness run 1** (the Dev commit's harness against the deployed Dev build): `first-run` PASS, `keys-step`
  FAIL — 9 fields counted (the shell's two Sign-out forms and Next's hidden action inputs), `http-warned`
  PASS, then `browser` FAIL: `form button[type="submit"]` resolved to three elements. The product was right;
  the harness was not. Fixture deleted, users 5 → 5.
- **Harness run 2** (locators scoped to the wizard's form, a `dialog` step and `--shots`; still the Dev
  build): **all steps passed** — `first-run · keys-step · http-warned · malformed · bogus-key ·
  content-wrong-key · connect · dialog · audit · already-connected · at-cap · axe-sites · axe-connect ·
  user-gone · secret-gone · no-secret-leak`. T1 connected for real: `ghost_version 6.58.0`, `public_url
  https://ghost6.inflozo.com/`, `credentials_present {admin: true, staff: false, content: true}`, one
  `vault.secrets` row behind the ref; 3 audit rows (`config/` with a null `site_id`, `site/` with the id, the
  bogus key at 401), all stamped `sites/connect`, none holding a key; the sheet opened from the link and
  closed on Escape with 0 POSTs; the cap answered "Free includes 1 site. Pro connects up to 10." with no
  second row; axe zero violations at 1440 and 390 on both surfaces; 123 response bodies swept, no key in
  any; the secret gone with the account, users 5 → 5. **The frames beside the built pages** at 1440 / 834 /
  390 (`--shots`): S2b·1, S2b·2, S11a and S11b match — the 480 / 560 cards and the 520 sheet, the two bars
  and mono counters, the coral-tint discs, the served screenshot, the three mono fields with the frame's
  labels and placeholders, "Where do I find these?", the consent line, "Back" / "Done — next" / "Connect",
  the sheet's title pair and ✕, the card's disc, title, mono address, "Connected", version and projects
  pills and "Checked just now". At 834 the Sites grid keeps the dashboard's three columns and the address
  truncates — the dashboard's own shape, the app frames drawn at 1440 only; left as is.
- **Harness run 3** — the first review commit's build (`24b356bb`) deployed. The new `js-off` step (a raw
  request replay of the keys form) answered HTTP 500, and `http-connect` timed out: submitting a plain-`http://`
  address produced NO POST at all. Investigated on the deployed site (Review 2): the raw replay was an
  artifact, but the http-no-POST was a REAL bug — the wizard's re-entrant `form.requestSubmit()` after the
  browser check fired nested inside the same submit event when the check returned synchronously (a skipped
  `http://` never fetches), so React dispatched no action; https only worked because its real fetch delayed
  the resubmit. Fixed at root: the action is invoked directly with `startTransition(() => action(data))`
  (second review commit, `6597d223`), which also deletes the `verified`-ref dance.
- **Harness run 4** (the fixed build) confirmed the fix and the true plain-http behaviour: `http-connect`
  POSTs and NO site connects, and the audit shows the deployed function's own fetch received a **301**
  (not the 403 §38c had measured with no key) → `ghost_redirected`. The no-JS check found the connect FORM
  is progressively enhanced (`method=post`, an `action` attribute, React's `$ACTION_*` fields) but the authed
  shell paints content with a zero box until hydration, so a scripts-off submit can't be driven — a shell
  concern, recorded as DW-56, not this story's. `js-off` was recast to assert the PE wiring it can prove and
  `http-connect` to assert the audit-confirmed `ghost_redirected` (harness-only, no redeploy).
- **Harness run 5** (same build `6597d223`, corrected steps) — **all 28 steps passed**, exit 0:
  `keys · vault-off-rest · first-run · keys-step · http-warned · js-off · http-connect · malformed ·
  bogus-key · content-wrong-key · connect · dialog · sheet-submit · sheet-reopen · at-cap · re-adopt ·
  pro-connect-t3 · audit · axe-sites · axe-sheet · axe-connect · axe-keys · user-gone · secret-gone ·
  no-secret-leak`. T1 connected (`6.58.0`, public_url, one vault secret); T3 connected through the sheet on
  Pro (`5.130.6`, trailing slash normalised, the sheet closed on success, a second card); the disconnected
  record was re-adopted with a new vault ref and the old secret dropped (DW-44's replace path, live); the
  cap sentence was the app's own; the plain-http attempt was a 301 → ghost_redirected with no row; the audit
  showed one `config/` (null site_id) and one `site/` per connect, the bogus key at 401 and the http attempt
  at 301, every row stamped `sites/connect`, none holding a key; axe clean at 1440 and 390 over all four
  surfaces; both secrets gone with the account (`[0,0]`), 159 bodies swept with no key in any, users 5 → 5.
  **The frames beside the built pages** at 1440 / 834 / 390 (`--shots`) match S2b·1, S2b·2, S11a and S11b as
  in run 2. This is the run the review rests on.

### Fix run, 2026-09-08 — the owner's seven findings

Node 24 on `PATH` (`export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`). Every key is named by
its variable and no value was printed.

**The findings reproduced on the deployed site BEFORE anything was changed** — his finding 2 was triaged at
the Test run as *probably* finding 1 and marked "to be reproduced at Fix before anything is changed", so it
was. A throwaway GoTrue account (`fix32-repro-*@inflozo.com`, deleted at the end, its site row cascading
with it) was given one `sites` row through the service role — no Ghost connect needed to make the card that
puts "Connect site" on the page — signed in on `https://app.inflozo.com` from a generated magic link, and
Playwright measured the sheet's own `getBoundingClientRect` at each step:

| | step 1 | step 2 | |
|---|---|---|---|
| the sheet (S11b) | 520 × **665.7** at (460, **117.2**) | 520 × **608.5** at (460, **145.8**) | shrinks 57.2px; its top edge sweeps 28.6px DOWN |
| the page card | **480** × 694.7 | **560** × 661 | 80px wider, 33.7px shorter |

The card behind sat at y 80, height 145 — exactly the band the sheet's top edge crossed. **One cause, two
findings**, and the fix is structural rather than numeric: both panes share one CSS grid cell.

**The gates, all green:**
- `pnpm check` (root: `eslint .`, `tsc --noEmit` in every package, `node --test '*.test.ts'`) --
  **PASS**, exit 0: **200** tests in `apps/web` (198 at Review + the two the Fix adds), 0 failures, plus
  one per core package.
- `node --test connect-rule.test.ts` -- **PASS**, 11/11. The two new ones: `filterSites` matches by title,
  by host, by whole address and by the PUBLIC url, is case-insensitive, returns every row in order for an
  empty or blank query, takes the first of a repeated `?q=` and trims the query it hands back for
  "No sites match …"; and the empty screen's words are the owner's Question 5 ruling, asserted verbatim.
- `pnpm build` (`next build`) -- **PASS**. Route table unchanged and both routes still dynamic and inside
  the guard: `ƒ /app/sites` and `ƒ /app/sites/connect`; `/api/ghost-admin/verify` still absent.
- `python3 tools/doc-audit.py --check` (twice) -- **PASS**, 0 warnings. The harness row's description
  rewritten for the steps it gained; `INDEX.md`/`INDEX.html` regenerated by the first run, as designed.
- `bash supabase/tests/run-rls-gate.sh` -- **PASS**, exit 0. No schema change in this run; re-run because
  it is what CI runs and because the harness's cascade proof depends on DW-44's trigger — all five DW-44
  assertions green, including "deleting an account takes its sites' secrets out of the vault".
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- **PASS** against the live Supabase project
  (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`). §21j re-executed rather than remembered: `GET
  /rest/v1/{decrypted_secrets,secrets,site_credentials}` → **404, 404, 404** with the positive control
  `GET /rest/v1/sites` → **200**. Every key present by name; playwright, axe-core and the app's own
  `postgres` driver resolve; the audit route the app stamps is still `sites/connect`; and the app's own
  sentences evaluate — including the two this run adds, `SITES_EMPTY.title` = "One handshake and you're
  in." and `.sub` = "Connect your Ghost site — it takes about a minute.", which are the owner's Question 5
  ruling read out of `lib/connect-rule.ts` rather than retyped in the harness.

**The deployed site — the browser half.** _Recorded below once this Fix commit's CI deployment is READY;
the harness drives `https://app.inflozo.com` and cannot run against code that is not deployed (DW-7: CI
publishes, the push does not)._

### Deploy run, 2026-09-08

`Deployment: dpl_8nyQmkWSC14nhLMpeELCd8K6EKff` (`inflozo-kjzbpcfsq-umangkagathara.vercel.app`) — the CI
run for `4b36e0dc` (`git log` HEAD; the two commits since the review's `6597d223` touched only the spec,
`deferred-work.md` and the harness, no `apps/web` change) completed `success` (`gh run list --branch main`
with `GITHUB_TOKEN`: `check` and `rls` both passed, `deploy` ran), and `GET /v6/deployments` with
`VERCEL_TOKEN` and `VERCEL_TEAM_ID` shows it `READY` for `VERCEL_PROJECT`'s `production` target;
`GET /v13/deployments/{id}` shows its `alias` carrying `app.inflozo.com`, `www.inflozo.com` and
`inflozo.com`. A live sanity check from this machine: `https://app.inflozo.com/sites` → 307 to
`/sign-in` (the guard, unchanged), `https://app.inflozo.com/connect/integration.png` → 200
`image/png` 29032 bytes (the file), `https://app.inflozo.com/api/ghost-admin/verify` → 404 (the
deleted route). The harness's Harness run 5 above already exercised all 28 steps against
`app.inflozo.com` on the code this deployment now serves — the same code, since neither commit since
touched `apps/web` — so nothing there needed re-running. The owner's manual test below is the one
thing this run leaves open.
