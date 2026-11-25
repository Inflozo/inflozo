---
title: 'Story 7.22 — Artifacts, retention and pinning'
type: 'feature'
created: '2026-11-25'
status: 'in-review'
baseline_commit: '0c8f8da48f4b331c075191eb832bf4f93abe7a14'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md', '{project-root}/_bmad-output/implementation-artifacts/spec-7-21-pre-deploy-drift-detection.md']
---

## In plain English

After this story the editor has a **History** button — a clock just left of **Ship it**, and a **History** row in Ship it's ▾
menu — that opens a panel listing every version of your theme Inflozo still keeps, newest first, with its number, when it was
built, its check result and which one is live. Pro keeps your last 10 versions and Free your last 3, the panel says so in one
line, and when you ship past that limit the oldest version you have not pinned simply disappears from the list instead of
staying behind as a greyed row. You can pin the versions you want to keep (up to 9 on Pro, 2 on Free) and unpin any of them
at any time, and if you try to pin one too many a small yellow note says one version has to stay unpinned so your next deploy
has somewhere to go.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every Pre-flight stores a theme zip in `deploy-artifacts`, and nothing ever removes one:
- storage grows without bound;
- there is no history to see and no way to pin a version;
- a deploy's number counts rows (DW-372), which any pruning would break;
- zips that nothing can ever ship stay for good (DW-374, DW-380);
- a very large live theme fails the Pre-flight that finds its drift (DW-396).

`deploys.pinned` and its trigger exist since Story 1.2, and nothing uses them.

**Approach:**
- **A version** is an upload Ghost accepted (`deploys.status` `uploaded` or `live`) whose zip is still stored.
- **Prune when a version arrives.** Once Ghost accepts an upload, the project's versions beyond its plan's limit lose their
  zip. Pinned versions and the newest are never pruned. The row stays (its pointer cleared), so the drift baseline's manifest
  and the version numbers survive.
- **Pin in the database.** One SQL function counts and pins in one step, refusing at N−1, with the number the server hands it
  from the plan resolver. Unpinning is a plain update. It replaces `guard_pin_leaves_a_slot()`, pushed first as `Schema`
  (R-99).
- **The History drawer.** S8e's drawer with D2a's compact rows, a pin on each, D2b's refusal and the limit line. It opens from
  the bar's clock icon and from Ship it ▾ → History.
- **A daily sweep.** `api/cron/prune-artifacts` is AD-33's artifact-retention job. It runs the same prune for every project
  and drops the zips nothing can ship (DW-374, DW-380).
- **The next version is the highest plus one** (DW-372).
- **DW-396.** A live copy past the store's size is not kept, and D3a is drawn without its Download.

**Frame (R-74):** `D2 Deploy History Completed.dc.html`:
- D2a `:28-156`: the drawer header `:53`, the compact row `:101-150` (pinned: `:129-136`), the footer line `:152`;
- D2b `:158-186`: the refusal, its sentence `:180`, Got it `:181`;
- D2c `:209-287`: Free, the same drawer with the limit line shown (`:283`).

The drawer itself is `S8 Deploy.dc.html` S8e `:264-350`: 420 wide at the right edge below the 48px bar, over a scrim, opened
by the bar's clock icon. **Story 7.23 draws the rest of D2:** the expanded rows (thumbnail, Changed line, by-line, Roll back),
the original-theme row, D2d's Re-activate row and S8e's Roll back confirm.

**The epic's criteria, word for word (R-195):**
- **Given** a successful compile, **when** the artifact is stored, **then** the zip goes to a `deploy-artifacts` bucket,
  **excluded from the user's asset quota**, retained **last 10 per project on Pro and last 3 on Free**.
- **The limit is stated, not implied**: the count is printed on both plans, alongside the reason it is a real bound — **these
  artifacts are not regenerable**, because rebuilding an old design against today's library produces a different theme, which
  is why rollback replays a stored file rather than recompiling.
- **The history never shows a version it cannot restore**: a pruned artifact is **absent from the list, never a greyed row
  with a dead Restore button**.
- **At most N−1 versions may be pinned** — 9 of 10 on Pro, 2 of 3 on Free — **enforced in the database**, so deploying can
  never be blocked by pinning.
- The pin control therefore needs a **visible refusal with its reason** rather than a silent failure, and **unpinning is
  always allowed by design**, so nobody can trap themselves.
- **Pinned versions count against the same total.**
- **The pre-Inflozo snapshot is outside this count entirely** and is listed as the site's original theme rather than as a
  version.
