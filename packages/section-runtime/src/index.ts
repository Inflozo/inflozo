// @inflozo/section-runtime — one source, two emitters, proven to agree.
//
// `renderCanvas` draws the section the user is editing; `renderTheme` emits the `.hbs` that ships to
// their Ghost site. Both are thin entry points over ONE walk in `core.ts`, which is what makes
// "what you see is what ships" a property of the code rather than a promise — `agreement.test.ts`
// is the proof, and it runs in `pnpm check` and therefore in CI.
//
// AD-1, made structural: the DOM is the FIRST ARGUMENT. `window.document` in the browser, a jsdom
// document in a test or a compile. There is no ambient document for this package to reach.

export { renderCanvas, renderTheme, checkBindings } from './core.ts'
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
  iconSvg,
  initials,
  stampControls,
} from './core.ts'
export type {
  RenderInput,
  RuntimeDocument,
  RuntimeElement,
  RuntimeNode,
  ThemeOutput,
} from './core.ts'
export type { Mark, PropValue, RichText } from './marks.ts'
// the reference token values — the controls panel paints its Swatch Row's roles with them (Story 4.5)
export { REFERENCE_TOKENS } from './tokens.ts'
export { editText, linkAttributes } from './marks.ts'
// Story 4.5 — the controls engine: the sidebar model and every edit, from the one declaration both
// emitters read (FR-F7). Epic 5 mounts the panel over these.
export {
  addItem,
  defaultContent,
  duplicateItem,
  getPath,
  moveItem,
  removeItem,
  resetControl,
  resetSection,
  resolveControls,
  setContent,
  setControl,
  setData,
  sidebar,
  withData,
} from './controls.ts'
export type {
  ControlEntry,
  ControlOption,
  ControlRow,
  ControlState,
  DataRow,
  PropRow,
  SidebarGroupModel,
  SidebarModel,
  SidebarRow,
} from './controls.ts'
