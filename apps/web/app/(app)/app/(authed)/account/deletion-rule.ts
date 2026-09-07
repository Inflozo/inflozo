// RELATIVE, AND WITH THE EXTENSION, like every other plain module a test reaches
// (`email-change-rule.ts` imports `../../sign-in/email.ts` the same way): `node --test` strips
// types but does not read tsconfig `paths`, so an `@/` here would resolve under `next build` and
// throw `ERR_MODULE_NOT_FOUND` the moment `deletion-rule.test.ts` imported this file.
import { matchesName } from '../../../../../lib/projects.ts'

/**
 * FR-A5'S DELETION WINDOW, as a plain module beside the actions — because a `'use server'` file
 * may export only async functions (`email-change-rule.ts`, `passkey-name-rule.ts` and
 * `signed-out.ts` are here for the same reason). Pure, so `node --test` holds every sentence the
 * dialog can say, every shape the date takes, and both halves of the URL contract.
 *
 * NOTHING HERE DECIDES ANYTHING THE DATABASE DECIDES. `DELETION_WINDOW_DAYS` is a COPY of the
 * `interval '14 days'` in `supabase/migrations/20260907150000_account_deletion_window.sql`, which
 * is the only writer of `purge_after`; `deletion-rule.test.ts` reads that file back and asserts
 * the two agree, so a change to one that misses the other fails the gate rather than leaving the
 * screen quietly lying about the date the database will actually act on.
 */

/** S12c's own phrase, drawn in the frame's mono chip (`S12 Billing.dc.html:166`). */
export const DELETE_PHRASE = 'delete my account'

/**
 * The typed confirm, and it is `lib/projects.ts`'s ONE rule rather than a second one: trimmed,
 * then EXACT. "Delete My Account" is not the phrase, which is the whole point of typing it. The
 * dialog runs this at the submit and the action runs it again on arrival — the client greys the
 * button, the server never trusts it.
 */
export const matchesPhrase = (typed: string): boolean => matchesName(typed, DELETE_PHRASE)

/**
 * FR-A5's fourteen days. Written HERE for the sentence and the copy, and in the migration for the
 * database; the source-reading test in `deletion-rule.test.ts` is what keeps them one number.
 */
export const DELETION_WINDOW_DAYS = 14

/**
 * The migration this module's window is a copy of, written relative to `apps/web/` — the
 * directory the test that reads it sits in. It is here rather than in the test so that a moved
 * or renamed migration is a change to the thing that names it, not a silently skipped assertion.
 */
export const PURGE_WINDOW_DOC = '../../supabase/migrations/20260907150000_account_deletion_window.sql'

/**
 * S12c's body sentence, with the counts DERIVED from the account rather than drawn.
 *
 * The frame ends "This cannot be undone.", which would be untrue at the moment it is read: for
 * fourteen days it very much can be. The PRD decides behaviour (R-74's scope), so the clause
 * survives as "after that" and the window is named in the first line — the one place the user is
 * told how long they have before they commit to it.
 *
 * THREE SHAPES AND NO MORE: many projects, exactly one, and an account with nothing in it — which
 * is also what a count that could not be read falls back to (`page.tsx`), because "0 projects"
 * would be a claim and "everything in your account" is true either way.
 */
export function deletionSentence(projects: number, assets: number, days = DELETION_WINDOW_DAYS): string {
  const tail = `Your live Ghost sites stay online. Until then, signing in restores everything — after that, it cannot be undone.`
  if (projects < 1) return `Everything in your account will be permanently deleted in ${days} days. ${tail}`
  const owned = projects === 1 ? 'Your 1 project, its' : `All ${projects} projects, their`
  const stored = `${assets} ${assets === 1 ? 'asset' : 'assets'}`
  return `${owned} full version history and ${stored} will be permanently deleted in ${days} days. ${tail}`
}

/**
 * The deadline, in the app's one date shape: `addedLabel`'s and `updatedLabel`'s — a fixed locale
 * and UTC, so the server's render and a client's re-render cannot disagree about which day it is.
 *
 * ponytail: server UTC; the viewer's zone the day a late-evening deletion reads a day early.
 */
export function deadlineLabel(purgeAfter: string | Date): string {
  const when = purgeAfter instanceof Date ? purgeAfter : new Date(purgeAfter)
  if (Number.isNaN(when.getTime())) return 'the date in your email'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(when)
}

/**
 * `site_snapshots.storage_path` holds `site-snapshots/{userId}/{siteId}/…` — the bucket name and
 * then the key (schema `:194`). The Storage API takes the two separately: `.from('site-snapshots')
 * .createSignedUrl(key)`. Leaving the prefix on asks for `site-snapshots/site-snapshots/…`, which
 * answers "Object not found" and looks exactly like a missing file.
 *
 * ONE PLACE STRIPS IT. Story 2.6's purge and E3 both walk the same column and both import this.
 */
export const SNAPSHOT_BUCKET = 'site-snapshots'
export const snapshotObjectKey = (storagePath: string): string =>
  storagePath.replace(new RegExp(`^${SNAPSHOT_BUCKET}/`), '')

/**
 * THE WINDOW'S URL CONTRACT, both halves in one module, in `signed-out.ts`'s shape and for its
 * reason: the key was shared there and the VALUE was not, so changing one left every check green
 * and the owner's sentence gone. A value and a reader, and the test walks the round trip.
 */
export const RESTORE_PATH = '/restore'
export const RESTORED = 'restored'
export const RESTORED_VALUE = '1'
export const RESTORED_PATH = `/?${RESTORED}=${RESTORED_VALUE}`

/** What the dashboard asks of `searchParams[RESTORED]`. A repeated key arrives as an array. */
export const isRestored = (value: string | string[] | undefined) => value === RESTORED_VALUE

/* The five sentences, in S12's voice. `actions.ts`'s `MESSAGES` spreads them so neither the
   action nor the card keeps a second copy. */
export const WRONG_PHRASE = `Type ${DELETE_PHRASE} exactly.`
export const DELETE_FAILED = "We couldn't delete your account just now. Try again in a moment."
export const RESTORE_FAILED = "We couldn't restore your account just now. Try again in a moment."
export const WINDOW_CLOSED = `The ${DELETION_WINDOW_DAYS} days have ended and this account is being deleted.`
export const RESTORED_SENTENCE = 'Welcome back. Your account is restored — nothing was deleted.'
