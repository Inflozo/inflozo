import type { ProjectDoc } from '@inflozo/section-runtime'

/* THE JOURNAL, THE INDICATOR AND THE BACKOFF, AS PURE RULES (Story 5.8).
 *
 * Every rule that can be got wrong lives here, in a `.ts` `node --test` can import — the standing precedent
 * `lib/device.ts` and `lib/round-trip.ts` set, and for the same reason: `node --test` strips types but cannot load a
 * `.tsx`, so a rule that lives in `editor.tsx` is a rule no test can reach.
 *
 * ONE GESTURE = ONE TRANSACTION = ONE UNDO STEP = ONE EDIT (AD-16). `commit()` is the editor's only door to the
 * session's docs and therefore the only caller of `append` below — so a Variant Shuffle (5.11) and a Style Pack change
 * (6.3's `commitPack`, through the same read-only guard) inherit the rule by going through that door. AD-16's other half is negative and is
 * kept by construction: nothing here counts OPERATIONS, and no count of any kind is rendered.
 *
 * THE RECORD IS `{ seq, txn, docKey, before, after }` — `addendum.md` §AD4 hands the record's shape to the Architect
 * and keeps only the transaction id load-bearing, and it survives. A whole-doc before/after beats an inverse-op log
 * here for three reasons the spec's Design Notes set out: one transaction touches exactly one doc, so an entry is one
 * template's JSON; FR-D9's "never half-applying" is then one check before one assignment; and FR-D9's parked value
 * comes back free, because the doc that comes back is the doc that was there.
 *
 * STORY 6.3 — A STYLE PACK CHANGE IS AN EDIT TOO (FR-D9, `addendum.md` §AD1, AD-16), and it rides this journal under its
 * own key, `PACK_KEY`, which is never a template key: its entry's `before` and `after` are PRESET IDS, not docs, because
 * the editor writes `style_pack.preset` alone (`brand` is the Sites page's). The flush sends the pending preset with the
 * pending docs in ONE `sync_project_doc` call, so one compare-and-set and one revision cover both. AND A TRANSACTION MAY
 * NOW HOLD MORE THAN ONE ENTRY (R-161's `txn`-grouped undo, which the record's shape anticipated): Site Remix's Both
 * re-rolls the canvas's doc and the pack as ONE edit, so undo and redo take the head's whole transaction, `DEPTH` counts
 * transactions, and a trim never splits one. A doc entry keeps its stored shape, so every persisted journal stays valid.
 *
 * TWO PIECES OF STATE DO TWO DIFFERENT JOBS, and collapsing them is the bug this comment exists to prevent.
 * `synced` is a WATERMARK over `seq` and answers AD-16's question — how many EDITS has the server not been told
 * about. `pending` is the set of DOC KEYS whose content differs from what the server last accepted, and answers the
 * only question a flush asks. They come apart at undo: an undo changes the document without appending an edit, so the
 * watermark does not move and `pending` does — and a design that drove the flush off the watermark alone would never
 * send an undo, which is work silently lost.
 */

/** FR-D9's depth. A DEFAULT WITH RATIONALE (`addendum.md` §AD4), owned by the Architect — not behaviour to change
 *  without the owner. It counts EDITS, which since Story 6.3 are transactions (one may hold a doc and the pack). */
export const DEPTH = 100

/** STORY 6.3 — the journal key a Style Pack change is recorded under. Never a template key (`sync/route.ts`'s
 *  `TEMPLATE_KEY` refuses it), so it can never be sent as a doc. */
export const PACK_KEY = 'style-pack'

/** One entry of a transaction: the touched doc either side of it — or, under `PACK_KEY`, the preset id either side. */
export type JournalEntry = {
  seq: number
  /** the transaction id §AD4 makes load-bearing — opaque here, never displayed, and the unit undo and the count read */
  txn: string
  /** the `project_templates.template_key` this entry touched, or `PACK_KEY` */
  docKey: string
  before: ProjectDoc | string
  after: ProjectDoc | string
}

