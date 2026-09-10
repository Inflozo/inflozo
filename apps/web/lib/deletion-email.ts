import { deadlineLabel, DELETION_WINDOW_DAYS } from '../app/(app)/app/(authed)/account/deletion-rule.ts'
import { emailShell, escape, INK, INK_SOFT, LINE } from './email-shell.ts'

/**
 * FR-P1'S EIGHTH EMAIL — the one the product sends itself (the owner's ruling R-96, 2026-09-07),
 * at the moment a deletion is confirmed and never again. FR-A5's own last sentence and FR-P2 both
 * forbid a reminder, so this says the date, offers the way back, and says it is the only one.
 *
 * THE SHELL IS `lib/email-shell.ts`'s SINCE STORY 3.7 gave it a second caller. Every argument this
 * header used to make for it — the paper, the 400px card, the mark, the ink button, the footer, the
 * five escapes, and why it comes from `supabase/auth/magic-link.html` rather than from a frame —
 * moved with it, unchanged. What stays here is what is THIS email's: its date, its sentences and
 * its theme block.
 *
 * IT LIVES HERE AND NOT UNDER `supabase/auth/`. That directory is GoTrue's template set:
 * `configure-supabase-auth.py` pushes every `.html` in it to the platform and `app-routes.test.ts`
 * asserts each carries a `type=` its confirm route accepts. This template has no token and no
 * link of GoTrue's in it, so it would fail that assertion and, worse, be pushed as an auth
 * template.
 *
 * PURE, and every user value escaped. A site title is text a Ghost site's owner controls; it
 * arrives here through a `select` and goes out inside markup.
 */

/** One `site_snapshots` row as both the email and `/restore` need it — the embed is the site. */
export type Snapshot = {
  id: string
  theme_name: string | null
  captured_at: string
  sites: { title: string | null; url: string } | null
}

/** The site a snapshot belongs to, said the way the restore page says it: title, else the URL. */
const siteLabel = (snapshot: Snapshot) => snapshot.sites?.title?.trim() || snapshot.sites?.url || 'your site'
const themeLabel = (snapshot: Snapshot) => snapshot.theme_name?.trim() || 'Original theme'
const capturedLabel = (snapshot: Snapshot) => `captured ${deadlineLabel(snapshot.captured_at)}`

export function deletionEmail({
  deadline,
  snapshots,
  restoreUrl,
}: {
  /** `profiles.purge_after`, straight from the function that stamped it. */
  deadline: string | Date
  snapshots: Snapshot[]
  restoreUrl: string
}): { subject: string; html: string; text: string } {
  const date = deadlineLabel(deadline)
  const subject = `Your Inflozo account will be deleted on ${date}`
  const opening =
    `You asked to delete your Inflozo account, so everything in it — every project, its full ` +
    `version history and every asset — will be permanently deleted on ${date}. Your live Ghost ` +
    `sites stay online; we never touch them.`
  const changeMind = `Changed your mind? Restore your account any time in the next ${DELETION_WINDOW_DAYS} days and nothing is lost.`
  const only = "This is the only email we'll send about this."

  const themesHtml = snapshots.length
    ? `
                <div style="border-top:1px solid ${LINE};margin-top:28px;"></div>
                <div style="font-size:14px;font-weight:600;color:${INK};padding-top:16px;">Your original themes</div>
                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:4px;">The theme each site had before Inflozo. Sign in to download them before ${date} &mdash; after that they are gone too.</div>
${snapshots
  .map(
    (snapshot) => `                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:8px;"><span style="font-family:'Courier New',monospace;color:${INK};">${escape(themeLabel(snapshot))}</span> &middot; ${escape(siteLabel(snapshot))} &middot; ${escape(capturedLabel(snapshot))}</div>`,
  )
  .join('\n')}
`
    : ''

  const html = emailShell({
    subject,
    preheader: `Your Inflozo account is set to be deleted on ${date}. You can still restore it.`,
    heading: `Your account will be deleted on ${date}`,
    paragraphs: [opening, changeMind],
    button: { label: 'Restore my account', url: restoreUrl },
    extra: themesHtml,
    note: only,
  })

  const themesText = snapshots.length
    ? [
        '',
        'Your original themes',
        `The theme each site had before Inflozo. Sign in to download them before ${date} — after that they are gone too.`,
        ...snapshots.map((s) => `  ${themeLabel(s)} · ${siteLabel(s)} · ${capturedLabel(s)}`),
      ].join('\n')
    : ''

  const text = [
    `Your account will be deleted on ${date}`,
    '',
    opening,
    '',
    changeMind,
    `Restore my account: ${restoreUrl}`,
    themesText,
    '',
    only,
    'Inflozo · inflozo.com',
  ].join('\n')

  return { subject, html, text }
}
