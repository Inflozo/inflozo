/* STORY 7.18b — CHOOSING THE SITE (FR-B5, FR-Q6; R-267). ONE RULE for the picker, its confirm and the server's `switchSite`,
 * so the three can never disagree about what a switch does (R-170):
 *
 *   - the site must be one of the user's CONNECTED sites (`sites`, the list Ship it reads with the user's own session);
 *   - choosing the linked site again writes nothing;
 *   - a site another of the user's projects links is MOVED here after a confirm (Question 1, ruled option 1): that project is
 *     unlinked, keeps its designs and its deploy history, and has no site until one is chosen for it (DW-69: one project
 *     per site);
 *   - a FIRST LINK — from no site, while the language is still `en` (routine call 2) — takes the site's Ghost language
 *     (`languageAtLink`, FR-Q6's "default at first link"); a language the customer chose is never overwritten, and nor is
 *     one whose words they typed (the Review, 2026-10-19): a project holding translation overrides keeps its language, as
 *     Translations never changes it without its own confirm (R-134), and gets FR-Q6's confirm instead;
 *   - otherwise the language stays (FR-Q6: "always user-editable" — Translations changes it), and a site whose stored locale
 *     differs from it EXACTLY, case included, as Ghost reads `locales/<locale>.json` (`i18n.js:187-199`), is confirmed
 *     first; a site with no stored locale never warns (7.12's rule).
 *
 * Pure: no import beyond the library's language rule and the app's words. */

import { DEFAULT_LANGUAGE, languageAtLink } from '@inflozo/library/languages'
import { DEPLOY_WORDS } from './deploy.ts'
import { LOCK_COPY } from './lock.ts'
import { TRANSLATION_WORDS } from './translations.ts'

/** One of the user's connected sites, as Ship it reads it (`ShipState.sites`). */
export type SwitchSite = {
  id: string
  title: string
  host: string
  url: string
  capability: 'full' | 'preview_only'
  /** `sites.capability_source` — `deploy_error` when a refused upload marked it Preview-only (R-270) */
  source: string | null
  /** `site_settings.locale`, as stored, or null */
  locale: string | null
  /** another of the user's projects that links it, or null */
  heldBy: { id: string; name: string } | null
}

export type SwitchPlan = {
  /** the linked site chosen again: nothing to write */
  same: boolean
  /** the project the site moves away from (Question 1), or null */
  heldBy: { id: string; name: string } | null
  /** a link from no site while the language is still `en` */
  firstLink: boolean
  /** the project's language once linked — `languageAtLink`'s on a first link, else the project's own */
  language: string
  /** the site's stored locale differs from the project's language, which stays (FR-Q6's confirm) */
  warnLanguage: boolean
  /** a confirm is owed before anything is written */
  confirm: boolean
}

/** THE PLAN FOR ONE CHOICE, or null when the site is none of the user's connected sites (gone, or disconnected meanwhile). */
export function switchPlan(a: { project: { id: string; language: string; linkedSiteId: string | null; overridden?: boolean }; site: string; sites: readonly SwitchSite[] }): SwitchPlan | null {
  const site = a.sites.find((s) => s.id === a.site)
  if (site === undefined) return null
  const { project } = a
  const same = project.linkedSiteId === site.id
  const heldBy = same || site.heldBy === null || site.heldBy.id === project.id ? null : site.heldBy
  const firstLink = !same && project.linkedSiteId === null && project.language === DEFAULT_LANGUAGE && project.overridden !== true
  const language = firstLink ? languageAtLink(site.locale) : project.language
  const warnLanguage = !same && !firstLink && typeof site.locale === 'string' && site.locale.trim() !== '' && site.locale !== project.language
  return { same, heldBy, firstLink, language, warnLanguage, confirm: heldBy !== null || warnLanguage }
}

/** Every sentence the picker and its confirm say (R-170: one list). The confirm's Cancel, Switch and its busy label are
 *  Translations' own — the same confirm, one name. */
export const SWITCH_WORDS = {
  title: 'Choose a site',
  lead: 'This project ships to one connected site at a time.',
  linkedTo: (project: string) => `Linked to ${project}`,
  firstLink: (language: string, host: string) => `This project will use ${language}, ${host}'s language.`,
  goToSites: DEPLOY_WORDS.goToSites,
  back: DEPLOY_WORDS.back,
  use: 'Use this site',
  switching: TRANSLATION_WORDS.switching,
  gone: 'That site is no longer connected.',
  /** R-276 (Story 7.18c, DW-381): the connected sites could not be read (`ShipState.sites` null) — said in place of the list,
   *  so a failed read never looks like having no other site */
  unread: "Your connected sites couldn't be loaded just now. Reload the page to try again.",
  confirmTitle: (host: string) => `Switch to ${host}?`,
  cancel: TRANSLATION_WORDS.cancel,
  switch: TRANSLATION_WORDS.switch,
  held: (host: string, other: string) =>
    `${host} is ${other}'s site now. Switching moves it here: ${other} keeps its designs and its deploy history, and isn't linked to a site until you choose one for it.`,
  language: (host: string, siteLanguage: string, projectLanguage: string) =>
    `${host} is set to ${siteLanguage}, but this project is in ${projectLanguage}. Ghost shows a theme's words in the site's own language, so its visitors would see the English wording until the two match.`,
} as const

