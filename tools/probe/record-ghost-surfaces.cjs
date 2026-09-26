#!/usr/bin/env node
/**
 * STORY 5.21 — AD-23's RECORDER FOR GHOST'S TWO SURFACES ON A PAGE: the announcement bar `{{ghost_head}}` injects above
 * everything the theme renders, and Portal's floating button in the bottom-right corner (MEASUREMENTS §55). Every number
 * the editor's two shims use stands on what this writes, and it runs BEFORE the shims are written (standing rule 1).
 *
 *   env $(grep -E '^(GHOST5_URL|GHOST5_STAFF_ACCESS_TOKEN|GHOST6_URL|GHOST6_STAFF_ACCESS_TOKEN)=' tools/probe/.env | xargs) \
 *     node tools/probe/record-ghost-surfaces.cjs            # both majors (T3 5.x, then T1 6.x)
 *   … MAJORS=6 node tools/probe/record-ghost-surfaces.cjs   # one
 *
 * THIS HEADER IS ITS HELP. It reads no flag at all, so `--help` RUNS IT — and a run writes to both servers (below). Node
 * 24; it drives `@playwright/test`'s own chromium, as the walks do.
 *
 * WHAT IT WRITES TO THE SERVERS, with the STAFF token, and nothing else — each put back in a `finally` and READ BACK:
 *   - `portal_button` switched ON for the Portal recordings (Ghost's default is off, and both test servers have it off);
 *   - `portal_button_style` stepped through Ghost's three values, `icon-and-text`, `icon-only`, `text-only`;
 *   - `announcement_visibility` set to `[]` for the "cleared" recording.
 * The announcement's words, its background and every other setting are only READ. It creates, edits and deletes no post,
 * no member and no theme. It REFUSES TO START unless the bar is the fixture `run-verify-all.py` item 21 left — words, and
 * the logged-out visitor in its audience — because the recording is of THAT bar, as it stands.
 *
 * WHAT IT READS, anonymously, in chromium, at the editor's three devices (1440 × 900, 834 × 1112, 390 × 844), a fresh
 * browser context per page so no dismissal is remembered (Ghost keeps the bar's ✕ in sessionStorage):
 *   - THE BAR as it stands: `#announcement-bar-root`'s index among the body's children; the verbatim `<style>` Ghost's
 *     script appended to `<head>`; the bar's box, its close button's box, its words' box, and the computed background,
 *     colour, font, line height and padding; and — the control — no Portal trigger while `portal_button` is off.
 *   - PORTAL, switched on, per style: `#ghost-portal-root`'s place; the trigger iframe's inline style and box; inside it,
 *     the button's box and its computed height, radius, background and shadow, the label's font and box, the icon's
 *     box, and the frame's own `<style>` verbatim; and — the control — NO trigger at 390, beside the one at 834.
 *   - THE BAR CLEARED (`announcement_visibility` `[]`): whether `{{ghost_head}}` still injects the script, and whether any
 *     bar root exists.
 *
 * WHAT IT WRITES HERE: `packages/ghost-shim/fixtures/ghost{5,6}/surfaces.json`, each with its capture date, this command
 * and the Ghost version it came off. `record-shim.py`'s index generator imports only its OWN recordings, so this file
 * never joins `RECORDINGS`; `apps/web/ghost-surfaces.test.ts` reads it directly.
 *
 * THE SPEC'S "ASK FIRST" FINDINGS ARE PRINTED EITHER WAY, and any that goes against the plan exits 3 after the servers are
 * restored and the recording is written: the bar root NOT the body's first child; a one-line bar at 1440 NOT 48px tall;
 * a trigger drawn below 640px; the script still injected with the audience emptied.
 *
 * NO KEY IS EVER PRINTED: the staff token signs a short-lived JWT and is never logged, and nothing it reads carries one.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { chromium } = require('@playwright/test')

const MAJORS = (process.env.MAJORS || '5,6').split(',').map((m) => m.trim()).filter((m) => m === '5' || m === '6')
for (const m of MAJORS) {
  for (const key of [`GHOST${m}_URL`, `GHOST${m}_STAFF_ACCESS_TOKEN`]) {
    if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
  }
}
const REPO = path.join(__dirname, '..', '..')
const FIXTURES = path.join(REPO, 'packages', 'ghost-shim', 'fixtures')
const COMMAND = 'node tools/probe/record-ghost-surfaces.cjs'
/** R-137's three devices — `apps/web/lib/device.ts`'s table, restated here because this file must run with no build */
const DEVICES = [[1440, 900], [834, 1112], [390, 844]]
const STYLES = ['icon-and-text', 'icon-only', 'text-only']
const SECRETS = MAJORS.map((m) => process.env[`GHOST${m}_STAFF_ACCESS_TOKEN`])
const clean = (s) => SECRETS.reduce((t, k) => t.split(k).join('<token>'), String(s))

