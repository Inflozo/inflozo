---
title: 'Story 3.5 — My sites, their caps, and disconnecting one'
type: 'feature'
created: '2026-09-09'
status: 'in-review'
baseline_commit: '34317cc5553dde2a2df16322c6ce0bceb784916c'
review_loop_iteration: 1
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
---

## In plain English

After this story a connected site can be **let go**: the ⋯ button at the top right of its card opens
a small menu with **Disconnect**, and confirming it takes the site off your Sites page and wipes the
two Ghost keys Inflozo was holding for it — while your projects, their names and their colours all
stay exactly where they were. Connect that same address again and Inflozo recognises the site it
already knew: the same record comes back, with everything it was carrying, rather than a stranger
with the same name. And on the Free plan, once your one site is connected, the empty second slot in
the grid stops being blank and says why — *"Free includes 1 site. Pro connects up to 10."*

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `sites.disconnected_at` has no writer. Story 3.2 built the whole *re-adoption* half of
FR-C6 — a disconnected record is revived in place, keeping its id, its `site_settings` and its staff
flag, and the cap counts only active rows — but nothing in the product can put a record into that
state, so the branch has never run in production and a customer cannot let a site go at all. The card
has no ⋯ (the frame draws one), and at the Free cap the grid's second cell is empty where S11c draws
the reason.

