---
title: 'Story 5.24b — The sweep: accounts, sites and connections'
type: 'chore'
created: '2026-09-29'
status: 'in-review'
owner_test: pending
review_loop_iteration: 1
baseline_commit: '0b00f5d9476d6c4c79ce9898da67f92cf1d33f40'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story:
- A search on Projects or Sites that finds nothing offers a **Clear search** link.
- A search on Sites stays in place while you open and close a site's windows.
- An address with a path whose root holds no Ghost, such as `https://example.com/blog`, gets your sentence (R-219): "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet." It no longer blames Ghost. The address of a page on a site at the root still connects, as you ruled (R-226).

Out of sight:
- A sign-in ticket stops working the moment you sign out everywhere (R-223).
- The app checks that it is talking to your real database.
- A busy or down Ghost is no longer reported as Ghost refusing.
- Inflozo refuses to reach into private network addresses.
- Fixes that were only ever checked by hand are now checked by a machine.

On screen you will see only four things: the Clear search links, the kept search, the /blog sentence, and one corrected line in Manage API keys ("… Integrations → **Custom** → Inflozo → Regenerate").

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Group B of the sweep's triage (R-211) is the ledger's open entries about accounts, sites and connections. It was re-derived at this Create from `deferred-work.md` at `0b00f5d9` and matches this story's card exactly: DW-14, 25, 27, 29, 32, 40, 41, 47, 50, 52, 55, 57, 58, 59, 65, 67, 71, 74, 77, 81, 82, 83, 84, 85, 86, 90, 91, 92, 271 and 272.
- Each entry is either a small real fault or a claim that nothing executes.
- DW-74, DW-83 and DW-85 have had their code in place since Story 3.9, with the proof still owed, because the Ghost-admin harness cannot finish a run (DW-92).
- This Create found two more:
  - **DW-293:** the database still lets a signed-in user create a `sites` row directly, skipping connect.
  - **DW-294:** goes to Story 5.24d.

**Approach:** Close each entry by a change that makes its claim false, with a control that fails when the change is reverted (standing rule 2), or by the run its proof is owed. The order follows the dependencies:
1. **The Schema phase, first and alone (R-99):** R-223's session guard (DW-40) and DW-293's revoke.
2. **The harness's `--only` (DW-92)**, because most controls ride on it.
3. **The code.**
4. **The close.**

## Boundaries & Constraints

**Always:**

