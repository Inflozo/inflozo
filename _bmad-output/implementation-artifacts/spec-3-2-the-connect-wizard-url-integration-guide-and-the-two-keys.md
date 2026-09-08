---
title: 'Story 3.2 — The connect wizard: URL, integration guide, and the two keys'
type: 'feature'
created: '2026-09-08'
status: 'in-review'
review_loop_iteration: 1
baseline_commit: '3a530ebcec1adc5584999bbb52ca62374859c5f8'
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
  plain http → a 301 to https on both Ghosts when the call carries a key (corrected at Review — §38c's 403
  was measured with no key). §37 the 401 causes; §21m the blast radius; §21j Vault over REST.
- `_bmad-output/implementation-artifacts/deferred-work.md:491` DW-19 (First Run — Question 1), `:1134`
  DW-48 (closed at Dev), **DW-54** (added at Create: the three live proofs whose driver leaves with the
  route, and where each is re-driven).
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:107-117` (the
  surfaces and their frames), `:318` (Sites with none), `:697-716` (J1 steps 3–5).
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
