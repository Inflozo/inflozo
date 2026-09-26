import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { isPaywallDesign, orbitWeekly, PAYWALL_TARGET, paywallRing, type SectionRegistryEntry, type Visitor } from '@inflozo/library'
import { defaultContent, renderCanvas, renderTheme, type RenderInput } from '@inflozo/section-runtime'
import { iconDrawing } from '@inflozo/library/icons'
import { paywallSamples } from './lib/controls-review.ts'
import { adminAt, askLine, askOf, membersNotice, membersOff, PAYWALL_WORDS, tierLine, tierText, warnsOn } from './lib/paywall.ts'
import { pilot } from './lib/pilots.ts'

/* Story 5.20 — the Paywall canvas's words and pure rules (`lib/paywall.ts`), and the two stand-in paywalls rendered at
   the partial on both emitters, node for node.

   THE STAND-INS ARE COMPARED HERE AND NOT IN `agreement.test.ts`, where the spec put them, for AD-1's reason: a core
   package's test may not read a file, and the stand-ins are files (`packages/library/fixtures/paywall/`). The comparison
   is the agreement suite's own — a skeleton of tags, classes and attribute NAMES, with the theme's `{{#if}}` blocks on the
   site's flags decided first — applied to the real designs rather than a copy of their markup. */

const REPO = join(import.meta.dirname, '..', '..')
// jsdom from the runtime package that declares it, as `tools/check-snapshots.mjs` takes it (the app carries no DOM)
const { JSDOM } = createRequire(join(REPO, 'packages', 'section-runtime', 'package.json'))('jsdom') as { JSDOM: new (html: string) => { window: { document: Document } } }
const doc = () => new JSDOM('<body></body>').window.document as unknown as Parameters<typeof renderCanvas>[0]
const SITE = 'Orbit Weekly'

test('every word is the spec\'s Design Notes table, written once (R-170)', () => {
  assert.equal(PAYWALL_WORDS.group, 'Template surfaces')
  assert.equal(PAYWALL_WORDS.chip, 'Not a page section')
  assert.equal(PAYWALL_WORDS.back, 'Back to post')
  assert.equal(`${PAYWALL_WORDS.showingLead} ${PAYWALL_WORDS.showing(false)}`, 'Showing: the cut only')
  assert.equal(`${PAYWALL_WORDS.showingLead} ${PAYWALL_WORDS.showing(true)}`, 'Showing: the whole post')
  assert.equal(PAYWALL_WORDS.context(false), 'The article above is context, not editable here')
  assert.equal(PAYWALL_WORDS.context(true), 'The article is context, not editable here')
  assert.equal(PAYWALL_WORDS.design(1, 2, 'Stand-in — centred'), 'Design 1 of 2 · Stand-in — centred')
  assert.equal(PAYWALL_WORDS.cut, 'Ghost cuts here · public preview marker')
  assert.equal(PAYWALL_WORDS.below, 'below this line never reaches the browser')
  assert.equal(PAYWALL_WORDS.gated, 'Gated content — shown with sample text')
  assert.equal(PAYWALL_WORDS.howHeading, 'How readers reach it')
  assert.equal(PAYWALL_WORDS.how, "Ghost cuts the post at the author's Public preview marker and renders this block in its place. You cannot move it.")
  assert.equal(PAYWALL_WORDS.tiers(5, 1), '5 tiers · 1 free')
  assert.equal(PAYWALL_WORDS.tiers(1, 1), '1 tier · 1 free')
  assert.equal(PAYWALL_WORDS.tiersLink, 'Tiers in Ghost admin →')
  assert.equal(PAYWALL_WORDS.panel, 'Paywall')
  assert.equal(PAYWALL_WORDS.untouched, "This is Ghost's own paywall — what your readers see today.")
  assert.equal(PAYWALL_WORDS.offChip, 'MEMBERS OFF')
  assert.equal(PAYWALL_WORDS.offTitle, 'Members are switched off')
  assert.equal(PAYWALL_WORDS.offStep1, 'In Ghost admin, open Settings → Membership and set Subscription access to anyone or invite-only')
  assert.equal(PAYWALL_WORDS.offStep2, 'Come back here — we re-check whenever you open this screen')
  assert.equal(PAYWALL_WORDS.openAdmin, 'Open Ghost admin')
  assert.equal(PAYWALL_WORDS.recheck, 'Re-check')
  assert.equal(PAYWALL_WORDS.rechecking, 'Re-checking…')
  assert.equal(PAYWALL_WORDS.offFoot, 'You can still work on your paywall with sample content — switch the canvas to Sample content below.')
  assert.equal(PAYWALL_WORDS.on(SITE), 'Members are on for Orbit Weekly.')
  assert.equal(PAYWALL_WORDS.stillOff(SITE), 'Members are still switched off for Orbit Weekly.')
  assert.equal(PAYWALL_WORDS.refused(SITE), 'Could not check Orbit Weekly just now.')
  // the table's "Open Ghost admin ↗": the words are C3b's button's, and the arrow is the Kit's new-tab glyph
  assert.equal(PAYWALL_WORDS.adminLink, PAYWALL_WORDS.openAdmin)
  assert.equal(PAYWALL_WORDS.ask(SITE), "Members are switched off on Orbit Weekly, so this section's sign-up form shows nothing there.")
})

