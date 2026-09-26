/* ─────────────────────────────────────────── Story 5.21 — GHOST'S TWO SURFACES ON THE CANVAS (FR-H5), AS DATA.
 *
 * `{{ghost_head}}` puts two things on a Ghost page that no theme draws: the ANNOUNCEMENT BAR, prepended to the body above
 * everything the theme renders, and PORTAL's floating subscribe button, fixed in the bottom-right corner. The editor draws
 * both on the canvas, where Ghost puts them, from the connection's snapshot (`storedSurfaces`), so a header is designed
 * knowing what sits above it and beside it. Everything that decides a shim and is not the DOM write lives here: when each
 * shows, Ghost's markup built from text and marks only, Ghost's own stylesheets as recorded, and the marker NFR-6(c3)
 * finds them by. `editor.tsx`'s `drawShims` is the few lines that write it.
 *
 * PURE: its imports are the runtime's mark helpers, the URL scheme and types, so `node --test` reaches all of it
 * (`ghost-surfaces.test.ts`), as it does `lib/view-as.ts`. The one step that needs a DOM — parsing the stored HTML — is
 * HANDED IN (`parse`): the editor passes `DOMParser`'s inert document, the test jsdom's.
 *
 * GHOST'S LOOK, NOT INFLOZO'S (R-74, FR-H5): the export draws neither surface, and these stand in for Ghost's page rather
 * than Inflozo's interface, so every class, rule and number below is Ghost's — read in its source and RECORDED on both
 * majors (MEASUREMENTS §55, `packages/ghost-shim/fixtures/ghost{5,6}/surfaces.json`), which the test holds them to.
 *
 * INERT BY CONSTRUCTION: both roots carry `inert` and `pointer-events: none; user-select: none`, so a press, a hover or a
 * touch reaches whatever lies beneath. Neither carries a `data-inflozo-*` attribute (the rest count and the journey's
 * `marked()` would see it) nor a `data-module` (`core` would mount it); both carry `data-ghost-surface`, and nothing else
 * in the canvas document does (NFR-6(c3)).
 */

import { escapeUserText, readMarks, serializeMarks, type MarkNode, type RichText } from '@inflozo/section-runtime'
import type { PropDef } from '@inflozo/library'
import { isSurface, type CanvasKey } from './editor.ts'
import type { EditorSite } from './live-content.ts'
import { isAccent, type Members, type Surfaces } from './probe-rule.ts'
import type { Visitor } from './view-as.ts'

/** NFR-6(c3)'s marker: `[data-ghost-surface]` finds exactly the shims drawn, and each value names its surface. */
export const SURFACE = { strip: 'announcement-bar', button: 'portal-button' } as const
/** The attribute the strip's stylesheet carries in the canvas `<head>` — NOT `data-ghost-surface`, so the marker still finds
 *  the two drawn roots and nothing else. */
export const SHEET = 'data-ghost-sheet'

/** Ghost's own accent where a site has none (`default-settings.json`'s `accent_color`, both majors). */
export const GHOST_ACCENT = '#FF1A75'

/** One shim: its root's attributes, and what goes inside it — the strip's light-DOM markup, or the button's shadow root. */
export type Shim = { attributes: Readonly<Record<string, string>>; html: string }

/** Whether this canvas draws Ghost's surfaces at all: every PAGE canvas of a project whose site is connected (the snapshot is
 *  handed only for a linked site that is not disconnected, `read.ts`), and never a template surface — the Paywall is a
 *  partial of a post, not a page Ghost prepends a bar to. What the content pill shows does not enter: these are the
 *  connection's settings, not its content. */
export const shimsOn = (key: CanvasKey, site: EditorSite): boolean => !isSurface(key) && site !== null && site.surfaces !== undefined

/* ── THE STRIP — Ghost's announcement bar ─────────────────────────────────────────────────────────────────────────── */

export type Background = 'accent' | 'dark' | 'light'
const BACKGROUNDS: readonly string[] = ['accent', 'dark', 'light'] satisfies readonly Background[]