- Artifacts are **immutable** (NFR-4), and durability is stated per store — **Storage is not Postgres** (AD-29).
- *(given an owner by Story 7.18a's Review, 2026-10-19)* A deploy's version stays "the next number" once old deploys are
  pruned: Story 7.18a counts this project's uploaded and live deploys plus one, which pruning stops and a deploy failed after
  Ghost took it skips, so the number becomes the highest stored version plus one, read from a record retention never deletes
  (DW-372).
- *(given an owner by Story 7.18b's Review, 2026-10-19)* A stored zip nothing can ship is pruned too: a Ship it Story 7.18b
  refused because the project's site changed (DW-374) marks its deploy failed and keeps the zip, and a check left resting on
  the old site after a switch keeps its own (DW-380).
- *(given an owner by Story 7.21's Dev, 2026-11-24)* The drift check's live copy (`deploy-artifacts/{projectId}/live/
  {siteId}.zip`, one per project × site, overwritten by each found drift) is **outside this count**, like the pre-Inflozo
  snapshot, and is never listed as a version; and pruning **never removes the drift baseline's `content_manifest`** — the
  newest upload Ghost accepted from this project to each site (R-287) — or the next check would compare the site with an older
  upload and report Inflozo's own changes as drift.
- *(given an owner by Story 7.21's Review, 2026-11-24)* A live theme past the size the buckets keep never fails the Pre-flight
  that found its drift: the live copy is not kept, and D3a is drawn without its Download (DW-396).

## Boundaries & Constraints

**Always:**
- **One definition of a version.** A stored version is a `deploys` row with status `uploaded` or `live` and `artifact_path`
  not null. The list, the count, the pin cap and the prune all read it: `isStoredVersion` in `lib/retention.ts`, and the same
  predicate inside `pin_version`.
- **The rule** (`lib/retention.ts`, pure):
  - per **project**, across every site;
  - newest first by `created_at`;
  - keep every pinned version, plus the newest `max(1, cap − pinned)` unpinned ones; everything else is prunable.
  - `cap` is `PLANS[plan].history`, the plan read through `plan.ts` alone (AD-28): `resolveEntitlement` in a request,
    `readEntitlement(supabaseAdmin(), userId)` in a job.
- **Pruning clears the pointer first, then removes the object.** The clear is conditional: `artifact_path` and
  `artifact_bytes` go null only where `pinned = false` and `artifact_path` still names that object. Only a row the update
  changed has its object removed. The row stays, with its `content_manifest` (the drift baseline, R-287), `version` and
  verdicts. Design Notes say why the order differs from AD-32's.
- **Prune after an accepted upload, best effort.** It runs in `ship()` once the row is first written `uploaded` or `live`. A
  failure is logged by code and never fails the job; the sweep retries it.
- **The cap is enforced in the database** (FR-J7) **with the number the server hands it** (AD-28).
  `pin_version(p_deploy, p_user, p_cap)`:
  - serializes per project and counts that project's pinned stored versions;
  - answers `cap` at `p_cap − 1` and changes nothing;
  - answers `gone` for a row that is not one of this user's stored versions;
  - otherwise pins it and answers `pinned`.

  Only the service role may execute it. Unpinning is a plain update and is never refused.
- **The next version** is 1 + the highest `versionNumber` among this project × site's `uploaded`/`live` rows. It is one
  function, `nextVersion` in `lib/deploy.ts`, read by both `project-input.ts` and `shipStateOf`.
- **Versions are immutable** (NFR-4). An artefact's put never overwrites (`upsert: false`). The drift live copy, one fixed key,
  is the only object that overwrites.
- **Outside the count, never listed:** the drift live copy (`live/`) and `site-snapshots`. The sweep touches only objects a
  `deploys` row names.
- **Never in a quota.** Artefact bytes are never summed into any quota; FR-K3 meters `assets.stored_bytes`.
- **The pin is a history control**, like 7.23's Roll back. It needs no edit lock, and it stays live in a read-only editor
  (R-192's view-control side).
- R-98: the pin's busy label with `aria-busy` + `aria-disabled`, and the drawer's loading rows drawn in its own shape.
- UX-DR6: an empty drawer says "Nothing shipped yet" and still states the limit.
- UX-DR12: each pin outcome is said once, politely.
- **Every word lives in one list**, `HISTORY_WORDS`. Its numbers come from `PLANS`, never typed.

**Ask First:**
- **Every production write and every T1 write needs the owner's in-session go**, asked in R-83's shape and run in the main
  session, never by a subagent. That covers:
  - the migration's apply (R-99, `SUPABASE_DB_POOLER_URL`);
  - the Storage checks;
  - walk step 120;
  - the cron's run on production;
  - Deploy's plants.

  Word each ask for the run's whole set of writes.
- Setting `LIVE_COPY_MAX_BYTES` above the limit read at Dev, or a store whose limit cannot be read.
- Any change to the rule's numbers or to `PLANS.history`.

**Never:**
- Delete a `deploys` row for retention (`clear()`'s abandon of a non-version stays as it is), or null a `content_manifest`.
- Prune any of these:
  - a pinned version;
  - the newest version;
  - the zip of a job resting at `awaiting_ship` on the project's linked site;
  - anything under `live/`.
- Recompile to restore, grey a pruned row, or list a version whose zip is gone.
- Read `entitlements` in SQL, or decide a plan outside `plan.ts` (AD-28).
- Build what belongs to other stories:
  - Story 7.23: Roll back, Restore original, Re-activate, the expanded rows, the Roll back confirm and the phone card;
  - Story 12.4 (DW-399): the downgrade's "kept, no new ones retained";
  - Story 7.25: deploy rate limits and the upload's advisory lock.
- Add a cron beyond AD-33's set. Artifact retention is one of its named jobs.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First version | no stored versions; Ghost accepts v1 | v1 stored; nothing pruned | N/A |
| Under the cap | Free, 2 stored; v3 accepted | 3 stored; nothing pruned | N/A |
| Over the cap | Free, v1–v3 unpinned; v4 accepted | v1's pointer null, then its object removed; row kept; drawer v4 v3 v2 | prune failure logged; job still `done`; the sweep retries |
| Pinned survive | Free, v1 pinned, v2, v3; v4 accepted | v2 pruned; v1 v3 v4 kept | N/A |
| Pinned ≥ cap | only after a plan change: pinned ≥ cap | every pinned kept + the newest unpinned; the rest pruned (12.4 refines, DW-399) | N/A |
| Number after pruning | pruned rows v1–v3 kept; v4–v6 stored | the next is v7 (`nextVersion`) | N/A |
| Two sites | the project's versions on A and B | one count per project; the drawer lists both; A's rows say "on a.com" | N/A |
| Pin under cap | Free, 3 stored, 1 pinned; pin one | `pinned` (2 = N−1) | N/A |
| Pin at cap | Free, 3 stored, 2 pinned; pin the third | `cap` → 409; D2b on that pin; pin unfilled | N/A |
| Pin a lone version | Free, 1 stored | `pinned` (the retired floor refused this) | N/A |
| Two tabs at once | both pin the last allowed slot | one `pinned`, the other `cap` | N/A |
| Pin what is gone | pointer null, status not uploaded/live, or not the user's | `gone` → 404; the drawer re-reads; the row is absent; its sentence said | N/A |
| Unpin | any pinned row of the user's | unpinned, never refused | N/A |
| Pin meets prune | a pin lands while a prune runs | pinned and kept, or pruned and `gone` — never pinned without its object | N/A |
| Sweep: old site (DW-380) | a job resting at `awaiting_ship` on a site that is not the project's link (or none) | abandoned as `start()` does: object, row, job `cancelled` | the route answers 500 when any step failed |
| Sweep: dead zip (DW-374) | a non-version row with an object, older than a day, no job resting on it | object removed, pointer null, row kept | as above |
| Sweep: control | a check resting on the linked site; any `live/` object | untouched | N/A |
| Sweep: versions | a project over its cap (a prune that failed) | pruned by the same rule | as above |
| Baseline after prune | the newest accepted upload's zip pruned | its `content_manifest` intact; the next drift check compares with it | N/A |
| DW-396 | drift found; live zip past `LIVE_COPY_MAX_BYTES` | no live copy put; record `found` with `kept: false`; D3a without Download; the Pre-flight goes on | N/A |
| Immutable | a put to an existing artefact path | the store refuses (`upsert: false`); only `live/` overwrites | infrastructure, as today |
| Empty | drawer opened, nothing shipped | "Nothing shipped yet" + the limit line | N/A |
| Read fails | the drawer's GET fails | one sentence where the rows go; closing and reopening asks again | logged by code |
| Pin request fails | network or 5xx | the pin unchanged; one sentence in the live region | logged by code |

</frozen-after-approval>

## Code Map

- `supabase/migrations/20260904120000_complete_schema.sql` -- frozen (applied):
  - `deploys` `:427-462` (`pinned` and its comment `:450-456`, `artifact_path` `:437`);
  - the floor being retired `:1263-1290`;
  - the revoke list `:1425-1440`.

  A new migration replaces the floor. The living schema is the architecture `SCHEMA.sql`, edited in place (Story 7.20b's
  Schema commit `de69ef1c` is the pattern).
- `supabase/tests/rls.sql` -- byte-identical to the architecture `RLS-TEST.sql` (`run-rls-gate.sh:42` guards it):
  - the FR-J7 block `:890-918`;
  - the guard list `:526`;
  - the column grants `:604`;
  - the trigger catalogue `:653`.
- `apps/web/lib/plan.ts:24-37` -- `Caps.history`, `PLANS` (3 / 10); `readEntitlement` `:55` takes any client.
- `apps/web/lib/entitlement.ts:34` -- `resolveEntitlement`, a request's one plan read.
- `apps/web/lib/deploy.ts`:
  - `versionOf` `:110`, `versionLabel` `:112`, `ARTIFACT_BUCKET` `:114`, `versionNumber` `:116`;
  - `shipStateOf` `:787` (`n: rows.length + 1`, near `:855`).
- `apps/web/server/deploy/project-input.ts:112,154-157` -- the pair's `uploaded`/`live` rows, and `n = uploads.length + 1`
  (DW-372).
- `apps/web/server/deploy/run.ts`:
  - `DeployIo.artifacts` `:117-121`;
  - `twice` `:179`;
  - `clear` `:286-295`, the abandon the sweep reuses;
  - `start` `:493`;
  - the artefact's put `:411-415`;
  - `driftStep`'s live-copy put `:485`;
  - `ship`'s accepted paths `:628-643`, where the row goes `uploaded` at `:642`;
  - `goLive` `:704`, where the row goes `live`.
- `apps/web/server/deploy/deploy-io.ts` -- `artifacts.put` `:119` (`upsert: true` on every put today), `deploys.baseline`
  `:103`, `BUCKET`.
- `apps/web/lib/drift.ts` -- `DriftRecord` `:39-43`, `liveCopyPath` `:244`. `server/deploy/zip.ts:84` `LIVE_MAX_BYTES` is the
  UNPACKED cap; the new keep-cap is separate.
- `apps/web/components/editor/deploy-wizard.tsx`:
  - `ShipButton` and its menu `:136-160` (the header comment says "History ABSENT until 7.23");
  - D3a's `#deploy-drift-download` `:1415`.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx:6003-6024` -- the bar's right cluster: ⋯ shows when
  `compact`, and `ShipButton` sits at every width.
- `apps/web/app/(app)/app/(authed)/projects/[id]/deploy/route.ts` -- the door pattern: `force-dynamic`, `currentUser()`,
  `isUuid`, `no-store`, and plain-text refusals.
- The cron pattern:
  - `apps/web/app/api/cron/purge-snapshots/route.ts`: `authorized()`, the budget, a 500 when anything failed;
  - `apps/web/lib/orphan-rule.ts`: the pure loop under `node --test`;
  - `apps/web/vercel.json`: crons at 3:15, 4:30 and 5:40.
- `apps/web/components/kit/dialog.ts` -- the dialog vocabulary and `openOnCancel` `:68`. Also `kit/badge.tsx`, `kit/banner.tsx`
  (the marigold notice) and `kit/tooltip.tsx`.
- `apps/web/app/(app)/app/harness/editor/layout.tsx` -- the harness's shapes by header (`x-inflozo-harness-drift` `:159`).
- `apps/web/server-wiring.test.ts`, `apps/web/busy.test.ts` -- the service-role and chokepoint lists, and R-98's tree walk.
- `tools/keyboard/journey.spec.mjs` (pointer-free below its sentinel; 7.21's block starts `:10725`) and
  `tools/keyboard/floor.spec.mjs`.
- `tools/probe/run-verify-editor.cjs` -- the deployed walk; its last step is 119 (`:14235`).

## Tasks & Acceptance

**Execution:**

*Schema — its own push, first (R-99):*
- [x] `supabase/migrations/20261125120000_pin_version.sql` -- create it:
  - drop the trigger `deploys_pin_leaves_a_slot` and the function `guard_pin_leaves_a_slot()`;
  - create `public.pin_version(p_deploy uuid, p_user uuid, p_cap int) returns text`, with `search_path` fixed and the project
    serialized by `pg_advisory_xact_lock` on its id, returning `'pinned' | 'cap' | 'gone'` as Always states;
  - revoke execute from `public`, `anon` and `authenticated`;
  - restate `comment on column deploys.pinned`.

  -- FR-J7's "in the database" with AD-28's number.
- [x] architecture `SCHEMA.sql` -- the same change, in place. The function joins the revoke list.
- [x] architecture `RLS-TEST.sql` → copied byte for byte to `supabase/tests/rls.sql` -- rewrite the FR-J7 block. It asserts
  that:
  - a pin under the cap answers `pinned`;
  - at `cap − 1` it answers `cap` and changes nothing;
  - a lone version under cap 3 answers `pinned` (the retired floor's false refusal, now the control);
  - unpinning always works;
  - a row with a null pointer, or another user's row, answers `gone`;
  - `authenticated` gets 42501 on execute.

  Update the catalogue lists at `:526` and `:653`.

*Server:*
- [x] `apps/web/lib/retention.ts` (new, pure) -- `isStoredVersion`, `prunable(versions, cap)`, `HISTORY_WORDS` (every drawer
  word, the limit line built from `PLANS`, "Nothing shipped yet", D2b's sentence and Got it, the pin labels, their busy and
  said forms, "on {host}"), and the time label.
- [x] `apps/web/lib/deploy.ts` -- `nextVersion(rows)`. `shipStateOf`'s `n` reads it.
- [x] `apps/web/server/deploy/project-input.ts` -- `n = nextVersion(uploads)`.
- [x] `apps/web/server/retention.ts` + `server/retention-io.ts` (new) -- `pruneProject({ projectId, userId }, io)`:
  - reads the cap through `readEntitlement` and the project's stored versions;
  - runs `prunable`;
  - clears each pointer conditionally, then removes each object it cleared;
  - returns what it did.

  The io joins `server-wiring.test.ts`' lists. This is the `snapshot.ts`/`snapshot-io.ts` split.
- [x] `apps/web/server/deploy/run.ts`, `deploy-io.ts`:
  - add `DeployIo.prune`, called best effort right after the row is first written `uploaded` or `live`;
  - `artifacts.put(path, bytes, { replace })`, with `replace` passed for the live copy alone;
  - `driftStep` skips the put past `LIVE_COPY_MAX_BYTES` and records `kept: false`;
  - export `abandon` (`start()`'s `clear` with no clock).
- [x] `apps/web/lib/drift.ts` -- `DriftRecord`'s `found` gains `kept?: false`. Add `LIVE_COPY_MAX_BYTES`, its value and its
  source (Dev's read) in a comment.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/history/route.ts` (new):
  - GET: the project's stored versions with each one's site host and the project's linked site, newest first, through the
    user's session (RLS);
  - POST `{ deploy, pinned }`: `currentUser`, `isUuid`, then `resolveEntitlement` → `pin_version` with `caps.history` (409 on
    `cap`, 404 on `gone`); an unpin is the service role's update scoped by `user_id` and `project_id`;
  - `no-store` on every answer.
- [x] `apps/web/lib/artifact-sweep.ts` (new, pure loop) and `apps/web/app/api/cron/prune-artifacts/route.ts` (new) -- three
  passes, in order:
  1. DW-380's resting jobs are abandoned;
  2. DW-374's dead zips are dropped;
  3. each project is pruned.

  Use the purge routes' door and budget, and answer 500 when anything failed. The header names E7, FR-J7 and AD-33.
- [x] `apps/web/vercel.json` -- schedule `/api/cron/prune-artifacts` daily at `50 4 * * *` (moved to `50 6 * * *` at the Review:
  an hour of its own, Story 3.7's rule).

*UI:*
- [x] `apps/web/components/editor/deploy-history.tsx` (new) -- the drawer:
  - a `<dialog>` opened with `showModal`, S8e's 420 right drawer below the bar, focus opening on ✕ (`openOnCancel`), Esc
    closing it and focus returning to the opener;
  - loading rows in the compact row's shape;
  - the empty state;
  - compact rows: version chip, the Live badge (from `:78`), the PINNED tag and marigold wash, the gscan `errors · warnings`
    chip, the time, and "on {host}" when the row's site is not the linked one;
  - the pin: a toggle with `aria-pressed` and its busy form;
  - D2b's popover on `cap`: focus on Got it; Got it or Esc returns focus to the pin; the pin stays unfilled;
  - one polite live region;
  - the footer limit line.
- [x] `apps/web/components/editor/deploy-wizard.tsx`:
  - `ShipButton`'s menu gains **History** at every width;
  - D3a omits `#deploy-drift-download` when `kept === false`;
  - correct the header comment.
- [x] `editor.tsx` -- the clock `IconButton` `#deploy-history-open` (label and title "History") just before `ShipButton`,
  `hidden={compact}`, and mount the drawer.
- [x] Harness `layout.tsx`/`actions.ts`:
  - `x-inflozo-harness-history: empty | free | free-full | pro-full | two-sites | fail`;
  - `x-inflozo-harness-drift: found-unkept`.

*Tests* (each assertion seen red under a planted reversion):
- [x] `lib/retention.test.ts`, `server/retention.test.ts`, `lib/artifact-sweep.test.ts`, `deploy-run.test.ts`,
  `deploy.test.ts`, `drift.test.ts`, `busy.test.ts`, `server-wiring.test.ts` -- every row of the I/O matrix.
- [x] `tools/keyboard/journey.spec.mjs` -- the 7.22 journeys:
  - (a) the clock opens the drawer, focus on ✕, Esc returns it;
  - (b) Space pins and unpins, said once;
  - (c) `cap` opens D2b, focus on Got it, returning to an unfilled pin;
  - (d) Ship it ▾ → History;
  - (e) the empty state with the limit;
  - (f) D3a without Download.

  `floor.spec.mjs` covers the drawer at 1440 and 820: the clock is absent where the bar is compact, and the menu row is
  present.
- [x] `tools/probe/run-verify-editor.cjs` step 120 -- the Verification's real-infra run.

*Propagation* (standing rules 3 and 7; end with a grep for `guard_pin_leaves_a_slot` and `uploads.length + 1`):
- [x] Planning documents:
  - FR-J7: a dated note;
  - AD-29 and AD-33: "built" notes naming the cron and the inline prune;
  - MEASUREMENTS §26c: the reading, and the retired floor;
  - EXPERIENCE F8 rule 3: one slot, N−1;
  - `epics.md` Story 7.23: the drawer is 7.22's, 7.23 adds the expanded rows and actions; a rollback row that shares an object
    with an older row prunes by object; another site's rows; the full S8e tooltip;
  - `epics.md` Stories 12.2 and 12.4: DW-399.
- [x] `deferred-work.md` -- resolve DW-372, DW-374's zip, DW-380 and DW-396, and open DW-399 (owner: Story 12.4, before 12.2
  lets an account fall to Free).

**Acceptance Criteria:**
- **The drawer matches the frame.** Given the editor at 1440, when the clock icon or Ship it ▾ → History is pressed, then the
  drawer matches S8e's drawer (`:264-350`) and D2a/D2c's header, compact rows, pinned row and footer (`:53`, `:101-152`,
  `:283`), and a refused pin matches D2b (`:163-186`).
- **The list is exactly what is kept.** Given a project with stored versions, when the drawer opens, then it lists exactly the
  project's stored versions on every site, newest first, and never a row whose zip is gone.
- **The limit is printed.** Given either plan, the empty state included, when the drawer shows, then its last line prints both
  plans' numbers from `PLANS` and the reason they are a real bound.
- **Prune on arrival.** Given Ghost accepts an upload that takes the project past its cap, when the ship ends, then the oldest
  unpinned versions beyond the cap have no object and a null pointer, their rows remain, and the drawer no longer lists them.
  A failed prune leaves the job `done`.
- **The refusal.** Given pinned = cap − 1, when another version is pinned, then the function answers `cap`, the route answers
  409, and D2b opens on that pin with focus on Got it. Unpinning any row succeeds.
- **Busy.** Given a pin press, while its request is out, then the control carries its present-tense label, `aria-busy` and
  `aria-disabled`, and the outcome is said once, politely (R-98, UX-DR12).
- **The number goes on.** Given versions were pruned, when the next Pre-flight runs, then its version is the highest
  `uploaded`/`live` number plus one, in the wizard's caption and in the theme's `package.json`.
- **The baseline survives.** Given the drift baseline's zip was pruned, when the next Pre-flight runs on an untouched site,
  then D3c passes against that baseline's manifest.
- **DW-396.** Given a found drift whose live zip is past `LIVE_COPY_MAX_BYTES`, then the Pre-flight is not failed, no live copy
  is written, and D3a has no Download.
- **The sweep.** Given `prune-artifacts` is called with `CRON_SECRET`, then the three passes act as the matrix says, and the
  controls (a check resting on the linked site, `live/`) are untouched. Without the secret it answers 401.
- **One deleter.** Given the finished code, then no code path but `pruneProject`, the sweep and `clear()` removes a
  `deploy-artifacts` object, and none sums artefact bytes into a quota (grep in Verification).

### Review Findings

Story 7.22's Review, 2026-11-25: five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, the read-only
Real-infra verifier), and walk step 120 on production and T1 on the owner's in-session go. Every patch below is applied, two items
are deferred to the stories that own them (DW-399's note, DW-400), and the rest are dismissed as noise or as the spec's own choices.
No decision was left for the owner.

- [x] [Review][Patch] **The nightly sweep could delete the zip of a Ship it under way.** Pass 2 kept only the zips of jobs resting
  at `awaiting_ship`, but `ship()` reads its zip AFTER leaving `awaiting_ship` (`snapshotting`, `uploading`, a stale re-make) while
  the row stays a non-version until Ghost accepts it — so a day-old check shipped at the sweep's hour would fail as ours, or go
  live with no stored zip. Every job not at rest (`MOVING` + `awaiting_ship`) now holds its zip; the source test turns red on the
  old predicate, and walk step 120d gains the control on production (a day-old check's job at `uploading` keeps its zip)
  [`api/cron/prune-artifacts/route.ts` `dead`, `artifact-sweep.test.ts`, `run-verify-editor.cjs`] — all four reading layers
- [x] [Review][Patch] **The sweep's cross-account reads were one bare request each**, and production's Data API answers at most
  `max_rows` = **1000** rows (read now through the Management API's `GET /v1/projects/{ref}/postgrest`): past it, a resting
  check's zip would go unprotected and pass 3 would skip projects. Every read now pages in a stable order until an EMPTY page; the
  source test turns red on a short-page stop or a bare read [`route.ts` `collect`]
- [x] [Review][Patch] Passes 1 and 2 read 200 oldest rows and skipped the protected ones in memory, so about 200 idle checks on
  linked sites would fill every night's batch for good (DW-47's head-of-queue starvation); `collect` pages past the skipped rows
  until a batch is found [`route.ts` `resting`, `dead`]
- [x] [Review][Patch] Pass 1 abandoned a stranded check from a read made at the pass's start: a re-link and a Ship it meanwhile would
  lose its row and zip mid-ship. It now claims the job off `awaiting_ship` first (`ship()`'s own claim is conditional the same
  way) and skips one claimed since, uncounted [`route.ts` `abandon`, `lib/artifact-sweep.ts`, `artifact-sweep.test.ts`]
- [x] [Review][Patch] An irreversible delete left no line: a dropped zip, a project's pruned versions and the inline prune now each
  log their ids [`lib/artifact-sweep.ts`, `run.ts` `pruneAfter`]
- [x] [Review][Patch] **The schedule.** `50 4` shared the orphan purge's hour against Story 3.7's "a different hour so the two never
  share a cold start", and Dev loosened `purge.test.ts` to fit — two approved decisions disagreeing (standing rule 6). The job now
  runs at `50 6`, an hour of its own, and the test holds both the hour and the gap; its gap read a same-minute pair as a whole day
  (`|| 24 * 60`), which is gone [`vercel.json`, `purge.test.ts`; AD-33's note, DW-374/380's ledger line, the epic context]
- [x] [Review][Patch] AD-29's note and the cron's header said nothing but the prune, the sweep and `clear()` removes a
  `deploy-artifacts` object; FR-A5's account purge drains a deleted account's prefix and 7.18a's stale re-make removes a check's own
  zip [`ARCHITECTURE-SPINE.md` AD-29, `route.ts`]
- [x] [Review][Patch] "Two tabs at once" had no lasting check: deleting `pin_version`'s lock turned no gate red, and MEASUREMENTS
  §26 credited the RLS gate with the race. The gate now holds that the body takes the project's lock before it counts (control: the
  lock withheld from the migration and SCHEMA.sql → exit 3 at that line), and §26 says the race was executed once, at Schema
  [`RLS-TEST.sql` → `rls.sql`, `MEASUREMENTS.md` §26]
- [x] [Review][Patch] The "pin meets prune" row was proven over a fake clear only; a source test now holds the real clear's every
  condition (this user's, unpinned, still a stored version, still naming this object) — red with `pinned` or the path dropped
  [`retention.test.ts`, `server/retention-io.ts`]
- [x] [Review][Patch] `compileInputOf`'s test could not tell `nextVersion` from counting rows (1.0.0 and 2.0.0 give 3 either way);
  its fixture now skips numbers (1.0.0, 5.0.0 → 6.0.0) and the old count turns it red [`deploy-input.test.ts`]
- [x] [Review][Patch] `deploy` and `history` had only the refusal loop's line; both now get the non-canvas assertions `lock` and
  `routes` get, and `lib/editor.ts`' "like the three above" is corrected [`editor.test.ts`, `lib/editor.ts`]
- [x] [Review][Patch] On a touch screen the bar is 56px (`coarse:h-14`) and the drawer sat at 48, over the bar's last 8px; it now
  sits below the bar there too [`deploy-history.tsx`]
- [x] [Review][Patch] D2b's note used `shadow-lg` (.14); the frame draws `0 12px 40px rgba(28,27,26,.2)` (`:177`), now the token
  `shadow-popover`, recorded in DESIGN.md [`deploy-history.tsx`, `globals.css`, `DESIGN.md`]
- [x] [Review][Patch] Two sites can each hold a v2, and both pins were named "Pin v2"; a pin on another site's row now carries
  its "on {host}" in its name (journey: the two-sites drawer, the linked row's pin as the control) [`deploy-history.tsx`,
  `journey.spec.mjs`]
- [x] [Review][Patch] The gscan chip read aloud as "0 · 2"; it now says "0 errors · 2 warnings" to a screen reader (the wizard's
  own sentence) and draws the frame's `0 · 2`, both from `HISTORY_WORDS` [`lib/retention.ts`, `deploy-history.tsx`, journey (a)]
- [x] [Review][Patch] `HISTORY_WORDS.live` was dead — the badge typed its own "Live" — so `LiveBadge` now takes its word
  (R-170) [`kit/badge.tsx`, `deploy-history.tsx`, the Kit page]
- [x] [Review][Patch] Journey (f)'s title promised a control it never ran; it now runs it (`found` draws the Download)
  [`journey.spec.mjs`]
- [x] [Review][Patch] Journey (a) restated "10" and "3"; the limit line's numbers are read from `PLANS` [`journey.spec.mjs`]
- [x] [Review][Patch] The harness's history site copied the linked site's id literal; both now read `HARNESS_SITES.linked`
  [`harness/editor/sites.ts`, `layout.tsx`, `actions.ts`]
- [x] [Review][Patch] Two live documents still stated the retired floor: the epic context's MEASUREMENTS line, and EXPERIENCE.md's
  "pinning the last unpinned version refuses" (under N−1 a Free project with two versions and one pinned may pin the second)
  [`epic-7-context.md`, `EXPERIENCE.md` F8]
- [x] [Review][Defer] A version shipped from a check made before a re-link can be pruned the moment Ghost accepts it, because the
  frozen rule orders by `created_at` (the Pre-flight's time), and the row's time label says when the check first ran
  [`lib/retention.ts` `newestFirst`] — deferred, DW-400, owner Story 7.23 (its card carries it)
- [x] [Review][Defer] After a downgrade leaves more pins than Free's cap, re-pinning an already-pinned row answers `cap`, not the
  header's `pinned` (the drawer never sends it) [`20261125120000_pin_version.sql`] — added to DW-399, owner Story 12.4

**Dismissed, each in one line:** the pin route's degraded plan read (AD-28's request rule, the spec's Always; a refusal changes
nothing and the next press asks again) · pin and unpin scoped differently by URL (the route's ponytail; always the user's own row,
and the drawer sends only its project's) · a NULL `p_cap` (service role only; the route always hands `PLANS`' number) ·
`strictPlan` reading the log (`plan.test.ts` pins one line on a failed read and none on a good one) · the prune before activation
(a few indexed reads, best effort; every step of the ship shares the same store) · an object leaked when a removal fails after its
clear (the ceiling `server/retention.ts` names) · `upsert: false` meeting its own lost put (`deploy-io.ts`' ponytail; the customer
runs the checks again) · the bar inert under the modal (✕ and Esc close it; S8e draws the bar unscrimmed) · `chipTone` beside the
wizard's inline tone (one rule, two lines) · walk step 120's and the fixtures' scenario numbers and the migration's column comment
(each fails loudly, and a change to the numbers is the spec's Ask First) · DW-396's test packing 50 MiB (7.2 s, measured; it
proves the real constant, which an injected cap would not) · SQL restating `isStoredVersion` and an empty path (SQL cannot call
the TS predicate; every path is `{projectId}/{deployId}.zip`) · `retention.ts` imported twice in the journey · the frame's bare
16px ✕ (the Kit's 28px `IconButton`, the target floor), `LiveBadge`'s 500 weight and `ResultChip`'s padding (Kit components S8
shares), D2b's lifted row and dimmed neighbour (the detail crop's emphasis; the note's own `z-10` lifts it), and no divider before
▾ → History (the Kit `Menu` has none; 7.18a's menu the same) · a live copy refused if the store's limit is lowered (the spec's
Ask First) · no phone width on the floor (R-201: the editor never mounts on a phone).

## Spec Change Log

- **2026-11-25, Schema (on the owner's in-session go, option 1 of 4).** Production never had `deploys.pinned`. The first
  apply through `SUPABASE_DB_POOLER_URL` stopped at `comment on column public.deploys.pinned` with 42703 and rolled back
  whole. A catalogue diff of production against every migration (columns, functions, triggers, policies, indexes, enums,
  constraints in `public` and `private`) found exactly three objects missing — the column, `guard_pin_leaves_a_slot()` and
  its trigger — and nothing else. The migration therefore also runs `add column if not exists pinned boolean not null
  default false` (a no-op on every database the migrations build), proven on a production-shaped container first. Applied
  and read back: production's catalogue now equals a fresh build from every migration.
- **2026-11-25, Dev's read of the store's limit (same go).** `deploy-artifacts`' `file_size_limit` is null (as on all four
  buckets), so the project's storage config governs: `fileSizeLimit` **52428800 bytes (50 MiB)**, read with
  `SUPABASE_ACCESS_TOKEN` from `GET /v1/projects/{ref}/config/storage`. **`LIVE_COPY_MAX_BYTES` is 52428800**, with that
  source in its comment. On the same bucket an `upsert: false` put over an existing scratch key answered 409 "The resource
  already exists" and left the first bytes; the control (a new key) was accepted; both scratch objects were removed.

- **2026-11-25, Dev — what landed beside the plan, each a routine call unless it says otherwise.**
  - **The clock hides below 1366, as well as where the bar is compact** — put to the owner as Question 1 below (R-266
    against the plan's `hidden={compact}`) and **ruled option 1 in the session (owner, 2026-11-25), recorded as R-289**. With
    the clock drawn from 1280, S4's centred group sat 42px off centre at 1280 (measured: 0 at 1366, 7 at 1350, 42 at 1280),
    and R-266 holds it within 6px there. R-266's journey holds unchanged and Ship it ▾ → History is the drawer's way in below
    1366. The floor gains 1280.
  - **The schedule.** `50 4 * * *` is twenty minutes after the orphan purge's `30 4`, and `purge.test.ts` held "no two jobs
    share an HOUR" (Story 3.7's "never share a cold start"). The test now holds that reason itself: each job starts only after
    the one before it can have ended (its route's `maxDuration`, 300 s where none is stated).
  - **A failed plan read prunes nothing.** AD-28 degrades a failed `entitlements` read to Free so a page still draws; a prune is
    irreversible, so the job's read refuses the degradation (`strictPlan` over `readEntitlement`, `plan.ts` still the one
    decider) and the sweep retries the next night.
  - **The live route refuses a `kept: false` job's Download** (404): the key can still hold an EARLIER check's copy, which is
    not the theme this check read.
  - **The tests live at `apps/web/`'s root** (`retention.test.ts`, `artifact-sweep.test.ts`), where `node --test '*.test.ts'`
    finds them; `server/retention.ts`' rows are in `retention.test.ts`.
  - **The ▾ row's caption is "Versions, gscan reports"** — S4d's, without "rollback" until Story 7.23 builds Roll back (as the
    clock's tooltip is "History" until then). 7.23's card carries both.
  - **The harness's history header gains `gone` and `pin-fails`**, so journey (b2) holds the matrix's "Pin what is gone" (the
    re-read drops the row, its sentence said, focus on ✕) and "Pin request fails" (the pin unchanged, one sentence); the 7.18a
    ▾-menu journey is re-expected with History as its last row; the colour `marigold-glyph` (#B87A00, D2's filled pin) is
    recorded in DESIGN.md beside the token.
  - **An artefact put that landed but whose answer was lost** meets its own object on AD-20's retry and now fails the job as
    ours (`upsert: false`); `deploy-io.ts`' ponytail names the upgrade (read the key back on a 409).

## Design Notes

**"Enforced in the database" — settled as a reading, as Story 7.1's Create settled its items.** FR-J7 puts the N−1 cap in the
database. MEASUREMENTS §26 and AD-28 put the plan's number in the server, because a trigger reading `entitlements` would be a
second plan decider. `pin_version` satisfies both:
- the route reads N through `plan.ts`, the one decider;
- the database counts and pins in one serialized step, so two tabs cannot both take the last slot.

The retired floor ("one row stays unpinned") contradicted the owner's N−1 in two ways:
- it refused pinning a project's only version, which N−1 allows;
- it counted failed and pruned rows as unpinned, so most of the time it never fired.

**The row stays; the pointer clears first.** Keeping the row is what keeps both of these:
- the drift baseline's manifest, which must survive pruning;
- DW-372's numbers.

AD-32's "objects before rows" exists to prevent an object nothing names. Here the worse failure is the opposite one: a pointer
to a missing object, which is a dead Restore button (rule 2). So the conditional clear runs first, and a pin that lands
between the two steps finds the row `gone` instead of pinning an empty version. A double failure leaks one object, unnamed;
the ponytail comment names that ceiling (an upgrade would be a prefix sweep with `drainPrefix`).

**Prune when a version arrives, not when a zip is stored.** A Pre-flight that never ships must not evict a real version.
Unpinning never hides a row either: the stored set is already within the cap, and only the next accepted upload prunes.

**One count per project, so one list per project** (a routine call). FR-J7 counts per project, while FR-J9 says "per project ×
site". A per-site list would hide the pins on another site that the cap still counts, and rule 1 forbids a list that reads as
complete when it is not. Rows on another site therefore carry "on {host}". Story 7.23 decides their Roll back.

**The split with 7.23** (a routine call). The epic gives 7.22 D2a and D2b, with an owner test. 7.22 draws every row compact,
which is the frame's row for older versions, adding the Live badge. 7.23 adds the expanded rows, their actions and the
original-theme row. The clock's tooltip says "History" until 7.23's Roll back makes S8e's "every version, one click back" true.

**DW-372's other half.** An upload that lost the binding race is marked `failed`, so its number can recur. It recurs under
another theme name, though (the binding refused this upload's name), and Story 7.25's per-site lock removes the race.

## Questions for the owner

Question 1 was raised at Dev (2026-11-25) and ruled in the same session: option 1, recorded as **R-289**.

### Question 1 — Where does the History clock show on a laptop-sized window?

**In plain English.** The plan put a small clock icon, which opens History, just left of **Ship it** on every window that is
not "compact" (1280 pixels wide and up). On 2026-10-19 you ruled (R-266) that the group in the middle of the editor's top bar
— Template, View as, the device buttons — stays centred to within 6 pixels at 1280. With the clock added, that group is pushed
42 pixels off centre at 1280; it is centred again from about 1366 up. **History is always reachable from Ship it's little ▾
menu**, at every width.

**An example.** On a 13-inch laptop (a 1280-wide window) you open the editor. With option 1 there is no clock in the bar; you
open History from **Ship it ▾ → History**. On a 1440-wide screen the clock is there. With option 2 the clock is there at 1280
too, and the middle group sits visibly left of centre.

1. **(RECOMMENDED) Show the clock from 1366 up; below that, History is in the ▾ menu.** Your R-266 centring holds as ruled, and
   the frame's own width (1440) shows the clock exactly as drawn. This is what is built now.
2. **Show the clock from 1280 up, as planned, and relax R-266 there** — the middle group may sit up to about 42 pixels off
   centre between 1280 and 1366.
3. **Never show the clock; History only in the ▾ menu.** The bar stays as it is today at every width; S8e's clock is not drawn.

**Ruled: option 1 (owner, 2026-11-25).** *"1. Clock from 1366 up (RECOMMENDED)"* — R-289.

## Owner's manual test

**Before you start:** on your go, Deploy plants two test accounts and fills in their addresses and links below:
- a **Free** account whose project "History test" is connected to T1 (`ghost6.inflozo.com`) and has shipped three times
  (v1–v3);
- a **Pro** account whose project "Pro history test" holds ten stored versions (v1–v10), eight of them pinned.

Use a desktop browser at full width — at least **1366 px** wide, where the bar shows the clock (R-289) — unless a step says
otherwise.

1. **URL:** `https://app.inflozo.com/projects/<History test — Deploy fills>`, signed in as the Free account. **Screen:** the
   editor. **Do:** press the **clock icon** just left of **Ship it**. **Type:** nothing. **See:** a panel from the right titled
   **HISTORY — HISTORY TEST**, with rows **v3** (green **Live** dot), **v2** and **v1**, newest first. Each row has a green
   **0 · 0** chip, a date and time, and an outline pin at the right. At the bottom: "Pro keeps the last 10 versions. Free keeps
   the last 3. Older versions are removed, not hidden — an Inflozo theme can't be rebuilt later, so this is how far back you
   can go." Nothing offers an upgrade.
2. **Same screen.** **Do:** press **v1's pin**, then **v2's pin**. **See:** each pin fills yellow, its row takes a faint yellow
   wash and shows a **PINNED** tag.
3. **Same screen.** **Do:** press **v3's pin**. **See:** a small yellow note under that pin says "One version has to stay
   unpinned so your next deploy has somewhere to go. Unpin another first.", with **Got it**. v3's pin stays an outline. Press
   **Got it**, and the note closes.
4. **Same screen.** **Do:** press **v2's pin** again. **See:** v2 is unpinned — outline pin, no wash, no tag. Unpinning is
   never refused.
5. **Same screen.** **Do:** close the panel (✕ or Esc), press **Ship it**, run the checks, and ship with **Deploy & activate**
   until **Live**. **See:** the theme goes live as **v4**.
6. **Same screen.** **Do:** open **Ship it ▾** (the small arrow on Ship it) and choose **History**. **See:** the panel shows
   **v4** (Live), **v3** and **v1** (PINNED). **v2 is gone** — not greyed, simply not there — because it was the oldest
   unpinned version and Free keeps three.
7. **Same screen.** **Do:** ship once more, as in step 5, then open History. **See:** the new version is **v5** (not v4 again),
   and the list is **v5**, **v4**, **v1** (PINNED). v3 is gone.
8. **Same screen, keyboard only.** **Do:** close the panel, press Tab until the clock icon is focused, and press Enter. **See:**
   the panel opens with focus on its ✕. Tab reaches each pin, and Space pins or unpins it. Esc closes the panel and puts focus
   back on the clock icon.
9. **URL:** `https://app.inflozo.com/projects/<Pro history test — Deploy fills>`, signed in as the Pro account. **Do:** open
   History. **See:** ten rows, v10 to v1, eight PINNED. Pin one unpinned row: it pins (nine pinned). Pin the last unpinned row:
   the yellow note appears and the pin stays unfilled. Unpin any row: allowed.
10. **Same project, browser window narrowed to about 820 px wide.** **See:** the clock icon is gone from the bar, which is
    compact there. **Do:** choose **Ship it ▾ → History**. **See:** the panel opens.

**After the test:** say "passed", or list what you saw. Your ships leave an Inflozo theme live on T1, so Claude puts T1 back on
Casper on your go.

## Verification

**Commands:**
- `pnpm check` -- expected: green. Lint, typecheck and every package test, among them the retention, sweep, deploy-run,
  deploy, drift, busy and server-wiring tests. The run prints its own counts; never write one down.
- `bash supabase/tests/run-rls-gate.sh` -- expected: exit 0, with every FR-J7 PASS line (under cap, `cap`, the lone version,
  unpin, `gone`, 42501).
- `python3 tools/doc-audit.py --check` twice -- expected: green.
- `pnpm keyboard` -- expected: journeys 7.22 (a)–(f) and the floor green.
- `grep -rn "artifacts.remove\|from(BUCKET).remove\|artifact_bytes" apps/web --include=*.ts --include=*.tsx` -- expected: the
  deleters are `retention.ts`, the sweep and `clear()` alone, and no quota reads `artifact_bytes`.

**Real infrastructure** (R-82; on the owner's in-session go, in the main session):
- **Supabase production database:** the migration applied through `SUPABASE_DB_POOLER_URL`. Read back that `pin_version`
  exists and the trigger is gone. Control: `authenticated` gets 42501 on execute, while the service role gets `pinned`.
- **Supabase production Storage:** read `deploy-artifacts`' effective size limit (the bucket's `file_size_limit`, else the
  project's storage config through `SUPABASE_ACCESS_TOKEN`) and set `LIVE_COPY_MAX_BYTES` from it. An `upsert: false` put over
  an existing scratch key is refused; control: a new key is accepted. Then remove the scratch objects.
- **Walk step 120, production + T1** (a throwaway Free account, then Pro):
  - four ships: v1's object is gone, its row is kept with a null pointer, and the next version is v5;
  - the next Pre-flight's D3c passes on the kept baseline manifest;
  - pinning at N−1 gives 409 and D2b, and Pro stops at nine pinned;
  - `prune-artifacts` with `CRON_SECRET`: a planted DW-380 resting job is abandoned and a planted failed row's zip removed,
    while a check resting on the linked site stays (the control). Without the secret it answers 401.
  - Afterwards T1 is back on Casper, and the accounts and objects are gone.
- **Vercel:** the deployment is READY with `prune-artifacts` in its crons, and the first scheduled run has a log line.
- **The owner's test above (R-80).**

**Executed — Dev (2026-11-25, Node 24; the real services by their variable names, no value printed):**
- **Supabase production database** (`SUPABASE_DB_POOLER_URL`, read inside each scratch script, never on argv; the owner's
  in-session go, "1. Go — all four"):
  - **Before:** `pin_version` absent, and no `deploys_pin_leaves_a_slot` trigger. A catalogue read (`information_schema.columns`,
    `pg_proc`, `pg_trigger`, `pg_policies`, `pg_indexes`, `pg_enum`, `pg_constraint` over `public` and `private`) diffed against a
    PostgreSQL 17 container built from every migration found exactly three objects missing on production: `deploys.pinned`,
    `guard_pin_leaves_a_slot()` and its trigger. Nothing else differed.
  - **First apply — rolled back whole:** 42703 at `comment on column public.deploys.pinned`. The migration gained `add column if
    not exists pinned …` (Spec Change Log), proven first on a container shaped like production (applies, re-applies, and ends
    equal to a fresh build), and pushed as a second `Schema` commit (c48e4416).
  - **Second apply — held, then read back:**
    - `pin_version(p_deploy uuid, p_user uuid, p_cap integer)` exists, its `prosrc` equals the file's body;
    - the trigger and the floor function are gone;
    - EXECUTE: `anon` false, `authenticated` false, `service_role` true;
    - `deploys.pinned` is `boolean not null default false`, with 0 of 8 rows pinned, `authenticated` unable to write it, and
      the column's comment naming FR-J7 and `pin_version`;
    - production's catalogue now equals the fresh build line for line.
  - **The proof, in one rolled-back transaction:** a throwaway user, site, project and one stored version. As `service_role`
    the lone version under cap 3 answered `pinned` (the retired floor's refusal) and under cap 1 `cap`; as `authenticated`,
    **42501**. Afterwards 0 proof rows were left behind.
- **Supabase production Storage** (`SUPABASE_SECRET_KEY` and `SUPABASE_URL` through `@supabase/supabase-js`;
  `SUPABASE_ACCESS_TOKEN` on `GET api.supabase.com/v1/projects/{ref}/config/storage`; same go):
  - all four buckets' `file_size_limit` is null, so the project's `fileSizeLimit` governs: **52428800** (200). That is
    `LIVE_COPY_MAX_BYTES`.
  - On `deploy-artifacts`, under a scratch prefix `_probe-7-22/<uuid>/`:
    - a new key with `upsert: false` was accepted;
    - the same key again was refused with **409 "The resource already exists"**, and the object still held its first bytes;
    - the control, a second new key, was accepted;
    - both objects were removed, and 0 were left under the prefix.
- **Two tabs at once** (the matrix row the RLS gate's single session cannot reach): a PostgreSQL 17 container built from every
  migration, three stored versions with one pinned and cap 3. Tab A pinned the last slot and held its transaction open for
  3 s; tab B's pin waited 2 s for A's lock. **A `pinned`, B `cap`, 2 pinned in all.** The control, `pin_version` without its
  advisory lock: A `pinned`, B `pinned`, 3 pinned — every version.
- **The RLS gate** (`bash supabase/tests/run-rls-gate.sh`): exit 0, every FR-J7 PASS line (the lone version, unpin, under the cap
  up to N−1, `cap` changing nothing, cap 10 pinning what cap 3 refused, re-pin, `gone` for pruned, failed, another user's and
  unknown rows with the owner's own pin as control, unpin at the cap, the prune's clear sparing a pin and a later pin `gone`,
  42501, EXECUTE the service role's alone and the floor gone). The control, with the 7.22 migration withheld (and the
  architecture's SCHEMA.sql at HEAD): exit 3, aborting at the block's first call, `function public.pin_version(…) does not exist`.
- **Not hit in Dev:** T1, Vercel, Resend and Dodo. Walk step 120 (production + T1 writes, and one call of `prune-artifacts` on
  production) is written and has never run; it is the Review's, from a clean worktree at the deployed sha, on the owner's
  in-session go. The Vercel cron reading needs the Dev push's deployment. Deploy's plants are Deploy's.
- **`pnpm check`:** green after the last edit. Lint, typecheck and every package pass with 0 failing, each printing its own
  count; the web package's run includes the retention, sweep, deploy-run, deploy, drift, busy, server-wiring, editor and purge
  tests.
- **`pnpm keyboard`** (the full gate, on the working tree): every journey passed but one, including 7.22 (a)–(f) and (b2), the
  floor at 1440, 1280 and 820, R-266's centring stop, and 7.18a's ▾-menu journey with History as its last row.
  - The failure was Story 7.19's `(e) back to Destination from the Safety net`: after Cancel at `check` the wizard stayed on
    `check` for 15 s. This story changes neither that Cancel nor its route; `deploy-wizard.tsx` gained only Ship it ▾'s
    History row and D3a's conditional Download.
  - Re-run: `pnpm keyboard -g "7.19 · \(e\) back to Destination" --repeat-each=5` passed 5 of 5. The failure is intermittent.
    CI's own full run on the Dev push is the next reading.
  - The implementation pass saw all nine 7.22 tests red with `editor.tsx` and `deploy-wizard.tsx` put back to HEAD.
- **The matrix audit** (every row mapped to a check that ran in that state):
  - the rule's rows (first version, under/over the cap, pinned survive, pinned ≥ cap, two sites, number after pruning) →
    `retention.test.ts`;
  - "over the cap"'s failed prune → `deploy-run.test.ts`, with the job still `done`;
  - the pin rows → the RLS gate's FR-J7 block, the route's 409/404 → `deploy-run.test.ts`' history-route test, and D2b,
    `gone`, a failed pin, the empty state and a failed read → journeys 7.22 (b), (b2), (c) and (e);
  - two tabs → the executed race above;
  - the sweep's four rows → `artifact-sweep.test.ts` (and `deploy-run.test.ts` for `abandon`);
  - DW-396 → `deploy-run.test.ts`, `drift.test.ts` and journey (f);
  - immutable → `deploy-run.test.ts`, `deploy.test.ts` and production's 409 above.
  - **The audit found one row with no test: "Baseline after prune".** Two tests were added, each seen red under a planted
    reversion:
    - `deploy-run.test.ts`' "the baseline survives its prune" — v1's pointer cleared, then the next Pre-flight on an untouched
      site is D3c "since v1". The control: with the manifest nulled there is no baseline.
    - `drift.test.ts`' static read — the prune's one write is the pointer and its bytes, the sweep never names
      `content_manifest`, and the baseline query has no `artifact_path` filter. A planted `.not('artifact_path', 'is', null)`
      in `deploy-io.ts`' baseline turned it red.
- **One deleter** (the grep above): the removals of `deploy-artifacts` objects are `retention-io.ts` (`pruneProject`'s), the sweep
  route's (pass 2's `drop`, and pass 1 through `abandon` = `clear()`), and `run.ts`' `clear()`. There is one more, which the
  spec's Code Map did not name: 7.18a's stale re-make in `compileAndCheck` (`run.ts:388`) removes the row's OWN superseded zip
  before re-making it on the same row, and that row is never a version. Kept as built; it is a routine call. No quota reads
  `artifact_bytes`.
- **Propagation grep** (`guard_pin_leaves_a_slot`, `uploads.length + 1`): only the frozen applied migration, the new migration's
  and the architecture files' dated comments, MEASUREMENTS §26's history, the epic context's Create notes and this spec.
- **`python3 tools/doc-audit.py --check`**, twice: PASS.

**Executed — Review (2026-11-25, Node 24; keys by their variable names, read in-process, no value printed; production and T1
writes on the owner's in-session go, "1. Go — all of it", run in the main session):**
- **CI on the Dev head** (`GITHUB_TOKEN`, the runs API): run 45548261831 for 6799ecab — `rls` and `check` success, then `deploy`;
  the Render matrix success. Vercel (`VERCEL_TOKEN`): `dpl_8vdawH2u3D8BuNHqDJzvakXeVaoi` READY at 05:08 UTC, aliased to
  inflozo.com and app.inflozo.com, built from 6799ecab.
- **The Real-infra verifier, read-only** (`SUPABASE_DB_POOLER_URL` inside `BEGIN READ ONLY`; `SUPABASE_SECRET_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN`):
  - R-99: every column the new code selects, filters or updates exists on production (`missing: []` over `deploys`, `deploy_jobs`,
    `projects`, `sites`, `entitlements`; the control `pinned_zz` → false); `deploys.pinned` is `boolean not null default false`;
    `deploy_status` and `job_stage` carry every value the code writes; `pin_version(uuid,uuid,integer)`'s `md5(prosrc)` equals the
    migration body's (the control `pin_version(uuid,uuid,text)` → NULL); EXECUTE anon false, authenticated false, service_role
    true; no trigger on `deploys` and no `guard_pin_leaves_a_slot`; the embeds `sites(url)` and `projects(linked_site_id)` resolve
    to one foreign key each. PostgREST: the history GET's select → 200 `[]` (control `pinnedx` → 400 42703); `POST
    /rpc/pin_version` with the publishable key → 401 42501 (control `pin_version_nope` → 404 PGRST202).
  - Storage: `deploy-artifacts`' `file_size_limit` null and the project's `fileSizeLimit` 52428800 — `LIVE_COPY_MAX_BYTES`
    (control: an unknown bucket → 400).
  - Deployed: the deployment's `crons` list `/api/cron/prune-artifacts` at `50 4 * * *`; `https://inflozo.com/api/cron/prune-artifacts`
    → 401 with no header and 401 with a wrong bearer (control: `/api/cron/prune-artifacts-nope` → 404; before the deploy the route
    itself was 404); `GET` and `POST https://app.inflozo.com/projects/<uuid>/history` signed out → 401 "Not signed in" (control:
    `/history-nope` → 307 to `/sign-in`).
- **Production's Data API `max_rows`** (`SUPABASE_ACCESS_TOKEN`, `GET /v1/projects/{ref}/postgrest`): **1000** — the reason every
  cross-account read in the sweep now pages.
- **Walk step 120 on production and T1, at the Dev head** — a cut of steps 1–5 and 120 (`tools/probe-debug/cut120.cjs`, built from
  the walk by slicing on its step markers, never committed) run from a clean detached worktree at 6799ecab with `T1_WRITES=1`, the
  walk's first line naming `dpl_8vdawH2u3D8BuNHqDJzvakXeVaoi` READY from this HEAD: **0 FAIL, 59 PASS.**
  - (a) four ships live in turn as 1.0.0–4.0.0; the fourth pruned v1 — its row kept with a null pointer, its version and manifest,
    its object gone; v2–v4 kept theirs; the route (HTTP 200) and the drawer at 1440 list exactly v4 v3 v2, with the limit line.
  - (b) v2 and v3 pinned through the drawer; v4's pin → D2b, focus on Got it, the pin unfilled; the same POST → **409**; the rows
    read 2.0.0 and 3.0.0 pinned; v3 unpinned.
  - (c) v4, the drift baseline, pruned as the prune prunes (clear 200, object removed 200) → Run checks → D3c "Nothing changed on
    your site since v4" (`drift: { kind: 'clean', since: 4 }`); the new deploy is **5.0.0** in its row and its zip's `package.json`.
  - (d) `prune-artifacts` → **401** without the secret, **200** with `CRON_SECRET`: `{"abandoned":1,"dropped":1,"pruned":0,"failed":0}`
    — exactly the walk's two plants, so nothing of any other account was touched; R's stranded check `cancelled`, its row and object
    gone; P's failed row kept, pointer null, object gone; the controls (the check resting on P's linked site, the `live/` copy)
    untouched.
  - (e) Pro: nine pins 200, the tenth **409**, an unpin 200.
  - finally: T1 back on `casper*` with `racer` and `source`, every uploaded `inflozo-` theme deleted, routes.yaml byte for byte as
    at the start; no object left under the account's prefixes, T1 disconnected, the account deleted; users 22 → 22, projects
    15 → 15; zero CSP violations.
- **The Review's patches, locally:** `pnpm check` green (every package, each printing its own count). Each new assertion seen red
  under a planted reversion: the sweep's source test under each of four (the old `awaiting_ship` hold, a claim-less abandon, a
  short-page stop, a bare `held` read); the real clear's under `pinned` or the path dropped; `compileInputOf`'s under
  `uploads.length + 1`; `purge.test.ts` under `50 4` and under a same-minute `30 4`. `bash supabase/tests/run-rls-gate.sh` exit 0
  with the new FR-J7 line; **the control**, `perform pg_advisory_xact_lock(…)` withheld from both the migration and SCHEMA.sql:
  exit 3 at "pin_version no longer takes the project's lock before it counts", both files restored after.
- **`pnpm keyboard -g "7\.22|7\.21|journey uses no pointer|7\.18a"`** on the patched tree: every selected test passed, the
  no-pointer control among them, with 7.22 (a)'s gscan words and derived limit, (e)'s two-site pin names and (f)'s control run.
  The full gate is CI's `check` on the Review push.
- **Next, on the Review's deployment (the owner's second go, "1. Go — re-run after the fix deploys"):** walk step 120 again, with
  the Review's in-flight control in (d), and the deployment's crons read at `50 6`.
