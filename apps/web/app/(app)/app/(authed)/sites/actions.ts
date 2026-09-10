'use server'

import { notFound, redirect, RedirectType } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  CONNECT_MAX,
  CONNECT_MESSAGES,
  connectMessage,
  hostOf,
  isHttpUrl,
  keysPath,
  keysPopupPath,
  normaliseSiteUrl,
  versionVerdict,
  type ConnectCode,
  type ConnectField,
  type ConnectResult,
  type MessageCode,
} from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap, atSiteCap, siteCapSentence } from '@/lib/plan'
import { brandPath, brandPopupPath, brandTarget, hasBrand } from '@/lib/probe-rule'
import { NAME_MAX, nextUntitled, slugify, uniqueSlug } from '@/lib/projects'
import { DEFAULT_PRESET, defaultStylePack } from '@/lib/style-pack'
import { signedIn, supabaseAdmin, supabaseServer } from '@/lib/supabase/server'
import { call, fetchWithKey, findSiteByAdminKeyId, remove, store } from '@/server/ghost-admin'
import { AdminError, parseCredential } from '@/server/ghost-admin/admin-rule'
import { isRedirect } from '@/lib/action-redirect'
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
/* STORY 3.5 — AND IT IS NOT `ROUTE`. `withStore` carries this into the failure envelope's `detail`,
   and DW-76's audit row inside `remove()` will carry it into `private.credential_audit`, so
   stamping a removal `sites/connect` would put the wrong route in the one record that exists to be
   trusted — before the row that reads it is ever written (review, 2026-09-09). */
const DISCONNECT_ROUTE = 'sites/disconnect'
/* STORY 3.6 — THREE MORE, AND EACH IS ITS OWN. DW-76's `credential_change` rows are stamped with
   the route that wrote them, so a key saved from Manage keys must not arrive in the audit log
   looking like a connect: the whole point of the log is that a reader can tell which surface acted.
   `sites/connect` on a key write is the exact defect the review of 2026-09-09 caught one story
   earlier, before the rows that read it existed. */
const KEYS_ROUTE = 'sites/keys'
const REMOVE_TOKEN_ROUTE = 'sites/keys/remove-token'
const TEST_ROUTE = 'sites/keys/test'
/** `proxy.ts` rewrites `app.inflozo.com/sites` onto the internal `/app/sites`. */
const SITES = '/app/sites'
/** …and `app.inflozo.com/` onto `/app`, which is the dashboard's own revalidate path. */
const DASHBOARD = '/app'

/* THE BROWSER's paths, not the two above — those are `revalidatePath`'s route-group paths and are
   not URLs. B15's banner is about ONE card, so its redirect names it; S2c is about one site, so
   its route does too. */
const SITES_URL = '/sites'
const RECHECK = (siteId: string) => `${SITES_URL}?recheck=${siteId}`
/** FR-C4's S2c, on its own route so the connect wizard's redirect has somewhere to land. ONE
    definition, in `probe-rule.ts` beside the sentence the card's link prints: the Sites card wrote
    the same address out a second time, and one rename would have drifted them apart with nothing
    failing (review, 2026-09-08; standing rule 7). */
const BRAND = brandPath
/* The matrix's "insert fails → THE PAGE SAYS SO". `recheckPlan` → `RECHECK(siteId)` is the
   file's own precedent: a server action that must speak to the customer redirects to a screen
   that reads the reason out of the URL, which is also the only shape that survives scripts off
   (review, 2026-09-08 — every failure branch here used to `return` in silence). */
const BRAND_FAILED = (base: string) => `${base}&failed=1`
/* S2c HAS THE SAME TWO CHROMES MANAGE KEYS HAS, and its actions answer onto the same base for the
   same reason — see `keysBase` below. `connectSite`'s own landing is NOT this: the owner ruled at
   Question 7 (option 1, 2026-09-10) that the moment straight after a connect stays a full screen,
   so `connectSite`'s final `redirect` keeps `BRAND(siteId)` and nothing about that hand-over
   changed. */
const brandBase = (formData: FormData, siteId: string) =>
  formData.get('popup') === '1' ? brandPopupPath(siteId) : brandPath(siteId)
/* STORY 3.5, and the same shape one row up: the card that could not be disconnected is the one
   that says so, named in the URL, so no other card claims a failure that was not its own. */
const DISCONNECT_FAILED = (siteId: string) => `${SITES_URL}?disconnect=${siteId}`
/* STORY 3.6. Manage keys is a SERVER-RENDERED screen with no `useActionState` to answer — that is
   what makes every control on it work with JavaScript off — so its three actions speak the way
   `recheckPlan` and `disconnectSite` already do: they redirect to the screen, and the screen reads
   the reason out of the URL. Only the CODE travels; which field it belongs under is derived by
   `keysFieldOf` in `lib/connect-rule.ts`, so a hand-typed `?field=` cannot put a refusal sentence
   under a field it has nothing to do with. */
/* THE OWNER'S TEST, 2026-09-10, FINDINGS 3 AND 5. Manage keys answers ONTO ITSELF, and until
   this fix "itself" was one address — the route `/sites/keys`, drawn as a popup by an intercepted
   segment. A server action's `redirect()` is not intercepted (executed 2026-09-10), so every
   answer loaded the FULL PAGE behind the still-open window and took the Sites list with it: "it
   tests it but opens a new popup in the background with Test results. Then both these popup
   appear on a blank screen."

   SO THE CHROME IS DECIDED ONCE PER ACTION, from a hidden field the panel writes, and every
   sentence below is appended to that base. In the popup the base is `/sites?manage=…`, so the
   redirect never leaves `/sites` and nothing under the window can change; on the full page it is
   `/sites/keys?site=…`, which is where a scripts-off post came from and where it must answer.
   `keysSite` takes it as an argument for the same reason: a helper that redirects has to know
   which screen it is redirecting to. */
const keysBase = (formData: FormData, siteId: string) =>
  formData.get('popup') === '1' ? keysPopupPath(siteId) : keysPath(siteId)
/* `status` TRAVELS BESIDE THE CODE, and only a code that needs one uses it. `ghost_refused`'s
   sentence is `(status) => 'Ghost refused the connection (HTTP ${status})'` — the wizard passes
   `String(config.status)` into it and this screen passed the SITE'S NAME, so a 403 or a 429 read
   "Ghost refused the connection (HTTP My Blog)" (review, 2026-09-09). It is a number and the panel
   re-checks that it is one: everything in this URL is typed by whoever holds it. */
const KEYS_REFUSED = (base: string, code: string, status?: number) =>
  `${base}&keys=${code}${status ? `&status=${status}` : ''}`
const KEYS_TESTED = (base: string, result: string, status?: number) =>
  `${base}&test=${result}${status ? `&status=${status}` : ''}`
/* FR-C8's hint, on the NEW card: `?moved=` names the site it belongs to, as `?recheck=` does, and
   `?old=` says whether the record it matched was ever let go. THE SNAPSHOT CLAUSE DEPENDS ON IT:
   the 90-day clock is DERIVED from `sites.disconnected_at` (DW-43), so a matched record that is
   still connected has no clock, and the hint that named one was promising a deadline that is not
   running (review, 2026-09-09). */
