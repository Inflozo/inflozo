import { cache } from 'react'
import { isPlaceable, orbitWeekly, type SectionRegistryEntry } from '@inflozo/library'
import { isDesigned, isSynthesizable, parseDoc, synthesize, type DroppedRow, type ProjectDoc } from '@inflozo/section-runtime'
import type { DesignRows } from '@/lib/canvas'
import type { LinkResources } from '@/components/controls/link-picker'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { CANVASES, canvasesOf, isUuid, SITE, templateKeyOf, type CanvasKey } from '@/lib/editor'
import { resolveEntitlement } from '@/lib/entitlement'
import type { PlanId } from '@/lib/plan'
import { carriesMemberVisibility, pilot, pilotRows } from '@/lib/pilots'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

/**
 * THE EDITOR'S TWO READS (Story 5.1), both through the user's own session, so RLS decides what exists for them.
 *
 * `projectOf` is the 404 guard's read: a non-uuid never reaches Postgres (22P02), and another user's project, a
 * missing one and `abc` all come back null — one answer, so a project's existence is never revealed. `cache`d, so
 * the layout and the pages' metadata share one query per request.
 *
 * `editorData` runs inside the layout's Suspense boundary: every `project_templates` row, each parsed through AD-27's
 * one schema and checked against the design library, LOUDLY — a doc that fails any of it throws a sentence naming
 * the template key and the offending instance, and the app's error boundary shows instead of a partly drawn canvas.
 *
 * Since Story 5.4 the design check has TWO halves: the design must compile to this template's file, and it must be
 * PLACEABLE at all. A32, A33 and A34 are treatments chosen outside the canvas (FR-D5, FR-D12, FR-Q9), so a doc that
 * names one is a doc nothing could have written — refused here, which is what makes "a treatment never reaches
 * Layers" true by construction rather than by every surface remembering to filter.
 *
 * Since Story 5.2 it also hands over what the section panel needs — the inputs `/pilots` feeds `Sidebar` (swatches, link
 * resources, the site's time zone, each pool picture's size) — and the account's plan, for R-119's Pro badge. The plan
 * comes from AD-28's one resolver, so a failed read shows the badge (Free) rather than hiding it.
 *
 * SINCE STORY 5.5 IT ALSO SYNTHESIZES (FR-D6, AD-22). A canvas with no row — or a row with zero instances — is
 * UNTOUCHED, and an untouched synthesizable canvas is handed its Synthesis Default stack as the doc it opens on, with
 * its key in `synthesized` so D5a's marker is SERVER TRUTH and not a guess. Nothing is written: `project_templates`
 * gains no row here and persistence is Story 5.8's.
 *
 * THE TWO REFUSALS ARE DIFFERENT, DELIBERATELY. Above, a STORED doc naming a design the library cannot place throws —
 * it is a user's data, and a missing design there is corruption. A SYNTHESIZED row that cannot be placed is our own
 * table meeting a library that has not caught up (A25-A31 unauthored; A24 narrowed to `post.hbs`, DW-191): it is
 * DROPPED with its reason, because throwing would black out four canvases the user never touched.
 */

export const projectOf = cache(async (id: string): Promise<{ id: string; name: string } | null> => {
  if (!isUuid(id)) return null
  const { data, error } = await (await supabaseServer()).from('projects').select('id, name').eq('id', id).maybeSingle()
  if (error) throw new Error(`the project could not be read (${error.code})`)
  return data
})

/** The template file a stored key compiles into — `templateKeyOf`'s inverse. `custom:custom-x.hbs` names its own,
 *  which is what R-129's three membership canvases store under (Story 5.5 opened them, and this map already answered
 *  their shape). Every row of the project is checked, so a key with no `.hbs` of its own — `paywall` (5.20), `cards`
 *  (7.13) — throws for the whole editor the day its writer lands; the story that writes it extends this map in the
 *  same change (review, 2026-09-17). */
const fileOf = (key: string) =>
  key === SITE.key ? SITE.file : key.startsWith('custom:') ? key.slice('custom:'.length) : `${key}.hbs`

