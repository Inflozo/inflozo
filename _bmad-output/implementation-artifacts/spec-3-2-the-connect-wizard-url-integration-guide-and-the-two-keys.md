---
title: 'Story 3.2 — The connect wizard: URL, integration guide, and the two keys'
type: 'feature'
created: '2026-09-08'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story a customer can connect their own Ghost site to Inflozo: they open **Sites**, follow
three numbered, screenshotted steps to create one "Inflozo" integration in Ghost Admin, paste the site
address and the two keys that integration shows, and press Connect. Inflozo checks the Admin key against
the real site on the server, checks the Content key from the browser, refuses a site older than Ghost 5
with a friendly "please update Ghost", and then shows the site on the Sites page as **Connected** with its
Ghost version. The Staff Access Token is not asked for — that comes at first deploy — so the site is
connected in the "partially credentialed" state the product treats as normal, and the same two steps open
in a window from the Sites page's **Connect site** button for the next site.

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
  through the user's own session, `disconnected_at is null`, newest first), S2b inline when there are
  none; `metadata` like the dashboard's (`page.tsx:32-35`); the search field and "New project" are the
  dashboard's alone (`shell.tsx:30-35`). The card: letter disc, title, public url as a link
  (`site_settings.public_url`, fallback `url`), "Connected", "Ghost {major.minor}", "Checked {relative}"
  from `settings_read_at`; the ⋯ button **absent** (3.5), "n projects" from `projects.linked_site_id`.
- `apps/web/app/(app)/app/(authed)/sites/connect/page.tsx` -- **new**: the full-page pair on its own
  route so the JS-off **Connect site** link has a destination; renders `ConnectWizard` with `step` from
  `?step=`.
- `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx` -- **new, client**: both steps in one
  component; `step` prop + optional `onStep` (the dialog passes it; the page lets the anchor navigate);
  `useActionState(connectSite)` on the keys form (`new-project-sheet.tsx:1-12` is the pattern, `Banner`
  for the form-level message, `TextInput`'s `error` prop for field errors — `input.tsx:13-40`); the URL
  field warns on `http://` as typed; on submit with JS the Content check runs first (`content-check.ts`)
  and a 401 blocks. Mono inputs (`mono`), the 4px progress bars, "1/2" / "2/2" in mono.
- `apps/web/app/(app)/app/(authed)/sites/connect-dialog.tsx` -- **new, client**: S11b — a `<dialog>`
  (`kit/dialog.ts` `sheet`, `openOnCancel`, `closeOnBackdrop`) around `ConnectWizard`; the opener is an
  `<a href="/sites/connect">` styled as S11a's coral button (`:57`) whose click opens the dialog instead.
- `apps/web/app/(app)/app/(authed)/sites/content-check.ts` -- **new, client, pure fetch**:
  `checkContentKey(url, key)` → `'ok' | 'unknown_key' | 'unreachable' | 'skipped_http'`;
  `AbortSignal.timeout(10_000)`; never throws.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- **new, `'use server'`**: `connectSite(previous,
  formData)` in `projects/actions.ts`'s shape (`:1-60`: `ActionResult`, `fail`, `logged` without user
  content, `signedIn`); zod schema over the three fields; `normaliseSiteUrl`; entitlement + count;
  existing-row lookup; `fetchWithKey` twice; `supabaseAdmin()` insert/update; `store()`; compensating
  delete; `revalidatePath('/app/sites')`; `redirect('/sites')` on success.
- `apps/web/lib/connect-rule.ts` + `apps/web/connect-rule.test.ts` -- **new, pure**: `normaliseSiteUrl`
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
- `tools/probe/run-verify-ghost-admin.py` -- **rewritten**, `run-verify-account-deletion.py:196-340`'s
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
  plain http → 403 on both Ghosts. §37 the 401 causes; §21m the blast radius; §21j Vault over REST.
