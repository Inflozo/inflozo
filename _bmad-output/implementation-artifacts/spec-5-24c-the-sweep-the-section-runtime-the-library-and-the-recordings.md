---
title: 'Story 5.24c — The sweep: the section runtime, the library and the recordings'
type: 'chore'
created: '2026-09-29'
status: 'ready-for-dev'
owner_test: none
review_loop_iteration: 0
baseline_commit: 'e350c124f47534fcea436647210d416fec0e0d31'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

After this story, the machinery every future section is built on refuses the mistakes it used to let through — a
sign-up box outside its form, two different limits on one list, a section claiming an older Ghost than the fields it
reads — and the editor and your live site agree in the few places they could still differ. The recorders that learn
what your two test Ghost sites really print tidy up after themselves and, with the list you approved in Question 1,
fill the empty fields, so what was only read in Ghost's code is now seen on a real site. Nothing on your screens
changes: you will see it on the story board, where each item closes with its proof, and on your two test sites, where
the old probe themes are gone and a tag, an author, a tier and a newsletter have their details filled in.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Group C of the sweep's triage (R-211) is the ledger's open entries about the section runtime, the
library's validator and vocabulary, the stress harness, the render matrix and the Ghost recorders. Re-derived at this
Create from `deferred-work.md` at `e350c124`, it matches this story's card exactly: DW-4, 96, 99, 103, 104, 113, 125,
127, 129, 147, 159, 161, 168, 171, 186, 196, 213, 224, 228, 237 and 288. Each is a rule the runtime or the validator
should hold and does not, a claim about Ghost that no recording shows, or a recorder that leaves the test sites
untidy — and Epics 9 and 10 author every design against these rules.

**Approach:** Close each entry by a change that makes its claim false, with a control seen red when the change is
reverted (standing rule 2), or by the recording its proof is owed. Four read-only passes checked Story 5.24a's plan
against HEAD; where it was wrong, the task below is the corrected one (Design Notes list the corrections). The order
follows the dependencies:
1. **the code, offline** — runtime, validator, lint, types, stress harness, matrix cases, the recorders' cleanup;
2. **the test sites** — Question 1's approved list, then the two re-recordings;
3. **the matrix's baselines**, as Question 2 approved;
4. **the close.**

The owner ruled the three questions on 2026-09-29: the list approved whole, the Show-to frames swapped, and
`darkCapabilities` kept — DW-196 moved to Story 6.1, so this story builds nothing for it.

## Boundaries & Constraints

**Always:**

- **The ledger is the source.** Dev re-derives Group C at HEAD first (Verification's first command); a verdict that no
  longer holds is re-made, never forced. An entry closes only on evidence — a change whose control was seen red with
  the change reverted, a completed recording, or the owner's ruling — as `status: done <date>` with a `resolution:`
  naming Story 5.24c and that evidence. **No entry is deleted or renumbered.**
- **Every write to T1 or T3 follows `tools/probe/RESET-PROTOCOL.md` § Ghost.** Only what Question 1's ruling approves,
  on the inventory it names: Dev re-reads the inventory first, reports any difference and acts on nothing it does not
  name. Every setting switched is put back in a `finally` and read back; every write is recorded verbatim in
  `MEASUREMENTS.md`. Keys by variable name only (`docs/project-context.md`).
- **A render-matrix baseline changes only as Question 2 approved** — exactly the blank Show-to frames it names. Any other
  photograph that moves stops the run for the owner's sampled review (`docs/render-matrix.md`, R-116).
- **Canvas and theme stay in agreement** (§7.3, `agreement.test.ts`); a sink change keeps AD-36's pair — the vector
  inert and the legitimate case still working.
- Counts are derived (standing rule 4). Every rename ends with a grep for the old name (standing rule 7).

**Ask First:**

- **A closure bigger than its triage says** stops, and the entry is re-homed to one named later story whose card gains
  the sentence with its DW id.
- **Any write to T1 or T3 not on Question 1's approved list**, any theme not named there included.
- **Any render-matrix photograph that moves** beyond Question 2's frames — including after a re-recording (A24 #1
  renders the recorded article).
- **Any design file** (AD-35): Question 3 kept `darkCapabilities`, so this story edits none.

**Never:**

- No edit to the design export (R-74). No migration, so no Schema phase (R-99). No new dependency. No BMAD update (R-91).
- No render-matrix `--update` outside the pinned image, and no baseline the owner has not approved.
- Never `--help` on a `record-*.py`: it runs a real theme upload.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A line break in an attribute | a richtext value `a\n\nb` into `alt`, `title` or `href`; a `data-i18n-*` string with `\n` | `a b` on both emitters; no `<br>` inside any attribute | — |
| A designer's note | `<!-- note -->` at the top, inside, and inside a repeat | gone from both emitters; the runtime's own markers untouched | — |
| A re-stamp of a root mount | a countdown on the section root, then a control change | its `data-i18n-*` strings stay | — |
| Too old a Ghost | a22/1 claiming `minVersion` 5.61.0 | `check-snapshots` fails: `@site.allow_self_signup arrived in Ghost 5.62.0` | the check's message |
| A record for a retired design | `parkedControls` under an id the library no longer holds | kept through parse, swap and return; never drawn | a swap *to* that id is refused, as today |
| A plain link on a coloured ground | `<a>` with no class, or `class=""`, on contrast, accent or image, under `--link-decoration: none` | underlined, in the ground's words | — |
| A comma at a filter's top level | `featured:true,tag:news` | refused `bad-get-filter`; `tag:[news,notes]` still validates | the validator's sentence |
| An unbundled preview seed | `previewSeed: "nope"` | refused | the validator's sentence |
| A members field outside its form | `data-members-email` or `data-members-error` with no `data-members-form` ancestor | refused | the validator's sentence |
| Member visibility as a control | name `member-visibility`, or label "Member visibility" | refused (R-124) | the validator's sentence |
| Two caps on one list | two `data-items` over one path, caps 3 and 5, or 3 and none | refused; equal caps pass | the validator's sentence |
| The two bare helpers | `data-helper="total_paid_members"`, `"content_api_url"` | render on both emitters; the theme prints `{{…}}` | — |
| Code injection as a binding | `@site.codeinjection_head`, `_foot` | never offered | — |
| `.toString` in a core package | `d.toString()` · `n.toString(16)` · a disable comment and `.localeCompare()` | refused · clean · still refused | lint |
| A recorder whose restore fails | the re-activation raises | the probe theme is still deleted and read back; the first error is re-raised | exit 1, no traceback |
| A recorder started on a probe theme | the active theme is `inflozo-probe-*` | refuses to start | exit non-zero |
| The matrix's Show-to arms (Question 2, option 1) | a pilot whose category files Member visibility | Show-to arms photographed; a pilot whose category does not file it has none | — |
| A stress archetype at its own target | header, footer, pricing, content | renders clean; a feed at `post.hbs` still throws | — |

</frozen-after-approval>

## The triage