- **The ledger is the source.**
  - Dev re-derives Group B at HEAD first (Verification's first command). A verdict that no longer holds is re-made, never forced.
  - An entry closes only on evidence: a change whose control was seen red with the change reverted, a completed run, or the owner's ruling.
  - It closes as `status: done <date>` with a `resolution:` naming Story 5.24b and the evidence. **No entry is deleted or renumbered.**
- **The Schema phase is pushed first, alone (R-99).**
  - It is applied by hand through `SUPABASE_DB_POOLER_URL` in one transaction, and proved on production before any Dev code.
  - **If this machine's permission classifier refuses the apply, stop and ask the owner (R-83). Never hand the apply to a subagent** (Story 5.16).
- **The guard comes off in one statement:** `alter role authenticator reset pgrst.db_pre_request; notify pgrst, 'reload config';`. Run it at once if a live session's read fails after the apply.
- **Real infrastructure (R-82).**
  - Keys are handled only by variable name (`docs/project-context.md`).
  - Writes to production go to throwaway or fixture accounts, deleted afterwards; the account count is equal before and after.
  - `--only` runs write nothing to T1 or T3.
- **The owner's rulings are built as he worded them:**
  - R-219's sentence, verbatim;
  - R-220: Re-check keeps no wait;
  - DW-57: the Sites card's layout is his. Add to what is there; never restore the frame.
- **Every touched surface matches its frame (R-74). Every control that starts work says so (R-98). One name per thing (R-170).**
- Counts are derived (standing rule 4). Every rename ends with a grep for the old name (standing rule 7).

**Ask First:**

- **A closure bigger than its triage says:** stop. The entry is re-homed to one named later story, whose card gains its sentence with the DW id.
- Any write to a Ghost, any change to the Sites card's layout beyond what an entry names, and any design file.

**Never:**

- **No edit to the design export (R-74).** The corrected roll hint is a departure recorded beside `KEYS`.
- **No second SQL path for settings writes.** DW-65 is compare-and-set over the existing client.
- **No new dependency.** `node:net`'s `BlockList`, `node:dns` and `node:http` are the standard library.
- **No BMAD update (R-91).**

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A ticket whose session ended | an access token kept from before Sign out everywhere, on `GET`, `HEAD`, `PATCH` or `POST /rpc` at `/rest/v1` | `401`, `WWW-Authenticate: Bearer error="invalid_token"`, body code `session_not_found`; nothing read or written | — |
| A live ticket, the secret key, anon | the same requests | answered exactly as before the guard | — |
| Two writers on one site | the daily check and a Re-check land between each other's read and write | both writers' keys are in the row | three tries, then that write changes nothing and is logged |
| A Content save racing Disconnect | `saveKeys`' Content branch on a row whose `disconnected_at` was just set | refused; the disconnected row gains no key | `keys_failed` |
| A path typed at connect, no Ghost at the root | `https://example.com/blog/`, `example.com/blog`, `https://example.com/blog/ghost/#/site` | "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet." under API URL, before the plan's limit is counted; nothing stored (R-219, R-226) | — |
| A page's address on a site at the root | `https://ghost5.inflozo.com/welcome/` | the root is judged, as today: connected, or "ghost5.inflozo.com is already connected." (R-226) | — |
| No path | `https://example.com/`, `https://example.com/ghost/#/dashboard`, `https://example.com/?ref=x` | connects the root, as today | — |
| A private address | a name resolving to, or a `sites.url` holding, 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 100.64/10, 0.0.0.0/8, `::`, `::1`, fc00::/7, fe80::/10, or `::ffff:` with any of those | refused before any request, with `ghost_unreachable`'s sentence and an audit row whose `detail.blocked` is true | — |
| A busy or down Ghost | 429 or ≥ 500 on any Admin call | "Ghost didn't answer just now. Try again in a moment." | 403, 404 and 422 stay `ghost_refused` |
| A multi-field Manage keys post | two or three of `admin_key`, `content_key`, `staff_token` | "We couldn't save that just now. Nothing changed — try again in a moment."; no row, secret or `credential_change` written | — |
| Escape during a save | a Kit `Submit` inside the window is busy | the window stays open and does not reopen; ✕ and Cancel are `aria-disabled` | — |
| A search with no match | `/?q=zzzz` with a project; `/sites?q=zzzz` with a site | "No projects match “zzzz”. Clear search" / "No sites match “zzzz”. Clear search", the link being the page without `q` | — |
| A window over a filtered list | `/sites?q=ghost5` → Manage API keys or the brand window → ✕, Escape, Cancel, a save, a refusal | back on `/sites?q=ghost5` | Connect's landing drops `q` on purpose |
| No brand to offer | `/sites/brand?site=` naming a site with no brand, or no site, loaded directly | HTTP `404`, the in-shell not-found | no `site` in the request → the page's own guard |
| A starved purge | 25 due accounts that always fail, then one good one | the good one is purged in the same run; the run stops inside its budget | the 25 are logged, as today |
| Sign out while GoTrue fails | `/logout` answers 5xx | Sign out everywhere: a failed first call leaves this device signed in and says "try again"; after that, the landing follows the session actually left | — |
| A failed plan read | the entitlements read answers 500 | Free | one log line |

</frozen-after-approval>

## The triage

Derived at this Create from the ledger at `0b00f5d9`. Each entry was read in full and its plan (Story 5.24a's § The four stories after this one) was checked against the code at HEAD by four read-only passes. Where the plan was wrong, the correction is in the task and in Design Notes.

| Entry | Closed by | Its evidence lands at |
|---|---|---|
| DW-40 | R-223's session guard | Schema |
| DW-293 *(new)* | `authenticated`'s INSERT on `sites` revoked, in the same migration | Schema |
| DW-92 | `run-verify-ghost-admin.py --only` | Dev (the refusal) and Review (the runs) |
| DW-74, DW-83, DW-85 | their blocks completed through `--only` on the deployed site; DW-83 also gains its order-term control | Review |
| DW-65, DW-271, DW-84's second half | every `site_settings` and `credentials_present` writer goes through one compare-and-set | Dev |
| DW-272 | the ownership refusal executed, not read as text | Dev |
| DW-59 | connect's failure branches lifted and executed | Dev |
| DW-77 | both keys removed in one transaction | Dev |
| DW-81 | a multi-field keys post refused before anything is stored | Dev and Review |
| DW-52 | `ghost_unavailable` for 429 and ≥ 500 | Dev |
| DW-55 | R-219's sentence when no Ghost answers at the root (R-226) | Dev and Review |
| DW-58 | private addresses refused inside `fetchWithKey` | Dev and Review |
| DW-86 | both paths read in Ghost's admin source; the roll hint gains **Custom** | Dev |
| DW-50 | the database connection pinned to Supabase's own CA | Dev and Review |
| DW-71 | `Brand` narrows to what is read | Dev |
| DW-67 | the brand page's 404 decided above its boundary | Review |
| DW-82 | `?q=` kept through every window | Review |
| DW-84's first half | a window with a save in flight does not close | Review |
| DW-27 | Clear search on both no-match lines | Review |
| DW-25, DW-57 | the rules written where they govern | Dev |
| DW-29 | `readEntitlement` executed against a local server | Dev |
| DW-41 | both sign-outs land by the session actually left | Dev and Review |
| DW-47 | the purge excludes what it tried, inside a time budget | Dev |
| DW-32 | `named-aaguid` and `kill-mid-ceremony` | Review (production only) |
| DW-91 | the error page's title in `pnpm keyboard`; the card's `inert` in the passkeys harness | Dev and Review |
| DW-90 | the token's expiry read off GitHub's own header | Dev |
| DW-14 | the paid-plan setting removed from the tool | Dev |
| DW-294 *(new)* | owned by Story 5.24d, whose card names it | this Create |

## Code Map

**The Schema phase (DW-40, DW-293)**

- **The architecture originals.** `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/`:
  - `SCHEMA.sql`:
    - §0a `:31-33` revokes functions from anon and authenticated by default, so the guard's EXECUTE must be granted.
    - §0b `:36-60`: `private` is unexposed and anon and authenticated have no USAGE on it. That is why the guard cannot live there.
    - §11 `:1108` is DW-293's grant, and `:1265-1266` is the update grant.
    - `sites.updated_at` is at `:172`, trigger `sites_touch` at `:1014-1026`, and `touch_updated_at()` at `:65-66`.
  - `PRELUDE.sql` has `auth.users` only (`:4`) and the roles at `:9-22`; it has no `authenticator` and no `auth.sessions`.
  - `RLS-TEST.sql`:
    - a user context is `set role authenticated; set request.jwt.claim.sub = …` (`rls.sql:117-118`);
    - F3's sites block is `rls.sql:793-798`;
    - `:984-995` is DW-294's, not this story's.
- **The copies and the gate.**
  - The migrations, `YYYYMMDDHHMMSS_snake.sql`; the last is `20260926120000_paywall_template_key.sql`.
  - `supabase/tests/prelude.sql` and `supabase/tests/rls.sql` must be byte-identical to the originals (`run-rls-gate.sh:30-48`).
  - `run-rls-gate.sh` applies every migration (`:71-82`) and diffs `public` and `private` against `SCHEMA.sql` (`:94-104`).
- **Production facts** (Verification § Executed at Create):
  - PostgREST 14.5.
  - `authenticator` has no `pgrst.db_pre_request` set.
  - `auth.sessions` has RLS on with no policy, so the guard's owner must bypass RLS; `postgres` does.
- `tools/probe/run-verify-sign-out-everywhere.py`:
  - `everywhere` `:372-401`;
  - `rest-residual` `:403-410`: `record()` sets `ok: null` (`:149`) and it is printed as RECORD (`:551-554`);
  - `jwt-exp` `:414-428`;
  - the docstring `:48-54`; A1's token is captured at `:374`;
  - its catalogue row is `tools/doc-audit.py:411-426`.
- **The two timings.**
  - Save: `projects/[id]/sync/route.ts:44` (`currentUser()` `:47`, `rpc('sync_project_doc')` `:103`), called from `editor.tsx:1586-1595`.
  - Lock check-in: `projects/[id]/lock/route.ts:58` (`beat()` `:113-120`, the read `:170-176`), called through `lib/lock-client.ts:42-50`'s `askLock` every `HEARTBEAT_MS` (`lib/lock.ts:35`).
  - Throwaway setup: `tools/probe/seed-editor-project.mjs`; a session from a script by `generate_link` + `verifyOtp`.
- **The registers.**
  - `MEASUREMENTS.md`: the last section is §55.
  - `VERIFY-AT-BUILD.md`: `:51` is the GitHub token row.
  - `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`: the targets of R-219 (`:4848`) and R-223 (`:4894`).

**The site record's writers (DW-65, DW-271, DW-272, DW-84's second half)**

- **`apps/web/server/site-probe.ts`** imports `@/lib`, so `node --test` cannot load it (`ERR_MODULE_NOT_FOUND`, executed).
  - `probeSite`: owned read `:71-85`, write `:134-145`. Its read-then-write spans two Ghost calls.
  - `readSettings` `:192-243`: owned read `:195-204`, `call` `:205`, read-then-write `:216-235`.
- **`apps/web/app/(app)/app/(authed)/sites/actions.ts`:**
  - `siteOf` `:492-506` only parses a uuid. The comment at `:654-658` saying it "reads through the caller's own session" is false.
  - `writeSite` `:509-527`, `rowFor` `:530-545`, `answerPortal` `:563-582`, `answerPlan` `:590-617` (the latter deletes `plan_ask`).
  - `connectSite`:
    - the user-session read `:236-243`;
    - `connection` `:296-302`;
    - re-adopt `:306-317`, insert `:318-331` (the secret key);
    - the cosmetic `site/` write `:337-371` from `previousSettings` `:292`;
    - `store()` `:379-405`, whose whole-record restore is `:385-396`.
  - `disconnectSite` `:1057-1118`: the two `remove()` at `:1071-1072`, the all-false write at `:1091-1101`.
  - `keysSite` `:1184-1212`, a user-session read.
  - `saveKeys` `:1261-1413`: the empty check `:1287`. The Content branch's `credentials_present` write at `:1395-1404` has no `disconnected_at` guard.
  - `removeToken` `:1431`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts:154-165`: `recheckSite` imports `readSettings` (`:9`). `apps/web/server/site-health.ts:138-144` is `checkSite`'s owned read.
- `apps/web/lib/supabase/server.ts`: `supabaseServer()` `:33-35` (publishable key plus cookies); `supabaseAdmin()` `:87-93` (the secret key).
- `apps/web/server-wiring.test.ts`:
  - the `readSettings` slice `:353-374` breaks on the move;
  - the chokepoint importer regex `:376-427` misses relative specifiers;
  - the `{code}` log rule `:429-452`;
  - the pooler-reader rule `:292-297`.
- **Reuse.** `app/api/cron/purge-accounts/purge-rule.ts`'s `PurgeDeps` with `apps/web/purge.test.ts` is the shape for injected collaborators. postgrest-js encodes `updated_at`'s `+00:00` (`@supabase/postgrest-js@2.115.0`, `dist/index.mjs:1539-1541`).

**Connect and Manage keys (DW-52, 55, 58, 59, 77, 81, 83, 86)**

- **`apps/web/lib/connect-rule.ts`:**
  - `normaliseSiteUrl` `:30-56`: the IP-literal refusal is at `:54`; its overclaiming comment is `:48-53`.
  - `hostOf` `:80-83`; `filterSites` `:143-160`; `SITES_EMPTY.noMatch` `:184`.
  - `KEYS` `:262-`: the departures header `:246-260`, `staff.ask` `:318`, `rollHint` `:326-327`, `test.passed` "Inflozo reached your Ghost site."
  - `keysPopupPath` `:473`.
  - `CONNECT_MESSAGES` `:491-571`: `ghost_unreachable` `:507-508`, `ghost_refused` `:516-517` with its DW-52 comment `:513-515`, and `keys_failed`.
  - `keysFieldOf` `:593-600`; `CONNECT_MAX` `:629`.
- **`apps/web/server/ghost-admin/admin-rule.ts`:** `AuditDetail` `:51-67`, `parseCredential` `:74-85`, `ghostCode` `:226-236`.
- **`apps/web/server/ghost-admin/index.ts`:**
  - `TIMEOUT_MS` `:62`;
  - `store` (`credentials_present` `:167-171`);
  - `remove` `:214-261`: guard `:227`, flip `:230-234`, comment `:238-245`, audit `:246-258`;
  - `call` `:301-329`;
  - `fetchWithKey` `:336-423`: `fetch` `:382`, `redirect: 'manual'` `:389`, timeout `:390`, the unreachable throw `:399-411`, `ghostCode` `:422`;
  - `findSiteByAdminKeyId` `:457-475` (its order term `:470`);
  - `withStore` `:553`.
  - It is the only server path to a customer's Ghost (executed: `content-check.ts` and `live-client.ts` are browser-only).
- `apps/web/server/ghost-admin/db.ts`: comment `:30-34`, URL `:52`, `ssl: 'require'` `:64`.
- `sites/actions.ts`:
  - `FIELD_OF` `:181-187`; `refused()` `:196-200`;
  - validation `:210-229`, with the URL refusal `fail('url_invalid', …, 'url')` at `:229`;
  - `already_connected` `:247-248`, then the cap `:250-256`;
  - the comments naming 429 `:140-144`.
- `sites/connect-wizard.tsx`: the keys step's three fields "API URL", "Admin API key", "Content API key" (`:266-300`); "Connecting…" `:316`. `connect-dialog.tsx` and `connect/page.tsx` both render it.
- `sites/keys-panel.tsx`: refusal `:264-276` (comment `:269-270`), `wayOut` `:283-291`, the test result `:452-466`. Also `keys-content-form.tsx:121-126`, `:159-160`.
- `lib/health-rule.ts`: `HEALTH_REASONS` `:37-46`, `healthOf` `:83-95`.
- `components/kit/input.tsx:111-115`: the field's error slot.
- **Tests:**
  - `apps/web/ghost-admin-rule.test.ts:147-156`;
  - `connect-rule.test.ts`: `:63` (the `/ghost/` origin pin), `:282`, `:287-327` (every code has a sentence), `:433-449` (path order, kept), `:451-479` (the source-text undo test, replaced);
  - `health-rule.test.ts:70-79`;
  - `lib/first-run.ts` with `first-run.test.ts:58-61` (a pure page decision).
- **Ghost's admin, read in the npm tarballs:**

  | Ghost | Files | Labels |
  |---|---|---|
  | 5.130.6 | `package/core/built/admin/assets/ghost-060c0f303364be7ed22510336af44764.js` | Your profile |
  | | `…/admin-x-settings/modals-B5dtfzsB.mjs` | "Staff access token" |
  | | `…/admin-x-settings/index-BVxh86CD.mjs` | Advanced → Integrations; the Built-in and Custom tabs |
  | 6.58.0 | `…/assets/index-BOJzlYiz.js`, `user-detail-modal-595z1N5r.js`, `settings-KSWWQanQ.js`, `custom-integration-modal-CrGOI8IB.js`, `api-keys-Df6uv1dT.js` | the same labels |

**The brand (DW-67, DW-71)**

- **`apps/web/lib/probe-rule.ts`:**
  - `Brand` `:147-155`, `brandOf` `:209-222`, `hasBrand` `:232-240`.
  - `brandPopupPath` `:364`.
  - `storedSurfaces` `:604-617` reads `accent`.
  - Tests: `probe-rule.test.ts:330-345`, `:381-400`, `:402-426`, `:525`.
- **`sites/brand-screen.tsx`:** `gone()` `:74-77`; the reads and guards `:78-126`; the readers `:176-181`; the exits `:49`, `:75`.
- **The rest of the segment:**
  - `sites/brand/page.tsx:27-38` has no reads;
  - `sites/brand/loading.tsx` is the boundary;
  - `sites/brand-panel.tsx:146-153` is the ✕.
- **Precedents:**
  - `projects/[id]/layout.tsx:13-24`: a 404 above the boundaries, executed;
  - `(editor)/read.ts:62` `projectOf`: a `cache()`'d shared read;
  - `(dashboard)/layout.tsx:45-49` reads `SEARCH_HEADER` (`apps/web/routing.ts:38`, set at `proxy.ts:71`).
- **The one hypothesis:** does a server action's `redirect()` forward the POST's own header to the target's render? See `next/dist/server/app-render/action-handler.js:276-325` and `getForwardedHeaders` `:73-99`.
- `lib/style-pack.ts:21`, `:94-99`.

**Projects, the Sites list and its windows (DW-25, 27, 57, 82, 84)**

- **The no-match lines and the search.**
  - `(dashboard)/page.tsx`: `:49` reads `q`; `:164-165` is the inline no-match line. `lib/projects.ts:130-139` is `filterProjects`.
  - `components/shell/shell.tsx`: `SearchField` `:152` (`next/form` GET); `:164`; `:183`; `:192` hides the × on purpose; the phone toggle `:272`, `:396`.
  - `components/controls/icon-picker.tsx:307-313` is the Clear search idiom (`:311`).
- **The windows.**
  - `panel-link.tsx:88`.
  - `panel-modal.tsx:88-96`: the backdrop `:90`, `onClose` `:91`.
  - `components/kit/dialog.ts:74-84`.
  - `components/kit/submit.tsx:53-74`, `:135-136`: busy exists only as `aria-busy`.
  - `site-menu.tsx`: `:144` the brand row ("Use this site’s brand"), `:186`, the confirm `:226-248`.
  - `keys-screen.tsx:36`, `:82`, `:101`, `:105`; `brand-screen.tsx:17`.
- **The landings in `sites/actions.ts`:**
  - the constants: `SITES_URL` `:93`, `RECHECK` `:94`, `brandBase` `:111`, `DISCONNECT_FAILED` `:114`, `HEALTH_FAILED` `:118`, `keysBase` `:139`, `MOVED` `:154`;
  - `connectSite` `:474`;
  - `recheckPlan` `:635`;
  - `recheckConnection` `:684`;
  - `useBrand` `:746`, `:777`, `:784`, `:789`, `:792`, `:817`, `:858`, `:928`, `:940`, `:946`;
  - `skipBrand` `:976`;
  - `disconnectSite` `:1051`, `:1055`, `:1079`, `:1104`, `:1112`, `:1118`;
  - `keysGone` `:1169`;
  - `keysSite` `:1209`, `:1212`;
  - `saveKeys`, `removeToken` and `testConnection` through `keysBase`, `:1274-1476`.
- **The Sites list.** `sites/(list)/page.tsx`: the header `:41-104`, the `unread` banner `:207-209`, `:242-249`, the no-match line `:309-310`, Reconnect `:466`.
- **The guards and the skeleton.** `(authed)/layout.tsx:27-53` holds the guard's awaits; `(dashboard)/loading.tsx:1-5` holds the comment.

**Accounts and sign-in (DW-14, 29, 32, 41, 47, 50, 90, 91)**

- **`tools/probe/configure-supabase-auth.py`:**
  - the docstring `:23-24`;
  - `SOFT` `:137-141`;
  - the payload `:241`;
  - the 402 retry `:243-252`;
  - `--check`'s GET `:258`;
  - `--expect`'s `SOFT` branch `:266-268`, and "not a field this tool sets" `:270`;
  - the report `:294-299`.
- **Entitlements.** `lib/entitlement.ts:34-49` cannot load under node (`next/headers`); `lib/plan.ts:38-39` (`planFor`); `apps/web/plan.test.ts:22-31`.
- **Signing out.**
  - `sign-in/actions.ts`: `signOut` `:96-107` with the comment `:82-95`; the passkey guards `:142`, `:162`; the switched-off sentence `:135`.
  - `(authed)/account/actions.ts`: `ready()` `:134-137`; `signOutEverywhere` `:406-427` with the comment `:384-405`.
  - `sign-in/signed-out.ts:64` (`signOutPathFor`).
  - `apps/web/signed-out.test.ts`: `scopeOf` `:125-130` reads the first call only; `:141-148`; `:156-181`.
  - The installed `_signOut`: `@supabase/auth-js` 2.115.0, `dist/main/GoTrueClient.js:3415-3445`.
  - `@supabase/ssr` 0.12.6, `cookies.js:352-358`, `:396-429`.
- **The purge.**
  - `app/api/cron/purge-accounts/route.ts`: `dynamic` `:46`; the due read `:67-73`; the 500 `:74-77`; the deps `:79-102`; the run `:104-105`. There is no `maxDuration`.
  - `purge-rule.ts`, beside the route: the 300 s ceiling `:18-24`, `BATCH` `:25`, `PurgeDeps` `:66-71`, `runPurge` `:79-112`.
  - `purge.test.ts:172-250`.
  - `tools/probe/run-verify-account-purge.py:419-440` is unaffected.
- **`tools/probe/check-access.py`:**
  - tags `:13`; `say()` `:25-33`; `http()` `:44-61`, which returns no headers;
  - `main()` `:64-165`: no exit code, no GitHub call, a real email at `:121-132`, docker psql at `:71-76`.
- **`tools/probe/run-verify-passkeys.py`:**
  - `APP` `:75`: production only, no `--url`;
  - the virtual authenticator `:257-268`;
  - `auto-name` `:286`; `duplicate` `:366-380`; revoke and magic link `:393-457`; `revoked-signin`'s locator `:434-443`;
  - `run_browser` `:481`; the keys it requires `:558`; `axe` `:223`.
- **The passkey itself.**
  - The naming: `account/passkeys-card.tsx:178-196` → `lib/passkey-name.ts:23-34` (offset 37) → `account/actions.ts:187-190` (`nameFor`), with `lib/passkey-aaguids.ts`.
  - The switch: the `feature_flags` row `passkeys`, read by `lib/flags.ts:36-39`. `service_role` has SELECT only (`20260904120000_complete_schema.sql:1183`, RLS `:812`), so it is flipped over the pooler.
  - The pending card: `sign-in/sign-in-form.tsx:156-157` (`inert`, `aria-hidden`); `passkey-button.tsx:76-79`, `:120-124`.
- **The error page.**
  - `app/(app)/app/error.tsx:53-60` (the title at `:56`); `lib/harness.ts:5` (`HARNESS`).
  - Harness-only precedents: `harness/editor/page.tsx:7`, `harness/canvas/route.ts:22`.
  - `apps/web/app-routes.test.ts:54`, `:99-117` (`HARNESS_ONLY`); `apps/web/busy.test.ts:172-180` (`NO_SKELETON`); `tools/probe/run-verify-editor.cjs:5866-5871` (step 79's list).
  - `tools/keyboard/run-keyboard-gate.sh` runs `next dev` with `INFLOZO_HARNESS=1`; `playwright.config.mjs` holds its `testMatch`; `journey.spec.mjs` (`:158` and the manual-release hold at `:4186-4198`).

**The Ghost-admin harness (DW-92, 74, 83, 85)**

- **The structure.** `tools/probe/run-verify-ghost-admin.py`:
  - `BROWSER_JS` `:797-4319` is one IIFE with one `try` (`:1117-4304`) and shared closure state; `step()` and `record()` `:833-834` only push to an array;
  - `run_browser` `:4322-4382`: `limit = 2700` `:4348`, `capture_output=True` `:4349`, partial stdout recovery `:4350-4367`;
  - argparse `:4386-4397`.
- **The steps.**
  - The Python-side steps: `:4399-4504`.
  - `injection-live`, the only Ghost write: `:4534-4557` and `:4631-4655`.
  - Sign-in helpers `:993-1022`; `connect` `:1368-1378`; `pro-connect-t3` `:2664-2679`.
  - `rendered()` `:2186-2198`; `brand-none` `:2200-2225`; the `ownership` insert `:3147-3151`; `brand-ownership` `:3181-3328`.
  - `kidOf` `:3579`; `keys-forged` `:4030-4070`.
  - `moved-domains` `:4072-4219`: `movedAgain()` five times; the decoy seeding `:4138-4150`; the deletes `:4159`.
  - `keys-test-refused` `:4250-4258`.
  - `holding()` `:1880-1889`; `axeAt` `:956-976`, which runs at 1440 and 390 only.
- **Reuse.** `app_text()` `:629-753`; `PG_DIR` `:600`; `sql` `:843-845`; `BRAND_KEYS` `:4483`.
- **`tools/probe/run-verify-dashboard.py`:** `app_text()` `:91-114`, `overlayState` `:146-159`, `axeOver` `:186-192` (1440, 834 and 390), `:461`, `:471-477`.
- **Catalogue rows in `tools/doc-audit.py`:**

  | Tool | Row |
  |---|---|
  | `check-access.py` | `:248-250` |
  | `configure-supabase-auth.py` | `:376-383` |
  | sign-out-everywhere | `:411-426` |
  | account-purge | `:468-485` |
  | dashboard | `:652-685` |
  | ghost-admin | `:686-818` |
  | passkeys | `:819-831` |
  | keyboard gate | `:1040` |
  | `journey.spec.mjs` | `:1052` |

## Tasks & Acceptance

**Execution — the Schema phase, first and pushed alone (R-99, R-223):**

- [x] `supabase/migrations/20260929120000_session_guard.sql` — **new**, one transaction:
  - **`public.session_guard()`.**
    - Shape: `returns void`, `language plpgsql`, `security definer`, `set search_path = ''`, owned by `postgres`.
    - It returns at once when `request.jwt.claims`' `role` is not `authenticated`, or when its `session_id` is a uuid with a row in `auth.sessions`.
    - Otherwise it raises `sqlstate 'PGRST'`:
      - message: `{"code":"session_not_found","message":"Session from session_id claim in JWT does not exist"}`;
      - detail: `{"status":401,"headers":{"WWW-Authenticate":"Bearer error=\"invalid_token\""}}`.
    - **Both objects must be whole.** PostgREST 14.5 turns a `PGRST` raise that lacks `code`, `status` or `headers` into `500 PGRST121`. The examples on Supabase's own page lack them.
  - **Grants.** `revoke execute … from public; grant execute … to anon, authenticated, service_role`. PostgREST calls the guard as the request's own role.
  - **Wiring.** `alter role authenticator set pgrst.db_pre_request = 'public.session_guard'; notify pgrst, 'reload config';`, after the function is created. `NOTIFY` is delivered at commit.
  - **DW-293.** `revoke insert on public.sites from authenticated`. Connect writes `sites` through the secret key only (`sites/actions.ts:318-331`), and every harness seeds through the service role.
- [x] `SCHEMA.sql`:
  - Add the guard as a new section, with its reasons:
    - why `public`;
    - why a definer that bypasses RLS;
    - the `PGRST121` trap;
    - the one-statement removal;
    - what it does not cover: Storage and Realtime, which this app reaches only through the service role or not at all.
  - Replace §11's `sites` insert grant (`:1108`) with the revoke, and add a dated note.
- [x] `PRELUDE.sql` and `supabase/tests/prelude.sql`, byte-identical:
  - an idempotent `authenticator` role;
  - an `auth.sessions (id uuid primary key, user_id uuid not null references auth.users on delete cascade)` stub, with RLS enabled and no policy, as on hosted.
- [x] `RLS-TEST.sql` and `supabase/tests/rls.sql`, byte-identical, gain a Story 5.24b block:
  - **Claims.** With `request.jwt.claims` set:
    - a live `session_id` passes;
    - a deleted, a missing and a malformed one each raise `PGRST`, whose message parses to `code = session_not_found` and whose detail parses to `status = 401` with a `headers` object;
    - `anon` and `service_role` pass with no `session_id`.
  - **The catalogue:**
    - `pg_db_role_setting` holds `pgrst.db_pre_request=public.session_guard` for `authenticator`;
    - `prosecdef` is set, with a pinned `search_path`;
    - the owner is BYPASSRLS or superuser;
    - anon, authenticated and service_role have EXECUTE.
  - **DW-293.** A tenant's `insert into public.sites(user_id, url)` is refused with `42501`.
  - **Control:** with the migration withheld, the gate aborts at this block.
- [x] `tools/probe/run-verify-sign-out-everywhere.py` — `rest-residual` becomes **`rest-refused`**, an assertion:
  - **Before the press (the control):** A1's token reads A1's own `profiles` row (`200`, A1's `user_id`).
  - **After Sign out everywhere:** A1's and A2's old tokens both answer `401` with code `session_not_found`, on a read and on a write (a no-op `PATCH` of their own `profiles` row).
  - **After `control-local`:** A2's live token still reads, and the secret key still reads.
  - **Text that follows:** `jwt-exp` stays a record and no longer calls the hour "DW-40's window". The docstring (`:48-54`), the comments (`:403-405`, `:414-419`) and the catalogue row (`tools/doc-audit.py:411-426`) are updated.
- [x] **Apply and prove it on production, in this order:**
  1. **Before.**
     - Run the harness. `rest-refused` must FAIL with a `200`: that is its control.
     - Time 30 sequential lock check-ins and 30 saves on a throwaway account, and record the median and p95. Setup:
       - a session from `generate_link` + `verifyOtp`, as an `@supabase/ssr` cookie;
       - a project from `seed-editor-project.mjs`;
       - the requests `askLock` and `editor.tsx:1586-1595` make.
  2. **Apply** through `SUPABASE_DB_POOLER_URL`, then read back `pg_db_role_setting` and `pg_proc`.
  3. **Check at once.** A live session's `/rest/v1` read must answer `200`; **if it does not, remove the guard (Boundaries) and stop**. Then check that the secret key reads, and that `https://app.inflozo.com/` signs in and lists projects.
  4. **Run the harness again.** `rest-refused` must PASS.
  5. **After.** Repeat the same timings, and read `pg_stat_statements`' `mean_exec_time` for `select "public"."session_guard"()`.
  6. **Finish.**
     - `bash supabase/tests/run-rls-gate.sh` is green.
     - A throwaway session's direct `POST /rest/v1/sites` is refused.
     - The throwaway account is deleted, and the account count is the same as before.
- [x] **Registers, then the push:**
  - `MEASUREMENTS.md` §56: the guard on production — before and after, the timings, and the 401's body and headers as they arrive through Supabase's gateway.
  - `VERIFY-AT-BUILD.md`: a row saying that hosted PostgREST honours `authenticator`'s `pgrst.db_pre_request`, and that a platform reset would reopen DW-40 silently. `rest-refused` re-executes it on every run.
  - R-223's "built" target is ticked.
  - Commit and push `Story 5.24b - Schema - …` **on its own**.
  - **Done (2026-09-29), on production (PostgreSQL 17.6, PostgREST 14.5).**
    - **The gate.** `bash supabase/tests/run-rls-gate.sh` exits 0 with the block's four PASS notices. Three controls,
      each the same gate over a scratch copy: the migration withheld with HEAD's `SCHEMA.sql` aborts at the block's
      first assertion (`rls.sql:1717`, exit 3); the DW-293 revoke withheld from both files fails at `FAIL (DW-293)`;
      a raise whose detail lacks `headers` (PostgREST's `PGRST121` shape) fails the parse check.
    - **Before.** The harness's `rest-refused` FAILED with 200 (read) and 204 (write), `updated_at` moved. The timings
      (two runs of 30): lock check-in median 442.1 · 422.6 ms, save 568.5 · 467.0 ms.
    - **The apply was refused** for this machine by its permission check, so it stopped and asked (Question 2). The owner
      applied the migration through Supabase's SQL editor. Read back through the pooler: the setting, the definer's
      shape and ACL as the migration writes them, `prosrc` byte-identical to the file, `sites` INSERT gone.
    - **At once, on a throwaway account.** A live sign-in reads (200) and writes (204); an ended one is refused on GET,
      HEAD, PATCH and `POST /rpc/sync_project_doc` with 401 `session_not_found` and `WWW-Authenticate: Bearer
      error="invalid_token"`, intact through the gateway; the secret key and anon read; a direct `POST /rest/v1/sites`
      is 403 `42501` with no row; `https://app.inflozo.com/` signs in and lists the account's project. 13 accounts
      before and after.
    - **The harness after.** `rest-refused` PASSES, with every other step. The first three runs after the apply each
      stopped on a 60 s page-load timeout at a different navigation, around the deployment of `4e3fc60d` going live;
      a separate browser loaded the same pages in 0.7–2.1 s and the next two runs passed every step (§56 records all
      of it).
    - **After.** Lock check-in median 414.9 · 411.9 ms, save 526.2 · 535.5 ms — inside the spread before.
      `pg_stat_statements`: the guard's mean is 0.283 ms (518 calls) and 0.268 ms (72).
    - **Registers.** `MEASUREMENTS.md` §56; `VERIFY-AT-BUILD.md` item 59; R-223's built target ticked; DW-40 and DW-293
      closed; and, propagated beyond the task list, `RESTORE-RUNBOOK.md` step 3b — no schema dump carries a role
      setting, so a restore re-wires the guard, or the RLS proof refuses it.

**Execution — Dev, the harness filter first (DW-92, DW-83):**

- [x] `tools/probe/run-verify-ghost-admin.py` — **`--only <block,…>`**:
  - **A registry of the blocks that can run alone,** each naming its seeds:
    - `brand-none`: sign-in and T1;
    - `brand-ownership`: sign-in, T1 and the stranger's row;
    - `moved-domains`: sign-in, Pro and T3;
    - every block that holds a step this story adds or changes: DW-52, 55, 58, 67, 71, 81, 82, 84, 86.
  - **Seeds** connect from an empty account through `/sites/connect?step=keys` (`fill`, `submit`, `s2cHeading`, `skipS2c`). Never through `pro-connect-t3`'s `text=Connected` path.
  - **Those blocks become functions,** called by both the full sequence and `--only`. `rendered` (`:2186`), `kidOf` (`:3579`) and the stranger insert (`:3147`) are hoisted.
  - **Streaming.** `step()` and `record()` print a line as each step lands, and the parent streams the child through a line loop with a kill timer, instead of `capture_output`.
  - **Safety.** An unknown name exits `2` before any key is read. `--only` never runs `injection-live`, so it writes nothing to T1 or T3.
  - **The catalogue row** (`tools/doc-audit.py:686-818`) gains the `--only` line.
  - **Control:** `--only no-such-step` exits non-zero.
- [x] **DW-83:** its control goes inside `moved-domains`, while the seeding exists (after `:4155`):
  - it runs the product's query (`index.ts:463-471`) without its first order term, read-only, on the harness's `sql`;
  - it must return the NEWER disconnected record, and with the term, the older live decoy.

**Execution — Dev, the site record's writers (DW-65, DW-271, DW-272, DW-84's second half):**

- [x] `apps/web/server/site-settings.ts` — **new**, with relative imports and `import type` only, so that `node --test` can load it:
  - **`patchSite(admin, { siteId, userId }, patch)`** *(the Review of 2026-09-29 corrected this line to what Dev built; the departure is recorded under Verification)*:
    - It reads the row's `site_settings, credentials_present, capability_source, disconnected_at, updated_at`.
    - It calls `patch(row)`, which may return `null` to refuse.
    - It updates with `.eq('updated_at', row.updated_at).select('id')`. If no row matches, it re-reads and re-patches: three tries in all, then it changes nothing and logs `{code}`.
    - `updated_at` is `sites_touch`'s per-transaction `now()`, bumped by every write. No new column is needed.
  - **`rereadSettings({ admin, call }, userId, siteId)`** is `readSettings`' body, moved: the owned read with `.eq('user_id', …)` first, then `call`, then the write through `patchSite`.
- [x] **Every writer goes through `patchSite`:**
  - `probeSite`, keeping its owned read before the Ghost calls; it is `recheckPlan`'s only ownership gate.
  - `readSettings`, now a wrapper passing `supabaseAdmin()` and `call`.
  - `answerPortal` and `answerPlan`, whose preconditions are re-checked inside `patch`.
  - Connect's cosmetic `site/` write (`:337-371`).
  - The Content save's `credentials_present` (`:1395-1404`), whose `patch` refuses a disconnected row.
  - **Named exceptions:** connect's whole-record restore (`:385-396`) and its insert or re-adopt write whole records by design.
  - **The false comment** at `:654-658` is corrected.
- [x] `apps/web/site-settings.test.ts` — **new**. Its fake admin evaluates `.eq` filters against one stored row owned by user A:
  - a second writer lands between read and write → both keys survive; with the `updated_at` filter dropped → red;
  - three contended tries → it gives up having written nothing;
  - the Content patch on a disconnected row → refused;
  - `rereadSettings` for user B never calls `call`; with the owned read placed after `call`, or its `.eq('user_id')` dropped → red.
- [x] `apps/web/server-wiring.test.ts`:
  - the `readSettings` slice (`:353-374`) retargets `site-settings.ts`;
  - the chokepoint importer rule (`:376-427`) matches relative specifiers too;
  - **a new rule:** no write of `site_settings` or `credentials_present` outside `site-settings.ts`, except the named exceptions. It matches on value-position keys, `writeSite(…)`, `.update(kept)`, `.update(connection)` and `.insert({…connection})`, with a planted control that fires on HEAD's `sites/actions.ts`.

**Execution — Dev, connect and Manage keys:**

- [x] **DW-59:**
  - **New in `lib/connect-rule.ts`:**
    - `KEPT`, from which the select at `sites/actions.ts:241` is built;
    - `siteWrite(…)`, which builds `connection` and the cosmetic patch, with the `isHttpUrl` guards and `settings_read_at`;
    - `storeOrUndo(existing, { store, restore, remove })`.
  - `connectSite` calls them.
  - **Tests.** `connect-rule.test.ts:451-479` becomes executing tests: swapped branches → red; a key `siteWrite` emits that is not in `KEPT` → red. `:433-449` stays.
  - **The Sites list's `unread` banner** takes its decision from a pure function, tested the way `showsFirstRun` is.
  - Do this together with DW-65, which changes the same write.
- [x] **DW-77:**
  - `remove(siteId, kinds)` clears every named kind inside ONE `sql().begin`, keeping the `ref is not null` guard and the per-kind conditional audit row (`audit(…, tx)`).
  - `disconnectSite` makes one call with both kinds; `removeToken` makes one with `staff`.
  - The comments at `index.ts:238-245` and `actions.ts:1057-1069` follow.
  - **Control** (`server-wiring.test.ts`): one `remove(` in `disconnectSite` naming both kinds, and one `begin(` in `remove`'s body around the loop. Moving it inside the loop → red.
- [x] **DW-81:**
  - `oneCredential(form)` counts the credential fields present.
  - `saveKeys` refuses more than one with `keys_failed`, before the empty check (`:1287`) and before any read or write.
  - **Controls:**
    - `connect-rule.test.ts`, using Node's `FormData`: every single field passes, and any two are refused;
    - a harness step on the caller's own T1 row posts two fields and lands on `?keys=…` with the sentence; the `sites` row, `private.site_credentials` and `credential_change` are unchanged.
- [x] **DW-52:**
  - `ghostCode`: `429` and `≥ 500` become `ghost_unavailable`; every other non-401 status stays `ghost_refused`.
  - `CONNECT_MESSAGES.ghost_unavailable: () => "Ghost didn't answer just now. Try again in a moment."`, shown under whatever field `ghost_refused` uses today (`FIELD_OF`, `keysFieldOf`).
  - `HEALTH_REASONS` is unchanged, so the daily check stays undecided on it.
  - **Tests:** `ghost-admin-rule.test.ts:147-156` in both directions; `connect-rule.test.ts:282` and `:303-313`; `health-rule.test.ts:70-79`.
  - **Propagation:**
    - `keys-test-refused` types a 403, plus a new `ghost_unavailable` vector;
    - the comments naming 429 under `ghost_refused` are corrected: `actions.ts:140-144`, `keys-panel.tsx:269-270`, `connect-rule.ts:513-515`.
- [x] **DW-58:**
  - **`blockedAddress(ip)`** in `admin-rule.ts` is pure, over `node:net`'s `BlockList`. It blocks the I/O matrix's ranges, and judges an `::ffff:` address by its IPv4.
  - **In `fetchWithKey`**, before the fetch:
    - it looks the host up with `dns.lookup(host, { all: true })`, bounded by `TIMEOUT_MS` through `lib/with-timeout.ts`;
    - any blocked answer throws `ghost_unreachable` with `detail.blocked: true` (`AuditDetail` gains the field), plus a `{code}` log line.
  - **Why here:** it sits in `fetchWithKey`, not in `normaliseSiteUrl`, because every Admin fetch passes through `fetchWithKey`, and a `sites.url` could reach it without passing through `normaliseSiteUrl` (DW-293).
  - **Comments.** `normaliseSiteUrl`'s comment (`:48-53`) stops overclaiming. A `ponytail:` comment names the ceiling — the fetch resolves the name again (DNS rebinding) — and the upgrade: `https.request({ lookup })`, pinned to the checked address.
  - **Controls:**
    - `ghost-admin-rule.test.ts` vectors, blocked: `127.0.0.1`, `10.0.0.1`, `169.254.169.254`, `100.64.0.1`, `0.0.0.0`, `::1`, `fc00::1`, `fe80::1`, `::ffff:127.0.0.1`;
    - allowed: `8.8.8.8`, `::ffff:8.8.8.8`, `2606:4700::1111`;
    - a harness connect to `https://127.0.0.1.nip.io`, whose audit row carries `detail.blocked`, while T1 connects. HEAD already fails that connect as unreachable, so the sentence alone proves nothing.
- [x] **DW-55 (R-219, R-226 — the owner's Question 1, option 1):**
  - **`pathOf(typed)`,** new in `lib/connect-rule.ts`, returns the typed path with any trailing `/ghost…` segment, query and hash dropped, or `''` when there is no path.
  - **The new code `path_unsupported`,** shown under API URL: `(path) => \`Inflozo connects a Ghost site at the root of its address — ${path} isn't supported yet.\``.
  - **When it fires (R-226).** After `already_connected`, and when a path was typed, the root's `config/` is asked before the plan's limit is counted. A `404` there becomes `path_unsupported`; any other answer carries on exactly as today, so a page's address on a site at the root still connects. Without a path, nothing changes.
  - **The decision is pure,** beside `pathOf`: a typed path with a `404` at the root gives `path_unsupported`; a `200`, any other answer, or no path carries on.
  - `normaliseSiteUrl` itself is unchanged; it also serves `hostOf`, `content-check.ts` and the editor's `read.ts`.
  - **Tests:**
    - `pathOf` vectors: `/blog`, `/blog/`, `example.com/blog` and `/blog/ghost/#/site` → `/blog`; `/`, `/ghost`, `/ghost/#/x` and `?ref=x` → `''`;
    - the decision both ways;
    - `:287-327` holds the new code's sentence.
  - **Harness** (Review, on the deployed site): a connect to `https://example.com/blog` answers the sentence and stores no row; a connect to T1 by a page's address (`https://ghost6.inflozo.com/<a post's slug>/`) connects T1's root — the positive control.
  - DW-55 closes citing R-219, R-226 and PRD Appendix G.
- [x] **DW-86:**
  - The two wayfinding sentences are read against Ghost's own admin at 5.130.6 and 6.58.0:
    - `KEYS.staff.ask` is right on both majors;
    - `KEYS.rollHint` becomes "To roll keys: Ghost Admin → Settings → Integrations → Custom → Inflozo → Regenerate. Old keys stop working the moment you regenerate."
  - Each sentence cites its tarball files beside it.
  - The departures header records a third departure, from `S11 Sites.dc.html` (S11d `:232`) and `S11e`.
  - `MEASUREMENTS.md` §58 records the labels on both majors.
  - `connect-rule.test.ts` pins both sentences.
- [x] **DW-50:**
  - **The change.** `ssl: { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true }`.
    - The PEM is inlined from the owner's `supabase/prod-ca-2021.crt`: Supabase Root 2021 CA, valid until 2031-04-26.
    - The file is committed as the constant's provenance. A runtime read would not ship (DW-269).
    - postgres.js 3.4.9 then checks both the chain and the host name.
  - **Housekeeping.** The comment at `:30-34` is rewritten. `VERIFY-AT-BUILD.md` gets a row for the expiry, and `MEASUREMENTS.md` §57 records the handshake.
  - **Controls:**
    - `run-verify-ghost-admin.py --check` connects with the PEM read out of `db.ts` (passes), and with `tls.rootCertificates[0]` (refused, `SELF_SIGNED_CERT_IN_CHAIN`);
    - the deployed half is Test connection on a connected site (Review, and the owner's step 4).
- [x] **DW-71:**
  - **`Brand` and `brandOf` keep `accent`, `logo` and `nav`.** `icon`, `cover`, `description` and `title` have no reader: the project's name is `sites.title`.
  - `hasBrand` checks every field `Brand` promises.
  - `BRAND_KEYS` becomes `accent_color, logo, navigation`.
  - `style-pack.ts:21` says who reads what.
  - **Tests.** `probe-rule.test.ts:330-345`, `:381-400` and `:402-426` follow, plus three vectors, each seen `true` at HEAD and `false` after. `{accent: 42}` is already false at HEAD, so it is no control.
  - Rows already stored keep the old keys until their next brand read. Nothing reads them.
- [x] **DW-67:**
  - **`sites/brand/layout.tsx`** is new and sits above the segment's `loading.tsx`. It reads `site` from `SEARCH_HEADER`, and **only when one is there**:
    - reads the row through a `cache()`'d reader it shares with `BrandScreen`;
    - calls `notFound()` for no row or no brand: a real `404`.
  - **`BrandScreen` keeps its own guard.** The popup never passes through this layout, and a navigation that changes only the query does not re-run it.
  - **Control:** `brand-none` asserts `404` for the direct load and for the forged `?site=`.
    - Updated with it: `:2215`, the docstring `:239-250`, the comment `:2171-2185`, and `run-verify-dashboard.py:461`.
    - Every connect in the run must still land on S2c. That is the positive control for the header a server action's `redirect()` forwards, which is a hypothesis until executed.

**Execution — Dev, Projects, the Sites list and its windows:**

- [x] **DW-27:**
  - Both no-match lines end with a **Clear search** link to the page without `q`: `<Link href="/">` and `<Link href="/sites">`, in the icon picker's link classes.
  - The Projects sentence moves into `lib/projects.ts`, beside `filterProjects`.
  - There is one `CLEAR_SEARCH` word, also used by `icon-picker.tsx:311` (R-170).
  - The field keeps no ×.
  - **Control:** a `run-verify-dashboard.py` step that clicks through:
    - `/?q=zzzz`, after `cap` makes a project;
    - `/sites?q=zzzz`, with a `sites` row seeded through the service role (without it, the step tests the empty screen);
    - then `axeOver` at 1440, 834 and 390.
- [x] **DW-82:**
  - **`sitesPath(q?, extra?)`,** new in `lib/connect-rule.ts` and built with `URLSearchParams`, is the one way to `/sites`. It is used by:
    - `brandPopupPath` and `keysPopupPath`, which carry `q`;
    - `PanelLink` and `PanelModal`, through `useSearchParams()`;
    - both panels' ✕ and Cancel;
    - the popup screens' render-time exits;
    - every action landing, through one `listQuery()` that reads `q` from the action's own request (`SEARCH_HEADER`).
  - **The exception is Connect's landing** (`:474`): the new card could be filtered out.
  - **Control:** a harness block searches, opens each window, closes it by ✕, Escape, Cancel and a save, and checks that `?q=` survives each close.
- [x] **DW-84:**
  - While any `[aria-busy="true"]` is inside the dialog:
    - `onCancel` prevents the close;
    - the backdrop does nothing;
    - a `MutationObserver` (`attributeFilter: ['aria-busy']`) sets `aria-disabled` on ✕ and Cancel and refuses their clicks.
  - One fix covers the keys and brand windows.
  - A `ponytail:` comment names the ceiling: Chromium cancels one Escape per user activation.
  - **Control:** a harness step holds the save's POST, presses Escape and releases; the window neither closes nor reopens. **Run it on HEAD first.**
- [x] **DW-57:** the header of `sites/(list)/page.tsx` opens with the rule itself:
  - the pills' line carries metadata only;
  - the state line carries the state, its timestamp and the Preview-only chip, and sits beside Connected only where the card can hold it, never on a wider grid (the owner, Story 3.3 Question 2);
  - the ⋯ at the header row's top right is the one place the card's actions live;
  - a story adds to this layout and never restores the frame's.

  The "OBEYED DW-57" pointers aim at the rule, and DW-57 closes citing it.
- [x] **DW-25:** `(dashboard)/loading.tsx:1-5` is made to say what is true:
  - it covers soft navigations;
  - on a cold load, nothing is sent until the guards above it answer;
  - that is the rule, because a redirect decided above the first flush is a 307 (R-98's second effect).

  DW-25 closes citing it.

**Execution — Dev, accounts and sign-in:**

- [x] **DW-41:**
  - **One new function in `sign-in/signed-out.ts`** takes the client (`import type` only), makes the calls, and answers from `auth.getSession()` afterwards.
  - **`signOut`** lands by the session left: none → signed out; one → the red line.
  - **`signOutEverywhere`** signs out `others` first (a failure there leaves this device signed in, so "try again" is true), then `local`, then lands by the session left.
  - Both comments state what the installed client does.
  - **Tests.** `signed-out.test.ts` follows, and `scopeOf` reads every call. A new node test runs `createServerClient` against a `node:http` server with the cookie `sb-127-auth-token`, and asserts each landing for:
    - `others` answering 500;
    - `others` 200, then `local` 500;
    - `local` 500 alone;
    - an expired token whose refresh answers 500.
- [x] **DW-29:**
  - `readEntitlement(client, userId)`, new in `lib/plan.ts` with `import type { SupabaseClient }`, takes over the read and its log line.
  - `resolveEntitlement` calls it.
  - **Control:** in `plan.test.ts`, a real `createClient` against `node:http`: a `500` gives `free`; `[{ state: 'pro_active' }]` gives `pro`. With the read made to throw on an error → red.
- [x] **DW-47:**
  - **`PurgeDeps`** gains `due(excluding, limit)`.
  - **`runPurge`** takes batches until the queue is empty or a 240 s budget is spent (`now` injected), excluding every id already attempted in the run.
  - **The route** uses `.not('user_id', 'in', …)` when the list is non-empty, and exports `maxDuration = 300`.
  - A `ponytail:` comment says an account that fails slowly still spends the budget, and that a `purge_attempts` column is the upgrade.
  - **Controls** (`purge.test.ts`):
    - 25 always-failing ids before a good one → `{ purged: 1, failed: 25 }` in one run;
    - the clock stops the loop.
- [x] **DW-32** — `run-verify-passkeys.py`:
  - **`named-aaguid`,** after `revoke` and `magic-link`:
    - just before **Add a passkey**, `page.evaluate` overwrites bytes 37–52 of the real `getAuthenticatorData()` buffer with an AAGUID from `lib/passkey-aaguids.ts`, read and never retyped;
    - the new row carries that entry's name;
    - `auto-name` becomes an assertion of "Passkey": that is the control.
  - **`kill-mid-ceremony`:**
    - sign in with that passkey and hold only the finish POST;
    - switch the `passkeys` row off over the pooler, then release;
    - expect the red sentence, still `/sign-in`, and no `sb-*-auth-token` cookie.
  - **The restore** puts back the value found, in both the child's and the parent's `finally`. The same press then signs in: the switch-on control.
  - **Passkeys are off on production for a few seconds**, as at Story 2.1.
  - The catalogue row follows.
- [x] **DW-91:**
  - **The error page.** `app/(app)/app/harness/error/page.tsx` throws, and 404s unless `INFLOZO_HARNESS` is set.
    - It joins `HARNESS_ONLY`, `NO_SKELETON` and step 79's list.
    - A `journey.spec.mjs` test reads the tab title "Something went wrong · Inflozo" and checks the error heading is on screen.
    - **Control:** with `error.tsx:56` deleted → red.
  - **The sign-in card.** Inside `kill-mid-ceremony`'s held POST, the form is `inert` and `aria-hidden`, no control takes focus, and Tab never lands inside. After the release they are reachable again. That pair is the control, because this harness runs against production only.
- [x] **DW-90** — `check-access.py`:
  - `http()` can return headers.
  - A GitHub block reads `/rate_limit` with `GITHUB_TOKEN`.
  - A pure verdict decides the line:
    - not `200`, or no `github-authentication-token-expiration` → FAIL;
    - 30 days or fewer → WARN, a new tag;
    - otherwise ok, with the date.
  - Any FAIL exits 1.
  - `--self-check` asserts the verdict in both directions, with no network and no email.
  - `VERIFY-AT-BUILD.md:51` names the tool, and the catalogue row follows.
- [x] **DW-14** — `configure-supabase-auth.py`:
  - the `SOFT` idle-timeout row and its 402 retry go, with every use of them;
  - one comment replaces them.
  - **Control:** `--check --expect sessions_inactivity_timeout=720` now exits `1` (it exits `0` at HEAD); `--check` still exits `0`, with no `----` line.

**Execution — the close:**

- [x] **`deferred-work.md`.**
  - DW-293 and DW-294 are written at this Create.
  - At Dev, every entry whose evidence exists closes.
  - The entries whose proof is a run on the deployed site get an `amended:` line and close at Review, when their run completes. These are DW-27, 32, 58, 67, 74, 81, 82, 83, 84, 85 and 92, plus the harness halves of DW-41 and DW-91.
- [x] **The registers.** R-219's and R-226's "built" targets are ticked, and `epic-5-context.md` gains a sub-bullet for this story's Dev.
- [x] **Standing rule 7.** Grep for:
  - `rest-residual`;
  - any direct caller of `readSettings(`;
  - `ghost_refused&status=429`;
  - `SOFT`;
  - `BRAND_KEYS`' old keys;
  - `brand.icon`, `cover`, `description` and `title`;
  - the old `SITES_URL` landings;
  - every DW id this story touched.
- [x] **The gates.** `pnpm check` (Node 24), `bash supabase/tests/run-rls-gate.sh`, `pnpm keyboard`, and `python3 tools/doc-audit.py --check` twice. All green, each new check seen red on its control first.

**Acceptance Criteria:**

- **The session guard.**
  - *Given* the Schema phase applied on production,
  - *when* a ticket whose sign-in session has ended is presented to `/rest/v1` on a read and on a write,
  - *then* both answer `401 session_not_found` and nothing is read or written;
  - *while* a live session, the secret key and anon are answered as before, and `rest-refused` asserts this on every run;
  - *and* a save and a lock check-in, timed before and after on production, differ by no more than their own spread.
- **The group.**
  - *Given* Group B re-derived at HEAD,
  - *when* this story is done,
  - *then* every entry is closed by a change whose control was seen red with the change reverted, or by its completed run, and its `resolution:` names that evidence;
  - *and* DW-293 closed with the Schema phase, DW-294 is Story 5.24d's and its card names it, and no entry was deleted or renumbered.
- **The frames.**
  - *Given* the touched surfaces — Projects (`S3 Dashboard.dc.html` S3a), Sites (`S11 Sites.dc.html` S11a), Manage API keys (`S11e Manage Keys Popup.dc.html`), the brand window (`S2 Onboarding.dc.html` S2c), and Connect's keys step (S2b·2 and S11b),
  - *when* each is drawn at 1440, 834 and 390,
  - *then* each **matches its frame**:
    - the no-match line is extrapolated from P0-2's rule, a sentence plus a clear-search link, in the grid's own slot;
    - the path sentence sits in the Kit field's error slot under API URL, where `url_invalid` already shows;
    - the roll hint is the one recorded departure;
  - *and* axe-core finds zero WCAG 2.1 AA violations at each width.
- **R-98.**
  - *Given* a control this story adds or changes,
  - *then* it follows R-98: Clear search goes to a route that already has its own skeleton, and ✕ and Cancel go `aria-disabled` (never `disabled`) while a save in their window is busy;
  - *and* `busy.test.ts` stays green.
- **The owner's test.**
  - *Given* the deployed site,
  - *when* the owner follows `## Owner's manual test`,
  - *then* he sees what each step says (R-80).
- **The gates.**
  - *Given* `pnpm check`, `bash supabase/tests/run-rls-gate.sh`, `pnpm keyboard` and `python3 tools/doc-audit.py --check`,
  - *then* all are green, and every new check was seen red on its control first.

### Review Findings

*Code review, 2026-09-29 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier on the deployed site); every patch applied in the Review commit, each new check seen red on its control first.
No question is the owner's.*

- [x] [Review][Patch] `site-settings.test.ts`'s fake handed back the WHOLE row whatever `patchSite` asked for, so a column
  dropped from its `READ` left every compare-and-set test green while `contentKeyPatch` and the disconnect stamp read
  `undefined` [apps/web/site-settings.test.ts:48] — the fake honours its `select(columns)`; with `disconnected_at` dropped
  from `READ` the DW-84 test is red.
- [x] [Review][Patch] `runPurge`'s new "the due read failed" branch — the run ending red with `step: 'due'` — executed under no
  test [apps/web/purge.test.ts:274] — two cases: refused at once → `{ purged: 0, failed: 1 }` with the step named; refused
  on the second read → the first batch's purges kept, one failure added. Red with the catch returning `failed` unchanged.
- [x] [Review][Patch] The purge's loop would meet an id the due read handed back twice — an exclusion dropped, or a profile
  outliving its user — every batch until the budget was spent [apps/web/app/api/cron/purge-accounts/purge-rule.ts:118] —
  a batch is filtered against what the run already tried.
- [x] [Review][Patch] DW-84's ✕ and Cancel gained `aria-disabled` and nothing drew it (`globals.css`'s rule is for buttons; the
  exits are links), against R-192's "visibly disabled"; and the exits were synced only on a mutation, so a window remounted
  while its save was still busy showed them live [apps/web/app/(app)/app/(authed)/sites/panel-modal.tsx:112;
  apps/web/app/globals.css:369] — one rule greys `[data-panel-exit][aria-disabled='true']`, and `sync()` runs once on mount.
- [x] [Review][Patch] `/sites/brand?site=` with nothing after it slipped past the new layout (`if (siteId)`) to the page's
  `notFound()`, the 200-then-not-found DW-67 exists to prevent [apps/web/app/(app)/app/(authed)/sites/brand/layout.tsx:30] —
  a `site` that is present and empty is judged: 404 above the boundary.
- [x] [Review][Patch] The block list omitted the IETF protocol-assignments block, the benchmarking range, multicast, the
  reserved block and broadcast, and the two IPv6 forms that carry an IPv4 inside them (NAT64 `64:ff9b::/96`, 6to4
  `2002::/16`) plus site-local `fec0::/10` [apps/web/server/ghost-admin/admin-rule.ts:277] — added, with a vector for each;
  red with NAT64 dropped.
- [x] [Review][Patch] The resolver's wait and the fetch's each got the full `TIMEOUT_MS`, so one Admin call could take twice the
  ceiling every caller was derived from (connect's three calls, the daily check's budget)
  [apps/web/server/ghost-admin/index.ts:419] — one deadline: the fetch gets what the resolver left.
- [x] [Review][Patch] `rereadSettings` spelled the Admin path `'settings/'` as a literal beside `site-probe.ts`'s `PATHS`
  [apps/web/server/site-settings.ts:50] — `ADMIN_PATHS` is exported once and `site-probe.ts` imports it.
- [x] [Review][Patch] The lifted `storeOrUndo` test could no longer see that a failed undo is LOGGED (the log lines live in
  `connectSite`'s closures) [apps/web/server-wiring.test.ts] — a source rule holds both `'sites: connect undo failed'` lines;
  red with one renamed.
- [x] [Review][Patch] DW-82's "every action landing keeps the search" was proved for the two windows' exits only; Re-check,
  Disconnect, Use brand, Skip and the notice answers were asserted nowhere [apps/web/server-wiring.test.ts] — a source rule:
  every `redirect(` in `sites/actions.ts` outside `connectSite` carries `q` (or the computed `url`), and no literal `/sites`
  landing exists; red with the disconnect landing's `q` dropped.
- [x] [Review][Patch] A `@@STEP@@` line cut short by the kill timer reached `json.loads` and raised out of the streaming loop
  [tools/probe/run-verify-ghost-admin.py:5014] — a half line is printed as a note.
- [x] [Review][Patch] `run-verify-passkeys.py` — new in this story, and it WRITES a production feature flag — opened the pooler
  with `ssl: 'require'`, the unverified line DW-50 removed from `db.ts`; the ghost-admin and dashboard harnesses' browser
  halves did the same [tools/probe/run-verify-passkeys.py:241; tools/probe/run-verify-ghost-admin.py:987;
  tools/probe/run-verify-dashboard.py:144] — each reads the PEM out of `db.ts` (`pinned_ca()`) and pins it with
  `rejectUnauthorized: true`. Re-run on production after the change: passkeys `--check`, `--only brand-none` and the
  dashboard harness (Verification § Executed at Review).
- [x] [Review][Patch] **The Real-infra verifier's finding:** `--only manage-keys` could not complete on the deployed site — the
  same wait died in both permitted runs, at `openKeysPopup`'s `dialog[open]` (the SAME line twice: a signal, not a flake)
  [tools/probe/run-verify-ghost-admin.py:1547] — the cause was the harness clicking the ⋯ row's link before React held it:
  a `PanelLink`'s `href` is the FULL page for a scripts-off browser and its `onClick` opens the window, so a pre-hydration
  click was the browser's own and went to `/sites/keys`, where no `<dialog>` ever opens. Production hydrates later than the
  local build Dev ran against. The row is now clicked only once it carries React's own keys (the forges' `hydrated()` rule,
  for the anchor). Re-run: `--only manage-keys` on production, every step PASS, users 13 → 13. The product is unchanged.
- [x] [Review][Patch] `## Verification`'s Real services list omitted Resend (`check-access.py`'s full run) and the Vercel API
  (DW-47's plan read, and Review's deployment read-back); the DW-65 task line still gave `patchSite`'s pre-Dev signature; and
  "`rest-residual` survives only in dated records" was not true of R-223's "why it was a question" [this spec] — all three
  corrected.

