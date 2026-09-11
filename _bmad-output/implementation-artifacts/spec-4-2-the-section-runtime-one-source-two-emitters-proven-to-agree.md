---
title: 'Story 4.2 — The section runtime: one source, two emitters, proven to agree'
type: 'feature'
created: '2026-09-11'
status: 'in-review'
baseline_commit: 'fa35a3715feab0402447f80efe8a8748ae7fdd01'
owner_test: none
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing a customer can see changes in this story. It builds the engine that draws a section twice —
once on the editing canvas, and once as the file that ships to the customer's Ghost site — from one
piece of code, so "what you see is what ships" becomes something a test proves on every commit
rather than something we claim. Today that engine exists only as a throwaway experiment in a corner
of the repository that the build never runs; this story makes it the real one.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `packages/section-runtime/src/index.ts` is one line. The working two-emitter pipeline
lives in `tools/stress/compile.js` — a CommonJS experiment outside the pnpm workspace, unlinted,
untypechecked, and **not run by `pnpm test`, so not run by CI**. The epic's central claim ("the
canvas and the shipped theme agree by construction") is therefore asserted on a developer's laptop
and nowhere else. Three things in it are also wrong against the documents: AD-4's mark serializer
does not exist at all (user text is handled as a plain string), FR-H8's guard fires only when a
design asks for it instead of always, and AD-36's fourth sink — a Ghost-supplied colour crossing
into CSS — is unclosed because `data-bind-style` is not rendered.

**Approach:** Move the pipeline into `packages/section-runtime` as TypeScript under AD-1's ban list,
with the DOM **injected** rather than imported, so one implementation feeds both emitters and
`pnpm check` runs its proofs. Add what the documents require and the experiment lacks: `marks.ts`,
an always-present FR-H8 guard, `data-bind-style` with AD-36's colour parser, and the reference token
set the canvas cannot render without. Every directive in 4.1's closed set that this story does not
emit **refuses by name** instead of leaking, and the partition of rendered-versus-refused is derived
from the vocabulary so a later story cannot silently forget one.

## Boundaries & Constraints

**Always:**
- AD-1 — nothing under `packages/section-runtime` imports Next.js, Supabase, a Node builtin, or
  reaches a DOM global. The document is a **parameter**. `pnpm lint` already enforces this
  (`eslint.config.js` bans the `document` and `window` globals in core packages).
- One core, two entry points. A difference between the emitters exists in exactly two places —
  a repeat expands rows here and becomes `{{#foreach}}` there; a binding resolves to a value here
  and becomes a mustache there — and both are asserted **positively** so nobody can "fix" them.
- AD-4's half that reads backwards: the canvas puts the serializer's output **into a DOM**; the
  theme **splices it into the string** after `outerHTML` has run. AD-5's numeric entities do not
  survive a DOM round trip.
- AD-36 — parse and rebuild from validated parts; never interpolate. All four sink rules live in
  `packages/library` beside `safeUrl`, so both emitters and (in 4.3) the shim inherit one copy.
- Counts and memberships are derived, never written down (standing rule 4).

**Ask First:**
- Adding any runtime dependency to `packages/section-runtime` beyond `jsdom` as a **devDependency**.
- Editing `packages/library/fixtures/reference-design/` — it is Story 4.1's authored control.

**Never:**
- Do not implement the directives other stories own. `data-t` / `data-t-attr` are 4.9's,
  `data-bind-srcset` / `data-helper` / `data-pagination` are 4.3's shim, `data-needs` is the
  compiler's placement list (AD-37), `data-items` / `data-if` / `data-else` / `data-members` /
  `data-when` / `data-index` / `data-target` are later. They **refuse**, with the sentence saying
  the runtime does not emit them yet.
- No render-time design substitution (AD-37). The runtime takes one source and has no path that
  selects among designs, and no path that answers a question about the page it sits on.
- No second copy of an AD-36 rule, of the directive set, or of the binding grammar.
- Do not edit `tools/stress/sections.js` or `build.js`'s 70-section fixture; do not change the
  gscan harness's results.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Static section, both emitters | `<section data-align="center"><h1 data-prop="title">t</h1></section>`, `{title:'A headline'}` | Element tree, classes and attribute **names** identical on both. Control attributes survive verbatim (AD-3). | N/A |
