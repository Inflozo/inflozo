import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { isPlaceable, orbitWeekly, type SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, parseDoc, type ProjectDoc } from '@inflozo/section-runtime'
import { Editor } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/editor'
import { designateAll, type EditorData } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/read'
import { ShellUserContext } from '@/components/shell/shell'
import { harnessCanvasSrc } from '@/lib/canvas'
import { hexOf, type PackRecord } from '@/lib/pack-edit'
import { ownPacksOf, packChoices, packFacesCss, packIdOf, pairingChoices, pairingGlyphFacesCss } from '@/lib/style-pack'
import { imagePool, linkResources, paywallSamples, samples } from '@/lib/controls-review'
import { CANVASES, canvasesOf, SITE, templateKeyOf } from '@/lib/editor'
import { HARNESS } from '@/lib/harness'
import { carriesMemberVisibility, pilot, pilotIds } from '@/lib/pilots'
import { harnessReread } from './actions'
import { standIns } from '../stand-ins'
import { GHOST_5_SITE, HARNESS_PROJECT, MEMBERS_OFF_SITE, SURFACES_LATER_SITE, SURFACES_SITE } from './sites'

/* ────────────────────────────────────────────── Story 5.9 — the keyboard harness (R-146, closing DW-167).
 *
 * THE REAL `Editor`, MOUNTED WITH FIXTURE PROPS, so a browser can open the editor with NO DATABASE — which is what
 * lets NFR-6(d)'s keyboard journey run as `pnpm keyboard`, its own step inside the `check` job `deploy` needs
 * (R-116). It is the trade `/pilots` has made since Story 4.5, and it is typed against `EditorData`: a prop the
 * editor gains and this page does not is a COMPILE ERROR rather than silent drift.
 *
 * IT DOES NOT EXIST UNLESS `INFLOZO_HARNESS=1`. The gate sets it on the `next dev` it boots and nothing in
 * production does, so `/harness/editor` answers "not found" there — asserted on the deployed site at Review.
 *
 * WHAT IT CANNOT PROVE is the deployed walk's, which R-82 requires of every story anyway: the read, the session, the
 * sync route and the CSP. A harness proves the wiring and never the stack.
 *
 * THE FIXTURE IS DERIVED FROM THE LIBRARY, never written down: every placeable pilot that compiles to the site file
 * becomes a site-wide section and every one that compiles to Home becomes a page section, each at its design's own
 * default content — the same shape `seed-editor-project.mjs` writes for the real "Pilot sections" project. So the
 * journey meets both kinds of singleton (FR-D5's shared header and an ordinary page section) the day the library
 * holds them, and gains whatever Epics 9 and 10 add without this file being edited (standing rule 4).
 *
 * WITH ONE ADDITION, AND IT IS STORY 5.11'S (R-158): THE LIBRARY HOLDS NO RING. Every category in
 * `packages/library/designs/` holds exactly one design, so `[` and `]` on a pilot can only ever give the same
 * design back and the journey would prove the keys are bound and nothing else. The three fixture designs of
 * `packages/library/fixtures/controls/` are one real ring — one category, one `bindingContext`, one
 * `compileTarget` — so they join the entries here and one section of that category joins the Home doc, and
 * `pnpm keyboard` walks a real swap on every commit. They are NOT the shipped library, so AD-35 is untouched;
 * the day Epic 9 fills a category the pilots carry their own rings and these two lines can go.
 *
 * It sits OUTSIDE `(authed)`, which is the whole reason it renders with no Supabase environment at all: `proxy.ts`
 * returns early when `SUPABASE_URL` is unset and `lib/supabase/server.ts` throws only when a client is really built,
 * so every route outside that group answers (executed 2026-09-19 — `next dev` ready in 307 ms, the marketing page
 * 200, every `(authed)` page 500).
 *
 * STORY 5.20 — A LAYOUT, SO THE WALK CAN CHANGE CANVAS. The editor lives here and its two pages render nothing —
 * `/app/harness/editor` is Home and `/app/harness/editor/<key>` every other canvas, the app's own `(editor)` shape — so
 * the Template switcher's push is a soft navigation the editor stays mounted across, exactly as on `/projects/<id>`
 * (`canvasBase` tells the editor where its canvases live). The harness also hands in the TWO STAND-IN PAYWALLS
 * (`packages/library/fixtures/paywall/`, R-158's shape), so the Paywall canvas has a ring to choose from, and ONE
 * REQUEST HEADER picks a linked site whose record says members are switched off (`x-inflozo-harness-site:
 * members-off`), so C3b's card and its Re-check are walked with no database: the Re-check is refused there, which is
 * 5.14's precedent for a write the harness cannot make. Its address answers nothing, so the canvas falls back to the
 * sample as a site that is not answering does (5.18); the card reads the record, never the Content API. A SECOND
 * header (`x-inflozo-harness-lock: reader`) opens the editor READING ALONG — another tab holds the lock, fresh — so R-192
 * is walked on the Paywall canvas too: the harness's own `acquire` reaches no database, and the state it opened with
 * stands (`lib/lock-client.ts`).
 *
 * STORY 5.22 — `x-inflozo-harness-dark: off` opens the fixture as a LIGHT-ONLY project (`dark_enabled` false), so the
 * compact editor's ⋯ menu is walked without its dark row, as the bar is without its sun.
 *
 * STORY 5.21 — A THIRD VALUE OF THE SITE HEADER (`x-inflozo-harness-site: surfaces`) picks a linked site whose snapshot
 * carries Ghost's two surfaces, so `pnpm keyboard` walks the strip and the button with no database and no Ghost: the
 * shims follow the CONNECTION, not the content pill, so a site that never answers still draws both while the canvas paints
 * the sample. The editor's re-read on open is refused here (no database), which leaves the stored snapshot drawn — except
 * under a FOURTH value, `surfaces-later` (DW-279): the same site with an EMPTY stored snapshot, whose re-read the harness's
 * own action (`actions.ts`, handed in as the editor's `reread`) answers with the full one, so a landed answer is seen to
 * redraw both. The fixtures are `sites.ts`. A FIFTH, `surfaces-gone` (R-215, the review of 5.24e), is the other way round: the
 * stored snapshot shows both and the re-read answers neither, so a row the answer no longer shows is seen let go. A SIXTH,
 * `ghost-5` (DW-273), is a site whose stored version is Ghost 5's, for the Paywall's box.
 *
 * STORY 5.23a — `x-inflozo-harness-home: <n>` builds Home as n sections CYCLING the designs Home is built from below (the
 * pilots that compile there and the fixture ring's first design), the main feed flagged on the first alone: the long
 * page FR-D14 and NFR-1 measure on, with no database. The keyboard journey asks for it to prove the keyed paint node for
 * node and to walk DW-215's Remix over several sections; `tools/perf/fps-trace.mjs` traces NFR-1 on it. Each names its
 * own n and where it comes from. Without the header the default fixture is untouched — every other stop counts on it,
 * which is DW-215's own reason for waiting.
 *
 * STORY 6.3 — `x-inflozo-harness-pack: <id>` is the project's STORED pack (DW-325): the editor opens in it — the canvas
 * document asked for in it, the card, the list, the previews and the swatches its — so a journey can open on a pack that is
 * not Paper. Read through `presetIdOf`, as `read.ts` reads the column, so an unknown id is Paper. Without it, Paper.
 * STORY 6.4 — `x-inflozo-harness-pack: custom-1` opens on a pack the project MADE: a fixture own record (Paper's renamed,
 * wearing Ocean's accent and on-accent, so the canvas visibly is not Paper and nothing in it is hard to read) stored under
 * `custom-1` and in force — the column as
 * `read.ts` reads it, through `packIdOf` and `ownPacksOf`. Every site header also supplies S7d's "From your site": the
 * sample's own accent, as a linked site's stored brand would.
 *
 * STORY 5.24e — `x-inflozo-harness-stand-ins: on` adds designs the shipped library does not hold yet (`../stand-ins.ts`):
 * a FOOTER, which the rule below places in the site doc after the header — so the band clamp (DW-187) has a band to hold —
 * and a POST CONTENT LAYOUT, so R-37's refusal can be met in the Section Picker (DW-207). Story 7.3 adds a MEMBERS PAGE,
 * placed by nothing here, so D5f's warning can be met on Signup. Never in `packages/library`.
 *
 * STORY 5.24d — THE MAIN FEED IS THE RULE'S, NOT THE HARNESS'S (DW-257): every doc leaves through `read.ts`'s
 * `designateAll`, the server door the editor's real read uses, and no instance is flagged here — so the post grid becomes
 * Home's main feed because the rule picks it, and a no-op door turns the main-feed journeys red. And THE SIGNED-IN USER
 * (DW-285): the harness sits outside the shell, so it hands a fixture user through the shell's own provider, and the
 * phone notice draws the avatar the deployed walk reads.
 */

