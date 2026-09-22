---
title: 'Story 5.16a — The page number token'
type: 'feature'
created: '2026-09-23'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: '350876bd3f6154d1c4d442adbf2235dbd0bbafd2'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

Type `{page_number}` into any text you can edit — a header, a hero, a heading, a button's words — and it prints the
number of the page the visitor is on: **1** on your front page, **2** at `/page/2/`, **3** on page 3, and **nothing at
all** on a post, a standalone page or the 404. While you design, the canvas shows the number the same way a visitor
sees it, and the moment you click into the words to change them the token shows again, so you can see it and edit it.
Under every text box in the settings panel there is now a small `{page_number}` chip that puts it in at your cursor, and
every other word you write in braces still prints exactly as you typed it.

## Intent

**Problem:** A paginated page cannot say which page it is. R-27 gives each field its own closed list of tokens and no
field lists a page number, so there is no way to write "The archive — page 2" anywhere on the canvas. The owner asked
for it in his own words: *"I want to have a {page_number} dynamic data that I can add anywhere where I can edit text
inline. So users can add a header, hero and show the Page number there."*

**Approach:** `{page_number}` becomes **the one token every `text` and `richtext` prop accepts** — R-182 amends R-27 for
it alone. The canvas substitutes the number it is painting (`templateContext`'s own `site.pagination.page`, the value
Story 5.16 already computes for the page's address) and nothing where the page has none. The theme emitter substitutes a
single constant Handlebars expression, `{{@root.pagination.page}}`, which Ghost answers on every paginated page, in
`default.hbs` and in partials, and answers empty where there is no pagination — so R-183 is Ghost's own behaviour rather
than a rule we enforce. Under every text field the P0-1 chip row now offers it.

**No Schema phase.** Nothing is stored that was not stored before: the token is characters in a prop's text, and
`content` is already `z.record(z.string(), z.unknown())` (`doc-schema.ts:22`).

## Boundaries & Constraints

**Always:**

- **The token is `{page_number}`, single braces, `{members}`'s form** (R-182). It is not declared by a design: every
  `text` and `richtext` prop accepts it, and a design that declares it is refused at authoring time.
- **Nothing shows a page number that the user did not type** (R-182). No section, no header, no default text gains one.
- **On the canvas the number is the page being painted** — 1 on page 1, 2 on page 2 — and **nothing** where the painted
  target has no pagination (R-183): Post, Page, 404, Private, a custom template.
- **Clicking into the words shows the token again.** The inline controller already re-serializes without token values
  (`inline.ts:71-73` and `:304`, "No token values, so `{members}` reads as typed"), and that behaviour is now
  load-bearing — it must be kept and asserted, not rediscovered.
- **AD-5 holds for every character except the one constant.** The page number's Handlebars expression is a module
  constant inserted raw on the theme emitter **only**; every other character of user text still goes through
  `escapeUserText`, so a typed `{{page_number}}` emits `&#123;{{@root.pagination.page}}&#125;` and can never become a
  triple-stache. The canvas emitter can never emit a mustache at all, by construction.
- **Every other word in braces still prints exactly as typed** (R-27, unchanged), and a token split across a mark
  boundary is still not substituted (`marks.ts:121-122`).
- **Whole or nothing** (R-27): the chip refuses to insert a token that would not fit the field's `maxChars`, and says
  why in the limit sentence. That is built; it must keep working for a 13-character token.
- **Standing rule 1.** Where Ghost serves `pagination.page` to `default.hbs` is read in Ghost's own source on both
  majors **and executed on T1 and T3, recorded in `MEASUREMENTS.md` §49, before anything is emitted for it.**
- **R-82.** Review runs against the real infrastructure: T1 `ghost6.inflozo.com` (6.58.0), T3 `ghost5.inflozo.com`
  (5.130.6), and the deployed app on `app.inflozo.com`.

**Ask First:**

- Question 1 below (where the token row's explanation line goes) is the owner's and is open. Build the RECOMMENDED
  option; if he rules otherwise, change it inside this story.
- Emitting anything other than the single constant expression — a guard, a helper, a partial — changes what AD-5
  promises. Halt and ask.
- Giving any *other* token a live Handlebars form. That is the theme-side token debt (`deferred-work.md:3762`,
  `:3776-3778`) and it is not this story.

**Never:**

- Never make token substitution free-form. The allow-list by construction is what closes AD-36 rather than filtering it
  (AD-4, FR-G3).
- Never substitute the token inside a link's attributes or any other attribute sink: `escapeUserText` is called in
  exactly two places (`marks.ts:102` for link attributes, `marks.ts:173` for text), and only the text one substitutes.
- Never add a chip to the canvas's floating mark toolbar. The four marks and the link are what P0-1 puts there; the
  token chip lives under the panel field, which is where P0-1 draws it (`:174-204`) and how R-182 words it.
- Never change what `/pilots`, the Section Picker's cards, the design ring's tiles, `tools/check-snapshots.mjs` or the
  render matrix emit. They pass no token values and must stay byte-identical — that is this story's control.
- No migration, no new stored field, no change to `commit()`, the flush, the local store or the hydrate.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Canvas, Home page 1 | a heading holding `The archive — page {page_number}` | `The archive — page 1` | N/A |
| Canvas, Home page 2 | the same heading, `shownPage.page === 2` | `The archive — page 2` | N/A |
| Canvas, Post / Page / 404 | the site-wide header holding `Orbit Weekly · page {page_number}` | `Orbit Weekly · page` — the token prints nothing (R-183) | N/A |
| Canvas, click into the words | `startInline` re-serializes with no token values | `The archive — page {page_number}` shows again, and the caret can sit inside it | N/A |
| Theme emitter, any target | the same heading | `The archive — page {{@root.pagination.page}}` — one expression, unescaped, spliced by `UserText.substitute` | N/A |
| Theme emitter, a typed `{{page_number}}` | the user typed double braces | `&#123;{{@root.pagination.page}}&#125;` — prints `{3}` on page 3, never a triple-stache | AD-36 vector |
| Either emitter, `{pagenumber}` · `{Page_Number}` · `{page_number }` | not the token | literal, escaped exactly as today | N/A |
| Chip pressed, field at its limit | `maxChars` leaves fewer than 13 characters | nothing is inserted; the limit sentence appears under the field | whole-or-nothing (R-27) |
| A design declares `tokens: ["page_number"]` | `validate.ts` | `bad-inline-token`, with a sentence naming R-182: every text prop accepts it already, so it is never declared | authoring refusal |
| `/pilots`, picker cards, ring tiles, `check-snapshots`, the render matrix | no token values passed | unchanged, byte for byte | the story's control |

## Code Map

**The token vocabulary**

- `packages/library/src/vocabulary.ts:321-324` — `INLINE_TOKENS = ['members','term','n']`, R-27's closed per-field
  universe. It stays as it is; `page_number` is a **new sibling constant**, not a fourth member, so `validate.ts` keeps
  refusing a design that declares it.
- `packages/library/src/validate.ts:675-682` — `bad-inline-token` (outside the closed set) and `tokens-on-non-text`
  (only `text` and `richtext` may declare). The first gains R-182's sentence.
- `docs/section-authoring.md:478-491` — "A prop declares which inline binding tokens it accepts" and "Two brace
  grammars, deliberately". The one token that is not per-prop belongs here.

**The substitution, shared by both emitters**

- `packages/section-runtime/src/marks.ts:59` — `TOKEN_SET = new Set(INLINE_TOKENS)`; the gate at `:130`.
- `packages/section-runtime/src/marks.ts:115-135` — `substituteTokens(run, declared, values)`; regex
  `/\{([A-Za-z_][A-Za-z0-9_]*)\}/g`; `:129` returns the run untouched when the prop declares nothing, `:133` keeps a
  token literal when no value was handed. **Three lines to amend, and the header comment above them.**
- `packages/section-runtime/src/marks.ts:47-57` — `escapeUserText`: `{`→`&#123;`, `}`→`&#125;`, AD-5's rule 1.
- `packages/section-runtime/src/marks.ts:170-173` — `declared` from `def.tokens`, and `esc = escapeUserText(substituteTokens(…))`.
  **This ordering is the crux:** substitution runs first and is then escaped, which is exactly why no substituted value
  can be a live mustache today. The page number needs escaping and substitution interleaved — escape the literal pieces,
  insert the replacement between them.
- `packages/section-runtime/src/core.ts:286-294` — `UserText.substitute`, the theme's one door, calling
  `serializeMarks(value, def, this.tokens)` in a single regex pass. `UserText` exists **only** on the theme path
  (`core.ts:1711`, `users !== null` at `:1122`), so it is the natural place to say "emit the Handlebars form".
- `packages/section-runtime/src/core.ts:1129` and `:1147` — the canvas's two `serializeMarks` sinks (`data-prop`,
  `data-initials`); `:1083` reads `input.tokens ?? {}`.
- `packages/section-runtime/src/core.ts:1707-1720` / `:1723-1726` — `renderTheme` and `renderCanvas`. Note
  `done(tokens.resolve(…))`: `Tokens.resolve` (the design-authored Handlebars) runs **before** `UserText.substitute`, so
  an expression the user text emits lands in the final string untouched.

**The canvas's page number**

- `packages/library/src/orbit-weekly.ts:276-307` — `templateContext(target, feed, of)`. `:297` picks `n`
  (`feed === 'second' ? 2`), `:298-300` builds `pagination`, `:305` returns `site.pagination` and `site.currentUrl`.
  **`post.hbs` and `page.hbs` return at `:286` and a non-paginating target at `:295`, both with no `pagination`** — which
  is R-183 on the canvas, for free.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx:1075-1076` — `paint()` already makes that exact
  call for `url`. The page number is one more field of the same result.
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx:342-346` — `shownPage`, `page: Page`; `:543-544`
  the ref `paint()` reads; `:989-999` `switchPage`, the one door.
- `apps/web/lib/canvas.ts:64-107` — `renderSection`, its `url?: string` prop at `:88` and the override at `:91-92`.
  **The header renders at `default.hbs`, which on its own answers no pagination at all** — the same reason 5.16 had to
  hand `url` in, so the page number is handed in beside it.
- `apps/web/lib/page-two.ts:27` `Page = 1 | 2`; `:123` `pageFileOf`.

**The panel and the canvas's inline editor**

- `apps/web/components/controls/rich-field.tsx:32-62` — `TokenRow`: caption `TOKENS THIS FIELD ACCEPTS`, the chips
  (pressed when the text already holds one), and the grey info box. `:35` is the early return that makes a field with no
  tokens show no row. Used at `:148-158`.
- `apps/web/components/controls/sidebar.tsx:293-321` — the one-line `text` field and its own `TokenRow` at `:308-320`,
  with the hand-rolled insert-at-selection at `:311-319`.
- `apps/web/lib/inline.ts:71-73` `markup()` and `:304` — **serialize with no token values while editing**, the comment
  already says why. `:323-330` `Inline.insert`, the chip's door on the canvas-mounted fields.
- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/P0-1 Inline Text Toolbar.dc.html:174-204` — the
  frame. `:197` "A FIELD WITH NO TOKENS SHOWS NO ROW AT ALL" is the rule Question 1 puts to the owner.

**Read-only evidence already gathered (Ghost's source, both majors, 2026-09-23)**

- `pagination` is hoisted to the response root by `core/frontend/services/rendering/format-response.js:19-21`
  (byte-identical on 5.130.6 and 6.58.0) and handed to `res.render` at `rendering/renderer.js:35`.
- express-hbs **2.5.0 on both majors** renders the page template first and then the layout **with the same locals
  object** (`express-hbs/lib/hbs.js:516-536`), and Ghost never sets `data.root`
  (`theme-engine/middleware/update-global-template-options.js:37-48`), so Handlebars' own `initData` makes `@root` the
  context. **`{{pagination.page}}` and `{{@root.pagination.page}}` both resolve in `default.hbs` and in a partial
  rendered from it; inside `{{#foreach}}`, `{{#get}}` or `{{#post}}` only the `@root` form does.** Corroborated by
  Ghost's own `helpers/page_url.js:16` reading `options.data.root`.
- **Never emit the `{{pagination}}` helper into `default.hbs`:** it throws `IncorrectUsageError` when `this.pagination`
  is not an object (`helpers/pagination.js:24-30`, identical on both) and it is synchronous, so it is a 500 on every
  post, page and 404.
- `post.hbs` / `page.hbs` never get a root `pagination` (`format-response.js:77-115`), and the 404's data object is
  `{message, statusCode, errorDetails}` alone (`web/middleware/error-handler.js`) — **absent, not null**, so the
  expression renders empty.
- Page 1: `/page/1/` 301s to the bare URL (`routing/middleware/page-param.js:23-25`) and the controller defaults
  `page: 1` (`controllers/channel.js:27`), so `pagination.page` is present and `=== 1`.
- **There is no `{{page}}` helper on either major** — `core/frontend/helpers/` holds `page_url.js` and `pagination.js`
  and no `page.js`; `@page` is `{show_title_and_feature_image}`, not a number (`format-response.js:26-42`).
- **`{{t}}` would destroy a literal `{page_number}`:** it is an ICU placeholder to intl-messageformat 5.4.3, and Ghost
  replaces the whole string with "An error occurred" when it is unbound (`theme-engine/i18n/I18n.js:225-231, 307-309`).
  Ghost 6 has an i18next branch behind the **private, default-off** labs flag `themeTranslation` where it would survive.
  **The token therefore never goes inside a `{{t}}` string** — it does not today, and nothing in this story puts it
  there. Related: MEASUREMENTS §44.

## Tasks & Acceptance

**Execution:**

- [ ] `tools/probe/record-page-number.py` -- new recorder in `record-contexts.py`'s pattern (read its docstring, not
      `--help`): generate a probe theme whose `default.hbs` prints `[{{@root.pagination.page}}]` and `[{{pagination.page}}]`,
      gate it through `tools/stress/gate.js`, upload and activate on T1 and T3, fetch `/`, `/page/2/`, a post, a public
      page and a 404 on each, restore the previous theme in a `finally` and re-read the active theme to prove it. Refuse
      to write anything if a control fails. -- standing rule 1 and R-82: the claim is executed before anything is emitted
      for it.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` -- add **§49**:
      what `default.hbs` was served on both majors, page by page, with the command and the date. -- the record standing
      rule 1 requires; §48's neighbour.
- [ ] `packages/library/src/vocabulary.ts` -- export `PAGE_NUMBER = 'page_number'` beside `INLINE_TOKENS`, with the
      comment saying it is the one token no prop declares because every `text` and `richtext` prop accepts it (R-182).
      Leave `INLINE_TOKENS` at its three. -- keeps the closed per-field universe and the universal token distinct, so
      the authoring refusal below still fires.
- [ ] `packages/library/src/validate.ts` -- in `bad-inline-token` (`:676-677`), branch on `PAGE_NUMBER` and say that
      every text prop accepts `{page_number}` already, so it is never declared. -- a designer who tries it gets the
      reason, not the closed-set list.
- [ ] `packages/section-runtime/src/marks.ts` -- put `page_number` in `TOKEN_SET` and in every prop's `declared` list;
      export `PAGE_NUMBER_HBS = '{{@root.pagination.page}}'`; give `serializeMarks` a fourth argument saying it is
      emitting for the theme; interleave escaping and substitution in `esc` so the page number's replacement is inserted
      between escaped literal pieces — raw on the theme, the handed number (or the empty string) on the canvas. Every
      other token keeps today's behaviour exactly, literal included. Update the header comments at `:115-122` and
      `:40-46`. -- the whole mechanism; AD-5 still holds for every character the user typed.
- [ ] `packages/section-runtime/src/core.ts` -- `UserText.substitute` passes the theme flag. Nothing else changes: it is
      the only construction site of `UserText` and it exists only on the theme path, so the canvas cannot emit a mustache
      by construction. -- one boolean, one door.
- [ ] `apps/web/lib/canvas.ts` -- `renderSection` takes `page?: number` beside `url`, and passes
      `tokens: { page_number: String(page) }` when it is given one and no `tokens` at all when it is not. Comment it the
      way `url` is commented: the header renders at `default.hbs` and would otherwise be told nothing. -- R-182 on the
      canvas, R-183 by omission.
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- in `paint()`, keep the whole `site` from the
      `templateContext` call already made at `:1076` and hand `site.pagination?.page` to every section beside `url`.
      -- one more field of a call that is already made; Post, Page and 404 return no pagination, so they hand none.
- [ ] `apps/web/components/controls/rich-field.tsx` -- `TokenRow` is handed the field's own tokens **plus**
      `{page_number}`, so every `richtext` field shows the row; place the grey info box per Question 1's RECOMMENDED
      option. -- P0-1's chip, for the one token every field accepts.
- [ ] `apps/web/components/controls/sidebar.tsx` -- the same for the one-line `text` field, and place the once-per-panel
      info box where Question 1's RECOMMENDED option puts it. -- the two field kinds stay one behaviour.
- [ ] `packages/section-runtime/src/agreement.test.ts` -- extend R-27's case (`:290-300`) and add the page number's: the
      canvas prints the handed number, prints nothing when handed none, and the theme prints `{{@root.pagination.page}}`;
      a prop declaring no tokens gets it too; `{members}` undeclared still stays literal on both sides. -- §7.3's exit
      criterion, and the one test that holds the two emitters together.
- [ ] `packages/section-runtime/src/ad36.test.ts` -- vectors, each asserting the attack is inert **and** the legitimate
      case still works: a typed `{{page_number}}` emits `&#123;{{@root.pagination.page}}&#125;` and never `{{{…}}}`; a
      typed `{{@root.pagination.page}}` ships fully escaped; `{page_number}` inside a link's `title` or `href` is not
      substituted; a C0 character beside the token is still dropped. -- AD-5's first deliberate exception, proved narrow.
- [ ] `apps/web/lib/inline.test.ts` (or the nearest existing home) -- assert that a field being edited re-serializes with
      no token values, so the token shows again on click-in and the caret can sit inside it. -- R-182's second sentence;
      today it is a comment and nothing fails if it is lost.
- [ ] `tools/probe/run-verify-editor.cjs` -- a journey: type `{page_number}` into a heading on page 1, see the number,
      press **2** and see 2, click back into the words and see the token, press the chip under a panel field, switch to
      the Post canvas and see nothing. Record two runs if the first dies on a Playwright timeout (DW-222). -- the
      deployed walk is where R-80's test is rehearsed.
- [ ] `docs/section-authoring.md` -- amend `:478-491`: the per-prop list, and the one token that is not in it.
      -- authoring is a documented deliverable (FR-G3).
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` -- FR-D4 (`:221`) and FR-G3 (`:282`): the
      per-field sentence gains R-182's one exception. -- R-182's own propagation targets.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` -- AD-4
      (`:112`) and AD-5's neighbourhood (`:391`): one constant expression is emitted raw, and why that is not a hole.
      -- standing rule 3; the invariant is where the rule must live.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- tick R-182's and
      R-183's remaining ⬜ target rows (`:3934-3936`, `:3943-3944`) as this story lands them. -- the ledger is the record
      of what has reached where.
- [ ] `_bmad-output/implementation-artifacts/epic-5-context.md` -- an indented sub-bullet under Story 5.16's entry:
      what 5.16a built, in DW-73's shape. Append; never rewrite the file. -- the next story reads this, not the specs.
- [ ] grep the repository for `INLINE_TOKENS`, `substituteTokens` and "per-field" before the Dev commit. -- standing
      rule 7: a propagation list cannot audit itself.

**Acceptance Criteria:**

- Given any `text` or `richtext` prop in any section, when the user types `{page_number}` or presses its chip, then the
  token is accepted — no prop declares it and none has to (R-182, amending R-27).
- Given the canvas painting Home page 1, when a section's text holds the token, then the canvas prints `1`; and on
  page 2, `2` (R-182).
- Given the canvas painting Post, Page or 404 — including the site-wide header, which is on every one of them — when the
  text holds the token, then nothing is printed in its place (R-183).
- Given a field being edited, when the user clicks into the words, then the token shows as typed and can be edited, and
  when the edit ends the number shows again (R-182).
- Given the theme emitter, when the text holds the token, then exactly `{{@root.pagination.page}}` is emitted, once per
  occurrence, and every other character the user typed is escaped as it is today (AD-5).
- Given the emitted theme on a real Ghost, when a visitor opens `/page/3/`, then `3` is printed, and on a post, a
  standalone page and the 404, nothing — executed on T1 and T3 and recorded in MEASUREMENTS §49 (standing rule 1).
- Given any other word in braces, when it is typed into any field, then it prints exactly as typed on both emitters
  (R-27, unchanged).
- Given the panel, when a text field is shown, then its token row matches the frame — `P0-1 Inline Text Toolbar.dc.html`
  `:174-204`: the caption `TOKENS THIS FIELD ACCEPTS`, a 24px mono chip reading `{page_number}` that draws pressed when
  the field already holds it, and the grey "anything else in braces" line placed per the owner's ruling on Question 1
  (R-74).
- Given `/pilots`, the Section Picker's cards, the design ring's tiles, `tools/check-snapshots.mjs` and the render
  matrix, when they render, then their output is byte-identical to the baseline commit — the story's control.

## Design Notes

**Why the theme is one constant and not a value.** Every substitution today is a literal string, escaped like any other
user text (`marks.ts:173`), which is precisely why `{members}` cannot become `{{total_members}}` on the theme
(`deferred-work.md:3776-3778`). The page number is the first token whose theme form must be *live*. Making the
replacement a module constant reached only through `UserText` — which exists only on the theme path — means the raw
insertion can never carry a character the user typed, and the canvas cannot reach it at all. That is a narrower opening
than a general "raw token value" channel, and it is why this story does not pay off the rest of the token debt.

**Why the braces around it are still escaped.** Interleaving matters:

```
user types:   Page {{page_number}}
literal parts: "Page {" and "}"          → escaped → "Page &#123;" and "&#125;"
the token:     {page_number}             → raw     → "{{@root.pagination.page}}"
emitted:      Page &#123;{{@root.pagination.page}}&#125;     → the visitor reads: Page {3}
```

Substituting first and escaping afterwards would emit `&#123;&#123;…` and lose the expression; escaping first and
substituting afterwards would emit `{{{@root.pagination.page}}}`, a triple-stache. Neither is acceptable and the
`ad36.test.ts` vector is exactly this string.

**Why `@root` and not `pagination`.** Both resolve in `default.hbs` and in partials, but only `@root` survives a
context-changing block — `{{#foreach}}`, `{{#get}}`, `{{#post}}` — and a section's text can sit inside any of them. One
form everywhere is also one thing to explain (R-170).

**Why the canvas needs the number handed to it.** `templateContext` answers pagination for the section's *own* target,
and the header's target is `default.hbs`, which has none. Story 5.16 hit the identical wall with the page's address and
solved it by handing one value from `paint()` to every section (`canvas.ts:83-92`). The page number rides the same
channel, from the same call, for the same reason.

**What R-183 costs: nothing.** Ghost leaves `pagination` off a post, a page and the 404, and Handlebars renders a
missing path as the empty string. On the canvas, `templateContext` returns no pagination for those targets. Both sides
answer R-183 without a rule.

## Verification

**Commands:**

- `python3 tools/probe/record-page-number.py` -- expected: T1 and T3 each serve the probe `default.hbs` with
  `[1]` at `/`, `[2]` at `/page/2/` and `[]` on a post, a public page and the 404; both servers' previous themes
  restored and re-read; `MEASUREMENTS.md` §49 written. **Run before any emission task.** (R-82, standing rule 1.)
- `pnpm check` -- expected: green, including `agreement.test.ts`'s page-number cases, `ad36.test.ts`'s brace vectors,
  `check-snapshots.mjs` byte-unchanged and `matrix/cases.test.mjs`.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expected: 0 errors / 0 warnings on both
  majors, with the emitted expression in the 70-section theme. Node 24; a root `pnpm install` first.
- `pnpm matrix` -- expected: green, no re-baseline. The token appears in no design's authored default, so no case moves.
- `bash supabase/tests/run-rls-gate.sh` -- expected: green (unchanged; no migration in this story).
- `node tools/probe/run-verify-editor.cjs` -- expected: every journey passes, including the new page-number one, against
  the deployed `app.inflozo.com`. Record both runs if the first dies on a timeout (DW-222).
- `python3 tools/doc-audit.py --check` -- expected: green, twice.

**Manual checks (if no CLI):**

- The panel's token row against `P0-1 Inline Text Toolbar.dc.html:174-204` at 1440 wide: caption, chip size, mono face,
  the pressed tint when the field holds the token, and the info box where Question 1 puts it.

## Owner's manual test

Do this on the real site after Deploy confirms the build, in a desktop browser window about 1440 wide. It uses two of
your projects, and every change is taken back before the end, so they finish as they started.

- **Ghost 5 Project** — its Home has a post grid that is the page's main list, so it has a page 2.
- **Pilot sections** — for a post and a hero.

Steps 1 to 4 are **R-182**: the number on the canvas, and the token back when you click in. Step 5 is the chip. Steps 6
and 7 are **R-183**: nothing where a page has no number. Step 8 is the one thing that must *not* change.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click the post grid's small eyebrow line ("The archive") and type over it. | `The archive — page {page_number}` | While you type, the words stay exactly as you type them, braces and all. |
| 2 | same | Editor, Home | Click the grey ground beside the page, so nothing is selected. | — | The eyebrow now reads **The archive — page 1**. |
| 3 | same | Editor, Home | Click the post grid, and in its settings on the right press **2** in the **Preview page** row. | — | Page 2 opens, and its eyebrow reads **The archive — page 2**. |
| 4 | same | Page 2 | Click into the eyebrow words. | — | The words change back to **The archive — page {page_number}** so you can edit them. Click the ground again and the **2** comes back. |
| 5 | same | Page 2 | Press **Back to page 1**. Click the post grid and find its **Heading** box in the settings on the right. Click at the end of the heading, then press the small **{page_number}** chip under the box. | — | `{page_number}` is added where your cursor was, the chip turns coral, and on the canvas the heading ends in **1**. Press **⌘Z** twice to take step 5 and step 1 back. |
| 6 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the header's button words at the top right and type over them. | `Page {page_number}` | The button reads **Page 1**. |
| 7 | same | Editor, Post | Open the **Template** menu in the top bar and choose **Post**. | — | The same header button now reads **Page** with no number, because a post has no page number. Choose **Home** again, click the button words and press **⌘Z** to put them back. |
| 8 | same | Editor, Home | Click the hero's big headline and type over it. | `Nothing to see {here}` | It reads **Nothing to see {here}** — braces and all — on the canvas and on your site. Press **⌘Z**. |

## Questions for the owner

### Question 1 — The page number chip now belongs under every text box. Should its grey explanation line repeat under every box too?

**In plain English.** Until now, only a text box that accepted a token showed anything under it — today that is one box
in the whole product, the newsletter's "Join {members} readers". The drawing for this screen says it plainly: a box with
no tokens shows no row at all. Your `{page_number}` changes that, because now **every** text box accepts a token, so
every text box gets the small row: a caption reading TOKENS THIS FIELD ACCEPTS, the `{page_number}` chip, and a grey
line that says "Anything else in braces prints exactly as you typed it — {this} stays {this} on the page."

The caption and the chip are small. The grey line is three lines of text, and the settings panel for one section can
have eight text boxes.

**An example.** Open the newsletter section's settings. It has eight text boxes: the small line above the heading, the
heading, the blurb, the button's words, the note under it, the "Join {members} readers" line, the signed-in words and
the "Manage your preferences" link. With the grey line under each, that same sentence is on your screen eight times and
you scroll about twice as far to reach the bottom of the panel.

1. **The chip under every box, and the grey line once, at the foot of the section's content list (RECOMMENDED).**
   - Every box gets the caption and the `{page_number}` chip, so you can add it wherever you are typing.
   - The sentence about braces is said once per panel, under the last text box, where it still answers the question it
     is there to answer.
2. **Everything under every box, exactly as drawn.**
   - Nothing is placed anywhere new, and the answer is always right beside the box you are looking at.
   - The same three-line sentence appears eight times in the newsletter's panel.
3. **The chip only on boxes that have a token of their own; everywhere else you type `{page_number}` yourself.**
   - The panel looks exactly as it does today, with one row in the whole product.
   - You cannot add the page number by pressing anything — you have to remember the word and type it. Your own
     description of the feature was pressing its chip under the field, so this is the one option that takes something
     away.

Whichever you choose, typing `{page_number}` works in every text box, on the canvas and in the panel, and every other
word in braces still prints exactly as you typed it.

**Ruled:** _(awaiting the owner)_