Derived at this Create from the ledger at `e350c124`: exactly the card's list, and no open entry added since 5.24a
names Story 5.24c. Each entry was read in full, and its plan (Story 5.24a's § The four stories after this one) was
checked against the code at HEAD by four read-only passes that executed a vector for each claim.

| Entry | Closed by | Its evidence lands at |
|---|---|---|
| DW-4 | `.toString()` refused only with no argument; inline disables refused in the core block | Dev |
| DW-96 | its claim (user text) already false since Story 5.3; the defect found under it — line breaks in an attribute — fixed | Dev |
| DW-99 | both helpers reachable, with matrix rows | Dev, then the record-contexts run |
| DW-103 | the defaults read through the recorder's own posts and tags | the record-cards run |
| DW-104 | a top-level `,` and an unbundled seed refused | Dev |
| DW-113 | a declaration beside the icon JSON | Dev |
| DW-125 | the archetypes print on a real Ghost and render at their own target | Dev |
| DW-127 | the seeded fields and the private page recorded; the rest cited in Ghost's source | the record-contexts run |
| DW-129 | the code-injection keys never offered | Dev |
| DW-147, DW-237 | one restore-and-delete for every probe theme, and the leftovers deleted | Dev, then the test sites |
| DW-159 | a design's comments dropped before any token | Dev |
| DW-161 | a members field outside its form refused | Dev |
| DW-168 | a design's `minVersion` held to the fields it reads | Dev |
| DW-171 | the matrix's Show-to arms from the editor's own rule | Dev, with Question 2's baselines |
| DW-186 | Member visibility refused as a control | Dev |
| DW-196 | moved to Story 6.1 on the owner's ruling (Question 3, option 2): kept, and given its job there | this Create |
| DW-213 | two different caps on one list refused | Dev |
| DW-224 | the underline forced on a coloured ground, and `class=""` covered; **the post-body half moves to Story 6.1** | Dev; Story 6.1 |
| DW-228 | `stampControls` keeps `data-i18n-*` | Dev |
| DW-288 | the rule written, and a test | Dev |
| DW-296 *(new)* | the stress stack's placements — owned by Story 7.35, whose card names it | this Create |
| DW-297 *(new)* | a free ask hidden on Ghost before 5.62 — owned by Story 7.18, whose card names it | this Create |

## Code Map

All anchors are at `e350c124`.

**The section runtime** (`packages/section-runtime/src/`)

- `core.ts`:
  - the `childNodes` item type `:103`; `RenderInput` `:125` (`target` `:168-172`);
  - `bindingRefusals` `:713`, its `place` call `:717`; `checkBindings` `:733`;
  - `content`/`comments` written as markup `:960-965`; the href sink `:1262`; a prop into an attribute `:1281`;
  - `stampControls` `:1305`, its removal `:1312`, the comment on it `:1693`; an authored `data-i18n-*` refused `:1434`;
  - `stampStrings` `:1511` (the stamp `:1524`); the first `tokens.put`, in `gateMembers`, `:1691`;
  - `renderTree` `:1612`: R-7's refusals `:1648-1649`, `root.innerHTML = src` `:1639`, the scope throw `:1660-1665`;
  - `tidy` `:1824` (whitespace-only lines out of the whole string), used by `renderTheme` `:1841` and `renderCanvas` `:1853`.
- `marks.ts:266-268` — `plain` writes `\n` as `<br>` for every sink, attributes included (since Story 5.3).
- `tokens.ts` — `LINK_RULES` `:184-188` with its comment `:168-183`, emitted by `referenceTokensCss()`.
  `packages/section-runtime/reference-tokens.css` has no generator script; `tools/stress/test-vocabulary.mjs:191-195`
  holds it equal. The reference `--link-decoration` is `underline #D96C3F` light, `underline` dark.
- `tokens.test.ts:85-86` — the R-173 test finds its rule by `startsWith(':where(a:not([class]))')`.
- `doc-schema.ts` — `memberVisibility` `:49`; `parkedControls` and its comment `:58-68`.
- `doc-edit.ts:96` `switchDesign` → `controls.ts:589` `switchControls`, whose copy loop `:599-601` carries every record.
- `controls.ts:345-353` `itemsShown` (the first match); `:869-875` the Data fold (`featured:true`, `tag:'…'`, `authors:'…'`).
- Tests: `agreement.test.ts` (the S5 root-mount case `:1171-1187`; a helper case `:558`); `doc-edit.test.ts` (`parseDoc`
  `:9`, `RING` `:226-258`).

**The library** (`packages/library/`)

- `src/vocabulary.ts` — `FOREIGN_ATTR_RE` `:222`; `ASK_FLAGS` `:319-322`; `BARE_HELPERS` `:400-403`; `DEFAULT_LIMIT` `:433`.
- `src/validate.ts`:
  - `VOID_TAGS` `:74`, `TOKEN_RE` `:75`, `memberAsks` `:77-118` — an ancestor walk, since Story 5.20;
  - `orphan-items-limit` `:169-172`; `bad-get-filter` `:442-444`; `preview-seed-missing` `:720-722`;
  - `validateDesignJson` `:488` — the `quickControls` withdrawal `:494-496` is the precedent for a withdrawn key;
  - the controlSchema loop `:587-592`.
- `src/orbit-weekly.ts` — `ORBIT_WEEKLY_SEED` `:32`; `DEFAULT_ORDER` `:435-440`; `splitTop` `:476-495`; the top-level `,`
  refusal `:506-509`; `resolvePreviewSeed` `:574-579`, with no caller outside tests (the editor previews Orbit Weekly
  regardless: `section-preview.tsx:138-140`).
- `src/contexts.ts` — `data-helper` on a list refused `:171`; `bindable` refuses given a version `:199-201`; "guarded,
  not refused" `:242-243`.
- `src/registry.ts` — `darkOverride` on a control `:31-32`; `darkCapabilities` declared `:155`, `:203`, copied `:255`,
  read by nothing.
- `src/icons.ts:16` imports the 2.48 MB `icons/tabler.json` (`:28` casts through `unknown`); TypeScript 7.0.2 under
  `nodenext`; typechecked by library, section-runtime's tests and apps/web (`lib/pilots.ts:13`,
  `components/controls/icon-picker.tsx:26`).
- `contexts/matrix.json` — `universal` (code injection `:75-80`; the helper rows beside `total_members` and
  `content_api_key`); `@site.allow_self_signup` since 5.62.0 `:123-126`; `neverOffer` `:207`; `tier.benefits` a plain list
  `:554-557`; a bare `url` inside `@site.navigation` is Ghost's helper `:581-588`. Its `unverified` rows: 21 empty
  fields, 2 private, 5 errorDetails.
- `contexts/labels.json:17-18`; `contexts/fixtures/ghost{5,6}.json` and `ghost-source.json` (captured 2026-09-14).
- Tests:
  - `src/contexts.test.ts`: recorded or reasoned `:76-116` (a reason required `:108-110`); offered or never-offered
    `:193-205`; a helper row per bare helper `:221-227`; every `universal` row printed `:339-354` (`content_api_key`
    exempted `:344`); R-122's labels `:388-405`;
  - `src/validate.test.ts`: the refusal table `:648-693`; `:475`; `:1013` (`<p data-members-error>` expecting
    `['bad-value']`); `:1056`;
  - `src/orbit-weekly.test.ts`: the defaults test `:134-146` (the `rows.length > 1` guard `:139`, order `:141`, limit
    `:142-143`); a comment `:169-171`.
- `designs/a22/1/index.html:11` reads `@site.allow_self_signup` (`minVersion` 5.62.0). `fixtures/paywall/1` and `/2` read
  it claiming 5.0.0. `fixtures/controls/1` declares a `darkOverride` control and says `["tokens"]`.
