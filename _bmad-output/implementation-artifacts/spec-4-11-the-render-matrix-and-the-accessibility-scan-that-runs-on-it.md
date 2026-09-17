---
title: 'Story 4.11 — The render matrix and the accessibility scan that runs on it'
type: 'feature'
created: '2026-09-17'
status: 'in-progress'
owner_test: none
review_loop_iteration: 0
baseline_commit: '568b61a41ffe1ac25e77212d85cacb475f8ffa54'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing you can click changes. This story builds the camera: a machine that opens every section we have
built, photographs it in light and dark at three widths (plus a fourth at 200% zoom and one with motion
turned off), and compares each photo with the one saved last time — so if a shared change nudges a
button three pixels, we find out the same day instead of a customer finding out. The same photographs
are handed to an accessibility checker, so a section that is hard to read or hard to use with a keyboard
fails too; from Epic 9 on, no category of designs can be approved by you until its photographs are green.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** NFR-6(a)'s render matrix and the NFR-5 axe-core scan that rides on it do not exist. Every
category owner gate from Epic 9 onward requires the matrix green, and the five pilots have no visual
regression gate at all — a change to `core.ts`, the reference tokens or a shared primitive silently
re-renders every design and nothing notices. The matrix is built here because §4 states it renders
locally and needs no Ghost, so it does not wait on the compiler.

**Approach:** One harness, `tools/matrix/`, that derives its case list from the design directory (never a
written list), renders each case locally through the same `renderCanvas` and the same canvas document the
editor uses, photographs it with a pinned Playwright/Chromium inside one pinned container image, and gates
the diff at 1% differing pixels / 0.1 per-pixel tolerance. axe-core runs inside the same page at WCAG 2.1
AA, zero violations — one matrix, no second pass. A manifest records the pin the baselines were taken
under, so a browser-floor bump that was not re-run fails (DW-138).

## Boundaries & Constraints

**Always:**
- **Every count derived.** The design list is the `packages/library/designs/{category}/{n}/` directory;
  the pack list is the token sets that exist; a design's fixture rows come from the design itself
  (it paginates → the four feed pages; its markup carries `data-members` → the visitor and Show-to arms;
  its `bindingContext` is `post` → the style-guide fixture). No literal total anywhere, in code or prose.
- **One copy of the canvas document.** The matrix renders through `pilotsCanvasDocument()` and `pilot()`
  in `apps/web/lib/pilots.ts` — the exact document the editor's iframe is served. A second document
  would let the matrix pass while the editor shows something else, which is the one thing it exists to
  catch.
- **The runner is part of the baseline.** One Playwright version, one container image pinned by tag *and*
  digest, fonts installed in the image, `animations: 'disabled'` and `caret: 'hide'` on every shot.
  Baselines are only ever written from inside that image.
- **A missing baseline fails.** It is never auto-created by a passing run; `--update` is the only writer
  and CI never passes it.
- **A mass rebaseline is its own commit, touching baselines and the manifest only, naming the change that
  caused it, and lands only on the owner's approval of a sampled visual review** — one design per
  category, both modes (NFR-6(a)).
- R-82: the axe run and the pilots' renders are compared against the deployed `/pilots` page before the
  story is done, so the harness and the real editor are proved to agree.

**Ask First:**
- Adding any dependency beyond `@playwright/test` (pinned 1.61.1) and `axe-core` (pinned 4.12.1).
- Anything that would edit a file under `packages/library/designs/` — a defect found in a pilot is raised
  against its owning category, never patched here (AD-35).
- Widening the pack axis by authoring token sets. Epic 6 authors the packs; this story does not.

**Never:**
- No second matrix for accessibility; no Ghost, Supabase, Vercel or network call in the render path.
- No baseline written outside the pinned image; no `--update` in CI.
- Not the compiler, not `.hbs` byte-identity (the E4/E7 joint gate, Story 7.35), not the synthesized
  templates or the category fixtures whose categories do not exist yet — their rows are derived and will
  expand when those designs land.
