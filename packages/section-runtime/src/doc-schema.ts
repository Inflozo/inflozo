// THE PROJECT DOC'S ONE SCHEMA (AD-27) — `project_templates.doc`, as every reader and writer parses it.
//
// First written by Story 5.1, whose editor is the first reader. STRICT AT BOTH LEVELS: a field this schema does not
// name fails loudly rather than being dropped, so a writer that got ahead of its readers is a thrown error, never a
// value lost on the next save. The stories that write `hidden`, `parkedControls`, `isMainFeed` and the rest (5.4,
// 5.11, 5.19) add their fields HERE, in the same change as the writer.
//
// JITLESS, AND THE HARNESS IS WHY. The spec guessed zod's JIT probe (`allowsEval`, `new Function("")`) ran on a
// schema's first parse, so a server-side parse would keep it out of the browser. Executed on a production build
// (2026-09-17, `run-verify-editor.cjs`), it runs at CONSTRUCTION: `$ZodObject` reads `allowsEval.value` when the
// schema is built (`zod/v4/core/schemas.js:970-972`), and this module is in the editor's client bundle through the
// runtime's index — so the canvas page reported a `script-src` eval violation on every load. `jitless` skips the probe
// (`util.js:146-148`); it is global to zod, so it is set here before the first schema this module builds.

import { z } from 'zod'

z.config({ jitless: true })

const values = z.record(z.string(), z.unknown())

/** One section on a canvas: which design, the name Layers shows, and the instance's stored slice (`ControlState`). */
export const instanceSchema = z.strictObject({
  instanceId: z.string().min(1),
  layerName: z.string(),
  designId: z.string().regex(/^a\d+\/\d+$/, 'a design id is "{category}/{n}", e.g. "a1/1"'),
  content: values,
  controls: values,
  data: values,
  darkOverrides: values,
})

export const docSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    instances: z.array(instanceSchema),
  })
  // the editor keys Layers rows on the instanceId, and 5.8's journal will address edits by it (review, 2026-09-17)
  .refine((d) => new Set(d.instances.map((i) => i.instanceId)).size === d.instances.length, {
    message: 'every instanceId is unique within a doc',
    path: ['instances'],
  })

export type DocInstance = z.infer<typeof instanceSchema>
export type ProjectDoc = z.infer<typeof docSchema>

/** Parses a stored doc, or throws a sentence naming `where` (a template key) and every failing path. */
export function parseDoc(value: unknown, where: string): ProjectDoc {
  const parsed = docSchema.safeParse(value)
  if (parsed.success) return parsed.data
  const issues = parsed.error.issues.map((i) => `${i.path.length > 0 ? i.path.join('.') : '(root)'}: ${i.message}`)
  throw new Error(`the ${where} doc does not parse — ${issues.join(' · ')}`)
}
