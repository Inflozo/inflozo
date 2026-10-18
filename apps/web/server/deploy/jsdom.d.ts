// jsdom ships no type declarations (the compiler package's own `src/jsdom.d.ts` explains why there is no `@types/jsdom`):
// the deploy's compile hands `compileTheme` a document, the runtime's `RuntimeDocument` and nothing wider (AD-1's
// injected DOM). Story 7.18a's one product use of jsdom (`deploy-io.ts`).

declare module 'jsdom' {
  import type { RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'

  export class JSDOM {
    constructor(html?: string)
    readonly window: { readonly document: RuntimeDocument & { readonly body: RuntimeElement } }
  }
}
