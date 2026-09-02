# Inflozo — instructions for any Claude session in this repo

A visual site builder for **Ghost CMS**. Users drag ready-made sections onto a canvas; the product
compiles the design into a Ghost theme and deploys it to the customer's own Ghost site. The owner is
**Umang**, a solo founder who is **not an engineer**.

## Read these first, in this order

| | |
|---|---|
| `_bmad-output/planning-artifacts/INDEX.md` | Every document with a one-line brief. **Start here.** |
| `_bmad-output/planning-artifacts/HANDOVER.md` | Where the project stands and what is next. |
| `_bmad-output/planning-artifacts/build-sequence.md` | The steps from PRD to first story. Governs on any conflict with the board. |
| `.../architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` | The invariants everything is built from. |

**Four document statuses in `INDEX.md`, and they bind:** **live** (edit these) · **tool** (runnable) ·
**record** (dated — *never edit*) · **retired** (provenance only).

## Any UI or UX task starts in the design export — the whole of it

`_bmad-output/planning-artifacts/design/claude-design-export/Inflozo/` — **the whole directory, every
time.** It is everything Claude Design produced and it is far more than the screen frames:

| In the directory | What it is |
|---|---|
| `Calibration Set.dc.html` | the tokens, type scale, spacing and colour roles — **the design system** |
| `Editor Sidebar Kit.dc.html` | every sidebar control, panel, badge and state |
| `R Responsive System.dc.html` | the responsive archetypes and their collapse rules |
| `S1 Sign In` … `S14 Editor Cards` | the app |
| `M1 Home` … `M9 404` | the marketing site |
| `B Missing Surfaces.dc.html` | prompt 2's additional surfaces, B1–B25 |
| `C Post Body.dc.html` · `P0-1` … `P0-6` | the post body and the editor primitives |
| `<ID>-<n> <Name>.dc.html` | every design in the library, drawn |
| `<ID>-0 Category Proof.dc.html` | per category: its tokenisation proof, stress frame and roster |
| `<ID> <Name> - Spec.md` | per category: the ten spec fields per design, plus `P0 Editor Primitives - Spec.md` |
| `*-kit.js` and `_build/*.js` | **the shared render kits — real code**, one per category that needed one |
| `interactions.js` · `support.js` | the mock-interaction layer and the Claude Design runtime |
| `New Session Prompts/` · `uploads/` | the prompt each category was designed from, and the original brief |
| `screenshots/` | check images captured during the design work |

**Two things in there that are easy to miss and expensive to miss.** The `-0 Category Proof` frames
carry each category's own tokenisation proof and roster — they answer "what is this category allowed to
look like" better than the spec prose does. And the kits are **executable**: they render each block from
a token object, which is why light, dark and every pack are the same code with a different `t`.

**Editing a frame by hand? Read this first.** The kits carry a load-bearing warning: a literal Ghost
Handlebars expression in emitted markup must be written with zero-width entities (`{&#8203;{`), because
a bare `{{ … }}` is a Claude Design value hole and renders **empty**.

**"Design artifacts are non-normative" is scoped to BEHAVIOUR** (build-sequence standing rule 6). The
PRD decides what a surface *does*; the export decides what it is *built from*. A surface with no frame
is **extrapolated from the nearest one that has** — same components, same tokens — and drawn in the
same Claude Design project. Never invent a second interface vocabulary beside this one.
**This is now a ruling, not a note — R-74 (owner, 2026-09-02), binding until the project
finishes.** Its pair, **R-75**, gates the build: the owner sees Inflozo's own UI as a static,
clickable prototype on his machine (step 5b in `build-sequence.md`) before anything is built
dynamically. Both live in `reconcile-designs-decisions.md` §A10.

## The seven standing rules

Each was learned expensively. They are not style preferences.

> **On numbering.** `build-sequence.md` carries its own seven-item list in a different order, and
> **every "standing rule N" citation in the repo and in `tools/` uses that list's numbering** — there,
> "standing rule 3" is *counts are derived* and "standing rule 4" is *a finding must reach an owning
> document*. When you cite a rule, cite its words, not its number.