Dismissed as noise or by-design after reading the code (seventeen), the ones worth a line: the sign-out landing when
`others` succeeds and `local` fails answers for THIS device, which holds no cookie afterwards, and the failure is logged
with its scope; a signed-out `GET /sites/brand?site=…` was EXECUTED on production and answers `307` to `/sign-in`, so the
parent layout's redirect wins over the child's `notFound()`; a row deleted between `patchSite`'s read and write is
`no_such_site` on the re-read, never `contended`; a disconnect whose stamp fails after `remove()` lands on "Try again", and
the next press completes it (`remove()` is a no-op on nulled refs, the stamp lands); `pathOf` reading `/ghost/blog` as a
root address is right, because Ghost reserves `/ghost` and no site lives under it; DNS rebinding is the `ponytail:` ceiling
recorded beside `whereTo`, with its upgrade; a `check-access.py` FAIL on a token without an expiry header is what the spec
asked for; the guard judging the request by the `role` claim is what PostgREST itself does; the base migration keeping its
`grant` with the later migration's `revoke` is ordinary migration history.

## Spec Change Log

## Design Notes

**Why PostgREST's pre-request function, and not a check in the row policies.** R-223 asked for the mechanism to be chosen from Supabase's own source. This was read in PostgREST 14.5's source, the version production runs, and run locally against it with Supabase's own Postgres image.
- **What it does.** The function runs inside every request's transaction, after the role and the claims are set. That covers every read, write, `HEAD` and `/rpc` call. It runs once per request, as an index-only lookup on `auth.sessions`' primary key.
- **What a row-policy check would cost.** It would be one more term in every policy on every table, run once per row. It would still miss the `security definer` RPCs, and the editor's save is one of them (`sync_project_doc`).
- **What neither covers.** Neither mechanism covers Storage or Realtime. This app reaches Storage only through the service role, and it has no Realtime (R-191).