/** Is this the pack's entry — a preset id either side, never a doc? */
const isPack = (e: { docKey: string }) => e.docKey === PACK_KEY

export type Journal = {
  entries: readonly JournalEntry[]
  /** how many entries at the TAIL are undone — the pointer, expressed as a distance from the head */
  undone: number
  /** the highest `seq` the server has accepted. AD-16's count is measured above this. */
  synced: number
  /** THE ONLY thing a flush reads: each doc key whose content differs from the server's, against the `stamp` of the
   *  change that made it so. The stamp is what makes a flush safe to run CONCURRENTLY with editing — a key edited
   *  again while the request was in flight has a higher stamp than the one that was sent, so the success does not
   *  clear it and the newer content goes up next time. A plain set of keys loses that edit silently. */
  pending: Readonly<Record<string, number>>
  /** monotonic, bumped by every append, undo and redo — the clock `pending` is stamped against */
  stamp: number
  nextSeq: number
}

export const EMPTY_JOURNAL: Journal = { entries: [], undone: 0, synced: 0, pending: {}, stamp: 0, nextSeq: 1 }

/** Is anything owed to the server? The matrix's "The timer, nothing unsynced" row is this answering false. */
export const unsynced = (j: Journal) => Object.keys(j.pending).length > 0

/** The highest `seq` the journal holds — the watermark a successful flush moves to. */
export const maxSeq = (j: Journal) => j.entries.reduce((high, e) => Math.max(high, e.seq), j.synced)

/** The entries still in force — the head is the last of them. */
const live = (j: Journal) => (j.undone === 0 ? j.entries : j.entries.slice(0, j.entries.length - j.undone))

/** How many entries at the start of `entries` belong to its first transaction — a transaction's entries are appended
 *  together, so they are always one run. */
const runFrom = (entries: readonly JournalEntry[], at: number): number => {
  let n = at
  while (n < entries.length && entries[n]?.txn === entries[at]?.txn) n += 1
  return n - at
}

export const canUndo = (j: Journal) => live(j).length > 0
export const canRedo = (j: Journal) => j.undone > 0

/**
 * One entry appended — a transaction, or (Story 6.3) the next entry of the transaction at the head, when it carries
 * the head's `txn`: Site Remix's Both appends the doc's entry and the pack's under one id, and they are one edit.
 *
 * THE UNDONE TAIL IS DISCARDED — the ordinary editor rule, and the reason `undone` is a distance rather than an
 * index: the entries that were undone are simply no longer there, so nothing can redo into a history that the new
 * edit has replaced.
 *
 * THEN TRIMMED FROM THE HEAD to `DEPTH` TRANSACTIONS, whole ones, so undo reaches back exactly that many edits and no
 * further and never half of one. The trim never touches the tail, so it can never move the pointer; `synced` is a seq
 * and survives its entry being dropped.
 */
export function append(j: Journal, entry: Omit<JournalEntry, 'seq'>): { journal: Journal; entry: JournalEntry; dropped: readonly number[] } {
  const kept = live(j)
  const full: JournalEntry = { ...entry, seq: j.nextSeq }
  const all = [...kept, full]
  let over = 0
  for (let txns = new Set(all.map((e) => e.txn)).size; txns > DEPTH; txns -= 1) over += runFrom(all, over)
  const dropped = all.slice(0, over).map((e) => e.seq)
  // the undone tail is gone as well as trimmed: both are entries this journal no longer holds
  const gone = [...j.entries.slice(j.entries.length - j.undone).map((e) => e.seq), ...dropped]
  return {
    journal: {
      entries: all.slice(over),
      undone: 0,
      synced: j.synced,
      pending: { ...j.pending, [entry.docKey]: j.stamp + 1 },
      stamp: j.stamp + 1,
      nextSeq: j.nextSeq + 1,
    },
    entry: full,
    dropped: gone,
  }
}

