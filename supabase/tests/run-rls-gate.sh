#!/usr/bin/env bash
# The RLS gate. Exit 0 means the whole data model applied clean and every assertion in
# rls.sql held; any non-zero exit is a failure and CI keys on it (AD-26).
#
# One mechanism for the laptop and for CI: both have docker, neither needs psql installed —
# postgres:17-alpine carries the client as well as the server.
#
#   bash supabase/tests/run-rls-gate.sh
#
# TWO different guards, because the three files here are not the same kind of copy (DW-8).
#
#   rls.sql and prelude.sql are byte-identical copies of live design authorities, and `cmp -s`
#   is the standing-rule-7 audit that keeps them so: a copy that has moved away from its original
#   refuses to run at all, rather than proving a stale schema.
#
#   The migrations are NOT copies. Owner's ruling, 2026-09-05: the 2026-09-04 migration is FROZEN —
#   it has been applied to the live database — and every later schema change is a NEW file here,
#   while the architecture's SCHEMA.sql keeps growing into the cumulative readable picture of the
#   database. Their BYTES must therefore be allowed to diverge; what must never diverge is the
#   DATABASE they produce. So the gate applies every migration to one database and SCHEMA.sql to
#   another, and diffs the two schemas. Equivalence, not equality.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# Overridable only so the control run can point at a deliberately divergent copy and prove this
# gate actually catches a divergence. It defaults to the design authority.
ARCH="${INFLOZO_ARCH_DIR:-$REPO/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19}"
IMAGE="postgres:17-alpine"

for f in SCHEMA.sql RLS-TEST.sql PRELUDE.sql; do
  [ -f "$ARCH/$f" ] || { echo "MISSING: $ARCH/$f — the design authority is not where the gate expects it." >&2; exit 1; }
done

drift=0
guard() {  # guard <supabase-relative copy> <architecture original>
  if ! cmp -s "$REPO/supabase/$1" "$ARCH/$2"; then
    echo "DRIFT: supabase/$1 is not byte-identical to $2 (the design authority)." >&2
    echo "       Re-copy it:  cp '$ARCH/$2' '$REPO/supabase/$1'" >&2
    drift=1
  fi
}
guard tests/rls.sql     RLS-TEST.sql
guard tests/prelude.sql PRELUDE.sql
if [ "$drift" -ne 0 ]; then
  echo "The gate refuses to run against copies that have drifted. Re-copy from the architecture, or" >&2
  echo "change the architecture first — it is the design authority and the copies follow it." >&2
  exit 1
fi

WORK="$(mktemp -d)"
CONTAINER="inflozo-rls-gate-$$"
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT INT TERM

docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=gate \
  -v "$REPO/supabase:/supabase:ro" -v "$ARCH:/arch:ro" "$IMAGE" >/dev/null

# -h forces TCP. The entrypoint's temporary init server listens on the unix socket only, so a
# TCP pg_isready answers for the real server and never for the half-built one.
ready=0
for _ in $(seq 60); do
  docker exec "$CONTAINER" pg_isready -h 127.0.0.1 -U postgres -q && { ready=1; break; }
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "Postgres never became ready in 60s. This is not an RLS result. Container log:" >&2
  docker logs "$CONTAINER" >&2 || true
  exit 1
fi

# EVERY migration, in filename order, never a hardcoded one: the gate must prove the schema the
# repository actually ships. A migration the gate does not apply is a table with no assertion.
LC_ALL=C
migrations=()
for f in "$REPO"/supabase/migrations/*.sql; do
  [ -e "$f" ] || { echo "No migration found under supabase/migrations/." >&2; exit 1; }
  migrations+=(-f "/supabase/migrations/$(basename "$f")")
done

# 1. the database the repository ships
docker exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 \
  -f "/supabase/tests/prelude.sql" "${migrations[@]}"

# 2. the database the architecture describes
docker exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -c 'create database schema_ref'
docker exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -d schema_ref \
  -f "/supabase/tests/prelude.sql" -f "/arch/SCHEMA.sql"

# 3. they must be the same database (DW-8). Schema only — the fixture data in rls.sql is irrelevant
#    and has not run yet.
# pg_dump since 17.6 wraps its output in \restrict/\unrestrict lines carrying a RANDOM token per
# run, so the two dumps never match byte-for-byte no matter how identical the databases. Dropping
# those two lines is the whole normalisation; everything else pg_dump emits is deterministic.
dump() { docker exec "$CONTAINER" pg_dump -U postgres -s -n public -n private "$1" \
           | grep -vE '^\\(un)?restrict '; }
dump postgres    > "$WORK/repo.sql"
dump schema_ref  > "$WORK/arch.sql"
if ! diff -u "$WORK/arch.sql" "$WORK/repo.sql" > "$WORK/schema.diff"; then
  echo "SCHEMA DRIFT: supabase/migrations/ and $ARCH/SCHEMA.sql do not describe the same database." >&2
  echo "  '-' is what SCHEMA.sql has and the migrations do not; '+' is the reverse." >&2
  echo "  Fix whichever is behind — a new table needs BOTH a migration here and its row in SCHEMA.sql." >&2
  sed -n '1,120p' "$WORK/schema.diff" >&2
  exit 1
fi

# 4. the proof itself
docker exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 -f "/supabase/tests/rls.sql"
