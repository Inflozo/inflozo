import { deadlineLabel } from '../app/(app)/app/(authed)/account/deletion-rule.ts'
import { HEALTH } from './connect-rule.ts'
import { emailShell, escape } from './email-shell.ts'
import { reasonSentence, type HealthReason } from './health-rule.ts'

/**
 * FR-P1's THIRD EMAIL — "Reconnect needed", once per healthy→unhealthy transition and never again
 * (FR-C5, FR-P2). Story 3.7.
 *
 * IT RIDES `lib/email-shell.ts`, the shell `deletion-email.ts` was drawn on and whose header names
 * this story: a transactional email is not a drawn surface, so the nearest drawn thing is the
 * sign-in email the same person has already received. A second email vocabulary would be a second
 * thing to keep in step (R-74).
 *
 * IT SAYS WHICH SITE, WHAT GHOST SAID, THE DATE, AND OFFERS ONE BUTTON — the Manage keys popup,
 * which is what "Reconnect needed" is FOR (EXPERIENCE.md's promised second entry point).
 *
 * IT DOES NOT DIAGNOSE (R-100). `api_keys` carries no install identity, so Ghost answers the same
 * 401 to a wrong key and to another install's key; the reason table says the key no longer works
 * and where to get a new one, and never why. And it PROMISES NO SECOND EMAIL: FR-P2 permits no
 * nudges, so the note under the rule says so in the same words the deletion email does.
 *
 * PURE, and the site's title is escaped — it is text a Ghost site's owner controls.
 */
export function healthEmail({
  site,
  reason,
  at,
  keysUrl,
}: {
  /** What the customer calls this site: its Ghost title, else its host. Escaped here. */
  site: string
  /** The code `healthOf` decided, or null for a cause the table does not name. */
  reason: HealthReason | string | null
  /** When the check ran — `sites.last_checked_at`, the same stamp the card's caption reads. */
  at: string | Date
  /** `https://app.inflozo.com/sites?manage=<siteId>` — the Manage keys window. */
  keysUrl: string
}): { subject: string; html: string; text: string } {
  const safe = escape(site)
  const date = deadlineLabel(at)
  const said = reasonSentence(reason) ?? HEALTH.emailUnknown
  const subject = HEALTH.emailSubject(site)
  const opening = HEALTH.emailBody(date)
  const only = HEALTH.emailOnly

  const html = emailShell({
    subject: HEALTH.emailSubject(safe),
    preheader: HEALTH.emailPreheader,
    heading: HEALTH.emailHeading(safe),
    // The reason is the product's own sentence and is NOT escaped: it carries apostrophes, and
    // `&#39;` in an inbox is a defect. Only the site's title crosses from somebody else.
    paragraphs: [opening, said],
    button: { label: HEALTH.emailButton, url: keysUrl },
    note: only,
  })

  const text = [
    HEALTH.emailHeading(site),
    '',
    opening,
    '',
    said,
    '',
    `${HEALTH.emailButton}: ${keysUrl}`,
    '',
    only,
    'Inflozo · inflozo.com',
  ].join('\n')

  return { subject, html, text }
}