/** What an undo or a redo asks the editor to put back: every doc the transaction touched, whole, and — where it changed
 *  the Style Pack — the preset (Story 6.3). */
export type Restore = { journal: Journal; docs: Readonly<Record<string, ProjectDoc>>; preset?: string }

/** One transaction's entries, as the editor puts them back: each doc and the preset at the `side` given. Entries are
 *  applied in order, so a key touched twice ends at the value the side names last. */
const restoring = (entries: readonly JournalEntry[], side: 'before' | 'after'): Omit<Restore, 'journal'> => {
  const docs: Record<string, ProjectDoc> = {}
  let preset: string | undefined
  for (const e of side === 'before' ? [...entries].reverse() : entries) {
    if (isPack(e)) preset = e[side] as string
    else docs[e.docKey] = e[side] as ProjectDoc
  }
  return preset === undefined ? { docs } : { docs, preset }
}
/** Every key a transaction touched, owed to the server again at `stamp`. */
const owing = (j: Journal, entries: readonly JournalEntry[], stamp: number) => ({
  ...j.pending,
  ...Object.fromEntries(entries.map((e) => [e.docKey, stamp])),
})

/** The head TRANSACTION undone, whole: each entry's `before` is restored and the pointer moves back past all of them. */
export function undo(j: Journal): Restore | null {
  const kept = live(j)
  const head = kept[kept.length - 1]
  if (!head) return null
  let from = kept.length - 1
  while (from > 0 && kept[from - 1]?.txn === head.txn) from -= 1
  const txn = kept.slice(from)
  return { journal: { ...j, undone: j.undone + txn.length, pending: owing(j, txn, j.stamp + 1), stamp: j.stamp + 1 }, ...restoring(txn, 'before') }
}

/** The first undone TRANSACTION put back, whole: each entry's `after` is restored. */
export function redo(j: Journal): Restore | null {
  if (j.undone === 0) return null
  const at = j.entries.length - j.undone
  if (!j.entries[at]) return null
  const txn = j.entries.slice(at, at + runFrom(j.entries, at))
  return { journal: { ...j, undone: j.undone - txn.length, pending: owing(j, txn, j.stamp + 1), stamp: j.stamp + 1 }, ...restoring(txn, 'after') }
}

/**
 * AD-16's count: EDITS the server has not been told about, never operations. Distinct transaction ids above the
 * watermark — distinct because the record's shape may one day let one transaction write two rows, and the count must
 * not become an operation count the day it does.
 *
 * STORY 5.17 IS THE SURFACE IT WAS WRITTEN FOR, and it is still the only one. The heartbeat carries this number,
 * B5b prints it, B5c's danger panel prints it and the displaced session's assertive notice prints it — all from
 * this one definition, so an operation count can never become the thing a person is told they lost.
 */
export const unsyncedEdits = (j: Journal) => new Set(j.entries.filter((e) => e.seq > j.synced).map((e) => e.txn)).size

/**
 * After the server accepted what was sent at `sentStamp`, having been told about seqs up to `upTo`.
 *
 * A KEY CHANGED SINCE THE REQUEST LEFT IS KEPT. That is the whole reason `pending` carries a stamp: a flush is
 * asynchronous, the editor is not frozen while it is in flight, and clearing the map wholesale on success would
 * discard an edit the server has never seen — silently, which is the one failure this story exists to prevent.
 */
export const flushed = (j: Journal, sentStamp: number, upTo: number): Journal => ({
  ...j,
  synced: Math.max(j.synced, upTo),
  pending: Object.fromEntries(Object.entries(j.pending).filter(([, at]) => at > sentStamp)),
})

/** Who asked for a flush. `unload` is the tab going, which cannot be acknowledged and cannot be refused.
 *  `release` is STORY 5.17'S HAND OVER, and it is a member rather than a second function because the flush itself
 *  is this story's and is not rewritten: AD-15's flush contract is "unsynced work never crosses a lock boundary",
 *  so Hand over flushes BEFORE it releases and the lock is let go only if the flush landed. Like `manual` and
 *  `unload` it falls through the autosave test below — AD-15's timer ALONE stops — so a session with autosave off
 *  still sends its work before it gives up the lock. */
