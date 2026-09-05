import type { Metadata } from 'next'
import { Button } from '@/components/kit/button'
import { currentUser } from '@/lib/supabase/server'
import { signOut } from '../sign-in/actions'

/**
 * SCAFFOLDING, AND IT SAYS SO. Story 1.5 replaces this whole file with S3, the dashboard.
 * It exists so the owner's test can round-trip — click the link, land somewhere that proves who
 * you are, sign out again — and so 1.5 has a signed-in user to build on. It is not a designed
 * surface and claims nothing about the dashboard; it uses the kit and the tokens and no more.
 * "Sign out" is S3d's word for it.
 */

export const metadata: Metadata = { title: 'Inflozo', robots: { index: false, follow: false } }

export default async function HoldingPage() {
  const user = await currentUser()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-paper px-6">
      <p className="text-ui text-ink">
        Signed in as <strong className="font-semibold">{user?.email}</strong>
      </p>
      <form action={signOut}>
        <Button type="submit" variant="secondary" size={36}>
          Sign out
        </Button>
      </form>
    </main>
  )
}
