/* ─────────────────────────────────────────── Story 5.20 — THE PAYWALL CANVAS'S WORDS AND ITS PURE RULES.
 *
 * R-170: ONE NAME PER THING, WRITTEN ONCE. Every sentence the Paywall canvas, its members-off card, the Sites notice and
 * a placed member ask say is here — the spec's Design Notes table, word for word, and `paywall.test.ts` holds each to
 * it. The switcher's row and caption are `CANVASES.paywall`'s (`lib/editor.ts`), which is where every canvas's name is
 * written; the group heading is here because no other file names it.
 *
 * PURE, as `lib/view-as.ts` is and for its reason: `node --test` reaches it, and the deployed walk reads its expectations
 * from here rather than restating them (standing rule 4). Its one import beyond types is the library's own reader of
 * member asks — the validator's `memberAsks` — so the panel's line and R-4's refusal read the same attributes.
 *
 * ONE CORRECTION, AND THE RECORDING MADE IT (MEASUREMENTS §54, T3 5.130.6 with Subscription access set to Nobody): the
 * members-off sentence the owner ruled (R-198) ended "…but nobody can sign up there: Ghost stops loading its sign-up
 * window." Ghost stops loading Portal only when members, donations AND recommendations are all off (`ghost_head.js`);
 * on a site with Stripe connected donations stay on by default, and the recorded page still loaded Portal, whose sign-up
 * screen then answers "Memberships unavailable, contact the owner for access." (`SignupPage.js:714-716`, Portal 2.51.5).
 * Either way nobody can sign up, which is the ruling's substance, so the sentence keeps that and drops the clause the
 * recording moved — the spec's docs task, "correct either if the recording moves it".
 */

import { memberAsks, type MemberAskAt } from '@inflozo/library'
import type { Members } from './probe-rule.ts'

/** A number of tiers as the card prints it: "1 tier", "5 tiers". */
const tiersWord = (n: number) => `${n} ${n === 1 ? 'tier' : 'tiers'}`

export const PAYWALL_WORDS = {
  /** the Template switcher's group, D5b's Membership group's shape (EXPERIENCE.md:207-222) */
  group: 'Template surfaces',
  /** the ink top bar's chip — written in sentence case and uppercased by CSS, as C3a draws it */
  chip: 'Not a page section',
  back: 'Back to post',
  /** C3a's strip: the static "Showing" pill (R-118 — never a menu), the design chip and the note */
  showingLead: 'Showing:',
  showing: (whole: boolean): string => (whole ? 'the whole post' : 'the cut only'),
  context: (whole: boolean): string => (whole ? 'The article is context, not editable here' : 'The article above is context, not editable here'),
  design: (n: number, m: number, name: string): string => `Design ${n} of ${m} · ${name}`,
  /** the cut marker's two labels — the first uppercased by CSS */
  cut: 'Ghost cuts here · public preview marker',
  below: 'below this line never reaches the browser',
  /** S4d's indicator, where the gated part begins for a visitor who may read it (R-199) */
  gated: 'Gated content — shown with sample text',
  /** C3a's "How readers reach it" card in the Layers panel */
  howHeading: 'How readers reach it',
  how: "Ghost cuts the post at the author's Public preview marker and renders this block in its place. You cannot move it.",
  tiers: (paid: number, free: number): string => `${tiersWord(paid)} · ${free} free`,
  tiersLink: 'Tiers in Ghost admin →',
  /** the panel head */
  panel: 'Paywall',
  untouched: "This is Ghost's own paywall — what your readers see today.",
  /** C3b, in R-198's words as the recording corrected them (the header above) */
  offChip: 'MEMBERS OFF',
  offTitle: 'Members are switched off',
  offBody: (site: string): string =>
    `Members are switched off for ${site} — subscription access is set to Nobody — so your posts for members still stop at the cut, but nobody can sign up there.`,
  offStep1: 'In Ghost admin, open Settings → Membership and set Subscription access to anyone or invite-only',
  offStep2: 'Come back here — we re-check whenever you open this screen',
  openAdmin: 'Open Ghost admin',
  recheck: 'Re-check',
  rechecking: 'Re-checking…',
  offFoot: 'You can still work on your paywall with sample content — switch the canvas to Sample content below.',
  /** what Re-check says, in `#editor-said` and under the buttons */
  on: (site: string): string => `Members are on for ${site}.`,
  stillOff: (site: string): string => `Members are still switched off for ${site}.`,
  refused: (site: string): string => `Could not check ${site} just now.`,
  /** the Sites notice's link — the table's "↗" is drawn as the Kit's `ExternalLink` glyph, which says "opens in a new
   *  tab" to a screen reader, as every new-tab link in the app does; the words are C3b's button's own (R-170) */
  adminLink: 'Open Ghost admin',
  /** a placed section whose design carries a member ask, on a site with members switched off */
  ask: (site: string): string => `Members are switched off on ${site}, so this section's sign-up form shows nothing there.`,
} as const

