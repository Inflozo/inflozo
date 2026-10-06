// jsdom ships no type declarations, and the alternative — an `@types/jsdom` dependency — would buy the whole DOM lib for
// the two members the tests use. The runtime's own shape (`packages/section-runtime/src/jsdom.d.ts`): the document is the
// runtime's `RuntimeDocument`, which is the point of AD-1's injected DOM — the tests hand the compiler a document, and
// nothing here widens what it may touch. jsdom is a devDependency and appears in tests only.

declare module 'jsdom' {
  import type { RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'

  export class JSDOM {
    constructor(html?: string)
    readonly window: { readonly document: RuntimeDocument & { readonly body: RuntimeElement } }
  }
}
