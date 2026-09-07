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
status: open
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
status: half-closed by Story 1.5 Fix (2026-09-05) — the `not-found.tsx` half is open
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
status: open
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
status: open
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
status: open
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
status: open
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
status: open
severity: medium
origin: Story 1.5 fourth Fix run (2026-09-06), the owner's fourth test, finding 1
location: tools/probe/.env (`RESEND_API_KEY`) · apps/web/app/(app)/app/sign-in/actions.ts · Epic 12
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
  pending the owner's ruling on the story's question 1 — is sent by the app through `POST /emails` and the
  harness can see the deletion, the rows, the page and the download but never the inbox; the app logs
  Resend's status and id, and delivery is step 5 of that story's owner's manual test.


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
status: open
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
location: apps/web/app/(app)/app/(authed)/layout.tsx · apps/web/app/(app)/app/(authed)/loading.tsx
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
status: open
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
status: open
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
status: open
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
status: open
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
status: open
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
status: open
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
status: open
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
  cleared too — including a separate, longer countdown that starts when a site is disconnected. Today
  nothing starts that longer countdown, so nothing is wrong yet; the story that builds it (Epic 3) has to
  set it again after a restore.
status: open
severity: low
origin: Story 2.5 spec (2026-09-07), the `restore_account()` function
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