const MOVED = (siteId: string, old: 'orphan' | 'live') => `${SITES_URL}?moved=${siteId}&old=${old}`

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
    // The summary is a CODE and two facts, never a value — it is what makes a probe that quietly
    // did nothing visible in the function's log beside the connect that succeeded.
    const summary = await probeSite({ siteId, userId: user.id, route: ROUTE })
    if (!summary.ok) console.error('sites: connect probe did not complete', { code: summary.code })
  } catch (thrown) {
    console.error('sites: connect probe failed', { name: (thrown as { name?: string })?.name })
  }

  revalidatePath(SITES)

  // ── FR-C4, STORY 3.4: WHERE CONNECT LANDS. A site whose settings carry a brand we can offer
  //    goes to S2c; anything else goes to the list, exactly as it did before. The row is re-read
  //    through the CALLER'S OWN SESSION rather than taken from the probe's summary, and that is
  //    deliberate: a probe that failed just now still leaves the brand a PREVIOUS probe wrote —
  //    the FR-C6 re-adopt path — and offering it there is right, while a summary field would
  //    answer "no brand" about a read that did not happen.
  //    A READ THAT FAILED IS NOT A SITE WITH NO BRAND, and this was the THIRD reader in this one
  //    story to be asked that question and the only one still answering it by silence: the other
  //    two — S2c's `readFailed` and `useBrand`'s `siteError` branch — were both given the opposite
  //    rule at review 4, and the error here was not even destructured (review 5, 2026-09-09;
  //    propagate, never localise). THE LANDING STAYS `/sites`, deliberately: with no readable row
  //    there is nothing to say whether S2c would 404, and the Sites card's own offer link — drawn
  //    from that page's own read — is the recovery. What changes is that the failure is no longer
  //    INDISTINGUISHABLE from "this site has nothing to offer" in the log.
  const { data: probed, error: probedError } = await supabase
    .from('sites')
    .select('site_settings')
    .eq('id', siteId)
    .maybeSingle<{ site_settings: { brand?: unknown } | null }>()
  if (probedError) console.error('sites: connect brand read failed', { code: probedError.code })

  // ── FR-C8's "Moved domains?", STORY 3.6, and it is the LAST thing this action decides. The
  //    Admin key just stored carries an id half; if another record of THIS CALLER'S carries the
  //    same one, the customer has connected the same Ghost install at a second address — which is
  //    the state FR-C8 designed for when it killed edit-URL-in-place, reached the way FR-C8 says
  //    to reach it. Nothing is written and nothing is refused: the new card carries the hint.
  //    INSIDE ITS OWN TRY AND FATAL TO NOTHING — the site is connected whatever this answers, and
  //    a pooler that would not read is not a reason to fail a connect that worked. `parseCredential`
  //    cannot throw here: `store()` above already ran it on this very key.
  let moved: 'orphan' | 'live' | null = null
  try {
    const { kid } = parseCredential(adminKey)
    // `disconnectedAt` IS THE GATE AND IT WAS BEING DISCARDED. `findSiteByAdminKeyId` has always
    // returned it; `Boolean(...)` threw it away, so a customer whose other record was still
    // CONNECTED was told their old site's snapshot is kept for 90 days — a clock that only starts
    // at `disconnected_at` and was therefore not running at all (review, 2026-09-09).
    const hit = await findSiteByAdminKeyId({ userId: user.id, kid, exceptSiteId: siteId })
    moved = hit ? (hit.disconnectedAt ? 'orphan' : 'live') : null
  } catch (thrown) {
    console.error('sites: connect moved-domains lookup failed', {
      code: thrown instanceof AdminError ? thrown.code : (thrown as { name?: string })?.name,
    })
  }

  // Outside every `try` above: `redirect()` throws NEXT_REDIRECT by design, and a catch that
  // swallowed it would report a successful connect as a failure (`lib/action-redirect.ts`).
  // THE HINT COMES BEFORE THE BRAND SCREEN and takes nothing away: S2c's offer is a LINK on the
  // card that never retires (`brand-skip` proves it), so a customer sent to the list with the
  // "Moved domains?" hint can still take the brand from the same card afterwards. The reverse
  // order would have shown S2c and swallowed the hint entirely — there is no second chance at it.
  redirect(moved ? MOVED(siteId, moved) : hasBrand(probed?.site_settings?.brand) ? BRAND(siteId) : SITES_URL)
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