**Routine calls made here, each stated to the owner in one line.**
1. **The guard lives in `public`,** where Supabase's docs put it.
   - `private` would need USAGE for anon and authenticated, undoing §0b; there, locally, it failed on some requests and not others.
   - It can be called as `/rpc/session_guard`, which does nothing.
2. **DW-293 rides in the same migration.** The grant has had no user since connect moved onto the server.
3. **DW-294 goes to Story 5.24d,** whose goal is exactly the missing checks.
4. **DW-71 drops `title` too.** Nothing reads it.
5. **DW-86's corrected roll hint departs from S11d's and S11e's words.** It is recorded beside `KEYS`, as Story 3.6's two departures are, because the frame's path misses Ghost's Custom tab on both majors.
6. **DW-58's paired rate limit is not built.** With private addresses refused, Inflozo can be made to fetch only public addresses the caller could fetch themselves.
7. **Connect's landing drops the Sites search on purpose (DW-82).** The new card could be filtered out of sight.
8. **DW-32 switches passkeys off on production for a few seconds.** It is restored twice over, as at Story 2.1.
9. **DW-52's sentence** is the one stated at 5.24a's Create.
10. **Corrections to 5.24a's plan:**
    - its paths `server/db.ts`, `lib/admin-rule.ts` and `lib/purge-rule.ts` are `server/ghost-admin/db.ts`, `server/ghost-admin/admin-rule.ts` and `app/api/cron/purge-accounts/purge-rule.ts`;
    - `readEntitlement` goes to `lib/plan.ts`, because `entitlement.ts` cannot load under node;
    - `check-access.py` had no GitHub call to extend;
    - DW-71's `{accent: 42}` and DW-14's "`--check` exits 0" were already true at HEAD, so neither was a control.

