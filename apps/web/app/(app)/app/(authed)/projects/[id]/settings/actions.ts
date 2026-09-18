'use server'

import { revalidatePath } from 'next/cache'
import { clearDarkOverrides, parseDoc } from '@inflozo/section-runtime'
import type { ProjectDoc } from '@inflozo/section-runtime'
import { isUuid, settingsPath } from '@/lib/editor'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

/**
 * R-131's TWO WRITES, and nothing else.
 *
 * Both go through the CALLER'S OWN SESSION (`supabaseServer()`, the publishable key, the caller's cookies), so RLS
 * decides what exists for them: `projects` and `project_templates` are AD-6 owner-policy tables and the uniform owner
 * policy (`schema:825`) already makes `dark_enabled` owner-writable, so this story adds no policy and no migration
 * (R-99 — the column pre-exists at `20260904120000_complete_schema.sql:224`). Another user's project id reaches zero
 * rows rather than an error, which is the same answer as "no such project" and the point.
 *
 * AD-31: `projects` carries fields only the server may assert, so each action touches exactly the column it came for.
 * `setProjectMode` writes `dark_enabled` and nothing else — never `revision`, never `style_pack`.
 *
 * NOTHING IS DELETED BY A MODE CHANGE (FR-D7, AD-17). Light only changes what is IN FORCE and not what is stored: every
 * `darkOverrides` map survives it untouched, and switching back reapplies each one exactly. The only thing in the
 * product that removes one is a deliberate clear — this file's second action, and `editor.tsx`'s per-section confirm.
 *
 * Each takes `(previous, formData)` so a form drives it through `useActionState`, and the project id rides in the form
 * rather than in a closure — so both also work with JavaScript switched off.
 */

export type SettingsResult = { ok: true } | { error: string }

const COULD_NOT = {
  mode: "We couldn't change that just now. Try again in a moment.",
  clear: "We couldn't clear those just now. Try again in a moment.",
}

const idOf = (formData: FormData) => {
  const id = formData.get('project')
  return typeof id === 'string' && isUuid(id) ? id : null
}

/** FR-D7's project mode: Light only, or Light + Dark. */
export async function setProjectMode(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  const dark = formData.get('dark')
  if (!id || (dark !== 'on' && dark !== 'off')) return { error: COULD_NOT.mode }
  await signedIn()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('projects')
    .update({ dark_enabled: dark === 'on' })
    .eq('id', id)
    .select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/settings: mode write failed', { code: error?.code })
    return { error: COULD_NOT.mode }
  }
  revalidatePath(settingsPath(id))
  return { ok: true }
}

/**
 * D6a's project-level clear: every section of every canvas, its dark version following its light one again.
 *
 * ONE definition of what a clear MEANS — `clearDarkOverrides`, the same function the per-section confirm calls
 * (`doc-edit.ts`), applied instance by instance so 5.8's journal and Epic 7's compiler read the rule rather than
 * re-derive it. A row whose doc holds no override is not written at all, so the write touches only what it must.
 */
export async function clearProjectDarkOverrides(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  if (!id) return { error: COULD_NOT.clear }
  await signedIn()

  const supabase = await supabaseServer()
  const { data, error } = await supabase.from('project_templates').select('template_key, doc').eq('project_id', id)
  if (error) {
    console.error('projects/settings: templates read failed', { code: error.code })
    return { error: COULD_NOT.clear }
  }
  for (const row of data ?? []) {
    const key = row.template_key as string
    let doc: ProjectDoc = parseDoc(row.doc, key)
    let changed = false
    for (const instance of doc.instances) {
      if (Object.keys(instance.darkOverrides).length === 0) continue
      const next = clearDarkOverrides(doc, instance.instanceId)
      // a sentence here would mean the instance left the doc between two lines of this loop
      if (typeof next === 'string') continue
      doc = next
      changed = true
    }
    if (!changed) continue
    const written = await supabase.from('project_templates').update({ doc }).eq('project_id', id).eq('template_key', key)
    if (written.error) {
      console.error('projects/settings: clear write failed', { code: written.error.code })
      return { error: COULD_NOT.clear }
    }
  }
  revalidatePath(settingsPath(id))
  return { ok: true }
}
