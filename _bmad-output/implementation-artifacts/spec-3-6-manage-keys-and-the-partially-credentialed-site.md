---
title: 'Story 3.6 — Manage keys, and a partially credentialed site as an ordinary state'
type: 'feature'
created: '2026-09-09'
status: 'done'
baseline_commit: '8c301682b72bc598e082f62c4f6813244418dfbd'
review_loop_iteration: 1
owner_test: passed
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story every connected site has an **API keys** window that opens over your Sites list
when you pick **Manage API keys** from the ⋯ on its card — the three credentials Inflozo can hold
for that site down the left, and everything you only read down a column on the right, so it fits on
a laptop screen instead of running off the bottom. You can paste a fresh Admin or Content key into
it when you roll your keys in Ghost, add or take away the Staff Access Token whenever you like, and
press **Test connection** to watch Inflozo actually reach your Ghost and report back. Not having the
token is shown as a choice you have not made yet, never as something wrong with your site.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A customer who regenerates a key in Ghost Admin has nowhere to paste the new one — the
only recovery is to disconnect and reconnect, which is what FR-C6 exists to avoid. The Staff Access
Token has no way in at all, so D1c's promise ("you can add it any time from Manage keys") points at a
screen that does not exist. And the credential audit log — the one control in this area that
*detects* rather than prevents — is silent about every key that goes in and every key that comes out
(**DW-76**, the owner's ruling at Story 3.5's Question 3).

**Approach:** One surface, S11d's chrome around B20's three credential rows, reached from the ⋯ menu
and from a route of its own so it works with JavaScript off — the shape Story 3.5 built for the
disconnect confirm. Each row states present-or-absent and what it enables; a paste is validated
against the customer's real Ghost before it is stored, so a typo is refused where it was typed rather
than surfacing as a broken site the next day. The chokepoint gains the audit rows both its writers
have always owed, and one new column — the Admin key's **public id half** — which is what lets a
re-connect recognise a Ghost install it has met before and print FR-C8's "Moved domains?" hint.

## Boundaries & Constraints

**Always:**

- **The screen shows what Inflozo HAS, never what it holds.** The decrypted secret does not leave
  `server/ghost-admin/index.ts` (AD-10) and this story does not widen that by one byte: no reveal
  control, no decryption into a render path, no key in a response body. What may be drawn is the
  Admin key's **id half** — the part before the colon, which travels in the header of every JWT and
  is not a secret — and the Content API key, which is browser-safe by Ghost's design (FR-C3).
- **A pasted Admin key is validated against the customer's own Ghost before it is stored**, by the
  path `connectSite` already uses: `fetchWithKey` on `GET /admin/config/`. A key that Ghost refuses
  is refused under its own field and nothing is written. The Content key is checked **from the
  browser** by `checkContentKey` (FR-C2), exactly as connect does, and stored unchecked with scripts
  off.
- **A pasted Admin key that belongs to a DIFFERENT Ghost install is refused, and the refusal is
  Ghost's own** *(renegotiated by the owner, R-100, 2026-09-09 — see `## Questions for the owner`,
  Question 2)*. The key is sent to THIS record's Ghost, which has never issued it and answers 401
  `Unknown Admin API Key`: refused under `admin_key`, nothing written. Inflozo cannot say more than
  that, because `api_keys` carries no domain or install identity and Ghost gives the same 401 to a
  wrong key and to another site's key (MEASUREMENTS §37; executed T3→T1 and T1→T3 on 2026-09-09 with
  T1→T1 200 as the control).
- **A Ghost that now reports a DIFFERENT public address is refused, and THAT is where disconnect +
  reconnect belongs.** After validating, read `GET /admin/site/` and compare its `url` against the
  record's `site_settings.public_url`. This is the hazard FR-C8 killed edit-URL-in-place for —
  carrying one site's record, snapshot and first-upload flag onto another live Ghost — reaching the
  record through the key field instead of the URL field, and it is a domain move. `site/` validates
  nothing (it answers 200 to any key at all, §38a and `epic-3-context.md:23`), so it is read only
  after `config/` has passed and is used as an identifier, never as a check. **The comparison is
  Ghost's answer against Ghost's answer and never against the typed address:** with no
  `site_settings.public_url` recorded there is nothing to compare and no comparison is made.
- **The URL is read-only text, and the screen says why.** No field, no edit affordance, guarded or
  otherwise (A9 item 17; the affordance does not exist rather than being defended).
- **Removing the token degrades, never disconnects.** `remove({ kind: 'staff' })` flips
  `credentials_present.staff` and nothing else; the site stays connected and the three token-dependent
  capabilities read as unavailable with their reason.
- **DW-76: both writers audit.** `public.credential_action` gains **one** value, and `store()` and
  `remove()` each write one row through it. The counts the harness derives from `vault_decrypt` must
  not move — a decryption is still one row per decryption.
- **No count, no plan number, no deadline in the copy.** Every word this screen shows lives in one
  object in `lib/connect-rule.ts`, as `DISCONNECT` does, and the harness reads it from there
  (standing rule 4).
- **R-98**: every control that starts work is a `Submit` with a required `busy` label, and the new
  route carries whatever `busy.test.ts` requires of it — recorded with its reason, as
  `sites/disconnect` is.
- **Every control is a real `<form>`** posting a server action, and the ⋯ row is an `<a href>` with a
  real destination, so the whole surface works with JavaScript off.
- The migration follows Epic 2's rule: one new file, `SCHEMA.sql`, `RLS-TEST.sql` and the gate's
  copies updated in the same commit, `bash supabase/tests/run-rls-gate.sh` green, and applied to the
  hosted database **by hand in the Deploy phase**.

**Ask First:**

- Any change to `ADMIN_WRITES`. This story adds no Ghost write — every call it makes is a `GET`.
- Widening what leaves the chokepoint. If a task appears to need the decrypted Admin key or the Staff
  token in a page, a response or a log, stop: the answer is a different design, not an exception.

**Never:**

- **Never build a plan field.** Preview-only is probed, not declared (FR-C2), and B15's *Re-check
  plan* is where a customer re-runs it. This screen has nothing plan-shaped on it.
- **Never write `sites.health` or `sites.capability` here.** The health badge, the "Reconnect needed"
  state, the once-per-transition email and its 7-day cap are **Story 3.7's** state machine; a manual
  test that wrote `health` would fire that machine's transition semantics from outside it. This story
  reports its test result on its own screen and stores nothing.
- **Never draw a Remove control for a credential that is absent**, and never a greyed one (UX-DR3).
  Nothing stores a staff token until Epic 7, so **Remove token** is drawn on no production site today
  — that is the correct behaviour, not a gap.
- **Never edit the connect action's re-adoption branch or its probe/brand tail.** This story adds one
  hint to that flow and touches nothing else in it.
- **Never claim a snapshot can be reconstructed.** Adding the token enables the snapshot *from that
  point forward*; the copy says so and offers nothing retroactive.
- **No sixth deletion path.** `remove()` is already in AD-32/AD-33's five.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Open the screen | A connected site owned by the caller | Three rows: Admin (present, its id half then dots), Content (present, its first characters then dots), Staff (**Not added**), each with its one line; the URL as read-only text with the "Fixed for this connection" reason | N/A |
| Paste a good Admin key | A key from the same site's integration | `GET /admin/config/` 200 → `GET /admin/site/` url matches → `store()` re-encrypts, deletes the old secret behind it (DW-44), stamps `admin_key_rotated_at`, writes `admin_key_id`, writes one audit row | N/A |
| Paste a malformed key | `not-a-key` | Nothing written; the field says what an Admin API key looks like | `parseCredential` → `credential_malformed`, under `admin_key` |
| Paste a key Ghost refuses | A well-formed key from a deleted integration, a regenerated one, **or one issued by a different Ghost install** — all three land here (R-100) | Nothing written; the field says the key does not match this site — never "expired" | `ghost_unknown_key` / `ghost_unauthorized`, under `admin_key` |
| Paste ANOTHER install's Admin key | A key valid on some other Ghost | **Refused at `config/` by that Ghost's own 401**, nothing written. The sentence is Ghost's, not ours: Inflozo cannot tell this from a wrong key *(renegotiated, R-100)* | `ghost_unknown_key`, under `admin_key` |
| This Ghost now reports a different address | A valid key for THIS Ghost, whose `GET /admin/site/` url host differs from the recorded `site_settings.public_url` | **Refused**, nothing written, and the sentence names disconnect + reconnect | `keys_other_site`, under `admin_key` |
| …and no address was ever recorded | The same, on a record whose `site_settings.public_url` is absent | **No comparison and no refusal** — there is no Ghost answer to compare against, and comparing with the typed admin origin refused legitimate Ghost(Pro) rotations for ever (review, 2026-09-09) | N/A |
| Paste a Content key | A key the browser's `settings` read accepts | `sites.content_key` updated, `credentials_present.content` true | A 401 stops the submit under `content_key`; anything else lets the server answer |
| Add the Staff token | A `id:secret` token pasted into the token row | `store({ kind: 'staff' })`, `credentials_present.staff` true, the row becomes present with its own removal control; one audit row | Malformed → `credential_malformed` under `staff_token`; the store failing → the row is unchanged and the page says so |
| Remove the token | A site whose `credentials_present.staff` is true | `remove({ kind: 'staff' })`, the Vault secret gone behind it, the row back to **Not added**, the site still **Connected**; one audit row | `remove()` throws → nothing changes and the page says the credential store could not be reached |
| Test connection | Press it on a site with a stored Admin key | One `GET /admin/config/` through `call()`; the result is drawn on this screen — what it proved, and what still needs the token | Ghost refuses or is unreachable → the same code table's sentence, on the screen, nothing written |
| Test connection, no Admin key | A record whose `credentials_present.admin` is false | The button is **absent** — there is nothing to test (UX-DR3) — and the Admin row asks for the key instead | N/A |
| Somebody else's site id | A real id the caller does not own, in the URL or forged into a form | Nothing written, nothing disclosed | Read under the caller's own session → RLS matches no row → `notFound()` |
| A disconnected record's id | The caller's own, already let go | Redirect to `/sites` — the answer `sites/disconnect` gives the same state | N/A |
| Moved domains | A new-site connect whose Admin key id matches a record the caller already has | The connect succeeds and the new site's card carries FR-C8's hint: re-point your projects, the old site's snapshot is kept for 90 days | N/A |
| Moved domains, an older record | A record connected before this story, so `admin_key_id` is null | No hint — a null never matches, and a missing hint is not a wrong one | N/A |

</frozen-after-approval>

## Code Map

