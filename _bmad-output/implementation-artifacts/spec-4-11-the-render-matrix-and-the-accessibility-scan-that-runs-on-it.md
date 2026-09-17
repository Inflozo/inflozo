---
title: 'Story 4.11 — The render matrix and the accessibility scan that runs on it'
type: 'feature'
created: '2026-09-17'
status: 'in-review'
owner_test: none
review_loop_iteration: 1
baseline_commit: '568b61a41ffe1ac25e77212d85cacb475f8ffa54'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing you can click changes. This story builds the camera: a machine that opens every section we have
built, photographs it in light and dark at three widths (plus a fourth at 200% zoom and one with motion
turned off), and compares each photo with the one saved last time — so a shared change that resizes or
reshuffles a section, or changes more than 1% of its photo, is found the same day instead of by a customer
(a small sideways nudge of one button can pass: you ruled to keep that limit, R-117). The same photographs
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
| Pixel drift | A change moves a button 3px down, so its section grows (renegotiated by R-117: a 3px sideways nudge of one button stays under 1% and passes) | Exit non-zero naming design, pack, mode, viewport; diff PNG written to the run's output dir | N/A |
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
- [x] `apps/web/lib/pilots.ts` -- resolve `PACKAGES()` from `import.meta.url` instead of `process.cwd()` -- so the matrix can import the canvas document from the repo root; the app's behaviour is unchanged.
- [x] `tools/matrix/cases.mjs` -- derive the case list: every design × every token set × light/dark × {1440, 834, 390, 1440-at-200%, 1440-reduced-motion}, expanded by each design's own fixture rows (feed pages if it paginates, visitor and Show-to arms if its markup carries `data-members`, the style-guide fixture if its `bindingContext` is `post`) -- pure, no browser, so the derivation has a test; carries the FR-H3 pin table as commented rows naming A25/A32/A33/A34 and the six synthesized stacks, each derived rather than listed.
- [x] `tools/matrix/cases.test.mjs` -- assert the derivation against the five pilots: `a17/1` yields the four feed rows, `a22/1` the visitor arms, `a24/1` the post fixture, `a1/1` neither; assert no literal total is stored -- the one runnable check, in `pnpm test`.
- [x] `tools/matrix/serve.mjs` -- a `node:http` server over the rendered case documents and Orbit Weekly's pictures at their real origin -- stdlib; so `url()`, `srcset` and the picture origin resolve exactly as they do in the editor, with no URL rewriting.
- [x] `tools/matrix/matrix.spec.mjs` -- per case: render through `renderCanvas` into the `pilotsCanvasDocument()` shell, set `data-mode`, add `js-enabled` to every `[data-module]`, screenshot `#canvas`, then run axe-core at WCAG 2.1 AA in the same page behind a positive control -- one page load, one matrix.
- [x] `tools/matrix/playwright.config.mjs` -- pin `toHaveScreenshot` to `threshold: 0.1`, `maxDiffPixelRatio: 0.01`, `animations: 'disabled'`, `caret: 'hide'`, and `snapshotPathTemplate` → `packages/library/baselines/{category}/{n}/` -- the AC's two numbers live in exactly one place.
- [x] `tools/matrix/Dockerfile` -- `FROM mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`, plus the fonts the token set names -- **the stock image has no Latin fonts and this is load-bearing, not polish** (executed 2026-09-17, see Design Notes): `apt-get install fonts-inter` (4.0+ds-1, in apt) and a Georgia substitute, which is **not** in apt — fetch Gelasio from Google Fonts pinned by checksum, or alias to `fonts-liberation2` / `fonts-crosextra-caladea`; then a fontconfig alias for Georgia, and `fc-match Georgia` / `fc-match Inter` asserted in the image build so a missing font fails there, not in a baseline.
- [x] `tools/matrix/run-matrix-gate.sh` -- build/run the image, mount the repo, run the spec inside; refuse to run on the host unless `--host`, and never write a baseline outside the image -- modelled on `supabase/tests/run-rls-gate.sh`.
- [x] `tools/matrix/manifest.json` -- record the image digest, the Playwright version, the resolved font faces and the root `widelyAvailableOnDate` the baselines were taken under; the gate refuses when the root pin differs (DW-138) -- one line of policy, checked rather than remembered.
- [x] `packages/library/baselines/**` -- the PNGs, written by `--update` from inside the image only.
- [x] `package.json` -- add `@playwright/test` 1.61.1 and `axe-core` 4.12.1 as devDependencies and a `matrix` script; add `cases.test.mjs` to `pnpm test` -- the browser-free half runs per commit, the matrix does not.
- [x] `.github/workflows/matrix.yml` -- a `schedule` nightly full run and a `push` run over only the designs the commit touched, where a change to `packages/section-runtime/`, the reference tokens, `packages/library/src/` or `tools/matrix/` counts as touching every design -- NFR-6(a)'s cadence, as **its own job**: `ci.yml`'s `deploy` keeps `needs: [check, rls]` and gains no third name (**R-116**), so a red matrix never holds the app's deploy. Do not edit `ci.yml`.
- [x] `docs/render-matrix.md` -- the rebaseline rule, the cadence, what the manifest pins and how the owner's sampled review is done -- **plus its row in `tools/doc-audit.py`'s catalogue, and one row per new `tools/matrix/` file**, then `--generate`, or the pre-commit hook blocks the commit.
- [x] `_bmad-output/implementation-artifacts/epic-4-context.md` -- append one sub-bullet under the render-matrix requirement; never lengthen the lead (DW-73).

