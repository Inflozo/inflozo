import { headers } from 'next/headers'
import { cache } from 'react'
import { categoryOf, isPlaceable, orbitWeekly, PAYWALL_CATEGORIES, type CardDesigns, type Listed, type SectionRegistryEntry } from '@inflozo/library'
import { designate, flaggedListing, isDesigned, isSynthesizable, parseDoc, synthesize, type DroppedRow, type ProjectDoc, type SynthesisLibrary } from '@inflozo/section-runtime'
import type { LinkResources } from '@/components/controls/link-picker'
import { imagePool, linkResources } from '@/lib/controls-review'
import type { PackRecords, PairingChoice } from '@/lib/pack-edit'
import type { PackChoice } from '@/lib/pack-switch'
import { ownPacksOf, packChoices, packIdOf, pairingChoices, pairingGlyphFacesCss, siteAccentOf } from '@/lib/style-pack'
import { canvasRouteOn } from '@/routing'
import { hostOf, normaliseSiteUrl } from '@/lib/connect-rule'
import { siteFrom, siteWith, type EditorSite } from '@/lib/live-content'
import { canvasOfPageTwoKey, canvasOfTemplateKey, canvasesOf, fileOf as fileOfCanvas, fileOfKey, isRouteKey, isUuid, routeCanvasOf, templateKeyOf, type Canvas, type RouteCanvas, type RouteTemplate } from '@/lib/editor'
import { rowFrom, type LockRow } from '@/lib/lock'
import { resolveEntitlement } from '@/lib/entitlement'
import { storedCards } from '@/lib/cards'
import type { PlanId } from '@/lib/plan'
import { carriesMemberVisibility, docRefusal, pilot, pilotIds } from '@/lib/pilots'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import { readViewed, type Visitor } from '@/lib/view-as'
import { SETTING_COLUMNS, storedSettings, type StoredSetting } from '@/lib/theme-settings'
import { templatesOf } from '@/lib/routes'
import { listsOf, parseRoutesConfig, pathsUsing, type RoutesConfig } from '@inflozo/section-runtime/routes'
import { DEFAULT_LANGUAGE, scriptOf } from '@inflozo/library/languages'
// SERVER ONLY (intl-messageformat 5.4.3): this file is imported by server modules and, as a type, by the editor — never as a value
import { judgeOverrides } from '@inflozo/library/override'
import { requiredTemplates } from '@inflozo/theme-compiler'
import { shipStateOf, type ShipState } from '@/lib/deploy'

/**
 * THE EDITOR'S TWO READS (Story 5.1), both through the user's own session, so RLS decides what exists for them.
 *
 * `projectOf` is the 404 guard's read: a non-uuid never reaches Postgres (22P02), and another user's project, a
 * missing one and `abc` all come back null — one answer, so a project's existence is never revealed. `cache`d, so
 * the layout and the pages' metadata share one query per request.
 *
 * `editorData` runs inside the layout's Suspense boundary: every `project_templates` row, each parsed through AD-27's
 * one schema and checked against the design library, LOUDLY — a doc that fails any of it throws a sentence naming
 * the template key and the offending instance, and the app's error boundary shows instead of a partly drawn canvas.
 *
 * Since Story 5.4 the design check has TWO halves: the design must compile to this template's file, and it must be
 * PLACEABLE at all. A32, A33 and A34 are treatments chosen outside the canvas (FR-D5, FR-D12, FR-Q9), so a doc that
 * names one is a doc nothing could have written — refused here, which is what makes "a treatment never reaches
 * Layers" true by construction rather than by every surface remembering to filter.
 *
 * Since Story 5.2 it also hands over what the section panel needs — the inputs `/pilots` feeds `Sidebar` (swatches, link
 * resources, the site's time zone, each pool picture's size) — and the account's plan, for R-119's Pro badge. The plan
 * comes from AD-28's one resolver, so a failed read shows the badge (Free) rather than hiding it.
 *
 * SINCE STORY 5.5 IT ALSO SYNTHESIZES (FR-D6, AD-22). A canvas with no row — or a row with zero instances — is
 * UNTOUCHED, and an untouched synthesizable canvas is handed its Synthesis Default stack as the doc it opens on, with
 * its key in `synthesized` so D5a's marker is SERVER TRUTH and not a guess. Nothing is written: `project_templates`
 * gains no row here and persistence is Story 5.8's.
 *
 * THE TWO REFUSALS ARE DIFFERENT, DELIBERATELY. Above, a STORED doc naming a design the library cannot place throws —
 * it is a user's data, and a missing design there is corruption. A SYNTHESIZED row that cannot be placed is our own
 * table meeting a library that has not caught up (A25-A31 unauthored; A24 narrowed to `post.hbs`, DW-191): it is
 * DROPPED with its reason, because throwing would black out four canvases the user never touched.
 */

/** Story 5.8 — `revision` joins it too, and for the same reason `dark_enabled` did: AD-15's hydrate comparison is
 *  `projects.revision` vs the local `base_revision` and NOTHING ELSE, so the cloud revision has to be SERVER TRUTH
 *  read above the boundary rather than a number the client asks for afterwards. The column pre-exists
 *  (`20260904120000_complete_schema.sql:231-232`); what this story's migration adds is the only function that can
 *  MOVE it.
 */
/** Story 5.6 — `dark_enabled` joins the guard's own select (FR-D7's project mode, `projects.dark_enabled`, default
 *  true). It is SERVER TRUTH, exactly as 5.5 made synthesis server truth: the editor must not guess whether it may
 *  offer the sun, and `/projects/<id>/settings` reads the same cached row. No migration — the column pre-exists
 *  (`20260904120000_complete_schema.sql:224`), so this story has no Schema phase (R-99). */
