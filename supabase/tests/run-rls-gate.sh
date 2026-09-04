#!/usr/bin/env bash
# The RLS gate. Exit 0 means the whole data model applied clean and every assertion in
# rls.sql held; any non-zero exit is a failure and CI keys on it (AD-26).
#
# One mechanism for the laptop and for CI: both have docker, neither needs psql installed —
# postgres:17-alpine carries the client as well as the server.
#
#   bash supabase/tests/run-rls-gate.sh
#
# The three SQL files here are byte-identical copies of the architecture's design authority.
# The cmp guard below is the standing-rule-7 audit that keeps them from drifting: a copy that
# has moved away from its original refuses to run at all, rather than proving a stale schema.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARCH="$REPO/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19"
MIGRATION_REL="migrations/20260904120000_complete_schema.sql"
IMAGE="postgres:17-alpine"

drift=0
guard() {  # guard <supabase-relative copy> <architecture original>
  if ! cmp -s "$REPO/supabase/$1" "$ARCH/$2"; then
    echo "DRIFT: supabase/$1 is not byte-identical to $2 (the design authority)." >&2
    drift=1
  fi
}
guard "$MIGRATION_REL" SCHEMA.sql
guard tests/rls.sql     RLS-TEST.sql
guard tests/prelude.sql PRELUDE.sql
if [ "$drift" -ne 0 ]; then
  echo "The gate refuses to run against copies that have drifted. Re-copy from the architecture, or" >&2
  echo "change the architecture first — it is the design authority and the copies follow it." >&2
  exit 1
fi

CONTAINER="inflozo-rls-gate-$$"
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=gate \
  -v "$REPO/supabase:/supabase:ro" "$IMAGE" >/dev/null

# -h forces TCP. The entrypoint's temporary init server listens on the unix socket only, so a
# TCP pg_isready answers for the real server and never for the half-built one.
for _ in $(seq 60); do
  docker exec "$CONTAINER" pg_isready -h 127.0.0.1 -U postgres -q && break
  sleep 1
done
docker exec "$CONTAINER" pg_isready -h 127.0.0.1 -U postgres -q

docker exec "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 \
  -f "/supabase/tests/prelude.sql" \
  -f "/supabase/$MIGRATION_REL" \
  -f "/supabase/tests/rls.sql"