### Review Findings

Review of 2026-09-17 over `568b61a4..1ed2ed16`, five layers (Blind Hunter, Edge Case Hunter, Verification Gap,
Acceptance Auditor, Real-infra verifier), none failed. No decision is the owner's: both questions above were ruled
before the review. Patches applied in this phase, each verified by `pnpm check` and by the gate inside the image:

- [x] [Review][Patch] `controls-review.ts` still resolved `packages/` from the working directory while `pilots.ts` no longer did, and the matrix carried a second copy of `imagePool()`'s glob — both readers now resolve from their own address and `cases.mjs` imports `imagePool()` [apps/web/lib/controls-review.ts:17 · tools/matrix/cases.mjs]
- [x] [Review][Patch] `--update` passed `--update-snapshots=changed`, so drift under 1% was kept across approvals and could accumulate until an unrelated commit was blamed — now `all` [tools/matrix/run-matrix-gate.sh]
- [x] [Review][Patch] `docker build -q … >/dev/null` swallowed the Dockerfile's `fc-match` lines, the reason a font gate fails — the log is kept and printed on failure only [tools/matrix/run-matrix-gate.sh]
- [x] [Review][Patch] a `MATRIX_DESIGNS` that names no design (a typo, a removed design) ran zero cases and passed green — it now throws, asserted in `cases.test.mjs`; the on-demand workflow gained a `designs` input so a category can be re-run alone [tools/matrix/cases.mjs · .github/workflows/matrix.yml]
- [x] [Review][Patch] `matrix.yml` installed the whole workspace before deciding whether anything runs, had no `concurrency` group (two runs racing on one image and one artifact name), and counted neither `/pilots`' own `paint()` nor `.nvmrc` as a shared input — scope first, install gated on it, one run at a time, both paths added [.github/workflows/matrix.yml]
- [x] [Review][Patch] the "no file writes the total down" scan matched a version, a date or a percentage that happened to carry the digits — those runs are blanked before the match [tools/matrix/cases.test.mjs]
- [x] [Review][Patch] the installed Playwright version was read with a `sed` over `package.json`'s indentation — `node -p` reads it [tools/matrix/run-matrix-gate.sh]
- [x] [Review][Patch] `serve()`'s `close` waited on idle keep-alive sockets — `closeAllConnections()` first [tools/matrix/serve.mjs]
- [x] [Review][Patch] the Dev-phase hook blamed python when the spec was merely not `git add`ed — it now says so [tools/hooks/commit-msg]
- [x] [Review][Patch] docs: `--host` is expected to fail the manifest and the font-dependent cases; a "Moving the runner" section (the five things that move together, the apt-pin failure mode, the standing-rule-7 grep); `--update` re-takes every photograph; the `image` field is the Dockerfile's, not observed; "One today" reworded so no pack count is written down; `CLAUDE.md`'s verify block names the gate [docs/render-matrix.md · CLAUDE.md · tools/matrix/cases.mjs]
- [x] [Review][Defer] the axe scan does not stop at the post body's edge — no design draws `{{content}}` yet [tools/matrix/matrix.spec.mjs] — deferred, DW-170
- [x] [Review][Defer] the Show-to axis is derived from `data-members` while `/pilots` draws it from `DRAWS_SHOW_TO` (a1/1 photographed hidden, a4/13's hidden arm not) — the frozen Boundaries fix the matrix's side [tools/matrix/cases.mjs · pilots/review.tsx:57] — deferred, DW-171
- [x] [Review][Defer] the commit-msg hook's Dev block has no executed control of its own [tools/hooks/commit-msg] — deferred, DW-172
- [x] [Review][Defer] one full run in six failed on one case (`a17/1 · reference-light-1440-reduced-motion-feed-first`, thrown, not a pixel mismatch) and did not reproduce; its error context was cleared by the next run before it was read [tools/matrix/matrix.spec.mjs] — deferred, DW-173

Dismissed as noise or out of scope: bash-3.2 array expansion, a docker-missing preamble, the 60-minute nightly ceiling, a `.dockerignore`, apt's own re-pin, a removed design's push scope (the nightly orphan check covers it), and the Edge Case Hunter's guards on shapes `validateDesign` already refuses.

**Acceptance Criteria:**
- Given the five pilots and the one token set that exists, when `bash tools/matrix/run-matrix-gate.sh` runs, then every case renders, every baseline matches, axe reports zero violations at WCAG 2.1 AA, and the printed totals are derived — no literal count appears in any file this story adds.
- Given a baseline PNG, when it is held beside its pilot's frame in `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/` — `A1-1 Rail.dc.html`, `A17-1 Three Up.dc.html`, `A22-1 Inline Row.dc.html`, `A24-1 Centred.dc.html`, `A4-13 Latest Post.dc.html`, each beside its `A<n>-0 Category Proof.dc.html` — then the render **matches the frame** — the export is the design authority and is never edited (R-74).
- Given a one-pixel-per-thousand change to a shared primitive, when the gate runs, then it passes (below 1%); given a button moved 3px down on one design so its section grows, then it fails naming design, pack, mode and viewport, and writes a diff image — and given one button nudged 3px sideways with nothing else moved, then it passes, because NFR-6(a)'s 1% stands (**R-117**).
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

**Real services this story hit (R-82)** — every key read from `tools/probe/.env` into the command's environment by
its variable name, never printed:
- **The deployed app, `https://app.inflozo.com/pilots`** — `run-verify-pilots.cjs` on HEAD `2beb8cac` as deployed:
  **0 FAIL, 152 PASS**; axe's positive control reported `image-alt`; axe found **zero violations inside the canvas for
  every pilot** (Rail, Three Up, Inline Row, Centred, Latest Post) at Light and Dark × Desktop, Tablet, Phone × Signed
  out, Free, Paid. The matrix found zero on every case behind the same control — **they agree**.
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`) — `GET /v13/deployments/app.inflozo.com` answered
  `dpl_68DW3ZMyKqNzyEsnUQDhCBCh1u1H`, `READY`, built from `2beb8cac`, the checkout's HEAD.
- **Supabase** (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`) — the probe's throwaway owner: `POST /auth/v1/admin/users` 200,
  `POST /auth/v1/admin/generate_link` (magiclink) 200, `DELETE /auth/v1/admin/users/{id}` 200, the user count unchanged.
