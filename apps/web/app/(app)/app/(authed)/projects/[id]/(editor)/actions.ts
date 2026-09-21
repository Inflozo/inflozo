'use server'

import { orbitWeekly } from '@inflozo/library'
import { CANVASES, canvasOfTemplateKey, isUuid } from '@/lib/editor'
import { SAVE_REFUSED, type Subject } from '@/lib/preview-subject'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

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

export type SubjectResult = { ok: true } | { error: string }

export async function setPreviewSubject(projectId: string, templateKey: string, subject: Subject): Promise<SubjectResult> {
  if (!isUuid(projectId)) return { error: SAVE_REFUSED }
  const canvas = canvasOfTemplateKey(templateKey)
  if (canvas === null || typeof subject?.slug !== 'string' || subject.slug === '') return { error: SAVE_REFUSED }
  if (orbitWeekly.subjectKindOf(CANVASES[canvas].file) !== subject.kind) return { error: SAVE_REFUSED }

  const user = await signedIn()
  const supabase = await supabaseServer()
  const { error } = await supabase.from('project_template_prefs').upsert(
    {
      project_id: projectId,
      user_id: user.id,
      template_key: templateKey,
      preview_subject: { kind: subject.kind, slug: subject.slug },
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
