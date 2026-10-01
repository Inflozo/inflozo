// DW-113 (Story 5.24c) — the SHAPE of `tabler.json`, so TypeScript never reads the megabytes of drawings to infer one.
// Read under `allowArbitraryExtensions` (tsconfig.base.json) by every package that imports `@inflozo/library/icons`.
// Names, never `export default`, which `nodenext` refuses for a JSON module. `icons` stays `unknown`: `icons.ts` casts it
// once at the door, and `icons.test.ts` walks every node against the shape the vendoring script writes.
export declare const version: string
export declare const captured: string
export declare const command: string
export declare const integrity: string
export declare const license: string
export declare const icons: unknown