/** MEASUREMENTS §46(c): the audience word Ghost's endpoint tests for each visitor View as previews
 *  (`announcement-bar-settings.js` :28-50, both majors) — `visitors` is no member, `free_members` status free, and
 *  `paid_members` any status but free, which is why a comped or gift member previews as Paid (`lib/view-as.ts`). */
export const AUDIENCE: Readonly<Record<Visitor, string>> = { anonymous: 'visitors', free: 'free_members', paid: 'paid_members' }

/** Ghost's bar styles exactly three of the four marks — `strong`, `i`/`em` and `a` — so the stored words are read for those
 *  alone; an underline is its words (the `u` element is `all: unset` there too). */
export const GHOST_MARKS = ['strong', 'em', 'a'] as const
const WORDS: PropDef = { type: 'richtext', label: 'Announcement', marks: [...GHOST_MARKS] }

/**
 * THE BAR, OR NULL — Ghost's two rules, in order:
 *   `{{ghost_head}}`'s `isFilled` (`ghost_head.js`, g5 :106-140, g6 :175-209): the content has words AND the audience list
 *   is not empty — otherwise the script is not even injected (recorded: the list emptied, no script and no root);
 *   the endpoint's audience rule for this visitor (`AUDIENCE`).
 * The stored HTML is PARSED INERTLY (`parse`, a `DOMParser` document, whose scripts never run and whose images never load)
 * and read as text plus Ghost's three marks (`readMarks`) — a link survives only as http, https, mailto or tel. Its
 * paragraphs run on inline, as Ghost's `all: unset` leaves them, so no line break is ever read into it.
 * ponytail: two stored paragraphs are read with a space between them where Ghost's page runs them together with none;
 *   Ghost Admin's field is single-paragraph and saves `''` when it holds no text (MEASUREMENTS §55, read in its bundle),
 *   so only a write through the API reaches this; reading block edges as nothing is the upgrade if one ever needs it.
 * A background outside Ghost's three is Ghost's own default, `dark` (its `isIn` is not a validation, so a stored value
 * is not guaranteed to be one of them).
 */
export function announcementFor(
  surfaces: Surfaces | null,
  visitor: Visitor,
  parse: (html: string) => MarkNode,
): { background: Background; words: RichText } | null {
  if (surfaces === null) return null
  const { content, background, visibility } = surfaces.announcement
  if (visibility.length === 0 || !visibility.includes(AUDIENCE[visitor]) || content.trim() === '') return null
  const words = readMarks(parse(content), GHOST_MARKS, false)
  if (words.text.trim() === '') return null
  return { background: BACKGROUNDS.includes(background) ? (background as Background) : 'dark', words }
}

/** Ghost's close icon, VERBATIM as the bar renders it (recorded, `close_svg`). It is drawn because it is part of Ghost's
 *  bar, and it does nothing: the whole strip is inert. */
export const CLOSE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16"><path stroke-linecap="round" stroke-width="0.4" fill="currentColor" stroke="#000000" stroke-linejoin="round" d="M.44,21.44a1.49,1.49,0,0,0,0,2.12,1.5,1.5,0,0,0,2.12,0l9.26-9.26a.25.25,0,0,1,.36,0l9.26,9.26a1.5,1.5,0,0,0,2.12,0,1.49,1.49,0,0,0,0-2.12L14.3,12.18a.25.25,0,0,1,0-.36l9.26-9.26A1.5,1.5,0,0,0,21.44.44L12.18,9.7a.25.25,0,0,1-.36,0L2.56.44A1.5,1.5,0,0,0,.44,2.56L9.7,11.82a.25.25,0,0,1,0,.36Z"></path></svg>'

/** THE STYLESHEET GHOST'S SCRIPT APPENDS TO `<head>` at run time (`@tryghost/announcement-bar` 1.1.556), VERBATIM as recorded
 *  on both majors — one global sheet, no shadow root and no iframe, so the bar meets the theme's CSS as it will on the
 *  live site. It carries no font-family: the bar inherits the page's body font. */
