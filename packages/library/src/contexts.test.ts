// FR-H7's matrix, proved — against what T1 and T3 printed and against Ghost's own source, never
// against the appendix's prose (standing rule 1, AD-23).
//
// The three recordings are written by `python3 tools/probe/record-contexts.py`. They are read by
// import, never `node:fs` (AD-1), and a missing one FAILS naming that command (standing rule 2): a
// matrix whose proof is absent is a paraphrase, not a pass. A field no recording can show is named in
// the matrix as `unverified`, with its reason, and is the only thing this file skips.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BARE_HELPERS, COMPILE_TARGETS, GET_SOURCES } from './vocabulary.ts'
import { CONTEXT_MATRIX as M, bindable, offerBindings, rootScope } from './contexts.ts'
import type { BindingPlace, MatrixField, ScopeEntry } from './contexts.ts'


type Field = { printed?: string; if?: string; zero?: string; first?: string; raw?: { length: number; head: string } }
type Frame = { scope: string; via: string[]; fields: Record<string, Field> }
type Page = { template: string; path: string; http: number; frames: Record<string, Frame>; universal: Record<string, Field>; controls: Record<string, string> }
type Recording = { ghost_version: string; captured: string; command: string; pages: Page[]; api: Record<string, Record<string, unknown>> }
type SourceFile = { url: string; sha256: string; keys: string[] }
type Source = { floor: string; servers: string[]; before: Record<string, string>; versions: Record<string, Record<'public' | 'defaults' | 'global' | 'local', SourceFile>> }

import { CAPTURE_COMMAND, RECORDINGS } from '../contexts/fixtures/index.ts'

/** One recording, or a named failure. AD-1 bans `node:fs` and a dynamic import here, so the recordings
 *  arrive through the recorder's generated module, which lists what is on disk; one that is absent
 *  FAILS naming the capture command (standing rule 2) — it never skips and never passes vacuously. */
async function load<T>(name: 'ghost5' | 'ghost6' | 'ghost-source'): Promise<T> {
  const rec = Object.prototype.hasOwnProperty.call(RECORDINGS, name) ? RECORDINGS[name] : undefined
  if (rec === undefined) {
    throw new Error(`NO RECORDING — packages/library/contexts/fixtures/${name}.json is absent. Capture it: ${CAPTURE_COMMAND}. The matrix is proved on the real servers or it is a paraphrase (AD-23, R-82).`)
  }
  return rec as T
}

const MAJORS = ['ghost5', 'ghost6'] as const
const VALUE = new Set(['text', 'url', 'image', 'color', 'date', 'number'])
const set = (v: unknown) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)

const fieldsOf = (scope: string): Record<string, MatrixField> => M.scopes[scope] ?? {}

test('the recordings exist, are dated, carry their command, and came off the two servers', async () => {
  const source = await load<Source>('ghost-source')
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    assert.equal(rec.command, CAPTURE_COMMAND)
    assert.match(rec.captured, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(source.servers.includes(rec.ghost_version), `${major} ran ${rec.ghost_version}, and the source was not read at it`)
    assert.ok(rec.pages.length > 0 && Object.keys(rec.api).length > 0, `${major} recorded nothing`)
  }
})

test('the controls held on both majors — the wrapper rule, the page block and a misspelt field (standing rule 2)', async () => {
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    const pages = (t: string) => rec.pages.filter((p) => p.template === t)
    assert.ok(pages('post.hbs').length > 0 && pages('page.hbs').length > 0 && pages('index.hbs').length > 0, `${major} is missing a template`)
    for (const p of pages('post.hbs')) {
      assert.equal(p.controls['post.hbs_root_title'], '', `${major} ${p.path}: a root {{title}} on post.hbs must print empty (§3a)`)
      assert.ok(set(p.controls['post.hbs_block_title']), `${major} ${p.path}: {{#post}}{{title}}{{/post}} printed nothing`)
    }
    for (const p of pages('page.hbs')) {
      assert.ok(set(p.controls['page.hbs_post_title']), `${major} ${p.path}: the page title through {{#post}} is empty`)
      assert.equal(p.controls['page.hbs_post_title'], p.controls['page.hbs_page_title'], `${major} ${p.path}: {{#post}} and {{#page}} disagree`)
      assert.equal(p.controls['page.hbs_root_title'], '', `${major} ${p.path}: a root {{title}} on page.hbs must print empty`)
    }
    for (const p of pages('index.hbs')) assert.equal(p.controls['index.hbs_root_title'], '', `${major}: a root {{title}} on index.hbs must print empty (§8)`)
    for (const p of rec.pages) {
      for (const [label, fr] of Object.entries(p.frames)) {
        assert.equal(fr.fields['inflozo_no_such_field']?.printed, '', `${major} ${p.path} ${label}: a misspelt field printed`)
      }
    }
  }
})