- `control-groups.json` files "Member visibility" for ten categories.
- `packages/ghost-shim/src/index.ts` — `taxonomyItems` `:453`; `bareHelper` answers both helpers `:747-757`, and
  `contract.test.ts:446-453`, `:494-501` assert both against `fixtures/ghost{5,6}/index.json`.

**Lint and types**

- `eslint.config.js` — `hostReadingCalls` `:88` (holds `'toString'`); the core block `:110-154`; the selector `:148-151`.
  ESLint 10.9.1 takes `linterOptions.noInlineConfig` in a files block. The core has no `.toString(` and no directive.
- `tools/check-baseline.mjs` — the only ESLint harness (`:40`, `:207`), run from the root; its catalogue blurb
  `tools/doc-audit.py:1002`.
- `tsconfig.base.json` — reaches all four packages and apps/web; `resolveJsonModule` stays (TS2732 without it).

**The stress harness** (`tools/stress/`, Node 24; its `node_modules` belongs to root — never `npm install`)

- `sections.js` — the header's navigation `:37-43` (the repeat `:39`); pricing's tiers `:117`; content's related posts
  `:191`; the footer's navigation `:208-214` (`:210`); comments `:23`, `:109`, `:200`; `stressStack` `:234`.
- `compile.js:29-30` — `renderSection(src, content, users, target)`; it takes no `dataBindings`.
- `build.js` — `TEMPLATES` `:72-75`; the stack renders with no target `:86-89`; `custom-stress.hbs` is a routes.yaml
  static route (`:179`, `:255`); it writes `theme/` and `theme.zip`, both gitignored.
- `test-vocabulary.mjs` — in `pnpm test`; renders only the controls samples at a target (`:150-162`).
- `README.md:12`, `:27` state counts. `MEASUREMENTS.md` §14 is the dated AD-11 measurement.

**The render matrix**

- `tools/matrix/cases.mjs` — imports `apps/web/lib/pilots.ts` (`:31`); `fixtureRows` `:60-73` (`/\bdata-members=/` `:63`);
  comments `:9`, `:20-22`. `cases.test.mjs:33-37` pins a1/1's rows to a22/1's and a4/13's to `['']`.
- `matrix.spec.mjs:99-106` fails an orphan, `:142` expects a hidden arm to render nothing; `playwright.config.mjs:19`
  (`updateSnapshots: 'none'`); `run-matrix-gate.sh:34-37` refuses `--update` under CI, `:52-54` (`--update` retakes
  every photograph of the selected designs).
- `.github/workflows/matrix.yml` — the `scope` step's shared-input regex lacks `packages/library/control-groups.json`.
  `docs/render-matrix.md:38`, `:103-106`; the rebaseline rule `:112-122`.
- `apps/web/lib/pilots.ts:73-77` `carriesMemberVisibility` (tested `apps/web/pilots.test.ts:152-157`) is the editor's
  rule: `(editor)/read.ts:337`, `editor.tsx:4388-4390`, `:5091`; `harness/editor/layout.tsx:191`.
- `(authed)/pilots/review.tsx` is `'use client'` (`:1`), with `DRAWS_SHOW_TO` at `:63` (used `:102`, `:129`);
  `pilots.ts` reads `node:fs` (`:8`), so only `pilots/page.tsx` (it imports `@/lib/pilots`, `:4`) can call the rule;
  `next.config.ts:39`, `:76` already trace `control-groups.json`.
- At HEAD, `carriesMemberVisibility` is true for a4/13 and a22/1 only, and `data-members` marks a1/1 and a22/1, so the
  matrix photographs Show-to for a1/1 (which the editor never draws) and not for a4/13 (which it does).
- The frames that move: `packages/library/baselines/a1/1/reference-{light,dark}-{1440,834,390,1440-zoom-200,1440-reduced-motion}-show-to-{anonymous,free,paid}.png`
  go, and the same names arrive under `a4/13/` — blank 1440×240 frames, identical to a22/1's.
- `tools/probe/run-verify-pilots.cjs` steps 10 and 13 read a22/1's and a4/13's Show-to on `/pilots`.

**The recorders** (`tools/probe/`)

- `record-shim.py` — `load_env` `:88`, `jwt` `:97`, `Ghost` `:107` (`api` returns `{}` on a 204); it uploads
  `inflozo-probe-shim` (`:147`); its cleanup `:585-596` skips the DELETE when the re-activation raises; `__main__`
  `:701-702` calls `load_env()` first. Imported by `record-contexts.py:48-51`, `run-verify-core.py:42-50`,
  `record-cards.py:59-62` and `record-page-number.py:55-58` (`ctx.shim`).
- Every other uploader and its cleanup:

  | Script | Theme | Cleanup |
  |---|---|---|
  | `run-verify-core.py` | `inflozo-probe-core` (`:39`, `:282`) | `:295-307`, the same skip; main catches `Void` only (`:333`) |
  | `record-contexts.py` | `inflozo-probe-contexts` (`:46`, `:326`) | `:342-347` restores, never deletes; main `:483` |
  | `record-page-number.py` | `inflozo-probe-root`, `-plain` (`:226`, labels `:374`) | `:260-265` restores, never deletes, keeps only the last name; main `:378` |
  | `run-verify-13.py` | `inflozo-probe-13` (`:23`, `:103`) | restores on success only (`:120-122`), never deletes |
  | `run-verify-all.py` | `inflozo-probe-all` (`:161`) | restores on success only (`:214-216`), never deletes |
  | `run-verify-47.py` | `inflozo-probe-47` (`:149`) | `:193-201`, the DW-147 shape, no read-back |
  | `run-verify-e2.py`, `run-verify-comment-count.py` | `inflozo-probe-e2` (`:213`), `-cc` (`:88`) | a failed delete swallowed (`:272`, `:132`) |
  | `run-verify-ghostpro.py` | Ghost(Pro) only (`:95`, `:122`) | never T1 or T3 |

- **Ghost, read in the npm tarballs** (`core/server/services/themes/storage.js`, 5.130.6 · 6.58.0):
  - a theme is named after its zip, and a re-upload overwrites it: `:49`, `:70`, `:122-123` · `:57`, `:100`, `:160-161`;
  - DELETE of the active theme: 422 "Deleting the active theme is not allowed." (`:136-140` · `:174-178`);
  - DELETE of a missing theme: 404 "Theme does not exist." (`:142-148` · `:180-186`);
  - `casper` and `source`: 422 (`:130-134`); success: 204 (`api/endpoints/themes.js` `:159-160` · `:164-165`).
- `record-cards.py` — `api_defaults` `:271-282`, called after the `finally` has drafted the fixture documents
  (`:316-328`); its `--self-check` is in `pnpm test`. `packages/library/orbit-weekly/fixtures/ghost{5,6}/capture.json`
  `content_api_defaults` holds the sites' own rows: posts 15 (the first a probe leftover, `run-verify-all.py:150`),
  tags 6, authors 3, tiers 3.
- **Ghost's Content API defaults** (`api/endpoints/utils/serializers/input/`, both tarballs):
  - posts `published_at desc` (5, `posts.js:100`), `published_at desc, id desc` (6, `:96`); tags and authors `name asc`;
  - a `slug:[…]` filter with no order is reordered to the filter's own order (`utils/slug-filter-order.js`), while
    `id:[…]` keeps the default (MEASUREMENTS §29d, §51); the limit is 15 whatever the filter;
  - posts are published only; a tag or an author appears only while it has a published post (`models/tag-public.js:4-8`,
    `author.js:4-8`).
