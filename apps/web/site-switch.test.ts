// Story 7.18b — choosing the site (`lib/site-switch.ts`): the spec's I/O matrix, row by row, for the one rule the picker, the
// confirm and the server's `switchSite` all read.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SWITCH_WORDS, switchPlan, switchWith, type SwitchIo, type SwitchSite } from './lib/site-switch.ts'
import { DEPLOY_WORDS } from './lib/deploy.ts'
import { TRANSLATION_WORDS } from './lib/translations.ts'

const P = 'p-this'
const site = (id: string, over: Partial<SwitchSite> = {}): SwitchSite =>
  ({ id, title: id, host: `${id}.example`, url: `https://${id}.example`, capability: 'full', source: null, locale: null, heldBy: null, ...over })
const SITES = [
  site('linked', { locale: 'en' }),
  site('free', { locale: 'en' }),
  site('held', { locale: 'en', heldBy: { id: 'p-other', name: 'Field Notes' } }),
  site('german', { locale: 'de' }),
  site('arabic', { locale: 'ar' }),
  site('upper', { locale: 'EN' }),
  site('none', { locale: null }),
]
const plan = (project: { language: string; linkedSiteId: string | null }, id: string) => switchPlan({ project: { id: P, ...project }, site: id, sites: SITES })

test('same site: nothing to write, no confirm', () => {
  const p = plan({ language: 'en', linkedSiteId: 'linked' }, 'linked')
  assert.deepEqual(p, { same: true, heldBy: null, firstLink: false, language: 'en', warnLanguage: false, confirm: false })
})

test('a plain switch: an unheld site, same stored language or none stored — no confirm, the language kept', () => {
  assert.deepEqual(plan({ language: 'en', linkedSiteId: 'linked' }, 'free'), { same: false, heldBy: null, firstLink: false, language: 'en', warnLanguage: false, confirm: false })
  assert.equal(plan({ language: 'de', linkedSiteId: 'linked' }, 'none')?.confirm, false, 'a site with no stored locale never warns')
})

test('a site that is none of the user\'s connected sites (gone, or disconnected meanwhile) has no plan', () => {
  assert.equal(plan({ language: 'en', linkedSiteId: 'linked' }, 'vanished'), null)
})

test('Question 1 (R-267): a held site is offered behind a confirm that names the holding project', () => {
  const p = plan({ language: 'en', linkedSiteId: 'linked' }, 'held')
  assert.deepEqual(p?.heldBy, { id: 'p-other', name: 'Field Notes' })
  assert.equal(p?.confirm, true)
  // the control: a site this project itself links is never "held"
  assert.equal(switchPlan({ project: { id: 'p-other', language: 'en', linkedSiteId: 'held' }, site: 'held', sites: SITES })?.heldBy, null)
  assert.equal(SWITCH_WORDS.held('blog.example.com', 'Field Notes'),
    "blog.example.com is Field Notes's site now. Switching moves it here: Field Notes keeps its designs and its deploy history, and isn't linked to a site until you choose one for it.")
})

test('FR-Q6: a stored locale that differs EXACTLY (case included) is confirmed, and the project keeps its language', () => {
  const de = plan({ language: 'en', linkedSiteId: 'linked' }, 'german')
  assert.equal(de?.warnLanguage, true)
  assert.equal(de?.language, 'en', 'a switch never changes the language')
  assert.equal(plan({ language: 'en', linkedSiteId: 'linked' }, 'upper')?.warnLanguage, true, '`EN` is not `en` to Ghost')
  // the control: the same locale says nothing
  assert.equal(plan({ language: 'de', linkedSiteId: 'linked' }, 'german')?.warnLanguage, false)
})

test('a first link (no site, language still `en`) takes the site\'s language, with no language confirm — an RTL one included', () => {
  const de = plan({ language: 'en', linkedSiteId: null }, 'german')
  assert.deepEqual(de, { same: false, heldBy: null, firstLink: true, language: 'de', warnLanguage: false, confirm: false })
  assert.equal(plan({ language: 'en', linkedSiteId: null }, 'arabic')?.language, 'ar', 'rtl_ack_at stays empty — Pre-flight blocks')
  assert.equal(plan({ language: 'en', linkedSiteId: null }, 'none')?.language, 'en', 'no stored locale: English')
  // a first link to a held site still owes the move's confirm
  assert.equal(plan({ language: 'en', linkedSiteId: null }, 'held')?.confirm, true)
})

test('a first link with a language the customer chose is "Language differs": confirmed, and the language is kept', () => {
  const p = plan({ language: 'ar', linkedSiteId: null }, 'free')
  assert.equal(p?.firstLink, false)
  assert.equal(p?.warnLanguage, true)
  assert.equal(p?.language, 'ar')
})

test('the confirm\'s buttons are Translations\' own (R-170)', () => {
  assert.equal(SWITCH_WORDS.cancel, TRANSLATION_WORDS.cancel)
  assert.equal(SWITCH_WORDS.switch, TRANSLATION_WORDS.switch)
  assert.equal(SWITCH_WORDS.switching, TRANSLATION_WORDS.switching)
  assert.equal(SWITCH_WORDS.confirmTitle('ghost6.inflozo.com'), 'Switch to ghost6.inflozo.com?')
})

