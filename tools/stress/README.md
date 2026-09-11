# tools/stress — the AD-11 fixture

Closes **Round 1 decision 10**, open since round 1 and blocking `MEASUREMENTS.md` §13c.

    pnpm install           # at the repo root, once — compile.js resolves @inflozo/section-runtime through the workspace
    npm install            # here
    node build.js          # compile 70 sections over 7 templates, assemble, gate, zip — Node 24 (type stripping)
    node gate.js theme     # the AD-34 two-checker verdict (gscan 4.49.7 + 6.4.2)

`sections.js` holds eight annotated-HTML archetypes sized from `sections-inventory.md`
— mean **39.1 elements and 21.0 directives** per section against the spike's toy hero
(**5 elements, 3 directives**), which is the ~7.4x Round 1 measured and could not
re-measure because no fixture was checked in.

`compile.js` is a **thin CommonJS adapter** over `@inflozo/section-runtime`, which is where
the pipeline now lives (Story 4.2). It runs **as decided**, not as the spike ships it: AD-5
numeric entities, AD-4's splice-after-serialization, R2-5's substitute-last-over-the-file-tree,
R2-7's unforgeable token, and R1 decision 7's nested repeats.

The two proofs that used to sit here moved with it — `packages/section-runtime/src/agreement.test.ts`
and `src/ad36.test.ts` — because this directory's `node_modules` is gitignored and CI never installs
it, so a proof left here ran on a laptop and nowhere else. `pnpm check` runs both.

The emitted theme scores **0 errors / 0 warnings on both gscan majors**, carries five
hostile user strings (including `C:\{{@site.title}}`, the one the backslash form ships
live), and its 197-file tree is byte-identical across four environments.

Numbers, capture date and reproduction commands: `MEASUREMENTS.md` §14.