- No change to `pnpm check`'s existing duties: the matrix is its own gate with its own container, as the
  RLS gate is.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clean run | Every baseline present and matching | Exit 0; prints cases, designs, packs, violations (all derived) | N/A |
| Pixel drift | A shared primitive moves a button 3px | Exit non-zero naming design, pack, mode, viewport; diff PNG written to the run's output dir | N/A |
| Just below threshold | 0.9% of pixels differ at tolerance 0.1 | Passes — the gate is *above* 1% | N/A |
| Missing baseline | A new design with no PNG | Exit non-zero naming the case and `--update` | Never auto-written |
| axe violation | A link whose sole content is an image with `alt=""` | Exit non-zero naming rule id, case and selector | N/A |
| Positive control | A deliberately alt-less `<img>` injected before the real scan | Must be reported, or the run aborts | A scan whose control did not fire is not a result (standing rule 2) |
| Pin drift (DW-138) | Root `widelyAvailableOnDate` ≠ the manifest's | Exit non-zero: the baselines predate the floor; re-run and rebaseline | N/A |
| Run outside the image | `node` on a laptop, no container | Refuses unless `--host`, which never writes baselines | N/A |
| Reduced motion | Same design, `prefers-reduced-motion: reduce` forced | Its own case with its own baseline | N/A |
| Empty feed | The paginated design's `empty` fixture row | Renders the empty state as a case like any other (FR-H4) | N/A |

</frozen-after-approval>

## Code Map

- `packages/library/designs/{category}/{n}/` — **the design list.** Five pilots today: `a1/1` Rail,
  `a17/1` Three Up (paginates), `a22/1` Inline Row (`data-members`), `a24/1` Centred (`bindingContext:
  post`), `a4/13` Latest Post. All `provisional`.
- `apps/web/lib/pilots.ts` — `pilotIds()`, `pilot()`, `pilotRows()`, `pilotImage()`,
  `pilotsCanvasDocument()`. **Reuse all five.** `PACKAGES()` resolves from `process.cwd()` (line ~16);
  it must resolve from the module's own URL so the matrix can import it from the repo root.
- `apps/web/app/(app)/app/(authed)/pilots/review.tsx` — `paint()` (~line 124) is the render call to
  mirror: target, content defaults, `controlSchema`, `universals`, `dataBindings`, `getRows` from
  `pilotRows`, `ghost`/`site` from `orbitWeekly.templateContext(target, feed)`, `member`, `visibility`,
  `assets`, `icons`, then `js-enabled` on every `[data-module]`. `withImages()` (~line 60) rewrites the
  Orbit Weekly origin; the matrix serves that origin instead and rewrites nothing.
- `tools/check-snapshots.mjs` — the shape to copy: controls first, then the subject, then derived totals;
  `designDirs()`, `loadDesign()`, `assemble()`, `input()`. Imports the packages' TypeScript under Node 24.
- `packages/section-runtime/src/index.ts` — `renderCanvas(doc, src, input) => string`.
- `packages/section-runtime/reference-tokens.css` + `src/tokens.ts` — **the one token set that exists**
  (Paper's values, R-110's `--text-on-accent`). The pack axis has one member today.
- `supabase/tests/run-rls-gate.sh` — the container-gate pattern: brings its own image, refuses on drift,
  keys CI on the exit code. `.github/workflows/ci.yml` runs it as its own `rls` job.
- `tools/probe/run-verify-pilots.cjs` — the existing Playwright + axe-core 4.12.1 walk of the **deployed**
  `/pilots`; its axe invocation and positive control are the pattern, and it is the R-82 cross-check.
- `tools/doc-audit.py` line ~1109 `BASES` — walks `tools/`, so **every new file under `tools/matrix/`
  needs a catalogue row**; it does not walk `packages/`, so the baseline PNGs need none.