export type FlushCall = 'timer' | 'manual' | 'change' | 'retry' | 'unload' | 'release'

/**
 * WHETHER A FLUSH GOES OUT, in one place — three matrix rows that were each a condition written at the caller.
 *
 * `nothing` — the timer with AUTOSAVE OFF (AD-15: the timer ALONE stops, which is why `manual` and `unload` fall
 * through it), and any caller with nothing owed.
 * `acknowledge` — ⌘S with nothing owed. The press is ALWAYS answered: a keystroke that does nothing visible reads as
 * broken, so the indicator says "Synced" and settles, without a request.
 * `send` — there is something owed and this caller may send it.
 */
export const flushDecision = (j: Journal, why: FlushCall, autosave: boolean): 'send' | 'acknowledge' | 'nothing' =>
  why === 'timer' && !autosave ? 'nothing' : unsynced(j) ? 'send' : why === 'manual' ? 'acknowledge' : 'nothing'

/** What one flush sends: the pending docs, and the preset where the Style Pack is owed (Story 6.3). */
export type Payload = { docs: Record<string, ProjectDoc>; preset?: string }

/** Does a payload carry anything at all? A flush with nothing to send makes no request. */
export const carries = (p: Payload): boolean => Object.keys(p.docs).length > 0 || p.preset !== undefined

/** The docs a flush must send: the pending keys, each with the doc as it stands NOW. A key whose doc has gone is
 *  skipped rather than sent as null — the RPC upserts what it is given and a synthesized doc is never written, which
 *  would materialise an untouched canvas and break AD-22. STORY 6.3: and the pack in force where `PACK_KEY` is pending —
 *  never as a doc — so the RPC writes both in one compare-and-set. */
export function flushPayload(j: Journal, docs: Readonly<Record<string, ProjectDoc>>, preset?: string): Payload {
  const out: Record<string, ProjectDoc> = {}
  for (const key of Object.keys(j.pending)) {
    if (key === PACK_KEY) continue
    const doc = docs[key]
    if (doc) out[key] = doc
  }
  return Object.hasOwn(j.pending, PACK_KEY) && preset !== undefined ? { docs: out, preset } : { docs: out }
}

/**
 * FR-D9: AN UNDO ENTRY WHOSE DESIGN THE LIBRARY NO LONGER HOLDS NO-OPS WITH A NOTICE, NEVER HALF-APPLYING. The WHOLE
 * restored doc is checked before any of it is applied, which is the property the record's shape buys: an inverse-op
 * replay would have to validate op by op and unwind on the third.
 *
 * Answers the first missing design id, or null when every one is held. A HIDDEN instance is checked too: it is still
 * in the doc and still compiles the day it is shown again.
 */
export function vanishedDesign(doc: ProjectDoc, held: (designId: string) => boolean): string | null {
  for (const instance of doc.instances) if (!held(instance.designId)) return instance.designId
  return null
}