| The two intended differences | a `data-repeat="posts"` body, one row of Ghost data | Canvas: one expanded `<article>` with `Post one` in it, no `{{#foreach}}`. Theme: `{{#foreach posts limit="3"}}` and `{{title}}`. | N/A |
| Text binding, no `data-empty` | `data-bind="title"`, authored text `Post title` | FR-H8's guard is **always** present: theme emits `{{#if title}}{{title}}{{else}}Post title{{/if}}`. Canvas with no value keeps `Post title`. | N/A |
| Media binding, no `data-empty` | `data-bind-attr="src:feature_image\|img_url:800"` | Defaults to `hide` because `src` is a URL attribute: theme wraps the **element** in `{{#if feature_image}}`; canvas removes the element. Never guards the attribute. | N/A |
| Guard derived from a helper argument | `data-bind="published_at\|date:MMM DD, YYYY"` + `data-empty="hide"` | Guard is `{{#if published_at}}` — the bound **field**, never the format string. | N/A |
| `data-empty="hide"` on `data-prop-attr` (DW-93) | `<img data-prop-attr="src:hero" data-empty="hide">`, `hero` unset | Element removed on both emitters; `data-empty` never survives. | N/A |
| User text with braces and marks | `{text:'Notes on {{title}}', marks:[{start:0,end:5,mark:'strong'}]}` | Canvas shows the user `<strong>Notes</strong> on {{title}}`. Theme ships `&#123;&#123;title&#125;&#125;` and zero live mustaches from user text. | N/A |
| Mark not on the prop's allow-list | `marks:[{mark:'u'}]` where `PropDef.marks` is `['strong','em']` | The mark is dropped; the text survives intact. | N/A |
| Inline token, allowed and not | prop declares `tokens:['members']`; text is `{members} readers, {n} left` | `{members}` substitutes; `{n}` stays **literal text** (R-27). | N/A |
| `javascript:` in a user or Ghost URL | `data-prop-attr="href:link"`, `link='javascript:alert(1)'` | Both emitters emit `href="#"`. Evasions closed: `data:`, `vbscript:`, mixed case, leading control character or whitespace. | rejects to `#`, never repairs |
| Helper argument breakout | `src:img\|img_url:800"}}<script>` | Refused at bind time with the helper's own grammar named. | throws |
| Non-bindable attribute | `data-bind-attr="onload:x"` | Refused by allow-list; `style` and every `on*` are absent from it. | throws |
| Bound colour, legitimate and hostile (AD-36 #4) | `data-bind-style="--tag-accent:accent_color"` with `#f0f`, then `red;}body{display:none` | Canvas: `#f0f` set; the hostile value falls back to the pack token. Theme: emits the mustache, and the value is Ghost's at runtime — see Design Notes. | falls back to the token |
| A directive this story does not emit | `<div data-if="featured">` | Refused by name, saying the runtime does not emit it yet. **Never** left in the output. | throws |
| A design reads a token the contract lacks | `style.css` containing `var(--nope)` | The reference-token check fails and names the property. | test fails |

</frozen-after-approval>

## Code Map

- `tools/stress/compile.js` — **the source to lift, and the control.** `Tokens` `:16`, `UserText`
  `:36` (with the single-pass `substitute` and the C0-stripping `esc`), `assertBindableAttr` `:109`,
  `bindExpr` `:118`, `emitBindings` `:137`, `wrapGuard` `:175` (and the comment above it naming the
  silent-loss defect), `applyProps` `:189`, `depth` `:222` with the deepest-first repeat sorts at
  `:234` and `:317`, `renderSection` `:226`, `formatDate` `:282` (UTC getters only — AD-1 bans
  `Intl` and `toLocale*`), `bindValue` `:300`, `renderCanvas` `:312`, `applyCanvasBindings` `:338`.
  Already consumes the library's rules across the package boundary (`:70`), which is the precedent
  for the adapter below.
- `tools/stress/test-renderer-agreement.js` — **the proof to move**. `skeleton()` `:43`
  (tag + class + sorted attribute **names**, values excluded on purpose) and `htmlSafe()` `:34` are
  the comparison and must survive re-derivation verbatim in behaviour.
- `tools/stress/test-ad36.js` — the other proof to move, each check asserting the vector is inert
  **and** the legitimate case still works. **Its printed count and the agreement proof's are
  stale** — executed at this baseline they are 14 and 10, while `build-sequence.md` `:233-234` (and
  `:57`) and the `INDEX.md` rows generated from `tools/doc-audit.py` `:225,:227` still say 13 and 8
  (Story 4.1 added checks to both and the prose did not follow). `HANDOVER.md` `:320` carries only
  the command. Word them so they cannot go stale again rather than restating the new numbers.
- `tools/stress/build.js` — the 70-section gscan harness; `require`s `compile.js`. Must keep working.
- `packages/library/src/vocabulary.ts` — the rulebook 4.1 shipped. `safeUrl` `:50`, `PATH_RE` `:16`,
  `HELPERS` `:24`, `BINDABLE_ATTRS` `:36`, `URL_ATTRS` `:43`, `parseBindSpec` `:134`, `guardField`
  `:155`, `parseTokenTemplate` `:170`, `MARKS` `:105`, `INLINE_TOKENS` `:91`, `DIRECTIVES` `:235`,
  `CONSUMED_DIRECTIVES` `:414`, `CONSUMED_DIRECTIVE_RE` `:420`. `safeCssColor` is the one that is
  missing.
- `packages/library/src/registry.ts` `:27-34` — `PropDef.marks` and `PropDef.tokens` are already
  declared and nothing reads them yet. `marks.ts` is their first reader.
- `packages/library/fixtures/reference-design/style.css` — the authored example, and the list of
  custom properties a real design reads: `--bg-surface`, `--bg-contrast`, `--text-body`,
  `--text-on-contrast`, `--space-section{,-compact,-spacious}`, `--border-hairline`, `--border-fade`,
  `--space-gap`, `--shadow-card`, `--radius-card`, `--tag-accent`.
- `packages/section-runtime/{package.json,src/index.ts,src/index.test.ts}` — the stub, and the
  manifest shape (`exports`, `typecheck`, `test`) to extend.
- `eslint.config.js` `:88-141` — AD-1 as rules. `document`, `window`, `globalThis` are banned
  globals in core packages; the test-file block keeps every ban and returns only `node:test` and
  `assert`. `jsdom` is not a builtin, so a **test** may import it.
- `package.json` `:12` — `pnpm test` is `pnpm -r test && node tools/stress/test-vocabulary.mjs`;
  `.github/workflows/ci.yml` runs `pnpm check`, so anything inside a package's `test` script runs
  in CI and anything in `tools/stress/` does not (its `node_modules` is gitignored and never
  installed there).
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` — FR-E1 `:251` (the pack
  token set), FR-H8 `:338` (the guard rule, verbatim form), FR-H4 `:330` (item 3: a bound prop that
  is not a feed follows FR-H8 unchanged).
- `.../architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` — AD-1 `:92`, AD-3 `:105`, AD-4 `:111`,
  AD-5 `:119`, AD-36 `:376`, AD-37 `:390`. **Read-only evidence**; AD-36's fourth bullet names
  `ghost-shim` as the colour parser's home and needs the amendment named in Tasks.
- `_bmad-output/implementation-artifacts/deferred-work.md` — **DW-93** is owned by this story.

## Tasks & Acceptance

**Execution:**
- [x] `packages/library/src/vocabulary.ts` -- add `safeCssColor(value, fallbackToken)`: parse to
      `#rgb`/`#rrggbb`/`#rrggbbaa`, `rgb()`/`rgba()`, `hsl()`/`hsla()`, else return the fallback
      token -- AD-36 #4's rule belongs beside its three siblings, in the one place both emitters and
      4.3's shim read (Story 4.1's review found duplicated copies had already drifted).
