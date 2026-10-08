// @inflozo/theme-compiler — a project's template docs in, a Ghost theme's files out (Epic 7). Story 7.1 is the mechanism:
// `compileTheme` assembles every visible section, through the section runtime's theme emitter, into templates, partials
// and one stylesheet, to the formatting contract; Story 7.2 adds `package.json`, whose marker key `THEME_MARKER` Story 7.20
// reads; the later stories of the epic fill the rest of the tree.

export const name = '@inflozo/theme-compiler'
export { checkTripleStashes, compileTheme, THEME_MARKER, THEME_MARKS } from './compile.ts'
export type { CompileInput } from './compile.ts'
export { claim, partialSlug, sectionSlug, SLUG_MAX } from './slug.ts'
