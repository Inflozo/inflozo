import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import {
  categoryOf, isPaywallDesign, isPlaceable, MEMBER_STATES, offeredOn, paywallRing, ringFor, samePartition, UNIVERSAL_CONTROLS,
  UNIVERSALS,
} from '@inflozo/library'
import type { SectionRegistryEntry } from '@inflozo/library'
import {
  defaultContent, designate, getPath, parseDoc, resolveControls, setContent, setData, sidebar, switchDesign,
} from '@inflozo/section-runtime'
import type { ControlState, DocInstance, ProjectDoc } from '@inflozo/section-runtime'
import { paywallSamples, samples } from './lib/controls-review.ts'
import { CANVASES, SITE, templateKeyOf } from './lib/editor.ts'
import { pilot, pilotIds } from './lib/pilots.ts'
import { remixFold, remixPicks } from './lib/remix.ts'
import { shuffleTo, step } from './lib/ring.ts'

/* ─────────────────────────────────────────── Story 5.23 — THE PLAY-LOOP GATE (FR-D17, FR-D19, R-205).
 *
 * FR-D17's promise, run as a machine would play it: shuffle and remix as much as you like, and nothing you typed or set
 * is ever lost — and, since R-205 (owner, 2026-09-27), a design you go back to by any route looks exactly as you left it.
 * A 40-section Home is played for every seed — twenty Variant Shuffles on its ringed sections, then one Site Remix —
 * and every section is checked afterwards.
 *
 * THE EDITOR'S OWN FUNCTIONS, NEVER COPIES. The ring is `ringFor` over the library, a Shuffle is `shuffleTo` then
 * `switchDesign`, a Remix is `remixPicks` then `remixFold` folding `switchDesign`, and every result goes through
 * `designate` as `apply` does. Only `editor.tsx`'s few-line compositions — `ringOf`, `onShuffle`, `onRemix` — are
 * mirrored below, because `node --test` strips types and cannot load a `.tsx`.
 *
 * THE FIXTURE IS DERIVED, NEVER WRITTEN DOWN (standing rule 4). The library is what the keyboard harness assembles
 * (`harness/editor/layout.tsx`) plus one in-memory decoy; Home cycles every design the library offers there, and the
 * site doc holds every one it offers site-wide. Every stored value is non-default, and every word is unique to its
 * section, so a value reset to its default or moved to another section is caught.
 *
 * SEEDED AND REPRODUCIBLE: every failure names its seed and its section. AND EVERY CHECK HAS A CONTROL THAT MUST FAIL
 * IT (standing rule 2) — the spec's three (a switch that drops what a section remembers, a ring that is only "the same
 * category", the rule as built at Story 5.11) and one for each check those leave uncovered — each reported by name in
 * the test's own output.
 *
 * It lives in `apps/web` because a core package may not read a file or hold a generator (AD-1): the library is read off
 * the disk here, and the entropy is a seeded generator of this file's own.
 */

/** NFR-1's 40-section fixture — the size the epic's exit names. */
const SECTIONS = 40
/** The spec's session: this many Variant Shuffles, then one Site Remix of Home. */
const SHUFFLES = 20
/** Every seed from 1 to this is played. */
const SEEDS = 100

// ─── the library ────────────────────────────────────────────────────────────────────────────────────────────────

/** R-158's ring — the only one in the repository until Epic 9 fills a category. */
const RING = samples()
/** THE DECOY: a copy of a sample under its category's next free id, compiling to `post.hbs` alone. It is IN the library,
 *  so a partition rule that forgot `compileTarget` has somewhere wrong to land; it lives in memory, never in a file,
 *  because no design is authored here (AD-35, R-158). */
const DECOY: SectionRegistryEntry = {
  ...RING[0]!,
  id: `${categoryOf(RING[0]!.id)}/${Math.max(...RING.map((e) => Number(e.id.split('/')[1]))) + 1}`,
  compileTarget: ['post.hbs'],
}
/** The keyboard harness's library (`entries` in `harness/editor/layout.tsx`): the placeable pilots, the ring, the stand-in
 *  paywalls — and the decoy. */
