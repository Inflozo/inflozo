// Story 4.8 — FR-G8's floor for THEME stylesheets, and everything `stylelint-plugin-use-baseline` cannot see,
// in one file. `pnpm lint` runs it over `packages/**/*.css`; `apps/web`'s CSS is Tailwind's and is not linted.
//
// What the plugin does and does not do (executed at 1.4.6, recorded in MEASUREMENTS §43):
// - it takes `available: "widely"` but no date: its data map is frozen at its publish date, so it is not the pin.
//   `tools/check-baseline.mjs` diffs it against web-features at the pin, row by row, through THIS config, and the
//   differences it may keep are named in `packages/library/baseline.json` (`plugin.refused` / `plugin.admitted`);
// - it passes whatever an `@supports` condition tests, so `inflozo/supports-tier-2` holds a condition to Tier 2;
// - it sees neither nesting (`max-nesting-depth: 0`, §7.1's flat output) nor vendor prefixes (the closure below:
//   research §6.6's three, and nothing else, with `inflozo/prefix-pairs` holding them to their complete forms);
// - it knows nothing of motion: `inflozo/motion-gated` holds a never-ending animation behind the reduced-motion query
//   (FR-G4, Story 7.6);
// - it knows a function and an at-rule by a name map frozen at its publish date, and an at-rule's prelude not at all:
//   `inflozo/tier3-by-name` refuses by name every function and at-rule form below Widely on the pin, derived from
//   web-features (Story 7.8, DW-139).
//
// The tiers are data: Tier 2 is `baseline.json`'s `tier2`, read here, never restated. The PIN is the root package.json's
// `browserslist-config-baseline.widelyAvailableOnDate`, and Widely-on-the-pin is spelled once, here: `tools/check-baseline.mjs`
// imports it.

import { createRequire } from 'node:module'
import stylelint from 'stylelint'
import baseline from './packages/library/baseline.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint
const webFeatures = createRequire(import.meta.url)('web-features/data.json')

