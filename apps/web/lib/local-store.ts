import type { ProjectDoc } from '@inflozo/section-runtime'
import { EMPTY_JOURNAL, owedOf, type Journal, type JournalEntry, type OwedRecord } from './journal.ts'

/* THE IndexedDB DOOR (Story 5.8, `addendum.md` §AD4's default store).
 *
 * EVERY FUNCTION FAILS SOFT. A rejected open, a blocked upgrade, a quota refusal, a browser with no `indexedDB` at
 * all — each resolves to `null` or `false` and never throws, because the caller's only honest answer is to switch to
 * FALLBACK MODE and say so in the indicator. The one thing this must never do is let a storage failure reach the
 * interaction path or leave the editor claiming *"Saved on this device"* when nothing was.
 *
 * ONE DATABASE PER USER. Two accounts on one browser get two databases, so signing out and in as somebody else can
 * never surface the first account's document — RLS would refuse them the project anyway, and this is the second wall
 * rather than the only one. And SIGNING OUT DELETES IT (R-214, Story 5.24e): `owedRecords` lists what it still owes so
 * the sign-out can send it first, and `erase` removes the database whole (`signOutFlow` in `journal.ts` is the order).
 *
 * TWO OBJECT STORES, because they are written at different sizes and with different lifetimes. `meta` holds ONE
 * record per project — the whole document, the base revision, and the journal's pointers — and is replaced on every
 * commit. `journal` holds one record per transaction, keyed `<projectId>:<seq>`, appended on every commit and deleted
 * only when the 100-edit trim drops one or a differing revision clears the lot. Keeping the journal in `meta` would
 * mean rewriting up to 200 copies of a document on every keystroke.
 *
 * ponytail: one `put` of the whole document per commit. A 40-section doc is a few hundred KB of structured clone off
 * the interaction path, which the stress fixture measures; make `meta` per-doc if a project ever outgrows that.
 */

const VERSION = 1
const META = 'meta'
const JOURNAL = 'journal'

/** The whole of what is held for one project. */
export type LocalRecord = {
  baseRevision: number
  docs: Record<string, ProjectDoc>
  /** the canvases that were AUTO-GENERATED when this was written — see `autoFrom` for why it is stored */
  auto: string[]
  journal: Journal
  /** STORY 6.3 — the Style Pack in force here, held with the docs (a switch not yet sent survives a reload). ABSENT in a
   *  record written before 6.3, and then the server's pack is the one the hydrate keeps. */
  preset?: string
}

type MetaRow = {
  projectId: string
  baseRevision: number
  docs: Record<string, ProjectDoc>
  auto: string[]
  preset?: string
  undone: number
  synced: number
  pending: Record<string, number>
  stamp: number
  nextSeq: number
}

type EntryRow = JournalEntry & { key: string; projectId: string }

export type LocalStore = {
  read(projectId: string): Promise<LocalRecord | null>
  /** every project this browser holds a record for (R-214) */
  list(): Promise<(LocalRecord & { projectId: string })[]>
  /** this connection let go, so a sign-out's erase is never held by a read of its own */
  close(): void
  /** the document and the journal's pointers, replaced whole */
  save(projectId: string, record: LocalRecord): Promise<boolean>
  /** one transaction appended, and the seqs the trim (or an undone tail) dropped, removed */
  push(projectId: string, entry: JournalEntry, dropped: readonly number[]): Promise<boolean>
  /** §AD1.1's second row: the cloud doc replaces the local one and the journal goes */
  clearJournal(projectId: string): Promise<boolean>
}

const wrap = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })

const done = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })

/**
 * FR-D9's "ask the browser to keep it". REQUESTED ONCE PER PROJECT MOUNT, AND ITS ANSWER IS NEVER SHOWN: loss to
 * eviction is a stated limitation of the product, not a promise it makes, so a `false` here changes nothing the user
 * can see. Never awaited by anything.
 */
export function askToPersist(): void {
  try {
    void navigator.storage?.persist?.()
  } catch {
    // a browser that refuses even to be asked is a browser that was never going to promise anything
  }
}

/**
 * The store, or `null` — which is the caller's signal to enter fallback mode. Private mode, a blocked upgrade, a
 * browser without `indexedDB` and a user who has switched site data off all arrive here the same way.
 *
 * `onblocked` is a REAL case and not defensive padding: a second tab holding an older version of this database keeps
 * the upgrade waiting for ever, and a promise that never settles would hang the first paint — which is gated on this.
 */
/** The one spelling of a user's database name — opened here, deleted by `erase`. */
const databaseOf = (userId: string) => `inflozo-doc-${userId}`

