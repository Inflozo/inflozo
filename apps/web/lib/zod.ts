import { z } from 'zod'

// THE APP'S ONE DOOR TO zod (DW-174, DW-201). zod runs a `new Function("")` probe the first time an object schema is
// built, unless `jitless` is set before it, and the app's content-security policy refuses that probe — so Projects
// reported a violation on every load. The setting is global to zod, so WHERE it is set decides which pages it covers:
// here, in the module every app schema imports zod through, it runs before the first schema of every bundle.
// `eslint.config.js` refuses a direct `zod` import anywhere in `apps/web` but this file; the runtime's own schemas set it
// in `packages/section-runtime/src/doc-schema.ts`. `zod-jitless.test.ts` is the control.
z.config({ jitless: true })

export { z }
