// Story 5.20 — WHO MAY READ A POST: Ghost's own `checkPostAccess`, ported ONCE, over View as's three visitors (FR-D16).
//
// READ IN SOURCE on both majors (`core/server/services/members/content-gating.js`, 5.130.6 :34-62 and 6.58.0 :65-85,
// which moves the filter into `getPostAccessFilter` and changes nothing it answers). The rules, in Ghost's order:
//
//   public            → allow
//   no member         → block
//   members           → allow
//   paid              → the member matches `status:-free`
//   tiers             → the member holds one of `post.tiers` (`product:'slug'`); a post with no tiers → block
//   anything else     → Ghost reads it as an NQL filter over the member, which no visitor here can satisfy → block
//
// There is NO members-enabled test in it, and `forPost` calls it unconditionally (`post-gating.js`), which is why a
// members-only post still stops at the cut with Subscription access set to Nobody (MEASUREMENTS §54, recorded on T3).
//
// THE THREE VISITORS are View as's (`MEMBER_STATES` minus `everyone`): a logged out user is no member; a free member is
// `status: free`, holding no tier; a PAID member is `status: paid` holding EVERY active paid tier — Ghost 6's own preview
// member (`create-paid-member-shim.js` 6:18-41). ONE function answers the canvas's cut, S4d's indicator and the reading
// time, so the three can never disagree about a visitor. Pure and importless but for types.

import type { MEMBER_STATES } from './vocabulary.ts'

export type Visitor = Exclude<(typeof MEMBER_STATES)[number], 'everyone'>

/** What the rule reads of a post: its visibility, and — for a `tiers` post — the tiers it is open to. */
export type AccessPost = {
  visibility?: unknown
  tiers?: readonly { slug?: unknown; type?: unknown; active?: unknown }[] | null
}

/** A tier the paid member holds: every ACTIVE PAID tier. A tier row missing either field is not assumed to be one. */
const heldByPaid = (t: { type?: unknown; active?: unknown }): boolean => t.type === 'paid' && t.active !== false

/** May `visitor` read `post`? Ghost's own answer (`checkPostAccess`), true or false. */
export function postAccess(post: AccessPost, visitor: Visitor): boolean {
  const visibility = post.visibility
  if (visibility === 'public') return true
  if (visitor === 'anonymous') return false
  if (visibility === 'members') return true
  // a free member's status is `free` and it holds no tier, so neither remaining rule admits it
  if (visitor === 'free') return false
  if (visibility === 'paid') return true
  // `!post.tiers` blocks, and so does an empty list (6's `|| null`, 5's empty filter)
  if (visibility === 'tiers') return Array.isArray(post.tiers) && post.tiers.some(heldByPaid)
  return false
}