1. **A claim about an external platform is a hypothesis until executed or read in its source.** Five
   confident claims about Ghost entered this project as normative text and were later proven false.
   **Cite or execute. Never assert.** Two real Ghost servers exist for this: **T1**
   `ghost6.inflozo.com` (6.58.0) and **T3** `ghost5.inflozo.com` (5.130.6), credentials in
   `tools/probe/.env` (gitignored), pattern `tools/probe/run-verify-all.py`.
2. **A result whose control did not pass is not a result.** Three probes in one session returned a
   convincing "held" that was really a broken test.
3. **Propagate, never localise.** A finding is not closed until it reaches an invariant, a register
   row, or a comment beside the code it governs.
4. **Counts are derived, never restated.** Every count in this project has gone stale at least once.
   Prefer "as many gates as there are categories" to a literal number whose source lives elsewhere.
5. **Never edit a document marked `record`.** Correcting its figures falsifies the history the
   project relies on to know which claims were tested when.
6. **Flag, do not guess.** If two approved decisions contradict, or an instruction cannot be followed
   without inventing a decision the owner never made, **stop and ask**.
7. **A propagation list cannot audit itself.** End every schema or vocabulary change by grepping the
   repo for the old name. The list of places to update is exactly the thing that misses one.

## The gate

```bash
python3 tools/doc-audit.py --check     # must pass; exits non-zero on drift
```

It is installed as a **pre-commit hook**, so a red gate blocks the commit. Two things it does *not*
do, and both have bitten: it verifies the catalogue and the generated artifacts but **does not verify
propagation** — it passed while FR-G7 still said 31 modules. And its sub-tools **regenerate on
failure**, so a first failure right after a commit is normal (the hook retries once and stages them).

**Hardcoded counts in tooling have broken twice** — `category-prompts.py`'s `assert len(names) == 31`
and the build board's "36 invariants". Derive, never assert membership or totals.

**One more thing the gate cannot see:** a ruling in
`prds/.../reconcile-designs-decisions.md` that has not reached the documents it names. That file's own
propagation ledger is the record of what has landed, and it is a human tick, not a check.

## Git workflow

**Work directly on `main`. There are no feature branches and no pull-request review**, so the gate is
the only thing between a mistake and the live branch.

Claude may **commit and push freely** at sensible checkpoints, always running the gate first and never
pushing a red gate. Claude must **never**, without the owner asking in that moment: force-push,
`reset --hard`, rebase, amend anything already pushed, delete a branch or tag, rewrite history, or
delete files it did not create. Those rules are also encoded in `.claude/settings.json`, but a
deny-list over shell strings is leaky by construction — treat the rule as the real control and the
config as a backstop.

## How the owner wants to work

**Numbered decisions with one option marked (RECOMMENDED).** Plain language — no jargon that is not
explained in the same sentence. Short. He has asked more than once for **less explanation and more
instruction**: give the steps and the copy-ready text, and keep the reasoning brief unless he asks.

Where a decision is genuinely his, present it and **wait** — do not default it. Where it is a routine
judgement call, make it and say so in one line.

## Never write a count down — derive it

Every count in this project has gone stale at least once, and hardcoded counts in tooling have broken
twice (`category-prompts.py`'s `assert len(names) == 31`, and the build board's "36 invariants").
There is a command for each:

```bash
python3 tools/inventory-gen.py --check   # categories · designs · [Free], from the design export
python3 tools/derive-module-reach.py     # the behaviour registry, and which designs declare what
python3 tools/export-roster.py           # the library as JSON, straight from the export
python3 tools/verify-design-pass.py      # one check per ruling, run against the export
```

Where a document needs to express scale, word it so it cannot go stale — "every design", "two per
category" — or derive it at generation time.

## Verify the ground before trusting it

```bash
python3 tools/doc-audit.py --check                       # documentation gate
python3 tools/verify-design-pass.py                      # the rulings are in the export
cd tools/stress && node test-ad36.js && node test-renderer-agreement.js
```

The database proof is `architecture-.../RLS-TEST.sql` — run it against a PostgreSQL 17 container with
`PRELUDE.sql` then `SCHEMA.sql` first. It is a **gate**: it aborts on failure rather than printing one.
