import { test } from 'node:test'
import assert from 'node:assert/strict'

// DW-174, DW-201 — PROJECTS RAN zod's EVAL PROBE ON EVERY LOAD. zod runs `new Function("")` when a `z.object` is built
// unless `jitless` is set first, and the app's policy refuses it. The editor was fixed at Story 5.1 by `doc-schema.ts`,
// which never loads on `/`; Projects reaches zod through `new-project-sheet.tsx`'s `PRESETS` → `lib/style-pack.ts`, so the
// probe there was LOAD ORDER, not a second copy of zod. Every app import of zod now goes through `lib/zod.ts`, which sets
// `jitless` before it hands `z` out, and ESLint refuses a direct one.
//
// IN ITS OWN FILE because it must be the process's FIRST evaluation of zod (`node --test` gives each file its own), with
// `Function` trapped meanwhile — `doc-schema-jitless.test.ts` holds the runtime's half the same way.

const trapFunction = () => {
  const Real = globalThis.Function
  let probed = 0
  const trap = () => {
    probed += 1
    throw new EvalError('the eval probe ran')
  }
  globalThis.Function = new Proxy(Real, { construct: trap, apply: trap }) as FunctionConstructor
  return { count: () => probed, restore: () => { globalThis.Function = Real } }
}

test("the Projects page's schema module builds without zod's eval probe", async () => {
  const trapped = trapFunction()
  try {
    await import('./lib/style-pack.ts')
  } finally {
    trapped.restore()
  }
  assert.equal(trapped.count(), 0, 'new Function("") was called while lib/style-pack.ts built its schemas')
})

test('the control: with jitless off, building a schema does run the probe', async () => {
  const { z } = await import('./lib/zod.ts')
  const trapped = trapFunction()
  try {
    z.config({ jitless: false })
    z.object({ a: z.string() })
  } finally {
    trapped.restore()
    z.config({ jitless: true })
  }
  assert.ok(trapped.count() >= 1, 'the trap never fired — the control is broken, so the test above proves nothing')
})
