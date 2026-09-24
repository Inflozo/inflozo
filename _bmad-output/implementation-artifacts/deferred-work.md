# Deferred work

Findings that are real, are not this story's to fix, and would otherwise be lost. The story board
reads this file. An entry is closed by the story that fixes it, never by deleting the row.

**The words this file uses, and there are only two.** `status: open`, and `status: done <date>` with
a `resolution:` line saying what closed it — the canonical format,
`.claude/skills/bmad-loop-sweep/deferred-work-format.md` § *When a deferred item is later completed*.
**Write `done`, not `closed`.** Entries above written before that format arrived say `closed`, some
with prose or `**bold**` around it; the board reads those too, and they are legacy rather than a
second spelling to copy. It reads the first *word* of the status line and shows anything it does not
know as a red **unreadable status** chip rather than guessing — which is the fix for the day in
September 2026 when 28 finished entries sat in the open counts because the board knew only `closed`
(Story 3.9's owner test). A `resolution:` or `closed:` note **never** closes an entry by itself: the
status line does, because several entries carry a note while deliberately staying open with their
code landed and their proof owed.

Besides the fields the format defines, every entry carries **`plain:` — one sentence a non-engineer
reads**, because the owner sees this ledger on the story board and `reason:` is written for a
developer. Write it in the owner's language: what is not right, and what it costs him. The board
falls back to `reason:` when an entry has no `plain:`, which reads as jargon and is the bug, not the
fallback.

### DW-1: `packages/library` declares no entry point, so the dependency arrow cannot resolve

plain: The shared parts store has no way in yet, so no other part of the code can take anything out of it; the first story that needs to will build the door.
status: done 2026-09-11 (Story 4.1)
resolution: Story 4.1 (2026-09-11) — `packages/library/package.json` now carries
  `"exports": { ".": "./src/index.ts" }`, a `tsconfig.json`, `typecheck` and `test` scripts and the
  two devDeps the other three packages carry, so `pnpm -r` stops skipping it. The entry shape is a
  MODULE after all, not the data-file map this entry guessed at: AD-34 places the authoring rules —
  the closed directive set, the allow-lists and the validator over them — in this package, and they
  are shared with the compile gate, so there is code to export beside the data. AD-2 is unweakened:
  a DESIGN is still four files plus two schemas and nothing imports one. The proof crosses the
  boundary as this entry asked — `packages/section-runtime/src/index.test.ts` imports
  `@inflozo/library` and reads `DIRECTIVES` and `BINDING_CONTEXTS`, and `pnpm check` is green.
severity: medium
origin: Story 1.1 review (2026-09-04)
location: packages/library/package.json
reason: The three core packages each declare `"@inflozo/library": "workspace:*"`, but `library` has
  no `exports` and no `main`, so `import '@inflozo/library'` cannot resolve today. Nothing imports it
  yet, so the shape of the entry point is a guess until a consumer exists — AD-2 says data only, no
  executable module, so it is likely a data-file `exports` map rather than a module. The first story
  that reads the library (1.3) decides the shape and proves it with an import that crosses the
  boundary; today's three tests each assert only their own package name and cross nothing.

### DW-2: `apps/web` declares no dependency on the core packages, so `transpilePackages` is inert

plain: The website has not been told it is allowed to use the four building blocks, so a setting that connects them currently does nothing.
status: done 2026-09-13 (Story 4.4)
resolution: Story 4.4 — `apps/web/package.json` declares `"@inflozo/library": "workspace:*"` and
  `next.config.ts` lists it first in `transpilePackages`, because the style-guide review page
  (`app/(app)/app/(authed)/style-guide/`) is the first app code to import a core package. `next build`
  compiles it, JSON import attributes included. The other three entries stay as they were and become live
  the day an app file imports them, each adding its own `workspace:*` line.
severity: low
origin: Story 1.1 review (2026-09-04)
location: apps/web/package.json · apps/web/next.config.ts
reason: `next.config.ts` lists the three core packages in `transpilePackages`, but `apps/web` does
  not depend on them and `node_modules/@inflozo` does not exist. The entries are no-ops until the
  first `import '@inflozo/section-runtime'`, which will fail to resolve until the `workspace:*`
  dependencies are added. Adding them now would be speculative; the story that imports adds its own.

### DW-3: `@types/node` is two majors ahead of the pinned runtime

plain: The reference notes describing our engine are two versions ahead of the engine we actually run, so code could be written against something that is not there.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the four package.json files now pin `@types/node` on the 24.x
  line (24.13.4), matching the `24.x` in `engines` and `.nvmrc`. The lockfile moved with it, which
  is the whole reason the entry was deferred; `pnpm check` and `pnpm build` are green on Node
  24.18.0.
severity: low
origin: Story 1.1 review (2026-09-04)
location: apps/web/package.json · packages/{section-runtime,ghost-shim,theme-compiler}/package.json
reason: `@types/node@26.4.1` types Node 26 while the stack pins Node 24.x, so code can typecheck
  against an API the deployed runtime does not have. The blast radius is small today — AD-1 forbids
  the core packages from calling Node at all, so the types serve only `node:test` in test files —
  and correcting it changes the lockfile, which wants its own install-and-verify pass.

### DW-4: `.toString()` is banned on every receiver, not only on a Date

plain: One safety rule is stricter than intended and also blocks a few harmless things; nothing is broken, and it gets narrowed the first time it blocks real work.
status: open
severity: low
origin: Story 1.1 review (2026-09-04)
location: eslint.config.js
reason: AD-1 bans `.toString()` *on a Date*; the selector cannot see the receiver's type, so it also
  fires on `Number#toString`, `Buffer#toString` and `Error#toString`. It errs toward safety, which is
  the right side to err on, but the first time it blocks ordinary code someone will reach for a
  disable comment — and `/* eslint-disable no-restricted-syntax */` silences the locale and clock
  bans sitting beside it. Worth narrowing when a core package first has real code to narrow against.

### DW-5: the GitHub token expires 2027-09-05 and nothing carries the date

plain: The GitHub key that lets me read whether the safety check passed stops working on 5 September 2027, and nothing yet reminds anyone.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the date has a register row with a trigger —
  `VERIFY-AT-BUILD.md`, "The read-only GitHub token expires 2027-09-05" — in the shape the
  Ghost(Pro) trial item uses: the fact, the trigger, the owner and what breaks when it lapses
  (every later story's "is CI green" read starts answering 401 with no forewarning).
  `tools/probe/.env.example` now CITES that row instead of carrying the date, so the figure is
  written once.
severity: low
origin: Story 1.1 review (2026-09-04)
location: tools/probe/.env.example
reason: The date lives in a comment and in this story's Verification. When it lapses, every later
  story's "CI is green" read starts returning 401 with no forewarning. This project's convention for
  a dated external deadline is a register row with a trigger, as the Supabase grants and gscan dates
  have; it needs one.

### DW-6: `node --test` warns MODULE_TYPELESS_PACKAGE_JSON on every `apps/web` run

plain: Running the tests prints four harmless warning lines every time; nothing fails, it is only noise.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `"type": "module"` is in `apps/web/package.json`. EXECUTED
  rather than assumed (standing rule 1): `pnpm test` runs 283 tests with ZERO
  MODULE_TYPELESS_PACKAGE_JSON lines where it printed 34, and `pnpm build` compiles clean under
  Next 16.3.1 with every route in the table unchanged.
severity: low
origin: Story 1.1 review (2026-09-04)
location: apps/web/package.json
reason: `apps/web` sets no `"type"`, so Node reparses `routing.test.ts` as ESM and prints four lines
  of warning in every local and CI run. `"type": "module"` silences it, but whether Next 16 builds
  clean under it is a claim about an external platform and wants executing, not asserting — and this
  story's build is already green without touching it.

### DW-7: the RLS gate reports a broken lock but cannot stop the release

plain: FIXED 2026-09-05 — a broken database lock now stops the release instead of arriving as a warning afterwards. Proved by deliberately breaking one and watching nothing publish.
status: closed
closed: 2026-09-05 — publishing moved into GitHub Actions behind `needs: [check, rls]`; auto-deploy
  off via `git.deploymentEnabled.main = false`. CONTROL (standing rule 2): commit `15a22638` carried a
  migration creating a table with no RLS; run 33940741143 gave `check` success, `rls` **failure**,
  `deploy` **skipped**, and Vercel created **no** production deployment for it, while the domains kept
  serving 200 from the previous one. The happy path was proved first on `f7d0e807`: all three jobs
  green and **exactly one** production deployment, against two for `2e346ea6` when both paths were
  live. The rootDirectory claim held — `vercel build` honours `apps/web` from the repository root.
  Propagated to CLAUDE.md and docs/project-context.md (standing rule 3).
was_status: open
severity: high
origin: Story 1.2 review (2026-09-05), owner ruling on question 1
location: .github/workflows/ci.yml · apps/web/vercel.json
reason: `pnpm -w check` blocks a release because it runs inside the Vercel build; the RLS gate cannot
  join it there. Vercel's build image is Amazon Linux 2023 with `dnf` and no Docker daemon (Vercel,
  *Build image overview*, read 2026-09-05) and the gate starts a `postgres:17` container.
  RULED (owner, 2026-09-05, spec 1.2 question 4): publishing moves into GitHub Actions and runs only
  after `check` and `rls` are green — Vercel's own documented mechanism (*Deploying GitHub Projects
  with Vercel* -> "Using GitHub Actions"). Executed 2026-09-05 so the story need not re-derive any of
  it: the Vercel project is linked to `github Inflozo/inflozo`, `rootDirectory: apps/web`,
  `productionBranch: main`; the repository holds NO Actions secrets today (`/actions/secrets` -> `[]`)
  and `GITHUB_TOKEN` can create them (`/actions/secrets/public-key` -> HTTP 200);
  `git.deploymentEnabled` takes a per-branch map and stops deployments "upon commits", so
  `{"git":{"deploymentEnabled":{"main":false}}}` in `apps/web/vercel.json` turns off the auto-deploy
  without touching a dashboard setting, and it is revertible in one commit.
  BUILD IN THIS ORDER, because the wrong order takes the live site off updates: (1) add the three
  secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` (the project's `accountId`), `VERCEL_PROJECT_ID`;
  (2) add a `deploy` job to `ci.yml` with `needs: [check, rls]` running `vercel pull --environment=
  production`, `vercel build --prod`, `vercel deploy --prebuilt --prod`; (3) push and confirm that
  job publishes — auto-deploy is still on, so this push deploys twice, which is expected and harmless;
  (4) only once step 3 is proven green, set `git.deploymentEnabled.main = false` and confirm the next
  push deploys exactly once, through Actions. Rollback at any point is deleting that key.
  CONSEQUENCE the owner has been told: `VERCEL_TOKEN` will live in GitHub Actions as well as in
  `tools/probe/.env`.
  BLOCKED at step 1, executed 2026-09-05: `tools/probe/.env`'s `GITHUB_TOKEN` can READ the secrets
  public key (`GET /actions/secrets/public-key` -> HTTP 200) but cannot WRITE a secret
  (`PUT /actions/secrets/<name>` -> HTTP 403 "Resource not accessible by personal access token").
  Reading that 200 as permission to write was a wrong inference and is recorded so it is not repeated.
  The repository still holds no secrets. Unblock either way: the owner adds the three by hand, or he
  issues a fine-grained PAT with repository permission **Secrets: Read and write**. Two of the three
  values are identifiers, not credentials, and are written down here so nobody re-derives them:
  `VERCEL_ORG_ID = team_ISxd9rXNWzolPDHJX4TJpUKj` (the project's `accountId`, equal to
  `VERCEL_TEAM_ID` in `.env`) and `VERCEL_PROJECT_ID = prj_ptauaY2o7FQckRDk31b7hdl06FSb`. The third,
  `VERCEL_TOKEN`, is the value of that line in `tools/probe/.env` and is never written down.
  STEP 2 IS WRITTEN AND WAITING - the job to append to `.github/workflows/ci.yml`, unchanged from the
  method Vercel documents:

      deploy:
        needs: [check, rls]
        runs-on: ubuntu-latest
        timeout-minutes: 15
        steps:
          - uses: actions/checkout@v7
          - uses: actions/setup-node@v7
            with:
              node-version-file: .nvmrc
          - run: npm i -g vercel@latest
          - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  It is deliberately NOT committed yet: without the secrets the job fails, and a red `main` is the one
  thing the project does not push. The unverified claim inside it is that `vercel build` honours the
  project's `rootDirectory: apps/web` when run from the repository root - a claim about an external
  platform, so step 3 executes it while auto-deploy is still on, where a failure costs nothing.

### DW-8: the migration's byte-identity guard cannot survive the frozen-migration ruling

plain: FIXED 2026-09-05 — the safety check now compares the database the files produce instead of the files themselves, so adding a table no longer sets off a false alarm while a real mismatch still does.
status: closed
closed: 2026-09-05 — `run-rls-gate.sh` now applies every migration to one database and `SCHEMA.sql`
  to a second database in the same container, and diffs the two schema dumps. `rls.sql` and
  `prelude.sql` keep their `cmp -s` byte-guards: those are still true copies of live authorities.
  CONTROLS (standing rule 2), both run with a second migration adding `public.dw8_probe`:
    A. `SCHEMA.sql` gains the same table -> **exit 0**, while `cmp` on the frozen migration reports
       DRIFT, i.e. the old guard would have refused to run and the new one correctly does not.
    B. `SCHEMA.sql` does NOT gain it -> **exit 1**, `SCHEMA DRIFT`, the diff naming `dw8_probe`.
  A first attempt at control A failed `FAIL (F11): client-readable but neither client- nor
  server-insertable` — the proof rejecting a malformed probe, not the gate misbehaving; recorded
  because it is evidence the F11 class assertion works on a table invented after it was written.
  One platform fact found by executing: `pg_dump` since 17.6 wraps output in `\restrict`/`\unrestrict`
  lines carrying a RANDOM token per run, so two dumps of identical databases never match until those
  two lines are dropped. That is the only normalisation; everything else pg_dump emits is stable.
was_status: open
severity: medium
origin: Story 1.2 review (2026-09-05), owner ruling on question 2
location: supabase/tests/run-rls-gate.sh
reason: The owner ruled today's migration is frozen and every later change is a new file, with
  `SCHEMA.sql` remaining the cumulative readable picture. The gate's `cmp -s` asserts the frozen
  migration is byte-identical to `SCHEMA.sql`, so the first time `SCHEMA.sql` gains a table the gate
  reports `DRIFT` on a file that is correct. The invariant that survives the ruling is equivalence,
  not equality: apply every migration to one container and `SCHEMA.sql` to another, and diff the two
  schemas. The `rls.sql` and `prelude.sql` byte-guards are unaffected — those stay true copies of
  live authorities. Nothing is wrong today (they are byte-identical, re-verified this review); this
  is due the same day the second migration lands.

### DW-9: four proof-fixture users are resident in the production database

plain: DONE 2026-09-05 — the four fake users and their data are out of the real database, so your first "how many users" number starts at zero.
status: closed
closed: 2026-09-05 — the owner ran the SQL in the Supabase SQL editor and deleted the object through
  the Storage UI. VERIFIED read-only afterwards: `auth.users` 0 · `profiles` 0 · `projects` 0 ·
  `sites` 0 · `entitlements` 0, and `feature_flags` still 2 (seed data, correctly untouched). One row
  remains in `storage.objects`: `11111111-…/.emptyFolderPlaceholder`, created 03:32 on 2026-09-05 by
  the dashboard itself to keep the emptied folder visible — a UI artefact, not fixture data. It goes
  away by deleting the folder in Storage, or now that DW-10 has read the platform's escape hatch, by
  `set storage.allow_delete_query = 'true'; delete from storage.objects where name like '11111111-%';`
  Left as the owner's convenience; it holds no data.
prepared: 2026-09-05 — the owner chose to run it himself rather than have it run for him (the
  sandbox also refuses destructive writes to the production database, which is the correct default).
  DRY-RUN, twice, against a throwaway `postgres:17-alpine` seeded to match the live database: the
  first version was WRONG and the dry run is what caught it — it asserted every public table came
  back empty, which `feature_flags` (2 seed rows, by design) fails, so it would have aborted on the
  live database too. The corrected form asserts only that nothing belonging to those four user ids
  survives. Second dry run: 4 users deleted, profiles/projects/sites cascaded to 0, the storage row
  deleted, `feature_flags` untouched at 2. The SQL to paste:

      begin;
      delete from storage.objects
       where name like '11111111-1111-1111-1111-111111111111/%'
          or name like '22222222-2222-2222-2222-222222222222/%';
      delete from auth.users where id in (
        '11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444');
      do $$
      declare r record; n bigint; bad text := '';
      begin
        for r in select c.relname from pg_class c
                 join pg_namespace nn on nn.oid = c.relnamespace
                 join pg_attribute a on a.attrelid = c.oid and a.attname = 'user_id' and a.attnum > 0
                 where nn.nspname = 'public' and c.relkind = 'r' loop
          execute format($q$select count(*) from public.%I where user_id in
            ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',
             '33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444')$q$, r.relname)
            into n;
          if n > 0 then bad := bad || format('%s=%s ', r.relname, n); end if;
        end loop;
        if bad <> '' then raise exception 'ABORTED, nothing deleted: rows survived the cascade: %', bad; end if;
      end $$;
      commit;
      select 'auth.users' as table_name, count(*) as rows_left from auth.users
      union all select 'profiles', count(*) from public.profiles
      union all select 'projects', count(*) from public.projects
      union all select 'sites', count(*) from public.sites
      union all select 'storage.objects', count(*) from storage.objects
      order by 1;

  ATTEMPT 1 FAILED on the live database, 2026-09-05, and the container could not have predicted it:
  `ERROR 42501: Direct deletion from storage tables is not allowed. Use the Storage API instead.
  CONTEXT: PL/pgSQL function storage.protect_delete()`. The whole transaction rolled back — nothing
  was deleted. Executed on hosted afterwards: `storage.objects` carries
  `protect_objects_delete BEFORE DELETE ... FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete()`,
  while `auth.users` carries only the two AFTER INSERT signup triggers, so the user deletion is
  unobstructed. The storage row must go through the Storage API or the dashboard's Storage UI; the
  SQL above is therefore run WITHOUT its `delete from storage.objects` statement. See DW-10.
  Close this entry when the owner reports the four user counts came back 0 and the object is gone.
severity: low
origin: Story 1.2 review (2026-09-05), owner ruling on question 3
location: hosted Supabase project (`SUPABASE_URL`) — `auth.users` and what cascades from it
reason: Building the proof against the hosted project fired the signup triggers for the RLS-TEST
  fixture users. Verified read-only on 2026-09-05: 4 `auth.users`, 4 `profiles`, 2 `projects`,
  2 `sites`, 1 `storage.objects` row. The owner ruled they are cleared before launch rather than now,
  because deleting rows from the live database is worth doing once, deliberately, with a written-down
  step. TRIGGER: the story that opens signup to real people, before the first real account exists.
  Deleting the four `auth.users` rows cascades the rest; the `storage.objects` row has no FK to
  `auth.users` and must be deleted by its `11111111-…/` name prefix separately.

### DW-10: the container's storage stand-in permits deletes that hosted Supabase forbids

plain: FIXED 2026-09-05 — the offline copy now has the same lock the real file store has, so a test that would fail for real now fails offline first.
status: closed
closed: 2026-09-05 — `PRELUDE.sql` now installs `storage.protect_delete()` and its
  `protect_objects_delete BEFORE DELETE ... FOR EACH STATEMENT` trigger. The function body was READ
  FROM THE HOSTED CATALOGUE (`pg_proc.prosrc`, the app's project) and pasted verbatim rather than
  written from memory — AD-23. Reading it also surfaced something guessing would have missed: the
  platform's refusal has an escape hatch, `set storage.allow_delete_query = 'true'`, which is how a
  deliberate SQL cleanup is done. Both halves are modelled; a stand-in that only refused would be a
  different lie from one that only permitted.
  CONTROLS (standing rule 2), in a container: a direct `delete from storage.objects` now returns the
  IDENTICAL message hosted returned — `ERROR: Direct deletion from storage tables is not allowed.
  Use the Storage API instead. / HINT: This prevents accidental data loss from orphaned objects.` —
  and with the escape hatch set, `DELETE 1`, 0 rows left. The gate is unaffected: exit 0, 72 PASS.
  Checked before changing anything, because a BEFORE DELETE trigger could have broken the proof:
  `rls.sql` only ever INSERTs into `storage.objects`, `storage.objects.owner` carries no FK to
  `auth.users` so the fixture's user deletion does not cascade into it, and TRUNCATE does not fire a
  DELETE trigger, so the D6 assertion is untouched.
was_status: open
severity: medium
origin: Story 1.2 review (2026-09-05), found by DW-9 failing on the live database
location: _bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/PRELUDE.sql
reason: Hosted `storage.objects` has `protect_objects_delete BEFORE DELETE ... FOR EACH STATEMENT
  EXECUTE FUNCTION storage.protect_delete()`, which refuses any direct SQL DELETE and points at the
  Storage API. `PRELUDE.sql`'s stand-in creates `storage.objects` with no such trigger, so the
  container permits a DELETE the real platform rejects. This is the AD-23 class — an uncited
  assumption about an external platform baked into a stand-in — and it cost a failed run against the
  live database to find, which is the cheap version of finding it. Two things follow: PRELUDE.sql
  should grow the trigger so the container models the platform, and any RLS-TEST assertion that
  deletes from `storage.objects` is currently proving something about the stand-in only. Neither is
  urgent — no story deletes storage rows yet — but the first story that does will be built on the
  wrong model unless this is fixed first.

### DW-11: the export's section render kits disagree with the Calibration Set on two Style Pack accents

plain: Two files in the design export give two different oranges for one colour scheme and a purple versus a blue for another; the story that builds the colour schemes must take them from the product plan, not from either file.
status: open
severity: low
origin: Story 1.3 create (2026-09-05), found while distilling the frames
location: _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/a29-kit.js · Calibration Set.dc.html
reason: The `*-kit.js` token objects (`PACKS` in `a29-kit.js:1-40`, same in the other five kits) and
  the Calibration Set's hero strips (`Calibration Set.dc.html:41-96`) disagree: Tangerine's accent is
  `#E8450A` / `#FF6B33` in the Calibration Set and `#E8541F` / `#F27C4A` in the kits; Ink's accent is
  purple `#7C5CFF` / `#9B82FF` in the Calibration Set and blue `#2F6FED` / `#5A8CF5` in the kits.
  Paper agrees. The Calibration Set says of itself (`:21`) that it is "aesthetic reference, NOT
  per-variant specs — Appendix A of the PRD wins on any conflict", and the twelve packs' values live
  in PRD Appendix D under AD-30's computed-or-authored rule. So the owning document already exists and
  neither export file is it. Story 6.1 (the token engine) and 6.2 (the twelve presets) must read
  Appendix D and treat both export files as calibration; the Style Pack tokens are out of Story 1.3's
  scope entirely (app chrome only). Logged so the disagreement is not rediscovered in E6 as a
  "which file is right" question when the answer is "neither, by the file's own header".

### DW-12: nothing in the app can read `feature_flags`, so the one flag it has resolves to its seeded value

plain: The on/off switches meant to be flippable without a redeploy cannot actually be read by the website yet; the one switch that exists is off, which is what it should be today, so nothing is broken — the story that first needs a switch ON has to build the reader.
status: closed
severity: medium
origin: Story 1.4 dev (2026-09-05), found while gating S1a's passkey button
location: apps/web/lib/flags.ts · supabase/migrations/20260904120000_complete_schema.sql:1175
reason: The spine's Feature-flags row says flags are rows "read server-side per request", and the
  schema grants `select on public.feature_flags` to `service_role` ONLY, with RLS on and no policy.
  The app reads with the publishable key — Story 1.4's Keys boundary keeps the secret key out of the
  shell entirely — so any query it makes is refused. `passkeysEnabled()` therefore returns the seeded
  value (`false`) rather than making a round trip that is guaranteed to fail on every render of the
  sign-in page. That is behaviourally identical today, and it stops being identical the moment a flag
  must be ON. Story 2.1 is that moment: it flips `passkeys` and needs a server-side reader holding
  `SUPABASE_SECRET_KEY` (or a narrow `security definer` function granted to `authenticated`, which
  would keep the secret key out of the app and is the smaller change). Whichever it is, it is one
  file — `apps/web/lib/flags.ts` — and the decision belongs to the story that needs the flag on.
closed: Story 2.1 dev (2026-09-06). The secret-key client won: `supabaseAdmin()` in
  `apps/web/lib/supabase/server.ts` — cookie-less, built lazily and once, never handed user input,
  called only from `lib/flags.ts` today. The `security definer` function would have been a migration plus a
  SCHEMA.sql change plus an RLS-TEST assertion plus a gate run for one boolean, while the key is
  already in production and unread, and the next two privileged server reads (2.6's purge, E3's
  Vault) want this same client. `passkeysEnabled()` now reads BOTH switches — our row and GoTrue's
  own `passkeys_enabled` — `cache()`d per request and fail-closed; the pure combinator is
  `apps/web/lib/flags-rule.ts` with `apps/web/flags-rule.test.ts` on its cases.

### DW-13: `@supabase/ssr`'s `cookieOptions.maxAge` is inert, and it fails silently

plain: The obvious way to say "keep people signed in for thirty days" does nothing at all, with no
  error — we found it by reading the cookie the real server sent back, and the fix is in place; this
  is written down so nobody puts the broken version back.
status: closed
severity: medium
origin: Story 1.4 dev (2026-09-05), found by reading a real Set-Cookie header
location: apps/web/lib/supabase/cookies.ts · apps/web/session-cookie.test.ts
reason: `createServerClient(url, key, { cookieOptions: { maxAge } })` reads like the way to set the
  session lifetime and is ignored: 0.12.6 builds every write as
  `{ ...DEFAULT_COOKIE_OPTIONS, ...options.cookieOptions, maxAge: DEFAULT_COOKIE_OPTIONS.maxAge }`
  (`dist/main/cookies.js:231`), so its own 400-day default is spread last and wins. Executed against
  the real project on the production build: `Max-Age=34560000`, no warning anywhere, and FR-A6's
  thirty days quietly not in force. The fix is `sessionCookie()`, applied inside our own `setAll` at
  all three write sites, and it carries the branch that matters — `maxAge: 0` is a DELETION and is
  passed through untouched, because stretching that one to thirty days would leave a user signed in
  after pressing Sign out. `session-cookie.test.ts` holds all three claims. Closed by this story;
  recorded because the inert form is the one a future story will reach for.

### DW-14: `sessions_inactivity_timeout` is a paid Supabase feature and the project is not on that plan

plain: One session setting we asked Supabase for needs their paid plan, so it was not applied. Nothing
  about the thirty-day sign-in depends on it — it is only worth revisiting if a later story wants
  sessions to expire after a period of doing nothing, and that would be a decision about money.
status: open
severity: low
origin: Story 1.4 dev (2026-09-05), executed against the live project
location: tools/probe/configure-supabase-auth.py (the SOFT block)
reason: `PATCH …/config/auth` answered `402 "User sessions can only be configured on Pro Plans and up."`
  The tool retried without that one field and wrote the other eighteen, and `--check` reports it as a
  stated `----` rather than a PASS, so it can never be mistaken for applied. Nothing in Story 1.4 needs
  it: FR-A6 is thirty days ROLLING, which is the cookie's `Max-Age` plus the refresh in `proxy.ts`, and an
  inactivity timeout of a DIFFERENT length would work against that rather than with it. The 720 hours the
  tool asks for is thirty days — the same window — so a plan upgrade applying it silently would change
  nothing; a SHORTER one is the thing that would need arguing, and that is the decision below (second
  review, 2026-09-05, correcting this sentence, which read as though any inactivity timeout was opposed). Story 2.4 (end every session
  everywhere) is the first story that might want it; if it does, the choice is Supabase Pro or an
  application-level last-seen check, and the first one costs money, so it is the owner's call and should
  be put to him in that story rather than assumed here.
  **Story 2.4 looked (Create, 2026-09-07): it does not need it.** Sign-out-everywhere is GoTrue's core
  `POST /logout?scope=global`, not the paid session feature; no inactivity timeout is asked for and the
  question about money stays unasked. Still open for any later story that wants idle sessions to end.

### DW-15: the dashboard placeholder's Paper colours are read off D4a's pack cell, because Appendix D names no hex

plain: The little wireframe on each project card is coloured with the "Paper" colour scheme, and the only
  place those three colours are written down today is a drawing; the story that builds the colour
  schemes properly must replace them from the product plan, and the card will follow automatically.
status: open
severity: low
origin: Story 1.5 create (2026-09-05), found while reading D4a and Appendix D together
location: apps/web/lib/style-pack.ts (PRESETS, once Story 1.5's Dev run writes it) · prd.md Appendix D
reason: FR-B1 derives the placeholder from the pack's accent and surface. PRD Appendix D is the owning
  document for the twelve packs (DW-11) but carries vibes and font pairings, no values; the export draws
  Paper's three dots once, on D4a's Style Pack cell (`#FBF9F5`, `#D96C3F`, `#232019`), and the S3 cards
  themselves are drawn in chrome colours, not pack colours. Story 1.5 therefore reads the placeholder
  through the column's one schema (`placeholderFor`) with Paper's three values as pack DATA, never as
  app tokens, and falls back to Paper for any preset it does not know. Story 6.2 (the twelve presets)
  owns replacing `PRESETS` from Appendix D; nothing on the card changes shape when it does.


### DW-16: the browser-only invariants three of Story 1.5's defects were, are held by no repeatable check

plain: Three of the faults found while building the dashboard could only be seen by opening the page in
  a real browser — menus that were always visible, windows that opened in the corner. They are fixed,
  but nothing re-checks them automatically: if one came back, every automatic test would still pass and
  the site would publish. Someone has to look. A browser-driven test running in CI is what would close
  it, and that is a decision about time and cost rather than a bug to fix.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `tools/probe/run-verify-dashboard.py` is the repeatable check
  — a browser against the deployed dashboard with two fixture accounts. `overlays-sheet`,
  `overlays-menu` and `overlays-account` each measure the overlay BEFORE its trigger is pressed
  and again after: not visible (the platform's own `checkVisibility`) and not in the tab order
  (every control inside is focused and the focus read back), then visible and reachable, which is
  the control. `centred` reads the modal's rendered box against the viewport rather than a class
  name, because flush-to-the-top-left was the defect and a class list is not a position;
  `cancel-focus` proves the confirm opens on Cancel.
severity: medium
origin: Story 1.5 review (2026-09-05), Verification Gap layer
location: apps/web/app/(app)/app/(authed)/project-menu.tsx · new-project-sheet.tsx ·
  components/shell/shell.tsx · components/shell/account-menu.tsx (the `open:` display variant and the
  `m-auto` dialog centring) · .github/workflows/ci.yml
reason: Story 1.5's own Spec Change Log records five executed defects; three were browser-only — every
  popover permanently on screen because an author `display` beats the UA's `[popover]:not(:popover-open)`
  rule, every modal flush to the top-left because Preflight resets the UA's centring margin, and no
  confirm opening on Cancel because React leaves no `autofocus` ATTRIBUTE for `showModal()` to find.
  Each is now a class or a line in a component, and `pnpm lint`, `pnpm typecheck`, `pnpm test` and the
  RLS gate are all blind to every one of them: deleting `open:` from the ⋯ menu leaves the whole gate
  green and CI publishes a dashboard with three menu items loose in every card's tab order. The Dev run
  caught them with a Playwright session and a compiled-CSS grep, both typed by hand. The repository has
  no browser harness in CI and adding one is a new capability with a real minutes cost, so it is not a
  patch this review can apply. Story 15.1 (the e2e suite, including the keyboard-only journey) is the
  story that owns it; if the owner wants it sooner, the cheapest useful step is one Playwright job
  asserting each overlay is not visible before its trigger is clicked.

### DW-17: the authenticated group has no `error.tsx` and no `not-found.tsx`, so a failure leaves the shell

plain: If something goes wrong loading a page, or you click one of the links whose screen has not been
  built yet, you get a bare browser error page instead of the app — the left column and everything else
  disappears, and the only way back is the Back button. The app should keep its frame around those
  messages. **The error half is done: the owner met this on 2026-09-05 (his findings 3 and 8 — "This
  page couldn't load"), so Story 1.5's Fix run added the app's own error page.** What is left is the
  "not found" half: the six links whose screens are not built yet still answer with a bare page.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the not-found half closes.
  `apps/web/app/(app)/app/(authed)/not-found.tsx` renders M9 404's words in the app's own Kit
  INSIDE the shell, and `(authed)/[...unbuilt]/page.tsx` is what puts an unmatched url inside the
  group at all — an unmatched url renders the ROOT not-found, which is exactly why this entry
  survived two stories that added a `not-found.tsx` to their own segment. The error half closed at
  Story 1.5's Fix.
severity: low
origin: Story 1.5 review (2026-09-05), Blind Hunter layer
location: apps/web/app/(app)/app/(authed)/ (no error.tsx, no not-found.tsx)
reason: Story 1.5 adds two database reads to the layout and four server actions; `supabaseServer()`
  throws outright on a missing key, and any throw inside the group now renders Next's default error page
  outside the shell. The page-level half is handled — a failed projects read renders the kit's error
  Banner inside the shell (this review) — but a throw in the LAYOUT cannot be, because the layout is
  what would have to catch it. Separately, the six drawn-and-linked destinations (`/sites`, `/assets`,
  `/account`, `/billing`, `/suggestions`) 404 outside the shell, which the owner's test for 1.5 records
  as expected and which a `not-found.tsx` inside the group would improve rather than fix. Both are
  boundary files the whole `(authed)` group shares, so the story that adds the first of those screens —
  Epic 2's account settings, or Epic 3's Sites — is where they belong, drawn from the export's own
  error surface rather than invented here (R-74).
closed-part: Story 1.5's Fix run (2026-09-05) added `apps/web/app/(app)/app/error.tsx`, at the `/app`
  segment rather than inside `(authed)` so that it catches a throw in the SHELL as well as in a page —
  an `error.tsx` never catches its own segment's layout, and `revalidatePath` after a write re-renders
  the shell and the page together. The owner's bare "This page couldn't load" is therefore no longer
  reachable from anything that throws under the app host. STILL OPEN: `not-found.tsx`. A nested one
  would not help the six unbuilt destinations anyway — an unmatched URL renders the ROOT not-found, so
  the fix is a catch-all route inside the group, which is the first story with a second real screen's
  to write, not this one's. Until it exists, every dashboard load also logs two `Failed to load
  resource` lines in the console — `<Link>` prefetches `/sites` and `/assets` and each answers 404
  (second review, 2026-09-05, on the live site); the same catch-all ends that noise.

### DW-18: a statically prerendered page can run no script under either CSP, and the marketing home page throws because of it

plain: The public home page at inflozo.com loads and looks right, but none of its code actually runs —
  the security rule the site sends blocks it — and the browser records an error behind the scenes.
  Nothing on that page needs code today, so nobody can see the difference; the moment a button or a
  form goes on it, that button would not work. The same is true of the "not found" pages inside the
  app. It should be fixed before Epic 14 writes the real marketing pages.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the APP half closes: unmatched app urls are now served by the
  catch-all, a dynamic route carrying the nonce, so `'strict-dynamic'` no longer blocks every
  script on them. The MARKETING half closes with the owner's ruling at this story's Question 1
  (option 1, 2026-09-11): `policy()`'s marketing branch gains `'unsafe-inline'` in `script-src`
  and the app branch is untouched, with `csp.test.ts` asserting in both directions that the app
  policy can never carry it.
amended: BOTH HALVES CLOSE HERE — the app half with the catch-all, the marketing half with the
  owner's Question 1 ruling.
severity: medium
origin: Story 1.5 Fix run (2026-09-05), hunting the owner's findings 3 and 8 on the real site
location: apps/web/csp.ts · apps/web/proxy.ts · the prerendered routes `○ /` and `○ /_not-found`
reason: The nonce is stamped into script tags PER REQUEST, so a prerendered page has none — its HTML
  was written at build time. Both policies then block it, for opposite reasons. Executed 2026-09-05
  with Playwright against production and against a local `next build && next start`, identically:
  `https://inflozo.com/` (marketing, `script-src 'self'`) reports two blocked INLINE scripts — Next's
  own flight-data bootstrap — and throws `Minified React error #412`, uncaught; `https://app.inflozo.com/sites`
  (the root `not-found`, prerendered, served under the app host's `script-src 'self' 'nonce-…'
  'strict-dynamic'`) reports EVERY script on it blocked, inline and external both (eight that day,
  ten at the second review — the figure is the page's script count and moves with each build),
  because `'strict-dynamic'` discards the `'self'` allowlist and every tag lacks the nonce — that page
  boots no JavaScript at all.
  The control passed: `app.inflozo.com/sign-in` and `/app` are dynamic, carry the nonce, and report
  zero blocked scripts and no page error, in the same run. Nothing visible is broken today — marketing
  is one static line and the 404 has no controls — which is why this is deferred rather than patched
  into a story about the dashboard. It is not Story 1.5's: the policies are Story 1.4's and the
  marketing pages are Epic 14's. The fix is a real choice between three, and belongs with whoever owns
  it: allow `'unsafe-inline'` on the marketing policy only (weakest, simplest), give marketing a
  build-time hash allowlist, or make the two prerendered routes dynamic and pay §18's prerender cost.
  **Story 1.4's `## Verification` claim of "console 0 CSP violations" on both hosts did not hold for
  marketing** and should be re-read when this is picked up.

### DW-19: the First Run screen S2a is drawn, is in the UX spine, and is named by no story

plain: The very first screen a brand-new customer should see after signing up — the one offering "connect your Ghost site", "start from a starter" or "blank canvas" — is drawn and designed, but no piece of work anywhere is scheduled to build it. Unless a story claims it, new customers will land straight on an empty dashboard instead.
status: closed
closed: Story 3.2 Create (2026-09-08) — the owner ruled option 1 of its Question 1: First Run is Story 3.8,
  the last story of Epic 3, planned after 3.4 so the Recommended door runs connect → auto-brand → a project;
  added to `epics.md` and `sprint-status.yaml` in the same commit. **BUILT by Story 3.8 (Dev, 2026-09-11):**
  S2a is `app/(app)/app/(authed)/start/`, reached from `/` while the account has no project and no connected
  site, with `lib/first-run.ts` holding the rule and every word of the screen. Nothing is remembered about it
  (the owner's Question 1 ruling, option 1, 2026-09-11), so no column and no migration.
severity: medium
origin: Story 1.5 owner test, second round (2026-09-06) — the owner compared the New project window to S2a, which surfaced this
location: _bmad-output/planning-artifacts/epics.md · _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/S2 Onboarding.dc.html
reason: `S2 Onboarding.dc.html` draws **S2a First Run** — a full 1440 page, "Let's make your Ghost site
  gorgeous.", three cards (Connect your Ghost site · Recommended, Start from a starter, Blank canvas) and
  the line "You can do all of this later." `EXPERIENCE.md` § Onboarding lists it as a surface reached from
  first sign-in, and both `ux-designs/prototype/first-run.html` and `ux-designs/walkthrough/first-run.html`
  render it. Grepping `epics.md` for it returns nothing: `S2b·1`, `S2b·2` and `S2c` are each named by an
  Epic 3 story, S2a by none. `EXPERIENCE.md` records the New Project Sheet as drawn *from* S2a + B23a, which
  is the likeliest explanation — the sheet may have been intended to absorb First Run — but nothing says so,
  and standing rule 6 is flag, do not guess. The decision is whose: either an epic claims S2a (Epic 3 is the
  natural home, since its first card is "connect your Ghost site"), or a ruling records that First Run is
  deliberately not built and the dashboard's empty state S3b is the first-run experience. Story 1.5 fixes
  neither — it owns the dashboard, not the onboarding route.

### DW-20: the four project actions' guards are consulted by no repeatable check

plain: The dashboard refuses a second project on Free, refuses a delete unless the project's exact name is
  typed, and refuses to touch another user's project. The rules themselves are tested automatically, but
  nothing automatic checks that the code actually asks them before writing — a slip that skipped one of
  them would pass every test and publish. Today a person proves it on the live site at every phase.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `run-verify-dashboard.py`'s `cap`, `delete-typed`,
  `delete-control`, `cross-rename` and `cross-delete`: each guard is proved CONSULTED by the row
  count or the row itself read off the pooler, never by the sentence on screen. `delete-control`
  is why `delete-typed` is a result — a delete that never ran also leaves the row alone.
severity: medium
origin: Story 1.5 third review (2026-09-06), Verification Gap layer
location: apps/web/app/(app)/app/(authed)/projects/actions.ts (`createProject`, `duplicateProject`,
  `renameProject`, `deleteProject`) · apps/web/plan.test.ts · apps/web/projects.test.ts
reason: `atCap`, `matchesName`, `copyName` and `uniqueSlug` are pure and under `node --test`; the actions
  that call them are `'use server'` modules that `node --test` cannot import, and no test posts to them.
  Deleting the `matchesName` line from `deleteProject`, or inverting `atCap` in `createProject`, leaves
  `pnpm check` and the RLS gate green (the gate sees policies, not application code). Each phase's live
  pass — the spec's `## Verification` — is what holds it, by hand, with two fixture users. The repeatable
  form is either a rerunnable probe in `tools/probe/` that posts to the four actions on a deployment and
  asserts row counts (the `run-verify-all.py` pattern), or lifting each "decide, then write" into a pure
  `decide*` that a test can reach. Same class as DW-16 (held by no repeatable check); Story 15.1's e2e
  suite is the natural owner, and the probe is the cheaper interim.

### DW-21: the documentation gate runs only in the local pre-commit hook, never in CI

plain: The check that keeps the planning documents, the boards and the catalogue consistent runs on this
  machine before each commit, and nowhere else. A commit made from a clone that has not installed the
  hooks — or any tool that commits directly — publishes without it.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `ci.yml`'s `check` job runs `python3 tools/doc-audit.py
  --check`, before `pnpm build` so a red gate is cheap. `python3 tools/story-board.py` runs first,
  and it has to: STORY-BOARD.html reads `git log` and the pre-commit hook stages it before the
  commit exists, so the committed copy is one commit behind BY CONSTRUCTION — executed on a fresh
  clone of HEAD, where the naked gate is red. Everything the entry named is still checked, the
  sub-tools' own self-checks included.
severity: low
origin: Story 1.5 third review (2026-09-06), Verification Gap layer
location: tools/hooks/pre-commit · .github/workflows/ci.yml
reason: `ci.yml`'s `check` job runs `pnpm check` and `pnpm build`; `rls` runs the database gate; neither
  runs `python3 tools/doc-audit.py --check`, so `story-board.py`'s self-check (the parser that decides
  whether the owner ever sees a question, R-83/R-84) has no runner outside `core.hooksPath`. Adding a
  fourth job, or a step to `check`, is a one-line change to a workflow the owner rules over (DW-7 made CI
  the publishing gate), so it is recorded rather than applied by a story about the dashboard.

### DW-22: no key in this repository can read whether an email was delivered

plain: We can send email through Resend and prove the send was accepted, but nothing here can look at
  Resend's own log to see whether a message reached an inbox, bounced, or was marked spam. Today only the
  owner can answer that, by looking in his inbox.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — closed at Create — the owner made the reading key the same
  day and the read executed with its full control set. See the story's `## Verification`.
severity: medium
origin: Story 1.5 fourth Fix run (2026-09-06), the owner's fourth test, finding 1
location: tools/probe/.env (`RESEND_API_KEY`) · apps/web/app/(app)/app/sign-in/actions.ts ·
  apps/web/lib/email.ts (Story 2.5, the app's own sender) · Epic 12
reason: Executed 2026-09-06 and RE-EXECUTED by the fifth review the same day: `GET
  https://api.resend.com/emails`, `/domains` and `/api-keys` with `RESEND_API_KEY` each answer **401,
  `restricted_api_key`, "This API key is restricted to only send emails"** — it is a send-only key. (The
  first pass recorded `403 / error code: 1010`; that is Cloudflare refusing the client before Resend sees
  the request, not Resend's answer. The control set separates them: no key → `401 missing_api_key`, a
  bogus key → `400 validation_error`, this key → `401 restricted_api_key`.) So a story can prove GoTrue accepted the SMTP
  hand-off (200) and can prove a refusal (429), but "did it arrive" leaves the repository and becomes a
  line in `## Owner's manual test`. That is tolerable for one magic link and is NOT tolerable for **Epic
  12**, which builds five or six transactional emails whose whole acceptance is delivery. The fix is one
  credential — a Resend key with read access, beside the sending one — and it is the owner's to create,
  so it is recorded rather than assumed. Story 2.3 (2026-09-07) meets the same wall a second time:
  `run-verify-email-change.py` proves the HAND-OFF — `email_change_sent_at` moved, or did not — and
  cannot prove the email arrived, so FR-P1's email (2) is read by the owner and by nobody else. Its
  `--to` points that one real send at an inbox a human can open, which is the whole of the workaround.
  Story 2.5 (Create, 2026-09-07) meets it a third time: the deletion confirmation email — FR-P1's eighth,
  the owner's ruling R-96 the same day — is sent by the app through `POST /emails` and the
  harness can see the deletion, the rows, the page and the download but never the inbox; the app logs
  Resend's status and id, and delivery is step 5 of that story's owner's manual test. Its Dev run
  (2026-09-07) is the first send the APP makes rather than GoTrue: `apps/web/lib/email.ts` is the one
  `fetch`, and `deletion: email sent { id }` in the deployment's log is the whole of the hand-off this
  repository can see.


### DW-23: `pro_past_due` grants Pro for ever, because nothing expires the grace window

plain: If someone's card fails, we keep them on Pro for a grace period so their sites stay up. The
  database has a column for when that grace runs out, but nothing reads it yet — so today a failed
  payment leaves the account on Pro indefinitely rather than for seven days. Nobody is in that state
  now, and Epic 12 (billing) is where the clock gets connected.
status: open
severity: medium
origin: Story 1.5 fifth review (2026-09-06), Blind Hunter layer
location: apps/web/lib/entitlement.ts (`resolveEntitlement`) · apps/web/lib/plan.ts (`planFor`) ·
  supabase/migrations/20260904120000_complete_schema.sql:585 (`entitlements.grace_expires_at`)
reason: `planFor` maps `pro_active` and `pro_past_due` to `pro` — Appendix F.1's third column, executed
  and verified live on the chip. `grace_expires_at` is Inflozo's own 7-day window, "reconciled against
  Dodo `on_hold`" in the schema's own comment, and `resolveEntitlement` selects `state` alone, so the
  window has no reader anywhere in the app. Enforcing it needs the Dodo reconciliation and the
  `subscriptions` read that Epic 12 brings — the resolver is already shaped for both, and AD-28 says E12
  widens this function rather than writing a second one. Half-building the expiry here would put a
  billing decision in a dashboard story with no way to test it against a real past-due subscription, so
  it is recorded and the resolver's own comment now names it beside the code.

### DW-24: `projects.slug` has no unique constraint, so two concurrent creates can collide

plain: Each project gets a short web-safe name (its "slug") that later becomes the theme's name. We pick
  one that is not already taken, but the database does not enforce it — so two projects created at the
  very same instant could end up with the same slug. It needs a database rule, and the schema is frozen
  for this epic.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `supabase/migrations/20260911100000_sweep_constraints.sql`
  adds `unique (user_id, slug)` on `public.projects`, applied by hand to production.
  `createProject` and `duplicateProject` share `insertProject`, which catches `23505` and retries
  with the next free slug (`slugAttempts` in `lib/projects.ts`, pure and tested). The RLS gate
  asserts the constraint behaviourally and the control — reverting it — turns exactly that
  assertion red.
severity: low
origin: Story 1.5 fifth review (2026-09-06), Blind Hunter layer
location: apps/web/lib/projects.ts (`uniqueSlug`) · apps/web/app/(app)/app/(authed)/projects/actions.ts
  (`createProject`, `duplicateProject`) · supabase/migrations/20260904120000_complete_schema.sql:212
reason: `uniqueSlug` reads the taken slugs and then inserts, which is a read-then-write with no database
  backstop: `projects.slug` carries no unique index (and `slug` is correctly absent from the update grant,
  FR-J10, so a collision can never be repaired by a rename either). The window is the milliseconds between
  the count and the insert and needs two requests from one user to overlap, which is why it is low; the
  in-flight guards this review added to Create and Duplicate narrow it further without closing it. The
  real fix is `unique (user_id, slug)` plus a retry on `23505`, and it is a migration — DW-8 froze the
  schema's migration for this epic, so it belongs to the story that next opens one rather than to a
  dashboard story reaching into a frozen file.

## Deferred from: code review of story-1.5, sixth review (2026-09-06)

### DW-25: the sign-in card has no skeleton on a cold load, because the shell's reads run above it

plain: When you open the dashboard fresh, there is a moment where the page is blank instead of showing
  the grey outline of the cards. The outline only appears when you move around inside the app, not on
  the first load. Cosmetic, and only on a slow connection.
status: open
severity: low
origin: Story 1.5 sixth review (2026-09-06), Blind Hunter layer
location: apps/web/app/(app)/app/(authed)/layout.tsx · apps/web/app/(app)/app/(authed)/(dashboard)/loading.tsx
reason: `loading.tsx` sits BELOW `(authed)/layout.tsx`, and that layout awaits `currentUser()`, the
  `profiles` read and `resolveEntitlement` before it renders anything — so the skeleton covers client
  navigations inside the group but not the first paint, which is a blank document for those round trips.
  The comment on `loading.tsx` promises "skeleton cards, never a spinner" without that qualifier. The fix
  is a Suspense boundary around the layout's own data, or moving those reads below it; both change the
  shell's render shape, which is more than a review should do to a story the owner has already tested
  four times. It costs nothing correctness-wise and the shell's reads are one round trip on `fra1`.

### DW-26: the nav's unbuilt destinations land on Next's own unbranded 404, outside the shell

plain: Sites, Assets, Account settings, Billing & plan, Suggestions and Docs are all drawn and clickable
  but not built yet — that is expected. What is not ideal is where a click lands: a plain unstyled "404"
  page with no sidebar and no way back except the browser's Back button.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — closed with DW-17 by the same route: the nav's unbuilt
  destinations now land on Inflozo's own not-found inside the shell, with the sidebar, the account
  menu and a way home.
severity: low
origin: Story 1.5 sixth review (2026-09-06), Blind Hunter layer
location: apps/web/components/shell/shell.tsx (the nav) · no `not-found.tsx` exists under apps/web
reason: The owner accepted the 404s explicitly — the spec's plain English says these "show 'not found'
  until their own epics build them — expected, not a fault" — so this is not a defect against the story.
  But it is the same unbranded-page class DW-17 and `error.tsx` were opened for, and a `not-found.tsx`
  inside `(authed)` would render within the shell and keep the nav on screen. Deferred rather than
  patched because each of those routes belongs to a later epic that will replace the 404 with the real
  page anyway, and adding a branded interim 404 now is work those epics delete. If E3 or E4 slips far
  enough that the owner meets these often, this is a fifteen-line file.

### DW-27: the desktop search has no control that clears it

plain: On a computer, once you have typed in the project search there is no × to clear it — you have to
  select the text, delete it and press Enter. The phone has a close button that does clear it.
status: open
severity: low
origin: Story 1.5 sixth review (2026-09-06), Blind Hunter layer
location: apps/web/components/shell/shell.tsx (`[&::-webkit-search-cancel-button]:hidden`) ·
  apps/web/app/(app)/app/(authed)/page.tsx (the "No projects match" line)
reason: The native cancel button is hidden deliberately — S3's frame draws no × in the field — and the
  phone's toggle got a `router.replace` in the fifth review because closing it stranded the filter. The
  desktop case is not stranded: the field is always visible with its text in it, so the state is legible
  and Enter on an empty field clears it. Adding a × would depart from the frame (R-74), and a "Clear
  search" link in the no-match line is a copy decision, which makes it the owner's rather than a
  reviewer's. Worth raising with him when a later story touches the dashboard's empty states.

### DW-28: `duplicateProject`'s column list is hand-maintained against the schema

plain: Duplicating a project copies its settings by naming each one. When a later part of the product
  adds a new setting, the copy will silently leave it behind unless someone remembers to add it here.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `apps/web/projects.test.ts` reads the `grant insert (…) on
  public.projects` out of `supabase/migrations/` and asserts every granted column is either in
  `duplicateProject`'s select list or named in the test as deliberately not copied, with its
  reason. The control: removing `credit_enabled` from the select list turns it red and the failure
  NAMES the column.
severity: medium
origin: Story 1.5 sixth review (2026-09-06), Edge Case Hunter + Blind Hunter layers
location: apps/web/app/(app)/app/(authed)/projects/actions.ts (`duplicateProject`'s select list)
reason: The select list is spread straight into the insert, so a column added by E6 (the Style Pack
  editor), E7 or E9 is dropped from every duplicate with no test, type or gate reacting — the duplicate
  simply comes back with a default the original did not have. `linked_site_id`'s deliberate omission is
  recorded in a comment; the omissions nobody intended are not checkable at all. The fix belongs with
  whoever next widens `projects`: either derive the list from the update grant, or add a test that reads
  the migration's insert grant and asserts every non-identity column is either copied or named as
  deliberately not. Not done here because the check has to read `supabase/migrations/`, and this story's
  own test file deliberately stops at `apps/web`.

### DW-29: `resolveEntitlement`'s "a failed read is Free" rule is reachable by no test

plain: If the billing lookup fails, the app is meant to treat you as being on the Free plan rather than
  guessing. That rule is one character of code and nothing checks it.
status: open
severity: low
origin: Story 1.5 sixth review (2026-09-06), Blind Hunter layer
location: apps/web/lib/entitlement.ts (`planFor(data?.state)`)
reason: AD-28's degradation rule is the `?.` in `planFor(data?.state)`, inside a `cache()`d server module
  that imports `next/headers` and is therefore outside `node --test`'s reach — the same wall that sent
  `shell-user.ts`, `sentStateFor`, `signOutPathFor` and `nextIndex` into pure modules. `planFor(undefined)
  === 'free'` IS asserted in `plan.test.ts`, so the rule is half-held; what is not held is that the
  resolver passes `undefined` rather than throwing on a failed read. Closing it properly means a fake
  Supabase client, which is the first mock in this codebase and cuts against R-82 — worth doing when E12
  gives `resolveEntitlement` its second reader (the grace window, DW-23) and the branch count justifies it.

### DW-30: `passkey_labels` rests on a premise the installed library falsifies

plain: The database had a small table for the names of your passkeys, built on the belief that Supabase could not store a name itself. It can. The table was empty and unused, so Story 2.2 deleted it — one place for one name.
status: closed
severity: low
origin: Story 2.1 create (2026-09-06), planning the auto-name
location: supabase/migrations/20260904120000_complete_schema.sql:127-136 · SCHEMA.sql (`passkey_labels`) · epic-2-context.md
reason: The schema comment (2026-08-20) says Supabase's passkey API "carries no user-editable label, so the
  label is ours". Read in the installed source on 2026-09-06 — `@supabase/auth-js` 2.115.0,
  `dist/module/lib/types.d.ts:2387-2390, 2438-2442` — every passkey carries `friendly_name` and
  `auth.passkey.update({ passkeyId, friendlyName })` is `PATCH /passkeys/{id}` (max 120 chars). Story 2.1
  therefore writes the AAGUID auto-name there and never touches `passkey_labels`. Story 2.2 (rename, revoke)
  decides whether the table is dropped by a new migration or kept for something the platform cannot hold;
  a comment beside the table in SCHEMA.sql records the finding in 2.1's Dev run. The frozen migration is
  not edited.
closed: Story 2.2 Dev (2026-09-07) — DROPPED. `supabase/migrations/20260907120000_drop_passkey_labels.sql`
  removes the table; `SCHEMA.sql` loses it, its RLS line and its three list memberships and keeps the
  finding as a comment where the table used to be; `ARCHITECTURE-SPINE.md`'s FR-A row and
  `epic-2-context.md` say so. The table never held a row: 2.1 wrote the auto-name to Supabase's
  `friendly_name` and 2.2 writes the user's rename to the same field. `run-rls-gate.sh` is green, and
  its control — the same run with the migration file moved away — reports `SCHEMA DRIFT` naming
  `passkey_labels`, which is the proof the gate can see the drop.

### DW-31: the new Inflozo identity is in the export and nothing in the product uses it yet

plain: Inflozo now has a proper logo — an icon mark ("Nest": three concentric rounded squares with a live core), the mark-and-wordmark lockups, a favicon and app icon, and a 2.9-second launch animation — and every logo the product shows today is still the old wordmark alone. Replacing them is its own story, not a fix inside another one; the huge faded background wordmarks (the Sign In page's watermark and any like it) stay as they are.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — verified and closed. Every surface in the app renders
  `Lockup`/`Mark` from `components/kit/logo.tsx` (grepped: the only wordmark-as-text left is the
  EMAIL shell's, where Gmail strips SVG and Story 1.6 built the mark-PNG-plus-word pair
  deliberately); `app/icon.svg` is `favicon-16.svg` plus the dark-tab `<style>`, and
  `apple-icon.png` is the export's app icon. Story 1.6's own spec said this flip was owed "with
  the story's Done commit, not before" and it never happened; 1.6 is `done`.
severity: medium
origin: the owner, 2026-09-06 ("Down the line I would like all logos to be replaced with the new one. The huge background wordmarks can stay. Rest can be replaced. This will be done as a new/diff story.")
location: _bmad-output/planning-artifacts/design/claude-design-export/Logo/export/Inflozo Logo/ (README.txt, assets/*.svg, Inflozo Logo.html)
reason: The export's frames and the kit built from them (Story 1.3) draw the wordmark only — the shell's
  top bar and sidebar, the account drawer, the Sign In card, the magic-link email, the marketing pages'
  headers and the browser favicon. The new export carries five SVG marks (light, dark, mono, favicon-16,
  app-icon), the lockup rules (mark height 1.85× the wordmark's cap height, clear space 0.28× the mark's
  height, Bricolage Grotesque 800 at -0.035em) and the CSS-only animation with `prefers-reduced-motion`
  respected. The replacement story inventories every place a logo is drawn — derived by grepping the app
  and the frames, never listed here — swaps each for the matching mark or lockup, keeps the background
  watermarks untouched by the owner's ruling, and lands the favicon and app icon. **Placed by the owner on 2026-09-06 as Story 1.6, "The new identity everywhere", at the end of
  Epic 1** (option 1 of the three put to him); this entry closes when that story is done.

## Deferred from: code review of story-2.1 (2026-09-06)

### DW-32: the passkey ceremony has no repeatable control — the kill switch, the auto-name, the round trip and the duplicate refusal are all proved by hand

plain: Four things about passkeys could only be checked by a person. Story 2.2 built a harness that checks the whole add-rename-revoke-sign-in journey by itself, and that one is done. It also asked the second-passkey question — is adding a second passkey on a device that already has one refused? — and on the deployed site, yes, it is. The last two are still by hand: that turning the switch off really stops a sign-in that was already half-way through, and that a passkey on your Mac is born with the name "Apple Passwords" rather than the plain "Passkey".
status: open
severity: low
origin: Story 2.1 code review (2026-09-06), the Verification Gap layer
location: apps/web/app/(app)/app/sign-in/actions.ts (`finishPasskeySignIn`'s flag guard) · apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx (`getAuthenticatorData()`)
reason: (1) Every passkey action refuses with `passkeys_off` when either switch is off, and that guard
  is unreachable from `node --test` (`'use server'`); the spec's Deploy list names a hand-run curl. A stale
  sign-in tab could still verify an assertion after the row is flipped off, and nothing repeatable would
  say so. The fix is a scripted probe under `tools/probe/` (a tool, so a catalogue row) that posts to each
  action with the row off and expects `passkeys_off` — re-run by 2.2, which edits the same files.
  (2) The named-AAGUID path — `getAuthenticatorData()` → offset 37 → the list's name — is proved on a
  synthetic buffer only; Playwright's virtual authenticator reports the all-zero AAGUID and proves the
  `Passkey` fallback alone, so swapping the buffer for the attestation object would name every passkey
  "Passkey" with every check green. The fix is one real `getAuthenticatorData()` buffer, base64, captured
  from the owner's first registration on the deployed site, as a fixture in `passkey-name.test.ts`.
  (3) **The round trip and the axe runs live in no file** (added by the 2026-09-06 review, Verification Gap
  layer). The Deploy run's proof — a Playwright virtual authenticator registering, then signing in, against
  `app.inflozo.com` — and every axe-core 4.12.1 sweep were driven from an improvised harness;
  `grep -rln "addVirtualAuthenticator\|axe-core\|playwright"` over the repository finds nothing. Story 2.2
  edits `passkeys-card.tsx` and `account/actions.ts`, and if it breaks the naming PATCH or the `aaguid`
  hand-off the round trip can only be re-improvised, never re-run. The fix is `tools/probe/run-verify-passkeys.py`
  in `run-verify-all.py`'s pattern, with its catalogue row — the same home (1) and (2) already picked.
  (4) **`excludeCredentials` is an unexecuted claim about GoTrue** (added by the 2026-09-06 review, Acceptance
  Auditor). The matrix's "same authenticator again -> `InvalidStateError` -> 'This device already has a
  passkey for Inflozo'" rests on GoTrue populating `excludeCredentials` in its registration options; the
  library types it only as an optional field and no run has ever attempted a second registration from one
  authenticator. If GoTrue omits it, the card silently grows a duplicate row and `ALREADY_HERE`
  (`passkeys-card.tsx`) is dead code, with every check green. One extra `create()` in the harness of (3)
  settles it.
  Closes when 2.2 lands them, or when the owner rules the manual test is control enough.
partly closed: Story 2.2 Dev (2026-09-07). **(3) is CLOSED**: `tools/probe/run-verify-passkeys.py`
  (catalogue row added) drives register -> auto-name -> rename -> revoke -> the revoked credential at
  sign-in -> the magic link, through the deployed UI with a Chrome virtual authenticator, reading every
  result back off the wire through `GET /admin/users/{id}/passkeys` rather than out of the DOM; its
  control is a 121-character rename the server must refuse, so a green run is not a run that checks
  nothing (standing rule 2). Its `--check` mode — keys, Playwright, one real create-read-delete against
  Supabase — ran green at Dev time; the full run is the Deploy phase's, because it drives the UI this
  story is deploying. **(4) IS NOW CLOSED**: Story 2.2 Deploy (2026-09-07) — the harness's `duplicate`
  step made a second `create()` on the same authenticator against `app.inflozo.com` and it was
  REFUSED, the card showing "This device already has a passkey for Inflozo." GoTrue does populate
  `excludeCredentials`; `ALREADY_HERE` (`passkeys-card.tsx`) is live code, not dead code.
  **(1) and (2) STAY OPEN.** (1) — the kill switch mid-ceremony — needs a post to a Server Function,
  whose action id is a build artifact the harness cannot address; it is still the hand-run curl in 2.1's
  Deploy list. (2) — the named-AAGUID path — needs a REAL `getAuthenticatorData()` buffer as a fixture,
  because a virtual authenticator reports the all-zero AAGUID and can only ever prove the `Passkey`
  fallback; the harness RECORDS the name the row is born with, which is that fallback, and says so.

### DW-33: two passkey paths lean on the platform to backstop them, and neither leaning has been executed

plain: The passkey sign-in buttons can be pressed by anyone who is not signed in yet, and we relied on Supabase to stop somebody hammering them without ever checking that it does; Story 2.2 checked it on the deployed site and Supabase does. Separately, the Account page's request for your passkey list had no time limit, so a slow Supabase would have left that page hanging where every other similar read gives up after three seconds; it now gives up after three seconds too.
status: closed
severity: low
origin: Story 2.1 code review, second loop (2026-09-06) — Blind Hunter and Edge Case Hunter
location: apps/web/app/(app)/app/sign-in/actions.ts (`startPasskeySignIn`, `finishPasskeySignIn`) ·
  apps/web/app/(app)/app/(authed)/account/page.tsx (`listPasskeys`)
reason: (1) The magic-link path next door carries a `SEND_INTERVAL` of its own AND two GoTrue rate limits
  configured by `configure-supabase-auth.py`. The two passkey sign-in actions are reachable signed-out and
  carry neither; the assumption is that GoTrue rate-limits its own `/passkeys/authentication/*` endpoints.
  That is a claim about an external platform and standing rule 1 says it is a hypothesis until executed —
  the execution is a burst of `startPasskeySignIn` calls against the deployed site, watching for a 429.
  (2) `passkeysEnabled()`'s two reads were given `AbortSignal.timeout(3000)` by the first review precisely
  because a platform that hangs rather than errors would hang the page. `auth.passkey.list()` sits on
  `/account`'s render path with no equivalent, and the library exposes no signal to give it, so the honest
  fix is a `Promise.race` that gives up on the render while the request runs on — worth doing only if the
  blast radius (one signed-in page, not the signed-out sign-in page) ever justifies the half-measure.
  Both are cheap to settle inside 2.2, which already opens these files.
partly closed: Story 2.2 Dev (2026-09-07). **(2) is CLOSED IN CODE**: `listPasskeys()` in
  `apps/web/app/(app)/app/(authed)/account/page.tsx` races the call against a 3s `setTimeout` — the same
  `READ_TIMEOUT_MS` ceiling `lib/flags.ts` gives its two reads — and answers `null`, which the card
  already renders as "We couldn't load your passkeys just now." It is a race and not a cancel, because
  the library exposes no `AbortSignal` for `passkey.list()`; the `ponytail:` line beside it says so.
  **(1) IS NOW CLOSED**: Story 2.2 Deploy (2026-09-07) — the `ratelimit` step's 30 posts to
  `/auth/v1/passkeys/authentication/options` against the live project got a first non-200 (429) on
  call 12 of 30. GoTrue does rate-limit that endpoint on its own; the passkey sign-in actions'
  reliance on the platform's own limit holds. **The limit is a rolling window of roughly thirty
  calls, not a fixed call number** (second review, 2026-09-07): a harness burst of 30 saw thirty
  200s, and a 60-call burst straight after saw 429 on call 4 and on 55 of 60. The harness now
  bursts wider than the window and derives the count it prints.

## Deferred from: code review of spec-1-6-the-new-identity-everywhere (2026-09-06)

### DW-34: the app's error page has never been rendered with the new lockup

plain: The page that appears when something inside the app breaks now shows the new logo, but nobody has
  ever made it appear on a screen to look — every other place the logo appears was measured in a real browser.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — rendered once, and axe run on it. A temporary throwing route
  on a LOCAL `next build && next start` (removed before the commit — nothing throwing reaches
  production), screenshotted at 1440, 834 and 390: the new `Lockup` draws, HTTP 500, and axe-core
  at WCAG 2.1 AA reported **one serious `document-title` violation** — the boundary REPLACES the
  document and no `metadata` export runs for it, so the tab read the raw url. Fixed in the same
  pass (`document.title` from the existing effect) and re-run: zero violations at all three
  widths.
severity: low
origin: Story 1.6 Dev (self-flagged) and code review (2026-09-06) — Acceptance Auditor, Verification Gap, Real-infra verifier
location: apps/web/app/(app)/app/error.tsx (`<Lockup size={20} />`)
reason: Two attempts to trip the boundary from outside failed (an RSC fetch fulfilled with a 500, and with a 200
  carrying invalid flight; Next recovered and stayed on `/app`). `node --test` strips types but not JSX, so the
  boundary cannot be rendered in a test, and a throwing route is a route change the story's Never forbids. The
  node drawn is the same `Lockup` measured at 24.41px on five surfaces, and `pnpm build` compiles the page.
  Closes when a story that owns a throwing path (or a dev-only `?throw=` behind a feature flag) renders it once
  and runs axe on it, or when the owner rules code-and-build is control enough for a page that only shows on failure.

### DW-35: Safari before version 26 shows no tab icon at all

plain: The small logo in the browser tab is an SVG file. Safari only learned to show SVG tab icons in its 2025
  release; anyone on an older Safari sees a blank tab icon, though the iPhone home-screen tile is unaffected.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `apps/web/app/icon.png` — 32x32, rendered from the export's
  own `favicon-16.svg` by the same headless Chromium that made the other two rasters (as an
  `<img>` at the target size, because the SVG carries `width="44"` and a 32px viewport CROPS it —
  executed). `icon.png` is in `proxy.ts`'s matcher, and `routing.test.ts` derives the icon list
  from the directory, so a missed matcher entry fails by itself — proved by removing it and
  watching it go red.
severity: low
origin: Story 1.6 code review (2026-09-06) — Blind Hunter; cited from caniuse `link-icon-svg` (Safari 3.1–18.7 not supported, 26.0+ supported)
location: apps/web/app/icon.svg · apps/web/proxy.ts (the matcher exclusion would need the new file too)
reason: Next's file convention accepts `app/icon.png` or `app/favicon.ico` beside `icon.svg`; a PNG rendered from
  `favicon-16.svg` by the same headless-Chromium command as the two existing rasters, plus one more name in the
  matcher and in `routing.test.ts`'s derived list, closes it. Not done in the review because the owner tests on
  current Safari and the spec names `icon.svg` as the one favicon; do it the first time his test, or a user,
  reports a blank tab.

## Deferred from: code review of spec-2-2-see-rename-and-revoke-my-passkeys (2026-09-07)

### DW-36: two passkeys with the same name are two identical controls to a screen reader

plain: Each passkey row's pencil and bin are announced as "Rename <name>" and "Remove <name>". Two passkeys
  that were both born with the fallback name "Passkey" — the common case until a real device name is known
  (DW-32 (2)) — therefore sound identical to someone using a screen reader, though they look identical on
  screen too. Nothing is broken; a user renames one and the two are distinct again.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — both `aria-label`s in `passkeys-card.tsx` now carry
  `addedLabel(passkey.createdAt)` — the same string the row already draws, so the two cannot
  disagree. `tools/probe/run-verify-passkeys.py` changed in the same commit: `names()` strips the
  suffix and every exact-match locator became a prefix match, which the entry named as the one
  thing this change breaks.
  What this does NOT do (review, 2026-09-11): `addedLabel` is day-granular, so two passkeys
  registered on ONE day with the fallback name still read alike. Accepted: the date is what the row
  shows on screen and the entry's own fix; a finer label would put a time on the row nobody asked for.
severity: low
origin: Story 2.2 code review (2026-09-07) — Blind Hunter
location: apps/web/app/(app)/app/(authed)/account/passkeys-card.tsx (the two `aria-label`s) · tools/probe/run-verify-passkeys.py (`names()`, and the exact-match waits on `Rename ${n}`)
reason: The disambiguator the row already shows is the added date (`addedLabel`), so the fix is to append it
  to both labels — one line each — but the harness locates rows by the exact label, so its `names()` and the
  two `waitForFunction`s change with it. Not done in the review because the harness had eight other patches
  in the same pass and this one is cosmetic until two rows really share a name; do it with DW-32 (2), which
  is the story that gives rows real names.

## Deferred from: the owner's test of spec-2-2-see-rename-and-revoke-my-passkeys (2026-09-07)

### DW-37: the sign-in card at 40% (S1c) fails contrast while the OS sheet is up

plain: While the phone or laptop is asking for Face ID, the whole sign-in card fades to 40% — that is what
  the design draws, so the operating system's own window is the only thing in focus. An accessibility
  checker reads that faded card as text that is too pale to read: the headline, the label, the email field,
  every sentence on it. Nothing is broken and nothing on the card can be pressed while it is faded, but
  someone who needs high contrast has a few seconds of a card they cannot read.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `inert` and `aria-hidden` on the sign-in card while
  `passkeyPending`, REPLACING `pointer-events-none` — inert refuses the keyboard and the screen
  reader too, which a CSS property cannot. Re-measured on a local production build with S1c held
  open at 1440, 834 and 390: **zero axe violations** where the entry measured 1 `color-contrast`
  over 9 nodes, impact serious. The control: a real mouse click on the dimmed button does not
  reach its handler, and focus does not land.
  Review (2026-09-11): `inert` also hides the button's own "Waiting for your device…" from assistive
  technology for as long as the OS sheet has focus, which is the sheet's moment and not the card's;
  and it blurred the pressed button with nothing restoring focus, so a cancelled sheet left a
  screen-reader user on <body>. `passkey-button.tsx` now returns focus to the button when the
  ceremony ends. No run holds the ceremony pending to observe either — DW-91.
severity: low
origin: Story 2.2 Fix run (2026-09-07) — executed, not inferred: the card held in S1c on a real build,
  `opacity: 0.4` confirmed on the running page, axe-core 4.12.1 at WCAG 2.1 AA reporting
  1 `color-contrast` violation over 9 nodes, impact serious
location: apps/web/app/(app)/app/sign-in/sign-in-form.tsx (the `passkeyPending ? 'pointer-events-none
  [&>*]:opacity-40' : ''` branch) · `S1 Sign In.dc.html` S1c
reason: S1c is the frame's own drawing (`S1 Sign In.dc.html:131-141`) and R-74 makes the frame the
  authority, so dimming it less is not this story's call — and the story that owns S1c is 2.1, which is
  done. It is the same shape as the watermark exception already recorded in `sign-in/page.tsx`: a state
  axe cannot see the intent of. The candidate fix costs nothing visually — `aria-hidden` plus `inert` on
  the dimmed contents while the ceremony runs, which is what "the OS window is the only thing in focus"
  means to a screen reader anyway, and axe does not audit an inert subtree. Do it in the first story that
  reopens the sign-in card, or when the owner asks for it.

## Deferred from: code review of spec-2-3-change-my-email-address-safely (2026-09-07)

### DW-38: `signedIn()` lives in two `'use server'` files

plain: The three lines that say "if nobody is signed in, go to the sign-in page" are written once in the
  projects actions file and once more in the account actions file. Nothing is wrong today; a change to
  one would have to be remembered in the other.
status: closed
severity: low
origin: Story 2.3 code review (2026-09-07) — Blind Hunter
location: apps/web/app/(app)/app/(authed)/account/actions.ts (`signedIn`) · apps/web/app/(app)/app/(authed)/projects/actions.ts:63-67
reason: The stated reason for not importing it — an exported async function in a `'use server'` file is a
  Server Action — justifies not exporting it from EITHER actions file, not copying it: a plain module,
  `lib/supabase/server.ts` beside `currentUser()`, can export it once for both. Not done in the review
  because it edits `projects/actions.ts`, which is outside Story 2.3; do it in the next story that touches
  either file.
closed: Story 2.4 dev (2026-09-07). `signedIn()` is one `export async function` in
  `apps/web/lib/supabase/server.ts` beside `currentUser()`, and both actions files import it — the copies
  are gone. `server-wiring.test.ts` reads the repository for a `signedIn` written as a function or as a
  const and fails on any file but that one, so the copy cannot come back unnoticed. (The status line's
  shape corrected by the review, 2026-09-07: the story board derives "closed" from `status: closed` and
  this `closed:` field, and had drawn the entry as an open amber pill.)

### DW-39: the "your email address was changed" notice is Supabase's plain default, not Inflozo's

plain: When a user moves their account to a new email address, the address they are leaving now gets a
  short note saying so — the owner's ruling R-95, so that nobody can move an account in silence while
  holding a stolen session. That note is Supabase's own built-in one: unbranded, no Inflozo mark, and it
  ends "contact support immediately", which names a support channel the product does not yet have. Every
  other email Inflozo sends is branded. This one is the exception until Epic 12 fixes it.
status: open
severity: low
origin: Story 2.3 code review (2026-09-07) — Blind Hunter raised the risk; the owner ruled the notice ON
  (R-95, `reconcile-designs-decisions.md` §A19), which turned the question into this branding job
location: tools/probe/configure-supabase-auth.py (`mailer_notifications_email_changed_enabled: True`, and
  the two fields deliberately NOT written: `mailer_subjects_email_changed_notification`,
  `mailer_templates_email_changed_notification_content`) · supabase/auth/ (no template for it yet) ·
  PRD FR-P1 (7)
reason: The owner chose the plain default now rather than delaying the security notice for a template
  (question 2, option 2: "unbranded ... until Epic 12 brands it"). GoTrue's default is
  `templatemailer.go:73-77` — "Your email address was changed", `{{ .OldEmail }}` and `{{ .Email }}`, and
  the support sentence. The job is one template beside `magic-link.html` and `email-change.html`, pushed
  through the two field names above, in the pass where **E12** builds and brands the rest of FR-P1;
  its subject wants the product's voice too. Nothing is broken until then: the notice sends, and it says
  the true thing.

### DW-40: after a global sign-out, a captured access token is still a valid signature until `jwt_exp`

plain: When you sign out everywhere, Inflozo refuses the old sign-in on every page and action at once,
  because each one asks Supabase whether the session still exists. But the token itself — a signed
  ticket with an expiry — would still be accepted by Supabase's own data API if someone had copied it
  out of a stolen cookie, until the ticket's own expiry passes. Nothing in the app ever hands that
  ticket to a browser script, so the cookie has to be stolen first.
status: open
severity: low
origin: Story 2.4 spec (2026-09-07), read in the installed client — `GoTrueClient.js:2714-2718`,
  `lib/fetch.js:82-86` — and in the app's guard (`lib/supabase/server.ts` `currentUser()`, `proxy.ts:25-39`)
location: the project's `jwt_exp` (Supabase Auth config); apps/web/lib/supabase/cookies.ts (`httpOnly: true`)
reason: `getUser()` verifies with GoTrue, which checks the JWT's `session_id` claim against `auth.sessions`
  and answers `session_not_found` once the row is gone — so every Inflozo page and every server action
  refuses the token immediately. PostgREST verifies only the signature and `exp`, so a token presented
  DIRECTLY to `/rest/v1` with the publishable key stays good for the remainder of `jwt_exp`. **That back
  half was executed 2026-09-07 (Story 2.4's review) and holds:** the token GoTrue had just refused with
  `403 session_not_found` answered `GET /rest/v1/profiles?select=user_id` **200** with the user's own row,
  and the harness's `rest-residual` step re-executes it on every run — the day it prints a refusal, this
  row can close. The number was a hypothesis until it was read: **`jwt_exp = 3600` (60 minutes)**, `GET
  https://api.supabase.com/v1/projects/{ref}/config/auth` with `SUPABASE_ACCESS_TOKEN` → HTTP 200, executed
  2026-09-07 (Story 2.4's Dev run, and again at its review, where it also equalled the minted JWT's own
  `exp − iat`). The harness's `jwt-exp` step re-reads and REPORTS it on every run and compares it with
  nothing, so a run that prints a different number is this row gone stale — update it from the run. So the
  residual window is at most one hour from the token's issue, and only for a token already stolen out of an
  `HttpOnly` cookie. The FRONT half was executed the same day and it holds:
  a session revoked by `POST /logout?scope=global` is refused at `GET /auth/v1/user` **immediately** —
  `403 session_not_found`, not at `exp` — so every Inflozo page and action stops accepting it at once.
  Shortening `jwt_exp` is a trade against refresh traffic and is the owner's call if he ever wants it;
  nothing in FR-A6 asks for it.

### DW-41: `signOut`'s failure comment says the cookies are kept; the installed client removes them on most failures

plain: The ordinary Sign out has a note saying that if Supabase cannot be reached, you stay signed in and
  the dashboard shows a red line. Reading the library's actual code, that is only true when your ticket
  had already expired; in the common case the library clears your sign-in AND reports the failure, so
  the red line's page would bounce you to the sign-in page with nothing said. Not yet executed — it
  needs Supabase to be unreachable from the live site.
status: open
severity: low
origin: Story 2.4 spec (2026-09-07), read in the installed client
location: apps/web/app/(app)/app/sign-in/actions.ts:82-97 (`signOut`, its comment, `signOutPathFor(Boolean(error))`) ·
  apps/web/app/(app)/app/(authed)/account/actions.ts (`signOutEverywhere`'s `sign_out_failed` path — Story 2.4's
  review, 2026-09-07)
reason: `_signOut` (`GoTrueClient.js:3415-3445`): when `/logout` fails with anything other than 401/403/404 or a
  missing session, it calls `removeCurrentSession()` BEFORE returning the error — the cookies are deleted
  through `setAll` and the action then redirects to `/?sign-out-failed=1`, where the guard finds no session
  and 307s to `/sign-in` without the owner's red line (his ruling at question 8, Story 1.5). The comment's
  claim holds only on the OTHER path: an expired access token whose refresh fails inside `_useSession`
  returns the error before any removal. A hypothesis until executed; the fix, if the owner wants one, is
  for the action to read the cookies after the call and choose its landing from what is actually left —
  1.4/1.5's file, so not changed by Story 2.4, which alters only that call's scope.
  **Story 2.4's `signOutEverywhere` has the same shape (review, 2026-09-07):** on any `/logout` error but a
  401/403/404 the dialog stays open saying "try again in a moment" while THIS device's cookies may already be
  gone, so the retry lands on `/sign-in` through `signedIn()` with nothing said. Its comment now says so and
  cites this row; the fix, when the owner wants one, is the same for both call sites. Still unexecuted: it
  needs GoTrue to fail from the live site, which no real-infrastructure step can produce.

### DW-42: FR-A5's two Dodo calls — stop auto-renew on a deletion request, offer resume on restore — are owed by Epic 12

plain: When someone asks to delete their account, their card must never be charged again while the 14-day
  countdown runs, and pressing Restore should offer to switch the subscription back on at the same price.
  Nothing in the product talks to Dodo yet and nobody can buy a plan, so Story 2.5 could not build this;
  the billing epic builds it with the rest of Dodo. Until then nobody can be charged, because nobody can pay.
status: open
severity: medium
origin: Story 2.5 spec (2026-09-07), the owner's ruling R-97 on its question 2
location: apps/web/app/(app)/app/(authed)/account/actions.ts (`requestDeletion`, `restoreAccount` — the two
  places the calls attach) · apps/web/app/(app)/app/restore/page.tsx (where the resume offer and the "paid
  period ended" sentence render) · epics.md Story 12.5 (the owning story, which cites this row)
reason: FR-A5 (`prd.md:184`): "soft-delete stops the Dodo subscription's auto-renew immediately … restoring
  within the window offers one-click resume of auto-renew at the same plan and price, and says plainly when
  the paid period ended meanwhile — that account restores on Free, under FR-L3's over-limit rules". No
  billing adapter, no `subscriptions` writer and no checkout exist (Epic 12; AD-28 widens
  `resolveEntitlement` there). A Dodo call written now would be a hypothesis with no real subscription to
  execute it against (R-82) and would be rebuilt inside the adapter. What 2.5 leaves for it: `requestDeletion`
  runs `request_account_deletion()` and then sends the email — the stop call goes between them, keyed on
  `subscriptions.dodo_subscription_id`; `restoreAccount` runs `restore_account()` — the resume offer is a
  second step on `/restore` after it, reading `subscriptions.current_period_end` to say whether the paid
  period ended. `entitlements` is untouched by 2.5, which is FR-A5's "retained at their current level".

### DW-43: restoring an account clears every snapshot's `purge_after`, the 90-day orphan clock included

plain: When someone cancels their account deletion, the countdown on their archived original themes is
  cleared too — including a separate, longer countdown that starts when a site is disconnected. **Fixed
  by never writing the second countdown down at all:** the date a site was disconnected is stored, and the
  90-day deadline is worked out from it whenever anyone needs it, so cancelling a deletion cannot wipe a
  countdown that was never in that box.
status: closed
severity: low
origin: Story 2.5 spec (2026-09-07), the `restore_account()` function
closed: Story 3.5 Dev (2026-09-09) — **with a comment, not a migration.** The two clocks were told
  apart by DERIVING the 90-day one instead of storing it: `site_snapshots.purge_after` carries
  FR-A5's 14-day account-deletion clock and ONLY that, so `restore_account()`'s `purge_after = null`
  is correct exactly as written and neither function changes. FR-C6's 90-day orphan deadline is
  `public.sites.disconnected_at + interval '90 days'`, computed by whoever reads it; Story 3.5's
  `disconnectSite` is that column's first and only writer, and the job that acts on the deadline is
  **Story 7.20's** (DW-75), which therefore needs no migration for the clock either. Recorded where
  the next reader meets each half: the comment above `restore_account()` in
  `supabase/migrations/20260907150000_account_deletion_window.sql`, the `purge_after` line in the
  architecture's `SCHEMA.sql`, and `disconnectSite`'s own header. The live harness asserts it —
  `disconnect` reads a fixture `site_snapshots` row back byte-identical, `purge_after` still null,
  after a real disconnect. NEITHER OPTION THE REASON BELOW OFFERED WAS TAKEN: no re-stamp, no
  second column.
location: supabase/migrations/20260907150000_account_deletion_window.sql (`restore_account`) ·
  supabase/migrations/20260904120000_complete_schema.sql:199 (`site_snapshots.purge_after`, "FR-C6: 90 days
  after disconnect; FR-A5: 14 days at delete")
reason: One column carries two clocks. `request_account_deletion()` sets it to the EARLIER of the two
  (`least(coalesce(purge_after, deadline), deadline)`), which is right on the way in; `restore_account()`
  sets it to null, which is right for the 14-day clock and wrong for a 90-day clock that was already
  running. Telling the two apart needs either a second column or a re-derivation from
  `sites.disconnected_at`, and both belong to the story that first writes the 90-day clock (FR-C6, Epic 3):
  it re-stamps `purge_after = disconnected_at + interval '90 days'` for every disconnected site of the
  restored user, or splits the column. Nothing writes `disconnected_at` today, so no row can be affected
  before then. Marked `-- ponytail:` beside the function.


### DW-44: the Vault secrets a site's credentials point at outlive the account purge and the site disconnect

plain: When an account is purged, the rows that remember where a site's Ghost keys are stored are removed, but
  the keys themselves would stay in the locked store — nothing stores any yet, so nothing leaks today; the story
  that first puts keys in the store must also take them out when their row goes.
status: closed
severity: low
origin: Story 2.6 spec (2026-09-07), the cascade analysis
closed: Story 3.1 Dev (2026-09-07) — `supabase/migrations/20260907200000_vault_secret_lifecycle.sql` lands
  `private.drop_vault_secrets()` (`security definer`, `set search_path = ''`, EXECUTE revoked from `public`,
  `anon`, `authenticated`) on `before update or delete of private.site_credentials`, and the identical block
  is in `SCHEMA.sql` beside the touch trigger. Proved in the RLS gate against `PRELUDE.sql`'s `vault`
  stand-in, on all THREE paths — the site deleted, the account deleted, and the ref replaced by a rotation —
  each ending in `count(*) = 0` for the old secret; controlled by four runs with the trigger commented out,
  in which each of the three paths fails on its own. **Applied to the hosted database by the owner and
  verified at Story 3.1 Deploy (2026-09-08)** — the live `pg_get_functiondef` is byte-identical to the
  migration, `security definer`, `search_path` pinned, EXECUTE `f` for `anon` and `authenticated` — and the
  `rotated`, `staff-removed` and `secret-gone` steps of `tools/probe/run-verify-ghost-admin.py` **pass on the
  deployed site against both Ghosts**, with the vault left at 0 rows where the pre-migration run left 8
  orphans.
location: SCHEMA.sql:181-190 (`private.site_credentials.admin_key_vault_ref`, `staff_token_vault_ref` —
  `vault.secrets(id)` by comment, no FK) · epics.md Story 3.1 (the server-side admin proxy and Vault credential
  storage — the owner)
reason: `private.site_credentials` cascades from both `sites` and `auth.users`, so FR-A5's purge and FR-C6's
  disconnect each remove the row and leave the `vault.secrets` rows it referenced. A `before delete` trigger on
  `private.site_credentials` that calls `vault`'s delete is the one home that serves every path — the purge,
  disconnect, key rotation's re-encrypt (FR-C8) — rather than each caller remembering. Nothing writes Vault
  before Story 3.1, so no secret can be orphaned before then; 3.1 lands the trigger with the first write and
  proves it in the RLS gate (a credential row deleted → its secret gone).

### DW-45: `entitlements.restored_by` is the one user reference that does not cascade, so purging that user is refused

plain: One column records which staff account restored a customer's paid plan after a dispute. The database
  keeps that account from ever being deleted while the record points at it — which would block the purge of
  that one account (in practice the owner's own) with an error every day, not silently.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the migration re-declares `entitlements.restored_by` as `on
  delete set null`. Production was read first — no non-null value exists, because E12 is the only
  writer and it does not exist yet, which is why this was cheaper now. The RLS gate purges the
  account named in the column and asserts the entitlement row survives with the column nulled;
  reverting it reproduces the entry's own claim, `23503`, the purge refused.
severity: low
origin: Story 2.6 spec (2026-09-07), the cascade analysis
location: SCHEMA.sql:590 (`restored_by uuid references auth.users(id)` — no `on delete`) ·
  apps/web/app/api/cron/purge-accounts/route.ts (where the refusal is logged, `step: 'user'`) · epics.md
  Epic 12 (FR-L2's dispute-restore path, which first writes the column)
reason: Every other `references auth.users(id)` in the schema is `on delete cascade` or `on delete set
  null`; this one is bare, so a `DELETE /admin/users/{id}` for a user named in any `restored_by` fails with
  `23503` and the purge logs it and answers 500 until someone acts. The column is written only by the manual
  dispute-restore action (FR-L2, Epic 12), so no row can carry it before then. E12 decides `on delete set
  null` (the record survives, the name does not) when it first writes the column; the purge's spec makes a
  refused delete an Ask First rather than nulling an audit column from a cron.

### DW-46: a failed purge reaches nobody until NFR-9's Sentry lands — today it is one red line in Vercel's cron log

plain: If the daily clean-up job fails, the only sign is a red entry in Vercel's log page that nobody is
  emailed about. Until the error-alerting service the requirements name is set up, checking that page after a
  deletion is the owner's job.
status: open
severity: medium
origin: Story 2.6 spec (2026-09-07)
location: apps/web/app/api/cron/purge-accounts/route.ts (answers 500 whenever an account failed, so the
  invocation is red) · prd.md:493 (NFR-9: Sentry, app + server) · ARCHITECTURE-SPINE.md:328 (AD-29's
  60/80/95% alarms)
reason: Vercel neither retries a failed cron invocation nor alerts on one (docs, read 2026-09-07), and a purge
  that fails quietly is the indefinite retention FR-A5 exists to prevent — the same class the spine names for
  the renewal reminder ("the job that exists to prevent a surprise must not fail by surprise", AD-33). The
  route's 500 is the whole alarm today. The story that lands Sentry (NFR-9) captures the purge's
  `console.error` with the rest and closes this row; until then the Deploy and Review runs read the cron log
  by hand and record it under `## Verification`.

### DW-47: a batch of permanently failing accounts would starve every account behind them

plain: The daily clean-up takes the 25 accounts whose deadline passed longest ago and retries a failed one
  the next day. If 25 accounts ever fail every single day — a systemic fault, not a normal one — the accounts
  behind them are never reached, and every day's run is red. Today that is only a red log line (DW-46).
status: open
severity: medium
origin: Story 2.6 code review (2026-09-07)
location: apps/web/app/api/cron/purge-accounts/route.ts (`.order('purge_after').limit(BATCH)`) ·
  apps/web/app/api/cron/purge-accounts/purge-rule.ts (`BATCH = 25`; no attempt column, no lock —
  marked `ponytail:`) · spec-2-6 Boundaries ("a failed account is simply still due tomorrow")
reason: The story's approach is reconciliation with no claim column and no attempt counter, and a failed account
  stays at the head of the oldest-first queue by construction. That is right for the one-off failures the matrix
  names (a transient refusal, an overlapping run's 404) and wrong only when BATCH accounts fail permanently at
  once, which needs a systemic cause — a bucket policy change, a non-cascading foreign key (DW-45) on many rows
  — that the red log line already reports. The fix is a migration (a `purge_attempts` or `purge_failed_at`
  column skipped after N tries, or a bigger batch), which the spec's Ask First reserves; it lands the day a run
  is observed to starve or when NFR-9's Sentry (DW-46) turns the red line into an alert somebody reads.

### DW-48: the ghost-admin verify route is verification scaffolding, and 3.2 removes it

plain: Story 3.1 ships a small, password-protected back door whose only job is to prove on the live site that
  keys go into the locked store and come out for one signed request. It is not a product feature, and the
  next story — the connect screen, the first real user of the store — takes it out again so the app carries
  no extra doors.
status: closed by Story 3.2 (Dev, 2026-09-08) — `app/api/ghost-admin/verify/route.ts` and
  `server/ghost-admin/verify-queries.ts` are deleted, `server-wiring.test.ts` names the connect action as the
  chokepoint's only importer, and `tools/probe/run-verify-ghost-admin.py` drives the product instead. DW-54
  records the proofs that left with the route and which story re-drives each.
severity: low
origin: Story 3.1 spec (2026-09-07), the deployed-proof decision
location: apps/web/app/api/ghost-admin/verify/route.ts (created by 3.1, deleted by 3.2) ·
  tools/probe/run-verify-ghost-admin.py (drove it; drives the wizard since 3.2) · epics.md Story 3.2 (the connect
  wizard — the story that removed it)
reason: R-82 wants the round trip executed on the real infrastructure, and the module has no caller until 3.2's
  connect action exists; a bearer-gated route is the one way to execute the Vercel → pooler hop and the
  Vault write/decrypt/delete cycle from the deployed function, and it sidesteps this machine's sandbox, which
  refuses direct writes to the live database (spec-2-5:583). Once the connect action is the caller, the
  harness retargets at it and the route — five ops behind `CRON_SECRET`, one of which stores a key for a
  caller-supplied `site_id` — is deleted rather than kept as a permanent privileged surface.

### DW-49: the app's Postgres connection is the `postgres` user's, and a narrower role is owed at the next password rotation

plain: The server reaches the encrypted key store with the database's main password, which is how Supabase's
  own serverless guide connects. A purpose-made database account that can touch only the key store and the
  audit log would limit what a leak of that one setting could do; it is the right change to make when the
  password is next rotated, not before.
status: open
severity: low
origin: Story 3.1 spec (2026-09-07), the connection decision
location: apps/web/server/ghost-admin/db.ts (to be created by 3.1, `SUPABASE_DB_POOLER_URL`) ·
  tools/probe/.env.example (`SUPABASE_DB_POOLER_URL`) · SCHEMA.sql (a role with `usage` on `vault` and
  `private`, `select` on `vault.decrypted_secrets`, `execute` on `vault.create_secret`, `select, delete` on
  `vault.secrets`, and `select, insert, update, delete` on `private.*` — nothing in `public` beyond `sites`)
reason: The connection string in Vercel is the one secret that can decrypt every customer's Ghost key, which
  is also true of the `postgres` password it carries. A dedicated role changes the blast radius of a leaked
  URL from "the whole database" to "the key store and the audit log" — still severe, but bounded and
  auditable. It needs a migration, a SCHEMA.sql block, an RLS-TEST assertion that the role holds nothing
  else, and a password the owner sets in the dashboard, so it belongs with the rotation that has to happen
  anyway rather than inside the story that first opens the connection.

## Deferred from: code review of spec-3-1-the-server-side-admin-proxy-and-vault-credential-storage (2026-09-07)

### DW-50: the app's line to the key store is encrypted but the far end is not verified

plain: The server's connection to the key store is scrambled, but the server does not check that the far end
  is really Supabase's; checking needs Supabase's own certificate bundled into the app, and that belongs
  with the next password rotation, alongside the narrower database account.
status: open
severity: medium
origin: Story 3.1 code review (2026-09-07), the Blind Hunter layer — executed by the review
location: apps/web/server/ghost-admin/db.ts (`ssl: 'require'`) · MEASUREMENTS.md §21j (the 2026-09-07 re-probe)
reason: postgres.js 3.4.9 sets `rejectUnauthorized: false` for `ssl: 'require'` (`src/connection.js`, read
  2026-09-07). Executed from the app's own driver against the transaction pooler: `'require'` connects;
  `'verify-full'` fails `SELF_SIGNED_CERT_IN_CHAIN`, because the pooler's chain ends in Supabase's own CA,
  which is not in Node's bundle. Verifying means shipping that CA (`ssl: { ca, rejectUnauthorized: true }`,
  the certificate from the dashboard's database settings) and the harness re-running `grants` after the
  change; `pg_stat_ssl` cannot observe the client leg through the pooler, so the driver's own handshake is
  the proof. It rides with DW-49's rotation, which touches the same setting.

### DW-51: the Admin chokepoint can only send JSON bodies, and a theme upload is a file

plain: The one door Inflozo talks to a Ghost site through can only send text-shaped requests today; uploading
  a theme, which the deploy in Epic 7 needs, sends a file, so the door will need to learn that shape then.
status: open
severity: low
origin: Story 3.1 code review (2026-09-07), the Edge Case Hunter layer
location: apps/web/server/ghost-admin/index.ts (`fetchWithKey`, the `payload` / `Content-Type` lines) ·
  apps/web/server/ghost-admin/admin-rule.ts (`ADMIN_WRITES.theme_upload`)
reason: `fetchWithKey` serialises every body with `JSON.stringify` and sends `Content-Type: application/json`;
  `theme_upload` is `POST themes/upload/` with `multipart/form-data`. The allowlist item exists, the
  transport does not. The story that first executes the upload (Epic 7) extends the body handling — a
  `FormData` passed through untouched with no `Content-Type` set — and proves it against T1 and T3.

### DW-52: a Ghost that is down, rate-limited or answering 404 reads as "Ghost refused"

plain: When a Ghost site is down for maintenance or is rate-limiting, Inflozo would currently tell the user
  that Ghost refused it, which is the wrong story; the stories that make the real reads and writes will
  see those answers and can name them properly.
status: open
severity: low
origin: Story 3.1 code review (2026-09-07), the Blind Hunter and Edge Case Hunter layers
location: apps/web/server/ghost-admin/admin-rule.ts (`ghostCode`)
reason: `ghostCode` names the two 401 causes (§37), a redirect, and folds everything else — 403, 404, 422,
  429, 5xx — into `ghost_refused`. AD-24 wants one row per cause, and a 503 wants "try again later"
  while a 403 wants "the integration lacks permission". This story executes only `GET config/` and the
  denials, so it has seen none of those statuses; 3.3 (settings reads, the 501-on-Ghost-5 / 403-on-Ghost-6
  themes difference already noted) and Epic 7 (the writes) split them as they execute them.

### DW-53: the audit log's `outcome` column accepts any text

plain: The audit log's "what happened" column takes any word; only the app's code keeps it to ok, denied or
  error. A one-line database rule would make the log itself refuse anything else.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the migration adds `check (outcome in
  ('ok','denied','error'))` on `private.credential_audit`. Production's 2,605 rows were read first
  and every one was already inside the three. The gate inserts a fourth word and insists on
  `23514`.
severity: low
origin: Story 3.1 code review (2026-09-07), the Real-infra verifier — pre-existing, from the 2026-09-04 schema
location: SCHEMA.sql (`private.credential_audit.outcome text not null`, the values in a comment only) ·
  apps/web/server/ghost-admin/index.ts (`audit()`'s `outcome` union)
reason: `action` is an enum and the three labels the code inserts were confirmed on the live catalogue;
  `outcome` has no check constraint, so the TypeScript union is its only guard. The frozen 2026-09-04
  migration cannot change, so it is a new migration (`alter table … add constraint … check (outcome in
  ('ok','denied','error'))`) with its SCHEMA.sql line and gate assertion, in the next story that touches
  the table.

### DW-54: the key store's live proofs lose their driver with the verify route, and each later story re-drives one

plain: Story 3.1 proved four things on the live site through its temporary back door — that Inflozo
  refuses to make any change to a Ghost site outside its four allowed ones, that swapping a key removes
  the old one from the locked store, that removing the deploy-time token removes it too, and that a stored
  key can be taken back out of the locked store and used to sign one request. Story 3.2 takes that back
  door out, as planned. Its own harness now presses the second button for real (reconnecting a disconnected
  site swaps the key); nothing in the product yet presses the other three — so until later stories do,
  those are proved by the local tests and the database gate only, not on the deployed site.
status: open — `rotated` closed by Story 3.2 (Review, 2026-09-08); **the decrypt path closed by Story 3.3**
  (Dev, 2026-09-08): its connect-time probes run on the STORED key through `call()`, so every connect leaves
  two `vault_decrypt` rows and two `admin_read` rows on the deployed function, and the harness's `decrypt-path`
  step asserts them every run. **`staff-removed` closed by Story 3.6** (Dev, 2026-09-09): Manage keys is the
  first product path that STORES and REMOVES a Staff Access Token, so the harness's `keys-token` step adds the
  harness's own token on T1 and takes it out again — `credentials_present.staff` true then false, the Vault
  secret gone behind the nulled ref (read read-only through the pooler, as `disconnect` already does), the site
  still active with `disconnected_at` null, and two `credential_change` rows. It was never reachable before:
  nothing in the product had a way in for the token. **`write-denied` alone remains, and it is Epic 7's** — no
  product caller makes an allowed Ghost write until the deploy path exists, and `ADMIN_WRITES` still
  carries `announcement_clear` with no caller (DW-66).
severity: low
origin: Story 3.2 spec (2026-09-08), Design Notes "The harness after the route"; the decrypt path added by
  3.2's code review (2026-09-08, Edge Case Hunter)
location: tools/probe/run-verify-ghost-admin.py (the retargeted harness — its docstring names the steps it
  runs; `re-adopt` is the one that rotates a key) · apps/web/ghost-admin-rule.test.ts (`permitted()`'s three
  denials as a unit contract) · apps/web/server/ghost-admin/index.ts (`call()` — the decrypt path — and
  `remove()` — `remove()` HAS had a product caller since Story 3.5's `disconnectSite` and has a
  second in 3.6's `removeToken`; only the allowed-WRITE path is still callerless) · supabase/tests
  (the trigger under the RLS gate)
reason: R-82 wants every claim executed on the real infrastructure. With DW-48 honoured, `write-denied`
  has no product caller until Epic 7's deploy path makes the first allowed write (and can then be driven
  by asking for one outside the list); `staff-removed` had none until **Story 3.6's Manage keys**, which
  turned out to be the story that gives the token a way in and a way out rather than Epic 7 — the token is
  ASKED for at first deploy, but FR-C8 has always said it can be added and removed at any time, and that is
  this screen; and the DECRYPT path — `call()` reading `vault.decrypted_secrets` and signing with what it
  read, the `vault_decrypt` audit row with it — none until Story 3.3's settings read, the first product
  call made with a stored key rather than a typed one. Each of those stories adds the matching step to its
  own harness and closes its part of this entry.
  CONFIRMED AT 3.2's DEV (2026-09-08): the route is gone and the harness's docstring lists what it runs —
  none of them a write, a staff removal or a decryption.
  AMENDED AT 3.2's REVIEW (2026-09-08): `rotated` is driven live again, one story early — the harness's
  `re-adopt` step marks its own fixture's site disconnected through the service role (Story 3.5's Disconnect
  does not exist), reconnects it, and reads a NEW `admin_key_vault_ref` with the old secret gone and the new
  one present: DW-44's replace path on the live project. `secret-gone` still exercises the CASCADE path. So
  it is the write-denial, the staff removal and the decryption that are gate-only until Epic 7, Epic 7 and
  Story 3.3.

## Deferred from: code review of spec-3-2-the-connect-wizard-url-integration-guide-and-the-two-keys (2026-09-08)

- DW-54 (above, amended twice): the decrypt path — `call()` reading `vault.decrypted_secrets` and signing with
  it — had no product caller until Story 3.3's settings read, so it ran on no infrastructure between the verify
  route's deletion and 3.3; `rotated`, by contrast, is driven live again by 3.2's `re-adopt` step. **Story 3.3
  built that caller** (`apps/web/server/site-probe.ts`) and the gap is closed.
- DW-55 (below): a Ghost installed under a path cannot connect, by the approved contract.

## Deferred from: code review 2 of spec-3-2-the-connect-wizard-url-integration-guide-and-the-two-keys (2026-09-08)

- DW-58 (below): a public name that resolves to a private address passes the address rule, so the connect
  action's fetch is not confined to the public web; a resolver check is a network hop the rule was built to avoid.
- DW-59 (below): the connect action's write → store → compensate sequence, its `site/` guards, the Sites page's
  failed-read banner are pinned by source-text tests only; no executed test makes `store()` fail.

### DW-58: the address rule is a shape check, and a name resolving to a private range still passes it

plain: The connect screen refuses obvious non-addresses — a bare word, `localhost`, a raw IP number — before
  it calls anything. But a real domain name can be pointed at an internal address by whoever owns it, and the
  rule cannot tell, so Inflozo's server would then try to reach that internal address on the customer's word.
  On Vercel's functions there is little behind such an address to reach, which is why this is recorded and
  not fixed today.
status: open
severity: low
origin: Story 3.2 code review 2 (2026-09-08), Blind Hunter and Edge Case Hunter
location: apps/web/lib/connect-rule.ts (`normaliseSiteUrl` — refuses `localhost`, IP literals and non-http(s)
  schemes; its comment names this entry) · apps/web/server/ghost-admin/index.ts (`fetchWithKey`, `redirect:
  'manual'`, one timeout; two calls per connect attempt)
reason: The refusal of IP literals was added at Review 1 with the comment "keeps the function's fetch on public
  names", which overclaims: `10.0.0.1.nip.io` or any customer-controlled record resolves past the rule. A
  `dns.lookup` before the fetch would close it at the cost of a resolver round trip on every connect and a
  false refusal for sites behind split-horizon DNS; the honest fix is a rate limit on `connectSite` plus the
  resolver check, together, when the product runs somewhere with an internal network worth protecting
  (a self-hosted deploy, or Vercel's private networking if it is ever attached). Until then the comment says
  what the rule is — a shape check — and this entry says what it is not.

### DW-59: the connect action's failure branches are pinned by source text, not executed

plain: The code that undoes a half-made connection (the key could not be stored, so the site row is removed
  or put back as it was), the checks on what Ghost answers before it becomes a link, and the "we couldn't load
  your sites" screen are all real, but the only automatic tests that watch them read the code as text and look
  for the right words. Nothing runs them with a failure injected, because the file cannot be loaded outside
  Next. Extracting the sequence into a plain function that takes its collaborators as arguments — the shape
  Story 2.6's purge used — would let a test run it with a store that fails.
status: open
severity: low
origin: Story 3.2 code review 2 (2026-09-08), Verification Gap Reviewer
location: apps/web/app/(app)/app/(authed)/sites/actions.ts (the `store()` catch; the `site/` read's `isHttpUrl`
  guards; `settings_read_at` stamped with the read) · apps/web/app/(app)/app/(authed)/sites/page.tsx (the
  `unread` banner) · apps/web/connect-rule.test.ts (the two source-text tests that stand in)
reason: The harness proves every success path on the live site and cannot make Vault fail there; the
  source-text tests catch a column dropped from the restore but not the branches swapped. The extraction is
  the right shape and it is not free — the action is 300 lines with two clients and a redirect — so it lands
  when a later story touches the same writes (3.5's Disconnect, 3.7's daily check, 3.6's Manage keys), and
  that story's spec names it. The project tally, by contrast, was lifted into `lib/connect-rule.ts` and tested
  at this review.

### DW-56: the authed shell renders content that is not visible without JavaScript

plain: With JavaScript switched off, the connect wizard's fields are present in the page's HTML but do not
  show on screen — they compute to a zero-size box until the page's scripts run. The connect FORM itself is
  wired correctly for a no-script submit (it is a real server-action form with the fields a browser posts
  without scripts), so this is not the connect screen's own doing; something in the shared app frame (the
  shell or the root layout, Story 1.5) hides content until the scripts load. A visitor with scripts off —
  rare, but the spec promises the keys form works for them — would see the page but not the form.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the claim is FALSE now, executed rather than believed. With
  scripts off and a real session, `/sites/connect?step=keys` renders **all three key fields
  visible and its submit visible** — the very form the entry said a no-JS visitor could not drive
  — with `<main>` and the sidebar both visible. R-98's route-group move (2026-09-09, the day after
  this was found) removed the group-wide Suspense boundary that hid every `(authed)` page until a
  script swapped it in. THE SHELL WAS NEVER THE ANCESTOR: what the original read saw on
  `/sites/connect` is the WIZARD'S OWN two-pane CSS — step 2's pane is `invisible` and `inert`
  while step 1 is showing, deliberately, so it keeps its space — plus, on the first re-run of this
  probe, a context that was never signed in at all (one magic-link token, two browser contexts;
  GoTrue keeps one per user and the second consumed the first). A DIFFERENT AND NARROWER THING IS
  TRUE and is raised as **DW-89** rather than fixed here, because it needs the owner's ruling on
  whether scripts-off is a committed mode.
severity: low
origin: Story 3.2 code review (2026-09-08, Review 2) — the Real-infra verifier's no-JS check on app.inflozo.com
location: apps/web/components/shell/shell.tsx (or app/(app)/app/(authed)/layout.tsx / the root layout) —
  the ancestor that computes a zero box before hydration · spec-3-2 Boundaries ("JavaScript off: … the keys
  form posts the server action, the errors render server-side")
reason: Executed at Review 2 on the deployed site: `<form method="post" action="">` carries React's encoded
  `$ACTION_*` hidden fields (progressive enhancement is on), the field HTML is in the document, yet a
  scripts-off browser reports every field and the submit button "not visible", so a no-JS submit cannot be
  driven. The connect wizard did nothing to cause this — it is a shell-level gate that predates Epic 3 and
  affects every authed page — so fixing it is Story 1.5's frame, not 3.2's connect screen, and it needs a
  decision on whether no-JS is a supported mode at all (the owner's, when it is picked up). 3.2's part — the
  form is progressively enhanced — is proved by the harness's `js-off` step; the shell's part is this entry.
  Ask the owner whether scripts-off is a mode Inflozo commits to before spending on it.

### DW-55: a Ghost installed under a path cannot be connected

plain: Ghost can live at an address like `https://example.com/blog` rather than at the root of a domain. The
  connect wizard keeps only the root part of whatever is typed — the approved rule, so that the same site typed
  three ways is one record — so such a site would be looked for at `https://example.com` and refused with
  "Ghost refused the connection (HTTP 404)". Nobody has asked for one yet.
status: open
severity: low
origin: Story 3.2 code review (2026-09-08) — Edge Case Hunter
location: apps/web/lib/connect-rule.ts (`normaliseSiteUrl` drops the path) · apps/web/server/ghost-admin/admin-rule.ts
  (`adminUrl`, which keeps a subdirectory, from 3.1's review) · spec-3-2 Boundaries ("normalised to an origin …
  no path")
reason: The frozen Boundaries chose an origin on purpose — `unique (user_id, url)` and one record per site
  however it is spelled — and 3.1's `adminUrl` already resolves relative to a path, so the chokepoint is ready
  the day the rule admits one. Doing it needs a decision on what "one record" means for `example.com` and
  `example.com/blog` (two sites, or a typo?), which is the owner's; ask him when a customer with a
  subdirectory install appears, or at Manage keys (3.6) where the URL is shown read-only.

### DW-57: the Sites card's layout is the owner's, not the frame's, and the later stories inherit it

plain: The card on the Sites page no longer looks like the drawing it came from. The owner tested Story 3.2 on
  the live site and asked for three changes to it: the address carries a "opens in a new tab" arrow; the green
  **Connected** left the line it shared with the two grey pills (Ghost 6.58, 0 projects) and sits just above
  "Checked 5 minutes ago"; and those two sit closer together than anything else on the card. He asked for it
  "for all site cards" — one component draws every card, so that is already true. What this entry exists for is
  the stories that add MORE to this card: they must add to what is there now, not put back what the frame draws.
status: open
severity: medium
origin: Story 3.2 owner's test (2026-09-08, findings 4 and 6) — his test outranks the frame, R-80 as amended
location: apps/web/app/(app)/app/(authed)/sites/page.tsx (the one card component, and the comment at the top of
  the file that records the departure) · `S11 Sites.dc.html:61-76` is the frame it departs from
reason: Three stories still add to this card and each would otherwise read the frame and undo the owner's
  layout: **3.3** the Preview-only chip, **3.5** the ⋯ menu (Re-check · Reconnect · Manage keys · Disconnect)
  and S11c's Free-cap ghost slot, **3.7** the health badges and "Reconnect needed". Every one of them puts
  something on the pills' line or beside the state, which is exactly where he moved things from. The rule for
  each: the pills' line carries METADATA only, the state line carries the connection's state and its timestamp,
  and the ⋯ button goes at the top right of the header row where the frame draws it. The export is never
  edited (R-74), so this entry and the file's own comment are where the departure lives.
amended: Story 3.3 (Dev, 2026-09-08) — **the Preview-only chip went on the STATE LINE, beside "Connected", and
  the four probe blocks went below it as the card's last child.** The rule above decided it: Preview-only is a
  property of the CONNECTION, not metadata about the site. So 3.5 and 3.7 now inherit a state line that already
  carries two things and add to THAT, rather than re-deriving the answer from the frame. The harness asserts
  the placement off the rendered boxes at 1440, 834 and 390 (`preview-notice`), which is how the owner looked
  at it, so a later story that moves the chip back onto the pills' line fails a step rather than a reviewer.
  **And the owner ruled the tablet wrap (2026-09-08, Story 3.3 Question 2): "Leave it — the tag wraps on a
  tablet and nowhere else."** At 834 the shell's 220px sidebar and the three-column grid leave the card about
  139px, against 78 for "Connected" and 109 for the chip, so the chip drops to its own line there — as the two
  metadata pills already do, and have since he tested 3.2. The grid stays three-up; option 2 (two cards on a
  tablet) was offered and declined. **So the rule 3.5 and 3.7 inherit is: ON the state line always, BESIDE
  "Connected" only where the card can hold it.** A story that adds a third thing to that line adds it under the
  same rule and does not widen the grid to make it fit.
amended: Story 3.5 (Dev, 2026-09-09) — **the ⋯ landed at the TOP RIGHT OF THE HEADER ROW, level
  with the site's name, exactly where the frame draws it (`S11 Sites.dc.html:68`), and nothing this
  story added joined the pills' line or the state line.** That is the rule above, followed rather
  than re-derived. **S11c's ghost slot is built** and is the grid's next cell at the Free cap, so
  the Refusal cell in `EXPERIENCE.md`'s Sites row ("Free at 1 site: S11c's ghost slot") now
  describes shipped code.
  **AND THE MENU IS NOW THE ONE PLACE THE CARD'S ACTIONS LIVE: 3.6 and 3.7 ADD INTO IT, they do not
  build a second one.** It holds **Disconnect** alone today — the frame's Re-check connection,
  Reconnect and Manage API keys are 3.6's and 3.7's and are ABSENT rather than greyed (UX-DR3) —
  in `apps/web/app/(app)/app/(authed)/sites/site-menu.tsx`, a near-straight lift of
  `project-menu.tsx`'s vocabulary (the shared `item` row is now EXPORTED from that file rather than
  copied). The rule above says the rest: a row added there is a row, not a new surface, and the
  harness's `site-menu` step counts the items off the very selector `lib/menu.ts`'s arrow keys walk
  — so a fourth row arriving without a story fails a step rather than a reviewer.

## Deferred from: spec-3-3-the-connect-time-probes-preview-only-code-injection-portal-and-the-announcement-bar (2026-09-08)

- DW-60 (below): B15's **Export theme zip** and **Ship it** are drawn on the frame and built by nothing,
  because neither path exists in any epic yet.

### DW-60: B15 is built without its two buttons, because neither path exists until E11 and E7

plain: The blue "Preview-only" card tells someone on a restricted Ghost(Pro) plan that Inflozo cannot publish
  to their site. The drawing of that card has two buttons on it — **Export theme zip**, which would download
  the theme so they can install it themselves, and a greyed-out **Ship it**. Story 3.3 built the card without
  either, because there is nothing behind either button yet: Inflozo cannot build a theme zip and cannot
  deploy to anything. The card says what clears the restriction and offers **Re-check plan**, which does work.
  When the export and the deploy exist, the two buttons go back on this card.
status: open
severity: low
origin: Story 3.3 spec (2026-09-08), Boundaries "Never" and the Acceptance Criteria — UX-DR3, "a control that
  could never act is ABSENT, not greyed"
location: apps/web/app/(app)/app/(authed)/sites/site-notices.tsx (`PreviewOnly` — its control row carries
  Re-check plan alone) · apps/web/lib/probe-rule.ts (`PREVIEW_COPY`, whose body sentence drops the frame's
  "and export a theme zip whenever you want" for the same reason) · `B Missing Surfaces.dc.html:1188-1225` is
  the frame both depart from · epics.md E11 (Export) and E7 (Deploy)
reason: The frame is right about the destination and wrong about today. UX-DR3 forbids drawing a control that
  could never act — a greyed Ship it with no deploy path behind it explains nothing, and an Export button that
  404s is worse than no button. The COPY had to move with the control: the frame's body sentence promises the
  export in its second half, so a card built without the button and with the sentence would promise something
  that is not there. `probe-rule.test.ts` asserts the absence of both names in the copy, so restoring the
  sentence without restoring the control fails a test. The story that adds Export theme zip (E11) or Ship it
  (E7) adds the button, the sentence and this entry's closure together.
  **A THIRD departure, added by the review of 2026-09-08 because this entry is where B15's departures live:**
  the frame names the tier — "Ghost(Pro) **Starter** does not allow custom themes", "theme uploads **on
  Starter**" — and `PREVIEW_COPY` says "this site's Ghost(Pro) plan" and "on this plan" instead. The reason is
  that the tier is NOT KNOWABLE from what the probe reads: `customThemes` says what the plan forbids, never
  what it is called, and nothing in this story reads a plan name. Naming Starter would be asserting a fact
  Inflozo does not have. When the §4 T4 Starter trial makes a real `hostSettings` observable, the story that
  reads it decides whether the tier can be named and amends this entry with the answer.

## Deferred from: code review of spec-3-3-the-connect-time-probes (2026-09-08)

- DW-61 (below): the four notice blocks put a `<form>` inside the `<span>` the Kit's Banner wraps its children in.
- DW-62 (below): a site connected under Story 3.2 is never probed, because no product path reaches a first probe. **Closed by Story 3.7.**
- DW-63 (below): the probe rewrites `ghost_version` with none of connect's version rule. **Closed by Story 3.7.**
- DW-64 (below): **Re-check plan** has no throttle. **Amended by Story 3.7**, which added a second such control and weighed both, as this entry asked; still open, deliberately.
- DW-65 (below): four read-modify-write paths share `site_settings` with no concurrency control. **Amended by Story 3.7**, which added the fifth and the first that runs unattended; still open.

### DW-61: the notice blocks nest a form inside a span, because that is the slot the Kit gives them

plain: A tiny HTML technicality. The blue notices on a site's card each contain a button, and a button has
  to sit inside a form. The Kit's notice component puts whatever you give it inside a `<span>`, which by the
  written rules of HTML is not allowed to contain a form. Every browser accepts it, it looks right, and the
  accessibility checker finds nothing — but a strict HTML validator would complain.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `banner.tsx`'s content slot is a `<div>`. The parent is
  `flex`, so the child's own inline-vs-block display was never what laid this out; the look at all three widths is OWED ON THE DEPLOYED SITE, not claimed: the change was left
  uncommitted at Dev and ships with the Review commit (2026-09-11), so the owner's manual test step 5
  and the Deploy run are where every Banner is looked at (review, standing rule 2).
severity: low
origin: Story 3.3 code review (2026-09-08) — Blind Hunter and the Acceptance Auditor, independently
location: apps/web/components/kit/banner.tsx (`<span>{children}</span>` — the slot) ·
  apps/web/app/(app)/app/(authed)/sites/site-notices.tsx (the four blocks) ·
  apps/web/app/(app)/app/(authed)/passkey-nudge.tsx (the same shape, since Story 2.1)
reason: NOT this story's to fix. The pattern arrived with the owner's own two-button ruling at his test of
  2.1 and every Banner in the app shares the slot, so correcting it means changing `banner.tsx` for all of
  them — a Kit change, in a story about probes. `<span>` is phrasing content and `<form>` is flow content,
  but unlike `<p>` a browser does not reparse it, so nothing renders wrongly and axe reports zero violations
  at both widths. The story that next touches the Kit's Banner changes the slot to a `<div>` and closes this.

### DW-62: a site connected before Story 3.3 is never probed, because nothing asks it to be

plain: FIXED 2026-09-10 (Story 3.7) — Inflozo now looks at every connected site once a day on its own, and
  the very first pass starts with the sites that have never been looked at, so the two you connected before
  the checks existed are the first ones done. You can also ask for it yourself from a site's ⋯ menu.
status: closed
closed: 2026-09-10 — Story 3.7. `checkSite()` calls `probeSite` for every connected site, and AD-33's cron
  at `app/api/cron/site-health/route.ts` selects them ordered `last_checked_at` **nulls first** — the index
  the schema already draws (`:176`) — so a site that has never been checked is at the FRONT of the very
  first run, which is what makes that run a backfill rather than only a refresh. `health-rule.test.ts`
  asserts that ordering out of the route's own source, because a `.order()` quietly dropped would leave a
  never-checked site starving behind everything else with every gate green. The second caller is the ⋯
  menu's **Re-check connection**, so a customer need not wait for the schedule at all.
was_status: open
severity: low
origin: Story 3.3 code review (2026-09-08), Blind Hunter
location: apps/web/server/site-probe.ts (`probeSite`, whose callers are connect and B15's Re-check plan) ·
  apps/web/app/(app)/app/(authed)/sites/site-notices.tsx (`PreviewOnly` — the only surface carrying a
  re-probe control) · Story 3.7 (the daily health check, which re-runs this same function)
reason: The probe is deliberately one function with three callers and the third does not exist yet, so the
  gap is a scheduling gap and not a defect. Backfilling inside 3.3 would mean either a migration-time sweep
  (no) or a re-probe on every `/sites` render (two Ghost round trips per page view — no). 3.7's cron calls
  `probeSite` for every site daily and closes this on its first run; the entry exists so that story knows a
  first run is a BACKFILL and not only a refresh.

### DW-63: the probe rewrites ghost_version without connect's version rule

plain: FIXED 2026-09-10 (Story 3.7) — if a site is ever moved back to an old version of Ghost, its card now
  says "Reconnect needed" and tells you to update Ghost, instead of quietly recording the old version and
  carrying on.
status: closed
closed: 2026-09-10 — Story 3.7. `probeSite` now writes `ghost_version` only when `versionVerdict` — connect's
  own floor, CALLED and not restated — accepts it, and REPORTS the detected version to its caller either way
  (`ProbeSummary.version`, added for exactly this rather than a second `config/` read one level up).
  `healthOf` turns a refused version into `unhealthy` with the `ghost_too_old` reason, which is the surface
  this entry was waiting for. The stored version therefore stays a major `majorOf` can still pin
  `Accept-Version` to, rather than becoming one the product cannot talk. Executed in `health-rule.test.ts`
  against an injected version string and in `run-verify-site-health.py`'s `decision` step through the app's
  own function — no Ghost 4 server exists and cannot (MEASUREMENTS §38), which is why the rule was pure from
  the start.
was_status: open
severity: low
origin: Story 3.3 code review (2026-09-08), Blind Hunter
location: apps/web/server/site-probe.ts (the `ghost_version` write) · apps/web/lib/connect-rule.ts (the
  version rule connect applies) · apps/web/server/ghost-admin/index.ts (`majorOf`, which pins
  `Accept-Version` from the stored value)
reason: Story 3.7 is where a version is re-detected and where "this site is no longer supported" has a
  surface to appear on ("Reconnect needed", with reason and date). Refusing inside 3.3's probe would mean
  inventing an unhealthy state this epic cannot yet draw, and silently declining to store a version would
  be worse than storing it. 3.7 applies the rule at re-detection and closes this.

### DW-64: Re-check plan has no throttle

plain: The **Re-check plan** button on a Preview-only card can be pressed as often as somebody likes, and
  each press decrypts the stored key twice, makes two calls to their Ghost and writes four audit rows.
  **Story 3.7 added a second such button** — **Re-check connection**, on every site's ⋯ menu — and
  deliberately gave it no cooldown either.
status: open
severity: low
origin: Story 3.3 code review (2026-09-08), Blind Hunter; **amended 2026-09-10 by Story 3.7**, which weighed
  it as this entry asked and left it open on purpose
location: apps/web/app/(app)/app/(authed)/sites/actions.ts (`recheckPlan` AND `recheckConnection`) ·
  apps/web/server/site-probe.ts · apps/web/server/site-health.ts
reason: It is the user's own site, their own key and their own Ghost, and the button exists precisely so
  somebody who has just upgraded does not have to wait a day. A cooldown wants a rule nobody has decided
  (how long, and what the button says while it waits), and `settings_read_at` is already on the row to base
  one on. **Story 3.7 weighed both together, as this entry asked, and decided NOT to throttle** — the second
  control has exactly the same argument for existing (somebody who has just re-pasted a key wants the answer
  now, not tomorrow) and `last_checked_at` is now on the row as a basis, so the figure is the only thing
  missing and it is the owner's. What 3.7 DID add is R-98's guard on both: the row refuses a second press
  while one is in flight (`useSubmitting`), so the accidental double-tap this entry was mostly about no
  longer reaches the server **with scripts on** — with scripts off the form posts natively and a second
  press is a second post, which is the browser's own behaviour and the one this entry still leaves open. The remaining case is somebody pressing it deliberately, once a second, on
  their own site — and the story that gives the owner a reason to care about that cost decides the rule.

### DW-65: four writers share site_settings, and the last one wins

plain: Four things now write to the same box of settings on a site's record — the probe, the two answer
  buttons and **Re-check plan**. Each reads the box, changes one thing and writes the whole box back, so if
  two happened at the same instant the second would erase the first's change. It needs two things to
  happen within the same fraction of a second on one site.
status: open
severity: low
origin: Story 3.3 code review (2026-09-08), Blind Hunter and the Edge Case Hunter
location: apps/web/server/site-probe.ts (`probeSite`'s read-then-write, and its own `ponytail:` note) ·
  apps/web/app/(app)/app/(authed)/sites/actions.ts (`answerPortal`, `answerPlan` — each now re-reads the
  row first, which narrows the window without closing it)
reason: supabase-js speaks PostgREST and PostgREST has no `||` for jsonb, so the atomic form is
  `update sites set site_settings = site_settings || $patch::jsonb`, which must be SQL — and all SQL in
  this project goes through `server/ghost-admin/`, whose whole point is that it is the one place a
  credential is decrypted. Putting an ordinary settings write in there to buy atomicity would widen that
  module for the wrong reason. The story that gives the project a second, unprivileged SQL path — or 3.7,
  which adds a writer that runs unattended and therefore actually can collide — takes this.
  **AMENDED 2026-09-10 by Story 3.7, and it stays open.** The unattended writer this entry predicted now
  exists: the daily cron calls `probeSite`, whose read-then-write of `site_settings` is the fifth path onto
  that column. It collides with nothing today for a reason worth writing down rather than assuming — the
  cron is the ONLY writer that runs while nobody is looking, once a day at the hour `vercel.json` schedules, and every other writer is
  a button somebody has to press. Two runs of the cron cannot overlap on one site (one batch, in order), and
  a customer pressing **Re-check connection** during the daily pass would meet it — which is the case this
  entry describes and which needs the same fraction of a second it always did. The second unprivileged SQL
  path is still the honest fix and this story did not add one; what it did add was a reason to expect the
  collision rather than to hope for it.

### DW-66: half of FR-C4 — the announcement bar — cannot be built until a section can be placed

plain: FR-C4 promises four things at connect. Story 3.4 built two of them: Inflozo reads your accent
  colour, logo and menu off your Ghost, and puts them on a project. The other two are **copying your Ghost
  announcement bar into an Inflozo section** and then **offering to switch Ghost's own bar off**, and
  neither can be built yet. Nothing can be placed on a page until the editor defines what a page holds
  (Epic 4/5), there is no announcement design to place until the library is built (Epics 9–10), and
  switching the customer's bar off before Inflozo can publish a replacement (Epic 7) would empty the bar
  on their live site with nothing behind it. The same is true of the canvas showing live content from
  their site instead of placeholder text.
status: open
severity: medium
origin: Story 3.4 spec (2026-09-08) — the owner ruled it at Question 2, option 1
location: apps/web/lib/probe-rule.ts (`announcementOf` already stores `content`, `background` and
  `visibility` verbatim, and `brandOf` stores the rest) · apps/web/app/(app)/app/(authed)/sites/brand/
  page.tsx (S2c, which today offers the brand half only) · apps/web/lib/style-pack.ts (`style_pack.brand`,
  the key this story put in E6's column) · apps/web/server/ghost-admin/admin-rule.ts (`ADMIN_WRITES`
  carries `announcement_clear` and **nothing has ever called it**)
reason: The owner ruled that Epic 3 ships the brand half on schedule rather than staying open behind two
  epics (2026-09-08, Question 2, option 1). Everything the deferred half needs is ALREADY STORED and needs
  no second read of anybody's Ghost: `sites.site_settings.announcement` holds the bar's text, its
  background role and its visibility exactly as Ghost sends them (Story 3.3), and
  `sites.site_settings.brand` holds the accent, logo, icon, cover and menu (Story 3.4, MEASUREMENTS §40).
  The story that first places a section on a page owns the seed — it maps the text onto an **A2** design,
  the visibility onto **show to** and the background onto the **Background** role — and the consented
  "turn Ghost's own bar off" waits behind Epic 7's deploy, because P8's safety here is by sequencing and
  the sequence does not exist yet. `announcement_clear` staying uncalled is the check on that: the day it
  has a caller is the day this entry closes.
also: `projects.style_pack.brand` is a key Story 3.4 put in a column **E6 owns**. E6's Style Pack editor
  (Story 6.1) inherits it and decides whether a pack that carries a site brand shows it, offers to clear
  it, or re-derives the pack from it. Only `placeholderFor` reads it today, for the dashboard card's
  accent; every other field is stored for the epic that uses it.

### DW-67: a page that 404s inside the signed-in shell still answers HTTP 200

plain: When you open a link to something that is not yours or no longer exists — say a brand screen for
  a site whose brand has gone — Inflozo shows you the "not found" page, which is right. But the invisible
  status code the browser receives says 200 (success) rather than 404. A person sees the correct page;
  a search engine, a monitor or a script would be told the page was fine.
status: open — amended by Story 3.9 (2026-09-11); the PAGE half is closed
resolution: Story 3.9 (2026-09-11) — THE PAGE HALF CLOSES.
  `apps/web/app/(app)/app/(authed)/not-found.tsx` renders M9 404's words in the app's own Kit
  inside the shell, and `(authed)/[...unbuilt]/page.tsx` — which carries NO `loading.tsx`,
  deliberately, and is recorded in `busy.test.ts`'s `NO_SKELETON` with that reason — answers a
  real HTTP 404 for every unmatched app url. The three harness steps this entry's `note:` warned
  about moved in the same commit: `rendered()`, `brand-ownership` and the `?site=` forgery now
  match the app's own sentence, evaluated from `lib/not-found.ts`, instead of Next's default
  `could not be found`.
amended: THE STATUS HALF STAYS OPEN, NARROWED TO ONE ROUTE. `notFound()` from `/sites/brand` still
  commits 200 before the page runs, because that route has a skeleton by R-98 and a skeleton is a
  Suspense boundary. Trading that route's skeleton away for a status code on a `robots: noindex`
  page is a bad trade and nobody has asked for it. The measurements are in Story 3.9's `##
  Verification`. **Owner: the story that next has a reason to change that route's loading shape.**
severity: low
origin: Story 3.4 Dev harness (2026-09-08), step `brand-none` — measured, not reasoned
note: (as it stood before Story 3.9 — the three steps MOVED in the same commit as the page, per this
  note, and now match the app's own `NOT_FOUND.title`, evaluated from `lib/not-found.ts` by `app_text()`,
  so a re-wording moves the screen and the steps together. Kept for the record.) WHOEVER CLOSES THIS BREAKS THREE HARNESS STEPS, and they will not say why. `brand-none`,
  `brand-ownership` and the `?site=` forgery all recognise the not-found page by matching Next's own
  default string, `could not be found` (`run-verify-ghost-admin.py`'s `rendered()`). The fix for this
  entry is a real `not-found.tsx` drawn from the export's `M9 404`, whose words will not be those —
  so the three steps go red for a reason unrelated to what they assert. Update `rendered()` in the
  same change (review 5, 2026-09-09; propagate, never localise).
location: apps/web/app/(app)/app/(authed)/(dashboard)/loading.tsx ·
  apps/web/app/(app)/app/(authed)/sites/(list)/loading.tsx · sites/brand/loading.tsx ·
  account/loading.tsx — each a Suspense boundary over ITS OWN route since R-98 (2026-09-09) ·
  apps/web/app/(app)/app/(authed)/sites/brand/page.tsx (`notFound()`)
reason: `loading.tsx` puts a Suspense boundary over EVERY page in `(authed)`, so Next streams the shell
  and commits the status line before the page component runs — `notFound()` then renders the not-found
  page into an already-successful response. It is not this story's to fix: the same is true of every
  authed route, the pages themselves are `robots: noindex` so nothing indexes them, and the fix is the
  one `loading.tsx`'s own `ponytail:` note already names — move the dashboard and its skeleton into their
  own route group so the boundary stops covering pages that have no skeleton. The story that gives a
  second `(authed)` page its own loading shape takes it. THAT MOVE HAPPENED, in Story 3.4's Fix on the
  owner's finding 2 (ruling R-98, 2026-09-09): there is no group-wide boundary any more, so this is now
  a per-route property — a route WITH a skeleton (`/`, `/sites`, `/sites/brand`, `/account`) still
  commits its status before `notFound()`, and a route without one (`/kit`, `/sites/connect`) no longer
  does. WHAT REMAINS OPEN IS THE STATUS ITSELF, which nothing has asked the owner about, and the
  not-found PAGE being Next's default rather than M9 404 — the larger half of this entry. `brand-none`
  goes on asserting the page the customer sees and RECORDING the status beside it, rather than
  asserting a code the shell already sent.
  AND THE PAGE ITSELF IS NEXT'S DEFAULT, not Inflozo's (found at the Story 3.4 review, 2026-09-08).
  There is no `not-found.tsx` anywhere in `apps/web`, so every `notFound()` in the app renders the
  framework's own unstyled 404 — outside the shell and outside the export's vocabulary — while
  `M9 404` is drawn in the design export and has been since the marketing pass. The harness proves it
  by asserting Next's own string rather than any sentence the app owns. The same story takes both:
  they are one route-group question, and a real `not-found.tsx` is the thing that makes the status
  assertion worth writing.

### DW-68: an authed page on the deployed site occasionally sends no response for 60 seconds

plain: While checking Story 3.4 against the live site, the test browser sometimes sat waiting a whole
  minute for a page that normally arrives in under a second — always a page you have to be signed in
  to see, always a different one, and never the same one twice. Everything else was fast at that
  moment. The test now tries the page once more and says out loud that it had to, so the problem
  cannot hide; nobody has yet found what causes it.
status: open
  STORY 3.9 REVIEW (2026-09-11) — FOUR CONSECUTIVE RUNS FAILED TO FINISH, and the review's reading is
  that this is NOT DW-68 but its neighbour: one died on `net::ERR_NETWORK_CHANGED` (this machine), and
  three hit the 2700s ceiling. The site answered 200 on both hosts in under a second while the fourth
  was timing out, and `run-verify-dashboard.py` and `run-verify-passkeys.py` both passed against the
  same deployment in the same hour — so browser-driven runs against this deployment do complete. What
  changed is the run's LENGTH: `moved-domains` performs a full disconnect-and-reconnect through the UI
  per hint, which Story 3.9 took from two to five. Recorded here so a future session does not read the
  timeouts as this entry's 60-second stall; the length problem is DW-92.
severity: medium
origin: Story 3.4 Review (2026-09-08) — seven consecutive full harness runs against app.inflozo.com,
  each losing exactly one navigation out of roughly fifty
location: tools/probe/run-verify-ghost-admin.py (the counted `page.goto` retry and the `note:` lines) ·
  the deployed Next.js app on Vercel, every `(authed)` route
reason: Each run failed on ONE navigation to an authed route — `/sites`, `/sites/connect`, S2c, and the
  not-found path — at a different point every time, with a 60s navigation timeout and no response
  headers at all. What was measured healthy in the same window, so that none of it is the cause:
  PostgREST 0.25s, GoTrue `/auth/v1/settings` 0.2-0.8s and its admin route 0.45s, the transaction
  pooler `select 1` in 152ms with 19 backends and nothing idle-in-transaction, the edge answering
  `/sites` ten times in a row at 0.35s with no rate-limit or challenge header, and the machine's DNS
  stub resolving 150 of 150. Unauthenticated routes never hung; only routes whose render calls GoTrue
  and Supabase did — but both of those answer fast from outside, so that correlation is a clue and
  not a diagnosis.
  THE CONTROL THAT WOULD SETTLE IT CANNOT BE RUN as things stand: the same harness pointed at the
  PREVIOUS deployment with `--url` dies at the first browser step, because a preview URL cannot carry
  the magic-link sign-in the fixture uses. So whether this is the deployment, the platform or the
  network is genuinely OPEN, and no claim is made either way (standing rule: flag, do not guess).
  What was changed is only what could be justified: one retry after a navigation timeout, `waitUntil`
  and every timeout otherwise untouched, the count printed with the result and forwarded even on a
  passing run — a run that rode over a hang says so. A first attempt to fix it by navigating to
  `commit` instead of `load` was REVERTED when run 6 timed out on `commit` too, which disproved the
  "streamed `load` never fires" hypothesis it rested on.
  The story that next has a reason to open Vercel's runtime logs for a hung invocation takes this;
  giving the harness a way to sign in against an arbitrary deployment URL would also make the missing
  control runnable, and that is probably the first move.
  AMENDED AT THE SECOND REVIEW (2026-09-08), and the amendment matters: the retry above wrapped
  `page.goto` AND NOTHING ELSE. Four consecutive full runs in the review window failed three times —
  in `pro-connect-t3`, in `search` and in `brand-atcap` — and every one of the three was a
  `waitForURL` after a form submission, which the wrapper never saw, so `navRetries` stayed 0 and the
  run died rather than riding over the hang the retry exists for. The reported "1 navigation retry"
  was therefore a SUBSET, not a count. The wrapper now covers `goto`, `waitForURL` and `reload`
  through one helper, and the count prints from the `finally` so a run that hung and then FAILED
  still says what it cost — at the end of the `try` it printed only on the runs that did not need it.
  None of the three failures was ever an assertion: the affected steps pass whenever they are
  reached, and the four runs between them executed every step in the docstring. The open question is
  unchanged and no claim is made about the cause; what changed is that the mitigation now covers the
  class the entry describes, and that a red run is once again evidence of something rather than
  weather.
  THE WIDENING THEN PROVED ITSELF ON A RUN RATHER THAN ON AN ARGUMENT: the very next full run hung
  on `page.waitForURL((u) => u.pathname === '/sites')`, retried once and passed — a `waitForURL`,
  the class the old wrapper never saw. The note line names the method now, so the next occurrence
  says which one it was. Still open: whether the hang is the deployment, the platform or the
  network, and the control that would answer it is still the one that cannot be driven.
  A THIRD MANIFESTATION, and it is why the retry was NOT widened again (2026-09-08): one run timed
  out after 30s on `locator.waitFor` — the S2c heading after the real T1 connect — with 0 navigation
  retries, so no wrapped method was involved at all; the next run passed the same step. The retry
  deliberately stops at `goto`, `waitForURL` and `reload`, because a `locator.waitFor` is an
  ASSERTION nearly everywhere else in the harness and retrying those would hide real failures rather
  than ride over a hang. So the observed class is now "a page or a wait on the deployed app
  occasionally makes no progress for 30-60s", which is wider than what is mitigated, and a red run
  must still be read before it is believed.
  A FOURTH LOOK, AND THE FIRST ONE THAT NARROWS ANYTHING (Story 3.4 Fix, 2026-09-09). Three full
  runs against the same deployment failed twice, and both failures — plus two of the three the
  review's real-infra layer saw the day before — were `locator.waitFor` timeouts on ONE kind of
  element: an inline field error on the connect wizard (`#s2b-admin-key-error`, `#s2b-api-url-error`,
  and `text=Ghost said no`). Those are rendered by the Kit's `Input` (`components/kit/input.tsx:105`)
  from a SERVER ACTION'S RESULT, so what the harness is waiting for in each case is a POST to an
  authed route coming back — not a navigation. That is why every one of them reports
  `0 navigation retries`: the wrapper covers `goto`, `waitForURL` and `reload`, and none of those is
  involved. So the count printed with a run is a subset AGAIN, in a second way, and for the same
  underlying reason the second amendment found.
  WHAT THIS DOES AND DOES NOT SAY. It does not name a cause, and the control that would is still the
  one that cannot be driven. What it does is sharpen the SHAPE: the entry's title says "sends no
  response", and on the evidence that is right — but the thing failing to respond is at least as
  often a server action POST as a document GET, and the two hang the same way for the same duration
  on the same routes. Anyone opening Vercel's runtime logs for this should look for hung POST
  invocations to `(authed)` routes and not only for hung page renders; the connect wizard is where
  to look first, because it is where this run spends its POSTs.
  THE MITIGATION IS STILL NOT WIDENED, and the reason is the third amendment's reason unchanged: a
  `locator.waitFor` is an assertion nearly everywhere in this file, and retrying assertions hides
  real failures. The honest cost is what it has always been — roughly one full run in two reaches
  the end, so proving anything on the deployed site costs two or three runs, and a red run is read
  before it is believed rather than re-run on reflex.
  A FIFTH MANIFESTATION, AND ONE IT HAD BEEN HIDING BEHIND A WRONG ASSERTION (Story 3.6 Deploy,
  2026-09-10). Four full runs against production before a clean one: one hung on `pro-connect-t3`'s
  `s2cHeading` wait (the third manifestation's own kind), one on `keys-other-site`'s post-submit
  navigation, and one dropped the "landed" signal on `keys-forged`'s staff-field forgery (this
  story's own step; DW-74's kind, on a different form) — all read before being believed, per this
  entry's own rule, and all gone on the next run with nothing changed. The fourth run's failure was
  different in kind: `moved-domains`'s reconnect step used `waitForURL(pathname === '/sites')` to
  mean "the redirect happened," but the flow was ALREADY on `/sites` with a dialog open over it
  before the submit, so the predicate was true whether the submit succeeded or hung — this class of
  hang had been silently read as a pass, not a fail, for as long as that assertion existed. Fixed at
  Deploy by waiting on the dialog's own content field to be REMOVED from the DOM instead, which only
  a real navigation does; a hang now times out visibly, the same shape as everywhere else in this
  entry, rather than reporting a site that never reconnected as one that had.
  A SIXTH MANIFESTATION, WORSE THAN THE FIRST FIVE AND READ BEFORE BEING BELIEVED (Story 3.7 Deploy,
  2026-09-10). Three full runs against production in a row, none finishing inside the 1200s ceiling —
  the first logged one retried `page.goto` (to `/sites/brand?…`, this story's moved menu row) and
  still failed to finish; the second and third produced no `note:` line at all, hanging somewhere in
  the flow's first authed page with nothing to name. Three straight misses is bad luck within this
  entry's own "roughly one clean run in two" rate (about 1 in 8), not evidence of a new cause on its
  own — and it was READ rather than believed: a raw HTTP check outside Playwright (a fixture user's
  `/auth/confirm` then `GET /sites` in the same session) answered 200 in 1.95s and 200 in 0.84s,
  confirming the deployed app — including this story's new `notifications` read on the Sites page —
  is fast and healthy at the moment the harness could not finish. The hang is Playwright/harness-side,
  this entry's shape, not a product regression. Not re-run a fourth time; the brand-row relocation
  this run exists to prove live is instead proved by the owner's own manual test.

### DW-69: two presses of "Use your brand" in flight together can still make two projects

plain: Inflozo now makes sure that pressing "Use your brand" twice puts the colour on the project it
  already made, instead of making a second one. But it works that out by looking first and writing
  second. If two presses happen at the very same instant — a double click, or a page that retried —
  both can look, both can see no project yet, and both can make one. You would end up with two
  projects for one site, and possibly one more than your plan allows.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the migration adds a partial unique index `projects
  (linked_site_id) where linked_site_id is not null`, replacing the plain one — FR-B5's "at most
  one" made structural rather than a column comment. `useBrand`'s insert catches `23505` and
  RE-DECIDES rather than re-slugging: this insert sets `linked_site_id` as well as `slug` and both
  are unique, so `23505` means "another request got there first" without saying which column, and
  re-running `brandTarget` is the answer that is right either way — the second press lands on the
  project the first made. The application's idempotence is not replaced; this is the floor under
  it.
severity: low
origin: Story 3.4 Review 2 (2026-09-08) — reasoned from the code, not observed on the live site
location: apps/web/app/(app)/app/(authed)/sites/actions.ts (`useBrand`, the read-then-write around
  `brandTarget`) · supabase/migrations/20260904120000_complete_schema.sql:221,230
  (`projects.linked_site_id`, a plain index)
reason: The idempotence the story ships is real and is proved on the live site (`brand-rerun`,
  `brand-picker`), but it is a property of the APPLICATION and not of the schema: `linked_site_id`
  carries a plain index, and the column comment's "FR-B5: at most one" is a sentence rather than a
  constraint. The same race walks past `atCap`, because the cap is re-counted in the same
  read-then-write. The structural fix is a partial unique index —
  `projects (linked_site_id) where linked_site_id is not null` — plus catching `23505` and re-running
  `brandTarget`, and that is A MIGRATION, which this story's own "Ask First" list reserves to the
  owner. It is left open rather than smuggled in. The window is a few hundred milliseconds on a
  button most customers press once, which is why it is `low` and not `medium`; the story that next
  writes a migration on `projects` should take it, and E6 is the obvious candidate since it owns the
  column beside it.

### DW-70: S2c's project chooser is a surface with no frame, and it was never drawn back into the export

plain: When you have more than one project, the "Use your brand" screen now shows a card for each
  one, with a little picture of it. Nobody has drawn that screen in the design tool — it was built
  by copying the pieces from two screens that ARE drawn. Umang's own rule says a screen with no
  drawing gets drawn in the same design project, so it is a picture that is owed, not a decision.
status: open
severity: low
origin: Story 3.4 Review 3 (2026-09-08) — raised by the blind-hunter layer
location: apps/web/app/(app)/app/(authed)/sites/brand/page.tsx (the `choosing` fieldset) ·
  _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/S2 Onboarding.dc.html:150-196
reason: R-74 (owner, 2026-09-02) says a surface with no frame is extrapolated from the nearest one
  that has — same components, same tokens — AND "drawn in the same Claude Design project". The
  first half was done and is recorded beside the code: `radio-card.tsx`'s coral border and tint
  (Editor Sidebar Kit `:117`) and `design-picker.tsx`'s 64x44 wireframe tile (`:71`), no second
  vocabulary invented. The second half was not, and nothing tracked it, which is what makes it a
  finding rather than a choice. Two states are undrawn: the chooser itself, and the chooser at
  scale — Pro allows 25 projects, so the fieldset can render 25 stacked cards in a column with no
  scroll container and no ordering affordance beyond `updated_at desc, id desc`. Every live proof
  (`brand-picker`, `brand-picker-js-off`, `axe-brand-picker`, `brand-atcap-picker`) runs with
  exactly two cards, so the 25-card state has never been looked at by a human or a tool. The story
  that next opens the export for Epic 3 should draw both; a scroll bound on the fieldset is a
  one-line change once the frame says what the bound is. Not blocking: the owner's manual test
  reaches the two-card state, which is the state a customer reaches.

### DW-71: three brand keys are stored for no reader, and no epic has claimed them

plain: When Inflozo reads your brand off your Ghost site it keeps seven things. Four are used today
  — your colour, your logo, your menu, and your site's title, which names the project that gets made
  for it. The other three (your site icon, your cover picture and your description) are saved and
  nothing reads them. That is fine if some later part
  of the product wants them, but nothing has said which part, so they could sit there for ever.
status: open
severity: low
origin: Story 3.4 Review 3 (2026-09-08) — raised by the blind-hunter layer
location: apps/web/lib/probe-rule.ts (`brandOf`) · apps/web/lib/style-pack.ts (the `brand` key) ·
  _bmad-output/implementation-artifacts/deferred-work.md DW-66
reason: `brandOf` stores `accent`, `logo`, `icon`, `cover`, `nav`, `title` and `description` on
  `sites.site_settings.brand`, and `useBrand` copies the whole record into `projects.style_pack.brand`.
  `placeholderFor` reads `accent`; S2c draws `accent`, `logo` and `nav`; `title` names the created
  project. `icon`, `cover` and `description` have no reader anywhere and DW-66's deferred half — the
  announcement seed and the A2 placement — needs none of them. `style-pack.ts`'s header says "every
  other field is stored for the epic that uses it" and names no epic, which is the gap: a stored
  value with no claimant is how a column quietly becomes undeletable. It is cheap either way — E6
  owns the column and may well want `cover` for a hero and `icon` for a favicon — so the ask is a
  decision recorded, not a deletion: the story that first reads any of the three should say so here,
  and the story that reaches E6's Style Pack editor should either claim them or drop them from the
  reader. `hasBrand` narrows to `Brand` while validating only `nav` and one of accent/logo/nav, so
  the same three are the ones its predicate does not actually check — worth closing in the same pass.

### DW-72: two connected sites with the same Ghost title make two projects with the same name

plain: If you connect two Ghost sites that happen to have the same name — say both are called "Blog"
  — and press "Use your brand" on each, you get two projects both called "Blog". Their web addresses
  differ, so nothing breaks, but your dashboard shows two cards you cannot tell apart.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — `useBrand`'s create branch routes the name through `freeName`
  in `lib/projects.ts` — `nextUntitled`'s own plain numeric suffix, generalised to any base. Two
  Ghost sites both titled *Blog* now give **Blog** and **Blog 2** (the owner's ruling, option 1,
  2026-09-11). `copyName`'s "Copy of X" is explicitly not reused: this is a different site, not a
  copy.
severity: low
origin: Story 3.4 Review 3 (2026-09-08) — raised by the blind-hunter layer
location: apps/web/app/(app)/app/(authed)/sites/actions.ts (`useBrand`, the create branch) ·
  apps/web/lib/projects.ts (`copyName`, `nextUntitled`, `uniqueSlug`)
reason: The create branch dedupes the SLUG (`uniqueSlug(slugify(name), taken)`) and not the NAME, so
  two sites titled the same give two identically named projects with distinct slugs. `lib/projects.ts`
  already carries the taken-names idiom for exactly this — `copyName(name, taken)` appends the
  suffix `nextUntitled` uses — and the fix is to route the name through it, which is one line. It is
  deferred rather than patched because "Take my brand" is not a copy and `copyName`'s wording ("Copy
  of X") is wrong for it: the right suffix is the plain numeric one, and choosing the sentence a
  customer reads on their own dashboard is a naming decision the owner should see rather than one a
  review invents. Not reachable on Free (one project), so it waits for the story that next touches
  project naming.

### DW-73: the two documents a fresh session reads first are each one unbroken wall of prose

plain: Two files exist so that a new session — or Claude, or you — can find out fast what a part of
  Inflozo does and what was decided about it. Both have grown into single paragraphs hundreds of
  words long, one of them a single line of about eight thousand characters. Everything in them is
  correct; the trouble is that nobody can find the sentence they need, and the whole point of these
  two files is being findable.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — both walls broken up, and no text deleted — proved by
  normalising whitespace and comparing. `tools/doc-audit.py` grew `cell()`: a catalogue
  description may be a subject line plus detail lines, rendered into the cell as the subject then
  `<br>`-separated bullets (GFM cells take `<br>` and the Document column already used it, so this
  is a rendering change and not a format change). The `run-verify-ghost-admin.py` row — 11,006
  characters in one literal — is now a subject and eight bullets, one per story;
  `run-verify-site-health.py` with it. `epic-3-context.md`'s eleven walls became lead bullets with
  indented sub-bullets, each led by the story or ruling a reader is looking for; its longest line
  went from 4,494 characters to 883, and a comment at the top of the file states the rule so the
  next story appends a sub-bullet rather than lengthening the lead.
severity: low
origin: Story 3.4 Review 5 (2026-09-09) — raised by the blind-hunter layer
location: _bmad-output/implementation-artifacts/epic-3-context.md (the Auto-brand bullet) ·
  tools/doc-audit.py (the `run-verify-ghost-admin.py` catalogue row)
reason: Both are append-only by construction — every story adds its findings to the end of the same
  bullet or the same row, and nothing ever re-shapes them. The Auto-brand bullet now carries the
  whole of 3.4 in one sentence-chain; the harness row is one string literal of roughly 8,000
  characters. `CLAUDE.md` sends every session to the epic context first and the doc gate renders the
  catalogue row into `INDEX.md`, so these are the two highest-traffic paragraphs in the repository,
  and "flag, do not guess" depends on someone actually finding the sentence that contradicts. The
  fix is structural, not editorial — sub-bullets per story in the epic context, and a row whose
  description is a short subject line with the per-story detail beneath it — and it touches the
  generator, so it belongs to a story that owns those files rather than to a review of one story
  that appended to them.

### DW-74: `brand-ownership`'s "the press landed" control is unreliable, while the claim under it is not

plain: A safety test that proves nobody can put your brand on someone else's site still passes every
  time. What is flaky is only the part that checks the button press reached the server at all, so the
  test sometimes goes red without anything being wrong. It costs nothing on the live site.
status: open — amended by Story 3.9 (2026-09-11); THE CODE LANDED, THE PROOF IS OWED.
  `run-verify-ghost-admin.py` did not complete a run in four attempts (the spec's `## Verification`,
  Executed at Review, with the control: the site answered 200 on both hosts and two other browser
  harnesses passed against the same deployment). So the change below is IN the harness and has never
  been executed. Closing it needs one completed run, which is what DW-92 is about.
resolution: Story 3.9 (2026-09-11) — the arrival control is reliable because the page changed
  under it. `brand-ownership` reads the landing out of `<main>`, and Next's default not-found
  REPLACED the route rather than filling the landmark — which is the entry's own eighth-run datum.
  Story 3.9's `(authed)/not-found.tsx` renders INSIDE the shell, so the sentence is now in the
  landmark the control reads, and `notFoundInMain` asserts it on the not-found branch.
severity: low
origin: Story 3.4 Fix on the owner's test findings (2026-09-09) — measured over eight runs, not reasoned
location: tools/probe/run-verify-ghost-admin.py (step `brand-ownership`) ·
  apps/web/app/(app)/app/(authed)/sites/actions.ts (`useBrand`'s `notFound()` branch)
reason: The fifth review (2026-09-09) added a positive control to this step, because "the rows are
  byte-identical" proves nothing about a press that never arrived. The control waits for the forged
  **Use your brand** press to land on the not-found page. It passed in that review's run and in the
  first run after the owner's fix, and FAILED in three of the four later runs that reached it — and
  in run 6 the press produced neither the not-found page nor the `&failed=1` redirect within 20s,
  which is the pair of answers `useBrand` can give (its site read is `.maybeSingle()`: a stranger's
  row is no row and no error, so `notFound()`; a read that ERRORS redirects to `&failed=1`, which
  review 4 made deliberate — "one transient PostgREST failure is not a stranger's row").
  **THE SECURITY CLAIM PASSED IN EVERY RUN**: nothing is written, the caller's projects come back
  byte-identical, and none is linked to the stranger's site. Only the arrival control is unreliable.
  `Submit` (R-98) is excluded as the cause by construction — its only click-time addition is a guard
  that refuses a SECOND press, so a first click submits exactly as before, and an unhydrated page
  submits natively either way; the step also failed on a deployment that predates the route-group
  move and passed on one that carried every other part of the same change. What is NOT yet known is
  where the forged press actually goes: the step now records the URL and the page text it ended on,
  so the next run that reaches it answers that instead of it being reasoned about. Whoever picks this
  up starts from that line, AND THE FIRST DATUM IS ALREADY IN IT: on the green eighth run the press
  landed on `/sites/brand?site=<the stranger's id>` with `<main>` EMPTY, because Next's default
  not-found page replaces the route rather than filling the landmark — so the sentence the control
  waits for lives outside `main` and what varies is when it appears, not which branch was taken.
  Two of the five runs that reached the step passed. Related: DW-68, the harness's wider
  intermittent-wait problem — three of the same eight runs died early on an unrelated locator wait,
  each at a different point.


## Deferred from: spec-3-5-my-sites-their-caps-and-disconnecting-one (2026-09-09)

- DW-75 (below): FR-C6's 90-day snapshot orphan purge — the job, its notice and its download offer —
  moves from Epic 3 to **Story 7.20**, the story that first captures a snapshot. The owner's ruling at
  Question 1, option 1 (2026-09-09).

### DW-75: the 90-day purge of a snapshot moves to the story that first takes one

plain: When someone deploys with Inflozo for the first time, Inflozo archives a copy of the theme their site
  was wearing before — the safety net. If a site then stays disconnected for 90 days, that archive is deleted,
  after a warning and a download offer. **Nothing takes that archive yet** — that needs the deploy machinery,
  which is Epic 7. So the deleting-and-warning job is built there, beside the thing it deletes, instead of
  running nightly over an empty cupboard for months and offering a download link to a file whose shape is not
  decided. **The 90-day countdown itself is built now, in Story 3.5** — nothing is lost and nothing needs
  re-doing later.
status: open
severity: medium
origin: Story 3.5 Create (2026-09-09) — the owner's ruling at Question 1, option 1
owner: **Story 7.20** (the backup gate and the pre-Inflozo snapshot), Epic 7 — the story that first writes a
  `site_snapshots` row, so the purge and its subject are designed together
location: `_bmad-output/planning-artifacts/epics.md` Story 7.20 (its AC now carries the purge) and Story 3.5
  (its AC now points here) · `ARCHITECTURE-SPINE.md` AD-33, AD-29, AD-32 (the cron's owning epic, amended
  2026-09-09) · `apps/web/lib/storage-drain.ts` (the header names its future callers) ·
  `supabase/migrations/20260904120000_complete_schema.sql:199` (`site_snapshots.purge_after`)
what 3.5 leaves ready, so 7.20 builds only the job: **`sites.disconnected_at` is written** — Story 3.5 is its
  first and only writer — and **the 90-day deadline is DERIVED from it**, never stamped into
  `site_snapshots.purge_after`. That column carries FR-A5's 14-day account-deletion clock and only that, which
  is what keeps `restore_account()`'s `purge_after = null` correct and is how **DW-43 closes without SQL**.
  7.20 therefore needs no migration for the clock: it reads `sites.disconnected_at` and joins.
reason: FR-C6's rule is one rule — purge the orphan after a notice and a download offer, **and proceed on the
  deadline whether or not the offer was taken** — and splitting it across two epics months apart is how the
  second half of that sentence gets lost. It cannot be built in Epic 3 in any useful form: `site_snapshots`
  can hold no row until FR-J13's first upload (Story 7.20), the download offer must name an artifact whose
  storage path and zip shape 7.20 decides, and a nightly cron over a table that must stay empty is a deletion
  path with no test that can ever be positive. AD-33 admits a cron only with an owning epic; the owner moved
  this one's owner rather than leaving it nominally E3's and actually nobody's. **It is one of the five
  sanctioned deletion paths (AD-29, AD-32) and stays exactly one — this moves a path, it does not add a
  sixth.** When 7.20 builds it: `apps/web/app/api/cron/purge-snapshots/route.ts`, schedule in
  `apps/web/vercel.json`, owning epic in the route header, `CRON_SECRET` compared with `timingSafeEqual` and
  fail-closed, and `drainPrefix` from `lib/storage-drain.ts` over `site-snapshots/{uid}/{siteId}/` — objects
  **before** rows, as `purge-accounts` does.

### DW-76: removing a credential leaves no line in the credential audit log, and the log has no name for one

**CLOSED by Story 3.6 (Dev, 2026-09-09.)** `public.credential_action` gained `credential_change` —
one value, appended, in `supabase/migrations/20260909180000_credential_audit_and_key_id.sql` with
`SCHEMA.sql`, `RLS-TEST.sql` and the gate's copies in the same commit — and `store()` and `remove()`
in `apps/web/server/ghost-admin/index.ts` each write one row through it, **inside the same
`sql().begin()` as the write it describes**, so a rolled-back store leaves no row claiming it
happened. `detail` carries `{ kind, direction }` and nothing else (`AuditDetail` is the guard); each
row is stamped with its own route (`sites/keys`, `sites/keys/remove-token`, `sites/connect`,
`sites/disconnect`), which is why this story gave each writer its own route constant.
**`remove()`'s row is conditional and that is deliberate:** the update matches on a ref that is NOT
NULL, and `disconnectSite` removes BOTH kinds on every press while nothing stores a staff token until
Epic 7 — so an unconditional row would have written a false "the staff credential came out" line on
every disconnect for ever, which is this entry's own argument against `vault_decrypt` one table over.
The `vault_decrypt` counts the harness derives are unchanged: a decryption is still one row per
decryption.

plain: Inflozo keeps a private tamper-log of everything that touches a customer's Ghost keys — every call to
  their Ghost, every time a key is unlocked. It is the only safeguard in this area that *detects* rather than
  prevents. **Taking a key back out writes nothing to it**, and the log's list of allowed entry types is a
  fixed list in the database with no name that means "a key was removed". So recording one is a database
  change — and Story 3.5's spec forbids one in bold. The removal itself is proved a stronger way: the harness
  reads the locked store directly and sees the key gone.
status: **closed** — Story 3.6 Dev, 2026-09-09 (see the block above)
severity: low
origin: Story 3.5 Dev (2026-09-09) — the spec's acceptance criterion asked for "an audit row for each
  removal"; `remove()` was READ (standing rule 1) and writes none
owner: **Story 3.6** (Manage keys), which adds the *Remove token* control and therefore needs the very same
  entry type — one migration, made once, covering both callers. **Ruled by the owner, option 1
  (2026-09-09), at Story 3.5's Question 3:** "Leave it out of this story and add the removal entry when the
  log next needs changing — Story 3.6, which is the other story that removes keys." Story 3.5 shipped that
  behaviour already, so nothing there changes; 3.6's acceptance criteria in `epics.md` now carry it.
location: `apps/web/server/ghost-admin/index.ts:151` (`remove()`, and `store()` beside it, neither of which
  audits) · `supabase/migrations/20260904120000_complete_schema.sql:736` (`public.credential_action`, the
  six-value enum) · `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`disconnectSite`'s header records the
  finding beside the code) · `tools/probe/run-verify-ghost-admin.py` (`disconnect`, which proves the secret is
  gone by reading `vault.secrets` through the pooler instead)
reason: `public.credential_action` is `('admin_write','admin_read','vault_decrypt','entitlement_change',
  'admin_flag_change','moderation')`. None of them means a removal. Writing one under `vault_decrypt` would
  put a FALSE row in the one record that exists to be trusted, and would break both the `decrypt-path` and
  `audit` steps, whose counts are derived from "one `vault_decrypt` per decryption". Adding a seventh value is
  an `alter type`, which means a new migration, the RLS gate's copies, `SCHEMA.sql`, and a hand-application to
  the live database at Deploy — the one kind of edit that cannot be rolled back casually. Nothing is lost
  meanwhile: the disconnect is recorded on the site's own row (`disconnected_at`) and the secret's absence is
  executed every harness run. When it lands: one value, one `audit()` call inside `remove()` and one inside
  `store()` (a key going IN is unrecorded too), and the `audit` step's derived counts move with them.

### DW-77: a disconnect whose second credential removal fails leaves a site reading Connected with no Admin key

plain: Disconnecting takes two keys out, one after the other. If the first comes out and the second cannot —
  the locked store stops answering in between — the site is left saying **Connected** while the key it needs
  is already gone. Nothing is lost and nothing is wrong on the customer's Ghost; pressing Disconnect again
  finishes the job, and the site's own key list already says the key is not there. But between the two
  presses the card says one thing and the truth is another.
status: open
severity: low
origin: Story 3.5 code review (2026-09-09) — the Edge Case Hunter and the Blind Hunter both reached it from
  `disconnectSite`'s two sequential `remove()` calls
owner: **Epic 7**, the story that first stores a Staff Access Token — which is the story that makes this
  reachable at all
location: `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`disconnectSite`, the two `remove()` calls
  inside one `try`) · `apps/web/server/ghost-admin/index.ts` (`remove()`, one `sql().begin()` per call)
reason: **It cannot happen today.** Nothing stores a staff token until Epic 7, so `remove('staff')` matches no
  row and cannot fail on its own; and both calls cross the SAME pooler connection, so a store that refuses the
  second refuses the first, which the `try` already handles by leaving the site connected. The state is also
  honest rather than silent — `remove()` flips `credentials_present.admin` to false inside its own
  transaction, so the mirror never claims a key the site has not got, and Epic 3 already calls a partially
  credentialed site a first-class state and never an error. The fix, when it is worth making, is one
  transaction across both kinds rather than one per kind — a change to the chokepoint's shape, which is
  outside a story whose Code Map marks that file read-only. Recorded here rather than designed around, and
  it is the story that makes it reachable that should close it.

### DW-78: `admin_key_id` is never backfilled, so no site connected before Story 3.6 has an Admin mask or can raise the moved-domains hint

plain: FIXED 2026-09-10 (Story 3.7) — the API keys screen now shows the first few characters of the Admin
  key for every site, including the ones you connected before that screen existed, because the daily check
  fills them in as it goes. The "Moved domains?" note can raise on those records too now.
status: closed
closed: 2026-09-10 — Story 3.7, in the place this entry named as the candidate: the daily check decrypts
  once a day anyway, so `backfillAdminKeyId()` in `server/ghost-admin/index.ts` fills `admin_key_id` where
  it is null and does nothing at all where it is not. It is ONE statement in SQL, so the decrypted secret
  never enters Node — `split_part(v.decrypted_secret, ':', 1)` runs inside the database, which is narrower
  than `decrypt()` beside it, and the `vault_decrypt` audit row rides the same statement as a CTE exactly as
  `decrypt()`'s does. Both routes this entry rejected are still rejected: no Vault read went into a
  migration, and no write went onto the read path of every `call()`. `where admin_key_id is null` is the
  whole guard, so it can never overwrite a mask that disagrees with its secret.
was_status: open
severity: low
origin: Story 3.6 code review (2026-09-09) — the Blind Hunter, from `store()` being the only writer
owner: Story 3.7 — the daily health check, which visits every site's credentials anyway
location: `apps/web/server/ghost-admin/index.ts` (`store()` writes `admin_key_id`; `credentialsOf` reads it)
  · `supabase/migrations/20260909180000_credential_audit_and_key_id.sql` (the column, added nullable)
reason: The value is DERIVABLE — it is the half of the stored secret in front of the colon — but every route
  to it reads the Vault. A backfill in the migration would put a `vault.decrypted_secrets` read inside a
  schema change, which is precisely what AD-10 keeps to one module; a lazy fill on the next `call()` puts a
  write on the read path of every Ghost call. Both are decisions bigger than the blank mask they fix, and a
  missing mask is not a wrong one — the same argument the spec already makes for the missing hint. The
  daily health check is the natural place: it decrypts anyway, once per site per day.

### DW-79: the 90-day orphan window is written down twice, in two languages, with nothing asserting they agree

plain: "Your old site's copy is kept for 90 days" is stored as a number in the app's code and computed
  separately in the database. If one were ever changed the other would not follow, and nothing would notice.
status: open — amended by Story 3.9 (2026-09-11); the half named below is closed
resolution: Story 3.9 (2026-09-11) — the SILENT DRIFT closes: `apps/web/connect-rule.test.ts`
  reads `disconnected_at + interval '<n> days'` out of
  `20260907150000_account_deletion_window.sql` and asserts it equals `ORPHAN_SNAPSHOT_DAYS`, so
  the two homes can no longer be changed apart without something going red.
amended: THE SILENT DRIFT CLOSES AND THE "ONE HOME" HALF STAYS OPEN. A test now reads the
  migration's own figure, so the two cannot be changed apart unnoticed. The honest fix — the view
  reading a setting the app also reads, or the app deriving its figure from the view — is still
  **Story 7.20's**, the first code that depends on both.
severity: low
origin: Story 3.6 code review (2026-09-09) — the Blind Hunter, against standing rule 4
owner: **Story 7.20**, the orphan purge — the job that acts on the deadline, and the only place that can
  read both homes at once
location: `apps/web/lib/connect-rule.ts` (`ORPHAN_SNAPSHOT_DAYS`) · `supabase/migrations/
  20260907150000_account_deletion_window.sql` (`disconnected_at + interval '90 days'` in the view)
reason: They agree today and `connect-rule.test.ts` pins the app's copy at 90, so a silent drift needs
  someone to edit the SQL alone. The honest fix is one home — either the view reads a setting the app also
  reads, or the app derives its figure from the view — and choosing between those is the purge story's, which
  is the first code to depend on both. Recorded rather than patched with a comment that would itself go stale.

### DW-80: "a rolled-back store leaves no audit row" is asserted in four places and induced in none

plain: The credential log is written inside the same transaction as the key it describes, so that a save
  which fails leaves no line claiming it happened. That is stated in the migration, the spec, the ledger and
  the code — and nothing anywhere makes a save fail on purpose to check it.
status: done 2026-09-11 (Story 3.9)
resolution: Story 3.9 (2026-09-11) — the RLS gate now INDUCES the failure. Inside one transaction
  it inserts a credential row and its audit row, asserts the audit row is visible THERE (so the
  proof is not passing over a write that never happened), forces a division by zero, and asserts
  `private.credential_audit` is unchanged after the rollback — and the credential row with it, or
  the fixture is not modelling one transaction.
severity: low
origin: Story 3.6 code review (2026-09-09) — the Blind Hunter, against standing rule 2
owner: the next story that touches `private.credential_audit` or the RLS gate
location: `apps/web/server/ghost-admin/index.ts` (`store()` and `remove()`, `audit(..., tx)` inside
  `sql().begin()`) · `supabase/tests/rls.sql` (where the fixture would live)
reason: The RLS gate is the natural home — it already brings a PostgreSQL 17 container and already reaches
  the `private` tables — and the fixture is small: begin, insert a credential row and its audit row, force a
  failure, roll back, assert the audit table is unchanged. It was not written here because the claim is
  structural (one `begin()`, one `tx` handed to both writers) rather than conditional, and because inducing
  the failure means reaching past the application into the transaction. A structural claim with no control
  is still a claim without a control.

### DW-81: a crafted multi-field post to Manage keys can store one credential and then report that nothing changed

plain: The API keys screen has three separate save buttons, one per credential, and each sends only its own
  box. Someone hand-crafting a request could send two at once — and if the first is saved and the second is
  refused, the screen says "Nothing changed", which would not be true of the first.
status: open
severity: low
origin: Story 3.6 code review (2026-09-09) — the Edge Case Hunter
owner: the story that gives Manage keys a single combined Save, if one ever does
location: `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`saveKeys`, the three sequential branches)
reason: Unreachable from the product. `keys-panel.tsx` renders three `<form>`s and each carries exactly one
  typed field, which `keys-js-off` asserts off the SERVED markup every run — so producing this needs a
  hand-built POST, and the worst it yields is a true save described by a slightly wrong sentence on the
  crafter's own site. Nothing is written that the caller did not ask for, ownership is checked before every
  branch, and no other account is reachable. The fix — one transaction across all three, or a refusal of
  multi-field posts — is worth making only if the screen ever grows a combined Save, and it would be that
  change's to make.

## Deferred from: code review of spec-3-4-take-my-brand-from-my-site-in-one-click (2026-09-10)

### DW-82: opening a window over the Sites list drops the list's own filter, and closing it lands on the bare list

plain: If you have typed something into the Sites search box and then open "Use this site's brand" or
  "Manage API keys" on a card, the search is forgotten — the window opens over the full list, and when
  it closes you are on the full list too.
status: open
severity: low
origin: Story 3.4 code review, seventh review (2026-09-10) — the Blind Hunter and the Edge Case Hunter
owner: the story that next touches the Sites list's filter, or whichever of Epic 3's stories the owner
  reports it on
location: `apps/web/app/(app)/app/(authed)/sites/panel-link.tsx` (`router.push(panel)` — `brandPopupPath`
  and `keysPopupPath` carry only the site id) · `panel-modal.tsx` (`router.replace('/sites')`) ·
  `sites/actions.ts` (`SITES_URL` as every action's landing) · `brand-panel.tsx` and `keys-panel.tsx`
  (the ✕ and Cancel as `<Link href="/sites">`)
reason: The mechanism is shared by both windows and was built in Story 3.6's Fix (`acd31327`) on the
  owner's finding that the windows must live at the list's own address; carrying `?q=` through means
  every one of those six landings composes its URL from the current search params instead of a constant,
  which is one more thing each of them can get wrong, for a filter that a single keystroke restores. Worth
  doing when the list has more than a handful of cards for anyone, which today it does not.

## Deferred from: code review of spec-3-6-manage-keys-and-the-partially-credentialed-site (2026-09-10, third pass)

### DW-83: the moved-domains lookup picks the newest matching record, not the one that says most

plain: If you have connected the same Ghost site at three addresses and one of them is still connected,
  the "Moved domains?" note on the newest card may talk about the 90-day safety-net copy (an old,
  disconnected one) when a live twin exists — or the other way round.
status: open — amended by Story 3.9 (2026-09-11); THE CODE LANDED, THE PROOF IS OWED.
  `run-verify-ghost-admin.py` did not complete a run in four attempts (the spec's `## Verification`,
  Executed at Review, with the control: the site answered 200 on both hosts and two other browser
  harnesses passed against the same deployment). So the change below is IN the harness and has never
  been executed. Closing it needs one completed run, which is what DW-92 is about.
resolution: Story 3.9 (2026-09-11) — `findSiteByAdminKeyId`'s `order by` gains `(s.disconnected_at
  is null) desc` ahead of `s.created_at desc`, so a live twin outranks an old disconnected one and
  the hint the customer is shown is about a record he can still open. Proved by DW-85 (1)'s
  seeding, which is why the two closed together.
  Review (2026-09-11): the two seedings above put ONE matching record in front of the `order by` at a
  time, and with one candidate any order returns it — reverting the change left every step green.
  `moved-domains` now also seeds a live OLDER decoy beside a disconnected NEWER one and asserts the
  live hint, the one arrangement where `created_at desc` alone answers the wrong row; that run is
  in the spec's `## Verification`, Executed at Review.
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Edge Case Hunter
owner: the story that next touches FR-C8's hint, or Story 3.7 if its health check reads `admin_key_id`
location: `apps/web/server/ghost-admin/index.ts` (`findSiteByAdminKeyId`, `order by s.created_at desc limit 1`)
reason: needs a third record carrying the same Admin key id under one account, which nobody has today;
  the fix is an `order by (s.disconnected_at is null) desc` or returning every match, and either wants
  the harness seeding two decoys.

### DW-84: closing the keys window while a save is still in flight can re-open it with the answer

plain: If you press Save and then Escape before the answer arrives, the window closes and then comes
  back with the result you had already walked away from.
status: open
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Edge Case Hunter
owner: the story that next touches `panel-modal.tsx`
location: `apps/web/app/(app)/app/(authed)/sites/panel-modal.tsx` (`onClose` → `router.replace('/sites')`) ·
  `sites/actions.ts` (`keysRedirect` onto `/sites?manage=…`)
reason: a race a customer has to work to reach — the panel's own saves answer in well under a second —
  and the answer that arrives is a true one; tracking an in-flight submit across a navigation is more
  state than the window has today. The cross-tab twin (`credentials_present` read-modify-written by the
  Content save while another tab stores a key) is the same family and the same reason.

### DW-85: three live-harness controls Manage keys still owes

plain: Three things the API keys screen does right are not yet proved on the live site every run.
status: open — amended by Story 3.9 (2026-09-11); THE CODE LANDED, THE PROOF IS OWED.
  `run-verify-ghost-admin.py` did not complete a run in four attempts (the spec's `## Verification`,
  Executed at Review, with the control: the site answered 200 on both hosts and two other browser
  harnesses passed against the same deployment). So the change below is IN the harness and has never
  been executed. Closing it needs one completed run, which is what DW-92 is about.
resolution: Story 3.9 (2026-09-11) — all three seedings are in `run-verify-ghost-admin.py`'s
  `moved-domains` and `brand-ownership`: (1) the same decoy with `disconnected_at` nulled draws
  `KEYS.movedStillConnected` and NOT the snapshot wording; (2) a decoy under `OTHER_USER_ID`
  carrying the same Admin key id produces no hint at all, which is the first execution of
  `findSiteByAdminKeyId`'s `user_id` clause; (3) the stranger's site id forged into the WINDOW's
  own form lands back on the list rather than the 404, which is the write half of a branch whose
  read half alone had a driver.
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Verification Gap reviewer
owner: the next story that touches `tools/probe/run-verify-ghost-admin.py`'s Manage-keys block
location: `tools/probe/run-verify-ghost-admin.py` (`moved-domains`, `keys-forged`, `brand-ownership`)
reason: (1) the `?old=live` hint — a matched record that is STILL connected drawing
  `KEYS.movedStillConnected` — needs a second decoy seeding; (2) a decoy under `OTHER_USER_ID` carrying
  the same Admin key id producing NO hint, the cross-account control for `findSiteByAdminKeyId`'s
  `user_id` clause; (3) `useBrand`'s popup branch on a vanished row (`brand-ownership` forges on the full
  page only). The review added `keys-content`, `keys-test-refused`, `keys-phone`, the ✕, Back and
  `admin_key_id` conjuncts instead; these three are the remainder, each a seeding rather than a fix.

### DW-86: two Ghost Admin navigation paths in the copy are asserted, not cited

plain: The API keys screen tells you where in Ghost Admin to find your Staff Access Token and where to
  regenerate keys. Both paths were written from memory of Ghost's screens, not checked against them.
status: open
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Blind Hunter
owner: Story 3.7, or the first story that opens Ghost Admin's UI in a browser for another reason
location: `apps/web/lib/connect-rule.ts` (`KEYS.staff.ask`, `KEYS.rollHint`)
reason: standing rule 1 is about API facts Inflozo depends on; these are wayfinding sentences a
  customer can correct in one click, and checking them means driving Ghost Admin's UI on T1 and T3,
  which no probe does yet. `rollHint` also assumes the customer named the integration "Inflozo",
  which S2b's guide tells them to.


### DW-87: the Ghost-release compatibility broadcast has no library to check, and is split out of Story 3.7

plain: Each time the Ghost team releases a new version, Inflozo is meant to send one announcement to every
  customer — either "we checked our ready-made sections against it and all is well", or "these kinds of
  sections are affected, we recommend re-publishing". The check behind that announcement is a test of
  Inflozo's own library of sections, and **there is no library yet** — the sections are built in Epics 9,
  10 and 11. Building the announcement now would be a box to type a message into with nothing behind it.
  So it waits for the story that first puts sections in front of customers.
status: open — amended by Story 4.1 (2026-09-11); the ghostCompat-definition half is closed
resolution: Story 4.1 (2026-09-11) closed the BLOCKING half and nothing else. `ghostCompat`
  { minVersion, helpers[], deprecatedAt? } now has a definition, a type and a validation rule in
  `packages/library` and a worked example in `docs/section-authoring.md`, so FR-C5's compatibility
  watch has a field to read — it had none, which is why DW-87 named it. The entry stays OPEN because
  the other half is unchanged: the library still holds no design, so there is nothing to check and
  nothing to broadcast about. Owner is still Story 9.1.
amendment: Story 4.10 (2026-09-15) — the library now holds its first five designs, the provisional pilots, each with a
  `ghostCompat` (`minVersion` at least every matrix `since` it reads: 5.62.0 for the two reading
  `@site.allow_self_signup`). They ship to no customer and are provisional (AD-35), so the check still has nothing
  shipped to broadcast about; owner unchanged.
severity: medium
origin: Story 3.7 Create (2026-09-10) — the owner's ruling at Question 1, option 1
owner: **Story 9.1** — A1 Headers' content model, stylesheet and designs #1-4, the first story that ships
  designs to customers and the first in which any design declares `ghostCompat`. Epic 7's redeploy path
  (FR-J14) exists by then, so the notice has somewhere to send people. **One caveat for whoever picks it
  up, not a second-guess of the ruling:** epics.md flags Story 9.1 as the one story in each category run
  that "does strictly more than the others" and names A1 as the calibration point for session sizing. If
  9.1 overruns, this is the piece to move to A1's owner gate (Story 9.4) rather than something the
  category itself owes — the epic's own note says to resize the later stories, and this is not a design.
location: `_bmad-output/planning-artifacts/epics.md` (Story 3.7's ACs, where the two compatibility bullets
  are struck with this ruling's date; Story 9.1, which gains the AC) ·
  `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md`
  (AD-25, amended: E3 writes `site_health`, E9 writes `ghost_compat`) ·
  `apps/web/lib/health-email.ts` and `apps/web/lib/email-shell.ts` (Story 3.7 builds the channel this
  notice rides — FR-P1's "Reconnect needed" send — so the receiving story writes a second template on the
  same shell and no new send path)
reason: FR-C5 asks for a broadcast "using each design's `ghostCompat`" and FR-P2 admits it as one of two
  carve-outs precisely because it names affected shipped designs. `packages/library` holds a
  `package.json` and nothing else, and `ghostCompat` appears nowhere in the tree — so today the
  announcement could only be an owner-authored message with no verification behind it, and no
  "re-publish" for anyone to follow. Ghost's release notes are unusable as structured data (executed),
  so a human writes the sentence in either case; what waits is the CHECK, not the writing. Story 3.7
  builds everything the notice needs to travel — the `notifications` rows, the email shell and the
  "Reconnect needed" channel FR-P1 makes it ride — so the receiving story adds a trigger and a template,
  not a mechanism.

### DW-88: First Run's starter door carries a reason sentence that Epic 11 must take away with it

plain: The welcome screen shows three choices and the middle one — "start from a ready-made site" — is greyed out with a short line saying starters aren't ready yet. When the ready-made sites are actually built, that line has to go, or the screen will keep apologising for something that now works.
status: open
severity: low
origin: Story 3.8 Dev (2026-09-11)
location: apps/web/lib/first-run.ts · apps/web/app/(app)/app/(authed)/start/doors.tsx · apps/web/app/(app)/app/(authed)/new-project-sheet.tsx
reason: `STARTER_DOOR.reason` — "Starters aren't here yet." — is what UX-DR3 requires of a control that cannot
  act YET: greyed, with the sentence in the helper-caption slot. It is read by BOTH surfaces that draw the door,
  First Run's `doors.tsx` and the New Project Sheet, from the one module. The day Epic 11's starter chooser
  exists the field is deleted once, and the COMPILER then names both surfaces: `doors.tsx` reads
  `STARTER_DOOR.reason` into a greyed `<button>` drawn by hand, and the sheet's `GreyedDoor` reads it too —
  neither "comes alive" on its own (review, 2026-09-11 — the entry used to say they would); Epic 11 rewrites
  each as a live door, and the sentence's "Ten" leaves with it, derived from the roster the chooser draws
  (standing rule 4). The story that builds the chooser (Epic 11,
  the Starter Chooser surface in `EXPERIENCE.md` § Onboarding, B23a) owns this; nothing else may leave the
  sentence standing over a door that works. `first-run.test.ts` asserts only that neither surface keeps its own
  copy, so a stale sentence would not go red — this entry is the record.

## Deferred from: spec-3-9-the-deferred-work-sweep-at-the-end-of-epic-3 (2026-09-11)

### DW-89: with scripts off, a route whose page streams stays on its skeleton for ever

plain: If someone browses with JavaScript switched off, some screens never get past the grey "Loading…"
  placeholder — the real content arrives, but the step that swaps it in needs JavaScript. Nothing is
  broken for anyone with JavaScript on, which is everybody by default. The question underneath it is
  whether Inflozo promises to work at all without JavaScript, and that is the owner's call, not a
  developer's.
status: done 2026-09-11 (Story 3.9 review) — RULED, and the ruling is that nothing is built
resolution: The owner ruled it at Story 3.9's Question 5 (option 1, 2026-09-11): *"Say plainly that
  the app needs JavaScript, and keep the no-JavaScript promise only where it is already true — the
  forms."* So the streaming stays, every route keeps its own skeleton (R-98) and its first paint, and
  no route is changed. The entry closes on the DECISION, not on a change — which is why it is closed
  rather than left for a story that would spend on it.
  PROPAGATED (standing rule 3), because the risk this entry really carries is a later session reading
  a passing `js-off` step as a promise: the posture is now a scope statement in
  `ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` § *Where the floor stops*, beside R-6's, and the
  two harness steps that prove the forms half cite it.
severity: low
origin: Story 3.9 Dev (2026-09-11), verifying DW-56 — MEASURED on the deployed site with a real
  session, not reasoned
owner: **the owner rules first** (is scripts-off a committed mode?), then the story that owns whichever
  routes he names. Nothing should be spent on this before he has ruled.
location: apps/web/app/(app)/app/(authed)/(dashboard)/loading.tsx · account/loading.tsx · every
  `loading.tsx` R-98 requires · the pair that makes it visible is `/` against `/sites/connect`
reason: DW-56 said the authed SHELL hid its content without JavaScript. It does not, and the executed
  read that closed it found this instead. With scripts off and a signed-in session, on production:
  `/sites/connect?step=keys` renders **all three key fields and its submit visible**, `<main>` visible,
  the sidebar visible — the whole form a no-JS visitor is promised. But `/` renders `Loading…` and
  `/account` renders `Loading your account…`, and neither ever changes: a `loading.tsx` is a Suspense
  boundary, Next flushes the fallback first and swaps in the real content with an INLINE SCRIPT, and
  with scripts off that script never runs. `/sites` came through with real content in the same run,
  because its page answered inside the first flush — so this is not "every route with a skeleton", it
  is "every route slow enough to stream", which is a property of the data and not of the code.
  R-98 is what made this per-route rather than group-wide, and R-98 is right — the alternative is the
  wrong skeleton, which is the defect it was ruled for. The honest options are a decision, not a patch:
  commit to scripts-off and pay for it (no streaming on the authed routes, which costs every customer's
  first paint), or state plainly that the app needs JavaScript and keep the promise only where it is
  already true — the forms, which post server actions natively and are proved to. **The question for the
  owner is which**, and it wants asking in the story that would spend on it rather than here.

### DW-90: the GitHub token's expiry has a register row but still no mechanism that announces it

plain: The date the read-only GitHub key stops working is now written in the right place, but nothing
  will ever read that place on the day. GitHub itself tells a caller when a key expires, on every
  answer — the access-check tool could read that and warn a month ahead, so the date is never typed.
status: open
severity: low
origin: Story 3.9 review (2026-09-11), on DW-5's closure
owner: whichever story next touches `tools/probe/check-access.py`
location: tools/probe/check-access.py · VERIFY-AT-BUILD.md "The read-only GitHub token expires"
reason: GitHub answers a fine-grained token's requests with a `github-authentication-token-expiration`
  header. `check-access.py` already calls the API with `GITHUB_TOKEN`; reading that header and printing
  `[warn]` inside 30 days is derived (standing rule 4 — the register row's date would then be the
  second copy, not the first) and executable, where the row alone still relies on a probe answering
  401 on a day nobody is looking for a credential problem. Not built in 3.9: the entry's fix was the
  register row, and this is an addition to a tool with its own catalogue description.

### DW-91: two of Story 3.9's closures have no repeatable control — the error page's title and the sign-in card's `inert`

plain: Two small fixes were checked by hand once and nothing checks them again: the tab title on the
  "something went wrong" page, and the sign-in card refusing clicks and the keyboard while the
  passkey sheet is up. Either could quietly come undone.
status: open
severity: low
origin: Story 3.9 review (2026-09-11), verification-gap layer, on DW-34 and DW-37
owner: the first story to add a local-build step to a harness (DW-34's own note names
  `run-verify-dashboard.py --url` on a `next build && next start` as the shape), or Story 12.x's
  sign-in work for the passkey half
location: apps/web/app/(app)/app/error.tsx:52 · apps/web/app/(app)/app/sign-in/sign-in-form.tsx:156 ·
  tools/probe/run-verify-passkeys.py
reason: `document.title` in the error boundary and `inert`/`aria-hidden` on the pending card are each
  pinned by nothing: delete either line and `pnpm check`, the RLS gate and both harnesses stay green
  (executed at the review). The passkeys harness drives a CDP virtual authenticator, so holding the
  ceremony pending — presence simulation off — and running the dashboard harness's focus probe plus axe
  over the card is the repeatable form; a throwing route for the error page exists only on a local
  build, which no harness starts today.

### DW-92: the Ghost-admin harness can no longer finish a run, so its own newest controls have never executed

plain: The big automated check that drives a real browser against the live site has grown long enough
  that it runs out of time before it finishes — four tries in a row. Everything it newly checks is
  therefore written down but never actually run. It needs a way to run one section on its own.
status: open
severity: medium
origin: Story 3.9 review (2026-09-11) — four consecutive attempts, one network death and three 2700s
  timeouts, with the site answering 200 on both hosts throughout and two sibling harnesses passing
owner: the next story that needs a `run-verify-ghost-admin.py` step executed — which is the next story
  to touch connect, Manage keys or Use your brand, and immediately Story 3.9's own re-run
location: tools/probe/run-verify-ghost-admin.py (`run_browser`'s `limit`, `moved-domains`'s
  `movedAgain()`, and the absence of a step filter) · the steps owed a run: the three `rendered()`
  retargets, DW-74's `notFoundInMain`, DW-85 (1)(2)(3), DW-83's two-record seeding
reason: `moved-domains` drives a real disconnect-and-reconnect through the product's UI for every hint
  it asserts; Story 3.9's Dev phase took that from two to four and its review to five, and the Dev
  phase had ALREADY measured the first post-seeding run hitting the old 1200s ceiling "with the browser
  half still working" — which is why the ceiling is 2700s, and it is not enough either. Raising it
  again is the wrong move on its own: the run is one `node` process with no step filter, so proving a
  single step costs the whole suite, and `capture_output=True` buffers the child so a timed-out run can
  print no notes at all. THE FIX THE REVIEW WOULD MAKE, not made here because it is a tool change with
  its own catalogue row and this story is a sweep: a `--only <step>` argument that runs the named steps
  and their seedings, the way `--check` already selects a subset. Then a story that changes one step
  pays for one step. Until it exists, every closure resting on this harness is owed a full run.

### DW-93: the stress harness never removes `data-empty` from a prop-attribute-only element, and implements no `hide` for it

plain: The proof-of-concept compiler has a rule for "if this piece of content is empty, hide the
  element". It applies that rule to text and to Ghost-bound attributes, but not to an element whose
  only content is a user-authored attribute (an image whose source the customer picked). There the
  marker is left behind and nothing is hidden. No test section uses that shape today, so nothing
  breaks; the real compiler in Story 4.2 replaces this code and must get it right.
status: done 2026-09-11 (Story 4.2)
resolution: Story 4.2 (2026-09-11) — the harness's `applyProps` is gone; `packages/section-runtime`'s
  prop loop now reads `data-empty` on the `data-prop-attr` element, hides the element when the FIRST
  entry's prop is unset (the same first-entry rule the bound-attribute branch uses, so the two agree),
  and a final sweep removes every surviving `data-empty` in scope — so the marker cannot leak whichever
  branch consumed it. Asserted on BOTH emitters by `packages/section-runtime/src/agreement.test.ts`,
  "DW-93 — data-empty=\"hide\" on data-prop-attr hides the element on both emitters", which also checks
  that a prop that IS set keeps the element.
severity: low
origin: Story 4.1 review (2026-09-11) — Edge Case Hunter, deferred as pre-existing harness behaviour
owner: Story 4.2 — the two emitters replace `applyProps`; the validator already treats `data-prop-attr`
  as guardable, so the emitters must honour `data-empty="hide"` on it (an empty user-picked image
  hides the element, never the attribute — FR-H8)
location: tools/stress/compile.js `applyProps` (the `data-prop-attr` loop removes only its own attribute)
reason: not fixed in the review because the harness is the CONTROL this story's grammar was lifted from
  and its emitters are throwaway; adding a `hide` path there would be a behaviour the agreement test
  then has to cover for code 4.2 deletes. The leak gate would catch a surviving `data-empty` the
  moment a fixture used the shape.

## Deferred from: code review of spec-4-2-the-section-runtime-one-source-two-emitters-proven-to-agree (2026-09-11)

### DW-94: the documentation gate does not walk `packages/`, so the two moved proofs left the catalogue

plain: The index of project documents cannot list files that live in the code packages, so the two
  test files that prove "what you see is what ships" are no longer listed on their own — a reader
  finds them only through the compiler's row. Nothing is unproven; it is only harder to find.
status: done 2026-09-15 (Story 4.10)
resolution: Story 4.10 (2026-09-15) decided it as its owner: `BASES` stays as it is. The five pilots and their snapshots are
  the first document-shaped files a story adds under `packages/`, and a snapshot is GENERATED output, not a document —
  so the catalogue stays a planning index, and `tools/check-snapshots.mjs`'s catalogue row names both the designs
  (`packages/library/designs/`) and the snapshots (`packages/library/snapshots/`) it covers, as the compiler's row
  names the proofs.
severity: low
origin: Story 4.2 (2026-09-11) — deviation 3 of the Dev run, recorded in the spec; raised as a
  finding by the review because a decision taken by omission had no owning document
owner: unassigned — the first story that adds a second document-shaped file under `packages/`
  (the snapshot harness in 4.10; Story 4.7 withdrew a design's `behaviour.js` and added only code, named in
  `tools/probe/run-verify-core.py`'s catalogue row) decides whether `BASES`
  in `tools/doc-audit.py` widens to `packages/` or whether the catalogue stays a planning index
location: tools/doc-audit.py `BASES`; the `tools/stress/compile.js` catalogue row names both proofs
reason: widening `BASES` pulls every future design's files into the gate, which is a decision about
  what the catalogue IS, not a fix; the compiler's row keeps `INDEX.md` truthful meanwhile

### DW-95: AD-36 now promises that `ghost-shim` calls `safeCssColor`, and no story task says so

plain: The rulebook says the part of the product that imitates Ghost on the editing canvas will use
  the same colour-checking function the canvas uses. That part is Story 4.3's, and 4.3's task list
  does not yet mention it — so it could be built without the check and nobody would notice until a
  hostile tag colour reached the canvas through the shim.
status: done 2026-09-11 (Story 4.3)
severity: medium
origin: Story 4.2 review (2026-09-11) — Blind Hunter and Acceptance Auditor: two code comments and
  the SPINE's AD-36 #4 amendment named the call in the present tense while `packages/ghost-shim`
  is still the stub
owner: Story 4.3 — when the shim renders a recorded Ghost `accent_color` (or any colour-valued
  field) on the canvas, it calls `safeCssColor(value, '--accent')` from `@inflozo/library`, and its
  contract tests carry the hostile vector `red;}body{display:none` beside the legitimate `#f0f`
location: packages/library/src/vocabulary.ts `safeCssColor`; ARCHITECTURE-SPINE.md AD-36 bullet 4
reason: not this story's — the shim does not exist yet; the comments were reworded to the future
  tense in the review so nothing claims a call that is not there
resolution: CLOSED by Story 4.3 (2026-09-11). `packages/ghost-shim` exports
  `ghostColor(value) = safeCssColor(value, COLOUR_FALLBACK_TOKEN)` with `COLOUR_FALLBACK_TOKEN`
  `'--accent'`, and `packages/section-runtime/src/core.ts`'s `data-bind-style` canvas branch calls
  `ghostColor` rather than importing `safeCssColor` itself — so there is one copy, reached through
  one door. `contract.test.ts` asserts the four hostile values MEASUREMENTS §21e recorded Ghost
  accepting verbatim — and the bare word `red` beside them — all fall back to `var(--accent)`, that `#f0f` and `rgb(255, 0, 255)` survive,
  that the connected site's own RECORDED `accent_color` survives on both majors, and that
  `ghostColor(v)` and `safeCssColor(v, '--accent')` return the same string — which is the assertion
  that a second parser has not grown. AD-36 bullet 4's future tense is now past tense.

### DW-96: `tidy` strips a blank line inside user text on the canvas but not in the theme

plain: If a customer types a paragraph with an empty line in the middle of it, the editing canvas
  drops that empty line while the published site keeps it — only visible in a section styled to
  preserve line breaks, which none of the first designs is.
status: open
severity: low
origin: Story 4.2 review (2026-09-11) — Edge Case Hunter; pre-existing in the stress harness, which
  ran the same trim on both paths
owner: the first category story (Epics 9–11) whose design's stylesheet sets `white-space: pre` or `pre-wrap` on user
  text — none of Story 4.10's five pilots does (re-owned 2026-09-15); the category gate checks it
location: packages/section-runtime/src/core.ts `tidy` (`renderCanvas` runs it after user content is
  in the DOM; `renderTheme` runs it before `substitute`)
reason: no design in the reference set or the 70-section fixture preserves whitespace, so the
  difference is unobservable today; the fix is a one-line ordering change in the story that can
  observe it


### DW-97: `data-pagination="numbers"` emits a page indicator, and a row of clickable page numbers is a mechanism no story owns

plain: A section can show "page 2 of 3" but not a row of clickable page numbers — 1 2 3 — because
  Ghost does not tell a theme how to draw one. Somebody has to decide whether Inflozo should ever
  offer the clickable row, since building it means counting something Ghost does not hand us.
status: done 2026-09-15 (Story 4.10)
resolution: R-109 (owner, 2026-09-15, Story 4.10's Q2, option 1): there is no row of clickable page numbers.
  `data-pagination="numbers"` stays the "5 / 11" indicator on both emitters; the comment on the `numbers` branch in
  `core.ts` and `docs/section-authoring.md` § 3 now say so, and A34's category story redraws A34 #1 Numbers to it
  (DW-149).
severity: low
origin: Story 4.3 (2026-09-11) — the directive came off the refused list and had to emit something.
  `docs/section-authoring.md` § 3's example WAS `<ol class="pager__numbers" data-pagination="numbers"></ol>`,
  which reads as a list of numbered page links, while Ghost's pagination context carries only `page`
  and `pages` with no way to loop a range in Handlebars. A list of links would therefore have to be
  an Inflozo partial counting something Ghost does not expose, which is a mechanism no story owns.
  **The example was corrected to the indicator form in the same story** (`<span … >1 / 1</span>`), so
  the guide no longer contradicts what ships and the only thing still open is the product question
  below — the contradiction is closed, the decision is not.
owner: the owner — the question is plain English and has an example, so it belongs under
  `## Questions for the owner` in the first story that authors a design carrying pagination
  (Story 4.10's paginated-feed pilot is the first that can). Until then the indicator ships and the
  authoring guide says so, so nothing is silently different.
location: packages/section-runtime/src/core.ts (the `data-pagination` loop, `numbers` branch);
  docs/section-authoring.md § 3 "The three the shim owns"; packages/section-runtime/src/agreement.test.ts
reason: settling it here would be inventing a decision the owner never made (standing rule 6), and
  the indicator form is the one both emitters can produce identically from Ghost's own context — so
  the lazy form is also the only one currently provable

## Deferred from: code review of spec-4-3-the-ghost-helper-shim-and-its-contract-tests (2026-09-12)

### DW-98: `{{date}}` on the canvas is UTC while the site renders in the SITE's timezone

plain: A site set to, say, New York time shows a post dated "Jul 18" on the live site while the
  canvas — which only knows UTC — could show "Jul 19" for the same post if it was published late in
  the evening. Nobody sees this yet because no story hands the canvas real site data.
status: open
severity: medium
origin: Story 4.3 review (2026-09-12) — Blind Hunter. The shim formats from UTC getters because AD-1
  bans `Intl` and every timezone read; both recording sites are `Etc/UTC` and `contract.test.ts`
  asserts that condition by name. `RenderInput.site` carries no offset, so a connected site in any
  other zone is silently hours off on the canvas — a WYSIWYG gap on every date.
owner: the story that first hands the canvas a connected site's settings snapshot (FR-C2 — Epic 5's
  canvas). *(Narrowed by Story 4.6, 2026-09-14: the binding matrix reads a version and never the
  connection's settings, so it is not a candidate.)* The editor may use `Intl` (it is
  `apps/web`, not a core package): it computes the site's offset for the post's instant and passes a
  per-value offset (the site's IANA `timezone` name resolved at the post's own instant, because one
  offset is wrong across a DST boundary inside a single page of posts); the shim applies it before
  formatting. AD-1 stays intact.
location: packages/ghost-shim/src/index.ts `formatDate`; packages/section-runtime/src/core.ts `RenderInput.site`
reason: not this story's — no caller passes real site data yet, and the recording condition is
  asserted rather than assumed, so the gap fails loudly the day a non-UTC recording is made

### DW-99: `{{total_paid_members}}`, `{{content_api_url}}`, `{{t}}` and `{{tags}}`/`{{authors}}` have shim functions no directive can reach — `{{t}}`'s part closed by Story 4.9

plain: The imitation of Ghost knows how to print the paid-member count and the API address, but no
  section can ask for them yet, because the list of things a section may ask for by name was fixed in
  Story 4.1 and does not include them.
status: open
severity: low
origin: Story 4.3 review (2026-09-12) — Acceptance Auditor. `bareHelper` resolves both (the review
  added the cases) and `contract.test.ts` asserts both against the recordings, but `BARE_HELPERS` in
  `packages/library/src/vocabulary.ts` is 4.1's closed list and `data-helper` refuses any other name.
  Appendix B's A29 filter design needs `content_api_url` beside `content_api_key`. The review's
  second pass adds `t()` (reachable only through 4.9's `data-t`) and `taxonomyItems` (no directive
  renders a tag or author list yet) to the same class: shimmed, recorded, asserted, unreachable.
resolution: partial, and the entry stays open — Story 4.9 (2026-09-14) made `t()` reachable: `data-t` and
  `data-t-attr` render on both emitters and the canvas calls the shim's `t()` over the project's strings, asserted
  against the new `{{t}}` recordings on both majors (MEASUREMENTS §44). `{{total_paid_members}}`,
  `{{content_api_url}}` and `taxonomyItems` are still unreachable.
owner: re-owned by Story 4.10 (2026-09-15), whose pilots needed none of the three: A22's category story for
  `{{total_paid_members}}` (A22 #1's paid count, left there by the pilot), and the first category story that authors a
  design reading `{{content_api_url}}` (A29's filter) or a tag/author list (`taxonomyItems`)
location: packages/library/src/vocabulary.ts `BARE_HELPERS`; packages/ghost-shim/src/index.ts `bareHelper`
reason: adding a name to 4.1's vocabulary is 4.1's format changing, which a review of 4.3 does not do
  on its own; the functions exist so the change is one line when its story arrives

### DW-100: `cards.js` has no no-JS sentence and no edit-safe row

plain: The editing canvas will run Ghost's four little card scripts (the ones that open a question box or
  play audio), but nobody has written down what those cards do when scripts are off, or whether they are safe
  to run while someone is editing.
status: done 2026-09-14 (Story 4.7)
resolution: Story 4.7 (2026-09-14) — research §7 carries a `cards.js` row, read in Ghost 6.58.0's vendored
  scripts and the Orbit Weekly recordings rather than taken from the reconcile's proposal: with JavaScript off
  the audio and video cards show no working player (Ghost emits neither with `controls`), the toggle stays
  closed (`data-kg-toggle-state="close"`), and gallery rows lose their proportions (only `gallery.js` sets each
  image's `flex` ratio). Edit-safe **yes** — it acts only inside the post-body fixture, which nothing on the
  canvas edits (FR-H3(1)); Story 5.15 confirms both. `python3 tools/derive-module-reach.py --check` fails if the
  row goes, and `checkThemeJs` names `cards.js` as `assets/js/`'s one exception.
severity: low
origin: Story 4.4 (2026-09-13) — spec task "propagate"; `reconcile-designs.md:4100`.
owner: Story 4.7 (`core` and the behaviour-module registry)
location: packages/library/orbit-weekly/vendor/cards/js/ · FR-J4 · registry §7 · FR-D20's edit-safe table
reason: FR-H3(1) has the canvas load the four vendored scripts, so they run while editing, but `cards.js`
  sits outside FR-J4's repo-authored module set, so it has neither the no-JS degradation sentence nor the
  `edit-safe` declaration every module carries. The line the reconcile proposed: "`cards.js` — with JS off the
  audio/video players are inert, gallery rows lose proportion, the toggle stays in its authored state". Story
  4.4's review page loads them unconditionally, which is right for a review surface and undecided for E5's canvas.

### DW-101: C4 lists an NFT card, and Ghost has no Lexical renderer for one on either major

plain: The drawing of the sample article shows a "collectible" card near the end, but Ghost's current editor
  cannot make that card at all, so the real recorded article leaves it out.
status: open
severity: low
origin: Story 4.4 Dev (2026-09-13) — executed. `kg-default-nodes` 2.2.0 (Ghost 6.58.0) and 2.0.1 (Ghost
  5.130.6) carry no `nft` node directory; `kg-nft-card` exists only in the mobiledoc renderer
  (`kg-default-cards/.../embed/nft.js`), which R-66 excludes. `tools/probe/record-cards.py` refuses any corpus
  card without a Lexical renderer by name, so the fixture omits it rather than recording an empty snapshot.
owner: A33's category gate (Epic 10) with R-67 — whose "`kg-nft-card` stays unstyled deliberately" already
  points the same way; C4's CARDS row and A25-0's inventory should say NFT is legacy-only.
location: C Post Body.dc.html:1913-1929 (C4 "What the fixture covers" → CARDS) · packages/library/orbit-weekly/corpus.json
reason: the export is never edited (R-74); the design note belongs to the category that owns the card treatments.

### DW-102: the fixture's audio and video cards carry no media, so their players play nothing

plain: The sample article's audio player and video look right, but pressing play does nothing, because no
  sound or video file was made for the sample publication.
status: open
severity: low
origin: Story 4.4 Dev (2026-09-13). The corpus points the audio and video cards at
  `https://orbit-weekly.example/media/…`, which nothing serves; the review page's CSP (`default-src 'self'`,
  no `media-src`) blocks the load and the browser logs it. The cards' chrome, thumbnails and Ghost's player
  scripts all render and bind.
owner: E5 (the editing canvas), if a playable preview is wanted — a short internally-produced clip served
  same-origin, and the recording re-run.
location: packages/library/orbit-weekly/corpus.json (`audio`, `video-*`) · apps/web/lib/style-guide.ts `withImages`
reason: no encoder is installed to produce a licence-clean video, and nothing in Story 4.4's acceptance plays media.

### DW-103: the resolver's recorded Ghost defaults are read from whatever else is on the test boxes

plain: The sample data's "newest first, fifteen at a time" rule is checked against a list the test servers happen to return, so another test that adds a post to those servers changes that list for a reason that has nothing to do with Ghost.
status: open
severity: low
origin: Story 4.4 review (2026-09-13) — Blind Hunter.
owner: the first story that re-runs `tools/probe/record-cards.py` for another reason (a Ghost target bump, NFR-6)
location: tools/probe/record-cards.py `api_defaults` · packages/library/orbit-weekly/fixtures/ghost{5,6}/capture.json `content_api_defaults`
reason: `api_defaults` records the live boxes' own posts, tags, authors and tiers with no order or limit passed, and
  `orbit-weekly.test.ts` sorts them by the resolver's default order and asserts equality. That proves Ghost's default
  order and limit, which is the point — but the rows themselves are the probes' leftovers, so a later probe that
  creates a post rewrites `capture.json` on the next run with no Ghost change behind it, and the test's `rows.length > 1`
  guard depends on the boxes carrying at least two rows per resource. Recording the defaults against rows the recorder
  itself owns would make the file stable; not done here because the fixture documents are returned to draft before the
  read (they must not sit in the recorded feed), so the recorder would need a second, permanent pair of documents.

### DW-104: the validator accepts NQL the offline resolver refuses, so a design can validate green and preview empty

plain: The checker that approves a design's data query allows a little more than the preview can actually run, so a design could pass every check and still show an empty list in the editor.
status: open
severity: low
origin: Story 4.4 review (2026-09-13) — Verification Gap.
owner: Story 5.19 (the Data group's Source, the first place a customer composes a filter) — re-owned by Story
  4.10 (2026-09-15): none of the five pilots declares a filter at all (A4 #13's query is `fixed` with no filter), so the
  pilots could not decide which grammar moves
location: packages/library/src/validate.ts `bad-get-filter` (`,` allowed) and `preview-seed-missing` (any non-empty string) · packages/library/src/orbit-weekly.ts `predicate` (`,` refused by name) and `resolvePreviewSeed`
reason: `validate.ts` lets `,` through and accepts any non-empty `previewSeed`, while `resolveSource` refuses `,`,
  parentheses and comparisons by name and `resolvePreviewSeed` refuses everything but `orbit-weekly`. The review added
  `orbit-weekly.test.ts`'s "the reference design validates AND previews" so every shipped design's bindings are run
  through the resolver, which catches the drift for designs in the repo; the two grammars themselves still differ, and
  which one moves — the resolver learning `,` (an `or`) or the validator refusing it — is a call for the story that
  first needs an `or`.

## Deferred from: spec-4-5-the-controls-engine-and-the-control-vocabulary (2026-09-13)

### DW-105: A28's 10 Slim is drawn locked at "None", and is built as A1·4's no-value lock

plain: One Comments design, "Slim", is drawn with its background row locked at a choice called "None". The
  owner ruled that there is no "None", so when the Comments designs are built Slim's row is locked with
  nothing marked and a sentence under it, the way the header drawn over a hero picture already is.
status: open
severity: low
origin: Story 4.5 Create (2026-09-13) — R-103, re-checked across every category the same day.
owner: A28's category story that builds 10 Slim — Story 10.95 (A28 — designs #8–10, owner gate).
location: A28-10 Slim.dc.html:132 (the row drawn "None 🔒 Locked") · A28 Comments - Spec.md:1253-1276
  (Question 2, the "None: show whatever is behind" premise) · A1-4 Overlay.dc.html:86 (the shape to build)
reason: R-103 keeps Background role at its five roles, so Slim's `design.json` narrows `bg` to `"values": []`
  with its own sentence and its root carries no `data-bg` — `docs/section-authoring.md` § Controls, "The
  no-value lock". The frame stays as drawn (R-74); the category story builds from the ruling, and must not
  lock at Base either, which the first answer to Question 1 proposed and the re-check overturned.

### DW-106: an authored date is printed as its stored YYYY-MM-DD, and no story formats it

plain: A date a customer picks — "next issue on 1 October" — shows on the page as 2026-10-01, the way it
  is stored. Writing it out as a person would read it, in the site's language, is not built yet.
status: open
severity: low
origin: Story 4.5 Create (2026-09-13) — Design Notes, "A date is the site's wall-clock day, stored unconverted".
owner: the first story that prints a written-out authored date — A2's Story 9.6 (6 Countdown, whose
  `countdown` module reads the Date Picker's value, `prd.md:952`), unless an Epic 7 compiler story reaches
  a formatted authored date first.
location: packages/section-runtime/src/core.ts `applyProps` (a `date` prop prints unconverted) ·
  packages/library/src/vocabulary.ts `isIsoDate`
reason: a formatted, localised display needs the site's locale and Ghost's timezone handling; the core is
  pure (AD-1: no clock, no `Intl`, no locale method), so neither can be read from a machine and both must
  be handed in. Inventing a format here would be a second date rule beside Ghost's `{{date}}`, whose own
  canvas/site timezone gap is DW-98.

### DW-107: Image focus has no owning story and no emission rule under AD-3

plain: For designs that crop a photograph, the panel is drawn with a "focus" setting that chooses which
  part of the picture survives the crop. No planned story builds it, and the architecture does not say
  how the choice reaches the page.
status: open
severity: medium
origin: Story 4.5 Create (2026-09-13) — the controls sample's absent note uses P0-9's own sentence, which
  made the gap visible.
owner: unowned — needs one. No story in Epic 5 or Epic 8 (Asset Library) names focus; the architecture
  must decide the emission first, then the first category story with a cropping design (A13, per R-51's
  ⬜) cannot build its panel without it.
location: prd.md Appendix C, Image Picker row (both axes, R-51) · reconcile-designs-decisions.md R-51
  (`:1010`, ⬜ A13 and every cropping design) · P0 Editor Primitives - Spec.md:748-755 (P0·9's
  never-offered case) · ARCHITECTURE-SPINE.md AD-3
reason: R-51 gives focus two axes (Centre · Top · Bottom and Centre · Left · Right) and says "Ghost never
  sees this — it is a hint the compiler resolves". But it is a per-IMAGE value, not a closed per-section
  control: AD-3 writes one attribute per control on the section root, and AD-3's only inline-style
  carve-out is bound Ghost data, so neither says how a focus chosen for one picture in a list becomes an
  `object-position` on that picture. `epics.md` has no story naming it. Story 4.5 builds only the absent
  note (`absent` in `design.json`).

### DW-108: Tabler's licence file and the icon budget have no Epic 7 story

plain: The icon set's licence has to travel with every theme that uses one of its icons, and the extra
  size of drawing icons inline has to be counted against the theme's size limit. The licence text is in
  the library today, but no compiler story copies it into the theme or counts the icons.
status: open
severity: medium
origin: Story 4.5 Dev (2026-09-13) — vendoring the whole set under R-104.
owner: Epic 7 — Story 7.4 (Assets, fonts, per-design CSS and the dead-code strip, FR-J3's budget) is the
  nearest home; its acceptance criteria name neither.
location: packages/library/icons/LICENSE-tabler.txt · packages/library/src/icons.ts `TABLER_LICENSE` ·
  prd.md Appendix C, Icon Picker row ("the licence text ships in the emitted theme"; "that cost is measured
  against FR-J's budget") · reconcile-designs-decisions.md R-26 · epics.md Story 7.4
reason: R-26 rules the licence text ships in the theme and the inline cost is measured against FR-J3's
  budget, and MIT requires the notice in copies. Story 4.5 put the licence verbatim beside the set and
  exported it, and the runtime draws each icon inline; the emitted theme is the compiler's, and no Epic 7
  story carries either obligation, so a theme could ship Tabler drawings without the notice.

### DW-109: the callout card's panel has a "Background role" of its own with different values

plain: The settings for Ghost's callout box use the same name, "Background role", as every section's
  background row, but offer different choices (including "Tint"). One name meaning two different lists
  breaks a rule the owner already made.
status: open
severity: medium
origin: Story 4.5 Create (2026-09-13) — writing the universal Background role once for the whole library.
owner: the card-panels story — Story 7.13 (The Ghost card design module and `cards.css`, FR-Q7).
location: P0 Editor Primitives - Spec.md:586 (Callout: "Background role (Base · Surface · Tint · Accent)") ·
  packages/library/src/vocabulary.ts `UNIVERSALS` (`bg`: Base · Surface · Accent · Contrast · Image) ·
  reconcile-designs-decisions.md R-53
reason: R-53 — one control name means one set of values, library-wide. The section universal is five roles
  (R-103); the callout panel's row is four values, one of them (Tint) not a section role. Either the card
  row is renamed (it is a card treatment, not a section's ground) or its values are the section's — a call
  for the story that builds the card panels, which must not ship both under one name.

### DW-110: A1·4 needs to know whether the section below carries a picture, and adjacency asks only about above

plain: The header design that sits transparently over a hero picture has to know, when the theme is built,
  whether the section under it actually has a picture. The list of questions a design may ask about its
  neighbours only covers the section above it.
status: open
severity: medium
origin: Story 4.5 Create (2026-09-13) — the R-103 sweep through A1·4.
owner: A1's category story that builds 4 Overlay — Story 9.1 (A1 — the content model, the stylesheet and
  designs #1–4).
location: A1 Headers - Spec.md:183 ("A1·4 must know whether the section below it has a loadable image") and
  `:353` (decided at build from what is placed below) · packages/library/src/vocabulary.ts `ADJACENCY_NEEDS`
  (`section-above`, `image-above`, …) · ARCHITECTURE-SPINE.md AD-37 · reconcile-designs-decisions.md R-8
reason: AD-37 and R-8 make adjacency a compile-time input answered from the placement list, never a render-time
  probe, and `data-needs` takes only `ADJACENCY_NEEDS`. A1·4's precondition is about the section BELOW; the
  vocabulary has `image-above` and no below-facing question. Adding one is a vocabulary change (a new
  `ADJACENCY_NEEDS` value, AD-37's compiler answering it), which is the category story's to make or refuse.

### DW-111: category spec tables list the universal row open where the drawn panel locks it

plain: In some category write-ups, the table of settings shows a design's background row as freely
  choosable, while the drawing of that same design shows it locked. The drawing is right.
status: open
severity: medium
origin: Story 4.5 Create (2026-09-13) — the R-103 sweep, by descriptor tuple and by text, across every
  category's spec and drawn panel.
owner: every category story from Epic 9 onward — each builds its `universals` narrowing from the drawn
  panel, not the spec table.
location: A22 Newsletter - Spec.md:1271 (A22·14's table: "Background role (universal) | Background ·
  Surface · Contrast") against A22-14 Slide-in Card.dc.html:67 (drawn "None — the card is its own plane 🔒
  Locked"); the same disagreement found in A19, A22, A24, A25 and A31
reason: R-74 makes the export the design authority, and the drawn panel is its most specific statement of
  a design's controls; a spec table written earlier in the same session can lag it. A category story that
  copied the table would offer a row the design is drawn to lock — for a see-through design, a ground that
  paints over what is behind (R-103). The export is never edited, so the rule lives with the stories.

### DW-112: the Data group's Order is Newest · Oldest over posts only, and an undeclared limit shows Ghost's default

plain: For a list of posts, the panel offers "how many" and "newest or oldest first". Any other kind of list,
  or any other declared order, gets no order setting yet, and a list whose design never set a number shows
  Ghost's own default number.
status: open
severity: low
origin: Story 4.5 Dev (2026-09-13).
owner: Story 5.19 (The Data group and the main-feed designation) — the full Source vocabulary.
location: packages/section-runtime/src/controls.ts `orderWord` and `dataRows` (the `ponytail:` comment)
reason: P0-3's Ghost-sourced card draws Count and Order; Story 4.5 built exactly those two, and only where
  they can be expressed without inventing Source's vocabulary: Order maps to `published_at desc`/`asc` on a
  `posts` query whose declared order is absent or one of those two, and a query over tags, authors or tiers,
  or with any other order, offers no Order row. A query with no declared `limit` shows the Count at
  `orbitWeekly.DEFAULT_LIMIT` for its source — Ghost's recorded default — which is right for the preview and
  unstated for the panel. Source, hand-picked and the main feed are 5.19's by the spec's own Ask First.
  Found at Review (2026-09-13): that default lives in the Orbit Weekly fixture module, so the engine — and
  through it Epic 7's compiler — reads a Ghost fact from fixture code rather than from the vocabulary or the
  shim; 5.19 moves it beside the Source vocabulary when it builds the full Data group.

### DW-113: importing the vendored icon set makes TypeScript infer a type for all of it

plain: Checking the code for mistakes got several times slower after the full icon set was added, because
  the checker reads the whole icon file to work out its shape. Nothing is broken; it is slower and uses more
  memory, and there is a known fix if it starts to matter.
status: open
severity: low
origin: Story 4.5 Dev (2026-09-13) — measured: the library's typecheck rose from about 0.6 s to about
  2.2 s and about 690 MB; a `tabler.d.json.ts` declaration with `allowArbitraryExtensions` measured at
  about 0.09 s.
owner: the first story where typecheck time or CI memory matters — Epic 7's compiler, which imports
  `@inflozo/library/icons`, at the latest.
location: packages/library/src/icons.ts (`import tabler from '../icons/tabler.json'`) ·
  packages/library/tsconfig.json (`resolveJsonModule`, `icons` in `include`)
reason: every package importing `@inflozo/library/icons` pays the inference. A declaration file beside the
  JSON gives TypeScript the shape without reading the data; not done in Story 4.5 because the cost is
  seconds on one package and `icons.test.ts` already walks every node against the shape the declaration
  would assert.

### DW-114: the owner wants the editor's Controls sidebar to collapse, and S4a draws no collapse at full width

plain: On the controls review page the owner asked for the settings panel to sit against the right edge
  like the left menu, and to fold away with a button. The review page now does both. The editor's own
  panel is built in Story 5.1, and the drawing it is built from has no fold-away button at full width.
status: done 2026-09-17 (Story 5.1)
resolution: Story 5.1 (2026-09-17) — the editor at `/projects/{id}` folds both panels the `/controls` way: Layers to D8's
  44px "Show layers" rail, and Controls to the same rail mirrored ("Show controls"), focus moving to the counterpart toggle
  (`apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`, `useFold`). Recorded in the spec's Design Notes as an
  extrapolation from D8 and `/controls` (R-74); executed by `tools/probe/run-verify-editor.cjs` step 5. The overlay below
  1440 stays Story 5.22's.
severity: low
origin: Story 4.5 owner's test (2026-09-13) — finding 3, on `https://app.inflozo.com/controls`.
owner: Story 5.1 (The editor shell, the canvas boundary and the URL scheme) — the right Controls sidebar;
  Story 5.22 owns its overlay below 1440.
location: `S4 Editor.dc.html:337` (S4c's Controls sidebar: 280 wide, flush right, border-left, no collapse)
  · `D8 Editor Below 1440.dc.html:128`, `:240` ("Close controls" on the overlay) and `:194` (the Layers
  rail's "Show layers") · `apps/web/app/(app)/app/(authed)/controls/review.tsx` (the review page's docked,
  collapsible panel, built from D8's rail mirrored)
reason: Story 5.1's acceptance criteria give a "collapsible left Layers panel" and a right Controls sidebar
  that "matches frame S4a", and the frames draw a collapse only for Layers at every width and a close only
  for the Controls overlay below 1440. The owner's finding asks for a Controls collapse at full width too.
  Story 5.1 must either build it the review page's way (a 44 px rail with one "Show controls" button, focus
  moving between the two toggles) or put the choice to the owner in R-83 shape — not silently drop it. The
  same finding's canvas half carries over: the review page's canvas scrolled 2 px on its own and held the
  page still, and 5.1's canvas, which "keeps its own scroll" (Story 5.22), must have exactly one scroller
  under the wheel. The owner's two later findings the same day settle how: the review page is now S4's
  workspace — a window that never scrolls, a canvas that scrolls inside its own frame, a panel that scrolls on
  its own — with slim 8 px `::-webkit-scrollbar` bars and no arrow buttons, because two scrollbars side by side
  "looks really bad" and a canvas sized to its section left a scrollbar with nothing to scroll.

### DW-115: clicking an icon on the canvas to open the icon picker belongs to no story

plain: In the editor, clicking an icon on the page itself should open the icon picker, and a section that is
  selected should show a dashed box where an icon can go. The picker exists since Story 4.5, but it opens only
  from the settings panel, and no planned story makes it open from the page.
status: open
severity: medium
origin: Story 4.5 owner's question (2026-09-13) — "we are yet to build the icon picker on click of icons on
  canvas … I assume these are part of later stories?" Checked against `epics.md`: selection and click-to-edit
  text are Story 5.2's, inline editing, the four-mark toolbar and the link picker Story 5.3's; the icon slot
  appears in neither, nor anywhere else.
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1–4) — moved there from Story 5.3 by the owner's
  ruling R-121 (2026-09-17), because none of the pilot sections carries an icon to click and Story 9.1's designs are the
  first whose buttons carry one (A1·11 Side Rail's row icons follow in 9.3). The owner first ruled it into Story 5.3 on
  2026-09-13, over Story 5.2. The criterion is in `epics.md` Story 9.1, beside the button icons the same ruling put there,
  so this entry closes when that story is done.
location: `P0-2 Icon Slot and Picker.dc.html` · `P0 Editor Primitives - Spec.md:220-224` (a slot is filled or
  empty — a dashed 20 px placeholder visible only while the section is selected; the picker "opens from any
  slot click (either state)") · `apps/web/components/controls/icon-picker.tsx` (the picker, opened today only
  from its field in the panel) · `epics.md` Stories 5.2 and 5.3
reason: FR-F1's Icon Picker is built (Story 4.5) and every design's icon prop edits through the sidebar, so
  nothing is blocked; but P0-2 draws the canvas slot as the picker's primary entry, and a behaviour drawn in the
  export with no story is exactly how a surface goes missing at launch. The story that takes it adds one
  acceptance criterion — "clicking an icon slot on the canvas, filled or empty, opens the Icon Picker anchored
  to it; the empty slot shows only while its section is selected" — and mounts the existing component.

### DW-116: every other draggable list must show the dashed landing slot the item list now shows

plain: When you drag a feature to a new place in the settings panel, a dashed empty box now shows where it will
  land. The owner asked for the same on every list that can be dragged — the Layers panel and a hand-picked list
  of posts — and those lists are built in later stories.
status: open
severity: low
origin: Story 4.5 owner's test (2026-09-13) — finding 9: "it should show a dotted empty space when being moved
  … Same behaviour will other editable lists too."
owner: Story 5.4 (The Layers panel, reordering, and the two kinds of singleton — its Layers rows and, since R-118,
  the canvas pill's section drag handle wherever it reorders sections) and Story 5.19 (The Data group and the
  main-feed designation — the hand-picked post list).
location: EXPERIENCE.md § State Patterns, "Reordering by drag" · `apps/web/components/controls/item-list.tsx`
  (the pattern: rows translated rather than moved in the DOM, so the handle keeps its pointer capture and focus;
  the slot read against the rows' positions as the drag began) · `epics.md` Stories 5.4 and 5.19
reason: the rule now lives in EXPERIENCE.md, which every UI story reads, but neither story's acceptance criteria
  name the slot, and a list built without it is exactly the finding the owner just had to raise. Each adds one
  criterion — "while a row is dragged, a dashed empty slot the size of the row shows where it will land" — and
  lifts the item list's drag rather than inventing a second one.

## Deferred from: code review of spec-4-5-the-controls-engine-and-the-control-vocabulary (2026-09-13)

### DW-117: the controls frame route's sign-in guard is proved by reading its source, not by calling it

plain: The test that says "the picture frame refuses a signed-out visitor" checks that the right words appear in
  the file in the right order, not that a visitor is actually turned away. The deployed check does turn one
  away, but only when someone runs it by hand.
status: open
severity: low
origin: Story 4.5 code review (2026-09-13) — Verification Gap
owner: the story that next touches a frame route (Story 5.1's editor surface is the nearest)
note: Story 5.1 (2026-09-17) moved the pilots frame route to the one canvas route, `(authed)/canvas/route.ts`, with the same
  guard shape, and did NOT close this: `next/server` still cannot load under `node --test`, so `pilots.test.ts` still reads
  the guard as text. `tools/probe/run-verify-editor.cjs` step 6 executes the signed-out 303 on `/canvas` against the
  deployed app, which is the executed half this entry asks for, run by hand at each Review.
location: apps/web/controls.test.ts (the source-text test) · apps/web/app/(app)/app/(authed)/controls/frame/route.ts · tools/probe/run-verify-controls.cjs (the executed 303)
reason: Story 4.4's `style-guide.test.ts` set the shape and 4.5 copied it; a route handler imports the server
  Supabase client, so calling it under `node --test` needs that module stubbed. The 303 is executed on
  production by the committed harness at every Review, which is the control the text test lacks.

### DW-118: one "curated Tabler set" survives in the design-patch prompt record

plain: One old sentence about a hand-picked icon set is still in the file that holds the prompts sent to Claude
  Design in August. It was left because that file records what was sent then, and rewriting it would change
  the record.
status: open
severity: low
origin: Story 4.5 code review (2026-09-13) — Acceptance Auditor
owner: nobody yet — a note beside the line, or a "superseded by R-104" footer in the generated page, when the prompts page is next regenerated for another reason
location: tools/design-patch-prompts.py:522 (generates DESIGN-PATCH-PROMPTS.html)
reason: the file is catalogued as `tool`, so it is editable, but its content is the prompt executed at step 3
  on 2026-08-25 and the drawn export was made from it. R-104 (2026-09-13) widened the set afterwards and is
  recorded in the PRD, DESIGN.md and the ledger; the prompt text is history, not a live claim.

### DW-119: the stress archetypes never exercise the validator's root-control-value check

plain: The checker can refuse a section whose root carries a setting value the design does not offer, and that
  refusal is tested on small made-up examples. The larger stress set of sections still passes only names, so
  the check has never run over a real design folder.
status: done 2026-09-15 (Story 4.10)
resolution: Story 4.10 (2026-09-15): the five pilots are the first real design directories, and `tools/check-snapshots.mjs`
  validates each through `validateDesign` — which hands `validateMarkup` every control's offered values, universals
  narrowed — before it renders anything, on every `pnpm test`. The stress archetypes still pass names only, on
  purpose (they predate controls); real designs are where the value check now runs.
severity: low
origin: Story 4.5 code review (2026-09-13) — Blind Hunter
owner: Story 4.10 (the five pilots) — the first real design directories the stress harness can walk with values
location: tools/stress/test-vocabulary.mjs · packages/library/src/validate.ts (`controlValues`)
reason: `validateMarkup`'s `controlValues` is optional precisely so the archetypes, which predate controls,
  keep validating by name; `validateDesign` does pass values, so the controls sample and the reference fixture
  are held to it through `apps/web/controls.test.ts` and `test-vocabulary.mjs` — the archetype set is the gap,
  and no category design exists yet to pass values for.

### DW-120: an `a` mark with no valid destination is emitted as a bare anchor, while the url prop sink hides its element

plain: If a link inside a paragraph points nowhere valid, the text is still wrapped in a link tag with no address;
  if a link field points nowhere valid, its whole row is hidden. Neither can do harm, but the two read the same
  broken record differently.
status: done 2026-09-18 (Story 5.3)
resolution: Story 5.3 (2026-09-18) — `serializeMarks` now DROPS an `a` mark whose record names no destination and keeps
  its words, on both emitters, so the two sinks read a broken record the same way: the `url` prop hides its element
  (FR-F8) and the mark leaves no anchor. `openTag`'s bare-`<a>` branch is gone, and the filter that drops the mark runs
  before the boundary sweep, so no closing tag can disagree. `marks.test.ts` asserts it on the canvas and the theme,
  beside the legitimate case (a record that does name a destination still writes its anchor).
severity: low
origin: Story 4.5 code review (2026-09-13) — Verification Gap
owner: Story 5.3 (the inline toolbar, which is the only producer of `a` marks)
location: packages/section-runtime/src/marks.ts `openTag` · packages/section-runtime/src/core.ts `applyProps` (`data-prop-attr` href)
reason: dropping the anchor from `openTag` means `closeTag` must agree, and FR-F8's hide rule is about an
  element, not a run of text; the choice of what an unset inline link looks like belongs to the story that
  lets a customer make one.

### DW-121: no test renders the on-disk controls sample through both emitters

plain: The sample section the review page shows is checked for validity by a test, but no test draws it the way
  the page does; the engine's tests draw a hand-typed copy of it instead.
status: done 2026-09-15 (Story 4.10)
resolution: Story 4.10 (2026-09-15): `tools/check-snapshots.mjs` renders the on-disk controls sample
  (`packages/library/fixtures/controls/`) through both emitters at each of its `compileTarget`s, with its asset and its
  query's rows, on every `pnpm test`. The entry named "Story 4.10 (the render matrix)"; the matrix is Story 4.11's,
  and the substance — the on-disk sample drawn the way the page draws it — closes here. It lives in `tools/`, where
  jsdom is reachable without adding a dependency to `apps/web`.
severity: low
origin: Story 4.5 code review (2026-09-13) — Blind Hunter
owner: Story 4.10 (the render matrix) — the harness that renders every fixture on both emitters is its deliverable
location: packages/section-runtime/src/controls.test.ts (`HTML`) · apps/web/controls.test.ts · packages/library/fixtures/controls/1/index.html
reason: rendering needs a DOM; `jsdom` is a dependency of `packages/section-runtime` and not of `apps/web`, and
  the spec's Ask First reserves any new dependency. The deployed harness renders the on-disk sample on every
  Review run.

## Deferred from: Story 4.6 — context-aware binding and empty-value guards (2026-09-14)

### DW-122: no story offers moving or duplicating a section onto another template, or its re-point and revert step

plain: The rule "moving a section to another kind of page must check its Ghost information first" now has
  its check, but no planned screen lets anyone move or copy a section to another kind of page, so nothing
  calls the check yet.
status: open
severity: medium
origin: Story 4.6 Create (2026-09-13) — the story's own acceptance criterion is the only place epics.md names it
owner: unowned — needs one. Epic 5 (the Layers panel, Story 5.4, or the template switcher, Story 5.5) is the nearest.
location: packages/section-runtime/src/core.ts `checkBindings` · appendix-b1-template-contexts.md §1 *Re-validation* · prd.md FR-H7
reason: FR-H7 says a move or duplicate re-validates every binding and the user re-points or reverts each
  unavailable one before the move completes. `checkBindings(doc, src, { target })` returns exactly that list
  with a reason per binding, and `offerBindings` answers what may replace each — but the action, the surface
  that lists the refusals, and the re-point / revert-to-static step belong to no story.

### DW-123: A1's and P0·2's "the site's social accounts arrived in 6.38.0" against Ghost's source at 6.36.0

plain: The design notes say the site's extra social links arrived in Ghost 6.38, but Ghost's own code has
  them from 6.36. A header built on the notes would hide those links on sites that could show them.
status: open
severity: low
origin: Story 4.6 (2026-09-14) — Ghost's source read at 6.35.0, 6.36.0 and 6.38.0 (MEASUREMENTS §41e)
owner: A1's category story (Headers & Navigation), which decides when its social rows show
location: design export `A1 Headers - Spec.md:116`, `:1037`, `:1088` · `P0 Editor Primitives - Spec.md:262-272` (R-74: never edited) · packages/library/contexts/matrix.json
reason: `public.js` and `default-settings.json` add the site's social `@site` keys at 6.36.0, unchanged through
  6.38.0; the export's 6.38.0 comes from release notes and matches the `{{#social_accounts}}` block helper,
  which IS 6.38.0 and is a gscan error below it. Both are true of different things: the matrix offers the
  keys from 6.36.0, and A1 decides whether its rows read the keys or the helper, knowing both.

### DW-124: `count.posts` needs a `{{#get}}` include that `DataBinding` cannot express

plain: A design that shows "12 posts" beside a tag or a writer cannot be built yet, because the way a design
  asks Ghost for posts has no switch for "and count them".
status: open
severity: medium
origin: Story 4.6 (2026-09-14) — left out of the matrix on purpose
owner: the first category story that shows a post count (A29 tag cards or A21 author showcases)
location: packages/library/src/registry.ts `DataBinding` · packages/ghost-shim/src/index.ts `getExprs` · packages/library/contexts/matrix.json
reason: appendix B.1 §4.3/§4.4: a tag's or author's post count exists only through
  `{{#get "tags" include="count.posts"}}`. `DataBinding` declares source, filter, limit, order and ids — no
  include — so a `count.posts` binding could only ever print empty, and the matrix does not offer it.

### DW-125: the stress harness's `navigation` and `tiers` repeats print nothing on a real Ghost, and a target-naming render refuses both

plain: The big test theme that proves Ghost accepts our output contains two lists that would be empty on a
  real site. The new check catches them, but that test does not run the check yet.
status: open
severity: low
origin: Story 4.6 Create (2026-09-13)
owner: Story 7.35 (the E4/E7 joint compile gate) — the harness becomes the compiler's, which names its targets
location: tools/stress/sections.js:37 (`data-repeat="navigation"`) and :115 (`data-repeat="tiers"`) · tools/stress/compile.js (renders with no target)
reason: Ghost's key is `@site.navigation`, and tiers exist only through `{{#get}}` (appendix §5). The harness
  renders every archetype with no `target`, so gscan still passes 0/0 — gscan never checks scope. Naming a
  target in `compile.js` would refuse both archetypes today; fixing the archetypes changes the measured
  AD-11 fixture, which is the joint gate's to re-baseline.

### DW-126: the routes.yaml route form of `custom-{name}.hbs` has no row in the matrix

plain: A custom page reached through a site's route settings gets its Ghost information differently from one
  picked in Ghost Admin, and the new rules only know the second kind.
status: open
severity: medium
origin: Story 4.6 (2026-09-14) — appendix B.1 §3's route row, out of this story's scope
owner: Story 7.16 (the Routes Manager, FR-I2)
location: packages/library/contexts/matrix.json `targets["custom-{name}.hbs"]` · appendix-b1-template-contexts.md §3
reason: the matrix's one `custom-{name}.hbs` row is the ENTRY form (post block). The route form's root is flat
  and carries exactly the `data:` keys the route declares, where `{{#page}}` is the only form — so its row
  depends on the route Inflozo authored and cannot be a static row.

### DW-127: `private.hbs`, every Ghost version below the two servers, and the seeded servers' empty fields are unexecuted

plain: Some of the new rules are read from Ghost's code or its notes rather than seen on a live site: the
  password page, very old Ghost versions, and details the test sites simply do not have filled in.
status: open
severity: low
origin: Story 4.6 (2026-09-14) — MEASUREMENTS §41f
owner: the story that next runs `python3 tools/probe/record-contexts.py` with seeded content (A21's and A29's category stories need the author and tag fields)
location: packages/library/contexts/matrix.json (every `unverified`) · tools/probe/record-contexts.py
reason: `private.hbs` needs private mode and `errorDetails` a theme validation error, neither of which the
  recorder may cause. Versions below 5.130.6 were read in source for `@site` only; P0·2 dates the author social
  handles to 5.118.0 and nothing recorded confirms it, so the matrix gates no resource field by version.
  Fields empty on both seeded servers are `unverified` with that reason — seeding them is a content write the
  story's Ask First reserved.

### DW-128: the canvas shows "1 min read" on a post the visitor may not read, where Ghost prints nothing

plain: For a paid post in a feed, the editor would show a reading time that a signed-out visitor never sees
  on the real site.
status: open
severity: low
origin: Story 4.6 (2026-09-14) — recorded on both majors (MEASUREMENTS §41d)
owner: **Story 5.20** (the Paywall editor), the first canvas that draws a gated body — moved there from Story 5.14 by that
  story's planning (2026-09-21, recorded at its Dev). Story 5.14 gives the canvas its visitor, but no canvas draws a body
  yet (no Post Content design exists and `renderSection` passes no fixtures), and working out what a visitor may read is
  Ghost's `checkPostAccess` (`members/content-gating.js`) — the same value 5.20's "Gated content — shown with sample
  text" indicator needs. So the indicator, `access` per visitor and this reading time land together, with the surface
  that makes them true (R-118). The criterion is in `epics.md` Story 5.20.
location: packages/section-runtime/src/core.ts `bindValue` (bare `reading_time`) · packages/ghost-shim/src/index.ts `readingTime`
reason: Ghost's `{{reading_time}}` counts the post's body and prints nothing when the body is withheld; the
  number guard (`includeZero=true`) is true because the field is 0, so the element keeps its place with no
  text. The shim has no `access` input. The site's behaviour is right; the canvas needs the preview state.

### DW-129: `@site.codeinjection_head` and `codeinjection_foot` are offered as text bindings

plain: Two site settings that hold raw code are on the list of things a design could print as words. Nobody
  would want that, but no ruling says to hide them.
status: open
severity: low
origin: Story 4.6 (2026-09-14) — the universal set transcribed as `public.js` less appendix §6's never-offer list
owner: Story 5.19 or whichever Epic 5 story first draws the binding picker (it consumes `offerBindings`)
location: packages/library/contexts/matrix.json `universal` · appendix-b1-template-contexts.md §6
reason: the appendix's never-offer list does not name them, so the matrix offers them rather than inventing a
  refusal (flag, do not guess). A printed binding escapes the HTML, so nothing unsafe reaches a page; it is an
  offer nobody should see. Adding both to `neverOffer` is one line once the owner rules.

## Deferred from: code review of spec-4-6-context-aware-binding-and-empty-value-guards (2026-09-14)

### DW-130: no gate runs `checkBindings` over a shipped design's own `compileTarget` list

plain: A design says which kinds of page it may be placed on. Nothing yet checks, before the design ships,
  that every piece of Ghost information it shows exists on every one of those pages — the check only runs
  when a page is actually being built.
status: done 2026-09-15 (Story 4.10)
resolution: Story 4.10 (2026-09-15): `tools/check-snapshots.mjs`, last in `pnpm test`, runs
  `checkBindings(doc, markup, { target, dataBindings })` for every design directory at every `compileTarget` and fails
  on anything but `[]`; its control adds a `title` binding to A1 #1 and requires the refusal at `default.hbs`. The
  list is the directory, so every category design from Epic 9 onward is held by the same line.
severity: medium
origin: Story 4.6 review (2026-09-14) — the Blind Hunter ran `checkBindings` over the reference design for its four declared targets and found refusals on each; that fixture is lexical (it carries directives no render accepts yet) so it is not the case, but a real design would be
owner: Story 4.10 (the five pilots) — the first designs that render; then every category gate from Epic 9
location: packages/section-runtime/src/core.ts `checkBindings` · packages/library/src/validate.ts `validateDesign` · packages/library/fixtures/reference-design/design.json `compileTarget`
reason: `validateDesign` is lexical and lives below the runtime (the library cannot import `section-runtime`),
  so the per-target proof is a test in `section-runtime` over the library's designs: for each design, for each
  `compileTarget`, `checkBindings(doc, markup, { target, dataBindings })` is `[]`. One assertion, derived from the
  design list, never a count.

### DW-131: the scope walk's directive coverage is written by hand, not derived from the vocabulary

plain: The list of markup attributes the new check reads is typed out in the code. When a new attribute that
  carries Ghost information arrives, nothing forces the check to read it too.
status: done 2026-09-15 (Story 4.10)
resolution: Story 4.10 (2026-09-15): `Directive.ghostPath` flags every directive whose value names a Ghost path
  (`data-if` and `data-text` included), `core.ts` exports `WALKED_GHOST_PATH_DIRECTIVES`, and
  `section-runtime/src/contexts.test.ts` fails if a flagged directive is not walked, then fires one misspelt path per
  rendered flagged directive through `checkBindings`.
severity: low
origin: Story 4.6 review (2026-09-14) — `data-pagination` was missing from the walk and is now in it; the review test covers every attribute that carries a Ghost path today
owner: the story that next adds a Ghost-path directive (`data-if`/`data-else`, `data-members`, `data-text` — FR-H's later stories), which must add it to `ghostPaths` and to the review test
location: packages/section-runtime/src/core.ts `ghostPaths` · packages/library/src/vocabulary.ts `DIRECTIVES`
reason: the vocabulary's directive table does not say which directives carry a Ghost path, so the walk cannot
  derive its list from it; adding a `ghostPath` flag to `Directive` and asserting `RENDERED_DIRECTIVES ∩ flagged
  ⊆ walked` is the fix, and it belongs with the first directive that would otherwise be missed.

### DW-132: the first commit of a new day fails CI's documentation gate, so its push publishes nothing

plain: The planning pages carry "generated on <date>". That date is taken from the last commit, so when the
  day changes, the pages the computer checked before the commit and the pages CI rebuilds after it carry
  different dates, CI calls them stale, and that push never reaches the live site. The next push of the day
  passes. Story 4.6's Dev push was one of these: its code went live only with the Review push.
status: open
severity: high
origin: Story 4.6 review (2026-09-14) — executed: run 34823025267 (the Dev push, 08:29 UTC) failed `check` with `STALE — regenerated INDEX.md and INDEX.html`, `STALE: BUILD-BOARD.html`, `STALE: CATEGORY-PROMPTS.html`; `deploy` skipped. The Review commit's own diff of those files is `updated: 2026-09-13 → 2026-09-14` and nothing else; run 34825820806 (the Review push) passed and deployed.
owner: unowned — needs one. A tooling story, or the next story whose first push of a day fails.
location: tools/doc-audit.py `generate()` (`git log -1 --format=%cs`) · tools/build-board.py:329 · tools/category-prompts.py:382 · tools/story-board.py:1624 · tools/hooks/pre-commit (the one retry)
reason: each generator stamps `git log -1 --format=%cs`, the date of HEAD. At pre-commit HEAD is the previous
  commit, so the hook regenerates and stages the artefacts with yesterday's date; once the commit lands HEAD
  is today, CI regenerates with today's date, and the byte comparison fails. A stamp derived from the commit
  being made cannot survive it. The fix is one rule in the four generators: "updated" means the last CONTENT
  change — compare the regenerated page with the stamp stripped, keep the on-disk date when the content is
  unchanged, and stamp the wall-clock date only when it changed. Until then: expect the first push of a day to
  skip deploy, and push once more (any commit) to publish it.

## Deferred from: spec-4-7-core-and-the-behaviour-module-registry (2026-09-14)

### DW-133: FR-D20 and Story 5.15 say reveal, tabs, accordions and sticky headers run while editing, and §7 says they do not

plain: Two documents disagree about which moving parts keep moving while you design. The list the product reads
  follows the architect's table, which pauses drop-downs, tabs, scroll reveals and shrinking headers on the
  canvas; the editing requirement says those four keep running. Nothing is visible yet, because the canvas does
  not exist — you will see whichever one is right when Story 5.15 is tested.
status: done 2026-09-22 (Story 5.15, R-174)
amendment: Story 4.10's planning (2026-09-15) found the export uses "edit-safe" in the OPPOSITE sense: `A1 Headers -
  Spec.md:185` means "does not run while editing", where `registry.json`'s `editSafe` means "runs while editing". The
  registry's values stand (they are §7's); whoever settles this at 5.15 reads the export's word with that inversion.
severity: medium
origin: Story 4.7 (2026-09-14) — spec Design Notes, "Edit-safe values are transcribed, not decided"
owner: Story 5.15 (canvas suppression, the PAUSED chip and the Preview toggle), whose owner test is where the
  canvas behaviour is seen; the owner rules if the two stay apart
location: prd.md FR-D20 · epics.md Story 5.15 · research-section-js-libraries.md §7 · packages/library/modules/registry.json
resolution: Story 5.15 (2026-09-22) — the owner ruled **R-174** at its Create (Question 1, option 1): *"Hold all four
  still while you design; Preview shows them moving."* §7 and `registry.json` were right and no `editSafe` value moved
  (`derive-module-reach.py --check` green); FR-D20's list, epics.md's FR-D20 summary and Story 5.15's card now say the
  four hold still, and the editor holds them at rest in their no-JS state because it runs `core` with
  `{ editing: true }` on the canvas (`apps/web/lib/behaviours.ts`). The export's inverted "edit-safe" (the amendment
  above) is noted where epics.md restated it (A17's `filter-strip`), and R-21's own title carries an erratum.
reason: FR-D20 and 5.15 list "sticky/shrink headers, scroll reveal, tabs, accordions" as edit-safe modules that
  run always, while §7 — the architect's pass under R-21, which says "the editor obeys the table" — marks
  `header-scroll`, `reveal`, `tabs` and `accordion` **no**. Changing either text or any edit-safe value is an
  Ask First in 4.7, so `registry.json` carries §7's values verbatim and `derive-module-reach.py --check` holds
  them there; 5.15 either confirms §7 and corrects FR-D20's list, or brings the difference to the owner.

### DW-134: an inline `<script>` in a template is code the `assets/js/` check cannot see

plain: The check that proves a site carries only Inflozo's own scripts looks in the scripts folder. A script
  written straight into a page template would never be looked at, so it could ship without anyone noticing.
status: open
severity: medium
origin: Story 4.7 (2026-09-14) — spec task "propagate"; FR-G7(1)'s assertion is over `assets/js/` by definition
owner: Story 7.5 (emitting `main.js` and `cards.js`), which assembles the theme `checkThemeJs` runs over
location: packages/library/src/modules.ts `checkThemeJs` · Story 7.5's compile gate over emitted `.hbs`
reason: `checkThemeJs` sees only files under `assets/js/`. (The DESIGN-markup form — a `<script>`, an `on*`
  handler or a `javascript:` URL authored into `index.html` — is refused by the validator as `authored-script` since
  4.7's review; this row is the TEMPLATE form, which no validator sees.) FR-G7(1) promises no third-party JavaScript anywhere
  in a generated theme, and `mode-toggle` already needs "a tiny inline head script to avoid the flash" (research
  §3.1) — a legitimate inline script with no check at all. The compile gate needs a second assertion over every
  emitted template: no `<script>` except the one `defer` tag for `main.js`, `cards.js` where designed, and any
  inline script whose bytes are repo-authored, named and compared the way `main.js` is.

### DW-135: `cards.js`'s bytes are exempt from the `assets/js/` check and compared to nothing

plain: Ghost's own card scripts are allowed through the scripts check by name. If something else were saved
  under that name, the check would still pass it.
status: open
severity: low
origin: Story 4.7 (2026-09-14) — `checkThemeJs` skips `assets/js/cards.js` wholesale
owner: Story 7.5, which emits `cards.js` from the vendored chunks
location: packages/library/src/modules.ts `checkThemeJs` · packages/library/orbit-weekly/vendor/cards/js/
reason: FR-J4 declares `cards.js` Ghost's MIT code, vendored by `tools/probe/record-cards.py` at the pinned
  version, but nothing assembles it yet, so there are no bytes to compare with. When 7.5 builds it from the
  vendored chunks, `checkThemeJs` should take those chunks as a source and refuse a `cards.js` that is not their
  concatenation — the same byte comparison `main.js` already gets.

## Deferred from: code review of spec-4-7-core-and-the-behaviour-module-registry (2026-09-14)

### DW-136: the canvas has no road to `core` — no `{ editing: true }` call and no error hook

plain: The editing screen will need to start the same little script the live site runs, but tell it "we are
  editing, so keep the non-edit-safe parts still", and it will need somewhere to send a module's error other than
  the browser console. Neither door exists yet; the script works only as a live site loads it today.
status: done 2026-09-22 (Story 5.15)
resolution: Story 5.15 (2026-09-22) — the editor IMPORTS `core` and runs it from its own bundle against the canvas
  window on every paint (`apps/web/lib/behaviours.ts` `startBehaviours`, the one call): `{ editing: true }` while
  designing and none in Preview, `stop()` before each repaint and on unmount, and the handle's new `paused` — the
  mounts the editing rule held still — feeding the PAUSED chip. (b) is `options.report`, which receives every error in
  place of the timer's throw; the editor logs it with the module's name and never says it. This entry's "likely shape",
  a canvas-side wrapper evaluating `bundle`'s strings, could not run: the canvas carries no script and no nonce, and the
  policy refuses `eval` — executed in Chromium 149 at the story's Dev (`eval` called from the parent realm on a child
  window carrying this policy threw `EvalError`, reported by the child, while `core` run the same way raised zero
  violations), and executed on production by `run-verify-editor.cjs` steps 5 and 91 — at Dev against `1e147c74` and
  again at Review against `61290c1b` (MEASUREMENTS §47), zero violations both times. So `core.js` is now
  one EXPORTED declaration and `bundle()` removes the keyword as it pastes it into the classic `main.js`
  (`packages/library/src/modules.ts`, held byte for byte by `modules/core.test.mjs`).
severity: medium
origin: Story 4.7's review (2026-09-14) — Blind Hunter: `bundle` seals `core` inside one wrapping function and calls
  `core(window, [])` with no options, and a thrown module error is re-thrown from a `setTimeout`, which a Next window
  would see as an uncaught exception in the editor
owner: Story 5.15 (behaviours off while designing, the PAUSED chip and the Preview toggle), the first caller
location: packages/library/src/modules.ts `bundle` · packages/library/modules/core.js `report` · Story 5.15's canvas
reason: 4.7's Never bars canvas suppression, so the theme path was built alone; the canvas will not load `main.js` as a
  theme does but evaluate `core` and the placed designs' modules itself, and it needs (a) a way to hand `{ editing: true }`
  and read `stop()` — the sources are already pure strings, so a canvas-side wrapper over `bundle`'s pieces is the likely
  shape — and (b) an `options.report` (or similar) so a module's throw reaches the editor's own error surface rather than
  `window.onerror`. Both are one decision for 5.15, taken once; `core`'s signature is `(win, modules, options)` so an
  option is additive.

### DW-137: no tool checks HTML against the floor — a Tier-2 attribute is dated, and a Tier-3 one is never refused

plain: The new browser checks read stylesheets and scripts. Nothing reads a design's HTML, so if a design used an
  attribute that the oldest supported browsers do not understand, nothing would stop it. The two newer HTML touches
  already on the allowed list — one-at-a-time accordions and a loading-priority hint — are tracked for their dates,
  but nothing checks where they are used.
status: open
severity: medium
origin: Story 4.8's Dev run (2026-09-14) — `packages/library/baseline.json` carries `details-name` and
  `fetch-priority` as `html` entries, and `tools/check-baseline.mjs` recomputes their Widely dates; stylelint and
  eslint-plugin-compat read no markup
owner: Story 7.8 (the emitted-theme quality gate — FR-J17 already asserts valid HTML over every compiled theme)
location: packages/library/baseline.json `tier2[].html` · tools/check-baseline.mjs · Story 7.8's gate
reason: 4.8's Never bars the HTML Baseline check. The data is ready for it: an `html` entry names its element and
  attribute, so the gate can refuse any element or attribute below Widely on the pin that `baseline.json` does not
  name, and hold a named one to Tier 2's conditions (a `<details name>` group still opens every panel without it).
  Reach today, by grep of the export (the review, 2026-09-14): `fetchpriority="high"` 3 times, `<details name>` none —
  measured by grep each time, never a stored count.

### DW-138: the render matrix does not refuse a pin it did not run against

plain: Moving the browser-floor date is meant to come with a fresh run of every visual test, because a later date
  lets designs use newer styling. Today that is a rule people follow, not something the build checks: the date could
  move and the visual tests could still be the ones taken under the old date.
status: done 2026-09-17 (Story 4.11)
resolution: Story 4.11 (2026-09-17): `tools/matrix/manifest.json` records the root `widelyAvailableOnDate` the
  baselines were taken under (with the image, Playwright, Chromium and the fonts), and the matrix's first test fails
  when the root pin differs, naming both dates and the re-run. Executed as a control: the pin moved to 2026-09-01 and
  `bash tools/matrix/run-matrix-gate.sh` exited 1 on that line; restored, it passed. `--update` re-records it.
severity: medium
origin: Story 4.8's Dev run (2026-09-14) — FR-G8 says bumping `widelyAvailableOnDate` "requires a render-matrix
  re-run" (NFR-6(a)); `tools/check-baseline.mjs` makes the bump reviewable but cannot see the matrix, and
  `epics.md`'s Story 4.11 names no pin-bump trigger
owner: Story 4.11 (the render matrix)
location: the root package.json `browserslist-config-baseline.widelyAvailableOnDate` · Story 4.11's matrix baselines
reason: 4.8's Never bars the trigger inside the matrix. The likely shape is one line: the matrix records the pin its
  baselines were taken under, and refuses to pass when the root pin differs, so a pin bump cannot land without the
  re-run FR-G8 names.

## Deferred from: code review of spec-4-8-the-baseline-floor-and-the-three-tools-that-enforce-it (2026-09-14)

### DW-139: a Tier-3 at-rule form or function passes `pnpm lint` — the plugin knows an at-rule by name only, and the diff covers properties

plain: The stylesheet check refuses newer styling by its property name. Some newer styling has no property name of
  its own — a newer form of an existing rule (a container query that tests a style) or a function used as a value —
  and the lint passes those unnoticed. Review has to catch them by hand until a check does.
status: open
severity: medium
origin: Story 4.8's review (2026-09-14) — Verification Gap: executed through the real config, `@container style(--x: 1)
  { … }`, `.a { color: if(style(--x: 1): red; else: blue); }`, `sibling-index()` and `random()` all pass, while the
  check prints `0 wider, 0 narrower`; its diff covers `css.properties` rows only, and `web-features` 3.35.0 also
  carries `css.at-rules`, `css.selectors` and `css.types` rows. `docs/section-authoring.md` says so since the review.
owner: Story 7.8 (the emitted-theme quality gate) — ruled by the owner on Q2 in spec 4.8 (option 1, 2026-09-14)
location: tools/check-baseline.mjs "the plugin against the pin" · stylelint.config.mjs · web-features `css.at-rules.*`,
  `css.selectors.*`, `css.types.*`
reason: 4.8's matrix scoped the diff to identifier-shaped `css.properties` rows because the other key families'
  syntax is irregular (Design Notes). Closing it needs one probe form per family and a rule that refuses a function
  or an at-rule prelude by name, which the plugin does not offer — a custom rule in the shape of
  `inflozo/supports-tier-2`.

### DW-140: NFR-2's "40 KB" names no base — `size-limit`'s `40 kB` is 40,960 bytes

plain: The size budget is written as "40 KB" without saying whether a KB is 1000 or 1024 bytes. The tool that
  measures it reads "40 kB" as 1024-based, so today the budget is slightly more generous than the round number
  suggests. Nothing is near the limit, so nothing changes yet.
status: open
severity: low
origin: Story 4.8's review (2026-09-14) — Blind Hunter: `tools/check-baseline.mjs` passes `--limit "40 kB"`, which
  `size-limit` parses with the `bytes` package (`kB` = 1024), while `prd.md` NFR-2 says "40 KB gzipped" with no base
  and the metric is already brotli (VERIFY row 27)
owner: Story 7.5 (the compile-time size gate), which owns NFR-2's number and metric per 4.8's Ask First
location: prd.md NFR-2 · tools/check-baseline.mjs `sizeLimit('40 kB')`
reason: 4.8 may not change NFR-2's number or metric; the base is the same kind of unstated unit as gzip-versus-brotli,
  and one sentence in NFR-2 settles both when 7.5 builds the gate.

## Deferred from: Story 4.9's Dev run (2026-09-14)

### DW-141: `(t …)` inside `{{plural}}` is not escaped, so a translation override can put markup on the page

plain: Almost every translated phrase is shown to visitors exactly as typed, tags and all as plain text. One route is
  different: a count phrase like "33 posts" goes through Ghost's plural helper, which shows whatever it is given as
  real page markup — so a customer who types HTML into that translation would change the page itself.
status: open
severity: medium
origin: Story 4.9's recording (MEASUREMENTS §44) — `{{plural pagination.total … plural=(t "probe.posts_many")}}` with
  `"% posts <i>many</i>"` printed `33 posts <i>many</i>` on 5.130.6 and 6.58.0; `helpers/plural.js:30-36` returns a
  `SafeString`. VERIFY-AT-BUILD row 32's "an override cannot inject markup" holds for `{{t}}` and not for this.
owner: Story 7.12 (override validation, V9/V10)
location: appendix-h1 §3.9 and §3.10 (`comments.count_*`, `archive.posts_*`) · VERIFY-AT-BUILD row 32
reason: 4.9 owns the catalog's format, not override validation; the fix is a refusal of `<` and `&` in an override
  for a key a design passes to `{{plural}}`, or an escape the compiler applies before the locale file is written.

### DW-142: override validation must refuse what `intl-messageformat` 5.4.3 refuses — the spine's parser accepts `'{'`

plain: When a customer types a translation, the check that stops a broken one must judge it the way the customer's
  Ghost site will. The checker the architecture names is newer and more forgiving than the one inside Ghost, so
  it would let through a phrase that breaks the live page.
status: open
severity: medium
origin: Story 4.9 (executed, MEASUREMENTS §44 (c)) — `@formatjs/icu-messageformat-parser` 3.5.18, the spine's
  "current", parses `'{'` as a literal brace and `It''s` as `It's`; 5.4.3 throws on `'{'`, and plain `{snake_case}`
  placeholders (appendix-h1 S3) forbid both. appendix-h1 V9 and FR-Q8 say a constructor throw is a "whole-page 500",
  which is read in source (`i18n.js:208-223`), not observed: MEASUREMENTS §15j saw a 400 for a template error.
owner: Story 7.12
location: ARCHITECTURE-SPINE.md's dependency row for `@formatjs/icu-messageformat-parser` · appendix-h1 V9, V10 · prd.md FR-Q8
reason: 4.9's Never excludes V9 and V10. The shape is to validate with the 5.4.3 both majors bundle (already a root
  devDependency) plus S3's placeholder rule, and to observe the 500 on T1/T3 before a surface promises it.

### DW-143: nothing checks that a catalog key survives from one library drop to the next

plain: A phrase's name must never disappear, because live sites and customers' translations point at it. Today the
  check compares the two copies of the list with each other, so deleting a phrase from both at once would pass.
status: open
severity: medium
origin: Story 4.9 — `tools/check-catalog.mjs` holds appendix-h1 §3 and `catalog.json` equal and runs S1's removal
  rule within one catalog (a key is `retired` or `supersededBy`, never absent); it cannot see a key both copies lost
owner: Story 7.27 (the diff between library drops)
location: tools/check-catalog.mjs · packages/library/strings/catalog.json
reason: 4.9's Never excludes a diff between library drops; the drop is the unit that carries a previous catalog to
  compare against.

### DW-144: `countdown.days` and `countdown.hours` read "1 days" and "1 hours"

plain: A countdown with one day left will say "1 days", because the English wording has no singular form and the
  catalog forbids the plural machinery that would pick one.
status: open
severity: low
origin: Story 4.9 — appendix-h1 §3.3a's defaults are `{count} days` and `{count} hours`, and S3 now forbids ICU plural
  syntax because `core`, the shim and Ghost's i18next backend substitute names only (MEASUREMENTS §44)
owner: the story that writes the `countdown` module (A2 #6 / A6 #11's category)
location: appendix-h1 §3.3a · packages/library/strings/catalog.json `countdown.*`
reason: adding a singular key or rewording is Ask First; the module's author decides, with the owner, between a
  `countdown.day` / `countdown.hour` pair the module picks at runtime and a unit-free form like "Days: {count}".

### DW-145: an untouched content default with no catalog key ships English on a non-English site

plain: A section's own starting words — a heading like "Latest posts" that the customer never retyped — are not in
  the list of translatable phrases, so on a German site they would stay in English unless the customer edits them.
status: open
severity: medium
origin: Story 4.9 — S6 links a text prop to a `prop`-marked catalog key only where appendix-h1 has one; every other
  `content.json` `default` is user text from the first render. `reconcile-designs.md:5929` raised it and it was
  never ruled.
owner: Story 7.12
location: appendix-h1 S6 · each category's content.json `default`s
reason: whether every visible default must have a catalog key, or a non-English project must be prompted to retype
  them, is an owner decision the Translations surface forces; 4.9 builds the mechanism (`catalog` on a prop) and
  adds no key.

## Deferred from: code review of spec-4-9-the-string-catalog-keys-english-defaults-and-the-t-contract (2026-09-14)

### DW-146: nothing asserts S5's inverse — a module that writes visitor-facing text must declare its keys

plain: The phrase list marks which phrases are written by a section's JavaScript, and the countdown section declares
  its six. Nothing checks the other way round: a future section could write "Loading…" from its script and forget to
  declare it, and the phrase would then be untranslatable with no warning.
status: open
severity: low
origin: Story 4.9's review — `moduleStringsRefusals` checks that every declared key is a live `js` key; the inverse
  cannot be derived today because the js keys of modules not yet written map to no row (namespaces are by function,
  not by module).
owner: each category story that writes a module (Story 4.7's rule), and 7.12's Translations surface as the backstop
location: packages/library/src/modules.ts `moduleStringsRefusals` · modules/registry.json `strings`
reason: the inverse needs a way to know which module a js key belongs to — a per-key `module` in appendix-h1, or a
  scan of each module's `translate(...)` calls (Story 4.7's lexical scan is the shape) — and either is a spec change
  the owner rules when the second module lands.

### DW-147: the recorder skips the probe theme's DELETE when re-activating the previous theme fails

plain: The test-server recorder restores the previous theme and then deletes its own. If the restore call itself
  errors, the delete never runs, and the recorder's own theme is left installed until someone removes it by hand.
status: open
severity: low
origin: Story 4.7's cleanup (owner's ruling on Q1), inherited unchanged by Story 4.9's recorder; noticed at 4.9's
  review. The error does reach the operator — it is not silent — but the cleanup is not attempted.
owner: the next story that touches `record-shim.py`
location: tools/probe/record-shim.py `finally`
reason: pre-existing; a `try`/`except` around the activate that still attempts the DELETE and re-raises is the fix.

### DW-148: the copy check compares retired-or-not only, so the first `supersededBy` cannot be held equal

plain: The two copies of the phrase list — the human table and the machine file — are held equal by a check. The
  check compares whether a phrase is retired, but the human table has no column for "replaced by", so the first time a
  phrase is replaced, the two copies could disagree without the check noticing.
status: open
severity: low
origin: Story 4.9's review — `appendixRows` reads a status cell as retired or not; `catalog.json` carries
  `supersededBy`, and `catalogFailures` checks it against `migrations`, but nothing ties it to the table.
owner: the story that first supersedes a key (Ask First in 4.9), with DW-143 (Story 7.27)
location: tools/check-catalog.mjs `appendixRows`, `copyFailures` · appendix-h1 §2 markers
reason: appendix-h1 needs a status form for "superseded by `key`" before the check can parse one; adding it with no
  instance would be a written-down convention nothing exercises.

## Deferred from: Story 4.10's Dev run (2026-09-15)

### DW-149: A34 #1 Numbers is drawn as a row of clickable page numbers, which R-109 ruled out

plain: One of the drawn pagination styles shows "← 1 2 3 … 11 →". The owner ruled that a list of posts never shows a
  row of clickable numbers, so that drawing has to be redrawn to "Newer posts · 5 / 11 · Older posts" when the
  Pagination Styles category is built.
status: open
severity: low
origin: R-109 (owner, 2026-09-15), Story 4.10's Q2
owner: A34's category story (Epic 10) — redraw A34 #1 Numbers to the indicator form in the Claude Design project
location: design export `A34-1 Numbers.dc.html` (never edited here, R-74) · `docs/section-authoring.md` § 3
reason: Ghost hands a theme only page, pages, prev and next; the indicator is what both emitters produce identically.

### DW-150: A1 #1 Rail — what its pilot leaves to A1's category story

plain: The Rail header on the pilots page is the resting header with its member-aware actions. Its menus that open,
  search, the dark-mode switch, an uploaded logo (and a logo for dark backgrounds), the open drawer and the shrinking
  motion arrive with the Headers category.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: A1's category story (Story 9.1 onward)
location: packages/library/designs/a1/ (provisional, AD-35)
reason: each needs a vocabulary piece, a module or a field the pilot story does not own:
  - authored nav children and dropdown panels — **R-111 (owner, 2026-09-15): built on Inflozo's own
    `partials/navigation.hbs`, recorded on T1 and T3 first, carrying both §0·5 sources (Inflozo-authored children and
    the `+`/`-` prefixes) as native `<details>`; never on Ghost's default `{{navigation}}` markup**; Fit to width; the Search control and trigger (no artboard draws one);
    the dark-mode toggle (no key); `<h1>` on the home page only; the skip link (E7's layout owns `<main>`);
  - the authored logo, and its `logoLight` for a dark ground — Orbit Weekly's `@site.logo` is drawn for a light ground,
    so the image is dark-on-dark in Dark mode (owner test step 14 carries the caveat);
  - Shrink's motion (`header-scroll`) and the open drawer's markup (`nav-drawer`);
  - "Sign in", "Account" and "More" are fixed `data-t` strings: the spec draws them as editable fields, and their keys
    are not marked prop (re-marking a key is Ask First);
  - Compact 56 and Spacious 92 bar heights were chosen by the Dev run (the spec gives Comfortable 76 only);
  - the current-page underline IS built (`{{navigation}}` adds `nav-current`), so it leaves the list;
  - **Divider under: Shadow draws nothing in Dark** — Paper's dark object declares `shadow: none` (`_build/a22lib.js:8`),
    so `--shadow-card` is `none` and the option is invisible there; a dark form of the divider is a category-story
    choice against the dark artboard (`A1-1 Rail.dc.html:103-125`). Found at Story 4.10's review.
  - (Fixed at the review, not left: Account sat inside the self-signup gate and vanished on an invite-only site;
    `A1 Headers - Spec.md:79` hides Sign in and Subscribe only. The gate is now a `display: contents` wrapper around
    the two asks.)
  - **Added by Story 5.15 (2026-09-22):** `A1 Headers - Spec.md:185` says A1·6's takeover and A1·7's panel are "pinned
    open while their contents are selected, because that is where their authored content lives" — a canvas behaviour
    no story builds. Since 5.15 the editor holds `nav-drawer` still while designing, so the mount rests in its no-JS
    state, where A1's own no-JS baseline makes the takeover's contents native `<details>`. The story building A1 #6 and
    #7 (9.2) decides whether that resting state is enough to design them in, or asks for pinning.

### DW-151: A17 #1 Three Up — what its pilot leaves, and the one-value grey the engine cannot draw

plain: The Three Up grid on the pilots page shows real feed pages. Choosing which posts it shows, the main-feed
  setting, "View all" and a few drawn details arrive later; and at four per row the "Three lines" excerpt option
  cannot yet be shown greyed on its own, so the grid quietly uses two lines there instead.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Story 5.19 (Source, Count and the main-feed designation) · A34's category story (the Pagination style select) ·
  DW-107 (Image focus) · A17's category story (Epic 10) for the rest
location: packages/library/designs/a17/1/ · packages/section-runtime/src/controls.ts (`disabledBy` greys a whole control)
reason:
  - "Three lines greyed at Four" is one value switched off by another control's value; `disabledBy` greys the whole
    row and a per-value dependency is a registry field this story does not name (Ask First). The stylesheet clamps
    Three lines to two at Four, the value in force the spec gives; the panel shows no grey and no sentence (owner test
    step 8 amended). A22's "Display greyed at Wide" is the same gap.
  - "View all: Matches the query" (the link has no destination until then, so it renders nothing, FR-F8);
    hiding the image row when no post in the set has a picture; the tablet's short date and surname byline; whether
    the empty state shows only on the designated main feed.
  - Meta defaults to "With photograph" (every artboard) where the panel's select reads "Name, date and reading time".
  - The empty body is the catalog's "There are no posts in this collection yet."; the panel draws another sentence.
  - No accessible name on the section (a per-instance id is not in the vocabulary); the hover underline has no fade.

### DW-152: A22 #1 Inline Row — what its pilot leaves, and `{members}` has no theme form

plain: The newsletter row on the pilots page shows the sign-up form, and "Signed in" for members. Its Sending, Done and
  Invalid states, a name field, a newsletter choice, the paid count and the no-JavaScript notice arrive with the
  Newsletter category; and the "Join 1,200+ readers" line prints its placeholder word on a published site today.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: A22's category story (Epic 10); the `{members}` theme form to the story that first ships a design with Social
  proof on (the runtime owns it: `packages/section-runtime/src/marks.ts` `substituteTokens`)
location: packages/library/designs/a22/1/ · packages/section-runtime/src/marks.ts
reason:
  - Submitting, Done and Invalid and their words; the name field and the newsletter choice; the paid count (DW-99);
    the other members-off option; Display greyed at Wide (DW-151's gap); the no-JavaScript notice (R-5's key).
  - R-27's `{members}` token is substituted only from `RenderInput.tokens`; with none handed, BOTH emitters print the
    literal `{members}` (the theme as `&#123;members&#125;`) — there is no `{{total_members}}` form on the theme. Social
    proof defaults to off, so the pilot's default render never shows it.
  - "Signed in" and "Manage your preferences" are content props (no catalog key; R-28 forbids printing the email);
    the drawn authored placeholder ("you@example.com") and the hidden "Email address" label have no key; the account
    link's fixed newsletters-preferences target is not a Portal action the link record offers; the note's
    `aria-describedby` needs a per-instance id.

### DW-153: A24 #1 Centred — what its pilot leaves to A24's category story with E7's page wrapper

plain: The post header on the pilots page shows one post's tag, title, standfirst, byline and picture. Pages, several
  authors in one byline, the updated date, links in the caption and the editor's "no feature image" box arrive later.
status: open
severity: low
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: A24's category story (Epic 10), with E7's page wrapper · DW-107 (Image focus)
location: packages/library/designs/a24/1/ (target `post.hbs` only)
reason: `page.hbs` and `@page.show_title_and_feature_image` need `data-target`; all tags, and several authors with
  "and"/"and others" (R-3's key); the updated-date Meta value; the caption's links (bound as escaped text); the "Post
  block" group name (its rows sit under Style); the editor-only greyed picture box (no key for its words). The figure's
  `data-if="feature_image"` and the image's media guard emit two nested `{{#if feature_image}}` (they share a field but
  not an element) — harmless, and one guard once a wrapper condition can share its child's.

### DW-154: A4 #13 Latest Post — what its pilot leaves to Epic 5 and A4's category story

plain: The Latest Post hero shows your newest post in its card. Choosing which post, hiding it from non-members, the
  "Members only" marker, the picture-less card style and a fall-back picture when nothing is published arrive later.
status: open
severity: low
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Story 5.19 (Which post) · Story 5.4 (Member visibility) · Story 5.20 (gating an action by its Portal
  destination) · A4's category story (Epic 10) for the rest
location: packages/library/designs/a4/13/
reason: Card style's Title and date and its "Latest" label (no key); the members-only marker (a match on `visibility`,
  which no directive expresses); the fall-back picture when nothing is published; the short date on phones; which
  marks rule holds (`A4 Heroes - Spec.md:61` against `A4-0:327`); the phone's picture-less panel (undrawn); the tablet
  headline follows the spec's ladder (Large 44) where the artboard draws 40.

### DW-155: the reference token set's page width and gutter are not the frames' 1296 px content and 72 · 40 · 20 margins

plain: The drawings put a page's content 72 pixels in from each side at desktop (40 on a tablet, 20 on a phone). The
  sample colours now match the drawings, but the page width the sections use is still the older 1,152 pixels with a
  24-pixel margin, so on the pilots page the columns are a little narrower than drawn and some headlines wrap one line
  earlier.
status: open
severity: medium
origin: Story 4.10's Dev run — reported by all five pilot authors; the spec's rule was "every row the Paper objects
  name takes their values; every other row keeps today's value", and no Paper token object names a width or gutter
owner: the owner, at Story 4.10's owner test (step 14 compares arrangement and spacing); otherwise Epic 6, whose packs
  author these rows. Story 4.10's review added to the same list the rows derived from the retired ink and accent that
  no Paper object names — `--border-fade` and `--scrim` (rgba of `#1c1a17`), and both modes' `--accent-on-contrast`
  (`#e8a87c` / `#8a3b12`, the pre-Paper accent on Paper's contrast ground); and Light `--link-color`, which took the
  accent and was Story 4.10's Q5 — ruled R-112: ink words, accent underline (that row leaves this list)
amended: Story 5.14 (Dev, 2026-09-21), R-173 — **`--accent-on-contrast` is now drawn.** The token block's link rule
  underlines a typed link on a contrast ground with it, so the pre-Paper `#e8a87c` / `#8a3b12` on this list is now
  visible on the canvas (7.99:1 and 6.28:1 on Paper's contrast grounds, measured by Story 5.14's sweep). Epic 6's
  value for the row replaces it with nothing else to change.
location: packages/section-runtime/src/tokens.ts (`--site-width` 72rem, `--space-gutter` 1.5rem) · every pilot's style.css
reason: changing a row no Paper object names would be inventing the value; the frames draw it, so it is a one-row
  token change once ruled. A1, A22, A24 and A4 also carry their own section padding as literals where the frame's
  ladder differs from `--space-section`.

### DW-156: `{{t "post.reading_time" minutes=reading_time}}` prints "0 min read" where Ghost's own helper prints "1 min read"

plain: Two pilot cards print a post's reading time through the translatable phrase. For a very short post a live site
  would say "0 min read", where Ghost's built-in wording says "1 min read".
status: open
severity: low
origin: Story 4.10's Dev run (A17 #1, A24 #1), from the fact MEASUREMENTS §44 recorded (a plain param is the FIELD)
owner: the story that settles reading-time phrasing library-wide — A17's category story (Epic 10) is the first
location: packages/library/designs/a17/1/index.html · packages/library/designs/a24/1/index.html · catalog key `post.reading_time`
reason: `data-bind="reading_time"` prints Ghost's rounded string but untranslatable English; the catalog form is
  translatable but passes the raw field. No Orbit Weekly post has a reading time of 0, so the canvas never shows it.

### DW-157: two starter compositions still name "Split Editorial hero (A4 #2)", a design the inventory merge renamed

plain: Two of the ready-made starter sites are described as using a "Split Editorial" hero. That hero was renamed and
  renumbered on 4 September; today's Heroes #2 is "Flush Left", which has no picture. The starters' lists need checking
  against the current library before the starter chooser is built.
status: open
severity: low
origin: Story 4.10's propagation grep for `A4 #2` and `Split Editorial` (standing rule 7) — outside R-108, which is the
  pilot row only
owner: the starters' story (Epic 11, Story 11.2 the starter chooser, or the story that authors `starters/`)
location: prd.md Appendix E (Signal and Ledger, `:1127`, `:1133`) · epics.md (`:7103`, `:7272`)
reason: which hero each starter now uses is a composition choice, not a rename — "Split Editorial" merged into
  another design, and picking its successor is the owner's or the starters' story's call, not a propagation.

### DW-158: Paper's white-on-accent fails WCAG AA contrast on every pilot's main button in Light

plain: The orange Subscribe buttons have white words that are too faint for the accessibility rule, in light mode only.
  The fix is a colour choice for the owner (Story 4.10's Q3).
status: done 2026-09-15 (Story 4.10)
resolution: R-110 (owner, 2026-09-15, Story 4.10's Q3, option 1): the words on the accent are the ink. Light
  `--text-on-accent` is `#232019` in `packages/section-runtime/src/tokens.ts` and `reference-tokens.css` — 4.77:1 on
  `#D96C3F` by WCAG's formula, against white's 3.41:1; Dark's `#171511` on `#E0805A` (6.43:1) is unchanged. Epic 6's
  Paper pack takes the same value. The export still draws white (R-74: never edited).
severity: medium
origin: Story 4.10's Dev run — `tools/probe/run-verify-pilots.cjs` on the deployed /pilots, axe-core 4.12.1 at WCAG 2.1
  AA: `color-contrast` on A1 #1's `.a1-1__cta`, A22 #1's `.a22-1__button` and A4 #13's primary action, #FFFFFF on
  #D96C3F at 3.4:1, at every width and visitor in Light; zero violations everywhere else (the positive control passed)
owner: the owner (spec 4.10 Q3), then the reference token set (`packages/section-runtime/src/tokens.ts`) and Epic 6's
  Paper pack; Story 4.11's matrix fails on it until then
location: packages/section-runtime/src/tokens.ts `--text-on-accent` / `--accent` · the export's Paper `onAccent`
reason: the values are the export's Paper objects (`_build/a22lib.js:4`, `a20-kit.js`), which R-74 makes the authority;
  changing one is a ruling, not a propagation.


## Deferred from: code review of spec-4-10-the-five-pilot-sections-editor-perfect-with-the-snapshot-harness (2026-09-15)

### DW-159: an HTML comment in a design's markup ships to every visitor — the emitter keeps comments

plain: A note a designer writes inside a section's markup (the kind that begins `<!--`) was reaching the finished
  theme, so anyone reading a customer's page source would have seen our internal story numbers and file names. The
  five sample sections' notes were removed at the review; the rule that strips them still needs building.
status: open
severity: low
origin: Story 4.10's review — every `snapshots/*/template.hbs` began with the pilot's authoring comment
  (`<!-- A1 #1 Rail — Story 4.10 pilot, provisional (AD-35). Frame: … -->`); nothing in `core.ts` strips a comment
  and `docs/section-authoring.md` does not say whether one is consumed or emitted
owner: Story 7.1 (E7's formatting pass re-baselines every snapshot once; stripping comments belongs in the same pass)
location: packages/section-runtime/src/core.ts (`renderTree`) · packages/library/designs/*/*/index.html · tools/check-snapshots.mjs
reason: the runtime's own markers are comments (`<!--__HBS_n__-->`, R2-7), so a strip must run before the tokens
  are put and never touch them — a small change with an agreement-test row, not a review patch. Until then a
  design carries no comment; the five pilots carry none.

### DW-160: A4 #13's secondary action defaults to a sample-publication address

plain: The Latest Post hero's second button, "Browse the archive", points by default at Orbit Weekly's archive — a
  made-up sample address. On a real customer's site that default would be a dead link until they change it.
status: open
severity: medium
origin: Story 4.10's review — `packages/library/designs/a4/content.json` `secondaryAction.url` defaults to
  `{ "href": "https://orbit-weekly.example/tag/archive/", "ref": { "kind": "tag", "id": "7a9…01" } }`, and
  `snapshots/a4/13/template.hbs` carries the `.example` href verbatim; A17 #1's `linkUrl` has no default and hides
  by `data-empty`
owner: Epic 5's Link Picker and persistence stories (the `ref` is resolved against the connected Ghost there; a
  cached `href` from the sample must never reach a compiled theme), with A4's category story for the drawn default
location: packages/library/designs/a4/content.json · packages/library/snapshots/a4/13/template.hbs
reason: the frame draws both buttons and owner test step 12 expects "Browse the archive", so removing the default
  changes the drawn state (R-74); what a `ref` resolves to on a real site is Epic 5's contract, not the pilot's.

### DW-161: `data-members-email` and `data-members-error` are not checked to sit inside a `data-members-form`

plain: Portal only reads the email box and the error line when they are inside the sign-up form. A designer could
  put either outside the form and every check would pass, yet the form would submit nothing.
status: open
severity: low
origin: Story 4.10's review — `validateMarkup` walks the markup as a flat token stream (no ancestors), and the
  directives' summaries state the rule without enforcing it
owner: A22's category story (the first with several member forms), or Story 4.11 if the matrix adds a structural walk
location: packages/library/src/validate.ts · packages/library/src/vocabulary.ts (`data-members-email`, `data-members-error`)
reason: the validator carries no ancestor stack today; adding one for two attributes is more than a review patch,
  and the five pilots place both correctly (the snapshot check would show a move).

### DW-162: the pilots frame route's session guard is held by a source-text test only, as `controls/frame` and `style-guide/frame` are

plain: The test that says "strangers are turned away from the sample-sections page" reads the code as text and looks
  for the right words in the right order; it does not actually knock on the door. The same is true of the two older
  internal pages.
status: open
severity: low
origin: Story 4.10's review — `apps/web/pilots.test.ts` asserts `await currentUser()` precedes the body calls and
  `/303/` appears; `run-verify-pilots.cjs` signs in first and never fetches the frame signed out. Pre-existing
  pattern: `controls.test.ts:18`, `style-guide.test.ts:84` (DW-133's note names the executed 303 for `/controls`)
owner: the story that next touches an internal frame route, or Story 4.11
location: apps/web/pilots.test.ts · apps/web/app/(app)/app/(authed)/pilots/frame/route.ts
reason: `apps/web` evaluates app `.ts` under Node 24 type-stripping already; the fix is one executed test with
  `@/lib/supabase/server` stubbed to return null, asserting 303 and `location` ending in `/sign-in`, for all three
  frame routes at once.

### DW-163: where Member visibility sits — the settings panel's Section Settings, or the Layers panel

plain: Who a section is shown to (Everyone, Logged out, Free members, Paid members) has two homes on paper. The
  plan puts it in the Layers panel; the header and hero drawings put it inside each section's settings panel. The
  settings panel's rule already says that, if it lives there, it belongs under Section Settings.
status: closed
severity: medium
origin: Story 4.10's Fix review (sweep 1, acceptance audit) — `prd.md` FR-D5 and Appendix C's Member Visibility row
  and `epics.md` Story 5.4 name the Layers panel; `A4-13 Latest Post.dc.html`'s panel draws the control; R-113 files
  it under Section Settings in `packages/library/control-groups.json`
owner: Story 5.4 (the Layers panel, reordering, and the two kinds of singleton), which builds the control — to ask
  the owner in R-83's shape before planning it
location: _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md (FR-D5, Appendix C) ·
  packages/library/control-groups.json · docs/section-authoring.md § 2
reason: no pilot panel carries the control today (`/pilots`' Show to is the page's own switcher), so nothing built in
  Story 4.10 depends on the answer, and the answer is the owner's.
CLOSED 2026-09-18 by **R-124** — Story 5.4's Q1, ruled option 1 by the owner: the panel's Section settings, first row,
  as every drawing and R-113 already had it; Layers draws nothing about it. The rule now sits in
  `docs/section-authoring.md` § 2 and in `epics.md` Story 5.4.

### DW-164: `epics.md`'s library stories list behaviour modules as cut-off sentence fragments

plain: In some library story cards, the line that names a design's behaviour scripts shows broken bits of sentences
  instead of module names.
status: open
severity: low
origin: Story 4.10's Fix review (sweep 1, blind hunter) — e.g. the A17 and A18 stories' "behaviour modules these
  designs declare" lines carry `loads o`, `their excerpts and their meta are server-r`; pre-existing, from the
  step-6 generator's reading of each spec's Behaviour field
owner: the next run of the step-6 generator, or the first E9–E11 category story whose card shows it
location: _bmad-output/planning-artifacts/epics.md (A17 and A18 story blocks, and any other with the same shape)
reason: the fragments predate Story 4.10 and change no story's scope; fixing them means correcting the generator's
  field parse, not hand-editing the cards.
amendment: Story 5.15's Create and Dev (2026-09-22) found three more of the same parse, all left for the generator run:
  - **"none" where §2.1 derives a module.** The library stories from 9.1 to 10.41 carry "the behaviour modules these
    designs declare — none —" on cards whose designs research §2.1 lists as declaring one. Story 9.1 is the first:
    A1 #1–4 against `header-scroll`, which §2.1 derives for A1-1 onward — the first module a PAUSED chip will mark.
  - **A1-16 Reveal is in no story.** The export draws it (`A1-16 Reveal.dc.html`) and §2.1 counts it among
    `header-scroll`'s declarers, while A1's four stories (9.1 to 9.4) end at design #15.
  - **Designs "declaring" `core`.** The A31 and A32 cards (Stories 10.104 to 10.109) list `core` among the modules
    their designs declare, which FR-G7(4) forbids: `core` is the platform runtime, declared by no design.
  - Story 5.15 hand-corrected ONE thing in these lists, at its own spec's instruction: the three cards that restated
    `filter-strip`'s and `load-more`'s edit-safe value now cite `registry.json` instead.

### DW-165: the Data group draws only Show and Order — two queries repeat them, and a category's own query settings have no row yet

plain: The Data group titles a feed's rows "Show" and "Order". A section that pulls two lists from Ghost — say a
  featured post and a list of the latest — would show two "Show" rows and two "Order" rows with nothing to tell them
  apart, and the reset box would read "Show and Show". And the settings the register files under Data for a
  category — "Nav children", "Fill with", "If the tag is empty", "When nothing matches" and the rest —
  change what Ghost returns, so they are query settings, never controls, and the Data group has no row for them yet.
status: open
severity: low
origin: Story 4.10's Fix review (sweep 2, edge-case hunter) — `dataRows()` in
  `packages/section-runtime/src/controls.ts` titles every query's rows alike; `tools/check-snapshots.mjs` refuses such a
  panel under R-13, so it cannot ship unnoticed
owner: Story 5.19 (the Data group's Source, Count and Order), which owns the query rows' vocabulary — the words that
  name each query are its to draw, from P0·5
location: packages/section-runtime/src/controls.ts (`dataRows`) · apps/web/components/controls/sidebar.tsx (the confirm's
  list)
reason: no built design declares two queries (each pilot has at most one, and the controls sample one), and naming a
  query in the panel is a wording the export has not drawn yet. For the category settings: `tools/check-snapshots.mjs`
  refuses one declared as a control, naming it a query's, so the category story that builds such a design adds its
  row to the Data group (P0·5's library-wide ones, such as When nothing matches, are Story 5.19's).

### DW-166: titles the design export prints twice in one panel, for the category stories that build those designs

plain: In some drawn panels the same title appears twice — a setting and a text field both called "Note line", or a
  setting called "Layout" inside the Layout group. One panel may print a title only once (R-13), so the story that
  builds each design changes one of the two, by the rule the export itself follows, and shows you the new words.
status: open
severity: low
origin: Story 4.10's Fix review (sweep 3, acceptance audit and the register research, 2026-09-15) — every drawn panel
  read against its category's fields and the accordion titles
owner: each category story that builds a design named below, which applies the rule in
  `docs/section-authoring.md` § 2 ("When the export's titles would repeat in one panel") and puts the new title to the
  owner under Questions for the owner (R-83) before it ships
location: packages/library/control-groups.json (the entries and its note) · the named designs' frames
reason: nothing built repeats a title — `tools/check-snapshots.mjs` refuses a panel that does — and each new title is a
  wording the owner has not seen. The repeats, by design (a setting beside a field: the field gives way; two settings,
  or a setting and its accordion: one takes the export's other title for it):
  - A2 #12 "Image" · A4 #7 "Issue line" · A6 #7, #10 "Note" · A20 #10 "Lead label" · A22 #8 "Eyebrow" · A22 #9
    "Label" · A32 #1–#11 "Eyebrow" (the spec gives every A32 design but #12 an `eyebrow` field, and no A32 frame titles
    it) — a setting beside a field of its title.
  - A16 "Blurb" (#1–#5, #12, #14, #15), "Email" (#1, #4, #5), "Phone" (#1, #4, #5, #9), "Label" (#9), "Reasons"
    (#14) · A17 "Title" (#2, #6, #9, #10) · A21 "Heading" (#3), "Blurb" (#5, #14), "Action label" (#6) · A30 "Note
    line" (#1–#7, #9–#11, #13), "Legal line" (#1, #2, #4, #6), "Blurb" (#9) · A31 "Recovery links" (#1–#7, #10),
    "Code" (#1–#9) · A32 #12 "Meter label" — a setting beside a field or list of its title.
  - A4 #9 "Primary action" (filed: the button style is "Action style") · A21 "Bio" (#1–#4, #12) and A29
    "Description" (#1–#7, #9–#14) beside a Data row of the same title · A30 #8, #13 "Order" beside the Data group's
    Order — two settings.
  - A26 #1–#6, #9–#11, #13–#15 "Share destinations" — the design's locked row and the site setting's, in one panel.
  - A34 #9 "Content" (A34's "Contents") · A24 #15 "Layout" and A34 #3 "Layout" (no other title in the export) — a
    setting titled like its accordion.
  - A29–A31's "Eyebrow" settings are already resolved by their frames, which title the field "Eyebrow text"; so are
    A27–A29's "Heading text", "Description text" and "Back link label", and A4-10's and A10-12's "Show …" toggles.

### DW-167: the settings panel's click wiring, and `/pilots`' client wiring, are held by the deployed harness only

plain: FIXED 2026-09-19 (Story 5.9) — a real browser now opens the real editor on every commit and works the panel
  from the keyboard: Reset this design with nothing changed says so under itself, one changed control makes the same
  press ask first, the confirm opens on Cancel and Esc leaves the section exactly as it was. A slip in that wiring is
  now red within a minute instead of at the next hand run.
status: closed
severity: low
origin: Story 4.10's whole-story code review (2026-09-15, verification-gap layer) — `apps/web/components/controls/sidebar.tsx`'s
  branch on `resetChanges` and the confirm's commit, and `pilots/review.tsx`'s render inputs, have no test `pnpm check`
  runs; `tools/probe/run-verify-pilots.cjs` and `run-verify-controls.cjs` read both on the deployed site (R-82)
owner: Story 5.9 (The keyboard map, and keyboard completeness), whose keyboard journey is the editor's first browser
  test. Story 5.2 mounted the section panel in the editor (2026-09-17) and `run-verify-editor.cjs` step 12 now also
  walks the reset wiring there — Reset this design, the confirm, Reset design, `data-per-row` back — but still on the
  deployed site only, not in `pnpm check`, so the entry stays open and moves on. Since 5.1, `pilots/review.tsx`'s render
  inputs are `apps/web/lib/canvas.ts`, shared with the editor and compared node by node on the deployed site by
  `run-verify-editor.cjs` step 4
location: apps/web/components/controls/sidebar.tsx · apps/web/app/(app)/app/(authed)/pilots/review.tsx ·
  apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx (`onChange`)
  · Story 5.7's Review (2026-09-19) adds the device wiring: `editor.tsx`'s stage `ResizeObserver`, the card's and
  the iframe's sizes, and `apps/web/components/editor/device-switch.tsx` — `run-verify-editor.cjs` steps 54–60 only
reason: `apps/web` runs `node --test` with no DOM, and a DOM for it is a dependency (Ask First); the pure functions
  under both (`resetChanges`, `resetSection`, `renderCanvas`) are pinned in `packages/section-runtime`.
resolution: THE "Ask First" LAPSED AND THEN THE OWNER RULED. Story 4.11 made `@playwright/test` a root devDependency,
  so the DOM this entry was waiting on had already arrived; **R-146** (owner, 2026-09-19, Story 5.9's Q2) then chose to
  spend it. `tools/keyboard/run-keyboard-gate.sh` boots `next dev` with `INFLOZO_HARNESS=1` and drives
  `/app/harness/editor` — the REAL `Editor` with the pilot fixture, typed against `EditorData` so drift is a compile
  error — from the keyboard alone, as `pnpm keyboard`, its own step inside CI's `check` job, the only place a gate can
  block a deploy (R-116). Its last test is this entry's own subject, the panel's reset wiring. What a harness cannot
  prove is still the deployed walk's (R-82): `run-verify-editor.cjs` runs the same journey on the deployed editor with
  a real session from step 71. `/pilots`' render inputs stay where Story 5.1 left them — `apps/web/lib/canvas.ts`,
  shared with the editor and compared node by node on the deployed site by step 4 — and the device wiring the 5.7
  addendum added is walked by the journey's device test.

### DW-168: no gate holds a design's `ghostCompat.minVersion` to the matrix's `since` for the fields it reads

plain: Each section says the oldest Ghost it works on. Nothing checks that claim against the fields the section
  actually uses, so a section could read a field Ghost added later and still say it works on older Ghost.
status: open
severity: medium
origin: Story 4.10's whole-story code review (2026-09-15, acceptance audit) — the spec's boundary "`ghostCompat.minVersion`
  is at least every `since` the matrix gives a field the design reads" holds for the five pilots (A1 #1 and A22 #1 at
  5.62.0 for `@site.allow_self_signup`, the rest at 5.0.0) by hand; `validate.ts` never reads `matrix.json`'s `since`
owner: Story 9.1, the first story that ships designs to customers (DW-87's owner, whose compatibility check reads
  `ghostCompat`)
location: packages/library/src/validate.ts · packages/library/contexts/matrix.json · tools/check-snapshots.mjs
reason: `checkBindings` already walks every Ghost path a design reads at each target; the check is that walk's
  fields mapped to their `since` and compared with `minVersion`, one row in `tools/check-snapshots.mjs`. No shipped
  design depends on it yet (AD-35's provisional pilots ship to no one).

## Deferred from: planning of spec-4-11-the-render-matrix-and-the-accessibility-scan-that-runs-on-it (2026-09-17)

### DW-169: the render matrix's pack axis has one member until Epic 6 authors the three reference packs

plain: The picture check photographs every section in every colour-and-type scheme. The plan says three schemes;
  today only one exists, so it photographs one. When the twelve schemes are built, three of them become the
  references and every photograph has to be taken again.
status: open
severity: medium
origin: Story 4.11's planning (2026-09-17) — NFR-6(a) names "3 reference Style Packs"; Epic 4 ships exactly ONE
  reference token set on purpose (step-6 stress finding F2: a design's CSS reads pack custom properties
  exclusively, so the canvas needs a token block three epics before any pack exists), and Epic 6 authors the
  twelve. `tools/matrix/cases.mjs` therefore DERIVES the axis from the token sets that exist (standing rule 4)
  rather than restating three; inventing two throwaway packs now would invent a decision the owner never made.
owner: Epic 6 (the story that authors the packs picks the three references and re-takes the baselines)
location: packages/section-runtime/src/tokens.ts · tools/matrix/cases.mjs · packages/library/baselines/
reason: widening the axis re-renders every case, which is a MASS REBASELINE under NFR-6(a)'s own rule — the
  owner's approval on a sampled visual review, its own commit touching baselines only, naming the change that
  caused it. So the widening is not a patch to this harness; it is that ruled event, and it belongs to the story
  that causes it.

## Deferred from: code review of spec-4-11-the-render-matrix-and-the-accessibility-scan-that-runs-on-it (2026-09-17)

### DW-170: the accessibility scan does not yet stop at the post body's edge — no design draws one

plain: When a section one day shows a post's own text, the checker must not blame the theme for what the customer
  wrote. Nothing draws a post body yet, so the rule has nowhere to bite; the day a design does, it must.
status: open
severity: medium
origin: Story 4.11's review (2026-09-17) — Acceptance Auditor and Blind Hunter: epic-4-context.md says "the scan stops
  at the edge of the post body"; `tools/matrix/matrix.spec.mjs` scans all of `#canvas` with a `ponytail:` comment
  deferring the exclusion
owner: the first story whose design binds `{{content}}` (A32/A33's category)
location: tools/matrix/matrix.spec.mjs — the `axe.run(document.getElementById('canvas'), …)` calls
reason: 4.11's Never excludes the categories that do not exist yet. The shape is one `exclude` selector on the post body's
  mount, derived from the design's binding, not a written list; a case whose markup carries the binding and no exclusion
  should fail rather than scan Ghost's markup.

### DW-171: the matrix derives the Show-to arm from `data-members` while `/pilots` draws it from a written list

plain: The photo machine decides "does this section have a Show-to setting" by reading the section's own markup; the
  pilots screen decides it from a short list typed by hand. The two disagree on two sections today, so one section's
  hidden state is photographed although the screen never shows it, and another's is shown but never photographed.
status: open
severity: low
origin: Story 4.11's review (2026-09-17) — Acceptance Auditor, Verification Gap and Edge Case Hunter: `review.tsx`'s
  `DRAWS_SHOW_TO = ['a22/1', 'a4/13']` vs `cases.mjs`'s `/\bdata-members=/`; `a1/1` gets six `show-to-*` baselines the
  editor never draws, `a4/13`'s Show-to arm has none. Pixel risk is nil: a hidden Show-to arm draws nothing
owner: Epic 5's canvas (Story 5.x that mounts Show-to in the real panel — the list becomes the panel's own rule, and
  the matrix and the editor read one source)
location: apps/web/app/(app)/app/(authed)/pilots/review.tsx `DRAWS_SHOW_TO` · tools/matrix/cases.mjs `fixtureRows`
reason: the spec's frozen Boundaries fix the matrix's derivation ("its markup carries `data-members` → the visitor and
  Show-to arms"), so the matrix is not the side to change here; `/pilots` is a provisional surface. When the real panel
  decides Show-to per design, export that rule and import it in `cases.mjs`, then re-derive the baselines.

### DW-172: the commit-msg hook's Dev-phase guard has no executed control of its own

plain: The check that refuses a "development finished" commit while tasks are still open is not itself tested. If it
  broke, every such commit would pass again and nothing would say so.
status: open
severity: low
origin: Story 4.11's review (2026-09-17) — Verification Gap: `tools/hooks/commit-msg`'s Dev block (spec glob, staged
  read, parse_spec import, three exit-1 arms) runs in no test; only the board's side is asserted in `story-board.py`'s demo
owner: the next Hotfix that touches `tools/hooks/` (the pattern is `record-cards.py --self-check`)
location: tools/hooks/commit-msg — the Dev block · tools/story-board.py `demo()`
reason: a hook self-check needs a temporary index and two throwaway specs; small, but its own tool with its own catalogue
  row, and this review's scope was the matrix.

### DW-173: one full matrix run in six failed on one case and did not reproduce

plain: The photo machine was run six times in a row on the same files. Five runs passed; one failed on a single
  photograph and then passed again. A check that sometimes fails for no reason would make the owner approve photos
  that did not change, so the cause must be found before the matrix grows.
status: open
severity: medium
origin: Story 4.11's review (2026-09-17) — the gate inside the pinned image on this machine: run 1 of 6 exited 1 on
  `a17/1 · reference-light-1440-reduced-motion-feed-first` with a thrown error (an `error-context.md` was written, so not a
  pixel mismatch, which is `expect.soft`); runs 2–6 and the CI run passed with identical totals. The next run cleared
  `tools/matrix/test-results/` before the context was read.
owner: the first story that adds a design to the matrix (E9's first category), or a Hotfix if the nightly reproduces it
location: tools/matrix/matrix.spec.mjs — the height loop's `waitForFunction` on images and the `drawn` assertion are
  the two throws a case can reach; .github/workflows/matrix.yml uploads `test-results/` on failure, so a CI recurrence
  keeps its context
reason: not reproducible in five further runs, so not patchable blind. On the next failure read the artifact first.

## Deferred from: Story 5.1's Dev run (2026-09-17)

### DW-174: the dashboard reports a CSP eval violation on every load — zod's JIT probe, at schema construction

plain: Every time Projects opens, the browser quietly notes that a piece of our code tried something the security rules
  forbid. Nothing breaks and nothing is at risk, but a real warning would be lost in that noise, and the security check we
  run on the editor would fail if it looked at Projects.
status: open
severity: low
origin: Story 5.1's Dev run (2026-09-17) — `tools/probe/run-verify-editor.cjs` against a local production build: a
  `script-src` `eval` violation from zod's core chunk on `/` (Projects) at every load, and the same on the editor until
  `doc-schema.ts` set `jitless`. zod runs `new Function("")` when a `z.object` is CONSTRUCTED
  (`zod/v4/core/schemas.js:970-972`), so any object schema in a client bundle trips the app's nonce policy.
owner: the next story that touches `apps/web/lib/style-pack.ts` or the New Project Sheet (Epic 6's style packs)
location: apps/web/lib/style-pack.ts (`stylePackSchema`, reached in the browser through `new-project-sheet.tsx`'s
  `PRESETS` import; `apps/web/lib/health-rule.ts`'s schema is reached only by server modules, checked 2026-09-17) ·
  packages/section-runtime/src/doc-schema.ts (the editor's fix, the pattern)
reason: out of this story's surface. The fix is `z.config({ jitless: true })` before the first schema a client bundle
  builds — global to zod, so where it sits decides which pages it covers; the editor's harness step 5 is the control to
  copy (an init script reporting violations, and a nonce-carrying script's `new Function` on a timer as the positive
  control).

## Deferred from: Story 5.1's Deploy run (2026-09-17)

### DW-175: about one request in a hundred to app.inflozo.com gets no answer at all

plain: Now and then a page on the app never starts loading: the browser connects, asks, and waits forever. It happened
  on the sign-in page and on the editor alike, about once in a hundred tries from the machine that runs our checks. A
  refresh fixes it, but a customer who meets it thinks the product is broken, and our automated checks stop half-way.
status: open
severity: medium
origin: Story 5.1's Deploy run (2026-09-17), against `dpl_2r2ERRnFejqV3F5H4dxejKH7gc4y` (production, built from
  `e8745189`). `tools/probe/run-verify-editor.cjs` stopped twice on a 30s timeout, both signed in (`GET
  /projects/<id>/post`, then `page.goto('/')`). Scratch probes from this machine, then:
  - 80 signed-in GETs over `/`, the editor, `/post` and `/tag`: one gave no status in 60s, and the rest had a max of 1.5s.
  - 120 more: one gave no headers in 45s and carried no `x-vercel-id`.
  - 150 interleaved rounds: signed-out `/sign-in` hung **3**, signed-in `/projects/<id>/tag` hung 0, and a direct
    `GET SUPABASE_URL/auth/v1/user` hung 0. So it is neither signed-in work nor the proxy's `auth.getUser()`.
  - 150 fresh `curl`s of `/sign-in`: one `000` with dns 0.002s, tcp 0.013s, tls 0.035s and **no first byte in 20s**, to
    216.150.16.65. The connection and TLS are up, then nothing comes back.
owner: the next story's Deploy (5.2): repeat the interleaved probe and the fresh-connection `curl` loop once. If the rate
  holds, take the timestamps and the IP to Vercel support. If it is gone, close this with the two runs as the record.
location: none in the repo. Between this machine and Vercel's edge (`bom1` → function `fra1`), on routes that predate
  this story (`/sign-in` is Story 1.3's).
reason: not a code change, and one vantage point cannot tell Vercel's edge from the network path to it. GitHub
  Actions would be a second vantage point, but `GITHUB_TOKEN` cannot dispatch a workflow (403). The probes are
  scratch files, not committed. Their shape: a throwaway account through the Auth Admin API, deleted in `finally`, and
  `fetch` with an `AbortController` per request.

## Deferred from: code review of spec-5-2-hover-selection-and-the-insertion-affordance (2026-09-17)

### DW-176: a change of canvas clears the selection, and nothing can reach that code yet

plain: When you move from the Home page to the Post page inside the editor without reloading, any section you had
  selected should be let go. The code that does this exists, but nothing in the editor can trigger it yet: today
  every way of changing page reloads the editor, which starts fresh anyway. The first control that changes page
  without a reload is Story 5.5's template switcher, and that story's checks will walk it.
status: done 2026-09-18 (Story 5.5)
severity: low
origin: Story 5.2's code review (2026-09-17, verification-gap layer): `editor.tsx`'s `[key]` effect sets
  `selected` to null before repainting, and the spec's Tasks say "A change of canvas (`key`) clears the selection",
  but `run-verify-editor.cjs` reaches `/post` only by `page.goto` and `goBack`, both document loads that remount the
  editor. Removing the two lines passes every step.
owner: Story 5.5 (the switcher is the first soft navigation between canvases; `epics.md` carries the criterion).
location: `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`, the `useEffect` on `[key]`.
reason: a soft navigation can be faked from the harness only through Next's private `window.next.router`, which
  is not a product path; the real one arrives with 5.5.
closed: Story 5.5 built D5b's switcher, which pushes inside a `useTransition` while the `[id]` layout holds the
  editor mounted — the product path the ledger was waiting for. `run-verify-editor.cjs` step 41 selects a section,
  presses another canvas's row, and reads THREE things: no `load` on the page (NOT `framenavigated`, which fires for a
  soft push too and is no test at all — corrected at the review, 2026-09-18, to what the harness really counts), a stamp on the editor
  window AND one on the canvas document's `<html>` both surviving (a document load clears the first, a re-created
  iframe the second), and the selection and the Controls panel gone. Step 6's Back walk is now the same two pushes
  followed by two Backs, with both stamps still there at the end — so the `[key]` effect is walked twice per run and
  deleting its two lines now fails. Its sibling finding stands unchanged and un-acted-on: the effect clears
  `selected` but not `hovered`, which is correct, because `paint()` clears the hover itself (the pointer has not
  said where it is since the repaint).

## Deferred from: Story 5.3's Create run (2026-09-17)

### DW-177: four designs in the library are named by no story, so nothing would build them

plain: Four designs that are drawn and written up for your library — Reveal (Headers), Triple (Announcement Bars),
  Overlap Card (Heroes) and Ledger (FAQ) — appear in no story of the plan, so as the plan stands nobody would ever build
  them. In each of those four categories one design number was retired, and the stories' ranges stopped one design short.
status: open
severity: high
origin: Story 5.3's Create run (2026-09-17). The icon sweep noticed three; the check was then derived for every category
  rather than trusted: each design `tools/export-roster.py` lists as not deleted, compared with the `#n Name` pairs the
  Epic 9 and Epic 10 stories name in `epics.md`. Four come back — A1·16 Reveal, A2·15 Triple, A4·18 Overlap Card and
  A9·15 Ledger — and each has a frame (`A1-16 Reveal.dc.html` and the rest) and a spec entry. Each of those categories has
  a retired number (A1·9, A2·13, A4·15, A9·12), and its owner-gate story names one design fewer than the roster holds:
  Story 9.4 builds #13–15, 9.8 #12 and #14, 10.5 #16 and #17, 10.25 #13 and #14.
owner: the owner's word on the plan first, then each category's owner-gate story names its missing design — Story 9.4
  (A1, #16 Reveal), 9.8 (A2, #15 Triple), 10.5 (A4, #18 Overlap Card), 10.25 (A9, #15 Ledger); and the next story that
  touches `tools/story-board.py` or `tools/doc-audit.py` adds the derived check, so a roster design no story names fails
  the gate.
location: `_bmad-output/planning-artifacts/epics.md` Stories 9.4 (:3664), 9.8 (:3770), 10.5 (:4026), 10.25 (:4556) ·
  `tools/export-roster.py` (the roster)
reason: E9 and E10 promise that every design ships, and a range written into a story went stale when a number was
  retired — the standing rule that counts are derived, not written down. Not Story 5.3's to fix: the plan is the owner's,
  and the durable fix is a check where the story list is read. The derivation to repeat: for each category in the roster
  that is not deleted, every design whose `deleted` is empty must appear as `#<n> <Name>` in some `#### Story 9.x` or
  `#### Story 10.x` of that category (a first story names its four in its acceptance criteria).

### DW-178: the design notes disagree with themselves about icons, in four places

plain: The design notes contradict each other about icons: whether the social icons in a header or a contact section are
  ones you pick or simply follow the platform Ghost names, and whether a stats design's icon has anywhere to be stored.
  The story that builds each of those categories has to ask you first, or it will guess.
status: open
severity: medium
origin: Story 5.3's Create run (2026-09-17), the icon sweep over every category spec, each line read:
  - `A1 Headers - Spec.md:116` — A1·8's strip and A1·14's cluster make each social glyph "a P0·2 icon slot (defaults
    from the Icon Picker's Social/Brands group, swappable)".
  - `A16 Contact - Spec.md:436` — `socials[]` with a source "From Ghost (version-gated) · Authored" and glyphs from the
    Icon Picker.
  - `A3 Footers - Spec.md:61` — "The split is withdrawn by the owner's ruling of 29 August 2026: there is one source, and
    it is Ghost": the theme ships a glyph per platform, and the glyphs "are no longer picked per row".
  - `A10 Stats and Numbers - Spec.md:43` offers "Icons: None (default) · Shown" with "the slot above the value", and the
    shared field list at `:49` names no icon field.
owner: Story 9.1 (A1's content model: whether A1's social glyphs are slots, asked in R-83's shape if the 29 August
  ruling does not already settle it), Story 10.50 (A16's content model, the same question), Story 10.26 (A10's content
  model: the icon field's name and type)
location: the four spec lines above, in `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/`
reason: the export is Claude Design's and is never edited (R-74); a disagreement inside it is settled by the owner at the
  story that authors the content model, not by whichever reader meets it first. Found while planning where the canvas
  icon slot is built (Story 5.3's Question 1), and not that story's to settle.

### DW-179: the pilot sections declare words plain that their own design notes give bold, italic, underline and link

plain: On your pilot page some words cannot be made bold, italic, underlined or linked — the Hero's big headline and
  eyebrow, its button words, Newsletter's button, Post Grid's eyebrow — although each of those sections' design notes say
  every word you write on a section takes all four. The pilots were written before inline editing existed, and each
  category's own story rewrites its content model anyway, so that is where they are put right.
status: open
severity: medium
origin: Story 5.3's Create run (2026-09-17), read in the pilots' `content.json` and in their category specs. The P0 rule
  (`P0 Editor Primitives - Spec.md:131-149`): a text field defaults to the four marks, "Where a spec says nothing, the
  default four apply. Silence is not a narrowing." Each pilot category's spec says every visible authored text takes the
  P0·1 toolbar: `A1 Headers - Spec.md:43`, `A4 Heroes - Spec.md:61`, `A17 Post Grids - Spec.md:1168`,
  `A22 Newsletter - Spec.md:323`. The registry format carries marks only on a `richtext` prop (`validate.ts`
  `marks-on-plain-prop`), and the pilots declare these visible words `text`: A1 `ctaLabel`; A4 `eyebrow`, `headline`,
  `primaryAction.label`, `secondaryAction.label`; A17 `eyebrow`, `linkLabel`; A22 `buttonLabel`, `proofLine`,
  `subscribedText`, `manageLabel`. Story 5.3 follows the schema, so on the canvas those fields show no toolbar.
owner: each category's content-model story — Story 9.1 (A1), Story 10.1 (A4), Story 10.54 (A17) and Story 10.75 (A22)
  — which authors the category's shared content model once (AD-35: a pilot is provisional and a defect in it goes
  to its owning category).
location: `packages/library/designs/a1/content.json`, `a4/content.json`, `a17/content.json`, `a22/content.json`
reason: not Story 5.3's to change: `packages/library/designs/` is the owning categories' (AD-35), and a prop's type
  decides its panel editor and the harness's typing path. Two things for the category story to settle while it is
  there: a label that is itself a link (an `<a>`) cannot also hold a link mark, since anchors do not nest, so such a
  field narrows `a` away; and a button label's marks are the category's choice.

### DW-180: a character limit truncates, where A10's design notes ask for a counter that advises

plain: A field with a character limit now stops accepting letters at it, on the page and in the panel, and says so. A10
  — the stats and numbers designs — asks for the opposite in its own notes: a counter beside the field that warns as you
  approach the limit and lets you past it, because a number's label reads badly when it is cut off mid-word.
status: open
severity: low
origin: Story 5.3 (2026-09-18), which built FR-D4's hard limit (`PropDef.maxChars`, refused at `beforeinput` and clamped
  in `replaceRange`). Found in `A10 Stats and Numbers - Spec.md:43` and again at :1093 — "the editor's character counters
  advise rather than truncate".
owner: Story 10.26 (A10 — the content model, the stylesheet and designs #1–4), the first category story whose spec asks
  for one
location: `packages/library/src/registry.ts` (`PropDef.maxChars`) · `packages/library/src/validate.ts`
  (`max-chars-*`) · `apps/web/lib/inline.ts` (`limitSentence`, the `max` clamp) ·
  `apps/web/components/controls/rich-field.tsx` (`LimitCaption`) · `A10 Stats and Numbers - Spec.md:43,1093`
reason: no design in the library declares `maxChars` today — the controls fixture is the only one that does, for the
  review page — so nothing is truncated that a design asked to advise. A10 is where the two meet, and the choice is the
  category story's: a second declaration (`softMax`, a counter that colours and never refuses) beside the hard one, or
  the hard limit with A10's notes re-ruled. Building an advisory counter now would be a control no design uses.

## Deferred from: code review of spec-5-3-inline-editing-the-four-marks-and-the-link-picker (2026-09-18)

### DW-181: a paste from Google Docs, Word Online or Apple Notes loses its bold and italic

plain: When you copy words from Google Docs, Word on the web or Apple Notes and paste them into a section, the bold and
  italic do not come with them — only the words. Those apps write bold as a styled span rather than as a bold tag, and
  the paste reader keeps only the four real tags. Pasting from a web page, an email or Ghost's own editor keeps them.
status: open
severity: low
origin: Story 5.3's code review (2026-09-18, blind-hunter layer). The spec's matrix says `span style` "arrives as its
  text", which is what `readMarks` does; the finding is that the most common sources of a formatted paste use exactly that.
owner: none yet — the first story that hears it from a user, or Story 5.8 (saving), whichever comes first
location: `packages/section-runtime/src/marks.ts` (`readMarks`, `TAG_MARKS`)
reason: reading `font-weight`, `font-style` and `text-decoration` from inline styles is a rule the spec did not take —
  where the threshold sits (600? 700? `bold`?), and whether a styled span inside a `<b style="font-weight:normal">`
  wrapper (Google Docs' shape) is bold — is a decision, not a patch. Nothing unsafe happens meanwhile: the words arrive.

### DW-182: two rules of the editing session that no harness on the pilots can reach

plain: Two things the story builds cannot be checked automatically on your pilot page: the small pill that says "holds
  40 characters" when you type past a limit on the page (no pilot section has a limit — only the review page's sample
  does, and that page has no canvas typing), and the rule that switching to another window keeps your cursor where it
  was (the test browser cannot pretend to lose the window). Both work by reading; both are checked by hand.
status: open
severity: low
origin: Story 5.3's code review (2026-09-18, verification-gap layer): `editor.tsx`'s `onRefused` → `CanvasNote` with
  `kind: 'limit'`, and `inline.ts`'s `onFocusOut` guard `win.top?.document.hasFocus() === false`.
owner: the first category story whose design declares `maxChars` (DW-180 names Story 10.26) for the pill; the window
  rule stays a manual check
location: `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` (`onRefused`) · `apps/web/lib/inline.ts`
  (`onFocusOut`) · `tools/probe/run-verify-editor.cjs`
reason: the editor harness runs on "Pilot sections" and no pilot is this story's to edit (AD-35); the first design that
  declares a limit brings the pill within reach of its own harness step.

## Deferred from: the second code review of spec-5-3-inline-editing-the-four-marks-and-the-link-picker (2026-09-18)

### DW-183: the editor harness has no retry, so one production stall costs the whole run

plain: The automatic check of the editor runs on the live site with a throwaway account. Now and then the live site
  takes longer than the check's thirty-second patience to answer one page that needs you to be signed in, and the whole
  check stops there — with nothing wrong found and the throwaway account cleaned up. Running it again goes through. It
  costs time, not correctness, but it can hide a real failure behind a stall.
status: open
severity: low
origin: Story 5.3's second code review (2026-09-18, real-infra layer): runs 1 and 2 of `run-verify-editor.cjs` against
  `https://app.inflozo.com` stalled on step 6's signed-in `request.get` and step 7's `page.goBack` respectively, each a
  Playwright 30-second `TimeoutError` with 0 FAIL and `users 9 → 9`; unauthenticated `curl` to the same URLs answered in
  under a second six times in a row, and DNS resolved the same through the stub and `@1.1.1.1`.
also: Story 5.4's Dev (2026-09-18) added the third and fourth observations and NAMED THE PATTERN, which is the thing
  this entry was held open for. Run 2 stopped at step 6's `fourOhFour` signed-in `request.get` (`GET /projects/abc`),
  30s, **0 FAIL across 201 checks**, `users 9 → 9`. Run 4 stopped at step 16's `page.goto(editorUrl())`, **0 FAIL
  across 83 checks**. Run 6, on the reverted tree, stopped at THE SAME call site as run 4 — step 16's
  `page.goto(editorUrl())` — at 30s, 0 FAIL across 83 checks. THE PATTERN: every stall is a SIGNED-IN load of the
  deployed app, while an unauthenticated request to the identical URL answers in ~0.4s at a load average under 1 — a
  cold serverless function on an authenticated route, not the app and not a hidden failure. (An earlier draft of this
  entry said the stalls never repeat a call site; runs 4 and 6 falsified that, and step 16's `goto` is now the most
  frequent of them — which makes it the one to instrument first.) It is also not a fixed duration: run 4 exceeded 60s
  twice on that goto and run 6 exceeded 30s on it, so patience alone is not the answer.
  **TWO CANDIDATE FIXES ARE NOW RULED OUT BY EXECUTION, which is most of what a later story needs from this entry:**
  (1) **Never retry `page.goBack`.** A timed-out history move may already have navigated, so a second one goes back
  twice: it answered `net::ERR_ABORTED; maybe frame was detached?` the moment it was tried.
  (2) **Never retry `page.goto` blindly either.** Step 1 signs in by MAGIC LINK, whose token is single-use, and the
  retry fired on exactly that URL — a second `goto` re-spends a consumed token, so a retry there can manufacture a
  sign-in failure that never happened.
  A 60s default plus one retry was tried on both and withdrawn in the same session: run 4 exceeded even 60s TWICE on
  one `goto`, so the patience did not buy the stall out, and while it was in place step 5's `securitypolicyviolation`
  control stopped seeing its own two planted eval refusals (`[]`, twice, and a 4-second wait for them did not help,
  so it was not timing). Under standing rule 2 a control that does not pass voids the result it guards, so a change
  that breaks one is worse than the intermittent stall it was meant to fix. Reverted.
  **CORRECTED AT REVIEW (2026-09-18): the control did not fail because of the retry.** The retry commit (`ad50f413`)
  had deleted `await recorder(context, violations)` — the one line that attaches the `securitypolicyviolation` binding
  to the main session — while inserting its own comment block, and the withdrawal (`35a17b53`) touched comments and
  the wait loop only, so at Dev's final tree the main session's `violations` had NO WRITER and the control could not
  pass on any tree. The Review restored the line (with the history beside it) and run 8 is the control's confirmation.
  What stays true of this entry: a blind retry of `goBack` or of the magic-link `goto` is still wrong for the two
  reasons above. What does not: "the retry breaks the control" — it never did, so a retry of the idempotent signed-in
  loads alone is back on the table for whoever takes this.
owner: the first story that touches the harness's session (Story 5.8's saving, or the next editor story with a new step)
location: `tools/probe/run-verify-editor.cjs` (its signed-in navigations, and `main().catch`)
reason: the pattern is now named and two shapes of fix are excluded, but the remaining one — retrying only the
  genuinely idempotent, non-auth navigations, or making the stall visible as a NOTE and re-running just that step —
  still has to be built without disturbing step 5's control, and that control is the harness's own proof. Whoever
  takes it should change the retry and the control's reliability in separate commits, and run the harness twice after
  each, because the interaction between them is exactly what was not understood here.

## Deferred from: the planning of spec-5-4-the-layers-panel-reordering-and-the-two-kinds-of-singleton (2026-09-18)

### DW-184: B7's "we say so the first time, then stop" has no first time to remember before saving lands

plain: The Layers panel carries a line saying that editing your header, announcement bar or footer changes it on every
  page. The drawing says we show that line the first time and then stop. Nothing about you is remembered between
  visits until saving arrives, so for now the line is simply always there.
status: closed
severity: low
origin: Story 5.4's planning (2026-09-18) — `B Missing Surfaces.dc.html` B7's footed note, "Editing a site-wide section
  changes it on all N templates. We say so the first time, then stop."; nothing writes `project_templates`,
  `project_template_prefs` or `profiles` before Story 5.8
closed: Story 5.4's Dev (2026-09-18) — **the note itself is gone, so there is no "first time" left to remember.** The
  owner's finding on the deployed story was that the line repeats what the Site-wide heading already says, and
  **R-126** removed it. An entry that exists only to decide WHEN a sentence should stop being shown is answered by
  deleting the sentence; nothing is deferred to Story 5.8 by it any more. The warning it carried is not lost — a
  site-wide Delete or Hide still opens a confirm naming every template (`editor.tsx`), which is the moment it matters.
owner: closed by Story 5.4
location: `apps/web/components/controls/layers.tsx` (the note, removed) ·
  `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` (R-126)
reason: a session-only "first time" would have made the line come and go between reloads; the owner's answer was that
  the line should not be there at all, which retires the question rather than answering it.

### DW-185: the control register gives a Member visibility row to more categories than the PRD's four CTA-bearing ones

plain: The setting "who can see this section" is meant for sections that ask the reader to do something. The
  requirements name four kinds of section. The table built from the drawings gives the row to more than that. Someone
  has to say which list is right before those sections are built.
status: open
severity: medium
origin: Story 5.4's planning (2026-09-18) — `prd.md` :909 and Appendix C's Member Visibility row name A2, A6, A22 and
  A26; `packages/library/control-groups.json` carries a `"Member visibility"` entry for a4, a5, a6, a7, a8, a9, a16,
  a21, a22 and a29 as the file stands, and `A4-13 Latest Post.dc.html:256` and `A22-1 Inline Row.dc.html:69` both draw
  the row
owner: the first E9/E10 category story whose designs the two lists disagree about, with the answer put to the owner in
  R-83's shape — R-74 and DW-111 make a drawn panel win over a spec table, so the PRD is the likelier of the two to be
  corrected
location: `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` (:909, Appendix C) ·
  `packages/library/control-groups.json`
reason: Story 5.4 draws the row for whichever section carries it and reads the register rather than the PRD's list, so
  nothing it builds depends on the answer; the two pilots it is tested on, a4/13 and a22/1, appear in both lists.

### DW-186: "who can see this section" must never become a design control, or the value would exist twice

plain: Who a section is shown to is kept on the section you placed, not among the design's own settings. If someone
  later writes it into a design's settings list as well, the editor would hold the same answer in two places and they
  could drift apart.
status: open
severity: medium
origin: Story 5.4's planning (2026-09-18) — Story 4.10 already gates a section through `RenderInput.visibility`
  (`core.ts` :200-202, `gateMembers` :1484-1500) on both emitters; a declared control would additionally stamp
  `data-member-visibility` on the root through `stampControls`, a second copy nothing reads. The category specs list
  `memberVisibility` in their control tables (`A22 Newsletter - Spec.md:291`) — that describes the panel ROW, not a
  `controlSchema` entry.
owner: each E9/E10 category story that builds a CTA-bearing design — **the rule itself landed in
  `docs/section-authoring.md` § 2 on 2026-09-18 with R-124, so what is left here is the validator's refusal**
location: `docs/section-authoring.md` · `packages/library/src/validate.ts` ·
  `packages/section-runtime/src/doc-schema.ts` (`memberVisibility`, the one place it is stored)
reason: no built design declares it and `tools/check-snapshots.mjs` reads only declared settings, so nothing can go
  wrong today; the refusal is one line in the validator and belongs with the first design that would trip it.

### DW-187: dragging inside the Site-wide card cannot move a footer above a header on the canvas

plain: Your header, announcement bar and footer are listed together in one card at the top of the Layers panel. The
  page always draws footers last, whatever order that card is in, so dragging a footer above a header would change the
  list without changing the page.
status: open
severity: low
origin: Story 5.4's planning (2026-09-18) — `apps/web/lib/editor.ts`'s `canvasStack` (:47-51) splits the site doc by
  `designId.startsWith('a3/')` and draws the footers last; the seeded "Pilot sections" project holds one site-wide
  section, so the case cannot be reached on it
owner: Story 5.5 (the template switcher and the synthesised templates), or the first story that seeds a footer beside a
  header
location: `apps/web/lib/editor.ts` (`canvasStack`) · `apps/web/components/controls/layers.tsx`
reason: no project in the repo holds both a header and a footer, and "footers compile last" is the compiler's rule, not
  the list's — whether the card should refuse that drop or the canvas should follow it is a decision, not a patch.

### DW-188: hovering a Layers row does not outline its section on the canvas

plain: Hovering a section on the page highlights its row in the list on the left. The other way round does nothing —
  put the pointer on a row and the page does not show you which section it is. Nothing asked for it; it is noted here
  so the decision is a decision.
status: open
severity: low
origin: Story 5.4's Dev (2026-09-18) — the mirroring Story 5.2 built runs ONE way (`editor.tsx`'s `point()` sets
  `data-inflozo-hover` from the canvas's own `pointerover`, and `controls/layers.tsx` draws the wash from `hoveredKey`);
  no frame draws the reverse, and no FR or ruling asks for it
owner: Story 5.9 (the keyboard map, and keyboard completeness) or 5.23's play-loop gate, whichever first finds a user
  cannot tell which section a row is
location: `apps/web/components/controls/layers.tsx` · `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`
  (`point`) · `apps/web/lib/canvas-chrome.css`
reason: the section's name is on its row and its name tag is on the canvas, so nothing is unreachable today; the
  reverse hover would also have to decide whether a hovered row scrolls its section into view, which is a product
  decision the owner has not been asked.

### DW-189: a pill-grip drag over a site doc measures its landing in canvas order, and the site doc is stored in doc order

plain: The little grip on the hover pill lets you drag a section up or down the page itself. For the shared header and
  footer it works out where you dropped by looking at where the sections sit on the page, while the list on the left
  keeps them in the order they are stored. Today the shared group holds one section, so the two orders cannot differ.
status: open
severity: low
origin: Story 5.4's Review (2026-09-18, Edge Case Hunter) — `editor.tsx`'s `screenRows()` hands `landingAt` the site
  doc's instances in DOC order with each one's on-screen top; DW-187 records that the `a3/` footers compile last
  whatever the doc order, so a site doc holding a header after its footer would count the landing against a footer
  that is drawn at the bottom
owner: Story 5.19 (the site-wide footer story) or whichever story first seeds a site doc with two instances
location: `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` (`screenRows`, `pillGrip`)
reason: unreachable while the seeded site doc holds one instance; the fix is to drag the site group by the Layers
  list's own layout (doc order) rather than by screen rects, or to sort the rects into canvas order first

### DW-190: a refusal shown "where the action was pressed" has nowhere to go when the section has no root

plain: FIXED 2026-09-20 (Story 5.10) — the Section Picker is the refusal's home. A refused placement now says so in
  the picker's own line, above the cards, where the press was; nothing is written and the picker stays open. The
  older case the entry was opened for — a refused COPY of a hidden or member-gated section, which has no root to
  put a note on — is unchanged and still unreachable, because the library holds no A25 design to refuse.
status: closed
severity: low
origin: Story 5.4's Review (2026-09-18, Blind Hunter) — `editor.tsx`'s `refuse()` skips `showNote` when `rootOf(pick)`
  is null; only R-37's Post Content refusal can reach it and `packages/library/designs/` holds no A25 design yet
owner: Story 5.10 (the Section Picker, which draws the refusal surface for placement)
location: `apps/web/components/editor/section-picker.tsx` (the `refusal` line) and
  `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`onPlace`, which routes the sentence there
  rather than through `refuse`)
reason: unreachable on the deployed editor until an A25 design exists, so it is proved by
  `packages/section-runtime/src/doc-edit.test.ts` (`insertSection` answering R-37's sentence) rather than by a walk

## Deferred from: the planning of spec-5-5-the-template-switcher-and-the-synthesised-templates (2026-09-18)

### DW-191: the A24 pilot compiles to `post.hbs` only, so `page.hbs`'s Synthesis Default loses its header

plain: When you open a Page you have never touched, Inflozo is meant to build it for you from a standard recipe —
  a page header, then the page's body. The header design exists in the library, but it is currently marked as
  belonging to blog posts only, so the recipe drops it and the Page canvas comes up empty. Nothing is broken; the
  provisional pilot was narrowed and the category that owns that design widens it.
status: open
severity: medium
origin: Story 5.5's Create run (2026-09-18), executed against the repo: `packages/library/designs/a24/1` declares
  `compileTarget: ['post.hbs']`, while `sections-inventory.md:824` puts **A24 #1 Centred** at row 1 of `page.hbs`'s
  default stack and `A24 Post Headers - Spec.md:226` says in so many words "A24 compiles to `page.hbs` as well as
  `post.hbs`". So the narrowing is the pilot's, not the design's.
owner: A24's category story (Post Headers, Epic 10), which sets the category's real `compileTarget`s — AD-35: a
  defect in a provisional pilot goes to its owning category, never to the story that noticed it.
location: `packages/library/designs/a24/1/design.json` · `sections-inventory.md:822-826` ·
  `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/A24 Post Headers - Spec.md:226`
reason: Story 5.5's `synthesize` drops a default row whose design the library cannot place on that file and reports
  the reason, so the gap is visible rather than silent; it closes itself the moment A24's targets are correct, and
  `synthesize.test.ts` derives the dropped set from the library rather than listing it, so nothing goes stale.

### DW-192: the Private row's condition is drawn as a circle — "designed" cannot be reached

plain: The Private page — the one a visitor sees when your whole site is locked — is only meant to appear in the
  template menu when your site actually needs it. The drawing says it appears "once a Private Site Gate section has
  been designed", but you cannot design a page that is not in the menu, so as drawn it could never appear at all.
  The requirements say something different and workable: it appears once a private gate is *called for*.
status: open
severity: low
origin: Story 5.5's Create run (2026-09-18). `D5 Canvas Markers and Template Switcher.dc.html` D5b's own caption
  (:263) reads "PRIVATE APPEARS ONLY ONCE A PRIVATE SITE GATE SECTION HAS BEEN DESIGNED · OTHERWISE THE ROW IS
  ABSENT, NOT GREYED"; `prd.md:223` (FR-D6) reads "it appears once a Private Site Gate (Appendix A §31) is called
  for … opens empty, and compiles `private.hbs` only when designed", and adds that without the canvas "that design
  is a launch deliverable with no surface that can create it". Behaviour is the PRD's to decide and the export's to
  draw (build-sequence standing rule 6), so Story 5.5 builds FR-D6's wording: the row appears when the project's
  linked site reports itself private.
owner: the first story with a linked private site to try it on — Story 5.18 (live content from the connected site)
  is the nearest, and Story 7.3 owns the matching `private.hbs` emission rule.
location: `apps/web/lib/editor.ts` (the conditional canvas) · `prd.md:223` · D5b's caption ·
  `sections-inventory.md:787`
reason: unobservable on "Pilot sections", which links no site (`projects.linked_site_id` is null), so Private is
  absent under either reading and the choice costs nothing to defer; recorded rather than resolved because settling
  it needs a real private Ghost, which is an execution, not a reading (standing rule 1).
amended: Story 5.5's Dev (2026-09-18) executed two things the owning story inherits. **(1) There is nothing to read
  yet.** `sites.site_settings` — the snapshot Epic 3 keeps — records `code_injection`, `portal_button`,
  `announcement`, `brand`, `public_url` and `plan_ask`, and no private flag, because no story has needed one; so no
  condition can be true and Private is offered to nobody. **(2) The refusal has to be SYNCHRONOUS.** Story 5.5 first
  built the 404 as a database read inside `[template]/layout.tsx`, and measured on a production build the status was
  still 404 while the BODY was Next's bare `__next_error__` document — none of the app's 404, no way home — where
  every synchronous refusal beside it (`index`, `paywall`) answered the app's own. A `notFound()` thrown after an
  await lets Next flush the shell first, which is `[id]/layout.tsx:12-17`'s rule met from the other side. So
  `canvasFromSegment` refuses a `CONDITIONAL` segment from the scheme, and the story that gives the condition
  something to read must solve the body problem — a decision above the layout, or a refusal that needs no I/O — in
  the same change.

### DW-193: production's `template_key_shape` refuses every `custom:` key — the regex carries two backslashes

plain: The three membership pages (Signup, Signin, Member home) are stored under names like
  `custom:custom-signup.hbs`. The database has a rule about which names it accepts, and that rule was typed with one
  backslash too many — so today it would REFUSE all three. Nothing is broken yet, because the editor does not save
  anything until Story 5.8. The day it does, saving a membership page would fail unless this is fixed first.
status: done 2026-09-19 (Story 5.8, Schema phase)
resolution: Story 5.8's Schema phase (2026-09-19) — `supabase/migrations/20260919120000_doc_sync_and_template_key_shape.sql` drops and re-adds `template_key_shape` with ONE backslash on BOTH tables, and
  `SCHEMA.sql` carries the same, so the RLS gate's schema diff holds them together. APPLIED BY HAND through
  `SUPABASE_DB_POOLER_URL` (PostgreSQL 17.6, 2026-09-19) and proved there inside a rolled-back transaction:
  all three `custom:custom-*.hbs` keys INSERT where they were refused with `23514`, and the control that
  named the cause — `custom:custom-signup\xhbs`, a literal backslash and any character — is now REFUSED
  with `23514`. Zero `custom:%` rows left behind. The gate carries both assertions from this story onward
  (`RLS-TEST.sql`, Story 5.8's block), and the control ran: with the migration withheld the proof aborts at
  that insert, which is the hole the ledger entry named — the gate was green for it only because nothing
  here had ever inserted a `custom:` key.
severity: high
origin: Story 5.5's review, the Real-infra verifier (2026-09-18). EXECUTED on production through
  `SUPABASE_DB_POOLER_URL`, every insert inside a rolled-back transaction: `custom:custom-signup.hbs`,
  `custom:custom-signin.hbs` and `custom:custom-member-home.hbs` are each refused with `23514 template_key_shape`;
  `index` is accepted (the control that the probe could insert at all); `custom:custom-signup\xhbs` — a literal
  backslash and any character — is ACCEPTED (the control that names the cause). The stored pattern is
  `'^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\\.hbs$'`: with `standard_conforming_strings = on` the two backslashes reach
  the regex engine as an escaped backslash followed by "any character", not as an escaped dot. Zero `custom:%` rows
  were left behind.
owner: Story 5.8 (undo, redo and local-first persistence) — the first writer of `project_templates`. It therefore HAS
  a Schema phase (R-99): a migration that drops and re-adds the constraint with a single backslash, on BOTH tables
  that carry it, pushed and applied before the code that saves. Story 7.16 (the Routes Manager) inherits the same fix
  for `custom_templates`-backed keys.
location: `supabase/migrations/20260904120000_complete_schema.sql:254,269` · the architecture original
  `SCHEMA.sql:269,284` (the RLS gate refuses to run if the two drift, so they change together) ·
  `apps/web/editor.test.ts` (asserts the INTENDED pattern, which is how the claim passed `pnpm check`)
reason: not caused by Story 5.5, which writes no row — and a migration is its own phase, pushed first and applied by
  hand, never folded into a review's patch. What Story 5.5 DID do is assert in three places that the keys "already
  satisfy" the CHECK; that was a reading of the intended pattern, never an execution (standing rule 1), and the
  review corrected all three. `supabase/tests/run-rls-gate.sh` stays green because it never inserts a `custom:` key
  — the migration's story should add one, so the gate would have caught this.

### DW-194: `indexStack` trusts a designed Home — a hidden feed, a second feed, or a section page 2 cannot hold

plain: Page 2 of the blog is built from your Home page "from the main feed down". Today nobody can mark a section as
  the main feed (that control arrives with Story 5.19), so page 2 always falls back to the standard stack and this
  cannot go wrong yet. The day a feed can be marked, three cases need an answer: the marked feed is hidden, two
  sections are marked, or a section below the feed is one that is only allowed on Home.
status: open
severity: medium
origin: Story 5.5's review (2026-09-18), Blind Hunter and Edge Case Hunter, read in
  `packages/section-runtime/src/synthesize.ts` (`indexStack`): with a designed Home it returns
  `instances.slice(feed)` and `dropped: []` — it never asks whether those designs list `index.hbs` in
  `compileTarget` (DW-191's class of fault, which `synthesize` DOES guard), `findIndex` silently takes the first of
  several `isMainFeed` rows, `docSchema` has no "at most one" refine, `duplicateSection` copies the flag, and a
  hidden main feed still counts as the feed although FR-I1 says `index.hbs` never ships empty.
owner: Story 5.19 (the Data group, which is where a main feed is designated — FR-H2's "exactly one per paginated
  template") for the one-feed rule and the hidden case; Story 7.3 (which compiles `index.hbs` from `indexStack`) for
  the `compileTarget` filter, reporting the rest in `dropped` as `synthesize` does.
location: `packages/section-runtime/src/synthesize.ts` (`indexStack`) · `doc-schema.ts` (`isMainFeed`) ·
  `doc-edit.ts` (`duplicateSection`)
reason: unreachable today — no surface writes `isMainFeed: true`, and the owner's own project has none, which is
  R-127's second fallback. Guarding it now would mean deciding FR-H2's refusal wording before the story that owns it.
note (Story 5.16, 2026-09-22): `indexStack` is GONE — R-179 made page 2 an exact copy of page 1, and `pageTwoStack`
  replaced it (AD-27(d)). Two of the three cases are answered: the `compileTarget` blind spot, because a design that may
  sit on `home.hbs` now may sit on `index.hbs` (`placement.ts`'s `compilesTo`, which `read.ts`, `synthesize` and the
  Section Picker all ask), so the copy never holds a design page 2 cannot; and the hidden feed, which since R-179 is a
  real design of its own and still offers page 2. What STANDS, for Story 5.19: several `isMainFeed` rows (`mainFeedOf`
  and `findIndex` take the first), `docSchema`'s missing "at most one" refine, and `duplicateSection` (⌘D on a main
  feed) copying the flag — which page 2's copy of page 1 now also carries onto page 2, by design (R-179).

## Deferred from: Story 5.6's Create run (2026-09-18)

### DW-195: AD-30 says a dark override "needs no second attribute" — true on the canvas, and not expressible in a shipped theme

plain: You can pick a different background for a section's dark version, and on the editor's canvas that works
  exactly as promised. What nobody has decided yet is how the theme we build for your real site carries that
  difference — the rules we wrote for ourselves rule out every obvious way of doing it. Nothing is broken and
  nothing you set is lost; the choice is stored. The compiler story has to settle it before dark overrides can
  reach a visitor.
status: open
severity: high
origin: Story 5.6's Create run (2026-09-18), read in the normative documents. `ARCHITECTURE-SPINE.md:345`
  (AD-30) says **Background role** "is a Style Pack swatch role, so it resolves through the token block and
  needs no second attribute at all". On the canvas that holds, because the canvas has a live `data-mode` and a
  dark override is simply a different `data-bg` while dark is shown. In a theme there is one visitor and one
  markup: `data-bg="base"` cannot also be `data-bg="contrast"` for a dark visitor, and the same paragraph
  forbids the three ways out — a `data-{control}-dark` twin ("never a `-dark` twin"), a mode-scoped selector in
  a design stylesheet ("a design stylesheet that names `prefers-color-scheme`, a scheme class or `data-mode`
  fails the build", `:347`), and a second attribute set. AD-3's only inline-`style` carve-out is "a CSS custom
  property from **bound Ghost data**, and nothing else" (`:109`), so an inline per-section property is out too.
  The invariant the paragraph wants to keep — "the token block and the base stylesheet are the only files in a
  generated theme that mention a mode" — is compatible with a per-instance custom property emitted INTO the
  token block, but no document says that and nothing in the repository emits it.
owner: Epic 7's theme-assembly story (FR-J3/§7.3, the `default.hbs` token block), which is the first thing that
  must express a dark override to a visitor — and an AD-30 amendment recording whichever expression it picks.
  Raise it at that story's Create, not later: by then the library may hold authored overrides.
location: `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md:345`
  and `:347` (AD-30) · `:109` (AD-3's carve-out) · `packages/section-runtime/src/tokens.ts:165-186` ·
  `_bmad-output/implementation-artifacts/spec-5-6-light-and-dark-authoring.md` § Design Notes
reason: Story 5.6 is the editor, and Epic 5 deploys nothing — the override is stored faithfully and previewed
  honestly, so nothing is at risk now and settling the emission here would mean inventing a compiler convention
  in an editor story. Standing rule 6: flag, do not guess. Deciding it needs the compiler in front of you.

### DW-196: `darkCapabilities` is declared on every design and read by nothing

plain: Every section design in our library carries a note saying how much dark-mode support it has. Nothing in
  the product ever looks at that note. Either something should use it, or it should go — right now it is a field
  authors have to fill in for no effect, which is how a field quietly starts saying something untrue.
status: open
severity: low
origin: Story 5.6's Create run (2026-09-18), executed over the repository: `darkCapabilities: string[]` is
  declared on `DesignJson` and on `SectionRegistryEntry` (`packages/library/src/registry.ts:136`, `:178`) and
  copied through `buildEntry` (`:229`); a grep for the name across every `.ts`/`.tsx`/`.js`/`.cjs`/`.mjs` in the
  repository returns those three lines, one test fixture (`validate.test.ts:415`) and nothing else. Its
  vocabulary is unvalidated — a bare `string[]`, so any word passes — and all five pilots plus both fixtures
  declare exactly `["tokens"]`. Story 5.6 needed none of it: the engine keys on each control's own
  `darkOverride` declaration, which is the thing that actually decides whether a control is mode-scoped.
owner: unowned — needs one. Candidates: Epic 6's Style Pack stories (where "what dark support does this design
  have" is a pack-facing question), or the first category story that authors a design whose dark support is not
  just tokens. A reader with a validated vocabulary, or deletion; not a third state.
location: `packages/library/src/registry.ts:136`, `:178`, `:229` · every
  `packages/library/designs/*/*/design.json` · `packages/library/fixtures/*/design.json`
reason: no story needs it and inventing a consumer for it inside an editor story would be inventing a
  vocabulary the library's authors never agreed. Recorded now because the field is cheap to keep filling in
  wrongly — standing rule 7's shape: a declaration nothing reads is a declaration nothing can falsify.

## Deferred from: code review of spec-5-6-light-and-dark-authoring.md (2026-09-18)

### DW-197: the project-level "Clear dark overrides" writes doc by doc, with no transaction and no revision check

plain: Pressing Clear on Theme settings rewrites each page's saved design one after another. If one of those
  writes failed half-way you would be told it did not work while some pages had already been cleared, and if the
  editor were saving the same page at that moment the older copy could win. Neither can happen today, because
  nothing else saves a page before Story 5.8.
status: open
severity: medium
origin: Story 5.6's Review (2026-09-18), Blind Hunter and Edge Case Hunter, read in
  `clearProjectDarkOverrides`: a `for` over `project_templates` rows, one `update({ doc })` each, returning the
  error sentence on the first failed write with earlier rows already cleared; no `.eq('revision', …)`.
owner: Story 5.8 (FR-D8's journal and the revision contract) — it is the first story in which a second writer of
  `project_templates.doc` exists, and it decides what a guarded doc write looks like. This action adopts that.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` (`clearProjectDarkOverrides`)
reason: Inventing a revision check here would pre-empt 5.8's contract, and before 5.8 there is no concurrent
  writer to lose to. Review did close the two halves that were reachable: a zero-row write is now a refusal, and
  an unparseable doc is skipped rather than thrown.

### DW-198: no check reads a Background-role swatch's colour in dark, and the project-level Clear is proved on one section

plain: In dark, the little colour dots beside "Background role" should show the dark colours. They do — but no
  automatic check looks, so a future change could quietly put the light colours back. In the same way, the
  project-wide Clear is only ever tested with one overridden section on one page.
status: open
severity: low
origin: Story 5.6's Review (2026-09-18), Verification Gap: changing `swatches[mode]` to `swatches.light` in
  `pilots/review.tsx` or the editor fails nothing; `run-verify-editor.cjs` step 53 (b) plants one override on
  `home`'s first instance and reads only that back.
owner: Story 5.8 for the Clear (it makes a multi-canvas stored override reachable without planting rows by hand);
  the swatch read belongs to the next story that touches `run-verify-pilots.cjs`.
location: `tools/probe/run-verify-editor.cjs` step 53 (b) · `tools/probe/run-verify-pilots.cjs` ·
  `apps/web/app/(app)/app/(authed)/pilots/review.tsx`
reason: Both are coverage, not defects — the behaviour was read correct at Review — and the harness run is already
  long enough to time out on this machine's link.

### DW-199: nothing reads the editor skeleton's card, and it cannot hold 16:10 on a short, wide window

plain: While the editor loads you see a grey placeholder shaped like the page. On your 1440 screen it is the right
  shape. On a short, wide window the real page is shorter than the placeholder, so there would be a small jump when the
  editor arrives — and no automatic check looks at the placeholder's shape at all.
status: open
severity: low
origin: Story 5.7's Review (2026-09-19), Verification Gap + Acceptance Auditor: `aspect-[1440/900] max-h-full w-full`
  squashes rather than fits when the stage is height-bound (the file's own `ponytail:` note), and reverting the
  skeleton to its pre-R-137 shape fails no step of `run-verify-editor.cjs` (step 9 reads only the sr-only sentence).
owner: Story 5.9 (the editor's first in-`pnpm check` browser test), or the first story that sees the jump.
location: apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor-skeleton.tsx · tools/probe/run-verify-editor.cjs step 9
reason: Correct on the owner's 1440 stage, where Desktop is width-bound; a Suspense fallback has no `ResizeObserver`,
  so the fix is a CSS `min()` on the width and it changes if Question 3 adds bottom padding.

## Deferred from: Story 5.8's Dev run (2026-09-19)

### DW-200: the editor is handed EVERY placeable design, which is right today and will not scale past Epic 9

plain: When you open a page in the editor, the app sends your browser a copy of every ready-made section design it
  knows about, so it can draw anything your page might contain. There are five of them today, so that costs almost
  nothing. When the library grows to hundreds, sending all of them on every editor load will be too much.
status: open
severity: medium
origin: Story 5.8's Dev run (2026-09-19), found by EXECUTION rather than by reading — `run-verify-editor.cjs` step 67.
  `read.ts` used to hand over only the designs this project's STORED docs name. Since 5.8 the editor's LOCAL document
  can legitimately hold a design the server's does not: delete the only section using one, let the flush go up, reload
  — and undoing that deletion was refused by FR-D9's vanished-design guard as though the library had dropped the
  design, while a local doc naming it could not be painted at all, so the hydrate fell back to the cloud and threw the
  customer's work away. The fix was to hand over every placeable design (five, ~68 KB read from `pilotIds()` on
  2026-09-19), which is also what Story 5.10's "+ Add section" and Story 5.11's design swap will need.
owner: the first story of Epic 9 that takes the library past a couple of dozen placeable designs — it is the story
  that makes the payload a problem and the one that can measure it.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` (the `pilotIds()` loop and its `ponytail:`
  note) · `apps/web/lib/journal.ts` (`vanishedDesign`, the guard that surfaced it) ·
  `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (the hydrate's own library check)
reason: the shape of the durable answer is clear — the editor asks the server for a design when a doc names one it has
  not got — but it is a new route, a new cache and a new failure mode on the undo path, and none of it is measurable
  against a library of five. Doing it now would be inventing a budget for a payload nobody can weigh.
note (2026-09-20, Story 5.10's Fix, R-155): the SECTION PICKER's half of this is answered and does not wait for Epic 9
  — a preview frame is served `/canvas?design={id}`, one stylesheet rather than the library's (50,877 bytes a frame →
  ~16,000, measured). THIS ENTRY IS STILL OPEN: its subject is the editor's INITIAL payload, every placeable design
  handed over by `read.ts` on load, which R-155 does not touch.

### DW-201: the Projects page runs zod's `Function("")` probe, which the content-security policy refuses

plain: One of the code libraries the app uses quietly tests, once, whether the browser lets it build code on the fly.
  Our security policy says no — correctly — and the library carries on the slow, safe way. Nothing breaks and nothing
  is exposed, but the browser writes a "blocked" note each time the Projects page loads, which muddies our own checks.
status: open
severity: low
origin: Story 5.8's Review (2026-09-19), the Real-infra verifier, on the deployed site: `securitypolicyviolation`
  `script-src` / `eval` at `https://app.inflozo.com/`, source a `_next/static/chunks` file at the offset of zod's
  `try{return Function(""),!0}`. `z.config({ jitless: true })` in `doc-schema.ts` evidently does not reach that chunk.
owner: the next story that touches the Projects page or the CSP — or Story 5.9, whichever is first.
location: `packages/section-runtime/src/doc-schema.ts` (the `jitless` call) · whichever module puts zod on `/`
reason: pre-existing and harmless; finding which import carries a second zod instance onto `/` is its own small hunt.
  `run-verify-editor.cjs` step 70 is now scoped to the editor and canvas exactly as step 14 is, so it no longer trips.

### DW-202: a save the server refuses for good still shows "Retrying … when the connection returns"

plain: If you leave the editor open so long that you are signed out, the editor keeps trying to send your work and
  says it is waiting for the connection — when what it really needs is for you to sign in again. Your work is still
  safe on your computer, and signing in from another tab makes the next try succeed, but the message is not the true
  reason.
status: open
severity: medium
origin: Story 5.8's Review (2026-09-19), four of five layers. `flush()` sends every non-OK status but 409 to the
  backoff. 401 is the reachable one; 404 and 422 need a bug or a deleted project. B6 has five states and no sixth,
  so an honest answer is a new sentence or a new surface, which is the owner's to draw.
owner: Story 5.17 (the edit lock), which already adds the editor's "you are no longer the one editing" surface.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`flush`'s `catch`) · `sync/route.ts`
reason: nothing is lost while it stands — the device holds the work and a retry after sign-in lands — and the fix is
  a piece of interface nobody has drawn (R-74).

### DW-203: two tabs of one project share one local record, and the local database outlives sign-out

plain: Open the same project in two tabs and both write their undo history into the same place on your computer, so
  a reload can come back with a mixture. And the copy of your work kept on the computer stays there after you sign
  out or delete the project, which matters on a shared machine.
status: open
severity: medium
origin: Story 5.8's Review (2026-09-19), Blind Hunter and Edge Case Hunter. `local-store.ts` keys rows by
  `<projectId>:<seq>` with no tab identity; nothing deletes `inflozo-doc-<userId>`.
owner: Story 5.17 for the two tabs (its lock makes the second tab read-only, which removes the writer); the account
  deletion story for the clean-up.
location: `apps/web/lib/local-store.ts`
reason: the lock is the designed answer to two writers and building a second one first would be thrown away.

### DW-204: the deployed editor page sometimes takes more than 30 seconds to finish loading for the test harness

seen again: Story 5.11's Review (2026-09-20, build `56d801c7`) — five attempts of the walk: one complete (455 PASS,
  its only FAIL a user-count control disturbed by a second recorder running beside it), two dead at `page.reload` and
  `page.goBack` before any patch, and two dead at the SAME place after — step 53's soft navigation Back to the editor,
  `painted('home')`, 492 PASS and 0 FAIL each time. Same shape (a navigation that never settles), a new step to add
  to the list of where it lands; the step's own code was not touched by that story.

plain: Our automated walk of the live site opens the editor dozens of times. On 2026-09-19 roughly one opening in
  twenty never finished loading within 30 seconds, which stops the walk. Ordinary pages on the same site answer in a
  third of a second, and the same walk on a local copy never stalls. We do not yet know whether the slow part is this
  computer's connection or the live editor page itself — if it is the page, a customer would see it too.
status: open
severity: medium
origin: Story 5.8's Review (2026-09-19): fourteen deployed attempts across `9ad1ac47`, `02cd7f7a` and `9faf014c`,
  two complete; every death a `page.goto` timeout on `/projects/<id>` at a different step. The one stalled `/sync`
  POST in the same session (patched: the 20s limit) is the same symptom on a different request.
owner: Story 5.9, before its own deployed walk — read Vercel's function logs for the `[id]` route over a walk, and
  run the walk once from a second network.
location: `tools/probe/run-verify-editor.cjs` (`freshLoad`, every `page.goto(editorUrl())`) · the editor route's
  server reads (`(editor)/read.ts`)
reason: telling the two causes apart needs Vercel's logs and a second vantage point, neither of which a review of
  5.8 owns; the harness already refuses to call a died run a result.
  **Story 5.9's Review (2026-09-19):** Dev did not touch it, and the Real-infra verifier's four walks of `a9aa4b21`
  all died the same way (lines 1661, 1325, 655 and 3145) while curl had the site in 0.25s. Every navigation after the
  magic link now gets one retry (`steady`), which is a way round it and not its cause — the diagnosis above is still owed. On `7874dd5b` two walks
  completed: one had step 66's ⌘S stuck on Syncing with the revision unmoved (the stalled `/sync` again, this time
  past the 20s give-up within the step's wait), the next had 0 FAIL. A customer pressing ⌘S would see the same.

### DW-205: the same announcement twice in a row is silent to a screen reader

plain: The editor speaks to screen-reader users through one hidden line of text. If the same sentence is written
  twice running — duplicate a section, then duplicate its same-named copy — the second one changes nothing on the
  page, so nothing is spoken, and the person cannot tell the second key worked.
status: open
severity: low
origin: Story 5.9's Review (2026-09-19), Edge Case Hunter. `setSaid` is a plain `useState`; React skips an identical
  value. The pattern is every story's since 5.2 — the keyboard map only makes a repeat likelier.
owner: Story 5.23's play-loop gate, where the editor is walked with a screen reader.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`setSaid`, every caller)
reason: the fix is one helper every announcement routes through, and whether a repeat should be re-spoken at all is
  best judged with a screen reader running, not from the code.

### DW-206: the Section Picker is four columns at every width, so its cards are tiny on a narrow editor

plain: The picker always draws four cards across. On a wide screen that is right (your ruling R-153). On the two
  narrower editor layouts the same four columns leave each card about a thumb wide, too small to read.
status: open
severity: low
origin: Story 5.10's Review (2026-09-20), Blind Hunter.
owner: the story that builds the editor's below-1440 layouts (`D8 Editor Below 1440.dc.html`).
location: `apps/web/components/editor/section-picker.tsx` (`COLUMNS`)
reason: R-153 ruled four columns on the width he tested; the narrow picker has no frame yet, and drawing one is
  that story's work (R-74), not a guess made in a review.

### DW-207: three small leftovers in the Section Picker

plain: (1) If a section is refused, the sentence saying so stays on screen after you change category or search.
  (2) While you search, the title says "All sections" but the category you had chosen still looks chosen.
  (3) The search box shows a ⌘K hint, but pressing ⌘K while typing in it does nothing in the picker.
status: open
severity: low
origin: Story 5.10's Review (2026-09-20), Acceptance Auditor and Blind Hunter.
owner: Story 5.23's play-loop gate.
location: `apps/web/components/editor/section-picker.tsx`
reason: each is cosmetic and none blocks a placement; the refusal itself is reachable by one design only (R-37).

### DW-208: the canvas document's cache rule lives in two files and is tested by reading one of them as text

plain: The rule that decides whether a browser may keep the preview page is written twice — once for the real
  editor, once for the test harness — and the only automated test reads the first file's words instead of asking
  the page. The deployed walk's step 83 is the one check that really asks.
status: open
severity: low
origin: Story 5.10's Review (2026-09-20), Verification Gap and Blind Hunter. The production defect this review
  fixed (an empty build id) was caught by step 83 and by nothing in `pnpm check`.
owner: the next story that touches `/canvas`.
location: `apps/web/app/(app)/app/(authed)/canvas/route.ts`, `apps/web/app/(app)/app/harness/canvas/route.ts`,
  `apps/web/pilots.test.ts`
reason: the fix is one pure function in `lib/canvas.ts` both routes call, with a unit test — small, but a
  refactor of two shipped routes, and step 83 guards it meanwhile.

### DW-209: the live-site walk's sticky-header scroll check (step 15) fails most runs — the canvas does not scroll

plain: One automated check selects the sticky header, scrolls the page with a simulated mouse wheel and films it.
  On 2026-09-20 the page did not scroll at all in four runs out of five, so the check failed before it could look
  at anything. We do not yet know why.
status: done 2026-09-20 (Story 5.11, Dev) — executed, and fixed where it pointed
severity: medium
origin: Story 5.10's Review (2026-09-20), Real-infra verifier, at `41fd5d18` and again at `67dae0a1`.
owner: Story 5.11's Dev, before its own deployed walk.
location: `tools/probe/run-verify-editor.cjs` (step 15 b); `apps/web/components/controls/section-pill.tsx`
reason: A HYPOTHESIS, NOT A FINDING: the wheel is sent at x=700, the middle of the card, which is where this
  story's "+ Add section" pill sits — and a wheel over a pill in the parent page does not scroll the canvas inside
  the frame. If that is it, a customer scrolling with the pointer on the pill would feel the same stall, and the
  fix is the pill passing its wheel to the canvas. It was not executed, so it is not asserted.
fix: EXECUTED at Story 5.11's Dev (2026-09-20, standing rule 1), in Chromium through this repository's own
  Playwright over the keyboard harness. A wheel synthesised over `[data-add-section]` scrolled the canvas document
  **0px** and the identical wheel over the iframe **500px**, so the MECHANISM holds — though at the harness's own
  geometry `(700, 600)` fell on the iframe rather than on the pill, which is why the deployed check fails *most*
  runs and not all. The fix is the ledger's own: both pills forward their wheel to the canvas
  (`section-pill.tsx`'s `onWheel` → `editor.tsx`'s `wheelToCanvas`, and the same on `/controls`), and the control
  re-run after it reads 500px on both. It is a CUSTOMER fix, not a test repair: a pointer resting on a pill stalled
  the page. **Step 15 b PASSED on production at `2ee6f4a8`** (Story 5.11's Fix run, 0 FAIL / 454 PASS, and again at
  its Review, 2026-09-20), and since the Review the pointer is put ON each pill by its box and the canvas scroll read
  before and after — `run-verify-editor.cjs` step 87 and a `ring — DW-209` step of `run-verify-controls.cjs` — so the
  forwarding is asserted rather than remembered (nothing wheeled over a pill before; step 15 wheels at x=700).


## Deferred from: code review of spec-5-11 (2026-09-20)

### DW-211: the editor's own pill ◀ ▶ and Shuffle are wired but never pressed by any gate

status: open
severity: medium
origin: Story 5.11's Review (2026-09-20), Verification Gap reviewer.
owner: Story 5.23 (the play-loop gate), or the first Epic 9 story that gives a shipped category a second design.
location: `editor.tsx` (`stepDesign(hovered, ±1)`, `onShuffle(hovered)` wired at the `<SectionPill>` mount); `tools/keyboard/journey.spec.mjs`
plain: The little arrows and the Shuffle button on a section's own pill, in the real editor, are connected to the
  right code — but no automated check ever presses them there. The keyboard journey may not use a mouse, the deployed
  editor walk has no ring to press them on, and the `/controls` page presses its OWN copy of the wiring. Swapping the
  two arrows by mistake would go unnoticed until the owner tried them.
reason: `journey.spec.mjs:134` refuses every pointer API, `run-verify-editor.cjs` step 86 asserts the ring group ABSENT
  on production (every shipped ring is length 1), and `review.tsx`'s `onStep`/`onShuffle` are a separate
  implementation over the page's own state. The fix is a small Playwright spec beside the journey that IS allowed the
  mouse, hovering the harness's ringed section and pressing `[aria-label^="Next design"]` and `[data-pill-shuffle]`,
  asserting `#editor-design-count`, `#editor-said` and one `⌘Z`; `playwright.config.mjs`'s `testMatch` grows one name.
  Not built at the Review because it is a new gate file with its own no-touch rule to settle, not a patch.

### DW-212: a capped list's panel row loses its min–max range

status: open
severity: low
origin: Story 5.11's Review (2026-09-20), Blind Hunter.
owner: Story 5.23, or the first Epic 9 story that ships a `data-items-limit`.
location: `apps/web/components/controls/item-list.tsx` (the `range` line)
plain: When a design shows fewer items than the section holds, the list's header says "3 items · 2 shown in this
  design" (the sentence the PRD asks for) INSTEAD of "2–6 · 3 used". The add and remove buttons still stop at 2 and
  6, but the numbers are no longer printed while that design is showing.
reason: FR-D13 gives the exact sentence and the owner's test (step 10) accepted it; the deployed walk asserts it
  verbatim. Printing both ("3 items · 2 shown in this design · 2–6") is one line, but it changes a sentence the owner
  has just approved, so it is his to want first.

### DW-213: `itemsShown` reads the first `data-items` element bound to a path, so two lists on one path with two caps report the first

status: open
severity: low
origin: Story 5.11's Review (2026-09-20), Edge Case Hunter.
owner: Epic 9's authoring pass, if any design ever binds one array on two elements.
location: `packages/section-runtime/src/controls.ts` (`itemsShown`); `packages/library/src/validate.ts`
plain: A design could, in theory, draw the same list twice with two different "show at most N" caps. The panel would
  report the first one's number. No design does this and the shipped library has no cap at all yet.
reason: The honest fix is a validator rule — one `data-items-limit` per path, refused at assembly — rather than a
  `Math.max` in the reader, because two caps on one list is an authoring mistake and not a rendering case. Deferred
  because no fixture or design declares two, so the rule would have no positive case to prove it on today.

### DW-214: the swap's 180ms settle is drawn in the editor, where no ring exists yet, and not on `/controls`, where one does

status: open
severity: low
origin: Story 5.11's Review (2026-09-20), Blind Hunter and Verification Gap reviewer.
owner: Story 5.23, or the first Epic 9 story that gives a shipped category a second design.
location: `apps/web/lib/canvas-chrome.css` (`[data-inflozo-swapped]`); `editor.tsx` `markSwapped`; `review.tsx` `paint`
plain: When a section changes design in the editor it fades in over 180ms. The only page where a design can change
  today is the internal Controls review page, and that page does not draw the fade — so nobody has seen it. The
  keyboard journey now proves the attribute goes on and comes off in the editor's harness; the look of it is unproved.
reason: `/controls` paints through `renderCanvas` with no `mark()` and its frame document does not carry
  `canvas-chrome.css`, so adding the attribute there alone would draw nothing. Left until a real ring exists in the
  editor, where the owner will see it in its own place rather than on an internal page.

### DW-210: the `/controls` review's window scrolls ~35px once its panel has been folded and unfolded

status: closed 2026-09-20 — does not reproduce since `730e713a`: step 17 reads a window scroll range of **0** after
  the same fold-and-unfold that measured 24, 30 and 35px at `6a09cecc` and `1b5e4805`. The owner's own test of the
  page removed the `Try a design` card and the `Cycle designs` footer from the panel between those two readings,
  which is the shorter panel the measurements pointed at; that is the LIKELY cause and not a proved one, because
  no control isolated it. Left here rather than deleted so a future reading of 24-35px is recognised.

plain: The internal Controls review page is built so the window itself never scrolls — the section scrolls inside
  its frame and the settings panel scrolls on its own. After you collapse the panel and open it again, the whole
  window gains about thirty pixels of scroll. Nothing is cut off; a second scrollbar simply appears beside the
  panel's, which is the thing the page was re-laid-out to stop.
severity: low
origin: Story 5.11's Dev (2026-09-20), `run-verify-controls.cjs` step 17, on production at `1b5e4805`.
owner: closed by the owner's own test of the page, the same day — see the `status` line above.
location: `apps/web/app/(app)/app/(authed)/controls/review.tsx` · `apps/web/components/shell/shell.tsx`
reason: MEASURED, AND THE BOX IS NOT VISIBLE. At step 2 the window's scroll range is 0; after step 17's collapse and
  re-expand it is 24–35px and it VARIES between runs (24 at `6a09cecc`, 30 and 35 at `1b5e4805`), which says it
  depends on what the walk has typed rather than on the layout alone. The collapsed state is 0, so it is the panel
  being present that does it. But nothing in the document is below the fold: `document.body.scrollHeight` is 900,
  every child of `<body>` ends at or above 900, and no element with an unclipped path to the root has a bottom past
  the viewport — while `document.scrollingElement.scrollHeight` reads 935. So the 35px is not a box this reader can
  see, and guessing at it costs a deploy per guess.
  NOT STORY 5.11'S DOING as far as the measurements go: its Design block sits INSIDE the panel, which is
  `overflow-y: auto` and scrolls on its own, and the page range is still 0 at step 2 with the block drawn. It is
  recorded here rather than chased because `/controls` is an internal review page and the failure is cosmetic —
  but it IS the exact complaint the page was re-laid-out for (the owner's findings 5 and 6, 2026-09-13: two
  scrollbars side by side "looks really bad"), so it is not dismissed either.
  **RESOLVED BY THE PANEL GETTING SHORTER (2026-09-20).** See the `status` line at the head of this entry.

## Deferred from: code review of spec-5-12-site-remix.md (2026-09-20)

### DW-215: one `⌘Z` restoring SEVERAL remixed sections is proved on the pure fold, never in a browser

status: open
severity: low
origin: Story 5.12's Review (2026-09-20), Verification Gap reviewer and Blind Hunter.
owner: the first Epic 9 story that gives a shipped category a second design, or Story 5.23.
location: `tools/keyboard/journey.spec.mjs` (the FR-D17 stop); `apps/web/app/(app)/app/harness/editor/page.tsx`
plain: Remix promises that one Undo puts a whole page back. The automated walk only ever remixes a page with one
  changeable section, so "one Undo for many" is proved by a unit test of the logic, not by pressing keys in a browser.
reason: The review made the fold pure (`remixFold`) and tests it with two picks and with a refusal, and the editor
  commits its result once, so the claim is structurally held. An end-to-end stop needs a second ringed section on
  the harness Home doc, which shifts the fixtures every other stop counts on; left for the story that has a real ring.

### DW-216: the die's pip-centre measurement is written three times

status: open
severity: low
origin: Story 5.12's Review (2026-09-20), Blind Hunter.
owner: whoever next changes how the die's faces are drawn.
location: `tools/keyboard/journey.spec.mjs`; `tools/probe/run-verify-controls.cjs`; `tools/probe/run-verify-editor.cjs`
plain: The check that every dice face really shows a different number of dots exists in three copies. A fix to one
  could miss the others.
reason: The three are an ESM Playwright spec and two standalone CommonJS probes with no shared module between them
  today; one shared file is the fix, and it is not worth a new module for fifteen lines until the drawing changes.

## Deferred from: code review of spec-5-13-the-content-source-pill-and-the-preview-subject.md (2026-09-21)

### DW-217: the preview subject is stored per canvas per PROJECT, not per user

status: open
severity: low
origin: Story 5.13's Review (2026-09-21), Blind Hunter, Verification Gap reviewer and the Real-infra verifier (read on production).
owner: the first story that lets a second person open a project.
location: `supabase/migrations/20260904120000_complete_schema.sql` (`project_template_prefs`' primary key); `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts`
plain: Which article a canvas previews is remembered once per project. Today a project has one owner, so that is the
  same as "per person". If two people ever share a project, the second person's choice would replace the first's.
reason: The table's key is `(project_id, template_key)` and has been since the complete-schema migration; making it
  per user is a migration and a decision about shared projects, neither of which this story owns. The comments
  beside the code now say what the schema really holds.

### DW-218: an archive canvas carries the home feed's pager address

status: done 2026-09-22 (Story 5.16)
resolution: Story 5.16 (2026-09-22) — `templateContext` gives every page of a list its OWN address, from one function
  (`addressOf`, held to the shim's `pageUrl` by `orbit-weekly.test.ts`): `currentUrl` is `/`, `/page/2/`,
  `/tag/<slug>/` or `/tag/<slug>/page/2/` (and the author's), and an archive's `paginationBase` is the archive, so its
  Older link is `/tag/<slug>/page/2/` and never the home feed's. The editor hands the page's address to EVERY section
  (`renderSection`'s new `url`), the site-wide header included, so `{{navigation}}` marks what Ghost marks — an exact
  match only, read in source on both majors (MEASUREMENTS §48 (c), (d)). The Tag and Author canvases no longer mark Home.
  Post, Page and 404 still hand the header `/` — DW-230.
severity: low
origin: Story 5.13's Review (2026-09-21), Blind Hunter.
owner: the first story that draws a pager or a current-page nav mark on a Tag or Author canvas (Epic 9's archive categories).
location: `packages/library/src/orbit-weekly.ts` (`templateContext`, the archive branch: `paginationBase: '/'`, `currentUrl: '/'`)
plain: On a Tag or Author canvas the list of posts is now the right one, but "Older posts" would still point at the
  home page's page 2, and the menu would mark Home as the current page. No design that ships today shows either.
reason: Pre-existing — the archive branch inherited both values from the home feed. What Ghost serves for an archive's
  pager is a claim to read in source or execute on T1/T3 before it is written down, and no shipped design binds it.

### DW-219: the preview subject's refusals, and the Author and Page canvases, are not on the deployed walk

status: open
severity: low
origin: Story 5.13's Review (2026-09-21), Verification Gap reviewer and Acceptance Auditor.
owner: Story 5.23, or whoever next extends step 89.
location: `tools/probe/run-verify-editor.cjs` (step 89); `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts`
plain: The automated walk proves choosing an article works and is saved. It does not try a deliberately bad choice to
  see it refused, and it visits the Post and Tag canvases but not Author or Page, which only unit tests cover.
reason: The refusal guards run inside a server action the harness cannot call with forged arguments without its own
  signed-in action client; the read side (`resolveSubject`) already falls back on anything bad and IS tested. Author
  and Page share every line with Tag and Post.

### DW-220: the deployed editor walk's step 66b/66c failed once in three runs on unchanged code

status: open
severity: low
origin: Story 5.13's Review (2026-09-21), the deployed walk at `efda9d6c`.
owner: Story 5.23, or whoever next touches autosave or the walk.
location: `tools/probe/run-verify-editor.cjs` (steps 66b, 66c)
plain: The automated walk's "save when the tab is hidden" check failed once and passed twice on the same build. Either
  the check is timing-sensitive or the save on tab-hide occasionally does not land; nobody knows which yet.
reason: Story 5.13 touches no save code, and the same stops passed at `112514d4` and in two of three runs at
  `efda9d6c`; 66c's failures follow from 66b's (the revision it expects never moved). Telling a flaky check from a
  flaky save needs its own look, not a guess inside this review.
evidence (Story 5.14's Dev, 2026-09-21, at `6f2944ef`): step 66b failed again once — **2 FAIL, 513 PASS**, "Saved on
  this device → synced false · revision 10 → 10" — and the next complete walk on the same deployment passed it (**0 FAIL,
  515 PASS**). Story 5.14 adds no request inside 66b: its one write, the "looked at" record, fires only when the record
  CHANGES, and by step 66b Home's record already holds the visitor on screen, so the undo/redo that owes the edit writes
  nothing. Two stories and two builds now, the same stop.

## Deferred from: Story 5.14's Dev run (2026-09-21)

### DW-221: FR-D16 leans on the owner's member-state pass at each category gate, and §4's gate has no such pass

plain: The requirement behind the new "View as" reminder says it makes your own check of each kind of visitor, at every
  category's sign-off, reliable. But the sign-off itself never asks you to look at a page as a signed-out visitor, a free
  member and a paid member, so the reminder is supporting a step that is not written down anywhere.
status: open
severity: low
origin: Story 5.14's planning (2026-09-21), recorded at its Dev run — read in `prd.md` §4 and FR-D16's second paragraph.
owner: the owner's ruling first, then the first category gate that runs it (Epic 9's shell block, whose header category
  is the first members-aware one).
location: `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` §4 ("The category owner gate (normative)":
  the automated sheet's six items and the owner's hands-on pass) · FR-D16's second paragraph ("the owner's manual
  member-state pass at each category gate (§4)")
reason: FR-D16 names that pass as the thing its nudge makes reliable, and §4 describes an automated sheet — deploy, the
  real-Ghost comparison, accessibility, compile, the render matrix, the design ring — then the owner composing, deploying
  and exercising the controls, with no member state anywhere in it. Adding a row (look at every members-aware design as
  Anonymous, Free and Paid before approving) changes the owner's own sign-off, so it is his to rule and not a Dev run's to
  write. Nothing in the product is wrong meanwhile: the nudge works whether or not the gate asks for it.

### DW-222: the deployed editor walk's step 36 fails intermittently — the hover follows the section a scroll moves under a still pointer

status: open
severity: low
origin: Story 5.14's Dev run (2026-09-21), the deployed walk at `d4d6e266` — and Story 5.9's (2026-09-19), whose spec
  recorded the same failure ("intermittent, Story 5.4's") without a ledger row.
owner: whoever next touches the section pill or the walk (Story 5.22's responsive pass moves both).
location: `tools/probe/run-verify-editor.cjs` step 36 (`:1722-1777`) · the pill's placement in `editor.tsx`
plain: One automated check on the little floating toolbar above a section sometimes fails and sometimes passes on the
  same build. Nothing you would see as a customer is known to be wrong; the check's own assumption is the suspect.
reason: At `d4d6e266` one walk failed both of step 36's checks and the next, on the same deployment, passed them
  (0 FAIL, 515 PASS). In the failed run the settled pill sat at the right corner rule (10px in from the right edge) but
  10px below the NEXT section's top (`top 272`, the grid's bottom `262`): it had moved to the section that the 300px wheel
  scroll carried under a pointer that never moved, and the per-frame sampler then read up to 126px against the new
  hover. The likely cause is a HYPOTHESIS, not executed (standing rule 1): Chromium dispatching a synthetic mouse move
  once a scroll settles, which would make "does the hover change inside the check's 700ms window" a race. The check
  assumes the hover stays on the grid; telling whether the product or the check should change needs its own look, not a
  guess inside a story that does not touch the pill.

## Deferred from: code review of spec-5-14-member-state-preview-and-the-nudge-that-names-what-i-have-not-looked-at.md (2026-09-21)

### DW-223: a preview-article choice can land late, so a quick reload shows the previous article once

status: open
severity: low
origin: Story 5.14's code review (2026-09-21), the Real-infra verifier's second walk at `f313b1b0`.
owner: whoever next touches the editor's server-action writes.
location: `editor.tsx` `recordViewed` → `setViewedStates`, and the `setPreviewSubject` call
plain: If you pick a preview article and reload the page within a second or two, the old article can come back once.
  The choice is saved; it just arrives a moment late.
reason: Step 89 failed once in two completed walks with nothing else running on the machine: after choosing article B
  and waiting 1200ms, the reload read A, and the next check read the stored row as B. The cause is a HYPOTHESIS, not
  executed (standing rule 1): Next dispatches a client's server actions one at a time, and this story adds a stream of
  them (`setViewedStates`, on every canvas switch, visitor pick and edit) to the queue `setPreviewSubject` shares.

### DW-224: R-173's plain-link rule is document-wide, and a pack with no underline hides a link on a coloured ground

status: open
severity: medium
origin: Story 5.14's code review (2026-09-21), the Acceptance Auditor, the Blind Hunter and the Edge Case Hunter.
owner: Epic 6 — the story that emits the token block into `default.hbs` and the one that builds the packs.
location: `packages/section-runtime/src/tokens.ts` `LINK_RULES` · `reference-tokens.css`
plain: Nothing is wrong today. When Style Packs arrive, a pack that turns link underlines off would make a link typed
  on a dark, accent or photo band look like ordinary text; and the rule will also restyle links inside a post's body.
reason: On contrast, accent and image grounds the words take `color: inherit`, so the underline is the link's only
  sign (WCAG 1.4.1); no rule forces it there and no test covers `--link-decoration: none`. `:where(a:not([class]))` is
  unscoped, so once the block is in a theme it reaches `{{content}}` — reasoned from the selector, not executed against
  a theme. An anchor with `class=""` also escapes it.

### DW-225: two tabs of one project each write their own whole "looked at" record

status: open
severity: low
origin: Story 5.14's code review (2026-09-21), the Edge Case Hunter.
owner: whoever builds Story 7.18's Pre-flight, which is the record's first reader that matters.
location: `editor.tsx` `recordViewed`
plain: With the same project open in two tabs, looking at a page in the second tab can bring back "viewed" marks that an
  edit in the first tab had just cleared. One tab is unaffected.
reason: Each tab merges into its own copy of the record and writes whole arrays; an edit made in the other tab never
  invalidates this one's copy. The fix is an array-union RPC or a re-read on the save path's "another session wrote".

## Deferred from: Story 5.15's Dev (2026-09-22) — behaviours held still while designing, and Preview

### DW-226: a module that moves by itself and declares a width is chipped PAUSED at every width

plain: When a header that shrinks as you scroll only does so on phones, the editor will still show its PAUSED tag when
  you point at it on the desktop view, where it would not move even on your live site.
status: open
severity: low
origin: Story 5.15's Dev (2026-09-22) — spec Design Notes, "Known ceilings"
owner: the first category story that puts a width-declared module that moves by itself on the canvas (R-38's
  `header-scroll:768` is the likely one)
location: apps/web/lib/behaviours.ts `movesByItself` · editor.tsx's chips
reason: the chip is drawn for every mount `core` held still whose module `movesByItself`, and `core`'s editing rule
  skips a mount before it reads the declaration's width (`core.js:43-47`), so a held-still mount declared
  `header-scroll:768` is chipped at 1440, where Preview would not run it either. No pilot declares a width, so nothing
  shows it today; the fix is to ask the width's own `(width < Npx)` query before drawing the chip.

### DW-227: an autoplaying carousel carries no PAUSED chip

plain: A carousel that turns its slides by itself on your live site will hold still while you design, like every
  carousel, but it will not show the PAUSED tag that tells you it moves.
status: open
severity: low
origin: Story 5.15's Dev (2026-09-22) — R-175's "What it does NOT change"
owner: the carousel's first category story (research §3.5's autoplay is a per-design option)
location: packages/library/modules/registry.json (`carousel`'s `movesByItself`) · apps/web/lib/behaviours.ts
reason: `movesByItself` is per MODULE, and `carousel` carries `false` because its arrows and dots wait for a press;
  autoplay is a per-design option the registry row cannot see. The story that builds an autoplaying carousel may raise
  it with the owner — a per-mount mark, or a separate module row.

### DW-228: a re-stamp takes a ROOT-level mount's `data-i18n-*` strings off, and a running module would lose its words

plain: Nothing is wrong on your pages today. When a design puts a moving part's text on the section itself, changing
  one of its settings could make that part lose its words until the page is drawn again.
status: open
severity: medium
origin: Story 5.15's Dev (2026-09-22), read in the source (`packages/section-runtime/src/core.ts:1227-1229`)
owner: the first design whose root element is itself a module mount with strings (S5's `data-i18n-*`)
location: packages/section-runtime/src/core.ts `stampControls` · editor.tsx `restampAll` and `onChange`'s control
  fast path
reason: `stampControls` removes every root `data-*` that is not a directive, and `data-i18n-*` is not one, so a mode
  flip or a control change strips the strings both emitters stamp on a mount that IS the section root. Since Story 5.15
  a mount that is edit-safe keeps RUNNING through a re-stamp (the nodes are kept), so a module reading `ctx.t` after
  mounting — a countdown's labels — would read `''`. No pilot mounts on its root today. The fix belongs in the shared
  function: keep `data-i18n-*` there, as `data-portal` already is.

### DW-229: the PAUSED chip has no text equivalent for a screen reader

plain: The small grey PAUSED tag is only drawn. Someone using a screen reader who selects a section with a part that
  holds still is not told that it holds still. Nothing on your pages carries such a part yet.
status: open
severity: low
origin: Story 5.15's Review (2026-09-22) — Blind Hunter
owner: the first category story whose design declares a module that is held still and moves by itself (research
  §2.1 lists `header-scroll` for A1-1 onward, so likely Story 9.1)
location: editor.tsx (the chip is `aria-hidden`, as B3a's chrome) · `#editor-said` or the section's panel
reason: the chip is chrome in the canvas layer, drawn only while a section is pointed at or selected, and `aria-hidden`
  as every other piece of that layer is (the outline, the name tag). The information it carries — "this part holds
  still while you design, and runs in Preview" — has no spoken equivalent. The fix is a sentence, not a chip: a
  sr-only line in the selected section's panel, or on the selection announcement, derived from the same `paused` list
  narrowed by `movesByItself`. It waits for a real part so it is measured on one (R-82), not on a fixture.

## Deferred from: Story 5.16's Dev (2026-09-22) — page 2, seen and designed

### DW-230: the Post, Page and 404 canvases still tell the header it is on the home page

plain: On a Post, Page or 404 canvas your header still underlines "Home" as the page you are on, which the live site
  does not do. Home, its page 2 and the Tag and Author pages are right since Story 5.16.
status: open
severity: low
origin: Story 5.16's Create (2026-09-22), read in Ghost's source on both majors and in the recorded rows
  (MEASUREMENTS §48 (c)): Ghost sets `nav-current` on an exact `relativeUrl` match only, and T3's recording draws
  `nav-ghost-5-home` ALONE on both posts, the page and the 404.
owner: Story 5.18 (live content from the connected site), whose subjects carry a real address to hand over — a post's
  and a page's own URL — and the 404's is the missed path itself.
location: `packages/library/src/orbit-weekly.ts` (`templateContext`, the `post.hbs`/`page.hbs` branch and the
  non-paginated return: `currentUrl: '/'`) · `editor.tsx` `paint()` (the address it hands every section)
reason: the bundled post and page fixtures carry no URL of their own that a menu item could match, so the canvas keeps
  today's `/` there rather than invent one (FR-H3). The fix is the subject's own `url` as `currentUrl` in those two
  branches, plus a non-matching address for the 404, and `orbit-weekly.test.ts`'s address test widened to them.

### DW-231: the shim draws no `nav-current-parent`, which Ghost adds on an archive's later pages

plain: On page 2 of a tag page, the live site marks that tag's menu item with a "parent" class a theme can style; the
  canvas never adds it. No design styles it today.
status: open
severity: low
origin: Story 5.16's Dev (2026-09-22), read in `core/frontend/services/theme-engine/handlebars/utils.js:33-50, :63` on
  both majors (MEASUREMENTS §48 (c)): an item whose path is a prefix of the location gets `nav-current-parent`.
owner: the first design that styles `.nav-current-parent` (A1's category story, Epic 9)
location: `packages/ghost-shim/src/index.ts` (`navigationItems`, which computes `current` alone)
reason: nothing reads the class, so the canvas and the theme agree on every pixel today. `_urlParentMatch` also has an
  oddity worth recording before it is copied — it compares ONLY the item's last path part (`parent` is overwritten on
  each loop turn) — so the shim should reproduce that loop, not an idealised prefix test, and record it on T1 and T3.

### DW-232: the Synthesis Defaults name A34 #1 Numbers, and the all-Free rule forbids it

plain: The standard page-2 style the untouched pages are supposed to use is a Pro design, while the rule for untouched
  pages says they only ever use Free ones. Nothing shows this yet, because pagination styles arrive in Epic 10.
status: open
severity: medium
origin: Story 5.16's Create (2026-09-22), read in the documents: `sections-inventory.md` § Synthesis Defaults §3 and
  §4 set "Pagination style = A34 #1 Numbers" on every collection template, while Invariant 1 says defaults reference
  only [Free] designs, and the export's `A34 Pagination Styles - Spec.md:9` makes A34's [Free] designs **#2 Prev and
  Next** and **#9 Cards** — and `prd.md`'s entitlement table (`:1168`) says "A34 #1–#2 are [Free]", a third answer.
owner: Story 5.19 (the Pagination style control on the main feed), with the owner: which Free design an untouched
  template's pager is.
location: `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/sections-inventory.md` §3–§4 · `prd.md:1168`
reason: a documents disagreement with no code behind it yet — `SYNTHESIS_DEFAULTS` carries no pagination value
  (`synthesize.ts`'s FEED row says why) and no A34 design is authored. Choosing one is the owner's (R-17 chose the Free
  pair), so it waits for the story that builds the control.

### DW-233: the four Pagination style lists disagree

plain: The pagination choices are listed four different ways in the plans and drawings, so the control Story 5.19
  builds has no single list to show. Nothing on screen offers it yet.
status: open
severity: medium
origin: Story 5.16's Create (2026-09-22), read in the documents: FR-H2 (`prd.md:312`) and Story 5.19's card offer
  **Numbered / Load More / Infinite scroll**; D5c and D5d (`D5 Canvas Markers and Template Switcher.dc.html:350, :428`)
  draw **None / Older/Newer / Numbers**; A34's roster is ten designs (Numbers, Prev and Next, Bar, Pill, Counter, …);
  and `sections-inventory.md`'s A34 entry speaks of Numbered, Load More and Infinite as design families.
owner: Story 5.19 (the Pagination style control), which must pick one vocabulary before it draws the row above D5d's
  Preview page row
location: `prd.md` FR-H2 · `epics.md` Story 5.19 · `sections-inventory.md` A34 · the D5c/D5d frames (never edited, R-74)
reason: Story 5.16 builds only the Preview page row under that control and draws no Pagination row, so it settles
  none of the four; recording them here keeps Story 5.19 from inheriting a silent choice.

## Deferred from: code review of spec-5-16-previewing-page-2 (2026-09-22)

### DW-234: a page 2 that deletes its own main feed compiles with no list of posts

plain: On page 2 you may delete anything, the post grid included (R-177). Page 1 that loses its grid still lists posts
  on `/page/2/` through R-127's fallback; a page 2 of its own that loses its grid has no fallback, so the compiled
  `/page/2/` (and every later page) would show no posts. Nothing compiles yet, so nothing is broken today. And once
  page 2's own design has no main feed, the Preview page row is gone from page 2's panel: the pill is the one way back.
status: open
severity: medium
origin: Story 5.16's review (2026-09-22), the Blind Hunter over `pageTwoStack` rule 1 (`synthesize.ts`): a stored page
  2 is returned as it is, whatever it holds, and FR-I1's "never emitted empty" reasons about page 1 only.
owner: Story 7.3 (the compiler decides — refuse, fall back to the Synthesis Default stack, or compile as designed) with
  Story 5.19 (the main-feed designation's lifecycle, which may forbid deleting the feed on page 2 as it does elsewhere).
location: `packages/section-runtime/src/synthesize.ts` `pageTwoStack` · `apps/web/lib/page-two.ts` `mainFeedOn` ·
  `epics.md` Story 7.3 and 5.19

### DW-235: the sync route validates a template key's name, never the doc stored under it

plain: The save route checks that a key is one of the allowed names and that the doc parses, but not that every design
  in the doc may sit on that key's file. A bad doc saved under `index` (or any key) is caught on the next load, where
  the whole editor refuses to open, rather than at the save.
status: open
severity: low
origin: Story 5.16's review (2026-09-22). Pre-existing for every key — `read.ts` has always been the one place the
  `compileTarget` check runs — and this story added three keys to the same pattern.
owner: Epic 7's compile path, or the first story that makes the route validate placement (a `compilesTo` check against
  `fileOf(key)` at the write).
location: `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` `TEMPLATE_KEY` · `read.ts` `editorData`


## Deferred from: spec-5-16a-the-page-number-token.md (2026-09-23)

### DW-236: the deployed editor walk can die mid-run in the screencast decoder, on a frame it cannot decode

plain: The long automated walk of the editor on the live site sometimes stops halfway with "the source image cannot be
  decoded", part-way through the checks that film the canvas scrolling. Nothing a customer would see is known to be
  wrong — the same walk, re-run on the same build, passed every check — but the run is lost and has to be started again
  from the beginning, which takes about ten minutes.
status: open
severity: low
origin: Story 5.16a's Dev run (2026-09-23) against `app.inflozo.com`. The first walk threw
  `page.evaluate: EncodingError: The source image cannot be decoded` out of step 15's decoder page after 172 PASS and
  0 FAIL; the re-run, same deployment, finished 0 FAIL / 571 PASS. It is NOT DW-222 (a hover that follows a scrolled
  section) and NOT the Playwright timeout DW-220 names: this is `img.decode()` rejecting on a base64 frame handed back
  by `Page.startScreencast`.
reason: The cause is a HYPOTHESIS and was not executed (standing rule 1): a screencast frame delivered truncated, or
  delivered after the decoder page's context went away. Whichever it is, the fix belongs in the harness and not in the
  product — one bad frame should be skipped, or retried, rather than ending a ten-minute walk, and the check should
  refuse only if too few frames survive to measure. Diagnosing it inside a story that does not touch the screencast
  would be guessing.
owner: whoever next touches `film()` or the scroll-filming checks (Story 5.22's responsive pass reaches them).
location: `tools/probe/run-verify-editor.cjs` step 15's `decoder.evaluate` (`:949`) and `film()`


## Deferred from: code review of spec-5-16a-the-page-number-token.md (2026-09-23)

### DW-237: the probe recorders leave every uploaded probe theme on T1 and T3

plain: Each time one of the recording probes runs, it uploads a small throwaway theme to the two test Ghost sites, uses
  it, and puts the site's real theme back — but never deletes the throwaway one. Nothing a customer sees is affected;
  the test sites just collect old probe themes in their theme list, one or two per run.
status: open
severity: low
origin: Story 5.16a's review (2026-09-23), reading `tools/probe/record-page-number.py`. Pre-existing: it follows
  `record-contexts.py`'s pattern exactly, and that recorder never deleted its upload either.
reason: Deleting is one more Admin API call in the `finally`, after the restore is proved — but it belongs in the shared
  pattern for every recorder, not in one story's probe, and the reset protocol should say so.
owner: whoever next touches a `record-*.py` probe or `tools/probe/RESET-PROTOCOL.md`.
location: `tools/probe/record-page-number.py` `record()`'s `finally` · `tools/probe/record-contexts.py:342`

### DW-238: the deploy-and-export take-over (D8g) has no entry point to hang off yet

plain: The plan says that if you press Ship it or Export while another window is the one editing, we should ask you
  first whether to take over — because otherwise you would publish an older copy of your site. There is no Ship it
  button and no Export button yet, so there is nothing to press and nothing to build. When those two arrive, the box
  that asks is already written and waiting for them.
status: open
severity: medium
origin: Story 5.17's Create (2026-09-23). FR-D18's last sentence and the story's own acceptance criterion name it, and
  `EXPERIENCE.md:1053-1056` gives its frame — `D8 Editor Below 1440.dc.html` D8g, "Take over to ship?", focus opening
  on Wait. `apps/web/lib/keymap.ts:113` reserves Ship it's row with no keys (Story 7.18) and ZIP export is Story 7.26;
  `apps/web/probe-rule.test.ts:183-185` asserts the product's copy names neither until they land (UX-DR3).
reason: a take-over prompt for a control that does not exist is unreachable, and naming the control would break the
  rule that an unbuilt feature is absent rather than greyed. Story 5.17 builds the component D8g is made of —
  `apps/web/components/editor/lock-takeover.tsx`, whose heading, body and confirm label are props for exactly this —
  so the remaining work is the gate itself, which belongs where deploy and export are written.
owner: Story 7.18 (the deploy wizard) for Ship it, Story 7.26 (theme zip export) for Export. Each renders
  `lock-takeover.tsx` with D8g's strings and refuses to start without the lock (AD-15's flush contract).
location: `apps/web/components/editor/lock-takeover.tsx` · `apps/web/lib/keymap.ts:113` ·
  `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md:1053-1056`

### DW-239: the lock's middle transport layer needs a Supabase client the browser does not have

plain: When you edit on your laptop and then open the same site on your phone, the phone can ask the laptop to hand
  over. Two tabs of one browser hear each other instantly and cost nothing; another device waits up to about fifteen
  seconds for the next check-in with the server. Making it instant everywhere means putting a Supabase connection in
  the page itself, which is a change to how the product is built rather than an engineering detail — so the owner is
  asked before anything is done, and nothing is broken meanwhile.
status: closed
closed: 2026-09-24 — the owner ruled Question 3, option 1: *"Leave it at about fifteen seconds."* (**R-191**). Realtime
  is not built in v1; `BroadcastChannel` and the ~15 s heartbeat ARE the transport, which is what shipped. Reopening
  it is a story of its own with a Schema phase, as `owner:` below says.
severity: low
origin: Story 5.17's Dev (2026-09-23), Question 3. `addendum.md:45` names three transport layers and is the only
  statement of them in the project; `tools/probe/record-edit-lock.py` executed the middle one for the first time and
  `MEASUREMENTS.md` §50 records what it found.
reason: two things turned up that had never been checked. A PUBLIC Realtime broadcast channel `lock:<project id>`
  works (subscribed, received in 23-38 ms, payload intact, another project's channel isolated) but its topic is
  joinable by anyone holding the publishable key and a project id. A PRIVATE channel is refused outright
  (`CHANNEL_ERROR: Unauthorized … Channel topic`) and needs an RLS policy on `realtime.messages`, which is a
  migration. And EITHER way the browser cannot open the socket at all: `apps/web/lib/supabase/server.ts` is "THE ONLY
  PLACE A SUPABASE CLIENT IS MADE", there is no `NEXT_PUBLIC_*` key in `apps/web`, and `lib/supabase/cookies.ts` sets
  the session cookie `httpOnly` BECAUSE the app has none. Reversing that is a security decision, not an engineering
  one. Layers 1 and 3 — `BroadcastChannel` and the ~15 s heartbeat floor — are built and the choreography completes
  on them, so the I/O matrix's "Realtime unreachable" row is the SHIPPED behaviour rather than a fallback.
owner: the owner rules Question 3 in `spec-5-17-…md`; a "make other devices instant" answer is its own story (a
  browser-side client, a published key, a `realtime.messages` policy applied by hand before it ships, R-99).
location: `apps/web/lib/lock-client.ts`'s transport section ·
  `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` §50(c)(d) ·
  `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/addendum.md:45`

### DW-240: reloading the tab that holds the lock can hand it to another open session, about one time in ten

plain: If you have the same project open twice and press reload in the one that is editing, there is a short moment —
  a second or two — in which neither holds the right to edit. If your other window or device happens to check in during
  that moment, it takes over editing and the one you reloaded comes back reading along instead. Nothing is lost: you
  press Request editing and get it back. It is rare (the other session checks in every fifteen seconds), and the obvious
  fixes each cost something worse, so it is written down rather than guessed at.
status: open
severity: low
origin: Story 5.17's Dev (2026-09-24), found while fixing the "Same session reloads" row. `editor.tsx` releases the
  lock on `pagehide` so that a CLOSED tab frees it at once rather than after §AD4's ~60 s — and `pagehide` cannot tell
  a reload from a close. Measured on `app.inflozo.com` at `d895c183`: after a reload the row was gone from the first
  frame. The reload fix (`d9e5f090`) shrank the gap from a whole heartbeat to one round trip; it did not close it.
reason: the gap is from the release landing to the reloaded page's own acquire, roughly one to three seconds of the
  other session's fifteen-second cycle, so an open second session wins it around one reload in ten. The release is
  not broadcast on `BroadcastChannel`, so a same-browser tab does NOT jump the gap early. When it happens nothing is
  lost silently: the reloaded tab is a reader, its commits are refused, and its flushes answer 423 (`heldElsewhere`)
  rather than writing. Candidate fixes, none executed (standing rule 1): (a) detect a reload on the way out with the
  Navigation API's `navigate` event (`navigationType === 'reload'`) and skip the release — browser support for
  browser-initiated reloads is a hypothesis; (b) never release on `pagehide` and rely on staleness — a closed tab then
  holds the lock ~60 s and B5c quotes a count the unload flush may already have sent; (c) a short grace before a free
  lock is taken, which needs somewhere to record "released at" — a column, so a migration.
owner: unowned; the review of Story 5.17 may take it, and (c) would be a Schema phase of its own (R-99).
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — the `pagehide` release (`leaving`) and
  the poll's one-extra-call acquire · `tools/probe/run-verify-lock.cjs`'s "Same session reloads" row, which reloads
  with no second session open and so does not exercise this race
seen again: the review's first deployed walk at `8ac31e6d` (2026-09-24) — with NO second session open, the reloaded
  page's re-acquire INSERTed and the outgoing page's release, filtered on the SAME session id, then deleted that row:
  `row: null` 2.5 s after the reload, the tab still editing with no bar, and the lock free until its next beat. The
  second run passed the row. So the gap is not only "another session's poll" — a late release alone can empty it,
  and fix (a) or (b) above would close both.

## Deferred from: code review of spec-5-17-the-edit-lock-and-the-take-over-choreography.md (2026-09-24)

### DW-241: a menu or picker already open when a session loses the lock stays open with live items

plain: If a small menu (the ⋯ beside a section, the section picker, the Site Remix box) is open at the exact moment
  your other window takes over editing, that menu stays open and its buttons still look pressable. Pressing one does
  nothing to the site — the editor refuses every edit in a window reading along — but the menu should have closed.
status: open
severity: low
origin: Story 5.17's review (2026-09-24). R-192 disables the triggers (the ⋯ button, + Add section, Site Remix) for a
  reader, and the Reset box is closed on the holder→reader flip; a menu or box that was ALREADY open is not.
reason: the guard underneath is `commit()`'s one early return, so nothing is written; only the surface is stale. Closing
  every open popover on the flip is one call to `closeMenus` plus the two dialogs, and it belongs beside the Reset
  box's own close — a Fix-phase item if the owner meets it, never a data risk.
owner: unowned
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — `land()`'s holder→reader flip;
  `lib/menu.ts`'s `closeMenus`

### DW-242: a holder's own reload paints its controls greyed for the server's first frame

plain: Reloading the window that is editing no longer shows the grey "reading along" bar for an instant (Story 5.17
  fixed that) — but for the same instant, about a tenth of a second, the settings panel's fields can look greyed out
  before the page recognises itself. Nothing is disabled once it has; it is a flicker in the panel, not the bar.
status: open
severity: low
origin: Story 5.17's review (2026-09-24). `selfMarkScript` marks `<html>` before the first paint and `globals.css`
  hides the bar and restores the panel's opacity under the mark, but the server also renders R-192's
  `<fieldset disabled>` for that frame, and a stylesheet cannot un-disable a fieldset. The walk's 100 ms sampler
  watches the bar only.
reason: closing it means the server not drawing `ReadOnly` at all for a tab it cannot identify — deciding the fieldset
  client-side after hydration — which reintroduces the one-frame editable shell for a GENUINE reader that `read.ts`'s
  first-paint read exists to prevent. The trade is the owner's to see first (R-80); none of his tests reported it.
owner: unowned
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/layout.tsx` (the mark) · `apps/web/app/globals.css`
  (the two rules under `html[data-lock-self]`) · `apps/web/components/kit/greyed.ts` (`ReadOnly`)

### DW-243: three sessions of one account asking at once — the second request silently replaces the first

plain: If you open the same project on three devices and two of them press Request editing within the same half
  minute, the first one to ask is told "Your other session kept editing" although nobody answered it — its request
  was simply overwritten by the second one. Two sessions, the case built and tested, are unaffected.
status: open
severity: low
origin: Story 5.17's review (2026-09-24). `edit_locks` carries ONE `nudge_requested_by`; `stillAsking` answers false
  both when the holder cleared it and when another session's nudge replaced it, and `land()` announces `kept` for
  either.
reason: telling the two apart needs either a second column (a migration, R-99) or the route refusing a nudge over a
  live one, which would make the second device's button silently fail instead. The owner's ruling on transport (R-191)
  already accepts that a third device is not v1's shape; recorded so the choice is made rather than met.
owner: unowned
location: `apps/web/lib/lock.ts` (`stillAsking`) · `editor.tsx` (`land()`'s `kept` announcement, commented) ·
  `lock/route.ts` (`nudge`)

### DW-244: the tab-close flush and the lock release leave on the same event, and a third session can slip between them

plain: When you close a tab that is editing, it does two things on the way out: sends its last edits, and gives up
  the right to edit. They are sent together and the browser does not promise which lands first. If your OTHER window
  checks in during that instant and takes the right to edit, the closing tab's last edits are refused. It needs three
  things to line up inside about a second, and your other window then holds exactly what the cloud held.
status: open
severity: low
origin: Story 5.17's review (2026-09-24). `visibilitychange` (the unload flush, Story 5.8) fires before `pagehide` (the
  release), both ride `keepalive`, and nothing orders their landing. A release that lands first frees the lock; the
  flush then passes `heldElsewhere` only if nobody acquired in between.
reason: the same shape as DW-240 (a reload's gap), with the same candidate fixes and the same costs; holding the release
  until the flush answers is not possible on a page that is going. It joins DW-240 rather than a fix of its own.
owner: unowned; whoever takes DW-240
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — the two `leaving` listeners

### DW-245: `record-edit-lock.py` folds a probe bug into "RUN VOID" and its cleanup can reference an unbound name

plain: The script that proved the lock's four database facts reports "the run was void" for two different reasons — a
  real control failing, and the script itself hitting a shape it did not expect — and if it fails before it has
  signed in, its cleanup line names a variable that was never set. It ran clean on 2026-09-23; this only matters on a
  re-run that fails.
status: open
severity: low
origin: Story 5.17's review (2026-09-24), in the Blind Hunter layer.
reason: tooling, not product; the fix is two `except` clauses and `sb = None` above the `try`. Also the F4 block in
  `RLS-TEST.sql` seeds `lock_generation = 10` as an absolute, which passes today because the block before leaves it at
  6 — a future block that pushes past 10 would fail on the monotonic guard rather than on what it tests; seed relative.
owner: unowned
location: `tools/probe/record-edit-lock.py` (the top-level `except` and `finally`) ·
  `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` (F4's seed), then `cp`

### DW-246: the keyboard gate goes red when Google Fonts hiccups at compile time, and a red `check` publishes nothing

plain: The automatic checks that run on every push include a keyboard walk that starts the app the way a developer
  does. Starting it fetches the site's three typefaces from Google's font service, and when that service answers
  oddly for a minute the walk cannot start and the whole push is marked red — nothing is published — although the code
  is fine. Pushing again fixes it. It happened once on 2026-09-24 and cost one deploy.
status: open
severity: low
origin: Story 5.17's review commit `17490278` (2026-09-24, 06:03Z): CI's `check` job failed at `pnpm keyboard` with
  Turbopack's `next/font/google queries have exactly one entry` while compiling `app/layout.tsx`'s JetBrains Mono. The
  same failure reproduced on this machine minutes later on the same checkout, and then the SAME commit passed the gate
  three times (a fresh worktree at the last green commit `23316f6d`, the same worktree at `17490278`, and the main
  checkout again — 51 passed each time). No file that reaches `next/font` changed in the commit. The build at
  `23316f6d` had passed the same step at 05:14Z.
reason: `next/font/google` fetches the font CSS at compile time and Turbopack's replacer refuses a response it did not
  expect; `next dev` has no retry. The cure is one of: self-hosting the three typefaces under `next/font/local` (no
  network at build, and Vercel's build fetches them today too), or a single retry of the dev boot in
  `run-keyboard-gate.sh`. Either is a story of its own; a re-push is the workaround.
owner: unowned
location: `apps/web/app/layout.tsx` (the three `next/font/google` calls) · `tools/keyboard/run-keyboard-gate.sh`
