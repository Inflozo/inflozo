---
title: Inflozo — Postgres restore runbook
status: proved by execution 2026-08-20 (the first drill NFR-4 has ever had)
owner: E1 · re-run before launch against realistic data volume
---

# Restoring Inflozo's database

NFR-4 requires "a restore drill exercised before launch". This is that drill, written down as a
procedure because **the first time it was run it found two defects**, and both were the kind that
make a restore look successful while producing a database that cannot serve a request.

## The two things that go wrong, and they are silent

**1. Dumping only `public` orphans every row.** Every user-owned table has a foreign key to
`auth.users`, which lives in the `auth` schema. Leave it out and the restore reports success, all 32
tables and every row arrive — and **13 foreign keys silently fail to apply**, leaving projects,
designs and settings owned by users who do not exist.

**2. `--no-privileges` throws away the security model.** `SCHEMA.sql` §11a grants *in* and names
every privilege; it is not decoration, it is half of how this schema is secured. A dump without
privileges restores the tables, the rows and the RLS policies and drops **every grant**, so
`authenticated` holds nothing and the app is dead. It fails closed rather than open, which is the
safe direction — but a restore that needs its grants re-applied by hand is not a restore.

## The procedure

```bash
# 1. the target must know the platform roles before anything is restored into it
psql "$TARGET" -c "do \$\$ begin
  if not exists (select 1 from pg_roles where rolname='anon')                then create role anon;                        end if;
  if not exists (select 1 from pg_roles where rolname='authenticated')       then create role authenticated;               end if;
  if not exists (select 1 from pg_roles where rolname='service_role')        then create role service_role bypassrls;      end if;
  if not exists (select 1 from pg_roles where rolname='supabase_auth_admin') then create role supabase_auth_admin;         end if;
end \$\$;"

# 2. BACK UP — all three schemas. `auth` is not optional; see defect 1.
pg_dump "$SOURCE" \
  --schema=public --schema=private --schema=auth \
  --no-owner --format=custom --file=backup.dump

# 3. RESTORE — --no-owner only. NOT --no-privileges; see defect 2.
pg_restore --no-owner -d "$TARGET" backup.dump

# 4. Storage is NOT in the dump. Re-create the four buckets and their three policies
#    (SCHEMA.sql §12), then re-upload objects from whatever holds them — see register item 38,
#    which is the open question of whether anything does.

# 5. ACCEPTANCE TEST — this step is the point of the runbook.
psql "$TARGET" -v ON_ERROR_STOP=1 -f RLS-TEST.sql
```

**Step 5 is not optional and is not a formality.** It is what turned "the restore succeeded" into
"the restore is missing 13 foreign keys and every grant". No reading of a `pg_restore` exit code
would have caught either. A restore is complete when the harness passes, and not before.

## What this runbook does NOT cover

- **Supabase's own point-in-time restore.** The machinery is running on the project
  (`wal_level=logical`, `archive_mode=on`, `archive_command` shipping WAL), but triggering a PITR
  restore is a dashboard action gated on the paid add-on. **It has never been exercised.** NFR-4's
  gate is half-closed: this path is proved, that one is not.
- **Storage.** No PITR, no backup, five deletion paths — register item 38, open.
- **Scale.** Measured at 41 rows: dump 26 s (almost entirely connection latency), restore 1 s.
  **These are correctness figures, not capacity figures.** Re-run against realistic volume before
  launch; that re-run is the half of NFR-4's drill this one does not discharge.
