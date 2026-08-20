# ⚠️ RETIRED — do not read this as the pipeline

**Retired 2026-08-20 (Round 4). The live pipeline is `tools/stress/`.**

This directory is the original FR-D4 spike. It did its job: it proved the compiler mechanism, and
§7.3 was written from it. It is kept for provenance and is **no longer the source of truth**.

## Why it was retired rather than repaired

Two copies of one pipeline is how they drift, and these two already had. Everything decided after
the spike was written landed in `tools/stress/compile.js` and never came back here:

| Decision | `tools/stress/` | this directory |
|---|---|---|
| AD-5 — user braces escape as numeric entities | ✅ | ❌ still backslashes, which **do not work** (executed: every backslash count evaluates live) |
| AD-4 — the theme renderer splices into the STRING, never through a DOM | ✅ | ❌ |
| R2-5 — user text substituted LAST, over every emitted file | ✅ | ❌ (executed in Round 2: the partial shipped a raw marker and lost the user's text) |
| R2-7 / D13 — the compiler's own token shape | ✅ | ❌ |
| R1 d7 — nested repeats processed deepest-first | ✅ | ❌ |
| AD-36 — URL scheme check, attribute allowlist, parsed helper args | ✅ | ❌ |
| FR-H8 — the guard is on the bound field, not the helper argument | ✅ fixed 2026-08-20 | ❌ **still broken** |
| the date helper honours its format argument | ✅ | ❌ **still discards it** |

`build-sequence.md` step 2 names those last two as known defects and says to "reproduce it first
and confirm it still passes". Round 4 tried: **it does not run at all** — its dependencies are not
installed — and both defects are still present. Repairing it would mean re-applying six rounds of
decisions to a copy nothing else uses.

## What replaced it, and where the proof lives

`tools/stress/` carries the whole pipeline and its checks:

- `compile.js` — **both emitters**, sharing one code path. The `users` parameter is the only
  difference between them, which is what makes §7.3's "agree by construction" a property of the
  code rather than a promise.
- `test-renderer-agreement.js` — 8 checks. E0(a)'s exit criterion: the canvas and the shipped theme
  compared **node by node**, plus the two differences that must exist.
- `test-ad36.js` — 13 checks. AD-36's four vectors, AD-4/AD-5, and FR-H8's guard rule.
- `build.js` · `gate.js` — the 70-section fixture, the FR-J17 leak assertions, and the AD-34
  Ghost-major→gscan-version pairing.

The one thing this directory had that the rebuild lacked was `renderCanvas`, and that is the gap it
was kept open for. **Round 4 built the canvas emitter in `tools/stress/compile.js` and proved the
two agree**, so the last reason to keep this alive is gone.

**Do not import from here. Do not fix bugs here.** If something is missing from `tools/stress/`,
add it there.
