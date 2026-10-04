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

Every design × every pack × light and dark × every viewport × the design's own fixture rows — one specimen per font
pairing — and each design that can sit on the contrast ground, photographed there. Nothing in that sentence is a number
written down: `tools/matrix/cases.mjs` derives each axis.

| Axis | Where it comes from |
|---|---|
| Designs | the directory `packages/library/designs/{category}/{n}/`, read through `apps/web/lib/pilots.ts` — the editor's own door |
| Packs | the owner's reference packs, `REFERENCE_PACKS` in `packages/library/packs/` — Paper, Mono and Neon (R-234, owner 2026-10-03; DW-169). Mono sits off Paper's step on buttons and on gutters, so a design's Outline button and its gutter are photographed (DW-317); `cases.test.mjs` holds the axis to the list and that pack to its steps. Each case's document is `/canvas?pack=`'s: the pack's token block and its pairing's faces |
| Viewports | 1440 · 834 · 390 · 1440 at 200% zoom (720 CSS pixels at twice the density, photographed at CSS scale) · 1440 with reduced motion forced |
| Specimens | one per pairing of the font pool (`packages/library/fonts/pool.json`, Appendix D §D.c) — R-233, owner 2026-10-03, DW-313: in Paper's palette with that pairing's faces, light, at 1440. Since Story 6.4 (DW-324) every role is drawn at **both ends of the weights the pool declares for it** — the heading at its range's two ends (or each static weight), the body's roman and its italic at theirs — so the heaviest heading a pairing ships (Broadsheet's 900, Fieldnote's 800) is photographed. The lines: the id line; the heading at its lightest and at its heaviest; **a latin-ext line in the heading face**; a paragraph at the body's lightest roman with a bold run at its heaviest, an italic run at the italic's lightest and **a bold italic run** at its heaviest; tabular figures; and latin-ext letters in the body face. The markup is the matrix's own (`specimenMarkup` in `cases.mjs`), so every pairing is photographed whether or not a preset wears it — and since 6.4 any of them can be picked in the Style Pack editor. Baselines in `packages/library/baselines/specimens/<pairing>/`; `MATRIX_DESIGNS=specimens` narrows to them |
| The contrast ground | Story 6.4 (DW-324, DW-317): a design whose Background offers `contrast` **and** whose stylesheet draws a `--button-fill` button is photographed on that ground too — its first fixture row with `bg` set to `contrast` — under each reference pack whose Button style is Outline (Mono today), light and dark, at 1440, where an Outline button's border and label must hold on the band. Read off the design and the packs (`onContrast`, `outlinePacks` in `cases.mjs`), never listed; the baseline is the row's name with `-bg-contrast` |
| Fixture rows | what the design is: it paginates → first, middle, last and empty feed pages; its markup gates by member → one row per visitor; its category carries Member visibility → one row per Show-to audience seen by a visitor it hides from, read through `carriesMemberVisibility` (R-113's register, `packages/library/control-groups.json`), the rule the editor and `/pilots` draw Show to by (DW-171); its binding context is `post` → the style-guide post (and page) |

Each case is rendered exactly as the editor draws it: `renderCanvas`, given the input that `renderSection()` in `apps/web/lib/canvas.ts` builds for `/pilots` and the editor (the rows through its `shownRows()`), written
into the canvas document `/canvas` serves (`pilotsCanvasDocument()`, in the case's pack — `?pack=`), with `data-mode` set,
`js-enabled` on every module mount, and the window as tall as the section, as the editor's iframe is. A local
`node:http` server serves the document, the font pool's woff2 files at `canvas?font=` exactly as the app's route serves
them (Story 6.2 — every face a case draws is the theme's own file, never a font host), and Orbit Weekly's pictures at
their real origin; nothing else is on the network. Baselines live in
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
- **A specimen line not drawn in the pool's own face** *(Story 6.4, DW-324)*. Each line of a specimen names its role's
  family (`data-family`), and the runner asks Chromium which faces it drew that line's words with
  (`CSS.getPlatformFontsForNode`): every one must be the pool's own file (`isCustomFont`, an `@font-face` the document
  declares) of that family. The family alone cannot tell — the image installs a system Inter — and executed at 6.4's
  Create, the pool's Fraunces reports `isCustomFont: true` and a fallback `false`. Its positive control comes first: a
  line set in a family the document never declares must be caught, or the case aborts. The totals line says how many
  lines were held.
- **A case that scrolls sideways** *(Story 6.1, FR-F2 · FR-G4: a section spans the site width and stays responsive
  within it)*. After the photograph, every drawn case measures the document's `scrollWidth − clientWidth` and fails
  above zero, naming the overflow in pixels — checked at every viewport of every design. Its positive control comes
  first: a probe wider than the viewport is appended and must be measured as overflow, then removed; if it is not,
  the case aborts. The totals line says how many drawn cases measured it and how many scrolled.
- **A runner that is not the one the baselines were taken under** — see the manifest below.

## The runner is part of the baseline

The gate runs inside one image, `tools/matrix/Dockerfile`: the Playwright image pinned by tag **and** digest, plus
fallback fonts. **Since Story 6.2 every face a case draws is the pool's own woff2**, declared in the case's document and
served beside it, so the image's fonts are fallbacks only — they draw a glyph a subset lacks and keep `serif` and
`sans-serif` off the stock image's Chinese face: Inter from apt at a pinned version and Gelasio (Georgia's
metric-compatible face, from before the pool) from google/fonts at one commit, checked by checksum. The build still
fails if `fc-match` does not resolve them. A baseline is written only inside this image,
never on a laptop's own browser and never in CI.

`tools/matrix/manifest.json` records what the baselines were taken under, read from the running system at `--update`:

| Field | Meaning |
|---|---|
| `image` | the base image, tag and digest, from the Dockerfile |
| `playwright` · `chromium` | the test runner and the browser build that drew the photographs |
| `fonts` | the face Chromium actually used for `--font-heading` and `--font-body` in Paper's document — since Story 6.2 the pool's Fraunces and Inter, loaded from `canvas?font=` |
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
  tokens included), `packages/ghost-shim/`, the library's code and data, its control register
  (`packages/library/control-groups.json`, which decides the Show-to rows), the canvas document's readers, `tools/matrix/`,
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
