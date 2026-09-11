import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

/**
 * THE HALF A `not-found.tsx` CANNOT DO — DW-17, DW-26 and DW-18's app half.
 *
 * An UNMATCHED url renders the ROOT not-found, never a nested one. That is why DW-17 stayed open
 * through two stories that each added a `not-found.tsx`-shaped file to their own segment: the
 * drawn-but-unbuilt nav destinations (`/assets`, `/billing`, `/suggestions` today — the list is
 * DERIVED from the shell's own hrefs by `run-verify-dashboard.py`, never written down; the docs
 * row is an external link and never reaches this route — and anything typed) matched no route at
 * all, so nothing inside `(authed)` was ever asked. This route matches
 * them, which puts them inside the group, and `notFound()` from here then finds the group's own
 * boundary — the shell, the sidebar and the account menu around Inflozo's own page.
 *
 * It calls `notFound()` and nothing else. A catch-all is the lowest-priority match in Next's
 * routing, so it cannot shadow a real route — `app-routes.test.ts` asserts exactly that, because
 * "cannot" is a claim about a framework (standing rule 1) and the day it stops being true every
 * screen in the app disappears at once.
 *
 * NO `loading.tsx`, AND THAT IS THE POINT (R-98's second effect, DW-67). A route with a skeleton is
 * a Suspense boundary: Next flushes the shell and COMMITS THE STATUS LINE before the page component
 * runs, so `notFound()` from inside one renders the not-found page into an already-successful 200.
 * This route has nothing to stream and nothing to wait for, so no skeleton is both the correct shape
 * and the thing that lets it answer a real HTTP 404. It is declared in `busy.test.ts`'s
 * `NO_SKELETON` with that reason.
 *
 * IT CARRIES THE METADATA, AND THE BOUNDARY CANNOT. `not-found.tsx` is not a route segment, so no
 * `metadata` export of its own reaches the document — the title comes from the segment that was
 * being rendered. For a `notFound()` raised inside a real route that is already right (every page
 * under this group declares one, which `app-routes.test.ts` now holds), but an UNMATCHED url has no
 * segment but this one. Without it the tab read the raw url and axe-core reported `document-title`,
 * impact serious, at all three widths — measured on the deployed site, not reasoned.
 *
 * AND IT MAKES THE APP HOST'S UNMATCHED URLS DYNAMIC, which is DW-18's app half: the root
 * `/_not-found` is PRERENDERED, so its HTML was written at build time and carries no nonce, and the
 * app's `script-src 'self' 'nonce-…' 'strict-dynamic'` therefore blocked every script on it — that
 * page booted no JavaScript at all. This route is rendered per request and carries the nonce.
 */
export const metadata: Metadata = {
  title: 'Page not found · Inflozo',
  robots: { index: false, follow: false },
}

export default async function Unbuilt() {
  notFound()
}