const ENTRIES: Readonly<Record<string, SectionRegistryEntry>> = Object.fromEntries([
  ...pilotIds().filter(isPlaceable).map((id) => [id, pilot(id)] as const),
  ...RING.map((e) => [e.id, e] as const),
  ...paywallSamples().map((e) => [e.id, e] as const),
  [DECOY.id, DECOY] as const,
])
const LIBRARY = JSON.stringify(ENTRIES)
/** The library as `designate` asks it — `editor.tsx`'s `library`. */
const library = (designId: string) => ENTRIES[designId]

/** `editor.tsx`'s `ringOf`, mirrored: what a section may become, from the library and nowhere else. */
const ringOf = (designId: string): SectionRegistryEntry[] => {
  const entry = ENTRIES[designId]
  if (entry !== undefined && isPaywallDesign(entry)) return paywallRing(Object.values(ENTRIES))
  return entry === undefined ? [] : ringFor(Object.values(ENTRIES), entry)
}

/** Every name a design declares: its own controls and the three universals (`controls.ts`'s `declared`). */
const names = (e: SectionRegistryEntry) => new Set([...e.controlSchema.map((c) => c.name), ...UNIVERSAL_CONTROLS])

/** What a design declares, what it offers and its default. A universal's offer and default are ASKED OF THE ENGINE —
 *  what `resolveControls` would stamp for each value — so this file holds no second copy of the narrowing rule. */
const declarations = (e: SectionRegistryEntry) => {
  const inForce = (stored: Record<string, string>) => resolveControls(e, stored)
  return [
    ...e.controlSchema.map((c) => ({ name: c.name, offered: c.values, default: c.default, dark: c.darkOverride === true })),
    ...UNIVERSALS.map((u) => ({
      name: u.name,
      offered: u.values.filter((v) => inForce({ [u.name]: v })[u.name] === v),
      default: inForce({})[u.name] ?? null,
      dark: u.darkOverride === true,
    })),
  ]
}

// ─── the fixture ────────────────────────────────────────────────────────────────────────────────────────────────

const ok = <T,>(r: T | string): T => {
  if (typeof r === 'string') throw new Error(r)
  return r
}

/** A word made this section's own: a stored rich text keeps its marks and gains the tag in its words. */
const tagged = (v: unknown, tag: string): unknown =>
  typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string'
    ? { ...v, text: `${(v as { text: string }).text} · ${tag}` }
    : `${typeof v === 'string' ? v : ''} · ${tag}`

/** Section `k` on `entry`: its category's default content with every text prop made unique to it and a non-default value
 *  in every Data row the panel draws — both written through the engine's own edits, so they are values the product could
 *  have stored — then a non-default offered value for every control and universal its design declares, and a dark value
 *  different from the light one for every mode-scoped control. Those two maps are written DIRECTLY: `setControl` refuses
 *  a control another greys (Rule under heading while Alignment is Centre), and a stored greyed value is exactly what a
 *  design change must keep. */
