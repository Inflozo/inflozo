'use server'

import { revalidatePath } from 'next/cache'
import { checkSetting, claimKey, clearProject, ghostName, parseDoc, postsPerPage, SETTING_WORDS, settingKey, USER_SETTING_CAP } from '@inflozo/section-runtime'
import type { ProjectDoc, SettingGroup, SettingRow, Visibility } from '@inflozo/section-runtime'
import { isUuid, settingsPath, templateKeyOf } from '@/lib/editor'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import { placedControls, promotable, ruleRow, SETTING_COLUMNS, storedSettings, type StoredSetting } from '@/lib/theme-settings'
import { editorData, projectOf } from '../(editor)/read'

/** The route as NEXT sees it — under the internal `/app` prefix the proxy strips, which is the form every other
 *  action in the app revalidates (`projects/actions.ts`'s `DASHBOARD = '/app'`). `settingsPath` is the customer's
 *  address; this is the file-tree one. */
const routeOf = (id: string) => `/app${settingsPath(id)}`

/** Both writes change what the EDITOR shows too (the sun; the stored overrides), and it is a sibling route under the
 *  same `[id]` layout — so the project's whole subtree is revalidated, never the settings page alone. */
const revalidateProject = (id: string) => revalidatePath(routeOf(id).replace(/\/settings$/, ''), 'layout')

/**
 * R-131's TWO WRITES — and, since Story 7.9, Posts per page and the custom-settings builder's three, below them.
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
 * rather than in a closure — so each stays a plain form's action. The PAGE needs JavaScript: it streams behind its
 * `loading.tsx`, so with scripts off it stays on its skeleton (EXPERIENCE.md § Where the floor stops; Story 7.9's
 * Question 3, ruled option 1).
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
  revalidateProject(id)
  return { ok: true }
}

/**
 * D6a's project-level clear: every section of every canvas, its dark version following its light one again.
 *
 * ONE definition of what a clear MEANS — `clearDarkOverrides`, the same function the per-section confirm calls
 * (`doc-edit.ts`), applied instance by instance so 5.8's journal and Epic 7's compiler read the rule rather than
 * re-derive it. A row whose doc holds no override is not written at all, so the write touches only what it must.
 *
 * DW-197, CLOSED BY STORY 5.8. It used to write ROW BY ROW through PostgREST, with no transaction and no revision
 * check: a failure on the fourth template left three cleared and three not, and a clear racing the editor's own flush
 * could silently overwrite an edit the customer had just made. It now goes through `public.sync_project_doc()` — the
 * same `security definer` RPC AD-15's flush uses — so all of it lands in ONE transaction, the compare-and-set on
 * `projects.revision` refuses rather than clobbers, and there is ONE definition in the product of what a guarded doc
 * write is. `revision` is read first and handed back as `p_base`; a refusal means somebody wrote between the two, and
 * the customer is told to try again rather than having their editor's work quietly replaced.
 */
export async function clearProjectDarkOverrides(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  if (!id) return { error: COULD_NOT.clear }
  await signedIn()

  const supabase = await supabaseServer()
  // D6b's greyed Clear is refused HERE, not only by the button: `aria-disabled` still submits (a hand-made POST), and
  // "the overrides are kept, not discarded" is a promise about the database (FR-D7, AD-17). Review, 2026-09-18.
  // `revision` rides in on the SAME read the greyed-Clear refusal already needed, so the guard costs no extra query
  const project = await supabase.from('projects').select('dark_enabled, revision').eq('id', id).maybeSingle()
  if (project.error || !project.data || project.data.dark_enabled === false) return { error: COULD_NOT.clear }
  const { data, error } = await supabase.from('project_templates').select('template_key, doc').eq('project_id', id)
  if (error) {
    console.error('projects/settings: templates read failed', { code: error.code })
    return { error: COULD_NOT.clear }
  }
  const parsed: Record<string, ProjectDoc> = {}
  for (const row of data ?? []) {
    const key = row.template_key as string
    try {
      parsed[key] = parseDoc(row.doc, key)
    } catch {
      // a doc the editor would drop with a reason (`read.ts`) is not this action's to rewrite — and never a 500
    }
  }
  // DW-198 (Story 5.24e): the fold is `clearProject`'s, beside `clearDarkOverrides` where `doc-edit.test.ts` reaches it —
  // a remembered override (R-205) cleared with the rest, and only the docs that changed answered
  const cleared = clearProject(parsed)
  // NOTHING TO CLEAR IS A SUCCESS AND NOT A WRITE: the RPC would refuse an empty object, and advancing the revision
  // over a change nobody made would invalidate every open editor's `base_revision` for nothing.
  if (Object.keys(cleared).length === 0) {
    revalidateProject(id)
    return { ok: true }
  }
  const { data: answer, error: rpcError } = await supabase.rpc('sync_project_doc', {
    p_project: id,
    p_docs: cleared,
    p_base: project.data.revision,
  })
  if (rpcError || answer === null || (answer as { applied: boolean }).applied !== true) {
    console.error('projects/settings: clear write refused', { code: rpcError?.code, applied: (answer as { applied?: boolean } | null)?.applied ?? null })
    return { error: COULD_NOT.clear }
  }
  revalidateProject(id)
  return { ok: true }
}

