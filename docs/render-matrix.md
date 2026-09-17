# The render matrix

Story 4.11 — NFR-6(a)'s render matrix and NFR-5's accessibility scan, which rides on it. **In plain English:** a
machine opens every section in the library, photographs it in light and dark at every width we support, compares
each photograph with the one saved last time, and runs an accessibility checker over the same page. A shared change
that resizes or reshuffles a section, or changes more than 1% of its photograph, is found the same day, not by a
customer. A small sideways nudge of one element that moves nothing else can pass — the owner ruled to keep the 1%
limit (R-117).

From Epic 9 on, **no category of designs can be approved by the owner until its photographs are green.**

## Running it

```bash
bash tools/matrix/run-matrix-gate.sh             # the gate (also: pnpm matrix)
bash tools/matrix/run-matrix-gate.sh --update    # re-take the baselines and the manifest
MATRIX_DESIGNS="a1/1 a17" bash tools/matrix/run-matrix-gate.sh   # only these designs (ids or whole categories)
bash tools/matrix/run-matrix-gate.sh --host      # a look on this machine; never writes — the manifest test and the
                                                 # font-dependent cases are EXPECTED to fail here, it is for renders and errors
node tools/matrix/cases.test.mjs                 # the case derivation, no browser (part of pnpm test)
```

It needs `docker` and a `pnpm install`. The first run builds the image (a few minutes); later runs reuse it. Exit 0
means every case rendered, every photograph matched, axe found nothing, and the runner matched the manifest. It
prints its totals — cases, designs, packs, violations — and stores none of them. A failing case writes a diff image
under `tools/matrix/test-results/` (gitignored; in CI, the `render-matrix-diffs` artifact).

## What a case is

Every design × every pack × light and dark × every viewport × the design's own fixture rows. Nothing in that sentence
is a number written down: `tools/matrix/cases.mjs` derives each axis.

| Axis | Where it comes from |
|---|---|
| Designs | the directory `packages/library/designs/{category}/{n}/`, read through `apps/web/lib/pilots.ts` — the editor's own door |
| Packs | every `*-tokens.css` beside the runtime. Only the reference set exists until Epic 6 authors the packs (DW-169) |
| Viewports | 1440 · 834 · 390 · 1440 at 200% zoom (720 CSS pixels at twice the density, photographed at CSS scale) · 1440 with reduced motion forced |
| Fixture rows | what the design is: it paginates → first, middle, last and empty feed pages; its markup gates by member → one row per visitor, and one per Show-to audience seen by a visitor it hides from; its binding context is `post` → the style-guide post (and page) |

Each case is rendered exactly as the editor draws it: `renderCanvas`, given the input that `renderSection()` in `apps/web/lib/canvas.ts` builds for `/pilots` and the editor (the rows through its `shownRows()`), written
into the canvas document `/canvas` serves (`pilotsCanvasDocument()`), with `data-mode` set, `js-enabled` on every
module mount, and the window as tall as the section, as the editor's iframe is. A local `node:http` server serves the
document and Orbit Weekly's pictures at their real origin; nothing else is on the network. Baselines live in
`packages/library/baselines/{category}/{n}/`, one PNG per case.

## What fails

- **A photograph above 1% differing pixels, at a per-pixel tolerance of 0.1.** Both numbers live in
  `tools/matrix/playwright.config.mjs` and nowhere else. The message names design, pack, mode, viewport and row.
  **What 1% does not catch** (R-117, executed 2026-09-17): A22 #1's button moved 3px sideways, nothing else, changed
  0.36–0.71% of its photographs and passed. A photograph that changes **size** fails whatever its ratio, so a change
  that makes a section taller or shorter always fails: A4 #13's buttons moved 3px down failed at 1440.
- **A case with no baseline.** It is never written by a passing run; `--update` is the only writer.
- **A baseline with no case** (its design was removed). `--update` deletes it.
- **Any axe-core violation at WCAG 2.1 AA** inside `#canvas`, named by rule and selector. Each case first injects an
  `<img>` with no alt; if axe does not report it, the case aborts — a scan that cannot see a planted fault is not a
  result. When a design first draws a post body (`{{content}}`), the scan must stop at its edge: Ghost writes that
  markup, not the theme.
- **A runner that is not the one the baselines were taken under** — see the manifest below.

## The runner is part of the baseline

