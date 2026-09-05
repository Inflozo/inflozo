/*
 * Tabler Icons — MIT License
 *
 * Copyright (c) 2020-2024 Paweł Kuna
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * Icons are drawn inline, once per use (ruling R-26, decision D1): no sprite, no icon font,
 * no package. Each inherits `currentColor` at 1.5px stroke, costs no request, and survives
 * with everything switched off. MEMBERSHIP IS THE KIT'S — every glyph below is one the
 * export actually draws, and a glyph the export does not draw is a Claude Design prompt,
 * never a new file here.
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
export const LinkOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    <line x1="3" y1="3" x2="21" y2="21" />
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

/** Six dots. Not a Tabler glyph — the Kit draws it itself, so it is drawn here as drawn there. */
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
