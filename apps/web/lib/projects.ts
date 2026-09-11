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
 * A NAME NO OTHER PROJECT OF THE USER'S HAS — the plain numeric suffix, and the one rule the
 * three generated names in this product share.
 *
 * Not a count of rows: two deletes and a create would otherwise reuse a name still on screen.
 * Clamped WITH the suffix on, so an 80-character base still gets a distinct name — a cut that
 * lands on a space left a name ending in one, which never matched the trimmed taken set (review,
 * 2026-09-05), so the trim is after the cut and not before it.
 *
 * STORY 3.9 (DW-72, the owner's Question 2 ruling — "Blog 2") generalised this out of
 * `nextUntitled`, where the base was hard-coded to `UNTITLED`, because `useBrand` needs the same
 * rule for a name Ghost supplied: connect two Ghost sites both titled *Blog*, press **Use your
 * brand** on each, and the dashboard drew two cards called *Blog*. `copyName`'s "Copy of X"
 * wording is explicitly NOT what is reused — this is a different site, not a copy, so that word
 * would be telling the customer something untrue.
 */
export function freeName(base: string, taken: readonly string[]): string {
  const clamp = (s: string) => s.slice(0, NAME_MAX).trim()
  const used = new Set(taken.map((n) => n.trim()))
  const first = clamp(base)
  if (!used.has(first)) return first
  for (let n = 2; ; n += 1) {
    const candidate = clamp(base.slice(0, NAME_MAX - ` ${n}`.length)) + ` ${n}`
    if (!used.has(candidate)) return candidate
  }
}

/** "Untitled project", then "Untitled project 2", "3", … counting the user's existing names. */
export const nextUntitled = (names: readonly string[]): string => freeName(UNTITLED, names)

/**
 * Duplicate's name. Clamped to the schema's maximum, so a copy of a long name still saves, and
 * suffixed away from the names already taken — because the SLUG is derived from the name and
 * the boundary asks a duplicate for "a fresh slug". Duplicating twice produced two rows with one
 * name and one slug; FR-J10 makes that slug the emitted theme name (review, 2026-09-05). SINCE
 * STORY 3.9 the database refuses the second with `23505` (`unique (user_id, slug)`, DW-24) and
 * `insertProject` retries — but a name is still chosen HERE, because a retry that only changed the
 * slug would leave two cards on the dashboard reading the same thing.
 * The suffix is `freeName`'s, which `nextUntitled` also uses, so a copy reads like every other
 * generated name.
 */
export const copyName = (name: string, taken: readonly string[] = []): string =>
  freeName(`Copy of ${name}`, taken)

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
 * differ only in punctuation slug to the same string, and FR-J10 makes the slug the emitted theme
 * name (review, 2026-09-05).
 *
 * SINCE STORY 3.9 THE DATABASE IS THE BACKSTOP AND THIS IS THE POLITE PATH (DW-24):
 * `unique (user_id, slug)` refuses a collision this read-then-write could not see, and the two
 * callers in `projects/actions.ts` catch `23505` and come back here with the losing slug added to
 * `taken` — which is what `slugAttempts` below is the sequence of. The sentence that used to stand
 * here — "`projects.slug` carries no unique constraint to refuse either" — was true until
 * 2026-09-11 and is now the opposite of true.
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
 * THE RETRY'S DECISION, PURE — DW-24. `createProject` and `duplicateProject` insert a slug this
 * process believed was free; the database may answer `23505` because another request of the same
 * customer's took it in the milliseconds between the read and the insert. The action then comes
 * back with the losing slug known to be taken, which is this sequence.
 *
 * THREE, AND NOT A LOOP UNTIL IT SUCCEEDS: each attempt is a round trip, the race needs two of one
 * customer's own requests to overlap, and three consecutive losses is not a race any more — it is
 * something else, and the action's existing failure path is the honest answer to something else.
 *
 * It is a SEQUENCE rather than a closure so that it can be read in a test without a database: the
 * action walks it in order and stops at the first that inserts.
 */
export function slugAttempts(base: string, taken: readonly string[], tries = 3): string[] {
  const used = [...taken]
  const attempts: string[] = []
  for (let n = 0; n < tries; n += 1) {
    const slug = uniqueSlug(base, used)
    attempts.push(slug)
    used.push(slug)
  }
  return attempts
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
