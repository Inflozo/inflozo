import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import type { MarkNode } from '@inflozo/section-runtime'
import { CANVASES, isSurface, type CanvasKey } from './lib/editor.ts'
import {
  ANNOUNCEMENT_CSS, AUDIENCE, announcementFor, buttonMarkup, CLOSE_SVG, FRAME, GHOST_ACCENT, PORTAL_CSS, PORTAL_FONT, PORTAL_GLOBALS,
  PORTAL_MIN_WIDTH, portalFor, SHEET, shimsOn, stripMarkup, SURFACE, TRIGGER_CSS, userIcon, type ButtonLook,
} from './lib/ghost-surfaces.ts'
import type { EditorSite } from './lib/live-content.ts'
import { PORTAL_STYLES, storedSurfaces, type Members, type Surfaces } from './lib/probe-rule.ts'
import { VISITORS, type Visitor } from './lib/view-as.ts'

/* Story 5.21 — Ghost's two surfaces on the canvas, the pure half (`lib/ghost-surfaces.ts`): §46(c)'s audience table, every
   row of the spec's I/O matrix that is a rule, the hostile announcement as an AD-36-shaped vector list, and every constant
   held to what Ghost itself put on the page on both majors (MEASUREMENTS §55, `surfaces.json`). The DOM write is the
   editor's few lines, walked by `pnpm keyboard` and the deployed walks; nothing here is a pixel.

   THE VISITORS AND THE STYLES ARE NEVER WRITTEN DOWN: they are asked of `VISITORS` and `PORTAL_STYLES` (standing rule 4). */

const REPO = join(import.meta.dirname, '..', '..')
// jsdom from the runtime package that declares it, as `paywall.test.ts` takes it (the app carries no DOM)
type Win = { document: Document; DOMParser: typeof DOMParser; __pwned?: unknown }
const { JSDOM } = createRequire(join(REPO, 'packages', 'section-runtime', 'package.json'))('jsdom') as { JSDOM: new (html: string) => { window: Win } }
const win = new JSDOM('<body></body>').window
/** the editor's parse, over jsdom's: `DOMParser`'s document runs nothing and loads nothing */
const parse = (html: string) => new win.DOMParser().parseFromString(html, 'text/html').body as unknown as MarkNode
/** a shim's markup, read back as a DOM — what the canvas would hold */
const dom = (html: string) => {
  const body = new win.DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
  return body
}

type Recording = {
  settings: Record<string, unknown>
  announcement: { style: string; at: Record<string, { index: number; bar_box: { height: number }; close_svg: string; computed: { font_family: string }; body_font: string }> }
  portal: {
    frame_style: string
    off: Record<string, { trigger: boolean }>
    styles: Record<string, Record<string, { trigger: boolean; iframe?: { style: string; box: { width: number; height: number } }; icon?: { html: string } | null; label?: { text: string; font_family: string; font_size: string } | null; button_class?: string }>>
  }
  cleared: { script: boolean; root: boolean }
}
const MAJORS = ['5', '6'] as const
const recording = (m: '5' | '6') => JSON.parse(readFileSync(join(REPO, 'packages', 'ghost-shim', 'fixtures', `ghost${m}`, 'surfaces.json'), 'utf8')) as Recording
const [ANON, FREE, PAID] = VISITORS as [Visitor, Visitor, Visitor]

/** The fixture the recorder found on both servers — item 21's bar — and the button switched on, as the matrix's first row. */
const FIXTURE = '<p>Fixture announcement — seeded for VERIFY 21.</p>'
const surfaces = (over: { content?: string; background?: string; visibility?: string[]; button?: boolean; style?: string; label?: string; accent?: string | null } = {}): Surfaces =>
  storedSurfaces({
    announcement: { content: over.content ?? FIXTURE, background: over.background ?? 'accent', visibility: JSON.stringify(over.visibility ?? ['visitors']) },
    portal_button: over.button ?? true,
    portal_button_source: 'probe',
    portal_button_style: over.style ?? 'icon-and-text',
    portal_button_signup_text: over.label ?? 'Subscribe',
    brand: { accent: over.accent === undefined ? '#3832e5' : over.accent, nav: [] },
  })
