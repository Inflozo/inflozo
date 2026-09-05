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

/**
 * Duplicate's name. Clamped to the schema's maximum, so a copy of a long name still saves, and
 * suffixed away from the names already taken — because the SLUG is derived from the name and
 * the boundary asks a duplicate for "a fresh slug". Duplicating twice produced two rows with
 * one name and one slug, and `projects.slug` carries no unique constraint to refuse it
 * (schema :212, checked); FR-J10 makes that slug the emitted theme name (review, 2026-09-05).
 * The suffix is `nextUntitled`'s own idiom, so a copy reads like every other generated name.
 */
export function copyName(name: string, taken: readonly string[] = []): string {
  // Trimmed AFTER the cut: a cut that lands on a space left a name ending in one, which never
  // matched the trimmed taken set, so the second copy reused the first's name (review, 2026-09-05).
  const clamp = (s: string) => s.slice(0, NAME_MAX).trim()
  const base = clamp(`Copy of ${name}`)
  const used = new Set(taken.map((n) => n.trim()))
  if (!used.has(base)) return base
  for (let n = 2; ; n += 1) {
    // Clamped with the suffix on, so a copy of an 80-character name still gets a distinct one.
    const candidate = clamp(`Copy of ${name}`.slice(0, NAME_MAX - ` ${n}`.length)) + ` ${n}`
    if (!used.has(candidate)) return candidate
  }
}

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
 * A slug no other project of the user's has. Derived against the SLUGS taken, never the names:
 * a rename keeps its slug (FR-J10), so "Untitled project" renamed to "Field Notes" still holds
 * `untitled-project` and the next blank project would have taken it again; and two names that
 * differ only in punctuation slug to the same string. `projects.slug` carries no unique
 * constraint to refuse either (schema :212), and FR-J10 makes it the emitted theme name
 * (review, 2026-09-05).
 */
export function uniqueSlug(base: string, taken: readonly string[]): string {
  const used = new Set(taken)
  if (!used.has(base)) return base
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`
    if (!used.has(candidate)) return candidate
  }
}

/**
 * The dashboard's `?q=`: a repeated key (`?q=a&q=b`) arrives as an ARRAY, which `q.trim()`
 * threw on and 500'd the page; the field only ever posts one, so the first is taken. The match
 * is a case-insensitive substring of the name. Pure, so the page's one branch is under test.
 */
export function filterProjects<T extends { name: string }>(
  rows: readonly T[],
  q: string | string[] | undefined,
): { query: string; shown: T[] } {
  const raw = Array.isArray(q) ? q[0] : q
  const query = raw?.trim() ?? ''
  const needle = query.toLowerCase()
  const shown = query ? rows.filter((row) => row.name.toLowerCase().includes(needle)) : [...rows]
  return { query, shown }
}

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