- `record-contexts.py` — `Probe.universal()` `:113-130` (skips `content_api_key`, `:117-118`); `Probe.files` `:148-181`
  (no `private.hbs`); `choose()` `:236-261` (needs one author with no picture, `:246-247`); `api_rows` `:264-290`;
  `record()` `:318-347`; docstring `:30-31`. `record-page-number.py:40-41` docstring.
- **Private mode** (both tarballs): the settings `is_private` and `password` (`default-settings.json` `:238`, `:245` ·
  `:305`, `:312`); while on, every page redirects to `/private/` (`middleware.js:118-121`); a wrong password renders
  the error — "Incorrect password." on 5 (`:15`), "Incorrect access code." on 6 (`:14`) — brute-limited.
- `seed-ghost.py:74-76` — the three `static.ghost.org` images the seed already uses (Ghost has no image-delete API).
- `contract.test.ts:377-381` pins `custom_excerpt === null` on `a-brief-history-of-the-sidebar`, the post record-contexts
  renders.
- `RESET-PROTOCOL.md` § Ghost `:79-93` (live; `tools/doc-audit.py:257`); catalogue rows `doc-audit.py:263`, `:279`,
  `:289`, `:344`, `:358`.

## Tasks & Acceptance

**Execution — Dev, the section runtime:**

- [ ] `marks.ts:268`, `core.ts:1281`, `core.ts:1824` — **DW-96:**
  - `core.ts:1281`: `String(v)` becomes `String(v).replace(/\s*[\r\n]+\s*/g, ' ')` — the rule a text paste already
    follows (`apps/web/lib/inline.ts:225`), so both emitters read one value.
  - `marks.ts:268`: only the text sink writes `<br>`; the attribute sink escapes and stops. That also protects the
    href sink (`:1262`) and the `data-i18n-*` sink (`:1524`).
  - A `ponytail:` comment at `tidy` names the ceiling: the canvas tidies after values are in the DOM, so a blank line
    inside a Ghost value or a fixture's `<pre>` is dropped on the canvas only — invisible unless a stylesheet sets
    `white-space: pre*`, and no fixture's `<pre>` holds one; the upgrade is to tidy whitespace-only text nodes alone.
  - **Control** (`agreement.test.ts`): `alt` and `title` equal `a b` on both emitters, and no theme attribute holds a
    `<br>`. HEAD gives `alt="a\nb"` on the canvas and `alt="a<br><br>b"` in the theme.
- [ ] `core.ts:103`, `:1639` and `docs/section-authoring.md` — **DW-159:**
  - Right after `root.innerHTML = src`, before the first `tokens.put`, every comment node (`nodeType === 8`) under the
    root is removed; `remove(): void` joins the `childNodes` item type. Not a regex over `src`: that would corrupt an
    attribute holding `<!--`.
  - The authoring doc gains one sentence: a comment in a design's markup is dropped by both emitters.
  - **Control:** an agreement vector with a comment at the top, inside, and inside a repeat — neither output holds
    `<!--`, and the theme still resolves `{{#foreach posts}}…{{#if url}}`. At HEAD every comment ships. Six fixtures lose
    a leading authoring comment from their renders; no test reads it.
- [ ] `core.ts:1312`, `:1693` — **DW-228:**
  - `stampControls` keeps a root `data-i18n-*` (`&& !name.startsWith('data-i18n-')`). Safe: `FOREIGN_ATTR_RE` refuses a
    control named `i18n-*`, and `:1434` refuses an authored `data-i18n-*`, so the only such attribute on a root is the
    runtime's own stamp. The comment at `:1693` follows.
  - **Control:** the root-mount case at `agreement.test.ts:1171-1187`, re-stamped through `stampControls`, keeps
    `data-i18n-ended` as `'Vorbei'`. HEAD gives `null`.
- [ ] `core.ts:713`, `:717`, `:733`; `library/src/contexts.ts:242-243`; `tools/check-snapshots.mjs:136`, `:169` — **DW-168:**
  - `bindingRefusals` and `checkBindings`' input take `version?: string`, passed to `place` at `:717`. **Not
    `RenderInput`**: a render is guarded, never refused, on a version; the comment at `contexts.ts:242-243` says so and
    names `checkBindings` as the version gate.
  - `check-snapshots.mjs:136` passes `version: entry.ghostCompat.minVersion`; every design still passes.
  - A `mustFail` row (the mechanism at `:169`, shaped like `:203-208`): a22/1 at its first `compileTarget`, claiming
    5.61.0, must fail with `/@site\.allow_self_signup arrived in Ghost 5\.62\.0/`. At HEAD: "was not caught — got []".
  - `fixtures/paywall/1` and `/2` read `@site.allow_self_signup` claiming 5.0.0: both `minVersion`s become 5.62.0.
- [ ] `doc-schema.ts:58-67`, `doc-edit.test.ts` — **DW-288:**
  - One sentence in the comment: a record under a design id the library no longer holds is kept, never drawn and never
    pruned — `switchControls` carries it, and a swap to that id is refused.
  - **Test:** a record under `a17/9` survives `parseDoc`, a swap and a return. It pins intended behaviour, so it is green
    at HEAD; its control is dropping unknown records in `switchControls`' copy loop, which turns it red.
