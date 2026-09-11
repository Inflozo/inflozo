---
title: 'Story 4.1 — The registry format and the annotated-HTML authoring vocabulary'
type: 'feature'
created: '2026-09-11'
status: 'in-progress'
baseline_commit: 'cc325fe175e64fb00c9da73b9d7c568b8d2779b6'
owner_test: none
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md']
---

## In plain English

Nothing a customer can see changes in this story — it builds the rulebook that every one of the
466 ready-made section designs will be written to. Today the rulebook is half-written: a small
proof-of-concept covers eight of the moves a design needs to make and the library needs about
twice that, so the missing ones get settled now, once, in a document the design sessions are
handed. If they were settled later instead, every design written before the change would have to
be written again — which is the whole reason this is the first story of the epic.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-G3 names a registry entry format and calls the annotated-HTML authoring vocabulary
"a documented deliverable", and neither exists in the tree. `packages/library` holds one
`package.json` and nothing else — no entry point, so the `workspace:*` arrow three packages
already declare cannot resolve (DW-1), and `ghostCompat` appears nowhere, so FR-C5's compatibility
watch has nothing to read (DW-87). The vocabulary itself is **proven but incomplete**: eight
directives were executed in `tools/stress/` and PRD §7.3 walks every category against them to find
**thirteen constructs the library needs and the vocabulary cannot express** (one since struck),
plus **five more E4 "does not exit until they are" in**. §7.3 states that list is normative for
this deliverable and **gates it**, because both renderers read these directives and a late
addition re-authors every design that predates it.

**Approach:** Settle the contract and ship it as data plus a document, with no renderer. Three
things land: `docs/section-authoring.md` — the registry entry format, the `design.json` /
`content.json` shapes and every directive with a worked example; the contract as TypeScript in
`@inflozo/library` — the entry type, the closed directive set and the allow-lists, which AD-34
already says are "data in `packages/library`" shared with the compile gate; and a validator that
refuses anything outside it. The control is the eight executed archetypes in
`tools/stress/sections.js`: they must validate clean, or the new grammar does not describe the
thing that was proven to work.

## Boundaries & Constraints

**Always:**
- **The vocabulary is settled here, completely** — PRD §7.3's gap table (rows 1–7 and 9–14; row 8
  is struck by R-1) and its five exit constructs each get a named directive with a worked example.
  A construct left for a later story re-authors every design written before it.
- **The proven eight are carried forward, not redesigned.** `data-prop`, `data-prop-attr`,
  `data-bind`, `data-bind-attr`, `data-empty`, `data-repeat`, `data-repeat-limit`, `data-partial`
  keep their executed names and grammar (`tools/stress/compile.js`). New constructs extend that
  vocabulary in the same shape.
- **The grammar is validated, never interpolated** (AD-36). A binding path matches the path
  grammar; a helper argument is checked against that helper's own rule; a bound attribute name is
  on the allow-list; a URL scheme is allow-listed. These four move from `tools/stress/compile.js`
  into `packages/library` unchanged in behaviour, so 4.2's emitters inherit one copy.
- **`contentSchema` is the category's union; `controlSchema` and `quickControls[]` are per design**
  (FR-G3, FR-F7), both generated from the authored source and never hand-maintained twice.
  `quickControls[]` is **recovered mechanically** as the first 3–5 of the design's own control
  list, read from the design and never from the category union — so a hand-written
  `quickControls` in a `design.json` is a validation failure, not an override.
- **The category's union is the widest a prop ever reaches** — the owner's ruling on Question 1
  (option 1, 2026-09-11): each kind of section keeps its own words. Two categories that ask for the
  same thing each carry their own prop; there is no shared prop, no shared namespace and no
  cross-category carry, so editing a footer can never rewrite a section on another page.
- **`bindingContext` has no `page` value** and takes only `none · post · posts · tag · tags ·
  author · authors · tiers · error · private`. **`compileTarget` is a refusal, not a hint** (R-7):
  a design declaring pagination is restricted to paginated targets, and one declaring a `{{#get}}`
  excludes `error.hbs` and `private.hbs`.
- **A prop declares which inline binding tokens it accepts, and nothing else in braces is
  substituted** (R-27) — an allow-list by construction, never a general substitution pass.
