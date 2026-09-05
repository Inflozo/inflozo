import { supabaseServer } from './supabase/server.ts'
import { PLANS, planFor, type Caps, type EntitlementState, type PlanId } from './plan.ts'

/**
 * THE SPINE'S SINGLE RESOLVER (AD-28). Plan state comes from one server-side
 * `resolveEntitlement(userId)`, with the plan table expressed once as data — `plan.ts` — so a
 * second decider cannot appear beside it and disagree on `pro_past_due`.
 *
 * The read is the user's OWN row through the user-scoped client, so RLS scopes it rather than
 * a `where` clause being trusted to; `entitlements` is select-only to `authenticated` (schema
 * §11a) and its row is created at signup by the `auth.users` trigger. AD-28: an ABSENT row
 * resolves to Free — a failed read resolves the same way, because refusing to draw the
 * dashboard because billing state is unavailable would be worse than showing the Free side of it.
 *
 * `subscriptions` and the `reasons` a capability is withheld for are Epic 12's to add here.
 * They are named in the return shape so E12 widens this function rather than writing a second one.
 */
export type Entitlement = { plan: PlanId; caps: Caps; reasons: string[] }

export async function resolveEntitlement(userId: string): Promise<Entitlement> {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('entitlements')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle<{ state: EntitlementState }>()

  // Logged without the id: logs carry no user content (spine, Security floor).
  if (error) console.error('entitlement: read failed', { code: error.code })

  const plan = planFor(data?.state)
  return { plan, caps: PLANS[plan], reasons: [] }
}
