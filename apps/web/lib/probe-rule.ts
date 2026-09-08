/**
 * FR-C2's FOUR PROBES, AS PURE FUNCTIONS — the parsing half of Story 3.3, kept free of `next/*`,
 * of Supabase and of any client so `node --test` reaches every branch. `server/site-probe.ts`
 * next door does the two Admin calls and the one write; this decides what they mean.
 *
 * THE SHAPE `GET /admin/settings/` ANSWERS WITH, EXECUTED — not assumed. The integration key (no
 * Staff Access Token) read it on T1 6.58.0 and T3 5.130.6 on 2026-09-08 (MEASUREMENTS §39):
 * `{ meta, settings: [{ key, value }, …] }`, 117 rows on 6 and 99 on 5, and all six keys this
 * story needs are in both — `portal_button`, `codeinjection_head`, `codeinjection_foot`,
 * `announcement_content`, `announcement_background`, `announcement_visibility`. §15h item 21 had
 * measured the announcement three with a STAFF token, which is a credential Inflozo does not hold
 * until Epic 7, so the spec made confirming them with the integration key part of this story.
 *
 * `settingsOf` FLATTENS THAT ARRAY ONCE and every reader takes the flat record, so a payload of a
 * hundred rows is walked one time rather than once per reader. Anything that is not the executed
 * shape — an object, a string, a missing `settings` — flattens to `{}`, and every reader below
 * answers its own "could not read" from that: absence and nonsense land in the same place,
 * deliberately.
 *
 * STORY 3.4 ADDED A FIFTH READER, `brandOf`, TO THE SAME PAYLOAD — no second Admin call, no new
 * path — so connect, **Re-check plan** and Story 3.7's cron keep being the same function.
 */

export type Capability = 'full' | 'preview_only'
export type CapabilitySource = 'probe' | 'deploy_error' | 'user_declared'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Ghost's settings browse payload, flattened to `key → value`. */
export function settingsOf(body: unknown): Record<string, unknown> {
  const rows = (body as { settings?: unknown })?.settings
  if (!Array.isArray(rows)) return {}
  const out: Record<string, unknown> = {}
  for (const row of rows) {
    const key = (row as { key?: unknown })?.key
    if (typeof key === 'string') out[key] = (row as { value?: unknown }).value
  }
  return out
}

/**
 * ONE BOOLEAN, AND THE PAYLOAD DIES HERE. `codeinjection_head` and `codeinjection_foot` are read,
 * OR'd, and neither string is returned, stored, logged or put anywhere a render path could reach
 * it (NFR-3, FR-C2, the spine's Logging rule). The whole reason this is a function rather than an
 * `if` in the caller is that the payload never has to exist outside it.
 *
 * A value that is not a string is not code injection: Ghost answers `""` for an empty box (both
 * majors, §39), and whitespace alone is not code either.
 */
export function injectionFlag(settings: Record<string, unknown>): boolean {
  const set = (value: unknown) => typeof value === 'string' && value.trim() !== ''
  return set(settings.codeinjection_head) || set(settings.codeinjection_foot)
}

/**
 * PORTAL DEFAULTS TO ON, and the source records whether that was read or assumed. Readable →
 * `'probe'` and no question; unreadable (absent, or anything that is not a boolean) → `true` with
 * `'default'`, and `site-notices.tsx` asks the one question, which writes `'declared'`. Story
 * 3.7's daily check re-reads it, so `'probe'` always wins in the end.
 *
 * Executed 2026-09-08: both test Ghosts answer a real JSON `false`, so the readable branch is the
 * one the live proof takes and the question is a unit contract until a Ghost that hides it exists.
 */
export function portalState(settings: Record<string, unknown>): {
  portal_button: boolean
  portal_button_source: 'probe' | 'default' | 'declared'
} {
  const value = settings.portal_button
  return typeof value === 'boolean'
    ? { portal_button: value, portal_button_source: 'probe' }
    : { portal_button: true, portal_button_source: 'default' }
}

/**
 * THE ANNOUNCEMENT IS READ AND STORED, NOT RENDERED. FR-C4's seed is Story 3.4's; this only puts
 * the three values where 3.4 will find them, VERBATIM — `announcement_visibility` is a JSON
 * *string* (`"[\"visitors\"]"`, §15h item 21 and §39), and parsing it here would be this story
 * deciding a shape 3.4 has to decide anyway. A key Ghost did not send is stored as null so the
 * absence is a fact rather than a hole.
 */
