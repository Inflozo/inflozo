# Clearing an existing project — the protocol

Two of the three targets are existing projects. Clearing them is **irreversible** and neither
Supabase nor Vercel has an undo. So nothing gets cleared on a verbal go-ahead alone.

**The rule: inventory → you look → you confirm → I clear.** In that order, every time.

---

## Supabase

### Step 1 — I inventory, read-only

Before any destructive statement runs, I connect and produce:

- every non-system schema, and every table in it **with its row count**
- every storage bucket, its `public` flag, and its object count and total bytes
- `auth.users` count, and whether any have real-looking addresses
- database roles, extensions, edge functions, cron jobs, webhooks
- whether PITR is on, and the oldest restore point available

I hand you that as a table. **Nothing is written in this step.**

### Step 2 — you confirm, specifically

Not "yes go ahead" — I need you to confirm against what the inventory actually shows. If it lists
400 rows in a table called `customers`, I want you to have seen that line before saying yes.

If PITR is on, I'll note the restore point in the report so there's a way back.

### Step 3 — I clear, in this order

The order matters, and it is AD-32's own rule applied to our own data:

1. **Storage objects first, through the Storage API** — not through SQL. A Postgres cascade deletes
   `storage.objects` **rows** and leaves the bytes, still billed. This is the exact trap AD-32 exists
   for, and it would be embarrassing to fall into it on our own reset.
2. **Non-default buckets**, once empty.
3. **`auth.users`** — this deletes accounts and cascades.
4. **`drop schema public cascade; create schema public;`** plus the grants Supabase expects back.
5. **Extensions** re-created as `SCHEMA.sql`'s header requires.

Then `PRELUDE.sql` → `SCHEMA.sql` → `RLS-TEST.sql`, and E1's exit criterion finally runs against real
hosted Postgres instead of a local container.

### One thing that makes an OLD project better than a new one

If this project predates **2026-05-30** it still has Supabase's *old* automatic-grant default. That
is genuinely useful: R2-1 rewrote `SCHEMA.sql` for the new default, and an old project lets me prove
the fix works **in both states** and rehearse the **2026-10-30** enforced cutover — which is roughly
two months out and is one of the two dated deadlines on this project's register. A brand-new project
could only ever show me one of the two states.

---

## Vercel — please make a new project instead

I'd rather not clear an existing one, and the reason is not caution for its own sake:

- **Creating a project costs nothing and is not destructive.** Deleting deployments is irreversible
  and buys us nothing the new project doesn't give.
- **Fluid compute is project-wide, not per-function** (Round 1 finding 5, corrected in decision 11).
  Round 1 decision 11's whole subject is measuring Fluid's shared-instance behaviour, and doing that
  inside a project that has other things in it means measuring them too.
- **The probe deploys deliberately hostile functions** — one that allocates until it hits the memory
  ceiling, one that returns a body over the 4.5 MB cap to observe the 413, and several fired
  concurrently to see whether they land on one instance. That belongs in a project of its own.

If you'd still rather reuse one, name it in `VERCEL_PROJECT` and the same three-step protocol applies.

**Two switches I cannot flip and you must:**

1. **The plan must be Pro.** AD-11 sizes against Pro's defaults (300 s / 2048 MB). On Hobby the
   measurement is of a different machine and tells us nothing about the decision it feeds.
2. **Fluid compute on**, at the project level.

---

## Ghost

Less fraught, because a Ghost install is cheap to rebuild — but the same protocol, because I will
**upload and activate themes**, which changes what visitors see.

I inventory posts, pages, tags, authors, members, tiers, the active theme and the announcement-bar
settings; you confirm; then I seed the fixtures the probes need (a hidden tier, a multi-word custom
template page, comments enabled, an announcement bar with content). I can create all of that through
the Admin API.

**The one thing I cannot fabricate is a genuinely paid member** — Ghost needs Stripe for that. Without
it, the paywall and paid-tier probes degrade to anonymous and free states, and I will say so in the
report rather than quietly testing less.

**Every probe theme is deleted in the same cleanup, and read back** (DW-147, DW-237). Every script that
uploads a theme to T1 or T3 ends in `record-shim.py`'s `restore_and_delete`, inside its `finally`: it
re-activates the theme that was active, reads the active theme back, deletes every probe theme the run
uploaded and reads the theme list back — whichever step failed — then raises the first failure. And a
run **refuses to start while the active theme is `inflozo-probe-*`** (`start_guard`): an earlier run
failed to restore, and this one would restore the probe and call the site clean. `python3
tools/probe/record-shim.py --self-check` holds both offline, in `pnpm test`. The one exception is
`run-verify-ghostpro.py`, which writes to a Ghost(Pro) trial and never to T1 or T3.

**The writes are made in the session the owner approves them in, never handed to a helper** (Story 5.24c,
2026-10-01). A ruling written into a spec is not something the session's permission check can see: there, a subagent's
approved T1/T3 writes were refused as a change to a shared resource, and the story stopped until the owner said go in
the session itself. A refused write is asked again, never routed around.

**Hand changes on the test sites are the owner's, kept and written down** (DW-299, Story 5.24d). Ghost's actions log
(`GET /ghost/api/admin/actions/`) records an edit made in Ghost Admin and never a staff-token write, so a row there is a
person's (MEASUREMENTS §61). Three on T3 reached a recording and are **kept**: `probe-gated-post` retitled "PROBEs Gated
Post" with an Unsplash feature image (2026-09-25, 04:48–04:49 UTC), "Reading the margins"'s uploaded feature image
(04:50 UTC), and `portal_button_icon` set to `icon-5` (2026-09-26, 16:35 UTC) — each made by the owner in Ghost Admin
per T3's actions log, and recorded in `packages/library/contexts/fixtures/ghost5.json`, as is the profile picture he
gave his own T3 user at 04:48 UTC. His other logged edits those two days left Ghost's default or the seeded value
(§61). An inventory that finds a value no probe wrote reads the log before calling it anyone's.

---

## What I will never do without asking, on any of the three

- delete anything not named in the inventory you approved
- touch a second project, site or database that happens to be reachable with the same credentials
- leave a hostile fixture in place after a probe finishes

Every destructive statement I run gets recorded verbatim in the report, the way `MEASUREMENTS.md`
records every other executed command.