The gate runs inside one image, `tools/matrix/Dockerfile`: the Playwright image pinned by tag **and** digest, plus the
fonts the token set names. The stock image draws Georgia and Inter in a Chinese fallback face, so the fonts are a gate:
Inter from apt at a pinned version, and Gelasio — Georgia's metric-compatible face — from google/fonts at one commit,
checked by checksum. The build fails if `fc-match` does not resolve them. A baseline is written only inside this image,
never on a laptop's own browser and never in CI.

`tools/matrix/manifest.json` records what the baselines were taken under, read from the running system at `--update`:

| Field | Meaning |
|---|---|
| `image` | the base image, tag and digest, from the Dockerfile |
| `playwright` · `chromium` | the test runner and the browser build that drew the photographs |
| `fonts` | the face Chromium actually used for `--font-heading` and `--font-body` |
| `widelyAvailableOnDate` | the root `package.json`'s browser floor (FR-G8) |

The gate compares each field with what it can observe — Playwright and Chromium from the running process, the faces
over Chromium's own devtools protocol, the pin from the root `package.json`; `image` is the Dockerfile's `FROM` line, so
a Dockerfile change is what moves it — and fails on any difference. `--update` re-takes **every** photograph
(`--update-snapshots=all`), so drift under 1% is re-recorded too and cannot accumulate across approvals. **Moving the browser floor fails
the gate until the matrix is re-run and the manifest re-recorded** (DW-138): a later date lets designs use newer
styling, so the photographs taken under the old date no longer vouch for it. The gate also refuses to start when the
installed `@playwright/test` is not the version the image was built for.

## Moving the runner

Bumping Playwright moves five things together, and the gate refuses until they agree: the Dockerfile's `FROM` tag **and**
digest, `@playwright/test` in the root `package.json`, the lockfile, `manifest.json` and the baselines. The order: change
the Dockerfile and `package.json`, `pnpm install`, run `--update` inside the new image, then hold the re-baseline to the
rule below — and end by grepping the repository for the old version, because the list of places to update is exactly
the thing that misses one. Two failures that look like drift and are not: apt in the image superseding a pinned font
package (`fonts-inter=…`, `fonts-dejavu-core=…` — the build fails on the install line; move the pin and re-baseline), and
a `--host` run, whose Chromium and fonts are this machine's and therefore never the manifest's.

## Cadence

`.github/workflows/matrix.yml`, its own workflow:

- **nightly**, every design;
- **on demand** (`workflow_dispatch`), every design, or only the designs typed into its `designs` input — run it before
  each release;
- **on every push**, only the designs that push touched: a design's directory or baselines, a whole category when its
  `content.json` changed, and **every design** when a shared input changed — `packages/section-runtime/` (the reference
  tokens included), `packages/ghost-shim/`, the library's code and data, the canvas document's readers, `tools/matrix/`,
  or the pins in `package.json` and the lockfile.

**A red matrix does not block publishing the app** (R-116, owner 2026-09-17). `ci.yml`'s `deploy` needs `check` and
`rls` and nothing else. The usual cause of a red matrix is a deliberate change whose remedy is a re-baseline, and every
category owner gate from Epic 9 on still requires it green.

## The rebaseline rule

A new design's first baselines are taken with `--update` by the story that adds it — until then its cases fail.

A **mass rebaseline** — a shared change that moves many designs: the runtime, the reference tokens, a shared primitive,
a pack, the runner, the browser floor — follows NFR-6(a), and so does a provisional pilot re-authored by its category's
story (AD-35):

1. It is **its own commit**, touching `packages/library/baselines/` and `tools/matrix/manifest.json` **only**.
2. Its message **names the change that caused it** (the commit or story), under that story's name and phase (R-81).
3. It lands **only on the owner's approval of a sampled visual review**.

### How the owner's sampled review is done

1. Run `bash tools/matrix/run-matrix-gate.sh --update` inside the image, on the commit that caused the change. Nothing is
   committed yet.
2. From the changed photographs (`git status packages/library/baselines`), take **one design per category**, and for
   each **both modes** — its light and dark photograph at 1440.
3. For each, show the owner the photograph before (`git show HEAD:<path> > before.png`) and after, side by side, with
   the change that caused it in one plain sentence, and the design's frame in the design export where the look is in
   question (R-74).
4. The owner approves or rejects. Approved: commit the baselines and the manifest alone (rule above). Rejected: the
   cause is a defect — fix it where it lives, and the matrix goes green again with no rebaseline.

## Proving it against the editor (R-82)

The matrix claims to draw what the editor draws. The claim is checked against the deployed page: run
`tools/probe/run-verify-pilots.cjs` (its header carries the command) on a commit CI has deployed, and compare its axe
results with the matrix's for the same designs. Both must report zero violations, behind the same positive control.