- [x] `packages/section-runtime/src/marks.ts` -- AD-4's single serializer over `strong|em|u|a`, with
      `newTab`/`rel` on the `a` mark, the per-prop `PropDef.marks` allow-list, R-27's `tokens`
      allow-list, and FR-Q3's plain-text lock truncating `marks` to `[]` -- it does not exist and
      AD-4 names this exact file.
- [x] `packages/section-runtime/src/core.ts` -- the shared walk lifted from `compile.js`: the token
      and user-text machinery, directive consumption, `bindExpr`/`bindValue`, FR-H8's always-present
      guard with its default-by-kind, `data-bind-style` through `safeCssColor`, and the refusal for
      every directive this story does not emit -- one implementation is the whole claim.
- [x] `packages/section-runtime/src/index.ts` -- export `renderCanvas(doc, src, input)` and
      `renderTheme(doc, src, input)` plus `RENDERED_DIRECTIVES` -- the injected `doc` is AD-1's "a
      DOM global it did not receive as an argument", made structural.
- [x] `packages/section-runtime/reference-tokens.css` -- the full custom-property contract at one set
      of values, covering every FR-E1 row and every property `reference-design/style.css` reads,
      light and dark -- without it a design's CSS resolves to nothing and the canvas renders blank.
- [x] `packages/section-runtime/src/agreement.test.ts` -- move `tools/stress/test-renderer-agreement.js`
      here, jsdom supplied by the test, keeping every existing check (the file prints its own count;
      do not restate it anywhere) and adding one for marks, one
      for the always-on guard and one for `data-bind-style` -- in-package is the only way `pnpm check`
      and therefore CI ever runs the epic's central claim.
- [x] `packages/section-runtime/src/ad36.test.ts` -- move `tools/stress/test-ad36.js` here, adding
      the colour vector (inert **and** legitimate) -- AD-36's own rule is that the test is part of
      the invariant.
- [x] `packages/section-runtime/src/tokens.test.ts` -- assert every `var(--…)` in
      `reference-design/style.css` names a property the contract declares -- an unset custom property
      fails silently, so the contract is decorative without this.
- [x] `packages/section-runtime/package.json` -- add `jsdom` as a **devDependency** -- the tests need
      a document to inject; the runtime itself takes one.
