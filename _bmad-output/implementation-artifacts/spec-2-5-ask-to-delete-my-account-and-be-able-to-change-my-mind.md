---
title: 'Story 2.5 — Ask to delete my account, and be able to change my mind'
type: 'feature'
created: '2026-09-07'
status: 'in-review'
baseline_commit: 'c6c35b8f0b049bbf3e5b9d1bb6b4aa8bb1790d18'
review_loop_iteration: 1
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

After this story you can delete your Inflozo account yourself: a **Danger zone** card at the bottom of
the Account page has a **Delete account** button, and the window it opens makes you type the words
*delete my account* before the red button will work, because this is the one thing in the product
that removes everything. Confirming does not delete anything on the spot — it starts a **14-day
countdown**, sends you one email that says the exact date, and from then on signing in shows only a
page with that date, a **Restore account** button, and — if Inflozo ever archived your site's original
theme — a **Download** link for it. Press Restore any time before the date and everything is exactly as
you left it; after the date, Story 2.6's job removes it all and nothing can bring it back.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-A5 promises a way to leave — a typed confirm, a 14-day soft-delete window, a
confirmation email naming the deadline, the pre-Inflozo snapshots offered as downloads throughout the
window, and a one-click **Restore account** on sign-in — and the product has none of it. `profiles`
carries `deleted_at` and `purge_after` (schema `:120-125`) and nothing writes them; `/account`'s
Danger zone is absent by design ("2.5's", `account/page.tsx:15-16`); and the two columns are not
client-writable at all (`:1223-1224` grants `display_name, autosave_enabled, updated_at` and nothing
else), so no server action can set them through the user's own session.

**Approach:** Two `security definer` functions own the window — `request_account_deletion()` stamps
`deleted_at`, `purge_after = deleted_at + 14 days` and every snapshot's `purge_after` in one
transaction and returns the deadline; `restore_account()` clears them while the deadline is ahead and
answers `false` once it has passed — so the 14 days are a database fact, the user's session calls them
through `.rpc()`, and no secret key touches a user row. On S12a the Danger zone card and S12c's typed
confirm call the first and land on a new `/restore` page, which is also where the shell's guard sends
any pending account on every visit; that page states the deadline, lists each snapshot with its site
and a Download that a server route answers with a short-lived Storage signed URL (AD-13), and carries
the one-click Restore. One branded email goes out at request time through Resend's HTTP API, and no
other email ever follows (FR-A5, FR-P2). The purge itself is Story 2.6's cron; this story stops at the
deadline.

## Boundaries & Constraints

