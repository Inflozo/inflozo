import { notFound } from 'next/navigation'
import { KEYS_TITLE_ID, KeysPanel } from '@/app/(app)/app/(authed)/sites/keys-panel'
import { PanelModal } from '@/app/(app)/app/(authed)/sites/panel-modal'
import { roleWord } from '@/lib/connect-rule'
import { HARNESS } from '@/lib/harness'

/** STORY 7.19 — S11e's Manage keys window, mounted for the keyboard gate alone, as `harness/brand` mounts S2c: the REAL
 *  `KeysPanel` in the real `PanelModal`, with a stand-in site and no read, so `pnpm keyboard` reads the Staff Access Token's
 *  refusals under the token box exactly as `/sites?manage=` draws them after `saveKeys` redirects (`?keys=` and R-280's
 *  `?role=`, the latter read back through `roleWord` as `keys-screen.tsx` reads it). Production answers 404
 *  (`app-routes.test.ts`'s HARNESS_ONLY). NO PRESS CAN DO ANYTHING: every form posts the real action, whose `siteOf` asks for
 *  a session the harness has no Supabase to hold and refuses a `site_id` that is not a uuid, which this stand-in's is not. */
export default async function HarnessKeys({ searchParams }: { searchParams: Promise<{ keys?: string | string[]; role?: string | string[] }> }) {
  if (!HARNESS) notFound()
  const { keys, role } = await searchParams
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
  return (
    <PanelModal labelledBy={KEYS_TITLE_ID}>
      <KeysPanel
        site={{
          id: 'harness-site',
          name: 'Stand-in site',
          publicUrl: 'https://harness-ghost.example',
          present: { admin: true, content: true, staff: false },
          adminKeyId: '6512a1b2c3d4e5f60718293a',
          contentKey: null,
        }}
        refused={first(keys) ?? null}
        status={null}
        tested={null}
        role={roleWord(first(role)) === null ? null : (first(role) as string)}
        popup
        back="/app/harness/keys"
      />
    </PanelModal>
  )
}
