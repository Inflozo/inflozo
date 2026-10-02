'use server'

import { headers } from 'next/headers'
import type { SiteResult } from '@/app/(app)/app/(authed)/projects/[id]/(editor)/actions'
import { HARNESS } from '@/lib/harness'
import { storedSurfaces } from '@/lib/probe-rule'
import { HARNESS_PROJECT, SURFACES } from './sites'

/**
 * DW-279 — THE KEYBOARD HARNESS'S RE-READ, the editor's `reread` seam (`recheckSite` everywhere else). The harness has no
 * database, so the real re-read is refused there and `pnpm keyboard` could only ever see the stored snapshot stay drawn;
 * a re-read that LANDS and redraws Ghost's two surfaces was proven by the hand-run live walk alone.
 *
 * It answers ONLY the harness project, ONLY under `x-inflozo-harness-site: surfaces-later` (a linked site whose stored
 * snapshot is empty) or `surfaces-gone` (the full stored snapshot, answered with the empty one), and only where the harness exists at all — a server action is an endpoint in every build, so
 * production refuses it like everything else here. Every other call is the refusal the real action gives a harness. It
 * READS `projectId`: Next drops an argument an action never uses from the request, and the journey finds the re-read by
 * its body, the project id alone.
 */
export async function harnessReread(projectId: string): Promise<SiteResult> {
  if (!HARNESS || projectId !== HARNESS_PROJECT.id) return { refused: true }
  const asked = (await headers()).get('x-inflozo-harness-site')
  // R-215 (the review of 5.24e): `surfaces-gone` answers the EMPTY snapshot — the site switched both surfaces off
  if (asked === 'surfaces-gone') return { members: null, surfaces: storedSurfaces({}) }
  if (asked !== 'surfaces-later') return { refused: true }
  return { members: null, surfaces: SURFACES }
}