- **GitHub Actions** (`GITHUB_TOKEN`, read only) — `CI` for `2beb8cac`: `check` success, `rls` success, `deploy` success.
- **Not hit, by design:** Resend, Dodo, and the Ghost servers T1 and T3. The matrix renders locally with no Ghost and
  no network in its render path (§4; this spec's Never), and nothing in this story sends mail or bills.

**Commands, as executed 2026-09-17** in the image built from `tools/matrix/Dockerfile`. Every control was restored,
and a sha256 list of every design file, every baseline, `reference-tokens.css`, `package.json` and `tools/matrix/`
was identical before and after the controls.
- `bash tools/matrix/run-matrix-gate.sh` — exit 0; printed its derived totals, `0 violations — passed`.
- **Determinism:** `bash tools/matrix/run-matrix-gate.sh --update --update-snapshots=all` with nothing changed — every
  photograph and `manifest.json` re-taken **byte-identical**. `all` writes any difference, even one under 1% (the
  token control below proves it), so identical bytes mean identical renders.
- **Pixel drift, the control (R-117's shape):** A4 #13 `.a4-13__actions` `margin-block-start` 32px → 35px,
  `MATRIX_DESIGNS=a4/13` — **exit 1**. Its 1440 and 1440-reduced-motion cases failed in both modes, each named like
  `a4/13 · reference-light-1440 — pack reference, mode light, viewport 1440`: "Expected an image 1440px by 604px,
  received 1440px by 607px" (dark adds "9628 pixels (ratio 0.02 of all image pixels) are different"), with a
  `-diff.png` per failing case under `tools/matrix/test-results/`.
- **Below threshold, one design:** A22 #1 `.a22-1__button` `margin: 0` → `0 0 0 3px`, `MATRIX_DESIGNS=a22/1` — exit 0.
  Re-taken into a copy and measured: 0.36% at 1440, 0.60% at 390, 0.71% at 834 (R-117).
- **Below threshold, shared primitive:** `--button-radius` 8px → 9px in `reference-tokens.css`, full run — exit 0.
  Re-taken into a copy: pixels changed in every design that draws a button, the largest share 0.327% — the change
  landed and stayed under 1%.
- **Missing baseline:** `a17/1/reference-light-390-feed-empty.png` moved out, `MATRIX_DESIGNS=a17/1` — exit 1: "a17/1 ·
  reference-light-390-feed-empty — pack reference, mode light, viewport 390, feed-empty — it has no baseline; take one
  with bash tools/matrix/run-matrix-gate.sh --update"; the file was still absent after the run.
- **Pin drift (DW-138):** root `widelyAvailableOnDate` 2026-08-18 → 2026-09-01, `MATRIX_DESIGNS=a4/13` — exit 1:
  "widelyAvailableOnDate: the root package.json pins 2026-09-01 and the baselines were taken under 2026-08-18 — the
  baselines predate the floor; re-run … (DW-138)".
- **axe violation:** a link whose sole content is an `<img alt="">` added to A4 #13 — exit 1, per case:
  `link-name: a[href$="#archive"]`, under the case's design, pack, mode and viewport.
- **Positive control:** the control `<img>` given an alt in `matrix.spec.mjs` — exit 1: "axe's positive control — an
  <img> with no alt — was not reported, so this scan is not a result (standing rule 2)".
- **Outside the image:** `node node_modules/@playwright/test/cli.js test -c tools/matrix/playwright.config.mjs` —
  refused ("the render matrix runs inside its pinned image"); `--host --update` — `REFUSED`; `CI=true … --update` —
  `REFUSED`; `--host --update-snapshots=all` — the case failed "a baseline is written only inside the pinned image".
- **Reduced motion and empty feed:** each is its own baseline (`…-1440-reduced-motion-…`, `…-feed-empty.png`) and
  passed in every clean run above.
- `pnpm check` (Node 24) — exit 0, `cases.test.mjs` included and passing; no package gained a browser dependency.
- `python3 tools/doc-audit.py --check` (twice) — `PASS (0 warning(s))`.
- **Matches the frame (R-74), sampled by eye:** `A22-1 Inline Row.dc.html` and `A17-1 Three Up.dc.html` rendered
  headless beside `a22/1/reference-light-1440-visitor-anonymous.png` and `a17/1/reference-dark-1440-feed-middle.png`
  (the Dev subagent also held A4 #13 and A17 #1 beside their frames). Structure, order, spacing and content match.
  The differences are later rulings, not drift: ink words on the accent button (R-110), and Orbit Weekly's pictures
  where the frame draws placeholders. **Not decidable on this machine:** A22's headline breaks onto two lines in the
  baseline (Gelasio) and fits one line in the frame. This host draws the frame's Georgia in a narrower substitute
  face, so it is not a Georgia reference.

**Only after the Dev push — for the review phase:**
- **R-116's control.** Read in source today: `ci.yml`'s `deploy` declares `needs: [check, rls]` (line 68), `ci.yml` is
  untouched, and the matrix is its own workflow file. The executed proof is a push whose `Render matrix` run is red
  while `CI`'s `deploy` succeeds, read with `GITHUB_TOKEN`. If the Dev push's matrix run is green, a deliberately red
  run is still owed.
- **The `pilots.ts` path change, deployed.** The probe above ran on `2beb8cac`, with this story's `apps/` and
  `packages/` changes set aside, as the probe requires. Re-run it on the Dev commit once CI has deployed it.
- **GitHub's runner vs this machine.** Whether the matrix workflow's renders on `ubuntu-latest` match baselines taken
  here is unmeasured until its first run.

**The review phase, executed 2026-09-17 (R-82)** — the Real-infra verifier re-ran every claim above on the Dev commit `1ed2ed16`
as deployed; keys read by variable name only:
- **GitHub Actions** (`GITHUB_TOKEN`): `CI` run 35183498316 — `check`, `rls`, `deploy` all success. **`Render matrix`** run
  35183498327 on the same push — success; its scope step printed `every design (a shared input changed)`; the reporter printed
  the same derived totals as this machine, `0 violations — passed`, so **GitHub's runner inside the pinned image matches the
  baselines taken here** (the open question above is closed). The nightly cron has not fired yet (first due 21:30 UTC).
- **Vercel** (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`): `app.inflozo.com` → `dpl_3BneEjv17c5Exz66ibPP2CGrj94W`, `READY`, built from
  `1ed2ed16`.
- **The deployed `/pilots` on `1ed2ed16`** — `run-verify-pilots.cjs`: **0 FAIL, 152 PASS**; Supabase admin create / magiclink /
  delete 200, users unchanged; axe's positive control reported `image-alt`, zero violations for every pilot in every state. The
  `pilots.ts` path change is live and correct. (First attempt died on this machine's `ERR_NETWORK_CHANGED`; the retry passed.)
- **The gate here, before the patches:** exit 0, same totals. **Negative control:** a17/1's `…-390-feed-empty.png` moved out →
  exit 1 naming the case and `--update`; nothing written; sha256 of every a17/1 baseline and the manifest identical after.
- **After the patches:** `pnpm check` exit 0 (Node 24). The gate inside the image, full run × 6: five exit 0 with the same
  totals; **one exit 1** on `a17/1 · reference-light-1440-reduced-motion-feed-first` (a thrown error, not a pixel mismatch —
  its error context was cleared by the next run before it was read; DW-173). `MATRIX_DESIGNS=zz/1` → exit 1, "names no
  design". `bash -n` on the script and the hook.
- **R-116's executed control** is run right after this commit is pushed and recorded below: the on-demand `Render matrix`
  dispatched with `designs: zz/1` goes red on HEAD while the same HEAD's `CI` `deploy` succeeds.

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

**Ruled: option 1 (owner, 2026-09-17).** Recorded as **R-117** in `reconcile-designs-decisions.md` §A. NFR-6(a)'s
1% at 0.1 stands; the promise in `## In plain English`, the Pixel-drift row and its acceptance criterion, and
`docs/render-matrix.md` now say what the gate catches — a change that resizes or reflows a section, or changes more
than 1% of a photograph — and that a small sideways nudge of one element can pass.

## Spec Change Log

- **2026-09-17, Dev — `new URL('../../../packages', import.meta.url)` fails `next build`** (executed): Turbopack reads
  that form as an asset import ("Module not found"), through a variable too. `pilots.ts` resolves
  `join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'packages')`, which Turbopack's node runtime computes
  at run time from the chunk's own location (`resolveFileUrl`, read in the built runtime: the same root `process.cwd()`
  reached). `pnpm build` and `apps/web/pilots.test.ts` pass; the deployed proof is the Deploy phase's
  `run-verify-pilots.cjs` on the pushed commit. The reason sits beside the code.
- **2026-09-17, Dev — `a1/1` carries `data-members` too** (Sign in / Subscribe / Account), so the Boundaries' derivation
  gives Rail the visitor and Show-to rows; the test task's "`a1/1` neither" is held as *no feed rows and no post
  fixture*, and the test asserts Rail's member rows equal Inline Row's. A Show-to row is the audience **viewed by a
  visitor it hides from** (the first visitor that is not the audience): shown to its own audience it draws exactly the
  visitor row's pixels, so the one Show-to state with pixels of its own is the section gone — asserted empty, then the
  window photographed.
- **2026-09-17, Dev — the image, as executed.** `ADD --checksum` is ignored by the legacy docker builder this machine
  runs (an all-zero checksum built), so the Gelasio files are checked with `sha256sum -c` in a RUN step (its control
  refused a wrong sum). `fonts-dejavu-core=2.37-8` joins Inter so `serif`/`sans-serif` are Latin; `fonts.conf` is the
  Georgia → Gelasio alias. Over CDP, Chromium draws `--font-heading` with Gelasio, `--font-body` with Inter and the
  pictures' Arial with Liberation Sans. 200% zoom is 720 CSS pixels at device scale 2.
- **2026-09-17, Dev — additions the Tasks implied and did not name**, each routine: `tools/matrix/reporter.mjs` prints
  the totals once across workers; `manifest.json` records the Chromium build as well; a baseline with no case fails
  (`--update` deletes it); `tools/matrix/test-results/` is gitignored; the push scope counts the shim, the library's data
  (`orbit-weekly/`, `icons/`, `strings/`, `modules/`, `contexts/`), the canvas document's two readers and the lockfile
  as touching every design, beside the four paths named; `tools/probe/run-verify-pilots.cjs` now loads the repo's own
  `@playwright/test` and `axe-core`; `docs/section-authoring.md`'s pin paragraph points at the enforcement; DW-138 is
  marked done.
- **2026-09-17, Dev — R-82's cross-check, before the push.** `run-verify-pilots.cjs` on the deployed `/pilots`
  (b753d9f0, READY): 0 FAIL, 152 PASS, the axe positive control reported, zero violations for every pilot at Light and
  Dark × three widths × three visitors. The matrix inside the image: zero violations on every case behind the same
  control. They agree. (Its first run timed out waiting for the canvas on a cold start; the re-run passed.)
- **2026-09-17, Dev — Q2 ruled option 1 (R-117); the Pixel-drift row and its criterion renegotiated by the owner.**
  The first "3px" control (A4 #13's buttons moved down) had failed on the photograph's size, not its ratio; a 3px
  sideways nudge on A22 #1 measured 0.36–0.71% and passed. Asked in `2beb8cac` (Blocked, the question alone, the Dev
  work held back), ruled the same day: NFR-6(a)'s 1% stands. The frozen row and the criterion now name a move that
  grows the section and say a sideways nudge passes; `## In plain English`, `docs/render-matrix.md` and the epic
  context promise only that. Also removed two written-down counts from files this story adds ("five viewports",
  "the five pilots"). `baseline_commit` is `568b61a4`, the last Create commit, so the review diff carries
  `86668878`'s pins.
