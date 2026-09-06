import type { Metadata } from 'next'
import { Lockup } from '@/components/kit/logo'

export const metadata: Metadata = {
  title: 'Inflozo',
}

/**
 * Story 1.1's placeholder for inflozo.com, standing until Epic 11 builds the real M1. It now
 * draws the identity instead of the bare word — the owner's ruling of 2026-09-06 (DW-31 →
 * Story 1.6). The size is the export's own "STACKED" lockup, 35.7px; the mark and the gap
 * derive from it. Nothing animates: he ruled the launch animation plays nowhere for now, and
 * Epic 11 asks him again.
 */
export default function MarketingHome() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <Lockup size={35.7} />
    </main>
  )
}