/** Ghost's Admin API with the STAFF token: a short-lived JWT signed as Ghost expects, never printed. */
const ghost = (m) => {
  const origin = new URL(process.env[`GHOST${m}_URL`]).origin
  const jwt = () => {
    const [kid, secret] = process.env[`GHOST${m}_STAFF_ACCESS_TOKEN`].split(':')
    const part = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const unsigned = `${part({ alg: 'HS256', typ: 'JWT', kid })}.${part({ iat: now, exp: now + 300, aud: '/admin/' })}`
    return `${unsigned}.${crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(unsigned).digest('base64url')}`
  }
  const api = async (method, resource, body) => {
    const r = await fetch(`${origin}/ghost/api/admin/${resource}`, {
      method,
      headers: { Authorization: `Ghost ${jwt()}`, 'Accept-Version': `v${m}.0`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!r.ok) throw new Error(`${origin} admin ${method} ${resource} answered HTTP ${r.status}`)
    return r.json()
  }
  const settings = async () => Object.fromEntries((await api('GET', 'settings/')).settings.map((s) => [s.key, s.value]))
  const put = (pairs) => api('PUT', 'settings/', { settings: Object.entries(pairs).map(([key, value]) => ({ key, value })) })
  return { origin, api, settings, put, name: m === '5' ? 'T3' : 'T1' }
}

/** The bar as the page has it, read in the page. */
const readBar = () => {
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
  const kids = [...document.body.children]
  const root = document.getElementById('announcement-bar-root')
  const bar = root?.querySelector('.gh-announcement-bar') ?? null
  const close = bar?.querySelector('button') ?? null
  const words = bar?.querySelector('.gh-announcement-bar-content') ?? null
  const cs = bar ? getComputedStyle(bar) : null
  const sheets = [...document.head.querySelectorAll('style')]
  const style = sheets.find((s) => s.textContent.includes('.gh-announcement-bar')) ?? null
  const script = document.querySelector('script[data-announcement-bar]')
  return {
    root: root !== null,
    index: root ? kids.indexOf(root) : null,
    body_children: kids.length,
    children: kids.map((k) => `${k.tagName.toLowerCase()}${k.id ? `#${k.id}` : ''}`),
    body_font: getComputedStyle(document.body).fontFamily,
    root_box: box(root),
    bar_class: bar?.className ?? null,
    bar_box: box(bar),
    close_box: box(close),
    close_label: close?.getAttribute('aria-label') ?? null,
    close_svg: close?.innerHTML ?? null,
    words_box: box(words),
    words_html: words?.innerHTML ?? null,
    computed: cs && {
      background_color: cs.backgroundColor, color: cs.color, font_family: cs.fontFamily, font_size: cs.fontSize,
      font_weight: cs.fontWeight, line_height: cs.lineHeight, padding: cs.padding, min_height: cs.minHeight,
      z_index: cs.zIndex, position: cs.position, display: cs.display, text_align: cs.textAlign,
    },
    close_computed: close && ((c) => ({ color: c.color, width: c.width, height: c.height, right: c.right, top: c.top, margin_top: c.marginTop }))(getComputedStyle(close)),
    svg_box: box(close?.querySelector('svg') ?? null),
    style_text: style?.textContent ?? null,
    style_is_last_in_head: style !== null && [...document.head.children].pop() === style,
    root_accent: getComputedStyle(document.documentElement).getPropertyValue('--ghost-accent-color').trim(),
    script: script && { src: script.getAttribute('src'), attributes: Object.fromEntries([...script.attributes].map((a) => [a.name, a.value])) },
    portal_root: ((p) => (p ? { index: kids.indexOf(p), last: kids[kids.length - 1] === p } : null))(document.getElementById('ghost-portal-root')),
    trigger: document.querySelector('iframe[title="portal-trigger"]') !== null,
  }
}

/** Portal's trigger as the page has it: the iframe in the page, and inside it the button. */
async function readTrigger(page) {
  const outer = await page.evaluate(() => {
    const kids = [...document.body.children]
    const root = document.getElementById('ghost-portal-root')
    const frame = document.querySelector('iframe[title="portal-trigger"]')
    const r = frame?.getBoundingClientRect()
    return {
      portal_root: root ? { index: kids.indexOf(root), last: kids[kids.length - 1] === root, count: kids.length } : null,
      children: kids.map((k) => `${k.tagName.toLowerCase()}${k.id ? `#${k.id}` : ''}`),
      iframe: frame && {
        style: frame.getAttribute('style'), class: frame.getAttribute('class'), title: frame.getAttribute('title'),
        testid: frame.getAttribute('data-testid'), box: { x: r.x, y: r.y, width: r.width, height: r.height },
        parent_is_root: frame.parentElement === root,
      },
    }
  })
  if (!outer.iframe) return { ...outer, trigger: false }
  const frame = await (await page.locator('iframe[title="portal-trigger"]').elementHandle()).contentFrame()
  await frame.waitForSelector('.gh-portal-triggerbtn-container', { timeout: 15000 })
  // Portal measures the wrapper and resizes the frame a render later: let it settle
  await page.waitForTimeout(600)
  const inner = await frame.evaluate(() => {
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
    const wrapper = document.querySelector('.gh-portal-triggerbtn-wrapper')
    const button = document.querySelector('.gh-portal-triggerbtn-container')
    const label = button?.querySelector('.gh-portal-triggerbtn-label') ?? null
    const icon = button?.querySelector('svg, img') ?? null
    const bc = getComputedStyle(button)
    const lc = label ? getComputedStyle(label) : null
    return {
      wrapper_box: box(wrapper), wrapper_padding: wrapper ? getComputedStyle(wrapper).padding : null,
      button_class: button.className, button_box: box(button),
      button: { height: bc.height, min_width: bc.minWidth, border_radius: bc.borderRadius, background_color: bc.backgroundColor, box_shadow: bc.boxShadow, padding: bc.padding },
      halo: getComputedStyle(button, '::before').borderTopWidth,
      label: label && { text: label.textContent, box: box(label), font_family: lc.fontFamily, font_size: lc.fontSize, font_weight: lc.fontWeight, line_height: lc.lineHeight, color: lc.color, padding: lc.padding, white_space: lc.whiteSpace, max_width: lc.maxWidth },
      icon: icon && { tag: icon.tagName.toLowerCase(), box: box(icon), style: icon.getAttribute('style'), html: icon.outerHTML },
      frame_style_text: [...document.head.querySelectorAll('style')].map((s) => s.textContent).join('\n'),
      body_font: getComputedStyle(document.body).fontFamily,
    }
  })
  const f = outer.iframe.box
  const b = inner.button_box
  return { ...outer, trigger: true, ...inner, button_page_box: { x: f.x + b.x, y: f.y + b.y, width: b.width, height: b.height } }
}

/** One anonymous page at one device, in a context of its own. `ready` waits for what this load is recording. */
async function load(browser, url, [width, height], ready) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 })
    await ready(page)
    return page
  } catch (e) {
    await context.close()
    throw e
  }
}
const closeOf = (page) => page.context().close()

