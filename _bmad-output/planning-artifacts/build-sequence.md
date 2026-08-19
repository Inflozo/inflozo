---
title: Inflozo — Build Sequence & Handoff Prompts
status: operational note (not normative; `prd.md` governs on any conflict)
created: 2026-08-19
covers: the six steps from finished PRD to first story, what each needs from the owner, and a self-contained prompt for each
---

# Build Sequence

Written 2026-08-19, immediately after `prd.md` reached **v4.0 / final**. This file exists so no step has to be reconstructed from conversation, and so each one can be started cold.

## Where things stand

| | |
|---|---|
| `prd.md` v4.0 | ✅ **final** — 130 FRs, 34 categories, 484 designs, 70 `[Free]`, zero open questions |
| Normative companions | ✅ all present with `status` frontmatter, precedence order stated in the PRD preamble |
| Design prompt 1 | ✅ run — 27 mockups in `design/mockups/` |
| Design prompt 2 | 🔵 **owner WIP** — responsive archetypes, ~25 missing surfaces, the paywall editor |
| Design prompt 3 | 🔵 **owner WIP** — 34 category sessions producing 484 designs *and* their specifications |
| Architecture | ⬜ not started — **step 1** |
| E0 spikes | ⬜ not started — **step 2** |
| Journeys & flows | ⬜ not started — **step 5** |
| Stories | ⬜ not started — **step 6** |

## The BMAD skill for each step

Every step below runs through a BMAD skill. Paste the prompt **including its leading `/command`** — the slash command invokes the skill, and the text under it is the context that skill needs.

| Step | BMAD skill | BMAD role |
|---|---|---|
| 1 — Architecture | `/bmad-architecture` | Architect (Winston) |
| 2 — The two E0 spikes | `/bmad-build` | Dev (Amelia) |
| 3 — Design prompts 2 & 3 | *(owner, in Claude Design)* | — |
| 4 — Reconcile designs vs PRD | `/bmad-review` | — |
| 5 — Journeys & flows | `/bmad-ux` | UX (Sally) |
| 6 — Epics & stories | `/bmad-create-epics-and-stories` | Scrum Master |
| 6b — Readiness gate | `/bmad-sprint-planning` | Scrum Master |

The PM stage is already complete — `prd.md` v4.0 is its output. **Two deprecations to avoid:** `bmad-create-architecture` forwards to `bmad-architecture`, and `bmad-create-story` / `bmad-dev-story` are superseded by `bmad-build`. Use the current names.

Once stories exist, the development loop is `/bmad-build` per story, with `/bmad-code-review` and the `/bmad-testarch-*` skills on the QA side — but that is beyond this document, which ends at the first story.

## Standing rules — these apply to every step below

These were each learned expensively. They are not style preferences.

1. **A claim about an external platform is a hypothesis until read in that platform's source or executed against it.** Four assertions about Ghost entered this PRD as normative text and were later verified **false** — each had deleted or damaged something real, and each carried a confident-sounding reason that stopped anyone re-examining it. New external claims arrive with a citation or a fixture, or they do not arrive.
2. **Propagate, never localise.** Three independent reviewers named "fixed it in its home requirement and stopped" as the single root cause of ~25 defects. A change is not done until every place that depends on it has been visited and either changed or explicitly ticked.
3. **Counts are derived, not restated.** Every count in this project has gone stale at least once. Prefer "as many gates as there are categories" to a literal number whose source lives elsewhere.
4. **Flag, do not guess.** If two approved decisions contradict, or an instruction cannot be followed without inventing a decision the owner never made, **stop and ask**. Guessing has hurt this project before.
5. **Precedence, highest first** (stated in full in the PRD preamble): the two `verify-mechanical-*.md` files → the research companions (on any Ghost fact) → the normative companions → `prd.md` → `addendum.md` → `spike-compiler/`. **Design artifacts are non-normative and never override the PRD.**
6. **Log every meaningful step to the memlog:**
   ```bash
   cd /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17
   uv run /home/ghost/Dev/Inflozo/_bmad/scripts/memlog.py append --workspace . --type change --text "…"
   ```

## The critical path, and why it is ordered this way

