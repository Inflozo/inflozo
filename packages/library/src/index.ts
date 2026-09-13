// @inflozo/library — the section library's contract. Data and the checks over it; no renderer.
// AD-2: the library is data, never code. What lives here is the RULEBOOK every design is authored
// against (AD-34: "the rules are data in packages/library"), shared by the two emitters Story 4.2
// builds, by 4.5's controls engine and by the compile gate.
export * from './vocabulary.ts'
export * from './registry.ts'
export * from './validate.ts'
// Story 4.4 — the bundled sample publication, its three fixtures and the offline Source resolver. A
// namespace rather than a flat re-export: `posts`, `tags` and `site` are too general to claim at the
// package root.
export * as orbitWeekly from './orbit-weekly.ts'
