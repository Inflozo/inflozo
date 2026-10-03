// Story 6.1 — the colour maths the token engine needs, and Story 6.4's live contrast check reuses: one home.
//
// Plain functions over `#rrggbb` strings (AD-1: no host, no clock). WCAG 2.x's contrast ratio, sRGB mixing, and
// `stepToContrast`, which moves a colour away from a ground in OKLCH lightness until it reads on it — hue kept,
// chroma given up only where the sRGB gamut forces it.

const HEX_RE = /^#[0-9a-f]{6}$/i

/** `#rrggbb` → its three channels, 0–255. Anything else — a name, a short hex, an `rgb()` — throws. */
export function parseHex(colour: string): [number, number, number] {
  if (!HEX_RE.test(colour)) throw new Error(`${JSON.stringify(colour)} is not a #rrggbb colour`)
  return [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16)) as [number, number, number]
}

export const isHex = (colour: unknown): colour is string => typeof colour === 'string' && HEX_RE.test(colour)

const toHex = (rgb: readonly number[]): string =>
  `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()

const linear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

const luminance = (colour: string) => {
  const [r, g, b] = parseHex(colour).map((v) => linear(v / 255)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x's contrast ratio, 1 to 21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** `from` moved `t` of the way to `to`, channel by channel in sRGB (0 is `from`, 1 is `to`). */
export function mix(from: string, to: string, t: number): string {
  const a = parseHex(from)
  const b = parseHex(to)
  return toHex(a.map((v, i) => v + ((b[i] as number) - v) * t))
}

/** `rgba(r, g, b, alpha)` of a hex — what a token writes where a colour carries its own strength. */
export const rgba = (colour: string, alpha: number): string => `rgba(${parseHex(colour).join(', ')}, ${String(alpha)})`

/** The darker of two colours, by luminance. */
export const darker = (a: string, b: string): string => (luminance(a) <= luminance(b) ? a : b)

// OKLab (Björn Ottosson's matrices) over linear sRGB, and its polar form.
function toOklch(colour: string): [number, number, number] {
  const [r, g, b] = parseHex(colour).map((v) => linear(v / 255)) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [L, Math.hypot(A, B), Math.atan2(B, A)]
}

/** OKLCH → linear sRGB, unclamped: a channel outside 0–1 is out of gamut. */
function fromOklch(L: number, C: number, h: number): [number, number, number] {
  const A = C * Math.cos(h)
  const B = C * Math.sin(h)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: readonly number[]) => rgb.every((v) => v >= -1e-7 && v <= 1 + 1e-7)

/** `colour` as it is when it already reads on `ground` at `target`; otherwise moved AWAY from the ground in OKLCH
 *  lightness, 0.005 at a time, hue kept — darker on a ground black reads better on, lighter on one white does — and at
 *  each lightness its chroma scaled down 1 % at a time only while the result falls outside sRGB. The first step that
 *  reaches `target` wins, so the colour moves no further than it must. Black or white ends the walk, and one of the two
 *  reaches 4.5:1 on any ground (the larger of the two ratios is never under √21 ≈ 4.58). */
export function stepToContrast(colour: string, ground: string, target: number): string {
  if (contrast(colour, ground) >= target) return colour
  const [L0, C0, h] = toOklch(colour)
  const dir = contrast(ground, '#000000') > contrast(ground, '#FFFFFF') ? -1 : 1
  for (let k = 1; ; k++) {
    const L = L0 + dir * 0.005 * k
    if (L <= 0 || L >= 1) return dir < 0 ? '#000000' : '#FFFFFF'
    let rgb = fromOklch(L, C0, h)
    // ponytail: 1 % of the starting chroma per try, so the walk ends by 100 tries (chroma 0 is always in gamut)
    for (let n = 1; !inGamut(rgb) && n <= 100; n++) rgb = fromOklch(L, C0 * (1 - n / 100), h)
    const out = toHex(rgb.map((v) => encode(Math.min(1, Math.max(0, v))) * 255))
    if (contrast(out, ground) >= target) return out
  }
}