- [ ] `tokens.ts:168-188`, `reference-tokens.css`, `tokens.test.ts:85-86` — **DW-224, its built half:**
  - Every `LINK_RULES` selector becomes `:where(a:not([class]), a[class=""])`, and rule 2 (a contrast, accent or image
    ground) adds `text-decoration-line: underline` — there the link takes the ground's words, so the underline is its
    only sign (WCAG 1.4.1). The comment says so.
  - `reference-tokens.css` is regenerated from `referenceTokensCss()` (Verification's one-liner).
  - `tokens.test.ts`: the finder matches the new selector; two assertions — rule 2 underlines, and `class=""` matches.
  - No pixel moves: the reference packs underline already, every pilot renders on `data-bg="base"`, and A1-1's
    navigation anchors carry their own rule.
  - **The post-body reach is Story 6.1's**: DW-224's owner line becomes Story 6.1 alone and the entry stays open, with
    a `resolution:` naming this half.

**Execution — Dev, the library:**

- [ ] `src/vocabulary.ts:400-403`, `contexts/matrix.json`, `contexts/labels.json`, `ghost-shim/src/index.ts:453`,
  `docs/section-authoring.md:930`, `:1058-1059`, `:1185` — **DW-99:**
  - `total_paid_members` and `content_api_url` join `BARE_HELPERS`, with two `{"kind":"helper"}` rows in `universal` and
    two labels ("Paid member count", "Content API URL").
  - Beside `taxonomyItems`: unreachable on purpose — a tag or author list is `data-repeat="tags"` or `"authors"`, and
    `{{tags}}`'s joined markup has no directive.
  - **Controls:** an agreement case per helper (HEAD throws "must be one of"); in `contexts.test.ts`,
    `bindable('total_paid_members', { target: 'index.hbs', scope: [], use: 'helper' }) === null` (HEAD refuses).
  - **The rows land before the record-contexts run**, which prints both; `contexts.test.ts:339-354` is red until it
    lands, so both land in the one Dev commit.
- [ ] `contexts/matrix.json:75-80`, `:207`, `contexts/labels.json:17-18`,
  `prds/prd-Inflozo-2026-08-17/appendix-b1-template-contexts.md` §6 — **DW-129:**
  - Both code-injection keys move to `neverOffer` with their reason; appendix-b1 §6 gains a "Raw code — never offer"
    line naming them; their two labels go.
  - **Control:** `bindable('@site.codeinjection_head', at('default.hbs'))` matches `/never offered/`. HEAD offers it.
- [ ] `src/vocabulary.ts`, `src/orbit-weekly.ts`, `src/validate.ts:442-444`, `:720-722`, `orbit-weekly.test.ts:169-171` — **DW-104:**
  - `splitTop` and the seed value move to `vocabulary.ts`, and `orbit-weekly.ts` imports them as it imports
    `DEFAULT_LIMIT`. One constant, not a list: a list waits for a second dataset.
  - `validateDataBinding` refuses a filter with more than one top-level part (`bad-get-filter`); `validateDesignJson`
    refuses any other `previewSeed` (a new code).
  - **Controls** (the refusal table, `validate.test.ts:648-693`): `featured:true,tag:news` and `previewSeed: "nope"`
    refused, `tag:[news,notes]` clean beside them. HEAD passes both.
- [ ] `src/validate.ts:74-118` — **DW-161:**
  - `memberAsks`' ancestor walk becomes one generator, used by `memberAsks` and by a new check: `data-members-email` or
    `data-members-error` with no open `data-members-form` ancestor is refused (a new code).
  - `validate.test.ts:1013`'s markup is wrapped in a form.
  - **Control:** both fields after a closed form refused, both inside one clean. HEAD gives `[]`.
- [ ] `src/validate.ts:587-592` — **DW-186:**
  - A control named `member-visibility`, or labelled "Member visibility" (trimmed, case-folded), is refused as
    `member-visibility-control`: "… is Member visibility, which is not a control (R-124): who a section is shown to is
    stored on the placed section and gates its root on both emitters; declared here it would write a second
    data-member-visibility nothing reads."
  - **Control:** one row per form. HEAD gives `[]` for both.
- [ ] `src/validate.ts:169-172` — **DW-213:**
  - Two `data-items` over one path with different caps are refused beside `orphan-items-limit`; a missing cap counts as
    a cap, and equal caps pass.
  - **Control:** 3 against 5, and 3 against none, refused; 3 against 3 clean. HEAD gives `[]`.
- [ ] `packages/library/icons/tabler.d.json.ts` *(new)*, `tsconfig.base.json` — **DW-113:**
  - The declaration exports names: `export declare const version: string`, `license: string`, `icons: unknown` (an
    `export default` fails under `nodenext`); `"allowArbitraryExtensions": true` joins the base config.
  - **Control:** Verification's `--listFilesOnly` row, with and without the declaration.

**Execution — Dev, lint:**

- [ ] `eslint.config.js:88`, `:110-154`, `:148-151`, `tools/check-baseline.mjs`, `tools/doc-audit.py:1002` — **DW-4:**
  - `'toString'` leaves `hostReadingCalls`. One selector refuses only a zero-argument call:
    `CallExpression[arguments.length=0] > MemberExpression.callee[property.name='toString']`.
  - The core block gains `linterOptions: { noInlineConfig: true }`.
  - **Control:** three rows in `check-baseline.mjs` — a Date's `.toString()` refused; `n.toString(16)` clean; a disable
    comment plus `.localeCompare()` still refused. HEAD refuses the second and is silent on the third. The catalogue
    blurb gains the clause.

**Execution — Dev, the stress harness:**

- [ ] `tools/stress/sections.js`, `compile.js:29-30`, `build.js:86-89`, `test-vocabulary.mjs`, `README.md` — **DW-125:**
  - The header's and footer's navigation use `data-helper="navigation"`.
  - Pricing's tiers become a declared query under the key `plans` —
    `{ source: 'tiers', filter: 'type:paid+visibility:public' }`, as `fixtures/paywall/2` declares — and its benefits
    sub-repeat goes (`tier.benefits` is a plain list).
  - Content's related list (`:191`, the same fault, not in the ledger) becomes a declared
    `{ source: 'posts', limit: 3, order: 'published_at desc' }`.
  - `sections.js` exports each kind's queries and its own target; `renderSection` takes `dataBindings`, and
    `build.js:89` passes them. `build.js` keeps a query-carrying kind off `error.hbs` (R-7).
  - `test-vocabulary.mjs` gains a check rendering every archetype at its own target with its queries, and its control:
    a feed at `post.hbs` still throws.
  - The comments at `:23`, `:109`, `:200` follow, and the README's counted lines are reworded to state no count.
    `MEASUREMENTS.md` §14 stays as it is: it is dated.
  - **Control:** the new check is red on HEAD (header, footer, pricing and content refused). gscan stays 0/0 on both
    majors.

**Execution — Dev, the render matrix (DW-171):**

- [ ] `tools/matrix/cases.mjs`, `cases.test.mjs:33-37`, `(authed)/pilots/page.tsx`, `review.tsx`, `.github/workflows/matrix.yml`,
  `docs/render-matrix.md:38`, `:103-106`, `tools/doc-audit.py:1060`:
  - Visitor rows still come from `data-members`; Show-to rows come from `carriesMemberVisibility`; the base row `''`
    stays for a design with no visitor rows.
  - `page.tsx` passes a `memberVisibility` map, as `read.ts` does, and `DRAWS_SHOW_TO` goes. `/pilots` draws what it
    draws today: the rule and the old list agree.
  - `packages/library/control-groups.json` joins `matrix.yml`'s shared inputs and `render-matrix.md`'s list.
  - **Control** (`cases.test.mjs`, rewritten): for every pilot,
    `rows(id).some((r) => r.visibility !== undefined) === carriesMemberVisibility(id)`. HEAD fails for a1/1 and a4/13.
- [ ] **The baselines** (Question 2, approved):
  - Run `MATRIX_DESIGNS="a1/1 a4/13" bash tools/matrix/run-matrix-gate.sh --update` in the pinned image.
  - `git status` must show exactly the frames Question 2 names — deleted under `a1/1/`, added under `a4/13/` — and
    nothing modified. Any modified file stops the run for the owner's sampled review (Ask First).
  - Then the gate without `--update` is green. The baselines go in the same push as the code: without them,
    `matrix.yml` goes red on the orphans and the missing frames.

**Execution — Dev, the recorders' cleanup (DW-147, DW-237):**

- [ ] `tools/probe/record-shim.py`:
  - **`restore_and_delete(g, previous, names)`:**
    1. try the activation;
    2. always read the active theme back;
    3. DELETE each name that is not `previous`, then read the list back;
    4. raise the first failure — the activation's error, then "did not come back", then "still installed". A DELETE's
       own error is printed and the read-back decides, so a 404 counts as gone.
  - **A start guard:** refuse to start while the active theme is `inflozo-probe-*` (an earlier run failed to restore;
    an upload would silently override it).
  - **`--self-check`**, handled before `load_env()`: a fake Ghost that answers as Ghost does — 422 on the active theme,
    404 on a missing one. Cases:
    - the happy path;
    - the activation raising: the DELETE is still sent and read back, and the activation's error is re-raised;
    - a failed DELETE: the error names the theme;
    - `previous` is never deleted; a missing name is not a failure.
  - `package.json:15` appends `python3 tools/probe/record-shim.py --self-check`.
  - **Control:** the self-check against today's `:585-596` shape fails at the activation-raising case.
- [ ] **Every T1/T3 uploader calls it in its `finally`:**
  - `record-shim.py`, `run-verify-core.py`, `record-contexts.py`, and `record-page-number.py`, which collects every name
    it uploaded;
  - `run-verify-13.py` and `run-verify-all.py`, which gain a `try`/`finally`;
  - `run-verify-47.py`, `run-verify-e2.py` and `run-verify-comment-count.py`.
  - The three mains that catch `Void` catch `RuntimeError` too (`record-contexts.py:483`, `record-page-number.py:378`,
    `run-verify-core.py:333`).
  - `run-verify-ghostpro.py` (Ghost(Pro) only) is untouched, and named as the one exception.
- [ ] `RESET-PROTOCOL.md` § Ghost gains the rule — every probe theme is deleted in the same cleanup and read back, and a
  run refuses to start on a probe theme. The docstrings (`record-contexts.py:30-31`, `record-page-number.py:40-41`) and
  catalogue rows (`doc-audit.py:263`, `:279`, `:289`, `:344`, `:358`) follow. Grep for "restores the previous theme".

**Execution — Dev, the recorders' recordings (Question 1's list, approved):**

