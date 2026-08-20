---
title: Apply Round 2 decisions — the gscan version split
type: implementation prompt, self-contained
covers: R2-2
run: independent — but it touches AD-17, AD-18 and AD-34, so coordinate with R2-APPLY-2-SPINE.md
created: 2026-08-19
---

# Fix the Ghost 5 half of the quality gate

Inflozo's quality gate runs **gscan 6.4.2** twice — once with `checkVersion: 'v5'` and once with
`'v6'` — and treats that as covering both Ghost majors. It does not. A real Ghost 5 site runs a
**different major version of gscan**, and the two disagree on rule severity.

Everything you need is quoted here. Read it whole before you start.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/`

| File | Role |
|---|---|
| `architecture/.../ARCHITECTURE-SPINE.md` | AD-17, AD-18, AD-23, AD-34 |
| `architecture/.../MEASUREMENTS.md` | §2, §7, §11 — the gscan timings |
| `architecture/.../VERIFY-AT-BUILD.md` | where the new fixture entry goes |
| `prds/prd-Inflozo-2026-08-17/spike-compiler/` | `build.js` runs gscan; this is where to prove it |

**This directory is not a git repository.** Back up anything you edit.

## The one rule that governs this project

Cite or execute. Never assert. **This finding is itself an instance of the rule's newest variant:** a
fact was read correctly and carried one step too far. "gscan 6.4.2 ships a v5 spec" is true.
"Therefore `checkVersion: 'v5'` tells us what Ghost 5 does" is false.

---

## What was executed, 2026-08-19

Two real Ghost containers, versions read out of the running images:

```
docker exec iz-ghost5 cat .../node_modules/gscan/package.json | grep version
  "version": "4.49.7",       # Ghost 5.130.6
docker exec iz-ghost6 cat .../node_modules/gscan/package.json | grep version
  "version": "6.4.2",        # Ghost 6.58.0
```

**The same theme, uploaded to both, versus the local gate:**

```
local gscan 6.4.2, checkVersion=v5  ->  ERRORS: 0   WARNINGS: 1
REAL Ghost 5.130.6 upload           ->  ERRORS: 1   WARNINGS: 0    <-- disagrees
local gscan 6.4.2, checkVersion=v6  ->  ERRORS: 0   WARNINGS: 2
REAL Ghost 6.58.0 upload            ->  ERRORS: 0   WARNINGS: 2    <-- matches exactly
```

**Diffing the two v5 specs directly:**

```
v5 spec rule count -> gscan 4.49.7: 261   gscan 6.4.2: 259

SEVERITY DIFFERENCES on shared rules:
   GS110-NO-MISSING-PAGE-BUILDER-USAGE :  4.49.7=error  ->  6.4.2=warning
   GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE :  4.49.7=error  ->  6.4.2=warning

