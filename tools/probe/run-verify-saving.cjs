#!/usr/bin/env node
/**
 * FR-D10's AUTOSAVE TOGGLE, ON THE REAL SERVICES (Story 5.8) — the one surface of this story that
 * `run-verify-editor.cjs` cannot reach, because it is not in the editor.
 *
 *   env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY)=' tools/probe/.env | xargs) \
 *     node tools/probe/run-verify-saving.cjs                       # the deployed app.inflozo.com
 *   … APP_ORIGIN=http://localhost:3100 APP_PREFIX=/app node tools/probe/run-verify-saving.cjs   # a local build
 *
 * ITS OWN THROWAWAY ACCOUNT through the Auth Admin API, signed in by magic link exactly as the editor
 * harness does, and deleted again in a `finally` — so a failed run leaves nothing behind either.
 *
 * WHAT IT PROVES, and every one of them is a promise the card makes in words:
 *   · the card is on /account in its neighbours' own shell (R-74's extrapolation, `sessions-card.tsx`'s shape)
 *   · its sentence says the work is ALWAYS kept on the device and ALSO sent every few minutes
 *   · turning it OFF asks first, in the app's one 460px dialog, opening on Cancel (R-115, UX-DR14)
 *   · the dialog states exactly what it costs — AD-15's "the timer alone stops", never "your work is not saved"
 *   · Cancel writes NOTHING, and the switch stays where the server has it
 *   · confirming writes `profiles.autosave_enabled = false` — per USER, not per device (`schema:118`)
 *   · turning it back ON asks nothing: it is the restoring half
 *
 * Every assertion is read back off the DATABASE and not off the switch, so a card that moved its own
 * knob over a write that never happened fails here rather than passing.
 *
 * No key is ever printed: they are read from the environment by name.
 */
const { chromium } = require('@playwright/test')
const APP = process.env.APP_ORIGIN, PREFIX = process.env.APP_PREFIX ?? ''
const SB = process.env.SUPABASE_URL.replace(/\/$/, ''), SECRET = process.env.SUPABASE_SECRET_KEY
const at = (p) => `${APP}${PREFIX}${p}`
const call = async (base, p, init = {}) => {
  const r = await fetch(`${SB}${base}${p}`, { ...init, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } })
  const t = await r.text(); let body = {}; try { body = t ? JSON.parse(t) : {} } catch {}
  return { status: r.status, body }
}
const out = []; let fails = 0
const check = (n, ok, d = '') => { out.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) fails++ }
;(async () => {
  const email = `saving-probe-${Date.now()}@inflozo.com`
  const made = await call('/auth/v1', '/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
  const uid = made.body.id
  check('fixture — the account is created', made.status === 200 && !!uid, `HTTP ${made.status}`)
  const stored = async () => (await call('/rest/v1', `/profiles?user_id=eq.${uid}&select=autosave_enabled`)).body?.[0]?.autosave_enabled
  check('fixture — profiles.autosave_enabled defaults to true (schema:118)', (await stored()) === true, String(await stored()))
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    const link = await call('/auth/v1', '/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
    await page.goto(at(`/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`), { waitUntil: 'load' })
    await page.goto(at('/account'), { waitUntil: 'load' })
    const card = await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((x) => x.textContent.trim() === 'Saving')
      const sec = h?.closest('section')
      const sw = document.getElementById('autosave')
      return { heading: h?.textContent ?? null, checked: sw?.getAttribute('aria-checked'), role: sw?.getAttribute('role'), words: sec?.innerText.replace(/\s+/g, ' ') ?? null,
               shell: sec && getComputedStyle(sec).borderTopLeftRadius }
    })
    check('the Saving card is on /account, extrapolated in the neighbours\' own shell', card.heading === 'Saving' && card.role === 'switch' && card.checked === 'true' && card.shell === '16px', JSON.stringify(card))
    check('its sentence says the work is always kept on the device AND sent every few minutes', /always kept on this device/.test(card.words ?? '') && /every few minutes/.test(card.words ?? ''), card.words)

    // turning it OFF asks first, opening on Cancel
    await page.locator('#autosave').click()
    await page.waitForTimeout(400)
    const ask = await page.evaluate(() => {
      const d = [...document.querySelectorAll('dialog')].find((x) => x.open)
      return d && { text: d.innerText.replace(/\s+/g, ' '), focus: document.activeElement?.textContent?.trim() ?? null, width: getComputedStyle(d).width }
    })
    check('turning it OFF asks first, in the app\'s one dialog (460px) with focus on Cancel (R-115, UX-DR14)', !!ask && ask.width === '460px' && ask.focus === 'Cancel', JSON.stringify(ask))
    check('the dialog states exactly what it costs — the regular send stops, the device and ⌘S do not', /still be kept on this device/.test(ask?.text ?? '') && /close the tab or press/.test(ask?.text ?? '') && /every few minutes/.test(ask?.text ?? ''), ask?.text)
    check('and Cancel writes NOTHING', (await stored()) === true, String(await stored()))
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.waitForTimeout(300)
    check('after Cancel the switch is still ON', (await page.locator('#autosave').getAttribute('aria-checked')) === 'true')

    // confirm this time
    await page.locator('#autosave').click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'Turn it off', exact: true }).click()
    await page.waitForTimeout(2500)
    check('confirming writes profiles.autosave_enabled = false, per USER', (await stored()) === false, String(await stored()))
    check('and the switch follows the server', (await page.locator('#autosave').getAttribute('aria-checked')) === 'false')

    // turning it back ON asks nothing
    await page.locator('#autosave').click()
    await page.waitForTimeout(2500)
    const openDialogs = await page.evaluate(() => [...document.querySelectorAll('dialog')].filter((d) => d.open).length)
    check('turning it back ON asks NOTHING — it is the restoring half', openDialogs === 0 && (await stored()) === true, `${openDialogs} dialogs · stored ${await stored()}`)
    await ctx.close()
  } finally {
    await browser.close()
    const gone = await call('/auth/v1', `/admin/users/${uid}`, { method: 'DELETE' })
    check('the fixture account is deleted', gone.status === 200, `HTTP ${gone.status}`)
  }
  console.log(out.join('\n'))
  console.log(`\n${fails} FAIL, ${out.length - fails} PASS`)
  process.exit(fails ? 1 : 0)
})().catch((e) => { console.log(out.join('\n')); console.error('HARNESS ERROR', e); process.exit(2) })