**Frames (R-74).**
- **The no-match line.** No frame draws a no-match state. P0's rule (`P0 Editor Primitives - Spec.md:236`; `P0-2 Icon Slot and Picker.dc.html:137`) is the nearest: "a sentence … + clear-search link, never a bare empty grid". Both lines are extrapolated from it into the grid's own slot, where they already sit. "Clear search" is the app's existing label (`icon-picker.tsx:311`).
- **The field error.** No frame draws a field error on S2b·2. `url_invalid` already sits in the Kit field's error slot, and R-219's sentence joins it there.
- **The brand window's ✕.** S2c has no ✕. The app's was extrapolated from S11e at Story 3.4.

## Questions for the owner

The owner ruled Question 1 on 2026-09-29 (R-226) and Question 2 the same day. No question is open.

### Question 2 — May the database change be put on the live database? (R-99, R-223)

**In plain English.** This story makes two small changes to the live database:
- a sign-in ticket stops working the moment that sign-in ends (your ruling R-223);
- a signed-in person can no longer add a site record directly, skipping Connect (DW-293).

Both are written and pass every check on a copy of the database, including the checks that must fail when the
change is missing, and do. Your rule R-99 puts a database change on the live database first, on its own, before any
code. When I tried, this computer's safety check refused to let me change the live database. **Nothing on the live
database has changed.**

