---
title: 'Story 5.5 — The template switcher and the synthesised templates'
type: 'feature'
created: '2026-09-18'
status: 'in-review'
owner_test: pending
baseline_commit: '74308a3ff3deabf2b53dabf90df10c52c0ba5cf6'
review_loop_iteration: 1
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

A new control in the middle of the top bar lets you move between every kind of page your site will have — Home, Post,
Page, Tag archive, Author archive, 404 and the three membership pages — without leaving the editor or reloading it.
A page kind you have never touched no longer opens blank: it opens **already built** from Inflozo's standard recipe for
that kind of page, and says so in the Template menu — a hollow dot and the word "Auto-generated" beside its row — and
once more at the top of the list on the left, where a note reads "Auto-generated — edit anything to make it yours".
A page that is never auto-built, like Signup, carries a crossed-out circle and the word "Empty" instead. The moment you
change anything the note goes and the page is yours; take every section off again and it goes back to the standard
recipe, note and all.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The editor can reach six canvases but only by typing a URL — there is no control anywhere that changes
canvas (`editor.tsx` has no `useRouter`), so the promise "nothing ships that I could not have looked at first" has no
surface. Worse, a canvas with no `project_templates` row renders **nothing**: Story 5.1 deliberately left synthesis to
this story (`spec-5-1…md:79`, "nothing is invented (synthesis is 5.5's)"), so today a project would ship a Tag archive,
an Author archive and a 404 the user has never seen and could not see.

**Approach:** Build FR-D6's two halves together. Add D5b's switcher to the top bar as the editor's **first soft
navigation** between canvases, offering every canvas the project can have. Add `synthesize` as **one core function** in
`packages/section-runtime` (AD-27(d) — Epic 7's compiler calls the same one at Story 7.3), reading the normative
Synthesis Defaults, so an untouched canvas renders its default stack as the starting canvas; mark that state with D5a's
sentence in both places; and materialise the stack into the in-memory doc on the first edit.
**Amended by R-130 (the owner, 2026-09-18, at his test): the marker has ONE place, the head of Layers — the top bar's
chip is removed, because the switcher's own row already carries the dot and the word.**

## Boundaries & Constraints

**Always:**
- **Synthesis is one core function, never two.** It lives in `packages/section-runtime`, is pure, takes the library and
  a template file, and returns instances. The app calls it; Story 7.3's compiler will call the same one (AD-27(d)).
- **Absence is the signal (AD-22).** Untouched = no `project_templates` row *or* a doc with zero instances. **Nothing in
  this story writes a row** — there is no persistence until 5.8. Removing every section returns a canvas to untouched
  and the default stack and both markers come back; **hiding every section does not** (FR-D5).
- **Seven files are synthesisable; six have canvases.** `home.hbs`, `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`,
  `author.hbs`, `error.hbs` (`sections-inventory.md:786`). **`index.hbs` has no canvas, now and permanently
  (R-127)** — `/projects/<id>/index` stays a 404 and Story 5.1's reserved-segment row is settled.
- **What `index.hbs` is made from (R-127).** Home designed → that doc **from its designated main feed onward**, in
  order, everything above it dropped. Home designed with **no** designated main feed → the Synthesis Default stack,
  because `index.hbs` is always compiled and must never be emitted empty. Home untouched → unchanged
  (`sections-inventory.md:804-806`: the same stack into both). It is **one function beside `synthesize`**, because
  Story 7.3's compiler and Story 5.16's page-2 preview both call it and neither may re-derive it (AD-27(d)).
- **The switcher ships without "+ New template" and without the `FROM THE ROUTES MANAGER` heading (R-128)** — R-118's
  rule, second application: a control arrives with the story that makes it work. Story 7.16 adds both. Nothing greyed,
  nothing captioned.
- **The three membership canvases are `custom-signup.hbs` ("Signup"), `custom-signin.hbs` ("Signin") and
  `custom-member-home.hbs` ("Member home") (R-129)** — the filename is frozen public API and Ghost derives the label
  from it (`prd.md:636`). Their stored keys are `custom:custom-{name}.hbs`; their URL segments are `custom-{name}`.
- **Never synthesised:** the three membership canvases, Private, and every custom template. They open **empty**
  (FR-D6, `sections-inventory.md:785`).
- **The Synthesis Defaults are normative and are not restated here.** The stacks, their control values and the
  main-feed rule come from `sections-inventory.md § Synthesis Defaults` (:778-867); the table in code cites it and
  changing a stack means changing that document first (its own Invariant 1).
- **A default row the library cannot place today is dropped with its reason, never silently and never thrown.**
  `editorData`'s loud refusals are for *stored* docs — a user's data — and stay loud. A synthesised row is dropped when
  the library holds no such design, or holds it with a `compileTarget` that excludes this file. The dropped set is
  **derived** from the library, so it empties itself as Epics 9 and 10 land.
- **The switcher matches D5b and the marker matches D5a** (R-74), the two rows R-128 defers excepted. The marker's
  sentence is exactly
  "Auto-generated — edit anything to make it yours" **in its one place, the head of Layers (R-130 — the top bar's chip
  is removed)**, it is app copy and never a theme string
  (`prd.md:1337`), and it carries **no keyboard shortcut**, deliberately (FR-D11).
- **The word is not optional** (D5b): an untouched row carries a hollow dot **and** the word "Auto-generated"; a
  designed row carries a filled dot and no word; **a row that is never auto-built carries Tabler's `circle-off` glyph
  and the word "Empty" (R-130)**. A shape alone is the same failure as a colour alone.
- **The Membership group's chevron is a control and it works** (the owner's test, 2026-09-18): the heading is a
  button, `aria-expanded`, and a collapsed group's rows are **not rendered** rather than hidden — a hidden button is
  still one `arrowKeys` would step onto.
- **Every count is derived.** The site-wide confirm's template count, the Layers page count and the dropped-row set all
  derive from the canvases and the library, never from a literal.
- **R-98 holds:** the switcher row that starts a navigation says so and goes `aria-disabled`/`aria-busy` until the new
  canvas paints; the route keeps the editor's existing Suspense skeleton (there is deliberately no `loading.tsx` under
  `projects/` — `layout.tsx:12-17`).
- **No migration.** `isMainFeed` lives inside `project_templates.doc` (`jsonb`) and this story writes no row, so
  **there is no Schema phase** (R-99). ~~The membership keys already pass the `template_key_shape` CHECK~~ —
  **false, executed at the review (2026-09-18):** production refuses all three, because the stored pattern carries
  two backslashes. Latent until a story saves; DW-193 gives Story 5.8 the Schema phase that fixes it.

**Ask First:** anything that would change a **Synthesis Default stack** — that means changing
`sections-inventory.md` first, which is its own Invariant 1 and not a code decision. Any further departure from D5b or
D5a beyond R-128's two absent rows. Any fourth membership canvas: R-129 fixes the group at the three FR-D6 names, and
Subscribe and Membership are ordinary custom page templates arriving with the Routes Manager (Story 7.16).

**Never:**
- The Routes Manager, custom-template creation and its naming/collision rules (Story 7.16, FR-I2/FR-I3). The custom
  group is empty by construction: `custom_templates` has no writer.
- The main-feed **control, marker and reassignment** — Story 5.19 owns the lifecycle. This story only sets the flag the
  Synthesis Defaults call for.
