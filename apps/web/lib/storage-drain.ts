/**
 * ONE PREFIX WALKER, AND EVERY LATER PURGE IMPORTS IT.
 *
 * AD-32: objects before rows. A row deleted first leaves an object nothing points at, and an
 * orphan in a bucket with no policy is a leak nobody can see. Story 2.6's account purge is the
 * first caller; E7's snapshot orphan purge (FR-C6, Story 7.20 — moved from E3 on 2026-09-09, DW-75) and E7's artifact retention (FR-J7) are the
 * next two, and each is a cron of its own (AD-33) — so the walk lives here rather than inside the
 * first route that needed it.
 *
 * `list-v2`, NOT A RECURSIVE `list()`. storage-js 2.115.0's `listV2()` posts to
 * `/object/list-v2/{bucket}` and, with `with_delimiter` at its `false` default, lists a prefix
 * FLAT with full keys and a cursor (`dist/index.d.mts:366-390`, `:448-453`). Should `list-v2` ever
 * be withdrawn, the v1 `list()` fallback has two gotchas that make a walker lie: a FOLDER comes
 * back as a row with `id: null` — indistinguishable from a file unless that is tested — and every
 * `name` is RELATIVE to the folder listed, so the caller must rejoin the prefix before removing.
 * Neither applies here, and that is the reason for the choice rather than a preference.
 *
 * No cursor is threaded: the loop REMOVES what it just listed, so the next listing starts at what
 * is left. `hasNext` and `nextCursor` are therefore unread by design.
 */

/**
 * What the walker needs of a bucket handle, and nothing more — so `node --test` drives it with a
 * two-method stub and the route hands it `supabaseAdmin().storage.from(bucket)` unchanged.
 */
export interface DrainBucket {
  listV2(options: { prefix: string; limit: number }): Promise<{
    data: { objects: { name: string }[] } | null
    error: unknown
  }>
  remove(paths: string[]): Promise<{ error: unknown }>
}

/**
 * A listing that never empties is a bug — a prefix whose objects the service role cannot delete,
 * or a `remove` that answers 200 and removes nothing — and a bug must stop, not spin for the
 * function's whole 300 seconds. At the 1000-object default this is a hundred thousand objects.
 */
export const MAX_ROUNDS = 100

/** The failure the caller logs: `step` is the account step, never an address or a key. */
function drainFailure(what: string, prefix: string, error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string; status?: number }
  return Object.assign(new Error(`${what} ${prefix}: ${e.message ?? 'failed'}`), {
    step: 'objects',
    prefix,
    code: e.code ?? e.status,
  })
}

/**
 * Every object under `prefix`, gone. Returns how many were removed; throws on the first refusal,
 * because a partly drained prefix must leave the account's ROWS alone and be due again tomorrow.
 */
export async function drainPrefix(bucket: DrainBucket, prefix: string, limit = 1000): Promise<number> {
  // An empty prefix — or `/`, which is what an empty id becomes — is not a prefix, it is the
  // WHOLE BUCKET, and this walker would remove every user's objects in it. Refused here, in the
  // one function every purge routes through, rather than in each caller (review, 2026-09-07).
  if (!prefix.replace(/\/+$/, '')) {
    throw drainFailure('drain', prefix, { message: 'an empty prefix would walk the whole bucket' })
  }
  let removed = 0
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const { data, error } = await bucket.listV2({ prefix, limit })
    if (error) throw drainFailure('list', prefix, error)
    const names = (data?.objects ?? []).map((object) => object.name)
    if (names.length === 0) return removed
    const { error: removeError } = await bucket.remove(names)
    if (removeError) throw drainFailure('remove', prefix, removeError)
    removed += names.length
  }
  throw drainFailure('drain', prefix, { message: `still listing objects after ${MAX_ROUNDS} rounds` })
}
