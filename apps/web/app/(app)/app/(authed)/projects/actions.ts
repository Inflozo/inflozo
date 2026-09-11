'use server'

import { revalidatePath } from 'next/cache'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap, capSentence, type PlanId } from '@/lib/plan'
import { copyName, matchesName, NAME_HINT, nameSchema, nextUntitled, slugAttempts, slugify } from '@/lib/projects'
import { defaultStylePack } from '@/lib/style-pack'
import { signedIn, supabaseServer } from '@/lib/supabase/server'

/**
 * FR-B3's four writes, and FR-B4's cap in front of two of them.
 *
 * EVERY ONE OF THEM GOES THROUGH THE USER'S OWN SESSION — `supabaseServer()`, the publishable
 * key, the caller's cookies — so RLS is exercised by every mutation rather than bypassed. The
 * spine's Mutation row allows exactly this for AD-6 owner-policy tables, and `projects` is one.
 * Story 2.1 added the app's one service-role client (`supabaseAdmin()`, `server.ts`) and it is
 * fenced to a single caller — the `feature_flags` read — so nothing here changes: every write
 * below still goes through the caller's own session.
 *
 * Only async functions may be exported from a `'use server'` module, which is why every pure
 * part — the name rules, the slug, the plan table — lives in `lib/` and is proved by
 * `node --test` next door.
 *
 * Each takes `(previous, formData)` because each is driven by `useActionState` from the dialog
 * that owns it; the ids and the typed name ride in the form, never in a closure, so every one
 * of them also works with JavaScript switched off.
 */

type Code = 'at_cap' | 'bad_name' | 'name_mismatch' | 'failed'

export type ActionResult = { ok: true } | { error: { code: Code; message: string } }

/** The frame carries no wording for a failed write, so each is one plain sentence in S3's voice. */
const COULD_NOT = {
  create: "We couldn't create that just now. Try again in a moment.",
  duplicate: "We couldn't duplicate that just now.",
  rename: "We couldn't rename that just now.",
  delete: "We couldn't delete that just now.",
}

const fail = (code: Code, message: string): ActionResult => ({ error: { code, message } })

/** Logged without the name or the id: logs carry no user content (spine, Security floor). */
function logged(where: string, error: { code?: string; message?: string } | null, message: string): ActionResult {
  console.error(`projects: ${where} failed`, { code: error?.code })
  return fail('failed', message)
}

/** `proxy.ts` rewrites `app.inflozo.com/` onto `/app`, so the dashboard's own path is `/app`. */
const DASHBOARD = '/app'

const idOf = (formData: FormData) => {
  const id = formData.get('id')
  return typeof id === 'string' && id ? id : null
}

/**
 * The cap is counted and then written, rather than enforced by a trigger: the limit depends on
 * the plan, and the PRD asks for a CONTEXTUAL PROMPT at creation time, which is an application
 * answer and not a constraint violation.
 * ponytail: count-then-insert; a double submit is refused by the sheet's form while an action is
 * in flight (a label swap alone did not stop React queueing the second — review, 2026-09-06), and
 * a trigger on projects reading entitlements is the upgrade if a race ever lands two. THE SLUG
 * half of that race is no longer open — `unique (user_id, slug)` refuses it and `insertProject`
 * retries (DW-24, Story 3.9) — but the CAP's half is: the count and the insert are still two
 * statements, and only a trigger can close that one.
 */
async function names() {
  const user = await signedIn()
  const supabase = await supabaseServer()
  const [{ data, error }, { plan }] = await Promise.all([
    supabase.from('projects').select('name, slug'),
    resolveEntitlement(user.id),
  ])
  if (error || !data) {
    // The callers log `code: undefined` for a failed pre-count; the code that failed is here.
    console.error('projects: read failed', { code: error?.code })
    return null
  }
  return {
    user,
    supabase,
    taken: data.map((row) => row.name),
    // The slugs too: a rename keeps its slug, so the names alone do not say which are free.
    slugs: data.map((row) => row.slug),
    plan,
  }
}

/**
 * THE INSERT, WITH THE DATABASE'S OWN ANSWER TAKEN SERIOUSLY — DW-24, and the half of it that is
 * code rather than schema.
 *
 * `uniqueSlug` reads the taken slugs and then inserts, which is a read-then-write: two of one
 * customer's own requests overlapping can both read the same free slug. Since 2026-09-11
 * `public.projects` carries `unique (user_id, slug)`, so the loser is refused with `23505` instead
 * of two rows sharing a slug that FR-J10 turns into a theme name.
 *
 * `23505` FROM THESE TWO INSERTS CAN ONLY BE THE SLUG, and that is a property of what they write
 * rather than of the table: `projects` has exactly two unique constraints on insertable columns —
 * this one and the partial one on `linked_site_id` — and NEITHER caller here sets
 * `linked_site_id` (`duplicateProject` deliberately leaves it out of its select list so it cannot
 * be spread in). `useBrand` in `sites/actions.ts` DOES set it, which is why its retry re-decides
 * rather than re-slugs.
 *
 * Both callers share this, so the retry is in one place and not in each of them — and a third
 * insert added later gets it by using this rather than by remembering to.
 */
