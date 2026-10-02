/* ─────────────────────────────────────────── Story 5.21 — GHOST'S TWO SURFACES ON THE CANVAS (FR-H5), AS DATA.
 *
 * `{{ghost_head}}` puts two things on a Ghost page that no theme draws: the ANNOUNCEMENT BAR, prepended to the body above
 * everything the theme renders, and PORTAL's floating subscribe button, fixed in the bottom-right corner. The editor draws
 * both on the canvas, where Ghost puts them, from the connection's snapshot (`storedSurfaces`), so a header is designed
 * knowing what sits above it and beside it. Everything that decides a shim and is not the DOM write lives here: when each
 * shows, Ghost's markup built from text and marks only, Ghost's own stylesheets as recorded, and the marker NFR-6(c3)
 * finds them by. `editor.tsx`'s `drawShims` is the few lines that write it.
 *
 * PURE: its imports are the runtime's mark helpers, the URL scheme, View as's visitors and types, so `node --test`
 * reaches all of it (`ghost-surfaces.test.ts`), as it does `lib/view-as.ts`. The one step that needs a DOM — parsing the stored HTML — is
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
import { isAccent, PORTAL_ICONS, type Members, type PortalIcon, type Surfaces } from './probe-rule.ts'
import { VISITORS, type Visitor } from './view-as.ts'

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

/** What the button draws: Portal's member look, or the logged-out look `portal_button_style`, the label and the icon
 *  choose. `icon` is the glyph: the person at 26 or 34px, the site's chosen icon — one of `PORTAL_ICONS`, or its own
 *  image as an `https:` URL, as `storedSurfaces` re-checked it — or none. */
export type ButtonLook = { member: boolean; icon: 26 | 34 | string | null; label: string | null }

/**
 * THE BUTTON, OR NULL — Portal's own rules (2.69.339 `trigger-button.jsx`; 2.51.5 `TriggerButton.js` the same):
 *   `!portal_button` draws nothing, and nor does `members_signup_access === 'none'` (`isSigninAllowed`,
 *   `utils/helpers.js:277-279`) — a site with no members record is not checked, since there is nothing to check;
 *   BELOW 640px nothing is drawn (`isMobile: window.innerWidth < 640`) — a MEDIA QUERY in `PORTAL_CSS`, so a device
 *   change needs no repaint;
 *   a signed-in member (View as's Free and Paid member) always meets the member look: a 60px circle, no label, the halo
 *   ring and the person icon at 34px (a preview member has no avatar);
 *   a logged-out visitor meets `portal_button_style`: a label only for `icon-and-text` and `text-only`, and only where
 *   the label is not empty (`hasText`); for the two icon styles the icon the site chose (DW-278, `renderTriggerIcon`
 *   :104-143) — a preset or its own image — else the person, 26px beside a label and 34px alone.
 */
export function portalFor(surfaces: Surfaces | null, members: Members | null, visitor: Visitor): ButtonLook | null {
  if (surfaces === null || !surfaces.portal.button) return null
  if (members !== null && members.signup_access === 'none') return null
  if (visitor !== 'anonymous') return { member: true, icon: 34, label: null }
  const { style, label, icon } = surfaces.portal
  const text = style !== 'icon-only' && label !== ''
  return { member: false, icon: style === 'text-only' ? null : (icon ?? (text ? 26 : 34)), label: text ? label : null }
}

/** Portal's person icon (`images/icons/user.svg`), VERBATIM as the trigger renders it at either size (recorded, `icon.html`). */
export const userIcon = (px: 26 | 34): string =>
  `<svg id="Regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: ${px}px; height: ${px}px; color: rgb(255, 255, 255);"><defs><style>.cls-1{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.8px;}</style></defs><circle class="cls-1" cx="12" cy="9.75" r="5.25"></circle><path class="cls-1" d="M18.913,20.876a9.746,9.746,0,0,0-13.826,0"></path><circle class="cls-1" cx="12" cy="12" r="11.25"></circle></svg>`

/** DW-278 — PORTAL'S FIVE PRESETS (`images/icons/button-icon-{1…5}.svg`, the same paths in 2.69.339 and 2.51.5), each as
 *  the trigger renders it: React's SVG with Portal's `buttonIcon` style, 24px and white. Derived from Portal's source by
 *  the serializer that reproduces `userIcon` byte for byte, and held to the RECORDING (`portal.icons` in `surfaces.json`,
 *  both majors) by `ghost-surfaces.test.ts` — which fails, naming the recorder, until that recording exists. */
