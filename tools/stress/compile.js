// tools/stress/compile.js — a THIN CommonJS adapter over `@inflozo/section-runtime`.
//
// This file used to BE the pipeline. Story 4.2 moved it into `packages/section-runtime` as
// TypeScript under AD-1's ban list, with the DOM injected rather than imported, because a working
// two-emitter pipeline living in a separate npm project outside the pnpm workspace was unlinted,
// untypechecked and — the part that mattered — **not run by `pnpm test`, so not run by CI**. The
// epic's central claim was therefore asserted on a developer's laptop and nowhere else.
//
// What survives here is the adapter `build.js` needs: the same exported names, the same signatures,
// and the jsdom document the runtime now TAKES as an argument. There is exactly one implementation
// of the compile, and this is not it.
//
//   the runtime            packages/section-runtime/src/{index,core,marks,tokens}.ts
//   the agreement proof    packages/section-runtime/src/agreement.test.ts
//   the AD-36 proof        packages/section-runtime/src/ad36.test.ts
//
// all three run under `pnpm check`, which CI runs.

const { JSDOM } = require('jsdom');
const rt = require('../../packages/section-runtime/src/index.ts');
const gate = require('../../packages/theme-compiler/gate/index.ts');
const { REFERENCE_PACK } = require('../../packages/section-runtime/src/reference.ts');

// One fresh document per render. In the browser this is `window.document`; here it is jsdom's, and
// AD-1's "a DOM global it did not receive as an argument" is what makes the difference invisible to
// the runtime.
const doc = () => new JSDOM('<body></body>').window.document;

/** Emitter 1 — `.hbs` text plus its partials. `users` is the SHARED UserText: R2-5 substitutes last,
 *  over the whole emitted file tree, so the markers must survive this call. `dataBindings` is the section's
 *  declared `{{#get}}` queries (design.json's), the keys its `data-repeat`s name. */
const renderSection = (src, content, users, target, dataBindings) =>
  rt.renderTheme(doc(), src, { content: content || {}, users, ...(target ? { target } : {}), ...(dataBindings ? { dataBindings } : {}) });

/** Story 5.19 — Emitter 1 for a SECONDARY feed: the same section inside its query's `{{#get}}` (`RenderInput.feed`).
 *  `target` names the paginated template a design with a pager is judged for (R-7). */
const renderSecondary = (src, content, users, query, target) =>
  rt.renderTheme(doc(), src, { content: content || {}, users, feed: { query }, ...(target ? { target } : {}) });

/** Emitter 2 — the canvas. */
const renderCanvas = (src, content, ghost) =>
  rt.renderCanvas(doc(), src, { content: content || {}, ghost: ghost || {} });

module.exports = {
  renderSection,
  renderSecondary,
  feedQuery: rt.feedQuery,
  renderCanvas,
  bindValue: rt.bindValue,
  formatDate: rt.formatDate,
  Tokens: rt.Tokens,
  UserText: rt.UserText,
  T0: rt.T0,
  T1: rt.T1,
  U0: rt.U0,
  U1: rt.U1,
  safeUrl: require('../../packages/library/src/vocabulary.ts').safeUrl,
  bindExpr: rt.bindExpr,
  assertBindableAttr: rt.assertBindableAttr,
  BINDABLE_ATTRS: require('../../packages/library/src/vocabulary.ts').BINDABLE_ATTRS,
  RENDERED_DIRECTIVES: rt.RENDERED_DIRECTIVES,
  REFUSED_DIRECTIVES: rt.REFUSED_DIRECTIVES,
  // Story 7.8 — FR-J17's gate and AD-34's leak assertions, the theme compiler's own (`@inflozo/theme-compiler/gate`):
  // the fixture measures the real gate where its proxy (a Handlebars precompile and a JSDOM walk) used to run, and spells no leak rule
  // of its own. The pack is Paper's; the library is empty, because the fixture is assembled from `sections.js`, not
  // compiled from the library, so its required set is the compiler's `REQUIRED_TEMPLATES`.
  qualityGate: (files) => gate.qualityGate(files, { pack: REFERENCE_PACK, library: () => undefined }),
  leftovers: (files) => gate.leftovers(files),
  TEXTUAL: gate.TEXTUAL,
};
