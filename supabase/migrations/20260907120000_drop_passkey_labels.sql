-- Story 2.2 — drop `passkey_labels`. DW-30 closes here.
--
-- The table was created on the premise that "Supabase Auth's passkey API ... carries no
-- user-editable label, so the label is ours" (SCHEMA.sql, 2026-08-20). EXECUTION FALSIFIED IT
-- (Story 2.1, 2026-09-06): the installed `@supabase/auth-js` 2.115.0 carries `friendly_name` on
-- every passkey and a `PATCH /passkeys/{id}` that sets it, max 120 characters
-- (`dist/module/lib/types.d.ts:2404-2410,2437-2442`; `GoTrueClient.js:5668-5730`). Story 2.1
-- writes the auto-name there and Story 2.2 writes the user's rename there, so this table has
-- never held a row and nothing in the app reads or writes it. Two stores for one name is how two
-- stores disagree.
--
-- The 2026-09-04 migration is FROZEN — it has been applied to the live database — so the drop is
-- this new file (owner's ruling, 2026-09-05). `SCHEMA.sql` loses the table, its RLS line and its
-- three list memberships in the same commit; the RLS gate's schema diff is the proof the two
-- agree again.
--
-- No `if exists`: the table is in the frozen migration and in the live database, so its absence
-- would mean something has already gone wrong and this should say so rather than pass quietly.

drop table public.passkey_labels;
