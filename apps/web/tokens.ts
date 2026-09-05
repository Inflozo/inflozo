// The @theme block in app/globals.css is the token layer, and it is read rather than
// retyped — by the gallery, which draws it, and by tokens.test.ts, which proves it still
// matches the export. Two readers, one source; a token added in CSS needs no second edit.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Token = { name: string; value: string }

/** Both readers run with `apps/web` as the working directory. */
export const themeFile = () => join(process.cwd(), 'app', 'globals.css')

/** The `@theme` block only — `@theme inline` holds var() references, not values. */
export function readTheme(css: string): Token[] {
  // comments go first, so a `}` inside one can never end the block early
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const block = /@theme\s*\{([\s\S]*?)\n\}/.exec(bare)
  if (!block) throw new Error('globals.css has no @theme block')
  const body = block[1]
  return [...body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)]
    .filter((m) => !m[1].endsWith('-*')) // `--color-*: initial` clears Tailwind's own; it is not a token
    .map((m) => ({
    name: `--${m[1]}`,
    value: m[2].trim(),
  }))
}

export const theme = () => readTheme(readFileSync(themeFile(), 'utf8'))

export const group = (tokens: Token[], prefix: string) =>
  tokens.filter((t) => t.name === prefix || t.name.startsWith(`${prefix}-`))

/** `--color-ink-soft-aa` → `ink-soft-aa`; `--radius` → `DEFAULT`. */
export const shortName = (name: string, prefix: string) =>
  name === prefix ? 'DEFAULT' : name.slice(prefix.length + 1)