test('every matrix field not marked unverified is proved by a render or an API row, on both majors', async () => {
  // the block a template opens is proved by its control; every other scope by its frames
  const blocks = new Set(Object.values(M.targets).flatMap((t) => (t.block === undefined ? [] : [t.top])))
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    const proved = new Set<string>()
    for (const p of rec.pages) {
      for (const fr of Object.values(p.frames)) {
        const row = rec.api[`${fr.scope}:${fr.fields['id']?.printed ?? ''}`]
        for (const [name, f] of Object.entries(fieldsOf(fr.scope))) {
          const v = fr.fields[name] ?? {}
          const has = row !== undefined && Object.prototype.hasOwnProperty.call(row, name)
          const api = has ? row[name] : undefined
          const ok =
            VALUE.has(f.kind) ? set(v.printed) && (!has || set(api))
            : f.kind === 'boolean' ? (has ? v.printed === String(api) : v.printed === 'true' || v.printed === 'false')
            : f.kind === 'list' || f.kind === 'object' ? v.if === '1' && (!has || set(api))
            : (v.raw?.length ?? 0) > 0
          if (ok) proved.add(`${fr.scope}.${name}`)
        }
      }
    }
    for (const p of rec.pages) {
      const t = M.targets[p.template]
      if (t?.block !== undefined && set(p.controls[`${p.template}_block_title`])) proved.add(`${t.top}.${t.block}`)
      if (p.template === 'page.hbs' && set(p.controls['page.hbs_page_title'])) proved.add(`${t?.top}.page`)
    }
    const missing: string[] = []
    for (const [scope, fields] of Object.entries(M.scopes)) {
      for (const [name, f] of Object.entries(fields)) {
        if (f.unverified !== undefined) {
          assert.ok(f.unverified.trim() !== '', `${scope}.${name} is unverified with no reason`)
          continue
        }
        if (!proved.has(`${scope}.${name}`)) missing.push(`${scope}.${name}${blocks.has(scope) ? ' (a template block)' : ''}`)
      }
    }
    assert.deepEqual(missing, [], `${major}: no render or API row proves ${missing.join(', ')} — record it, or mark it unverified with the reason`)
  }
})

test("each value field's {{#if}} agrees with whether it printed, and a number's includeZero=true guard does", async () => {
  let zeroSeen = false
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    for (const p of rec.pages) {
      for (const [label, fr] of Object.entries(p.frames)) {
        const row = rec.api[`${fr.scope}:${fr.fields['id']?.printed ?? ''}`]
        for (const [name, f] of Object.entries(fieldsOf(fr.scope))) {
          const v = fr.fields[name]
          if (v?.printed === undefined || !VALUE.has(f.kind)) continue
          const at = `${major} ${p.path} ${label} ${fr.scope}.${name}`
          if (f.kind !== 'number') {
            assert.equal(v.if, set(v.printed) ? '1' : '0', `${at}: {{#if}} says ${v.if} and it printed ${JSON.stringify(v.printed)}`)
            continue
          }
          // Ghost's reading_time helper counts the BODY, so on a post the visitor may not read it prints
          // nothing while the field is present — recorded, and the matrix's note on the field says so
          if (name === 'reading_time' && row?.['access'] === false) {
            assert.equal(v.printed, '', `${at}: a gated post's reading time printed`)
            continue
          }
          assert.equal(v.zero, set(v.printed) ? '1' : '0', `${at}: includeZero=true says ${v.zero} and it printed ${JSON.stringify(v.printed)}`)
          if (row?.[name] === 0 && set(v.printed)) {
            zeroSeen = true
            assert.equal(v.if, '0', `${at}: the API's 0 must fail a plain {{#if}} — the reason the number guard exists`)
          }
        }
      }
    }
  }
  assert.ok(zeroSeen, 'no recorded number was 0 in the API and printed — the includeZero proof is vacuous')
})

