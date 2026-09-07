-- Story 3.1 — DW-44: a Vault secret dies with the row that references it.
--
-- `private.site_credentials` holds UUIDs into `vault.secrets` and NOTHING deletes the secret
-- behind a ref that is dropped. Three paths lose the row and would each leave the customer's
-- Ghost Admin key encrypted-but-alive in the project's Vault for ever:
--   * the account purge (FR-A5) — `auth.users` cascades to `sites`, which cascades here;
--   * disconnecting a site (FR-C6) and Manage keys' "remove token" (Story 3.6);
--   * a rotation — a re-entered key REPLACES the ref, and the old secret has no other reference.
--
-- SECURITY DEFINER, and that is the load-bearing word. `vault.secrets` is granted to the owner
-- and `service_role` only (MEASUREMENTS §21j, executed), and the purge's cascade fires under
-- whichever role deleted the user — GoTrue's, not ours. An invoker function would raise 42501
-- there and take the whole account deletion down with it. EXECUTE is revoked from every client,
-- so a definer function that can delete secrets is reachable by nobody: it has no arguments a
-- caller could aim, and it is only ever fired by the trigger below.
--
-- `set search_path = ''` for the same reason every definer in this schema has it: an unqualified
-- name inside a definer body resolves in the CALLER's search_path, which a client controls.
--
-- Comments live OUTSIDE the body: pg_dump emits function bodies verbatim and the RLS gate diffs
-- the migrations against SCHEMA.sql, so a comment inside would have to be byte-identical in both
-- (Story 2.5's lesson).

create or replace function private.drop_vault_secrets() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    delete from vault.secrets where id in (old.admin_key_vault_ref, old.staff_token_vault_ref);
    return old;
  end if;
  if old.admin_key_vault_ref is distinct from new.admin_key_vault_ref then
    delete from vault.secrets where id = old.admin_key_vault_ref;
  end if;
  if old.staff_token_vault_ref is distinct from new.staff_token_vault_ref then
    delete from vault.secrets where id = old.staff_token_vault_ref;
  end if;
  return new;
end $$;

revoke execute on function private.drop_vault_secrets() from public, anon, authenticated;

create trigger site_credentials_drop_vault_secrets
  before update or delete on private.site_credentials
  for each row execute function private.drop_vault_secrets();
