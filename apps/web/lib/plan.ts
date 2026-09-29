/**
 * APPENDIX F.1, EXPRESSED ONCE, AS DATA.
 *
 * `prd.md` Appendix F.1 is "the sole definition of Free/Pro gating". Every number this app
 * shows or enforces about a plan is read from here — never typed into a sentence, never
 * restated in a component (the project's standing rule: counts are derived). The three
 * `entitlements.state` values collapse to two plans and the third column of F.1 is why:
 * during the 7-day grace window a past-due customer keeps EVERY Pro capability, so
 * `pro_past_due` resolves to Pro with no per-row exception.
 *
 * No Next import on purpose — `entitlement.ts` next door makes the client and caches the answer,
 * this file does the deciding, split exactly as `server.ts` is split from `cookies.ts` so
 * `node --test` can reach it. Since Story 5.24b it holds the read as well (`readEntitlement`, over
 * a client it is handed), because the degradation rule was the one decision the split left
 * unexecuted (DW-29).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

/** `public.entitlement_state` (schema :534). An absent row is `undefined` here and means Free. */
export type EntitlementState = 'free' | 'pro_active' | 'pro_past_due'

export type PlanId = 'free' | 'pro'

export type Caps = {
  projects: number
  sites: number
  storageMb: number
  uploadMb: number
  /** deploy history / rollback — kept per project */
  history: number
}

/** F.1's numeric rows. The rows beside `projects` are here for the epics that read them. */
export const PLANS: Record<PlanId, Caps> = {
  free: { projects: 1, sites: 1, storageMb: 100, uploadMb: 10, history: 3 },
  pro: { projects: 25, sites: 10, storageMb: 5120, uploadMb: 10, history: 10 },
}

/** F.1's header: "Pro — $15/mo · $150/yr". */
export const PRICE = { monthly: 15, yearly: 150 }

export const planFor = (state?: EntitlementState | null): PlanId =>
  state === 'pro_active' || state === 'pro_past_due' ? 'pro' : 'free'

/**
 * THE USER'S OWN `entitlements` ROW, READ, AND AD-28's DEGRADATION WITH IT: a failed read is Free
 * and one log line, never a throw (`entitlement.ts` says why). `resolveEntitlement` hands in the
 * user-scoped client, so RLS scopes the read.
 *
 * IT MOVED HERE FROM `entitlement.ts` (DW-29, Story 5.24b), which imports `next/headers`, so no
 * test could load it. `planFor(undefined)` was held; that the read HANDS it `undefined` on a
 * failure, rather than throwing, was a `?.` nothing executed. `plan.test.ts` now runs this against
 * a real `createClient` and a local server answering 500.
 */
export async function readEntitlement(
  client: SupabaseClient,
  userId: string,
  log: Pick<Console, 'error'> = console,
): Promise<PlanId> {
  const { data, error } = await client
    .from('entitlements')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle<{ state: EntitlementState }>()
  // Logged without the id: logs carry no user content (spine, Security floor).
  if (error) log.error('entitlement: read failed', { code: error.code })
  return planFor(data?.state)
}

/**
 * FR-B4's comparison, in ONE place. It used to be written out at three call sites — the two
 * actions and the page that decides D4a from D4b — and three copies of a paywall predicate is
 * how a paywall drifts: nothing failed when they disagreed, because nothing executed the
 * comparison (review, 2026-09-05). `plan.test.ts` holds it at the cap and either side of it.
 */
export const atCap = (plan: PlanId, count: number): boolean => count >= PLANS[plan].projects

/** The badge's word, and the subject of every sentence below. */
export const planName = (plan: PlanId): string => (plan === 'free' ? 'Free' : 'Pro')

/**
 * D4b's pill and S3c's first sentence: "Free includes 1 project", "Pro includes 25 projects".
 * Pluralised from the number rather than written twice.
 */
export const includesProjects = (plan: PlanId): string => {
  const n = PLANS[plan].projects
  return `${planName(plan)} includes ${n} project${n === 1 ? '' : 's'}`
}

/**
 * The upgrade tile's and the upgrade block's sentence. On Free it names the way out; on Pro
 * there is no way out to name, so it is the pill's sentence and nothing more.
 */
export const capSentence = (plan: PlanId): string =>
  plan === 'free'
    ? `${includesProjects('free')}. Pro gives you ${PLANS.pro.projects}.`
    : `${includesProjects('pro')}.`

/** S3c's and D4b's call to action, priced from the table. */
export const goProLabel = (): string => `Go Pro — $${PRICE.monthly}/mo`

/**
 * FR-C's cap, beside FR-B4's. Sites and projects are two different numbers on the same plan row
 * and each is counted where it is enforced — `atCap` in the project actions, this in the connect
 * action — so a copied predicate cannot enforce the wrong column (Story 3.2).
 */
export const atSiteCap = (plan: PlanId, count: number): boolean => count >= PLANS[plan].sites

/** S11c's first clause: "Free includes 1 site", "Pro includes 10 sites". */
export const includesSites = (plan: PlanId): string => {
  const n = PLANS[plan].sites
  return `${planName(plan)} includes ${n} site${n === 1 ? '' : 's'}`
}

/**
 * S11c's sentence in full, and the banner the connect action answers `at_cap` with:
 * "Free includes 1 site. Pro connects up to 10." On Pro there is nothing further to sell, so it
 * is the first clause and nothing more — `capSentence`'s own shape, one row down the plan table.
 */
export const siteCapSentence = (plan: PlanId): string =>
  plan === 'free'
    ? `${includesSites('free')}. Pro connects up to ${PLANS.pro.sites}.`
    : `${includesSites('pro')}.`
