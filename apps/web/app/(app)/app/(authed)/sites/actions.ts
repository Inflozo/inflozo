'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  CONNECT_MAX,
  CONNECT_MESSAGES,
  connectMessage,
  hostOf,
  isHttpUrl,
  normaliseSiteUrl,
  versionVerdict,
  type ConnectCode,
  type ConnectField,
  type ConnectResult,
  type MessageCode,
} from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { atSiteCap, siteCapSentence } from '@/lib/plan'
import { signedIn, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'
import { fetchWithKey, store } from '@/server/ghost-admin'
import { AdminError } from '@/server/ghost-admin/admin-rule'
import { probeSite } from '@/server/site-probe'

/**
 * FR-C1 · FR-C2 · AD-7 — CONNECT, AND IT IS THE CHOKEPOINT'S FIRST PRODUCT CALLER.
 *
 * Story 3.1 built the locked box and the one door and left a bearer-gated verify route as the
 * only thing that had ever pushed a key through it. This is what replaces it (DW-48): a customer
 * types an address and two keys, the Admin key is validated on the SERVER against the real Ghost,
 * and only then does a row exist.
 *
 * `GET /admin/config/` IS THE VALIDATOR AND `GET /admin/site/` IS NOT. The second answers 200 to
 * any key at all — executed with NO key at all on both majors (MEASUREMENTS §38a) — so it is read
 * only AFTER `config/` has passed, for the public url, the title and the icon.
 *
 * `Accept-Version` IS NOT SENT on `config/`: the version is what that call is asked for, and both
 * majors answer 200 without the header (3.1's harness, `config-no-version`). `site/` is read after
 * it with `v{major}.0`, as every later call will be — the harness's `connect` steps execute that
 * on both majors.
 *
 * THE ROW IS THE SERVER'S. `authenticated` may insert only `(id, user_id, url, title, favicon_url)`
 * on `sites` (schema :1040) — `ghost_version`, `content_key`, `site_settings` and `disconnected_at`
 * are all server-asserted — so the write goes through `supabaseAdmin()`, which is why this file
 * joins that importer list in `server-wiring.test.ts` as well as the chokepoint's.
 *
 * THE CONTENT KEY IS NOT VALIDATED HERE. FR-C2 verifies it from the BROWSER, direct to the
 * customer's Ghost, because that is the path the editor will use — a server-side 200 would prove
 * the wrong thing (no CORS, no mixed content, no browser). `credentials_present.content` therefore
 * means "a key is stored" and nothing more, and with JavaScript off it is stored unchecked.
 *
 * NEVER LOG A KEY, never echo one back. The answer is `{ code, message, field? }`; every
 * `console.error` line below names a code and no value (spine, Security floor).
 */

const ROUTE = 'sites/connect'
/** `proxy.ts` rewrites `app.inflozo.com/sites` onto the internal `/app/sites`. */
const SITES = '/app/sites'

const fail = (code: ConnectCode, message: string, field?: ConnectField): ConnectResult => ({
  error: { code, message, ...(field ? { field } : {}) },
})

/** Logged without the address and without either key: logs carry no user content. */
function logged(where: string, code: string | undefined): ConnectResult {
  console.error(`sites: connect ${where} failed`, { code })
  return fail('connect_failed', connectMessage('connect_failed'))
}

/**
 * The three fields. EVERY EXPORT FROM THIS FILE IS AN ASYNC FUNCTION and nothing else may be: a
 * `'use server'` module may export only Server Actions, and a single exported constant strips
 * every export from it — the wizard's own `import { connectSite }` then fails to resolve, with
 * `pnpm check` green (executed under `next build`, 2026-09-08). That is why Story 3.3's four
 * answer actions live down at the bottom of this file rather than beside the component that
 * submits them. The shapes and the ceiling live in `lib/connect-rule.ts`.
 */
const Fields = z.object({
  url: z.string().max(CONNECT_MAX),
  admin_key: z.string().max(CONNECT_MAX),
  content_key: z.string().max(CONNECT_MAX),
})

/** Which field a code belongs under; everything else is the form's banner. */
const FIELD_OF: Partial<Record<ConnectCode, ConnectField>> = {
  url_invalid: 'url',
  credential_malformed: 'admin_key',
  content_key_malformed: 'content_key',
  ghost_unknown_key: 'admin_key',
  ghost_unauthorized: 'admin_key',
}

/**
 * ONE OF THE CHOKEPOINT'S CODES, TURNED INTO ONE OF THE WIZARD'S SENTENCES. Ghost's refusal is a
 * RESULT (`{ ok: false, code }`) and everything else is a thrown `AdminError`, but both carry the
 * same vocabulary, so both arrive here. A code the table does not name is one this story has never
 * seen — `path_not_admin`, `write_not_allowed`, a future one — and it is OURS, not the user's: it
 * is logged and answered with the generic sentence rather than dressed up as a Ghost refusal.
 */
function refused(code: string, subject: string): ConnectResult {
  if (!(code in CONNECT_MESSAGES)) return logged('chokepoint', code)
  const known = code as MessageCode
  return fail(known, connectMessage(known, subject), FIELD_OF[known])
}

export async function connectSite(
  _previous: ConnectResult | null,
  formData: FormData,
): Promise<ConnectResult> {
  const user = await signedIn()

  const parsed = Fields.safeParse({
    url: formData.get('url') ?? '',
    admin_key: formData.get('admin_key') ?? '',
    content_key: formData.get('content_key') ?? '',
  })
  if (!parsed.success) {
    // `maxLength` on each field refuses the character first, so only a crafted post gets here —
    // and it is answered under the field it came in, not under the URL (review, 2026-09-08).
    const at = parsed.error.issues[0]?.path[0]
    if (at === 'admin_key') return fail('credential_malformed', connectMessage('credential_malformed'), 'admin_key')
    if (at === 'content_key') return fail('content_key_malformed', connectMessage('content_key_malformed'), 'content_key')
    return fail('url_invalid', connectMessage('url_invalid'), 'url')
  }

  const typed = parsed.data.url
  const adminKey = parsed.data.admin_key.trim()
  const contentKey = parsed.data.content_key.trim()

  // BEFORE ANY NETWORK CALL. "orbit weekly" is a typo, not a site that did not answer, and the
  // two must never share a sentence.
  const url = normaliseSiteUrl(typed)
  if (!url) return fail('url_invalid', connectMessage('url_invalid'), 'url')
  const host = hostOf(url)

  // The caller's OWN session, so RLS scopes the list rather than a `where user_id =` being
  // trusted to — and both answers this needs come out of it: how many sites are active, and
  // whether this address is one of them already.
  const supabase = await supabaseServer()
  const [{ data: rows, error: readError }, { plan }] = await Promise.all([
    // Every column the two writes below touch is read here, so a store that fails on a RE-ADOPTED
    // record can put the whole record back as it was (review, 2026-09-08).
    supabase
      .from('sites')
      .select('id, url, title, favicon_url, ghost_version, content_key, site_settings, credentials_present, settings_read_at, disconnected_at'),
    resolveEntitlement(user.id),
  ])
  if (readError || !rows) return logged('read', readError?.code)

  const existing = rows.find((row) => row.url === url)
  if (existing && !existing.disconnected_at) {
    return fail('already_connected', connectMessage('already_connected', host))
  }
  // THE CAP IS ENFORCED HERE, server-side, and re-adopting counts: a disconnected record coming
  // back is a site becoming active. S11c's ghost slot is Story 3.5's; the sentence is F.1's.
  const active = rows.filter((row) => !row.disconnected_at).length
  if (atSiteCap(plan, active)) return fail('at_cap', siteCapSentence(plan))
  // ponytail: count-then-write, as the project cap is; two different addresses double-submitted
  // inside one round trip can land two on Free — a trigger reading entitlements is the upgrade if
  // it ever does.

  // ── The Admin key, against the real Ghost. `siteId` is null: there is no row yet, and the
  //    audit row is still written (AD-10 F10 — the log is the only control here that detects).
  let version: string | undefined
  try {
    const config = await fetchWithKey({
      credential: adminKey,
      siteUrl: url,
      path: 'config/',
      route: ROUTE,
      siteId: null,
      userId: user.id,
    })
    if (!config.ok) return refused(config.code ?? 'ghost_refused', String(config.status))
    // A string or nothing: a body whose `version` is some other shape is refused as no version at
    // all rather than thrown on (`.trim()` on a number, outside every catch — review, 2026-09-08).
    const raw = (config.body as { config?: { version?: unknown } })?.config?.version
    version = typeof raw === 'string' ? raw : undefined
  } catch (thrown) {
    if (thrown instanceof AdminError) return refused(thrown.code, host)
    return logged('validate', (thrown as { name?: string })?.name)
  }

  const verdict = versionVerdict(version)
  if (!verdict.ok) {
    return verdict.code === 'ghost_too_old'
      ? fail('ghost_too_old', connectMessage('ghost_too_old', `${verdict.major}.${verdict.minor}`))
      : fail('ghost_unreachable', connectMessage('ghost_unreachable', host))
  }

  // ── THE ROW, AND IT IS WRITTEN BEFORE THE PUBLIC URL IS READ. `GET /admin/site/` validates
  //    nothing (§38a) and decides nothing about whether the site connects, so the record exists
  //    as soon as the key has passed — which is also what puts the two Admin calls on either side
  //    of it in the audit trail: `config/` leaves an `admin_read` row with a NULL `site_id`
  //    because there was no row to name, and `site/` leaves one carrying the new id.
  const previousSettings = (existing?.site_settings ?? {}) as Record<string, unknown>
  const present = (existing?.credentials_present ?? {}) as { staff?: boolean }
  const connection = {
    ghost_version: version ?? null,
    content_key: contentKey || null,
    // THE CLIENT'S MIRROR of what is stored (AD-7), and `admin` is FALSE here on purpose: `store()`
    // flips it, in the same transaction that puts the key in Vault, so the flag can never claim a
    // key the site has not got. `staff` is carried forward untouched — it is Epic 7's to write.
    credentials_present: { content: Boolean(contentKey), admin: false, staff: present.staff === true },
    disconnected_at: null,
  }

  const admin = supabaseAdmin()
  let siteId: string
  if (existing) {
    // FR-C6: a disconnected record is RE-ADOPTED in place, so its id — and every snapshot bound
    // to it — survives. The trigger drops the secret the old key left behind (DW-44).
    const { data, error } = await admin
      .from('sites')
      .update(connection)
      .eq('id', existing.id)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle<{ id: string }>()
    if (error || !data) return logged('re-adopt', error?.code)
    siteId = data.id
  } else {
    const { data, error } = await admin
      .from('sites')
      .insert({ user_id: user.id, url, title: host, ...connection })
      .select('id')
      .maybeSingle<{ id: string }>()
    if (error || !data) {
      // The same address submitted twice inside one round trip: the second insert meets
      // `unique (user_id, url)`, which is the first's success and not a failure (review, 2026-09-08).
      if (error?.code === '23505') return fail('already_connected', connectMessage('already_connected', host))
      return logged('insert', error?.code)
    }
    siteId = data.id
  }

  // ── The public url, the title and the icon, read through the same door with the site named.
  //    NOT fatal: a site whose key has just passed `config/` is connected, and a cosmetic read
  //    that failed leaves the card falling back to the typed address until Story 3.7's daily
  //    check. `site_settings` is the jsonb 3.3 fills, so a re-adopted record keeps what it had.
  try {
    const site = await fetchWithKey({
      credential: adminKey,
      siteUrl: url,
      path: 'site/',
      route: ROUTE,
      major: verdict.major,
      siteId,
      userId: user.id,
    })
    const read = (site.body as { site?: { url?: unknown; title?: unknown; icon?: unknown } })?.site
    if (site.ok && read) {
      const { error: cosmetic } = await admin
        .from('sites')
        .update({
          title: typeof read.title === 'string' && read.title ? read.title : host,
          // CHECKED BEFORE EITHER BECOMES A LINK OR AN <img>: Ghost's answer is not a URL because
          // Ghost sent it (review, 2026-09-08). The public url is kept as sent, slash and all (§38a).
          favicon_url: isHttpUrl(read.icon) ? read.icon : null,
          site_settings: { ...previousSettings, public_url: isHttpUrl(read.url) ? read.url : url },
          // Stamped WITH the read it names, so the card can only say "Checked just now" about a
          // read that happened; a read that failed leaves it as it was (review, 2026-09-08).
          settings_read_at: new Date().toISOString(),
        })
        .eq('id', siteId)
        .eq('user_id', user.id)
      // Not fatal either, but not silent: a card saying "Not checked yet" after a read that
      // happened needs a line to be found from (review, 2026-09-08).
      if (cosmetic) console.error('sites: connect site-write failed', { code: cosmetic.code })
    }
  } catch (thrown) {
    console.error('sites: connect site-read failed', {
      code: thrown instanceof AdminError ? thrown.code : (thrown as { name?: string })?.name,
    })
  }

  // ── The key into Vault. `store()` needs a `site_id` and checks the row is the caller's
  //    (`index.ts:118-125`), so the row has to exist first; the pair is not one transaction —
  //    `store` owns its own `begin` and the row above was written over PostgREST — so a failure
  //    here UNDOES the row and the answer is "Nothing was connected".
  // ponytail: insert then store with a compensating delete; one transaction inside
  // server/ghost-admin if credential_audit ever shows the pair half-done.
  try {
    await store({ siteId, userId: user.id, kind: 'admin', secret: adminKey, route: ROUTE })
  } catch (thrown) {
    if (existing) {
      // A record Inflozo KEPT (FR-C6) is put back AS IT WAS — every column the two writes above
      // touched, not only the disconnect stamp (review, 2026-09-08) — and never deleted.
      const kept = {
        title: existing.title,
        favicon_url: existing.favicon_url,
        ghost_version: existing.ghost_version,
        content_key: existing.content_key,
        credentials_present: existing.credentials_present,
        site_settings: existing.site_settings,
        settings_read_at: existing.settings_read_at,
        disconnected_at: existing.disconnected_at,
      }
      const { error: undo } = await admin.from('sites').update(kept).eq('id', siteId).eq('user_id', user.id)
      if (undo) console.error('sites: connect undo failed', { code: undo.code })
    } else {
      const { error: undo } = await admin.from('sites').delete().eq('id', siteId).eq('user_id', user.id)
      // Logged, because a row this could not remove renders "Connected" with no key behind it and
      // answers `already_connected` to every retry (review, 2026-09-08).
      if (undo) console.error('sites: connect undo failed', { code: undo.code })
    }
    if (thrown instanceof AdminError) return refused(thrown.code, host)
    return logged('store', (thrown as { name?: string })?.name)
  }

  // ── FR-C2's FOUR PROBES, on the key that has just gone into Vault (Story 3.3). It runs on the
  //    STORED credential through `call()` — never on `adminKey`, which is still in scope two lines
  //    up — so connect, Re-check plan and Story 3.7's cron are literally the same function.
  //    INSIDE ITS OWN TRY AND FATAL TO NOTHING: `config/` has already passed, so the site is
  //    connected whatever the probe answers. `probeSite` catches its own failures; this catches
  //    the one it cannot, a throw on the way in.
  try {
    await probeSite({ siteId, userId: user.id, route: ROUTE })
  } catch (thrown) {
    console.error('sites: connect probe failed', { name: (thrown as { name?: string })?.name })
  }

  revalidatePath(SITES)
  // Outside every `try` above: `redirect()` throws NEXT_REDIRECT by design, and a catch that
  // swallowed it would report a successful connect as a failure (`lib/action-redirect.ts`).
  redirect('/sites')
}

/* ───────── STORY 3.3's FOUR ANSWERS, and they live in THIS file because a `'use server'` module
   may export only async functions — one exported constant strips every export from it, as the
   header above records. Each is a `<form action={…}>` target in `site-notices.tsx`, so every one
   works with JavaScript off; each takes the site id from the form and scopes its write with
   `.eq('user_id', user.id)`, because a form field is a caller's input and `supabaseAdmin()`
   bypasses RLS by construction.

   NONE OF THEM ANSWERS THE CALLER. A server action that returns nothing re-renders the page it
   revalidated, which is the whole of the feedback here: the notice is gone, or the chip changed.
   A failure is logged with a code and leaves the block on screen — the matrix's "a failed write
   logs a code and the notice stays". */

/** The site id, as a form field: absent or malformed is not a site of anyone's. */
const SiteId = z.object({ site_id: z.string().uuid() })

async function siteOf(formData: FormData): Promise<{ userId: string; siteId: string } | null> {
  const user = await signedIn()
  const parsed = SiteId.safeParse({ site_id: formData.get('site_id') ?? '' })
  if (!parsed.success) {
    console.error('sites: notice action refused', { code: 'site_id_invalid' })
    return null
  }
  return { userId: user.id, siteId: parsed.data.site_id }
}

/** The write every answer below makes, with its own log code. */
async function writeSite(
  where: string,
  at: { userId: string; siteId: string },
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('sites')
    .update(patch)
    .eq('id', at.siteId)
    .eq('user_id', at.userId)
  if (error) console.error(`sites: ${where} failed`, { code: error.code })
  revalidatePath(SITES)
}

/**
 * FR-C2's notice is ONE-TIME AND THE FACT IS THE COLUMN. **Got it** stamps
 * `code_injection_notice_shown_at`, and it never returns for that site — not on a reload and not
 * after a re-probe, because the probe writes `site_settings.code_injection` and never this.
 */
export async function dismissInjectionNotice(formData: FormData): Promise<void> {
  const at = await siteOf(formData)
  if (!at) return
  await writeSite('notice dismiss', at, { code_injection_notice_shown_at: new Date().toISOString() })
}

/**
 * THE PORTAL QUESTION, asked only when `portal_button` was not a boolean in Ghost's payload. The
 * answer is stored with source `'declared'`, which Story 3.7's daily check overwrites with
 * `'probe'` the moment the setting becomes readable.
 */
export async function answerPortal(formData: FormData): Promise<void> {
  const at = await siteOf(formData)
  if (!at) return
  const { data } = await supabaseAdmin()
    .from('sites')
    .select('site_settings')
    .eq('id', at.siteId)
    .eq('user_id', at.userId)
    .maybeSingle<{ site_settings: Record<string, unknown> | null }>()
  if (!data) return
  await writeSite('portal answer', at, {
    site_settings: {
      ...(data.site_settings ?? {}),
      portal_button: formData.get('portal_button') === 'yes',
      portal_button_source: 'declared',
    },
  })
}

/**
 * THE PLAN QUESTION — the only place in this project where a plan is ASKED rather than probed
 * (FR-C2, FR-C8), and it is reachable only when `hostSettings` was present and its shape could not
 * be read. The answer sets `capability_source` to `'user_declared'`, never `'probe'`, and clears
 * `plan_ask` so the question does not come back.
 */
export async function answerPlan(formData: FormData): Promise<void> {
  const at = await siteOf(formData)
  if (!at) return
  const { data } = await supabaseAdmin()
    .from('sites')
    .select('site_settings')
    .eq('id', at.siteId)
    .eq('user_id', at.userId)
    .maybeSingle<{ site_settings: Record<string, unknown> | null }>()
  if (!data) return
  const { plan_ask: _asked, ...kept } = (data.site_settings ?? {}) as Record<string, unknown>
  await writeSite('plan answer', at, {
    capability: formData.get('capability') === 'preview_only' ? 'preview_only' : 'full',
    capability_source: 'user_declared',
    site_settings: kept,
  })
}

/**
 * B15's **Re-check plan**: the SAME probe, re-run. A site that has since been upgraded clears
 * itself to `full` with no support ticket; a probe that cannot reach Ghost leaves the card exactly
 * as it was and says so under the button (`?recheck=failed`, read by the page).
 */
export async function recheckPlan(formData: FormData): Promise<void> {
  const at = await siteOf(formData)
  if (!at) return
  const summary = await probeSite({ siteId: at.siteId, userId: at.userId, route: ROUTE })
  revalidatePath(SITES)
  if (!summary.ok) redirect('/sites?recheck=failed')
}
