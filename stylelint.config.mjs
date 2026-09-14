// Story 4.8 — FR-G8's floor for THEME stylesheets, and everything `stylelint-plugin-use-baseline` cannot see,
// in one file. `pnpm lint` runs it over `packages/**/*.css`; `apps/web`'s CSS is Tailwind's and is not linted.
//
// What the plugin does and does not do (executed at 1.4.6, recorded in MEASUREMENTS §43):
// - it takes `available: "widely"` but no date: its data map is frozen at its publish date, so it is not the pin.
//   `tools/check-baseline.mjs` diffs it against web-features at the pin, row by row, through THIS config, and the
//   differences it may keep are named in `packages/library/baseline.json` (`plugin.refused` / `plugin.admitted`);
// - it passes whatever an `@supports` condition tests, so `inflozo/supports-tier-2` holds a condition to Tier 2;
// - it sees neither nesting (`max-nesting-depth: 0`, §7.1's flat output) nor vendor prefixes (the closure below:
//   research §6.6's three, and nothing else, with `inflozo/prefix-pairs` holding them to their complete forms).
//
// The tiers are data: Tier 2 is `baseline.json`'s `tier2`, read here, never restated.

import stylelint from 'stylelint'
import baseline from './packages/library/baseline.json' with { type: 'json' }

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint

const css = baseline.tier2.filter((e) => e.css)

// Values merge per property: `text-wrap` carries two entries (balance, pretty), and a last-wins map refused
// `balance` (executed). An entry with no `values` admits the whole property.
const ALL = '/^.+$/'
const tier2Properties = {}
for (const { css: c } of css) {
  if (!c.property) continue
  const had = tier2Properties[c.property] ?? []
  tier2Properties[c.property] = had.includes(ALL) ? had : c.values ? [...had, ...c.values] : [ALL]
}
const tier2AtRules = css.filter((e) => e.css.atRule).map((e) => e.css.atRule)

// ── inflozo/supports-tier-2 ─────────────────────────────────────────────────────────────────────────────────
// Tier 1 never needs a test and Tier 3 may not use one: the plugin exempts whatever a condition tests, so
// `@supports (animation-timeline: view())` would otherwise let Tier 3 in. The survivor is A3-16's translucent
// bar, whose ground goes fully opaque where `backdrop-filter` is missing. A condition may therefore test only
// a Tier-2 property (and, where the entry names values, only those values), and never a selector or a font.
const SUPPORTS = 'inflozo/supports-tier-2'
const supportsMessages = ruleMessages(SUPPORTS, {
  refused: (params) =>
    `@supports ${params} — a condition may test only a Tier-2 property from packages/library/baseline.json (FR-G8): Tier 1 needs no test and Tier 3 may not hide behind one`,
})
const supportsTier2 = createPlugin(SUPPORTS, (on) => (root, result) => {
  if (!on) return
  root.walkAtRules(/^supports$/i, (at) => {
    const tests = [...at.params.matchAll(/\(\s*([-a-zA-Z]+)\s*:\s*([^)]*)/g)] // the whole value: `balance2` is not `balance`
    const ok =
      tests.length > 0 &&
      !/\b(selector|font-tech|font-format)\s*\(/i.test(at.params) &&
      tests.every(([, prop, value]) => {
        const allowed = tier2Properties[prop.toLowerCase()]
        return allowed !== undefined && (allowed.includes(ALL) || allowed.includes(value.trim().toLowerCase()))
      })
    if (!ok) report({ ruleName: SUPPORTS, result, node: at, message: supportsMessages.refused(at.params) })
  })
})

// ── inflozo/prefix-pairs ────────────────────────────────────────────────────────────────────────────────────
// Research §6.6's three prefixes are legal only in their complete forms: the `-webkit-box` line-clamp trio is
// all three declarations or none, and `-webkit-user-select` / `user-select` appear only together with one
// value. `user-select` alone is refused too — it is not Baseline, which is why the prefix exists — so the
// plugin ignores `user-select` and this rule is what refuses the lone row.
const PAIRS = 'inflozo/prefix-pairs'
const pairMessages = ruleMessages(PAIRS, {
  trio: 'display: -webkit-box, -webkit-box-orient and -webkit-line-clamp go together, all three or none (research §6.6)',
  select: '-webkit-user-select and user-select go together, with one value (research §6.6)',
})
const prefixPairs = createPlugin(PAIRS, (on) => (root, result) => {
  if (!on) return
  const check = (container) => {
    const d = {}
    container.each((n) => {
      if (n.type === 'decl') d[n.prop.toLowerCase()] = n.value.trim()
    })
    const trio = [d.display === '-webkit-box', '-webkit-box-orient' in d, '-webkit-line-clamp' in d]
    if (trio.some(Boolean) && !trio.every(Boolean)) report({ ruleName: PAIRS, result, node: container, message: pairMessages.trio })
    if (('-webkit-user-select' in d || 'user-select' in d) && d['-webkit-user-select'] !== d['user-select']) {
      report({ ruleName: PAIRS, result, node: container, message: pairMessages.select })
    }
  }
  root.walkRules(check)
  root.walkAtRules((at) => at.nodes && check(at))
})

/** @type {import('stylelint').Config} */
export default {
  // Ghost's own card CSS, vendored as recorded (Story 4.4) — Ghost-authored, as `cards.js` is; FR-G8 is ours.
  ignoreFiles: ['packages/library/orbit-weekly/vendor/**/*.css'],
  plugins: ['stylelint-plugin-use-baseline', supportsTier2, prefixPairs],
  rules: {
    'plugin/use-baseline': [
      true,
      {
        available: 'widely',
        ignoreProperties: { ...tier2Properties, 'user-select': [ALL] },
        ignoreAtRules: tier2AtRules,
      },
    ],

    // §7.1: flat, hand-editable output. Nesting is Widely and still forbidden. A root-level at-rule is not a level.
    'max-nesting-depth': 0,

    // The prefix closure: every position a prefix can take, refused unless it is one of §6.6's three (`--` is a custom property, not a prefix).
    // `mask-mode` is the plugin's one named refusal (`baseline.json` `plugin.refused`): its data passes it, Safari lacks it.
    'property-disallowed-list': ['/^-(?!-|webkit-(box-orient|line-clamp|text-size-adjust|user-select)$)/', ...baseline.plugin.refused],
    'declaration-property-value-allowed-list': { '-webkit-box-orient': ['vertical'], '-webkit-text-size-adjust': ['100%'] },
    'declaration-property-value-disallowed-list': {
      '/^(?!display$)/': ['/(^|[\\s,(])-(webkit|moz|ms|o)-/'],
      display: ['/^-(?!webkit-box$)/'],
    },
    'function-disallowed-list': ['/^-/'],
    'selector-pseudo-element-disallowed-list': ['/^-/'],
    'selector-pseudo-class-disallowed-list': ['/^-/'],
    'media-feature-name-disallowed-list': ['/^-/'],
    'at-rule-disallowed-list': ['/^-/'],

    [SUPPORTS]: true,
    [PAIRS]: true,
  },
}
