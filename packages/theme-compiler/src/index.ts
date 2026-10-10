// @inflozo/theme-compiler — a project's template docs in, a Ghost theme's files out (Epic 7). Story 7.1 is the mechanism:
// `compileTheme` assembles every visible section, through the section runtime's theme emitter, into templates, partials
// and one stylesheet, to the formatting contract; Story 7.2 adds `package.json`, whose marker key `THEME_MARKER` Story 7.20
// reads; Story 7.4 its fonts, licences and stripped stylesheet, returning AD-14's record (`CssRecord`) beside
// the files; Story 7.5 its scripts and README (`tidyLicence` is exported for CI's comparison of Ghost's licence); Story 7.6
// Ghost's article (`POST_ARTICLE`) and the two markup checks CI also runs, `checkGhostMarkup` and `checkChromeText`; Story
// 7.8 the required set its quality gate holds (`REQUIRED_TEMPLATES`, `requiredTemplates`); the later stories of the epic fill the rest of the tree. Story 7.7's gscan gate is `@inflozo/theme-compiler/gate`, and it is
// deliberately NOT exported here, so nothing that only compiles loads either gscan.

export const name = '@inflozo/theme-compiler'
export {
  checkChromeText, checkGhostMarkup, checkTripleStashes, compileTheme, CSS_BUDGET_BYTES, POST_ARTICLE, REQUIRED_TEMPLATES, requiredTemplates, THEME_MARKER,
  THEME_MARKS, tidyLicence,
} from './compile.ts'
export type { CompiledTheme, CompileInput, CompileSetting, CssRecord, CustomRecord, JsRecord } from './compile.ts'
export { claim, partialSlug, sectionSlug, SLUG_MAX } from './slug.ts'