/** The Sites notice's sentences, one per fact the record holds (the I/O matrix's "matching sentences"). A site with no
 *  record yet says nothing. Members off already says the paywall cannot sign anyone up, so it stands alone; otherwise
 *  the access sentence and Stripe's each say their own fact. */
export function membersNotice(members: Members | null, site: string): string[] {
  if (members === null) return []
  if (members.signup_access === 'none') {
    return [`Members are switched off on ${site} — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone up.`]
  }
  const out: string[] = []
  if (members.signup_access === 'invite') out.push(`Only people you invite can join ${site}, so free sign-up forms show nothing there.`)
  if (members.signup_access === 'paid') out.push(`New members must pay to join ${site}, so free sign-up forms show nothing there.`)
  if (!members.paid_enabled) out.push(`Paid memberships are off on ${site} — Stripe is not connected — so paid sign-up buttons show nothing there.`)
  return out
}

/** Is the site's Subscription access set to Nobody? The one condition C3b's card and a placed ask's line read. */
export const membersOff = (members: Members | null | undefined): boolean => members?.signup_access === 'none'

/** Ghost admin at one of its settings anchors, read in the shipped admin bundles of both majors (the spec's Code Map):
 *  Settings → Membership is `#/settings/members`, Tiers is `#/settings/tiers`. */
export const adminAt = (url: string, anchor: 'members' | 'tiers'): string => `${url.replace(/\/+$/, '')}/ghost/#/settings/${anchor}`

type Tier = { type?: unknown; visibility?: unknown; active?: unknown }

/** "{n} tiers · {m} free" over the source in force's PUBLIC tiers: the paid ones counted, then the free one. A hidden
 *  tier is never counted — the Content API returns it (§54), and Portal never offers it. */
export function tierLine(tiers: readonly Tier[]): string {
  const shown = tiers.filter((t) => t.visibility === 'public' && t.active !== false)
  return PAYWALL_WORDS.tiers(shown.filter((t) => t.type === 'paid').length, shown.filter((t) => t.type === 'free').length)
}

/** The card's line for the source in force (the I/O matrix's two rows): the site's public tiers once they are read —
 *  and nothing where that read failed — nothing where the site was chosen and could not be read at all (the pill says
 *  why), and otherwise the sample's. `site` is the site's page as painted, with its tiers read's rows, or null. */
export function tierText(site: { rows: readonly Tier[] | undefined } | null, failed: boolean, sample: readonly Tier[]): string | null {
  if (site !== null) return site.rows === undefined ? null : tierLine(site.rows)
  return failed ? null : tierLine(sample)
}

/** The asks a design makes — read from the same attributes R-4's refusal reads (`memberAsks`, the validator's own). */
export const askOf = (entry: { html: string }): MemberAskAt[] => memberAsks(entry.html)

/** FR-H6: a SYNTHESIZED instance (`auto-<file>-<n>`, `synthesize.ts`) is never warned about — the customer did not
 *  place it, so a line about "this section" would be about a choice nobody made. */
export const warnsOn = (instance: { instanceId: string }): boolean => !instance.instanceId.startsWith('auto-')

/** The member-ask line at a placed section's panel head, or null: a section the customer placed, whose design asks a
 *  visitor to join, on a site whose record says members are switched off. */
export function askLine(members: Members | null | undefined, site: string, entry: { html: string }, instance: { instanceId: string }): string | null {
  return membersOff(members) && warnsOn(instance) && askOf(entry).length > 0 ? PAYWALL_WORDS.ask(site) : null
}
