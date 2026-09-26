// Story 5.20 — Ghost's `checkPostAccess`, ported once (`access.ts`), held to its truth table over View as's visitors.
//
// READ IN SOURCE on both majors (`core/server/services/members/content-gating.js` 5.130.6 :34-62, 6.58.0 :65-85): the
// two answer the same for every row below — 6 moved the filter into `getPostAccessFilter` and changed nothing it says.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { postAccess, type Visitor } from './access.ts'
import { MEMBER_STATES } from './vocabulary.ts'

const VISITORS: Visitor[] = ['anonymous', 'free', 'paid']

test('the visitors are View as\'s three, derived from MEMBER_STATES', () => {
  assert.deepEqual([...MEMBER_STATES].filter((s) => s !== 'everyone'), VISITORS)
})

test("Ghost's truth table: public · members · paid, for a logged out user, a free member and a paid member", () => {
  const table: Record<string, Record<Visitor, boolean>> = {
    public: { anonymous: true, free: true, paid: true },
    members: { anonymous: false, free: true, paid: true },
    paid: { anonymous: false, free: false, paid: true },
  }
  for (const [visibility, row] of Object.entries(table)) {
    for (const v of VISITORS) assert.equal(postAccess({ visibility }, v), row[v], `${visibility} for ${v}`)
  }
})

test('tiers: the paid member holds every ACTIVE PAID tier — a post open to one of them is read, and no tiers is a block', () => {
  const paid = { slug: 'supporter', type: 'paid', active: true }
  assert.equal(postAccess({ visibility: 'tiers', tiers: [paid] }, 'paid'), true)
  assert.equal(postAccess({ visibility: 'tiers', tiers: [paid] }, 'free'), false, 'a free member holds no tier')
  assert.equal(postAccess({ visibility: 'tiers', tiers: [paid] }, 'anonymous'), false)
  // `!post.tiers` blocks (5 and 6), and so does an empty list (6's `|| null`, 5's empty filter)
  assert.equal(postAccess({ visibility: 'tiers' }, 'paid'), false)
  assert.equal(postAccess({ visibility: 'tiers', tiers: null }, 'paid'), false)
  assert.equal(postAccess({ visibility: 'tiers', tiers: [] }, 'paid'), false)
  // an archived tier or the free tier is not one the paid member holds
  assert.equal(postAccess({ visibility: 'tiers', tiers: [{ ...paid, active: false }] }, 'paid'), false)
  assert.equal(postAccess({ visibility: 'tiers', tiers: [{ slug: 'free', type: 'free', active: true }] }, 'paid'), false)
})

test('a visibility Ghost would read as an NQL filter over the member, or none at all, admits nobody here', () => {
  for (const visibility of ['status:free', 'label:vip', undefined, null, '']) {
    assert.equal(postAccess({ visibility }, 'anonymous'), false, String(visibility))
    // no visitor View as previews can satisfy a filter this port does not evaluate
    assert.equal(postAccess({ visibility }, 'free'), false, String(visibility))
  }
})
