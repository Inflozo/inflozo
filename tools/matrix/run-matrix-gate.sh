#!/usr/bin/env bash
# The render matrix gate (Story 4.11, NFR-6(a) and NFR-5). Exit 0 means every case rendered, every photograph matched
# its baseline within 1% of pixels at a 0.1 tolerance, axe found zero WCAG 2.1 AA violations behind its positive
# control, and the runner matched tools/matrix/manifest.json. Any non-zero exit is a failure and CI keys on it.
#
# One mechanism for the laptop and for CI, as supabase/tests/run-rls-gate.sh: both have docker, and the image brings
# its own Chromium and fonts. The repository is mounted, so the node_modules `pnpm install` made is the harness.
#
#   bash tools/matrix/run-matrix-gate.sh            the gate
#   bash tools/matrix/run-matrix-gate.sh --update   re-takes the baselines and the manifest, inside the image only
#   bash tools/matrix/run-matrix-gate.sh --host     a look on this machine (Node 24): never writes a baseline, and its
#                                                   fonts are this machine's, so expect it to differ
#   MATRIX_DESIGNS="a1/1 a17" bash tools/matrix/run-matrix-gate.sh    only those designs (ids or whole categories)
#
# Any other argument goes to Playwright (e.g. --grep 'a17/1'). A diff image for every failing case is written under
# tools/matrix/test-results/.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IMAGE="inflozo-matrix"
update=0 host=0 pass=()
for arg in "$@"; do
  case "$arg" in
    --update) update=1 ;;
    --host) host=1 ;;
    *) pass+=("$arg") ;;
  esac
done

if [ "$host" -eq 1 ] && [ "$update" -eq 1 ]; then
  echo "REFUSED: --host never writes a baseline. Baselines are taken inside the pinned image only: bash tools/matrix/run-matrix-gate.sh --update" >&2
  exit 1
fi
if [ "$update" -eq 1 ] && [ -n "${CI:-}" ]; then
  echo "REFUSED: CI never re-takes a baseline. A mass rebaseline is its own commit, on the owner's approval (docs/render-matrix.md)." >&2
  exit 1
fi

# DRIFT, refused before anything runs: the Playwright the repository installed must be the one the image was built
# for, or the browser it drives is not the browser the baselines were taken in.
installed="$REPO/node_modules/@playwright/test/package.json"
[ -f "$installed" ] || { echo "MISSING: node_modules/@playwright/test — run pnpm install first." >&2; exit 1; }
want="$(sed -nE 's#^FROM mcr\.microsoft\.com/playwright:v([0-9.]+)-.*#\1#p' "$REPO/tools/matrix/Dockerfile")"
have="$(sed -nE 's/^  "version": "([^"]+)".*/\1/p' "$installed")"
if [ "$want" != "$have" ]; then
  echo "DRIFT: the image is Playwright $want (tools/matrix/Dockerfile) and the repository installed @playwright/test $have (package.json)." >&2
  echo "       Move both together — and re-take the baselines, because the browser moved with them." >&2
  exit 1
fi

playwright=(test -c tools/matrix/playwright.config.mjs)
[ "$update" -eq 1 ] && playwright+=(--update-snapshots=changed)
playwright+=("${pass[@]}")

if [ "$host" -eq 1 ]; then
  cd "$REPO"
  MATRIX_HOST=1 node node_modules/@playwright/test/cli.js "${playwright[@]}"
  exit
fi

docker build -q -t "$IMAGE" "$REPO/tools/matrix" >/dev/null
# as the calling user, so a baseline or a diff image on the mounted checkout is not owned by root
docker run --rm --init --ipc=host \
  --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -e CI -e MATRIX_DESIGNS \
  -v "$REPO:/repo" -w /repo \
  "$IMAGE" node node_modules/@playwright/test/cli.js "${playwright[@]}"