/* ───────────────────────────── B6's indicator, as a machine ─────────────────────────────
 *
 * Six states, and NOTHING ELSE MAY DRIVE IT (`B Missing Surfaces.dc.html:1351-1388`, five drawn; the sixth is R-213's).
 *
 *   at rest, nothing owed ────▶ "Synced"                 (green · check)
 *     └──── commit ────────────▶ "Saved on this device"   (grey · clock)
 *     └──── flush starts ──────▶ "Syncing"                (coral · arrow up)
 *             ├── ok ──────────▶ back to rest, now owing nothing → "Synced"
 *             ├── 401 ─────────▶ "Signed out"             (red · logout) + its panel, the backoff still trying
 *             └── fail ────────▶ "Retrying · {n}s"        (red · exclamation) + B6's panel
 *   no IndexedDB ─────────────▶ "Syncing every change to the cloud"  (grey · upload, sticky)
 *
 * R-213 (owner, 2026-09-28) ADDED THE SIXTH, and only for the refusal signing in cures. Before it a save the route
 * refused for an ended session read "Retrying … when the connection returns", which blamed a connection that was fine
 * and offered a Retry that could never succeed. A 404, 400 or 422 is a refusal signing in cannot cure, and stays
 * Retrying (DW-304, Story 7.18). Extrapolated from B6 (R-74): the Retrying panel's shape, its red, one link where
 * Retry now stood.
 *
 * R-144 (owner, 2026-09-19) SPLIT THE RESTING STATE BY WHAT IS OWED, and it is a better machine than the one B6
 * drew. B6 flashed "Synced" for four seconds after a save and then faded to "Saved on this device" for ever — so
 * the resting state meant BOTH "saved here, not sent" and "everything is sent", one appearance for two different
 * truths, and the stronger of the two was visible for four seconds in every hour. Now the resting state simply
 * reports whether anything is owed, which it already knows: `unsynced(journal)`.
 *
 * It costs no new vocabulary. Green is B6's own "Synced" and grey is its "Saved on this device"; all that went is
 * the four-second fade, and with it the timer that drove it.
 *
 * FALLBACK IS STICKY. Once IndexedDB has refused or a write has failed, nothing returns the indicator to a label that
 * claims the device holds the work — not a successful sync, not a reload of the component. Only a new page load, with
 * a store that opens, can leave it.
 */
export type SyncState =
  /** at rest, and `owed` is the whole of R-144: false → everything on screen is on the server (green), true →
   *  there are edits written here that have not gone up yet (grey). */
  | { kind: 'rest'; owed: boolean }
  | { kind: 'syncing' }
  | { kind: 'retrying'; attempt: number; seconds: number }
  /** R-213: the route answered 401. The backoff keeps trying (no countdown is shown), and a visit back to the tab
   *  tries at once — a sign-in in another tab rides this tab's next request, because the cookie jar is shared. */
  | { kind: 'signed-out' }
  | { kind: 'fallback' }

/** B6's five labels and R-213's sixth; the compile error for a seventh is the Kit's own union
 *  (`kit/persistence-indicator.tsx`). */
export type SyncLabel =
  | 'Saved on this device'
  | 'Syncing'
  | 'Synced'
  | 'Retrying'
  | 'Signed out'
  | 'Syncing every change to the cloud'

export const labelOf = (s: SyncState): SyncLabel =>
  s.kind === 'syncing' ? 'Syncing'
  : s.kind === 'retrying' ? 'Retrying'
  : s.kind === 'signed-out' ? 'Signed out'
  : s.kind === 'fallback' ? 'Syncing every change to the cloud'
  : s.owed ? 'Saved on this device'
  : 'Synced'

/** B6's panel opens on Retrying AND ON NOTHING ELSE — the frame's own note, and an acceptance criterion — save R-213's
 *  Signed out, which is a refusal of the same weight and carries its own panel. */
export const panelOpen = (s: SyncState) => s.kind === 'retrying' || s.kind === 'signed-out'

/**
 * THE SIGNED-OUT PANEL'S WORDS (R-213, R-227), one list read by the panel and by every check that asserts it (R-170).
 * `held` is R-213's sentence, true while this device holds the work; `fallback` is R-227's (owner, 2026-10-02), for an
 * editor holding no copy here — as after a sign-out in another tab, which R-214 erased — where "safe on this device"
 * would be a lie, which B6's own rule forbids (FR-D10).
 */
export const SIGNED_OUT_COPY = {
  title: 'Signed out',
  held: "You've been signed out. Your work is safe on this device — sign in again and it will be sent.",
  fallback: "You've been signed out. Your latest changes have not reached the cloud yet — keep this tab open, sign in again and they will be sent.",
  signIn: 'Sign in',
} as const

