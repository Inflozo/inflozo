/* ─────────────────────────────────────────── Story 5.14 — VIEW AS, AND THE NUDGE THAT NAMES WHAT I HAVE NOT LOOKED AT.
 *
 * FR-D16 at the surface. Everything the toggle, its menu, its marker and the panel's caption decide that is not a
 * pixel lives here: the three visitors, the words S4a and S4d draw, the sentence the live region says, and R-167's
 * rule for when a page's "looked at" record runs out.
 *
 * PURE, AND ITS ONLY IMPORTS ARE THE LIBRARY'S VOCABULARY AND THE URL SCHEME, because `node --test` strips types but
 * cannot load a `.tsx` (`lib/device.ts`, `lib/ring.ts` and `lib/preview-subject.ts` are the standing precedent,
 * `kit-button.test.ts:6-7` the reason). `view-as.test.ts` asserts the I/O matrix's rows over it.
 *
 * THE RENDER IS NOT HERE. Story 4.10 built it: `RenderInput.member` and `gateMembers`, which on the canvas REMOVES an
 * element gated to another visitor — which is why a change of visitor is a repaint and never 5.6's re-stamp. The
 * editor hands the visitor to `renderSection`'s existing `member` option, the one door every canvas surface paints
 * through, and nothing renders a visitor its own way.
 *
 * VIEW AS IS A MODE (`EXPERIENCE.md:230`): session state beside the mode and the device, never in the URL, never
 * stored, back to Anonymous on reload. What IS stored is the per-canvas record of which visitors have been looked at,
 * in `project_template_prefs.member_states_viewed` — the column AD-22 names for exactly this, which never enters the
 * doc, the journal or `⌘Z`.
 */

import { MEMBER_STATES } from '@inflozo/library'
import { SITE } from './editor.ts'

/** A visitor the canvas can be previewed as. `everyone` is an AUDIENCE — R-124's Member visibility value — and never
 *  a visitor: nobody visits a site as "everyone". */
export type Visitor = Exclude<(typeof MEMBER_STATES)[number], 'everyone'>

/** The three visitors, DERIVED from the library's closed member states in their own order (standing rule 4). Ghost's
 *  rule is `paid: status !== 'free'` (`update-local-template-options.js`, identical on both majors), so `comped` and
 *  Ghost 6's `gift` both preview as Paid — which is why the menu offers exactly three rows (B9: "only"). */
export const VISITORS: readonly Visitor[] = MEMBER_STATES.filter((s): s is Visitor => s !== 'everyone')

/** S4a's trigger label (`S4 Editor.dc.html:33`). */
export const LABEL = 'View as'

/** S4a's trigger value per visitor. The frame names the first visitor twice over (R-74, built as drawn): the trigger
 *  says **Anonymous**, as S4a, FR-D16 and B9 all do, while S4d's menu row says **Logged out user** — Story 5.13 built
 *  D5e's mixture of words the same way. */
export const VALUE: Readonly<Record<Visitor, string>> = { anonymous: 'Anonymous', free: 'Free member', paid: 'Paid member' }

/** S4d's menu rows (`S4 Editor.dc.html:401-403`), title and caption, verbatim. */
export const ROWS: Readonly<Record<Visitor, { title: string; caption: string }>> = {
  anonymous: { title: 'Logged out user', caption: 'Not signed in' },
  free: { title: 'Free member', caption: 'Signed in, no subscription' },
  paid: { title: 'Paid member', caption: 'Sees members-only content' },
}

/** S4d's menu heading (`:400`), drawn uppercase by CSS so the words stay a sentence. */
export const HEADING = 'Preview as'

/** The marker's own word on an unviewed row of the menu — S4d draws a COUNT, and FR-D16 asks for NAMES, so each row
 *  still to look at carries the marker's chip with its word. */
export const NOT_VIEWED = 'Not viewed'

/** What the canvas is previewing, in a sentence. R-124's caption and the live region read this ONE list — it moved
 *  here from `sidebar.tsx`, where it was written when the visitor was a constant. */
export const PREVIEWING: Readonly<Record<Visitor, string>> = {
  anonymous: 'a visitor who is not signed in',
  free: 'a free member',
  paid: 'a paying member',
}

/** The polite announcement a choice makes, through `#editor-said` — the editor's one live region, never a toast. */
export const VIEW_AS_SAID = (v: Visitor): string => `The canvas is previewing ${PREVIEWING[v]}.`

/** A stored record, trusted for nothing: the known visitors it holds, in canonical order, each once. The column is
 *  `text[]` with no CHECK, so anything else in it — `everyone`, `comped`, a typo — is a value nobody in the product
 *  wrote, and it is dropped on read (the matrix's "Stored junk" row). */
export const readViewed = (raw: unknown): Visitor[] =>
  Array.isArray(raw) ? VISITORS.filter((v) => raw.includes(v)) : []

/** The record once `v` has been looked at. THE SAME ARRAY when `v` is already in it, so the caller can tell by
 *  identity that nothing changed and write nothing. */
export const seen = (record: readonly Visitor[], v: Visitor): readonly Visitor[] =>
  record.includes(v) ? record : VISITORS.filter((x) => x === v || record.includes(x))

/** The visitors this canvas has not been looked at as, in canonical order — what the marker counts and the menu names. */
export const unviewed = (record: readonly Visitor[]): Visitor[] => VISITORS.filter((v) => !record.includes(v))

/** S4d's marker (`:405`): "2 not viewed", or NOTHING at zero — the marker is absent, never a "0" (UX-DR3). */
export const markerWords = (n: number): string | null => (n > 0 ? `${n} not viewed` : null)

/** The per-canvas records, keyed by `template_key` as the docs are. */
export type Viewed = Readonly<Record<string, readonly Visitor[]>>

/**
 * R-167 (owner, 2026-09-21): ANY CHANGE TO A PAGE MAKES ITS OTHER VISITORS UNVIEWED AGAIN. This is the one place the
 * rule is decided, and `commit()` and `restore()` in `editor.tsx` are its only callers — so undo and redo are changes,
 * and a hydrate, which calls neither, is not.
 *
 * - A change to a canvas's doc leaves that canvas viewed only as the visitor on screen.
 * - A change to the SITE doc — the header or footer, which appear on every page — does the same for the canvas on
 *   screen, and empties every other canvas's record.
 * - A change to a canvas that is NOT on screen (an undo can restore any doc the journal holds) leaves it viewed as
 *   nobody: the visitor on screen is looking at another page. "Viewed only as the visitor on screen" of a page that is
 *   not on screen is the empty record.
 *
 * RETURNS ONLY THE RECORDS THAT CHANGE, so the caller writes exactly those rows: a canvas already at `[visitor]`, an
 * empty record, and a canvas with no record at all are not returned.
 */
export function afterChange(records: Viewed, touched: string, onScreen: string, visitor: Visitor): Record<string, Visitor[]> {
  const changed: Record<string, Visitor[]> = {}
  const becomes = (key: string, next: Visitor[]) => {
    const was = records[key] ?? []
    if (was.length !== next.length || was.some((v, i) => v !== next[i])) changed[key] = next
  }
  if (touched === SITE.key) {
    for (const key of Object.keys(records)) if (key !== onScreen) becomes(key, [])
    becomes(onScreen, [visitor])
  } else becomes(touched, touched === onScreen ? [visitor] : [])
  return changed
}
