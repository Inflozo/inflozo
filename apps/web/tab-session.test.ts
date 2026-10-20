// Story 7.18a's review — a tab's lock id across page loads (`lib/lock-client.ts`, the owner's finding 2). Each "load" is a
// fresh instance of the module (its once-per-load memo), over one tab's `sessionStorage`; a copied tab starts from a copy of
// that storage, as Duplicate, ⌘-click and `window.open` make it. The shell judges every signed-in page (`shell.tsx`), so a
// page that never asks for the id still clears the mark a reload leaves.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

type Tab = { store: Map<string, string>; hide: () => void; show?: (persisted: boolean) => void }
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
  tab.show = (persisted: boolean) => listeners['pageshow']?.forEach((fn) => fn({ persisted }))
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

test('DW-307 (Story 7.18c): the page id is stable within a load, new on every load, and new again after a back-forward restore', async () => {
  const a = newTab()
  const first = await load(a)
  const id = first.pageId()
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'a UUID — what the route checks')
  assert.equal(first.pageId(), id, 'every lock call of one load names one page')
  a.show?.(false)
  assert.equal(first.pageId(), id, 'an ordinary pageshow (the first) changes nothing')
  a.hide()
  a.show?.(true)
  const restored = first.pageId()
  assert.notEqual(restored, id, 'a restore from the back-forward cache already left on its pagehide: a new page')
  assert.equal(first.pageId(), restored)
  a.hide()
  const reload = await load(a)
  assert.equal(reload.tabSession(), first.tabSession(), 'the control: a reload keeps the SESSION…')
  assert.notEqual(reload.pageId(), restored, '…and is a new PAGE, so its beat keeps the row the old page left')
})