- [x] `tools/stress/compile.js` -- replace the body with a thin CommonJS adapter over
      `@inflozo/section-runtime`, keeping its exported names, and delete the two moved test files --
      `build.js`'s 70-section gscan harness must keep running against **one** implementation.
- [x] `tools/doc-audit.py` -- repoint the two catalogue rows for the moved proofs and the row for
      `compile.js` -- a file under `tools/` that moves without its row turns the gate red.
- [x] `CLAUDE.md` · `HANDOVER.md` · `build-sequence.md` · `epics.md` -- update every reference to the
      two moved proofs to their new paths, say the proofs now run in CI, and **replace their stale
      check counts with wording that cannot go stale** ("every check the file prints") -- standing
      rule 7: end a move by grepping for the old name; standing rule 4: counts are derived.
- [x] `.../ARCHITECTURE-SPINE.md` -- amend AD-36's fourth bullet in the `*(Story 4.2, 2026-09-11)*`
      style AD-2 already uses: the colour parser lives in `packages/library` and `ghost-shim` calls
      it, for the same reason AD-36 #1 already moved out of the shim -- propagate, never localise.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close DW-93 with
      `status: done 2026-09-11 (Story 4.2)` and a `resolution:` line -- it names this story as owner.

**Acceptance Criteria:**
- Given the two emitters and one annotated source, when both render, then `skeleton()` over each is
  deep-equal — element tree, class lists and sorted attribute **names** — and the two intended
  differences (`{{#foreach}}` vs expanded rows, mustache vs value) are each asserted **positively**
  in their own check.
- Given `pnpm check` on a clean clone, when it runs, then the agreement, AD-36 and token proofs all
  execute — no proof of this epic's central claim lives outside CI.
- Given any source, when either emitter finishes, then `CONSUMED_DIRECTIVE_RE` matches nothing in the
  output, and `RENDERED_DIRECTIVES ∪ refused` equals `CONSUMED_DIRECTIVES` exactly — asserted by a
  test, so a directive added to the vocabulary later cannot be silently forgotten by the runtime.
- Given `pnpm lint`, when it runs over `packages/section-runtime`, then it passes with no
  suppression comment — AD-1's ban list is the gate, not a review note.
- Given `cd tools/stress && node build.js`, when the 70-section fixture compiles, then the gscan
  result is unchanged from the committed measurement — the adapter is a move, not a rewrite.
- Given this story has **no screen**, then it carries no frame and no owner test (`owner_test: none`);
  the first surface built on this runtime is Epic 5's canvas.

### Review Findings

*Code review, 2026-09-11 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance
Auditor, Real-infra verifier), all completed. Every "no test observes X" below is backed by the
Verification Gap layer's mutation run: 19 single-line mutations of `core.ts`/`marks.ts`, of which only
2 made any test fail. Severity is the reviewer's, by consequence for the canvas user and the live site.*