export async function openLocal(userId: string, gone?: () => void): Promise<LocalStore | null> {
  let db: IDBDatabase
  try {
    if (typeof indexedDB === 'undefined') return null
    db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseOf(userId), VERSION)
      request.onupgradeneeded = () => {
        const next = request.result
        if (!next.objectStoreNames.contains(META)) next.createObjectStore(META, { keyPath: 'projectId' })
        if (!next.objectStoreNames.contains(JOURNAL)) {
          next.createObjectStore(JOURNAL, { keyPath: 'key' }).createIndex('byProject', 'projectId')
        }
      }
      request.onsuccess = () => {
        // never be the tab that blocks the next schema upgrade: close when another tab asks, and every call after
        // that fails soft into the fallback. R-214 (Story 5.24e): a sign-out in another tab DELETES this database,
        // which arrives here the same way — and `gone` is the editor's `toFallback`, so an open editor stops claiming
        // the device holds its work the moment it no longer does
        request.result.onversionchange = () => {
          request.result.close()
          gone?.()
        }
        resolve(request.result)
      }
      request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened'))
      request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked by another tab'))
    })
  } catch {
    return null
  }

  const keyOf = (projectId: string, seq: number) => `${projectId}:${seq}`

  /** Every call goes through here, so no path out of this module can throw. */
  const soft = async <T>(work: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await work()
    } catch {
      return fallback
    }
  }

  const read = (projectId: string) =>
    soft<LocalRecord | null>(async () => {
      const tx = db.transaction([META, JOURNAL], 'readonly')
      const meta = (await wrap(tx.objectStore(META).get(projectId) as IDBRequest<MetaRow | undefined>)) ?? null
      if (!meta) return null
      const rows = await wrap(tx.objectStore(JOURNAL).index('byProject').getAll(projectId) as IDBRequest<EntryRow[]>)
      const entries = rows
        .sort((a, b) => a.seq - b.seq)
        .map(({ seq, txn, docKey, before, after }) => ({ seq, txn, docKey, before, after }))
      // the pointers are the META record's: a tail of undone entries is still ON DISK, which is what makes redo
      // survive a reload as well as undo
      const journal: Journal = {
        ...EMPTY_JOURNAL,
        entries,
        undone: Math.min(meta.undone ?? 0, entries.length),
        synced: meta.synced ?? 0,
        pending: meta.pending ?? {},
        stamp: meta.stamp ?? 0,
        nextSeq: Math.max(meta.nextSeq ?? 1, entries.reduce((high, e) => Math.max(high, e.seq + 1), 1)),
      }
      return { baseRevision: meta.baseRevision, docs: meta.docs, auto: meta.auto ?? [], journal, ...(typeof meta.preset === 'string' ? { preset: meta.preset } : {}) }
    }, null)

  return {
    read,

    list: () =>
      soft(async () => {
        const ids = await wrap(db.transaction(META, 'readonly').objectStore(META).getAllKeys())
        const out: (LocalRecord & { projectId: string })[] = []
        for (const id of ids) {
          const record = await read(String(id))
          if (record) out.push({ ...record, projectId: String(id) })
        }
        return out
      }, []),

    close: () => db.close(),

    save: (projectId, record) =>
      soft(async () => {
        const tx = db.transaction(META, 'readwrite')
        const row: MetaRow = {
          projectId,
          baseRevision: record.baseRevision,
          docs: record.docs,
          auto: record.auto,
          ...(record.preset === undefined ? {} : { preset: record.preset }),
          undone: record.journal.undone,
          synced: record.journal.synced,
          pending: { ...record.journal.pending },
          stamp: record.journal.stamp,
          nextSeq: record.journal.nextSeq,
        }
        tx.objectStore(META).put(row)
        await done(tx)
        return true
      }, false),

    push: (projectId, entry, dropped) =>
      soft(async () => {
        const tx = db.transaction(JOURNAL, 'readwrite')
        const store = tx.objectStore(JOURNAL)
        for (const seq of dropped) store.delete(keyOf(projectId, seq))
        store.put({ ...entry, key: keyOf(projectId, entry.seq), projectId } satisfies EntryRow)
        await done(tx)
        return true
      }, false),

    clearJournal: (projectId) =>
      soft(async () => {
        const tx = db.transaction(JOURNAL, 'readwrite')
        const store = tx.objectStore(JOURNAL)
        const keys = await wrap(store.index('byProject').getAllKeys(projectId) as IDBRequest<IDBValidKey[]>)
        for (const key of keys) store.delete(key)
        await done(tx)
        return true
      }, false),
  }
}

/** R-214 — every record this browser holds for the user that owes the server something, as the flush would send it.
 *  The connection is closed before it answers, so the erase that follows is never blocked by this read. Nothing to
 *  read — no IndexedDB, a refused open — owes nothing. */
export async function owedRecords(userId: string): Promise<OwedRecord[]> {
  const store = await openLocal(userId)
  if (!store) return []
  try {
    return (await store.list()).flatMap((record) => owedOf(record.projectId, record) ?? [])
  } finally {
    store.close()
  }
}

/** R-214 — this browser's copy, deleted whole. FAIL-SOFT, and it never waits on a tab that will not let go: a blocked
 *  delete answers at once (the browser finishes it when that tab closes), and a refusal answers false — the sign-out
 *  goes ahead either way (the matrix's "an erase that fails still signs out"). */
export const erase = (userId: string): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(true)
      const request = indexedDB.deleteDatabase(databaseOf(userId))
      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
      request.onblocked = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
