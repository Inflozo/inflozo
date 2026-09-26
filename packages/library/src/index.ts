// @inflozo/library — the section library's contract. Data and the checks over it; no renderer.
// AD-2: the library is data, never code. What lives here is the RULEBOOK every design is authored
// against (AD-34: "the rules are data in packages/library"), shared by the two emitters Story 4.2
// builds, by 4.5's controls engine and by the compile gate.
export * from './vocabulary.ts'
export * from './registry.ts'
export * from './validate.ts'
// Story 4.7 — FR-G7's behaviour-module registry, `bundle` (the one main.js) and `checkThemeJs`.
export * from './modules.ts'
// Story 4.6 — FR-H7's Template Context Matrix, read through `bindable` and `offerBindings`.
export * from './contexts.ts'
// Story 4.9 — FR-Q6's string catalog: the keys, placeholders derived from each default, S5's attribute and
// `resolveStrings`, the one door an override passes.
export * from './catalog.ts'
// Story 5.4 — FR-D5 and R-37's placement rules: `isPlaceable` (the non-placeable treatments) and `placementRefusal`
// (at most one Post Content per layout), read by the editor and by Story 5.10's Section Picker.
export * from './placement.ts'
// Story 5.20 — Ghost's own `checkPostAccess`, over View as's three visitors: one rule for the cut, the indicator and the
// reading time.
export * from './access.ts'
// Story 4.4 — the bundled sample publication, its three fixtures and the offline Source resolver. A
// namespace rather than a flat re-export: `posts`, `tags` and `site` are too general to claim at the
// package root.
export * as orbitWeekly from './orbit-weekly.ts'
