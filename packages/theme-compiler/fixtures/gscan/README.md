# gscan's rule inventories — AD-23 recordings

What each pinned checker knows, recorded from the installed package itself, so that a gscan version can never change
silently (Story 7.7, FR-J6). The gate's test (`gate/gate.test.ts`) holds `installedRules(major)` equal to these files
and `GSCAN` (`gate/gscan.ts`) equal to the installed versions; a planted level change is its control.

| File | Checker | `checkVersion` | Judges | Recorded | Command |
|---|---|---|---|---|---|
| `rules-4.49.7.json` | gscan 4.49.7 (`gscan4`, the copy in `../../vendor/`) | `v5` | Ghost 5 (5.130.6 pins it) | 2026-10-09 | `node tools/record-gscan.mjs` |
| `rules-6.4.2.json` | gscan 6.4.2 (`gscan6`) | `v6` | Ghost 6 (6.58.0 pins it) | 2026-10-09 | `node tools/record-gscan.mjs` |

Each file is `{ gscan, checkVersion, ghost, captured, command, rules }`; `rules` is every rule in the pinned package's own
spec for its `checkVersion` (`lib/specs/v5.js` on 4.49.7, `v6.js` on 6.4.2, each merging its predecessors), by code:
`level`, `fatal`, and a regex rule's `regex` as `String(regex)`. No count is written here: the file is the list.

**The recording the gate's verdicts reproduce** is MEASUREMENTS §13a — the probe theme's verdicts on real Ghost 5.130.6
and 6.58.0 (one error, `GS110-NO-MISSING-PAGE-BUILDER-USAGE`, on 5; that and `GS090-NO-LIMIT-ALL-IN-GET-HELPER` as two
warnings on 6). The gate's test rebuilds that theme from its description and holds both checkers' raw reports equal.

## The bump procedure — the only way a pin moves

This is FR-J6's version policy.

1. **Move `GSCAN` and `packages/theme-compiler/package.json` together** in one commit. For Ghost 5, re-make the copy in
   `vendor/` by its README's command at the new version (and only if the registry's tarball is still refused on the
   project's Node — try it first, as the control).
2. **Re-record both inventories:** `node tools/record-gscan.mjs`. Read the diff: a rule added, removed or re-levelled is
   a behaviour change for every customer.
3. **Re-derive `GSCAN_INERT`** (`packages/section-runtime/src/marks.ts`): for every regex rule in either inventory, ask
   whether a match needs a `{`. Each rule whose answer is no — and which a customer's words can reach (a template's text
   or attributes, or a boundary comment) — gets an entry with a witness, or a sentence beside the table saying why not.
   The gate's test then holds each witness on both checkers.
4. **Re-run Story 7.33's lane over the whole library** before the pin lands (that story builds it).
5. **Ship it as a library release** (Story 7.27): a live site moves to the new checker only through its owner's redeploy
   and consent.
