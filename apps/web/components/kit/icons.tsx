/*
 * The app's icons — the frames' own drawings, read verbatim.
 *
 * Every path below is the inline <svg> markup of the Claude Design export (`Editor Sidebar
 * Kit.dc.html` and the S/B frames), copied as drawn under R-74: Claude Design's own, Feather-like
 * geometry, 24-unit viewBox, 1.5px stroke. No icon library is used here and no licence notice
 * is owed for these paths.
 *
 * Tabler (decision D1, ruling R-26) is the SECTIONS' icon set — the Icon Picker and the glyphs
 * inside the sites customers build — not Inflozo's own chrome. The owner ruled that scope on
 * 2026-09-05 (R-92, Story 1.3's review) when this file was found carrying Tabler's MIT notice
 * over drawings that were not Tabler's; the notice left with the ruling and returns with the
 * first Tabler path, which belongs in the library, not here.
 *
 * Icons are drawn inline, once per use (R-26): no sprite, no icon font, no package. Each inherits
 * `currentColor`, costs no request, and survives with everything switched off. MEMBERSHIP IS THE
 * KIT'S — every glyph below is one the export actually draws, and a glyph the export does not
 * draw is a Claude Design prompt, never a new file here.
 */
import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  /** Omit for a decorative icon; give one and the icon is announced. */
  label?: string
}

function Icon({ size = 14, label, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      {...rest}
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  )
}

export const ChevronUp = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="18 15 12 9 6 15" />
  </Icon>
)
export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
)
/* The editor's back link — `S4 Editor.dc.html:30` (S4a), read verbatim. Story 5.1. */
export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
)
export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
)
export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
)
export const Check = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
)
export const Eye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)
export const EyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
    <line x1="4" y1="20" x2="20" y2="4" />
  </Icon>
)
export const Trash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
  </Icon>
)
export const Bolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </Icon>
)
export const Undo = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
  </Icon>
)
export const Redo = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H9a5 5 0 0 0 0 10h3" />
  </Icon>
)
export const Pencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </Icon>
)
export const X = (p: IconProps) => (
  <Icon {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Icon>
)
export const Link = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
  </Icon>
)
/* S11a's ⋯ menu, third row (`S11 Sites.dc.html:80`) — the key with the diagonal stroke, copied as
   drawn. `stroke-linejoin: round` is on the frame's own <svg> and `Icon` already sets it. */
export const Key = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15 8m-2 2l4-4m0 0l3 3 3-3-3-3" />
  </Icon>
)
/* S11e's **Test connection** glyph (`S11e Manage Keys Popup.dc.html:1a`) — the export's own
   circular arrow, drawn verbatim in `S11 Sites.dc.html`, `S8 Deploy.dc.html` and
   `S10 Assets.dc.html` as well, so it is lifted rather than invented (R-74). */
export const Refresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <polyline points="21 3 21 9 15 9" />
  </Icon>
)
/* S11a's ⋯ "Use this site's brand" — STORY 3.7, AND IT IS AN EXTRAPOLATION, WHICH IS WHY THIS
   COMMENT EXISTS (R-74). No frame draws a brand row in this menu: the owner moved the card's coral
   link into the ⋯ on 2026-09-10 and the export is never edited. The export's own brand symbol is
   S2c's accent swatch — a 28px filled disc (`S2 Onboarding.dc.html:173`) — which is a FILL and not
   a line glyph, so it is drawn here in the Kit's own hand: the disc at the Kit's 1.5 stroke with
   its accent still filled in the middle, so it reads as a colour sample beside `Key` and `Refresh`
   rather than as another circle. Nothing was invented but the line weight. */
export const Swatch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
  </Icon>
)
export const LinkOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </Icon>
)
/* The card's address opens in a new tab and says so (the owner's finding 4, 2026-09-08). The
   export draws this glyph — `P0-2 Icon Slot and Picker.dc.html:111`, `title="external"` — so it is
   lifted, not invented; only the stroke follows the Kit's 1.5 rather than the picker grid's 2. */
export const ExternalLink = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
)
export const Upload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
)
export const InfoCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </Icon>
)
export const AlertTriangle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <circle cx="12" cy="17" r="0.4" fill="currentColor" />
  </Icon>
)

/* The two solid status glyphs: the disc takes the hue, the mark is cut out of it in
   surface. Drawn this way in the Kit's banners and its toast. */
