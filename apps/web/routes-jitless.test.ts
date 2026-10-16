import { test } from 'node:test'
import assert from 'node:assert/strict'

// STORY 7.16a — the Routes page's client imports `@inflozo/section-runtime/routes` DIRECTLY, not through the runtime's index,
// so the module must set zod's `jitless` before its first schema itself (the app's CSP refuses zod's eval probe — DW-174,
// DW-201). The guard for that line, in `doc-schema-jitless.test.ts`'s shape: its own file, so the import is this process's
// FIRST evaluation of zod, with `Function` trapped meanwhile. Its control is `zod-jitless.test.ts`'s.

test("the Routes page's rules module builds its schemas without zod's eval probe", async () => {
  const Real = globalThis.Function
  let probed = 0
  const trap = () => {
    probed += 1
    throw new EvalError('the eval probe ran')
  }
  globalThis.Function = new Proxy(Real, { construct: trap, apply: trap }) as FunctionConstructor
  try {
    const routes = await import('@inflozo/section-runtime/routes')
    // and a parse runs, so the schemas were built — not merely declared
    assert.equal(routes.parseRoutesConfig({}).ok, true)
  } finally {
    globalThis.Function = Real
  }
  assert.equal(probed, 0, 'new Function("") was called while the routes module was being imported')
})