export const metadata: Metadata = { title: 'Editor harness — Inflozo', robots: { index: false, follow: false } }

/** the most sections `x-inflozo-harness-home` may ask for — a ceiling on a request, not a count anything is measured on */
const LONG_HOME_MAX = 400

const instanceOf = (entry: SectionRegistryEntry) => ({
  instanceId: randomUUID(),
  layerName: `${entry.category.toUpperCase()} — ${entry.name}`,
  designId: entry.id,
  content: defaultContent(entry.contentSchema),
  controls: {},
  data: {},
  darkOverrides: {},
})

/** Through AD-27's ONE schema, exactly as `read.ts` and the seed do — so every field a later story defaults is
 *  defaulted here too (`isMainFeed` among them: `designateAll` below is what flags the main feed), and a fixture the real
 *  editor could not have stored throws at the harness rather than in the browser. */
const docOf = (key: string, entries: SectionRegistryEntry[]): ProjectDoc =>
  parseDoc({ schemaVersion: 1, instances: entries.map(instanceOf) }, key)

/** Story 5.20 — another tab's lock, just beaten: the reader's side of B5a, for R-192's walk */
const READER_LOCK: EditorData['lock'] = {
  holderSessionId: 'harness-another-tab',
  generation: 1,
  unsyncedEdits: 0,
  ageMs: 0,
  nudgeRequestedBy: null,
  nudgeAgeMs: null,
  request: null,
  beat: null,
}

