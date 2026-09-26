'use server'

import { orbitWeekly } from '@inflozo/library'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, isUuid } from '@/lib/editor'
import { SAVE_REFUSED, type Subject } from '@/lib/preview-subject'
import type { Members } from '@/lib/probe-rule'
import { VISITORS, readViewed } from '@/lib/view-as'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import { readMembers } from '@/server/site-probe'

/**
 * STORY 5.13 — THE ONE WRITE THE EDITOR'S OWN CHROME MAKES (FR-D22).
 *
 * `project_template_prefs.preview_subject` has been in the schema since the complete-schema migration with **no
 * reader and no writer anywhere**; this is both. Its grants are in place, §10a's owner policy and §10a-ii's
 * parent-owned restrictive both cover it, and DW-193 fixed its `template_key_shape` on this table too at Story 5.8 —
 * so there is no column to add and therefore **no Schema phase** (R-99).
 *
 * THROUGH THE CALLER'S OWN SESSION (`supabaseServer()`, the publishable key, their cookies), so RLS decides what
 * exists for them: another user's project id reaches zero rows rather than an error, which is the same answer as "no
 * such project" and is the point. `user_id` is the caller's own, which the row requires and the policy checks.
 *
 * NOT A FORM SUBMIT, and deliberately: the canvas has already repainted when this is called, so there is no wait for
 * R-98's busy label to describe. It is called from the client handler inside a `useTransition`, and a refusal comes
 * back as ONE sentence the menu carries — the chosen subject stands for the session, and what the customer needs to
 * know is that it will not survive a reload.
 *
 * WHAT IS VALIDATED HERE, at the trust boundary: the project id's shape, that the template key names a canvas this
 * product opens, and that the subject's KIND is the one that canvas can carry — asked of `orbitWeekly.subjectKindOf`
 * over `placement.ts`'s own table, so this guard and the pill can never disagree about a template (standing rule 3).
 * The SLUG is not checked against the source: `resolveSubject` is the reader's guard and falls back to the fixture
 * with a sentence, which is also what must happen when a row that existed at write time is gone by read time.
 */

/** Ghost's own bound on a slug (`posts.slug varchar(191)`): the slug is not checked against the source here, so
 *  its length is the one guard left on caller-controlled text that is stored and echoed into the pill. */
const SLUG_MAX = 191

export type SubjectResult = { ok: true } | { error: string }