export function announcementOf(settings: Record<string, unknown>): {
  content: string | null
  background: string | null
  visibility: string | null
} {
  const text = (value: unknown) => (typeof value === 'string' ? value : null)
  return {
    content: text(settings.announcement_content),
    background: text(settings.announcement_background),
    visibility: text(settings.announcement_visibility),
  }
}

/**
 * FR-C4's BRAND, READ OFF THE SAME PAYLOAD — Story 3.4's fifth reader.
 *
 * THE SHAPE OF EVERY KEY WAS EXECUTED, not assumed (standing rule 1). The integration key's own
 * `GET /admin/settings/` on T1 6.58.0 and T3 5.130.6, 2026-09-08 (MEASUREMENTS §40):
 *
 *   accent_color   a hex STRING on both majors
 *   logo · icon    a STRING, and EMPTY on both test servers at rest — which is why an empty
 *                  string has to mean "no logo" rather than a src of ""
 *   cover_image    an https URL string on both
 *   navigation     a JSON **STRING**, exactly as `announcement_visibility` is (§39) — never an
 *                  array. The array container is admitted anyway, because one major changing its
 *                  mind is cheaper to absorb here than to discover on a customer's screen
 *   title          a string on both
 *   description    a string on T3 and **null** on T1 — absence is a real answer, not a hole
 *
 * EVERY VALUE IS VALIDATED AT THIS BOUNDARY, because each one crosses into an attribute:
 *
 *   the accent is painted as an inline `style` (`placeholderFor`, and S2c's own swatch), so a
 *   string Ghost sent that is not a colour is a CSS injection into Inflozo's chrome;
 *
 *   the three images become `<img src>`, and `img-src` admits `data:` (`csp.ts:60`) — a `data:`
 *   SVG is script — so only an `https:` URL survives. Ghost's own are absolute https;
 *
 *   nav entries keep their `url` for the epic that turns a menu into a section, but S2c renders
 *   them as TEXT PILLS WITH NO `href`, which is what the frame draws.
 */
export type NavItem = { label: string; url: string }

export type Brand = {
  accent: string | null
  logo: string | null
  icon: string | null
  cover: string | null
  nav: NavItem[]
  title: string | null
  description: string | null
}

/**
 * A colour Inflozo may paint with: `#rgb` or `#rrggbb` and nothing else. Exported because
 * `style-pack.ts` re-validates the accent it reads back out of `projects.style_pack` — that
 * column is one the USER'S OWN SESSION may write (schema :1202, the `grant`), so a value validated
 * on the way in is not thereby validated on the way out, and one rule in one place is the only
 * version of this that cannot drift.
 */
const ACCENT = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const isAccent = (value: unknown): value is string =>
  typeof value === 'string' && ACCENT.test(value)

/**
 * An `https:` URL, or null. Not `isHttpUrl`'s question: this one becomes an `<img src>`.
 *
 * EXPORTED FOR THE SAME REASON `isAccent` IS: `style-pack.ts` re-validates the accent it reads
 * back out of a jsonb column rather than trusting it, and S2c reads the logo back out of one too
 * (review, 2026-09-08). A value that crosses into an attribute is checked where it crosses,
 * every time, not only where it was first stored.
 */
export function imageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value === '') return null
  try {
    return new URL(value).protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

/**
 * The menu, out of either container. `allowlistOf` above is the idiom; the JSON string is the
 * one T1 and T3 actually send. An entry without both strings is not a menu item.
 */
export function navOf(value: unknown): NavItem[] {
  let list: unknown = value
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  return list.flatMap((entry) => {
    const label = (entry as { label?: unknown })?.label
    const url = (entry as { url?: unknown })?.url
    return typeof label === 'string' && label.trim() !== '' && typeof url === 'string'
      ? [{ label, url }]
      : []
  })
}

export function brandOf(settings: Record<string, unknown>): Brand {
  // An empty string is Ghost's own "unset" for every one of these (executed, §40), so it is not
  // a title and not a description either.
  const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value : null)
  return {
    accent: isAccent(settings.accent_color) ? settings.accent_color : null,
    logo: imageUrl(settings.logo),
    icon: imageUrl(settings.icon),
    cover: imageUrl(settings.cover_image),
    nav: navOf(settings.navigation),
    title: text(settings.title),
    description: text(settings.description),
  }
}

