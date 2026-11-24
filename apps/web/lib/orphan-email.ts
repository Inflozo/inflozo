import { deadlineLabel } from '../app/(app)/app/(authed)/account/deletion-rule.ts'
import { emailShell, escape } from './email-shell.ts'
import { ORPHAN_SNAPSHOT_DAYS } from './connect-rule.ts'
import { ORPHANS } from './orphan-rule.ts'

/**
 * FR-P1's NINTH EMAIL — FR-C6's one notice before a disconnected site's original theme is deleted
 * (Story 7.20b, R-285: one email, `ORPHAN_NOTICE_DAYS` before the deadline, never repeated for that
 * disconnect). It names the site, the theme, the day it was disconnected and the day it goes, and
 * offers one button.
 *
 * IT RIDES `lib/email-shell.ts`, as the deletion email and the reconnect notice do: a transactional
 * email is not a drawn surface, so its nearest drawn thing is the sign-in email (R-74). Its note is
 * the sentence the other two end on, from one home (`ORPHANS.emailOnly` is `HEALTH.emailOnly`).
 *
 * THE BUTTON IS THE SITES PAGE, NEVER THE FILE. A signed Storage URL in an inbox would outlive AD-13's
 * 60 seconds, and the download route needs a session; Sites is where the file is (`#original-themes`).
 *
 * PURE, and the site and the theme are escaped in the HTML — a site's title and a theme's name are text
 * somebody else wrote. The plain `text` part carries them as they are.
 */
export function orphanEmail({
  site,
  theme,
  date,
  disconnected,
  url,
}: {
  /** What the customer calls the site: its title, else its host. Escaped here. */
  site: string
  /** The theme's label (`themeLabel`). Escaped here. */
  theme: string
  /** The day it is deleted — `purgeDateOf`'s. */
  date: string | Date
  /** `sites.disconnected_at`. */
  disconnected: string | Date
  /** `https://app.inflozo.com/sites#original-themes` */
  url: string
}): { subject: string; html: string; text: string } {
  const day = deadlineLabel(date)
  const since = deadlineLabel(disconnected)
  const safeSite = escape(site)
  const safeTheme = escape(theme)

  const html = emailShell({
    subject: escape(ORPHANS.emailSubject(site, day)),
    preheader: ORPHANS.emailPreheader(day),
    heading: ORPHANS.emailHeading(safeSite, day),
    paragraphs: [ORPHANS.emailBody(safeSite, since, safeTheme, ORPHAN_SNAPSHOT_DAYS, day), ORPHANS.emailKeep(safeSite)],
    button: { label: ORPHANS.emailButton, url },
    note: ORPHANS.emailOnly,
  })

  const text = [
    ORPHANS.emailHeading(site, day),
    '',
    ORPHANS.emailBody(site, since, theme, ORPHAN_SNAPSHOT_DAYS, day),
    '',
    ORPHANS.emailKeep(site),
    '',
    `${ORPHANS.emailButton}: ${url}`,
    '',
    ORPHANS.emailOnly,
    'Inflozo · inflozo.com',
  ].join('\n')

  return { subject: ORPHANS.emailSubject(site, day), html, text }
}
