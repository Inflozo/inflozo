// @inflozo/library/icons — every Tabler icon, as data (R-26 · R-92 · R-104, Story 4.5).
//
// The drawings are `../icons/tabler.json`, written by `python3 tools/vendor-icons.py` from the pinned
// `@tabler/icons` tarball after checking its integrity and its MIT licence; this is the code half.
// It is its own `exports` subpath and deliberately NOT re-exported from `index.ts`: the set is megabytes
// of path data, so importing the rulebook must never pull it. The runtime is HANDED `iconDrawing` (the
// `IconLookup` shape in `registry.ts`) by whoever loads this module, and rebuilds every `<path>` from the
// attributes, which the vendoring script has already confined to `path` nodes and a closed attribute set.
//
// A filled drawing is looked up as its name plus `-filled` (`filledKey`); the script refuses a set in
// which an outline name already ends that way, so the suffix can never mean two things.
//
// Pure (AD-1): the JSON is imported, which is the only door a core package has to data — and it is also
// why the licence text is served from the JSON rather than read from `LICENSE-tabler.txt`.

import tabler from '../icons/tabler.json' with { type: 'json' }
import type { IconLookup, IconNode } from './registry.ts'

type VendoredIcon = {
  category: string
  tags: readonly string[]
  outline: readonly IconNode[]
  filled?: readonly IconNode[]
}

// ponytail: one cast at the door. The JSON's inferred type is tuples-as-arrays; the shape is what the
// vendoring script refuses to write anything but, and icons.test.ts walks every node against it.
const SET = tabler.icons as unknown as Readonly<Record<string, VendoredIcon>>
const FILLED = '-filled'

/** Tabler's MIT licence, verbatim — it ships in every theme that draws one of these icons (R-26). */
export const TABLER_LICENSE: string = tabler.license
export const TABLER_VERSION: string = tabler.version

/** The lookup key of an icon's filled drawing. */
export const filledKey = (name: string): string => `${name}${FILLED}`

const own = (name: string): VendoredIcon | undefined => (Object.hasOwn(SET, name) ? SET[name] : undefined)

/** An icon's drawing: its outline, or — for a `-filled` key — its filled drawing where Tabler has one.
 *  Own keys only, so `constructor`, `__proto__` and anything not in the set answer `undefined`. */
export const iconDrawing: IconLookup = (name) => {
  if (typeof name !== 'string') return undefined
  return name.endsWith(FILLED) ? own(name.slice(0, -FILLED.length))?.filled : own(name)?.outline
}

export type IconEntry = { name: string; category: string; tags: readonly string[]; filled: boolean }

/** Every icon, sorted by name — the picker's list and its search terms, without the drawings. */
export const ICONS: readonly IconEntry[] = Object.keys(SET)
  .sort()
  .map((name) => {
    const { category, tags, filled } = SET[name]
    return { name, category, tags, filled: filled !== undefined }
  })

/** Tabler's own categories, derived from the set and sorted by code unit (`localeCompare` reads a locale). */
export const ICON_CATEGORIES: readonly string[] = [...new Set(ICONS.map((icon) => icon.category))].sort()