/**
 * IS THERE ANYTHING TO OFFER? A card that offers nothing is not drawn (UX-DR3), and the three
 * things S2c actually shows are the accent, the logo and the menu — a TITLE is not a brand,
 * because every Ghost site has one. Three callers ask this question — the connect redirect, the
 * S2c route's own 404 and the Sites card's link — so it is one predicate rather than three.
 *
 * It takes `unknown` because the other two read it back out of a jsonb column.
 */
export function hasBrand(brand: unknown): brand is Brand {
  // IT NARROWS TO `Brand`, SO IT CHECKS WHAT `Brand` PROMISES. Two things it used not to, and
  // both reach an attribute on S2c (review, 2026-09-08): `nav` must be the array the page maps
  // over — an accent on its own satisfied the predicate and then threw on `brand.nav.length` —
  // and `logo` must be an `https:` URL, not merely a string, because the page puts it straight
  // into an `<img src>`. `brandOf` is the column's only author today and always writes both, so
  // this is the boundary holding rather than a bug being fixed; the boundary is the point.
  if (!isRecord(brand) || !Array.isArray(brand.nav)) return false
  return isAccent(brand.accent) || imageUrl(brand.logo) !== null || navOf(brand.nav).length > 0
}

/**
 * S2c's OWN WORDS (`S2 Onboarding.dc.html:150-196`), so the harness and the tests read the app's
 * copy rather than retyping it — `PREVIEW_COPY` above is the pattern.
 *
 * ONE DEPARTURE FROM THE FRAME, and it is a fact Inflozo does not have: the frame captions the
 * swatch with the accent's NAME ("Burnt orange"). Ghost answers a hex and nothing else, so the
 * swatch is captioned with the hex in mono — the card's own idiom for a machine value. Naming a
 * colour would be asserting what was not read.
 *
 * THE SENTENCES THE FRAME DOES NOT DRAW are the offer link on the Sites card and the captions
 * under **Use your brand** — the owner's ruling at Question 1 (2026-09-08) asks the screen to say
 * WHICH project it will brand before the press, not after, and his Question 3 ruling makes a
 * second press ask rather than tell.
 */
export const BRAND_COPY = {
  title: 'Nice site. Want to keep the vibe?',
  sub: (host: string) => `We pulled these from ${host} — your call.`,
  siteToday: 'Your site today',
  accent: 'Accent color',
  navigation: 'Navigation',
  fonts: 'Fonts stay yours — pick a pairing once you’re in the editor.',
  homepage: 'Your homepage, already wearing your brand.',
  use: 'Use your brand',
  skip: 'Skip',
  /** The Sites card's offer — a link, never a Banner: a Banner tells or asks, this offers. */
  offer: 'Use this site’s brand',
  willCreate: 'We’ll make a project for this site and put your brand on it.',
  /** At the cap the brand goes onto a project that already exists, so the caption NAMES it before
      the press — the owner's Question 1 ruling, and it says so whether or not cards are drawn. */
  willBrand: (name: string) => `You’re at your project limit, so we’ll put your brand on “${name}”.`,
  /* THE OWNER'S QUESTION 3 RULING (2026-09-08): a second press SAYS what it already did and ASKS,
     rather than telling — and where there is more than one project it lets the customer pick
     which one, from cards carrying each project's own wireframe.

     THE ASKING IS NOT CONDITIONAL ON THE CARDS. His B1 scoped the CARDS to "more than one
     project"; the sentence he wrote is what a second press says, and a review found the code had
     tied both to the same count, so the one-project customer — the Free customer — was still told
     rather than asked, while his own manual test step 12 expected the question (review,
     2026-09-08). There are now three captions and no fourth: none yet → `willCreate`, at the cap →
     `willBrand` (which NAMES the project, Question 1), otherwise → `alreadyOn`, which asks. */
  alreadyOn: (name: string) => `You already put your brand on “${name}”. Apply it again?`,
  whichProject: 'Which project?',
  /** The card for the project this site's brand is already on, so the chooser says which is which. */
  thisSite: 'This site’s project',
  /* AND THE MARKER FOR A CARD BOUND TO A DIFFERENT SITE. The chooser lists every project, so a
     project already linked to ANOTHER connected site is on it, and picking it paints this site's
     brand onto that one. That is allowed and deliberate — `linked_site_id` is never touched, so
     the binding does not move (FR-B5) — but it was unlabelled, and a card that says nothing while
     the card beside it says "This site's project" reads as unbound. Two review layers met it
     independently (review 3, 2026-09-08). It is the same marker in the same slot, so no second
     vocabulary: R-74 is satisfied by the frame's own idiom, not by a new one. */
  otherSite: 'Another site’s project',
  /** The matrix's "insert fails → the page says so", in the voice `COULD_NOT` already speaks. */
  failed: 'We couldn’t save that just now. Try again in a moment.',
} as const

