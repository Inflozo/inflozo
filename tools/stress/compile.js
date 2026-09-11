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

// One fresh document per render. In the browser this is `window.document`; here it is jsdom's, and
// AD-1's "a DOM global it did not receive as an argument" is what makes the difference invisible to
// the runtime.
const doc = () => new JSDOM('<body></body>').window.document;

/** Emitter 1 — `.hbs` text plus its partials. `users` is the SHARED UserText: R2-5 substitutes last,
 *  over the whole emitted file tree, so the markers must survive this call. */
const renderSection = (src, content, users) =>
  rt.renderTheme(doc(), src, { content: content || {}, users });

/** Emitter 2 — the canvas. */
const renderCanvas = (src, content, ghost) =>
  rt.renderCanvas(doc(), src, { content: content || {}, ghost: ghost || {} });

module.exports = {
  renderSection,
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
};
