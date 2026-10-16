// Story 7.16a — Ghost's own NQL and YAML parsers, test-only devDependencies (`routes.test.ts`, `ad36.test.ts`), typed for
// exactly what the tests call: `nql(filter).parse()` (Mongo JSON) and `.queryJSON(record)` (the in-memory match Ghost's
// URL service runs, `router-filter.js`), and `js-yaml`'s `load`. Neither package ships declarations; the runtime imports
// neither (FR-I2: no third-party NQL parser is a runtime dependency).

declare module '@tryghost/nql' {
  type Query = { parse(): unknown; queryJSON(record: object): boolean }
  const nql: (filter: string, options?: object) => Query
  export default nql
}
declare module 'nql5' {
  type Query = { parse(): unknown; queryJSON(record: object): boolean }
  const nql: (filter: string, options?: object) => Query
  export default nql
}
declare module 'js-yaml' {
  export function load(source: string): unknown
}
