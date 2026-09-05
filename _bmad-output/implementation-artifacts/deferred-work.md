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

plain: If a database lock breaks, the site still goes live and the warning arrives afterwards; you asked for the warning to stop the release, and that needs one change to your Vercel settings.
status: open
severity: high
origin: Story 1.2 review (2026-09-05), owner ruling on question 1
location: .github/workflows/ci.yml · apps/web/vercel.json
reason: `pnpm -w check` blocks a release because it runs inside the Vercel build; the RLS gate cannot
  join it there. Vercel's build image is Amazon Linux 2023 with `dnf` and no Docker daemon (Vercel,
  *Build image overview*, read 2026-09-05) and the gate starts a `postgres:17` container. The owner
  ruled the gate must block. Vercel's documented mechanism is to stop deploying on push and run
  `vercel build --prod` + `vercel deploy --prebuilt --prod` from Actions after `check` and `rls` pass.
  That rewires Story 1.1's deployment path and needs the Vercel project's git auto-deploy turned off,
  so it is a story, not a review patch. Question 4 in spec 1.2 asks the owner which of the two
  mechanisms to build.

### DW-8: the migration's byte-identity guard cannot survive the frozen-migration ruling

plain: A safety check that compares two files will start crying wolf the first time we add a new table; it needs to compare the resulting database instead.
status: open
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

plain: Four fake users left over from testing are sitting in the real database; harmless now, but your first "how many users" number would say four before anyone has signed up.
status: open
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