/* ───────────────────────────── STORY 7.9 — Posts per page and the custom-settings builder ─────────────────────────────
 *
 * Every write goes through the caller's own session as the two above do, so RLS decides: the uniform owner policy and the
 * parent-ownership term (`…complete_schema.sql:816-855`) reach zero rows on another user's project, and the answer is the
 * one sentence. Every rule a setting must meet is the runtime's `checkSetting`, asked BEFORE the write; the database's own
 * constraints — the cap trigger, `unique (project_id, key)`, `custom_settings_key_frozen`, the column grants (no `key`, no
 * `frozen_at` in the update grant) — stay the floor, and a refusal from one is mapped to the module's sentence, never shown
 * as a Postgres code. No migration: every column, grant and trigger here exists since Story 1.2 (R-99). */

type Supabase = Awaited<ReturnType<typeof supabaseServer>>

/** FR-Q1's one column, alone (AD-31): a whole number from 1 to 100, else the module's sentence and the stored value stands. */
export async function setPostsPerPage(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  if (!id) return { error: SETTING_WORDS.couldNot }
  const size = postsPerPage(formData.get('posts_per_page'))
  if (typeof size === 'string') return { error: size }
  await signedIn()
  const { data, error } = await (await supabaseServer()).from('projects').update({ posts_per_page: size }).eq('id', id).select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/settings: posts per page write failed', { code: error?.code })
    return { error: SETTING_WORDS.couldNot }
  }
  // the editor's main feed is sized by it (FR-H2), so the project's whole subtree is read afresh
  revalidateProject(id)
  return { ok: true }
}

/** This project's settings, in their order — or null where the read failed. */
async function settingsOf(supabase: Supabase, id: string): Promise<StoredSetting[] | null> {
  const { data, error } = await supabase.from('custom_settings').select(SETTING_COLUMNS).eq('project_id', id).order('position').order('created_at')
  if (error) {
    console.error('projects/settings: custom settings read failed', { code: error.code })
    return null
  }
  return storedSettings(data)
}

/** The posted condition, in the type its target compares: none when no setting is named, a boolean target's `true`/`false`
 *  as JSON — anything else stays text, which `checkSetting` then refuses with its sentence. */
function conditionOf(formData: FormData, others: readonly SettingRow[]): Visibility | null {
  const key = formData.get('when_key')
  if (typeof key !== 'string' || key === '') return null
  const raw = formData.get('when_value')
  const value = typeof raw === 'string' ? raw : ''
  const boolean = others.find((o) => o.key === key)?.type === 'boolean'
  return { key, value: boolean && value === 'true' ? true : boolean && value === 'false' ? false : value }
}

/** A database refusal as the module's sentence: the cap trigger's `23514` (named by its message — the column checks share
 *  the code, and the module stops every one of them first), the key's uniqueness `23505`, the frozen key's `42501`. */
const refusalOf = (error: { code?: string; message?: string } | null, key: string): string =>
  error?.code === '23514' && /cap/.test(error.message ?? '')
    ? SETTING_WORDS.cap
    : error?.code === '23505'
      ? SETTING_WORDS.taken(key)
      : error?.code === '42501'
        ? SETTING_WORDS.frozen
        : SETTING_WORDS.couldNot

/**
 * QUESTION 1, RULED OPTION 1 — a toggle, segmented or named select promoted to a Ghost setting. The control is found again
 * HERE, through `editorData` (the read the page makes), so what is stored is a control on a visible instance of a stored
 * doc, at its current value, never one already promoted — whatever the form posted. The key is the label's, claimed past
 * the keys taken, worked out HERE as the form shows it, and nothing else posted can name one; the label stored is the name
 * Ghost makes of that key, because Ghost names a setting by its key alone (Question 6, ruled option 1, owner, 2026-10-10).
 */