- `package.json` — `browserslist-config-baseline.widelyAvailableOnDate: 2026-08-18` is the pin the
  manifest records.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/lib/pilots.ts` -- resolve `PACKAGES()` from `import.meta.url` instead of `process.cwd()` -- so the matrix can import the canvas document from the repo root; the app's behaviour is unchanged.
- [ ] `tools/matrix/cases.mjs` -- derive the case list: every design × every token set × light/dark × {1440, 834, 390, 1440-at-200%, 1440-reduced-motion}, expanded by each design's own fixture rows (feed pages if it paginates, visitor and Show-to arms if its markup carries `data-members`, the style-guide fixture if its `bindingContext` is `post`) -- pure, no browser, so the derivation has a test; carries the FR-H3 pin table as commented rows naming A25/A32/A33/A34 and the six synthesized stacks, each derived rather than listed.
- [ ] `tools/matrix/cases.test.mjs` -- assert the derivation against the five pilots: `a17/1` yields the four feed rows, `a22/1` the visitor arms, `a24/1` the post fixture, `a1/1` neither; assert no literal total is stored -- the one runnable check, in `pnpm test`.
- [ ] `tools/matrix/serve.mjs` -- a `node:http` server over the rendered case documents and Orbit Weekly's pictures at their real origin -- stdlib; so `url()`, `srcset` and the picture origin resolve exactly as they do in the editor, with no URL rewriting.
- [ ] `tools/matrix/matrix.spec.mjs` -- per case: render through `renderCanvas` into the `pilotsCanvasDocument()` shell, set `data-mode`, add `js-enabled` to every `[data-module]`, screenshot `#canvas`, then run axe-core at WCAG 2.1 AA in the same page behind a positive control -- one page load, one matrix.
- [ ] `tools/matrix/playwright.config.mjs` -- pin `toHaveScreenshot` to `threshold: 0.1`, `maxDiffPixelRatio: 0.01`, `animations: 'disabled'`, `caret: 'hide'`, and `snapshotPathTemplate` → `packages/library/baselines/{category}/{n}/` -- the AC's two numbers live in exactly one place.
- [ ] `tools/matrix/Dockerfile` -- `FROM mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`, plus the fonts the token set names -- **the stock image has no Latin fonts and this is load-bearing, not polish** (executed 2026-09-17, see Design Notes): `apt-get install fonts-inter` (4.0+ds-1, in apt) and a Georgia substitute, which is **not** in apt — fetch Gelasio from Google Fonts pinned by checksum, or alias to `fonts-liberation2` / `fonts-crosextra-caladea`; then a fontconfig alias for Georgia, and `fc-match Georgia` / `fc-match Inter` asserted in the image build so a missing font fails there, not in a baseline.
- [ ] `tools/matrix/run-matrix-gate.sh` -- build/run the image, mount the repo, run the spec inside; refuse to run on the host unless `--host`, and never write a baseline outside the image -- modelled on `supabase/tests/run-rls-gate.sh`.
- [ ] `tools/matrix/manifest.json` -- record the image digest, the Playwright version, the resolved font faces and the root `widelyAvailableOnDate` the baselines were taken under; the gate refuses when the root pin differs (DW-138) -- one line of policy, checked rather than remembered.
- [ ] `packages/library/baselines/**` -- the PNGs, written by `--update` from inside the image only.
- [ ] `package.json` -- add `@playwright/test` 1.61.1 and `axe-core` 4.12.1 as devDependencies and a `matrix` script; add `cases.test.mjs` to `pnpm test` -- the browser-free half runs per commit, the matrix does not.
- [ ] `.github/workflows/matrix.yml` -- a `schedule` nightly full run and a `push` run over only the designs the commit touched, where a change to `packages/section-runtime/`, the reference tokens, `packages/library/src/` or `tools/matrix/` counts as touching every design -- NFR-6(a)'s cadence, as **its own job**: `ci.yml`'s `deploy` keeps `needs: [check, rls]` and gains no third name (**R-116**), so a red matrix never holds the app's deploy. Do not edit `ci.yml`.
- [ ] `docs/render-matrix.md` -- the rebaseline rule, the cadence, what the manifest pins and how the owner's sampled review is done -- **plus its row in `tools/doc-audit.py`'s catalogue, and one row per new `tools/matrix/` file**, then `--generate`, or the pre-commit hook blocks the commit.
- [ ] `_bmad-output/implementation-artifacts/epic-4-context.md` -- append one sub-bullet under the render-matrix requirement; never lengthen the lead (DW-73).