- `supabase/migrations/20260909180000_credential_audit_and_key_id.sql` -- **the one migration.** Two changes:
  `alter type public.credential_action add value 'credential_change'` (the enum is at
  `20260904120000_complete_schema.sql:744`, six values today), and
  `alter table private.site_credentials add column admin_key_id text` (the table is at `:180`).
  **`add value` and a row USING that value cannot share a transaction** — verify by execution against
  the gate's container rather than trusting this sentence (standing rule 1); if the gate's apply step
  runs migrations in one transaction, the value is still only *added* here, so nothing in the
  migration uses it.
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` ·
  `RLS-TEST.sql` · their `supabase/` copies -- **the same two changes, same commit.**
  `run-rls-gate.sh` refuses to run on drifted copies, which is the control that they landed. Add the
  gate assertion the new column needs: `private.site_credentials` is still unreachable over PostgREST
  with the new column on it.
- `apps/web/server/ghost-admin/index.ts` -- **four changes to the chokepoint, and no fifth.**
  (1) `store()` writes `admin_key_id` for `kind: 'admin'` — `parseCredential` at `admin-rule.ts:56`
  already returns the `kid` and it is refused before Vault, so the value is in hand; the `on conflict`
  upsert takes it in the same statement. (2) `store()` and (3) `remove()` each call the existing
  private `audit()` (`:76`) with `action: 'credential_change'` and
  `detail: { kind, direction: 'in' | 'out' }` — **inside the same `sql().begin()` as the write**, so a
  rolled-back store leaves no row claiming it happened. (4) a new export `findSiteByAdminKeyId({
  userId, kid })` returning `{ siteId, url, disconnectedAt } | null`, because `private` is reachable
  only from this module's pooler connection (§21j) — it is the connect action's lookup for the
  "Moved domains?" hint. `remove()`'s own doc comment already names this story ("Story 3.6's Manage
  keys renders that column as 'Key removed 15 Aug'"); `*_rotated_at` is now read for real.
- `apps/web/lib/connect-rule.ts` -- **every word of the screen, in one object.** A `KEYS` object
  beside `DISCONNECT` (`:190`): the menu item, the screen title and subtitle, the three credential
  names, the three "what it enables" lines (B20's own sentences, and the token's is D1b's plain
  full-Administrator disclosure — *say so plainly, do not soften it*), the URL row's reason, the
  roll-keys hint (Ghost Admin → Settings → Integrations → Inflozo → Regenerate), the button labels
  with their `busy` twins, the removal confirm, the test-result lines, and FR-C8's `movedDomains`
  hint. New entries in `CONNECT_MESSAGES` (`:211`): `keys_other_site`, `keys_failed`,
  `token_malformed`. **No number in any of it** — `connect-rule.test.ts` already asserts that shape
  for `DISCONNECT`; extend the assertion to `KEYS` rather than writing a second one.
- `apps/web/app/(app)/app/(authed)/sites/keys-panel.tsx` -- **new: the surface itself, ONE component
  for both the dialog and the route**, exactly as `disconnect-confirm.tsx` is one component for both
  (its header records why, and it is the pattern to follow, not to re-derive). No `'use client'`: it
  is markup plus `<form action={…}>` dispatches. It draws S11d's chrome — the title pair, the
  read-only URL row with its reason, the roll-keys hint, the footer — around B20's three credential
  rows. The Content key's pre-submit browser check needs a client island; keep it as small as
  `content-check.ts`'s caller in `connect-wizard.tsx` and leave the rest server-rendered.
  **AMENDED BY THE OWNER'S TEST (finding 2, 2026-09-10):** the chrome is now
  `claude-design-export/Inflozo/S11e Manage Keys Popup.dc.html` *(moved there from `design/ManageKeys/`
  on his ruling at Question 4, 2026-09-10)* — a 900px window, header with a ✕, a body of
  two columns (B20's three rows on the left, the context rail on the right with **Test connection**
  on its bottom edge), and a footer of Cancel. Same sentences, same order within each half; the body
  is what scrolls, which is the length complaint answered.
- `apps/web/app/(app)/app/(authed)/sites/keys-screen.tsx` -- **new at the Fix: the READS, once, for
  both places the panel appears.** It is what makes "one component, one credential read" true now
  that there are two routes, and it is the file `server-wiring.test.ts` names as the chokepoint's
  third allowed importer.
- `apps/web/app/(app)/app/(authed)/sites/panel-modal.tsx` · `.../sites/panel-link.tsx` ·
  `.../sites/keys-skeleton.tsx` · `.../sites/(list)/page.tsx` -- **the popup** (finding 1 of the
  first test, and findings 1 to 5 of the second). **`/sites?manage=<id>` — a QUERY PARAMETER ON THE
  LIST, not a route of its own.** The ⋯ row keeps its `href` to `/sites/keys?site=…` (the full page,
  and the whole scripts-off story) and a plain click opens the parameter, which the list draws in a
  `<dialog>` with the panel inside its own `<Suspense>`; the credential read is still one, taken
  only when the panel is opened, because with no `?manage=` there is nothing to render.
  **It was a Next INTERCEPTING ROUTE for one day and that is what the owner's second test was
  about:** an intercepted popup lives at the panel's own URL, so opening it moved the path off
  `/sites` and the shell stopped drawing the top bar, and every answer from inside it was a
  navigation Next did not intercept — the full page loaded behind the still-open window and took
  the list with it. `panel-modal.tsx` carries the measurements. **Deleted with it:**
  `sites/layout.tsx`, `sites/@modal/**` and `keys-back.tsx`, none of which has anything left to do.
- `apps/web/app/(app)/app/(authed)/sites/keys/page.tsx` -- **new route, `/sites/keys?site=<id>`.**
  Copy `sites/disconnect/page.tsx` wholesale, including its **three-way read split** — `22P02` →
  `notFound()`, a failed read → thrown and logged, no row → `notFound()`, already disconnected →
  `redirect('/sites')`. That split is a review finding from 2026-09-09 and re-deriving it is how it
  gets lost. Reads the row under the caller's own session (RLS decides the page exists) and the
  credential row through `ghost-admin`.
- `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` -- **one row added, above the rule.**
  `Manage API keys` is the frame's third item (`S11 Sites.dc.html:80`) and its glyph is the key with
  the diagonal stroke; the rule and Disconnect stay below it. Same `<a href>`-intercepted-into-a-
  `<dialog>` shape as Disconnect, same modifier guard **including `altKey`** (a review finding), and
  the menu keeps its 196px. The frame's other two rows — Re-check connection, Reconnect — are 3.7's
  and stay absent.
- `apps/web/components/kit/icons.tsx` -- add the frame's key glyph (`S11 Sites.dc.html:80`). `Eye` and
  `EyeOff` exist at `:75-81` and are **deliberately not used here**: there is nothing to reveal.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- **three new exports, in this file because a
  `'use server'` module may export only async functions** (the file's own header at `:60-77` records
  what happens otherwise). `saveKeys` — validate, guard the install, `store()` what changed, redirect;
  `removeToken` — `remove({ kind: 'staff' })`; `testConnection` — one `call()` on `GET /admin/config/`,
  the result carried back in the URL as `?recheck=` and `?disconnect=` already do (`:75`, `:88`).
  Each gets its **own** route constant beside `DISCONNECT_ROUTE` (`:64`) — stamping a key write
  `sites/connect` is the exact defect the review of 2026-09-09 caught, and DW-76's rows now carry that
  route into the audit log for real.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`connectSite`, `:136`) -- **one addition, at the
  end.** After the site row exists and `store()` has run, `findSiteByAdminKeyId` for a match on
  another of this caller's records; on a hit, redirect carrying `?moved=<newSiteId>`. It rides the
  existing redirect at `:381`, before the brand branch, and changes nothing else in that action.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- two changes. `?moved=` reads exactly like
  `?recheck=` and `?disconnect=` (`:88-95`) and puts the hint Banner on the one card it belongs to;
  the card's link to `/sites/keys?site=…` is the ⋯ row and nothing else on the card moves (**DW-57**:
  the ⋯ stays the header row's, the pills line and the state line are untouched).
- `apps/web/lib/menu.ts` · `apps/web/components/kit/dialog.ts` -- **read-only evidence and the shared
  vocabulary**: `item`, `openMenu`, `arrowKeys`; `sheet`, `sheetBox`, `title`, `openOnCancel`,
  `closeOnBackdrop`. `sheetBox` is the half the dialog and the route share — hand-copying it is a
  drift the review of 2026-09-09 already caught once.
- `apps/web/app/(app)/app/(authed)/sites/content-check.ts` -- **read-only evidence and the reuse
  point**: `checkContentKey`, FR-C2's browser-side half, already executed on both majors (§38b).
- `apps/web/server/ghost-admin/admin-rule.ts:56` (`parseCredential`) · `:78` (`mintJwt`) · `ADMIN_WRITES`
  -- **read-only evidence.** A Staff Access Token is `id:secret` and parses identically (the epic's
  own note, executed). `ADMIN_WRITES` is untouched: every call here is a `GET`.
- `apps/web/server-wiring.test.ts` · `apps/web/busy.test.ts` · `apps/web/app-routes.test.ts` --
  **the three auditors that must stay green.** No new privileged importer (both files are already on
  both lists). `busy.test.ts` needs the new route's row with its reason, as `sites/disconnect` has;
  **and it is `tsc` inside `pnpm check`, not `busy.test.ts`, that guards a Kit `Submit`'s `busy` prop**
  — executed at Story 3.5's review, and recorded here so it is not leaned on again.
- `apps/web/connect-rule.test.ts` -- the pure tests for `KEYS`, the new `CONNECT_MESSAGES` entries and
  the no-number assertion; `:136-140` is the existing site-cap block.
- `tools/probe/run-verify-ghost-admin.py` -- this story's live steps, and **the docstring's step list
  is derived from the source, never retyped** (standing rule 4, and the correction Story 3.4 needed
  three times).
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-76 closes here.** DW-54's
  `staff-removed` gap closes with it — this is the first product path that stores and removes a staff
  token. DW-77 stays open and is Epic 7's.
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:128` — the Manage
  Keys row's "Reached from" says *site ⋯ menu · any "Reconnect needed"*; the second half is Story
  3.7's, which builds the state. Record that there, beside the row (standing rule 3).

## Tasks & Acceptance

**Execution:**

- [x] `supabase/migrations/20260909180000_credential_audit_and_key_id.sql` + `SCHEMA.sql` + `RLS-TEST.sql` and
      their `supabase/` copies -- add `credential_change` to the enum and `admin_key_id` to
      `private.site_credentials`, with the gate assertion for the new column -- DW-76 and the moved-
      domains hint, in one migration, applied by hand at Deploy.
- [x] `apps/web/server/ghost-admin/index.ts` -- write `admin_key_id` in `store()`; audit inside both
      `store()` and `remove()`, in their own transactions; add `findSiteByAdminKeyId` -- the log stops
      being silent about half its traffic, and `private` stays reachable from one module only.
- [x] `apps/web/lib/connect-rule.ts` · `apps/web/connect-rule.test.ts` -- add `KEYS` and the three new
      message codes, and extend the no-number assertion to cover them -- one home for the words, so
      the screen and the harness cannot disagree.
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- add `saveKeys`, `removeToken` and
      `testConnection`, each with its own route constant; add the moved-domains lookup and
      `?moved=` redirect to `connectSite` -- FR-C8's flow, and the hint on the path FR-C8 puts it on.
- [x] `apps/web/components/kit/icons.tsx` · `.../sites/site-menu.tsx` -- add the frame's key glyph and
      the **Manage API keys** row above the rule -- the frame's own third item, in the menu 3.5 built
      rather than a second one (DW-57).
- [x] `apps/web/app/(app)/app/(authed)/sites/keys-panel.tsx` · `.../sites/keys/page.tsx` ·
      `apps/web/busy.test.ts` -- the surface as one component, its route with `disconnect/page.tsx`'s
      three-way read split, and the route's `busy.test.ts` row with its reason -- one component and
      one split, so the JavaScript-off path is the same screen and not a second one.
- [x] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- read `?moved=` and put the hint on its
      own card -- the shape `?recheck=` and `?disconnect=` already have.
- [x] `tools/probe/run-verify-ghost-admin.py` -- this story's live steps against T1 and T3, docstring
      extended from the source -- R-82: a review that did not touch the real services is not a review.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` ·
      `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` -- close DW-76
      and DW-54's `staff-removed` half; record on EXPERIENCE.md:128 that the "Reconnect needed" entry
      point is Story 3.7's -- propagate, never localise (standing rule 3).

**The Fix, 2026-09-10 — the owner's two findings, both inside this story (R-80 as amended):**

- [x] `apps/web/.../sites/panel-modal.tsx` · `.../sites/keys-screen.tsx` · `.../sites/site-menu.tsx`
      -- **finding 1: the popup.** The ⋯ row keeps its `href` and its destination and its click
      becomes a guarded `router.push`; `keys-screen.tsx` is the one component both chromes render,
      so the credential read is still taken once and only when the panel is opened. *(Built as an
      intercepting route on 2026-09-10 and rebuilt as `/sites?manage=…` the same day, on his second
      test of it — Change Log 13.)*
- [x] `apps/web/.../sites/keys-panel.tsx` · `apps/web/components/kit/dialog.ts` ·
      `apps/web/components/kit/icons.tsx` -- **finding 2: S11e's two columns.** The 900px `panelBox`
      beside the 460px `sheetBox` (one vocabulary, two widths), the header/body/footer split, the
      context rail, and the frame's own **Test connection** glyph. Same content, nothing removed;
      the Admin row's mask stays, which is the owner's Question 3 ruling.
- [x] `apps/web/.../sites/actions.ts` -- the three keys actions redirect with `RedirectType.replace`,
      so one Back out of the popup is always the Sites list however many keys were saved or refused.
- [x] `apps/web/busy.test.ts` · `apps/web/server-wiring.test.ts` ·
      `tools/probe/run-verify-ghost-admin.py` ·
      `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` -- the two
      auditors' reasons rewritten to what is now true, the harness's `keys-screen` step driven
      through the ⋯ row rather than a `page.goto`, a new `keys-popup` step over the popup's own
      behaviour, and EXPERIENCE.md's Manage Keys row naming S11e (standing rule 3).

**Acceptance Criteria:**

- Given a connected site, when I open its ⋯ menu, then **Manage API keys** sits above the thin rule
  with Disconnect below it, and **the menu and the screen match `S11 Sites.dc.html` S11d and
  `B Missing Surfaces.dc.html` B20 as re-specified** — three credentials, one line each on what they
  enable, "Not added · Add token", the URL as read-only text, and **no grantable scopes and no plan
  field** (R-74; A9 item 17).
- Given the screen, when it draws a credential, then it says present or absent **and never an error
  badge**, and no control appears for a credential that could not act on it (UX-DR3).
- Given I paste a fresh Admin key from the same site, when I save, then Ghost is called to prove it
  before anything is stored, the old Vault secret is gone behind the new one, and
  `admin_key_rotated_at` moves.
- Given I paste an Admin key belonging to a different Ghost install, when I save, then it is
  **refused** and nothing is written — by that Ghost's own 401, under the Admin key field, in Ghost's
  words *(renegotiated by the owner, R-100, 2026-09-09; the original promised our own
  disconnect + reconnect sentence, which Inflozo has no way to earn)*.
- Given my Ghost now reports a different public address than the one recorded at connect, when I save
  a key, then it is **refused**, nothing is written, and the sentence names disconnect + reconnect —
  and given no address was ever recorded, then no such comparison is made at all.
- Given a site with no Staff Access Token, when I add one and then remove it, then the site stays
  **Connected** through both, `credentials_present.staff` follows, and the Vault secret is gone after
  the removal.
- Given either of those two writes, when it completes, then `private.credential_audit` carries exactly
  one `credential_change` row for it, stamped with **this screen's own route** and holding no
  credential in `detail` (DW-76).
- Given I press **Test connection**, when it runs, then the button reads its `busy` label and is
  `aria-disabled` + `aria-busy` until the result lands, and the result says what was proved and what
  still needs the token (R-98).
- Given the URL row, when I look for a way to change it, then there is **none** — not a field, not a
  disabled field — and the row says why.
- Given a new-site connect whose Admin key matches a record I already have, when it succeeds, then the
  new card carries FR-C8's "Moved domains?" hint naming the 90-day snapshot retention.
- Given JavaScript is disabled, when I open Manage keys from the ⋯ and save a key, remove the token
  and test the connection, then all four work.
- Given the credential store cannot be reached, when I save or remove, then nothing changes and the
  screen says why.
- Given I pick **Manage API keys** from a card's ⋯, when it opens, then it is a **window over the
  Sites list** and not a page instead of it — the cards are still behind it — and the row's `href`
  and destination are unchanged, so a typed URL, a modified click, a refresh and a browser with
  scripts off all still get `/sites/keys?site=…` as a full page drawn by the **same component**
  *(the owner's test, finding 1, 2026-09-10)*.
- Given the window is open, when a key is refused, then the window **stays open** with the sentence
  under its own field; and when I press Cancel, ✕ or Escape, then I am back on the Sites list with
  the panel gone and **the ⋯ row opens it again**.
- Given the window, when I read it, then it matches `S11e Manage Keys Popup` — the three keys on
  the left, the site address, the not-readable-back line, the roll-keys hint and **Test connection**
  in a context rail on the right — with **every sentence the long screen carried still on it**, and
  the Admin row's mask kept *(the owner's Question 3 ruling, 2026-09-10, recorded in the Spec Change
  Log as a departure from that frame)*. On a phone the two columns become one, the address staying
  at the top.


### Review Findings

Five layers ran — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the
Real-infra verifier — and none failed. Two findings are the owner's; the rest were patched in this
phase or deferred with a reason.

- [x] [Review][Decision] **RULED (option 1, owner, 2026-09-09 — filed as R-99).** Production is broken right now: the code is deployed and its migration is not applied** — Commit `41ca519a` IS live (CI run `34369485655` green, Vercel READY at that SHA), but production's `private.site_credentials` has no `admin_key_id` (`42703`) and `public.credential_action` has no `credential_change` (`22P02`) — both reproduced against the hosted database inside rolled-back transactions, each with a passing minimal-pair control. `connectSite` calls `store()`, so **connecting any Ghost site fails on production**, not just the new screen. This is a collision between two approved rules, not a coding mistake: Epic 2's says a migration is applied by hand **in the Deploy phase**, DW-7 says CI publishes **on every push**. Every migration-bearing story will hit it. See `## Questions for the owner`, Question 1.
- [x] [Review][Decision] **RULED (option 1, owner, 2026-09-09 — filed as R-100).** `keys_other_site` cannot fire for the hazard the frozen acceptance criterion names — Executed against the real Ghosts, with a passing control: T1's own key → T1 `GET /admin/config/` = **200**; **T3's key → T1 = 401 "Unknown Admin API Key"**; T1's key → T3 = 401. Both `fetchWithKey` calls in `saveKeys` target `siteUrl: site.url` — this record's Ghost — so another install's key is refused by Ghost's own 401 (`ghost_unknown_key`) and the `GET /admin/site/` comparison is never reached. The guard as built fires only when *this* Ghost's self-reported url has drifted from the stored one, which is a different (and real) case. So the site IS refused and nothing IS written, but the AC's "the sentence names disconnect + reconnect" is false, and the harness's `keys-other-site` step will fail at Review. See `## Questions for the owner`, Question 2.

- [x] [Review][Patch] `saveKeys` swallowed every Ghost refusal into `keys_failed` — `redirect()` sat inside the `try`, and its `NEXT_REDIRECT` throw was caught by the sibling `catch` [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] The Content API key's **Save** button went permanently inert after its first press — `useSubmitting()`'s `guard` claimed the in-flight slot while `onSubmit`'s `preventDefault()` kept `useFormStatus().pending` from ever rising, so the release effect never re-ran [apps/web/app/(app)/app/(authed)/sites/keys-content-form.tsx]
- [x] [Review][Patch] The Content key's Save button dropped its busy label the instant it was pressed, and its `NEXT_REDIRECT` rejection was unhandled — `start(() => { void saveKeys(data) })` returns `undefined`, and React 19.2.8 only holds a transition open (and handles the rejection) when the scope callback RETURNS the promise [apps/web/app/(app)/app/(authed)/sites/keys-content-form.tsx]
- [x] [Review][Patch] `ghost_refused` printed the site's name where the HTTP status belongs — "Ghost refused the connection (HTTP My Blog)" [apps/web/app/(app)/app/(authed)/sites/keys-panel.tsx]
- [x] [Review][Patch] A failed **Remove token** said "We couldn't save your key just now. Nothing was connected" — a connect's sentence on a removal [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] `credential_missing` had no sentence, so a **Test connection** with no stored secret read "We couldn't save that just now. Nothing changed" [apps/web/lib/connect-rule.ts]
- [x] [Review][Patch] The Content key was written in two round trips and a failed mirror was only logged — the key stored while the row still read **Not added** [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] The "Moved domains?" hint promised a 90-day snapshot clock for an old record that is still connected — `findSiteByAdminKeyId` returns `disconnectedAt` and the caller discarded it [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] `keysFieldOf` put four "check the address" codes under the Admin key field on the one screen whose address cannot be changed, and disagreed with the wizard's `FIELD_OF` over the same vocabulary [apps/web/lib/connect-rule.ts]
- [x] [Review][Patch] A pooler blip in `credentialsOf()` took the whole Manage keys screen to the error boundary over a value that only draws a mask [apps/web/app/(app)/app/(authed)/sites/keys/page.tsx]
- [x] [Review][Patch] `AuditDetail.ms` was made optional for every row, not just the new one, weakening the contract that every Ghost-call row carries its duration [apps/web/server/ghost-admin/admin-rule.ts]
- [x] [Review][Patch] The migration was not re-runnable, though it is applied to the hosted database by hand and a retry is exactly what a hand-apply invites [supabase/migrations/20260909180000_credential_audit_and_key_id.sql]
- [x] [Review][Patch] `keys-token` could leave a live full-Administrator Staff Access Token in Vault if the run aborted between the store and the removal [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] Two hand-typed counts in the new harness steps, under a docstring that forbids them [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The harness docstring named none of the ten new steps, though the Code Map required it and the Verification section claimed it did [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] `remove()`'s doc comment still claimed Manage keys renders "Key removed 15 Aug", and `credentialsOf` fetched two rotation stamps nothing draws [apps/web/server/ghost-admin/index.ts]
- [x] [Review][Patch] `keysSite`'s comment claimed "THE SAME THREE ANSWERS `sites/keys/page.tsx` GIVES" — the page throws on a failed read, the action redirects [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] The Spec Change Log omitted three real departures: `token_malformed` against the frozen matrix's `credential_malformed`, `findSiteByAdminKeyId`'s required third argument, and the moved-domains redirect pre-empting Story 3.4's S2c brand screen
- [x] [Review][Patch] Owner's manual test step 10's "or after disconnecting" path cannot produce the hint — a re-adopted record is the same row, which `exceptSiteId` excludes
- [x] [Review][Patch] `EXPERIENCE.md:128`'s "Reached from" cell still listed "any Reconnect needed" while its own appended prose says the ⋯ menu is the only entry point
- [x] [Review][Patch] DW-54's edited entry ended mid-sentence and its `location` still claimed `remove()` has no product caller — `disconnectSite` falsified that in 3.5 and `removeToken` falsifies it again here

- [x] [Review][Patch] **A live false positive in the guard R-100 keeps: `keys_other_site` refused legitimate key rotations for ever.** Found by the adversarial verifiers after the ruling, not before it. `mine` fell back to `sites.url` — the typed ADMIN origin — whenever `site_settings.public_url` was absent, and absent is a reachable state on a healthy record: that column is written in exactly one place, at connect, inside a deliberately non-fatal `try`, and nothing backfills it (`probeSite` preserves it and never writes it). On Ghost(Pro) the admin origin and the public address differ **by design** — this spec says so itself — so on such a record the customer's first legitimate rotation was refused as *"These keys belong to a different Ghost site"*, permanently: the URL row offers no way to correct it and the daily re-check never refreshes `public_url`. It now compares Ghost's recorded answer with Ghost's current one, and makes no comparison when there is none [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] The harness asserted a sentence the product cannot produce — `keys-other-site` is split into **`keys-foreign-key`** (T3's key into T1's screen → `ghost_unknown_key`, Ghost's own 401, nothing written) and a new **`keys-other-site`** that actually executes the guard R-100 keeps, by seeding the record's recorded address and pasting T1's own valid key [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] MEASUREMENTS §37's enumeration of the causes of a 401 `Unknown Admin API Key` was missing the third one, and §37 is the owning document every downstream copy cites — the executed cross-install result is now filed there with its control [.../architecture-Inflozo-2026-08-19/MEASUREMENTS.md]
- [x] [Review][Patch] `EXPERIENCE.md`'s customer-voice row and its long-form companion named one cause for that 401 and forbade the wrong anti-pattern — both amended, and "These keys belong to a different Ghost site" on a 401 is now listed as a voice to avoid [.../ux-Inflozo-2026-09-03/EXPERIENCE.md]
- [x] [Review][Patch] The pooler helper's docstring said "Nothing here writes", which two steps had already falsified [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Defer] `admin_key_id` is never backfilled, so every site connected before this story draws no Admin mask and can never raise the moved-domains hint [apps/web/server/ghost-admin/index.ts] — deferred, needs a decision about reading Vault from a migration; DW-78
- [x] [Review][Defer] `ORPHAN_SNAPSHOT_DAYS` is a second home for the 90 days `20260907150000_account_deletion_window.sql` already computes, with nothing asserting they agree [apps/web/lib/connect-rule.ts] — deferred, pre-existing split across two languages; DW-79
- [x] [Review][Defer] "A rolled-back store leaves no row claiming it happened" is asserted in four places and induced nowhere [apps/web/server/ghost-admin/index.ts] — deferred, wants a fault-injection fixture in the RLS gate; DW-80
- [x] [Review][Defer] A crafted post carrying several credential fields at once can store the Admin key and then redirect saying "Nothing changed" [apps/web/app/(app)/app/(authed)/sites/actions.ts] — deferred, unreachable from the screen's three single-field forms; DW-81

### Review Findings — third pass, 2026-09-10

Five layers ran again on the diff since the baseline — Blind Hunter, Edge Case Hunter, Verification
Gap, Acceptance Auditor and the Real-infra verifier — and none failed. The verifier drove the live
harness against production four times (`## Verification` below carries each run): the story's own
keys steps had never run green on the two-column popup, two stalls were the harness's and one was
the product's, at phone width. One finding is the owner's; the rest were patched here or deferred
with a reason. The status stays `in-review`: Deploy and the owner's test follow (R-80).

- [x] [Review][Decision] **RULED (option 1, owner, 2026-09-10).** **Where S11e lives, and what its status is.** R-74 names `claude-design-export/` as *the* design authority; S11e sits outside it under `design/ManageKeys/` with catalogue status `live` — the status INDEX.md defines as "edit these" — while its own row says "never hand-edited … the authority". See `## Questions for the owner`, Question 4 — moved into the export as a `record` in this review.

- [x] [Review][Patch] **The ⋯ menu on a card low in the list closed itself before its row could be pressed, at 390** — the run's `openKeysPopup` at phone width found the popover already hidden: `openMenu` armed a close-on-scroll listener synchronously in the click handler, and the scroll that brings a ⋯ near the bottom edge into view (a finger's, or a driver's) delivers its `scroll` EVENT on the next frame, after the listener was armed. Armed from the next frame now, and the first row is focused with `preventScroll` [apps/web/lib/menu.ts]
- [x] [Review][Patch] The harness could not open the popup at all at 1440: `SiteUrl` is rendered twice and `.first()` on the reason text was the phone copy, hidden from `tablet` up — the stall Story 3.4's seventh review recorded. Both `openKeys*` waits filter on visibility, and `keys-screen`'s "no input carries the address" count is scoped to the window (the connect sheet's `name="url"` field sits behind it on `/sites`) [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The three keys actions answered a stale, forged or malformed site id with `notFound()` from inside the popup, which swaps the whole Sites list for the 404 page — `useBrand` and `keys-screen.tsx`'s `gone()` had the popup branch and these did not. `keysGone()` redirects to `/sites` when the post carries `popup=1`; the full page still 404s [apps/web/app/(app)/app/(authed)/sites/actions.ts]
- [x] [Review][Patch] A failed site read in the popup threw into the list's own `<Suspense>` with no boundary, taking the whole list to `app/error.tsx` over a value that is fine — `brand-screen.tsx`'s `readFailed` had the fix. The window closes instead [apps/web/app/(app)/app/(authed)/sites/keys-screen.tsx]
- [x] [Review][Patch] Focus fell to `<body>` after every way out of the window — the `<dialog>` is unmounted by a navigation, so the platform's own focus return never runs. `PanelModal` refocuses the opener on unmount: the ⋯ button for a row inside a popover, the offer link on the card [apps/web/app/(app)/app/(authed)/sites/panel-modal.tsx]
- [x] [Review][Patch] **R-99's `Schema` phase reached the prose and the three team TOMLs and NOT the two tools that enforce and read the phase** — `commit-msg`'s pattern rejected `Story E.S - Schema - …` at commit time, and `story-board.py` had no `Schema` in `PHASES`, `RANK` or `NEXT_AFTER`. Both extended; a propagation list cannot audit itself [tools/hooks/commit-msg · tools/story-board.py]
- [x] [Review][Patch] R-99 and R-100 were cited as rulings in five documents and filed in the rulings register in none — `reconcile-designs-decisions.md` is where `CLAUDE.md` says a ruling lives, and it is the one thing the gate cannot see. §A22 now carries both with their propagation ledgers [prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md]
- [x] [Review][Patch] The RLS gate asserted the migration's new COLUMN exists and not its new ENUM VALUE — and `credential_change` is the half production lacked on 2026-09-09 (`22P02`). Asserted now, in all three copies [supabase/tests/rls.sql · RLS-TEST.sql]
- [x] [Review][Patch] **Owner's manual test step 7 still promised the disconnect-and-reconnect sentence for another site's key**, the promise R-100 withdrew — he would have followed it and filed a false defect. Rewritten to what the screen says [this spec, `## Owner's manual test`]
- [x] [Review][Patch] A Test connection result the table does not name fell back to "We couldn't save that just now" on a read-only press, and `ghost_refused` with no status printed "(HTTP )" — both now draw nothing, the panel's own rule for `?keys=` [apps/web/app/(app)/app/(authed)/sites/keys-panel.tsx]
- [x] [Review][Patch] `KEYS.content.ask` was defined, exported to the harness as if on the screen, and rendered nowhere — the Content row now carries it as its standing hint, as the Admin row does [apps/web/app/(app)/app/(authed)/sites/keys-content-form.tsx]
- [x] [Review][Patch] `keys-token` set `tokenStored` only after the removal, so the `finally` it exists for would have left a live full-Administrator token behind on an abort between the store and the press — set the moment the store is observed. And the step now asserts `admin_key_id` is untouched by the token going in and out (`coalesce` in `store()`'s upsert had no check) [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] `holdOpen` returned a bare `route.continue()` after its hold, the rejection `holding()` was given a `.catch` for one review earlier [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] `keys-js-off` read the ⋯ menu's first link by position, true only while Manage keys sits above Disconnect; `disconnect-js-off` was already given `hasText` for this reason [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] The "derived from the actions" code-table test saw only literal second arguments: the three empty codes, the malformed ternary, `ghost_refused` and every `config.code` travel through variables and were invisible to it. Named beside the regex with an assertion that each still appears in the source; `keysFieldOf` asserted for the three empty codes [apps/web/connect-rule.test.ts]
- [x] [Review][Patch] The Content key's save — the one with a browser half and a service-role write — had no live step; Back after a refusal, the header's ✕, the result card's failure shape and the phone-width column order were asserted nowhere. `keys-content`, `keys-test-refused` and `keys-phone` added, `keys-popup` extended, `keys-forged` forges the Content form too [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Patch] Five comments still described the intercepted route the second Fix deleted — `site-menu.tsx`'s row, `keys-panel.tsx`'s way-out and title-id notes, `brand-panel.tsx`'s reason for the connect landing, the harness's Cancel line — and two ("nothing stores a staff token until Epic 7") were falsified by this story's own Add token [sites/site-menu.tsx · keys-panel.tsx · brand-panel.tsx · server/ghost-admin/index.ts · run-verify-ghost-admin.py]
- [x] [Review][Patch] The catalogue row for S11e placed the rendered `.png` inside the export folder it names; it is one level up [tools/doc-audit.py]
- [x] [Review][Patch] `HANDOVER.md` said step 6 was opening; it carries a dated paragraph on where step 7 stands and the two rulings a fresh session needs. `epic-3-context.md` tells Story 3.7 that its "Reconnect needed" link into Manage keys is a `PanelLink` with both addresses [HANDOVER.md · epic-3-context.md]
- [x] [Review][Patch] Three departures the Change Log did not record: the Content row's Save is a Kit `Button` + `BusyLabel` rather than a `Submit`, the staff row draws a hint under its field where S11e draws none, and "Added" is ink-soft where the frame draws it in mint — entries 19 to 21 [this spec, `## Spec Change Log`]
- [x] [Review][Patch] **Found by the live run on the review's own deployment:** the Content form's forged post did not land on the not-found page — three of four presses did. This form calls `saveKeys` itself, so `notFound()` arrived as a rejection and was reported as "We couldn't save that just now" — at a forged id, and at a customer whose site was gone. `isNotFound` recognises the digest and the form throws `notFound()` from render, which reaches the boundary [apps/web/app/(app)/app/(authed)/sites/keys-content-form.tsx · apps/web/lib/action-redirect.ts]
- [x] [Review][Patch] Two harness sequencing gaps the same run exposed: `keys-test` read the window the instant the URL changed and got the skeleton, and the new `keys-test-refused` left the run on the keys page so the `axe-sites` sweep audited the wrong screen and the sheet's opener was not there to click. The result is waited for; the step returns to the list. And `keys-screen` now takes S11e's frame screenshots at 1440 / 834 / 390 (`--shots`) [tools/probe/run-verify-ghost-admin.py]
- [x] [Review][Defer] `findSiteByAdminKeyId` returns the newest match, so with a live and an orphaned twin the hint can name the wrong clock [apps/web/server/ghost-admin/index.ts] — deferred, needs a third seeded record; DW-83
- [x] [Review][Defer] Escape during an in-flight save re-opens the window with the answer; the Content save's read-modify-write of `credentials_present` can lose a cross-tab store [panel-modal.tsx · actions.ts] — deferred, a race nobody reaches without trying; DW-84
- [x] [Review][Defer] Three harness controls still owed: the `?old=live` hint, the cross-account decoy for the moved-domains lookup, `useBrand`'s popup branch on a vanished row [tools/probe/run-verify-ghost-admin.py] — deferred, each a seeding; DW-85
- [x] [Review][Defer] `KEYS.staff.ask` and `KEYS.rollHint` name Ghost Admin's menus from memory, uncited [apps/web/lib/connect-rule.ts] — deferred, wayfinding copy, no probe drives Ghost Admin's UI; DW-86

**Dismissed, with the reason, so they are not re-raised:** the staff field's label is the button's word ("Add token") — S11e draws it that way, two "Paste new" and one "Add token"; the two placeholders, the skeleton's sr-only line and the glyph's "opens in a new tab" are Kit vocabulary and illustrations, not sentences the customer reads; `audit`'s `REMOVALS = 1` is the run's own declared count, defended where it stands; a URL carrying both `?manage=` and `?brand=` is nobody's door; the `Opening…` busy row and the Kit `Submit`'s busy label are driven live on the brand window through the very components Manage keys uses (`PanelLink`, `Submit`), so a second drive would prove the same code twice; a single-field form cannot post two credentials at once (DW-81 already holds the crafted case).

## Design Notes

**Why no reveal control, and what is drawn instead.** B20 masks each key with its first *and last*
characters and offers an eye. The last characters cannot be drawn: they are the secret half, and it
exists for milliseconds inside the chokepoint and reaches no render path (AD-10 — the module's own
header states it, and it is the bound §21j proved). So the screen draws the half that is not a
secret. A Ghost Admin API key is `id:secret`; the `id` travels in the header of every JWT Inflozo
mints and identifies nothing on its own, which is exactly what B20's own note says the masking is
*for* — "how a user actually identifies a key". The Content API key is drawn the same way for
consistency, though it is browser-safe and could be shown whole. **One departure from the frame, and
it is recorded rather than silent** (R-74; the precedent is Story 3.4's hex-instead-of-colour-name):
no eye, no trailing characters, and one line under the block saying Inflozo cannot read the secret
half back either.

**The enum value, and why it is one and why it is named that.** `epics.md` says the enum "gains the
value that names a removal, and both `remove()` and `store()` audit through it"; DW-76 says "one
value, one `audit()` call inside `remove()` and one inside `store()`". One value shared by a writer
that stores and a writer that removes cannot be named for the removal alone. `credential_change` is
the value, and `detail` carries `{ kind, direction }` — which is the enum's **own existing
convention**: `entitlement_change` and `admin_flag_change` are already state mutations named for the
change with their specifics in `detail`. Two values (`credential_stored` / `credential_removed`) were
weighed and dropped: DW-76 says one, and the count a reader wants is "how many times did a credential
move", which one value answers directly. This is a routine engineering call recorded here rather than
put to the owner — the name is invisible to him and there is no plain-English framing of it that is
not a waste of his time.

**Why a moved domain is refused rather than warned — and why another site's key is not our sentence
to write** *(corrected at the review of 2026-09-09; the owner ruled it R-100)*. FR-C8 removed
edit-URL-in-place because it would carry one site's record, snapshot and first-upload flag onto a
different live Ghost install — "restore the original theme" would then push one customer's archived
theme over another's, and the second site would never be snapshotted at all. **A Ghost that now
reports a different public address is exactly that state**, and it is what the `GET /admin/site/`
comparison catches: the approved rule enforced on its one remaining path.

What the comparison does **not** catch, and never could, is a key from a different install. The key is
sent to this record's own Ghost, which has never issued it and answers 401 `Unknown Admin API Key` —
so it is refused at `config/` and the comparison is never reached. Ghost decides "is this key mine" by
one lookup in `api_keys`, a table with no domain, url or install column (§37, read in Ghost's source),
and it gives the same 401 to a wrong key and to another site's key. Inflozo cannot tell them apart, so
it says what Ghost said. The customer is protected either way: the key is refused and nothing is
written. Executed T3→T1 and T1→T3, both 401, with T1→T1 200 as the control.

**And the comparison compares Ghost with Ghost.** It reads `site_settings.public_url` — Ghost's own
answer, captured at connect — and where that is absent it makes no comparison at all. It used to fall
back to `sites.url`, the typed admin origin, and `public_url` is genuinely absent on healthy records:
its write is a single non-fatal one at connect and nothing backfills it. On Ghost(Pro) the admin origin
and the public address differ by design — this spec says so two paragraphs up — so that fallback
refused the first legitimate rotation on such a record as "These keys belong to a different Ghost
site", permanently, with no field to correct and no re-check that refreshes it.

**What "removing the token degrades three capabilities" means today.** Nothing observable. Nothing
stores a staff token until Epic 7, so the removal path has no production site to run on and the
three capabilities — the pre-Inflozo snapshot, the drift re-read and the `routes.yaml` upload — do not
exist yet. What this story owes them is the state and its honesty: `credentials_present.staff` is the
mirror, the row says **Not added** with what it would enable, and B12's and B16's degraded paths read
that flag when Epic 7 builds them. Stated here rather than silently skipped, the way Story 2.5 stated
its Dodo gap and Story 3.5 stated the sample-content fallback.

**Why the manual test writes nothing.** S11d draws "Passed · 2 min ago", which is a stored timestamp
— `sites.last_checked_at`, next to `sites.health`. Both are Story 3.7's: its daily check is the writer,
and its email fires once per healthy→unhealthy transition with a 7-day cap. A manual press that wrote
`health` would drive that machine from outside it, and one that wrote `last_checked_at` alone would
make the card claim a check the daily job did not make. So the result is drawn on this screen and
stored nowhere, and the "· 2 min ago" stamp arrives with 3.7.

## Questions for the owner

Two came out of the code review on 2026-09-09 — the first was urgent, your live site could not
connect a Ghost site — and the second changed one sentence a customer might read. A third came from
your own test on 2026-09-10, and a fourth from the review of 2026-09-10; that one is still yours.

### Question 1 — the database change and the code arrive in the wrong order, and your live site is broken until they meet

**What happened.** This story needs one small change to the database (two new entries). The rule we
have been following says a database change is applied **by hand, later, in the Deploy step**. But
since 5 September, GitHub publishes the code to your live site **within minutes of every push**. So
the code went live on Tuesday expecting something the database does not have yet.

**What that means today.** On `app.inflozo.com`, **connecting a Ghost site fails** — not just the new
API keys screen, all of it. Nothing is damaged and nothing is half-saved (the site record is rolled
back cleanly), but the button does not work. It will keep failing until the database change is
applied. This is not a mistake in the code — it is two of our own rules pulling opposite ways, and
**every future story that changes the database will hit it again**.

**An example.** Think of it like sending out a new order form that asks for a customer's delivery
slot, before the warehouse system has a place to record one. The form is fine, the warehouse is fine,
but every order bounces until someone adds the field.

**Your options:**

1. **Apply the database change first, on its own, before the code that needs it goes out.** One extra
   push at the start of a story instead of one at the end. The database is then always at least as
   new as the code, so this can never happen again. **(RECOMMENDED)** — it is the smallest change to
   how we work, and it removes the broken window entirely rather than shortening it.
2. **Keep the order, and write every new bit of code so it still works while the database is behind.**
   No change to your routine, but every story pays for it in extra code, and that code is only ever
   exercised during the gap.
3. **Stop publishing on every push.** Publish only when the Deploy step says so. This gives the most
   control and is the biggest change — it would undo the automatic publishing you approved on
   5 September.

**Either way, the immediate fix is the same and it is the Deploy step's:** apply this story's
database change to the live database, after which connecting works again. Say the word and it goes
out with the Deploy phase.

**Ruled: option 1 (owner, 2026-09-09).** Filed as **R-99** and propagated to `docs/project-context.md`,
`CLAUDE.md`, `epic-3-context.md` and the three `_bmad/custom/*.toml` team overrides, which gain a
`Schema` phase before `Dev`. Two things checked in `.github/workflows/ci.yml` and stated with the rule
rather than assumed: the schema push still deploys the tree as it stands (harmlessly — the code is
unchanged), and **nothing in CI applies a migration**, so the apply stays a hand step through
`SUPABASE_DB_POOLER_URL`. This story's own migration is still Deploy's, unchanged: production stays
unable to connect a Ghost site until it lands, which is the first thing the Deploy phase does.

### Question 2 — what Inflozo should say when you paste the wrong site's key

**What we promised.** The spec says: if you paste an Admin API key that belongs to a *different*
Ghost site, Inflozo refuses it and says *"These keys belong to a different Ghost site. Moving a site
means disconnecting this one and connecting the new address."*

**What actually happens.** We tested it against two real Ghost sites. Your own Ghost is the one being
asked, and it simply does not recognise a key it never issued — it answers "Unknown Admin API Key".
So the key **is** refused and **nothing is saved** (that part of the promise holds), but the sentence
the customer sees is the ordinary one: *"Ghost refused this Admin API key. Copy it again from the
Inflozo integration."* Inflozo has no way to tell "this key is from your other site" apart from "this
key is wrong", because your Ghost gives the same answer to both.

**An example.** You run `orbitweekly.com` and `sidequest.blog`. You open API keys for
`orbitweekly.com` and paste `sidequest.blog`'s Admin key by mistake. It is refused — good — but the
message tells you to copy the key again from the integration, rather than telling you it belongs to
your other site.

**The extra check we built is not wasted:** it does catch a real, different case — when your Ghost
now reports a *different web address* than the one Inflozo has on file, which is exactly what a
domain move looks like. That is where the "disconnect and connect the new address" sentence belongs.

**Your options:**

1. **Accept your Ghost's own answer for the wrong-key case, and keep the extra check for the domain
   move it really does catch.** The customer is still protected — nothing is saved — they just get
   the plainer sentence. **(RECOMMENDED)** — it is honest about what we can actually tell apart, it
   costs nothing, and the domain-move sentence still appears where it is true.
2. **Broaden the sentence** so the ordinary refusal also mentions the possibility: *"…Copy it again
   from the Inflozo integration — and check you are not pasting another site's key."* Slightly more
   helpful, slightly longer, and shown on every mistyped key.
3. **Keep trying to tell them apart** by checking the pasted key against every other Ghost site you
   have connected. It would give the exact sentence we promised, but only for sites already in
   Inflozo, and it adds work to every key you paste.

**Ruled: option 1 (owner, 2026-09-09).** Filed as **R-100**. The frozen Boundaries bullet, the I/O
matrix and the acceptance criterion below are renegotiated on his word rather than edited quietly, and
the Design Note is corrected. `GET /admin/site/` stays, for the domain move it really does catch —
**and the review found that guard had a live false positive**, now fixed: it compared Ghost's answer
against `sites.url` whenever `site_settings.public_url` was absent, which is a reachable state (that
column is written once, non-fatally, at connect and nothing backfills it), so on Ghost(Pro) — where the
admin origin and the public address differ by design — a customer's first legitimate rotation was
refused as *"These keys belong to a different Ghost site"*, permanently. It now compares Ghost's answer
only against Ghost's answer, and does not compare at all when there is none.

### Question 3 — the new design drops the first characters of the Admin API key. Keep them, or let them go?

**What is on screen today.** Under **Admin API key** the screen shows the beginning of the key
Inflozo has stored, then dots — `65a3f2b1c0… ••••••••••`. The **Content API key** row shows the same
thing. The new design you sent keeps that line under Content API key and **does not draw it under
Admin API key**.

**Why it is worth a moment.** Step 5 of your own manual test says: regenerate the Admin key in Ghost,
paste the new one, and check that *"the beginning of the key shown on the screen is now the new
one."* Without that line there is nothing to look at — the row says **Added** before the paste and
**Added** after it, so a save that worked and a save that quietly did not look identical until you
press **Test connection**.

**An example.** You have `orbitweekly.com` and `sidequest.blog` open in two tabs. You regenerate on
`orbitweekly.com`, come back, paste, save. With the line, the row changes from `65a3f2b1c0…` to
`9f10dd47ae…` and you can see the new key landed. Without it, the row reads **Added** both times.

**It costs nothing to keep and it gives nothing away.** That half of the key is not a secret — it
rides in the header of every request Inflozo makes to your Ghost, which is why this story added a
column for it. Only the half after the colon is secret, and that one never leaves the server.

**Your options:**

1. **Keep the line under Admin API key exactly as it is today**, and take everything else in the new
   design as drawn. **(RECOMMENDED)** — it is the only thing on the screen that tells you *which*
   key is stored, your own test step 5 reads it, and it is one short line on a screen whose length
   problem is the tall single column, not this.
2. **Follow the new design exactly** and drop the line. The row says Added or Not added, and **Test
   connection** becomes the way to check a rotation worked. One line shorter.
3. **Drop the permanent line, and show it once after a save** — *"Saved. Your Admin API key now
   starts 9f10dd47ae."* — which fades with the next thing you do. You get the confirmation at the
   moment it matters and the screen stays as short as the new design.

**Ruled: option 1 (owner, 2026-09-10)** — *"Keep the line under Admin API key as it is today."*
So `keys-panel.tsx`'s `Mask` stays on the Admin row, fed by `admin_key_id`, and the rest of S11e is
taken as drawn. This is a DEPARTURE FROM THE FRAME and the Fix records it as one in the Spec Change
Log, beside the two the story already carries — the frame draws the mask under Content API key only,
and the screen draws it under both. The reason is on the record: it is the only thing on the screen
that says WHICH Admin key is stored, and manual test step 5 reads it.

### Question 4 — the new popup design lives outside the folder our rules call the design authority

**What we have.** Since 2 September the rule (R-74) is: one folder, `claude-design-export/`, is
*the* design — every screen is built from what is in there and nothing in there is ever hand-edited.
The two-column API keys window you sent on 10 September is a new Claude Design frame, **S11e**, and it
is what the screen is now built from — but it sits in a different folder, `design/ManageKeys/`, and the
document index marks it **live**, which our index defines as "a document you edit". Its own
description says the opposite: "never hand-edited … the authority, not a working document."

**Why it matters.** Two folders that are both "the design" is exactly what R-74 exists to prevent — the
next person (or the next Claude session) has to know which one wins, and the checks that gate the
export (`verify-design-pass.py`, the colour test) do not look at the second folder at all. Nothing is
broken today; it is the rule and the files disagreeing.

**An example.** Someone later adds a "Re-check connection" button to this window. Do they draw it in
the export folder, where S11 Sites lives, or in `design/ManageKeys/`, where S11e lives? Today there is
no written answer.

**Your options:**

1. **Move S11e into the export folder beside the other frames, and mark it `record`** (dated, never
   edited) — one authority, and the export's own checks start covering it. Nothing about the screen
   changes. **(RECOMMENDED)** — it is one file move and one word in the index, and it makes the rule
   true again rather than adding an exception to it.
2. **Leave it where it is and mark it `record`.** The status stops saying "edit me", but there are
   still two folders, and the export's checks still skip it.
3. **Leave everything as it is.** Cheapest today; the next frame you send will land wherever that
   session decides.

**Ruled: option 1 (owner, 2026-09-10).** Done in the same review: the frame is
`claude-design-export/Inflozo/S11e Manage Keys Popup.dc.html`, beside S11 Sites, with catalogue status
**record**; the rendered image he looked at is `screenshots/s11e-manage-keys-popup-owner.png` in the
same export; the folder's `support.js` was byte-identical to the export's own and did not need a
second copy. `tokens.test.ts` reads every frame under the export, so S11e's colours are now part of
the palette the app is tested against, and `verify-design-pass.py` and `inventory-gen.py --check`
were run over the export with it in — recorded in `## Verification`. Every reference to the old
path was repointed and the repository grepped for it afterwards (standing rule 7).

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. You will need the Ghost site you connected
for Story 3.4 or 3.5, and Ghost Admin open in another tab.

1. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** sign in and click the **⋯**
   on your connected site's card. · **See:** the menu now has **Manage API keys** above the thin line,
   with **Disconnect** in red below it. (Re-check connection and Reconnect are Story 3.7's and are
   deliberately not there yet.)
2. **URL:** same · **Screen:** Sites · **Do:** click **Manage API keys**. · **See:** a window opens
   **over your Sites list** — your cards are still there behind it, the way they are when you press
   Disconnect. It is wide, with two columns. On the **left**, three blocks — **Admin API key**,
   **Content API key**, **Staff Access Token**. The first two say they are there and show the
   beginning of each key followed by dots; the third says **Not added**. Each has one plain line
   saying what it does for you. On the **right**, the things you only read: your site's address as
   text you cannot edit with a line saying a domain move means disconnecting and connecting again,
   the note that Inflozo cannot read a key back, the blue how-to-roll-your-keys note, and
   **Test connection** at the bottom. Nothing runs off the bottom of the screen.
   **And the bar along the top of the app is still there** — the search box and **Connect site** —
   which is what went missing when you tested this on 2026-09-10.
3. **URL:** same · **Screen:** the API keys window · **Do:** look for a way to see the rest of a key. ·
   **See:** there is none, and a line explains that Inflozo cannot read the secret part back either —
   only your Ghost can.
4. **URL:** same · **Screen:** the API keys window · **Do:** press **Test connection**, then press
   it again. · **See:** the button's own words change while it works, then a short result appears
   **inside the window you are already looking at**: Inflozo reached your Ghost, what it can do
   today, and one line saying uploading `routes.yaml` needs the Staff Access Token you have not
   added. **There is only ever one window**, your Sites cards stay behind it and the top bar stays
   above it — no second window appears anywhere, and nothing goes blank. Pressing it twice does the
   same thing twice.
4b. **URL:** same · **Screen:** the API keys window · **Do:** clear the **Admin API key** box if
   there is anything in it and press **Save key** with it empty. · **See:** it now tells you, right
   under that box, that the box is empty — where before it did nothing at all and said nothing. The
   window stays open and your Sites list stays behind it.
5. **URL:** same · **Screen:** the API keys window · **Do:** in Ghost Admin go to **Settings →
   Integrations → Inflozo**, press **Regenerate** on the Admin API key, copy the new one, come back and
   paste it in, then save. **Dummy data:** the newly regenerated Admin API key. · **See:** it saves,
   and the beginning of the key shown on the screen is now the new one. Press **Test connection**
   again — it still passes.
6. **URL:** same · **Screen:** the API keys window · **Do:** paste something that is not a key at all —
   type `hello` into the Admin API key box — and save. · **See:** it is refused right under that box,
   with a sentence telling you what an Admin API key looks like. Nothing else changed.
7. **URL:** same · **Screen:** the API keys window · **Do:** *(only if you have a second Ghost site)*
   paste **that other site's** Admin API key here and save. · **See:** it is refused right under the
   box, nothing is saved, and the sentence is the ordinary one — that Ghost refused this Admin API
   key and to copy it again from the Inflozo integration. It does **not** say the key belongs to a
   different site: your Ghost gives the same answer to a wrong key and to another site's, so Inflozo
   cannot tell them apart and does not pretend to *(your ruling at Question 2, R-100; this step was
   corrected on 2026-09-10 — it still described the old promise)*.
8. **URL:** same · **Screen:** the API keys window · **Do:** in Ghost Admin open your own profile and
   copy your **Staff Access Token**, paste it into the third block and save. **Dummy data:** your own
   Staff Access Token from Ghost Admin → your avatar → Your profile. · **See:** the third block now
   says the token is there, with a way to remove it, and the site is still **Connected**. The line
   about it tells you plainly that this is a full-Administrator credential.
9. **URL:** same · **Screen:** the API keys window · **Do:** remove the token again. · **See:** the
   block goes back to **Not added**, the site is **still Connected**, and nothing about your Ghost site
   changed.
10. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** *(only if your Ghost site
    answers at **two working addresses** — on Ghost(Pro) your `something.ghost.io` address and your
    own domain both do)* connect the **second** address using **the same Ghost site's keys**, the way
    it would look if you had moved your site to a new domain. **Dummy data:** the second address, and
    the same Admin + Content keys. · **See:** it connects, and the new card carries a note asking
    whether you moved domains and telling you to re-point your projects. If you left the first one
    **connected**, that is all it says. If you **disconnected** the first one before doing this, it
    also says your old site's safety-net copy is kept for 90 days — because that 90-day clock only
    starts when a site is disconnected.
    · **If you only have one address, skip this step and say so** — it cannot be done by
    disconnecting and reconnecting the *same* address, because Inflozo recognises that as the same
    site coming back rather than a move (corrected at the review of 2026-09-09; the old wording asked
    for something that could not be done).
11. **URL:** same, on your **phone** · **Screen:** Sites → Manage API keys · **Do:** repeat steps 1, 2
    and 4. · **See:** the menu opens on the screen, the keys window fits, and the two columns become
    one — your site's address at the top, then the three key blocks, then the rest, without anything
    running off the edge.
11b. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** open the **⋯** menu and
    click **Manage API keys**, and watch the row itself as you click. · **See:** the row says
    **Opening…** while the window is on its way, and it will not take a second click while it is
    saying so. The window arrives with its own outline drawn in it first — the shape of what is
    coming, not a spinner — and then fills in. This is the one you found on 2026-09-10, where a
    second click landed the window on a blank screen.
12. **URL:** same · **Screen:** Sites → Manage API keys · **Do:** open the window, then close it —
    press **Cancel** at the bottom, or the **✕** in its top right, or the **Esc** key. Then open it
    again from the ⋯. · **See:** each way closes it and puts you back on your Sites list, and it
    **opens again** every time. *(This is the one to try more than once — it is what the fix had to
    get right.)*
13. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites → the ⋯ menu · **Do:** open the
    **⋯** menu and open **Manage API keys** in a **new browser tab** instead of clicking it — hold
    ⌘ (or Ctrl) as you click it, or right-click it and choose *Open link in new tab*. · **See:** the
    new tab shows the same panel as **a page of its own** rather than over the list — same three
    blocks, same right-hand column, everything working. That is the page a shared link, a bookmark
    and a browser with JavaScript switched off all get, and it is why the row is a real link.
    *(The address in your own address bar while the window is open now stays on your Sites list and
    reads `…/sites?manage=…` — that is deliberate, and it is what stops the window losing the list
    behind it.)*

## Verification

Run all of these; every one must be green before the phase is committed. **R-82: the review and the
owner's test run on the real infrastructure**, never on mocks alone — record what each service
returned, by the key's variable name and never its value.

**Commands:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) -- expected exit 0: lint and
  types clean, every test passing, `busy.test.ts`, `app-routes.test.ts`, `server-wiring.test.ts` and
  `connect-rule.test.ts` among them. Report the count the run prints; never carry one forward.
- `pnpm build` -- expected exit 0, "Compiled successfully", and the route table showing
  `ƒ /app/sites` beside `ƒ /app/sites/keys` and **no intercepted segment at all**: since the owner's
  second test the popup is `/sites?manage=…`, a parameter on the list, so a `(.)keys` in this table
  would mean the interception has come back (`panel-modal.tsx` carries why it must not).
- `bash supabase/tests/run-rls-gate.sh` -- expected exit 0. **This is the gate on the migration**: it
  brings its own PostgreSQL 17 container, refuses to run if the `supabase/` copies have drifted from
  the architecture originals, applies every migration and diffs the result against `SCHEMA.sql`. It
  must end on the DW-44 vault assertions plus the new column's own.
- `python3 tools/doc-audit.py --check`, twice -- expected PASS with 0 warnings (the first call
  regenerates, as its sub-tools do).
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected all steps passing, printing this
  story's copy read out of the app itself rather than retyped.
- `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` -- expected all steps
  passing against the **production** deployment, T1 and T3.

**The live steps this story adds** (named here; the docstring is derived from the source at Dev):

- `keys-screen` — the ⋯ row present above the rule; **its click opening S11e's popup over the Sites
  list**, with an open `<dialog>` and the cards still behind it; three credential rows drawn with
  the app's own sentences, the URL as text with **no** input element in it, and no element anywhere
  on it offering to reveal a key.
- `keys-popup` — the popup's own behaviour, and every claim in it is one a `<Link>` way out broke
  when the Fix measured it: a refusal keeps the window **open** with the sentence under its own
  field; **Cancel** returns to the list with the panel unmounted; the ⋯ row opens it **a second
  time**; **Escape** does the same as Cancel; and a typed URL is still the **full page** with no
  dialog at all.
- `keys-rotate` — a rotated Admin key pasted and saved on **T1**; read back through the pooler:
  `admin_key_rotated_at` moved, `admin_key_id` equals the new key's id half, `vault.secrets` holds one
  secret for that ref and it is **not** the old one, and exactly one new `credential_change` row is
  stamped with this screen's route.
- `keys-foreign-key` — **T3's** Admin key pasted into **T1's** screen: refused by that Ghost's own
  401, nothing written, the sentence read off the app *(renamed at Review; R-100)*.
- `keys-other-site` — the guard R-100 keeps, executed: this Ghost reporting a different public
  address, refused with the disconnect + reconnect sentence.
- `keys-malformed` — `hello` into the Admin field: refused under that field, nothing written.
- `keys-token` — the harness's staff token added and then removed on T1: `credentials_present.staff`
  true then false, the Vault secret **gone** (read read-only through the pooler, as `disconnect`
  already does), the site still active with `disconnected_at` null, and **two** `credential_change`
  rows. This is DW-54's `staff-removed` proof, driven live for the first time.
- `keys-test` — **Test connection** pressed: one `admin_read` audit row for `GET /admin/config/`, the
  result drawn, and `sites.health` and `sites.last_checked_at` **unchanged** (the negative control
  that this story did not step on 3.7's).
- `keys-forged` — a second account's site id in `/sites/keys?site=…` and forged into each of the three
  forms: the not-found page, and every row of both accounts byte-identical **watched landing**, not
  re-read afterwards (standing rule 2).
- `keys-js-off` — the ⋯ row's `href` in the served markup, and the route's own three forms wired,
  with JavaScript disabled.
- `moved-domains` — a second address connected with T1's keys: the hint on the new card, naming 90
  days; and the same connect with a record whose `admin_key_id` is null showing **no** hint.
- `axe` at 1440 and 390 on the menu, on **the popup** (`axe-keys-screen`) and on **the full route**
  (`axe-keys-route`) — the popup reopened at each width, because a popover cannot survive a resize.

**Manual checks:**

- The migration applied to the hosted database **by hand in the Deploy phase** (the direct host is
  IPv6-only), and `select unnest(enum_range(null::public.credential_action))` on production showing
  the new value before the Deploy commit is written.
- Frame screenshots at 1440 / 834 / 390 (`--shots`) against **S11e** (and, for the rows inside it,
  B20), for the "matches the frame" criterion.
- The owner's manual test above (R-80) — his, on the deployed production domains, after Deploy.


### Dev phase, 2026-09-09 — what each command returned

Every command below was run in this phase; nothing is carried forward from an earlier one. **R-82:
the real services are named by the variable each key is held under and never by its value.**

**Commands, and what each returned:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) — **exit 0**. Lint clean,
  `tsc --noEmit` clean, and the run printed **240 tests, 240 pass, 0 fail** in `apps/web`, plus 1
  each in `packages/{ghost-shim,section-runtime,theme-compiler}`. `busy.test.ts`,
  `app-routes.test.ts`, `server-wiring.test.ts` and `connect-rule.test.ts` are among them.
- `pnpm build` — **exit 0**, "Compiled successfully", and the route table now lists
  **`ƒ /app/sites/keys`** beside `/app/sites/connect` and `/app/sites/disconnect`.
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, against a PostgreSQL 17 container it brings
  itself. It refused nothing (the `supabase/` copies match the architecture originals), applied
  **every** file in `supabase/migrations/` including the new one, and diffed the result against
  `SCHEMA.sql` with no drift — so `credential_change` and `admin_key_id` are in both descriptions of
  the database. It ended on the DW-44 vault assertions and on this story's own:
  `PASS: admin_key_id exists and no client holds a privilege on it`. **The `alter type … add value`
  question in the Code Map is answered by execution rather than by the sentence there** (standing
  rule 1): the gate applies each migration through `psql -f` in autocommit, the value is only ADDED
  and never used in that file, and the apply step passed.
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings** (the first call regenerated
  `STORY-BOARD.html`, as its sub-tools do).
- `python3 tools/probe/run-verify-ghost-admin.py --check` — **RESULT: all steps passed.** Its
  plumbing steps hit the real services:
  - **Supabase** — `SUPABASE_URL` with `SUPABASE_SECRET_KEY`: `vault-off-rest` re-executed §21j's
    bound, `GET /rest/v1/{decrypted_secrets,secrets,site_credentials}` → **404, 404, 404**, with
    `GET /rest/v1/sites` → **200** as its positive control. `SUPABASE_DB_POOLER_URL` is present by
    name and is what the browser half reads `private.*` and `vault.secrets` through.
  - **Ghost T1 (`ghost6.inflozo.com`, 6.58.0)** and **T3 (`ghost5.inflozo.com`, 5.130.6)** — read
    with `GHOST6_ADMIN_API_KEY` / `GHOST5_ADMIN_API_KEY`: `settings-keys` → **all six settings keys
    present on both majors**; `brand-keys` → **all seven FR-C4 keys present on both**, `navigation`
    a JSON string on each. `GHOST6_STAFF_ACCESS_TOKEN` and `GHOST5_STAFF_ACCESS_TOKEN` are present
    by name, and the first is now passed to the browser half as this story's `keys-token` credential.
  - `browser-js` — the embedded Playwright script **parses** with this story's ten new steps in it.
  - The step printed **this story's copy read out of `lib/connect-rule.ts` itself**, not retyped:
    `keys_menu`, `keys_title`, `keys_url_reason`, `keys_present`/`keys_absent`, all three credential
    names and their `enables` lines, `keys_no_reveal`, `keys_roll_hint`, `keys_test*`,
    `keys_other_site`, and `keys_moved` — which rendered as **"…kept for 90 days"**, the figure
    coming from `ORPHAN_SNAPSHOT_DAYS` while `KEYS` itself names no number.
- `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` — **not run in this
  phase, and it cannot be**: it drives this story's screens on the DEPLOYED site, and nothing is
  deployed until CI publishes this commit (DW-7 — publishing happens from GitHub Actions). It is the
  Review phase's, on production, and it is where the ten live steps below are executed.

**Written in this phase, to be executed at Review on the deployed site** (`--url
https://app.inflozo.com`), each named in the harness's own docstring: `keys-screen`,
`axe-keys-screen`, `keys-malformed`, `keys-other-site`, `keys-rotate`, `keys-token`, `keys-test`,
`keys-js-off`, `keys-forged`, `moved-domains`. Three carry a ⛔ recorded in the step's own output
rather than hidden: `keys-rotate` **re-pastes** T1's Admin key instead of regenerating it in Ghost
Admin (regenerating would invalidate `GHOST6_ADMIN_API_KEY` for every probe in this repository, and
the assertion is on the *secret's* identity, so the path is the one a real rotation takes);
`moved-domains` **seeds the old record** through the pooler because neither test Ghost has a second
reachable address, while the connect, the lookup, the redirect and the hint are all the product's;
and `disconnect-failed` remains un-induced for the reason it always was.

**Four existing steps moved with this story rather than being left to fail:** `site-menu` now
asserts **two** rows in the frame's order with the rule between them; `audit` asserts DW-76's rows —
one `in` per connect, one `out` per removal that actually took a key, each stamped with its own
writer's route and each `detail` exactly `{kind, direction}`; and the `disconnect` step's note that
`remove()` writes no audit row is now history rather than a claim about the code. The fourth is a
finding rather than a consequence: **`secret-gone`'s two refs are re-taken** at the end of this
story's block, because `keys-rotate` puts a new secret behind T1's ref and `moved-domains`
reconnects T3 twice — so the refs pushed earlier in the run were already dropped by DW-44's trigger,
and the account cascade would have been proved against two refs that had nothing behind them
before it ran. A control that cannot fail is not a control (standing rule 2).

**Not verified in this phase, and named rather than assumed:** the migration is **not** applied to
the hosted database — that is by hand in the Deploy phase (the direct host is IPv6-only), with
`select unnest(enum_range(null::public.credential_action))` on production showing `credential_change`
before the Deploy commit is written. Frame screenshots at 1440 / 834 / 390 (`--shots`) against S11d
and B20 belong to Review. The owner's manual test (R-80) is his, on the production domains, after
Deploy.

### Review phase, 2026-09-09 — what each command returned

Five review layers ran and none failed. **R-82: the real services are named by the variable each key
is held under and never by its value.**

- `pnpm check` (Node 24 on PATH) — **exit 0**, **241 tests, 241 pass, 0 fail** in `apps/web` (240
  before this phase; the extra one is the review's own code-has-a-sentence assertion), plus 1 each in
  `packages/{ghost-shim,section-runtime,theme-compiler}`.
- `pnpm build` — **exit 0**, "Compiled successfully", `ƒ /app/sites/keys` in the route table.
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, on the migration as this phase made it
  idempotent. It ended on the DW-44 vault assertions and printed `PASS: admin_key_id exists and no
  client holds a privilege on it`.
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings**.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — **RESULT: all steps passed**, against
  Supabase (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`: `vault-off-rest` 404/404/404 with `/rest/v1/sites`
  → 200 as its own positive control) and both Ghosts (`GHOST6_ADMIN_API_KEY`, `GHOST5_ADMIN_API_KEY`).
  The embedded browser script parses with this phase's `try`/`finally` in it.
- **The cross-site key question, executed against the real Ghosts with its own control**
  (`GHOST6_ADMIN_API_KEY`, `GHOST5_ADMIN_API_KEY`, `GHOST6_URL`, `GHOST5_URL`): T1's own key →
  T1 `GET /admin/config/` = **200** (the control — without it the two 401s prove nothing); **T3's key
  → T1 = 401 `UNKNOWN_ADMIN_API_KEY`**; T1's key → T3 = 401. This is the evidence behind Question 2.
- **`redirect()` inside a `try`, executed against the installed Next 16.3.1**: `redirect()` throws a
  plain `Error` carrying `digest: 'NEXT_REDIRECT;…'` (`next/dist/client/components/redirect.js:51-53`),
  so the sibling `catch` swallowed it and the landing was `?keys=keys_failed` where
  `?keys=ghost_unknown_key` was intended. Patched with `isRedirect`.
- **React's transition tracking, read in the installed React 19.2.8**
  (`react.development.js:1158-1167`): `startTransition` holds the transition open, and attaches its
  own rejection handling, ONLY when the scope callback returns the thenable. This is the evidence
  behind the Content-key busy-label patch.

**Did NOT hold, and it is Question 1:**

- `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` — **RESULT: FAILED,
  exit 1**, at the first connect. Commit `41ca519a` **is** deployed (CI run `34369485655` green;
  Vercel production READY at that SHA), but the migration is **not applied to the hosted database**:
  read through `SUPABASE_DB_POOLER_URL`, production's `private.site_credentials` has no
  `admin_key_id` and `public.credential_action` has no `credential_change`. Both of `store()`'s new
  writes were reproduced against production inside **rolled-back** transactions — `42703` and `22P02`
  — each with a passing minimal-pair control (`admin_key_vault_ref` selects fine;
  `'vault_decrypt'::public.credential_action` casts fine). `connectSite` calls `store()`, so
  connecting any Ghost site fails on production until the migration lands.
- **Therefore all ten of this story's live steps are NOT EXECUTED** — not failed, never reached:
  `keys-screen`, `axe-keys-screen`, `keys-malformed`, `keys-other-site`, `keys-rotate`, `keys-token`,
  `keys-test`, `keys-js-off`, `keys-forged`, `moved-domains`. Frame screenshots (`--shots` against
  S11d and B20) are blocked with them. **They run at Deploy, immediately after the migration is
  applied by hand**, and `keys-other-site` is expected to fail as written until Question 2 is ruled.

### Review phase, second pass, 2026-09-09 — the owner's two rulings, and what they cost

He ruled both questions option 1. Recording them was the small half; a nine-agent propagation sweep
and three adversarial verifiers ran over the rulings before anything was edited, and both halves paid.

- **The sweep found the surfaces the rulings had to reach, including three no first pass had touched:**
  `MEASUREMENTS.md` §37 — the OWNING document for the 401 whose causes both downstream copies cite and
  neither had corrected; `EXPERIENCE.md`'s customer-voice row and its long-form companion; and the
  auto-memory file, which states the superseded ordering rule as an imperative in every future session.
  Also the three `_bmad/custom/*.toml` overrides, whose closed phase enumerations would have made the
  unattended loop reproduce the outage by construction — a `Schema` phase now precedes `Dev` in each.
- **The adversarial verifiers could not refute the executed claim, and found a live bug behind it.**
  Two of three returned `refuted: false, confidence: high` on "a foreign key can never reach the
  `site/` comparison" — structurally guaranteed, not merely observed: both `fetchWithKey` calls target
  `site.url`, `redirect: 'manual'` closes the 3xx route, and MEASUREMENTS §37 closes the Ghost side.
  The third refuted the FRAMING and was right: `mine` fell back to the typed admin origin whenever
  `site_settings.public_url` was absent, which is reachable on a healthy record, so on Ghost(Pro) the
  first legitimate rotation was refused as "These keys belong to a different Ghost site" **for ever**.
  Patched. One verifier also recorded an unobserved case — two Ghosts sharing one database would accept
  each other's keys outright — filed as a ⛔ in §37 rather than claimed either way.
- **`pnpm check`** — exit 0, **241 pass, 0 fail**. **`run-verify-ghost-admin.py --check`** — exit 0,
  all steps passed; the rewritten browser script parses. **`doc-audit --check`** — PASS twice.
- **Still not executed, and still Deploy's:** the ten live steps, now eleven with `keys-foreign-key`
  and the seeded `keys-other-site` split apart. They remain blocked behind the migration, which under
  R-99 is the first thing the Deploy phase does rather than the last.

### Deploy phase, 2026-09-10 — the migration, the deployment, and the eleven live steps

**R-99's own first step.** Read via `SUPABASE_DB_POOLER_URL` before touching anything: production's
`public.credential_action` had no `credential_change` and `private.site_credentials` had no
`admin_key_id` — the same gap Review found. Applied by hand, both statements from
`supabase/migrations/20260909180000_credential_audit_and_key_id.sql`, each its own autocommit
statement (no transaction wrapping either): `alter type public.credential_action add value if not
exists 'credential_change'` and `alter table private.site_credentials add column if not exists
admin_key_id text`. Read back immediately after: the enum now lists `credential_change` as its
seventh value, `admin_key_id` exists as `text`, and its only grantees are `postgres` and
`service_role` — no `anon`, no `authenticated` — matching the gate's own assertion. Production can
now connect a Ghost site again.

**The deployment.** `Deployment: https://inflozo-9f92lwtgq-umangkagathara.vercel.app` (`dpl_73S91tvsM4Gf9AcPQBTWZFGHMNRy`),
commit `7f36596a` (the last Review push), CI run `34383368482` green, Vercel `READY`/`PROMOTED` and
aliased to `app.inflozo.com` (confirmed via the Vercel API's own alias list) — the code has been live
since Review; the migration above is what Deploy adds.

**The eleven live steps, on the fourth full run.** `python3 tools/probe/run-verify-ghost-admin.py
--url https://app.inflozo.com` — three runs each died on one `locator`/`waitFor` timeout of 20-60s at
a different point (`pro-connect-t3`'s S2c heading, `keys-other-site`'s post-submit navigation,
`keys-forged`'s staff-field forgery landing), all pre-existing DW-68/DW-74-class flakiness read
before being believed and gone on retry with nothing changed. **RESULT: all steps passed** on the
run that reached the end: 92 steps, 0 failures, including this story's own — `keys-screen`,
`axe-keys-screen`, `keys-malformed`, `keys-foreign-key`, `keys-other-site`, `keys-rotate`,
`keys-token`, `keys-test`, `keys-js-off`, `keys-forged`, `moved-domains` — each against T1 and T3
where the matrix names both, `SUPABASE_URL`/`SUPABASE_SECRET_KEY`/`SUPABASE_DB_POOLER_URL` for the
pooler reads and `GHOST6_ADMIN_API_KEY`/`GHOST5_ADMIN_API_KEY`/`GHOST6_STAFF_ACCESS_TOKEN`/`GHOST5_STAFF_ACCESS_TOKEN`
for the two Ghosts.

**Two real bugs in the harness, found chasing what first looked like more of the same flakiness, and
fixed rather than retried past.**

- `disconnect-js-off` (Story 3.5's) read the ⋯ menu's href with `page.locator('#site-menu-${t1SiteId} a').getAttribute('href')` — one `<a>`, by assumption. Story 3.6 put a second link, **Manage API
  keys**, above it in the same menu, and this step was missed from the "four existing steps moved
  with this story" list at Review: Playwright's strict mode refused the now-ambiguous locator outright.
  Fixed by naming the one it wants: `{ hasText: 'Disconnect' }`.
- `moved-domains`'s reconnect half asserted `page.waitForURL((u) => u.pathname === '/sites' || u.pathname === '/sites/brand')` to mean "the reconnect redirected." It doesn't: the connect sheet is a
  dialog drawn OVER `/sites`, so the predicate was **already true before the submit**, success or
  failure alike — a failed reconnect (whatever DW-68's hang is, on this one call) was read as a pass,
  and the lie only surfaced two steps later as a T3 that had silently stayed disconnected, on a
  different assertion, in a different run. There is no field-level error to wait for that covers
  every way this submit can fail, so the fix waits for the one thing a real navigation always does
  and a stuck dialog never can: the dialog's own `#s2b-content-key` field leaving the DOM
  (`state: 'detached'`), the same shape `s2cHeading(page).waitFor()` already gives the first, plain
  connect. Filed as DW-68's fifth manifestation rather than re-derived there.

**Commands, and what each returned (unchanged since Review, re-run because the tree changed):**

- `python3 tools/doc-audit.py --check`, twice — PASS, 0 warnings (the harness fix above is a `tools/`
  file already in the catalogue; nothing new to register).
- `bash supabase/tests/run-rls-gate.sh` — not re-run: no schema file changed in this phase, and the
  gate already ran green against this exact migration at Review.

**Not run in this phase:** `pnpm check` / `pnpm build` — no `apps/web` source changed at Deploy, only
`tools/probe/run-verify-ghost-admin.py` and this spec.

### Fix phase, 2026-09-10 — what each command returned

The owner's two findings, fixed inside this story (R-80 as amended). **R-82: the real services are
named by the variable each key is held under and never by its value.**

**Commands, and what each returned:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) — **exit 0**. Lint clean,
  `tsc --noEmit` clean, and the run printed **241 tests, 241 pass, 0 fail** in `apps/web`, plus 1
  each in `packages/{ghost-shim,section-runtime,theme-compiler}`. `busy.test.ts`,
  `app-routes.test.ts`, `server-wiring.test.ts` and `connect-rule.test.ts` are among them; the first
  two carry the popup's own rows (the new `@modal/(.)keys` segment's skeleton, and the full route's
  reason rewritten to name the interception), and `server-wiring.test.ts`'s chokepoint importer is
  now `keys-screen.tsx` rather than the page, which is what keeps that list at three.
  **One failure on the way, and it is recorded because the shape recurs:** `keysRedirect` was first
  written as a `const` arrow with `: never`, and TypeScript only lets a never-returning CALL end a
  code path when the callee is declared as a function — so `parsed.data` went "possibly undefined"
  three lines under a refusal that cannot return. A `function` declaration fixed it.
- `pnpm build` — **exit 0**, "Compiled successfully", and the route table now lists
  **`ƒ /app/sites/(.)keys`** immediately above `ƒ /app/sites/keys`: the intercepted popup and the
  full page it intercepts, both built.
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, against the PostgreSQL 17 container it brings
  itself. No schema file changed in this phase; it was re-run because the tree changed, and it ended
  on the DW-44 vault assertions as before. **This story's migration is already applied to
  production** (Deploy, 2026-09-10) and the Fix adds none, so R-99's Schema phase does not recur.
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings**. `design/ManageKeys/` already
  carries its catalogue row.
- **The panel was RENDERED AND MEASURED, not only type-checked.** A throwaway public route drew
  `KeysPanel` with fake props under `next dev` and Playwright screenshotted it at 1440 / 834 / 390;
  the route was deleted afterwards. At **1440 the box is 900 × 743 — S11e's own dimensions** — two
  columns with the rail on the right and **Test connection** on its bottom edge; at 834 it is
  786 × 743, still two columns; at **390 it is one column with the site address at the top**, then
  the three keys, then the rest of the rail, and **no horizontal scroll at any of the three**.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — **RESULT: all steps passed.** Its
  plumbing steps hit the real services:
  - **Supabase** — `SUPABASE_URL` with `SUPABASE_SECRET_KEY`: `vault-off-rest` re-executed §21j's
    bound, `GET /rest/v1/{decrypted_secrets,secrets,site_credentials}` → **404, 404, 404**, with
    `GET /rest/v1/sites` → **200** as its positive control. `SUPABASE_DB_POOLER_URL` present by name.
  - **Ghost T1 (`ghost6.inflozo.com`, 6.58.0)** and **T3 (`ghost5.inflozo.com`, 5.130.6)** — read
    with `GHOST6_ADMIN_API_KEY` / `GHOST5_ADMIN_API_KEY`: `settings-keys` → **all six settings keys
    present on both majors**; `brand-keys` → **all seven FR-C4 keys present on both**, `navigation`
    a JSON string on each. Both `*_STAFF_ACCESS_TOKEN` present by name.
  - `browser-js` — the embedded Playwright script **parses** with the new `keys-popup` step, the
    rewritten `keys-screen` and the second axe pass in it.
  - The step printed this story's copy read out of `lib/connect-rule.ts` itself, unchanged by the
    Fix: not one sentence moved, which is S11e's own constraint (*"Same content as the long screen,
    nothing removed"*) made checkable.

**The Next.js behaviour this Fix rests on was EXECUTED, not asserted (standing rule 1).** A
throwaway control — a list route, an `@modal/(.)panel` interception, a server action that redirects
back to the panel — was built under `app/(app)/app/`, driven with Playwright against `next dev`
16.3.1, and deleted. **The first attempt was a broken control and is recorded as one** (standing
rule 2): it was built under `(marketing)`, which gets no CSP nonce, so React never hydrated, the
click was a plain document navigation and "interception does not work" was the wrong conclusion.
Rebuilt under the app host, it returned:

| what was driven | what happened |
|---|---|
| the row's guarded `router.push` | **intercepted** — dialog open, list still behind, no full page |
| a server action's `redirect()` from inside it | the popup **stays**, with the action's answer drawn |
| `<Link href="/…">` as the way out | url moved, **panel still mounted** — and the row then opened nothing |
| `router.push` + `router.refresh()` | the same |
| a `[...catchAll]` slot filler | the same |
| `router.back()` | **clean** — panel unmounted, list showing, and the second and third opens worked |
| `router.back()` after a default `redirect()` | back to the **panel**, not the list — a server action's redirect pushes |
| `RedirectType.replace`, then `router.back()` after two saves | **clean** — one history entry for the panel |
| a typed URL, and a refresh inside the popup | the **full page**, no dialog |
| the same form posted with **JavaScript disabled** | `method=post` and React's `$ACTION_*` fields served; the 303 landed with the answer drawn. `RedirectType` steers the client router only |

**Not run in this phase, and named rather than assumed:** `python3
tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` — it drives these screens on the
DEPLOYED site, and the Fix is not deployed until CI publishes this commit (DW-7). It is the Review
phase's, on production, and it is where `keys-screen` (now driven through the ⋯ row) and the new
`keys-popup` are executed against T1 and T3. Frame screenshots against S11e at 1440 / 834 / 390
(`--shots`) belong there too. The owner's manual test (R-80) is his, on the production domains,
after Deploy — steps 2, 11, 12 and 13 are the ones the Fix rewrote or added.

### Fix 2 phase, 2026-09-10 — what each command returned (R-82)

Every command below was run in THIS phase; nothing is carried forward. The real services are named
by the variable each key is held under and never by its value.

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) — **exit 0**. Lint clean,
  `tsc --noEmit` clean, **242 tests, 242 pass, 0 fail** in `apps/web` (241 before this phase; the
  new one is `busy.test.ts`'s navigation rule), plus 1 each in
  `packages/{ghost-shim,section-runtime,theme-compiler}`.
- `pnpm --filter web build` — **exit 0**, "Compiled successfully", and the route table lists
  `ƒ /app/sites` beside `ƒ /app/sites/brand`, `ƒ /app/sites/connect`, `ƒ /app/sites/disconnect` and
  `ƒ /app/sites/keys` — **and no intercepted segment**, which is what says the interception is gone
  rather than merely unused.
- `bash supabase/tests/run-rls-gate.sh` — **exit 0** against the PostgreSQL 17 container it brings
  itself, ending on the DW-44 vault assertions. This phase adds no migration; the gate is run
  because a green schema is a precondition of the push, not because anything moved.
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings** both times.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — **all steps passed**, printing this
  story's copy read out of the app itself. It now prints `keys_empty_admin` — *"Paste the new Admin
  API key first — this box is empty."* — and `keys_opening`, both evaluated out of
  `lib/connect-rule.ts` rather than retyped, which is what proves the new refusal and the new busy
  label exist as the app's own words.

**The mechanism, DRIVEN rather than reasoned** (standing rule 1), on a throwaway route under
`next dev` 16.3.1 built from the product's own `PanelModal` and `PanelLink` and deleted in the same
session. Playwright, Chromium, eight steps, **all green, and the first is the control** that says
the driver can tell the two states apart:

| driven | what happened |
|---|---|
| **control** — the route with no `?manage=` | **0 dialogs**, the list rendered — so a window is something this driver can see the absence of |
| the row's plain click | window open in **135 ms** with its skeleton inside it, against a panel whose own read takes 700 ms — the wait the owner pressed twice into is now behind the window, not in front of it |
| the list, with the window open | **still there** (`?manage=1`) |
| a SERVER ACTION's `redirect(…, replace)` onto the same route from inside the window | **the window stayed open**, the list stayed behind it, and the answer was drawn in the panel — this is his finding 3, and it is the exact press that used to load the full page behind the window |
| the same again | the same |
| **Escape** | the URL left the panel |
| the row's click with the panel's fetch **held back 1.5 s** | the row read **`Opening…`** with `aria-busy=true` and `aria-disabled=true` |
| a **second press** in that gap (forced, because Playwright refuses to click an `aria-disabled` control — which is half the proof) | **one window, one list** — nothing extra opened |

**And the deployed-site harness now drives every one of his findings**, named here rather than
claimed: `keys-popup` asserts the shell's TOP BAR is still drawn while the window is open (finding
1), that a refusal keeps the window open with the cards behind it (finding 3's door), and that an
EMPTY save says which box is empty (finding 4); `keys-test` now presses **Test connection** *in the
window* and asserts one window, one panel, the top bar and the cards — where it used to press it on
the full page and prove nothing about the chrome.

**Not run in this phase, and named rather than assumed:** `python3
tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com`. It drives these screens on the
DEPLOYED site and the Fix is not deployed until CI publishes this commit (DW-7), so it is the Review
phase's, against T1 and T3 — as it was for the first Fix. Frame screenshots against S11e at
1440 / 834 / 390 (`--shots`) belong there too, and the owner's manual test (R-80) is his, on the
production domains, after Deploy. Steps 2, 4, 4b, 11b and 13 are the ones this Fix rewrote or added.

**One thing that was a hypothesis and is now unreachable, recorded so nobody hunts for its proof.**
The second half of his finding 2 — *a second `router.push` from the panel's own address is not
intercepted, so Next serves the full page into the list's slot* — was read off the interception rule
and off the first Fix's own measured table, and it was **never executed**. It cannot be now: the
mechanism it describes no longer exists. What IS executed is the row above — two presses in the gap
leave one window and one list — which is the behaviour the finding asked for either way.


### Review phase, third pass, 2026-09-10 — what each command returned (R-82)

Every command below was run in THIS phase; nothing is carried forward. The real services are named
by the variable each key is held under and never by its value.

**The ground, read before anything else.**

- **Production's schema is at least as new as the code (R-99).** Read through `SUPABASE_DB_POOLER_URL`:
  `select unnest(enum_range(null::public.credential_action))` → `admin_write, admin_read, vault_decrypt,
  entitlement_change, admin_flag_change, moderation, credential_change`; `information_schema.columns`
  for `private.site_credentials` lists `admin_key_id text`. `private.credential_audit` already holds
  `credential_change` rows from the Deploy phase's live steps. PostgreSQL 17.6.
- **Production serves HEAD.** Vercel API (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`,
  `target=production&state=READY`): the latest READY deployment's `githubCommitSha` is `82214783`,
  which is `git rev-parse HEAD` at the start of this review.

**The live harness, `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com`,
against T1 (`GHOST6_*`) and T3 (`GHOST5_*`), four runs on that deployment, before any patch:**

| run | harness | what happened |
|---|---|---|
| 1 | as committed | 75 PASS through `probe-failure`, then **`openKeysPopup` timed out**: the reason text resolved 59 times to a HIDDEN span. Reproduces Story 3.4's seventh-review stall exactly. Cause in source: `SiteUrl` is rendered twice and `.first()` is the phone copy, `tablet:hidden` at 1440 |
| 2 | visibility filter on both `openKeys*` waits | 18 PASS, then `bogus-key` timed out waiting for "Ghost said no" — a step upstream of every change, green in runs 1, 3 and 4 on identical code. Control: `GHOST6_URL/ghost/api/admin/config/` with a bogus key answered **401 in 0.6 s** three times, so Ghost was not slow. A transient in the deployed connect action; not the story's |
| 3 | same | 75 PASS; the popup OPENED. Then **`keys-screen` failed on one term**: `urlFields === 1` — the count was page-wide and the closed connect sheet's `name="url"` field sits behind the window on `/sites`. Then **`axeAt('keys-screen')` at 390 timed out**: the "Manage API keys" row resolved but was not visible, 62 times |
| 4 | + the count scoped to the window, + `--shots` | **76 PASS including `keys-screen`**, then the same 390 stall with evidence recorded: viewport 390×900, the menu popover `display:none` and `:popover-open` false, `linkRect` 0×0, no dialog, URL `/sites`. Screenshot in the review's scratchpad: T1's card is the third and last, at the page bottom |

**What run 4 found is the product's, and it is fixed in this phase.** `openMenu` (`lib/menu.ts`) arms
a close-on-scroll listener synchronously inside the ⋯ click handler; the scroll that brings a ⋯ near
the bottom edge into view — a finger's on a phone, a driver's scroll-into-view here — delivers its
`scroll` EVENT on the next frame, AFTER the listener is armed, so the menu hid in the frame it opened.
It is armed from the next frame now, once that event has been delivered, and the first row is focused
with `preventScroll`. `axe-menu` at 390 never saw it because it waits for the menu to be visible and
presses nothing. **This is a hypothesis executed on the deployed build of THIS commit — the
post-deploy run below is the proof, with the pre-patch runs above as its control** (standing rules 1
and 2).

**Local, after the patches:**

- `pnpm check` (Node 24 on PATH) — **exit 0**. Lint clean, `tsc --noEmit` clean, **242 tests, 242
  pass, 0 fail** in `apps/web` (the count is unchanged: the additions are assertions inside existing
  tests), plus 1 each in the three packages.
- `pnpm --filter web build` — **exit 0**, "Compiled successfully", `ƒ /app/sites` beside
  `ƒ /app/sites/keys` and **no intercepted segment** (run at the start of the review, on the tree
  before the patches; the patches touch no route).
- `bash supabase/tests/run-rls-gate.sh` — **exit 0**, ending on the DW-44 vault assertions, and now
  printing `PASS: credential_change is a value of public.credential_action` right after the
  `admin_key_id` assertion — the migration's second half, asserted for the first time.
- `python3 tools/probe/run-verify-ghost-admin.py --check` — **all steps passed**, and it now prints
  `keys_ghost_refused` out of `lib/connect-rule.ts`.
- `python3 tools/doc-audit.py --check`, twice — recorded below with the commit.

**Run 5 — on the review's own deployment (`4d9c008b`, Vercel READY, `githubCommitSha` checked),
`--url https://app.inflozo.com --shots`, T1 and T3.** **90 PASS, 1 RECORD, 3 FAIL.** Every keys step
green on the two-column window for the first time — `keys-screen`, `axe-keys-screen`,
`axe-keys-route`, **`keys-phone`** (the 390 menu fix held: the ⋯ of the last card opened and its row
was pressed at phone width), `keys-popup` with the ✕, Back and the second open, `keys-malformed`,
`keys-foreign-key`, `keys-other-site`, `keys-rotate`, `keys-token` with `admin_key_id` unchanged,
`keys-js-off`, `moved-domains`, `keys-content`, `keys-test-refused`, and `audit` with DW-76's rows.
The three failures, each executed to its cause and fixed in this phase:

- `keys-test` — the press landed in the window (one window, one panel, the cards and the bar still
  there) and made its one `admin_read` call, but the result text was not in the panel: the harness
  read it the instant the URL changed, which is before the window's server component has re-rendered
  behind its skeleton. Harness: wait for the sentence.
- `keys-forged` — `[true,false,true,true]`: the Content form's forged post did NOT land on the
  not-found page, because that form calls the action itself and the `notFound()` came back as a
  rejection the catch reported as "couldn't save". Nothing was written and nothing disclosed either
  way (the stranger's row byte-identical, 0 credential rows). Product: `isNotFound` + `notFound()`
  from render.
- `browser: locator.click timeout` — the new `keys-test-refused` step left the run on the keys page,
  so `axe-sites` audited it as "sites" (a false PASS — recorded here so it is not trusted) and the
  sheet's opener, which lives in the list's top bar, was not there. Harness: the step ends on `/sites`.

**Runs 6 to 10 — on the deployment of `533d72b8` (Vercel READY, `githubCommitSha` checked), the
commit that carries those fixes, `--url https://app.inflozo.com --shots`, T1 and T3:**

| run | what happened |
|---|---|
| 6 | 16 PASS, then a `waitFor` timeout in the connect wizard's `malformed` step — untouched by this story, green in every other run. Production answered `/sites` in 0.4 s and both resolvers agreed on the address; a transient |
| 7 | 6 PASS, then the sign-in's magic-link `page.goto` timed out even after the harness's own retry — Supabase's verify, nothing this story touches. Same class |
| 8 | **97 PASS, 1 RECORD, 1 FAIL.** Every keys step green — `keys-test` now reads the result in the window, `keys-forged` lands all FOUR forms on the not-found page (the Content form's fix executed), `axe-sheet` and the cascade (`user-gone`, `secret-gone`, `no-secret-leak` over 1542 response bodies) run again. The one failure: `keys-popup`'s new Back assertion read the document the instant the URL was the list's, and the window had not yet left — the harness waits for the dialog to detach before reading (harness only, so runs 9 and 10 are on the same deployment) |
| 9 | 97 PASS, 1 FAIL: `keys-popup` **green** (one Back after two answers is the list, panel gone); `disconnect-forged` — Story 3.5's — missed its landing wait on a run with two navigation retries, the stranger's row byte-identical and nothing written. It passed in run 8 on this deployment |
| 10 | **98 PASS, 1 RECORD, 0 FAIL — `RESULT: all steps passed`**, three navigation retries absorbed by the harness. Every step of this story green in one run on the deployed build, for the first time on the two-column window: `keys-screen` · `axe-keys-screen` · `axe-keys-route` · `keys-phone` · `keys-popup` · `keys-malformed` · `keys-foreign-key` · `keys-other-site` · `keys-rotate` · `keys-token` · `keys-test` · `keys-js-off` · `keys-forged` · `moved-domains` · `keys-content` · `keys-test-refused` · `audit` |

**The frame screenshots** (`--shots`, `s11e-{1440,834,390}.png` in the review's scratchpad, taken by
`keys-screen` with the window open): at 1440 the window is S11e's — header with the title pair and
the ✕, the three credential rows on the left with the Admin row masked (Question 3), the rail on the
right with the address and its reason, the not-readable-back line, the roll-keys hint and **Test
connection** at its foot, Cancel alone in the footer, the Sites cards and the shell's top bar behind
it. At 390 the columns are one, the address at the top, and nothing runs off the edge (`keys-phone`
asserts the geometry). The standing hints under the fields are marigold because that is the Kit's
`TextInput` hint style everywhere, the wizard included — checked, not a leak of the error state.

**Question 4's ruling, applied and checked (2026-09-10).** `git mv` of the frame into
`claude-design-export/Inflozo/` and of the rendered `.png` into its `screenshots/`; the folder's
`support.js` was `cmp`-identical to the export's and was removed rather than duplicated. Then:
`python3 tools/doc-audit.py --check` twice — the first regenerated the index for the moved row, the
second **PASS, 0 warnings**; `pnpm check` — **exit 0, 242 pass** (`tokens.test.ts` reads every frame
under the export, S11e now among them); `python3 tools/verify-design-pass.py` — **every structural
check passes**; `python3 tools/inventory-gen.py --check` — **current**, the library counts unchanged,
which is the control that a window frame is not mistaken for a library design. A recursive grep for
`design/ManageKeys` afterwards finds only quotations and dated records.

**The control for the 390 menu fix, stated rather than implied:** runs 3 and 4 on the previous
deployment failed inside `openKeysPopup` at 390 with the menu already hidden; runs 8, 9 and 10 on
this one opened the last card's ⋯ at 390 and pressed its row (`keys-phone`, `axe-keys-screen`). Same
harness path, one product change in between (`lib/menu.ts`).

### Deploy phase, 2026-09-10 — the migration was already applied; this pass confirms HEAD is live

**No new migration.** `supabase/migrations/20260909180000_credential_audit_and_key_id.sql` was applied
to production by hand at the first Deploy pass this same day, and read back then: `credential_change`
in `public.credential_action`'s enum, `admin_key_id text` on `private.site_credentials`. Nothing
touched `supabase/` between that pass and this one — the Fix, Fix 2 and Review-third-pass phases each
recorded "no schema file changed in this phase" — so there is no new SQL to apply. `bash
supabase/tests/run-rls-gate.sh` re-run in this phase: **exit 0**, ending on the DW-44 vault assertions
and `PASS: credential_change is a value of public.credential_action`.

**What changed since the last Deploy pass is four commits of Review work** (`4d9c008b`, `533d72b8`,
`b1ef6eee`, `d6c296f4`) — the phone-width menu fix, the `keys-test`/`keys-forged` harness and product
fixes, and Question 4's file move — **already pushed to `main` and already live**, per R-81/DW-7: CI
publishes on every push. This phase's job is to confirm HEAD is what production serves, not to publish
it again.

- **CI**: `GET /repos/Inflozo/inflozo/actions/runs?head_sha=d6c296f4c54fb390e69cbbc23fe369295b245b3a`
  (`GITHUB_TOKEN`) — run `34464124236`, `CI`, **completed / success**.
- **Deployment: `https://inflozo-mz2wohp9s-umangkagathara.vercel.app`
  (`dpl_98SGypKvtZyivjxA2DUpYc7gBWzF`)**, `target=production`, **`READY`**, `githubCommitSha`
  `d6c296f4` — `git rev-parse HEAD` at the start of this phase (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`,
  `VERCEL_PROJECT`).
- **Aliased**: that deployment's own alias list (`GET
  /v2/deployments/dpl_98SGypKvtZyivjxA2DUpYc7gBWzF/aliases`) carries `app.inflozo.com` and
  `inflozo.com` — production is serving this commit, not an earlier one.
- `bash supabase/tests/run-rls-gate.sh` — exit 0 (above).
- `python3 tools/doc-audit.py --check`, twice — **PASS, 0 warnings**.

**Not re-run in this phase, and named rather than assumed:** the full live harness against
`https://app.inflozo.com` — Question 4's own commit changed no product behaviour (its diff to
`apps/web` is two doc-comment lines, `git show --stat d6c296f4`), and the Review third pass already
ran it to green on `533d72b8` (run 10: **98 PASS, 1 RECORD, 0 FAIL, `RESULT: all steps passed`**) and
again on `b1ef6eee` (its own commit message: "all 98 live steps green on the deployed build, T1 and
T3"). Re-running it here would prove the same code a third time. The owner's manual test (R-80) is
next, on `https://app.inflozo.com`, which this phase confirms is live at HEAD.

## Spec Change Log

Four departures from the Code Map, each recorded here rather than made silently. None changes an
acceptance criterion; three are the Code Map disagreeing with itself and one is a test that had to
be widened rather than weakened.

1. **The ⋯ row NAVIGATES; it does not open a dialog over the card.** *(REVERSED by the Fix of
   2026-09-10 — see entry 8 below. Kept as written because this log is a record of what was decided
   when, and this is what the Dev pass decided and why.)* The Code Map asked for both:
   `site-menu.tsx`'s entry says "same `<a href>`-intercepted-into-a-`<dialog>` shape as Disconnect",
   and `(list)/page.tsx`'s says "the card's **link** to `/sites/keys?site=…` is the ⋯ row" with no
   credential read added to that page. Only one of the two can be built. **The link wins**, because
   the panel draws the Admin key's public id half, which lives in `private.site_credentials` and is
   reachable only through `server/ghost-admin` (§21j): a dialog rendered on the Sites list would
   mean one pooler round trip per card on the busiest route in the app, or a dialog whose Admin row
   disagreed with the route's — which is precisely the drift "ONE component for both" exists to
   prevent. The harness agrees: this story's `keys-js-off` asserts the route's forms and the row's
   href, where 3.5's asserted the dialog's forms *and* the route's. Recorded in `site-menu.tsx` and
   in `keys/page.tsx`'s header.
2. **A fifth change to the chokepoint: `credentialsOf()`.** The Code Map counts four and then tells
   `keys/page.tsx` to read "the credential row through `ghost-admin`", which is a fifth. It returns
   the Admin key's public id half and the two rotation stamps and nothing else — no ref, no
   decryption — so the count was about not WIDENING the chokepoint, and this does not. It puts
   `keys/page.tsx` on `server-wiring.test.ts`'s chokepoint importer list with its reason, which is
   what that list is for.
3. **`remove()`'s audit row is CONDITIONAL.** DW-76 says "one `audit()` call inside `remove()`". It
   is written only when a credential actually came out — the same `is not null` the update matches
   on. `disconnectSite` removes BOTH kinds on every press and nothing stores a staff token until
   Epic 7, so an unconditional row would have written a false "the staff credential came out" line
   into the one record that exists to be trusted, on every disconnect, for ever. That is DW-76's own
   argument against writing under `vault_decrypt`, one table over.
4. **`connect-rule.test.ts`'s Admin-path assertion now compares DISTINCT paths.** It asserted the
   sorted list of `path: '…'` literals in `sites/actions.ts` equals `['config/', 'site/']`; this
   story adds three more call sites to those same two endpoints and none to a third. The contract is
   which endpoints Inflozo reaches, not how many callers reach them, so the set is what is compared.
   The Ask First it guards — a third Admin path — still fails it.

**Three more departures, found by the code review of 2026-09-09 and recorded here rather than left
in the code alone.** None changes an acceptance criterion; the first two were made at Dev and not
written down, and the third is the review's own.

5. **A malformed Staff Access Token answers `token_malformed`, not the frozen matrix's
   `credential_malformed`.** The matrix row *Add the Staff token* says `credential_malformed under
   staff_token`; the Code Map introduces `token_malformed` and the code follows the Code Map. The
   SENTENCE is why: `credential_malformed`'s names the Inflozo integration, and a Staff Access Token
   is not on the integration at all — it is on the person's own profile. The field is unchanged, so
   the row's observable half (`under staff_token`) holds.
6. **`findSiteByAdminKeyId` takes a required third argument, `exceptSiteId`.** The Code Map names
   `{ userId, kid }`. It cannot be two: the caller stores the key BEFORE it looks, so the new record
   carries the very id being searched for and would always match itself — and `site_id <> null` is
   NULL rather than true, so a defaulted argument would answer "no match" every time, silently, with
   every check green. Its own doc comment carries this; the Change Log did not.
7. **The moved-domains redirect goes to the Sites list rather than to Story 3.4's S2c brand screen.**
   The Boundaries say the connect action's probe/brand tail is not to be edited, and this rides its
   final `redirect()`. It takes nothing away — S2c's offer is a LINK on the card that never retires
   (`brand-skip` proves it, and `site-notices.tsx` keeps drawing it) — where the other order would
   have shown S2c and swallowed the hint, which has no second chance. Recorded because it is a
   behavioural change to another story's flow.

**Five more from the Fix of 2026-09-10 — the owner's two test findings.** Each is a departure from
what the Dev pass built or from the frame it was rebuilt on, and none changes an acceptance
criterion except the ones the findings themselves added.

8. **ENTRY 1 ABOVE IS REVERSED: the ⋯ row opens a WINDOW over the list after all, and it keeps its
   `href`.** The Dev pass read the Code Map's two shapes as exclusive and chose the link, because
   the panel draws the Admin key's public id half, which lives in `private.site_credentials` and is
   reachable only through `server/ghost-admin` (§21j) — a dialog rendered by the Sites list would be
   one pooler round trip per card on the busiest route in the app. That cost is real and the
   conclusion was not: a popup does not have to be rendered by the list. `sites/@modal/(.)keys`
   intercepts a soft navigation to `/sites/keys` and draws `keys-screen.tsx` — the same component
   the full page draws — in a `<dialog>` over it, so the read is still ONE and still only taken when
   somebody opens the panel. The row's click is a guarded `router.push` of its own `href` (the
   guard is Disconnect's, alt included), so the destination, the modified click and the scripts-off
   path are all untouched. **Both halves of the Code Map turn out to be buildable.**
9. **THE WAY OUT OF THE POPUP IS `router.back()`, AND IT CANNOT BE A `<Link>`.** Measured on a
   throwaway control under `next dev` (2026-09-10) rather than reasoned: **Next keeps an unmatched
   parallel slot's state across a soft navigation**, so `<Link href="/sites">` moved the URL to
   `/sites` and left the panel MOUNTED in the slot — and the ⋯ row then did nothing at all the
   second time it was pressed, because the dialog was already in the DOM and closed and nothing
   re-ran `showModal()`. `router.push` + `router.refresh()` and a `[...catchAll]` slot filler were
   both tried against the same control and both failed the same way; `router.back()` passed, and the
   second and third opens worked. The full page keeps its `<Link>`, which is correct there because
   its slot holds nothing. So `KeysPanel` takes one `popup` boolean and draws one way out or the
   other — the `disconnect-confirm.tsx` `cancel` prop's argument, at one prop instead of two nodes.
10. **THE THREE KEYS ACTIONS REDIRECT WITH `RedirectType.replace`.** A server action's `redirect()`
    PUSHES by default, which the same control showed costs a history entry per save — so after one
    refusal the first Back returned to the panel as it stood before the save instead of to the list,
    and after two saves it took three. With `replace` there is exactly one entry for the panel
    however many keys are pasted, so `router.back()` is always the list. It costs the scripts-off
    path nothing: `RedirectType` steers the client router only, and the control's JavaScript-disabled
    POST got the same 303 onto the same URL.
11. **THE RAIL'S TINT IS `paper-raised` (`#FBF9F5`) WHERE S11e DRAWS `#FAF8F5`.** `tokens.test.ts`
    fails any colour value that does not occur verbatim in the Claude Design export, and `#FAF8F5`
    does not; `paper-raised` is the nearest token the export does carry. The alternative was a
    twelfth colour in the token layer that no export frame draws, which is the second vocabulary
    R-74 exists to prevent. Every other value in S11e — the coral, the ink, the paper, the line, the
    mint pair, the marigold, the three faces, the `#EFEAE2` hairline as `line-faint`, the 16px
    radius and the modal shadow at .25 — is already a token, checked before the frame was accepted.
12. **A `Refresh` GLYPH JOINS THE KIT**, for S11e's **Test connection**. The path is the export's
    own — it is drawn verbatim in `S11 Sites.dc.html`, `S8 Deploy.dc.html` and `S10 Assets.dc.html`
    — so it is lifted, not invented, and Story 3.7's *Re-check connection* will want the same one.
13. **EACH PASTE ROW STAYS A STACK — label, field, hint, button — WHERE S11e DRAWS ONE INLINE ROW**
    (`Paste new` · field · **Save key**, side by side). It is the consequence of the routine call
    above rather than a second decision: the frozen Boundaries put a refused key's sentence **under
    the field it was typed in**, S11e draws no error state at all, and an inline row has nowhere to
    put one — nor the Admin field's standing hint, which the Dev pass already drew. So the row keeps
    the Kit's `TextInput`, which owns label, hint and refusal in one column. Rendered and measured
    at the Fix: the panel comes out at **900 × 743 at 1440**, the frame's own dimensions, so the
    stack costs the layout nothing.

**Five more from the Fix of 2026-09-10 (his SECOND test of this screen).** Entry 8 above is
reversed and the rest are new; none changes an acceptance criterion, and two of them ADD one.

14. **ENTRY 8's INTERCEPTING ROUTE IS GONE. The popup is `/sites?manage=<id>`, a query parameter on
    the Sites list.** The intercepted route was built and shipped on 2026-09-10 and he tested it the
    same day: an intercepted popup lives at the PANEL'S own URL, so opening it moved the path off
    `/sites` — which took the shell's top bar with it, his finding 1 — and every answer from inside
    it was a navigation Next did not intercept, so the full page loaded behind the still-open window
    and took the list with it (his findings 2, 3 and 5). On a parameter the route never changes: an
    action's redirect is an ordinary same-route answer, exactly what `?recheck=`, `?disconnect=` and
    `?moved=` have always been on this list, so the panel is re-rendered inside the window that is
    already open. **What entry 8 promised is unchanged and is what made this possible at all** — the
    ⋯ row keeps its `href` to `/sites/keys?site=…`, `keys-screen.tsx` is still the one component
    both chromes render, and the credential read is still taken once and only when the panel is
    opened. `sites/layout.tsx`, `sites/@modal/**` and `keys-back.tsx` are deleted; `panel-modal.tsx`
    keeps the measurements. **The build's route table is the check**: a `(.)keys` in it means the
    interception has come back.
15. **THE THREE ACTIONS TAKE A CHROME MARKER.** `saveKeys`, `removeToken` and `testConnection` each
    answer ONTO the screen the press came from, and there are now two of those — so each form
    carries a hidden `popup` field and `keysBase()` decides the redirect's base once per action. It
    is not a URL read off the post: the field is a flag and the action builds both addresses itself.
    `useBrand`'s failure path takes the same marker, because Story 3.4's popup had the same defect
    latent in it (standing rule 3).
16. **AN EMPTY SAVE IS REFUSED UNDER ITS OWN FIELD, WHERE IT USED TO SAY NOTHING** — his finding 4,
    and a NEW acceptance criterion. `saveKeys` read "a press with nothing to do says nothing about
    it"; R-98 is his own ruling the other way. Three new codes — `credential_empty`,
    `content_key_empty`, `token_empty` — because `keysFieldOf` derives the field FROM the code, and
    the row that was pressed is the one that posted its own field.
17. **THE ⋯ ROW SAYS `Opening…` AND REFUSES THE SECOND PRESS** — his finding 2, and a NEW acceptance
    criterion. `panel-link.tsx` is the one control that opens a panel over this list (the card's
    brand offer uses it too), and `busy.test.ts` gained the rule that caught nothing here before:
    every `router.push` sits inside a `useTransition`. The submit rule walks `type="submit"` and
    could never have seen a link.
18a. **A SITE THE WINDOW CANNOT DRAW RETURNS TO `/sites` INSTEAD OF 404ing**, and only in the
    window. `notFound()` inside the LIST's own `<Suspense>` takes the list to the not-found page, so
    a stale or forged `?manage=` would have cost the customer the screen he was looking at — which
    the full page cannot do, because there the panel IS the page. Both answers disclose exactly the
    same (nothing about whether the row exists), and it is already what an already-disconnected
    record does in both chromes. The full page still 404s, and `keys-forged` still drives it there.
    *The narrowing had to be a `function` declaration and not a `const` arrow — `keysRedirect`'s own
    recorded lesson, met again.*
18. **THE PANEL'S ADDRESS IS A LINK THAT OPENS IN A NEW TAB.** Story 3.4's own finding 2 asked for it
    on the brand popup; the same address is drawn in three places and behaved two ways, so it lands
    here as well (standing rule 3). It is not an edit affordance — A9 item 17 stands, the reason line
    under it is unchanged, and there is still no field.

**Three more, found by the third review (2026-09-10) — each was true at the second Fix and not written
down.**

19. **THE CONTENT ROW'S SAVE IS A KIT `Button` + `BusyLabel`, NOT A `Submit`**, and the ⋯ row is a
    `PanelLink` `<a>`, where the frozen Boundaries say "every control that starts work is a
    `Submit`". Both carry R-98's whole behaviour — the label swap, `aria-disabled` + `aria-busy`, the
    second-press guard — and both are pinned by `busy.test.ts`; the Content form's own header says
    why `useFormStatus` cannot serve it (its action is never dispatched by the form). The Boundary's
    literal shape is not what shipped; its behaviour is.
20. **THE STAFF ROW DRAWS A HINT UNDER ITS FIELD** (`KEYS.staff.ask`, the path to the token in Ghost
    Admin) where S11e draws none under that row. It is the Admin row's own shape one row down, and
    the sentence is the one a customer who has never seen a Staff Access Token needs.
21. **"Added" IS INK-SOFT, NOT THE FRAME'S MINT.** S11e colours the present state's word green; the
    screen keeps the dot green and the word in the same quiet grey as "Not added", so present and
    absent read as two states of one thing and not as a pass and a fail — the acceptance criterion
    "present or absent, and never an error badge", applied to the good half too.

**Two departures from the frames, both drawn from the frame that is nearest and both recorded in
`lib/connect-rule.ts` with a test over them** (R-74; the precedent is Story 3.4's
hex-instead-of-colour-name):

- **No reveal control and no trailing characters.** B20 masks each key with its first *and last*
  characters and offers an eye. The last characters are the secret half, which exists for
  milliseconds inside `server/ghost-admin/index.ts` and reaches no render path (AD-10). The screen
  draws the half that is not a secret — the Admin key's `id`, which rides in the header of every JWT
  Inflozo mints — and one line says Inflozo cannot read the rest back either. `Eye` and `EyeOff` are
  in the Kit and are deliberately unimported; the harness's `keys-screen` step counts the elements
  offering to reveal and requires zero.
- **"Added" / "Not added", never B20's "Working".** A green dot and "Working" claim a check has just
  passed. Nothing checks on load — **Test connection** is where a customer asks, and the continuous
  answer is Story 3.7's health badge — so the screen says what it knows. This is also the acceptance
  criterion "present or absent, and never an error badge".

**And one departure from S11e itself, which is the OWNER'S OWN** (Question 3, ruled 2026-09-10): the
new frame draws the masked line under **Content API key** only, and the screen draws it under
**Admin API key** as well. His words: *"Keep the line under Admin API key as it is today."* It is the
only thing on the screen that says WHICH Admin key is stored, and his manual test step 5 reads it.

## Owner's test findings

Tested on `app.inflozo.com` on **2026-09-10**. **Two findings**, and they are the same complaint from
two directions: **the API keys screen is a place you go to, and once you are there it is a long
scroll.** Neither is a defect in what the screen *does* — the eleven live steps of the Deploy phase
all held — and neither is about a sentence or a refusal. Both are about the surface's shape, and both
are fixed inside this story (R-80 as amended), not by a design pass. His words first, then the
triage.

1. **"Can we show the Manage Keys as a popup on the Sites screen rather than a separate screen for
   Manage API Keys."**

   *What was seen:* clicking **Manage API keys** in a card's ⋯ menu leaves the Sites list and loads a
   whole new page. **Disconnect**, one row below it in the same menu, does not — it opens a window
   over the card you were looking at. Two rows of one menu, two different behaviours.

   *Whose:* **this story's, and it was a deliberate choice made at Dev.** It is Spec Change Log
   entry 1, written down on 2026-09-09: the Code Map asked for both shapes and only one could be
   built, and the link won. `site-menu.tsx:96` is a plain `<a href="/sites/keys?site=…">` with no
   click interception, where the Disconnect row six lines below it intercepts into the card's
   `<dialog>`. So the finding is not that something broke — it is that the choice was made on an
   engineering ground and reads wrong to the person using it.

   *The engineering ground, and why it does not survive:* the reason recorded in `site-menu.tsx` and
   in `keys/page.tsx`'s header is that the panel draws the Admin key's public id half, which lives in
   `private.site_credentials` and is reachable only through `server/ghost-admin` (AD-10, §21j) — so a
   dialog rendered by the Sites list would mean one pooler round trip **per card** on the busiest
   route in the app, or a dialog whose Admin row disagreed with the route's. That is a real cost and
   it is still real. What it does not justify is the conclusion: a popup does not have to be rendered
   by the list. **Next.js renders a modal over a list from the route itself** — the panel stays one
   server-rendered component with one credential read, taken only when somebody actually opens it,
   and `/sites/keys?site=…` stays exactly where it is for a typed URL, a new tab and a browser with
   scripts off. Both halves of the Code Map turn out to be buildable after all; the Dev pass chose
   between them a day too early.

   *What must not be lost in the fix:* the row keeps its `href` and its destination — that is the
   whole JavaScript-off story and it is an acceptance criterion, not a nicety — and there stays
   **one** component drawing the panel, so the popup and the page can never disagree.

2. **"It is too long, I want it redesigned as per the artifacts in
   `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/design/ManageKeys`"**

   *What was seen:* the panel is a single column — title, address, three credential blocks, the line
   about not being able to read keys back, the roll-keys hint, **Test connection** and its result,
   then Cancel — stacked one under the other, so on a laptop it runs off the bottom of the screen.

   *Whose:* **this story's.** The single column is what `keys-panel.tsx` draws today and what the
   frames it was built from — S11d's chrome around B20's rows — draw. Nothing regressed; the shape
   was always this.

   *The artifact, and where it now sits:* `design/ManageKeys/` is a new Claude Design frame,
   **S11e Manage Keys Popup**, a 900 × 743 window that holds the same content in two columns —
   **the three keys on the left, everything you read rather than type in a context rail on the
   right**: the site address with its "fixed for this connection" reason, the line about only the
   start of a key being shown, the roll-keys hint, and, sitting at the bottom of the rail, the **Test
   connection** card with its result above the button. A ✕ in the header, **Cancel** in the footer.
   Its own subtitle states the constraint the fix must hold to: *"Same content as the long screen,
   nothing removed."*

   *Checked before it was accepted, rather than assumed (R-74):* every colour, face and radius the
   new frame uses is one the export already uses — the coral `#FF5941`, the ink `#1C1B1A`, the paper
   `#F7F5F2`, the line `#E7E2DB`, the mint `#1FA97A`/`#157A58`, the marigold `#8A6100`, Bricolage
   Grotesque, Inter and JetBrains Mono all appear in the export's own frames, and `#EDEAE6` and
   `#6E6A64` are in the Calibration Set itself. **One exception, and it needs no literal:** the info
   block's `#E9EFFC`/`#2A448C` pair is not in the export, and that block is built from the Kit's own
   `Banner kind="info"` — which is already what `keys-panel.tsx` draws there. So this is not a second
   interface vocabulary beside the export's; it is the export's vocabulary in a wider frame. It is
   filed in the repository with a catalogue row and it is what this surface is now built from.

   *One thing the new frame changes rather than rearranges,* and it is the only content difference
   between it and the screen as built: it draws no masked line under **Admin API key**. That was
   **Question 3** above and the owner ruled it on 2026-09-10 — **the line stays**, exactly as the
   screen draws it today. Everything else in S11e is taken as drawn, so the Fix has nothing left
   to decide and no content to remove.

**Not a finding, and recorded so it is not read as one:** his third line — *"If you have any queries
and are not 100% sure, ask me questions before proceeding"* — is an instruction, not a fault. It is
answered by Question 3.

**The routine calls, made rather than asked** (R-83's other half):

- **The popup is built as a Next.js intercepting route over `/sites`, not as markup the list page
  renders.** A click from the ⋯ opens the panel over the Sites list; a typed URL, a modified click,
  a refresh and a scripts-off browser all still get `/sites/keys?site=…` as a full page. One
  component, one credential read, and only when it is opened.
- **On a phone the two columns become one.** The site address stays at the top, where it says which
  site you are looking at; the rest of the rail — the not-readable-back line, the roll-keys hint and
  the Test connection card — goes below the three keys, in the rail's own order. Step 11 of the
  manual test is what checks it.
- **Refusals stay under the field they came in.** The two-column frame draws no error state; the
  frozen Boundaries say a refused key is refused under its own field, and that does not move.

### What the Fix did, 2026-09-10

*(A record of the FIRST Fix, kept as written. The intercepting route, `router.back()` and
`keys-back.tsx` it describes were all removed the same day by the second Fix — Spec Change Log
entry 14 — after the owner's second test; `panel-modal.tsx` carries what replaced them.)*

**Both findings are closed, and the two things the fix had to hold to are held.** Finding 1's
"the row keeps its `href` and its destination" and "there stays ONE component drawing the panel":
`site-menu.tsx`'s row is still `<a href="/sites/keys?site=…">` and its click is now a guarded
`router.push` of that same address (Disconnect's own guard, alt included), which
`sites/@modal/(.)keys` intercepts into a `<dialog>` over the list; `keys-screen.tsx` is the one
component both that popup and `/sites/keys` render, so the credential read is still one and still
taken only when the panel is opened. Finding 2's "same content, nothing removed": not one sentence
in `KEYS` moved — the harness prints them out of `lib/connect-rule.ts` and the list is unchanged —
and the Admin row's mask stays, which is Question 3's ruling and is recorded in the Spec Change Log
as this screen's one departure from S11e.

**Two things had to be measured rather than reasoned, and one of them changed the design.** Next
keeps an unmatched parallel slot's state across a soft navigation, so a `<Link>` out of the popup
left the panel mounted and **the ⋯ row opened nothing the second time it was pressed**; and a server
action's `redirect()` pushes a history entry, so one Back after a refusal returned to the panel
rather than to the list. The answers are `router.back()` and `RedirectType.replace`, both executed
against a throwaway control under `next dev` and both recorded in the Fix phase's `## Verification`
— including the first control, which was broken and proved nothing. Change Log entries 8 to 12 carry
the rest; `keys-back.tsx` carries the measurement beside the code it governs (standing rule 3).

**And the harness now drives the door the customer uses.** `keys-screen` opened the screen with a
`page.goto`, which is a document load and therefore the full page; it now clicks the ⋯ row and
asserts an open `<dialog>` with the Sites cards behind it, and a new `keys-popup` step executes each
claim above — the refusal that keeps the window open, the way out, **the second open**, Escape, and
the typed URL that is still the full page. `axe` runs over both shapes.



## Owner's test findings

Tested on `app.inflozo.com` on **2026-09-10**, on the Fix that made Manage keys a popup (`f59a11f2`,
`afd5718d`). **Five findings**, and they are **two causes wearing five faces**: a top bar keyed on
the URL, and every way this panel answers the customer being a navigation the popup does not
survive. Nothing he reported is about what the screen says, which key it refuses or what Ghost
answered — the eleven live steps of Deploy still hold. His words first, then the triage.

1. **"When I click on 'Manage API Keys' menu link on a site card, the pop up opens but then the top
   bar with search box and Connect site buttons disappears."**

   *Whose:* **shared with Story 3.4's finding 1**, reported in the same sitting about the brand
   popup, and one defect in one file. The triage is written once, in
   `spec-3-4-take-my-brand-from-my-site-in-one-click.md`, and in short: the top bar is the SHELL's,
   `BARS` (`components/shell/shell.tsx:125-128`) is keyed on the **exact** path — `'/'` and
   `'/sites'` — and `shell.tsx:250` is `const bar = BARS[path]`. A popup is an intercepted route and
   MOVES the URL to `/sites/keys`, which is not a key in that table, so the shell draws no bar.
   Disconnect's dialog, rendered by the card and navigating nowhere, is the control that has never
   done this.

   *Fixed **once**, in `shell.tsx`, and re-tested on both popups* — and without giving a top bar to
   `/sites/keys`, `/sites/brand` or `/sites/connect` reached directly, which are full pages and have
   never had one. The rule is "the bar belongs to the route BEHIND the popup", not "every path under
   `/sites`".

2. **"When that popup opens, it takes some time and while it is still not open I can click the Menu
   link again. If I do so the popup open on a blank screen instead of the Sites screen."**

   *What was seen:* the ⋯ row is pressed, the window takes a moment — it is a server render with a
   credential read behind it — and in that moment the row can be pressed again. The second press
   leaves the panel over nothing.

   *Whose:* this story's, and it has two halves, one of which the project **already has a rule for
   and did not apply**.

   - **The row does not say it is working.** R-98 — his own ruling out of the Story 3.4 test — says
     every control that starts work swaps its label and goes `aria-disabled` + `aria-busy` until the
     work lands. `site-menu.tsx`'s Manage API keys row is an `<a>` whose plain click is a bare
     `router.push` with no pending state at all. And `apps/web/busy.test.ts` walks the tree for
     exactly this and did not catch it, so **the check's own reach is part of the finding**: it
     tests forms and Kit `Submit`s, and this is a link that starts a navigation. The fix leaves a
     check that would fail.
   - **The second press is not intercepted.** `(.)keys` intercepts `/sites/keys` on a navigation
     from `/sites`; the first press has already moved the router to `/sites/keys`, so the second is
     a navigation from the panel's own address and Next serves `sites/keys/page.tsx` into
     `children` — the Sites list goes — while the dialog, which `panel-modal.tsx` holds open for as
     long as the path is the panel's, stays over it. That is the "blank screen": the full-page panel
     behind a dialog's backdrop, with no list.

   *That second half is a HYPOTHESIS until it is executed* (standing rule 1). It is read off the
   interception rule and off `panel-modal.tsx`'s own measured table, not driven. The Fix drives it
   on a throwaway control and records what actually happened, with the control that proves the
   driver works (standing rule 2).

3. **"When I click Test Connection in the Pop up, It tests it but opens a new popup in the
   background with Test results. Then both these popup appear on a blank screen."**

   *Whose:* this story's, and it is a measurement **this story already took and did not follow
   through** (standing rule 3). `testConnection` ends `keysRedirect(KEYS_TESTED(site.id, result,
   status))` — a server action's `redirect()` back onto `/sites/keys?…&tested=…`. The Fix of
   2026-09-10 executed and wrote down that **a server action's `redirect()` is not intercepted at
   all** (`panel-modal.tsx`; `actions.ts`'s `keysRedirect` header). It drew the right conclusion for
   the brand offer, whose controls leave to `/sites`, and missed that **all three of Manage keys'
   actions answer ONTO the panel's own URL**. So every press of **Test connection**, every save and
   every refusal replaces the list behind the window with the full-page panel: the "new popup in the
   background with Test results" is that full page — holding the fresh answer — and the "blank
   screen" is the list that is no longer there.

4. **"Also when I click Save Key without any inputs, it does not show any error. May be showing in
   the background popup?"**

   *Two things, and only one of them is a defect.*

   - *There is no error in a background popup — there is no error at all, by design.* `saveKeys`
     reads "A form posted with nothing in it is a press with nothing to do, and it says nothing
     about it" (`actions.ts`) and redirects back to the panel with no reason in the URL. His guess
     is a good one for everything else on this screen, where a refusal really is on the page behind:
     that is finding 3's cause, and it applies to a save exactly as it does to a test.
   - *And the design is thin against his own ruling.* R-98 says a pressed control says it is working.
     Here a pressed control says nothing, does nothing, and lands the customer back where they were
     with no word for it. **The routine call, made rather than asked** (R-83's other half): an empty
     save is refused **under the field it came in**, which is what the frozen Boundaries already
     require of every other refusal on this screen, with its sentence added to `KEYS` in
     `lib/connect-rule.ts` so the harness reads it from there (standing rule 4). Each credential row
     posts only its own field (`keys-panel.tsx`'s three `PasteForm`s), so the refusal lands on the
     row that was pressed and on no other.

5. **"Overall the user experience is not good and is very buggy. There should be only one perfect
   popup and that only should be source of truth."**

   *Read as the verdict it is, not as a sixth defect.* Findings 1 to 4 are five faces of two causes,
   and "one popup, and only that one is the source of truth" is precisely what the second cause
   breaks: today there can be two panels on screen at once — the popup's and the full page's — and
   it is the full page, the one he cannot get at, that holds the fresh answer.

   *What it does NOT ask for, and must not be read as asking for:* the full page is not the popup's
   rival. It is the JavaScript-off route and the typed-URL route and it is an acceptance criterion
   of this story. One panel COMPONENT (`keys-screen.tsx`) already draws both chromes; what the fix
   owes is that **only one of them is ever on screen at a time**.

   *The mechanism call, made rather than asked* (R-83's other half): **the popup stays an
   intercepted route and its three actions stop navigating away** — they answer into the panel that
   is already open instead of redirecting onto its own URL. That is the smallest change that kills
   findings 2, 3 and 4's second half at the root and leaves the JavaScript-off path exactly as the
   frozen Boundaries require: every control is still a real `<form>` posting a server action, and
   with no script the post is still a document load onto `sites/keys/page.tsx`. The two rejected
   alternatives are recorded so they are not re-proposed: redirecting to `/sites` and putting the
   result on the card **loses the result the customer pressed for**, and going back to a full page
   **undoes his finding 1**.

**One propagation, taken while triaging and named here so it is not read as scope creep**
(standing rule 3): the site's address is drawn in three places and behaves two ways. The Sites card
links it with the new-tab glyph; the brand popup does not (Story 3.4's finding 2, being fixed there);
and `keys-panel.tsx`'s `SiteUrl` (`:187`) draws it as plain mono text in both of its two renders.
The same lift goes in here at the Fix, so the app has one behaviour for one thing.

**Nothing here belongs to a later story and nothing needs a sub-story.** The only file outside Epic 3
is `components/shell/shell.tsx`, which Story 1.5 shipped and which has been right at every address
that existed until these popups moved the URL under it — so the defect is the popups' and R-80 keeps
it with the story whose surface shows it. `busy.test.ts` widening to cover a navigating link is this
story's too: it is the check R-98 already demanded, short of the control that walked past it.

## Found by Story 3.4's seventh review, 2026-09-10 — the live run stops inside `keys-screen`

Story 3.4's review ran the whole harness against the deployed build of `7964895d` (which carries
this story's Fix `acd31327`). Every step up to and including `probe-failure` reported; the run then
timed out in **`keys-screen`**'s `openKeysPopup`: `locator('dialog[open]').getByText(KEYS.urlReason)`
resolved 58 times to a **hidden** `<span class="text-helper-caption …">` and never became visible,
so none of `keys-screen`, `keys-popup`, `keys-malformed`, `keys-foreign-key`, `keys-other-site`,
`keys-rotate`, `keys-token`, `keys-test`, `keys-js-off`, `keys-forged`, `moved-domains`, `user-gone`,
`secret-gone` or `no-secret-leak` ran. The span is in the document inside an open `<dialog>` and is
not visible — whether that is the panel, the dialog's own paint, or the locator is **this story's
Review to find**; Fix record 3 above says the live run was "not run in this phase". Two waits of the
same class 3.4's review fixed for its own steps were fixed here as well while it was in the file:
`keys-popup`'s Cancel and Escape waited on `pathname === '/sites'`, which is already true inside
the popup, and now wait for `?manage=` to leave. (Recorded here so this story cannot be closed on
3.4's claim — standing rule 3.)

## Owner's test findings

Tested on `app.inflozo.com` on **2026-09-10**, on the deployment confirmed at the Deploy phase
(`d6c296f4`). **Passed.** No findings. The story moves to Done.