export type EditorData = {
  docs: Readonly<Record<string, ProjectDoc>>
  entries: Readonly<Record<string, SectionRegistryEntry>>
  rows: Readonly<Record<string, DesignRows>>
  pool: readonly { id: string; bytes: number }[]
  /** per design id: does its category carry R-124's Member visibility row (`carriesMemberVisibility`)? */
  memberVisibility: Readonly<Record<string, boolean>>
  swatches: Readonly<Record<string, string>>
  links: LinkResources
  /** the site's time zone name, printed under a date control */
  timezone: string
  plan: PlanId
  /** Story 5.5 — the canvases this project offers, in D5b's row order; a conditional canvas is absent, not greyed */
  canvases: CanvasKey[]
  /** Story 5.5 — the canvas keys whose doc came from `synthesize`: D5a's marker, as server truth (AD-22) */
  synthesized: CanvasKey[]
  /** Story 5.5 — EVERY synthesizable canvas's default stack, by stored key, whether or not it is untouched right now.
   *  AD-22's round trip needs the stack of a canvas that is DESIGNED at load too: taking its last section off returns
   *  it to untouched, and what re-renders is this. Keyed by `template_key`, as `docs` is. */
  defaults: Readonly<Record<string, ProjectDoc>>
  /** Story 5.5 — per synthesized canvas, the default rows the library could not place and why. Derived from the
   *  library, so it empties itself as Epics 9 and 10 land; nothing draws it, and it is here because a drop that
   *  nothing can read is a drop nobody can check. */
  dropped: Readonly<Record<string, readonly DroppedRow[]>>
}

export async function editorData(projectId: string): Promise<EditorData> {
  // the client first, so the two reads below really run together (an await inside the array would serialise them)
  const sb = await supabaseServer()
  const [{ data, error }, { plan }] = await Promise.all([
    sb.from('project_templates').select('template_key, doc').eq('project_id', projectId),
    signedIn().then((user) => resolveEntitlement(user.id)),
  ])
  if (error) throw new Error(`the project's templates could not be read (${error.code})`)

  const docs: Record<string, ProjectDoc> = {}
  const entries: Record<string, SectionRegistryEntry> = {}
  for (const row of data ?? []) {
    const key = row.template_key as string
    const doc = parseDoc(row.doc, key)
    const file = fileOf(key)
    for (const [n, instance] of doc.instances.entries()) {
      const where = `${key} instance ${n} (${instance.instanceId}, ${instance.designId})`
      // Story 5.4, before the library is even asked: a treatment is chosen outside the canvas and never placed on one
      if (!isPlaceable(instance.designId)) {
        throw new Error(`${where}: that design is a treatment chosen outside the canvas, never placed on one`)
      }
      let entry = entries[instance.designId]
      try {
        entry ??= pilot(instance.designId)
      } catch (e) {
        throw new Error(`${where}: ${(e as Error).message}`)
      }
      if (!entry.compileTarget.includes(file)) {
        throw new Error(`${where}: the design compiles to ${entry.compileTarget.join(', ')}, never ${file}`)
      }
      entries[instance.designId] = entry
    }
    docs[key] = doc
  }

  // ── Story 5.5 — synthesis, after every stored doc has been read and checked ──
  // The library, asked the same two questions as above and answering `undefined` instead of throwing. Memoised into
  // `entries`, which is also how a synthesized design reaches the canvas: the editor paints from that map.
  const held = (designId: string) => {
    const known = entries[designId]
    if (known) return known
    try {
      const entry = pilot(designId)
      entries[designId] = entry
      return entry
    } catch {
      return undefined
    }
  }
  // no condition can be true yet, so this is every unconditional canvas — `lib/editor.ts`'s `CONDITIONAL` carries why
  const canvases = canvasesOf()
  const synthesized: CanvasKey[] = []
  const defaults: Record<string, ProjectDoc> = {}
  const dropped: Record<string, readonly DroppedRow[]> = {}
  for (const canvas of canvases) {
    const file = CANVASES[canvas].file
    const key = templateKeyOf(canvas)
    // A canvas that is never synthesized — R-129's three membership ones and Private — has no default stack at all,
    // so it opens EMPTY and takes no marker (`sections-inventory.md:785`).
    if (!isSynthesizable(file)) continue
    const stack = synthesize(file, held)
    // EVERY synthesizable canvas's stack is handed over, designed or not: AD-22's round trip means a canvas the user
    // empties returns to untouched and re-renders THIS, and a canvas that was designed at load can be emptied too.
    defaults[key] = { schemaVersion: 1, instances: stack.instances }
    if (stack.dropped.length > 0) dropped[canvas] = stack.dropped
    // AD-22: no row, or a row with zero instances, is untouched — and only then does the canvas OPEN on its default
    // stack and carry D5a's marker.
    if (isDesigned(docs[key] ?? { schemaVersion: 1, instances: [] })) continue
    docs[key] = defaults[key] as ProjectDoc
    synthesized.push(canvas)
  }

  return {
    docs,
    entries,
    rows: Object.fromEntries(Object.values(entries).map((e) => [e.id, pilotRows(e)])),
    memberVisibility: Object.fromEntries(Object.values(entries).map((e) => [e.id, carriesMemberVisibility(e.id)])),
    pool: imagePool(),
    swatches: referenceSwatches(),
    links: linkResources(),
    // the dataset's own zone, as `/controls` and `/pilots` read it, until 5.18 reads the connected site's
    timezone: orbitWeekly.site().timezone,
    plan,
    canvases,
    synthesized,
    defaults,
    dropped,
  }
}