**Acceptance Criteria:**
- Given the five pilots and the one token set that exists, when `bash tools/matrix/run-matrix-gate.sh` runs, then every case renders, every baseline matches, axe reports zero violations at WCAG 2.1 AA, and the printed totals are derived — no literal count appears in any file this story adds.
- Given a baseline PNG, when it is held beside its pilot's frame in `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/` — `A1-1 Rail.dc.html`, `A17-1 Three Up.dc.html`, `A22-1 Inline Row.dc.html`, `A24-1 Centred.dc.html`, `A4-13 Latest Post.dc.html`, each beside its `A<n>-0 Category Proof.dc.html` — then the render **matches the frame** — the export is the design authority and is never edited (R-74).
- Given a one-pixel-per-thousand change to a shared primitive, when the gate runs, then it passes (below 1%); given a button moved 3px on one design, then it fails naming design, pack, mode and viewport, and writes a diff image.
- Given a design with no baseline, when the gate runs, then it fails naming the case — never writes one.
- Given the root `widelyAvailableOnDate` is moved, when the gate runs, then it fails until the baselines are re-taken and the manifest re-recorded (DW-138 closes).
- Given the axe scan, when the positive control's alt-less image is not reported, then the run aborts rather than reporting zero violations (standing rule 2).
- Given the same five pilots on the deployed `/pilots`, when `run-verify-pilots.cjs` and the matrix are both run, then their axe results agree — the harness renders what the editor renders (R-82).
- Given a push whose matrix job goes red, when CI runs, then `deploy` still runs and the app still publishes — `ci.yml`'s `deploy` declares `needs: [check, rls]` and nothing else (**R-116**); proved by control, not asserted.

## Design Notes

**Why the pack axis has one member today, and that is not a shortfall.** NFR-6(a) names "3 reference
Style Packs". Epic 4 ships exactly one reference token set by design (step-6 finding F2: the canvas needs
a token block three epics before any pack exists); Epic 6 authors the twelve packs and picks the three
references. Standing rule 4 governs: the axis is **derived from the token sets that exist** and widens on
its own when Epic 6 lands — which is a mass rebaseline under NFR-6(a)'s own rule regardless. Inventing
two throwaway packs now to make the number three would be inventing a decision the owner never made.
Filed as deferred work owned by Epic 6.

**Why the fixture pins are derived from each design rather than listed by category.** FR-H3 names A32 on
a gated `post.hbs`, A33 on the style-guide post, A34 on the feed's first/middle/partial-last, A25 on the
style-guide post *and* page, the six synthesized stacks, and an empty tag. None of those categories exists
yet. A written list would be four stale rows; deriving the rows from what the design *is* (it paginates;
its markup reads `@member`; its context is `post`) makes each pin arrive with its category. `/pilots`
already decides the same way (`paginates`, `DRAWS_SHOW_TO`), which is the second reason to derive.

**Why a local http server and not `file://`.** The canvas document is served whole today and its pictures
come from Orbit Weekly's own origin. Serving over `127.0.0.1` lets the matrix render the document
byte-identically to the editor's, with no URL rewriting — 15 lines of `node:http`, no dependency.

**Why `@playwright/test` rather than a comparator of our own.** Its `toHaveScreenshot` carries exactly the
AC's two knobs (`threshold`, `maxDiffPixelRatio`) plus `animations: 'disabled'` and `caret: 'hide'`.
Writing a pixel comparator would be re-implementing it worse.