test('every JSON boolean, number and array a recorded API row carries in a matrix field is typed boolean, number and list', async () => {
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    let checked = 0
    for (const [key, row] of Object.entries(rec.api)) {
      const scope = key.slice(0, key.indexOf(':'))
      for (const [name, f] of Object.entries(fieldsOf(scope))) {
        const v = row[name]
        // a helper wins over a same-named field in a theme: `comments` is a boolean in the API and
        // {{comments}} is Ghost's comments helper, which is what a theme prints
        if (f.kind === 'helper' || v === null || v === undefined) continue
        const want = typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? 'number' : Array.isArray(v) ? 'list' : null
        if (want === null) continue
        checked++
        assert.equal(f.kind, want, `${major} ${key}: ${scope}.${name} is a JSON ${want} and the matrix types it ${f.kind}`)
      }
    }
    assert.ok(checked > 0, `${major}: no typed value was checked`)
  }
})

test("the @site keys and their gates, read in Ghost's own source", async () => {
  const source = await load<Source>('ghost-source')
  const keysAt = (v: string): Set<string> => {
    const files = source.versions[v]
    assert.ok(files !== undefined, `Ghost's source was not read at ${v} — ${CAPTURE_COMMAND}`)
    return new Set([...files.public.keys, ...files.global.keys, ...files.local.keys])
  }
  const site = Object.entries(M.universal).filter(([p]) => p.startsWith('@site.'))
  for (const [path, f] of site) {
    const key = path.slice('@site.'.length)
    if (f.since !== undefined) {
      const before = source.before[f.since]
      assert.ok(before !== undefined, `${path}: no release before ${f.since} was read`)
      assert.ok(!keysAt(before).has(key), `${path} is already in Ghost ${before}, so ${f.since} is not its gate`)
      assert.ok(keysAt(f.since).has(key), `${path} is not in Ghost ${f.since}`)
    } else {
      for (const v of [source.floor, ...source.servers]) assert.ok(keysAt(v).has(key), `${path} is offered ungated and Ghost ${v} does not carry it`)
    }
  }
  // the transcription is complete: every key the newest server allow-lists is offered or never-offered
  const newest = source.servers[source.servers.length - 1] as string
  for (const key of keysAt(newest)) {
    const path = `@site.${key}`
    assert.ok(M.universal[path] !== undefined || M.neverOffer[path] !== undefined, `Ghost ${newest} gives @site.${key}, and the matrix neither offers nor refuses it`)
  }
  // the seven social settings arrive in the defaults at the same release as their @site keys
  for (const [path, f] of site.filter(([, x]) => x.since === '6.36.0')) {
    assert.ok(source.versions['6.36.0']?.defaults.keys.includes(path.slice('@site.'.length)), `${path}: no default setting at 6.36.0`)
  }
  // and nothing never-offered is offered, at any version
  for (const version of [undefined, newest]) {
    const offer = offerBindings({ target: 'default.hbs', scope: [], version })
    for (const p of [...offer.values, ...offer.repeats, ...offer.conditions]) assert.equal(M.neverOffer[p], undefined, `${p} is never offered`)
  }
})

test('the universal set also printed on both majors where Ghost computes it outside public.js', async () => {
  for (const major of MAJORS) {
    const rec = await load<Recording>(major)
    const u = rec.pages[0]?.universal ?? {}
    for (const p of ['@site.url', '@site.signup_url', '@config.posts_per_page']) assert.ok(set(u[p]?.printed), `${major}: ${p} printed nothing`)
    const onPage = rec.pages.find((p) => p.template === 'page.hbs')?.universal['@page.show_title_and_feature_image']
    const onIndex = rec.pages.find((p) => p.template === 'index.hbs')?.universal['@page.show_title_and_feature_image']
    assert.equal(onPage?.printed, 'true', `${major}: @page.show_title_and_feature_image on page.hbs`)
    assert.equal(onIndex?.printed, '', `${major}: @page is not set on a list template (§3b)`)
  }
})