// ── the server's half (`switchWith`, which `switchSite` runs after the lock): what it writes, in what order, and when it asks ──

/** A fake `SwitchIo` over one project and its candidate site: `reads` are answered in turn (the last one repeats), every write
 *  is recorded, and `links` are the link's answers in turn. */
function io(reads: (Awaited<ReturnType<SwitchIo['read']>>)[], links: ('ok' | 'taken' | 'error')[] = ['ok'], unlinks = true) {
  const writes: string[] = []
  let r = 0
  let l = 0
  const fake: SwitchIo = {
    read: async () => reads[Math.min(r++, reads.length - 1)] ?? null,
    unlink: async () => (writes.push('unlink'), unlinks),
    link: async (language) => (writes.push(`link:${language ?? '-'}`), links[Math.min(l++, links.length - 1)] ?? 'ok'),
  }
  return { fake, writes }
}
const on = (language: string, linkedSiteId: string | null, s: SwitchSite | null) => ({ project: { language, linkedSiteId }, site: s })
const go = (fake: SwitchIo, id: string, confirmed = false) => switchWith(fake, { projectId: P, siteId: id, confirmed })

test('switchWith: a site gone or disconnected meanwhile is refused in its sentence, and nothing is written; a failed read is ours', async () => {
  const gone = io([on('en', 'linked', null)])
  assert.deepEqual(await go(gone.fake, 'free'), { refused: SWITCH_WORDS.gone })
  assert.deepEqual(gone.writes, [])
  const failed = io([null])
  assert.deepEqual(await go(failed.fake, 'free'), { refused: DEPLOY_WORDS.infrastructure })
  assert.deepEqual(failed.writes, [])
})

test('switchWith: the linked site again answers ok with nothing written; a plain switch links it alone, the language untouched', async () => {
  const same = io([on('en', 'linked', site('linked'))])
  assert.deepEqual(await go(same.fake, 'linked'), { ok: true })
  assert.deepEqual(same.writes, [])
  const plain = io([on('de', 'linked', site('free', { locale: 'de' }))])
  assert.deepEqual(await go(plain.fake, 'free'), { ok: true })
  assert.deepEqual(plain.writes, ['link:-'])
})

test('switchWith (Q1, R-267): a held site unconfirmed answers the confirm and writes nothing; confirmed, the holder is unlinked FIRST, then this project linked', async () => {
  const held = site('held', { heldBy: { id: 'p-other', name: 'Field Notes' } })
  const asked = io([on('en', 'linked', held)])
  const answer = await go(asked.fake, 'held')
  assert.ok('confirm' in answer && answer.confirm.heldBy?.name === 'Field Notes')
  assert.deepEqual(asked.writes, [], 'a confirm owed writes nothing')
  const moved = io([on('en', 'linked', held)])
  assert.deepEqual(await go(moved.fake, 'held', true), { ok: true })
  assert.deepEqual(moved.writes, ['unlink', 'link:-'])
  const refused = io([on('en', 'linked', held)], ['ok'], false)
  assert.deepEqual(await go(refused.fake, 'held', true), { refused: DEPLOY_WORDS.infrastructure })
  assert.deepEqual(refused.writes, ['unlink'], 'a failed unlink never links')
})

test('switchWith (FR-Q6): a first link writes languageAtLink\'s language; a language that differs is confirmed first and never written', async () => {
  const first = io([on('en', null, site('german', { locale: 'de' }))])
  assert.deepEqual(await go(first.fake, 'german'), { ok: true })
  assert.deepEqual(first.writes, ['link:de'])
  const differs = io([on('fr', 'linked', site('german', { locale: 'de' }))])
  assert.ok('confirm' in (await go(differs.fake, 'german')))
  assert.deepEqual(differs.writes, [])
  const confirmed = io([on('fr', 'linked', site('german', { locale: 'de' }))])
  assert.deepEqual(await go(confirmed.fake, 'german', true), { ok: true })
  assert.deepEqual(confirmed.writes, ['link:-'], 'the project keeps its language')
})

test('switchWith: a 23505 race re-reads and asks again — another project took the site meanwhile; a second 23505 is ours, never a loop', async () => {
  const raced = io([on('en', 'linked', site('free')), on('en', 'linked', site('free', { heldBy: { id: 'p-tab', name: 'Other tab' } }))], ['taken'])
  const answer = await go(raced.fake, 'free')
  assert.ok('confirm' in answer && answer.confirm.heldBy?.name === 'Other tab', 'asked again, naming the project that took it')
  assert.deepEqual(raced.writes, ['link:-'])
  // the control: a race the re-read no longer sees links on the second pass
  const cleared = io([on('en', 'linked', site('free'))], ['taken', 'ok'])
  assert.deepEqual(await go(cleared.fake, 'free'), { ok: true })
  assert.deepEqual(cleared.writes, ['link:-', 'link:-'])
  const twice = io([on('en', 'linked', site('free'))], ['taken', 'taken'])
  assert.deepEqual(await go(twice.fake, 'free'), { refused: DEPLOY_WORDS.infrastructure })
  assert.deepEqual(twice.writes, ['link:-', 'link:-'])
  const broken = io([on('en', 'linked', site('free'))], ['error'])
  assert.deepEqual(await go(broken.fake, 'free'), { refused: DEPLOY_WORDS.infrastructure })
})