async function insertProject(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  row: Record<string, unknown>,
  base: string,
  slugs: readonly string[],
) {
  let last = null
  for (const slug of slugAttempts(base, slugs)) {
    const { error } = await supabase.from('projects').insert({ ...row, slug })
    if (!error) return null
    if (error.code !== '23505') return error
    last = error
  }
  return last
}

/**
 * The page's `atCap` was drawn from an older count — a second tab filled the cap since — so
 * the page is re-rendered with the true one before the refusal is answered: the sheet then
 * opens as D4b and S3c's tile appears, rather than D4a with a live Create (review, 2026-09-05).
 */
function refusedAtCap(plan: PlanId): ActionResult {
  revalidatePath(DASHBOARD)
  return fail('at_cap', capSentence(plan))
}

export async function createProject(_previous: ActionResult | null, _formData: FormData): Promise<ActionResult> {
  const context = await names()
  if (!context) return logged('create', null, COULD_NOT.create)
  const { user, supabase, taken, slugs, plan } = context

  if (atCap(plan, taken.length)) return refusedAtCap(plan)

  const name = nextUntitled(taken)
  const error = await insertProject(
    supabase,
    { user_id: user.id, name, style_pack: defaultStylePack() },
    slugify(name),
    slugs,
  )
  if (error) return logged('create', error, COULD_NOT.create)

  revalidatePath(DASHBOARD)
  return { ok: true }
}

/** FR-J10: a rename changes the DISPLAY name only. `slug` is never rewritten. */
export async function renameProject(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = idOf(formData)
  const parsed = nameSchema.safeParse(formData.get('name'))
  if (!parsed.success) return fail('bad_name', NAME_HINT)
  if (!id) return logged('rename', null, COULD_NOT.rename)
  await signedIn()

  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('projects')
    .update({ name: parsed.data })
    .eq('id', id)
    .select('id')
  if (error) return logged('rename', error, COULD_NOT.rename)
  // Another user's id reaches zero rows through RLS rather than an error.
  if (!data || data.length === 0) return logged('rename', null, COULD_NOT.rename)

  revalidatePath(DASHBOARD)
  return { ok: true }
}

export async function duplicateProject(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = idOf(formData)
  const context = await names()
  if (!context || !id) return logged('duplicate', null, COULD_NOT.duplicate)
  const { user, supabase, taken, slugs, plan } = context

  if (atCap(plan, taken.length)) return refusedAtCap(plan)

  // Every column `authenticated` may insert, and nothing the server asserts: `revision` is
  // AD-15's lineage marker and starts fresh, and the new row gets its own slug.
  // `linked_site_id` IS DELIBERATELY NOT SELECTED, so it cannot be spread into the insert and
  // defaults to null. It is null on every 1.5 project, so carrying it forward showed nothing
  // today and would have made a duplicate inherit E3's binding the moment E3 lands — two
  // projects pointing at one site, which is the thing FR-B5 forbids. Leaving the column out is
  // the version of that decision that cannot rot (review, 2026-09-05); E3 makes it on purpose.
  const { data: source, error: readError } = await supabase
    .from('projects')
    .select('name, style_pack, dark_enabled, language, posts_per_page, credit_enabled, rtl_ack_at')
    .eq('id', id)
    .maybeSingle()
  if (readError) return logged('duplicate', readError, COULD_NOT.duplicate)
  if (!source) return logged('duplicate', null, COULD_NOT.duplicate)

  const name = copyName(source.name, taken)
  const error = await insertProject(supabase, { ...source, user_id: user.id, name }, slugify(name), slugs)
  if (error) return logged('duplicate', error, COULD_NOT.duplicate)

  revalidatePath(DASHBOARD)
  return { ok: true }
}

/**
 * The typed confirm is re-checked HERE and the client is never trusted with it: the dialog's
 * greyed button is a courtesy, this is the control.
 */
export async function deleteProject(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = idOf(formData)
  const typed = formData.get('typed')
  if (!id || typeof typed !== 'string') return logged('delete', null, COULD_NOT.delete)
  await signedIn()

  const supabase = await supabaseServer()
  const { data: project, error: readError } = await supabase
    .from('projects')
    .select('name')
    .eq('id', id)
    .maybeSingle()
  if (readError) return logged('delete', readError, COULD_NOT.delete)
  // Not found, or another user's — RLS makes those the same answer, which is the point.
  if (!project) return logged('delete', null, COULD_NOT.delete)

  if (!matchesName(typed, project.name)) {
    return fail('name_mismatch', "That's not this project's name.")
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return logged('delete', error, COULD_NOT.delete)

  revalidatePath(DASHBOARD)
  return { ok: true }
}
