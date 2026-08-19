# Continue the Inflozo PRD v4.0 encode

You are continuing a large, half-finished PRD encode. Everything you need is on disk — nothing important lives only in the previous conversation.

## Where

Workspace: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/`
Target: `prd.md` (currently ~1,098 lines) and its companions, chiefly `sections-inventory.md`.
Backups: `.v3.0-backup/` (clean pre-encode state) and `.v2.3-backup/` (older). Do not overwrite either.

## Read these first, in this order

1. **`encode-propagation-map.md`** (1,635 lines) — **your instruction set.** 53 decision blocks, each with the decision as *ruled*, its home location, every propagation target, the counts it moves, the conflicts it creates, and what must be authored rather than edited. Read its top matter (`Why this file exists`, `How to read a block`, `Encode order (binding)`, `Standing rules`) before anything else, then the blocks you are working on.
2. **`encode-report-batch1.md`** — what the first batch changed and why.
3. **`.memlog.md`** entries **#222 → end** — the owner's rulings in their own words. ~60 decisions. Where the map and the memlog disagree, the memlog is the owner and wins.
4. **`verify-mechanical-ghost-claims.md`** and **`verify-mechanical-theme-and-math.md`** — these **override** `validation-report.md` wherever they disagree. They caught six wrong "fixes" that would have damaged the document.

## Already encoded — do not redo

- **§4** — design-and-specify-before-build; the four-step build order; the category owner gate definition; T3 made permanent; T4 marked a known untested path with its pre-launch gate; NFR-6(c3) moved into the library epics with a stated cadence; DoD rewritten; the no-descope clause rewritten around the owner's governing constraint.
- **§8** — the wave model is gone entirely. E0 (mark-emission spike + platform-verification spike) added; E9/E10/E11 rebuilt as Shell Block / Gated Library Pipeline / Starters; E15 narrowed to final sign-off.
- **Appendix F** — rebuilt: F.3a build cost, F.3b run cost, CI costed, two break-evens, the verified arithmetic. G7 and the §7.6 rows propagated.
- **Seven new FRs** — FR-D19 (design navigation + carry/park/default), FR-D20 (preview toggle), FR-D21 (paginated preview), FR-Q7 (card design module), FR-Q8 (translation validation), FR-Q9 (treatment fallback), FR-J17 (emitted-theme quality gate).
- **Per-design controls** propagated to FR-F3, FR-F7, FR-G3, FR-D13, FR-D17, FR-D9, the E5 play-loop gate, §7.3 and §7.5; `sections-inventory.md` preamble restructured around the two-level model with a per-design specification schema.
- **§1.2** — the promise reworded with four enumerated carve-outs; ambition tagged as ambition.
- **§7.3 / §7.4** — canvas geometry and the chrome partition; the five missing `data-*` constructs named as E4 exit criteria; the vocabulary relabelled "designed with a proven core"; normative `image_sizes`; `card_assets: {exclude}`; stylesheet order.
- **The verified mechanical corrections** — FR-J2, FR-H2, FR-J5, FR-Q2, FR-I1, FR-J6, FR-I2, NFR-5, FR-H1, FR-D16, FR-J1's escaping, §7.4's conventions.
- **FR-I4** rewritten for automated routes upload, and **P8** reconciled with it.

## Still to encode

Map blocks: **L6** (post content as a section on posts *and* pages) · **L10** (31 vanilla JS modules, the behaviour-module contract, the pinned browser baseline) · **L12** (the six contested variants) · **L13** (design = variation = design, and the sidebar rename) · **L16** (Empty Tag State — **count-moving**) · **L17** (the theme always reads all three dark built-ins with fallback logic) · **L18** (the fixture set: style-guide page, comments fixture, fixed preview subject) · **L19** (remaining Ghost-injected-surface propagation) · **L22** (custom-template naming and collision scheme) · **L24** (companion precedence order) · **L25** (Staff Access Token graceful path, deferred credential steps, the Ghost(Pro) gate) · plus **M-1 … M-9** and **S-1 … S-19**.

Then: the **post-encode verification checklist** and the **authored-not-edited list**, both in the map's tail.

## Standing rules (these are why the document failed twice before)

1. **Propagate, never localise.** A decision is not done until every target in its map block has been visited and either changed or explicitly ticked. Two prior rounds wrote each fix into its home requirement and stopped; three independent reviewers named that as the single root cause of ~25 defects.
2. **Encode LARGE blocks before SMALL ones.** A small fix applied before a structural change gets overwritten by it.
3. **FR ids are append-only.** 126 FRs are currently contiguous, duplicate-free, and each owned by exactly one epic. Never renumber. New FRs append within their letter block, and every epic's `*Owns …*` clause must still account for every FR afterwards.
4. **A reviewer claim about an external platform is a hypothesis until read in source.** Two such claims failed verification in this project and each deleted or damaged something real.
5. **Match the document's voice** — dense, normative, declarative, with bold FR ids and `>` callouts. Read the surrounding prose before writing.
6. **Flag, do not guess.** If two approved decisions contradict, or a map instruction cannot be satisfied without inventing a decision the owner never made, **stop and ask**. Guessing has hurt this document before. Encoding `FR-I4` broke Product Principle **P8** — that is the shape of thing to expect and to surface.
7. **Counts are derived, not restated.** Every count in this document has gone stale at least once. Prefer "as many gates as there are categories" over a literal number where the number lives elsewhere.

## Verify after every batch, not at the end

```bash
cd /home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17
```
Check: FR count and contiguity per letter block · zero dangling references · every FR owned by exactly one epic (expand `FR-A2–A6` ranges) · category count and per-category design counts · `[Free]` tags on variant lines only (must be **70**) · the map's stale-token grep list · every referenced companion exists with `status` frontmatter.

Log every batch to the memlog:
```bash
uv run /home/ghost/Dev/Inflozo/_bmad/scripts/memlog.py append --workspace . --type change --text "…"
```

## Open items needing the owner, not you

- **Does the shell block carry its own owner gate(s)?** Encoded as an ungated prerequisite; the owner leans toward gating it. One sentence either way.
- **Confirm the P8 rewrite** — the principle moved from "never modifies settings" to "content is read-only, presentation is what Inflozo is for", because automated routes upload contradicted the old wording.
- **`FR-J17` and `FR-Q7`** exist now; if any earlier text still implies gscan alone establishes theme quality, it is stale.

## Governing constraint (owner, verbatim)

> "I am okay if it takes time. But it needs to be perfect and work flawlessly without bugs."

Quality outranks schedule everywhere. Nothing in this document may be written as a prompt to reduce scope — that option was considered and declined.

## Finish with

The map's verification checklist in full, then a structure-then-prose polish pass (structural before prose, so prose work is not spent on text that later changes), then set `prd.md` frontmatter to `version: "4.0"`, `status: final`, `updated: <today>`.
