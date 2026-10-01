import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import './fonts/fonts.css'
import './globals.css'

// The exact axes every frame's <link> requests (Calibration Set.dc.html:11 and the same line in every other .dc.html):
// Bricolage Grotesque's variable face across opsz and wght, Inter 400/500/600 and JetBrains Mono 400/500. THE APP SERVES
// THEM ITSELF (`app/fonts/fonts.css`, DW-246): the same files next/font fetched from Google at every build until Story
// 5.24d, so the app makes no runtime request to Google, 1.4's CSP has nothing extra to allow, and a build needs no network.

/** The three latin files — the faces every page draws first — preloaded exactly as next/font preloaded them. */
const FIRST_FACES = [
  new URL('./fonts/bricolage-grotesque-latin.woff2', import.meta.url),
  new URL('./fonts/inter-latin.woff2', import.meta.url),
  new URL('./fonts/jetbrains-mono-latin.woff2', import.meta.url),
]

export default function RootLayout({ children }: { children: ReactNode }) {
  for (const face of FIRST_FACES) preload(face.pathname, { as: 'font', type: 'font/woff2', crossOrigin: '' })
  return (
    // Story 5.17's `selfMarkScript` may set `data-lock-self` here before hydration — this element only, never below
    <html suppressHydrationWarning lang="en">
      <body>{children}</body>
    </html>
  )
}
