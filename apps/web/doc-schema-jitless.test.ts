import { test } from 'node:test'
import assert from 'node:assert/strict'

// THE REGRESSION GUARD FOR `z.config({ jitless: true })` (review of Story 5.1, 2026-09-17). zod runs `new Function("")`
// when a `z.object` is CONSTRUCTED unless `jitless` is set first, and the app's CSP refuses it; the deployed harness
// (`tools/probe/run-verify-editor.cjs`, step 5) proved the fix once, but nothing in `pnpm check` would notice the line
// in `doc-schema.ts` moving below the first schema or vanishing. It lives here, not beside the schema: the core
// package's lint bans `globalThis` and dynamic import (AD-1), and this needs both — the import has to be the FIRST
// evaluation of the runtime in the process (`node --test` gives each file its own), with `Function` trapped meanwhile.
// It imports the runtime's index, the door the editor bundle takes.

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

test('importing the runtime builds its schemas without zod\'s eval probe', async () => {
  const trapped = trapFunction()
  try {
    await import('@inflozo/section-runtime')
  } finally {
    trapped.restore()
  }
  assert.equal(trapped.count(), 0, 'new Function("") was called while the runtime was being imported')
  const { z } = await import('zod')
  assert.equal(z.core.globalConfig.jitless, true)
})

test('the control: with jitless off, constructing a schema does run the probe', async () => {
  const { z } = await import('zod')
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