/** What `switchSite` answers: linked, a confirm owed (its plan, re-run on the server), or refused with its sentence. */
export type SwitchAnswer = { ok: true } | { confirm: SwitchPlan } | { refused: string }

/** WHAT THE CUSTOMER CONFIRMED — the confirm as it was drawn: the project it named moving away, and whether it named two
 *  languages — or null for a press that saw no confirm. The server asks again unless this covers what is owed NOW, so a
 *  site another tab handed to a third project is never moved without that project being named (the Review, 2026-10-19). */
export type Confirmed = { heldBy: string | null; language: boolean } | null
export const confirmedOf = (plan: SwitchPlan): Confirmed => ({ heldBy: plan.heldBy?.id ?? null, language: plan.warnLanguage })
const covers = (plan: SwitchPlan, c: Confirmed): boolean =>
  c !== null && (plan.heldBy === null || plan.heldBy.id === c.heldBy) && (!plan.warnLanguage || c.language)
/** the action's argument, as a stranger may send it: anything but the confirm's own shape is no confirm */
export const confirmedFrom = (v: unknown): Confirmed => {
  const c = v as { heldBy?: unknown; language?: unknown } | null
  return typeof c === 'object' && c !== null && (c.heldBy === null || typeof c.heldBy === 'string') && typeof c.language === 'boolean'
    ? { heldBy: c.heldBy as string | null, language: c.language }
    : null
}

/** The rows `switchSite` reads and the two writes it makes, through the caller's own session — handed in, as `run.ts`' `DeployIo`
 *  is, so the server's half of the rule runs under test (`site-switch.test.ts`). */
export type SwitchIo = {
  /** does this tab's session hold the project's edit lock, fresh? (`holdsLock`) — a session reading along changes nothing */
  holds: () => Promise<boolean>
  /** the project (`overridden`: it holds translation overrides), and the site as one of the user's CONNECTED sites with the other project that links it (null: gone, or
   *  disconnected); null when a read failed */
  read: () => Promise<{ project: { language: string; linkedSiteId: string | null; overridden: boolean }; site: SwitchSite | null } | null>
  /** unlink every OTHER project of the user's linking the site; false when the write failed */
  unlink: () => Promise<boolean>
  /** link this project, with `language` set at a first link; `taken` is Postgres' 23505 (another project linked it meanwhile) */
  link: (language: string | null) => Promise<'ok' | 'taken' | 'error'>
}

/** THE SERVER'S HALF OF A SWITCH (`switchSite`): the lock first; the plan re-run over the rows as they stand; a confirm owed
 *  and not covered by what the customer confirmed answered with the plan, and nothing written; a held site unlinked from its
 *  project, THEN linked here — DW-69's partial unique index refuses two projects on one site; a 23505 on the link read again
 *  and answered again, a fresh confirm when what is owed now is not what was confirmed. ponytail: two statements, not one transaction — a link that fails for another reason after the
 *  unlink leaves the site with no project, which the next switch repairs; an RPC would make it one. */
export async function switchWith(io: SwitchIo, a: { projectId: string; siteId: string; confirmed: Confirmed }): Promise<SwitchAnswer> {
  const ours = { refused: DEPLOY_WORDS.infrastructure }
  if (!(await io.holds())) return { refused: LOCK_COPY.reading }
  for (let attempt = 0; attempt < 2; attempt++) {
    const rows = await io.read()
    if (rows === null) return ours
    if (rows.site === null) return { refused: SWITCH_WORDS.gone }
    const plan = switchPlan({ project: { id: a.projectId, ...rows.project }, site: a.siteId, sites: [rows.site] })
    if (plan === null) return { refused: SWITCH_WORDS.gone }
    if (plan.same) return { ok: true }
    // a confirm owed and not given — or owed for something the customer never saw (another holder; the race a 23505 met)
    if (plan.confirm && !covers(plan, a.confirmed)) return { confirm: plan }
    if (plan.heldBy !== null && !(await io.unlink())) return ours
    const linked = await io.link(plan.firstLink && plan.language !== rows.project.language ? plan.language : null)
    if (linked === 'ok') return { ok: true }
    if (linked === 'error') return ours
  }
  return ours
}