const findings = []
const say = (line) => console.log(clean(line))

async function recordMajor(browser, m) {
  const g = ghost(m)
  const version = (await g.api('GET', 'site/')).site.version
  say(`\n[${g.name}] ${g.origin} — Ghost ${version}`)
  const before = await g.settings()
  const KEPT = ['announcement_content', 'announcement_background', 'announcement_visibility', 'accent_color', 'portal_button',
    'portal_button_style', 'portal_button_signup_text', 'portal_button_icon', 'members_signup_access', 'donations_enabled']
  const read = Object.fromEntries(KEPT.map((k) => [k, before[k] ?? null]))
  // THE FIXTURE, AS IT STANDS — or no recording: the bar this records is item 21's, shown to a logged-out visitor
  let audience = []
  try { audience = JSON.parse(before.announcement_visibility ?? '[]') } catch {}
  if (typeof before.announcement_content !== 'string' || before.announcement_content.trim() === '' || !audience.includes('visitors')) {
    throw new Error(`${g.name}'s announcement is not the fixture (words shown to visitors) — refusing to record a different bar: ${JSON.stringify({ content: before.announcement_content, visibility: before.announcement_visibility })}`)
  }
  const previous = { portal_button: before.portal_button, portal_button_style: before.portal_button_style, announcement_visibility: before.announcement_visibility }
  say(`  read: ${JSON.stringify(read)}`)
  const home = `${g.origin}/`
  const out = {
    captured: new Date().toISOString().slice(0, 10),
    command: COMMAND,
    ghost_major: m,
    ghost_version: version,
    site: g.origin,
    settings: read,
    announcement: { at: {} },
    portal: { off: {}, styles: {} },
    cleared: null,
    restored: null,
  }

  let restored = false
  try {
    // ── THE BAR AS IT STANDS — Portal's button off, which is also the control that no trigger is drawn while it is ──
    for (const device of DEVICES) {
      const page = await load(browser, home, device, (p) => p.waitForSelector('#announcement-bar-root .gh-announcement-bar', { timeout: 30000 }))
      await page.waitForTimeout(400)
      const bar = await page.evaluate(readBar)
      await closeOf(page)
      const at = `${device[0]}x${device[1]}`
      const { style_text: style, ...rest } = bar
      if (out.announcement.style === undefined) out.announcement.style = style
      else if (out.announcement.style !== style) throw new Error(`${g.name}: the bar's stylesheet differs between devices`)
      out.announcement.at[at] = rest
      out.portal.off[at] = { trigger: bar.trigger, portal_root: bar.portal_root }
      say(`  bar @${at}: index ${bar.index} of ${bar.body_children} · ${Math.round(bar.bar_box.height * 100) / 100}px tall · ${bar.computed.background_color} · ${bar.computed.font_size}/${bar.computed.line_height} · trigger ${bar.trigger}`)
    }

    // ── PORTAL: switched on, then each of Ghost's three styles, at each device ──
    await g.put({ portal_button: true })
    const on = await g.settings()
    if (on.portal_button !== true) throw new Error(`${g.name}: portal_button did not read back true after the switch`)
    for (const style of STYLES) {
      await g.put({ portal_button_style: style })
      if ((await g.settings()).portal_button_style !== style) throw new Error(`${g.name}: portal_button_style did not read back ${style}`)
      out.portal.styles[style] = {}
      for (const device of DEVICES) {
        const at = `${device[0]}x${device[1]}`
        const wide = device[0] >= 640
        const page = await load(browser, home, device, async (p) => {
          await p.waitForSelector('#ghost-portal-root', { state: 'attached', timeout: 30000 })
          // a device Portal draws on: wait for the trigger; one it does not (the control): give it as long, then look
          if (wide) await p.waitForSelector('iframe[title="portal-trigger"]', { state: 'attached', timeout: 30000 })
          else await p.waitForTimeout(4000)
        })
        const trigger = await readTrigger(page)
        await closeOf(page)
        const { frame_style_text: frameStyle, ...rest } = trigger
        if (frameStyle !== undefined) {
          if (out.portal.frame_style === undefined) out.portal.frame_style = frameStyle
          else if (out.portal.frame_style !== frameStyle) throw new Error(`${g.name}: Portal's frame stylesheet differs between loads`)
        }
        out.portal.styles[style][at] = rest
        say(`  portal ${style} @${at}: ${trigger.trigger ? `iframe ${trigger.iframe.style} · button ${JSON.stringify(trigger.button_page_box)} · ${trigger.button.height} ${trigger.button.border_radius} · label ${trigger.label ? JSON.stringify(trigger.label.text) : 'none'}` : 'NO trigger'}`)
      }
    }

    // ── THE BAR CLEARED — the audience emptied, the words kept (Ghost Admin's own way to switch it off) ──
    await g.put({ announcement_visibility: '[]' })
    const cleared = await g.settings()
    const page = await load(browser, home, DEVICES[0], (p) => p.waitForTimeout(3000))
    const clearedPage = await page.evaluate(() => ({ script: document.querySelector('script[data-announcement-bar]') !== null, root: document.getElementById('announcement-bar-root') !== null }))
    await closeOf(page)
    out.cleared = { announcement_visibility: cleared.announcement_visibility, ...clearedPage }
    say(`  cleared (${cleared.announcement_visibility}): script ${clearedPage.script} · root ${clearedPage.root}`)
  } finally {
    // EVERYTHING PUT BACK, AND READ BACK — whatever happened above
    await g.put(previous)
    const after = await g.settings()
    const back = { portal_button: after.portal_button, portal_button_style: after.portal_button_style, announcement_visibility: after.announcement_visibility }
    restored = JSON.stringify(back) === JSON.stringify(previous)
    out.restored = back
    say(`  restored and read back: ${JSON.stringify(back)} — ${restored ? 'as found' : 'NOT AS FOUND'}`)
    if (!restored) findings.push(`${g.name}: the settings did not read back as found — ${JSON.stringify({ previous, back })}`)
  }

  // ── the spec's Ask First, stated either way ──
  const bar1440 = out.announcement.at['1440x900']
  const verdicts = [
    [`${g.name}: the bar root is the body's FIRST child at every device`, Object.values(out.announcement.at).every((b) => b.index === 0)],
    [`${g.name}: a one-line bar at 1440 is 48px tall`, Math.round(bar1440.bar_box.height) === 48],
    [`${g.name}: Portal draws NO trigger below 640px (390), and does at 834 and 1440 — every style`,
      STYLES.every((s) => out.portal.styles[s]['390x844'].trigger === false && out.portal.styles[s]['834x1112'].trigger === true && out.portal.styles[s]['1440x900'].trigger === true)],
    [`${g.name}: with the audience emptied the script is NOT injected and no bar root exists`, out.cleared !== null && out.cleared.script === false && out.cleared.root === false],
    [`${g.name}: the control — no trigger while portal_button is off`, Object.values(out.portal.off).every((o) => o.trigger === false)],
  ]
  for (const [claim, held] of verdicts) {
    say(`  ${held ? 'HELD' : 'ASK FIRST — DID NOT HOLD'}  ${claim}`)
    if (!held) findings.push(claim)
  }
  const file = path.join(FIXTURES, `ghost${m}`, 'surfaces.json')
  fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`)
  say(`  wrote ${path.relative(REPO, file)}`)
}

async function main() {
  const browser = await chromium.launch()
  try {
    for (const m of MAJORS) await recordMajor(browser, m)
  } finally {
    await browser.close()
  }
  if (findings.length > 0) {
    say(`\n${findings.length} finding(s) against the plan — stop and say so:\n${findings.map((f) => `  - ${f}`).join('\n')}`)
    process.exit(3)
  }
  say('\nevery Ask First finding held; both servers read back as found')
}

main().catch((e) => {
  console.error('RECORDER ERROR', clean(e && e.stack ? e.stack : e))
  process.exit(2)
})
