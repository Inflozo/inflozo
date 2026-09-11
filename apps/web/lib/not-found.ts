/**
 * THE NOT-FOUND PAGE'S OWN WORDS — extrapolated from `M9 404.dc.html` (R-74).
 *
 * A MODULE AND NOT TWO STRINGS IN THE COMPONENT, for one reason: three harness steps in
 * `run-verify-ghost-admin.py` recognise the not-found page by matching its sentence, and until
 * Story 3.9 they matched NEXT'S OWN default string (`could not be found`) because the app had no
 * page of its own. DW-67's `note:` is explicit that whoever replaces that page breaks those three
 * steps without them saying why. The harness's `app_text()` EVALUATES the app's copy modules
 * rather than retyping their sentences, so putting the words here is what keeps the steps and the
 * screen the same claim — a re-wording moves both at once, which is the whole idiom
 * (`connect-rule.ts`, `probe-rule.ts`, `plan.ts`). It imports nothing, so `node
 * --experimental-strip-types` can read it straight off disk.
 *
 * THE SECOND SENTENCE DROPS THE FRAME'S COUNT. M9 draws "We looked through all 18 variants — it's
 * not in any of them."; the owner ruled the number out (Question 3, option 1, 2026-09-11) under
 * standing rule 4 — every count in this project has gone stale at least once, and nothing would
 * ever catch a stale one on a 404 page.
 */
export const NOT_FOUND = {
  badge: '404',
  title: 'This page shuffled itself out of existence.',
  sub: 'We looked everywhere — it’s not in any of them.',
  home: 'Take me home',
} as const