const ON: Members = { signup_access: 'all', paid_enabled: true }

test('§46(c): the strip follows the audience list — each visitor sees it exactly when its own word is in the list, and an empty list shows it to nobody', () => {
  const words = Object.values(AUDIENCE)
  assert.deepEqual([...words].sort(), ['free_members', 'paid_members', 'visitors'], 'Ghost\'s three audience words, one per visitor')
  // every subset of the three words, against every visitor
  for (let mask = 0; mask < 1 << words.length; mask++) {
    const list = words.filter((_, i) => mask & (1 << i))
    for (const v of VISITORS) {
      const shown = announcementFor(surfaces({ visibility: list }), v, parse) !== null
      assert.equal(shown, list.includes(AUDIENCE[v]), `${JSON.stringify(list)} · ${v}`)
    }
  }
  // Ghost's own mapping (`announcement-bar-settings.js`): no member → visitors, status free → free_members, any other → paid
  assert.equal(AUDIENCE[ANON], 'visitors')
  assert.equal(AUDIENCE[FREE], 'free_members')
  assert.equal(AUDIENCE[PAID], 'paid_members')
})

test('matrix: a connected site with a bar and the button — the strip in the site\'s accent with the ✕, and Portal\'s button with the person icon and "Subscribe"', () => {
  const s = surfaces()
  const a = announcementFor(s, ANON, parse)
  assert.ok(a !== null)
  assert.equal(a.background, 'accent')
  assert.equal(a.words.text, 'Fixture announcement — seeded for VERIFY 21.')
  const strip = stripMarkup(a, s.accent)
  const bar = dom(strip.html).querySelector('.gh-announcement-bar')
  assert.ok(bar !== null)
  assert.equal(bar.className, 'gh-announcement-bar accent')
  assert.equal(bar.querySelector('.gh-announcement-bar-content')?.textContent, 'Fixture announcement — seeded for VERIFY 21.')
  assert.equal(bar.querySelector('button')?.getAttribute('aria-label'), 'close')
  assert.equal(bar.querySelector('button')?.innerHTML, CLOSE_SVG)
  // the accent is the snapshot's, on the strip itself — never on `:root`
  assert.match(strip.attributes.style ?? '', /^--ghost-accent-color:#3832e5;/)
  const look = portalFor(s, ON, ANON)
  assert.deepEqual(look, { member: false, icon: 26, label: 'Subscribe' })
  const button = dom(buttonMarkup(look as ButtonLook, s.accent).html)
  assert.equal(button.querySelector('.gh-portal-triggerbtn-container')?.className, 'gh-portal-triggerbtn-container with-label')
  assert.equal(button.querySelector('.gh-portal-triggerbtn-label')?.textContent, ' Subscribe ')
  assert.equal(button.querySelector('svg')?.getAttribute('style'), 'width: 26px; height: 26px; color: rgb(255, 255, 255);')
  assert.match(button.querySelector('.gh-portal-triggerbtn-iframe')?.getAttribute('style') ?? '', /--brandcolor:#3832e5;padding-right:2px/)
})

test('matrix: View as — a free member meets no strip (logged-out only) and the member circle; a paid member sees a bar set for paid members', () => {
  const s = surfaces()
  assert.equal(announcementFor(s, FREE, parse), null)
  for (const member of [FREE, PAID]) {
    assert.deepEqual(portalFor(s, ON, member), { member: true, icon: 34, label: null }, member)
    const button = dom(buttonMarkup(portalFor(s, ON, member) as ButtonLook, s.accent).html)
    // Portal's member look: a 60px circle, the halo ring, no label, the person icon at 34px, the frame 105px wide
    assert.equal(button.querySelector('.gh-portal-triggerbtn-container')?.className, 'gh-portal-triggerbtn-container halo')
    assert.equal(button.querySelector('.gh-portal-triggerbtn-label'), null)
    assert.equal(button.querySelector('svg')?.outerHTML, userIcon(34))
    assert.match(button.querySelector('.gh-portal-triggerbtn-iframe')?.getAttribute('style') ?? '', /width:105px/)
  }
  // a comped or gift member previews as Paid (`lib/view-as.ts`), so the paid list reaches them
  assert.ok(announcementFor(surfaces({ visibility: ['paid_members'] }), PAID, parse) !== null)
  assert.equal(announcementFor(surfaces({ visibility: ['paid_members'] }), ANON, parse), null)
})

test('matrix: nothing to show — the list empty, the content empty, or content without a word — draws no strip', () => {
  assert.equal(announcementFor(surfaces({ visibility: [] }), ANON, parse), null)
  for (const content of ['', '   ', '<p></p>', '<p> </p>', '<br>', '<img src="x">', '<script>x()</script>', '<style>p{}</style>']) {
    assert.equal(announcementFor(surfaces({ content }), ANON, parse), null, JSON.stringify(content))
  }
  // the control: the same lists with words draw one
  assert.ok(announcementFor(surfaces({ content: '<p>Hi</p>' }), ANON, parse) !== null)
})

test('matrix: the button off, or members switched off, draws no button — a site with no members record is not checked', () => {
  assert.equal(portalFor(surfaces({ button: false }), ON, ANON), null)
  assert.equal(portalFor(surfaces(), { signup_access: 'none', paid_enabled: false }, ANON), null)
  for (const v of VISITORS) assert.equal(portalFor(surfaces(), { signup_access: 'none', paid_enabled: false }, v), null, v)
  // invite-only and paid-only sites still sign in (Portal's `isSigninAllowed` is `!== 'none'`)
  for (const access of ['all', 'paid', 'invite'] as const) assert.ok(portalFor(surfaces(), { signup_access: access, paid_enabled: true }, ANON) !== null, access)
  assert.ok(portalFor(surfaces(), null, ANON) !== null, 'no record: not checked')
  // a snapshot whose Portal answer was assumed or declared is drawn per the stored value
  assert.equal(storedSurfaces({ portal_button: true, portal_button_source: 'default' }).portal.button, true)
  assert.equal(storedSurfaces({ portal_button: false, portal_button_source: 'declared' }).portal.button, false)
})

test('matrix: Portal\'s three styles, and an empty label — the label alone, a 60px circle, the icon beside the label, or the icon alone', () => {
  const at = (style: string, label = 'Subscribe') => portalFor(surfaces({ style, label }), ON, ANON)
  assert.deepEqual(PORTAL_STYLES.map((s) => [s, at(s)]), [
    ['icon-and-text', { member: false, icon: 26, label: 'Subscribe' }],
    ['icon-only', { member: false, icon: 34, label: null }],
    ['text-only', { member: false, icon: null, label: 'Subscribe' }],
  ])
  // an empty label draws none, as Portal does: icon-and-text becomes the icon alone, 34px in a 105px frame
  assert.deepEqual(at('icon-and-text', ''), { member: false, icon: 34, label: null })
  // …and text-only with no label is Portal's empty 60px circle — no icon, no words
  assert.deepEqual(at('text-only', ''), { member: false, icon: null, label: null })
  const circle = dom(buttonMarkup(at('text-only', '') as ButtonLook, null).html)
  assert.equal(circle.querySelector('.gh-portal-triggerbtn-container')?.innerHTML, '')
  // text only: no icon, the label
  const text = dom(buttonMarkup(at('text-only') as ButtonLook, null).html)
  assert.equal(text.querySelector('svg'), null)
  assert.equal(text.querySelector('.gh-portal-triggerbtn-label')?.textContent, ' Subscribe ')
})

test('matrix: an unknown background is Ghost\'s default, dark; Ghost\'s three are kept', () => {
  assert.equal(announcementFor(surfaces({ background: 'neon' }), ANON, parse)?.background, 'dark')
  assert.equal(announcementFor(surfaces({ background: '' }), ANON, parse)?.background, 'dark')
  for (const bg of ['accent', 'dark', 'light']) assert.equal(announcementFor(surfaces({ background: bg }), ANON, parse)?.background, bg)
})

test('matrix: where they draw — every page canvas of a connected site whatever the pill shows, never the Paywall, never without a connection', () => {
  const site = (s: Surfaces | undefined): EditorSite => ({ title: 'Ghost6', origin: 'https://ghost6.example', key: 'k', ...(s ? { surfaces: s } : {}) })
  for (const key of Object.keys(CANVASES) as CanvasKey[]) {
    assert.equal(shimsOn(key, site(surfaces())), !isSurface(key), `${key}: drawn on a page canvas, never on a template surface`)
  }
  assert.equal(shimsOn('paywall', site(surfaces())), false)
  // no connection: an unlinked project, and a disconnected site (`read.ts` hands it no snapshot)
  assert.equal(shimsOn('home', null), false)
  assert.equal(shimsOn('home', site(undefined)), false)
  assert.equal(shimsOn('home', { title: 'Gone', unreadable: 'disconnected' }), false)
  // a connected site the browser cannot read (no key, plain http) still draws: the snapshot is the connection's
  assert.equal(shimsOn('home', { title: 'Keyless', unreadable: 'no_key', surfaces: surfaces() }), true)
})

test('AD-36-shaped: a hostile announcement reaches the canvas as its words, bold, italic and safe links only — nothing runs and nothing loads', () => {
  const vectors = [
    '<script>window.__pwned=1</script>',
    '<img src="/x" onerror="window.__pwned=2">',
    '<a href="javascript:window.__pwned=3">bad</a>',
    '<span style="position:fixed;inset:0;background:red">styled</span>',
    '<p onclick="window.__pwned=4">clicked</p>',
    '<svg onload="window.__pwned=5"><circle r="1"/></svg>',
    '<iframe src="https://evil.example/"></iframe>',
    '<style>body{display:none}</style>',
    '<a href="data:text/html,<script>alert(1)</script>">data</a>',
    '<form action="https://evil.example/"><input name="x"></form>',
    '{{ghost_head}} {{{content}}}',
  ]
  const legit = '<p><b>Bold</b> <strong>strong</strong> <i>it</i> <em>em</em> <u>under</u> <a href="https://ghost.org/">ok</a> <a href="mailto:a@b.co">mail</a></p>'
  const s = surfaces({ content: `${legit}${vectors.join('')}` })
  const a = announcementFor(s, ANON, parse)
  assert.ok(a !== null)
  assert.equal(win.__pwned, undefined, 'the inert parse ran something')
  const { html } = stripMarkup(a, s.accent)
  // only the bar's own elements and Ghost's three marks — never a script, an image, a frame, a form, a style or a handler
  assert.doesNotMatch(html, /<script|<img|<iframe|<form|<input|<span|<p[ >]|<u>|style=|onerror|onclick|onload|javascript:|data:text/i)
  const content = dom(html).querySelector('.gh-announcement-bar-content') as Element
  const tags = [...content.querySelectorAll('*')].map((e) => e.tagName.toLowerCase())
  assert.deepEqual([...new Set(tags)].sort(), ['a', 'em', 'strong'], `unexpected elements: ${tags.join(', ')}`)
  // …and the legitimate case still works: every word printed, the three marks, and the safe links with their hrefs
  assert.deepEqual([...content.querySelectorAll('a')].map((e) => e.getAttribute('href')), ['https://ghost.org/', 'mailto:a@b.co'])
  assert.deepEqual([...content.querySelectorAll('strong')].map((e) => e.textContent), ['Bold', 'strong'])
  assert.deepEqual([...content.querySelectorAll('em')].map((e) => e.textContent), ['it', 'em'])
  for (const words of ['under', 'bad', 'styled', 'clicked', 'data']) assert.ok(content.textContent?.includes(words), `"${words}" was not printed as words`)
  // braces are text on the canvas: escaped, never a live expression
  assert.ok(content.textContent?.includes('{{ghost_head}} {{{content}}}'), content.textContent ?? '')
  assert.doesNotMatch(html, /\{\{/)
  // the stored HTML never reaches the markup as it was stored
  assert.ok(!html.includes(legit) && !html.includes(vectors[0] as string))
})

test('the two roots: `data-ghost-surface` and inert, pointer-events none — never a data-inflozo-* or a data-module, and the strip\'s sheet is not marked as a surface', () => {
  const s = surfaces()
  const strip = stripMarkup(announcementFor(s, ANON, parse) as NonNullable<ReturnType<typeof announcementFor>>, s.accent)
  const button = buttonMarkup(portalFor(s, ON, ANON) as ButtonLook, s.accent)
  assert.equal(strip.attributes['data-ghost-surface'], SURFACE.strip)
  assert.equal(button.attributes['data-ghost-surface'], SURFACE.button)
  assert.deepEqual(SURFACE, { strip: 'announcement-bar', button: 'portal-button' })
  for (const shim of [strip, button]) {
    assert.equal(shim.attributes.inert, '')
    assert.match(shim.attributes.style ?? '', /pointer-events:none;user-select:none/)
    const every = [...Object.keys(shim.attributes), ...shim.html.matchAll(/\s([a-z-]+)=/g)].map((k) => (typeof k === 'string' ? k : (k[1] as string)))
    assert.ok(!every.some((k) => k.startsWith('data-inflozo-') || k === 'data-module'), `a shim carries ${every.filter((k) => k.startsWith('data-'))}`)
  }
  // Ghost's own roots' ids; the button's host keeps the theme out, as Portal's iframe does
  assert.equal(strip.attributes.id, 'announcement-bar-root')
  assert.equal(button.attributes.id, 'ghost-portal-root')
  assert.match(button.attributes.style ?? '', /^all:initial;/)
  assert.notEqual(SHEET, 'data-ghost-surface')
  // the accent is validated before it reaches CSS, and Ghost's own default stands in for none
  assert.match(stripMarkup({ background: 'dark', words: { text: 'x' } }, 'red;}body{display:none').attributes.style ?? '', new RegExp(`--ghost-accent-color:${GHOST_ACCENT};`))
  assert.match(buttonMarkup({ member: true, icon: 34, label: null }, null).html, new RegExp(`--brandcolor:${GHOST_ACCENT};`))
})

test('a label is text: markup in a signup label is escaped, never parsed', () => {
  const html = buttonMarkup({ member: false, icon: 26, label: '<img src=x onerror=alert(1)>Join' }, null).html
  assert.doesNotMatch(html, /<img/)
  assert.equal(dom(html).querySelector('.gh-portal-triggerbtn-label')?.textContent, ' <img src=x onerror=alert(1)>Join ')
})

// ── every constant, held to what Ghost itself put on the page — both majors (MEASUREMENTS §55) ─────────────────────────

const squeeze = (css: string) => css.replace(/\s+/g, '')

test('§55: the strip\'s stylesheet, close icon and rules are Ghost\'s own, verbatim, on both majors', () => {
  for (const m of MAJORS) {
    const r = recording(m)
    assert.equal(ANNOUNCEMENT_CSS, r.announcement.style, `ghost${m}: the bar's stylesheet is not the one Ghost's script appended`)
    for (const [device, at] of Object.entries(r.announcement.at)) {
      assert.equal(at.close_svg, CLOSE_SVG, `ghost${m} ${device}: the close icon`)
      // the placement rule: the bar root is the body's FIRST child, so the strip is too
      assert.equal(at.index, 0, `ghost${m} ${device}: Ghost's root is not the body's first child`)
      // no font of its own: the bar inherits the page's body font, which the strip's root stands in for
      assert.equal(at.computed.font_family, at.body_font, `ghost${m} ${device}: the bar does not inherit the body font`)
    }
    // a one-line bar at 1440 is 48px tall — the min-height the sheet sets
    assert.equal(Math.round(r.announcement.at['1440x900']?.bar_box.height ?? 0), 48)
    assert.match(ANNOUNCEMENT_CSS, /min-height:48px/)
    // the cleared bar: with the audience emptied Ghost injects no script and no root — which is `announcementFor`'s rule
    assert.deepEqual({ script: r.cleared.script, root: r.cleared.root }, { script: false, root: false })
  }
})

test('§55: the button\'s rules, icon, frame and font are Portal\'s own on both majors, and Portal draws nothing below 640px', () => {
  for (const m of MAJORS) {
    const r = recording(m)
    const frame = squeeze(r.portal.frame_style)
    // Portal's own rules, verbatim but for whitespace (2.51.5 and 2.69.339 differ by two blank lines)
    assert.ok(frame.includes(squeeze(TRIGGER_CSS)), `ghost${m}: the trigger rules are not Portal's`)
    for (const rule of PORTAL_GLOBALS) assert.ok(frame.includes(squeeze(rule)), `ghost${m}: ${rule} is not Portal's`)
    assert.ok(PORTAL_CSS.includes(TRIGGER_CSS) && PORTAL_GLOBALS.every((rule) => PORTAL_CSS.includes(rule)), 'the shadow sheet carries them')
    for (const style of PORTAL_STYLES) {
      const loads = r.portal.styles[style] ?? {}
      for (const [device, load] of Object.entries(loads)) {
        const wide = Number(device.split('x')[0]) >= PORTAL_MIN_WIDTH
        assert.equal(load.trigger, wide, `ghost${m} ${style} ${device}: a trigger ${load.trigger ? 'drawn' : 'missing'} — Portal's 640px rule`)
        if (!load.trigger || !load.iframe) continue
        // the frame's box: fixed bottom-right, 98px tall, at most 500px, above almost everything
        const inline = Object.fromEntries(load.iframe.style.split(';').map((d) => d.split(':').map((x) => x.trim())).filter((d) => d.length === 2))
        assert.equal(inline['z-index'], String(FRAME.zIndex))
        assert.equal(inline['position'], 'fixed')
        assert.equal(inline['bottom'], '0px')
        assert.equal(inline['right'], '0px')
        assert.equal(inline['height'], `${FRAME.height}px`)
        assert.equal(inline['max-width'], `${FRAME.maxWidth}px`)
        // 105px with no label; with one, the measured wrapper + 2
        const look = portalFor(surfaces({ style, label: String(r.settings.portal_button_signup_text) }), ON, ANON) as ButtonLook
        if (look.label === null) assert.equal(inline['width'], `${FRAME.narrow}px`)
        // the icon Portal drew, byte for byte, at the size this look asks for
        if (look.icon === null) assert.equal(load.icon ?? null, null, `ghost${m} ${style}: an icon Portal did not draw`)
        else assert.equal(load.icon?.html, userIcon(look.icon), `ghost${m} ${style}: the icon`)
        // the label: the stored words between Portal's two spaces, in Portal's body font at 16px
        if (look.label === null) assert.equal(load.label ?? null, null)
        else {
          assert.equal(load.label?.text, ` ${look.label} `)
          assert.equal(load.label?.font_family, PORTAL_FONT)
          assert.equal(load.label?.font_size, '16px')
        }
        assert.equal(load.button_class, look.label !== null ? 'gh-portal-triggerbtn-container with-label' : 'gh-portal-triggerbtn-container ')
      }
    }
    // the control: with the button off Portal draws no trigger at any device
    assert.ok(Object.values(r.portal.off).every((o) => o.trigger === false))
    // the 640px rule is a media query in the shadow sheet — a device change needs no repaint
    assert.ok(PORTAL_CSS.includes(`@media (width < ${PORTAL_MIN_WIDTH}px){.gh-portal-triggerbtn-iframe{display:none}}`))
  }
})
