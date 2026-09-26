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
// Story 5.16a — AD-5's one exception, exported so the tests can name the exact string the theme emits
export { PAGE_NUMBER_HBS } from './marks.ts'
// Story 5.20 — GHOST'S OWN PAYWALL BOX and the stylesheet `{{ghost_head}}` injects for it (MEASUREMENTS §54, held equal
// by the shim's `contract.test.ts`), for the Paywall canvas while no paywall design is chosen. The app reaches the shim
// through this package, which already depends on it, rather than as a dependency of its own.
export { contentCta, CTA_STYLES } from '@inflozo/ghost-shim'
export type { CtaInput } from '@inflozo/ghost-shim'
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
  // Story 5.11 — FR-D19's carry / park / default over one instance's slice, and FR-D13's per-design item cap as
  // the panel reads it
  itemsShown,
  switchControls,
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
  // Story 5.19 — P0·5's and D5c's sentences for the greyed Data rows, and where a secondary feed's values are stored
  DATA_WORDS,
  FEED_KEY,
} from './controls.ts'
export type {
  ControlEntry,
  ControlOption,
  ControlRow,
  ControlState,
  Mode,
  ParkedControls,
  DataControl,
  DataRow,
  FeedRole,
  PickedPost,
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
  insertSection,
  isDesigned,
  moveSection,
  removeSection,
  renameSection,
  setHidden,
  setMemberVisibility,
  // Story 5.11 — the ONE doc operation a design change goes through, which 5.12's Remix and Epic 8's swap reuse
  switchDesign,
} from './doc-edit.ts'
// Story 5.5 — FR-D6's synthesis: ONE core function over the normative Synthesis Defaults, called by the editor now
// and by Story 7.3's compiler later (AD-27(d)). Story 5.16 — `pageTwoStack` is what page 2 of a paginated canvas is
// made of (R-179), and it replaced R-127's `indexStack`: the editor's page-2 preview and the compiler call it alike.
export { isSynthesizable, pageTwoStack, synthesize, SYNTHESIS_DEFAULTS } from './synthesize.ts'
export type { DefaultRow, DroppedRow, Synthesis, SynthesisEntry, SynthesisLibrary } from './synthesize.ts'
// Story 5.19 — FR-H2's main feed: ONE designation rule beside `synthesize` (AD-27(d)) that the editor's every door and
// Story 7.3's compiler pass each paginated doc through, the reassignment, a secondary feed's own query, and the
// feed-less archive the editor's Layers note, Story 7.18's Pre-flight and Story 7.3's guard all read.
export { designate, feedBase, feedlessArchive, feedQuery, isFeed, mainFeedOf, makeMainFeed } from './main-feed.ts'
