-- DW-7 CONTROL, reverted in the next commit: a table with no RLS must turn the gate red,
-- which must stop the deploy job from running at all.
create table public.dw7_control_rls_off(id uuid primary key default gen_random_uuid(), user_id uuid not null);