test('the matrix is internally whole: every target, every get source, every bare helper, every `of`', () => {
  for (const t of COMPILE_TARGETS) assert.ok(typeof rootScope(t) !== 'string', `${t} has no row`)
  assert.ok(typeof rootScope('custom-members.hbs') !== 'string')
  assert.equal(typeof rootScope('amp.hbs'), 'string')
  for (const s of GET_SOURCES) assert.ok(M.get[s] !== undefined, `{{#get "${s}"}} has no row scope`)
  const helpers = new Set([...Object.entries(M.universal), ...Object.values(M.scopes).flatMap((f) => Object.entries(f))].filter(([, f]) => f.kind === 'helper').map(([n]) => n))
  for (const h of BARE_HELPERS) assert.ok(helpers.has(h), `the bare helper ${h} has no scope in the matrix`)
  const all = [...Object.values(M.universal), ...Object.values(M.scopes).flatMap((f) => Object.values(f))]
  for (const f of all) {
    assert.ok(M.kinds.includes(f.kind), `unknown kind ${f.kind}`)
    if (f.of !== undefined) assert.ok(M.scopes[f.of] !== undefined, `"of": ${f.of} names no scope`)
    if (f.kind === 'object') assert.ok(f.of !== undefined, 'an object must name the scope it opens')
  }
  for (const t of Object.values(M.targets)) {
    assert.ok(M.scopes[t.top] !== undefined, `${t.top} names no scope`)
    if (t.block !== undefined) assert.equal(M.scopes[t.top]?.[t.block]?.kind, 'object')
  }
  // `count.posts` is left out: no dataBindings field can ask for the {{#get}} include it needs
  assert.ok(!Object.values(M.scopes).some((f) => Object.keys(f).includes('count')), 'count.posts is not a plain binding')
  // nor is a resource's meta_title or meta_description: recorded on both majors, {{meta_title}} inside a
  // post, tag or author prints the PAGE's meta helper — the site title on a feed — whatever the row carries
  for (const s of ['post', 'tag', 'author']) assert.ok(!Object.keys(M.scopes[s] ?? {}).some((n) => n.startsWith('meta_')), `${s} offers a meta field`)
})

// ── bindable and offerBindings ────────────────────────────────────────────────

const at = (target: string, scope: ScopeEntry[] = [], version?: string): BindingPlace => ({ target, scope, ...(version === undefined ? {} : { version }) })

test('the wrapper rule: a post field refuses at the top of index.hbs and names where it lives', () => {
  const why = bindable('title', at('index.hbs'))
  assert.ok(why !== null)
  assert.match(why, /title/)
  assert.match(why, /index\.hbs/)
  assert.match(why, /top level/)
  assert.match(why, /post scope/)
  assert.equal(bindable('title', at('index.hbs', ['posts'])), null)
})

test('post and page: the template opens {{#post}}, so a section binds post fields at its top level on both', () => {
  for (const t of ['post.hbs', 'page.hbs', 'custom-members.hbs']) {
    for (const p of ['title', 'url', 'feature_image']) assert.equal(bindable(p, at(t)), null, `${p} on ${t}`)
    const root = rootScope(t)
    assert.ok(typeof root !== 'string' && root.block === 'post', `${t} opens {{#post}}, never {{#page}} (FR-H7, §7.4)`)
  }
  assert.equal(bindable('../title', at('post.hbs')) !== null, true, 'above the post block is the wrapper, which has no title')
})

