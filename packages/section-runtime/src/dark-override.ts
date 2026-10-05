// STORY 6.5 — A SECTION'S DARK OVERRIDE, AS A VISITOR SEES IT (DW-195, AD-30 amended).
//
// The canvas previews dark by re-stamping each root through `storedFor` (Story 5.6): a section whose Background is
// Contrast in dark carries `data-bg="contrast"` there. A shipped theme cannot do that — it has ONE markup for both
// modes, and the mode is decided in the visitor's browser, by the token block. So a design states each value of a
// mode-scoped control as custom properties on its root (`mode-scoped-rule`, the library's `modeScopedRules`), and a
// section's dark override becomes THAT SET for that one section: its root carries `data-instance="<hook>"` and the token
// block declares the dark value's properties on it under `MODE_SELECTORS`' two conditions — the same conditions, from
// the same list, that make the page dark. A plain link follows its ground (`GROUND_LINKS`), because `LINK_RULES`' ground
// rules key on the light value's `data-bg`.
//
// SPECIFICITY, both directions executed at Story 6.5's Create: the property rule (0,3,1) or above beats the design's root
// rule (0,2,0) always; the link rule sits at (0,0,1), above `LINK_RULES`' zero-specificity rules whatever their order and
// below any link rule a design writes for itself (R-173).
//
// Epic 7's compile writes `packTokensCss(pack)` then `darkOverrideCss` over every placed section into the theme's token
// block (Story 7.4); the editor stamps the same hook (`darkHook`) so the canvas draws the markup the theme ships. Pure
// (AD-1): plain values in, a string out.

import { modeScopedOffers, modeScopedRules, rootClassOf } from '@inflozo/library'
import { darkOverridesInForce, resolveControls, storedFor, type ControlEntry, type ControlState } from './controls.ts'
import { GROUND_LINKS, MODE_SELECTORS } from './tokens.ts'

/** The hook's whole alphabet: eight lowercase hex digits. Both emitters re-check a handed hook against it (AD-36), so a
 *  quote or a bracket can never reach an attribute or a selector. */
export const HOOK_RE = /^[0-9a-f]{8}$/

/** FNV-1a, 32 bits, over the key's UTF-16 code units, as eight hex digits. ponytail: 32 bits, and a collision is refused at
 *  emit (`darkOverrideCss`); widen the hash if a project ever meets one. */
function fnv1a(key: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193) >>> 0
  return h.toString(16).padStart(8, '0')
}

/** The overrides in force (`darkOverridesInForce`, the one rule for which overrides render) whose dark value DIFFERS from
 *  the light one — the only ones with anything to write. `darkHook` and `darkOverrideCss` both ask this, so a root
 *  carries a hook exactly where the token block has a rule for it (Story 6.5's Review: an override equal to its light
 *  value used to stamp a hook with no rule behind it, and could collide on it). */
function changing(entry: Pick<ControlEntry, 'controlSchema' | 'universals'>, state: ControlState): { names: string[]; dark: Record<string, string> } {
  const names = darkOverridesInForce(entry, state)
  if (names.length === 0) return { names, dark: {} }
  const light = resolveControls(entry, storedFor(entry, state, 'light'))
  const dark = resolveControls(entry, storedFor(entry, state, 'dark'))
  return { names: names.filter((n) => dark[n] !== light[n]), dark }
}

/** THE HOOK of a placed section: a hash of its key — the editor's `queryKey`, `${template_key}:${instanceId}` — when an
 *  override of it is in force and changes its look in dark (`changing`), else `undefined`, so a
 *  root carries `data-instance` only where the token block has a rule for it. An instance id is unique only inside its
 *  doc (Home's page-2 copy shares Home's), so the key is doc-qualified, and Epic 7 hashes the same key for the file it
 *  compiles the section into. */
export function darkHook(entry: Pick<ControlEntry, 'controlSchema' | 'universals'>, state: ControlState, key: string): string | undefined {
  return changing(entry, state).names.length > 0 ? fnv1a(key) : undefined
}

/** One placed section, as `darkOverrideCss` reads it. */
export type PlacedSection = {
  /** `${template_key}:${instanceId}` — what `darkHook` hashes */
  key: string
  entry: Pick<ControlEntry, 'controlSchema' | 'universals' | 'html'> & { css: string; id?: string }
  state: ControlState
}

/** THE TOKEN BLOCK'S PER-SECTION PART: for each placed section with an override in force, the dark value's root
 *  declarations (read through the library's `modeScopedRules`, the validator's own reader) on `[data-instance="<hook>"]`,
 *  under `MODE_SELECTORS`' two conditions, and for `bg` that value's `GROUND_LINKS` on a plain link under the same
 *  conditions at (0,0,1). `''` when nothing is in force.
 *
 *  REFUSED BY NAME, NEVER SKIPPED: two sections whose keys hash to one hook (or one key twice), naming both keys; a
 *  stylesheet that breaks the authoring rule; an override in force whose value has no root rule, naming design and value.
 *  An override equal to its light value changes nothing, so it writes nothing (a control offering one value has no
 *  rule to write, and needs none). */
export function darkOverrideCss(placed: readonly PlacedSection[]): string {
  const hooks = new Map<string, string>()
  const sections: { hook: string; props: string; links: string | undefined }[] = []
  for (const { key, entry, state } of placed) {
    const { names, dark } = changing(entry, state)
    if (names.length === 0) continue
    const hook = fnv1a(key)
    const met = hooks.get(hook)
    if (met !== undefined) throw new Error(`darkOverrideCss: sections "${met}" and "${key}" share the hook ${hook} — ${met === key ? 'one section was handed twice' : 'their keys collide'}; each placed section is handed once, and a colliding pair is refused rather than given one look`)
    hooks.set(hook, key)
    const design = entry.id ?? key
    const read = modeScopedRules(entry.css, rootClassOf(entry.html), modeScopedOffers(entry.controlSchema, entry.universals))
    if (read.refusals.length > 0) throw new Error(`darkOverrideCss: ${design}'s stylesheet breaks the authoring rule — ${read.refusals[0] as string}`)
    const props: string[] = []
    let links: string | undefined
    for (const name of names) {
      const value = dark[name] as string
      const declarations = read.rules.get(name)?.get(value)
      if (declarations === undefined) throw new Error(`darkOverrideCss: ${design}'s ${name} is "${value}" in dark and its stylesheet states no root rule for that value — refused, never drawn as the light value (AD-30)`)
      props.push(...declarations.map(([p, v]) => `${p}: ${v};`))
      if (name === 'bg') links = GROUND_LINKS[value]
    }
    if (props.length > 0 || links !== undefined) sections.push({ hook, props: props.join(' '), links })
  }
  if (sections.length === 0) return ''
  const at = (condition: string, hook: string) => `${condition} [data-instance="${hook}"]`
  const rules = (system: boolean) => sections.flatMap(({ hook, props, links }) => {
    const scoped = system ? at(MODE_SELECTORS.system, hook) : MODE_SELECTORS.explicit.map((c) => at(c, hook)).join(', ')
    return [
      ...(props === '' ? [] : [`${scoped} { ${props} }`]),
      ...(links === undefined ? [] : [`:where(${scoped}) a:where(:not([class]), [class=""]) { ${links} }`]),
    ]
  })
  return [
    '/* Story 6.5 · each section\'s dark override, under the same conditions as the dark map (DW-195, AD-30) */',
    `@media ${MODE_SELECTORS.media} {\n${rules(true).map((r) => `  ${r}`).join('\n')}\n}`,
    ...rules(false),
    '',
  ].join('\n')
}
