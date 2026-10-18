import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parseRoutesConfig, routesYaml } from '@inflozo/section-runtime/routes'
import {
  bytesEqual, downloadHref, GHOST_DEFAULT_ROUTES, ROUTES_FALLBACK_WORDS as W, routesAnswer, routesToOffer, routesWrite, sizeLabel,
} from './lib/routes-upload.ts'
import { AdminError } from './server/ghost-admin/admin-rule.ts'
import { offerRoutes, verifyRoutes, type RoutesIo, type RoutesRead } from './server/routes-upload.ts'

/* STORY 7.17 — FR-I4's ROUTES STEP: the pure rule (`lib/routes-upload.ts`) through every row of the spec's I/O matrix from
   Upload to First read, each beside its control, and the shell (`server/routes-upload.ts`) over a FAKE `io` — the order of
   its calls and every outcome's write. What no fake can show — that T1 takes the multipart upload, answers the read-back
   with the same bytes and refuses the Admin key at 403 — is §85 (`record-routes.mjs --upload`, R-82). */

const utf8 = (s: string) => new TextEncoder().encode(s)
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const TEMPLATE = 'custom-tutorials-list.hbs'
const CONFIG = {
  collections: [{ path: '/tutorials/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'any', values: ['tools'] }] }, template: TEMPLATE }],
  routes: [],
  taxonomies: { tag: 'tag', author: 'author' },
}
const parsed = parseRoutesConfig(CONFIG)
assert.ok(parsed.ok)
const F = routesYaml(parsed.config) as string
const G = F.replace('/tutorials/', '/guides/')

test('F4: Ghost\'s default routes.yaml is the 130 bytes both majors ship', () => {
  assert.equal(utf8(GHOST_DEFAULT_ROUTES).length, 130)
  assert.equal(sha(GHOST_DEFAULT_ROUTES), 'b2d675260a6071be426ac6a67ea60da9428f6169e03e25cb14cc2d7ed74381a1')
})

test('bytes are compared as bytes: a decode that hides a difference is no comparison', () => {
  assert.equal(bytesEqual(utf8(F), utf8(F)), true)
  assert.equal(bytesEqual(utf8(F), utf8(`${F} `)), false, 'a byte more')
  assert.equal(bytesEqual(utf8(F), utf8(G.slice(0, F.length))), false, 'the same length, a byte different')
  // THE CONTROL that decoded text is not enough: a leading BOM decodes away, and the bytes still differ
  const bom = new Uint8Array([0xef, 0xbb, 0xbf, ...utf8(F)])
  assert.equal(new TextDecoder().decode(bom), F, 'decoded, the two read the same')
  assert.equal(bytesEqual(bom, utf8(F)), false, 'as bytes, they do not')
})

test('routesToOffer — the matrix\'s rows, each beside its control (R-255, routine call 2)', () => {
  // Upload: the site holds G, so F goes
  assert.deepEqual(routesToOffer({ project: F, live: utf8(G), lastOffered: null }), { kind: 'offer', file: F })
  // Already there: no POST, so Ghost makes no dated copy
  assert.deepEqual(routesToOffer({ project: F, live: utf8(F), lastOffered: null }), { kind: 'unchanged', file: F })
  // First read fails: with F, upload anyway (the read-back decides); without F, nothing
  assert.deepEqual(routesToOffer({ project: F, live: null, lastOffered: F }), { kind: 'offer', file: F })
  assert.deepEqual(routesToOffer({ project: null, live: null, lastOffered: F }), { kind: 'kept' })
  // Back to default over Inflozo's own file: the live file IS what Inflozo last offered, and is not the default
  assert.deepEqual(routesToOffer({ project: null, live: utf8(F), lastOffered: F }), { kind: 'offer', file: GHOST_DEFAULT_ROUTES })
  // Default, someone else's file: never offered, or offered something else — kept, and nothing written
  assert.deepEqual(routesToOffer({ project: null, live: utf8(G), lastOffered: null }), { kind: 'kept' })
  assert.deepEqual(routesToOffer({ project: null, live: utf8(G), lastOffered: F }), { kind: 'kept' })
  // Default everywhere: the live file is Ghost's default — kept, even when Inflozo offered it last
  assert.deepEqual(routesToOffer({ project: null, live: utf8(GHOST_DEFAULT_ROUTES), lastOffered: GHOST_DEFAULT_ROUTES }), { kind: 'kept' })
  // THE CONTROL on the bytes: a live file one byte away from F is not "already there"
  assert.deepEqual(routesToOffer({ project: F, live: utf8(`${F}\n`), lastOffered: F }), { kind: 'offer', file: F })
})

test('routesAnswer — how Ghost\'s answer to the upload reads (F3)', () => {
  for (const status of [200, 201, 204]) assert.deepEqual(routesAnswer(status), { ok: true }, String(status))
  assert.deepEqual(routesAnswer(401, 'UnauthorizedError'), { fallback: 'revoked' })
  assert.deepEqual(routesAnswer(401), { fallback: 'revoked' }, 'a regenerated token answers 401 whatever its type')
  assert.deepEqual(routesAnswer(403, 'NoPermissionError'), { fallback: 'role' })
  // THE CONTROL: a 403 that is not Ghost's permission answer (a firewall's) is a refusal, never "below Administrator"
  assert.deepEqual(routesAnswer(403, 'ForbiddenError'), { failed: 'ghost_refused' })
  assert.deepEqual(routesAnswer(403), { failed: 'ghost_refused' })
  for (const status of [400, 404, 422]) assert.deepEqual(routesAnswer(status, 'IncorrectUsageError'), { failed: 'ghost_refused' }, String(status))
  for (const status of [429, 500, 502, 503]) assert.deepEqual(routesAnswer(status), { failed: 'ghost_unavailable' }, String(status))
  assert.deepEqual(routesAnswer(301), { failed: 'ghost_redirected' })
})

test('routesWrite — the state each outcome writes, and the ones that write nothing', () => {
  const at = '2026-10-18T12:00:00.000Z'
  const stored = { routes_last_offered: F, routes_live_sha256: sha(F), routes_verified_at: at, routes_fallback: null }
  assert.deepEqual(routesWrite({ kind: 'uploaded', file: F, sha256: sha(F) }, at), stored)
  assert.deepEqual(routesWrite({ kind: 'unchanged', file: F, sha256: sha(F) }, at), stored, 'Already there: the same state')
  assert.deepEqual(routesWrite({ kind: 'fallback', cause: 'no_token', file: F }, at), { routes_last_offered: F, routes_fallback: 'no_token' })
  assert.deepEqual(routesWrite({ kind: 'fallback', cause: 'role', file: F }, at), { routes_last_offered: F, routes_fallback: 'role' })
  assert.deepEqual(routesWrite({ kind: 'verified', sha256: sha(F) }, at), { routes_live_sha256: sha(F), routes_verified_at: at, routes_fallback: null })
  for (const nothing of [{ kind: 'kept' }, { kind: 'failed', code: 'ghost_refused' }, { kind: 'notYet' }, { kind: 'unreachable' }] as const) {
    assert.equal(routesWrite(nothing, at), null, nothing.kind)
  }
})

test('the card\'s size and download: the frame\'s "1.4 KB", and a data: link that decodes to the file byte for byte', () => {
  assert.equal(sizeLabel(130), '130 bytes')
  assert.equal(sizeLabel(1023), '1023 bytes')
  assert.equal(sizeLabel(1024), '1.0 KB')
  assert.equal(sizeLabel(1434), '1.4 KB')
  const awkward = `${F}# 100% & a #fragment\n`
  const href = downloadHref(awkward)
  assert.ok(href.startsWith('data:application/yaml;charset=utf-8,'))
  assert.equal(decodeURIComponent(href.slice(href.indexOf(',') + 1)), awkward)
  assert.doesNotMatch(href, /#/, 'a raw # would end the address at the fragment')
})

test('B16\'s words: the no-token card is the frame verbatim, and revoked and role change only the body, button and footnote (F3)', () => {
  const frame = readFileSync('../../_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/B Missing Surfaces.dc.html', 'utf8')
  const b16 = frame.slice(frame.indexOf('B16 · #16'), frame.indexOf('This card used to be the primary routes flow'))
  const text = b16.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'")
  for (const s of [W.title, W.body.no_token, W.download, W.file, W.find, W.where, W.verifyStep, W.verify, W.button.no_token, W.footnote.no_token, '1.4 KB']) {
    assert.ok(text.includes(s), s)
  }
  assert.equal(W.body.revoked, "We normally upload this for you, but this site's Staff Access Token has stopped working — so this once you will need to do it by hand. It takes about a minute.")
  assert.equal(W.button.revoked, 'Update the token')
  assert.equal(W.footnote.revoked, 'Updating the token makes this automatic again.')
  assert.equal(W.button.role, null, 'no button: a token cannot be given a role')
  assert.equal(W.footnote.role, null)
  assert.equal(W.verifying, 'Verifying…')
})

/* ─── the shell, over a fake io ─── */

type Seen = { what: string; kind?: string; item?: string; body?: unknown }

function fake(over: {
  read?: Partial<RoutesRead> | null
  live?: Uint8Array | null | 'throws'
  /** the live read with the staff token alone, where it differs from the Admin key's (`live`) — a token that stopped working */
  staffLive?: Uint8Array | null | 'throws'
  post?: { status: number; body?: unknown } | Error
  back?: Uint8Array | null
  lastOffered?: string | null
  /** Verify's owned read finding no row (not the caller's site), and a state write that fails */
  site?: null
  wrote?: false
} = {}) {
  const seen: Seen[] = []
  const writes: Record<string, string | null>[] = []
  let posted = false
  const read: RoutesRead | null = over.read === null ? null : { config: CONFIG, yaml: F, templates: [TEMPLATE], staff: true, lastOffered: null, ...over.read }
  const answer = (bytes: Uint8Array | null | undefined) => (bytes === null || bytes === undefined ? { ok: false, status: 503, body: null, bytes: new Uint8Array() } : { ok: true, status: 200, body: null, bytes })
  const io: RoutesIo = {
    read: async () => {
      seen.push({ what: 'read' })
      return read
    },
    readSite: async () => {
      seen.push({ what: 'readSite' })
      if (over.site === null) return null
      return over.lastOffered === undefined ? { lastOffered: F } : { lastOffered: over.lastOffered }
    },
    call: async (args) => {
      seen.push({ what: `${args.method ?? 'GET'} ${args.path}`, kind: args.kind ?? 'admin', item: args.item, body: args.body })
      if ((args.method ?? 'GET') === 'GET') {
        // before the POST, the live file (the staff token's own where given); after it, the read-back
        if (!posted) {
          const live = args.kind === 'staff' && over.staffLive !== undefined ? over.staffLive : over.live
          if (live === 'throws') throw new AdminError({ code: 'ghost_unreachable', message: 'Your Ghost site did not answer.' })
          return answer(live === undefined ? utf8(G) : live)
        }
        return answer(over.back === undefined ? utf8(F) : over.back)
      }
      posted = true
      if (over.post instanceof Error) throw over.post
      return { ok: (over.post?.status ?? 200) < 300, status: over.post?.status ?? 200, body: over.post?.body ?? null, bytes: new Uint8Array() }
    },
    write: async ({ patch }) => {
      seen.push({ what: 'write' })
      writes.push(patch)
      return over.wrote !== false
    },
    now: () => new Date('2026-10-18T12:00:00.000Z'),
  }
  return { io, seen, writes }
}
const ARGS = { projectId: 'p', siteId: 's', userId: 'u', route: 'test' }
const AT = '2026-10-18T12:00:00.000Z'
const what = (seen: Seen[]) => seen.map((s) => (s.kind ? `${s.what} [${s.kind}]` : s.what))

test('offerRoutes, Upload: the order — read, the live file, the multipart POST, the read-back with the same token, the write', async () => {
  const { io, seen, writes } = fake()
  const out = await offerRoutes(ARGS, io)
  assert.deepEqual(out, { kind: 'uploaded', file: F, sha256: sha(F) })
  assert.deepEqual(what(seen), ['read', 'GET settings/routes/yaml/ [staff]', 'POST settings/routes/yaml/ [staff]', 'GET settings/routes/yaml/ [staff]', 'write'])
  const post = seen.find((s) => s.what.startsWith('POST'))!
  assert.equal(post.item, 'routes_upload')
  // the upload Ghost Admin's own makes: field `routes`, a file named routes.yaml, carrying F's bytes exactly
  const form = post.body as FormData
  assert.ok(form instanceof FormData)
  const file = form.get('routes') as File
  assert.equal(file.name, 'routes.yaml')
  assert.equal(file.type, 'text/yaml')
  assert.ok(bytesEqual(new Uint8Array(await file.arrayBuffer()), utf8(F)))
  assert.deepEqual(writes, [{ routes_last_offered: F, routes_live_sha256: sha(F), routes_verified_at: AT, routes_fallback: null }])
})

test('offerRoutes, Already there: no POST — the same state written, so Ghost makes no dated copy', async () => {
  const { io, seen, writes } = fake({ live: utf8(F) })
  assert.deepEqual(await offerRoutes(ARGS, io), { kind: 'unchanged', file: F, sha256: sha(F) })
  assert.ok(!seen.some((s) => s.what.startsWith('POST')))
  assert.deepEqual(writes, [{ routes_last_offered: F, routes_live_sha256: sha(F), routes_verified_at: AT, routes_fallback: null }])
})

test('offerRoutes, No token: the live file read with the Admin key, no POST, and B16\'s no_token written with the file', async () => {
  const { io, seen, writes } = fake({ read: { staff: false } })
  assert.deepEqual(await offerRoutes(ARGS, io), { kind: 'fallback', cause: 'no_token', file: F })
  assert.deepEqual(what(seen), ['read', 'GET settings/routes/yaml/ [admin]', 'write'])
  assert.deepEqual(writes, [{ routes_last_offered: F, routes_fallback: 'no_token' }])
})

test('offerRoutes, Token stopped working (401) and Role below Administrator (403 NoPermissionError): each cause written, no read-back', async () => {
  for (const [post, cause] of [[{ status: 401, body: { errors: [{ type: 'UnauthorizedError' }] } }, 'revoked'], [{ status: 403, body: { errors: [{ type: 'NoPermissionError' }] } }, 'role']] as const) {
    const { io, seen, writes } = fake({ post })
    assert.deepEqual(await offerRoutes(ARGS, io), { kind: 'fallback', cause, file: F }, cause)
    assert.equal(seen.filter((s) => s.what.startsWith('GET')).length, 1, `${cause}: no read-back`)
    assert.deepEqual(writes, [{ routes_last_offered: F, routes_fallback: cause }])
  }
  // a staff token gone from the store between the read and the call is no token at all
  const gone = fake({ post: new AdminError({ code: 'credential_missing', message: 'x' }) })
  assert.deepEqual(await offerRoutes(ARGS, gone.io), { kind: 'fallback', cause: 'no_token', file: F })
  assert.deepEqual(gone.writes, [{ routes_last_offered: F, routes_fallback: 'no_token' }])
})

test('offerRoutes, Ghost refuses, is busy or away, or the read-back differs: a failure, and the state unchanged', async () => {
  const refused = fake({ post: { status: 422, body: { errors: [{ type: 'ValidationError', message: 'The collection has no permalink.' }] } } })
  assert.deepEqual(await offerRoutes(ARGS, refused.io), { kind: 'failed', code: 'ghost_refused', detail: 'The collection has no permalink.' })
  assert.deepEqual(refused.writes, [])
  const busy = fake({ post: { status: 503 } })
  assert.deepEqual(await offerRoutes(ARGS, busy.io), { kind: 'failed', code: 'ghost_unavailable' })
  assert.deepEqual(busy.writes, [])
  const away = fake({ post: new AdminError({ code: 'ghost_unreachable', message: 'Your Ghost site did not answer.' }) })
  assert.deepEqual(await offerRoutes(ARGS, away.io), { kind: 'failed', code: 'ghost_unreachable' })
  assert.deepEqual(away.writes, [])
  const differs = fake({ back: utf8(G) })
  assert.deepEqual(await offerRoutes(ARGS, differs.io), { kind: 'failed', code: 'routes_unverified' })
  assert.deepEqual(differs.writes, [])
  const unread = fake({ back: null })
  assert.deepEqual(await offerRoutes(ARGS, unread.io), { kind: 'failed', code: 'routes_unverified' }, 'a read-back that fails never claims the upload')
  // an infrastructure failure is not the step's to answer: thrown on, for 7.18a's job
  const store = fake({ post: new AdminError({ code: 'credential_store_unavailable', message: 'x' }) })
  await assert.rejects(offerRoutes(ARGS, store.io), (e: AdminError) => e.code === 'credential_store_unavailable')
})

test('offerRoutes at Ghost\'s default: back to default over Inflozo\'s own file; someone else\'s file, or the default, kept', async () => {
  const atDefault = { config: {}, yaml: null }
  const back = fake({ read: { ...atDefault, lastOffered: F }, live: utf8(F), back: utf8(GHOST_DEFAULT_ROUTES) })
  assert.deepEqual(await offerRoutes(ARGS, back.io), { kind: 'uploaded', file: GHOST_DEFAULT_ROUTES, sha256: sha(GHOST_DEFAULT_ROUTES) })
  assert.ok(bytesEqual(new Uint8Array(await ((back.seen.find((s) => s.what.startsWith('POST'))!.body as FormData).get('routes') as File).arrayBuffer()), utf8(GHOST_DEFAULT_ROUTES)))
  for (const [name, over] of [
    ["someone else's", { read: { ...atDefault, lastOffered: null }, live: utf8(G) }],
    ['the default everywhere', { read: { ...atDefault, lastOffered: GHOST_DEFAULT_ROUTES }, live: utf8(GHOST_DEFAULT_ROUTES) }],
    ['an unreadable live file', { read: { ...atDefault, lastOffered: F }, live: 'throws' as const }],
  ] as const) {
    const { io, seen, writes } = fake(over)
    assert.deepEqual(await offerRoutes(ARGS, io), { kind: 'kept' }, name)
    assert.ok(!seen.some((s) => s.what.startsWith('POST')), `${name}: nothing sent`)
    assert.deepEqual(writes, [], `${name}: nothing written`)
  }
})

test('offerRoutes, Stored routing unfit and First read fails', async () => {
  const unfit: [string, Partial<RoutesRead>][] = [
    ['a config that does not parse', { config: { collections: 'no' } }],
    ['a template the project does not have', { templates: [] }],
    ['a stored file that is not routesYaml(config)', { yaml: `${F}# spliced\n` }],
  ]
  for (const [name, read] of unfit) {
    const { io, seen, writes } = fake({ read })
    assert.deepEqual(await offerRoutes(ARGS, io), { kind: 'failed', code: 'routes_invalid' }, name)
    assert.deepEqual(what(seen), ['read'], `${name}: nothing asked of Ghost`)
    assert.deepEqual(writes, [])
  }
  // a project or site that is not the caller's: no call at all
  const stranger = fake({ read: null })
  assert.deepEqual(await offerRoutes(ARGS, stranger.io), { kind: 'failed', code: 'site_not_found' })
  assert.deepEqual(what(stranger.seen), ['read'])
  // First read fails, with F (the staff token's read and the Admin key's both): the upload goes anyway and the read-back decides
  const blind = fake({ live: 'throws' })
  assert.deepEqual(await offerRoutes(ARGS, blind.io), { kind: 'uploaded', file: F, sha256: sha(F) })
  assert.deepEqual(what(blind.seen).slice(0, 3), ['read', 'GET settings/routes/yaml/ [staff]', 'GET settings/routes/yaml/ [admin]'])
})

test('offerRoutes (the Review, 2026-10-18): a staff token that stopped working is not an unreadable site — the Admin key reads the live file', async () => {
  // Ghost already holds F: nothing is offered, so B16 never asks for a hand upload of a file Ghost has
  const holds = fake({ staffLive: null, live: utf8(F) })
  assert.deepEqual(await offerRoutes(ARGS, holds.io), { kind: 'unchanged', file: F, sha256: sha(F) })
  assert.deepEqual(what(holds.seen), ['read', 'GET settings/routes/yaml/ [staff]', 'GET settings/routes/yaml/ [admin]', 'write'])
  // back at the default over Inflozo's own file: Ghost's default is offered, and the token's 401 is stored as B16's cause
  const atDefault = fake({ read: { config: {}, yaml: null, lastOffered: F }, staffLive: null, live: utf8(F), post: { status: 401, body: { errors: [{ type: 'UnauthorizedError' }] } } })
  assert.deepEqual(await offerRoutes(ARGS, atDefault.io), { kind: 'fallback', cause: 'revoked', file: GHOST_DEFAULT_ROUTES })
  assert.deepEqual(atDefault.writes, [{ routes_last_offered: GHOST_DEFAULT_ROUTES, routes_fallback: 'revoked' }])
  // THE CONTROL: a staff read that answers is the only read — the Admin key is not asked
  const answered = fake({ staffLive: utf8(F), live: utf8(G) })
  assert.deepEqual(await offerRoutes(ARGS, answered.io), { kind: 'unchanged', file: F, sha256: sha(F) })
  assert.ok(!answered.seen.some((s) => s.what.startsWith('GET') && s.kind === 'admin'))
})

test('verifyRoutes reads with the Admin key and compares bytes with the file offered; only verified writes', async () => {
  const has = fake({ live: utf8(F) })
  assert.deepEqual(await verifyRoutes(ARGS, has.io), { kind: 'verified', sha256: sha(F) })
  assert.deepEqual(what(has.seen), ['readSite', 'GET settings/routes/yaml/ [admin]', 'write'])
  assert.deepEqual(has.writes, [{ routes_live_sha256: sha(F), routes_verified_at: AT, routes_fallback: null }])
  const notYet = fake({ live: utf8(G) })
  assert.deepEqual(await verifyRoutes(ARGS, notYet.io), { kind: 'notYet' })
  assert.deepEqual(notYet.writes, [])
  for (const live of [null, 'throws'] as const) {
    const away = fake({ live })
    assert.deepEqual(await verifyRoutes(ARGS, away.io), { kind: 'unreachable' }, String(live))
    assert.deepEqual(away.writes, [], 'it never claims success')
  }
  const nothing = fake({ lastOffered: null })
  assert.deepEqual(await verifyRoutes(ARGS, nothing.io), { kind: 'notYet' })
  assert.deepEqual(what(nothing.seen), ['readSite'])
  // the Review (2026-10-18): a site that is not the caller's asks Ghost nothing, and a match whose write fails never claims
  // success — each `unreachable`, the card's "could not check"
  const stranger = fake({ site: null })
  assert.deepEqual(await verifyRoutes(ARGS, stranger.io), { kind: 'unreachable' })
  assert.deepEqual(what(stranger.seen), ['readSite'])
  const unwritten = fake({ live: utf8(F), wrote: false })
  assert.deepEqual(await verifyRoutes(ARGS, unwritten.io), { kind: 'unreachable' })
  assert.deepEqual(what(unwritten.seen), ['readSite', 'GET settings/routes/yaml/ [admin]', 'write'])
})

test('the step is the only uploader, and it imports neither the service role nor the chokepoint (its io is handed in)', () => {
  const step = readFileSync('server/routes-upload.ts', 'utf8')
  assert.doesNotMatch(step, /from '@\/|from '\.\/ghost-admin|supabaseAdmin/, 'routes-upload.ts reaches nothing — io is handed in')
})
