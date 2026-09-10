/**
 * THE ONE EMAIL THE PRODUCT SENDS ITSELF, AS A SHELL — the paper, the 400px card, the mark, the
 * ink button, the footer, and the five escapes. Story 3.7 lifted it out of `deletion-email.ts`,
 * whose header already argued the whole design and named this story while doing it:
 *
 *   IT IS DRAWN FROM `supabase/auth/magic-link.html`, not from a frame. A transactional email is
 *   not a drawn surface (epics.md, Stories 3.7 and 7.31), and the nearest thing that IS drawn is
 *   the sign-in email the same person has already had. Same paper, same 400px card, same header
 *   row with the PNG mark, same ink button, same footer, same hexes — every one of them
 *   `globals.css`'s token VALUE, inline, because an email client has neither custom properties nor
 *   a stylesheet it can be trusted with. A second email vocabulary would be a second thing to keep
 *   in step (R-74).
 *
 * SO WITH A SECOND CALLER IT MOVED, rather than being copied for the reconnect notice. Every
 * element `deletionEmail` emitted it still emits — the button, the pasteable URL, the theme block,
 * the footer rule — and `deletion-email.test.ts` asserts each of them unchanged; what differs is
 * the whitespace BETWEEN blocks, which no inbox and no assertion reads.
 *
 * PURE, and every user value escaped by the caller. A site title is text a Ghost site's owner
 * controls; it arrives through a `select` and goes out inside markup.
 */

/* The template's own hexes, which are `globals.css`'s token values (`magic-link.html:14-16`). */
export const PAPER = '#F7F5F2'
export const SURFACE = '#FFFFFF'
export const INK = '#1C1B1A'
export const INK_SOFT = '#6E6A64'
export const LINE = '#E7E2DB'

export const SYSTEM = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
export const DISPLAY = "'Trebuchet MS','Segoe UI',sans-serif"

/**
 * The five, on USER values only. The product's own copy is not escaped and must not be: it carries
 * apostrophes ("we'll"), and `&#39;` in an inbox is a defect, not a precaution. What is escaped is
 * what somebody else wrote — a site's title, a theme's name, a site's URL — and the destination
 * URL the action composes.
 */
export const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * @param preheader the hidden line an inbox shows beside the subject.
 * @param paragraphs the body, in order; each is already-safe HTML.
 * @param button the one ink button and the pasteable URL under it. Escaped here.
 * @param extra already-safe HTML between the button and the footer rule — the deletion email's
 * theme list is the only caller that has one.
 * @param note the one line under the footer rule: what this email promises about the next one.
 */
export function emailShell({
  subject,
  preheader,
  heading,
  paragraphs,
  button,
  extra = '',
  note,
}: {
  subject: string
  preheader: string
  heading: string
  paragraphs: string[]
  button?: { label: string; url: string }
  extra?: string
  note: string
}): string {
  const body = paragraphs
    .map(
      (line) =>
        `\n\n                <div style="font-size:14px;line-height:1.55;color:${INK_SOFT};padding-top:10px;">${line}</div>`,
    )
    .join('')

  const buttonHtml = button
    ? `

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-top:24px;">
                  <tr>
                    <td align="center" bgcolor="${INK}" style="border-radius:12px;">
                      <a href="${escape(button.url)}"
                         style="display:inline-block;height:44px;line-height:44px;padding:0 24px;background:${INK};color:${SURFACE};font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">${button.label}</a>
                    </td>
                  </tr>
                </table>

                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:24px;">Or paste this into your browser:</div>
                <div style="font-size:13px;line-height:1.5;padding-top:4px;word-break:break-all;">
                  <a href="${escape(button.url)}" style="color:${INK_SOFT};">${escape(button.url)}</a>
                </div>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:${PAPER};">
    <div style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;">
      ${preheader}
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

                <div style="font-family:${DISPLAY};font-weight:700;font-size:28px;letter-spacing:-0.01em;line-height:1.15;color:${INK};padding-top:10px;">${heading}</div>${body}${buttonHtml}
${extra}
                <div style="border-top:1px solid ${LINE};margin-top:28px;"></div>
                <div style="font-size:13px;line-height:1.5;color:${INK_SOFT};padding-top:16px;">${note}</div>
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
}