const PRESETS: Readonly<Record<PortalIcon, string>> = {
  'icon-1': '<svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; color: rgb(255, 255, 255);"><path d="M10.533 11.267c2.835 0 5.134-2.299 5.134-5.134C15.667 3.298 13.368 1 10.533 1 7.698 1 5.4 3.298 5.4 6.133s2.298 5.134 5.133 5.134zM1 23c0-2.529 1.004-4.953 2.792-6.741 1.788-1.788 4.213-2.792 6.741-2.792 2.529 0 4.954 1.004 6.741 2.792 1.788 1.788 2.793 4.212 2.793 6.74" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  'icon-2': '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; color: rgb(255, 255, 255);"><g fill="none" fill-rule="evenodd"><path stroke="#FFF" stroke-width="1.5" stroke-linecap="round" d="M12.5 2v20M2 12.5h20"></path></g></svg>',
  'icon-3': '<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; color: rgb(255, 255, 255);"><path d="M23.5 6v14.25c0 .597-.237 1.169-.659 1.591-.422.422-.994.659-1.591.659s-1.169-.237-1.591-.659c-.422-.422-.659-.994-.659-1.591V3c0-.398-.158-.78-.44-1.06-.28-.282-.662-.44-1.06-.44h-15c-.398 0-.78.158-1.06.44C1.157 2.22 1 2.601 1 3v17.25c0 .597.237 1.169.659 1.591.422.422.994.659 1.591.659h18M4.75 15h10.5M4.75 18h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.5 5.25h-9c-.414 0-.75.336-.75.75v4.5c0 .414.336.75.75.75h9c.414 0 .75-.336.75-.75V6c0-.414-.336-.75-.75-.75z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  'icon-4': '<svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; color: rgb(255, 255, 255);"><path d="M21.75 1.5H2.25c-.828 0-1.5.672-1.5 1.5v12c0 .828.672 1.5 1.5 1.5h19.5c.828 0 1.5-.672 1.5-1.5V3c0-.828-.672-1.5-1.5-1.5zM15.687 6.975L19.5 10.5M8.313 6.975L4.5 10.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22.88 2.014l-9.513 6.56C12.965 8.851 12.488 9 12 9s-.965-.149-1.367-.426L1.12 2.014" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  'icon-5': '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px; color: rgb(255, 255, 255);"><path d="M17.903 12.016c-.332-1.665-1.491-3.032-3.031-3.654M11.037 8.4C9.252 9.163 8 10.935 8 13c0 .432.055.85.158 1.25M10.44 17.296c.748.447 1.624.704 2.56.704 1.71 0 3.22-.858 4.12-2.167M15.171 21.22c3.643-.96 6.329-4.276 6.329-8.22 0-1.084-.203-2.121-.573-3.075M18.611 6.615C17.114 5.3 15.151 4.5 13 4.5c-2.149 0-4.112.797-5.608 2.113M5.112 9.826c-.395.98-.612 2.052-.612 3.174 0 4.015 2.783 7.38 6.526 8.27" stroke="#fff" stroke-width="1.5" stroke-linecap="round"></path><path d="M8.924 24.29c1.273.46 2.645.71 4.076.71 5.52 0 10.17-3.727 11.57-8.803M6.712 2.777C3.285 4.89 1 8.678 1 13c0 3.545 1.537 6.731 3.982 8.928M24.849 11.089C23.933 5.369 18.977 1 13 1c-.69 0-1.367.058-2.025.17" stroke="#fff" stroke-width="1.5" stroke-linecap="round"></path></svg>',
}

/** The glyph inside the button, as `renderTriggerIcon` draws it: the person at its size, a preset's own SVG, or the site's
 *  image at 26×26 with an empty alt — its address through `escapeUserText`, so it can never close the attribute.
 *  ponytail: the image's markup is read in Portal's source (both majors), not recorded; a step with an image URL in
 *  `record-ghost-surfaces.cjs` is the upgrade if it is ever held byte for byte. */
const glyph = (icon: ButtonLook['icon']): string =>
  icon === null
    ? ''
    : typeof icon === 'number'
      ? userIcon(icon)
      : (PORTAL_ICONS as readonly string[]).includes(icon)
        ? PRESETS[icon as PortalIcon]
        : `<img style="width: 26px; height: 26px;" src="${escapeUserText(icon)}" alt="">`

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
      `<div class="gh-portal-triggerbtn-wrapper"><div class="${container}">${glyph(look.icon)}${label}</div></div>` +
      '</div></div>',
  }
}