test("R-198's sentence, as the recording corrected it: posts still stop at the cut and nobody can sign up — and no claim about Portal", () => {
  // MEASUREMENTS §54: with Subscription access set to Nobody on T3 (Stripe connected), the members post was still withheld
  // and its box still drawn, and `{{ghost_head}}` STILL loaded Portal — donations stay on — whose sign-up screen then says
  // memberships are unavailable. So the ruled clause "Ghost stops loading its sign-up window" was moved by the recording.
  const said = PAYWALL_WORDS.offBody(SITE)
  assert.equal(said, 'Members are switched off for Orbit Weekly — subscription access is set to Nobody — so your posts for members still stop at the cut, but nobody can sign up there.')
  assert.doesNotMatch(said, /stops loading/)
  // the recording this rests on: withheld, the box drawn, Portal still loaded, and the flags off
  const nobody = JSON.parse(readFileSync(join(REPO, 'packages', 'ghost-shim', 'fixtures', 'ghost5', 'members-long-nobody.json'), 'utf8')) as {
    head: { portal_script: boolean }; input: { admin_settings_nobody: Record<string, unknown> }
  }
  assert.equal(nobody.head.portal_script, true, 'Portal still loads with members off on a Stripe-connected site')
  assert.equal(nobody.input.admin_settings_nobody['members_signup_access'], 'none')
})

test('the Sites notice: one sentence per fact the record holds, and nothing for a site with no record yet', () => {
  assert.deepEqual(membersNotice(null, SITE), [])
  assert.deepEqual(membersNotice({ signup_access: 'all', paid_enabled: true }, SITE), [])
  assert.deepEqual(membersNotice({ signup_access: 'none', paid_enabled: false }, SITE), [
    'Members are switched off on Orbit Weekly — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone up.',
  ])
  assert.deepEqual(membersNotice({ signup_access: 'invite', paid_enabled: true }, SITE), ['Only people you invite can join Orbit Weekly, so free sign-up forms show nothing there.'])
  assert.deepEqual(membersNotice({ signup_access: 'paid', paid_enabled: true }, SITE), ['New members must pay to join Orbit Weekly, so free sign-up forms show nothing there.'])
  assert.deepEqual(membersNotice({ signup_access: 'all', paid_enabled: false }, SITE), [
    'Paid memberships are off on Orbit Weekly — Stripe is not connected — so paid sign-up buttons show nothing there.',
  ])
  // two facts, two sentences
  assert.equal(membersNotice({ signup_access: 'invite', paid_enabled: false }, SITE).length, 2)
  assert.ok(membersOff({ signup_access: 'none', paid_enabled: false }))
  assert.ok(!membersOff({ signup_access: 'invite', paid_enabled: false }) && !membersOff(null) && !membersOff(undefined))
})

test("Ghost admin's anchors, whatever the stored address ends with", () => {
  assert.equal(adminAt('https://ghost5.inflozo.com', 'members'), 'https://ghost5.inflozo.com/ghost/#/settings/members')
  assert.equal(adminAt('https://ghost6.inflozo.com/', 'tiers'), 'https://ghost6.inflozo.com/ghost/#/settings/tiers')
})