export const ANNOUNCEMENT_CSS =
  '.gh-announcement-bar,.gh-announcement-bar *{box-sizing:border-box!important}.gh-announcement-bar{z-index:90;text-align:center;justify-content:center;align-items:center;min-height:48px;padding:12px 48px;font-size:15px;line-height:23px;display:flex;position:relative}.gh-announcement-bar.light{color:#15171a;background-color:#f0f0f0}.gh-announcement-bar.accent{background-color:var(--ghost-accent-color);color:#fff}.gh-announcement-bar.dark{color:#fff;background-color:#15171a}.gh-announcement-bar :not(path){all:unset}.gh-announcement-bar strong{font-weight:700}.gh-announcement-bar :is(i,em){font-style:italic}.gh-announcement-bar a{color:#fff;cursor:pointer;font-weight:700;text-decoration:underline}.gh-announcement-bar.light a{color:var(--ghost-accent-color)!important}.gh-announcement-bar button{color:#fff;cursor:pointer;background-color:#0000;border:0;justify-content:center;align-items:center;width:32px;height:32px;margin-top:-16px;padding:0;display:flex;position:absolute;top:50%;right:8px}.gh-announcement-bar.light button{color:#888}.gh-announcement-bar svg{fill:currentColor;width:10px;height:10px}\n/*$vite$:1*/'

const accentOf = (accent: string | null) => (isAccent(accent) ? accent : GHOST_ACCENT)

/**
 * THE STRIP'S ROOT AND ITS MARKUP — Ghost's own: `div#announcement-bar-root > div.gh-announcement-bar.<bg> >
 * div.gh-announcement-bar-content + button[aria-label="close"] > svg`. The words are written ONLY through `serializeMarks`
 * (text escaped, three marks, a link's href through the one link sink) — the stored HTML never reaches `innerHTML`
 * (NFR-3), where Ghost's own bar injects it raw (`dangerouslySetInnerHTML`).
 *
 * THE ROOT STANDS IN FOR TWO THINGS GHOST HAS AND THE CANVAS DOES NOT, and sets both on itself, never on `:root` or
 * `<body>`, so the design renders exactly as before:
 *   `--ghost-accent-color` — `{{ghost_head}}` writes it on `:root`; here the snapshot's accent (Ghost's default where none);
 *   the theme's BODY FONT, which Ghost's bar inherits (recorded: the bar's font is Casper's body's) — the canvas document's
 *   `<body>` carries no font of its own (each section sets its own), while a theme's body carries the pack's body font,
 *   `var(--font-body)` in the reference tokens (`tools/stress/build.js`'s body rule is that shape).
 * ponytail: a design that declared its own `#announcement-bar-root` would take Ghost's bar into itself on the live site;
 *   none does, and the shim always prepends. Honouring a declared one is the upgrade if a design ever carries it.
 */
export function stripMarkup(a: { background: Background; words: RichText }, accent: string | null): Shim {
  return {
    attributes: {
      id: 'announcement-bar-root',
      'data-ghost-surface': SURFACE.strip,
      inert: '',
      style: `--ghost-accent-color:${accentOf(accent)};font-family:var(--font-body);pointer-events:none;user-select:none`,
    },
    html:
      `<div class="gh-announcement-bar ${a.background}"><div class="gh-announcement-bar-content">${serializeMarks(a.words, WORDS)}</div>` +
      `<button aria-label="close">${CLOSE_SVG}</button></div>`,
  }
}

/* ── THE BUTTON — Portal's floating trigger ─────────────────────────────────────────────────────────────────────────── */

/** What the button draws: Portal's member look, or the logged-out look `portal_button_style` and the label choose. */
export type ButtonLook = { member: boolean; icon: 26 | 34 | null; label: string | null }