test('a misspelt path, a list and a boolean as values, a query\'s rows, the universal set', () => {
  assert.match(bindable('post.tagz', { ...at('post.hbs'), use: 'repeat' }) ?? '', /post\.tagz/)
  assert.match(bindable('tags', at('post.hbs')) ?? '', /a list is a repeat source/)
  assert.match(bindable('featured', at('post.hbs')) ?? '', /a boolean is a condition/)
  assert.equal(bindable('tags', { ...at('post.hbs'), use: 'repeat' }), null)
  assert.equal(bindable('title', at('post.hbs', [{ get: 'posts' }])), null)
  assert.equal(bindable('@site.title', at('default.hbs')), null)
  assert.match(bindable('@site.titel', at('default.hbs')) ?? '', /@site\.titel/)
  assert.match(bindable('@custom.accent', at('default.hbs')) ?? '', /FR-Q3/)
  assert.match(bindable('@member.email', at('default.hbs')) ?? '', /R-28/)
  assert.match(bindable('@site.lang', at('default.hbs')) ?? '', /never offered/)
  assert.notEqual(bindable('meta_title', at('post.hbs')), null, 'inside a post, {{meta_title}} is the page helper, never the field')
  assert.equal(bindable('content', { ...at('post.hbs'), use: 'helper' }), null)
  assert.equal(bindable('navigation', { ...at('error.hbs'), use: 'helper' }), null)
  assert.notEqual(bindable('content', { ...at('index.hbs'), use: 'helper' }), null)
  assert.match(bindable('@page.show_title_and_feature_image', { ...at('index.hbs'), use: 'condition' }) ?? '', /§3b/)
  // `@` reads the root wherever it sits; `../` reads one scope up
  assert.equal(bindable('@site.title', at('index.hbs', ['posts', 'tags'])), null)
  assert.equal(bindable('../title', at('index.hbs', ['posts', 'tags'])), null)
  assert.match(bindable('../../title', at('index.hbs', ['posts'])) ?? '', /climbs above/)
  // a binding inside a repeat that is itself illegal names the repeat
  assert.match(bindable('name', at('index.hbs', ['tags'])) ?? '', /data-repeat="tags"/)
})

test('offer by version: a gated key is absent below its gate and present at it; no version is the floor', () => {
  const has = (version?: string) => offerBindings(at('default.hbs', [], version)).values.includes('@site.threads')
  assert.equal(has('6.35.0'), false)
  assert.equal(has('6.36.0'), true)
  assert.equal(has(undefined), false)
  assert.equal(has('not-a-version'), false, 'an unparseable version is the floor')
  assert.equal(offerBindings(at('default.hbs', [], '6.9.0')).values.includes('@site.admin_url'), false, 'versions compare as numbers, never as strings')
})

test('offer by scope: post fields and their repeats at the top of post.hbs, and no list-template field', () => {
  const o = offerBindings(at('post.hbs'))
  assert.ok(o.values.includes('title') && o.values.includes('feature_image') && o.values.includes('primary_tag.name'))
  assert.ok(o.repeats.includes('tags') && o.repeats.includes('authors'))
  for (const p of ['posts', 'pagination', 'pagination.page']) assert.ok(![...o.values, ...o.repeats].includes(p), `${p} offered on post.hbs`)
  assert.ok(!o.conditions.includes('@page.show_title_and_feature_image'), '@page is tolerable on post.hbs and offered only on page.hbs (§3b)')
  assert.ok(offerBindings(at('page.hbs')).conditions.includes('@page.show_title_and_feature_image'))
  assert.ok(offerBindings(at('index.hbs')).repeats.includes('posts'))
})

test('nothing offerBindings returns is refused by bindable at the same place — every target, scope and version', () => {
  let places = 0
  const visit = (target: string, scope: ScopeEntry[], depth: number) => {
    for (const version of [undefined, '6.36.0']) {
      const place = at(target, scope, version)
      const o = offerBindings(place)
      places++
      for (const p of o.values) assert.equal(bindable(p, place), null, `${p} offered and refused at ${JSON.stringify(place)}`)
      for (const p of o.repeats) assert.equal(bindable(p, { ...place, use: 'repeat' }), null, `${p} offered as a repeat and refused at ${JSON.stringify(place)}`)
      for (const p of o.conditions) assert.equal(bindable(p, { ...place, use: 'condition' }), null, `${p} offered as a condition and refused at ${JSON.stringify(place)}`)
      if (depth < 2 && version === undefined) for (const r of o.repeats) visit(target, [...scope, r], depth + 1)
    }
  }
  for (const target of [...Object.keys(M.targets).filter((t) => !t.includes('{')), 'custom-members.hbs']) {
    visit(target, [], 0)
    for (const source of Object.keys(M.get)) visit(target, [{ get: source }], 1)
  }
  assert.ok(places > Object.keys(M.targets).length, 'the walk visited nothing below the top level')
})
