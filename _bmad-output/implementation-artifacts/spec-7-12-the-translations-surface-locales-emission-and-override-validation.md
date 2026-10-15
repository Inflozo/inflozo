---
title: 'Story 7.12 — The Translations surface, locales/ emission, and override validation'
type: 'feature'
created: '2026-10-15'
status: 'in-review'
baseline_commit: 'c065752d40f93cfd5a85a82df47c54c870cf7f31'
owner_test: pending
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md']
---

## In plain English

After this story Theme settings gains a left-hand menu with a second page, **Translations**: a list of every phrase
your theme prints on your site — "More", "{minutes} min read", "Older posts" and the rest — with its English wording beside
a box where you type your own, in the language you choose at the top of the page (Español, Deutsch, Русский, any language
Ghost offers). What you type shows on your canvas straight away and ships in your theme's translation files, and a phrase
that would break your site — a stray brace, a placeholder like `{minutes}` left out, page code in a count phrase, or an
empty box — is refused with a sentence naming the problem in your own words, never "fixed" for you. Choosing Arabic,
Hebrew, Farsi or Urdu first shows the yellow "Right-to-left languages are not supported yet" notice with an **Understood**
button, and choosing a language your fonts cannot draw (Russian on a Latin-only font, Japanese on any of them) says so
under the menu at the moment you choose it. On a non-English project the page also lists the sections whose own starting
words you never retyped, each with an Edit link, and on a project linked to a Ghost site the menu links out to Ghost's
own Navigation, Social accounts and Code injection settings (your rulings of 15 October).

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every chrome string a theme prints reaches it through `{{t}}` (Story 7.6, V1), but no theme ships a
`locales/` file, so on a real Ghost site each label prints as its key — `nav.more` (MEASUREMENTS §44; 7.6's T1 row).
FR-Q6's Translations surface does not exist, `translation_overrides` has waited since Story 1.2 with no writer,
`projects.language` and `projects.rtl_ack_at` are never read or seeded, the canvas always renders English (`renderSection`
passes no `strings`), nothing validates an override the way the `intl-messageformat` 5.4.3 inside both Ghost majors
will parse it (DW-142), the one route that prints an override as markup is unguarded (DW-141), and the library holds no
font file for a language outside `latin` and `latin-ext` (Story 7.4's Question 2 moved that here).

**Approach:** One core list of languages (Ghost 6.58.0's own Publication Language list plus "Other…", each with its
script) and one server-only validator built on the exact `intl-messageformat` 5.4.3 Ghost bundles plus appendix-h1 S3's
placeholder rule, read by the Translations page's actions on entry AND by the compiler as a backstop that fails the
build. The compiler writes `locales/en.json` always, plus `locales/<language>.json` when the language is not `en`, both
from the one catalog in one pass. The page is B18 as EXPERIENCE re-specifies it, inside a new settings layout carrying
D6a's rail. The canvas renders the stored overrides through the `{{t}}` shim. A non-latin language ships each covering
family's whole face (§D.b), and one no family covers falls back to the system font, said at the selector. No migration:
every column, grant and check this story needs exists in `20260904120000_complete_schema.sql`, so there is no Schema
phase (R-99).

## Boundaries & Constraints

**Always:**
- **The frame** is `B Missing Surfaces.dc.html` **B18** (`:1768-1803`) as `EXPERIENCE.md:747` re-specifies it (dotted
  keys, the refused row, the RTL note kept), inside D6a's rail (`D6 Theme Settings Completed.dc.html:41-48`). B18 draws,
  in order: the title and its sentence (`:1773-1774`, verbatim), the language button (`:1776-1780`), the `180px 1fr 1fr`
  grid KEY · ENGLISH DEFAULT · the language's own name upper-cased (`:1782-1785`), mono keys on alternating rows, the
  focused input, the refused row (danger tint, `danger-panel-ink` key, `danger-text` border, the caption under the input),
  "Falls back to English" in italic muted for a row with no override, and the marigold RTL block (`:1794-1801`). Where B18
  draws nothing — the rail, loading, read-only, the scope sentence, the confirm, the coverage caption — it is extrapolated
  from the Kit (`TextInput`, `Select`, `Banner` `notice`, `HelperCaption`, `dialog.ts`, `Submit`, `ReadOnly`), never drawn twice.
- **The rail** (Question 2) is a new `settings/layout.tsx` above both pages' boundaries, its first item named
  **Theme settings** (R-170: the page's one name, where D6a's prose says "Site basics"), its second **Translations**.
- **Languages are Ghost's.** The list is Ghost 6.58.0's Publication Language list (`core/built/admin/assets/settings-KSWWQanQ.js`,
  the `fs` array of `{code,label}`, read in source 2026-10-15), held as data in ONE core module with that anchor, plus
  **Other…**, a free code checked with Ghost's own shape rule (the `ms` validator beside it). A code is stored and
  emitted **exactly**, case included: Ghost reads `locales/<its locale setting>.json` with no normalisation, so `pt-BR`
  needs `pt-BR.json` and `de-DE` never reads `de.json` (`i18n.js:187-199`, both majors). The name shown is the language's
  own (`Intl.DisplayNames` in app code, Ghost's English label when that returns the bare code).
- **Validation REFUSES; it never repairs** (FR-Q8). `overrideRefusal(key, value)` answers a sentence or nothing, and is
  the ONLY judge, called by the save action and by `compileTheme` over every value it writes to a locale file. It
  checks, in this order: a known, listed key (never `credit.*`, never retired); not blank after trimming (R-106); no C0
  character; at most 500 characters; for a plural string (`isPluralString`) no `<` or `&` (DW-141) and its `%` kept;
  every `{` and `}` belonging to a placeholder of the default's set (appendix-h1 S3); the placeholder set equal to the
  default's (V10); and `new IntlMessageFormat(value, 'en').format(sample)` equal to the shim's `t(value, sample)` for a
  sample naming every placeholder (V9 — this is what refuses `''` and `'{'`, which Ghost renders differently from the
  canvas or throws on). Each refusal names the offending character in the user's own string; the brace sentence says
  braces mark a placeholder (B18's caption, FR-Q8). The words live in ONE list beside the rule.
- **`intl-messageformat` 5.4.3, exact, never `@formatjs/icu-messageformat-parser`** (DW-142). It becomes a dependency of
  `@inflozo/library` reached ONLY through the server subpath `@inflozo/library/override`; `catalog.ts`, which the canvas
  imports, never imports it, so it never reaches a browser bundle. Constructed with `'en'` always and formatted with
  string samples only, so no host locale or number formatting enters its answer.
- **Locale files.** `locales/en.json` on every theme; `locales/<language>.json` beside it when the language is not `en`.
  Each holds every catalog key but `canvas`-marked ones, in catalog order, retired keys included (S4), `credit.*`
  verbatim (S7), as `JSON.stringify(object, null, 2) + '\n'` (the stress harness's shape, `tools/stress/build.js:258-261`).
  With language `en`, `en.json` carries the overrides; otherwise `en.json` carries the English defaults and the
  language's file carries the overrides over them — equal key sets by construction, asserted per file (V3), no
  `credit.*` override possible (V7, and `resolveStrings` throws on one). A language that fails `languageRefusal` fails
  the build: it names a file in the zip (AD-36).
- **RTL** (Appendix G): a language whose script is right-to-left (`isRtl`) is saved only with `rtl_ack_at` in the same
  write, by B18's **Understood**; until then the page shows the block and the select keeps the stored language. Leaving
  RTL clears `rtl_ack_at`, so a later RTL choice asks again. A project seeded RTL at link carries a null `rtl_ack_at` and
  the page shows the block until it is pressed. No layout is mirrored and no `dir` is emitted.
- **Fonts** (§D.b, moved word for word from Story 7.4): a language in `latin` ships `latin` + `latin-ext` exactly as
  today. Any other script (Vietnamese included — see Design Notes): each family of the pairing whose google/fonts
  `METADATA.pb` lists that script's subset — google/fonts' own declaration of coverage, read by the builder, never
  assumed — ships its **whole face**: one woff2 per face, instanced and clipped as today, no glyph subsetting and no
  `unicode-range`, in place of its two subset files. A family that does not cover it keeps its latin pair, and the
  script falls back to the system font stack. The selector says which, per family and role, at the moment of choice,
  the whole faces' size included from `pool.json`'s bytes. The canvas loads the same files.
- **The site's language** is read where Inflozo already reads Ghost's settings: `settingsPatch` keeps `locale`. A project
  first linked to a site (today only `useBrand`'s insert) takes `languageAtLink(locale)`. When the project's language is
  not `en` and the linked site's stored locale differs, the page says visitors will see the English wording and links
  Ghost's Publication Language. Changing the language with overrides stored asks first (focus on Cancel, R-134), naming
  both languages, and keeps the overrides.
- **The canvas** renders the stored overrides through the shim (FR-H5): `editorData` reads them and `renderSection`
  hands them as `strings`. An override that fails `overrideRefusal` (possible only by a direct table write, AD-6) is
  shown on its row as refused, kept out of the canvas, and fails the compile.
- **R-98**: every Save, Use the default, Understood and Switch says so (`Submit`'s required `busy`); the Translations
  route has its own `loading.tsx` drawing B18's header and rows. **R-192**: while another session holds the live lock
  the page is `ReadOnly` (`liveHolder`, `settingsReadOnly`). The page needs JavaScript (Story 3.9 Q5, 7.9 Q3); every
  control is still a plain form.
- **Plans:** ungated on Free and Pro (`prd.md:1261`). Review and the owner's test run on production (R-82).

**Ask First:**
- Questions 1 and 2 are ruled (option 1 on both, owner, 2026-10-15); a change to either is a new question, not a Dev decision.
- Any migration — none is planned (`translation_overrides` has no blank `CHECK`; the action refuses a blank, and
  `resolveStrings` and the compile refuse one stored by any other route).
- The whole faces adding more than 25 MB to the repository, or any existing pool file's bytes changing (that is a
  google/fonts `COMMIT` move and a mass rebaseline, never a side effect of this story).
- Every T1 write (theme uploads, the locale setting changed and put back) — the owner's in-session go, run in the main
  session, never by a subagent.
- Adding, removing or renaming a catalog key — Story 4.9's S2; not this story's.

**Never:**
- No search, filter or namespace grouping (B18 draws none). No right-to-left layout, `dir` or mirroring (Appendix G).
- No reach into Portal, native comments or the Sodo search overlay — Ghost's own i18n namespaces (each loads its own
  catalog from `@tryghost/i18n`, `ghost_head.js:137,167`, `helpers/comments.js:56`); the page says so in one sentence.
- No escaping, stripping or "fixing" of an override: refuse.
- No Pre-flight row (Story 7.18), no theme-size budget (Story 7.29), no zip (Story 7.26 zips the tree this emits).
- No overriding a `credit.*` key on any plan (the table's `credit_namespace_locked`, `resolveStrings`, the compile).
- No edit to the design export, no hand-edit of a generated file, no count written down.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Override saved | language `es`; `post.reading_time` = `{minutes} min de lectura` | upserted on `(project_id, catalog_key)`; the row shows it; the canvas's Three Up cards read "… min de lectura"; a compile writes it to `es.json` and the default to `en.json` | N/A |
| Braces | `nav.more` = `Más {{` · `post.reading_time` = `{{minutes}} min` | refused: "The “{” in “Más {{” would break every page that shows it — braces mark a placeholder, and this label has none." / "…like {minutes}." | nothing stored; the row takes B18's refused look |
| Placeholder dropped / foreign | `min de lectura` · `{mins} min` | "Keep {minutes}: your site fills it in." · "{mins} isn't one of this label's placeholders. It has {minutes}." | as above |
| Apostrophes | `It''s here` · `post.reading_time` = `'{minutes}' min` · `It's {minutes} min` | "Two apostrophes in a row show as one on your site. Type one." (5.4.3 prints `It's`, the shim `It''s`) · "The “'” beside “{” in “'{minutes}' min” prints on your site as typed today, and a Ghost update could make it hide {minutes}. Remove it." (5.4.3 prints it as typed, intl-messageformat 10.7.16 quotes it — Question 3, ruled option 1, owner, 2026-10-15) · accepted (a lone apostrophe away from a brace prints as typed on both) | as above; any other disagreement between 5.4.3 and the shim: "Your site would print this differently from the canvas. Check its apostrophes and braces." |
| Control character / too long | a value holding U+0007 · 501 characters | "This has a character your site can't show." · "Keep it to 500 characters." | as above |
| Plural markup | `archive.posts_many` = `% <b>posts</b>` · `% posts & more` · `posts` | "“<” can't be used in this label: your site prints it as page code." · the same for "&" · "Keep the %: your site puts the number there." | as above |
| Blank (R-106) | `"   "` | "Type the wording, or press Use the default." | nothing stored |
| Use the default | a row with an override | the row is deleted; the input empties to "Falls back to English" (or "Uses the default" on an `en` project); the canvas returns to the default | N/A |
| Locked / retired / unknown key | a posted `credit.built_with`, a retired key, `no.such` | not listed; a crafted post is refused "We couldn't save that just now." (the `23514` from `credit_namespace_locked` mapped to the same) | never a 500 |
| Language, Latin script | `en` → `de` with no overrides | saved; columns read DEUTSCH; no font caption; next compile writes `en.json` + `de.json` | N/A |
| Language switch with overrides | overrides stored, `es` → `de` | "Switch to Deutsch? The labels you translated were written in Español. They stay, and ship in the Deutsch file until you change them." Cancel (focused) · Switch | Cancel keeps `es` |
| Other… | `pt-BR` · `../x` · `english` | `pt-BR` saved as typed; the others refused "Enter a language code like pt-BR or sr-Cyrl." (Ghost's rule) | N/A |
| RTL | choose العربية (`ar`) | the marigold block with Understood; the select returns to the stored language; Understood saves `language='ar'` and `rtl_ack_at` together; the block stays, its button replaced by "You acknowledged this on <date>." | leaving RTL clears `rtl_ack_at` |
| Cyrillic, partly covered | `ru` on Paper (Inter lists `cyrillic`, Fraunces does not) | "Inter covers Cyrillic: your theme ships its whole faces — about <n> KB of fonts instead of <m> KB." and "Fraunces doesn't cover Cyrillic, so your site shows Русский headings in each reader's own system font."; the compile ships Inter's two whole faces and Fraunces' latin pair; the canvas loads the same | N/A |
| Not covered | `ja` on any pairing in today's pool | one "doesn't cover Japanese … 日本語 headings / text …" sentence per family; every family keeps its latin pair | N/A |
| Site locale differs | project `es`, linked site's stored `locale` = `en` | "Your Ghost site's language is en, so visitors see the English wording, not these. Change it to es in Ghost ↗" (`adminAt(url, 'publication-language')`) | no notice on an `en` project or with no stored locale |
| First link | `useBrand` inserts for a site whose `locale` is `de` · `zz zz` | the new project's `language` = `de` · `en` (refused code) | N/A |
| Stored invalid override | a row written straight to the table, `Más {` | its row shows the refusal; the canvas renders the default; `compileTheme` throws naming the key and the sentence | never ships |
| Language as a path (AD-36) | `language: '../package'` handed to the compiler | throws before any file is written; `pt-BR` writes `locales/pt-BR.json` | inert-and-legitimate pair in `ad36.test.ts` |
| Read-only (R-192) | a second window holds the lock | every input, Save, Use the default, the select and Understood greyed; values readable | N/A |
| Another user's project | an id the caller does not own | zero rows written (RLS); "We couldn't save that just now." | never a 500 |

</frozen-after-approval>

## Code Map

- `packages/library/strings/catalog.json` — 151 keys / 14 namespaces today (derive: `node tools/check-catalog.mjs`); entry `{en, marks, retired?, supersededBy?}`; marks `js · a11y · prop · locked · canvas`; no plural mark.
- `packages/library/src/catalog.ts` — `placeholdersOf` :59, `englishStrings` :78, `isPluralString` :86 (a `%` outside placeholders: `archive.posts_one/many`, and `member.read_so_far` — js-marked, harmless), `catalogFailures` :90, `resolveStrings` :215 (throws on unknown, `credit.*`, non-string, blank; carries migrations; its :214 comment hands V9/V10 to this story). Browser-safe: imported by the canvas.
- `packages/ghost-shim/src/index.ts:432` — `t(key, params, catalog)`: regex formatter, no ICU; the agreement half of V9 compares against it. `contract.test.ts:722-782` the TR group, `:760-764` `{{plural}}` unescaped.
- `packages/section-runtime/src/core.ts` — `RenderInput.strings` :208; `t()` at :1126; `handedStrings` :1566 (re-runs `resolveStrings` on the non-English entries) applied :1789; `stampStrings` :1655 (js keys → `data-i18n-*`, escaped as attributes on the theme side).
- `packages/section-runtime/src/ad36.test.ts` — the pair pattern; analogues :347 (`{page_number}` in a module string override), :518, :707 (a JSON-file sink).
- `packages/section-runtime/src/fonts.ts` — `fontFaceCss(pairingId, url, options)` :21, `faceRulesCss` :30, `unicode-range: POOL.subsets[f.subset]` :44.
- `packages/theme-compiler/src/compile.ts` — `CompileInput` :85-129 (`strings?` :103, checked `noC0` :758, handed to the renderer :826), `CompiledTheme` :170, `themeFonts` :604-644 (every file of the pairing's faces; preload the roman `latin` file :628-632), `tree[path] =` writes (:864 … :1025), `users.substitute` :1037, checks :1038-1057, `checkChromeText` :512. Nothing writes `locales/`.
- `tools/fonts/build-pool.py` — `COMMIT` (google/fonts, pinned), `SUBSETS = ('latin','latin-ext')` :63, reads `METADATA.pb`; writes `packages/library/fonts/{files,licences,pool.json}` (42 families, 134 files today — derive). `tools/stress/test-vocabulary.mjs` holds pool.json and every sha256 in CI.
- `tools/check-catalog.mjs` — §3 ⇄ catalog.json, defaults under 5.4.3 = shim (:137-153), refuses a 5.4.3 other than 5.4.3 (:173), prints "listed in the Translations surface: keys − locked" (:251-275).
- `tools/stress/build.js:258-261` — the `locales/en.json` writer to mirror.
- `tools/pilot-theme.mjs:213` — the five-pilot compile CI and the recorder share; passes no strings today.
- `tools/probe/record-theme-assembly.py` — `SECTION = '79'` :225, `write_section` :1987; MEASUREMENTS' highest is §79, so this story records **§80**. `tools/probe/record-shim.py` — 4.9's TR recorder over `tools/probe/theme-shim/locales/en.json`.
- `tools/probe/run-verify-editor.cjs` — the deployed walk; highest step 105 (7.10, :8233); this story writes **106**.
- `apps/web/app/(app)/app/(authed)/projects/[id]/settings/` — `page.tsx` (header :73-86 → moves to the layout), `theme-settings.tsx` (:59-60 "STILL ABSENT … D6a's left rail (Story 7.12…)"), `actions.ts` (`SettingsResult` :42; the pattern `idOf` → module check → `signedIn()` → write `.select('id')` → `refusalOf` → `revalidateProject`), `loading.tsx`. No `layout.tsx` yet; `[id]/layout.tsx` is the 404 guard.
- `apps/web/lib/theme-settings.ts` — `siteBasics` :366, `refusalOf` :389, `liveHolder` :399, `settingsReadOnly` :402, `THEME_WORDS` :410.
- `apps/web/lib/editor.ts:168-169` — `SETTINGS`, `settingsPath`; `canvasPath` :156.
- `apps/web/lib/paywall.ts:110` — `adminAt(url, anchor)`; Ghost 6.58.0's settings navids include `navigation`, `social-accounts`, `code-injection`, `publication-language` (same bundle, read 2026-10-15).
- `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts` — `EditorData` :101, `editorData` :194 (the `Promise.all` :203 takes one more read); `apps/web/lib/canvas.ts` `renderSection` :239 → `renderCanvas` :293 passes no `strings`.
- `apps/web/lib/style-pack.ts:299` — the canvas's `faces: fontFaceCss(id, fontHref('canvas'))`; every `fontFaceCss` call site in `apps/web` (also `style-guide.ts:168`, `controls-review.ts:120`) is listed by `grep -rn "fontFaceCss(" apps/web`.
- `apps/web/lib/probe-rule.ts:669` — `settingsPatch` keeps `code_injection`, portal, `announcement`, `brand`, `members`, `plan_ask`; no `locale`.
- `apps/web/app/(app)/app/(authed)/sites/actions.ts` — `useBrand` :732, its insert :935 (the one `linked_site_id` writer).
- `supabase/migrations/20260904120000_complete_schema.sql` — `projects.language` :225, `rtl_ack_at` :233 (both in the insert grant :1052 and the update grant :1210); `translation_overrides` :343-355 (PK `(project_id, catalog_key)`, `credit_namespace_locked`), RLS :793/:821/:846, authenticated CRUD :1022. `RLS-TEST.sql:374-381` the credit row.

## Tasks & Acceptance

**Execution:**
- [x] `packages/library/src/languages.ts` (new, core, exported) -- `LANGUAGES` (Ghost 6.58.0's `{code,label}` list, anchored), `languageRefusal(code)` (Ghost's `ms` shape, which also keeps `/`, `\`, `.` out of a file name), `scriptOf(code)` (an explicit script subtag first — `sr-Cyrl`, `zh-Hant` — else the primary subtag's default script from one table, `latin` otherwise, Vietnamese its own), `isRtl(code)`, `languageAtLink(siteLocale)` (`en` when refused) -- one list, one rule
- [x] `packages/library/src/override.ts` (new; `package.json` `exports["./override"]`, `dependencies["intl-messageformat"] = "5.4.3"`) -- `overrideRefusal(key, value)` in the Always order, and `OVERRIDE_WORDS`, every sentence of the matrix; `translatableKeys()` (catalog order, keys − locked − retired) beside it in `catalog.ts`, browser-safe -- V9, V10, DW-141, DW-142, R-106
- [x] `packages/library/src/override.test.ts`, `languages.test.ts` -- every refusal row behind its legitimate twin; every catalog default passes `overrideRefusal`; `LANGUAGES` holds Ghost's list (pinned from the bundle's text in a fixture); `isRtl` true for exactly `ar`, `fa`, `he`, `ur` of it -- the matrix
- [x] `tools/check-catalog.mjs` -- its listed-keys line reads keys − locked − retired, from `translatableKeys` -- counts derived
- [x] `tools/fonts/build-pool.py` -- per face also a whole-face woff2 (same instance, no glyph subset, hinting dropped) for every family whose `METADATA.pb` lists a subset other than `latin`, `latin-ext`, `menu`, `math` and `symbols`; `pool.json` gains each family's `subsets` (as `METADATA.pb` lists them) and each such face's `full` `{file, bytes, sha256}`; rerun at the SAME `COMMIT`; existing files byte-identical (asserted); `--self-check` gains a synthetic family with and without a non-latin subset -- §D.b
- [x] `tools/stress/test-vocabulary.mjs` -- holds the new records and sha256s; the latin ceiling unchanged -- CI
- [x] `packages/section-runtime/src/fonts.ts` -- `fontFaceCss(…, { script })`: a covering family's faces as whole-face rules with no `unicode-range`; `coverageOf(pairingId, script)` → covered and uncovered families with bytes, for the caption -- one rule for canvas and theme
- [x] `packages/theme-compiler/src/compile.ts` -- `CompileInput.language` (default `en`); refuse `languageRefusal` first; `locales/en.json` and `locales/<language>.json` as Always; every value written passes `overrideRefusal` or the build throws naming key and sentence; V3 asserted per file; `themeFonts` takes `scriptOf(language)` (whole faces, the preload naming the whole file) -- FR-Q6, FR-Q8
- [x] `packages/theme-compiler/src/compile.test.ts`, `packages/theme-compiler/gate/locales.test.ts` (new) -- the matrix's compile rows; a `de` + overrides compile and a `ru` compile pass gscan 4.49.7 and 6.4.2 at 0/0 (GS070 parses each file) with an empty `qualityGate` -- the gate
- [x] `packages/section-runtime/src/ad36.test.ts` -- the language-path pair and a plural override carrying `<b>` refused while `% posts` still renders -- AD-36
- [x] `tools/pilot-theme.mjs`, `tools/check-snapshots` -- a second pilot compile with `language: 'de'` and two overrides: both files, equal key sets, 0/0 on both pins -- CI
- [x] `apps/web/lib/probe-rule.ts` -- `settingsPatch` keeps `locale` (a string, else the previous value) -- the site's language
- [x] `apps/web/app/(app)/app/(authed)/sites/actions.ts` -- `useBrand`'s insert sets `language: languageAtLink(site.site_settings?.locale)` -- first link
- [x] `apps/web/lib/paywall.ts` -- `adminAt` anchors gain `navigation`, `social-accounts`, `code-injection`, `publication-language`, each read in 6.58.0's and 5.130.6's admin source and anchored in the comment -- one builder
- [x] `apps/web/lib/editor.ts` -- `TRANSLATIONS`, `translationsPath(projectId)` -- one path
- [x] `apps/web/lib/translations.ts` (new) -- `readTranslations(projectId)` (`{ language, rtlAck, overrides, refused }`, refused through `overrideRefusal`), `TRANSLATION_WORDS` (title, B18's sentence verbatim, scope, columns, placeholders, Save/Saving…, Use the default/Resetting…, the RTL block — B18's words without "so we do not offer those locales rather than shipping something broken", see Design Notes — the switch confirm, the mismatch notice, the font captions), `refusalOf`'s mapping -- R-170, one list
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/layout.tsx` (new) -- the back header and D6a's rail (Question 2), active item from the segment; `page.tsx` drops its header; `loading.tsx` drops what the layout now draws; `theme-settings.tsx`'s :59-60 note updated -- the rail
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/settings/translations/{page,translations,actions,loading}.tsx` (new; actions `.ts`) -- B18 as the Always describes; actions `saveOverride`, `resetOverride`, `setLanguage` (RTL needs `acknowledged`; with overrides needs `confirmed`), each validating before the write and mapping Postgres codes; `revalidateProject` -- the surface
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/read.ts`, `apps/web/lib/canvas.ts`, `apps/web/lib/style-pack.ts` -- `editorData` carries `language` and the valid overrides; `renderSection` hands `strings`; the canvas faces take `scriptOf(language)` -- FR-H5, canvas parity
- [x] `apps/web/busy.test.ts` (no change expected) and `tools/probe/run-verify-editor.cjs` step **106** -- 106a the rail; b B18's header and columns; c an override saved and seen on the canvas; d each refusal sentence; e Use the default; f the switch confirm; g RTL and Understood; h the Cyrillic and Japanese captions; i read-only; j the deep links; each behind its control -- R-82
- [x] `tools/probe/record-theme-assembly.py` → §80 (local half: both gscans on the `de` and `ru` trees; T1 half on the owner's in-session go) -- T1 rows: `nav.more` reads "More" on `/` with `en.json` (7.6's row turned); locale `de` with `de.json` reads the override; locale `fr` with no `fr.json` reads `en.json` (VERIFY-AT-BUILD 32's file fallback, recorded); a probe theme whose `de.json` holds `Mehr {` on a `default.hbs` key and on a `post.hbs`-only key — status and body of `/` and a post, each behind the valid twin's 200 (DW-142's observation, read as a 400 in source); locale and Casper put back and read back -- standing rule 1
- [x] Propagation -- FR-Q6 and FR-Q8 (dated notes: languages are Ghost's list, exact file name, the observed status and "every page that shows it"), appendix-h1 (V3/V7/V9/V10 dated, S3's apostrophe line, the listed-keys line), ARCHITECTURE-SPINE (`intl-messageformat` row: a server runtime dependency of `@inflozo/library/override`, still never in the browser; the parser row; AD-36's instances), VERIFY-AT-BUILD row 32 (recorded), MEASUREMENTS §80, `EXPERIENCE.md:747` (dated note: the RTL sentence and the rail), Appendix D §D.b (dated note: whole faces built, coverage from `METADATA.pb`), DW-141/142/145 resolved, `epic-7-context.md` sub-bullets; then grep the repo for "whole-page 500" and "falls back to `en` for any key" -- standing rules 3 and 7

**Acceptance Criteria:**
- Given Theme settings, when it opens, then D6a's rail shows **Theme settings** (active) and **Translations**, and Question 2's ruling decides Navigation, Social accounts and Code injection.
- Given Translations, when it opens, then it matches the frame: B18 (`B Missing Surfaces.dc.html:1768-1803`) as re-specified by `EXPERIENCE.md:747`, inside D6a's rail — the title and sentence verbatim, the language button with its mono code, KEY · ENGLISH DEFAULT · the language's own name, mono dotted keys on alternating rows, "Falls back to English", the refused row's tint, border and caption, and the marigold RTL block with Understood.
- Given the list, when it renders, then it holds every key of `translatableKeys()` in catalog order and no `credit.*` key, on Free and on Pro, and the scope sentence names Portal, comments and search.
- Given any override, when it is saved, then `overrideRefusal` judges it before the write, and a refusal stores nothing and names the character in the user's own string.
- Given a project with language `es` and overrides, when `compileTheme` runs, then the tree holds `locales/en.json` (English defaults) and `locales/es.json` (overrides over defaults), equal key sets, catalog order, no `canvas` key, `credit.*` verbatim; with `en`, exactly one file, `en.json`, carrying the overrides.
- Given a stored override `overrideRefusal` refuses, when the compile runs, then it throws naming the key and the sentence and writes no tree.
- Given an override, when the canvas draws a section that prints that key, then it shows the override (the shim), and after Use the default the English again.
- Given an RTL language, when it is chosen, then nothing saves until Understood, which stores the language and `rtl_ack_at` in one write.
- Given a non-latin language, when it is chosen, then the coverage caption appears before any save, and the next compile and the canvas ship exactly the faces the caption names.
- Given a project first linked through Use your brand to a site whose Ghost locale is `de`, then the project's language is `de`.
- Given Question 1, then its ruled behaviour is built as Design Notes states it.
- Given `pnpm check`, the gscan gate on the `de` and `ru` pilot compiles, the deployed walk's step 106 and T1 §80, then every one is green or recorded, each behind its control.

### Review Findings (2026-10-15)

Five layers ran: Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor and the real-infra verifier (T1 read
only, Ghost 6.58.0's source from the npm tarball, intl-messageformat 5.4.3 executed, production's schema read in a
read-only transaction, the deployed routes signed out), with CI, Vercel and the deployed walk run in the main session
(R-82) — results under § Verification. Every finding was read in the code before it was rated. No question for the owner
came out of it.

- [x] [Review][Patch] A backslash and DEL reached the judge's catch-all "Check its apostrophes and braces", which names
  neither — executed against 5.4.3, a backslash is its escape character (`C:\temp` throws, an error on every page that
  prints it; `\u0041` prints `A`) and DEL throws. DEL takes the control-character sentence; a backslash its own, naming it
  in the customer's string [override.ts, override.test.ts, walk 106d, appendix-h1 S3 and V9]
- [x] [Review][Patch] The RTL block was the Kit's notice Banner, which B18 does not draw: it is B18's strip (`:1794-1801`),
  with two tokens taken from B18 (`marigold-ink`, `marigold-edge`), under the header; the rows' ground is the surface so an
  odd row is B18's, and a refused row's words take `danger-panel-ink` as B18's do [translations.tsx, loading.tsx,
  globals.css, DESIGN.md]
- [x] [Review][Patch] Other… codes in a right-to-left script other than Arabic or Hebrew (`dv`, `syr`, `nqo`, `ff-Adlm`, and
  Dari, Kashmiri, Balochi, South Azerbaijani) skipped Appendix G's Understood; `zh-TW`/`zh-HK`/`zh-MO` read as Simplified;
  a private-use `en-x-arab` read as Arabic [languages.ts, languages.test.ts]
- [x] [Review][Patch] The split of stored rows into what reaches the canvas and what is shown refused was held by a source
  regex alone: it is `judgeOverrides` in `@inflozo/library/override`, executed in `override.test.ts`, and read by both of
  `read.ts`'s reads [override.ts, read.ts, translations.test.ts]
- [x] [Review][Patch] Five matrix rows had no check that ran in their state — Other…, `setLanguage`'s two guards past the
  page, a stored refused override (row and canvas), the first link's language, and the whole faces actually served: the
  walk's step 106k executes each behind its control; `pilots.test.ts` serves every whole face at its hash, and
  `style-pack.test.ts` holds `packChoices`/`pairingChoices` under a script to `fontFaceCss` [run-verify-editor.cjs,
  pilots.test.ts, style-pack.test.ts]
- [x] [Review][Patch] `build-pool.py`'s same-commit guard held the latin files only, so a fontTools change could rewrite
  every whole face silently: it holds them too [build-pool.py]
- [x] [Review][Patch] `languages.ts` cited two fixture files that do not exist; the fixture said "both verbatim" of a
  text whose one comma is a newline [languages.ts, admin-6.58.0.json]
- [x] [Review][Patch] The rail's three Ghost links and the mismatch notice's link said "↗" and nothing else to a screen
  reader: each says "(opens in a new tab)", the Layers panel's and the paywall notice's words [rail.tsx, translations.tsx,
  lib/translations.ts, walk 106j]
- [x] [Review][Patch] A choice from the language menu left Other… open; "every page" and the `pt-BR` placeholder sat
  outside the one list (R-170); `EditorData.language` was returned and read by nothing [translations.tsx,
  lib/translations.ts, read.ts]
- [x] [Review][Patch] Places that still said the old thing: the PRD's risk row ("500s every page"), EXPERIENCE A9 #14
  ("whole-site 500"), a face count written into `epic-7-context.md`, the Code Map's grant line; and the Spec Change Log now
  records where the Dev put `readTranslations` and that no `refusalOf` exists [prd.md, EXPERIENCE.md, epic-7-context.md,
  this spec]
- [x] [Review][Patch] Run on production for the first time, step 106b expected the layer "Three Up" where Layers names it
  "Post Grid — Three Up"; the check reads the name `untouchedWords` gives, and the owner's step 14 says what he will see
  [run-verify-editor.cjs 106b, this spec]
- [x] [Review][Patch] Step 105d (Story 7.10's) failed on a right answer: CDP hands a `text/x-component` body to Playwright
  decoded as windows-1252, so even `body()` read "â€”"; the sentence is matched in either form [run-verify-editor.cjs 105d]
- [x] [Review][Defer] Three walks on the Dev head died on harness holds with 0 FAIL — step 53's paint after Back, and two
  magic-link loads whose requests Vercel answered in under 250 ms — and four on the Review head the same way — owner Story
  15.1 — deferred, DW-352 (seen again)

Dismissed, each read in the code: the three actions not checking the live lock on the server (Theme settings' own actions
take the same posture; R-192 is the read-only page, and an override never races the canvas's journal); Use the default on
a row already gone answering the save sentence (`useSubmitting` guards the double press; another tab is a reload away); a
crafted post missing its acknowledgement or confirm getting the save sentence (the page always sends them; 106k replays
both); `translatableKeys` rebuilt per call (catalog-sized); the judge importing the shim by path (the cycle it avoids is
documented); a plural in an attribute (no design prints a plural; DW-141's rule is the element's); C1, U+2028 and bidi
controls (5.4.3 and the shim print them alike — executed — and the Always says C0); a first link to a right-to-left site
storing no acknowledgement (the matrix's own row: the page shows the block, and Story 7.18's Pre-flight blocks); a site
connected before this story having no stored locale (no notice with none stored, as the matrix says); the notice hidden
for a site whose address fails the http(s) check (connect validates the address); the empty-pairing fallback (`packs` is
never empty); the Translations page reading `editorData` whole (cached per request); the address check written twice; the
coverage type copied by shape (DW-323's reason); a case variant of `en` (stored and emitted exactly, as Ghost reads it); V3's
per-file assertion (the spec asks for it); the canvas-key filter in three places; no search or filter (§ Never); no
unsaved-edit warning (not in the spec); literal colours in the walk; `ownName`'s CLDR names under Node 24's full ICU;
`comments.placeholder` listed though canvas-only (appendix-h1 §3 says it is listed); a refused stored row of a key no
surface lists (only a direct write of an unknown key, never shown on the canvas and refused by the compile); a stale
"has overrides" after another tab wrote one; the starting-words Edit link for a template no canvas opens (`read.ts` stores
templates only under the canvases the switcher opens); `rtl_ack_at`'s timestamp format (PostgREST's ISO, both renders); a
code longer than any locale (Ghost's rule accepts it, and nobody types one); the AD-36 plural twin rendered in the test
(no product `{{plural}}` renderer exists yet; `contract.test.ts` records Ghost's fact); the settings layout's reads above
both skeletons (the prefetch carries the layout); the Russian pilot gated locally rather than in CI (CI gates a Russian
theme in `gate/locales.test.ts`; the pilot tree is recorded — "green or recorded").

## Spec Change Log

- **Dev, 2026-10-15 — found by execution (standing rule 1); the owner renegotiated one matrix sentence (Question 3):**
  the apostrophe row said `'{minutes}' min` is refused because "5.4.3 quotes it". Executed, 5.4.3 (parser 2.1.3, the
  pair both Ghost majors resolve) prints it `'<value>' min` — the placeholder filled, the apostrophes kept, as the shim
  does — here and on T1 6.58.0 (MEASUREMENTS §80, `'0' Min. Lesezeit`), while intl-messageformat 10.7.16 prints
  `{minutes} min`. The refusal stays as appendix-h1 S3's rule; the sentence "stops your site filling in {minutes}" was
  false on today's Ghost, so it was put to the owner, who ruled option 1: "The “'” beside “{” in “'{minutes}' min” prints
  on your site as typed today, and a Ghost update could make it hide {minutes}. Remove it." The matrix row carries it.
- **Dev, 2026-10-15 — routine calls:** a locale file's `credit.*` keys are exempt from the fingerprint scan (CI's
  `textFailures` and `compile.test.ts`), each held equal to the catalog's own words — S7 puts the credit in every locale
  file verbatim; a `strings` record that leaves a key out ships that key's English (the render already read it so);
  the Theme settings page and its skeleton moved into a `(theme)` route group, so each settings page keeps its own
  `loading.tsx` under the shared rail (`busy.test.ts` unchanged).
- **Review, 2026-10-15 — found by execution (standing rule 1), routine calls (said to the owner, not asked):**
  - **A backslash and DEL.** Executed against 5.4.3: a backslash is its escape character (`C:\temp` throws, `\u0041`
    prints `A`) and DEL (U+007F) throws; both reached the matrix's catch-all "Check its apostrophes and braces", which names
    neither. DEL now takes the control-character sentence, and a backslash its own, in the brace sentence's shape: "The “\”
    in “C:\temp” would break every page that shows it, or change what it prints. Remove it." (`OVERRIDE_WORDS.backslash`).
  - **The RTL block is B18's own strip** (`:1794-1801`: the raised ground, the warning sign, `marigold-ink` title,
    `marigold-text` sentence, a 30px white Understood with B18's marigold edge — two tokens added from B18), not the Kit's
    notice Banner the Dev drew. It stays **under the header**, not at the card's foot: B18's foot is under seven rows, this
    list's under every key. The rows' ground is the surface, so an odd row is B18's `#FDFCFA`, and a refused row's words
    take `danger-panel-ink` as B18's do.
  - **Other scripts that read right to left** (Thaana `dv`, Syriac `syr`, N'Ko `nqo`, Adlam `ff-Adlm`, and Dari, Kashmiri,
    Balochi and South Azerbaijani in Arabic script) ask for Understood like Arabic; `zh-TW`, `zh-HK` and `zh-MO` are
    Traditional Chinese; a script subtag counts only right after the language, where Ghost's rule puts it.
  - **Where the Dev put two things:** `readTranslations` lives in `(editor)/read.ts` (server side, beside the judge), not
    `lib/translations.ts` (browser-safe); there is no `refusalOf` — the actions map every database failure inline to "We
    couldn't save that just now.". The judge's split of stored rows is `judgeOverrides` in `@inflozo/library/override`.
  - The rail's and the mismatch notice's ↗ links say "(opens in a new tab)" to a screen reader; a choice from the language
    menu closes Other…; the same-commit guard in `build-pool.py` holds the whole faces' bytes too.

## Design Notes

### Rulings this spec is written to

- **R-74:** the frame decides what the surface is built from; FR-Q6/FR-Q8 decide what it does. **R-80/R-82/R-83/R-98/R-192**
  as Always. **R-106:** a blank is refused, and Use the default is its own action. **R-118:** absent, not greyed — so the
  rail had to wait for this second page. **R-170:** one name per thing — the rail says **Theme settings**. **R-195:** the
  wizard and Pre-flight items below are pasted into Story 7.18's card word for word, with a list in Epic 7's preamble.
- **Story 7.4's Question 2 (owner, 2026-10-08):** §D.b's full-face sentence and coverage line are this story's, word for word.

### Routine calls, one line each (said to the owner, not asked)

- **B18's RTL sentence drops its last clause.** "so we do not offer those locales rather than shipping something broken"
  contradicts FR-Q6, which offers an RTL language behind a blocking acknowledgement; behaviour is the PRD's (CLAUDE.md's
  R-74 scope), so the block keeps its title, its first two sentences and Understood.
- **Languages are Ghost 6.58.0's own list plus Other…**, because Ghost reads the file named exactly after its own setting.
- **"every page that shows it", not "every page of your site".** Read in source, a broken value errors only the pages
  that print that label — a 400 (`IncorrectUsageError`, `mw-error-handler` 1.0.13 `:59-90`), and a bare 500 only when the
  theme's error template prints the same label (`error-handler.js:35-39`). T1 §80 observes it before the sentence ships
  (DW-142); for a header label that is every page.
- **Retired keys are not listed** (no design prints one); they still ship in every file (S4). `check-catalog`'s line follows.
- **The wizard's and Pre-flight's items go to Story 7.18** (its destination step and Pre-flight are where they are
  seen): the switch warning, the first link's language, the RTL repeat (blocking while `rtl_ack_at` is empty), and the
  mismatch.
- **Vietnamese takes the whole face, not `latin` + `latin-ext`.** Its tone-marked letters (U+1EA0–1EF1) sit outside
  Google's `latin-ext` range, in google/fonts' own `vietnamese` subset, so §D.b's coverage line governs it, not its
  latin line — otherwise a Vietnamese theme's chrome strings would draw half in the reader's system font.
- **`sr` is Latin, `sr-Cyrl` Cyrillic**, as Ghost's own list labels them ("Serbian", "Serbian (Cyrillic)").
- **The whole face for every non-latin script** — the CJK sentence ("font payload will dominate the theme zip") is the
  general bytes caption. Coverage is per family from `METADATA.pb` at the pinned commit: Poppins lists `devanagari` and
  Rubik `arabic` and `hebrew`, while no family lists Japanese, Chinese, Korean or Thai, so those take the system font,
  said at the selector.

### Pasted into Story 7.18's card at this Create (R-195), word for word

> *(given an owner by Story 7.12's Create, 2026-10-15, word for word — R-195)* **switching to a site whose locale differs
> warns before the switch**, because the overrides were written in the old language — where step 1's destination links
> the project to a site other than its linked one (FR-B5), the warning names both languages before the switch; a project
> linked to a site for the first time there takes `languageAtLink` of the site's locale; an RTL project language is
> **repeated as a pre-deploy warning** in Pre-flight, which **blocks** while `projects.rtl_ack_at` is empty and links to
> Translations; and Pre-flight warns when the project's language is not `en` and differs from the site's stored locale,
> because Ghost reads `locales/<its own locale>.json`, exactly.

### Question 1's behaviour (ruled option 1, owner, 2026-10-15)

On a project whose language is not `en`, below the list: **"Starting words you haven't retyped"** and "These came with
your sections and stay as written until you change them on the canvas." — one row per placed, visible section with a
text prop still at its design `default` and no `catalog` key (`untouchedWords(docs, library)`, a new core function in
`packages/section-runtime/src/starting-words.ts`, synthesized instances skipped), reading "<layer name> on <canvas>: “The
archive” · “Browse the archive”" with **Edit** opening that canvas. The same function feeds Story 7.18's Pre-flight
warning — never a block — pasted to its card word for word with Epic 7's preamble list (R-195).

### A locale file (language `de`, `nav.more` overridden)

```
locales/en.json  { "pagination.label": "Pagination", …, "nav.more": "More", …, "credit.built_with": "Built with Inflozo", … }
locales/de.json  { "pagination.label": "Pagination", …, "nav.more": "Mehr", …, "credit.built_with": "Built with Inflozo", … }
```

### Facts this spec rests on (standing rule 1)

- Theme i18n reads `locales/<settings locale>.json`, exact, falls back to `en.json` only when that file is missing, a
  missing key or empty value prints the key, `new MessageFormat` per call outside the try, 5.4.3 bundled, `{{plural}}`
  unescaped — MEASUREMENTS §44 (both majors, recorded) and `i18n.js:105-110,187-199` (6.58.0, read 2026-10-15).
- The locale is re-read on `settings.locale.edited` and on theme activation (`bridge.js:41-44`, `active.js:58,118`).
- Ghost's server accepts any non-empty `locale` (`default-settings.json:126-132`); its admin offers the list and Other…
  with the `ms` shape rule (6.58.0); 5.130.6's admin is free text. Admin settings browse and `GET /admin/site/` return it.
- gscan 4.49.7 and 6.4.2: `GS070-VALID-TRANSLATIONS` (each `locales/*.json` must `JSON.parse`, fatal from v4), no
  `en.json`, parity or ICU check.
- §44(c): 5.4.3 throws on `'{'`, `{` and `{a b}`, renders `It''s` as `It's`; `@formatjs/icu-messageformat-parser` 3.5.18
  accepts `'{'`.

## Owner's manual test

Do this on the real site after Deploy, on a laptop at full width, signed in as yourself. **Pilot sections** is
`b6d4db35-8e5e-45e1-a70f-4daa28916d51` (links no site); **Ghost 6 Project** is `21d868cf-1262-4ad2-9a44-091fbf653a04`
(linked). Steps 13 and 14 test your rulings on Questions 1 and 2 (option 1 on both). Step 12 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|-----|--------|------------|------------|---------------------|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Press **Theme settings** at the top. | — | Theme settings, now with a narrow menu on the left headed SETTINGS: **Theme settings** (highlighted) and **Translations**. Nothing else in the menu — this project links no Ghost site. |
| 2 | the same | Theme settings | Click **Translations**. | — | "Translations" and "Every string your theme prints. English is the default; overrides ship in `locales/`.", a language button reading **English** with a small `en`, a line saying Portal, comments and search use Ghost's own translations, then a long list in three columns — KEY · ENGLISH DEFAULT · ENGLISH — with keys like `nav.more` and `post.reading_time` in a typewriter font. No `credit.` key anywhere. |
| 3 | `…/settings/translations` | Translations | Open the language button and choose **Español**. | — | It saves ("Saving…" for a moment). The third column now reads **ESPAÑOL** and every empty box says *Falls back to English* in grey italics. |
| 4 | the same | Translations | Find `post.reading_time` ("{minutes} min read"), type in its box, press **Save**. | `{minutes} min de lectura` | "Saving…", then the box keeps your words. |
| 5 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the **Three Up** post cards. | — | Each card's reading time reads "… min de lectura". |
| 6 | `…/settings/translations` | Translations | In `nav.more`'s box type the text, press **Save**. | `Más {{` | The row turns pale red and under the box: "The “{” in “Más {{” would break every page that shows it — braces mark a placeholder, and this label has none." Reload: the box is empty again — nothing was saved. |
| 7 | the same | Translations | In `post.reading_time`'s box replace your text, press **Save**. Then empty the box and press **Save**. | `min de lectura` | First: "Keep {minutes}: your site fills it in." Then: "Type the wording, or press Use the default." Your step-4 words stay saved both times. |
| 8 | the same | Translations | Press **Use the default** on `post.reading_time`. Go back to the editor. | — | The box empties to *Falls back to English*; the Three Up cards read "… min read" again. |
| 9 | the same | Translations | Type `{minutes} min` into `post.reading_time` and save, then choose **Deutsch** in the language button. Press **Cancel**. Then press **Use the default** on `post.reading_time`. | `{minutes} min` | A small window: "Switch to Deutsch? The labels you translated were written in Español. They stay, and ship in the Deutsch file until you change them." with **Cancel** focused. After Cancel: still Español. |
| 10 | the same | Translations | Choose **Русский**. Then choose **日本語**. | — | Each saves and the column takes the language's name. Under the button, on the Paper pack (Fraunces headings, Inter text): "Inter covers Cyrillic: your theme ships its whole faces — about … KB of fonts instead of … KB." and "Fraunces doesn't cover Cyrillic, so your site shows Русский headings in each reader's own system font." For 日本語, one "doesn't cover Japanese" sentence for each font. On another pack the font names differ. |
| 11 | the same | Translations | Choose **العربية**. Then press **Understood**. | — | A pale strip under the header with a gold warning sign, gold words and a white **Understood** button on its right: "Right-to-left languages are not supported yet" / "Our designs are built left-to-right. Arabic, Hebrew and Farsi strings will translate, but the layouts will not mirror."; the language button still shows the old language. After Understood it saves Arabic and the strip says you acknowledged it today. |
| 12 | the same | Translations | Choose **English**. | — | English, no yellow box, no font sentence, the column reads ENGLISH, nothing overridden. |
| 13 | `https://app.inflozo.com/projects/21d868cf-1262-4ad2-9a44-091fbf653a04/settings` | Theme settings | Look at the left menu. | — | Below Translations: **Navigation ↗**, **Social accounts ↗**, **Code injection ↗**. Each opens that part of your Ghost site's own settings in a new tab (Ghost may ask you to sign in). |
| 14 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings/translations` | Translations | Choose **Español** again and scroll to the bottom. | — | "Starting words you haven't retyped" listing **Post Grid — Three Up on Home** with its untouched words (e.g. “The archive”, “Browse the archive”) and an **Edit** link that opens Home. Choose **English** again: the block is gone. |
| 15 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` in this window, then `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings/translations` in a **new** window | Editor here; Translations, read-only, in the new window | Open the project's **editor** in this window and leave it open — it is the window doing the editing. Then open a new window (Ctrl+N), paste the Translations address and press Enter. *(Corrected 2026-10-15 at the owner's test: the step first said to open Translations in the editor's own window, and that window stays editable because it is the one editing.)* | — | In the new window: the blue line "You are editing this site somewhere else — you are reading along here", and every box, Save, Use the default and the language button greyed and doing nothing; the words readable. Close the new window. |

## Questions for the owner

All three questions were ruled option 1 (owner, 2026-10-15), and the spec is written to those rulings. Question 3 was
asked at Dev, in the session, after T1 contradicted the matrix's reason for one refusal.

### Question 1 — On a non-English site, what happens to a section's starting words nobody retyped

**In plain English.**
- Labels the theme prints itself ("Older posts", "{minutes} min read", "More") are on the Translations list, so you
  translate each once and it is right everywhere.
- A section also arrives with its own sample words — Three Up's heading "The archive" and its button "Browse the
  archive". They are not on the list: they are the section's content, and they stay exactly as written until you retype
  them on the canvas (DW-145).
- So on a German site, any section whose words you never touched would show English to your visitors.

**Example.** You set the language to Deutsch, translate every label, and deploy. Your Home has Three Up, whose heading
you never changed. With option 1, Translations (and the deploy check) shows "Three Up on Home: “The archive” · “Browse the
archive”" with an Edit link, so you retype them before visitors see English. With option 3, the site goes live with "The
archive" in English and nothing tells you.

1. **List them.** On a non-English project, Translations lists every section with untouched starting words, each with an
   Edit link to its canvas, and the deploy check (Story 7.18) repeats the list as a warning — never a block. **(RECOMMENDED)**
2. **Put them on the list.** Every starting word of every design gets its own entry in the Translations list, written in
   when Epics 9 and 10 build each design. The list grows by several hundred rows, and the sample words become phrases you
   translate rather than content you replace.
3. **Leave them.** They stay as the design wrote them; Translations says in one sentence that a section's own words are
   changed on the canvas.

**Ruled: option 1 (owner, 2026-10-15).**

### Question 2 — The left menu's Navigation, Social accounts and Code injection

**In plain English.**
- The Theme settings drawing has a left menu with five entries: Site basics, Navigation, Social accounts, Translations
  and Code injection. This story builds the menu, because Translations is its second page.
- Navigation, Social accounts and Code injection are not Inflozo's: Ghost owns them, and no story builds a page for them.
- The first entry will read **Theme settings**, the page's name everywhere else (one name per thing).

**Example.** On a project linked to your Ghost site, option 1 shows "Navigation ↗"; clicking it opens your Ghost site's
own Navigation settings in a new tab. Option 2 shows just Theme settings and Translations.

1. **Links into Ghost.** Draw the three as menu entries with ↗ that open that part of your linked Ghost site's settings
   in a new tab — as the logo's "Change this in Ghost ↗" already does. A project with no linked site does not show them.
   **(RECOMMENDED)**
2. **Leave them out.** The menu holds Theme settings and Translations only, as we do for anything with no page yet.
3. **Greyed.** Draw all three, greyed, with "Ghost owns this — change it in Ghost Admin." and no link.

**Ruled: option 1 (owner, 2026-10-15).**

### Question 3 — The words for an apostrophe right beside a placeholder

**In plain English.**
- A translation like `'{minutes}' min` — apostrophes around a placeholder — is refused, and the sentence approved at
  Create said it "stops your site filling in {minutes}".
- Tested on your Ghost test site: today's Ghost does fill it in and shows `'5' min`, apostrophes and all. The newer
  version of the same text library would show `{minutes} min` instead, so refusing is still right; only the reason is wrong.

**Example.** You type `'{minutes}' Min. Lesezeit`. Today your site shows `'5' Min. Lesezeit`; after a Ghost update to
that library it would show `{minutes} Min. Lesezeit`.

1. **Keep refusing, true words:** "The “'” beside “{” in “'{minutes}' min” prints on your site as typed today, and a Ghost
   update could make it hide {minutes}. Remove it." **(RECOMMENDED)**
2. **Keep the approved sentence**, although today's Ghost does fill the placeholder in.
3. **Accept it:** today the site prints it exactly as the canvas shows it; a later Ghost could change that.

**Ruled: option 1 (owner, 2026-10-15).**

## Verification

**Commands:**
- `pnpm check` -- expected: green; `override.test.ts`, `languages.test.ts`, the compile and AD-36 rows, `busy.test.ts` included.
- `node tools/check-catalog.mjs` -- expected: passes and prints the listed-keys line as keys − locked − retired.
- `uv run tools/fonts/build-pool.py 2>&1 | cat` then `git diff --stat packages/library/fonts/` -- expected: only new whole-face files and `pool.json` records; no existing file changed.
- `node tools/check-snapshots.mjs` (or its pnpm alias) -- expected: the `de` pilot compile 0/0 on gscan 4.49.7 and 6.4.2, quality verdict empty, both locale files with equal key sets.
- `python3 tools/probe/record-theme-assembly.py` local half -- expected: 0/0 on both pins for the `de` and `ru` trees; the T1 half recorded as §80 on the owner's in-session go.
- `node tools/probe/run-verify-editor.cjs` against production after deploy -- expected: step 106 PASS, each row behind its control.
- `python3 tools/doc-audit.py --check` -- expected: green.

**Manual checks:**
- The Translations page beside B18 at 1440 and 834: the header, the three columns, the refused row's colours, the
  marigold block.

**What ran at Dev, 2026-10-15 (R-82):**
- **T1 `ghost6.inflozo.com` (6.58.0)** — `python3 tools/probe/record-theme-assembly.py`, run in the main session on the
  owner's in-session go (keys `GHOST6_URL`, `GHOST6_STAFF_ACCESS_TOKEN`, `GHOST6_CONTENT_API_KEY`, read by name). Every
  row held behind its controls and MEASUREMENTS §80 is written: every §70–§79 row re-run, the More label now "More" from
  `en.json` (7.6's row turned); under locale `de` the German pilots printed "Mehr" and "Min. Lesezeit" (`<html lang="de">`
  the control); under `fr`, which no file names, "More" from `en.json` (VERIFY-AT-BUILD 32's file fallback, recorded);
  `Mehr {` on a `default.hbs` label answered **HTTP 400** on `/` and on a post, `Teilen {` on a post-only label answered
  400 on the post while `/` answered 200, each behind the valid twin's 200; `'{minutes}' Min. Lesezeit` printed
  `'0' Min. Lesezeit` (5.4.3 does not quote it — Question 3). Both pinned gscans passed both broken `de.json` files (no
  ICU check). The site's locale was put back to `en` and read back, Casper re-activated and the probe theme deleted.
- **Local:** `pnpm check` green under Node 24 (every package's tests, check-catalog, check-snapshots with the German
  pilot compile 0/0 on both pins, test-vocabulary); `node tools/check-catalog.mjs` prints the listed-keys line as every
  key but the locked and the retired; `uv run tools/fonts/build-pool.py --self-check` passes and the pool rebuild added
  whole faces and `pool.json` records only (no existing font file changed); the recorder's local half gated the `de`,
  `ru`, `valid` and both broken trees 0/0 on gscan 4.49.7 and 6.4.2; intl-messageformat 10.7.16, installed in a
  scratch directory, prints `'{minutes}' min` as `{minutes} min`; `python3 tools/doc-audit.py --check` green.
- **Not run at Dev, and why:** the deployed walk's step 106 needs this push deployed — it is the Review's, on
  production (Supabase through the app's own session, Vercel's deployment). Supabase was not written by Dev: no
  migration (every column, grant and check pre-exists). Resend and Dodo are not touched by this story.

**What ran at Review, 2026-10-15 (R-82):**
- **CI and Vercel** (`GITHUB_TOKEN`, `VERCEL_TOKEN`, read in-process): on the Dev head `376d8c3d`, CI's `rls`, `check` and
  `deploy` and the Render matrix all succeeded; `dpl_5X28GxaK28MYL2jzCWSAaPjfednS` READY, serving `app.inflozo.com`.
- **Supabase, production** (`SUPABASE_DB_POOLER_URL`, `BEGIN READ ONLY`, catalog views only): `projects.language` text
  not null default `en`, `rtl_ack_at` timestamptz null, the six `translation_overrides` columns, `credit_namespace_locked`
  and the `(project_id, catalog_key)` key, `authenticated`'s UPDATE on both project columns and CRUD on the table, RLS on —
  the schema is at least as new as the code (R-99); controls: a made-up column and constraint absent, `revision` not granted.
- **T1 `ghost6.inflozo.com`, read only** (`GHOST6_ADMIN_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN`): `locale` is `en`, Casper
  active, no probe theme left — the Dev's put-back holds; control: a forged Admin key answered 401.
- **Ghost 6.58.0's source** (the npm tarball, read as data): the admin bundle's sha256 equals the fixture's; `fs` equals
  `LANGUAGES` in order; Ghost's `ms` and `languageRefusal` agree on 1106 generated codes (a wrong rule as the control
  disagreed on 1025); `i18n.js` names `locales/<locale>.json` with no normalisation and falls back to `en.json` on ENOENT
  only; the four settings navids exist.
- **intl-messageformat 5.4.3** (a fresh install resolves parser 2.1.3, the lockfile's pair): 22 matrix rows against
  `override.ts`, each refused row behind its accepted twin; then the review's own: `C:\temp`, `back\` and DEL throw, `\u0041`
  prints `A`, C1, U+2028 and a bidi override print as typed.
- **The deployed routes, signed out:** Translations and Theme settings answer 307 to sign-in, a made-up project the same;
  the whole faces are in the deployment's files at the pool's bytes and sha256 (the signed-in fetch is 106k's).
- **The deployed walk on the Dev head**, three runs from a clean worktree at `376d8c3d`, none complete, **0 FAIL in each**:
  260 PASS (died at step 53's paint after Back — the editor's request answered 200 in 777 ms), 668 PASS (died at a magic-link
  load after step 96) and 701 PASS (the same after step 102). DW-352's holds; step 106 was not reached.
- **Local:** `pnpm check` green under Node 24 (every package's tests with 0 fail, check-catalog, check-snapshots, and
  test-vocabulary holding every pool file, whole faces included, at its sha256); `uv run tools/fonts/build-pool.py
  --self-check` passes.; `pnpm keyboard` whole, every journey passed.
- **CI on the first Review commit `370bee33`:** `rls` and the Render matrix succeeded; `check` went red at the R-236 journey
  stop (`#pack-editor-title` not found after Enter on New pack — DW-350's sixth recurrence; the stop never opens the
  Translations page, and the same tree passed `pnpm keyboard` whole here), so `deploy` was skipped. A second Review push
  re-runs it.
- **CI on the second Review commit `8149174f`:** `rls`, `check` (the R-236 stop passed), `deploy` and the Render matrix all
  succeeded; `dpl_BkLicScJa24T4CuhHtSsmQk2rXLv` READY, serving `app.inflozo.com`.
- **The deployed walk on the Review head `8149174f`** (keys `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_TOKEN`,
  `VERCEL_TEAM_ID`, loaded in-process; a clean detached worktree at that sha, its first line naming the READY deployment):
  - **The committed walk**, run 4: 663 PASS, 0 FAIL, died at a magic-link `load` after step 8's sign-outs (Vercel answered
    the 303 and the dashboard in under a second; nothing more was requested for 24 s).
  - **A debug copy** (`tools/probe-debug/` in that worktree, never committed): the sign-in hop waits for
    `domcontentloaded` (its cookie, not the dashboard's sub-resources); a server action's lost body is a note, not a death
    (DW-352); step 106's waits 90 s. Run 6: 724 PASS, 0 FAIL, died at 104b's lost body (before the catch). Run 7: 777 PASS,
    died at 106a's rail press with no request reaching Vercel for 37 s (a browser hold); its one FAIL was 105d, read in the
    harness, below. Run 8: died at step 66, whose syncs were held and answered 409 (DW-352's step-66 row).
  - **The same copy cut to steps 1–5 and 106** (the helpers 106 reads kept, the step-5 editor sent to `about:blank` so no
    other session takes the lock): run 12, **80 PASS, 0 FAIL, exit 0** — every row of step 106, 106a to 106k, including
    106d's DEL and backslash rows, 106j's new-tab words, and 106k's Other…, the replayed guards, the refused stored row, the
    whole faces served (Inter's two, 200 `font/woff2` at the pool's sha256; a made-up name 404) and the first link (`de` →
    `de`, `zz zz` → `en`); the project handed back and zero CSP violations. Run 11 before it found 106b's literal "Three Up"
    (the layer is "Post Grid — Three Up"), fixed in the walk and in the owner's step 14.
  - **Cut to steps 1–5, 104 and 105** (Theme settings under the new rail): run 13 found 105d's FAIL to be the harness —
    the action answered "Confirm first — …" and CDP handed it to Playwright decoded as windows-1252 ("â€”"), while the
    page's own alert reads it right; fixed in the walk (the sentence matched in either form); run 14: **0 FAIL** over every
    104 row and 105a–d (the cut stops at 105e, whose save reads step 102's names; run 7 passed 105e–i in full).
  - Read together: steps 1–105 passed in full runs 4, 6 and 7 with no FAIL the story owns, and step 106 passed whole on
    production. DW-352 carries the holds (seen again).
- **The owner's step 15, checked on production after he reported it not working (2026-10-15, on `9421d62f`):** one
  throwaway account, one browser, three tabs (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, read in-process). The editor open in
  window 1 and Translations opened by its address in window 2: the reading-along line and 0 controls live, the language
  button disabled. The editor's own window moved on to Translations: no line, every control live — what the step as first
  written led to, since that window holds the lock. A third window opened while the first still held it: read-only again.
  The product is right; the step's order was wrong, and is corrected.

**Deploy (2026-10-15).**

- `Deployment: dpl_3ggjntQ1rneTHRGnzBWxkdvyofJ7` — READY, built from `789d1019` (the head, so it carries the Dev code and every
  Review patch), aliased to `app.inflozo.com` (Vercel API, `VERCEL_TOKEN` and `VERCEL_TEAM_ID` read in-process). CI run
  38714119241 at that sha: `rls`, `check` and `deploy` green; Render matrix run 38714119250 green (GitHub API,
  `GITHUB_TOKEN`). No Schema phase: this story ships no migration, and the schema it reads was confirmed at Review
  (R-99); the RLS gate ran green on this push.
- Signed out, `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51/settings/translations` answers 307 to
  `https://app.inflozo.com/sign-in` — the address is live. Nothing was written to any database or Ghost site at Deploy;
  T1 was not touched.
- The owner's test above already carries the live URLs on `app.inflozo.com`. `owner_test` stays `pending`.