- `_bmad-output/implementation-artifacts/deferred-work.md:491` DW-19 (First Run — Question 1), `:1134`
  DW-48 (closed at Dev), **DW-54** (added at Create: the three live proofs whose driver leaves with the
  route, and where each is re-driven).
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:107-117` (the
  surfaces and their frames), `:318` (Sites with none), `:697-716` (J1 steps 3–5).
- `supabase/` -- **no migration**: no schema change in this story. `bash supabase/tests/run-rls-gate.sh`
  still runs at Verification because the harness's cascade proof depends on 3.1's trigger.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/connect-rule.ts` + `apps/web/connect-rule.test.ts` + `lib/plan.ts` + `plan.test.ts` --
      the URL normaliser, the version verdict, the sentences, the site cap -- pure and green first
- [ ] `apps/web/csp.ts` + `csp.test.ts` -- `connect-src 'self' https:` -- the browser check is possible
- [ ] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `connectSite` -- validate, write, store,
      compensate, redirect
- [ ] `apps/web/app/(app)/app/(authed)/sites/{page,connect/page,connect-wizard,connect-dialog,content-check}.*`
      -- S2b·1, S2b·2, S11b, S11a's card -- the surface, from the frames
- [ ] `apps/web/public/connect/integration.png` -- the owner's screenshot, copied in -- "guided, screenshotted"
- [ ] delete `app/api/ghost-admin/verify/route.ts` + `server/ghost-admin/verify-queries.ts`;
      `server-wiring.test.ts` importer lists -- DW-48 -- the chokepoint's caller is the product
- [ ] `tools/probe/run-verify-ghost-admin.py` + `tools/doc-audit.py` row -- the harness retargeted at the
      deployed wizard -- R-82, re-runnable
- [ ] `deferred-work.md` (DW-48 closed, DW-54's status) + `epic-3-context.md` -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result by variable name

**Acceptance Criteria:**
- Given a signed-in account with no site, when it opens `/sites` at 1440, 834 and 390, then the page is
  S2b·1 and **matches the frame** (`S2 Onboarding.dc.html:78-102`: the 480 card, the two 4px bars with
  one coral, "1/2" mono, the 26px display headline, three 22px numbered discs in coral-tint, the
  screenshot box, "Back" and the 44px ink "Done — next"); "Done — next" leads to S2b·2 and **matches the
  frame** (`:110-142`: 560 card, both bars coral, "2/2", three 44px mono fields with the frame's labels
  and placeholders, the "Where do I find these?" row, "Back" and "Connect"); with JavaScript off the same
  two pages work and the form still submits
- Given the T1 keys, when Connect is pressed, then `private.credential_audit` shows an `admin_read` row
  for `config/` with `site_id` null and then rows for `site/` with the new `site_id`; `sites` has one row
  with `ghost_version` `6.58.0`, `content_key`, `site_settings.public_url = 'https://ghost6.inflozo.com/'`,
  `credentials_present = {content: true, admin: true, staff: false}`; a `vault.secrets` row exists behind
  `admin_key_vault_ref`; the browser is on `/sites` showing the card, which **matches the frame**
  (`S11 Sites.dc.html:61`) minus the ⋯ button; and no response body carried a `kid:secret`
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

## Spec Change Log

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
host. `ghost_refused` covers any Ghost answer the map does not name (a 403 on plain http, a 5xx) —
"Ghost refused the connection (HTTP 403). Check the address and the keys." — DW-52 stands.

**The harness after the route.** `grants` is proved by `connect` itself (a stored key on the deployed site
is the pooler hop). `write-denied` stays a unit contract (`ghost-admin-rule.test.ts`) until E7's deploy path
makes a live write; `rotated` re-drives on Manage keys (3.6); `staff-removed` on E7's decline/removal. DW-54
records the three so nobody believes they are still executed live.

**The consent line** (helper-caption slot above Connect, S2b·2 `:136-138`): "Your Admin API key lets
Inflozo read everything Ghost Admin can — members' email addresses included. Inflozo only ever writes your
theme and your routes file." FR-C3's honesty rule and the spine's blast-radius rule, in one sentence each.

## Owner's manual test

On the live site after the Deploy run. You will make one test integration on your Ghost 6 test server
and can delete it afterwards.

1. **URL:** https://app.inflozo.com/sites · **Screen:** Sites, first visit · **Do:** look · **See:** no list
   — a white card "First, a quick handshake." with "1/2", three numbered steps, the screenshot you supplied of the
   Inflozo integration with its keys, "Back" and a black "Done — next".
2. **URL:** https://ghost6.inflozo.com/ghost/#/settings/integrations · **Screen:** Ghost Admin · **Do:**
   Add custom integration → name it `Inflozo owner test` → Save · **See:** an API URL, an Admin API key
   and a Content API key. Keep this tab open.
3. **URL:** https://app.inflozo.com/sites · **Do:** press **Done — next** · **See:** "Now paste the three
   keys." with three fields: API URL, Admin API key, Content API key, and "Where do I find these?" below.
4. **Do:** type `ghost6.inflozo.com` in API URL, `abc` in Admin API key, the real Content API key, press
   **Connect** · **See:** under Admin API key: "An Admin API key looks like `65a3f…:9c2b41d8e0f…` — an id,
   a colon, then a long secret." Nothing connected.
5. **Do:** paste the real Admin API key; in Content API key change the last character; press **Connect** ·
   **See:** under Content API key, almost instantly: "Ghost doesn't recognise this Content API key."
6. **Do:** paste the correct Content API key; press **Connect** · **See:** the Sites page with one card:
   `Ghost6 · ghost6.inflozo.com · Connected · Ghost 6.58 · Checked just now`. The address is a link that
   opens your site.
7. **Do:** press **Connect site** (top right) · **See:** a window "Connect your Ghost site — Same quick
   handshake as onboarding." with the same steps. Press **Cancel**: it closes.
8. **Do:** Connect site again → Done — next → type `http://ghost5.inflozo.com` · **See:** under the field,
   as you type: "Most Ghost sites use https:// — use that if yours does. Without HTTPS the editor can't
   load your live content." Change it to `https://ghost5.inflozo.com`, paste that server's own keys (make
   a test integration there the same way), press **Connect** · **See:** on a Free account: "Free includes
   1 site. Pro connects up to 10." and no second card. On Pro: a second card `Ghost5 · … · Ghost 5.130`.
