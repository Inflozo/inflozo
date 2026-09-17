import { cache } from 'react'
import { orbitWeekly, type SectionRegistryEntry } from '@inflozo/library'
import { parseDoc, type ProjectDoc } from '@inflozo/section-runtime'
import type { DesignRows } from '@/lib/canvas'
import type { LinkResources } from '@/components/controls/link-picker'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { isUuid, SITE } from '@/lib/editor'
import { resolveEntitlement } from '@/lib/entitlement'
import type { PlanId } from '@/lib/plan'
import { pilot, pilotRows } from '@/lib/pilots'
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
 * Since Story 5.2 it also hands over what the section panel needs — the inputs `/pilots` feeds `Sidebar` (swatches, link
 * resources, the site's time zone, each pool picture's size) — and the account's plan, for R-119's Pro badge. The plan
 * comes from AD-28's one resolver, so a failed read shows the badge (Free) rather than hiding it.
 */

export const projectOf = cache(async (id: string): Promise<{ id: string; name: string } | null> => {
  if (!isUuid(id)) return null
  const { data, error } = await (await supabaseServer()).from('projects').select('id, name').eq('id', id).maybeSingle()
  if (error) throw new Error(`the project could not be read (${error.code})`)
  return data
})

/** The template file a stored key compiles into. `custom:custom-x.hbs` names its own. Every row of the project is
 *  checked, so a key with no `.hbs` of its own — `paywall` (5.20), `cards` (7.13) — throws for the whole editor the day
 *  its writer lands; the story that writes it extends this map in the same change (review, 2026-09-17). */
const fileOf = (key: string) =>
  key === SITE.key ? SITE.file : key.startsWith('custom:') ? key.slice('custom:'.length) : `${key}.hbs`

export type EditorData = {
  docs: Readonly<Record<string, ProjectDoc>>
  entries: Readonly<Record<string, SectionRegistryEntry>>
  rows: Readonly<Record<string, DesignRows>>
  pool: readonly { id: string; bytes: number }[]
  swatches: Readonly<Record<string, string>>
  links: LinkResources
  /** the site's time zone name, printed under a date control */
  timezone: string
  plan: PlanId
}

export async function editorData(projectId: string): Promise<EditorData> {
  const [{ data, error }, { plan }] = await Promise.all([
    (await supabaseServer()).from('project_templates').select('template_key, doc').eq('project_id', projectId),
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
  return {
    docs,
    entries,
    rows: Object.fromEntries(Object.values(entries).map((e) => [e.id, pilotRows(e)])),
    pool: imagePool(),
    swatches: referenceSwatches(),
    links: linkResources(),
    // the dataset's own zone, as `/controls` and `/pilots` read it, until 5.18 reads the connected site's
    timezone: orbitWeekly.site().timezone,
    plan,
  }
}
