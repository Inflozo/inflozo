---
title: 'Story 3.5 — My sites, their caps, and disconnecting one'
type: 'feature'
created: '2026-09-09'
status: 'in-progress'
baseline_commit: '34317cc5553dde2a2df16322c6ce0bceb784916c'
review_loop_iteration: 0
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
| Disconnected records and the cap | Free, one active + three disconnected | Not at the cap by three; the ghost slot is absent and the connect form is open | N/A |

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
  **the three auditors that must stay green and need no edit**: the new control is a `Submit` so
  `busy.test.ts` covers it the day it lands; the new component is inside `(authed)` so it needs no
  `PUBLIC`/`SELF_GUARDED` row; no new privileged importer.
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
  Vault secrets are **gone** with an audit row for each removal.
- Given a disconnected site, when I connect the same address again, then **the same site id** comes
  back carrying its `site_settings`, and the project's tally on the card returns to what it was.
- Given a Free account at one connected site, when I view `/sites`, then the grid's next cell is
  **S11c's ghost slot** with `siteCapSentence('free')` and `goProLabel()`, matching
  `S11 Sites.dc.html` S11c; given a Pro account at ten, then there is no ghost slot.
- Given JavaScript is disabled, when I use the ⋯ menu and confirm a disconnect, then both work.
- Given `remove()` cannot reach Vault, when I confirm, then the site stays connected and its card says
  why.

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

**Ruled:** _(awaiting the owner)_ — Dev shipped option 1's behaviour in the meantime: no audit row
for a removal, and nothing untrue written. The live harness's `disconnect` step proves the secret
is gone by reading the vault directly, which is the stronger evidence of the two.

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

**Commands:**

- `cd apps/web && pnpm check` -- expected: lint, types and `node --test` green, `busy.test.ts` and
  `app-routes.test.ts` included. *(Node 24 on PATH — the shell defaults to 22.)*
- `bash supabase/tests/run-rls-gate.sh` -- expected: green. No migration in this story, so this is the
  control that the comment-only edit changed nothing.
- `python3 tools/probe/run-verify-ghost-admin.py --check` -- expected: the plumbing steps pass and the
  new steps are listed; no browser, no key spent.
- `python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com` -- **R-82, the real
  one.** Expected: every step PASS against the deployed site, the real Supabase (PostgREST **and** the
  transaction pooler, read-only, for `vault.secrets`, `private.site_credentials` and
  `private.credential_audit`) and the real Ghost **T1 `ghost6.inflozo.com` (6.58.0)** and **T3
  `ghost5.inflozo.com` (5.130.6)**. **A result whose control did not pass is not a result** (standing
  rule 2): the run must include at least one negative control — the forged-site-id post that writes
  nothing, verified to write something once the ownership clause is commented out.
- `python3 tools/doc-audit.py --check` -- expected: green, twice.

**Manual checks:**

- The Vault secret for a disconnected site is **gone**, not orphaned — `select count(*) from
  vault.secrets` before and after, read through the pooler as the existing `secret-gone` step does.
- ~~`private.credential_audit` carries a row per removal, naming the route and the site, with no secret
  in `detail`.~~ **Not true of the code, and executed rather than assumed (Dev, 2026-09-09, standing
  rule 1).** `remove()` writes no audit row — `withStore` only wraps its errors — and
  `public.credential_action` is a fixed six-value enum with no member meaning "a credential was
  removed"; adding one is a migration, which this spec's Boundaries forbid in bold. **Question 3
  above is the owner's, and DW-76 is the ledger entry so it cannot be lost.** The removal is proved
  the stronger way instead: the `disconnect` step reads `vault.secrets` through the pooler and sees
  the secret gone.