export const CheckCircleSolid = ({ size = 14, label, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    {...rest}
  >
    {label ? <title>{label}</title> : null}
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <polyline
      points="8 12.5 11 15.5 16 9.5"
      stroke="var(--color-surface)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const XCircleSolid = ({ size = 14, label, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    {...rest}
  >
    {label ? <title>{label}</title> : null}
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" stroke="var(--color-surface)" strokeWidth="2" strokeLinecap="round" />
    <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" stroke="var(--color-surface)" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/** Six dots — the Kit's own grip, drawn here as drawn there. */
export const Grip = ({ label, ...rest }: IconProps) => (
  <svg
    width="10"
    height="14"
    viewBox="0 0 10 16"
    fill="currentColor"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    {...rest}
  >
    {label ? <title>{label}</title> : null}
    <circle cx="3" cy="3" r="1.3" />
    <circle cx="7" cy="3" r="1.3" />
    <circle cx="3" cy="8" r="1.3" />
    <circle cx="7" cy="8" r="1.3" />
    <circle cx="3" cy="13" r="1.3" />
    <circle cx="7" cy="13" r="1.3" />
  </svg>
)

/** The moon inside the badge. Filled, because it is a glyph and not a stroke. */
export const Moon = ({ size = 7, label, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    {...rest}
  >
    {label ? <title>{label}</title> : null}
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
)

/* ────────────────────────────────────────────── S3 / D4 / S12 — the dashboard's own glyphs.
   Added by Story 1.5, each read verbatim off the frame that draws it: the sidebar nav
   (`S3 Dashboard.dc.html` S3a/S3b/S3c), the account menu (S3d), the ⋯ menu (S3c), the top
   bar's "New project" and the 390 header, and D4a's greyed-door reason icon. R-92: these are
   Claude Design's own drawings, not Tabler's. */

export const Projects = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
)
export const Globe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Icon>
)
export const Image = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 15l-5-5L5 21" />
  </Icon>
)
/** The frame draws the plus at stroke 2, not 1.5 — it is a label's companion, not a panel icon. */
export const Plus = ({ strokeWidth = 2, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
)
export const MenuLines = (p: IconProps) => (
  <Icon {...p}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </Icon>
)
export const Copy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)
export const Person = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
)
export const Card = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Icon>
)
export const Lightbulb = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.5-1 1.5-1 2.5H9c0-1-.4-2-1-2.5A6 6 0 0 1 12 3z" />
  </Icon>
)
export const Book = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6c-2-1.5-4.5-2-8-2v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2V4c-3.5 0-6 .5-8 2z" />
    <path d="M12 6v14" />
  </Icon>
)
export const Logout = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
)
/** D4a's reason icon. The frame sets it at stroke 1.9 and fills the dot in the same hue. */
export const AlertCircle = ({ strokeWidth = 1.9, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="7.8" r="0.5" fill="currentColor" />
  </Icon>
)

/* S12a's Email row and Passkeys rows, and S1a's passkey button — the three drawings this
   surface needs, read verbatim off `S12 Billing.dc.html:78,87,103` and `S1 Sign In.dc.html:49`.
   `Mail` and `Laptop` are drawn WITHOUT round caps in the frame (`stroke-linecap` is absent on
   both), but the two shapes are a rectangle and two straight strokes, where the cap is invisible
   at 16px; keeping `Icon`'s own caps is one component rather than a second one. */
export const Mail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 6L2 7" />
  </Icon>
)
export const Laptop = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
)
/** The key. One drawing at three sizes: 18 on S1a's button, 14 on S12a's "Add a passkey". */
export const Passkey = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </Icon>
)

/* Story 4.5 — the controls panel's glyphs, each read verbatim off the frame that draws it (R-92: Claude
   Design's own drawings, not Tabler's). P0-1's Link popover row glyphs (`P0-1 Inline Text
   Toolbar.dc.html:78, :82, :88`), drawn there at stroke 1.8, and P0-3's "From Ghost" mark
   (`P0-3 Item List Controls.dc.html:57`), drawn at stroke 2. */
export const PageGlyph = ({ strokeWidth = 1.8, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Icon>
)
export const PostGlyph = ({ strokeWidth = 1.8, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
)
export const TagGlyph = ({ strokeWidth = 1.8, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M20.6 13.4L11 3.8A2 2 0 0 0 9.6 3.2H4a1 1 0 0 0-1 1v5.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </Icon>
)
export const FromGhost = ({ strokeWidth = 2, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  </Icon>
)

/* The panel glyph — D8's "Show layers" (`D8 Editor Below 1440.dc.html:194`), read verbatim: a frame with
   its rail on the left. The controls review mirrors it with a transform for the rail on the RIGHT
   (the owner's finding 3 on Story 4.5), so the path stays the frame's own. */
export const Panel = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </Icon>
)
