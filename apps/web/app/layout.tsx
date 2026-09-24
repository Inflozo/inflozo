import type { ReactNode } from 'react'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// The exact axes every frame's <link> requests (Calibration Set.dc.html:11 and the same
// line in every other .dc.html). next/font self-hosts them at build time, so the app makes
// no runtime request to Google and 1.4's CSP has nothing extra to allow.
// The frames ask for `opsz,wght@12..96,500;…;800` — the VARIABLE face across both axes.
// next/font takes wght as the variable axis itself, so naming a weight list here would pin
// static cuts and is refused alongside `axes` (executed: `next build` fails outright).
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // Story 5.17's `selfMarkScript` may set `data-lock-self` here before hydration — this element only, never below
      suppressHydrationWarning
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
