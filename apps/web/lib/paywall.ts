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

import { memberAsks, portalAsk, type MemberAsk, type PropDef } from '@inflozo/library'
import { getPath, isRich, linkAttributes, markupProps } from '@inflozo/section-runtime'
import type { Members } from './probe-rule.ts'

/** A number of tiers as the card prints it: "1 tier", "5 tiers". */
const tiersWord = (n: number) => `${n} ${n === 1 ? 'tier' : 'tiers'}`

export const PAYWALL_WORDS = {
  // the Template switcher's group heading is `lib/editor.ts`'s `SURFACES_HEADING` since Story 7.13 brought its second row
  /** the ink top bar's chip — written in sentence case and uppercased by CSS, as C3a draws it; Editor cards wears the same
   *  chip (Story 7.13, R-170: one chip for one idea) */
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

/** Is the site's Subscription access set to Nobody? The one condition C3b's card and a placed ask's line read. */
export const membersOff = (members: Members | null | undefined): boolean => members?.signup_access === 'none'

/**
 * R-216 (DW-274) — ONE LIST OF WHAT THE SITE'S MEMBER SWITCHES STOP (R-170): each fact the record can hold, the asks it
 * stops, and the Sites screen's sentence for it. The Sites notice says every fact that holds; a placed section's panel
 * line says the facts that stop an ask the section makes, in the same sentence — so the two can never word one fact two
 * ways. In the Sites screen's order. Members off STANDS ALONE (the others hold only while members are on, since it already
 * says nothing can sign up) and stops every ask; on the panel it keeps 5.20's line about "this section" (`panel`). Invite-
 * only stops a paid ask in Portal too, and no Sites sentence says so yet — DW-305, Story 9.1.
 */
const FACTS: readonly { holds: (m: Members) => boolean; stops: readonly MemberAsk[]; sites: (site: string) => string; panel?: (site: string) => string }[] = [
  {
    holds: (m) => m.signup_access === 'none',
    stops: ['free', 'paid'],
    sites: (site) => `Members are switched off on ${site} — subscription access is set to Nobody — so its sign-up forms show nothing and its paywall cannot sign anyone up.`,
    panel: PAYWALL_WORDS.ask,
  },
  { holds: (m) => m.signup_access === 'invite', stops: ['free'], sites: (site) => `Only people you invite can join ${site}, so free sign-up forms show nothing there.` },
  { holds: (m) => m.signup_access === 'paid', stops: ['free'], sites: (site) => `New members must pay to join ${site}, so free sign-up forms show nothing there.` },
  {
    holds: (m) => !membersOff(m) && !m.paid_enabled,
    stops: ['paid'],
    sites: (site) => `Paid memberships are off on ${site} — Stripe is not connected — so paid sign-up buttons show nothing there.`,
  },
]
const factsOf = (members: Members | null | undefined) => (members ? FACTS.filter((f) => f.holds(members)) : [])

/** The Sites notice's sentences, one per fact the record holds (the I/O matrix's "matching sentences"). A site with no
 *  record yet says nothing. */
export const membersNotice = (members: Members | null, site: string): string[] => factsOf(members).map((f) => f.sites(site))

/** Ghost admin at one of its settings anchors, read in the shipped admin bundles of both majors (the spec's Code Map):
 *  Settings → Membership is `#/settings/members`, Tiers is `#/settings/tiers`. Story 7.9 — and `settings`, Settings
 *  itself (`#/settings`), where Site basics sends the site's logo: Ghost 6.58.0's admin router declares `{path:'settings'}`
 *  (`core/built/admin/assets/index-BOJzlYiz.js:67`) and 5.130.6's `this.route("settings-x",{path:"/settings"})`
 *  (`core/built/admin/assets/ghost-060c0f30….js`), both read in source. ONE builder for every address.
 *  Story 7.12 — and four more of Settings' sections, each a `navid` routed as `#/settings/<navid>`: `navigation`,
 *  `social-accounts` and `code-injection` (D6a's rail, Question 2, ruled option 1) and `publication-language`
 *  (Translations' mismatch notice). Read in source, both majors: Ghost 6.58.0's
 *  `core/built/admin/assets/settings-KSWWQanQ.js` declares navid:`navigation`, `social-accounts`, `code-injection` and
 *  `publication-language` (lines 2-4 of that minified file); 5.130.6's
 *  `core/built/admin/assets/admin-x-settings/index-BVxh86CD.mjs` declares navid "navigation" (:29989), "social-accounts"
 *  (:27394), "code-injection" (:20434) and "publication-language" (:22540). */
/*  Story 7.18b — and `design`, Ghost's Design panel (Pre-flight's changed built-in row, "Open Ghost's Design panel ↗"): the
 *  settings route `design/edit` opens the Design and branding modal, where a theme's own settings live. Read in source, both
 *  majors: Ghost 6.58.0's `core/built/admin/assets/index-BOJzlYiz.js` routes `{path:`design/edit`}` to
 *  `design-and-theme-modal-DWZguwWX.js`, and `settings-KSWWQanQ.js`' Customize button (navid `design`) calls
 *  `updateRoute(`design/edit`)`; 5.130.6's `core/built/admin/assets/admin-x-settings/index-BVxh86CD.mjs` maps
 *  `"design/edit": "DesignAndThemeModal"` (:30208) and its Customize button calls `t("design/edit")` (:29965). */
export type AdminAnchor = 'members' | 'tiers' | 'settings' | 'navigation' | 'social-accounts' | 'code-injection' | 'publication-language' | 'design'
export const adminAt = (url: string, anchor: AdminAnchor): string =>
  `${url.replace(/\/+$/, '')}/ghost/#/settings${anchor === 'settings' ? '' : anchor === 'design' ? '/design/edit' : `/${anchor}`}`

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

/** The asks a design's MARKUP makes — read from the same attributes R-4's refusal reads (`memberAsks`, the validator's own). */
export const askOf = (entry: { html: string }): { ask: MemberAsk; how: string }[] => memberAsks(entry.html)

/** A link value's Portal ask, read the way the one link sink reads it (`linkAttributes`, then `linkGate`'s `portalAsk`), or null. */
const linkAsk = (link: unknown): MemberAsk | null => {
  const action = linkAttributes(link)['data-portal']
  return action === undefined ? null : portalAsk(action)
}

/** STORY 7.18b — EVERY ASK A PLACED SECTION MAKES (R-170: the panel's line and Pre-flight's members row read this one rule):
 *  its markup's (`askOf`); every `url` prop the design prints whose value — the instance's, else the design's default — is a
 *  Portal ask, as `linkGate` gates it (A4's "Sign up" and A1's Subscribe start as `{ portal: 'signup' }`); and every inline
 *  `a` mark a rich text prop carries to one. `markupProps` decides what the design prints, so a prop it never draws asks
 *  nobody. ponytail: top-level props only, as `untouchedWords` reads them — a list's item links (`items[].url`) are not read;
 *  add them when a library design lists links a customer may point at Portal. */
export function asksIn(
  entry: { html: string; contentSchema?: Readonly<Record<string, PropDef>> },
  instance: { content?: Readonly<Record<string, unknown>> },
): { ask: MemberAsk; how: string }[] {
  const out = askOf(entry)
  const schema = entry.contentSchema ?? {}
  for (const path of markupProps(entry.html)) {
    const def = schema[path]
    if (def === undefined || path.includes('[]')) continue
    const stored = getPath(instance.content ?? {}, path)
    const value = stored === undefined ? def.default : stored
    if (def.type === 'url') {
      const ask = linkAsk(value)
      if (ask !== null) out.push({ ask, how: `${path}: Portal` })
    } else if (def.type === 'richtext' && isRich(value)) {
      for (const m of value.marks ?? []) {
        const ask = m.mark === 'a' ? linkAsk(m) : null
        if (ask !== null) out.push({ ask, how: `${path}: a link to Portal` })
      }
    }
  }
  return out
}

/** FR-H6: a SYNTHESIZED instance (`auto-<file>-<n>`, `synthesize.ts`) is never warned about — the customer did not
 *  place it, so a line about "this section" would be about a choice nobody made. */
export const warnsOn = (instance: { instanceId: string }): boolean => !instance.instanceId.startsWith('auto-')

/** The member-ask line at a placed section's panel head, or null: a section the customer placed, whose design asks a
 *  visitor to join, on a site whose record stops that ask (R-216) — each fact that stops one of its asks, in `FACTS`'
 *  words, one sentence after another when two do. */
export function askLine(
  members: Members | null | undefined,
  site: string,
  entry: Parameters<typeof asksIn>[0],
  instance: { instanceId: string } & Parameters<typeof asksIn>[1],
): string | null {
  if (!warnsOn(instance)) return null
  const said = stoppingFacts(members, entry, instance).map((f) => (f.panel ?? f.sites)(site))
  return said.length === 0 ? null : said.join(' ')
}

/** The facts the record holds that stop one of this section's asks (`asksIn`) — none for a section asking nobody to join. */
const stoppingFacts = (members: Members | null | undefined, entry: Parameters<typeof asksIn>[0], instance: Parameters<typeof asksIn>[1]) => {
  const asks = new Set(asksIn(entry, instance).map((a) => a.ask))
  return factsOf(members).filter((f) => f.stops.some((ask) => asks.has(ask)))
}

/** STORY 7.18b — does the site's record stop one of this placed section's asks? Pre-flight's members row lists exactly the
 *  sections the panel's line would warn on (a synthesized one never, FR-H6). */
export const askStopped = (members: Members | null | undefined, entry: Parameters<typeof asksIn>[0], instance: { instanceId: string } & Parameters<typeof asksIn>[1]): boolean =>
  warnsOn(instance) && stoppingFacts(members, entry, instance).length > 0
