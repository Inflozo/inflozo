// @inflozo/section-runtime — one source, two emitters, proven to agree.
//
// `renderCanvas` draws the section the user is editing; `renderTheme` emits the `.hbs` that ships to
// their Ghost site. Both are thin entry points over ONE walk in `core.ts`, which is what makes
// "what you see is what ships" a property of the code rather than a promise — `agreement.test.ts`
// is the proof, and it runs in `pnpm check` and therefore in CI.
//
// AD-1, made structural: the DOM is the FIRST ARGUMENT. `window.document` in the browser, a jsdom
// document in a test or a compile. There is no ambient document for this package to reach.

export { renderCanvas, renderTheme } from './core.ts'
export {
  RENDERED_DIRECTIVES,
  REFUSED_DIRECTIVES,
  Tokens,
  UserText,
  T0,
  T1,
  U0,
  U1,
  bindExpr,
  bindValue,
  assertBindableAttr,
  formatDate,
  escapeUserText,
  serializeMarks,
} from './core.ts'
export type {
  RenderInput,
  RuntimeDocument,
  RuntimeElement,
  RuntimeNode,
  ThemeOutput,
} from './core.ts'
export type { Mark, PropValue, RichText } from './marks.ts'

export const name = '@inflozo/section-runtime'
