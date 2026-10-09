// gscan ships no type declarations. These cover the members the gate uses, which both pinned checkers share (gscan
// 4.49.7 and 6.4.2: `lib/index.js`, `lib/format.js` and `lib/specs/v*.js`, read in source at Story 7.7's Create). The
// shell loads each checker by its `GSCAN` alias and reads it through this one shape — `jsdom.d.ts`'s pattern. `gscan.ts`
// names this file in a `/// <reference>`: TypeScript leaves a `.d.ts` out of the program when a `.ts` of the same name sits
// beside it (executed — without the line, `import('gscan')` does not resolve).

declare module 'gscan' {
  /** One failure of a rule: the theme path (or `styles`, or `package.json`) and, for most rules, a message. */
  export interface Failure { readonly ref: string; readonly message?: string }
  /** One formatted result. `rule` and `details` carry HTML (`<code>`, `<a>`, `<br>`, `&nbsp;`). */
  export interface Result {
    readonly code: string
    readonly level: 'error' | 'warning' | 'recommendation'
    readonly rule: string
    readonly details: string
    readonly fatal: boolean
    readonly failures?: readonly Failure[]
  }
  export interface Formatted {
    readonly results: { readonly error: readonly Result[]; readonly warning: readonly Result[]; readonly hasFatalErrors: boolean }
  }
  /** A spec's rule as written: `fatal` is absent where it is false, `regex` present on a regex rule. */
  export interface Rule { readonly level: string; readonly fatal?: boolean; readonly regex?: RegExp | string }
  export interface Spec { readonly rules: Readonly<Record<string, Rule>> }
  /** Reads a theme DIRECTORY on disk and runs every check at `checkVersion`. */
  export function check(themePath: string, options: { checkVersion: string }): Promise<object>
  /** Fills `results.error|warning|recommendation`; it throws unless handed the `checkVersion` `check` took. */
  export function format(theme: object, options: { checkVersion: string }): Formatted
}
