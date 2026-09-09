---
title: 'Story 3.6 — Manage keys, and a partially credentialed site as an ordinary state'
type: 'feature'
created: '2026-09-09'
status: 'in-review'
baseline_commit: '8c301682b72bc598e082f62c4f6813244418dfbd'
review_loop_iteration: 1
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story every connected site has an **API keys** screen — reached from the ⋯ on its card —
that lists the three credentials Inflozo can hold for it, says in one line what each one lets Inflozo
do, and shows plainly which of them you have and which you have not. You can paste a fresh Admin or
Content key into it when you roll your keys in Ghost, add or take away the Staff Access Token
whenever you like, and press **Test connection** to watch Inflozo actually reach your Ghost and
report back. Not having the token is shown as a choice you have not made yet, never as something
wrong with your site.

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
- **A pasted Admin key that belongs to a DIFFERENT Ghost install is refused.** After validating, read
  `GET /admin/site/` and compare its `url` against the record's `site_settings.public_url` (falling
  back to `sites.url`). This is the same hazard FR-C8 killed edit-URL-in-place for — carrying one
  site's record, snapshot and first-upload flag onto another live Ghost — reaching the record through
  the key field instead of the URL field. The refusal names the fix: disconnect and connect the new
  address.
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
| Paste a key Ghost refuses | A well-formed key from a deleted integration | Nothing written; the field says the key was regenerated or removed in Ghost Admin — never "expired" | `ghost_unknown_key` / `ghost_unauthorized`, under `admin_key` |
| Paste ANOTHER site's Admin key | A valid key whose `GET /admin/site/` url differs from this record's | **Refused**, nothing written, and the sentence names disconnect + reconnect | `keys_other_site`, under `admin_key` |
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
  **refused**, nothing is written, and the sentence names disconnect + reconnect.
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


### Review Findings

Five layers ran — Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the
Real-infra verifier — and none failed. Two findings are the owner's; the rest were patched in this
phase or deferred with a reason.

- [ ] [Review][Decision] **Production is broken right now: the code is deployed and its migration is not applied** — Commit `41ca519a` IS live (CI run `34369485655` green, Vercel READY at that SHA), but production's `private.site_credentials` has no `admin_key_id` (`42703`) and `public.credential_action` has no `credential_change` (`22P02`) — both reproduced against the hosted database inside rolled-back transactions, each with a passing minimal-pair control. `connectSite` calls `store()`, so **connecting any Ghost site fails on production**, not just the new screen. This is a collision between two approved rules, not a coding mistake: Epic 2's says a migration is applied by hand **in the Deploy phase**, DW-7 says CI publishes **on every push**. Every migration-bearing story will hit it. See `## Questions for the owner`, Question 1.
- [ ] [Review][Decision] **`keys_other_site` cannot fire for the hazard the frozen acceptance criterion names** — Executed against the real Ghosts, with a passing control: T1's own key → T1 `GET /admin/config/` = **200**; **T3's key → T1 = 401 "Unknown Admin API Key"**; T1's key → T3 = 401. Both `fetchWithKey` calls in `saveKeys` target `siteUrl: site.url` — this record's Ghost — so another install's key is refused by Ghost's own 401 (`ghost_unknown_key`) and the `GET /admin/site/` comparison is never reached. The guard as built fires only when *this* Ghost's self-reported url has drifted from the stored one, which is a different (and real) case. So the site IS refused and nothing IS written, but the AC's "the sentence names disconnect + reconnect" is false, and the harness's `keys-other-site` step will fail at Review. See `## Questions for the owner`, Question 2.

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

- [x] [Review][Defer] `admin_key_id` is never backfilled, so every site connected before this story draws no Admin mask and can never raise the moved-domains hint [apps/web/server/ghost-admin/index.ts] — deferred, needs a decision about reading Vault from a migration; DW-78
- [x] [Review][Defer] `ORPHAN_SNAPSHOT_DAYS` is a second home for the 90 days `20260907150000_account_deletion_window.sql` already computes, with nothing asserting they agree [apps/web/lib/connect-rule.ts] — deferred, pre-existing split across two languages; DW-79
- [x] [Review][Defer] "A rolled-back store leaves no row claiming it happened" is asserted in four places and induced nowhere [apps/web/server/ghost-admin/index.ts] — deferred, wants a fault-injection fixture in the RLS gate; DW-80
- [x] [Review][Defer] A crafted post carrying several credential fields at once can store the Admin key and then redirect saying "Nothing changed" [apps/web/app/(app)/app/(authed)/sites/actions.ts] — deferred, unreachable from the screen's three single-field forms; DW-81

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

