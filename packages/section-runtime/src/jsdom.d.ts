// jsdom ships no type declarations, and the alternative — an `@types/jsdom` dependency — would buy
// the whole DOM lib for the four members the tests use. This declares exactly that surface and
// types the document as the runtime's own `RuntimeDocument`, which is the point of AD-1's injected
// DOM: the tests hand the runtime a document, and nothing here widens what the runtime may touch.
//
// jsdom is a devDependency and appears in tests only. The runtime itself TAKES a document.

declare module 'jsdom' {
  import type { RuntimeDocument, RuntimeElement } from './core.ts'

  export class JSDOM {
    constructor(html?: string)
    readonly window: { readonly document: RuntimeDocument & { readonly body: RuntimeElement } }
  }
}
