'use server'

import { revalidatePath } from 'next/cache'
import { isRtl, languageRefusal } from '@inflozo/library/languages'
// SERVER ONLY: FR-Q8's one judge, on intl-messageformat 5.4.3 exactly as both Ghost majors bundle it
import { overrideRefusal, OVERRIDE_WORDS } from '@inflozo/library/override'
import { canvasPath, isUuid } from '@/lib/editor'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

/**
 * STORY 7.12 — TRANSLATIONS' THREE WRITES (FR-Q6, FR-Q8), in Theme settings' pattern (`../actions.ts`): the project id from
 * the form, the rule asked BEFORE anything is written, the caller's own session (`supabaseServer()`, RLS decides — another
 * user's project reaches zero rows, which is the same answer as "no such project"), `.select()` so a zero-row write is seen,
 * and the project's whole subtree revalidated, because the canvas renders what these store (FR-H5).
 *
 * A REFUSAL STORES NOTHING AND NEVER REPAIRS (FR-Q8): `overrideRefusal` answers a sentence naming the problem in the
 * customer's own string, and that sentence is the answer. Every database refusal — `23514` from `credit_namespace_locked`,
 * `42501` from RLS's check, a zero-row write — is "We couldn't save that just now.", never a 500 and never a Postgres code.
 * No migration: the table, its key, its check and its grants are Story 1.2's (`20260904120000_complete_schema.sql:343-355`,
 * `:1022`), as are `projects.language` and `rtl_ack_at` in the update grant (`:1210`).
 *
 * Each takes `(previous, formData)` so a form drives it through `useActionState`; the page needs JavaScript (Story 3.9's
 * Question 5, Story 7.9's Question 3) and every control is still a plain form.
 */

export type TranslationResult = { ok: true } | { error: string }

const unsaved = (): TranslationResult => ({ error: OVERRIDE_WORDS.unsaved })

const idOf = (formData: FormData) => {
  const id = formData.get('project')
  return typeof id === 'string' && isUuid(id) ? id : null
}

/** The project's whole subtree, as Next sees it (under the internal `/app` prefix): the editor reads the overrides too. */
const revalidateProject = (id: string) => revalidatePath(`/app${canvasPath(id)}`, 'layout')

/** One override, judged before the write and upserted on `(project_id, catalog_key)`. A typed override replaces one the
 *  migration map carried forward, so `superseded_from` is cleared with it. */
export async function saveOverride(_previous: TranslationResult | null, formData: FormData): Promise<TranslationResult> {
  const id = idOf(formData)
  const key = formData.get('key')
  if (!id || typeof key !== 'string') return unsaved()
  const value = formData.get('value')
  const refused = overrideRefusal(key, value)
  if (refused !== null) return { error: refused }
  const user = await signedIn()
  const { data, error } = await (await supabaseServer())
    .from('translation_overrides')
    .upsert(
      { project_id: id, user_id: user.id, catalog_key: key, value: value as string, superseded_from: null, updated_at: new Date().toISOString() },
      { onConflict: 'project_id,catalog_key' },
    )
    .select('catalog_key')
  if (error || !data || data.length === 0) {
    console.error('projects/translations: override write failed', { code: error?.code })
    return unsaved()
  }
  revalidateProject(id)
  return { ok: true }
}

/** Use the default (R-106: its own action, never a blank): the row is deleted, and the label falls back to the default. */
export async function resetOverride(_previous: TranslationResult | null, formData: FormData): Promise<TranslationResult> {
  const id = idOf(formData)
  const key = formData.get('key')
  if (!id || typeof key !== 'string') return unsaved()
  await signedIn()
  const { data, error } = await (await supabaseServer())
    .from('translation_overrides')
    .delete()
    .eq('project_id', id)
    .eq('catalog_key', key)
    .select('catalog_key')
  if (error || !data || data.length === 0) {
    console.error('projects/translations: override delete failed', { code: error?.code })
    return unsaved()
  }
  revalidateProject(id)
  return { ok: true }
}

/**
 * The project's language: Ghost's own code rule first (`languageRefusal` — which also keeps `/`, `\` and `.` out of the
 * locale file's name, AD-36), stored exactly. A right-to-left language needs Appendix G's acknowledgement in the SAME write
 * (`acknowledged`, B18's Understood); leaving RTL clears it, so a later RTL choice asks again. With overrides stored, a
 * change of language needs the page's confirm (`confirmed`, R-134) — and the overrides stay, to ship in the new language's
 * file. A post without either is refused, so a hand-made POST cannot skip them.
 */
export async function setLanguage(_previous: TranslationResult | null, formData: FormData): Promise<TranslationResult> {
  const id = idOf(formData)
  if (!id) return unsaved()
  const code = formData.get('language')
  const refused = languageRefusal(code)
  if (refused !== null) return { error: refused }
  const language = code as string
  await signedIn()
  const supabase = await supabaseServer()
  const [project, stored] = await Promise.all([
    supabase.from('projects').select('language').eq('id', id).maybeSingle(),
    supabase.from('translation_overrides').select('catalog_key', { count: 'exact', head: true }).eq('project_id', id),
  ])
  if (project.error || !project.data || stored.error) {
    console.error('projects/translations: language read failed', { code: project.error?.code ?? stored.error?.code })
    return unsaved()
  }
  const rtl = isRtl(language)
  if (rtl && formData.get('acknowledged') !== 'yes') return unsaved()
  if (language !== project.data.language && (stored.count ?? 0) > 0 && formData.get('confirmed') !== 'yes') return unsaved()
  const { data, error } = await supabase
    .from('projects')
    .update({ language, rtl_ack_at: rtl ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/translations: language write failed', { code: error?.code })
    return unsaved()
  }
  revalidateProject(id)
  return { ok: true }
}