function sectionOf(entry: SectionRegistryEntry, k: number): Record<string, unknown> {
  const tag = `section ${k + 1}`
  let state: ControlState = { content: defaultContent(entry.contentSchema) }
  for (const [path, def] of Object.entries(entry.contentSchema)) {
    if (def.type !== 'text' && def.type !== 'richtext') continue
    const cut = path.indexOf('[].')
    if (cut === -1) {
      state = ok(setContent(entry, state, path, tagged(getPath(state.content, path), tag)))
      continue
    }
    const list = getPath(state.content, path.slice(0, cut))
    const items = Array.isArray(list) ? list : []
    items.forEach((item, i) => {
      state = ok(setContent(entry, state, path, tagged(getPath(item, path.slice(cut + 3)), `${tag} item ${i + 1}`), i))
    })
  }
  for (const row of sidebar(entry, state).groups.flatMap((g) => g.rows)) {
    if (row.kind !== 'data' || row.greyed !== undefined) continue
    const value = row.control === 'count' ? (Number(row.default) % 100) + 1 : row.options?.find((o) => o.value !== row.default)?.value
    if (value !== undefined) state = ok(setData(entry, state, row.key, row.control, value))
  }
  const controls: Record<string, string> = {}
  const darkOverrides: Record<string, string> = {}
  for (const d of declarations(entry)) {
    const others = d.offered.filter((v) => v !== d.default)
    const light = others[k % Math.max(1, others.length)]
    if (light === undefined) continue
    controls[d.name] = light
    const dark = others.filter((v) => v !== light)
    if (d.dark && dark.length > 0) darkOverrides[d.name] = dark[k % dark.length]!
  }
  return { instanceId: `section-${k + 1}`, layerName: `${entry.name} — ${tag}`, designId: entry.id, content: state.content, controls, data: state.data ?? {}, darkOverrides }
}

const HOME = templateKeyOf('home')
/** Each doc's file, as `editor.tsx`'s `fileOfKey` answers it. */
const FILE: Readonly<Record<string, string>> = { [SITE.key]: SITE.file, [HOME]: CANVASES.home.file }
/** Every design the library offers on Home, in library order — the fixture cycles them. */
const OFFERED = Object.values(ENTRIES).filter((e) => offeredOn(e, CANVASES.home.file))

/** THE PROJECT BEFORE THE SESSION: Home's sections cycling every design offered there, one ringed section hidden and
 *  another shown to a non-default audience; the site doc holding every design offered site-wide. Both go through
 *  AD-27's one schema and the main-feed rule, exactly as `read.ts` hands them to the editor. */
const START: Readonly<Record<string, ProjectDoc>> = (() => {
  const docOf = (key: string, entries: readonly SectionRegistryEntry[], first: number) =>
    parseDoc({ schemaVersion: 1, instances: entries.map((e, n) => sectionOf(e, first + n)) }, key)
  const home = docOf(HOME, Array.from({ length: SECTIONS }, (_, k) => OFFERED[k % OFFERED.length]!), 0)
  const [hidden, audience] = home.instances.filter((i) => ringOf(i.designId).length > 1)
  const tuned: ProjectDoc = {
    ...home,
    instances: home.instances.map((i) => (i === hidden ? { ...i, hidden: true }
      : i === audience ? { ...i, memberVisibility: MEMBER_STATES.find((s) => s !== i.memberVisibility)! } : i)),
  }
  const site = docOf(SITE.key, Object.values(ENTRIES).filter((e) => offeredOn(e, SITE.file)), SECTIONS)
  return {
    [SITE.key]: parseDoc(designate(site, SITE.file, library), SITE.key),
    [HOME]: parseDoc(designate(tuned, CANVASES.home.file, library), HOME),
  }
})()

// ─── the session ────────────────────────────────────────────────────────────────────────────────────────────────

/** mulberry32: a seeded generator with `Math.random`'s shape, so a failing seed replays exactly. `remix.test.ts`'s
 *  `seeded` only cycles the values it is handed, which cannot play a session. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type Switch = (doc: ProjectDoc, instanceId: string, to: string, ring: readonly SectionRegistryEntry[]) => ProjectDoc | string
type Rings = (designId: string) => readonly SectionRegistryEntry[]
type Move = { instanceId: string; from: string; to: string; by: 'Shuffle' | 'Remix' }
type Session = { seed: number; docs: Readonly<Record<string, ProjectDoc>>; moves: readonly Move[] }

/** One seed's session: twenty Shuffles, each on a random section of Home whose ring holds two or more, then one Remix of
 *  Home. `switchOne` and `ringAt` are the editor's own unless a control hands in the fault it plants. */