/**
 * S2c'S OWN URL, IN ONE PLACE. The Sites card's offer link and the two redirects out of
 * `connectSite`/`useBrand` are the same address, and it was written out at both — one rename and
 * the card's link and the actions' redirects drift apart with nothing failing (review,
 * 2026-09-08; standing rule 7). It lives here rather than in `sites/actions.ts` because a
 * `'use server'` module may export only async functions.
 *
 * It is the BROWSER's path — what `proxy.ts` rewrites onto the internal `/app/sites/brand` — and
 * so it is not `revalidatePath`'s argument.
 */
export const brandPath = (siteId: string) => `/sites/brand?site=${siteId}`

/**
 * WHICH PROJECT WEARS THE BRAND — one rule, because S2c prints it in the caption and `useBrand`
 * re-makes it at the press, and two copies of it is how the caption and the write drift apart.
 * `lib/plan.ts`'s own header is the argument: three copies of a paywall predicate disagreed and
 * nothing failed, because nothing executed the comparison.
 *
 * THE PROJECT FOR THIS SITE WINS WHENEVER THERE IS ONE — the owner's **Question 4** ruling
 * (2026-09-08), and it is the same row on both sides of the cap. With room that is what
 * "seeding is idempotent" means when the offer never retires: without it, the second press of a
 * permanently-visible link inserted a SECOND project with the same name for the same site, on
 * every plan with room (review, 2026-09-08). AT THE CAP it is now that row too, where before it
 * was always the most recently updated one — which meant the ticked card and the card marked
 * "This site's project" could be two different cards, against AC 6 and against his Question 3
 * words. He ruled the tick and the label sit together.
 *
 * ONLY WHEN THIS SITE HAS NO PROJECT do the two sides differ, and then Question 1 decides: at the
 * cap the most recently updated project (the dashboard's own order), with room none at all, which
 * is what makes one.
 *
 * It takes the cap as a boolean rather than a plan so this module keeps importing nothing;
 * `atCap` stays the one place the comparison itself lives.
 */
export function brandTarget<T extends { id: string; linked_site_id?: string | null }>(
  capped: boolean,
  projects: T[],
  siteId: string,
): T | undefined {
  return projects.find((row) => row.linked_site_id === siteId) ?? (capped ? projects[0] : undefined)
}

/**
 * THE THEME-NAME PREFIX FR-J10 FREEZES AT FIRST DEPLOY — `inflozo-{project-slug}`. At CONNECT
 * there is no project and no name, so "test the frozen name against the allowlist" has nothing to
 * test; the question the rule asks instead is whether the allowlist could EVER admit an Inflozo
 * theme.
 */
export const THEME_PREFIX = 'inflozo-'

const FULL = { capability: 'full', capability_source: 'probe' } as const
const PREVIEW = { capability: 'preview_only', capability_source: 'probe' } as const

export type CapabilityVerdict =
  | { capability: Capability; capability_source: CapabilitySource }
  | { ask: true }
  | null