- [ ] `tools/probe/record-cards.py:271-282`, `:316-328`, `orbit-weekly.test.ts:134-146` — **DW-103:**
  - Two recorder-owned posts, each carrying one of two recorder-owned tags, drafts between runs. During a run they are
    published with the three fixture documents — the same `docs` list — and drafted in the same `finally`. While their
    posts are drafts, the two tags are invisible to every Content API reader.
  - Fixed `published_at` values make the default order disagree with slug and creation order; the tag names make
    `name asc` disagree with creation order.
  - Posts and tags are read **inside the try**, with `filter=id:[…]` and no order or limit. Never `slug:[…]`: Ghost
    reorders a slug list into its own order.
  - Authors and tiers stay unfiltered: a recorder cannot own a staff user or a tier, and no probe writes either — this
    story's seeding (Question 1) is a one-off, done before this recording.
  - `capture.json` records each resource's filter. The test asserts that posts and tags carry it with exactly two rows,
    and keeps the order and limit assertions, citing Ghost's source lines.
  - **Control:** the test against today's `capture.json` fails (no filter; the site's own rows).
- [ ] `tools/probe/record-contexts.py`, `contexts/matrix.json`, `contexts.test.ts` — **DW-127:**
  - `choose()` adds a post that carries a `custom_excerpt` (eleven published posts on each site do). The post the other
    frames render is left alone, since `contract.test.ts:381` pins its excerpt at null.
  - **The private page** (Question 1's item 7, approved): `private.hbs` joins `Probe.files`; last in the run,
    `is_private` and a throwaway `password` are switched on, `/private/` is recorded and so is a wrong password's error,
    and both settings go back to what they were in a `finally` and are read back.
  - `errorDetails`' reason cites Ghost's source in both releases.
  - **The version half:** the Content API's resource fields are diffed between the 5.0.0 and 5.130.6 releases (npm
    tarballs). Each matrix field absent at 5.0.0 is bisected to the release that added it and gains `since`. The author
    social handles are the known case: a 5.117 migration, against P0·2's 5.118.0. If more than a handful need it, stop
    and re-home the rest (Ask First).
  - `contexts.test.ts` gains the reverse rule: an `unverified` row that both recordings now prove fails.
