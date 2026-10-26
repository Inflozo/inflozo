-- Story 7.20a — B12a's Cancel: the tenant may cancel a job while it archives the live theme.
--
-- FR-J8's lever is `deploy_jobs.cancel_requested`, the one field a client may set, and only in the stages where nothing has
-- reached Ghost yet. `snapshotting` is one of them: the capture only READS Ghost, and `ship()` asks the flag once more after
-- it and before the upload. `uploading` and `activating` stay outside — the lever ends where Ghost's writes begin.
--
-- A file of its own because PostgreSQL refuses a new enum value's use in the transaction that added it
-- (`20261027120000_backup_gate.sql` adds `snapshotting`).
-- RE-RUNNABLE: drop if exists, then create.

drop policy if exists deploy_jobs_owner_cancel on public.deploy_jobs;
create policy deploy_jobs_owner_cancel on public.deploy_jobs
  for update to authenticated
  using (user_id = (select auth.uid()) and stage in ('queued','compiling','checking','snapshotting'))
  with check (user_id = (select auth.uid()));
