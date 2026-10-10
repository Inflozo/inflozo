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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `'toString'` left `hostReadingCalls` in `eslint.config.js`, and one selector refuses only the zero-argument call a Date prints the host timezone with (`CallExpression[arguments.length=0] > MemberExpression.callee[property.name='toString']`); the core block sets `linterOptions: { noInlineConfig: true }`, so no disable comment switches a ban off. The ban still reaches every receiver — a Buffer's or a number's bare `.toString()` is refused too, since the selector cannot see a type — only the argument form is let through. Controls in `tools/check-baseline.mjs`, seen red with the change reverted: a Date's `.toString()` refused (any argument-less call is); `n.toString(16)` clean (HEAD refused it); `/* eslint-disable no-restricted-syntax */` beside `.localeCompare()` still refused (HEAD was silent).
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-231 ruled: every preset value is authored in prd.md Appendix D §D.d and held as data in `packages/library/packs/packs.json`; `tools/stress/test-vocabulary.mjs` fails `pnpm test` when the two disagree in either direction (pack, mode and role named — its control changes one dark accent, drops a preset and reverses the reference packs). Ink is black and white with one red (`#C8102E` / `#FF5A5F`), Tangerine's light accent is the roster's `#E8450A` with a dark on-accent; the kits' `PACKS`, the Calibration Set and S7a's dots stay calibration (`tokens.test.ts` still carries the kits' two as test data only).
owner: Story 6.2 (The twelve presets and the font pool), whose criteria carry its requirement word for word with its
  id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
ruling (owner, 2026-10-03, Story 6.2's Create, Question 1, option 1): *"The plan wins"* — R-231. Ink is black and
  white with one red; Tangerine's light accent is the roster's `#E8450A` with a dark on-accent; every value is authored in
  Appendix D §D.d. Story 6.2's Dev builds it and closes this entry.

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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — `configure-supabase-auth.py` no longer writes, reads or reports
  `sessions_inactivity_timeout`: the `SOFT` row, its 402 retry, its `--expect` branch and its `----` report line are
  gone, and one comment under `settings()` says why — a paid-plan field FR-A6's thirty rolling days never needed, and
  a SHORTER idle timeout would be a new decision about money, the owner's. Control against the live Management API
  (read-only): `--check --expect sessions_inactivity_timeout=720` exited 0 at HEAD and exits 1 after ("not a field
  this tool sets"); `--check` exits 0 with no `----` line; the existing `--expect mailer_otp_exp=901` control still
  exits 1. Re-run on the merged tree the same day: the same three answers.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03): `apps/web/lib/style-pack.ts`'s `PRESETS` is derived from `@inflozo/library/packs` — §D.d's twelve, each card's surface its light background, its accent and text — and the file holds no colour literal; the glyph family is the pool's heading face under `Inflozo pack ` (`packFacesCss`, linked in the signed-in layout). `style-pack.test.ts` holds `PRESETS` to the library preset by preset; D4a's cell and the dashboard card paint from it unchanged in shape.
owner: Story 6.2 (The twelve presets and the font pool), whose criteria carry its requirement word for word with its
  id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 12.2 (Webhooks and the entitlement state machine), whose criteria already say it — "`pro_past_due → free`
  on grace expiry" — and name this entry beside those words since the sweep's Dev (5.24a). *(Story 5.24a's Dev, 2026-09-28: it had
  no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — the rule written where it governs, as the triage ruled.
  `(dashboard)/loading.tsx`'s header now says what is true: the skeleton covers a SOFT navigation; on a cold load
  nothing is sent until the guards above it answer (`(authed)/layout.tsx`'s `currentUser()`, profile read and
  `resolveEntitlement`, and First Run's counts in `(dashboard)/layout.tsx`), and that is the rule rather than a gap,
  because a redirect decided above the first flush is a real `307` and one decided below it streams as a `200` (R-98's
  second effect, measured at Story 3.8). Nothing about the shell's render shape changed.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the run on the deployed site: `run-verify-dashboard.py`'s `clear-search` PASS on `/` and `/sites` (the link is the page without `?q=`, the click lands there with the box empty and the card back), axe zero violations at 1440, 834 and 390 over both no-match lines; run twice on production (once by the verifier, once after the harness's pooler connection was pinned to the app's CA), users 13 → 13 both times.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — THE CODE LANDED; the run on the deployed site is Review's. Both no-match
  lines end with a **Clear search** link to the page without `q` — `noProjectsMatch` (moved into `lib/projects.ts`
  beside `filterProjects`) and `SITES_EMPTY.noMatch`, in the icon picker's link classes — and `CLEAR_SEARCH` is the
  one word, the icon picker's included (R-170). The field keeps no ×. Extrapolated from P0's no-match rule (`P0 Editor
  Primitives - Spec.md:236`, R-74). The control is `run-verify-dashboard.py`'s new `clear-search` step (both lines
  clicked through, the card back, the field empty) with axe at 1440, 834 and 390; it closes when that run passes on
  the deployed site. Run against HEAD's deployment first (2026-09-29): `clear-search` FAILED as it should — no link on
  either page (`href: null`, the box still `zzzz`, the card not back) — with every other step green, the axe runs over
  both no-match lines included, users 13 → 13.

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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — `readEntitlement(client, userId)` in `lib/plan.ts` (`import type` only)
  now makes the entitlements read and its one log line, and `resolveEntitlement` calls it with the user-scoped client.
  `plan.test.ts` runs it through a real `createClient` (supabase-js 2.115.0) against a local server: a 500 gives Free
  and exactly one `entitlement: read failed {code}` line with no user id, the request reaching
  `/rest/v1/entitlements?select=state&user_id=eq.<id>`; `[{ state: 'pro_active' }]` gives Pro, the control. Seen red
  with the read made to throw on an error and with the `?.` removed, green after. No fake client: the shipped library
  builds, sends and parses the query.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — `run-verify-passkeys.py` on production: `named-aaguid` PASS (the virtual authenticator's `getAuthenticatorData()` rewritten at offset 37 with Windows Hello's AAGUID, the new row named "Windows Hello"; `auto-name` asserting "Passkey" is its control), `kill-mid-ceremony` PASS (the finish POST held, the `passkeys` row switched off over the pooler, released: S1's red sentence, still `/sign-in`, no `sb-*-auth-token` cookie), the switch put back after 2767 ms and read back byte-identical (`t`, its original `updated_at`); users 13 → 13.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — (1) and (2) are BUILT into `run-verify-passkeys.py` and close on its full
  run at Review (passkeys are off on production for a few seconds during it). `auto-name` now asserts "Passkey" and is
  the control for `named-aaguid`, whose page-side `getAuthenticatorData()` returns a COPY of the real buffer with
  bytes 37–52 set to the first AAGUID in `lib/passkey-aaguids.ts`, read and never retyped; the new row must carry that
  entry's name. `kill-mid-ceremony` holds only the finish POST, switches the `passkeys` row off over the pooler and
  releases it: S1's switched-off sentence in the red banner, still `/sign-in`, no session cookie; `switch-on` is its
  control. The value found is put back at once, in the browser half's `finally` and in the parent's, and read back.
  Executed locally on the harness's Chromium: the virtual authenticator sends `01020304-0506-0708-0102-030405060708`,
  NOT all-zero as reason (2) says (corrected beside the code, in `passkey-aaguids.ts`), and bytes written into the
  buffer in place reach `toJSON()`, hence the copy. `--check` green, users 13 → 13.

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
owner: Story 12.7 (The grace banner and the payment-failed email), whose criteria carry its requirement word for word
  with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Schema phase (2026-09-29), R-223 — the database now refuses the ticket itself. PostgREST's
  pre-request function `public.session_guard()`, wired as `authenticator`'s `pgrst.db_pre_request`
  (`supabase/migrations/20260929120000_session_guard.sql`, `SCHEMA.sql` §15), applied on production by the owner and
  read back. Executed on production: `run-verify-sign-out-everywhere.py`'s `rest-refused` FAILED before the apply (both
  former tokens 200 on a read, 204 on a write — its control) and PASSES after (401 `session_not_found` on both, with
  `WWW-Authenticate: Bearer error="invalid_token"`, the row unchanged, a live ticket, the secret key and anon still
  reading); a throwaway account's ended sign-in was refused on GET, HEAD, PATCH and a `security definer` RPC. The
  harness asserts it on every run; `RLS-TEST.sql`'s Story 5.24b block asserts the wiring and the definer's shape, its
  control (the migration withheld) aborting at the block. `MEASUREMENTS.md` §56 (with the cost: 0.28 ms a request,
  the save and the lock check-in unchanged within their spread); `VERIFY-AT-BUILD.md` item 59, because a role setting
  can be reset under us.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry and carries the Schema phase R-223 gave this entry, pushed first and alone (R-99). *(Story 5.24a's
  Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — its deployed half: `run-verify-sign-out-everywhere.py` on production, exit 0, every step PASS — `everywhere` lands on the sentence, `magic-link-after` signs in again, `rest-refused` PASS on both old tickets — beside the local `sign-out-landing.test.ts` from Dev.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — BUILT, ITS LOCAL HALF EXECUTED; it closes at Review when
  `run-verify-sign-out-everywhere.py` passes on the deployed site. `signOutFailed(client, scopes)`
  (`sign-in/signed-out.ts`, `import type` only) makes the calls in order, stops at the first failure and answers from
  `auth.getSession()` afterwards. `signOut` lands by it; `signOutEverywhere` now calls `['others', 'local']` instead
  of one `global`, so a failed first call leaves this device signed in and "try again" is true. Both comments state
  what auth-js 2.115.0 does. `sign-out-landing.test.ts` runs the app's `createServerClient` (ssr 0.12.6) against a
  local GoTrue: `others` 500 keeps the cookie; `local` 500, alone or after `others`, has the client delete it, landing
  on the signed-out and everywhere sentences; an expired ticket whose refresh answers 500 keeps the cookie and lands
  on the red line. Each control seen red with its change reverted (landing by the error, no stop after `others`,
  `getSession`'s error ignored, the scope dropped, `['global']`/`['others']`/reversed lists, the failure branch
  removed). Owed at Review: the harness's `everywhere` and `rest-refused` steps, which now send `scope=others` then
  `scope=local` to the real GoTrue.

### DW-42: FR-A5's two Dodo calls — stop auto-renew on a deletion request, offer resume on restore — are owed by Epic 12

plain: When someone asks to delete their account, their card must never be charged again while the 14-day
  countdown runs, and pressing Restore should offer to switch the subscription back on at the same price.
  Nothing in the product talks to Dodo yet and nobody can buy a plan, so Story 2.5 could not build this;
  the billing epic builds it with the rest of Dodo. Until then nobody can be charged, because nobody can pay.
status: open
owner: Story 12.5 (The billing page), whose criteria already carry it with its id: "FR-A5's two Dodo calls land here
  with the adapter". *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 15.5 (Reliability — alarms and the restore drill), whose criteria carry its requirement word for word
  with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — `PurgeDeps` gained `due(excluding, limit)`; `runPurge` takes batches of
  `BATCH` until nothing is due or `BUDGET_MS` (240 s, under the route's new `export const maxDuration = 300`) is
  spent, starts no account after it, and excludes every id it already tried. The route's due query adds
  `.not('user_id', 'in', …)` only for a non-empty list, and a `ponytail:` comment names the ceilings (an account that
  fails slowly still spends the budget; the exclusion list rides in the URL) and the upgrade (a `purge_attempts`
  column). `purge.test.ts`: `BATCH` always-failing accounts before a good one give `{ purged: 1, failed: BATCH }` in
  one run, red as `{ purged: 0, failed: 25 }` with HEAD's one batch and as `{ purged: 0, failed: 240 }` with the
  exclusion dropped; the injected clock stops the loop at 24 of 100 accounts on a 10 s step, red at 25 without the
  per-account check and at 100 without the budget; the route's exclusion, its `maxDuration` and a budget at the
  ceiling each fail the source test. Executed on production, read-only: the route's own `due` chain answers PostgREST
  without error with and without an exclusion, and the same `not.in.(…)` over `profiles` drops exactly the three ids
  listed (15 → 12); the production Vercel project is Pro with Fluid compute, so 300 s is within its limit.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 15.8 (The Test → Live cutover), whose criteria carry its requirement word for word with its id (R-195).
  *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — the far end is verified. `server/ghost-admin/db.ts` connects with `ssl: {
  ca: SUPABASE_ROOT_CA, rejectUnauthorized: true }`, the PEM inlined from the owner's `supabase/prod-ca-2021.crt`
  (Supabase Root 2021 CA, `CA:TRUE`, valid to 2031-04-26; committed as the constant's provenance, because a runtime
  read would not ship — DW-269). postgres.js 3.4.9 hands `tls.connect` the host as `servername`, so the chain and the
  host name are both checked. Executed from the app's own driver against the pooler (`MEASUREMENTS.md` §57): the PEM
  read out of `db.ts` connects; `tls.rootCertificates[0]` is refused `SELF_SIGNED_CERT_IN_CHAIN`; HEAD's `ssl:
  'require'` connects to anything, which was the finding. `run-verify-ghost-admin.py --check` re-executes the pair
  every run; `VERIFY-AT-BUILD.md` item 60 carries the expiry. The deployed half — Test connection through the pinned
  line — is Review's and the owner's step 4.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 7.18 (The deploy wizard), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — a busy or down Ghost has its own code and sentence. `ghostCode` answers
  `ghost_unavailable` for a `429` and every `≥ 500`; `403`, `404` and `422` stay `ghost_refused`.
  `CONNECT_MESSAGES.ghost_unavailable` is "Ghost didn't answer just now. Try again in a moment.", the banner's as
  `ghost_refused` is; `HEALTH_REASONS` does not name it, so the daily check stays undecided on it. Tests in both
  directions (`ghost-admin-rule.test.ts`, `connect-rule.test.ts`, `health-rule.test.ts`) — red with the 5xx branch
  removed, with every 4xx made unavailable, and with the branch gone. The three comments that named 429 under
  `ghost_refused` are corrected; `keys-test-refused` in `run-verify-ghost-admin.py` types a 403 and a new vector types
  `ghost_unavailable` (run at Review).
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 7.18 (The deploy wizard), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the deployed proof: `--only connect-paths` on production — `address-blocked` PASS, a connect to `https://127.0.0.1.nip.io` refused with `ghost_unreachable`'s sentence and an audit row whose detail is `{"ms":24,"blocked":true}`, while T1 connects (`path-page`). The review widened the list (IETF protocol assignments, benchmarking, multicast, reserved, broadcast, NAT64, 6to4, site-local) with a vector for each.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — THE CODE LANDED; the deployed-site proof is Review's. `blockedAddress(ip)`
  (`admin-rule.ts`, over `node:net`'s `BlockList`) refuses 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 100.64/10,
  0.0.0.0/8, `::`, `::1`, fc00::/7, fe80::/10 and an `::ffff:` address by its IPv4; `fetchWithKey` resolves the host
  (`dns.lookup`, all answers, bounded by `TIMEOUT_MS`) before any request and refuses on any blocked answer with
  `ghost_unreachable`, an audit row whose `detail.blocked` is true, and a `{code}` log line — in `fetchWithKey`
  because every Admin call passes through it and a `sites.url` can reach it without the wizard's shape check.
  `normaliseSiteUrl`'s comment no longer overclaims; a `ponytail:` names the ceiling (the fetch resolves again — DNS
  rebinding) and the upgrade (`https.request({ lookup })` pinned to the checked address). The paired rate limit is not
  built: with private addresses refused, Inflozo fetches only what the caller could fetch. Vectors in
  `ghost-admin-rule.test.ts`, red with a range dropped. Closes when the harness's connect to
  `https://127.0.0.1.nip.io` shows `detail.blocked` on the deployed site while T1 connects. The harness's
  `connect-paths` block holds it: on HEAD `address-blocked` FAILED — the sentence was already true (HEAD cannot reach
  127.0.0.1 either, the spec's point) but the audit row carried `{"ms":168}` and no `blocked` — and on this story's
  code it PASSED, `{"ms":12,"blocked":true}`, with `path-page` connecting T1 in the same run. Against HEAD's
  deployment (`2450daea`) first, through `--only`, the step went red; on this story's code, run locally through the
  product's own pages (Chromium mapping app.inflozo.com to a TLS proxy in front of the app on this machine, with the
  production database, T1 and T3), all eight blocks passed together under `next dev` and again under a production
  build (`next build` + `next start`), users 13 → 13 each time.

### DW-59: the connect action's failure branches are pinned by source text, not executed

plain: The code that undoes a half-made connection (the key could not be stored, so the site row is removed
  or put back as it was), the checks on what Ghost answers before it becomes a link, and the "we couldn't load
  your sites" screen are all real, but the only automatic tests that watch them read the code as text and look
  for the right words. Nothing runs them with a failure injected, because the file cannot be loaded outside
  Next. Extracting the sequence into a plain function that takes its collaborators as arguments — the shape
  Story 2.6's purge used — would let a test run it with a store that fails.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — connect's failure branches are EXECUTED, not read as source text.
  `lib/connect-rule.ts` gained `KEPT` (every column connect writes before the store, from which the opening read
  `CONNECT_READ` is built), `siteWrite` (the connection and the cosmetic `site/` patch, with the `isHttpUrl` guards
  and `settings_read_at`) and `storeOrUndo` (the store, and the undo when it fails — a kept record put back as it was,
  a new one deleted); `connectSite` calls all three, and the Sites list's unread banner takes its screen from
  `sitesScreen`, a pure decision. `connect-rule.test.ts:451-479`'s source-text test is replaced by tests that run the
  sequence with a store that fails: swapping the two branches, and a column `siteWrite` writes that `KEPT` does not
  name, each went red (and `sitesScreen` letting an unread list be the first-run screen), and green restored. Done
  together with DW-65, which changed the same write.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — closed on R-219, R-226 and PRD Appendix G (support for a Ghost under a
  path is recorded there as future work). `pathOf` (`lib/connect-rule.ts`) is the typed path with a trailing
  `/ghost…`, the query and the hash set aside; `connectSite` asks the ROOT's `config/` with the typed key when a path
  was typed — after `already_connected`, BEFORE the plan's limit — and only a `404` there answers R-219's sentence,
  "Inflozo connects a Ghost site at the root of its address — /blog isn't supported yet.", under API URL, with nothing
  stored; any other answer carries on as before and IS the validation (one `config/` per connect), so a page's address
  on a site at the root still connects. `pathRefused` is the pure decision. Tests: `pathOf`'s vectors both ways, the
  decision both ways, the sentence verbatim — each red on its mutation. The harness's `example.com/blog` refusal and
  its positive control, T1 connected by a post's address, run on the deployed site at Review.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — the rule is written where it governs. The header of
  `sites/(list)/page.tsx` now OPENS with it: the pills' line carries metadata only; the state line carries the state,
  its timestamp and the Preview-only chip, beside Connected only where the card can hold it and never on a wider grid
  (the owner, Story 3.3 Question 2); the ⋯ at the header row's top right is the one place the card's actions live; a
  story adds to this layout and never restores the frame's. Every "OBEYED DW-57" pointer in that header,
  `site-menu.tsx` and `site-notices.tsx` now aims at that rule rather than at this ledger.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Stories 7.26 (Theme ZIP export) and 15.7 (The Ghost(Pro) launch gate), whose criteria each carry their half
  word for word with its id — the Preview-only card at export, and the tier's name decided by the captured payload
  (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), closed on the owner's ruling **R-220** (2026-09-28, 5.24's Create, Question 11):
  *"No wait, as today"* — Re-check plan and Re-check connection ask the customer's Ghost on every press, and the double
  press stays blocked (R-98).
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — one compare-and-set for every writer. `server/site-settings.ts`'s
  `patchSite` reads the row's `site_settings, credentials_present, capability_source, disconnected_at, updated_at`,
  asks the writer's `patch(row)`, and writes only while `updated_at` (`sites_touch`'s per-transaction `now()`) is
  still the one it read; a lost race re-reads and re-patches, three tries, then writes nothing and logs `contended`.
  Every writer goes through it: `probeSite`, the editor's re-read (`rereadSettings`), `answerPortal` and `answerPlan`
  (their preconditions re-checked inside the patch), connect's cosmetic `site/` write, the Content save and the
  disconnect stamp; connect's insert, re-adopt and whole-record restore are the named exceptions.
  `site-settings.test.ts` executes it over a client that evaluates every `.eq`: a second writer landing between read
  and write loses nothing, and three lost races write nothing — both red with the `updated_at` filter dropped.
  `server-wiring.test.ts` holds the rule: no `site_settings` or `credentials_present` write outside `site-settings.ts`
  but the named exceptions — run on HEAD's `sites/actions.ts` and `site-probe.ts` it names all seven writers this
  story moved.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
owner: Story 9.5 (A2 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
  (Story 6.4, with the brand seed Story 6.6's) inherits it and decides whether a pack that carries a site brand shows it, offers to clear
  it, or re-derives the pack from it. Only `placeholderFor` reads it today, for the dashboard card's
  accent; every other field is stored for the epic that uses it.
note (Story 6.1's Create, 2026-10-03): the Style Pack editor is Story 6.4's and the brand seed Story 6.6's, not 6.1's —
  6.1 is the token engine and reads no `brand`; `apps/web/lib/style-pack.ts:6-7` says the same wrong thing and 6.1's
  Dev corrects it.
note (Story 6.1's Dev, 2026-10-03): corrected — the `also:` line above names Story 6.4's editor and Story 6.6's seed,
  and `apps/web/lib/style-pack.ts`'s header now says the engine is 6.1's, the packs 6.2's, the editor and per-mode
  overrides 6.4's and the brand seed 6.6's. The token engine reads no `brand`.
note (Story 6.4's Create, 2026-10-04): the `also:` line's decision, as 6.4 plans it. The Style Pack editor SHOWS the
  site's accent as "From your site" in its colour picker. The accent comes from the linked site's stored brand,
  re-validated by `isAccent`, and nothing is written until it is picked. The editor never clears `brand` and never
  re-derives a pack from it. The logo is left for Story 6.6's seed, and the menu for the epic that places a header.
  The editor writes `style_pack.preset` and `style_pack.packs` and nothing else.
note (Story 6.4's Dev, 2026-10-04): built as planned. The colour picker's "From your site" dot is the linked site's
  stored `site_settings.brand.accent` through `isAccent` (`read.ts`'s `siteAccentOf`, `#RRGGBB`), absent where there
  is none, and a press only sets the draft. `sync_project_doc` sets `preset` and `packs` and leaves every other key, so
  `brand` survives a save (the deployed walk's step 103 seeds one and reads it back untouched). The dashboard card still
  paints the site's accent over an own pack's (`placeholderFor`, FR-C4). Nothing here closes this entry.
note (Story 6.6's Create, 2026-10-05): the `also:` line's last decision, as 6.6 plans it. The pack is re-derived from
  the site's accent (the seed, `brandSeed`), and `style_pack.brand` is no longer written: once the accent is in the pack
  nothing reads it, so `placeholderFor`'s override goes, and rows that hold one keep it, unread. The logo is not copied:
  the owner ruled R-240 (6.6's Question 1, option 1), so the logo stays Ghost's, as D6a and B17 draw it. The menu still
  waits for the epic that places a header. The announcement half stays Story 9.5's.
note (Story 6.6's Dev, 2026-10-05): built — the `also:` line is settled. "Use your brand" seeds the site's accent into
  the pack in force (`brandSeed`, one rule for S2c and the Style Pack list's "From your site" row), `style_pack.brand` is
  no longer written, and `placeholderFor` paints the pack alone, so nothing reads `brand` any more (rows written before
  6.6 keep it, unread; `stylePackSchema` still parses it). The logo is copied nowhere (R-240). Still open here: the menu,
  for the header epic, and the announcement half, Story 9.5's.

### DW-67: a page that 404s inside the signed-in shell still answers HTTP 200

plain: When you open a link to something that is not yours or no longer exists — say a brand screen for
  a site whose brand has gone — Inflozo shows you the "not found" page, which is right. But the invisible
  status code the browser receives says 200 (success) rather than 404. A person sees the correct page;
  a search engine, a monitor or a script would be told the page was fine.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the status half: `--only brand-none` on production, PASS — the direct load of `/sites/brand?site=<a site with no brand>` and the forged `?site=` both answer HTTP `404` (the layout above the boundary), run twice (the second after the harness's pooler connection was pinned). The review made an empty `?site=` a 404 too. Every connect in the run still landed on S2c: the forwarded-header hypothesis, executed.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — THE CODE LANDED; the status is asserted at Review. `sites/brand/layout.tsx`
  sits above the segment's `loading.tsx` and, only when the request's `SEARCH_HEADER` names a `site`, reads the row
  through `brandSiteOf` — a `cache()`'d reader it shares with `BrandScreen` — and calls `notFound()` for no row or no
  brand: a real `404`. `BrandScreen` keeps its own guard (the popup never passes through the layout). Read in Next
  16.3.1's source: a server action's `redirect()` is rendered by an internal fetch carrying the POST's own headers
  (`action-handler.js`, `createRedirectRenderResult`), which is why the layout acts only when there is a `site` to
  judge. `brand-none` now asserts `404` for the direct load and for the forged `?site=`, and every connect landing on
  S2c is the positive control; this closes when that run passes. On HEAD `brand-none` FAILED (`200/200`); on this
  story's code it PASSED (`404/404`), every connect in the run landing on S2c. Against HEAD's deployment (`2450daea`)
  first, through `--only`, the step went red; on this story's code, run locally through the product's own pages
  (Chromium mapping app.inflozo.com to a TLS proxy in front of the app on this machine, with the production database,
  T1 and T3), all eight blocks passed together under `next dev` and again under a production build (`next build` +
  `next start`), users 13 → 13 each time.

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
owner: Story 15.1 (The E2E suite, including the keyboard-only journey), whose criteria carry its requirement word for
  word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-10-05 (Story 6.6)
resolution: Story 6.6's Dev (2026-10-05) — not drawn, by the owner's ruling R-242: built from S2c as built and the
  popup's columns that scroll apart (S11e's idiom), the spec's "Built from" table. From `tablet` up the fieldset is a
  flex column under its legend and the card list (`data-brand-cards`) fills the rail's free height and scrolls there
  with the browser's own scrollbar, 2px of padding inside a 2px negative margin keeping each card's focus ring
  unclipped; "Which project?" stays above it and the caption and both presses at the rail's foot. Below `tablet`
  nothing moved. The proof is the owner's side-by-side approval of three and twenty-five cards at 1440, 834 and 390 in
  6.6's Dev session (R-242; given 2026-10-05, Question 4), and `run-verify-ghost-admin.py`'s `brand-many` on the deployed build at Review: Pro's cap of
  projects (`PLANS`), the caption and both presses in view with the window unscrolled at 1440 and 834 in the window and
  on the full page, the list scrolling inside the rail, and at 390 no scroller of its own.
  **Review (2026-10-05): `brand-many` ran on the deployed build and passed**, and the bound gained what it lacked: a
  check in CI (`6.6 · DW-70 ·` in the keyboard gate, on a harness page mounting the real panel; the bound removed turns
  it red) and a floor of two cards, because in a short window from tablet up the list shrank to a sliver (the rail now
  scrolls as a whole past the floor; every approved state is byte-identical before and after). The ticked project could sit out of sight in the
  scroller; the owner ruled it is drawn first (R-243, Story 6.6's Question 5), built and approved the same day.
owner: Story 6.6 (Auto-branding seeds the pack), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
note (Story 6.6's Create, 2026-10-05): planned. The owner ruled R-242 (6.6's Question 3, option 2): not drawn. The
  chooser at scale is designed from S2c as built and the popup's columns that scroll apart (S11e's idiom). From tablet
  up, the cards fill the rail's free height and scroll there, so the caption and both buttons stay in view with 25
  projects. He approves it side by side in 6.6's Dev. A T1-only harness block, `brand-many`, inserts 24 projects and
  holds it at 1440, 834 and 390.

### DW-71: three brand keys are stored for no reader, and no epic has claimed them

plain: When Inflozo reads your brand off your Ghost site it keeps seven things. Four are used today
  — your colour, your logo, your menu, and your site's title, which names the project that gets made
  for it. The other three (your site icon, your cover picture and your description) are saved and
  nothing reads them. That is fine if some later part
  of the product wants them, but nothing has said which part, so they could sit there for ever.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — `Brand` and `brandOf` keep the three fields with a reader: `accent`,
  `logo` and `nav` (S2c draws all three, `placeholderFor` and the canvas's surfaces read the accent, the project's
  name is `sites.title`). `icon`, `cover`, `description` and `title` are no longer stored; rows already stored keep
  them until their next brand read, and nothing reads them. `hasBrand` now checks EVERY field `Brand` promises — three
  vectors, each `true` at HEAD and `false` after (a good accent beside a `javascript:` logo, a good logo beside a
  non-colour accent, a good accent beside a broken menu item; `{accent: 42}` was already false and is no control).
  `BRAND_KEYS` in `run-verify-ghost-admin.py --check` is `accent_color, logo, navigation`; `style-pack.ts` says who
  reads what.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — `--only brand-ownership` on production, five runs out of five PASS (six of six counting the pass inside the eight-block run), each exit 0, users 13 → 13 — the reliability Story 3.9's review asked for, seen.
  `run-verify-ghost-admin.py` did not complete a run in four attempts (the spec's `## Verification`,
  Executed at Review, with the control: the site answered 200 on both hosts and two other browser
  harnesses passed against the same deployment). So the change below is IN the harness and has never
  been executed. Closing it needs one completed run, which is what DW-92 is about.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: it had no owner line.)*
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
amended: Story 5.24b's Dev (2026-09-29) — `brand-ownership` runs alone now (`--only brand-ownership`, DW-92). Against
  HEAD's deployment it passed all five runs that reached the step, each landing on not-found with the sentence inside
  `<main>` and the popup forge landing on the list (seven attempts: one died on this machine's network,
  `net::ERR_NETWORK_CHANGED`, and one in the T1 seed before the step); it passed again in both local runs of this
  story's code, where DW-67's layout now answers the forged full page above the segment's `loading.tsx`. Closes at
  Review, when it passes five of five against this story's deployment.


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
owner: Story 7.20 (The backup gate and the pre-Inflozo snapshot), whose criteria already carry it with its id:
  "FR-C6's 90-day orphan purge is built here". *(Story 5.24a's Dev, 2026-09-28: was "**Story 7.20** (the backup gate and
  the pre-Inflozo snapshot), Epic 7 — the story that first writes a `site_snapshots` row, so the purge and its subject
  are designed together")*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — one transaction for both keys. `remove({ siteId, userId, kinds, route })`
  clears every named kind inside ONE `sql().begin`, keeping the `ref is not null` guard and the per-kind conditional
  `credential_change` audit row (written inside the transaction); `disconnectSite` makes one call naming `['admin',
  'staff']` and `removeToken` one naming `['staff']`. `server-wiring.test.ts` holds it: one `remove(` in
  `disconnectSite` naming both kinds, and one `begin(` in `remove`'s body around the loop — red with the two calls
  restored, and red with the `begin()` moved inside the loop.
severity: low
origin: Story 3.5 code review (2026-09-09) — the Edge Case Hunter and the Blind Hunter both reached it from
  `disconnectSite`'s two sequential `remove()` calls
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "**Epic 7**, the story that first stores a Staff Access Token —
  which is the story that makes this reachable at all")*
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
owner: Story 7.20 (The backup gate and the pre-Inflozo snapshot), whose criteria carry its requirement word for word
  with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "**Story 7.20**, the orphan purge — the job that acts on the
  deadline, and the only place that can read both homes at once")*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the deployed proof: `--only manage-keys` on production — `keys-two-fields` PASS: the Admin row's form cloned with a Content key field added and posted landed on `?keys=keys_failed` with the sentence, and the `sites` row, `private.site_credentials` and `credential_change` were unchanged.
severity: low
origin: Story 3.6 code review (2026-09-09) — the Edge Case Hunter
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that gives Manage keys a single combined Save, if
  one ever does")*
location: `apps/web/app/(app)/app/(authed)/sites/actions.ts` (`saveKeys`, the three sequential branches)
reason: Unreachable from the product. `keys-panel.tsx` renders three `<form>`s and each carries exactly one
  typed field, which `keys-js-off` asserts off the SERVED markup every run — so producing this needs a
  hand-built POST, and the worst it yields is a true save described by a slightly wrong sentence on the
  crafter's own site. Nothing is written that the caller did not ask for, ownership is checked before every
  branch, and no other account is reachable. The fix — one transaction across all three, or a refusal of
  multi-field posts — is worth making only if the screen ever grows a combined Save, and it would be that
  change's to make.
amended: Story 5.24b's Dev (2026-09-29) — THE CODE LANDED; the deployed-site proof is Review's. `oneCredential(form)`
  (`lib/connect-rule.ts`) counts the credential fields present, and `saveKeys` refuses more than one with
  `keys_failed` — "We couldn't save that just now. Nothing changed" — BEFORE the empty check and before any read or
  write, so the sentence is true. `connect-rule.test.ts` with Node's `FormData`: every single field passes, any two
  and all three are refused (red with two admitted). Closes when the harness's two-field post on the caller's own T1
  row lands on `?keys=keys_failed` with the sentence and the `sites` row, `private.site_credentials` and
  `credential_change` unchanged. The harness step is `keys-two-fields` (`manage-keys`): on HEAD it FAILED the way the
  entry said — the two-field post STORED one credential (`credential_change` 1 → 2) and did not land on the sentence —
  and on this story's code it PASSED, the row, the credential and the audit count unchanged. Against HEAD's deployment
  (`2450daea`) first, through `--only`, the step went red; on this story's code, run locally through the product's own
  pages (Chromium mapping app.inflozo.com to a TLS proxy in front of the app on this machine, with the production
  database, T1 and T3), all eight blocks passed together under `next dev` and again under a production build (`next
  build` + `next start`), users 13 → 13 each time.

## Deferred from: code review of spec-3-4-take-my-brand-from-my-site-in-one-click (2026-09-10)

### DW-82: opening a window over the Sites list drops the list's own filter, and closing it lands on the bare list

plain: If you have typed something into the Sites search box and then open "Use this site's brand" or
  "Manage API keys" on a card, the search is forgotten — the window opens over the full list, and when
  it closes you are on the full list too.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the deployed proof: `--only search-kept` on production, PASS — over `/sites?q=ghost6`, both windows opened with the search in their address and every way out (✕, Escape, Cancel, a save, a refusal) landed back on `/sites?q=ghost6` with the box still filled. The review added a source rule that every landing in `sites/actions.ts` outside Connect's carries `q`.
severity: low
origin: Story 3.4 code review, seventh review (2026-09-10) — the Blind Hunter and the Edge Case Hunter
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches the Sites list's filter, or
  whichever of Epic 3's stories the owner reports it on")*
location: `apps/web/app/(app)/app/(authed)/sites/panel-link.tsx` (`router.push(panel)` — `brandPopupPath`
  and `keysPopupPath` carry only the site id) · `panel-modal.tsx` (`router.replace('/sites')`) ·
  `sites/actions.ts` (`SITES_URL` as every action's landing) · `brand-panel.tsx` and `keys-panel.tsx`
  (the ✕ and Cancel as `<Link href="/sites">`)
reason: The mechanism is shared by both windows and was built in Story 3.6's Fix (`acd31327`) on the
  owner's finding that the windows must live at the list's own address; carrying `?q=` through means
  every one of those six landings composes its URL from the current search params instead of a constant,
  which is one more thing each of them can get wrong, for a filter that a single keystroke restores. Worth
  doing when the list has more than a handful of cards for anyone, which today it does not.
amended: Story 5.24b's Dev (2026-09-29) — THE CODE LANDED; the deployed-site proof is Review's. `sitesPath(q?,
  extra?)` (`lib/connect-rule.ts`, `URLSearchParams`) is the one way to `/sites`: `keysPopupPath` and `brandPopupPath`
  (moved beside it) carry `q`; `PanelLink` and `PanelModal` read the list's own `q` through `useSearchParams()`; both
  panels' ✕ and Cancel and the popup screens' render-time exits take `back`; and every action's landing goes through
  `listQuery()`, which reads `q` off the action's own request (`SEARCH_HEADER`). Connect's landing drops it on purpose
  — the new card could be filtered out. Tests in `connect-rule.test.ts`. Closes when the harness block that searches,
  opens each window and closes it by ✕, Escape, Cancel and a save finds `?q=` kept. The harness block is `search-kept`
  (✕, Escape and Cancel on both windows, a save and a refusal): on HEAD it FAILED at the first window, which opened
  without `q`; on this story's code it PASSED. Against HEAD's deployment (`2450daea`) first, through `--only`, the
  step went red; on this story's code, run locally through the product's own pages (Chromium mapping app.inflozo.com
  to a TLS proxy in front of the app on this machine, with the production database, T1 and T3), all eight blocks
  passed together under `next dev` and again under a production build (`next build` + `next start`), users 13 → 13
  each time.

## Deferred from: code review of spec-3-6-manage-keys-and-the-partially-credentialed-site (2026-09-10, third pass)

### DW-83: the moved-domains lookup picks the newest matching record, not the one that says most

plain: If you have connected the same Ghost site at three addresses and one of them is still connected,
  the "Moved domains?" note on the newest card may talk about the 90-day safety-net copy (an old,
  disconnected one) when a live twin exists — or the other way round.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — `moved-order-term` inside `--only moved-domains` on production, PASS in both runs that reached it: without the first order term the product's query picked the NEWER disconnected record; with it, the older live decoy.
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
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches FR-C8's hint, or Story 3.7 if its
  health check reads `admin_key_id`")*
location: `apps/web/server/ghost-admin/index.ts` (`findSiteByAdminKeyId`, `order by s.created_at desc limit 1`)
reason: needs a third record carrying the same Admin key id under one account, which nobody has today;
  the fix is an `order by (s.disconnected_at is null) desc` or returning every match, and either wants
  the harness seeding two decoys.
amended: Story 5.24b's Dev (2026-09-29) — THE CONTROL THE 3.9 REVIEW ASKED FOR IS BUILT AND EXECUTED, inside
  `moved-domains` while its seeding exists: `moved-order-term` runs `findSiteByAdminKeyId`'s own query, read out of
  `index.ts`, read-only on the harness's `sql` — WITHOUT its first order term it picks the NEWER disconnected record,
  WITH it the OLDER live decoy — so the seeding is one where the term decides. PASS in both attempts that reached it
  against HEAD's deployment, `moved-domains` then drawing the live hint and not the snapshot one, and again in both
  local runs of this story's code. Closes at Review with the run against this story's deployment.

### DW-84: closing the keys window while a save is still in flight can re-open it with the answer

plain: If you press Save and then Escape before the answer arrives, the window closes and then comes
  back with the result you had already walked away from.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — its first half: `--only keys-escape` on production, PASS — Test connection's POST held, Escape pressed: the window stayed open with no close event and its address unchanged, ✕ and Cancel `aria-disabled`, and the released answer drawn in the open window. The review made the greying VISIBLE (one CSS rule; R-192) and synced the exits on mount.
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Edge Case Hunter
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches `panel-modal.tsx`")*
location: `apps/web/app/(app)/app/(authed)/sites/panel-modal.tsx` (`onClose` → `router.replace('/sites')`) ·
  `sites/actions.ts` (`keysRedirect` onto `/sites?manage=…`)
reason: a race a customer has to work to reach — the panel's own saves answer in well under a second —
  and the answer that arrives is a true one; tracking an in-flight submit across a navigation is more
  state than the window has today. The cross-tab twin (`credentials_present` read-modify-written by the
  Content save while another tab stores a key) is the same family and the same reason.
amended: Story 5.24b's Dev (2026-09-29) — THE SECOND HALF IS CLOSED; the first is Review's. THE CROSS-TAB TWIN: the
  Content save writes `credentials_present` through `patchSite`'s compare-and-set with `contentKeyPatch`, patched from
  the row as it stands AT THE WRITE — a key `store()` put in from another tab survives — and refused on a record
  disconnected since; `site-settings.test.ts` executes both (red with the guard removed). THE WINDOW: `PanelModal`
  refuses Escape and the backdrop while anything inside is `aria-busy="true"`, and a `MutationObserver` greys the ✕
  and Cancel (`data-panel-exit`, `aria-disabled`, never `disabled`) and refuses their clicks; one fix covers the keys
  and brand windows, and a `ponytail:` names the ceiling (Chromium honours one cancelled Escape per user activation).
  Closes when the harness step that holds the save's POST, presses Escape and releases finds the window neither closed
  nor reopened on the deployed site (and red on HEAD, run first). The step is `keys-escape`: on HEAD it FAILED (the ✕
  and Cancel not disabled, one close, the answer arriving into no window); on this story's code it PASSED — both
  `aria-disabled`, Escape leaving the same window open, no close, and the released answer drawn in it. Against HEAD's
  deployment (`2450daea`) first, through `--only`, the step went red; on this story's code, run locally through the
  product's own pages (Chromium mapping app.inflozo.com to a TLS proxy in front of the app on this machine, with the
  production database, T1 and T3), all eight blocks passed together under `next dev` and again under a production
  build (`next build` + `next start`), users 13 → 13 each time.

### DW-85: three live-harness controls Manage keys still owes

plain: Three things the API keys screen does right are not yet proved on the live site every run.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — `--only moved-domains` on production, exit 0, PASS — the moved hint on one card (`?moved=<id>&old=orphan`), the decoy seeding and the five `movedAgain()` presses, with `moved-order-term` inside it; users 13 → 13, nothing written to T3.
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
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches
  `tools/probe/run-verify-ghost-admin.py`'s Manage-keys block")*
location: `tools/probe/run-verify-ghost-admin.py` (`moved-domains`, `keys-forged`, `brand-ownership`)
reason: (1) the `?old=live` hint — a matched record that is STILL connected drawing
  `KEYS.movedStillConnected` — needs a second decoy seeding; (2) a decoy under `OTHER_USER_ID` carrying
  the same Admin key id producing NO hint, the cross-account control for `findSiteByAdminKeyId`'s
  `user_id` clause; (3) `useBrand`'s popup branch on a vanished row (`brand-ownership` forges on the full
  page only). The review added `keys-content`, `keys-test-refused`, `keys-phone`, the ✕, Back and
  `admin_key_id` conjuncts instead; these three are the remainder, each a seeding rather than a fix.
amended: Story 5.24b's Dev (2026-09-29) — ALL THREE SEEDINGS EXECUTED for the first time, through `--only` against
  HEAD's deployment: (1) the still-connected decoy drew `KEYS.movedStillConnected` and not the snapshot wording; (2)
  the cross-account decoy drew no hint (`moved-domains` PASS); (3) the forged popup post landed on the list
  (`brand-ownership` PASS in each of the five runs that reached it). Closes at Review, with the same runs against this
  story's deployment.

### DW-86: two Ghost Admin navigation paths in the copy are asserted, not cited

plain: The API keys screen tells you where in Ghost Admin to find your Staff Access Token and where to
  regenerate keys. Both paths were written from memory of Ghost's screens, not checked against them.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — both sentences read in Ghost's own admin, 5.130.6 and 6.58.0 (the npm
  tarballs, `MEASUREMENTS.md` §58). `KEYS.staff.ask` is right on both majors. `KEYS.rollHint` was not: both open
  Settings → Integrations on the **Built-in** tab (`useState("built-in")`) and a customer's own integration is under
  **Custom**, so it now reads "To roll keys: Ghost Admin → Settings → Integrations → Custom → Inflozo → Regenerate.
  Old keys stop working the moment you regenerate." Each sentence cites its tarball files beside it; the departure
  from S11d `:232` and S11e is the third recorded beside `KEYS` (R-74); `connect-rule.test.ts` pins both sentences
  (red with the frame's words restored).
severity: low
origin: Story 3.6 code review, third pass (2026-09-10) — the Blind Hunter
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 3.7, or the first story that opens Ghost Admin's UI in a
  browser for another reason")*
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria already carry it with its
  id: "FR-C5's compatibility watch is built here". *(Story 5.24a's Dev, 2026-09-28: was "**Story 9.1** — A1 Headers'
  content model, stylesheet and designs #1-4, the first story that ships designs to customers and the first in which any
  design declares `ghostCompat`. Epic 7's redeploy path (FR-J14) exists by then, so the notice has somewhere to send
  people. **One caveat for whoever picks it up, not a second-guess of the ruling:** epics.md flags Story 9.1 as the one
  story in each category run that "does strictly more than the others" and names A1 as the calibration point for session
  sizing. If 9.1 overruns, this is the piece to move to A1's owner gate (Story 9.4) rather than something the category
  itself owes — the epic's own note says to resize the later stories, and this is not a design.")*
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
owner: Story 11.2 (The starter chooser), whose door line now carries it word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: it had no owner line.)*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — `check-access.py` reads the expiry from GitHub's own
  `github-authentication-token-expiration` header on `GET /rate_limit`, through a pure `github_verdict()`: FAIL unless
  a 200 carries a parseable date, `warn` at 30 days or fewer, `ok` with the date otherwise; any FAIL line now exits 1,
  and the tool takes its arguments through argparse, so `--help` no longer runs every check and sends the email.
  `--self-check` holds eight verdicts both ways with no network and no email, and went red under each of three
  mutations (the window made exclusive, a missing header let through, a 401 let through). One full run the same day:
  exit 0, `GitHub token -> /rate_limit, and its expiry HTTP 200 — expires 2027-09-05, in 341 day(s)`, the register's
  date. `VERIFY-AT-BUILD.md`'s GitHub-token row names the tool.
severity: low
origin: Story 3.9 review (2026-09-11), on DW-5's closure
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "whichever story next touches `tools/probe/check-access.py`")*
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
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the card's half: `run-verify-passkeys.py` on production — `inert-held` and `inert-released` PASS: inside the held finish POST the sign-in form is `inert` and `aria-hidden`, no control takes focus and Tab never lands inside; after the release they are reachable again. The error-page half was Dev's (`pnpm keyboard`'s DW-91 test).
severity: low
origin: Story 3.9 review (2026-09-11), verification-gap layer, on DW-34 and DW-37
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first story to add a local-build step to a harness
  (DW-34's own note names `run-verify-dashboard.py --url` on a `next build && next start` as the shape), or Story 12.x's
  sign-in work for the passkey half")*
location: apps/web/app/(app)/app/error.tsx:52 · apps/web/app/(app)/app/sign-in/sign-in-form.tsx:156 ·
  tools/probe/run-verify-passkeys.py
reason: `document.title` in the error boundary and `inert`/`aria-hidden` on the pending card are each
  pinned by nothing: delete either line and `pnpm check`, the RLS gate and both harnesses stay green
  (executed at the review). The passkeys harness drives a CDP virtual authenticator, so holding the
  ceremony pending — presence simulation off — and running the dashboard harness's focus probe plus axe
  over the card is the repeatable form; a throwing route for the error page exists only on a local
  build, which no harness starts today.
amended: Story 5.24b's Dev (2026-09-29) — THE ERROR PAGE'S HALF HAS ITS CONTROL; the card's closes at Review.
  `app/(app)/app/harness/error/page.tsx` throws, and 404s unless `INFLOZO_HARNESS` is set; it sits in `HARNESS_ONLY`,
  `NO_SKELETON` and the editor walk's step 79. `journey.spec.mjs`'s test reads the tab title "Something went wrong ·
  Inflozo" and the error heading on screen: red with `error.tsx:56` deleted (`Received: ""`), green restored, and
  green inside `pnpm keyboard`. The card's half is `inert-held` / `inert-released` inside `run-verify-passkeys.py`'s
  `kill-mid-ceremony`: while the finish POST is held the form is `inert` and `aria-hidden`, no control takes focus and
  Tab never lands inside, and after the release they are reachable — the pair is the control, and it runs at Review.

### DW-92: the Ghost-admin harness can no longer finish a run, so its own newest controls have never executed

plain: The big automated check that drives a real browser against the live site has grown long enough
  that it runs out of time before it finishes — four tries in a row. Everything it newly checks is
  therefore written down but never actually run. It needs a way to run one section on its own.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Review (2026-09-29) — the runs: every registered block completed alone on the deployed site — `connect-paths`, `brand-none`, `brand-ownership` (×5), `manage-keys`, `moved-domains`, `keys-content`, `search-kept`, `keys-escape` — nothing written to T1 or T3, users 13 → 13 on every run. Found by the runs: `manage-keys` died at the same wait twice (the ⋯ row clicked before hydration went to the full page); the row is now clicked once React holds it, and the block passed after. `--only no-such-step` exits 2 before any key is read.
severity: medium
origin: Story 3.9 review (2026-09-11) — four consecutive attempts, one network death and three 2700s
  timeouts, with the site answering 200 on both hosts throughout and two sibling harnesses passing
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that needs a `run-verify-ghost-admin.py` step
  executed — which is the next story to touch connect, Manage keys or Use your brand, and immediately Story 3.9's own
  re-run")*
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
amended: Story 5.24b's Dev (2026-09-29) — `--only BLOCK[,BLOCK…]` BUILT. The `BLOCKS` registry names each block's
  seeds (`sign-in`, `Pro`, `T1`, `T3`, `stranger`), made from the empty fixture through `/sites/connect?step=keys` and
  never through `pro-connect-t3`; the blocks are the same functions the full sequence calls; steps stream as they land
  under a kill timer; `injection-live` is never run, so an `--only` run writes nothing to T1 or T3. This story's own
  steps are blocks too: `connect-paths`, `search-kept`, `keys-escape`, and `keys-two-fields` inside `manage-keys`.
  Control: `--only no-such-step` exits 2 with `.env` absent, while a known name reaches the key check. FOUND BY
  READING: Story 3.7's review (`03d3d4af`) turned `await offer().click()` into a `press()` whose body called
  `press()`, so every full run since would loop at `brand-popup` until killed — the likely cause of every full-run
  timeout this entry records; fixed to `offer().click()`, and a full run is still owed. Every registered block
  completed alone against HEAD's deployment (users 13 → 13), and all eight passed together in local runs of this
  story's code, under `next dev` and under a production build — where `moved-domains` first failed twice on the
  harness's own race (the opener pressed before the disconnect's landing had redrawn the list, so the sheet was never
  there to open), now waited out. Closes at Review, when every block passes alone against this story's deployment.

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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): the entry's own claim was already false — since Story 5.3 a Text Area's break is `<br>` in user text on both emitters. The defect found under it is fixed: an attribute holds one line (`core.ts`, the rule a paste already follows) and `marks.ts`'s attribute sink escapes and stops, so no `<br>` reaches `alt`, `title`, `href` or a `data-i18n-*`. Control (`agreement.test.ts`, DW-96): HEAD gave `alt="a\nb"` on the canvas and `alt="a<br><br>b"` in the theme, and `data-i18n-ended="a<br>b"` with only `marks.ts` reverted. The canvas-only residual — `tidy` runs after values are in the DOM — is a `ponytail:` comment at `tidy` naming its ceiling and upgrade.
severity: low
origin: Story 4.2 review (2026-09-11) — Edge Case Hunter; pre-existing in the stress harness, which
  ran the same trim on both paths
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first category story (Epics 9–11)
  whose design's stylesheet sets `white-space: pre` or `pre-wrap` on user text — none of Story 4.10's five pilots does
  (re-owned 2026-09-15); the category gate checks it")*
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
status: done 2026-09-24 (Story 5.18)
resolution: Story 5.18 (2026-09-24) — the first story that hands the canvas a connected site's content moves every live
  timestamp to the SITE's wall clock before the shim sees it: `apps/web/lib/live-content.ts`'s `wallClock` (`Intl`, which
  AD-1 allows in `apps/web`) resolves the site's own `/settings/` `timezone` at EACH value's own instant, so a page of
  posts that crosses a DST boundary is right on both sides of it, and `onClock` applies it to `published_at`,
  `updated_at` and `created_at` on every live post and page — the canvas, the picker's cards, D5e's dates and the Link
  Picker's. So the shim and every design are UNCHANGED and print what Ghost prints, `datetime` attributes included; AD-1
  holds. `live-content.test.ts` asserts a New York post published at 02:00Z on the 19th prints "Jul 18, 2026" through the
  shim's own `formatDate`, with the unmoved UTC value printing the 19th as its control, and the two sides of the
  2026-03-08 DST change. The one token that cannot follow is `Z`, which keeps printing `+00:00`; no design uses it, and
  the note sits beside `wallClock`. The sample's zone is `Etc/UTC`, so the sample moves by nothing.
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
status: done 2026-10-01 (Story 5.24c)
severity: low
origin: Story 4.3 review (2026-09-12) — Acceptance Auditor. `bareHelper` resolves both (the review
  added the cases) and `contract.test.ts` asserts both against the recordings, but `BARE_HELPERS` in
  `packages/library/src/vocabulary.ts` is 4.1's closed list and `data-helper` refuses any other name.
  Appendix B's A29 filter design needs `content_api_url` beside `content_api_key`. The review's
  second pass adds `t()` (reachable only through 4.9's `data-t`) and `taxonomyItems` (no directive
  renders a tag or author list yet) to the same class: shimmed, recorded, asserted, unreachable.
resolution: Story 5.24c's Dev (2026-10-01) closed the rest. `total_paid_members` and `content_api_url` joined `BARE_HELPERS` with
  their `universal` rows and labels, and `python3 tools/probe/record-contexts.py` recorded both printing on T1 and T3 on
  2026-10-01 (`0`, and `https://ghost{5,6}.inflozo.com/ghost/api/content/`, on every frame), so `contexts.test.ts`'s "every
  universal row was probed" holds them; on the owner's Question 4 each carries the release Ghost added it in (5.4.0, 5.98.0;
  MEASUREMENTS §59). `taxonomyItems` is unreachable on purpose, said beside it in `packages/ghost-shim/src/index.ts`.
  Controls seen red at e350c124: an agreement case per helper ("must be one of"), and `bindable('total_paid_members', …
  use: 'helper')`. Earlier, Story 4.9 (2026-09-14) made `t()` reachable: `data-t` and `data-t-attr` render on both emitters
  and the canvas calls the shim's `t()` over the project's strings, asserted against the `{{t}}` recordings on both majors
  (MEASUREMENTS §44).
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "re-owned by Story 4.10 (2026-09-15), whose
  pilots needed none of the three: A22's category story for `{{total_paid_members}}` (A22 #1's paid count, left there by
  the pilot), and the first category story that authors a design reading `{{content_api_url}}` (A29's filter) or a
  tag/author list (`taxonomyItems`)")*
location: packages/library/src/vocabulary.ts `BARE_HELPERS`; packages/ghost-shim/src/index.ts `bareHelper`
reason: adding a name to 4.1's vocabulary is 4.1's format changing, which a review of 4.3 does not do
  on its own; the functions exist so the change is one line when its story arrives
note (Story 5.24c's Dev, 2026-10-01): built and offline-proved — `total_paid_members` and `content_api_url` joined `BARE_HELPERS`, two `{"kind":"helper"}` rows in `matrix.json`'s `universal`, two labels ("Paid member count", "Content API URL"), and a comment beside `taxonomyItems` (unreachable on purpose: a tag or author list is `data-repeat="tags"`/`"authors"`). Controls seen red at HEAD: an agreement case per helper (HEAD threw "must be one of") and `bindable('total_paid_members', { … use: 'helper' }) === null`.

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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed — re-executed: `packages/library/src/orbit-weekly.test.ts` asserts
  that neither Ghost major ships a Lexical NFT renderer (its test named for this entry) and holds the style-guide
  article to C4's CARDS row less the feature image and the NFT card; both pass under `node --test` today. R-67 keeps
  `kg-nft-card` unstyled, so no category owes an NFT treatment, and C4's frame is never edited (R-74).
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
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the two clips the corpus names are made in-house with GStreamer 1.24 and
  served by the app from `apps/web/public/orbit-weekly/media/`. `scrolling-one-of-them.mp4` is videotestsrc's ball, 9 s
  at 640×360, H.264 constrained-baseline with the moov first. `episode-12.mp3` is a 6 s sine, MPEG-1 Layer III at 64
  kbit/s mono. The commands sit beside `canvas.ts`'s `withMedia`, which is now the one treatment of a media URL
  (`orbit-weekly.example/media/` → `/orbit-weekly/media/`). The style guide's `withImages` calls it, and the Paywall
  canvas calls it in place of `withoutMedia`, which is gone. `proxy.ts`'s matcher leaves `orbit-weekly/` alone, so both
  hosts serve the clips at the root under `default-src 'self'`. Controls, each seen red first: `style-guide.test.ts`'s
  media sibling (a missing file, then a document still on the reserved origin), `paywall.test.ts`'s same-origin test (a
  player lost its source) and `routing.test.ts` (the folder inside the matcher). No render-matrix re-baseline: the
  matrix draws neither the style guide nor the Paywall and blocks every other origin. The ranged GET and the walk's
  zero-CSP check are at Review.
severity: low
origin: Story 4.4 Dev (2026-09-13). The corpus points the audio and video cards at
  `https://orbit-weekly.example/media/…`, which nothing serves; the review page's CSP (`default-src 'self'`,
  no `media-src`) blocks the load and the browser logs it. The cards' chrome, thumbnails and Ghost's player
  scripts all render and bind.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "E5 (the editing canvas), if a playable preview is
  wanted — a short internally-produced clip served same-origin, and the recording re-run.")*")*
location: packages/library/orbit-weekly/corpus.json (`audio`, `video-*`) · apps/web/lib/style-guide.ts `withImages`
reason: no encoder is installed to produce a licence-clean video, and nothing in Story 4.4's acceptance plays media.

### DW-103: the resolver's recorded Ghost defaults are read from whatever else is on the test boxes

plain: The sample data's "newest first, fifteen at a time" rule is checked against a list the test servers happen to return, so another test that adds a post to those servers changes that list for a reason that has nothing to do with Ghost.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01), recorded on both majors: `python3 tools/probe/record-cards.py` created the recorder's own pair on its first run (posts `inflozo-defaults-1`/`-2`, tags `inflozo-defaults-a`/`-b`), published them for the reading and drafted them in the same `finally` — read back afterwards as drafts, with neither tag nor post visible to the Content API. `capture.json`'s `content_api_defaults` now reads posts and tags through `id:[…]` to exactly those rows: posts `inflozo-defaults-2` then `-1` (`published_at desc`, against creation and slug order) and tags "Inflozo defaults A" then "B" (`name asc`, against creation order), on both majors. `orbit-weekly.test.ts` asserts the filter and the two rows — red against e350c124's `capture.json` — and is green on the new one (MEASUREMENTS §59).
severity: low
origin: Story 4.4 review (2026-09-13) — Blind Hunter.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first story that re-runs
  `tools/probe/record-cards.py` for another reason (a Ghost target bump, NFR-6)")*
location: tools/probe/record-cards.py `api_defaults` · packages/library/orbit-weekly/fixtures/ghost{5,6}/capture.json `content_api_defaults`
reason: `api_defaults` records the live boxes' own posts, tags, authors and tiers with no order or limit passed, and
  `orbit-weekly.test.ts` sorts them by the resolver's default order and asserts equality. That proves Ghost's default
  order and limit, which is the point — but the rows themselves are the probes' leftovers, so a later probe that
  creates a post rewrites `capture.json` on the next run with no Ghost change behind it, and the test's `rows.length > 1`
  guard depends on the boxes carrying at least two rows per resource. Recording the defaults against rows the recorder
  itself owns would make the file stable; not done here because the fixture documents are returned to draft before the
  read (they must not sit in the recorded feed), so the recorder would need a second, permanent pair of documents.
note (Story 5.24c's Dev, 2026-10-01): built and offline-proved — `record-cards.py` creates two posts and two tags it owns (`inflozo-defaults-1`/`-2`, `inflozo-defaults-a`/`-b`), publishes them with the three fixture documents and drafts them in the same `finally`, and reads posts and tags INSIDE the try by `filter=id:[…]` with no order or limit; `capture.json` records each resource's filter; its `--self-check` covers the read; `orbit-weekly.test.ts` asserts the filter and exactly two rows, red against today's `capture.json`.

### DW-104: the validator accepts NQL the offline resolver refuses, so a design can validate green and preview empty

plain: The checker that approves a design's data query allows a little more than the preview can actually run, so a design could pass every check and still show an empty list in the editor.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `splitTop` and the seed's one value (`ORBIT_WEEKLY_SEED`) moved to `vocabulary.ts`, read by the validator and the resolver alike; `validateDataBinding` refuses a filter's top-level `,` (`bad-get-filter`) and `validateDesignJson` any seed but the bundled one (`preview-seed-unbundled`). Controls in `validate.test.ts`, seen red against HEAD's validator: `featured:true,tag:news` and `previewSeed: "nope"` refused, `tag:[news,notes]` and `featured:true+tag:'news'` clean.
severity: low
origin: Story 4.4 review (2026-09-13) — Verification Gap.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep
  (R-207, owner, 2026-09-27). *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was: "Story 5.19
  (the Data group's Source, the first place a customer composes a filter) — re-owned by Story 4.10 (2026-09-15): none of
  the five pilots declares a filter at all (A4 #13's query is `fixed` with no filter), so the pilots could not decide
  which grammar moves")*")*
location: packages/library/src/validate.ts `bad-get-filter` (`,` allowed) and `preview-seed-missing` (any non-empty string) · packages/library/src/orbit-weekly.ts `predicate` (`,` refused by name) and `resolvePreviewSeed`
reason: `validate.ts` lets `,` through and accepts any non-empty `previewSeed`, while `resolveSource` refuses `,`,
  parentheses and comparisons by name and `resolvePreviewSeed` refuses everything but `orbit-weekly`. The review added
  `orbit-weekly.test.ts`'s "the reference design validates AND previews" so every shipped design's bindings are run
  through the resolver, which catches the drift for designs in the repo; the two grammars themselves still differ, and
  which one moves — the resolver learning `,` (an `or`) or the validator refusing it — is a call for the story that
  first needs an `or`.
note (Story 5.19's Create, 2026-09-25): P0·5's Source is SINGLE-PICK (`P0 Editor Primitives - Spec.md:474-475`: By tag and
  By author are "Single pick"), so the Data group composes `featured:true`, `tag:'…'` and `author:'…'` and never an
  `or` — it cannot decide which grammar moves either. Re-owned: the first story whose filter needs `,`.

## Deferred from: spec-4-5-the-controls-engine-and-the-control-vocabulary (2026-09-13)

### DW-105: A28's 10 Slim is drawn locked at "None", and is built as A1·4's no-value lock

plain: One Comments design, "Slim", is drawn with its background row locked at a choice called "None". The
  owner ruled that there is no "None", so when the Comments designs are built Slim's row is locked with
  nothing marked and a sentence under it, the way the header drawn over a hero picture already is.
status: open
severity: low
origin: Story 4.5 Create (2026-09-13) — R-103, re-checked across every category the same day.
owner: Story 10.95 (A28 — designs #8–10 (owner gate)), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: was "A28's category story that builds 10 Slim — Story 10.95 (A28 — designs
  #8–10, owner gate).")*
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the first story that prints a written-out authored
  date — A2's Story 9.6 (6 Countdown, whose `countdown` module reads the Date Picker's value, `prd.md:952`), unless an
  Epic 7 compiler story reaches a formatted authored date first.")*
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
owner: Story 9.8 (A2 — designs #12, #14 and #15 (owner gate)), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: was "unowned — needs one. No story in Epic 5 or Epic 8 (Asset Library) names
  focus; the architecture must decide the emission first, then the first category story with a cropping design (A13, per
  R-51's ⬜) cannot build its panel without it.")*
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
resolution: the LICENCE half is done — Story 7.4 (2026-10-08): `compileTheme` records each icon its lookup draws, and a
  theme whose placed sections draw one ships `LICENSE-tabler.txt` at its root, byte for byte `TABLER_LICENSE`; with no
  icon drawn there is no file (`compile.test.ts`, its control). The BUDGET half stays open: the theme-size budget moved
  word for word to Story 7.29 (Story 7.4's Question 1, owner, 2026-10-08), and with it "the inline icons' bytes count in
  the theme-size budget".
severity: medium
origin: Story 4.5 Dev (2026-09-13) — vendoring the whole set under R-104.
owner: Story 7.29 (Deploy-time asset bundling), whose criteria carry the budget half word for word with its id (R-195).
  *(Story 7.4's Dev, 2026-10-08: was Story 7.4, which built the licence half. Story 5.24a's Dev, 2026-09-28: was "Epic 7
  — Story 7.4 (Assets, fonts, per-design CSS and the dead-code strip, FR-J3's budget) is the nearest home; its
  acceptance criteria name neither.")*
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
owner: Story 7.13 (The Ghost card design module and `cards.css`), whose criteria carry its requirement word for word
  with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the card-panels story — Story 7.13 (The Ghost card design
  module and `cards.css`, FR-Q7).")*
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "A1's category story that builds 4 Overlay — Story
  9.1 (A1 — the content model, the stylesheet and designs #1–4).")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — the rule is written where every category story reads it:
  `docs/section-authoring.md` § 2, beside `universals`, "Read a design's narrowing off its drawn panel, never off its
  spec's table", naming A22·14 and the categories the R-103 sweep found. The export is not edited (R-74).
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
status: done 2026-09-25 (Story 5.19)
resolution: Story 5.19 (2026-09-25) built the full Source vocabulary and took the Ghost fact out of fixture code:
  `DEFAULT_LIMIT` now lives in `packages/library/src/vocabulary.ts` beside `GET_SOURCES` (`orbit-weekly.ts` re-exports
  it, so every reader answers unchanged), and the engine's `countOf` reads it from there. The Data group is P0·5's —
  Source (`POST_SOURCES` and `POST_SOURCE_WORDS`: Latest · Featured · By tag · By author · Hand-picked), the tag or
  writer, the picked list, Count and Order — on every posts query that is not the design's own `filter` or `ids`.
  Order stays Newest · Oldest over posts alone, which is P0·5's own drawing and not a gap: a tags, authors or tiers
  query offers no Source and no Order, as the spec rules.
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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `packages/library/icons/tabler.d.json.ts` declares the JSON's shape by name (`version`, `license`, `icons: unknown` …) and `allowArbitraryExtensions` joined `tsconfig.base.json`. Control: `npx tsc --noEmit -p packages/library --listFilesOnly | grep tabler` lists `tabler.d.json.ts` alone, and `tabler.json` with the declaration moved aside; the library's typecheck measured 1.97 s / 730 MB without it and 0.42 s / 106 MB with it.
severity: low
origin: Story 4.5 Dev (2026-09-13) — measured: the library's typecheck rose from about 0.6 s to about
  2.2 s and about 690 MB; a `tabler.d.json.ts` declaration with `allowArbitraryExtensions` measured at
  about 0.09 s.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first story where typecheck time or CI
  memory matters — Epic 7's compiler, which imports `@inflozo/library/icons`, at the latest.")*
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
  Story 5.22 owns its overlay below 1440 *(below 1280 on a fine pointer since R-202, 2026-09-27)*.
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria already carry it with its
  id: R-121's icon slot, which opens the Icon Picker. *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1 (A1 — the content
  model, the stylesheet and designs #1–4) — moved there from Story 5.3 by the owner's ruling R-121 (2026-09-17), because
  none of the pilot sections carries an icon to click and Story 9.1's designs are the first whose buttons carry one
  (A1·11 Side Rail's row icons follow in 9.3). The owner first ruled it into Story 5.3 on 2026-09-13, over Story 5.2.
  The criterion is in `epics.md` Story 9.1, beside the button icons the same ruling put there, so this entry closes when
  that story is done.")*
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
status: done 2026-09-25 (Story 5.19)
resolution: both lists show the slot now. Story 5.19 (2026-09-25) built the hand-picked post list (P0·5,
  `apps/web/components/controls/data-group.tsx`'s `Picks`) on the same `lib/reorder.ts` the item list and Layers use:
  its rows translate rather than move, a dashed `data-drop-slot` the size of the row shows where it will land, and
  `⌥↑`/`⌥↓` move a pick with `movedTo`'s sentence. The Layers half was Story 5.4's and was never recorded here: read
  in code on 2026-09-25, `components/controls/layers.tsx` draws the same dashed `data-drop-slot`, and the canvas
  pill's section handle drives that same Layers drag.
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
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the three frame routes are CALLED, not read. `apps/web/frame-guard.test.ts` maps
  `next/server` to its `server.js` and `@/` to the app with `registerHooks` (the one test that does, and it says why),
  points `@/lib/supabase/server` at itself, and asks each `GET` with a real `NextRequest`: signed out 303 to /sign-in,
  signed in 200 text/html, style-guide's variations view 200 and a request with no nonce 500. The source-text tests of
  `controls.test.ts`, `style-guide.test.ts` and `pilots.test.ts` and their `ROUTE` constants are gone. Control, seen red
  with the guard line deleted from the canvas route: "/app/canvas answered 200 to a stranger". The deployed walk's step
  6 asks `/controls/frame` and `/style-guide/frame` signed out too, each 303 (DW-162, the same change).
severity: low
origin: Story 4.5 code review (2026-09-13) — Verification Gap
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches a frame route (Story 5.1's editor
  surface is the nearest)")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — `tools/design-patch-prompts.py` renders a note beside P0's prompt, outside the
  `<pre>` its Copy button reads: kept as sent on 2026-08-25, its "curated Tabler set" superseded on 2026-09-13 by R-104.
  The prompt text is the record and is unchanged; DESIGN-PATCH-PROMPTS.html regenerated with that note alone added.
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), closed on the owner's ruling **R-221** (2026-09-28, 5.24's Create, Question 12):
  no copying or moving a section across page types at launch; Global sections are future work in PRD Appendix G, and
  FR-H7's re-validation stays the rule any later move follows (`checkBindings` and `offerBindings` already answer it).
severity: medium
origin: Story 4.6 Create (2026-09-13) — the story's own acceptance criterion is the only place epics.md names it
owner: Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's Create, 2026-09-27: every story
  this line named is done. Was: "unowned — needs one. Epic 5 (the Layers panel, Story 5.4, or the template switcher,
  Story 5.5) is the nearest.")*
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
owner: Story 9.2 (A1 — designs #5–8), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: was "A1's category story (Headers & Navigation), which decides when its social rows show")*
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
owner: Story 9.10 (A3 — designs #5–8), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: was "the first category story that shows a post count (A29 tag cards or A21 author
  showcases)")*
location: packages/library/src/registry.ts `DataBinding` · packages/ghost-shim/src/index.ts `getExprs` · packages/library/contexts/matrix.json
reason: appendix B.1 §4.3/§4.4: a tag's or author's post count exists only through
  `{{#get "tags" include="count.posts"}}`. `DataBinding` declares source, filter, limit, order and ids — no
  include — so a `count.posts` binding could only ever print empty, and the matrix does not offer it.

### DW-125: the stress harness's `navigation` and `tiers` repeats print nothing on a real Ghost, and a target-naming render refuses both

plain: The big test theme that proves Ghost accepts our output contains two lists that would be empty on a
  real site. The new check catches them, but that test does not run the check yet.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): the stress archetypes render at their own targets — header and footer navigation through `data-helper="navigation"`, pricing's tiers as a declared `plans` query (`type:paid+visibility:public`, as `fixtures/paywall/2` declares) with the plain-list benefits sub-repeat gone, and content's related list (the same fault) as a declared query; `sections.js` exports each kind's queries and target, `compile.js` passes `dataBindings`, and `build.js` keeps a query-carrying kind off `error.hbs` (R-7). `test-vocabulary.mjs` renders every archetype at its own target, red on HEAD's archetypes (header, footer, pricing and content refused), with its own control — a feed at `post.hbs` still throws. gscan 0 errors / 0 warnings on both majors, offline. What is left, the stack's placements, is DW-296's (Story 7.35).
severity: low
origin: Story 4.6 Create (2026-09-13)
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 7.35 (the E4/E7 joint compile gate)
  — the harness becomes the compiler's, which names its targets")*
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
owner: Story 7.16 (The Routes Manager), whose criteria carry its requirement word for word with its id (R-195).
  *(Story 5.24a's Dev, 2026-09-28: was "Story 7.16 (the Routes Manager, FR-I2)")*
location: packages/library/contexts/matrix.json `targets["custom-{name}.hbs"]` · appendix-b1-template-contexts.md §3
reason: the matrix's one `custom-{name}.hbs` row is the ENTRY form (post block). The route form's root is flat
  and carries exactly the `data:` keys the route declares, where `{{#page}}` is the only form — so its row
  depends on the route Inflozo authored and cannot be a static row.

### DW-127: `private.hbs`, every Ghost version below the two servers, and the seeded servers' empty fields are unexecuted

plain: Some of the new rules are read from Ghost's code or its notes rather than seen on a live site: the
  password page, very old Ghost versions, and details the test sites simply do not have filled in.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01), on the owner's rulings (Question 1, Question 4). The seeded fields (Question 1's items 2–5: tag `archive`, author `umang`, tier `default-product`, newsletter `default-newsletter`) and a post's `custom_excerpt` were recorded printing on both majors by `python3 tools/probe/record-contexts.py`, and so was the private page — `/private/` and a wrong password's `error.message` — with private mode on for under a minute, restored and read back (MEASUREMENTS §59). `contexts.test.ts`'s reverse rule then named every `unverified` row both recordings prove, and each lost its reason; `errorDetails`' rows stay `unverified`, cited in Ghost's source in both releases, since a theme validation error is not the recorder's to cause. The version half: the author social handles (5.117.0) and a tier's `trial_days` (5.8.0) and, on Question 4, every bare helper Ghost added inside 5.x (`comments` 5.3.0, `total_members` and `total_paid_members` 5.4.0, `content_api_key` 5.96.0, `content_api_url` 5.98.0) carry a `since` read in Ghost's npm releases, and are refused below it (`contexts.test.ts`, "DW-127" and "Question 4", each red before its gate).
severity: low
origin: Story 4.6 (2026-09-14) — MEASUREMENTS §41f
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next runs `python3
  tools/probe/record-contexts.py` with seeded content (A21's and A29's category stories need the author and tag
  fields)")*
location: packages/library/contexts/matrix.json (every `unverified`) · tools/probe/record-contexts.py
reason: `private.hbs` needs private mode and `errorDetails` a theme validation error, neither of which the
  recorder may cause. Versions below 5.130.6 were read in source for `@site` only; P0·2 dates the author social
  handles to 5.118.0 and nothing recorded confirms it, so the matrix gates no resource field by version.
  Fields empty on both seeded servers are `unverified` with that reason — seeding them is a content write the
  story's Ask First reserved.
note (Story 5.24c's Dev, 2026-10-01): the version half is done — the Content API's resource fields diffed between the 5.0.0 and 5.130.6 releases (npm tarballs) found two gates, bisected over npm's releases: the seven author social handles at 5.117.0 (the users migration; P0·2's 5.118.0 was one release late) and a tier's `trial_days` at 5.8.0 (the tiers serializer), each now a `since` in `matrix.json`, and `contexts.ts` gates a scope field by its `since` exactly as a universal key (offered and refused by version, red at HEAD); `errorDetails`' and `private.error`'s reasons cite Ghost's source in both releases; `contexts.test.ts` gained the reverse rule. `record-contexts.py` now renders a post carrying a custom excerpt, adds `private.hbs` and switches private mode on last, for a minute, restoring both settings in a `finally` and reading them back. Closed by the recordings above.

### DW-128: the canvas shows "1 min read" on a post the visitor may not read, where Ghost prints nothing

plain: For a paid post in a feed, the editor would show a reading time that a signed-out visitor never sees
  on the real site.
status: done 2026-09-26 (Story 5.20)
resolution: RECORDED FIRST, then built as Ghost has it (MEASUREMENTS §54, both majors, signed out): a Paid-members-only
  post with a Public preview marker and a stored `reading_time` of 6 prints "6 min read" through the bare helper AND the
  field — the WHOLE post's time, with only the preview sent — while one with no marker and a `reading_time` of 0 is sent
  no body and prints nothing bare and "0 min read" through the field. So the note below was right and the title's premise
  holds at 0 only. `readingTime(minutes, opts, served)` in `packages/ghost-shim/src/index.ts` prints nothing exactly
  there, the bare `reading_time` path in `core.ts` hands it whether a body or a preview reached the visitor (`access`, or
  a non-empty `excerpt`), and `access` is Ghost's own rule per visitor (`packages/library/src/access.ts`, one port of
  `checkPostAccess`) wherever the editor hands a visitor (`templateContext`, `sitePage`). `contract.test.ts` asserts the
  four cases against the recording; the pilots print the FIELD, so no pilot moved.
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
note (Story 5.20's Create, 2026-09-26): the premise is narrower than it reads. Ghost's helper is
  `if (!post.html && !post.reading_time) return ''`, then `post.reading_time || readingMinutes(post.html)`
  (`@tryghost/helpers` `cjs/helpers.js:3647, 3657`, read in source on both majors), and `reading_time` is computed
  from the WHOLE body before gating (`extra-attrs.js`). So a withheld body prints nothing only when the post's
  `reading_time` is 0 and no preview is left. That is §41d's recorded case: every probe post reads 0. A real post
  prints its whole reading time to every visitor. The pilots print the FIELD through `{{t}}`, so nothing on today's
  library moves. Story 5.20 builds the rule as Ghost has it, and its first task records a withheld post above 0 on
  both majors.

### DW-129: `@site.codeinjection_head` and `codeinjection_foot` are offered as text bindings

plain: Two site settings that hold raw code are on the list of things a design could print as words. Nobody
  would want that, but no ruling says to hide them.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01), on the invariant (FR-H5's canvas–site agreement: NFR-3 keeps `codeinjection_*` out of the canvas): both keys moved to `matrix.json`'s `neverOffer` with their reason, appendix-b1 §6 gained a "Raw code — never offer" line naming them, and their two labels went. Control (`contexts.test.ts`, DW-99 · DW-129): `bindable('@site.codeinjection_head', …)` matches `/never offered/` and neither key is offered at the floor or at 6.58.0; HEAD offered both.
severity: low
origin: Story 4.6 (2026-09-14) — the universal set transcribed as `public.js` less appendix §6's never-offer list
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep
  (R-207, owner, 2026-09-27). *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was: "Story 5.19
  or whichever Epic 5 story first draws the binding picker (it consumes `offerBindings`)")*")*
location: packages/library/contexts/matrix.json `universal` · appendix-b1-template-contexts.md §6
reason: the appendix's never-offer list does not name them, so the matrix offers them rather than inventing a
  refusal (flag, do not guess). A printed binding escapes the HTML, so nothing unsafe reaches a page; it is an
  offer nobody should see. Adding both to `neverOffer` is one line once the owner rules.
note (Story 5.19's Create, 2026-09-25): Story 5.19 draws no binding picker — its Source composes a `{{#get}}` query from
  a closed vocabulary and never offers a field to print. Re-owned: whichever story first draws a binding picker
  over `offerBindings`.

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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — one rule for the four generators, `tools/doc-audit.py`'s `dated()`: a generated
  page keeps the date already on disk while nothing else in it changes, and only a content change stamps the day; the
  INDEX pair, `build-board.py`, `category-prompts.py` and `story-board.py` all stamp through it, and none reads HEAD's
  date any more. The control runs in the gate: `doc-audit.py --check` regenerates every page with the date faked a day
  ahead (`INFLOZO_TODAY`) and fails on any byte that moves — red with the old rule put back (the day written
  unconditionally), green with the new — and puts each page back when it fails, so tomorrow's date never outlives the
  fix. A date read from git moves with HEAD rather than with the faked day, so the gate also refuses a generator that
  reads HEAD's date again: red with HEAD's own `build-board.py` put back. The field proof, CI on a day's first push,
  was read at the story's Review (2026-09-28, GitHub Actions API, `GITHUB_TOKEN`): the day's first push to main,
  `ce85188e` at 03:18 UTC, CI run 36373188891, `check` success; of the day's 21 pushes none failed the doc gate.
severity: high
origin: Story 4.6 review (2026-09-14) — executed: run 34823025267 (the Dev push, 08:29 UTC) failed `check` with `STALE — regenerated INDEX.md and INDEX.html`, `STALE: BUILD-BOARD.html`, `STALE: CATEGORY-PROMPTS.html`; `deploy` skipped. The Review commit's own diff of those files is `updated: 2026-09-13 → 2026-09-14` and nothing else; run 34825820806 (the Review push) passed and deployed.
owner: Story 5.24, the deferred-work sweep (R-207 triages every open entry). *(Story 5.23a's Dev, 2026-09-28: was
  "unowned — needs one. A tooling story, or the next story whose first push of a day fails." 5.23a was that story; its
  scope is R-206's and R-208's, so the sweep that already reads this row keeps it.)*
seen again: Story 5.23a's Dev push `a4d96c37` (2026-09-28 00:12 +0530, the day's first commit): CI run 36341672890
  failed `check` at `python3 tools/doc-audit.py --check` — `STALE — regenerated INDEX.md and INDEX.html`, `STALE:
  BUILD-BOARD.html`, `STALE: CATEGORY-PROMPTS.html` — with `deploy` skipped and `pnpm keyboard`, `pnpm check` and `pnpm
  build` never run. Regenerated locally, the three differ from the commit by `2026-09-27 → 2026-09-28` and nothing else.
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
status: done 2026-10-08 (Story 7.5)
resolution: Story 7.5's Dev (2026-10-08) — `checkThemeScripts(files, inline = {})` (`packages/library/src/modules.ts`)
  reads every emitted `.hbs`, its Handlebars comments removed first, and refuses any `<script>` but `MAIN_JS_TAG` once in
  `default.hbs`, `CARDS_JS_TAG` once there exactly when `assets/js/cards.js` ships, and a bare `<script>` whose bytes equal
  a repo source handed in by name — a door that is empty today; DW-328 decides at Story 9.1 whether `mode-toggle`'s head
  script ever opens it. `compileTheme` runs it over its own final text and throws on any sentence; `check-snapshots` runs
  it over the pilot theme (control: `<script>alert(1)</script>` planted in `post.hbs` is named), and the stress fixture
  prints it beside `checkThemeJs`. `modules.test.ts` holds each refusal and the named-inline pass, one byte off refused.
severity: medium
origin: Story 4.7 (2026-09-14) — spec task "propagate"; FR-G7(1)'s assertion is over `assets/js/` by definition
owner: Story 7.5 (JS bundling — two files, two origins), whose criteria carry its requirement word for word with its
  id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.5 (emitting `main.js` and `cards.js`), which assembles the
  theme `checkThemeJs` runs over")*
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
status: done 2026-10-08 (Story 7.5)
resolution: Story 7.5's Dev (2026-10-08) — `checkThemeJs(files, sources, cardScripts?)` compares `cards.js`, byte for
  byte, to `cardsJs` of the scripted cards `package.json`'s `card_assets.exclude` names, over the vendored chunks handed
  in; a scripted card excluded with no `cards.js` is a sentence too ("audio's player would never play"), and called
  without the chunks (`run-verify-core.py`, the stress fixture) it refuses a `cards.js` rather than skip it. `cardsJs`
  cuts `record-cards.py`'s head by its exact shape and copies Ghost's chunk bodies unchanged under one header. Held by
  `modules.test.ts`, the compile's own final check, and `check-snapshots` (control: one byte of the pilots' `cards.js`
  changed is named).
severity: low
origin: Story 4.7 (2026-09-14) — `checkThemeJs` skips `assets/js/cards.js` wholesale
owner: Story 7.5 (JS bundling — two files, two origins), whose criteria carry its requirement word for word with its
  id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.5, which emits `cards.js` from the vendored chunks")*
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
status: done 2026-10-09 (Story 7.8)
resolution: Story 7.8's Dev (2026-10-09). `tools/check-baseline.mjs` holds the markup against the pin on every `pnpm
  check`: it reads every design's `index.html` and the compiled pilot theme's templates (mustaches masked, parsed with
  parse5 8.0.1), maps each element and attribute to its `web-features` key (`html.` or `svg.elements.<el>[.<attr>]`, or
  `.global_attributes.<attr>`), and refuses one below Widely on the pin unless `baseline.json`'s `tier2` names it — a
  named key only on the element its entry names. A key `web-features` does not map is not judged, the stated ceiling
  (`class`, `id`, `type`). Controls, each refused: a planted `popover` (`html.global_attributes.popover`), and
  `fetchpriority` on a `<link>` while it passes on its entry's `<img>`. Today the check sees one Tier-2 key,
  `html.elements.img.fetchpriority`, and prints where. The check runs in CI rather than at deploy because nothing a
  customer chooses or types can add an element or an attribute (Story 7.8's Readings 5); Story 7.33 runs every design.
severity: medium
origin: Story 4.8's Dev run (2026-09-14) — `packages/library/baseline.json` carries `details-name` and
  `fetch-priority` as `html` entries, and `tools/check-baseline.mjs` recomputes their Widely dates; stylelint and
  eslint-plugin-compat read no markup
owner: Story 7.8 (The emitted-theme quality gate), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.8 (the emitted-theme quality gate — FR-J17 already asserts
  valid HTML over every compiled theme)")*
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
status: done 2026-10-09 (Story 7.8)
resolution: Story 7.8's Dev (2026-10-09). `inflozo/tier3-by-name` in `stylelint.config.mjs`, shaped like
  `inflozo/supports-tier-2`, refuses by name every function and every at-rule prelude form or descriptor below Widely on
  the pin, derived from `web-features` at the pin (never listed by hand; a `baseline.json` Tier-2 entry stays allowed),
  and the pin's date rule has one spelling, exported by the config and imported by the check. The plugin-against-the-pin
  diff grew from `css.properties` to `css.types`, `css.at-rules` and `css.selectors`, one probe form per family, each at
  0 wider and 0 narrower; a key a family's form cannot express is printed by name as its ceiling (relative colour syntax,
  typed `attr()`, gradient interpolation spaces, `@container anchored()`, `@keyframes` named ranges, `:lang()` lists among
  them — `docs/section-authoring.md` § `style.css` says so). Controls: the four witnesses (`@container style(--x: 1)`,
  `if()`, `sibling-index()`, `random()`), `@font-face { ascent-override }` and `@import … supports()`, each passing
  before the rule and refused after. The compiled
  pilot theme's emitted CSS (`screen.css`, each `<style>` in a template, `cards.css` when it ships) lints clean through
  the root config, with `@container style(--x: 1) {}` planted in `screen.css` as its control.
severity: medium
origin: Story 4.8's review (2026-09-14) — Verification Gap: executed through the real config, `@container style(--x: 1)
  { … }`, `.a { color: if(style(--x: 1): red; else: blue); }`, `sibling-index()` and `random()` all pass, while the
  check prints `0 wider, 0 narrower`; its diff covers `css.properties` rows only, and `web-features` 3.35.0 also
  carries `css.at-rules`, `css.selectors` and `css.types` rows. `docs/section-authoring.md` says so since the review.
owner: Story 7.8 (The emitted-theme quality gate), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.8 (the emitted-theme quality gate) — ruled by the owner on Q2
  in spec 4.8 (option 1, 2026-09-14)")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — NFR-2 names its metric and its base: "< 40 KB gzipped (40,960 bytes, gzip level
  9)". `tools/check-baseline.mjs` runs `size-limit` with `gzip: true` (a config file; its CLI takes no metric flag),
  asserts its size equals `zlib.gzipSync(file, { level: 9 }).length` and that NFR-2's sentence names what is checked —
  each seen red first, the sentence before `prd.md` changed and the equality with the config's `gzip: true` removed
  (size-limit's brotli default measured 2,445 B against gzip's 2,878 B). VERIFY-AT-BUILD row 27, the spine's size-limit
  row, the research row, MEASUREMENTS' inference and Stories 7.5 and 7.33 follow; a grep for "brotli" leaves records and
  the tool's own default.
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
owner: Story 7.12 (The Translations surface, `locales/` emission, and override validation), whose line on `{{t}}`
  escaping now carries the `{{plural}}` exception word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28:
  was "Story 7.12 (override validation, V9/V10)")*
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
owner: Story 7.12 (The Translations surface, `locales/` emission, and override validation), whose parser line is
  replaced word for word, naming this entry (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.12")*
location: ARCHITECTURE-SPINE.md's dependency row for `@formatjs/icu-messageformat-parser` · appendix-h1 V9, V10 · prd.md FR-Q8
reason: 4.9's Never excludes V9 and V10. The shape is to validate with the 5.4.3 both majors bundle (already a root
  devDependency) plus S3's placeholder rule, and to observe the 500 on T1/T3 before a surface promises it.

### DW-143: nothing checks that a catalog key survives from one library drop to the next

plain: A phrase's name must never disappear, because live sites and customers' translations point at it. Today the
  check compares the two copies of the list with each other, so deleting a phrase from both at once would pass.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — `tools/check-catalog.mjs` reads every committed `catalog.json` from git and
  fails on a key any of them held that is gone now, naming the key and the last commit that held it; its control, an
  in-memory earlier catalog with an extra key, is caught — and not caught with the check's refusal removed, which is how
  it was seen red. appendix-h1 S1 says so.
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
owner: Story 9.6 (A2 — designs #5–8), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: was "the story that writes the `countdown` module (A2 #6 / A6 #11's category)")*
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
owner: Story 7.12 (The Translations surface, `locales/` emission, and override validation), whose criteria carry its
  requirement word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.12")*
location: appendix-h1 S6 · each category's content.json `default`s
reason: whether every visible default must have a catalog key, or a non-English project must be prompted to retype
  them, is an owner decision the Translations surface forces; 4.9 builds the mechanism (`catalog` on a prop) and
  adds no key.

## Deferred from: code review of spec-4-9-the-string-catalog-keys-english-defaults-and-the-t-contract (2026-09-14)

### DW-146: nothing asserts S5's inverse — a module that writes visitor-facing text must declare its keys

plain: The phrase list marks which phrases are written by a section's JavaScript, and the countdown section declares
  its six. Nothing checks the other way round: a future section could write "Loading…" from its script and forget to
  declare it, and the phrase would then be untranslatable with no warning.
status: done 2026-10-08 (Story 7.5)
resolution: Story 7.5's Dev (2026-10-08), in two halves with no new phrase-list column. The literal half is lint:
  `eslint.config.js`'s modules block refuses a letter-bearing string or template literal written to a text sink
  (`textContent`, `innerHTML`, `title`, an aria text property, `setAttribute` of a text attribute, `insertAdjacentText`,
  `createTextNode`, `alert` and their kin) and a `t()` whose key is no string literal, with `noInlineConfig` so no
  comment silences it; `check-baseline` plants each sink, the clean lines and a disable comment. The registry half is
  `moduleKeyRefusals` (`modules.ts`): every module file but `core` is a registry row, and each `t('…')` key derives from a
  string its row declares; `check-snapshots` runs it over every module file (control: a planted `countdown` calling
  `ctx.t('weeks')` is named, `ctx.t('days')` clean). Ceiling, held by review: a literal parked in a variable, or joined
  by `+`, evades the lint.
severity: low
origin: Story 4.9's review — `moduleStringsRefusals` checks that every declared key is a live `js` key; the inverse
  cannot be derived today because the js keys of modules not yet written map to no row (namespaces are by function,
  not by module).
owner: Story 7.5 (JS bundling — two files, two origins), whose criteria already say it — "no module contains a
  visitor-facing literal" — and name this entry beside those words since the sweep's Dev (5.24a). *(Story 5.24a's Dev, 2026-09-28:
  was "each category story that writes a module (Story 4.7's rule), and 7.12's Translations surface as the backstop")*
location: packages/library/src/modules.ts `moduleStringsRefusals` · modules/registry.json `strings`
reason: the inverse needs a way to know which module a js key belongs to — a per-key `module` in appendix-h1, or a
  scan of each module's `translate(...)` calls (Story 4.7's lexical scan is the shape) — and either is a spec change
  the owner rules when the second module lands.

### DW-147: the recorder skips the probe theme's DELETE when re-activating the previous theme fails

plain: The test-server recorder restores the previous theme and then deletes its own. If the restore call itself
  errors, the delete never runs, and the recorder's own theme is left installed until someone removes it by hand.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `record-shim.py`'s `restore_and_delete` tries the re-activation, always reads the active theme back, DELETEs each probe theme and reads the list back, then raises the first failure (the activation's own error first); every T1/T3 uploader calls it in its `finally` (DW-237). Control: `python3 tools/probe/record-shim.py --self-check` (in `pnpm test`) against a fake Ghost answering as Ghost does (422 active, 404 missing, 204 deleted) — red against the e350c124 cleanup shape at the activation-raising case ("the activation raised and the probe theme was never DELETEd").
severity: low
origin: Story 4.7's cleanup (owner's ruling on Q1), inherited unchanged by Story 4.9's recorder; noticed at 4.9's
  review. The error does reach the operator — it is not silent — but the cleanup is not attempted.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches
  `record-shim.py`")*
location: tools/probe/record-shim.py `finally`
reason: pre-existing; a `try`/`except` around the activate that still attempts the DELETE and re-raises is the fix.

### DW-148: the copy check compares retired-or-not only, so the first `supersededBy` cannot be held equal

plain: The two copies of the phrase list — the human table and the machine file — are held equal by a check. The
  check compares whether a phrase is retired, but the human table has no column for "replaced by", so the first time a
  phrase is replaced, the two copies could disagree without the check noticing.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — appendix-h1 §2 gives the Status column its two forms, "**retired**" with its
  reason and "**superseded by** `key`", and `check-catalog.mjs` compares the second with `catalog.json`'s `supersededBy`
  in both directions; its control — a cloned catalog carrying a `supersededBy` §3 does not, and §3 carrying one the
  catalog does not — is caught from both sides, and was not caught with the comparison removed.
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
owner: Story 10.114 (A34 — designs #1, #8 and #10 (owner gate)), whose criteria carry it word for word with its id — R-212's
  trade moved A34 #1 Numbers from A34's first story (10.112) to this one, and its design-specific criterion moved
  with it. *(Story 5.24a's Dev, 2026-09-28: was "A34's category story (Epic 10) — redraw A34 #1 Numbers to the indicator
  form in the Claude Design project")*
location: design export `A34-1 Numbers.dc.html` (never edited here, R-74) · `docs/section-authoring.md` § 3
reason: Ghost hands a theme only page, pages, prev and next; the indicator is what both emitters produce identically.

### DW-150: A1 #1 Rail — what its pilot leaves to A1's category story

plain: The Rail header on the pilots page is the resting header with its member-aware actions. Its menus that open,
  search, the dark-mode switch, an uploaded logo (and a logo for dark backgrounds), the open drawer and the shrinking
  motion arrive with the Headers category.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Stories 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), 9.2 (A1 — designs #5–8) and 7.3
  (Synthesis Defaults and the emptying rules), 9.1's criteria already carry R-111's navigation partial with its id, and
  9.2 (the resting no-JS takeover and panel) and 7.3 (`default.hbs`'s `<main>` target) carry their halves word for word
  with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "A1's category story (Story 9.1 onward)")*
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
note (Story 6.6's Create, 2026-10-05): found while planning 6.6's logo question. The authored-logo bullet above (`logo`
  and `logoLight`) is carried by no story's criteria: the cards cite this entry only for the `<main>` target (7.3), the
  navigation partial (9.1) and the takeover (9.2). Story 9.1 builds A1's content model, so its Create carries the bullet
  word for word (R-195). No logo lives in the Style Pack: the owner ruled R-240 (6.6's Question 1), so the site's logo
  stays Ghost's, and a header's own authored logo is this bullet's.
note (Story 7.3's Dev, 2026-10-06): its Story 7.3 half is done — `default.hbs` wraps `{{{body}}}` alone, once, in
  `<main id="site-main">` (`compileTheme`, `packages/theme-compiler/src/compile.ts`; `compile.test.ts` and
  `tools/check-snapshots.mjs` hold it, and the T1 recorder reads one `<main id="site-main">` per page with the header
  outside it, MEASUREMENTS §72). Story 9.1's card now says the skip link lands on `#site-main`. The rest stands with
  Stories 9.1 and 9.2.

### DW-151: A17 #1 Three Up — what its pilot leaves, and the one-value grey the engine cannot draw

plain: The Three Up grid on the pilots page shows real feed pages. Choosing which posts it shows, the main-feed
  setting, "View all" and a few drawn details arrive later; and at four per row the "Three lines" excerpt option
  cannot yet be shown greyed on its own, so the grid quietly uses two lines there instead.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Stories 10.54 (A17 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement
  word for word with its id (R-195), and 10.112 (A34 — the content model, the stylesheet and designs #2, #3, #4 and #9),
  which carries the Pagination style select (R-195, the note below) and names this entry beside it since the sweep's review (5.24a,
   2026-09-28). *(Story 5.24a's Dev, 2026-09-28: was "Story 5.19 (Source, Count and the main-feed
  designation) · A34's category story (the Pagination style select) · DW-107 (Image focus) · A17's category story (Epic
  10) for the rest")*
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
note (Story 5.19's Dev, 2026-09-25): its Story 5.19 half is done. The Three Up is a FEED: on a paginated page one is
  the MAIN FEED (D5c's chip, `designate`), sized by the project's Posts per page, and every other one is a SECONDARY
  feed with P0·5's Data group (Source, the tag or writer, the picked list, Count, Order), rendered through a `{{#get}}`
  with no pager. That answers "whether the empty state shows only on the designated main feed": the main feed draws the
  design's declared empty state, and a secondary feed at zero draws nothing at all (FR-H4). The Pagination style select
  is Story 10.112's (R-195); the rest stands with its owners.

### DW-152: A22 #1 Inline Row — what its pilot leaves, and `{members}` has no theme form

plain: The newsletter row on the pilots page shows the sign-up form, and "Signed in" for members. Its Sending, Done and
  Invalid states, a name field, a newsletter choice, the paid count and the no-JavaScript notice arrive with the
  Newsletter category; and the "Join 1,200+ readers" line prints its placeholder word on a published site today.
status: open
severity: medium
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Story 10.75 (A22 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement
  word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "A22's category story (Epic 10); the
  `{members}` theme form to the story that first ships a design with Social proof on (the runtime owns it:
  `packages/section-runtime/src/marks.ts` `substituteTokens`)")*
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
owner: Stories 10.79 (A24 — the content model, the stylesheet and designs #1–4) and 7.3 (Synthesis Defaults and the
  emptying rules), whose criteria already say it — 10.79's "each design matches its frame" and 7.3's
  `show_title_and_feature_image` gate — and name this entry beside those words since the sweep's Dev (5.24a). *(Story 5.24a's Dev,
  2026-09-28: was "A24's category story (Epic 10), with E7's page wrapper · DW-107 (Image focus)")*
location: packages/library/designs/a24/1/ (target `post.hbs` only)
reason: `page.hbs` and `@page.show_title_and_feature_image` need `data-target`; all tags, and several authors with
  "and"/"and others" (R-3's key); the updated-date Meta value; the caption's links (bound as escaped text); the "Post
  block" group name (its rows sit under Style); the editor-only greyed picture box (no key for its words). The figure's
  `data-if="feature_image"` and the image's media guard emit two nested `{{#if feature_image}}` (they share a field but
  not an element) — harmless, and one guard once a wrapper condition can share its child's.
note (Story 7.3's Dev, 2026-10-06): its Story 7.3 half is done — on `page.hbs` the compiler places each A24 (Post
  Header) section's invocation inside `{{#if @page.show_title_and_feature_image}}` (`POST_HEADER` in
  `packages/library/src/placement.ts`) and refuses any other `@page` property in an emitted file, naming it. The guard
  is the compiler's, so an A24 design carries none of its own and the `data-target` this entry's reason asked for is
  not needed; Story 10.79's card says so, and retires the recorder's stand-in `page.hbs` once A24 #1 sits on
  `page.hbs`. The rest stands with Story 10.79.

### DW-154: A4 #13 Latest Post — what its pilot leaves to Epic 5 and A4's category story

plain: The Latest Post hero shows your newest post in its card. Choosing which post, hiding it from non-members, the
  "Members only" marker, the picture-less card style and a fall-back picture when nothing is published arrive later.
status: open
severity: low
origin: Story 4.10's pilot table, "Left" cell, confirmed and amended by the Dev run
owner: Story 10.4 (A4 — designs #12–14), whose criteria already say it — "each design matches its frame", #13 Latest
  Post's included — and name this entry beside those words since the sweep's Dev (5.24a); Story 5.4's half is done
  (`carriesMemberVisibility`, `memberVisibility`), and so are 5.19's "Which post" and 5.20's Portal-destination gate
  (the two notes below). *(Story 5.24a's Dev, 2026-09-28: was "Story 5.19 (Which post) · Story
  5.4 (Member visibility) · Story 5.20 (gating an action by its Portal destination) · A4's category story (Epic 10) for
  the rest")*
location: packages/library/designs/a4/13/
reason: Card style's Title and date and its "Latest" label (no key); the members-only marker (a match on `visibility`,
  which no directive expresses); the fall-back picture when nothing is published; the short date on phones; which
  marks rule holds (`A4 Heroes - Spec.md:61` against `A4-0:327`); the phone's picture-less panel (undrawn); the tablet
  headline follows the spec's ladder (Large 44) where the artboard draws 40.
note (Story 5.20's Dev, 2026-09-26): "gating an action by its Portal destination" is done — a link record the customer
  points at a Portal ask (`signup`, `signup/…`, `offers/…`, `account/plans`) is gated by its destination in the one link
  sink (`linkGate` in `packages/section-runtime/src/marks.ts`, R-4): the theme wraps a button in `{{#if <flag>}}` and keeps
  an inline mark's words in `{{else}}`, and the canvas leaves the ask out where the site's flag is off; sign in and account
  stay ungated. Latest Post's primary action defaults to `{ portal: 'signup' }`, so its committed snapshot moved by that
  one line (`packages/library/snapshots/a4/13/template.hbs`). `agreement.test.ts` and `ad36.test.ts` hold it.
note (Story 5.19's Dev, 2026-09-25): "Which post" is done — Latest Post's fixed query offers Source alone (R-108):
  Latest · Featured · By tag · By author · Hand-picked, the last holding one pick. Its `{{#get}}` now carries
  `include="tags,authors"`, without which Ghost gave the card no `primary_tag` (MEASUREMENTS §53, recorded on both
  majors), so the emitted theme printed no tag where the canvas did. The rest stands with its owners.

### DW-155: the reference token set's page width and gutter are not the frames' 1296 px content and 72 · 40 · 20 margins

plain: The drawings put a page's content 72 pixels in from each side at desktop (40 on a tablet, 20 on a phone). The
  sample colours now match the drawings, but the page width the sections use is still the older 1,152 pixels with a
  24-pixel margin, so on the pilots page the columns are a little narrower than drawn and some headlines wrap one line
  earlier.
status: done 2026-10-03 (Story 6.1)
resolution: Story 6.1's Dev (2026-10-03) — built (see its note below) and re-baselined: the owner approved the sampled
  review in the Dev session (one design per category, light and dark at 1440, before beside after, each with its cause
  and its frame), and the new photographs land in their own commit right after the Dev commit, naming the story as
  the cause (NFR-6(a)'s mass rebaseline, the project's first). `bash tools/matrix/run-matrix-gate.sh` on them: green,
  no axe violation and no case scrolling sideways, each behind its positive control; the runner manifest unchanged.
severity: medium
origin: Story 4.10's Dev run — reported by all five pilot authors; the spec's rule was "every row the Paper objects
  name takes their values; every other row keeps today's value", and no Paper token object names a width or gutter
owner: Story 6.1 (The token engine — computed or authored, and nothing in between), whose criteria carry its
  requirement word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the owner, at Story 4.10's owner
  test (step 14 compares arrangement and spacing); otherwise Epic 6, whose packs author these rows. Story 4.10's review
  added to the same list the rows derived from the retired ink and accent that no Paper object names — `--border-fade`
  and `--scrim` (rgba of `#1c1a17`), and both modes' `--accent-on-contrast` (`#e8a87c` / `#8a3b12`, the pre-Paper accent
  on Paper's contrast ground); and Light `--link-color`, which took the accent and was Story 4.10's Q5 — ruled R-112:
  ink words, accent underline (that row leaves this list)")*
amended: Story 5.14 (Dev, 2026-09-21), R-173 — **`--accent-on-contrast` is now drawn.** The token block's link rule
  underlines a typed link on a contrast ground with it, so the pre-Paper `#e8a87c` / `#8a3b12` on this list is now
  visible on the canvas (7.99:1 and 6.28:1 on Paper's contrast grounds, measured by Story 5.14's sweep). Epic 6's
  value for the row replaces it with nothing else to change.
location: packages/section-runtime/src/tokens.ts (`--site-width` 72rem, `--space-gutter` 1.5rem) · every pilot's style.css
note (Story 6.1's Dev, 2026-10-03): BUILT, and the entry stays open for its rebaseline. The token engine's Normal is the
  frames' geometry — `--site-width` 81rem (1,296 px) and a new row, page margin (`--site-margin` 72 · 40 · 20 px at
  ≥ 1024 · 768–1023 · ≤ 767, computed, the same for every pack) beside the 24 px column gutter; Comfortable density is
  `A4-0`'s ladder (96 · 80 · 64). Every pilot root and the fixtures' side padding read `--site-margin`, A4 #13 and
  A24 #1 read the section tokens instead of their literal ladders (their per-width overrides deleted), A17 #1's column
  and pager gaps read the gutter, and `THEME_CSS`'s side margin is the page margin. The rows no Paper object named —
  `--border-fade`, `--scrim`, both `--accent-on-contrast`, `--plate`, `--negative`, dark `--bg-elevated` — are computed
  by the engine's rules now, never written by hand. `bash tools/matrix/run-matrix-gate.sh` before the rebaseline: red
  on moved photographs only (every failure a `toHaveScreenshot` mismatch, 0 axe violations), and the new sideways
  check green on every drawn case behind its positive control. Closed the same day: the owner approved the sampled
  review and the baselines land in their own commit (NFR-6(a)'s mass rebaseline, `docs/render-matrix.md`).
reason: changing a row no Paper object names would be inventing the value; the frames draw it, so it is a one-row
  token change once ruled. A1, A22, A24 and A4 also carry their own section padding as literals where the frame's
  ladder differs from `--space-section`.

### DW-156: `{{t "post.reading_time" minutes=reading_time}}` prints "0 min read" where Ghost's own helper prints "1 min read"

plain: Two pilot cards print a post's reading time through the translatable phrase. For a very short post a live site
  would say "0 min read", where Ghost's built-in wording says "1 min read".
status: open
severity: low
origin: Story 4.10's Dev run (A17 #1, A24 #1), from the fact MEASUREMENTS §44 recorded (a plain param is the FIELD)
owner: Story 10.54 (A17 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement
  word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the story that settles reading-time phrasing
  library-wide — A17's category story (Epic 10) is the first")*
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
owner: Story 11.2 (The starter chooser), whose criteria carry its requirement word for word with its id (R-195), and
  since the sweep's review (5.24a, 2026-09-28) (2026-09-28) the same re-read covers a design the owner's Free picks (R-212) made Pro —
  Quiet's A25 #1 Measured, where A25's Free pair is #2 Plain and #5 Full Bleed — so FR-O4's all-Free starters hold.
  *(Story 5.24a's Dev, 2026-09-28: was "the starters' story (Epic 11, Story 11.2 the starter chooser, or the story that
  authors `starters/`)")*
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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `renderTree` drops every comment node under the root right after `root.innerHTML = src`, before the first token is put — a walk over the nodes, never a regex over the source — and `docs/section-authoring.md` says a design's comment is dropped by both emitters. Control (`agreement.test.ts`, DW-159): a comment at the top, inside and inside a repeat; neither output holds `<!--` and the theme still resolves `{{#foreach posts}}…{{#if url}}`. HEAD shipped every comment.
severity: low
origin: Story 4.10's review — every `snapshots/*/template.hbs` began with the pilot's authoring comment
  (`<!-- A1 #1 Rail — Story 4.10 pilot, provisional (AD-35). Frame: … -->`); nothing in `core.ts` strips a comment
  and `docs/section-authoring.md` does not say whether one is consumed or emitted
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 7.1 (E7's formatting pass
  re-baselines every snapshot once; stripping comments belongs in the same pass)")*
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
owner: Story 10.4 (A4 — designs #12–14), whose criteria carry its requirement word for word with its id (R-195).
  *(Story 5.24a's Dev, 2026-09-28: was "Epic 5's Link Picker and persistence stories (the `ref` is resolved against the
  connected Ghost there; a cached `href` from the sample must never reach a compiled theme), with A4's category story
  for the drawn default")*
location: packages/library/designs/a4/content.json · packages/library/snapshots/a4/13/template.hbs
reason: the frame draws both buttons and owner test step 12 expects "Browse the archive", so removing the default
  changes the drawn state (R-74); what a `ref` resolves to on a real site is Epic 5's contract, not the pilot's.

### DW-161: `data-members-email` and `data-members-error` are not checked to sit inside a `data-members-form`

plain: Portal only reads the email box and the error line when they are inside the sign-up form. A designer could
  put either outside the form and every check would pass, yet the form would submit nothing.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `memberAsks`' ancestor walk is one generator (`tagsInContext` in `validate.ts`), used by `memberAsks` and by `members-field-outside-form`, which refuses `data-members-email` or `data-members-error` with no open `data-members-form` around it. Control (`validate.test.ts`, DW-161): both fields after a closed form refused, both inside one clean; HEAD gave `[]`.
severity: low
origin: Story 4.10's review — `validateMarkup` walks the markup as a flat token stream (no ancestors), and the
  directives' summaries state the rule without enforcing it
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "A22's category story (the first with
  several member forms), or Story 4.11 if the matrix adds a structural walk")*
location: packages/library/src/validate.ts · packages/library/src/vocabulary.ts (`data-members-email`, `data-members-error`)
reason: the validator carries no ancestor stack today; adding one for two attributes is more than a review patch,
  and the five pilots place both correctly (the snapshot check would show a move).

### DW-162: the pilots frame route's session guard is held by a source-text test only, as `controls/frame` and `style-guide/frame` are

plain: The test that says "strangers are turned away from the sample-sections page" reads the code as text and looks
  for the right words in the right order; it does not actually knock on the door. The same is true of the two older
  internal pages.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01), with DW-117: `apps/web/frame-guard.test.ts` calls the canvas route (the pilots page's
  frame since Story 5.1) and the two older frame routes with a real `NextRequest` — 303 to /sign-in signed out, 200
  signed in — and the text tests are deleted. Control: the guard deleted from the canvas route, the test red
  ("/app/canvas answered 200 to a stranger").
severity: low
origin: Story 4.10's review — `apps/web/pilots.test.ts` asserts `await currentUser()` precedes the body calls and
  `/303/` appears; `run-verify-pilots.cjs` signs in first and never fetches the frame signed out. Pre-existing
  pattern: `controls.test.ts:18`, `style-guide.test.ts:84` (DW-133's note names the executed 303 for `/controls`)
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches an internal frame route, or Story
  4.11")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — every library story's module line in `epics.md` is one sentence: the modules
  each design's own **Behaviour module** line in its category's spec names, never `core` (FR-G7(4)), each module's
  edit-safe value read from `registry.json` (research §7). The generator's fragments, the "none" where research §2.1
  derives a module, and the A31 and A32 cards' `core` go together. `tools/doc-audit.py`'s `plan_failures` fails a
  library story whose module line is anything else — red on HEAD for every library story, green now. A1-16 Reveal is
  DW-177's, closed beside it.
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
owner: Stories 9.2 (A1 — designs #5–8) and 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), 9.2's
  criteria already carry the naming of two queries with its id, and 9.1's carry A1's Nav children as a Data-group row
  word for word; the halves already settled stay recorded — the Data group's rows are titled Count and Order (R-170,
  Story 5.19), and R-36 leaves "When nothing matches" undrawn. *(Story 5.24a's Dev, 2026-09-28: was "Story 9.2 names two
  queries in one design (R-195's sweep, the note below); Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27),
  records the halves already settled. *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was:
  "Story 5.19 (the Data group's Source, Count and Order), which owns the query rows' vocabulary — the words that name
  each query are its to draw, from P0·5")*")*
location: packages/section-runtime/src/controls.ts (`dataRows`) · apps/web/components/controls/sidebar.tsx (the confirm's
  list)
reason: no built design declares two queries (each pilot has at most one, and the controls sample one), and naming a
  query in the panel is a wording the export has not drawn yet. For the category settings: `tools/check-snapshots.mjs`
  refuses one declared as a control, naming it a query's, so the category story that builds such a design adds its
  row to the Data group (P0·5's library-wide ones, such as When nothing matches, are Story 5.19's).
note (Story 5.19's Create, 2026-09-25): "When nothing matches" is settled without a row: R-36 left P0·5's field one
  value (the designed empty state, never a back-fill), so it offers nothing to choose and is not drawn (UX-DR3's
  could-never) — spec-5-19 Design Notes. The row titles become "Count" and "Order" (R-170, P0·5); naming TWO queries
  in one design stays open for the first design that declares two (Epics 9–10).
note (R-195's sweep, 2026-09-25): that design is A1 #7 Mega Bar — one query per post column — so Story 9.2 owns the naming,
  and its criteria now say so.
note (Story 5.19's Dev, 2026-09-25): the rows are titled "Count" and "Order" (R-170), and the reset confirm names
  them so; P0·5's Source joins them on every sourced posts query. Naming two queries in one design stays Story 9.2's.

### DW-166: titles the design export prints twice in one panel, for the category stories that build those designs

plain: In some drawn panels the same title appears twice — a setting and a text field both called "Note line", or a
  setting called "Layout" inside the Layout group. One panel may print a title only once (R-13), so the story that
  builds each design changes one of the two, by the rule the export itself follows, and shows you the new words.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed — the rule lives where every category story reads it,
  `docs/section-authoring.md` § 2 "When the export's titles would repeat in one panel", each new title put to the owner
  (R-83) by the story that builds its design; `tools/check-snapshots.mjs` refuses a panel that prints one title twice,
  its accordions' included — re-run today, its R-13 control is caught and the subject passes over every built design.
  The list of repeats above stays as the record those stories read.
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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `checkBindings` takes `version` — never `RenderInput`, because a render is guarded, not refused, on a version — and `tools/check-snapshots.mjs` passes each design's `ghostCompat.minVersion` at every target; every design still passes. Its `mustFail` row: A22 #1 claiming 5.61.0 must fail with "@site.allow_self_signup arrived in Ghost 5.62.0" — at HEAD "was not caught — got []". The two paywall fixtures that read `@site.allow_self_signup` claiming 5.0.0 now claim 5.62.0. A free ask on a Ghost below 5.62 is DW-297's (Story 7.18).
severity: medium
origin: Story 4.10's whole-story code review (2026-09-15, acceptance audit) — the spec's boundary "`ghostCompat.minVersion`
  is at least every `since` the matrix gives a field the design reads" holds for the five pilots (A1 #1 and A22 #1 at
  5.62.0 for `@site.allow_self_signup`, the rest at 5.0.0) by hand; `validate.ts` never reads `matrix.json`'s `since`
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1, the first story that ships
  designs to customers (DW-87's owner, whose compatibility check reads `ghostCompat`)")*
location: packages/library/src/validate.ts · packages/library/contexts/matrix.json · tools/check-snapshots.mjs
reason: `checkBindings` already walks every Ghost path a design reads at each target; the check is that walk's
  fields mapped to their `since` and compared with `minVersion`, one row in `tools/check-snapshots.mjs`. No shipped
  design depends on it yet (AD-35's provisional pilots ship to no one).

## Deferred from: planning of spec-4-11-the-render-matrix-and-the-accessibility-scan-that-runs-on-it (2026-09-17)

### DW-169: the render matrix's pack axis has one member until Epic 6 authors the three reference packs

plain: The picture check photographs every section in every colour-and-type scheme. The plan says three schemes;
  today only one exists, so it photographs one. When the twelve schemes are built, three of them become the
  references and every photograph has to be taken again.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-234 ruled: `tools/matrix/cases.mjs`'s pack axis is `REFERENCE_PACKS` (Paper, Mono, Neon) from `packages/library/packs/`, each case's document carrying its pack's block and faces (`/?pack=`, as `/canvas?pack=` serves it); `cases.test.mjs` asserts the axis equals the list. The mass rebaseline is its own baselines-only commit after the Dev commit, on the owner's approval of the sampled review (`docs/render-matrix.md`).
severity: medium
origin: Story 4.11's planning (2026-09-17) — NFR-6(a) names "3 reference Style Packs"; Epic 4 ships exactly ONE
  reference token set on purpose (step-6 stress finding F2: a design's CSS reads pack custom properties
  exclusively, so the canvas needs a token block three epics before any pack exists), and Epic 6 authors the
  twelve. `tools/matrix/cases.mjs` therefore DERIVES the axis from the token sets that exist (standing rule 4)
  rather than restating three; inventing two throwaway packs now would invent a decision the owner never made.
owner: Story 6.2 (The twelve presets and the font pool), whose criteria carry its requirement word for word with its
  id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Epic 6 (the story that authors the packs picks the three references
  and re-takes the baselines)")*
location: packages/section-runtime/src/tokens.ts · tools/matrix/cases.mjs · packages/library/baselines/
reason: widening the axis re-renders every case, which is a MASS REBASELINE under NFR-6(a)'s own rule — the
  owner's approval on a sampled visual review, its own commit touching baselines only, naming the change that
  caused it. So the widening is not a patch to this harness; it is that ruled event, and it belongs to the story
  that causes it.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 4, option 1): *"Paper, Mono and Neon"* — R-234. Story 6.2's
  Dev widens the axis behind the sampled review and closes this entry.

## Deferred from: code review of spec-4-11-the-render-matrix-and-the-accessibility-scan-that-runs-on-it (2026-09-17)

### DW-170: the accessibility scan does not yet stop at the post body's edge — no design draws one

plain: When a section one day shows a post's own text, the checker must not blame the theme for what the customer
  wrote. Nothing draws a post body yet, so the rule has nowhere to bite; the day a design does, it must.
status: open
severity: medium
origin: Story 4.11's review (2026-09-17) — Acceptance Auditor and Blind Hunter: epic-4-context.md says "the scan stops
  at the edge of the post body"; `tools/matrix/matrix.spec.mjs` scans all of `#canvas` with a `ponytail:` comment
  deferring the exclusion
owner: Story 10.83 (A25 — the content model, the stylesheet and designs #2, #3, #4 and #5), whose criteria carry its requirement
  word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the first story whose design binds
  `{{content}}` (A32/A33's category)")*
location: tools/matrix/matrix.spec.mjs — the `axe.run(document.getElementById('canvas'), …)` calls
reason: 4.11's Never excludes the categories that do not exist yet. The shape is one `exclude` selector on the post body's
  mount, derived from the design's binding, not a written list; a case whose markup carries the binding and no exclusion
  should fail rather than scan Ghost's markup.

### DW-171: the matrix derives the Show-to arm from `data-members` while `/pilots` draws it from a written list

plain: The photo machine decides "does this section have a Show-to setting" by reading the section's own markup; the
  pilots screen decides it from a short list typed by hand. The two disagree on two sections today, so one section's
  hidden state is photographed although the screen never shows it, and another's is shown but never photographed.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01), on the owner's ruling (its Question 2, option 1): `tools/matrix/cases.mjs` takes the Show-to arms from `carriesMemberVisibility` — the editor's own rule over R-113's register — and the visitor arms from `data-members`; `/pilots` reads the same rule (`page.tsx` hands `review.tsx` a `memberVisibility` map, and `DRAWS_SHOW_TO` is gone); `control-groups.json` joined `matrix.yml`'s shared inputs and `docs/render-matrix.md`. Control (`cases.test.mjs`): for every pilot the matrix has Show-to arms exactly when `carriesMemberVisibility` says so — red on HEAD for a1/1. The baselines, in the pinned image: the thirty blank `a1/1/…-show-to-*.png` deleted and the same thirty names added under `a4/13/`, each byte-identical to a22/1's; nothing modified, and the gate green.
severity: low
origin: Story 4.11's review (2026-09-17) — Acceptance Auditor, Verification Gap and Edge Case Hunter: `review.tsx`'s
  `DRAWS_SHOW_TO = ['a22/1', 'a4/13']` vs `cases.mjs`'s `/\bdata-members=/`; `a1/1` gets six `show-to-*` baselines the
  editor never draws, `a4/13`'s Show-to arm has none. Pixel risk is nil: a hidden Show-to arm draws nothing
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep
  (R-207, owner, 2026-09-27). *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was: "Epic 5's
  canvas (Story 5.x that mounts Show-to in the real panel — the list becomes the panel's own rule, and the matrix and
  the editor read one source)")*")*
location: apps/web/app/(app)/app/(authed)/pilots/review.tsx `DRAWS_SHOW_TO` · tools/matrix/cases.mjs `fixtureRows`
reason: the spec's frozen Boundaries fix the matrix's derivation ("its markup carries `data-members` → the visitor and
  Show-to arms"), so the matrix is not the side to change here; `/pilots` is a provisional surface. When the real panel
  decides Show-to per design, export that rule and import it in `cases.mjs`, then re-derive the baselines.

### DW-172: the commit-msg hook's Dev-phase guard has no executed control of its own

plain: The check that refuses a "development finished" commit while tasks are still open is not itself tested. If it
  broke, every such commit would pass again and nothing would say so.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — `tools/story-board.py`'s self-check (`demo()`, which the gate runs) runs
  `tools/hooks/commit-msg` for real in a throwaway repository (`hook_dev_guard`): a Dev commit with no spec exits 1 ("no
  spec matches"), one with a task unticked exits 1 naming the count ("1 unticked task(s)"), and one with every task
  ticked exits 0. Seen red with the hook's unticked-task refusal removed.
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed — re-executed through the GitHub Actions API (read-only):
  all 330 runs of `matrix.yml` created from 2026-09-18 to 2026-09-28 completed `success`, the nightly scheduled runs over
  every design among them. On 2026-09-17, 32 of its 35 runs succeeded and the other three are not this flake: run
  35187418366 was Story 4.11's deliberate red control (`MATRIX_DESIGNS` naming `zz/1`, "names no design"), and runs
  35209869288 and 35210157233 are two jobs GitHub never started (no steps; Story 5.1's Deploy and Blocked pushes). So
  the one failure, which was on this machine and did not reproduce, has not recurred in CI; and a failure keeps its
  context, because the workflow uploads `tools/matrix/test-results/` on failure (`matrix.yml:76-81`).
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
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the cause was LOAD ORDER, not a second copy of zod (one copy, 4.4.3): `/` builds
  `lib/style-pack.ts`'s object schema through `new-project-sheet.tsx`'s `PRESETS`, and `doc-schema.ts`'s `jitless` never
  loads there. `apps/web/lib/zod.ts` sets `jitless` before handing `z` out, the eight app importers take it through that
  module, and a new `apps/web/**` ESLint block refuses a direct `zod` import. Control: `apps/web/zod-jitless.test.ts`
  (its own file, the process's first zod evaluation with `Function` trapped) imports `lib/style-pack.ts` and counts 0
  probes; with style-pack's import reverted to `zod` it counts 1 and ESLint fails `no-restricted-imports`. On production
  before the push Projects reported 3 `script-src eval` refusals from zod's chunk on a throwaway account's three loads
  (2026-10-01, 10:11 UTC). The deployed walk's four CSP reads (steps 5, 70, 14, 97) no longer leave Projects out, so
  after the deploy the walk itself says whether `/` is clean (DW-201, the same change). The same throwaway-account load
  of Projects after the Dev push `5f78f6d8` deployed: 0 refusals.
severity: low
origin: Story 5.1's Dev run (2026-09-17) — `tools/probe/run-verify-editor.cjs` against a local production build: a
  `script-src` `eval` violation from zod's core chunk on `/` (Projects) at every load, and the same on the editor until
  `doc-schema.ts` set `jitless`. zod runs `new Function("")` when a `z.object` is CONSTRUCTED
  (`zod/v4/core/schemas.js:970-972`), so any object schema in a client bundle trips the app's nonce policy.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches `apps/web/lib/style-pack.ts` or the New
  Project Sheet (Epic 6's style packs)")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed — the entry's own two probes, re-run from the same machine at
  2026-09-28T15:22Z: 150 fresh-connection GETs of `https://app.inflozo.com/sign-in` and 150 keep-alive GETs over one
  connection, every one answered 200 with no stall. The entry's rule is to close with the runs as the record. Stalls on
  signed-in routes stay DW-204's (Story 5.24d).
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
owner: Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's Create, 2026-09-27: every story
  this line named is done. Was: "the next story's Deploy (5.2): repeat the interleaved probe and the fresh-connection
  `curl` loop once. If the rate holds, take the timestamps and the IP to Vercel support. If it is gone, close this
  with the two runs as the record.")*
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — the owner's word on the plan came with R-212 (5.24's Create): Stories 9.4, 9.8,
  10.5 and 10.25 now build A1 #16 Reveal, A2 #15 Triple, A4 #18 Overlap Card and A9 #15 Ledger, and
  `tools/doc-audit.py`'s `plan_failures` fails a live roster design that no story of its category builds — red on HEAD
  naming exactly those four, green now.
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
owner: Stories 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry A1's half word
  for word with its id (R-195), 10.50 (A16 — the content model, the stylesheet and designs #2, #3, #4 and #9), whose
  criteria build the same answer for A16's `socials[]`, and 10.26 (A10 — the content model, the stylesheet and designs
  #1, #3, #4 and #8), whose criteria carry A10's icon field (the sweep's review, 2026-09-28: the Dev line named 9.1
  alone and dropped the two halves). *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1 (A1's content model: whether A1's social
  glyphs are slots, asked in R-83's shape if the 29 August ruling does not already settle it), Story 10.50 (A16's
  content model, the same question), Story 10.26 (A10's content model: the icon field's name and type)")*
location: the four spec lines above, in `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/`
reason: the export is Claude Design's and is never edited (R-74); a disagreement inside it is settled by the owner at the
  story that authors the content model, not by whichever reader meets it first. Found while planning where the canvas
  icon slot is built (Story 5.3's Question 1), and not that story's to settle.

### DW-179: the pilot sections declare words plain that their own design notes give bold, italic, underline and link

plain: On your pilot page some words cannot be made bold, italic, underlined or linked — the Hero's big headline and
  eyebrow, its button words, Newsletter's button, Post Grid's eyebrow — although each of those sections' design notes say
  every word you write on a section takes all four. The pilots were written before inline editing existed, and each
  category's own story rewrites its content model anyway, so that is where they are put right.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — the rule is written where every content model is authored:
  `docs/section-authoring.md`, beside the content editors' table, "Every word a visitor reads that the customer writes
  is `richtext` with the four marks" unless its spec narrows it, a label that is itself a link narrowing `a` away; it
  names the pilots' `text` props, which each category's content-model story puts right (AD-35).
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
owner: Story 10.1 (A4 — the content model, the stylesheet and designs #1, #3, #4 and #17), whose criteria carry its half word for
  word with its id — the triage wrote it with DW-247's, which moved to Story 10.5 with A4 #2 Flush Left (R-212). *(Story
  5.24a's Dev, 2026-09-28: was "Story 10.26 (A10 — the content model, the stylesheet and designs #1–4), the first
  category story whose spec asks for one")*
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
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): a paste's element is read for its own inline style as well as its tag.
  `MarkNode` gains an optional `style` (`fontWeight`, `fontStyle`, `textDecoration`), which `DOMParser`'s elements
  (Chromium 149, executed) and jsdom's both carry. `ownMarks(c)` beside `TAG_MARKS`
  (`packages/section-runtime/src/marks.ts`) gives the tag's mark unless the element's own style cancels it: a bold tag
  whose weight is set and not heavy (Google Docs' `<b style="font-weight:normal" id="docs-internal-guid-…">` round the
  whole paste), or an italic tag set `font-style: normal`. It adds `strong` for `bold`, `bolder` or 600 and up (CKEditor
  5's rule, read in `@ckeditor/ckeditor5-basic-styles` 48.5.2; ProseMirror's 500 would bold a web page's computed 500),
  `em` for `italic`, and `u` for `underline` among the decoration's words. `readMarks` pushes every one the field
  allows, a link's included: still only the four (FR-D4). `ponytail:` a child's `font-weight:400` does not clear a
  parent's bold. Controls, each red at HEAD: Google Docs' clipboard shape, the wrapper ProseMirror 1.2.5, CKEditor 5
  48.5.2 and Lexical 0.52.0 each special-case (read in their source), came out wholly bold and now keeps Bold strong and
  italic em with " plain " unmarked; the wrapper alone stays unmarked, and 600, 700, `bold` and `bolder` are strong
  where 400, 500 and `normal` are not. Every branch, broken alone in a scratch copy, turns a test red. Word Online's and
  Apple Notes' shapes stay hypotheses. The owner's paste on the deployed site is the execution against Google Docs
  itself (his test, step 4).
severity: low
origin: Story 5.3's code review (2026-09-18, blind-hunter layer). The spec's matrix says `span style` "arrives as its
  text", which is what `readMarks` does; the finding is that the most common sources of a formatted paste use exactly that.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "none yet — the first story that hears it from a user, or Story 5.8 (saving),
  whichever comes first")*
location: `packages/section-runtime/src/marks.ts` (`readMarks`, `TAG_MARKS`)
reason: reading `font-weight`, `font-style` and `text-decoration` from inline styles is a rule the spec did not take —
  where the threshold sits (600? 700? `bold`?), and whether a styled span inside a `<b style="font-weight:normal">`
  wrapper (Google Docs' shape) is bold — is a decision, not a patch. Nothing unsafe happens meanwhile: the words arrive.

### DW-182: two rules of the editing session that no harness on the pilots can reach

plain: Two things the story builds cannot be checked automatically on your pilot page: the small pill that says "holds
  40 characters" when you type past a limit on the page (no pilot section has a limit — only the review page's sample
  does, and that page has no canvas typing), and the rule that switching to another window keeps your cursor where it
  was (the test browser cannot pretend to lose the window). Both work by reading; both are checked by hand.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): both rules reached by the keyboard gate. The fixture ring's heading carries `maxChars:
  40`, and the journey's DW-182 stop starts a canvas session on it with the canvas document's own synthesized press (the
  journey header's third), focuses it and types past the limit: the pill reads "Heading holds 40 characters." and the
  words stay 40; with the top page's `document.hasFocus` answering false a blur keeps the session, and restored, a blur
  ends it. Controls, each red: `onRefused` cut in `editor.tsx` ("the limit's pill"), and `inline.ts`'s `hasFocus` guard
  cut ("the window was lost, not the field: the session stays").
severity: low
origin: Story 5.3's code review (2026-09-18, verification-gap layer): `editor.tsx`'s `onRefused` → `CanvasNote` with
  `kind: 'limit'`, and `inline.ts`'s `onFocusOut` guard `win.top?.document.hasFocus() === false`.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first category story whose design declares `maxChars` (DW-180
  names Story 10.26) for the pill; the window rule stays a manual check")*
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
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the retry this entry left on the table, built the way it said. `steady`
  retries a signed-in `goto` or `reload` once (the reload as a `goto` of the same address) and never `/auth/confirm?…`
  or `goBack`; `steadyRequests` gives `context.request.get` and `streamContext.request.get` the same one retry; every
  page the walk opens is wrapped at creation; each first failure is a `stall` NOTE with its ISO start, the method and
  the pathname alone (never the query, where a magic link's token rides), and `main().catch`'s HARNESS ERROR carries its
  time. Controls, LOCAL RUNs against production with each plant reverted after: step 79's first GET planted `{ timeout:
  1 }` gives a stall note and step 79 PASS, and HEAD's walk under the same plant dies, `HARNESS ERROR
  apiRequestContext.get: Timeout 1ms exceeded`; the editor's document held 35 s once gives a stall note and the step
  PASS; the phone context's `/auth/confirm` held 35 s kills the walk (`HARNESS ERROR 2026-10-01T11:36:14.924Z page.goto:
  Timeout 30000ms exceeded`), the single-use link never asked twice, users 13 → 13. Step 5's CSP control passed in every
  walk, and every real stall in the story's walks was retried and the walk went on (classified under DW-204). The retry
  and step 5's control sit in separate hunks of the diff, for the separate commits this entry asks for.
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
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first story that touches the harness's session (Story 5.8's
  saving, or the next editor story with a new step)")*
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
owner: Story 9.5 (A2 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the first E9/E10 category story whose designs the
  two lists disagree about, with the answer put to the owner in R-83's shape — R-74 and DW-111 make a drawn panel win
  over a spec table, so the PRD is the likelier of the two to be corrected")*
location: `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` (:909, Appendix C) ·
  `packages/library/control-groups.json`
reason: Story 5.4 draws the row for whichever section carries it and reads the register rather than the PRD's list, so
  nothing it builds depends on the answer; the two pilots it is tested on, a4/13 and a22/1, appear in both lists.

### DW-186: "who can see this section" must never become a design control, or the value would exist twice

plain: Who a section is shown to is kept on the section you placed, not among the design's own settings. If someone
  later writes it into a design's settings list as well, the editor would hold the same answer in two places and they
  could drift apart.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `validateDesignJson` refuses a control named `member-visibility` or labelled "Member visibility" (trimmed, case-folded) as `member-visibility-control`, R-124's sentence. Control (`validate.test.ts`): one row per form; HEAD gave `[]` for both.
severity: medium
origin: Story 5.4's planning (2026-09-18) — Story 4.10 already gates a section through `RenderInput.visibility`
  (`core.ts` :200-202, `gateMembers` :1484-1500) on both emitters; a declared control would additionally stamp
  `data-member-visibility` on the root through `stampControls`, a second copy nothing reads. The category specs list
  `memberVisibility` in their control tables (`A22 Newsletter - Spec.md:291`) — that describes the panel ROW, not a
  `controlSchema` entry.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "each E9/E10 category story that builds a
  CTA-bearing design — **the rule itself landed in `docs/section-authoring.md` § 2 on 2026-09-18 with R-124, so what is
  left here is the validator's refusal**")*
location: `docs/section-authoring.md` · `packages/library/src/validate.ts` ·
  `packages/section-runtime/src/doc-schema.ts` (`memberVisibility`, the one place it is stored)
reason: no built design declares it and `tools/check-snapshots.mjs` reads only declared settings, so nothing can go
  wrong today; the refusal is one line in the validator and belongs with the first design that would trip it.

### DW-187: dragging inside the Site-wide card cannot move a footer above a header on the canvas

plain: Your header, announcement bar and footer are listed together in one card at the top of the Layers panel. The
  page always draws footers last, whatever order that card is in, so dragging a footer above a header would change the
  list without changing the page.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): a site-wide move is clamped to its band — headers and bars first, footers
  last, the order the page draws (`canvasStack`). `isSiteFooter` (`lib/editor.ts`) names the `a3/` prefix once and
  `landWithin(footers, from, to)` clamps a move inside its band. Layers' `dragTo` (the dashed slot), the ⌥-arrows (at
  the band's end the key does nothing), `gripMove` and `moveTo` — the one door every commit passes — all call it, and
  `LayerRow.footer` is set in `rowsOf`. `onPlace` puts a site-wide section that is not a footer before the first footer
  (`siteSlot`), so the site doc is stored in canvas order. A page doc is unchanged. No A3 design exists until Story 9.9,
  so the keyboard harness gains a stand-in footer (`app/harness/stand-ins.ts`: `a3/1`, the Rail re-id'd, behind
  `x-inflozo-harness-stand-ins: on`; never in `packages/library`). Controls, each red first: `editor.test.ts`'s
  `landWithin` case over made-up site docs (red unclamped) and its `siteSlot` case (red with HEAD's placement, always
  the end); the journey's ⌥↑ on the stand-in footer (red at HEAD with the stand-ins), which then selects the header and
  the footer and reads their sections first and last on the canvas (red with `canvasStack` planted unordered); the
  floor's footer grip dragged above the header (red at HEAD with the stand-ins). The head band's own order is DW-306
  (Story 9.5).
severity: low
origin: Story 5.4's planning (2026-09-18) — `apps/web/lib/editor.ts`'s `canvasStack` (:47-51) splits the site doc by
  `designId.startsWith('a3/')` and draws the footers last; the seeded "Pilot sections" project holds one site-wide
  section, so the case cannot be reached on it
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.5 (the template switcher and the synthesised templates), or the first
  story that seeds a footer beside a header")*
location: `apps/web/lib/editor.ts` (`canvasStack`) · `apps/web/components/controls/layers.tsx`
reason: no project in the repo holds both a header and a footer, and "footers compile last" is the compiler's rule, not
  the list's — whether the card should refuse that drop or the canvas should follow it is a decision, not a patch.

### DW-188: hovering a Layers row does not outline its section on the canvas

plain: Hovering a section on the page highlights its row in the list on the left. The other way round does nothing —
  put the pointer on a row and the page does not show you which section it is. Nothing asked for it; it is noted here
  so the decision is a decision.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-217: a Layers row's mouse points at its section —
  `onPointerEnter`/`onPointerLeave` (not touch) call `point(pick, 'layers')` — and a pointer from Layers draws the
  section's outline and name tag with no pill, no insert hairline and never a scroll (`pointedFrom`); only a click
  brings a section into view (R-156). Ghost's rows point through `pointGhost`. Keyboard focus keeps D8e's ring alone.
  `layers.tsx`'s "NOT BUILT, DELIBERATELY" note is rewritten. The editor, lock and axe walks park the pointer on the
  Layers title rather than at a point the rows reach. Control: `floor.spec.mjs`'s R-217 stop — one hover outline over
  the first row's section, a below-the-fold row leaves `scrollY` unchanged with no pill and no hairline, and leaving
  takes the outline away — red at HEAD (no outline).
severity: low
origin: Story 5.4's Dev (2026-09-18) — the mirroring Story 5.2 built runs ONE way (`editor.tsx`'s `point()` sets
  `data-inflozo-hover` from the canvas's own `pointerover`, and `controls/layers.tsx` draws the wash from `hoveredKey`);
  no frame draws the reverse, and no FR or ruling asks for it
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: was "Story 5.9 … or 5.23's play-loop gate, whichever first finds a user cannot tell which section
  a row is"; 5.9 is done and 5.23 has no screen, so neither can find one.)*")*
location: `apps/web/components/controls/layers.tsx` · `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx`
  (`point`) · `apps/web/lib/canvas-chrome.css`
reason: the section's name is on its row and its name tag is on the canvas, so nothing is unreachable today; the
  reverse hover would also have to decide whether a hovered row scrolls its section into view, which is a product
  decision the owner has not been asked.

### DW-189: a pill-grip drag over a site doc measures its landing in canvas order, and the site doc is stored in doc order

plain: The little grip on the hover pill lets you drag a section up or down the page itself. For the shared header and
  footer it works out where you dropped by looking at where the sections sit on the page, while the list on the left
  keeps them in the order they are stored. Today the shared group holds one section, so the two orders cannot differ.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), with DW-187: the pill's grip and Layers' grip measure a site-wide landing in
  the doc's own order, now the canvas's, and both clamp a footer's slot to the footer band (`gripMove`, `dragTo` →
  `landWithin`). Control: `floor.spec.mjs`'s DW-189 stop drags the stand-in footer by its Layers grip and then by its
  pill grip above the header; the slot stays in the footer band and the drop moves nothing. Red at HEAD with the
  stand-ins, and red again with an unclamped `gripMove` planted in this tree (the pill's half, after the Layers half
  passed), reverted.
severity: low
origin: Story 5.4's Review (2026-09-18, Edge Case Hunter) — `editor.tsx`'s `screenRows()` hands `landingAt` the site
  doc's instances in DOC order with each one's on-screen top; DW-187 records that the `a3/` footers compile last
  whatever the doc order, so a site doc holding a header after its footer would count the landing against a footer
  that is drawn at the bottom
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.19 (the site-wide footer story) or whichever story first seeds a site
  doc with two instances")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` (`screenRows`, `pillGrip`)
reason: unreachable while the seeded site doc holds one instance; the fix is to drag the site group by the Layers
  list's own layout (doc order) rather than by screen rects, or to sort the rects into canvas order first
note (Story 5.19's Create, 2026-09-25): the owner line above is stale — Story 5.19 is the Data group and the main feed,
  not a site-wide footer story. Re-owned: whichever story first seeds a site doc with two instances (A3's footer
  category, Epic 9).

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
owner: Story 10.79 (A24 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement
  word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "A24's category story (Post Headers, Epic 10),
  which sets the category's real `compileTarget`s — AD-35: a defect in a provisional pilot goes to its owning category,
  never to the story that noticed it.")*
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
owner: Story 10.104 (A31 — the content model, the stylesheet and designs #1–4), whose criteria carry its requirement
  word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the story that first puts Ghost's private
  flag into the `site_settings` snapshot — an Admin read, so Epic 3's snapshot writer — with Story 7.3 owning the
  matching `private.hbs` emission rule. (It named Story 5.18 until the second amendment below.)")*
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
  the same change. **Second amendment — Story 5.18's Create (2026-09-24): the Content API cannot answer it either.**
  The keys `GET /ghost/api/content/settings/` may return are `core/shared/settings-cache/public.js`'s — 48 on 5.130.6,
  60 on 6.58.0, read in source from the npm tarballs — and neither holds `is_private`: private mode is an Admin
  setting. So the browser-side reads 5.18 builds give the condition nothing to read, and 5.18 leaves this open. The
  flag has to come from the Admin `settings/` read Epic 3 already makes at connect and daily (`lib/probe-rule.ts`'s
  snapshot), which is why the owner line moved.

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
status: done 2026-09-25 (Story 5.19)
resolution: Story 5.19 (2026-09-25) — `packages/section-runtime/src/main-feed.ts`'s `designate`, the one rule
  (AD-27(d)): on a paginated doc at most one instance carries `isMainFeed`, it is a feed, and it is a VISIBLE one
  whenever one exists. Two flags are repaired to the first visible flagged feed; a feed with none is designated; a
  hidden main feed hands the flag on where a visible feed exists. `duplicateSection` writes the copy's flag false. The
  rule REPAIRS rather than refuses — no `docSchema` refine, which would black out an editor over a doc the rule can
  fix — and runs at every door a doc enters the editor through (`read.ts`, the local hydrate, `apply`, an undo); Story
  7.3's compiler passes every stored doc through it too (AD-27). A following page 2 copies page 1's instances, so it
  carries page 1's one flag.
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
status: done 2026-10-05 (Story 6.5)
resolution: Story 6.5's Dev (2026-10-05) built the planned expression and AD-30 names it. `mode-scoped-rule` (the library's
  `modeScopedRules`, read once) holds every design to the authoring rule — a mode-scoped control is selected on the root
  alone, each value one rule of the root's own custom properties, every value the same set — and the pilots and fixtures
  were refactored to it with no pixel moved (the refactor sweep: HEAD's stylesheets against the new ones, every design and
  fixture × every value × both modes × every reference pack, forced :hover/:focus-visible included, zero differences behind
  a planted change that was caught; the render matrix the second net). Both emitters stamp the hook from
  `RenderInput.instance` (`darkHook`, AD-36-checked); `darkOverrideCss` (`packages/section-runtime/src/dark-override.ts`)
  writes the dark value's set and its plain link's look under `MODE_SELECTORS`' two conditions. Proven in
  `dark-override.test.ts` (the I/O matrix's rows, each rule's specificity) and in the keyboard gate's agreement sweep
  (`tools/keyboard/mode.spec.mjs`: the theme's way equals the canvas's way, element by element, from each input alone,
  under every reference pack, behind a withheld-block control). Epic 7's token block appends it (Story 7.4); the editor
  stamps the same hook. The on-Ghost reading is MEASUREMENTS §69 (DW-318), and a compiled theme's is Story 7.35's.
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
owner: Story 6.5 (Mode resolution — three inputs, one precedence, one file), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Epic 7's theme-assembly story (FR-J3/§7.3, the
  `default.hbs` token block), which is the first thing that must express a dark override to a visitor — and an AD-30
  amendment recording whichever expression it picks. Raise it at that story's Create, not later: by then the library may
  hold authored overrides.")*
location: `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md:345`
  and `:347` (AD-30) · `:109` (AD-3's carve-out) · `packages/section-runtime/src/tokens.ts:165-186` ·
  `_bmad-output/implementation-artifacts/spec-5-6-light-and-dark-authoring.md` § Design Notes
reason: Story 5.6 is the editor, and Epic 5 deploys nothing — the override is stored faithfully and previewed
  honestly, so nothing is at risk now and settling the emission here would mean inventing a compiler convention
  in an editor story. Standing rule 6: flag, do not guess. Deciding it needs the compiler in front of you.
note (Story 6.5's Create, 2026-10-05): planned. No CSS can make a rule keyed on `[data-bg="contrast"]` fire on a root
  whose attribute says `base`, so the expression is carried by the designs themselves. A design states each value of a
  mode-scoped control as custom properties on its root, one root-only rule per value declaring the same set, and every
  other rule reads them. A new validator rule, `mode-scoped-rule`, enforces it, and the pilots and fixtures are refactored
  with no pixel moved. A section's dark override is then the dark value's set, for that one section (`data-instance`, a
  hash of `template_key:instanceId`), emitted into the token block under the same mode selectors by `darkOverrideCss`. A
  plain link follows at specificity (0,0,1), so `LINK_RULES` keeps its bytes. Both directions were executed at Create in
  Chromium; the keyboard gate's sweep proves every design and pair of values against the canvas's own dark preview.

### DW-196: `darkCapabilities` is declared on every design and read by nothing

plain: Every section design in our library carries a note saying how much dark-mode support it has. Nothing in
  the product ever looks at that note. Either something should use it, or it should go — right now it is a field
  authors have to fill in for no effect, which is how a field quietly starts saying something untrue.
status: done 2026-10-03 (Story 6.1)
resolution: Story 6.1's Dev (2026-10-03) — the field has a closed vocabulary (`DARK_CAPABILITIES` in
  `packages/library/src/vocabulary.ts`, typed on `DesignJson` and the registry entry), each DERIVED from the design:
  `tokens` (the stylesheet writes no colour literal and names no mode — required of every design, and AD-30's "a design
  stylesheet that names a mode fails the build" gets its reader), `background` (two or more Background values) and
  `override` (one of its own controls declares `darkOverride`). `validateDesign` refuses a declaration that differs
  from the derived set in either direction, or carries any other word, with one code, `dark-capabilities`, naming the
  missing, unearned or unknown words; handed no stylesheet, only `tokens`' presence is asked. Every pilot and fixture
  declares `["tokens", "background"]`, and `controls/1` adds `"override"` — what the reader derived from
  each, run over every one before a declaration was changed. Proof: `validate.test.ts`'s dark-capabilities test fires
  the code short, long, unknown, twice, on a mode (`data-mode`, `prefers-color-scheme`, `scheme-dark`) and on a
  colour literal (a hex, `rgb()`, a `var()` fallback, `oklch()`, `hsla()`) beside its clean controls, red against
  HEAD's validator; `tools/check-snapshots.mjs` validates every design with its stylesheet on every commit, and its
  hostile-input timing runs through the new reader. `docs/section-authoring.md` says what each word means.
severity: low
origin: Story 5.6's Create run (2026-09-18), executed over the repository: `darkCapabilities: string[]` is
  declared on `DesignJson` and on `SectionRegistryEntry` (`packages/library/src/registry.ts:136`, `:178`) and
  copied through `buildEntry` (`:229`); a grep for the name across every `.ts`/`.tsx`/`.js`/`.cjs`/`.mjs` in the
  repository returns those three lines, one test fixture (`validate.test.ts:415`) and nothing else. Its
  vocabulary is unvalidated — a bare `string[]`, so any word passes — and all five pilots plus both fixtures
  declare exactly `["tokens"]`. Story 5.6 needed none of it: the engine keys on each control's own
  `darkOverride` declaration, which is the thing that actually decides whether a control is mode-scoped.
owner: Story 6.1 (The token engine — computed or authored, and nothing in between), whose card names this entry: it
  decides what `darkCapabilities` says about a design and builds what reads it. *(Story 5.24c's Create, 2026-09-29, on
  the owner's ruling: was "Story 5.24c (The sweep: …), one of the sweep's five stories (R-211)"; Story 5.24a's Dev,
  2026-09-28: was "unowned — needs one. Candidates: Epic 6's Style Pack stories (where "what dark support does this
  design have" is a pack-facing question), or the first category story that authors a design whose dark support is not
  just tokens. A reader with a validated vocabulary, or deletion; not a third state.")*
ruling (owner, 2026-09-29, Story 5.24c's Create, Question 3, option 2): *"Keep it, and give it a job later."* Deletion was
  recommended — nothing reads the field, `image-swap` (5.24a's plan) is grounded nowhere, and `fixtures/controls/1`
  already says `["tokens"]` beside a `darkOverride` control — and the owner chose to keep it. So the field stays in
  FR-G3, AD-2, `registry.ts` and every `design.json` as it is, authors keep filling it in, and Story 6.1 gives it a
  meaning and a reader. Until then it is still the declaration nothing can falsify that this entry names.
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
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed by Story 5.8 — re-read: `settings/actions.ts:95,131-135` reads
  `revision` on the same query as the greyed-Clear refusal and sends ONE `sync_project_doc` call with `p_base`, one
  transaction for every cleared doc; the RLS gate (`bash supabase/tests/run-rls-gate.sh`, run today, exit 0) passes "a
  stale base_revision writes nothing and reports the current revision"; the deployed editor walk's step 53 (b) drives
  the Clear on production.
severity: medium
origin: Story 5.6's Review (2026-09-18), Blind Hunter and Edge Case Hunter, read in
  `clearProjectDarkOverrides`: a `for` over `project_templates` rows, one `update({ doc })` each, returning the
  error sentence on the first failed write with earlier rows already cleared; no `.eq('revision', …)`.
owner: Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27), closes it with its evidence: Story 5.8 moved
  the project-level Clear onto `sync_project_doc`, and `settings/actions.ts`'s own comment says CLOSED BY STORY 5.8.
  *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was: "Story 5.8 (FR-D8's journal and the
  revision contract) — it is the first story in which a second writer of `project_templates.doc` exists, and it
  decides what a guarded doc write looks like. This action adopts that.")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` (`clearProjectDarkOverrides`)
reason: Inventing a revision check here would pre-empt 5.8's contract, and before 5.8 there is no concurrent
  writer to lose to. Review did close the two halves that were reachable: a zero-row write is now a refusal, and
  an unparseable doc is skipped rather than thrown.

### DW-198: no check reads a Background-role swatch's colour in dark, and the project-level Clear is proved on one section

plain: In dark, the little colour dots beside "Background role" should show the dark colours. They do — but no
  automatic check looks, so a future change could quietly put the light colours back. In the same way, the
  project-wide Clear is only ever tested with one overridden section on one page.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the settings sidebar takes the swatches for both modes (`swatches:
  Record<Mode, …>`) and a required `mode`, so a role's dots are the colours of the mode on screen; `/pilots` passes its
  mode and `/controls` `light`. `clearProject` (`packages/section-runtime/src/doc-edit.ts`) is the one fold over every
  doc, remembered overrides included, and Theme settings' Clear calls it. Controls: a journey stop reads the Background
  role's dots against the canvas's own tokens in light and, after `.`, dark — red with `swatches.light` planted in the
  sidebar ('dark: base'), reverted; `doc-edit.test.ts`'s `clearProject` cases over several sections on several docs, a
  remembered override among them — red at HEAD by absence, since HEAD has no `clearProject` to call.
severity: low
origin: Story 5.6's Review (2026-09-18), Verification Gap: changing `swatches[mode]` to `swatches.light` in
  `pilots/review.tsx` or the editor fails nothing; `run-verify-editor.cjs` step 53 (b) plants one override on
  `home`'s first instance and reads only that back.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.8 for the Clear (it makes a multi-canvas stored override reachable
  without planting rows by hand); the swatch read belongs to the next story that touches `run-verify-pilots.cjs`.")*
location: `tools/probe/run-verify-editor.cjs` step 53 (b) · `tools/probe/run-verify-pilots.cjs` ·
  `apps/web/app/(app)/app/(authed)/pilots/review.tsx`
reason: Both are coverage, not defects — the behaviour was read correct at Review — and the harness run is already
  long enough to time out on this machine's link.

### DW-199: nothing reads the editor skeleton's card, and it cannot hold 16:10 on a short, wide window

plain: While the editor loads you see a grey placeholder shaped like the page. On your 1440 screen it is the right
  shape. On a short, wide window the real page is shorter than the placeholder, so there would be a small jump when the
  editor arrives — and no automatic check looks at the placeholder's shape at all.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the skeleton's card fits as the real card fits —
  `w-[min(100cqw,100cqh*1440/900,1440px)]` with `aspect-[1440/900]` on an `@container-size` ground that has the stage's
  `coarse:pb-[52px]`, and `data-skeleton-card` so it can be read. That also closes the missing 1440 cap and the touch
  padding. Control: `floor.spec.mjs`'s DW-199 stop reads the server's skeleton with JavaScript off and the real card
  with it on, at 1440×600 and 2560×1440 with 1440×900 as the control: equal within 1 px. Red at HEAD on the short wide
  window (41.6 px apart) after the control passed.
severity: low
origin: Story 5.7's Review (2026-09-19), Verification Gap + Acceptance Auditor: `aspect-[1440/900] max-h-full w-full`
  squashes rather than fits when the stage is height-bound (the file's own `ponytail:` note), and reverting the
  skeleton to its pre-R-137 shape fails no step of `run-verify-editor.cjs` (step 9 reads only the sr-only sentence).
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.9 (the editor's first in-`pnpm check` browser test), or the first story
  that sees the jump.")*
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
owner: Story 9.6 (A2 — designs #5–8), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: was "the first story of Epic 9 that takes the library past a couple of dozen placeable
  designs — it is the story that makes the payload a problem and the one that can measure it.")*
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
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01), with DW-174: no second zod instance — the probe on `/` was `lib/style-pack.ts`'s
  schema built before anything set `jitless`. `apps/web/lib/zod.ts` sets it first for every app import, ESLint keeps it
  so, and `apps/web/zod-jitless.test.ts` is the control (0 probes; 1 with the import reverted, ESLint red too).
  Production's `/` reported 3 eval refusals before the push; the editor walk's dashboard filters are gone, so a report
  there fails it.
severity: low
origin: Story 5.8's Review (2026-09-19), the Real-infra verifier, on the deployed site: `securitypolicyviolation`
  `script-src` / `eval` at `https://app.inflozo.com/`, source a `_next/static/chunks` file at the offset of zod's
  `try{return Function(""),!0}`. `z.config({ jitless: true })` in `doc-schema.ts` evidently does not reach that chunk.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches the Projects page or the CSP — or Story
  5.9, whichever is first.")*
location: `packages/section-runtime/src/doc-schema.ts` (the `jitless` call) · whichever module puts zod on `/`
reason: pre-existing and harmless; finding which import carries a second zod instance onto `/` is its own small hunt.
  `run-verify-editor.cjs` step 70 is now scoped to the editor and canvas exactly as step 14 is, so it no longer trips.

### DW-202: a save the server refuses for good still shows "Retrying … when the connection returns"

plain: If you leave the editor open so long that you are signed out, the editor keeps trying to send your work and
  says it is waiting for the connection — when what it really needs is for you to sign in again. Your work is still
  safe on your computer, and signing in from another tab makes the next try succeed, but the message is not the true
  reason.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-213 and R-227: a save the server refuses because the sign-in ran out (401)
  takes the save indicator's sixth state, Signed out (`SyncState` and `SIGNED_OUT_COPY` in `lib/journal.ts`, Tabler
  `logout` in `kit/icons.tsx`; the Kit's catalogue draws it with the other five). B6's red panel says R-213's sentence —
  or R-227's while the editor holds no copy on this device — with a Sign in link that opens a new tab and no Retry now.
  The backoff keeps trying underneath, and a visit back to the tab tries at once. Only a 401 takes it: a dropped
  connection, a 422, a 502, a 404 and a 400 stay Retrying, and a tab displaced from the lock while Signed out leaves it.
  The editor's three actions (`actions.ts`) answer a signed-out tab with their own refusal (`currentUser()`) instead of
  redirecting it. Controls, each seen red: the journey's R-213 stop — red at HEAD ('Retrying' where 'Signed out' was
  wanted), with the visit back's try removed (still Signed out 1.5 s later), and with the backoff gone while Signed out
  (no further request); the journey's R-227 stop — a second page deletes this browser's copy, so the editor falls back
  through its own `versionchange`, and the 401 then says R-227's sentence — red with the panel planted to say R-213's;
  and `server-wiring.test.ts`'s row — each action returns ITS refusal (`SAVE_REFUSED`, `VIEWED_REFUSED`, `{ refused:
  true }`), the file holds no `redirect(`, and an export that reads no user fails — red at HEAD (`setPreviewSubject`
  redirected a signed-out tab), its three in-test controls caught. A save refused for good is DW-304 (Story 7.18). The
  walk is at Review.
  *(Story 5.24e's review, 2026-10-02: the deployed walk pressed an action with the ended session's cookie still held, and
  the tab WAS redirected — `getUser()` dropped the cookie inside the action and Next re-rendered the route into the
  layout's guard. The three actions now read the session through `quietSession()`, which writes no cookie, and
  `proxy.ts` leaves a dead session's cookie removal for the next request that is not a server action — its own removal on
  the action's response did the same. The walk's step 8 arm (green on `f8c35e4b`) and `server-wiring.test.ts` hold it.)*
severity: medium
origin: Story 5.8's Review (2026-09-19), four of five layers. `flush()` sends every non-OK status but 409 to the
  backoff. 401 is the reachable one; 404 and 422 need a bug or a deleted project. B6 has five states and no sixth,
  so an honest answer is a new sentence or a new surface, which is the owner's to draw.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "Story 5.17 (the edit lock), which already adds the
  editor's "you are no longer the one editing" surface.")*")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`flush`'s `catch`) · `sync/route.ts`
reason: nothing is lost while it stands — the device holds the work and a retry after sign-in lands — and the fix is
  a piece of interface nobody has drawn (R-74).

### DW-203: two tabs of one project share one local record, and the local database outlives sign-out

plain: Open the same project in two tabs and both write their undo history into the same place on your computer, so
  a reload can come back with a mixture. And the copy of your work kept on the computer stays there after you sign
  out or delete the project, which matters on a shared machine.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-214: every sign-out door — the account menu, the restore page and Sign out
  everywhere — goes through one flow (`signOutFlow`, `lib/journal.ts`; `components/shell/sign-out.tsx`): send what this
  browser owes, erase its copy (`inflozo-doc-<user>`), then sign out; when something cannot be sent it asks first, in
  B5c's shape extrapolated ("Sign out with unsent work?", focus on Wait, "Sign out anyway" busy as "Signing out…"). Each
  send is the flush's body without a lock session (`sendBody`), and only a 200 is sent (`sentBy`); a 200 is told to this
  browser's open editor of the project (`SENT_CHANNEL`, `sentMessage`), which takes it as its own flush's answer when it
  was sent from the base that editor holds — before, its next edit carried the old base into a 409 and the conflict
  dialog. The two-tab half, open at HEAD (the Create executed it): `flush` returns unless this tab holds the lock, and
  the hydrate skips the on-device record when the tab opens reading along. Its ceiling, named at the wall in `flush`: a
  tab that typed on its optimistic first paint and then lost the first `acquire` keeps those edits unsent and
  unannounced — the shared record is the holder's, so it is not reset. Controls, each seen red: `journal.test.ts`'s
  `signOutFlow` cases (the sign-out moved before the erase, the ask skipped, a failed erase stopping the sign-out) and
  its `sendBody`, `sentBy` and `sentMessage` cases (red by absence); the journey's R-214 stop — another page announces a
  send of this editor's owed record, and the editor's next save carries the announced base — red with the editor's
  listener removed; the journey's DW-203 stop (two pages, one context) — red at HEAD (the reader drew the holder's
  unsent page), its reader's ⌘S sending nothing red with both walls removed; the lock walk's R-214 stop — an edit owed
  on this device alone, Sign out pressed in a second tab — red as a LOCAL RUN on production at `3c88798f` (the copy
  survived, the edit unsent) and green against a local build of this tree; and the editor walk's step 8, which presses
  Sign out anyway with the sign-out's own request held — R-98's "Signing out…", `aria-busy` and `aria-disabled`, never
  `disabled` — then reads the browser signed out and its copy gone, and a sign-out with nothing owed erasing it too —
  green against a local build of this tree (the walk's other reds there are the ones every local run shows: the request
  API's cookies over plain http), and not run on production, where HEAD has no ask. A deleted project's records go with
  the next sign-out's erase. The deployed walk is at Review.
  *(Story 5.24e's review, 2026-10-02: Sign out everywhere skipped the send and the erase on production — the Account page
  got no user id from the shell — and is fixed with a walk arm and a `server-wiring.test.ts` row; the first-opener
  ceiling this wall leaves is DW-308, Story 7.18's.)*
severity: medium
origin: Story 5.8's Review (2026-09-19), Blind Hunter and Edge Case Hunter. `local-store.ts` keys rows by
  `<projectId>:<seq>` with no tab identity; nothing deletes `inflozo-doc-<userId>`.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "Story 5.17 for the two tabs (its lock makes the second
  tab read-only, which removes the writer); the account deletion story for the clean-up.")*")*
location: `apps/web/lib/local-store.ts`
reason: the lock is the designed answer to two writers and building a second one first would be thrown away.

### DW-204: the deployed editor page sometimes takes more than 30 seconds to finish loading for the test harness

seen again: Story 5.11's Review (2026-09-20, build `56d801c7`) — five attempts of the walk: one complete (455 PASS,
  its only FAIL a user-count control disturbed by a second recorder running beside it), two dead at `page.reload` and
  `page.goBack` before any patch, and two dead at the SAME place after — step 53's soft navigation Back to the editor,
  `painted('home')`, 492 PASS and 0 FAIL each time. Same shape (a navigation that never settles), a new step to add
  to the list of where it lands; the step's own code was not touched by that story.
seen again: Story 5.23a's Dev (2026-09-28) — three of five walks died on a Playwright request that never answered in 30 s.
  Run 1 (`10c30db4`) at step 79's `GET /harness/editor` (`run-verify-editor.cjs:5856`) after 579 PASS and 0 FAIL, while
  curl had the same three addresses answer 404 in 0.24–0.29 s straight after. Runs 2 (`10c30db4`) and 4 (`e7b4b169`) at
  the SAME place, the last step: step 9's raw `GET /projects/<id>` (`:6661`, then `:6673`), after 662 and 664 PASS. That
  repeat was sampled, as a repeat must be: a throwaway account seeded as the walk seeds it, signed in by magic link, sent
  the same raw GET 30 times in a fresh context — 30 of 30 answered 200 with the skeleton, in 464–1521 ms (median 593), none
  over 5 s. So the route does not stall alone; it stalls late in a long walk, as this row says. Neither request goes
  through `steady`'s retry, which covers page navigations only. Every run deleted its accounts (users 13 → 13).

plain: Our automated walk of the live site opens the editor dozens of times. On 2026-09-19 roughly one opening in
  twenty never finished loading within 30 seconds, which stops the walk. Ordinary pages on the same site answer in a
  third of a second, and the same walk on a local copy never stalls. We do not yet know whether the slow part is this
  computer's connection or the live editor page itself — if it is the page, a customer would see it too.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): classified from Vercel's request rows, and it is not the product. The editor
  walk now notes every first failure of a signed-in load with its ISO start (DW-183), and the rows were read at each:
  the CLI's `--json` lines and, for durations, the rows behind them (`vercel.com/api/logs/request-logs`, the endpoint
  the CLI reads, which carries `requestDurationMs`, each function's `durationMs`, start type and region, and the
  client's user agent). The story's walks (LOCAL RUNs against production, 2026-10-01 10:55–12:50 UTC) noted thirteen
  real stalls, all on `GET /projects/<id>` or one of its canvases, and every one read has the same shape (all but
  12:30:17.644Z, whose window the log API would not serve): NO row for the first attempt; for the page loads, not one
  row from the whole walk inside its 30 s (11:27:10.874Z, 11:53:16.168Z, 11:55:13.753Z, 12:03:25.250Z, 12:05:53.261Z,
  12:08:04.742Z, 12:40:34.627Z, 12:42:52.844Z, 12:44:03.129Z; 11:10:33.498Z read by hand; 11:54:03.589Z with two of the
  walk's other requests answered inside it); and the retry's row a 200 at +40.1–40.2 s from the first attempt's start —
  ten seconds after the retry left, every time — answered in 0.6–1.8 s with the middleware hot in bom1 and the function
  hot in fra1. The one stall on Playwright's own HTTP stack (`request.get`, 11:34:11.518Z) had the page's lock POST
  answered beside it, and its retry answered at once. One more, outside the walk (a throwaway account photographing
  Projects, 10:10 UTC), is the only one with a row: its document 200 in 864 ms, the function 263 ms hot, while `load`
  waited on something the request log does not carry (`/_next/static` is not in it). So, by the spec's rule: the client
  or the network, never the editor's function, and nothing whose remedy costs money (the Ask First did not fire). The
  constant ten seconds points at a timeout on this machine's side (a resolver's, or a connect fallback's) — a
  hypothesis, not executed. 2026-09-19's curl (TLS up, then no first byte) is the one observation this cannot tell from
  Vercel's edge. The walk survives each by its one retry; reopen if a deployed walk's stall ever has a row that is slow
  or a 5xx.
severity: medium
origin: Story 5.8's Review (2026-09-19): fourteen deployed attempts across `9ad1ac47`, `02cd7f7a` and `9faf014c`,
  two complete; every death a `page.goto` timeout on `/projects/<id>` at a different step. The one stalled `/sync`
  POST in the same session (patched: the 20s limit) is the same symptom on a different request.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27).
  *(Story 5.23's Create, 2026-09-27: every story this line named is done. Was: "Story 5.9, before its own deployed walk
  — read Vercel's function logs for the `[id]` route over a walk, and run the walk once from a second network.")*")*
location: `tools/probe/run-verify-editor.cjs` (`freshLoad`, every `page.goto(editorUrl())`) · the editor route's
  server reads (`(editor)/read.ts`)
reason: telling the two causes apart needs Vercel's logs and a second vantage point, neither of which a review of
  5.8 owns; the harness already refuses to call a died run a result.
  **Story 5.9's Review (2026-09-19):** Dev did not touch it, and the Real-infra verifier's four walks of `a9aa4b21`
  all died the same way (lines 1661, 1325, 655 and 3145) while curl had the site in 0.25s. Every navigation after the
  magic link now gets one retry (`steady`), which is a way round it and not its cause — the diagnosis above is still owed. On `7874dd5b` two walks
  completed: one had step 66's ⌘S stuck on Syncing with the revision unmoved (the stalled `/sync` again, this time
  past the 20s give-up within the step's wait), the next had 0 FAIL. A customer pressing ⌘S would see the same.
note (Story 5.24a's review, 2026-09-28): this entry now carries DW-175's signed-in half — the editor's stalls after the
  magic link, which DW-175's close (300 signed-out GETs of `/sign-in`, every one 200) did not measure.

### DW-205: the same announcement twice in a row is silent to a screen reader

plain: The editor speaks to screen-reader users through one hidden line of text. If the same sentence is written
  twice running — duplicate a section, then duplicate its same-named copy — the second one changes nothing on the
  page, so nothing is spoken, and the person cannot tell the second key worked.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): every live region is one announcer, `useSaid` (`lib/renders.ts`): `{ words,
  n }`, each sentence bumping `n`, rendered as `<span key={n}>` so a repeat is a new node and is spoken again — React
  Aria's LiveAnnouncer technique. The editor's polite `#editor-said` and assertive `#editor-announced`, `item-list.tsx`,
  `data-group.tsx` and `/controls`' review use it. Control: the ⌘D journey — a second identical ⌘D adds exactly ONE node
  to `#editor-said`, a repeat being one announcement and never a burst — red at HEAD after the identical-sentence
  control passed, and red with a second node planted beside the first.
severity: low
origin: Story 5.9's Review (2026-09-19), Edge Case Hunter. `setSaid` is a plain `useState`; React skips an identical
  value. The pattern is every story's since 5.2 — the keyboard map only makes a repeat likelier.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 15.2, whose manual screen-reader pass per surface verifies the live-region
  announcements (UX-DR12). *(Story 5.23's Create, 2026-09-27: was "Story 5.23's play-loop gate, where the editor is
  walked with a screen reader"; 5.23 walks nothing with a screen reader.)*")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`setSaid`, every caller)
reason: the fix is one helper every announcement routes through, and whether a repeat should be re-spoken at all is
  best judged with a screen reader running, not from the code.

### DW-206: the Section Picker is four columns at every width, so its cards are tiny on a narrow editor

plain: The picker always draws four cards across. On a wide screen that is right (your ruling R-153). On the two
  narrower editor layouts the same four columns leave each card about a thumb wide, too small to read.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed by Story 5.22's R-203 — `section-picker.tsx:280` draws four
  columns at full width, two below 1280 and one where two would cut a card's name; re-run today, the keyboard gate's two
  R-203 checks pass (`floor.spec.mjs:448`, `journey.spec.mjs:3260`), and the deployed editor walk's step 98 covers
  production.
severity: low
origin: Story 5.10's Review (2026-09-20), Blind Hunter.
owner: Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27), closes it with its evidence: Story 5.22's R-203
  made the picker two columns below 1280 and one under a 514px grid (`section-picker.tsx:280`). *(Story 5.23's Create,
  2026-09-27: every story this line named is done. Was: "the story that builds the editor's below-1440 layouts (`D8
  Editor Below 1440.dc.html`).")*
location: `apps/web/components/editor/section-picker.tsx` (`COLUMNS`)
reason: R-153 ruled four columns on the width he tested; the narrow picker has no frame yet, and drawing one is
  that story's work (R-74), not a guess made in a review.

### DW-207: three small leftovers in the Section Picker

plain: (1) If a section is refused, the sentence saying so stays on screen after you change category or search.
  (2) While you search, the title says "All sections" but the category you had chosen still looks chosen.
  (3) The search box shows a ⌘K hint, but pressing ⌘K while typing in it does nothing in the picker.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the Section Picker's three leftovers. R-37's refusal clears as soon as a
  search is typed or a category chosen; while a search is typed the rail's checked row is All sections, as the header
  says (`browse`); and ⌘K inside the picker (`shortcutFor`) comes back to its search with the words selected. R-37's one
  refusal is about A25, so the harness gains a stand-in post content layout (`a25/1`, re-id'd from `a24/1`,
  harness-only). Controls: three journey stops, each red at HEAD with the stand-ins after its own control passed.
severity: low
origin: Story 5.10's Review (2026-09-20), Acceptance Auditor and Blind Hunter.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: was "Story 5.23's play-loop gate"; these are three visible Section Picker fixes and 5.23 has no
  screen.)*")*
location: `apps/web/components/editor/section-picker.tsx`
reason: each is cosmetic and none blocks a placement; the refusal itself is reachable by one design only (R-37).

### DW-208: the canvas document's cache rule lives in two files and is tested by reading one of them as text

plain: The rule that decides whether a browser may keep the preview page is written twice — once for the real
  editor, once for the test harness — and the only automated test reads the first file's words instead of asking
  the page. The deployed walk's step 83 is the one check that really asks.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `canvasCaching(v, live = NODE_ENV === 'production')` beside `V` in `lib/canvas.ts` is
  the one rule both canvas routes call (one comment left); unit rows in `pilots.test.ts` replace the regex, and
  `frame-guard.test.ts` asks `/canvas?v=abc123` in production and out of it — a unit handed `live` cannot see the
  default the routes rely on. Controls, each red: `v !== 'dev'` dropped (the unit row), and the default flipped (the
  route test).
severity: low
origin: Story 5.10's Review (2026-09-20), Verification Gap and Blind Hunter. The production defect this review
  fixed (an empty build id) was caught by step 83 and by nothing in `pnpm check`.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches `/canvas`.")*
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

status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `tools/keyboard/floor.spec.mjs` gains a describe at 1280 × 720 that presses the
  section pill WITH A MOUSE on the ringed section (the floor's header now says a pointer is allowed there): Next → "2 of
  3" and "Design 2 of 3 — …", Previous → "1 of 3", Shuffle → another design, ⌘Z → "1 of 3". Controls, each red: the
  pill's arrows swapped, and Shuffle cut.
severity: medium
origin: Story 5.11's Review (2026-09-20), Verification Gap reviewer.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1 — A1's designs #1–4 are the first shipped ring, so its
  deployed walk rewrites step 86 and presses the pill's ◀ ▶ and Shuffle on production. *(Story 5.23's Create,
  2026-09-27: was "Story 5.23 (the play-loop gate), or the first Epic 9 story that gives a shipped category a second
  design"; 5.23's gate runs over the project doc, not the pill.)*")*
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

status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-218: a capped list's header reads "{n} items · {shown} shown in this
  design · {min}–{max}" (`shownInThisDesign`, `lib/ring.ts`), with `item-list.tsx` passing the list's own range.
  Controls: `ring.test.ts`, red at HEAD; the controls walk's assertion, `/^3 items · 2 shown in this design · 2–6$/`,
  its one FAIL against production at `3c88798f`. FR-D13 and Story 5.11's card carry the sentence. The deployed walk is
  at Review.
severity: low
origin: Story 5.11's Review (2026-09-20), Blind Hunter.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "the first Epic 9 story that ships a `data-items-limit`. *(Story 5.23's Create,
  2026-09-27: "Story 5.23, or" dropped; the fix changes a sentence the owner approved, and 5.23 changes no panel
  words.)*")*
location: `apps/web/components/controls/item-list.tsx` (the `range` line)
plain: When a design shows fewer items than the section holds, the list's header says "3 items · 2 shown in this
  design" (the sentence the PRD asks for) INSTEAD of "2–6 · 3 used". The add and remove buttons still stop at 2 and
  6, but the numbers are no longer printed while that design is showing.
reason: FR-D13 gives the exact sentence and the owner's test (step 10) accepted it; the deployed walk asserts it
  verbatim. Printing both ("3 items · 2 shown in this design · 2–6") is one line, but it changes a sentence the owner
  has just approved, so it is his to want first.

### DW-213: `itemsShown` reads the first `data-items` element bound to a path, so two lists on one path with two caps report the first

status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `validateMarkup` refuses two `data-items` over one path with different caps (`items-limit-conflict`), a missing cap counting as a cap. Control (`validate.test.ts`, DW-213): 3 against 5 and 3 against none refused, 3 against 3 and none against none clean; HEAD gave `[]`.
severity: low
origin: Story 5.11's Review (2026-09-20), Edge Case Hunter.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "Epic 9's authoring pass, if any design
  ever binds one array on two elements.")*
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1 — the first shipped ring, where the
  owner sees the fade in his own editor. *(Story 5.23's Create, 2026-09-27: was "Story 5.23, or the first Epic 9 story
  that gives a shipped category a second design"; 5.23 draws nothing.)*")*
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

status: done 2026-09-27 (Story 5.23a, Dev) — walked in a browser on every commit
severity: low
origin: Story 5.12's Review (2026-09-20), Verification Gap reviewer and Blind Hunter.
owner: Story 5.23a (R-206, owner, 2026-09-27) — its 40-section harness page is where several sections re-roll and one
  ⌘Z restores them. *(Story 5.23's Create, 2026-09-27: was "the first Epic 9 story that gives a shipped category a
  second design, or Story 5.23". The location's `harness/editor/page.tsx` has been `layout.tsx` since Story 5.20.)*
location: `tools/keyboard/journey.spec.mjs` (the FR-D17 stop); `apps/web/app/(app)/app/harness/editor/page.tsx`
plain: Remix promises that one Undo puts a whole page back. The automated walk only ever remixes a page with one
  changeable section, so "one Undo for many" is proved by a unit test of the logic, not by pressing keys in a browser.
reason: The review made the fold pure (`remixFold`) and tests it with two picks and with a refusal, and the editor
  commits its result once, so the claim is structurally held. An end-to-end stop needs a second ringed section on
  the harness Home doc, which shifts the fixtures every other stop counts on; left for the story that has a real ring.
fix: Story 5.23a (2026-09-27). The harness builds a LONG Home on request (`x-inflozo-harness-home`, FR-D14's long page,
  the Home designs cycled — `harness/editor/layout.tsx`), so the default fixture every other stop counts on is
  untouched, and the keyboard gate's DW-215 stop (the 5.23a describe in `tools/keyboard/journey.spec.mjs`) remixes it:
  every section of the fixture ring re-rolls, the stop asserts more than one did, ONE ⌘Z puts the canvas back equal to
  its pre-Remix snapshot node for node (`isEqualNode`), and no other section's root was replaced at either step. Its
  control: on the paint as it stood before 5.23a the same stop failed — every root on the page new after the Remix,
  not only the re-rolled ones.

### DW-216: the die's pip-centre measurement is written three times

status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): one module, `tools/probe/die-pips.cjs` — `diePips(faces)` returning each
  face's `{layers, distinct, box}`, computed from the face's box and each layer's size (never the rule read back),
  self-contained because `evaluateAll` runs it in the page. The keyboard journey imports it (`import diePips from
  '../probe/die-pips.cjs'`), the editor walk's step 88 and the controls walk require it; the three copies are gone.
  Control, seen red with R-164's fault planted (`background-size: auto`): the journey's "face 2's pips must land in 2
  different places". Through it, on production: the editor walk's step 88 and the controls walk's remix check both read
  [1,2,3,4,5,6].
severity: low
origin: Story 5.12's Review (2026-09-20), Blind Hunter.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "whoever next changes how the die's faces are drawn.")*
location: `tools/keyboard/journey.spec.mjs`; `tools/probe/run-verify-controls.cjs`; `tools/probe/run-verify-editor.cjs`
plain: The check that every dice face really shows a different number of dots exists in three copies. A fix to one
  could miss the others.
reason: The three are an ESM Playwright spec and two standalone CommonJS probes with no shared module between them
  today; one shared file is the fix, and it is not worth a new module for fifteen lines until the drawing changes.

## Deferred from: code review of spec-5-13-the-content-source-pill-and-the-preview-subject.md (2026-09-21)

### DW-217: the preview subject is stored per canvas per PROJECT, not per user

status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — PRD Appendix G's collaboration bullet records it: when team seats ship,
  `project_template_prefs` becomes per user, a migration pushed as that story's Schema phase (R-99). Nothing in v1 lets
  a second person open a project.
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

status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): step 89 captures the subject save (`page.waitForRequest` on its
  `next-action` POST) and replays it from the signed-in page, first with another valid slug — `{"ok":true}` and the row
  moves, the replay's own control — then forged once per refusal in the I/O matrix: a project id that is not a uuid, a
  key of `nonsense`, an empty slug, a 192-character slug, a `kind` of `page`, a `source` of `ghost`, and B's project.
  Each answered with the product's refusal, A's row stayed byte-identical and B's `project_template_prefs` stayed `[]`.
  The Author canvas names its fixture writer, another is chosen and its row read back; the Page canvas names its one
  subject and its menu holds exactly that row. All PASS on production (LOCAL RUN).
severity: low
origin: Story 5.13's Review (2026-09-21), Verification Gap reviewer and Acceptance Auditor.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27).
  *(Story 5.23's Create, 2026-09-27: was "Story 5.23, or whoever next extends step 89"; unrelated to the play loop.)*")*
location: `tools/probe/run-verify-editor.cjs` (step 89); `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts`
plain: The automated walk proves choosing an article works and is saved. It does not try a deliberately bad choice to
  see it refused, and it visits the Post and Tag canvases but not Author or Page, which only unit tests cover.
reason: The refusal guards run inside a server action the harness cannot call with forged arguments without its own
  signed-in action client; the read side (`resolveSubject`) already falls back on anything bad and IS tested. Author
  and Page share every line with Tag and Post.

### DW-220: the deployed editor walk's step 66b/66c failed once in three runs on unchanged code

status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the check read too soon, executed both ways. `lib/journal.ts` exports
  `SYNC_TIMEOUT_MS` (20 000 — the unload flush's `AbortSignal.timeout`, the editor's own budget, written once), and 66b
  polls `revisionNow58()` until it moves for `SYNC_TIMEOUT_MS + BACKOFF_S[0] × 1000` and a 5 s margin, then reads the
  state and notes a Retrying it saw. Control, LOCAL RUNs against production with the hide flush's keepalive POST held 17
  s (`page.route` first confirmed to see it): the new wait PASSES ("revision 11 → 12 within 30000 ms · states seen
  [Syncing, Synced]") and HEAD's walk under the same hold FAILS 66b with this entry's own line, "Saved on this device →
  synced false · revision 11 → 11". A flush that never lands still fails the new wait.
severity: low
origin: Story 5.13's Review (2026-09-21), the deployed walk at `efda9d6c`.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27).
  *(Story 5.23's Create, 2026-09-27: was "Story 5.23, or whoever next touches autosave or the walk"; that trigger fired
  at 5.13, 5.14 and 5.22 and nobody took it, and it is unrelated to the play loop.)*")*
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
evidence (Story 5.22's Dev, 2026-09-27): the same stop, word for word — **3 FAIL, 656 PASS** at `765cdbde`
  (`dpl_4Ln5NMuSuYafAPCo52uooUTbDPQ4`), 66b's two lines "Saved on this device → synced false · revision 10 → 10" beside a
  step 90 failure of the walk's own — then **0 FAIL, 659 PASS** at `9212ecc4`, whose app code is the same (that push
  changed only the walk and the spec). Story 5.22 touches no save code: the autosave and the flushes are `EditorShell`'s
  effects, moved unchanged. Three stories and three builds now.

## Deferred from: Story 5.14's Dev run (2026-09-21)

### DW-221: FR-D16 leans on the owner's member-state pass at each category gate, and §4's gate has no such pass

plain: The requirement behind the new "View as" reminder says it makes your own check of each kind of visitor, at every
  category's sign-off, reliable. But the sign-off itself never asks you to look at a page as a signed-out visitor, a free
  member and a paid member, so the reminder is supporting a step that is not written down anywhere.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), closed on the owner's ruling **R-222** (2026-09-28, 5.24's Create, Question 13),
  and built: PRD §4's owner check takes the member-state pass — every members-aware design looked at as Logged out user,
  Free member and Paid member through View as (FR-D16) — and so does every category's owner-gate story in `epics.md`.
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

status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): step 36 asks the pill to sit on the section hovered when the scroll settles,
  read two frames later (`hoveredOnScreen()`), and the per-frame sampler skips — and counts — a frame whose hovered root
  changed, from the root hovered as sampling starts. Executed first: the spec's 1 px `mouse.move` after the 300 px wheel
  cannot cross a section on today's seed — the grid fills the reachable window, and even a 1066 px wheel left it under
  the pointer — so HEAD stayed green under it. The control that does cross: a wheel up to the top, then the pointer onto
  the sticky header, the grid's top 444 below the header's bottom 250 — HEAD FAILS the settled check (the pill on the
  header, measured against the grid) and the new walk PASSES it ("hovered root #0"). `[data-section-pill]{translate:40px
  0}`, off its section, stays red on both checks ("worst 30.0px"); the spec's `translate:0 40px` stays inside the tall
  grid and is no control. The sampler's skip is exercised ("1 skipped as the hover moved", PASS), but its old red was
  not reproduced: a pointer-driven re-hover re-places the pill in the same frame, so HEAD's sampler stayed green under
  it, and the one-frame lag behind the original 126 px came from a scroll-driven re-hover this harness cannot force.
  Reopen if the per-frame check fails on a real run.
severity: low
origin: Story 5.14's Dev run (2026-09-21), the deployed walk at `d4d6e266` — and Story 5.9's (2026-09-19), whose spec
  recorded the same failure ("intermittent, Story 5.4's") without a ledger row.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "whoever next touches the section pill or the walk (Story 5.22's
  responsive pass moves both). *(Story 5.22's Create, 2026-09-27: it adds walk steps 97–100 and re-expects step 14, but
  it touches neither step 36 nor the pill's placement at full width, so this stays with the next story that does.)*")*
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

status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): a picked preview subject waits in this tab's `sessionStorage`
  (`PENDING_KEY`, `readPending`, `writePending`, `clearPending` in `lib/preview-subject.ts`) from the press until its
  action answers; the hydrate lets a waiting pick win over the stored one and sends it again. Only an ANSWER clears it:
  the commonest thrown call is the very reload the pick waits for (executed: clearing on a throw lost the pick every
  time). Controls: `preview-subject.test.ts`'s helper cases; a journey on the harness Post canvas that holds the
  `next-action` POST, picks, reloads at once and reads the pick back on the pill — red at HEAD. The editor walk's step
  89 variant (every action held, an immediate reload) is at Review.
severity: low
origin: Story 5.14's code review (2026-09-21), the Real-infra verifier's second walk at `f313b1b0`.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "whoever next touches the editor's server-action writes.")*
location: `editor.tsx` `recordViewed` → `setViewedStates`, and the `setPreviewSubject` call
plain: If you pick a preview article and reload the page within a second or two, the old article can come back once.
  The choice is saved; it just arrives a moment late.
reason: Step 89 failed once in two completed walks with nothing else running on the machine: after choosing article B
  and waiting 1200ms, the reload read A, and the next check read the stored row as B. The cause is a HYPOTHESIS, not
  executed (standing rule 1): Next dispatches a client's server actions one at a time, and this story adds a stream of
  them (`setViewedStates`, on every canvas switch, visitor pick and edit) to the queue `setPreviewSubject` shares.

### DW-224: R-173's plain-link rule is document-wide, and a pack with no underline hides a link on a coloured ground

status: done 2026-10-03 (Story 6.1)
resolution: closed by Story 6.1's Dev (2026-10-03), the post-body half as R-229 ruled: the rule stays document-wide, `tokens.test.ts` refuses a link selector that scopes it out of a post (one naming `.gh-content`, or a `:not(…)` beyond the plain-link test), and `tools/probe/record-token-links.py` proved it on T1 (6.58.0) and T3 (5.130.6), MEASUREMENTS §68 — a probe theme carrying `reference-tokens.css`, read in Chromium in light and dark: the plain link on the page ground, on the contrast ground and in the post's body (read through Ghost's draft preview) each as the token block says, behind controls (this run's nonce, `--link-color` on `:root`, a classed link keeping its own colour, the plain link's colour moving with the token `<style>` disabled). Before it, Story 5.24c's Dev (2026-10-01) built its half: every `LINK_RULES` selector in `tokens.ts` is `:where(a:not([class]), a[class=""])`, so an anchor with `class=""` no longer escapes, and on a contrast, accent or image ground the rule sets `text-decoration-line: underline` — there the words take the ground's colour, so the underline is the link's only sign (WCAG 1.4.1), whatever `--link-decoration` a pack sets. `reference-tokens.css` regenerated (only the link rules moved); `tokens.test.ts` asserts both, red against HEAD's rules and red again with only the underline removed. No photograph moved: the matrix is green. The post-body half is Story 6.1's alone.
severity: medium
origin: Story 5.14's code review (2026-09-21), the Acceptance Auditor, the Blind Hunter and the Edge Case Hunter.
owner: Story 6.1 (The token engine — computed or authored, and nothing in between), whose card names this entry: it asks
  the owner whether R-173's rule reaches a post's body, and proves the answer on T1 and T3. *(Story 5.24c's Dev, 2026-10-01:
  its half built, see the resolution; was "Stories 5.24c (The sweep: …) and 6.1 (The token engine — …), whose cards name
  this entry: 5.24c builds the underline on a coloured ground and the empty `class`; 6.1 asks the owner whether the rule
  reaches a post's body, and proves the answer on T1 and T3"; Story 5.24c's Create, 2026-09-29: was "Story 5.24c …, one of
  the sweep's five stories (R-211)"; Story 5.24a's Dev, 2026-09-28: was "Epic 6 — the story that emits the token block into
  `default.hbs` and the one that builds the packs.")*
ruling (owner, 2026-10-03, Story 6.1's Create, Question 1, option 1): *"The same look everywhere"* — R-229. The rule stays
  document-wide, so a plain link in a post's body takes the pack's look; Story 6.1's Dev proves it on T1 and T3 and
  closes this entry.
note (Story 6.1's Dev, 2026-10-03): built as R-229 ruled, and the entry stays open for its proof. `LINK_RULES` stays
  document-wide, and `tokens.test.ts` now refuses a link selector that names `.gh-content` or carries a `:not(…)` beyond
  the plain-link test, so a later scoping cannot land unnoticed; `THEME_CSS` keeps its `a{}` rule. The proof is
  `tools/probe/record-token-links.py` — a probe theme carrying `reference-tokens.css`, gated 0 errors on both majors,
  read in Chromium in light and dark, the post's body included — exercised OFFLINE against a local page built from
  Ghost's own recorded article (every control and row held, and the controls refused a wrong nonce and a page with no
  token block). Run on T1 and T3 on the owner's in-session go (2026-10-03), in the main session: every row held on
  both majors and MEASUREMENTS §68 is written — the entry is closed, see the resolution.
note (Story 5.24c's Create, 2026-09-29): split, not dropped. The underline and `class=""` halves are built by 5.24c,
  with controls. The post-body half is a behaviour decision: R-173 (`reconcile-designs-decisions.md:3678`) covers "a link
  typed into a section's text" and says nothing about `{{content}}`, and the post-body frame (`C Post Body.dc.html`)
  draws no inline link look. It becomes observable only once a theme ships the token block, which is Story 6.1, so the
  question is asked there. When 5.24c's half lands, this entry stays open, owned by Story 6.1 alone.
location: `packages/section-runtime/src/tokens.ts` `LINK_RULES` · `reference-tokens.css`
plain: Nothing is wrong today. When Style Packs arrive, a pack that turns link underlines off would make a link typed
  on a dark, accent or photo band look like ordinary text; and the rule will also restyle links inside a post's body.
reason: On contrast, accent and image grounds the words take `color: inherit`, so the underline is the link's only
  sign (WCAG 1.4.1); no rule forces it there and no test covers `--link-decoration: none`. `:where(a:not([class]))` is
  unscoped, so once the block is in a theme it reaches `{{content}}` — reasoned from the selector, not executed against
  a theme. An anchor with `class=""` also escapes it.

### DW-225: two tabs of one project each write their own whole "looked at" record

status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): only the lock's holder records what was looked at — `recordViewed` queues a
  write, inside the `viewedWrites` chain, only while this tab holds the lock, so a window reading along records nothing.
  Control: a journey stop with two pages in one context — the reader changes View as and sends no action carrying
  "states", the holder sends one — red at HEAD (the reader recorded one).
severity: low
origin: Story 5.14's code review (2026-09-21), the Edge Case Hunter.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "whoever builds Story 7.18's Pre-flight, which is the record's first reader that
  matters.")*
location: `editor.tsx` `recordViewed`
plain: With the same project open in two tabs, looking at a page in the second tab can bring back "viewed" marks that an
  edit in the first tab had just cleared. One tab is unaffected.
reason: Each tab merges into its own copy of the record and writes whole arrays; an edit made in the other tab never
  invalidates this one's copy. The fix is an array-union RPC or a re-read on the save path's "another session wrote".

## Deferred from: Story 5.15's Dev (2026-09-22) — behaviours held still while designing, and Preview

### DW-226: a module that moves by itself and declares a width is chipped PAUSED at every width

plain: When a header that shrinks as you scroll only does so on phones, the editor will still show its PAUSED tag when
  you point at it on the desktop view, where it would not move even on your live site.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `movesByItself(declaration, width)` (`lib/behaviours.ts`) is false where a
  width is declared and the device is at least that wide — core's own `(width < Npx)` — and the chips pass
  `device.width`, now in the memo's dependencies. Controls: `behaviours.test.ts` rewritten, red at HEAD (the width
  ignored); and the journey's own DW-229 · DW-226 stop, beside R-175's rather than inside it — the fixture ring's
  `marquee` declared to run only below 768 draws no chip at Desktop and one at Mobile.
severity: low
origin: Story 5.15's Dev (2026-09-22) — spec Design Notes, "Known ceilings"
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "the first category story that puts a width-declared module that moves by itself
  on the canvas (R-38's `header-scroll:768` is the likely one)")*
location: apps/web/lib/behaviours.ts `movesByItself` · editor.tsx's chips
reason: the chip is drawn for every mount `core` held still whose module `movesByItself`, and `core`'s editing rule
  skips a mount before it reads the declaration's width (`core.js:43-47`), so a held-still mount declared
  `header-scroll:768` is chipped at 1440, where Preview would not run it either. No pilot declares a width, so nothing
  shows it today; the fix is to ask the width's own `(width < Npx)` query before drawing the chip.

### DW-227: an autoplaying carousel carries no PAUSED chip

plain: A carousel that turns its slides by itself on your live site will hold still while you design, like every
  carousel, but it will not show the PAUSED tag that tells you it moves.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28) — no design offers a carousel autoplay: swept across the export, every carousel
  refuses it (A14's and A19 #15's refusals owner-ratified), and the only Interval row any spec draws is A2's rotating
  bar. The validator holds it: `packages/library/src/validate.ts` refuses a design whose markup declares `carousel` with
  an autoplay or interval control (`carousel-autoplay`); its `validate.test.ts` case refuses both and passes an interval
  on a design with no carousel, and fails with the refusal removed. `docs/section-authoring.md` and R-175's dated note
  in the register say so.
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
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `stampControls` keeps a root `data-i18n-*` — safe, because `refuseCatalogMisuse` refuses an authored one and `FOREIGN_ATTR_RE` a control named `i18n-*`, so the only such attribute on a root is S5's own stamp. Control (`agreement.test.ts`, the S5 root-mount case re-stamped through `stampControls`): `data-i18n-ended` stays `'Vorbei'`; HEAD gave `null`.
severity: medium
origin: Story 5.15's Dev (2026-09-22), read in the source (`packages/section-runtime/src/core.ts:1227-1229`)
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "the first design whose root element is
  itself a module mount with strings (S5's `data-i18n-*`)")*
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
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): while the selected root carries a PAUSED chip, the Controls panel holds an
  sr-only line in 5.24a's words, `PAUSED_SAID` (`lib/preview.ts`): "PAUSED — this part moves by itself on your site; it
  holds still while you design, and Preview runs it". Control: the journey — the list's held part is said once and the
  Rail's is not — red at HEAD on 'said once' after the chip's control passed. The first real part is Story 9.1's
  `header-scroll`.
severity: low
origin: Story 5.15's Review (2026-09-22) — Blind Hunter
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "the first category story whose design declares a module that is held still and
  moves by itself (research §2.1 lists `header-scroll` for A1-1 onward, so likely Story 9.1)")*
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
status: done 2026-09-24 (Story 5.18)
resolution: Story 5.18 (2026-09-24) — THE ONE ASSEMBLY decides every page's address: `orbitWeekly.assemble(target,
  pieces)`, which `templateContext` returns and the connected site's rows go through, hands Post and Page their
  subject's OWN address (the path of the row's `url` — the bundled fixture's `/the-four-hundred-domains-that-refuse-to-move/`,
  a live post's `/post-slug/`) and the 404 `MISSED_ADDRESS`, a path no menu item names, where it used to hand all three
  `/`. `paint()` already hands that address to every section, the header included, so `{{navigation}}` marks nothing on
  those canvases, as Ghost marks nothing there (`utils.js:61`, an exact match only). `orbit-weekly.test.ts` gained
  DW-230's rows — each canvas's address, and no menu item marked, with `/` marking the bundled Home item as the control
  — and the fixture post's own path is in no navigation item, so no snapshot moved (`check-snapshots` PASS, unchanged).
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
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the first design that styles `.nav-current-parent`
  (A1's category story, Epic 9)")*
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
owner: Story 10.112 (A34 — the content model, the stylesheet and designs #2, #3, #4 and #9), whose criteria already carry it with
  its id: the owner rules which [Free] design an untouched template's pager is before it is built — A34's [Free] pair is
  now his #2 and #9 (R-212). *(Story 5.24a's Dev, 2026-09-28: was "Story 10.112 (A34's first story, which builds the
  Pagination style control — R-195), with the owner: which Free design an untouched template's pager is. *(Was Story
  5.19's until R-195, 2026-09-25.)*")*
location: `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/sections-inventory.md` §3–§4 · `prd.md:1168`
reason: a documents disagreement with no code behind it yet — `SYNTHESIS_DEFAULTS` carries no pagination value
  (`synthesize.ts`'s FEED row says why) and no A34 design is authored. Choosing one is the owner's (R-17 chose the Free
  pair), so it waits for the story that builds the control.
note (Story 5.19's Create, 2026-09-25): no pagination design exists, so Story 5.19 cannot choose one; its Question 1
  proposes (RECOMMENDED) that the Pagination row — and with it this question for the owner — moves to Story 10.112,
  the first A34 story. Awaiting the owner.
note (R-195, 2026-09-25): ruled option 1 — the row moved to Story 10.112, whose criteria now name this question as one
  the owner rules before it is built.

### DW-233: the four Pagination style lists disagree

plain: The pagination choices are listed four different ways in the plans and drawings, so the control Story 5.19
  builds has no single list to show. Nothing on screen offers it yet.
status: open
severity: medium
origin: Story 5.16's Create (2026-09-22), read in the documents: FR-H2 (`prd.md:312`) and Story 5.19's card offer
  **Numbered / Load More / Infinite scroll**; D5c and D5d (`D5 Canvas Markers and Template Switcher.dc.html:350, :428`)
  draw **None / Older/Newer / Numbers**; A34's roster is ten designs (Numbers, Prev and Next, Bar, Pill, Counter, …);
  and `sections-inventory.md`'s A34 entry speaks of Numbered, Load More and Infinite as design families.
owner: Story 10.112 (A34 — the content model, the stylesheet and designs #2, #3, #4 and #9), whose criteria already carry it with
  its id: the owner rules which list names the select's values before it is built. *(Story 5.24a's Dev, 2026-09-28: was
  "Story 10.112 (A34's first story, which builds the Pagination style control — R-195), which must pick one vocabulary
  before it draws the row above D5d's Preview page row. *(Was Story 5.19's until R-195, 2026-09-25.)*")*
location: `prd.md` FR-H2 · `epics.md` Story 5.19 · `sections-inventory.md` A34 · the D5c/D5d frames (never edited, R-74)
reason: Story 5.16 builds only the Preview page row under that control and draws no Pagination row, so it settles
  none of the four; recording them here keeps Story 5.19 from inheriting a silent choice.
note (Story 5.19's Create, 2026-09-25): a fifth list was found — A17's own panel (`A17 Post Grids - Spec.md:316`,
  `A17-1 Three Up.dc.html:146`) draws Numbered · Newer and older · Load more · None — and A34's reconciliation makes
  the TEN DESIGNS the select's values (`A34 Pagination Styles - Spec.md:976-979`). Story 5.19's Question 1 proposes
  (RECOMMENDED) that the row, and this choice, move to Story 10.112. Awaiting the owner.
note (R-195, 2026-09-25): ruled option 1 — the row and this choice moved to Story 10.112, whose criteria now name it.

## Deferred from: code review of spec-5-16-previewing-page-2 (2026-09-22)

### DW-234: a page 2 that deletes its own main feed compiles with no list of posts

plain: On page 2 you may delete anything, the post grid included (R-177). Page 1 that loses its grid still lists posts
  on `/page/2/` through R-127's fallback; a page 2 of its own that loses its grid has no fallback, so the compiled
  `/page/2/` (and every later page) would show no posts. Nothing compiles yet, so nothing is broken today. And once
  page 2's own design has no main feed, the Preview page row is gone from page 2's panel: the pill is the one way back.
status: done 2026-10-06 (Story 7.3)
resolution: Story 7.3's Dev (2026-10-06) — a page 2 of its own compiles as designed: `index.hbs` is
  `pageTwoStack('home.hbs', home, pageTwo['home.hbs'])` (`compileTheme`), so Home's own page 2 with no feed ships
  exactly what the canvas shows, and `default.hbs`'s `noindex` guard lists `index` for it, so its `/page/N/` is not
  indexed (FR-H2, as corrected: Home's page 2 of its own with no feed is guarded, R-178, R-179). An archive's page 2
  compiles inside `{{#is "paged"}}` and is guarded the same way (DW-253). `compile.test.ts` holds both.
severity: medium
origin: Story 5.16's review (2026-09-22), the Blind Hunter over `pageTwoStack` rule 1 (`synthesize.ts`): a stored page
  2 is returned as it is, whatever it holds, and FR-I1's "never emitted empty" reasons about page 1 only.
owner: Story 7.3 (Synthesis Defaults and the emptying rules), whose criteria carry its requirement word for word with
  its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.3 (the compiler decides — refuse, fall back to the
  Synthesis Default stack, or compile as designed) with Story 5.19 (the main-feed designation's lifecycle, which may
  forbid deleting the feed on page 2 as it does elsewhere).")*
location: `packages/section-runtime/src/synthesize.ts` `pageTwoStack` · `apps/web/lib/page-two.ts` `mainFeedOn` ·
  `epics.md` Story 7.3 and 5.19

### DW-235: the sync route validates a template key's name, never the doc stored under it

plain: The save route checks that a key is one of the allowed names and that the doc parses, but not that every design
  in the doc may sit on that key's file. A bad doc saved under `index` (or any key) is caught on the next load, where
  the whole editor refuses to open, rather than at the save.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `docRefusal(key, doc, held)` beside `pilot()` (`lib/pilots.ts`) holds
  `read.ts`'s sentences, the surface's one-design rule included; `read.ts` throws with it and the sync route asks it for
  every key before the lock read and the RPC, a 422 in its own words. The route now reads the library off disk, so
  `tools/check-traces.mjs` holds its trace (`projects/[id]/sync`, needing the designs): a lost trace would refuse every
  save. Controls: `pilots.test.ts` (`home` with a24/1 → 'never home.hbs', `post` → null, an unknown design, a second
  paywall design); `editor.test.ts`'s route-order row, red at HEAD. The editor walk's step 66c posts `{home: a24}` → 422
  at Review, against the deployed fix only.
severity: low
origin: Story 5.16's review (2026-09-22). Pre-existing for every key — `read.ts` has always been the one place the
  `compileTarget` check runs — and this story added three keys to the same pattern.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Epic 7's compile path, or the first story that makes the route validate
  placement (a `compilesTo` check against `fileOf(key)` at the write).")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/sync/route.ts` `TEMPLATE_KEY` · `read.ts` `editorData`


## Deferred from: spec-5-16a-the-page-number-token.md (2026-09-23)

### DW-236: the deployed editor walk can die mid-run in the screencast decoder, on a frame it cannot decode

plain: The long automated walk of the editor on the live site sometimes stops halfway with "the source image cannot be
  decoded", part-way through the checks that film the canvas scrolling. Nothing a customer would see is known to be
  wrong — the same walk, re-run on the same build, passed every check — but the run is lost and has to be started again
  from the beginning, which takes about ten minutes.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): one bad frame no longer ends the walk. Both decoders — `drift` and the
  sticky film's — catch `img.decode()`'s refusal, skip the frame and count it in the check's detail; the floors stay (at
  least five frames measured), so a broken film is never a pass. Executed first: a frame cut short is NOT a decode
  failure — Chromium decodes a PNG truncated anywhere past its header (half, a tenth, 64 characters: each 1440×900), the
  lost rows measuring nothing — so the spec's "truncated" control could not go red, and the control spoils the header
  instead, which `decode()` refuses with this entry's own `EncodingError`. Controls (LOCAL RUNs against production): one
  frame of 60 undecodable gives "59 frames · 1 skipped", PASS; one of the sticky film's 58 gives "57 frames · 1
  skipped", PASS; every one of 61 gives "0 frames · 61 skipped" and the floor FAILS; HEAD's walk with one frame
  undecodable dies, `HARNESS ERROR page.evaluate: EncodingError: The source image cannot be decoded.` — this entry's
  line. The bad frame's own cause is still unknown.
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
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "whoever next touches `film()` or the scroll-filming checks (Story
  5.22's responsive pass reaches them). *(Story 5.22's Create, 2026-09-27: it touches neither `film()` nor step 15, so
  the trigger stands.)*")*
location: `tools/probe/run-verify-editor.cjs` step 15's `decoder.evaluate` (`:949`) and `film()`


## Deferred from: code review of spec-5-16a-the-page-number-token.md (2026-09-23)

### DW-237: the probe recorders leave every uploaded probe theme on T1 and T3

plain: Each time one of the recording probes runs, it uploads a small throwaway theme to the two test Ghost sites, uses
  it, and puts the site's real theme back — but never deletes the throwaway one. Nothing a customer sees is affected;
  the test sites just collect old probe themes in their theme list, one or two per run.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): every T1/T3 uploader ends in `restore_and_delete` (DW-147) and refuses to start on a probe theme; the leftovers Question 1 approved were deleted, each DELETE answered 204 and the list read back — T1 `inflozo-probe-13`, `-all`, `-contexts`, `-root`; T3 the same four, `inflozo-probe-plain` and `theme` — and the two recorder runs after them left no `inflozo-probe-*` theme on either site (read back: T1 `casper`, `racer`, `source`; T3 `casper`, `source`; MEASUREMENTS §59).
severity: low
origin: Story 5.16a's review (2026-09-23), reading `tools/probe/record-page-number.py`. Pre-existing: it follows
  `record-contexts.py`'s pattern exactly, and that recorder never deleted its upload either.
reason: Deleting is one more Admin API call in the `finally`, after the restore is proved — but it belongs in the shared
  pattern for every recorder, not in one story's probe, and the reset protocol should say so.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "whoever next touches a `record-*.py` probe
  or `tools/probe/RESET-PROTOCOL.md`.")*
location: `tools/probe/record-page-number.py` `record()`'s `finally` · `tools/probe/record-contexts.py` `record()`'s `finally`
note (Story 5.24c's Dev, 2026-10-01): built and offline-proved with DW-147 — every T1/T3 uploader (`record-shim.py`, `run-verify-core.py`, `record-contexts.py`, `record-page-number.py`, `run-verify-13.py`, `run-verify-all.py`, `run-verify-47.py`, `run-verify-e2.py`, `run-verify-comment-count.py`) ends in `restore_and_delete` inside its `finally` and refuses to start on a probe theme (`start_guard`); `run-verify-ghostpro.py` is the named exception; `RESET-PROTOCOL.md` § Ghost says so. Closed by the deletions above.

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
owner: Story 7.18 (The deploy wizard), whose criteria carry its requirement word for word with its id (R-195). *(Story
  5.24a's Dev, 2026-09-28: was "Story 7.18 (the deploy wizard) for Ship it, Story 7.26 (theme zip export) for Export.
  Each renders `lock-takeover.tsx` with D8g's strings and refuses to start without the lock (AD-15's flush contract).")*
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
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): a going tab LEAVES rather than releases. `leave` (`lock/route.ts`) backdates
  the row's beat to `now − STALE_MS + LEAVE_GRACE_MS` (`lib/lock.ts`, 10 s: three times the measured reload gap, under
  the heartbeat and the nudge), filtered on the project, the session and the beat this tab last heard (`LockRow.beat`).
  A reload's first beat lands inside the grace and keeps the lock; a late leave carrying the old beat matches nothing; a
  closed tab is stale after the grace for the next opener. With no beat heard it releases, as before, and Hand over
  keeps `release`. No migration: `heartbeat_at` is in `authenticated`'s UPDATE grant and the guards fire only on a
  rewound generation or a changed holder. Executed (MEASUREMENTS §65): in `postgres:17` with the prelude, every
  migration and the RLS gate's fixture, as the owner — HEAD's late release deleted 1 row where the late leave changed 0,
  and a timely leave changed 1 with holder and generation unchanged. Controls: `lock.test.ts`'s grace case (live until
  it ends, stale after); the lock walk's two new last stops — a reload with the other session reading inside its gap,
  and a leave held until the reloaded page had beaten — red, each after its control passed, in LOCAL RUNs on production
  while it served `3c88798f` (the reload left the lock to the other session; the late release deleted the row), and
  green, with every other row of the walk, against a local build of this tree on the same Supabase (MEASUREMENTS §65).
  That build also showed a reload's first beat writing 0 over the row's count before this device's journal was read —
  the walk's two reload rows failed on it — so a beat now carries no count until the journal is read (`countPatch`, its
  `lock.test.ts` case), and those rows pass since. The deployed walk is at Review.
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
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "unowned; the review of Story 5.17 may take it, and (c)
  would be a Schema phase of its own (R-99).")*")*
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
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): losing the lock closes what edits — one effect on `lock.holder`:
  `closeMenus()`, every open `[data-editor] dialog` but the shortcuts sheet (Site Remix, the Reset box, Clear dark
  overrides, Rename, the site-wide Hide confirm, the Section Picker), and an inline field being typed in. It covers
  `land()`'s flip, Hand over and the 423 path; what only views stays live (R-192). Control: a journey stop that opens
  ⌘K, a Layers ⋯, ⇧R and an inline field being typed in, then posts `took-over` on the lock's channel — the bar is up,
  no popover, no dialog and no field left being typed in, and the device switcher still live and not greyed — red at
  HEAD (the picker left open), and its inline arm red with the field's end removed from the effect.
severity: low
origin: Story 5.17's review (2026-09-24). R-192 disables the triggers (the ⋯ button, + Add section, Site Remix) for a
  reader, and the Reset box is closed on the holder→reader flip; a menu or box that was ALREADY open is not.
reason: the guard underneath is `commit()`'s one early return, so nothing is written; only the surface is stale. Closing
  every open popover on the flip is one call to `closeMenus` plus the two dialogs, and it belongs beside the Reset
  box's own close — a Fix-phase item if the owner meets it, never a data risk.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — `land()`'s holder→reader flip;
  `lib/menu.ts`'s `closeMenus`

### DW-242: a holder's own reload paints its controls greyed for the server's first frame

plain: Reloading the window that is editing no longer shows the grey "reading along" bar for an instant (Story 5.17
  fixed that) — but for the same instant, about a tenth of a second, the settings panel's fields can look greyed out
  before the page recognises itself. Nothing is disabled once it has; it is a flicker in the panel, not the bar.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): already fixed by Story 5.22's gate — the shell mounts in the browser alone
  and recognises itself in a layout effect, before its first paint — so the self mark was dead code and goes:
  `SELF_MARK` and `selfMarkScript` (`lib/lock.ts`), `E/layout.tsx`'s script, `globals.css`'s rules, the root layout's
  `suppressHydrationWarning` and their tests. Control: a journey stop with a rAF sampler — a holder's own reload paints
  no frame greyed, a genuine reader is greyed from its first — red with the layout effect planted as `useEffect`,
  reverted.
severity: low
origin: Story 5.17's review (2026-09-24). `selfMarkScript` marks `<html>` before the first paint and `globals.css`
  hides the bar and restores the panel's opacity under the mark, but the server also renders R-192's
  `<fieldset disabled>` for that frame, and a stylesheet cannot un-disable a fieldset. The walk's 100 ms sampler
  watches the bar only.
reason: closing it means the server not drawing `ReadOnly` at all for a tab it cannot identify — deciding the fieldset
  client-side after hydration — which reintroduces the one-frame editable shell for a GENUINE reader that `read.ts`'s
  first-paint read exists to prevent. The trade is the owner's to see first (R-80); none of his tests reported it.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/layout.tsx` (the mark) · `apps/web/app/globals.css`
  (the two rules under `html[data-lock-self]`) · `apps/web/components/kit/greyed.ts` (`ReadOnly`)

### DW-243: three sessions of one account asking at once — the second request silently replaces the first

plain: If you open the same project on three devices and two of them press Request editing within the same half
  minute, the first one to ask is told "Your other session kept editing" although nobody answered it — its request
  was simply overwritten by the second one. Two sessions, the case built and tested, are unaffected.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `askedNow(row, askedOf)` (`lib/lock.ts`) replaces `stillAsking` with three
  answers — ended (no row, or the holder or generation moved), kept (the request columns cleared) and waiting (anything
  else, a request REPLACED by a third device's included) — so a replaced request keeps "Asking…" and hears the holder's
  one answer; no column. Control: `lock.test.ts`'s replaced, taken-over and holder-reload cases, two of them red under
  HEAD's logic (a replaced request and a take-over each read as "kept"); and its two cases of one move alone — the
  holder moved at the same generation, the generation moved under the same holder — each red with the rule's `||`
  planted as `&&`.
severity: low
origin: Story 5.17's review (2026-09-24). `edit_locks` carries ONE `nudge_requested_by`; `stillAsking` answers false
  both when the holder cleared it and when another session's nudge replaced it, and `land()` announces `kept` for
  either.
reason: telling the two apart needs either a second column (a migration, R-99) or the route refusing a nudge over a
  live one, which would make the second device's button silently fail instead. The owner's ruling on transport (R-191)
  already accepts that a third device is not v1's shape; recorded so the choice is made rather than met.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/lib/lock.ts` (`stillAsking`) · `editor.tsx` (`land()`'s `kept` announcement, commented) ·
  `lock/route.ts` (`nudge`)

### DW-244: the tab-close flush and the lock release leave on the same event, and a third session can slip between them

plain: When you close a tab that is editing, it does two things on the way out: sends its last edits, and gives up
  the right to edit. They are sent together and the browser does not promise which lands first. If your OTHER window
  checks in during that instant and takes the right to edit, the closing tab's last edits are refused. It needs three
  things to line up inside about a second, and your other window then holds exactly what the cloud held.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), with DW-240: the release no longer frees the row under the tab-close flush —
  the going tab's `leave` backdates its beat, so the row stays its own for `LEAVE_GRACE_MS` and a flush landing in that
  time passes `heldElsewhere`. A leave only ever moves the beat back (`leaveBacks`), on a beat of timestamptz's own
  shape (`leaveBeat`, so a malformed one answers 400, never Postgres's 502), and a tab whose id is not kept in
  `sessionStorage` releases instead — its reload gets a new id, so a grace would only hold the lock against it. A
  session that does not hold the lock polls once more at a live row's staleness edge (`edgePoll`: when `STALE_MS −
  ageMs` is under a heartbeat, at that moment plus 250 ms), so a closed tab is free at the grace's edge rather than a
  heartbeat later. Controls, each seen red on its plant: `lock.test.ts`'s `edgePoll`, `leaveBeat` and `leaveBacks`
  cases, `LEAVE_GRACE_MS` pinned, and a read of the route's leave (filtered on the heard beat, guarded by `leaveBacks`);
  the journey's edge-poll stop — a live row five seconds from stale is asked about again 5.25 s later — red with the
  scheduling removed; and the lock walk's DW-244 stop, which now ORDERS the race: the flush held, the going page's own
  `pagehide` leave sent and answered 200, and the row read as left — gone, or the going tab's and aged into the grace —
  before the other session reads the lock, else "control not met" and no pass. As a LOCAL RUN on production at
  `3c88798f` it is red: HEAD's release (200) deleted the row, the other session's read took the lock, and the flush
  answered 423. Against a local build of this tree it is green: the leave aged the row to 52 s, the flush answered 200,
  the edit is in the cloud, and the other session took the lock at the grace's edge (MEASUREMENTS §65). The hide and the
  pagehide are dispatched in the page: a request sent by a document already unloading was not met by Playwright's route
  in two runs. The deployed walk is at Review. Its ceiling, kept for v1 by the owner (R-228) and named beside `leaving`
  in `editor.tsx`: a beat still in flight as a tab goes moves the row past the beat its leave carries, so that close
  goes stale as a crashed tab's does (~60 s, the matrix's own error row); a reload is unaffected. The upgrade is a
  per-page token on the row — a column, so a migration: DW-307 (Story 7.18).
severity: low
origin: Story 5.17's review (2026-09-24). `visibilitychange` (the unload flush, Story 5.8) fires before `pagehide` (the
  release), both ride `keepalive`, and nothing orders their landing. A release that lands first frees the lock; the
  flush then passes `heldElsewhere` only if nobody acquired in between.
reason: the same shape as DW-240 (a reload's gap), with the same candidate fixes and the same costs; holding the release
  until the flush answers is not possible on a page that is going. It joins DW-240 rather than a fix of its own.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned; whoever takes DW-240")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` — the two `leaving` listeners

### DW-245: `record-edit-lock.py` folds a probe bug into "RUN VOID" and its cleanup can reference an unbound name

plain: The script that proved the lock's four database facts reports "the run was void" for two different reasons — a
  real control failing, and the script itself hitting a shape it did not expect — and if it fails before it has
  signed in, its cleanup line names a variable that was never set. It ran clean on 2026-09-23; this only matters on a
  re-run that fails.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `record-edit-lock.py`'s `fixture()` deletes the account it made if anything after it
  fails, then re-raises; `Void`, `SubprocessError` and `OSError` stay RUN VOID (exit 1) and anything else is PROBE ERROR
  with its traceback (exit 2); an offline `--self-check` (handled before the help branch, in `pnpm test`) asserts a
  failed project POST and a `KeyError` each send the user's DELETE, a fixture that is built sends none, and the
  classifier's two exits — HEAD's `fixture()` failed it (no DELETE), and `KeyError` folded back into RUN VOID failed it.
  RLS-TEST's F4 seeds both halves RELATIVE (`g = lock_generation + 1`, the CAS g → g + 1, asserting g + 1), copied to
  `supabase/tests/rls.sql`: `lock_generation = 40` planted before F4 was red at HEAD (`monotonic (40 -> 10)` before its
  second half, `40 -> 5` before its first) and green relative; the clean gate exits 0. Never run live (it writes to
  production).
severity: low
origin: Story 5.17's review (2026-09-24), in the Blind Hunter layer.
reason: tooling, not product; the fix is two `except` clauses and `sb = None` above the `try`. Also the F4 block in
  `RLS-TEST.sql` seeds `lock_generation = 10` as an absolute, which passes today because the block before leaves it at
  6 — a future block that pushes past 10 would fail on the monotonic guard rather than on what it tests; seed relative.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `tools/probe/record-edit-lock.py` (the top-level `except` and `finally`) ·
  `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/RLS-TEST.sql` (F4's seed), then `cp`

### DW-246: the keyboard gate goes red when Google Fonts hiccups at compile time, and a red `check` publishes nothing

plain: The automatic checks that run on every push include a keyboard walk that starts the app the way a developer
  does. Starting it fetches the site's three typefaces from Google's font service, and when that service answers
  oddly for a minute the walk cannot start and the whole push is marked red — nothing is published — although the code
  is fine. Pushing again fixes it. It happened once on 2026-09-24 and cost one deploy.
status: done 2026-10-01 (Story 5.24d)
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
evidence (Story 5.20's Dev, 2026-09-26): it reaches the DEPLOY job too, not only the keyboard walk. At `4d513f5d` CI's
  `check` and `rls` were green, and `deploy` failed in `vercel build --prod` with the same Turbopack error on
  `app/layout.tsx`'s Inter (21 of them, one per font file), so nothing was published. The control is the commit before
  it, `3a64da0b`: the same app tree, built and deployed 15 minutes earlier (`dpl_AS4xd9YGvHKLNX56FiaN8ud2B8EN` READY).
  `4d513f5d` changed one walk script under `tools/probe/`, which no build reads. So `self-hosting under next/font/local`
  above is the cure for both halves, and a re-push is still the workaround.
evidence (Story 5.22's Dev, 2026-09-27): a third place it lands — `check`'s own `pnpm build` step. At `c34dfbd3` (CI run
  36295360427) `pnpm keyboard` and `pnpm check` were green and `pnpm build` failed with the same "Can't resolve
  '@vercel/turbopack-next/internal/font/google/font'" Turbopack error, so `deploy` was skipped. `c34dfbd3` changed only
  the spec and this ledger; the same app tree built and deployed from `9212ecc4` an hour earlier
  (`dpl_2KBTPyRQXjqA3jL5CCND6o61EzYB` READY), and a local `pnpm build` of it exits 0.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/app/layout.tsx` (the three `next/font/google` calls) · `tools/keyboard/run-keyboard-gate.sh` ·
  `.github/workflows/ci.yml`'s `deploy` (its `vercel build`)
resolution: Story 5.24d's Dev (2026-10-01): the three faces are the app's own, so no build fetches anything from Google.
  The files: `apps/web/app/fonts/` holds the 16 files Google serves for today's options (fetched with next's own
  User-Agent, each equal by sha256 to HEAD's build output) beside the three OFL licences; `fonts.css` is Google's rules
  word for word with local addresses, next/font's three `… Fallback` faces copied from HEAD's built CSS and the three
  variables on `:root`; `layout.tsx` drops next/font and preloads the three latin files. `tokens.test.ts` holds
  fonts.css (every variable the theme reads declared, every file there) and refuses a next/font import — three controls
  red. The built CSS's 39 `@font-face` rules equal HEAD's by descriptors and file hash, in order; seven screens (home
  and sign-in at 1440 and 390, the harness editor at 1440 and 390, an editor hover) byte-identical between production
  harness builds of HEAD and the fix (one re-run: HEAD's own editor-1440 varied 13 pixels between its runs, the fix's
  did not), and red on five with Inter's 600 rewritten as 500; `pnpm build` inside `unshare -rn` fails at HEAD on three
  fonts.googleapis.com requests and passes fixed (the main session's re-run: exit 0, `curl` from inside the namespace
  answering nothing). THE DEPLOYED PAIR: Projects on app.inflozo.com, a throwaway account at 1440 and 390, photographed
  before the push and after the Dev push `5f78f6d8` deployed (`dpl_BauVQ66Tsn618CDBcQeyfLnw4Krs`, whose `/sign-in`
  preloads `/_next/static/media/{bricolage-grotesque,inter,jetbrains-mono}-latin.*.woff2` and whose `<html>` carries
  no next/font class) — byte-identical at both widths. CI on that push (run 36872679951): `check` — `pnpm keyboard`,
  `pnpm check`, `pnpm build`, `check-traces` — `rls` and `deploy` all green.

### DW-247: a section that prints your member count would stop drawing while the editor shows your own site

plain: When the editor shows your own site, a section that prints how many members you have — none does yet — would
  fail to draw, because Ghost does not give that number out to the public reader Inflozo uses for your posts. It has
  to be read with your admin key and kept with the site's other stored settings first.
status: open
severity: low
origin: Story 5.18's Create (2026-09-24). `packages/ghost-shim/src/index.ts:596-604` refuses `{{total_members}}` and
  `{{total_paid_members}}` on a site whose counts were not handed in ("a linked site whose count did not arrive must
  not show the sample as if it were real"); FR-H5 wants "the real rounded string on a linked one"; the Content API
  carries no member counts, and AD-10 keeps 5.18's reads on the Content API.
reason: no design in `packages/library/designs/` binds either helper, so the refusal is dormant. The count is an Admin
  read, which belongs in the `site_settings` snapshot Epic 3 refreshes daily (FR-C5), not in a browser read.
owner: Story 10.5 (A4 — designs #2, #16 and #18 (owner gate)), whose criteria carry its half word for word with its id —
  R-212's trade moved A4 #2 Flush Left from A4's first story (10.1) to this one, and #2's Value source moved with it; DW-180's half
  of the triage's sentence stays in 10.1. *(Story 5.24a's Dev, 2026-09-28: was "the first design that binds either
  helper (A4 #2's proof value source, `A4 Heroes - Spec.md:81`, or an A22 design), together with Epic 3's snapshot
  writer.")*
location: `packages/ghost-shim/src/index.ts:596-604` · `apps/web/lib/probe-rule.ts` (the snapshot's shape) ·
  `apps/web/lib/live-content.ts` (the live context, Story 5.18)

### DW-248: on a site with more than 100 posts, the link box and the post list cannot find an older post by typing

plain: When the editor shows your own site, the link box and the post list in the pill search your newest 100 posts,
  and up to 100 pages, tags and writers. On a site with more posts than that, typing will not find an older one —
  you can still paste its address into the link box.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): while the posts list D5e, the Link Picker and the Data group search is
  capped, the editor sends ONE title search at Ghost, `SEARCH_DEBOUNCE_MS` after the last keystroke.
  `searchRead('posts', term)` builds `filter=title:~'<term>'`: the trimmed term of 2–100 characters, each `'` and `"`
  given a backslash — the one form nql-lang's STRING token (`['](\\['"]|[^'"])+?[']`, 0.6.3 and 0.7.0) reads whole. It
  always sends `order=published_at desc` and `limit=15`, so Ghost 5's `slugFilterOrder` never lifts a term's `slug:[…]`
  into raw SQL. Each term is its own 60 s key. Searches have `SEARCH_SHARE`, a fifth of the ceiling, to themselves
  (`ask`): the share counts searches left to SEND, and the last one's answer is kept (`searchFor`). Past it the boxes
  search the rows in hand under the capped line, which stands aside only while a search is coming or has come — never
  after one failed or after reading stopped (`searchInForce`). Found rows join the list by id (`withFound`). Posts only:
  D5e's box reports its term on a Post canvas alone, so a page, a tag or a writer typed on a capped site spends nothing.
  Executed (MEASUREMENTS §62): 27 terms parsed by both pinned nql-langs, the controls (an unescaped quote, the empty
  term) red; on T1 and T3 the escaped hostile term answered 200, and an upper-cased title word found its post. Controls
  in `live-content.test.ts`, seen red against the unchanged library: the escapes, the explicit order, the bounds, the
  share and the merge; `searchFor` and `searchInForce`'s cases, red with the first rules (the share's last answer
  dropped; the line hidden after a failed search); and a journey stop on a capped site answered in the page — a term
  typed in the pill is one `title:~` read on the Post canvas and none on the Tag canvas — red with D5e's box reporting
  on every canvas. The live walk's simulated capped search is at Review.
severity: low
origin: Story 5.18's Create (2026-09-24), a deliberate limit of the client-side search Stories 5.3 and 5.13 built.
reason: asking Ghost to search (`filter=title:~'…'`) would find any post, but every answer Ghost gives with a status
  of 400 or more — a search term Ghost cannot parse — counts against the customer's own network in Ghost's brute
  limiter: 99 failures, then at least an hour of 429 for every key from that network, the customer's own site search
  included (read in source on both majors, Story 5.18's Code Map). A server search needs a term grammar that cannot
  fail and its own share of the session's request ceiling; Ghost 6 also caps a page at 100 (MEASUREMENTS §15d).
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — the first customer site with more than 100 posts, or the story that
  re-validates internal links against the connected site at compile (FR-F6).")*
location: `apps/web/lib/live-content.ts` (the list reads) · `apps/web/components/controls/link-picker.tsx` ·
  `apps/web/lib/preview-subject.ts`

### DW-249: nobody has watched the editor read posts from a Ghost(Pro) site

plain: The editor reads your posts straight from your Ghost site. On a site hosted by Ghost(Pro) there is a delivery
  network in front of Ghost that may limit or cache those reads differently from the self-hosted test servers. Nobody
  has seen it, because there is no Ghost(Pro) site to try until the trial planned near the end of the build.
status: open
severity: medium
origin: Story 5.18's Create (2026-09-24). FR-H4 says "Ghost(Pro) sits behind an edge Inflozo does not model"; every
  Content API fact 5.18 rests on is executed on self-hosted T1 and T3 only; `GHOSTPRO_*` in `tools/probe/.env` is
  empty and VERIFY-AT-BUILD's Ghost(Pro) trial waits for "E13 closes and E14 opens".
reason: three answers only a Ghost(Pro) site can give — whether an edge's 429 carries `access-control-allow-origin`
  (without it the browser sees "not answering", never a 429), the edge's own limits against 5.18's session ceiling,
  and whether the `*.ghost.io` admin origin Inflozo stores (`sites.url`) serves the Content API with the headers the
  public domain does.
owner: Story 15.7 (The Ghost(Pro) launch gate), whose criteria carry its requirement word for word with its id
  (R-195). *(Story 5.24a's Dev, 2026-09-28: was "the Ghost(Pro) Starter trial (VERIFY-AT-BUILD's dated action); Story
  5.18's Dev adds these three to its checklist.")*
location: `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/VERIFY-AT-BUILD.md` ·
  `apps/web/lib/live-content.ts`

## Deferred from: code review of spec-5-18-live-content-from-the-connected-site.md (2026-09-24)

### DW-250: the first paint of a canvas on the site's content costs two round trips where one would do

plain: When the editor opens a page of your own site, it asks your site for what the page needs in two goes rather than
  one: first the settings and the lists, then the page of posts itself. It shows nothing wrong, and a page opens in
  well under a second on the test sites; it is simply one round trip more than it needs.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `sitePage` no longer returns on an unresolved subject. While the subject
  waits on a read, a subject stored from the site is the likely answer for `source.pages` and `sitePieces`, so its own
  row and its archive's page 1 go out in the same round as R-193's list; `{ nothing }` is judged only once resolved. A
  stored Tag or Author paints after one round trip, not three; one the site no longer holds paints after two, its guess
  costing a `200 []` — a browse, which never 404s (`posts-public.js`: only `read` throws NotFoundError, both majors; §51
  executed a gone slug's `200 []`). Control in `live-content.test.ts`, which runs the editor's `request()` loop over a
  cache the test fills, seen red against the unchanged `sitePage` ("tag.hbs: actual 3, expected 1"); Home and a stored
  Post stay at 1, an untouched Tag at 2.
severity: low
origin: Story 5.18's code review (2026-09-24, Blind Hunter). `apps/web/lib/canvas.ts`'s `sitePage` returns `{ need }` the
  moment the subject is unresolved, before `sitePieces` has recorded the feed page's read, so Home discovers its
  page-1 read on the second walk; Tag and Author, whose subject waits on R-193's list, take three.
reason: `sitePieces` cannot be asked for the feed before the subject is known on an archive (the read is `filter=tag:`
  the subject), and asking for Home's feed early means special-casing the files whose feed depends on no subject.
  The walk records 7 requests to open the editor and 53 for a whole walk against a ceiling of 500, so the cost is
  latency, not budget. A fix records the subject-free reads in the first round.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "unowned — Story 5.19 (the main feed's lifecycle)
  touches the same walk.")*")*
location: `apps/web/lib/canvas.ts` (`sitePage`) · `apps/web/lib/live-content.ts` (`sitePieces`)

### DW-251: two rows of Story 5.18 are proven at the unit level only — the ring's tiles on the site's content, and the "newest 100 posts" line on a site with more than 100

plain: Two things the code does are checked by the small tests but have not been watched on the live site: the little
  design tiles under a selected section drawing your own posts, and the line that says "Showing your newest 100
  posts" — which neither test site can show, because each holds 33 posts.
status: open
severity: low
origin: Story 5.18's code review (2026-09-24, Verification Gap). `run-verify-live-content.cjs` asserts the Section
  Picker's card shows the site's newest post but reads no ring tile; its capped-line check reduces to "absent" on
  both test sites (33 posts, MEASUREMENTS §51), and `[data-link-capped]` is never read by any harness. `cappedPosts`
  and `siteLinks(...).capped` are unit-tested (`live-content.test.ts`, this review).
reason: a tile is the same `SectionPreview` the card is, handed the same `live`; a positive capped line needs a site
  with more than 100 posts, or a `page.route` rewrite of `meta.pagination.total` named as a simulated condition, as
  the network cut is.
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose card names this entry:
  the first story to ship a ring of more than one design, it has the walk read a ring tile drawing the linked site's
  newest post on production. *(Story 5.24d's Dev, 2026-10-01: the capped half ran and passed, so the entry is 9.1's
  alone. Was "Stories 5.24d (The sweep: the checks and the walks) and 9.1 (A1 — the content model, the stylesheet and
  designs #1, #3, #4 and #13), whose cards name this entry: 5.24d reads the capped lines on the live-content walk under a
  simulated total past the limit; 9.1, the first story to ship a ring of more than one design, has the walk read a ring
  tile drawing the linked site's newest post on production"; Story 5.24d's Create, 2026-10-01: every shipped category
  holds one design, so production draws no ring strip and the tile half cannot run before 9.1. Was "Story 5.24d (The
  sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names this entry"; Story 5.24a's
  Dev, 2026-09-28: was "unowned — the first customer site with more than 100 posts (DW-248's trigger), or the next story
  that extends the live-content walk.")*
location: `tools/probe/run-verify-live-content.cjs` · `apps/web/components/editor/design-picker.tsx` ·
  `apps/web/components/controls/link-picker.tsx`
amended: Story 5.24d's Dev (2026-10-01) — THE CAPPED HALF IS DONE; the ring tile is all that is left. Before T1's 429 step,
  `run-verify-live-content.cjs` opens a session (simulated: page.route) in which the unfiltered `limit=LIST_LIMIT` posts
  read keeps every row Ghost's and has `meta.pagination.total` raised to LIST_LIMIT + 1, and reads D5e's capped line under
  the Post canvas's subjects and the Link Picker's for `LIVE_WORDS`' words; the control is the same session unrouted. The
  header names its simulated conditions without a count. Run in the main session on the owner's go in that session
  (LOCAL RUNs on app.inflozo.com, `NO_429=1`, both majors), twice: on T3 "Showing your newest 100 posts." under the
  subjects and "Showing your newest 100 posts. Paste an older post's address to link it." in the Link Picker, and the
  unrouted control `null` in both, PASS each time; the second run 0 FAIL, 157 PASS, users 13 → 13, T3's Subscription
  access and T1's button and bar put back and read back.

## Deferred from: Story 5.19's Create run (2026-09-25)

### DW-252: the main feed's route half — a route's own `limit:` and a channel given a main feed at creation

plain: Your main feed shows as many posts per page as your theme's Posts per page says. A collection you make later in
  the Routes Manager can set its own number, and a channel you make there should start with a main feed of its own.
  Neither exists yet, because the Routes Manager does not.
status: open
severity: medium
origin: Story 5.19's Create (2026-09-25). FR-H2 (`prd.md:312`) sizes the main feed "by the global `posts_per_page` … or by
  the route's own `limit:` where the template is reached through a `routes.yaml` collection that sets one", and gives
  "a channel template created in the Routes Manager … one the same way at creation"; Ghost overwrites
  `@config.posts_per_page` with a route's `limit` at render (`frontend/services/routing/controllers/collection.js:32-44`,
  `channel.js:33-45`, both majors, read in source). Story 7.16's criteria (`epics.md:3075-3127`) name the per-collection
  limit but neither the canvas reading it nor the channel's designation.
owner: Story 7.16 (The Routes Manager), whose criteria already carry it with its id: the canvas sizes a main feed by
  its route's own `limit:`, and a channel or collection template is given its main feed at creation. *(Story 5.24a's
  Dev, 2026-09-28: was "Story 7.16 (the Routes Manager) — the canvas reads the route's `limit` where the template is
  reached through a collection that sets one, and a channel or collection template it creates is handed its main feed
  through Story 5.19's one designation rule (`packages/section-runtime`, AD-27(d)). *(Its criteria say so since R-195's
  sweep, 2026-09-25.)*")*
location: `epics.md` Story 7.16 · `packages/section-runtime` (the designation rule) · `apps/web/lib/canvas.ts` and
  `packages/library/src/orbit-weekly.ts` (the page size handed in)
reason: no route exists, so the value in force is always the project's `posts_per_page`, and no custom collection or
  channel canvas exists either (`custom-*` 404s until its story); Story 5.19 builds the rule so a new paginated file is
  covered by `PAGINATED_TARGETS` and the page size is an argument, not a constant.

### DW-253: FR-H2's compile-side half has no story — the feed-less archive's warning and SEO guard, and the per-template hand-picked warning

plain: Three things the plan promises for the live site have nobody to build them. A tag or writer page with no list of
  posts should warn you before you ship, and should tell search engines not to index its empty page 2 onwards; and a
  page carrying several hand-picked lists should warn you, before you ship, how much they slow the page in total.
status: open
severity: medium
origin: Story 5.19's Create (2026-09-25), swept in `epics.md`: FR-H2 (`prd.md:312`) — "pre-deploy checks warn, and the
  compiler emits the SEO guard on those templates (`noindex` beyond page 1 plus a canonical link to page 1)" for a
  feed-less `tag.hbs`/`author.hbs`, and "the panel warns per section; the pre-deploy check warns per template" for
  hand-picked lists. No story's criteria name `noindex`, the canonical link, the archive warning or the per-template
  hand-picked warning (Story 7.18's Pre-flight names only FR-D16's member-state row, `epics.md:3158-3196`).
owner: Stories 7.18 (The deploy wizard) and 7.3 (Synthesis Defaults and the emptying rules), whose criteria already
  carry it with its id: 7.18's two Pre-flight warnings and 7.3's SEO guard. *(Story 5.24a's Dev, 2026-09-28: was "Story
  7.18 (the two Pre-flight warnings) and Story 7.3 (the guard the compiler emits) — their criteria name them since
  R-195's sweep (owner, 2026-09-25: "no requirement/feature is missed"). The archive's EDITOR warning is Story 5.19's
  own: a note at the head of Layers on a Tag or Author page with no visible feed.")*
location: `epics.md` Stories 7.3, 7.6 and 7.18 · FR-H2
reason: all three are compile or deploy facts and nothing compiles yet; Story 5.19 builds the per-SECTION warning (P0·5's
  past-25 sentence) and allows a feed-less paginated template, which is the editor half.
note (Story 7.3's Dev, 2026-10-06): the guard, Story 7.3's half, is built — `noindex` alone, once, in `default.hbs`'s
  head: `{{#is "paged"}}{{#is "<contexts>"}}<meta name="robots" content="noindex">{{/is}}{{/is}}`, listing `index`,
  `tag` and `author` in that order wherever that page 2's stack has no visible feed (`visibleFeed`, now exported from
  `packages/section-runtime/src/main-feed.ts`, the one test for the editor's note, this guard and 7.18's Pre-flight),
  and no block where there is none. **No canonical link**: Ghost's `{{ghost_head}}` writes one on every page, page 2's
  pointing at itself (`meta/canonical-url.js`, read in source), so the page-1 canonical the origin quotes is corrected
  in FR-H2. Its two Pre-flight warnings stay with Story 7.18.

### DW-254: the main feed's Count says where Posts per page is set, but not yet "Change it in Theme settings" with its link

plain: When you click your main list of posts, its greyed Count explains that your theme's Posts per page decides it. The
  drawing also says "Change it in Theme settings" with a link; that half waits until Theme settings has the Posts per
  page field.
status: done 2026-10-09 (Story 7.9)
resolution: Story 7.9's Dev — `DATA_WORDS.mainCount` is D5c's two sentences, "This feed is sized by your theme's Posts per
  page. Change it in Theme settings.", and the Data group draws `THEME_SETTINGS_LINK` ("Theme settings ↗") under the main
  feed's greyed Count, to `settingsPath(project.id)` — threaded from the editor through `Sidebar` to `DataGroup` as
  `settingsHref`; the keyboard harness, which has no project, hands none and draws none. Theme settings now carries
  Posts per page (`projects.posts_per_page`, 1–100). `data-group.test.ts`, `controls.test.ts` and `settings.test.ts` hold it.
severity: low
origin: Story 5.19's Create (2026-09-25). D5c (`D5 Canvas Markers and Template Switcher.dc.html:347-348`) draws "This feed is
  sized by your theme's Posts per page. Change it in Theme settings." and "Theme settings ↗"; Theme settings holds only
  D6a's project-mode block and the dark-overrides row (R-131), and Posts per page is Story 7.9's (FR-Q1).
owner: Story 7.9 (Theme Settings and the custom-settings builder), whose criteria already carry it with its id: the
  main feed's greyed Count gains "Change it in Theme settings." and its link. *(Story 5.24a's Dev, 2026-09-28: was
  "Story 7.9 (Theme Settings) — the sentence gains "Change it in Theme settings." and the link, FR-Q1's "every surface
  that mentions posts per page links HERE". *(Its criteria say so since R-195's sweep, 2026-09-25.)*")*
location: `apps/web/components/controls/data-group.tsx` (Story 5.19) · `apps/web/lib/data-group.ts` (the words)
reason: R-118 — a door arrives with the thing it opens; a link to a page with no Posts per page on it would say
  something untrue.

### DW-255: between Story 10.54 and Story 10.112 the main feed has no page links

plain: Today your post grid draws its own "Newer posts · 1 / 3 · Older posts" links. The finished Post Grids draw none —
  their drawings leave page links to the Pagination styles — and Epic 10 rebuilds the Post Grids long before the
  Pagination styles arrive, so for that stretch no page on your site links to its own page 2.
status: done 2026-09-25 (R-196)
resolution: the owner ruled Story 5.19's Question 2, option 1 (R-196, 2026-09-25): A34's first story, Story 10.112,
  runs straight after A17's owner gate (Story 10.58) and before A18, so the page links are missing only while A17's own
  five stories are built and tested. Landed the same day:
  - `epics.md` Epic 10's preamble names it the epic's third ordering rule, and Stories 10.54, 10.58, 10.59, 10.112 and
    10.113 say where they now sit;
  - `sprint-status.yaml` lists 10.112 straight after 10.58;
  - `tools/story-board.py`'s gate follows the tracker's order (`run_order`, with its self-check);
  - PRD §8's E10 line, `build-sequence.md` step 7 and both `_bmad/custom/` build overrides state the exception.
severity: medium
origin: Story 5.19's Create (2026-09-25), found checking R-195's moves. `A17 Post Grids - Spec.md` §4 ("No A17 design
  draws page numbers, a next link, a counter or a range of its own … A34 attaches below") and the `A17-1 Three Up.dc.html`
  frame ("pagination is A34's, attached below") give the rebuilt Three Up no pager, where the pilot
  (`packages/library/designs/a17/1/index.html`) draws one today. Epic 10 runs in inventory order — A17 at Stories
  10.54–10.58, A34 at 10.112–10.114 — and A34's first four designs are built out of A1, A6 and A17 pieces, the last of
  them A17 #18's inset focus ring (`A34 Pagination Styles - Spec.md`, Block 1), so A34 cannot open before Story 10.58.
owner: the owner — Story 5.19's Question 2 (where A34's first story sits in Epic 10's order); then Epic 10's preamble
  and the stories it moves.
location: `epics.md` Epic 10's preamble and order · Stories 10.54 and 10.112
reason: a planning-order gap no story can close alone: moving a story across categories changes Epic 10's
  one-category-at-a-time rule, which is the owner's; keeping the pilot's links on the rebuilt grids departs from their
  drawings (R-74).

### DW-256: the canvas's chrome layer draws no Tailwind shadow — P0-1's pill has none on the canvas

plain: The small pills the editor draws over the canvas — the lock pill on text that comes from Ghost, and the note
  when a character is refused — should cast a soft shadow, as their drawing shows. They draw none, because of how the
  editor's styles reach the layer they sit in. Nothing is broken to use; they look flatter than drawn.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the chrome layer's host declares Tailwind 4.3.3's four shadow variables —
  `--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow` and `--tw-ring-shadow`, each `0 0 #0000` —
  which an adopted sheet does not register through `@property`, with its comment saying why (`lib/canvas-layer.ts`).
  Control: DW-182's journey, extended — a `shadow-md` probe in the editor's own document computes a shadow (the
  control), and the limit pill on the canvas then draws one — red at HEAD after the probe passed.
severity: low
origin: Story 5.19's Dev (2026-09-25), executed on the harness editor with the repo's own Playwright: inside the
  canvas chrome layer's shadow root, `shadow-md` and `shadow-lg` compute `box-shadow: none`, while the same classes in
  the editor's own document compute the token shadow (the control). The cause is the one Story 5.19 fixed for borders:
  Tailwind v4's utilities read custom properties whose initial values are `@property` registrations
  (`--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow`, `--tw-ring-shadow`), and a shadow root's
  adopted sheet does not register them. Story 5.19 declared `--tw-border-style:solid` on the host for its MAIN FEED
  chip's border, and the PAUSED chip's and P0-1's pill's hairlines drew from then on; the shadows did not.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — needs one. The next story that touches the canvas's chrome, or a Fix
  run on the owner's word.")*
location: `apps/web/lib/canvas-layer.ts` (`chromeLayers`, the host's style) · `apps/web/components/controls/mark-toolbar.tsx`
  (`CanvasNote`; `P0-1 Inline Text Toolbar.dc.html:142` draws the pill with `box-shadow:0 4px 16px rgba(28,27,26,.10)`)
reason: outside Story 5.19's surfaces — its chip draws no shadow. The fix is the same kind of line (the shadow variables'
  `0 0 #0000` declared on the host), but it changes a surface Story 5.3 owns, which the owner should see in a test of it.

### DW-257: the editor's two repair doors and the paint's edit-read branch are proven only by the deployed walks

plain: Three small pieces of the main-feed story — the repair of an old page as it opens, the same repair when the
  editor reloads from its own saved copy, and the way an edit that needs new posts from the site asks for them — are
  checked by the walks run by hand against the real site, not by the tests that run on every commit. They passed there.
  A future change could break one and every commit-time test would stay green.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): all three doors reach `pnpm keyboard`. The server door is ONE function, `designateAll`
  in `(editor)/read.ts`, which `editorData` and the keyboard harness both call — the harness's own `MAIN_FEED` and feed
  index are gone, so its Home's main feed is the rule's choice (and its stale CSP comment is corrected). NOT in
  `lib/editor.ts`, where the plan put it: that module is the client Shell's too, and the runtime it would import took
  the Projects page's client script from 384,773 to 922,553 bytes on a production build. Two journeys: the local hydrate
  (the editor's own IndexedDB record stripped of every Home flag and a row renamed, reloaded: the renamed row and
  exactly one main-feed chip) and the edit read (a secondary feed's Source set to By tag on the answering harness site:
  each tag read the edit needs asked exactly once, the page still drawn from the site). Controls, each red: `designated`
  removed from the hydrate; a pass-through `designateAll` (the 5.19 main-feed journeys); the paint's `editReads` branch
  cut.
severity: low
origin: Story 5.19's review (2026-09-25), the Verification Gap layer: `read.ts`'s `docs[key] = designate(…)`, the
  hydrate's `designated(k, d)` and `paint()`'s "an edit needs a read no press made" branch (`editReads`) are each held by
  `run-verify-editor.cjs` step 94 or `run-verify-live-content.cjs` alone — the keyboard harness has no linked site and
  its Home is flagged from `SYNTHESIS_DEFAULTS`, so `pnpm keyboard` reaches none of them. Deleting `read.ts`'s line
  leaves `pnpm check` and `pnpm keyboard` green.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned — needs one. The next story that touches `read.ts`'s doc
  assembly or `paint()`'s site branch, or a Fix run.")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` (`editorData`'s designate loop) ·
  `editor.tsx` (the hydrate; `paint()`'s `editReads` branch) · `apps/web/app/(app)/app/harness/editor/page.tsx`
reason: the shape of the fix is a second harness canvas seeded UNFLAGGED plus a `5.19 ·` journey, and a pure
  `unasked(need, asked)` in `lib/live-content.ts` with a `node --test` row — more than a review patch, and the deployed
  walks do hold them today (R-82).

### DW-258: two grammars for a Ghost slug — 5.18's `slugShaped` and 5.19's `GHOST_SLUG_RE` — and neither was executed

plain: Two parts of the editor decide differently what a "valid tag name" looks like: the part that reads posts from your
  site accepts accented letters, and the part that writes your theme accepts only plain ASCII. Real Ghost tag slugs are
  plain ASCII as far as Ghost's own code says, so no real tag falls between them today. It is one rule written twice.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): one grammar. `GHOST_SLUG_RE` is `/^[a-z0-9_×ß-þ-]+$/`, what Ghost's slugify
  really writes, and `slugShaped` is a string of at most 191 characters matching it, imported from `@inflozo/library`
  (no client page newly pulls the library — every importer of `live-content.ts` already does). Both earlier grammars
  were wrong, read in source and executed on both pins: unidecode 0.1.8's `utf8_rx` leaves a Latin-1 letter that a
  character in U+00A0–U+00BF follows, so a slug keeps × and ß–þ (`« Café »` with no-break spaces → `café`) and nothing
  past Latin-1 (`中文` → `zhong-wen`); an import slugifies with `requiredChangesOnly` (`post.js:868`), so a post's `--`
  and edge hyphens survive. `validateDataBinding`'s filter class, run again at emission, admits the same letters, or a
  stored `café` tag threw on both emitters. Controls, each red at HEAD: `validate.test.ts` on `café`,
  `live-content.test.ts` on `a--b`. gscan on the stress theme emitting `tag:'café'` (a scratch copy): 0 errors 0
  warnings on both majors; its control, `author:'café'` in the same get, GS001-DEPR-AUTH-FILT on both. T1 and T3,
  read-only: `slug:'café'` and `tag:'café'` answer 200 []. MEASUREMENTS §63. The entry's `plain:` line ("plain ASCII")
  was wrong for the same reason.
severity: low
origin: Story 5.19's review (2026-09-25), the Blind Hunter and Edge Case layers. `apps/web/lib/live-content.ts`'s
  `slugShaped` (Story 5.18: `^[\p{Ll}\p{Lo}\p{Nd}_]+(?:-[\p{Ll}\p{Lo}\p{Nd}_]+)*$`, single hyphens, any script)
  and `packages/library/src/vocabulary.ts`'s `GHOST_SLUG_RE` (Story 5.19: `^[a-z0-9_-]+$`, read in `@tryghost/string`'s
  `slugify.js` at both pins). `café` passes one and fails the other; `a--b` the reverse. `live-content.test.ts` asserts
  `café` valid, so unifying them inside 5.19's review would overturn 5.18's tested claim on an unexecuted reading.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — needs one. The next story that stores or reads a slug (Story 7.16's
  routes, or Epic 9's first Ghost-sourced design), which EXECUTES it: create a tag whose name is non-ASCII on T1 under
  the reset protocol and read the slug Ghost gives it, then keep one grammar in the vocabulary and point `slugShaped` at
  it.")*
location: `apps/web/lib/live-content.ts` (`slugShaped`) · `packages/library/src/vocabulary.ts` (`GHOST_SLUG_RE`) ·
  `apps/web/live-content.test.ts:49-55`
reason: standing rule 1 — both are hypotheses about Ghost until executed, and the review may not pick one by reading.

### DW-259: a hand-picked list past 100 picks reads fewer rows on the canvas than the theme will render

plain: If you hand-pick more than 100 posts for one list, the editor asks your site for them in a single request that
  can return at most 100, so the canvas shows the first 100 and marks the rest as missing, while the published theme
  would show every one. The panel already warns past 25 picks that such a list is slow.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `bindingReads` reads a pick as its de-duplicated, sorted ids in chunks of
  `LIST_LIMIT`, each chunk its own key; `siteRows` flat-maps the chunks in pick order, and `siteTotal` is 0 until every
  chunk has landed. FR-H2's "no hard cap" stands, and picks 101 and up are no longer marked "Not on {site}"
  (`data-group.tsx`'s `PICK_LACKING`). The editor's `requestDesigns` spreads the halves. Control in
  `live-content.test.ts`: 150 picks against a look that answers at most 100 a read — all 150 rows in pick order from two
  reads; seen red against the unchanged library.
severity: low
origin: Story 5.19's review (2026-09-25), the Blind Hunter layer: `bindingReads` reads the picks as ONE
  `filter=id:[…]` at `LIST_LIMIT` (100), which is also Ghost 6's own `maxLimit` cap for a get, while `feedExprs` emits N
  single-id gets. Past 100 picks the canvas and the theme disagree, and `siteRows` marks the overflow lacking.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — needs one. The story that first caps a Ghost-sourced Count per design
  (R-195: 9.5, 9.11, 10.54…) is the natural place, since it decides what a list's ceiling is.")*
location: `apps/web/lib/live-content.ts` (`bindingReads`, the `ids` branch) · `packages/ghost-shim/src/index.ts` (`feedExprs`)
reason: the fix is either a paged read (several requests, and 5.18's per-key cache keyed per page) or a stated cap on
  picks, and a cap is the owner's — FR-H2 says no hard cap, the panel warns past 25.

## Deferred from: Story 5.20's Create run (2026-09-26)

### DW-260: FR-H6's pre-deploy repeat of the member-switch warnings has no story

plain: When your site has members switched off, or cannot take free or paid sign-ups, the editor and the Sites screen
  warn you from Story 5.20 on. The plan also promises the same warning again just before you ship, and nobody builds it.
status: open
severity: medium
origin: Story 5.20's Create (2026-09-26). FR-H6 (`prd.md:336`) — "placing portal/signup sections or designing the paywall
  on a site with members disabled warns in the editor, and a pre-deploy check repeats it" — and R-4 (`reconcile-designs-
  decisions.md:307-329`), "warn at connect and pre-deploy". Story 7.18's Pre-flight (`epics.md:3181` onward) names FR-D16's
  member-state row and FR-H2's warnings, never FR-H6's.
owner: Story 7.18 (The deploy wizard), whose criteria already carry it with its id: Pre-flight repeats FR-H6's
  member-switch warnings. *(Story 5.24a's Dev, 2026-09-28: was "Story 7.18 (the deploy wizard's Pre-flight) — it reads
  Story 5.20's one record, `sites.site_settings.members`, and lists the same sentences the Sites screen uses
  (`apps/web/lib/paywall.ts`). Its criteria gain it in Story 5.20's docs task.")*
location: `epics.md` Story 7.18 · `apps/web/lib/paywall.ts` (Story 5.20)
reason: nothing deploys yet; Story 5.20 builds the record and the connect and editor halves, which is everything that
  can run before Epic 7.
note (Story 5.20's Dev, 2026-09-26): Story 7.18's Pre-flight criteria now name it (`epics.md`), reading `site_settings.members`
  through `storedMembers` and printing `membersNotice`'s sentences — the ones the Sites screen already shows.

### DW-261: `partials/content-cta.hbs` has two compile rules no story names — the explicit reference and its own `{{{html}}}`

plain: For a designed paywall to replace Ghost's own, the published theme must do two unusual things Ghost requires:
  mention the paywall file once from a page template, and print the post's free preview itself. No story says so yet.
status: done 2026-10-06 (Story 7.3)
resolution: Story 7.3's Dev (2026-10-06) — a designed paywall compiles to `partials/content-cta.hbs`, opening
  `{{{html}}}`, AD-5's second exception there alone and checked on every compile (7.3's Question 2, owner, 2026-10-06;
  the spine's AD-5). The explicit reference is NOT emitted: read in source, any partial invoked from a non-partial
  template makes Ghost register the theme's `partials/` (gscan's `partials` list, `active.js`), and an explicit
  `{{> "content-cta"}}` in a rendered position printed the paywall twice in §15b's probe — so the compile asserts
  instead that a theme carrying the partial invokes one from a file outside `partials/`. MEASUREMENTS §15b carries the
  dated correction, §72 the T1 rows; FR-I1 and Story 7.6's copy say "built by Story 7.3".
severity: high
origin: Story 5.20's Create (2026-09-26). MEASUREMENTS §15b (executed 2/2 each way on both majors): the override takes
  effect only when a template also references the partial explicitly, `{{> "content-cta"}}` — "a compile assertion".
  And Ghost's own template's first line is `{{{html}}}` (`core/frontend/helpers/tpl/content-cta.hbs:1`, both majors, read
  in source): a theme's override replaces the whole template, so without that line the free preview above the cut
  disappears. It is a triple-stash, which the compile gate otherwise forbids (AD-5), so it is AD-5's second stated
  exception, bounded to that partial's first line.
owner: Stories 7.3 (Synthesis Defaults and the emptying rules) and 7.6 (Ghost-correct markup), whose DW-261 criterion
  now says AD-5's second exception is the owner's to rule before it is built — AD-5 states only `PAGE_NUMBER_HBS`
  (R-83). *(Story 5.24a's Dev, 2026-09-28: was "Story 7.3 (the conditional-template pattern that already names
  `partials/content-cta.hbs`, `epics.md:2682-2683`) and Story 7.6 (FR-J5, "the paywall renders via the `content-cta.hbs`
  partial", `epics.md:2790-2791`). Their criteria gain both rules in Story 5.20's docs task.")*
location: `epics.md` Stories 7.3 and 7.6 · AD-5 in `ARCHITECTURE-SPINE.md` · the compiler (Epic 7)
reason: Story 5.20 draws the paywall on the canvas and stores the choice; nothing compiles a theme before Epic 7.
note (Story 5.20's Dev, 2026-09-26): Stories 7.3 and 7.6 now carry both rules in their criteria (`epics.md`).

### DW-262: the Paywall editor's A32 half — the gate switcher, the four copy sets, the named-tier preview, and a way back to Ghost's own box

plain: The paywall designs each come with four versions of their words — for a free post, a paid post, a free member
  who should upgrade, and one named tier — and a switch to see each. Those arrive with the designs themselves, as does a
  way to go back to Ghost's own paywall after choosing a design.
status: open
severity: medium
origin: Story 5.20's Create (2026-09-26). `A32 Paywall - Spec.md` § Editing, inline and by gate (the P0·6 switcher
  "Gate: Free signup · Paid · Upgrade · Named tier", in all twelve panels) and `P0-6 Editor State Switcher.dc.html:90-117`
  ("each category declares its list; the switcher never invents one"). A tier-gated post needs a Paid member who holds
  the tier: Ghost 6 previews one holding every active paid tier (`create-paid-member-shim.js` 6:18-41, read in source),
  which is how Story 5.20's `postAccess` models its Paid member. Choosing a design materialises the `paywall` doc; C3a
  draws no control that empties it again (FR-I1's emptying rule would give Ghost's box back).
owner: Story 10.107 (A32 — the content model, the stylesheet and designs #1, #3, #4 and #5), whose criteria already carry it with
  its id: the Paywall editor gains A32's own half. *(Story 5.24a's Dev, 2026-09-28: was "Story 10.107 (A32's content
  model and first designs) — its criteria gain these in Story 5.20's docs task, with the owner's own call on whether
  "back to Ghost's own box" is a control or undo alone.")*
location: `epics.md` Story 10.107 · the Paywall canvas (`editor.tsx`, Story 5.20)
reason: the gate list is the category's declaration (P0·6), and the copy sets are A32's content model; Story 5.20
  previews one Paid-members-only post with View as alone.
note (Story 5.20's Dev, 2026-09-26): Story 10.107's criteria now carry the four (`epics.md`). Built here: the paywall canvas
  previews one Paid-members-only post through View as, and ⌘Z is the only way back to Ghost's own box (the pill, Layers and
  the Delete and ⌘D keys all leave the paywall's one instance alone — `onSurfaceDoc` in `editor.tsx`).

### DW-263: Stories 10.107–10.109 describe A32 as placeable and ring-cycled, which FR-H6 forbids

plain: The three paywall design stories were written from the common category template, so they talk about "placing" a
  paywall, "composing a page" from them and cycling them with the [ and ] keys. A paywall is chosen in its own screen and
  is never placed on a page.
status: done 2026-09-28 (Story 5.24a)
resolution: Story 5.24a (2026-09-28), already fixed by Story 5.20's docs task — re-read in `epics.md`: Story 10.107's
  design line says A32 is "**chosen, never placed**", selected on the Paywall editor and absent from the Section Picker,
  Layers, Shuffle and Remix, and Story 10.109's gate cycles the ring on the Paywall editor with ◀ ▶, never on a page;
  `placement.ts`'s `NON_PLACEABLE` holds A32 and its stand-ins, and `placement.test.ts` passes today.
severity: medium
origin: Story 5.20's Create (2026-09-26), the planning sweep: `epics.md:7089` ("so a Free user has something
  placeable"), 10.109's owner gate (`:7147-7148`, "cycle it with `[` and `]`", "composes a page from the category's
  designs") against FR-H6 (`prd.md:336`, a template surface absent from the Picker, Layers and Shuffle) and
  `placement.ts:23-26` (`NON_PLACEABLE`).
owner: Stories 10.107 and 10.109 — their criteria are corrected in Story 5.20's docs task: the Paywall editor is where
  the owner gate chooses a design and cycles the ring, with ◀ ▶ in its panel.
location: `epics.md` Stories 10.107–10.109
reason: a criteria correction in a live document, owed where the finding was made (standing rule 3).
note (Story 5.20's Dev, 2026-09-26): Stories 10.107 and 10.109 corrected in `epics.md` — the Paywall editor is where A32 is
  chosen and its ring cycled, with ◀ ▶ in its panel; the two stand-ins prove the machinery (`pnpm keyboard`).

### DW-264: the shim has no `{{price}}` helper, and a tier's `benefits` cannot be repeated

plain: Showing a tier's price and its list of benefits needs two small pieces the editor does not have yet. The first
  design that shows either builds them.
status: open
severity: low
origin: Story 5.20's Create (2026-09-26). Prices arrive in the smallest currency unit and must print through Ghost's
  `{{price}}` (`A32 Paywall - Spec.md:217-219`); `packages/ghost-shim/src/index.ts` has no `price`. The tier scope types
  `benefits` as a `list` with no `of` (`packages/library/contexts/matrix.json:522-566`), and a list of plain values opens
  no scope (`contexts.ts:293`), so no design can `data-repeat` over it.
owner: Story 10.14 (A7 — the content model, the stylesheet and designs #1, #3, #4 and #12), whose criteria already carry it with its
  id: the first category to print a tier's price and its benefits builds both. *(Story 5.24a's Dev, 2026-09-28: was
  "Story 10.14 (A7's content model and first designs, the first category that prints a tier's price and benefits); A32's
  10.107 inherits them. Named in their criteria by Story 5.20's docs task.")*
location: `packages/ghost-shim/src/index.ts` · `packages/library/contexts/matrix.json` (the tier scope)
reason: Story 5.20's stand-ins print tier names alone, which proves the live and sample tier reads without either piece.
note (Story 5.20's Dev, 2026-09-26): Stories 10.14 and 10.107 name them in their criteria (`epics.md`).

### DW-265: the A32 spec offers "all tiers, including free" and greets a member by name, which FR-H6 and R-28 forbid

plain: The paywall design notes offer a setting that would show every tier, and one that greets a signed-in member by
  name. The first breaks the rule that only public paid tiers are shown, and the second prints a member's name into the
  page, which the project never does.
status: open
severity: low
origin: Story 5.20's Create (2026-09-26), the planning sweep: `A32 Paywall - Spec.md:234` ("Tiers: From Ghost, all") and
  `:695` ("All, including free") against FR-H6's `type:paid+visibility:public`; `:96` and `:1118` ("greeted by name
  where Ghost has one") against R-28 and AD-38. Story 5.20's `tiers-unfiltered` rule and the existing `@member` refusal
  (`contexts.ts:186-188`) already refuse both at assembly.
owner: Story 10.107 (A32 — the content model, the stylesheet and designs #1, #3, #4 and #5), whose criteria already carry it with
  its id: A32 is built without the spec's "Tiers: From Ghost, all" option and without greeting a member by name. *(Story
  5.24a's Dev, 2026-09-28: was "Story 10.107 — it builds A32 without the two options, and its criteria say so (Story
  5.20's docs task). The export is never edited (R-74).")*
location: `A32 Paywall - Spec.md` (read-only) · `epics.md` Story 10.107
reason: the export is the design authority for what a design is built from, and the PRD for what it does; the rules
  already hold, so this records the disagreement rather than leaving A32's author to find it by a failed build.
note (Story 5.20's Dev, 2026-09-26): Story 10.107's criteria say A32 is built without both options (`epics.md`);
  `tiers-unfiltered` and the `@member` refusal hold them at assembly meanwhile.

### DW-266: the Post Content panel's "Open paywall editor →" link belongs to A25 and no story names it

plain: The drawings put a link to the Paywall screen inside the settings of the article section on a post. That link
  arrives with the article designs, and no story says so yet.
status: open
severity: low
origin: Story 5.20's Create (2026-09-26): `C Post Body.dc.html:81` (C1a, "Open paywall editor →") and `:1064` (C1d,
  "Open Paywall →"); EXPERIENCE.md:705 names them. Story 5.20 builds the entry the IA settles on — the Template
  switcher's Template surfaces group (EXPERIENCE.md:218-222).
owner: Story 10.83 (A25 — the content model, the stylesheet and designs #2, #3, #4 and #5), whose criteria already carry it with
  its id: the Post Content panel's "Open paywall editor →". *(Story 5.24a's Dev, 2026-09-28: was "Story 10.83 (A25's
  content model and first designs) — its criteria gain it in Story 5.20's docs task.")*
location: `epics.md` Story 10.83 · `C Post Body.dc.html` C1a, C1d
reason: R-118 — a door arrives with the panel it sits in; no Post Content design exists before 10.83.
note (Story 5.20's Dev, 2026-09-26): Story 10.83's criteria now name the link (`epics.md`).

### DW-267: `project_treatments.paywall_design_id` is never written

plain: The database has an old column meant to remember which paywall a site uses. The editor stores the paywall with
  its words and settings in the same place as every page's design instead, so that column stays empty and should go.
status: open
severity: low
origin: Story 5.20's Create (2026-09-26). `complete_schema.sql:702-712` holds `paywall_design_id text` with no reader or
  writer anywhere, and no column for a design's content or controls. Story 5.20 stores the paywall as the `paywall` doc
  (AD-27's "the doc gains a row per stored state, not a second store"), and amends AD-27(a0) to say so.
owner: Story 7.13 (The Ghost card design module and `cards.css`), whose criteria already carry it with its id:
  `project_treatments.paywall_design_id` is dropped in that story's own Schema phase. *(Story 5.24a's Dev, 2026-09-28:
  was "Story 7.13 (the card design module, the first story to write `project_treatments`) — it drops the column in its
  own Schema phase.")*
location: `supabase/migrations/20260904120000_complete_schema.sql:705` · `SCHEMA.sql` · AD-27(a0)
reason: dropping a column is a Schema phase of its own (R-99), and Story 5.20's migration only widens a constraint;
  an unwritten column harms nothing until then.
note (Story 5.20's Dev, 2026-09-26): AD-27(a0) now says the paywall is the `paywall` doc and the column is unwritten
  (`ARCHITECTURE-SPINE.md`); Story 7.13's criteria name the drop (`epics.md`).

### DW-268: Starter 11.11 names "Hard Stop Card (A32 #2)", a design A32 does not have

plain: One of the ready-made starter sites lists a paywall called "Hard Stop Card", which is not one of the twelve
  paywall designs. The starter's own story should name a real one.
status: open
severity: low
origin: Story 5.20's Create (2026-09-26), the planning sweep: `epics.md:7622` against the A32 roster
  (`A32 Paywall - Spec.md:249-264`: #2 is Card). DW-157 covers other starter names, not this one.
owner: Story 11.11 (Ledger — business / finance publication), whose criteria carry its requirement word for word with
  its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 11.11 (the Ledger starter) — its own Create checks the
  composition against the finished library.")*
location: `epics.md` Story 11.11
reason: a starter is composed from the finished library, so the name is settled there, not here.

### DW-269: the deployed app gets its design files only by accident — `outputFileTracingIncludes` does nothing in a Turbopack build

plain: The live app reads its section designs, pictures and a few stylesheets from files that must be copied into
  each server function when we publish. The settings that were meant to list those files turn out to do nothing with
  the build tool we use, so the files only arrive because one page's code happens to point at them in a way the tool
  notices. On 2026-09-26 a harmless-looking change to that one line published a site where no editor could open, for
  about an hour, until the line was put back and a test now holds it.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `tools/check-traces.mjs` reads git's list of every file the canvas reads (the designs,
  the controls and paywall fixtures, Orbit Weekly's images and vendored cards, the reference tokens, the control
  register, `canvas-chrome.css`), resolves each route's `.nft.json` against its own directory and exits 1 naming route
  and file: /canvas, /pilots and both editor pages must carry the whole set, /controls and its frame the designs and the
  controls fixtures. CI's `check` runs it straight after `pnpm build`. `style-guide.ts` exports `PACKAGES` and
  `controls-review.ts` and `pilots.ts` import it — one finder — so /controls now carries its own files (none at HEAD).
  The inert `outputFileTracingIncludes` lists and the three text tests that held them are deleted; a catalogue row.
  Control: `PACKAGES` from `import.meta.url` → `pnpm build` exit 0 and the check exit 1 on all six routes ("100 of the
  101 files it reads are not in …"); restored, PASS on all six.
severity: high
origin: Story 5.20's Dev (2026-09-26), executed on production and on local builds. At `3a64da0b` and `d0c9ecda` every
  editor on app.inflozo.com threw `"a4/13" is not a design in packages/library/designs/` (Vercel's runtime log, read with
  the Vercel CLI; the editor walk timed out at step 2 four runs in a row). Vercel's `.vc-config.json` for the shared
  functions showed why: `canvas.func` shipped 638 files at Story 5.19's `dpl_Eo65rryxfzDWpYS5Wntd2EKYq1FM` and 266 at
  `dpl_AkwPJp773L7ib8BTcoDkF6YSMES7`, every `packages/` file gone (most routes, the editor's among them, are symlinks
  into `app.func`, one function for all of them). A local build of Story 5.19's commit in a worktree showed the source:
  only `/style-guide`'s trace carried `packages/**` (370 files), from `lib/style-guide.ts`'s
  `join(process.cwd(), '..', '..', 'packages')`, which Turbopack traces; the canvas and editor routes' own traces
  carried none. Story 5.20 had moved that line to `import.meta.url`, which Turbopack does not trace.
reason: Next 16.3.1's `collect-build-traces.js` applies `outputFileTracingIncludes` by iterating the build trace
  context's `entryNameFilesMap`, which only a webpack build produces, so every list in `next.config.ts` is inert under
  Turbopack; `pilots.test.ts`, `controls.test.ts` and `style-guide.test.ts` hold those lists complete, which proves
  nothing about what ships. Fixed for now at the one line: `style-guide.ts` finds `packages/` from the working directory
  first (the module address is the fallback for the render matrix, which runs from the repo root), `pilots.ts` imports
  it so the editor, `/canvas` and `/pilots` now carry the trace themselves (384 files each in a local build), and
  `style-guide.test.ts` holds the form. The real cure is a story of its own: a post-build check that the functions carry
  `packages/library/designs/**` (the `.vc-config.json` file map says it), or files that do not depend on tracing at all.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/next.config.ts` (`outputFileTracingIncludes`) · `apps/web/lib/style-guide.ts` (`PACKAGES`) ·
  `apps/web/lib/pilots.ts` · `apps/web/lib/controls-review.ts` (both `import.meta.url`, untraced)

## Deferred from: code review of spec-5-20-tier-bound-surfaces-and-the-paywall-editor.md (2026-09-26)

### DW-270: a live `tiers` post reads as locked for the paid View as visitor

plain: If one of your posts is open to some tiers only, the editor's "Paid member" preview shows it cut, although a paid
  reader with that tier would read it. Only the preview is wrong; the published site is Ghost's own.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `tiers` joins the include of the two reads `assemble`'s `seen()` re-reads
  `access` over — the subject's own (`subjectRead`, posts and pages) and a list page's (`feedRead`); Ghost's own
  frontend reads with the same three (`entry-lookup.js`, `fetch-data.js`). `entryRow` keeps them through `TIER_FIELDS`.
  `INCLUDE.posts` and the theme's `POSTS_INCLUDE` stay `tags,authors`, so no shim fixture is re-recorded. Executed
  read-only on both majors (MEASUREMENTS §64): Home's feed answered 200 with `tiers` on every row; a tier's
  `monthly_price_id`, `yearly_price_id` and `welcome_page_url` are dropped by the whitelist. No test site holds a
  `tiers` post, so the mapper's paid tiers are read in source; the live walk simulates one at Review (the include on the
  wire; no pilot design draws `access` yet). Control in `live-content.test.ts`, seen red against the unchanged library
  ("paid on the post's own canvas: actual false, expected true"): the include sent, `monthly_price_id` dropped, a paid
  visitor true and a free one false, on the post's canvas and in Home's feed.
severity: medium
origin: Story 5.20's review (2026-09-26). `postAccess` (`packages/library/src/access.ts`) blocks a `tiers` post whose
  `tiers` list is absent; the Content API posts read (`apps/web/lib/live-content.ts:123`, `INCLUDE.posts = 'tags,authors'`)
  requests no `tiers`, so every live `tiers` post arrives without one.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — a Story 5.x fix or the next live-content story; adding `tiers` to the
  include is one word, but the shim fixtures were recorded without it and would be re-recorded (`record-shim.py`, T1 and
  T3), which is why it is not a review patch.")*
location: `apps/web/lib/live-content.ts` (`INCLUDE`) · `packages/library/src/access.ts`
reason: a claim about the Content API's `include=tiers` on posts is a hypothesis until executed on both majors (standing rule 1).

### DW-271: two writers read-then-write the whole `site_settings` column

plain: The daily check and the Paywall screen's Re-check both rewrite the same stored record of your site's settings. If
  they land at the same moment, one can overwrite the other's part.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — closed with DW-65, by the same change: the daily check (`probeSite`) and
  the editor's re-read (`rereadSettings`) both write `site_settings` through `patchSite`'s compare-and-set, so neither
  can overwrite the other's keys; `site-settings.test.ts`'s second-writer test is this entry's collision, executed,
  and it went red with the `updated_at` filter dropped.
severity: low
origin: Story 5.20's review (2026-09-26). `readMembers` (`apps/web/server/site-probe.ts:204-221`) and `probeSite` both
  select `site_settings`, spread, and update — the shape Story 3.3 set; Story 5.20 adds the second writer.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/server/site-probe.ts`
reason: a jsonb merge in one statement (`site_settings || $1`) is an RPC or a raw update the PostgREST client does not offer
  directly; the window is milliseconds and a lost `members` key is re-read on the next open of the canvas.
also: **AMENDED 2026-09-26 by Story 5.21's Create.** The Paywall's re-read is widened to every key the settings payload
  decides (the members record, the Portal keys, the announcement) and the editor now makes it once each time it opens — a
  writer that runs without a press, on every open, beside the daily check. The window is still milliseconds, and what a
  collision drops is re-read at the next open.

### DW-272: `readMembers`' ownership refusal is pinned by a source-text test only

plain: The rule that Re-check refuses to look at a site that is not yours is checked by reading the code's text, not by
  running it.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Dev (2026-09-29) — the ownership refusal EXECUTES. The re-read's body moved into
  `server/site-settings.ts` as `rereadSettings({ admin, call, route }, userId, siteId)` — `readSettings` in
  `site-probe.ts` is now the wrapper that hands in `supabaseAdmin()` and the real `call` — so `node --test` loads it:
  for user B holding user A's site id, `call` is never reached, no write is attempted and the row is unchanged, with
  the owner's own re-read as the positive control. Red with the owned read moved after `call`, and red with its
  `.eq('user_id')` dropped. `server-wiring.test.ts`'s source-text order check follows it to `site-settings.ts`.
severity: medium
origin: Story 5.20's review (2026-09-26). `apps/web/server-wiring.test.ts:349-362` asserts the index of `.eq('user_id', …)`
  precedes `call({`; the live walk exercises Re-check on the caller's own site only.
owner: Story 5.24b (The sweep: accounts, sites and connections), one of the sweep's five stories (R-211), whose card
  names this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned — the next story that touches `site-probe.ts`: either
  an executing step in `run-verify-live-content.cjs` (a throwaway project pointed at the OTHER major's site row,
  Re-check refused, that row's `site_settings` unchanged) or the ownership read lifted into an injectable client.")*
location: `apps/web/server/site-probe.ts` (`readSettings`, 5.20's `readMembers`) · `apps/web/server-wiring.test.ts`
reason: RLS is not what guards this path (the service role reads), so the executing test is the only pin.
also: **AMENDED 2026-09-26 by Story 5.21's Dev.** `readMembers` is now `readSettings` (and `recheckMembers` `recheckSite`):
  the same one Admin `settings/` read, widened to every key the payload decides and run once each time the editor opens,
  so the path runs far more often. The source-text assertion followed the rename and gained a control (the old order —
  the chokepoint asked before the ownership read — fails it); the executing test is still owed.

### DW-273: the untouched box is always Ghost 6's recording

plain: Until you choose a design, the Paywall screen shows Ghost's own box as recorded from Ghost 6, even when your site
  runs Ghost 5. The two differ by one indent and read the same.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the untouched box is the linked site's own major's. `siteWith(read,
  settings, version)` sets `major` from the site's stored `ghost_version` through `versionVerdict` (5 or 6, else none),
  `read.ts` selects it, and `paywallPage` draws Ghost's box at it — the article stays Ghost 6's, its cards' stylesheet
  being Ghost 6's — with Ghost 6's as the fallback where no site or no version is known. Controls, red before the
  change: `paywall.test.ts`'s DW-273 case (a Ghost 5 site's box carries 5's indent) and `live-content.test.ts`'s
  `siteWith` case.
severity: low
origin: Story 5.20's review (2026-09-26). `SURFACE_MAJOR = '6'` (`apps/web/lib/canvas.ts:257`); the editor does not know
  the linked site's major (`EditorSite` carries no version).
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — Epic 7 reads the site's version at connect for the theme; the box can
  follow it then.")*
location: `apps/web/lib/canvas.ts` · `packages/ghost-shim/src/contract.test.ts` (the two recordings, node for node equal)

### DW-274: a placed ask's panel line speaks only for members off

plain: A placed sign-up section warns in its panel only when members are switched off entirely, while the Sites screen
  also warns when your site is invite-only, paid-only or has no Stripe.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-216: one list in `lib/paywall.ts` (`FACTS`: each fact, the asks it stops,
  the Sites screen's sentence) is read by both `membersNotice` and `askLine` (R-170). Members off gives 5.20's line for
  any ask. Invite-only and paid-only give the Sites sentence for a free ask. No Stripe gives the Sites sentence for a
  paid ask. When both facts stop the section's asks, both sentences show. A paid ask on an invite-only site says nothing
  yet — DW-305, Story 9.1. Control, red at HEAD: `paywall.test.ts`'s R-216 table case (expected "Only people you invite
  can join Orbit Weekly, so free sign-up forms show nothing there.", read `null`); 5.20's members-off case and its
  journeys stay green.
severity: low
origin: Story 5.20's review (2026-09-26). `askLine` (`apps/web/lib/paywall.ts:121`) reads `membersOff`; `membersNotice`
  reads all four facts. The story's I/O matrix binds the panel line to members off, so it is built as specified.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "the owner, if he wants the panel to say the same as the Sites screen — a
  question for a later story, not this one.")*
location: `apps/web/lib/paywall.ts`

### DW-275: the paywall's stylesheet rides in every canvas document, disabled

plain: The Paywall screen's article styles are sent with every editor screen, switched off, and only switched on for the
  paywall.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the Paywall's post-body sheet is no part of the canvas document. `pilots.ts`
  no longer inlines `surfaceCss`; both canvas routes answer `?sheet=surface` with it (`text/css`, the document's own
  caching; `surfaceSheetSrc` in `canvas.ts`). The editor's first Paywall paint inserts it as `<link
  data-order="2b-surface">` before the pilots' sheet — at the head's end where that sheet is absent — and paints nothing
  of the surface until the sheet has LANDED: its load or its error marks the link (`data-landed`) and paints again.
  Controls: `pilots.test.ts` (no surface CSS in the document; the routes answer the sheet); a journey stop — Home's
  canvas carries no post-body sheet; with the sheet held in flight a repaint (View as) draws no article; once it lands
  the first Paywall paint is styled, at the cut — red at HEAD, and its held-sheet arm red with the gate planted back to
  the link's presence. The editor walk's two selectors follow (`[data-order="2b-surface"]`).
severity: low
origin: Story 5.20's review (2026-09-26). `apps/web/lib/pilots.ts:132` inlines `surfaceCss()` with `media="not all"` on
  every canvas; the matrix's narrowed documents leave it out.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned")*
location: `apps/web/lib/pilots.ts` · `apps/web/lib/style-guide.ts` (`surfaceCss`)
reason: one stylesheet, one document, and the editor never reloads the canvas document to switch surfaces; loading it on
  the first surface paint is the upgrade if the size ever matters.


### DW-276: a corner design and Ghost's floating button share the bottom-right corner, and no rule settles which moves

plain: Ghost's own Subscribe button floats in the bottom-right corner of every page where the site owner has switched it
  on. Two designs in the library put their own box in that same corner by default — the Toast announcement bar (A2 #11)
  and the Slide-in Card (A22 #14). Story 5.21 draws Ghost's button on the canvas, so the overlap is visible while
  designing, but nothing decides whether the design's default corner changes or whether the editor says anything.
status: open
severity: low
origin: Story 5.21's Create (2026-09-26). `reconcile-designs.md:2755,2776` (a record) found FR-H5(1)'s collision with "no
  owner"; `A2 Announcement Bars - Spec.md` gives #11 Toast "bottom right", 24px from both edges, and neither it nor A22
  #14's spec names the button. Portal's box is 98px tall at `bottom: 0; right: 0` (Portal 2.69.339 `frame.jsx`,
  2.51.5 the same), and Story 5.21 records it as MEASUREMENTS §55.
owner: Stories 9.7 (A2 — designs #9–11) and 10.78 (A22 — designs #2, #14, #15 and #16 (owner gate)), whose criteria each carry the
  corner decision word for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 9.7 (A2 #9–11) and
  Story 10.78 (A22 #13–16) — each category story decides its corner design's default against the button Story 5.21
  draws.")*
location: `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/A2 Announcement Bars - Spec.md` (the export,
  read-only — the story writes its decision into its own spec) · `apps/web/lib/ghost-surfaces.ts`
reason: sections-inventory A2's own rule — "No warning is needed once the thing being warned about is on screen" — keeps
  the editor silent, and 5.21 puts it on screen. What remains is a design default, which is the category's.

### DW-277: Inflozo assumes Ghost's floating button is ON when it cannot read the setting, but Ghost's own default is OFF

plain: When Inflozo cannot read whether a site shows Ghost's floating Subscribe button, it asks the site owner and assumes
  "yes" until they answer, because the PRD says Ghost switches the button on almost everywhere. Ghost's own code switches
  it OFF on a new site, on both versions Inflozo supports, and both test servers have it off. No site we know hides the
  setting, so the question has never been shown to anyone.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02), R-215: `portalState`'s unreadable branch is `false`/`'default'`, Ghost's own
  default (`default-settings.json`, both majors), and its comment is rewritten. The Sites question makes "No, it's off"
  the primary, which is the stored assumption. `answerPortal` and `storedSurfaces` read no assumed value and are
  unchanged. The admin walk's `portal-question` finds "Yes" by its words and asserts it is the second answer. Layers
  lists a Ghost surface only while the site shows it: `rowsOn` gives the bar when `announcementFor` holds for some
  visitor (`isFilled`), and the button when `portalFor(…,'anonymous')` draws it. The editor's `ghostRows` is filtered by
  it and is undefined when empty; a chosen row is let go when a re-read removes it, and a hidden id is kept. Controls,
  red at HEAD: `probe-rule.test.ts`'s unreadable cases ("portal_button = undefined should be assumed off"; the
  default-over-default case expected `false`, read `true`); `ghost-surfaces.test.ts`'s `rowsOn` case (`rowsOn is not
  defined`); the DW-279 journey, extended — no From your Ghost site group before the held answer, both rows after — red
  at HEAD. A row stored before this story with the button assumed on draws until the site's next re-read.
severity: low
origin: Story 5.21's Create (2026-09-26), read in Ghost's source: `default-settings.json` gives `portal_button` the
  `defaultValue` `"false"` (5.130.6 :338-344, 6.58.0 :409-415), and nothing in `core/server` sets it on at setup or in a
  migration. T1 and T3 both answer `false` (MEASUREMENTS §39). PRD §1.2 item 2 ("on by default on essentially every site")
  and FR-C2's reason for defaulting the ask to on carry the opposite; Story 5.21's Docs task corrects their wording and
  leaves the ask as ruled.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "the owner, if a Ghost that hides `portal_button` is ever met — the ask's
  recommended answer and the stored assumption (`portalState`'s `true` with `'default'`) would then become "No, it's
  off".")*
location: `apps/web/lib/probe-rule.ts` (`portalState`, `PORTAL_COPY`) · `apps/web/app/(app)/app/(authed)/sites/site-notices.tsx`

### DW-278: the canvas draws Ghost's default icon on the floating button, whichever icon the site chose

plain: Ghost lets a site pick one of five icons, or upload its own, for its floating Subscribe button. The canvas always
  draws Ghost's default person icon. The button's size and place are the same either way, and those are what the canvas
  shows it for.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `portalState` stores `portal_button_icon` — one of Portal's five presets
  (`PORTAL_ICONS`), an `https:` URL through `imageUrl`, else null — and `storedSurfaces` re-checks it as
  `Surfaces.portal.icon`, which `portalFor` passes. `buttonMarkup` draws Portal's own rule: no glyph for text-only; the
  person at 34px for a member; a preset's own 24px white SVG; the site's image as `<img>` 26×26 `alt=""` through
  `escapeUserText`; else the person (26 beside a label, 34 alone). The five SVGs are held per commit, byte for byte, to
  `record-ghost-surfaces.cjs`'s new `portal.icons` recording on both majors, run in the main session on the owner's go
  (MEASUREMENTS §67): each preset an SVG drawn 24 × 24, identical on 5.130 and 6.58, and both sites read back as found —
  T3 `icon-5`, T1 null, `portal_button` false. The recording also lets `tokens.test.ts` admit icon-2's `#FFF`. Controls,
  red at HEAD: the preset case (`width: 26px` read where 24 was wanted); the image case (no `<img>`); the storage case
  (`PORTAL_ICONS is not defined`); and, until the recording, the recorded-icons case ("NO RECORDING … Capture it") and
  `tokens.test.ts` ("writes #FFF, which Ghost put on no recorded page"), both green once it landed. An uploaded image is
  read in Portal's source only.
severity: low
origin: Story 5.21's Create (2026-09-26), read in Portal's source (2.69.339 `trigger-button.jsx`, 2.51.5 `TriggerButton.js`):
  `portal_button_icon` null draws `user.svg` (26px beside the label, 34px alone); `icon-1` to `icon-5` are 24px SVGs; any
  other value is an `<img>` at 26×26. The snapshot does not store the icon.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "unowned — a routine call of Story 5.21's planning
  (ponytail: the choice moves no edge by more than 2px). The five presets and a custom image are the upgrade.")*")*
location: `apps/web/lib/ghost-surfaces.ts` · `apps/web/lib/probe-rule.ts`

### DW-279: a re-read that lands and redraws Ghost's two surfaces is proven only by the hand-run live walk

plain: When the editor opens it asks the linked Ghost site for its settings again and redraws the announcement strip and
  the floating button from the answer. The automatic tests that run on every commit never see that answer — the keyboard
  harness has no database, so every one of its re-reads is refused and the tests can only check that the old drawing
  stays. Only the live walk on ghost6, run by hand for each story, sees a real answer redraw them.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `Editor` gains one prop, `reread` (`recheckSite` unless named), and the keyboard
  harness names its own `'use server'` `harnessReread` (`harness/editor/actions.ts`): refused outside the harness, it
  answers `{ members: null, surfaces }` only for the harness project under `x-inflozo-harness-site: surfaces-later` — a
  linked site whose stored snapshot is empty — and it reads `projectId`, which the journey finds the re-read by; the
  site fixtures moved to `sites.ts`. The journey's DW-279 stop holds the re-read until the empty snapshot has painted no
  shim, releases it, and polls for both shims drawn. Control, red: the re-read's `drawShims(doc)` cut.
severity: medium
origin: Story 5.21's Review (2026-09-26), the Verification Gap layer: deleting the redraw in `recheck()` keeps `pnpm check`
  and `pnpm keyboard` green. The keyboard journey counts the re-read's POST and asserts the stored snapshot stays drawn
  when it is refused; `run-verify-live-content.cjs`'s (B) phase on T1 is the one place a landed answer is observed (R-82).
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the story that next touches the harness's site header — a second
  harness snapshot handed on the second request, or a harness-only answer for `recheckSite`, so one `pnpm keyboard`
  journey sees the button appear after a landed re-read.")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`recheck`) · `apps/web/app/(app)/app/harness/editor/layout.tsx` · `tools/keyboard/journey.spec.mjs`

### DW-280: the settings mapping writes the announcement and the brand over the snapshot even when the payload omits them

plain: Every time Inflozo reads a site's settings from Ghost — on connect, in the daily check, and now every time the
  editor opens — it writes the announcement bar and the brand colour into its saved copy from what Ghost sent. If Ghost's
  answer is the right shape but happens to leave those keys out, the saved copy gets "nothing" written over a good value.
  The member switches have a guard against exactly that; the announcement and the brand do not.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `settingsPatch` guards per key: a key Ghost sent is a reading, and an absent
  key keeps the stored field. This covers the announcement's three and the brand's three (one key map each, read by the
  reader and the guard alike), and the code-injection flag (one stored boolean over two keys: a reading when either half
  carries code or both halves were sent). By the same rule it also covers the button's look (style, label, icon).
  `members`' guard was the shape. A first read with nothing stored writes the readers' nulls as before, and a pre-DW-71
  brand still loses its readerless keys. Control, red at HEAD: `probe-rule.test.ts`'s DW-280 case — a well-formed
  payload missing those keys wrote `{content:null, background:null, visibility:null}` over the stored announcement.
severity: low
origin: Story 5.21's Review (2026-09-26), the Blind Hunter: `settingsPatch` writes `announcement: announcementOf(settings)`
  and `brand: brandOf(settings)` unconditionally — `probePatch`'s behaviour since Story 3.3, so pre-existing, but the
  mapping now runs on every open of the editor. `settingsReadable` guards the browse shape, not the presence of each key;
  no Ghost read on T1 or T3 has ever omitted them (MEASUREMENTS §39, §55).
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned until a Ghost that omits a public settings key is met; the fix is
  `membersOf`'s shape for each — leave the previous value standing where the key is absent.")*
location: `apps/web/lib/probe-rule.ts` (`settingsPatch`, `announcementOf`, `brandOf`)

## Deferred from: Story 5.22's Create run (2026-09-27)

### DW-281: the Layers rail and the Layers rows draw one generic mini-thumbnail, where D8a draws one per category

plain: On a tablet, or in a narrow window, the Layers list becomes a strip of small tiles, one per section. The drawing
  shows each tile as a tiny picture of its kind of section: a header bar, a hero, a grid of posts, a newsletter box, a
  dark footer. What gets built is the one small tile the Layers list already shows beside every row, the same for every
  section. The section's name is on the tile's hover and read out by a screen reader, but a finger cannot hover.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `LayerThumb` takes a glyph per category (`components/kit/layers-row.tsx`,
  `ThumbGlyph`, `data-glyph`): A1 Header, A4 Hero, A17 Post Grid, A22 Newsletter and A3 Footer, drawn as `S4
  Editor.dc.html:54-58` draws them at 30×21; the rail draws D8a's 34×24 and D8b's 26×19, the selected tile's border D8's
  tint. Every other category, the fixtures and Ghost's rows draw Hero's. Colours are the token layer's (`line`,
  `line-strong`, `ink`, `coral`, `ink-soft`; the Footer's dark ground `ink-hover`; the tint `coral-tint-strong`), never
  a new one. `LayerRow` and `RailItem` carry `category`. Epic 9's and Epic 10's preambles gain the rule: a category's
  first story adds its Layers picture. Control: a journey stop at 1440 (rows) and 1024 (rail) — each thumb's
  `data-glyph` is its kind's — red at HEAD (every thumb Hero's).
severity: low
origin: Story 5.22's Create (2026-09-27).
  - `D8 Editor Below 1440.dc.html:66-70` draws five different 34 × 24 thumbnails: Header, Hero — Split Editorial, Post
    Grid — Magazine, Newsletter — Split, Footer — Mega Grid.
  - The Kit has one glyph, `LayerThumb` (`apps/web/components/kit/layers-row.tsx:111`). It is Hero's, and every
    Layers row has drawn it since Stories 1.3 and 5.4.
  - The rail reuses it rather than inventing thirty-odd category glyphs the export never drew.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24, the deferred-work sweep (R-207, owner, 2026-09-27). *(Story 5.23's
  Create, 2026-09-27: every story this line named is done. Was: "unowned. The owner's test of Story 5.22 decides whether
  it matters. - Upgrade A: a glyph per category, drawn from the category's own `-0 Category Proof` frame. - Upgrade B: a
  real miniature, rendered as the Section Picker renders its cards.")*")*
location: `apps/web/components/kit/layers-row.tsx` (`LayerThumb`) · the rail in
  `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`

## Deferred from: Story 5.22's Dev run (2026-09-27)

### DW-282: selecting the Newsletter section logs React's "two children with the same key" warning

plain: When the Newsletter section (Inline Row) is chosen, the browser's developer console prints a warning that two
  controls in its settings panel share one internal name. Nothing on screen is wrong today, but React says it may drop
  or duplicate one of the two controls in a future version, and the warning hides real ones.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the read-only panel's keys carry their kind — `read-prop-…` and
  `read-control-…` — so a design that declares a prop and a control of one name (the Inline Row's `blurb`) draws both
  rows with no duplicate key. Control: a journey stop on the Inline Row as a reader, no duplicate-key warning — red at
  HEAD ('…read-blurb').
severity: low
origin: Story 5.22's Dev (2026-09-27), found while driving the compact editor in the keyboard harness and confirmed
  PRE-EXISTING by choosing the same section at 1440 on the full layout, which 5.22 does not touch: `sidebar.tsx:458-459`
  keys a prop's row `read-${r.path}` and a control's row `read-${r.name}`, and a22/1 declares a prop and a control of the
  same name (`blurb`), so both rows get `read-blurb`.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned — the fix is a kind prefix in the key (`read-prop-…`, `read-control-…`),
  which moves nothing on screen.")*
location: `apps/web/components/controls/sidebar.tsx` (the rows' `ReadOnly` keys)

### DW-283: on the Paywall canvas, a touch tablet narrower than about 628px with members switched off pushes ⋯ off the bar

plain: On a small Android tablet held upright (about 600–627 pixels wide), the Paywall screen's top bar has one thing too
  many when the site's members are switched off: the ⋯ button at the right edge is pushed partly off the screen. Every
  other screen, and the Paywall itself on anything 630 pixels or wider, fits.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the Paywall's MEMBERS OFF chip is whole or absent — `shrink-0` and
  `compact:hidden` — so no control of the bar leaves the window. Control: `floor.spec.mjs`'s DW-283 stop on a 600-wide
  touch tablet, members off — red at HEAD (a bar control outside the window).
severity: low
origin: Story 5.22's Dev (2026-09-27), measured in the harness across widths: the bar's grid keeps every control out of
  the centred group by construction, the name and the MEMBERS OFF chip give way first, and the NOT A PAGE SECTION chip is
  not drawn below 1280 — but the fixed controls — the way back, the save state, undo and redo, Template and View as (which
  never shrink), and ⋯ — with the MEMBERS OFF chip's own padding need about 628px with D8a's 6px spacing (it was about
  654 while the NOT A PAGE SECTION chip still shrank beside the name, re-measured after it was made whole-or-absent).
  Home fits down to 600. The AC's floor is 720, and every width from 720 up passes (`floor.spec.mjs`, the journey at 720).
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "unowned until a tablet under 660px wide meets the Paywall; the options are the
  owner's (R-143 keeps undo and redo in the bar, and "never shrink or relabel" keeps Template and View as whole).")*
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (the bar)

### DW-284: the deployed editor walk's step 90 read the "looked at" record before its own writes had landed

plain: One automated check of View as — "the database remembers which visitors you have looked at" — failed once and
  passed on the next run of the same build. The record was behind by more than ten seconds, then caught up: the check
  waited for it and gave up too soon, or the save was slow that once. Nothing a customer does is affected: a record that
  arrives late, or not at all, only brings back a reminder dot, which is the design.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): step 90 reads the record only once no server action of the page is in flight
  — `actionsSettle(30000)` (a Set of `next-action` POSTs, quiet for 500 ms, naming any still in flight at its deadline)
  — then polls. Control (LOCAL RUNs against production): each `"states"` POST held 12 s — HEAD FAILS with this entry's
  own shape (`member_states_viewed` `["anonymous","paid"]`, Free's write still queued) and the new walk PASSES with
  `stillInFlight []`. Held 4 s and 6 s, HEAD's ten-second poll still caught the writes, so the spec's 4 s was lengthened
  until the old wait failed.
severity: low
origin: Story 5.22's Dev (2026-09-27), the deployed walk at `9212ecc4` (`dpl_2KBTPyRQXjqA3jL5CCND6o61EzYB`), its second run
  there: **2 FAIL, 657 PASS** — `project_template_prefs.member_states_viewed` still `["anonymous"]` after the walk's
  ten-second poll, while the session had already recorded all three visitors (its own menu carried no dot), and after the
  reload the menu dotted `free` alone, so Paid's write had landed by then and Free's had not. The runs before and after
  on the same app code passed it (`765cdbde`, and `9212ecc4`'s third run: **0 FAIL, 659 PASS**).
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned — whoever next touches the View as record (`recordViewed`'s
  one write chain, a queue of server actions) or the walk's step 90.")*
location: `tools/probe/run-verify-editor.cjs` (step 90, the `storedViewed90` poll) · `recordViewed` in
  `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx`
reason: Story 5.22 changes neither the record nor its writes. Telling a slow write from a short poll needs its own look —
  the write chain is serial by design ("a refused write rides the next one"), and a reload drops what is still queued —
  not a guess inside a Dev run.

## Deferred from: code review of spec-5-22-the-editor-s-responsive-floor.md (2026-09-27)

### DW-285: the phone notice's avatar is checked only by the hand-run deployed walk

plain: The small card a phone shows carries the user's initial in a circle at the top right. Whether it is still there is
  checked only when someone runs the deployed editor walk by hand; the automated gates cannot see it, because their
  editor has no signed-in user.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `ShellUserContext` is exported, the keyboard harness wraps `<Editor>` in it with a
  fixture user (`harness@example.com`, no display name), and the floor's phone stop asserts D4f's avatar reads "H" at 32
  × 32. Control, red: the provider removed.
severity: low
origin: Story 5.22's review (2026-09-27). `SmallScreenNotice` draws the avatar from `useShellUser()`, which the shell
  provides on the editor path (`apps/web/components/shell/shell.tsx`); the keyboard harness sits outside the shell, so
  the branch never renders there, and `run-verify-editor.cjs` step 97 is the only assertion.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned — the next story that touches the harness editor layout or
  the shell.")*
location: `apps/web/components/editor/small-screen-notice.tsx` · `apps/web/components/shell/shell.tsx` ·
  `apps/web/app/(app)/app/harness/editor/layout.tsx`
reason: closing it means the harness layout handing a fixture user through the same provider, the harness header's
  pattern; a small change to a shared harness, outside a review's patch scope.

### DW-286: a dark override a design only remembers is invisible to the moon, the row and Theme settings' count

plain: Since Story 5.23 a section remembers each design's dark settings when you move it to another design. Suppose
  every dark override a project has is remembered in that way and none is in use. Theme settings then says "Nothing to
  clear", and the moment a section goes back to its design, the dark override is there again. Clear itself removes the
  remembered ones too, but it is only offered while at least one override is in use. No customer can reach this today,
  because every shipped design has only one version.
status: open
severity: low
origin: Story 5.23's Dev (2026-09-27), R-205. `clearDarkOverrides` now empties every record's dark map, and the
  project-level Clear visits a section through `holdsDarkOverride` (live or remembered). What OFFERS a clear still asks
  what is in force: the panel row and the `⋯` item read `darkOverridesInForce`, and Theme settings reads D6a's
  `darkOverrideCount`, which counts only what an emitter could use. Executed on production the same day: 0 of 33
  sections hold any record.
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose criteria carry its requirement word
  for word with its id (R-195). *(Story 5.24a's Dev, 2026-09-28: was "Story 9.1 — A1's designs #1–4 are the first
  shipped ring, so it is the first story in which a customer can hold a remembered override. It decides whether "Nothing
  to clear" names them or the count includes them, which is a D6a surface question for the owner in R-83's shape.
  Confirmed by the owner at Story 5.23's review (option 1, 2026-09-27): Story 9.1 decides.")*
location: `apps/web/components/controls/sidebar.tsx` (`darkOverridesInForce`, the row's "Nothing to clear") ·
  `apps/web/app/(app)/app/(authed)/projects/[id]/settings/theme-settings.tsx` (`n === 0`) ·
  `packages/section-runtime/src/doc-edit.ts` (`darkOverrideCount`, `holdsDarkOverride`)
reason: Story 5.23 draws nothing differently (its Boundaries: "No surface changes"). Counting what is remembered would
  change D6a's sub-caption and the row's availability, which are surfaces with frames, so it is not a Dev call.

### DW-287: the deployed controls walk can die on a reload that waits for the network to go quiet

plain: The automatic check that walks the Controls review page on the live site stopped once, part-way, because a page
  reload waited 30 seconds for the network to go completely quiet. Nothing was wrong with the page. The same walk passed
  in full when run again, so the only cost is a re-run.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): no walk waits for a quiet network. The controls walk's four `networkidle`s
  and the pilots walk's two are `load`, each already followed by its own landmark wait; the passkeys walk's seven go
  through `land()` — `load`, then Next's `next-route-announcer`, which the App Router appends from an effect, so it
  marks hydration (the handlers the presses after it need). Control, LOCAL RUNs against production with one request held
  open on every page so the network never goes quiet: HEAD's controls and pilots walks each die at their first load
  (`page.goto: Timeout 30000ms exceeded … waiting until "networkidle"`), and the new ones pass whole — controls 0 FAIL /
  115 PASS, pilots 0 FAIL / 152 PASS; `land()` against `networkidle` on `/sign-in`: 586 ms with the passkey button
  drawn, against a TimeoutError at 30 s. The passkeys walk itself flips production's passkeys flag, so it runs whole at
  Verification. **Review (2026-10-01):** it ran whole on the deployed build, all steps passed. Two corrections. "No walk
  waits for a quiet network" is true of the five deployed walks; `run-verify-ghost-admin.py`'s `ownership` step keeps
  one `waitForLoadState('networkidle').catch(() => {})` on purpose — it is swallowed, so it cannot kill the run, and it
  is the only thing between a forged form post and the read that proves nothing was written. And `networkidle` had been
  hiding a wait the controls walk never had: its landmark was the sample's markup, the runtime sets the picture's address
  after the frame loads, and step 2 read "canvas range 0px" one clean run in three; the landmark is now the picture
  loaded (red every time with the picture held 3 s, green fixed).
severity: low
origin: Story 5.23's Dev (2026-09-27), the walk against `9263b6e3`. Run 1 was a HARNESS ERROR, `page.reload: Timeout
  30000ms exceeded` at `run-verify-controls.cjs:472` (step 18's reload), with 0 FAIL and 85 PASS before it. Run 2 was
  0 FAIL, 114 PASS. The run before the push, at `2973a798`, passed that line.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24 — the sweep (R-207) — or the next story that edits the
  walk.")*
location: `tools/probe/run-verify-controls.cjs` — the `goto` and `reload` calls that pass `waitUntil: 'networkidle'`
  (lines 79, 82, 472 and 513 at `9263b6e3`)
reason: `networkidle` waits for 500 ms with no request in flight, which a live page does not promise. The two reloads
  (472, 513) are already followed by a `waitForFunction` on the sample's own markup, so `waitUntil: 'load'` would lose
  nothing there. The two `goto` calls (79, 82) would each need a wait for their own landmark first. Not changed here:
  it is not this story's step, and a walk edited in the same commit it verifies proves less.

## Deferred from: code review of spec-5-23-the-play-loop-gate.md (2026-09-27)

### DW-288: a remembered record for a design the library no longer holds is kept, and nothing says so

plain: A section remembers the settings of every design it has been shown as. If a design is ever removed from the
  library, the settings remembered against it stay in the section's saved page, harmless and unused. That is fine, but
  no comment or test says it is on purpose.
status: done 2026-10-01 (Story 5.24c)
resolution: Story 5.24c's Dev (2026-10-01): `doc-schema.ts`' `parkedControls` comment says a record under a design id the library no longer holds is kept, never drawn and never pruned — `switchControls` carries it, and a swap to that id is refused. Test (`doc-edit.test.ts`, DW-288): a record under `a17/9` survives `parseDoc`, a swap and a return, and the swap to it answers the refusal; it pins intended behaviour, and its control — dropping unknown records in `switchControls`' copy loop — turns it red.
severity: low
origin: Story 5.23's review (2026-09-27). `parkedControls` is keyed by design id (`doc-schema.ts`) and a record is
  written for every design left (R-205); `isDesigned` and `read.ts` look only at the live `designId`, so a stale key is
  never read and never pruned. Pre-existing since Story 5.11, wider since R-205 because every visited design now leaves
  a record.
owner: Story 5.24c (The sweep: the section runtime, the library and the recordings), one of the sweep's five stories
  (R-211), whose card names this entry. *(Story 5.24a's Dev, 2026-09-28: was "unowned — the first story that retires a
  design from the library (Epic 9 onward) says whether a stale record is pruned on parse or kept, with a test either
  way.")*
location: `packages/section-runtime/src/doc-schema.ts` (`parkedControls`) · `packages/section-runtime/src/read.ts`
reason: no design has ever left the library, so there is nothing to execute the claim against; a sentence and a test
  belong beside the first removal, not in a review patch.

## Deferred from: code review of spec-5-23a-the-canvas-redraws-only-what-changed.md (2026-09-28)

### DW-289: the 3-second trace passes or fails on the share of frames dropped, while NFR-1 is worded as a p95 frame time

plain: The speed test counts how many screen refreshes were skipped in 3 seconds and passes if 5 in 100 or fewer were.
  The requirement is written as "95 of 100 frames take no longer than one refresh". Usually those agree, but not always:
  one long stall skipping nine refreshes passes the count and fails the requirement as written. Story 5.23b, which has to
  make the test pass, should say which reading is the bar.
status: closed
closed: 2026-09-28 — Story 5.23b's Dev: BOTH readings are the bar, with the longest task beside them. `fps-trace.mjs`
  counts each frame in whole refreshes, `n = max(1, round(Δ/16.67))`, and a run PASSES only when the p95 frame is at most
  ONE refresh (NFR-1's own words: at most 5% of frames took longer than one), at most 5% of refreshes are dropped (the bar
  that weighs a long stall: one frame of nine refreshes is one frame in the p95's count and nine in this one) and no task
  tops 50 ms. Each is printed per run, the raw p95 in milliseconds beside its count, and the header's METRIC paragraph
  says why. After the story at 4× on this computer every run passed all three — 2.8% to 4.4% (8, 7 and 5 of 180), the p95 frame ONE refresh in every run, and no long task at all.
severity: low
origin: Story 5.23a's review (2026-09-28). `tools/perf/fps-trace.mjs` gates on `share <= DROPPED_MAX` and prints the
  raw p95 "for the record"; its header derives the one from the other because headless rAF reads 16.6–16.8 ms on a
  smooth frame, so a raw p95 compared to 16.7 would flap. The Design Notes of 5.23a's spec state the mapping.
owner: Story 5.23b (R-208) — it carries NFR-1's pass, so it says whether the trace gates on the dropped share (with the
  reason recorded in NFR-1's row) or on the raw p95 with a stated tolerance, and prints both either way.
location: `tools/perf/fps-trace.mjs` — `DROPPED_MAX`, `measure()`, the header's "THE METRIC" paragraph
reason: the pass is not this story's (R-208), and the trace already prints both figures, so nothing is lost by deciding
  it where the pass is owed.


## Deferred from: planning of spec-5-23b-the-editor-s-panels-redraw-only-what-changed-at-60-fps.md (2026-09-28)

### DW-290: the first section picked in a session stalls the editor for a quarter of a second on the slowed test

plain: The first time you pick or point at a section after opening a page, the editor prepares the outlines and name
  tags it draws on the canvas, and that preparation freezes it for about 0.25 seconds on the slowed-down test computer
  (about 0.06 seconds at normal speed). It happens once per page opened, before the speed test's clock starts, so the test
  never sees it.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the chrome's faces and sheet are prepared in idle time after a paint —
  `prepareChrome(doc)` (`addFonts` and `sheetFor`, `lib/canvas-layer.ts`), which `chromeLayers` also calls, scheduled by
  an effect on the paints with `requestIdleCallback`, else a 1 ms timer (Safari lacks it), and cancelled on cleanup;
  never before the first paint or into a document with no `#canvas`, nor into a window already closed. It adds nothing
  to the DOM. Control: a journey stop — after the paint and before any gesture, the canvas's `document.fonts` holds the
  `inflozo-chrome` faces with no chrome host drawn — red at HEAD. `tools/perf/fps-trace.mjs` now prints the first
  selection's longest task, for the record: at 4× on the production harness build, 193 ms and 192 ms at HEAD `3c88798f`,
  75 ms and 74 ms on this tree (two runs each, every run passing NFR-1's three bars); the Controls panel's first mount
  stays in it. Not a gate (NFR-1).
severity: low
origin: Story 5.23b's planning (2026-09-28), measured at 4× CPU throttle on a production harness build of `790b4d6e`: the
  session's first selection is a 248–255 ms long task; with the chrome's font faces left out (`addFonts` in
  `chromeLayers`, a scratch edit) 141–149 ms. Adding faces to the canvas document's `FontFaceSet` invalidates the whole
  40-section canvas's layout; the rest is `sheetFor` copying every editor rule into the chrome's sheet, and the Controls
  panel's first mount. Story 5.23a's planning had seen it as a 193 ms "first hover" and named Story 5.23b; 5.23b's criteria
  are re-renders and the warm trace, so it is handed on here rather than dropped.
owner: Story 5.24e (The sweep: the editor), one of the sweep's five stories (R-211), whose card names this entry.
  *(Story 5.24a's Dev, 2026-09-28: was "Story 5.24 (R-207) — prepare the chrome's faces and sheet before the first
  gesture (the canvas document's own load, or declared with it) and measure the first selection before and after at
  4×.")*
location: `apps/web/lib/canvas-layer.ts` — `chromeLayers`, `addFonts`, `sheetFor`; `editor.tsx` — the chrome effect that
  calls `chromeLayers` on the first selection or hover (`:3369-3381` at `790b4d6e`)
reason: not a re-render and outside NFR-1's warm trace, so it is not 5.23b's to fix inside its one goal; it has a cause,
  a number and a named owner.

### DW-291: the deployed walk's step 89 reloads on a fixed wait and can race the save of the preview subject

plain: One check in the automatic test of the live site picks a different article to preview, waits a fixed moment,
  reloads the page and expects the pick to have stuck. On one run of two it reloaded before the save had reached the
  database, so it reported the old article — although the save itself landed a moment later and the next check read it
  from the database. A test that waits a fixed time instead of waiting for "Saved" can fail when the live site is slower
  than usual.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): step 89 waits for the condition its reload means — `actionsSettle(30000)`,
  then a poll of the stored row until its slug matches — and only then reloads. Control (LOCAL RUNs against production):
  the subject save held 12 s — HEAD FAILS ("the choice survives a reload" reads the previous article and the row still
  holds its slug) and the new walk PASSES with `inFlight []`. The spec's 4 s hold did not turn HEAD red (the checks
  between its click and its reload outlast it), so it was lengthened.
severity: low
origin: Story 5.23b's review (2026-09-28), the real-infra verifier's walk of `app.inflozo.com` at `c390a9f4`
  (`dpl_2gehzsrgQWhuGfNVv7Vmuwe9cmh7`): run 1 passed step 89 (then died on a harness timeout at step 79), run 2 printed
  `1 FAIL, 664 PASS` — step 89, the pill still naming the previous subject after a 600 + 1200 ms wait and a reload, while
  the very next check read `preview_subject.slug` of the new choice from PostgREST. `chooseSubject` is line for line the
  same as at `bc51ecbd` and the story's diff has no mention of `preview_subject`.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry. *(Story 5.24a's Dev, 2026-09-28: was "the next story that touches `run-verify-editor.cjs` — step 89 waits
  for the save to settle (the "Synced" state, or the PostgREST read it already makes) BEFORE the reload, as the walk's
  other round trips do.")*
location: `tools/probe/run-verify-editor.cjs` — step 89 (`:4295` at `c390a9f4`)
reason: the write path is untouched by 5.23b and the same line has failed once in two runs (the twice-dying rule of the
  editor-harness note); hardening the walk is not this story's goal, and the finding has a cause, a reproduction and an owner.

## Deferred from: Story 5.24a's Dev push (2026-09-28)

### DW-292: the keyboard gate's 5.23b ⌥↓ stop counted a Design-block redraw on CI that it never counts here

plain: One of the automatic keyboard checks moves a section down in Layers and then counts which parts of the editor
  redrew. On one CI run it counted the settings panel's Design block once, although nothing in it changed — and the same
  check passes every time on this machine. That one red check stopped a push from publishing; the next push re-ran it.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the cause, measured — after a selection the Design block's three tiles draw 320–420 ms
  later, each commit counted under `<Profiler id="design">`, and `panelsSettle` (two frames and 150 ms) ends about 370
  ms after the press: a race. `rendersSettle` (every on-screen tile's frame drawn, then the counts still for three
  frame-plus-50 ms ticks) replaces it in the six render-count stops; R-210's stops keep theirs. Control: with the tile
  previews slowed 800 ms (a slower runner), the old settle failed 4 of 4 with CI's own message ("nor its Design block")
  and the new one passed 4 of 4; the whole 5.23b describe passed 48 of 48 on `--repeat-each 4`, and the full gate 126 of
  126.
severity: low
origin: Story 5.24a's second Dev push, `3ddf52e4` (2026-09-28): CI run 36449972851's `check` failed at `pnpm keyboard`,
  119 passed and 1 failed — `tools/keyboard/journey.spec.mjs:3953`, "⌥↓ on the selected row redraws at most the two
  rows that swapped — the Controls panel does not", `drawn['design']` 1 where 0 is expected (`:3967`) — and `deploy`
  was skipped. That push changed no app or package code, only documents and `tools/doc-audit.py`; the push before it,
  `fe8ce5ef`, carries the same app code and passed the gate in CI run 36447808855. On this machine the stop passed 12 of
  12 (`--repeat-each 12`) and the whole gate 120 of 120. A second sighting the same day, read at 5.24a's review: the
  Hotfix push `1f89f648` (no app change) failed `check` at `pnpm keyboard` too, CI run 36435981407.
owner: Story 5.24d (The sweep: the checks and the walks), one of the sweep's five stories (R-211), whose card names
  this entry.
location: `tools/keyboard/journey.spec.mjs` at `4784b1a4` — the stop at `:3953-3968`; `panelsSettle` (`:66`, two frames
  and 150 ms) and `resetRenders` (`:3885`)
reason: not reproduced, so the cause is a hypothesis: the settle before `resetRenders` is a fixed wait, and a render
  the selection caused could land after it on a slower runner and be counted as the ⌥↓'s. The stop should wait for the
  condition it means — no render pending — rather than a fixed moment, which is Story 5.24d's goal.

## Deferred from: Story 5.24b's Create (2026-09-29)

### DW-293: a signed-in user can still create a site record straight through the database, skipping connect

plain: Connecting a site checks the address, counts your sites against your plan and asks Ghost before anything is
  saved. But the database still lets a signed-in person add a site record directly, with any address, by calling it
  with their own sign-in ticket — a door left from before connecting moved onto the server. Nothing in the app uses it;
  it should be shut.
status: done 2026-09-29 (Story 5.24b)
resolution: Story 5.24b's Schema phase (2026-09-29) — `revoke insert on public.sites from authenticated` in
  `supabase/migrations/20260929120000_session_guard.sql`, and `SCHEMA.sql` §11a's grant replaced by the same revoke with
  a dated note. Executed on production after the apply: a live session's direct `POST /rest/v1/sites` with its own
  `user_id` → 403 `42501` and no row, while connect keeps writing through the secret key. `RLS-TEST.sql`'s Story 5.24b
  block refuses a tenant's insert with `42501`; its control (the revoke withheld from both files) fails at
  `FAIL (DW-293)`. `MEASUREMENTS.md` §56.
severity: medium
origin: Story 5.24b's Create (2026-09-29), found while tracing DW-58 — read in `SCHEMA.sql` and the app, not executed:
  §11 grants `authenticated` INSERT on `sites (id, user_id, url, title, favicon_url)` (`:1108`) and the `sites_owner`
  policy admits any row carrying the caller's own `user_id`, while the app inserts `sites` only through
  `supabaseAdmin()` (`sites/actions.ts:318-331` at `0b00f5d9`) and every harness seeds through the service role.
owner: Story 5.24b (The sweep: accounts, sites and connections), whose Schema phase revokes the grant and whose card
  names this entry.
location: `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/SCHEMA.sql` §11 (`:1108`, "the
  client supplies the connection and its presentation") · `supabase/migrations/20260904120000_complete_schema.sql` ·
  `supabase/tests/rls.sql` (F3's `sites` block, `:793-798`)
reason: the grant predates Epic 3, which moved connect to a server action writing through the secret key. A row made
  through it skips `normaliseSiteUrl`, the Free plan's one-site limit (counted only inside `connectSite`) and connect's
  Ghost checks; whether Manage keys would then credential such a row is unexecuted, and revoking the grant closes it
  either way. DW-58's check inside `fetchWithKey` stops such an address being fetched regardless.

### DW-294: the gate's "private is not exposed" assertion reads a setting that is empty everywhere it runs

plain: One safety check in the database gate is meant to fail if the private tables ever became reachable over the
  internet. It looks for the answer in a place that is empty both in the test container and on the live database, so
  it always passes and never actually checks anything.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): the exposed schemas are read WHERE THEY LIVE. `run-verify-ghost-admin.py --check`
  gains `schemas-off-rest`: `GET /rest/v1/<a table that does not exist>` with the publishable key and `Accept-Profile`
  `private`, `storage` and `vault` answers 406 PGRST106 each (hint: "Only the following schemas are exposed: public,
  graphql_public"), and `public` and `graphql_public` 404 PGRST205 — the control; a FAIL names the schema. Read on
  production 2026-10-01: PASS; the Management API's `db_schema` is `public,graphql_public`. RLS-TEST's exposure block
  keeps its FAIL branches for a database-level `pgrst.db_schemas` and, unset, prints NOT ASSERTED HERE naming the
  `--check` step (copied to `supabase/tests/rls.sql`). Controls, each red: `graphql_public` planted in the
  must-be-unexposed list (FAIL, exit 1); a session-level `pgrst.db_schemas` holding `storage` in the gate's container
  (FAIL storage, exit 3). MEASUREMENTS §60 records the reading and corrects §16b, §23b and this entry's "`private` is
  still covered over the wire": `vault-off-rest` sends no `Accept-Profile`, so it only ever asked `public`. The spine
  (AD-7), SCHEMA.sql §0b and RESET-supabase.sql now name the `--check` step as the assertion.
severity: low
origin: Story 5.24b's Create (2026-09-29), read-only on production: `current_setting('pgrst.db_schemas', true)` is NULL
  there and `pg_db_role_setting` carries no `pgrst.db_schemas` for `authenticator` — hosted Supabase sets the exposed
  schemas outside the database — and nothing sets it in the gate's container.
owner: Story 5.24d (The sweep: the checks and the walks), whose card names this entry.
location: `supabase/tests/rls.sql:984-995` and `RLS-TEST.sql`, its original — the block that prints "PASS: storage is
  not PostgREST-exposed (db_schemas = unset locally)"
reason: `SCHEMA.sql` §0b says `private` must never be exposed and that RLS-TEST asserts it "because this control is a
  configuration value and configuration drifts"; the assertion passes on both targets without looking at anything.
  `private` is still covered over the wire — `run-verify-ghost-admin.py --check`'s `vault-off-rest` reads its table as a
  404 through PostgREST — but `storage` has no such check. The fix is a probe that reads the exposed schemas where they
  live, with a control, and a SQL block that says what it can and cannot see.

### DW-295: under `next dev`, the connect wizard never leaves "Connecting…" — StrictMode leaves its `alive` ref false

plain: When the app runs on a developer's own computer, pressing **Connect** in the connect wizard shows "Connecting…"
  and then nothing ever happens. The live site is not affected — it is a development-only fault — but it stops anyone
  walking Connect on their own machine, and this story's local runs had to switch React's safety mode off to get past it.
status: done 2026-10-01 (Story 5.24d)
severity: low
origin: Story 5.24b's Dev (2026-09-29), found while running `run-verify-ghost-admin.py`'s blocks against this story's
  code under `next dev`: the wizard sat on "Connecting…" until the run used `reactStrictMode: false` (reverted afterwards).
  Read in the code, and the cause is exact: React 19's StrictMode runs every effect as mount, unmount, mount in
  development, and this effect's body sets nothing, so the unmount's cleanup leaves the ref `false` for good.
owner: Story 5.24d (The sweep: the checks and the walks), whose card names this entry — its walks are the ones a
  development build has to carry.
location: `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx` — `useEffect(() => () => { alive.current = false },
  [])`, and `onSubmit`'s `if (!alive.current) return` after the browser's Content-key check
reason: the ref guards a real case — Escape closing the sheet while the browser check is still awaited must not dispatch
  a connect — and production builds run each effect once, so the live site connects. The fix is to set the ref `true`
  in the effect's body as well as `false` in its cleanup; its control is a connect walked under `next dev` with
  StrictMode on, which stays on "Connecting…" without the fix. Not fixed in 5.24b because no check it runs can walk
  Connect in a development build: `pnpm keyboard` runs `next dev` but has no database or Ghost to connect with, and the
  harnesses walk the deployed production build.
resolution: Story 5.24d's Dev (2026-10-01): the wizard's `alive` ref is set `true` in the effect's body and `false` in its
  cleanup, the editor's own shape (`editor.tsx`'s `gone`), so StrictMode's mount → unmount → mount leaves it true.
  Control, in the main session, against `next dev` with StrictMode on (its default) and production's database, T1 and a
  throwaway account, users 13 → 13 every run: `run-verify-ghost-admin.py --only brand-none`, whose T1 seed is a connect
  walked through the wizard's keys step (`seedConnect` — the harness has no block named `connect`), reached as
  `http://app.inflozo.com:3000` with Chromium mapping that host to this machine. HEAD's wizard: "seed T1: the connect
  never reached S2c in 60s; the form ends … Back Connecting…", and the dev server logged the keys step's GET and no POST.
  The fix: `POST /sites/connect?step=keys 200`, S2c reached, `brand-none` PASS, "RESULT: all steps passed". The FIRST
  attempt was a broken control, caught in the dev server's log: Next 16's `next dev` refuses its own chunks to any host
  but localhost unless `allowedDevOrigins` names it, so the page never hydrated, the progressively enhanced form posted
  natively, and HEAD connected. The two local accommodations — `allowedDevOrigins` and the harness copy's one launch
  line, in the scratchpad — were reverted; neither is in the product.

## Deferred from: Story 5.24c's Create (2026-09-29)

### DW-296: the gscan stress harness stacks sections where their scope refuses them, so it can never name its targets

plain: The big test theme that proves Ghost accepts Inflozo's output at scale puts some sections on pages where they
  cannot work — a list of posts on a single post's page, for example. Ghost still accepts the theme, so nothing is
  broken, but the test proves less than it could, and it cannot yet be checked the way a customer's theme is.
status: open
severity: low
origin: Story 5.24c's Create (2026-09-29), executed read-only in a scratch copy of `tools/stress/`: rendering the stack
  with each template named refuses the feed on post, page and error (`"posts" is not a field of the post scope`), and
  `custom-stress.hbs` is a routes.yaml static route whose sections sit outside any `{{#post}}` (`tools/stress/build.js:179`,
  `:255`), which no row of the binding matrix models. DW-125 (Story 5.24c) fixes each archetype so it renders at its
  own target; this is what is left.
owner: Story 7.35 (The E4/E7 joint compile gate — E7's closing story), whose card names this entry.
location: `tools/stress/build.js` (`TEMPLATES`, the stack's render at `:86-89`) · `tools/stress/sections.js`
  (`stressStack`) · `packages/library/contexts/matrix.json` (`targets`)
reason: naming every template's target in the stack means a stack per template that its scope allows, and a matrix
  target for a static route's template. That is the compiler's placement rule, and Story 7.35's joint gate is where the
  harness becomes the compiler's. Doing it in a sweep story would re-shape the AD-11 fixture for a rule the compiler has
  not written yet.

### DW-297: a free member ask is hidden on every Ghost older than 5.62, whose `@site` has no `allow_self_signup`

plain: A "Sign up" link or button on a customer's site shows only when their Ghost says it takes sign-ups. Ghost
  started saying so in version 5.62, but Inflozo connects any Ghost 5. So on a site running 5.0 to 5.61, every sign-up
  ask Inflozo ships would stay hidden, and nothing would tell the customer why.
status: open
severity: medium
origin: Story 5.24c's Create (2026-09-29), found while checking DW-168, read in source and not executed (no Ghost older
  than 5.130.6 is reachable): R-4 (Story 5.20) wraps every free ask in `{{#if @site.allow_self_signup}}`
  (`packages/library/src/vocabulary.ts:319-322`, `ASK_FLAGS`); that field arrived in Ghost 5.62.0, bisected in the npm
  releases (MEASUREMENTS §41, `packages/library/contexts/matrix.json:123-126`); and connect accepts any Ghost 5
  (`apps/web/lib/connect-rule.ts:14`, `MIN_GHOST_MAJOR`).
owner: Story 7.18 (The deploy wizard), whose card names this entry.
location: `packages/library/src/vocabulary.ts` `ASK_FLAGS` · the compiler's emission of a member ask · Story 7.18's
  Pre-flight
reason: a design's own `ghostCompat.minVersion` cannot see it — the ask is a customer's link, not a field a design
  reads — so DW-168's check does not reach it. What a site below 5.62 should get (the ask kept, dropped, or the deploy
  warned) is the owner's decision, and Pre-flight is where a deploy already meets the site's version and its
  member-switch warnings (DW-260).

## Deferred from: code review of spec-5-24c (2026-10-01)

### DW-298: the Ghost seeder ships an image address that answers 404

plain: The script that fills a test Ghost site with sample content points one picture at an address on Ghost's own
  image library that no longer exists, so a fresh test site would get a broken picture there.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `seed-ghost.py`'s third image is
  `https://static.ghost.org/v4.0.0/images/writing-posts-with-ghost.png` (200) and the `ponytail:` note is gone; a
  `--check`, handled before the majors loop, HEADs every `IMG` address and exits 1 naming any that is not 200 (with a
  User-Agent of its own: static.ghost.org answers Python-urllib's with 403 on every address — the first run's broken
  test, caught and fixed). Control: HEAD's list → `404 …v5.0.0/…writing-posts-with-ghost.png`, exit 1; the fixed list →
  PASS, exit 0. The two test sites still hold the dead address in their seeded posts; replacing it there is a test-site
  write this entry does not ask for, so it lands at the next re-seed.
severity: low
origin: Story 5.24c's Dev (2026-10-01), MEASUREMENTS §59: `static.ghost.org/.../writing-posts-with-ghost.png` answered
  404 while `publication-cover.jpg` and `feature-image.jpg` answered 200; noted beside `tools/probe/seed-ghost.py:76` as a
  `ponytail:` comment. Raised at the review as a finding with no owning document.
owner: Story 5.24d (The sweep: the checks and the walks), whose card names this entry.
location: `tools/probe/seed-ghost.py:74-76`
reason: the two test sites are seeded already and no story re-seeds one; the next re-seed (a new test site, or a reset
  under `RESET-PROTOCOL.md`) is when a live address is needed, and the fix is one address swapped for one that answers.

### DW-299: three changes on T3 dated 2026-09-25 that no probe made reached a recording, and the inventory does not know them

plain: Three things on the Ghost 5 test site changed on 2026-09-25 — a probe's post was retitled and given a picture, a
  sample post got a new picture, and the Portal button's icon was switched — and nothing in Inflozo did it. A recording
  now depends on them, and the list of what the test sites hold does not mention them.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): kept, and written down as the owner's. `RESET-PROTOCOL.md` § Ghost gains "hand changes
  on the test sites": `probe-gated-post` retitled with an Unsplash image (2026-09-25 04:48–04:49 UTC), "Reading the
  margins"'s uploaded image (04:50 UTC) and `portal_button_icon` `icon-5` (2026-09-26 16:35 UTC) — and a fourth, the
  owner's T3 profile picture (his two "edited user" rows at 2026-09-25 04:48) — each made by the owner in Ghost Admin
  per T3's actions log (read with GETs only), and recorded in `ghost5.json`. MEASUREMENTS §61 records the actions-log
  fact, in source on both majors and on both logs: an edit made in Ghost Admin is logged, a staff-token write is not
  (`context.integration = {id: null}` → a null actor → the NOT NULL `actor_id` drops the row); its control, §59's
  2026-10-01 staff-token writes, are absent from both logs.
severity: low
origin: Story 5.24c's Dev (2026-10-01), MEASUREMENTS §59 *Found, not written*: `probe-gated-post` retitled "PROBEs Gated
  Post" with an Unsplash feature image, "Reading the margins" given an uploaded feature image in place of the dead
  `static.ghost.org` one, and `@site.portal_button_icon` now `icon-5`. Raised at the review: a finding must reach an
  owning document, and `RESET-PROTOCOL.md`'s inventory is that document.
owner: Story 5.24d (The sweep: the checks and the walks), whose card names this entry.
location: `tools/probe/RESET-PROTOCOL.md` § Ghost · `packages/library/contexts/fixtures/ghost5.json`
reason: the owner is the only one who could have made them by hand (the probes write nothing of the kind); the next
  recorder run re-reads them either way. What is owed is a line in the inventory saying they are there and whose they are.

### DW-300: `offerBindings` withholds every helper that carries a `since` when no version is given — the three older ones too

plain: When the editor asks which pieces of Ghost information a section may use, and the project is not linked to a
  site yet, it now holds back the five helpers that arrived after Ghost 5.0 — the comment box, the two member counts,
  the Content API key and address — because "no version" is read as the oldest Ghost. Nothing on screen asks yet.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): no change to the rule; FR-H7 decides it. Binding is "prevention, not
  warning", and "fields introduced after a target's version … are not offered for that site", so with no version (a
  project linked to no site yet) the offer is the floor's; a comment beside `versionAtLeast`
  (`packages/library/src/contexts.ts`) says so. The entry's helper wording was wrong: bare helpers are never offered at
  any version, with a `since` or without. The universal loop skips non-`@` paths (`contexts.ts:325`) and `sort` has no
  helper branch (`:307-310`), so neither a bare universal helper nor a scope's helper field (`content`, `post_class`,
  `comments`, navigation's `url`, the error page's two) is ever listed. A helper's `since` is read only by `bindable(…,
  use:'helper')` (`:223-230`), and a render passes no version. What "no version" withholds is the `@site.*` and scope
  keys carrying a `since`: the seven 6.36.0 social keys, `admin_url` and five 5.x `@site` flags, an author's seven
  handles, a tier's `trial_days`. `offerBindings`' own comment now says it offers no helper. Control: a
  `contexts.test.ts` row checks every target (at the top, in each `{{#get}}` source, inside each top-level repeat) at no
  version, the floor and every `since` in the matrix. No offer lists a path bindable as a helper, the no-version offer
  equals the floor's, and `@site.threads` is absent with no version and present at 6.36.0. Red in a scratch copy with
  `versionAtLeast` answering true for no version, and with `sort` given a helper branch; dropping the `@` skip alone
  stays green, because `sort` keeps a bare helper out on its own.
severity: low
origin: Story 5.24c's Dev on Question 4 (2026-10-01): `since` on the bare helpers in `contexts/matrix.json`, applied by
  `offerBindings` with "absent = the floor" (`packages/library/src/contexts.ts`, `versionAtLeast(undefined, …)` reads
  `CONTEXT_MATRIX.floor`). Consistent with the rule already in force for the universal keys; no app caller exists
  (`grep offerBindings apps/` is empty). Raised at the review so the story that builds the offer meets it knowing.
owner: Story 5.24e (The sweep: the editor), whose card names this entry.
location: `packages/library/src/contexts.ts` `offerBindings` · `packages/library/contexts/matrix.json` `universal`
reason: whether an unlinked project is offered the floor's set or the newest Ghost's is a product call for the story
  that draws the offer; the rule today is the conservative one and is held by `contexts.test.ts`.

### DW-301: `record-cards.py` reads its owned posts and tags by id and never checks they are still the rows it designed

plain: The recorder that learns a Ghost site's default ordering uses two posts and two tags it created, with dates and
  names chosen so the order is visible. If someone renamed or re-dated one by hand, the recorder would still read it and
  the test would still pass, on an order the rows no longer show.
status: done 2026-10-01 (Story 5.24d)
resolution: Story 5.24d's Dev (2026-10-01): `record-cards.py`'s `publish_owned` checks each owned tag's name right after `by_slug`
  and each owned post's `published_at` and first tag in Ghost's own answer to the write (after `docs.append`, so the
  `finally` still drafts it); a mismatch raises `Void` naming the slug. `record()` now calls it FIRST, so a row changed
  by hand voids the run before any document is published (the defaults are read by id, so the order moves nothing
  recorded). `--self-check` gains a fake Admin: the rows as designed publish (the control), a renamed tag voids naming
  `inflozo-defaults-b` with no write made, a re-dated and a re-tagged post each void naming it. Controls, each red: the
  tag check removed, the post check removed, the date compared alone. A GET of the four owned rows on both majors
  matches the design, so a real run passes. Never run live (it writes to T1 and T3).
severity: low
origin: Story 5.24c's review (2026-10-01), Edge Case Hunter: `tools/probe/record-cards.py` resolves `OWNED_POSTS` and
  `OWNED_TAGS` by slug, reads them by `filter=id:[…]`, and asserts nothing about the rows' `name`, `published_at` or
  `tags[0]` before `orbit-weekly.test.ts` reads the recorded order.
owner: Story 5.24d (The sweep: the checks and the walks), whose card names this entry.
location: `tools/probe/record-cards.py` `api_defaults`
reason: a recorder run writes to T1 and T3 and needs the owner's in-session go (R-82), so the review built no check it
  could not run; the fix is one assertion per owned row, voiding the run with the row named.


## Deferred from: code review of spec-5-24d (2026-10-01)

### DW-302: no automatic check holds "the private schema is not reachable over the data API"

plain: The rule that keeps your customers' Ghost keys out of reach of the public data address is now really checked —
  but only when someone runs the check by hand. The automatic checks that guard every push do not run it, so if that
  setting were ever changed in Supabase's dashboard, nothing would stop the next publish.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): `tools/probe/check-schemas-off-rest.py` (stdlib) carries
  `schemas-off-rest`'s assertion, moved unchanged, and CI's `rls` job runs it after `run-rls-gate.sh` on every push. It
  reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from Vercel's production env with the three Vercel secrets
  `deploy` already holds, so GitHub gained no secret, and `deploy`'s `needs` is still `[check, rls]` (R-116). It prints
  one line, never a value, and fails closed with COULD NOT ASK — on no answer, and on any answer that is not one of
  PostgREST's two verdicts (a 404 or a 406 carrying its `code`): a 401, a 5xx, any other status, or a verdict with no
  code. `run-verify-ghost-admin.py --check` calls the same `check()`. It PASSed in both modes and the three planted
  controls FAILed (`graphql_public` unexposed, `public` alone, a wrong project id → COULD NOT ASK) (MEASUREMENTS §66).
  Its stdlib `--self-check` — canned answers: the pass shape, each planted list, no answer, a 401, a 500, another
  status, a verdict with no code — runs in the root `pnpm test` beside the recorders' self-checks, and went red with the
  unjudged-answer guard planted off (a 401 read as WRONG). CI's `rls` log on the push is read at Review.
severity: medium
origin: Story 5.24d's review (2026-10-01), Blind Hunter, Edge Case Hunter and Verification Gap: DW-294 moved the
  assertion out of `RLS-TEST.sql` (which printed PASS while checking nothing) into `run-verify-ghost-admin.py --check`'s
  `schemas-off-rest`, and the SQL block now says "NOT ASSERTED HERE". Neither `ci.yml` nor `pnpm test` runs `--check`.
owner: Story 5.24e (The sweep: the editor), whose card names this entry.
location: `.github/workflows/ci.yml` `rls`; `tools/probe/run-verify-ghost-admin.py` `schemas-off-rest`
reason: the read needs `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in GitHub Actions, which holds only Vercel's
  secrets today — adding one is the owner's action in GitHub's settings, so the review could not wire it. The step is
  three GETs of a table that does not exist; it wants its own small script the `rls` job can call. Before this story no
  gate asserted it either, so nothing regressed.

### DW-303: nothing automatic would notice the connect wizard sticking on "Connecting…" under `next dev` again

plain: The fault that stopped a site being connected on a developer's own machine is fixed, but it was proved by a
  one-off hand run. If the same line were changed back, every automatic check would stay green. Customers are not
  affected: the live site never had the fault.
status: done 2026-10-02 (Story 5.24e)
resolution: Story 5.24e's Dev (2026-10-02): the connect wizard's keys step has a harness mount
  (`app/harness/connect/page.tsx`, `notFound()` without `INFLOZO_HARNESS=1`; `app-routes.test.ts`'s `HARNESS_ONLY`, the
  editor walk's step 79) and a keyboard-gate stop under `next dev`'s StrictMode: Ghost's settings routed to a 200, the
  three fields filled, Enter on Connect, and a POST carrying `next-action` within 15 s. Control: red with `alive.current
  = true` removed from the wizard ("Connecting…" stays), reverted.
severity: low
origin: Story 5.24d's review (2026-10-01), Blind Hunter and Verification Gap: DW-295's control was a hand run of
  `run-verify-ghost-admin.py --only brand-none` against `next dev`; no test mounts the wizard under StrictMode. The
  keyboard gate runs under `next dev` but has no route that draws the wizard without a database.
owner: Story 5.24e (The sweep: the editor), whose card names this entry.
location: `apps/web/app/(app)/app/(authed)/sites/connect-wizard.tsx` (the `alive` effect)
reason: a keyboard-gate stop needs a harness mount of the wizard with its browser check answered by `page.route` —
  a new harness page, more than a review patch. The rule it would hold is general: a ref cleared in an effect's cleanup
  must be set in the effect's body.

## Deferred from: Story 5.24e's Create (2026-10-02)

### DW-304: a save the server refuses for good still says it will be sent "when the connection returns"

plain: If a project is deleted in another window while it is open in the editor, or this browser is now signed in to a
  different account, the editor keeps saying it will send your work "when the connection returns" — and it never will.
  Signing in again cannot fix it either, so the signed-out message Story 5.24e builds (R-213) does not cover it.
status: open
severity: low
origin: Story 5.24e's Create (2026-10-02), the read-only pass on R-213, executed in the harness: `sync/route.ts` answers
  404 for a deleted project or another account's session (`:50`, `:114`), 400 for a malformed body (`:56-67`) and 422
  for a document it will not store (`:73`, `:75`, `:79`), and `editor.tsx`'s `flush` sends every one of them to the
  Retrying backoff (`:1643` → `:1656`). R-213 takes only "a refusal that signing in cures" — the 401.
owner: Story 7.18 (the deploy wizard), whose card names this entry: its pre-deploy flush meets the same refusal, and its
  Create asks the owner (R-83) for the sentence both say.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`flush`) ·
  `apps/web/components/editor/save-state.tsx` · `apps/web/lib/journal.ts`
reason: the honest answer is a state and a sentence no frame draws and no ruling gives (R-74, R-83). A 400 or 422
  needs a bug to reach it; a 404 needs the project deleted, or the account changed in the same browser, while the
  editor is open.
  Story 6.3's Review (2026-10-04) adds one more of the same kind: the route's 422 "Not a Style Pack" for a pending
  preset the deployed build does not hold — reachable only by a tab kept open across a build that drops a preset, and
  the docs in the same body wait with it. The sign-out's send (`owedOf`) meets the same answer.

### DW-305: on an invite-only site, a section asking people to pay is not warned, though Ghost blocks its sign-up too

plain: When your site lets in only people you invite, Ghost's own sign-up window refuses everyone — paying members too.
  The settings line Story 5.24e builds (R-216) warns a free sign-up section in the Sites screen's words, but no Sites
  sentence covers a PAID ask on such a site, so a section asking people to pay would show no warning while its button
  signs nobody up.
status: open
severity: low
origin: Story 5.24e's Create (2026-10-02), the read-only pass on R-216: Portal's `signup-page.jsx:715-718` (read in
  source) blocks every sign-up when sign-up access is invite-only, while a paid ask compiles behind
  `@site.paid_members_enabled` alone (R-4); `membersNotice` (`apps/web/lib/paywall.ts:76-86`) has an invite-only
  sentence for free sign-up forms only. No library design carries a paid ask today (a22/1's is free).
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), whose card names this entry:
  A1's free-member upgrade ask (`account/plans`) is the first paid ask a design can carry, and its Create asks the
  owner (R-83) for the sentence, or rules the case out.
location: `apps/web/lib/paywall.ts` (`membersNotice`, and the one list of asks and sentences R-216 builds)
reason: the words are the owner's — R-216 says "in the Sites screen's own sentence", and no Sites sentence exists for
  this case (R-170) — and nothing reaches the case before a design carries a paid ask.

### DW-306: an announcement bar can be put below the header, while the library says A2 sits above it

plain: Your site-wide header and announcement bars share one group in Layers, and you can put them in either order —
  the page follows the list. The library's description of announcement bars says they sit above the header. Before the
  first announcement bar design ships, someone must decide whether one may sit below the header.
status: open
severity: low
origin: Story 5.24e's Create (2026-10-02), the read-only pass on DW-187: `apps/web/lib/editor.ts`'s `canvasStack`
  (`:185-190`) draws the site doc's non-footers in doc order, and Story 5.24e's clamp keeps headers and bars in one
  band, in the order the user puts them; `sections-inventory.md:129` describes A2 as "Site-wide, above header".
owner: Story 9.5 (A2 — the content model, the stylesheet and designs #1–4), whose card names this entry.
location: `apps/web/lib/editor.ts` (`canvasStack`, and Story 5.24e's `landWithin`) ·
  `apps/web/components/controls/layers.tsx`
reason: no A2 design exists, so no page can hold a bar and a header today; whether the band keeps a bar above the
  header or lets it sit below is A2's own design decision.

### DW-307: closing the editing window while it checks in leaves the lock held for about a minute

plain: When you close the window that is editing, your other window normally takes over in about 15 seconds. About one
  close in fifty — when the window is closed in the split second it is checking in with the server — the other window
  waits about a minute instead. Nothing is lost; it only waits longer. You accepted this for now (R-228).
status: open
severity: low
origin: Story 5.24e's Dev (2026-10-02), the read-only audit of DW-240 and DW-244: a going tab's `leave` backdates the
  row only when the beat it carries is the row's `heartbeat_at`, so a late leave from before a reload can never backdate
  the reloaded page's row (DW-240's second stop). A beat still in flight as the tab goes moves the row past the beat its
  leave carries, so that close matches nothing and the row goes stale on its own, after `STALE_MS` (~60 s), where
  `release` at `0e8dcbb0` freed it within a check-in. The server cannot tell that close from a reload: both pages share
  the tab's session id (`sessionStorage`), and no column names the page a beat came from. The odds are the beat's
  round trip over `HEARTBEAT_MS`. The ceiling is named beside `leaving` in `editor.tsx` and in MEASUREMENTS §65.
owner: Story 7.18 (the deploy wizard), whose card names this entry: the wizard requires the edit lock, and its Create
  decides the per-page id — a column on the lock row, so a migration pushed first (R-99) — that lets a leave match its
  own page's beat whatever landed since.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/lock/route.ts` (`leave`) · `apps/web/lib/lock.ts` ·
  `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`leaving`)
reason: the fix needs a column, and Story 5.24e forbids a migration (R-99, its Never); the owner ruled the wait
  acceptable until then (R-228, Story 5.24e's Question 2).

### DW-308: a window that types in its first moment and then finds another session editing keeps that typing, unsent and unsaid

plain: When you open a project, the editor lets you start at once while it asks the server whether another of your
  windows is already editing. If one is, this window turns read-only. Anything you typed in that first moment — well
  under a second — stays in this window and is never sent, and nothing tells you so. Before Story 5.24e the server
  refused that typing and the window said the edits were not included.
status: open
severity: low
origin: Story 5.24e's review (2026-10-02), the Acceptance Auditor and the Blind Hunter: DW-203's wall in `flush`
  (`if (!now.lock.holder) return`) stops a tab reading along from sending, so the first-opener race — a tab that typed
  on its optimistic first paint and then lost its first `acquire` — no longer reaches the sync route's 423, whose path
  displaced the session and announced `LOCK_COPY.displaced`. The Dev named the ceiling in a `ponytail:` comment beside
  the wall and in DW-203's resolution, but gave it no entry and no owner.
owner: Story 7.18 (the deploy wizard), whose card names this entry: the wizard requires the edit lock and already takes
  DW-307, so the lock's last two edges are closed together.
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (`flush`'s wall, and `land()`)
reason: the fix is `land()` telling a session that typed before its first answer, when that answer makes it a reader,
  what it holds — in memory only, because in the same-browser race the on-device record is the holder's and must not
  be reset. That is a change to the lock's landing found at a review, with a window of one round trip; it wants its own
  control (a journey that types inside the optimistic paint), not a patch beside forty other closures.

## Deferred from: Story 6.1's Create (2026-10-03)

### DW-309: S7a's pack names are placeholders by its own caption, and Story 6.2 reads "matches S7a" as the roster's names

plain: The drawing of the Style Pack panel says of itself that its pack names are stand-ins — Harbor, Neon Dusk, Cocoa,
  Mist, Butter — while the product plan names twelve others (Orbit, Mono, Ocean, Quiet…). The story that ships the twelve
  packs has to take the names from the plan, or ask.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-231 ruled: S7a's roster in the editor (`projects/[id]/(editor)/style-pack.tsx`) lists Appendix D's twelve in §D.d's order with S7a's layout — never its placeholder names; the keyboard journey reads the order off `packs.json` and holds the roster to it.
severity: low
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile, read in the frame
owner: Story 6.2 (The twelve presets and the font pool), whose card names this entry.
location: `S7 Style Packs.dc.html` S7a's caption ("roster shows 4 of 12; the shipping 12 pack names were not supplied —
  placeholder names in use") · `prd.md` Appendix D's pack table · `epics.md` Story 6.2 ("'matches S7a' means the
  roster's names, order and layout")
reason: Appendix D is the roster, as it is the palettes (DW-11's shape); whether "matches S7a" then means the layout
  alone is the owner's to rule (R-83) before the presets ship.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 1, option 1): *"The plan wins"* — R-231. The roster is
  Appendix D's twelve in its order, laid out as S7a lays them out. Story 6.2's Dev builds it and closes this entry.

### DW-310: S7's labels and rows are not FR-E1's: two other names, no Pill, no gutter, shadow or link rows, "Contrast" for on-accent

plain: The Style Pack panel's drawing calls two settings by other names than the plan ("Standard" for Normal width,
  "Spacious" for Airy density, with "Title font" and "Corners"), has no Pill button and no rows for gutters, shadow or
  link style, and names the colour of words on the accent "Contrast". The story that builds the panel picks one name
  per thing and has the missing rows drawn.
status: done 2026-10-04 (Story 6.4)
severity: medium
origin: Story 6.1's Create (2026-10-03), checked in the frame: S7c's "Contrast" swatch is `#FFFFFF` beside Tangerine's
  light accent and `#1F1410` beside its dark one, so it is on-accent and the seven roles are FR-E1's under one other label
owner: Story 6.4 (Editing tokens, per mode, with contrast checked live), whose card names this entry.
location: `S7 Style Packs.dc.html` S7a (the pack-level rows) and S7c/S7d (the swatch rows, the `Contrast` swatch at
  :320) · `prd.md` FR-E1 (:253) and Appendix C (:983-1002, "scale vocabularies are closed") · `reconcile-designs.md`
  :4573, :4587 (a record that flagged S7a stale; never ruled, never redrawn)
reason: Story 6.1's engine takes FR-E1's and Appendix C's words, which are closed; what the panel prints is 6.4's under
  R-170 (one name per thing), and rows no frame draws are drawn first (R-74).
note (Story 6.4's Create, 2026-10-04): planned. The rows take Appendix C's titles and steps (Site width, Radius, Spacing
  density, Gutters, Button style, Shadow, Link style; Normal, Airy), the fonts are one Fonts row (the pairing), the
  seventh colour is On-accent, and S7d's stray four-swatch row goes. Every part no frame draws — Gutters, Shadow, Link
  style, Pill, Pill radius, Image scrim, the pairing list, the warning, reading along and 834 — is drawn first from the
  Claude Design prompt in the spec (its Question 1, R-74). One more two-name case was found: the page colour is
  "Base" in a section's Background setting and "Background" in FR-E1 and S7c, so its one name is the owner's
  (Question 2).
ruling (owner, 2026-10-04, Story 6.4's Create, Question 1, option 2): *"Skip the drawing this once. Ensure it is
  perfect and match existing design."* — R-236. Nothing is drawn first. Every part no frame draws is built from the
  drawings that exist (S7a, S7c, S7d, the Editor Sidebar Kit, P0-0, D8) exactly. The spec's "Built from" table gives
  the values; a computed-style stop holds them, and the owner approves a side-by-side page in Dev. S7a's two font rows
  stay two rows (Heading font, Body font).
ruling (owner, 2026-10-04, Story 6.4's Create, Question 2, option 1): *"Base everywhere."* — R-237. The pack editor's
  first colour is "Base", as in a section's Background setting. Story 6.4's Dev builds both and closes this entry.
resolution: Story 6.4's Dev (2026-10-04). The panel's rows are Appendix C's — Site width, Radius, Spacing density,
  Gutters, Button style (Pill last), Shadow, Link style, with Normal and Airy — plus S7a's two font rows (Heading font,
  Body font, one pairing menu) and Pill radius; the seven colours per mode are Base · Surface · Text · Muted · Border ·
  Accent · On-accent (R-237), with Image scrim; S7d's stray four-swatch row is not built. One list, `lib/pack-edit.ts`'s
  `PACK_EDIT_WORDS`; `pack-edit.test.ts` holds the rows to `prd.md` Appendix C and to `SCALES`, the font rows and Base,
  and refuses Standard, Spacious, Corners, Title font, Background and Contrast. The undrawn parts are built from the
  drawings that exist (R-236), held by the keyboard journey's computed-style stop `R-236 ·` behind a 1px control, and
  approved side by side by the owner in the Dev session (Story 6.4's Question 4, 2026-10-04).

### DW-311: Appendix D pairs Paper and Ink with faces no drawing uses

plain: The plan gives Paper the fonts Fraunces and Inter and Ink the fonts Libre Caslon Text and Source Serif 4, but
  every drawing sets Paper's headings in Georgia and Ink wholly in Inter. Before those packs ship, someone decides which
  is right.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-231 ruled: Paper is pairing D1 (Fraunces / Inter) and Ink D2 (Libre Caslon Text / Source Serif 4), their faces the pool's own files; `REFERENCE_PACK` is the library's Paper preset, so `reference-tokens.css` names `'Fraunces', serif` and its drop cap is 3.468 (Fraunces' cap .7, Inter's .7275, both off OS/2). Google/fonts now ships Libre Caslon Text as a variable font only, so the builder cuts §D.c's static 700 from it — R-235 (owner, 2026-10-03, Story 6.2's Dev, Question 5, option 1).
severity: medium
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 6.2 (The twelve presets and the font pool), whose card names this entry.
location: `prd.md` Appendix D (:1016-1017) · `…/claude-design-export/Inflozo/a29-kit.js:10,20` (every kit agrees) ·
  `packages/section-runtime/src/tokens.ts` (the reference set keeps Georgia and Inter, as drawn)
reason: DW-11 covers the accents only. The faces also decide which files are self-hosted and the theme's font budget,
  so the owner rules (R-83) where a drawing and Appendix D disagree on a face, as 6.2's card already has him rule on
  an accent.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 1, option 1): *"The plan wins"* — R-231. Paper is Fraunces
  / Inter and Ink Libre Caslon Text / Source Serif 4. Story 6.2's Dev builds it and closes this entry.

### DW-312: D19 and D22 are listed as two-file pairings, but their headings need weights the body file does not carry

plain: Two font pairings promise to ship as two files because heading and body are one family, but their headings use
  weights (up to 900 and 800) the body files, cut to 400–700, do not hold.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-232 ruled: §D.c's D19 and D22 rows declare the body roman `wght 400–900` and `400–800` with the italic at 400–700, §D.a rule 3 says so, and `tools/fonts/build-pool.py` refuses a same-family heading its body does not cover; built, Broadsheet and Fieldnote are two faces each (`pool.json`).
severity: low
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 6.2 (The twelve presets and the font pool), whose card names this entry.
location: `prd.md` Appendix D §D.a rule 3 (:1059, "provided the clipped range covers the heading weights") · §D.c
  rows D19 (:1104) and D22 (:1107)
reason: the rule's own proviso fails for both: either the body's range widens (bigger files) or they ship as three — a
  bundle-size decision Story 6.2 makes when it builds the pool.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 2, option 1): *"Widen the text files to cover the
  headings"* — R-232. Chivo's body roman clips 400–900 and Figtree's 400–800; each stays two files. Story 6.2's Dev
  builds it and closes this entry.

### DW-313: every pairing must render in the photo check before launch, but the check photographs three packs

plain: The plan says each of the thirty font pairings must appear in the automatic photo check under some pack before
  launch, but the check will only ever photograph three packs, and pairings 13 to 30 belong to no pack at all.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03), as R-233 ruled: the render matrix photographs one specimen per pairing of the pool — a heading at two sizes, a paragraph with a bold and an italic run, tabular figures and latin-ext letters, in Paper's palette with that pairing's faces, light, at 1440 (`specimenMarkup` / `specimenDocument` in `tools/matrix/cases.mjs`, baselines under `packages/library/baselines/specimens/`); §D.c's closing paragraph promises exactly that, and `cases.test.mjs` holds one specimen to every pairing.
severity: medium
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 6.2 (The twelve presets and the font pool), which picks the three reference packs (DW-169) and whose card
  names this entry.
location: `prd.md` Appendix D (:1117, "every pairing must render in the render matrix under at least one pack before
  GA") · `epics.md` Story 6.2 (three packs, "the only pack files `tools/matrix/cases.mjs` reads")
reason: the two promises cannot both hold as written; 6.2 decides how the other pairings are proved — a fonts-only case
  over the reference palette, or a narrower promise ruled by the owner.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 3, option 1): *"One specimen photo per pairing"* — R-233.
  Story 6.2's Dev builds the case and closes this entry.

### DW-314: Site Remix's "re-roll the Style Pack" has no story since Story 5.12 left it out

plain: Remix was to let you re-roll the colours and fonts, the designs, or both. Story 5.12 left the colours-and-fonts
  choice out because only one pack existed, and no story brings it back.
status: done 2026-10-04 (Story 6.3)
resolution: Story 6.3's Dev (2026-10-04): B8's "Re-roll what" is built (`components/editor/remix-dice.tsx`, words in `lib/remix.ts`) — Style Pack · Designs · Both as native radio cards above the buttons, offered where a pack can be re-rolled (the editor; `/controls` holds no pack and keeps today's dialog), opening on Designs where a ring moves and on Style Pack where none does, Designs and Both greyed with `NO_RING_MOVES` beneath. Style Pack draws a different preset uniformly (`lib/pack-switch.ts`'s `otherPreset`, through `shuffleTo`); Both is ONE transaction — the fold and the pack under one `txn`, undone and redone whole (`lib/journal.ts`). Held by `pack-switch.test.ts`, `journal.test.ts`'s grouped-transaction rows (red with the grouping removed, executed in a scratch copy), the keyboard journey's "Remix's Re-roll what" stop (Style Pack and Both, one ⌘Z each) and the deployed walk's step 88 (opening on Style Pack with the other two greyed, and a pack re-roll that one ⌘Z undoes).
severity: medium
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 6.3 (The pack-switcher moment), the first story with more than one pack to switch to, whose card names
  this entry.
location: `prd.md` FR-D17 · `epics.md` Story 5.12 (:1967-1971, "scoped re-roll is offered — pack only, designs only")
  · `spec-5-12-site-remix.md:80-83` (the "Re-roll what" group left absent while Paper was the only pack)
reason: R-195 — a requirement left out of its story needs a named owner.

### DW-315: the deploy's quality gate would fail a theme for a contrast the user was only warned about

plain: When you edit a colour, Inflozo warns about poor contrast but lets you keep it. The deploy check, as written,
  then fails the theme for that same contrast — so the warning becomes a block.
status: done 2026-10-09 (Story 7.8)
resolution: Story 7.8's Dev (2026-10-09). The quality gate's contrast rule, `contrast-aa`, checks the pack's own
  `AA_PAIRS` in both modes (`hardToRead`, moved beside `AA_PAIRS` with its words so the gate and the Style Pack editor
  say one thing, R-170) and is ALWAYS a warning, `contrast_low`, in the editor's own words — never a block (FR-E3). CI
  holds every preset in both modes (`quality.test.ts`, with `packs.test.ts`' Tangerine control caught), so at a deploy
  only a customer's own colour can fail. This did not change what a deploy does beyond FR-E3's approved rule, so no new
  question went to the owner; Question 2 (owner, 2026-10-09) extended the same rule to the heading, name and
  picture-link findings a customer's choice causes.
severity: medium
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 7.8 (the theme quality gate), whose card names this entry.
location: `epics.md` Story 7.8 (:3145, "AA contrast on emitted text against the Style Pack's own tokens") · `prd.md`
  FR-E3 (:255, "a warning, never a block"), FR-G4 (the AA guarantee is scoped to shipped packs and library defaults)
reason: the gate's AA assertion has to stop at that scope, or report a pairing the user accepted without failing the
  deploy; 7.8 decides, asking the owner (R-83) if it changes what a deploy does.

### DW-316: AD-30's title says one file selects on mode while its rule allows two, and a visitor's saved choice is unsaid once the owner pins

plain: The architecture's dark-mode rule says in its title that exactly one file in a theme picks light or dark, and
  in its text that two may. And nothing says what a visitor who chose dark under Auto sees once the owner pins the site
  to light.
status: done 2026-10-05 (Story 6.5)
resolution: Story 6.5's Dev (2026-10-05). R-239 is built: `MODE_SELECTORS.explicit` is
  `:root:has(> body.scheme-dark), :root[data-mode="dark"]:not(:has(> body.scheme-light))` and the system selector steps
  aside for a Light pin, so the pin wins and a saved choice applies only on Auto — the keyboard gate's truth table proves
  every combination under every reference pack, and goes red with option 3's selectors (executed). AD-30's title now
  names its one file, the token block, and its rule says the same (a per-mode image swap's one generic rule lives there);
  FR-E4's order is the ruled one; Story 9.1's criteria carry the module's sentence word for word, and the module's two
  open questions are DW-328's.
severity: low
origin: Story 6.1's Create (2026-10-03), the Epic 6 context compile
owner: Story 6.5 (Mode resolution — three inputs, one precedence, one file), whose card names this entry.
location: `ARCHITECTURE-SPINE.md` AD-30 (:352, the title; :358, "the token block and the base stylesheet are the only
  files in a generated theme that mention a mode") · `prd.md` FR-E4 (:256-262), FR-D7 (:224, R-34)
reason: 6.5 writes the one selector list and the precedence, so both edges are its to settle.
note (Story 6.5's Create, 2026-10-05): planned. The title wins: the token block becomes the only file that names a mode,
  and a per-mode image swap's one generic rule moves there from the base stylesheet (text only — no design draws one
  yet). The saved choice is the owner's Question 1, because FR-E4's written order (the visitor's choice first) and R-34
  (a pin offers no visitor switch) disagree exactly there. Option 1 is recommended: the pin wins, and the choice is kept
  for a return to Auto. The CSS makes the pin win, and the ruling's sentence for the `mode-toggle` module goes into
  Story 9.1's criteria word for word.
ruling (owner, 2026-10-05, Story 6.5's Create, Question 1, option 1): R-239 — the pin wins, and a choice saved under
  Auto waits, kept, for a return to Auto. Story 6.5's Dev builds it and closes this entry.

### DW-317: a Soft or Outline button has never been drawn, and on a dark band an Outline one would be invisible

plain: Every photograph so far shows Paper's solid orange button. A pack that picks the Outline button would draw its
  main button as dark words on the dark band in two of the sample sections, and nothing would notice, because no check
  draws a pack other than Paper yet.
status: done 2026-10-03 (Story 6.2)
resolution: Story 6.2's Dev (2026-10-03): A4 #13's primary action answers `[data-bg="contrast"]` as A22 #1 does (the band's words as its fill); A1 #1 offers no contrast ground (Background is base · surface), so the validator refuses a rule for one and its stylesheet says so beside the button. R-234 makes Mono a reference pack — Outline buttons and Tight gutters — so `--button-text` and `--space-gutter` are photographed off Paper's step; `cases.test.mjs` asserts a reference pack sits off Paper on both and that the tokens really differ there.
severity: medium
origin: Story 6.1's Review (2026-10-03), Blind Hunter + Edge Case Hunter + Verification Gap
owner: Story 6.2 (The twelve presets and the font pool), whose card names this entry.
location: `packages/section-runtime/src/tokens.ts` `SCALES.buttons` (the Outline and Soft labels are computed for the
  page ground and the surface) · `packages/library/designs/a4/13/style.css` `.a4-13__action--primary` and
  `a1/1/style.css` `.a1-1__cta` (no `[data-bg="contrast"]` answer; A22 #1 has one) · `a17/1/style.css` (its gaps read
  `--space-gutter`) · `tools/matrix/cases.mjs:58` (one pack)
reason: `--button-text` equals `--text-on-accent` and `--space-gutter` equals `--space-gap` in the only pack the matrix
  draws, so the pilots' move to them is unobservable; reverting it keeps every gate green. Executed at Review: Paper
  light with `buttons: 'outline'` gives label `#232019` on the contrast ground `#232019`. 6.2 widens the pack axis
  (DW-169): one drawn pack must sit off the reference step on `buttons` and `gutters`, and each design that draws a
  `--button-fill` button on a contrast ground answers it there, as A22 #1 does.
ruling (owner, 2026-10-03, Story 6.2's Create, Question 4, option 1): R-234 makes Mono a reference pack — outline
  buttons and tight gutters, off Paper's step on both. Story 6.2's Dev closes this entry.
note (Story 6.4's Dev, 2026-10-04): the contrast-ground answers this entry added are now photographed — A4 #13 and
  A22 #1 on `data-bg="contrast"` under Mono, light and dark, at 1440 (DW-324's derived contrast-ground cases).

### DW-318: the dark link proof on the two Ghost sites cannot say which of the two dark switches worked

plain: The test on your two Ghost sites turned dark mode on in two ways at once, so it proves dark works but not that
  each way works alone.
status: done 2026-10-05 (Story 6.5)
resolution: Story 6.5's Dev (2026-10-05) ran `tools/probe/record-mode-resolution.py` on T1 (6.58.0) on the owner's
  in-session go: MEASUREMENTS §69 reads each input ALONE — the device (`colorScheme`) with no attribute, `data-mode` on
  a device of the other scheme, and the owner's pin as a server-rendered `scheme-*` class composed with `{{body_class}}`
  (the draft preview `/p/{uuid}/` pinned Dark, `/author/…/` pinned Light) — every per-mode `:root` property, §68's plain
  links and one section's dark override resolving as R-239's table says, behind its controls (the nonce, the pin read
  back on `<body>`, the media query, the token `<style>` off leaving `--bg-page` empty, the classed link's own colour,
  the overrides `<style>` off drawing Base). The previous theme was restored and the probe deleted, both read back. The
  Ghost 5 half is DW-326's.
severity: low
origin: Story 6.1's Review (2026-10-03), Real-infra verifier + Blind Hunter
owner: Story 6.5 (Mode resolution — three inputs, one precedence, one file), whose card names this entry.
location: `tools/probe/record-token-links.py` (`colorScheme: mode` and `data-mode` set together) · MEASUREMENTS §68
reason: either the `prefers-color-scheme` block or `:root[data-mode="dark"]` alone produces §68's dark rows. Separating
  them is a T1/T3 write (the owner's in-session go), and 6.5 records the third input on the same servers anyway.
note (Story 6.5's Create, 2026-10-05): planned on T1 alone (R-238; the Ghost 5 half joins DW-326's pass). A new recorder,
  `tools/probe/record-mode-resolution.py`, writes MEASUREMENTS §69 from one probe theme. Its body class carries the pin
  by page, composed with `{{body_class}}`: Auto on `/`, Dark on the draft article, Light on the author page. Chromium
  reads every combination of device, pin and visitor, one input at a time: the per-mode tokens, §68's link rows and one
  section's dark override, each behind its controls.
note (Story 6.5's Dev, 2026-10-05): the recorder is built and catalogued, and was smoke-run locally with no Ghost — its
  theme gscan-clean on both majors, its driver and judge over a hand render of the probe's `default.hbs` for each pin,
  every control held and every value as ruled; then run on T1 on the owner's in-session go, in the main session
  (RESET-PROTOCOL.md § Ghost), which wrote MEASUREMENTS §69 — the resolution above.

### DW-319: a signed-out visit to a signed-in page is redirected, but the page's own content still travels with the redirect

plain: Someone who is not signed in and opens app.inflozo.com/pilots is sent to the sign-in page, as intended — but the
  reply that sends them there also carries the page's sample content. On that page it is only sample data; nobody has
  yet checked every signed-in page for the same thing.
status: open
severity: low
origin: Story 6.1's Review (2026-10-03), Real-infra verifier — pre-existing, not this story's change
owner: Story 15.1 (The E2E suite, including the keyboard-only journey), whose card names this entry.
location: `apps/web/app/(app)/app/(authed)/layout.tsx` (`redirect('/sign-in')`) · executed: `GET https://app.inflozo.com/pilots`
  signed out answers 307 with a ~100 kB body (design CSS, sample-publication rows, a `NEXT_REDIRECT` marker)
reason: Next renders a page beside its layout, so the layout's redirect does not stop the page's own reads. Every
  customer read goes through the user's RLS session and returns nothing signed out, which is the expected answer — but
  it is a hypothesis until each `(authed)` page is requested signed out and its body read (standing rule 1).

### DW-320: two sample sections change layout at one width and spacing at another

plain: Between 1,024 and 1,080 px wide the Latest Post hero is already in its tablet layout but still has desktop
  spacing, and between 835 and 1,023 px the Centred post header has tablet spacing under a desktop-size title. No
  drawing shows those in-between widths.
status: open
severity: low
origin: Story 6.1's Review (2026-10-03), Blind Hunter + Edge Case Hunter + Verification Gap
owner: Story 10.1 (A4 — the content model, the stylesheet and designs #1, #3, #4 and #17), whose card names this entry and Story 10.79's half.
location: `packages/library/designs/a4/13/style.css` (`@media (max-width: 1080px)`) · `a24/1/style.css`
  (`@media (max-width: 834px)`) · `packages/section-runtime/src/tokens.ts` `BANDS` (1023 · 767)
reason: Story 6.1 moved section padding and page margin into the token bands (the category frames' ≥ 1024 · 768–1023 ·
  ≤ 767) and left each design's own layout breakpoints as drawn. The matrix photographs 1440, 834, 720 and 390, so
  neither window is drawn. A24 #1's Spacious on a phone also moved 88 → 84 px (A4-0's ladder; A24's spec names only
  Comfortable there).

### DW-321: two computed values have no reader yet, and one stand-in inset is wide

plain: The error red is checked for readability on the page and on cards but not on raised menus, and picture captions
  in the post preview are now inset by the page margin, which narrows them. Nothing on screen uses the red yet.
status: open
severity: low
origin: Story 6.1's Review (2026-10-03), Acceptance Auditor + Blind Hunter
owner: Story 10.83 (A25 — the content model, the stylesheet and designs #2, #3, #4 and #5), whose card names this entry.
location: `packages/section-runtime/src/tokens.ts` `negative()` (Paper dark `#F04737` on `--bg-elevated` `#2A261F` is
  4.06:1) · `apps/web/lib/style-guide.ts` `THEME_CSS` `figcaption{padding:0 var(--site-margin)}` (72 px a side inside
  the 720 px measure at desktop; it was 24)
reason: the spec's I/O matrix fixes the negative rule to background and surface and Paper's dark value to `#F04737`,
  and its task list moved all three of `THEME_CSS`'s side margins; neither is a defect a reader has met.

## Deferred from: Story 6.2's Create (2026-10-03)

### DW-322: two ways into the packs that Story 6.2 leaves for the switch — the New project window's choice and the roster below 1280

plain: The New project window is drawn with a choice of packs (Paper and Tangerine), and the Style Pack list should be
  reachable on a tablet too. Story 6.2 shows the twelve packs but lets nobody pick one, so the window keeps Paper alone
  and the list is reached only on a wide screen until the story that makes picking work.
status: done 2026-10-04 (Story 6.3)
resolution: Story 6.3's Dev (2026-10-04): both doors are built. The New project window offers the twelve as D4a's cells — native radios `name="preset"` inside the form, Paper checked, the ring on `:checked` — fed `packCells()` from the server, and `createProject` writes `{ preset }` (`presetIdOf`'s rule: anything else is Paper). Below 1280 the ⋯ menu carries a **Style Pack** row before Theme settings (absent on a template surface, live reading along) opening the Controls overlay on the list. Held by the keyboard journey's "⋯ → Style Pack" stop at 720 × 900 and the 5.22 rows stop, and on production by `run-verify-dashboard.py`'s `sheet-packs` and `created-in-pack` (First Run's sheet creating a project in Neon, read back off the pooler, its card wearing Neon).
severity: medium
origin: Story 6.2's Create (2026-10-03), reading D4a, S4a and Story 5.22's narrow layout together
owner: Story 6.3 (The pack-switcher moment), whose card names this entry.
location: `D4 Dashboard Sheets and Blocks.dc.html:105-116` (D4a's Style Pack row: Paper active, Tangerine, "+ New
  pack") · `apps/web/app/(app)/app/(authed)/new-project-sheet.tsx` (one Paper cell) · `editor.tsx` (below 1280 the
  Controls panel is an overlay opened by a selection, so S4a's rest panel and its Style Pack card are not shown) ·
  `EXPERIENCE.md:60` (Style Packs: tablet and desktop)
reason: R-118 — a control arrives with the story that makes it work. Choosing a pack, in the New project window or the
  roster, writes `projects.style_pack` and needs the canvas to wear the chosen pack, which is 6.3's; the "+ New pack"
  cell is 6.4's.

## Deferred from: code review of spec-6-2-the-twelve-presets-and-the-font-pool (2026-10-03)

### DW-323: the font pool's whole record rides into the browser with the New project window and the editor

plain: To draw a pack's name, fonts and dots, the app's pages now load the full list of every font file with its
  fingerprint, though they use a few names from it. Nothing is wrong on screen; the pages are a little heavier than
  they need to be.
status: done 2026-10-04 (Story 6.3)
resolution: Story 6.3's Dev (2026-10-04), measured on the build: `REFERENCE_PACK`, `REFERENCE_TOKENS` and `referenceTokensCss` moved to `@inflozo/section-runtime/reference` and `fontFaceCss` off the index (it stays on `./fonts`), so the runtime's index — every canvas client's import — reaches no preset and no pool; no client module imports `lib/style-pack.ts` or `@inflozo/library/packs` any more (the editor is handed `packChoices()` — names, dots, swatches and each preset's canvas `tokens` and `faces`, 78,845 bytes, 7,750 gzipped, in its server payload — the New project window `packCells()`, the chrome layer `PACK_FAMILY_PREFIX` from `lib/pack-switch.ts`). `tools/check-traces.mjs` now refuses a `.next/static` chunk naming `licenceFile` or any sha256 `pool.json` records, and a runtime index whose relative imports reach `@inflozo/library/packs`: red on Story 6.2's build (`0bebwu-me1gyy.js` and `3fqh80dol2fgc.js`, 134 of 134 each, and `tokens.ts` and `fonts.ts`), green on 6.3's (none of 34 chunks). CI runs it after `pnpm build`. `reference-tokens.css` unchanged byte for byte (`test-vocabulary.mjs`).
severity: low
origin: Story 6.2's Review (2026-10-03), Blind Hunter + Verification Gap; not measured on a built bundle
owner: Story 6.3 (The pack-switcher moment), whose card names this entry.
location: `apps/web/lib/style-pack.ts` (imports `@inflozo/library/packs`, which loads `pool.json` and `packs.json`) ·
  its client readers `new-project-sheet.tsx`, `lib/canvas-layer.ts`, `(editor)/style-pack.tsx` (which also runs
  `packTokens` for every preset at import)
reason: 6.3 is the story that makes the client need the presets (the switch paints from them), so what the browser
  must carry is decided there, with a measurement; trimming it now would be done twice.

### DW-324: what the photo check still does not photograph — the widest weights, bold italic, a heading's accented letters, and a button on a dark band

plain: The sample photograph per font pairing draws headings at two fixed weights and accented letters in the text font
  only, so the heaviest headings you approved for Broadsheet and Fieldnote, a bold italic, and accented letters in a
  heading font are never photographed. Nothing checks that a photograph was drawn in Inflozo's own font file rather
  than a stand-in, except for Paper. And no photograph shows a section's button on the dark band.
status: done 2026-10-04 (Story 6.4)
severity: medium
origin: Story 6.2's Review (2026-10-03), Blind Hunter + Verification Gap
owner: Story 6.4 (Editing tokens, per mode, with contrast checked live), whose card names this entry.
location: `tools/matrix/cases.mjs` `specimenMarkup` (`font-weight:700` and `600`; latin-ext in the body face only) and
  `fixture` (`controls: {}`, so no case sits on `data-bg="contrast"`) · `tools/matrix/matrix.spec.mjs` (the manifest's
  fonts are Paper's document's alone) · `packages/library/designs/a4/13/style.css` (DW-317's rule, rendered by nothing)
reason: every one changes the specimens or adds cases, which is a rebaseline behind the owner's sampled review
  (`docs/render-matrix.md`); R-233's specimen is what he ruled, and 6.4 is where any pairing becomes pickable, so the
  eighteen that no preset wears first reach a customer there.
note (Story 6.4's Create, 2026-10-04): planned. Each specimen draws every role at both ends of its declared weights
  (`pool.json`'s `range`, `italic`, `weights`), a bold italic and a latin-ext line in the heading face. Every line is
  checked to be drawn in the pool's own face with CDP's `CSS.getPlatformFontsForNode`: `isCustomFont` and the role's
  family. Executed at Create in Chromium 149: the pool's Fraunces reports `isCustomFont: true` and a fallback
  (Liberation Serif) `false`. The family alone cannot tell them apart, because the matrix image installs a system Inter.
  Every design whose `bg` offers `contrast` and whose stylesheet draws a `--button-fill` button is photographed on
  contrast under each Outline reference pack (Mono), in both modes. All of it is one mass rebaseline behind his sampled
  review in Dev.
resolution: Story 6.4's Dev (2026-10-04). `tools/matrix/cases.mjs`'s specimen draws every role at both ends of the
  weights `pool.json` declares (`weightEnds`: the heading's range or static weights, the body's roman and italic), a
  bold italic run and a latin-ext line in the heading face, each line naming its family; `matrix.spec.mjs` holds every
  line to the faces Chromium drew it with — `isCustomFont` and the role's family (or the family and a style: the
  instanced Chivo names itself "Chivo Medium") — behind a positive control (a line in a system face must be caught).
  `onContrast` derives the designs photographed on the contrast ground (a22/1 and a4/13 today: `bg` offers `contrast`
  and the stylesheet draws a `--button-fill` button) under every Outline reference pack (`outlinePacks`: Mono), light
  and dark, at 1440. `cases.test.mjs` holds both derivations; `docs/render-matrix.md` describes them. The mass rebaseline
  ran inside the pinned image: every pairing's specimen moved and the contrast-ground photographs are new, nothing
  else (one photograph re-taken one pixel off by 1/255 was put back as it was); the gate is then green — every case,
  zero axe violations, every specimen line in the pool's own face. The owner approved the sampled review in the Dev
  session (Story 6.4's Question 4, 2026-10-04), and the baselines land in their own commit right after the Dev commit.

### DW-325: the Style Pack card, the list and the Pack menu have only ever been run with Paper

plain: Until a pack can be chosen, every project is Paper, so no test has shown the card and the list following a
  project whose pack is something else, or `/pilots` really changing the page when its menu changes. Two smaller
  things also have no test: which address the app asks for a pack's font, and that the editor does not copy pack fonts
  into the page it draws.
status: done 2026-10-04 (Story 6.3)
resolution: Story 6.3's Dev (2026-10-04): the harness takes `x-inflozo-harness-pack: <id>` as the project's stored pack, and the keyboard journey opens on Mono — the card, the list, the canvas document (asked for with `&pack=mono`), the Background role's dots and a Section Picker card all Mono's; the deployed editor walk's step 102 opens a fresh browser in a pack the save wrote. The host → font-address rule is `routing.ts`'s `canvasRouteOn` (`routing.test.ts`) and the chrome's face rule `lib/canvas-layer.ts`'s `chromeFace` (`canvas-layer.test.ts`: an `Inflozo pack *` face is never copied into the canvas). `/pilots` reads the editor's own address rule (`packed`), and `run-verify-pilots.cjs` checks its Pack menu reaching the canvas document — Mono's `&pack=mono` and token, then Paper's bare address.
severity: medium
origin: Story 6.2's Review (2026-10-03), Verification Gap
owner: Story 6.3 (The pack-switcher moment), whose card names this entry.
location: `(editor)/read.ts` (`style_pack` in the select) · `(editor)/style-pack.tsx` `current()` ·
  `app/harness/editor/layout.tsx` (the fixture is always `DEFAULT_PRESET`) · `pilots/review.tsx` (`&pack=`) ·
  `(authed)/layout.tsx` (`onApp`) · `lib/canvas-layer.ts` (`PACK_FAMILY_PREFIX` skipped)
reason: no project can hold another pack until 6.3's switch writes one; its journey is the first run where the stored
  value is not the default, and it needs a harness fixture that sets the preset.

## Deferred from: the owner's ruling R-238 (2026-10-04)

### DW-326: the Ghost 5 half of every test, postponed to one pass at the end of the project

plain: T3, the Ghost 5 test server, was hacked on 2026-10-03 and is destroyed. From 2026-10-04 everything is tested on
  Ghost 6 (T1) only. Ghost 5 is still supported by the product, so before launch one pass re-runs on a fresh Ghost 5
  server everything that used to run on both.
status: open
severity: medium
origin: the owner's ruling R-238 (2026-10-04), after DigitalOcean's DDoS report on T3
owner: Story 15.7 (The Ghost(Pro) launch gate), the end-of-project gate before public launch, whose criteria carry this pass with its id; the owner spins up a Ghost 5 server for it (`tools/probe/provision-ghost.sh`)
location: every `T1 and T3` / `T1–T3` / `both majors` line in `epics.md` and the story specs (grep for them; never
  count them here) · every probe script with a GHOST5 leg (`grep -l GHOST5 tools/probe/*`) · the recorded Ghost 5
  fixtures `packages/library/contexts/fixtures/ghost5.json` and `packages/ghost-shim/fixtures/ghost5/`, frozen at
  their last recording · NFR-7's 5.x claim and FR-J2's `engines.ghost: ">=5.0.0"`
reason: an end-of-life Ghost on the public internet was the server that got hacked; testing it story by story was
  declined. Until the pass, NFR-7's 5.x claim rests on the earlier T3 recordings and nothing newer. A probe script that
  refuses to run without T3 has its T3 leg made optional by the story that next runs it. A Ghost 5 check that cannot
  wait is asked of the owner, never skipped silently.
note (Story 6.5's Dev, 2026-10-05): the pass gains MEASUREMENTS §69's Ghost 5 half — `tools/probe/record-mode-resolution.py`
  runs T1 alone (its `GHOST6_*` keys); the Ghost 5 leg is that recorder pointed at the fresh server, and §69 says so.
note (Story 6.6's Create, 2026-10-05): `tools/probe/run-verify-ghost-admin.py` is next, at 6.6's Review. Today it reads
  `GHOST5_*` and calls T3 on every run, `--check` and `--only` included. 6.6 makes its `--only` path T1-only. A full run
  still needs a Ghost 5 server, so its T3 steps wait for this pass, and so do the full-sequence brand steps 6.6 moves to
  the seeded pack (`brand-seed`, `brand-atcap`, `brand-picker`).
note (Story 6.6's Dev, 2026-10-05): done for this script's `--check` and `--only`: both read `GHOST6_*` alone, and
  `settings-keys` and `brand-keys` run on T1, each printing its T3 leg as POSTPONED (R-238). An `--only` block whose
  seeds need T3 (`moved-domains`) is named as postponed rather than run, and so is `manage-keys`' `keys-foreign-key`,
  which pastes T3's key into T1's screen. The pass owes: this script's full run (its T3 connect, cap and moved-domains
  steps), and the full-sequence brand steps, now reading the seeded pack.
note (Story 7.2's Dev, 2026-10-06): the pass gains MEASUREMENTS §71's Ghost 5 half — `tools/probe/record-theme-assembly.py`
  runs T1 alone; its Ghost 5 leg is the same rows on the fresh server, the compiled `package.json` included. The pass must
  also confirm on a real Ghost 5 what Story 7.2 read in 5.130.6's `CardAssets.js` and executed with its pinned tiny-glob
  0.2.9: `card_assets: { exclude: [] }` becomes the glob `css/!().css`, which matches nothing, so no card bundle is built
  while `{{ghost_head}}` still links one. 7.2 writes `card_assets: true` while no card is designed (its Question 2), so
  the empty list is never emitted; the pass checks that the reason holds.

## Deferred from: code review of spec-6-4-editing-tokens-per-mode-with-contrast-checked-live (2026-10-04)

### DW-327: "Use your brand" can overwrite a Style Pack edit saved at the same moment

plain: If you press "Use your brand" in one window at the very moment the editor saves a pack you just edited in
  another, the brand button writes the older packs back and your edit is lost without a message. It needs both to
  happen within a fraction of a second, so it is unlikely, but nothing prevents it.
status: done 2026-10-05 (Story 6.6)
severity: low
origin: code review of spec-6-4-editing-tokens-per-mode-with-contrast-checked-live.md, 2026-10-04 (Blind Hunter, Edge Case Hunter)
owner: Story 6.6 (Auto-branding seeds the pack), which rewrites this action and whose card names this entry.
location: `apps/web/app/(app)/app/(authed)/sites/actions.ts`, the "Use your brand" write (`.update({ style_pack: { ...pack, brand } })`)
reason: the action is older than this story and reads `style_pack`, then writes the whole object with no revision
  check, while the editor's save merges by key inside `sync_project_doc`. Since 6.3 the exposure was one preset id;
  since 6.4 it is every pack the project authored. The fix is to write `brand` by key (in SQL, or through the RPC), and
  Story 6.6 changes what this action writes, so it is fixed there rather than twice.
note (Story 6.6's Create, 2026-10-05): planned, by the RPC and without writing `brand` at all. Once the accent is in the
  pack, nothing reads `brand`. Writing it by key would need a migration, because PostgREST cannot merge into jsonb and
  the owner's session cannot bump `revision`. So `useBrand`'s one write to an existing project is `sync_project_doc` with
  the project's revision as its base and the whole validated `packs` map. A stale base re-reads and re-seeds, at most
  three times. A source test holds that the action writes `style_pack` nowhere else. The race itself is not staged end
  to end: its guard is the compare-and-set the RLS gate already proves.
resolution: Story 6.6's Dev (2026-10-05) — done as planned. `useBrand`'s `paint` calls `sync_project_doc` with the
  project's `revision` as `p_base`, `lib/style-pack.ts`'s `brandPacks` answering the whole validated `packs` map with the
  pack in force seeded and 3.4's preset floor; on `applied: false` it re-reads that one project and seeds on top of what
  is there, at most `BRAND_TRIES` (three) times, then S2c's failed line. A new project's insert carries the seeded map;
  `brand` is written nowhere, and a seed that changes nothing writes nothing. Proof: `server-wiring.test.ts`'s DW-327
  guard (no source updates `style_pack` whole; `useBrand` calls the RPC against the revision it read) beside its
  planted control (the old `.update({ style_pack: { ...pack, brand } })` fires it); the RLS gate's 6.4 stale-base case
  for the compare-and-set; and `brand-pack-rerun` on the deployed build at Review (a planted Tangerine record and `mode`
  byte-equal after the press, the revision up by exactly one).
  **Review (2026-10-05): `brand-pack-rerun` ran on the deployed build and passed**, with two additions: a second press
  moves no revision, and `brand-many` presses a picked card (seeded, revision up by one, still unbound). The loop that
  answers a stale base had no check that ran it, so it was lifted out of the action into the pure `brandWrite`
  (`lib/style-pack.ts`) and tested: re-read, seed over the pack saved meanwhile, give up after `BRAND_TRIES` writes.

## Deferred from: Story 6.5's Dev (2026-10-05)

### DW-328: the visitor's dark-mode button has two questions left — a flash before its script runs, and two states or three

plain: When Epic 9 builds the small sun-and-moon button visitors press on your site, two things are still open: whether a
  page briefly shows the wrong mode before the button's script has run, and whether visitors get two choices (Light,
  Dark) or three (Light, Dark, follow my device).
status: open
severity: medium
origin: Story 6.5's Create (2026-10-05), read in `research-section-js-libraries.md` while stating what the module does
  under a pin (R-239)
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), the first story that builds
  the `mode-toggle` module, whose criteria carry this entry with its id.
location: `research-section-js-libraries.md` §2.1 row 28 and the module table (`mode-toggle`: "a tiny inline head script
  to avoid the flash"; "Three states (Auto/Light/Dark) as a radio group, not a two-state switch") · `prd.md` NFR-2 (3)
  ("no render-blocking JS — every theme script is `defer`red or `type="module"`") · the A1 frames' two-state toggle
  (`A1 Headers - Spec.md`, the designs that declare `mode-toggle`)
reason: 6.5 states what the module does on a pinned page and makes the pin win in CSS; it builds no module (its
  boundaries). The flash: a `data-mode` restored by a deferred script lands after first paint, so a visitor who chose
  Dark on a light device sees Light first — the research's answer is an inline head script, which NFR-2 (3) does not
  name as allowed. The states: the research asks for three as a radio group and the A1 frames draw a two-state toggle;
  two states silently discard a visitor's return to their device's setting. Both are the owner's to rule (R-83) at
  9.1's Create, with the frames in front of him (R-74).

## Deferred from: code review of spec-6-5-mode-resolution-three-inputs-one-precedence-one-file (2026-10-05)

### DW-329: Three Up's "Newer / Older" hover underline is the brand accent even on a dark band

plain: On the Three Up post grid, when its background is Contrast, hovering "Newer posts" or "Older posts" underlines the
  words in your ordinary accent colour, while the keyboard focus ring beside it uses the accent made for that dark band.
  It has always looked this way; nobody has checked it against the drawing.
status: open
severity: low
origin: Story 6.5's Review (2026-10-05), the Blind Hunter, reading the refactored stylesheet's comment against its rules
owner: Story 10.54 (A17 — the content model, the stylesheet and designs #1–4), whose criteria carry this entry with its id.
location: `packages/library/designs/a17/1/style.css`, `.a17-1__newer:hover, .a17-1__older:hover` (`var(--accent)`) beside
  the `:focus-visible` rule under it (`var(--a17-1-mark)`)
reason: older than this story, whose refactor was bound to move no pixel — and it moved none; the comment that claimed
  otherwise is corrected here. Changing the colour is a moved photograph, which is the owner's approval (R-116), with
  A17's frame in front of him (R-74).

### DW-330: a section's Surface and Contrast looks are photographed for almost no design, and one kind of control is not held to the dark-override rule

plain: The photo check draws each design on its default background, and on Contrast only for two of them. So a wrong colour
  on a design's Surface or Contrast background could ship with every check green. Separately, a control that another
  control switches off could behave differently in the editor's Dark preview than on a visitor's dark page; no design
  does this today.
status: open
severity: medium
origin: Story 6.5's Review (2026-10-05), the Verification Gap reviewer and the Acceptance Auditor
owner: Story 9.1 (A1 — the content model, the stylesheet and designs #1, #3, #4 and #13), the first story that authors
  designs against `mode-scoped-rule`, whose criteria carry this entry with its id.
location: `tools/matrix/cases.mjs` (`onContrast`, the default-controls cases) · `tools/keyboard/mode.spec.mjs` (its sweep
  compares the theme's way with the canvas's way, both drawn from the SAME stylesheet, so it has no oracle for which
  token a ground should carry) · `packages/library/src/validate.ts` (`disabledBy.control` may name a mode-scoped control)
reason: 6.5's proof that its refactor moved no pixel was a one-off comparison against the previous stylesheets, right
  for a refactor and gone once it is done; the standing net is the render matrix, and widening it writes new baselines,
  which this story's boundaries forbade and which need the owner's sampled approval (R-116). The `disabledBy` case
  needs a ruling only if a design wants it — a Background that switches a control off is plausible (an overlay only on
  Image) — so it is asked then (R-83), not refused blind now.

### DW-331: three things the story that first compiles a theme must close about the per-section dark hook

plain: When Inflozo starts building real themes, three loose ends matter: the editor and the theme must name each section
  the same way; two sections must never be given the same hidden name without a clear remedy; and the checks that run
  on every change should watch the editor do this in a real browser, not only read its code.
status: done 2026-10-08 (Story 7.4)
resolution: Story 7.4 (2026-10-08) — ONE KEY: `sectionKey(templateKey, instanceId)` and `hookOf(key)` in
  `dark-override.ts` (exported by the runtime), and `templateKeyOfFile(file, pageTwo)` in the library's `vocabulary.ts`,
  held equal to the app's own key↔file map by `editor.test.ts`. The editor's `queryKey`, both `keyOf`s, the compile and
  `mode.spec.mjs` build through `sectionKey`; each stack row carries `themeKey`, the key the theme hashes it under — its
  doc's, except on a Tag or Author page 2 that follows page 1, which the editor used to hash as `tag-paged:…` while the
  theme serves page 1's markup — and the editor hashes it only when `darkEnabled` (it stamped hooks on a Light-only
  project). `page-two.test.ts` checks every canvas × page × designed-or-following. A COLLISION is refused by name, before
  `darkOverrideCss`, naming both layers and files with the remedy ("Delete one of them and add it again — it gets a new
  name."). THE BROWSER PROOF: two keyboard-gate journeys, `7.4 · DW-331 · the hook on the canvas` and `· /pilots draws a
  Background set in Dark` (`/pilots` mounted in the harness at `/app/harness/pilots`), each behind its control and each
  seen failing on a mutated editor and `/pilots`; `dark-mode.test.ts`'s two source-text guards are deleted.
severity: medium
origin: Story 6.5's Review (2026-10-05), the Blind Hunter and the Verification Gap reviewer
owner: was Story 7.4 (Assets, fonts, per-design CSS and the dead-code strip), which wrote `darkOverrideCss` into the theme's
  token block and whose criteria carried this entry with its id — closed there, 2026-10-08.
location: `packages/section-runtime/src/dark-override.ts` (`darkHook`'s key is a string its callers each build;
  `darkOverrideCss` throws on a colliding pair) · `editor.tsx`'s `queryKey` · `apps/web/dark-mode.test.ts` (source-text
  guards on the editor's and `/pilots`' calls) · `tools/probe/run-verify-editor.cjs` steps 48-49 and
  `run-verify-pilots.cjs`' Dark stop (the browser proof, run by hand on the deployed site)
reason: nothing compiles a theme yet, so nothing can drift from the editor's key or meet a collision today, and the
  hook changes nothing visible on the canvas (it carries no per-section rules). 7.4 is where a second caller of the key
  appears and where a collision becomes a customer's failed publish, so the shared key builder, the remedy and the
  browser assertion are built with their first real consumer rather than guessed at here.

### DW-332: the mode-resolution recorder's cleanup has three gaps to close before it runs again

plain: The script that tested light and dark on your test site cleaned up correctly when it ran. Reading it closely shows
  three unlikely ways it could leave something behind on a future run — an unused test theme, or the test article left
  published.
status: open
severity: low
origin: Story 6.5's Review (2026-10-05), the Real-infra verifier and the Edge Case Hunter, read in the source — none of
  the three happened on the recorded run (T1 read back clean at Review)
owner: Story 15.7 (the Ghost(Pro) launch gate), whose Ghost 5 pass (DW-326) is the recorder's next run and whose
  criteria carry this entry with its id.
location: `tools/probe/record-mode-resolution.py` — the upload and `name = …` before the `try`; `except Exception` around
  `restore_and_delete` (an interrupt skips `to_draft`); the publish fallback's trigger (status, nonce and `gh-content`,
  never the `scheme-dark` class the hypothesis is about); the driver's `response.status()` on a null response
reason: the script writes to a live Ghost and cannot be exercised without the owner's go (`RESET-PROTOCOL.md`), so a
  cleanup path rewritten at Review would ship untested. Review made the one change that cannot alter a run — every
  cleanup failure is now printed, not only the first — and leaves the rest to be changed and run together.

## Deferred from: Story 7.1's Create (2026-10-05)

### DW-333: the canvas draws a repeat's rows touching, and Ghost renders a line break between them

plain: When a section repeats something — a list of posts, a row of tag chips — the editor draws the copies right next
  to each other, while your live site puts a line break and some spaces between them. For cards in a grid or a column
  that makes no difference you can see. For small items sitting side by side in a line of text, the live site would
  show a gap the editor did not.
status: open
severity: low
origin: Story 7.1's Create (2026-10-05). Executed on handlebars 4.7.9 in the scratchpad with Ghost's own compile
  option (`preventIndent: true`): two rows rendered as `</li>\n    <li`. Read in `core.ts`: `expandRepeats` inserts each
  canvas clone with `el.before(clone)` and nothing between them. It has been there since Story 4.2; Story 7.1's
  formatting keeps the theme's whitespace exactly as it was.
owner: Story 7.34 (The canvas-vs-real-Ghost comparison harness), whose criteria carry this entry with its id.
location: `packages/section-runtime/src/core.ts` — `expandRepeats` (the canvas) and the repeat replacement in
  `renderTree` (`{{#foreach}}` … `{{/foreach}}` on lines of their own)
reason: Every repeated item in the library today is a grid item or a block (A17 #1's cells, A4 #13's one card), where
  whitespace does not render, so the difference cannot be seen yet. Making the two emitters agree means changing one
  of them: the canvas inserts what Ghost renders, or the theme trims with Handlebars' `~`. That choice belongs with the
  measured difference on a real Ghost, which is 7.34's comparison.

### DW-334: no story's criteria ship the Koenig width rules on a theme with no designed card

plain: Every Ghost theme has to style two classes Ghost puts on wide and full-width pictures in a post, or Ghost's own
  checker reports an error. Round 3 ruled that the cards stylesheet always carries them; no story had written that down
  as something it builds.
status: open
severity: medium
origin: Story 7.1's Create (2026-10-05), building the T1 recorder's scaffold. Round 3's D12 put `.kg-width-wide` and
  `.kg-width-full` in `cards.css` "on every theme" (AD-18), and MEASUREMENTS §14c recorded `GS050-CSS-KGWF` as an error
  on both gscan majors without them. Story 7.13's criteria emit `cards.css` for designed cards and name neither class.
owner: Story 7.13 (The Ghost card design module and `cards.css`), whose criteria carry this entry with its id.
location: `epics.md` Story 7.13 · `ARCHITECTURE-SPINE.md` AD-18 (D12's rule) · `tools/stress/build.js` (the harness
  writes both rules by hand)
reason: The rule was decided and never owned. Until 7.13 lands, Story 7.1's recorder adds the two rules as scaffold,
  labelled with 7.13's name, so its gscan gate can read 0/0.

### DW-335: no story emits the `package.json` marker that restore scope is gated on

plain: Inflozo must never mistake a theme it built for the customer's own "original" theme when it takes the safety
  copy. The plan says every Inflozo theme carries a marker in its `package.json` for exactly that, but no story was
  given the job of writing it.
status: done 2026-10-06 (Story 7.2)
resolution: Story 7.2 (2026-10-06) — `compileTheme` writes `package.json`, and FR-J13's marker is its top-level
  `"inflozo": true`, written last (`THEME_MARKER`, exported by `@inflozo/theme-compiler`). It survives a renamed
  package, sits outside Ghost's `config` namespace and carries no id, hash or date. It is one of the three named marks
  (with `name` and `author`) that the fingerprint scan exempts: `compile.test.ts` and `tools/pilot-theme.mjs`'s
  `themeFailures` read `package.json` without them, and a builder's name anywhere else in the file fails. FR-J13 and
  Story 7.20's card name the key and the `GET /themes/` read that finds it without a download.
severity: medium
origin: Story 7.1's Create (2026-10-05). The Epic 7 context compile set FR-J1's "no builder fingerprints" against
  FR-J13's marker. Story 7.20 reads the marker ("signature-gated on the `package.json` marker"), and Story 7.2, which
  writes `package.json`, never names it.
owner: Story 7.2 (`package.json` emission), whose criteria carry this entry with its id.
location: `prd.md` FR-J13 ("every Inflozo-built theme carries an `inflozo-*` name and a `package.json` marker") ·
  `epics.md` Stories 7.2 and 7.20 · Story 7.1's spec, Design Notes § What "no builder fingerprints" means
reason: The marker is a specified mark, not an incidental fingerprint. It belongs with the file that carries it, and
  joins Story 7.1's fingerprint scan as a named exception when 7.2 emits it. Its exact field and form are 7.2's to state.

## Deferred from: code review of spec-7-1-theme-assembly-the-mechanism-and-the-formatting-contract (2026-10-06)

### DW-336: a layer named `con`, `nul`, `aux`, `prn`, `com1`… slugs to a file Windows cannot extract

plain: A section's file is named after its name in Layers. A handful of names are reserved by Windows for devices, so
  a theme zip holding `partials/sections/home/con.hbs` cannot be unpacked on a Windows machine, though Ghost itself
  would serve it fine.
status: open
severity: low
origin: Story 7.1's review (2026-10-06), the edge-case layer. `partialSlug` is §7.4's custom-template rule plus a cap,
  stated in the spec's Design Notes; a reserved-name rule would change that stated rule, and the download is 7.26's.
owner: Story 7.26 (the theme download), whose criteria carry this entry with its id.
location: `packages/theme-compiler/src/slug.ts` · Story 7.1's spec, Design Notes § The partial slug
reason: The same names bite a custom template (`custom-con.hbs` is fine; `con.hbs` cannot arise there), so the rule
  belongs where the file leaves the product. 7.26 either suffixes a reserved slug or records that the zip is not for
  Windows.

### DW-337: `stripCssComments` cuts an unquoted `url(http://x/*/y)` at the `/*`

plain: The compiler strips the comments out of a design's stylesheet before shipping it. A web address written inside
  `url(…)` without quotes and containing `/*` would be mistaken for the start of a comment and the rule cut short.
status: done 2026-10-08 (Story 7.4)
resolution: Story 7.4 (2026-10-08) — `COMMENT_OR_STRING` reads an unquoted `url(…)` first, as CSS tokenizes it (to its
  `)`, an escape taking the next character, never after a name character), so `stripCssComments`, `untokened` and the
  theme compiler's strip read one scan; `validate.test.ts` keeps `url(http://x/*/y)` whole and removes a comment after
  it, a quoted URL is read as before, and the control (`myurl(…)`, no URL) still reads its comment.
severity: low
origin: Story 7.1's review (2026-10-06). The scan (`COMMENT_OR_STRING`) predates 7.1 — `untokened` read it since
  Story 4.8 — and 7.1 only made it the compile's stripper; no design writes an unquoted `url()`.
owner: Story 7.4 (assets and the dead-CSS strip), whose criteria carry this entry with its id.
location: `packages/library/src/validate.ts` `COMMENT_OR_STRING`, `stripCssComments`
reason: 7.4 rewrites every `url()` to a bundled asset and is the story that reads them; a `url\(…\)` alternation kept
  before the comment branch, or a refusal of an unquoted `url()`, is its call.

### DW-338: a layer name has no length cap, so a boundary comment line has none

plain: The one-line label above each section in a theme file repeats the section's name from Layers. Nothing limits how
  long that name can be, so a very long name makes a very long line — harmless to Ghost, untidy to a hand editor.
status: open
severity: low
origin: Story 7.1's review (2026-10-06). The file name is cut to 60 characters (`SLUG_MAX`); the comment is not.
owner: Story 7.21 (drift and the Layers rename flow), whose criteria carry this entry with its id — or the Layers
  panel's own cap if one lands first.
location: `packages/section-runtime/src/doc-schema.ts` `layerName: z.string()` · `packages/theme-compiler/src/compile.ts`
  `commentPart`
reason: A cap belongs at the input (the Layers panel) so the file and the label agree, not in the compiler.

### DW-339: the pilot theme's "internal reference" scan reads `R-1`, `Story 3` and `ponytail` in any text

plain: The checker that keeps builder notes out of a theme looks for patterns like `R-12` or `Story 3` anywhere in
  the files. A customer whose newsletter is called "Story 3" would trip it once the check runs over real projects.
status: open
severity: low
origin: Story 7.1's review (2026-10-06). Today the scan runs only over the five pilots with fixed words
  (`tools/pilot-theme.mjs` `themeFailures`, `compile.test.ts`), where it cannot misfire.
owner: Story 7.33 (the library-wide nightly compile), whose criteria carry this entry with its id.
location: `tools/pilot-theme.mjs` `themeFailures` · `packages/theme-compiler/src/compile.test.ts`
reason: Anchor the pattern to comment contexts (`{{!--` and `/*`) when the scan first meets user text; a word in a
  heading is the customer's, not a fingerprint. *(Story 7.5's Dev, 2026-10-08: the scan also misses letter-bearing ids — `FR-G7(4)`, `FR-J4`, `FR-G4` — since its
  pattern wants digits after the dash. Found while rewriting `core.js`'s comments, which carried both kinds; those were
  removed by hand. The scan is now `textFailures` and holds every module file too, so the anchoring and the id shape
  land together.)*

### DW-340: the start tag the formatter cannot re-spell is never broken, and no test shows it

plain: When a tag's attributes cannot be read back from the way the browser writes them, the formatter leaves the tag on
  one line however long it is. That is the safe choice, but no test proves the branch does what it says.
status: open
severity: low
origin: Story 7.1's review (2026-10-06), the verification-gap layer. `tags()` returns `attrs: null` when re-spelling the
  parts does not reproduce `outerHTML`; `startTag` then keeps the tag whole.
owner: Story 7.33 (the library-wide compile), whose criteria carry this entry with its id.
location: `packages/section-runtime/src/format.ts` `tags`, `startTag`
reason: The branch needs a start tag jsdom serializes in a shape the attribute regex does not match; none has been found
  in the library, so the case is recorded rather than invented.

## Deferred from: Story 7.3 (2026-10-06 — DW-341 and DW-342 found at its Create, DW-343 at its Dev)

### DW-341: a theme in which no template reads Ghost's page switch raises GS110, an error on Ghost 5's checker

plain: Ghost lets a site owner hide a page's title and picture with a switch, and Ghost 5's theme checker reports an
  error when no template in the theme reads that switch. A Page you designed with no post header gets that error — and,
  until Story 10.79, so does any project whose Page is untouched — though Ghost 5 installs the theme anyway. Whether
  Inflozo blocks such a deploy is not decided yet.
status: done 2026-10-09 (Story 7.7)
resolution: Story 7.7's Question 1, ruled option 1 (owner, 2026-10-09) — Inflozo's gate (`@inflozo/theme-compiler/gate`)
  maps `GS110-NO-MISSING-PAGE-BUILDER-USAGE` to `page_switch_unused`, a WARNING on Ghost 5 and Ghost 6 alike that never
  blocks a deploy; on Ghost 5 its detail says Ghost 5's own theme check counts it as an error and installs the theme
  anyway, and its action is to add a Post header to the Page template. `gate/gate.test.ts` holds it on both pinned
  checkers and `check-snapshots` on the pilot theme. FR-I1 says so; the switch stays Story 10.79's to read on a real
  `page.hbs`.
severity: medium
origin: Story 7.3's Create (2026-10-06), read in gscan 4.49.7 and 6.4.2 and as the planning run executed it
  (MEASUREMENTS §13a, §13b): `GS110-NO-MISSING-PAGE-BUILDER-USAGE` is an error on 4.49.7 and a warning on 6.4.2, where
  FR-I1 said it was only a warning on both. Story 7.3 puts the switch around each Post Header on `page.hbs`
  (`POST_HEADER`), so a `page.hbs` with no A24 section — or no `page.hbs` at all, which 7.3's Question 1 rules for an
  untouched Page the library leaves empty — leaves nothing reading it.
owner: Story 7.7 (The gscan gate), whose criteria carry this entry with its id.
location: `epics.md` Story 7.7 · FR-I1 and FR-J6 in `prd.md` · `packages/theme-compiler/src/compile.ts` (`PAGE_SWITCH`) ·
  `tools/probe/record-theme-assembly.py`'s stand-in `page.hbs` (Story 10.79's)
reason: FR-J6 says errors block a deploy, yet Ghost 5 activates a theme carrying this one, and 7.7 owns the mapping and
  AD-34's two gscans. Blocking it would refuse every project with an untouched Page until Story 10.79; passing it needs a
  stated exception. Either answer changes what a deploy does, so 7.7 asks the owner (R-83).

### DW-342: no story built the standard header and footer for a project that placed neither

plain: The plan promises a project that never placed a header or a footer a standard pair — the Rail header and the
  Minimal Line footer — on the live site and in the editor alike. Nobody had been given the job; Story 9.9, where
  Minimal Line is built, now has it. Until then a theme ships exactly the header and footer you placed, and none if you
  placed none.
status: open
severity: medium
origin: Story 7.3's Create (2026-10-06): `sections-inventory.md` § Synthesis Defaults §2 — "If the project has no
  header/footer singleton at all (nothing designed anywhere), synthesize A1 #1 Rail and A3 #1 Minimal Line with auto
  content" — sat in no story's criteria, and building it in the theme alone would ship a header the editor never showed,
  which FR-D6 forbids. 7.3's Question 4, ruled option 1 (owner, 2026-10-06).
owner: Story 9.9 (A3 — the content model, the stylesheet and designs #1, #3, #4 and #16), whose criteria carry the
  sentence word for word with this entry's id (R-195); Epic 9's preamble lists it.
location: `sections-inventory.md` § Synthesis Defaults §2 · `epics.md` Story 9.9 and Epic 9's preamble ·
  `packages/theme-compiler/src/compile.ts` (`default.hbs`) · the editor's site doc
reason: The header and the footer are site-wide singletons (FR-D5) compiled into `default.hbs`; synthesizing them is
  one rule for the canvas and the compiler (AD-27(d)), and A3 #1 Minimal Line arrives with 9.9.

### DW-343: the editor's three confirms drew no sheet since Story 5.22 — a local `sheet` hid the Kit's

plain: Three of the editor's questions — "this changes every page" (the header and footer), "changed somewhere else",
  and "clear the dark overrides" — have shown without their white card, padding and rounded corners since Story 5.22.
  Story 7.3 put them back, so they look as drawn again.
status: done 2026-10-06 (Story 7.3)
resolution: Story 7.3's Dev (2026-10-06) — `editor.tsx` imports the Kit's class as `sheet as dialogSheet`, so Story
  5.22's `const [sheet, setSheet] = useHanded(...)` (the compact overlay, db6965a9) no longer hides it inside
  `EditorShell`; the site-wide confirm, the conflict dialog, the Clear dark overrides confirm and D5f all draw
  `kit/dialog.ts`'s 460px, 26px sheet. `tools/keyboard/floor.spec.mjs`'s D5f test measures it (padding 26px, width
  460), and fails with the old name (executed as its control).
severity: medium
origin: Story 7.3's Dev (2026-10-06), building D5f beside the site-wide confirm: the dialogs rendered
  `class="null gap-[18px]"` (or the open overlay's name), measured 1242px wide with no padding before the rename.
owner: Story 7.3 (done here)
location: `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (the `kit/dialog` import) ·
  `tools/keyboard/floor.spec.mjs`
reason: A shadowed import is no type error when both are strings or null-able strings in a template literal, so no gate
  saw it; the floor test now does.

## Deferred from: code review of spec-7-3-synthesis-defaults-and-the-emptying-rules (2026-10-08)

### DW-344: routes reach neither D5f's sentence nor the SEO guard's context names

plain: Two rules Story 7.3 wrote assume a site with no custom routing. The warning before you delete the last section
  from a custom template says the template "stops shipping", which is false for a template a route points at (it
  keeps shipping). And the line that tells search engines not to index a feed-less page 2 names Ghost's standard page
  contexts; a site whose main post list was moved off the front page gets a context named after that route, which the
  line does not name. Both wait for the Routes Manager, which is where routes first exist.
status: open
severity: medium
origin: Story 7.3's code review (2026-10-08): `emptiesCustomTemplate(key, doc)` takes no route list, so the editor
  cannot pick the routed sentence 7.16's card promises; `compileTheme`'s `PAGED_CONTEXTS` keys Home's page 2 on `index`,
  which `collection-router.js` names only while the main collection sits at `/` (`routerName = mainRoute === '/' ?
  'index' : …`, read in source).
owner: Story 7.16 (The Routes Manager), whose card carries this entry with its id.
location: `apps/web/lib/editor.ts` (`emptiesCustomTemplate`) · `packages/theme-compiler/src/compile.ts`
  (`PAGED_CONTEXTS`, `routed`) · `epics.md` Story 7.16
reason: Routes are 7.16's input; until it hands the editor the routed list and the compiler the collection names, both
  rules are right for every project that exists, and 7.16 is the first story that can make them wrong.

## Deferred from: spec-7-4-assets-fonts-per-design-css-and-the-dead-code-strip (2026-10-08)

### DW-345: no Epic 8 story's criteria make the rendition set the upload is meant to make

plain: The plan says every picture you upload is saved in four sizes, so a phone can download the small one. The story
  that builds the upload does not say so, and the story that puts your pictures into the theme (7.29) needs those four
  files to exist.
status: open
severity: medium
origin: Story 7.4's Create (2026-10-08), moving the pictures to Story 7.29 (Question 1, owner, 2026-10-08): AD-12 says
  renditions are made in the browser at upload and compile never decodes an image, and `assets.renditions` holds them,
  but Story 8.1's criteria name WebP at 2400 px and no rendition set.
owner: Story 8.1 (Upload, optimise and sanitise), whose card carries this entry with its id.
location: `ARCHITECTURE-SPINE.md` AD-12 · `epics.md` Story 8.1, Story 7.29 · prd.md FR-J3
reason: FR-J3's 400 / 800 / 1600 + original set is bundled by Story 7.29 and made by the upload (AD-12); with no
  criterion, Epic 8 could ship an upload that makes one file and leave 7.29 nothing to bundle.

## Deferred from: spec-7-5-js-bundling-two-files-two-origins (2026-10-08)

### DW-346: the theme README's install steps, pack and pairing, and where to re-import have no story

plain: The plan says the theme's README tells you how to install it, which style pack and fonts it uses, and where to
  re-import it. Today the README has only its Scripts section; nobody had been given the rest. Story 7.26, where you
  download the theme as a zip and would read it, now has the job.
status: open
severity: low
origin: Story 7.5's Create (2026-10-08): prd.md §7.4 ("`README.md` is a deliverable, not a placeholder: it states install
  steps, the FR-J15 credit…, the Style Pack and font pairing in use, and where to re-import") — the routes step is Story
  7.17's and the credit Story 7.28's, and the other three sat in no story's criteria. Story 7.5 writes the Scripts section.
owner: Story 7.26 (Theme ZIP export), whose card carries this entry with its id.
location: prd.md §7.4 · `epics.md` Story 7.26 · `packages/theme-compiler/src/compile.ts` (`README.md`)
reason: The README is read by whoever opens the zip (Ghost serves no root `.md`), so the story whose owner test opens
  the zip is where its words are checked.

### DW-347: a module with no file yet draws its JavaScript branch on the canvas and its no-JS branch in the theme

plain: Until a section's script is written, the editor's Preview shows it as if the script were there — your header's
  menu button on a phone — while the theme Inflozo builds shows it without — the menu links as a plain list. The two
  differ for A1 #1 on a phone until Story 9.1 writes the menu button's script.
status: open
severity: low
origin: Story 7.5's Create (2026-10-08). The theme leaves a declared module with no file out of `main.js`, so `core`
  mounts nothing there and the section stays in its no-JS state (FR-G7(3)); the canvas runs a no-op for it
  (`apps/web/lib/behaviours.ts`, `noFileYet`), so `core` sets `js-enabled` and Preview, `/pilots` and the render matrix
  draw the JavaScript branch. The pilots declare `nav-drawer` (A1 #1, Story 9.1's) and `member-form` (A22 #1, Story
  10.75's); A1 #1's phone CSS hides the nav behind the button only with `js-enabled`.
owner: Story 7.34 (the canvas-vs-real-Ghost comparison harness), whose card carries this entry with its id. Story 9.1's
  `nav-drawer` file ends the A1 #1 case.
location: `apps/web/lib/behaviours.ts` (`noFileYet`) · `packages/theme-compiler/src/compile.ts` (`main.js`) ·
  `packages/library/designs/a1/1/style.css` · `epics.md` Story 7.34
reason: A stub in the theme would make it worse (the nav hidden behind a button that does nothing), and the canvas's
  no-op is what keeps `core` from reporting an unknown name on every edit; 7.34 is the story that compares the two
  renderings and decides how a difference is shown or closed.

## Deferred from: spec-7-6-ghost-correct-markup (2026-10-08)

### DW-348: A17 #1's author photo loads eagerly inside a lazy card

plain: In the post grid, each card's main picture waits until the visitor scrolls near it, but the tiny author photo
  beside it loads at once, so a long grid fetches every author photo on page load. Story 10.54, which rebuilds the
  post grids, decides it against the design's spec.
status: open
severity: low
origin: Story 7.6's Create (2026-10-08). "Lazy below the fold" is each design's own `loading` attribute, set from its
  spec in the design export (the compiler cannot see the fold without making a section's text depend on where it sits,
  which hoisting and one snapshot per design forbid). A17 #1's card picture carries `loading="lazy"`; its author photo
  (`a17-1__photo`, one `img_url:xs` rendition) carries no `loading`, so the browser fetches it eagerly.
owner: Story 10.54 (A17 — the content model, the stylesheet and designs #1–4), whose card carries this entry with its id.
location: `packages/library/designs/a17/1/index.html` (`a17-1__photo`) · `epics.md` Story 10.54
reason: A design file is its owning story's (AD-35), so Story 7.6 may not edit it; 10.54 rebuilds A17 #1 against its
  frame and spec and sets the photo's `loading` there.

### DW-349: an emptied typed text ships the design's sample English, which the compile refuses

plain: When a customer deletes every word of a typed text, such as the newsletter heading, the editor shows the design's
  own sample sentence again, and the published theme would carry that English. Story 7.6's label check refuses it, so the
  publish would fail. The owner ruled the line is hidden instead, on the canvas and the site; Story 7.18 builds it.
status: open
severity: medium
origin: Story 7.6's Dev (2026-10-08). `checkChromeText` (V1 at compile) refuses FR-H8's text default on a typed prop:
  `packages/section-runtime/src/core.ts`'s `data-prop` loop leaves the authored text in place when the value is empty
  and the element has no `data-empty="hide"`. Render-time V1 exempts text under `data-prop`, so only the compile sees it.
  A22 #1's heading and A4 #13's headline are such props; the pilots compile because their content is never empty. No
  library design binds a text (`data-bind`) in fallback mode, and none uses `data-initials`.
owner: Story 7.18 (the deploy wizard, the compiler's first product caller), whose card carries this entry's words.
location: `packages/section-runtime/src/core.ts` (the `data-prop` loop's `propEmpty` branch) ·
  `packages/theme-compiler/src/compile.ts` (`checkChromeText`) · `epics.md` Story 7.18
reason: Story 7.6's Question 2, ruled option 1 (owner, 2026-10-08): "If user deletes than he intends to delete that
  line". Hiding changes the editor (an emptied line leaves the canvas and comes back through the sidebar's text box), so
  it needs a screen and the owner's hand test, which Story 7.6 has neither of.

### DW-350: the keyboard gate's R-201 floor stop went red on a spec-only push, and that push never deployed

plain: The automatic checks that run on every push include a keyboard walk. On 2026-10-09 one of its stops — the one
  that checks a phone-sized screen shows the "this editor needs a bigger screen" notice — reported the notice missing
  on a push that changed only a story document, so that push was marked red and nothing was published. The very next
  push, with the same app code, passed every stop. Nothing is wrong with the notice; the walk sometimes looks before the
  page has drawn it. It cost one deploy, like DW-246 and DW-292 before it.
status: open
severity: low
origin: Story 7.7's Review (2026-10-09), reading CI for the story's commit chain: run 37875128495 on b5a3da0a (the Create
  commit, `spec-7-7-*.md` alone) — `check` failed at `tools/keyboard/floor.spec.mjs:77:3 › R-201 · a phone gets D4f … ›
  the notice, drawn to D4f, and not one request to the lock or the sync route` with `expect(locator).toBeVisible()
  failed / element(s) not found`; every other row passed; `deploy` skipped. Run 37889508187 on d62812b5 (the Dev commit,
  the same app code plus the gate) — `check`, `rls`, `deploy` all success.
  Second recurrence, same day: run 37892026760 on 1ab50ea1 (the Review commit, a gate patch with no app code) — `check`
  failed at the same row, `floor.spec.mjs:77:3`, `#canvas > *` not found after 5s, with 202 other stops passed; `rls`
  success, `deploy` skipped. Read at Story 7.7's Deploy; the story is re-pushed with no app change.
  Third recurrence, a different row (2026-10-09, Story 7.8's Deploy): run 37916947735 on 9bd0fe1d (the Review commit; its
  app change is `MODES` moving into `@inflozo/section-runtime`, the same two values) — `check` failed at
  `tools/keyboard/journey.spec.mjs:1736:1 › R-236 …`, `#pack-editor-title` not found after 5s following Enter on
  `#style-pack-new`, with 202 other stops passed; `rls` success, `deploy` skipped. Run cold on this machine with
  `bash tools/keyboard/run-keyboard-gate.sh -g 'R-236'` (Node 24.18.1): 1 passed. So the flake is not one row: it is the
  walk looking before a surface has drawn. The story is re-pushed with no app change.
owner: Story 15.1 (the E2E suite, including the keyboard-only journey), whose card carries this entry with its id —
  the story that hardens the keyboard walks (DW-246 and DW-292 were closed by Story 5.24d's `rendersSettle`); until
  then, re-push on a red R-201 stop with no app change.
location: `tools/keyboard/floor.spec.mjs:77` · `.github/workflows/ci.yml` (`check`)
reason: a stop that fails once with no app change and passes on the next push is a timing wait, not a defect in the
  story under review; fixing a wait inside Story 7.7, which touches no screen, would be a second change with no owner
  test. The flake is recorded so the third recurrence is not read as new.

## Deferred from: code review of spec-7-9-theme-settings-and-the-custom-settings-builder (2026-10-10)

### DW-351: two promotes landing together at sixteen settings can store eighteen

plain: A project may keep seventeen theme settings. The database counts them before each new one, but it does not make
  two promotes wait for each other, so if two windows press Promote at the same moment with sixteen stored, both can
  land. The theme would then carry one setting too many, and Ghost's own checker would refuse the deploy. It needs two
  presses within the same instant, so it is rare; the story that writes the settings into the theme refuses that case
  with the cap sentence.
status: open
severity: low
origin: Story 7.9's Review (2026-10-10). `enforce_custom_setting_cap()` (`20260904120000_complete_schema.sql:331-338`)
  runs `select count(*) … >= 17` in a `before insert` trigger with no lock, so two concurrent inserts each count sixteen.
  The action's own check (`promoteControl`, `rows.length >= USER_SETTING_CAP`) reads before the insert and has the same
  window. Executed on production the same day through an RLS session: seventeen inserts land and the eighteenth answers
  `23514` when the inserts are sequential — the race itself was not provoked.
owner: Story 7.10 (the `config.custom` emitter), whose card carries this entry with its id.
location: `supabase/migrations/20260904120000_complete_schema.sql:331` · `apps/web/app/(app)/app/(authed)/projects/[id]/settings/actions.ts` (`promoteControl`)
reason: closing the window in the database is a trigger change, which is a Schema phase and a migration this story's
  spec rules out without a question; the emitter is the one place every stored row passes before a theme exists, so it
  refuses there.
