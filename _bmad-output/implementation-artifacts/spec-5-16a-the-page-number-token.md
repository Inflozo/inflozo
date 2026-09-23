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

While you are designing **page 2**, every text box you can edit — a header, a hero, a heading, a button's words —
offers **`{page_number}`**, and it prints the number of the page a visitor is on: **2** at `/page/2/`, **3** on page 3,
and so on. **It is never offered on page 1, and it never prints a number there** — nor on a post, a standalone page or
the 404. While you design page 2 the canvas shows the number the same way a visitor sees it, and the moment you click
into the words to change them the token shows again, so you can see it and edit it. Beside the label of a text box that
has a placeholder there is now a small **`{}`** button: press it and a short menu lists that box's placeholders, each
with one line saying what it does and, on the right, **Copy** and **Insert**.

## Intent

**Problem:** A paginated page cannot say which page it is. R-27 gives each field its own closed list of tokens and no
field lists a page number, so there is no way to write "The archive — page 2" anywhere on the canvas. The owner asked
for it in his own words: *"I want to have a {page_number} dynamic data that I can add anywhere where I can edit text
inline. So users can add a header, hero and show the Page number there."*

**Approach:** `{page_number}` becomes **the one token every `text` and `richtext` prop accepts** — R-182 amends R-27 for
it alone — but it is **offered only while the canvas shows page 2**, and **prints only from page 2 on** (R-186). The
canvas hands it the painted page's number and hands nothing on page 1. The theme emitter substitutes a single constant
Handlebars expression, **guarded so page 1 prints nothing**, which Ghost answers on every later page and answers empty
where there is no pagination at all — so R-183 stays Ghost's own behaviour rather than a rule we enforce. The field
reaches it from the `{}` button beside its label (R-185), the one way every placeholder is offered from here on.

**No Schema phase.** Nothing is stored that was not stored before: the token is characters in a prop's text, and
`content` is already `z.record(z.string(), z.unknown())` (`doc-schema.ts:22`).

## Boundaries & Constraints

**Always:**

- **The token is `{page_number}`, single braces, `{members}`'s form** (R-182). It is not declared by a design: every
  `text` and `richtext` prop accepts it, and a design that declares it is refused at authoring time.
- **Nothing shows a page number that the user did not type** (R-182). No section, no header, no default text gains one.
- **`{page_number}` is offered on page 2 and nowhere else** (R-186). The `{}` menu lists it only while the canvas shows
  page 2 of a paginated template — which R-176 already offers only where a page 2 exists, so "paginated content" needs
  no second rule. On page 1, and on Post, Page, 404, Private and a custom template, a field whose only placeholder is
  this one carries **no `{}` button at all**.