Steps 1 and 2 run **in parallel with the owner's design work (step 3)**, and that parallelism is the point. The FR-D4 mark-emission spike is the one result that could still invalidate the design investment: if text-plus-mark-ranges does not work end to end, FR-D4's model changes and what a design can express with inline text changes with it. **That answer is wanted while prompt 3 is on category three, not category thirty.**

```
Step 1 /bmad-architecture ──► Step 2 /bmad-build (2 spikes) ──┐
                                                               ├──► Step 4 /bmad-review
Step 3 Design prompts 2 & 3  (owner, Claude Design) ───────────┘             │
                                                                             ▼
                                              Step 6 /bmad-create-epics-and-stories ◄── Step 5 /bmad-ux
```

---

# Step 1 — Architecture

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

**Produces:** proof that the rich-text model works end to end, and executed results for all 21 verify-at-build items.
**Needs from the owner:** ⚠️ **two DigitalOcean droplets** — see below.
**Unblocks:** the shell block, every category gate, and (in risk terms) the design investment in step 3.

### ⚠️ What this step needs from you, and it is the one real ask in this document

**Provision T1 and T3 before this step starts:**

| Target | What | Why it cannot be skipped |
|---|---|---|
| **T1** | self-hosted Ghost **6.x** on a droplet | Every category gate needs a real-Ghost comparison from the *first* category, not at hardening |
| **T3** | self-hosted Ghost **5.x** on a droplet | The PRD advertises 5.x support (NFR-7) and gscan's rule sets genuinely differ between the v5 and v6 specs. §4 marks T3 **not droppable** |

≈$9/month each. Inflozo needs an Admin API key and a Content API key from each, plus the site Owner's Staff Access Token if you want the snapshot and drift paths exercised (FR-C1 makes that token optional by design — the spike should test **both** the with-token and the declined-token paths).

T2 (Ghost(Pro) Publisher, $29/mo) is needed before the deploy paths are verified end to end. **T4 (Ghost(Pro) Starter) is deferred until after MVP by your decision** — but its gate is ⛔ launch-blocking, and you asked to be reminded before launch.

### Prompt — spike (a), the mark-emission spike

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

### Prompt — spike (b), the platform-verification spike

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

# Step 3 — Design prompts 2 and 3 *(owner's own work — in progress)*

**Produces:** the responsive archetype system, ~25 missing surfaces, the paywall editor (prompt 2); then 484 designs *and* their specifications (prompt 3, run 34 times).
**Needs from the owner:** the work itself.
**Unblocks:** steps 4 and 5, and every library build story.

### What the outputs must contain, so step 4 can check them

Prompt 3's sessions are **design and specification in one pass** — §4 makes that binding. Each design must land carrying:

**Descriptor · structural descriptor tuple · archetype · responsive rule in words · content fields with types and optionality · its own control list in sidebar order with closed value sets · data binding with 0/1/many behaviour · empty states · behaviour module and whether it is edit-safe, plus its no-JS degradation · accessibility notes**

Two of those are newly load-bearing and easy to omit:

- The **structural descriptor tuple** — archetype · primary axis · item-count class · media placement · emphasis mechanism. FR-G5's uniqueness assertion runs over the *tuple*, not the English line, and it must stay unique within its category **after** the per-design control lists are written, since controls no longer distinguish designs.
- The **no-JS degradation statement** for any design declaring one of FR-G7's 31 behaviour modules. It is an acceptance criterion, not a note.

Specifications land in `sections-inventory.md`, which already carries the schema and the two-layer (category union + per-design) structure they slot into.

---

# Step 4 — Reconcile the designs against the PRD

**Produces:** a reconciliation report — contradictions, and surfaces the PRD needs that no design covers.
**Needs from the owner:** prompt 2 and 3 outputs on disk.
**Unblocks:** step 5.

Precedent: `reconcile-mockups.md` did exactly this for prompt 1 and found ~31 disagreements. Expect fewer — prompt 2 was written to close the known holes — so this is confirm-and-catch-stragglers, not discover-a-crater.

### Prompt