/**
 * `customThemes` IS AN ALLOWLIST OF THEME NAMES, NOT A BOOLEAN (read in Ghost's source; EXPERIENCE
 * F5), so "present" does not mean "blocked". The test is whether any entry begins `inflozo-`; a
 * Starter allowlist of Ghost's own themes admits none, which is the answer FR-C2 wants.
 *
 * ⛔ THE GHOST(PRO) PAYLOAD IS UNOBSERVED (§4 T4 — no Ghost(Pro) site exists until the launch-gate
 * Starter trial). So this branch is proved against a SYNTHESISED payload in a test that says so in
 * its own name, and the day a real one arrives THIS is the line it confirms or refutes. Two
 * container shapes are admitted because only one of them has ever been seen in a document: the
 * bare array the spec's matrix names, and the `{ allowlist: [...] }` Ghost's limit service uses.
 *
 * THE THREE ANSWERS:
 *   a pair   — write `capability` and `capability_source`
 *   { ask }  — `hostSettings` is there and its shape cannot be read: the ONE path that asks the
 *              user a question, and it stores `site_settings.plan_ask` rather than guessing
 *   null     — write nothing. A Ghost(Pro) site seen while the flag is off: the probe is not
 *              allowed to judge it, so `capability` is left exactly as it was (the matrix's "Flag
 *              off (production seed) → capability untouched").
 *
 * `hostSettings` ABSENT IS SELF-HOSTED AND UNLIMITED — executed on both majors (§15h item 2, and
 * re-confirmed §39) — and that answer does not depend on the flag: it is a fact about the payload,
 * not a judgement about a plan, which is why T1 and T3 come out `full`/`probe` in production with
 * the flag off.
 */
export function capabilityOf(hostSettings: unknown, flagOn: boolean): CapabilityVerdict {
  if (hostSettings === undefined || hostSettings === null) return FULL
  if (!flagOn) return null
  const limits = (hostSettings as { limits?: unknown })?.limits
  if (!isRecord(limits)) return { ask: true }
  // No `customThemes` limit at all is no restriction — a Publisher plan, not a broken read.
  if (!('customThemes' in limits)) return FULL
  const allowed = allowlistOf(limits.customThemes)
  if (!allowed) return { ask: true }
  return allowed.some((name) => name.startsWith(THEME_PREFIX)) ? FULL : PREVIEW
}

/** The names in a `customThemes` limit, or null when its shape is not one we can read. */
function allowlistOf(limit: unknown): string[] | null {
  const list = Array.isArray(limit) ? limit : isRecord(limit) ? limit.allowlist : undefined
  if (!Array.isArray(list)) return null
  return list.every((name) => typeof name === 'string') ? (list as string[]) : null
}

/**
 * B15's OWN WORDS (`B Missing Surfaces.dc.html:1188-1225`), so the harness and the tests read the
 * app's copy rather than retyping it — `connect-rule.ts`'s `SITES_EMPTY` is the pattern.
 *
 * TWO DEPARTURES FROM THE FRAME, both forced by UX-DR3 ("a control that could never act is
 * ABSENT, not greyed"): the frame's **Export theme zip** and its greyed **Ship it** are gone,
 * because no export path and no deploy path exists in any epic yet (E11 and E7), and the frame's
 * body sentence promised the export in its second half — a promise with no control behind it — so
 * that half goes with the button. The rest is the frame: the sky panel, the cause attributed to
 * GHOST rather than to us, the two named routes out, and Re-check plan.
 *
 * "PUBLISHER OR HIGHER", never "Creator" (EXPERIENCE.md:628 — the A9 correction of 2026-09-04).
 * The tier the site is ON is not named: `customThemes` says what the plan forbids, not what it is
 * called, and this story reads nothing that would make "Starter" a fact.
 */
export const PREVIEW_COPY = {
  chip: 'Preview-only',
  title: 'This site’s Ghost(Pro) plan does not allow custom themes',
  body: 'Ghost restricts theme uploads on this plan, so we cannot deploy to this site. You can design and preview everything here.',
  clearsTitle: 'What clears this',
  clears: [
    'Upgrade the site to Ghost(Pro) Publisher or higher, then re-check here',
    'Or move the site to self-hosted Ghost, where theme upload is always available',
  ],
  recheck: 'Re-check plan',
  /** The banner the card shows when a re-check could not reach Ghost. */
  recheckFailed: 'We couldn’t re-check that plan just now. Try again in a moment.',
} as const

/**
 * THE ONE-TIME NOTICE. It merely TELLS, so it keeps the Banner's sentence and one button rather
 * than the owner's two-button exception. The words are his, from the story's own manual test.
 */
export const INJECTION_COPY = {
  body: 'This site has code injection set in Ghost. Your live pages can legitimately look different from the canvas — Inflozo doesn’t control that code.',
  dismiss: 'Got it',
} as const