- [ ] **The test sites, as Question 1 approved, in this order:**
  1. Re-read the inventory (Verification § Executed at Create's GETs); report any difference, act on none.
  2. Delete the approved leftover themes through the helper's DELETE and read-back.
  3. Fill the approved fields through Admin API PUTs with the staff token, the images from `seed-ghost.py:74-76`.
  4. Run `python3 tools/probe/record-cards.py`, which creates the recorder's pair on its first run, then
     `python3 tools/probe/record-contexts.py`. Both run on both majors.
  5. `git diff`: `capture.json` changes in `content_api_defaults` (and its date); the contexts fixtures gain the seeded
     fields, both helpers and the private page; `unverified` drops where both majors print. Anything else that moves is
     explained, or stops the run (Ask First).
  6. The theme list after each run shows no `inflozo-probe-*`. Every write is recorded verbatim in `MEASUREMENTS.md`'s
     next free section, and each recorder updates its own section.

**Execution — the close:**

- [ ] **`deferred-work.md`.** Written at this Create: DW-296 and DW-297; DW-224's owner line naming Stories 5.24c and
  6.1; and DW-196 moved to Story 6.1 on the owner's ruling (Question 3), 6.1's card carrying it. At Dev every entry
  whose evidence exists closes; DW-224 stays open, owned by Story 6.1 alone.
- [ ] **The registers.** `MEASUREMENTS.md` gains the test-site writes and the version-half reading.
  `epic-4-context.md` gains a sub-bullet per requirement this story settles, and `epic-5-context.md` one for this
  story's Dev.
- [ ] **Standing rule 7.** Grep for `DRAWS_SHOW_TO`, `'toString'`, `data-repeat="navigation"`, `data-repeat="tiers"`,
  "restores the previous theme", and every DW id this story touched.
- [ ] **The gates.** `pnpm check` (Node 24), `node tools/stress/test-vocabulary.mjs`, the stress gscan,
  `bash tools/matrix/run-matrix-gate.sh`, and `python3 tools/doc-audit.py --check` twice: all green, and every new
  check seen red on its control first.

**Acceptance Criteria:**

- **The group.**
  - *Given* Group C re-derived at HEAD,
  - *when* this story is done,
  - *then* every entry is closed by a change whose control was seen red with the change reverted, or by its recording,
    and its `resolution:` names that evidence;
  - *and* DW-224 stays open for Story 6.1's half, DW-196 is Story 6.1's on the owner's ruling, DW-296 and DW-297 are
    owned by Stories 7.35 and 7.18, each owner's card naming its entry, and no entry was deleted or renumbered.
- **The test sites.**
  - *Given* Question 1's ruling,
  - *when* T1 and T3 are written,
  - *then* only the approved list changed, every setting switched is back and read back, and `MEASUREMENTS.md` records
    every write;
  - *and* after any recorder run, no `inflozo-probe-*` theme is installed on either site.
- **The matrix.**
  - *Given* Question 2's ruling,
  - *when* the matrix runs,
  - *then* its Show-to arms are exactly the editor's, the only baselines that changed are the ones Question 2 names,
    and the gate is green.
- **The frame.** None: no screen (this story's card). `/pilots` draws what it drew before.
- **The gates.**
  - *Given* `pnpm check`, `node tools/stress/test-vocabulary.mjs`, the stress theme's gscan, the matrix gate and
    `python3 tools/doc-audit.py --check`,
  - *then* all are green — gscan 0 errors and 0 warnings on both majors — and every new check was seen red on its
    control first.

## Spec Change Log

## Design Notes

**Why the questions came at Create.** Question 1 is the reset protocol's own step: the owner confirms against the list
the inventory shows, and taking it at Create saves Dev a stop in the middle of its phase. Question 2 deletes committed
photographs Claude did not take in this session, and R-116 gives a re-baseline to the owner. Question 3 would have
removed a field the PRD and the architecture both name; the owner kept it.

**Routine calls made here, each stated to the owner in one line.**

1. **DW-129 closes without a separate ruling.** The ledger held it for the owner. But the canvas can never show the two
   code-injection settings — Story 5.18's allowlist drops them — so offering them breaks FR-H5's canvas–site agreement,
   and the invariant decides it.
2. **DW-224's post-body half goes to Story 6.1**, whose card now asks the owner before the first theme ships the token
   block. R-173 covers a link typed into a section's text and is silent on `{{content}}`.
3. **DW-96's own claim was already false.** Since Story 5.3 user text writes a line break as `<br>` on both emitters.
   The defect found under it, line breaks inside an attribute, is fixed. The canvas-only residual is a `ponytail:`
   comment at `tidy`, which standing rule 3 accepts as a terminal.
4. **DW-125 also fixes content's related list**, the same fault, and keeps a query-carrying kind off `error.hbs`, so the
   fix adds nothing R-7 refuses. The stack's other placements (a feed on post, page and error; a static-route template
   no matrix row models) are DW-296, Story 7.35's.
5. **DW-168's version check lives on `checkBindings`, never on a render.** The two paywall fixtures' `minVersion` are
   corrected to 5.62.0.
6. **DW-99's `content_api_url` prints nothing on an unlinked canvas.** Orbit Weekly has no Content API, and a real key
   is never printed either. Linked, it prints the site's own address, as the shim already does.
7. **DW-103 owns posts and tags only.** Authors and tiers stay the site's.
8. **DW-237 covers every T1/T3 uploader**, the five older scripts included. `run-verify-ghostpro.py` is the named
   exception.
9. **DW-4's control lives in `tools/check-baseline.mjs`**, the one ESLint harness, since a core package cannot read
   `process`. **DW-113's control is a Verification row**, since a core package cannot spawn `tsc`.
10. **DW-297 is new:** a free ask is hidden on any Ghost before 5.62. Found while checking DW-168, it goes to Story
    7.18, whose Pre-flight already names member-switch problems.

**Where 5.24a's plan was wrong at HEAD.**
- DW-96 framed the fault as a lost blank line in user text; the live fault is a `<br>` inside an attribute.
- DW-168's version goes on `checkBindings`, not `RenderInput`.
- DW-171's rule already exists, as `carriesMemberVisibility`, but `review.tsx` cannot import it, and the matrix's
  shared inputs lacked `control-groups.json`.
- DW-186 must refuse by name and by title; only the camelCase name was refused.
- DW-196's `image-swap` is grounded nowhere: a closed list with no reader is the third state the ledger forbids.
- DW-213's "one cap per path" still let a capped and an uncapped list through.
- DW-127's private mode was not in Question 14's ruled words; the post excerpt needs no write.
- DW-237's leftovers are one per name, since Ghost overwrites a re-upload.
- DW-99's `taxonomyItems` is in `ghost-shim`, and cannot join `BARE_HELPERS`.
- The DW-4 and DW-113 controls had no home.

**A consequence to know.** The fields seeded on T1 and T3 appear in `record-shim.py`'s next recording, so the story
that next runs it re-reads any contract row that pins them empty.

## Questions for the owner

The owner ruled all three on 2026-09-29. No question is open.

### Question 1 — May I make these changes to your two test Ghost sites? (5.24's Question 14)

**In plain English.** You said yes to three kinds of change on `ghost6.inflozo.com` and `ghost5.inflozo.com`, once you
had seen the list. I read both sites today and changed nothing. This is the list. Item 7 is new: your ruling did not
mention it.

| # | Change | ghost6 | ghost5 |
|---|---|---|---|
| 1 | Delete old probe themes — never the one in use | `inflozo-probe-13`, `-all`, `-contexts`, `-root` | the same four, plus `inflozo-probe-plain` and `theme` (the old stress-test theme) |
| 2 | Tag "archive": add a description, a picture and a colour | yes | yes |
| 3 | Author "umang" (you, on the test sites): add a website, a location, a cover picture and the nine social handles; add a profile picture | yes, all | all but the profile picture — yours is already there |
| 4 | Paid tier "Default Product": add a description, benefits and a welcome page address | yes | yes |
| 5 | Newsletter "Default newsletter": add a description | yes | yes |
| 6 | Add two posts and two tags that only the recorder uses. They stay drafts, are published for about a minute during a recording, then go back to draft | yes | yes |
| 7 | **New:** make the site private for about a minute, record Ghost's password page, then switch it back. While it is private, anyone visiting is asked for a password | yes | yes |

Left as they are: `casper` (in use), `source`, and `racer` on ghost6, which is not ours. The author "priya-raman" keeps
no picture, because the recorder needs one author without one. No post excerpt is written: eleven posts on each site
already have one. The pictures come from Ghost's own image library, and every change is written into
`MEASUREMENTS.md`.

**An example.** The tag "archive" gets the description "Every past issue, newest first.", a picture from Ghost's image
library, and a colour, and keeps them for later tests.

1. **Yes to all seven (RECOMMENDED).** Reply "Go ahead with 5.24c's list".
2. **Yes to 1–6, not the private page (7).** Ghost's password page stays marked "read in Ghost's code" rather than seen
   on a site.

**Ruled: option 1 (owner, 2026-09-29).** *"Go ahead with 5.24c's list"* — all seven, the private page included. Dev
re-reads the inventory before the first write and acts on nothing the list does not name.

### Question 2 — May the photo check swap its blank "Show to" photos from one sample section to another? (DW-171, R-116)

**In plain English.** The render matrix — the automatic photo check of every section — takes photos of a section
hidden from each kind of visitor, but only for sections it thinks have a "Show to" setting. It decides that
differently from the editor. So today it photographs the Rail header, which has no "Show to" setting in the editor,
and not the Latest Post hero, which has one. This story makes the check use the editor's own rule.

That deletes the Rail header's 30 "Show to" photos and adds 30 for Latest Post. All 60 are empty frames, because a
hidden section draws nothing. No other photo changes.

**An example.** `a1/1/reference-light-1440-show-to-free.png` (Rail header, shown only to free members) goes, and
`a4/13/reference-light-1440-show-to-free.png` (Latest Post, the same) arrives. Both are blank.

1. **Yes, swap them (RECOMMENDED).** If any photo other than these 60 blank frames changes, I stop and show you a
   sample first, as your re-baseline rule says.
2. **No.** The check keeps its own rule, and DW-171 moves to Story 9.1, the Rail header's own story.

**Ruled: option 1 (owner, 2026-09-29).** *"Yes, swap them"*. Only the blank Show-to frames move; any other photograph
that changes stops the run for his sampled review.

### Question 3 — Delete a setting every section design fills in and nothing ever reads? (DW-196)

**In plain English.** Every section design carries a line saying how much dark-mode support it has. Nothing in
Inflozo reads it, it has no agreed words, and one sample already says something untrue. What really decides dark mode
is each setting's own "dark override", which the editor does read.

**An example.** All five sample sections say `"darkCapabilities": ["tokens"]`. A test sample with a dark-only setting
says exactly the same, and nothing notices.

1. **Delete it everywhere (RECOMMENDED).** It leaves the section format: the PRD, the architecture, the checker, the
   five sample sections' files and every Epic 9–10 story that lists it. Nothing on screen changes. It touches the
   sample sections' files, which your rule otherwise leaves to each category's own story; this is a change to the
   format, not to any design.
2. **Keep it, and give it a job later.** It moves to Story 6.1, the first Style Pack story, which decides what it means
   and what reads it. Until then, authors keep filling it in.

**Ruled: option 2 (owner, 2026-09-29).** *"Keep it, and give it a job later."* `darkCapabilities` stays in the format,
the designs and the PRD as it is; DW-196 is Story 6.1's, whose card now carries it with its id, and this story builds
nothing for it.

## Verification

**Commands** (Node 24: `export PATH=/home/ghost/.nvm/versions/node/v24.18.1/bin:$PATH`):

- The group, re-derived at HEAD from each entry's living owners (a dated `*(…)*` note never owns). Expected: § The
  triage's list less DW-196, which is Story 6.1's — at this Create's ruling it printed DW-4, 96, 99, 103, 104, 113, 125,
  127, 129, 147, 159, 161, 168, 171, 186, 213, 224, 228, 237 and 288.
  `python3 -c "import re, importlib.util as u; s=u.spec_from_file_location('b','tools/story-board.py'); b=u.module_from_spec(s); s.loader.exec_module(b); d=b.load_deferred(open('_bmad-output/implementation-artifacts/deferred-work.md').read()); print(sorted((x['id'] for x in d if not b.dw_closed(x) and '5.24c' in b.story_refs(re.sub(r'\*\(.*?\)\*', '', x.get('owner') or '', flags=re.S))), key=lambda i: int(i[3:])))"`
- `pnpm --filter @inflozo/section-runtime test` and `pnpm --filter @inflozo/library test` — expected: pass; each new
  vector seen red at HEAD first.
- `node tools/check-snapshots.mjs` — expected: pass, the new `mustFail` row included; at HEAD that row fails.
- `node tools/check-baseline.mjs` — expected: pass, with the three lint rows.
- `node tools/stress/test-vocabulary.mjs` — expected: pass, the target check included; red on HEAD's archetypes.
- `cd tools/stress && node build.js && node gate.js theme` — expected: 0 errors, 0 warnings on Ghost 5.x (gscan
  4.49.7) and 6.x (gscan 6.4.2). No network is needed.
- `node tools/matrix/cases.test.mjs` — expected: pass; the rule assertion red on HEAD for a1/1 and a4/13.
- `python3 tools/probe/record-shim.py --self-check` and `python3 tools/probe/record-cards.py --self-check` — expected:
  exit 0; the first red against today's cleanup shape.
- `npx tsc --noEmit -p packages/library --listFilesOnly | grep tabler` — expected: `tabler.d.json.ts` alone. HEAD lists
  `tabler.json`.
- `node -e "import('$PWD/packages/section-runtime/src/tokens.ts').then(m=>process.stdout.write(m.referenceTokensCss()))" > packages/section-runtime/reference-tokens.css`
  — then `git diff` shows only the link rules.
- `MATRIX_DESIGNS="a1/1 a4/13" bash tools/matrix/run-matrix-gate.sh --update`, then
  `git status --short packages/library/baselines` — expected: only Question 2's frames, deleted and added, none
  modified. Then `bash tools/matrix/run-matrix-gate.sh` — expected: exit 0.
- `python3 tools/probe/record-cards.py` and `python3 tools/probe/record-contexts.py` — expected: exit 0 on both majors,
  and no `inflozo-probe-*` theme left afterwards.
- At Review, on the deployed site: `node tools/probe/run-verify-pilots.cjs` — expected: steps 10 and 13 (a22/1's and
  a4/13's Show-to) pass.
- `pnpm check` — expected: exit 0. `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**Real services (R-82).**
- T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`: the read-only inventory at Create; at Dev, Question 1's writes,
  the theme deletions and the two recordings.
- The npm registry, read-only: Ghost's source in the tarballs, for the citations and the version half.
- The render matrix's pinned container (Docker) for the baselines and the gate.
- GitHub Actions: `ci.yml` and `matrix.yml` on the Dev push.
- `app.inflozo.com` at Review: `/pilots` through `run-verify-pilots.cjs`.

**Executed at Create (2026-09-29), read-only.** Nothing was written to the repository except this story's documents,
and nothing to any server.

- **Group C at `e350c124`:** the open entries owned by 5.24c are exactly the card's list.
- **T1 and T3, through the recorders' own client with the staff token, GETs only.** Ghost 6.58 and 5.130, unchanged.

  | | ghost6 (T1) | ghost5 (T3) |
  |---|---|---|
  | Themes | `casper` (active), `source`, `racer`, and the probes `-13`, `-all`, `-contexts`, `-root` | `casper` (active), `source`, `theme` (package `inflozo-stress`), and the probes `-13`, `-all`, `-contexts`, `-root`, `-plain` |
  | Tag `archive` (5 posts) | description, picture and colour empty | the same |
  | Author `umang` | the thirteen fields empty | a profile picture; the other twelve empty |
  | Author `priya-raman` | no picture | no picture |
  | Tiers | `free`, `default-product`, `ghost6-pro` (hidden): description, benefits and welcome page empty | the same, with `ghost5-pro` |
  | Newsletter `default-newsletter` | description empty | the same |
  | Posts | 33 published (11 with an excerpt), 3 drafts | 33 published (11 with an excerpt), 2 drafts |
  | Private mode | off | off |

- **The runtime pass**, a patched copy in the scratchpad: every control above failed at HEAD and passed patched; the
  package ran 279 of 280 (the one failure the R-173 test DW-224 amends); `check-snapshots` passed with no snapshot
  changed. A text value `a\n\nb` gives `<p>a<br><br>b</p>` on both emitters; in `alt`, `a\nb` on the canvas and
  `a<br><br>b` in the theme.
- **The library pass:** the validator, runtime and scope walk refuse both helpers today; `featured:true,tag:news`
  validates and the resolver throws; `previewSeed: "nope"` validates; both members fields outside a form validate;
  `member-visibility` and a "Member visibility" label validate; two caps 3 and 5 validate. No design, fixture or stress
  archetype trips any new rule. `tsc`: the library 1.70–1.88 s and ~745 MB at HEAD, 0.21–0.26 s and ~120 MB with the
  declaration; apps/web 2.47 s and 1.15 GB against 1.07 s and 556 MB. ESLint 10.9.1: `n.toString(16)` refused and a
  disable comment silencing `.localeCompare()` at HEAD.
- **The stress pass**, in a copy: header, footer, pricing and content are refused at every target at HEAD; the fixed
  archetypes render at their own targets and `test-vocabulary.mjs` passes against them. gscan 0/0 on both majors, as
  HEAD is and as fixed, with no network (checked inside `unshare -rn`).
- **The matrix pass:** at HEAD every case has its baseline and there are no orphans; the frames Question 2 names were
  derived from the files on disk.
- **The recorders pass:** Ghost's theme, Content API and private-mode behaviour, read in the 5.130.6 and 6.58.0
  tarballs at the lines in Code Map; a sketch of `restore_and_delete` passed its self-check, and today's cleanup shape
  failed it at the activation-raising case.
