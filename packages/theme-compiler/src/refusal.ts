// STORY 7.18a — THE COMPILE'S CUSTOMER-CAUSED REFUSALS, ONE LIST (DW-353, DW-358). `compileTheme` refuses a project in
// many places; most refusals are Inflozo's own (a library defect, a shell that handed in a bad value) and are said to the
// customer as "our fault". These are the ones a customer's own project can cause, and each is said in plain words by the
// deploy wizard (`apps/web/lib/deploy.ts`'s `refusalWords`, keyed on this list).
//
// THE LEADING WORDS, AS A TAG: every customer-caused throw goes through `refused`, which keeps the compile's sentence
// EXACTLY as it was (no behaviour change — `compile.test.ts`' rows still match the same text) and tags the Error with its
// class and the parts the plain words name. A tag and not a prefix match, because four of these sentences open with the
// customer's own words (a layer name, a setting's name), and a sentence the customer typed can never be parsed back out
// reliably. `compile.test.ts` reaches every class for real (`(7.18a) every REFUSAL class is reached`).
//
// No import, so the wizard's client bundle can read the list without loading the compiler.

/** Every class, with the words its sentence opens with (a `{…}` is the part named in `parts`). */
export const REFUSAL = {
  /** `language "{code}": …` — `languageRefusal` refused `projects.language` */
  language: 'language "{code}": ',
  /** `card designs: …` — `parseCardDesigns` refused the stored record (DW-358) */
  cardDesigns: 'card designs: ',
  /** `SETTING_WORDS.cap` — more settings stored than a theme may carry (DW-351's race) */
  settingCap: 'You have used all ',
  /** `SETTING_WORDS.deleted(name)` — the section a setting was promoted from is gone */
  settingDeleted: '{setting} is promoted from a section that is no longer on your site.',
  /** `SETTING_WORDS.hidden(name)` — …is hidden */
  settingHidden: '{setting} is promoted from a hidden section.',
  /** `SETTING_WORDS.changed(name)` — its binding no longer reads, or its section's design now has it as another kind
   *  (`section` names the section in the second case) */
  settingChanged: '{setting} was promoted from a control that has changed.',
  /** `the theme's settings: {setting} is declared and nothing reads it …` — a promoted setting nothing on the site prints
   *  (DW-353); `why` is `unpicked` · `noPicture` · `twice` */
  settingUnread: "the theme's settings: ",
  /** `Two sections share a hidden name…` — the dark-hook collision (DW-331), on `file` */
  darkHook: 'Two sections share a hidden name',
  /** `locales/{lang}.json: "{key}" — {sentence}` — a stored translation `overrideRefusal` refuses */
  translation: 'locales/',
  /** `{file} · {layer}: the library holds no design …` / `…compiles to …, never to {file}.` — a stale design */
  staleDesign: '{file} · {layer}: ',
} as const

export type RefusalKind = keyof typeof REFUSAL

/** What a tagged refusal carries beside its sentence: its class and the parts its plain words name. */
export type RefusalTag = { kind: RefusalKind; parts: Readonly<Record<string, string>> }

/** The compile's Error, tagged. `message` is the compile's own sentence, unchanged. */
export class CompileRefusal extends Error {
  readonly refusal: RefusalTag
  constructor(kind: RefusalKind, message: string, parts: Readonly<Record<string, string>> = {}) {
    super(message)
    // `name` stays `Error`: what a refusal prints is unchanged (`String(e)` is still `Error: …`, which the tests read)
    this.refusal = { kind, parts }
  }
}

/** The one door every customer-caused throw goes through. */
export const refused = (kind: RefusalKind, message: string, parts: Readonly<Record<string, string>> = {}): CompileRefusal =>
  new CompileRefusal(kind, message, parts)

/** A thrown value's tag, read by shape (an Error from another copy of this module still reads), or null for every other throw. */
export function refusalOf(thrown: unknown): RefusalTag | null {
  const tag = (thrown as { refusal?: unknown } | null)?.refusal as Partial<RefusalTag> | undefined
  if (tag === undefined || tag === null || typeof tag !== 'object') return null
  if (typeof tag.kind !== 'string' || !Object.hasOwn(REFUSAL, tag.kind)) return null
  const parts = tag.parts !== null && typeof tag.parts === 'object' ? tag.parts : {}
  return { kind: tag.kind as RefusalKind, parts: Object.fromEntries(Object.entries(parts).filter(([, v]) => typeof v === 'string')) }
}