/**
 * THE TWO QUESTIONS, and there are only two paths in the whole story that reach one (FR-C8:
 * probes, never questions). Each is a Banner with the Kit's two 32px buttons — the owner's ruled
 * exception for a banner that ASKS (`banner.tsx:9-13`) — and the recommended answer is the
 * primary, which is also the value a form submitted with no scripts sends.
 */
export const PORTAL_COPY = {
  body: 'We couldn’t tell whether Ghost’s subscribe button shows on this site. It’s the floating button in the corner that opens the sign-up window.',
  yes: 'Yes, it shows',
  no: 'No, it’s off',
} as const

export const PLAN_COPY = {
  body: 'We couldn’t read what this site’s Ghost(Pro) plan allows. Does it let you upload a custom theme?',
  full: 'Yes — custom themes allowed',
  preview: 'No — themes are restricted',
} as const

/**
 * IS THIS THE SHAPE GHOST ACTUALLY ANSWERS WITH? `settings/` is a browse and answers
 * `{ meta, settings: [{key, value}] }` on both majors (§39). A 200 carrying anything else is a
 * read that did not happen: `settingsOf` would flatten it to `{}` and every reader below would
 * then answer its "could not read" — `code_injection` false, Portal back to `default`, the
 * announcement nulled — about a payload nobody parsed. That is a WIPE wearing a probe's clothes,
 * so the caller checks this first and writes nothing (review, 2026-09-08).
 */
export function settingsReadable(body: unknown): boolean {
  return Array.isArray((body as { settings?: unknown })?.settings)
}

/**
 * THE WHOLE WRITE A PROBE MAKES, AS A PURE FUNCTION — verdict and payload in, the row's patch out.
 * It lives here rather than in `server/site-probe.ts` because the mapping is where the story's
 * rules actually are, and behind `call()` and `supabaseAdmin()` nothing could reach it: the
 * `{ ask: true }` and `null` verdicts are unreachable on T1 and T3 (neither sends `hostSettings`)
 * and unreachable in the harness (the question is SEEDED, never probed), so before this the two
 * branches the `ghostpro_preview_probe` flag exists to gate ran in no test and on no server —
 * and the flag would have been flipped at the §4 T4 gate with them never once executed (review,
 * 2026-09-08, Verification Gap).
 *
 * TWO PRESERVATION RULES, and both are the same rule: A PROBE MAY OVERWRITE AN ANSWER WITH A
 * READING, NEVER WITH AN ASSUMPTION.
 *
 *   PORTAL — `portalState` cannot see that the user already answered, so on a Ghost that keeps
 *   hiding `portal_button` every re-check and every one of Story 3.7's cron runs would put
 *   `true`/`default` back over the user's "No, it's off" and ask again, for ever. A real read
 *   (`'probe'`) still wins, which is what "3.7 re-reads it, so `'probe'` always wins later" means.
 *
 *   THE PLAN QUESTION — `answerPlan` clears `plan_ask` so the question does not come back, and
 *   an unreadable `hostSettings` is unreadable every time, so the next probe would re-raise the
 *   question the user has already answered. A site whose `capability_source` is `'user_declared'`
 *   is not asked twice; a real verdict pair still overwrites it, because that is B15's
 *   "Re-check plan" clearing a site that has since been upgraded.
 */
export function probePatch(args: {
  previous: Record<string, unknown>
  previousSource: string | null
  settings: Record<string, unknown>
  verdict: CapabilityVerdict
}): {
  site_settings: Record<string, unknown>
  capability?: Capability
  capability_source?: CapabilitySource
} {
  const { previous, previousSource, settings, verdict } = args

  const portal = portalState(settings)
  // An assumption does not overwrite an answer; a reading does.
  const declared = portal.portal_button_source === 'default' && previous.portal_button_source === 'declared'
  const site_settings: Record<string, unknown> = {
    ...previous,
    code_injection: injectionFlag(settings),
    ...(declared
      ? { portal_button: previous.portal_button, portal_button_source: 'declared' }
      : portal),
    announcement: announcementOf(settings),
    // FR-C4, Story 3.4: the fifth reader, on the payload that was already read.
    brand: brandOf(settings),
  }

  const asked = verdict !== null && 'ask' in verdict
  if (asked && previousSource !== 'user_declared') site_settings.plan_ask = true
  else delete site_settings.plan_ask

  const pair = verdict && 'capability' in verdict ? verdict : null
  return { site_settings, ...(pair ?? {}) }
}
