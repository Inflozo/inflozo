---
title: 'Story 7.19 — The first-deploy credential step, and its decline path'
type: 'feature'
created: '2026-10-20'
status: 'ready-for-dev'
baseline_commit: '10559fd767dcac60d54df6b2172acbf3b19fd799'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-18a-the-deploy-wizard.md']
---

## In plain English

After this story, the first time you ship a project to a Ghost site, the deploy wizard adds one step, **Safety net**. It
asks for your Ghost **Staff Access Token**, says plainly that it is a full-Administrator key, and explains that it lets
Inflozo keep a copy of your current theme, notice changes made in Ghost, and upload your routes file for you. You can
paste the token (Inflozo checks with Ghost that it belongs to an Administrator or the Owner before keeping it) or press
**Not now**: you then see, once, the three things you go without, your deploy works exactly as before, and Inflozo never
asks again on that site — you can still add the token any time from Manage keys.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Questions 1–3 were ruled by the owner (2026-10-20), each option 1: R-278, R-279 and R-280.** "Ruled values" in Design
Notes is the one table they set.

**Problem:**
- **Nothing asks for the Staff Access Token at the moment it matters.** The connect wizard keeps it out on purpose
  (`sites/connect-wizard.tsx:53-55`); FR-C1 puts it at the first deploy. Today the only way in is Manage keys, which a
  first-time user never visits, so every first deploy goes out with no token: no routes upload, and from Stories 7.20
  and 7.21 no snapshot and no drift check.
- **Nothing records a "no".** `staff_token_vault_ref` is commented "declinable" (`complete_schema.sql:184`), but no
  column or code holds a decline. The frame's D1c is "raised once, never again"; without a record, a first deploy that
  stops before its upload would ask again on the next open.
- **Nothing checks whose token it is.** Manage keys parses and stores any `id:hex` pair
  (`sites/actions.ts:1279-1283, :1401-1411`). An Editor's token, or the integration's Admin key pasted by mistake, is
  kept silently and fails later as B16's `role` cause.
- **The rail is fixed at four.** `STEPS` (`lib/deploy.ts:37-42`) waits for 7.19's and 7.20's steps (`:35`).