test('the tier line counts the PUBLIC tiers: the sample\'s, and T3\'s recorded ones with its hidden tier left out', () => {
  assert.equal(tierLine(orbitWeekly.tiers()), '5 tiers · 1 free')
  // MEASUREMENTS §54: T3's Content API answers three tiers — Free, "Ghost5" and the HIDDEN "Ghost5 Pro"
  const t3 = JSON.parse(readFileSync(join(REPO, 'packages', 'ghost-shim', 'fixtures', 'ghost5', 'members-long.json'), 'utf8')) as { input: { tiers: { visibility: string }[] } }
  assert.ok(t3.input.tiers.some((t) => t.visibility === 'none'), 'the recording holds the hidden tier this line must not count')
  assert.equal(tierLine(t3.input.tiers), '1 tier · 1 free')
})

test('the card\'s line follows the source in force: the site\'s tiers once read, nothing where a read failed, else the sample\'s', () => {
  const sample = orbitWeekly.tiers()
  const t3 = JSON.parse(readFileSync(join(REPO, 'packages', 'ghost-shim', 'fixtures', 'ghost5', 'members-long.json'), 'utf8')) as { input: { tiers: { visibility: string }[] } }
  // the site's content, its tiers read: the site's own line, never the sample's
  assert.equal(tierText({ rows: t3.input.tiers }, false, sample), '1 tier · 1 free')
  // the site's content, its tiers read FAILED (the I/O matrix's error column): the line is absent
  assert.equal(tierText({ rows: undefined }, false, sample), null)
  // the site was chosen and could not be read at all — the canvas shows the sample and the pill says why: absent too
  assert.equal(tierText(null, true, sample), null)
  // no site, or the pill on Sample content: the sample's own tiers
  assert.equal(tierText(null, false, sample), tierLine(sample))
})

test('a placed member ask warns on a members-off site; a synthesized one never does (FR-H6)', () => {
  const newsletter = pilot('a22/1')
  assert.ok(askOf(newsletter).length > 0, 'A22 #1 asks a visitor to join')
  const off = { signup_access: 'none', paid_enabled: false } as const
  assert.equal(askLine(off, SITE, newsletter, { instanceId: 'b1f0' }), PAYWALL_WORDS.ask(SITE))
  assert.equal(warnsOn({ instanceId: 'auto-home-3' }), false)
  assert.equal(askLine(off, SITE, newsletter, { instanceId: 'auto-home-3' }), null)
  // members on, no record yet, or a design that asks nothing: no line
  assert.equal(askLine({ signup_access: 'all', paid_enabled: true }, SITE, newsletter, { instanceId: 'b1f0' }), null)
  assert.equal(askLine(null, SITE, newsletter, { instanceId: 'b1f0' }), null)
  assert.equal(askLine(off, SITE, { html: '<section data-bg="base"><p>quiet</p></section>' }, { instanceId: 'b1f0' }), null)
})

/* ── the stand-ins at the partial, node for node ─────────────────────────────────────────────────────────────── */

