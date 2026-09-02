---
title: Inflozo — Build Sequence & Handoff Prompts
status: operational note (not normative; `prd.md` governs on any conflict)
created: 2026-08-19
updated: 2026-08-31 (sixth pass) — steps 1, 2, 3 and 4 COMPLETE, and the inventory merge is complete apart from the propagation of the 2026-08-31 rulings. STEP 5 IS THE CRITICAL PATH. The library is derived, never restated: run `python3 tools/inventory-gen.py --check`. The rulings live in prds/.../reconcile-designs-decisions.md — §A the step-4b rulings, §A2-§A4 the 2026-08-31 additions — and four of the controls pass's decisions are reversed there (D3, D17, D26, D27-in-half). One step-2 prompt still contradicts executed evidence and stays flagged in place rather than deleted
covers: the six steps from finished PRD to first story, what each needs from the owner, and a self-contained prompt for each
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
> **The critical path is now STEP 5 — journeys and flows (`/bmad-ux`).** R-30 … R-38 were propagated
> on 2026-08-31 and step 4 owes nothing normative; what is left of it is one Claude Design patch pass
> over the specs those rulings name, which blocks neither step 5 nor step 6.
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
| **The inventory merge** | ✅ **DONE.** The inventory is generated from the export and gated; A23 Search is deleted; every per-category `Content:` / `Controls:` / `Data:` union and both of research §7's design-list columns are re-derived from the export; `derived-fields-A1-A12.md` is retired. What is **not** done is the propagation of **R-30 … R-38** — see below |
| Journeys & flows | 🔵 **NEXT — step 5**, and unblocked: prompt 2 is exported and 4a has reported on the S-screens (§37.7 lists the editor surfaces with no frame and the flows drawn on wrong semantics — that is step 5's input) |
| Stories | ⬜ not started — **step 6** |

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

**That race has been won, and the design work is finished.** Steps 1 and 2 landed before prompt 3 started; prompt 3 ran across every category; and the controls-reconciliation pass then patched every one of them against the PRD's control vocabulary and Ghost's verified data surface. **The critical path is now step 4**: the designs exist — what does not yet exist is the proof that each can be built on Ghost as specified, and the rulings on everything the design pass could not settle by itself.

```
✅ Step 1 /bmad-architecture ──► ✅ Step 2 /bmad-build (2 spikes) ──┐
                                                                    ├──► 🔵 Step 4a /bmad-review ──► 🔵 Step 4b Ghost Build Room
✅ Step 3 Design prompts 2 & 3 + the controls pass (owner) ─────────┘                                         │
   └─ prompt 2 is exported: step 5 is unblocked ────────────────────────────────────────┐           (probes, if any)
                                                                                        ▼                     ▼
                                                                          Step 5 /bmad-ux ──► inventory merge ──► Step 6 stories
```

**Read that second line.** Step 5 waits on nothing any more — prompt 2 is exported. The safe default
is still to let 4a report first, because 4a reviews the same S-screens step 5's flows are drawn on;
but nothing forbids running them side by side. See step 5.

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

**Step 5 (`/bmad-ux`) is the critical path and is blocked by nothing** — see below.

---

# Step 5 — Journeys and flows

**Produces:** the four journeys and **eight** flows — the PRD's six, plus the two decided 2026-08-21.
**Needs from the owner:** less than this document originally assumed — see below.
**Unblocks:** step 6.

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

### ⓘ The design export is the starting material, not a reference to consult *(owner, 2026-08-31)*

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

### Prompt

> **Stress-tested three times on 2026-09-02** and patched after each round — every path,
> filename, FR, AD and ruling in it was executed against the repository, not assumed. The rounds
> found: a P0 range whose gap is deliberate, that one export file is not one screen, that the
> journey-to-frame map already exists and the old prompt never named it, that §A4's "the S/B/M
> screens were not touched" has gone stale, that `R Responsive System` is about the generated
> sites rather than this app, that the skill's key-screen-mock step contradicts the export, and
> that the map file the old prompt sent you to **does not exist**.

```
/bmad-ux

Create the UX specifications for Inflozo: the four mandated journeys and the eight mandated
flows. Working directory: /home/ghost/Dev/Inflozo

═══════════════════════════════════════════════════════════════════════════════
0 · READ THIS SECTION BEFORE YOU ACTIVATE THE WORKFLOW
═══════════════════════════════════════════════════════════════════════════════

THIS IS NOT A GREENFIELD UX RUN, AND THE SKILL'S DEFAULT SHAPE IS WRONG FOR IT.

bmad-ux's Discovery says "elicit and capture the user's vision, never impose yours", and it
offers colour-theme tools, design-direction tools and wireframe tools. For Inflozo, ALL OF
THAT IS ALREADY DECIDED AND DRAWN. There is a complete, executed visual system and a fully
drawn application sitting in the repository. Running a colour-theme elicitation here would
throw away the single largest investment in this project.

So:
  - Take the FAST PATH, not the coaching path.
  - DO NOT invoke the colour-themes, design-directions or excalidraw creative tools. Read what
    they actually do before you are tempted: `design-directions.md` produces "3-6 distinct visual
    directions, each a COMPLETE VISUAL PERSONALITY... differ on density, type weight, motion
    implication, brand register", and `color-themes.md` produces "4-6 distinct theme variations
    side by side so the user can pick". That is the job Claude Design already did, at far higher
    fidelity, across the whole application. Running either would ask the owner to re-choose a
    design system he has already chosen and paid for in months of work.

  - THE SOURCE SCAN WILL NOT FIND THE EXPORT BY ITSELF, AND YOU MUST NOT WAIT TO BE TOLD.
    bmad-ux's Discovery says to glob the planning-artifacts folder, "surface paths only — never
    read content", and let the user confirm which sources apply. THE OWNER SHOULD NOT HAVE TO KNOW
    WHICH PATHS MATTER. These are the sources; treat them as already confirmed and read them:

        _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/   (the whole of it)
        _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
        _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md
        _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs.md
        _bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/

    Still ask him whether anything is MISSING from that list. Do not ask him to approve it.

  - THE ONE PRECEDENCE RULE IN THIS SKILL YOU MUST READ BACKWARDS. bmad-ux states twice that
    "both spines win on conflict with any mock, wireframe, or import". In its model the Claude
    Design export is an IMPORT — so taken literally, a DESIGN.md that drifted from the export
    would OFFICIALLY OUTRANK the export, and the drift would become the specification. That is
    exactly the outcome this whole step exists to prevent.

    THE RULE STILL HOLDS, BUT ONLY BECAUSE THE SPINES ARE BUILT FROM THE EXPORT. DESIGN.md wins
    over the frames the way a typed-up contract wins over the handwritten draft it was copied
    from: it wins because it is a faithful copy. IF DESIGN.md AND THE EXPORT EVER DISAGREE, THAT
    IS A BUG IN DESIGN.md — NOT A DECISION, NOT A REFINEMENT, AND NOT YOURS TO RESOLVE BY
    PREFERRING YOUR OWN DOCUMENT. Go back to `Calibration Set.dc.html` and correct the spine.

    Say this inside DESIGN.md itself, near the top, in its own words: that it is a transcription
    of the Claude Design system, that `Calibration Set.dc.html` and `Editor Sidebar Kit.dc.html`
    are its source, and that a disagreement between them is resolved in the export's favour. A
    later reader must not have to guess which way that conflict resolves.
  - DO NOT offer the Google Stitch design handoff. The design producer for this project is
    CLAUDE DESIGN, and it already ran. Anything new goes back to it as a prompt (see §5).
  - DESIGN.md IS A TRANSCRIPTION, NOT AN ELICITATION. Its tokens come from the export's
    `Calibration Set.dc.html` and from `claude-design-prompt-2.md` §0.1, which restates the
    whole system in words. If your DESIGN.md contains a colour, a typeface, a radius or a
    spacing step that is not already in those two files, you invented it and it is wrong.
  - AND ONE EXPLICIT CONFLICT, RESOLVED HERE SO YOU DO NOT STALL ON IT. bmad-ux's Finalize step
    says to render key-screen HTML mocks into `.working/` and then ask which un-mocked surfaces
    need a visual reference. SKIP THAT STEP. Every key screen in this product IS ALREADY MOCKED,
    at higher fidelity than that tool produces, in the export. Rendering a second, lesser mock
    beside a finished frame creates two answers to one question. For a surface that genuinely has
    no frame, the substitute is NOT a mock — it is a Claude Design prompt (§5), so the drawing
    happens in the same project and inherits the same system. Say in your finalize notes that you
    skipped it and why.
  - THE REAL WORK OF THIS STEP IS `EXPERIENCE.md` — the Information Architecture, the State
    Patterns and above all the KEY FLOWS.

The owner is Umang. He is a solo founder and NOT AN ENGINEER. Greet him and work in plain
language. No jargon unless you explain it in the same sentence.

═══════════════════════════════════════════════════════════════════════════════
1 · THE SOURCES, IN PRECEDENCE ORDER
═══════════════════════════════════════════════════════════════════════════════

All paths are relative to /home/ghost/Dev/Inflozo.

  CLAUDE.md
      The seven standing rules. They bind this work. Read them first.

  _bmad-output/planning-artifacts/INDEX.md
      Every document with a one-line brief and one of four statuses:
        live    — current and authoritative
        tool    — runnable
        record  — a DATED RECORD. **NEVER EDIT ONE.**
        retired — provenance only
      The statuses bind. If you need to correct something in a `record`, the correction goes
      in a live document that supersedes it.

  _bmad-output/planning-artifacts/build-sequence.md
      The six steps. This is step 5. It governs on any conflict with the build board.

  _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
      NORMATIVE. Read its preamble first — it names every normative companion in the same
      folder and states the precedence order between them. Follow that order exactly.
      Note especially: the research companions OUTRANK the PRD body on any fact about Ghost,
      because the regression risk in this project has always lived in the distillation step
      rather than the research step.

  _bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md
      THE MOST IMPORTANT SINGLE INPUT AFTER THE PRD. Seventy-three numbered owner rulings
      (R-1 … R-73) taken between 27 August and 2 September, each naming the documents it
      moves. §B records which previously-approved decisions they supersede. Anything that
      contradicts this file is wrong, unless it is a `record`.

  _bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/
      ARCHITECTURE-SPINE.md   — the invariants (AD-1 … AD-38). Design against them.
      BACKUP-GATE.md          — the full specification of flow F7. Read it before you draw.
      VERIFY-AT-BUILD.md      — the register of things proven or still to prove
      MEASUREMENTS.md         — every executed claim with the command that produced it

  _bmad-output/planning-artifacts/design/claude-design-export/Inflozo/
      THE DESIGN EXPORT. See §2. This is your starting material.

═══════════════════════════════════════════════════════════════════════════════
2 · THE DESIGN EXPORT IS YOUR STARTING MATERIAL, NOT A REFERENCE TO CONSULT
═══════════════════════════════════════════════════════════════════════════════

Owner's instruction, 2026-08-31, repeated since: **"I do not want that we have spent so much
time and effort in Claude Design and that is lost."**

Step 5 is the first step that could quietly throw that away — by specifying flows in prose
that imply an interface nobody drew. It must not.

READ THE WHOLE DIRECTORY, NEVER A SUBSET. `Index.dc.html` and `Index - Categories.dc.html` are
the export's own map — they list every category design by design, grouped into five families.
(Older notes in this project said "CLAUDE.md carries the map". THERE IS NO `CLAUDE.md` INSIDE THE
EXPORT; that was wrong and was corrected on 2026-09-02. If you meet the claim again, it is stale.)
What is there, and every part of it is part of the work:

  Calibration Set.dc.html        THE SYSTEM — tokens, type scale, spacing, colour roles
  Editor Sidebar Kit.dc.html     every sidebar control, panel, badge and state
  R Responsive System.dc.html    THE GENERATED SITES' responsive system — fifteen structural
                                 archetypes and their collapse rules at 1440 / 834 / 390. READ
                                 THE FIRST LINE OF IT: "Responsive behaviour is a property of the
                                 archetype, not the design." THIS IS ABOUT THE SECTIONS INFLOZO
                                 BUILDS, NOT ABOUT INFLOZO'S OWN INTERFACE. Do not take it as the
                                 app's responsive spec.
  S1 Sign In … S14 Editor Cards  the application, drawn
  M1 Home … M9 404               the marketing site, drawn
  B Missing Surfaces.dc.html     the additional surfaces B1–B25
  C Post Body.dc.html            the post body
  P0-0 … P0-6, P0-9              the shared editor primitives, drawn. THE GAP IS DELIBERATE:
                                 P0·7 IS the `S14 Editor Cards` screen, and P0·8 is a
                                 library-wide RULES section that has no frames by design.
                                 Do not go looking for a `P0-7` or `P0-8` file.
  Index.dc.html, Index - Categories.dc.html   the two index canvases
  <ID>-<n> <Name>.dc.html        every design in the section library, drawn
  <ID>-0 Category Proof.dc.html  per category: its tokenisation proof, stress frame, roster
  <ID> <Name> - Spec.md          per category: ten spec fields per design (+ P0's spec)
  *-kit.js, _build/*.js          THE SHARED RENDER KITS — real, executable code
  interactions.js, support.js    the mock-interaction layer and the Claude Design runtime
  New Session Prompts/           the prompt each category was designed from
  uploads/, screenshots/         the original brief, and check images from the design work
  Actions Split - Migration Record.md    what the 31 August Actions split changed
  Doc Audit - 1 September 2026.md        the export's own internal audit

  THE `.dc.html` FILES ARE PLAIN, SELF-CONTAINED HTML with inline styles — open and read them
  directly. `support.js` and `interactions.js` are Claude Design's runtime and the mock-interaction
  layer; the `*-kit.js` and `_build/*.js` files are the render kits.

  ONE FILE IS NOT ONE SCREEN. The S, M, B and P0 canvases each hold SEVERAL LETTERED REGIONS,
  and the whole project refers to them by those letters. `S8 Deploy.dc.html` holds S8a … S8e;
  `S4 Editor.dc.html` holds S4a … S4d; `B Missing Surfaces.dc.html` holds B1a, B1b, B3a, B3b,
  B4a, B4b, B5a, B5b, B5c, B11a, B11b, B12a, B12b, B13a, B14a, B14b, B23a and the un-lettered
  singles beside them. So `B19` is a REGION INSIDE a file, not a file. Derive the region list
  by reading the canvas; do not conclude a surface is missing because there is no file named
  after it. That mistake has already been made in this project.

  AND THE APP SCREENS HAVE NO SPEC FILE. The A-categories each have a `<ID> <Name> - Spec.md`.
  S, M, B and the Editor Sidebar Kit DO NOT — they are frames only. For those surfaces THE
  FRAME IS THE ENTIRE SPECIFICATION, which is exactly why this step exists: EXPERIENCE.md is
  where their behaviour gets written down for the first time.

  TWO THAT ARE EASY TO MISS AND EXPENSIVE TO MISS:
    - The `-0 Category Proof` frames answer "what is this thing allowed to look like"
      better than the spec prose does.
    - The kits are EXECUTABLE. Each block renders from a token object, which is why light,
      dark and every pack are the same code with a different `t`.

  DO NOT EDIT ANY FILE IN THE EXPORT. It is Claude Design's copy and a re-export overwrites
  the repository's. Two hand edits were needed once and they now live in
  `tools/reapply-export-edits.py` and are GATED by `tools/verify-design-pass.py`. If you
  find something in the export that must change, write a Claude Design prompt for it (§5).

  `design/claude-design-prompt-2.md` is a `record` and its §0.1 restates the whole design
  system in words — personality, colour tokens, the component rules. Read it as the brief.

  `design/mockups/` is prompt 1's output and is SUPERSEDED for visual reference. Prompt 2's
  export is later and wins. Consult the mockups for intent only, never for components.

TWO AUTHORITIES, AND THEY DO NOT OVERLAP.
  The PRD wins on BEHAVIOUR — what a flow does, its states, its requirements, its copy
  obligations under Appendix H.
  The EXPORT wins on VISUAL LANGUAGE — which components a surface is built from, its tokens,
  spacing, density and tone.
  "Design artifacts are non-normative" has always meant the PRD decides what must happen. It
  has never meant a flow may invent a new interface vocabulary. Where a flow needs behaviour
  the drawn screens do not show, KEEP THE COMPONENTS AND CHANGE WHAT THEY DO.

═══════════════════════════════════════════════════════════════════════════════
3 · WHAT YOU ARE PRODUCING
═══════════════════════════════════════════════════════════════════════════════

FOUR JOURNEYS
  J1  connect → first deploy
  J2  blank-canvas build
  J3  Free-plan ship
  J4  downgrade recovery

EIGHT FLOWS — the PRD's six, plus two decided by the owner on 2026-08-21. Each is a
DESIGNED SURFACE, never a warning toast.
  F1  FR-J13   pre-deploy snapshot gate
  F2  FR-D18   the three-party edit-lock choreography
  F3  FR-I4    the guided routes-upload card
  F4  FR-J14   the library-update confirm
  F5  FR-C2    the Preview-only explanation, with its clearing conditions
  F6  FR-I6    the post-deploy template-binding checklist
  F7  ——       the pre-deploy BACKUP GATE   (spec: architecture-.../BACKUP-GATE.md)
  F8  FR-J7    DEPLOY HISTORY with pinning

Personas are PRD §3. Each carries its GHOST CREDENTIAL REACH, and that is what decides how a
journey actually plays out — the multi-site operator frequently is NOT the site Owner and
cannot mint a Staff Access Token at all, which is precisely the case FR-C1's graceful
no-token path serves. USE THE PRD's PERSONAS VERBATIM. The skill asks for named protagonists;
these are the named protagonists. Do not invent new ones and do not rename them.

SCOPE — WHAT IS AND IS NOT YOURS.
  IN: the product — the editor, the dashboard, deploy, routes, billing, the B surfaces, and every
  screen a journey or a flow passes through.
  IN ONLY WHERE A JOURNEY LANDS ON IT: the marketing pages M1–M9. J3 (Free-plan ship) and J4
  (downgrade recovery) touch pricing and plan limits, so M5 Pricing is in scope AS A DESTINATION.
  Do not re-specify the marketing site as a whole.
  OUT: the section library itself — the A-categories, their designs, their controls. That is
  step 3's finished work and it has its own specs and its own gate. You consume it; you do not
  re-open it.

FORM FACTOR — RESOLVE IT FROM THE FRAMES, PER SCREEN. The skill wants form-factor settled before
the IA closes, and this product does not have one answer. The frames say: `S4 Editor` is drawn at
1440 and is a desktop shape (FR-D1: slim top bar, collapsible Layers panel, centre canvas, right
Controls sidebar); `S3 Dashboard` carries explicit mobile treatment at 390. So DERIVE IT PER
SURFACE by reading the frame, and where a surface in a flow has no answer in the frames or the
PRD, that is a batched question (§8), not an assumption.

ACCESSIBILITY FLOOR. The skill's EXPERIENCE.md spine has an Accessibility Floor section. Its
content is NOT yours to invent: NFR-5 carries the accessibility scan and NFR-6 the render matrix
and E2E gates. Specify the behavioural floor against those two, and note that visual contrast
belongs to DESIGN.md.

Appendix H of the PRD is the VOICE CANON and governs every string you write.
`appendix-h1-string-catalog.md` is the string catalog itself.

═══════════════════════════════════════════════════════════════════════════════
4 · THINGS THAT ARE RECENT, DECIDED, AND EASY TO MISS
═══════════════════════════════════════════════════════════════════════════════

J1 HAS TWO ENDINGS. The Staff Access Token is DEFERRED to first deploy and may be DECLINED
PERMANENTLY. The declined path must still ship a site. G1's under-ten-minutes target
EXCLUDES the token step, which is what makes it reachable.

F2's EDIT-LOCK CHOREOGRAPHY IS DECIDED (Round 4, finding F4). A TAKEOVER IS ALLOWED. The
displaced device is then shown that its session was taken over and how much unsynced work
went with it. That message reads `unsynced_edits` (AD-16: edits, never ops) and it must be
HONEST RATHER THAN REASSURING — a takeover is not a graceful hand-off, so work that had not
synced is genuinely gone. The security half is already enforced in the schema: a holder
change cannot happen without advancing `lock_generation`, which is the number the displaced
device detects the takeover from.

F7's THREE NON-NEGOTIABLES. The gate fires ONCE PER SITE AT FIRST DEPLOY, not at connect, and
it BLOCKS the deploy button until confirmed. It is a checklist — one checkbox per backup
item, then a master confirm — and it opens by stating what Inflozo actually writes (the theme
and `routes.yaml`) BEFORE recommending a full backup, because a warning that overstates gets
clicked through and a gate everyone clicks through is not a gate. Three things the design
must not soften:
   - Ghost's JSON content export does NOT include images, and the gate has to say so.
   - `ghost backup` covers everything in one command for self-hosted customers and should be
     offered as the shortcut it is.
   - GHOST(PRO) CUSTOMERS CANNOT BULK-DOWNLOAD THEIR IMAGES AT ALL. Inflozo cannot fix this
     and must not paper over it.
The honest register matters more here than anywhere else in the product.

  ONE HONEST QUALIFICATION ON THAT LAST POINT, because standing rule 1 applies to it. The
  Ghost(Pro) image claim is CITED, not EXECUTED — `BACKUP-GATE.md` records that Ghost's own
  documentation offers no route and says to contact your host. There is no Ghost(Pro) test server
  yet: T2 (Publisher) is owed and T4 (Starter) is deferred by owner decision but its gate is
  launch-blocking. So write the gate's Ghost(Pro) copy so it stays true if the detail turns out
  narrower than the documentation implies — say what Ghost Admin does and does not offer, and
  point the customer at Ghost, rather than asserting a platform-wide impossibility in Inflozo's
  own voice.

F8's THREE RULES. At most 10 stored versions per project on Pro and 3 on Free, PINNED
INCLUDED IN THAT COUNT.
   - The limit is STATED, NOT IMPLIED. A list that silently drops its oldest entry reads as
     complete when it is not.
   - The history must NEVER SHOW A VERSION IT CANNOT RESTORE. A dead Restore button is worse
     than a shorter list.
   - AT LEAST ONE VERSION MUST STAY UNPINNED, enforced in the database, so the pin control
     needs a clear refusal state rather than a silent failure. Unpinning is always allowed,
     by design, so nobody can trap themselves.

═══════════════════════════════════════════════════════════════════════════════
5 · NEVER INVENT A SCREEN IN PROSE
═══════════════════════════════════════════════════════════════════════════════

For every surface a journey or a flow touches, do ONE of two things and SAY WHICH:

  (a) POINT AT AN EXISTING FRAME by filename, and specify the flow in its terms.

  (b) EXTRAPOLATE — name the nearest existing frame, state what it is being adapted from and
      what changes, reuse its components and tokens VERBATIM, and write a short,
      self-contained CLAUDE DESIGN PROMPT so the frame can be drawn IN THE SAME PROJECT and
      inherit the same system. Collect those prompts in ONE APPENDIX at the end of
      EXPERIENCE.md.

EVERY specified surface names the frame it derives from. That is what makes "we reused the
design" checkable later instead of hoped for.

A new visual treatment described in prose and left there is the exact failure this section
exists to prevent.

WHEN YOU WRITE A CLAUDE DESIGN PROMPT, it must be self-contained (assume no other context),
it must name the frame it inherits from, and it must carry this warning verbatim, because a
session that hand-edits a frame hits it every time:

    A literal Ghost Handlebars expression must be written with zero-width entities. A bare
    {{ … }} is a Claude Design value hole and renders EMPTY.

═══════════════════════════════════════════════════════════════════════════════
6 · YOUR WORK LIST
═══════════════════════════════════════════════════════════════════════════════

START HERE — THE MAP ALREADY EXISTS. `reconcile-designs.md` carries a section headed

    ## SCREENS · App screens S1-S14, marketing M1-M9, `B Missing Surfaces`, `Editor Sidebar
       Kit` (frames only — no spec exists)

and inside it three tables that are the most directly useful thing in the project for this
step. Grep for the headings:

    #### Editor surfaces (surface · FR · screen · verdict)
    #### Journeys and flows (PRD preamble line 45 + the two owner-decision flows)
    #### Plan matrix (Appendix F.1) — what the screens say

THE SECOND ONE ALREADY MAPS EVERY JOURNEY AND FLOW TO ITS DRAWN SURFACE and gives a verdict on
each. It is your index into the export. It says, for example, that F2's edit-lock is drawn at
B5a/b/c with three named deviations, that F8's history is drawn at S8e but without pinning,
and that J1's surfaces are S2b plus S8a–d with the token step absent. Read all three tables
before you open a single frame.

Because `reconcile-designs.md` is a `record` and is never edited, ITS LINE NUMBERS ARE STABLE —
you can cite them and they will still be right.

YOUR WORK LIST PROPER is `reconcile-designs.md` §37.7, written 2026-08-27. It is a `record`
and is NEVER EDITED.
Read `reconcile-designs-decisions.md` §A4 beside it — that section re-verified §37.7 against
the export on 2026-08-31 and is the delta.

WHAT §A4 SAYS, IN SHORT: everything about missing editor surfaces, flows drawn on the wrong
mechanism, and the four journeys STILL STANDS.

  BUT ONE SENTENCE IN §A4 HAS GONE STALE, AND YOU MUST NOT TRUST IT. §A4 says "the S, B and M
  screens were not touched by the design pass — verified against git". That was TRUE of pass one,
  on 2026-08-31. FOUR MORE EXPORTS HAVE LANDED SINCE and they did touch those screens.
  VERIFY IT YOURSELF THE SAME WAY §A4 DID:

      git log --since=2026-08-31 --name-only --oneline -- \
        '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo'

  One concrete instance, so you know the shape of it: the 1 September re-export silently put back
  the library totals on M1, M4, M5, S12, S5 and B that had been made count-agnostic the day
  before. It stood for two days because BOTH controls that existed to catch it were matching raw
  HTML and missed a number split across two <span>s. It was repaired on 2026-09-02 and the
  detector now lives in one place. THE LESSON FOR YOU: on the S, M and B screens, read what the
  file says TODAY. A dated report about them is a hypothesis (standing rule 1). Two items are already fixed (the design totals
printed on the marketing screens, and P0's mark allowlist) and both are now GATED rather than
remembered. Four of the five P0 findings are resolved; the fifth is fixed too.

SURFACES REPORTED AS HAVING NO FRAME. VERIFY EACH AGAINST THE EXPORT BEFORE EXTRAPOLATING — a
keyword scan is inconclusive and several of these words appear on screens that are about
something else. REPORT ANY YOU FIND ALREADY DRAWN.
  the Paywall editor (FR-H6) · the backup gate consent checklist (BACKUP-GATE.md) · the
  drift report (FR-J16) · the credit toggle (FR-J15) · FR-D21's page-2 preview · FR-D6's
  auto-generated marker and the membership / Private canvases · FR-D7's project mode and
  "Clear dark overrides" · the New project sheet (FR-B2) · the downgrade / over-limit sheet
  (FR-L3) · FR-J10's first-deploy name confirm · FR-J8's partial-success state · FR-I1's
  empty-custom-template warning · FR-D22's preview subject · the main-feed marker and
  reassign · the Staff Access Token step AND ITS DECLINE PATH (FR-C1 — J1's core) ·
  history pinning

DRAWN, BUT ON THE WRONG MECHANISM. Keep the visual treatment, RE-SPECIFY THE SEMANTICS:
  B19's template-binding checklist uses `page-{slug}.hbs`, which FR-I1 forbids
  B12's snapshot fires on every deploy and counts against history; FR-J13 says first upload,
     exempt
  B16's routes card blames integration-key permissions; FR-I4 says the Staff token
  B13's exit sheet offers two of four remedies
  B22's redesign proposals are per-section swaps, not FR-C7's starter × pack combinations
  B11 draws a user Zoom; FR-D14 says none
  B24's grace banner says deployed themes stop rendering; FR-L3 says never touched
  S9 routes `/subscribe/` and `/`, which FR-I1 forbids
  B17's Theme Settings lacks `posts_per_page` and would write Ghost's logo (P8)
  B18's translation keys are flat; FR-Q6 says dotted
  S4d offers tier-level View-as; FR-D16 says three states — and B9 contradicts S4d

FLOW AND JOURNEY STATUS AS §37.7 FOUND IT:
  F4 and F5 are RIGHT. F1, F2, F3 and F6 are drawn on WRONG SEMANTICS. F7 and F8 have NO
  SURFACE. J2 and J3 HOLD. J1 LACKS THE TOKEN STEP. J4 HAS NO OVER-LIMIT FLOW.

═══════════════════════════════════════════════════════════════════════════════
7 · WHAT IS ALREADY RULED AND IS NOT YOURS TO RE-OPEN
═══════════════════════════════════════════════════════════════════════════════

Seventy-three owner rulings (R-1 … R-73), thirty-eight architecture decisions (AD-1 … AD-38)
and the approved decision set D1 … D39 are settled. FOUR APPROVED DECISIONS WERE REVERSED —
D3, D17, D26, and D27 in half — so if you find a document citing one of those, check §B of
`reconcile-designs-decisions.md` before you rely on it.

Five that touch this step directly:

  A GREYED CONTROL AND AN ABSENT CONTROL MEAN DIFFERENT THINGS, and the difference is
  load-bearing. Greyed means "this exists here, and is unavailable right now" — and it always
  shows the reason. Absent means "this never exists here". Use `P0-0 Greyed Control Pattern`
  as drawn.

  THE ACTIONS CONTROL WAS SPLIT on 2026-08-31. The old single value set (none / sign in /
  subscribe / both) is retired; it is now two independent switches. `Actions Split -
  Migration Record.md` in the export records exactly what moved.

  R-73 (2026-09-02): A FRAME CAPTION IS A DESCRIPTION, NOT A SPECIFICATION. Some captions
  still print retired vocabulary — `actions Both`, `padding`, `ground`. That is deliberate:
  a caption records how a frame was drawn on the day it was drawn. DO NOT "fix" them and do
  not treat them as a control table. The panels are the specification and they are current.

  EVERY EMPTY STATE IS DESIGNED, not omitted. Ask what each surface in a flow shows when it
  has nothing to show, and specify it.

  A LIBRARY COUNT IS NOT THE SAME AS A PRODUCT LIMIT, AND ONLY ONE OF THEM IS BANNED. Write
  "at most 10 stored versions on Pro and 3 on Free", "1 project · 1 site", "30 MB uploads" —
  these are PRODUCT LIMITS, they are the requirement, and a flow that hides them is wrong (F8's
  first rule is that the limit is STATED). What you must never write is a LIBRARY TOTAL — how
  many designs, categories or free designs exist. Those move monthly by FR-J14's own commitment,
  Appendix H forbids them in product copy, and every one of them in this project has gone stale.

  COUNTS ARE DERIVED, NEVER RESTATED (standing rule 4). Every count in this project has gone
  stale at least once. Do not write a library total, a category total or a free-design total
  into DESIGN.md or EXPERIENCE.md. Appendix H already forbids a design total in product copy.
  Where you need to express scale, word it so it cannot go stale ("every design", "the free
  set"). If you genuinely need a figure for your own reasoning, derive it:
      python3 tools/export-roster.py

═══════════════════════════════════════════════════════════════════════════════
8 · HOW TO HANDLE QUESTIONS
═══════════════════════════════════════════════════════════════════════════════

The owner is available, but he is not an engineer and he has asked more than once for LESS
EXPLANATION AND MORE INSTRUCTION.

  BEFORE YOU ASK ANYTHING, SEARCH THE PROJECT FOR THE ANSWER. Roughly a third of the
  questions raised in this project's design passes turned out to be ALREADY ANSWERED
  somewhere else — settled by a ruling made after the document you are reading was written.
  Grep `reconcile-designs-decisions.md`, the PRD and the spine first.

  BATCH YOUR QUESTIONS. Do not ask one at a time. Collect them and bring them together.

  WHEN YOU DO ASK: numbered options, plain language, EXACTLY ONE marked (RECOMMENDED), and
  say what each option costs.

  WHERE IT IS A ROUTINE JUDGEMENT CALL, MAKE IT and say so in one line. Where the decision is
  genuinely his, present it and WAIT — do not default it.

  FLAG, DO NOT GUESS (standing rule 6). If two approved decisions contradict, or an
  instruction cannot be followed without inventing a decision the owner never made, STOP AND
  ASK. This project has been damaged more than once by a confident guess that looked
  reasonable.

═══════════════════════════════════════════════════════════════════════════════
9 · THE GATE — AND THE TRAP THAT WILL CATCH YOU
═══════════════════════════════════════════════════════════════════════════════

    python3 tools/doc-audit.py --check      # must pass; exits non-zero on drift

It is installed as a PRE-COMMIT HOOK, so a red gate blocks the commit.

**THE TRAP.** The gate walks every `.md` `.html` `.sql` `.js` `.py` `.sh` file under
`_bmad-output/planning-artifacts/` and fails with UNCATALOGUED for any it does not recognise.
bmad-ux writes a whole new folder — `ux-designs/ux-Inflozo-<date>/` with `DESIGN.md`,
`EXPERIENCE.md`, `.decision-log.md`, `.working/`, `imports/`, possibly `mockups/`,
`wireframes/`, `review-*.md` and `reconcile-*.md`. EVERY ONE OF THOSE WILL TURN THE GATE RED
until it is catalogued.

  FIX: add ONE `GROUPS` entry in `tools/doc-audit.py` covering `ux-designs/`, plus explicit
  `DOCS` entries for `DESIGN.md` and `EXPERIENCE.md` so they get their own briefs. TWO THINGS
  ABOUT THAT FILE: `DOCS` is matched before `GROUPS` and both match on SUBSTRINGS, so give the
  `DOCS` entries their full relative path rather than the bare filename — a bare `DESIGN.md`
  would also claim any other file whose name ends that way. And `GROUPS` is FIRST MATCH WINS, so
  order matters; a narrower fragment goes above a broader one. Then:
      python3 tools/doc-audit.py --generate
      python3 tools/doc-audit.py --check

  A SECOND THING THAT LOOKS LIKE A BUG AND IS NOT: the gate's sub-tools REGENERATE ON
  FAILURE. The first run right after any change reports FAIL and fixes itself; the second
  passes. Run it twice before you believe it.

  A THIRD THING: THE GATE DOES NOT VERIFY PROPAGATION. It passed for weeks while FR-G7 still
  said 31 modules. A green gate is not evidence that a ruling reached the documents it names.

THE REVIEWER GATE. bmad-ux offers an opt-in reviewer gate at Finalize, and it is expensive
(parallel subagents). RECOMMENDED: run the rubric walker plus ONE accessibility lens, and skip the
rest. This work is consumer-facing and the accessibility floor is a real obligation here; the other
lenses would mostly re-check things the PRD already fixes.

WHERE A NEW RULING GOES. If the owner rules on something during this step, it does not live in the
chat — it goes into `reconcile-designs-decisions.md` as a NEW numbered section (§A10) with the next
free R-number after R-73, and it names the documents it moves. That file is the project's memory of
what was decided and when. A decision recorded only in a UX document will be missed.

WHEN YOU FINISH, THE STEP-5 PROMPT IN `build-sequence.md` IS ITSELF STALE. Replace that section's
prompt block with a completion record — what was produced, where it lives, and what step 6 now
reads — the same shape steps 1 to 4 already use. `BUILD-BOARD.html` regenerates from
`tools/build-board.py`; edit the generator, never the HTML.

OTHER PROOFS THAT MUST STILL PASS WHEN YOU FINISH:
    python3 tools/verify-design-pass.py
    cd tools/stress && node test-ad36.js && node test-renderer-agreement.js

═══════════════════════════════════════════════════════════════════════════════
10 · GIT
═══════════════════════════════════════════════════════════════════════════════

Work directly on `main`. There are no feature branches and no pull-request review, so the
gate is the only thing between a mistake and the live branch.

Commit and push freely at sensible checkpoints, ALWAYS running the gate first and NEVER
pushing a red gate. NEVER, without the owner asking in that moment: force-push, `reset
--hard`, rebase, amend anything already pushed, delete a branch or tag, rewrite history, or
delete a file you did not create.

═══════════════════════════════════════════════════════════════════════════════
11 · DONE WHEN
═══════════════════════════════════════════════════════════════════════════════

  - `DESIGN.md` and `EXPERIENCE.md` exist, both `status: final`.
  - Every one of the four journeys and the eight flows is specified.
  - EVERY surface named in them either points at an existing frame by filename, or names the
    frame it extrapolates from AND has a Claude Design prompt in the appendix.
  - Every surface from §6's frameless list has been VERIFIED against the export, and any
    found already drawn is reported.
  - Every "drawn on the wrong mechanism" item from §6 has its semantics re-specified with the
    visual treatment kept.
  - Nothing in either document contradicts `reconcile-designs-decisions.md`.
  - No count is restated that could be derived.
  - `python3 tools/doc-audit.py --check` passes, run twice.
  - `build-sequence.md`, `HANDOVER.md` and the build board say step 5 is done and step 6 is
    next. `BUILD-BOARD.html` is GENERATED — edit `tools/build-board.py`, never the HTML.
  - You have written a short report for the owner: what you specified, which surfaces you had
    to extrapolate and why, how many Claude Design prompts he now needs to run, what you
    found already drawn that §37.7 said was missing, and anything you had to ask him about.
```

# Step 6 — Epics and stories

**Produces:** the story breakdown.
**Needs from the owner:** nothing.
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
| **① Now — step 5 needs almost nothing from you** | `/bmad-ux` authors the four journeys and eight flows from the PRD and prompt 2's screens. It comes to you only where a flow needs a decision the PRD never made |
| **Launch checklist** | **Enable Dodo's *Upcoming Renewal Reminder*** — Settings → Communication → Customer Emails, **off by default**. Note this is now a *backstop*, not the mechanism: by owner decision (register 37b) **Inflozo sends its own** reminder at **30 days before an annual renewal and 7 before a monthly one**, because the exposure was always the *timing* — ~2 days is very likely short of the statutory window for an annual term, and Appendix F assumes a 60% yearly mix. The two do not collide: ours is the heads-up, Dodo's is the final nudge |
| Before deploy paths are verified end to end | **T2** — Ghost(Pro) Publisher, $29/mo |
| ⛔ **Before the Live project takes real customer data** | **Put Live on the Supabase Pro plan** *(register 42)*. The **Free plan has NO automatic backups at all** — that gap, not the point-in-time question, is the real cliff, and AD-26 provisions Live as a **fresh project** at go-live, so this is a step someone must perform rather than inherit. The gate is: Pro active, daily backups visible in the dashboard, **and one real restore performed** using `RESTORE-RUNBOOK.md` — a backup nobody has restored from is a hypothesis, which is exactly how the first drill found two defects |
| Deliberately NOT bought yet | **Point-in-time recovery**, at $100/month per 7 days of retention — roughly eight Pro subscribers of margin against an 11–16 subscriber break-even, buying 2-minute recovery over 24-hour. It is also worth less here than to a typical product: **a database rewind cannot rewind the customer's Ghost site**, so the most consequential state is out of its reach. **Revisit trigger:** ~50 paying customers, or the first time any customer loses work for any reason. Until then a scheduled `pg_dump` gives most of the value for a few dollars |
| ⛔ **Before public launch** | **The Ghost(Pro) gate** — acquire a Ghost(Pro) **Starter** site, capture the real `GET /admin/config/` `hostSettings.limits` payload, and verify FR-C2's Preview-only detection against that recording. Until it clears, that path is a **KNOWN UNTESTED PATH** and no marketing may target Ghost(Pro) users. You asked to be reminded of this one |