/* ───────────────────────────── R-214: signing out sends, then erases ─────────────────────────────
 *
 * THE OWNER'S RULING (2026-09-28): signing out first sends any work not yet sent, then wipes this browser's copy, and
 * asks first if the work cannot be sent. Every sign-out door — the account menu's, the restore page's and Sign out
 * everywhere — runs this ONE function, handed its I/O, so the order is decided once and `journal.test.ts` holds it.
 *
 * THE RECORDS ARE SENT WITHOUT A LOCK SESSION, deliberately (the spec's routine call 3). The route's absent-session
 * branch refuses nothing and the revision compare-and-set still guards every write: a 409 counts as "cannot send", and
 * a record already stored answers 200 (`sync/route.ts`'s "already there"). Each 200 is TOLD to this browser's open editor
 * of the project (`sentMessage`, below), which takes it as its own flush's answer — or its next edit would carry the old
 * base and meet the conflict dialog over work it had itself sent. Acquiring the lock per record would refuse exactly
 * the window the sign-out sends in.
 * ponytail: a record orphaned in this browser lands even while ANOTHER DEVICE holds the lock unflushed; that device's
 * next flush then meets the existing 409 flow. The upgrade is acquiring the lock per record.
 */

/** One project's work this browser owes the server, as the flush would send it — with what a flush's 200 marks sent:
 *  the journal's own stamp and highest sequence (`flushed`). Story 6.3: and the preset, where the pack is owed. */
export type OwedRecord = { projectId: string; base: number; docs: Record<string, ProjectDoc>; preset?: string; edits: number; stamp: number; upTo: number }

/** What a local record owes, or null when it owes nothing: `flushPayload` over its own journal, AD-16's count beside it.
 *  A record owing only its pack owes (Story 6.3). */
export const owedOf = (projectId: string, record: { baseRevision: number; docs: Readonly<Record<string, ProjectDoc>>; journal: Journal; preset?: string }): OwedRecord | null => {
  if (!unsynced(record.journal)) return null
  const payload = flushPayload(record.journal, record.docs, record.preset)
  return !carries(payload) ? null
    : { projectId, base: record.baseRevision, ...payload, edits: unsyncedEdits(record.journal), stamp: record.journal.stamp, upTo: maxSeq(record.journal) }
}

/** The sign-out's request body: the flush's own, WITHOUT a lock session (routine call 3 — the revision guards it). */
export const sendBody = (record: OwedRecord): string =>
  JSON.stringify({ base: record.base, docs: record.docs, ...(record.preset === undefined ? {} : { preset: record.preset }) })

/** What the sync route's answer means to the sign-out: only a 200 is sent. A 409 (another writer), a 401 (no session), a
 *  5xx and no answer at all (`null`: the request never came back) are "cannot send" — the ask's business. */
export const sentBy = (status: number | null): boolean => status === 200

/** R-214 — the one channel a sign-out tells an open editor of the project on, per project. */
export const SENT_CHANNEL = (projectId: string) => `inflozo-sent-${projectId}`

/** "Your owed work has been sent": a 200 the sign-out got for this browser's record, handed to the open editor, which
 *  applies it EXACTLY as its own flush's 200 when its base is the one sent (`flushed(journal, stamp, upTo)`, the base
 *  moved to `revision`), and ignores it otherwise. */
export type SentMessage = { type: 'sent'; project: string; base: number; revision: number; stamp: number; upTo: number }

export const sentMessage = (record: OwedRecord, answer: { revision: number }): SentMessage => ({
  type: 'sent', project: record.projectId, base: record.base, revision: answer.revision, stamp: record.stamp, upTo: record.upTo,
})

/** A message off the channel, read as one only when every field is the shape `sentMessage` writes. */
export const isSentMessage = (m: unknown): m is SentMessage => {
  if (typeof m !== 'object' || m === null) return false
  const o = m as Record<string, unknown>
  return o['type'] === 'sent' && typeof o['project'] === 'string' &&
    (['base', 'revision', 'stamp', 'upTo'] as const).every((k) => Number.isSafeInteger(o[k]))
}