function play(seed: number, switchOne: Switch = switchDesign, ringAt: Rings = ringOf): Session {
  const random = seeded(seed)
  let docs = START
  const moves: Move[] = []
  /** `editor.tsx`'s `apply` from the operation on: the main-feed rule is part of every edit, and only the doc the
   *  gesture addresses is written (R-161). */
  const apply = (key: string, next: ProjectDoc | string, what: string) => {
    if (typeof next === 'string') throw new Error(`seed ${seed}: ${what} was refused — ${next}`)
    docs = { ...docs, [key]: designate(next, FILE[key]!, library, docs[key]) }
  }
  for (let n = 0; n < SHUFFLES; n++) {
    const pool = docs[HOME]!.instances.filter((i) => ringAt(i.designId).length > 1)
    const placed = pool[Math.floor(random() * pool.length)]!
    // `onShuffle`, mirrored: a different member of the section's own ring, drawn at the press
    const ring = ringAt(placed.designId)
    const to = shuffleTo(ring.length, ring.findIndex((e) => e.id === placed.designId), random)
    const landing = to === null ? undefined : ring[to]
    if (landing === undefined) continue
    moves.push({ instanceId: placed.instanceId, from: placed.designId, to: landing.id, by: 'Shuffle' })
    apply(HOME, switchOne(docs[HOME]!, placed.instanceId, landing.id, ring), `Shuffle ${n + 1} on ${placed.instanceId}`)
  }
  // `onRemix`, mirrored: the picks from the canvas's own doc alone (R-161), folded into ONE next doc
  const picks = remixPicks(docs[HOME]!.instances, ringAt, random)
  moves.push(...picks.map((p) => ({ ...p, by: 'Remix' as const })))
  if (picks.length > 0) apply(HOME, remixFold(docs[HOME]!, picks, (next, p) => switchOne(next, p.instanceId, p.to, ringAt(p.from))), 'the Remix')
  return { seed, docs, moves }
}

// ─── the checks: each answers its failures, every one naming its seed and its section ──────────────────────────

type Check = (s: Session, switchOne: Switch, ringAt: Rings) => string[]

const where = (s: Session, i: Pick<DocInstance, 'instanceId' | 'layerName'>) => `seed ${s.seed}, ${i.instanceId} (${i.layerName})`
/** Which names two maps disagree on, and how. */
const differ = (was: Readonly<Record<string, unknown>>, now: Readonly<Record<string, unknown>>) =>
  [...new Set([...Object.keys(was), ...Object.keys(now)])]
    .filter((k) => !isDeepStrictEqual(was[k], now[k]))
    .map((k) => `${k} ${JSON.stringify(was[k]) ?? 'unset'} → ${JSON.stringify(now[k]) ?? 'unset'}`)
    .join(', ')

/** Everything a design change may never touch: all of an instance but `designId` and the three control maps. */
const kept = ({ designId: _d, controls: _c, darkOverrides: _o, parkedControls: _p, ...rest }: DocInstance) => rest

/** Every content prop, list item, data value, name, hidden flag, audience and main-feed flag exactly as before. */
const untouched: Check = (s) => {
  const [before, after] = [START[HOME]!.instances, s.docs[HOME]!.instances]
  if (after.length !== before.length) return [`seed ${s.seed}: Home holds ${after.length} sections, not ${before.length}`]
  return after.flatMap((i, n) => (isDeepStrictEqual(kept(i), kept(before[n]!)) ? []
    : [`${where(s, i)}: something beside its design and its settings changed — ${differ(kept(before[n]!), kept(i))}`]))
}

/** ZERO LOSS: every (map, name, value) stored at the start is still stored — live, or remembered against a design. WHICH
 *  design is not this check's question (a value remembered against the wrong one still exists): `backToStart` asks that. */
const stillStored: Check = (s) => START[HOME]!.instances.flatMap((before, n) => {
  const after = s.docs[HOME]!.instances[n]!
  const held = (map: 'controls' | 'darkOverrides', name: string, value: unknown) =>
    isDeepStrictEqual(after[map][name], value) || Object.values(after.parkedControls).some((r) => isDeepStrictEqual(r[map][name], value))
  return (['controls', 'darkOverrides'] as const).flatMap((map) => Object.entries(before[map]).flatMap(([name, value]) =>
    (held(map, name, value) ? [] : [`${where(s, after)}: ${map}.${name} ${JSON.stringify(value)} is stored nowhere`])))
})

