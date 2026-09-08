---
title: 'Story 3.2 — The connect wizard: URL, integration guide, and the two keys'
type: 'feature'
created: '2026-09-08'
status: 'in-progress'
review_loop_iteration: 0
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
- [x] Run `## Verification

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
and its docstring names every step in order: `first-run · keys-step · http-warned · malformed ·
bogus-key · content-wrong-key · connect · audit · already-connected · at-cap · axe-sites ·
axe-connect · user-gone · secret-gone · no-secret-leak`. It creates one throwaway Free account,
connects T1 for real, reads `private.credential_audit`, `private.site_credentials` and `vault.secrets`
read-only through the transaction pooler (`SUPABASE_DB_POOLER_URL`), and deletes the account again
with the Admin-API user count as its control.

**Executed facts this rests on** (§38, 2026-09-08, re-confirmed above where it was cheap to):
`GET /admin/site/` answers with no key at all on both majors and its `version` is two parts, so
`config/`'s three-part one is what is stored; the Content API `settings` read answers 200 with
`access-control-allow-origin: *` and the preflight allows `accept-version`; a Content key Ghost never
issued is a 401 `Unknown Content API Key`; plain http to the admin API is 403 on both. What is **not**
executed and cannot be: a Ghost 4.x — no such server exists, so the refusal is proved on the rule
alone, in `connect-rule.test.ts`, with `4.48.0` and `4.0.0` injected.

**Manual checks (owed at Review, not done here):**
- The three frames beside the built pages at 1440 / 834 / 390 (screenshots in the Review's findings).
- Owner's test above on the production domain, after Deploy.
