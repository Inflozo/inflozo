#!/usr/bin/env bash
# THE KEYBOARD GATE (Story 5.9, NFR-6(d), R-146). Exit 0 means the editor answered every stop of the spec's I/O
# matrix from the keyboard alone: D8c's skip link first, the canvas one tab stop with the embedded document out of
# the order, the eight live keys, WCAG 2.1.4's focus condition, the three-rung `Esc` ladder, R-147's card listing
# exactly the keys that work, every deferred key inert, both `⌥`-arrow reorders, `⌥F10` into the mark toolbar, and
# the settings panel's reset wiring (DW-167). Any non-zero exit is a failure and CI's `check` job keys on it.
#
# IT IS ITS OWN STEP IN THAT JOB AND NOT A LINE INSIDE `pnpm check`, and the reason is executed rather than
# reasoned: `apps/web/vercel.json`'s buildCommand runs `pnpm -w check` a SECOND time inside `vercel build`, in
# Vercel's own build image — which has no browser, and is not a Debian for `playwright install --with-deps` to
# serve. A gate inside that command turns every deploy red with `check` green (CI run 35452356017, 2026-09-19).
# Nothing is lost: `deploy` needs `check`, so a red gate here still publishes nothing, which is all R-146 asks.
# Run it by hand, or before a push, with `pnpm keyboard`.
#
#   bash tools/keyboard/run-keyboard-gate.sh                 the gate
#   bash tools/keyboard/run-keyboard-gate.sh --headed        watch it drive
#   bash tools/keyboard/run-keyboard-gate.sh -g 'Esc'        only those tests
#
# Any other argument goes to Playwright. It boots `next dev` itself, on a free port, with INFLOZO_HARNESS=1 and
# nothing else: the harness page is the real `Editor` with the pilot fixture, and it renders with NO Supabase
# environment because it sits outside `(authed)` (executed 2026-09-19 — ready in 307 ms).
#
# NO CONTAINER, unlike tools/matrix/run-matrix-gate.sh: nothing here is photographed, so the fonts and the exact
# Chromium build are not load-bearing and the browser the repository already installs is the browser this drives.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

installed="node_modules/@playwright/test/package.json"
[ -f "$installed" ] || { echo "MISSING: node_modules/@playwright/test — run pnpm install first." >&2; exit 1; }

# A BROWSER IS A REFUSAL, NOT A FAILURE: a machine that has never downloaded one must be told the command rather
# than shown a stack. CI installs it in the `check` job before `pnpm keyboard` (.github/workflows/ci.yml).
browser="$(node -e "process.stdout.write(require('@playwright/test').chromium.executablePath())" 2>/dev/null || true)"
if [ -z "$browser" ] || [ ! -e "$browser" ]; then
  echo "REFUSED: the keyboard journey needs Chromium and this machine has none." >&2
  echo "         pnpm exec playwright install chromium" >&2
  exit 1
fi

# `next dev` REWRITES THE TRACKED apps/web/next-env.d.ts to point at .next/dev/types (and `next build` points it
# back) — executed. Without this every run would leave a dirty tree and the next commit would carry it.
NEXT_ENV="apps/web/next-env.d.ts"
KEEP="$(mktemp)"
cp "$NEXT_ENV" "$KEEP"

dev=""
cleanup() {
  [ -n "$dev" ] && kill "$dev" 2>/dev/null || true
  [ -n "$dev" ] && wait "$dev" 2>/dev/null || true
  cmp -s "$KEEP" "$NEXT_ENV" || cp "$KEEP" "$NEXT_ENV"
  rm -f "$KEEP"
}
trap cleanup EXIT

PORT="$(node -e "const s=require('net').createServer();s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close()})")"
BASE="http://127.0.0.1:${PORT}"
LOG="$(mktemp)"

# `next` is the web package's own dependency and not the root's (pnpm workspaces), so it is started from there
(cd apps/web && INFLOZO_HARNESS=1 exec node node_modules/next/dist/bin/next dev -p "$PORT" -H 127.0.0.1) >"$LOG" 2>&1 &
dev=$!

# the harness page itself is the readiness test, not a line in the log: a 200 from it means the editor really renders
ready=0
for _ in $(seq 1 120); do
  if ! kill -0 "$dev" 2>/dev/null; then break; fi
  if [ "$(node -e "fetch('${BASE}/app/harness/editor').then(r=>process.stdout.write(String(r.status)),()=>process.stdout.write('0'))")" = "200" ]; then ready=1; break; fi
  sleep 0.5
done
if [ "$ready" -ne 1 ]; then
  # Next 16 allows ONE dev server per build directory. The harness has its own (`distDir` in next.config.ts), so this
  # can only be a second HARNESS server — another gate run, or a hand-started one — and the fix is to stop it, never
  # to kill something this script did not start.
  if grep -q 'Another next dev server is already running' "$LOG"; then
    pid="$(sed -nE 's/^- PID:[[:space:]]+([0-9]+).*/\1/p' "$LOG" | head -1)"
    rm -f "$LOG"
    echo "REFUSED: a harness dev server is already running for apps/web${pid:+ (PID $pid)}." >&2
    echo "         Stop it and run again${pid:+ — kill $pid}." >&2
    exit 1
  fi
  cat "$LOG" >&2
  rm -f "$LOG"
  echo "the harness did not come up — see the log above (INFLOZO_HARNESS=1 next dev on ${PORT})" >&2
  exit 1
fi
rm -f "$LOG"

KEYBOARD_BASE_URL="$BASE" node node_modules/@playwright/test/cli.js test -c tools/keyboard/playwright.config.mjs "$@"