const htmlSafe = (html: string) =>
  html.replace(/\{\{[#/][^}]*\}\}/g, '').replace(/\{\{else\}\}/g, '').replace(/\{\{[^}]*\}\}/g, 'X').replace(/^\s*[\r\n]/gm, '').trim()

function skeleton(html: string): string[] {
  const body = new JSDOM(`<body>${html}</body>`).window.document.body
  return [...body.querySelectorAll('*')].map((c) => {
    let depth = -1
    for (let p: Element | null = c; p !== null && p !== body; p = p.parentElement) depth++
    return `${'  '.repeat(depth)}${c.tagName.toLowerCase()}[${c.getAttribute('class') ?? ''}]{${[...c.attributes].map((a) => a.name).sort().join(',')}}`
  })
}

/** The theme's `{{#if f}}…{{else}}…{{/if}}` on each field in `truth`, replaced by the arm that field picks. */
function decide(text: string, truth: Readonly<Record<string, boolean>>): string {
  const re = /\{\{#if ([^}]*)\}\}|\{\{else\}\}|\{\{\/if\}\}/g
  const stack: { cond: string; yes: string; no: string; inElse: boolean }[] = []
  let out = ''
  let last = 0
  const emit = (t: string) => {
    const f = stack[stack.length - 1]
    if (f === undefined) out += t
    else if (f.inElse) f.no += t
    else f.yes += t
  }
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    emit(text.slice(last, m.index))
    last = re.lastIndex
    if (m[1] !== undefined) stack.push({ cond: m[1], yes: '', no: '', inElse: false })
    else if (m[0] === '{{else}}') {
      const f = stack[stack.length - 1]
      if (f === undefined) emit(m[0])
      else f.inElse = true
    } else {
      const f = stack.pop() as { cond: string; yes: string; no: string }
      emit(Object.hasOwn(truth, f.cond) ? (truth[f.cond] ? f.yes : f.no) : `{{#if ${f.cond}}}${f.yes}{{else}}${f.no}{{/if}}`)
    }
  }
  return out + text.slice(last)
}

/** The render input at the partial for one visitor, content and controls at their defaults — one row per query, as the
 *  agreement suite gives a repeat, so the canvas's rows and the theme's one `{{#foreach}}` body compare. */
function atPartial(entry: SectionRegistryEntry, visitor: Visitor): RenderInput {
  const ctx = orbitWeekly.templateContext(PAYWALL_TARGET, 'first', undefined, undefined, visitor)
  const getRows = Object.fromEntries(Object.entries(entry.dataBindings ?? {}).map(([key, b]) => [key, orbitWeekly.resolveSource(b).slice(0, 1)]))
  return {
    target: PAYWALL_TARGET, content: defaultContent(entry.contentSchema), schema: entry.contentSchema, controlSchema: entry.controlSchema,
    universals: entry.universals, controls: {}, dataBindings: entry.dataBindings, getRows, icons: iconDrawing, ghost: ctx.ghost, site: ctx.site,
    member: visitor,
  }
}

test('both stand-ins validate, are paywall designs, form one ring, and agree on both emitters at the partial for every visitor', () => {
  const standIns = paywallSamples()
  assert.equal(standIns.length, 2, 'R-158: two stand-ins, so ◀ ▶ has somewhere to go')
  // `paywallSamples` validates each LOUDLY (`paywall-target`, `member-ask-ungated` and `tiers-unfiltered` included)
  for (const e of standIns) assert.ok(isPaywallDesign(e), e.id)
  assert.deepEqual(paywallRing(standIns).map((e) => e.id), standIns.map((e) => e.id))
  const flags = orbitWeekly.site() as Record<string, unknown>
  const truth = { '@site.allow_self_signup': flags['allow_self_signup'] === true, '@site.paid_members_enabled': flags['paid_members_enabled'] === true }
  for (const e of standIns) {
    for (const visitor of ['anonymous', 'free', 'paid'] as const) {
      const input = atPartial(e, visitor)
      const canvas = renderCanvas(doc(), e.html, input)
      const theme = renderTheme(doc(), e.html, input).template
      const a = skeleton(htmlSafe(canvas))
      const b = skeleton(htmlSafe(decide(theme, truth)))
      assert.deepEqual(a, b, `${e.id} as ${visitor}: RENDERERS DISAGREE\n  canvas:\n${a.join('\n')}\n  theme, decided:\n${b.join('\n')}`)
      // R-4 in the emitted theme: the free ask behind its own flag
      assert.match(theme, /\{\{#if @site\.allow_self_signup\}\}[^]*data-portal="signup"/, `${e.id}: the ask is not behind its flag`)
    }
  }
  // the second stand-in's plans are Ghost's public paid tiers, never the hidden or the free one (FR-H6)
  const theme = renderTheme(doc(), standIns[1]!.html, atPartial(standIns[1]!, 'anonymous')).template
  assert.match(theme, /\{\{#get "tiers" filter="type:paid\+visibility:public"/, theme)
  assert.match(theme, /\{\{#if @site\.paid_members_enabled\}\}[^]*\{\{#get "tiers"/, 'the plans sit behind the paid flag')
})