- **It never prints on page 1** (R-186, reversing R-182's one bullet), and never on a post, a standalone page or the
  404 (R-183). It prints the page's own number from page 2 on — 3 on page 3, because page 3 renders page 2's design
  (R-177).
- **A field that page 1 also shows MAY hold it, and that is accepted, not prevented** (R-186, the owner's own words:
  *"If we want to have each page hold it, no problem"*). The header and footer are one object across every page
  (R-180) and a following page 2 is page 1's rows (R-179), so the token can reach page 1's content; page 1 simply
  prints nothing in its place. **Never** try to strip it from page 1's stored text — the value is the user's.
- **On the canvas the number is the page being painted, and only on page 2** — nothing on page 1, nothing where the
  painted target has no pagination.
- **Clicking into the words shows the token again.** The inline controller already re-serializes without token values
  (`inline.ts:71-73` and `:304`, "No token values, so `{members}` reads as typed"), and that behaviour is now
  load-bearing — it must be kept and asserted, not rediscovered.
- **AD-5 holds for every character except the one constant.** The page number's Handlebars expression is a module
  constant inserted raw on the theme emitter **only**; every other character of user text still goes through
  `escapeUserText`, so a typed `{{page_number}}` emits the constant between `&#123;` and `&#125;` and can never become
  a triple-stache. The canvas emitter can never emit a mustache at all, by construction. **The constant is now a
  GUARDED expression** (R-186) — the candidate is `{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}`,
  whose guard is falsy exactly on page 1 and wherever `pagination` is absent — and it is still one string produced by
  our code, never by the user's.
- **Every other word in braces still prints exactly as typed** (R-27, unchanged), and a token split across a mark
  boundary is still not substituted (`marks.ts:121-122`).
- **Whole or nothing** (R-27): Insert refuses a token that would not fit the field's `maxChars`, and says why in the
  limit sentence. That is built; it must keep working for a 13-character token.
- **Every dynamic placeholder is reached one way: a `{}` button beside the field's label** (R-185, owner, 2026-09-23).
  P0-1's caption, chip row and info box **under** the field are withdrawn for every placeholder, existing and future.
  The menu lists the placeholders **that field** accepts, each as its code over one line of description, with **Copy**
  and **Insert** on the right, and nothing else at all (owner, 2026-09-23, amending R-185 the same day).
- **The menu is S4d's and D5b's menu, not a new one.** It is built from `components/editor/bar-menu.tsx` — R-171's own
  anatomy, whose row is already a name over one line at 11px muted with a trailing slot — and placed by `lib/menu.ts`'s
  `openMenu`, which gives light dismiss, Escape and focus return. Same components, same tokens (R-74's extrapolation
  rule).
- **No placeholder without a description.** Every placeholder's one-liner lives in one exported map, and a design that
  declares a placeholder absent from it is refused by `validate.ts`. That is what makes R-185 hold for placeholders
  nobody has thought of yet.
- **Standing rule 1.** Where Ghost serves `pagination.page` to `default.hbs`, **and what `pagination.prev` is on page
  1 of a multi-page archive**, are read in Ghost's own source on both majors **and executed on T1 and T3, recorded in
  `MEASUREMENTS.md` §49, before anything is emitted for either.** The guard is the story's one unproven claim; if the
  recorder contradicts it, **stop and ask** rather than reaching for a Ghost helper.
- **R-82.** Review runs against the real infrastructure: T1 `ghost6.inflozo.com` (6.58.0), T3 `ghost5.inflozo.com`
  (5.130.6), and the deployed app on `app.inflozo.com`.

**Ask First:**

- Emitting anything other than the single constant expression — a guard, a helper, a partial — changes what AD-5
  promises. Halt and ask.
- Adding anything to the placeholder menu beyond the rows themselves — a row is its code, its one line, Copy and
  Insert, and the card holds nothing else. R-185's words are "clean and minimal" and it governs every placeholder from
  here on.
- Giving any *other* token a live Handlebars form. That is the theme-side token debt (`deferred-work.md:3762`,
  `:3776-3778`) and it is not this story.

**Never:**

- Never make token substitution free-form. The allow-list by construction is what closes AD-36 rather than filtering it
  (AD-4, FR-G3).
- Never substitute the token inside a link's attributes or any other attribute sink: `escapeUserText` is called in
  exactly two places (`marks.ts:102` for link attributes, `marks.ts:173` for text), and only the text one substitutes.
- Never add a placeholder control to the canvas's floating mark toolbar. The four marks and the link are what P0-1 puts
  there; the placeholders are reached from the panel field's `{}` button (R-185).
- Never keep `TokenRow` beside the new menu, and never leave the old row on the one field that has a token of its own.
  R-185 is one way for every placeholder, existing and future — two ways is the thing it was ruled to stop.
- **Never write the sentence "Anything else in braces prints exactly as you typed it" anywhere in the product** — not
  in the menu, not under a field, not in a tooltip, not in a help string (owner, 2026-09-23: *"It is understood."*). It
  exists today at `apps/web/components/controls/rich-field.tsx:56-59` and goes with `TokenRow`; the closing grep must
  find it nowhere.
- Never change what `/pilots`, the Section Picker's cards, the design ring's tiles, `tools/check-snapshots.mjs` or the
  render matrix emit. They pass no token values and must stay byte-identical — that is this story's control.
- No migration, no new stored field, no change to `commit()`, the flush, the local store or the hydrate.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Canvas, Home page 2 | a heading holding `The archive — page {page_number}` | `The archive — page 2` | N/A |
| Canvas, Home page 1, same words | the header or a following page 2 carried them back (R-179, R-180) | `The archive — page` — **nothing in the token's place** (R-186) | N/A |
| Canvas, Post / Page / 404 | the site-wide header holding `Orbit Weekly · page {page_number}` | `Orbit Weekly · page` (R-183) | N/A |
| Canvas, click into the words on page 2 | `startInline` re-serializes with no token values | `The archive — page {page_number}` shows again, and the caret can sit inside it | N/A |
| Theme emitter, any target | the same heading | `The archive — page {{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}` — one guarded constant, unescaped, spliced by `UserText.substitute` | N/A |
| The emitted theme on a real Ghost | `/`, `/page/2/`, `/page/3/`, a post | nothing · 2 · 3 · nothing | executed on T1 and T3 before it is emitted |
| Theme emitter, a typed `{{page_number}}` | the user typed double braces | `&#123;` + the guarded constant + `&#125;` — prints `{3}` on page 3, never a triple-stache | AD-36 vector |
| Either emitter, `{pagenumber}` · `{Page_Number}` · `{page_number }` | not the token | literal, escaped exactly as today | N/A |
| **Insert** pressed, field at its limit | `maxChars` leaves fewer than 13 characters | nothing is inserted; the limit sentence appears under the field | whole-or-nothing (R-27) |
| **Copy** pressed | any row | the code on the clipboard, the button says so briefly, the menu stays open | a clipboard the browser refuses leaves the menu usable and says nothing false |
| The `{}` button on the Newsletter's "Join {members} readers" box, **on page 2** | that prop declares `members` | the menu lists **two** rows — `{members}` and `{page_number}` — each with its own line | N/A |
| The same box **on page 1** | that prop declares `members` | the menu lists `{members}` **alone** — no page-number row (R-186) | N/A |
| Any other text box **on page 1**, or on Post / Page / 404 | no prop-declared tokens, and no page number offered | **no `{}` button at all** | N/A |
| Any other text box **on page 2** | no prop-declared tokens | the menu lists `{page_number}` alone | N/A |
| A field whose **whole** value is `{page_number}`, on page 1 | e.g. a button label typed as just the token | the field resolves to an EMPTY string — what the element then does is the design's own `data-empty` guard, which Dev must read and record rather than assume | if a design hides on empty, the element vanishes on page 1; if it does not, an empty button ships |
| An `image`, `url`, `icon` or `date` field | not a text field | no `{}` button — the field accepts no placeholder | N/A |
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

- `apps/web/components/controls/rich-field.tsx:32-62` — **`TokenRow`, which R-185 withdraws**: caption
  `TOKENS THIS FIELD ACCEPTS`, the chips, the grey info box, and the early return at `:35`. Deleted, with its two call
  sites. Its insert handler at `:148-158` is the behaviour the new menu's **Insert** keeps — whole-or-nothing against
  `maxChars`, `session.insert` while the field is live, `replaceRange` at the end when it is not.
- `apps/web/components/controls/sidebar.tsx:293-321` — the one-line `text` field, its `TokenRow` at `:308-320` (also
  deleted) and the hand-rolled insert-at-selection at `:311-319` that **Insert** keeps. `field()` at `:274-326` is where
  both field kinds are dispatched, so it is where the `{}` button is attached to the label for both.
- `apps/web/components/editor/bar-menu.tsx` — **what the new menu is built from** (R-171): `BAR_POPOVER` `:31`,
  `BarMenuCard` `:34-45` (radius 12, 6px padding, `shadow-lg`, an 11/600 uppercase heading, the list scrolling inside
  the card on the Kit's slim scrollbar), `BarMenuRow` `:59-83` — a glyph, the name at 13/500 over **one line at 11px
  muted**, and a **trailing slot**. The header comment `:1-20` is the anatomy, and it is the owner's own.
  **One adaptation:** `BarMenuRow` is itself a `<button>`, and R-185 puts two buttons on the right, so the placeholder
  row is a sibling in this file with the same parts and measures — never a second look.
- `apps/web/lib/menu.ts` — `openMenu` (placement, both-edge clamping R-126, flip, and the scroll-inside-the-menu rule
  from Story 5.13) and `arrowKeys`. A `popover="auto"` gives light dismiss, Escape and focus return for nothing.
  Pitfalls that have bitten: rows must be `relative` or an sr-only word gives the card a second scrollbar, and focus a
  row only inside `openMenu`'s own frame.
- `apps/web/components/kit/icons.tsx` — the Tabler set; **no braces glyph yet**, so `Braces` is added here beside the
  rest and nowhere else.
- `apps/web/components/editor/template-switcher.tsx:14-30` — the worked example of the same anatomy, including how
  `CANVASES[key].caption` supplies each row's one line. The placeholder descriptions are that pattern.
- `apps/web/lib/inline.ts:71-73` `markup()` and `:304` — **serialize with no token values while editing**, the comment
  already says why. `:323-330` `Inline.insert`, **Insert**'s door on the canvas-mounted fields.
- `_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/P0-1 Inline Text Toolbar.dc.html:174-204` — the
  chip row, **withdrawn by R-185**, and `:197`'s "A FIELD WITH NO TOKENS SHOWS NO ROW AT ALL" with it. The frame stays
  the authority for everything else it draws; this surface is extrapolated from S4d/D5b's menu as `bar-menu.tsx`
  already builds it (R-74's own rule for a surface with no frame).

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
- **The page-1 guard, read in source on both majors and controlled locally (2026-09-23).** `pagination.prev` is
  initialised `null` (bookshelf-pagination `lib/bookshelf-pagination.js:82` at 0.1.51 / `:117` at 2.4.1) and the
  `page === 1` branch assigns **only `next`** (`:85-87` / `:120-122`), so **`prev` is literally `null` on page 1 of a
  multi-page archive** — never `0`, never absent. Page 2 takes the else branch and gets `prev = 1` (`:90-93` / `:125-128`),
  truthy. Nothing between there and the template rewrites it: `crud.js:157` / `:201` wraps it by reference, the output
  serializers never touch `pagination` (zero hits under `serializers/` on both majors), `fetch-data.js:103`'s
  `_.cloneDeep` preserves `null`, and `format-response.js:19-21` is a plain assignment. `#if` on a missing path is safe
  because Ghost compiles with `{preventIndent: true}` only — no `strict`, no `assumeObjects`
  (`theme-engine/engine.js:16`) — so the lookup short-circuits to `undefined` and `#if` calls its inverse
  (`handlebars/lib/handlebars/helpers/if.js:16-17`, byte-identical in the 4.7.8 and 4.7.9 pins).
  **Executed control**, express-hbs 2.5.0 on both Handlebars pins, the guard in a layout: page 1 of 5 → `[]`, page 2 of
  5 → `[2]`, page 5 of 5 → `[5]`, no `pagination` key → `[]`, no error. Identical on both runs. **This is a source read
  plus a local control, NOT the T1/T3 record standing rule 1 requires** — that is the story's first task.
  *(The alternative, if the servers ever disagree: `{{#is "paged"}}`, which `rendering/context.js:35-36` / `:32-33`
  pushes exactly when the URL page param > 1 and `helpers/is.js:15` reads off `@root`. Do not reach for
  `{{#if @root.context}}` — `context` is an array on every request and is always truthy.)*
- **`{{t}}` would destroy a literal `{page_number}`:** it is an ICU placeholder to intl-messageformat 5.4.3, and Ghost
  replaces the whole string with "An error occurred" when it is unbound (`theme-engine/i18n/I18n.js:225-231, 307-309`).
  Ghost 6 has an i18next branch behind the **private, default-off** labs flag `themeTranslation` where it would survive.
  **The token therefore never goes inside a `{{t}}` string** — it does not today, and nothing in this story puts it
  there. Related: MEASUREMENTS §44.

## Tasks & Acceptance

**Execution:**

- [ ] `tools/probe/record-page-number.py` -- new recorder in `record-contexts.py`'s pattern (read its docstring, not
      `--help`): generate a probe theme whose `default.hbs` prints `[{{@root.pagination.page}}]`, `[{{pagination.page}}]`,
      `[{{@root.pagination.prev}}]` and **the guard itself**
      `[{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}]`; gate it through `tools/stress/gate.js`, upload
      and activate on T1 and T3, fetch `/`, `/page/2/`, **`/page/3/`**, a post, a public page and a 404 on each, restore
      the previous theme in a `finally` and re-read the active theme to prove it. Refuse to write anything if a control
      fails. **The guard must print nothing at `/`, `2` at `/page/2/`, `3` at `/page/3/` and nothing on the other
      three — on both majors. If it does not, STOP and ask; do not reach for a Ghost helper.** -- standing rule 1 and
      R-82: R-186's guard is this story's one unproven claim, and it is executed before anything is emitted for it.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md` -- add **§49**:
      what `default.hbs` was served on both majors, page by page, with the command and the date. -- the record standing
      rule 1 requires; §48's neighbour.
- [ ] `packages/library/src/vocabulary.ts` -- export `PAGE_NUMBER = 'page_number'` beside `INLINE_TOKENS`, with the
      comment saying it is the one token no prop declares because every `text` and `richtext` prop accepts it (R-182);
      and export `PLACEHOLDERS`, one **one-line description per placeholder**, covering every `INLINE_TOKENS` entry and
      `PAGE_NUMBER`. Leave `INLINE_TOKENS` at its three. -- keeps the closed per-field universe and the universal token
      distinct; the descriptions are what R-185's menu is for, and one map is the only place they can be.
- [ ] `packages/library/src/validate.ts` -- in `bad-inline-token` (`:676-677`), branch on `PAGE_NUMBER` and say that
      every text prop accepts `{page_number}` already, so it is never declared; and refuse a declared token that has no
      `PLACEHOLDERS` entry, naming R-185. Add the unit assertion that every token in the closed set plus `PAGE_NUMBER`
      has a description. -- **this is how R-185 reaches placeholders nobody has thought of yet**: a new one cannot ship
      without the line the menu shows.
- [ ] `packages/section-runtime/src/marks.ts` -- put `page_number` in `TOKEN_SET` and in every prop's `declared` list;
      export `PAGE_NUMBER_HBS`, the **guarded** constant the recorder proved (R-186); give `serializeMarks` a fourth argument saying it is
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
      canvas; **page 1 is simply never given one** (R-186), and Post/Page/404 give none either (R-183).
- [ ] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` -- in `paint()`, keep the whole `site` from the
      `templateContext` call already made at `:1076` and hand `site.pagination?.page` to every section beside `url`
      **only when `now.page === 2`**. `Page` is the `1 | 2` union (`page-two.ts:27`), so that is the whole condition,
      and it is the same `now.page` the pill and the address already read. -- one more field of a call already made;
      page 1 hands none (R-186), and Post, Page and 404 return no pagination so they hand none either (R-183).
- [ ] `apps/web/components/kit/icons.tsx` -- add the Tabler `Braces` glyph. -- one glyph, in the one place glyphs live.
- [ ] `apps/web/components/editor/bar-menu.tsx` -- add the placeholder row beside `BarMenuRow`: the same 10px gutters,
      the code at 13/500 in the mono face over **one line at 11px muted**, and a trailing slot holding **Copy** and
      **Insert** as two small buttons. It is a `<li>` with two buttons, not a button with buttons inside. -- R-185's
      row, in the file whose whole purpose is that the menus cannot drift apart.
- [ ] `apps/web/components/controls/placeholder-menu.tsx` -- new: the `{}` trigger and its menu. The trigger is a small
      `Braces` button beside the field's label — **absent entirely when the field has no placeholder to offer here**,
      which on page 1 is every field but the Newsletter's `proofLine` (R-186) — labelled for a screen reader with the
      field's name; the card is
      `BarMenuCard` headed "Placeholders", and the rows are that field's tokens in `PLACEHOLDERS`' order with their
      descriptions. **The card holds the rows and nothing else — no footer, no explanatory sentence.**
      **Insert** calls the handler the caller passes (the field's existing
      whole-or-nothing insert), **Copy** writes the code to the clipboard and says so on the button for a moment.
      Placement, clamping, light dismiss, Escape and focus return come from `openMenu`; rows are `relative` so no
      sr-only word gives the card a second scrollbar. -- one surface, used by both field kinds and by every placeholder
      there will ever be (R-185).
- [ ] `apps/web/components/controls/rich-field.tsx` -- delete `TokenRow` and its call site; put the `{}` trigger beside
      the field's label, handing it **the offered set** and the existing insert handler (`session.insert`, else
      `replaceRange` at the end, whole or nothing). -- the row goes, the behaviour stays.
- [ ] `apps/web/components/controls/sidebar.tsx` -- the same at the one-line `text` field, keeping its
      insert-at-selection and its refusal caption; the `{}` trigger is attached where `field()` (`:274-326`) draws each
      label, so both kinds get it from one place. **The panel must be told which page is on screen** — `paint()` already
      reads `now.page`, and the panel is keyed across pages (`acrossPages`), so thread the same `Page` down rather than
      deriving it a second way. -- the two field kinds stay one behaviour, and the offer follows the canvas.
- [ ] `packages/library/src/vocabulary.ts` (with the map above) -- **one exported function that answers "which
      placeholders does this field offer, on this page"**: the prop's own `tokens`, plus `page_number` **only when the
      page is 2**. Every caller — both field kinds, the tests, and whatever offers a placeholder in a later epic — asks
      this one function. -- R-186 is a rule about *offering*, and a rule with two implementations is a rule with one
      bug; this is also where a future placeholder declares where it may be offered.
- [ ] `packages/section-runtime/src/agreement.test.ts` -- extend R-27's case (`:290-300`) and add the page number's: the
      canvas prints the handed number, prints nothing when handed none (page 1), and the theme prints the guarded constant;
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
      press **2** and see 2, click back into the words and see the token, open a field's `{}` menu and press **Insert**,
      open the Newsletter's `{members}` box and see **two** rows, switch to the Post canvas and see nothing. Record two
      runs if the first dies on a Playwright timeout (DW-222). -- the deployed walk is where R-80's test is rehearsed.
- [ ] `apps/web/a11y` (the nearest existing home, beside `busy.test.ts`) -- the menu: the trigger names the field it
      belongs to, the card is reachable and dismissable by keyboard, arrow keys walk the rows, Escape returns focus to
      the `{}` button, and **Copy**'s confirmation is announced rather than only coloured. -- R-98's neighbourhood: a
      control that does something says so.
- [ ] `docs/section-authoring.md` -- amend `:478-491`: the per-prop list, the one token that is not in it, and **the
      description every declared token must carry**, with the refusal that enforces it. -- authoring is a documented
      deliverable (FR-G3), and this is the page an author reads before declaring a placeholder.
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` § Components -- **the note the owner
      asked for**, written at Create rather than deferred, because being missed is the thing he asked us to prevent:
      the component entry "The placeholder menu" — every dynamic placeholder, existing and future, reached from a `{}`
      button beside the field's label and never from a row under the field; what the menu holds; P0-1:174-204
      withdrawn; and the refusal that keeps it true (R-185). **Build to it; do not restate it.**
- [ ] `_bmad-output/planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md` -- the field's affordance in one
      line, pointing at DESIGN.md's entry. -- the two spines say the same thing about a surface or neither is trusted.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` -- FR-D4 (`:221`) and FR-G3 (`:282`): the
      per-field sentence gains R-182's one exception. -- R-182's own propagation targets.
- [ ] `_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` -- AD-4
      (`:112`) and AD-5's neighbourhood (`:391`): one constant expression is emitted raw, and why that is not a hole.
      -- standing rule 3; the invariant is where the rule must live.
- [ ] `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` -- tick R-182's,
      R-183's and **R-185's** remaining ⬜ target rows as this story lands them. -- the ledger is the record of what has
      reached where.
- [ ] `_bmad-output/implementation-artifacts/epic-5-context.md` -- an indented sub-bullet under Story 5.16's entry:
      what 5.16a built, in DW-73's shape. Append; never rewrite the file. -- the next story reads this, not the specs.
- [x] `_bmad-output/planning-artifacts/epics.md` -- Story 5.16a's card carries R-185's criterion, its **Rulings** line
      gains R-171 and R-185, and its **Frame** line says the surface is extrapolated rather than drawn. Done at Create.
- [ ] grep the repository for `INLINE_TOKENS`, `substituteTokens`, `TokenRow`, "per-field" and **"else in braces"**
      before the Dev commit; the last must return nothing outside the historical record in this spec and the ruling
      register. -- standing rule 7: a propagation list cannot audit itself.

**Acceptance Criteria:**

- Given the canvas showing **page 2**, when any `text` or `richtext` field is shown, then its `{}` menu offers
  `{page_number}`; and given the canvas showing page 1 — or Post, Page, 404, Private or a custom template — then it does
  not, and a field with no placeholder of its own carries no `{}` button at all (R-186).
- Given a user who types `{page_number}` by hand anywhere, when it is stored, then it is accepted and kept verbatim: the
  offer is restricted, the acceptance is not (R-182, amending R-27; R-186).
- Given the canvas painting page 2, when a section's text holds the token, then `2` is printed; and given the canvas
  painting page 1 — including a header carried there from page 2, or a page 2 that still follows page 1 — then
  **nothing** is printed in its place (R-186, reversing R-182's page-1 bullet).
- Given the canvas painting Post, Page or 404 — including the site-wide header, which is on every one of them — when the
  text holds the token, then nothing is printed in its place (R-183).
- Given a field being edited on page 2, when the user clicks into the words, then the token shows as typed and can be
  edited, and when the edit ends the number shows again (R-182).
- Given the theme emitter, when the text holds the token, then the **guarded constant proved by the recorder** is
  emitted once per occurrence, and every other character the user typed is escaped as it is today (AD-5).
- Given the emitted theme on a real Ghost, when a visitor opens the front page, then nothing is printed in the token's
  place; `/page/2/` prints 2 and `/page/3/` prints 3; a post, a standalone page and the 404 print nothing — executed on
  T1 and T3 and recorded in MEASUREMENTS §49 (standing rule 1).
- Given any other word in braces, when it is typed into any field, then it prints exactly as typed on both emitters
  (R-27, unchanged).
- Given the panel, when a text field with a placeholder is shown, then beside its label — and nowhere else — there is a
  small `{}` button, and under the field there is no caption, no chip and no sentence (R-185).
- Given that button, when it is pressed, then a menu opens **matching `bar-menu.tsx`'s anatomy part for part** — S4d's
  and D5b's card, heading, scrolling list and rows as R-171 set them, at radius 12 with 6px padding and `shadow-lg`,
  each row the placeholder's code at 13/500 over one line at 11px muted — listing exactly the placeholders that field
  accepts, with **Copy** and **Insert** on the right of each and **nothing below the last row** (R-185, and R-74's
  extrapolation rule: same components, same tokens).
- Given a field whose prop declares a token of its own, when the menu opens **on page 2**, then that token and
  `{page_number}` are both listed, each with its own description; **on page 1 that field lists its own token alone**;
  and given a field that is not `text` or `richtext`, then there is no `{}` button at all.
- Given any placeholder declared anywhere in the library, when the library is validated, then it has a one-line
  description or validation fails naming R-185 — so no future placeholder can reach the menu without one.
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

**Why the guard is a truthiness test and not a comparison.** R-186 needs "not page 1" inside `default.hbs`. Handlebars
has no `>` and Ghost's `{{#has}}` would be a second moving part inside an AD-5 exception. `pagination.prev` is the field
that is falsy exactly on page 1 and wherever `pagination` is absent, so `{{#if @root.pagination.prev}}` is the whole
guard — one string, no helper, and R-183 preserved for free. **It is the story's one unproven claim**: the recorder
proves it on both majors before a line is emitted, and if it disappoints, this is an Ask First, not an improvisation.

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

**Restricting the OFFER is not restricting the VALUE, and the spec is deliberate about the difference.** R-186 governs
where `{page_number}` is *offered* and where it *prints*. It does not police what a field may hold: the header is one
object across every page (R-180) and a following page 2 is page 1's own rows (R-179), so a field page 1 shows can carry
the token, and the owner ruled that acceptable in the same breath. Trying to strip it from page 1's stored text would
mean rewriting the user's words behind their back, and it would fight R-179's copy on every keystroke. Page 1 prints
nothing and stores whatever it was given.

**Why the placeholder menu is not a new design.** R-185 asks for a list of choices, each a code with a short
description under it and actions on the right. That is R-171's menu row, already built: `BarMenuRow` is a name at
13/500 over one line at 11px muted with a trailing slot, in a card the owner already specified (radius 12, 6px padding,
`shadow-lg`, an uppercase heading, the list scrolling inside the card). Building the placeholder menu from
`bar-menu.tsx` means the Template switcher, View as and this menu are the same object with different rows — which is
the file's stated reason to exist, and R-74's rule for a surface the export does not draw. The only new parts are the
`{}` trigger and a row that carries two buttons instead of being one.

**Why the description lives with the token and not in the component.** "This should be done for all future placeholders"
is a promise that decays unless something refuses to let it decay. Putting the one-liner in `PLACEHOLDERS` beside the
token, and refusing a declared token that has no entry, means a placeholder added in E9, E10 or Story 5.18 arrives with
its description or does not arrive. The note in DESIGN.md tells a later story *what the surface is*; the refusal makes
sure it cannot be half-built.

## Verification

**Commands:**

- `python3 tools/probe/record-page-number.py` -- expected, on T1 and T3 alike, for **the guard**
  `{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}` in `default.hbs`: `[]` at `/`, `[2]` at `/page/2/`,
  `[3]` at `/page/3/`, and `[]` on a post, a public page and the 404 — with the raw `pagination.page` and
  `pagination.prev` recorded beside it at every one of those addresses; both servers' previous themes restored and
  re-read; `MEASUREMENTS.md` §49 written. **Run before any emission task, and stop if the guard prints anything at
  `/`.** (R-82, standing rule 1, R-186.)
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

- The placeholder menu beside the Template switcher's, at 1440 wide: the same card radius, padding, shadow, heading
  size and row rhythm, differing only in its rows' contents and their two trailing buttons (R-185, R-171).
- The panel with the menu closed: nothing at all under a text field that was not there before this story.

## Owner's manual test

Do this on the real site after Deploy confirms the build, in a desktop browser window about 1440 wide. It uses two of
your projects, and every change is taken back before the end, so they finish as they started.

- **Ghost 5 Project** — its Home has a post grid that is the page's main list, so it has a page 2.
- **Pilot sections** — for a post and a hero.

Steps 1 to 3 are your **R-186**: nothing offered on page 1, offered on page 2. Steps 4 and 5 are your **R-185**: the
`{}` button beside a field's label, its menu, and Insert. Steps 6 and 7 are the number on the canvas and the token back
when you click in (R-182). Steps 8 to 10 are the header — including **the gap on page 1 that R-186 accepts**, so you can
see it rather than be told about it. Step 11 is the one thing that must *not* change.

Both projects are left exactly as they started.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home | Click the post grid ("Everything Orbit Weekly published this spring"). In its settings on the right, look beside the label of the small **Eyebrow** box. | — | **No `{}` button.** On page 1 nothing offers a page number, which is your rule. |
| 2 | same | Editor, Home | Still in the post grid's settings, press **2** in the **Preview page** row. | — | Page 2 opens, with the dark **Page 2 · ‹ Back to page 1** pill at the top. |
| 3 | same | Page 2 | Look beside the same **Eyebrow** box's label again. | — | A small **`{}`** button is there now. |
| 4 | same | Page 2 | Press it. | — | A small menu headed **Placeholders**, with one row: **`{page_number}`** and one line under it saying what it does. On its right, **Copy** and **Insert**. Nothing appears under the box itself. |
| 5 | same | Page 2 | Click at the end of the words in the Eyebrow box, then press **Insert**. | — | `{page_number}` is put in where your cursor was. |
| 6 | same | Page 2 | Press **Esc** to close the menu and click the grey ground beside the page. | — | The eyebrow on the canvas ends in **2**. |
| 7 | same | Page 2 | Click into those words on the canvas. | — | They change back to show `{page_number}` so you can edit them. Click the ground again and the **2** comes back. |
| 8 | same | Page 2 | Press **Back to page 1** and look at the eyebrow. | — | Page 1's eyebrow is unchanged — no number and no gap. Changing page 2 never touched page 1. |
| 9 | same | Page 2 | Press **2** again. Click the **header** at the top of the page, find its button's **Label** box, press its **`{}`** and then **Insert**. Answer the site-wide prompt with **Change it everywhere**. | — | The header's button on page 2 ends in **2**. The prompt appears because the header is on every page of your site. |
| 10 | same | Page 2 → page 1 → Post | Press **Back to page 1** and look at the header. Then open the **Template** menu in the top bar and choose **Post**. | — | **This is the cost of the rule, and it is expected:** on page 1 and on the post the header's button shows **no number** — where "2" was, there is nothing. Choose **Home**, press **2**, and press **⌘Z** until the header and the eyebrow are back as they were. |
| 11 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Click the hero's big headline and type over it. | `Nothing to see {here}` | It reads **Nothing to see {here}** — braces and all. Press **⌘Z**. |

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

**Ruled: none of the three — a design of his own (owner, 2026-09-23).** *"It should not repeat. Change in how dynamic
placeholders ({members}, {page_numbers} etc to be shown. We will show a small '{}' icon near the label of the field
where we can have dynamic placeholders. On click of that, it will show the list of placeholders we can choose and a
small descriptions below each. On right side we will have option to copy that code and insert that code. Keep overall
design clean and minimal. This should be done for all future placeholders and existing ones. Add a note about this
design so it is not missed when we work on them in future."* Recorded as **R-185**.

- **Nothing goes under the field any more.** P0-1's caption, chip row and grey info box are withdrawn — for
  `{page_number}`, for `{members}`, and for every placeholder that comes later.
- **A small `{}` button sits beside the field's label**, on every field that accepts a placeholder — which, since
  R-182, is every text box.
- **Its menu** lists the placeholders *that field* accepts: the code, one line under it saying what it does, and
  **Copy** and **Insert** on the right. **Nothing else** — the sentence about other words in braces is withdrawn with
  the chip row it sat in (owner, 2026-09-23: *"Do not mention 'anything else in braces prints exactly as you typed
  it' anywhere. It is understood."*), so it appears nowhere in the product.
- **It is not a new look.** The menu is the one already agreed for Template and View as (R-171) — the same card, the
  same heading, the same rows of a name over one muted line with a slot on the right. Only the rows' contents differ.
- **The note asked for** is a component entry in `DESIGN.md`, and it is backed by a refusal: a placeholder declared
  without its one-line description fails validation, so a later story cannot add one that the menu cannot explain.

### Question 2 — Is `{page_number}` for page 2 only, or for every page?

**In plain English.** You asked: *"{page_number} should be accepted by every editable text fields on Page 2 only. — is
this correct?"* **No — as the story stands it is every page, not page 2 only**, and that is what you ruled yesterday.
R-182's words were *"Page 1 should respect the design user created. If user does not uses {page_number} then we should
not show it"*, and the option you picked showed **page 1 printing "1"**. So today the spec says: you can type it in any
text box on any page, and it prints the number of the page a visitor is on — 1 on your front page, 2 at `/page/2/`,
3 on page 3 — and nothing on a post, a standalone page or the 404.

There is also something that makes "page 2 only" hard to mean literally. Your header and footer are **one thing shared
by every page** (R-180), and page 2 **starts as an exact copy of page 1** (R-179). So a `{page_number}` you type on
page 1 is already on page 2 by itself, and one typed into the header is on every page of your site. A field cannot
really accept it "on page 2 only" when the field is the same field everywhere.

**An example.** You type "The archive — page {page_number}" into your post grid's small line, on page 1.

- Today's story: page 1 reads "The archive — page 1", `/page/2/` reads "page 2", `/page/3/` reads "page 3".
- Page-2-only: page 1 would read "The archive — page" with a gap, and only `/page/2/` onwards would show a number.

1. **Every page, as you ruled yesterday (RECOMMENDED).**
   - Page 1 shows **1**, page 2 shows **2**, page 3 shows **3**. A post, a standalone page and the 404 show nothing.
   - The sentence always reads properly, because a number is always there where there is a page.
   - Nothing changes in the story; it is ready to build.
2. **Every page can hold it, but page 1 prints nothing** — only page 2 and later show a number.
   - Your front page stays completely clean even if the token is in the header.
   - "The archive — page" on page 1 reads as a mistake, and R-182 is reversed.
3. **Only offered while you are looking at page 2** — the `{}` menu shows the page number row on page 2 only.
   - It is impossible to add it anywhere but page 2 deliberately.
   - It does not actually confine it: a copy or a header still carries it to page 1, so page 1 would print a number you
     could not have added there. This is the one option that does not do what it sounds like.

**Ruled: option 3, and option 2 with it (owner, 2026-09-23).** *"{page_number} should be only offered on 2nd page design
of paginated content. We want to show pages only on 2nd, 3, 4, 5… etc pages and never on the first page. We should not
give the placeholder option for any text field on the 1st page. If we want to have each page hold it, no problem, but do
not give options to the users to add {page_number} on 1st page."* Recorded as **R-186**.

- His last sentence answers the objection option 3 carried on its own: **the offer is confined, the value is not, and
  that is accepted.** So both halves bind — offered on page 2 alone (option 3), and printing nothing on page 1
  (option 2).
- **R-182's page-1 bullet is reversed** by this. Everything else in R-182 stands.
- The theme's one constant becomes a guarded one, `{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}`,
  which is read in Ghost's source on both majors and executed locally — and recorded on T1 and T3 as this story's first
  task, before anything is emitted.

### Question 3 — Should the page number be offerable in the header and footer at all?

**In plain English.** Your rule is now clear: offered on page 2 only, and never a number on page 1. There is one place
where "never on page 1" cannot be made tidy, and it is the place your very first request named — **the header**.

Your header and footer are **one thing across your whole site** (your R-180). There is no separate page-2 header. So if
you add `{page_number}` to the header while designing page 2, that same header is on your front page and on every post,
and there it prints nothing — leaving a hole in the middle of your own sentence. The rule is still obeyed; it just does
not read well.

**An example.** On page 2 you set your header's button to "Page {page_number}". On `/page/2/` it reads **Page 2**. On
your front page and on every post it reads **Page** — and if you had typed only `{page_number}` with no other words, the
button would be blank there.

1. **Leave it offerable in the header and footer, as your ruling allows (RECOMMENDED).**
   - It is what you asked for originally — *"users can add a header, hero and show the Page number there"*.
   - Your rule holds: page 1 shows no number.
   - You have to write the words so they still read without the number, and a header that is only the token goes blank
     on page 1. Step 10 of your test shows you exactly this, so you can judge it for yourself.
2. **Do not offer it in the header or the footer — only in page 2's own sections.**
   - "Never on page 1" becomes absolute: nothing site-wide can ever carry a page number anywhere.
   - You lose the header, which was your first example of where you wanted it. A page number could then only go in a
     section that belongs to page 2 — a hero, a heading, a grid's small line.

**Ruled:** _(awaiting the owner)_