- Page-2 preview (5.16), the post-deploy binding checklist (FR-I6, Epic 7), compile-time synthesis and the emptying
  rules (7.3), the Section Picker (5.10), persistence and undo (5.8).
- Any new A30 or A31 design — the library holds the five provisional pilots and Epics 9/10 author the rest.
- Any second interface vocabulary: the switcher is built from the Kit's menu, not a new popover.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Untouched canvas opens | `tag`, no row | the Synthesis Default stack renders as the starting canvas; the Layers marker shows and the switcher's row is hollow + "Auto-generated" (R-130: no top-bar chip); Layers' page group counts the synthesised sections | N/A |
| Designed canvas opens | `home`, 3 instances | the stored stack; no marker anywhere | N/A |
| Default row the library cannot place | `page.hbs` row 1 is A24 #1, whose pilot declares `compileTarget: ['post.hbs']` | the row is dropped and reported in `dropped` with the reason | dropped, never thrown — the loud refusal is for stored docs |
| Zero-row synthesis | `error`, A31 #1 not in the library | the canvas shows the site-wide sections and nothing else, **and is still marked auto-generated** | N/A |
| The group's chevron | the switcher is open | pressing the Membership heading collapses the group — its three rows leave the menu — and pressing it again brings them back | N/A |
| First edit materialises | rename a synthesised section | the stack becomes the canvas's in-memory doc; the marker goes; the switcher row's dot fills | N/A |
| Emptying returns to untouched | delete every section of a materialised canvas | the default stack re-renders and the marker returns (AD-22) | N/A |
| Hiding is not emptying | hide every section | still designed: no re-synthesis, no marker, the canvas draws empty (FR-D5) | N/A |
| Switcher navigates | press "Tag" | a push to `/projects/<id>/tag`; the editor stays mounted; the selection and the Controls panel clear (DW-176) | N/A |
| Membership canvas | press Signup | opens **empty** — no synthesis, no sections, no marker; its switcher row is `circle-off` + "Empty" (R-130) | N/A |
| Private | no linked site, or a linked site that is not private | the row is **absent, not greyed**, and its segment 404s | N/A |
| `index` segment | `/projects/<id>/index` | 404, unchanged from 5.1 | N/A |
| Current canvas | the switcher is open on `tag` | the Tag row takes the check; pressing it closes the menu and navigates nowhere | N/A |
| The menu's last row | any project | the rows end at 404 (and Private when called for). **No "+ New template", no Routes Manager heading** (R-128) | N/A |
| `index.hbs` from a designed Home | a Home doc with a designated main feed | the stack from that instance onward, in order; everything above it dropped (R-127) | N/A |
| `index.hbs` with no main feed | the pilot project's Home (no instance carries `isMainFeed`) | the Synthesis Default stack | never empty — `index.hbs` is always compiled (FR-I1) |
| `index.hbs` from an untouched Home | no `home` row | the same synthesised stack as `home.hbs` (`sections-inventory.md:804-806`) | N/A |

</frozen-after-approval>

## Code Map

