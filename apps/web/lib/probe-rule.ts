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
 * `settingsOf` FLATTENS THAT ARRAY ONCE and the three readers take the flat record, so a payload
 * of a hundred rows is walked one time rather than three. Anything that is not the executed shape
 * — an object, a string, a missing `settings` — flattens to `{}`, and every reader below answers
 * its own "could not read" from that: absence and nonsense land in the same place, deliberately.
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
  }

  const asked = verdict !== null && 'ask' in verdict
  if (asked && previousSource !== 'user_declared') site_settings.plan_ask = true
  else delete site_settings.plan_ask

  const pair = verdict && 'capability' in verdict ? verdict : null
  return { site_settings, ...(pair ?? {}) }
}
