import { randomUUID } from 'node:crypto'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { isPlaceable, orbitWeekly, type SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, parseDoc, SYNTHESIS_DEFAULTS, type ProjectDoc } from '@inflozo/section-runtime'
import { Editor } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/editor'
import type { EditorData } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/read'
import { harnessCanvasSrc } from '@/lib/canvas'
import { imagePool, linkResources, referenceSwatches, samples } from '@/lib/controls-review'
import { CANVASES, canvasesOf, SITE, templateKeyOf } from '@/lib/editor'
import { HARNESS } from '@/lib/harness'
import { carriesMemberVisibility, pilot, pilotIds } from '@/lib/pilots'

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
 */

export const metadata: Metadata = { title: 'Editor harness — Inflozo', robots: { index: false, follow: false } }

const HARNESS_PROJECT = { id: '00000000-0000-4000-8000-000000000009', name: 'Pilot sections' }

/** STORY 5.16 — CI'S ONE MAIN FEED. Page 2 is offered only on a page whose main feed runs past one page (R-176), and
 *  nothing in this fixture carried `isMainFeed` — the real "Pilot sections" was seeded before the flag, so the owner's
 *  own Home has none until Story 5.19. The Home design the Synthesis Defaults designate as the feed (the post grid) is
 *  marked here, DERIVED from that table rather than named, so `pnpm keyboard` walks page 2 on every commit. */
const MAIN_FEED = SYNTHESIS_DEFAULTS['home.hbs']?.find((row) => row.isMainFeed === true)?.designId

const instanceOf = (entry: SectionRegistryEntry, key: string) => ({
  instanceId: randomUUID(),
  layerName: `${entry.category.toUpperCase()} — ${entry.name}`,
  designId: entry.id,
  content: defaultContent(entry.contentSchema),
  controls: {},
  data: {},
  darkOverrides: {},
  isMainFeed: key === templateKeyOf('home') && entry.id === MAIN_FEED,
})

/** Through AD-27's ONE schema, exactly as `read.ts` and the seed do — so every field a later story defaults is
 *  defaulted here too, and a fixture the real editor could not have stored throws at the harness rather than in the
 *  browser. */
const docOf = (key: string, entries: SectionRegistryEntry[]): ProjectDoc =>
  parseDoc({ schemaVersion: 1, instances: entries.map((entry) => instanceOf(entry, key)) }, key)

export default function EditorHarness() {
  if (!HARNESS) notFound()

  const ring = samples()
  const entries = Object.fromEntries([
    ...pilotIds().filter(isPlaceable).map((id) => [id, pilot(id)] as const),
    ...ring.map((e) => [e.id, e] as const),
  ])
  const placed = Object.values(entries)
  const compiling = (file: string) => placed.filter((e) => e.compileTarget.includes(file))

  const docs: Record<string, ProjectDoc> = {
    [SITE.key]: docOf(SITE.key, compiling(SITE.file)),
    // the fixture ring rides with them: its designs compile to `home.hbs`, so `compiling` picks up the first of
    // the three and the journey has a section whose `[` and `]` really move
    [templateKeyOf('home')]: docOf(templateKeyOf('home'), compiling(CANVASES.home.file).filter((e) => !ring.slice(1).some((r) => r.id === e.id))),
  }

  const data: EditorData = {
    docs,
    entries,
    // Story 5.19 — the project's posts per page, as `read.ts` hands it: derived from the sample, which is also `read.ts`'s
    // own fallback, never written down (review, 2026-09-25)
    postsPerPage: orbitWeekly.postsPerPage(),
    memberVisibility: Object.fromEntries(placed.map((e) => [e.id, carriesMemberVisibility(e.id)])),
    pool: imagePool(),
    swatches: { light: referenceSwatches('light'), dark: referenceSwatches('dark') },
    // both halves of the map are walked: the sun is drawn, so `.` has something to press (R-135's other arm is the
    // deployed walk's, on a real Light-only project)
    darkEnabled: true,
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
    lock: null,
    // Story 5.18 — NO LINKED SITE, so the harness is the unlinked path — the story's control: the pill says "Sample
    // content" with no SOURCE group, and not one Content API request is made (`pnpm keyboard` walks exactly today's editor)
    site: null,
  }

  // `canvasSrc` is the harness's own path: the app's `/canvas` keeps its session guard rather than having it
  // bypassed. It carries the build the same way the app's does (the owner's ruling of 2026-09-20) so the two differ
  // in the guard alone — `lib/canvas.ts` owns the token, and the route decides what may be kept.
  return <Editor project={HARNESS_PROJECT} canvasSrc={harnessCanvasSrc()} {...data} />
}