/** BACK TO THE START (R-205): switched straight back to the design it started on, each section's settings, light and
 *  dark, are exactly as they started. */
const backToStart: Check = (s, switchOne, ringAt) => START[HOME]!.instances.flatMap((before) => {
  const end = s.docs[HOME]!
  const now = end.instances.find((i) => i.instanceId === before.instanceId)!
  const back = now.designId === before.designId ? end : switchOne(end, now.instanceId, before.designId, ringAt(now.designId))
  if (typeof back === 'string') return [`${where(s, now)}: cannot go back to ${before.designId} — ${back}`]
  const i = back.instances.find((x) => x.instanceId === before.instanceId)!
  return [
    ...(['controls', 'darkOverrides'] as const).flatMap((map) => (isDeepStrictEqual(i[map], before[map]) ? []
      : [`${where(s, i)}: back on ${before.designId}, its ${map} are not as it started — ${differ(before[map], i[map])}`])),
    // and a return clears the record it restored, so a doc never keeps a stale second copy (the away-and-back criterion)
    ...(i.parkedControls[before.designId] === undefined ? [] : [`${where(s, i)}: back on ${before.designId}, its record is still held`]),
  ]
})

/** THE PARTITION: every move lands inside its section's `ringFor` partition — never the decoy, never a treatment. */
const partitioned: Check = (s) => s.moves.flatMap((m) => {
  const [from, to] = [ENTRIES[m.from], ENTRIES[m.to]]
  const wrong = from === undefined || to === undefined ? 'a design the library does not hold'
    : m.to === DECOY.id ? 'the decoy'
    : !isPlaceable(m.to) ? 'a design that is never placed'
    : !samePartition(from, to) ? 'a design outside its partition'
    : null
  return wrong === null ? [] : [`seed ${s.seed}, ${m.instanceId}: its ${m.by} moved ${m.from} → ${m.to}, ${wrong}`]
})

/** A ring of one never moves, the site doc is byte-identical (R-161), and both docs still parse through AD-27's schema. */
const stillAsBuilt: Check = (s) => [
  ...(isDeepStrictEqual(s.docs[SITE.key], START[SITE.key]) ? [] : [`seed ${s.seed}: the site doc changed (R-161)`]),
  ...START[HOME]!.instances.flatMap((before, n) => (ringOf(before.designId).length > 1
    || isDeepStrictEqual(s.docs[HOME]!.instances[n], before) ? [] : [`${where(s, before)}: a ring of one changed`])),
  ...Object.entries(s.docs).flatMap(([key, doc]) => {
    try {
      return isDeepStrictEqual(parseDoc(doc, key), doc) ? [] : [`seed ${s.seed}: the ${key} doc parses to something else`]
    } catch (e) {
      return [`seed ${s.seed}: ${(e as Error).message}`]
    }
  }),
]

const CHECKS: readonly Check[] = [untouched, stillStored, backToStart, partitioned, stillAsBuilt]

// ─── the controls (standing rule 2) ─────────────────────────────────────────────────────────────────────────────

/** A switch that DROPS what the section remembers — every record goes the moment it moves. */
const dropsRecords: Switch = (doc, instanceId, to, ring) => {
  const next = switchDesign(doc, instanceId, to, ring)
  return typeof next === 'string' ? next
    : { ...next, instances: next.instances.map((i) => (i.instanceId === instanceId ? { ...i, parkedControls: {} } : i)) }
}

/** A switch that also rewrites what a design change may never touch — the section's stored Data values. */
const rewritesData: Switch = (doc, instanceId, to, ring) => {
  const next = switchDesign(doc, instanceId, to, ring)
  return typeof next === 'string' ? next
    : { ...next, instances: next.instances.map((i) => (i.instanceId === instanceId ? { ...i, data: {} } : i)) }
}