/**
 * THE BUTTON, OR NULL — Portal's own rules (2.69.339 `trigger-button.jsx`; 2.51.5 `TriggerButton.js` the same):
 *   `!portal_button` draws nothing, and nor does `members_signup_access === 'none'` (`isSigninAllowed`,
 *   `utils/helpers.js:277-279`) — a site with no members record is not checked, since there is nothing to check;
 *   BELOW 640px nothing is drawn (`isMobile: window.innerWidth < 640`) — a MEDIA QUERY in `PORTAL_CSS`, so a device
 *   change needs no repaint;
 *   a signed-in member (View as's Free and Paid member) always meets the member look: a 60px circle, no label, the halo
 *   ring and the person icon at 34px (a preview member has no avatar);
 *   a logged-out visitor meets `portal_button_style`: a label only for `icon-and-text` and `text-only`, and only where
 *   the label is not empty (`hasText`); the icon for the two icon styles, 26px beside a label and 34px alone.
 * The icon is always Ghost's default person icon (`user.svg`), whichever the site chose (DW-278).
 */
export function portalFor(surfaces: Surfaces | null, members: Members | null, visitor: Visitor): ButtonLook | null {
  if (surfaces === null || !surfaces.portal.button) return null
  if (members !== null && members.signup_access === 'none') return null
  if (visitor !== 'anonymous') return { member: true, icon: 34, label: null }
  const { style, label } = surfaces.portal
  const text = style !== 'icon-only' && label !== ''
  return { member: false, icon: style === 'text-only' ? null : text ? 26 : 34, label: text ? label : null }
}

/** Portal's person icon (`images/icons/user.svg`), VERBATIM as the trigger renders it at either size (recorded, `icon.html`). */
export const userIcon = (px: 26 | 34): string =>
  `<svg id="Regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: ${px}px; height: ${px}px; color: rgb(255, 255, 255);"><defs><style>.cls-1{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.8px;}</style></defs><circle class="cls-1" cx="12" cy="9.75" r="5.25"></circle><path class="cls-1" d="M18.913,20.876a9.746,9.746,0,0,0-13.826,0"></path><circle class="cls-1" cx="12" cy="12" r="11.25"></circle></svg>`

/** PORTAL'S OWN TRIGGER RULES (2.69.339 `trigger-button.styles.js`, which 2.51.5 matches but for two blank lines), VERBATIM
 *  as recorded inside the trigger's frame on T1. Its hover and right-to-left rules never match here, and are kept verbatim. */