**Always:**
- **The frames are `S12 Billing.dc.html` S12a's Danger zone (`:104-111`) and S12c (`:150-171`)**, read
  and never rounded. The card: surface, **`danger-line` border** (#F5C6C9), radius 16, 20/24 padding,
  the label **DANGER ZONE** 13px/600 uppercase 0.04em in **`danger-text-hover`** (#C63A3F, `:106`), one
  row — title "Delete account" 13px/500 over the caption "Removes every project, version and asset.
  Your live Ghost sites stay up — we never touch them." 12px ink-soft — and the frame's own button at
  the row's end (`:109`): **34px**, `0 15px`, surface, `danger-line` border, `danger-text` label
  13px/600, radius 12, `danger-tint` on hover. Drawn from the tokens as the Email card's 30px button is
  (`email-card.tsx`), because the Kit's heights are 44/36/32 and its `danger-outline` border is
  `danger`, not `danger-line` — the same vocabulary, a size the Kit does not carry (R-74). It sits
  under the Sessions card, unconditionally.
- **The confirm is S12c through `components/kit/dialog.ts`**, in the shape `project-menu.tsx:305-405`
  already built from the same frame: the 38px `danger-tint` disc with the 17px `AlertTriangle` in
  `danger` beside the title block (`:157`, left-aligned as S12c draws it — the centred layout is the
  project delete's own, ruled for it alone); display title **Delete your account?**; the body sentence
  13px ink-soft; the label "Type `delete my account` to confirm" with the mono chip
  (`project-menu.tsx:352-354`'s classes); the 40px mono field with the `danger` border and `danger`
  caret (`:363-364`'s classes, verbatim); the footer right-aligned, Cancel (secondary 36, `data-cancel`)
  then **Delete account** (danger 36) at **`opacity-45` with `aria-disabled`** until the typed text
  matches — the frame's `.45` (`:167`) — and "Deleting…" while it runs. Opens with focus on Cancel
  (`openOnCancel`, UX-DR14), closes on Escape, Cancel and the backdrop with nothing sent.
- **The phrase is the frame's — `delete my account`, matched exactly after trimming**
  (`lib/projects.ts:131`'s `matchesName`, the one typed-confirm rule). The client guards the submit and
  greys the button; **the server re-checks and never trusts the client** (`project-menu.tsx:336`).
- **The body sentence carries the window, because the PRD decides behaviour** (R-74's scope): the
  frame's "will be permanently deleted … This cannot be undone." becomes, with counts DERIVED from the
  account, "All 6 projects, their full version history and 48 assets will be permanently deleted in
  14 days. Your live Ghost sites stay online. Until then, signing in restores everything — after that,
  it cannot be undone." One project reads "Your 1 project, its full version history…"; nothing at all
  reads "Everything in your account will be permanently deleted in 14 days." The **14 is one constant**,
  `DELETION_WINDOW_DAYS`, and `deletion-rule.test.ts` reads the migration's `interval '14 days'` back and
  asserts they agree — a number written twice is a number that goes stale once.
- **The window is a locked door, not a banner.** FR-A5 offers Restore *on signing in*; an account that
  is still fully usable has not been deleted in any sense the user meant, and work done inside the
  window would be purged in silence. So `(authed)/layout.tsx`'s existing profiles read (`:20-27`)
  widens by `deleted_at` and a pending account is sent to `/restore` from every page under the shell;
  `/restore` lives OUTSIDE `(authed)`, guards itself with `signedIn()`, and draws S1a's card without the
  shell (`sign-in-form.tsx:146`'s card, `sign-in/page.tsx:45-58`'s `main`, the `Lockup`), because the
  nearest drawn surface for a signed-in person who is not in the app is the sign-in card.
- **`/restore` before the deadline:** title "Your account is set to be deleted"; "Everything will be
  permanently deleted on **Sep 21, 2026**. Until then, you can change your mind."; when the account has
  snapshots, a **Your original themes** block — one row per `site_snapshots` row: the theme name in mono
  (or "Original theme" when null), the site's title or URL, "captured Aug 2, 2026" (`addedLabel`'s
  format, `lib/passkey-name.ts:89-100`), and a **Download** drawn with `buttonClasses('secondary', 32)`
  as a link to `/snapshots/{id}/download` — under the caption "The theme each site had before Inflozo.
  After Sep 21, 2026 they are gone too."; then **Restore account** (primary 44, full width — S1a's one
  action) reading "Restoring…" while it runs, and a **Sign out** (secondary 36) that posts
  `sign-in/actions.ts`'s `signOut`. **After the deadline:** "Your account is being deleted" · "The 14
  days ended on Sep 21, 2026 and everything is being removed. This can no longer be undone." · no
  snapshots, no Restore, Sign out only. The date is `deadlineLabel(purge_after)`: `Intl.DateTimeFormat`
  `en`, short month, day, year, UTC — the app's one date shape.
- **The download is a short-lived signed URL minted by a server route, never a function body**
  (AD-13, spine `:185`): `GET /snapshots/{id}/download` verifies the session, reads the row **through
  the user's own client** so RLS answers whose it is (`site_snapshots_owner_read`, schema `:856-861`),
  then mints a 60-second URL with `supabaseAdmin()` — the `site-snapshots` bucket has no policy by
  design (`:1553-1555`) and the service role is the only reader — and answers **303** to it. A row that
  is not the caller's is a **404**, never a 403 that confirms it exists. `server-wiring.test.ts:73`'s
  `allowed` list gains this one file with that reason: the second privileged read the docstring of
  `server.ts` foresaw.
- **Restore is one click and it is honest about the deadline:** `restore_account()` returns `true`
  only while `purge_after > now()`; the action lands on `/?restored=1` and the dashboard says
  "Welcome back. Your account is restored — nothing was deleted." in the Kit's success Banner, on the
  URL-hint pattern of `signed-out.ts` (a value and a reader, both under test). A `false` is said in the
  page's red Banner: "The 14 days have ended and this account is being deleted."
- **One email, at request time, and it is FR-P1's eighth** (question 1 below): subject "Your Inflozo
  account will be deleted on Sep 21, 2026"; the magic-link template's own shell (`supabase/auth/
  magic-link.html:36-80` — the header row with the mark, the ink button, the hexes, the footer) rendered
  by a pure function; the deadline in the first sentence; **Restore my account** → `https://app.inflozo.com/restore`;
  the snapshot rows when there are any, with "Sign in to download them before Sep 21, 2026"; and the
  closing line "This is the only email we'll send about this." Sent through **`POST
  https://api.resend.com/emails`** with `RESEND_API_KEY` and `RESEND_FROM` read at call time — one
  `fetch`, no SDK (ponytail) — **non-fatally**: a send that fails is logged by status and the deletion
  stands, because the deadline is on the page the user is about to see. Sent only when the window
  OPENED on this call (the function returns `null` for a window already open), so a stale second tab
  cannot send a second email.
- **The two functions are proved in `RLS-TEST.sql` before anything calls them** (the gate's copy in
  `supabase/tests/rls.sql` re-copied byte-for-byte, `run-rls-gate.sh` green): A's call stamps A's row
  and A's snapshot with `purge_after = deleted_at + interval '14 days'` and leaves B's untouched; a
  second call keeps the first deadline; `restore_account()` clears both and answers `true`; with
  `purge_after` moved into the past it answers `false` and clears nothing; `anon` cannot execute either.
- The mutation shape is the account file's own: `signedIn()` first, zod at the boundary, the error
  envelope `fail(code)`, `useActionState` in the card, the `once` and `seen` halves copied from
  `email-card.tsx:75-85`. The harness runs against `app.inflozo.com` and the real Supabase, Storage and
  Resend (R-82); every key by variable name.

**Ask First:**
- **If Resend answers anything but 2xx on the Deploy run's real send** (the key restricted, the sender
  unverified, a 4xx on the body shape) — stop, record the status, and ask, rather than switching
  transport or sender.
- If `createSignedUrl` with the service role is refused on the hosted project for a bucket with no
  policy (AD-32's server-only bucket has never been READ from the app) — stop and record; the
  fallback (a Storage policy) is a schema decision, not a workaround.
- Any change to what the PURGE does (2.6), to the 14 days, or to the ordinary Sign out.

**Never:**
- **No Dodo call and no subscription read** — nothing exists to build against (question 2): no billing
  adapter, no `subscriptions` writer, no way for anyone to hold a paid plan before Epic 12. The
  obligation is recorded on the ledger for E12 and `entitlements` is not touched, which is exactly
  "retained at their current level".
- No purge, no cron, no Storage deletion, no anonymisation — 2.6's, and AD-32's five deletion paths
  gain no sixth here. No reminder email, ever (FR-P2, FR-A5's own last sentence).
- No writing `deleted_at`/`purge_after` from the app, no widening the column grants, no
  `supabaseAdmin()` on a user row: the functions are the only writers.
- No new dialog vocabulary, no second confirm shape, no Kit `disabled` (`kit/button.tsx:9-11`), no
  tooltip.
- No guarding server actions on `deleted_at`: the layout is the door; a stale tab's rename lands on a
  row the purge removes anyway (`// ponytail:` in the layout, the matrix's last row).
- No editing the frozen migration; the functions are a new file, mirrored into `SCHEMA.sql`.
- No `resend` package, no email template under `supabase/auth/` (`app-routes.test.ts:16-17` reads that
  directory as GoTrue's templates and would assert a `type=` on it).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open the confirm | Delete account pressed on `/account` | S12c's dialog, focus on Cancel, the sentence with this account's counts; Escape / Cancel / backdrop close it, nothing sent | N/A |
| Wrong phrase | "delete my acc", or "Delete My Account" | the red button stays at .45 and `aria-disabled`; Enter sends nothing (client guard); a request forged past it is refused by the action | field sentence "Type delete my account exactly." (`wrong_phrase`) |
| Confirmed, happy path | the phrase, Delete pressed | `request_account_deletion()` → `profiles.deleted_at = now()`, `purge_after = deleted_at + 14 days`, every snapshot's `purge_after` the same and `download_offered_at` stamped; one email accepted by Resend (2xx, id logged); browser on `/restore` with the date | N/A |
| The function fails | RPC error (PostgREST 5xx, timeout) | dialog stays open with the red Banner "We couldn't delete your account just now. Try again in a moment."; no email; nothing changed | logged by code (`delete_failed`) |
| Resend fails or is unconfigured | 4xx/5xx, or no `RESEND_API_KEY` | the deletion STANDS; `console.error('deletion: email failed', { status })`; `/restore` shows the deadline anyway | non-fatal by design |
| Window already open | a second tab's Delete after the first | the function returns `null`, no second email, `/restore` with the ORIGINAL deadline | N/A |
| Any page under the shell while pending | `/`, `/account`, a magic link or passkey sign-in landing on `/` | the layout reads `deleted_at` and redirects to `/restore` | a FAILED profiles read renders the shell and logs — fail-open, nothing is lost, the purge still runs |
| `/restore`, not pending | `deleted_at` null | redirect to `/` | N/A |
| `/restore`, signed out | no session | `/sign-in` (`signedIn()`) | N/A |
| `/restore` before the deadline | pending, snapshots seeded | the date, each snapshot with its site and a Download, Restore account, Sign out | N/A |
| `/restore` after the deadline | `purge_after <= now()` | "being deleted", no snapshots, no Restore, Sign out only | N/A |
| Restore, happy path | Restore pressed before the deadline | `restore_account()` → `true`; both columns null on profiles and every snapshot; `/?restored=1`, the green sentence; the shell usable | N/A |
| Restore after the deadline | the deadline passed between render and click | `false` → the page's red Banner, nothing cleared | `window_closed` |
| Restore fails | RPC error | red Banner "We couldn't restore your account just now. Try again in a moment.", still pending | `restore_failed` |
| Download, own snapshot | `GET /snapshots/{id}/download` signed in as the owner | `303` to a `…/storage/v1/object/sign/site-snapshots/…` URL good for 60 s; the GET returns the object's bytes | N/A |
| Download, not mine / unknown id | B's session, A's id; or a random uuid | **404**, no URL minted | N/A |
| Download, signed out | no session | `303 /sign-in` | N/A |
| No snapshots | a fresh account | no block on `/restore`, no block in the email, the sentence otherwise identical | N/A |
| 390 | narrow viewport | the card full width, the button at the row's end unclipped; the dialog at `calc(100vw-20px)`; `/restore` as S1a collapses; zero axe violations | N/A |
| Stale tab acts while pending | a rename fired from a tab opened before the request | goes through — the row is the purge's anyway | accepted ceiling, `// ponytail:` |

</frozen-after-approval>

## Questions for the owner

**1. The email that confirms the countdown is not on the PRD's list of emails.** FR-P1 says the product
sends *exactly seven* emails and names them; FR-A5 and this story's own acceptance criteria say the
deletion is confirmed by an email that states the deadline. The two contradict, so this is yours to
settle (standing rule: flag, don't guess). Example: you press Delete account on Sep 7 — should an email
land in your inbox saying "Your Inflozo account will be deleted on Sep 21, 2026", with a Restore button?

1. **Yes — it becomes the eighth email (RECOMMENDED).** Sent once, at the moment you confirm; it
   states the date, lists any original themes you can download, links to Restore, and says it is the
   only email about this. No reminder ever follows, so it is a confirmation, not a nudge, and FR-P2 is
   untouched. FR-P1 changes from seven to eight and the ruling is recorded beside R-95, which took it
   from six to seven the same way.
2. **No email at all.** The date and the downloads are shown only on the screen after you confirm. Cheaper
   to build, but a person who deletes and closes the tab has nothing in writing, and this contradicts
   FR-A5's own text and the story's acceptance criterion.

Ruled: option 1 — the eighth email (owner, 2026-09-07). Recorded as **R-96** in
`reconcile-designs-decisions.md` §A20; FR-P1 now says eight and names it (8). Nothing in the build moved:
the spec was written on it.

**2. Stopping your card being charged during the countdown cannot be built yet.** The story says
auto-renew on your Dodo subscription stops the moment you ask to delete, and Restore offers to resume
it. Today nothing in the product talks to Dodo, nobody can buy a plan, and no subscription exists to
test against (Epic 12 builds all of that). Example: a Pro subscriber deletes on Sep 7 with a renewal due
Sep 20 — the promise is that Sep 20 never charges them.

1. **Build it in Epic 12, where Dodo arrives (RECOMMENDED).** This story builds everything else and
   records the two Dodo calls (stop auto-renew on request, offer resume on restore) on the ledger as
   Epic 12's obligation, so the story that builds the billing adapter builds them with it and tests them
   against a real subscription. Nothing is lost meanwhile: until Epic 12 ships, nobody can hold a paid
   plan, so nobody can be charged inside a window.
2. **Build a Dodo call now from Dodo's documentation**, against its test mode. It cannot be tested
   against a real subscription (R-82), it would be a guess about Dodo's API in an accounts story, and
   Epic 12 would rebuild it inside its adapter anyway.
3. **Wait: park this story until Epic 12 is done.** The 14-day window and Restore then arrive months
   later, and Story 2.6's purge with them.

Ruled: option 1 — Epic 12 (owner, 2026-09-07). Recorded as **R-97** in §A20 and as **DW-42** on the
ledger, which Story 12.5 now cites in its acceptance criteria; no Dodo call in this story.

*Both ruled on 2026-09-07, the day the spec was written, on the options it was built on — so nothing in
the Code Map or the Tasks moved. R-96 edited FR-P1 (seven → eight, the new (8)) and R-97 wrote DW-42 and
one acceptance line in Story 12.5; both landed in the second Create commit, with the spine's `resend` row
reworded so it no longer restates a count.*

## Code Map

- `supabase/migrations/20260907150000_account_deletion_window.sql` (new) -- two functions, `language
  plpgsql security definer set search_path = public` (the shape of `provision_entitlement`, schema
  `:1372-1373`): **`request_account_deletion() returns timestamptz`** — `update profiles set deleted_at
  = now(), purge_after = now() + interval '14 days', updated_at = now() where user_id = auth.uid() and
  deleted_at is null returning purge_after into deadline`; when a row was stamped, `update
  site_snapshots set purge_after = least(coalesce(purge_after, deadline), deadline),
  download_offered_at = coalesce(download_offered_at, now()) where user_id = auth.uid()`; returns
  `deadline` (**`null` when the window was already open** — the action's "send no second email").
  **`restore_account() returns boolean`** — `update profiles set deleted_at = null, purge_after = null,
  updated_at = now() where user_id = auth.uid() and deleted_at is not null and purge_after > now()`;
  when a row cleared, `update site_snapshots set purge_after = null where user_id = auth.uid()`;
  returns whether a row cleared. `revoke execute … from public, anon; grant execute … to
  authenticated`. Header: the story, FR-A5, why definer (the grant at `:1223-1224` is right and stays),
  and `-- ponytail: restore clears every snapshot's purge_after, the 90-day orphan clock included; E3
  re-stamps it when it exists (DW-43)`. `freeze_columns('is_admin')` (`:885-886`) does not bind these
  columns — read, not assumed
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` -- the same
  block appended in the 2.2 shape (its "Story 2.2 — drop `passkey_labels`" block), so the gate's
  schema diff proves the two agree
- `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` -- a new
  `do $$` block in the `:117-118` idiom (`set role authenticated; set request.jwt.claim.sub = A`): seed
  `site_snapshots` rows for A (`site aaaaaaaa-…0001`) and B (`bbbbbbbb-…0002`) as the owner; as A call
  `request_account_deletion()` → A's `deleted_at` set and `purge_after = deleted_at + interval '14
  days'` exactly, A's snapshot `purge_after` equal and `download_offered_at` set, B's row and snapshot
  untouched; a second call returns null and the deadline is unchanged; `restore_account()` → true,
  both null; as the owner move A's `purge_after` to `now() - interval '1 day'` with `deleted_at` set,
  as A `restore_account()` → false and nothing cleared; `set role anon` → `execute` raises `42501`.
  Then `cp` to `supabase/tests/rls.sql` (the gate refuses drift)
- `apps/web/app/(app)/app/(authed)/account/deletion-rule.ts` (new, plain module beside
  `email-change-rule.ts`, for the same reason) -- `DELETE_PHRASE = 'delete my account'`;
  `matchesPhrase(typed) = matchesName(typed, DELETE_PHRASE)`; `DELETION_WINDOW_DAYS = 14`;
  `deletionSentence(projects, assets, days)` (the three shapes above); `deadlineLabel(purgeAfter)`;
  `snapshotObjectKey(storage_path)` — strips the leading `site-snapshots/` the schema's comment
  (`:194`) puts in the column, because the Storage API takes the key without the bucket; the URL
  contract `RESTORE_PATH = '/restore'`, `RESTORED`, `RESTORED_VALUE`, `RESTORED_PATH = '/?restored=1'`,
  `isRestored(value)` (`signed-out.ts`'s value-and-reader shape); the sentences `WRONG_PHRASE`,
  `DELETE_FAILED`, `RESTORE_FAILED`, `WINDOW_CLOSED`, `RESTORED_SENTENCE`; `PURGE_WINDOW_DOC` — the
  migration path, read by the test
- `apps/web/deletion-rule.test.ts` (new) -- the phrase exact after trim and not case-folded; the
  three sentence shapes; `deadlineLabel` on a fixed ISO date; `snapshotObjectKey` with and without the
  prefix; the round trip `RESTORED_PATH` → `isRestored`; and the SOURCE-READING test that
  `readFileSync(migration)` contains `interval '${DELETION_WINDOW_DAYS} days'` (`email-change-rule.test.ts`
  reads `mailer_otp_exp` the same way)
- `apps/web/lib/email.ts` (new) -- `sendEmail({ to, subject, html, text })`: `process.env.RESEND_API_KEY`
  and `RESEND_FROM` read at call time, `fetch('https://api.resend.com/emails', { method: 'POST',
  signal: AbortSignal.timeout(SEND_TIMEOUT_MS) })`; returns `{ ok: true, id } | { ok: false, status }`
  and never throws (unconfigured → `{ ok: false, status: 0 }` and one log line). `// ponytail: one
  fetch, no SDK; the resend package the day E12 wants batch or attachments`
- `apps/web/lib/deletion-email.ts` (new, pure) -- `deletionEmail({ deadline, snapshots, restoreUrl })
  → { subject, html, text }`: `magic-link.html:36-80`'s shell as a template string with the same hexes,
  the mark PNG row, the ink button, the footer; every user value HTML-escaped; the snapshot rows
  (`theme_name ?? 'Original theme'` · site title or URL · captured date) only when the list is not empty
- `apps/web/deletion-email.test.ts` (new) -- the subject carries the date; the html and text carry the
  restore URL, the deadline sentence, the "only email" line; a site title with `<` is escaped; no
  snapshot block for an empty list, one row per snapshot otherwise
- `apps/web/app/(app)/app/(authed)/account/actions.ts` -- ADD `requestDeletion(prev, formData)` in
  `changeEmail`'s shape (`:316-350`): `signedIn()`; `z.object({ confirm: z.string() })`; `matchesPhrase`
  else `fail('wrong_phrase')`; `supabase.rpc('request_account_deletion')` → error → `console.error` +
  `fail('delete_failed')`; when `data` is a date: `supabase.from('site_snapshots').select('id,
  theme_name, captured_at, sites(title, url)')` (RLS scopes it; a failed read means an email with no
  rows, logged) → `sendEmail(deletionEmail(…))`, non-fatal; `redirect(RESTORE_PATH)`. ADD
  `restoreAccount(prev, formData)`: `signedIn()`; `rpc('restore_account')` → error → `fail('restore_failed')`;
  `data === false` → `fail('window_closed')`; `redirect(RESTORED_PATH)`. `Code` widens by the four;
  `MESSAGES` spreads the sentences from `deletion-rule.ts`
- `apps/web/app/(app)/app/(authed)/account/danger-card.tsx` (new, client) -- the card and the dialog as
  Always describes them; `useActionState(requestDeletion, null)`; `typed` state and `armed =
  matchesPhrase(typed)`; the `onSubmit` guard; `once` + `seen`; the field sentence for `wrong_phrase`
  and the Banner for `delete_failed`; props `projects`, `assets`. The header comment names both frames
  and this story
- `apps/web/app/(app)/app/(authed)/account/page.tsx` -- the `Promise.all` (`:52`) gains two HEAD
  counts, `from('projects').select('*', { count: 'exact', head: true })` and the same on `assets`
  (RLS scopes both; a failed count is 0 and logged — the sentence's third shape, never a crash);
  `<DangerCard projects={…} assets={…} />` after `<SessionsCard />`; the header comment's "the Danger
  zone is 2.5's" becomes "landed with 2.5"
- `apps/web/app/(app)/app/(authed)/layout.tsx:20-27` -- the select widens to `display_name, deleted_at`;
  after the read, `if (profile?.deleted_at) redirect(RESTORE_PATH)` with the comment naming FR-A5, the
  fail-open on a failed read, and `// ponytail: the layout is the door; actions are not re-guarded — a
  stale tab's write lands on a row the purge removes anyway`
- `apps/web/app/(app)/app/restore/page.tsx` (new, server, OUTSIDE `(authed)`) -- `signedIn()`; read
  `profiles.deleted_at, purge_after` through the user's client; null → `redirect('/')`; the snapshots
  select above; render the `main` of `sign-in/page.tsx:45-58` (no watermark, no footer — they are the
  empty page's ornament) and S1a's card (`sign-in-form.tsx:146`'s classes) with the `Lockup`, the two
  states, `<RestoreForm />`, and `<form action={signOut}>` with a secondary 36 **Sign out**; `metadata`
  noindex. Header comment: R-74's extrapolation, named
- `apps/web/app/(app)/app/restore/restore-form.tsx` (new, client) -- `useActionState(restoreAccount,
  null)`, the primary 44 full-width button, "Restoring…", the red Banner for either code
- `apps/web/app/(app)/app/snapshots/[id]/download/route.ts` (new) -- `currentUser()` else `303
  /sign-in`; `z.string().uuid()` on the id else 404; `supabaseServer().from('site_snapshots')
  .select('storage_path').eq('id', id).maybeSingle()` → null → 404; `supabaseAdmin().storage.from
  ('site-snapshots').createSignedUrl(snapshotObjectKey(path), 60)` → error → 502 logged; `303` to
  `signedUrl`, `Cache-Control: no-store`. Header: AD-13, AD-32, why the admin client, this story
- `apps/web/server-wiring.test.ts:73` -- `allowed` gains `app/(app)/app/snapshots/[id]/download/route.ts`
  with its reason; ADD a source-reading test that `(authed)/layout.tsx` contains `deleted_at` in its
  select and `redirect(RESTORE_PATH)` after it — the door, pinned
- `apps/web/app-routes.test.ts:33` -- a second list `SELF_GUARDED = [join('restore', 'page.tsx')]`:
  a page outside `(authed)` that is NOT public must contain `await signedIn()`; the existing test skips
  it, a new one reads the file for the guard
- `apps/web/app/(app)/app/(authed)/page.tsx:37-50, 85-90` -- `searchParams` gains `[RESTORED]`; the
  success Banner with `RESTORED_SENTENCE` rendered in the same slot as the sign-out-failed strip
- **Vercel (real)** -- production holds `SUPABASE_*` and `DODO_WEBHOOK_SECRET` and **no `RESEND_*`**
  (`GET /v9/projects/{id}/env`, names only, executed 2026-09-07). The Dev run adds `RESEND_API_KEY` and
  `RESEND_FROM` to `production` through `POST /v10/projects/{id}/env` with `VERCEL_TOKEN`, each value
  read from `tools/probe/.env` by name and never printed; the Deploy run's build picks them up
- `tools/probe/run-verify-account-deletion.py` (new, tool → a `doc-audit.py` catalogue row in `:283`'s
  shape) -- Playwright against `app.inflozo.com`; `Admin`, `load_env`, `playwright_dir`, `axe_path`,
  `tokens_rgb`, the sweep IMPORTED through `_sibling` (`run-verify-email-change.py:87`); two fixture
  users `deletion-harness-<ts>@inflozo.com` and `…-b`; seeds for A a `sites` row, a `site_snapshots`
  row and a Storage object at `site-snapshots/{A}/{site}/theme.zip` over PostgREST and the Storage
  API with `SUPABASE_SECRET_KEY` (new helpers `rest()` and `storage_put()`/`storage_delete()`, small,
  in this file); the steps as `## Verification` lists them; cleanup deletes the object, then both
  users, and lists the prefix to prove nothing is left; user count before and after. `--check` is
  plumbing only. No key printed
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-22 gains one line (a third story meets
  the wall: the email's delivery is the owner's step 5); **DW-43** (new, at Create): restore clears
  the snapshot's 90-day orphan clock, E3's to re-stamp; **DW-42** (Create, on the owner's ruling R-97):
  FR-A5's two Dodo calls are Epic 12's obligation, cited by Story 12.5
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md:465` FR-P1 and
  `reconcile-designs-decisions.md` §A20 -- DONE at Create on the owner's rulings: FR-P1 seven → eight with
  the new (8), R-96 and R-97 recorded, `epics.md` Story 12.5 citing R-97, and the spine's `resend` row no
  longer restating a count
- read-only: `lib/supabase/server.ts` (`signedIn`, `currentUser`, `supabaseServer`, `supabaseAdmin` and
  its docstring's second-reader sentence), `lib/flags.ts:43-47` (the admin read with `abortSignal`),
  `kit/dialog.ts`, `kit/button.tsx` (`danger`, `buttonClasses`), `kit/banner.tsx`, `kit/icons.tsx`
  (`AlertTriangle`), `kit/logo.tsx` (`Lockup`), `sessions-card.tsx` (the newest card), `proxy.ts`
  (rewrites `/restore` and `/snapshots/…` to `/app/…` like every app path), schema `:112-125`,
  `:191-203`, `:1223-1224`, `:1476-1486`, `:1553-1555`; `.env.example:98-113`
- `epics.md:806-829` · PRD FR-A5 (`prd.md:184`), FR-P1 (`:465`), FR-L3 (`:431-437`), NFR-8 (`:492`) ·
  `EXPERIENCE.md:133, 298, 482-486` · spine AD-13 (`:185`), AD-32 (`:346-352`), AD-33 (`:354-358`) ·
  DW-22 · DW-23

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/20260907150000_account_deletion_window.sql` + `SCHEMA.sql` + `RLS-TEST.sql` +
      `supabase/tests/rls.sql` -- the two functions and their proof, control first (break one assertion,
      see the gate go red, restore it) -- the 14 days become a database fact before anything calls them
- [x] `account/deletion-rule.ts` + `apps/web/deletion-rule.test.ts` -- the phrase, the sentence, the date,
      the object key, the URL contract, and the interval read back from the migration -- the contract
      before anything reads it
- [x] `lib/deletion-email.ts` + `lib/email.ts` + `apps/web/deletion-email.test.ts` -- the email and its
      transport -- FR-P1's eighth (question 1)
- [x] `account/actions.ts` -- `requestDeletion` and `restoreAccount` -- the two verbs
- [x] `account/danger-card.tsx` + `account/page.tsx` -- S12a's Danger zone and S12c's confirm -- the
      frames
- [x] `(authed)/layout.tsx` + `server-wiring.test.ts` -- the door, pinned -- FR-A5's "on signing in"
- [x] `restore/page.tsx` + `restore/restore-form.tsx` + `app-routes.test.ts` -- the window's one page --
      the deadline, the downloads, Restore
- [x] `snapshots/[id]/download/route.ts` + `server-wiring.test.ts` -- the signed URL, and the second
      privileged reader named -- AD-13
- [x] `(authed)/page.tsx` -- "Welcome back" -- say it happened
- [x] Vercel production env -- `RESEND_API_KEY`, `RESEND_FROM` by name -- the send needs them
- [x] `tools/probe/run-verify-account-deletion.py` + its catalogue row -- the harness, controls first --
      R-82, re-runnable
- [x] `deferred-work.md` + `prd.md` + `reconcile-designs-decisions.md` + `epics.md` -- DW-22's line, DW-42,
      DW-43, FR-P1's (8), R-96, R-97 and Story 12.5's line, all landed at Create on the rulings of
      2026-09-07 -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result by variable
      name

**Acceptance Criteria:**
- Given a signed-in user on `/account` at 1440 and at 390, when the page renders, then a **Danger zone**
  card sits under Sessions and **matches the frame** — `S12 Billing.dc.html:104-111`'s `danger-line`
  border, the `danger-text-hover` label, the row's title and caption, and the `:109` button (34px /
  radius 12 / 13px 600 / surface, `danger-line` border, `danger-text` label, `danger-tint` on hover),
  measured as computed styles on the deployed DOM; the Email, Passkeys and Sessions cards exactly as
  2.4 left them
- Given **Delete account** pressed, when the dialog opens, then it **matches frame S12c** — the disc and
  triangle, "Delete your account?", the sentence with this account's own counts, the chip label, the
  mono field, Cancel and a Delete account at `opacity-45` with `aria-disabled` — with focus on Cancel;
  and Cancel, Escape and a backdrop click each close it with no request sent
- Given "delete my acc" typed, when Enter is pressed, then nothing is sent and the button is still at
  .45; given the phrase typed exactly, then the button is solid and pressing it lands on `/restore`
  with the date, and the wire shows `profiles.deleted_at` set, `purge_after` exactly fourteen days
  after it, the seeded snapshot's `purge_after` equal and `download_offered_at` set
- Given a pending account, when it opens `/`, `/account`, or signs in afresh with a magic link, then it
  lands on `/restore`; and `/restore` lists the seeded snapshot with its site's title, its captured
  date, and a **Download** that answers `303` to a signed URL whose GET returns the seeded bytes
- Given B signed in, when B requests A's snapshot's download, then **404** and no URL is minted
- Given **Restore account** pressed before the deadline, then both columns are null on `profiles` and
  the snapshot, the browser is on `/?restored=1` with "Welcome back. Your account is restored — nothing
  was deleted.", and the dashboard is usable; given the deadline moved into the past, then `/restore`
  says "being deleted" with no Restore and `restore_account()` answers `false`
- Given the RLS gate, when it runs, then the new block passes, and each new assertion was seen to FAIL
  once when its condition was broken (the control)
- Given `deletion-rule.test.ts`, when `DELETION_WINDOW_DAYS` and the migration's interval disagree, then
  a test fails
- Given `pnpm check`, `pnpm build`, the RLS gate, `doc-audit --check`, and axe-core on `/account`
  (closed, dialog open), on `/restore` (both states) and on `/?restored=1`, at 1440 and 390, then all
  green and zero violations

### Review Findings

Code review 2026-09-07, five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). The two Dev commits were already live — Vercel's production deployment on `3caaa7a9`
— so the verifier drove the committed harness against `app.inflozo.com` four times and re-ran the local
gates: every behavioural claim held on the deployed site, and the one failing step was the harness's own
timing race. No decision for the owner; every patch applied in the review; nothing deferred.

- [x] [Review][Patch] The confirm's sentence says "and 0 assets" for an account with projects and no assets — and for one whose asset count could not be read, because `countOf` answers 0 for a failed read [apps/web/app/(app)/app/(authed)/account/deletion-rule.ts:57] — the asset clause is now left out when the count is below one, with the test
- [x] [Review][Patch] Cancel after typing the phrase left a confirm that REOPENED ARMED, one click from the irreversible thing [apps/web/app/(app)/app/(authed)/account/danger-card.tsx:120] — `onClose` clears the typed phrase; the harness's `rearm` step keeps it so
- [x] [Review][Patch] The dialog's body sentence — the window, the counts, "cannot be undone" — was not announced with the dialog (only `aria-labelledby`) [apps/web/app/(app)/app/(authed)/account/danger-card.tsx:118] — `aria-describedby` on the `<dialog>`, an id on the `<p>`
- [x] [Review][Patch] Restore after another tab (or a double press) had already restored answered `false` and said "The 14 days have ended and this account is being deleted" about a safe account [apps/web/app/(app)/app/(authed)/account/actions.ts:513] — a `false` re-reads `deleted_at`; not pending means restored, and it redirects like the first call
- [x] [Review][Patch] Anything thrown inside the email step after the window opened would reach the error boundary and tell the user the deletion failed [apps/web/app/(app)/app/(authed)/account/actions.ts:490] — the whole step is fenced in a try/catch that logs
- [x] [Review][Patch] A session with no address skipped the send silently, so the Deploy log could not tell a skip from a lost send [apps/web/app/(app)/app/(authed)/account/actions.ts:503] — one log line
- [x] [Review][Patch] A refused send threw Resend's reason away and logged a bare status — what the owner would be debugging his inbox from [apps/web/lib/email.ts:63] — the envelope carries `name: message` (no address, no key) and the action logs it
- [x] [Review][Patch] The snapshot list had no order, so two themes could swap places between the email and the page [apps/web/app/(app)/app/restore/page.tsx:60 · account/actions.ts:487] — `captured_at` descending in both reads
- [x] [Review][Patch] `/restore` dropped both read errors: a transient profiles fault read as "not pending" and bounced the account to the door and back with no log line [apps/web/app/(app)/app/restore/page.tsx:47] — both reads log, as the account file's do
- [x] [Review][Patch] A row whose OBJECT is gone answered 502 "Could not prepare that download", inviting retries that never succeed [apps/web/app/(app)/app/snapshots/[id]/download/route.ts:66] — Storage's `NoSuchKey` (read off the wire: HTTP 400, `statusCode "404"`) is a 404
- [x] [Review][Patch] Every download was served as `theme.zip`, so a person with two sites choosing which original theme to keep got `theme.zip` and `theme (1).zip` [apps/web/app/(app)/app/snapshots/[id]/download/route.ts:61] — the signed URL names the file `<site>-<theme>.zip`
- [x] [Review][Patch] `supabaseAdmin`'s docstring still said "the one read no session can make" while the test enforces two readers — propagate, never localise [apps/web/lib/supabase/server.ts:63] — the docstring names both and how a third is added
- [x] [Review][Patch] The door test read the FIRST `.select(` in the layout, whichever table it belonged to [apps/web/server-wiring.test.ts:169] — anchored on `from('profiles')`
- [x] [Review][Patch] Only the site title was proved escaped in the email; the theme name (a Ghost theme author's text) and the `sites: null` fallback were not [apps/web/deletion-email.test.ts:69] — both asserted
- [x] [Review][Patch] The `least(…)` branch — a snapshot already due EARLIER keeps its date — had no control: both fixture snapshots were seeded with `purge_after` null, so a function stamping the deadline unconditionally passed [RLS-TEST.sql, the 2.5 block] — a second site of A's on a 3-day clock, asserted unchanged; restore asserted to clear EVERY snapshot of A's; `supabase/tests/rls.sql` re-copied, gate green
- [x] [Review][Patch] AC 7 says each new assertion was seen to FAIL once and the Dev record held six of eighteen — seventeen breaks now executed in one container, each tripping its own assertion (`## Verification`, the review run); the two left are downstream of a recorded control and reachable only by a function that lies about its own outcome
- [x] [Review][Patch] The harness's `frame` step measured at `load`, before the Suspense skeleton swapped the card in: `h: 0` on three of four live runs with every colour right [tools/probe/run-verify-account-deletion.py, `frame`] — waits for the button to be visible first
- [x] [Review][Patch] The harness's one real send went to an address nobody opens and had no `--to`, which the sibling harness carries for exactly this (DW-22) [tools/probe/run-verify-account-deletion.py] — `--to ADDRESS` makes A that inbox, with the sibling's collision refusal; the catalogue row says so
- [x] [Review][Patch] Three things the harness never observed where they render, so each could be deleted with every check green: the sentence with real counts (the fixture had no project), the server's own phrase check (`armed` proves the CLIENT blocked the POST), and `/restore`'s two guards (a source regex only) [tools/probe/run-verify-account-deletion.py] — five steps added: `sentence` (one project seeded), `rearm`, `server-phrase` (the captured server-action POST replayed with a wrong phrase must answer `wrong_phrase`), `restore-signed-out`, `restore-clean`
- [x] [Review][Patch] Deploy step 4 read the log for `deletion: email sent` alone; the failure the unconfigured-send test exists for prints `email: not configured` [this spec, `## Verification`] — the step names both lines

Dismissed as noise or as the spec's own decision, nine: re-guarding actions on `deleted_at` (a **Never**); a `null` from a missing profiles row (the row exists from signup); an unparseable `captured_at` or deadline reaching the fallback text (`captured_at` is `not null default now()`; the deadline is the function's own return); `deleted_at` set with `purge_after` null (one statement stamps both); naming the snapshots in the confirm sentence (the frozen sentence is the spec's, and `/restore` lists them the moment the window opens); the harness not being in CI (harnesses run at Deploy by hand, by design); the `window_closed` strip (it needs the deadline to pass between render and click; the page's no-button state is proved); "156 tests" versus the verifier's 159 (`apps/web` alone versus the whole repository); and a suggestion to re-document the deploy order that the record already carries.

## Spec Change Log

1. **The migration's in-body comment had to come out of the body, and the gate is what said so.**
   `pg_dump` emits a plpgsql function body VERBATIM, comments included, so a `--` line inside
   `request_account_deletion` that `SCHEMA.sql` did not also carry is SCHEMA DRIFT: the gate refused
   the run and printed the four lines as a diff (executed, 2026-09-07). The comment now sits above
   the `create or replace`, where it says the same thing and the two files still describe one
   database. The migration says this in a sentence, so the next function does not learn it twice.
2. **`deletion-rule.ts` imports `matchesName` by RELATIVE path, not `@/lib/projects`.** `node --test`
   strips types but does not read tsconfig `paths`, so the `@/` the Code Map wrote would have
   resolved under `next build` and thrown `ERR_MODULE_NOT_FOUND` the moment `deletion-rule.test.ts`
   imported the module. Every other plain module a test reaches is relative with its extension
   (`email-change-rule.ts` → `../../sign-in/email.ts`); this one now is too, with the reason beside it.
3. **`tokens.test.ts` gained a third exemption AND a new test, which the Code Map did not foresee.**
   `lib/deletion-email.ts` must write hexes — an inbox has no token layer, which is why
   `supabase/auth/magic-link.html` writes the same five — and the standing "no colour literal in any
   `.ts`/`.tsx`" gate refused the file. Rather than exempt it and stop there, the exemption is paid
   for: a new test reads every hex out of the module and asserts each IS a `--color-*` value in the
   theme, so the copy cannot drift from the product it is about.
4. **`deletion-email.test.ts` also holds `sendEmail`'s unconfigured path**, which the Code Map left
   to the matrix alone. It is the "Resend fails or is unconfigured" row and the one branch of it
   reachable without a network — and the guarantee it protects is that a completed deletion is never
   turned into an error page by a send that failed.
5. **The product's OWN copy in the email is not entity-escaped; only user values are.** Escaping
   everything turned "we'll" into `we&#39;ll` in the body — visible in an inbox — so `escape` is
   applied to the site title, the theme name and the URL, and the test asserts no `&#39;` survives.
6. **The migration was applied to the live database BY THE OWNER, during the Dev run** — earlier
   than 1.2's record puts it ("by hand at Deploy"), because he asked whether it was needed and it
   was. Three things were executed rather than assumed: `SUPABASE_DB_URL`'s direct host answers
   `Network unreachable` from this machine (IPv6-only — `spec-2-1:603` recorded the same);
   Supabase's transaction pooler DOES answer (`PostgreSQL 17.6`); and every WRITE to the live
   database from this session was refused by its sandbox, the Management API's SQL endpoint
   included. So the anon control has BOTH readings on the record — `404 PGRST202` before, `401
   42501` after — and the five live-function checks above close the acceptance criterion the Dev run
   could otherwise only have deferred.
7. **The `## Verification` heading was clipped once by an anchor that matched its own name in prose**
   (the task list says "Run `## Verification` on the real infrastructure"). Restored from `HEAD` and
   re-applied anchored on the heading at the start of a line. Nothing in the frozen block, the
   owner's questions or his manual test was touched; all eleven `##` sections are present.

8. **Review, 2026-09-07 — the sentence, the dialog and the restore each lost a way to lie.** `deletionSentence`
   drops the asset clause below one asset (a failed count read as 0 and rendered "and 0 assets" on the
   irreversible confirm); the confirm clears the typed phrase on close, because Cancel after typing it
   reopened one click from deletion; and `restoreAccount` reads the profile before calling a `false` a
   closed window — a second tab or a double press had restored it already, and "the 14 days have ended"
   was a lie about a safe account. Each has its test or its harness step (`rearm`, `sentence`).
9. **The download route names the file and honours a missing object.** Storage served every snapshot as
   `theme.zip`; the signed URL now carries `download: <site>-<theme>.zip`, which is why the select gained
   `theme_name, sites(title)` beyond the Code Map's `storage_path`. And `NoSuchKey` — executed against
   the live bucket: HTTP 400 with `statusCode "404"` and that code — is a 404, not a 502 that invites retries.
10. **The RLS block gained the control the migration's comment promised.** `least(…)` never lengthens a
    snapshot's earlier FR-C6 clock, and nothing proved it: both fixture snapshots were seeded null. A's
    second site now carries a snapshot three days out, asserted unchanged by the deletion; and the restore
    assertion counts every snapshot of A's rather than one id. The gate's copy re-copied byte-for-byte.
11. **AC 7 was met literally, not only in spirit.** The Dev run broke six clauses; the review broke every
    assertion it could reach — seventeen, in one container, each tripping its own line (the table under
    `## Verification`). Two remain unbroken by construction: "the second call moved the deadline" sits
    behind "re-opened the window" and "a refused restore cleared the profile anyway" behind "answered true
    after the deadline"; each needs a function that changes the row and reports the opposite, and neither
    is a defect a real edit produces. Said here so the next reader does not count them as a gap.
12. **The harness measures after the skeleton, and proves three more things where they render.** `frame`
    read `h: 0` on three of four live runs — `loading.tsx` is a Suspense skeleton and the card was still
    in the hidden streamed segment at `load` — so it waits for the button to be visible. And three claims
    a source regex or a pure test alone was holding are now executed against the deployed site: the
    sentence with a real project count, the server's own phrase check (the captured server-action POST
    replayed with a wrong phrase), and `/restore` signed out and for a restored account. `--to` lands the
    run's one real send in an inbox a human can open, as the sibling harness does.

## Design Notes

**Routine calls made here, not the owner's** (each one line, as CLAUDE.md asks). *Definer functions,
not the admin client:* the columns are rightly not client-writable, two PostgREST writes are not a
transaction, and `interval '14 days'` in one place is a fact the gate can assert; the secret key keeps
its one reader for user rows — the download route is a Storage read, not a row write. *The frame's
phrase, not "my name":* the AC's "typing my name" is the typed-confirm pattern in words — nothing in the
product holds a name yet (`shell-user.ts`) — and S12c draws the phrase. *The sentence says fourteen
days:* the frame's "cannot be undone" would be untrue at the moment it is read; the PRD decides
behaviour and the clause survives as "after that". *A locked door:* FR-A5 offers Restore on signing in,
and an account that keeps working has not been deleted in any sense the user meant. *No second
email, and no email on a re-request:* FR-A5's last sentence, and the function's `null` is how the
action knows. *Fail-open on a failed profiles read:* the alternative is a 500 for every pending account
when Postgres hiccups, for a state that nothing can lose. *`/restore` outside `(authed)`:* a layout
cannot read its own path, so a redirect inside the group would loop; outside, with its own `signedIn()`,
the test that keeps every page guarded is extended rather than bypassed. *HTTP `fetch` for Resend:* one
POST, and E12 can swap the module for the package without a caller changing.

**What is a hypothesis until executed** (standing rule 1). That `security definer` functions run under
the hosted project's `auth.uid()` (the container shims it; RLS-TEST's own comment `:64-75` says the
platform's first branch is the same setting); that `.rpc()` through `@supabase/ssr` carries the user's
JWT so `auth.uid()` is the caller; that the service role can `createSignedUrl` on a bucket with no
policy and the URL serves the bytes; that Resend accepts the send from the app's own key and sender
(`RESEND_FROM` was verified for the domain on 2026-09-05, per `.env.example:105-107`); that
`sites(title, url)` embeds through the `site_id` foreign key under RLS. Each lands under `##
Verification`; the first that fails is an **Ask First**, not a workaround.

**Why the email cannot be proved to arrive** (DW-22, a third time). `RESEND_API_KEY` is send-only; the
harness sees the deletion, the rows, the page and the download, and the app logs Resend's status and
id. The owner's manual test step 5 is the delivery check, and this story appends one line to DW-22
rather than a new row.

**The seam 2.6 builds on.** The purge selects `profiles where deleted_at is not null and purge_after <=
now()` on the index `:125` already draws; it deletes the Storage objects the `storage_path` column names
BEFORE the rows (AD-32), then the user. Restore has already cleared both columns, so a restored account
is invisible to it by construction. `snapshotObjectKey` is the one place the bucket prefix is stripped;
2.6 and E3 import it.

`// ponytail: counts on the sentence are two HEAD requests; one view the day the page needs a third` ·
`// ponytail: the restore page lists snapshots by a join; a denormalised site title the day sites are
renamed` · `// ponytail: 60-second signed URLs; a streamed proxy the day a snapshot exceeds a
browser's patience`

## Verification

Run on the real infrastructure (R-82). Every key was read into a command's environment by name and
never printed; each is recorded by its variable name only. **Dev run, 2026-09-07.**

### What ran here, and what it returned

| Command | Result |
|---|---|
| `export PATH=…/node/v24.18.1/bin:$PATH && pnpm check` (repository root) | **exit 0.** `eslint`, `tsc --noEmit` and `node --test` green — **156 tests, 156 pass, 0 fail**, the new ones among them: `deletion-rule` (7), `deletion-email` (5, including the unconfigured send), the door in `server-wiring`, the self-guarded page in `app-routes`, and the email's colours in `tokens` |
| `pnpm build` | **exit 0.** `/app/restore`, `/app/snapshots/[id]/download` and `/app/account` all `ƒ` |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0**, with the block's five PASS lines: the stamp and its snapshot fourteen days out *once*; B's profile and snapshot untouched; `restore_account()` clearing both and answering true; past the deadline answering false and clearing nothing; `anon` refused `42501` |
| `python3 tools/doc-audit.py --check` (twice, the new tool) | first run **STALE** — it regenerated `INDEX` and asked for the board — then `python3 tools/story-board.py`, then **PASS (0 warnings)** |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN` and `VERCEL_TEAM_ID` | **HTTP 200.** Production held `DODO_WEBHOOK_SECRET`, `ENABLE_EXPERIMENTAL_COREPACK`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_URL` — **no `RESEND_*`**, exactly as the Code Map recorded |
| `POST https://api.vercel.com/v10/projects/{VERCEL_PROJECT}/env` ×2, each value read from `tools/probe/.env` by name | **HTTP 201** for `RESEND_API_KEY` and **HTTP 201** for `RESEND_FROM`, both `encrypted`, target `production`. Read back by the `GET` above: both now listed **by name**. No value was printed at any point |
| `POST $SUPABASE_URL/rest/v1/rpc/request_account_deletion` and `…/restore_account` with `SUPABASE_PUBLISHABLE_KEY` and **no bearer** | Before the migration was applied: **HTTP 404, `PGRST202`** for both — the honest reading of "the functions are not there yet". **After the owner applied it (2026-09-07): HTTP 401, `42501`** for both — the AC's refusal, executed |
| `psql "$SUPABASE_DB_URL" -f supabase/migrations/20260907150000_account_deletion_window.sql` (in a `postgres:17-alpine` container) | **did NOT run: `Network unreachable`** to `db.<ref>.supabase.co` — the direct host is IPv6-only and this machine has no route, which `spec-2-1:603` recorded before. Supabase's transaction pooler DOES answer from here (`aws-0-eu-central-1.pooler.supabase.com:6543`, `PostgreSQL 17.6`, executed), but every WRITE to the live database from this session was refused by its sandbox. **The owner applied the file himself in the Supabase SQL editor on 2026-09-07**, and the two blocks below are the proof it landed correctly |
| `python3 tools/probe/run-verify-account-deletion.py --check` | **exit 0.** `SUPABASE_*` present; playwright resolved; axe-core resolved; one real admin create-read-delete (**HTTP 200**); one real Storage put-list-delete in the server-only `site-snapshots` bucket (**HTTP 200** → `['theme.zip']`, prefix empty afterwards); the phrase read out of the app (`'delete my account'`); `DELETION_WINDOW_DAYS` read out of the app (`14`); **users before 4 == users after 4** |

### The two functions, executed on the LIVE database (2026-09-07, after the owner applied the migration)

The RLS gate proves the migration against a container. This proves the LIVE project got the same
thing, which a hand-applied paste is the one way to get wrong. One fixture user was created from a
real magic link — `POST /auth/v1/admin/generate_link`, then `POST /auth/v1/verify`, which is how a
user actually comes by a bearer — and deleted afterwards; **users before 4, after 4**. No browser,
because this is the database half; the UI half is the harness's, on the Deploy run.

| Check | Result |
|---|---|
| `anon-rpc` — both functions with `SUPABASE_PUBLISHABLE_KEY` and no bearer | **HTTP 401, `42501`** for each. `revoke execute … from public, anon` landed |
| `authed-rpc` — `request_account_deletion()` with the fixture user's OWN bearer | **HTTP 200**, an ISO timestamp, and `purge_after - deleted_at` = **14.0 days** exactly. `auth.uid()` is the caller through `.rpc()`, and the interval on the live database is the migration's |
| `second-request` — the same call again, window open | **HTTP 200, `null`**, and the deadline did not move. This is what stops a stale tab sending a second email |
| `restore` — `restore_account()` inside the window | **HTTP 200, `true`**; both columns null on the profile |
| `past-deadline` — `purge_after` moved a day into the past, then `restore_account()` | **HTTP 200, `false`**, and the account is still pending. Past the deadline 2.6's purge owns it |

Run as a one-off script, not added to `tools/`: it is a strict subset of
`run-verify-account-deletion.py` minus the browser, and a second harness would be a second thing to
keep in step (the Deploy run's harness re-runs every one of these against the deployed UI).

### The RLS gate's controls — six, each seen to FAIL

A result whose control did not pass is not a result. Each break was applied to the function, the
gate (or the block on its own, in one container) re-run, and the file restored; **every one exited
non-zero** and named its own assertion:

| The break | What failed |
|---|---|
| `deleted_at is null` dropped from `request_account_deletion`'s `where` — **the control the spec names** | `FAIL (2.5): a second call re-opened the window and returned 2026-09-21 …` (**exit 3**) |
| `interval '14 days'` → `'13 days'` | `FAIL (2.5): purge_after (…) is not deleted_at (…) + 14 days` |
| `where user_id = auth.uid()` dropped from the snapshot update | `FAIL (2.5): A's deletion stamped B's snapshot` |
| `restore_account`'s snapshot update removed | `FAIL (2.5): restore left the snapshot's purge_after set` |
| `restore_account`'s `purge_after > now()` removed | `FAIL (2.5): restore_account() answered true after the deadline had passed` |
| `grant execute … to anon` added back | `FAIL (2.5): anon executed request_account_deletion() and got null` |

And the **schema-diff** half of the gate bit for real while this was written: a comment INSIDE the
function body that `SCHEMA.sql` did not carry produced `SCHEMA DRIFT` with the four lines as a diff
(Spec Change Log 1). That is the gate proving the migration and the architecture describe one
database, not an assertion that they do.

### Review run, 2026-09-07 — what the review executed, and what it found

**On the deployed site.** Production was `dpl_2ZPeHBDXpNXquMbdebXKN1EkWvP6`, the Dev commit `3caaa7a9`, so
the committed harness ran four times against `app.inflozo.com` (`PLAYWRIGHT_DIR` set by name; keys by
name). Every step passed at least once and every step after `frame` passed on every run that reached it:
`anon-rpc` 401 `42501` for both · `seeded` · `frame-390` · both account axe steps zero violations at 1440
and 390 · `dialog-focus` (Cancel, and Escape/Cancel/backdrop each closed it) · `dialog-quiet` · `armed` ·
`request` (landed on `/restore`; `purge_after - deleted_at` = 14 days; the snapshot equal and offered) ·
`second-request` (200, `null`, deadline unmoved) · `other-user-rpc` (B's restore `false`, A untouched) ·
`door` · `restore-page` (the seeded site's title, the captured date, one Download) · `download` (303 to a
`/storage/v1/object/sign/site-snapshots/` URL whose GET returned the seeded bytes) · `download-other` 404 ·
`download-signed-out` 303 `/sign-in` · `axe-restore` · `restore` (`/?restored=1`, the green sentence, both
columns null on the profile and the snapshot) · `axe-restored` · `authed-rpc` (14 days) ·
`magic-link-during` (a fresh link for pending A landed on `/restore`) · `past-deadline` ("being deleted",
no Restore, `restore_account()` false) · `axe-past`. **`frame` failed three of four runs with `h: 0`** and
every colour, radius, weight, size and padding right — the harness measuring at `load` before the
Suspense skeleton swapped the card in (patched: it waits for the button). One run stalled at B's sign-in
(`page.goto` 60 s) and the site answered `/sign-in` in under a second straight after — the transient the
email-change harness already records. Cleanup held on every run: users 4 → 4, the bucket prefix empty,
and an independent read afterwards found no `deletion-harness-*` user, no object, and no pending profile.

| Command | Result |
|---|---|
| `pnpm check` (Node 24) | **exit 0** before and after the patches; `apps/web` 156 tests (the Dev figure), the three packages one each |
| `bash supabase/tests/run-rls-gate.sh` | **exit 0** with the widened block: `PASS (2.5)` ×5, no drift |
| `GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT}/env` with `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | **HTTP 200**; `RESEND_API_KEY` and `RESEND_FROM` listed by name, `production`, `encrypted`; nothing else changed |
| `POST $SUPABASE_URL/rest/v1/rpc/restore_account` and `…/request_account_deletion`, publishable key, no bearer — the independent control | **HTTP 401, `42501`** for each |
| `POST $SUPABASE_URL/storage/v1/object/sign/site-snapshots/<no such key>` with `SUPABASE_SECRET_KEY` | **HTTP 400**, `{"statusCode":"404","error":"not_found","code":"NoSuchKey"}` — the route's 404 branch is read off the wire, not guessed |
| `GET https://api.vercel.com/v1/projects/{id}/deployments/{dpl}/runtime-logs` | **did not answer** from this machine (no headers after 60 s, twice) — the `deletion: email sent { id }` line is read in the Vercel dashboard at Deploy, step 4 below |

**Every assertion in the RLS block, seen to FAIL — seventeen breaks, one container.** A scratch script
applied the prelude and every migration once, ran `rls.sql` whole (PASS), then for each break replaced
one function body (or one grant), ran the 2.5 block alone, and restored the real migration; the block
passed again at the end. Each break tripped the line written for it:

| The break | What failed |
|---|---|
| `request_account_deletion` returns null first | `returned null on an account with no window open` |
| `deleted_at` set to null instead of `now()` | `deleted_at was not stamped` |
| `interval '13 days'` | `purge_after (…) is not deleted_at (…) + 14 days` |
| returns `deadline + interval '1 hour'` | `the function returned … but stored …` |
| the snapshot update no longer sets `purge_after` | `A's snapshot purge_after is <NULL> and the account deadline is …` |
| `download_offered_at` no longer set | `the snapshot was never marked as offered for download (FR-J13)` |
| `purge_after = deadline` unconditionally (no `least`) — **the new control** | `a snapshot already due on … was moved to … by the deletion` |
| `deleted_at is null` dropped from the `where` | `a second call re-opened the window and returned …` |
| a second update stamping every OTHER profile | `A's deletion stamped B's profile` |
| `where user_id = auth.uid()` dropped from the snapshot update | `A's deletion stamped B's snapshot` |
| `restore_account` returns false first | `restore_account() answered false inside the window` |
| the profile update no longer clears the columns | `restore left the profile stamped` |
| the snapshot update removed | `restore left a snapshot's purge_after set (2 of them)` |
| `purge_after > now()` removed | `restore_account() answered true after the deadline had passed` |
| the snapshot update moved BEFORE the profile check | `a refused restore cleared the snapshot anyway` |
| `grant execute … restore_account() to anon` | `anon executed restore_account() and got false` |
| `grant execute … request_account_deletion() to anon` | `anon executed request_account_deletion() and got null` |

A first attempt at "stamped B's profile" dropped `user_id = auth.uid()` from the profile update and the
block failed for the WRONG reason — plpgsql refuses `RETURNING … INTO` over two rows — so it was
replaced by the second statement above; a control that fails for another reason is not a control.

**The patched harness against the UNPATCHED deployment — the review's own control.** Before the patches
were pushed, the harness with its five new steps ran once more against the Dev code still live on
`3caaa7a9`: **`rearm` FAILED** — `reopened after Cancel: aria-disabled=null, field holds "delete my
account"` — which is the defect itself, executed; **`sentence` FAILED** (`the dialog says ""`: the body
sentence had no id to read yet); and every other step PASSED, `frame` now at `h: 34` behind the wait,
`server-phrase` answering `wrong_phrase` to the forged POST with no redirect, `restore-signed-out` a
307 to `/sign-in`, `restore-clean` landing on `/`. Users 4 → 4, the prefix empty. The same harness
against the patched deployment is the paragraph below.

**The patched harness against the PATCHED deployment.** The review commit `0486e4ac` went through CI
(`check`, `rls` and `deploy` all green — read from the Actions API by `GITHUB_TOKEN`) and Vercel's
production deployment `dpl_9omK8yBjgRXA46Z8BjtBvdeXZta6` reached READY on it (read by `VERCEL_TOKEN`).
The harness then ran once against it: **every step PASSED** — the twenty-four the Dev run named and
the five the review added — `RESULT: all steps passed`, exit 0. The two controls turned: `sentence`
read `"Your 1 project, its full version history will be permanently deleted in 14 days. …"` with no
asset clause, and `rearm` read `aria-disabled="true", field holds ""` after Cancel. `frame` measured
`h: 34` with every token right; `server-phrase` answered `wrong_phrase` to the forged POST; the
download's 303 led to a signed URL whose GET returned the seeded bytes. Users 4 → 4, the object
deleted before the users, the prefix listing 0. The Deploy run's step 3 is therefore already
executed once on the code that will be deployed; step 4 — the Resend id in the deployment's log — is
the Deploy run's, and the owner's step 5 is the inbox.

### What the Deploy run must do, in this order

1. ~~Apply the migration to the live database.~~ **DONE — the owner ran it in the Supabase SQL
   editor on 2026-09-07**, and the block above is the proof it behaves.
2. ~~Re-run the anon control.~~ **DONE — HTTP 401 `42501` for both.**
3. `python3 tools/probe/run-verify-account-deletion.py` against `app.inflozo.com` — every step PASS
   or RECORD, in the order the harness's docstring lists them (the review added `sentence`, `rearm`,
   `server-phrase`, `restore-signed-out` and `restore-clean`), then cleanup (the object deleted
   before the users, the prefix listed empty, the user count unchanged). `--to <an inbox you can
   open>` if the send is to be seen as well as logged.
4. Read the deployment's log in the Vercel dashboard for `deletion: email sent { id }` with a Resend
   id — the hand-off, and the whole of what this repository can see. `email: not configured` there
   means the `RESEND_*` variables did not reach the deployment; `deletion: email failed { status,
   reason }` carries Resend's own refusal.

**Manual check (no CLI can make it).** Delivery is the owner's manual test step 5 (DW-22, a third
time): `RESEND_API_KEY` is send-only, so no key here can look in an inbox.

### Deploy run, 2026-09-07

`Deployment: dpl_AZuHyjfEfBeYG1a8ahy1YfG7Pt4t` (`inflozo-gmydasz7x-umangkagathara.vercel.app`) — the
CI run for `159f5e31` (`git log` HEAD, no app-code change since the review's `0486e4ac`) completed
`success` (`GET /repos/Inflozo/inflozo/actions/runs?head_sha=159f5e31…` with `GITHUB_TOKEN`), so
`deploy` ran; `GET /v6/deployments` with `VERCEL_TOKEN` and `VERCEL_TEAM_ID` shows it `READY` for
`VERCEL_PROJECT`'s `production` target, and `GET /v13/deployments/{id}` shows its `alias` carrying
`app.inflozo.com` and `inflozo.com`. The migration, the RLS gate, the harness against
`app.inflozo.com`, and the Resend-log read are already executed above under the review run — the same
code is what this deployment now serves, so nothing there needed re-running. The owner's manual test
below is the one thing this run leaves open.

## Owner's manual test

On the live site, after the Deploy run. **Use a throwaway account** — sign in with an address you can
read but do not use for Inflozo, e.g. `yourname+delete-test@…` — so nothing of yours is at stake, and
finish with step 8 anyway, because Story 2.6 will purge whatever is still pending on its date.

1. **URL:** https://app.inflozo.com/sign-in · **Screen:** Sign in · **Do:** sign in with the throwaway
   address · **See:** the dashboard, empty (a new account).
2. **URL:** https://app.inflozo.com/account · **Screen:** Account & Billing · **Do:** scroll under the
   Sessions card · **See:** a **Danger zone** card with a faint red border, the red **DANGER ZONE** label,
   the row "Delete account — Removes every project, version and asset. Your live Ghost sites stay up —
   we never touch them." and, at its right end, a white button with red text **Delete account**.
3. **Do:** press **Delete account** · **See:** a window: a warning triangle in a pale red disc, "Delete
   your account?", the sentence "Everything in your account will be permanently deleted in 14 days. Your
   live Ghost sites stay online. Until then, signing in restores everything — after that, it cannot be
   undone.", a line "Type **delete my account** to confirm" over an empty field, then **Cancel** and a
   red **Delete account** drawn half-faded. Press the **space bar** once — Cancel has the focus, though
   its ring shows only when the window was opened from the keyboard · **See:** the window closes and
   nothing else happens. (Escape, Cancel and a click on the grey area do the same.)
4. **Do:** open it again; type `delete my acc` and press Enter · **See:** nothing happens and the red
   button is still faded. Finish typing `delete my account` · **See:** the red button turns solid.
   Press it · **See:** "Deleting…" for a moment, then a page headed **Your account is set to be deleted**
   with the sentence naming a date **14 days from today**, a **Restore account** button and a **Sign out**
   button. No "Your original themes" list — this account has no connected site, so there is nothing to
   download (the automated harness proves that list with a seeded snapshot).
5. **Where:** the throwaway inbox · **See:** one email from Inflozo, subject "Your Inflozo account will
   be deleted on <that date>", with the same date in its first sentence, a **Restore my account**
   button, and the line "This is the only email we'll send about this." **If it did not arrive within a
   few minutes, say so** — only you can see this (DW-22), and it becomes this story's first finding.
6. **URL:** https://app.inflozo.com/ and then https://app.inflozo.com/account · **See:** each lands
   straight back on the deletion page — the rest of the app is closed while the countdown runs.
7. **Do:** press **Sign out** on that page · **See:** the sign-in page with "You've been signed out."
   Sign in again with the throwaway address · **See:** the deletion page again, same date — the
   countdown survives signing out.
8. **Do:** press **Restore account** · **See:** "Restoring…", then the dashboard with the green banner
   "Welcome back. Your account is restored — nothing was deleted." Open https://app.inflozo.com/account ·
   **See:** the Danger zone card back to step 2's state. The throwaway account can then be left, or
   deleted for real by repeating steps 3–4 — 2.6 will remove it on the date.
