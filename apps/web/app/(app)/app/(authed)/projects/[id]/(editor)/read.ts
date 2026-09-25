import { cache } from 'react'
import { compilesTo, isPlaceable, orbitWeekly, type SectionRegistryEntry } from '@inflozo/library'
import { designate, isDesigned, isSynthesizable, parseDoc, synthesize, type DroppedRow, type Mode, type ProjectDoc } from '@inflozo/section-runtime'
import type { LinkResources } from '@/components/controls/link-picker'
import { imagePool, linkResources, referenceSwatches } from '@/lib/controls-review'
import { hostOf, normaliseSiteUrl } from '@/lib/connect-rule'
import { siteFrom, type EditorSite } from '@/lib/live-content'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, canvasesOf, fileOfKey, isUuid, templateKeyOf, type CanvasKey } from '@/lib/editor'
import { rowFrom, type LockRow } from '@/lib/lock'
import { resolveEntitlement } from '@/lib/entitlement'
import type { PlanId } from '@/lib/plan'
import { carriesMemberVisibility, pilot, pilotIds } from '@/lib/pilots'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import { readViewed, type Visitor } from '@/lib/view-as'

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
/** Story 5.19 — `posts_per_page` joins it: FR-H2's main feed is sized by the THEME's setting, never the sample's, and a
 *  secondary feed's Count starts there. SERVER TRUTH for the same reason; the column pre-exists with its `>= 1` check
 *  (`…complete_schema.sql:226-227`), so no migration and no Schema phase (R-99). */
export const projectOf = cache(async (id: string): Promise<Project | null> => {
  if (!isUuid(id)) return null
  const { data, error } = await (await supabaseServer()).from('projects').select('id, name, dark_enabled, revision, linked_site_id, posts_per_page').eq('id', id).maybeSingle()
  if (error) throw new Error(`the project could not be read (${error.code})`)
  return data
})

export type Project = { id: string; name: string; dark_enabled: boolean; revision: number; linked_site_id: string | null; posts_per_page: number }

/** The template file a stored key compiles into — `templateKeyOf`'s inverse. `custom:custom-x.hbs` names its own,
 *  which is what R-129's three membership canvases store under (Story 5.5 opened them, and this map already answered
 *  their shape). Every row of the project is checked, so a key with no `.hbs` of its own — `paywall` (5.20), `cards`
 *  (7.13) — throws for the whole editor the day its writer lands; the story that writes it extends this map in the
 *  same change (review, 2026-09-17). Story 5.16 is such a writer: a page-2 key compiles to the file `PAGE_TWO` names —
 *  `index` to `index.hbs`, and an archive's `tag-paged` and `author-paged` to the archive's own file. */
const fileOf = fileOfKey

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
  /** Story 5.6 — Background role's colours per MODE, so the panel's dots are what the canvas is painting */
  swatches: Readonly<Record<Mode, Readonly<Record<string, string>>>>
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
  /** Story 5.5 — the canvases this project offers, in D5b's row order; a conditional canvas is absent, not greyed */
  canvases: CanvasKey[]
  /** Story 5.5 — the canvas keys whose doc came from `synthesize`: D5a's marker, as server truth (AD-22) */
  synthesized: CanvasKey[]
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
  const [{ data, error }, { plan }, project, profile, prefs, lock, siteRow] = await Promise.all([
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
    linked === null ? null : sb.from('sites').select('url, title, content_key, disconnected_at').eq('id', linked).maybeSingle(),
  ])
  if (error) throw new Error(`the project's templates could not be read (${error.code})`)

  const docs: Record<string, ProjectDoc> = {}
  const entries: Record<string, SectionRegistryEntry> = {}
  for (const row of data ?? []) {
    const key = row.template_key as string
    const doc = parseDoc(row.doc, key)
    const file = fileOf(key)
    for (const [n, instance] of doc.instances.entries()) {
      const where = `${key} instance ${n} (${instance.instanceId}, ${instance.designId})`
      // Story 5.4, before the library is even asked: a treatment is chosen outside the canvas and never placed on one
      if (!isPlaceable(instance.designId)) {
        throw new Error(`${where}: that design is a treatment chosen outside the canvas, never placed on one`)
      }
      let entry = entries[instance.designId]
      try {
        entry ??= pilot(instance.designId)
      } catch (e) {
        throw new Error(`${where}: ${(e as Error).message}`)
      }
      // `compilesTo`, the library's one rule (Story 5.16): a Home design may sit on `index.hbs`, Home's page 2, because
      // Ghost hands the two files the same posts — so R-179's exact copy of a Home never blacks out this editor
      if (!compilesTo(entry.compileTarget, file)) {
        throw new Error(`${where}: the design compiles to ${entry.compileTarget.join(', ')}, never ${file}`)
      }
      entries[instance.designId] = entry
    }
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
  // no condition can be true yet, so this is every unconditional canvas — `lib/editor.ts`'s `CONDITIONAL` carries why
  const canvases = canvasesOf()
  const synthesized: CanvasKey[] = []
  const defaults: Record<string, ProjectDoc> = {}
  const dropped: Record<string, readonly DroppedRow[]> = {}
  for (const canvas of canvases) {
    const file = CANVASES[canvas].file
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

  /* STORY 5.19 — EVERY DOC LEAVES THROUGH THE MAIN-FEED RULE (AD-27(d)): on a paginated page exactly one visible feed
   * carries the flag. A doc written before the rule — the owner's "Pilot sections" Home, whose grid was seeded with no
   * flag, or a main feed duplicated before this story — is REPAIRED here, in what is handed to the editor, and stored
   * repaired with the next edit of that canvas. Reading alone writes nothing (AD-22). A doc that already satisfies the
   * rule comes back as the same object, so a valid designation is never moved. */
  for (const [key, doc] of Object.entries(docs)) docs[key] = designate(doc, fileOf(key), held)

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
  const site = siteRow && !siteRow.error && siteRow.data ? siteFrom(siteRow.data, normaliseSiteUrl, hostOf) : null

  return {
    docs,
    entries,
    postsPerPage: project?.posts_per_page ?? orbitWeekly.postsPerPage(),
    memberVisibility: Object.fromEntries(Object.values(entries).map((e) => [e.id, carriesMemberVisibility(e.id)])),
    pool: imagePool(),
    swatches: { light: referenceSwatches('light'), dark: referenceSwatches('dark') },
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
    defaults,
    dropped,
    subjects,
    viewed,
    /* STORY 5.17 — A FAILED READ IS "NOBODY HOLDS IT", and it takes the same safe side `autosave_enabled` and the
       preview subjects take: a lock that cannot be read must not blank an editor over a row that decides nothing
       about the document. The client's own `acquire` on mount is the real decision either way — this is only what
       it paints with for the one round trip before that answer arrives. */
    lock: lock.error || !lock.data ? null : rowFrom(lock.data, Date.now()),
  }
}
