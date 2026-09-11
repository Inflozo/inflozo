// @inflozo/library — the section library's contract. Data and the checks over it; no renderer.
// AD-2: the library is data, never code. What lives here is the RULEBOOK every design is authored
// against (AD-34: "the rules are data in packages/library"), shared by the two emitters Story 4.2
// builds, by 4.5's controls engine and by the compile gate.
export * from './vocabulary.ts'
export * from './registry.ts'
export * from './validate.ts'
