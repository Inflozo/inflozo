---
title: Inflozo Architecture Stress Test — Round 3
type: stress-test prompt + round-2 handover
status: ready to run in a fresh session
created: 2026-08-20
supersedes: STRESS-TEST-R2.md (round 2 — Pass 1 completed, Passes 2–4 never ran)
---

# Stress-test the Inflozo architecture — Round 3

Be adversarial. Your job is to break it, not to praise it.

Rounds 1 and 2 have run. **This file carries everything they established.** Read it whole before you
start. Round 3 exists to find what neither could, and you cannot know that without knowing what they
did — and, this time, what Round 2 *did not do*.

---

## Part 0 — Read this first: Round 2 ran one pass out of four

Round 2 executed **Pass 1 in full and stopped.** `/bmad-review`, `/bmad-party-mode --party
ghost-build-room` and `/bmad-advanced-elicitation` were **never invoked**. That is not a judgement
that they are unnecessary — Pass 1 produced more executed material than expected and the session
finished and reported it rather than starting three passes it could not complete.

**So Round 3's Passes 2, 3 and 4 are Round 2's Passes 2, 3 and 4, re-aimed at what execution has
since changed.** They are the *majority* of this round's value, not its tail. Do not repeat Round 2's
mistake of spending the whole session on execution — Round 3's execution budget is deliberately
small (Part 4), because the reasoning passes are the ones that have never run at all.

Two Pass-1 items also remain untouched and are carried into Part 4: the **DOMPurify SVG upload path**
(FR-K2) and the **CSP in a scaffolded Next 16 app** (Round 1 decision 5).

---

## Part 1 — Context

**Inflozo** is a visual site builder for Ghost CMS. Users drag pre-made sections onto a canvas; the
product compiles the design into a clean, hand-editable Ghost theme and deploys it. The central claim
is that canvas and shipped site agree **by construction** — one authored source (annotated HTML)
feeds two renderers, one producing canvas DOM and one producing Handlebars `.hbs` text.

The owner is a solo founder who is not an engineer. Every explanation lands in plain language with a
concrete example, and every finding carries options with one marked (RECOMMENDED).

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/`

| What | Where |
|---|---|
| The spine — 35 invariants, AD-1..AD-35 | `architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` |
| Everything claimed as executed | `.../MEASUREMENTS.md` — **§13 is new in Round 2** |
| Schema + its runnable RLS proof | `.../SCHEMA.sql`, `.../RLS-TEST.sql`, `.../PRELUDE.sql` |
| External facts still unverified | `.../VERIFY-AT-BUILD.md` — **items 29–33 are new; 29 is UNRESOLVED** |
| Round 1's 33 decisions | `.../STRESS-TEST-R2.md` Part 3 — **three are annotated as amended/dropped/refuted** |
| Round 2's 16 decisions | `.../ROUND-2-DECISIONS.md` |
| The runnable two-checker gate | `.../fixtures-r2/` |
| **The PRD — v4.1** | `prds/prd-Inflozo-2026-08-17/prd.md` |
| Normative for mechanism (short, read whole) | `prds/prd-Inflozo-2026-08-17/addendum.md` |
| Normative for scope — 484 designs | `prds/prd-Inflozo-2026-08-17/sections-inventory.md` |
| Ghost helper surface per template | `prds/prd-Inflozo-2026-08-17/appendix-b1-template-contexts.md` |
| The string catalog | `prds/prd-Inflozo-2026-08-17/appendix-h1-string-catalog.md` |
| The runnable compiler spike | `prds/prd-Inflozo-2026-08-17/spike-compiler/` |
| The 7 research companions | `prds/prd-Inflozo-2026-08-17/research-*.md` — **two now carry a correction block** |

**Never read `prd.md` whole.** Read by section with `sed -n`: §4 build order 131-169 · §5 FRs
170-455 · §6 NFRs 456-481 · §7 architecture 482-700 · §8 epics 701-801 · appendices from 802.

This is now a **git repository**. Round 2's work is four commits on `main`. `git log` and `git show`
are the fastest way to see exactly what changed and why — every commit message states the evidence.

### The one rule that governs this project

A claim about an external platform is a hypothesis until read in that platform's source or executed
against it. **Cite or execute. Never assert, and never accept an assertion because it sounds
authoritative.**

Rounds 1 and 2 each found a *new variant* of this failure. Keep all three on the watchlist:

1. **The plain form** — an unverified claim entering as normative text. Four instances, each of which
   deleted or damaged a working feature.
2. **Round 1's variant** — a fact read correctly and carried one step too far. The TypeScript version
   was read accurately; the error was treating "latest" as "compatible."
3. **Round 2's variant, twice** — *the harness itself* carrying the uncited claim. `PRELUDE.sql`
   asserted "Supabase grants these by default" in a comment and was wrong, and the whole RLS proof
   was measured against it. Separately, `checkVersion: 'v5'` was assumed to mean "what Ghost 5 does."
   **Round 3 should assume the next one is also inside something that looks like evidence.**

---

## Part 2 — What Rounds 1 and 2 established. Do not re-derive any of this.

### 2.1 Round 1's confirmed facts — still standing

Environment: `node` 22.23.2, `jsdom` 30.0.1, `handlebars` 4.7.9, PostgreSQL 17.

1. **AD-5's numeric entity encoding cannot survive `outerHTML`.** Via `innerHTML` the parser decodes
   `&#123;` back to `{` and the serializer never re-escapes, so user-typed `{{title}}` ships **live**.
   Fixed by escaping after serialization. **Round 2 proved this with marks — see 2.2.**