rules ONLY in 4.49.7 (Ghost 5 enforces them; Inflozo's gate never sees them):
   GS050-CSS-KGVIDTHUMB     warning
   GS050-CSS-KGVIDTHUMBPL   warning
   GS050-CSS-KGVIDTI        warning

rules ONLY in 6.4.2:
   GS005-NO-INLINE-DYNAMIC-PARTIAL   error      (harmless direction — over-strict)
```

**Severity of the consequence, measured rather than assumed:** Ghost 5 **accepted and activated** the
theme despite reporting the error. So this is **not a deploy blocker**. It is a **false all-clear** —
Inflozo reports "0 errors" while the customer's Ghost Admin shows a red error badge on the theme they
just shipped. FR-J6's "0 errors, 0 warnings" claim is false on Ghost 5 today.

**What survived the version split — do not re-derive these.** Both were re-checked in 4.49.7 source:

- `GS100-NO-UNUSED-CUSTOM-THEME-SETTING` exists in both, same rule.
- `GS051-CUSTOM-FONTS` exists in both with the **identical regex**
  `/^(?=[\s\S]*--gh-font-heading)(?=[\s\S]*--gh-font-body)/`.
- The `config.custom` cap is **20** in both; allowed types are `select|boolean|color|image|text` in both.

**Therefore AD-17 and AD-18 survive unchanged.** Only the GS110 pair and the three GS050 rules moved.

---

## What to change

### 1. Run the right checker for each Ghost major

The gate must run the gscan version each supported Ghost major actually bundles — not one version
with two spec flags. Concretely: gscan **4.49.7** for the Ghost 5 verdict, gscan **6.4.2** for the
Ghost 6 verdict. Both pinned exactly.

Decide and record how the two get pinned together (two dependencies, or one resolved per target) and
what happens when Ghost 5 ships a newer bundled gscan. **The version Ghost bundles is the input, not
the spec flag** — write that down, because it is the inference that was wrong.

### 2. Update AD-34

AD-34 places gscan inside the compile invocation and inside AD-11's budget. Amend it to state which
gscan version answers for which Ghost major, and why the spec flag alone is insufficient. This is a
"the intuitive form is wrong" case — say so explicitly, in the style AD-31 and AD-21 already use.

### 3. Re-measure AD-11's budget

AD-11 credits "gscan 210 ms per spec, two specs, so ~420 ms", and `MEASUREMENTS.md` records
217 + 88 = 305 ms — a drift Round 1 already flagged (Round 1 decision 24 says quote MEASUREMENTS
verbatim rather than restating). You are now running **two different gscan majors** rather than one
twice. Re-measure and update `MEASUREMENTS.md`; let the spine quote it.

### 4. Record both as AD-23 fixtures

AD-23 requires every external-platform fact to be a checked-in recording with its capture date and
the command that produced it. Record:

- the bundled-version readout from both Ghost images, with image digests;
- the three-way verdict comparison above;
- the spec diff.

Add a `VERIFY-AT-BUILD.md` entry with a refutation consequence: *"if a Ghost minor changes its bundled
gscan, the gate's Ghost-5 verdict is stale."*

### 5. The A33 Koenig consequence — flag it, do not solve it here

The three `GS050-CSS-KGVID*` rules that exist **only** in 4.49.7 are Koenig **video card** CSS rules.
`MEASUREMENTS.md` §7 found that excluding one Koenig card adds **10 warnings** the theme must then
satisfy. A33 Koenig Card Treatments is **six designs**, and it lands on E7 and E10 simultaneously.

So: a rule set the gate cannot currently see sits exactly on top of the feature with the known
warning multiplier. **Once the 4.49.7 path is running, re-run the `card_assets.exclude` measurement
under it and report the delta.** Do not attempt to redesign A33 in this session — report the number
so the A33 question can be answered with evidence.

---

## Acceptance — execute, do not reason

```bash
# stand up both Ghosts
docker run -d --name iz-ghost5 -p 2368:2368 -e NODE_ENV=development -e url=http://localhost:2368 ghost:5-alpine
docker run -d --name iz-ghost6 -p 2369:2368 -e NODE_ENV=development -e url=http://localhost:2369 ghost:6-alpine
# create an owner on each, then POST the theme zip to
#   /ghost/api/admin/themes/upload/     (multipart, field name "file", Accept-Version: v5.0)
# and read themes[0].errors / themes[0].warnings from the response
```

**Pass conditions:**

1. The gate's **Ghost 5 verdict matches what real Ghost 5.130.6 reports** for the same theme —
   error counts and rule codes both. That is the whole point; a verdict that merely "runs 4.49.7" but
   still disagrees has not fixed anything.
2. The gate's Ghost 6 verdict still matches real Ghost 6.58.0 (it already does — do not regress it).
3. The spike theme in `spike-compiler/` scores **0 errors / 0 warnings** under **both** checkers, or
   you report exactly which rule it now trips and why that is acceptable.
4. `MEASUREMENTS.md` carries the re-measured two-checker timing, and AD-11's budget still holds.
5. The A33 `card_assets.exclude` warning count under 4.49.7 is measured and reported.

Tear down with `docker rm -f iz-ghost5 iz-ghost6`.

## Do not

- Do not change AD-17 or AD-18. Both were re-verified against 4.49.7 and survive; changing them would
  be churn.
- Do not "fix" the GS110 warnings by weakening FR-J6's 0/0 target. The target is correct; the checker
  was wrong.
- Do not assume any other Ghost 5 minor bundles 4.49.7. That was read from **5.130.6** specifically.
  If you support a range, say how the range is covered.

## Report

The version-pinning approach, the three-way verdict comparison after your change, the re-measured
timing, and the A33 number. Flag any rule you found that differs between the two checkers beyond the
five listed above.
