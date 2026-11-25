---
title: 'Story 7.22 — Artifacts, retention and pinning'
type: 'feature'
created: '2026-11-25'
status: 'ready-for-dev'
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
- [ ] `supabase/migrations/20261125120000_pin_version.sql` -- create it:
  - drop the trigger `deploys_pin_leaves_a_slot` and the function `guard_pin_leaves_a_slot()`;
  - create `public.pin_version(p_deploy uuid, p_user uuid, p_cap int) returns text`, with `search_path` fixed and the project
    serialized by `pg_advisory_xact_lock` on its id, returning `'pinned' | 'cap' | 'gone'` as Always states;
  - revoke execute from `public`, `anon` and `authenticated`;
  - restate `comment on column deploys.pinned`.

  -- FR-J7's "in the database" with AD-28's number.
- [ ] architecture `SCHEMA.sql` -- the same change, in place. The function joins the revoke list.
- [ ] architecture `RLS-TEST.sql` → copied byte for byte to `supabase/tests/rls.sql` -- rewrite the FR-J7 block. It asserts
  that:
  - a pin under the cap answers `pinned`;
  - at `cap − 1` it answers `cap` and changes nothing;
  - a lone version under cap 3 answers `pinned` (the retired floor's false refusal, now the control);
  - unpinning always works;
  - a row with a null pointer, or another user's row, answers `gone`;
  - `authenticated` gets 42501 on execute.

  Update the catalogue lists at `:526` and `:653`.

*Server:*
- [ ] `apps/web/lib/retention.ts` (new, pure) -- `isStoredVersion`, `prunable(versions, cap)`, `HISTORY_WORDS` (every drawer
  word, the limit line built from `PLANS`, "Nothing shipped yet", D2b's sentence and Got it, the pin labels, their busy and
  said forms, "on {host}"), and the time label.
- [ ] `apps/web/lib/deploy.ts` -- `nextVersion(rows)`. `shipStateOf`'s `n` reads it.
- [ ] `apps/web/server/deploy/project-input.ts` -- `n = nextVersion(uploads)`.
- [ ] `apps/web/server/retention.ts` + `server/retention-io.ts` (new) -- `pruneProject({ projectId, userId }, io)`:
  - reads the cap through `readEntitlement` and the project's stored versions;
  - runs `prunable`;
  - clears each pointer conditionally, then removes each object it cleared;
  - returns what it did.

  The io joins `server-wiring.test.ts`' lists. This is the `snapshot.ts`/`snapshot-io.ts` split.
- [ ] `apps/web/server/deploy/run.ts`, `deploy-io.ts`:
  - add `DeployIo.prune`, called best effort right after the row is first written `uploaded` or `live`;
  - `artifacts.put(path, bytes, { replace })`, with `replace` passed for the live copy alone;
  - `driftStep` skips the put past `LIVE_COPY_MAX_BYTES` and records `kept: false`;
  - export `abandon` (`start()`'s `clear` with no clock).
- [ ] `apps/web/lib/drift.ts` -- `DriftRecord`'s `found` gains `kept?: false`. Add `LIVE_COPY_MAX_BYTES`, its value and its
  source (Dev's read) in a comment.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/history/route.ts` (new):
  - GET: the project's stored versions with each one's site host and the project's linked site, newest first, through the
    user's session (RLS);
  - POST `{ deploy, pinned }`: `currentUser`, `isUuid`, then `resolveEntitlement` → `pin_version` with `caps.history` (409 on
    `cap`, 404 on `gone`); an unpin is the service role's update scoped by `user_id` and `project_id`;
  - `no-store` on every answer.
- [ ] `apps/web/lib/artifact-sweep.ts` (new, pure loop) and `apps/web/app/api/cron/prune-artifacts/route.ts` (new) -- three
  passes, in order:
  1. DW-380's resting jobs are abandoned;
  2. DW-374's dead zips are dropped;
  3. each project is pruned.

  Use the purge routes' door and budget, and answer 500 when anything failed. The header names E7, FR-J7 and AD-33.
- [ ] `apps/web/vercel.json` -- schedule `/api/cron/prune-artifacts` daily at `50 4 * * *`.

*UI:*
- [ ] `apps/web/components/editor/deploy-history.tsx` (new) -- the drawer:
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
- [ ] `apps/web/components/editor/deploy-wizard.tsx`:
  - `ShipButton`'s menu gains **History** at every width;
  - D3a omits `#deploy-drift-download` when `kept === false`;
  - correct the header comment.
- [ ] `editor.tsx` -- the clock `IconButton` `#deploy-history-open` (label and title "History") just before `ShipButton`,
  `hidden={compact}`, and mount the drawer.
- [ ] Harness `layout.tsx`/`actions.ts`:
  - `x-inflozo-harness-history: empty | free | free-full | pro-full | two-sites | fail`;
  - `x-inflozo-harness-drift: found-unkept`.

*Tests* (each assertion seen red under a planted reversion):
- [ ] `lib/retention.test.ts`, `server/retention.test.ts`, `lib/artifact-sweep.test.ts`, `deploy-run.test.ts`,
  `deploy.test.ts`, `drift.test.ts`, `busy.test.ts`, `server-wiring.test.ts` -- every row of the I/O matrix.
- [ ] `tools/keyboard/journey.spec.mjs` -- the 7.22 journeys:
  - (a) the clock opens the drawer, focus on ✕, Esc returns it;
  - (b) Space pins and unpins, said once;
  - (c) `cap` opens D2b, focus on Got it, returning to an unfilled pin;
  - (d) Ship it ▾ → History;
  - (e) the empty state with the limit;
  - (f) D3a without Download.

  `floor.spec.mjs` covers the drawer at 1440 and 820: the clock is absent where the bar is compact, and the menu row is
  present.
- [ ] `tools/probe/run-verify-editor.cjs` step 120 -- the Verification's real-infra run.

*Propagation* (standing rules 3 and 7; end with a grep for `guard_pin_leaves_a_slot` and `uploads.length + 1`):
- [ ] Planning documents:
  - FR-J7: a dated note;
  - AD-29 and AD-33: "built" notes naming the cron and the inline prune;
  - MEASUREMENTS §26c: the reading, and the retired floor;
  - EXPERIENCE F8 rule 3: one slot, N−1;
  - `epics.md` Story 7.23: the drawer is 7.22's, 7.23 adds the expanded rows and actions; a rollback row that shares an object
    with an older row prunes by object; another site's rows; the full S8e tooltip;
  - `epics.md` Stories 12.2 and 12.4: DW-399.
- [ ] `deferred-work.md` -- resolve DW-372, DW-374's zip, DW-380 and DW-396, and open DW-399 (owner: Story 12.4, before 12.2
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

## Spec Change Log

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

## Owner's manual test

**Before you start:** on your go, Deploy plants two test accounts and fills in their addresses and links below:
- a **Free** account whose project "History test" is connected to T1 (`ghost6.inflozo.com`) and has shipped three times
  (v1–v3);
- a **Pro** account whose project "Pro history test" holds ten stored versions (v1–v10), eight of them pinned.

Use a desktop browser at full width unless a step says otherwise.

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
