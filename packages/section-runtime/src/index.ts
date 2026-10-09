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
  srcsetExpr,
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
// Story 6.1 — the token engine every pack goes through and its scales (R-230); and the WCAG ratio Story 6.4's live
// contrast warning reads. DW-323 (Story 6.3): Paper's reference set — `REFERENCE_PACK`, `REFERENCE_TOKENS`,
// `referenceTokensCss` — is `@inflozo/section-runtime/reference` and a pairing's faces (`fontFaceCss`) are
// `@inflozo/section-runtime/fonts`, never this index: both read the library's presets and font pool, and every canvas
// client imports this file (`tools/check-traces.mjs` holds it).
// Story 6.4 — and 6.2's AA pairs as one list (`AA_PAIRS`), the pill radius's one grammar (`isLength`) and the one hex test
// (`isHex`): the Style Pack editor validates a record and computes its tokens in the browser with these, so the client
// refuses exactly what the engine refuses. All pool-free.
export { AA_PAIRS, BASE_CSS, isLength, packTokens, packTokensCss, SCALES } from './tokens.ts'
// Story 7.8 (R-170) — the contrast check and its words, moved from the Style Pack editor: the editor's live warning and the
// theme quality gate's `contrast_low` say one thing
export { hardToRead, MODE_WORDS, MODES, pairWords, ROLE_WORDS } from './tokens.ts'
// Story 6.5 — FR-E4's three inputs as one declared list of mode conditions (R-239's precedence lives there alone), a plain
// link's declarations per Background value, and a section's dark override as a visitor sees it: the hook both emitters
// stamp and the token block's per-section rules. Epic 7's compile and the keyboard gate read them.
export { GROUND_LINKS, MODE_SELECTORS } from './tokens.ts'
export { darkHook, darkOverrideCss, HOOK_RE, hookOf, sectionKey } from './dark-override.ts'
export type { PlacedSection } from './dark-override.ts'
export type { Face, HardPair, Pack, PackMode, PackRole, TokenRow, TokenSource } from './tokens.ts'
// Story 6.6 — and `stepToContrast`, the engine's own walk to 4.5:1: the brand seed (`apps/web/lib/pack-edit.ts`'s
// `brandSeed`) makes a site's accent and its on-accent readable with it, in the browser as on the server
export { contrast, isHex, stepToContrast } from './colour.ts'
export { editText, linkAttributes } from './marks.ts'
// Story 5.16a — AD-5's one exception, exported so the tests can name the exact string the theme emits
export { PAGE_NUMBER_HBS } from './marks.ts'
// Story 7.7 — AD-36: gscan's brace-free trigger words written inert, and the table the gate's test holds on both checkers
export { GSCAN_INERT, gscanInert } from './marks.ts'
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
  // DW-198 (Story 5.24e) — the project-level Clear, over every doc: only the docs that changed
  clearProject,
  darkOverrideCount,
  // Story 5.23 (R-205) — a dark override held anywhere, remembered ones included: what the project-level Clear visits
  holdsDarkOverride,
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
// and by Story 7.3's compiler (AD-27(d)). Story 5.16 — `pageTwoStack` is what page 2 of a paginated canvas is
// made of (R-179), and it replaced R-127's `indexStack`: the editor's page-2 preview and the compiler call it alike.
export { isSynthesizable, pageTwoStack, synthesize, SYNTHESIS_DEFAULTS } from './synthesize.ts'
export type { DefaultRow, DroppedRow, Synthesis, SynthesisEntry, SynthesisLibrary } from './synthesize.ts'
// Story 5.19 — FR-H2's main feed: ONE designation rule beside `synthesize` (AD-27(d)) that the editor's every door and
// Story 7.3's compiler pass each paginated doc through, the reassignment, a secondary feed's own query, the
// feed-less archive the editor's Layers note and Story 7.18's Pre-flight read, and `visibleFeed`, which Story 7.3's
// guard asks of every page 2.
export { designate, feedBase, feedlessArchive, feedQuery, isFeed, mainFeedOf, makeMainFeed, visibleFeed } from './main-feed.ts'
// Story 7.9 — FR-Q2's rules for a Ghost theme setting as data, one module: Theme settings' actions validate with it and
// Story 7.10's `config.custom` emitter reads it
export {
  checkSetting, claimKey, conditionValues, ghostEntry, GHOST_SETTING_GROUPS, GHOST_SETTING_TYPES, GROUP_WORDS, keyRefusal, POSTS_PER_PAGE,
  postsPerPage, PROMOTED_TYPE, RESERVED_SETTING_KEYS, SETTING_CAP, SETTING_WORDS, settingKey, settingOf, USER_SETTING_CAP,
  visibilityNql,
} from './custom-settings.ts'
export type { SettingGroup, SettingOption, SettingRow, SettingType, Visibility } from './custom-settings.ts'