export async function promoteControl(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  if (!id) return { error: SETTING_WORDS.couldNot }
  const user = await signedIn()
  const supabase = await supabaseServer()
  const rows = await settingsOf(supabase, id)
  if (rows === null || (await projectOf(id)) === null) return { error: SETTING_WORDS.couldNot }
  // the cap first, so a full project costs no docs read (the trigger's `23514` maps to the same words below)
  if (rows.length >= USER_SETTING_CAP) return { error: SETTING_WORDS.cap }
  const data = await editorData(id)
  const synthesized = new Set(data.synthesized.map(templateKeyOf))
  const chosen = promotable(placedControls(data.docs, data.entries, synthesized), rows)
    .find((c) => c.instanceId === formData.get('instance') && c.controlKey === formData.get('control'))
  if (chosen === undefined) return { error: SETTING_WORDS.noControl }

  const key = claimKey(new Set(rows.map((r) => r.key)), settingKey(String(formData.get('label') ?? '')))
  const others = rows.map(ruleRow)
  const row: SettingRow = {
    key,
    label: ghostName(key),
    ...chosen.setting,
    group_name: String(formData.get('group') ?? 'site_wide') as SettingGroup,
    visibility_condition: conditionOf(formData, others),
  }
  const refused = checkSetting(row, others)
  if (refused !== null) return { error: refused }

  const { error } = await supabase.from('custom_settings').insert({
    project_id: id,
    user_id: user.id,
    ...row,
    bound_to: { kind: 'control', instanceId: chosen.instanceId, controlKey: chosen.controlKey },
    position: Math.max(0, ...rows.map((r) => r.position)) + 1,
  })
  if (error) {
    console.error('projects/settings: promote failed', { code: error.code })
    return { error: refusalOf(error, row.key) }
  }
  revalidateProject(id)
  return { ok: true }
}

/** A stored setting edited — its group, default and condition, and NEVER its key or its label: the update grant omits `key`
 *  (FR-Q2), and Ghost names a setting by its key alone, so the label is the key's words and is fixed with it (Question 6,
 *  ruled option 1, owner, 2026-10-10) — a posted `label` is not read. */
export async function updateSetting(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  const settingId = formData.get('setting')
  if (!id || typeof settingId !== 'string' || !isUuid(settingId)) return { error: SETTING_WORDS.couldNot }
  await signedIn()
  const supabase = await supabaseServer()
  const rows = await settingsOf(supabase, id)
  const current = rows?.find((r) => r.id === settingId)
  if (rows === null || current === undefined) return { error: SETTING_WORDS.couldNot }
  const others = rows.filter((r) => r !== current).map(ruleRow)
  const posted = (name: string) => {
    const v = formData.get(name)
    return typeof v === 'string' ? v : null
  }
  const row: SettingRow = {
    ...ruleRow(current),
    group_name: (posted('group') ?? current.group_name) as SettingGroup,
    default_value: posted('default') ?? current.default_value,
    visibility_condition: conditionOf(formData, others),
  }
  const refused = checkSetting(row, others)
  if (refused !== null) return { error: refused }
  const { data, error } = await supabase
    .from('custom_settings')
    .update({ group_name: row.group_name, default_value: row.default_value, visibility_condition: row.visibility_condition, updated_at: new Date().toISOString() })
    .eq('id', current.id)
    .eq('project_id', id)
    .select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/settings: setting update failed', { code: error?.code })
    return { error: refusalOf(error, row.key) }
  }
  revalidateProject(id)
  return { ok: true }
}

/** A setting deleted, and every condition that names it cleared FIRST — so a failure part-way leaves a setting with no
 *  dangling condition rather than a condition naming a setting that is gone (the confirm, R-134, is the page's). */
export async function deleteSetting(_previous: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const id = idOf(formData)
  const settingId = formData.get('setting')
  if (!id || typeof settingId !== 'string' || !isUuid(settingId)) return { error: SETTING_WORDS.couldNot }
  await signedIn()
  const supabase = await supabaseServer()
  const rows = await settingsOf(supabase, id)
  const target = rows?.find((r) => r.id === settingId)
  if (rows === null || target === undefined) return { error: SETTING_WORDS.couldNot }
  const naming = rows.filter((r) => r.visibility_condition?.key === target.key).map((r) => r.id)
  if (naming.length > 0) {
    const cleared = await supabase
      .from('custom_settings')
      .update({ visibility_condition: null, updated_at: new Date().toISOString() })
      .in('id', naming)
      .eq('project_id', id)
      .select('id')
    if (cleared.error || cleared.data.length !== naming.length) {
      console.error('projects/settings: condition clear failed', { code: cleared.error?.code })
      return { error: SETTING_WORDS.couldNot }
    }
  }
  const { data, error } = await supabase.from('custom_settings').delete().eq('id', target.id).eq('project_id', id).select('id')
  if (error || !data || data.length === 0) {
    console.error('projects/settings: setting delete failed', { code: error?.code })
    return { error: SETTING_WORDS.couldNot }
  }
  revalidateProject(id)
  return { ok: true }
}
