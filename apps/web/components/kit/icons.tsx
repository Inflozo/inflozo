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
 * first Tabler path.
 *
 * THAT PATH ARRIVED ON 2026-09-18, and the notice below is its (ruling R-130, Story 5.5): the
 * owner handed over `circle-off` for the Template switcher's "Empty" rows — a state D5b does not
 * draw, so there was no export glyph to read. R-92's scope therefore carries one stated exception
 * rather than being overturned: a glyph the export draws is still read from the export, and a
 * Tabler path enters this file only where the owner names one. The drawing was NOT retyped from
 * his message — it is `packages/library/icons/tabler.json`'s own `circle-off`, verified path for
 * path, and inlined here because importing `@inflozo/library/icons` for one glyph would pull all
 * of its icons into the editor's client bundle.
 *
 * THE OWNER NAMED FIVE MORE ON 2026-09-19 (ruling R-142), and they are the second stated exception rather
 * than a widening: B6 draws the persistence indicator as a coloured DOT, and he replaced it with an icon in a
 * circle — "keep the colors but with icons inside a circle, use appropriate Tabler Icons" — so there is no
 * export glyph to read for any of the five states. Same shape as R-130: the export still governs every glyph
 * it draws, and Tabler enters here only where the owner names it. Their paths are NOT retyped from the frame
 * or from his message — each is `packages/library/icons/tabler.json`'s own `outline`, emitted from that file
 * and verified path for path, and each is inlined for R-130's reason (importing `@inflozo/library/icons` for
 * five glyphs would pull the whole set into the editor's client bundle).
 *
 * AND ELEVEN ON 2026-09-21 (ruling R-171, Story 5.14): the Template switcher's rows, one glyph per canvas plus one
 * for any custom template a user creates — D5b draws none, and the owner asked for "relevant icons from Tabler
 * icons". The third stated exception, and the same shape: emitted from `tabler.json`, never retyped.
 *
 * AND ONE ON 2026-09-23 (ruling R-185, Story 5.16a): `braces`, the `{}` button beside a field's label that opens
 * the placeholder menu — the owner named the shape himself ("a small '{}' icon near the label of the field") and
 * P0-1 draws a chip row instead, which R-185 withdraws, so again there is no export glyph to read. Fourth stated
 * exception, same shape: `tabler.json`'s own `braces`, emitted from it and verified path for path.
 *
 * AND THREE MORE THE SAME DAY, when the owner tested that menu (R-188, finding 1 and 2): *"Copy and Instert should
 * be minimal icons from tabler icons"* and *"once copied, show a tick icon instead of copy"*. Not a fifth
 * exception — the same ruling reaching the rows it opened, and the same shape again: `copy`, `text-plus` and
 * `check`, each `tabler.json`'s own `outline`, emitted from it and verified path for path. They are NAMED for the
 * menu rather than for the glyph because this file already carries an export-drawn `Copy` and `Check` that other
 * surfaces read, and one name means one thing (R-170) — the precedent is `SyncCheck`, which is this same Tabler
 * `check` at a heavier stroke.
 *
 * Tabler Icons — MIT Licence, Copyright (c) 2020-2024 Paweł Kuna. The full text ships with every
 * theme that draws one of these (`TABLER_LICENSE` in `@inflozo/library/icons`, R-26).
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
/* Tabler's `circle-off` — the owner's own glyph for the Template switcher's "Empty" rows (R-130,
   2026-09-18). Its two paths are `tabler.json`'s, byte for byte; see this file's header for why a
   Tabler path sits here and where its licence ships. Story 5.5. */
export const CircleOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.042 16.045a9 9 0 0 0 -12.087 -12.087m-2.318 1.677a9 9 0 1 0 12.725 12.73" />
    <path d="M3 3l18 18" />
  </Icon>
)
/** Tabler `braces` — R-185's `{}` button beside a field's label, which opens that field's placeholder menu.
 *  Tabler's own `outline`, emitted from `packages/library/icons/tabler.json`. */
export const Braces = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4a2 2 0 0 0 -2 2v3a2 3 0 0 1 -2 3a2 3 0 0 1 2 3v3a2 2 0 0 0 2 2" />
    <path d="M17 4a2 2 0 0 1 2 2v3a2 3 0 0 0 2 3a2 3 0 0 0 -2 3v3a2 2 0 0 1 -2 2" />
  </Icon>
)
/* ── R-185's two row actions and the tick that answers one of them (R-188, the owner's test of Story 5.16a) ──
   Tabler's own `outline`, emitted from `packages/library/icons/tabler.json`. The buttons carry no words, so each
   says its name on hover and to a screen reader — the glyph is the whole control. */