2. **`jsonb` does not preserve object key order** (sorts by length then bytewise). Arrays are
   preserved. JS `Object.keys` hoists integer-like keys.
3. **Per-section compile cost scales ~7.4x** from AD-11's fixture shape to a realistic heavy section.
   **The stress fixture is still not checked in anywhere** — Round 1 decision 10 is still open, and
   Round 2 §13c is explicitly blocked on it.
4. **TypeScript 7.0.2 is the Go port** — 2 exports, no `createProgram`. **6.0.3 is the full compiler**
   and is inside `typescript-eslint@8.67.0`'s peer range.
5. **Vercel Fluid shares one instance across concurrent invocations**; `memory: 2048` is the INSTANCE
   budget; `fluid` is project-wide with no per-function toggle; `maxDuration` includes the response.
6. **Next 16 CSP** requires nonce + `strict-dynamic`; nonces force dynamic rendering.
7. **Tailwind 4 has no `content` globs** — it scans everything not gitignored, CSS files excluded.
8. **Supabase backups exclude Storage objects.** A PITR restore desyncs `storage.objects` both ways.
9. **Ghost Content API CORS is open** — verified live and in source.
10. **AD-30's "exactly three" is falsified by the inventory** — A9 #11 needs a fourth mode-scoping kind.
11. **§7.3's list of five missing constructs is at least eight** — pagination (A34), nested repeats
    (A9 #6), positional helpers `@first`/`@index`. **Round 1 decision 8 — walk the full 484 — is still
    an instruction, not an answer.**

### 2.2 Round 2's confirmed facts — all executed, all new

Environment additionally: real **Ghost 5.130.6** (bundling gscan **4.49.7**) and **Ghost 6.58.0**
(bundling gscan **6.4.2**) in Docker; gscan 4.49.7 and 6.4.2 side by side; Ghost's own bundled
`intl-messageformat` **5.4.3**.

1. **Supabase is withdrawing automatic `public`-table grants** — default for new projects
   **2026-05-30**, **enforced on existing projects 2026-10-30**. Under the new default the old
   `SCHEMA.sql` applied with **0 errors** and left **29 of 30 tables unreachable**. **Fixed and
   verified: 36 assertions pass** (Round 1 baseline 23).
2. **Ghost 5.130.6 bundles gscan 4.49.7, not 6.4.2.** The two v5 specs differ: both `GS110` rules are
   **errors** in 4.49.7 and **warnings** in 6.4.2; three `GS050-CSS-KGVID*` rules exist only in
   4.49.7; `GS005-NO-INLINE-DYNAMIC-PARTIAL` only in 6.4.2. **Fixed: the gate now reproduces both
   real Ghosts exactly.** `GS100`, `GS051`, the 20-key cap and the five types are identical in both —
   **AD-17 and AD-18 survived the split**, and AD-17's three GS100 behaviours were re-proved on 4.49.7.
3. **Round 1 decisions 2 and 6 were jointly incoherent** — the emitted partial shipped a raw `{§01§}`
   with the user's text **absent**. **Fixed:** substitution is a pipeline stage, last, over the whole
   file tree.
4. **gscan is blind to compiler leakage.** A theme carrying a leaked marker, lost user text, a literal
   `data-repeat` attribute **and** an orphan partial scored **0/0 on both specs**. AD-34's gate is the
   only thing that can catch it.
5. **Ghost identifies a theme by the zip FILENAME**, not `package.json.name`. Four identical zips
   under four names produced four themes. The filename is also the activate and delete key.
6. **Ghost destroys a stored custom-setting value when its `type` changes** and **resets it when the
   value leaves the `options` list** — executed on **both** 5.130.6 and 6.58.0. Untouched settings
   keep their values, so the destruction is specific.
7. **`{{#get "tiers"}}` — VERIFY 14b closed.** With one hidden tier: `tiers.length` = **2**, but
   `{{#foreach}}` yields **1**. `visibility:none` and `type:paid` each give length 1 and **zero** rows.
   The filter applies to the serialized rows, after the count. **Both companions were half right.**
8. **Ghost's `{{t}}` helper HTML-escapes its output.** `&#123;` in a locale renders as `&amp;#123;`.
   With ICU's `'{'` escape also throwing on 5.4.3, **no input yields a literal brace** — so FR-Q8
   refuses rather than repairs, which is what the string catalog's S0 always said.
9. **`{{body_class}}`**, identical on both versions: home `home-template`; post
   `post-template tag-{slug}`; page `page-template page-{slug}`; tag `tag-template tag-{slug}`;
   author `author-template author-{slug}`. It carries **nothing** from `@custom`.
10. **`GS090-NO-LIMIT-ALL-IN-GET-HELPER` is a v6-spec rule only** — absent from the v5 spec in both
    gscan majors. So is `GS090-NO-LIMIT-OVER-100-IN-GET-HELPER`.
11. **Excluding one Koenig card adds 12 warnings, not 10** (MEASUREMENTS §7 was wrong). **Six cards —
    A33's full set — cost 53 on Ghost 5 and 50 on Ghost 6**, and the 3-warning delta is exactly the
    video-thumbnail rules only 4.49.7 carries.
12. **`PRELUDE.sql` mis-modelled Supabase**, granting `all` where the platform documented four verbs.
    `grant all` confers TRUNCATE, and **TRUNCATE is not subject to RLS** — in that test database an
    ordinary user truncated AD-7's server-only tables. **Not a production hole**; a harness hole, and
    the whole RLS proof rested on it. **Fixed and cited.**

### 2.3 What SURVIVED attack — do not spend Round 3 re-attacking these

- **Decision 1's escaping survives marks.** Eight compositions — bold boundary inside a brace run, a
  boundary between the two `{` of `{{`, an `href` with braces, nested marks over `{{#if x}}…{{/if}}`,
  the FR-Q3 lock, pasted HTML with both, a user URL with braces and a quote, a user typing the
  marker — **all shipped inert, all compiled, none produced live Handlebars.**
- **VERIFY 14a is safe** — retitling a page with a custom template changes neither slug nor
  `custom_template`.
- **AD-30 cannot be collided through `body_class`** — Ghost namespaces tag/page/author classes.
- **AD-14 holds for the spike** — byte-identical across four LANG/TZ combinations and across
  `jsonb` vs JS key order.
- **RLS on every base table**; cross-tenant reads and writes blocked everywhere attacked; **AD-8**
  and **AD-28** hold at the RLS layer; **AD-31's** column-grant insight is correct; **AD-19's**
  transaction-scoped lock variant is the right choice; **AD-7, AD-9, AD-6** hold.
- **No sequences, and no relation that is neither table nor view**, is reachable by `authenticated`.
- **The spike reproduces**: 16/16 checks, and **0 errors / 0 warnings under both correct checkers**.
- **MEASUREMENTS §3, §4, §5, §6, §10, §12 are sound.**

### 2.4 Round 2's OWN blind spots — Round 3 starts here

1. **Passes 2, 3 and 4 never ran.** See Part 0. This is the big one.
2. **Round 1 decision 8 was never done** — the full 484-design walk that would turn "at least eight
   missing constructs" into a complete list. It remains an instruction.
3. **Round 1 decision 10 was never done** — the stress fixture is still not checked in, so **AD-11's
   budget has still never been re-measured on realistic sections**, and Round 2's §13c timing is
   explicitly scoped to a two-section theme and is *not* comparable.
4. **VERIFY-AT-BUILD 29 is unresolved** — `storage.buckets`' own RLS and grant state on real Supabase.
   The docs describe `storage.objects` only. AD-32 deliberately declines to assert it.
5. **Never tested at all:** the DOMPurify/SVG upload path (FR-K2), the CSP in a running Next app, the
   canvas renderer beyond the repeater case, Variant Shuffle / Site Remix preservation, the Style
   Pack token system, the synthesis defaults, the entitlement state machine, accessibility / the
   render matrix, and the edit-lock protocol (Round 1 decision 32's state diagram).
6. **Two known gaps were marked rather than closed**, deliberately, because closing them needs a
   design decision: `assets.stored_bytes` is still client-settable **at INSERT**, and forging
   `edit_locks.holder_session_id` **without advancing `lock_generation`** is still possible.
7. **Determinism was never shown across two machines** — only across LANG/TZ on one.

---

## Part 3 — Decisions taken. Treat as SETTLED; do not re-litigate.

**Round 1: 33 decisions** (`STRESS-TEST-R2.md` Part 3). Three now carry Round 2 annotations in place:
decision **3** is *half refuted* (the revoke was right; `security_invoker = true` breaks the view),
decision **6** is *amended* (substitution runs over the file tree), decision **25** is *dropped*.

**Round 2: 16 decisions** (`ROUND-2-DECISIONS.md`), **all implemented and committed.** Four of them
changed on contact with execution, and the changes are the interesting part:

| # | Decided as | What actually happened |
|---|---|---|
| R2-14 | transform user braces to `&#123;` in translations | **Refuted.** `{{t}}` HTML-escapes, so the entity renders literally. Reverted to *refuse*, which the string catalog's S0 had always specified. |
| R1-3 | `security_invoker = true` + revoke writes | **Half refuted.** Invoker breaks the view outright. Definer kept, verbs revoked. |
| R2-10 | specify the slug function and collision rule | **Refined.** §7.4 already rules on it for *custom template names*; only the layer-name surface is unruled. |
| R2-4 | one `alter default privileges … on tables, sequences, functions` | **Syntax error.** One object type per statement; shipped as three. |

**Round 3 may find a decision wrong on new evidence — that is in scope and valuable.** Four already
were. But it must not re-open one merely to re-argue it.

### ⚠️ Live contradictions

Round 2 **closed** the one Round 1 flagged (the tiers endpoint — both companions were half right, and
both now carry the split behaviour). **No new one was found.** If you find a pair of normative
documents that contradict each other, **stop and say so rather than picking one.**

---

## Part 4 — The four passes

**Budget guidance, and it is the point of this round:** Pass 1 is deliberately small. Passes 2–4 have
never run. If you find yourself deep in execution with the reasoning passes untouched, you are
repeating Round 2.

### PASS 1 — Execute. Small, targeted. No skill.

Only the things reasoning cannot settle, in expected-yield order:

1. **Round 1 decision 10 — build the stress fixture and check it in.** This blocks AD-11 and it has
   now blocked two rounds. Realistic sections, `tools/stress/`, re-run under Node 24 in a 2 GB
   container, and **re-measure the two-checker gate on it** so MEASUREMENTS §13c stops being scoped
   to a toy theme. Measure Fluid concurrency while you are there (Round 1 decision 11).
2. **VERIFY-AT-BUILD 29** — `select` and `update` `storage.buckets` as `authenticated` against a real
   Supabase project. AD-32 is deliberately silent until this runs, and E8 ships client uploads on it.
3. **The two paths Round 2 never touched:** the DOMPurify SVG upload path (FR-K2) — feed it the
   standard SVG XSS corpus — and the **CSP in a scaffolded Next 16 app** (Round 1 decision 5), where
   the nonce-vs-SSG collision is still only reasoned.
4. **Determinism across two machines** (AD-14). Round 2 showed LANG/TZ stability on one machine.
   A different CPU, a different Node minor, a different filesystem order.
5. **The two marked-not-closed gaps** from 2.4 item 6, if a design decision can be reached:
   `assets.stored_bytes` at INSERT, and the edit-lock protocol.

### PASS 2 — `/bmad-review lenses=adversarial,edge-case-hunter,verification-gap`

Run it over `ARCHITECTURE-SPINE.md`, `SCHEMA.sql` and `MEASUREMENTS.md` together, carrying Part 2 of
this file in as `also_consider` so no lens re-derives two rounds of work.

The **adversarial** lens is load-bearing and requires at least ten concrete findings — an empty list
is a signal to re-check, not a pass. Round 1 mined the epic-pair seam; Round 2 found the
decision-pair seam by execution. **Point Round 3's somewhere neither has been:**

> Take Round 1's 33 and Round 2's 16 decisions as implemented — because they now are. Construct pairs
> that are each individually correct and **jointly incoherent**. Round 1's headline was AD-4 × AD-5;
> Round 2's was decision 2 × decision 6, and it was found by *running* them. Find the next one **by
> reading**, since the executed surface is now well covered.

Also aim it at units no round has opened: the **12 Style Packs** against the 484 designs; **Variant
Shuffle (FR-D13)** and **Site Remix (FR-D17)** against FR-D19 parking and decision 28; the
**Synthesis Defaults (FR-D6)** against AD-22 and AD-27(d); **Appendix F.1's plan matrix** against
AD-28.

The **verification-gap** lens: point it at the **seven `research-*.md` companions**, which outrank
the PRD body on any Ghost fact and have still never been audited as a set. Round 2 proved two of them
were each half wrong about the same endpoint — *that pattern is the hypothesis to test across the
other five.* Which claims read like facts about an external platform but carry no citation, no
fixture and no executed evidence?

The **edge-case-hunter** lens: the surfaces still untested — Style Pack token resolution, the
synthesis/main-feed designation rule, the entitlement state machine, and the render matrix.

### PASS 3 — `/bmad-party-mode --party ghost-build-room`

That party is persisted for exactly this and its memlog carries Round 1. Put the Ghost-specific
claims in front of it — the ones where being wrong is expensive:

- **Round 1 decision 8, finally.** Walk the full 484-design inventory with Ravi and produce the
  **complete** list of missing directive constructs, category by category. Two rounds have deferred
  this. It gates E4.
- **A33 Koenig Card Treatments, now quantified.** Round 2 measured it: six card designs cost **53**
  styling obligations on Ghost 5 and **50** on Ghost 6, and the 3-rule delta is video-thumbnail rules
  only gscan 4.49.7 carries. That number lands on **E7 and E10 simultaneously**. Is A33 worth six
  designs at that price, and does the answer change per design?
- **Ghost 5.x specifically.** NFR-7 supports it publicly and T3 tests it permanently, and Round 2
  proved the two majors genuinely diverge. What else in the theme structure or helper surface breaks
  on 5.x that a 6.x-shaped assumption would miss?
- **The custom-setting destruction rule** (2.2 item 6) against **FR-Q2's key freeze and library
  updates**: a library update that changes a promoted control's type or drops an option silently
  wipes the site owner's Ghost-side choice. AD-9's freeze now covers type and options — is that
  enough, or does a library version bump need a migration path of its own?

### PASS 4 — `/bmad-advanced-elicitation`

Take everything from passes 1–3 and run **red team** and **pre-mortem** over the synthesis.

The pre-mortem framing, deliberately different again: *it is eighteen months out, the library is
built, all 49 decisions were implemented as written, **and the four that Round 2 refuted were
implemented in their original form because nobody re-ran them.** What failed, and how far did it
spread before anyone noticed?*

Weight it toward:
- **a decision that was correct when taken and expired** — Round 2 found two on external calendars
  (Supabase's October cutover, Ghost's bundled gscan). Which others have a clock on them?
- **a fix applied in one place and not propagated to its siblings** — this has now happened three
  times (decision 6's two halves, AD-9's two axes, the gate's two majors).
- **an unverified external claim propagating from inside something that looks like evidence** — the
  Round 2 variant. `PRELUDE.sql` and `checkVersion` both looked like proof.

---

## Part 5 — Reporting

One consolidated report at the end, ranked by severity. For each finding:

- **What breaks** — concretely. Name the two units that diverge, or the input producing wrong output.
- **How you know** — the command and its output, or the source file and line. Neither means it is an
  opinion; mark it as one.
- **Which AD or which decision** is missing, wrong, or too loose.
- **What you would change** — one sentence.

Separate **CONFIRMED** (executed) from **SUSPECTED** (reasoned). Do not inflate. Say plainly which
invariants survived — knowing what held is as useful as knowing what broke, and after two rounds a
great deal has held.

**Then, in a second section, restate every finding in layman terms** with numbered options and one
marked **(RECOMMENDED)**. The owner is not an engineer and will decide from that section. Use
concrete analogies; never leave a recommendation implicit.

**Say explicitly which passes you ran.** Round 2's most useful admission was that three of its four
did not.

You may edit files — this is a git repository and the owner has authorised edits in prior rounds —
but **branch first, and do not edit a normative artifact inside the same commit as its evidence.**
If two approved decisions contradict each other, stop and say so rather than picking one.

### Do not spend the run re-deriving these

Everything in Part 2, plus: Handlebars' backslash escape is not composable; `{{x}}}` is a parse
error; `GS100` is an error on **both gscan majors** and fires when any declared `config.custom` key
is unreferenced, with `{{#if}}` guards and partials both counting as references;
`GS051-CUSTOM-FONTS` requires both font variables in one file on both majors; the `config.custom` cap
is 20 and the allowed types are `select|boolean|color|image|text` on both; excluding a Koenig card
restores gscan's rules for it; Vercel's limits (Pro 300 s default / 800 s max, 2 GB default / 4 GB
max, 4.5 MB body cap); `middleware.ts` is deprecated in Next 16 for `proxy.ts`; a Vercel env var
cannot change without a redeploy; a column-level REVOKE is a no-op while a table-level GRANT stands;
TRUNCATE is not subject to RLS.

### One overlap to know about

`/bmad-architecture` with the **validate** intent runs the Reviewer Gate against the spine and
produces a bespoke HTML report. That gate has already been run on this spine and its findings are
folded in. Run it **last, and only if you want the HTML report as a deliverable**; expect it to
partly re-cover Pass 2.