- [x] [Review][Patch] **high** — the theme interpolates `data-repeat`, `data-repeat-limit` and `data-partial` into Handlebars source unvalidated (AD-36 #2, the spec's own *Always*): `data-repeat='posts}}<script>'` ships a live script; the library's `DIRECTIVES[d].parse` already holds each grammar and the runtime does not call it [packages/section-runtime/src/core.ts:520]
- [x] [Review][Patch] **medium** — `data-partial` / `data-repeat-limit` on an element with no `data-repeat` survive into BOTH outputs (AC 3 "matches nothing in the output" fails); refuse them [packages/section-runtime/src/core.ts:505]
- [x] [Review][Patch] **high** — a nested `data-repeat` on the canvas resolves its source against the ROOT ghost context, not the outer row (`{{#foreach tags}}` inside `{{#foreach posts}}` reads `post.tags` on the site); executed: the canvas showed the top-level `tags` row. `@site.*` inside a row resolves against the row and falls back, where Handlebars reads the root [packages/section-runtime/src/core.ts:531]
- [x] [Review][Patch] **medium** — a `hide` guard on the repeat root itself lands OUTSIDE `{{#foreach}}` on the theme (guard evaluated in the outer context) and on the canvas a clone that removed itself is re-inserted by `el.before(clone)`; a `data-prop … data-empty="hide"` on the root makes `replaceWith` a no-op and the block vanishes [packages/section-runtime/src/core.ts:302,528]
- [x] [Review][Patch] **medium** — `formatDate` maps `MMMM` to the SHORT month and has no `D`/`YY`, while the vocabulary's own example is `D MMM YYYY`: the canvas prints the literal `D` and `Jan` where the site prints `14` and `January` [packages/section-runtime/src/core.ts:398]
- [x] [Review][Patch] **low** — the `data-bind-style` refusal reads the attribute after removing it, so the sentence always ends `got null` [packages/section-runtime/src/core.ts:373]
- [x] [Review][Patch] **medium** — `data-bind-style` is the one bound prop with no FR-H8 guard, and the emitters disagree when the value is absent (theme: an invalid empty declaration, so the root default; canvas: `var(--accent)`) [packages/section-runtime/src/core.ts:372]
- [x] [Review][Patch] **medium** — a URL attribute in a NON-first `data-bind-attr` entry (`alt:title;src:feature_image`) gets the attribute guarded, not the element, contrary to FR-H8 [packages/section-runtime/src/core.ts:324]
- [x] [Review][Patch] **medium** — two directives on one element share one `data-empty` and the first loop removes it, so the second silently gets the kind default [packages/section-runtime/src/core.ts:296]
- [x] [Review][Patch] **low** — `data-empty="HIDE"` is silently ignored and a `data-prop-attr` entry with no path is treated as unset, where `data-bind-attr` throws — the runtime does not refuse the way it refuses bad bind specs [packages/section-runtime/src/core.ts:264,465]
- [x] [Review][Patch] **medium** — emptiness: Handlebars' `{{#if}}` takes the else branch for `''`, `0`, `false` and `[]` (`handlebars/lib/handlebars/helpers/if.js:16`, `utils.js:93`, read in 4.7.9), the canvas only for `null`/`undefined` — a cleared field shows `''` on the canvas and the fallback on the site [packages/section-runtime/src/core.ts:420,440]
- [x] [Review][Patch] **low** — a `data-bind` element with child markup and no value keeps the children on the canvas and flattens them in the theme's `{{else}}` [packages/section-runtime/src/core.ts:315]
- [x] [Review][Patch] **low** — a `RichText` value reaching `data-prop-attr` renders `[object Object]` on the canvas and serialised marks inside an attribute on the theme [packages/section-runtime/src/core.ts:467]
- [x] [Review][Patch] **low** — robustness: a repeat source that is a string expands one row per character and an object throws; two repeats with one `data-partial` name silently overwrite; `get()` reads inherited properties (`constructor`); a numeric epoch date is Invalid Date; a non-array `marks`/`rel` throws out of the whole render [packages/section-runtime/src/core.ts:531,523,198,399; packages/section-runtime/src/marks.ts:69,116]
- [x] [Review][Patch] **low** — `safeCssColor` accepts separator-valid but CSS-invalid forms (`rgb(1/2/3)`, `rgb(1 2 3 4)`), so the declaration is dropped by the browser instead of falling back to the token [packages/library/src/vocabulary.ts:78]
- [x] [Review][Patch] **low** — a second copy of the binding grammar (`bindValue` re-splits the spec after `bindExpr` parsed it) and a third copy of the custom-property regex (*Never*: no second copy of the binding grammar) [packages/section-runtime/src/core.ts:420,378]
- [x] [Review][Patch] **medium** — the suite is blind to: a leak of `data-prop`/`data-prop-attr`/`data-bind-style`/`data-module`/`data-partial` (the leak test renders only `feedSrc`); the attribute-form fallback guard; the `a` mark (`safeUrl` on `href`, `newTab`, `rel`), FR-Q3's lock and range validation; `data-partial` extraction; `data-prop` + `hide`; `data-repeat-limit` slicing; the date format; the `data-bind-style` refusal — 17 of 19 mutations passed green [packages/section-runtime/src/agreement.test.ts:149; packages/section-runtime/src/ad36.test.ts]
- [x] [Review][Patch] **low** — `tokens.test.ts` writes the block count down (`>= 3`) and the partition test's union assertion cannot fail because `REFUSED_DIRECTIVES` is defined as the complement [packages/section-runtime/src/tokens.test.ts:52; packages/section-runtime/src/agreement.test.ts:353]
- [x] [Review][Patch] **medium** — "each file prints its own check count" is written in six documents and is false: `node --test` prints one summary for the package, and the files that printed their own counts were deleted [CLAUDE.md:202; HANDOVER.md:325; build-sequence.md:57,233; INDEX.md via tools/doc-audit.py:238; ARCHITECTURE-SPINE.md:386]
- [x] [Review][Patch] **low** — prose that misdirects: two comments say `packages/ghost-shim` calls `safeCssColor` in the present tense (the shim is 4.3's and does not exist); `vocabulary.ts:4` cites the deleted `tools/stress/test-ad36.js`; the SPINE says Story 4.2 "moved all three" when `safeUrl` moved in 4.1; `RenderInput.content`'s comment says flat dotted keys while `get()` walks nested objects; the `[data-mode]` comment names the canvas where the PRD (FR-E4) names the visitor's override; `docs/section-authoring.md`'s table has no row for `data-bind-style`/`data-module`, does not state that a content prop into a URL attribute defaults to `fallback` while a binding defaults to `hide`, and does not say named colours fall back; `tools/stress/README.md` and CLAUDE.md do not say `build.js` now needs Node 24 and a root `pnpm install`; HANDOVER's "immediate task" still says Story 3.6 is in review; the stub's `name` export and its test survive [packages/section-runtime/src/core.ts:69,383; packages/library/src/vocabulary.ts:4,69; docs/section-authoring.md:230]
- [x] [Review][Patch] **low** — two decisions taken by omission have no owning document: `tools/doc-audit.py`'s `BASES` not walking `packages/` (the two proofs left the catalogue), and the shim's call to `safeCssColor` that AD-36 now promises for Story 4.3 [_bmad-output/implementation-artifacts/deferred-work.md]
- [x] [Review][Patch] **low** — R-82 on the page: the Real-infra verifier read T1 and T3 live (`GET /ghost/api/admin/config/` → 6.58.0 and 5.130.6, a zeroed secret → 401) to confirm the gscan majors `gate.js` pairs; the spec's Verification should cite that call rather than "no real infrastructure is touched" [this spec, ## Verification]
- [x] [Review][Defer] **low** — `tidy` runs on the canvas AFTER user content is in the DOM and on the theme BEFORE substitution, so a blank line inside a user's text under `white-space: pre` is stripped on the canvas only [packages/section-runtime/src/core.ts:548,568] — deferred, pre-existing in the harness; DW entry below

**Dismissed as noise (4):** `npm install` EACCES in `tools/stress` (sandbox, the tree was already installed); the lockfile absent from the review diff (the reviewer's own exclusion — it is committed with `jsdom@30.0.1`); the "non-numeric limit regression" (closed by the first patch, which refuses it); a duplicated attribute in one `data-bind-attr` list (a design error with no consequence past that design).

**Questions for the owner:** none — every finding is either a fact about Handlebars/Ghost cited in its source or a patch with one correct shape.

## Design Notes

**Why the proofs move, given the epic's AC names `tools/stress/test-renderer-agreement.js`.** The
AC's intent is that the agreement is asserted node by node by a runnable test. `tools/stress/` is a
separate npm project whose `node_modules` is gitignored and never installed in CI, so a proof left
there runs on a laptop and nowhere else — while this story rewrites the very code it points at.
Moving it into the package is the only way `pnpm check` runs it, and the move is a path change, not
a weakening: every existing check survives.

**AD-36 #4 has a half that no build-time gate can reach, and this story does not pretend otherwise.**
On the canvas the bound colour is a real value, so `safeCssColor` closes it completely. On the theme
side the runtime emits `style="--tag-accent: {{accent_color}}"` and the value arrives at render, on
the customer's site, after every gate has run — AD-36 says so in its own text. Nothing here invents a
fix; the code carries a comment naming the ceiling and pointing at AD-36's note.

**FR-H8's guard becomes unconditional.** The experiment guards only when a design writes
`data-empty`; FR-H8 says the unguarded state is unreachable and the behaviour defaults by kind. So:
a text binding defaults to `fallback` (the authored static value), a binding into a `URL_ATTRS`
attribute defaults to `hide`, and `data-empty` overrides. The guard field is always
`guardField(spec)` — never a helper argument, which is the defect that silently lost content.

The theme form, verbatim from FR-H8:

```hbs
{{#if @site.description}}{{@site.description}}{{else}}A publication about nothing{{/if}}
```

## Verification

**Recorded — the Dev run, 2026-09-11, Node 24.18.1.** The baseline was captured BEFORE the move, so
a check lost in the move would be visible rather than inferred (standing rule 2).

| Gate | Before (baseline) | After |
|---|---|---|
| the AD-36 proof | `tools/stress/test-ad36.js` — 14 checks | `packages/section-runtime/src/ad36.test.ts` — 16 tests, every baseline check carried over plus the AD-36 #4 colour vector, inert and legitimate |
| the agreement proof | `tools/stress/test-renderer-agreement.js` — 10 checks | `packages/section-runtime/src/agreement.test.ts` — 18 tests, every baseline check carried over plus marks, the always-on guard, `data-bind-style`, DW-93, the directive partition, per-directive refusal, and the nested-guard regression below |
| the token proof | — (new) | `src/tokens.test.ts` (4) in-package, plus 3 byte-level checks in `tools/stress/test-vocabulary.mjs`, which went 14 → 17 |
| `pnpm check` | exit 0 | exit 0 — lint, 5 typechecks, 365 package tests (`section-runtime` 2 → 41), and `test-vocabulary.mjs` |
| `node build.js` — FR-J17 proxy | 103/103 .hbs · 2380 elements · 201 links / 215 images / 86 headings · 943 CSS declarations | identical |
| `node build.js` — AD-34 leak assertions | clean | clean |
| `node build.js` — file count | 197 | 197 |
| `node gate.js theme` | Ghost 5 via gscan 4.49.7: 0/0 · Ghost 6 via gscan 6.4.2: 0/0 | identical |
| `python3 tools/doc-audit.py --check` | PASS | PASS |

**One defect was found by executing this story's own change, and it is not this story's.** FR-H8's
unconditional guard put a `{{#if}}` inside a NESTED repeat for the first time, and the emitted theme
came out carrying `<!--{{#if url}}-->`. `Tokens.resolve` unwrapped comment-parked markers ONCE, at
the top, but a substitution can re-introduce a comment-wrapped marker belonging to a token not yet
substituted. Reproduced against the pre-4.2 compiler at the baseline commit, where it is worse: the
nested `{{#foreach tags}}` itself shipped inside an HTML comment, so **every row it rendered was
invisible on the live site**. It never fired because nothing guarded inside a nested repeat until
now. The unwrap moved inside the substitution loop, with the executed evidence in the comment above
it and a regression test in `agreement.test.ts`.

**Three deviations from the task list, none of them weakening a check.**

1. **`src/tokens.test.ts` cannot read a file.** The task says it asserts every `var(--…)` in
   `reference-design/style.css` names a declared property — but AD-1 bans `node:fs` in a core
   package and the test-file exemption gives back only `node:test` and `node:assert`, which is the
   same constraint `tools/doc-audit.py`'s row for `test-vocabulary.mjs` already states. The contract
   is therefore DATA in `src/tokens.ts`; `reference-tokens.css` is emitted from it; `src/tokens.test.ts`
   asserts the contract in memory (every FR-E1 / Appendix D.0 row present, light and dark declaring
   the same property set, no undeclared `var()` inside a value); and `tools/stress/test-vocabulary.mjs`
   reads the BYTES of both files and fails on drift or on an undeclared property — the same split the
   reference markup already uses, and it runs in `pnpm test` and so in CI. A `var(--x, <fallback>)`
   is allowed to be undeclared, because a design-local property the design sets on the element itself
   (AD-3's carve-out, `--ref-accent`) is legitimately unset at the root and the fallback is what makes
   an unset custom property loud instead of silent.
2. **`jsdom` needs no `@types/jsdom`.** It ships no declarations, and pulling in the DOM lib to type
   four members would undo AD-1's point. `src/jsdom.d.ts` declares exactly the surface the tests use
   and types the document as the runtime's own `RuntimeDocument`, so a test cannot hand the runtime
   more DOM than the runtime declares it takes.

3. **The two proof rows could not be REPOINTED; they were removed and folded into one.** The task
   says repoint them, but `tools/doc-audit.py`'s `BASES` does not walk `packages/`, so a row whose
   path is `packages/section-runtime/src/agreement.test.ts` has nothing to check and the gate rejects
   it. The `tools/stress/compile.js` row now names both new paths in its own prose, so `INDEX.md`
   still tells a reader where the proofs live, and the gate stays green — but the two proofs are no
   longer separately indexed. Widening `BASES` to `packages/` is its own change (it would pull in
   every design's future `behaviour.js`) and is not made here.

**`data-text` refuses.** It is not in Boundaries' *Never* list and not in the Execution task list
either. The refusal is the reversible choice — a leak is not — and the partition test makes the
decision visible to the story that renders it.


**Commands:**
- `pnpm check` -- expected: lint, typecheck and every package test green, including the three new
  proof files in `packages/section-runtime`.
- `pnpm --filter @inflozo/section-runtime test` -- expected: every agreement check that passes at
  this baseline plus the new ones, every AD-36 check plus the colour vector, and the token check.
  **Capture the baseline first** -- `cd tools/stress && node test-ad36.js && node
  test-renderer-agreement.js` -- and require the moved suites to print at least those counts, so a
  check lost in the move is visible rather than inferred (standing rule 2: a result whose control
  did not pass is not a result).
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: the 70-section
  theme still compiles and gscan reports the same ERRORS/WARNINGS counts as the committed
  measurement — the adapter changed nothing.
- `grep -rn "test-renderer-agreement\|test-ad36" --include=*.md --include=*.py . --exclude-dir=node_modules --exclude-dir=.git`
  -- expected: every hit is either the new path or a `record` document (`MEASUREMENTS.md`,
  `spike-compiler/RETIRED.md`), which is never edited.
- `python3 tools/doc-audit.py --check` -- expected: exits 0 (run twice; sub-tools regenerate on the
  first failure).

**Re-verified independently at `28486205`, after the Dev commit, on Node 24.18.1** (standing rule 2
— a result nobody re-ran is a report, not a result):

| Command | Result |
|---|---|
| `pnpm check` | exit 0 — `section-runtime` 41/41, `test-vocabulary.mjs` 17/17 |
| `cd tools/stress && node build.js` | 103/103 .hbs · 2380 elements · 201 links / 215 images / 86 headings · 943 CSS declarations · AD-34 leak assertions clean — identical to the baseline |
| `cd tools/stress && node gate.js theme` | Ghost 5 via gscan 4.49.7: ERRORS 0 WARNINGS 0 · Ghost 6 via gscan 6.4.2: ERRORS 0 WARNINGS 0 — identical to the baseline |
| `python3 tools/doc-audit.py --check` | PASS (twice; the first run regenerated, as its sub-tools do) |
| `grep -rn "test-renderer-agreement\|test-ad36" --include=*.md --include=*.py .` | every remaining hit is a `record` document (`MEASUREMENTS.md`, `spike-compiler/RETIRED.md`, `reconcile-designs.md`) or a completed story's own spec — no live document still points at the old paths |
| suppression scan over `packages/section-runtime` | no `eslint-disable`, `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck` — AD-1 passes as the gate, not as a note |
| negative control on the token-drift check | the extraction flags `var(--nope)` by name and correctly ignores `var(--local, 1px)`, so the matrix's last row fails when it should |

**Manual checks (if no CLI):**
- The runtime itself touches no real infrastructure: it is pure by construction and holds no clock,
  no network and no database. **What R-82 binds to here is the gscan pairing the harness rests on,
  and the review read it live** (2026-09-11, keys by variable name only): `GET /ghost/api/admin/config/`
  on T1 `ghost6.inflozo.com` answered 200 with version **6.58.0** (`GHOST6_VERSION`) and on T3
  `ghost5.inflozo.com` 200 with **5.130.6** (`GHOST5_VERSION`), so `gate.js`'s gscan 6.4.2 ↔ Ghost 6.x
  and gscan 4.49.7 ↔ Ghost 5.x pairing is checked against the live majors; the negative control, the
  same `kid` with a zeroed secret, answered 401 `UnauthorizedError` on both. Nothing was uploaded or
  activated (the reset protocol was not invoked). Story 4.3's recorded-Ghost contract tests are the
  first in this epic that write to one.

**Re-verified by the review, 2026-09-11, after every patch was applied (Node 24.18.1):**

| Command | Result |
|---|---|
| `pnpm check` | exit 0 — lint clean with no suppression comment, 5 typechecks, `section-runtime` 41 → 49 tests all passing (the review added the vectors its mutation run showed were missing), `test-vocabulary.mjs` 17/17 |
| `cd tools/stress && node build.js` | 103/103 .hbs · 2380 elements · 201 links / 215 images / 86 headings · 943 CSS declarations · AD-34 leak assertions clean — identical to the baseline and to the Dev run |
| `cd tools/stress && node gate.js theme` | Ghost 5 via gscan 4.49.7: 0/0 · Ghost 6 via gscan 6.4.2: 0/0 — identical |
| gscan on the two NEW attribute forms — `alt="{{#if title}}{{title}}{{else}}authored{{/if}}"`, `src="{{#if f}}{{img_url f size="800"}}{{else}}/x.jpg{{/if}}"` and `style="{{#if accent_color}}--tag-accent: {{accent_color}}{{/if}}"` — in a partial appended to a copy of the 70-section theme | 0 errors / 0 warnings on both majors. **Control:** the same copy with `{{ghost_head}}` removed from `default.hbs` reports `GS040-GH-REQ` on both, so the run sees what it should (an `onload` attribute, tried first, is NOT something gscan flags — that control did not pass and was replaced) |
| the Verification Gap layer's mutation run (19 single-line mutations of `core.ts`/`marks.ts`) | at the Dev commit only 2 of 19 made a test fail; the review's added tests cover each of the 17 that passed green: the leak fixture derived from `RENDERED_DIRECTIVES`, the attribute-form fallback, the `a` mark / lock / range, partial extraction, `data-prop` + `hide`, limit slicing, the date format, the style refusal |
| the nested-canvas defect, executed at the Dev commit | `posts[0].tags = [post-tag]`, root `tags = [TOP-LEVEL]`: the canvas rendered `TOP-LEVEL` inside the card. Fixed (outer-first, per-row recursion) and asserted |
| `python3 tools/doc-audit.py --check` | PASS, twice |

**What the review changed, in one paragraph.** Every directive value is now read through one
`consume()` that runs the library's own `parse` for that directive before the value reaches any syntax
(AD-36 #2 closed for `data-repeat`, `data-repeat-limit`, `data-partial`, and a bad `data-empty` or
`data-prop-attr` refused rather than ignored); a repeat modifier with no repeat refuses; the canvas
expands repeats outer-first so a nested repeat reads its row and `@site.*` reads the root, as
Handlebars does; a guard on the repeated element itself lands inside the block; emptiness mirrors
`{{#if}}` (`''`, `0`, `false`, `[]`); the media guard is any URL entry in a list; `data-empty` is
shared by every directive on its element and swept once; `data-bind-style` carries FR-H8's guard and
an absent value leaves an empty `style` on both emitters; `formatDate` knows `MMMM`, `D` and `YY`;
`safeCssColor` accepts only CSS's two argument shapes; and `CUSTOM_PROPERTY_RE` is the one copy of
that grammar. The 70-section harness and its gscan verdict did not move.