/** Tabler `copy` — put this placeholder's code on the clipboard. */
export const PlaceholderCopy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
  </Icon>
)
/** Tabler `check` — Copy's answer for two seconds, then it is Copy again (R-188, finding 2). */
export const PlaceholderCopied = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12l5 5l10 -10" />
  </Icon>
)
/** Tabler `text-plus` — put this placeholder's code into the field, where the cursor is. */
export const PlaceholderInsert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 10h-14" />
    <path d="M5 6h14" />
    <path d="M14 14h-9" />
    <path d="M5 18h6" />
    <path d="M18 15v6" />
    <path d="M15 18h6" />
  </Icon>
)
/* ── R-142's five, the persistence indicator's states (Story 5.8) ────────────────────────────────────────
   Each is Tabler's own `outline`, emitted from `packages/library/icons/tabler.json`. They default to a 2.5
   stroke rather than the file's 1.5: these are drawn at 10px inside a 16px circle, where 1.5 on a 24-unit
   viewBox resolves to two thirds of a device pixel and disappears. NONE OF THEM ANIMATES — B6's "never a
   spinner" is unchanged by the owner's ruling, and the Syncing state is a static arrow for exactly that
   reason. */
/** Tabler `check` — Synced — everything on this screen is on the server */
export const SyncCheck = ({ strokeWidth = 2.5, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M5 12l5 5l10 -10" />
  </Icon>
)
/** Tabler `clock` — Saved on this device — written here, waiting its turn to go up */
export const SyncClock = ({ strokeWidth = 2.5, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 7v5l3 3" />
  </Icon>
)
/** Tabler `arrow-up` — Syncing — going up now. A STATIC arrow: B6 forbids a spinner and so does this story */
export const SyncArrowUp = ({ strokeWidth = 2.5, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M12 5l0 14" />
    <path d="M18 11l-6 -6" />
    <path d="M6 11l6 -6" />
  </Icon>
)
/** Tabler `exclamation-mark` — Retrying — the simplest alert there is, which is all the circle needs to say now that the panel carries the rest */
export const SyncAlert = ({ strokeWidth = 2.5, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M12 19v.01" />
    <path d="M12 15v-10" />
  </Icon>
)
/** Tabler `upload` — Syncing every change to the cloud — this browser holds nothing, so everything goes straight up */
export const SyncUpload = ({ strokeWidth = 2.5, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
    <path d="M7 9l5 -5l5 5" />
    <path d="M12 4l0 12" />
  </Icon>
)
/* ── R-171's canvas glyphs, one per template in the Template switcher (Story 5.14) ───────────────────────────────
   The owner named them on 2026-09-21 — "Add icons for dropdown items in Template at top. Use relevant icons from
   Tabler icons. Use a relevant icon for any custom template a user may create" — and D5b draws no glyph for any
   row, so there is no export drawing to read: the third stated exception to R-92, shaped exactly like R-130 and
   R-142. Each is `packages/library/icons/tabler.json`'s own `outline`, EMITTED from that file by script rather
   than retyped, and inlined for R-130's reason. They take the file's 1.5 stroke, as S4d's `Eye`, `Person` and
   `Crown` do in the View as rows these rows now match. */
/** Tabler `home` — Home */
export const CanvasHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
  </Icon>
)
/** Tabler `article` — Post */
export const CanvasPost = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12" />
    <path d="M7 8h10" />
    <path d="M7 12h10" />
    <path d="M7 16h10" />
  </Icon>
)
/** Tabler `file-text` — Page */
export const CanvasPage = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
    <path d="M9 9l1 0" />
    <path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </Icon>
)
/** Tabler `tag` — Tag */
export const CanvasTag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3" />
  </Icon>
)
/** Tabler `user` — Author */
export const CanvasAuthor = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </Icon>
)
/** Tabler `user-plus` — Signup */
export const CanvasSignup = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M16 19h6" />
    <path d="M19 16v6" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
  </Icon>
)
/** Tabler `login-2` — Signin */
export const CanvasSignin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
    <path d="M3 12h13l-3 -3" />
    <path d="M13 15l3 -3" />
  </Icon>
)
/** Tabler `user-circle` — Member home */
export const CanvasMemberHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
  </Icon>
)
/** Tabler `error-404` — 404 */
export const CanvasError = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8v3a1 1 0 0 0 1 1h3" />
    <path d="M7 8v8" />
    <path d="M17 8v3a1 1 0 0 0 1 1h3" />
    <path d="M21 8v8" />
    <path d="M10 10v4a2 2 0 1 0 4 0v-4a2 2 0 1 0 -4 0" />
  </Icon>
)
/** Tabler `lock` — Private */
export const CanvasPrivate = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
  </Icon>
)
/** Tabler `lock` — Paywall, the first template surface (Story 5.20: the spec names the glyph Private already carries,
 *  so it is that drawing, not a second copy of it) */