**An example.** It is like a locksmith who has fitted and tested a new lock on a copy of your door, and needs your nod
before fitting it to the real one. If the real door then sticks, one line puts the old lock back.

1. **Let me apply it (RECOMMENDED).** Reply "Apply 5.24b's database change". I apply it in one step and check at once
   that signed-in people still work. If they don't, I take it back off by myself in one line. Then I finish the story.
2. **Apply it yourself.** In Supabase, open your project → **SQL Editor** → **New query**. Paste the whole of
   `supabase/migrations/20260929120000_session_guard.sql` and press **Run**. Then reply "Applied", and I check it on
   the live site and finish the story.
3. **Leave the database change out of this story.** Nothing changes on the live database. The ticket rule (R-223) and
   the site-record fix (DW-293) move to a later story, and this story carries on without them.

**Ruled: option 2 (owner, 2026-09-29).** *"2. Applied"* — he applied the migration himself through Supabase's SQL
editor. It was read back and proved on production before any code (the Schema tasks below, `MEASUREMENTS.md` §56).

### Question 1 — When someone types the address of a page on their site, should Connect still work? (R-219, DW-55)

**In plain English.** Your ruling R-219 says that an address with a path is refused, with your sentence: "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet." That ruling was about a Ghost that lives under a path.

But you also get a path when you copy the address of a post. Today, Connect quietly drops the path and connects the site. Read word for word, R-219 would now refuse that too.

**An example.** You copy the address from the browser while reading one of your posts: `https://ghost5.inflozo.com/welcome/`. Today, Inflozo connects `ghost5.inflozo.com`. Read word for word, R-219 would answer "… — /welcome isn't supported yet.", even though your site is at the root.

1. **Look at the root first (RECOMMENDED).**
   - If your Ghost answers at the root, Connect carries on as today, so a copied post address still works.
   - If no Ghost answers there, Connect shows your sentence, with the path that was typed.
   - This check comes before the one-site limit, so nobody is asked to upgrade for an address that could not connect anyway.
2. **Refuse every address with a path straight away, as R-219 reads.**
   - Ghost's own admin address (`…/ghost/`) still connects.
   - Someone who pasted a post address retypes just the site's address.

**Ruled: option 1 (owner, 2026-09-29).** *"1. Look at the root first"*. Recorded as **R-226**: a path typed at
connect is judged at the root first, so a page's address on a site at the root still connects, and R-219's sentence
answers when no Ghost answers at the root.

## Owner's manual test

Do this on the real site after Deploy, in a desktop browser about 1440 wide, signed in as yourself. At this Create (read-only), your account was Free with one connected site, ghost5, and three projects. The steps are written for that account, and for your ruling on Question 1 (R-226).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/` | Projects | Type in **Search projects…** and press Enter. Then click **Clear search**. | `zzzz` | "No projects match “zzzz”. **Clear search**" where the cards were. The click empties the box and your three projects are back. |
| 2 | `https://app.inflozo.com/sites` | Sites | Type in **Search sites…** and press Enter. Then click **Clear search**. | `zzzz` | "No sites match “zzzz”. **Clear search**". The click empties the box and ghost5's card is back. |
| 3 | `https://app.inflozo.com/sites` | Sites | Search, so the list is filtered. Open ghost5's **⋯ → Manage API keys** and close the window with **✕**. Open it again and close it with **Esc**. Open it again and close it with **Cancel**. | `ghost5` | After each close you are back on the list, the box still says `ghost5`, and the address bar still ends in `?q=ghost5`. |
| 4 | same | Manage API keys window | Open it once more. Read the grey hint near the bottom. Press **Test connection**. | — | The hint reads "To roll keys: Ghost Admin → Settings → Integrations → **Custom** → Inflozo → Regenerate. Old keys stop working the moment you regenerate." The button reads "Testing…", then "Inflozo reached your Ghost site." appears. |
| 5 | same | Sites, then the brand window | Close the window. Open **⋯ → Use this site’s brand**, then close it with **✕**. | — | Back on the list, still filtered, with `ghost5` in the box. |
| 6 | `https://app.inflozo.com/sites/connect?step=keys` | Connect a site — the keys step | Fill in the three boxes and press **Connect**. | API URL `https://example.com/blog` · Admin API key `aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` · Content API key `cccccccccccccccccccccccccc` | The button reads "Connecting…", then this appears in red under API URL: "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet." Nothing is added to Sites, and you are not asked to upgrade. |
| 7 | same | the keys step | Change API URL. Replace the Content API key with ghost5's real one: it is in ghost5's Ghost Admin → Settings → Integrations → Custom → Inflozo. Your browser checks that key with ghost5 before it sends anything, so the made-up one would stop you here. Leave the made-up Admin API key as it is. Press **Connect**. | `https://ghost5.inflozo.com/welcome/` | "ghost5.inflozo.com is already connected." The post's path was set aside and your site recognised, as you ruled (R-226). Nothing was sent to Ghost and nothing changed. |
| 8 | same | the keys step | Change only API URL, then press **Connect** again. | `https://ghost5.inflozo.com/ghost/` | "ghost5.inflozo.com is already connected." Ghost's own admin address is never refused. |
| 9 | `https://app.inflozo.com/` | Projects → your avatar menu | Click **Sign out**. Then sign in again with a magic link. | your email | "Signing out…", then the sign-in page with the green "You’ve been signed out." After signing in you are back on Projects. Only this browser was signed out. |

## Verification

**Commands:**

- The group, re-derived at HEAD. Expected: exactly the entries § The triage gives to Story 5.24b.
  `python3 -c "import importlib.util as u; s=u.spec_from_file_location('b','tools/story-board.py'); b=u.module_from_spec(s); s.loader.exec_module(b); d=b.load_deferred(open('_bmad-output/implementation-artifacts/deferred-work.md').read()); print(sorted((x['id'] for x in d if not b.dw_closed(x) and '5.24b' in (x.get('owner') or '')), key=lambda i: int(i[3:])))"`
