import { supabaseAdmin } from '@/lib/supabase/server'
import { heldNamesIn } from './held-names.ts'

/** STORY 7.24 — `heldNamesIn` over the service role, for the editor's read (`read.ts`). Its own file because `held-names.ts` must
 *  load under `node --test`, which cannot resolve `next/headers` (put-back.ts / put-back-io.ts's split). On `server-wiring.test.ts`'s
 *  list: names only, scoped to a site the caller owns. */
export const heldNames = (a: { siteId: string; userId: string; projectId: string }): Promise<string[]> => heldNamesIn(supabaseAdmin(), a)