// ── the pin ─────────────────────────────────────────────────────────────────────────────────────────────────
export const PIN = pkg['browserslist-config-baseline']?.widelyAvailableOnDate
export const clean = (d) => (d ?? '').replace('≤', '')
/** `YYYY-MM-DD` + n months, the day clamped to the month's length (web-features' Widely rule). */
export function addMonths(date, n) {
  const [y, m, d] = date.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const last = new Date(Date.UTC(Math.floor(total / 12), (total % 12) + 1, 0)).getUTCDate()
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`
}
export const widelyOnPin = (status) => {
  const low = clean(status?.baseline_low_date)
  return low !== '' && addMonths(low, 30) <= PIN
}
/** The compat keys a Tier-2 entry names: its property (one per value), its at-rule, or its element's attribute. */
export const tier2Keys = (e) =>
  e.css?.property
    ? (e.css.values ?? [undefined]).map((v) => `css.properties.${e.css.property}${v ? `.${v}` : ''}`)
    : e.css?.atRule
      ? [`css.at-rules.${e.css.atRule}`]
      : e.html?.element && e.html?.attribute
        ? [`html.elements.${e.html.element}.${e.html.attribute}`]
        : []
const TIER2_KEYS = baseline.tier2.flatMap(tier2Keys)
/** A key a Tier-2 entry names, or one under it: allowed below Widely. */
export const isTier2Key = (key) => TIER2_KEYS.some((k) => key === k || key.startsWith(`${k}.`))

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

// ── inflozo/motion-gated ────────────────────────────────────────────────────────────────────────────────────
// Story 7.6 — FR-G4's CSS half: "decorative and continuous" motion is gated behind the visitor's reduced-motion
// preference. "Continuous" is mechanical — an animation that repeats for ever, the keyword `infinite` in `animation` or
// `animation-iteration-count`; "decorative" is not, so EVERY never-ending animation is held: it sits inside an `@media`
// whose condition holds `(prefers-reduced-motion: no-preference)`, alone or `and`-ed with a width. A finite animation is
// left alone, and so is `transition`, which FR-D20 keeps live for hover. A query that only LOOKS like the gate does not
// gate: `not (prefers-reduced-motion: no-preference)`, or a list where another query (`, (width > 50rem)`, `or`) lets the
// animation through — every query in the list must hold the condition. Ceiling, which review holds: an iteration count
// like `1000` repeats for minutes and evades the rule, and so does `infinite` carried by a custom property (`--spin`). The module half — no module but `core` reads the preference — is
// `eslint.config.js`'s.
const MOTION = 'inflozo/motion-gated'
const motionMessages = ruleMessages(MOTION, {
  ungated: (prop, value) =>
    `${prop}: ${value} — an animation that repeats for ever sits inside @media (prefers-reduced-motion: no-preference), so a visitor who asked for less motion never gets it (FR-G4)`,
})
const NO_PREFERENCE = /\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/i
/** Every query in the list holds the condition, none negates it, and none `or`s it away. */
const gated = (params) => params.split(',').every((q) => NO_PREFERENCE.test(q) && !/^\s*not\b/i.test(q) && !/\bor\b/i.test(q))
const motionGated = createPlugin(MOTION, (on) => (root, result) => {
  if (!on) return
  root.walkDecls(/^animation(-iteration-count)?$/i, (decl) => {
    if (!/(^|[\s,])infinite(?=$|[\s,])/i.test(decl.value)) return
    for (let p = decl.parent; p; p = p.parent) {
      if (p.type === 'atrule' && /^media$/i.test(p.name) && gated(p.params)) return
    }
    report({ ruleName: MOTION, result, node: decl, message: motionMessages.ungated(decl.prop, decl.value) })
  })
})

// ── inflozo/tier3-by-name ───────────────────────────────────────────────────────────────────────────────────
// Story 7.8 (DW-139) — `@container style(--x: 1)`, `if()`, `sibling-index()` and `random()` all passed the plugin. This
// rule refuses by name what web-features places below Widely on the pin, from two key families; a Tier-2 key, and every
// key under it, stays allowed. What neither form can name is each family's ceiling, which check-baseline prints.
// - A FUNCTION is a `css.types` key's last segment that its own feature's description writes as `name()` — the data says
//   which keys are functions nowhere else. A name Widely under any key passes (`rect()` is Widely as a basic shape and not
//   as `clip`'s). Refused in every declaration value and every at-rule prelude.
// - An AT-RULE FORM is a key under `css.at-rules.<at-rule>`: its next segment is a name written in the prelude
//   (`(device-posture)`, `supports(`, `at-rule(`) or, for a descriptor, in the block (`ascent-override:`) — BCD names a
//   container query kind `<function>_queries…`, so `style_queries_for_custom_properties` is `style(`; a third is its
//   value (`(display-mode: fullscreen)`). The at-rule's own name is the plugin's.
// The ceiling, printed by check-baseline: a key whose feature writes no `name()` (units, keywords, syntax forms, and
// `anchor()` or `type()`, whose features' texts do not), and a segment that is neither a name nor a query kind
// (`anchor_position_queries`, whose function is `anchored()`; `named_range_keyframes`).
const IDENT = /^[a-z][a-z0-9-]*$/i
const word = (w) => `(?<![\\w-])${w}(?![\\w-])`
/** A `css.types` key's function name, or undefined. */
export const functionName = (key, feature) => {
  const name = key.split('.').at(-1)
  return IDENT.test(name) && new RegExp(`(?<![\\w-])${name}\\(\\)`).test(feature.description ?? '') ? name.toLowerCase() : undefined
}
/** A `css.at-rules` key's form below its at-rule — `{ atRule, name, value }` — or undefined. */
export const atRuleForm = (key) => {
  const [, , atRule, first, value, ...deeper] = key.split('.')
  const name = first === undefined ? undefined : IDENT.test(first) ? first : /^([a-z][a-z-]*)_queries(?:_|$)/.exec(first)?.[1]
  if (name === undefined || deeper.length > 0 || (value !== undefined && !IDENT.test(value))) return undefined
  return { atRule, name: name.toLowerCase(), value: value?.toLowerCase() }
}
const TIER3_FUNCTIONS = new Map() // name → the key that places it below Widely
const TIER3_FORMS = {} // at-rule → [{ name, value, key, prelude: RegExp, block: RegExp | undefined }]
{
  const widely = new Set()
  for (const f of Object.values(webFeatures.features)) {
    if (f.kind !== 'feature') continue
    for (const [key, status] of Object.entries(f.status?.by_compat_key ?? {})) {
      if (isTier2Key(key)) continue
      if (key.startsWith('css.types.')) {
        const name = functionName(key, f)
        if (name === undefined) continue
        if (widelyOnPin(status)) widely.add(name)
        else TIER3_FUNCTIONS.set(name, key)
      } else if (key.startsWith('css.at-rules.') && !widelyOnPin(status)) {
        const form = atRuleForm(key)
        if (form === undefined) continue
        ;(TIER3_FORMS[form.atRule] ??= []).push({
          ...form,
          key,
          // a range feature counts with its prefix: `(min-device-width: …)` is `device-width`
          prelude: new RegExp(form.value ? `${word(form.name)}\\s*:\\s*${word(form.value)}` : word(`(?:min-|max-)?${form.name}`), 'i'),
          block: form.value ? new RegExp(word(form.value), 'i') : undefined,
        })
      }
    }
  }
  for (const name of widely) TIER3_FUNCTIONS.delete(name)
}
// ponytail: a quoted string and an unquoted url() are text, not names — `@import url(supports.css)` is no `supports(`
const bare = (s) => s.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|url\(\s*[^\s"')][^)]*\)/gi, '""')
const CALLED = TIER3_FUNCTIONS.size > 0 ? new RegExp(`(?<![\\w-])(${[...TIER3_FUNCTIONS.keys()].join('|')})\\(`, 'gi') : /(?!)/g
const TIER3 = 'inflozo/tier3-by-name'
const tier3Messages = ruleMessages(TIER3, {
  pin: 'the root package.json carries no browserslist-config-baseline.widelyAvailableOnDate as YYYY-MM-DD: there is no pin to judge against (FR-G8)',
  refused: (what, key) =>
    `${what} is below Widely on the pin (web-features ${key}): FR-G8 admits nothing newer but a Tier-2 entry in packages/library/baseline.json (DW-139)`,
})
const tier3ByName = createPlugin(TIER3, (on) => (root, result) => {
  if (!on) return
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(PIN))) return report({ ruleName: TIER3, result, node: root, message: tier3Messages.pin })
  const called = (node, text) => {
    for (const [, name] of bare(text).matchAll(CALLED)) {
      report({ ruleName: TIER3, result, node, word: name, message: tier3Messages.refused(`${name}()`, TIER3_FUNCTIONS.get(name.toLowerCase())) })
    }
  }
  root.walkDecls((decl) => called(decl, decl.value))
  root.walkAtRules((at) => {
    called(at, at.params)
    const params = bare(at.params)
    for (const f of TIER3_FORMS[at.name.toLowerCase()] ?? []) {
      const said = `@${at.name} ${f.name}${f.value ? `: ${f.value}` : ''}`
      if (f.prelude.test(params)) report({ ruleName: TIER3, result, node: at, message: tier3Messages.refused(said, f.key) })
      at.each((n) => {
        if (n.type === 'decl' && n.prop.toLowerCase() === f.name && (f.block === undefined || f.block.test(bare(n.value)))) {
          report({ ruleName: TIER3, result, node: n, message: tier3Messages.refused(said, f.key) })
        }
      })
    }
  })
})

/** @type {import('stylelint').Config} */
export default {
  // Ghost's own card CSS, vendored as recorded (Story 4.4) — Ghost-authored, as `cards.js` is; FR-G8 is ours.
  ignoreFiles: ['packages/library/orbit-weekly/vendor/**/*.css'],
  plugins: ['stylelint-plugin-use-baseline', supportsTier2, prefixPairs, motionGated, tier3ByName],
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
    [MOTION]: true,
    [TIER3]: true,
  },
}