**Approach:** One server action, `disconnectSite`, is the missing writer: it clears the site's
credentials through the Admin chokepoint (`remove()`, audited) and only then stamps `disconnected_at`,
so a site can never read as disconnected while its Admin key is still decryptable. It deletes nothing
else — not the row, not the project, not the snapshot — which is what makes FR-C6's promise true by
construction rather than by a rule someone remembers. The card gets S11a's ⋯ menu (holding Disconnect
alone; 3.6's Manage keys and 3.7's Re-check/Reconnect are absent, not greyed) with a **simple confirm —
Cancel and Disconnect, no typed field** (the owner's ruling, Question 2) — and the grid gets S11c's ghost
slot at the Free cap.

## Boundaries & Constraints

**Always:**

- **Disconnect deletes exactly one thing: the credentials.** The `sites` row, every `projects` row,
  every `projects.linked_site_id` and every `site_snapshots` row survive untouched. This is FR-C6 and
  it is asserted, not assumed — a `select count(*)` on each, before and after, is a step of the live
  harness.
- **Credentials first, `disconnected_at` second, and a failed `remove()` fails the whole action.**
  `remove()` reaches Vault over the transaction pooler and throws on any store failure (`ghost-admin/index.ts:151`);
  a caught throw leaves the site connected and the page says so. The reverse order would leave a
  window in which the card reads "gone" and the Admin key still decrypts.
- **`credentials_present` stays the mirror it claims to be** (Story 3.2's rule): `remove()` flips
  `admin` and `staff`, and the same update that stamps `disconnected_at` nulls `content_key` and flips
  `content`. A disconnected record holds no credential of any kind.
- **The 90-day orphan clock is DERIVED from `sites.disconnected_at`, never written into
  `site_snapshots.purge_after`.** That column carries FR-A5's 14-day account-deletion clock and only
  that, which is what makes `restore_account()`'s `purge_after = null` correct as written and closes
  **DW-43 with no new SQL**. Record the separation as a comment beside both clocks.
- **`atSiteCap` and `siteCapSentence` from `lib/plan.ts` are the only source** of the number and the
  sentence. Nothing types "1" or "10" (standing rule 4).
- **DW-57 binds the card**: the ⋯ goes at the **top right of the header row** where the frame draws
  it; the pills line stays metadata; the state line stays the connection's and is not touched.
- **UX-DR3**: a control that could never act is **absent**, not greyed. The menu ships with Disconnect
  only.
- **R-98**: Disconnect is a `Submit` with a required `busy` label; the confirm's own route needs no
  new `loading.tsx` (it is a dialog on `/sites`, not a navigation), and `busy.test.ts` is the auditor.
- **Every control is a real `<form>`** posting a server action, so the whole flow works with
  JavaScript off — the confirm is a `<dialog>` whose submit is the form, as the project-delete confirm
  is.
- **The confirm opens with focus on Cancel** (EXPERIENCE.md § Destructive confirms), via
  `openOnCancel` and `data-cancel`.
- **The confirm asks for NO typed confirmation** (the owner's ruling, Question 2, 2026-09-09). It borrows the
  project-delete dialog's *visual* vocabulary — the 460px `<dialog>`, the centred disc, the display title, the
  13px body, equal-half buttons — and **not its typed name field**, because nothing here is destroyed and the
  friction must match the risk. Do not add one back.
- **The 90-day purging job is NOT in this story** (the owner's ruling, Question 1, 2026-09-09; **DW-75**). It
  is Story 7.20's, beside the snapshot it deletes. This story owes only the clock's origin: `disconnected_at`,
  written once, derived from thereafter.

**Ask First:**

- **The two questions under `## Questions for the owner`** — the home of the 90-day orphan purge job,
  and how much friction the disconnect confirm asks for. Do not default either.
- Any change to `ADMIN_WRITES`. This story adds no Ghost write: disconnecting changes nothing on the
  customer's Ghost, which is the sentence D4c already prints.

**Never:**

- **Never delete a project, clear a `linked_site_id`, or touch `site_snapshots` here.** A project
  linked to a disconnected site keeps its link, which is what lets re-adoption restore the tally with
  no second bookkeeping step.
- **Never build the "falls back to sample content" half** — that is the canvas reading a link, and no
  canvas exists until Epic 5. State the gap; store nothing extra for it (the values are already there).
- **Never edit the connect action's re-adoption branch** (`actions.ts:229-243`). It is built, it is
  correct, and this story's job is to make it reachable and to prove it.
- **No new migration.** Every column this story writes exists.
- **No sixth deletion path** (AD-32/AD-33's five are sanctioned). `remove()` is the credential path
  already in the set — and the snapshot orphan path is Story 7.20's, which **moves** a path rather than
  adding one (AD-33, amended 2026-09-09).
- **Never build the orphan purge cron here** — no `api/cron/purge-snapshots`, no `vercel.json` entry, no
  notice, no download offer. DW-75 is the record of why and of who builds it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Disconnect, happy path | A connected site owned by the caller, ⋯ → Disconnect → confirm | `remove()` clears the admin and staff refs; one update sets `disconnected_at = now()`, `content_key = null`, `credentials_present` all false; `/sites` re-renders without the card; projects, `linked_site_id` and snapshots unchanged | N/A |
| Disconnect, Vault unreachable | Pooler refuses or `SUPABASE_DB_POOLER_URL` missing | Nothing is stamped; the site stays connected; the page shows the store's own code as a Banner | `remove()` throws → catch → redirect to `/sites?disconnect=<siteId>` and the card says it could not be disconnected |
| Disconnect, someone else's site id | A real site id the caller does not own, forged into the form | Nothing written, nothing disclosed | The update runs under the caller's own session (RLS), matches no row → `notFound()` |
| Disconnect, already disconnected | The same id posted twice | Idempotent: the second update matches no active row and redirects to `/sites` | N/A |
| Re-adopt | Connect the same normalised URL again, after a disconnect | `actions.ts`'s existing branch updates in place: same `id`, `site_settings` and `staff` flag kept, `disconnected_at = null` | Existing |
| Re-adopt at the cap | Free, one active site, connect the disconnected one back | Refused with `at_cap` — a record coming back is a site becoming active (`actions.ts:178`) | Existing |
| A new URL, no retained record | Connect an address never connected | A **new** row, no snapshot association — by construction, since snapshots key on `site_id` | Existing |
| Free at the cap | Free plan, one active site | S11c's ghost slot is the grid's next cell: ✦, "Upgrade to connect more", `siteCapSentence('free')`, `goProLabel()`, linking to `/billing` | N/A |
| Pro at the cap | Pro plan, ten active sites | **No** ghost slot — there is nothing further to sell (the dashboard's own rule) | N/A |
| Disconnected records and the cap | Free, none connected + three let go | Not at the limit; the ghost slot is absent and the connect form is open | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- **the new export, `disconnectSite(formData)`.**
  A `'use server'` module may export only async functions, which is why it lives here beside
  `connectSite`, `useBrand` and `skipBrand` (the file's own header at `:70-77` records why). It
  `signedIn()`s, parses the id with `z.string().uuid()`, calls `remove({ siteId, kind, route })` for
  `'admin'` and `'staff'` (`server/ghost-admin/index.ts:151` — it nulls the ref, stamps
  `*_rotated_at` and flips `credentials_present`; the DW-44 trigger deletes the Vault secret behind
  it), then ONE update through the caller's **own** session (`supabaseServer()`), so RLS is the guard
  rather than an `.eq('user_id', …)` we remembered — the shape `useBrand` uses and
  `brand-ownership` executes. `revalidatePath(SITES)` and `revalidatePath(DASHBOARD)`, then
  `redirect(SITES_URL)`. The constants `ROUTE`, `SITES`, `DASHBOARD`, `SITES_URL`, `fail` and
  `logged` are all already in this file (`:60-90`); `RECHECK`/`BRAND_FAILED` at `:73-80` are the
  precedent for the failure redirect — a server action that must speak to the customer redirects to
  a screen that reads the reason out of the URL, the only shape that survives scripts off.
  **`disconnected_at` is server-asserted (AD-7, schema `:1040`), so the write is `supabaseAdmin()`'s
  — this file is already on that importer list in `server-wiring.test.ts`; add no name.** Read the
  row first under `supabaseServer()` to prove ownership, write with the admin client.
- `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` -- **new, client component**: S11a's ⋯ and the
  confirm behind it. `project-menu.tsx` is the pattern and it is close to a straight lift — the same
  `popover="auto"` menu at 196px (the frame's width, against S3c's 160), `lib/menu.ts`'s `openMenu`
  and `arrowKeys` for the placement and the arrow keys, the `item` class string, a `line` rule above
  the danger item, and the same `sheet`/`title`/`openOnCancel` dialog vocabulary from
  `components/kit/dialog.ts`. **Disconnect only** — the frame's other three items are 3.6's and 3.7's
  and are absent rather than greyed (UX-DR3). The broken-link glyph is the frame's own
  (`S11 Sites.dc.html:82`); add it to `components/kit/icons.tsx` beside `Trash` if it is not there.
  The confirm's submit is `Submit` from `components/kit/submit.tsx` with a required `busy` label
  (R-98).
- `apps/web/app/(app)/app/(authed)/sites/disconnect-confirm.tsx` -- **new, added at Dev**: the confirm
  itself — the disc, the title, the body and the `<form action={disconnectSite}>` — as ONE component,
  because it appears in two places. No `'use client'`: it is static markup plus a server action's
  dispatch, so the client menu renders it as a child and the server route renders it directly. Only
  `cancel` differs between them and it is a prop.
- `apps/web/app/(app)/app/(authed)/sites/disconnect/page.tsx` -- **new, added at Dev, and it is what
  makes the JavaScript-off acceptance criterion TRUE rather than caveated.** The ⋯ row is an
  `<a href="/sites/disconnect?site=…">` whose click JavaScript intercepts into the `<dialog>` — the
  shape `ConnectSiteButton` and `/sites/connect` already are (`shell.tsx:95`, and that route's own
  header says so in those words). Without JavaScript the click is a navigation and this page serves
  the same confirm, posting the same action. The site is read under the caller's own session, so RLS
  decides whether the page exists; a stranger's id or an already-disconnected one is `notFound()`.
  `busy.test.ts`'s `NO_SKELETON` carries its reason beside `sites/connect`'s: no soft navigation
  reaches either, so a route skeleton is never what the browser shows.
- `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- three changes and no more. `<SiteMenu>`
  in the header row's `margin-left:auto` slot (`:222-240`, the `flex items-start gap-3` block) —
  **DW-57: the ⋯ goes here and nothing joins the pills line or the state line.** The plan is read
  (`resolveEntitlement(user.id)`, already imported by the actions file; the dashboard at `:7` is the
  read-only pattern) and `atSiteCap(plan, sites.length)` decides S11c's ghost slot as the grid's next
  cell — the dashboard's own block at `:174-190` is the shape, one row down the plan table. A
  `?disconnect=<siteId>` search param reads like `?recheck=` already does (`:88-95`) and puts the
  failure Banner on the one card it belongs to.
- `apps/web/lib/connect-rule.ts` -- **the copy, and it lives here and nowhere else.** A `DISCONNECT`
  object beside `SITES_EMPTY` (`:180`) holding the menu item, the dialog title, its body sentence, the
  two button labels and the `busy` label, so `site-menu.tsx` and the harness read the app's own words
  rather than retyping them (`PREVIEW_COPY` and `BRAND_COPY` in `probe-rule.ts` are the precedent).
  A `disconnect_failed` entry joins `CONNECT_MESSAGES` (`:211`) — one table of codes to sentences.
- `apps/web/lib/plan.ts` -- **read-only evidence.** `atSiteCap` (`:78`), `includesSites` (`:81`),
  `siteCapSentence` (`:91`) and `goProLabel` (`:70`) are built and unit-tested (`plan.test.ts:95-116`).
  No change.
- `apps/web/server/ghost-admin/index.ts:151` -- **read-only evidence**: `remove()` exists, takes
  `{ siteId, kind, route }`, is transactional and already flips the mirror. This story is its first
  product caller, which is what closes DW-54's `staff-removed` gap for the *removal* half.
- `supabase/migrations/20260907150000_account_deletion_window.sql:73-93` -- **the `ponytail:` comment
  beside `restore_account()` is DW-43 and this story answers it: the 90-day clock is derived from
  `sites.disconnected_at`, so `purge_after` carries FR-A5's 14-day clock alone and `restore_account()`
  is already correct.** Amend the comment to say so — no function change, no migration.
- `supabase/migrations/20260904120000_complete_schema.sql:169` (`sites.disconnected_at`), `:174` (the
  partial index the list filter is the shape of), `:191-202` (`site_snapshots`, `unique (site_id)`) --
  **read-only evidence. No migration in this story.**
- `apps/web/app/(app)/app/(authed)/project-menu.tsx` -- **read-only evidence and the pattern to copy**:
  the menu, the confirm, `openOnCancel`'s focus-on-Cancel, and the note that a menu item's form must
  carry the server action's **own** dispatch or it stops working with JavaScript off (`:52-64`).
- `apps/web/app/(app)/app/(authed)/(dashboard)/page.tsx:174-190` -- **read-only evidence**: S3c's
  upgrade tile, which S11c's ghost slot mirrors — Free only, `min-h` matched to the cards, dashed
  `line-strong` border going marigold on hover.
- `apps/web/busy.test.ts` · `apps/web/app-routes.test.ts` · `apps/web/server-wiring.test.ts` --
  **the three auditors that must stay green**: the new component is inside `(authed)` so it needs no
  `PUBLIC`/`SELF_GUARDED` row, and there is no new privileged importer. **`busy.test.ts` gained one
  `NO_SKELETON` row** for the new route (recorded at Dev). **And it is NOT what guards the new
  control's `busy` label** — the review executed the control on 2026-09-09: delete `busy=` from the
  confirm's `Submit` and `busy.test.ts` stays green 5/5, because its walk matches the literal string
  `type="submit"`, which a Kit `<Submit>` never contains. The guard is real but it is **`tsc` inside
  `pnpm check`**, because `Submit`'s `busy` prop is REQUIRED (`components/kit/submit.tsx:80` says so
  in those words). Corrected here so the next story does not lean on the wrong tool.
- `apps/web/connect-rule.test.ts` -- the pure tests for the new copy and for `DISCONNECT`'s presence
  in `CONNECT_MESSAGES`; `:136-140` is the existing site-cap block.
- `tools/probe/run-verify-ghost-admin.py` -- the live harness gains this story's steps. **The
  docstring is the list and it is derived from the source, never retyped** (standing rule 4, and the
  correction 3.4 needed three times). The subjects: the ⋯ menu present and holding exactly one item;
  the confirm opening with focus on Cancel; Disconnect removing the card, the Vault secret **gone**
  (read read-only through the pooler, as `secret-gone` already does) and the audit row written; the
  project, its `linked_site_id` and a **fixture snapshot row patched in through the service role**
  all still present after it (3.4's `brand-logo` is the precedent for a fixture row); re-adopting the
  same URL returning the **same site id** with `site_settings` intact; a second account's site id
  forged into the form writing nothing; the Free ghost slot present at the cap and absent below it;
  both flows posting with JavaScript disabled; and `axe` at 1440 and 390 on the menu and the dialog.
- `_bmad-output/implementation-artifacts/deferred-work.md` -- **DW-75 is already written** (Create,
  2026-09-09, the owner's Question 1 ruling): the purge job, its notice and its download offer are Story
  7.20's, and the entry records what this story leaves ready for it. **DW-43 is closed by this story** with
  the derivation above; DW-57 is amended to record that the ⋯ landed where it drew it and that 3.6 and 3.7
  add **into** this menu rather than building a second one.
- `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:333` -- the Sites
  row's **Refusal** cell ("Free at 1 site: S11c's ghost slot") is now built; propagate, never localise.

- **What the code review of 2026-09-09 touched, beyond the rows above** — recorded here because the
  Code Map is this spec's statement of where the code lands, and four of these are files it marks
  read-only. `server/ghost-admin/index.ts` (`remove()` gains the caller's `user_id` and stops
  stamping a removal date for a kind that was never stored — the guard belongs beside the write, so
  every future caller inherits it); `lib/menu.ts` and `project-menu.tsx` (the shared `item` row moves
  out of the feature module); `components/kit/dialog.ts` (`sheetBox`, the half the dialog and the
  page share); `supabase/migrations/20260904120000_complete_schema.sql` (**comment only** — the line
  DW-43's own `location:` names still carried what DW-43 was closed on); `tools/story-board.py` and
  `_bmad/custom/bmad-build-auto.toml` (the ruling contract's missing half, and its missing
  propagation); `tools/probe/run-verify-ghost-admin.py` (`disconnect-route-answers`, the step the two
  patched branches needed). **And at Dev, three the rows above already record but the Code Map still
  called read-only:** `project-menu.tsx`, `busy.test.ts` (one `NO_SKELETON` row) and
  `deletion-rule.test.ts`. The ruling-contract change (`tools/story-board.py`,
  `docs/project-context.md`, `_bmad/custom/bmad-build.toml`, `bmad-code-review.toml`) rode along with
  this story because Question 3 is the third question the board rendered as `ruled` while it was
  still the owner's; it is process, not product, and it is named here so it is not invisible.

## Tasks & Acceptance

**Execution:**

- [x] `apps/web/lib/connect-rule.ts` -- add `DISCONNECT` beside `SITES_EMPTY` and `disconnect_failed`
      to `CONNECT_MESSAGES` -- one home for the words, so the screen and the harness cannot disagree.
- [x] `apps/web/connect-rule.test.ts` -- cover the new copy and assert `DISCONNECT` names no plan
      number of its own -- counts are derived (standing rule 4).
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- add `disconnectSite`: ownership read under
      the caller's session, `remove()` for `admin` then `staff`, then the one server-asserted update,
      revalidate, redirect -- the missing writer of `disconnected_at`, in the file the chokepoint's
      importer list already names.
- [x] `apps/web/components/kit/icons.tsx` -- add the broken-link glyph from `S11 Sites.dc.html:82` if
      absent -- one symbol for one action, as `Trash` is for delete.
      **Dev, 2026-09-09: NOT ABSENT.** `LinkOff` (`icons.tsx:130`) is already the frame's glyph —
      the same broken link with the diagonal stroke — so it is reused and the file is unchanged.
- [x] `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx` -- new: the ⋯ menu and the confirm, lifted
      from `project-menu.tsx`'s vocabulary, Disconnect its only item, `Submit` with a `busy` label --
      the frame's control, in the app's existing dialog language (R-74).
- [x] `apps/web/app/(app)/app/(authed)/sites/disconnect-confirm.tsx` · `.../sites/disconnect/page.tsx`
      · `apps/web/busy.test.ts` -- **added at Dev, for the JavaScript-off criterion.** The ⋯ row became
      an `<a href>` with a real destination and the confirm became one component rendered in both
      places, which is the shape `/sites/connect` already had; the new route is recorded in
      `NO_SKELETON` beside it, for its reason. **The first Dev pass shipped a `<button onClick>` and
      the criterion was not met; this is the fix, not an addition.**
- [x] `apps/web/app/(app)/app/(authed)/sites/(list)/page.tsx` -- mount `<SiteMenu>` in the header row,
      read the plan, draw S11c's ghost slot at the Free cap, read `?disconnect=` for the failure
      Banner -- DW-57's placement rule, and the Refusal cell EXPERIENCE.md already specifies.
- [x] `supabase/migrations/20260907150000_account_deletion_window.sql` -- amend the `ponytail:` comment
      beside `restore_account()` to record the two clocks and why no code changes -- DW-43, answered
      where the next reader meets it. **Comment only: no function change, no new migration.**
- [x] `tools/probe/run-verify-ghost-admin.py` -- add this story's steps and extend the docstring from
      the source -- R-82: the review runs on the real infrastructure or it is not a review.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close DW-43 and amend DW-57 -- propagate,
      never localise (standing rule 3). **DW-75 is already written and stays open** — it is Story 7.20's.

**Acceptance Criteria:**

- Given a connected site, when I open its ⋯ menu, then it holds **Disconnect** and nothing else, at
  the top right of the card's header row, and **the card and the menu match `S11 Sites.dc.html` S11a**
  in width, order, rule, danger colour and glyph (R-74).
- Given the confirm dialog, when it opens, then focus is on **Cancel**, Escape closes it without
  disconnecting, and **Disconnect is live immediately — there is no field to type into** (the owner's
  ruling, Question 2).
- Given I confirm, when the action runs, then the button reads its `busy` label and is `aria-disabled`
  + `aria-busy` until the page changes (R-98).
- Given a site with one linked project and a snapshot row, when I disconnect it, then the project row,
  its `linked_site_id`, its `style_pack` and the snapshot row are **all still there**, and the site's
  Vault secrets are **gone** ~~with an audit row for each removal~~. **The audit row is Story 3.6's, on
  the owner's ruling at Question 3 (option 1, 2026-09-09):** the log has no name for a removal and
  giving it one is a migration this spec forbids, so 3.6 — which removes keys too — makes that change
  once for both callers (DW-76). The removal is proved the stronger way instead: the harness reads
  `vault.secrets` through the pooler and sees the secret gone.
- Given a disconnected site, when I connect the same address again, then **the same site id** comes
  back carrying its `site_settings`, and the project's tally on the card returns to what it was.
- Given a Free account at one connected site, when I view `/sites`, then the grid's next cell is
  **S11c's ghost slot** with `siteCapSentence('free')` and `goProLabel()`, matching
  `S11 Sites.dc.html` S11c; given a Pro account at ten, then there is no ghost slot.
- Given JavaScript is disabled, when I use the ⋯ menu and confirm a disconnect, then both work.
- Given `remove()` cannot reach Vault, when I confirm, then the site stays connected and its card says
  why.

### Review Findings

**Code review, 2026-09-09** — five layers (Blind Hunter, Edge Case Hunter, Verification Gap,
Acceptance Auditor, Real-infra verifier). The Real-infra verifier re-executed the live harness
against production and **every claim in `## Verification` held**; the findings below are what the
other four found beside it. All patches are applied and the gates are green.

- [x] [Review][Patch] `/sites/disconnect` answered a FAILED read with `notFound()`, telling a customer his own site is gone — and threw the error away, so nothing was logged either. The rule `disconnectSite` states thirty lines from it, and `brand/page.tsx`'s three-way split, are now both honoured [`apps/web/app/(app)/app/(authed)/sites/disconnect/page.tsx`]
- [x] [Review][Patch] …and it answered an ALREADY-DISCONNECTED site — the caller's own record — with `notFound()`, where the action redirects to `/sites`. Reached by pressing Disconnect with scripts off and going Back [same file]
- [x] [Review][Patch] `remove()` was not scoped to the caller while its sibling `store()` always has been, so the credential-deletion path's only guard was the caller's preceding read. The `and user_id =` clause now lives beside the write [`apps/web/server/ghost-admin/index.ts`]
- [x] [Review][Patch] `remove()` stamped `*_rotated_at` for a kind that was NEVER stored, so Story 3.6's Manage keys would have rendered "Key removed 15 Aug" for a staff token that never existed — and two comments called it a no-op. `and <ref> is not null` makes both true [same file]
- [x] [Review][Patch] The stamp could restart FR-C6's derived 90-day clock: two presses past the read (two tabs, a scripts-off double post) re-stamped `disconnected_at`. `.is('disconnected_at', null)` writes it once, and matching no row is now the idempotent redirect, not a failure [`sites/actions.ts`]
- [x] [Review][Patch] Every disconnect was stamped with the CONNECT route (`ROUTE = 'sites/connect'`), which `withStore` carries into the failure envelope and DW-76's future audit row would have carried into `private.credential_audit` — the wrong route in the one record that exists to be trusted, planted before the row that reads it is written [`sites/actions.ts`]
- [x] [Review][Patch] `tools/story-board.py`'s ruling contract still signed itself from a date the ruling merely CITES: `**Ruled:** option 1 — Dev shipped it (2026-09-09).` rendered `ruled` and was flagged by nothing. Executed, not argued. `NAMES_HIM` is the missing half the comment always described, with a control — **0 of the 76 real question blocks change state** — and three new `demo()` cases [`tools/story-board.py`]
- [x] [Review][Patch] `supabase/migrations/20260904120000_complete_schema.sql` still carried the two-clock comment DW-43 was CLOSED on, and DW-43's own `location:` points a reader straight at it; only the architecture's `SCHEMA.sql` had been corrected. Comment only — the RLS gate is the control that it changes no database (`pg_dump -s` carries no `--` comment, and it reported no drift)
- [x] [Review][Patch] `_bmad/custom/bmad-build-auto.toml` never got the ruling contract the other two TOMLs and `project-context.md` gained this story — and the unattended loop is the one likeliest to write a question nobody reads (standing rule 7: a propagation list cannot audit itself)
- [x] [Review][Patch] `DISCONNECT.body` named a count in words — "this site's **two** Ghost keys" — in the one object whose header forbids one, and the test could only see digits. The sentence now says what is forgotten, not how many, and the test can see a spelled-out number (standing rule 4) [`apps/web/lib/connect-rule.ts`]
- [x] [Review][Patch] `item` was exported from `project-menu.tsx`, so `sites/site-menu.tsx` imported a `'use client'` feature module — and with it `projects/actions`, `TextInput` and `Banner` — for one string, against the argument its own comment makes. It lives in `lib/menu.ts`, which both menus already import [`apps/web/lib/menu.ts`]
- [x] [Review][Patch] `disconnect/page.tsx` hand-copied the sheet's tokens instead of importing them and had ALREADY diverged (`max-w-full` against `max-w-[calc(100vw-20px)]`) — the drift `components/kit/dialog.ts` exists to prevent, reintroduced by the story that centralised the confirm to prevent it. `sheetBox` is now the shared half [`apps/web/components/kit/dialog.ts`]
- [x] [Review][Patch] The ⋯ row's modifier guard omitted `altKey`, so the browser's save-link gesture was swallowed into opening the dialog [`sites/site-menu.tsx`]
- [x] [Review][Patch] The two patched route branches had no check behind them — the harness only ever navigated `/sites/disconnect` on a site that exists. New live step **`disconnect-route-answers`**: a second account's id, a malformed id, and the caller's own already-disconnected record, each asserted to land where it should [`tools/probe/run-verify-ghost-admin.py`]
- [x] [Review][Patch] The Code Map credited `busy.test.ts` with guarding the new control's `busy` label. Executed at review: delete the prop and `busy.test.ts` stays green — `tsc` is the guard, because `Submit`'s `busy` is required. Corrected above so the next story does not lean on the wrong tool
- [x] [Review][Patch] `## Verification` claimed every matrix row "ran and passed" in the same paragraph that records two ⛔ exceptions. Corrected above

- [x] [Review][Decision] **The last I/O matrix row cannot be true as written**, and the matrix is inside `<frozen-after-approval>` — so correcting it is the owner's to allow, not mine (standing rule 6). Dev executed a different state and flagged it rather than reinterpreting it silently. Asked as **Question 4**, and **he ruled option 1 (2026-09-09)**: the row now reads *"Free, none connected + three let go → not at the limit"*, which is the state the live `disconnect` step already executes. No code changed

- [x] [Review][Defer] A failed `remove('staff')` after a successful `remove('admin')` leaves the site reading **Connected with its Admin credential already gone**. It is recoverable (the mirror is honest, `credentials_present.admin` is false, and pressing again completes), it is a state the epic already calls first-class, and it is **unreachable today** — nothing stores a staff token until Epic 7, and both calls cross the same pooler connection, so the first fails whenever the second would. Recorded rather than designed around: **DW-77**
- [x] [Review][Defer] The AC names Escape-closes-the-confirm and no step asserts it — native `<dialog>` behaviour, and the only Escape in the harness is on the popover menu. Deferred: proving a platform guarantee costs a 35-minute live run, and the owner's manual test step 2 exercises it by hand

## Design Notes

**Why the 90-day clock is derived and not stamped.** `site_snapshots.purge_after` was written for
FR-A5's 14-day account-deletion window and `request_account_deletion()` sets it with
`least(coalesce(purge_after, deadline), deadline)` — the comment beside it says the `least` exists so
a deletion never *lengthens* an existing 90-day orphan clock. If this story also wrote the 90-day
value into that column, `restore_account()`'s `purge_after = null` would silently cancel it, which is
exactly DW-43. Two clocks in one column need either a second column or a way to tell them apart —
and there already is one: `sites.disconnected_at`. Deriving the orphan deadline from it makes
`purge_after` mean one thing, leaves both existing functions correct as written, and closes DW-43
with a comment instead of a migration.

**Why the disconnect action reads under the user's session and writes under the service role.** The
read proves ownership through RLS rather than through an `.eq('user_id', …)` a future edit could
drop — `useBrand`'s shape, executed by the `brand-ownership` step. The write must be
`supabaseAdmin()` because `authenticated` may UPDATE only `(title, favicon_url, updated_at)` on
`sites` (schema `:1040`); `disconnected_at` and `content_key` are server-asserted. Both clients are
already imported by this file.

**What "affected projects fall back to sample content" means today.** Nothing. No canvas exists until
Epic 5, so no code reads `linked_site_id` for content and there is nothing to fall back *from*. What
this story owes that promise is the thing it can actually guarantee — that the project and its link
survive — so the fallback, when Epic 5 builds it, is a render-time branch over a link whose site is
disconnected, not a repair of data this story destroyed. Stated here rather than silently skipped, the
way Story 2.5 stated its Dodo gap.

## Questions for the owner

### Question 1 — one part of this story deletes something that does not exist yet. Where should it go?

When someone deploys with Inflozo for the first time, Inflozo will quietly archive a copy of the
theme their site was wearing before — the "safety net", so they can always put things back. The plan
says that if a site stays disconnected for **90 days**, that archived copy is deleted, after warning
them and offering them a download.

**The catch:** nothing takes that archive yet. Taking it needs the deploy machinery, which is Epic 7,
several months of work away. So if I build the deleting-and-warning job now, it is a job that hunts
through an empty cupboard every night, and the download link it offers points at a file whose shape
Epic 7 has not decided yet — so Epic 7 would likely rewrite it.

**An example.** Imagine a "shred old paperwork after 90 days" rule for an office that has not yet
opened and has no filing cabinet. You can hire the shredding company today, but they will turn up to
an empty room every week for six months, and when the cabinets finally arrive nobody knows if the
shredder fits.

**What is *not* in question:** the 90-day countdown itself starts the moment you disconnect a site,
and this story builds that. Whichever option you pick, the clock is running correctly from day one —
nothing is lost, and nothing needs re-doing later.

1. **Build the deleting-and-warning job in Epic 7, next to the thing it deletes** — write it down now
   as a tracked item so it cannot be forgotten, and build it in the same story that first takes the
   archive, when its shape is known. **(RECOMMENDED)** — the archive and the rule that removes it are
   designed together, the warning email can name a real file, and nothing runs nightly over an empty
   table for months.
2. **Build the whole job now, in this story.** It is written and tested against a fake archive I put
   in place by hand. It runs every night from now until Epic 7 and finds nothing, and there is a real
   chance Epic 7 changes it.
3. **Build only the deleting half now and the warning-and-download half in Epic 7.** Half now, half
   later — I would not pick this: it splits one rule across two stories months apart, which is how
   the "purge proceeds whether or not the offer was taken" guarantee gets lost.

**Ruled: option 1 (the owner, 2026-09-09).** Build the deleting-and-warning job in Epic 7, next to the thing
it deletes, and write it down now so it cannot be forgotten. Landed as **DW-75**, owned by **Story 7.20**, and
propagated the same day: `epics.md` (3.5's AC now points there, 7.20's AC now carries the purge),
`ARCHITECTURE-SPINE.md` AD-33 · AD-29 · AD-32 (the cron's owning epic — still five deletion paths, not six),
`VERIFY-AT-BUILD.md` item 38, `apps/web/lib/storage-drain.ts`'s header and `epic-3-context.md`. This story
still writes `sites.disconnected_at` and derives the 90-day deadline from it, so the clock runs correctly from
day one.

### Question 2 — how hard should it be to disconnect a site?

Disconnecting is **not** like deleting. Nothing of yours is destroyed: your projects stay, their
names and colours stay, your archived theme stays, and your Ghost site itself is not touched at all.
The one real cost is that Inflozo forgets the two keys, so to come back you have to paste them again —
about a minute in Ghost Admin.

**An example of the difference.** Deleting a project asks you to **type its name** before the button
turns on, because that project is gone for good. Disconnecting a site is closer to signing out of an
app: you can always sign back in.

1. **A simple confirm: a small window that says what happens, with Cancel and Disconnect. No typing.**
   **(RECOMMENDED)** — the friction should match the risk, and typing a name to undo something that
   undoes itself teaches people that our scary dialogs are not worth reading.
2. **Make it type the site's address first**, exactly like deleting a project. Safest against a
   mis-click, but it says "this is permanent" about something that is not.
3. **No confirm at all** — the menu item disconnects immediately, with an "Undo" for a few seconds.
   Fewest clicks, but a mis-click in a ⋯ menu is easy and the undo is easy to miss.

**Ruled: option 1 (the owner, 2026-09-09).** A simple confirm — a small window saying what happens, with
Cancel and Disconnect, **no typing**. It takes the project-delete dialog's look and not its typed field; the
Boundaries and the acceptance criteria above say so, so a later review cannot re-add one.

### Question 3 — the log entry this story was told to write does not have a name to write itself under

**Raised at Dev, 2026-09-09, and it is a small one — but it is the difference between an acceptance
criterion being met and being quietly skipped.**

Inflozo keeps a private tamper-log of everything that touches a customer's Ghost keys — every call
to their Ghost, every time a key is unlocked. It exists so that if a key were ever misused we could
see it, and it is the only safeguard in this area that *detects* rather than prevents.

This story's spec says disconnecting should add a line to that log: *"the site's Vault secrets are
gone with an audit row for each removal."* Building it, I checked the code that removes a key
(`remove()` in `server/ghost-admin/index.ts`) and found it writes **no** line today — and that the
log's list of allowed entry types is a fixed list in the database with six names on it: *key
unlocked*, *read from Ghost*, *wrote to Ghost*, and three unrelated ones. **None of them means "a
key was removed."**

**An example.** It is like a visitors' book with pre-printed tick-boxes for *Arrived*, *Read a
file* and *Signed a form*, and someone asking you to record a *Departure*. You either add a new
tick-box to the book — which here means a database change, and this story's spec says in bold that
it makes none — or you tick the nearest wrong box, which makes the book lie.

**What is *not* in question:** the removal itself works and is proved on the real site. The key is
deleted from the locked store, the deletion is verified through a direct database read, and the
record, the projects and the archived theme are all verified untouched. The only thing missing is
the *line in the log book*.

1. **Leave it out of this story and add the removal entry when the log next needs changing —
   Story 3.6, which is the other story that removes keys.** **(RECOMMENDED)** — 3.6 ("Manage keys")
   adds a *Remove token* button, so it removes keys too and it needs the very same new entry type.
   One database change, made once, covering both. Nothing is lost meanwhile: disconnecting is
   already recorded in the site's own row (the date it was disconnected) and the key is provably
   gone.
2. **Add the new entry type now, in this story.** It is a small database change, but this story's
   spec says in bold that it makes none, and a database change has to be applied to the live
   database by hand at Deploy — so it is the one kind of edit that cannot simply be undone.
3. **Write the line under an existing name — "a key was unlocked".** No database change, and I
   would not pick it: it would put a *false* entry in the one record that exists to be trusted, and
   it would break two live checks that count those entries.

**Ruled: option 1 (owner, 2026-09-09).** Leave it out of this story and add the removal entry when the
log next needs changing — **Story 3.6**, which is the other story that removes keys. Dev had already
shipped this option's behaviour, so **nothing in this story changes**: no audit row for a removal, and
nothing untrue written. The live harness's `disconnect` step proves the secret is gone by reading the
vault directly, which is the stronger evidence of the two. Landed as **DW-76**, owned by Story 3.6, and
propagated the same day: `epics.md` 3.6 carries the entry as an acceptance criterion, and
`disconnectSite`'s header, the harness docstring and the `audit` step all name DW-76 as the reason the
counts below are unchanged by a disconnect.

### Question 4 — one line in this story's own test table cannot be true, and the table is marked as yours

**Raised at the code review, 2026-09-09.** Nothing is broken and nothing needs rebuilding — this is
a wording fix I am not allowed to make on my own, because that table is marked "human-owned: do not
change unless the owner renegotiates".

The table lists every situation this story had to handle, so each one could be tested. Its last line
reads: *"Free, one active + three disconnected → not at the cap by three."*

On Free you get **1 site**. So somebody with **1 connected site** is at their limit — the line says
they are "not at the limit by three", which cannot be right. What the line is plainly reaching for
is the rule that **sites you have let go do not count against your limit**, and that rule is built,
and it was proved on the real site.

**An example.** A cinema with one screen. The line as written says "one film showing, three films
finished last month — so there are three free screens." There is one screen and it is in use. What
was meant is "the three that finished do not take up a screen", which is true and is what the code
does.

**What is *not* in question:** the behaviour. Disconnected sites are already ignored when your limit
is counted, the live run proved it, and no code changes whichever option you pick. This is only
about what the line should *say*, so the next person to read it is not misled.

1. **Correct the line to say what it meant** — *"Free, none connected + three let go → not at the
   limit; the ghost slot is absent and the connect form is open."* **(RECOMMENDED)** — it is the
   state the live run actually tested, it is true, and it is the rule the line was written to
   capture.
2. **Leave the line exactly as it is** and add a note underneath saying it cannot happen and which
   state was tested instead. Nothing in your approved table changes, but the table keeps a line that
   is wrong, and the next reader meets the wrong line before the note.
3. **Say it differently** — tell me the words and I will use yours.

**Ruled: option 1 (the owner, 2026-09-09).** Correct the line to say what it meant — *"Free, none
connected + three let go → not at the limit; the ghost slot is absent and the connect form is open."*
The row in the I/O & Edge-Case Matrix now reads that, inside the frozen block and by his
renegotiation of it, which is the only thing that opens one. It is the state the live `disconnect`
step already executes, so the row and the evidence now describe the same thing and no code changed.
Propagated the same day: the matrix row itself, the `disconnect` step's comment in
`tools/probe/run-verify-ghost-admin.py` (which had flagged the contradiction rather than
reinterpreting it), and the `## Verification` sentence that pointed here.

## Owner's manual test

Follow these on the real site after Deploy fills the URLs. You will need a Ghost site to connect —
use the same test site you used for Story 3.4.

1. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** sign in and look at the card
   for your connected site. · **See:** a **⋯** at the **top right** of the card, level with the site's
   name. Everything else on the card is exactly as you left it after Story 3.4.
2. **URL:** same · **Screen:** Sites · **Do:** click the **⋯**. · **See:** a small white menu opens
   under it with a thin line and one red item, **Disconnect**. (Manage keys and Re-check are Stories
   3.6 and 3.7 — they are deliberately not there yet rather than greyed out.) Press **Escape**: the
   menu closes and the **⋯** is focused again.
3. **URL:** same · **Screen:** Sites · **Do:** open the menu again and click **Disconnect**. · **See:**
   a window in the middle of the screen naming your site and saying what happens, with **Cancel** and
   **Disconnect**. **Cancel** is the button already outlined when it opens, and there is **nothing to type** —
   Disconnect works on the first click.
4. **URL:** same · **Screen:** the confirm window · **Do:** press **Cancel**. · **See:** the window
   closes and your site is still there, unchanged.
5. **URL:** same · **Screen:** the confirm window · **Do:** open it again and press **Disconnect**. ·
   **See:** the button's own words change while it works (something like *Disconnecting…*), then the
   page comes back **without that card**. If it was your only site you get the "One handshake and
   you're in." screen.
6. **URL:** `https://app.inflozo.com/` · **Screen:** Dashboard · **Do:** look at your projects. ·
   **See:** **every project is still there**, with the same name and the same colour it had. Nothing
   was deleted.
7. **URL:** `https://app.inflozo.com/sites` · **Screen:** Sites · **Do:** press **Connect site** and
   connect **the same site again** — the same address, and the same two keys from Ghost. **Dummy
   data:** the same URL and the Admin + Content keys from the Custom Integration you already made. ·
   **See:** it connects, and the card shows the site's real title and version straight away. Its
   "**n** projects" count is the number it had before you disconnected — Inflozo recognised the site
   it already knew rather than starting fresh.
8. **URL:** same · **Screen:** Sites · **Do:** *(only if your account is on Free with one site
   connected)* look at the space next to your one card. · **See:** a dashed box with a **✦**,
   **"Upgrade to connect more"**, the line **"Free includes 1 site. Pro connects up to 10."** and a
   yellow **Go Pro — $15/mo** pill. Clicking it goes to Billing.
9. **URL:** same, on your **phone** · **Screen:** Sites · **Do:** repeat steps 1–3. · **See:** the ⋯
   menu opens on the screen (not off the bottom edge) and the confirm window fits the screen.

## Verification

**R-82: the real infrastructure, and what each returned.** Every command below was RUN, not
planned; the numbers are what came back. No key was printed and every one is recorded by its
variable name.

**Commands, and their answers:**

- `pnpm check` (repo root, Node 24 on PATH — the shell defaults to 22) -- **exit 0**: lint and types
  clean, **237 tests, 237 pass, 0 fail**, `busy.test.ts` and `app-routes.test.ts` among them.
  *(`apps/web` has no `check` script of its own; the root's runs the whole workspace.)*
- `pnpm build` -- **exit 0**, "Compiled successfully", and the route table shows the new
  `ƒ /app/sites/disconnect`.
- `bash supabase/tests/run-rls-gate.sh` -- **exit 0**, ending on the four DW-44 vault assertions. It
  is the control that this story's SQL edits are comment-only: it refuses to run on drifted copies
  and it diffs the database the migrations produce against `SCHEMA.sql`, and it did neither.
- `python3 tools/doc-audit.py --check`, twice -- **PASS (0 warnings)**. The first call regenerated,
  as its sub-tools do; the second was clean.
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- **all steps passed**, and it printed
  this story's copy read out of the app itself: `disconnect_menu` "Disconnect", `disconnect_title`
  "Disconnect %s?", `disconnect_body`, `disconnect_cancel` "Cancel", `disconnect_busy`
  "Disconnecting…", `disconnect_failed`, `go_pro` "Go Pro — $15/mo", `at_cap` "Free includes 1 site.
  Pro connects up to 10." Nothing in the harness types a plan number.
- `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` -- **80 steps, all
  passed, RESULT: all steps passed**, against the **production** deployment of `81bc46b8` (CI green;
  DW-7 means GitHub Actions publishes, so the deployment is the commit).

**The real services it hit, and what they returned:**

| Service | Keys, by variable name | What it returned |
|---|---|---|
| **Vercel** (production `app.inflozo.com`) | — the deployed app itself | every surface this story adds, served: S11a's ⋯, its confirm, S11c's ghost slot, and the new `/sites/disconnect` route |
| **Supabase**, PostgREST | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY` | the `sites`, `projects` and `site_snapshots` rows read before and after each press; the fixture user created and deleted, users after: 7 |
| **Supabase**, transaction pooler (read-only) | `SUPABASE_DB_POOLER_URL` | `vault.secrets` behind T1's ref went **1 → 0** on the disconnect; `private.credential_audit` **25 rows**, every one stamped `sites/connect`, 0 that look like they hold a key; `secret-gone` after the cascade: `[0,0]` |
| **Ghost T1** `ghost6.inflozo.com` (6.58.0) | `GHOST6_ADMIN_API_KEY`, `GHOST6_CONTENT_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` | `GET /admin/config/` and `/admin/site/` answered the connect and the re-adoption; `GET /admin/users/{id}` → **HTTP 404** after the cascade |
| **Ghost T3** `ghost5.inflozo.com` (5.130.6) | `GHOST5_ADMIN_API_KEY`, `GHOST5_CONTENT_API_KEY`, `GHOST5_STAFF_ACCESS_TOKEN` | the Pro connect, and the two refusals — `at-cap` and `re-adopt-at-cap` — both **before** any Ghost call, so no key was spent on either |
| **Resend · Dodo** | — | **not hit.** This story sends no email and touches no billing; `/billing` is a link the ghost slot points at, not a call. |

**What the disconnect itself returned, live:** `disconnected_at` stamped
`"2026-09-09T11:44:35.65+00:00"`, `content_key` null, `credentials_present`
`{"admin":false,"staff":false,"content":false}` — every one false — the vault ref nulled and its
secret gone (1 → 0), while the project, its `style_pack`, its `linked_site_id` and the fixture
`site_snapshots` row came back byte-identical, that row's `purge_after` still null.

**The negative controls, and they are controls because they were watched LANDING** (standing rule 2,
which the harness's own comments state as "a byte-identical re-read proves nothing about a press that
never arrived"):

- `disconnect-forged` — a second account's site id forged into the confirm and posted from the
  fixture's session: the press was seen to land on the **not-found page**, the stranger's row is
  byte-identical, and the caller's own site was not disconnected either.
- `disconnect-again` — the same id posted twice: the second press landed back on `/sites` **with the
  cards still drawn** (a redirect, not the not-found page a stranger's id gets) and re-stamped
  nothing.
- `re-adopt-at-cap` — a retained record for T3's address, connected back on Free at one active site:
  refused with `siteCapSentence('free')` and **not revived**. This is a branch ORDER nothing could
  reach until this story built the writer.
- `disconnect-failed` — `?disconnect=<id>` puts the sentence on **that** card and no other, and the
  site stays connected. ⛔ The throw itself is not induced: breaking the pooler breaks every other
  step in the run, so the code path is read and the surface is executed.

**Every I/O & Edge-Case Matrix row has a step that ran, and all but the two marked ⛔ passed
outright** (the sentence read "every row has a step that ran and passed" until the review of
2026-09-09, which is not true of a paragraph that then records two ⛔ exceptions of its own. The last
row was a third: its executed state differed from the row as written, because the row could not be
true as written — **the owner's Question 4 ruling corrected the row**, and it now describes exactly
what the `disconnect` step executes): happy path `disconnect` ·
Vault unreachable `disconnect-failed` (surface, with the ⛔ above) · a stranger's id
`disconnect-forged` · already disconnected `disconnect-again` · re-adopt `re-adopt` · re-adopt at the
cap `re-adopt-at-cap` · a new URL `connect` and `pro-connect-t3` · Free at the cap `ghost-slot` · Pro
at the cap `ghost-slot-pro` (⛔ Pro AT ten sites is unexecuted — it needs ten connected Ghost sites —
and is recorded rather than claimed) · disconnected records and the cap, inside `disconnect`.

**The one manual check that turned out not to be true of the code**, executed rather than assumed
(standing rule 1): ~~`private.credential_audit` carries a row per removal~~. `remove()` writes **no**
audit row — `withStore` only wraps its errors — and `public.credential_action` is a fixed six-value
enum with no member meaning "a credential was removed"; adding one is a migration, which this spec's
Boundaries forbid in bold. **The owner ruled it option 1 (2026-09-09): the entry is Story 3.6's**, which
removes keys too, and DW-76 is the ledger entry so it cannot be lost. The removal is proved the stronger way instead: `disconnect` reads `vault.secrets`
through the pooler and sees the secret gone (1 → 0). The `audit` step's 25 rows are unchanged by the
disconnect, which is itself the evidence that nothing untrue was written.

**Two things the live runs found that reading could not, both fixed:**

1. **`notices-js-off` went red the first live run.** Its `article :not(dialog) button[type="submit"]`
   reads "a button under SOME element that is not a dialog", and the ⋯ confirm's Submit has a plain
   `<div>` for a parent, so it matched and the count disagreed with the form count. Excluding by
   ANCESTOR — `button[type="submit"]:not(dialog button)`, the idiom the form selector already used —
   is the fix. A CSS `:not()` reading that no amount of staring at the app would have shown.
2. **The ⋯ row was a `<button onClick>`, so the confirm could not be reached with JavaScript off** —
   the acceptance criterion was not met and had been caveated with a `ponytail:` ceiling instead.
   Fixed in the shape this codebase already had for its other dialog: the row is now an `<a href>`
   with a real destination, and `disconnect-js-off` asserts BOTH halves off served markup — the
   href (`/sites/disconnect?site=…`) and that route's own wired form.

**Flake, recorded rather than hidden.** Nine live runs were made. Runs 6, 7 and 8 each went red at a
**different** step — `brand-ownership`, `disconnect`, and a bare 60s `page.goto` timeout — and each of
those steps passed in the other runs; runs 3 and 9 were fully green, before and after the app change.
DNS and `https://app.inflozo.com` were checked healthy between them (`dig @1.1.1.1` and a 307 in
0.4s), so this reads as the long browser session against live infrastructure, not a regression —
`brand-ownership`'s own comment already records it failing "twice in five runs" before this story
existed. The `disconnect` step now **names its own failure** (the URL and the page it ended on) rather
than throwing a bare locator timeout, so the next occurrence says whether the press was refused or
never arrived.

**Not run here, and they belong to the phases that own them:** the owner's manual test above (R-80,
his, on the deployed site) and the 1440/834/390 frame screenshots (`--shots`).

**Deploy, 2026-09-09.** No schema change in this story — the SQL edit is comment-only, and
`run-rls-gate.sh` above is the control that it changed no database. App code only: the push of
`a211f24b473cb64dfea355bfb68300371d1eb1be` (this story's last Review commit) already built the
production Vercel project per DW-7 — CI's `check` and `rls` gated `deploy` — with no separate action
here. Confirmed against the Vercel API (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT`): deployment
`dpl_9Xyja2eRTqxD7ykYjfpodih43UxS` reads `state: READY`, `target: production`, `meta.githubCommitSha`
matching HEAD exactly, aliased to `app.inflozo.com` and `inflozo.com`. This is the same deployment the
`## Verification` section above already ran the 80-step live harness against.

**Deployment:** `https://app.inflozo.com` — `dpl_9Xyja2eRTqxD7ykYjfpodih43UxS` (commit `a211f24b`)
