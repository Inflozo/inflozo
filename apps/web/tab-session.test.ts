// Story 7.18a's review — a tab's lock id across page loads (`lib/lock-client.ts`, the owner's finding 2). Each "load" is a
// fresh instance of the module (its once-per-load memo), over one tab's `sessionStorage`; a copied tab starts from a copy of
// that storage, as Duplicate, ⌘-click and `window.open` make it. The shell judges every signed-in page (`shell.tsx`), so a
// page that never asks for the id still clears the mark a reload leaves.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

type Tab = { store: Map<string, string>; hide: () => void }
let loads = 0

/** one page load in a tab: the module fresh, `window` and `sessionStorage` this tab's */
async function load(tab: Tab) {
  const listeners: Record<string, ((e: { persisted?: boolean }) => void)[]> = {}
  Object.assign(globalThis, {
    window: { addEventListener: (type: string, fn: (e: { persisted?: boolean }) => void) => (listeners[type] ??= []).push(fn) },
    sessionStorage: {
      getItem: (k: string) => tab.store.get(k) ?? null,
      setItem: (k: string, v: string) => void tab.store.set(k, v),
      removeItem: (k: string) => void tab.store.delete(k),
    },
  })
  tab.hide = () => listeners['pagehide']?.forEach((fn) => fn({}))
  return (await import(`./lib/lock-client.ts?load=${++loads}`)) as typeof import('./lib/lock-client.ts')
}
const newTab = (): Tab => ({ store: new Map(), hide: () => {} })
const copyOf = (tab: Tab): Tab => ({ store: new Map(tab.store), hide: () => {} })

test('a reload keeps the tab\'s id; a tab copied from an open one is a session of its own', async () => {
  const a = newTab()
  const id = (await load(a)).tabSession()
  a.hide()
  assert.equal((await load(a)).tabSession(), id, 'a reload keeps it')
  assert.notEqual((await load(copyOf(a))).tabSession(), id, 'a copy of the open tab does not')
})

test('a page that judges the load (the shell) clears the reload\'s mark, so a tab copied from it is its own session — and without that judge the copy shares the id (the control)', async () => {
  for (const judged of [true, false]) {
    const a = newTab()
    const id = (await load(a)).tabSession()
    a.hide() // the editor's page goes — a reload of Projects after a soft navigation there
    const projects = await load(a)
    if (judged) projects.storedTabSession()
    const copy = (await load(copyOf(a))).tabSession() // a project ⌘-clicked from Projects
    if (judged) assert.notEqual(copy, id, 'judged: the copy is its own session')
    else assert.equal(copy, id, 'the control: unjudged, the mark rides into the copy')
  }
})

test('the shell judges every signed-in page load', () => {
  assert.match(readFileSync('components/shell/shell.tsx', 'utf8'), /useEffect\(\(\) => void storedTabSession\(\), \[\]\)/)
})
