---
title: Inflozo — Build Sequence & Handoff Prompts
status: operational note (not normative; `prd.md` governs on any conflict)
created: 2026-08-19
updated: 2026-09-04 (tenth pass) — steps 1, 2, 3, 4, 5, 5B and 5C COMPLETE; THE OWNER WALKED 5B ON 2026-09-04 AND STEP 6 IS OPEN. His walk findings are fixed in their stories, not by another design pass first (R-80, §A13), and the Appendix A prompts run as two sessions from APPENDIX-A-PROMPTS.html in parallel. TWO BUILDS EXIST AND NEITHER REPLACES THE OTHER: `ux-designs/prototype/index.html` is the ANNOTATED one (5b — checkable against the frames) and `ux-designs/walkthrough/index.html` is the PRODUCT one (5c — no scaffolding, it behaves; double-click this to see how it will feel). WHAT IS OWED NOW IS STEP 6 — the story breakdown; the Appendix A export landed 2026-09-04 and both builds lift it; the walk of 5b (R-75's gate, "walked" defined under step 5b's *The walk*) is done and its date stands. The library is derived, never restated: run `python3 tools/inventory-gen.py --check`. The rulings live in prds/.../reconcile-designs-decisions.md — §A the step-4b rulings, §A2-§A4 the 2026-08-31 additions — and four of the controls pass's decisions are reversed there (D3, D17, D26, D27-in-half). One step-2 prompt still contradicts executed evidence and stays flagged in place rather than deleted
covers: the steps from finished PRD to first story, what each needs from the owner, and a self-contained prompt for each
---

# Build Sequence

Written 2026-08-19, immediately after `prd.md` reached **v4.0 / final**. This file exists so no step has to be reconstructed from conversation, and so each one can be started cold.

> **Starting cold? Read `INDEX.md` first.** Every document in the project with a one-line brief on
> what it is and whether it is still authoritative — generated from disk, so it cannot drift. Its
> four statuses matter: **live** (edit these), **tool** (runnable), **record** (dated — *do not
> edit*), **retired** (kept for provenance only). `INDEX.html` is the same thing for a human.

## Where things stand

