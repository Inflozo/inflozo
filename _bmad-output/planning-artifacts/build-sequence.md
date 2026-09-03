---
title: Inflozo — Build Sequence & Handoff Prompts
status: operational note (not normative; `prd.md` governs on any conflict)
created: 2026-08-19
updated: 2026-09-03 (ninth pass) — steps 1, 2, 3, 4, 5, 5B and 5C COMPLETE. TWO BUILDS EXIST AND NEITHER REPLACES THE OTHER: `ux-designs/prototype/index.html` is the ANNOTATED one (5b — checkable against the frames) and `ux-designs/walkthrough/index.html` is the PRODUCT one (5c — no scaffolding, it behaves; double-click this to see how it will feel). WHAT IS OWED NOW IS THE OWNER'S WALK OF 5b — R-75's gate, with "walked" defined under step 5b's *The walk* — and 5c afterwards for feel: step 6 does not open until he says he has walked 5b, and that sentence is his (R-75). The library is derived, never restated: run `python3 tools/inventory-gen.py --check`. The rulings live in prds/.../reconcile-designs-decisions.md — §A the step-4b rulings, §A2-§A4 the 2026-08-31 additions — and four of the controls pass's decisions are reversed there (D3, D17, D26, D27-in-half). One step-2 prompt still contradicts executed evidence and stays flagged in place rather than deleted
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
> **The critical path is now the OWNER'S WALK.** Step 6 stays shut until he has walked the prototype
> and said so; the date of that sentence goes in step 5b and it is his to write (R-75). R-30 … R-38 were propagated on 2026-08-31 and step 4
> owes nothing normative; what is left of it is one Claude Design patch pass over the specs those
> rulings name, which blocks nothing. **Step 5 added `EXPERIENCE.md` Appendix A — one Claude Design prompt per undrawn surface
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
| **E0(a) mark-emission spike — step 2** | ✅ **DONE.** Both emitters exist and are proven to agree **node by node** — `tools/stress/test-renderer-agreement.js`, 8 checks — which is §7.3's exit criterion made runnable. Plus `test-ad36.js`, 13 checks. Both defects this document named are fixed. `spike-compiler/` is **retired**, not repaired |
| **The live Supabase project** | ✅ **matches the schema.** Reset and re-applied by the owner 2026-08-20 in the dashboard: every assertion passes and container and hosted agree exactly on the policy count (the harness prints both; this file does not restate them). F13 confirmed on the real platform: 4 users → 4 profiles → 4 entitlements |
| **Reliability** | ✅ **NFR-4's restore drill run for the first time — and the backup did not work.** Two silent defects, both fixed and written up as `RESTORE-RUNBOOK.md`. Deliberate failures were also run against a real Ghost: four behaved, one did not (register 39) |
| **Documentation gate** | ✅ **`tools/doc-audit.py`** — three propagation audits were run by hand and every one found something, always in the most recently added thing. Now a script with the harness's contract: **it exits non-zero on drift.** Run `--check` at the end of every round and before any commit that adds a document (AD-36b) |
| **For a human** | ✅ `ARCHITECTURE-IN-PLAIN-ENGLISH.html` — the whole system without jargon, 12 sections and 7 diagrams. The document to hand a designer, an investor or a first engineer |
| **Step 4a — the review** | ✅ **DONE 2026-08-27** — `prds/…/reconcile-designs.md`: every category spec as it then stood, P0 and the S/M screens reconciled. 1,086 findings, 41 probe families, a 1,078-row owner-flag register, and the PRD amendments rolled up by FR. Machine-readable findings beside it as `reconcile-designs.findings.json`. It is a `record` — never edit it |
| **Step 4b — the Ghost Build Room** | ✅ **DONE 2026-08-27, extended 2026-08-31** — `prds/…/reconcile-designs-decisions.md`: the rulings, each naming the documents that must move (§A from the room; §A2–§A3 from the design patch pass and the §F asks; §A4 the re-verification of step 5's work list). All 66 ghost-infeasible findings and all five decision-collisions closed. **Four probe families left the register** — 2 and 31 closed by execution against T1/T3 during the session, 8 and 9 deleted by the native-search ruling, and 1 reduced to its budget half (now register item 47). **Four approved decisions superseded: D3, D17, D26, D27-in-half.** Tier-1/Tier-2 propagation landed the same day (`MEASUREMENTS.md` §29, `VERIFY-AT-BUILD.md` 47–51, `CONTROL-PROMPTS.html`, the spine); **the inventory merge has since landed too** |
| **Design patch pass** | ✅ **RUN 2026-08-31** — one prompt per category (`DESIGN-PATCH-PROMPTS.html`, generated by `tools/design-patch-prompts.py`), applying the step-4b rulings to the specs themselves. Verified by `python3 tools/verify-design-pass.py`: every structural check passes. It raised 28 questions; two reached the owner and are ruled as **R-30** and **R-31** |
| **The inventory merge** | ✅ **DONE.** The inventory is generated from the export and gated; A23 Search is deleted; every per-category `Content:` / `Controls:` / `Data:` union and both of research §7's design-list columns are re-derived from the export; `derived-fields-A1-A12.md` is retired. **R-30 … R-38** propagated on 2026-08-31 — `reconcile-designs-decisions.md` §A3 is the ledger |
| Journeys & flows | ✅ **DONE 2026-09-03 — step 5.** `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` and `EXPERIENCE.md`, both `status: final`. Four journeys, eight flows, every surface with one stable name and a named source frame; **Appendix A carries a Claude Design prompt per undrawn surface group** (eight at the time of writing; the headings are the count). Found the **Paywall editor already drawn** at `C Post Body` C3a, which §37.7 called missing; found a library total in `S3`'s product copy that both controls had been blind to for a third time. Four rulings in `reconcile-designs-decisions.md` §A11 (R-76…R-79); `prd.md` FR-D1, FR-J7 and FR-J9 moved |
| Static prototype | ✅ **BUILT 2026-09-03 — step 5b** (owner's ruling R-75, 2026-09-02). `ux-designs/prototype/` — **double-click `index.html`**, no server and no build step. One page per surface `EXPERIENCE.md` names, every panel/pill/marker/sheet as a section of the page it lives on, and the four journeys and eight flows as labelled trails; every page's first HTML comment names the frame it derives from (R-74) and the section it implements. Built from the frames as they stood — **Appendix A's prompts had not been run**, so its extrapolated pages should be re-checked against the D-canvases once they exist. 🔵 **What is owed: the owner's walk, which gates step 6** |
| Walkthrough | ✅ **BUILT 2026-09-03 — step 5c, second cut.** `ux-designs/walkthrough/` — **double-click `index.html`**, which opens on Sign In as a user would meet it. No scaffolding on a product screen: every screen is a frame lifted from the export and patched with links and hooks — menus, popovers and sheets open from the control that raises them; segmented controls, tabs and radio lists pick; the deploy wizard walks its four drawn steps through the library-update confirm and the snapshot gate; `P`, `L` and `Esc` work in the editor. **What it does not do is listed in `_screens.html`** under three headings — no frame yet (an Appendix A prompt owes it), drawn on a mechanism a ruling re-specifies (held out or shown as drawn until A7 runs, §A12 decision 6), and states no frame draws. The design ring and the backup gate are in the first list, not in the build. `_screens.html` and `_selfcheck.html` are the two files that are not product screens. **It does not replace 5b** — a change to the design belongs in both, and 5c is walked after 5b, for feel |
| Stories | ⬜ not started — **step 6**, and it does not open until the owner has walked 5b (R-75) — a date on the line under step 5b, *The walk*, which no tool reads |

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

The PM stage is already complete — `prd.md` **v4.1** is its output. **Two deprecations to avoid:** `bmad-create-architecture` forwards to `bmad-architecture`, and `bmad-create-story` / `bmad-dev-story` are superseded by `bmad-build`. Use the current names.

Once stories exist, the development loop is `/bmad-build` per story, with `/bmad-code-review` and the `/bmad-testarch-*` skills on the QA side — but that is beyond this document, which ends at the first story.

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

**That race has been won, and the design work is finished.** Steps 1 and 2 landed before prompt 3 started; prompt 3 ran across every category; and the controls-reconciliation pass then patched every one of them against the PRD's control vocabulary and Ghost's verified data surface. **Step 4 then supplied the proof that each can be built on Ghost as specified, and the rulings on everything the design pass could not settle** (2026-08-27, extended 2026-08-31). **The critical path is now the owner's walk of 5b** (R-75).

```
✅ Step 1 /bmad-architecture ──► ✅ Step 2 /bmad-build (2 spikes) ──┐
                                                                    ├──► ✅ Step 4a /bmad-review ──► ✅ Step 4b Ghost Build Room
✅ Step 3 Design prompts 2 & 3 + the controls pass (owner) ─────────┘                                         │
   └─ prompt 2 is exported: step 5 is unblocked ────────────────────────────────────────┐           (probes, if any)
                                                                                        ▼                     ▼
                                                                       ✅ Step 5 /bmad-ux ──► ✅ inventory merge ──► ✅ 5b prototype + ✅ 5c walkthrough ──► 🔵 the owner's walk of 5b, then 5c ──► Step 6 stories
```

**Everything up to and including step 5c is done.** Step 5 ran on 2026-09-03 and its spines are
final; both builds were made the same day and both open with a double-click. What remains on the
critical path is **the walk itself** — the owner opening `ux-designs/prototype/index.html` (5b, which
R-75 names as the gate), following every journey and every flow on its front door to the end, and
writing what reads wrong into `ux-designs/WALK-NOTES.md`; then `ux-designs/walkthrough/index.html`
(5c) for how it feels — and then stories. What "walked" means, and his checklist, are under step 5b,
*The walk*.

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
| Both emitters, sharing one code path | `tools/stress/compile.js` — the `users` parameter is the only difference between them, which is what makes §7.3's "agree by construction" a property of the code |
| §7.3's exit criterion, runnable | `tools/stress/test-renderer-agreement.js` — 8 checks comparing canvas and theme **node by node** |
| The escaping and injection invariants | `tools/stress/test-ad36.js` — 13 checks: AD-36's four vectors, AD-4/AD-5, FR-H8's guard rule |
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
> 70-section theme, and pinned in `test-ad36.js` and `test-renderer-agreement.js`.
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

`/bmad-review` is the right engine for **coverage** — every one of the specs read in full, category by category, with subagents, against a fixed checklist — and it reports findings; it does not argue. A feasibility question ("can a theme partial strip a `+` prefix from a Ghost nav label?") needs someone who knows Ghost to say *no, and here are the two things you can do*, an architect to say where that lands, and the engineer who has to build it to say what it costs — and then the owner to rule. That is what **The Ghost Build Room** exists for (`_bmad/custom/bmad-party-mode.user.toml`: Ravi the Ghost CMS expert, Winston, Amelia, Murat, Sally, Dana; memory on — AD-36 came out of this room). So: **4a produces the complete question list; 4b rules on it.** Running the room first would mean ruling on a partial list; running only the review would mean a report nobody has decided anything about.

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

**What is left is DESIGN work, and it is IN PROGRESS (2026-08-31).**
`DESIGN-PATCH-PROMPTS-2.html` (`tools/design-patch-prompts-2.py`) carries one self-contained prompt per
category that has work — **P0 first**, because the greyed-control treatment is drawn there once and
every later category points at it. **20 prompts.** Nothing in it is a question. **Three of them changed
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
double-click.** The critical path is now **the owner's walk of it** — see step 5b below.

---

# Step 5 — Journeys and flows *(✅ COMPLETE 2026-09-03)*

> **Done. The prompt that used to sit here has been replaced by the completion record below.**
> The outputs are `planning-artifacts/ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` and
> `EXPERIENCE.md`, both `status: final`. **Step 5b has since been built from them**
> (`ux-designs/prototype/index.html`), and step 6 stays shut until the owner has walked it (R-75).

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
  1024 px · **R-77** Site Remix drops the drawn "Keep Free designs only" · **R-78** redesign
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
> the ruling (and A7, where A7 will redraw the frame). Its plan limits are shown as **Appendix F.1's
> table beside the frame** — the frames that disagree with F.1 are lifted untouched, and F.1
> governs. And **Appendix A's Claude Design prompts had not been run when it was built** (the export
> carries no D-canvases), so a surface with no frame **says so and shows nothing**; once those prompts
> have run, those pages should lift the new frames.
>
> `build.py` beside it generates every page from one registry, so the index cannot claim a surface
> that does not exist or miss one that does, and it refuses to write if any link or anchor is dead,
> if any lifted region is not byte-identical to its `.dc.html`, or if anything is hidden by default.
> The prototype's HTML is **disposable by design** the day the dynamic UI matches it; what outlives
> it is listed under step 5c, *What outlives both builds*.
>
> 🔵 **What is owed now is the owner's walk.** Nothing here is a substitute for it.

**Produces:** a clickable, static HTML prototype of Inflozo's own UI — the interface the final
product will have — that the owner opens with a double-click and walks in his browser.
**Needs from the owner:** walk it, and say what reads wrong. That is the whole ask.
**Unblocks:** step 6. **Step 6 does not open until the owner has walked the prototype** — a wrong
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

**Owner walked the prototype on: _(not yet — this line is the owner's to write)_.**

Until a date stands on that line, step 6 stays shut. It is deliberately not something a session may
fill in on his behalf: the gate is the walk, not the build. **And it is a human tick that no tool
reads** (F-082): `doc-audit.py` quotes this sentence and checks nothing, the board's step-6 status
is set by hand, and step 6's prompt is on the board and runnable today. **Nobody runs the step-6
prompt before a date stands here.**

**5b is R-75's gate, exactly as the ruling names it; 5c is walked afterwards, for feel** (owner,
2026-09-03 — `reconcile-designs-decisions.md` §A12 decision 3). **"Walked" means every journey and
every flow on `prototype/index.html`'s front door opened end to end** — every step of every trail
clicked through to its last page — **with the owner's notes in one named file:**
`ux-designs/WALK-NOTES.md`, which has a heading per journey and per flow and a line per screen.

**The checklist — one sitting.**

1. Double-click `_bmad-output/planning-artifacts/ux-designs/prototype/index.html`. Open
   `_bmad-output/planning-artifacts/ux-designs/WALK-NOTES.md` beside it in any text editor.
2. Under **The four journeys**, click the first step of J1. Read the page; the trail bar under the
   frame names the trail you are on and links to the next step. Follow it to the end. On each
   page write one line under that screen in `WALK-NOTES.md` — *fine*, or what reads wrong.
   Then J2, J3, J4.
3. The same for **The eight flows**, F1 to F8.
4. **Look hardest at these five** (from the review, `ux-designs/review-5b-5c-2026-09-03.md`):
   - **The deploy wizard.** Six steps on a first deploy, four afterwards; the Staff Token Offer and
     the Backup Gate are not drawn yet and their pages say so in those words.
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
   opens.

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
DO NOT OPEN STEP 6: the gate is the OWNER'S WALK, not the build. The date goes on the line
under "The walk" in build-sequence.md step 5b, and it is his to write.
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
| Behaves | no — it depicts | yes — menus, popovers and sheets; picks; the four-step deploy wizard; `P`, `L` and `Esc` in the editor |
| Read with JavaScript off | completely | mostly; JS is the point of it |
| The design ring, the backup gate | drawn positions and "not drawn", annotated | **not in it** — held out until prompts A5 and A1 run |
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
- **The deploy wizard walks its four drawn steps** — destination, pre-flight, shipping, live — with
  the library-update confirm before Check, the snapshot gate on entering Ship, progress that ticks
  and lands on Live, and the failure ending reachable. It is the drawn wizard, not the six-step
  first deploy: the Staff Token Offer and the Backup Gate have no frame (prompt A1).
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
asserts each entry against the registry.** Three headings, because three things are true. *No frame
in the export* — the first-deploy gates, history pinning, the drift report, the dashboard sheets,
the canvas markers, Theme Settings completed, the editor below 1440 — each waits on the Appendix A
prompt named beside it. *Drawn, but on a mechanism a ruling re-specifies* — held out or shown as
drawn until A7 runs (owner, §A12 decision 6): Redesign Proposals held out entirely; the Pro Exit
Sheet shown with its drawn remedies and FR-L3's count left to A7; the Starter Chooser with its drawn
roster and Appendix E's left to A7; S4d's paid-tier rows A7's; Device Preview not lifted because it
draws a zoom control FR-D14 forbids. *States no frame draws* of surfaces that are here — the empty
canvas, a bad key, Deploy Uploaded, Cancel plan, dark authoring, Suggestions at 390. **The on-section
design nav (B1b) is in the first group**: it is drawn as a detail card, not on the editor, so nothing hangs
it there; the ring itself steps between its two drawn positions.

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
them as drawn until A7 runs, as listed above. A lift is patched only with links, ids, classes, hooks
and the PRD's own strings, never with markup in a second vocabulary; a fix that would change what a
frame *looks* like is A7's, not this file's.

> ✅ **STEP 5B WAS REBUILT ON THE SAME LIFTER, in the same pass.** `frames.py` moved up to
> `ux-designs/` so both generators share it. Every screen in the prototype is now a lifted frame with
> the annotation *around* it rather than inside it — and where a surface **has no frame**, the page
> says so in those words and **shows nothing**. That last part matters: inventing a picture for an
> undrawn surface is the second interface vocabulary R-74 exists to forbid, and the first cut did
> exactly that on every one of them. The pages that say "not drawn" name the Appendix A prompt that
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
**Needs from the owner:** to have **walked step 5b's prototype first — R-75 gates this step**, and
the gate is the date line under step 5b, *The walk* — a human tick no tool reads. The prompt below is
runnable today and nothing technical stops it; **do not run it before that date stands.** And
per **R-74**, every story with a surface carries a "matches the frame" acceptance criterion naming
the frame (or extrapolated frame) it is built from.
**Unblocks:** development.

§8 already fixes the epics, their order, their exit criteria and every FR's owning epic. This step expands that into stories — it does not re-plan it.

### Prompt

```
/bmad-create-epics-and-stories

Create the epics and stories list for Inflozo.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
Architecture: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md
Reconciliation (step 4): prds/prd-Inflozo-2026-08-17/reconcile-designs.md and
reconcile-designs-decisions.md — the rulings there bind the stories.

Section 8 ALREADY fixes the epic breakdown, the sequence, the exit criteria and every FR's
owning epic — every FR owned by exactly one epic apart from the splits section 8 documents explicitly (FR-P1 per email, FR-Q6 format-vs-surface, and FR-G1/G4/G5/G6 shared between the shell block and the gated pipeline). Expand
it into stories; do not re-plan it and do not renumber anything.

Three rules from section 8 that shape the story list and are easy to get wrong:
  - STORY GRANULARITY: in the library epics a CATEGORY is a story, not a design. One story per
    category. A category story delivers every design in that category against one shared content
    model and one stylesheet, plus that category's behaviour modules.
  - The library epics run SEQUENTIALLY. There are no waves. Each category's owner gate blocks
    the next category from starting.
  - There are as many owner gates as there are categories, the shell block's three included.

Section 4's build order is binding and comes first: the FR-D4 mark-emission spike, then the E0
platform-verification spike, then the complete shell block (all 47 designs of Group 1, not a
minimal shell), then the gated categories in inventory order beginning with Heroes.

A category story cannot open until that category's design-and-specification session has landed
its specs in sections-inventory.md (§4).
```

---

### Then gate readiness before any story opens

```
/bmad-sprint-planning

Check implementation readiness for Inflozo and generate the sprint status tracking from the
epics.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md

Two readiness conditions are specific to this project and are not the usual ones:
  - A library category's story cannot open until that category's design-and-specification
    session has landed its per-design specs in sections-inventory.md (§4). A category whose
    designs still carry only their one-line descriptor has not been through that session.
  - The library epics run SEQUENTIALLY, each category blocked by the previous category's owner
    gate, so the sprint plan must not show library categories running in parallel.
```

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
| **① Still owed — eight Claude Design prompts** | `EXPERIENCE.md` Appendix A, and its `### A` headings are the count if this line has gone stale. **Step 5b's prototype was built without them**, so its pages for undrawn surfaces are extrapolated from the frames the spine names; run these and those pages should be checked against the result. A1 to A6 draw surfaces that were never drawn (the first-deploy gates · history with pinning · the drift report · the dashboard sheets · the canvas markers · Theme Settings completed) · **A7 corrects existing frames** — its numbered items are the list, and since the 2026-09-03 review they include the accessibility items that would change a frame · **A8 draws the editor at 834 and 720**, which R-76 and the accessibility floor both need and the export has never drawn. They block nothing — run them before or after step 5b, whichever you prefer |
| **② Then — walk 5b, then 5c.** | **5b is R-75's gate** (§A12 decision 3): double-click `_bmad-output/planning-artifacts/ux-designs/prototype/index.html` and open **every journey and every flow on its front door, end to end**, writing a line per screen in `ux-designs/WALK-NOTES.md` — the checklist, and the five things to look at hardest, are under step 5b, *The walk*. **Then 5c** — `ux-designs/walkthrough/index.html`, which opens on Sign In with everything clickable — for how it feels. **Step 6 does not open until you have walked 5b**, and saying you have is yours to say (R-75); the date line is under step 5b |
| **Launch checklist** | **Enable Dodo's *Upcoming Renewal Reminder*** — Settings → Communication → Customer Emails, **off by default**. Note this is now a *backstop*, not the mechanism: by owner decision (register 37b) **Inflozo sends its own** reminder at **30 days before an annual renewal and 7 before a monthly one**, because the exposure was always the *timing* — ~2 days is very likely short of the statutory window for an annual term, and Appendix F assumes a 60% yearly mix. The two do not collide: ours is the heads-up, Dodo's is the final nudge |
| Before deploy paths are verified end to end | **T2** — Ghost(Pro) Publisher, $29/mo |
| ⛔ **Before the Live project takes real customer data** | **Put Live on the Supabase Pro plan** *(register 42)*. The **Free plan has NO automatic backups at all** — that gap, not the point-in-time question, is the real cliff, and AD-26 provisions Live as a **fresh project** at go-live, so this is a step someone must perform rather than inherit. The gate is: Pro active, daily backups visible in the dashboard, **and one real restore performed** using `RESTORE-RUNBOOK.md` — a backup nobody has restored from is a hypothesis, which is exactly how the first drill found two defects |
| Deliberately NOT bought yet | **Point-in-time recovery**, at $100/month per 7 days of retention — roughly eight Pro subscribers of margin against an 11–16 subscriber break-even, buying 2-minute recovery over 24-hour. It is also worth less here than to a typical product: **a database rewind cannot rewind the customer's Ghost site**, so the most consequential state is out of its reach. **Revisit trigger:** ~50 paying customers, or the first time any customer loses work for any reason. Until then a scheduled `pg_dump` gives most of the value for a few dollars |
| ⛔ **Before public launch** | **The Ghost(Pro) gate** — acquire a Ghost(Pro) **Starter** site, capture the real `GET /admin/config/` `hostSettings.limits` payload, and verify FR-C2's Preview-only detection against that recording. Until it clears, that path is a **KNOWN UNTESTED PATH** and no marketing may target Ghost(Pro) users. You asked to be reminded of this one |