async function siteOf(
  formData: FormData,
  // WHICH action refused, because the log line is the only record a refusal leaves. Story 3.3's
  // four share the default; the brand pair names itself, so a bad `site_id` on **Use your brand**
  // is not indistinguishable from a Portal or plan refusal in production (review, 2026-09-08).
  where = 'notice action',
): Promise<{ userId: string; siteId: string } | null> {
  const user = await signedIn()
  const parsed = SiteId.safeParse({ site_id: formData.get('site_id') ?? '' })
  if (!parsed.success) {
    console.error(`sites: ${where} refused`, { code: 'site_id_invalid' })
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
  // `.select('id')` SO A WRITE THAT MATCHED NO ROW IS NOT SILENCE. PostgREST answers an update
  // that hit nothing with no error and no rows — a site id belonging to somebody else is exactly
  // that — and without this the refusal was logged as a success while the notice stayed on screen
  // with no code recorded anywhere (review, 2026-09-08).
  const { data, error } = await supabaseAdmin()
    .from('sites')
    .update(patch)
    .eq('id', at.siteId)
    .eq('user_id', at.userId)
    .select('id')
  if (error) console.error(`sites: ${where} failed`, { code: error.code })
  else if (!data?.length) console.error(`sites: ${where} failed`, { code: 'no_such_site' })
  revalidatePath(SITES)
}

/** The row an answer needs before it may act, or null with a code logged. */
async function rowFor(
  where: string,
  at: { userId: string; siteId: string },
): Promise<{ site_settings: Record<string, unknown>; capability_source: string | null } | null> {
  const { data, error } = await supabaseAdmin()
    .from('sites')
    .select('site_settings, capability_source')
    .eq('id', at.siteId)
    .eq('user_id', at.userId)
    .maybeSingle<{ site_settings: Record<string, unknown> | null; capability_source: string | null }>()
  if (error || !data) {
    console.error(`sites: ${where} refused`, { code: error?.code ?? 'no_such_site' })
    return null
  }
  return { site_settings: data.site_settings ?? {}, capability_source: data.capability_source }
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
  const row = await rowFor('portal answer', at)
  if (!row) return
  // AN ANSWER TO A QUESTION THAT WAS NOT ASKED IS NOT AN ANSWER. The block renders only while the
  // source is `'default'`, so anything else here is a stale or replayed POST, and honouring it
  // would stamp `'declared'` over a real reading (review, 2026-09-08).
  if (row.site_settings.portal_button_source !== 'default') {
    console.error('sites: portal answer refused', { code: 'not_asked' })
    return
  }
  await writeSite('portal answer', at, {
    site_settings: {
      ...row.site_settings,
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
  // THE VALUE IS ONE OF TWO, NAMED. It used to fall back to `'full'` for anything that was not
  // `'preview_only'`, so a POST with the field missing CLEARED a restriction nobody had declared
  // (review, 2026-09-08).
  const answer = formData.get('capability')
  if (answer !== 'full' && answer !== 'preview_only') {
    console.error('sites: plan answer refused', { code: 'capability_invalid' })
    return
  }
  const row = await rowFor('plan answer', at)
  if (!row) return
  // `plan_ask` IS THE QUESTION'S OWN PRECONDITION, and the only thing that sets it is a probe
  // that ran with `ghostpro_preview_probe` ON. Requiring it here is therefore how the flag gates
  // this write too: with the flag off nothing can ever have asked, so nothing can be answered,
  // and `capability` — a server-asserted column (AD-7) — cannot be set from a form (review).
  if (row.site_settings.plan_ask !== true) {
    console.error('sites: plan answer refused', { code: 'not_asked' })
    return
  }
  const { plan_ask: _asked, ...kept } = row.site_settings
  await writeSite('plan answer', at, {
    capability: answer,
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
  // BOTH WAYS OUT REDIRECT, and the failure names the site. A form posts to the URL it is on, so
  // returning quietly on success left a page still at `?recheck=…` showing the failure line above
  // a card that had just re-checked cleanly; and the old `?recheck=failed` carried no id, so one
  // site's failure printed the banner under EVERY Preview-only card (review, 2026-09-08 — five
  // layers, and the matrix row says "THE CARD is unchanged and a banner says to try again").
  redirect(summary.ok ? SITES_URL : RECHECK(at.siteId))
}

/* ───────── STORY 3.4 — FR-C4's TWO ANSWERS, and they live in this file for the same reason the
   four above do: a `'use server'` module may export only async functions, so S2c's route cannot
   carry its own actions beside it.

   BOTH GO THROUGH THE CALLER'S OWN SESSION — `supabaseServer()`, never `supabaseAdmin()` — because
   what they write is `projects`, an AD-6 owner-policy table every write in `projects/actions.ts`
   already reaches this way. RLS is therefore the guard, not an `.eq('user_id', …)` we remembered:
   a `?site=` or a `project_id` naming somebody else's row simply reads back nothing.

   NEITHER WRITES `sites`. `site_settings.brand` is server-asserted and the probe is its only
   author (AD-7); these two only COPY it onto a project. */

/** What S2c needs to know about the site it is offering, read through RLS. */
type BrandSite = {
  id: string
  title: string | null
  url: string
  site_settings: { brand?: unknown; public_url?: string } | null
}

/**
 * THE OFFER IS A LINK AND THE SEED IS IDEMPOTENT. Pressing **Use your brand** twice writes the
 * same pack twice, and nothing anywhere records that it was pressed — FR-C4 asks for "skippable
 * and re-runnable", and a `brand_seeded_at` column would give a third state (used vs skipped) that
 * no screen in this epic shows.
 *
 * AND `linked_site_id` IS WHAT MAKES THAT TRUE WITHOUT A COLUMN. The binding FR-B5 already asks
 * for is the identity "the project for this site", so `brandTarget` finds it and the second press
 * updates rather than inserts. Without it the sentence above was false on every plan with room:
 * the link never retires, so each press made another project with the same name for the same site
 * (review, 2026-09-08 — `brand-rerun` is the step that now executes it).
 * ponytail: the offer is a link; the seed is idempotent, keyed on the binding rather than on a
 * column. A column when a screen needs to tell skipped from used.
 *
 * THE OWNER RULED THE AT-CAP PATH (Question 1, option 1, 2026-09-08) AND THE SCREEN SAYS WHICH
 * PROJECT IT WILL BRAND BEFORE THE PRESS. S2c counts the caller's projects and prints, under the
 * button, either "we'll make one" or the name of the project that will be branded instead — the
 * project for this site where there is one, and otherwise the most recently updated (his
 * Question 4 ruling, 2026-09-08, which this line still described the way the code read before
 * it — review, 2026-09-09). That decision rides in a hidden field, and THIS RE-COUNTS IT: a
 * second tab that filled the cap between the render and the press would otherwise rebrand a
 * project the screen never named. `refusedAtCap` in `projects/actions.ts` is the precedent — the
 * page's count can be one tab out of date, so the answer is to re-render, not to act.
 */
export async function useBrand(formData: FormData): Promise<void> {
  const at = await siteOf(formData, 'use brand')
  // THE ONE FAILURE HERE THAT CANNOT REDIRECT, and it is not an oversight: `BRAND_FAILED` needs a
  // site id and this is precisely the branch where there is not a usable one — `siteOf` refused
  // because `site_id` was absent or not a uuid, which is a crafted post and not a press (every
  // form on S2c carries the hidden field). `siteOf` has already logged it, naming this action.
  // Recorded because the comment beside `BRAND_FAILED` says every failure branch speaks, and a
  // reader counting them would otherwise find this one mute (review 5, 2026-09-09).
  if (!at) return
  const base = brandBase(formData, at.siteId)
  // The screen's own decision: a project id, or empty for "make one". A field that is not there
  // at all is a crafted post, not a press.
  const chosen = formData.get('project_id')
  if (typeof chosen !== 'string') {
    console.error('sites: use brand refused', { code: 'decision_missing' })
    brandRedirect(BRAND_FAILED(base))
  }

  const supabase = await supabaseServer()
  const [{ data: site, error: siteError }, { data: projects, error: projectsError }, { plan }] = await Promise.all([
    // A DISCONNECTED record is not a site (FR-C6), so it is not offering a brand either.
    supabase
      .from('sites')
      .select('id, title, url, site_settings')
      .eq('id', at.siteId)
      .is('disconnected_at', null)
      .maybeSingle<BrandSite>(),
    // `updated_at desc` IS THE DASHBOARD'S OWN ORDER, so "the project you most recently worked on"
    // means on this screen exactly what it means on that one. `id` breaks the tie: two projects
    // saved in the same millisecond gave the page and this action different first rows, and the
    // press then bounced back to S2c for ever (review, 2026-09-08).
    supabase
      .from('projects')
      .select('id, name, slug, style_pack, linked_site_id')
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false }),
    resolveEntitlement(at.userId),
  ])

  // Another user's site id reaches no row through RLS rather than an error — the two are the same
  // answer here, which is the point. A READ THAT FAILED IS NEITHER: 404ing on it tells the customer
  // his own site is gone and gives him nothing to press, while the three write branches below all
  // redirect back to S2c with the reason. One transient PostgREST failure is not a stranger's row
  // (review 4, 2026-09-09) — `sites/page.tsx`'s "A FAILED READ IS NOT AN EMPTY ACCOUNT" is the rule.
  if (siteError) {
    console.error('sites: use brand site read failed', { code: siteError.code })
    brandRedirect(BRAND_FAILED(base))
  }
  // IN THE WINDOW, A ROW THAT IS GONE CLOSES THE WINDOW — `brand-screen.tsx`'s `gone()` takes
  // the same line for the same reason: the popup is rendered by the Sites list, so a `notFound()`
  // here would swap the list for the 404 page on a site disconnected in another tab. The full
  // page still 404s, which is what `brand-ownership` executes (review 7, 2026-09-10).
  if (!site) {
    if (formData.get('popup') === '1') brandRedirect(SITES_URL)
    notFound()
  }
  const brand = site.site_settings?.brand
  // Nothing to offer is nothing to seed: the page 404s for this site too, so this is a stale post.
  if (!hasBrand(brand)) brandRedirect(SITES_URL)
  if (projectsError || !projects) {
    console.error('sites: use brand read failed', { code: projectsError?.code })
    brandRedirect(BRAND_FAILED(base))
  }

  // ONE RULE, SHARED WITH THE CAPTION S2c PRINTED (`brandTarget`): at the cap the most recently
  // updated project, with room the project already made for THIS site — and only when there is
  // none is one made. The offer link never retires, so without the second half a second press
  // inserted a second project for the same site (review, 2026-09-08).
  const capped = atCap(plan, projects.length)
  const target = brandTarget(capped, projects, site.id)
  // THE CUSTOMER MAY HAVE CHOSEN (the owner's Question 3 ruling): where the brand was going onto
  // a project that already exists and there was more than one to choose between, S2c drew a card
  // per project and this is the one he picked. It is looked up in HIS OWN list — the read above
  // is his session's, so RLS has already decided what is in it and a forged id is simply not
  // there. `undefined` here means "make one".
  const picked = chosen === '' ? undefined : projects.find((row) => row.id === chosen)

  // THE DECISION THE SCREEN OFFERED, RE-MADE. Two ways to be stale and both matter: an empty
  // choice — "make one" — while a project for this site or the cap has since appeared, and a
  // named project that is no longer the caller's (deleted in another tab, or never his). Either
  // way nothing is written and S2c is re-rendered with the true sentence and the true cards.
  // `refusedAtCap` in `projects/actions.ts` is the precedent: re-render, never act on a count
  // that has moved. NOTE THE CAP IS STILL ENFORCED BY THIS — at the cap `target` always exists,
  // so an empty choice is refused and no project can be made past the limit.
  if (chosen === '' ? Boolean(target) : !picked) {
    revalidatePath(SITES)
    brandRedirect(base)
  }

  if (picked) {
    // ONTO THE PROJECT THE SCREEN NAMED OR THE CUSTOMER CHOSE, and NOTHING ELSE about it moves —
    // not its name, not its `slug` (FR-J10 freezes that), not its `linked_site_id`. THREE ways to
    // be here and the write is the same: AT THE CAP the project for this site, or the most
    // recently updated one where this site has none (Questions 1 and 4), WITH ROOM the project
    // already made for this site — the second
    // press of an offer that never retires — or, where there was more than one to choose between,
    // the card he picked (Question 3). `linked_site_id` is deliberately untouched in all three:
    // FR-B5 allows a project at most one site, and a chooser that silently re-pointed a project
    // at a different site would move a binding the customer was never asked about. The pack is
    // merged rather than replaced, so a preset E6 has since written survives.
    // NOT `?? defaultStylePack()`: `projects.style_pack` is in the caller's own UPDATE grant
    // (schema `:1202`, the `grant`), so a pack that is not an object is a thing the column can
    // hold — and spreading a string yields its characters, indexed, which is not a pack any more.
    // `defaultStylePack()` UNDERNEATH, not merely as the fallback: an object with no `preset` is
    // also a thing this column can hold, and `{ ...pack, brand }` over one wrote a pack that
    // `stylePackSchema` cannot parse — which used to cost the card the accent as well as the
    // preset (review 3, 2026-09-08; `placeholderFor` no longer loses the brand, and this keeps the
    // stored row valid rather than only the render). A preset the pack really carries still wins,
    // so a pack E6 has since written survives untouched — BUT ONLY IF IT IS ONE. A `preset` that is
    // present and not a string fails `stylePackSchema` exactly as an absent one does, and `...held`
    // put it straight back, so the floor held for the hole and not for the wrong shape while the
    // sentence above claimed both (review 4, 2026-09-09). Every other key of a pack E6 wrote is
    // still carried through untouched; it is the one required field that is repaired.
    const prev = picked.style_pack
    const held = (prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}) as Record<string, unknown>
    const pack = { ...defaultStylePack(), ...held, ...(typeof held.preset === 'string' ? {} : { preset: DEFAULT_PRESET }) }
    const { data, error } = await supabase
      .from('projects')
      .update({ style_pack: { ...pack, brand } })
      .eq('id', picked.id)
      .select('id')
    if (error || !data?.length) {
      console.error('sites: use brand write failed', { code: error?.code ?? 'no_such_project' })
      brandRedirect(BRAND_FAILED(base))
    }
  } else {
    // WITH ROOM: a project for the site, named after it. `lib/projects.ts`'s own rules give it its
    // name and slug — a Ghost title longer than the field allows is clamped, a site with no title
    // falls back to its host, and only when there is NO name at all does `nextUntitled` run.
    // A name that survives but SLUGS to nothing (a Ghost title in CJK, or emoji alone) keeps its
    // name and takes `slugify`'s own 'project' fallback, which `uniqueSlug` then makes unique —
    // the comment said "Untitled project" for that case too, which is a path it never takes
    // (review, 2026-09-09).
    // The SAME host S2c showed the customer — `public_url` where Ghost gave one, which on
    // Ghost(Pro) is not the admin domain the row's `url` holds.
    const shown = hostOf(site.site_settings?.public_url || site.url)
    const named = (site.title ?? '').trim().slice(0, NAME_MAX).trim() || shown.slice(0, NAME_MAX)
    const name = named || nextUntitled(projects.map((row) => row.name))
    const { error } = await supabase.from('projects').insert({
      user_id: at.userId,
      name,
      slug: uniqueSlug(slugify(name), projects.map((row) => row.slug)),
      style_pack: { ...defaultStylePack(), brand },
      // FR-B5's binding, and this is its first writer: it is what turns the Sites card's tally
      // from "0 projects" into "1 project".
      linked_site_id: site.id,
    })
    if (error) {
      console.error('sites: use brand insert failed', { code: error.code })
      brandRedirect(BRAND_FAILED(base))
    }
  }

  revalidatePath(SITES)
  revalidatePath(DASHBOARD)
  brandRedirect(SITES_URL)
}

/**
 * S2c ANSWERS ONTO ITSELF, SO IT REPLACES THE HISTORY ENTRY RATHER THAN PUSHING ONE — the same
 * rule `keysRedirect` above states, and for the same measured reason. Since the owner asked for
 * the brand offer as a popup (2026-09-10) the Sites card's offer opens `/sites?brand=…`, a window
 * over the list whose every way out — Escape, the backdrop, the ✕ — leaves by `replace`
 * (`panel-modal.tsx`, `brand-panel.tsx`); a server action's `redirect()` pushes by default, so a
 * failed **Use your brand** would have put a second entry under the panel and the first Back
 * would have returned to the panel-before-the-failure instead of to the list. (The first writing
 * of this named an intercepted route and `router.back()` — the mechanism `acd31327` replaced;
 * review 7, 2026-09-10.)
 *
 * `connectSite`'s OWN redirect onto this screen deliberately does NOT use this. It arrives from
 * `/sites` and is the customer's first sight of the offer, so it is a real step forward in the
 * history — and the owner ruled at Question 7 (option 1, 2026-09-10) that it stays the full page.
 */
function brandRedirect(url: string): never {
  redirect(url, RedirectType.replace)
}

/**
 * **Skip**, and it writes nothing at all — not even a note that it was pressed. The offer stays on
 * the site's card, so "skipped" and "not taken yet" are one state and the customer can come back
 * to it. It is a form rather than a link so that both controls on S2c are the same kind of thing
 * and both work with JavaScript off.
 */
export async function skipBrand(formData: FormData): Promise<void> {
  await siteOf(formData, 'skip brand')
  brandRedirect(SITES_URL)
}

/**
 * STORY 3.5 — FR-C6's MISSING WRITER. `sites.disconnected_at` had no author anywhere in the
 * product: Story 3.2 built the whole RE-ADOPTION half — a disconnected record revived in place,
 * keeping its id, its `site_settings` and its staff flag, and the cap counting only active rows —
 * and nothing could put a record into that state, so the branch had never run in production and a
 * customer could not let a site go at all.
 *
 * IT DELETES EXACTLY ONE THING: THE CREDENTIALS. The `sites` row, every `projects` row, every
 * `projects.linked_site_id` and every `site_snapshots` row survive untouched. That is FR-C6's
 * promise made true BY CONSTRUCTION rather than by a rule someone remembers, and the live harness
 * counts each of them either side of the press.
 *
 * CREDENTIALS FIRST, `disconnected_at` SECOND, AND A FAILED `remove()` FAILS THE WHOLE ACTION.
 * `remove()` reaches Vault over the transaction pooler and throws on any store failure
 * (`ghost-admin/index.ts:151`); a caught throw leaves the site connected and the card says so. The
 * reverse order would leave a window in which the card reads "gone" while the Admin key still
 * decrypts.
 *
 * READ UNDER THE CALLER'S OWN SESSION, WRITTEN UNDER THE SERVICE ROLE. The read proves ownership
 * through RLS rather than through an `.eq('user_id', …)` a future edit could drop (`useBrand`'s
 * shape, executed by the `brand-ownership` step); the write MUST be `supabaseAdmin()` because
 * `authenticated` may UPDATE only `(title, favicon_url, updated_at)` on `sites` (schema :1040) —
 * `disconnected_at` and `content_key` are server-asserted (AD-7). Both clients are already
 * imported by this file and it is already on both importer lists in `server-wiring.test.ts`.
 *
 * `credentials_present` STAYS THE MIRROR IT CLAIMS TO BE (Story 3.2's rule): `remove()` flips
 * `admin` and `staff` inside its own transaction, and the same update that stamps `disconnected_at`
 * nulls `content_key` and flips `content`. A disconnected record holds no credential of any kind.
 *
 * THE 90-DAY ORPHAN CLOCK IS DERIVED FROM `disconnected_at` AND NEVER STAMPED INTO
 * `site_snapshots.purge_after` — that column carries FR-A5's 14-day account-deletion clock and only
 * that, which is what keeps `restore_account()`'s `purge_after = null` correct as written and
 * closes DW-43 with no SQL. The purging job itself is **Story 7.20's**, beside the snapshot it
 * deletes (the owner's ruling at Question 1, 2026-09-09; DW-75). This story owes only the clock's
 * origin, written once.
 *
 * NO GHOST WRITE. Disconnecting changes nothing on the customer's Ghost, which is the sentence
 * D4c already prints; `ADMIN_WRITES` is untouched.
 *
 * NO AUDIT ROW, AND THAT IS A FINDING, NOT AN OVERSIGHT (Dev, 2026-09-09, standing rule 1 — cite
 * or execute). The spec asked for "an audit row for each removal"; `remove()` was READ and writes
 * none — `withStore` only wraps its errors — and `public.credential_action` is a fixed six-value
 * enum (`admin_write`, `admin_read`, `vault_decrypt`, `entitlement_change`, `admin_flag_change`,
 * `moderation`) with no member meaning "a credential was removed". Adding one is a migration, which
 * this story's Boundaries forbid in bold, and writing under `vault_decrypt` would put a FALSE row in
 * the one record that exists to be trusted and break two live counts. So nothing untrue is written.
 * THE OWNER RULED IT (option 1, 2026-09-09, Story 3.5's Question 3): the removal entry lands in the
 * story that next changes the log, which is **Story 3.6** — it adds *Remove token*, so it removes
 * keys too and needs the very same new value; one migration, made once, covering both callers
 * (DW-76). `store()` is silent for the same reason and joins it there. What IS proved meanwhile, and
 * it is the stronger evidence: the harness's `disconnect` step reads `vault.secrets` through the
 * pooler and sees the secret gone.
 */
export async function disconnectSite(formData: FormData): Promise<void> {
  const at = await siteOf(formData, 'disconnect')
  // A `site_id` that is absent or not a uuid is a crafted post, not a press — every ⋯ menu carries
  // the hidden field. `siteOf` has already logged it, naming this action.
  if (!at) notFound()

  // OWNERSHIP THROUGH RLS, AND THE ROW'S CURRENT STATE IN THE SAME READ. A site id the caller does
  // not own simply is not in this list, which is the matrix's "nothing written, nothing disclosed".
  const supabase = await supabaseServer()
  const { data: site, error } = await supabase
    .from('sites')
    .select('id, disconnected_at')
    .eq('id', at.siteId)
    .maybeSingle<{ id: string; disconnected_at: string | null }>()
  // A READ THAT FAILED IS NOT A STRANGER'S ROW — the rule `useBrand` was given at review 4 and
  // `sites/page.tsx` states as "A FAILED READ IS NOT AN EMPTY ACCOUNT". 404ing on it would tell
  // the customer his own site is gone; the card's own failure line is the honest answer.
  if (error) {
    console.error('sites: disconnect read failed', { code: error.code })
    redirect(DISCONNECT_FAILED(at.siteId))
  }
  if (!site) notFound()
  // The same id posted twice: the second press has nothing to do and nothing to say about it.
  if (site.disconnected_at) redirect(SITES_URL)

  // ── THE CREDENTIALS, FIRST. Both kinds unconditionally: `remove()` matches on a ref that is
  //    NOT NULL, so a kind that was never stored matches no row and the call is a true no-op —
  //    and `staff` is exactly that today, because nothing stores one until Epic 7. (Until the
  //    review of 2026-09-09 that `is not null` was missing and this comment was WRONG: the call
  //    stamped `staff_rotated_at` for a token that had never existed, which Story 3.6's Manage
  //    keys renders as "Key removed 15 Aug". The guard is in `remove()` so every future caller
  //    inherits it.) SO THIS IS NOT DW-54's `staff-removed` PROOF and must not be recorded as
  //    one: removing a token that was never there exercises the call and says nothing about the
  //    secret it would have dropped. It is here so the day Epic 7 stores one, disconnecting
  //    already takes it out. The trigger deletes the Vault secret behind each ref it nulls (DW-44).
  //    `userId` IS PASSED because ownership belongs beside the write, not in the caller's memory:
  //    the RLS read above is this action's proof, and `remove()`'s own `and user_id =` clause is
  //    the floor under it, the same one `store()` has always had.
  try {
    await remove({ siteId: site.id, userId: at.userId, kind: 'admin', route: DISCONNECT_ROUTE })
    await remove({ siteId: site.id, userId: at.userId, kind: 'staff', route: DISCONNECT_ROUTE })
  } catch (thrown) {
    // Logged with a code and no value, and the site is STILL CONNECTED: nothing below has run.
    // `redirect` throws NEXT_REDIRECT and this catch is not inside another `try`, so it leaves.
    console.error('sites: disconnect remove failed', {
      code: thrown instanceof AdminError ? thrown.code : (thrown as { name?: string })?.name,
    })
    redirect(DISCONNECT_FAILED(site.id))
  }

  // ── ...AND ONLY THEN THE STAMP. One update, three server-asserted columns, and `.select('id')`
  //    so a write that matched no row is not silence — PostgREST answers an update that hit
  //    nothing with no error and no rows (`writeSite`'s own finding).
  //    `.is('disconnected_at', null)` SO THE CLOCK IS WRITTEN ONCE. FR-C6's 90-day orphan
  //    deadline is DERIVED from this column (DW-43), so a second press that re-stamped it would
  //    silently restart the countdown on a site that had been let go weeks earlier. The read above
  //    already redirects an already-disconnected site, but two presses can pass it together — two
  //    tabs, or a scripts-off double post — and only the write can settle a race (review,
  //    2026-09-09).
  const { data, error: stamped } = await supabaseAdmin()
    .from('sites')
    .update({
      disconnected_at: new Date().toISOString(),
      content_key: null,
      credentials_present: { content: false, admin: false, staff: false },
    })
    .eq('id', site.id)
    .eq('user_id', at.userId)
    .is('disconnected_at', null)
    .select('id')
  if (stamped) {
    console.error('sites: disconnect stamp failed', { code: stamped.code })
    redirect(DISCONNECT_FAILED(site.id))
  }
  // MATCHING NO ROW IS NOT A FAILURE HERE, and that is the whole of the `.is()` above: the row was
  // read under this caller's own session moments ago, so the only way it is gone is that the other
  // press won. The credentials are out either way and the site is disconnected — which is what
  // `/sites` is about to show. The matrix's "the same id posted twice → idempotent".
  if (!data?.length) {
    console.error('sites: disconnect stamp matched nothing', { code: 'already_disconnected' })
    redirect(SITES_URL)
  }

  // The card leaves the list, and the dashboard's own tally of connected sites moves with it.
  revalidatePath(SITES)
  revalidatePath(DASHBOARD)
  redirect(SITES_URL)
}

/* ───────── STORY 3.6 — MANAGE KEYS' THREE WRITERS, and they live in THIS file for the reason the
   nine above them do: a `'use server'` module may export only async functions, so the route cannot
   carry its own actions beside it (the header at the top of this file is the record).

   NONE OF THEM ANSWERS THE CALLER. Manage keys is server-rendered — no `useActionState`, which is
   what makes every control on it a plain `<form action={…}>` that a scripts-off browser posts
   natively — so each redirects back to the screen with its reason in the URL, the shape
   `recheckPlan` and `disconnectSite` already have.

   EVERY CALL THEY MAKE IS A `GET`. `ADMIN_WRITES` is untouched: validating a key is
   `GET /admin/config/`, checking which install it belongs to is `GET /admin/site/`, and **Test
   connection** is `GET /admin/config/` again. Nothing on this screen changes anything on the
   customer's Ghost.

   AND NONE OF THEM WRITES `sites.health` OR `sites.last_checked_at`. Those two, the "Reconnect
   needed" state, the once-per-transition email and its 7-day cap are Story 3.7's state machine; a
   manual press that wrote either would drive that machine from outside it, and a press that wrote
   `last_checked_at` alone would make the card claim a check the daily job never made. So the test
   result is drawn on this screen and stored nowhere. */

/**
 * MANAGE KEYS REPLACES THE HISTORY ENTRY; IT DOES NOT PUSH ONE. Every one of these three actions
 * answers by redirecting to the screen the customer is already on (`recheckPlan`'s shape), and
 * since the owner's test the screen is usually a WINDOW over the Sites list — `/sites?manage=…`,
 * a parameter on the list itself (`panel-modal.tsx` carries why it is not a route).
 *
 * A server action's `redirect()` PUSHES by default. Measured on a throwaway control under
 * `next dev`, 2026-09-10: after one push-redirect the first Back returned to the panel as it stood
 * BEFORE the save instead of to the list, and after two saves it took three. With `replace` there
 * is exactly one entry for the panel however many keys are saved or refused, and Back is always
 * the list — executed as the control, with the push variant failing beside it.
 *
 * IT COSTS THE SCRIPTS-OFF PATH NOTHING: `RedirectType` steers the CLIENT router only. The same
 * control posted the form with JavaScript disabled and got the same 303 onto the same URL.
 */
/* A `function` declaration with an explicit `never`, and not a `const` arrow: TypeScript only
   lets a never-returning CALL end a code path when the callee is declared that way, so the arrow
   form left `parsed.data` "possibly undefined" three lines under a refusal that cannot return. */
function keysRedirect(url: string): never {
  redirect(url, RedirectType.replace)
}

/** The row Manage keys acts on, read under the CALLER'S OWN session so RLS decides it exists. */
async function keysSite(
  at: { userId: string; siteId: string },
  base: string,
): Promise<{
  id: string
  url: string
  site_settings: { public_url?: string } | null
  credentials_present: Record<string, boolean> | null
}> {
  const supabase = await supabaseServer()
  const { data: site, error } = await supabase
    .from('sites')
    .select('id, url, site_settings, credentials_present, disconnected_at')
    .eq('id', at.siteId)
    .maybeSingle<{
      id: string
      url: string
      site_settings: { public_url?: string } | null
      credentials_present: Record<string, boolean> | null
      disconnected_at: string | null
    }>()
  // THE SAME SPLIT `sites/keys/page.tsx` MAKES, and for the same reasons — a malformed id is
  // `22P02` and not a failed read, a failed read is not a stranger's row, and an
  // already-disconnected record redirects rather than 404ing (the split the review of 2026-09-09
  // gave `sites/disconnect`). `redirect` throws NEXT_REDIRECT, so these leave.
  //
  // IT DIFFERS FROM THE PAGE ON ONE OF THE THREE, deliberately: a FAILED READ throws there and
  // redirects here. A page that cannot read its own row has nothing to draw and the error boundary
  // is the honest answer; an ACTION that cannot read it has a screen to go back to, and saying
  // "nothing changed" on it beats replacing the customer's work with a boundary. The comment that
  // claimed the two were identical is what a later reader would have trusted (review, 2026-09-09).
  if (error?.code === '22P02') notFound()
  if (error) {
    console.error('sites: keys read failed', { code: error.code })
    keysRedirect(KEYS_REFUSED(base, 'keys_failed'))
  }
  if (!site) notFound()
  if (site.disconnected_at) keysRedirect(SITES_URL)
  return site
}

/** WHICH BOX WAS EMPTY, read off the form that was posted rather than guessed: each credential
    row is its own `<form>` carrying its own one field, so the field that is PRESENT names the row.
    A post carrying none of the three is crafted and takes the Admin row's sentence. */
const emptyKeyCode = (formData: FormData) =>
  formData.has('staff_token') ? 'token_empty' : formData.has('content_key') ? 'content_key_empty' : 'credential_empty'

/** Manage keys' three fields, each optional: every credential row posts its own form. */
const KeyFields = z.object({
  admin_key: z.string().max(CONNECT_MAX),
  content_key: z.string().max(CONNECT_MAX),
  staff_token: z.string().max(CONNECT_MAX),
})

/**
 * FR-C8 — A KEY IS PASTED AND IT IS PROVED BEFORE IT IS STORED.
 *
 * The Admin key goes through the path `connectSite` already uses — `fetchWithKey` on
 * `GET /admin/config/` — so a typo is refused where it was typed rather than surfacing as a broken
 * site the next day. THAT ONE CALL IS THE WHOLE OF THE WRONG-KEY DEFENCE, and the story originally
 * claimed otherwise (owner's ruling **R-100**, 2026-09-09): a key issued by a different Ghost
 * install is sent to THIS record's Ghost, which has never heard of it and answers 401 `Unknown
 * Admin API Key`. It is refused and nothing is written; the sentence is Ghost's own rather than the
 * "disconnect and reconnect" one the spec first promised, because Inflozo cannot tell "this key is
 * from your other site" apart from "this key is wrong" — Ghost gives one answer to both, and
 * `api_keys` carries no install identity at all (MEASUREMENTS §37, read in Ghost's source).
 *
 * `GET /admin/site/` IS KEPT, FOR THE CASE IT REALLY DOES CATCH: this Ghost now reports a different
 * public address than the one recorded at connect. That IS a domain move — the state FR-C8 designed
 * for when it removed edit-URL-in-place, because carrying this record's snapshots, projects and
 * first-upload flag onto a different live Ghost is the harm — and it is where "disconnect and
 * connect the new address" belongs. `site/` validates nothing (it answers 200 to any key at all,
 * §38a and `epic-3-context.md`), which is why it is read only AFTER `config/` has passed and is
 * used as an IDENTIFIER rather than as a check.
 *
 * THE CONTENT KEY IS NOT VALIDATED HERE (FR-C2). The browser checks it against the customer's own
 * Ghost before this action is called — that is the path the editor will use, and a server-side 200
 * would prove the wrong thing — so with scripts off it is stored unchecked, exactly as connect
 * stores it.
 *
 * THE STAFF TOKEN IS PARSED AND STORED, AND NOTHING VALIDATES IT AGAINST GHOST. It is a
 * `id:secret` pair that `parseCredential` reads identically to an Admin key, but the endpoints it
 * unlocks are Epic 7's (`GET /admin/themes/`, `PUT /admin/settings/routes/`), and calling one here
 * to prove the token would be this story making an Admin call no story owns. `store()` refuses a
 * malformed one before Vault, which is the check that matters: a token that cannot sign is a typo.
 */
export async function saveKeys(formData: FormData): Promise<void> {
  const at = await siteOf(formData, 'save keys')
  if (!at) notFound()
  const base = keysBase(formData, at.siteId)
  const parsed = KeyFields.safeParse({
    admin_key: formData.get('admin_key') ?? '',
    content_key: formData.get('content_key') ?? '',
    staff_token: formData.get('staff_token') ?? '',
  })
  // Each field carries `maxLength`, so only a crafted post gets here — answered under the field it
  // came in, as the wizard's own over-long post is.
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0]
    keysRedirect(
      KEYS_REFUSED(base, field === 'staff_token' ? 'token_malformed' : field === 'content_key' ? 'content_key_malformed' : 'credential_malformed'),
    )
  }
  const adminKey = parsed.data.admin_key.trim()
  const contentKey = parsed.data.content_key.trim()
  const staffToken = parsed.data.staff_token.trim()
  /* THE OWNER'S TEST, 2026-09-10, FINDING 4: "when I click Save Key without any inputs, it does
     not show any error." This line used to read "a press with nothing to do says nothing about
     it" and redirect in silence — which is R-98 broken by a decision rather than by an omission:
     a pressed control says what happened, and "there was nothing in the box" is what happened.
     THE CODE NAMES THE ROW, because each credential row posts only its own field, so the refusal
     lands under the box that was empty and never on a neighbour (the frozen Boundaries' rule). */
  if (!adminKey && !contentKey && !staffToken) keysRedirect(KEYS_REFUSED(base, emptyKeyCode(formData)))

  const site = await keysSite(at, base)

  if (adminKey) {
    let belongsHere: string | undefined
    try {
      const config = await fetchWithKey({
        credential: adminKey,
        siteUrl: site.url,
        path: 'config/',
        route: KEYS_ROUTE,
        siteId: site.id,
        userId: at.userId,
      })
      if (!config.ok) keysRedirect(KEYS_REFUSED(base, config.code ?? 'ghost_refused', config.status))
      // WHICH GHOST THIS KEY OPENS. `site/` answers 200 to any key at all (§38a), so it validates
      // nothing and is read only AFTER `config/` has passed — here it is not a validator but an
      // IDENTIFIER, which is a use it is perfectly good for.
      const answered = await fetchWithKey({
        credential: adminKey,
        siteUrl: site.url,
        path: 'site/',
        route: KEYS_ROUTE,
        siteId: site.id,
        userId: at.userId,
      })
      const read = (answered.body as { site?: { url?: unknown } })?.site
      if (answered.ok && isHttpUrl(read?.url)) belongsHere = read.url
    } catch (thrown) {
      // A REDIRECT THROWS `NEXT_REDIRECT`, AND THIS CATCH USED TO EAT IT. The refusal above is a
      // `keysRedirect()` inside this `try`, so its throw landed here, failed `instanceof AdminError`,
      // and was rewritten as `keys_failed` — the one refusal a customer rolling keys is most
      // likely to hit, reported as an unexplained "nothing changed" in the page banner instead of
      // the key's own sentence under the key's own field. Executed against Next 16.3.1 at the
      // review of 2026-09-09; `lib/action-redirect.ts` exists for exactly this rejection.
      if (isRedirect(thrown)) throw thrown
      if (thrown instanceof AdminError) keysRedirect(KEYS_REFUSED(base, thrown.code))
      console.error('sites: keys validate failed', { name: (thrown as { name?: string })?.name })
      keysRedirect(KEYS_REFUSED(base, 'keys_failed'))
    }
    // WHAT THIS COMPARISON ACTUALLY PROVES, stated exactly, because it was over-claimed once and
    // the owner ruled on it (R-100, 2026-09-09). Both calls above go to THIS record's `site.url`,
    // so a key issued by a DIFFERENT Ghost install never reaches here at all: that Ghost answers
    // 401 `Unknown Admin API Key` at `config/` and the refusal above fires (executed T3→T1 and
    // T1→T3, with T1→T1 200 as the control; MEASUREMENTS §37). What IS caught here is the other
    // case, and it is a real one: **this** Ghost now reports a different public address than the
    // one Inflozo recorded — a domain move, which is exactly where "disconnect and connect the new
    // address" belongs.
    //
    // A HOST COMPARISON AND NOT A STRING ONE: `public_url` is kept AS GHOST SENDS IT, trailing
    // slash and all (§38a), and `sites.url` is the normalised origin. A read that could not answer
    // at all leaves `belongsHere` undefined and the key is stored: `config/` has already proved it,
    // and refusing a valid rotation because a cosmetic read failed would be the wrong kind of
    // careful (the same rule connect's own `site/` read follows).
    //
    // AND IT COMPARES GHOST'S ANSWER WITH GHOST'S ANSWER, NEVER WITH THE TYPED ADDRESS. `mine` used
    // to fall back to `sites.url` when `public_url` was absent, and `public_url` CAN be absent on a
    // perfectly healthy record: it is written in one place, at connect, inside a deliberately
    // non-fatal `try`, and nothing ever backfills it — `probeSite` preserves it and never writes
    // it. On Ghost(Pro) the admin origin the customer types and the public address Ghost reports
    // differ BY DESIGN (this file says so three screens up), so on such a record the customer's
    // first entirely legitimate key rotation was refused as "These keys belong to a different Ghost
    // site" — permanently, because the URL row offers no way to correct it and the daily re-check
    // never refreshes `public_url`. Found by the review of 2026-09-09. With no recorded answer from
    // Ghost there is nothing to compare against, so the comparison does not happen.
    const recorded = site.site_settings?.public_url
    if (recorded && belongsHere && hostOf(belongsHere) !== hostOf(recorded)) {
      keysRedirect(KEYS_REFUSED(base, 'keys_other_site'))
    }
    try {
      // `store()` re-encrypts, stamps `admin_key_rotated_at`, writes the key's public id half and
      // audits — and DW-44's trigger deletes the secret the old ref pointed at.
      await store({ siteId: site.id, userId: at.userId, kind: 'admin', secret: adminKey, route: KEYS_ROUTE })
    } catch (thrown) {
      if (thrown instanceof AdminError) keysRedirect(KEYS_REFUSED(base, thrown.code))
      console.error('sites: keys store failed', { name: (thrown as { name?: string })?.name })
      keysRedirect(KEYS_REFUSED(base, 'keys_failed'))
    }
  }

  if (staffToken) {
    try {
      await store({ siteId: site.id, userId: at.userId, kind: 'staff', secret: staffToken, route: KEYS_ROUTE })
    } catch (thrown) {
      // `credential_malformed` under the TOKEN's own name: the Admin key's sentence names the
      // integration, and a Staff Access Token is not on the integration at all.
      if (thrown instanceof AdminError) {
        keysRedirect(KEYS_REFUSED(base, thrown.code === 'credential_malformed' ? 'token_malformed' : thrown.code))
      }
      console.error('sites: keys token store failed', { name: (thrown as { name?: string })?.name })
      keysRedirect(KEYS_REFUSED(base, 'keys_failed'))
    }
  }

  if (contentKey) {
    // `sites.content_key` IS SERVER-ASSERTED (AD-7) — `authenticated` may update only title,
    // favicon_url and updated_at (schema :1198) — so this is `supabaseAdmin()`'s, scoped by the
    // `.eq('user_id')` that stands in for the RLS this client bypasses. `credentials_present` is
    // read-modify-written as one object because it is the client's MIRROR of what is stored, and
    // the two Vault kinds on it are `store()`'s to move.
    // ONE UPDATE CARRYING BOTH COLUMNS. It was two, and the second one's failure was only
    // `console.error`'d before the action redirected as a success — so a mirror that would not
    // land left the key STORED while the row still drew **Not added** with no mask, which is the
    // "the row claims a state nobody wrote" hazard this file argues against one screen over
    // (review, 2026-09-09). `credentials_present` comes from `keysSite`'s read above, taken before
    // any `store()` on this request, and `.select('id')` is what makes a write that matched no row
    // an answer rather than silence (`writeSite`'s own rule).
    const { data, error } = await supabaseAdmin()
      .from('sites')
      .update({
        content_key: contentKey,
        credentials_present: { ...(site.credentials_present ?? {}), content: true },
      })
      .eq('id', site.id)
      .eq('user_id', at.userId)
      .select('id')
      .maybeSingle<{ id: string }>()
    if (error || !data) {
      console.error('sites: keys content write failed', { code: error?.code ?? 'no_such_site' })
      keysRedirect(KEYS_REFUSED(base, 'keys_failed'))
    }
  }

  revalidatePath(SITES)
  keysRedirect(base)
}

/**
 * FR-C8 — THE TOKEN COMES OUT, AND THE SITE STAYS CONNECTED. That is the whole of this action and
 * the whole of what makes a partially credentialed site an ordinary state: `remove()` flips
 * `credentials_present.staff`, DW-44's trigger drops the secret behind the ref, and nothing else
 * moves. The three token-dependent capabilities — the pre-Inflozo snapshot, the drift re-read and
 * the `routes.yaml` upload — read that flag when Epic 7 builds them, and the row on this screen
 * says **Not added** with what it would enable.
 *
 * NO SIXTH DELETION PATH: `remove()` is already one of AD-32/AD-33's five.
 */
export async function removeToken(formData: FormData): Promise<void> {
  const at = await siteOf(formData, 'remove token')
  if (!at) notFound()
  const base = keysBase(formData, at.siteId)
  const site = await keysSite(at, base)
  try {
    await remove({ siteId: site.id, userId: at.userId, kind: 'staff', route: REMOVE_TOKEN_ROUTE })
  } catch (thrown) {
    // The store could not be reached, so NOTHING changed — `remove()` owns its own transaction —
    // and the screen says so rather than showing a row that claims a state nobody wrote.
    console.error('sites: remove token failed', {
      code: thrown instanceof AdminError ? thrown.code : (thrown as { name?: string })?.name,
    })
    // NOT `credential_store_unavailable`: that sentence reads "We couldn't save your key just now.
    // Nothing was connected" — a connect's words about a save, on a press that removes (review,
    // 2026-09-09). `token_remove_failed` is `disconnect_failed`'s twin one row down.
    keysRedirect(KEYS_REFUSED(base, 'token_remove_failed'))
  }
  revalidatePath(SITES)
  keysRedirect(base)
}

/**
 * S11d's **Test connection**: ONE `GET /admin/config/` on the STORED key, through `call()` — so it
 * exercises the decrypt path, the audit row and the mint exactly as every other product call does,
 * rather than a second code path that could pass while the real one is broken.
 *
 * IT STORES NOTHING. The result is carried back in the URL and drawn on the screen; `sites.health`
 * and `sites.last_checked_at` belong to Story 3.7's state machine and this must not reach into it
 * (see the header above these three).
 */
export async function testConnection(formData: FormData): Promise<void> {
  const at = await siteOf(formData, 'test connection')
  if (!at) notFound()
  const base = keysBase(formData, at.siteId)
  const site = await keysSite(at, base)
  let result: string
  let status: number | undefined
  try {
    const config = await call({ siteId: site.id, path: 'config/', route: TEST_ROUTE })
    result = config.ok ? 'ok' : (config.code ?? 'ghost_refused')
    status = config.ok ? undefined : config.status
  } catch (thrown) {
    // A THROWN CODE IS A RESULT HERE, not a failure of the press: "your Ghost did not answer" and
    // "this key has no secret behind it" are both things the customer came to this screen to find
    // out. The screen reads the same codes table every other refusal on it reads.
    result = thrown instanceof AdminError ? thrown.code : 'keys_failed'
    if (!(thrown instanceof AdminError)) {
      console.error('sites: test connection failed', { name: (thrown as { name?: string })?.name })
    }
  }
  keysRedirect(KEYS_TESTED(base, result, status))
}