export async function setPreviewSubject(projectId: string, templateKey: string, subject: Subject): Promise<SubjectResult> {
  if (!isUuid(projectId)) return { error: SAVE_REFUSED }
  const canvas = canvasOfTemplateKey(templateKey)
  if (canvas === null || typeof subject?.slug !== 'string' || subject.slug === '' || subject.slug.length > SLUG_MAX) return { error: SAVE_REFUSED }
  if (orbitWeekly.subjectKindOf(CANVASES[canvas].file) !== subject.kind) return { error: SAVE_REFUSED }
  // Story 5.18 — the one mark a subject may carry: chosen over the connected site. Anything else is refused, never kept
  if (subject.source !== undefined && subject.source !== 'site') return { error: SAVE_REFUSED }

  const user = await signedIn()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('project_template_prefs').upsert(
    {
      project_id: projectId,
      user_id: user.id,
      template_key: templateKey,
      // STORY 5.18 — A SUBJECT IS ONLY "GONE" FROM THE SOURCE IT WAS CHOSEN FROM, so one chosen over the site is stored
      // with that mark (`jsonb`, no migration) and a sample one exactly as before — nothing extra
      preview_subject: subject.source === 'site' ? { kind: subject.kind, slug: subject.slug, source: 'site' } : { kind: subject.kind, slug: subject.slug },
      // the column defaults to `now()` on INSERT only, so the UPDATE half of the upsert sets it or a row keeps the
      // timestamp of the first choice ever made on that canvas
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id,template_key' },
  )
  if (error) {
    console.error('projects/editor: preview subject write failed', { code: error.code })
    return { error: SAVE_REFUSED }
  }
  return { ok: true }
}

/**
 * STORY 5.14 — FR-D16'S "LOOKED AT" RECORD, per canvas (`project_template_prefs.member_states_viewed`).
 *
 * The column's FIRST WRITER, and `read.ts` its first reader: it has been in the complete-schema migration since day one
 * with no reader and no writer — AD-22 names it as the home of "FR-D16's viewed member states" precisely because a
 * look is never an edit — so there is nothing to add and therefore **no Schema phase** (R-99). Its grants and both
 * policies are the ones `setPreviewSubject` already writes through.
 *
 * `setPreviewSubject`'s shape, and for the same reasons: THROUGH THE CALLER'S OWN SESSION, so RLS decides what exists
 * for them, and NOT A FORM SUBMIT — the canvas has repainted long before this runs, so there is nothing for R-98's busy
 * label to describe. The editor sends only the rows `afterChange` or `seen` changed, down one promise chain.
 *
 * ONE UPSERT, NAMING ONLY ITS OWN COLUMN. PostgREST's merge updates the columns the payload names and no others, so
 * this can never clear a subject and `setPreviewSubject` can never clear a record — a claim to EXECUTE at Review on the
 * real database (standing rule 1), in both orders, before anyone relies on it.
 *
 * WHAT IS VALIDATED HERE, at the trust boundary: the project id's shape; that every key names a canvas this product
 * opens (`canvasOfTemplateKey`, so `site` and junk are refused) or a canvas's PAGE 2, which keeps a record of its own
 * since Story 5.16 (R-167; `canvasOfPageTwoKey`); that every state is one of the three visitors; and at
 * most one row per canvas — two rows for one key in one upsert is a malformed call, and Postgres would refuse it anyway.
 * The states are deduplicated into canonical order by `readViewed`, the reader's own guard. A refusal is ONE answer and
 * the editor only logs it: the record is bookkeeping, and a lost one costs a reminder after a reload.
 */
const VIEWED_REFUSED = 'The canvases you have looked at could not be saved.'

export async function setViewedStates(
  projectId: string,
  rows: readonly { templateKey: string; states: readonly string[] }[],
): Promise<SubjectResult> {
  if (!isUuid(projectId) || !Array.isArray(rows) || rows.length === 0) return { error: VIEWED_REFUSED }
  const keys = new Set<string>()
  for (const row of rows) {
    const key = row?.templateKey
    // a canvas, or a canvas's page 2 (Story 5.16); the SUBJECT stays per canvas — `setPreviewSubject` accepts no page-2 key
    const page = typeof key === 'string' && (canvasOfTemplateKey(key) !== null || canvasOfPageTwoKey(key) !== null)
    if (!page || keys.has(key)) return { error: VIEWED_REFUSED }
    if (!Array.isArray(row.states) || !row.states.every((state: unknown) => (VISITORS as readonly unknown[]).includes(state))) {
      return { error: VIEWED_REFUSED }
    }
    keys.add(key)
  }

  const user = await signedIn()
  const supabase = await supabaseServer()
  // one timestamp for the one statement: the column defaults to `now()` on INSERT only, so the UPDATE half sets it
  const updatedAt = new Date().toISOString()
  const { error } = await supabase.from('project_template_prefs').upsert(
    rows.map((row) => ({
      project_id: projectId,
      user_id: user.id,
      template_key: row.templateKey,
      member_states_viewed: readViewed(row.states),
      updated_at: updatedAt,
    })),
    { onConflict: 'project_id,template_key' },
  )
  if (error) {
    console.error('projects/editor: viewed member states write failed', { code: error.code })
    return { error: VIEWED_REFUSED }
  }
  return { ok: true }
}

/**
 * STORY 5.20 — C3b's **Re-check**, and the Paywall canvas's background re-check on open (FR-H6): the linked site's member
 * switches read again from Ghost and written to the one record every warning reads (`site_settings.members`).
 *
 * WHOSE SITE IS DECIDED BY RLS: the project is read through the caller's own session, so another user's project id reaches
 * no row and no Ghost is asked — the same answer as "no linked site". The read itself is `readMembers`, the site probe's
 * one Admin `settings/` read through the chokepoint (AD-10); this file imports neither the chokepoint nor the service role.
 *
 * NOT A FORM SUBMIT: the button says "Re-checking…" from a transition (R-98, `aria-busy`, never `disabled`), and the
 * refusal is ONE sentence the editor words with the site's own name (`PAYWALL_WORDS.refused`) — only the fact travels.
 */
export type MembersResult = { members: Members } | { refused: true }

const ROUTE = 'projects/editor/recheck-members'

export async function recheckMembers(projectId: string): Promise<MembersResult> {
  if (!isUuid(projectId)) return { refused: true }
  const user = await signedIn()
  const supabase = await supabaseServer()
  const { data, error } = await supabase.from('projects').select('linked_site_id').eq('id', projectId).maybeSingle()
  if (error || !data?.linked_site_id) {
    if (error) console.error('projects/editor: members re-check could not read the project', { code: error.code })
    return { refused: true }
  }
  const members = await readMembers({ siteId: data.linked_site_id as string, userId: user.id, route: ROUTE })
  return members === null ? { refused: true } : { members }
}
