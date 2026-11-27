import { supabaseAdmin } from '@/lib/supabase/server'
import { heldNamesIn } from './held-names.ts'

/** STORY 7.24 — `heldNamesIn` over the service role, for the editor's read (`read.ts`). Its own file because `held-names.ts` must
 *  load under `node --test`, which cannot resolve `next/headers` (put-back.ts / put-back-io.ts's split). On `server-wiring.test.ts`'s
 *  list: names only, scoped to a site the caller owns. */
// async, so a `supabaseAdmin()` that throws (its key unset) is a rejection `read.ts`' `.catch` counts as none, never a thrown editor load
export const heldNames = async (a: { siteId: string; userId: string; projectId: string }): Promise<string[]> => heldNamesIn(supabaseAdmin(), a)