- `bash supabase/tests/run-rls-gate.sh` — expected: exit 0, with the Story 5.24b block's PASS lines. With the migration withheld, it aborts at that block.
- `python3 tools/probe/run-verify-sign-out-everywhere.py` — expected: `rest-refused` FAILS before the apply (`200`) and PASSES after it (`401 session_not_found` on a read and a write for both old tokens; A2's live token and the secret key still `200`).
- `cd apps/web && node --test site-settings.test.ts connect-rule.test.ts probe-rule.test.ts server-wiring.test.ts ghost-admin-rule.test.ts health-rule.test.ts plan.test.ts purge.test.ts signed-out.test.ts` — expected: all pass. Each control is seen red with its change reverted, and the run is recorded.
- `pnpm check` (Node 24) — expected: exit 0.
- `pnpm keyboard` — expected: green, the error-title test included. With `error.tsx:56` deleted, red.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — expected: exit 0. The pinned CA connects, and `tls.rootCertificates[0]` is refused.
- `python3 tools/probe/run-verify-ghost-admin.py --only no-such-step` — expected: exit 2 before any key is read.
- At Review, on the deployed site: `python3 tools/probe/run-verify-ghost-admin.py --only brand-none,brand-ownership,moved-domains,…` with every block this story added. Expected:
  - every step PASSES;
  - `brand-ownership` passes five runs out of five (its control failed three of four at Story 3.9);
  - `moved-domains`' order-term control picks the newer record without the term, and the live decoy with it.
- At Review: `python3 tools/probe/run-verify-dashboard.py` (Clear search, and axe at 1440, 834 and 390) and `python3 tools/probe/run-verify-passkeys.py` (`named-aaguid`, `kill-mid-ceremony` and the `inert` pair). Expected: PASS, and the `passkeys` flag reads back as it was found.
- `python3 tools/probe/configure-supabase-auth.py --check --expect sessions_inactivity_timeout=720` — expected: exit 1 (it was 0 at HEAD). `--check` alone exits 0, with no `----` line.
- `python3 tools/probe/check-access.py --self-check` — expected: exit 0. Then one full run, which sends the tool's usual test email, prints the GitHub line with its date.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Real services (R-82).**
- Supabase:
  - the pooler, for the Schema apply, its read-backs and the `passkeys` row;
  - GoTrue, for throwaway accounts, deleted afterwards;
  - PostgREST, for the guard's proof;
  - the Management API, read-only.
- `app.inflozo.com`: the four harnesses, the two timings, and the owner's test.
- The Ghost servers, both read-only Admin GETs through the fixture account:
  - T1 `ghost6.inflozo.com`: connect, keys and brand;
  - T3 `ghost5.inflozo.com`: moved domains.
- Public DNS, for `127.0.0.1.nip.io`.
- The GitHub API, read-only.
- Resend, for `check-access.py`'s one full run (its usual test email).
- The Vercel API, read-only: DW-47's plan and compute read, and Review's deployment read-back.
- The npm registry, for Ghost's admin source.

**Executed at Create (2026-09-29), read-only.** Recorded so that Dev starts from evidence.

- **Group B at `0b00f5d9`:** the open entries owned by 5.24b are exactly the card's list.
- **DW-40, on production.**
  - Versions: PostgREST 14.5 (`pg_stat_activity`), PostgreSQL 17.6, GoTrue v2.197.0.
  - `authenticator` carries no `pgrst.db_pre_request`, so there is nothing to clobber.
  - `postgres` is not a superuser, but holds ADMIN on `authenticator`, and supautils allows `pgrst.*`.
  - `auth.sessions` has RLS on with no policy.
  - The guard's lookup plans as an index-only scan on `sessions_pkey`.
  - Baselines: the sync RPC's mean is 4.899 ms and the lock's beat is 3.911 ms (`pg_stat_statements`, since 2026-09-04).
- **DW-40, run locally** with Supabase's `postgres:17.6.1.140` and `postgrest:v14.5`.
  - A deleted session gets `401 session_not_found` with `WWW-Authenticate` on GET, HEAD, PATCH, `POST /rpc`, `GET /rpc` and `GET /`.
  - The same token gets `200` while its row exists, and again once the guard is removed.
  - A `service_role` token with no `session_id` gets `200` throughout.
  - `alter role authenticator set pgrst.db_pre_request` succeeds as that image's non-superuser `postgres`; plain PostgreSQL refuses it.
  - A guard placed in `private` fails intermittently.
- **DW-50.** The owner's file is Supabase Root 2021 CA: `CA:TRUE`, valid 2021-04-28 to 2031-04-26. Connecting from the app's driver to `aws-0-eu-central-1.pooler.supabase.com:6543`:

  | Setting | Result |
  |---|---|
  | the pinned root, `rejectUnauthorized: true` | connected (`select 1`) |
  | a self-made CA | refused, `SELF_SIGNED_CERT_IN_CHAIN` |
  | Node's own bundle | refused, `SELF_SIGNED_CERT_IN_CHAIN` |
  | a wrong servername | refused, `ERR_TLS_CERT_ALTNAME_INVALID` |

  The chain is: leaf `*.pooler.supabase.com` (to 2030-03-11) ← Supabase Intermediate 2021 CA ← the root.
- **DW-58.**
  - `127.0.0.1.nip.io` → `127.0.0.1` and `10.0.0.1.nip.io` → `10.0.0.1` (`dig @1.1.1.1`), and `normaliseSiteUrl` accepts both.
  - `BlockList` blocks `::ffff:127.0.0.1` and allows `::ffff:8.8.8.8`.
  - `authenticated` could insert a `sites.url` directly (`SCHEMA.sql:1108`): DW-293.
- **DW-55.**
  - `https://example.com/blog/`, `example.com/blog`, `https://example.com/`, `…/ghost/`, `…/ghost/#/…` and `…/?x=1` all normalise to `https://example.com` today.
  - `https://example.com/ghost/api/admin/config/` answers `404` (HTML).
- **DW-86.** The labels on both majors are as in Code Map. `rollHint` misses **Custom**; `staff.ask` matches.
- **DW-90.** `GET /rate_limit` → `200` with `github-authentication-token-expiration: 2027-09-05 16:19:00 UTC`, the register's date.
- **DW-14.** `--check` exits 0 with the `----` line. `--expect mailer_otp_exp=901` exits 1. `--expect sessions_inactivity_timeout=720` exits 0.
- **DW-41.** auth-js 2.115.0, against `node:http` answering 500 on logout:
  - `others` → error, the session is kept, and no cookie is written;
  - `local` and `global` → error, the session is removed, and the cookie is deleted.
- **DW-29.** A real `createClient` against `node:http`: a 500 gives `free`, and `pro_active` gives `pro`.
- **DW-71.** `hasBrand({ accent: 42 })` is false at HEAD. No reader of `icon`, `cover`, `description` or `brand.title` exists in `apps/`, `packages/` or `tools/`.
- **DW-92.**
  - `run-verify-ghost-admin.py --check` exits 0: the script parses, 85 app sentences evaluate, §21j's three 404s hold, and the settings keys are present on T1 and T3.
  - No spec after Story 3.9 has run its browser half.
- **The owner's account**, read for the manual test: Free, one active site, three projects.
- **Tests at HEAD.** The seven app test files this story extends pass 100 of 100 (Node 24).

**Executed at Dev (2026-09-29).** Every key was read into a command's environment only. Each new check was seen red on
its control first, then restored byte-identical and green.

- **The group at HEAD** (the first command, at `2450daea`): exactly § The triage's list, less DW-40 and DW-293, which the
  Schema phase closed. After this phase the same command lists only the entries whose proof is a run on the deployed
  site — DW-27, 32, 41, 58, 67, 74, 81, 82, 83, 84, 85, 91 and 92 — each carrying an `amended:` line; every other entry
  is `done 2026-09-29 (Story 5.24b)` with a `resolution:` naming its evidence. None was deleted or renumbered.
- **DW-65, DW-271, DW-272, DW-84's second half — `site-settings.test.ts`** (a client over one row owned by user A that
  evaluates every `.eq`): green. Each control red, then restored: the `updated_at` filter dropped → the second-writer
  test, the contention test and the Content race go red; the owned read moved after `call` → DW-272's test red; the
  owned read's `.eq('user_id')` dropped → red; `contentKeyPatch` ignoring `disconnected_at` → red.
- **The wiring rules — `server-wiring.test.ts`.** HEAD's `sites/actions.ts` and `site-probe.ts` swapped in → the DW-65
  rule names all seven writers this story moved (the cosmetic `site/` write, both answers, the disconnect stamp, the
  Content save, the probe's write and the re-read's), and the DW-77 rule and the re-read order rule go red; a relative
  `./ghost-admin/index.ts` import planted in `site-settings.ts` → both chokepoint rules red; `disconnectSite` back to
  two `remove()` calls → red; `remove()`'s `begin()` moved inside the loop → red.
- **DW-59, 55, 52, 81, 86, 82 — `connect-rule.test.ts`.** Eight mutations, each red: `storeOrUndo`'s branches swapped;
  a column `siteWrite` writes that `KEPT` does not name; `pathOf` keeping `/ghost`; `pathRefused` refusing every path;
  `oneCredential` admitting two; `sitesScreen` letting an unread list be the first run; the roll hint back to the
  frame's words; `ghost_unavailable` reworded.
- **DW-52, DW-58 — `ghost-admin-rule.test.ts` and `health-rule.test.ts`.** Red with a 5xx left a refusal, with every
  4xx made unavailable, with the branch removed (HEAD), and with carrier-grade NAT dropped from the list.
  `blockedAddress` also refuses the hex-form mapped `::ffff:7f00:1` and allows `::ffff:808:808`.
- **DW-71 — `probe-rule.test.ts`.** The three new vectors, each evaluated on HEAD's own `probe-rule.ts`: `true` at
  HEAD, `false` now (`{accent: 42}` is `false` at both, as the Create said). Red with HEAD's `hasBrand` body, and with
  `brandOf` storing a fourth key.