**Approach:**
- **A Safety net step, D1b, between Destination and Check.** It shows when the project's linked site has never
  received an upload from any of the user's projects, holds no token, and has no recorded decline. Destination's button
  then reads **Next** (D1a's word). The rail is then Destination · Safety net · Check · Ship · Live.
- **Add token** checks the token with Ghost before anything is stored. It sends one `GET users/me/?include=roles`
  signed with the pasted token (`fetchWithKey`) and keeps only an Owner's or an Administrator's. The answers are
  Question 3's. Manage keys uses the same check, so there is one rule (R-170). A kept token goes straight on to Check.
- **Not now** opens D1c at once and records the decline on the site record (Question 1). A `Schema` push comes first
  (R-99). **Continue** starts the checks. The deploy is unchanged: the Admin key uploads and activates (7.18a).

## Boundaries & Constraints

**Always:**
- **Frames (R-74).** Every frame lives in `claude-design-export/Inflozo/`. Design Notes, "Words", holds every string.
  - **The offer:** D1b, `D1 First-Deploy Gates.dc.html:95-151`. The card is 700px wide. Below it sit the rail (`:111-123`),
    the title and lead (`:124-127`), and the two paragraphs, the second one's full-Administrator sentence in ink at
    weight 500 (`:128-131`). Next come the field, with the line under it, beside the 280×150 picture (`:132-141`), and
    finally Back on the left and the two buttons of equal weight on the right (`:142-148`).
  - **The decline:** D1c, `:153-206`. It has the title and lead (`:182-185`) and three bordered rows, each with a 34px
    tile glyph (Tabler `copy`, `eye`, `upload`, `:186-199`). Then comes the Manage keys line, "Manage keys" in ink at
    weight 600, not a link (`:200`), and Continue with its chevron on the right (`:201-203`).
  - **Destination's button:** D1a's **Next** with its chevron, `:89`. D1a's other changes stay with 7.24: its pill,
    the "Theme to be created" row and the permanence line.
  - **The rail:** the six-step rail D1 draws, `:51-63`, less Backup (7.20). It uses 7.18a's `Rail` as built.
  - **No ✕ on D1b or D1c,** as on S8b: Esc and a click on the backdrop close the wizard, as they do now.
  - **Below `tablet`,** the picture stacks under the field. The card is held by the wizard's
    `max-w-[calc(100vw-72px)]` (`deploy-wizard.tsx:1239`).
- **The full-Administrator disclosure is one sentence, read by both surfaces (FR-C3, R-170).** It is
  `KEYS.staff.full`. D1b shows it in ink, and Manage keys' `enables` is built from it. Neither surface says anything
  narrower.
- **One name for the action (R-170): "Add token",** the name Manage keys already uses (`KEYS.staff.add`). D1b draws
  "Add the token"; that is a routine call, and the owner is told in one line.
- **"First deploy to a site" is per site record (FR-J13, IA `EXPERIENCE.md:187`).** It means no
  `project_site_bindings` row for the site among the user's projects. A binding is written at the first accepted upload
  (`deploy-io.ts:120`). A failed read counts as none, as 7.18a's reads do.
- **The check reads; it never writes to Ghost.** It is a `GET`, so `permitted()` passes it
  (`admin-rule.ts:162`), `ADMIN_WRITES` stays four, and the chokepoint writes an `admin_read` audit row. A token that
  fails is never stored: no Vault secret, no flag, no `credential_change` row.
- **The deploy never waits on the safety net.** If the decline's write fails, it is logged and the deploy goes on; the
  offer may then show again next time. A deploy with no token ships with the Admin key exactly as now (FR-J8, AD-10).
- **The token never reaches a log, a URL or the client after the press.** The server action takes it in its body
  only. A refusal's role name in Manage keys' URL is one of Ghost's own role names, checked against a closed list.
- **R-98:** Add token swaps to "Adding…" and Continue to "Starting…", each `aria-disabled` + `aria-busy`.
  `busy.test.ts` is green, with its wizard list extended.
- **R-82, R-238:** Review and test run on production and on T1 only. The role check is read-only on T1, and Ghost 5's
  half goes to DW-326.

**Ask First:**
- Questions 1–3 were ruled (R-278–R-280). Dev builds the ruled options from "Ruled values".
- Applying the Schema migration to production (R-99): an in-session R-83 ask, then the pooler.
- Any T1 call, the recorder's and the walk's included: an in-session go before the first one. This run's own read-only
  probe was refused by the classifier.
- Any string beyond "Words".

**Never:**
- **Other stories' scope:**
  - Backup, the snapshot, D1d/D1e, B12 and `GET /themes/` with the token (7.20);
  - the drift check (7.21);
  - D1a's pill, permanence line and collision suffix (7.24);
  - the advisory lock (7.25).
- **Out of bounds here:**
  - a token field at connect;
  - a reminder, banner or Pre-flight row about a declined token;
  - re-checking a token that is already stored;
  - telling "another site's token" from "a wrong token" (R-100: Ghost answers both with one 401);
  - a "Not now" that blocks or delays a deploy.
- Never edit `claude-design-export/`, a `record` document or a generated file, and never write a count down.

## I/O & Edge-Case Matrix

"Offered" means: the site is connected and Run checks would show (`full`, or Preview-only marked by a refused upload,
R-270), no binding for the site exists, no token is stored, and no decline is recorded.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Offered | as above | Destination's button is **Next**; the rail reads Destination · Safety net · Check · Ship · Live; Next opens D1b with the token box focused | — |
| Token already stored | first deploy, `credentials_present.staff` | no Safety net; **Run checks**; a four-step rail | — |
| Declined before | first deploy, decline recorded | as "Token already stored" | — |
| Not the first deploy | a binding exists for the site, from any of the user's projects | no Safety net | a failed bindings read counts as none, so it is offered |
| Probed Preview-only, or no site | — | as 7.18a and 7.18b: no Run checks, so no Safety net | — |
| Back (D1b) | — | Destination, with **Next** focused | — |
| Add token, Owner or Administrator | `users/me` 200, `roles[0].name` ∈ {Owner, Administrator} | stored through `store()`: Vault, the flag, the audit row. Then the checks start at once: "Adding…", then "Starting…", and the rail shows Safety net ticked | — |
| Add token, below Administrator | Editor, Super Editor, Author or Contributor | Question 3's role sentence under the box; nothing stored | an unknown role name reads as below |
| Add token, Ghost 401 | an unknown key, a bad signature, a regenerated token, another site's | Question 3's "not recognised" sentence; nothing stored | — |
| Add token, the integration key | `users/me` answers 404 `NotFoundError` (no user behind it; read in source, executed at Dev) | Question 3's integration sentence; nothing stored | any other 4xx is `ghost_refused` with its status |
| Add token, malformed | not `id:hex` | `token_malformed`; Ghost is not called | — |
| Add token, empty | — | `token_empty` | — |
| Add token, Ghost down | 429, 5xx, timeout, unreachable | the chokepoint's existing sentence; nothing stored | — |
| Add token, site gone | disconnected or unlinked meanwhile | `SWITCH_WORDS.gone`; nothing stored | — |
| Not now | D1b | D1c at once; the decline is written without waiting | a failed write is logged, the offer returns on a later open, and the deploy goes on |
| Continue | D1c | the checks start ("Starting…"), Safety net ticked at 2 | Run checks' own refusals, unchanged |
| Reopen in the same page | the wizard is closed after Add token or Not now | no offer; the editor holds the answer for that site | a reload reads the stored state |
| Reopen after Remove token | token removed in Manage keys, no decline, still the first deploy | offered again | — |
| Manage keys, Add token | any site | the same check, the same sentences under the token box (`keysFieldOf` → `staff_token`) | — |
| Ship with no token | declined | uploads and activates with the Admin key; the ending's B16 says `no_token` (7.17, 7.18a) | — |

</frozen-after-approval>

## Code Map

Paths are under `apps/web/` unless written in full. `E` = `app/(app)/app/(authed)/projects/[id]/(editor)/`.

**The wizard (7.18a's, the base).**
- `components/editor/deploy-wizard.tsx`:
  - `Rail` `:168-204` numbers from `STEPS` through `stepNumber`;
  - the step is derived, never stored: `at` `:407` = `'destination'` while `stage` is null, else `stepOf`;
  - `runChecks` `:474-506` (flush, then `post({intent:'preflight'})`, then `setJob`), and `close` `:533`;
  - Destination `:784-880`, with `#deploy-run` and its `BusyLabel` `:856-871`;
  - Pre-flight `:928` (`<Rail at="check">` `:930`);
  - the step switch `:1199-1204`, the dialog with its `w-[520px]` class `:1239`, and the polite region `:1244-1246`;
  - focus moves in on mount (`:342-353`), and a step that takes away the focused control hands focus to `body` (`:357-360`).
- `E/editor.tsx:6899-6927` mounts the wizard with `key={wizard.n}`, so every open is a fresh mount at Destination.
- `lib/deploy.ts`:
  - `STEPS` `:37-42` (comment `:35`), `Step` `:43`, `stepNumber` `:80`, `stepOf` `:60-77`;
  - `DEPLOY_WORDS` `:212-360` (`back` `:265`, `starting`);
  - `ShipState` `:572-600` and `shipStateOf` `:612-673`, pure and reached by `read.test.ts`.
- `E/read.ts`:
  - the site's select `:327` (no `credentials_present` yet);
  - this project's binding `:340`;
  - the `shipStateOf` call `:545-560`.
- `E/actions.ts:190` `switchSite` is the pattern for a wizard server action: the lock, the user's own read of the link,
  then the service role scoped by `user_id`.

**The token (Story 3.6's, Manage keys).**
- `server/ghost-admin/index.ts`:
  - `store` `:154` (Vault, `credentials_present.<kind>` and `credential_change`, all in one transaction);
  - `remove` `:251`;
  - `call` `:345` (`kind`, and `credential_missing` for a staff token);
  - `fetchWithKey` `:382`, the call with the key in hand that connect uses (`sites/actions.ts:283-284`). It writes an
    audit row with the site id it is given.
- `server/ghost-admin/admin-rule.ts`:
  - `permitted` `:162` (any GET);
  - `adminUrl` `:182-211` (`new URL(relative, base)`; that a query string survives is unproven, so test it);
  - `ghostCode` `:277-292`: 401 → `ghost_unknown_key` · `ghost_bad_signature` · `ghost_unauthorized`; 429/5xx →
    `ghost_unavailable`; any other code → `ghost_refused`.
- `app/(app)/app/(authed)/sites/actions.ts`:
  - `saveKeys` `:1286`, with its header `:1279-1283` ("NOTHING VALIDATES IT AGAINST GHOST", which this story ends);
  - the staff branch `:1401-1411`, where `credential_malformed` → `token_malformed`;
  - `removeToken` `:1446`.
- `sites/keys-panel.tsx:362-399` is the staff row: `enables` + `forward`, the PasteForm, and Remove token.
- `lib/connect-rule.ts`:
  - `KEYS.staff` `:354-378` (`enables` `:357`, `forward`, `add` 'Add token', `addBusy` 'Adding…', `ask`);
  - `CONNECT_MESSAGES` `:600-700` (`token_malformed` `:641`, `token_empty`, `ghost_unavailable`);
  - `keysFieldOf` `:706`.
  - Tests: `connect-rule.test.ts:194-222` (`/full-Administrator credential/`).
- `server/routes-upload.ts:127` — no token gives `no_token`, B16's card.

**Ghost, read in source (6.58.0 and 5.130.6 npm tarballs, 2026-10-20).**
- `users/me` with a staff token resolves to the token's user: `api/endpoints/users.js:30` (5.130.6 `:29`),
  `serializers/input/users.js:17,25` (`:8,16`).
- `include=roles` is allowed: `ALLOWED_INCLUDES` `users.js:12` (`:11`).
- An Admin API key has no `context.user`, so `me` stays literal and `findOne` finds nobody, which is a 404
  `NotFoundError`. That is read, not executed.
- `fixtures.json`, on both majors: Administrator holds `theme: all`, `setting: all`. Editor and Super Editor hold
  `setting` browse/read and `theme` browse/readActive. Author and Contributor hold less. The Owner passes every check
  (`can-this.js:68-69`, `:70-71`).
- Theme download is `method: 'read'` (`themes.js:154-155`), which only Administrator and Owner hold.

**The schema.**
- `supabase/migrations/20260904120000_complete_schema.sql`:
  - `sites` `:145-172`, with `credentials_present` `:155`;
  - `private.site_credentials.staff_token_vault_ref` `:184`;
  - `project_site_bindings` `:465-476`.
- `authenticated` has table-wide select on `sites` and update on (title, favicon_url, updated_at) only
  (SCHEMA.sql `:1302-1303`). 7.17's `routes_fallback` is the precedent for a column with no new grant
  (`20261018120000_routes_fallback.sql`).

**Tests, the harness and the walk.**
- `deploy.test.ts:21` pins the rail's four labels.
- `read.test.ts` (`shipStateOf`), `deploy-run.test.ts`, `connect-rule.test.ts`.
- `busy.test.ts:355-374` is the wizard's press list.
- `app/(app)/app/harness/editor/layout.tsx`:
  - `x-inflozo-harness-ship` is parsed at `:320`;
  - `shipOf` `:390-410` (`full` is a first deploy with `n: 1`);
  - the doc comment is at `:123-133`;
  - `harnessSwitch` is the pattern for a canned server action.
- `tools/keyboard/journey.spec.mjs`, the wizard's section (~`:8750`); `floor.spec.mjs` (~`:800-860`).
- `tools/probe/run-verify-editor.cjs`: step 115 at `:12638`, and throwaway accounts at `:460-461`. The T1 connect
  pattern is a throwaway account through the wizard, read-only on T1, then Disconnect.
- `supabase/tests/rls.sql` is the copy of `RLS-TEST.sql`; 7.18c's block is at `:2793`.

## Tasks & Acceptance

**Dev gate.** Questions 1–3 are ruled (R-278–R-280), and the picture is in hand
(`_bmad-output/planning-artifacts/user-provided-assets/Staff-access-token-screen.png`). The Schema push is made, green,
and applied to production on the owner's in-session go (R-99), before any code that writes the column is pushed.

**Execution — the `Schema` push (alone, first; R-99):**
- [ ] `supabase/migrations/20261022120000_staff_token_decline.sql` -- add `sites.staff_token_declined_at timestamptz`
  (null = never declined), with a `comment on` naming FR-C1, D1c's "raised once, never again" and Question 1's grain. It
  must be re-runnable (`if not exists`). The header says there is no new grant: the tenant reads it through table-wide
  select, and only the server writes it, with the service role, as `routes_fallback` -- the decline's one home (R-278:
  per site).
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the column in
  `sites` beside `routes_fallback` (`:179`) -- the gate diffs it against the migrations.
- [ ] `…/RLS-TEST.sql`, then copied byte-identical to `supabase/tests/rls.sql` -- a **7.19 block**:
  - the column's type, nullability and comment (coalesce, as 7.18b's block);
  - as the tenant: an update of `staff_token_declined_at` is refused (42501), and a select of its own row returns it;
  - as another tenant: the row is not visible;
  - the column-grant audit still holds `sites`' three update columns
  -- one gate, run in Postgres.

**Execution — Dev:**
- [ ] `lib/connect-rule.ts` -- the strings, the codes and the role rule:
  - `KEYS.staff.full` (the disclosure), with `enables` composed from it;
  - `staffRoleOf(body)`, which takes `users[0].roles[0].name` as a string, or null;
  - `STAFF_ROLES_OK` (Owner, Administrator);
  - `roleWord(role)`, which gives the article and the name for Ghost's six staff roles and null otherwise;
  - `CONNECT_MESSAGES.token_role(role)`, `token_unknown`, `token_integration` from "Ruled values";
  - `keysFieldOf` maps the three to `staff_token`
  -- one pure rule for both surfaces.
- [ ] `server/staff-token.ts` (**new**) -- `addStaffToken({ siteId, userId, url, version, token, route }, io?)`:
  1. parse the token, and answer `token_empty` or `token_malformed`;
  2. `fetchWithKey` with `GET users/me/?include=roles`, the token in hand, and the site id and user id for the audit
     row;
  3. answer a 401 code with `token_unknown`, and a 404 `NotFoundError` with `token_integration`;
  4. answer a role outside `STAFF_ROLES_OK` with `token_role`, carrying the role;
  5. pass any other `AdminError` through;
  6. only then call `store({ kind: 'staff' })`.

  It answers `{ ok: true } | { ok: false; code; role? }`, and the `io` is handed in so it can be tested
  -- one check, two callers.
- [ ] `server/server-wiring.test.ts`'s two lists -- name `staff-token.ts`, as `routes-io.ts` is named -- the
  chokepoint stays the only Admin caller.
- [ ] `sites/actions.ts` -- `saveKeys`' staff branch calls `addStaffToken` and maps its code to `KEYS_REFUSED`, with
  `&role=` only from `roleWord`'s closed list. The header `:1279-1283` is rewritten to say what is checked now, and
  why -- Manage keys checks too (R-170).
- [ ] `sites/keys-panel.tsx` -- the error slot reads the new codes, and a `role` param outside the closed list reads as
  `token_role` with no name. `enables` comes from `KEYS.staff.full` -- S11e unchanged on screen.
- [ ] `E/actions.ts` -- two server actions beside `switchSite`:
  - `addSafetyToken(projectId, token)`: the user's own read of the project's link and the site row (connected, its
    `url` and `ghost_version`), then `addStaffToken`; it answers the sentence or ok;
  - `declineSafetyNet(projectId)`: the service role sets `staff_token_declined_at = now()`, scoped by `user_id` and
    `.is('disconnected_at', null)`, and answers ok or not.

  Neither takes the lock (they write the site, not the project), and neither logs the token -- the wizard's two writes.
- [ ] `lib/deploy.ts`:
  - `STEPS` gains `{ id: 'safety', label: 'Safety net' }` after Destination;
  - `stepsFor(safety)` returns the list with or without it, and `stepNumber(at, steps)` counts from it;
  - `ShipState.site` gains `staff` and `declined`, and `ShipState` gains `firstDeploy`;
  - `shipStateOf` takes the site's `credentials_present` and `staff_token_declined_at` and the site's bindings, and is
    `firstDeploy` when none exist (a failed read counts as none);
  - `safetyOffered(ship)` is the matrix's "Offered";
  - `SAFETY_WORDS` holds every D1b and D1c string in "Words", and `DEPLOY_WORDS.next` is 'Next';
  - the comment `:35` is updated

  -- the rule, pure.
- [ ] `E/read.ts` -- the site's select gains `credentials_present, staff_token_declined_at`; the binding read becomes
  `select('project_id, theme_name').eq('site_id', linked)`, so it gives this project's name and whether any project
  uploaded; both are passed to `shipStateOf` -- server truth for the offer.
- [ ] `components/editor/deploy-wizard.tsx`:
  - a `safety` flag, fixed at mount from `safetyOffered(ship)` and the editor's `answered` site, so the rail keeps
    Safety net ticked through the session;
  - while `stage` is null, a local view `'destination' | 'offer' | 'declined'`;
  - `Rail` takes `stepsFor(safety)`;
  - Destination shows **Next** (no busy: nothing starts) in place of Run checks while `safety` and the offer is still
    unanswered in this session; once it is answered (a cancelled job's way back included), Destination shows Run checks
    again and the rail keeps Safety net ticked;
  - D1b and D1c as drawn: the token through the Kit's `TextInput` (mono, `autoComplete="off"`, the error slot), Add
    token through `BusyLabel` with `KEYS.staff.addBusy`, and Not now and Back as Kit buttons;
  - the dialog is 700px on those two views;
  - Add token: `addSafetyToken`, then `onAnswered(siteId)`, then `runChecks()`;
  - Not now: D1c at once, `void declineSafetyNet()`, then `onAnswered`;
  - Continue: `runChecks()`;
  - focus on D1b goes to the token box, Back returns it to Next, and on D1c it goes to Continue

  -- D1b, D1c and the rail.
- [ ] `E/editor.tsx` -- hold `answered` (a site id) beside `wizard`, and pass `answered` and `onAnswered` to the
  wizard -- a reopen in the same page never asks again.
- [ ] `public/deploy/staff-token.png` (**new**, R-279) -- the owner's screenshot, copied in byte for byte from
  `_bmad-output/planning-artifacts/user-provided-assets/Staff-access-token-screen.png`. It is 570×650: Ghost 6's dark
  profile sheet, the Staff access token box outlined in red with the token blurred, and Close and Save under it. It is
  drawn in D1b's 280×150 slot with `object-fit: cover` and `object-position: bottom`, so the slot shows the box and the
  field above it. `width`/`height` go on the `<img>`, it loads eagerly, and its alt text comes from "Words". The
  `routing.test.ts` walk serves it on the app host, as `public/connect/integration.png` -- D1b's picture.
- [ ] `app/(app)/app/harness/editor/layout.tsx`:
  - `x-inflozo-harness-ship: first` (as `full`, with `firstDeploy: true`, `staff: false`, `declined: false`);
  - `full` stays not offered (`firstDeploy: false`), so existing journeys are unchanged;
  - `x-inflozo-harness-token: ok | role | unknown | integration` answers `addSafetyToken`, as `harnessSwitch` does

  -- the journeys' state.
- [ ] `deploy.test.ts` · `read.test.ts` · `connect-rule.test.ts` · `staff-token.test.ts` (**new**) ·
  `admin-rule.test.ts` -- every pure row of the matrix:
  - `stepsFor` (both lists; the four-label pin kept as the `false` case);
  - `safetyOffered` across first deploy × token × declined × capability;
  - `shipStateOf` → `firstDeploy` over another project's binding, none, and a failed read;
  - `staffRoleOf` over Ghost's answer shape for each role, and a malformed body;
  - `roleWord`'s closed list;
  - `addStaffToken` with an injected fetch: Owner and Administrator stored once; Editor, a 401, a 404 and a 503 each
    refused with `store` never called; malformed refused before any fetch;
  - `adminUrl` keeps `?include=roles`;
  - a source read of `connect-wizard.tsx`: no `staff_token` field and no `KEYS.staff`

  -- each assertion first seen red.
- [ ] `busy.test.ts` -- the wizard's press list gains Add token (`KEYS.staff.addBusy`) and Continue (`W.starting`) --
  R-98.
- [ ] `tools/keyboard/journey.spec.mjs`, pointer-free, with a control for each:
  - (a) `first`: Ship it → **Next** focused → D1b with the box focused and five labels in the rail → Esc closes → reopen
    → Back → Next; the control is `full`, which still says Run checks with four labels;
  - (b) Not now → D1c with Continue focused, then Continue → the canned Pre-flight with Safety net ticked at 2; a reopen
    in the same page says Run checks;
  - (c) `token: role`, then `unknown`, then `integration` → each sentence in the box's alert, with no step change;
    then `ok` → "Adding…", then Pre-flight;
  - (d) Manage keys at `/sites?manage=` with a refused token → the same sentence under the token box.
- [ ] `tools/keyboard/floor.spec.mjs` -- D1b at 1440 (a 700px card, the picture beside the field) and at 390 (stacked,
  no horizontal scroll) -- the frame's two widths.
- [ ] `tools/probe/record-staff-token.mjs` (**new**; a `doc-audit.py` catalogue row) -- T1, read-only, keys read
  in-process by name:
  - `users/me/?include=roles` with `GHOST6_STAFF_ACCESS_TOKEN` → 200 and its role;
  - the same token with its last hex flipped → 401 (the control);
  - `GHOST6_ADMIN_API_KEY` → the integration's answer, expected 404 `NotFoundError`;
  - each through the product's own `adminRequest`, printing status, `errors[0].type` and the role only

  -- standing rule 1 executed.
- [ ] `tools/probe/run-verify-editor.cjs` -- **step 116** on production:
  - (a) a throwaway project linked to a planted connected site (no token, no binding): Ship it → Next → D1b; Back; Not
    now → D1c → Continue → a job; close and reopen → Run checks; `staff_token_declined_at` read back set;
  - (b) the planted row's decline cleared: Add token with `hello` → `token_malformed`, then a well-formed token → the
    unreachable sentence, and `credentials_present.staff` still false;
  - (c) a second throwaway account connects T1 through the wizard: Add token with `GHOST6_STAFF_ACCESS_TOKEN` → the
    checks start, `credentials_present.staff` is true and one `admin_read` row is written; then Disconnect, after which
    `credentials_present` is all false
  -- R-82 on the real stack, read-only on T1.
- [ ] Docs -- each finding reaches its document:
  - **PRD:**
    - FR-C1 (`:200-206`): a dated note on the grain, the stored decline, the role check and its sentences, and Manage
      keys checking too;
    - Appendix H (`:1449`): "for that project" corrected per Question 1;
    - FR-C8 (`:215`): Manage keys checks the role.
  - **EXPERIENCE:**
    - the IA rows `:183`, `:187`: the rail counts the steps that show, and Safety net is skipped when a token is stored
      or a decline recorded;
    - J1's row 10 and Ending B (`:852`, `:877`).
  - **The spine:** AD-10 (`:173-177`): the role read is a `GET` signed by the token in hand, and nothing is stored
    before it.
  - **VERIFY-AT-BUILD:** the next item, `users/me` with the staff token, executed on T1.
  - **MEASUREMENTS:** §88, with the recorder's output.
  - **The epic context:** the 7.19 sub-bullet.

  Then `grep -rn` for "NOTHING VALIDATES IT AGAINST GHOST", "for that project" and the four-label rail outside its
  test, and expect nothing stale (standing rule 7).

**Acceptance Criteria:**
- Given a first deploy to a site with no token and no recorded decline, when the user presses Next, then Safety net
  asks for the Staff Access Token there. The request says it is a full-Administrator credential, says an
  Administrator's is enough, and says nothing narrower. It is never asked at connect.
- Given a token whose user is the Owner or an Administrator, when Add token is pressed, then Ghost is asked once with
  `GET users/me/?include=roles`, the token is stored, and the checks start. Given any other token, nothing is stored
  and the sentence says why.
- Given Not now, when D1c shows, then it names the three protections declined, once. Continue starts the checks, the
  deploy uploads and activates with the Admin key, and no later screen raises the token again on that site.
- Given a declined site, when the token is added in Manage keys, then the same check runs. The row says it works
  "from then on" (`KEYS.staff.forward`), and no snapshot is claimed for a theme already replaced.
- Given a first deploy that shows Safety net, when the rail draws, then it reads Destination · Safety net · Check ·
  Ship · Live (UX-DR19, before 7.20's Backup).
- Given each surface, when compared with its frame, then it matches. Safety net's offer matches D1b
  (`D1 First-Deploy Gates.dc.html:95-151`) and the decline matches D1c (`:153-206`), each at 700px. Destination's
  Next matches D1a's button (`:89`), and the rail matches D1's rail less Backup (`:51-63`).
- Given the migration is withheld, when the RLS gate runs, then the 7.19 block aborts at its first check.

## Spec Change Log

## Design Notes

**Ruled values — the one table the three questions set.** Dev builds this table; a different ruling changes it and
nothing else. *(Ruled: option 1 of each — R-278, R-279 and R-280, owner, 2026-10-20.)*

| Key | Value (option 1) | Where |
|---|---|---|
| The decline's grain (Q1) | per **site record**: asked once per site; a decline on one site never silences another, and stays through disconnect and reconnect (connect re-adopts the record, `sites/actions.ts:278`) | `sites.staff_token_declined_at` |
| D1b's picture (Q2) | the owner's own screenshot of T1's profile, the token blurred (`user-provided-assets/Staff-access-token-screen.png`), served as `public/deploy/staff-token.png` | D1b's 280×150 slot |
| Below Administrator (Q3) | "This token belongs to {an Editor}. The safety net needs an Administrator's or the Owner's token." | `token_role(role)` |
| Not recognised (Q3) | "Ghost doesn't recognise this token. Copy the current one from your Ghost profile." | `token_unknown` |
| The integration's key (Q3) | "That's an integration's Admin API key. Your Staff Access Token is on your own Ghost profile." | `token_integration` |
| Manage keys (Q3) | the same check and the same sentences | `saveKeys` |

**Words** (the frame's own unless marked).

| Key | Value |
|---|---|
| D1b title | One more step unlocks a safety net |
| D1b lead | A copy of your current theme before we replace it, plus a check that nothing else has changed it. |
| D1b who | This is a Staff Access Token, from the site Owner or an Administrator. Every staff user has one on their own profile, and an Administrator's is enough. |
| `KEYS.staff.full` (ink, 500) | It is a full-Administrator credential: anything that user can do in Ghost Admin, this token can do. |
| D1b uses | Inflozo uses it for two things only — uploading routes.yaml, and reading the live theme for the snapshot and the drift report. You can remove it at any time. |
| Field label · placeholder | Staff Access Token (`KEYS.staff.name`) · `a1f4c9e07b2d…:6f83b1c4d90e…` |
| Under the field | Stored encrypted, and only ever sent to {host}. |
| Picture's alt *(routine)* | The Staff Access Token box on a staff user's own profile in Ghost Admin |
| Buttons | Back (`DEPLOY_WORDS.back`) · **Add token** (`KEYS.staff.add`, R-170; D1b draws "Add the token") · Not now |
| D1c title · lead | Continuing without the token · Deploys work exactly the same. Three things won't be available: |
| D1c rows | No copy of your current theme before we replace it · No check that the live theme changed since we last shipped · routes.yaml uploads by hand, with a guided card |
| D1c foot · button | You can add it any time from **Manage keys**. · Continue |
| Destination's button | Next (D1a) |
| Rail label | Safety net |

**Routine calls**, each a reading of an approved source, so none is put to the owner:
- **700px on D1b and D1c,** as drawn. The other steps keep 520 (R-74, which beats 7.18a's single width).
- **A stored token or a recorded decline skips the step.** Nothing would be asked. IA `:183`'s "6 on the first deploy"
  assumed the token is asked there, and its dated note says so.
- **Add token runs the checks at once,** as Continue does. Both become "go to Backup" when 7.20 lands
  (`afterSafety`, one function).
- **The decline is written at Not now,** not at Continue. Not now is the decision; D1c is its acknowledgement.
- **Until 7.20 and 7.21 ship, D1b's copy and drift report are promises for the next two stories.** The product is
  pre-launch, and the owner is told in one line.

**Why check the role at all.** The token's work needs `setting: edit` (the routes upload) and `theme: read` (the
snapshot and drift download). Only an Administrator holds those, and the Owner passes every check (read in source,
above). An Editor's token would be kept and then fail quietly later. The commonest wrong paste, the integration's own
Admin key, looks identical (`id:hex`) and answers `users/me` with a 404. Checking before `store()` means a refusal
leaves nothing behind. `fetchWithKey` already exists for a key in hand (Story 3.2's connect).

**Why a column and not memory.** D1c is "raised once, never again". A first deploy that stops before its upload (a
gscan error, a closed wizard) has no binding yet, so without a record the next open would ask again.
`ponytail:` the editor's `answered` covers the same page; the column covers every later page.

## Owner's manual test

You test as **`umngkmr+safety719@gmail.com`**, a fresh alias, on the Ghost 6 test site (T1). Before you start, in
**ghost6.inflozo.com's Ghost Admin** (`https://ghost6.inflozo.com/ghost/`):
- make a custom integration called **Owner test 7.19**, and keep its Admin API key and Content API key open;
- open your avatar → **Your profile**, find **Staff access token**, and keep it ready to copy.

Addresses that need your project's id are written `<P>`: copy it from the address bar after step 2.

Not in this test: a token from an Editor, because T1 has no Editor. The machine proves that refusal from Ghost's own
code (Verification).

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/sign-in` | Sign in | Sign in with the alias and open the link in your inbox. | `umngkmr+safety719@gmail.com` | Start. |
| 2 | `https://app.inflozo.com/sites` | Sites | Press **Connect a site** and finish the wizard with the integration's two keys. | `https://ghost6.inflozo.com` + the two keys | ghost6 is **Connected**, and a project linked to it opens. |
| 3 | `https://app.inflozo.com/projects/<P>` | Editor | Press **Ship it**. | — | The wizard opens. The button reads **Next**, not Run checks, and the steps read **Destination · Safety net · Check · Ship · Live**. |
| 4 | same | Safety net | Press **Next**. | — | A wider card: "One more step unlocks a safety net". The sentence "It is a full-Administrator credential…" is in dark text, there is a token box with your screenshot beside it (the Staff access token box outlined in red) and "Stored encrypted, and only ever sent to ghost6.inflozo.com.", **Back** on the left, and **Add token** and **Not now** the same size. |
| 5 | same | Safety net | Press **Back**, then **Next** again. | — | Back to the first step, then Safety net again. |
| 6 | same | Safety net | Type in the box and press **Add token**. | `hello` | "That doesn't look like a Staff Access Token — copy the whole thing…" under the box. |
| 7 | same | Safety net | Replace it with this made-up token and press **Add token**. | `aaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` | "Adding…", then Question 3's "Ghost doesn't recognise this token…" under the box. |
| 8 | same | Safety net | Paste the integration's **Admin API key** and press **Add token**. | the Admin API key | Question 3's sentence that it is an integration's key. |
| 9 | same | Safety net | Paste **your profile's Staff access token** and press **Add token**. | your token | "Adding…", then the checks run, and the steps show **Safety net** ticked. |
| 10 | `https://app.inflozo.com/sites` | Sites → Manage keys | Close the wizard. On ghost6 press ⋯ → **Manage keys**. | — | Staff Access Token says **Added**. Press **Remove token**: it says **Not added**. |
| 11 | `https://app.inflozo.com/projects/<P>` | Editor → Safety net | Press **Ship it**, then **Next**, then **Not now**. | — | "Continuing without the token" with three rows: no copy of your theme, no check for changes, routes.yaml by hand. Then "You can add it any time from Manage keys." and **Continue**. |
| 12 | same | Pre-flight | Press **Continue**. | — | "Starting…", then the checks, with Safety net ticked. |
| 13 | same | Destination | Close the wizard and press **Ship it** again. | — | No Safety net: the button reads **Run checks**, and four steps. Inflozo does not ask again. |
| 14 | same, then `https://ghost6.inflozo.com` | Ship | Press **Run checks**, then **Ship it**, then **View site ↗**. | — | Live, with the confetti, and "Upload routes.yaml yourself" below it (no token). The site shows your design. Do not follow that card. |
| 15 | `https://app.inflozo.com/sites` | Manage keys | On ghost6, ⋯ → **Manage keys**. Paste the integration's Admin API key in the token box and press **Add token**. Then paste your profile's token and press **Add token**. | the two keys | The same sentence as step 8, then **Added**. The row still says the safety-net copy starts "from then on". |
| 16 | `https://ghost6.inflozo.com/ghost/`, then `https://app.inflozo.com/sites` | Cleanup | In Ghost, go to **Settings → Design → Change theme → Casper → Activate**, delete the `inflozo-…` theme, and delete the Owner test 7.19 integration. In Inflozo, ⋯ → **Disconnect** on ghost6. | — | T1 is back as it was, and Inflozo holds no key of yours. |

## Questions for the owner

Questions 1–3 were ruled on 2026-10-20, each option 1 (R-278, R-279, R-280); none is open. "Ruled values" in Design
Notes holds what they set.

### Question 1 — After "Not now", where does Inflozo stop asking?

**In plain English.** On a project's first deploy to a site, the new Safety net step asks for your Ghost Staff Access
Token. If you press **Not now**, Inflozo must remember that so it never asks again. The papers disagree on what it
remembers it for: one says "never raised again for that project", another says the step is "first deploy to a site
only". The token itself belongs to a site, not a project.

**An example.** You press Not now on Orbit Weekly's first deploy. Later you point the same project at a second site,
Field Notes, and ship there for the first time. Should Inflozo offer the safety net for Field Notes?

1. **(RECOMMENDED) Once per site.** Each site's first deploy asks once. A Not now on Orbit Weekly never silences Field
   Notes, which asks once on its own. Orbit Weekly is never asked again, by any project, even after a disconnect and
   reconnect.
2. **Once per project.** After a Not now, that project never asks again, on any site. A different project asks again
   on Orbit Weekly.
3. **Once per account.** One Not now, and Inflozo never asks on any site.

**Ruled: option 1 (owner, 2026-10-20) — R-278.** *"Once per site. Each site's first deploy asks once. A Not now on Orbit
Weekly never silences Field Notes, which asks once on its own. Orbit Weekly is never asked again, by any project, even
after a disconnect and reconnect."*

### Question 2 — The picture beside the token box

**In plain English.** The design draws a picture next to the token box: the Staff access token panel on your own
profile in Ghost Admin. Taking it needs a login to ghost6.inflozo.com's Ghost Admin, and there is none in
`tools/probe/.env`. For the connect wizard you took the screenshot yourself (Story 3.2).

**An example.** A cropped picture of Ghost Admin's "Your profile" with the **Staff access token** box and its Copy
button, the token itself blurred out, so a customer sees exactly where to look.

1. **(RECOMMENDED) You take one screenshot** on ghost6.inflozo.com: your avatar → Your profile → the Staff access token
   box, with the token blurred or cut off. Tell me where you saved it, as you did for the connect wizard.
2. **You add a test Administrator login** for ghost6 to `tools/probe/.env` (`GHOST6_ADMIN_EMAIL`,
   `GHOST6_ADMIN_PASSWORD`), and I capture it with a headless browser. It can be captured again whenever Ghost's look
   changes.
3. **No picture.** The slot shows the path in words instead: "Ghost Admin → your avatar → Your profile → Staff Access
   Token."

**Ruled: option 1 (owner, 2026-10-20) — R-279.** *"You take one screenshot on ghost6.inflozo.com: your avatar → Your
profile → the Staff access token box, with the token blurred or cut off."* He saved it at
`_bmad-output/planning-artifacts/user-provided-assets/Staff-access-token-screen.png`. It is 570×650, Ghost 6's dark
profile sheet with the box outlined in red and the token blurred.

### Question 3 — When a pasted token cannot do the job

**In plain English.** Any staff user can make a Staff Access Token, but only an Administrator's or the Owner's can do
the safety net's work. Today Manage keys keeps any token that looks right, and a wrong one only shows up later as
"Upload routes.yaml yourself". Inflozo can ask Ghost whose token it is before keeping it.

**An example.** Your writer Sam is an Editor on Orbit Weekly. You paste Sam's token into Safety net. Or you paste the
integration's Admin API key by mistake: it looks just like a token.

1. **(RECOMMENDED) Ask Ghost first, keep nothing that fails, one sentence per cause.** This applies in Safety net and
   in Manage keys alike.
   - An Editor's (or a Super Editor's, Author's or Contributor's) token: "This token belongs to an Editor. The safety
     net needs an Administrator's or the Owner's token."
   - A token Ghost does not know (mistyped, regenerated, or from another site): "Ghost doesn't recognise this token.
     Copy the current one from your Ghost profile."
   - The integration's key: "That's an integration's Admin API key. Your Staff Access Token is on your own Ghost
     profile."
2. **Ask Ghost, keep it anyway, and warn once.** For example: "This token belongs to an Editor, so routes.yaml and the
   copy of your theme won't work with it."
3. **Don't ask** (as Manage keys does today). Any token that looks right is kept, and a wrong one shows up later on the
   routes card.

**Ruled: option 1 (owner, 2026-10-20) — R-280.** *"Ask Ghost first, keep nothing that fails, one sentence per cause.
This applies in Safety net and in Manage keys alike."*

## Verification

R-82's real services for this story:
- production's **Supabase**: the migration, applied through `SUPABASE_DB_POOLER_URL` on the owner's in-session go and
  read back;
- **Vercel** (`app.inflozo.com`);
- **T1** (`ghost6.inflozo.com`), read-only: `GET users/me/?include=roles`. Ghost 5's half goes to DW-326 (R-238).

**Commands:**
- `bash supabase/tests/run-rls-gate.sh` -- expected: green, with the 7.19 block's PASS lines. On a scratch copy without
  the migration, it aborts at the 7.19 block's first check.
- Production, after the apply -- expected:
  - `information_schema.columns` shows `sites.staff_token_declined_at` as `timestamp with time zone`, nullable;
  - `col_description` shows its comment;
  - `column_privileges` grants `authenticated` no UPDATE on it.
- `pnpm check` -- expected: green, with the new `deploy`, `read`, `connect-rule`, `staff-token` and `admin-rule` cases
  among the package's own printed count.
- `pnpm keyboard` -- expected: green, with journeys (a)–(d) and their controls passing; each new assertion first seen
  red at HEAD (`first` draws Run checks there).
- `env $(grep -E '^GHOST6_(URL|STAFF_ACCESS_TOKEN|ADMIN_API_KEY)=' tools/probe/.env | xargs) node tools/probe/record-staff-token.mjs`
  -- expected:
  - the staff token → 200 with `Owner`, or `Administrator` if the token is an Administrator's;
  - the flipped token → 401 (the control);
  - the Admin key → 404 `NotFoundError`.
  
  Any other answer for the integration's key changes `token_integration`'s trigger before Dev ships it.
- `node tools/probe/run-verify-editor.cjs` from a clean worktree at the deployed sha -- expected: step 116 PASS, with
  (c) leaving `credentials_present` all false after its Disconnect, and steps 113–115 unchanged.
- `python3 tools/doc-audit.py --check` (twice) -- expected: PASS.
- `grep -rn --exclude=.env -e 'NOTHING VALIDATES IT AGAINST GHOST' -e 'for that project' apps tools _bmad-output/planning-artifacts`
  -- expected: nothing stale. The record documents keep theirs.

**Manual checks:**
- The owner walks "Owner's manual test" on `app.inflozo.com` after Deploy (R-80).
- D1b and D1c beside the built wizard at 1440 and 390.