/** Story 5.18 — `linked_site_id` joins it, and for `dark_enabled`'s reason: whether the canvas may read a site is SERVER
 *  TRUTH, never a guess the editor makes (FR-B5; the column pre-exists, `…complete_schema.sql:229`, so no Schema phase). */
/** Story 6.2 — `style_pack` joins it, E6's column, for S4a's Style Pack card and S7a's roster: the editor shows the
 *  project's pack (a stored preset this build does not know reads as Paper, `presetIdOf`). The column pre-exists
 *  (`…complete_schema.sql:223`). Story 6.3 — and the editor CHOOSES it: the save writes `style_pack.preset` with the docs
 *  (`sync_project_doc`'s `p_preset`, a Schema phase of its own). */
/** Story 5.19 — `posts_per_page` joins it: FR-H2's main feed is sized by the THEME's setting, never the sample's, and a
 *  secondary feed's Count starts there. SERVER TRUTH for the same reason; the column pre-exists with its `>= 1` check
 *  (`…complete_schema.sql:226-227`), so no migration and no Schema phase (R-99). */
export const projectOf = cache(async (id: string): Promise<Project | null> => {
  if (!isUuid(id)) return null
  const { data, error } = await (await supabaseServer())
    .from('projects')
    .select('id, name, slug, dark_enabled, revision, linked_site_id, posts_per_page, style_pack, language, rtl_ack_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`the project could not be read (${error.code})`)
  return data
})

/** Story 7.12 — `language` and `rtl_ack_at` join it (FR-Q6): the canvas's strings and faces, Theme settings' Translations page
 *  and its actions all read the language in force off this one cached row. Both columns pre-exist with their grants
 *  (`20260904120000_complete_schema.sql:225`, `:233`, `:1210`), so no migration and no Schema phase (R-99). */
export type Project = {
  id: string
  name: string
  /** Story 7.18a — FR-J10's source of the theme's name (`themeNameOf`), frozen once a binding exists (`guard_slug`) */
  slug: string
  dark_enabled: boolean
  revision: number
  linked_site_id: string | null
  posts_per_page: number
  style_pack: unknown
  language: string
  rtl_ack_at: string | null
}

/** STORY 7.12 — the project's translation overrides, through the caller's own session (RLS: the uniform owner policy and the
 *  parent-ownership term, `…complete_schema.sql:816-855`). `cache`d, so the editor's read and the Translations page share one
 *  query per request. */
const overrideRows = cache(async (projectId: string) =>
  (await supabaseServer()).from('translation_overrides').select('catalog_key, value').eq('project_id', projectId))

export type Translations = {
  /** `projects.language`, exactly as stored — Ghost reads `locales/<its own locale>.json` with no normalisation */
  language: string
  /** `projects.rtl_ack_at`: when the owner pressed Understood for a right-to-left language, else null */
  rtlAck: string | null
  /** every stored override `overrideRefusal` passes, by catalog key — what the canvas renders */
  overrides: Readonly<Record<string, string>>
  /** every stored override it refuses, with the sentence — shown on its row, never rendered */
  refused: Readonly<Record<string, { value: string; sentence: string }>>
}

/** STORY 7.12 — what Translations shows: the language in force, its acknowledgement and the stored overrides, judged by FR-Q8's
 *  one judge (`judgeOverrides`): a row it refuses can only arrive by a direct table write (AD-6), and is shown refused on its
 *  row, kept off the canvas, and fails the compile. A read that fails throws, as Theme settings' own does: an empty list over
 *  overrides that exist would invite overwriting them. */
export async function readTranslations(projectId: string): Promise<Translations> {
  const [project, { data, error }] = await Promise.all([projectOf(projectId), overrideRows(projectId)])
  if (error) throw new Error(`the project's translations could not be read (${error.code})`)
  return { language: project?.language ?? DEFAULT_LANGUAGE, rtlAck: project?.rtl_ack_at ?? null, ...judgeOverrides(data ?? []) }
}

/** STORY 7.16b — the project's Routes Manager templates (`custom_templates` of kind `routes`, in their order, through the
 *  caller's own session — RLS), each as the canvas it is: `templatesOf` keeps a row whose filename passes
 *  `CUSTOM_TARGET_RE`, and `routeCanvasOf` the ones in the database's own key shape that are no membership file. `cache`d,
 *  so the editor's read and the canvas page's title share one query per request. A failed read throws, as the docs' does:
 *  an editor missing a template would move an open one to Home and say it is gone. */
export const routeTemplatesOf = cache(async (projectId: string): Promise<{ canvas: RouteCanvas; file: string; name: string }[]> => {
  const { data, error } = await (await supabaseServer())
    .from('custom_templates').select('id, filename, display_name, kind, created_at').eq('project_id', projectId).eq('kind', 'routes').order('created_at')
  if (error) throw new Error(`the project's templates could not be read (${error.code})`)
  return templatesOf(data).flatMap((t) => {
    const canvas = routeCanvasOf(t.file)
    return canvas === null ? [] : [{ canvas, file: t.file, name: t.name }]
  })
})

/** The template file a stored key compiles into — `templateKeyOf`'s inverse. `custom:custom-x.hbs` names its own,
 *  which is what R-129's three membership canvases store under (Story 5.5 opened them, and this map already answered
 *  their shape). Every row of the project is checked, so a key with no `.hbs` of its own — `paywall` (5.20) — throws for
 *  the whole editor the day its writer lands; the story that writes it extends this map in the same change (review,
 *  2026-09-17). Story 5.16 is such a writer: a page-2 key compiles to the file `PAGE_TWO` names — `index` to `index.hbs`,
 *  and an archive's `tag-paged` and `author-paged` to the archive's own file. Story 7.13's `cards` is no
 *  `project_templates` row at all: its values are `project_treatments.card_designs`. */
const fileOf = fileOfKey

/** STORY 5.19's SERVER DOOR, ONE FUNCTION (DW-257): every doc the editor is handed leaves through the main-feed rule
 *  (AD-27(d)) — `editorData` below for a stored project, and the keyboard harness for its fixture — so a doc written before
 *  the rule is REPAIRED on its way in, and the harness's Home is designated by the rule itself rather than by a flag of its
 *  own, which is what lets `pnpm keyboard` see this FUNCTION break. That `editorData` still calls it is seen only by the
 *  deployed editor walk's step 94 (a stored Home with no flag opens repaired) — the harness has no database to read
 *  through. Reading alone writes nothing (AD-22); a doc that already
 *  satisfies the rule comes back as the same object. HERE, in the server read, and not in `lib/editor.ts`: that module is
 *  the Shell's too, and the runtime it would import more than doubled the client script of every signed-in page (Projects
 *  384,773 → 922,553 bytes, measured on a production build at Story 5.24d's Dev). STORY 7.16c — `listed`, the Routes
 *  Manager files a collection or channel names (`listsOf`): a listed template paginates, so its first visible feed is
 *  designated its main feed on the way in, and one whose last route went has its flag stripped. */
export const designateAll = (docs: Readonly<Record<string, ProjectDoc>>, library: SynthesisLibrary, listed?: Listed): Record<string, ProjectDoc> =>
  Object.fromEntries(Object.entries(docs).map(([key, doc]) => [key, designate(doc, fileOf(key), library, undefined, listed)]))

export type EditorData = {
  /** every stored doc, by `template_key` — the site's, each canvas's, and since Story 5.16 each PAGE 2 that has a
   *  design of its own (`PAGE_TWO`'s keys). A page 2 with no row, or a row with no instances, FOLLOWS its page 1: it is
   *  an exact copy stored nowhere (R-179, AD-22), which `lib/page-two.ts` derives in the browser from these same docs. */
  docs: Readonly<Record<string, ProjectDoc>>
  entries: Readonly<Record<string, SectionRegistryEntry>>
  pool: readonly { id: string; bytes: number }[]
  /** STORY 5.19 — the project's `posts_per_page` (FR-H2): what the main feed's list is paginated at on the sample and
   *  on the site alike, what its greyed Count shows (D5c), and a secondary feed's starting Count. Since this story the
   *  sample's `{{#get}}` rows are no longer handed over per DESIGN: a query is the INSTANCE's — its Source, tag, writer
   *  or picks — so the editor resolves them in the browser (`lib/canvas.ts`'s `sampleRows`). */
  postsPerPage: number
  /** per design id: does its category carry R-124's Member visibility row (`carriesMemberVisibility`)? */
  memberVisibility: Readonly<Record<string, boolean>>
  /** Story 5.6 — FR-D7: is this project Light + Dark? False means the sun is ABSENT from the bar, not disabled
   *  (UX-DR3, R-118), and every stored override is untouched (AD-17) */
  darkEnabled: boolean
  /** Story 5.8 — AD-15's hydrate comparison, as SERVER TRUTH: the cloud revision the local `base_revision` is tested
   *  against. Equal → the local doc and the journal both survive; different → the cloud doc replaces the local one and
   *  the journal is cleared (`addendum.md` §AD1.1). */
  revision: number
  /** Story 5.8 — whose local store this is. IndexedDB is per ORIGIN, not per session, so two accounts on one browser
   *  would otherwise share one database; the id names it (`lib/local-store.ts`). It is the caller's own id, which they
   *  already carry in their session cookie. */
  userId: string
  /** Story 5.8 — FR-D10's per-USER autosave preference (`profiles.autosave_enabled`, the Account screen's toggle).
   *  False stops THE TIMER ALONE: the local journal, tab close and ⌘S are unchanged (AD-15). */
  autosave: boolean
  links: LinkResources
  /** the site's time zone name, printed under a date control — the SAMPLE's; the editor names the connected site's own
   *  once its `/settings/` has answered (Story 5.18) */
  timezone: string
  /** STORY 5.18 — THE LINKED SITE, AS SERVER TRUTH: readable (`{ title, origin, key }` — the key delivered on purpose,
   *  FR-C3, and read by the BROWSER straight from the site, AD-10), unreadable with its reason, or null where no site is
   *  linked. Read through the user's own session, so RLS decides; a failed read is logged by code and answered null. */
  site: EditorSite
  plan: PlanId
  /** Story 5.5 — the canvases this project offers, in D5b's row order; a conditional canvas is absent, not greyed. Story
   *  7.16b — then each Routes Manager template's, in `templatesOf` order */
  canvases: Canvas[]
  /** Story 5.5 — the canvas keys whose doc came from `synthesize`: D5a's marker, as server truth (AD-22) */
  synthesized: Canvas[]
  /** STORY 7.16b — the project's Routes Manager templates as the editor draws them: the switcher's rows, the tab's name, and
   *  each one's paths for D5f's routed sentence (`routes_config` through `pathsUsing`; none when the stored routing does
   *  not parse, routine call 12). Optional for the harness's reason: it has none */
  templates?: readonly RouteTemplate[]
  /** STORY 7.16c — the project's stored routing, PARSED (`parseRoutesConfig`), or null where it cannot be read or does not
   *  parse (routine call 12: an unreadable routing lists nothing). The editor derives `listsOf` from it once — which
   *  templates are listed, what each lists and Home's own list — so the canvas lists what each live address lists */
  routes: RoutesConfig | null
  /** STORY 7.17 — DW-366, R-257: where `routes` is null (unreadable), the Routes Manager files whose stored doc flags a main
   *  feed (`flaggedListing`) — each keeps it, designated listed on the way in and by the editor at every edit, its Count
   *  sized by Posts per page until the routing reads again. Absent while the routing reads. */
  unreadListed?: readonly string[]
  /** Story 5.5 — EVERY synthesizable canvas's default stack, by stored key, whether or not it is untouched right now.
   *  AD-22's round trip needs the stack of a canvas that is DESIGNED at load too: taking its last section off returns
   *  it to untouched, and what re-renders is this. Keyed by `template_key`, as `docs` is. */
  defaults: Readonly<Record<string, ProjectDoc>>
  /** Story 5.5 — per synthesizable canvas, by stored key as `docs` and `defaults` are, the default rows the library
   *  could not place and why. Derived from the
   *  library, so it empties itself as Epics 9 and 10 land; nothing draws it, and it is here because a drop that
   *  nothing can read is a drop nobody can check. */
  dropped: Readonly<Record<string, readonly DroppedRow[]>>
  /** Story 5.13 — FR-D22's STORED preview subject per canvas, keyed by `template_key` as `docs` is. It is handed over
   *  RAW: `orbitWeekly.resolveSubject` is the one guard, and it answers the fixture with a `fellBack` flag for a
   *  subject of the wrong kind or naming a row the source no longer holds. A canvas with no row here is untouched
   *  and renders its fixture, which is the same answer. */
  subjects: Readonly<Record<string, orbitWeekly.Subject>>
  /** STORY 5.17 — FR-D18's LOCK, AS SERVER TRUTH AT FIRST PAINT. A second opener must not flash an editable shell
   *  before the client learns it is a reader, so the row is read ABOVE the boundary beside `revision` and
   *  `autosave` rather than asked for afterwards. `null` is "nobody holds it", and a row whose `ageMs` is past
   *  §AD4's ~60 s is a session that has gone — the staleness is that comparison and nothing else, because the
   *  table has no expiry column. `lib/lock.ts` owns both the shape and the test. */
  lock: LockRow | null
  /** Story 5.14 — FR-D16's per-canvas "looked at" record (`project_template_prefs.member_states_viewed`), keyed by
   *  `template_key` as `docs` and `subjects` are, each value read through `readViewed`: the known visitors in canonical
   *  order, junk dropped. A canvas with no row here has been looked at as nobody, which is the same answer. Story 5.16:
   *  a page 2 keeps its own record under its own key (R-167). */
  viewed: Readonly<Record<string, readonly Visitor[]>>
  /** Story 6.2 — the project's Style Pack: `projects.style_pack` as stored (jsonb, user-writable), read through
   *  `lib/style-pack.ts`'s `presetIdOf`, never trusted — an id this build does not know is Paper. Story 6.3: the pack the
   *  canvas document is asked for in, and the one a hydrate keeps or replaces exactly as it does the docs (§AD1.1). */
  preset: string
  /** STORY 6.3 — EVERY PRESET AS THE EDITOR PAINTS IT (`packChoices`): names, dots, the Background role's swatches per mode
   *  (Story 5.6's, now per pack, so the panel's dots are what the canvas is painting) and each canvas token block and
   *  `@font-face` rules — server-derived data, so no client carries the library's presets or the font pool (DW-323).
   *  Story 6.4: each with the library's record, what Edit pack opens on and Reset to defaults puts back. */
  packs: readonly PackChoice[]
  /** STORY 6.4 — THE PROJECT'S OWN PACKS (`style_pack.packs`), through `ownPacksOf`'s one rule (AD-36): an edited preset
   *  under its id, a pack it made under `custom-<n>`. `preset` above may name one of the latter (`packIdOf`). */
  ownPacks: PackRecords
  /** STORY 6.4 — every pool pairing, as the font rows, the pairing menu and the browser's engine need it (`pairingChoices`) */
  pairings: readonly PairingChoice[]
  /** STORY 6.4 — the `@font-face` rules the font rows and the pairing menu draw "Ag" and "Aa" with, from the canvas route as
   *  this page sees it (`pairingGlyphFacesCss`) */
  pairingFaces: string
  /** STORY 6.4 — S7d's "From your site": the linked site's stored brand accent (Story 3.4), through `isAccent`, as
   *  `#RRGGBB` — or null where no site is linked or it holds none */
  siteAccent: string | null
  /** STORY 7.10 — the project's custom settings (Theme settings' rows, `storedSettings`), in their order: what the panel draws
   *  as "In Ghost", what the canvas paints as P0-1's plain-text lock, and what Delete, Hide, a shuffle and a pack switch
   *  warn about. A failed read is none, logged — the safe side the prefs read takes: the editor draws every promote action
   *  and no tag, and Theme settings stays the truth */
  settings: readonly StoredSetting[]
  /** STORY 7.12 — the stored overrides `overrideRefusal` passes, by catalog key (FR-H5): the canvas renders them through the
   *  shim. Optional for the harness's reason: none is English */
  overrides?: Readonly<Record<string, string>>
  /** STORY 7.13 — the project's card designs (`project_treatments.card_designs`, FR-Q7), through `card_designs`' one schema,
   *  `parseStoredCards` (AD-36, AD-27(a)): the Editor cards surface's values, the switcher's amber count and the canvas's
   *  styles. Optional for the harness's reason: no card designed */
  cardDesigns?: CardDesigns
  /** STORY 7.13 — the sentence `parseStoredCards` refused a stored record with (a hand-made row, AD-6), or null: the screen
   *  then opens every card on Ghost's defaults and says so once */
  cardsRefused?: string | null
  /** STORY 7.18a — what Ship it knows before any job (`shipStateOf`): the linked connected site, the theme's name, the next
   *  version and the one the site serves from this project. Optional for the harness's reason: it supplies its own */
  ship?: ShipState
}

export async function editorData(projectId: string): Promise<EditorData> {
  // the client first, so the two reads below really run together (an await inside the array would serialise them)
  const sb = await supabaseServer()
  // Story 5.8: the user is needed for its own sake now — the local store is named after them — so `signedIn()` is
  // awaited once and its id used twice rather than read a second time.
  const user = await signedIn()
  // `cache`d, and the 404 guard above this boundary already read it — so this is the linked site's id at no cost, and
  // the site's own row can join the reads below rather than follow them
  const linked = (await projectOf(projectId))?.linked_site_id ?? null
  const [{ data, error }, { plan }, project, profile, prefs, lock, siteRow, settingsRow, overridesRow, cardsRow, routeRows, routingRow, shipRows, sitesRows, linkingRows] = await Promise.all([
    sb.from('project_templates').select('template_key, doc').eq('project_id', projectId),
    resolveEntitlement(user.id),
    // `cache`d and already read by the 404 guard above this boundary, so this costs no second query
    projectOf(projectId),
    // FR-D10's toggle is per USER, not per device (`schema:118`). A read that FAILS answers true, which is the
    // column's own default and the safe side of this one: autosave off is the state that sends less.
    sb.from('profiles').select('autosave_enabled').eq('user_id', user.id).maybeSingle(),
    // Story 5.13 — `project_template_prefs`' FIRST READER ANYWHERE (FR-D22). RLS scopes it to this caller's own
    // rows. ONE ROW PER CANVAS PER PROJECT — the table's key is `(project_id, template_key)` — so it is "per user"
    // only because a project has one owner today; a second member would share the row (review, 2026-09-21, DW ledger).
    // Story 5.14 — and its viewed member states, the column's first reader too (FR-D16, AD-22)
    sb.from('project_template_prefs').select('template_key, preview_subject, member_states_viewed').eq('project_id', projectId),
    // Story 5.17 — `edit_locks`' FIRST READER ANYWHERE (FR-D18). Through the user's own session, which is the only
    // key that can see this table at all: it is absent from the `service_role` grant loop, so the secret key
    // returns nothing without saying so (`MEASUREMENTS.md` §50). RLS scopes it to the caller's own project.
    sb.from('edit_locks')
      .select('holder_session_id, lock_generation, unsynced_edits, heartbeat_at, nudge_requested_by, nudge_requested_at')
      .eq('project_id', projectId)
      .maybeSingle(),
    // Story 5.18 — THE LINKED SITE'S OWN ROW, through the user's session (the owner policy and `grant select` on
    // `sites`, `…complete_schema.sql:814-828, :1041-1042`). Nothing here reads the SITE: the Content API is the
    // browser's path, never the server's (AD-10, `admin-rule.ts:164`).
    // Story 5.20 — and its `site_settings`, for FR-H6's record of the member switches (`storedMembers` reads the one key)
    // Story 5.21 — and for the snapshot Ghost's two surfaces are drawn from (`storedSurfaces`)
    // Story 7.18b — and its `capability_source` (R-270: a refused upload's mark keeps Run checks)
    linked === null ? null : sb.from('sites').select('url, title, content_key, disconnected_at, site_settings, ghost_version, capability, capability_source').eq('id', linked).maybeSingle(),
    // Story 7.10 — the project's custom settings, through the user's own session as Theme settings reads them (RLS)
    sb.from('custom_settings').select(SETTING_COLUMNS).eq('project_id', projectId).order('position').order('created_at'),
    // Story 7.12 — the project's translation overrides (FR-H5: the canvas renders them through the shim)
    overrideRows(projectId),
    // Story 7.13 — the project's card designs, through the user's own session (RLS: the uniform owner policy)
    sb.from('project_treatments').select('card_designs').eq('project_id', projectId).maybeSingle(),
    // Story 7.16b — the project's Routes Manager templates (each a canvas) and its stored routing (which of them a route shows)
    routeTemplatesOf(projectId),
    sb.from('routes_config').select('config').eq('project_id', projectId).maybeSingle(),
    // Story 7.18a — the deploys and the binding Ship it counts from, through the user's own session (the tenant reads both)
    linked === null ? null : Promise.all([
      sb.from('deploys').select('version, status, activated, activated_at').eq('project_id', projectId).eq('site_id', linked).in('status', ['uploaded', 'live']),
      sb.from('project_site_bindings').select('theme_name').eq('project_id', projectId).eq('site_id', linked).maybeSingle(),
      // R-264 (a): the site's latest activated deploy, whichever project made it — is this project's theme the one live?
      sb.from('deploys').select('project_id').eq('site_id', linked).eq('activated', true).order('activated_at', { ascending: false }).limit(1),
    ]),
    // Story 7.18b — the picker's rows: the user's CONNECTED sites, newest first as Sites lists them, and which of the user's
    // projects links each (FR-B5, DW-69's one project per site) — both through the user's own session, so RLS decides
    sb.from('sites').select('id, title, url, capability, capability_source, site_settings').is('disconnected_at', null).order('created_at', { ascending: false }),
    sb.from('projects').select('id, name, linked_site_id').not('linked_site_id', 'is', null),
  ])
  if (error) throw new Error(`the project's templates could not be read (${error.code})`)
  // Story 7.13: a failed read THROWS, as the templates' does — an editor opened on no designs would write that empty record
  // over the stored one with its next card edit (the record rides the flush whole)
  if (cardsRow.error) throw new Error(`the project's card designs could not be read (${cardsRow.error.code})`)
  // read as the compile reads it — a glyph the icon set does not draw opens on Ghost's defaults too (`storedCards`, through `parseStoredCards`)
  const cards = await storedCards(cardsRow.data?.card_designs ?? null)
  if (cards.cardsRefused !== null) console.error('editorData: the stored card designs were refused, so the screen opens on Ghost\'s defaults', { sentence: cards.cardsRefused })

  /* STORY 7.16b — THE ROUTES MANAGER'S TEMPLATES, AS CANVASES, and the paths that show each. A routing that cannot be read
     or does not parse counts as no route (routine call 12): D5f then says "stops shipping", and the routes page owns the
     repair (DW-362, Story 7.18a's) — logged, never a black editor. */
  if (routingRow.error) console.error('editorData: the stored routing could not be read', { code: routingRow.error.code })
  const routing = routingRow.error ? null : parseRoutesConfig(routingRow.data?.config ?? {})
  const templates: RouteTemplate[] = routeRows.map((t) => ({ canvas: t.canvas, name: t.name, paths: routing?.ok === true ? pathsUsing(routing.config, t.file) : [] }))
  // Story 7.16c — the routing as the editor reads it, and the files it lists (one `listsOf`, the spec's one list)
  const routes = routing?.ok === true ? routing.config : null
  const current = new Set(templates.map((t) => templateKeyOf(t.canvas)))

  const docs: Record<string, ProjectDoc> = {}
  const entries: Record<string, SectionRegistryEntry> = {}
  for (const row of data ?? []) {
    const key = row.template_key as string
    // STORY 7.16b — AN ORPHAN DOC IS NEVER A CANVAS: a `custom:` doc of a Routes Manager file whose template row is gone
    // (`ponytail:` routine call 11 — a save landing between a delete's doc and row steps can re-store it). Skipped before it
    // is parsed or judged, so it is never drawn, counted or synthesized over; the sync never writes one either
    if (isRouteKey(key) && !current.has(key)) continue
    const doc = parseDoc(row.doc, key)
    // DW-235 (Story 5.24e): the placement rules — a paywall's one design, no treatment on a canvas, a design the library
    // holds, a file it compiles to — are `docRefusal`'s, which the sync route asks before it writes. A doc it refuses is
    // one nothing in the product could have written, and it throws here; `entries` is filled as the designs are read
    const refused = docRefusal(key, doc, entries)
    if (refused !== null) throw new Error(refused)
    docs[key] = doc
  }

  // ── Story 5.5 — synthesis, after every stored doc has been read and checked ──
  // The library, asked the same two questions as above and answering `undefined` instead of throwing. Memoised into
  // `entries`, which is also how a synthesized design reaches the canvas: the editor paints from that map.
  const held = (designId: string) => {
    const known = entries[designId]
    if (known) return known
    // ABSENT is asked, not caught: a design the directory holds but that does not validate or assemble is a broken
    // library and throws as it does for a stored doc — swallowing it would report "the library holds no design"
    // and quietly drop the row from every canvas that defaults to it (review, 2026-09-18).
    if (!pilotIds().includes(designId)) return undefined
    const entry = pilot(designId)
    entries[designId] = entry
    return entry
  }
  // no condition can be true yet, so this is every unconditional canvas — `lib/editor.ts`'s `CONDITIONAL` carries why —
  // then each Routes Manager template's (Story 7.16b), never synthesized (FR-D6)
  const canvases: Canvas[] = [...canvasesOf(), ...templates.map((t) => t.canvas)]
  const synthesized: Canvas[] = []
  const defaults: Record<string, ProjectDoc> = {}
  const dropped: Record<string, readonly DroppedRow[]> = {}
  for (const canvas of canvases) {
    const file = fileOfCanvas(canvas)
    const key = templateKeyOf(canvas)
    // A canvas that is never synthesized — R-129's three membership ones and Private — has no default stack at all,
    // so it opens EMPTY and takes no marker (`sections-inventory.md:785`).
    if (!isSynthesizable(file)) continue
    const stack = synthesize(file, held)
    // EVERY synthesizable canvas's stack is handed over, designed or not: AD-22's round trip means a canvas the user
    // empties returns to untouched and re-renders THIS, and a canvas that was designed at load can be emptied too.
    defaults[key] = { schemaVersion: 1, instances: stack.instances }
    if (stack.dropped.length > 0) dropped[key] = stack.dropped
    // AD-22: no row, or a row with zero instances, is untouched — and only then does the canvas OPEN on its default
    // stack and carry D5a's marker.
    if (isDesigned(docs[key] ?? { schemaVersion: 1, instances: [] })) continue
    docs[key] = defaults[key] as ProjectDoc
    synthesized.push(canvas)
  }

  /* STORY 5.8 — EVERY PLACEABLE DESIGN THE LIBRARY HOLDS, not only the ones this project's STORED docs name.
   *
   * Found by execution, not by reading: the editor's local document can legitimately hold a design the server's does
   * not. Delete the only section using one, let the flush go up, reload — the server's doc no longer names it, so
   * `entries` no longer carried it, and UNDOING that deletion was refused by FR-D9's vanished-design guard as though
   * the library had dropped the design. Worse, a local doc naming it could not be painted at all, so the hydrate fell
   * back to the cloud and silently threw the customer's work away. (`run-verify-editor.cjs` step 67, 2026-09-19.)
   *
   * The editor must therefore be able to render ANY doc the library can place, which is also exactly what Story
   * 5.10's "+ Add section" and Story 5.11's design swap will need. `held` is the lenient reader synthesis already
   * uses: it answers `undefined` for a design the library does not hold rather than throwing, and it memoises into
   * this same map, so a design already read above costs nothing.
   *
   * ponytail: every placeable design, eagerly. The library holds a handful today and each entry is a few KB; the day
   * Epics 9 and 10 fill it, this becomes a per-design read the editor asks for when a doc names one it has not got
   * (DW-200).
   */
  for (const id of pilotIds()) if (isPlaceable(id)) held(id)
  // STORY 5.20 — AND EVERY PAYWALL DESIGN, the Paywall canvas's ring (A32 — none until Story 10.107; the keyboard harness
  // hands the two stand-ins instead, R-158). A treatment is never placed, so the loop above leaves them out.
  for (const id of pilotIds()) if ((PAYWALL_CATEGORIES as readonly string[]).includes(categoryOf(id))) held(id)

  /* STORY 5.19 — EVERY DOC LEAVES THROUGH THE MAIN-FEED RULE (AD-27(d)): on a paginated page exactly one visible feed
   * carries the flag. A doc written before the rule — the owner's "Pilot sections" Home, whose grid was seeded with no
   * flag, or a main feed duplicated before this story — is REPAIRED here, in what is handed to the editor, and stored
   * repaired with the next edit of that canvas. Reading alone writes nothing (AD-22). A doc that already satisfies the
   * rule comes back as the same object, so a valid designation is never moved. */
  // STORY 7.17 — DW-366, R-257: an UNREADABLE routing lists what the stored docs flag (`flaggedListing`), so a passing read
  // failure never strips a template's main feed; a readable one is `listsOf`'s, which strips a file it does not list
  const unreadListed = routes === null ? flaggedListing(docs) : undefined
  Object.assign(docs, designateAll(docs, held, unreadListed === undefined ? listsOf(routes) : new Set(unreadListed)))

  /* STORY 5.13 — the stored preview subjects, by template key.
   *
   * A FAILED READ IS THE FIXTURE, NOT A BLACK CANVAS. Unlike a doc, a preview subject is set-and-forget context
   * (FR-D11): the canvas renders perfectly well without one — it renders the fixture, which is exactly what an
   * untouched canvas renders — so a read that fails is logged and answered with none, the same safe side
   * `autosave_enabled` takes above. Throwing here would blank an editor over a preference.
   *
   * THE SHAPE IS CHECKED AND NOTHING ELSE IS. The column is `jsonb` and nothing but this story has ever written it,
   * so a row of another shape is a row nobody in the product made; `resolveSubject` is the guard that decides
   * whether the value still names anything, and it answers the fixture with `fellBack` when it does not. */
  if (prefs.error) console.error('editorData: preview subjects and viewed member states could not be read', { code: prefs.error.code })
  const subjects: Record<string, orbitWeekly.Subject> = {}
  /* STORY 5.14 — the viewed member states ride the SAME read and take the SAME safe side: a failed read is the one log
     above and answers none, because a record nobody could read only brings the reminder back — it never blanks an
     editor. The column is `text[]` with no CHECK, so `readViewed` is its guard: a value that is not a visitor is a
     value nobody in the product wrote, and it is dropped. */
  const viewed: Record<string, readonly Visitor[]> = {}
  for (const row of prefs.data ?? []) {
    // a row whose key no canvas owns stays out: `afterChange` walks every key on a header or footer change, and
    // `setViewedStates` refuses a whole batch for one key it does not know (review, 2026-09-21). Story 5.16 — a page-2
    // key is a page of its own with a record of its own (R-167), so it is read like a canvas's.
    const known = canvasOfTemplateKey(row.template_key as string) !== null || canvasOfPageTwoKey(row.template_key as string) !== null
    if (known) viewed[row.template_key as string] = readViewed(row.member_states_viewed)
    const value = row.preview_subject as { kind?: unknown; slug?: unknown; source?: unknown } | null
    if (value === null || typeof value !== 'object') continue
    const { kind, slug, source } = value
    if (typeof slug !== 'string' || (kind !== 'post' && kind !== 'page' && kind !== 'tag' && kind !== 'author')) continue
    // Story 5.18 — A SUBJECT BELONGS TO THE SOURCE IT WAS CHOSEN FROM: one chosen over the site keeps its mark, and an
    // unmarked one is the sample's, as every row written before that story is
    subjects[row.template_key as string] = source === 'site' ? { kind, slug, source } : { kind, slug }
  }

  /* STORY 5.18 — THE LINKED SITE, and a failed read is SAMPLE CONTENT, not a black editor: the safe side the prefs read
     takes above. `siteFrom` decides readable or unreadable-with-its-reason (`lib/live-content.ts`, unit-tested). */
  if (siteRow?.error) console.error('editorData: the linked site could not be read', { code: siteRow.error.code })
  const read = siteRow && !siteRow.error && siteRow.data ? siteFrom(siteRow.data, normaliseSiteUrl, hostOf) : null
  // STORY 5.20 — FR-H6's record of the member switches, re-checked on the way out; a site with no record carries none.
  // STORY 5.21 — and the snapshot Ghost's two surfaces are drawn from (FR-H5), on every linked site that is NOT
  // disconnected. One pure rule, `siteWith`, unit-tested beside `siteFrom`.
  // DW-273 (Story 5.24e): and the site's Ghost major, so the Paywall's untouched box is that major's own
  const site = siteWith(read, siteRow?.data?.site_settings, siteRow?.data?.ghost_version)

  /* STORY 7.12 — THE PROJECT'S LANGUAGE, ON THE CANVAS (FR-H5). The stored overrides `overrideRefusal` passes are handed to the
     editor, which renders them through the shim (`renderSection`'s `strings`); one it refuses stays off the canvas (its row on
     Translations says why, and the compile refuses it). A failed read is English, logged — the safe side the prefs read takes:
     the canvas shows the defaults and Translations, which throws on the same failure, stays the truth. The canvas faces are
     the language's script's (`packChoices`, `pairingChoices`): the files the theme ships for it (§D.b). */
  if (overridesRow.error) console.error('editorData: the translation overrides could not be read', { code: overridesRow.error.code })
  const language = project?.language ?? DEFAULT_LANGUAGE
  const script = scriptOf(language)

  return {
    docs,
    entries,
    postsPerPage: project?.posts_per_page ?? orbitWeekly.postsPerPage(),
    memberVisibility: Object.fromEntries(Object.values(entries).map((e) => [e.id, carriesMemberVisibility(e.id)])),
    pool: imagePool(),
    darkEnabled: project?.dark_enabled !== false,
    revision: project?.revision ?? 0,
    userId: user.id,
    autosave: profile.data?.autosave_enabled !== false,
    links: linkResources(),
    // the SAMPLE's own zone, as `/controls` and `/pilots` read it; the editor names the site's once it has answered
    timezone: orbitWeekly.site().timezone,
    site,
    plan,
    canvases,
    synthesized,
    templates,
    routes,
    ...(unreadListed === undefined ? {} : { unreadListed }),
    defaults,
    dropped,
    subjects,
    viewed,
    /* STORY 5.17 — A FAILED READ IS "NOBODY HOLDS IT", and it takes the same safe side `autosave_enabled` and the
       preview subjects take: a lock that cannot be read must not blank an editor over a row that decides nothing
       about the document. The client's own `acquire` on mount is the real decision either way — this is only what
       it paints with for the one round trip before that answer arrives. */
    lock: lock.error || !lock.data ? null : rowFrom(lock.data, Date.now()),
    // Story 6.4 — the pack in force may be one the project made (`packIdOf`), and its own packs come with it, validated
    preset: packIdOf(project?.style_pack ?? null),
    ownPacks: ownPacksOf(project?.style_pack ?? null),
    packs: packChoices(script),
    pairings: pairingChoices(script),
    pairingFaces: pairingGlyphFacesCss(canvasRouteOn((await headers()).get('host'))),
    siteAccent: siteAccentOf(siteRow?.data?.site_settings),
    settings: settingsRead(settingsRow),
    overrides: overridesRow.error ? {} : judgeOverrides(overridesRow.data ?? []).overrides,
    // Story 7.13 — a refused record opens on Ghost's defaults; its sentence is logged and said once on the screen
    ...cards,
    ship: shipStateOf({
      projectId,
      slug: project?.slug ?? '',
      language,
      rtlAckAt: project?.rtl_ack_at ?? null,
      overridden: !overridesRow.error && (overridesRow.data ?? []).length > 0,
      sites: sitesRows.error ? null : (sitesRows.data ?? []),
      linking: linkingRows.error ? null : (linkingRows.data ?? []),
      siteId: linked,
      site: siteRow && !siteRow.error ? siteRow.data : null,
      deploys: shipRows?.[0].error ? null : (shipRows?.[0].data ?? []),
      binding: shipRows?.[1].error ? null : (shipRows?.[1].data ?? null),
      // a failed read is "not live here" — Deploy only stays offered, and the server's own guard reads again
      liveHere: !shipRows?.[2].error && (shipRows?.[2].data?.[0] as { project_id?: unknown } | undefined)?.project_id === projectId,
      required: requiredTemplates(held),
    }),
  }
}

/** STORY 7.18a — SHIP IT'S STATE FROM THE STORED ROWS, the rule itself in `lib/deploy.ts` since Story 7.18b, where `node --test`
 *  reaches it (`read.test.ts`, DW-378) — re-exported here, beside the reads that feed it. */
export { shipStateOf }

/** Story 7.10 — a failed settings read is none, logged by code, never a black editor (the prefs read's safe side). */
function settingsRead(row: { data: unknown[] | null; error: { code?: string } | null }): StoredSetting[] {
  if (row.error) console.error('editorData: the custom settings could not be read', { code: row.error.code })
  return row.error ? [] : storedSettings(row.data)
}

/** STORY 7.12 — the linked site's address and stored settings (its `locale`, read by `settingsPatch`), through the caller's own
 *  session; `cache`d so Theme settings' layout (D6a's rail links into Ghost) and the Translations page share one query. A
 *  failed read is null, logged — the rail's Ghost links are absent and no notice is drawn, never a black page. */
export const linkedSiteOf = cache(async (siteId: string): Promise<{ url: string; site_settings: unknown } | null> => {
  const { data, error } = await (await supabaseServer()).from('sites').select('url, site_settings').eq('id', siteId).maybeSingle()
  if (error) console.error('projects/settings: the linked site could not be read', { code: error.code })
  return error ? null : data
})