```
/bmad-review

Reconcile the Inflozo design output against the PRD.
Run the verification-gap and adversarial lenses together — this pass is looking for what is
MISSING and what CONTRADICTS, not for prose quality.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
Designs: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/design/
Precedent for the format and the bar: reconcile-mockups.md in the same folder, which did this
for prompt 1 and found ~31 disagreements.

DESIGN ARTIFACTS ARE NON-NORMATIVE. Where a design and the PRD disagree, the PRD wins and the
design moves — unless the design reveals that the PRD specified something unbuildable or
incoherent, in which case flag it as a PRD defect and do not silently pick a side.

Three questions, kept separate in the report:
  1. CONTRADICTIONS — where a design shows something the PRD forbids, or contradicts a control
     vocabulary, a binding rule, a plan gate or a count.
  2. GAPS — surfaces the PRD requires that no design covers. Check against: the section
     inventory's 34 categories, section 8's epics, Appendix F.1's plan matrix, and the six
     flows and four journeys named in the PRD preamble.
  3. SPEC COMPLETENESS — every design carries all ten fields of the per-design specification
     schema in sections-inventory.md. Two are newly load-bearing and easy to omit: the
     structural descriptor TUPLE (which FR-G5's uniqueness assertion runs over, and which must
     stay unique within its category after per-design control lists are written) and the no-JS
     degradation statement for any design declaring an FR-G7 behaviour module.

Verify counts rather than trusting them: 34 categories, 484 designs, per-category counts summing
to 484, 70 [Free] on variant lines only.

Write the report to the prds/prd-Inflozo-2026-08-17/ folder and log to the memlog.
```

---

# Step 5 — Journeys and flows

**Produces:** the four journeys and six flows the PRD mandates and does not itself author.
**Needs from the owner:** nothing beyond step 4's output.
**Unblocks:** step 6.

The PRD preamble delegates these explicitly. Keep this pass separate from step 4 — one verifies, this one authors, and combining them produces a document that half-checks and half-invents.

### Prompt

```
/bmad-ux

Create the UX specifications for Inflozo: the mandated journeys and flows.

PRD: /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md
The preamble delegates this work explicitly and names the mandated floor. Personas are in
section 3 and each carries its GHOST CREDENTIAL REACH, which is what decides how a journey
actually plays out — the multi-site operator frequently is NOT the site Owner and cannot mint a
Staff Access Token at all, which is precisely the case FR-C1's graceful no-token path serves.

Four journeys:
  connect → first deploy · blank-canvas build · Free-plan ship · downgrade recovery

Six flows, each specified in the PRD as a designed surface rather than a warning toast:
  FR-J13 pre-deploy snapshot gate · FR-D18's three-party edit-lock choreography ·
  FR-I4's guided routes-upload card · FR-J14's library-update confirm ·
  FR-C2's Preview-only explanation with its clearing conditions ·
  FR-I6's post-deploy template-binding checklist

Two things the connect → first deploy journey must carry, because they are recent and easy to
miss: the Staff Access Token is DEFERRED to first deploy and may be DECLINED PERMANENTLY, so the
journey has two endings and the declined one must still ship a site; and G1's under-ten-minutes
target excludes the token step, which is what makes it reachable.

Existing design surfaces are in design/mockups/ (27 from prompt 1) plus prompt 2's output.
Design artifacts are non-normative; the PRD wins on any conflict.

Appendix H is the voice canon and governs every string you write.
```

---

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
Architecture: (path from step 1)

Section 8 ALREADY fixes the epic breakdown, the sequence, the exit criteria and every FR's
owning epic — 130 FRs, each owned by exactly one epic apart from the splits section 8 documents explicitly (FR-P1 per email, FR-Q6 format-vs-surface, and FR-G1/G4/G5/G6 shared between the shell block and the gated pipeline). Expand
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
| **Before step 2** | Provision **T1** (Ghost 6.x droplet) and **T3** (Ghost 5.x droplet), ≈$9/mo each, with API keys |
| Before deploy paths are verified end to end | **T2** — Ghost(Pro) Publisher, $29/mo |
| During step 1 | Repo shape · Supabase org structure · accept the measured compile-function budget · owning epic per §7.6 item |
| Step 3 | Prompt 2 and prompt 3 outputs, with complete per-design specifications |
| ⛔ **Before public launch** | **The Ghost(Pro) gate** — acquire a Ghost(Pro) **Starter** site, capture the real `GET /admin/config/` `hostSettings.limits` payload, and verify FR-C2's Preview-only detection against that recording. Until it clears, that path is a **KNOWN UNTESTED PATH** and no marketing may target Ghost(Pro) users. You asked to be reminded of this one |