export const TRIGGER_CSS = `
    .gh-portal-triggerbtn-wrapper {
        display: inline-flex;
        align-items: flex-start;
        justify-content: flex-end;
        height: 100%;
        opacity: 1;
        transition: transform 0.16s linear 0s; opacity 0.08s linear 0s;
        user-select: none;
        line-height: 1;
        padding: 10px 28px 0 17px;
    }
    html[dir="rtl"] .gh-portal-triggerbtn-wrapper {
        padding: 10px 17px 0 28px;
    }

    .gh-portal-triggerbtn-wrapper span {
        margin-bottom: 1px;
    }

    .gh-portal-triggerbtn-container {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--brandcolor);
        height: 60px;
        min-width: 60px;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 8px 16px -2px;
        border-radius: 999px;
        transition: opacity 0.3s ease;
    }

    .gh-portal-triggerbtn-container:before {
        position: absolute;
        content: "";
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: 999px;
        background: rgba(var(--whitergb), 0);
        transition: background 0.3s ease;
    }

    .gh-portal-triggerbtn-container:hover:before {
        background: rgba(var(--whitergb), 0.08);
    }

    .gh-portal-triggerbtn-container.halo:before {
        top: -4px;
        right: -4px;
        bottom: -4px;
        left: -4px;
        border: 4px solid rgba(var(--whitergb), 0.15);
    }

    .gh-portal-triggerbtn-container.with-label {
        padding: 0 12px 0 16px;
    }
    html[dir="rtl"] .gh-portal-triggerbtn-container.with-label {
        padding: 0 16px 0 12px;
    }

    .gh-portal-triggerbtn-label {
        padding: 8px;
        color: var(--white);
        display: block;
        white-space: nowrap;
        max-width: 380px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

/** The two of Portal's global rules the trigger depends on (`global.styles.js`), each VERBATIM as recorded. */
export const PORTAL_GLOBALS = ['*, ::after, ::before {\n        box-sizing: border-box;\n    }', 'svg {\n        box-sizing: content-box;\n    }'] as const

/** Portal's frame, as the trigger's iframe carries it inline (recorded, `iframe.style`): fixed at `bottom: 0; right: 0`,
 *  98px tall, at most 500px wide, above almost everything. */
export const FRAME = { zIndex: 3999998, height: 98, maxWidth: 500, narrow: 105 } as const
/** Portal draws no button below this width (`isMobile: window.innerWidth < 640`). */
export const PORTAL_MIN_WIDTH = 640
/** Portal's body font (`global.styles.js`'s `body`), which the label inherits (recorded: the label's font-family). */
export const PORTAL_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'

/** THE BUTTON'S SHADOW STYLESHEET: Portal's frame (its inline style), its document's `body` (at 16px: Portal sets `html` to
 *  62.5% and `body` to 1.6rem, and a `rem` here is the canvas's), the two global rules and the trigger's own, verbatim, and
 *  the 640px rule as a media query over the canvas's own viewport. Nothing here reaches the canvas document: it is the
 *  shadow root's alone, as Portal's iframe keeps the theme out. */
export const PORTAL_CSS =
  `.gh-portal-triggerbtn-iframe{position:fixed;bottom:0;right:0;z-index:${FRAME.zIndex};height:${FRAME.height}px;max-width:${FRAME.maxWidth}px;overflow:hidden;border:0;--white:#fff;--whitergb:255,255,255}` +
  `@media (width < ${PORTAL_MIN_WIDTH}px){.gh-portal-triggerbtn-iframe{display:none}}` +
  `.gh-portal-frame{margin:0;height:100%;overflow:hidden;box-sizing:border-box;font-family:${PORTAL_FONT};font-size:16px;line-height:1.6em;font-weight:400;font-style:normal;color:#3d3d3d}` +
  `${PORTAL_GLOBALS.join('\n')}${TRIGGER_CSS}`

/**
 * THE BUTTON'S HOST AND ITS SHADOW ROOT — Portal's markup inside Portal's frame: `div.gh-portal-triggerbtn-iframe` stands in
 * for the iframe and `div.gh-portal-frame` for its body, then Portal's own `wrapper > container > icon + label`.
 *
 * THE FRAME'S WIDTH IS PORTAL'S: 105px without a label, otherwise the wrapper's measured width + 2 (`frame.jsx`) — here
 * the fixed frame shrinks to fit its wrapper and 2px of right padding are the + 2. The label is text, escaped.
 *
 * THE HOST carries `all: initial`, so nothing of the canvas body's type reaches the button, as Portal's iframe keeps the
 * theme out; custom properties still inherit through it, which is why the frame declares its own (`--brandcolor` inline:
 * the snapshot's accent, validated, never a `:root` value).
 */
export function buttonMarkup(look: ButtonLook, accent: string | null): Shim {
  const label = look.label === null ? '' : `<span class="gh-portal-triggerbtn-label"> ${escapeUserText(look.label)} </span>`
  const container = look.label !== null ? 'gh-portal-triggerbtn-container with-label' : `gh-portal-triggerbtn-container ${look.member ? 'halo' : ''}`
  const width = look.label === null ? `width:${FRAME.narrow}px` : 'padding-right:2px'
  return {
    attributes: { id: 'ghost-portal-root', 'data-ghost-surface': SURFACE.button, inert: '', style: 'all:initial;pointer-events:none;user-select:none' },
    html:
      `<style>${PORTAL_CSS}</style>` +
      `<div class="gh-portal-triggerbtn-iframe" style="--brandcolor:${accentOf(accent)};${width}"><div class="gh-portal-frame">` +
      `<div class="gh-portal-triggerbtn-wrapper"><div class="${container}">${look.icon === null ? '' : userIcon(look.icon)}${label}</div></div>` +
      '</div></div>',
  }
}