/** A ring that is only "the same category" — `samePartition` without its `bindingContext`, `compileTarget` and surface. */
const sameCategory: Rings = (designId) =>
  Object.values(ENTRIES).filter((e) => isPlaceable(e.id) && categoryOf(e.id) === categoryOf(designId))

/** A ring that is the whole placeable library — so a design that is the only one of its kind moves. */
const wholeLibrary: Rings = () => Object.values(ENTRIES).filter((e) => isPlaceable(e.id))

/** THE RULE AS BUILT AT STORY 5.11 (`controls.ts` at 3361bb6a), kept verbatim in shape as a NAMED CONTROL. It parked
 *  only what the next design did not declare, so a setting two designs share travelled on and was put aside against the
 *  SECOND design when a third lacked it — the design it was set on then showed its default. Back-to-the-start must fail
 *  on it, or that check proves nothing. */
const asBuiltAt511: Switch = (doc, instanceId, to, ring) => {
  const n = doc.instances.findIndex((i) => i.instanceId === instanceId)
  const i = doc.instances[n]
  const from = ring.find((e) => e.id === i?.designId)
  const into = ring.find((e) => e.id === to)
  if (i === undefined || from === undefined || into === undefined || to === i.designId) return `${to} refused`
  const [leaving, arriving] = [names(from), names(into)]
  const controls: Record<string, unknown> = { ...i.controls }
  const darkOverrides: Record<string, unknown> = { ...i.darkOverrides }
  const parked: Record<string, DocInstance['parkedControls'][string]> = { ...i.parkedControls }
  const park = { controls: {} as Record<string, unknown>, darkOverrides: {} as Record<string, unknown> }
  for (const [live, aside] of [[controls, park.controls], [darkOverrides, park.darkOverrides]] as const) {
    for (const name of Object.keys(live)) {
      if (!leaving.has(name) || arriving.has(name)) continue
      aside[name] = live[name]
      delete live[name]
    }
  }
  if (Object.keys(park.controls).length > 0 || Object.keys(park.darkOverrides).length > 0) parked[from.id] = park
  else delete parked[from.id]
  const back = parked[to]
  if (back !== undefined) {
    Object.assign(controls, back.controls)
    Object.assign(darkOverrides, back.darkOverrides)
    delete parked[to]
  }
  return { ...doc, instances: doc.instances.map((x, k) => (k === n ? { ...x, designId: to, controls, darkOverrides, parkedControls: parked } : x)) }
}

// ─── the gate ───────────────────────────────────────────────────────────────────────────────────────────────────

test('the fixture is the library\'s, and holds what the session needs', () => {
  const home = START[HOME]!.instances
  assert.equal(home.length, SECTIONS)
  assert.deepEqual([...new Set(home.map((i) => i.designId))].sort(), OFFERED.map((e) => e.id).sort(), 'Home cycles every design offered on it')
  assert.ok(home.some((i) => ringOf(i.designId).length > 1), 'a ring to play on')
  assert.ok(home.some((i) => ringOf(i.designId).length === 1), 'a ring of one that must stay put')
  assert.ok(home.some((i) => i.hidden) && home.some((i) => i.memberVisibility !== home[0]!.memberVisibility), 'one hidden, one shown to another audience')
  assert.ok(home.some((i) => i.isMainFeed), 'the main-feed rule designated a feed')
  assert.ok(home.some((i) => Object.keys(i.data).length > 0), 'a query holds a stored Data value')
  assert.ok(home.some((i) => Object.keys(i.darkOverrides).length > 0), 'dark overrides to keep')
  assert.ok(START[SITE.key]!.instances.length > 0, 'the site doc holds its site-wide sections')
  assert.ok(!OFFERED.includes(DECOY) && ENTRIES[DECOY.id] === DECOY, 'the decoy is in the library and offered nowhere on Home')
  // THE DECOY IS IN NO SECTION'S RING — and the control ring below ("the same category") holds it, so this line can fail
  assert.ok(home.every((i) => !ringOf(i.designId).some((e) => e.id === DECOY.id)), 'the decoy is in a section\'s ring')
  assert.ok(home.some((i) => sameCategory(i.designId).some((e) => e.id === DECOY.id)), 'no control ring reaches the decoy, so the line above proves nothing')
  // EVERY STORED VALUE IS NON-DEFAULT — the premise that makes a reset visible — asked of the declarations themselves
  for (const i of home) {
    for (const d of declarations(ENTRIES[i.designId]!)) {
      if (!d.offered.some((v) => v !== d.default)) continue
      assert.ok(i.controls[d.name] !== undefined && i.controls[d.name] !== d.default, `${i.instanceId}: ${d.name} is stored at a non-default value`)
      if (d.dark) assert.notEqual(i.darkOverrides[d.name], i.controls[d.name], `${i.instanceId}: ${d.name}'s dark value differs from its light one`)
    }
  }
})