/** Nothing owed → erase → sign out. All sent → erase → sign out. Anything unsent → ask first: Wait keeps everything
 *  (no erase, no sign-out), Sign out anyway erases and signs out. An erase that fails still signs out. True when the
 *  sign-out ran. */
export async function signOutFlow(o: {
  owed: () => Promise<readonly OwedRecord[]>
  send: (record: OwedRecord) => Promise<boolean>
  erase: () => Promise<unknown>
  signOut: () => Promise<unknown>
  ask: (edits: number) => Promise<boolean>
}): Promise<boolean> {
  const unsent: OwedRecord[] = []
  for (const record of await o.owed()) if (!(await o.send(record))) unsent.push(record)
  if (unsent.length > 0 && !(await o.ask(unsent.reduce((n, r) => n + r.edits, 0)))) return false
  await o.erase().catch(() => undefined)
  await o.signOut()
  return true
}

/** R-214's ask, derived from B5c (R-170, R-74): its shape and its danger panel, the count from `LOCK_COPY.willBeLost`
 *  and the cancel from `LOCK_COPY.wait`, so one count and one Wait mean one thing across the two dialogs. */
export const SIGN_OUT_COPY = {
  heading: 'Sign out with unsent work?',
  erases: "Signing out erases this browser's copy.",
  confirm: 'Sign out anyway',
  confirmBusy: 'Signing out…',
} as const

/** The resting state, derived rather than timed — R-144. There is no fourth transition to schedule any more:
 *  a flush that lands empties `pending`, and the next render simply reads it. */
export const restingState = (j: Journal): SyncState => ({ kind: 'rest', owed: unsynced(j) })

/** AD1's flush interval. A DEFAULT WITH RATIONALE (§AD4), not behaviour. */
export const FLUSH_MS = 3 * 60 * 1000

/** How long one sync request may take before it counts as failed and the backoff takes over — the editor's every flush,
 *  the tab-close one included, aborts at it. EXPORTED ONCE so the deployed walk's step 66b waits out the product's own
 *  budget rather than a number of its own (DW-220). */
export const SYNC_TIMEOUT_MS = 20_000

/** The retry backoff: 5 · 10 · 20 · 40 · 60, capped. `attempt` counts from 1. */
export const BACKOFF_S = [5, 10, 20, 40, 60] as const
export const backoffSeconds = (attempt: number) => BACKOFF_S[Math.min(Math.max(attempt, 1), BACKOFF_S.length) - 1] as number

/* ───────────────────────────── the hydrate comparison (AD-15, §AD1.1) ───────────────────────────── */

/** What a hydrate decided, so the editor states it rather than deriving it twice. */
export type Hydration =
  | { kind: 'local' }   // the revisions agree: the local doc and the journal both survive
  | { kind: 'cloud' }   // they differ: the cloud doc replaces the local one and the journal is cleared
  | { kind: 'first' }   // no local record for this project: the server's doc, an empty journal

/**
 * THE COMPARISON IS `projects.revision` VS THE LOCAL `base_revision`, AND NOTHING ELSE (AD-15, `addendum.md` §AD1.1).
 * Equal → both kept. Different → the doc is replaced and the journal cleared. No record → the server's doc.
 * ONE RECOGNITION SITS IN FRONT OF IT since Story 5.8's review — `ownFlushLanded` below — and it is not a second rule:
 * it finds the case where nothing differs at all.
 *
 * THE TAKEOVER HALF OF AD-15'S JOURNAL-CLEARING RULE IS `journalCleared` BELOW, and it is deliberately BESIDE this
 * function rather than inside it (Story 5.17). `hydrationFor` stays the one REVISION rule; the generation test is
 * independent by design, which is the whole point of AD-15's second clause — a take-over whose new holder has
 * written nothing leaves the revisions equal, so a rule that folded the two would never clear.
 */
