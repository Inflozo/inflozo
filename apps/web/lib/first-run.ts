/* ───────── S2 Onboarding.dc.html — S2a FIRST RUN: every word of it, and the one rule that
   decides when it is what "Projects" looks like.

   THE WORDS ARE HERE FOR THE REASON `connect-rule.ts`'s `SITES_EMPTY` IS. Two surfaces draw the
   starter door — this screen and the New Project Sheet — and they cannot be allowed to disagree
   about what a starter is, so the sentence has one home and both import it.

   NOTHING IS REMEMBERED. The owner ruled Question 1 (option 1, 2026-09-11): "She sees the three
   cards again." First Run is not a one-time event with a mark against the account; it is simply
   what Projects looks like while you have no site and no project, and it stops being that the
   moment you have one. So the rule below is derived from the two counts on every render and from
   nothing stored — no column, no migration, no `auth.users` metadata key. A remembered "seen it"
   mark is the option he did not take, and it is not to be reintroduced as a convenience.

   ONE COUNT IS TYPED IN HERE, and it is named so it cannot hide (standing rule 4): the starter
   door's sentence says "Ten" because the shipped New Project Sheet already did, and S2a's own
   "Three ready-made sites" is the frame quoting a roster that has since grown (Appendix E). It
   leaves with the reason sentence — Epic 11's chooser draws the roster and derives its count
   (DW-88). One sentence, one module, and the heading and footer carry no digit at all. */

/** S2a's card: a title, one line of consequence, and — where it cannot act yet — its reason. */
export type Door = {
  title: string
  consequence: string
  /** UX-DR3: a door that cannot act YET is greyed WITH this sentence, never behind a tooltip. */
  reason?: string
}

/** The Recommended door. Its destination is Story 3.2's full-page handshake, which redirects on
    success to Story 3.4's brand offer — so this story adds a screen and no new capability. */
export const CONNECT_DOOR: Door = {
  title: 'Connect your Ghost site',
  // "colours", not the frame's "colors": the product's shipped voice is British
  // (`connect-rule.ts`'s KEYS, `probe-rule.ts`'s BRAND_COPY).
  consequence: "We'll bring in your colours, logo and posts.",
}

/**
 * THE SHARED DOOR. `new-project-sheet.tsx` draws this same one and imports these same two
 * sentences; `first-run.test.ts` asserts that neither surface holds a copy of its own.
 *
 * `satisfies` rather than an annotation, so `reason` stays a `string` for `greyedProps` — a
 * greyed control cannot be built without one, and the compiler is what says so (greyed.ts).
 *
 * The reason sentence LEAVES with Epic 11's starter chooser (DW-88): the day the door can act,
 * it stops being greyed and this field goes with the grey.
 */
export const STARTER_DOOR = {
  title: 'Start from a starter',
  consequence: 'Ten full sites, ready to wear your brand.',
  reason: "Starters aren't here yet.",
} satisfies Door

/** The one door that needs nothing built: it opens the sheet the dashboard already opens. */
export const BLANK_DOOR: Door = {
  title: 'Blank canvas',
  consequence: 'An empty page and every design. Go wild.',
}

/** The frame's order, left to right, and the Recommended badge is on the first. */
export const FIRST_RUN_DOORS: readonly Door[] = [CONNECT_DOOR, STARTER_DOOR, BLANK_DOOR]

export const FIRST_RUN = {
  /** S2a's 44px Bricolage heading. */
  heading: "Let's make your Ghost site gorgeous.",
  /** The quiet 14px line under the card row — the whole of the pressure this screen applies. */
  footer: 'You can do all of this later.',
  /** The badge at top 16 / right 16 of the first card. */
  recommended: 'Recommended',
} as const

/**
 * What the dashboard already knows by the time it could redirect.
 *
 * `sites` is `null` for BOTH "not read" and "the read failed", because they are the same answer:
 * the dashboard renders. A FAILED READ IS NOT AN EMPTY ACCOUNT — `(dashboard)/page.tsx`'s own
 * scar, where `data ?? []` once showed a user with projects the first-run illustration over their
 * own work — and an unread sites table is exactly that bug one table across.
 */
export type FirstRunState = {
  /** The projects read failed. */
  unread: boolean
  projects: number
  /** Connected sites, `disconnected_at is null` — or `null` for unread, which never redirects. */
  sites: number | null
  /** The URL carries a query string of ANY kind. */
  hasQuery: boolean
}

/**
 * The half of the rule that costs no round trip, and therefore whether the count is worth one.
 * It exists so the page has ONE decider: without it the caller would have to restate these three
 * conditions to know whether to read, and a caller that restated them a little too strictly would
 * pass `sites: null` and lose First Run with every test still green.
 */
export const needsSiteCount = (state: Omit<FirstRunState, 'sites'>): boolean =>
  !state.unread && !state.hasQuery && state.projects === 0

/**
 * The rule. One boolean, derived, stored nowhere.
 *
 * ANY query string renders the dashboard — `restoreAccount` lands on `/?restored=1` and a failed
 * sign-out on `/?signed-out-failed=1`, and both sentences are on the dashboard. One rule needs no
 * list of hints to keep in step with. (A bare `/?` is NOT a query string: WHATWG URL drops it and
 * the proxy hands `''` — executed at review, 2026-09-11 — so there is no typed escape hatch to the
 * empty Projects page, and the owner's ruling wants none: the doors ARE that page.)
 */
export const showsFirstRun = (state: FirstRunState): boolean =>
  needsSiteCount(state) && state.sites === 0
