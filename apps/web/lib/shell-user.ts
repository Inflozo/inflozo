/**
 * The account row's rule, in one pure module `node --test` can reach (the `plan.ts` /
 * `entitlement.ts` split): the row is drawn from these two lines and nothing else — the
 * owner's ruling at spec question 5, option 1 (2026-09-06): NO stand-in name. With no
 * `display_name` the row is avatar · the address on the small line · the badge; the bold name
 * line appears by itself the day E2 lets someone save one. A whitespace name is no name.
 */
export type ShellUser = { email: string; displayName: string | null }

/** The bold line's text when there is one, else the address — also the avatar's initial. */
export const nameOf = (user: ShellUser) => user.displayName?.trim() || user.email

/** The small line under a name; `null` means there is no name and the address takes the small line. */
export const secondLineOf = (user: ShellUser) => (user.displayName?.trim() ? user.email : null)