**Why a key from another site is refused rather than warned.** FR-C8 removed edit-URL-in-place
because it would carry one site's record, snapshot and first-upload flag onto a different live Ghost
install — "restore the original theme" would then push one customer's archived theme over another's,
and the second site would never be snapshotted at all. Re-pasting a *different install's keys* into an
existing record reaches the same end state through the field FR-C8 left open. This is not a new
decision: it is the approved rule enforced on its one remaining path, and the comparison is made
against `site_settings.public_url` — Ghost's own answer, read at connect — rather than `sites.url`,
because on Ghost(Pro) the admin domain and the public domain differ by design.

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

Two came out of the code review on 2026-09-09. The first is urgent — your live site cannot connect a
Ghost site right now — and the second changes one sentence a customer might read.

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

**Ruled:** _(awaiting the owner)_

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

**Ruled:** _(awaiting the owner)_

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. You will need the Ghost site you connected
for Story 3.4 or 3.5, and Ghost Admin open in another tab.

1. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** sign in and click the **⋯**
   on your connected site's card. · **See:** the menu now has **Manage API keys** above the thin line,
   with **Disconnect** in red below it. (Re-check connection and Reconnect are Story 3.7's and are
   deliberately not there yet.)
2. **URL:** same · **Screen:** Sites · **Do:** click **Manage API keys**. · **See:** a window titled
   for your site, with three blocks — **Admin API key**, **Content API key**, **Staff Access Token**.
   The first two say they are there and show the beginning of each key followed by dots; the third
   says **Not added**. Each has one plain line saying what it does for you. Your site's address is
   shown as text you cannot edit, with a line saying a domain move means disconnecting and connecting
   again.
3. **URL:** same · **Screen:** the API keys window · **Do:** look for a way to see the rest of a key. ·
   **See:** there is none, and a line explains that Inflozo cannot read the secret part back either —
   only your Ghost can.
4. **URL:** same · **Screen:** the API keys window · **Do:** press **Test connection**. · **See:** the
   button's own words change while it works, then a short result: Inflozo reached your Ghost, what it
   can do today, and one line saying uploading `routes.yaml` needs the Staff Access Token you have not
   added.
5. **URL:** same · **Screen:** the API keys window · **Do:** in Ghost Admin go to **Settings →
   Integrations → Inflozo**, press **Regenerate** on the Admin API key, copy the new one, come back and
   paste it in, then save. **Dummy data:** the newly regenerated Admin API key. · **See:** it saves,
   and the beginning of the key shown on the screen is now the new one. Press **Test connection**
   again — it still passes.
6. **URL:** same · **Screen:** the API keys window · **Do:** paste something that is not a key at all —
   type `hello` into the Admin API key box — and save. · **See:** it is refused right under that box,
   with a sentence telling you what an Admin API key looks like. Nothing else changed.
7. **URL:** same · **Screen:** the API keys window · **Do:** *(only if you have a second Ghost site)*
   paste **that other site's** Admin API key here and save. · **See:** it is refused, and the message
   says these keys belong to a different Ghost site and that moving a site means disconnecting and
   connecting the new address.
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
    and 4. · **See:** the menu opens on the screen, the keys window fits, and the three blocks stack
    without anything running off the edge.

## Verification

Run all of these; every one must be green before the phase is committed. **R-82: the review and the
owner's test run on the real infrastructure**, never on mocks alone — record what each service
returned, by the key's variable name and never its value.

**Commands:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) -- expected exit 0: lint and
  types clean, every test passing, `busy.test.ts`, `app-routes.test.ts`, `server-wiring.test.ts` and
  `connect-rule.test.ts` among them. Report the count the run prints; never carry one forward.
- `pnpm build` -- expected exit 0, "Compiled successfully", and the route table showing the new
  `ƒ /app/sites/keys`.
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

- `keys-screen` — the ⋯ row present above the rule, the screen opening, three credential rows drawn
  with the app's own sentences, the URL as text with **no** input element in it, and no element
  anywhere on it offering to reveal a key.
- `keys-rotate` — a rotated Admin key pasted and saved on **T1**; read back through the pooler:
  `admin_key_rotated_at` moved, `admin_key_id` equals the new key's id half, `vault.secrets` holds one
  secret for that ref and it is **not** the old one, and exactly one new `credential_change` row is
  stamped with this screen's route.
- `keys-other-site` — **T3's** Admin key pasted into **T1's** screen: refused, nothing written, the
  sentence read off the app.
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
- `axe` at 1440 and 390 on the menu, the dialog and the route.

**Manual checks:**

- The migration applied to the hosted database **by hand in the Deploy phase** (the direct host is
  IPv6-only), and `select unnest(enum_range(null::public.credential_action))` on production showing
  the new value before the Deploy commit is written.
- Frame screenshots at 1440 / 834 / 390 (`--shots`) against S11d and B20, for the "matches the frame"
  criterion.
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

## Spec Change Log

Four departures from the Code Map, each recorded here rather than made silently. None changes an
acceptance criterion; three are the Code Map disagreeing with itself and one is a test that had to
be widened rather than weakened.

1. **The ⋯ row NAVIGATES; it does not open a dialog over the card.** The Code Map asked for both:
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