test('FR-D17 — every seed plays 20 Shuffles and a Remix of Home and loses nothing, and every design comes back as it was left', (t) => {
  const failures: string[] = []
  let moves = 0
  for (let seed = 1; seed <= SEEDS; seed++) {
    const s = play(seed)
    moves += s.moves.length
    for (const check of CHECKS) failures.push(...check(s, switchDesign, ringOf))
  }
  t.diagnostic(`${SEEDS} seeds, ${moves} moves over ${START[HOME]!.instances.length} sections: ${failures.length} failures`)
  assert.equal(JSON.stringify(ENTRIES), LIBRARY, 'the library itself changed during the sessions')
  assert.equal(failures.length, 0, `${failures.length} failures, the first:\n${failures.slice(0, 25).join('\n')}`)
})

test('away and back — a setting the next design lacks is remembered against its own design, and restored exactly', () => {
  // DERIVED, never named: a ring member with a mode-scoped control of its own that another member does not declare
  const pair = RING.flatMap((a) => a.controlSchema.filter((c) => c.darkOverride === true)
    .flatMap((c) => RING.filter((b) => !names(b).has(c.name)).map((b) => ({ a, b, name: c.name }))))[0]
  assert.ok(pair, 'no design of the ring carries a control another member lacks — nothing to go away from')
  const { a, b, name } = pair
  const doc = parseDoc({ schemaVersion: 1, instances: [sectionOf(a, 0)] }, HOME)
  const was = doc.instances[0]!
  assert.ok(was.controls[name] !== undefined && was.darkOverrides[name] !== undefined, `${name} is set in light and dark`)
  const away = ok(switchDesign(doc, was.instanceId, b.id, ringOf(a.id)))
  const there = away.instances[0]!
  assert.equal(there.controls[name], undefined, `${name} is absent on ${b.id}`)
  assert.equal(there.darkOverrides[name], undefined, 'and so is its dark value')
  assert.equal(there.parkedControls[a.id]?.controls[name], was.controls[name], `remembered against ${a.id}`)
  assert.equal(there.parkedControls[a.id]?.darkOverrides[name], was.darkOverrides[name], 'dark included')
  const home = ok(switchDesign(away, was.instanceId, a.id, ringOf(b.id))).instances[0]!
  assert.equal(home.controls[name], was.controls[name], `back on ${a.id}, ${name} is as it was left`)
  assert.equal(home.darkOverrides[name], was.darkOverrides[name], 'and its dark value too')
  assert.equal(home.parkedControls[a.id], undefined, `${a.id}'s record is cleared on its return`)
})

