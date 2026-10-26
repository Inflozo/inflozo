'use server'

import { orbitWeekly } from '@inflozo/library'
import { CONNECT_MAX, hostOf, tokenRefusal } from '@/lib/connect-rule'
import { BACKUP_WORDS, DEPLOY_WORDS, shipStateOf, SNAPSHOT_WORDS } from '@/lib/deploy'
import { canvasOfPageTwoKey, canvasOfTemplateKey, fileOf, isUuid } from '@/lib/editor'
import { confirmedFrom, SWITCH_WORDS, switchWith, type SwitchAnswer } from '@/lib/site-switch'
import { SAVE_REFUSED, type Subject } from '@/lib/preview-subject'
import type { Members, Surfaces } from '@/lib/probe-rule'
import { VISITORS, readViewed } from '@/lib/view-as'
import { quietSession, supabaseAdmin } from '@/lib/supabase/server'
import { holdsLock } from '@/server/edit-lock'
import { readSettings } from '@/server/site-probe'
import { addStaffToken } from '@/server/staff-token'
import { ROUTES_IO } from '@/server/routes-io'
import { liveRoutesFile } from '@/server/routes-upload'
import { captureSnapshot, STORAGE } from '@/server/snapshot'
import { SNAPSHOT_IO } from '@/server/snapshot-io'

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
 *
 * A SIGNED-OUT CALL IS REFUSED, NEVER REDIRECTED (R-213, Story 5.24e) — in all three actions here. `signedIn()`
 * redirects, and Next navigates whatever the caller catches (`lib/action-redirect.ts`), so a tab whose session had
 * ended was taken off the editor — and away from the only copy of work it might hold — by a preview subject or a look.
 * The owner declined exactly that (5.24's Question 3, option 3). `quietSession()` and each action's existing refusal
 * instead; the editor's Signed out state is what says the session has gone. QUIET, because reading the user the
 * ordinary way dropped a dead session's cookies inside the action, and Next then re-rendered the route into the
 * layout's own redirect (the review, 2026-10-02 — `lib/supabase/server.ts` has the execution).
 */

/** Ghost's own bound on a slug (`posts.slug varchar(191)`): the slug is not checked against the source here, so
 *  its length is the one guard left on caller-controlled text that is stored and echoed into the pill. */
const SLUG_MAX = 191

export type SubjectResult = { ok: true } | { error: string }

export async function setPreviewSubject(projectId: string, templateKey: string, subject: Subject): Promise<SubjectResult> {
  if (!isUuid(projectId)) return { error: SAVE_REFUSED }
  const canvas = canvasOfTemplateKey(templateKey)
  if (canvas === null || typeof subject?.slug !== 'string' || subject.slug === '' || subject.slug.length > SLUG_MAX) return { error: SAVE_REFUSED }
  if (orbitWeekly.subjectKindOf(fileOf(canvas)) !== subject.kind) return { error: SAVE_REFUSED }
  // Story 5.18 — the one mark a subject may carry: chosen over the connected site. Anything else is refused, never kept
  if (subject.source !== undefined && subject.source !== 'site') return { error: SAVE_REFUSED }

  const { user, supabase } = await quietSession()
  if (!user) return { error: SAVE_REFUSED }
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

  const { user, supabase } = await quietSession()
  if (!user) return { error: VIEWED_REFUSED }
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
 * STORY 5.21 — THE EDITOR'S RE-READ OF THE LINKED SITE'S SETTINGS (5.20's `recheckMembers`, widened): once as the editor
 * opens, on entering the Paywall canvas, and on C3b's **Re-check** (FR-H6, FR-H5, FR-C5). The site's settings are read
 * again from Ghost and every key the payload decides written to the snapshot — the member switches every warning reads,
 * and the announcement and the Portal keys the canvas draws Ghost's two surfaces from — and the snapshot handed back.
 *
 * WHOSE SITE IS DECIDED BY RLS: the project is read through the caller's own session, so another user's project id reaches
 * no row and no Ghost is asked — the same answer as "no linked site". The read itself is `readSettings`, the site probe's
 * one Admin `settings/` read through the chokepoint (AD-10); this file imports neither the chokepoint nor the service role.
 *
 * A LOOK, NEVER AN EDIT (FR-D18's R-192): it writes the connection's snapshot, never the doc, so it runs reading along too.
 * NOT A FORM SUBMIT: C3b's button says "Re-checking…" from a transition (R-98, `aria-busy`, never `disabled`), and the
 * refusal is ONE fact the editor words with the site's own name (`PAYWALL_WORDS.refused`) where C3b's card is up, and says
 * nothing about anywhere else — a refused re-read leaves the stored snapshot drawn.
 */
export type SiteResult = { members: Members | null; surfaces: Surfaces } | { refused: true }

const ROUTE = 'projects/editor/recheck-site'

export async function recheckSite(projectId: string): Promise<SiteResult> {
  if (!isUuid(projectId)) return { refused: true }
  const { user, supabase } = await quietSession()
  if (!user) return { refused: true }
  const { data, error } = await supabase.from('projects').select('linked_site_id').eq('id', projectId).maybeSingle()
  if (error || !data?.linked_site_id) {
    if (error) console.error('projects/editor: site re-read could not read the project', { code: error.code })
    return { refused: true }
  }
  const read = await readSettings({ siteId: data.linked_site_id as string, userId: user.id, route: ROUTE })
  return read === null ? { refused: true } : read
}

/**
 * STORY 7.18b — CHOOSING THE SITE (FR-B5; R-267, FR-Q6): the wizard's Switch and Choose a site land here. The rule is
 * `lib/site-switch.ts`' — `switchPlan`, the same one the picker and its confirm read, re-run by `switchWith` over the rows as
 * they stand; this action is its reads and writes.
 *
 * THROUGH THE CALLER'S OWN SESSION, and it writes `projects` alone (`linked_site_id`, and `language` at a first link — both
 * granted to `authenticated`, `…complete_schema.sql:1210-1212`). The site is read with `disconnected_at is null`, so it is
 * the user's own (RLS) and connected — the foreign key checks only that a site exists (`server/site-settings.ts`), so this read
 * is the guard. THE LOCK FIRST, through the deploy route's helper (`holdsLock`): a session reading along changes nothing.
 * `confirmed` is the confirm as it was drawn (`Confirmed`), anything else none — the server asks again unless it covers what
 * is owed now.
 */
export async function switchSite(projectId: string, siteId: string, session: string, confirmed: unknown): Promise<SwitchAnswer> {
  const ours = { refused: DEPLOY_WORDS.infrastructure }
  if (!isUuid(projectId) || !isUuid(siteId) || typeof session !== 'string' || session.length === 0 || session.length > 64) return ours
  const { user, supabase } = await quietSession()
  if (!user) return { refused: DEPLOY_WORDS.infrastructure }
  const stamp = () => new Date().toISOString()
  return switchWith({
    // read QUIETLY too (R-213's reason): the lock through this action's own quiet client
    holds: () => holdsLock(projectId, session, supabase),
    async read() {
      const [project, site, holder, overrides] = await Promise.all([
        supabase.from('projects').select('language, linked_site_id').eq('id', projectId).maybeSingle(),
        supabase.from('sites').select('id, title, url, capability, capability_source, site_settings').eq('id', siteId).is('disconnected_at', null).maybeSingle(),
        supabase.from('projects').select('id, name').eq('linked_site_id', siteId).neq('id', projectId).maybeSingle(),
        // R-134: a project holding translation overrides keeps its language at a first link (`switchPlan`)
        supabase.from('translation_overrides').select('catalog_key', { count: 'exact', head: true }).eq('project_id', projectId),
      ])
      if (project.error || site.error || holder.error || overrides.error || !project.data) {
        console.error('projects/editor: the switch could not read its rows', { code: project.error?.code ?? site.error?.code ?? holder.error?.code ?? overrides.error?.code })
        return null
      }
      // the site as the picker lists it — `shipStateOf`'s own mapping, its holder beside it
      const sites = site.data === null ? [] : shipStateOf({
        projectId, slug: '', language: project.data.language, rtlAckAt: null, overridden: false, siteId: null, site: null, deploys: [], bindings: [], liveHere: false, required: [],
        sites: [site.data], linking: holder.data ? [{ ...holder.data, linked_site_id: siteId }] : [],
      }).sites
      return { project: { language: project.data.language, linkedSiteId: project.data.linked_site_id, overridden: (overrides.count ?? 0) > 0 }, site: sites?.[0] ?? null }
    },
    async unlink() {
      const { error } = await supabase.from('projects').update({ linked_site_id: null, updated_at: stamp() }).eq('linked_site_id', siteId).neq('id', projectId)
      if (error) console.error('projects/editor: the held site could not be unlinked', { code: error.code })
      return !error
    },
    async link(language) {
      const { data, error } = await supabase
        .from('projects')
        .update({ linked_site_id: siteId, ...(language === null ? {} : { language }), updated_at: stamp() })
        .eq('id', projectId)
        .select('id')
      if (!error && data?.length === 1) return 'ok'
      if (error?.code === '23505') return 'taken'
      console.error('projects/editor: the site could not be linked', { code: error?.code })
      return 'error'
    },
  }, { projectId, siteId, confirmed: confirmedFrom(confirmed) })
}

/**
 * STORY 7.19 — THE FIRST DEPLOY'S SAFETY NET (FR-C1, D1b/D1c): the wizard's two writes, beside `switchSite`. Each writes the
 * SITE, never the project, so neither takes the edit lock; each reads the project's link through the CALLER'S OWN session first
 * (RLS decides it is theirs), and the site with `disconnected_at is null`, so a site disconnected or unlinked meanwhile is
 * `SWITCH_WORDS.gone` and nothing is written. Each takes the site D1b NAMED, and refuses when the link has moved since (another
 * tab's switch): the token is never asked of, and the decline never recorded on, a site the customer was not shown. A read that
 * FAILED is ours, not the site's, and says so (`DEPLOY_WORDS.infrastructure`) — Story 7.19's review. Neither logs the token,
 * which arrives in the action's body and goes to the chokepoint alone.
 *
 * `addSafetyToken` — R-280: `addStaffToken` is Manage keys' check too, so a token is asked of Ghost (`GET users/me/?include=
 * roles`) and only an Owner's or an Administrator's is stored (Vault, the flag, the audit row). It answers ok, or the one
 * sentence for the cause (`tokenRefusal`, the codes table's own).
 *
 * `declineSafetyNet` — R-278: a Not now is recorded on the SITE record (`sites.staff_token_declined_at`), so no project of the
 * user's asks again on that site. The column is server-asserted (no `authenticated` update grant — the Schema's header), so the
 * write is the service role's, scoped by `user_id` and `disconnected_at is null`, the clause that stands in for the RLS it
 * bypasses — the one reason this file is on `server-wiring.test.ts`' service-role list. The deploy never waits on it: the wizard
 * does not await its answer, and a failed write is logged and the offer returns on a later open.
 */
const TOKEN_ROUTE = 'projects/editor/safety-token'

export type SafetyAnswer = { ok: true } | { refused: string }

/** the project's linked site, CONNECTED and still the one the wizard named, through the caller's own session (RLS) — null when
 *  there is none any more, `'unread'` when a read failed */
async function linkedSite(supabase: Awaited<ReturnType<typeof quietSession>>['supabase'], projectId: string, siteId: string) {
  const { data: project, error } = await supabase.from('projects').select('linked_site_id').eq('id', projectId).maybeSingle()
  if (error) {
    console.error('projects/editor: the safety net could not read the project', { code: error.code })
    return 'unread' as const
  }
  if (project?.linked_site_id !== siteId) return null
  const { data: site, error: siteError } = await supabase
    .from('sites').select('id, url, ghost_version, credentials_present').eq('id', siteId).is('disconnected_at', null).maybeSingle()
  if (siteError) {
    console.error('projects/editor: the safety net could not read the site', { code: siteError.code })
    return 'unread' as const
  }
  return (site as { id: string; url: string; ghost_version: string | null; credentials_present: { staff?: unknown } | null } | null) ?? null
}

export async function addSafetyToken(projectId: string, siteId: string, token: string): Promise<SafetyAnswer> {
  if (!isUuid(projectId) || !isUuid(siteId) || typeof token !== 'string' || token.length > CONNECT_MAX) return { refused: tokenRefusal({ code: 'token_malformed' }, '') }
  const { user, supabase } = await quietSession()
  if (!user) return { refused: DEPLOY_WORDS.infrastructure }
  const site = await linkedSite(supabase, projectId, siteId)
  if (site === 'unread') return { refused: DEPLOY_WORDS.infrastructure }
  if (site === null) return { refused: SWITCH_WORDS.gone }
  const answer = await addStaffToken({
    siteId: site.id, userId: user.id, url: site.url, version: site.ghost_version, token, route: TOKEN_ROUTE,
  }).catch((thrown: unknown) => {
    console.error('projects/editor: the safety token could not be added', { name: (thrown as { name?: string })?.name })
    return { ok: false as const, code: 'keys_failed' }
  })
  if (answer.ok) return { ok: true }
  if (answer.code === 'site_not_found') return { refused: SWITCH_WORDS.gone }
  return { refused: tokenRefusal(answer, hostOf(site.url)) }
}

export async function declineSafetyNet(projectId: string, siteId: string): Promise<{ ok: boolean }> {
  if (!isUuid(projectId) || !isUuid(siteId)) return { ok: false }
  const { user, supabase } = await quietSession()
  if (!user) return { ok: false }
  const site = await linkedSite(supabase, projectId, siteId)
  if (site === null || site === 'unread') return { ok: false }
  const { data, error } = await supabaseAdmin()
    .from('sites')
    .update({ staff_token_declined_at: new Date().toISOString() })
    .eq('id', site.id)
    .eq('user_id', user.id)
    .is('disconnected_at', null)
    .select('id')
  if (error || !data?.length) {
    console.error('projects/editor: the safety net decline was not recorded', { code: error?.code ?? 'no_row' })
    return { ok: false }
  }
  return { ok: true }
}

/**
 * STORY 7.20a — THE FIRST DEPLOY'S BACKUP STEP (F7, D1d/D1d′/D1e): the gate's three server actions, beside the Safety net's and in
 * their shape — the project's link read through the CALLER'S OWN session first (`linkedSite`, RLS), the site connected and still
 * the one the wizard named, a failed read ours (`DEPLOY_WORDS.infrastructure`). None takes the edit lock: none writes the project.
 *
 * `confirmBackup` — Run checks on Backup records the confirmation on the SITE (`sites.backup_confirmed_at`, once per site; disconnect
 * clears it, so a reconnect asks again). Server-asserted like `staff_token_declined_at` (no `authenticated` update grant — the
 * Schema's header), so the write is the service role's, scoped by `user_id` and `disconnected_at is null`. The wizard never awaits
 * it, as Not now's decline is not: a failed write is logged and the gate shows again on a later open. A consent gate, not a
 * technical control (AD-29) — nothing on the server reads this column before a deploy.
 *
 * `downloadLiveTheme` — the Theme row's Download: the ONE capture (`captureSnapshot`, through `snapshot-io.ts`), which writes the
 * site's snapshot row because AD-13 serves bytes only from Storage. It answers the row's id — the browser then follows Story 2.5's
 * `/snapshots/{id}/download`, a 60-second signed URL — or the "Inflozo's own" sentence (nothing stored), or the row's failure
 * sentence. A later first upload re-captures and replaces the row (FR-J13).
 *
 * `downloadRoutes` — the `routes.yaml` row's Download, on every connected site (R-282): the live file read with the Staff Access
 * Token when one is stored and the Admin key otherwise (`liveRoutesFile`), handed back as text for the browser to save as
 * `routes.yaml`, as B16's download is.
 */
const BACKUP_ROUTE = 'projects/editor/backup'

export async function confirmBackup(projectId: string, siteId: string): Promise<{ ok: boolean }> {
  if (!isUuid(projectId) || !isUuid(siteId)) return { ok: false }
  const { user, supabase } = await quietSession()
  if (!user) return { ok: false }
  const site = await linkedSite(supabase, projectId, siteId)
  if (site === null || site === 'unread') return { ok: false }
  const { data, error } = await supabaseAdmin()
    .from('sites')
    .update({ backup_confirmed_at: new Date().toISOString() })
    .eq('id', site.id)
    .eq('user_id', user.id)
    .is('disconnected_at', null)
    .select('id')
  if (error || !data?.length) {
    console.error('projects/editor: the backup confirmation was not recorded', { code: error?.code ?? 'no_row' })
    return { ok: false }
  }
  return { ok: true }
}

export type BackupDownload = { ok: true; id: string } | { said: string }

export async function downloadLiveTheme(projectId: string, siteId: string): Promise<BackupDownload> {
  if (!isUuid(projectId) || !isUuid(siteId)) return { said: DEPLOY_WORDS.infrastructure }
  const { user, supabase } = await quietSession()
  if (!user) return { said: DEPLOY_WORDS.infrastructure }
  const site = await linkedSite(supabase, projectId, siteId)
  if (site === 'unread') return { said: DEPLOY_WORDS.infrastructure }
  if (site === null) return { said: SWITCH_WORDS.gone }
  const got = await captureSnapshot({ siteId: site.id, userId: user.id, route: `${BACKUP_ROUTE}/theme` }, SNAPSHOT_IO).catch((thrown: unknown) => {
    console.error('projects/editor: the live theme could not be captured', { name: (thrown as { name?: string })?.name })
    return null
  })
  if (got === null) return { said: DEPLOY_WORDS.infrastructure }
  if (got.ok) return 'marked' in got ? { said: BACKUP_WORDS.marked } : { ok: true, id: got.id }
  if (got.status !== undefined) return { said: BACKUP_WORDS.downloadFailed(got.status) }
  if (got.request === STORAGE) return { said: DEPLOY_WORDS.infrastructure }
  if (got.code === 'snapshot_needs_token') return { said: SNAPSHOT_WORDS.noToken }
  return { said: DEPLOY_WORDS.unreachable(hostOf(site.url)) }
}

export async function downloadRoutes(projectId: string, siteId: string): Promise<{ ok: true; file: string } | { said: string }> {
  if (!isUuid(projectId) || !isUuid(siteId)) return { said: DEPLOY_WORDS.infrastructure }
  const { user, supabase } = await quietSession()
  if (!user) return { said: DEPLOY_WORDS.infrastructure }
  const site = await linkedSite(supabase, projectId, siteId)
  if (site === 'unread') return { said: DEPLOY_WORDS.infrastructure }
  if (site === null) return { said: SWITCH_WORDS.gone }
  const live = await liveRoutesFile(ROUTES_IO, { siteId: site.id, route: `${BACKUP_ROUTE}/routes`, staff: site.credentials_present?.staff === true })
  if (live.ok) return { ok: true, file: new TextDecoder().decode(live.bytes) }
  if (live.status !== undefined) return { said: BACKUP_WORDS.downloadFailed(live.status) }
  return { said: live.unreachable ? DEPLOY_WORDS.unreachable(hostOf(site.url)) : DEPLOY_WORDS.infrastructure }
}