export const CanvasPaywall = CanvasPrivate
/** Tabler `template` — any custom template a user creates (Story 7.16) */
export const CanvasCustom = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1l0 -2" />
    <path d="M4 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6" />
    <path d="M14 12l6 0" />
    <path d="M14 16l6 0" />
    <path d="M14 20l6 0" />
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
/* ── Story 5.15 — B3's three drawings (`B Missing Surfaces.dc.html`), each read verbatim with its own stroke. The
   frame sets no `stroke-linejoin`, so the two eyes take SVG's own miter over this file's round; the pause glyph is two
   straight lines, where a join draws nothing. They are B3's, not S4d's `Eye`/`EyeOff` above: a flatter eye with a
   smaller pupil, and a slash drawn from the top-left. */
/** B3a `:659` — the PAUSED chip's glyph, 9px at a 2.4 stroke */
export const Pause = ({ strokeWidth = 2.4, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <line x1="9" y1="5" x2="9" y2="19" />
    <line x1="15" y1="5" x2="15" y2="19" />
  </Icon>
)
/** B3a `:646` — the Preview pill's eye, 13px at a 1.6 stroke */
export const PreviewEye = ({ strokeWidth = 1.6, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} strokeLinejoin="miter" {...p}>
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
)
/** B3b `:702` — Back to editing's eye with its slash, 14px at a 1.7 stroke */
export const PreviewEyeOff = ({ strokeWidth = 1.7, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} strokeLinejoin="miter" {...p}>
    <path d="M4 4l16 16" />
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
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
/* P0-1's plain-text lock (`P0-1 Inline Text Toolbar.dc.html:142`), copied as drawn; the stroke is the Kit's 1.5, not the
   frame's 1.8. Story 5.3's pill names Ghost's own words beside it (R-122). */
export const Lock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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

/** S4a's mode control in its LIGHT state (`S4 Editor.dc.html:35`), lifted verbatim: a 4-unit circle and eight rays,
 *  at the frame's own 1.5px stroke and 24-unit viewBox. The frame draws it at 15px inside a 28px button, in the
 *  value the token layer calls `ink-soft` — so the stroke stays `currentColor` and no colour literal enters
 *  `apps/web` (`tokens.test.ts`). R-132: the moon above is its dark counterpart, which the export draws nowhere. */
export const Sun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
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

/* S4a's DEVICE TRACK (`S4 Editor.dc.html:37-39`), the three glyphs lifted verbatim — 24-unit viewBox, the house 1.5px
   stroke, drawn at 14px inside each 28 × 26 button. B11's explainer toolbar draws three different device glyphs at
   1.7px (`B Missing Surfaces.dc.html:726-728`); THOSE ARE THE EXPLAINER'S, and S4a's are the editor's (Story 5.7). */

export const DeviceDesktop = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
)

export const DeviceTablet = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
  </Icon>
)

export const DeviceMobile = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8" y="3" width="8" height="18" rx="2" />
  </Icon>
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
/* D5c's "Make this the main feed" (`D5 Canvas Markers and Template Switcher.dc.html:300`), read verbatim — Story 5.19. */
export const Star = ({ strokeWidth = 1.7, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.3 9.4l6.1-.8z" />
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
/* S4d's **Paid member** row (`S4 Editor.dc.html:403`), read verbatim — the export draws it, so R-92's scope applies
   unchanged and no Tabler path is owed. Story 5.14's View as menu is its first reader; its two siblings there are
   `Eye` and `Person` above, S4d's own drawings too. */
export const Crown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8l4 4 5-6 5 6 4-4v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
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
/* S3d's **Keyboard shortcuts** row (`S3 Dashboard.dc.html:362`), read verbatim — the export draws it, so R-92's
   scope applies unchanged and no Tabler path is owed here (R-130 is the exception for a glyph the export does NOT
   draw). Story 1.5 left the row out and named Story 5.9; this is that glyph arriving with it. */
export const Keyboard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
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

/* Story 5.16 — D5d's page glyph (`D5 Canvas Markers and Template Switcher.dc.html:390`), read verbatim at the frame's
   own 1.8 stroke: a page with two lines, beside "Page 2" in the canvas's page-2 pill. */
export const PageLines = ({ strokeWidth = 1.8, ...p }: IconProps) => (
  <Icon strokeWidth={strokeWidth} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M9 9h6" />
    <path d="M9 13h6" />
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
