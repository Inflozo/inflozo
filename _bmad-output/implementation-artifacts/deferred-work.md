# Deferred work

Findings that are real, are not this story's to fix, and would otherwise be lost. The story board
reads this file. An entry is closed by the story that fixes it, never by deleting the row.

Besides the fields the format defines, every entry carries **`plain:` — one sentence a non-engineer
reads**, because the owner sees this ledger on the story board and `reason:` is written for a
developer. Write it in the owner's language: what is not right, and what it costs him. The board
falls back to `reason:` when an entry has no `plain:`, which reads as jargon and is the bug, not the
fallback.

### DW-1: `packages/library` declares no entry point, so the dependency arrow cannot resolve

plain: The shared parts store has no way in yet, so no other part of the code can take anything out of it; the first story that needs to will build the door.
status: open
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
status: open
severity: low
origin: Story 1.1 review (2026-09-04)
location: apps/web/package.json · apps/web/next.config.ts
reason: `next.config.ts` lists the three core packages in `transpilePackages`, but `apps/web` does
  not depend on them and `node_modules/@inflozo` does not exist. The entries are no-ops until the
  first `import '@inflozo/section-runtime'`, which will fail to resolve until the `workspace:*`
  dependencies are added. Adding them now would be speculative; the story that imports adds its own.

### DW-3: `@types/node` is two majors ahead of the pinned runtime

plain: The reference notes describing our engine are two versions ahead of the engine we actually run, so code could be written against something that is not there.
status: open
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
status: open
severity: low
origin: Story 1.1 review (2026-09-04)
location: tools/probe/.env.example
reason: The date lives in a comment and in this story's Verification. When it lapses, every later
  story's "CI is green" read starts returning 401 with no forewarning. This project's convention for
  a dated external deadline is a register row with a trigger, as the Supabase grants and gscan dates
  have; it needs one.

### DW-6: `node --test` warns MODULE_TYPELESS_PACKAGE_JSON on every `apps/web` run

plain: Running the tests prints four harmless warning lines every time; nothing fails, it is only noise.
status: open
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
status: open
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
