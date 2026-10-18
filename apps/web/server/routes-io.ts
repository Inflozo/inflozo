import { templatesOf } from '@/lib/routes'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'
import type { RoutesIo } from '@/server/routes-upload'

/**
 * STORY 7.17 — THE ROUTES STEP'S REAL `io` (`server/routes-upload.ts` is handed it, so that file imports neither the
 * service role nor the chokepoint and its tests run over a fake). Story 7.18's Ship it hands in this one.
 *
 * EVERY READ AND THE WRITE ARE SCOPED BY `user_id`, because the service role reads past RLS: a project or a site that is
 * not the caller's — or a disconnected site, which FR-C6 keeps as a record and is no site — is no row, and the step then
 * makes no call. The four routes columns are server-asserted (AD-7: `authenticated` may update only title, favicon_url and
 * updated_at on `sites`), which is why this is the service role's and why it is on `server-wiring.test.ts`'s two lists.
 */
export const ROUTES_IO: RoutesIo = {
  async read({ projectId, siteId, userId }) {
    const admin = supabaseAdmin()
    const [project, site, routes, templates] = await Promise.all([
      admin.from('projects').select('id').eq('id', projectId).eq('user_id', userId).maybeSingle(),
      admin.from('sites').select('credentials_present, routes_last_offered').eq('id', siteId).eq('user_id', userId).is('disconnected_at', null).maybeSingle(),
      admin.from('routes_config').select('config, yaml').eq('project_id', projectId).eq('user_id', userId).maybeSingle(),
      admin.from('custom_templates').select('id, filename, display_name, kind').eq('project_id', projectId).eq('user_id', userId).eq('kind', 'routes'),
    ])
    const failed = project.error ?? site.error ?? routes.error ?? templates.error
    if (failed || !project.data || !site.data) {
      console.error('routes-upload: read refused', { code: failed?.code ?? 'not_found' })
      return null
    }
    const present = (site.data.credentials_present ?? {}) as { staff?: boolean }
    return {
      config: routes.data?.config ?? {},
      yaml: (routes.data?.yaml as string | null | undefined) ?? null,
      templates: templatesOf(templates.data).map((t) => t.file),
      staff: present.staff === true,
      lastOffered: (site.data.routes_last_offered as string | null) ?? null,
    }
  },
  async readSite({ siteId, userId }) {
    const { data, error } = await supabaseAdmin()
      .from('sites')
      .select('routes_last_offered')
      .eq('id', siteId)
      .eq('user_id', userId)
      .is('disconnected_at', null)
      .maybeSingle()
    if (error || !data) {
      console.error('routes-upload: site read refused', { code: error?.code ?? 'not_found' })
      return null
    }
    return { lastOffered: (data.routes_last_offered as string | null) ?? null }
  },
  call: (args) => call(args),
  async write({ siteId, userId, patch }) {
    const { data, error } = await supabaseAdmin()
      .from('sites')
      .update(patch)
      .eq('id', siteId)
      .eq('user_id', userId)
      .is('disconnected_at', null)
      .select('id')
    if (error || !data?.length) {
      console.error('routes-upload: state write failed', { code: error?.code ?? 'no_row' })
      return false
    }
    return true
  },
  now: () => new Date(),
}
