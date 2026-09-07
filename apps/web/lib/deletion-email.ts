import { deadlineLabel, DELETION_WINDOW_DAYS } from '../app/(app)/app/(authed)/account/deletion-rule.ts'

/**
 * FR-P1'S EIGHTH EMAIL — the one the product sends itself (the owner's ruling R-96, 2026-09-07),
 * at the moment a deletion is confirmed and never again. FR-A5's own last sentence and FR-P2 both
 * forbid a reminder, so this says the date, offers the way back, and says it is the only one.
 *
 * IT IS DRAWN FROM `supabase/auth/magic-link.html`, not from a frame: a transactional email is not
 * a drawn surface (epics.md, Stories 3.7 and 7.31), and the nearest thing that IS drawn is the
 * sign-in email the same person has already had. Same paper, same 400px card, same header row with
 * the PNG mark, same ink button, same footer, same hexes — every one of them `globals.css`'s token
 * VALUE, inline, because an email client has neither custom properties nor a stylesheet it can be
 * trusted with. A second email vocabulary would be a second thing to keep in step (R-74).
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

/* The template's own hexes, which are `globals.css`'s token values (`magic-link.html:14-16`). */
const PAPER = '#F7F5F2'
const SURFACE = '#FFFFFF'
const INK = '#1C1B1A'
const INK_SOFT = '#6E6A64'
const LINE = '#E7E2DB'

const SYSTEM = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const DISPLAY = "'Trebuchet MS','Segoe UI',sans-serif"

/**
 * The five, on USER values only. The product's own copy is not escaped and must not be: it carries
 * apostrophes ("we'll"), and `&#39;` in an inbox is a defect, not a precaution. What is escaped is
 * what somebody else wrote — a site's title, a theme's name, a site's URL — and the destination
 * URL the action composes.
 */
const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

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

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${PAPER};">
    <div style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;">
      Your Inflozo account is set to be deleted on ${date}. You can still restore it.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
      <tr>
        <td align="center" style="padding:40px 24px;">
          <table role="presentation" width="400" cellpadding="0" cellspacing="0" border="0" style="width:400px;max-width:100%;background:${SURFACE};border-radius:16px;">
            <tr>
              <td style="padding:40px 36px;font-family:${SYSTEM};color:${INK};">

                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="padding-right:8px;"><img src="https://inflozo.com/brand/mark-light@2x.png" width="27" height="27" alt="" style="display:block;width:27px;height:27px;border:0;"></td>
                  <td><div style="font-family:${DISPLAY};font-weight:800;font-size:22px;letter-spacing:-0.02em;color:${INK};">Inflozo</div></td>
                </tr></table>

                <div style="font-family:${DISPLAY};font-weight:700;font-size:28px;letter-spacing:-0.01em;line-height:1.15;color:${INK};padding-top:10px;">Your account will be deleted on ${date}</div>

                <div style="font-size:14px;line-height:1.55;color:${INK_SOFT};padding-top:10px;">${opening}</div>

                <div style="font-size:14px;line-height:1.55;color:${INK_SOFT};padding-top:10px;">${changeMind}</div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-top:24px;">
                  <tr>
                    <td align="center" bgcolor="${INK}" style="border-radius:12px;">
                      <a href="${escape(restoreUrl)}"
                         style="display:inline-block;height:44px;line-height:44px;padding:0 24px;background:${INK};color:${SURFACE};font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">Restore my account</a>
                    </td>
                  </tr>
                </table>

                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:24px;">Or paste this into your browser:</div>
                <div style="font-size:13px;line-height:1.5;padding-top:4px;word-break:break-all;">
                  <a href="${escape(restoreUrl)}" style="color:${INK_SOFT};">${escape(restoreUrl)}</a>
                </div>
${themesHtml}
                <div style="border-top:1px solid ${LINE};margin-top:28px;"></div>
                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:16px;">${only}</div>
                <div style="font-size:13px;color:${INK_SOFT};padding-top:8px;">Inflozo &middot; <a href="https://inflozo.com" style="color:${INK_SOFT};">inflozo.com</a></div>

              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

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
