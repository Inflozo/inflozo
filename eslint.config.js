// AD-1 as a rule, not a review: nothing in the core packages may reach for the
// host machine. The block below is the spine's ban list, enforced by `pnpm lint`, which
// `pnpm check` runs, which the Vercel build runs — so a violation never deploys.
//
// The parser is typescript-eslint's, and it runs on the TypeScript 6 API: typescript-eslint
// refuses to load against typescript 7 (its own error names the side-by-side remedy, and
// github.com/typescript-eslint/typescript-eslint#10940 tracks support). The project's
// compiler is still 7.0.2 — every package typechecks and builds with it; the root's
// typescript 6.0.3 exists only so ESLint can read a `.ts` file.
import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { join } from 'node:path'
import tsParser from '@typescript-eslint/parser'
import compat from 'eslint-plugin-compat'

// Story 4.8 — `browserslist-config-baseline` reads FR-G8's pin from process.cwd()'s package.json, so ESLint started
// anywhere but the repo root would lint the modules against TODAY's floor and say nothing (executed: from /tmp the
// floor is Safari 17.4 and `new ImageCapture()` passes). Refuse to run instead.
const cwdPin = (() => {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))['browserslist-config-baseline']?.widelyAvailableOnDate
  } catch {
    return undefined
  }
})()
if (cwdPin === undefined) {
  throw new Error(`eslint must run from the repo root: ${process.cwd()}/package.json carries no browserslist-config-baseline.widelyAvailableOnDate, so eslint-plugin-compat would lint against today's floor, not the pin`)
}

// Membership is derived from the directory, never listed — a hardcoded list has gone stale
// twice in this repo, and the three-package version of this constant already missed a fourth
// package, every `.tsx`, and every `.js`: all of them linted with no ban at all (executed).
//
// `library` used to be excluded WHOLE, because AD-2 makes it data only. Story 4.1 put source in it
// (AD-34: "the rules are data in `packages/library`"), and a whole-package exclusion is a hole the
// moment that happens: the contract both emitters read would have linted with no AD-1 ban at all.
// The exclusion therefore names the DATA and THEME-CODE directories only, and nothing else in the
// package may reach `document`.
// Story 4.4 added `orbit-weekly/`: authored and recorded data, plus Ghost's vendored card scripts,
// which reach `document` because that is their whole job. Its CODE half is `src/orbit-weekly.ts`.
// Story 4.7 added `modules/`: FR-G7's behaviour modules and `core` are theme browser code, bundled into a
// generated theme's main.js and never run by the product, so AD-1's ban is not theirs — and every future
// module keeps its test beside it there. Their own rule is the block at the end: no global.
const CORE = ['packages/*/**/*.{ts,tsx,mts,cts,js,mjs,cjs}']
const NOT_CORE = ['packages/library/designs/**', 'packages/library/fixtures/**', 'packages/library/orbit-weekly/**', 'packages/library/modules/**']

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
  {
    // Story 4.7 — a module file is a classic script whose top level is one function, and it reaches the
    // platform only through what `core` hands it (`win`, `el`, `ctx`). With no browser globals declared,
    // `no-undef` turns a bare `window`, `document` or `setTimeout` into an error.
    //
    // Story 4.8 — `compat/compat` is the JS half of FR-G8's floor. Its browsers are the pin's, read through
    // `packages/library/package.json`'s `browserslist` key (never the root's, which `next build` would reach).
    // Its reach is BARE GLOBALS ONLY (executed, and `settings.lintAllEsApis: true` changes nothing — executed at the
    // 4.8 review): it flags `requestIdleCallback` and `window.ImageCapture` at the floor's Safari, and misses
    // `win.ImageCapture`, `Object.groupBy`, `Promise.withResolvers`, `AbortSignal.any` and every instance method — so
    // `core`'s `win.*` is invisible to it, and a module's other APIs are read against web-features at the pin by hand
    // (docs/section-authoring.md; MEASUREMENTS §42 did it for `core`). On a module, `no-undef` already refuses the
    // same bare global; what compat adds is the browser's name, and its real job is the control in
    // `tools/check-baseline.mjs`, which proves the pin reached the toolchain: `new ImageCapture()` must be refused
    // naming the floor's Safari.
    files: ['packages/library/modules/*.js'],
    languageOptions: { sourceType: 'script' },
    plugins: { compat },
    rules: { 'no-undef': 'error', 'compat/compat': 'error' },
  },
]