**Fonts — executed 2026-09-17, not assumed (standing rule 1).** The token set names `Georgia, serif` and
`'Inter', sans-serif`. Inside the pinned image, **`fc-match` resolves Georgia, Inter, `serif` *and*
`sans-serif` all to WenQuanYi Zen Hei** — a CJK face — because the stock image ships 20 font families and
no Latin serif or sans. Baselines taken as-is would be deterministic and *wrong*: every pilot photographed
in a Chinese fallback, and "matches the frame" could never hold. So the font install is a gate, not a
nicety. What apt in the image actually offers, checked the same day: `fonts-inter` **4.0+ds-1** ✅,
`fonts-liberation2` 1:2.1.5-3 ✅, `fonts-crosextra-caladea` 20200211-2 ✅, `fonts-dejavu-core` 2.37-8 ✅,
`fontconfig` 2.15.0-1.1ubuntu2 ✅ — and **`fonts-gelasio` is NOT in apt**, so the closest Georgia
metric-compatible face has to be fetched from Google Fonts at image-build time and pinned by checksum, or
Georgia aliased to Liberation Serif / Caladea instead. Recommended: Gelasio by checksum (closest metrics,
fetched once when the image is built). The manifest records the resolved faces, so a font change shows up
as a manifest diff rather than as mysterious pixel drift. The matrix is a regression gate, not a fidelity
claim about a visitor's machine.

