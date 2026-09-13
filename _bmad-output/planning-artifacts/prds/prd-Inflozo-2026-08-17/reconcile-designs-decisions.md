---
title: Inflozo — Ghost Build Room rulings on the design reconciliation
status: live (§A2–§A3's R-30…R-38 — the normative half landed 2026-08-31, §A3's ledger is the evidence; the spec half landed in the design patch passes and is verified (§A5–§A9); §A10's two standing rulings bind every remaining step; §A11's R-76 and R-79 have landed in `prd.md`; §A12 records the six decisions of 2026-09-03 and their targets; §A13 records the owner's walk of 2026-09-04 and R-80 as amended — UI findings come from his test of each deployed story and are fixed there; §A14 the development-loop rulings R-81…R-85 of the same day; §A15 verifies the Appendix A export of 2026-09-04 frame by frame and names prompt A9)
created: 2026-08-27
updated: 2026-09-04 (§A5–§A10 as before; §A11 adds step 5's four rulings R-76…R-79, §37.7 re-verified against the current export, and the third failure of the library-total control; §A12 adds the six decisions from the step-5b/5c review, with targets; 2026-09-04: §A13 adds the walk and R-80, amended the same day; §A14 adds R-81…R-85 — commit after every phase, real-infra review, plain-English questions, the story board, one-session category stories; §A15 adds the Appendix A export verification, the A9 list and the fourth miss of the library-total control)
covers: step 4b of `build-sequence.md` — the owner's rulings on everything `reconcile-designs.md` could not settle by reading, the four approved decisions those rulings supersede, the Ghost facts executed during the session, and the probe families that remain
---

# Ghost Build Room — Rulings

**Session:** 2026-08-27, step 4b of `build-sequence.md`. Room: Ravi (Ghost) · Winston (architecture) ·
Amelia (build) · Murat (test) · Sally (editor UX) · Dana (ship), **owner in the room and ruling**.

**Input:** `reconcile-designs.md` — 1,086 findings across all 34 categories, P0 and the S/M screens
(spec-incomplete 393 · stale-design 268 · arch-gap 189 · needs-execution 109 · ghost-infeasible 66 ·
prd-defect 61), 41 probe families, a 1,078-row owner-flag register, and a PRD-amendments roll-up.
Machine-readable findings: `reconcile-designs.findings.json`.

**How to read this file.** Every ruling is numbered, states what was decided in plain language, and
names the documents that must move (standing rule 2 — propagate, never localise). A ruling is not
done until every target below it has been visited and either changed or explicitly ticked
(standing rule 4 / AD-36b). `doc-audit.py --check` gates the file's existence, not its propagation —
that is a human tick.

**Precedence unchanged:** the two `verify-mechanical-*.md` files → research companions (on any Ghost
fact) → normative companions → `prd.md` → `addendum.md`. Designs remain non-normative. Where a
ruling below contradicts an approved decision D1–D39, §B records the supersede explicitly.

---

## Propagation ledger — what has already landed

Standing rule 4: a ruling is not done until it reaches an owning document. **Tiers 1 and 2 landed on
2026-08-27, the same day as the session; Tier 3 — the inventory merge — completed on 2026-08-31.**

> **STATE OF THIS LEDGER, 2026-08-31.** The ⬜ marks in the right-hand column below were written on
> 2026-08-27, when the category specs had not been touched. **They are superseded.** The design patch
> pass ran on 2026-08-31 and applied the rulings to the specs themselves; what actually landed there
> is no longer a tick-list in prose but a **runnable check** — `python3 tools/verify-design-pass.py`,
> one check per ruling, run against the export, with every structural check passing and six prose
> scans deliberately flagged `LOOK` for a human. Read that command's output, not this column.
> The left-hand (normative-documents) column is still accurate.
>
> **§A2 and §A3 — rulings R-30 … R-38, taken on 2026-08-31 — reached the normative documents the
> same day; §A3's ledger carries the tick per ruling and names the document.** What is still open is
> their **spec half**: design work for a Claude Design patch prompt, with no runnable check behind it
> yet (`verify-design-pass.py` covers R-1 … R-24 and §37.7, not R-30 … R-38 — a human tick). It is
> owed before **E4** and **E9** open and blocks neither step 5 nor step 6 (F-085, corrected 2026-09-03:
> this block, the front matter and `INDEX.md`'s brief had all said "not propagated yet").

| Landed | Document | What went in |
|---|---|---|
| ✅ | `architecture/.../MEASUREMENTS.md` **§29** | The four executions, with their commands and outputs: the signup endpoint (§29a), Portal's share page and sodo's sealed frame (§29b/c), the hand-picked order result (§29d), and the floating-CDN constraint (§29e) |
| ✅ | `architecture/.../VERIFY-AT-BUILD.md` | Probe families **2, 8, 9, 31** struck and family **1** reduced, each with its outcome; new items **47** (the `{{#get}}` budget — the one number left unmeasured), **48** (adjacency), **49** (no render-time substitution), **50** (the edit-safe table), **51** (never depend on Ghost's floating CDN bundles) |
| ✅ | `architecture/.../ARCHITECTURE-SPINE.md` | **AD-37** (the build decides the page; the render never re-decides it — R-8 + R-19, closing the review's R1 and R2) and **AD-38** (member PII is never server-rendered — R-28). Amendments to **AD-3** (points at AD-37 rather than carving out), **AD-4** (D9's `newTab`/`rel` in the mark record + the inline-token allowlist), **AD-10** (the three declined writes recorded so they are not re-proposed) and **AD-36** (six new instances) |
| ✅ | `CONTROL-PROMPTS.html` | D3, D26 and D27 marked **reversed in place**, and D17 in the combined D12–D39 block, each with its reason and this file as the reference. The 2026-08-24 text is kept as the record — the markers say not to act on it |
| ✅ | `research-section-js-libraries.md` | **§7 gains the edit-safe column** FR-D20 has always cited (R-21), `member-form`'s false no-JS sentence is rewritten against §29a, and §2.1 loses `search-overlay` + `search-expand` and gains `nav-transform`, `contact-form`, `group-headings`. §0 and §3.1 point at ruling R-24 |
| ✅ | `tools/category-prompts.py` · `CATEGORY-PROMPTS.html` | `module_registry()` **derived the count instead of asserting `== 31`** — the hardcoded-class-membership failure `doc-audit.py`'s own header records finding twice, which duly broke on this change. It now parses §7's three columns and asserts the invariant that matters (every §2.1 module has a no-JS line, and no orphan lines exist). All 34 prompts regenerated |
| ✅ | `build-sequence.md` · `HANDOVER.md` · `INDEX.*` · `tools/doc-audit.py` | Step 4 marked complete both halves, the reversals flagged where D-numbers are quoted, this file catalogued. `python3 tools/doc-audit.py --check` **passes** |
| ⚠️ | **R-24 was tightened by the owner on 2026-08-27 AFTER the merge session began** | A23 is **deleted entirely**, not reduced to two or three openers; search becomes an A1 control (Icon · Button · Bar) and the category count goes 34 → 33. A merge session started before this correction is working from the superseded text — re-read §A R-24. |
| ✅ | **`prd.md` FR-D1, FR-J7, FR-J9** · `ux-designs/ux-Inflozo-2026-09-03/` · `tools/reapply-export-edits.py` | **§A11 — step 5, 2026-09-03.** R-76 (the editor is desktop and tablet, and the floor is designed) into FR-D1; R-79 (pinning's home is the PRD, not `BACKUP-GATE.md`) into FR-J7 and FR-J9. R-77 and R-78 need no PRD change — one declines an affordance no requirement carried, the other confirms FR-C7 as written. Both spines written and catalogued. The library-total detector fixed for the third time, and this time it fails on the string that had walked past it |
| ✅ | **`EXPERIENCE.md`, `DESIGN.md`** | **§A15 — the Appendix A export, verified 2026-09-04.** Every "→ A1…A8" in the Information Architecture now names its D canvas and label; the two "what the export draws" tables say what it draws today with the history in one clause; the accessibility floor cites D8c–D8f, the responsive section D8a, D8b and D4f; the two tokens A7 moved (focus ring, placeholder colour) are re-derived with old → new recorded; A9 is written. ⬜ the process documents, the board generator and the two tools §A15 names (main session) · ⬜ the prototypes lift the D frames (the prototype agents) · ⬜ decision 1, then A9 (owner) |
| ✅ | **`prd.md`, its companions, `sections-inventory.md`, the category specs** | **Tier 3 — the inventory merge. COMPLETE 2026-08-31.** The inventory is generated from the export and gated; the specs were patched by the design patch pass and are checked by `tools/verify-design-pass.py`; both deferred derivations are done. What Tier 3 does **not** cover is §A2/§A3's rulings R-30 … R-38, taken after it |

### Tier 3, ruling by ruling

**Probe first (§E-1):** ✅ **run and landed.** `tools/probe/run-verify-47.py` against T1 and T3 →
`MEASUREMENTS.md` **§30**, register item **47 closed** and **52 added**, `appendix-b1 §5` corrected.
**The premise was wrong: there is no per-template `{{#get}}` budget.** Ghost races *each* get against
5000 ms on both majors and 150 gets on one template resolved in full, so **R-20's provisional cap of twelve was withdrawn by the owner on 2026-08-27 — no hard cap, the panel warns past 25. (Superseded text: the cap stood at twelve
on a latency budget** (≈ 10 ms per pick) rather than on an abort threshold. Item 47 anticipated only the
downward correction; the owner took the upward decision the same day — **no cap, warn past 25**.)

| Ruling | Normative documents | The specs — **2026-08-27 snapshot, superseded** ⬆ |
|---|---|---|
| **R-1** counting / arithmetic | ✅ §7.3 rows 2, 3, 5, 7 re-pointed and **row 8 struck** — a group heading is the `group-headings` module, not a compiler construct | ⬜ |
| **R-2** initials | ⬜ | ⬜ |
| **R-3** stylesheet doing a script's job | ✅ FR-G8 Tier-2 (`mask-image`), A32's fade re-pointed in `research-contested-variants.md` | ⬜ |
| **R-4** capability flags · `@member`'s real shape | ✅ FR-H6 | ⬜ |
| **R-5** subscribe forms are JS-required | ✅ FR-G4 (the waiver list, and §29a's three findings) | ⬜ |
| **R-6** `{{content}}` is Ghost's | ✅ FR-J17, NFR-5, FR-Q7 | ⬜ A33, A25 |
| **R-7** `compileTarget` refuses | ✅ FR-G3, FR-H2, `sections-inventory.md` preamble, A29 and A31 declarations | ⬜ |
| **R-8** no render-time substitution | ✅ `sections-inventory.md` (AD-37 paragraph); §7.3 gains no hand-off construct, as ruled | ⬜ |
| **R-9** A15 upload cut | ✅ **FR-K1 — cancelled, not deferred**, and no `assets/media` | ⬜ A15 |
| **R-10** thirteen corrections | ⬜ | ⬜ |
| **R-11** search panels | ✅ moot — superseded by R-24, which deletes A23 | — |
| **R-12** Remove at the minimum | ⬜ P0·3, `Appendix C` | ⬜ |
| **R-13** borrowed scale labels | ✅ `Appendix C` (the rule now binds the row, not the words), FR-F3 | ⬜ 23 specs |
| **R-14** gap names | ✅ `Appendix C` **ticked — Tight/Normal/Loose already correct, it does not move** | ⬜ the eleven specs on Tight/Standard/Wide |
| **R-15** `<details name>` | ✅ FR-G8's Tier-2 entry | ⬜ A9 |
| **R-16** the inventory superseded | ✅ **wholesale.** `tools/export-roster.py` + `tools/inventory-gen.py` regenerate Appendix A's totals and all 33 rosters from the export and are gated by `doc-audit --check`; A23 deleted; `Appendix I` counts generated; `research-contested-variants.md`'s six settlements re-pointed; `derived-fields-A1-A12.md` **retired**. 🟡 **The per-category `Content:` / `Controls:` / `Data:` unions are NOT regenerated** — see the open list | ⬜ |
| **R-17** `[Free]` = two per category | ✅ derived in Appendix A, FR-G2 rewritten, **both historical re-tiers withdrawn** | ⬜ the marker on each spec's roster |
| **R-18** item counts are pickers | ✅ `Appendix C` Stepper, FR-H2 | ⬜ 17 specs |
| **R-19** route-awareness at build | ✅ `sections-inventory.md` line 71 amended, not deleted (AD-37) | ⬜ |
| **R-20** hand-pick cap | ✅ **measured** (§30) and **re-ruled by the owner 2026-08-27 — no cap, warn past 25**; FR-H2, §7.3 row 2, `appendix-b1 §5`, `sections-inventory.md` preamble all carry the new rule | ⬜ the warning's copy |
| **R-21** edit-safe | ✅ FR-D20's citation made real, FR-G7(3) | ⬜ every spec's Behaviour field |
| **R-22** comment accent linked | ✅ FR-Q3 | ⬜ A28, A30 |
| **R-23** narrowing a universal control | ✅ FR-F3 | ⬜ ≥ 10 specs |
| **R-24** native search only | ✅ **A23 deleted**; FR-G7(1) restored whole, NFR-2's re-measurement cancelled, FR-I5 (no `/search/`, the two routes that *are* emitted), FR-F6 (**Link Picker gains \u201cGhost search\u201d** — the architect's reading, confirmed), NFR-5, `CATEGORY-PROMPTS.html` marks A23 deleted with no copy button. **Two merge decisions taken and recorded below** | ⬜ A1, A4, A31 |
| **R-25** all-tags / all-authors routes | ✅ FR-I5 | ⬜ |
| **R-26** inline icons, Tabler | ✅ FR-F1, `Appendix C`, FR-Q7 · scope clarified by **R-92** (§A17): Tabler is the sections', the app chrome draws the frames' own paths | ⬜ |
| **R-27** inline-token allow-list | ✅ FR-G3, FR-D4, FR-F6 | ⬜ |
| **R-28** member PII never rendered | ✅ FR-H6 | ⬜ A30, A16 |
| **R-29** share destinations | ⬜ `Appendix B`, and **R11's FR still needs drafting** | ⬜ |

**The two roster decisions R-24 delegated to the merge, and how they were taken.**

1. **A1 drops to fifteen; `A1-9 Search-Forward` is cut.** The ruling left "keep a design at that default
   or drop to fifteen" open. Dropped, because the only thing making its tuple unique —
   `form · none · page · few · none · field takes the slack` — **was the control value**, and a design
   that differs from its siblings only by a control's default is not a design (FR-F7, and the inventory's
   own rule that controls no longer distinguish designs). It also declared `search-overlay`, which R-24
   deletes; a design cannot outlive its own module.
2. **The architect's reading is confirmed: the Link Picker gains "Ghost search" as a destination.**
   Opening Ghost's search is one attribute, `data-ghost-search`, not a layout — so any button or link in
   any category can open it with no new design, control or module.

**A third, not delegated but forced by the ruling's own words.** R-24 says A4-15 and A31's search
affordances "become the same control, **or are struck if their design has no header to carry it**."
**`A4-15 Search` is struck** — a hero is not a header, and its whole descriptor was "a field that never
renders a result", which is now any hero's button pointed at Ghost search. **A31 keeps all ten**: its 404
renders the site header, so search on an error page *is* A1's control; what is struck there is A31's own
`<form action="/search/">`, since no `/search/` route is emitted.

**A fourth consequence, flagged rather than assumed.** **`command-palette` is deleted from the registry.**
R-24 named `search-overlay` and `search-expand`; it did not name this one, because at the time A23 was
keeping two or three openers. With A23 gone the module has **zero consumers**, and the ruling's own lint
rule — *"sodo binds ⌘K, so no Inflozo design may bind ⌘K"* — forbids the module's entire job. Struck in
`research-section-js-libraries.md` §2.1 and §7 with the reason, rather than removed, so the proposal is
not made again. **`typewriter`, `confetti` and `shuffle` are NOT yet re-homed** — §D calls for it and it
belongs with the spec pass. If deleting `command-palette` is not what the owner intended, it is one row
to restore.

**Tier 3, closed 2026-08-31.** Each of the four items listed here on 2026-08-27 as still open is now
done, and how it was closed matters more than that it was:

- **The category specs.** Patched by the design patch pass (`DESIGN-PATCH-PROMPTS.html`, one prompt
  per category), and the result is *checked* rather than asserted — `tools/verify-design-pass.py`.
- **The per-category `Content:` / `Controls:` / `Data:` unions in `sections-inventory.md`.** Derived
  from the export by `tools/derive-content-lines.py` and `tools/derive-control-lines.py`. The first
  attempt was **refused** rather than landed — the specs declared controls in four incompatible shapes
  and eight categories carried nothing readable — and the refusal is kept in
  `derive-control-lines.py`'s docstring, because it measures the gap that had to be closed first.
- **`research-section-js-libraries.md` §7's two design-list columns.** Re-derived by
  `tools/derive-module-reach.py`, which counts a module **only** where a design's own declaration
  names it. A name in category prose is not a declaration — that is what stops every A1 design
  claiming `accordion` by association. A17, A18 and A19 declared only in prose until a corrective
  Claude Design pass gave all of their designs the per-design declaration on 2026-08-31.
- **R-2, R-10, R-12 and R-29's normative halves, and R-29's undrafted FR.** Carried forward — they now
  sit alongside R-30 … R-38 as the propagation still owed before E4/E9.

### R-30 … R-38 · propagation ledger *(the owner ruled on 2026-08-31 that this lands before step 5)*

The **normative half is DONE**. The **spec half was design work** — it changed drawn frames and spec
text, so it belongs in a Claude Design patch prompt, not in a repo edit — and it is listed below as the
work list for that prompt.

| Ruling | Normative documents — ✅ landed 2026-08-31 | The specs — ⬜ owed, design work |
|---|---|---|
| **R-30** count per row is a named set | ✅ `Appendix C` Stepper row gains the carve-out (a count that selects between DRAWN LAYOUTS is a Named Select); FR-H2 restates it | ⬜ A12 |
| **R-31** the reading bar renders nothing | ✅ research `§7` `header-scroll` now carries **both** consumers — A1 resting, A24-13 nothing and no reserved space | ⬜ A24 design 13's No-JS line |
| **R-32** computed vs authored pack tokens | ✅ FR-E1 opens on the rule; **`Appendix D` §D.0 is new** — a row per token marked computed or authored, two authored beyond the palette; AD-30 gains the rule and the reason | — |
| **R-33** a disabled control is greyed with its reason | ✅ FR-F7 (the dependency is schema-declared, so sidebar, validator and compiler read one source); FR-F3; `Appendix C` | ⬜ P0, A5, A14, A17, A18, A19 |
| **R-34** no visitor mode switch under a pinned scheme | ✅ FR-D7, FR-Q5 (`color_scheme` is the single source; `{{comments mode=…}}` derives), AD-30 | ⬜ A1, A28 |
| **R-35** nothing fetches from a video provider | ✅ **AD-10** gains it as a fourth declined outbound call; **AD-23** records that a fact nobody fetches needs no fixture; FR-K1; §E strikes family 36's oEmbed half | ⬜ A15 — state that title/description/poster are required, not fetched |
| **R-36** an empty feed shows its designed state | ✅ FR-H4 (never back-filled); FR-H2's `fallback` value set is the designed state alone | ⬜ A22, A13, A34 — the thin three |
| **R-37** one Post Content section per layout | ✅ FR-I1; FR-D5 (a second class of singleton, refused **at placement** with the reason) | ⬜ A25 |
| **R-38** a design may declare its script's width | ✅ FR-G7 (the declaration may carry a width; the no-JS line must describe **both** sides of it); research `§7` | ⬜ A2, A3, A13 |
| **R18** AD-27 row shapes *(architecture)* | ✅ AD-27 — five states, one row each in `doc-schema.ts`, never a side table | — |
| **R24** CSS emission order *(architecture)* | ✅ `prd.md` §8's post-body trio — `cards.css` first, then per-design; **A33 owns the card interiors, A25 owns the column they sit in** | — |
| **R-12** Remove never greys *(carried forward)* | ✅ `Appendix C` — it was the reference case R-33's new paragraph cited, and the PRD had never defined it | ⬜ P0·3 |

**Also fixed in the same pass:** `prd.md` cited `research-contested-designs.md` three times; the file is
`research-contested-variants.md`.

### R-2, R-10 and R-29 — the carried-forward three, landed 2026-08-31

| Ruling | Normative documents — ✅ landed | The specs — ⬜ design work |
|---|---|---|
| **R-45b** A9-12 Filter | ✅ **CUT ENTIRELY** *(owner, 2026-09-01, superseding the 2026-08-31 reading "the filter comes off, the design stays")*. The reason the control had to go is unchanged — there are no Ghost routes for FAQ rows somebody typed, so `filter-strip` cannot degrade honestly there. What changed is what was left once it went: **a plain list of questions and answers, which is design 3 Open List.** Two designs separated by nothing is what FR-G5's uniqueness bar exists to prevent. Recorded in `export-roster.py`'s deletion table; **number 12 retired** | ✅ done in the 2026-09-01 export |
| **R-2** the avatar with no photograph | ✅ **FR-H8** gains the avatar as its one designed substitute, with the reason the two forms differ: `{{split}}` is Ghost ≥ 6.5 and a **gscan error below**, so two initials are unreachable for Ghost-sourced data. Authored lists bake two at compile; Ghost authors get one letter in pure CSS | ⬜ A12, A17, A24, A1-6, P0·5 |
| **R-10** thirteen corrections | ✅ **#13 → FR-Q1** (every "posts per page" links to Inflozo's Theme Settings, never Ghost Admin, which has no such setting). ✅ **#8 → `appendix-h1` §3.9**, and it needed executing first — see below. ~~#1~~ and ~~#7~~ are **withdrawn**, both refuted | ⬜ #2–#6, #9–#12 are per-category corrections |
| **R-29** share destinations | ✅ **FR-Q10 is written — this is the FR "R11" has been waiting for.** One ordered site-wide list, stored as one row on the project doc (**AD-27**), emitted as real `<a href>` URLs that work with JS off. ✅ **`Appendix B`** gains `share` as a *Ghost fact and not a destination*: absent on Ghost 5, where the link opens the **sign-in** modal, and an unstylable shadow-DOM iframe where it exists | ⬜ A24-14, A25, A26-9 |

**R-10 #8 was not transcribed — it was executed, and the document it corrects had the reason backwards.**
The ledger said *strike `%` from `comments.count_*`*; `appendix-h1` §3.9 said keep `%` **because the
helpers substitute it**. The claim underneath belonged to probe family 30, never run. It was run
(`MEASUREMENTS.md` §32, register **56**): `{{comment_count}}` substitutes **nothing** server-side — it
emits a `<script>` with data attributes, and Ghost's client script **prepends** the count, so `"% comment"`
renders the literal **`1 % comment`**. **R-10 #8 is right and the appendix's reason was wrong.** Its first
control failed and refused to report a result, which is how the real shape was found at all. Scope kept
honest: `{{plural}}` is a different helper, was not tested, and is not tarred with it.

**Nothing from the merge is now owed a normative half.** What remains of every ruling is design work.

### The six `LOOK` prose scans, triaged 2026-08-31 — two were real

`tools/verify-design-pass.py` flags six scans it cannot judge, because they cannot tell a violation
from a spec **recording that it removed the thing**. All six were read. **Four are exactly that
false positive, and are correct as they stand:**

| Scan | What it flagged | Verdict |
|---|---|---|
| R-1 computed counts | A26 `"+4 more"`, A29 `"and 2 others"` | ✅ both are the spec stating the phrase was **removed** — A26 records `"+4 more" is now "+ more"` |
| R-14 gap ladder | A14 / A15 `Tight · Even · Airy` | ✅ both are the spec recording the **rename to Tight · Normal · Loose**, values unchanged |
| R-9 A15 upload | `Source: Upload`, `ambient loop` | ✅ struck through in place — *"that branch is deleted in the design patch pass"* |
| R-4 phantom fields | A30 / A8 `member since` | ✅ A30 records it **deleted**; A8 reads no Ghost field at all, so its "member since" is a sentence the site typed |

**Two were real and are now on the pass-two work list:**

- **A12 · R-8.** Its responsive note says the section *"draws as **1 Grid**"* when the cards are not
  wider than the content width — **naming another design**. A14 was made to stop doing exactly this
  ("1 Grid stops calling itself the arrangement six other designs resolve to at 390"). Describe the
  result, not a design: *"draws as a plain grid, with no arrows, no fades and no scroll container."*
- **A33 · R-6 — narrower than the scan suggested, and worth stating precisely.** The scan looks for
  `kg-toggle-card` and finds nothing. On reading, the *coverage* is good: **all twenty of Ghost's
  cards are drawn**, each with its fields and its Ghost-owns caveats, and the toggle is already
  described correctly in prose — *"a plain container with an `h4` and a `button`, not
  `details`/`summary`"*. So it is **not** true that a builder cannot tell what they are styling.
  What is true is narrower and still a real gap: **not one Ghost class name appears anywhere in the
  specification** — no `kg-toggle-card`, no `kg-card`, no `kg-width-*`. A33's entire deliverable is a
  stylesheet, so the spec says what to style and never what to **select**. That is what pass two asks
  for, with the instruction to flag any class it is unsure of rather than guess: a wrong selector
  styles nothing, silently.

A33 was not in pass two's list before this triage. It is now.

**Two things the gate cannot tell you**, so they are stated here. First, `doc-audit.py --check`
verifies the catalogue and the generated artifacts — **it does not verify propagation**, and it passed
while FR-G7 still said 31 modules. Second, the edit-safe values in research §7 are the **architect's
pass** against ruling R-21's sense, not the owner's: only `lightbox` and `carousel` were ruled
directly. E4 confirms the rest against the real canvas.

---

## A · The rulings

### The shape of the 66 ghost-infeasible findings

Ravi's framing, adopted by the room and worth keeping: the 66 are **four missing ideas, sixty-six
times.** (1) Handlebars has no memory and no arithmetic. (2) CSS cannot see content. (3) We invented
fields Ghost does not have. (4) Inside `{{content}}` we own the stylesheet and nothing else.
Rulings 1–10 are those four ideas applied.

---

**R-1 · Anything needing counting, arithmetic, or the previous item in a loop**
**Ruled: one disposition per shape, not per design.**

| Shape | Disposition |
|---|---|
| A byline count ("Jane and 2 others") | Catalog string **without** a number — "and others" |
| Group headings on a key change (month · year · tag · initial) | New registry module **`group-headings`**; no-JS state = flat ruled list (P0·8 rule 4) |
| "The first featured item spans" (cross-iteration state) | **Positional only** — `@first` spans; "featured" reaches a grid via `Source: Featured only` |
| A distinct set computed across a loop (A17-15 "tags from these posts") | **Cut the value.** Keep *All site tags* and *Chosen tags* |
| Money arithmetic (A7's saving line) | Requires `price-toggle`; no-JS state = both prices shown, no saving line. Subunit prices go on the markup |
| A page-number window (A34 "All pages") | **Unroll seven literal guarded slots**; cap "All pages" at a compile-time N or drop the value |
| Numbering that continues across pages (A18-11) | State that numbering **restarts at 01** on every page |
| A direction word on a *bound* stat (A10-14) | Bound values take the "was {prev}" form only — no glyph, no direction word |
| Benefit-matrix dedup / inheritance parsing (A7-2) | Drop dedup and inheritance; render **one row per (tier, benefit)** |
| ≤767 table transposition, viewport-dependent DOM order (A7-9, A7-11) | Keep sideways scroll at ≤767; A7-11 reorders **visually only** (CSS `order`), DOM order fixed |

*Propagates to:* §7.3 missing-construct rows (R3) · research `§2.1`/`§7` (new `group-headings` row +
its no-JS sentence) · `appendix-h1` (`post.and_others`, `pagination.*`) · A7, A10, A17, A18, A20,
A21, A24, A26, A34 specs · FR-G7 registry count (re-derived, §D) · register 44/45.
*Closes:* 13 ghost-infeasible findings, §7.3's wrong row 8, part of R3.

---

**R-2 · The avatar with no photograph**
**Ruled: authored lists bake two initials at compile; Ghost-bound authors show one letter, in CSS.**

No Ghost helper extracts initials (`{{split}}` is ≥ 6.5, splits on a separator, and is a gscan error
below). The one-letter form is pure stylesheet, needs no script and no partial, and works on both
majors. *Example:* "Jane Doe" → **J**.

*Propagates to:* A12 (×14 Empty lines), A17 (11 Meta designs), A24 settlement 2, A1-6 · P0·5 ·
research `§7`.
*Closes:* 3 findings; ends the recurring initials question in three categories.

---

**R-3 · Where the stylesheet was asked to do a script's job**
**Ruled: each case gets a module with an honest no-JS line, or the rule is dropped.**

- A25 **140-character caption rule → dropped.** All captions take the same treatment.
- A32 **paywall fade → a fixed-height gradient** (`mask-image` from the bottom), never a line count.
- A24-13 **condensed bar → module-revealed** (new **`header-scroll`**, `position: fixed` at the
  threshold). No-JS state: hidden. As drawn it can never hold on any site — its containing block has
  already left the viewport.
- A25 heading **anchors** and A25-5 **lightbox over `{{content}}`**: declare their module, lose the
  "pixel-identical without JavaScript" claim, and `lightbox` is **edit-safe: no** (see R-21).
- A7-9 / A7-11 responsive: as R-1's last two rows.
- A32-12 **reading meter**: server-static line from `{{reading_time}}`; the proportional fill is
  `reading-progress`'s, hidden when `reading_time < 3` or the preview is empty.

`header-scroll` also absorbs **A1-16's direction-watch** and **A4-14's scroll cue** — one module, three
consumers, one no-JS line.

*Propagates to:* research `§2.1`/`§7` (new `header-scroll` row) · A1, A4, A7, A24, A25, A32 specs ·
register 45 rows (e)/(f) · FR-D20's edit-safe table (R-21) · `Appendix G` (the 140-char rule recorded
as refused, so it stays refused).
*Closes:* 8 findings.

---

**R-4 · Never ask a site for something its settings cannot give**
**Ruled: gate every member ask on the site's own capability flag, and warn at connect and pre-deploy.**

- Free asks wrap in `{{#if @site.allow_self_signup}}`; paid asks in
  `{{#if @site.paid_members_enabled}}` with `{{#get "tiers" filter="type:paid+visibility:public"}}`.
- **`@member` binds only its proven field set** (`update-local-template-options.js:27-40`):
  `uuid · email · name · firstname · avatar_image · subscriptions · paid · status`.
  **"Member since" is deleted** (`created_at` does not exist). **The newsletter list is deleted** —
  it becomes a stateless Portal hand-off to `account/newsletters`.
- A22's "You are subscribed" → **"Signed in"**. `@member` cannot know which letter.
- Newsletter **cadence is deleted** — `schema.js` carries no such field. If it returns it is an
  authored per-newsletter annotation, never a generated line.
- A22 badge: `{{#match visibility "paid"}}` → `card.paid_only`. Not `!== 'public'`.
- Every Portal fragment carries register 45(c)'s sentence: **with JavaScript off, nothing happens.**
  Strike "subscribable with JavaScript off" wherever it appears.
- A30 signed-out on the account template: design the `{{else}}` branch of `{{#if @member}}` — Ghost
  does **not** redirect; there is no protected URL. Add the state to P0·6.
- A6 signer picker offers only Content-API authors (post count > 0).
- A6 feature-image default offered only on post/page/custom-entry templates.

*Propagates to:* FR-H6, FR-H8, FR-H1/`Appendix B` (`@member`'s exact shape), P0·4, P0·6 ·
A2, A3, A6, A7, A22, A28, A30, A32 specs · `appendix-h1` `member.*` · register 45(c).
*Closes:* 12 findings, incl. FR-H6's "single most likely way a membership page ships broken".

---

**R-5 · Subscribe forms are JavaScript-required, and say so**
**Ruled after execution — see §C-1. `member-form` joins `nav-transform` as the second no-JS waiver,
and the library ships a designed `<noscript>` notice rather than a form that silently swallows an
address.**

The owner's hypothesis (a plain form POST, CSS-driven states) was tested against both live Ghosts
and refuted three independent ways. Ghost's documentation genuinely never states the requirement —
that is a docs gap, not a misreading. **Every designed sent/error state survives**: Portal's own
script applies the `loading` / `success` / `error` classes to the `<form>`, so the CSS work is real.
Only the *promise* was false.

*Propagates to:* FR-G4 (waiver list: D2's, and now `member-form`'s) · FR-G7(3) · research `§7` row
`member-form` (rewrite the sentence) · every `data-members-form` consumer's Behaviour and No-JS lines
(A3-4, A6-6/14, A22 ×16, A26 ×4, A28-8, A30 ×13, A31-10, A32) · `appendix-h1` (one new
`member.needs_js` key) · P0·6 states.
*Closes:* 1 finding, ~50 designs' No-JS field. **Probe family 2 closed by execution.**

---

**R-6 · Inside a post body we own the stylesheet and nothing else (A33)**
**Ruled: A33 owns `cards.css` only. Seven claims struck. Two quality gates rescoped.**

Struck: the `<details>/<summary>` toggle model (Ghost emits
`div.kg-toggle-card[data-kg-toggle-state] > h4 + button`, `research-ghost-koenig-cards.md §1.2`) ·
the three ARIA/text claims on bookmark, callout and product-rating cards · the five
theme-rendered-string claim (those strings live inside Ghost's renderers; **D10 has nothing to move
here**) · the public-preview marker component (the cut is an HTML comment, `<!--members-only-->`, and
A32's partial follows it — A33 owns nothing at that edge) · the HTML card as a target of the Rules
and Contrast Band values (it emits no wrapper element) · "Bleed applies to galleries and every media
card" (gallery width is hard-coded `kg-width-wide`; embeds carry no width class) · signup, CTA and
header cards inverting inside a Contrast Band (they carry the author's own inline colours and
FR-Q7 bars colour controls on them; the band's plane may run behind them, their surfaces stay the
author's).

**Gate rescope, Murat's:** **FR-J17's heading-order gate and NFR-5's accessible-name assertions do
not inspect the inside of `{{content}}`.** As written the gate fails every post containing a toggle
card — our own quality apparatus failing on Ghost's markup, on a customer's content.

*Propagates to:* A33 spec (roll redraw + component inventory), A25 (the `.kg-*` ownership boundary,
R24) · FR-J17 · NFR-5 · FR-Q7's exclude list · research `§6.4`/`§6.6` · `appendix-h1` S8.
*Closes:* 7 findings. Reshapes A33's toggle roll and Contrast Band.

---

**R-7 · A design declares where it may be placed, and the compiler refuses an illegal placement**
**Ruled: per-design `compileTarget`; `compileTarget: any` is withdrawn wherever it is a lie.**

- Designs emitting `{{pagination}}` are restricted to paginated targets. On `post.hbs` / `page.hbs` /
  `error.hbs` / `private.hbs` it is a **fatal render** (`appendix-b1 §3`) — A23-14's hidden `<ol>`
  is dropped.
- Designs performing `{{#get}}` exclude `error.hbs` and `private.hbs` (`appendix-b1 §3c`). An error
  page that queries the database compounds the outage it is reporting.
- **Load-more designs are main-feed-only** (A17-16, A18-15). FR-H2: a `{{#get}}` feed never
  paginates; there is no `/page/2/` to fetch or to fall back to.
- `limit="all"` is capped at **100** (FR-H2) with truncation stated; `all` trips gscan on 6.x and
  silently returns 100 anyway (A20-7).
- A29: `compileTarget` gains `custom-{name}.hbs` collection templates; *From Ghost* on a collection
  resolves only via a page key, else Custom text only.

*Propagates to:* FR-G3 (`compileTarget` semantics) · FR-I1/FR-I2 · FR-J3 (compile-time refusal) ·
`sections-inventory.md` `compileTarget` declarations (superseded wholesale — R-16) · A17, A18, A20,
A23, A29 specs · R19.
*Closes:* 6 findings.

---

**R-8 · A placed design never becomes a different design at render**
**Ruled: banned. Modules hide their own chrome; the editor advises; preconditions resolve at build.**

*Example:* a rail that fits the viewport shows no arrows and no fade — the module hides the chrome on
`scrollWidth <= clientWidth`. It does **not** become "1 Row". The editor says *"at this count, 1 Row
reads better."* A1-4's transparent header is decided **at build** from what is actually placed below
it, never from a render-time image probe; the "or its image fails to load" clause is struck (a load
failure is a browser event and the design forbids itself a script).

This closes **R2**, the largest unowned mechanism in the review (14 categories, ~25 hand-offs in A10
alone, eleven in A11), and it keeps AD-3 intact: a design switch stays an edit-time act.

*Propagates to:* **AD-3 corollary** (new — "a design switch is an edit-time act; no render-time
substitution exists") · §7.3 (the hand-off construct is **not** added) · FR-J3 (no second design's
CSS is emitted, so the dead-code strip stays correct) · A1, A7, A10, A11, A12, A13, A17, A18, A19,
A20, A26, A27, A29, A31 specs · register 45(i) becomes "refused, with the reason".
*Closes:* 2 ghost-infeasible findings + **R2 entirely**.

---

**R-9 · A15's "Upload a video" is cut — embeds only** *(owner overruled the room's recommendation)*
**Ruled: the Upload source is removed. Inflozo does not become a video host.**

There is no Content API media resource, AD-10's write allowlist has no media upload, and FR-K1 is
images only. Rather than add a Video asset type, the source goes.

**Consequence — D27 is superseded in half** (§B-4): "uploaded videos get Ambient loop (muted)" has no
source of files, so the **Ambient loop is cut with it**. D27's second half — embeds keep the autoplay
refusal — stands, alongside D39.

*Propagates to:* A15 spec (items 7/9 of designs 1–15, the file-read duration claim, the Fields table)
· **FR-K1 / FR-K2 / FR-K5 — the video-asset amendment is cancelled, not deferred** · FR-J3
(`assets/media` is not created) · `Appendix G` (record the deferral so it stays deliberate) ·
probe family 36 shrinks to its oEmbed-provider half · AD-23 fixtures.
*Closes:* 1 finding; removes an FR amendment and half a probe family.

---

**R-10 · Thirteen corrections applied without a ruling**
**Ruled: apply, as cited.** No trade-off exists in any of them.

| # | Correction | Citation |
|---|---|---|
| 1 | ~~A25 ×6: `#/share` → `#/portal/share`~~ **WITHDRAWN 2026-08-31 — this correction was wrong.** It was read off Portal's `getPageFromLinkPath`, which handles `/portal/*` paths. Portal **also** carries a dedicated top-level regex, tested *first*: `d = /^\/share\/?$/` → `if (r && d.test(r)) return {showPopup:!0, page:'share'}`. So **`#/share` works on Ghost 6 and is the form Ghost documents.** On Ghost 5 (portal 2.51) neither the regex nor the share page exists, so no Portal share link works there at all — which is why **R-29** kept our own share list. Caught by the A25 design session, which read Ghost's docs and said so rather than complying. **No spec was changed on the bad advice.** | Portal 2.69 source, verified 2026-08-31 |
| 2 | A21: author handles route through `{{social_url type=…}}`, never printed raw as hrefs | A21 finding 7 |
| 3 | A27: related filter becomes `primary_tag:{{primary_tag.slug}}+id:-{{id}}` inside `{{#post}}` — helpers do not execute inside filter strings | `appendix-b1 §5` |
| 4 | A31: the gate `<form>` drops its `action` attribute so Ghost's own `?r=` survives (`@path` is not a Ghost global) | `private.hbs:80`, `lib/middleware.js:67` |
| 5 | A26: `authorLinkLabel` default uses the **full** name — `{{split}}` is ≥ 6.5 and a gscan error below | A26 field list |
| 6 | A20: *Tag's own* colour gated to Ghost ≥ 6.23 with `{{contrast_text_color}}`; `color-mix` cannot pick an on-colour | D31, FR-H7 |
| 7 | ~~A24/A26: `feature_image_caption` needs a second triple-stash carve-out~~ **WITHDRAWN 2026-08-31 — the probe refuted its premise.** E-2 ran on both majors (`MEASUREMENTS.md` §31a, two controls passed): Ghost hands the field to Handlebars **already marked safe**, so `{{ }}` and `{{{ }}}` render byte-identical and the double stash does **not** escape. A carve-out would add an XSS surface and buy nothing. **AD-5(2)'s zero-`{{{` assertion stands whole.** What the probe *did* find is a different, real obligation for these two categories: **Ghost 6 strips `<em>` and `<strong>` from this field at render and Ghost 5 keeps them**, so an italic caption renders on 5 and not on 6 — and on Ghost 5 a `<script>` in the field reaches the page and no theme can escape it (register **53**). | AD-5(2), §31a |
| 8 | A28 ×10: the comment count is client-rendered; rewrite every no-JS line, give every design an `aria-label` fallback, drop "the comma is the helper's", strike `%` from `comments.count_*` | A28 settlement 1 |
| 9 | A28-4: offered only when `@custom.color_scheme` is **pinned**; on an Auto site the forced band renders wrong for half the audience | AD-30 |
| 10 | A6: feature-image default only on post/page/custom-entry templates | (also R-4) |
| 11 | A6: signer picker offers only authors with a published post | (also R-4) |
| 12 | A16: "seeded with the site's own city" → a fixture placeholder; no `@site` key carries a city | P0·3 placeholder-copy line |
| 13 | A34: "Posts per page" links to **Inflozo's** Theme Settings, not Ghost Admin — `posts_per_page` is a theme `package.json` key and Ghost Admin has no such setting | `theme-engine` allowedKeys, research `§2.2` |

*Propagates to:* the named specs, `appendix-h1` (`comments.*`), FR-Q1.

---

**R-11 · A23's two search panels redrawn on the dialog pattern**
**Ruled — then made moot the same session by R-24.** Recorded so the reasoning is not re-derived:
the combobox + `aria-activedescendant` pattern is the registry's stated single largest AA failure
source. Under R-24 no Inflozo-drawn results panel exists at all, so nothing remains to redraw.
**Superseded by R-24.**

---

**R-12 · Remove at the minimum**
**Ruled: the Remove control stays visible and active, and says why it cannot go lower.**

*Example:* a pricing table needs two tiers. At two, Remove still looks and behaves like a control, and
clicking it says *"a pricing table needs at least two tiers."* A disabled control cannot be focused
and cannot explain itself, which is exactly when the explanation is needed. This resolves the
four-way collision (P0·3 "disabled" vs the control prompt's rule 8 "never disabled" vs A3/A16 vs the
A10/A11 hand-off) in favour of **never disabled**.

*Propagates to:* **P0·3** (the sentence changes) · `CONTROL-PROMPTS.html` rule 8 (now consistent) ·
`VERIFY-AT-BUILD.md` register 44 · A3, A7, A10, A11, A16 specs · `Appendix C`.
*Closes:* the single most-repeated row family in the 1,078-row register.

---

**R-13 · Borrowed scale labels**
**Ruled: a distinct row *title* is required; the three *words* may be shared.**

*Example:* "Card padding: Compact · Comfortable · Spacious" is legal. The title says what it affects;
the words mean the same thing everywhere, so an editor learns one vocabulary rather than 23. D7's
"rename genuinely different ladders" therefore binds the **row**, not the values, and `Appendix C`'s
no-borrowed-labels rule is narrowed to say so.

*Propagates to:* `Appendix C` (the scale table + the rule's wording) · FR-F3 · 23 specs' control
lists (§4, §7, §10, §11, §24, §25, §31, §33, §34).
*Closes:* collision (iii) of §37.4 and 23 specs' worth of rows.

---

**R-14 · Gap names** *(owner overruled the room's recommendation)*
**Ruled: Tight · Normal · Loose. D26 is reversed** (§B-3).

`Appendix C` already reads Tight/Normal/Loose and **does not move**. The specs already on those words
are now correct. What moves: the eleven specs on Tight/Standard/Wide, and **A11's own control
prompt**, which is what collided with D26 in the first place.

*Propagates to:* A11 prompt + spec · the eleven specs on other ladders · `Appendix C` (**no change** —
tick it) · `CONTROL-PROMPTS.html` §Decisions (mark D26 reversed, with this file as the reason).
*Closes:* collision (i) of §37.4, and removes a PRD amendment that was owed either way.

---

**R-15 · One-at-a-time accordions**
**Ruled: keep the no-JavaScript `<details name>` grouping. Older browsers may show more than one
panel open; that is acceptable degradation, and nothing is built for it.**

D19 stands. FR-G8's Baseline pin gains an explicit **Tier-2 entry** for `<details name>` so the
collision cannot recur.

*Propagates to:* FR-G8 (Tier-2 list: `<details name>`; also rule `mask-image` and `fetchpriority`,
and confirm `scrollbar-gutter` is Tier 3) · A9 spec · probe family 38 keeps the lookup, loses the
blocking status.
*Closes:* collision (v) of §37.4.

---

**R-16 · The inventory's rosters are superseded wholesale by the export**
**Ruled: one sweep at the merge. The drawings are the roster.**

`sections-inventory.md` no longer describes the export in at least 24 categories. Rather than 34
individual rulings, the inventory is **regenerated from the export** — rosters, content unions,
control unions, Data lines, `bindingContext` / `compileTarget` declarations, and the Synthesis
Defaults' named designs. D11 set the precedent for A31; it now applies library-wide.

**Not editorial — these cite inventory identities that will cease to exist and must be re-pointed in
the same pass:** the FR-G7 registry's "Designs requiring it" and "Trigger in the inventory" columns ·
`research-contested-variants.md`'s six settlements (A7 #12, A19 #11, A27 #11, A29 #13, A32 #10/#12 —
at least three have no export counterpart) · the Synthesis Defaults (inventory 691–740) ·
§7.3's missing-construct table rows 3, 5, 7, 8 · `tools/category-prompts.py` (reads the inventory) ·
`tools/tuple-check.py` (see §D).

*Propagates to:* `sections-inventory.md` (wholesale), `Appendix A`, FR-G7, §7.3, research companions
×2, both tools.
*Closes:* ~24 categories of `prd-defect` rows in one ruling.

---

**R-17 · `[Free]` designs: exactly two per category, no exceptions**

> **AMENDED 2026-08-28 by the owner, after checkpoint 1.** Two per category stands. **Which two is
> now the owner's choice per category, not a positional derivation.** The design pass shortlists the
> three to five plainest designs, recommends two, and asks; the answer is recorded in the spec as one
> machine-readable line — `**[Free] designs:** 1 Rail · 13 Centre Nav` — and `tools/inventory-gen.py`
> publishes that choice. Where the line is absent it falls back to the first two **and reports that it
> guessed**, so a category that has not been asked is visible rather than silent.
>
> **Why it changed:** deriving the pair as "the first two" read as clean until A1 came back naming
> **1 Rail and 13 Centre Nav** while the generated inventory published **1 Rail and 2 Split Rail** —
> two documents disagreeing about which designs a free customer gets, with the count-based check
> reporting PASS. The owner's ruling: the shortlist is a judgement about which designs look finished
> without photography, and that judgement is his.
**Ruled: the rule replaces the number.**

The two historical extras are struck — A31 #10's re-tier is redundant (every A31 design draws the
private gate, so #1 Centred and #2 Split Reason are already its Free pair) and A29's third had no
basis in the export (all fourteen bind "either" archive). **The count is now derived** — two times
the number of categories — and stops being a figure anyone restates (standing rule 3). Every spec
must carry the `[Free]` marker on its roster; the merge may not map it positionally.

`Appendix H` still forbids a design total in product copy, so nothing outside the build changes.

*Propagates to:* FR-G2, `Appendix F.1`, `sections-inventory.md` lines 9/587/623, `Appendix A`
"Tiering", every spec's roster, FR-L3's exit sheet.

---

**R-18 · Item counts**
**Ruled: always a number picker; a design may cap its own maximum and the panel states the reason.**

*Example:* Post Grids tops out at 24 and says so. The seventeen specs still offering fixed enums
("Three · Four · Six") all become pickers. Locked values are drawn disabled with the reason, per
A19's convention. This confirms D6 and answers §17's open question in the affirmative.

*Propagates to:* FR-H2 (per-design Count bounds + lock reason) · `Appendix C` (Stepper) · P0·5's own
bounds · 17 specs (A1-7, A3-13, A7, A8, A9, A10, A11, A19, A20, A21, A22, A23, A25, A27, A28, A31-8).

---

**R-19 · Route-awareness resolves at build, never at render**
**Ruled: the compiler answers it. It already knows every placed section and its order.**

Covers the overlay-header precondition, stacked-padding collapse, duplicate-post suppression,
one-share-block-per-route, footer adjacency and margin occupancy — **≥ 12 categories, previously with
no owner at all (R1)**. It follows directly from R-8: what the editor shows is what the visitor gets,
because both come from the same build-time facts.

`sections-inventory.md` line 71 ("sections never know about each other") is **amended**, not deleted:
sections do not know about each other *at runtime*; the compiler knows about all of them.

*Propagates to:* **a new AD** (Winston to draft — "adjacency is a compile-time fact") · §7.3
(a route-adjacency input to the compiler, not a Handlebars construct) · `sections-inventory.md`
line 71 · register 45(h) · A1, A2, A3, A4, A6, A12, A14, A16, A19, A21, A22, A23, A24, A26, A27,
A28, A29, A34 specs.
*Closes:* **R1 entirely.**

---

**R-20 · Hand-picked order costs one query per pick, so it is capped**
**Ruled after execution — see §C-3 and `MEASUREMENTS.md` §30. RE-RULED by the owner 2026-08-27 once
the measurement landed: no hard cap. The panel warns past 25 and lets the user proceed.**

The provisional cap of twelve was set expecting the probe to find a platform ceiling. It found the
opposite — no per-template budget exists, and 150 gets on one template resolved in full on both
majors. What remains is a **latency** cost of ~10 ms per pick, which is a matter of taste rather
than a limit, so the control informs instead of forbidding. **The warning must say that the budget
is per page, not per section** — three sections at 25 picks each is 75 gets.

Proved on both majors: `filter="id:[…]"` **discards the requested order** and returns
`published_at desc`. Honouring "picked order is drawn order" therefore requires **N single-id
`{{#get}}`s**, and `appendix-b1 §5` documents an abort threshold per template that A1-7 already
approaches (up to seven gets on one page).

*Propagates to:* FR-H2 (the hand-picked compile shape, and its cap) · P0·5 ("picked order is drawn
order" gains its bound) · `appendix-b1 §5` (record the measured budget) · D5 (confirmed, with its
compile shape now named) · A17, A18, A19, A20, A21, A23, A27, A29, A14, A2 specs.
*Closes:* the order half of probe family 1. **The get-budget half remains** (§E-1).

---

**R-21 · Edit-safe means the script does not run in the editor**
**Ruled: the table gets written, and the editor obeys it.**

FR-D20 has always cited a per-module edit-safe table in §7.3; **that table does not exist** —
`edit-safe` occurs exactly once in `prd.md`, which is why the specs each asserted their own and
disagreed (`carousel`: A14 says yes, A15 says no). The sense is fixed once: **a module is `edit-safe`
if it may run inside the editor canvas without interfering with editing.** Anything not edit-safe is
suppressed on the canvas and the section renders in its resting state.

`lightbox` is **edit-safe: no** (a modal opening over the canvas when you click an image to edit its
caption is the defining case). Every module in the registry gets a value.

*Propagates to:* **research `§7` gains an edit-safe column, one row per module** · FR-D20 (the
citation becomes real) · §7.3 · every spec's Behaviour field · AD-21 (the editing chrome interaction).
*Closes:* **R6**, and the carry-forward's orphaned "lightbox edit-safe guarantee".

---

**R-22 · Ghost's comment accent colour is linked to, never written** *(reverses D17)*
**Ruled: AD-10's write allowlist stays at four.**

Inflozo states plainly that comments take their colour from Ghost's accent setting and gives a direct
link to it. No fifth write, no new consent screen, no new audit surface. The credential is
all-or-nothing (round 4: there is no scoped Ghost integration — an Admin key mints a JWT Ghost
verifies by signature, not intent), so every added write widens a blast radius that cannot be
narrowed at the credential.

Also declined, unchanged: **A30's page creation and `portal_button` writes** — what actually needs
re-pointing is the site's own member links, which is an editor choice (FR-F6 / P0·4), not a write.

*Propagates to:* **AD-10** (record the three declines with their reasons so they are not re-proposed)
· `CONTROL-PROMPTS.html` §Decisions (D17 reversed) · FR-Q3 / the connect flow (the link) · A28 spec ·
A30 spec · P8 · **R12 closes**.

---

**R-23 · A design may offer fewer universal values, and must say why**
**Ruled: narrowing is legal; renaming and inventing are not.**

*Example:* a Contrast Band section offers three of the five background roles and the panel says
*"this design is always on a contrast ground."* A universal control's **name and vocabulary are
identical everywhere**; only the offered subset varies, and only with a stated reason. The Swatch
Row's name is **Base**. An **Inherit** value is refused (A28-10, A29-9 lose it). "Vertical spacing"
keeps one meaning; per-design re-scoping (A16, A26) is refused.

*Propagates to:* `Appendix C` · FR-F3 · `sections-inventory.md` line 21 · P0·2 (per-slot colour is an
AD-3 breach — struck) · ≥ 10 specs (A24-5, A25 ×12, A26 ×7, A28, A29, A16).
*Closes:* **R15.**

---

**R-24 · Search is Ghost's native search only** *(owner ruling; reverses D3)*
**Ruled: no custom search engine, no vendored library, no Inflozo-drawn results.**

Executed during the session (§C-2): Ghost's `sodo-search` renders **inside an iframe**
(`this.node.contentDocument.head` / `.body`) with its own injected stylesheet, so theme CSS reaches
nothing inside it; only Ghost's accent colour crosses. Its index holds exactly
`id · slug · title · excerpt · url · updated_at · visibility` — **no post body** — plus separate tag
and author indexes, on both majors. It is opened by any element carrying `data-ghost-search`, by a
`#/search` fragment, or by ⌘K.

**Consequences, all of them simplifications:**

- **`search-overlay` is deleted from the registry.** MiniSearch is not vendored.
- **FR-G7 rule (1) is restored whole** — the "scoped, licence-vetted third-party exception" D3
  created is withdrawn. Zero third-party JavaScript in a theme, no exceptions beside `cards.js`.
- **NFR-2's re-measurement is cancelled**, along with the "largest single module at 1.8 KB" line.
- **R9 is answered: no `/search/` route is emitted by anyone.** `#/search` is a fragment on the
  current page, not a route.
- D3's "Search in: Titles and excerpts · Full content" control is **deleted** — full-content search
  does not exist natively, proved above.
- **A23 is deleted as a category — search is not a section.** *(Owner ruling, 2026-08-27, tightened
  from the room's "keep two or three openers".)* **All fifteen designs go.** Search becomes an
  **affordance with three forms — Icon · Button (with or without icon) · Bar** — offered as a
  control on **A1 (Headers)**, alongside **Off**. Every form does exactly one thing on click: open
  Ghost's native search. There is no Inflozo-drawn search surface anywhere in the library, and no
  design in any category may draw one.
  - **Categories go from 34 to 33**, and every count that derives from the category number moves with
    it — `[Free]` is two per category (R-17), so it follows automatically. Re-derived at the merge,
    never restated (standing rule 3). FR-D12's Picker-rail counts move too.
  - **A1-9 *Search-Forward* is not a separate design any more** — a header "built around search" is
    now a header with the Search control set to **Bar**. Whether A1's roster keeps a design at that
    default or drops to fifteen is a merge decision; it is a roster question, not a capability one.
  - **A4-15 and A31-9's search affordances** become the same control, or are struck if their design
    has no header to carry it.
  - **The architect's reading, to confirm or overrule at the merge:** because "open Ghost's search"
    is a single attribute (`data-ghost-search`) and not a layout, the **Link Picker gains "Ghost
    search" as a destination**. Any existing button or link in any category can then open search
    without a new design, a new control or a new module. Nothing else in the library changes.
- `appendix-h1`'s `search.*` namespace shrinks to the trigger's label and accessible name.
- **New lint rule, not a probe:** sodo binds ⌘K, so no Inflozo design may bind ⌘K.
  `{{ghost_head exclude="search"}}` is never emitted.
- **R-11 is superseded** — there is no Inflozo results panel left to redraw.

*Propagates to:* **FR-G7 (1)** · **NFR-2** · FR-G4 · FR-G8 · FR-C5 (the ⌘K item shrinks to a lint
rule) · FR-I2/FR-I5 (R9 closed) · research `§2.1`, `§2.2`, `§4.4`, `§7` (delete the `search-overlay`
row and its sentence; delete `search-expand` — already claimed by no design) · `appendix-h1`
`search.*` · A1, A4, A12, A13, A23, A31 specs · P0 · `CONTROL-PROMPTS.html` §Decisions (D3 reversed).
*Closes:* R9; deletes **probe families 8 and 9**.

---

**R-25 · All-topics and all-authors routes are emitted; `/search/` is not**
**Ruled: Inflozo publishes an all-tags route and an all-authors route, and only when a design that
links to them is placed.**

Ghost serves neither natively — each needs a Routes Manager custom route rendering a template with a
`{{#get}}`. Emitting them on demand keeps a site free of pages it does not use.

*Propagates to:* FR-I2 / FR-I5 (who emits them, and the trigger condition) · FR-I4 (the Staff token
is what writes routes) · A3-13, A20, A21, A23, A26-8, A27, A29-11 specs · **R10 closes**.

---

**R-26 · Icons are drawn inline, once per use**
**Ruled: inline SVG. No sprite file, no icon font.**

Each icon's markup is written where it appears. It inherits the surrounding text colour
(`currentColor`) with no extra rule, needs no additional request, and works with everything switched
off. The cost — a repeated icon repeats its path data — is a few kilobytes and is measured against
FR-J's budget at E4. **Tabler is MIT (D1); its licence text ships in the theme**, and the curated
subset explicitly includes the nine Ghost social platforms.

*Propagates to:* **R21 closes** · FR-F1 / `Appendix C` (Icon Picker → "curated Tabler set") · FR-J3
(the emission rule and the budget) · FR-Q7 · P0 · every icon slot in the library · a licence line in
the emitted theme.

*Widened by **R-104** (§A24, 2026-09-13): the set is every Tabler icon, outline and filled, grouped by
Tabler's own categories — there is no curated subset. Inline, once per use, and the licence line stand.*

---

**R-27 · Inline tokens in authored text: a short allow-list per field**
**Ruled: each field declares exactly which tokens it accepts; anything else in braces is literal.**

*Example:* a subscriber heading accepts `{members}` and nothing else, and the panel shows that. This
is AD-36's shape — a value crossing into something that interprets it — so the mechanism is an
allow-list by construction, never a general substitution pass. Free-form tokens are refused.

*Propagates to:* **AD-4** (the amendment: an inline binding token is a declared, per-field
capability) · **AD-36** (a new instance, with its test) · FR-G3 (`contentSchema` declares the
allowed tokens per prop) · FR-F6 / FR-D4 (D9's `newTab` / `rel` join the mark record in the same
pass) · P0·1 (per-prop mark allow-list — A8 none, A9 `code`) · A1-9, A9-12, A10-11, A11-14, A22,
A23, A32 specs · the CI lint (D13's, still unbuilt — round 4).
*Closes:* the token half of **R16**.

---

**R-28 · A member's own details are never printed into the page**
**Ruled: no `@member.email`, name or billing detail is server-rendered into markup. Anything
identifying is a hand-off to Ghost's own account panel.**

Ravi could not settle from reading whether a page holding one member's email can be served to another
under `cacheMembersContent`; probe family 18 covers it. Rather than depend on a setting on a
customer's server that we neither control nor can re-check after they change it, the safe shape is
taken now and the probe becomes confirmatory rather than blocking.

*Propagates to:* **a new AD or an AD-10 corollary** (Winston — "member PII is never server-rendered
by an Inflozo theme") · A30 spec (one account row becomes a Portal hand-off) · A16 (`@member` prefill
struck; the `mailto:` fallback stands) · P0·6 · FR-I6 · **R26 closes**.

---

**R-29 · D15 stands, unchanged** *(closed by execution — §C-2)*
**Ruled: one site-wide ordered share-destinations list, ours. Portal's share modal is not used.**

Portal 2.69 (Ghost 6.58.0) has a real `share` page — `getPageFromLinkPath` returns
`{page: 'share'}` — offering X, Facebook, LinkedIn, Threads and Bluesky in a fixed order inside a
shadow-DOM iframe we cannot theme, with no Mastodon. **Portal 2.51 (Ghost 5.130.6) has no such
page**, so `data-portal="share"` falls through to `default` and a Share button opens the *sign-in*
modal on every Ghost 5 site. Recorded here so nobody rediscovers it.

*Propagates to:* **AD-27** (the share-destinations schema) + an FR (**R11**, still needs drafting) ·
A24-14, A25, A26-9 specs · `Appendix B` (Portal actions — add `share`, Ghost 6 only, unthemeable) ·
`VERIFY-AT-BUILD.md` (a recorded external fact, replacing probe family 31).
*Closes:* collision (iv) of §37.4 and **probe family 31**.

---

## A2 · Rulings from the design patch pass, 2026-08-31

The pass raised 28 questions across the 33 categories. **Fifteen the owner answered inside the
sessions**; eleven more were ruled in the body but left with an un-updated heading (so an extraction
that reads headings alone over-counts — worth knowing before trusting a question count from this
corpus). **Two reached him afterwards**, and both are ruled here. **All of R-30 … R-38 propagated to the
normative documents on 2026-08-31 — §A3's ledger is the evidence**; the spec half then ran in patch passes two to five, verified (§A5–§A9).

**R-30 · "Count per row" in About and Team keeps its three named values — three · four · five.**
Not a number picker. R-18's "item counts are always a number picker" was written for *how many items
to show*, which in this category is a separate control; this row selects between **three drawn
layouts**. At three the photograph is large and a job title has room to wrap; at five it is small and
a long title wraps twice. Those are the only three widths any frame in the category has been drawn
and checked at, against a long role and a wrapping name. A typed number would let an editor pick a
width nobody has looked at — six across gives 196 px photographs, the size the wall-of-faces design
uses precisely *because* it draws no roles.
*Propagates to:* A12 spec · `Appendix C` (R-18 gains this carve-out, stated once: a count that
selects between drawn layouts is a named set, not a stepper) · FR-H2.

**R-31 · The sticky reading bar renders nothing without JavaScript.**
No bar, no reserved space — the header scrolls away as every other Post Header design's does. The
bar cannot be built without a script (a browser can only pin an element inside its containing box,
and the header it belongs to has scrolled away by then — R-3). Of the three shapes offered, a
persistent title bar costs every such visitor 56 px of phone screen for a feature they are not
getting, and a bar drawn but not following reads as broken rather than as a choice.
*Propagates to:* A24 spec (design 13's No-JS line) · research `§7` `header-scroll` row.

---

## A3 · The §F asks, ruled 2026-08-31

§F listed nine asks the Ghost Build Room did not reach, owed before E4/E9 open. Seven were the
owner's and are ruled here; three were architecture and are decided below rather than carried.

**R-32 · Pack tokens are computed where they are derivable, and asked for only where they are taste.**
*(closes R5)* ~20 categories need values `FR-E1` / `Appendix D` does not define — on-contrast text,
dark elevation, scrim strength, tabular figures, pill radius, drop-cap ratio. Most FOLLOW from
colours a pack already declares: the readable text colour on a contrast ground is calculable from
that ground. Compute those; ask the pack author only for the handful that are genuine judgement
(scrim strength, pill radius). Two or three real decisions per pack rather than twelve, and twelve
packs cannot disagree about a value neither of them chose.
*Propagates to:* FR-E1 · `Appendix D` (the token list, marked computed or authored per row) · AD-30.

**R-33 · A control disabled by another is greyed, with the reason shown.** *(closes R14)*
Not hidden, not silently ignored. Same shape as R-12's Remove button, and for the same reason: a
control that vanishes teaches nothing, and one that accepts a value it will not honour is worse.
Example: Features' "Icon in accent" spends the accent, so the Action button below the set greys with
"not available while the media uses the accent colour". ~6 categories.
*Propagates to:* FR-F7 / FR-D19 (the dependency vocabulary) · `Appendix C` · P0 · A5, A14, A17, A18, A19.

**R-34 · No visitor dark-mode switch on a site whose colour scheme is pinned.** *(closes R20)*
Pinning is the owner's deliberate choice; a visitor switch that overrides it makes the pin
meaningless. The control is not offered, and the panel says why. `{{comments mode=…}}` derives from
the same pinned value rather than being a second selector.
*Propagates to:* FR-D7 / FR-Q5 / AD-30 · A1 · A28.

**R-35 · Nothing fetches from a video provider. The customer supplies the title and image.**
*(closes the oEmbed half of R23; owner chose more strictly than the room proposed)* Neither Inflozo's
server nor the editor's browser contacts YouTube, Vimeo or any provider. The embed card's title,
description and poster are authored fields the customer fills in — which A15 already declares
(`title`, `description`, `poster`). **Consequences:** AD-10 and AD-23 need no oEmbed provision;
probe family 36's oEmbed half is **cancelled**; no CORS question remains to test.
*Propagates to:* AD-10 · AD-23 · FR-K · A15 spec (state that the fields are required, not fetched) ·
`VERIFY-AT-BUILD.md` (strike family 36's oEmbed half).

**R-36 · An empty feed shows its designed "nothing here yet" state.** *(closes R13's `fallback`)*
Not hidden, and not silently back-filled with the newest posts — a visitor should never be shown
posts nobody chose for that spot, and the fallback query that would need has never been proven to
work in Ghost. **Mostly ratifies what is already drawn:** A17 carries 25 references to its empty
state, A3 23, A21 17, A19/A20/A27/A29 16 each. The thin ones are A22, A13 and A34, which need the
state written when they are next touched.
*Propagates to:* FR-H4 · FR-H2's `fallback` field (its value set becomes the designed state alone) ·
A22, A13, A34 specs.

**R-37 · A post layout may carry exactly one Post Content section, and the editor prevents a second.**
*(closes R25's first half)* Two would print the article twice on a live page. Refused at placement
with the reason, not warned about — there is no reason to want it, so nothing is lost by making it
impossible.
*Propagates to:* FR-I1 · FR-D5 (the singleton rule) · A25.

**R-38 · A design may declare the width below which its script runs.** *(closes R22)*
"Collapses into sections under 768." Three designs need it today (A2-15, A13-15, A3's footer
accordions) and the shape recurs. The declaration names the width; the module's no-JS line describes
the state at BOTH sides of it.
*Propagates to:* FR-G7 (a module declaration may carry a width) · research `§7` · A2, A3, A13.

### Decided as architecture, not carried to the owner

- **R18 · AD-27 row shapes.** The project doc gains a row per stored state: main-feed designation,
  pager control values, per-card overrides, the membership-pages record, share destinations. Pure
  schema; AD-27 already owns the pattern and each is one row.
- **R24 · CSS emission order.** `cards.css` first, then the per-design stylesheet — the browser order
  §7.4 already states, so per-design rules win on the `.kg-*` classes they legitimately style. The
  `.kg-*` ownership line between A25 and A33: A33 owns card interiors, A25 owns the column they sit
  in. R-6 fixed the claims; this fixes the order.
- **R13's remainder** — the authors and tags source shapes, designation as a stored state, the
  layout-level get budget, `feature_image:-null` as a precondition. Spec detail for the merge, each
  following from a ruling already made.

---

## A4 · §37.7 re-verified for step 5, 2026-08-31

`reconcile-designs.md` §37.7 is step 5's work list, and it was written on 2026-08-27 — **before** the
design patch pass. Re-checked so `/bmad-ux` starts from what is true now rather than a stale
snapshot. `reconcile-designs.md` is a `record` and is not edited; this is the delta.

**Unchanged, and still the work list.** The S, B and M screens were not touched by the design pass —
verified against git, not assumed — so every finding about a missing editor surface, a flow drawn on
the wrong mechanism, and the four journeys stands exactly as written.

**FIXED 2026-08-31 — the printed design totals.** Every library count is out of the screens and the
marketing pages: 15 instances of "485 designs" and 3 of "70 Free designs", plus a plan-table row
reading `Sections | 70 Free | All 485`, are now count-agnostic — "Ship every design", "Browse every
design", "Sections | The free set | All". The internal design commentary that also carried the figure
(the index meta line, the responsive-system notes, three A-frames) is included: a number there is not
an `Appendix H` breach but it was wrong — 468, not 485 — and would be wrong again after the next
change. One grammar break the substitution introduced ("Every design **are** available") was caught
on read-back and fixed.

> **AMENDED 2026-08-31 (documentation pass) — the substitution missed four, and the miss is the
> point.** The pass searched for `485 designs` and `70 Free`; it did not search for
> **`485 designed sections`**, which is what `M1 Home` (twice in prose, twice in a stat card) and
> `M4 Gallery` actually said, nor for the index meta line's `34 CATEGORIES · 485 DESIGNS · 34 SPECS`.
> Standing rule 7 exactly: **a propagation list cannot audit itself.** All four are now count-agnostic
> ("Hundreds of designed sections", "EVERY CATEGORY DRAWN AND SPECIFIED"), and — the durable half —
> **both of this section's fixes are now GATED rather than remembered.**
> `python3 tools/verify-design-pass.py` carries two new checks: *no S or M screen prints a library
> total*, and *P0 declares the per-prop mark allowlist*. A Claude Design re-export that overwrites
> either hand edit now turns the check red instead of passing silently. **The original finding, for the record:** §37.7 recorded that the screens print a
design total while the PRD said 484. **Fifteen places across the S and M screens print "485
designs".** The library is now **33 categories · 468 designs · 66 [Free]** after the Search deletion
and the two design cuts. The gap was one; it is now seventeen. `Appendix H` already forbids a design
total in product copy, so the fix is to make the marketing copy count-agnostic rather than to correct
the number — which would only go stale again.

**Four of the five P0 findings are resolved by the design pass; one stands.**

| §37.7's P0 finding | Now |
|---|---|
| P0·3's Ghost-list card never restated on A19, A20, A24, A31 | ✅ all four carry it — 6 to 12 references each to the no-Add, read-only Ghost-bound list |
| P0·5 has no authors / tags / tiers branch | ✅ present: "The Ghost-sourced list (posts, tags, authors, tiers) is **not** this: no Add, no Remove, no drag" |
| P0·6 cannot list a design's states without a `states[]` declaration | ✅ addressed — P0 now carries the state vocabulary |
| P0·2's per-slot colour is an AD-3 breach | ✅ moot — no per-slot colour survives anywhere in P0 |
| P0·1 needs a per-prop mark allowlist (A8 quotes permit none, A9 answers permit `code`) | ✅ **FIXED 2026-08-31.** P0·1 now states the default set (bold · italic · underline · link), that a field may NARROW it and its own spec declares the narrowing, and that a mark a field does not permit is **absent from the toolbar, not greyed** — greying means "exists here, unavailable now", absence means "this field never has it". Both known narrowings are named. AD-4 already carried the rule; what was missing was how the editor shows it |

**Also verified and clean:** the hand-pick cap reversal (register item 47) reached the specs before
they were written — no spec carries the withdrawn "twelve", and P0 states the rule correctly, warning
past 25 with the cost stated per page rather than per section. Three specs matched a search for the
stale figure and all three are false positives, one of them memorably: A19's "12 Picks" is a design
name.

---

## A5 · The library review — nine rulings, 2026-09-02

The 1 September export was read whole: 34 specifications, 32 session briefs, both index canvases and
the two new records. It carried **49 items marked open**. They sorted into three piles, and the sort
is the finding: **three of the four most-repeated questions were already answered** by rulings taken on
2026-08-31, after most of those specs were written — the pack-token split (`Appendix D` §D.0), the
main-feed designation (FR-H2 + AD-27) and how a control declares a dependency (FR-F7). Five more were
registry rulings for the architect. **Nine needed the owner, and all nine are ruled here.**

| # | Ruling | Where it lands |
|---|---|---|
| **R-39** | **A9's numbering gap stays open.** The roster reads 1–11, 13–15. Renumbering would repoint every existing reference to 13, 14 and 15, which is the failure the never-reuse rule exists to prevent — and every other cut in the library (A1·9, A2·13, A4·15) already leaves the same hole | ⬜ A9 spec: close the question |
| **R-40** | **P0 is exempt from the `[Free]` line, confirmed.** It holds shared editor controls and no placeable designs, so it has nothing to make free. Satisfying the instruction would mean inventing design names | ⬜ P0 spec · **and the pass instruction is fixed so it stops re-asking** |
| **R-41** | **The empty-state rule governs FEEDS only.** Items pulled from Ghost render the designed empty state; items the user AUTHORS render nothing at zero. A13 Process was right and the rule was too wide | ✅ **FR-H4**, as a test rather than a list |
| **R-42** | **A3's frames are right; the instruction's wording was loose.** The wide-screen state of the accordion footers is the drawn column grid, not "a plain stacked list". No layout changes | ⬜ A3 spec: close the flag |
| **R-43** | **A minimum-width rule measures the TEXT COLUMN, not the cell.** So A17's three narrow-cell designs grey the excerpt value they cannot honour, with the reason | ✅ **`Appendix C`** |
| **R-44** | **A2 Edge renders OPEN without JavaScript.** That reader gets the message, its link and the rule at the open height; the close is hidden. A 4 px line nobody can open is not a bar | ⬜ A2 spec: confirm as ruled, not as the session's own choice |
| **R-45** | **Four is the maximum for A24's two rows, and that is a design decision.** No fifth cell, no fifth link. The frames stop there because a fifth label wraps and a fifth link takes a second line | ⬜ A24 spec: close the question |
| **R-46** | **A14 Galleries stays pictures-only — bound mode does not link to posts.** A gallery whose every frame links to its post is A17 Post Grids with the titles removed, and two categories resolving to the same visitor outcome is what FR-G5's uniqueness bar exists to prevent | ⬜ A14 spec |
| **R-47** | **Picked order IS stored order.** References are held as dragged and handed to the template that way, never re-sorted by `published_at`. The failure it prevents is silent: A18-11 draws an ordinal over whatever it is given | ✅ **FR-H2** |

**Three landed normatively the same day. Six are spec work** and go to a third design patch pass —
none of them changes a drawn frame except R-43's greyed control, and four are closing a question the
session was right to raise rather than answer.

**Still not the owner's, and not blocking:** five registry rulings for the architect — A5's tabs
announced twice without JavaScript, A5's scroller rule having no registry sentence, A13's walkthrough
emitting a heading per panel, A33's gallery script having no registry entry, and whether
`group-headings` may re-level a heading.

---

## A6 · The open-questions sheet — eighteen answers, 2026-09-03

`LIBRARY-QUESTIONS.html` put every question the 33 specs still left open to the owner, built from
`tools/probe/report-template.html` — the pattern Round 4 used. **Eighteen items. Seventeen answered on
the recommendation; one came back as a question and is answered below.** Six technical rulings about
module authorship were deliberately kept off the sheet as the architect's.

**Five needed no decision at all — they were already answered and the specs had not caught up.**
C1 the pack colour tokens (`Appendix D` §D.0) · C2 the main-feed designation (FR-H2, AD-27) · C3 how a
control declares a dependency (FR-F7) · C4 hand-picked order (R-47) · and **D9, found during this
pass: FR-G7(2) has said since the merge that a design may declare more than one module**, so A24's
question was answered before it was asked. Each is now confirmed and carries into the specs.

| # | Ruling | Where it lands |
|---|---|---|
| **R-48** | **The width floor is EXCLUSIVE — and my first statement of it was wrong.** Three lines needs a column **above** 306 px; at exactly 306 it is already refused and falls to two. A17's shared floor and its disabled-control table had said so twice; my example sentence implied the opposite. **The session caught my error rather than copying it** | ✅ `Appendix C` |
| **R-49** | **A24's Links row: four stands until the native-share redraw, and nothing inherits a maximum after it.** Two of the owner's own rulings touched one row and pointed different ways; the sequencing is the answer, and the redrawn row has one trigger so there is no count to cap | ⬜ A24 spec |
| **R-50** | **Greying has no "but this is a mode" exception.** The shared Data-group panels HID controls where the rule greys them; the panels change and every category inherits it. A user cannot see which of the two they are looking at, and a vanished control teaches nothing either way | ✅ `Appendix C` · ⬜ P0·5, P0·3 |
| **R-51** | **Image focus carries BOTH axes** — Centre · Top · Bottom **and** Centre · Left · Right. A wide photograph cropped tall loses its sides and a vertical-only control has nothing to say about which side survives | ✅ `Appendix C` · ⬜ A13 and every cropping design |
| **R-52** | **No sort module, and that is a decision rather than an omission.** A gallery shows the order its owner arranged. A module for one design would also have to differ from its own no-JS state, which is a cost with no gain | ✅ research `§2` |
| **R-53** | **One control name means one set of values, library-wide.** `rowDensity` carried five value sets in one category. A name is a promise about behaviour, not a label for whatever a design needed | ✅ `Appendix C` · ⬜ A17, A18 |
| **R-54** | **The post card's four DOM-order exceptions and its one truncation exception move into the shared card definition**, not four design specs. The fifth exception would otherwise be recorded somewhere nobody looks | ⬜ the shared card |
| **R-55** | **A24-5's picture-less band takes the page's own text colour** — the session invented it out of necessity and it is ratified. The rejected alternative would have made the design read as another design in its own category | ⬜ A24 spec |
| **R-56** | **A link to a page Ghost does not publish is AUTHORED, never assumed.** *(The owner's own answer, in place of the two options offered.)* Ghost has no all-tags route, so the row is a **Text Field for the label plus a Link Picker for the destination** — both already in the vocabulary — and **it does not render until a destination is set**, so it cannot ship broken | ✅ **FR-F8** (new, owned by E4) |
| **R-57** | **An author's post count may be shown, and a design may turn it off.** | ⬜ A26 spec |
| **R-58** | **A14's locked-control test is DROPPED.** R-33's greyed-with-a-reason rule already does the job and is library-wide; two overlapping tests would be worse than one | ⬜ A14 spec |
| **R-59** | **A24's seven carried items come back one at a time**, and only the ones that genuinely need the owner. Precedent: nine of the last set resolved against rulings he had already made | — mine |

**The owner's answer to D11 is better than either option I offered**, and worth recording as such: I
proposed dropping the link or pointing it at a page the owner must build. He asked for the label and
the destination to be editable — which needs **no new mechanism at all**, since the Text Field and the
Link Picker both already exist, and which generalises to every future link to a page Ghost does not
guarantee.

---

## A7 · The six architect rulings, and the A33 probe — 2026-09-03

These were never the owner's. They were held back from `LIBRARY-QUESTIONS.html` on the grounds that a
question about how a behaviour module is written is a technical ruling, and carrying it to a
non-engineer would be asking him to arbitrate an implementation detail.

| # | Ruling | Where |
|---|---|---|
| **R-60** | **`tabs` emits its heading ONLY where the panel does not already carry one.** Three designs draw their own — A5-12, A13-11, A15-10/15 — and announced the same label twice with JavaScript off. The module's heading exists to make the stacked state navigable; where the panel has one, that job is done. **The design's own heading is never dropped instead**, because that would change the WITH-JavaScript state too | ✅ research `§7` |
| **R-61** | **A module hides only the affordances IT ADDS, never a static element the design drew.** A5-14 Scroller refuses dots and offers a 3 px static rule; that rule is CSS, so it survives. The general form matters more than the case: **the no-JS state is the server-rendered state minus what the script would have created, and nothing else** | ✅ research `§7` |
| **R-62** | **`group-headings` MAY step the headings it groups, and must** — ratifying what the A18 pass assumed rather than overturning it. It is the only arrangement whose outline is correct in **both** states: nested with the script, flat peers without it, each describing that state truthfully | ✅ research `§7` |
| **R-63** | **Ghost's gallery row-ratio script is not a module and gets no registry entry.** Ghost ships it with the card; Inflozo neither writes, bundles nor budgets for it — the same treatment `cards.js` gets. A33 styles the result and declares no module | ✅ research `§2.2` |
| **R-64** | **Card corners come from the pack's radius token; per-card corners are declined.** A radius is a Style Pack decision, so a card opting out would be the one element disagreeing with everything around it — and per-card corners would be twenty controls whose only job is to disagree with the pack | ✅ FR-Q7 |
| **R-65** | **A33's unverified selectors, settled by execution** — see `MEASUREMENTS.md` §35 and register **57**. Four of the six confirmed on both majors; `kg-email-card` **does not exist on the web** and its selector is deleted rather than corrected; and Ghost 5 turns out to ship **two** renderers whose class sets differ on six card types | ✅ §35 · register 57 · ⬜ A33 spec |

**The probe found two things nobody had asked for**, and the second is the one that matters. `kg-nft-card`
is still in both builds while A33 draws twenty cards without it — a coverage decision rather than a fix.
And **Ghost 5 renders Koenig cards through two different renderers**, because a Ghost 5 site can hold
posts written before Lexical; header, file, product, video and embed emit different classes depending
which rendered the post. **An older Ghost 5 post therefore renders cards A33's selectors will not
match.** No specification mentions this. It is register **57** and it needs a ruling — style both
shapes, or state that the treatments are Lexical-only and say so where a customer can see it.

**Two rulings came straight out of the probe** *(owner, 2026-09-03)*:

- **R-66 · The card treatments target the CURRENT Ghost renderer only, and say so where a customer
  can see it.** A post written before Ghost 5's current editor keeps Ghost's own default card
  styling — readable, just not carrying the chosen treatment. The alternative was weighed and
  refused: a second selector set roughly doubles A33's stylesheet and its testing permanently, and
  **the header card would need different rules rather than a second selector**, since the older
  markup lacks the structure the treatments rely on. Ghost 5 is end-of-life, so the affected set
  shrinks on its own.
- **R-67 · `kg-nft-card` stays unstyled, deliberately, and the spec records that.** It keeps Ghost's
  default appearance. Six treatments for a card almost no customer will insert is work spent in the
  wrong place; recording it as a decision is what stops it being re-raised as an oversight.

## A8 · The stress test before the last pass — five more rulings, 2026-09-03

Before sending pass five out, every ruling was traced to a spec that would carry it, and every
category was checked for work the pass did not cover. **The test found the pass incomplete**, which
is what it was for: three rulings made the same day had no home, four categories with outstanding
work were not in the pass at all, and P0's own session had raised three sharp questions about the
2026-09-03 rulings that nobody had answered. Six categories — A7, A20, A25, A27, A28, A34 — came
back genuinely finished and are correctly absent.

**All five below are architecture, not product.** None went to the owner, because each follows from a
rule already made rather than needing a decision he has not taken.

| # | Ruling | Where |
|---|---|---|
| **R-68** | **Greyed or not offered — the test is whether the control could EVER do anything in this design.** Could-never → not drawn, panel says why. Could-but-not-now → greyed with the reason. Structural versus stateful. The dark-mode switch under a pinned scheme was the first case, not the only one — Image focus on a design that never crops is the second. **An empty list is neither**, so a picker with nothing picked stays the empty list it is | ✅ `Appendix C` · ⬜ P0 |
| **R-69** | **A greyed control whose value in force is not one of its own values names it in the reason and marks no value.** Order at Hand-picked: the order in force is the dragged one, neither Newest nor Oldest. Ratifies what P0 drew provisionally; the alternatives were inventing a third value or marking one not in force | ✅ `Appendix C` · ⬜ P0 |
| **R-70** | **A design that runs to a bleed edge may square an image the pack would round, and inverts its focus ring to an inset offset.** Both are consequences of the bleed rather than departures from the pack: an outward ring is clipped at the viewport, and a rounded corner leaves a visible gap. R-64 governs cards that could follow the pack and choose not to; this is a design that cannot | ⬜ A17 |
| **R-71** | **A12-15 Groups describes its ungrouped arrangement instead of naming design 1.** It is the same correction already ruled for 13 Rail, and the session was right to stop: no corrected wording existed to align to when it was asked. There is now. The editor may still advise "1 Grid reads better here" — AD-37 permits exactly that | ⬜ A12 |
| **R-72** | **An excerpt revealed on hover is CSS, not a module.** Already on research `§2.2`'s list of behaviours needing no JavaScript; A17's finding closes by pointing at it rather than by anyone writing a module | ⬜ A17 |

**What the stress test changed about pass five.** It grew from 24 prompts to 28: **P0, A13, A17 and
A18 were missing entirely**, and A5, A12, A14 and A15 were carrying only the sweep when each had a
ruling owed. Had it gone out as built, a sixth pass would have been certain.

## A9 · Pass five verified, 2026-09-03 — and one thing two sessions found on their own

**The Image-focus sweep is COMPLETE.** 27 categories reference `P0·9`; **none carries a private copy
of the values.** All eleven extra-work items landed, checked one at a time rather than by a count:
P0's three questions, A4's and A6's Actions layers, A5's two registry rulings, A12's naming fix,
A13's double announcement and empty-state resolution, A14's sort answer, A15's headings, A17's
bleed-edge rulings, A18's `group-headings` contract, and A33's selectors.

**A33 is exemplary and worth recording as the pattern:** its four surviving `kg-email-card` mentions
are all the specification *recording that the selector was deleted*, which is precisely what a raw
count would have mis-read as a failure. So is A6's surviving `Both · Primary`, which is the shared
floor saying it quotes the old list **only to show the mapping**.

**ONE THING REMAINS, and neither session invented an answer to it.** A4 and A6 independently reported
that their per-design **frame captions** still read `actions Both` — the retired value name — in the
settings snapshot each frame carries (*"drawn at padding Comfortable 96, ground Background, title
Large 40, actions Both"*). **28 frames: A4 fifteen, A6 twelve, and A6·0.** A7·12 also matches a search
for it and is **not** an instance: A7's Actions is a single-axis control the split never touched, and
the migration record says so.

Both sessions asked the same question and refused to answer it: **is a frame caption a control table,
or prose describing the state that frame is drawn in?** The caption also carries `padding` and
`ground` — rows the universal trio retired — so A6 argued the whole line is a dated snapshot, and
that correcting one value inside it without a ruling would leave a half-updated record reading as
current. That is a better objection than the finding itself.

**RULED 2026-09-02 (R-73): a frame caption is a DESCRIPTION, not a specification, and it does not
track control vocabulary.** It records how that frame was drawn on the day it was drawn — *"padding
Comfortable 96, ground Background, actions Both"* — and nothing is built from it: the control names
come from the specification and from P0, both of which are correct. All 28 captions stay as they are.

The two sessions' objection is what decided it. The caption already carries **`padding`** and
**`ground`**, which are the *old row names* for what are now **Vertical spacing** and **Background
role** — so the line is written in the vocabulary of its own day throughout, not current text with
one stale word in it. Correcting only the Actions value would have produced 28 captions that read as
current and are not, which is worse than 28 that are visibly of their date. **The panels are what
would have mattered, and all 36 were redrawn in the split.**

Recorded here so no later pass raises it again.

---

## A10 · Two standing rulings from the owner, 2026-09-02 — design fidelity, and static before dynamic

Ruled directly by the owner in the session that wrote step 5's prompt. Both are **process rulings
binding until the project finishes** — they outlive step 5 and govern every remaining step.

**R-74 — the Claude Design export is the design authority for every surface, for the remainder of
the project.** The UX and the built product must match what Claude Design drew, to the maximum. A
surface with no frame is **extrapolated from the nearest frame that exists** — same components,
same tokens, drawn in the same Claude Design project — never invented beside it. Any session doing
any design work refers to the export folder first. This elevates the 2026-08-31 standing note
("the design export is the starting material, not a reference to consult") from step-5 guidance to
a project-wide ruling: it binds step 6's stories and every implementation epic, each of which must
name the frame its surface is built from.
- Targets: `CLAUDE.md` (the design-export section states the ruling) · `build-sequence.md` steps 5,
  5b and 6 · `STEP-5-PROMPT.txt` · at step 6, every story with a surface carries a "matches the
  frame" acceptance criterion (owed when step 6 runs).

**R-75 — the owner sees the product's own UI as static pages on his machine before it is built
dynamically.** Clarified by the owner in the same session, and the clarification is the ruling:
this is **not** about browsing the exported design frames — it is **Inflozo's own interface, as the
final product will have it**, viewable statically in a local browser first. The mechanism: once
step 5's spines are final, a **static clickable prototype** is built (step 5b — its prompt is in
`build-sequence.md`): one plain HTML page per app surface, linked so the four journeys and the
eight flows can be walked by clicking, built from the export's tokens and components only (R-74),
and self-contained so a **double-click opens it** — no server, no install, no build step. **Step 6
does not open until the owner has walked the prototype**; what reads wrong there is fixed in the
spines and the prototype before a story is written, because a wrong screen is cheapest the moment
before anyone builds it.
- Targets: `build-sequence.md` gains step 5b with its prompt · `STEP-5-PROMPT.txt` notes the
  hand-off and requires stable surface names the prototype can key off · `tools/view-designs.py`
  (a small utility for *sessions* to eyeball export frames over HTTP — explicitly **not** the
  owner's deliverable; his deliverable is the prototype).

---

## A11 · Step 5 — four rulings, and one control that was blind for a third time, 2026-09-03

Taken while authoring the UX spines (`ux-designs/ux-Inflozo-2026-09-03/`). **Three went to the
owner because neither the PRD nor the export settled them; one is architectural.**

| # | Ruling | Where it lands |
|---|---|---|
| **R-76** | **Inflozo's own editor is a DESKTOP AND TABLET surface, and the floor is designed.** **The floor is a device test, not a width test** *(refined 2026-09-03 by step 5's own stress test, and it does not reverse the ruling)*: on a **coarse pointer at a small viewport** a project opens onto a notice that says the editor needs a wider screen and offers what does work from a phone — deploy history with one-tap rollback, the sites list, billing; on a desktop-class device **the editor holds at 200 % browser zoom**. Stated as a bare 1024 px it would have evicted a low-vision user for zooming (**WCAG 1.4.4**), which is the opposite of the ruling's purpose. **And the export draws the editor at 1440 and nowhere else** — so R-76's *tablet* half was asserted with no frame behind it. Prompt **A8** draws 834 and 720. **Width amended 2026-09-04 by R-87 (§A15):** the threshold is **834** — a coarse pointer below 834 (a phone) gets the notice; a tablet at 834 and above gets the editor as D8a draws it. Sign In, Dashboard, Billing, Suggestions and every marketing page stay fully usable at 390. **This follows what was drawn rather than deciding against it:** `S1`, `S3` and `M1`–`M9` each carry a 390 frame and `S4`–`S14` carry none | ✅ **`prd.md` FR-D1** · ✅ `EXPERIENCE.md` § Foundation, § Responsive & Platform · ✅ prompt **A4** drew **Small Screen Notice** (D4f, landed 2026-09-04); 5b and 5c lift it, and 5c hands a coarse pointer below 834 to it |
| **R-77** | **Site Remix drops the drawn "Keep Free designs only" tick-box.** Remix always re-rolls from the whole library; FR-L3's exit sheet catches Pro designs at the exits, which is the mechanism the product already has. `B8` drew an affordance no requirement carries, and the owner declined to adopt it | ✅ `EXPERIENCE.md` § *Drawn, but on the wrong mechanism* · **no PRD change — FR-D17 is unaffected** · ⬜ `B8` loses the row (prompt **A7**, item 6's canvas) |
| **R-78** | **Redesign proposals build FR-C7 as written** — 2–3 **whole-site** starter × Style Pack combinations on the user's real content, which must differ in layout structure. **`B22`'s card, its NOW / PROPOSED pairing and above all its argued-from-your-own-data sentence are kept**, one per combination instead of one per section. Its per-section swap model is not built | ✅ `EXPERIENCE.md` § *Drawn, but on the wrong mechanism* · **no PRD change — FR-C7 is confirmed as written** |
| **R-79** | **The deploy-history pinning decision's home is `prd.md`, not `BACKUP-GATE.md`** *(architectural — the owner decided the substance on 2026-08-21 and this is propagation, not a new decision)*. §37.7 recorded it as a `prd-defect` and it was still true: a story written from the PRD alone would have built a history with no pin control. **FR-J7 now carries all three rules** — the limit is stated not implied, the history never shows a version it cannot restore, and at most N−1 may be pinned with a visible refusal — and **FR-J9 carries the surface**, including the two rows that are not ordinary versions | ✅ **`prd.md` FR-J7 and FR-J9** · ✅ `EXPERIENCE.md` F8 · ⬜ prompt **A2** (D2a/D2b) draws the pin and its refusal; 5b names them and draws nothing (R-74), 5c holds them out until the export carries them (F-090) |

### Also from this pass — and one of them is a control failing for the third time

**§37.7 re-verified against the export as it stands today.** §A4's line "the S, B and M screens were
not touched by the design pass" **has gone stale**, exactly as step 5's prompt warned: two
re-exports since (2026-09-01 and 2026-09-02) touched `B Missing Surfaces`, `M1`, `M2`, `M4`, `M5`,
`S2`, `S5` and `S12`. Verified by `git log --since=2026-08-31 --name-only`, not assumed.

**ONE SURFACE §37.7 CALLED MISSING IS DRAWN.** The **Paywall editor** (FR-H6) exists at
`C Post Body.dc.html` region **C3a** — the canvas at 1440, its six controls, three of the twelve
designs, and the no-paid-tiers empty state. Its entry point is drawn twice more, and it sits in a
left-nav group the rest of the export does not show: **Template surfaces** (Paywall · Cards · Error
pages), which is also the entry point for `S14` and the error canvases and is where FR-Q9's
treatment fallback lands. Two more are **partially** drawn: the Template Switcher has a single
"Members" entry where FR-D6 needs three canvases plus a conditional Private; and the content-source
pill's menu exists but has no subject picker. **Every other item on §37.7's frameless list was
checked one at a time against the current export and is genuinely absent.**

**A LIBRARY TOTAL WAS PRINTED IN PRODUCT COPY, AND BOTH CONTROLS WERE BLIND FOR THE THIRD TIME.**
`S3 Dashboard`'s empty state read *"Yours starts with **485 gorgeous designs**"* — the exact string
Appendix H names a canonical replacement for — and `B Missing Surfaces` read *"**415 Pro designs**
each need a named Free fallback"*. Neither had ever been caught.

- **Why:** `leftovers()` in `tools/reapply-export-edits.py` (and `verify-design-pass.py`'s
  `§37.7 no design total` check, which reads it) required the noun to **abut** the number. One
  adjective walked past it.
- **The history matters more than the instance.** The first version matched raw HTML and missed a
  number split across two `<span>`s. The second read rendered text and missed an adjective. **Three
  misses, one rule, one mechanism.** A control that cannot fail is not a control (standing rule 2).
- **Fixed:** up to two words may now sit between the number and its noun, and the three fixed
  breakpoints (390 · 834 · 1440) are excluded by name so a frame caption reading "· 1440 Find a
  section" is not a false positive. Both strings are in the substitution table; `S3`'s becomes
  Appendix H's canonical *"hundreds of gorgeous sections"*.
- **Not fixed, and reported rather than touched:** four A-category frames (`A18-3`, `A18-9`,
  `A18-11`, `A29-10`) carry "485 designs" in their own **design commentary**, which is not product
  copy and is out of step 5's scope. They are stale (the library is not 485) and belong to a library
  pass, not to this one.

**The plan matrix drifted on the frames and Appendix F.1 governs.** `S11c` says Pro connects up to
**3**; `S12a` says **unlimited** projects and **full** history; `S12b` and `M5` say **1 / 3** sites
and **Last 2 / Full** history; Free's 100 MB storage cap appears on no screen at all. F.1 is "the
sole definition of Free/Pro gating" and `EXPERIENCE.md` restates it once, as the product limits it
is required to show. The frames are not hand-edited for this — step 5b's prototype renders the
correct figures, and prompt **A7** is where a Claude Design pass would catch the frames up.

**AND THE STRESS TEST AFTER IT FOUND THAT THE FIX HAD BROKEN A RULE OF ITS OWN.** The owner asked
whether any accessibility fix changes the design. **Three did**, and one of them was a straight R-74
breach committed while closing a WCAG failure:

- **The export draws the editor at 1440 and at NO OTHER WIDTH** — verified frame by frame, not
  assumed. So **R-76's *tablet* half was asserted with no frame behind it** the moment it was
  written, and the accessibility fix then widened the hole: an editor that must survive 200 % browser
  zoom has to work at roughly 720 CSS px. **Two layouts described in prose that nobody has drawn**,
  which is precisely what R-74 forbids. Both now go back to Claude Design as prompt **A8**, with the
  spine saying plainly that until it runs they are specification without a frame.
- **The skip link and the Assets keyboard path are new visible elements**, and the Layers focus state
  and a destructive confirm's opening focus are states no frame shows. All four joined **A8** rather
  than staying prose.
- **R-76 was left stated three ways and two of them stale.** The device-test refinement landed in
  `EXPERIENCE.md` only; `prd.md` FR-D1 and this section still said a bare "below 1024 px", which is
  the version that fails WCAG 1.4.4. **Propagate, never localise — and a fix propagates no better
  than a feature does.** All three now agree.

**Four more defects the stress test found, none of them accessibility:** the **deploy-only** path was
named on the destination card and specified nowhere, so the wizard had one ending where FR-J8 gives
it two (fixed, and the confetti question it raised is settled by Appendix H's own string — the toast
says *Live*, so it fires on the first deploy that makes the site live); **`S10b`'s "up to 30 MB
each"** was missing from the plan-drift list where `Appendix F.1` caps uploads at 10 MB on both
plans; **browser zoom and canvas zoom** sat four lines apart with nothing distinguishing them; and
**prompt A7 could be read as licence to edit the frame captions**, which **R-73** forbids — it now
says so.

**THE REVIEWER GATE FOUND A SCOPE MISS, AND IT IS THE ONE WORTH REMEMBERING.** One accessibility
lens ran over the spines at Finalize. It found eight real defects, six of them in the spine, and the
worst was not a quality problem but a **deliverable that was never delivered**: **`prd.md` §7.3 says
in as many words that "the focus order is a UX-pass deliverable"**, and names three parts — the
canvas reachable and escapable by keyboard, selection surviving the chrome taking focus, and the
mark toolbar operable without destroying the iframe selection it acts on. The first draft answered
none of them. **§7.3 sits in the architecture-direction section**, not in §5's requirements and not
in step 5's own source list, and the pass read the FRs and the NFRs. *A UX-pass deliverable stated
only inside a technical-assumptions section is easy to walk past — worth knowing before step 6
reads the same document for stories.* All eight are fixed; the record is
`ux-designs/ux-Inflozo-2026-09-03/review-accessibility.md`.

Two of the eight were **WCAG failures axe-core cannot detect**, so the zero-violations threshold
would have passed over both: eight unmodified single-character shortcuts with no remap and no
disable (**2.1.4**, Level A and therefore inside the AA threshold), and R-76's floor stated as a CSS
width, which would have evicted a user at 200% browser zoom (**1.4.4**). The floor is now a **device
test rather than a width test** — that narrows how R-76 is measured and does not reverse it; the
owner was told in the same session.

**ONE ITEM IS LEFT OPEN AND HAS NO OWNER YET.** **NFR-6(d)'s E2E list names no accessibility
journey** — auth, connect, build, shuffle, dark authoring, deploy, rollback, billing and quotas, all
mouse-driven. `EXPERIENCE.md`'s accessibility floor now names a verifier for every item it states,
and **four of those verifiers are an E2E pass that does not exist in NFR-6(d)'s list**. Adding one
keyboard-only journey is the smallest fix. **It is an NFR amendment and step 5 did not make it** —
it is recorded here so it is not lost, and it belongs to whoever next opens NFR-6.

**One name moved, and §A10 is left as written.** `STEP-5-PROMPT.txt` was a generated file — the
board writes the prompt for whichever step the owner is currently on — and step 5's prompt block
became a completion record, so it lost its source. It is now `STEP-5B-PROMPT.txt`, and
`tools/build-board.py`'s `PASTE` / `PASTE_ID` carry a comment saying to move them again when 5b
completes. **§A10's target lists still name the old file and are not edited:** they record
accurately what R-74 and R-75 named on 2026-09-02, and correcting them would falsify that.

**Nothing in either spine contradicts this file.** Every ruling R-1 … R-75 that touches a surface,
a control, a count or a piece of copy was read before the spine was written, and the four reversed
approved decisions (§B: D3, D17, D26, D27-in-half) were checked before any document citing them was
relied on.

---

## A12 · The step-5b/5c review — six decisions, 2026-09-03

A twelve-lens review of the static prototype (5b) and the clickable walkthrough (5c) produced
verified findings (`F-0xx`, `R2-…`); the owner ruled on the six decisions they raised, taking option 1
on every one. Each row names its targets so a later session can tick them. ✅ landed in this pass ·
⬜ owed to the named agent or to the owner. Ruling numbers R-1 … R-79 are unchanged.

| # | Decision | Where it lands |
|---|---|---|
| **1** | **Fix the generators and the documents first, then walk.** The findings that were reproduced are fixed at their source — the generator, never an emitted page — before the owner opens 5b | ✅ this file · ✅ `EXPERIENCE.md`, `DESIGN.md`, `prd.md`, `ARCHITECTURE-SPINE.md` AD-20, `BACKUP-GATE.md`, `VERIFY-AT-BUILD.md` items 1, 2, 59–61, `MEASUREMENTS.md` §37 (the rows below say which) · ⬜ `prototype/build.py`, `walkthrough/build-app.py` (the generator passes) · ⬜ the walk itself (owner) |
| **2** | **The plan-limit strings the frames draw wrongly are patched in 5c to Appendix F.1 at lift time**, each patch carrying a comment naming this decision; the frames catch up in A7 | ✅ `EXPERIENCE.md` § Plan limits ("In the walk") · ✅ A7 item 20 · ⬜ `walkthrough/build-app.py` (the patches) |
| **3** | **5b is R-75's gate, and "walked" means every journey and every flow on its front door, with the owner's notes in one named file** | ✅ `build-sequence.md` step 5b (the definition of done) · ⬜ `prototype/index.html` (the front door lists them) · ⬜ the notes file (owner) — landed 2026-09-03 by the docs pass; the walk itself 2026-09-04 (§A13) |
| **4** | **An accessibility item that would change a frame goes to Claude Design prompt A7, not A8**, because it corrects an existing frame; nothing in 5b or 5c alters what a frame looks like | ✅ `EXPERIENCE.md` Appendix A7 items 7–10 (focus-ring token, accessible names, labels, placeholder colour) · ✅ A8 FRAMES 3 and 5 inherit A7's ring · ⬜ 5c may add attributes only, each naming its finding |
| **5** | **FR-J13's gate offers the theme and `routes.yaml` downloads only when the Staff Access Token is present, and otherwise names the Ghost Admin path** (F-077 — FR-J13 and `BACKUP-GATE.md` had disagreed) | ✅ `prd.md` FR-J13 · ✅ `BACKUP-GATE.md` § What the gate offers as a download · ✅ `EXPERIENCE.md` F7 and A1 FRAME 4 · ⬜ `prototype/build.py` backup-gate note · *recorded for the owner:* `routes.yaml` alone is readable with the integration key (`MEASUREMENTS.md` §37) |
| **6** | **The wrong-mechanism frames are held out of 5c until A7 runs, except copy the PRD owns**: Redesign Proposals (B22) held out entirely; the Pro Exit Sheet stays and its remedy count is A7's; the Starter Chooser stays and its roster is A7's; S4d's paid-tier rows are A7's | ✅ `EXPERIENCE.md` § Drawn, but on the wrong mechanism (preamble; S4d and B23a marked → A7) · ✅ A7 items 18 and 19 · ✅ `walkthrough/build-app.py` and `_screens.html` — B22 and B18 lifted once A9 corrected them (2026-09-04) |

**Also taken by the pass, as routine judgement rather than owner decisions — flagged here so they are
visible:** (a) **AD-20 gains the compile-once rule** — Pre-flight is the `compiling` and `checking`
stages of the deploy job, Ship it resumes the same row at `uploading` (F-075; the architect's call,
made because `S8b` and FR-J8 disagreed and a story writer would have picked one); (b) **F2's holder
countdown restarts on interaction rather than stopping**, the smallest rule consistent with
`addendum.md` §AD2 (F-079); (c) **the persistence indicator's printed labels are B6's** and Appendix H
now carries them, FR-D10's names being state names (F-080); (d) **the Staff Access Token is per user
and an Administrator's suffices** — a Ghost fact, cited, correcting FR-C1, §3 and the A1 prompt
(F-063); (e) prompt A7's numbered items are its count, and the Appendix A preamble no longer writes
one down.

## A13 · The walk — 2026-09-04, and R-80

The owner walked the step-5b prototype on **2026-09-04** and wrote the date under `build-sequence.md`
step 5b, *The walk* — R-75's gate. With it he left a note, quoted verbatim there: *"There are some
issues in UI that owner found. But instead of fixing them now and doing more Claude Design passes, we
will fix them during development of their respective stories."*

**R-80 — a finding the owner makes about the UI is fixed in the story that owns its surface, not by a
further Claude Design pass.** *Amended the same day, by the owner:* he does not write the walk's findings
down in advance. **Every UI story is tested by him on the deployed site after it is built**; he reports what
he finds; those findings are fixed inside that story before it is done. The mechanism is the spec: every
story with a screen carries `## Owner's manual test` (numbered steps — URL · screen · what to do · dummy
data · what should be seen), `owner_test: pending` in its frontmatter until he has tested it, and his
findings under `## Owner's test findings` with `owner_test: issues` until they are fixed and `passed` when
he accepts. `ux-designs/WALK-NOTES.md` stays as his optional notebook for the prototypes; it is no longer the channel. **This amends §A12 decision 3:** "walked" is the date on the line under *The walk*, which he wrote on 2026-09-04; the notes file was optional and unused. The Appendix A prompts are unaffected and still run as two sessions, A7 with A8 and then A1
to A6, in parallel with the stories.
- Targets: `build-sequence.md` step 5b (*The walk*), the step table, the outstanding table, step 6
  (*Needs from the owner* and its prompt), step 7 (the loop) · `HANDOVER.md` · `CLAUDE.md` ·
  `docs/project-context.md` · `_bmad/custom/bmad-build.toml` and `bmad-build-auto.toml` (the committed team layer) ·
  `tools/build-board.py` · `ux-designs/WALK-NOTES.md` (its purpose line). ✅ all landed 2026-09-04.

## A14 · The development loop — four rulings, 2026-09-04

Given by the owner in the same message as the amendment above, while the Claude Design sessions run.
Each binds every story from the first one, and each is bound where the work happens — inside the BMAD
skills through `docs/project-context.md` (loaded as a persistent fact by `bmad-build`, `bmad-build-auto`, `bmad-code-review`, `bmad-create-epics-and-stories` and `bmad-sprint-planning`) and the committed `_bmad/custom/*.toml` team overrides — not only in prose.

**R-81 — after every story phase, commit and push to `main`.** Create, dev, review, deploy, owner test,
fix, done, and any other status change. One-line message, always this shape: `Story <epic>.<story> -
<Phase> - <one line about the story>`; Phase is one word from *Create · Dev · Review · Deploy · Test · Fix · Done · Blocked*. Work that belongs to no story commits as `Hotfix - <one line>`, a retrospective as `Epic <N> - Retro - <one line>`; a `commit-msg` hook in `tools/hooks/` rejects any other shape that starts with Story, Step, Hotfix or Epic. The gate runs first and is never pushed red.
- Targets: `CLAUDE.md` (Git workflow) · `docs/project-context.md` · the three `.toml` overrides (`on_complete`) · `build-sequence.md` step 7 · `HANDOVER.md` · `tools/hooks/commit-msg`. ✅ landed 2026-09-04.

**R-82 — the review phase and the test phase run on the real infrastructure, never on mocks alone.** The
owner has put the keys in `tools/probe/.env` (Supabase, Vercel, Resend, Dodo, and the Ghost test servers
T1 and T3; Ghost(Pro) is still empty). A spec's `## Verification` names the real services it hit and what
they returned; every review carries a *Real-infra verifier* layer that executes those claims with one
negative control. This restates for stories what NFR-6(d) already says for E2E: pre-launch, the stack
under test is production.
- Targets: `CLAUDE.md` · `docs/project-context.md` · the three overrides (`review_layers`) ·
  `build-sequence.md` step 7 · `HANDOVER.md`. ✅ landed 2026-09-04. Ghost(Pro) keys: still owed to the
  register's launch gate.

**R-83 — every question to the owner, in every phase, is plain English with an example, numbered
options, and the recommended option or combination marked (RECOMMENDED).** He reads and rules. In a story
the question lives under `## Questions for the owner`, which the story board surfaces; the unattended
loop never decides one — it halts with the question written.
- Targets: `CLAUDE.md` (How the owner wants to work) · `docs/project-context.md` · the overrides ·
  `build-sequence.md` step 6 prompt and step 7 · `HANDOVER.md`. ✅ landed 2026-09-04.

**R-84 — the story board is the tracker.** `_bmad-output/planning-artifacts/STORY-BOARD.html`, generated
by `tools/story-board.py` from `epics.md`, `implementation-artifacts/sprint-status.yaml`, the spec files
and `git log`, and regenerated by the gate so every commit carries a current board. It shows every epic
and story, colour-coded by status, without much scrolling; a story opens to its plain-English scope, its
acceptance criteria, its commits, its questions for the owner and — when it is his to test — the manual
test script with URLs, screens and dummy data; each phase's prompt is copyable from the card. The phase
prompts are extracted from `build-sequence.md` step 7, never retyped.
- Targets: `tools/story-board.py` and the page · `tools/doc-audit.py` (catalogue and the generator
  list, so the gate regenerates it) · `build-sequence.md` step 7 · `HANDOVER.md` · `CLAUDE.md` ·  `tools/build-board.py` (the step-6 action points at it). ✅ landed 2026-09-04.

**R-85 — in the library epics a category is a run of consecutive one-session stories, and the owner
tests every one as it lands.** Ruled 2026-09-04 (option 2a of the question the BMAD research raised —
`BMAD-BEST-PRACTICES.md`), after the owner asked whether it beat the recommended "one story, several
plans" and was told it did: the method's tooling keys everything on one story being one plan and one
session, and a mistake in a category's shared content model surfaces at its first story rather than its
last. The first story of a category delivers its content model, its stylesheet and the first designs; each
later story adds the next designs and their behaviour modules; stories open in order, each after the
previous one is `done`; the category's owner gate (§4) is its last story's test plus the automated sheet
across the category. There are still as many owner gates as there are categories. §8's previous
"one story per category" is superseded.
- Targets: `prd.md` §8 *Story granularity* · `build-sequence.md` step 6 prompt and step 7 (the gate
  paragraph, the Create prompt) · `_bmad/custom/bmad-build.toml` and `bmad-build-auto.toml` ·
  `BMAD-BEST-PRACTICES.md` · `tools/story-board.py` (its rule — the first open story in E9/E10 gets a
  prompt, later ones wait — already models a chain of stories, unchanged). ✅ landed 2026-09-04.

## A15 · The Appendix A export — verified 2026-09-04

The two Claude Design sessions `EXPERIENCE.md` Appendix A asked for ran on 2026-09-04 — **A7 with
A8, then A1 to A6** — and one export of the whole project replaced the repository's copy the same
day: `design/claude-design-export/Inflozo/` is the new export and `InflozoOld/` the previous one,
kept beside it for exactly this comparison. **Seven canvases are new** — D1, D2, D3, D4, D5, D6 and
D8; there is no D7, because A7 corrected frames that already existed — and **twenty-seven frames
changed** (S1–S14, M1–M8, B, C, the Calibration Set, the Editor Sidebar Kit and the Index).
P0-0 … P0-9, R, M9, every A-category frame, every kit and `interactions.js` are byte-identical, so
A7's instruction not to touch the settings-snapshot captions was kept by construction. **Every
verdict below was read from the frame, old beside new** — the tag-stripped text for copy, the raw
markup for attributes and tokens — never from the prompt (cite or execute). `tools/verify-design-pass.py`
was run against the new export: every structural check passes, the same five prose scans want a
glance as before, and the §37.7 library-total check reports PASS — falsely; see below.

### One row per prompt

| Prompt | Canvas · frames | What landed | What did not, or landed wrong |
|---|---|---|---|
| **A1** | `D1 First-Deploy Gates.dc.html` — D1a Destination first deploy · D1b Safety net offer · D1c Safety net declined · D1d Backup gate self-hosted · D1d′ Shortcut ticked · D1e Backup gate Ghost(Pro) | All five asked-for frames and one more (D1d′, the shortcut ticked — welcome). The six-step rail "1 Destination · 2 Safety net · 3 Backup · 4 Check · 5 Ship · 6 Live". D1a: `inflozo-orbit-weekly` under "Theme to be created", with "This name is permanent for orbitweekly.com. Renaming the project later changes its name in Inflozo only." D1b: heading and body verbatim; "It is a full-Administrator credential: anything that user can do in Ghost Admin, this token can do."; a mono token field; the screenshot; **"Add the token" and "Not now" as two buttons of the same weight**. D1c: "Continuing without the token — Deploys work exactly the same. Three things won't be available:" with the three rows, "You can add it any time from Manage keys.", one button "Continue", captioned "raised once, never again". D1d in the order (a)–(e): "Inflozo writes exactly two things to your Ghost site: your theme, and routes.yaml. It never writes posts, pages, members, tags, settings or redirects." first; the recommendation with its reason; the `ghost backup` row — "I have run ghost backup and saved the archive somewhere off the server." and "Ticking this ticks every row below and leaves them on screen"; seven rows marked INFLOZO REPLACES THIS and INFLOZO MAY OVERWRITE THIS, with "The JSON export does not include your images." and "The gap most people miss.", each describing what to look for and linking "Ghost's help on … ↗" — **no Ghost Admin menu path anywhere**; Download on the Theme and routes.yaml rows only; the disabled master confirm and "3 rows still to tick, then the confirmation above." over the greyed step button. D1e: "Ghost(Pro) · orbitweekly.com", the sky block verbatim and "This is not something Inflozo can fix, and we are not going to pretend otherwise." in ink, **no Download button anywhere** (its caption says so), a Database row reading "NOT YOURS TO TAKE … nothing to tick" | Nothing. *(The greyed button under the gate is the wizard's own "Run checks" — step 3's next button — rather than a button labelled deploy; that is the right button to block at step 3.)* |
| **A2** | `D2 Deploy History Completed.dc.html` — D2a History pinning Pro · D2b Pin refusal · D2c History Free plan · D2d Partial success row · D2e Activation failed · D2f Deploy only ending | D2a: a pin on every row, v9 and v3 PINNED (two of ten); above the list "Your original theme · casper 5.9.4 · Archived Aug 2 · Restore original" with "Kept outside your version limit. Ghost checks every theme on the way in, so a very old theme can be refused — we'll offer the zip if that happens."; the footer "Pro keeps the last 10 versions. Free keeps the last 3. Older versions are removed, not hidden — an Inflozo theme can't be rebuilt later, so this is how far back you can go." D2b: "One version has to stay unpinned so your next deploy has somewhere to go. Unpin another first." · "Got it" · "The pin stays unfilled." D2c: three versions, v2 pinned, the original row, the limit line, no upgrade prompt. D2d: the "Uploaded, not live" chip, "Re-activate" where Roll back was, "Your theme is on your site but isn't live yet." D2e and D2f drawn side by side — "Your theme is on your site but isn't live yet." with "v5 uploaded cleanly. Ghost didn't switch to it, so orbitweekly.com is still serving v4 — nothing on your site changed.", and "Uploaded. Not live yet." with "v5 is on orbitweekly.com and v4 is still what readers see. Make it live whenever you are ready."; Ship complete and Live incomplete on both rails; "Re-activate v5" · "Leave it for now"; "no confetti on either"; the one history row drawn under both | Nothing |
| **A3** | `D3 The Drift Report.dc.html` — D3a Drift found · D3b Could not verify · D3c No drift | D3a: heading and body verbatim; CHANGED 3 · ADDED ON YOUR SITE 1 · REMOVED FROM YOUR SITE 1, every row led by the layer name — "Home hero", "Latest issues", "Three Column footer" — with `partials/section-hero-1.hbs` and its siblings in mono beneath; a non-section file reads "Stylesheet · assets/built/screen.css" and an added one "A template Inflozo didn't write · custom-longform.hbs"; "Cancel · Download the live theme first · Overwrite and ship anyway", the last in primary ink, not danger; **the deploy stops** ("Shipping replaces all five with Inflozo's versions."). D3b: "Couldn't check whether your live theme changed." · "We need a Staff Access Token from the site Owner or an Administrator to read the live theme, and this project doesn't have one. Shipping anyway." · "Add the token", between passing rows with "Ship it" live, captioned "Sky, not marigold and not danger: this is a check that didn't run, not a check that failed." D3c: "Nothing changed on your site since v4 — pass" at the weight of "Ghost 6.x compatible". The rename note is drawn: "A layer rename produces no drift, so the list never shows one." | Nothing |
| **A4** | `D4 Dashboard Sheets and Blocks.dc.html` — D4a New project sheet · D4b Free at the cap · D4c Over limit sheet · D4d Which project editable · D4e Read-only project · D4f Small screen notice | D4a: four doors with their consequence lines — "Ten full sites, ready to wear your brand." · "An empty page and every design." · "A copy to try things on, with nothing at stake." with a project select · "We look at your posts and suggest whole-site designs." greyed with "Connect a Ghost site first." and "Connect a site"; the Style Pack row of pack cells (Ag Paper · Ag Tangerine · + New pack) with "Change it any time, in any project."; "Cancel" · "Create project". D4b: all four doors greyed, each with "Free includes 1 project"; "Free includes 1 project. Pro gives you 25." · "Go Pro — $15/mo". D4c: heading and first line verbatim; "Projects 6 of 1 · Choose which one stays editable", "Connected sites 2 of 1 · Disconnect one", "Assets 312 MB of 100 MB · Delete some files", "Stored versions 8 of 3 · Nothing to do — we keep these, we just won't add more."; "Rollback, restore and export keep working the whole time."; "Sort it out myself" · "Go Pro — $15/mo". D4d: six projects with site badge and "Updated …", the newest pre-selected, "The other five stay viewable and exportable — you just can't edit them until you're on Pro.", "Keep this one editable". D4e: "Read-only — this project is over your Free plan's limit." · "Make this the editable one" · "Export theme zip", captioned "canvas legible, sidebars at 55%, export live". D4f at 390, captioned **"FIRES ON A COARSE POINTER AT A SMALL VIEWPORT, NOT ON WIDTH ALONE. A desktop user at 200% zoom has a ~720px viewport and gets the editor, never this card."**; "The editor needs a bigger screen." with the body verbatim; "WHAT WORKS HERE — Deploy history … Roll back to v4 · Your sites · Billing" | Nothing missing. *(D4f's ink line drawing is not verifiable from text and was not checked.)* |
| **A5** | `D5 Canvas Markers and Template Switcher.dc.html` — D5a Auto-generated marker · D5b Template switcher · D5c Main feed marker · D5d Page 2 preview · D5e Preview subject picker · D5f Empty template warning | D5a: "Auto-generated — edit anything to make it yours" beside "Template Tag" in the top bar and at the head of "LAYERS · TAG", captioned "both vanish on the first edit". D5b: Home · Post · Page · Tag · Author · **Membership as a group of Signup · Signin · Member home** · 404 · Private · a rule · "FROM THE ROUTES MANAGER" · New template; every hollow dot carries the word "Auto-generated"; "PRIVATE APPEARS ONLY ONCE A PRIVATE SITE GATE SECTION HAS BEEN DESIGNED · OTHERWISE THE ROW IS ABSENT, NOT GREYED". D5c: the MAIN FEED chip on the canvas outline and on the Layers row; the greyed Count with "This feed is sized by your theme's Posts per page. Change it in Theme settings." and "Theme settings ↗"; Pagination on the main feed only ("Only the main feed paginates, because only it reads the page number in the URL."); "Make this the main feed" in the other feed's ⋯ menu. D5d: the "Page 2" pill with "Back to page 1"; "Newer 1 2 3 … 7 Older"; reached from "Preview page · 1 2" in the Pagination control, "never a shortcut". D5e: SOURCE (Orbit Weekly · Sample content), a rule, "SUBJECT · WHICH POST THIS CANVAS RENDERS" with "Style-guide article — The one every post design is designed against" first, then posts with dates and **"has image" in words**; the helper line verbatim. D5f: heading and body verbatim; "Keep it" · "Remove it"; "Notice, not danger." | **One fixture collision.** D5b's routes-manager example "Membership landing · custom-membership.hbs" takes the filename the Membership group's own Signup template ships as (B19, D5f) — one file, two templates → **A9 item 6** |
| **A6** | `D6 Theme Settings Completed.dc.html` — D6a Theme settings Pro · D6b Theme settings Free · D6c Text prop confirm | D6a: "Posts per page · 12 · posts_per_page" first, with "How many posts your archives show before paginating. Your theme owns this — Ghost has no setting for it."; the logo padlocked — "orbit-wordmark.svg SVG · 4 KB · from Ghost · Change this in Ghost ↗", no Replace; "This project · Light only / Light + Dark" with "Every Style Pack ships a hand-paired dark palette, so dark is already paid for."; "Clear dark overrides · 3 sections carry a dark override · Clear", the badge captioned "it always carries the label 'Dark override'"; "Credits · Show 'Built with Inflozo' · It appears twice: in your theme's footer, and in the README inside your exported zip."; the meter "3 OF 17" with "Ghost allows twenty per theme; three are the dark-mode built-ins every Inflozo project declares, so seventeen are yours."; the builder's "Group in Ghost · Site wide · Homepage · Post", "Only show when · optional · Layout is Wide", "Keys freeze once you deploy or export — pick them like you mean it.", and on the promoted accent "This points at a Style Pack colour role. Switching packs changes what this setting is pointing at." D6b: the credits row greyed with "Credits stay on with the Free plan." and "Go Pro — $15/mo", plus a Light-only project greying the overrides row with its reason. D6c: "Promote 'Announcement text' to Ghost?" with the sentence verbatim and the line shown before and after | Nothing |
| **A7** | 21 corrections to existing frames — the table below | **17 corrected as asked, 4 partly** (items 7, 10, 17 and 20 — each landed its main change and left one thing behind), **none untouched** | The four residues → **A9 items 1, 2, 3 and 7** |
| **A8** | `D8 Editor Below 1440.dc.html` — D8a Editor at 834 · D8b Editor at 720 · D8a Overflow menu · D8c Skip link · D8d Drop zone · D8e Layers row focused · D8f Destructive confirm · D8g Ship from read-only | D8a "TABLET · 834 × 1112 · TOUCH · EVERY TARGET ≥ 44 PX": the Layers icon rail ("mini-thumbnails without names … L still toggles it"), the Controls sidebar as an overlay with a scrim ("The canvas keeps its width behind this panel"), the top bar keeping Template · View as · ⋯ · Ship it; `height:44px` 27 times in the markup. D8b "720 × 900 · A 1440 DISPLAY AT 200% BROWSER ZOOM · FINE POINTER": "Hover states are live here. Nothing about this width is touch." The overflow menu drawn open: Device — Tablet · Undo ⌘Z · Redo · Dark mode preview · Export theme. D8c: "Skip the canvas" in both states — "AT REST · NOT RENDERED" and "ON THE FIRST TAB · FIRST FOCUSABLE THING IN THE SHELL" — in "2px solid #C2381F, 7.9:1 on paper". D8d: "Drop images — we'll optimize them ✨ · Choose files · JPG, PNG, SVG or WebP · up to 10 MB each" (and S10b itself now reads 10 MB). D8e: "REST · FOCUSED", "HOVER · THE WASH", "SELECTED · FOCUSED", with "↑ ↓ move focus · ⌥↑ ⌥↓ move the section itself" in kbd chips. D8f: "Take over from Rosa?" opening with focus on "Wait", captioned as the rule and naming Delete account, Roll back, project delete, delete-in-use assets and Overwrite and ship anyway. D8g: "Take over to ship?" · "Shipping needs the edit lock, and Rosa is holding it." · "7 unsynced edits exist in Rosa's browser and will be lost. We cannot retrieve them from here." · "Take over and ship" · "Wait" · "Or message Rosa"; "focus opens on Wait, per D8f" | **Two.** D8f's body is B5c's uncorrected wording — "7 unsynced changes will be lost", "She has changes that never reached the server" — where `addendum.md` §AD2 makes *edits* canonical and F2 re-specified B5c (B5c itself was never in A7 and still itemises the loss per section) → **A9 item 4**. D8b's caption says a reader would apply "the 44px rules and the below-720 notice" — the notice is R-76's coarse-pointer floor at 1024, not a 720 width → **A9 item 5** |

### A7, item by item

| # | Frame | Verdict | Evidence in the 2026-09-04 export |
|---|---|---|---|
| 1 | B19 | corrected | `custom-membership.hbs` "Ghost shows it as Membership"; step 2 "In Ghost, open a page and pick Membership from the Template dropdown."; step 3 "That's it — Ghost remembers your choice on that page, even if you rename or re-slug it later."; "We can't see whether you did this — Ghost doesn't tell us which template a page picked, so tick it off yourself when it's done."; a three-row checklist (Membership · Signin · Member home, each with its file); the facsimile shows Ghost's Template dropdown open on "Membership". `page-membership.hbs` 1 → 0, MATCHED 2 → 0, "URL slug" 1 → 0 |
| 2 | B12a · B12b | corrected | B12a "we only do it the first time you upload to a site" and "Kept outside your version limit." ("on every deploy" 1 → 0, "count towards your history" 1 → 0). B12b "Reading your live theme needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one. That's how Ghost works on every version and every host — there's no permission to switch on." · "GET /ghost/api/admin/themes/ → 403" · "Ghost keeps your previous theme under Settings → Design, so you can put it back yourself if you need to." · "Add the token · Deploy without a snapshot · Cancel" ("Check the key" 1 → 0) |
| 3 | B16 | corrected | "Uploading a routing file needs a Staff Access Token from the site Owner or an Administrator, and this project doesn't have one — so this once you will need to do it by hand."; step 2 "In Ghost, find the routes upload for your version · Show me where ↗"; "Add the token instead" with "Adding the token makes this automatic from now on." ("settings permission" 1 → 0, "Fix the key instead" 1 → 0, "Labs" 1 → 0) |
| 4 | B13a | corrected | "Remove it" on every row (0 → 4); a fourth row type "Chosen, not placed · 1 TREATMENT · Reverts to Fade · Revert to the free one"; "Swap and ship free" and "Go Pro and ship" kept; the pairing note gone ("named Free fallback" 1 → 0, "per-design pairings" 1 → 0) |
| 5 | B24 | corrected | "After that you go back to Free. Your live sites are never touched — what's shipped stays shipped. You'd just need to sort out anything over the Free limits before you ship again." ("stop rendering" 1 → 0) |
| 6 | B11a · B11b | corrected | "There is one control here: device"; "Scale is not a control … the percentage is reported rather than set"; the chips "VIEWPORT 1440 × 900 · SHOWN AT 46%" and "VIEWPORT 390 × 844 · SHOWN AT 55%" kept; the only "Zoom" left is the frame label "B11a · DESKTOP 1440 × 900 · ZOOM FIT" |
| 7 | Calibration Set · every frame | corrected, one caption left behind | The Calibration Set gains a "TWO TOKEN RULES · THEY HOLD IN EVERY FRAME, APP AND SECTION ALIKE" block: "One ring, everywhere: 2px solid coral-text #C2381F — 7.9:1 on paper and past 3:1 on white … That wash stays, for hover and selection only." Across the export `box-shadow:0 0 0 2px #C2381F` 0 → 35 and `rgba(255,89,65,.4)` 28 → 5; the five left are selection or active states (C Post Body ×3 — a selected gallery figure and the open account-menu avatar; S3 ×1 — the same avatar; D8e ×1 — the row labelled "HOVER · THE WASH"), which the rule permits. S9's routes inputs carry `border-color:#C2381F;box-shadow:0 0 0 2px #C2381F` on focus (its one remaining `border:1px solid #FF5941` is the selected radio card in S9e). The Kit's focused input is `border:1px solid #C2381F … box-shadow:0 0 0 2px #C2381F`. **Left behind:** the Kit's inputs caption still reads "inputs — radius 8 · coral caret · focus ring 2px @40%" over a drawing that no longer does → **A9 item 2** |
| 8 | S4 · S6 · S7 | corrected | `aria-label` 0 → 20 on S4 (`"Deploy options"` ×5 on the ▾, `"Hide Header"` … on the eyes), 0 → 6 on S6, 0 → 15 on S7; `role=` added beside them (17 · 5 · 12); unasked but welcome, S5 `aria-label="Designs"` ×2 and S10 `aria-label="Assets"`, `aria-label="Search assets"`. Attributes only — S4's rendered text changed nowhere else |
| 9 | S1 · S2 · S4 · S6 · S7 · S9 · S10 · S11 · S12 · S13 · S5 | corrected | `<label for="s1-email">`; S2 `s2b-api-url`, `s2b-admin-key`, `s2b-content-key`; S4 `s4c-hero-title`; S6 `s6-hero-title`; S7 `s7c-pack-name`, `s7d-pack-name`, the hex field `aria-label="Accent colour hex"`; S9 `s9-route-path`, `s9-route-path-2`; S12 `s12c-confirm`; S13 `s13-title`, `s13-details`. The caption `<label>`s became plain text — S9 5 → 2, S11d 3 → 0, S13 3 → 2. The assets search is a drawn div and carries `aria-label="Search assets"`. `tabindex="0"` on the Section Picker grid (S5a, S5c) and the assets grid (0 → 2 each) |
| 10 | Calibration Set · Kit · S9 | corrected, the P0 frames left behind | Kit `input::placeholder { color:#6B6459 }` (was `#A8A29A`) and the "Find a section…" hint in `#6B6459`; the Calibration rule "Placeholders, hints, and mono line numbers are set in #6B6459 — 5.85:1 … Faint ink is for rules and dividers, not for words."; S9 `input::placeholder` → `#6B6459` and its YAML line numbers re-tinted (`#C9C2B8` 45 → 20 occurrences, `#6B6459` 0 → 36). **Left behind:** P0-2, P0-3 and P0-5 were not in the prompt, did not change, and still set placeholder and hint text in `#A8A29A` — "Search 420 icons", "+ 3 more rows", "Search posts to add" → **A9 item 3** |
| 11 | S8d′ · S11a | corrected | S8d′ "Ghost said no — this Admin API key no longer works." · "It was regenerated or removed in Ghost Admin. Paste the new key and we'll pick up right here." · "Reconnect site"; S11a chip "Key regenerated Aug 15" ("Admin key expired" 1 → 0 in both) |
| 12 | C3b | corrected | "MEMBERS OFF · Members are switched off · Members are switched off for Orbit Weekly — subscription access is set to Nobody — so nothing on the site is gated and this block has nothing to appear on."; step 1 "In Ghost admin, open Settings → Membership and set Subscription access to anyone or invite-only"; the caption "Ghost renders its paywall on every gated post, paid tier or not" ("no paid tiers" 3 → 0, "never renders" 2 → 0) |
| 13 | S8c | corrected | `<button disabled="disabled" aria-disabled="true">Cancel</button>` beside "Once it starts, it finishes" — R-33's greyed-with-reason pattern; the card, "Uploading to Ghost · 1.1 of 2.4 MB" and "Activating v5" kept |
| 14 | S7c | corrected | the third row ("Dark · Base Surface Accent Contrast") is gone; two seven-swatch rows remain under "Seven roles per mode" |
| 15 | S14a | corrected | Image · Markdown · HTML · Gallery · Divider · Bookmark · Email content · Email call to action (NO COLOUR CTLS) · Call to action · Public preview · Button · Callout · GIF · Toggle · Video · Audio · File · Product · Header · Embed; "Signup" and "Embeds" gone |
| 16 | every app frame | corrected | `kickscondor` 5 → 0; `sam@fieldnotes.blog` 2 → 0; `fieldnotes.ghost.io` → `fieldnotes.example.com` (S3a, S8a′, S11a, B25, D4d); S1a's placeholder `you@yoursite.com` → `you@example.com`; `maya@orbitweekly.com` on S1b, S3, S10, S11, S12. `you@example.com` survives only as the site's own subscribe-form placeholder (S4, S6, S7, C, D8, the Calibration Set), which is the RFC 2606 fixture the rule allows. Recorded, not a miss: `youtube.com` stays as the provider label on C's embed card, and `hello@inflozo.com` on M5 |
| 17 | S5a · S5c | **partly** | "Heroes 18" in the rail and "18 designs" in both frames now agree with B1a ("28" 1 → 0). **But the rail's head, which the repo edit of 2026-08-31 had made "ALL CATEGORIES ALL DESIGNS", now reads "ALL CATEGORIES 485"** in both frames — the category total went, a library total arrived, and the prompt had said a total is not allowed → **A9 item 1**, and see the control below |
| 18 | S4d | corrected | "Preview as · Logged out user — Not signed in · Free member — Signed in, no subscription · Paid member — Sees members-only content"; "2 not viewed" beside the toggle; "Gated content — shown with sample text" on the gated body; "Orbit Supporter", "Orbit Patron", "Founding" 0 |
| 19 | B23a | corrected | Chapter · Signal · Studio · Ledger · Gazette · Aurora · Foundry · Quiet · Pulse · Bloom with their packs; "All Free" 7 → 2 (Quiet, Ledger); "Cohort — tiers and member pages" gone from the grid — the word survives once, in the canvas's own "GIVEN / MINE" name ledger at its head, which is annotation, not a surface |
| 20 | S11c · S12a · S12b · M5 | **partly** | S11c "Free includes 1 site. Pro connects up to 10."; S12a "Projects 6 of 25 · Connected sites 2 of 10 · Asset storage 312 MB of 5 GB · Deploy history last 10 per project"; S12b "Projects 1 / 25 · Connected sites 1 / 10 · Asset uploads 10 MB / file · Deploy history Last 3 / Last 10"; M5 "1 project · 1 connected site", "25 projects · 10 sites", "5 GB assets", "last 3 versions", "last 10 versions" and the same table ("unlimited", "Last 2", "up to 3" all 0). **Left out:** Free's 100 MB storage cap appears only on M5's 390 frame ("1 project · 1 site · 100 MB assets") — not in S12b's or M5's tables, not in S12a → **A9 item 7** |
| 21 | S4c · S6 | corrected | "Try a design" ("Try a variant" 1 → 0 in each) |

Captions: no A-category frame changed, so the settings-snapshot captions ruling R-73 protects stand
by construction.

### What goes back to Claude Design — prompt A9

Written into `EXPERIENCE.md` Appendix A as **A9**, nine items: (1) S5's "ALL CATEGORIES 485" ·
(2) the Kit's inputs caption · (3) P0-2/P0-3/P0-5 placeholder colour · (4) B5c and D8f "changes" →
"edits", and B5c's itemised list · (5) D8b's "below-720 notice" caption · (6) D5b's
`custom-membership.hbs` collision · (7) the 100 MB storage row · (8) S9's YAML pane, which
`EXPERIENCE.md` had assigned to A7 without A7 carrying it (`/ : home` and
`/subscribe/ : members-signup` are byte-identical) · (9) B22 Redesign Proposals, held out of the walk
"until A7 runs" (§A12 decision 6) but never in A7's list. Items 8 and 9 are the spine's own misses,
not the session's: two rows pointed at a prompt that did not carry them.

### A9 landed — verified 2026-09-04, the same day

The owner ran A9 whole (R-86) and replaced `Inflozo/` with the export. Checked frame by frame — old
string gone and new string present — before the re-apply script touched anything:

| Item | Landed | Evidence |
|---|---|---|
| 1 S5 rail head | ✅ | "ALL CATEGORIES" with nothing beside it, S5a and S5c |
| 2 Kit inputs caption | ✅ | "focus ring 2px solid coral-text #C2381F" |
| 3 P0-2 · P0-3 · P0-5 hint colour | **partly** | the six named strings are `#6B6459`; three sibling hints on P0-3 — "+ 3 more from the feed", "+ Add message", "+ 4 more, kept but not shown" — are still `#A8A29A`. Not sent back: the built control takes `input.placeholderColor` from `DESIGN.md`, so the frame's colour never reaches the product, and the story that builds P0-3 does not inherit it |
| 4 B5c · D8f edits, not changes | ✅ | "7 unsynced edits will be lost", the itemised list gone, "edits that never reached the server" |
| 5 D8b caption | ✅ | "the 44px rules and the small-screen notice" |
| 6 D5b template file | ✅ | "Landing · custom-landing.hbs"; D5f's own `custom-membership.hbs` stays, as it should |
| 7 the storage row | ✅ | S12b and M5 at 1440: "Asset storage · 100 MB · 5 GB"; S12a is the Pro account view and prints Pro's figures |
| 8 S9 YAML pane and custom routes | ✅ | the two rows gone; the YAML opens `collections: / : permalink /{slug}/ template index`, then /articles/, /tutorials/, /notes/; S9c "Posts per page is your theme setting — 12 right now"; "in the last 30 days" first |
| 9 B22 | ✅ | three whole-site proposals, a starter × pack each, one sentence from the data; the tag-template card gone; "You can run this again from New project → Redesign one of my sites" |
| 10 B15 | ✅ | "Publisher or higher" |
| 11 S8a′ · S11a | ✅ | "Download your theme — it installs on a self-hosted Ghost, or on a Ghost(Pro) plan that allows custom themes" |
| 12 B14b | ✅ | "The version you're on now stays in history and rolls back in one click" |
| 13 B7 | ✅ | "on all 9 templates", and the notice line |
| 14 B18 | ✅ | dotted keys (`member.signup_cta`, `post.read_more`, `post.reading_time`, `archive.empty_heading` …) and the refused row "Braces would break every page of your site"; the RTL note kept |
| 15 B8 | ✅ | "Keep Free designs only" gone; "Re-roll what — Style Pack · Designs · Both" above "Re-roll where" |
| 16 B4 | ✅ | no "Body" menu — four marks and Remove link; B4b gains "Open in new tab" and a rel row |
| 17 B20 · S11d | ✅ | three credentials with one line each; "nothing on this surface to grant"; the URL "Fixed for this connection", as text |
| 18 B6 | ✅ | the fifth state, "Syncing every change to the cloud" |
| 19 D1b | ✅ | "uploading routes.yaml, and reading the live theme for the snapshot and the drift report" |
| 20 D8c skip link | ✅ | the canvas carries `id="d8-canvas"` |

**The runbook, in order.** The re-export undid the two repo-side edits for the THIRD time (485 and
"466 designs across 33 categories" back on M1, M2, M4, S2, S3 and both Index canvases; P0's mark
allowlist gone from its spec) — `reapply-export-edits.py` put all of it back, which is exactly the
case the script was written for. `verify-design-pass.py`: every structural check passes and the same
five prose scans want a glance. Roster and inventory: already current — A9 changed no design, so the
tuple gate printed the figures it printed before. Module reach and the content and control lines:
unchanged. The documentation gate: green on its second run.

**What the landing changed downstream.** The walkthrough's three lift-time patches (S11a, B15, S8a′ —
the PRD's copy) are gone, because `patch()` refuses a target the frame no longer carries; B22 and B18
are lifted into 5c (J1 runs Auto-Branding → Redesign Proposals → Editor; the Theme Settings rail row
opens Translations), which closes §A12 decision 6's last ⬜; 5b's annotations that said "the frame
says …" now say what A9 changed, and when. `InflozoOld/` is still the issue before Appendix A; the
A1–A8 issue is in git at e7f5041d, which is where a diff against it belongs.

**Owed to Claude Design: nothing.**

### A control that walked past a library total for the fourth time

`tools/verify-design-pass.py` reports **PASS · "§37.7 no design total on S/M screens · no S/M/B
screen prints a library total"** against this export, while `S5 Section Picker.dc.html` renders
"ALL CATEGORIES 485" in S5a and S5c. The detector it shares with `tools/reapply-export-edits.py`
(`leftovers()`) matches a three-or-four-digit figure only when a design noun follows within two
words, or when the figure *precedes* "CATEGOR…"; "ALL CATEGORIES 485 Headers 18 …" has neither, so
nothing matched. The repair pair beside it — `('34 CATEGORIES<span>485</span>', 'ALL
CATEGORIES<span>ALL DESIGNS</span>')` — no longer matches either, because the session changed the
left half under it: running the export runbook will not repair this one. §A11 recorded the third
miss of this rule; this is the fourth, by a new route — the figure standing alone beside a rail.
**For the main session (the tools are not this pass's to edit):** teach `leftovers()` a bare figure
adjacent to "CATEGOR…" on either side, add the pair for the new left half, and re-run both; A9
item 1 removes the figure at the source. Until then the gate is green on a screen it should refuse
— a result whose control did not pass is not a result.

**Fixed the same day, by the main session (fourth miss of this rule, and the control was proved both ways).** `tools/reapply-export-edits.py` gained the pair for the new phrasing (`ALL CATEGORIES<span>485</span>` → count-agnostic) and its `leftovers()` detector now also flags a library-size figure that FOLLOWS the noun ("CATEGORIES 485", "designs 485"): the old detector returned nothing on the missed phrasing, the new one returns `CATEGORIES 485` on a regressed copy of S5, and `verify-design-pass.py` passes on the repaired export. The S5 frames no longer print the total.

### What did not move

- **`VERIFY-AT-BUILD.md` — no fact moved.** Items 9, 11, 59, 60 and 61 were re-read against the
  new frames: B12b now says exactly what item 61 allows on the first upload ("Ghost keeps your
  previous theme under Settings → Design"), B16's step 2 hard-codes no menu path (`MEASUREMENTS.md`
  §33), and C3b's condition is item 11's ("paid tier or not"). Nothing to edit.
- **The ten frames the UX pass re-specified and deferred were unchanged in this export, by that pass's own rule** *(and A9 corrected all ten the same day — "A9 landed", above)*
  ("the frames catch up whenever a library pass next touches them"): B15 "Creator" 1 → 1; S8a′ and
  S11a "download the theme and upload it in Ghost Admin"; B14b "We snapshot before redeploying"
  1 → 1; B7 "on 26 pages" 3 → 3; B18 `read_more` / `min_read` 1 → 1; B8 "Keep Free designs only"
  1 → 1; B4a's "Body" menu 2 → 2; B20's grantable scopes and S11d's editable URL; B6's four states.
  B17 is completed by D6 and needs nothing. They were A9's **second half**, ruled in by R-86 and landed the same day.
- **The Index canvases** changed only their totals, which they derive from the export (the
  re-apply script's own note on why that is not a breach).

### Decisions for the owner — both ruled 2026-09-04

| | Ruling |
|---|---|
| **R-86** | **A9 runs whole — both halves in one Claude Design session** (decision 1, option 1). The misses (items 1–9) and the ten deferred frames (items 10–18) are one corrections pass in A7's shape; export once after it, run the runbook once. `EXPERIENCE.md` A9's preamble and its second-half heading say so, and the "unchanged — A9's optional half" rows now read "A9's second half — runs". |
| **R-87** | **The touch-device threshold is 834, amending R-76's width** (decision 2, option 1): on a **coarse pointer below 834** — a phone — opening a project lands on Small Screen Notice (D4f); a tablet at **834 and above gets the editor as A8 drew it** (D8a); a fine pointer never meets the floor (a desktop at 200 % zoom keeps the editor, D8b). D4f's own caption, "Open this project on a laptop or tablet", already says this, so nothing is added to A9. Propagated the same day: `EXPERIENCE.md` § Foundation, the IA row, the Editor states row, § Responsive & Platform, A9 item 5 · `DESIGN.md` `app-floor` and the accessibility floor · `prd.md` FR-D1 states the device test with no width and is unchanged · `HANDOVER.md` and `build-sequence.md` R-76 summaries · the R-76 row in §A11 · the walkthrough (`app.js` `needsBigScreen`, `build-app.py`, `_app.css`), which already tested 834 and now cites the ruling. |

The two decisions as they were put, kept for the record:

**A second decision for the owner, found while rebuilding the walkthrough on this export.** Two statements in
`EXPERIENCE.md` disagree on where a touch device stops getting the editor: § Responsive says *below 1024 px*
(R-76's number), while prompt A8 — which the owner ran — draws the editor on a tablet at 834 with touch as in
scope (D8a). The walkthrough currently shows the notice on a coarse pointer below 834 and the D8a layout from
834 up. *Example:* an iPad held upright is about 834 wide; under 1024 it would get "use a bigger screen", under
834 it gets the editor as D8a draws it. (1) **834 — the tablet as drawn gets the editor; the notice is for phones**
(RECOMMENDED; matches A8 and the accessibility floor's "coarse pointer at a small viewport") · (2) 1024 — R-76's
number as written; an upright iPad gets the notice, and D8a's frame is for touch devices between 834 and 1023
only. Reply `Ruled: 834` or `Ruled: 1024`; the session then makes § Responsive, the IA row, D4f's caption and
the walkthrough agree.

**1 · Does A9 carry the ten deferred frames as well as the nine misses?**

1. **(RECOMMENDED) Yes — one Claude Design session, both halves.** The frames stop contradicting
   the spine now, the session is already a corrections pass in A7's shape, and the ten items are
   one-line copy changes. Cost: one session, then the export runbook once.
2. **No — A9 runs with items 1–9 only**, and the ten wait for whatever library pass next touches
   them (the 2026-09-03 rule). Cost: 5c keeps patching those strings at lift time until then.

Targets: ✅ `EXPERIENCE.md` (Information Architecture; both "what the export draws" tables; the
accessibility floor's D8c–D8f citations; the responsive section's D8a/D8b and D4f; the journeys and
flows; the Appendix A preamble; A9) · ✅ `DESIGN.md` (the two moved tokens re-derived, old → new
recorded; every other value re-checked against the new Calibration Set, Kit and export) · ✅ the
process documents and generators that said "not drawn", "until A7 runs" or "prompt A8 draws"
(main session, 2026-09-04) · ✅ `tools/reapply-export-edits.py` and `tools/verify-design-pass.py`
(main session, above) · ✅ the prototypes lift the D frames (2026-09-04, both builds) · ✅ decision 1
(R-86) and decision 2 (R-87), ruled 2026-09-04 · ✅ A9, both halves, and the export runbook after it (the owner ran it; landed and verified 2026-09-04).

## A16 · Step 6 — two rulings on the renewal reminder, 2026-09-04

Taken while step 6 expanded §8 into stories. Step 6 asked whether Dodo sends the annual renewal
notice as merchant of record — §7.6 item 6's open half, and the one thing blocking a story.

**R-88 — Inflozo sends its own renewal reminder; the condition on FR-P1's sixth email is closed.**
The owner ruled *"It does not. We need to send automated reminders for subscriptions"*. **This
reaffirms rather than creates:** Round 4 already decided it on 2026-08-20 and the schema already
carries `renewal_reminders`. **And the fact base is more precise than the ruling's wording, which
matters under standing rule 1** — Dodo *does* have an *Upcoming Renewal Reminder*, but it is **~2
days ahead and off by default** (`MEASUREMENTS.md` §23c, `SCHEMA.sql`). The exposure is the
**timing**, which Inflozo cannot set on Dodo's email: ~2 days is very likely short of the statutory
window for an annual term, and Appendix F assumes a 60% yearly mix. So Inflozo sends its own at
**30 days** and leaves Dodo's on — they fire at different moments and complement. FR-P1's count
moves from five to six.
- Targets: ✅ `prd.md` FR-P1, FR-P2, §7.6 item 6 and §8's E12 line · ✅ `epics.md` Story 12.8 ·
  already correct and unchanged: `ARCHITECTURE-SPINE.md`'s `resend` row (already "six"), AD-33's
  seventh cron, `SCHEMA.sql`'s `renewal_reminders`, `build-sequence.md`'s launch-checklist item to
  enable Dodo's own reminder.

**R-89 — the reminder is ANNUAL ONLY, and this withdraws the monthly leg of the 2026-08-20
decision.** Asked whether "reminders for subscriptions" meant annual only or every subscription,
the owner ruled **"Only annually"**. Round 4 had said **30 days (annual) / 7 days (monthly)**; the
7-day monthly reminder is **not built**. Twelve reminders a year to a monthly subscriber is the
nudge pattern FR-P2 forbids, and the statutory basis attaches to the annual term rather than to a
monthly card charge people already expect. **No DDL changes** — `renewal_reminders` and its
`(user_id, period_end)` key are unchanged; monthly rows are simply never written.
- Targets: ✅ `prd.md` FR-P1 and FR-P2 · ✅ `SCHEMA.sql`'s comment on `renewal_reminders` ·
  ✅ `MEASUREMENTS.md` §23c, **annotated rather than rewritten**, because a dated decision is not
  edited to match a later one · ✅ `epics.md` Story 12.8.
- **Flagged to the owner:** this reverses a decision he took on 2026-08-20. He ruled on 2026-09-04
  with the trade-off in front of him, so it is treated as deliberate — but it is recorded as a
  reversal rather than as a fresh decision, so restoring the monthly leg is one instruction.

**R-90 — the production domains are settled and the predecessor stack is deleted.** Asked where the
real domains should point, the owner ruled that **`inflozo.com` is the marketing site — the apex is
canonical and `www.inflozo.com` takes a 308 to it**, reversing Vercel's default, which pointed the apex
at `www`; applied and verified the same day. **`app.inflozo.com` is the app.** Both are served by
**one Vercel deployment** — the spine's two-domains-one-deployment shape, and the PRD's standing
pre-launch mandate that testing runs on the real production domains. **Every owner test therefore runs
on those domains, never on a `vercel.app` preview URL.** The predecessor — the Vercel project
`inflozo-marketing` and the GitHub repo `Inflozo/core`, created 2026-06-29 and last deployed
2026-08-12 — **carried no users and was deleted by the owner on 2026-09-04**, not archived; he
re-attached the three domains to the production Vercel project the same day. **They return 404 until
Story 1.1 deploys, and that is the expected state rather than a fault.** No registrar work was ever
required: Namecheap already pointed the apex, `www` and `app` at Vercel, and `inflozo.com` is verified
there with external DNS.
- **`admin.inflozo.com` is deferred, not cancelled.** It was the owner's own backend console, went with
  the deleted project, and is **out of scope for this phase, to be taken up after it** (owner,
  2026-09-04). Its DNS is untouched, so restoring it later is a re-attach rather than a rebuild.
- **The two Ghost test servers were never in scope of this change** — `ghost5.inflozo.com` and
  `ghost6.inflozo.com` are DigitalOcean droplets on the same domain and were verified untouched before
  anything moved, because R-82's real-infra rule depends on them.
- Targets: ✅ `epics.md` Story 1.1, which now owns the cutover and is not done while any domain 404s ·
  ✅ `docs/project-context.md`, so every session inherits the rule · ✅ `prd.md` and
  `ARCHITECTURE-SPINE.md` need no edit — both already name the two domains, which is why this is
  recorded as a settlement rather than a change.
- **Ruled, with one step outstanding.** The production Vercel project is renamed `inflozo-probe` →
  **`inflozo`** (owner, 2026-09-04), which also leaves `inflozo-admin` free for the backend console when
  `admin.inflozo.com` is taken up. The rename itself is performed in the dashboard; when it lands,
  `VERCEL_PROJECT` in `tools/probe/.env` moves with it. **The old name is deliberately left standing
  elsewhere:** `STRESS-TEST-R4.md` and `R2-APPLY-2-SPINE.md` are `record` and are never edited, and
  `MEASUREMENTS.md`'s two mentions are the context a measurement was taken in rather than a live
  reference. Every other `inflozo-probe` in the repository is a Ghost theme filename or a probe
  User-Agent and has nothing to do with the Vercel project.

**R-91 — the project finishes on the BMAD it has; never update it.** Asked whether to take BMAD
**6.12.0**, released 2026-09-04, the owner ruled **no: the build stays on 6.11.0 until the project is
complete.** The installed version is recorded in `_bmad/_config/manifest.yaml` (6.11.0, installed
2026-08-17). **No session runs `npx bmad-method install`, and none proposes an update** — the version
is settled for the duration, so the question is closed rather than deferred.
- **Three of 6.12.0's breaking changes land on this repository, and two of them fail silently** — the
  reason the ruling is recorded with its evidence rather than as a preference. (1) `persistent_facts`
  ships empty in 6.12.0, and it is the mechanism by which `docs/project-context.md` reaches every
  skill; losing it unbinds R-80 to R-84 from the loop with no error. (2) `{diff_output}` is renamed
  `{diff_file}`, and the old name is used in all three team overrides — `_bmad/custom/bmad-build.toml`,
  `bmad-build-auto.toml` and `bmad-code-review.toml`; an unresolved placeholder hands the real-infra
  reviewer an empty diff. (3) Build in 6.12.0 decides its own ceremony and can finish a simple change
  in one session, which the phase split in `_bmad/custom/bmad-build.toml` currently forbids by naming
  6.11.0's steps. **The documentation gate cannot see any of this**: it checks that `_bmad/custom/`
  has its catalogue rows, never that the placeholders inside them still resolve.
- **What the ruling costs, stated so it is not rediscovered as a surprise.** 6.12.0 fixes review layers
  that returned nothing silently and adds a logged verdict and evidence per finding — both of which
  bear on R-82's real-infra review. The overrides in `_bmad/custom/` are what stand in for that, and a
  review that reports zero findings is therefore treated as a result to check, not to trust.
- Targets: ✅ `docs/project-context.md`, so every skill run inherits it · ✅ `CLAUDE.md`, so every
  session inherits it before it reaches for the installer · `_bmad/_config/manifest.yaml` needs no
  edit — it is the installer's own record and already names the version.

---

## A17 · Step 7 — Story 1.3's review, one ruling on the app's icons, 2026-09-05

Taken during the code review of Story 1.3 (the token layer and the app component kit). The review
compared the kit's icon paths with Tabler's sources and found they were not Tabler's: the frames draw
their own, Feather-like glyphs, and the kit copies them verbatim under R-74 — while the file carried
Tabler's MIT notice, as D1 and the story's constraint asked. Two rulings pointed different ways, so
the question went to the owner in R-83's shape.

**R-92 — the app's icons are the frames' own drawings; Tabler is the sections' set.** The owner ruled
*"Keep the frames' drawings and correct the notice … Tabler icons are for the sections using which the
customer/user will build their site. It is used for the icon picker and other icons used in various
sections — not the actual Inflozo frame/chrome/UI."* So D1 and R-26's "Tabler" are scoped to the
library — the Icon Picker (FR-F1, Appendix C) and every glyph in an emitted theme, where the licence
text ships — and **Inflozo's own chrome draws what the export draws**, read verbatim (R-74). Nothing
visible changed. The Tabler notice leaves the app kit and returns with the first Tabler path, which
belongs in `packages/library`.
- Targets: ✅ `apps/web/components/kit/icons.tsx` (provenance stated, notice removed) · ✅ Story 1.3's
  spec (the constraint amended, the question ruled) · ✅ `epic-1-context.md` · ✅ `DESIGN.md` § Icons
  & Illustration · ✅ the R-26 row above. `prd.md` needs no edit: FR-F1, Appendix C and FR-Q7 already
  name Tabler for the picker and the sections only.

---

## A18 · Step 7 — Story 1.5's owner test, one ruling on the New project sheet, 2026-09-06

Taken during the owner's second test of the deployed dashboard. He compared the New project window with
`S2a` — the First Run page, which is not that window's frame — and, having read the greyed Duplicate
door's own reason line, ruled the door out: *"Remove option of 'Duplicating a project' as they can
directly click on the three dots menu of a project and click duplicate."* Two approved decisions pointed
the other way — D4a's caption (*all four doors stay drawn and each carries its reason*), which R-33 and
R-68 generalise, and **FR-B2**, which lists Duplicate as one of the creation paths — so the scope of the
removal went back to him in R-83's shape: this window only, or Story 13.6 too. He chose out for good.

**R-93 — the New project sheet offers the paths FR-B2 names, and duplicating is not one of them.** The
owner ruled *"Out for good — three doors, duplicating only on a project's ⋯ menu."* The **capability is
untouched**: duplicate stays exactly where FR-B3 defines it, on a project card's ⋯ menu, built and tested
in Story 1.5. What changes is that it is no longer a *creation path* — a duplicate is an action on a
project already in front of the user, not a way to start from nothing — so the sheet lists Blank canvas,
Start from a starter and Redesign one of my sites, and **Story 13.6 does not restore the fourth door or
the project picker drawn inside it**. This is a behaviour ruling, so it lands in the PRD (build-sequence
standing rule 6: the PRD decides what a surface does, the export decides what it is built from);
**`D4a` and `D4b` keep four doors and are not edited** (R-74), and this ruling is the record that the
product diverges from the drawing here on purpose.
- Targets: ✅ `prd.md` FR-B2 (the path list, and where duplicating lives instead) · ✅ `prd.md` §8 E13
  ("all four creation paths" → every path FR-B2 names) · ✅ `epics.md` the FR-B2 restatement · ✅
  `epics.md` Story 13.6 (heading, acceptance criteria and frame line) · ✅ `EXPERIENCE.md`
  § Information Architecture, the New Project Sheet row · ✅ Story 1.5's spec (Boundaries, the Design
  Note, and the ruling under `## Questions for the owner`) · ✅ `new-project-sheet.tsx` — the second Fix run,
  2026-09-06, commit `95023994`, three doors and no Duplicate (ticked by the review of 2026-09-06). **Deliberately not touched:** the export (R-74), `EXPERIENCE.md`
  Appendix A's D4 prompt (the record of what was actually run against Claude Design) and
  `ux-designs/prototype/` (5b proves the export, and the export is unchanged).

---

## A19 · Step 7 — Story 2.3's review, two rulings on the email change, 2026-09-07

Taken during the code review of Story 2.3 (change my email address safely). Both questions went to the
owner in R-83's shape and both were his to answer: the first because the story's own matrix promised a
sentence the product could not deliver in the common case, the second because the story's frozen
Boundaries listed a second email in this flow under **Ask First**.

**R-94 — a dead email-change link lands on the Account page and says so there.** The review found that
an expired or already-used link redirects to `/sign-in?error=link`, where the sentence renders only for
a browser with NO session — `sign-in/page.tsx:41` sends a signed-in visitor to the dashboard before the
page renders a word — and the browser someone opens the email on is usually one they are already signed
in on. The owner ruled option 1: *"A stale email-change link lands on the Account page with a red note:
'That link has expired or was already used. Press Change email to get a new one.'"* So the confirm route
asks `getUser()` on the failure path and, for `type=email_change` with a live session, lands
`/account?email=stale`; a signed-out browser still gets the sign-in page's own sentence, unchanged. The
red note is a URL hint like the green one, on the same key, said once and then stripped.
- Targets: ✅ `apps/web/app/(app)/app/auth/confirm/route.ts` (the branch) · ✅ `account/email-change-rule.ts`
  (`STALE_LINK`, `EMAIL_STALE_VALUE`, `EMAIL_STALE_PATH`, `isEmailStale`) · ✅ `account/email-card.tsx`
  (the third banner, and the strip that covers both values) · ✅ `account/page.tsx` · ✅
  `apps/web/email-change-rule.test.ts` (the round trip, the two values never reading as each other, and
  the route's own branch read out of its source) · ✅ `tools/probe/run-verify-email-change.py`
  (`stale-signed-in` re-opens the link the `confirm` step just spent, `stale-signed-out` proves the
  sign-in sentence still answers a cookie-less browser) · ✅ Story 2.3's spec (the matrix row, the
  Boundaries, `## Owner's manual test` step 7, and the ruling under `## Questions for the owner`)

**R-95 — the previous address is told when an account's email changes; FR-P1 grows a seventh email.**
The review raised that with one email in this flow, a change made from a stolen 30-day session (FR-A6)
is silent to the person losing the account, and that the story had turned Supabase's own notice off to
keep FR-P1 at six. The owner ruled option 2: *"Turn the notice on now: the old address gets Supabase's
plain, unbranded 'your email has been changed' email until Epic 12 brands it. Seven emails, and FR-P1's
count changes today."* This **renegotiates the story's frozen Boundaries**, which is what
`<frozen-after-approval>` reserves for the human, and it is a behaviour ruling, so it lands in the PRD
(build-sequence standing rule 6). Read in GoTrue's source rather than assumed: the notice goes to the
OLD address alone (`templatemailer.go:433-441`, the recipient argument is `oldEmail`), only after the
change is confirmed and only when the address really differs, and a failed send is logged rather than
failing the request (`verify.go:633-639`). **No template is pushed for it** — the plain default is the
owner's choice for now, and the two fields that would brand it are deliberately left unwritten.
- Targets: ✅ `prd.md` FR-P1 (six → seven, the new **(7)**; (1)–(6) keep their numbers so every citation
  in the repository stays true) · ✅ `tools/probe/configure-supabase-auth.py`
  (`mailer_notifications_email_changed_enabled: True`, written and read back, with its own `--expect …
  =false` control) · ✅ `tools/doc-audit.py`'s catalogue row · ✅ `account/actions.ts`'s header · ✅
  `supabase/auth/email-change.html`'s header · ✅ `deferred-work.md` **DW-39** (rewritten from a question
  into the branding job E12 inherits, naming the default's "contact support immediately" as the sentence
  that most needs replacing) · ✅ Story 2.3's spec (Boundaries, the matrix, Design Notes, `## Verification`
  and `## Owner's manual test`) · **Deliberately not touched:** `FR-P2` — a security notice on a
  confirmed change is not a nudge and its two carve-outs are about nudges; `MEASUREMENTS.md` §23c and
  `VERIFY-AT-BUILD.md` item 37b, which call the renewal reminder FR-P1's *sixth* and remain true.

---

## A20 · Step 7 — Story 2.5's Create, two rulings on account deletion, 2026-09-07

Taken as Story 2.5 (ask to delete my account, and be able to change my mind) was planned. Both questions
went to the owner in R-83's shape: the first because two approved documents contradicted each other, the
second because an approved acceptance criterion had nothing to be built against. He ruled both the same
day, on the options the spec had been built on, so nothing in the story's plan moved.

**R-96 — the account-deletion confirmation is FR-P1's eighth email.** FR-P1 said *exactly seven* emails
exist and named them; FR-A5 and Story 2.5's acceptance criteria say the 14-day window is confirmed by an
email that states the deadline and offers the snapshots. The owner ruled option 1: *"Yes — it becomes the
eighth email."* Sent once, at the moment the typed confirm opens the window, to the account's own
address; it states the purge date, lists every retained snapshot with its site, links to Restore and says
it is the only email about this. **A confirmation, not a nudge**: no reminder ever follows (FR-A5's own
last sentence), so FR-P2 is untouched. It is Inflozo's own send through Resend's HTTP API on the sign-in
email's shell — not a Supabase Auth template, because GoTrue has no event for it.
- Targets: ✅ `prd.md` FR-P1 (seven → eight, the new **(8)**; (1)–(7) keep their numbers so every citation
  in the repository stays true) · ✅ `ARCHITECTURE-SPINE.md`'s dependency row for `resend`, which restated
  "six" — reworded to defer to FR-P1 rather than carry a count (standing rule: counts are derived) · ✅
  Story 2.5's spec (Boundaries, the matrix, Code Map, and the ruling under `## Questions for the owner`) ·
  ✅ `epic-2-context.md` · ⬜ `apps/web/lib/email.ts`, `lib/deletion-email.ts` and the harness (Story 2.5's
  Dev run). **Deliberately not touched:** `FR-P2` (a confirmation is not a nudge); `MEASUREMENTS.md` §23c
  and `VERIFY-AT-BUILD.md` item 37b (records); `tools/probe/configure-supabase-auth.py`, which pushes
  GoTrue's templates and this is not one; `deferred-work.md` **DW-22**, which already says why delivery
  stays the owner's manual step.

**R-97 — FR-A5's two Dodo calls are Epic 12's, not Story 2.5's.** FR-A5 and the story say auto-renew
stops the moment an account asks to be deleted, and that Restore offers resume at the same plan and
price, saying plainly when the paid period ended meanwhile. Nothing exists to build against: no billing
adapter, no `subscriptions` writer, no checkout — so nobody can hold a paid plan before Epic 12, and no
real subscription could execute the call (R-82). The owner ruled option 1: *"Build it in Epic 12, where
Dodo arrives."* Story 2.5 builds the window, the email, the page, the downloads and Restore; the two
calls land with the adapter, tested against a real subscription. Nothing is lost meanwhile, because
nobody can pay.
- Targets: ✅ `deferred-work.md` **DW-42** (the obligation, in the owner's words and the developer's, with
  the two attachment points in 2.5's code named) · ✅ `epics.md` Story 12.5 (one acceptance line naming
  both calls and this ruling) · ✅ Story 2.5's spec (Never, and the ruling under `## Questions for the
  owner`) · ✅ `epic-2-context.md`. **Deliberately not touched:** `prd.md` FR-A5 — the behaviour is
  unchanged and still owed; only the story that delivers it moved.

---

---

## A21 · Step 7 — Story 3.4's owner test, one standing ruling on feedback, 2026-09-09

The owner tested Story 3.4 on `app.inflozo.com` and filed two findings, both of them one complaint
told twice — the screen does not say it is working — and both of them ending in the same sentence:
*"Please do a thorough check and ensure this is included in all future specs and stories."* That
second half is what makes this a ruling rather than a story's fix list: he asked for the rule, not
only the repair.

**R-98 — every control that starts work says so, and every route has a skeleton in its own shape.**
His words: *"When I click a button, there is no way the user know if something is happening in
background. The button does not says anything. Can we show some kind of button state and label
change so user know that something is happening. This is almost all buttons/links."* And: *"When
the Projects or Sites are being loaded. They are showing a generic shmmer. I want the loading
shimmer to match the cards they show."* Both halves are now acceptance criteria on every story with
a screen.
- **The first half was never a missing idea, only a missing home.** Three controls already said what
  they were doing — the account menu's Sign out, the passkey button, the connect wizard — and the
  behaviour lived in the file that had it, reachable by nobody else. The split that produced the
  finding was exact: **a form in a CLIENT component read its own `useActionState` pending and said
  something; a form in a SERVER component had no hook to read and said nothing.** Three files,
  seven controls, S2c's own two buttons among them. `apps/web/components/kit/submit.tsx` is that
  behaviour lifted out — `Submit` with a **required** `busy` label, and `useSubmitting()` for a
  control that is not a Kit button — and the account menu now uses it rather than its own copy
  (standing rule 3: propagate, never localise).
- **The second half was a rule the project already had and did not keep.** DESIGN.md § Loading has
  said "skeletons matching the shape that is coming … Never a spinner" since step 5. What was
  missing was a *file*: a Next `loading.tsx` covers every child segment that has none of its own,
  so the dashboard's project cards — a 16:10 image band over two lines — were drawn over `/sites`,
  whose card has no image on it at all, and over `/account`, which is not a grid. The route's own
  skeleton is also **the answer to a link**, which is the other half of finding 1: the Sites card's
  brand offer was an `<a href>`, so the press left the page standing until the next document
  painted, and it is a `next/link` now.
- **A rule with no check is the state that produced the finding**, so both halves are executable.
  `apps/web/busy.test.ts` walks the tree — it names every submit control with no busy label in its
  own window, and every route with a `page.tsx` and no `loading.tsx` of its own — and it derives
  its subjects from the directory tree rather than a list, so a new surface is covered the day it
  lands (standing rule 4). Two routes are recorded in it as deliberate exceptions **with their
  reasons** rather than omitted. Its control passed: run against the tree the owner tested, it
  fails and names exactly the files he was looking at.
- Targets: ✅ `docs/project-context.md`, so every BMAD run inherits it · ✅ `EXPERIENCE.md`
  § State Patterns (the rule, and an **In flight** row in the partial-states table) · ✅ `DESIGN.md`
  § Loading, and a new § Busy beside it · ✅ Story 3.4's spec (`## Owner's test findings` and the
  Fix record) · ✅ `apps/web/busy.test.ts`, which is the half no document can enforce. The design
  export is **not** a target and is not edited (R-74): the frames draw a button's resting state and
  say nothing about its in-flight one, so this extrapolates rather than contradicts.

## A22 · Step 7 — Story 3.6's review, two rulings, 2026-09-09

Both were put to the owner in R-83 shape under `## Questions for the owner` in Story 3.6's spec
(`_bmad-output/implementation-artifacts/spec-3-6-manage-keys-and-the-partially-credentialed-site.md`,
Questions 1 and 2) and ruled the same day. Filed here on 2026-09-10 by that story's third review,
which found them cited as rulings in five documents and present in this register in none — the
register `CLAUDE.md` names as where a ruling lives, and the one thing the gate cannot see.

**R-99 — a story that changes the database pushes the migration FIRST, on its own, before the code
that needs it.** Option 1 of Question 1, ruled 2026-09-09. The collision was between two approved
rules — Epic 2's "a migration is applied by hand in the Deploy phase" and DW-7's "CI publishes on
every push" — and Story 3.6's Dev push put `store()` live against a hosted schema that had neither
`admin_key_id` nor `credential_change`, so **connecting any Ghost site failed on production** for the
whole Dev → Review → Deploy window (`42703`, `22P02`, reproduced in rolled-back transactions with
passing controls). The phase word is `Schema`: `Story <E>.<S> - Schema - <one line>`, pushed before
Dev; a story with no migration has no Schema phase. Two things it does not do, checked in `ci.yml`:
the schema push still deploys the tree as it stands (harmlessly), and nothing in CI applies a
migration — the apply stays a hand step through `SUPABASE_DB_POOLER_URL`.
- Targets: ✅ `docs/project-context.md` · ✅ `CLAUDE.md` · ✅ `epic-3-context.md` · ✅ the three
  `_bmad/custom/*.toml` team overrides · ✅ `tools/hooks/commit-msg` and `tools/story-board.py`
  **(added 2026-09-10 — the hook rejected the very commit the ruling mandates and the board could
  not place it; a propagation list cannot audit itself)** · ✅ `supabase/tests/rls.sql` and
  `RLS-TEST.sql` assert both halves of the migration exist, the enum value as well as the column.

**R-100 — Inflozo cannot tell "wrong key" from "another site's key", and must not claim to.**
Option 1 of Question 2, ruled 2026-09-09. Executed T3 → T1 and T1 → T3 with T1 → T1 200 as the
control: a Ghost answers 401 `Unknown Admin API Key` to a regenerated key and to a key issued by a
different install alike, because `api_keys` carries no domain, url or install identity (MEASUREMENTS
§37, read in Ghost's source). So a pasted key that belongs to another site is refused by THIS
record's Ghost's own 401, nothing is written, and the sentence is Ghost's. `GET /admin/site/` is kept
for the one case it genuinely answers — this Ghost now reporting a different public address, a domain
move — and the comparison is Ghost's recorded answer against Ghost's current one, never against the
typed address; with none recorded there is no comparison.
- Targets: ✅ Story 3.6's frozen Boundaries, I/O matrix and acceptance criterion (renegotiated on his
  word) · ✅ `docs/project-context.md` § Known pitfalls · ✅ `CLAUDE.md` standing rule 1's example ·
  ✅ MEASUREMENTS §37 · ✅ `EXPERIENCE.md`'s customer-voice row · ✅ the harness (`keys-foreign-key`
  and `keys-other-site` split) · ✅ the spec's `## Owner's manual test` step 7 **(corrected
  2026-09-10 — it still promised the disconnect-and-reconnect sentence)**.

**R-101 — The reconnect email's weekly count starts again when the site is fixed.**
Option 2 of Story 3.7's review Question 2, ruled 2026-09-10. The review found the spec's two
sentences could not both hold — "at most one email per site per rolling 7 days" and "recovery
clears `last_health_email_at`" — because every opening follows a recovery, so the cap never held and
a site that broke, was fixed and broke again in one week was emailed twice. The owner chose that:
every break a customer has to act on is told once, and a fix resets the count. FR-C5's "regardless
of transitions" is amended to say so; a site that STAYS broken is still told once (`transitionOf`).
- Targets: ✅ PRD §5 FR-C5 · ✅ Story 3.7's I/O matrix, acceptance criteria and Question 2 ·
  ✅ `lib/health-rule.ts` (`writePlan`, `emailAllowed`'s header) and `health-rule.test.ts` ·
  ✅ `server/site-health.ts`'s header.

## A23 · Step 7 — Story 4.1's Create, one ruling on the section content model, 2026-09-11

Taken as Story 4.1 (the registry format and the annotated-HTML authoring vocabulary) was planned. The
question went to the owner in R-83's shape because `reconcile-designs.md` marks it three times as an
FR-G3 ask with **"no owner; needs one"** — and a `record` cannot be amended to answer itself. He ruled
the same day, on the option the spec had been built on, so nothing in the story's plan moved.

**R-102 — a content prop never crosses a category boundary.** Option 1 of Story 4.1's Question 1,
ruled 2026-09-11: *"Each section keeps its own words."* FR-G3 makes `contentSchema` the **category's**
union, while `reconcile-designs.md` asks three times where a prop two categories both want should live
— `email*` shared between A22 and A3-4 (`:501`), `newsletter*` (`:754`), summarised at `:811`. The
owner ruled that the union is the widest a prop ever reaches: two categories that ask for the same
thing each carry their own prop, and a customer who wants the same words in both types them twice.
**The refusal is the load-bearing half.** A shared prop would mean editing a footer silently rewrites
a section on another page — and it would give a customer who wants the footer's signup to read
differently no way to separate them at all. There is therefore no shared prop, no shared namespace to
hang one on, and no cross-category carry; FR-D19 parks against the category union and nothing wider.
- Targets: ✅ Story 4.1's spec (Always, Never, the Code Map and the ruling under `## Questions for the
  owner`) · ✅ `docs/section-authoring.md` §1, which states it as a rule of the content model and is
  enforced in two places by `packages/library` — a `data-prop` naming a prop its category's union does
  not declare is refused, and `assembleEntry` refuses a `content.json` from another category (Story
  4.1's Dev run, 2026-09-11) · ✅ `epic-4-context.md`. **Deliberately not touched:** `reconcile-designs.md` — it is a
  `record` and its three asks stay as the history of what was open (standing rule 5); `prd.md` FR-G3,
  which already says `contentSchema` is the category's union and needed no amendment, only a decision
  that nothing widens it.

## A24 · Step 7 — Story 4.5's Create, two rulings on the control vocabulary, 2026-09-13

Taken as Story 4.5 (the controls engine and the control vocabulary) was planned, because that story writes
the vocabulary once for the whole library and two things in it had no single answer. Both went to the
owner in R-83's shape under `## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-5-the-controls-engine-and-the-control-vocabulary.md` and were
ruled the same day.

**R-103 — Background role keeps its five roles, and there is no "None".** Question 1, option 1, ruled
2026-09-13. Three rulings disagreed: R-23 (27 August) refused an `Inherit` value; the Comments session
(29 August, `A28 Comments - Spec.md:1253-1276`) gave the shared row "None: show whatever is behind" in every
category, for 10 Slim; and the Archive Headers session (30 August, `A29 Archive Headers - Spec.md:1195`)
said the product "is not being asked for a 'same as the page' value". The PRD kept five throughout
(`prd.md:271`, `:948`; `sections-inventory.md:35`). **He asked whether "None" looks the same as "Base", and
challenged the first answer — "on every page" — which overreached.** Re-checked the same day across every
category (the sweep is recorded in Story 4.5's spec, `## Verification`): **for a section in the normal stack
it does** — sections are placed one after another, never inside one another (`prd.md:222`, `:631`), so the
page is behind them, painted in the pack's background colour, which is Base. **It does not for the designs
that sit over something else:** A1·4's header over the hero picture, A6·13's card over the footer, every bar
or card that pins or floats over scrolling content (A1's sticky headers, A2's sticky bars and 11 Toast,
A3·16, A22·14, A24·13, A29·14, A32·11, A34·7), and the paywall, pagination and card treatments that render
inside the article or the feed. **None of those takes its see-through look from the Background row** — each
is locked, keeps a ground of its own, or has its own control — and his rulings refuse see-through while
pinned (`A1 Headers - Spec.md:347`; `A2 Announcement Bars - Spec.md:66`). No drawn row anywhere offers a
see-through choice, so the five roles remove nothing. **A design whose look is what is behind it locks the
row with no value marked and says why** (R-69), as `A1-4 Overlay.dc.html:86` draws it and A22·14, A15·5,
A14·9 and A16·10 draw in their own words; 10 Slim is built that way — not at "None", and not locked at Base —
and such a root carries no `data-bg`. A design that merely paints no ground in the stack may still lock at a
value (A20·14 at Background).
- Targets: ✅ Story 4.5's spec (Always, Never, the I/O matrix, Design Notes and the ruling) · ✅
  `epic-4-context.md` · ⬜ `docs/section-authoring.md` (the no-value lock) · ⬜ `deferred-work.md`, an entry
  for A28's category story, whose frames draw "None" (both in Story 4.5's Dev run). **Deliberately not
  touched:** the export (R-74) and `reconcile-designs.md` (a `record`); `prd.md` FR-F3 and Appendix C, which
  already say five.

**R-104 — the icon picker offers every Tabler icon, outline and filled, grouped by Tabler's own
categories.** Question 2, ruled 2026-09-13, widening option 1: *"Every tabler icon - grouped by how tabler
does it in category. Include Outlines and Filled icons too. User should be able to choose from
Filled/Outline/Both and then also see icson grouped by Categories."* There is no curated subset: every icon
Tabler publishes, brand logos included, each in the category Tabler files it under, with its filled drawing
where Tabler has one; the picker's Outline · Filled · Both decides which styles show, and Tabler's
categories replace the six drawn filters. It widens D1's and R-26's curated subset and supersedes P0-2's
"curated" header and its Social group of exactly nine; the nine-platform rule stays with the social-link
rows that read Ghost's nine fields.
- Targets: ✅ Story 4.5's spec · ✅ `epic-4-context.md` · ✅ the R-26 row above · ⬜ `prd.md` FR-F1 (`:267`)
  and Appendix C's Icon Picker row (`:950`) · ⬜ `DESIGN.md` § Icons (`:556-561`) · ⬜
  `docs/section-authoring.md` (all three in Story 4.5's Dev run). **Deliberately not touched:** the export,
  whose P0-2 frame stays as drawn (R-74).

## B · Approved decisions superseded by this session

Standing rule: D1–D39 were settled on 2026-08-24 and are not reopened — **except** where step 4a
found one unbuildable or colliding. Four qualified. Each is marked reversed in
`CONTROL-PROMPTS.html` §Decisions with this file as the reason.

| Decision | Was | Now | Ruling |
|---|---|---|---|
| **D3** Search engine — MiniSearch vendored in `search-overlay`, FR-G7's zero-third-party rule gains a scoped exception | reversed | **Ghost's native search only.** No engine, no module, no exception; FR-G7(1) restored whole | R-24 |
| **D17** Comments accent — offer consented seeding of Ghost's accent setting | reversed | **Linked to, never written.** AD-10's allowlist stays at four | R-22 |
| **D26** Gap names settle on Tight/Even/Airy library-wide | reversed | **Tight · Normal · Loose.** `Appendix C` does not move | R-14 |
| **D27** Uploaded videos get "Ambient loop" (muted); embeds keep the autoplay refusal | **half** reversed | Upload is cut, so the Ambient loop goes with it. **The embed autoplay refusal stands** | R-9 |

Confirmed unchanged by this session, having been challenged: **D2** (the precedent R-5 follows),
**D5** (its compile shape now named — R-20), **D6** (R-18), **D11** (its pattern generalised — R-16),
**D15** (R-29), **D19** (R-15), **D31**, **D39**.

---

## C · Executed during the session — new external facts

These are Ghost facts established by execution on 2026-08-27 against **T1** `ghost6.inflozo.com`
(6.58.0) and **T3** `ghost5.inflozo.com` (5.130.6). Per standing rule 4 they are **proved** here and
must **live** in `MEASUREMENTS.md` (a new section) and `VERIFY-AT-BUILD.md` — this file is not their
home. `MEASUREMENTS.md` is `live` in `INDEX.md`, so the merge appends; nothing here edits a `record`.

### C-1 · The members signup endpoint is JSON-only and token-gated *(closes probe family 2)*

`POST /members/api/send-magic-link/`:

| Sent | Ghost 6.58.0 | Ghost 5.130.6 |
|---|---|---|
| form-encoded, no token | 400 `BadRequestError` | 400 **"Email is required."** |
| JSON, no token | 400 `BadRequestError` | 500 `EmailError` — *accepted*, SMTP absent |
| `GET /members/api/integrity-token/` | 200 + token | 200 + token |
| JSON **with** token | 500 `EmailError` — *accepted* | 500 `EmailError` — *accepted* |
| form-encoded **with** token | 400 `BadRequestError` | 400 **"Email is required."** |
| follow redirects on the native shape | none — ends on the API URL | none — ends on the API URL |

**Three independent findings.** (1) The endpoint never parses `application/x-www-form-urlencoded` —
row 5 proves it with a *valid* token, and Ghost 5 says so in words. A native `<form>` cannot send
JSON, so its own submit can never reach this endpoint on either major. (2) Ghost 6 additionally
requires an `integrityToken` obtained from a separate GET, which a plain form cannot perform.
(3) There is no redirect back; a native submit would land the visitor on raw JSON, leaving no page
for CSS to style.

**The `loading` / `success` / `error` classes are real** — `portal.min.js` does
`document.querySelectorAll('form[data-members-form]')`, attaches a `submit` listener, and applies them
itself. The designed states work; the no-JS promise does not. **Ghost's documentation at
`docs.ghost.org/themes/members` states none of this** — record it as a docs gap so the question is
not reopened from the docs alone.

### C-2 · Ghost's own overlays are sealed *(closes probe family 31; deletes families 8 and 9)*

- **`sodo-search` 1.8** renders in an **iframe** (`contentDocument.documentElement` / `.head` /
  `.body`) with an injected stylesheet — theme CSS reaches nothing inside; only `brandColor` crosses.
  Triggered by `[data-ghost-search]`, by `#/search` / `#/search/`, and by ⌘K.
  Its index endpoints are `/ghost/api/content/search-index/{posts,tags,authors}/`, and the live
  posts index returns exactly `id, slug, title, excerpt, url, updated_at, visibility` — **no body**.
  Both majors.
- **`portal` 2.69** has `getPageFromLinkPath → {page:'share'}`; **`portal` 2.51 does not**. Portal's
  share page offers X · Facebook · LinkedIn · Threads · Bluesky, fixed order, no Mastodon, inside a
  shadow-DOM iframe.
- Both are loaded from jsDelivr at a **floating minor range** (`@~1.8`, `@~2.69`), so their internals
  may change without a Ghost upgrade. **Never depend on their markup or class names.**

### C-3 · `filter="id:[…]"` discards the requested order *(closes half of probe family 1)*

Requested `D, C, B, A`; both majors returned `A, B, C, D` — `published_at desc`. Hand-picked order
therefore costs one `{{#get}}` per picked item. **Still to measure:** the per-template abort
threshold (`appendix-b1 §5`), which fixes R-20's cap.

---

## D · Counts and registries that are re-derived at the merge

Per standing rule 3 no figure is restated here; each is stated as the rule that produces it.

- **The library total** — the export is the count. D11's re-derivation now applies library-wide
  (R-16), less A23's cut designs (R-24). Placeable / non-placeable arithmetic is made consistent in
  the same pass. FR-G1's internal disagreement (457 + 28 vs "456 of the 484") resolves by derivation.
- **`[Free]`** — two per category (R-17). Every spec carries the marker.
- **The behaviour registry** — re-derived from: **+`nav-transform`** (D2), **+`contact-form`** (D28),
  **+`group-headings`** (R-1), **+`header-scroll`** (R-3), **−`search-overlay`** (R-24),
  **−`search-expand`** (claimed by no design). `typewriter`, `confetti` and `shuffle` are dropped or
  re-homed; every row's design list is re-derived from the export. `member-form` gains the OTC branch
  (D36) and the expired-redirect branch (A30). FR-G7's "31 modules" and FR-G8's "all 31" become the
  derived count. ✅ **Done** — and `confetti` was deleted too on 2026-08-31, no design having
  declared it.
- **Multi-module sections** — FR-G7(2) gains one sentence: **a design may declare N modules; the
  compiler emits the union and each `§7` line is restated** (A1, A4, A14, A15, A22). **R8 closes.**
- **Probe families** — 41 less families 2, 8, 9 and 31; family 1 reduced to its budget half.
- ~~**`tools/tuple-check.py`** reads `derived-fields-A1-A12.md` (186 designs) and cannot see the
  native tuples that now outrank them.~~ ✅ **Done.** It reads the export through
  `tools/export-roster.py` and gates every live design; `derived-fields-A1-A12.md` is retired.

---

## E · Execution list — what still needs a `/bmad-build` probe run

Run against **T1** and **T3** (`tools/probe/.env`, pattern `tools/probe/run-verify-all.py`) **before
the inventory merge**. Results land in `MEASUREMENTS.md`, `VERIFY-AT-BUILD.md` and the companion each
row names. The full per-category probe text stays in `reconcile-designs.md` §(a).

> **ALL FOUR ARE RUN.** E-1 on 2026-08-27, E-2/E-3/E-4 on 2026-08-31. **Three of the four refuted or
> materially changed the premise of the ruling that asked for them** — E-1 found no per-template
> `{{#get}}` budget, E-2 found no carve-out was needed, E-3 found the "confirmatory" question was the
> mechanism behind an invariant. That ratio is the argument for standing rule 1, not an anecdote.

**Newly blocking on a ruling above:**

| # | Claim | Fixes |
|---|---|---|
| E-1 | The per-template `{{#get}}` abort threshold (`appendix-b1 §5`); time 12–24 single-id gets on one template | **R-20's cap** — the only number in this file left unmeasured |
| ~~E-2~~ | ✅ **RUN 2026-08-31 — §31a, `tools/probe/run-verify-e2.py`, two controls passed.** The field is a **SafeString**: `{{ }}` and `{{{ }}}` are byte-identical on both majors, so **R-10 #7 is WITHDRAWN** and AD-5(2) does not move. Found instead: Ghost 6 sanitises the field at render, Ghost 5 does not (register **53**) | **R-10 #7 — refuted** |
| ~~E-3~~ | ✅ **RUN 2026-08-31 — §31b, read in source on both majors.** NOT confirmatory: with `cacheMembersContent` on, a member's page is cached **public, keyed on tier alone**, so any non-tier `@member` value would be served to every other member on that tier. This is the **mechanism** AD-38 was missing (register **54**) | **R-28 — confirmed, and given its failure mode** |
| ~~E-4~~ | ✅ **RUN 2026-08-31 — §31c, `web-features` 3.36.0.** `details-name` is Baseline **Newly** until **2027-03-03**, so at the 2026-08-18 pin the **Tier-2 entry is REQUIRED** and R-15's wording stands. D19's degradation window is now named: **Firefox 122–129 only** (register **55**) | **R-15 — confirmed** |
| **E-5** | The 2026-09-04 export prints two Ghost Admin paths as product copy: B12b's "Ghost keeps your previous theme under **Settings → Design**" and C3b's "**Settings → Membership**". Both are cited from prompt A7's own wording, not executed; the backup gate's lesson (2026-09-02) was that a hard-coded Ghost Admin path goes stale between majors. Read the admin bundle strings on 5.130.6 and 6.58.0 (the pattern in `MEASUREMENTS.md` §33) and record whether the labels exist under those names on both | If either is wrong on a major, the copy moves to a description plus a link out (the B16 pattern) — an A9 item, and the 5b annotation beside each |

**Unchanged and still open:** families 3–7, 10–30, 32–37, 39–41 as written in `reconcile-designs.md`,
with families **2, 8, 9 and 31 struck**, family **1** reduced to E-1, and **family 36's oEmbed half
CANCELLED** (ruling R-35, 2026-08-31 — nothing fetches from a provider, so there is no CORS question
left to test; the CSS-budget half of that family is a separate register item and stands). Families 38–41 are not Ghost
probes (Baseline tooling, browsers and AT, font files, the app's own keys) and stay listed so they
are not lost.

---

## F · What this session did not reach

> **SUPERSEDED 2026-08-31 — read `§A3` first.** This is the 2026-08-27 session's own record of what it
> ran out of time for, and it is kept as that record. **All nine asks below have since been ruled:**
> seven by the owner as **R-32 … R-38**, and three as architecture (R18's AD-27 row shapes, R24's CSS
> emission order, R13's remainder). Nothing in the list below is still an open question; what remains
> is landing those rulings in the documents they name.

Ruled tonight: the 66 ghost-infeasible findings in full, the five decision collisions, and the
library-wide rulings that collapse the 1,078-row register. **Not** ruled, and owed before E4/E9 open:

- **R5** — pack tokens under AD-30 (`contrast` per mode, on-contrast, accent-on-contrast, dark
  hover-surface, scrim, dark elevation, negative, plate, tabular figures, pill radius, drop-cap
  ratio). No register row; FR-E1 / `Appendix D` must gain one. Reaches ~20 categories.
- **R13** — the FR-H2 delta set (authors and tags source shapes, the sixth `fallback` field,
  designation as a stored state, the layout-level get budget, `feature_image:-null` as a precondition,
  the zero-archive message's owner).
- **R14** — FR-F7 / FR-D19 dependency vocabulary (a value disabling or resolving a sibling,
  conditional value availability, the carry rule for an illegal carried value, A18-4's fourth
  "derive" behaviour).
- **R18** — the AD-27 row shapes (main-feed designation, pager control values, card overrides,
  membership-pages record, share destinations).
- **R20** — `mode-toggle` versus a pinned `color_scheme`; `{{comments mode=…}}` as a second mode
  selector.
- **R22** — per-width module declaration / breakpoint-conditional activation (A2-15, A13-15, A3).
- **R23** — intrinsic dimensions on assets (AD-12 / FR-K2); server-side oEmbed fetches (AD-10/AD-23).
- **R24** — `cards.css` ↔ per-design CSS emission order; the `.kg-*` ownership line between A25 and
  A33 (R-6 fixed the claims, not the order).
- **R25** — exactly one Post Content section per template; the paywall-cut DOM contract.
- **D10's string sweep** — mechanical, and `appendix-h1` absorbs it at the merge per §37.8. No ruling
  needed; two systematic defects to fix in the same pass (prop defaults that disagree with the
  catalog default, and keys cited that do not exist).
- The **editor surfaces with no frame** and the **flows drawn on wrong semantics** (§37.7) — these
  belong to **step 5** (`/bmad-ux`), not to this room.