test('round the ring — `]` from every design comes back exactly as it was left; the rule as built at 5.11 did not', (t) => {
  /** `]` the ring's length times from design `at` of the ring, through `step` — and the settings it lands back on. */
  const wrap = (at: number, switchOne: Switch) => {
    const ring = ringOf(RING[at]!.id)
    let doc = parseDoc({ schemaVersion: 1, instances: [sectionOf(RING[at]!, at)] }, HOME)
    const was = doc.instances[0]!
    for (let n = 0; n < ring.length; n++) {
      const now = doc.instances[0]!
      doc = ok(switchOne(doc, now.instanceId, ring[step(ring.findIndex((e) => e.id === now.designId), ring.length, 1)]!.id, ring))
    }
    const end = doc.instances[0]!
    assert.equal(end.designId, was.designId, 'the ring wrapped home')
    return (['controls', 'darkOverrides'] as const).flatMap((map) =>
      (isDeepStrictEqual(end[map], was[map]) ? [] : [`${was.designId}: ${map} ${differ(was[map], end[map])}`]))
  }
  const failed = RING.flatMap((_, at) => wrap(at, switchDesign))
  assert.deepEqual(failed, [], 'a design round the ring is not as it was left')
  const control = RING.flatMap((_, at) => wrap(at, asBuiltAt511))
  assert.ok(control.length > 0, 'the rule as built at 5.11 comes back exactly too, so this test proves nothing')
  t.diagnostic(`control "the rule as built at 5.11": round the ring failed as it must — ${control.join(' · ')}`)
})

test('standing rule 2 — each control fails the check it targets, or the gate proves nothing', (t) => {
  // `shows` is the words of the failure each control must cause, so a control failing for some OTHER reason — a crash, a
  // refusal — cannot pass for the check working. The spec names the first three; the last two give the two remaining
  // checks a control of their own. The site doc's half of the last check is controlled below the loop.
  const controls: readonly { name: string; check: Check; switchOne: Switch; ringAt: Rings; shows: string }[] = [
    { name: 'a switch that drops remembered records', check: stillStored, switchOne: dropsRecords, ringAt: ringOf, shows: 'is stored nowhere' },
    { name: 'a ring that ignores the partition (the same category only)', check: partitioned, switchOne: switchDesign, ringAt: sameCategory, shows: 'the decoy' },
    { name: 'the rule as built at 5.11', check: backToStart, switchOne: asBuiltAt511, ringAt: ringOf, shows: 'not as it started' },
    { name: 'a switch that also rewrites the section\'s data', check: untouched, switchOne: rewritesData, ringAt: ringOf, shows: 'something beside its design' },
    { name: 'a ring that is the whole library', check: stillAsBuilt, switchOne: switchDesign, ringAt: wholeLibrary, shows: 'a ring of one changed' },
  ]
  for (const { name, check, switchOne, ringAt, shows } of controls) {
    const failed: string[] = []
    let seeds = 0
    for (let seed = 1; seed <= SEEDS; seed++) {
      const found = check(play(seed, switchOne, ringAt), switchOne, ringAt)
      if (found.length > 0) seeds++
      failed.push(...found)
    }
    const hit = failed.find((f) => f.includes(shows))
    assert.ok(hit !== undefined, `control "${name}" did not fail the check it targets (${failed.length} other failures), so that check proves nothing`)
    t.diagnostic(`control "${name}": its check failed ${failed.length} times on ${seeds} of ${SEEDS} seeds, as it must — e.g. ${hit}`)
  }
  // THE SITE DOC has no fault the play loop can plant — its only design is a ring of one, so nothing moves it; the check is
  // the tripwire for the day a site-wide ring exists (R-161). Its control is a finished session a stray write reached.
  const s = play(1)
  const site = s.docs[SITE.key]!
  const strayed = { ...s, docs: { ...s.docs, [SITE.key]: { ...site, instances: site.instances.map((i, n) => (n === 0 ? { ...i, hidden: !i.hidden } : i)) } } }
  const siteHit = stillAsBuilt(strayed, switchDesign, ringOf).find((f) => f.includes('the site doc changed'))
  assert.ok(siteHit !== undefined, 'control "a stray write to the site doc" did not fail the site-doc check, so that check proves nothing')
  t.diagnostic(`control "a stray write to the site doc": ${siteHit}`)
})