/* ── THE LAYERS ROWS AND HIDE — the owner's finding at Story 5.21's review (2026-09-26, Question 2 ruled option 1) ───────
 *
 * Someone could take the strip or the button for something Inflozo added, and there was no way to get them out of the
 * way while building. So the Layers panel names them, under one heading, each with a section row's own Hide / Show; the
 * canvas shows a pointed shim the tag sections get, and a press chooses its row. HIDDEN IS THE BUILDER'S ALONE: kept in
 * this browser per project, never in the doc, never in the theme, and not in Preview, which is the site as a visitor
 * meets it. ONE LIST FOR THE WORDS (R-170): the rows, the tag, the sentence and what is said all read it. */

export type SurfaceId = (typeof SURFACE)[keyof typeof SURFACE]
/** the two rows, in the order they sit on the page: the strip above, the button below */
export const GHOST_ROWS: readonly { id: SurfaceId; name: string }[] = [
  { id: SURFACE.strip, name: 'Announcement bar' },
  { id: SURFACE.button, name: 'Subscribe button' },
]
export const GHOST_WORDS = {
  group: 'From your Ghost site',
  line: 'Your Ghost site adds this. Hide it here while you build, or change it in Ghost admin.',
  tag: (name: string): string => `From your Ghost site · ${name}`,
  hidden: (name: string): string => `${name} hidden on this canvas`,
  shown: (name: string): string => `${name} shown again`,
  how: 'Press Enter to select it, and Space to hide or show it while you build.',
} as const
export const ghostName = (id: SurfaceId | null): string => GHOST_ROWS.find((r) => r.id === id)?.name ?? ''

/** R-215 — THE ROWS THE SITE SHOWS, in the page's order: Layers names a surface only while the site has it on, by Ghost's
 *  own rules — the bar when SOME visitor meets it (`announcementFor`: `isFilled`'s words and a non-empty audience,
 *  `ghost_head.js` 6.58.0 :177), the button when Portal draws it for a logged-out visitor (`portal_button` on and
 *  sign-up not Nobody, `isSigninAllowed`). The site's setting decides, never View as or the window's width. Empty for
 *  none, and the editor then draws no group. A hidden row's id stays in this browser's list (`readHidden`), so a surface
 *  switched off and on again comes back hidden. */
export const rowsOn = (surfaces: Surfaces | null, members: Members | null, parse: (html: string) => MarkNode): typeof GHOST_ROWS =>
  GHOST_ROWS.filter(({ id }) =>
    id === SURFACE.strip ? VISITORS.some((v) => announcementFor(surfaces, v, parse) !== null) : portalFor(surfaces, members, 'anonymous') !== null,
  )

/** the browser's key for one project's hidden shims */
/** The group's rows: each surface the site shows (`rowsOn`), with this browser's Hide on it. The hidden ids are NEVER
 *  pruned to the rows shown — a surface switched off keeps its id, so it comes back hidden when the site shows it again
 *  (R-215's matrix row). */
export const ghostRowsOf = (shown: typeof GHOST_ROWS, hidden: readonly SurfaceId[]) => shown.map((r) => ({ ...r, hidden: hidden.includes(r.id) }))

export const HIDDEN_KEY = (projectId: string): string => `inflozo-ghost-hidden:${projectId}`
type Store = Pick<Storage, 'getItem' | 'setItem'>
/** what this browser hides for the project: the known ids alone, and nothing where the store is absent, refused or junk */
export function readHidden(store: Store | null | undefined, projectId: string): SurfaceId[] {
  try {
    const raw = store?.getItem(HIDDEN_KEY(projectId))
    const list: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? (GHOST_ROWS.map((r) => r.id).filter((id) => list.includes(id))) : []
  } catch {
    return []
  }
}
/** writes the list; a refusing store (a private window, a full quota) costs nothing but the memory */
export function writeHidden(store: Store | null | undefined, projectId: string, ids: readonly SurfaceId[]): void {
  try {
    store?.setItem(HIDDEN_KEY(projectId), JSON.stringify(ids))
  } catch {
    /* the browser refused: hidden holds for this opening alone */
  }
}

