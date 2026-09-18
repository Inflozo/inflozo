// @inflozo/section-runtime — one source, two emitters, proven to agree.
//
// `renderCanvas` draws the section the user is editing; `renderTheme` emits the `.hbs` that ships to
// their Ghost site. Both are thin entry points over ONE walk in `core.ts`, which is what makes
// "what you see is what ships" a property of the code rather than a promise — `agreement.test.ts`
// is the proof, and it runs in `pnpm check` and therefore in CI.
//
// AD-1, made structural: the DOM is the FIRST ARGUMENT. `window.document` in the browser, a jsdom
// document in a test or a compile. There is no ambient document for this package to reach.

export { renderCanvas, renderTheme, checkBindings, checkChromeLiterals } from './core.ts'
export {
  RENDERED_DIRECTIVES,
  REFUSED_DIRECTIVES,
  WALKED_GHOST_PATH_DIRECTIVES,
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
  MemberState,
  RenderInput,
  RuntimeDocument,
  RuntimeElement,
  RuntimeNode,
  ThemeOutput,
} from './core.ts'
export type { Mark, MarkNode, PropValue, RichText } from './marks.ts'
// the reference token values — the controls panel paints its Swatch Row's roles with them (Story 4.5)
export { REFERENCE_TOKENS } from './tokens.ts'
export { editText, linkAttributes } from './marks.ts'
// Story 5.3 — the value's edits: typing, a paste, the toolbar's marks and links, and the DOM points between them
export {
  activeMarks,
  allowedMarks,
  diffText,
  domPoint,
  isRich,
  readMarks,
  readText,
  replaceRange,
  setLink,
  textOffset,
  toggleMark,
  unlink,
} from './marks.ts'
// Story 4.5 — the controls engine: the sidebar model and every edit, from the one declaration both
// emitters read (FR-F7). Epic 5 mounts the panel over these.
export {
  addItem,
  defaultContent,
  duplicateItem,
  getPath,
  GROUP_LABELS,
  moveItem,
  movedTo,
  removeItem,
  resetControl,
  resetSection,
  resolveControls,
  // Story 5.6 — FR-D7's mode: the one function that decides which stored slice a mode resolves from, and the
  // one definition of "this section carries a dark override"
  darkOverridesInForce,
  storedFor,
  setContent,
  setControl,
  setData,
  resetChanges,
  sidebar,
  withData,
} from './controls.ts'
export type {
  ControlEntry,
  ControlOption,
  ControlRow,
  ControlState,
  Mode,
  DataRow,
  PropRow,
  SidebarGroupModel,
  SidebarModel,
  SidebarRow,
} from './controls.ts'
// Story 5.1 — AD-27's one doc schema: every reader and writer of `project_templates.doc` parses through it.
export { docSchema, instanceSchema, parseDoc } from './doc-schema.ts'
export type { DocInstance, ProjectDoc } from './doc-schema.ts'
// Story 5.4 — what a section operation MEANS, over that doc: the editor's gestures, 5.8's journal and Epic 7's
// compiler all read the rules here rather than re-deriving them.
export {
  clearDarkOverrides,
  darkOverrideCount,
  duplicateSection,
  isDesigned,
  moveSection,
  removeSection,
  renameSection,
  setHidden,
  setMemberVisibility,
} from './doc-edit.ts'
// Story 5.5 — FR-D6's synthesis: ONE core function over the normative Synthesis Defaults, called by the editor now
// and by Story 7.3's compiler and Story 5.16's page-2 preview later (AD-27(d)).
export { indexStack, isSynthesizable, synthesize, SYNTHESIS_DEFAULTS } from './synthesize.ts'
export type { DefaultRow, DroppedRow, Synthesis, SynthesisEntry, SynthesisLibrary } from './synthesize.ts'