9. **Do:** Connect site → Done — next → `ghost6.inflozo.com` with its keys again → Connect · **See:**
   "ghost6.inflozo.com is already connected."
10. **Do:** on your phone, open https://app.inflozo.com/sites · **See:** the same card, one column, the
    Connect site button full width; the connect window's fields stay usable.
11. Cleanup, optional: in Ghost Admin, delete the `Inflozo owner test` integration. The card stays
    "Connected" until Story 3.7's daily check exists — expected.

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

## Verification

**Commands** (Node 24 on `PATH`: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`):
- `cd apps/web && pnpm check` -- expected: lint, types and every `node --test` file green, `connect-rule`,
  `plan`, `csp`, `server-wiring`, `app-routes` included; the verify route absent from the tree
- `cd apps/web && node --test connect-rule.test.ts` -- expected: `4.48.0` refused, `5.130.6` and `6.58.0`
  accepted, missing version → unreachable; `orbitweekly.com` → `https://orbitweekly.com`; every code in
  the I/O matrix has a sentence and no sentence contains "expired"
- `python3 tools/doc-audit.py --check` (twice) -- expected: green; the harness row updated, no new row
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, unchanged schema
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected: keys present by name (`GHOST6_*`,
  `GHOST5_*`, `SUPABASE_*`, `SUPABASE_DB_POOLER_URL`), playwright and axe resolvable, `vault-off-rest`
  404 ×3 with `/sites` 200
- `python3 tools/probe/run-verify-ghost-admin.py` (Deploy, against `https://app.inflozo.com`) -- expected:
  every docstring step PASS in order for T1 then T3; `secret-gone` true after the GoTrue delete; users
  before == after; no `kid:secret` in any captured response
- Executed facts this rests on (§38, 2026-09-08): `GET /admin/site/` with no key → 200 with `url`,
  `title`, `icon`, `version` (`6.58` / `5.130`, two parts — `config/`'s `version` is the one stored);
  Content API `settings` with `Origin` → 200, `access-control-allow-origin: *`, preflight allows
  `accept-version`; wrong Content key → 401 `Unknown Content API Key`; plain http to the admin API → 403
  on both. What is **not** executed and cannot be: a Ghost 4.x — the refusal is proved on the rule alone.

**Manual checks:**
- The three frames beside the built pages at 1440 / 834 / 390 (screenshots in the Review's findings).
- Owner's test above on the production domain.
