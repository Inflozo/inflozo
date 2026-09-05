import { z } from 'zod'

/**
 * The project vocabulary: the name rules, the slug, the updated-at line and the typed-confirm
 * comparison. Pure, so `node --test` holds every branch — the name rule is shared by the
 * client field and the server action, and the typed confirm is what stands between a click
 * and a deleted project.
 */

/** FR-B3's field. 80 is the limit the sentence quotes, so the sentence is composed from it. */
export const NAME_MAX = 80

/** The helper-caption sentence, in the field's own slot. One wording, one source. */
export const NAME_HINT = `Give it a name — up to ${NAME_MAX} characters.`

export const nameSchema = z.string().trim().min(1, NAME_HINT).max(NAME_MAX, NAME_HINT)

export const UNTITLED = 'Untitled project'

/**
 * "Untitled project", then "Untitled project 2", "3", … counting the user's existing names.
 * Not a count of rows: two deletes and a create would otherwise reuse a name still on screen.
 */
export function nextUntitled(names: readonly string[]): string {
  const taken = new Set(names.map((n) => n.trim()))
  if (!taken.has(UNTITLED)) return UNTITLED
  for (let n = 2; ; n += 1) {
    const candidate = `${UNTITLED} ${n}`
    if (!taken.has(candidate)) return candidate
  }
}

/** Duplicate's name. Clamped to the schema's maximum, so a copy of a long name still saves. */
export const copyName = (name: string): string => `Copy of ${name}`.slice(0, NAME_MAX)

/**
 * FR-J10: the slug feeds the emitted theme name, so it is ASCII, lowercase and hyphenated.
 * A name with nothing sluggable in it (emoji, CJK) still needs a slug, hence the fallback.
 */
export const slugify = (name: string): string =>
  name
    .normalize('NFKD')
    // NFKD splits "é" into "e" + a combining accent; dropping the marks is what turns it into
    // "e" rather than "e-" (executed — `Café Crème` slugged to `cafe-cre-me`).
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project'

/**
 * D4d's format: "Updated today", "Updated Aug 19", and the year when it is not this one.
 *
 * ponytail: server UTC; the viewer's zone if "today" ever reads wrong at midnight.
 */
export function updatedLabel(updatedAt: string | Date, now: Date): string {
  const when = updatedAt instanceof Date ? updatedAt : new Date(updatedAt)
  if (Number.isNaN(when.getTime())) return 'Updated recently'

  const sameDay =
    when.getUTCFullYear() === now.getUTCFullYear() &&
    when.getUTCMonth() === now.getUTCMonth() &&
    when.getUTCDate() === now.getUTCDate()
  if (sameDay) return 'Updated today'

  const sameYear = when.getUTCFullYear() === now.getUTCFullYear()
  const formatted = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(when)
  return `Updated ${formatted}`
}

/**
 * The typed confirm. Trimmed, then EXACT — "field notes" is not "Field Notes", which is the
 * whole point of typing it. The server action compares with this same function.
 */
export const matchesName = (typed: string, name: string): boolean => typed.trim() === name

/**
 * The New project sheet's dialog id. The shell's "New project" button sits in the layout and
 * the sheet is rendered by the page, so the DOM is the only thing the two share — one
 * constant rather than two string literals a rename could separate.
 */
export const NEW_PROJECT_DIALOG = 'new-project-sheet'
