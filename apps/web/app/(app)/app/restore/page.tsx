import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { buttonClasses } from '@/components/kit/button'
import { Lockup } from '@/components/kit/logo'
import { Submit } from '@/components/kit/submit'
import type { Snapshot } from '@/lib/deletion-email'
import { signedIn, supabaseServer } from '@/lib/supabase/server'
import {
  deadlineLabel,
  DELETION_WINDOW_DAYS,
} from '../(authed)/account/deletion-rule'
import { signOut } from '../sign-in/actions'
import { RestoreForm } from './restore-form'

/* ───────────────────────────── FR-A5's window, Story 2.5 — and it has no frame of its own.

   THERE IS NO DRAWN SURFACE for a signed-in person who is not in the app, so this is extrapolated
   from the nearest one that is (R-74): S1a's card, on `sign-in/page.tsx`'s own `main`, with the
   `Lockup` and one full-width action. Same card classes, same page shape, same vocabulary — never
   a second one. What it does NOT take from S1a is the 380px watermark and the Terms · Privacy
   footer: both are the EMPTY page's ornament, and this page is not empty, it is a decision.

   IT LIVES OUTSIDE `(authed)` DELIBERATELY. The shell's layout redirects every pending account
   here, and a layout cannot read its own path — inside the group, that redirect would loop. So
   this page carries its own `signedIn()`, and `app-routes.test.ts`'s `SELF_GUARDED` list is what
   makes that a checked contract rather than a thing someone remembered.

   TWO STATES, and the second is not a variation of the first. Before the deadline this is a way
   back: the date, the themes to download, Restore. After it, Story 2.6 owns the account — there is
   no Restore button, because pressing one that answers `false` is worse than not offering it. */

export const metadata: Metadata = {
  title: 'Account deletion · Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function RestorePage() {
  const user = await signedIn()
  const supabase = await supabaseServer()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('deleted_at, purge_after')
    .eq('user_id', user.id)
    .maybeSingle()
  // Logged, as every read in the account file is: silently, a transient fault here would bounce
  // a pending account between this page and the door with nothing saying why (review, 2026-09-07).
  if (profileError) console.error('restore: profile read failed', { code: profileError.code })

  // Not pending — including a profiles read that failed, which must not strand a working account
  // on a page about deleting it. The layout is the door; this page only holds it open.
  if (!profile?.deleted_at) redirect('/')

  const deadline = deadlineLabel(profile.purge_after ?? profile.deleted_at)
  const passed = profile.purge_after ? new Date(profile.purge_after).getTime() <= Date.now() : true

  // Only while there is still something to download. RLS scopes this to the caller.
  // ponytail: the restore page lists snapshots by a join; a denormalised site title the day sites
  // are renamed.
  const { data: snapshots, error: snapshotError } = passed
    ? { data: null, error: null }
    : await supabase
        .from('site_snapshots')
        .select('id, theme_name, captured_at, sites(title, url)')
        // Newest first — PostgREST's default is heap order, which can swap two themes between
        // the email and this page. The email reads in the same order.
        .order('captured_at', { ascending: false })
  if (snapshotError) console.error('restore: snapshot read failed', { code: snapshotError.code })
  const themes = (snapshots ?? []) as unknown as Snapshot[]

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-6">
      <div className="relative z-10 flex w-full max-w-[440px] flex-col gap-[22px] rounded-lg bg-surface p-[32px_24px] shadow-lg tablet:gap-6 tablet:p-[40px_36px]">
        <div className="flex flex-col gap-2.5">
          <Lockup size={20} className="tablet:hidden" />
          <Lockup size={22} className="max-tablet:hidden" />
          <h1 className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.01em] tablet:text-[28px]">
            {passed ? 'Your account is being deleted' : 'Your account is set to be deleted'}
          </h1>
          <p className="text-ui leading-[1.5] text-ink-soft">
            {passed ? (
              <>
                The {DELETION_WINDOW_DAYS} days ended on {deadline} and everything is being
                removed. This can no longer be undone.
              </>
            ) : (
              <>
                Everything will be permanently deleted on{' '}
                <span className="font-medium text-ink">{deadline}</span>. Until then, you can
                change your mind.
              </>
            )}
          </p>
        </div>

        {themes.length ? (
          <div className="flex flex-col gap-2.5">
            <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">
              Your original themes
            </h2>
            <p className="text-helper-caption leading-[1.5] text-ink-soft">
              The theme each site had before Inflozo. After {deadline} they are gone too.
            </p>
            {themes.map((theme) => (
              <div key={theme.id} className="flex items-center gap-3">
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate font-mono text-control-label text-ink">
                    {theme.theme_name?.trim() || 'Original theme'}
                  </span>
                  <span className="truncate text-helper-caption text-ink-soft">
                    {theme.sites?.title?.trim() || theme.sites?.url || 'your site'} ·{' '}
                    {`captured ${deadlineLabel(theme.captured_at)}`}
                  </span>
                </span>
                {/* A LINK, not a button: the route answers 303 to a signed URL and the browser
                    follows it. Drawn with the Kit's own secondary 32 (`buttonClasses`). */}
                <a
                  href={`/snapshots/${theme.id}/download`}
                  className={`ml-auto shrink-0 ${buttonClasses('secondary', 32)}`}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : null}

        {passed ? null : <RestoreForm />}

        {/* Signing out does not stop the countdown, and signing back in lands right here. */}
        <form action={signOut} className="flex justify-center">
          <Submit busy="Signing out…" variant="secondary" size={36}>
            Sign out
          </Submit>
        </form>
      </div>
    </main>
  )
}