> **Refreshed 2026-08-31.** Steps 1, 2, **3** and **4 (both halves)** are COMPLETE, **and so is the
> inventory merge**. Do not provision droplets (they exist), do not run the step-2 prompts (done, and
> one is WRONG — see the ⚠️ in step 2), do not run any category prompt (every category is designed,
> patched and exported), do not re-run the design patch pass (it ran 2026-08-31), and **do not re-run
> step 4** — 4a wrote `prds/…/reconcile-designs.md` and 4b wrote
> `prds/…/reconcile-designs-decisions.md` on 2026-08-27, extended 2026-08-31.
> **Register item 47 is CLOSED by execution** and refuted its own premise; there is no per-template
> `{{#get}}` budget, so **R-20's cap was withdrawn — no hard cap, the panel warns past 25.**
> **Steps 5B AND 5C ARE BUILT (2026-09-03), and they answer different questions.**
> `ux-designs/prototype/index.html` (**5b**) is the **annotated** build: one page per surface
> `EXPERIENCE.md` names, the four journeys and eight flows as clickable trails, and every page naming
> the frame it derives from — that is how you check a screen is *right*.
> `ux-designs/walkthrough/index.html` (**5c**) is the **product**: the same design with every
> annotation removed and the behaviour put on, so you can find out whether it is any *good*.
> Both open on a double-click. Step 5 completed the same day:
> `ux-designs/ux-Inflozo-2026-09-03/` holds both spines, `status: final`.
> **The owner walked 5b on 2026-09-04 (R-75's gate is met); step 6 is open, and step 7 is the loop that
> follows it.** R-30 … R-38 were propagated on 2026-08-31 and step 4 owes nothing: the spec half landed
> in the design patch passes, all verified (`reconcile-designs-decisions.md` §A5–§A9). **Step 5 added `EXPERIENCE.md` Appendix A — one Claude Design prompt per undrawn surface
> group, one that corrects existing frames, one for the editor below 1440; its `### A` headings are the
> count** — and they block nothing either.
> **Read `reconcile-designs-decisions.md` §B before trusting any D-number anywhere in this project:**
> D3, D17 and D26 are reversed, and D27 is reversed in half.
> **Counts:** this file states none. `python3 tools/inventory-gen.py --check` prints the library,
> `python3 tools/derive-module-reach.py` the behaviour registry.

| | |
|---|---|
| `prd.md` v4.1 | ✅ **final** — every count in it now derives from the design export rather than being written down (standing rule 3); `tools/inventory-gen.py --check` is the gate |
| Normative companions | ✅ all present, precedence order stated in the PRD preamble |
| Design prompt 1 | ✅ run — 27 mockups in `design/mockups/` |
| Design prompt 2 | ✅ **run and exported** — the S1–S13 editor screens and M1–M9 pages are in the design export (verified 2026-08-21), joined by **S14 Editor Cards** on 2026-08-25 |
| Design prompt 3 | ✅ **COMPLETE — every category**, each with its own `<ID> <Name> - Spec.md` carrying all ten fields, in `design/claude-design-export/` (the zip is authoritative; `Inflozo/` is its extraction). **The export is the count**, and since the merge the inventory is *generated* from it (`tools/export-roster.py` → `tools/inventory-gen.py`), so it can no longer drift |
| **Controls reconciliation** | ✅ **run — `CONTROL-PROMPTS.html`.** The owner's A1–A3 control audit was extended to every category; the P0 editor-primitives session and one patch prompt per category ran in Claude Design (2026-08-24/25). Every spec now ends with a **Reconciliation notes** section listing the conflicts that patch hit — many marked *flag to the owner* — and the 39 decisions the pass recorded are **all ruled** (2026-08-24) — **but read `reconcile-designs-decisions.md` §B first: D3, D17 and D26 were later reversed and D27 half-reversed.** Those notes were step 4's third input |
| **Architecture — step 1** | ✅ **DONE.** `architecture-Inflozo-2026-08-19/` — the invariants (AD-1 upward, and the file is the count), full schema + RLS, and **four stress-test rounds plus a reliability round** whose findings are applied. `ARCHITECTURE-SPINE.md` is the artifact; `MEASUREMENTS.md` is the executed evidence, and it has grown every round since |
| **T1 / T3 droplets** | ✅ **PROVISIONED** — `ghost6.inflozo.com` (Ghost 6.58.0) is **T1**, `ghost5.inflozo.com` (Ghost 5.130.6) is **T3**. Both seeded, both credentialed in `tools/probe/.env`, both used by rounds 3 and 4 |
| **E0(b) platform spike — step 2** | ✅ **DONE to the limit of what is reachable.** The register has grown every round and every item executable without a Ghost(Pro) site is closed **by execution against both real Ghosts** — **the file is the count, not a number written here** (standing rule 3). What remains is blocked by choice, not by effort: items 1–2 (⛔ Ghost(Pro), needs T4), 16–17 (E4 tooling, belongs to that epic), 35–36 (deferred by owner decision in round 4). **Item 34 was closed by execution on 2026-08-21** — Round 4's only SUSPECTED security finding, refuted |
| **E0(a) mark-emission spike — step 2** | ✅ **DONE.** Both emitters exist and are proven to agree **node by node** — §7.3's exit criterion made runnable — plus AD-36's vectors. **Story 4.2 moved both proofs into `packages/section-runtime/src/{agreement,ad36}.test.ts`, so `pnpm check` and therefore CI run them**; the package's test run prints its own count and none is written here (standing rule 3). Both defects this document named are fixed. `spike-compiler/` is **retired**, not repaired |
| **The live Supabase project** | ✅ **matches the schema.** Reset and re-applied by the owner 2026-08-20 in the dashboard: every assertion passes and container and hosted agree exactly on the policy count (the harness prints both; this file does not restate them). F13 confirmed on the real platform: 4 users → 4 profiles → 4 entitlements |
| **Reliability** | ✅ **NFR-4's restore drill run for the first time — and the backup did not work.** Two silent defects, both fixed and written up as `RESTORE-RUNBOOK.md`. Deliberate failures were also run against a real Ghost: four behaved, one did not (register 39) |
| **Documentation gate** | ✅ **`tools/doc-audit.py`** — three propagation audits were run by hand and every one found something, always in the most recently added thing. Now a script with the harness's contract: **it exits non-zero on drift.** Run `--check` at the end of every round and before any commit that adds a document (AD-36b) |
| **For a human** | ✅ `ARCHITECTURE-IN-PLAIN-ENGLISH.html` — the whole system without jargon, 12 sections and 7 diagrams. The document to hand a designer, an investor or a first engineer |
| **Step 4a — the review** | ✅ **DONE 2026-08-27** — `prds/…/reconcile-designs.md`: every category spec as it then stood, P0 and the S/M screens reconciled. 1,086 findings, 41 probe families, a 1,078-row owner-flag register, and the PRD amendments rolled up by FR. Machine-readable findings beside it as `reconcile-designs.findings.json`. It is a `record` — never edit it |
| **Step 4b — the Ghost Build Room** | ✅ **DONE 2026-08-27, extended 2026-08-31** — `prds/…/reconcile-designs-decisions.md`: the rulings, each naming the documents that must move (§A from the room; §A2–§A3 from the design patch pass and the §F asks; §A4 the re-verification of step 5's work list). All 66 ghost-infeasible findings and all five decision-collisions closed. **Four probe families left the register** — 2 and 31 closed by execution against T1/T3 during the session, 8 and 9 deleted by the native-search ruling, and 1 reduced to its budget half (now register item 47). **Four approved decisions superseded: D3, D17, D26, D27-in-half.** Tier-1/Tier-2 propagation landed the same day (`MEASUREMENTS.md` §29, `VERIFY-AT-BUILD.md` 47–51, `CONTROL-PROMPTS.html`, the spine); **the inventory merge has since landed too** |
| **Design patch pass** | ✅ **RUN 2026-08-31** — one prompt per category (`DESIGN-PATCH-PROMPTS.html`, generated by `tools/design-patch-prompts.py`), applying the step-4b rulings to the specs themselves. Verified by `python3 tools/verify-design-pass.py`: every structural check passes. It raised 28 questions; two reached the owner and are ruled as **R-30** and **R-31** |
| **The inventory merge** | ✅ **DONE.** The inventory is generated from the export and gated; A23 Search is deleted; every per-category `Content:` / `Controls:` / `Data:` union and both of research §7's design-list columns are re-derived from the export; `derived-fields-A1-A12.md` is retired. **R-30 … R-38** propagated on 2026-08-31 — `reconcile-designs-decisions.md` §A3 is the ledger |
| Journeys & flows | ✅ **DONE 2026-09-03 — step 5.** `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` and `EXPERIENCE.md`, both `status: final`. Four journeys, eight flows, every surface with one stable name and a named source frame; **Appendix A carries a Claude Design prompt per undrawn surface group** (eight at the time of writing; the headings are the count). Found the **Paywall editor already drawn** at `C Post Body` C3a, which §37.7 called missing; found a library total in `S3`'s product copy that both controls had been blind to for a third time. Four rulings in `reconcile-designs-decisions.md` §A11 (R-76…R-79); `prd.md` FR-D1, FR-J7 and FR-J9 moved |
| Static prototype | ✅ **BUILT 2026-09-03 — step 5b** (owner's ruling R-75, 2026-09-02). `ux-designs/prototype/` — **double-click `index.html`**, no server and no build step. One page per surface `EXPERIENCE.md` names, every panel/pill/marker/sheet as a section of the page it lives on, and the four journeys and eight flows as labelled trails; every page's first HTML comment names the frame it derives from (R-74) and the section it implements. Built from the frames as they stood — **the Appendix A export landed 2026-09-04 and the pages that said "not drawn" now lift the D canvases**. ✅ **Walked 2026-09-04** — the date stands under *The walk*; step 6 is open |
| Walkthrough | ✅ **BUILT 2026-09-03 — step 5c; rebuilt on the Appendix A export 2026-09-04.** `ux-designs/walkthrough/` — **double-click `index.html`**, which opens on Sign In as a user would meet it. No scaffolding on a product screen: every screen is a frame lifted from the export and patched with links and hooks — menus, popovers and sheets open from the control that raises them; segmented controls, tabs and radio lists pick; **the first deploy walks all six steps** (destination, the safety-net offer and its declined path, the backup gate with its `ghost backup` shortcut, pre-flight with the drift report, ship, live — and Deploy only ends on its own drawn ending); later deploys walk four; deploy history pins; the dashboard raises the new-project, at-the-cap, over-limit and which-project sheets; the editor carries the complete template switcher, the canvas markers, the skip link, the narrower layouts at 834 and 720, and `P`, `L`, `Esc`, `]`, `[`. **What it does not do is listed in `_screens.html`** — detail cards with no drawn trigger, the two wrong-mechanism frames A7 left (B22, B18), and states no frame draws. `_screens.html` and `_selfcheck.html` are the two files that are not product screens. **It does not replace 5b** — a change to the design belongs in both, and 5c is walked after 5b, for feel |
| Stories | 🔵 **OPEN — step 6.** The owner walked 5b on **2026-09-04** and wrote the date under step 5b, *The walk* (R-75). **UI issues are fixed inside the stories that own their screens, not by another Claude Design pass — R-80, §A13, as amended: he tests every UI story on the deployed site from its spec's manual-test script and reports what he finds.** The Appendix A prompts still run, as two sessions, in parallel with the stories. **The loop is step 7**, and its board is `STORY-BOARD.html` (R-84) |

## The BMAD skill for each step

Every step below runs through a BMAD skill. Paste the prompt **including its leading `/command`** — the slash command invokes the skill, and the text under it is the context that skill needs.

| Step | BMAD skill | BMAD role |
|---|---|---|
| 1 — Architecture | `/bmad-architecture` | Architect (Winston) |
| 2 — The two E0 spikes | `/bmad-build` | Dev (Amelia) |
| 3 — Design prompts 2 & 3, then the controls pass | *(owner, in Claude Design)* — ✅ done | — |
| 4a — Reconcile designs vs PRD, architecture and Ghost | `/bmad-review` | verification-gap + adversarial lenses, category by category |
| 4b — Rule on what reading could not settle | `/bmad-party-mode --party ghost-build-room` | **The Ghost Build Room** — Ravi (Ghost CMS expert) · Winston (Architect) · Amelia (Dev) · Murat (Test Architect) · Sally (UX) · Dana (the shipper) — with **the owner in the room** |
| 5 — Journeys & flows | `/bmad-ux` | UX (Sally) |
| 6 — Epics & stories | `/bmad-create-epics-and-stories` | Scrum Master |
| 6b — Readiness gate | `/bmad-sprint-planning` | Scrum Master |
| 7 — The development loop, per story | `/bmad-build` (Create, Dev, Fix) · `/bmad-code-review` (Review) · a session with the deploy keys (Deploy) · **the owner** (Test) | Dev (Amelia) · reviewers · Umang |

The PM stage is already complete — `prd.md` **v4.1** is its output. **Two deprecations to avoid:** `bmad-create-architecture` forwards to `bmad-architecture`, and `bmad-create-story` / `bmad-dev-story` are superseded by `bmad-build`. Use the current names.

Once stories exist, the development loop is **step 7** below: `/bmad-build` per story, `/bmad-code-review` and the `/bmad-testarch-*` skills on the QA side, the owner's own test on the deployed site, and a commit after every phase. The story board (`STORY-BOARD.html`) carries each phase's prompt, copied from step 7.

## Standing rules — these apply to every step below

These were each learned expensively. They are not style preferences.

1. **A claim about an external platform is a hypothesis until read in that platform's source or executed against it.** Four assertions about Ghost entered this PRD as normative text and were later verified **false** — each had deleted or damaged something real, and each carried a confident-sounding reason that stopped anyone re-examining it. New external claims arrive with a citation or a fixture, or they do not arrive.
2. **Propagate, never localise.** Three independent reviewers named "fixed it in its home requirement and stopped" as the single root cause of ~25 defects. A change is not done until every place that depends on it has been visited and either changed or explicitly ticked.
3. **Counts are derived, not restated.** Every count in this project has gone stale at least once. Prefer "as many gates as there are categories" to a literal number whose source lives elsewhere.
4. **A finding is not done until it reaches an owning document** *(AD-36b, added 2026-08-21)*. `MEASUREMENTS.md` is where a finding is **proved**, never where it **lives** — it must also reach an invariant in the spine, a row in the register, or a comment beside the code it governs. Three audits found the same failure and **each time it was in the most recently added thing**, because a big finding gets a long write-up that feels like the work is finished. Enforced, not remembered: `python3 tools/doc-audit.py --check` exits non-zero on drift. **Never edit a document marked `record` in `INDEX.md`** — correcting its figures falsifies the history this project relies on to know which claims were tested when.
5. **Flag, do not guess.** If two approved decisions contradict, or an instruction cannot be followed without inventing a decision the owner never made, **stop and ask**. Guessing has hurt this project before.
6. **Precedence, highest first** (stated in full in the PRD preamble): the two `verify-mechanical-*.md` files → the research companions (on any Ghost fact) → the normative companions → `prd.md` → `addendum.md` → `spike-compiler/`. **Design artifacts are non-normative and never override the PRD** — **on behaviour.** The scope
   matters and was nearly read too wide (owner, 2026-08-31): the PRD decides *what must happen* — states,
   requirements, copy obligations. The **design export decides what it looks like**: which components a
   surface is built from, its tokens, spacing, density and tone. A large deliberate design investment
   lives in `design/claude-design-export/Inflozo/`, and "non-normative" has never licensed inventing a
   second interface vocabulary beside it. **Extend the export; do not restart it.** Where a surface has
   no frame, extrapolate from the nearest one that does — same components, same tokens — and write a
   Claude Design prompt so it is drawn *in the same project*, rather than described in prose and lost.
   **Any UI or UX task reads the WHOLE of `design/claude-design-export/Inflozo/`** — it holds the design
   system, every drawn design, a per-category `-0 Category Proof`, the spec files, the executable render
   kits (`*-kit.js`, `_build/`, `interactions.js`, `support.js`), the per-category session prompts and
   the original brief. `Index.dc.html` and `Index - Categories.dc.html` are the map — they list every category design by design, grouped into the five families.
   Never a subset. (There is no `CLAUDE.md` inside the export — that claim was wrong and was
   corrected on 2026-09-02.)
7. **Log every meaningful step to the memlog:**
   ```bash
   cd /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17
   uv run /home/ghost/Dev/Inflozo/_bmad/scripts/memlog.py append --workspace . --type change --text "…"
   ```

## The critical path, and why it is ordered this way

Steps 1 and 2 run **in parallel with the owner's design work (step 3)**, and that parallelism is the point. The FR-D4 mark-emission spike is the one result that could still invalidate the design investment: if text-plus-mark-ranges does not work end to end, FR-D4's model changes and what a design can express with inline text changes with it. **That answer is wanted while prompt 3 is on category three, not category thirty.**

**That race has been won, and the design work is finished.** Steps 1 and 2 landed before prompt 3 started; prompt 3 ran across every category; and the controls-reconciliation pass then patched every one of them against the PRD's control vocabulary and Ghost's verified data surface. **Step 4 then supplied the proof that each can be built on Ghost as specified, and the rulings on everything the design pass could not settle** (2026-08-27, extended 2026-08-31). **The owner walked 5b on 2026-09-04 (R-75); the critical path is now step 6, then the step-7 loop.**

```
✅ Step 1 /bmad-architecture ──► ✅ Step 2 /bmad-build (2 spikes) ──┐
                                                                    ├──► ✅ Step 4a /bmad-review ──► ✅ Step 4b Ghost Build Room
✅ Step 3 Design prompts 2 & 3 + the controls pass (owner) ─────────┘                                         │
   └─ prompt 2 is exported: step 5 is unblocked ────────────────────────────────────────┐           (probes, if any)
                                                                                        ▼                     ▼
                                                                       ✅ Step 5 /bmad-ux ──► ✅ inventory merge ──► ✅ 5b prototype + ✅ 5c walkthrough ──► ✅ walked 2026-09-04 ──► 🔵 Step 6 stories ──► Step 7 the loop
```

**Everything up to and including the walk is done.** Step 5 ran on 2026-09-03 and its spines are
final; both builds were made the same day; the owner walked 5b on 2026-09-04 and the date stands under
step 5b, *The walk*. What remains on the critical path is **step 6 — the story breakdown — and then step
7, the loop**, with the two Appendix A Claude Design sessions alongside. He writes nothing in advance:
he tests each screen on the deployed site once its story is built (R-80 as amended).

---

# Step 1 — Architecture

> ✅ **COMPLETE.** The prompt below is **historical**, kept for provenance. Like step 2's, it carries
> figures that were true when written and are not now — it says §7.6 has "21 verify-at-build items",
> and the register has grown every round since. Do not run it; read `ARCHITECTURE-SPINE.md` instead.

**Produces:** the architecture spine — the invariants everything else is built from.
**Needs from the owner:** nothing to start. Decisions **will** surface mid-way (see below).
**Unblocks:** step 2, and every line of code in the project.

### What it will ask you for

Expect these to come back as questions rather than assumptions:

- **Repo shape** — one Next.js app serving marketing + product is fixed (§7.1); whether the section library, the compiler and the shim are packages in one repo or separate is not.
- **Supabase org structure** — the PRD requires a permanent **Test** environment plus a **Live** set provisioned fresh at go-live (§4). That is two projects on one organization, and the split has cost consequences already modelled in Appendix F.3b.
- **Compile function sizing** — §7.1 mandates budgeting it as a long-running Node function against a *measured* worst case (the 40-section fixture across every emitted template with a full asset set), not against a platform default. Someone has to run that measurement.
- **Owning epic per verify-at-build item** — §7.6 carries **21** items, two of them ⛔ launch-blocking. Each needs an owner.
- **Anything the PRD deliberately left to the Architect** — §7.5's data model is explicitly a *sketch, not a specification*, and the schema story builds the full model from §5 rather than from those eight rows.

### Prompt

```
/bmad-architecture

Create the architecture for Inflozo.

The PRD is final and normative:
/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md

Read its preamble first. It names every normative companion in the same folder and states
the precedence order between them — follow that order exactly, and note especially that the
research companions outrank the PRD body on any fact about Ghost, because the regression risk
in this project has always lived in the distillation step rather than the research step.

Section 7 is addressed to you specifically:
  7.1 Stack · 7.2 Content & data flow · 7.3 Single-source section runtime (mandated)
  7.4 Generated theme structure · 7.5 Data model sketch · 7.6 Key risks & 21 verify-at-build items

Four things are mandated and are not yours to re-open — design against them, not around them:
  - The single-source section runtime: annotated HTML, two renderers over one source, no
    Handlebars runtime in the browser, no `new Function`, so the CSP needs no 'unsafe-eval'.
  - The compiler mechanism of section 7.3, empirically validated in spike-compiler/.
  - The generated theme structure of section 7.4.
  - `addendum.md`, which is normative for mechanism: AD1 local-first persistence, AD2 the
    edit-lock protocol.

Where the PRD is explicitly incomplete, it says so and it is yours to complete:
  - 7.5 is a sketch, not a specification. Build the full schema and its RLS from section 5.
  - The compile function's duration and memory come from a measurement against the 40-section
    stress fixture, not from a platform default.
  - Section 7.6's 21 verify-at-build items each need an owning epic.

Standing rules, each learned expensively in this project:
  - A claim about an external platform is a hypothesis until read in that platform's source or
    executed against it. Four such claims entered this PRD as normative text and were verified
    FALSE. Cite or execute; do not assert.
  - Propagate, never localise. A decision is not done until everything that depends on it has
    been visited.
  - Counts are derived, not restated.
  - Flag, do not guess. If two approved decisions contradict, stop and ask.

Section 8 already fixes the epic sequence and every FR's owning epic — architect against that
sequence rather than proposing a different one. Section 4's build order is binding: the FR-D4
mark-emission spike first, then the E0 platform-verification spike, then the complete shell
block, then the gated categories beginning with Heroes.

Log to the memlog when you finish:
  cd /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17
  uv run /home/ghost/Dev/Inflozo/_bmad/scripts/memlog.py append --workspace . --type change --text "…"
```

---

# Step 2 — The two E0 spikes

**Produces:** proof that the rich-text model works end to end, and executed results for the whole verify-at-build register.
**Needs from the owner:** nothing. The droplets it used to ask for already exist.
**Unblocks:** the shell block, every category gate, and (in risk terms) the design investment in step 3.

# ✅ STEP 2 IS COMPLETE — 2026-08-20

**Do not run the two prompts below.** They are kept for provenance and they are **historical**, not
instructions. One of them is actively wrong (see the ⚠️ on spike (a)).

**What was actually produced, and where it lives:**

| | |
|---|---|
| Both emitters, sharing one code path | `packages/section-runtime/src/core.ts` — ONE walk, with the two required differences (a repeat expands rows here and becomes `{{#foreach}}` there; a binding resolves to a value here and becomes a mustache there) marked in the code and asserted positively. **Story 4.2 moved it out of `tools/stress/compile.js`**, which is now a thin CommonJS adapter over it for the gscan harness |
| §7.3's exit criterion, runnable | `packages/section-runtime/src/agreement.test.ts` — canvas and theme compared **node by node**. It runs in `pnpm check`, and therefore in CI; the package's test run prints its own count |
| The escaping and injection invariants | `packages/section-runtime/src/ad36.test.ts` — AD-36's vectors, AD-4/AD-5, FR-H8's guard rule, each asserting the attack is inert **and** the legitimate case still works. Same: in `pnpm check`, count printed by the package's test run |
| The register | `architecture-.../VERIFY-AT-BUILD.md` — everything reachable closed by execution. **The file is the count**; it has grown every round and any number written here goes stale (standing rule 3) |
| The evidence | `architecture-.../MEASUREMENTS.md` — every claim with the command that produced it. **The file is the count** |

**Both defects this document named are fixed**, and one of them was silent data loss: `wrapGuard`
built the `{{#if}}` from the date helper's *format argument*, so the guard tested an identifier that
never exists, the block never rendered, and the user's content vanished without an error.
`spike-compiler/` is **retired** rather than repaired — see `spike-compiler/RETIRED.md`.

### ✅ The one real ask in this document is DONE — do not provision anything

**T1 and T3 exist and have been in use since round 3.**

| Target | What | Status |
|---|---|---|
| **T1** | self-hosted Ghost **6.x** | ✅ `ghost6.inflozo.com` — Ghost **6.58.0**, gscan **6.4.2**, Ghost-CLI on Ubuntu 24.04, MySQL 8 |
| **T3** | self-hosted Ghost **5.x** | ✅ `ghost5.inflozo.com` — Ghost **5.130.6**, gscan **4.49.7**, same stack |

Both carry an identical seeded fixture — 32 posts, 8 featured, 6 tags, 3 authors, 57 members, a
hidden tier, announcement bar, comments on — and both are credentialed in `tools/probe/.env`
(Admin key, Content key, Staff Access Token). Rounds 3 and 4 executed against them extensively.

**Still owed:** T2 (Ghost(Pro) Publisher, $29/mo) before the deploy paths are verified end to end,
and T4 (Ghost(Pro) Starter) which is deferred but ⛔ **launch-blocking** — see the table at the
end of this file.

### What remains, and it is blocked by choice rather than by effort

T2 (Ghost(Pro) Publisher, $29/mo) is needed before the deploy paths are verified end to end.
**T4 (Ghost(Pro) Starter) is deferred until after MVP by your decision** — but its gate is
⛔ launch-blocking, and you asked to be reminded before launch.

Register items 16–17 belong to E4's tooling and are that epic's to close. Items 35–36 were deferred
by owner decision in round 4, each with its reason recorded. **Item 34 is closed** — it was Round 4's
only SUSPECTED security finding and it was refuted by execution on 2026-08-21, once a probe defect
that had produced three convincing false results was cleared.

---

### ⚠️ Prompt — spike (a). HISTORICAL. **One instruction in it is REFUTED — do not follow it.**

> **The bullet about backslash escaping below is FALSE and was proven false by execution.**
> It survives here because deleting it would hide the lesson, and this project's standing rule 1
> exists because exactly this kind of confident-sounding instruction has damaged it four times.
>
> The prompt says the escaping helper "must escape a **preceding backslash** too". That is §7.3's
> original remedy, and **`AD-5` supersedes it**: Handlebars' backslash escape is **not composable** —
> exactly one backslash escapes a mustache and is consumed, and **every count ≥ 2 evaluates live**.
> There is no backslash count that renders a literal `\` followed by a literal `{{`.
> `C:\{{@site.title}}` is the case no backslash rule can serve.
>
> **What is actually correct, and is built:** user text escapes by **HTML numeric entity** — every
> `{` and `}` a user typed becomes `&#123;` / `&#125;`, after HTML-escaping `&` first. Handlebars
> never sees a mustache and the browser decodes the exact characters back. Proven end to end on a
> 70-section theme, and pinned in `packages/section-runtime/src/{ad36,agreement}.test.ts`.
>
> Anyone re-reading this prompt as an instruction would rebuild a defect that four rounds of
> execution removed.

```
/bmad-build

Build the FR-D4 mark-emission spike. It is step 1 of the PRD's binding build order and it runs
before anything else, because every path by which user text becomes markup depends on it and a
reviewer judged that path unimplemented.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
Read FR-D4, section 7.3, FR-J1 and E0 in section 8. The existing spike is in spike-compiler/ —
reproduce it first and confirm it still passes before extending it.

What must be demonstrated end to end, with a runnable test:
  - Rich text stored as characters plus mark ranges, NEVER as an HTML string.
  - All four inline marks: bold, italic, underline, link.
  - Paste normalization into that model.
  - The compiler as the single place ranges become markup.
  - Every escaping case, including the one the verification caught: the escaping helper must
    escape a PRECEDING BACKSLASH too, or `\{{x}}` renders as `\VALUE` and FR-J1's
    inert-emission guarantee is functionally broken, not cosmetically.

Two known spike defects must be fixed as part of this, both invisible to the existing test.js
because its assertions compare class skeletons and its date helper is a passthrough stub:
  - compile.js:36 — the canvas date renderer discards its format argument.
  - compile.js:154 — wrapGuard derives the guard identifier from a date helper's FORMAT
    argument and emits `{{#if YYYY}}`, a guard on an identifier that does not exist, so the
    block never renders and the content is silently and permanently lost. Guard on the BOUND
    FIELD, never on a helper argument (FR-H8), and add a helper-bound test that would catch it.

Report the result plainly. If the model does not hold, say so and stop — that is a scope change
and it must be raised BEFORE the design sessions go deep, not after.
```

### Prompt — spike (b), the platform-verification spike. **HISTORICAL — this one ran and closed.**

> Two corrections if it is ever re-read: the register is **much larger than 21 and still growing** (it grew as the PRD
> rested on new external facts), and every item on it that does not need a Ghost(Pro) site is now
> closed by execution. The five bullets it lists as "read from source but never run" have all been
> run — several were **refuted**, and each refutation is recorded with its evidence rather than
> worked around.

```
/bmad-build

Run the E0 platform-verification spike: execute EVERY verify-at-build item in section 7.6 of
the Inflozo PRD against a real Ghost, and record each result.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
Targets: T1 (self-hosted Ghost 6.x) and T3 (self-hosted Ghost 5.x). Several items differ
between the v5 and v6 gscan specs, so run both.

There are 21 items. Two are marked ⛔ LAUNCH-BLOCKING and cannot be cleared without a Ghost(Pro)
Starter site, which is deferred until after MVP — record those as still-blocked rather than
guessing. The rest are executable now, and several were read from source but never run:
  - GS100's exact trigger on a fixture (three @custom keys in every emitted theme depend on
    "declared AND referenced never fires").
  - `{{total_members}}`'s rounding and `+` suffix, and that `{{content_api_key}}` renders in a
    theme context — six designs and the whole zero-custom-setting result rest on these.
  - The announcement-bar seed: that an Admin API integration returns announcement_content,
    _background and _visibility, and that clearing the content stops Ghost emitting its bar
    script at all.
  - The NQL build Ghost actually resolves at runtime — two normative rules in FR-I2 are proven
    against @tryghost/nql 0.13.x, but Ghost's package.json declares "catalog:" so its resolved
    build was never verified.
  - What a theme may style INSIDE {{comments}}'s native output — A28's ten designs are scoped to
    thread chrome until this is answered.

Record each item as confirmed, refuted or still-open. A REFUTED item is a scope change and must
be raised as one before the epic that depends on it starts — do not quietly work around it.
This project has been damaged four times by an unverified platform claim entering as fact.
```

---

# Step 3 — Design prompts 2 and 3 *(owner's own work)*

**Produces:** the responsive archetype system, the missing surfaces, the paywall editor (prompt 2); then every category's designs *and* their specifications (prompt 3, run once per category).
**Needs from the owner:** the work itself.
**Unblocks:** steps 4 and 5, and every library build story.

# ✅ STEP 3 IS COMPLETE — 2026-08-25

**What was actually produced, and where it lives:**

| | |
|---|---|
| The export | `design/claude-design-export/Inflozo.zip` — authoritative; `Inflozo/` beside it is the owner's extraction. **The export is the count** of everything below |
| Prompt 3 — the library | One `<ID> <Name> - Spec.md` per category, A1–A34, each design carrying all ten spec fields; the frames as `<ID>-<n> <Name>.dc.html`, plus a `-0 Category Proof` frame per category (tokenisation proof, stress frame, roster) |
| Prompt 2 — the app | `S1 Sign In` … `S13 Suggestions` and `M1 Home` … `M9 404`, plus **`S14 Editor Cards`** (added by the controls pass — FR-Q7's surface, the owner's own ask) |
| **The controls-reconciliation pass** | Not in the original plan, and it changed every spec. The owner audited A1–A3's sidebar controls and found systemic gaps; a full review extended that to every category against the PRD's control vocabulary and Ghost's verified data surface. Its prompts are `CONTROL-PROMPTS.html` — a **P0 · Editor primitives** session (`P0-1` … `P0-6` frames + `P0 Editor Primitives - Spec.md`: inline toolbar, icon slot + picker, item-list controls, member-aware actions, "Populate from…" panel, editor state switcher) and one patch prompt per category — **all run.** It recorded 39 decisions, **all ruled by the owner on 2026-08-24** (Tabler icons · prefix navigation JavaScript-required · ~~third-party search allowed, MiniSearch vendored inside `search-overlay`~~ **D3 REVERSED 2026-08-27 — Ghost's native search only, ruling R-24** · A31's ten designs accepted · visitor-clock dates deferred, and the rest) and a list of carry-forwards for the PRD and the architect |
| **Every spec's `Reconciliation notes`** | The patched specs end with a numbered list of every conflict the patch hit against what the category had already ruled, and how it was resolved — several lines per category are explicitly *flag to the owner* or *ARCHITECT:*. **These are step 4's third input**, alongside the PRD and the architecture |
| ~~What is NOT done yet~~ | ✅ **The merge has since happened.** The specs merged into `sections-inventory.md` after step 4, as planned; the inventory is now *generated* from the export and gated by `doc-audit --check`, and `derived-fields-A1-A12.md` was superseded wholesale and retired |

### What the outputs were required to contain — and now do

Prompt 3's sessions are **design and specification in one pass** — §4 makes that binding. Each design must land carrying:

**Descriptor · structural descriptor tuple · archetype · responsive rule in words · content fields with types and optionality · its own control list in sidebar order with closed value sets · data binding with 0/1/many behaviour · empty states · behaviour module and whether it is edit-safe, plus its no-JS degradation · accessibility notes**

Two of those are newly load-bearing and easy to omit:

- The **structural descriptor tuple** — archetype · containment · ground · item-count class · media placement · emphasis mechanism (six slots since 2026-08-21; the closed sets live in `tools/tuple-check.py`). FR-G5's uniqueness assertion runs over the *tuple*, not the English line, and it must stay unique within its category **after** the per-design control lists are written, since controls no longer distinguish designs.
- The **no-JS degradation statement** for any design declaring one of FR-G7's behaviour modules (the registry in `research-section-js-libraries.md` §2.1 is the list and the count). It is an acceptance criterion, not a note.

Specifications live in the export as `<ID> <Name> - Spec.md` (the design project could not write into the repo's folder, and says so at the head of each file). They merge into `sections-inventory.md` — which already carries the schema and the two-layer (category union + per-design) structure they slot into — **after step 4**, once reconciled.

---

# Step 4 — Reconcile the designs against the PRD, the architecture and Ghost *(✅ COMPLETE 2026-08-27)*

> **Both halves are done. Do not re-run either prompt.** 4a produced
> `prds/prd-Inflozo-2026-08-17/reconcile-designs.md` (+ `.findings.json`); 4b produced
> `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md` — the rulings, which is the file the
> inventory merge worked from and which grew again on 2026-08-31 (§A2–§A4). The prompts below are
> kept as the record of how the step was run.

**Produces:** a reconciliation report (what contradicts, what is missing, what cannot be built on Ghost, what the architecture must now own), then a **decisions file** from the Ghost Build Room ruling on everything the report could not settle by reading — and, if the room asks for it, an execution list for a probe run against the two real Ghosts.
**Needs from the owner:** the export on disk (✅), and **the owner in the room for 4b** — the room presents each unsettled item as a numbered decision with one option marked (RECOMMENDED), and waits.
**Unblocks:** the inventory merge, step 5 (soft), and every library build story.

> **Rewritten 2026-08-25.** The original prompt was written for "the first two or three
> categories" and expected fewer findings than prompt 1's ~31. Both assumptions are gone: all 34
> categories exist, a controls-reconciliation pass has already been run over them, and **each spec
> now ends with its own conflict list** — so this step has three inputs (PRD, architecture, the
> specs' Reconciliation notes) and three questions the old prompt never asked: *can Ghost do this*,
> *what does the architecture now owe*, and *what must the owner rule*. It is two prompts run
> back to back. **4a is unattended; 4b is not.**

### Why two prompts, and why in this order

`/bmad-review` is the right engine for **coverage** — every one of the specs read in full, category by category, with subagents, against a fixed checklist — and it reports findings; it does not argue. A feasibility question ("can a theme partial strip a `+` prefix from a Ghost nav label?") needs someone who knows Ghost to say *no, and here are the two things you can do*, an architect to say where that lands, and the engineer who has to build it to say what it costs — and then the owner to rule. That is what **The Ghost Build Room** exists for (`_bmad/custom/bmad-party-mode.toml`: Ravi the Ghost CMS expert, Winston, Amelia, Murat, Sally, Dana; memory on — AD-36 came out of this room). So: **4a produces the complete question list; 4b rules on it.** Running the room first would mean ruling on a partial list; running only the review would mean a report nobody has decided anything about.

**Standing rule 1 is the hinge of both prompts.** Five confident claims about Ghost have entered this project as fact and been proven false — and the design pass itself repeated the pattern (a category refused member counts "because they live behind the Admin API" when `{{total_members}}` is a theme helper; another treated Ghost 5's two social fields as the whole set). Neither prompt is allowed to *assert* a Ghost fact: it is cited from the research companions or Ghost's docs, or it goes on the **NEEDS EXECUTION** list with the exact probe — T1 (`ghost6.inflozo.com`, 6.58.0) and T3 (`ghost5.inflozo.com`, 5.130.6) exist for that, credentialed in `tools/probe/.env`, and `tools/probe/run-verify-all.py` is the pattern. If 4b sends items to execution, they run as a spike-(b)-style `/bmad-build` **before the inventory merge** — its prompt is written from the room's list, not in advance.

### Prompt 4a — the review (unattended)

```
/bmad-review

Reconcile the Inflozo design library — all 34 categories, the P0 editor primitives and the S/M app
screens — against the PRD, the architecture, and what Ghost actually permits.
Run the verification-gap and adversarial lenses together. This pass looks for what is MISSING, what
CONTRADICTS, and what CANNOT BE BUILT ON GHOST — never for prose quality.

INPUTS, read in this order
  The PRD (normative — read its preamble first, it states the precedence order):
    /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
  On any fact about Ghost the research companions in that folder OUTRANK the PRD body:
    research-ghost-binding-contexts.md · research-ghost-koenig-cards.md ·
    research-ghost-membership-pages.md · research-ghost-empty-values.md ·
    research-section-js-libraries.md (the FR-G7 registry — source of truth for the module list) ·
    appendix-b1-template-contexts.md (where a binding is legal: template × scope × Ghost version) ·
    appendix-h1-string-catalog.md (every chrome string) · sections-inventory.md (Appendix A).
  The architecture:
    /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/
    ARCHITECTURE-SPINE.md (the invariants) and VERIFY-AT-BUILD.md (the register — its items 44, 45
    and 46 were raised BY the design work and are still open).
  The designs:
    /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/
    One "<ID> <Name> - Spec.md" per category, A1–A34, plus "P0 Editor Primitives - Spec.md". The
    specs are the contract; the frames (*.dc.html) are read selectively when a spec is ambiguous
    about what is visible. Also: the S1–S14 editor screens and M1–M9 pages (prompt 2's output).
    EVERY category spec ends with a "Reconciliation notes" section — the conflicts the last patch
    hit against what the category had already ruled, and how it resolved them, with lines marked
    "flag to the owner" and "ARCHITECT:". Those notes are a THIRD source of open decisions and
    every one of them must reach your report (question 6).
  The controls pass that produced those notes:
    /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/CONTROL-PROMPTS.html
    Its §Decisions holds 39 decisions, ALL RULED by the owner on 2026-08-24 — D1 Tabler icons ·
    D2 prefix navigation, JavaScript-required, no no-JS accommodation · D3 third-party search
    allowed, MiniSearch vendored inside search-overlay · D11 A31's ten designs accepted ·
    D13 visitor-clock dates deferred, and the rest. Treat every ruling as DECIDED: do not
    re-litigate it, DO check that each spec honoured it. Its §Carry-forwards lists what the pass
    found for the PRD and the architect — treat those as findings to VERIFY against the specs and
    the spine, never to restate.
  Precedent for format and bar: reconcile-mockups.md beside the PRD — prompt 1's reconciliation,
    ~31 findings. Expect MORE this time, not fewer: 35 specs, each carrying its own conflict list.

PRECEDENCE
  Design artifacts are non-normative. Where a design and the PRD disagree, the PRD wins and the
  design moves — UNLESS the design reveals the PRD specified something unbuildable, incoherent, or
  contradicted by Ghost: that is a PRD DEFECT — flag it, cite the evidence, never pick a side
  silently. Where the PRD body and a research companion disagree on a Ghost fact, the research is
  right and the PRD line is the defect.

STANDING RULES — learned expensively
  1. A claim about Ghost is a hypothesis until read in Ghost's source or docs, or executed against
     it. Every Ghost claim in your report carries its citation: the companion section, the docs URL,
     or the helper/endpoint name. Where reading cannot settle it, do NOT guess — put it under NEEDS
     EXECUTION with the exact probe. Two real Ghosts exist for that, T1 ghost6.inflozo.com (6.58.0)
     and T3 ghost5.inflozo.com (5.130.6), credentialed in tools/probe/.env; run-verify-all.py in
     that folder is the pattern. Executing is a separate run — not this one.
  2. Propagate, never localise — a finding names every place it reaches.
  3. Counts are derived — count the export, the specs and the register; trust no number in a doc.
  4. Flag, do not guess — where two approved decisions contradict, say so and stop on that item.

THE REVIEW — six questions, kept separate in the report, worked CATEGORY BY CATEGORY
  Use subagents (one per category or per small group). Every one of the 35 specs is read in full —
  a sampled review is not a review. Name the design, the claim, the evidence and the verdict.

  1. GHOST FEASIBILITY — can each design be built on Ghost as specified? For every binding, check
     appendix-b1's context matrix; for every helper and field, the research (the nine social
     handles exist only on Ghost ≥ 6.36; Ghost Admin cannot reorder authors; tier prices are in
     subunits and need {{price}}; member forms need data-members-form and sign-out needs
     data-members-signout; the private gate needs {{input_password}}; {{comments}} accepts only
     title/count/mode/saturation; navigation is flat; Sodo searches titles and excerpts only;
     {{#get}} is capped at 100 and may read only template-level context; page.hbs guards on
     @page.show_title_and_feature_image; what error.hbs may run is unverified); for every control,
     what a compiled theme can express (one control writes one data-attribute on the section root —
     per-item styling is impossible; every value set is closed); for every custom-setting use, the
     20-setting cap with 3 reserved. Verdict per item: buildable · buildable with a stated change ·
     not buildable on Ghost · needs execution.
  2. CONTRADICTIONS — a spec or screen showing what the PRD forbids, or contradicting the control
     vocabulary (FR-F1, Appendix C), a binding rule, FR-G7's registry (no invented module names;
     every declared module carries the registry's no-JS sentence — the one waiver is D2's),
     FR-J15's credit, a plan gate, or a count.
  3. GAPS — what the PRD requires that no design covers: section 8's epics; Appendix F.1's plan
     matrix; the four journeys and EIGHT flows (the PRD's six plus the pre-deploy backup gate and
     deploy history with pinning); every editor surface an FR names — the Routes Manager, Theme
     Settings, Translations, the custom-settings builder, the Paywall editor, the Editor Cards
     screen (S14), the pre-deploy check, the drift report, the template-binding checklist, the
     edit-lock choreography; and every primitive P0 promised that some category still lacks.
  4. ARCHITECTURE — everything the designs now ask of the spine and the registry: the new modules
     (nav-transform, contact-form, search-overlay's vendored index, member-form's one-time-code
     branch), the multi-module-per-section ruling, the edit-safe rulings (lightbox, carousel), the
     route-awareness mechanism (A24 · A26 · A27 · A28 all need it), the pack-token asks, the FR-H2
     deltas (an authors source, the fallback field, Count as a stepper, the main feed's owned empty
     state, the A34 pagination control living on the main feed), and the consent-seeding asks
     (announcement bar already; comments accent now). For each: the AD or register row that owns
     it — or "no owner; needs one".
  5. SPEC COMPLETENESS — every design carries all ten fields; every structural-descriptor tuple is
     unique within its category (the closed vocabularies live in tools/tuple-check.py — run it if it
     can read the specs; if it reads only derived-fields-A1-A12.md, say so, because extending it is
     a finding); every declared module carries its no-JS line; every authored list carries
     add/remove/reorder and every Ghost-bound list carries none (register item 44).
  6. THE OWNER-FLAG REGISTER — collect every "flag to the owner", "overrule", "owner to confirm"
     and "ARCHITECT:" line from all 35 Reconciliation-notes sections into one table: spec · item ·
     what was decided provisionally · what the owner or the architect must rule. This table is the
     agenda of the Ghost Build Room session that follows this review.

COUNTS TO DERIVE, NEVER TRUST
  Categories on disk; designs on disk per category (the export carries one more than the PRD's
  inventory — A31 has ten, accepted by D11 — state exactly what the PRD and the inventory must
  change); [Free] designs per category; declared modules vs the registry; custom-setting slots any
  design spends.

OUTPUT
  Write prds/prd-Inflozo-2026-08-17/reconcile-designs.md in reconcile-mockups.md's shape, one
  section per category then the cross-cutting ones, every finding tagged: ghost-infeasible ·
  stale-design · prd-defect · arch-gap · spec-incomplete · needs-execution · consistent (only where
  the confirmation is useful). Every finding names its evidence. End with three lists: (a) NEEDS
  EXECUTION — each with its probe; (b) the OWNER-FLAG REGISTER; (c) the PRD AMENDMENTS this pass
  implies, one line each naming the FR touched. Register the file in tools/doc-audit.py, run
  `python3 tools/doc-audit.py --check` until it passes, and log to the memlog:
    cd /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17
    uv run /home/ghost/Dev/Inflozo/_bmad/scripts/memlog.py append --workspace . --type change \
      --text "<one line: step 4a done — N findings, M needs-execution, K owner flags>"
```

### Prompt 4b — the Ghost Build Room (the owner must be present)

```
/bmad-party-mode --party ghost-build-room

Agenda: rule on everything the design reconciliation could not settle by reading.

Read first, in this order:
  1. /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs.md
     — the review that just ran (step 4a). Its three closing lists are tonight's agenda: NEEDS
     EXECUTION, the OWNER-FLAG REGISTER, and the PRD AMENDMENTS.
  2. /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/CONTROL-PROMPTS.html — §Decisions
     (39 rulings the owner already made on 2026-08-24: they are settled and NOT on the table, unless
     4a found one of them unbuildable) and §Carry-forwards.
  3. This room's own memory — AD-36 and the round-4 findings came out of here; don't re-derive them.

The room, and what each of you owns tonight:
  Ravi — the source of truth on what Ghost permits. For every item: which Ghost version, which API,
    which helper, which file you checked. "You can't" is a complete answer only when it is followed
    by the two things we CAN do. Where reading cannot settle it, name the exact probe and it goes to
    the execution list — nothing is settled by confidence in this room.
  Winston — the architecture. Every design ask lands on an AD or a register row, or gets a new one:
    the new registry modules (nav-transform, contact-form, search-overlay's vendored MiniSearch,
    member-form's one-time-code branch), multi-module sections, the edit-safe rulings, the
    route-awareness mechanism, the pack-token asks, the FR-H2 deltas. No orphan findings — AD-36b.
  Amelia — buildability. You build all of it against the single-source runtime (PRD §7.3), the
    data-attribute control mechanism and the compiler. Say plainly what is cheap, what is a week,
    and where a spec is hand-waving.
  Murat — testability: for every ruling, the fixture or probe that proves it.
  Sally — the person editing their site: is the control still understandable after the ruling?
  Dana — the shippable version, whenever Winston and Amelia disagree.

House rules for tonight:
  - The owner is in the room and rules. Present each item as a numbered decision with its options
    and ONE marked (RECOMMENDED), in plain language with a concrete example — then wait.
  - Standing rule 1 binds Ravi hardest: cite the companion section, the docs URL or the helper name,
    or send it to execution.
  - Work the agenda in this order: ghost-infeasible findings first (they can delete designs), then
    the owner-flag register category by category, then the arch-gaps, then the PRD amendments.
  - Nothing is closed until it reaches an owning document (standing rule 4). Close the session by
    writing prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md: every decision numbered,
    the ruling, who owns its propagation (PRD line · AD · register row · spec), and the execution
    list for a /bmad-build probe run if any item needs one. Top up this room's memory, register the
    file in tools/doc-audit.py, and run `python3 tools/doc-audit.py --check`.
```

### After step 4 — the inventory merge · ✅ **DONE 2026-08-31**

The specs merged into `sections-inventory.md` — the file step 6's category stories open against.
**The per-ruling status is the ledger in `prds/…/reconcile-designs-decisions.md`, immediately under
its propagation table.** That is the honest list; this is the summary.

**The probe ran first, and it refuted its own premise.** Register item **47** ran against T1/T3
before anything was edited (`tools/probe/run-verify-47.py`): there is **no per-template `{{#get}}`
budget.** Ghost races *each* get against a 5000 ms timeout, identically on both majors, and 150 gets
on one template resolved in full. `MEASUREMENTS.md` **§30**; item 47 closed, item **52** added for
the Ghost 6 query dedup. The owner then took the **upward** decision the same day, which the register
row had not anticipated: **R-20's provisional cap of twelve is withdrawn — there is no hard cap, and
the panel warns past 25**, with the cost stated per page rather than per section. `prd.md` FR-H2
carries the new rule.

**What landed.**

- **R-16 is structural, not a one-off edit.** `tools/export-roster.py` reads the export and refuses to
  emit when a spec table and its drawn frame disagree about a name; `tools/inventory-gen.py` writes
  Appendix A's totals and every category's roster from it, and `prd.md` Appendix I's counts too.
  `doc-audit --check` fails on drift, so the inventory **cannot** go stale against the export again.
- **A23 Search is deleted** (R-24, as the owner tightened it on 2026-08-27), and with it
  `A1-9 Search-Forward` and `A4-15 Search`. The three deletions live in one table in `export-roster.py`
  with their reasons, never by deleting export files — the export stays the record of what was drawn.
  The deleted numbers leave **permanent holes**; renumbering would break every cross-reference.
- **Every restated count in `prd.md` is derived or gone** (standing rule 3), including FR-G1's
  long-standing internal disagreement with itself.
- `tools/tuple-check.py` reads the **merged library** rather than `derived-fields-A1-A12.md`, gates
  every live design, and is mutation-tested red on both a forced collision and an out-of-vocabulary
  slot. `derived-fields-A1-A12.md` is **retired**.
- **The design patch pass ran (2026-08-31)** — one prompt per category from
  `DESIGN-PATCH-PROMPTS.html` — so the category specs themselves now carry the rulings.
  `python3 tools/verify-design-pass.py` checks that, one check per ruling, and every structural
  check passes. Six prose scans are flagged `LOOK` by design: they cannot tell a violation from a
  spec recording that it *removed* the thing, so a human reads those six.
- **Both deferred derivations are done.** Every category's `Content:` / `Controls:` / `Data:` union
  lines in `sections-inventory.md` are re-derived from the export (`tools/derive-content-lines.py`,
  `tools/derive-control-lines.py`), and research §7's two design-list columns are re-derived by
  `tools/derive-module-reach.py` — which counts a module only where a design's **own** declaration
  names it, so a name appearing in category prose is not a declaration.
- **`confetti` is deleted from the registry** — no design declared it (owner's ruling 2026-08-31),
  alongside `search-overlay`, `search-expand` and `command-palette`.

- **R-30 … R-38 are propagated (2026-08-31).** The nine rulings taken after the merge reached their
  normative homes the same week the owner took them, and the per-ruling ledger is in §A3 of the
  decisions file. `Appendix D` gained a new **§D.0** — every pack token marked *computed* or *authored*,
  with exactly two authored beyond the palette; **AD-10** gained the refusal to fetch from any video
  provider; **AD-23** the corollary that a fact nobody fetches needs no fixture; **AD-27** the five
  doc-schema row shapes; and `Appendix C` finally defines **R-12's** never-greying Remove button, which
  had been cited for weeks without being written down.

**Every ruling from the merge now has its normative half in — R-2, R-10 and R-29 included** (2026-08-31,
on the owner's instruction to clear them before step 5). R-29's long-outstanding FR is written: it is
**FR-Q10**, owned by E7. R-10 #1 and #7 are both **withdrawn**, each refuted by execution.

**The design half ran and is verified** — patch passes two to five, `reconcile-designs-decisions.md`
§A5–§A9, checked by `tools/verify-design-pass.py`. `DESIGN-PATCH-PROMPTS-2.html`
(`tools/design-patch-prompts-2.py`) carried one self-contained prompt per category that had work —
**P0 first**, because the greyed-control treatment is drawn there once and every later category
points at it. Nothing in it was a question. **Three of them changed
on 2026-08-31** after the owner ruled register 45 — **A1** (Sticky and Stay-transparent may not both be
on), **A2** (design 13 Consent is CUT, its number retired) and **A9** (new to the pass: 12 Filter loses
its filter control) — so those three are re-run if they had already gone.

**When the patched export comes back, the runbook is on the build board** and it is mostly
re-derivation rather than editing, because the export is the count: replace the folder ·
`verify-design-pass.py` (which also guards the two repo-side hand edits) · `export-roster` →
`inventory-gen --write` · `tuple-check` · `derive-module-reach` · `derive-content-lines` /
`derive-control-lines` · `doc-audit --check` **twice**. The one human step is last — read what each
prompt flagged rather than guessed, and carry anything genuinely open to the owner.

**Step 5 is done (2026-09-03), and so is step 5b — the prototype is built and opens with a
double-click.** The owner walked it on 2026-09-04; the critical path is now step 6, then step 7.

---

# Step 5 — Journeys and flows *(✅ COMPLETE 2026-09-03)*

> **Done. The prompt that used to sit here has been replaced by the completion record below.**
> The outputs are `planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` and
> `EXPERIENCE.md`, both `status: final`. **Step 5b has since been built from them**
> (`ux-designs/prototype/index.html`); the owner walked it on 2026-09-04 and step 6 is open (R-75).

**Produces:** the four journeys and **eight** flows — the PRD's six, plus the two decided 2026-08-21.
**Needed from the owner:** three decisions, all taken on 2026-09-03 — R-76, R-77, R-78 (`reconcile-designs-decisions.md` §A11).
**Unblocks:** step 5b — and through its walked prototype, step 6 (R-75).

The PRD preamble delegates these explicitly. Keep this pass separate from step 4 — one verifies, this one authors, and combining them produces a document that half-checks and half-invents.

### ⓘ This step was blocked on prompt **2**, not prompt **3** — and prompt 2 is exported, so it is **unblocked** (2026-08-25)

Re-examined 2026-08-20, and it holds for the two flows added since. Nothing in the four journeys or
the eight flows is a *section* design: they
are the product's own chrome — connecting a site, the snapshot gate, the edit-lock choreography, the
routes-upload card. **None of them depends on the designs prompt 3 produces.** What they do touch
is prompt 2's territory — the ~25 missing surfaces and the paywall editor.

So the real dependency is: **step 5 waits on prompt 2 (small), not on prompt 3 (one session per category).** If
prompt 2 lands early, this step can run months before the library is finished, and there is an
argument it should run *first*: design artifacts are non-normative and the PRD wins, so a flow
authored from the PRD is a better input to prompt 2 than the reverse. Raised as an option, not a
change — the sequencing above is still the safe default.

### ⓘ The design export is the starting material, not a reference to consult *(owner, 2026-08-31 — since 2026-09-02 ruling **R-74**, binding until the project finishes; its pair **R-75** adds step 5b's static prototype gate. Both: `reconcile-designs-decisions.md` §A10)*

The largest single investment in this project so far is the Claude Design work, and step 5 is the
first step that could quietly throw it away — by specifying flows in prose that imply an interface
nobody drew. It must not. **Read the whole of `design/claude-design-export/Inflozo/`, never a
subset** — `Index.dc.html` and `Index - Categories.dc.html` are the map — they list every category design by design, grouped into the five families; there is no `CLAUDE.md` inside it. Three frames are the design system itself (`Calibration Set`,
`Editor Sidebar Kit`, `R Responsive System`); beside them sit every drawn design, a per-category
`-0 Category Proof` carrying that category's tokenisation proof and roster, the spec files, **the
executable render kits** (`*-kit.js`, `_build/`, `interactions.js`, `support.js`), the per-category
session prompts and the original brief. `claude-design-prompt-2.md` §0.1 restates the system in words
and is a `record` you can read.

**The scope of "design artifacts are non-normative" is behaviour, not look** — see standing rule 6.
The PRD decides what a flow does; the export decides what it is built from.

**A surface with no frame is extrapolated, never invented.** Name the nearest frame that exists, state
what changes, reuse its components and tokens verbatim — and write a short Claude Design prompt so the
frame is drawn **in the same project** and inherits the same system. A new visual treatment described
in prose and left there is the failure this note exists to prevent. Every specified surface names the
frame it derives from, which is what makes "we reused the design" checkable rather than hoped for.

**§37.7's frameless list is dated 2026-08-27 — verify each against the export before extrapolating.**
A keyword scan over the frames is inconclusive: several of those words appear on screens that are
about something else. Report any that turn out to be drawn already.

### ⚠️ TWO NEW FLOWS to author, decided after this document's flow list was written

The six flows named below are no longer the whole set. Two more were decided by the owner on
2026-08-21 and **both are blocking, user-facing surfaces** rather than notices:

**(a) The pre-deploy backup gate** — specification in
`architecture-.../BACKUP-GATE.md`, read it before designing. It fires **once per site at first
deploy**, not at connect, and it **blocks the deploy button** until confirmed. It is a checklist —
one checkbox per backup item, then a master confirm — and it opens by stating what Inflozo actually
writes (the theme and `routes.yaml`) *before* recommending a full backup, because a warning that
overstates gets clicked through and a gate everyone clicks through is not a gate. **Three things the
design must not soften:** Ghost's JSON content export does **not** include images and the gate has to
say so; `ghost backup` covers everything in one command for self-hosted customers and should be
offered as the shortcut it is; and **Ghost(Pro) customers cannot bulk-download their images at all**,
which Inflozo cannot fix and must not paper over. Appendix H governs the wording, and the honest
register matters more here than anywhere else in the product.

**(b) Deploy history with pinning** — FR-J7's retention, owner decision 2026-08-21. At most **10
stored versions per project on Pro and 3 on Free, pinned included in that count**. Three rules the
surface has to carry: **the limit is stated, not implied** — a list that silently drops its oldest
entry reads as complete when it is not; **the history must never show a version it cannot restore**,
because a dead Restore button is worse than a shorter list; and **at least one version must stay
unpinned**, enforced in the database, so the pin control needs a clear refusal state rather than a
silent failure. Unpinning is always allowed, by design, so nobody can trap themselves.

**One input this step now has that it did not when it was written** *(Round 4, finding F4)*: the
FR-D18 edit-lock choreography has been **decided by the owner**, and the decision has a shape the
flow must carry. **A takeover is allowed**, and the displaced device is then shown that its session
was taken over and how much unsynced work went with it. That message reads `unsynced_edits` (AD-16:
edits, never ops) and it must be **honest rather than reassuring** — a takeover is not a graceful
hand-off, so work that had not synced is genuinely gone. The security half is already enforced in the
schema: a holder change cannot happen without advancing `lock_generation`, which is the number the
displaced device detects the takeover from. Appendix H governs the wording.

# ✅ STEP 5 IS COMPLETE — 2026-09-03

**What was produced, and where it lives:** `planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/`

| | |
|---|---|
| `DESIGN.md` | The visual spine, `status: final`. A **transcription** of the Claude Design export — `Calibration Set` and `Editor Sidebar Kit` are its source and it says so near the top: **on any disagreement the export is right and DESIGN.md is the bug** (R-74). Tokens, type, spacing, elevation, shape, every component in the kit, and the do's and don'ts |
| `EXPERIENCE.md` | The experience spine, `status: final`. Foundation · Information Architecture · Voice and Tone · Component Patterns · State Patterns · Interaction Primitives · Accessibility Floor · Responsive & Platform · **the four journeys and the eight flows** · what the export draws and where it draws the wrong thing · **Appendix A: one Claude Design prompt per undrawn surface group** |
| `.memlog.md` | Every decision taken during the pass |
| Both catalogued | `tools/doc-audit.py` gained one `GROUPS` entry for `ux-designs/` and two `DOCS` entries so each spine carries its own brief |

**Every surface has ONE stable name, used identically in the IA, in every journey step and in every
flow state** — step 5b's prototype keys its pages off them (R-75). **Every surface either points at
a drawn frame by filename or names the frame it extrapolates from and has a prompt in Appendix A.**

### What the pass found, which is the part worth reading

- **§37.7 called the Paywall editor missing. It is drawn** — `C Post Body.dc.html` region **C3a**,
  with its controls, three of its twelve designs and its no-paid-tiers empty state. It also revealed
  a left-nav group nothing else in the export shows: **Template surfaces** (Paywall · Cards · Error
  pages), which is the entry point for `S14` and the error canvases and where FR-Q9's fallback
  lands. Two more are partially drawn: the Template Switcher's single "Members" entry where FR-D6
  needs three canvases plus a conditional Private, and the content-source pill's menu with no
  subject picker. **Every other frameless item was checked one at a time and is genuinely absent.**
- **§A4's "the S, B and M screens were not touched" had gone stale**, as this step's own prompt
  warned. Two re-exports since touched `B`, `M1`, `M2`, `M4`, `M5`, `S2`, `S5` and `S12`.
- **A library total was in product copy and both controls were blind — for the third time.**
  `S3 Dashboard` read *"Yours starts with 485 gorgeous designs"* and `B` read *"415 Pro designs"*.
  The detector required the noun to **abut** the number, so one adjective walked past it. Fixed in
  `tools/reapply-export-edits.py`, which is the one place it now lives; `verify-design-pass.py`
  reads it. Standing rule 2 — a control that cannot fail is not a control.
- **Four rulings, recorded in `reconcile-designs-decisions.md` §A11** — three the owner's, one
  architectural. **R-76** the editor is a desktop and tablet surface with a designed floor below
  834 px on a touch device (the width amended from 1024 by R-87, 2026-09-04) · **R-77** Site Remix drops the drawn "Keep Free designs only" · **R-78** redesign
  proposals build FR-C7's whole-site combinations, keeping `B22`'s card and its
  argued-from-your-own-data sentence · **R-79** pinning's home is the PRD, not `BACKUP-GATE.md`.
- **`prd.md` moved three times, all propagation:** **FR-D1** gains R-76's form factor; **FR-J7**
  gains all three pinning rules; **FR-J9** gains the pin control and the two rows that are not
  ordinary versions. §37.7's `prd-defect` on pinning is closed.

### What the owner now has to do

**The Claude Design prompts in `EXPERIENCE.md` Appendix A — its `### A` headings are the count.**
A1 to A6 draw surfaces that do not exist (A1 the first-deploy gates · A2 deploy history with pinning ·
A3 the drift report · A4 the dashboard sheets and blocks · A5 the canvas markers and the template
switcher · A6 Theme Settings completed); **A7 corrects existing frames** — a mechanism a ruling
changed, a Ghost fact the copy gets wrong, an accessibility defect in the frame's own markup or tokens
— and its numbered items are the list; **A8 draws the editor below 1440** and the affordances the
accessibility floor needs. Each is self-contained, names the frame it inherits from, and carries the
zero-width-entity warning.

**They do not block step 5b.** The prototype is built from `EXPERIENCE.md`, which specifies every one
of those surfaces concretely enough to draw. Running the prompts first would give step 5b a frame to
copy for each; running them afterwards would check the prototype against the design tool. Either
order works, and the owner chooses.

### What step 5b reads

`EXPERIENCE.md`'s surface names, journeys, flows and states are its content; `DESIGN.md` and the
export are its only visual vocabulary; the PRD and Appendix H are its behaviour and its strings.


# Step 5b — the static prototype *(owner's ruling R-75, 2026-09-02)*

> ✅ **BUILT 2026-09-03.** It is at **`_bmad-output/planning-artifacts/ux-designs/prototype/index.html`
> — double-click it.** No server, no build step, relative links only; it reads complete with
> JavaScript off.
>
> **What is there.** One page per surface `EXPERIENCE.md`'s Information Architecture names — and it
> names them all, so a surface that is a panel, pill, marker, popover or sheet over another surface
> gets a section on that page instead of a page of its own, linked from it and listed on the index.
> The four journeys and the eight flows are each a labelled, clickable trail, and every page shows
> which trails it sits on and what comes next. **Every page's first HTML comment names the frame it
> derives from (R-74) and the `EXPERIENCE.md` section it implements** — which is the thing that makes
> fidelity checkable rather than asserted. Fixture content is Orbit Weekly throughout.
>
> **Three things a reader should know about how it was built.** Every screen is the frame **lifted
> unchanged** from the export, with the annotation *around* it: the frames drawn on the wrong
> mechanism are shown exactly as drawn, and the re-specification sits in a note beside them naming
> the ruling. Its plan limits are shown as **Appendix F.1's table beside the frame**. **The Appendix A
> export landed on 2026-09-04** — the D canvases and A7's corrections — and the prototype was rebuilt on
> it the same day: the pages that said "not drawn" lift the D frames, and every annotation that said
> "A7 will fix this" now says whether it did (`reconcile-designs-decisions.md` §A15 is the verification).
>
> `build.py` beside it generates every page from one registry, so the index cannot claim a surface
> that does not exist or miss one that does, and it refuses to write if any link or anchor is dead,
> if any lifted region is not byte-identical to its `.dc.html`, or if anything is hidden by default.
> The prototype's HTML is **disposable by design** the day the dynamic UI matches it; what outlives
> it is listed under step 5c, *What outlives both builds*.
>
> ✅ **The owner walked it on 2026-09-04.** Nothing else was owed here; step 6 is open.

**Produces:** a clickable, static HTML prototype of Inflozo's own UI — the interface the final
product will have — that the owner opens with a double-click and walks in his browser.
**Needs from the owner:** walk it, and say what reads wrong. That is the whole ask.
**Unblocks:** step 6 — **opened 2026-09-04, when the owner walked the prototype** (R-75). The rule was that step 6 did not open until he had, because a wrong
screen is cheapest the moment before anyone builds it. What "walked" means is defined below.

> ⚠️ **5B WAS MADE CLICKABLE AND THEN DELIBERATELY UNWIRED AGAIN. Do not re-wire it.**
> Wiring the frames' own controls looked harmless and cost three things. It inserted elements
> into most of the lifted frames — `build.py` printed the count at the time and it is not restated
> here — so the markup whose unchanged-ness is 5b's entire claim was no longer unchanged. It matched controls **by button text**, so a re-export that rewords
> one would silently drop the link and nothing would notice. And the assertion meant to police
> it — *every page's frames must respond to something* — **pressured the build into inventing a
> link from the binding checklist to itself, purely to pass.** A check that can be satisfied by
> fabrication is worse than no check, and that one was.
>
> What replaced it is the assertion that was worth having: **every lifted region must be
> byte-identical to the region in the `.dc.html`.** That makes "this page derives from S4a" a
> claim a script settles rather than one a reader has to trust — and it is unfalsifiable the
> moment anything is inserted into a frame.
>
> **What 5b still does, and it is more than it did before.** `proto.js` replays `style-hover`
> and `style-focus` — the behaviour **the export itself declares** and which 5b previously
> lacked entirely, so this build is *more* faithful than the static one was. Navigation lives in
> the scaffolding around each frame: the trail bars, the surface list, the index. And R-75's rule
> still binds — nothing is hidden by default, enforced by its own assertion, so the page reads
> complete with JavaScript off.
>
> **The clickable build is 5c, and that is the whole division.** 5c hides, reveals and navigates
> because it is the product. 5b does none of those, because it is the proof.

### The walk — the sentence that unlocks step 6

**Owner walked the prototype on: 4-Sep-2026.**

> **IMP NOTE BY OWNER** *(2026-09-04, verbatim)*: There are some issues in UI that owner found. But instead of
> fixing them now and doing more Claude Design passes, we will fix them during development of their
> respective stories.

**That note is ruling R-80** (`reconcile-designs-decisions.md` §A13), **amended by him the same day:** he
does not write the findings down in advance — **he tests every UI story himself on the deployed site**,
from the spec's `## Owner's manual test`, and what he finds is fixed inside that story before it is done,
not by a further design pass. `WALK-NOTES.md` stays as his optional notebook. The Appendix A prompts are
unaffected and still run, as two sessions, in parallel with the stories. The loop that carries this is
**step 7** below.

**The date stands, so step 6 is open** *(2026-09-04)*. What follows is the rule that held it shut,
kept as the record of how the gate worked. Until a date stood on that line, step 6 stayed shut. It was
deliberately not something a session could fill in on his behalf: the gate is the walk, not the build. **And it is a human tick that no tool
reads** (F-082): `doc-audit.py` quotes this sentence and checks nothing, the board's step-6 status
is set by hand, and step 6's prompt is on the board and runnable today. **Nobody runs the step-6
prompt before a date stands here.**

**5b is R-75's gate, exactly as the ruling names it; 5c is walked afterwards, for feel** (owner,
2026-09-03 — `reconcile-designs-decisions.md` §A12 decision 3, amended by §A13). **"Walked" means every
journey and every flow on `prototype/index.html`'s front door opened end to end, and the date written
on the line above.** The notes file `ux-designs/WALK-NOTES.md` was optional and he chose not to use it:
his findings come from testing each deployed story (R-80 as amended).

**How the gate worked — the checklist he had (done 2026-09-04; not repeated).**

1. Double-click `_bmad-output/planning-artifacts/ux-designs/prototype/index.html`. Open
   `_bmad-output/planning-artifacts/ux-designs/WALK-NOTES.md` beside it in any text editor.
2. Under **The four journeys**, click the first step of J1. Read the page; the trail bar under the
   frame names the trail you are on and links to the next step. Follow it to the end. On each
   page write one line under that screen in `WALK-NOTES.md` — *fine*, or what reads wrong.
   Then J2, J3, J4.
3. The same for **The eight flows**, F1 to F8.
4. **Look hardest at these five** (from the review, `ux-designs/review-5b-5c-2026-09-03.md`):
   - **The deploy wizard.** Six steps on a first deploy, four afterwards; the Staff Token Offer and
     the Backup Gate were not drawn yet and their pages said so *(they are now — D1, since 2026-09-04)*.
   - **The figures on Billing, Upgrade and Pricing.** The table beside each frame is Appendix F.1's;
     where the frame disagrees with it, the table is right and A7 fixes the frame.
   - **The design ring in the editor.** Only the drawn positions are here, and 5c does not cycle it
     yet. Judge the model: the canvas and the control panel change *together*.
   - **The connect flow's words about Ghost.** Three keys, no Staff token required, and nothing that
     promises Ghost something it does not do.
   - **Whether every screen reads as reachable from the product itself** — the trails and the
     surface list are scaffolding; ask whether the product's own controls would get you there.
5. Then 5c: double-click `_bmad-output/planning-artifacts/ux-designs/walkthrough/index.html` and
   click through it as a user would. Notes go under **5c — how it feels** in the same file.
6. Write the date on the line at the top of this section. Say so in the next session, and step 6
   opens. *(He did, on 2026-09-04.)*

This step exists because of a clarified ruling: the owner does **not** want to review design-tool
frames; he wants to see **the product itself**, statically, on his machine, before the dynamic
build starts. The prototype is that artifact. It is built FROM step 5's spines and the design
export, and its HTML is disposable-by-design once the real app exists — what outlives it is listed
under step 5c.

### Prompt

```
Build the static prototype of Inflozo's own UI — ruling R-75 (reconcile-designs-decisions.md §A10).
Working directory: /home/ghost/Dev/Inflozo. Read CLAUDE.md first; the seven standing rules bind.

INPUTS, IN ORDER:
  1. The finished step-5 spines: DESIGN.md and EXPERIENCE.md under
     _bmad-output/planning-artifacts/ux-designs/ — EXPERIENCE.md's surface names, journeys,
     flows and states are the content of this prototype.
  2. The design export at _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/ —
     ruling R-74: its tokens and components are the ONLY visual vocabulary. Copy the values from
     `Calibration Set.dc.html`; reuse the drawn screens' construction. If a page of yours would
     look wrong side by side with its frame, the page is wrong.
  3. The PRD for behaviour, and its Appendix H for every string. (Appendix H is INSIDE
     prd.md — "## Appendix H — Voice & Microcopy Canon". It is NOT appendix-h1-string-catalog.md,
     which is the visitor-facing catalog shipped inside a user's THEME.)

OUTPUT: _bmad-output/planning-artifacts/ux-designs/prototype/
  index.html                 the front door: the surface list, and the four journeys and eight
                             flows each as a labelled, clickable trail
  one .html page per surface EXPERIENCE.md names, filed by its stable surface name
  a shared stylesheet        the tokens transcribed once, from Calibration Set

TWO THINGS ABOUT EXPERIENCE.md'S SURFACE LIST, BOTH DECIDED SO YOU DO NOT HAVE TO GUESS:
  - Its IA names ~80 surfaces, and they are NOT all full pages. Some are panels, pills,
    markers, popovers and sheets that only exist over another surface. Give a full page to
    anything a journey or a flow LANDS on; give the rest a section on the page they live on,
    reachable by a link or a toggle from it. Every name still appears somewhere, and the
    index lists them all — a surface that cannot be reached by clicking has not been built.
  - Some surfaces have no frame yet: Appendix A carries a Claude Design prompt for each. The
    page SAYS SO in those words, names the prompt, and SHOWS NOTHING — inventing a picture for
    an undrawn surface is the second interface vocabulary R-74 forbids, and the first cut did
    exactly that. If the owner has run the prompts by the time you start, lift the new frames —
    check the export before you assume either way.
  - Frames DRAWN ON THE WRONG MECHANISM (EXPERIENCE.md's "Drawn, but on the wrong mechanism"
    table) are lifted UNCHANGED, with the re-specification in a note beside the frame naming
    its ruling. The frame is corrected in Claude Design by prompt A7, never here.

RULES:
  - DOUBLE-CLICK MUST WORK. Self-contained: relative links only, no fetch, no CDN scripts, no
    build step. Google Fonts may be linked but every face carries a real fallback stack.
    Navigation is plain <a> links in the scaffolding AROUND each frame. EVERY LIFTED REGION
    STAYS BYTE-IDENTICAL TO ITS .dc.html REGION — build.py asserts it — and NOTHING IS WIRED
    INSIDE A FRAME: that was tried and reverted, and build.py's lift() docstring says why. Read
    it before anything else. Nothing is hidden by default; every page reads complete with
    JavaScript off.
  - FIXTURE CONTENT THROUGHOUT — Orbit Weekly, the project's fixture publication. Never lorem.
  - EVERY PAGE OPENS WITH AN HTML COMMENT naming the frame(s) it derives from (R-74) and the
    EXPERIENCE.md section it implements. That is what makes fidelity checkable.
  - EVERY STATE EXPERIENCE.md names for a surface is shown or reachable — an empty state, an
    error state, a refusal state is a link or a toggle away, never omitted.
  - THE GATE SEES EVERY FILE: python3 tools/doc-audit.py --check must pass, run twice (its
    sub-tools regenerate on first failure). The ux-designs GROUPS entry from step 5 covers the
    folder; verify rather than assume.
  - Counts: never print a library total (Appendix H). Product limits (10/3 versions, 1 site) are
    the requirement and MUST be shown.

DONE WHEN the owner can double-click index.html and click through all four journeys and all
eight flows; every surface page names its source frame; the gate passes twice. Then tell him,
in one short message: the file to double-click, and the two or three places you had to make a
judgement call he should look at hardest.

5b IS BUILT (2026-09-03) AND THIS PROMPT NOW ONLY REBUILDS OR EXTENDS IT. A change to the
design belongs in both builds: after editing prototype/build.py run `python3 build.py` there,
then `python3 build-app.py` in ../walkthrough, then `python3 tools/doc-audit.py --check` TWICE.
STEP 6 IS OPEN (the owner walked 5b on 2026-09-04); this prompt never touches it — it only
rebuilds or extends the prototype, and a UI issue he finds now is fixed in its story (R-80).
```

---

# Step 5c — the walkthrough *(the owner's ask, 2026-09-03)*

> ✅ **BUILT 2026-09-03.** It is at
> **`_bmad-output/planning-artifacts/ux-designs/walkthrough/index.html` — double-click it.**
> It opens on Sign In, because that is the product's front door.

**Why it exists, in the owner's own words:** he opened 5b's Sign In page and saw *"a lot of other text
which will not be on the final Inflozo app"* — the frame reference, the journey trail, the surface
list, the stacked 390 and passkey variants — and asked for **a proper screen that will look exactly
like how the final product will be**, with linking, placeholder data and JavaScript where it is
needed.

**He was right, and there was no hidden clean mode.** 5b's annotations are not a wrapper that can be
switched off: they are the point of it. A page that names the frame it derives from and the
`EXPERIENCE.md` section it implements is a page you can hold up against the export and check — that
is R-74 made operable. And the same page necessarily shows three states of Sign In stacked one under
another, because 5b's job is to prove every state exists. Both properties are exactly what stop it
feeling like the product.

**So there are two builds, and neither replaces the other.**

| | `prototype/` — step 5b | `walkthrough/` — step 5c |
|---|---|---|
| Answers | *is this screen right?* | *is this any good?* |
| Carries | frame reference, journey trails, every state of a surface on one page | nothing but the product |
| Behaves | no — it depicts | yes — menus, popovers and sheets; picks; the six-step first deploy and the four-step redeploy; history pinning; the dashboard sheets; the complete switcher and the canvas markers; the editor at 834 and 720; `P`, `L`, `Esc`, `]`, `[` |
| Read with JavaScript off | completely | mostly; JS is the point of it |
| The design ring, the backup gate | the drawn positions; the gate lifted from D1 with annotation | the ring steps between its two drawn positions; **the backup gate blocks** (D1d, since 2026-09-04) |
| Changed when the design changes | **yes** | **yes** — a change belongs in both |

**Produces:** the product as a clickable application. One screen per screen; real navigation; real
menus, popovers and sheets; fixture data throughout; and JavaScript only where a drawn control has a
drawn result to land on.

**What actually behaves** — read from the build, not from the plan (F-006), and every hook below is
one `build-app.py` attaches to an element the frame drew:

- **Menus, popovers and sheets** open from the control that raises them — the account and
  what's-new menus, the template and View-as menus, the passkey prompt, the upgrade and delete
  sheets, the roll-back confirm — and close on `Esc`, their drawn Cancel, or a click outside. Focus
  moves in, is trapped while open, and returns to the control that opened it.
- **Segmented controls, tab rows and radio lists pick**, and the selected look is the one the frame
  drew; arrow keys move within a group.
- **The first deploy walks all six steps** (since the Appendix A export, 2026-09-04): D1a destination,
  D1b the safety-net offer and D1c its declined path, D1d the backup gate — rows tick, the `ghost
  backup` shortcut ticks every row and the rows stay visible, D1e for Ghost(Pro) — then pre-flight with
  D3's drift rows, the snapshot gate (B12a with the token, B12b without), ship, and live; **Deploy only
  ends on D2f**, never on Live; the failure and partial-success endings are reachable. Later deploys
  walk S8a's four steps with the library-update confirm, and deploy history pins (D2a) with the pin
  refusal (D2b) and the Free-plan history (D2c).
- **In the editor**, `P` opens Preview Mode and `Esc` leaves it, `L` hides Layers, and `]`, `[` and the
  drawn ◀ ▶ step the design ring between its two drawn positions (S4c and S6) while the Design Picker
  sheet opens from the sidebar's Design row. That is the whole of FR-D11's map that is wired, because
  the other keys have no drawn result to land on; every key
  passes **the WCAG 2.1.4 guard** — inert while a text field or a `contenteditable` has focus.
- **The export's own `style-hover` / `style-focus`** are replayed, so a lifted screen keeps the
  hover and focus states it was drawn with.
- **Every screen is reachable from Sign In by clicking**, and the build refuses to write if one is
  not, if any link is dead, if a screen has nothing that responds, or if a trigger has no overlay.

**What is held out, and why — `_screens.html` carries the lists and the generator's `NOT_YET`
asserts each entry against the registry.** Since the Appendix A export (2026-09-04) three things are
true. *Detail cards with no drawn trigger on an app frame* — the on-section design nav (B1b), Layers
(B7), Site Remix (B8), the persistence indicator (B6), the inline toolbar (P0-1), B21, B25, the
partial-success row (D2d), the tablet device preview. *(B22 and B18 were held out until A9
corrected them the same day; both are lifted now.)* *States no frame
draws* — the empty canvas, the switcher's other canvases, a bad key, Cancel plan, dark authoring,
Suggestions at 390, and drawn controls with no drawn result. A7's corrections are lifted: the Pro Exit
Sheet with four remedies, the Starter Chooser with Appendix E's roster, S4d's three member states,
Device Preview without the zoom control, the Snapshot Gate, Routes Fallback, the binding checklist and
the Grace Banner as re-specified.

**Two files in there are not product screens, both prefixed `_`:** `_screens.html` is the jump
list and the held-out lists, so that nothing the owner is judging has to carry a navigation bar;
`_selfcheck.html` drives the hooks `build-app.py` attaches — overlays, pick groups, the wizard rail,
the drawn `#` anchor and the typing guard — against a fixture, and prints ALL PASS.

### The first cut was wrong, and how it was wrong is worth keeping

**The owner opened it and said it did not match the export. He was right.** Both 5b and the first
cut of 5c were authored from a **text extraction** of the frames — a tag-stripping pass that yields
every frame's copy and none of its composition. The words came out right and the screens came out
wrong, structurally:

| The export draws | The first cut drew |
|---|---|
| `S1a` — an ink primary, on a card with a 380px ghosted wordmark behind it | a coral primary, no wordmark |
| `S3a` — real miniature renderings on every project card; what's-new as a **popover** under a marigold button | blank thumbnails; what's-new as a column |
| `S4a` — a resting right sidebar that is the **Page** panel: the Style Pack cell, Ag / Paper / Georgia · Inter / Change, and a Dark mode toggle | an empty "Nothing selected" panel |
| `S4a` — Layers as a flat list of **design** names, no site-wide group | B7's grouping and B7's layer names |

None of that survives a tag-stripper. It is exactly the failure `CLAUDE.md` warns about — *the whole
directory, every time* — with a summary substituted for the source.

> ⚠️ **AND THE LIFT REBUILD BROKE THE INTERACTION, WHICH IS 5C'S WHOLE POINT.** The first lift pass
> kept the frames and dropped the wiring — the dashboard, deploy, billing and sites came out with
> zero affordances, and the build reported success because every link still resolved. The owner asked
> "there is no interaction?" and there was not. Two things fixed it. `frames.py` gained
> `overlay/trigger/pick/picked`, which attach behaviour **to the element the frame already drew**
> rather than to a class the frame does not have — so a lifted segmented control picks using the
> selected look that was drawn, and a dropdown the frame documents OPEN keeps its look and gains a
> trigger. And `build-app.py` now **fails the build on an inert screen**: any screen whose only
> affordance is the scaffolding bar stops the build, because a walkthrough made of dead ends is a
> slide deck. That assertion is the control; it would have caught this the moment it happened.

**The second cut does not re-author the frames: it lifts them.** `frames.py` pulls each screen's
markup out of the `.dc.html` verbatim, by `data-screen-label` or by the mono caption above it;
`build-app.py` then patches what it must — links wired, behaviour hooks added, the fixed 1440×900
frame box removed so it fills a window. **`patch()` raises if a target is missing**, so a lift cannot
quietly stop matching its frame. `app.js` implements the export's own `style-hover` / `style-focus`
attributes, so a lifted screen keeps the hover states it was drawn with.

**Where the PRD still overrides the frame it is a short list, and each patch names its ruling:** the
plan-limit strings on the frames that disagree with Appendix F.1, patched at lift time from the
matrix `build-app.py` reads out of `prototype/build.py` (owner, §A12 decision 2), and F5's
Preview-only sentence. R-74 gives the export the construction; `prd.md` keeps behaviour and strings.
**The frames drawn on the wrong mechanism are not patched** — decision 6 holds them out or shows
them as A7 corrected them in the 2026-09-04 export; the two it left (B22, B18) were corrected by A9 the same day and are lifted. A lift is patched only with links, ids, classes, hooks
and the PRD's own strings, never with markup in a second vocabulary; a fix that would change what a
frame *looks* like is A7's, not this file's.

> ✅ **STEP 5B WAS REBUILT ON THE SAME LIFTER, in the same pass.** `frames.py` moved up to
> `ux-designs/` so both generators share it. Every screen in the prototype is now a lifted frame with
> the annotation *around* it rather than inside it — and where a surface **has no frame**, the page
> says so in those words and **shows nothing**. That last part matters: inventing a picture for an
> undrawn surface is the second interface vocabulary R-74 exists to forbid, and the first cut did
> exactly that on every one of them. Until 2026-09-04 the pages that said "not drawn" named the Appendix A prompt that
> will draw it, and describe what it must produce.

**What is shared with 5b, exactly (F-017).** `../frames.py` — the lifter, one copy of the regex
that finds a frame; `../prototype/styles.css` — the tokens, appended with `_app.css` into this
folder's `styles.css`; and two constants imported from `../prototype/build.py` — `FONTS` and
`LIMITS`, Appendix F.1's plan matrix, which the plan-string patches read rather than restate. **The
two page registries are separate and nothing asserts one against the other**: "cannot drift" is
true of the tokens and the lifter, not of which frames each build lifts. A change to the design is
made in both generators by hand, and the check that it reached both is a person opening both.

**What outlives both builds (F-106).** The lifted HTML is disposable the day the real app matches
it. These are not, and step 6's stories should carry them forward rather than rediscover them:
the token transcription in `prototype/build.py` that becomes `styles.css` (R-74 — one place); the
plan matrix `LIMITS`, which is Appendix F.1 as data; the icon set `ICON`; the Orbit Weekly fixture
strings both builds share; `app.js`'s keyboard map with its `typing()` guard — the WCAG 2.1.4 rule
as code; and the lifters' assertions — a lifted region byte-identical to its frame, nothing hidden
by default, no dead link, no inert screen, every screen reachable from Sign In — which are the
tests the real app's screens should pass against the same export.

**Needs from the owner:** nothing new. He walks it **after 5b**, for how it feels (§A12 decision 3).
**Unblocks:** nothing on its own — **R-75's gate is the walk of 5b**, defined and recorded under step 5b.

### Prompt

```
Rebuild or extend the Inflozo walkthrough — step 5c.
Working directory: /home/ghost/Dev/Inflozo. Read CLAUDE.md first; the seven standing rules bind.

WHERE IT LIVES: _bmad-output/planning-artifacts/ux-designs/walkthrough/
  build-app.py   the generator — it LIFTS each screen out of the .dc.html via ../frames.py and
                 patches it; it IMPORTS ../prototype/build.py for FONTS and LIMITS (Appendix F.1).
                 The tokens and the lifter are shared with 5b; the page registry is this file's own
  _app.css       the product-only additions, appended to 5b's stylesheet at build time
  app.js         the mock interaction layer — plain script, no modules, no fetch
  _screens.html  the jump list and the three held-out lists (NOT_YET in the generator)
  _selfcheck.html drives the hooks build-app.py attaches — overlays, picks, the wizard, the
                 typing guard; must print ALL PASS
  Those two are the only files that are not product screens.
Run `python3 build-app.py` from inside that folder. It refuses to write if any link is dead, any
screen is inert or unreachable from Sign In, or any trigger has no overlay. Read its docstring
first: what is patched into a frame, and what is A7's instead, is written there.

THE RULE THAT MAKES THIS BUILD DIFFERENT FROM 5B: no scaffolding on any product screen.
No frame captions, no journey trails, no notes, no two states of one surface stacked on one
page. If a reader could tell it is a prototype without clicking anything, it is wrong.

  - Behaviour comes from EXPERIENCE.md, strings from PRD Appendix H, and the visual
    vocabulary from the design export and nothing else (R-74).
  - Fixture content throughout — Orbit Weekly. Never lorem.
  - Double-click must work: relative links only, no CDN scripts, no build step at read time.
    Google Fonts may be linked but every face carries a real fallback stack — the same
    allowance as 5b's prompt (F-050).
  - A lift is patched only with links, ids, classes, hooks and the PRD's own strings — never
    markup in a second vocabulary — and every patch carries a comment naming the finding or
    ruling it serves. A fix that would change what a frame LOOKS like goes to prompt A7.
  - Product limits (Appendix F.1) are shown. A library total never is.
  - Anything non-trivial added to app.js gets a case in _selfcheck.html.

A CHANGE TO THE DESIGN BELONGS IN BOTH BUILDS. 5b is how a screen is checked against its
frame; 5c is how it is judged. Update prototype/build.py in the same pass, run both
generators, then `python3 tools/doc-audit.py --check` TWICE.
```

---

# Step 6 — Epics and stories

**Produces:** the story breakdown.
**Needs from the owner:** to have **walked step 5b's prototype first — R-75 gates this step** —
**done, 2026-09-04**: the date stands under step 5b, *The walk*, a human tick no tool reads. Two rules
ride into every story. Per **R-74**, every story with a surface carries a "matches the frame" acceptance
criterion naming the frame (or extrapolated frame) it is built from. Per **R-80** (§A13, as amended),
every story with a screen carries `## In plain English` and `## Owner's manual test`, is tested by the owner
on the deployed site before it is done, and his findings are fixed inside it — not by a design pass. And
per **R-83** (§A14), every question this step asks him is plain English with an example, numbered options
and one marked (RECOMMENDED).
**Unblocks:** development.

§8 already fixes the epics, their order, their exit criteria and every FR's owning epic. This step expands that into stories — it does not re-plan it.

### Prompt


> **Before you paste it** — Get the prompt from one place: `STORY-BOARD.html`, the top card, *Copy prompt* (the same text is in `STEP-6-PROMPT.txt`). Open a NEW chat in Claude Code — one job per chat, always — and paste the whole prompt including the first line. An *epic* is a chapter of the build; a *story* is one job inside it, sized for one session. The prompt names the PRD, the architecture and the rulings file; the skill finds the two UX documents (`DESIGN.md`, `EXPERIENCE.md`) by itself, then asks whether to include or exclude any other document — the extra documents the prompt names are already in, so answer *no others*. If it asks you to confirm the requirements, approve the epic structure, or confirm a story or an epic — reply `yes, continue`; section 8 already decided those. When it shows a **[C]** menu, type `C` and press Enter. If it ends with questions for you, they are in its last message: plain English, an example, numbered options, one marked (RECOMMENDED) — answer in the same chat by number (`1: option 2`); it writes your answer in and saves again. Three signs it worked: its last message says it saved and uploaded (committed and pushed) `Step 6 - Create - epics and stories`; `STORY-BOARD.html`, reloaded, shows story cards in the lanes; the top card has changed to *Run step 6b*. If instead it offers help or a next skill, reply `commit and push as the prompt says`. Expect several hours — it writes well over a hundred stories and confirms each — and if the chat runs out of room, open a new chat, paste the same prompt and add: `epics.md exists — read its frontmatter stepsCompleted and resume`.

```
/bmad-create-epics-and-stories

Create the epics and stories list for Inflozo.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
  — read sections 5, 6 and 8 and Appendix F.1; never the whole file.
Architecture: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md
Rulings that bind the stories: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md
  — sections A10, A13, A14 and B only. Do not open reconcile-designs.md beside it: it is the
  evidence file, 1.6 MB, and nothing in it is a requirement.
The two UX documents the skill finds by itself: ux-designs/ux-Inflozo-2026-09-03/DESIGN.md and
EXPERIENCE.md. EXPERIENCE.md Appendix A is the owner's Claude Design work, not story material.

Section 8 ALREADY fixes the epic breakdown, the sequence, the exit criteria and every FR's
owning epic — every FR owned by exactly one epic apart from the splits section 8 documents explicitly (FR-P1 per email, FR-Q6 format-vs-surface, and FR-G1/G4/G5/G6 shared between the shell block and the gated pipeline). Expand
it into stories; do not re-plan it and do not renumber anything.

Three rules from section 8 that shape the story list and are easy to get wrong:  - STORY GRANULARITY (section 8 as amended by ruling R-85, 2026-09-04): in the library epics E9 and
    E10 a CATEGORY is a run of consecutive stories, each sized for ONE build session — never one story
    per design, never one story for a whole category. The first story of a category delivers its shared
    content model, its stylesheet and the first designs; each later story adds the next designs and their
    behaviour modules against that model. Number them in order inside the epic; the owner tests every one
    as it lands, and the category's owner gate is its LAST story. Keep section 8's epic numbers and
    titles verbatim — the story board keys the category gate off the titles "The Shell Block" and "The
    Gated Library Pipeline". Together a category's stories deliver every design in that category against one shared content
    model and one stylesheet, plus that category's behaviour modules.
  - The library epics run SEQUENTIALLY. There are no waves. Each category's owner gate blocks
    the next category from starting.
  - There are as many owner gates as there are categories, the shell block's three included.

Section 4's build order is binding and comes first: the FR-D4 mark-emission spike, then the E0
platform-verification spike, then the complete shell block (every design in Group 1 — the export is the count — not a
minimal shell), then the gated categories in inventory order beginning with Heroes.

A category's first story cannot open until that category's per-design specs exist. Since the 2026-08-31
merge they are the export's own files — design/claude-design-export/Inflozo/<ID> <Name> - Spec.md,
one per category — and sections-inventory.md is GENERATED from them; `python3 tools/inventory-gen.py
--check` printing "current" is the test, and it passes today for every category.

SIX THINGS ALREADY SETTLED THAT THE SKILL OR THE PRD WOULD OTHERWISE MAKE YOU GUESS:
  - E0's two spikes ran and closed at step 2 (the agreement proof — since Story 4.2 at
    packages/section-runtime/src/agreement.test.ts — and MEASUREMENTS.md): write Epic 0 with its
    goal and "closed by execution", and no stories.
  - Section 8's pilot table names the five pilots by roster NUMBER (A1 #1, A17 #1, A22 #1, A24 #1,
    A4 #2); the number is the identity and `python3 tools/export-roster.py` gives the current name.
  - E1's schema story is whole-model by section 8 (SCHEMA.sql and RLS-TEST.sql already exist);
    the skill's "tables only when needed" rule is overruled there.
  - The skill's technical-layer, file-churn, independence and single-session checks will all
    flag section 8 (E0, E4, E15; E1/E13; E4→E7; the category stories). Note each as overruled by
    section 8 and go on; none of them is a stop.  - Every surface now has a frame: the Appendix A export landed on 2026-09-04 and EXPERIENCE.md's
    Information Architecture names the D canvas and label for the surfaces that were undrawn
    (D1 first-deploy gates · D2 history completed · D3 drift report · D4 dashboard sheets · D5 canvas
    markers and template switcher · D6 theme settings · D8 the editor below 1440). Name that frame.
    A category story's frames are <ID>-<n> <Name>.dc.html and <ID>-0 Category Proof.dc.html.
  - The E4/E7 joint compile gate is E7's closing story.

TWO RULES RIDE INTO EVERY STORY WITH A SURFACE (rulings R-74 and R-80, reconcile-designs-decisions.md
§A10 and §A13):
  - MATCHES THE FRAME. Name the frame (or the frame it is extrapolated from) the surface is built
    from — EXPERIENCE.md's Information Architecture gives every surface its frame — and carry a
    "matches the frame" acceptance criterion. The export under
    _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/ is the design authority.
  - THE OWNER TESTS EVERY SCREEN HIMSELF, ON THE DEPLOYED SITE, before its story is done (R-80 as
    amended 2026-09-04). So every story with a screen must be written so that a non-engineer can
    test it: its spec will carry "## In plain English" (three sentences: what the user can now do,
    and what they will see) and "## Owner's manual test" (numbered steps — URL, screen, what to do,
    dummy data to type if any, what should be seen). Write the story's acceptance criteria so those
    two sections can be derived from them without guessing. His findings are fixed inside that
    story, not by a design pass.

THREE THINGS THE SKILL WILL WANT TO DO THAT THIS PROJECT HAS ALREADY DECIDED:
  - UX design requirements fold into the section-8 epic that owns the surface — never a separate
    "design system" or "UX polish" epic.
  - The E4/E7 joint compile gate and the per-category owner gates are section 8's design: record
    them as exit criteria (the E4/E7 gate is E7's closing story); do not restructure the epics to
    remove forward dependencies.  - At each of the skill's [C] continue menus, continue. The skill also stops to ask whether the
    extracted requirements are accurate, whether you approve the epic structure, whether each story
    captures its requirement and fits one session, and whether to proceed to the next epic. Section
    8 and the reconciliation already decided all of those: treat every such confirmation as answered
    yes and do not stop for it. Stop only for a decision that is genuinely the owner's.
  - Do not invoke bmad-help or offer a next skill at the end; the last act of this run is the commit.

AND TWO RULES ABOUT HOW THIS RUN TALKS TO THE OWNER (R-83, R-81):
  - Every question you need him to answer is written in plain English a non-engineer reads, with
    an example, numbered options, and the option or combination you recommend marked
    (RECOMMENDED). Collect them under "## Questions for the owner" at the end of epics.md AND
    repeat them in your final message. When he answers in this chat, write "Ruled: <his words>"
    under each, adjust the stories, and commit and push "Step 6 - Create - owner ruled: <one line>".
  - When epics.md is complete, commit and push to main: "Step 6 - Create - epics and stories".
```

---

### Then gate readiness before any story opens


> **Before you paste it** — New chat again; the prompt is on the story board's top card once step 6 is done. It first judges whether the stories are ready, like a sceptical senior developer reading a hand-over, and answers **PASS, CONCERNS or FAIL**; then it writes the tracker — the file the board reads to know each story's status. On CONCERNS it asks *proceed anyway or fix first?* — for the E4/E7 gate or the category order say `proceed`; for anything else say `explain in plain English with numbered options`, then choose. On FAIL say `yes, save the findings`, open a new chat and paste: `Step 6b failed. Read _bmad-output/planning-artifacts/implementation-readiness.md, fix epics.md so every finding is closed without changing section 8's epics or their order, then commit and push "Step 6 - Fix - readiness findings".` — then run 6b again from the board. Expect ten to twenty minutes. Sign it worked: reload the board — the top card is now *Story 1.1 — Create the spec*, your next prompt.

```
/bmad-sprint-planning

Run sprint planning for Inflozo: gate readiness, then generate sprint-status.yaml from
_bmad-output/planning-artifacts/epics.md — the full flow, not the readiness report alone.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md

Two readiness conditions are specific to this project and are not the usual ones:  - A library category's story cannot open until that category's per-design specs exist. They
    are the export's own files — design/claude-design-export/Inflozo/<ID> <Name> - Spec.md, one
    per category — and sections-inventory.md is generated from them, carrying one-line
    descriptors by design; `python3 tools/inventory-gen.py --check` printing "current" is the
    test, and it passes today. Do not judge readiness by the inventory's descriptors.
  - The library epics run SEQUENTIALLY, each category blocked by the previous category's owner
    gate, so the sprint plan must not show library categories running in parallel.
The E4/E7 joint gate and the sequential category chain are by design — record them, do not raise
them as concerns. Heading warnings from the tracker generator are yours to settle: fix any heading
that hides a real epic or story, accept the rest, never ask the owner about headings. Any question
for the owner: plain English, an example, numbered options, one marked (RECOMMENDED). When the
status file is written, commit and push: "Step 6b - Create - sprint status". Do not invoke
bmad-help at the end; the commit is the last act.
```

# Step 7 — The development loop *(the owner's rulings of 2026-09-04, R-80 amended and R-81 … R-84, `reconcile-designs-decisions.md` §A13–§A14)*

**Produces:** working software, one story at a time, on the real infrastructure, with the owner testing every
screen himself before its story is done.
**Needs from the owner:** his test of each deployed UI story, and his ruling on any question a phase raises.
**Watched from:** `_bmad-output/planning-artifacts/STORY-BOARD.html` (R-84) — every epic and story,
colour-coded, each phase's prompt copyable from the card, the owner's test script on the story. Generated by
`tools/story-board.py`; the gate regenerates it on every commit; never hand-edited.

**The loop, per story.** Every phase ends with a commit and a push to `main` (R-81), message
`Story <epic>.<story> - <Phase> - <one line about the story>`. The rules are bound inside the skills
by `docs/project-context.md` and the committed `_bmad/custom/*.toml` overrides, so a session that forgets them
is reminded by the skill itself.

```
  Create ──► Dev ──► Review ──► Deploy ──► Test (the owner, on the real site) ──► Done
    │          │        │                        │
    │          │        │                        └─ issues? ──► Fix ──► Review ──► Deploy ──► Test
    │          │        └─ runs on the REAL infrastructure (R-82) — never mocks alone
    │          └─ the spec is the sole source of truth; tasks ticked, verification recorded
    └─ the spec carries "In plain English", "Owner's manual test", "Questions for the owner"
```

| Phase | Who | What "done" means | Commit |
|---|---|---|---|
| **Create** | `/bmad-build`, planning only | The spec exists at `implementation-artifacts/spec-<E>-<S>-<slug>.md`, status `ready-for-dev`, with `## In plain English`, `## Owner's manual test` (any story with a screen), the frame it matches (R-74), and `## Questions for the owner` only if a decision is genuinely his (R-83) | `Story E.S - Create - …` |
| **Dev** | `/bmad-build`, implementing | Every task ticked, every acceptance criterion met, `## Verification` names the real services hit and what they returned | `Story E.S - Dev - …` |
| **Review** | `/bmad-code-review` | Every review layer the merged customisation lists ran, the *Real-infra verifier* included; findings triaged; nothing open that is not the owner's to rule. **A clean review leaves the story in review — it never marks it done; Done is the owner's** | `Story E.S - Review - …` |
| **Deploy** | a session with the keys | What the story changed is live on the one pre-launch stack (§4 and AD-26: pre-launch, production *is* the stack under test): a Vercel deployment for app code — once E1's Git integration exists the push already built it, so Deploy is confirming the deployment is Ready and recording `Deployment: <url>` under `## Verification` — the migration applied and `RLS-TEST.sql` green for schema, nothing for tooling; the commit line says which. The spec's test steps carry the live URLs. A story with no screen carries `owner_test: none` and goes straight to Done on this commit | `Story E.S - Deploy - …` |
| **Test** | **the owner** | He follows `## Owner's manual test` on the live site and says in chat what he saw. The Record prompt writes it into the spec: *passed* → `owner_test: passed`; *issues* → `## Owner's test findings`, `owner_test: issues` | `Story E.S - Test - …` |
| **Fix** | `/bmad-build` with the findings | Every finding fixed inside this story; then Review → Deploy → Test again | `Story E.S - Fix - …` |
| **Done** | the session, on his word | `owner_test: passed` (or `none`), sprint status `done` — written by the Record prompt and by nothing else | `Story E.S - Done - …` |

**Two more commit shapes, and the phase word list is closed.** Phase is one of *Create · Dev · Review ·
Deploy · Test · Fix · Done · Blocked* (Blocked: a run halted on a question for the owner, or a red gate).
Work that belongs to no story — the gate, the boards, a hook — commits as `Hotfix - <one line>`; a
retrospective, if one is run, as `Epic <N> - Retro - <one line>` (recommended at E1's close, the E4/E7
gate and E9's close only). A `commit-msg` hook in `tools/hooks/` rejects any other shape that starts with
Story, Step, Hotfix or Epic.

**The category gate is modelled by the loop, not by a status.** In E9 and E10 a category is a run of
consecutive stories, each one session (R-85); a story cannot open until the previous story in the epic is
`done` — and `done` means the owner passed its test. The last story of a category *is* §4's owner gate:
its owner test plus the automated sheet across the whole category. The Create prompt refuses to plan the
next story before that, and the story board offers no prompt for it. A category's last story's
`## Verification` lists §4's automated sheet — live on
T1 and T3, the real-Ghost comparison, axe, compile CI with FR-J17, the render matrix, the ring
preservation — as commands with expected results, and Deploy is refused while any is red. The E4/E7
joint compile gate (§8) is E7's closing story.

**A run halted on a question resumes through the Record prompt.** The owner answers in chat; the
Record prompt writes `Ruled: <his words>` under the question, puts the spec's status back to what it was
before the halt, commits, and the phase that halted is run again.

**Three rules the loop never bends.** **R-82:** review and test run on the real infrastructure — the keys are
in `tools/probe/.env`; a spec whose `## Verification` names no real service for a story that reads or writes
one fails its review. **R-83:** any question to the owner is plain English with an example, numbered options
and one marked (RECOMMENDED), under `## Questions for the owner`; the unattended loop never decides one — it
halts with the question written. **R-80:** his findings are fixed in the story, never by a design pass.

### The phase prompts

The story board copies these from here — the placeholders `{E.S}` (the story key, e.g. `3.2`) and
`{spec}` (the spec's path) are filled in per story; a page that retyped them would drift. Paste one
**including its leading `/command`**.


> **Before you paste it** — New chat. Paste the whole prompt from the story board (it fills in the story number). The skill reads the epic, investigates, and writes the plan — the spec. **It stops and asks you to approve the plan; that is your moment.** Read the `## In plain English` section and the `## Owner's manual test` steps before you approve: if they describe the wrong thing, say so and it re-plans. Approve when the plan describes the right thing to build. It then commits `Story {E.S} - Create - …` and stops; reload the board.

```
/bmad-build

Story {E.S} from _bmad-output/planning-artifacts/epics.md — CREATE THE SPEC ONLY. Stop when the spec
reaches ready-for-dev; do not implement in this run.
Read docs/project-context.md first; its rulings bind. Besides the template's sections the spec carries:
  - "## In plain English" — three sentences a non-engineer reads: what the user can do after this
    story that they could not before, and what they will see.
  - "## Owner's manual test" — for any story with a screen: numbered steps, each with the URL (a
    placeholder until Deploy fills it), the screen, what to do, the dummy data to type if any, and
    what should be seen. The owner follows it on the real site after deploy (R-80).
  - "## Questions for the owner" — only if a decision is genuinely his: plain English, an example,
    numbered options, one marked (RECOMMENDED) (R-83). Otherwise omit the section.
  - The frame the surface is built from, named, with a "matches the frame" acceptance criterion
    (R-74; EXPERIENCE.md's Information Architecture names every surface's frame).
  - `owner_test: pending` in the frontmatter of any story with a screen; `owner_test: none` for a story
    with no screen (schema, tooling, a server-only change).  - In E9 and E10 (the shell block and the gated library), refuse to plan a story unless the previous
    story in that epic is `done` in sprint-status.yaml — the owner's test of it (R-85). A category's last story's
    "## Verification" lists PRD §4's automated sheet as commands with expected results.
  - Any question for the owner: plain English, an example, numbered options, one marked
    (RECOMMENDED), under "## Questions for the owner" — then stop and say so.
Then commit and push: "Story {E.S} - Create - <one line>".
```


> **Before you paste it** — New chat, never the one that planned it. Paste the whole prompt. The session builds against the spec only, ticks each task, runs its checks on the real services, and stops before review. Nothing is asked of you unless a question arrives in the plain-English shape. It commits `Story {E.S} - Dev - …`; reload the board — the story moves to *In review*.

```
/bmad-build

Story {E.S} — IMPLEMENT the spec at {spec}. It is the sole source of truth; read
docs/project-context.md first. Tick every task, satisfy every acceptance criterion, and write
"## Verification" naming the real services the story hit (Supabase, Vercel, Resend, Dodo, the Ghost
test servers T1/T3 — keys in tools/probe/.env, never printed; record a key by its variable name, never
its value) and what each returned (R-82). Stop before the review phase. Any question for the owner:
plain English, an example, numbered options, one marked (RECOMMENDED), under "## Questions for the
owner" — then stop and say so. Then commit and push: "Story {E.S} - Dev - <one line>".
```


> **Before you paste it** — New chat — a review must not share the builder's context. Paste the whole prompt. Several independent reviewers read the change, one of them verifies it against the real services. Findings are fixed automatically where they are plain patches; anything that is genuinely your call arrives as a numbered question. It ends by saying how many findings it fixed; more than a handful, paste the same prompt again in a new chat; stop when the findings are small. It commits `Story {E.S} - Review - …`.

```
/bmad-code-review

Review story {E.S}: the diff since the baseline_commit in {spec}, against that spec. Read
docs/project-context.md first. Run every review layer, the Real-infra verifier included — the review
runs on the real infrastructure, never mocks alone (R-82). Triage the findings; fix what is a patch;
anything that is the owner's to decide goes under "## Questions for the owner" in the spec in plain
English with an example, numbered options and one marked (RECOMMENDED) (R-83). At the skill's menus:
proceed, apply every patch, done. A clean review leaves the story in review — it never marks it done;
Done is the owner's (R-80). Then commit and push: "Story {E.S} - Review - <one line>".
```


> **Before you paste it** — New chat. Paste the whole prompt (it starts with plain text, not a slash — that is fine). The session puts the change live on the real site — there is only one, and it is the one under test — writes the live URLs into your test steps, and commits `Story {E.S} - Deploy - …`. Reload the board: the story sits in the gold column, *Deployed, your test*, and the next-action card is yours.

```
Deploy story {E.S} to the real stack — the one pre-launch stack (PRD §4 and AD-26: production is the
stack under test), reading docs/project-context.md first. Deploy means what the story changed is live:
app code — the push to main already builds the production Vercel project once E1's integration exists,
so confirm that deployment is Ready and record `Deployment: <url or id>` under "## Verification"; a
schema change — the migration applied and RLS-TEST.sql green; tooling — nothing. Keys are in
tools/probe/.env: read them only into a command's environment, never cat, echo or print one, and record
every command with the key's variable name. Then open {spec}: fill the live URL into every step of
"## Owner's manual test" and keep owner_test: pending; if the story has no screen (owner_test: none),
mark it done in sprint-status.yaml instead. Regenerate the story board (python3 tools/story-board.py),
run the gate twice, and commit and push: "Story {E.S} - Deploy - <one line>" (or "- Done -" for a
no-screen story). Any question for the owner: plain English, an example, numbered options, one marked
(RECOMMENDED), under "## Questions for the owner" — then stop and say so. Finally show the owner the
test steps, in plain English.
```


> **Before you paste it** — New chat. Paste the whole prompt after your findings have been recorded (the Record prompt does that). The session fixes every finding inside this story and stops; it commits `Story {E.S} - Fix - …`. Then Review, Deploy and your test again — the loop repeats until you pass it.

```
/bmad-build

Story {E.S} — FIX the owner's test findings. Read docs/project-context.md, then {spec}: the findings
are under "## Owner's test findings" (set owner_test: issues). Fix every one inside this story — never
by a design pass — keeping the spec's frozen intent. When done, "## Verification" is refreshed
against the real services (R-82), and the story goes back through Review and Deploy for the owner
to test again. Any question for the owner: plain English, an example, numbered options, one marked
(RECOMMENDED), under "## Questions for the owner" — then stop and say so. Commit and push:
"Story {E.S} - Fix - <one line>".
```


> **Before you paste it** — Do the test first, on the live site, following the numbered steps in the story's panel (click the story's card; the panel slides in). Then open a chat, paste this prompt, and write under it what you saw — `passed`, or one line per problem — or, for a question the story asked you, `Ruled:` and your answer. The session records it, commits `Story {E.S} - Test - …` or `- Done -`, and tells you which prompt is next. Your ruling always goes through chat, never by editing a file.

```
I tested story {E.S} on the live site, or I am answering its question. What I found, or my answer:
<write "passed", or one line per problem, or "Ruled: <your words>" for a question>

Record it in {spec} (read docs/project-context.md first). Passed: set owner_test: passed, mark the
story done in _bmad-output/implementation-artifacts/sprint-status.yaml, regenerate the story board
(python3 tools/story-board.py), run the gate twice, commit and push: "Story {E.S} - Done - accepted by
the owner". Problems: write each one under "## Owner's test findings" in my words, set owner_test:
issues, regenerate the board, commit and push: "Story {E.S} - Test - <n> findings"; the Fix prompt is
next. A ruling: write "Ruled: <my words>" under that question in "## Questions for the owner", put the
spec's status back to what it was before the halt, regenerate the board, commit and push:
"Story {E.S} - <the phase that halted> - owner ruled: <one line>", and tell me which prompt to run
next. Never print a key. If anything is unclear, ask me in plain English with an example, numbered
options and one marked (RECOMMENDED).
```

**Two things about the gate a story writer must know.** `epics.md` and every file a story adds under
`tools/` or `docs/` need a row in `tools/doc-audit.py`'s catalogue or the pre-commit hook blocks the
commit; `implementation-artifacts/` (the specs, `sprint-status.yaml`) is outside the gate's walk and
needs nothing. The hooks live in `tools/hooks/` and are installed once per clone with
`git config core.hooksPath tools/hooks`; the committed story board is always one commit behind the
working-tree one, which the post-commit hook regenerates.

**Two questions E1's first story must put to the owner in R-83's shape before it deploys anything:**
(1) how production deploys — *(a)* Vercel's Git integration builds every push to `main` and
`VERCEL_TOKEN` is only for reading deployment state **(RECOMMENDED)**, or *(b)* the session deploys
with `vercel --prod`; (2) where the app's secrets live — *(a)* Vercel project environment variables
are the source of truth, `vercel env pull` gives local dev its `.env.local`, and `tools/probe/.env`
keeps the verifier's set under the same names **(RECOMMENDED)**, or *(b)* one shared file.

**Unblocks:** the next story, and — through the last one — step 6b's readiness gates and E15's launch gates.

---

# What is owed to the owner, collected in one place

| When | What |
|---|---|
| ~~Before step 2~~ | ✅ **DONE** — T1 and T3 are provisioned, seeded and credentialed |
| ~~During step 1~~ | ✅ **DONE** — repo shape, Supabase org structure, the measured compile budget, and an owning epic for every register item |
| ~~The live Supabase project~~ | ✅ **DONE 2026-08-20** — reset and re-applied in the dashboard; every assertion passes, hosted and container agree exactly |
| ~~Design prompt 3~~ | ✅ **DONE 2026-08-25** — every category designed, patched by the controls-reconciliation pass, and exported; patched again by the design patch pass 2026-08-31 |
| ~~Design prompt 2~~ | ✅ **DONE** — exported (S1–S14, M1–M9) |
| ~~Step 4b — you in the room~~ | ✅ **DONE 2026-08-27**, and extended on 2026-08-31 when the design patch pass and the §F asks came back to you (R-30 … R-38) |
| ~~Step 5 — journeys and flows~~ | ✅ **DONE 2026-09-03.** It asked you three questions and you ruled all three (R-76, R-77, R-78). Both spines are final |
| ~~① The Appendix A Claude Design prompts~~ | ✅ **DONE 2026-09-04** — both sessions ran, the export landed, the runbook ran once, both builds lift the D canvases; §A15 records what landed. Before that this row read: |
| ~~①b Owed — prompt A9, one Claude Design session~~ | ✅ **DONE 2026-09-04** — the owner ran A9 whole (R-86) the same day, the export landed, the runbook ran, and §A15 "A9 landed" verifies it: nineteen of twenty items in full, item 3 in part (three sibling hints on P0-3, absorbed by the token). Nothing is owed to Claude Design. Before that this row read: the misses of the 2026-09-04 export (`EXPERIENCE.md` Appendix A9, items 1–9: the rail total, the Kit caption, three P0 hint colours, "edits" not "changes", D8b's caption, D5b's template file, Free's storage row, the S9 YAML pane, B22) and its second half (items 10 onward: the frames the UX pass had deferred — B15, S8a′/S11a, B14b, B7, B18, B8, B4a, B20/S11d, B6). **Ruled 2026-09-04 — R-86: both halves, one session.** It blocked nothing | `EXPERIENCE.md` Appendix A, and its `### A` headings are the count if this line has gone stale. **Step 5b's prototype was built without them**, so its pages for undrawn surfaces are extrapolated from the frames the spine names; run these and those pages should be checked against the result. A1 to A6 draw surfaces that were never drawn (the first-deploy gates · history with pinning · the drift report · the dashboard sheets · the canvas markers · Theme Settings completed) · **A7 corrects existing frames** — its numbered items are the list, and since the 2026-09-03 review they include the accessibility items that would change a frame · **A8 draws the editor at 834 and 720**, which R-76 and the accessibility floor both need and the export has never drawn. They block nothing — run them alongside step 6, as two sessions from `APPENDIX-A-PROMPTS.html`, one export after both |
| ~~② Walk 5b, then 5c~~ | ✅ **DONE 2026-09-04.** The owner walked 5b and wrote the date under step 5b, *The walk*. UI issues are **fixed in their stories, not by another design pass first — R-80** (§A13, as amended): he tests each UI story on the deployed site and reports what he finds |
| **③ Now — step 6, the story breakdown** | **Open since 2026-09-04.** Run the step-6 prompt from the board. Per R-74 every story with a surface names its frame; per R-80 every story with a screen carries the owner's manual-test script and waits for his test after deploy. Then the loop of step 7, watched from `STORY-BOARD.html` (R-84), with a commit after every phase (R-81) and review on the real infrastructure (R-82). Runs in parallel with ①, which blocks nothing |
| **Launch checklist** | **Enable Dodo's *Upcoming Renewal Reminder*** — Settings → Communication → Customer Emails, **off by default**. Note this is now a *backstop*, not the mechanism: by owner decision (register 37b) **Inflozo sends its own** reminder at **30 days before an annual renewal and 7 before a monthly one**, because the exposure was always the *timing* — ~2 days is very likely short of the statutory window for an annual term, and Appendix F assumes a 60% yearly mix. The two do not collide: ours is the heads-up, Dodo's is the final nudge |
| Before deploy paths are verified end to end | **T2** — Ghost(Pro) Publisher, $29/mo |
| ⛔ **Before the Live project takes real customer data** | **Put Live on the Supabase Pro plan** *(register 42)*. The **Free plan has NO automatic backups at all** — that gap, not the point-in-time question, is the real cliff, and AD-26 provisions Live as a **fresh project** at go-live, so this is a step someone must perform rather than inherit. The gate is: Pro active, daily backups visible in the dashboard, **and one real restore performed** using `RESTORE-RUNBOOK.md` — a backup nobody has restored from is a hypothesis, which is exactly how the first drill found two defects |
| Deliberately NOT bought yet | **Point-in-time recovery**, at $100/month per 7 days of retention — roughly eight Pro subscribers of margin against an 11–16 subscriber break-even, buying 2-minute recovery over 24-hour. It is also worth less here than to a typical product: **a database rewind cannot rewind the customer's Ghost site**, so the most consequential state is out of its reach. **Revisit trigger:** ~50 paying customers, or the first time any customer loses work for any reason. Until then a scheduled `pg_dump` gives most of the value for a few dollars |
| ⛔ **Before public launch** | **The Ghost(Pro) gate** — acquire a Ghost(Pro) **Starter** site, capture the real `GET /admin/config/` `hostSettings.limits` payload, and verify FR-C2's Preview-only detection against that recording. Until it clears, that path is a **KNOWN UNTESTED PATH** and no marketing may target Ghost(Pro) users. You asked to be reminded of this one |
