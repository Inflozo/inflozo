// AD-1 as a rule, not a review: nothing in the core packages may reach for the
// host machine. The block below is the spine's ban list, enforced by `pnpm lint`, which
// `pnpm check` runs, which the Vercel build runs — so a violation never deploys.
//
// The parser is typescript-eslint's, and it runs on the TypeScript 6 API: typescript-eslint
// refuses to load against typescript 7 (its own error names the side-by-side remedy, and
// github.com/typescript-eslint/typescript-eslint#10940 tracks support). The project's
// compiler is still 7.0.2 — every package typechecks and builds with it; the root's
// typescript 6.0.3 exists only so ESLint can read a `.ts` file.
import { builtinModules } from 'node:module'
import tsParser from '@typescript-eslint/parser'

// Membership is derived from the directory, never listed — a hardcoded list has gone stale
// twice in this repo, and the three-package version of this constant already missed a fourth
// package, every `.tsx`, and every `.js`: all of them linted with no ban at all (executed).
//
// `library` used to be excluded WHOLE, because AD-2 makes it data only. Story 4.1 put source in it
// (AD-34: "the rules are data in `packages/library`"), and a whole-package exclusion is a hole the
// moment that happens: the contract both emitters read would have linted with no AD-1 ban at all.
// The exclusion therefore names the DATA directories only — a design's `behaviour.js` legitimately
// reaches `document`, and nothing else in the package may.
// Story 4.4 added `orbit-weekly/`: authored and recorded data, plus Ghost's vendored card scripts,
// which reach `document` because that is their whole job. Its CODE half is `src/orbit-weekly.ts`.
const CORE = ['packages/*/**/*.{ts,tsx,mts,cts,js,mjs,cjs}']
const NOT_CORE = ['packages/library/designs/**', 'packages/library/fixtures/**', 'packages/library/orbit-weekly/**']

// Derived from the runtime, never a hand list — a hardcoded membership list has gone stale twice.
const builtins = builtinModules.flatMap((m) => {
  const bare = m.replace(/^node:/, '')
  return [bare, `${bare}/*`, `node:${bare}`, `node:${bare}/*`]
})

// `node --test` needs these two and nothing else does; they are relaxed for test files only,
// rather than exempting test files from every ban (which is what `ignores` used to do —
// executed: a `.test.ts` could import `next/server` and call `Math.random()` with exit 0).
// `assert/strict` is its own entry in `builtinModules`, so it needs naming beside `assert`.
const TEST_RUNNER = new Set(
  ['test', 'assert', 'assert/strict'].flatMap((m) => [m, `${m}/*`, `node:${m}`, `node:${m}/*`]),
)

const bannedImports = [
  ...new Set([
    'next',
    'next/*',
    '@supabase/*',
    '@inflozo/web',
    '**/apps/**',
    ...builtins,
  ]),
  // A relative specifier is never a built-in. Without these two, a core package could not
  // import its own `./util/index.ts` — it matched the derived `util/*` pattern and lint
  // refused the package's own source (executed). Negations are last: last match wins.
  '!./**',
  '!../**',
]

const hostReadingCalls = [
  'localeCompare',
  'toLocaleUpperCase',
  'toLocaleLowerCase',
  // The same class as the two above and absent until now: each substitutes the host's locale
  // or timezone for an input, and all four linted clean in a core package (executed).
  'toLocaleString',
  'toLocaleDateString',
  'toLocaleTimeString',
  'getTimezoneOffset',
  'toString',
  'getHours',
]

export default [
  {
    // Everything that is not source. The dot-directory line is load-bearing: Vercel restores
    // its build cache into `.vercel/cache/` inside the checkout, and `eslint .` linted the
    // vendored pnpm bundle in there and failed the deploy (executed 2026-09-04).
    ignores: ['**/node_modules/**', '**/.*/**', '_bmad/**', '_bmad-output/**', 'docs/**', 'tools/**'],
  },
  {
    // Source is only ever under apps/ and packages/ — so no cache directory, whatever it is
    // called, can reach a rule.
    files: ['{apps,packages}/**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: CORE,
    ignores: NOT_CORE,
    rules: {
      'no-restricted-imports': ['error', { patterns: bannedImports }],
      // `globalThis` is banned outright because it is the one-word way around every entry
      // beside it: `globalThis.process.env` linted clean while bare `process` errored
      // (executed). `performance` and `crypto` are the clock and the entropy that
      // `Date.now` and `Math.random` already name.
      'no-restricted-globals': [
        'error',
        'globalThis',
        'process',
        'fetch',
        'window',
        'document',
        'performance',
        'crypto',
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now' },
        { object: 'Math', property: 'random' },
        { object: 'Intl' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          // `no-restricted-imports` never visits `import()`, so `await import('node:fs')`
          // walked through the whole list above (executed).
          selector: 'ImportExpression',
          message: 'AD-1: a dynamic import evades the import ban; import statically or not at all.',
        },
        {
          // `Date.now()` was banned and `new Date()` was not — the same clock read.
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'AD-1: new Date() reads the host clock. Take the time as an input.',
        },
        ...hostReadingCalls.map((name) => ({
          selector: `CallExpression > MemberExpression[property.name='${name}']`,
          message: `AD-1: .${name}() substitutes host locale or timezone for an input.`,
        })),
      ],
    },
  },
  {
    // Tests keep every ban above; only the two modules `node --test` cannot run without
    // are given back.
    files: ['packages/*/**/*.test.{ts,tsx,mts,cts,js,mjs,cjs}'],
    ignores: NOT_CORE,
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: bannedImports.filter((p) => !TEST_RUNNER.has(p)) },
      ],
    },
  },
]
