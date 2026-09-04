// AD-1 as a rule, not a review: nothing in the three core packages may reach for the
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

const CORE = [
  'packages/section-runtime/**/*.ts',
  'packages/ghost-shim/**/*.ts',
  'packages/theme-compiler/**/*.ts',
]

// Derived from the runtime, never a hand list — a hardcoded membership list has gone stale twice.
const builtins = builtinModules.flatMap((m) => {
  const bare = m.replace(/^node:/, '')
  return [bare, `${bare}/*`, `node:${bare}`, `node:${bare}/*`]
})

const hostReadingCalls = [
  'localeCompare',
  'toLocaleUpperCase',
  'toLocaleLowerCase',
  'toString',
  'getHours',
]

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '_bmad/**',
      '_bmad-output/**',
      'docs/**',
      'tools/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: CORE,
    // A test is not shipped code: `node --test` needs `node:test` and `node:assert`, and
    // AD-1 governs what the compiler and the canvas run, not what proves them.
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...new Set([
              'next',
              'next/*',
              '@supabase/*',
              '@inflozo/web',
              '**/apps/**',
              ...builtins,
            ]),
          ],
        },
      ],
      'no-restricted-globals': ['error', 'process', 'fetch', 'window', 'document'],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now' },
        { object: 'Math', property: 'random' },
        { object: 'Intl' },
      ],
      'no-restricted-syntax': [
        'error',
        ...hostReadingCalls.map((name) => ({
          selector: `CallExpression > MemberExpression[property.name='${name}']`,
          message: `AD-1: .${name}() substitutes host locale or timezone for an input.`,
        })),
      ],
    },
  },
]