**The runner, as executed on this machine 2026-09-17.** Docker 29.1.3, daemon healthy, no sudo needed;
`mcr.microsoft.com/playwright:v1.61.1-noble` pulled (3.45 GB), digest
`sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`, carrying Node v24.17.0 and
`chromium-1228` + `chromium_headless_shell-1228`. `@playwright/test@1.61.1` and `axe-core@4.12.1` are now
repo devDependencies at exact pins — until this story they were borrowed from a path *outside* the repo
(`/home/ghost/Dev/BMAD/inflozo/node_modules/…`, which `tools/probe/run-verify-pilots.cjs` still hardcodes;
moving that probe onto the repo's own copy is a tidy-up for the Dev run, not a new decision).

**`86668878` said `Dev` and was not the end of Dev — and the board believed it.** That push pinned the
toolchain with **0 of 14 tasks ticked**, but a Dev commit is the claim that development is finished
(R-81 commits *after* the phase; build-sequence.md makes Dev done when every task is ticked), so the story
board read it as "ready for Review" and showed 4.11 there while nothing was built. The owner caught it on
2026-09-17. It is not rewritten (a pushed commit is never amended). Fixed by `Hotfix` the same day:
`tools/hooks/commit-msg` now refuses a Dev commit while any task is unticked, and `tools/story-board.py`
will not read a Dev commit with an open task as Review — which is what puts this story back at Build
without a second, dishonest phase word. Stories 1.4 and 1.5 had pushed the same shape; neither is still
open. **For the rest of this story:** the toolchain task above stays unticked (its `matrix` script and
`cases.test.mjs` half are not done), and the next commit under this story's name is the Dev commit that
finishes it.

## Verification

**Commands:**
- `bash tools/matrix/run-matrix-gate.sh` -- expected: exit 0; prints the derived case, design and pack
  totals and `0 violations`; a second run is byte-identical (determinism).
- `bash tools/matrix/run-matrix-gate.sh` after `sed`-ing 1px of padding into one pilot's `style.css`
  (reverted after) -- expected: non-zero, naming that design and writing a diff PNG. **The control.**
- `bash tools/matrix/run-matrix-gate.sh` after moving `widelyAvailableOnDate` (reverted after) --
  expected: non-zero on the pin, DW-138's assertion executed rather than asserted.
- `node tools/matrix/cases.test.mjs` -- expected: the five pilots' rows as the task states.
- `pnpm check` -- expected: green, including the new `cases.test.mjs`; `pnpm check` must not grow a
  browser dependency.
- `python3 tools/doc-audit.py --check` (twice) -- expected: green, with every new `tools/matrix/` file
  and `docs/render-matrix.md` catalogued.
- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' tools/probe/.env | xargs) node tools/probe/run-verify-pilots.cjs`
  -- expected: PASS on the deployed `/pilots`, and its axe results agree with the matrix's for the same
  five designs (R-82: the real stack, not mocks).

## Questions for the owner

**Q1. When the picture check goes red, should it stop the app from being published?**

This story adds a check that photographs every section and compares each photo with the one saved last
time. Today, publishing the Inflozo app to the live site is blocked when the code checks or the database
checks go red — nothing reaches `app.inflozo.com` until they are green.

The picture check is different in one way that matters: a red result often means *you changed something
on purpose and the picture simply needs re-saving*, not that anything is broken.

Example: you approve a small change to the shared button styling. Every section's button moves two
pixels. Every photograph now differs from its saved copy. Meanwhile an unrelated fix — say a typo on the
sign-in screen — is waiting to go live in the same push.

1. **It does not block publishing (RECOMMENDED).**
   - The picture check runs on its own, nightly and on each push, and goes red on its own.
   - The typo fix still reaches the live site; the red picture check waits for you to look at the photos
     and approve the new ones.
   - Nothing is lost: from Epic 9 onward **you cannot approve a category of designs until its pictures
     are green**, so no section reaches a customer's site unchecked. The check still guards the thing it
     was built to guard — it just doesn't hold the app's front door.
2. **It blocks publishing, exactly like the code checks.**
   - Nothing at all reaches the live app until every photograph matches or you approve the new ones.
   - Safest reading of "green means shippable", but the two-pixel button above would stop the typo fix,
     and you would be asked to approve photographs at moments you did not choose.
3. **It blocks only when the push changed a section's own files.**
   - A change to a section blocks; a change to the sign-in screen does not.
   - Middle ground, but the most common cause of a red picture check is a *shared* change — which this
     option lets through, so it blocks in the cases that matter least.

**Ruled: option 1 (owner, 2026-09-17).** Recorded as **R-116** in `reconcile-designs-decisions.md` §A. The matrix
is its own CI job — nightly in full, per push over the designs that push touched — and `ci.yml`'s `deploy` keeps
`needs: [check, rls]` and gains no third name. Every category owner gate from Epic 9 onward still requires the
matrix green, so the gate moved off the app's deploy, not off the library.

**Q2. A button nudged a few pixels sideways does not turn the picture check red. Is that acceptable?**

The picture check compares each new photo of a section with the saved one, and goes red when **more than 1% of
the photo** has changed — the limit the PRD sets (NFR-6(a)). This story promised something stronger: "if a shared
change nudges a button three pixels, we find out the same day". I tested that promise on 2026-09-17, and it is only
half true.

Example: in "Inline Row" (A22 #1, the newsletter sign-up), I moved the Subscribe button 3 pixels to the right and
changed nothing else. The photos changed by **0.36%** on a desktop screen, **0.60%** on a phone and **0.71%** on a
tablet — all under 1%, so the check **stayed green**. When a change also makes a section taller or shorter, as most
spacing changes do, the check **goes red**: moving Latest Post's (A4 #13) buttons 3 pixels down failed it on desktop.

1. **Keep the 1% limit, and I correct the promise (RECOMMENDED).**
   - The check catches any change that resizes or reshuffles a section, and anything that changes more than 1% of a
     photo. A small sideways nudge of one thing that moves nothing else can pass.
   - The PRD is unchanged. This story's wording, and the "button moved 3px" example in its test list, change to a
     move the check really catches. You still look at every section yourself when you approve each category.
2. **Tighten the limit for these photos to 0.1%.**
   - The nudge above would go red.
   - The photos come out identical run after run on this machine, but GitHub's servers have not yet been compared
     with them. If their rendering differs by more than 0.1%, the check would go red with nothing wrong, and you
     would be asked to approve photos that did not really change. It also changes the PRD's number.
3. **Any changed pixel goes red.**
   - Catches everything, including changes nobody could see. Every intended change, however small, waits for your
     approval of new photos.

**Ruled:** _(awaiting the owner)_

## Spec Change Log