- **The core function (new)**
  - `packages/section-runtime/src/synthesize.ts` — **new.** The Synthesis Defaults as data plus `synthesize(file,
    library)`. AD-27(d) makes this the one implementation; the spine's `:530` mermaid puts `synthesize` as the first
    node **inside** the pure core, so it reads no clock, no I/O and no app state. Export from
    `packages/section-runtime/src/index.ts` (`doc-schema` is re-exported at `:91`; follow that shape).
  - `packages/section-runtime/src/doc-schema.ts` — `instanceSchema` (:24-45) is a `z.strictObject`, so `isMainFeed`
    is added **here**, `z.boolean().default(false)`, in the same change as its writer (the file's header rule at
    `:5-7`). Never required: every stored doc lacks it. `z.config({ jitless: true })` at `:19` stays the first
    statement — a new client-side schema anywhere must come after it (Story 5.1's CSP finding).
  - `packages/section-runtime/src/doc-edit.ts` — `isDesigned` (:93, `doc.instances.length > 0`) is AD-22's untouched
    test and already exists, tested at `doc-edit.test.ts:85-91` ("all hidden is still designed"). Reuse it; do not
    write a second one.
  - `packages/library/src/registry.ts` — `SectionRegistryEntry` carries `compileTarget`; `pilot(id)` throws for a
    design the library does not hold. Synthesis asks the library the same two questions `editorData` asks
    (`read.ts:84-90`) and **drops** instead of throwing.
- **The canvases and the URL scheme**
  - `apps/web/lib/editor.ts` (50 lines) — `CANVASES` (:9-22) is six entries of `{ file, label }` keyed by the URL
    segment, which is also the `project_templates.template_key`. **This story adds the membership canvases, whose
    stored key differs from their segment** (`custom-membership` → `custom:custom-membership.hbs`), so the shape gains
    a derived `templateKeyOf(segment)`; `SITE` (:20-22) stays separate. `canvasPath` (:29-30), `canvasFromSegment`
    (:33-34), `canvasOfPath` (:40-43) and `canvasStack` (:47-50) all read `CANVASES` and follow.
  - `apps/web/app/(app)/app/(authed)/projects/[id]/[template]/layout.tsx` — `:19` is the `home` 308, `:20` the
    `notFound()` for every non-canvas segment. A conditional canvas (Private) must 404 while its condition is false.
  - `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` — `fileOf` (:44-45) already maps `custom:x` → `x`; its
    comment (`:41-43`) says the story that opens a new key extends it in the same change. `editorData` (:61-107) reads
    every row (`:65`) and returns `docs` keyed by `template_key`; **this is where synthesis is applied**, adding the
    synthesised docs and the set of keys they came from, so the marker is server truth and not a guess.
  - `apps/web/app/(app)/app/(authed)/projects/[id]/layout.tsx:19` — the layout that keeps the editor mounted across a
    canvas change (`:8-17` states the reason); `{children}` is rendered before the Suspense boundary (`:24`) so the
    404 and the 308 still set a status. Nothing here changes; it is why the switcher can be a push.
- **The editor shell**
  - `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` (1046 lines) — the story's app work:
    - **the top bar (:831-841)** is a back chevron and the project name, nothing else. D5a's centred group — the
      switcher and, when untouched, the marker chip — is added here, absolutely centred as D5a draws it. The probe
      asserts today's shape at `run-verify-editor.cjs:215`, so that assertion moves with it.
    - `key`/`canvas` (:187-190) from `canvasOfPath`; **there is no `useRouter` in this file** — the switcher adds the
      first one (`components/shell/shell.tsx:267` and `sites/panel-link.tsx:59` are the two built precedents, and
      `panel-link.tsx:88`'s `useTransition` + "Opening…" is R-98's shape for a navigation, not `useSubmitting`, which
      needs a `<form>`).
    - **`[key]` effect (:596-602)** — DW-176's code: it nulls `selected` and repaints. Unreachable until now; the
      harness must walk it. Note it clears `selected` but not `hovered`.
    - `TEMPLATES_OPEN` (:124, `Object.keys(CANVASES).length`) feeds the Site-wide heading (:858) and the site-wide
      confirm (:1022). It must stay **derived** and must count only templates that will actually ship — see Design
      Notes.
    - `stackOf` (:169-173) and `paint()` (:229-268) need no change: a synthesised doc is an ordinary doc.
  - `apps/web/components/controls/layers.tsx` — the panel body. The marker row goes in the scroll container's first
    slot, `:311-326`, immediately above `<SiteWideGroup>`; `HEADING`/`COUNT` (:106-107) are the shared classes.
  - `apps/web/lib/menu.ts` — `openMenu` (:66) with R-126's both-edge clamp (:93-105) and vertical flip (:88-92);
    `arrowKeys` (:125). `apps/web/components/kit/select.tsx` — `openPopover` (:23), `Menu` (:185), `MenuItem` (:174),
    `SelectThumb` (:147). D5b's menu has group headings, two-line custom rows and rules, so it is built **with**
    `openMenu` and the Kit's item classes rather than by widening `Menu`'s contract.
  - `apps/web/components/kit/icons.tsx` — `Check` and a chevron already exist; the dots are two spans, filled and
    hollow, not a new glyph.
- **The harness**
  - `tools/probe/run-verify-editor.cjs` (1887 lines) — steps run in execution order, and **every gesture step lives
    inside step 5's CSP session** (`:283`, stated at `:19-20`, `:30-32`) so its zero covers them. This story's steps
    append after step 39 (`:1601`) and before the step-6 banner (`:1641`). **Step 6 (:1641-1677) is the scheme's
    coverage** and extends here: the new segments answer 200, `index` and `private` still 404 (`:1649-1652`), and
    `:1670-1673`'s Back walk becomes a *soft* navigation walk, which is DW-176's whole point. Counts are imported live
    from `apps/web/lib/editor.ts` (`TEMPLATE_COUNT` at `:323`, rule at `:321-322`).
- **Frames and normative text, read**
  - `D5 Canvas Markers and Template Switcher.dc.html` **D5a** (:28-97) — the marker: a 32px chip in the top bar beside
    the Template control (`9px` hollow dot, `1.5px #C9C2B8` border, 12px `#6E6A64` text) and a row at the head of
    Layers (`#FBF9F5`, `1px #E7E2DB`, radius 10, padding 9/10, 11.5px `#6B6459`). Same sentence, both vanish on the
    first edit. **D5b** (:99-266) — the switcher at 520: `Template · Tag ▾` closed; open, the rows in order Home ·
    Post · Page · Tag · Author · *Membership* heading · Signup · Signin · Member home · 404 · Private · rule ·
    `FROM THE ROUTES MANAGER` heading · custom rows (name over filename) · rule · `+ New template`; and the two notes,
    "a hollow dot always carries the word" and "PRIVATE APPEARS ONLY ONCE … OTHERWISE THE ROW IS ABSENT, NOT GREYED".
  - `EXPERIENCE.md:144` (the switcher's IA row and its frame), `:163` (the marker's), `:1708-1722` (both frame specs),
    `:2142-2144` (A7 item 6: D5b's routes-manager example is renamed `Landing · custom-landing.hbs` because
    `custom-membership.hbs` is the Membership group's own — superseded by R-129), `:2189-2191` (A7 item 13: B7's unit is
    templates and the count is the project's own from the switcher).
  - `sections-inventory.md:778-867` — the normative Synthesis Defaults: scope and trigger (:782-787), inheritance by
    reference (:789-800), the per-template stacks (:802-847), the main-feed rule (:849-861), the invariants (:863-867).
  - `prd.md:223` FR-D6 · `:222` FR-D5 (hiding is not emptying) · `:344` FR-I1 · `:346` FR-I3 ("+ New template" is a
    deep link into the Routes Manager) · `:636`/`:640` (a `custom-{name}.hbs` filename is frozen public API and is the
    dropdown label) · `:1337` (the marker is app copy).
  - `supabase/migrations/20260904120000_complete_schema.sql:242-255` — `project_templates`, whose comment states
    "Absence of a row IS 'untouched' (FR-D6)" and whose `template_key_shape` CHECK is MEANT to admit
    `^custom:custom-[a-z0-9]+(-[a-z0-9]+)*\.hbs$` **and** `index` — it admits `index` and, as stored, refuses every
    `custom:` key (DW-193, executed at the review).
- **Ledger** — `deferred-work.md` DW-176 (:4175-4190) is **this story's to close**; DW-187 (:4434) and DW-122 (:3233)
  stay open and are not this story's; two new entries are filed below.

## Tasks & Acceptance

**Execution:**
- [x] `packages/section-runtime/src/doc-schema.ts` -- add `isMainFeed: z.boolean().default(false)` to
      `instanceSchema` -- the Synthesis Defaults designate a main feed on every collection template and AD-27 names
      this field; defaulted because every stored doc lacks it.
- [x] `packages/section-runtime/src/synthesize.ts` -- **new**: the Synthesis Defaults as a table citing
      `sections-inventory.md`, `synthesize(file, library)` returning `{ instances, dropped }`, and `indexStack(home)`
      for R-127 -- one core function, shared with Story 7.3's compiler and Story 5.16's preview (AD-27(d)).
- [x] `packages/section-runtime/src/index.ts` -- export it -- the app and the compiler reach it the same way.
- [x] `packages/section-runtime/src/synthesize.test.ts` -- **new**: every I/O-matrix rule about a stack, R-127's
      three `index.hbs` cases included, with the present and dropped rows **derived** from the library rather than
      listed -- so the test empties itself as Epics 9 and 10 land instead of going stale.
- [x] `apps/web/lib/editor.ts` -- add R-129's three membership canvases and Private's condition; derive
      `templateKeyOf`; leave `index` reserved (R-127) -- the URL segment and the stored `template_key` stop being the
      same string for a custom template.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/read.ts` -- extend `fileOf` and apply synthesis in
      `editorData`, returning the synthesised keys -- the marker is then server truth, and the loud refusals still
      guard stored docs only.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/[template]/layout.tsx` -- open the new segments; 404 a
      conditional canvas whose condition is false -- a canvas the switcher does not offer is not reachable by URL.
- [x] `apps/web/components/editor/template-switcher.tsx` -- **new**: D5b complete **less R-128's two absent rows**,
      built on `openMenu` -- the top bar's first control, and the editor's first soft navigation.
- [x] `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` -- mount the switcher and D5a's chip in the centre
      of the top bar; track materialisation; keep `TEMPLATES_OPEN` derived and counting only templates that ship --
      the whole shell change lands in one file.
- [x] `apps/web/components/controls/layers.tsx` -- D5a's marker row at the head of the panel -- the second of the
      two places FR-D6 names.
- [x] `apps/web/canvas-switch.test.ts` -- **new**: materialise, empty-back-to-untouched, hide-is-not-emptying, and
      the derived template count -- the doc rules that are not gestures.
- [x] `tools/probe/run-verify-editor.cjs` -- append this story's steps inside step 5's session, extend step 6's
      scheme and turn its Back walk into a soft-navigation walk -- closing DW-176, which exists because the harness
      could only reach `/post` by a document load.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close DW-176; file DW-191 and DW-192 -- a finding
      reaches an owning document or it is not closed.

**Acceptance Criteria:**
- Given the top bar, when I open the switcher, then it matches **D5b** — every row, R-130's three marks each with its
  own word, the Membership group and the current canvas checked — **less the "+ New template" row and the
  `FROM THE ROUTES MANAGER` heading, which arrive with Story 7.16** (R-128).
- Given the switcher is open, when I press the Membership heading, then the group collapses and its rows leave the
  menu; pressing it again brings them back (the owner's test, 2026-09-18).
- Given a designed Home with a designated main feed, when `indexStack` is asked for `index.hbs`, then it returns that
  doc from the main feed onward and drops everything above it; with no designated main feed it returns the Synthesis
  Default stack (R-127).
- Given an untouched synthesizable canvas, when I open it, then the auto-generated marker matches **D5a** at the head
  of Layers and reads exactly "Auto-generated — edit anything to make it yours", **and the top bar carries no marker
  chip at all** (R-130).
- Given a canvas open and a section selected, when I choose another canvas in the switcher, then the browser does not
  reload, the editor stays mounted, the address changes, and the selection and the Controls panel clear (DW-176).
- Given the project's canvases, when the site-wide confirm or the Layers heading prints a template count, then that
  count is derived and no literal appears anywhere in the change.
- Given a Synthesis Default row whose design the library cannot place, when the canvas opens, then the row is absent
  from the canvas and present in `dropped` with its reason, and the editor does not throw.
- Given a project with no linked private site, when I open the switcher, then there is no Private row at all — absent,
  not greyed — and `/projects/<id>/private` answers 404.

### Review Findings

Five layers on 2026-09-18 (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor, Real-infra verifier)
over the diff since `74308a3f`. No acceptance criterion was violated and nothing was the owner's to decide. Every
patch was applied at Review, in the same phase; the dismissed ones were noise, unreachable, or already ruled (the
`circle-off` glyph's size is R-130's and the owner saw it; the Verification block's run figures are dated records of a
run, not counts anything reads; `canvasesOf(true)` has no caller, by `CONDITIONAL`'s own note).

- [x] [Review][Patch] **A selection survived a canvas returning to untouched.** Synthesis DERIVES its instance ids, so removing the last section of a canvas (`auto-tag-1`, renamed) brought back a default stack holding the same id, and the Controls panel stayed open on a NEW instance. `commit` now answers `back` and `apply` clears the selection and the hover on it [apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx]
- [x] [Review][Patch] **`canvas-switch.test.ts` asserted its own copies of `commit` and `templatesOpen`**, so inverting the shipped rule left `pnpm check` green. Both rules are now `apps/web/lib/round-trip.ts`, imported by the editor AND the test; a hide-FIRST case was added (hiding materialises and gives nothing back). Control executed: deleting the "default stack returns" line turns the test red [apps/web/lib/round-trip.ts · apps/web/canvas-switch.test.ts]
- [x] [Review][Patch] **The spec asserted, three times, that the membership keys "already satisfy `template_key_shape`" — executed on production, they are refused** (`23514`; the stored pattern has two backslashes). Latent: nothing writes the key until Story 5.8. The three sentences, R-129's record, `editor.test.ts`'s comment and `epic-5-context.md` are corrected; the fix itself is a Schema phase and is DW-193 [spec :88 · :210 · Verification]
- [x] [Review][Patch] **R-130 had reached no owning document** — it existed only in this spec and in code comments. Recorded in `reconcile-designs-decisions.md` with its targets; FR-D6's M4 sentence and EXPERIENCE's "what is drawn" row amended [prd.md · EXPERIENCE.md · reconcile-designs-decisions.md]
- [x] [Review][Patch] Comments R-130 made stale — "D5a's chip", "two markers", "both places", "hollow, 'Empty'" — in the editor, the switcher, Layers, the test title and the harness [five files]
- [x] [Review][Patch] The switcher's header and this spec's Change Log cited a `privateCanvasOpen` that was never built; both now name `canvasesOf` / `CONDITIONAL` [template-switcher.tsx:42]
- [x] [Review][Patch] `read.ts`'s `held()` caught EVERY error from `pilot()`, so a design that does not validate would read as "the library holds no design" and drop silently from every canvas defaulting to it. Absence is now asked of `pilotIds()`; a broken design throws as it does for a stored doc [read.ts]
- [x] [Review][Patch] `dropped` was keyed by URL segment while `docs` and `defaults` are keyed by `template_key` — one key now [read.ts]
- [x] [Review][Patch] The Membership fold stayed shut across menu opens, hiding the checked row, and could be shut on the only row saying "Opening…" (R-98). It opens with the menu and holds while its row is in flight [template-switcher.tsx]
- [x] [Review][Patch] `aria-haspopup="menu"` promised menu semantics the popup deliberately does not have (a labelled list, as the Kit's `Menu`); removed [template-switcher.tsx]
- [x] [Review][Patch] D5b draws the OPEN control on `line-strong`; the built one only took it on hover [template-switcher.tsx]
- [x] [Review][Patch] A long project name ran under the absolutely-centred switcher; the name truncates before it [editor.tsx]
- [x] [Review][Patch] Harness step 2 called a 120px offset "centred" and threw a TypeError (a HARNESS ERROR, not a FAIL) when the switcher was missing; it is 2px and null-guarded [tools/probe/run-verify-editor.cjs]
- [x] [Review][Patch] Owner's manual test step 12 told him the confirm's number matches the switcher's rows; it is deliberately smaller (empty membership pages do not ship), so the step as written would have produced a false finding [§ Owner's manual test]
- [x] [Review][Patch] DW-176's `closed:` text said the harness reads "no `framenavigated`"; the harness counts `load`, and says why `framenavigated` is no test [deferred-work.md]
- [x] [Review][Defer] Production's `template_key_shape` refuses every `custom:` key [supabase/migrations/20260904120000_complete_schema.sql:254] — deferred, pre-existing: **DW-193**, Story 5.8's Schema phase
- [x] [Review][Defer] `indexStack` trusts a designed Home: hidden feed, second feed, a section `index.hbs` cannot hold [packages/section-runtime/src/synthesize.ts] — deferred, unreachable until a main feed can be designated: **DW-194**, Stories 5.19 and 7.3

## Spec Change Log

- **2026-09-18 — Review.** Five layers; see *Review Findings*. One claim in this spec was FALSE and is struck where it
  stood rather than deleted: "the membership keys already pass the `template_key_shape` CHECK". It was a reading of
  the intended pattern, never an execution, and production refuses all three (DW-193). The story still has no Schema
  phase — it writes no row — but Story 5.8 now does. R-130 was propagated to the decisions file, FR-D6 and EXPERIENCE.

- **2026-09-18 — R-130, and two findings from the owner's own look at the deployed editor, during Dev.** He ruled
  Question 4 with a glyph rather than a word (Tabler's `circle-off` for the "Empty" rows), removed the top bar's
  marker chip — *"We already have the identifier in the Dropdown"* — and reported that the Membership group's chevron
  drew but did nothing. The frozen Intent, Boundaries and I/O matrix were amended for the first two, which is the
  renegotiation the `frozen-after-approval` tag provides for; the third was a plain defect and needed no ruling. See
  Design Notes below.
- **2026-09-18, Dev.** Two readings the story made rather than assumed, both recorded where the code is:
  - **The canvas labels are the export's, not Story 5.1's.** `lib/editor.ts` carried `Tag archive` and `Author
    archive`; D5b's rows read **Tag** and **Author**, and D5a's Layers heading reads `LAYERS · TAG`. R-74 makes the
    export the authority, so the two labels changed — which also changes the Layers heading and the iframe's title,
    both of which read the same one string.
  - **The Private condition has nothing to read yet, EXECUTED (standing rule 1).** `sites.site_settings` — the
    snapshot Epic 3 keeps — records `code_injection`, `portal_button`, `announcement`, `brand`, `public_url` and
    `plan_ask`, and no private flag: no story has needed one. So no condition can be true for any project
    today (`lib/editor.ts`'s `CONDITIONAL`; an earlier draft named a `privateCanvasOpen` that was never built), the row is absent everywhere and `/private` 404s, which is what FR-D6 and D5b agree on for a project with
    no private site. It becomes true the day the snapshot carries the key; DW-192 already owns the disagreement.
  - **A conditional canvas is refused BY THE SCHEME, not by a database read, and that is executed.** The Code Map
    asks the `[template]` layout to 404 a conditional canvas whose condition is false. Built that way first — a
    `cache`d read of the linked site inside the layout — and measured on a production build: `/private` answered a
    404 whose BODY was Next's bare `__next_error__` document, with none of the app's 404 and no way home, while
    `/index` and `/paywall` beside it answered the app's own. A `notFound()` thrown after an await lets Next flush
    the shell first, which is `[id]/layout.tsx:12-17`'s rule met from the other side. So `canvasFromSegment` refuses
    a `CONDITIONAL` segment synchronously; `canvasesOf` and `CONDITIONAL` stay as the scheme's data with the unit
    test on them, and DW-192 now carries both findings for the story that gives the condition something to read.
  - **A third dot state the frame does not draw** — an undesigned canvas that is never synthesized. Built as a
    hollow dot with the word **"Empty"**, and put to the owner as **Question 4**.
  - **The switcher's push carries the internal `/app` prefix** when the address does (`isApp(usePathname())`), the
    same question `canvasSrc` asks — without it a local run pushes a path that is not a route there.
  - **DW-191 and DW-192 were already filed at Create**, so Dev closed DW-176 and amended DW-192.

## Design Notes

### R-130, and the two things the owner found at the deployed editor

**The marker's one place.** D5a and FR-D6 both name two — a chip beside the Template control and a row at the head of
Layers. Standing on the built screen, the owner removed the chip: *"There is a notification adjacent to the Template
dropdown in top bar… I do not want to show that. We already have the identifier in the Dropdown."* He is describing a
real redundancy the frame could not show, because the frame draws the switcher closed: on the live screen the same
fact is stated three times at once — the closed control names the canvas, its open row carries a hollow dot **and** the
word "Auto-generated", and the chip then repeated the whole sentence beside it. The Layers row survives because it is
the only one of the three a user reading the **section list** sees without opening anything. **D5a is superseded on
the chip alone**; its Layers row is unchanged, measure for measure, and R-74 stands everywhere else.

**The third state is a glyph, not a word.** Question 4 offered four words; he answered with Tabler's `circle-off`.
The word "Empty" stays beside it — his own rule that a shape never travels alone is why the state needed answering at
all. Two things follow and both are recorded where they bite. **R-92's scope now carries one stated exception:**
Tabler is the *sections'* icon set and not Inflozo's chrome, so `kit/icons.tsx` held no Tabler path and no Tabler
licence; it now holds one of each, and its header says a glyph the export draws is still read from the export — a
Tabler path enters only where the owner names one. And **the drawing was not retyped from his message**: it is
`packages/library/icons/tabler.json`'s own `circle-off`, verified path for path, inlined rather than imported because
`@inflozo/library/icons` would pull its whole set into the editor's client bundle.

**The chevron that did nothing.** The Membership heading drew D5b's chevron and had no handler — R-118's fault from
the other end: a control that is *present* must work. It is a `button` with `aria-expanded` now, and a collapsed
group's rows are **not rendered** rather than hidden, because a hidden button is still one `arrowKeys` would step onto
and a keyboard user would land on a row nobody can see.

### Seven files, six canvases — the "contradiction" is two different counts

FR-D6 says "exactly seven templates" and, in the same sentence, "the six render on the canvas". Both are true and
neither document says so: **seven** is the synthesizable `.hbs` **files** (`sections-inventory.md:786`, the normative
list), **six** is the **canvases a user can open**, because `home.hbs` and `index.hbs` share one canvas —
`sections-inventory.md:804-806`, "an untouched Home synthesizes the **same stack into both files** — the root and its
paginated continuation must not disagree about what the feed is". The code already picks six (`lib/editor.ts:9-22`).
The story builds six canvases and states the reconciliation wherever it prints a count. **What no document settled was
what `index.hbs` is made from once Home is designed** — booked to this story by `spec-5-1…md:373` and now ruled.

### R-127: page 2 is Home from the main feed down

The owner's Question 1, option 1. `index.hbs` gets **no canvas** — permanently, which settles 5.1's reserved-segment
row — and is instead derived from the Home doc: everything above the designated main feed is dropped, the feed and
everything below it are kept in order. A welcome banner is meant once; a newsletter band and a closing CTA carry on.
Two edges matter and both are in the matrix: a designed Home with **no** designated main feed falls back to the
Synthesis Default stack, because `index.hbs` is always compiled and must never ship empty (FR-I1); and an **untouched**
Home is unchanged — the same synthesised stack into both files (`sections-inventory.md:804-806`).

It is `indexStack(home)` in `synthesize.ts`, not in the app: nothing in this story's UI calls it, but Story 7.3's
compiler and Story 5.16's page-2 preview both will, and AD-27(d) exists precisely so the rule is not written twice.
On the owner's "Pilot sections" project no instance carries `isMainFeed`, so the fallback branch is the one his data
exercises and the one the unit test pins.

### Synthesis is one function, and it degrades honestly

AD-27(d) is explicit: a second implementation would put the Synthesis Defaults, the feed-qualification test and the
designation rule in two places. So `synthesize` is core, pure, and Story 7.3 calls the same one. Today the library
holds five provisional pilots, so the normative stacks resolve **partly**:

| Canvas | Default stack (`sections-inventory.md`) | Today |
|---|---|---|
| `tag` | A29 #1 Centred · **A17 #1 Three Up** (main feed) | the feed renders; the archive header drops |
| `author` | A29 #2 Split Head · **A17 #1 Three Up** (main feed) | the same |
| `page` | A24 #1 Centred · A25 #1 Measured | both drop — A24's pilot declares `compileTarget: ['post.hbs']` (DW-191) |
| `error` | A31 #1 Centred | drops; the canvas is marked auto-generated and shows only the site-wide sections |

That is the honest state and the owner's test says so. The two drop reasons are different and both are reported: the
library holds no such design, or holds it with a `compileTarget` that excludes this file. **`editorData`'s existing
refusals stay loud** — they guard a user's stored doc, where a missing design is corruption; a synthesised row is our
own table meeting a library that has not caught up, and throwing there would black out four canvases.

### Materialisation, and the round trip AD-22 asks for

Untouched → the default stack renders and both markers show. First edit → the stack becomes the canvas's in-memory doc
and the markers go (nothing is written: there is no persistence until 5.8, so a reload returns to untouched — the test
says so). Remove every section → **back to untouched**, the default stack re-renders and the markers return. Hide every
section → still designed, nothing re-synthesises (FR-D5: "hiding every section is not emptying"). The round trip is the
cheapest proof that absence really is the signal.

### R-128 and R-129: what the switcher does *not* ship, and what the membership pages are called

**R-128** applies R-118 a second time: "+ New template" and the `FROM THE ROUTES MANAGER` heading are absent until
Story 7.16 gives them somewhere to go. Nothing is greyed and nothing is captioned — an absent row asks no questions —
and the custom group would have had nothing to list anyway, since `custom_templates` has no writer.

**R-129** fixes the three filenames: `custom-signup.hbs` ("Signup"), `custom-signin.hbs` ("Signin"),
`custom-member-home.hbs` ("Member home"). The filename is frozen public API and Ghost derives the dropdown label from
it (`prd.md:636`), so it is chosen once. B19 is superseded on the first one — it draws `custom-membership.hbs` — while
its mechanism is untouched. The owner's reason is the useful part: **Signin, Sign up, Subscribe and Membership are
different pages**, so the signup canvas cannot be called "Membership". The group stays the three FR-D6 names, which are
also A30's three surfaces (FR-D13's partition); **Subscribe and Membership are ordinary custom page templates** created
in the Routes Manager (FR-I3) and listed in the switcher's own Routes Manager group — the same `custom-*.hbs`
mechanism, arriving with Story 7.16.

### Private, and the circle in the frame

D5b's caption says Private appears "once a Private Site Gate section has been **designed**" — which cannot be, because
a canvas you cannot open is a canvas you cannot design. FR-D6 says "once a Private Site Gate is **called for**", which
is the readable rule: the project's linked site reports itself private, from the settings snapshot Epic 3 already
keeps. Behaviour is the PRD's to decide and the frame's to draw (standing rule 6), so the story builds FR-D6's wording
and files the frame's as **DW-192** for the first story that has a linked private site to try it on. On "Pilot
sections", which links no site, Private is absent either way — so the choice is unobservable now and costs nothing to
defer.

### The template count stops being "every canvas"

`TEMPLATES_OPEN` is `Object.keys(CANVASES).length` today and reads 6 — correct while every canvas always ships. The
membership canvases **emit nothing until designed** (FR-D6), so a site-wide confirm that said "changes it on all 9
templates" would be wrong the moment they are added. The count becomes: the always-shipping canvases plus each
conditional canvas that has a doc with sections — still derived, one expression, and it lands on EXPERIENCE's
re-specified B7 wording ("the count is the project's own from the switcher", `:2189-2191`) by construction rather than
by agreeing with a number.

### Where the marker sits, against R-126

R-126 (the owner, 2026-09-18) drew the Layers panel for its **names**: two groups the same shape with a hairline, no
card, no glyph, no footed note. D5a's marker is a different element with a different job — it is about the *canvas*,
not a group — and it sits **above** both groups, so it takes nothing from either heading and R-126 stands untouched.

### Boundaries with the stories either side

5.19 owns the main-feed **lifecycle** — the Data group, the visible marker, reassignment, the auto-designation rules —
and `epics.md:2087` says archives "start with one from the Synthesis Defaults", which is this story setting
`isMainFeed` on the A17 row of every collection template and nothing more. 7.3 owns compile-time synthesis and the
emptying rules and calls this story's function. 5.16 owns page 2. 7.16 owns the Routes Manager, which is why the custom
group is empty here.

## Verification

**Commands, and what each must return.** Run at Dev on this machine against the real services (R-82); a key is named by
its variable and never printed.

- `pnpm check` -- exit 0, `fail 0` in every package suite, including the new `synthesize.test.ts` and
  `canvas-switch.test.ts`. Each suite prints its own count; none is written down here.
- `bash supabase/tests/run-rls-gate.sh` -- exit 0, every `PASS`, no abort. **The control that this story did not move
  the database under the code:** `isMainFeed` lives inside `project_templates.doc` and nothing in this story writes
  a row, so there is **no Schema phase** (R-99). The review struck the second reason this line gave — that the three
  membership keys "already satisfy `template_key_shape`": on production they do not (DW-193).
- `python3 tools/doc-audit.py --check` -- exit 0, twice.
- `python3 -c` over `packages/library/designs/` and the registry -- **executed, not asserted** (standing rule 1): the
  design ids and `compileTarget`s the Synthesis Defaults name, against what the library actually holds, so the
  Design Notes table is a reading and not a guess.
- **GitHub Actions**, read with `GITHUB_TOKEN`: the Dev commit runs **CI** to `success` with `check`, `rls` and
  `deploy` green, and **Render matrix** to `success`. Negative control: a bogus token → 401.
- **Vercel**, read with `VERCEL_TOKEN` / `VERCEL_TEAM_ID` / `VERCEL_PROJECT`: the production deployment for the Dev
  commit is **READY** and its `githubCommitSha` is HEAD. Negative control: a bogus token → 403.
- **Supabase**, read with `SUPABASE_URL` / `SUPABASE_SECRET_KEY`: `git diff <baseline>..HEAD -- supabase/` is empty,
  and the owner's "Pilot sections" project still has rows for `site`, `home` and `post` **and no others** — the proof
  that synthesis wrote nothing.
- **The deployed editor harness** -- `env $(grep -E '^(SUPABASE_(URL|SECRET_KEY)|VERCEL_(TOKEN|TEAM_ID))=' \
  tools/probe/.env | xargs) OUT_DIR=… node tools/probe/run-verify-editor.cjs`, against `app.inflozo.com` and the live
  Supabase, refusing to start unless the served deployment is this checkout's HEAD. Expected **0 FAIL**, with step 5's
  CSP session zero **and its own control passing** — the control plants two `new Function('')` refusals and the
  recorder must see both, or the zero is not a result (standing rule 2). Run at Dev, not deferred to Review.

**Run at Dev (2026-09-18).** `pnpm check` exit 0 with `fail 0` in every package suite; `bash supabase/tests/run-rls-gate.sh`
exit 0, every PASS; `python3 tools/doc-audit.py --check` PASS; the library read executed against the registry, and the
Design Notes table above is that reading. The editor harness ran against a production build of this checkout on the live
Supabase (`APP_ORIGIN=http://localhost:3000`): **0 FAIL, 250 PASS**, with step 5's CSP zero **and both of its eval
controls passing**, and `step 1 — three project_templates rows: site, home, post` as the proof that synthesis wrote
nothing. One row is **not assertable on a local run and says so** — step 6's second Back, because `openCard` re-enters
under the `/app` prefix and leaves an unprefixed 404 in the history that Chromium will not Back out of.

**Re-verified at HEAD `5fe5168e` (2026-09-18), because two commits landed after the harness run above.** CI `5fe5168e`
**success** with `check`, `rls` and `deploy` all green, and **Render matrix** success (`GITHUB_TOKEN`; bogus token →
401). The production Vercel deployment for `5fe5168e` is **READY** with `githubCommitSha` = HEAD (`VERCEL_TOKEN` /
`VERCEL_TEAM_ID` / `VERCEL_PROJECT`; bogus token → 403). `pnpm check` exit 0 with `fail 0` in every suite, the new
`synthesize.test.ts` (`packages/section-runtime`, 189 pass) and `canvas-switch.test.ts` (`apps/web`) among them;
`bash supabase/tests/run-rls-gate.sh` exit 0, every PASS; `python3 tools/doc-audit.py --check` PASS twice. The library
read **executed** against `packages/library/designs/` through `lib/pilots.ts`: `home`/`index`/`tag`/`author` place
`a17/1`, `post` places `a24/1` and drops four, `page` drops both (`a24/1 compiles to post.hbs, never page.hbs` —
DW-191) and `error` drops `a31/1` — the Design Notes table above, value for value. **Supabase** (`SUPABASE_URL` /
`SUPABASE_SECRET_KEY`; bogus key → 401): `git diff 74308a3f..HEAD -- supabase/` **empty**, and the owner's "Pilot
sections" project still holds exactly `home`, `post`, `site` — synthesis wrote nothing. **The deployed harness** against
`app.inflozo.com` and the live Supabase at HEAD: **0 FAIL, 251 PASS**, step 5's CSP session `[]` with **both** eval
controls recorded (`EvalError` in each document, and the recorder saw both refusals — standing rule 2), step 41's soft
navigation and step 6's two-push/two-Back walk both with the editor and canvas stamps intact.

**Then on the deployed app, at the Dev commit (2026-09-18).** CI `c7aeed80` **success** with `check`, `rls` and `deploy`
green and **Render matrix** success (bogus token → 401); the production Vercel deployment **READY** with
`githubCommitSha` = HEAD (bogus token → 403); `git diff <baseline>..HEAD -- supabase/` **empty**; and the owner's
"Pilot sections" project still holds rows for **`site`, `home` and `post` and no others** — the proof that synthesis
wrote nothing. The editor harness against `app.inflozo.com` and the live Supabase, refusing to start until Vercel
served this checkout's HEAD: **0 FAIL, 251 PASS**, step 5's CSP session zero with **both** eval controls recorded.

**After R-130, at HEAD `92b6ae6c` (2026-09-18).** `pnpm check` exit 0, `fail 0` in every suite. CI `92b6ae6c`
**success** with `check`, `rls` and `deploy` green (`GITHUB_TOKEN`); the production Vercel deployment **READY** at that
SHA (`VERCEL_TOKEN` / `VERCEL_TEAM_ID` / `VERCEL_PROJECT`). The deployed harness against `app.inflozo.com` and the live
Supabase: **0 FAIL, 254 PASS**, step 5's CSP session zero with **both** eval controls recorded. The three checks the
owner's findings added all pass — step 2 reads no marker chip in the bar on any canvas, step 40 reads R-130's three
marks each with its own word and presses the Membership chevron shut and open again, and step 42 reads the marker in
its one place.

**One thing about running this harness, recorded because it cost six runs.** Against the deployed app it dies
intermittently with a Playwright `page.goto` / `apiRequestContext.get` **timeout**, at a different step every time
(step 5, step 6, step 27, step 43 were all seen within an hour) while `curl` to the same origin answers 307 in 0.26s
five times running. It is **not a result and not a fault** — there is no `FAIL` in those logs, only a `HARNESS ERROR`
— and the fix is to run it again. Only a run that prints its own `0 FAIL, <n> PASS` line counts.

**Manual checks:**

- The switcher and the marker measured against D5b and D5a from a device-scale screenshot, never computed style —
  the dot states, the word beside the hollow dot, the row order, and the two rules.
- A soft navigation confirmed as a soft navigation: no document load between two canvases, the editor's mount count
  unchanged, and the selection gone (DW-176's close).

## Owner's manual test

The project is the "Pilot sections" project Story 5.1's Deploy added to your account; Deploy re-checks its address.
Sign in as you normally do. **Nothing you change here survives a reload** — saving arrives with Story 5.8 — and the
library still holds only the five pilot sections, so some standard recipes are **partly** built. That is expected, and
step 4 is where you see it.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | Editor, Home | Look at the middle of the top bar. | — | A new control reading **Template · Home** with a small chevron. No "Auto-generated" note anywhere — you designed this page. |
| 2 | same | Top bar | Press it. | — | A menu: Home · Post · Page · Tag · Author · a **Membership** heading with Signup, Signin and Member home under it · 404. Home has a tick. **No "+ New template"** — that arrives with the Routes Manager (your ruling, R-128). Pages you have never touched carry a small hollow dot **and the word "Auto-generated"**; Home and Post carry a filled dot and no word; the three Membership rows carry **your crossed-out circle and the word "Empty"** (R-130). **No "Private" row** — your site has not asked for one. Compare it with D5b in `D5 Canvas Markers and Template Switcher.dc.html`. |
| 2b | same | Switcher | Press the word **Membership** (or its chevron). | — | The three rows underneath fold away and the chevron turns to point right. Press it again and they come back. This is the control that did nothing when you tested it. |
| 3 | same | Switcher | Choose **Tag**. | — | The page does **not** reload — no white flash, no spinner in the browser tab. The address becomes `…/projects/…/tag`, the canvas becomes a tag archive, and the top bar reads **Template · Tag** — **and nothing beside it**, the note you removed (R-130). The sentence "Auto-generated — edit anything to make it yours" now sits only at the top of the list on the left. |
| 4 | same | Canvas, Tag | Look at what is on the page. | — | Your site's header and footer, and **one** section — a three-up grid of posts. The archive heading above it is missing on purpose: that design is not in the library yet. The list on the left shows the one section. |
| 5 | same | Canvas, Tag | Press that grid to select it, then use the switcher to go to **Author**. | — | The selection lets go as you arrive: nothing is outlined, and the right-hand panel is empty. The Author canvas is also marked auto-generated and also shows one grid. |
| 6 | same | Switcher | Choose **404**. | — | An empty page with just your header and footer, and still marked "Auto-generated" at the top of the list on the left — the standard 404 design has not been built yet, and the note tells you this page is not yours. |
| 7 | same | Switcher | Choose **Signup** under Membership. | — | A blank page and an empty list, with **no** "Auto-generated" note anywhere. Membership pages are never auto-built — they stay empty until you design them, which is what its crossed-out circle and "Empty" say in the menu. |
| 8 | same | Switcher | Go back to **Tag**, press the "…" beside the one section and choose **Rename**. | `My tag feed` | The note disappears from the list the moment you save the name — the page is now yours. Open the switcher: Tag's dot is now filled and the word is gone. |
| 9 | same | Layers | Press "…" on that same section and choose **Delete**. | — | With nothing left, the page goes **back** to the standard recipe: the grid returns, and the "Auto-generated" note comes back at the top of the list. |
| 10 | same | Layers | Press "…" on the grid and choose **Hide** instead. | — | The section disappears from the page but the row stays and **no** note comes back — hiding is not the same as taking it off. |
| 11 | same | Browser | Press the browser's Back button twice. | — | You walk back through the canvases you visited, in order, without the editor reloading. |
| 12 | same | Layers | Press "…" beside "Header — Rail" in the SITE-WIDE group and choose **Delete**. | — | The box that asks first names the number of templates it changes. **The number is the pages that will actually ship, so it is SMALLER than the switcher's list:** count the rows in the switcher that are not marked "Empty" (the three Membership pages are empty until you design them, and an empty page is not published). Then press **Cancel**. |
| 13 | same | Browser | Reload. | — | Everything is back as it started, including the notes. Saving arrives with Story 5.8. |

## Questions for the owner

### Question 1 — what is the *second* page of your blog made from?

Ghost splits a blog's front page in two. The first page — the one at `yoursite.com` — comes from a file called
`home.hbs`, and that is the **Home** canvas you design in the editor. But page 2, page 3 and so on —
`yoursite.com/page/2/` — come from a **different** file, `index.hbs`, and there is no canvas for it anywhere in the
plan. **Example:** you design a beautiful Home page with a big welcome banner, a three-up grid of posts and a
newsletter band. A reader scrolls to the bottom and presses "2". What do they get? Nothing in the written plan says.

Everything else is already settled: seven files are auto-built, six of them have a canvas you can open, and `index.hbs`
is the seventh. The only open point is what it is made from once you have designed your Home page.

1. **Page 2 shows your Home page from the post grid down** — the banner and anything above the grid are dropped, the
   grid itself carries on with the next posts, and everything below it stays. (RECOMMENDED) — it is what almost every
   Ghost theme does, including Ghost's own; page 2 looks like your site, without repeating a "welcome" you only mean
   once. No extra canvas to design, and Story 5.16's page-2 preview shows you exactly this.
2. **Page 2 repeats your whole Home page**, banner and all, with the grid showing the next posts.
3. **Page 2 keeps the plain standard recipe** — just a grid of posts — however you design Home. Simplest to build, but
   it means part of your site looks nothing like the rest and you can never change it.
4. **Give page 2 its own canvas** in the switcher, designed separately. Most control, one more page to keep in step
   with Home, and it is the only option that adds a row to every menu in this story.

**Ruled: option 1 (owner, 2026-09-18).** *"Page 2 shows your Home page from the post grid down — the banner and
anything above the grid are dropped, the grid itself carries on with the next posts, and everything below it stays."*
Recorded as **R-127**; it settles `spec-5-1…md:373`'s reserved `index` segment as "no canvas, permanently".

### Question 2 — "+ New template" points at a screen that does not exist yet

The drawing of the switcher ends with **+ New template**, which is meant to jump into the Routes Manager — the screen
where you create extra page types. That screen is built much later (Story 7.16). **Example:** you open the switcher
today, press "+ New template", and there is nowhere for it to take you.

You already ruled on this shape once, for the buttons on a hovered section (R-118): *a control arrives with the story
that makes it work, and is absent until then.*

1. **Leave it out until the Routes Manager is built**, exactly as R-118 says. (RECOMMENDED) — nothing in the product
   ever points at a dead end, and the row appears the day it works.
2. **Show it greyed, with a short line saying "Coming with custom page types"** — you see the whole shape of the menu
   now, and nothing is pressable that should not be.
3. **Show it live and let it go nowhere** — closest to the drawing today, and the only option that can disappoint
   someone who presses it.

**Ruled: option 1 (owner, 2026-09-18).** *"Leave it out until the Routes Manager is built, exactly as R-118 says."*
Recorded as **R-128**; R-118 now covers two surfaces and the `FROM THE ROUTES MANAGER` heading goes with the row.

### Question 3 — what your customers will see in Ghost's menu for the sign-up page

A membership page you design does not get its own web address. Instead it ships as a file, and the **file's name
becomes the wording your customer picks from a dropdown inside Ghost**. Ghost stores that exact wording forever, so it
**can never be changed later** without silently breaking every page pointing at it. Two of the three are agreed
everywhere: Signin ships as `custom-signin.hbs` and shows in Ghost as **"Signin"**; Member home ships as
`custom-member-home.hbs` and shows as **"Member home"**. The first one disagrees with itself. **Example:** your
customer opens a page in Ghost, opens the Template dropdown, and has to recognise the one you built for signing up.

1. **`custom-membership.hbs` — it shows in Ghost as "Membership".** (RECOMMENDED) — it is what your own binding screen
   already draws (B19) and what the walkthrough of the design pass settled; "Membership" is also the friendlier word
   for a page that both sells and signs people up.
2. **`custom-signup.hbs` — it shows as "Signup".** It matches the row's name in the editor's own menu, so the word is
   the same in both places, but it reads more like a form than a page.
3. **`custom-join.hbs` — it shows as "Join"**, or another word you prefer. Say the word and I will use it.

**Ruled: option 2 (owner, 2026-09-18).** *"`custom-signup.hbs` — it shows as 'Signup'. There will be different pages
for Signin, Sign up, Subscribe and Membership."* Recorded as **R-129**: the three are `custom-signup.hbs`,
`custom-signin.hbs` and `custom-member-home.hbs`, and B19 is superseded on the first. **Subscribe and Membership are
ordinary custom page templates** — created in the Routes Manager (FR-I3), listed in the switcher's own Routes Manager
group, same `custom-*.hbs` mechanism — so they arrive with Story 7.16 and this story's group stays the three FR-D6
names. Say so if you meant them as built-in rows instead and each is one table entry to add.

### Question 4 — what the dot says beside a page that is neither yours nor auto-built

Every row in the new Template menu carries a small dot. A **filled** dot means you designed that page. A **hollow**
dot means Inflozo built it for you from its standard recipe, and the word **"Auto-generated"** sits beside it — your
own drawing is firm that a shape must never travel alone. But three of the rows are neither: the membership pages
(Signup, Signin, Member home) are **never** auto-built — they stay blank until you design them — so a filled dot would
claim you made them and "Auto-generated" would be untrue. **Example:** you open the menu on a brand-new project and
look at "Signup". It is blank and you have never touched it. What should the dot beside it say?

The drawing does not answer: it shows Signup with a filled dot and Signin marked auto-generated, and the requirements
say neither can be right for a membership page. So it is a small new choice, and it is yours.

1. **A hollow dot and the word "Empty".** (RECOMMENDED) — one word, exactly true, and it keeps your rule that a hollow
   dot always carries a word. It reads "this page is not yours yet and nothing has been built for it". **This is what
   is built today**, so you will see it at your test and can change it with one word.
2. **A hollow dot and nothing beside it.** Closest to saying as little as possible, but it breaks the rule you set —
   a shape with no word — and a reader has to guess what the hollow one means on those three rows.
3. **A filled dot, as the drawing shows for Signup.** Simplest to explain, but it tells you that you designed a page
   you have not touched.
4. **A different word** — "Not built yet", "Blank", or one you prefer. Say the word and I will use it.

**Ruled: a glyph, not one of the four words (owner, 2026-09-18).** He answered with Tabler's `circle-off` — a circle
with a line through it — for the Empty rows, and in the same message removed the top bar's marker chip: *"There is a
notification adjacent to the Template dropdown in top bar… I do not want to show that. We already have the identifier
in the Dropdown."* Recorded as **R-130**: the mark for a never-auto-built canvas is `circle-off` and the word "Empty"
stays beside it (his own "a shape never travels alone"); the auto-generated marker has **one** place, the head of
Layers. D5a is superseded on the chip alone. Its two consequences are in the Design Notes: R-92's scope gains one
stated exception for a Tabler path in `kit/icons.tsx`, with the MIT notice that path owes, and the drawing is
`tabler.json`'s own rather than retyped.
