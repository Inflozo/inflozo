---
title: 'Story 4.3 — The Ghost helper shim, and its contract tests against recorded real-Ghost output'
type: 'feature'
created: '2026-09-11'
status: 'in-review'
baseline_commit: '52c8c71c5243c17acd1705cc4796ffcb72b90feb'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing a customer can see changes in this story, and there is no screen to look at. It teaches the
editing canvas to imitate Ghost: when a section shows a date, an image, a member count or a list of
posts, the canvas must show **the same thing the published site will show** — down to the exact
image address, because a card that loads a 4000-pixel photograph on the real site and a small one on
the canvas is a broken promise nobody would notice. So this story first **records what a real Ghost
actually prints** on both versions we support, checks those recordings into the repository, and then
writes the imitation against them — with a test that fails on every commit if the two ever drift.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `packages/ghost-shim/src/index.ts` is one line. The runtime therefore fakes Ghost badly
and knowingly: `bindValue` returns `String(raw)` for `img_url` with the comment *"the size is a
Ghost-side concern (4.3's shim owns it)"*, so the canvas shows the **original** image where the site
will serve a rendition; `data-bind-srcset`, `data-helper` and `data-pagination` are refused by name;
`data-repeat` naming a `dataBindings` key emits `{{#foreach}}` over a key that is not a context path,
because the `{{#get}}` half was never built. Three facts the code needs are asserted nowhere it can
read them, and two of the three are already wrong in the repository: the `image_sizes` map in
`tools/stress/build.js` `:148` disagrees with the PRD's normative map on **three of its five keys**,
and `HELPERS.img_url.ok` accepts `800`, which is not a key at all — on a real Ghost that silently
returns the original image and nothing reports it. **The shape of a Ghost sized URL is recorded
nowhere in this repository**, so writing the shim from memory would be the fifth assertion about
Ghost to enter this project as normative text (standing rule 1, AD-23).

**Approach:** Record first, implement second, and let the ordering be structural rather than a good
intention. A probe theme carrying the **normative** `image_sizes` map renders every FR-H5 helper into
a parseable block on T1 (6.58.0) and T3 (5.130.6); `record-shim.py` uploads it, uploads one real
image so a Ghost-hosted path exists to size, reads the rendered templates back and writes dated
recordings under `packages/ghost-shim/fixtures/`. The shim is then written **against those files**,
and `contract.test.ts` asserts every shimmed helper against them per-commit and offline, comparing
image URLs rather than normalising them away. The three directives the shim owns come off
`REFUSED_DIRECTIVES` in the same pass, because a shim nothing calls proves nothing.

## Boundaries & Constraints

**Always:**
- AD-1 — `packages/ghost-shim` imports no Next.js, no Supabase, no Node builtin, no `fetch`, no
  clock, no entropy, and no DOM global it did not receive. It resolves values it is **given**.
  `eslint.config.js` already binds the core packages; the shim is one of them.
- AD-23 — every Ghost fact enters as a recording under `fixtures/`, carrying its capture date and
  the command that produced it. Tests read the recording. **Nothing is written against a
  paraphrase, and no helper is implemented before its recording exists.**
- Standing rule 2 — a contract test with no recording for its helper **fails, naming the helper and
  the capture command**. It never skips, and it never passes vacuously.
- One copy of every rule. `safeUrl`, `safeCssColor`, `parseBindSpec`, `guardField` and the directive
  set stay in `packages/library`; the shim calls them and never re-derives one (AD-36, and the three
  drifted copies Story 4.1's review found).
- The normative `image_sizes` map is **`xs 150 · s 400 · m 750 · l 1200 · xl 2000`** (PRD FR-J2), in
  one place, read by the shim, the probe theme and the gscan harness.
- Both majors are targets and a difference between them is **expressed, not averaged**:
  `{{total_members}}` alone is exact at ≤ 50, comma-formatted on 6 and a raw number on 5, and counts
  gift subscriptions on 6 only (`MEASUREMENTS.md` §15f).

**Ask First:**
- Any write to T1 or T3 beyond the two this story needs — the probe theme (uploaded, activated, and
  the previous theme restored, exactly as `run-verify-all.py` already does) and one image uploaded to
  the content store. Re-seeding, deleting content, or touching settings is the RESET-PROTOCOL's.
- Adding any runtime dependency to `packages/ghost-shim`.
- Editing `packages/library/fixtures/reference-design/` — Story 4.1's authored control.

**Never:**
- Do not parse or execute Handlebars in the browser (FR-H5). The shim resolves values; it does not
  compile templates, and nothing calls `new Function`.
- Do not implement the directives other stories own — `data-t`/`data-t-attr` are 4.9's, `data-items`,
  `data-if`/`data-else`, `data-members`, `data-when`/`data-index`, `data-target`, `data-needs` are
  later. They keep refusing by name.
- Do not invent the fixtures Story 4.4 authors. `{{content}}` and `{{comments}}` resolve to a fixture
  the shim is **handed**; with none, the shim refuses rather than inventing a body (FR-H3).
- Do not normalise an image URL in a contract test, on either side of the comparison. That is the one
  test underwriting the WYSIWYG promise, and normalising is how it passes while being useless.
- Do not let `{{content_api_key}}` render a real key on the canvas, in a snapshot, or in a test.
- Do not change the gscan harness's results (`node gate.js theme` stays 0/0 on both majors).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A sized image URL | `data-bind-attr="src:feature_image\|img_url:m"`, a Ghost-hosted image | Canvas: the URL shape **read from the recording** for `m`, compared byte for byte. Theme: `{{img_url feature_image size="m"}}`. | N/A |
| A size that is not an `image_sizes` key | `img_url:800` | Refused at bind time, naming the five keys. Ghost would silently serve the original and report nothing. | throws |
| An image Ghost does not host | `feature_image = https://static.ghost.org/…` | Whatever the recording shows Ghost does with an external URL — the shim reproduces it and does not guess. | N/A |
| `data-bind-srcset` | `feature_image\|img_url` | Theme: one `{{img_url … size="k"}} Nw` candidate per key, composed from the one map (`img_url` emits no `srcset` of its own — FR-J5). Canvas: the recorded URLs at the same widths. Guarded by FR-H8, and the guard encloses the **element**. | N/A |
| `{{total_members}}`, both majors | the recorded count on each | Each major's own string reproduced, always as a string, never one normalised value. | N/A |
| `{{content_api_key}}` | a linked project holding a real key | An inert placeholder. The real key is absent from the canvas, the snapshot and the test. | N/A |
| `{{#get}}` from `dataBindings` | a declared key with a filter and limit | Theme: `{{#get "posts" filter="…" limit="…"}}`; the filter comes from the **declaration**, never interpolated out of markup. Canvas: the rows the caller supplies. | throws on an undeclared key |
| A `{{#get}}` filter naming render context | a filter referencing the current row | Refused — template-level context only, because Handlebars is synchronous and `{{#get}}` is not (FR-H5). | throws |
| A Ghost URL field with a hostile scheme | `@site.logo = javascript:alert(1)` | Rejected. Ghost-sourced URLs are **`http`/`https` only** — narrower than `safeUrl`'s user allowlist, which also permits `mailto:` and `tel:`. | rejects to `#` |
| A Ghost colour that is not a colour (DW-95) | `accent_color = red;}body{display:none`, then `#f0f` | `safeCssColor(value, '--accent')` — the hostile value falls back to the token, `#f0f` survives. One copy, the library's. | falls back |
| `{{excerpt}}` with no custom excerpt | a seeded post | Ghost's own fallback as recorded, rendered **text-only, sanitised, as a text node** — never through `innerHTML` (NFR-3). | N/A |
| `data-helper="content"` with no fixture | 4.4 has not landed | Refuses, naming FR-H3, rather than rendering an empty body or an invented one. | throws |
| `data-pagination` off a paginated target | `data-pagination="next"` on `post.hbs` | Refused — R-7 restricts the design to paginated targets. | throws |
| A helper with no recording | contract test run | The test **fails**, naming the helper and the capture command. | test fails |

</frozen-after-approval>

## Code Map

- `packages/ghost-shim/{package.json,src/index.ts,src/index.test.ts}` — the stub to fill. It already
  declares `@inflozo/library` as a dependency and carries the `exports` / `typecheck` / `test`
  manifest shape to extend.
- `packages/library/src/vocabulary.ts` — the rulebook. `HELPERS` `:24` (`img_url.ok` is
  `/^[a-z0-9_]+$/i` and must narrow to the five keys), `safeUrl` `:50` (the **user** allowlist —
  the Ghost one is narrower), `safeCssColor` `:71` (DW-95's target; its own comment names this
  story), `GET_SOURCES` `:153`, `BARE_HELPERS` `:127`, `PAGINATED_TARGETS` `:110`,
  `parseBindSpec` `:171`, `guardField` `:192`, `DIRECTIVES` `:276` — `data-bind-srcset`,
  `data-helper`, `data-pagination` and `data-repeat`'s two-sided summary are the entries this story
  makes true. `IMAGE_SIZES` is the one that is missing.
- `packages/library/src/registry.ts` `:48` `DataBinding` — `source`, `filter`, `limit`, `order`,
  `ids`. The `{{#get}}` declaration, already typed and already validated (`validate.ts` `:283-313`:
  `bad-get-key`, `bad-get-ids`, `bad-get-source`, `bad-get-limit`, `bad-get-filter`,
  `binding-unreferenced`, `limit-authored-twice`). **Nothing emits it yet.**
- `packages/section-runtime/src/core.ts` — where the shim plugs in. `RENDERED_DIRECTIVES` `:173`
  and `REFUSED_DIRECTIVES` `:189` (whose comment names the three this story takes), `bindExpr`
  (the theme side), `bindValue` `:481` with the `img_url` admission at `:487`, the `data-repeat`
  emission at `:572-598` (`{{#foreach}}` only), `wrapGuard`, `isEmpty` `:212` (Handlebars 4.7.9's
  own emptiness, read in source), `formatDate` `:461` (UTC getters — AD-1 bans `Intl`).
- `packages/section-runtime/src/{ad36,agreement}.test.ts` — the two proofs. **`img_url:800` appears
  in both** (`ad36.test.ts` `:64,:73,:79,:229`; `agreement.test.ts` `:123,:197,:293,:392`) and moves
  to a real key when the grammar narrows. Every authored design already writes a key
  (`reference-design/index.html` `:30`, `tools/stress/sections.js` `:32,:70,:86,:97,:170`), so the
  narrowing touches tests and nothing else.
- `tools/probe/run-verify-all.py` — **the harness pattern to copy**: `load_env` `:29` (never print a
  key), `jwt` `:38`, `Ghost.api`/`content`/`page`/`upload` `:56-83`, activate `:175`, restore `:215`.
- `tools/probe/theme-all/{package.json,index.hbs}` — the probe-theme shape and the `KEY|name=[…]`
  block convention the recordings parse. **Its `package.json` carries no `image_sizes`**, which is
  exactly why this story needs its own theme (NFR-6(c2): the recording is made against an
  Inflozo-emitted map, because Ghost's resize behaviour follows the theme's own).
- `tools/probe/seed-ghost.py` — **the recorded input set, already seeded and deterministic**: 32
  posts, 8 featured, 6 tags, 8 with no feature image, a page. `IMG` `:73-76` sets every feature image
  to an **external `static.ghost.org` URL**, so nothing currently on T1 or T3 can exercise a sized
  rendition — the recorder uploads one image of its own.
- `tools/stress/build.js` `:148` — `image_sizes: { xs 150, s 400, m 800, l 1600, xl 2400 }`. Three
  keys disagree with FR-J2's normative map; it becomes a reader of the one copy.
- `docs/section-authoring.md` § 3 — the directive vocabulary as documentation; the three directives
  move from refused to rendered.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` — **read-only evidence**:
  FR-H5 `:331` (the shim's contract, and it governs Appendix B on any difference), FR-H1 `:311`,
  FR-J2 `:386` and its normative `image_sizes` map `:388` (which also carries NFR-6(c2)'s
  Inflozo-emitted-`package.json` rule), FR-J5 `:391` (`img_url` emits no `srcset`; the theme
  composes one), NFR-6(c2) `:487`, Appendix B `:913`.
- `.../ARCHITECTURE-SPINE.md` — AD-1 `:96`, AD-23, AD-36 `:376-386` (bullet 4 promises the shim calls
  `safeCssColor` — DW-95), the Conventions row `:416` (`http`/`https` only for Ghost values; excerpts
  text-only and sanitised; **"which live in `ghost-shim` so both renderers inherit them"**), the
  package table `:59` — core packages may import **each other**, so `section-runtime` → `ghost-shim`
  is inside the dependency rule.
- `.../MEASUREMENTS.md` — §15f `:644` (`{{total_members}}`'s brackets and the two majors' divergence,
  executed), §36 `:2726` (`img_url` accepts `absolute` · `format` · `size` **and nothing else**;
  no focal point), §15g `:670` (the NQL builds each major resolves).
- `_bmad-output/implementation-artifacts/deferred-work.md` — **DW-95** is owned by this story.

## Tasks & Acceptance

**Execution:**

- [x] `packages/library/src/vocabulary.ts` -- add `IMAGE_SIZES` as FR-J2's normative map and narrow
  `HELPERS.img_url.ok` to its keys -- the shim cannot build a rendition URL for a size Ghost has no
  rendition for, and `800` fails **silently** on a live site.
- [x] `packages/section-runtime/src/{ad36,agreement}.test.ts` -- move the eight `img_url:800` uses to
  a real key and add the refusal of `800` -- keep every existing assertion; this is a narrowing, not
  a weakening.
- [x] `tools/stress/build.js` -- read `IMAGE_SIZES` instead of its own literal -- one copy (standing
  rule 3); three of its five widths were wrong against FR-J2.
- [x] `tools/probe/theme-shim/` -- a probe theme whose `package.json` is GENERATED at zip time from `IMAGE_SIZES` (derived, never restated), and
  whose `index.hbs`, `post.hbs`, `tag.hbs`, `author.hbs` and `error.hbs` render every FR-H5 helper
  into `KEY|name=[…]` lines -- template-scoped helpers (pagination, `@member`, `{{#match}}`, the
  post-only fields) are only reachable from the template that owns them.
- [x] `tools/probe/record-shim.py` -- upload one image to each Ghost's content store, upload and
  activate the probe theme, read every template back, write `packages/ghost-shim/fixtures/ghost5/`
  and `ghost6/` with capture date and command, restore the previous theme -- AD-23, and the seeded
  feature images are external URLs that no Ghost will resize.
- [x] `packages/ghost-shim/src/` -- the shim, written against the recordings: `img_url` (sized URL
  and `srcset` candidates), `date`, `reading_time`, `excerpt`/`custom_excerpt` (text-only, sanitised),
  `title`, `url`, `tags`, `authors`, `navigation`, `asset`, `#match`, `#if @member`, truthy helpers,
  the pagination context, the four core helpers, `t`, and `#get` → a Content API query from a
  `DataBinding` -- FR-H5's list is the contract and governs Appendix B on any difference.
- [x] `packages/ghost-shim/src/` -- the three NFR-3 carve-outs, here so both renderers inherit them:
  Ghost URL fields `http`/`https` only, every Content-API value a **text node**, excerpts sanitised;
  and `safeCssColor(value, '--accent')` on every colour-valued Ghost field -- closes **DW-95**.
- [x] `packages/ghost-shim/src/contract.test.ts` -- NFR-6(c2): every shimmed helper asserted against
  the recording for **each major**, offline, image URLs compared not normalised, and a missing
  recording failing by name -- standing rule 2.
- [x] `packages/section-runtime/src/core.ts` -- call the shim; move `data-bind-srcset`,
  `data-helper` and `data-pagination` from `REFUSED_DIRECTIVES` to `RENDERED_DIRECTIVES`; emit
  `{{#get}}` where `data-repeat` names a `dataBindings` key -- the partition test keeps the two lists
  derived from `CONSUMED_DIRECTIVES`, so nothing is silently forgotten.
- [x] `packages/section-runtime/src/agreement.test.ts` -- extend the node-by-node proof over the three
  new directives and the `{{#get}}` repeat -- the two intended differences stay asserted positively.
- [x] `docs/section-authoring.md` -- the three directives move from refused to rendered, with the
  `image_sizes` keys named -- the authoring contract is a shipped deliverable.
- [x] `.../ARCHITECTURE-SPINE.md` AD-36 bullet 4 · `deferred-work.md` DW-95 -- the spine's future
  tense becomes present, DW-95 closes with its resolution -- a finding is not closed until it reaches
  an owning document (standing rule 3).

### Review Findings — 2026-09-12

Five layers ran (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra
verifier); none failed. Dismissed as noise or out of reach: 11 — same-origin recognition by scheme or
host case (Ghost builds image URLs from its own configured url); `isMember('')`; nav `current` on
absolute-vs-relative forms (the recorded items are relative for internal links); `excerpt` with both
`words` and `characters` (no directive can pass either); `statusCode`/`message` with no error context;
`totalMembers` above 100,000 aborting the render (a deliberate refusal); the `record-shim` restore
masking an earlier error; the test-count literals in a dated run record; unread extra recordings
(`tag`, `author`, `has`, `encode`, secondary nav — evidence for later stories, not paraphrase);
`formatDate`'s changed default (no caller passes one argument); and the stress harness needing no
`target` (no fixture section carries `data-pagination`).

- [x] [Review][Decision] (ruled option 1, owner 2026-09-12 — fixed) The sample design from Story 4.1 still draws page numbers as an empty list — `packages/library/fixtures/reference-design/index.html:66` carries `<ol data-pagination="numbers">`, the form DW-97 corrected in the authoring guide; the runtime now writes "1 / 3" as the text of an `<ol>`. Editing that fixture is an Ask-First boundary of this spec, so the question is under `## Questions for the owner`.
- [x] [Review][Patch] A hand-picked `{{#get}}` (`ids`) emits ONE post on the theme and every row on the canvas [packages/ghost-shim/src/index.ts:463]
- [x] [Review][Patch] `getExpr` interpolates `filter`/`order`/ids into Handlebars with no emit-time refusal of `"`, braces or newlines — the runtime never runs `validate.ts` [packages/ghost-shim/src/index.ts:447]
- [x] [Review][Patch] `RENDER_CONTEXT`'s `\bthis\b` refuses a legitimate `tag:this-week` [packages/ghost-shim/src/index.ts:426]
- [x] [Review][Patch] `data-bind-srcset` on the canvas bypasses `ghostUrl` — `feature_image = javascript:alert(1)` lands in `srcset` verbatim [packages/section-runtime/src/core.ts:527]
- [x] [Review][Patch] `data-bind-srcset` honours `data-empty="fallback"`, which emits an unguarded `srcset` [packages/section-runtime/src/core.ts:515]
- [x] [Review][Patch] An element carrying both `data-bind-attr="src:…|img_url:l"` and `data-bind-srcset` — the guide's own example — is wrapped in two identical guards [packages/section-runtime/src/core.ts:519]
- [x] [Review][Patch] The canvas ignores `data-repeat-limit` on a `{{#get}}` key the theme refuses, and renders empty when `getRows` carries no entry for a declared key [packages/section-runtime/src/core.ts:822]
- [x] [Review][Patch] R-7 half two — a `{{#get}}` repeat rendered for `error.hbs`/`private.hbs` is not refused at render, though pagination is [packages/section-runtime/src/core.ts:398]
- [x] [Review][Patch] Excerpts are tag-STRIPPED on the canvas where Ghost ESCAPES them (`helpers/excerpt.js` at v5.130.6 and v6.58.0: `_.escape` before `downsize`), a custom excerpt is never truncated by Ghost, and a computed excerpt defaults to 50 words (`meta/generate-excerpt.js`) — three canvas/site disagreements [packages/ghost-shim/src/index.ts:220, packages/section-runtime/src/core.ts:653]
- [x] [Review][Patch] The count helpers render `0` on an unlinked project; FR-H5 says a sample value [packages/ghost-shim/src/index.ts:508]
- [x] [Review][Patch] `{{t}}` is in the ticked task line and in FR-H5, is recorded (`TEXT|t_unknown`), and has no function [packages/ghost-shim/src/index.ts]
- [x] [Review][Patch] `{{tags}}`/`{{authors}}` are "shimmed" by lambdas inside the test file — the shim exports nothing for them [packages/ghost-shim/src/contract.test.ts:399]
- [x] [Review][Patch] `img_url` on an unlinked project turns a relative `/content/images/` path into a relative sized URL that resolves against Inflozo's origin [packages/ghost-shim/src/index.ts:131]
- [x] [Review][Patch] `record-shim.py` exits 0 on a failed major, activates the probe theme outside the `try`, proceeds with no previous theme to restore, and leaves a stale JSON for a template that rendered no probe block [tools/probe/record-shim.py:251,298,405]
- [x] [Review][Patch] Propagation misses: AD-36 #1 still says the allowlist "covers user and Ghost values alike"; `safeCssColor`'s comment says the shim "WILL call"; `data-bind-srcset`'s summary says "srcset and sizes" [ARCHITECTURE-SPINE.md:382, packages/library/src/vocabulary.ts:83,436]
- [x] [Review][Patch] Test hygiene: `SITE` is declared after its first use; the navigation assertion accepts two answers; `seen[5] === seen[6]` fails on a re-record for a reason unrelated to the shim; the `{{url}}` comment claims a relativising rule the code does not have [packages/section-runtime/src/agreement.test.ts:444,644, packages/ghost-shim/src/contract.test.ts:383,432]
- [x] [Review][Patch] Two facts a reader will look for are not written down: `{{#has}}` is recorded but not shimmed (a later story's, with `data-if`), and the recorded `w750` rendition is served only while a theme declaring that width is active — the verifier fetched it under `casper` and got a 302 to the original [this spec, Design Notes and Verification]
- [x] [Review][Defer] `{{date}}` formats in UTC and the theme renders in the SITE's timezone; `RenderInput.site` carries no offset, so every non-UTC customer sees canvas dates hours off — deferred, no caller passes real site data yet (DW-98)
- [x] [Review][Defer] `{{total_paid_members}}`, `{{content_api_url}}`, `t` and `taxonomyItems` have shim functions no directive can reach — `BARE_HELPERS` is 4.1's list; Appendix B's A29 needs `content_api_url` — deferred, pre-existing (DW-99)

**Acceptance Criteria:**

- Given a helper in FR-H5's list, when its contract test runs offline, then it is asserted against a
  dated recording from **both** T1 and T3 — and if the recording is absent the test fails naming the
  helper and the capture command, rather than passing.
- Given a Ghost-hosted image and `img_url:m`, when both emitters render, then the canvas URL is the
  recorded sized URL compared **character for character** and the theme emits
  `{{img_url feature_image size="m"}}`.
- Given `img_url:800`, when a design is rendered, then it is refused at bind time naming the five
  `image_sizes` keys.
- Given `{{total_members}}` at the recorded counts, when the shim resolves it on each major, then it
  reproduces **that major's** own output as a string, and the test asserts the two differ where the
  recordings differ.
- Given a project holding a real Content API key, when the canvas renders `{{content_api_key}}`, then
  an inert placeholder appears and the key is absent from the output.
- Given a hostile Ghost value — a `javascript:` URL, `red;}body{display:none` as an accent colour —
  when either emitter renders it, then it is inert **and** the legitimate value beside it still
  works, each proven by a runnable assertion (AD-36).
- Given `pnpm check`, when CI runs it, then lint, typecheck and every package test pass, with the
  shim's contract tests among them and no network access required.
- Given `node build.js && node gate.js theme` in `tools/stress`, when the harness runs after the
  `image_sizes` correction, then gscan reports 0 errors / 0 warnings on both majors.

## Spec Change Log

## Design Notes

**Why the recording comes first, and why that is structural rather than a good intention.** The
shape of a Ghost sized URL is not recorded anywhere in this repository. Writing the URL builder from
memory and *then* recording would produce a recording that agrees with the code because both came
from the same guess — which is standing rule 2's failure exactly, a control that did not run. So the
task order is the dependency order: no helper is implemented before its recording exists, and the
contract test fails loudly on a missing one rather than skipping.

**Two facts already in the repository are wrong, and both would have poisoned the recording.**
`tools/stress/build.js` `:148` declares `m: 800, l: 1600, xl: 2400` where FR-J2's normative map says
`750`, `1200`, `2000`; and NFR-6(c2) says in its own words that the recording must be made against an
Inflozo-emitted `package.json` *because Ghost's resize behaviour follows the theme's own map*. A
recording captured under the harness's map would be a faithful recording of the wrong theme. Hence
one `IMAGE_SIZES` copy, in the library, read by all three.

**`HELPERS.img_url.ok` accepting `800` is a live defect, not a looseness.** Ghost generates a
rendition per declared `image_sizes` key; a `size=` argument that is not a key returns the
**original** image, and gscan does not validate `image_sizes` at all. So a card would serve a
4000-pixel photograph behind a 300-pixel slot on the customer's site with nothing reporting it. Every
authored design already writes a key — only the two proof files write `800`.

**`section-runtime` imports `ghost-shim` rather than receiving it.** The spine's package table says
the three core packages may depend on `library` **and on each other**, and `section-runtime` already
imports across a package boundary. The DOM is injected because AD-1 forbids reaching a global; the
shim is pure, so there is nothing to inject around and threading it through the walk would be more
code for no property. Routine call, recorded here so the review need not re-derive it.

**The Ghost URL allowlist is narrower than the user one, deliberately.** `safeUrl` permits `http`,
`https`, `mailto`, `tel` and relative, because a user's Link Picker legitimately produces an email or
a phone link. The spine's Conventions row scopes Ghost-sourced values to **`http`/`https` only** — a
`mailto:` arriving in `@site.logo` is not a feature, it is a compromised or confused field. One
function, two allowlists, named where each applies.

**What this story does not build, and who does.** `{{content}}` and `{{comments}}` resolve to Story
4.4's fixtures; the shim defines the seam and refuses when handed nothing. `{{t}}`'s catalog is
Story 4.9's; the shim resolves a key and its `{placeholder}` params against a catalog it is given,
and prints the key when there is no entry — recorded (`TEXT|t_unknown`). `{{#foreach}}` is already
the runtime's, built in 4.2 — the shim adds nothing to it, and this is written down because FR-H5
lists it and a reader will look for it here. **`{{#has}}`** is recorded (`TRUTHY|has_slug_home`) and
not shimmed: it is the conditional story's (`data-if`/`data-else`), which is the only directive that
could reach it. **`{{tags}}` / `{{authors}}`** are `taxonomyItems` — items, not markup, as
`{{navigation}}` is — and no directive reaches them yet either; the recording and the contract test
are what a later story authors against.

**Three things settled by the review (2026-09-12), each read in Ghost's source rather than asserted.**
`{{excerpt}}` on the theme is Ghost's *helper*, not the field: it prefers `custom_excerpt`,
**escapes** the text before truncating (so `<em>` in a custom excerpt is printed literally and is
never stripped), never truncates a custom excerpt, and defaults a computed one to 50 words
(`core/frontend/helpers/excerpt.js` at v5.130.6 and v6.58.0; `meta/generate-excerpt.js`). The Dev
draft stripped tags on the canvas, which was a visible canvas/site disagreement dressed as a
sanitiser; NFR-3's "text-only" is met by `textContent`, which every binding uses. **`{{url}}`** is
relative on the site and the canvas deliberately prints the API's absolute form, because a relative
href on the canvas resolves against Inflozo's origin — an intended difference, now stated; **the
same holds for `img_url` and `srcset`**, where the canvas asks the shim for the `absolute` form of
the recorded relative URL for the same reason, and `{{navigation}}`'s items are printed absolute
because Ghost's own partial does (`helpers/tpl/navigation.hbs`, `{{url absolute="true"}}`). And
**a hand-picked `ids` binding** is N `{{#get}}` blocks in the picked order on the theme (R-20), each
around its own `{{#foreach}}`; the Dev draft emitted only the first, so the site would have shown
one pick where the canvas showed them all.

## Verification

**Commands:**
- `python3 tools/probe/record-shim.py` -- expect: both majors report the theme uploaded, activated
  and **restored**, and the fixture directories carry a dated recording per template. R-82: this is
  the real infrastructure, T1 `ghost6.inflozo.com` (6.58.0) and T3 `ghost5.inflozo.com` (5.130.6),
  keys read from `tools/probe/.env` by variable name and never printed.
- `pnpm check` -- expect: exit 0. Lint (AD-1's bans over the new package), typecheck, and every
  package test including the shim's contract tests — which must pass **with no network**.
- `cd tools/stress && npm install && node build.js && node gate.js theme` -- expect: 0 errors /
  0 warnings on both majors, an unchanged file count, and the AD-34 leak assertions clean. Node 24
  (the shell defaults to 22).
- `python3 tools/doc-audit.py --check` -- expect: PASS, twice (the sub-tools regenerate on the first
  failure).

**Manual checks:**
- The recordings carry their capture date and the command that produced them, and the contract test
  reads them rather than any paraphrase of them (AD-23).
- `grep` the emitted output and the test output for a real Content API key: absent.
- Record the before/after of every gate in a table, baseline captured **before** the change, so a
  check lost in the narrowing is visible rather than inferred (standing rule 2).

---

## Verification — run 2026-09-11

**Every gate, baseline before the change and result after.** The baseline was taken by extracting
`52c8c71c` (the spec's `baseline_commit`) into a scratch tree and running the same commands there, so
a check lost in the narrowing would be visible rather than inferred (standing rule 2).

| Gate | Baseline (52c8c71c) | After | |
|---|---|---|---|
| `pnpm check` | exit 0 | **exit 0** | lint + typecheck + every package test |
| `packages/ghost-shim` tests | 1 (the package names itself) | **all pass**, every one against a recording from T1 and T3 — the runner prints its own count | the stub test is gone; it asserted a constant |
| `packages/section-runtime` tests | all pass | **all pass** — the runner prints its own count | the new ones are Story 4.3's directives and NFR-3's carve-outs |
| `packages/library` tests | pass | **pass** | `parseBindSpec`'s hostile-arg refusal still fires with the narrowed grammar |
| `tools/stress` `node build.js` | 197 files · AD-34 clean | **197 files · AD-34 clean** | unchanged file count, as the spec required |
| `node gate.js theme` — Ghost 5 via gscan 4.49.7 | 0 errors / 0 warnings | **0 / 0** | |
| `node gate.js theme` — Ghost 6 via gscan 6.4.2 | 0 errors / 0 warnings | **0 / 0** | |
| emitted `image_sizes` | `xs 150 · s 400 · m 800 · l 1600 · xl 2400` | **`xs 150 · s 400 · m 750 · l 1200 · xl 2000`** | three of five keys were wrong against FR-J2; now READ from `IMAGE_SIZES` |
| `python3 tools/doc-audit.py --check` | PASS | **PASS**, twice | `record-shim.py` catalogued; the first run regenerated the index, as it does |

**`python3 tools/probe/record-shim.py`** — R-82, the real infrastructure. Both majors reported the
image uploaded, the theme uploaded, activated and **restored** (`theme RESTORED -> 'casper'` on each),
and wrote six dated recordings per major: `index`, `index-page-2`, `post`, `tag`, `author`, `error`.
T1 reported `6.58`, T3 `5.130`. Keys were read from `tools/probe/.env` by variable name and never
printed. No post was created, no post edited, no setting touched.

**The four facts the recording settled, none of which was written down anywhere before:**

1. A **Ghost-hosted absolute URL comes back RELATIVE** — `https://site/content/images/2026/09/x.png`
   at `size="m"` is `/content/images/size/w750/2026/09/x.png`. A canvas that passed the value through
   would show the original; one that pasted Ghost's answer onto its own origin would 404. Both forms
   are recorded and the shim reproduces each. *(Review, 2026-09-12: the rendition behind that URL is
   served only while a theme declaring `m: 750` is ACTIVE — fetched under `casper` it is a 302 to the
   original, while Casper's own `w600` answers 200 at 600px. The shim's contract is the URL Ghost
   prints, not the bytes behind it, so this changes nothing in the code; it is written here so the
   next reader who fetches the recorded URL does not conclude the recording is wrong.)*
2. **`size="800"` returns byte-for-byte what omitting `size=` returns** — the original image, with
   nothing reported. That is the recording behind narrowing `HELPERS.img_url`, and the contract test
   asserts the equality so the day Ghost changes it, the refusal is re-examined rather than assumed.
3. **`{{date}}`'s default format is `MMM D, YYYY`**, not `YYYY-MM-DD`. The runtime's `formatDate` had
   the latter, which was a paraphrase and was wrong on both live majors.
4. **`{{reading_time}}` floors at one minute.** The recorded post's API `reading_time` was **0** and
   the helper printed `1 min read`, so a shim trusting the field prints "0 min read" on every short
   post.

**Manual checks.**
- Each recording carries `captured`, `command` and `ghost_version`, and the contract test asserts all
  three plus that the recording was made under FR-J2's map — a recording captured under any other
  `image_sizes` is a faithful recording of the wrong theme (NFR-6(c2)) and fails by name.
- `grep` for both real Content API keys across the test output, `packages/`, `tools/probe/theme-shim/`
  and the emitted theme: **absent**. No 26-hex string appears in any fixture; the recorder keeps the
  key's shape and the shim emits an inert placeholder whose length differs from a key's.
- **Mutation run, because a contract test that would pass against a broken shim is not a control.**
  Each of these was introduced alone and caught: the sized-URL segment, the default date format, the
  member bracket, the reading-time floor, the excerpt word count, the external-URL pass-through, the
  Ghost URL narrowing, the `{{#get}}` render-context refusal, the key placeholder, the nav slug,
  `page_url`'s first page, the srcset candidate list (two ways), and `bindValue`'s `img_url`
  pass-through. The last one is why `agreement.test.ts` now asserts the sized URL as a **value**:
  every structural check in that file passed with the pass-through defect in place. The list is the
  record; no total is written down, because a count restated is a count that goes stale
  (standing rule 4) and the defects above are the thing that was actually run.

**Independently re-verified before the Dev phase closed, by a second pass that did not write the
code.** The claims above that a reader would otherwise have to take on trust were re-executed:

- **Offline is a control, not a reading.** The contract suite was run inside a network namespace
  with no interfaces (`unshare -rn`): every test passes, none fails (the runner prints the count). NFR-6(c2)'s "no network" therefore holds
  against a kernel that would refuse a socket, not against an inspection of the imports.
- **The absent-recording failure was provoked.** With a recording file removed the suite fails rather
  than shrinking; and because `fixtures/index.ts` is generated from what is on disk
  (`record-shim.py` `:361-365`), a genuinely missing recording drops its import and `recording()`
  throws naming the helper and `python3 tools/probe/record-shim.py` — which the suite's own control
  test asserts for a missing template, a missing value and a missing input.
- **The restore was checked against the live boxes, not against the recorder's own log.** A read-only
  `GET themes/` on each (staff token by variable name, `GHOST6_STAFF_ACCESS_TOKEN` /
  `GHOST5_STAFF_ACCESS_TOKEN` — themes are refused to an integration key) reports **`casper` active
  on both**, with `inflozo-probe-shim` installed and inactive beside the earlier stories' probe
  themes. R-82 satisfied by control.
- **A sample of the mutation run was reproduced from scratch**: `w750` → `750w` in the sized-URL
  segment (caught by three tests), the reading-time floor `1` → `0` (caught), and the Ghost URL
  narrowing removed so `mailto:`/`tel:` pass through (caught). `src/index.ts` was restored byte-identical
  and the suite re-run green after each.
- **One rule-1 gap was found and closed by a source read.** `withCommas` is applied above 50 for both
  majors, but neither recording reaches four digits — both boxes sat at 57, which brackets to `50+`
  and carries no comma — and MEASUREMENTS §15f executed only 45 and 57. `'1,200+'` was therefore an
  unexecuted claim about Ghost inside the story whose premise is cite-or-execute. Settled by **reading
  `core/frontend/utils/member-count.js` at both target tags**: `v5.130.6` (T3) and `v6.58.0` (T1) both
  insert the separator above 50 via Ghost's own `numberWithCommas()` → `toLocaleString()`, v5 returns
  the raw number at ≤ 50 where v6 comma-formats, and v6's total includes `gift` where v5's does not —
  each of which the shim already did. The behaviour was right; only the citation was missing, and it
  now sits beside the code (standing rule 3). The same read strengthens the above-100,000 refusal: the
  two majors do not agree there either, so a single shape would be wrong on one of them.

**Open, and tracked rather than decided:** `data-pagination="numbers"` emits the page indicator and
not a list of numbered page links, because Ghost's pagination context carries only `page` and `pages`
and Handlebars cannot loop a range. The authoring guide's example was an empty `<ol>`, which read as a
list of links and contradicted what ships; **the example was corrected to the indicator form in this
story**, so the guide and the runtime now agree. What stays open is only the product question — should
Inflozo ever offer a clickable row of page numbers, given it would mean counting something Ghost does
not expose — **DW-97**, for the owner, in the first story that authors a paginated design (4.10 is the
first that can). Nothing ships differently from what the guide says in the meantime.

---

## Review — run 2026-09-12

**Five layers, none failed; R-82 on the real infrastructure.** The Real-infra verifier re-executed
the story's claims read-only against T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`, keys by
variable name (`GHOST6_STAFF_ACCESS_TOKEN`, `GHOST5_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`,
`GHOST5_CONTENT_API_KEY`), never printed: `GET /ghost/api/admin/themes/` reports `casper` active and
`inflozo-probe-shim` installed and inactive on both; the uploaded probe image answers 200 on both;
the Content API returns the recorded `title`, `published_at` and `reading_time` for the recorded post
on both, with `filter=slug:no-such-post-xyz` → `posts: []` as the control; the contract suite passes
inside `unshare -rn` with `urlopen` on the same namespace failing to resolve, as the control. No
migration in the diff, so R-99 has nothing to check; no `apps/web` path in the diff, so nothing
app-facing deployed. Supabase, Vercel, Resend and Dodo are untouched by this story.

**What the review changed, all under `### Review Findings`.** Every patch was applied; the suites
after them: the runner prints its own count (`pnpm check`). The three Ghost facts the patches rest on
were read in source at both target tags (`helpers/excerpt.js`, `meta/generate-excerpt.js`), cited
beside the code. One question is the owner's (below); two findings are DW-98 and DW-99.

**A clean review leaves the story in review (R-80).** Deploy is nothing for this story (no
`apps/web` change, `owner_test: none`), and Done is written by the Record prompt.

### Second pass — 2026-09-12

The same five layers ran over the patched tree, with the review-only slice given the most scrutiny.
The Real-infra verifier re-executed read-only: `casper` active and `inflozo-probe-shim` inactive on
both boxes; the recorded `w750` URL is a 302 to the original under Casper while Casper's own `w600`
answers 200 at 600px (the control); the contract suite passes inside `unshare -rn` with `urlopen`
failing in the same namespace; `node build.js` 197 files and `gate.js theme` 0/0 on both majors; no
`apps/web` and no `supabase/` path in the diff. **One claim is not executable read-only:** the
excerpt-escapes-not-strips fact. A third of the seed on each box carries a custom excerpt and none
contains a character `_.escape` touches, so no live page can show the difference without a write;
it rests on the source read at both target tags, cited beside the code. Patched in this pass, all
under `### Review Findings (pass 2)` below: a dotted `post.excerpt` is the FIELD on both emitters
(only the bare `excerpt` is the helper), a custom-only excerpt prints, the library's `dataBindings`
grammar is one exported function the shim runs again at emission (`validateDataBinding`), a
backslash is refused beside the quote, `order` is checked for render context like `filter`,
`{{navigation}}` hrefs are absolute as Ghost's partial prints them, the member sample is keyed on
"no site" rather than "no count", prototype names are not declared keys, a key with rows but no
declaration is refused as a mistyped `{{#get}}`, the canvas caps a hand-picked repeat at the number
picked, the recorder reuses the last upload and files a non-200 page under no template, and the
unlinked `img_url` pass-through and the different-field guard each gained the test whose absence
let them be deleted unnoticed.

### Review Findings (pass 2)

- [x] [Review][Patch] dotted `post.excerpt` took the helper on the canvas and the field on the theme [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] a post with only a custom excerpt was hidden on the canvas (emptiness tested before the helper) [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] `getQuery` re-derived part of the validator's grammar; now `validateDataBinding` is the one copy, called at emission [packages/library/src/validate.ts, packages/ghost-shim/src/index.ts]
- [x] [Review][Patch] `\\` not refused at emission; `order` not checked for render context; the refusal text claimed Ghost queries the literal (it resolves `{{…}}` — the canvas is the reason) [packages/ghost-shim/src/index.ts]
- [x] [Review][Patch] `{{navigation}}` href relative on the canvas where Ghost prints absolute, hidden by the test re-absolutising [packages/ghost-shim/src/index.ts, contract.test.ts]
- [x] [Review][Patch] sample member count keyed on a missing count rather than a missing site; `siteUrl` never reached `bareHelper` [packages/ghost-shim/src/index.ts, packages/section-runtime/src/core.ts]
- [x] [Review][Patch] `t('constructor')` threw; `data-repeat="constructor"` read Object's prototype as a declared key [packages/ghost-shim/src/index.ts, packages/section-runtime/src/core.ts]
- [x] [Review][Patch] a mistyped `{{#get}}` key silently became a `{{#foreach}}`; rows supplied but not an array rendered empty [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] canvas rendered every supplied row for an `ids` binding where the theme emits exactly N [packages/section-runtime/src/core.ts]
- [x] [Review][Patch] recorder: `SystemExit` skipped the other major; a non-200 page's error block was filed under the failed template; one image per run [tools/probe/record-shim.py]
- [x] [Review][Patch] no test reached the unlinked `img_url` branch or the different-field guard — both deletable unnoticed [contract.test.ts, agreement.test.ts]
- [x] [Review][Patch] doc drift: dismissals unlisted, test counts restated, DW-95's hostile set, DW-98's offset wording, DW-99's scope, the probe theme's generated manifest, `img_url`/`navigation` as intended differences, `navSlug`'s transliteration ceiling, the `characters` slice on escaped text [this spec, deferred-work.md, index.ts]
- [x] [Review][Decision] (ruled option 1, owner 2026-09-12 — accepted) the recorder uploaded one image PER RUN in Dev; the spec's Ask-First said one image

## Questions for the owner

### Q1 — the sample design still draws page numbers as an empty list

**Plain English.** Story 4.1 shipped a sample design the tools check against. It has a spot for page
numbers written as an empty list — the form the authoring guide used to show. This story settled
that Ghost cannot give a theme a row of clickable page numbers (DW-97), so the guide now shows a
plain "2 / 3" indicator instead. The sample design was not updated, because this story's spec says
that sample is Story 4.1's and must not be edited without asking. Nothing is broken by leaving it:
the sample is only ever validated, never drawn.

**Example.** The guide now says `<span data-pagination="numbers">1 / 1</span>`. The sample design
still says `<ol data-pagination="numbers"></ol>` — a list with nothing in it.

**Options.**
1. **Change the sample to the indicator form now, in this story's Fix phase** — one line, and the
   sample agrees with the guide **(RECOMMENDED)**.
2. Leave it until DW-97 is decided in Story 4.10 — the sample stays out of step with the guide until
   then.

**Ruled: option 1 (owner, 2026-09-12).** Changed in the Fix phase the same day: `packages/library/fixtures/reference-design/index.html` now carries `<span class="ref__numbers" data-pagination="numbers">1 / 1</span>`, the indicator form the guide shows.

### Q2 — the recorder left a few test images behind on the two test servers

**Plain English.** This story's spec allowed the recorder to upload **one** picture to each test
server, so it had a real Ghost-hosted image to resize. During development the recorder was run
several times, and each run uploaded a fresh copy, because Ghost has no way to delete an uploaded
picture through its API. So there are a handful of identical small test pictures sitting in each
test server's image folder. They are on the two test servers only, never on a customer's site, they
are not visible on any page, and each is about 150 KB. The recorder now reuses the picture it
already uploaded, so this does not happen again.

**Example.** On `ghost6.inflozo.com` the pictures are `inflozo-shim-probe.png` through
`inflozo-shim-probe-7.png`; only the last one is referenced by the recordings.

**Options.**
1. **Accept them as they are** — harmless leftovers on test boxes, and the recorder no longer adds
   to them **(RECOMMENDED)**.
2. Have me delete them by hand on each server's disk under the reset protocol — a shell session on
   each box, for no functional gain.

**Ruled: option 1 (owner, 2026-09-12).** The leftovers stay; `record-shim.py` reuses the recorded upload while it still answers 200, so the one-image boundary holds per story from here on.
