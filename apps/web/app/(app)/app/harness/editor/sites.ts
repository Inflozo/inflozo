import { orbitWeekly } from '@inflozo/library'
import type { EditorData } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/read'
import { storedSurfaces, type Surfaces } from '@/lib/probe-rule'

/* ────────────────────────────── THE KEYBOARD HARNESS'S FIXTURES — the project and the linked sites its headers pick.
 *
 * In a module of their own because two files read them: the layout hands one to the editor, and since DW-279 the
 * harness's own re-read (`actions.ts`, a `'use server'` file, which may export only async functions) answers from them.
 *
 * Every site's address is `https://127.0.0.1:9` — port 9 is `discard`, so nothing answers it. The harness's policy is
 * `connect-src 'self' https:`, so the editor's Content API reads ARE made, and fail — which is a site that is not
 * answering (5.18), and why the canvas paints the sample — and a journey's `page.route` can answer them instead (DW-257). */

export const HARNESS_PROJECT = { id: '00000000-0000-4000-8000-000000000009', name: 'Pilot sections' }

/** Story 5.20 — the linked site the members-off walk previews: readable in shape, answering nothing, with a record whose
 *  Subscription access is Nobody */
export const MEMBERS_OFF_SITE: EditorData['site'] = {
  title: 'Harness site',
  origin: 'https://127.0.0.1:9',
  key: 'harness',
  members: { signup_access: 'none', paid_enabled: false },
}

/** Story 5.21 — the snapshot carrying Ghost's announcement bar and Portal's button (FR-H5): the recorded fixture's words
 *  plus a bold word and a link, on the sample's accent, to logged-out visitors and free members, and the button on in its
 *  default look. Through `storedSurfaces`, the one reader `read.ts` uses, so the harness can only hold a snapshot the
 *  product could have read. No members record, so the button is not checked against one. */
export const SURFACES: Surfaces = storedSurfaces({
  announcement: {
    content: '<p>Fixture announcement — <strong>seeded</strong> for <a href="https://ghost.org/">VERIFY 21</a>.</p>',
    background: 'accent',
    visibility: '["visitors","free_members"]',
  },
  portal_button: true,
  portal_button_source: 'probe',
  portal_button_style: 'icon-and-text',
  portal_button_signup_text: 'Subscribe',
  // the sample's own accent, so the harness names no colour of its own (`tokens.test.ts`)
  brand: { accent: orbitWeekly.site().accent_color, nav: [] },
})

/** Story 5.21 — the linked site whose stored snapshot is `SURFACES` (`x-inflozo-harness-site: surfaces`) */
export const SURFACES_SITE: EditorData['site'] = { title: 'Harness site', origin: 'https://127.0.0.1:9', key: 'harness', surfaces: SURFACES }

/** DW-279 — the same site whose STORED snapshot is empty (`x-inflozo-harness-site: surfaces-later`): it opens drawing
 *  neither surface, and the re-read on open answers `SURFACES` (`actions.ts`), so a journey sees a landed answer redraw
 *  them — the one thing a database-less harness could not see before. */
export const SURFACES_LATER_SITE: EditorData['site'] = { title: 'Harness site', origin: 'https://127.0.0.1:9', key: 'harness', surfaces: storedSurfaces({}) }
