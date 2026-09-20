/* ─────────────────────────────────────────── Story 5.12 — SITE REMIX, AS DATA (FR-D17, FR-D13, FR-D19).
 *
 * WHAT WOULD MOVE, AND NOTHING ELSE. This module decides the picks; `editor.tsx` folds them into one next doc
 * through `switchDesign` and ONE `commit`, so a whole-page re-roll is one journal entry and one `⌘Z` (AD-15,
 * AD-16, FR-D17's single-step undo). Nothing here writes a doc and nothing here re-implements a rule:
 *
 *   — WHICH designs a section may become is the library's `ringFor`, handed in as `ringAt` (standing rule 3), so
 *     Remix cannot land a section on a resource its template does not have and a non-placeable treatment is
 *     skipped by construction — `ringFor` answers `[]` for one.
 *   — A DIFFERENT member of that ring is `shuffleTo` (`lib/ring.ts`, Story 5.11), one call per section, rather
 *     than a second "a different one of these" written beside it.
 *   — WHAT CARRIES, PARKS AND DEFAULTS is `switchDesign`'s, which every pick goes through.
 *
 * R-161 (owner, 2026-09-20) SCOPES IT TO THE CANVAS YOU ARE ON: the caller hands in ONE doc's instances, so the
 * shared header and footer are never re-rolled, because including them means a second doc and therefore a second
 * `⌘Z`. B8's "Include the header and footer" tick-box and its "Every page" row are ABSENT, not greyed (UX-DR3).
 *
 * NO RANDOMNESS OF ITS OWN (AD-1): `random` is handed in, exactly as `shuffleTo` takes it — so the picks are
 * testable and the caller owns the entropy.
 *
 * PURE, and its one import is `lib/ring.ts`, which is itself importless — so `node --test` reaches all of it
 * (`remix.test.ts`; `lib/keymap.ts` over `lib/device.ts` is the standing precedent, and the reason is that
 * `node --test` strips types but cannot load a `.tsx`).
 *
 * COUNTS ARE DERIVED, NEVER WRITTEN DOWN (standing rule 4): the number the confirm names is the number of picks,
 * because `remixable` below IS `remixPicks`. The dice cannot say six and move five.
 */

import { shuffleTo } from './ring.ts'

/** A section as Remix reads it — a `DocInstance` satisfies it, and so does anything carrying the two fields. */
export type RemixPlaced = { instanceId: string; designId: string }

/** One section's re-roll. `from` rides along so the caller needs no second lookup to find the ring to switch on. */
export type RemixPick = { instanceId: string; from: string; to: string }

/**
 * Every section that WOULD move, and where to. One `shuffleTo` over the section's own ring; a ring shorter than
 * two — and a ring that does not hold the design the section names, which is a design the library no longer has —
 * is skipped, because there is nowhere for it to go (`shuffleTo` answers null for both).
 */
export function remixPicks(
  placed: readonly RemixPlaced[],
  ringAt: (designId: string) => readonly { id: string }[],
  random: () => number,
): RemixPick[] {
  const picks: RemixPick[] = []
  for (const instance of placed) {
    const ring = ringAt(instance.designId)
    const to = shuffleTo(ring.length, ring.findIndex((e) => e.id === instance.designId), random)
    const landing = to === null ? undefined : ring[to]
    if (landing) picks.push({ instanceId: instance.instanceId, from: instance.designId, to: landing.id })
  }
  return picks
}

/**
 * THE FOLD: every pick through ONE switch into ONE next doc, or the first refusal and nothing at all (FR-D9's
 * "never half-applying"). It lives here, pure, so both halves of FR-D17's promise are testable off the editor:
 * the caller commits what this returns ONCE, so N picks are one journal entry, and a refusal on the last pick
 * leaves the doc it was handed untouched. `switchOne` is `switchDesign`, handed in (standing rule 3).
 */
export function remixFold<D>(
  doc: D,
  picks: readonly RemixPick[],
  switchOne: (doc: D, pick: RemixPick) => D | string,
): D | string {
  let next = doc
  for (const pick of picks) {
    const written = switchOne(next, pick)
    if (typeof written === 'string') return written
    next = written
  }
  return next
}

/** How many sections COULD move — the number the confirm names. It is the picks themselves, counted, so the
 *  sentence and the act can never disagree; the draw is irrelevant to the count, which is why it is handed a
 *  constant rather than a source of entropy. */
export const remixable = (
  placed: readonly RemixPlaced[],
  ringAt: (designId: string) => readonly { id: string }[],
): number => remixPicks(placed, ringAt, () => 0).length

/** The dice is ICON-ONLY (R-163), so its words are its accessible name and its hover title, through
 *  `DESIGN.md:534-536`'s carve-out — the one R-132's mode button, R-136's moon badge and R-159's Shuffle use.
 *  The chip is part of the words, so a screen reader hears the key it could have pressed instead. */
export const REMIX_WORDS = 'Site Remix — ⇧R'

const sections = (n: number) => `${n} ${n === 1 ? 'section' : 'sections'}`

/** B8's own sentence (`B Missing Surfaces.dc.html:1591`), with the count derived and the canvas named — R-161
 *  re-rolls the canvas you are looking at, so the dialog says which one rather than "this site". */
export const remixAsk = (n: number, canvas: string): string =>
  `Re-rolls ${sections(n)} on ${canvas} to a different design in its own category. ` +
  'Your text, images and settings stay — only the arrangements change.'

/** B8's footer line, kept because it is the promise the coral button is sold on. Shown only where it is TRUE:
 *  `/controls` stores nothing and has no history to step back through (R-162). */
export const UNDO_NOTE = 'One undo, always available'

/** R-12's shape for a control at its floor, `ONE_DESIGN`'s sibling: where no section can change, the dialog says
 *  so in one sentence and offers Close alone — nothing is greyed and nothing is written. */
export const NOTHING_TO_REMIX =
  'Every section here is the only design its category has so far, so there is nothing to remix yet. More are coming.'

/** UX-DR12's polite line, spoken through `#editor-said`. B8 drew a toast with an Undo chip; EXPERIENCE.md:541
 *  makes the count a POLITE canvas-status announcement instead, and R-143 already gave undo its one seat. */
export const remixSaid = (n: number, canvas: string): string => `Remixed ${sections(n)} on ${canvas}.`