- **`css` is plain CSS consuming Style Pack custom properties only**, explicitly outside any
  Tailwind processing; an inline `style` may set a single CSS custom property from bound data and
  nothing else (AD-3's one carve-out).
- **Propagate, never localise** (standing rule 3): AD-2's `design.json` field list and AD-34's
  canonical directive set both go stale the moment this story lands, and both are amended in it.
- Every commit runs `python3 tools/doc-audit.py --check` first and pushes green (R-81).

**Ask First:**
- Question 1 is ruled and nothing else is outstanding.
- Any construct in §7.3's list that cannot be expressed without contradicting an approved decision
  — flag it, do not invent a decision the owner never made (standing rule 6). It goes under
  `## Questions for the owner` in R-83 shape and the run stops there.

**Never:**
- **No renderer and no emitter.** Story 4.2 owns the two emitters and their node-by-node agreement;
  this story ships the grammar they read and not one line that renders it.
- **No control engine, no sidebar, no binding matrix, no `core`, no Baseline tooling, no string
  catalog, no pilots, no render matrix** — 4.5, 4.6, 4.7, 4.8, 4.9, 4.10 and 4.11 in turn. Where
  this story names a directive those stories implement (`{{t}}`, member visibility, the Data
  group), it names it and stops.
- **No design is authored.** The library's own designs belong to E9–E11. The one markup file this
  story writes is a **fixture** that exercises every directive, lives outside `designs/`, and
  carries no category id, so it can never be mistaken for a library entry.
- **No cross-category shared prop, and no shared-prop namespace to hang one on.** It is the option
  the owner did not take — do not reintroduce it as a convenience when `email*` or `newsletter*`
  turns up in a second category's union.
- No new runtime dependency. The validator is a lexical check over directive tokens and their
  values; the tree-aware parse is 4.2's, with 4.2's parser.
- Never edit the design export (R-74), and never hand-edit a generated file.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| The executed control | the eight archetypes in `tools/stress/sections.js` | every one validates clean | none — a failure here means the new grammar does not describe what was proven |
| Unknown directive | `<p data-bound="title">` | refused, naming the closed set | validation error citing the directive set in `packages/library` |
| Guard on a helper argument | `data-bind="published_at\|date:YYYY" data-empty="hide"` | the guard is derived from `published_at` | the round-4 defect: a guard on `YYYY` renders nothing and loses the content silently |
| Non-allow-listed bound attribute | `data-bind-attr="onload:featureImage"` | refused | AD-36 (3) — `style` and every `on*` are absent from the allow-list |
| Bad binding path | `data-bind='title"}}{{evil'` | refused | AD-36 (2) — the path grammar rejects braces, quotes, whitespace and backslash |
| Unknown helper or bad argument | `data-bind="x\|img_url:'; drop"` | refused | AD-36 (2) — the argument is validated against the helper's own rule, never interpolated |
| Unsafe URL scheme | a prop holding `javascript:alert(1)` in an `href` | reduced to `#` — inert and visible | never silently dropped; `java\nscript:` is rejected, not repaired |
| `bindingContext: page` | a `design.json` declaring it | refused, naming the ten legal values | FR-G3 — a page and a post are one resource |
| Illegal `compileTarget` | a design declaring pagination with `error.hbs` in its targets | refused at validation | R-7 — the refusal is at compile, not a runtime guard |
| Hand-written `quickControls` | `design.json` carrying its own array | refused | FR-G3 — the array is recovered mechanically from `controlSchema` |
| Un-allow-listed inline token | a prop's text carrying `{unknownToken}` | stays literal text | R-27 — an allow-list by construction |
| Inline `style` beyond the carve-out | `style="color: red"` in a design's markup | refused | AD-3 — only a single `--custom-property` assignment is legal |
| A control attribute on the root that no control declares | `data-cols="3"` absent from `controlSchema` | refused, both directions | AD-3 — the stylesheet must never select on an attribute the design does not own |

</frozen-after-approval>

## Code Map

- `tools/stress/sections.js` -- **the control.** Eight annotated-HTML archetypes, mean 39.1 elements
  and 21.0 directives each. Universal control attributes at `:16-20` (`data-bg`, `data-spacing`,
  `data-divider`); `data-prop-attr2` at the header archetype is the wart to retire.
- `tools/stress/compile.js` -- **the executed grammar, and the source to lift from.** `safeUrl`
  `:93`, `PATH_RE` `:110`, `HELPERS` `:111-115`, `BINDABLE_ATTRS` `:118-122`, `URL_ATTRS` `:123`,
  `assertBindableAttr` `:125`, `bindExpr` `:134`, `emitBindings` `:153`, `wrapGuard` `:186` (and the
  round-4 comment above it that names the silent-loss defect), `applyProps` `:200`, deepest-first
  repeats `:240`. Outside the pnpm workspace, unlinted, not run by `pnpm test`.
- `packages/library/package.json` -- the whole package: `name`, `version`, `private`, `type`. No
  `exports`, no `scripts`, no `tsconfig.json`, no `src/`. **DW-1 lives here.**
- `packages/section-runtime/package.json` `:6-19` -- the shape to copy for library's manifest:
  `"exports": { ".": "./src/index.ts" }`, `typecheck`/`test` scripts, `@types/node` + `typescript`
  devDeps. Same in `theme-compiler` and `ghost-shim`; all three already declare
  `"@inflozo/library": "workspace:*"`, which resolves the moment library has an `exports`.
- `packages/section-runtime/src/index.test.ts` -- the test idiom: `node:test` + `node:assert/strict`,
  relative import with an explicit `.ts` extension.
- `eslint.config.js` `:17-18` -- `CORE` is derived from the directory; `NOT_CORE =
  ['packages/library/**']` excludes the whole package from AD-1's purity bans because it was data
  only. **The moment library carries source, that exclusion is a hole** and must narrow to the data
  directories, whose `behaviour.js` legitimately reaches `document`.
- `tsconfig.base.json` -- `strict`, `erasableSyntaxOnly` (so no `enum`, no `namespace`),
  `allowImportingTsExtensions`, `nodenext`, `lib: ["es2024"]` (no DOM), `verbatimModuleSyntax`.
- `tools/doc-audit.py` `:975` -- `BASES` walks `planning-artifacts`, `tools`, `docs`, `_bmad/custom`
  and **not** `packages/`. A new file under `docs/` needs one `DOCS` tuple; `:780-786` is the shape.
- `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md` `:282` FR-G3 (the entry
  format), `:276` FR-F7 (the generation clause), `:518-590` §7.3 — **`:532` the 13-row gap table and
  `:577-586` the five exit constructs, which are this story's normative scope**.
- `.../architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` `:98-102` AD-2 (the file
  shape — amend), `:104` AD-3 (control-as-attribute, the inline-`style` carve-out), `:110` AD-4,
  `:118` AD-5, `:361-367` AD-34 (**the leak assertion naming the canonical directive set — amend**,
  and the sentence "the rules are data in `packages/library`" that places this story's output),
  `:369` AD-35 (`provisional` in `design.json`), `:375-385` AD-36's four sinks, `:410` the
  `{categoryId}/{n}` identity, `:415` the generation clause restated.
- `.../prds/prd-Inflozo-2026-08-17/sections-inventory.md` `:74-91` -- the normative per-category
  `bindingContext` / `compileTarget` declarations, already written as **sets** ("`bindingContext:
  tags` (+ `posts` on the designs that show them)"), which is what settles the field's type.
- `.../reconcile-designs-decisions.md` -- R-7 (`:82`, block `:385-394`), R-27 (`:102`, block
  `:756-768`), R-8 (`:83`, the refused hand-off construct), R-19 (`:94`, gap row 14), R-1 (`:76`,
  row 8 struck), R-16 (`:91`, the category unions are not regenerated — the input this story's
  generator will one day read).
- `.../reconcile-designs.md` `:501`, `:753`, `:754`, `:811` -- the FR-G3 asks marked "**no owner;
  needs one**". Two are answered by reading normative documents (below); the third — cross-category
  shared props — is **ruled by the owner on 2026-09-11** and closes with this story, refused.
- `tools/export-roster.py` -- every live category and design as JSON (`n`, `name`, `tuple`,
  `modules`, `descriptor`). The identity source a later story's registry check reads; not consumed
  here, because no design is authored here.
- `_bmad-output/implementation-artifacts/deferred-work.md` `:24` DW-1, `:38` DW-2, `~:2457` DW-87.

## Tasks & Acceptance

**Execution:**

- [x] `docs/section-authoring.md` -- **write the deliverable.** Four parts: (1) the registry entry
      format, field by field, and the statement — absent from every document today — that an entry
      is **assembled** from the design's directory path, its `design.json`, its category's
      `content.json` and the four files, so "registry entry" and "`design.json`" are not the same
      list; (2) the `design.json` and `content.json` shapes with a complete worked example of each,
      **carrying R-102 as a stated rule of the content model** — the category's union is the widest
      a prop reaches, and this is the one ⬜ left on that ruling's propagation list in
      `reconcile-designs-decisions.md` § A23, to be ticked there when it lands;
      (3) the directive vocabulary — every directive, its grammar, what each emitter does with it,
      and a worked example; (4) the refusals, each with the reason. Carry the zero-width-entity
      warning the design export's kits use, because a literal `{{ … }}` in an example renders empty.
- [x] `tools/doc-audit.py` -- one `DOCS` tuple for `docs/section-authoring.md`, status `live`, then
      `--generate` and `--check` twice.
- [x] `packages/library/package.json` -- add `exports`, `typecheck` and `test` scripts and the two
      devDeps, matching the other three packages. **Closes DW-1** — the three existing `workspace:*`
      arrows resolve, and `packages/section-runtime/src/index.test.ts` proves it with an import that
      crosses the boundary.
- [x] `packages/library/tsconfig.json` -- the same four lines the other packages carry.
- [x] `packages/library/src/vocabulary.ts` -- the contract as data, which is where AD-34 says it
      belongs: the closed directive set, the bindable-attribute allow-list and its URL subset, the
      helper table with each helper's argument rule, the binding-path grammar, the safe-scheme rule,
      the `bindingContext` values, the `compileTarget` values and their refusal rules. Behaviour
      lifted unchanged from `tools/stress/compile.js`; the new directives added in the same shape.
- [x] `packages/library/src/registry.ts` -- the `SectionRegistryEntry`, `DesignJson` and
      `CategoryContent` types, plus the function that assembles an entry from a directory,
      a `design.json` and a `content.json` — including the mechanical `quickControls[]` recovery
      and the generation of `controlSchema` and `contentSchema` from the authored source. Plain
      `type` aliases and `const` objects; `erasableSyntaxOnly` forbids `enum`.
- [x] `packages/library/src/validate.ts` -- the validator, returning a list of failures rather than
      throwing on the first: every directive in the closed set, every value parsing under its
      grammar, every bound attribute allow-listed, every guard derived from a bound field, every
      inline token declared by its prop, every control attribute on the root matching
      `controlSchema` in both directions, the `style` carve-out, the `bindingContext` /
      `compileTarget` rules, and no `quickControls` hand-written.
- [x] `packages/library/src/index.ts` -- re-export the three modules; this is the entry `exports`
      points at.
- [x] `packages/library/fixtures/reference-design/` -- `index.html`, `style.css` and `design.json`
      exercising **every** directive once, plus `packages/library/fixtures/content.json`. Outside
      `designs/` and carrying no category id, so it can never be read as a library design.
- [x] `packages/library/src/validate.test.ts` -- the runnable check: the fixture validates clean, and
      every refusal in the I/O matrix fires — each asserted with its hostile case refused **and** its
      legitimate neighbour still accepted, so a validator that refuses everything cannot pass
      (AD-36's pattern, standing rule 2). Every input is an in-memory string: **a test in a core
      package cannot read a file**, because `node:fs` is banned there and the test-file exemption
      gives back only `node:test` and `node:assert` (`eslint.config.js:30-32`).
- [x] `tools/stress/sections.js` · `tools/stress/compile.js` -- retire `data-prop-attr2`: the one
      archetype that uses it takes the list form, and `compile.js:208`'s two-name loop drops to one.
      **Then re-run the harness's own gates** — the agreement test, the AD-36 test and the two-major
      gscan gate — and record that each returned what it returned before. Editing a control without
      re-running it turns the control into an assertion.
- [x] `tools/stress/test-vocabulary.mjs` + its `tools/doc-audit.py` catalogue row -- **the control**,
      placed where the thing it controls lives: it imports `sections.js`'s eight archetypes and the
      new validator and asserts every archetype passes. It belongs here and not in the package for
      the reason above, and it joins the harness line CLAUDE.md already runs as a gate
      (`node test-ad36.js && node test-renderer-agreement.js`). `tools/stress/` is CommonJS while the
      packages are ESM, which is why the new file is `.mjs`.
- [x] `eslint.config.js` -- narrow `NOT_CORE` from `packages/library/**` to the data directories
      (`designs/`, `fixtures/`), so the new source is purity-linted while a design's `behaviour.js`,
      which legitimately reaches `document`, is not.
- [x] `.../ARCHITECTURE-SPINE.md` -- amend **AD-2**'s Rule (the assembly statement, and AD-35's
      `provisional` marker, which AD-2's field list omits) and **AD-34**'s leak assertion (the
      canonical directive set is now this story's set, not the seven names it lists). Grep the
      repository for the old seven-name set afterwards (standing rule 7).
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close **DW-1** with
      `status: done <date>` and a `resolution:` line. Leave DW-2 open (nothing in `apps/web` reads
      the library yet) and DW-87 open with a note that its blocking half — `ghostCompat` having no
      definition — is closed, while the library still holds no design to check.

**Acceptance Criteria:**

- Given PRD §7.3's gap table and its five exit constructs, when `docs/section-authoring.md` is read,
  then every one of them has a named directive and a worked example, and the struck row 8 is named
  as struck rather than silently absent.
- Given the eight archetypes in `tools/stress/sections.js`, when `node test-vocabulary.mjs` runs the
  validator over them, then every one passes — the grammar describes the thing that was executed.
- Given the one archetype that uses `data-prop-attr2`, when it is rewritten to the list form, then
  `test-renderer-agreement.js`, `test-ad36.js` and the two-major gscan gate all return what they
  returned before the rewrite — a control that was edited is only a control if it is re-run
  (standing rule 2).
- Given `data-bind="published_at|date:YYYY"` with `data-empty="hide"`, when the design is validated,
  then the guard is required to be on `published_at`; a guard on the helper's argument is refused
  by name, because that defect renders nothing and loses the content permanently.
- Given a `design.json` that hand-writes `quickControls[]`, when it is validated, then it is
  refused — the array is the first 3–5 of the design's own control list and is recovered, never
  authored.
- Given a `design.json` declaring `bindingContext: page`, when it is validated, then it is refused
  and the ten legal values are named.
- Given a design declaring pagination and listing `error.hbs` among its targets, when it is
  validated, then it is refused (R-7).
- Given `import { … } from '@inflozo/library'` in another package, when `pnpm check` runs, then it
  resolves — the entry point exists and a test crosses the boundary (DW-1).
- Given `pnpm lint`, when it runs over `packages/library/src/`, then AD-1's purity bans apply to it,
  and they do not apply to a design's `behaviour.js`.
- Given `python3 tools/doc-audit.py --check`, when it runs twice, then it passes both times.
- This story builds **no surface**. `EXPERIENCE.md`'s Information Architecture names no frame for a
  registry, a schema or a design source, and epics.md sets its owner test to none — so there is no
  "matches the frame" criterion and no `## Owner's manual test`. R-74's other half still binds: the
  design export is read-only.

## Design Notes

**The vocabulary, settled.** The eight proven directives keep their executed names. The table below
is the answer to §7.3's gap list and its five exit constructs; `docs/section-authoring.md` expands
each into a worked example. Two shapes recur and are deliberate: a query, a filter or an order is
**declared in `design.json` and referenced by key from the markup**, never written into an
attribute, so AD-36's "validated, never interpolated" holds by construction; and any value mixing
static and bound text uses R-27's per-prop token allow-list, never a general substitution pass.

| §7.3 | Construct | Directive |
|---|---|---|
| 1 | repeat over a **content-prop** array, baked at compile as N blocks | `data-items="path"` — distinct from `data-repeat`, which names a Ghost source |
| 2 | `{{#get}}` with filter / limit / order | `data-repeat="<key>"` where the key resolves in `design.json`'s `dataBindings` to `{ source, filter?, limit?, order? }`, each validated |
| 3 | two-armed conditional | `data-if="path"` + `data-else` on the sibling (`data-empty` stays the one-armed guard) |
| 4 | member state over four closed values | `data-members="everyone \| anonymous \| free \| paid"` |
| 5 | positional helpers | `data-when="first \| last \| even \| odd"`, `data-index` for the printed number |
| 6 | pagination | `data-pagination="prev \| next \| numbers"` |
| 7 | nested repeats | no new directive — deepest-first ordering, already executed |
| 8 | *group-by* | **struck (R-1)** — it is the `group-headings` behaviour module, not a directive |
| 9 | bare-helper binding (no path) | `data-helper="<closed list>"` — `content`, `comments`, `navigation`, `total_members`, `statusCode`, … |
| 10 | compile-target-conditional wrapper | `data-target="page.hbs"` on the subtree |
| 11 | mixed literal-and-bound attribute value | `data-bind-attr` gains R-27's `{token}` form |
| 12 | bound value into an inline custom property | `data-bind-style="--tag-accent:accent_color"` — AD-3's carve-out made machine-checkable by construction, since the directive can write nothing else |
| 13 | static-and-bound text in one node | `data-text="Read by {count} readers"` with the same token allow-list |
| 14 | adjacency as a compile-time **input** | `data-needs="<closed list>"` — the compiler answers from the placement list; there is no runtime lookup (AD-37, R-8) |
| exit 3 | chrome strings | `data-t="key"`, `data-t-attr="attr:key"`; JS-written strings emit `data-i18n-*` (4.9 owns the catalog) |
| exit 4 | `srcset` / `sizes` | `data-bind-srcset="path\|img_url"`, since one expression per attribute is not enough |
| exit 5 | control → `data-{control}` on the root | not a new directive: the root's control attributes are generated from `controlSchema`, and the validator asserts the two match in both directions |

Exit constructs 1 and 2 are rows 2 and 4 above.

**Three routine calls, made rather than asked.**

1. **`bindingContext` and `compileTarget` are sets, not scalars.** `reconcile-designs.md` marks
   "a `bindingContext` that varies with a source switch" as needing an owner, but
   `sections-inventory.md` already declares them as sets in its own normative prose —
   "`bindingContext: tags` (+ `posts` on the designs that show them)" — and FR-D12/D13 filter by
   intersection, which a set answers and a scalar cannot. Reading an approved document is not a
   decision. Per-design declaration is likewise already allowed by FR-G3 ("per category, or per
   design where a category's designs differ").
2. **`data-prop-attr2` is retired.** It was never normative — FR-G3 and §7.3 name eight directives
   and it is not among them; it exists in the harness only because an HTML attribute cannot repeat.
   `data-prop-attr` and `data-bind-attr` take a semicolon-separated list instead
   (`data-prop-attr="href:cta.url;title:cta.title"`), which removes a numbered wart from a
   vocabulary 466 designs will be written in. `data-module`, the harness's other extra, **stays** —
   it declares which behaviour module a subtree belongs to, which is FR-G3's `js?` field in markup;
   4.7 owns the registry of modules it names.
3. **The document lives in `docs/`, not beside the data.** `docs/` is walked by the documentation
   gate and surfaced in `INDEX.md`, which is how anything in this project is found; a `.md` under
   `packages/` would trip no gate and appear in no index. It costs one catalogue row.

**Why the validator is lexical.** Its job here is to refuse an unknown directive and a malformed
value — a token-level check a regex over each tag's attribute run answers in a few dozen lines.
The tree-aware questions (nesting depth, a `data-else` with no `data-if` sibling, repeat
containment) need a real parse, and 4.2 brings a real parser for the emitters. Marked with a
`ponytail:` comment naming that ceiling, so the upgrade path is written down rather than
rediscovered.

**What this story deliberately leaves open.** R-16 records that the per-category `Content:` /
`Controls:` / `Data:` union lines are not regenerated, so the input `content.json` will one day be
generated from is itself stale. That is a design-export question, not a format question, and the
first category story owns it — the format is complete without it.

## Questions for the owner

### Question 1 — you type words into one kind of section. Should a different kind of section already know them?

Two different kinds of section can ask for the same thing. A **Newsletter** section has a signup
box with a heading. A **Footer** can also carry a signup box, with its own heading. So can a **CTA
banner**. Right now the plan is that each kind of section keeps its own words, and I need to know
whether that is what you want, because it is the kind of thing that is very hard to change later.

**Example.** Priya puts a Newsletter section on her home page and types the heading *"Join 12,000
readers."* A week later she adds a footer to her site, and the footer has a signup box in it too.

1. **Each section keeps its own words.** **(RECOMMENDED)** The footer's signup starts with its own
   suggested text and Priya types whatever she wants there — maybe just *"Get the weekly issue."*
   because a footer is smaller. Changing one never changes the other. This is how the library is
   already planned: each family of sections carries its own set of fields.
2. **They share one set of words.** Priya types the heading once and every signup box on her whole
   site shows it. Changing it in the footer changes it in the Newsletter section too, and on every
   page.

**Why I recommend 1.** Option 2 means editing the footer silently rewrites something on another
page, which is the kind of surprise people do not forgive. And the two places usually *want* to say
different things — a footer signup is terser than a section built to sell the newsletter. If Priya
does want the same words in both, she types them twice; if she does not, option 2 gives her no way
to separate them at all.

**Ruled: option 1 (owner, 2026-09-11).** *"Each section keeps its own words."* The spec was already
written to this option, so nothing in the build moves. What the ruling settles is the other
direction: `contentSchema` stays **the category's union and nothing wider**, and a cross-category
shared prop — one `newsletter.heading` or `email.label` reaching across category boundaries — is
now a thing this story must **not** add, and a later story must not add either without coming back
here. The three FR-G3 asks in `reconcile-designs.md` that ask for cross-category shared props
(`email*` ×5 with A3-4 at `:501`, `newsletter*` at `:754`, summarised at `:811`) are answered by
this ruling and close with it; a design in two categories that wants the same words carries the
prop twice, once per category union.

## Verification

This story touches **no external service** — it ships a document, a set of types and a validator, and
adds nothing that reads Ghost, Supabase, Resend, Dodo or Vercel. R-82's real-infrastructure rule is
satisfied by there being no real infrastructure in scope; the Review phase says so explicitly rather
than silently skipping it, and re-runs the sheet below.

**Commands:**
- `pnpm check` -- expected: lint, typecheck and test green across every package, `packages/library`
  now among them (it has scripts for the first time, so `pnpm -r` stops skipping it).
- `node --test 'src/**/*.test.ts'` in `packages/library` -- expected: the fixture passes and every
  refusal in the I/O matrix fires with its legitimate neighbour still accepted.
- `python3 tools/doc-audit.py --check` -- expected: `documentation gate: PASS`, run twice (the
  sub-tools regenerate on a first failure).
- `cd tools/stress && node test-ad36.js && node test-renderer-agreement.js && node
  test-vocabulary.mjs` -- expected: all three green, and the first two **unchanged**. The harness is
  the control this story's grammar is lifted from; if either of the existing two moves, the lift
  changed behaviour it was supposed to preserve. The third is new: all eight archetypes validate.
- `grep -rnF 'data-repeat|bind|bind-attr|prop|prop-attr|partial|empty' --exclude-dir=node_modules
  --exclude-dir=.git .` -- expected: exactly one hit, this line. It returns two today — AD-34 `:367`
  and this line — and AD-34 is the one the story amends (standing rule 7: the old seven-name list is
  exactly the thing a propagation list misses).

**Recorded — the Dev run, 2026-09-11, Node 24.18.1.** The harness's own gates returned exactly what
they returned before the `data-prop-attr2` rewrite, which is what makes the control still a control
(standing rule 2). Captured before the edit and again after:

| Gate | Before | After |
|---|---|---|
| `node test-ad36.js` | 13 checks passed | 13 checks passed |
| `node test-renderer-agreement.js` | 8 checks passed | 8 checks passed |
| `node build.js` — FR-J17 proxy | 103/103 .hbs · 2380 elements · 201 links / 215 images / 86 headings · 943 CSS declarations | identical |
| `node build.js` — AD-34 leak assertions | clean | clean |
| `node gate.js theme` | Ghost 5 via gscan 4.49.7: 0/0 · Ghost 6 via gscan 6.4.2: 0/0 | identical |
| `node test-vocabulary.mjs` | — (new) | 13 checks passed; all eight archetypes and the on-disk fixture validate clean |
| `pnpm check` | — | exit 0, `packages/library` among the packages for the first time (26 new tests) |
| `python3 tools/doc-audit.py --check` | — | PASS, twice |
| the standing-rule-7 grep for the old seven-name directive list | 2 hits (AD-34 and the spec's own line) | 1 hit (the spec's own line) |

**Manual checks:**
- `docs/section-authoring.md` opens with every §7.3 construct present — walk the gap table row by
  row against the document, including the struck row 8, and the five exit constructs.
- `packages/library/fixtures/reference-design/index.html` opens directly in a browser and renders as
  plain HTML, which is most of why annotated HTML won (§7.3).

## Spec Change Log