- **DW-41 — `sign-out-landing.test.ts`** (new: the app's own `createServerClient`, ssr 0.12.6 and auth-js 2.115.0,
  against a `node:http` GoTrue, cookie `sb-127-auth-token`): `others` 500 keeps the cookie and says "try again";
  `others` 200 then `local` 500 lands on the everywhere sentence; `local` 500 alone lands on `/sign-in?signed-out=1`
  (HEAD sent the dashboard's red line); an expired ticket whose refresh answers 500 keeps the cookie and lands on
  `/?sign-out-failed=1`. Red with the landing decided by the error (HEAD's rule), with no stop after `others`, with
  `getSession()`'s error ignored, with the scope dropped, with `['global']`, `['others']` or the list reversed, and
  with the failure branch removed. The deployed half is Review's (`run-verify-sign-out-everywhere.py`).
- **DW-29 — `plan.test.ts`** (a real `createClient` against `node:http`): a 500 gives Free and one
  `entitlement: read failed {code}` line with no user id; `pro_active` gives Pro. Red with the read made to throw on an
  error, and with `data?.state` made `data!.state`.
- **DW-47 — `purge.test.ts`.** BATCH always-failing accounts before a good one → `{ purged: 1, failed: BATCH }` in one
  run; red as `{ purged: 0, failed: 25 }` with HEAD's one batch and `{ purged: 0, failed: 240 }` with the exclusion
  dropped. The injected clock stops the loop at 24 of 100 on a 10 s step; red at 25 without the per-account check and
  at 100 without the budget; the route's exclusion, its `maxDuration` and a budget at the ceiling each fail the source
  test. **On production, read-only** (supabase-js with `SUPABASE_SECRET_KEY` by name): the route's own `due` chain
  answers PostgREST without error with and without an exclusion, and the same `not.in.(…)` over `profiles` drops exactly
  the three ids listed (15 → 12). The production Vercel project is Pro with Fluid compute (read-only API), so
  `maxDuration = 300` is within its limit.
- **DW-50 — the handshake, from the app's own driver** (`SUPABASE_DB_POOLER_URL` by name, `select 1` only): the PEM
  read out of `db.ts` → connected; `tls.rootCertificates[0]` → refused `SELF_SIGNED_CERT_IN_CHAIN`; HEAD's
  `ssl: 'require'` → connected (it verifies nothing). The chain, read with `openssl s_client -starttls postgres`: leaf
  to 2030-03-11 ← intermediate to 2033-10-21 ← root to 2031-04-26. `MEASUREMENTS.md` §57; `VERIFY-AT-BUILD.md` item 60.
  `run-verify-ghost-admin.py --check`: exit 0, with `pinned-ca` PASS and `brand-keys` reading the three keys on T1 and T3.
- **DW-86 — Ghost's admin, read in the npm tarballs** of 5.130.6 and 6.58.0 (`registry.npmjs.org`, read-only): the
  labels and files as in the Code Map; both majors open Integrations on `built-in` (`useState`). `MEASUREMENTS.md` §58.
- **DW-67 — the hypothesis, read in source:** Next 16.3.1's `createRedirectRenderResult` re-fetches an app-relative
  redirect target with `getForwardedHeaders(req, res)` — the POST's own headers — so the layout acts only when a `site`
  is in the header. Executed: every connect in both local runs below landed on S2c.
- **DW-14.** `configure-supabase-auth.py --check --expect sessions_inactivity_timeout=720` exited 0 at HEAD and exits 1
  now ("not a field this tool sets"); `--check` exits 0 with no `----` line; `--expect mailer_otp_exp=901` still exits 1.
- **DW-90.** `check-access.py --self-check`: exit 0, eight verdicts; red under each of three mutations (the window made
  exclusive, a missing header let through, a 401 let through). One full run (the tool's usual test email sent): exit 0,
  `GitHub token -> /rate_limit, and its expiry  HTTP 200 — expires 2027-09-05, in 341 day(s)`.
- **DW-91's error page — `pnpm keyboard -g DW-91`:** green; with `error.tsx:56` deleted, red (`Received: ""`);
  `app-routes.test.ts` and `busy.test.ts` red with the new page withheld from `HARNESS_ONLY` and `NO_SKELETON`.
- **DW-32 and DW-91's card half** are built into `run-verify-passkeys.py`, whose run switches passkeys off on
  production for a few seconds, so it is Review's. `--check`: exit 0, the flag read and never written, users 13 → 13.
  The harness's own code, cut out and run on the same Playwright Chromium against a local page, held 10 of 10 checks on
  three runs; the flag's read, write and restore ran against a throwaway PostgreSQL 17 with TLS, 8 of 8. Found there:
  the virtual authenticator's AAGUID is `01020304-0506-0708-0102-030405060708`, not all-zero (corrected beside the code
  in `lib/passkey-aaguids.ts`), and bytes written into `getAuthenticatorData()`'s buffer in place reach `toJSON()`, so
  the harness hands back a copy.
- **DW-92, DW-83, DW-74, DW-85 — `--only`, against HEAD's deployment.** `--only no-such-step` exits 2 with
  `tools/probe/.env` absent, while a known name reaches the key check. Every registered block completed alone, users
  13 → 13, nothing written to T1 or T3: `brand-none`; `brand-ownership` passed all five runs that reached the step (of
  seven: one died on this machine's network, one in the T1 seed); `manage-keys`; `moved-domains` on its third attempt
  (the first two died on DW-68-class waits), `moved-order-term` passing in both attempts that reached it — without the
  term the newer disconnected record, with it the older live decoy; `keys-content`. Found by reading: `press()` had
  called itself since `03d3d4af` (Story 3.7's review), so no full run could pass `brand-popup`; fixed, and a full run is
  owed.
- **This story's harness steps on HEAD's deployment first — each red, as the controls must be:** `path-refused`
  (no sentence); `address-blocked` (the sentence was already true, but the audit row carried `{"ms":168}` and no
  `blocked`); `brand-none` (`200/200`); `keys-screen` (the frame's roll hint); `keys-two-fields` (the post STORED one
  credential, `credential_change` 1 → 2); `keys-test-refused` (no `ghost_unavailable` sentence); `search-kept` (the
  first window opened without `q`); `keys-escape` (✕ and Cancel not disabled, one close). `path-page` and every older
  step passed there. `run-verify-dashboard.py`'s `clear-search` FAILED on HEAD (`href: null` on both pages, the box
  still `zzzz`, the card not back) with every other step green, users 13 → 13 — the fourth attempt: the first two
  stopped at `cap` (its re-post not seen reaching the server) and then on a 60 s page load, while HEAD's own copy of
  the harness passed every step between them; the third reached the new step and threw on the missing link's click,
  which the step now records as its FAIL instead of throwing.
- **This story's code, run locally through the product's own pages** — Chromium mapping `app.inflozo.com` to a TLS
  proxy in front of the app on this machine, with the production database, T1 and T3 (users 13 → 13 every run):
  - under `next dev`, all eight blocks together (`--only connect-paths,brand-none,brand-ownership,manage-keys,
    moved-domains,keys-content,search-kept,keys-escape`): every step PASS, 5 m 37 s;
  - under a production build (`next build` + `next start`): the same eight blocks, every step PASS, 4 m 43 s —
    after the harness race below was waited out; before it, `moved-domains` failed there twice waiting for the
    connect sheet's step link;
  - `run-verify-dashboard.py` under the production build: every step PASS — `clear-search` on both pages (the link
    the page without `q`, the click landing there with the box empty and the card back) and axe-core at WCAG 2.1 AA
    over both no-match lines at 1440, 834 and 390, zero violations.
  Two local-only accommodations, both reverted and neither in the product: `next start` 308s the rewritten `/app/` to
  `/app`, which `proxy.ts` sends back to `/` — a loop Vercel does not have — so the local build ran with
  `skipTrailingSlashRedirect`; and under `next dev` React's StrictMode leaves `connect-wizard.tsx`'s `alive` ref false
  after its double-run effect (`useEffect(() => () => { alive.current = false }, [])` never sets it back), so the
  wizard sits on "Connecting…" in development only — the dev run used `reactStrictMode: false`. The second is a real
  defect in development builds, outside this group; it is reported to the dispatching session to be given an owner.
- **The harness itself, hardened by those runs:** a hidden id forged before React has attached to its form is written
  back by hydration, so every forge now waits for `hydrated()`; the Content save's navigation waits for the form's
  `aria-busy` to clear; `search-kept` waits for the window's words, the popover's close and focus inside the dialog
  before its Escape; and `moved-domains`' reconnect waits for the disconnect's landing to redraw the list — T3's card
  gone, no dialog open, the skeleton gone, the sheet's element present — because the address is `/sites` before and
  after the press, and an opener pressed in between found no sheet (it went to the full page `/sites/connect`) or
  opened one the new list remounted (`ConnectSiteDialog` is keyed on the number of sites). Diagnosed on the local
  production build with the dialogs and the address read at each moment; with the wait, the block passed there.
  `keys-escape` holds Test connection's POST — a Kit `Submit` in the window that writes nothing — and asserts that the
  window stays open with no close event and its address unchanged through the hold, the ✕ and Cancel `aria-disabled`,
  and the released answer drawn in an open window. Whether React re-creates the `<dialog>` element when the answer's
  redirect changes the query is RECORDED, not asserted: the page segment is keyed by its search params.
- **Departure from the Tasks' wording:** `patchSite(admin, { siteId, userId }, patch)`, not `(admin, siteId, patch)` —
  the user id rides beside the site id because every writer it replaced carried `.eq('user_id')` on its own write, and
  ownership belongs beside the write (`remove()`'s rule in the chokepoint).
- **Standing rule 7.** `rest-residual` survives only in dated records and in R-223's own "why it was a question" (the register, describing what was executed before this story; the built target beside it names `rest-refused`); no caller of `readSettings(` bypasses the
  wrapper (the editor's action calls it); no `ghost_refused&status=429`; the `SOFT` row is gone from the tool, and
  `sessions_inactivity_timeout` is named only in its docstring and its new comment; `BRAND_KEYS` is the three keys; no
  reader of `brand.icon`, `cover`, `description` or `title`; `SITES_URL` is gone and every action landing is
  `sitesPath`. Two literal `/sites` links stay on purpose: the scripts-off disconnect page's (a page reached with no
  search to keep) and the connect wizard's Back (Connect drops the search, as its landing does). Propagated from the
  sweep: the catalogue rows of
  the ghost-admin, dashboard, sign-out-everywhere and Supabase-auth tools, the shell's comment on clearing `?q`, and
  `VERIFY-AT-BUILD.md`'s GitHub-token section.
- **The Matrix Test Audit, at the dispatching session's check.** Every row of the I/O matrix maps to a test that ran and
  passed in this phase — the RLS gate, `pnpm check`, `pnpm keyboard`, `rest-refused` on production, or the harness runs
  above — with one gap, found and closed: the path row's "before the plan's limit is counted" had no test that fails when
  the order is swapped, because `path-refused` runs below the cap. `server-wiring.test.ts` gained "R-226: connect says
  already connected, then judges a typed path at the root, and only then counts the plan", seen red with the cap moved
  above the path check in `sites/actions.ts`, then restored byte-identical. The owner's step 6 walks the same row at the
  cap, on the deployed site. `pnpm check` re-run on the final tree: exit 0, `apps/web` 623 of 623 before the rule and the
  wiring file 19 of 19 after it, with `tsc` and eslint clean.
- **DW-295, new, and routine:** the development-only "Connecting…" hang is in the ledger, owned by Story 5.24d, whose card
  names it — its walks are the ones a development build carries, and no check this story runs can walk Connect in one.
- **The gates.** `pnpm check` (Node 24): exit 0 — lint, typecheck and every package's tests, none failing.
  `bash supabase/tests/run-rls-gate.sh`: exit 0, with the Story 5.24b block's PASS lines and DW-293's.
  `pnpm keyboard`: exit 0, the DW-91 test among the passes. `python3 tools/doc-audit.py --check`: the first run regenerated
  `INDEX.md` and `INDEX.html` from the new catalogue rows (STALE, as the gate does), then PASS twice with no warning.

**Executed at Review (2026-09-29), on the real infrastructure (R-82), against HEAD `9a7b446a` deployed.** Every key by
name; nothing written to T1 or T3; users 13 → 13 on every run.

- **HEAD deployed.** CI run for `9a7b446a`: `rls`, `check`, `deploy` all success (deploy at 04:44:49Z), the render matrix
  success; Vercel production deployment for that sha `READY`.
- **The schema is at least as new as the code (R-99),** read over `SUPABASE_DB_POOLER_URL`: `public.session_guard` present,
  `prosecdef`, owner `postgres`, `search_path=""`; `authenticator` carries `pgrst.db_pre_request=public.session_guard`;
  `has_table_privilege('authenticated','public.sites','INSERT')` is false, SELECT and the column UPDATEs unchanged.
  **Negative control, rolled back:** `set local role authenticated; insert into public.sites …` → `42501`.
- **The guard, live:** `run-verify-sign-out-everywhere.py` exit 0, `rest-refused` PASS — A1's live ticket 200 before the
  press; after Sign out everywhere both old tickets 401 `session_not_found` on a read and a write with
  `WWW-Authenticate: Bearer error="invalid_token"`, `profiles.updated_at` unchanged; A2's live ticket, the secret key and
  anon still 200. `jwt-exp` RECORD 3600 s.
- **`--only no-such-step`:** exit 2 naming the registry, before any key is read. **`--check`:** exit 0, `pinned-ca` PASS.
- **The eight blocks on production.** `connect-paths` (`path-refused`, `address-blocked` with `{"ms":24,"blocked":true}`,
  `path-page` connecting T1's root from a post's address — R-226), `brand-none` (404/404), `brand-ownership` (five runs of
  five, six of six with the run above), `moved-domains` with `moved-order-term` (the newer record without the term, the
  live decoy with it), `keys-content` with `keys-test-refused` (`ghost_refused&status=403` and `ghost_unavailable`),
  `search-kept`, `keys-escape`: every step PASS. **`manage-keys` FAILED twice at the same wait** (`openKeysPopup`'s
  `dialog[open]`, runs "eight" and "five") — diagnosed as the harness clicking the ⋯ row's `PanelLink` before hydration,
  which follows its scripts-off `href` to the full page; fixed in the harness (the row is clicked once React holds it) and
  re-run: every step of `manage-keys` PASS (`keys-screen` … `keys-forged`), exit 0. The product is unchanged by it.
- **`run-verify-dashboard.py`:** exit 0 — `clear-search` PASS on both pages, axe zero violations at 1440, 834 and 390.
  Run again after the review pinned the harness's pooler connection to the app's CA: exit 0, all steps PASS.
- **`run-verify-passkeys.py`:** exit 0 — `named-aaguid`, `kill-mid-ceremony` (off for 2767 ms), `switch-on`, `inert-held`,
  `inert-released` PASS; the `passkeys` row read back identical before and after. `--check` again after the CA pin: exit 0,
  the flag read and never written.
- **`--only brand-none` again after the CA pin:** exit 0, PASS.
- **Read-only premises:** `https://example.com/ghost/api/admin/config/` → 404; `127.0.0.1.nip.io` → `127.0.0.1` at 1.1.1.1;
  a signed-out `GET https://app.inflozo.com/sites/brand?site=<uuid>` and `?site=` → 307 to `/sign-in` (the parent
  layout's redirect precedes the brand layout's 404 — a claim about Next's ordering, executed).
- **The review's own patches, each seen red on its control:** the fake's `select(columns)` (`READ` without
  `disconnected_at` → the DW-84 test red); the purge's due-failure tests (the catch returning `failed` unchanged → red);
  the widened block list (NAT64 dropped → red); the undo-log rule (one line renamed → red); the DW-82 landing rule (the
  disconnect landing's `q` dropped → red). `node --test` over the touched files green after each restore, byte-identical.
- **The gates after the patches:** `pnpm check` (Node 24) exit 0; `bash supabase/tests/run-rls-gate.sh` exit 0 with the
  Story 5.24b and DW-293 PASS lines; `pnpm keyboard` exit 0 (`next-env.d.ts` restored after it); `python3 tools/doc-audit.py
  --check` PASS twice; the story board regenerated. Every entry of Group B is closed: the spec's first command lists none.
