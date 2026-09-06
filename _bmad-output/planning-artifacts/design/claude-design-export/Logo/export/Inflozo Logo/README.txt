# Inflozo — Nest identity

## Contents

Inflozo Logo.html      Full page, self-contained. Works offline, no server needed.
                       Fonts, styles and scripts are inlined; the launch animation
                       and the Replay button work on open.
assets/                Static SVG marks, 44x44 viewBox, scale to any size.

## Assets

mark-light.svg   Primary. Ink #1C1B1A, accent core #C2381F.
mark-dark.svg    For dark surfaces. Ink #F7F5F2, accent core #FF5941.
mark-mono.svg    One colour, for stamping, embroidery and fax-grade reproduction.
favicon-16.svg   16px cut. Two levels only, heavier strokes.
app-icon.svg     Filled tile, for app and launcher use.

## Construction

Three concentric rounded squares: a dashed boundary, a solid structure, and the
live core. Corner radius is 0.158 of each square's width on every level.

The dashed boundary is 8 dashes, phased so four sit centred on the corners and
four on the edge midpoints — every corner is solid ink, every gap falls on a
straight run. Each cut is tuned to its own path length, so the rhythm closes
exactly at every size. If you rescale or re-radius a mark, the dash values must
be recomputed: period = pathLength / 8, and
dashoffset = period - (topEdgeMidpoint - dash/2).

## Lockups

Mark height is 1.85x the wordmark cap height. The gap between mark and wordmark,
and the clear space on every side, is 0.28x the mark's height.

Wordmark is Bricolage Grotesque 800, tracking -0.035em. Never below 600 weight,
never letterspaced positive. The lowercase i is the capital I scaled to 0.809 on
the vertical, so its stem width matches the rest of the setting; the tittle is a
0.16em accent circle.

## Animation

Roughly 2.9 seconds, CSS only, respects prefers-reduced-motion.

0.0s  The mark lands askew, crushes to three quarters, springs back through
      three decaying settles.
0.8s  The core crushes with it, then snaps open to half again its size.
1.2s  It releases a dot, which arcs across the lockup on a ballistic path,
      shrinking and rounding as it goes.
2.0s  The dot hits the I, driving the stem down to lowercase. Both bounce on the
      same rhythm, baseline pinned, settling by 2.9s.

The dot's flight distance is measured at runtime, so the animation stays correct
at any size and after the webfont loads.

## Colour

Ink              #1C1B1A
Accent           #C2381F   core and tittle only
Accent on dark   #FF5941
Page             #F4F1EC
