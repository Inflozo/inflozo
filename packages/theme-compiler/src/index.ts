// @inflozo/theme-compiler — a project's template docs in, a Ghost theme's files out (Epic 7). Story 7.1 is the mechanism:
// `compileTheme` assembles every visible section, through the section runtime's theme emitter, into templates, partials
// and one stylesheet, to the formatting contract; Story 7.2 adds `package.json`, whose marker key `THEME_MARKER` Story 7.20
// reads; Story 7.4 its fonts, licences and stripped stylesheet, returning AD-14's record (`CssRecord`) beside
// the files; Story 7.5 its scripts and README (`tidyLicence` is exported for CI's comparison of Ghost's licence); the later
// stories of the epic fill the rest of the tree.

export const name = '@inflozo/theme-compiler'
export { checkTripleStashes, compileTheme, CSS_BUDGET_BYTES, THEME_MARKER, THEME_MARKS, tidyLicence } from './compile.ts'
export type { CompiledTheme, CompileInput, CssRecord, JsRecord } from './compile.ts'
export { claim, partialSlug, sectionSlug, SLUG_MAX } from './slug.ts'