export default async function EditorHarness({ children }: { children: ReactNode }) {
  if (!HARNESS) notFound()
  const asked = await headers()
  const siteAsked = asked.get('x-inflozo-harness-site')
  const readingAlong = asked.get('x-inflozo-harness-lock') === 'reader'
  const standing = asked.get('x-inflozo-harness-stand-ins') === 'on'

  const ring = samples()
  const entries = Object.fromEntries([
    ...pilotIds().filter(isPlaceable).map((id) => [id, pilot(id)] as const),
    ...ring.map((e) => [e.id, e] as const),
    // Story 5.20 — the stand-in paywalls: never placed (they are treatments), so `compiling` below never picks one up
    ...paywallSamples().map((e) => [e.id, e] as const),
    // Story 5.24e — the stand-ins, when asked for: after the pilots, so the footer is placed last
    ...(standing ? standIns().map((e) => [e.id, e] as const) : []),
  ])
  const placed = Object.values(entries).filter((e) => isPlaceable(e.id))
  const compiling = (file: string) => placed.filter((e) => e.compileTarget.includes(file))
  // the fixture ring rides with them: its designs compile to `home.hbs`, so `compiling` picks up the first of
  // the three and the journey has a section whose `[` and `]` really move
  const home = compiling(CANVASES.home.file).filter((e) => !ring.slice(1).some((r) => r.id === e.id))
  // Story 5.23a — the long Home, when asked for: n sections cycling the same designs in the same order
  // bounded (review, 2026-09-28): a header is a request, and one asking for millions of sections would have this process
  // build them — ten long Homes is more than any gate asks for, and a bigger figure is a mistake, refused
  const cycled = Number(asked.get('x-inflozo-harness-home'))
  if (Number.isFinite(cycled) && cycled > LONG_HOME_MAX) throw new Error(`x-inflozo-harness-home asks for ${cycled} sections; the harness builds at most ${LONG_HOME_MAX}`)
  const homeShown = Number.isInteger(cycled) && cycled > 0 && home.length > 0 ? Array.from({ length: cycled }, (_, n) => home[n % home.length]!) : home

  const docs = designateAll(
    {
      [SITE.key]: docOf(SITE.key, compiling(SITE.file)),
      [templateKeyOf('home')]: docOf(templateKeyOf('home'), homeShown),
    },
    (id) => entries[id],
  )

  // Story 6.4 — the project's stored `style_pack`, as the column would hold it for the pack header
  const packAsked = asked.get('x-inflozo-harness-pack')
  const choices = packChoices()
  const stylePack = packAsked === 'custom-1' ? { preset: 'custom-1', packs: { 'custom-1': harnessPack(choices) } } : { preset: packAsked }

  const data: EditorData = {
    docs,
    entries,
    // Story 5.19 — the project's posts per page, as `read.ts` hands it: derived from the sample, which is also `read.ts`'s
    // own fallback, never written down (review, 2026-09-25)
    postsPerPage: orbitWeekly.postsPerPage(),
    memberVisibility: Object.fromEntries(placed.map((e) => [e.id, carriesMemberVisibility(e.id)])),
    pool: imagePool(),
    // both halves of the map are walked: the sun is drawn, so `.` has something to press (R-135's other arm is the
    // deployed walk's, on a real Light-only project). Story 5.22: a FOURTH header (`x-inflozo-harness-dark: off`) opens a
    // Light-only project, so the journey proves ⋯ carries no dark row where the bar carries no sun (UX-DR3)
    darkEnabled: asked.get('x-inflozo-harness-dark') !== 'off',
    revision: 0,
    // IndexedDB is per ORIGIN, so the harness names its own database and never collides with a real session's
    userId: 'harness',
    autosave: false,
    links: linkResources(),
    timezone: orbitWeekly.site().timezone,
    plan: 'free',
    canvases: canvasesOf(),
    synthesized: [],
    defaults: {},
    dropped: {},
    // Story 5.13 — no stored preview subject, so every canvas resolves to its fixture. The harness proves the
    // keyboard wiring (R-146) and the subject binds no key, so there is nothing here for it to press.
    subjects: {},
    // Story 5.14 — no canvas has been looked at yet, so View as's menu dots every other visitor (R-169). The record's write fails here
    // (there is no database), which is the matrix's "Save refused" row: logged, never said, and the canvas unaffected.
    viewed: {},
    // Story 5.17 — NOBODY HOLDS THE LOCK, so the harness opens as the holder and every journey keeps its keys. Its
    // own `acquire` on mount reaches no database and answers nothing, which the client reads as "the server was not
    // reached": the state it opened with stands, and nothing about the lock is on screen (`lib/lock-client.ts`).
    lock: readingAlong ? READER_LOCK : null,
    // Story 5.18 — NO LINKED SITE, so the harness is the unlinked path — the story's control: the pill says "Sample
    // content" with no SOURCE group, and not one Content API request is made (`pnpm keyboard` walks exactly today's editor)
    // Story 5.20 — unless the members-off walk asks for its site by header (above), or Story 5.21's the surfaces one, or
    // DW-279's the surfaces-later one (`sites.ts`)
    // the review of 5.24e — `surfaces-gone` is the surfaces site whose re-read answers NEITHER surface (`actions.ts`), and
    // `ghost-5` a site on Ghost 5 (DW-273)
    site:
      siteAsked === 'members-off' ? MEMBERS_OFF_SITE
      : siteAsked === 'surfaces' || siteAsked === 'surfaces-gone' ? SURFACES_SITE
      : siteAsked === 'surfaces-later' ? SURFACES_LATER_SITE
      : siteAsked === 'ghost-5' ? GHOST_5_SITE
      : null,
    // Story 6.2 — a fresh project's pack, Paper, as `defaultStylePack` writes it; Story 6.3 — or the one the header names;
    // Story 6.4 — or the fixture pack the project made, read as `read.ts` reads the column
    preset: packIdOf(stylePack),
    ownPacks: ownPacksOf(stylePack),
    packs: choices,
    pairings: pairingChoices(),
    pairingFaces: pairingGlyphFacesCss('/app/harness/canvas'),
    siteAccent: siteAsked === null ? null : hexOf(orbitWeekly.site().accent_color),
  }

  // `canvasSrc` is the harness's own path: the app's `/canvas` keeps its session guard rather than having it
  // bypassed. It carries the build the same way the app's does (the owner's ruling of 2026-09-20) so the two differ
  // in the guard alone — `lib/canvas.ts` owns the token, and the route decides what may be kept.
  return (
    <>
      {/* Story 6.2 — the pack cells' faces, as the signed-in layout declares them, from the harness's own canvas route */}
      <style data-pack-faces>{packFacesCss('/app/harness/canvas')}</style>
      <ShellUserContext value={HARNESS_USER}>
        <Editor project={HARNESS_PROJECT} canvasSrc={harnessCanvasSrc()} canvasBase={HARNESS_BASE} reread={harnessReread} {...data} />
      </ShellUserContext>
      {children}
    </>
  )
}

/** Story 6.4 — the fixture pack the project made: Paper's record, renamed, wearing Ocean's light accent with Ocean's own
 *  words on it, so the pair holds 4.5:1 as Ocean's does — colours of the library's, so this file names none
 *  (`tokens.test.ts`) */
function harnessPack(choices: readonly { id: string; record: PackRecord }[]): PackRecord {
  const of = (id: string) => (choices.find((c) => c.id === id) ?? choices[0]!).record
  const paper = of('paper')
  const ocean = of('ocean').light
  return { ...paper, name: 'Harness Pack', light: { ...paper.light, accent: ocean.accent, onAccent: ocean.onAccent } }
}

/** Story 5.20 — where the harness's canvases live: its own two pages, never the app's `/projects/<id>` */
const HARNESS_BASE = '/app/harness/editor'

/** DW-285 — the signed-in user the shell would hand down, with no display name, as a fresh account has none */
const HARNESS_USER = { id: 'harness', email: 'harness@example.com', displayName: null }