export const hydrationFor = (local: { baseRevision: number } | null, cloudRevision: number): Hydration =>
  local === null ? { kind: 'first' } : local.baseRevision === cloudRevision ? { kind: 'local' } : { kind: 'cloud' }

/** STORY 6.3 — THE PACK A HYDRATE OPENS IN, by §AD1.1's rule for the docs: this device's where its record is KEPT (the
 *  revisions agree, or our own flush landed) and holds a pack this build knows; the server's otherwise — a differing
 *  revision, no record, and a record written before 6.3, which holds none. */
export const hydratedPreset = (how: Hydration, local: { preset?: string } | null, cloud: string, known: (id: string) => boolean): string =>
  how.kind === 'local' && local?.preset !== undefined && known(local.preset) ? local.preset : cloud

/**
 * DOES THE JOURNAL GO? (AD-15, Story 5.17.)
 *
 * TWO INDEPENDENT REASONS, OR-ed and never folded. The revision reason is `hydrationFor`'s above: the cloud doc
 * supersedes the local one, so the snapshots the journal holds are no longer true. The generation reason is
 * `lib/lock.ts`'s `displacedBy`: this session was taken over from, and the ruling is that its unsynced edits are
 * GONE — there is no merge path and no recovery of orphaned edits, so a journal that could still undo them would be
 * offering work the server will never accept.
 *
 * `takenOver` DECIDES ON ITS OWN, with no revision comparison involved — the acceptance criterion in those words.
 */
export const journalCleared = (how: Hydration, takenOver: boolean): boolean => takenOver || how.kind !== 'local'

/**
 * OUR OWN TAB-CLOSE FLUSH, RECOGNISED ON THE WAY BACK IN (Story 5.8's review).
 *
 * A reload or a close with edits owed sends them with `keepalive`, and the tab is gone before the answer arrives — so
 * the server moves to `base + 1` and the device never hears. `hydrationFor` then reads "different" and the journal is
 * cleared, which broke FR-D9's promise for every reload that was not preceded by a ⌘S. This asks the one question that
 * tells OUR write from another session's: the revision moved by exactly one, something was owed, and every owed doc
 * on the server IS the local one. Then there is nothing to replace — the journal's snapshots are still true — and the
 * caller adopts the revision and marks the journal flushed. Anything else is §AD1.1's second row, unchanged: a second
 * session's write cannot pass, because its doc would differ.
 */
export const stable = (v: unknown): string =>
  v === null || typeof v !== 'object'
    ? JSON.stringify(v) ?? 'null'
    : Array.isArray(v)
      ? `[${v.map(stable).join(',')}]`
      : `{${Object.keys(v).filter((k) => (v as Record<string, unknown>)[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(',')}}`

/** STORY 6.3: an owed PACK is ours when the server's preset is the one this device holds, as an owed doc is. */
export const ownFlushLanded = (
  local: { baseRevision: number; docs: Readonly<Record<string, unknown>>; journal: Journal; preset?: string },
  cloudRevision: number,
  cloudDocs: Readonly<Record<string, unknown>>,
  cloudPreset?: string,
): boolean =>
  cloudRevision === local.baseRevision + 1 &&
  unsynced(local.journal) &&
  Object.keys(local.journal.pending).every((key) =>
    key === PACK_KEY ? local.preset !== undefined && local.preset === cloudPreset : key in cloudDocs && stable(cloudDocs[key]) === stable(local.docs[key]))

/**
 * The auto-generated set a local record carries, narrowed to the canvases this project still offers.
 *
 * IT IS STORED RATHER THAN DERIVED, and that is the whole point: `read.ts` MATERIALISES an untouched canvas's
 * Synthesis Default stack into `docs`, so a doc with instances is no evidence that anybody designed it and `isDesigned`
 * cannot tell the two apart. The set is written in the same record as the docs it describes, so it can never be stale
 * against them; all this does is drop a canvas the project no longer offers.
 */
export const autoFrom = (stored: readonly string[], offered: readonly string[]): string[] =>
  stored.filter((canvas) => offered.includes(canvas))
