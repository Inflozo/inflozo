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
| **R-3** stylesheet doing a script's job | ✅ FR-G8 Tier-2 (`mask-image` — Tier 1 by recompute since Story 4.8, §A25), A32's fade re-pointed in `research-contested-variants.md` | ⬜ |
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
| **R-27** inline-token allow-list | ✅ FR-G3, FR-D4, FR-F6 · **amended for one token by R-182** (§A37): `{page_number}` is accepted by every text and richtext prop and declared by none, and every declared token now carries a one-line description (R-185) | ⬜ |
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

*Propagates to:* FR-G8 (Tier-2 list: `<details name>`; also rule `mask-image` — Tier 1 by recompute since Story 4.8, §A25 — and `fetchpriority`,
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

*Erratum (Story 5.15, 2026-09-22):* this entry's TITLE reads its own sense backwards — "the script does not run in
the editor" is what edit-safe **no** means. The ruling is the body's sentence, which every document since carries: a
module is edit-safe if it **may run** inside the editor canvas without interfering with editing. The title is left as
it was ruled, and this line is the correction.

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
  `epic-4-context.md` · ✅ `docs/section-authoring.md` (the no-value lock — § 2's Controls part, the
  `universals` narrowing and its refusal rows in § 4) · ✅ `deferred-work.md`, DW-105 for A28's category
  story (Story 10.95), whose frames draw "None" — with DW-111 for the spec tables that list the row open
  where the panel locks it (both in Story 4.5's Dev run, 2026-09-13). **Deliberately not
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
- Targets: ✅ Story 4.5's spec · ✅ `epic-4-context.md` · ✅ the R-26 row above · ✅ `prd.md` FR-F1 (`:267`)
  and Appendix C's Icon Picker row (`:950`), and FR-Q7's treatment icons (`:371`) with them · ✅ `DESIGN.md`
  § Icons (`:556-561`) · ✅ `docs/section-authoring.md` § 2 (the set, the `-filled` key, inline emission and
  where Tabler's licence lives) · ✅ `epics.md` Story 4.5's criteria and Story 7.13's treatment icons, found by
  the standing-rule-7 grep (all in Story 4.5's Dev run, 2026-09-13). The licence file in the emitted theme
  and the icon budget have no Epic 7 story yet — DW-108. **Deliberately not touched:** the export,
  whose P0-2 frame stays as drawn (R-74).

## A25 · Step 7 — Story 4.8's Create, one ruling on the Baseline allowlist, 2026-09-14

This was taken while Story 4.8 (the Baseline floor and the three tools that enforce it) was being planned. Running
the floor against the data it is computed from split FR-G8 in two. The question went to the owner in R-83's shape,
under `## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-8-the-baseline-floor-and-the-three-tools-that-enforce-it.md`, and he
ruled the same day.

**R-105 — `text-wrap: pretty` stays on the Tier-2 allowlist, as its one named exception.** Question 1, option 1,
ruled 2026-09-14: *"Keep it, as the one named exception on the list."*

- **What split.** FR-G8 (`prd.md:303`) defines Tier 2 as Baseline **Newly** features, and in the same paragraph
  opens the list at `text-wrap: pretty`. `web-features` 3.35.0, the dataset research §A3 computes the floor from,
  marks `text-wrap-pretty` **not Baseline**, and so does 3.38.0: Chrome 117 and Safari 26 support it, Firefox does
  not. Both halves could not hold.
- **Why it stays.** The export uses it on headings, captions and body text in nearly every design
  (`A8-2 Three Up.dc.html:35`; the render kits carry it 76 times). Its absence is ordinary line breaking, which is
  the design's own unstyled state and therefore Tier 2's condition.
- **The refusal is the load-bearing half.** Option 3, admitting any feature like it, was declined:
  - the exception is this one feature by name;
  - a second feature that is not Baseline needs its own ruling;
  - the entry carries no Widely date and is re-read at every check, so it becomes an ordinary Newly entry, with its
    date, once Firefox ships it.
- **Settled by FR-G8's own recompute rule, not ruled, and recorded so nobody asks again.** `mask-image`, which R-15
  carried to the Tier-2 list, is already Widely on the pin (`masks`, 2026-06-07). It is Tier 1 and needs no entry.
- Targets: ✅ Story 4.8's spec (the I/O matrix, Tasks, Design Notes and the ruling) · ✅ `epic-4-context.md` ·
  ✅ `packages/library/baseline.json` and `tools/check-baseline.mjs` (the exception named once, and refused for any
  other feature) · ✅ `prd.md` FR-G8 · ✅ `research-section-js-libraries.md` §6.5 · ✅ `docs/section-authoring.md`
  (all in Story 4.8's Dev run, 2026-09-14; `mask-image` left FR-G8's Tier-2 sentence for Tier 1 in the same run,
  MEASUREMENTS §43). **Deliberately not touched:** the export (R-74), and `reconcile-designs.md`, a
  `record`.

## A26 · Step 7 — Story 4.9's Review, two rulings on blank phrases, 2026-09-14

Taken at Story 4.9's code review (the string catalog and the `{{t}}` contract). Both questions went to the owner in
R-83's shape under `## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-9-the-string-catalog-keys-english-defaults-and-the-t-contract.md`,
and he ruled the same day.

**R-106 — A blank translation override is refused, never shipped.** Question 1, option 2, ruled 2026-09-14: *"A blank
is refused. The build stops with a message naming the phrase, and the customer has to type something before the site
can be published."*

- **Why it was a question.** `resolveStrings`, the one door an override passes (S7), let `""` through: the canvas
  printed nothing, the locale file carried `""`, and Ghost prints the key itself for an empty value (MEASUREMENTS
  §44, recorded on T1 and T3).
- **What it binds.** `resolveStrings` throws on a blank or whitespace-only override, naming the key. The Translations
  surface (Story 7.12) must therefore refuse a blank at save, or offer "reset to the standard wording" as its own
  action, never store `""`. Options 1 (blank means default) and 3 (blank ships blank) were declined.
- Targets: ✅ Story 4.9's spec · ✅ `packages/library/src/catalog.ts` and its test · ✅ `docs/section-authoring.md`
  · `epic-4-context.md` ✅ · **Story 7.12's spec, when created** (open).

**R-107 — A catalog-linked prop is never blank.** Question 2, option 1, ruled 2026-09-14: *"Yes, keep it."* An
S6 prop's "untouched" state is an empty value, so clearing the text shows the catalog string again on both emitters;
a design that wants an icon-only control uses an ordinary text prop, and no such control is ever left without a
name. No code changed. Targets: ✅ Story 4.9's spec · ✅ `epic-4-context.md`.

## A27 · Step 7 — Story 4.10's Create, two rulings on the pilot set and page numbers, 2026-09-15

Taken as Story 4.10 (the five pilot sections, editor-perfect, with the snapshot harness) was planned. Checking each
pilot against the export found one row of §8's pilot table describing a design that no longer sits at its number,
and DW-97 had routed its question to this story. Both went to the owner in R-83's shape under
`## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-10-the-five-pilot-sections-editor-perfect-with-the-snapshot-harness.md`,
and he ruled the same day.

**R-108 — the fifth pilot is A4 #13 Latest Post, not A4 #2.** Question 1, option 2, ruled 2026-09-15: *"Switch to
Latest Post (A4 #13)."*

- **Why it was a question.**
  - §8's row (`prd.md:767`) says A4 #2 carries "rich text with all four marks, a guarded media binding with `srcset`,
    and the heaviest control set in the library". That reason was written for the pre-merge #2, "Split Editorial —
    oversized headline left, feature image right" (`.v3.0-backup/sections-inventory.md:90`).
  - The 2026-09-04 re-derivation renamed the row and kept the reason word for word.
  - Today's A4 #2, Flush Left, has no picture (`A4 Heroes - Spec.md:136`) and five controls, and no hero is the
    library's heaviest (A18 #15 Load More has fourteen rows).
- **What the pilot now carries.**
  - A hero's authored text and actions, beside a `{{#get}}` card whose feature image is a guarded media binding with
    `srcset` (FR-H8).
  - A query that always shows exactly one post.
  - The most settings of any Heroes design (`A4-13 Latest Post.dc.html:240-258`).
  - It is the only pilot that fetches by query, which §7.3's exit construct 1 had no pilot for.
- **The piece it adds, named in the option he chose.** A query the design fixes offers no Show and no Order in the
  Data group, and a stored count or order cannot change it. It is `DataBinding.fixed` in Story 4.10's spec.
- **Not carried, and why.**
  - "All four marks": the Heroes field list allows links only inside the sub (`A4-0 Category Proof.dc.html:327`),
    against the category rule at `A4 Heroes - Spec.md:61`. A4's category story settles which one holds.
  - "The heaviest control set in the library": no hero is.
- Targets:
  - ✅ Story 4.10's spec · ✅ `epic-4-context.md`.
  - Landed by Story 4.10's Dev run (2026-09-15):
    - ✅ `prd.md` §8's pilot row;
    - ✅ `epics.md`'s pilot table (`:480`) and Story 4.10's criteria (`:1469-1470`);
    - ✅ `ARCHITECTURE-SPINE.md` AD-35's `a4/2`;
    - ✅ `build-sequence.md:1268-1269`, and `STEP-6-PROMPT.txt` regenerated from it;
    - ✅ `docs/section-authoring.md` (`fixed`), and `DataBinding.fixed` in `packages/library` and the controls engine.
- **Deliberately not touched:** the export (R-74), and `reconcile-designs.md`, a `record`.

**R-109 — a list of posts shows no row of clickable page numbers.** Question 2, option 1, ruled 2026-09-15: *"No —
keep 'Newer posts · 5 / 11 · Older posts'."*

- **What it closes.** `data-pagination="numbers"` stays the "5 / 11" indicator, the one form both emitters produce
  identically from Ghost's own context. DW-97's product question is closed.
- **What was checked, and recorded so nobody asks again.**
  - Ghost 5.130.6 and 6.58.0 compare numbers in `{{#match}}` (`core/frontend/helpers/match.js`) and link any page with
    `{{page_url n}}` (`helpers/page_url.js:11-16`).
  - So a short row with no script is buildable, but with no arithmetic its trailing gap cannot always be exact.
  - The full row needs a script. Both options were declined.
- **What it binds.**
  - A34's category story redraws A34 #1 Numbers to the indicator form.
  - No module for page numbers is added to the registry.
- Targets:
  - ✅ Story 4.10's spec.
  - Landed by Story 4.10's Dev run (2026-09-15):
    - ✅ `deferred-work.md` (DW-97 closed, and an entry for A34's category story);
    - ✅ `docs/section-authoring.md` § 3 "The three the shim owns";
    - ✅ the comment on `data-pagination`'s `numbers` branch in `packages/section-runtime/src/core.ts`.

## A28 · Step 7 — Story 4.10's Dev, a ruling on the words on a main button, 2026-09-15

Raised by Story 4.10's Dev run, when axe on the deployed `/pilots` failed `color-contrast` on the main button of Rail,
Inline Row and Latest Post in Light, and nowhere else (DW-158). Asked in R-83's shape as Q3 under
`## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-10-the-five-pilot-sections-editor-perfect-with-the-snapshot-harness.md`.

**R-110 — words on the accent are the ink, not white.** Question 3, option 1, ruled 2026-09-15: *"Dark words on the
orange, as Dark mode already does."*

- **Why it was a question.** The export's Paper objects draw white on `#D96C3F` (`_build/a22lib.js:4`), which is 3.41:1
  by WCAG's formula; button-sized text needs 4.5:1. R-74 makes the export the authority, so departing from it is a
  ruling.
- **What it binds.** Light `--text-on-accent` is `#232019`, Paper's own body ink (4.77:1). The accent itself does not
  move, and Dark (`#171511` on `#E0805A`, 6.43:1) already had this shape. Epic 6's Paper pack authors the same value.
- Targets:
  - ✅ Story 4.10's spec · ✅ `packages/section-runtime/src/tokens.ts` and `reference-tokens.css` ·
    ✅ `deferred-work.md` (DW-158 closed).
- **Deliberately not touched:** the export (R-74).

**R-111 — header dropdowns are built on Inflozo's own menu file, never on Ghost's default menu markup.** Question 4,
option 1, ruled 2026-09-15: *"Keep this story as built, and require the Headers story to use Inflozo's own menu file."*
The owner's reply that set it: "All menus have dropdown items. I do not want that to be affected. Users should be able
to add dropdown navigation too."

- **Why it was a question.** T1 and T3 printed `/` for every bare `{{url}}` inside `{{#foreach @site.navigation}}`
  (MEASUREMENTS §45), so Story 4.10's Dev run built A1 #1's nav on `{{navigation}}` — an Ask First. Ghost's default
  menu is one sealed `<ul>` (`core/frontend/helpers/tpl/navigation.hbs`), so a dropdown authored in Inflozo could not be
  placed under a chosen item without a script, against the no-JS `<details>` rule (`A1 Headers - Spec.md:170`, `:187`).
- **Read in source, both releases (5.130.6 and 6.58.0), not yet recorded.** Ghost's navigation settings carry only
  `label` and `url` (`helpers/navigation.js:41-51`); the helper hands each item `label`, `url`, `slug` and `current`
  and renders the partial named `navigation` (`:76-89`, `theme-engine/handlebars/template.js:14-28`); the theme's own
  `partials/` directory is registered after Ghost's helper templates (`theme-engine/engine.js:14-22`), so a theme's
  `partials/navigation.hbs` replaces the default.
- **What it binds.**
  - A1 #1 keeps `{{navigation}}` in Story 4.10; nothing in that story grows.
  - Story 9.1 records a theme-supplied `partials/navigation.hbs` on T1 and T3 first (AD-23), then builds both
    dropdown sources of `A1 Headers - Spec.md` §0·5 (`:87-91`) on it — children authored in Inflozo, and the `+`/`-`
    prefix scheme — with every dropdown a native `<details>` that opens without JavaScript and the current page marked
    from Ghost's `current`.
  - No header design builds dropdowns on Ghost's default menu markup.
- Targets:
  - ✅ Story 4.10's spec · ✅ `epics.md` Story 9.1 · ✅ `deferred-work.md` (DW-150).
- **Deliberately not touched:** the export (R-74).

**R-112 — a link in Light is ink words with the accent underline.** Question 5, option 1, ruled 2026-09-15: *"Ink words
with an orange underline."*

- **Why it was a question.** Story 4.10's review measured the reference token set's Light `--link-color`, the Paper
  accent `#D96C3F`, at 3.24:1 on the page ground `#FBF9F5` — under WCAG AA's 4.5:1 for text, the rule R-110 applied to
  the button words. No pilot reads the token yet; the first design that colours a link with it would fail Story
  4.11's matrix. No Paper object names a link colour, so the value was the Dev run's, and the export's own treatment
  of a hovered nav item is ink with a 2 px accent underline (`A1 Headers - Spec.md`, A24 #1's tag and author).
- **What it binds.** Light `--link-color` is the ink `#232019` and `--link-decoration` is `underline #D96C3F`, in
  `packages/section-runtime/src/tokens.ts` and the emitted `reference-tokens.css`. Dark is unchanged: `#E0805A` on
  `#171511` is 6.43:1. Epic 6's Paper pack takes the same values; the contract (its two link rows) did not change.
  *(Applied since **R-173**, 2026-09-21: the token block gives every plain link these two tokens.)*
- Targets:
  - ✅ Story 4.10's spec · ✅ `deferred-work.md` (DW-155) · ✅ `tokens.ts` and `reference-tokens.css`.
- **Deliberately not touched:** the export (R-74).

## A29 · Step 7 — Story 4.10's owner test, three rulings on the settings panel, 2026-09-15

Taken at the owner's test of Story 4.10 on the deployed `/pilots`. He found the panel's settings in the wrong
accordions, a pinned block of settings above them, long choices crammed into pills, and a whole-design reset that
neither showed an icon nor asked first. Two questions followed in R-83's shape under `## Questions for the owner` in
`_bmad-output/implementation-artifacts/spec-4-10-the-five-pilot-sections-editor-perfect-with-the-snapshot-harness.md`:
Q6, where to fix it — option 1, *"Fix all four inside Story 4.10"*, with his instruction for the fix: "do multiple
thorough sweeps across all controls engine and vocabulary, so that the controls are perfectly grouped … it is the base
on how the controls will appear for later sections" — and Q7, below. Story 4.5 built the panel and is done; its
spec is not amended, because it records what he tested then.

**R-113 — every setting sits in the accordion its role names: Section Settings · Content · Layout · Style · Data,
and nothing is pinned above them.** His finding 1 in his words: "all controls should be grouped based on their role
under — a. Content (any content changes) b. Style (any visual/design changes) c. Layout (any layout changes) —
Arrangement can be moved under Layout. d. Data (controls to choose source of data)", and finding 2's top block into
"a new accordion group at top — Section Settings". Question 7, option 1, ruled 2026-09-15: *"Every setting goes to its
role; Section Settings holds only what fits no role."*

- **What it supersedes.** FR-F3's "3–5 Quick Controls pinned on top, then Content / Arrangement / Style / Data", and
  with it FR-G3's `quickControls[]`, recovered from the first entries of a design's control list; the Kit's
  quick-controls card (`Editor Sidebar Kit.dc.html:195`) and S4c's pinned card are no longer drawn in the panel. The
  group FR-F3 named Arrangement is Layout. The export's P0·5 puts a feed's meta toggles (date · author · excerpt ·
  reading time · tag chip) in the Data group; what a card shows is Content, as the ruled example's Excerpt, Meta and
  Tag are, and Data keeps Source, Count, Order and what shows when nothing matches. The design picker is unaffected:
  it is chosen above the groups (FR-D19), and *layout* names this group, never a design (Appendix I).
- **The example he ruled on, and which therefore binds the reading.** Three Up: Content — its words, Excerpt, Meta,
  Tag · Layout — Per row, First cell · Style — Image ratio, Background role, Vertical spacing, Top divider · Data —
  Show, Order. Rail: Section Settings — On scroll (Static · Sticky · Shrink), "which is how the header behaves, not
  its content, look or layout". *(The question's "Data — Show, Order" for Three Up was the question's own slip: Three
  Up's feed declares no query, so its Data rows arrive with Story 5.19; Data appears on a design that declares one,
  as the controls sample's Show and Order do.)*
- **What it binds.**
  - Content is what the section shows; Layout where things sit; Style how it looks, with every kind of spacing and the
    three universal controls at its foot (the ruled example puts Vertical spacing there); Data which Ghost content
    feeds it; Section Settings only how it behaves — over time, on scroll, on interaction, or for whom. A setting that
    mixes Off with other values takes the role of what its other values change.
  - The role is judged by what a setting DOES, never by its title: the export gives one title different settings in
    different categories ("Order: Newest · Oldest" chooses Ghost's rows; "Order: Value first · Label above" arranges a
    stat). So a row title holds one group WITHIN A CATEGORY, except on a design the register names, and not across the
    library; a control's `name`, the author's own word, holds one type, one value set and one group across the library,
    as R-53 rules — Centred's author line became `byline` beside Three Up's `meta`, which had carried two value sets.
  - Behaviour is none of the four roles even when it draws something, so the decision order asks Section Settings
    last, and a behaviour is set aside from each earlier question. Member visibility is filed there wherever a panel
    carries it; whether the settings panel or Layers does is Story 5.4's to settle (the PRD's FR-D5 and the export's
    A4-13 panel disagree) — DW-163.
  - Checked, not asserted: the rule was applied to every setting every category of the export declares, by two
    independent passes, each disagreement settled into the rule's wording, and one more sweep for one group per kind
    across categories — the decision order, its tie-breakers and the table of kinds in `docs/section-authoring.md`
    § 2 are that result, and **`packages/library/control-groups.json` files every one of those settings under its
    group**, by category and panel title, so a category story reads its designs' groups rather than deciding them
    again. `tools/check-snapshots.mjs` holds every built design to it and fails a setting it does not file, or whose
    title its own frame does not draw (R-74), so a setting cannot leave its group by being renamed in the same edit.
    The five pilots, grouped before the sweep, matched it setting for setting.
  - Each title is the one the design's drawn panel prints (DW-111); a labelled group's rows are filed under the titles
    the panel prints ("Actions › Sign in" is "Sign in"). Where the export's titles would repeat in one panel (R-13), its
    usual practice decides which gives way: a setting beside a field of the same title keeps its title and the field
    takes one of its own, as the export does in A27–A31 ("Heading text", "Description text", "Eyebrow text") and A22 #1
    does ("Blurb text") — so A17's "Title: Large · Display" stays "Title" and its category's Title field gives way;
    where a frame draws the pair apart another way, its words stand (A4-10's "Show how long it runs" beside its "How
    long it runs" field). Two settings, or a setting and its accordion, take the export's own other title for that
    setting — A4 #9's button style, drawn "Primary action" beside its Primary action toggle, is filed as "Action style"
    (A6's word), so A4 #13 keeps the toggles its frame draws; A34 #9's "Content" has A34's "Contents". Where the export
    has no other title (A24 #15's and A34 #3's "Layout"), the story that builds the design names it. A rename is filed
    per design (`{ "group", "renames": { "<n>": "<drawn title>" } }`), which is how the frame check finds the row it
    replaces. Every such title is the owner's to see (R-83) in that story; DW-166 lists the repeats the export draws.
- Targets: ✅ Story 4.10's spec · ✅ `packages/library/src/vocabulary.ts` (`CONTROL_GROUPS`, `SIDEBAR_GROUPS`, each
  universal's `group`), `registry.ts` (`quickControls[]` withdrawn; `categoryControlUnion` refuses one name in two
  groups), `validate.ts` (`dependency-order`) · ✅ `packages/library/control-groups.json` · ✅
  `packages/section-runtime/src/controls.ts` (`sidebar()`, drawing in declaration order) · ✅
  `apps/web/components/controls/sidebar.tsx` · ✅ the five pilots and the controls sample · ✅ `tools/check-snapshots.mjs`
  · ✅ `docs/section-authoring.md` · ✅ `prd.md` FR-F3, FR-G3, FR-H2, Appendix C and Appendix I · ✅ `sections-inventory.md` ·
  ✅ `ARCHITECTURE-SPINE.md` · ✅ `DESIGN.md` · ✅ `epics.md` (FR-F3, FR-G3, Stories 4.1, 4.5 and 5.19, and every library
  category story's control line) · ✅ `epic-4-context.md` (all in Story 4.10's Fix run, 2026-09-15).
- **Deliberately not touched:** the export (R-74); `reconcile-designs.md` and `encode-propagation-map.md`, which are
  `record`s; the step-5b and step-5c prototypes, built from the export for the walk before this ruling; `/kit`,
  which catalogues the Kit as drawn; and `CONTROL-PROMPTS.html`'s prompts, which ran on 2026-08-25 and are kept as
  sent, with a note in its lede.

**R-114 — pills are for short choices; a longer choice is a dropdown.** His finding 3 in his words: "Any property
where the values are larger (E.g. For First cell — the value 'Spans two columns' is larger in character size) we should
show a dropdown. With these large values, the pill design looks bad. We should only show value with less characters in
pill design."

- **What it binds.** A segmented control offers two to four values (Appendix C), each at most `PILL_CHARS` characters
  and each fitting its pill on one line with 2 px to spare either side, measured in the pill's own type in the
  280-wide panel; anything else is a named select. The validator refuses the rest as `pill-words`, so every design
  after this story is held to it without anyone remembering.
- **Why characters AND a measure.** A cap alone lets a word of wide letters overflow ("Wholesomely", eleven letters,
  is 80 px, and with 2 px either side misses a 77.7 px pill, one of three), and a measure alone would make his own example depend on the panel's
  width: "Spans two columns" misses its pill by a pixel and a half (118 px of 116.5), so a track a few pixels wider
  keeps it a pill — and it is his example of what must not be one. The cap puts it in a dropdown whatever the width. Single words only was tried and declined: across the export it
  turned "Flush left · Centred" and "Full bleed · Inset" into dropdowns, which is not what "less characters" means.
- **Checked against the whole export.** Of the value sets it draws as pills, only the long phrases become dropdowns
  ("Spans two columns", "Above and below", "Comfortable 44" …); the universal controls keep their pills.
- **Measured where it is tightest.** The fit is taken against the narrowest track the panel draws, while its own
  scrollbar shows (233 px inside the 280-wide panel), with 2 px to spare either side; the deployed harness compares
  the rule's widths with the widths the browser draws, so a font or size change is caught rather than misjudged.
- Targets: ✅ Story 4.10's spec · ✅ `vocabulary.ts` (`PILL_CHARS`, `pillWidth`, `pillRefusal`) and `validate.ts` · ✅
  A17 #1 First cell and A24 #1 Rule, now named selects · ✅ `docs/section-authoring.md` · ✅ `prd.md` Appendix C · ✅
  `DESIGN.md` § Segmented control · ✅ `epics.md`. **Deliberately not touched:** the export (R-74).

**R-115 — "Reset this design" carries its icon and asks first.** His finding 4 in his words: "At bottom Reset this
design should have an icon too. On click it should prompt the user to confirm their action."

- **What it binds.** The panel's foot carries the Kit's Undo glyph beside "Reset this design", the same glyph every
  changed control's own reset carries. Pressed, it opens a confirm in the app's one dialog vocabulary, shaped on S14c's
  card reset — "Reset this design?", a sentence naming the count and every setting reset would put back
  (`resetChanges`: a greyed row's stored value included, and the Data group's rows), the fear answered second ("Your
  words and pictures stay.", and the dark overrides when there are any), Cancel and "Reset design", focus on Cancel
  (EXPERIENCE.md § Destructive confirms). With nothing changed it asks nothing and says so under the button — R-12's
  rule for a control at its floor, which stays live and explains itself.
- Targets: ✅ Story 4.10's spec · ✅ `packages/section-runtime/src/controls.ts` (`resetChanges`) · ✅
  `apps/web/components/controls/sidebar.tsx` · ✅ `tools/probe/run-verify-pilots.cjs` and `run-verify-controls.cjs` · ✅
  `prd.md` FR-F4 and `epics.md`'s FR-F4 line. **Deliberately not touched:** the export (R-74), whose D5 draws the line with no confirm.

**R-116 — a red render matrix does not block publishing the app.** Story 4.11's Q1, ruled option 1 (owner,
2026-09-17): "It does not block publishing."

- **What it binds.** NFR-6(a)'s render matrix and the NFR-5 scan riding on it run as their own CI job — nightly in
  full, and on each push over the designs that push touched — and go red on their own. `ci.yml`'s `deploy` keeps
  `needs: [check, rls]` and gains no third name, so a pixel difference never holds the app's front door: an
  unrelated fix still reaches `app.inflozo.com` while the photographs wait to be looked at.
- **Why it loses nothing.** The most common cause of a red matrix is a change the owner made on purpose, whose
  remedy is his approval of a re-baseline, not a revert. What the matrix guards it still guards: **every category
  owner gate from E9 onward requires it green**, so no design reaches a customer's site unphotographed. The gate
  moved off the app's deploy, not off the library.
- **Its pair.** DW-7 (2026-09-05) put publishing behind `check` and `rls` precisely so a broken row-level-security
  policy could not reach production. This ruling does not loosen that: both gates stand, and the matrix is added
  beside them rather than inside them.
- Targets: ✅ Story 4.11's spec (Q1, and the `matrix.yml` task line) · ✅ `.github/workflows/matrix.yml` (its own
  job, absent from `deploy`'s `needs`) and ✅ `docs/render-matrix.md` (the cadence and the rebaseline rule), both
  landed by the Dev run. **Deliberately not touched:** `ci.yml`'s `deploy` job.
- **Proved by control, 2026-09-17 (the owner's click, Story 4.11's Q3):** `Render matrix` run 35187418366, dispatched on
  `9f1b526e` with a design selection that names nothing, went **red** (`MATRIX_DESIGNS names no design`, exit 1) while the
  same commit's `CI` run 35185834388 published — `check`, `rls`, `deploy` all success. The machine's `GITHUB_TOKEN` is
  read-only (a dispatch answers 403), so this control is the owner's each time it is needed.

**R-117 — the render matrix keeps NFR-6(a)'s 1%, and says what 1% does not catch.** Story 4.11's Q2, ruled option 1
(owner, 2026-09-17): "Keep the 1% limit, and I correct the promise."

- **What it found.** The story promised that "a shared change that nudges a button three pixels" is caught. Executed
  on 2026-09-17 inside the pinned image: A22 #1's Subscribe button moved 3px sideways, nothing else, changed **0.36%**
  of the photograph at 1440, 0.60% at 390 and 0.71% at 834 — under 1%, so the gate stayed green. A4 #13's actions
  moved 3px down made the section 3px taller, and the gate went red, because a photograph that changes size fails
  whatever its ratio.
- **What it binds.** NFR-6(a)'s numbers stand exactly as the PRD writes them — above 1% differing pixels at a
  per-pixel tolerance of 0.1 — and live only in `tools/matrix/playwright.config.mjs`. Nothing that describes the
  matrix promises more: it catches a change that resizes or reflows a section, or that changes more than 1% of a
  photograph; a small sideways nudge of one element that moves nothing else can pass. The owner's own look at every
  section in each category gate (E9 onward) is where such a nudge is seen.
- Targets: ✅ Story 4.11's spec (Q2, `## In plain English`, the Pixel-drift row and its acceptance criterion, renegotiated
  by this ruling) · ✅ `docs/render-matrix.md` (the opening promise and § What fails) · ✅ `epic-4-context.md`
  (the Dev sub-bullet). **Deliberately not touched:**
  `prd.md` NFR-6(a), which never made the stronger promise.

**R-118 — a button on a hovered section arrives with the story that makes it work.** Story 5.2's Q1, ruled option 1
(owner, 2026-09-17): *"The outline, the name tag, selection and the settings panel now, and each button with the story
that makes it work."*

- **Why it was a question.** `epics.md` Story 5.2 listed FR-D2's quick actions (◀ ▶ design, Duplicate, Delete, the
  drag handle), the "+" insertion line and FR-D3's click-to-type among its own criteria, while each one's behaviour
  belongs to a later story:
  - the design ring to 5.11, whose own frame, B1b, draws the arrows in an ink pill of their own;
  - the Section Picker, which the "+" opens, to 5.10;
  - inline editing to 5.3;
  - duplicate, delete and reorder, with their site-wide rules, to 5.4.
  The Shell's and Story 5.1's practice — a control whose behaviour is a later story's is absent, not greyed —
  contradicted that list.
- **What it binds.**
  - Story 5.2 builds hover (the outline and the name tag), selection (the outline, the Layers row and the section's
    panel), Esc, the panel's empty state and tap-and-hold.
  - Story 5.4 builds the canvas pill's Duplicate, Delete and drag handle, in S4b's pill, under FR-D5's site-wide rules.
  - Story 5.10 builds the hairline "+" between sections, inserting at the position it was invoked from.
  - Story 5.11's hover arrows are FR-D2's ◀ ▶.
  - Story 5.3 builds FR-D3's click on a text element inside a selected section.
  - Until its story lands, each of them is absent, never greyed.
- Targets:
  - ✅ Story 5.2's spec · ✅ `epic-5-context.md`.
  - ✅ `epics.md` Stories 5.2, 5.3, 5.4, 5.10 and 5.11 · ✅ `deferred-work.md` DW-116's owner line — Story 5.2's Dev
    run (2026-09-17).
- **Deliberately not touched:** `prd.md` FR-D2 and FR-D3, which say what the editor does, not which story builds it;
  the export (R-74).

**R-119 — a selected Pro design shows the Kit's Pro badge, and Story 5.2 builds it.** Story 5.2's Q2, ruled option 1
(owner, 2026-09-17): *"Build it in this story, because it is part of what a selected section shows."*

- **Why it was a question.** `B Missing Surfaces.dc.html` B10 (:1424-1451) draws a marigold pill in the top-right
  corner of a Pro design selected on a Free account — "a price tag, not a lock", on selection only — and
  `EXPERIENCE.md`'s information architecture lists it as the Pro Design Badge, but no story in `epics.md` built it.
- **What it binds.**
  - On a Free plan, while a design whose `tier` is `pro` is selected, the Kit's `ProBadge` ("✦ Pro") sits 8px inside
    the section's top-right corner. It goes with the selection, is never pressable, and opens no sheet (UX-DR19).
  - A Pro plan shows none, and `pro_past_due` resolves to Pro (`apps/web/lib/entitlement.ts`). A failed entitlement
    read degrades to Free (AD-28), so the badge shows then.
  - S4b gives the same corner to the quick-action pill. Story 5.4, which builds the pill (R-118), moves one of the two.
- Targets:
  - ✅ Story 5.2's spec · ✅ `epic-5-context.md`.
  - ✅ `epics.md` Story 5.2's criteria and frame line (B10), and Story 5.4's note on the shared corner — Story 5.2's
    Dev run (2026-09-17).
- **Deliberately not touched:** the export (R-74), whose B10 draws its own border and label colours;
  `DESIGN.md` § Badges already names the Kit's badge as the one B10 draws.

**R-120 — both canvas outlines are drawn outside the frame.** Story 5.2's Q3, ruled option 1 (owner, 2026-09-17):
*"Draw both outlines outside the page, like the name tag."*

- **Why it was a question.** Story 5.2's approved Approach said the chrome stylesheet inside the frame draws both
  outlines at S4b's 1px and S4c's 1.5px on screen, as the root's own `outline` with its width divided by the fit. Built
  that way, the deployed harness's width checks failed: Chromium floors a border's or an outline's width to whole CSS
  pixels before the frame's scale applies, so at the 1440 window's 0.6 fit the lines painted 0.6px and 1.2px. Measured
  2026-09-17 as painted pixels from a device-scale screenshot, at 1× and 2×, with a 1px border painting 1.00px as the
  control: `border: 1.5px` and `outline: 1.5px` paint 1.00px even unscaled, and `box-shadow: inset 0 0 0 1.5px` paints
  1.50px. A shadow inside the frame would sit under any child painted to the root's edge and replace a design's own
  shadow, so no drawing inside the frame was both exact and safe. Changing where they are drawn changed an approved
  Approach, so it was the owner's.
- **What it binds.**
  - The hover and selected outlines are boxes the section root's on-screen size, drawn OUTSIDE the section's own
    markup and anchored to the root the way the name tag is. *As first built (ffa257e1) they were in the editor
    document, inside the page card, anchored with Floating UI; the amendment below moved them into the chrome layer
    inside the canvas document, where they scroll with the root.* On a sticky root the box stays with it as the page
    scrolls.
  - The line is an inset box-shadow spread — 1px hover, 1.5px selected, coral — as `@utility` rules in `globals.css`;
    on a hovered selection only the 1.5px box is drawn.
  - `data-inflozo-hover` and `data-inflozo-selected` stay on the roots as state marks, zero at rest; `canvas-chrome.css`
    keeps no rule, and painted chrome that belongs inside (the insertion hairline, PAUSED, the empty icon slot) still
    keys on `data-inflozo-*` there with `::after`.
    - *Pointer (Story 5.15, 2026-09-22):* PAUSED left that list. B3a's chip is chrome in the canvas LAYER beside the
      name tag, for this entry's own three reasons, and it is drawn only on a pointed or selected section whose
      held-still part moves by itself — **R-175** below, and `ARCHITECTURE-SPINE.md` AD-21's Story 5.15 amendment.
  - An outline's width is verified as painted pixels, never from computed style (`run-verify-editor.cjs` steps 10–11,
    a 1px control before the 1.5px check).
- Targets:
  - ✅ Story 5.2's spec (Approach, Boundaries, Code Map, Tasks, Design Notes, Spec Change Log, Verification) ·
    ✅ `ARCHITECTURE-SPINE.md` AD-21 · ✅ `EXPERIENCE.md` § Editor shell · ✅ `epic-5-context.md` — Story 5.2's Dev run
    (2026-09-17).
- **Deliberately not touched:** the export (R-74), whose S4b and S4c draw the outline as a border on an overlay —
  what R-120 builds; `prd.md` FR-D2, which says an outline is shown, not where it is drawn.
- **Amended — owner's finding 2026-09-17 (Story 5.2, R-80).** Testing ffa257e1 he saw the outline "jump out of sync and
  move over nearby sections a bit" while scrolling. Measured: 8–15px of drift in the compositor's frames during a scroll
  gesture against 1–2px at rest (`run-verify-editor.cjs` step 15), because boxes positioned from the editor document land
  a frame after the canvas's compositor scroll. The boxes, the name tag and the Pro badge now live in a chrome layer
  inside the canvas document — shadow-root hosts on its `<body>`, outside every section root, scaled by 1 / fit —
  so they scroll with their section; step 15 measures 1–2px in every frame. Everything R-120 binds holds: the 1px and
  1.5px inset box-shadow lines, the state marks, zero at rest, painted-pixel verification. `@floating-ui/dom` is removed.
  - ✅ Story 5.2's spec (Owner's test findings, Spec Change Log, Approach, Code Map, Tasks, Design Notes, Verification,
    Owner's manual test) · ✅ `ARCHITECTURE-SPINE.md` AD-21 · ✅ `EXPERIENCE.md` § Editor shell ·
    ✅ `epic-5-context.md` — Story 5.2's fix (2026-09-17).

**R-121 — clicking an icon on the canvas, and a button's icon, are built with Story 9.1.** Story 5.3's Q1, ruled option 1
(owner, 2026-09-17): *"Build both with Story 9.1, where you can try them: an icon before or after a button's words, and
clicking any icon on the page to change it, with the dashed box for an empty one."*

- **Why it was a question.**
  - The owner had ruled the canvas icon slot into Story 5.3 on 2026-09-13 (DW-115). Planning 5.3 found that none of the
    five pilot sections declares an `icon` prop — the controls fixture's `features[].icon` is the library's only one — so
    nothing on "Pilot sections" could be clicked, and only an automated check could try it.
  - P0-2's button icons — an icon before or after a button's label, chosen while the button is selected — belonged to
    no story at all.
  - The sweep of every category spec found both first in Epic 9: A1's buttons take an icon in every design
    (`A1 Headers - Spec.md:47`), and A1·11 Side Rail's row icons are icon slots (`:624`).
- **What it binds.**
  - Story 9.1 builds a button's icon before or after its words, as P0-2 draws button icons, and the canvas icon slot:
    a click on an icon, filled or empty, opens Story 4.5's Icon Picker anchored to it, and an empty slot shows P0-2's
    dashed placeholder only while its section is selected.
  - Story 5.3 builds neither; until Story 9.1 lands, both are absent, never greyed. An icon still changes from the
    panel's Icon Picker field (Story 4.5).
- Targets:
  - ✅ Story 5.3's spec · ✅ `epics.md` Stories 5.3 and 9.1 · ✅ `deferred-work.md` DW-115's owner line ·
    ✅ `epic-5-context.md` — Story 5.3's Create run (2026-09-17).
- **Deliberately not touched:** `prd.md` FR-F1, which says what the Icon Picker does, not which story opens it from the
  canvas; the export (R-74), whose P0-2 frame stays as drawn.

**R-122 — a click on Ghost's own words shows P0-1's lock pill, naming them.** Story 5.3's Q2, ruled option 1 (owner,
2026-09-17): *"Build it as the drawing shows, naming what you clicked."*

- **Why it was a question.**
  - A selected section mixes the customer's words, which Story 5.3 makes editable on the canvas, with Ghost's own —
    a post's title, tag and date, the site's title — which only Ghost Admin changes.
  - Most category specs say a click on Ghost's words sends the customer to Ghost (`A4 Heroes - Spec.md:61`, `:657`),
    and `P0-1 Inline Text Toolbar.dc.html` (:138-147) draws a lock pill naming the words, "Site title — plain text,
    set in Ghost".
  - No story built the pill, and naming every Ghost field a design can print needs a list of names that nothing in the
    library held.
- **What it binds.**
  - In a selected section, a click on Ghost's own words — a `data-bind` text or a `data-helper` — shows a pill with a lock
    and "{Name} — set in Ghost" above them. Nothing becomes editable, and the next click, Esc or a change of selection
    removes it.
  - The pill takes no press, so it is chrome inside the canvas document's layer (AD-21 as Story 5.2 amended it), and it
    scrolls with its words.
  - The names are one list beside the context matrix (`packages/library/contexts/labels.json`, read by `ghostLabel`),
    and a matrix field with no name fails a test.
  - The pill drops the drawing's "plain text": Ghost's own words are not editable here at all. The same pill on a text
    prop promoted to Ghost Admin names its setting and keeps the words, because that text stays editable as plain text
    (Story 7.10).
- Targets:
  - ✅ Story 5.3's spec · ✅ `epics.md` Stories 5.3 and 7.10 · ✅ `epic-5-context.md` — Story 5.3's Create run
    (2026-09-17).
  - ✅ `packages/library/contexts/labels.json` and `contexts.ts`'s `ghostLabel`, with the test that derives the fields
    from `matrix.json` · ✅ `EXPERIENCE.md` § Component Patterns' Section on canvas row · ✅ `DESIGN.md` (the toolbar and
    the pill are surface cards, not the ink canvas pills) · ✅ `ARCHITECTURE-SPINE.md` AD-21 (the pill in the chrome
    layer, the toolbar outside the frame) — Story 5.3's Dev run (2026-09-18).
- **Deliberately not touched:** `prd.md` FR-D4, whose one exception names the plain-text lock and not the pill; the
  export (R-74).

**R-123 — a press on nothing deselects, exactly as Esc does.** The owner's instruction at Story 5.3's review
(2026-09-18): *"Clicking outside the sections/canvas should unselect the section. Clicking outside the canvas should work
like how we press Esc key and it unselects everything."*

- **Why it is a ruling and not a patch.** It reverses text two approved documents already carried: Story 5.2's frozen
  matrix row — *"Click nothing · click below the last section, the canvas ground or a Layers row · the selection
  stays"* — and `EXPERIENCE.md` § the focus model (2), *"A selection is cleared only by `Esc`, by selecting something
  else, or by deleting it."* Story 5.2's spec is the record of what 5.2 built and is left as written (standing rule:
  never edit a record); this ruling supersedes it, and the living documents carry the new rule.
- **What it binds** (amended the same day by the owner's answer to Story 5.3's Q4: *"Also deselect when clicking empty
  area below the Left Layers Panel."*).
  - A press on **nothing** deselects, and nothing is **three places**: the canvas ground below the last section, inside
    the frame; the editor's own ground around the page card; and the empty space below the Layers rows. One press does
    the whole `Esc` ladder — any inline editing ends and the section is let go together.
  - **Chrome is not nothing.** The Controls sidebar, the top bar, the Layers header, a Layers ROW and the mark toolbar
    and its link panel all keep the selection, because the panel edits the selected section — `EXPERIENCE.md` § the focus
    model (2) stands for everything but the three grounds.
  - **The top bar was offered and declined** (the same answer): its empty space is a sliver that shrinks with every
    control still to land in it — the template pill (5.5), View as (5.14), the sun (5.6), the device switch (5.7), Ship
    it (7.18) — and a miss there while reaching for one would cost the selection mid-edit.
  - It is one rule in three containers: the canvas document's `click` hands `choose` whatever section the target sits
    in, which is `null` on the ground; the stage and the Layers row list each deselect on a primary `pointerdown` whose
    target is that container itself, so the page card, the toolbar, the link panel and every Layers row are excluded by
    construction.
  - **Story 5.4 inherits the Layers half.** It makes a row pressable and draggable, so the row's press, a drag's start
    and this ground's press are three rules in one panel and are designed together there.
- Targets:
  - ✅ Story 5.3's spec (§ Owner's test findings F4, § Verification's step 27, § Owner's manual test, § Questions Q4) ·
    ✅ `EXPERIENCE.md` § the focus model (2) and § Component Patterns' Section on canvas row · ✅ `epic-5-context.md` ·
    ✅ `apps/web/app/(app)/app/(authed)/projects/[id]/editor.tsx` and `tools/probe/run-verify-editor.cjs` step 27 —
    Story 5.3's two Fix runs (2026-09-18).
  - ✅ `epics.md` Story 5.4, which builds the Layers row's press and its drag beside this ground — Story 5.4's Create
    run (2026-09-18).
  - **Deliberately not touched:** Story 5.2's spec, which is the record of what 5.2 built and says so; `prd.md`, which
    names no gesture for deselection.

**R-124 — "who can see this section" is drawn in the panel's Section settings, not in Layers.** Story 5.4's Q1, ruled
option 1 (owner, 2026-09-18): *"The right-hand panel, at the top of 'Section settings', where the drawings put it."*

- **Why it was a question.** `prd.md` FR-D5 names the control inside the paragraph that specifies the Layers panel,
  and `epics.md` Story 5.4 repeats it there, so the plan read as "Layers". Every drawing puts it in the settings
  panel: `A4-13 Latest Post.dc.html:256` draws the row inside that section's panel, `A22-1 Inline Row.dc.html:69`
  draws it there too, `A22 Newsletter - Spec.md:171-173` says it and `signedInBehaviour` are "both in the panel, one
  under the other, and the panel says which is which", and R-113 already files it under **Section Settings** in
  `packages/library/control-groups.json`. DW-163 held the disagreement open for this story to put to the owner.
- **What it binds.**
  - Member visibility is the **first row of the panel's Section settings** on a section whose category carries it, and
    the Layers panel draws nothing about it. Where a design declares no other Section-settings row, the group is drawn
    for this row alone, first, in `SIDEBAR_GROUPS`' order.
  - It is a **named select**, not a pill row: R-114's own rule, run over its four values while planning, refuses them
    ("Logged out" is 66 px against a 58.3 px pill). `A22-1` draws exactly that; `A4-13`'s four-way pill row was drawn
    before R-114 and is superseded by it, as A17 #1 and A24 #1 already were.
  - Its values are `A22 Newsletter - Spec.md:291`'s: **Everyone** (default) · Logged out · Free members · Paid members.
  - The value is stored **on the instance** (`memberVisibility` in `doc-schema.ts`) and handed to the render door as
    `RenderInput.visibility`, which Story 4.10 already honours on both emitters. It is **never** declared in a design's
    `controlSchema`: a declared control would stamp a second, inert copy on the root through `stampControls` (DW-186).
- Targets:
  - ✅ Story 5.4's spec · ✅ `deferred-work.md` DW-163 (closed) and DW-186 · ✅ `epics.md` Story 5.4 ·
    ✅ `docs/section-authoring.md` § 2 · ✅ `epic-5-context.md` — Story 5.4's Create run (2026-09-18).
  - ⬜ `apps/web/components/controls/sidebar.tsx` and `packages/section-runtime/src/doc-schema.ts` — at 5.4's Dev.
- **Deliberately not touched:** `prd.md` FR-D5, which says what the control does and never says where it is drawn —
  what was ambiguous was the paragraph it sits in, not its words; `control-groups.json`, which already files it under
  Section Settings; the export (R-74), whose A4-13 panel stays as drawn.

**R-125 — the Pro tag keeps the section's top-right corner, and the quick-action pill sits to its left.** Story 5.4's
Q2, ruled option 1 (owner, 2026-09-18): *"The Pro tag keeps the corner; the pill sits directly to its left."*

- **Why it was a question.** R-119 put the Kit's "✦ Pro" tag 8 px inside a selected Pro design's **top-right corner**,
  and `S4 Editor.dc.html` S4b draws the hover quick-action pill at `top:10px;right:10px` — the same corner. R-119 said
  in so many words that Story 5.4, which builds the pill, moves one of the two. A Pro section that is selected and
  hovered is an ordinary state, so both are drawn at once.
- **What it binds.**
  - The Pro tag does not move: R-119 stands as ruled, 8 px inside the top-right, on selection only, never pressable.
  - The pill is placed with its right edge a gap short of the tag's left edge while the tag is showing, and at S4b's
    own 10 px inset from the section's right when it is not. The two never overlap and neither is clipped.
  - The name tag keeps the top-left (S4b), so no third thing enters either corner.
- Targets:
  - ✅ Story 5.4's spec · ✅ `epics.md` Story 5.4 · ✅ `EXPERIENCE.md` § Component Patterns' Section on canvas row ·
    ✅ `epic-5-context.md` — Story 5.4's Create run (2026-09-18).
  - ⬜ `apps/web/components/controls/section-pill.tsx` and `tools/probe/run-verify-editor.cjs` — at 5.4's Dev.
- **Deliberately not touched:** R-119, which is unchanged; the export (R-74), whose S4b frame draws a pill this story
  builds three controls of (R-118) and therefore narrower than drawn.

**R-126 — the Layers panel is drawn for its names: two groups of one shape, and the row's only control is the `⋯`.**
The owner's findings on the deployed Story 5.4 (2026-09-18), taken as a ruling because **R-74** makes the design
export the authority and these five change what B7 draws.

- **Why it is a ruling and not a patch.** `B Missing Surfaces.dc.html` B7 draws the site-wide group as a pinned white
  card with a globe badge, an eye on every row, and a footed note above a hairline. All four are removed or moved
  here. Under R-74 a surface is built from its frame, so a departure is the owner's to make and has to be written
  down — otherwise the next reader "corrects" the code back to the frame.
- **The finding behind all five is WIDTH.** The Layers panel is 240 px. A grip, a thumbnail, a name, a `⋯` and an eye
  do not fit, so the one thing a layer list exists to show — the name — was the thing being truncated.
- **What it binds.**
  1. **`Site-wide` and its template count sit on ONE line.** The count's words shrink to `N templates`; it had wrapped
     to two lines as `on all N templates`. Still derived, never written down (standing rule 4).
  2. **No menu is ever clipped.** A `⋯` menu opening off the left edge of the window is a defect wherever it happens;
     the fix belongs in `lib/menu.ts`'s one `openMenu`, which every menu in the app routes through, and clamps both
     edges rather than only the one it anchors (standing rule 3).
  3. **The row's name is `text-helper-caption`, and the row's only control is the `⋯` at its right.** Hide/Show is a
     row IN that menu, leading it. `Space` on the focused row still toggles visibility — a key is not a control and
     costs no width, so UX-DR10's keyboard path is untouched.
  4. **B7's footed note is gone.** The Site-wide heading already carries the same derived count, and the note repeated
     it on every template. This also closes **DW-184**, which existed only to decide when that note should stop being
     shown: there is no note to stop showing.
  5. **The two groups are drawn the SAME** — heading, right-aligned mono count, rows — with one hairline between them
     and no glyph. The pinned white card and the globe go.
- **What a hidden row reads as, now the eye is gone:** its name is `text-ink-soft` and its menu says Show rather than
  Hide. Both are drawn today and both are checked.
- Targets:
  - ✅ `apps/web/components/kit/layers-row.tsx` · ✅ `apps/web/components/controls/layers.tsx` ·
    ✅ `apps/web/lib/menu.ts` · ✅ `tools/probe/run-verify-editor.cjs` · ✅ Story 5.4's spec ·
    ✅ `deferred-work.md` (DW-184 closed) — Story 5.4's Dev (2026-09-18).
  - ✅ `EXPERIENCE.md` · ✅ `DESIGN.md` · ✅ `epic-5-context.md` — Story 5.4's Review (2026-09-18).
- **Deliberately not touched:** D8e's four row states and the ring on the ROW; the drag, its dashed slot and every
  keyboard path; the two singletons; R-123's grounds; R-124 and R-125, which are about other surfaces. The export
  itself is NOT edited (R-74 forbids it) — this file is the record of the divergence.

**R-127 — page 2 of the blog is the Home canvas from the main feed down.** Story 5.5's Q1, ruled option 1 (owner,
2026-09-18): *"Page 2 shows your Home page from the post grid down — the banner and anything above the grid are
dropped, the grid itself carries on with the next posts, and everything below it stays."*

- **Why it was a question.** Ghost resolves `home.hbs` for the site root and `index.hbs` for `/page/N/`.
  `sections-inventory.md:804-806` covers only the untouched case — "an untouched Home synthesizes the same stack into
  both files" — and `prd.md:344` (FR-I1) says `home.hbs` is emitted "whenever the Home canvas **differs** from the
  generic post feed, which is the ordinary case", without ever saying what `index.hbs` is made from once Home is
  designed. `spec-5-1…md:373` booked the decision to Story 5.5. Left unsettled, a user's own page 2 would have shipped
  from a stack nobody chose.
- **What it binds.**
  - **`index.hbs` has no canvas**, now and permanently: the switcher offers six, `/projects/<id>/index` stays a 404,
    and Story 5.1's reserved-segment row is settled. Seven files are synthesizable; six are canvases.
  - When Home is **designed**, `index.hbs` is that doc **from its designated main feed onward** — every instance above
    the main feed is dropped, the feed itself and everything below it are kept, in order. One page-1 welcome is not
    repeated on page 2, and the parts of the site that continue — the feed, a newsletter band, a closing CTA — do.
  - When Home is **untouched**, `sections-inventory.md:804-806` is unchanged: the same synthesized stack into both.
  - When a designed Home carries **no designated main feed**, `index.hbs` falls back to the Synthesis Default stack —
    `index.hbs` is always compiled (FR-I1) and must never be emitted empty.
  - **One implementation.** The rule is a function beside `synthesize` in `packages/section-runtime` (AD-27(d)):
    Story 7.3's compiler and Story 5.16's page-2 preview call it; neither re-derives it.
- Targets:
  - ✅ Story 5.5's spec · ✅ `epic-5-context.md` — Story 5.5's Create run (2026-09-18).
  - ✅ `packages/section-runtime/src/synthesize.ts` and its test · ✅ `apps/web/lib/editor.ts` (the settled reserved
    segment) — at 5.5's Dev; since Story 5.16's Dev the function is `pageTwoStack` (R-179).
  - ✅ `epics.md` Story 7.3 and Story 5.16 · ✅ `sections-inventory.md` § Synthesis Defaults §3's heading, which read
    "(both, only when Home is untouched)" and never said what follows — Story 5.16's Dev (2026-09-22).
  - ✅ `epics.md` Story 5.16 — Story 5.16's Create (2026-09-22). Story 7.3's card and the heading followed at Story
    5.16's Dev (2026-09-22).
- **Amended by R-178 (owner, 2026-09-22):** page 2 is now a design of its own. It starts as a copy of page 1 and is
  made page 2's own by the first change on it, so "`index.hbs` is that doc from its designated main feed onward" is at
  most page 2's starting point, which Story 5.16's Question 3 settles. `/index` stays a 404 and the switcher gains no
  row.
- **Then by R-179 (owner, 2026-09-22):** page 2 starts as an exact copy of page 1, so the slice from the main feed down
  is gone. What survives is the fallback for a Home with no main feed, where `index.hbs` is the Synthesis Default stack,
  now inside `pageTwoStack`.
- **Deliberately not touched:** the Synthesis Defaults' own stacks and the main-feed rule (`:849-861`), both unchanged;
  FR-D21 and Story 5.16, which decide how page 2 is *previewed*, not what it is made of; the export (R-74), which
  draws no `index.hbs` surface because there is none.

**R-128 — "+ New template" arrives with the Routes Manager, and is absent until then.** Story 5.5's Q2, ruled option 1
(owner, 2026-09-18): *"Leave it out until the Routes Manager is built, exactly as R-118 says."*

- **Why it was a question.** `D5 Canvas Markers and Template Switcher.dc.html` D5b draws the switcher ending in a rule
  and **+ New template**, and `prd.md:346` (FR-I3) makes it a deep link into the Routes Manager's creation flow. That
  screen is Story 7.16 and does not exist, so the drawn row would have pointed at nothing. Story 5.5's own acceptance
  criterion says the switcher "matches D5b complete", so omitting a drawn row is a departure R-74 makes the owner's.
- **What it binds.** R-118's rule — *a control arrives with the story that makes it work, and is absent until then* —
  is not specific to a hovered section: it is the general rule, and this is its second application. The switcher ships
  without the **+ New template** row and without the `FROM THE ROUTES MANAGER` heading (which has nothing to list:
  `custom_templates` has no writer until 7.16). Story 7.16 adds both, in the same change that gives them somewhere to
  go. Nothing is greyed and nothing is captioned: an absent row asks no questions.
- Targets:
  - ✅ Story 5.5's spec · ✅ `epic-5-context.md` — Story 5.5's Create run (2026-09-18).
  - ⬜ `apps/web/components/editor/template-switcher.tsx` · ⬜ `tools/probe/run-verify-editor.cjs` — at 5.5's Dev.
  - ⬜ `epics.md` Story 7.16 — at that story, which is where the row and its heading arrive.
- **Deliberately not touched:** R-118, which is unchanged and now covers two surfaces; the export (R-74), whose D5b
  keeps the row it draws — this file is the record of the divergence; FR-I3, which says what the row does when it
  exists and is silent on when it appears.

**R-129 — the signup canvas ships as `custom-signup.hbs` and reads "Signup" in Ghost.** Story 5.5's Q3, ruled option 2
(owner, 2026-09-18): *"`custom-signup.hbs` — it shows as 'Signup'. There will be different pages for Signin, Sign up,
Subscribe and Membership."*

- **Why it was a question.** A `custom-{name}.hbs` filename is a **frozen public API** of the emitted theme
  (`prd.md:636`): Ghost stores the exact string on every page that selects it, derives the Template dropdown's label
  from it by a fixed transform, and never revalidates or repairs it — so a rename silently detaches every page. The
  sources disagreed on the first of the three. `B Missing Surfaces.dc.html` B19 draws **Membership ·
  `custom-membership.hbs`**, and `EXPERIENCE.md:2142-2144` renames D5b's routes-manager example away from that
  filename precisely because it belonged to the Membership group's own signup template. `A30 Members Pages -
  Spec.md:65` says `custom-signup.hbs` and `custom-signin.hbs`. D5b's row has always read **Signup**.
- **What it binds.**
  - The three membership canvases ship as **`custom-signup.hbs`** ("Signup"), **`custom-signin.hbs`** ("Signin") and
    **`custom-member-home.hbs`** ("Member home"). The label is not ours to choose: Ghost derives it from the filename.
  - B19 is **superseded** on the first row's name and filename; its mechanism — one page per template, bound from
    Ghost's page-editor Template dropdown — is untouched, and so is FR-I6's post-deploy checklist that prints it.
  - The group in the switcher stays the three FR-D6 names, which are also A30's three surfaces (FR-D13's partition).
    **Subscribe and Membership are ordinary custom page templates**, created in the Routes Manager (FR-I3) and listed
    in the switcher's own Routes Manager group — the same `custom-*.hbs` mechanism, arriving with Story 7.16.
  - `project_templates.template_key` for each is `custom:custom-{name}.hbs`, which the existing `template_key_shape`
    CHECK already admits; the editor's URL segment is `custom-{name}`. **Corrected at Story 5.5's review (2026-09-18,
    executed on production): the CHECK is MEANT to admit it and, as stored, refuses it — its pattern carries two
    backslashes. Nothing writes the key yet; DW-193 gives Story 5.8 the Schema phase that fixes it.**
- Targets:
  - ✅ Story 5.5's spec · ✅ `epic-5-context.md` — Story 5.5's Create run (2026-09-18).
  - ⬜ `apps/web/lib/editor.ts` · ⬜ `tools/probe/run-verify-editor.cjs` — at 5.5's Dev.
  - ⬜ `EXPERIENCE.md` § A7 item 6, which names `custom-membership.hbs` as the signup template's own · ⬜ `epics.md`
    Story 7.3 (the `custom-{name}.hbs` emission) — at 5.5's Dev and at 7.3.
- **Deliberately not touched:** `prd.md` FR-D6 and FR-I1, which say the membership canvases are page-backed custom
  templates and never name a filename; §7.4's frozen-filename rule, which this ruling exists to satisfy; the export
  (R-74) — B19 is not edited, this file is the record.

**R-130 — the auto-generated marker has one place, and the switcher's third state is `circle-off`.** Story 5.5's owner
test and its Q4, ruled by the owner on the deployed editor (2026-09-18): *"There is a notification adjacent to the
Template dropdown in top bar… I do not want to show that. We already have the identifier in the Dropdown."* — and, for
the row that is neither designed nor auto-generated, Tabler's `circle-off` rather than any of the four words offered.

- **Why it was a question.** D5a and FR-D6 put the sentence "Auto-generated — edit anything to make it yours" in two
  places, a chip beside the Template control and a row at the head of Layers. D5a draws the switcher CLOSED, so it
  could not show what the built screen did: the closed control names the canvas, its open row carries the hollow dot
  and the word, and the chip repeated it a third time. Separately, D5b draws two row states and FR-D6 implies a third
  — a membership canvas or Private that nobody has designed — for which a filled dot and "Auto-generated" are both
  false.
- **What it binds.**
  - **D5a is superseded on the chip alone.** The Layers row is built measure for measure; R-74 stands everywhere else.
  - The third state is `circle-off` **beside the word "Empty"** — the shape never travels alone (D5b's own caption).
  - **R-92 carries one stated exception.** Tabler is still the sections' set and the chrome still draws the frames'
    own paths; a Tabler path enters `kit/icons.tsx` only where the owner names one, and this is the one. The path is
    `packages/library/icons/tabler.json`'s own, inlined, with its licence in the file's header.
- Targets:
  - ✅ Story 5.5's spec (§ Design Notes, *R-130*) · ✅ `apps/web/components/kit/icons.tsx` ·
    ✅ `apps/web/components/editor/template-switcher.tsx` · ✅ `editor.tsx` · ✅ `tools/probe/run-verify-editor.cjs` —
    Story 5.5's Dev (2026-09-18).
  - ✅ this entry · ✅ `prd.md` FR-D6's M4 sentence · ✅ `EXPERIENCE.md`'s "what is drawn" row for the marker — Story
    5.5's review (2026-09-18), which found the ruling recorded nowhere outside the story's own files.
- **Deliberately not touched:** the export (R-74) — D5a still draws the chip and this file is the record;
  `EXPERIENCE.md`'s quoted D5 design prompt ("TWO markers…"), which is the prompt as it was sent.

**R-131 — Theme settings is built now, holding only the two rows that work.** Story 5.6's Q1, ruled option 1 (owner,
2026-09-18): *"Build a small Theme settings screen now, holding only these two rows."*

- **Why it was a question.** D6a draws the project-mode control and the project-level "Clear dark overrides" row on a
  **Theme settings** screen that also holds `posts_per_page`, Site basics, Credits and the custom-settings builder —
  all FR-Q1/Q2/Q3 and all Epic 7's (`prd.md:816`). Without the screen, FR-D7's Light-only half ships built,
  unreachable and untestable. R-118 and R-128 answer the opposite shape — a control whose story has not arrived — and
  said nothing about a control that works whose screen has not been built.
- **What it binds.**
  - **The screen exists at `/projects/<id>/settings` and holds D6a's mode block and nothing else.** Every other row and
    group D6a draws — Posts per page, Site basics, Accent colour, Credits, the whole right-hand custom-settings column
    and its "3 OF 17" meter — is **absent**, not greyed and not captioned: R-118's rule applied a fourth time. D6a's
    own left rail (Site basics · Navigation · Social accounts · Translations · Code injection) is absent for the same
    reason — every item in it is Epic 7's.
  - **It is reached from the editor** (`EXPERIENCE.md:172`'s entry point), and it is **not** a shell-nav destination.
  - **Story 5.1's route structure moves to make room, and the URLs do not change.** `projects/[id]/layout.tsx` renders
    the Editor for every child segment, so a settings page nested under `[id]` would come up inside the editor's
    chrome. The editor's layout descends into a `(editor)` route group — a group is not a URL segment — and `[id]`'s
    own layout keeps only the `projectOf` 404 guard, above both children and above every Suspense boundary, which is
    where R-98's second effect requires a guard to live. `/projects/<id>` and every canvas segment are byte-identical
    afterwards; `run-verify-editor.cjs` steps 2, 6 and 9 are the control that says so.
  - **`settings` joins the URL scheme as a named non-canvas segment** in `apps/web/lib/editor.ts`, the one place the
    scheme is data (Story 5.1), so nothing has to learn it twice.
- Targets:
  - ✅ this entry · ✅ Story 5.6's spec — Story 5.6's Create run (2026-09-18).
  - ✅ `apps/web/lib/editor.ts` (`SETTINGS`, `settingsPath`) · ✅ the route tree under
    `apps/web/app/(app)/app/(authed)/projects/[id]/` — the editor in `(editor)/`, the guard alone in `[id]/layout.tsx`,
    the screen in `settings/` with its own `loading.tsx` and `actions.ts` · ✅ `apps/web/editor.test.ts` ·
    ✅ `apps/web/busy.test.ts` (`NO_SKELETON`'s two keys moved with the group) · ✅ `tools/probe/run-verify-editor.cjs`
    (steps 52–53) — Story 5.6's Dev (2026-09-18). `next build`'s route table is the control: `/app/projects/[id]` and
    `/app/projects/[id]/[template]` are unchanged and `/app/projects/[id]/settings` is added.
  - ⬜ `EXPERIENCE.md:172`'s Theme Settings row, which should say what of D6a exists when · ⬜ `epics.md` Story 5.6 —
    at 5.6's Review.
- **Deliberately not touched:** the export (R-74) — D6a still draws the whole screen and this file is the record;
  FR-Q1/Q2/Q3, which are unchanged and still Epic 7's; the custom-settings cap, which is 17 in the database whatever
  the project's mode (AD-17, FR-Q2).

**R-132 — one button, and it swaps its glyph.** Story 5.6's Q2, ruled option 1 (owner, 2026-09-18): *"One button that
swaps its glyph: a sun while you are in light, a moon while you are in dark, with a spoken label that names where it
takes you ("Preview dark mode" / "Back to light mode") and a polite announcement of the mode now showing."*

- **Why it was a question.** `S4 Editor.dc.html:35` draws a bare sun — 28×28, a 15px glyph, `circle r=4` and eight
  rays — with **no visible label, no accessible name and no dark-state counterpart anywhere in the export**. UX-DR8 and
  `DESIGN.md:181-184` require a small shape to carry its words, and `DESIGN.md:534-536` allows an accessible label
  *"where the layout genuinely cannot hold one"* — which the 48px bar, with View as, the device switch, undo/redo and
  Ship it still to land in it, is. The frame could not answer what the control becomes once pressed.
- **What it binds.** One control at S4a's position — first of the right-hand cluster — carrying `aria-pressed`, an
  accessible name that names the **destination** ("Preview dark mode" in light, "Back to light mode" in dark), and a
  polite announcement of the mode now shown (UX-DR12). The sun's path is the export's, lifted verbatim (R-92); the
  moon is the Kit's own (`kit/icons.tsx:297`). **S4a is completed, not superseded** — the drawn sun is the light state.
- Targets:
  - ✅ this entry · ✅ Story 5.6's spec — Story 5.6's Create run (2026-09-18).
  - ✅ `apps/web/components/kit/icons.tsx` (`Sun`, the frame's path verbatim) ·
    ✅ `apps/web/components/editor/mode-toggle.tsx` · ✅ `editor.tsx` (its place in the bar, and the mode it flips) ·
    ✅ `apps/web/dark-mode.test.ts` · ✅ `tools/probe/run-verify-editor.cjs` (steps 46–47) — Story 5.6's Dev
    (2026-09-18).
- **Deliberately not touched:** the moon **badge**, which is a different thing — 12px, on an overridden control, always
  captioned "Dark override" (D6a`:113`, `Editor Sidebar Kit.dc.html:178-179`); S4's stale "Dark mode / Readers get a
  moon toggle" sidebar row, which is the VISITOR's `mode-toggle` (`EXPERIENCE.md:652`) and is not built.

**R-133 — "Clear dark overrides" is in both places, and each follows its own neighbours.** Story 5.6's Q3, ruled off
the menu (owner, 2026-09-18): *"Both under 'Reset this design' and inside '...' three dots menu"* — options 1 and 2
together rather than either alone.

- **Why it was a question.** FR-D7 asks for a per-section clear and **no frame draws one**; the project's own notes
  already record the gap (`reconcile-design-prompt.md:60`: *"the per-section "Clear dark overrides" action — missing
  from S4/S7"*). Only D6a's project-level row exists.
- **What it binds.**
  - **Two entry points, one act, one confirm.** The confirm lives in `editor.tsx`, not in either surface — the same
    rule `layers.tsx:51-52` already states for Delete and Hide, whose canvas-pill and menu paths must open the SAME
    dialog. It asks first, names the count, and opens with focus on Cancel (R-115, UX-DR14).
  - **Each place behaves like its neighbours, and that is deliberate rather than an inconsistency.** At the foot of the
    Controls panel the row is **always present** and says there is nothing to clear when there is nothing — R-12's
    rule, and the shape "Reset this design" beside it already uses. In the Layers `⋯` menu the item is **absent** when
    that section carries no usable override — UX-DR3, and the shape Duplicate already uses on a site-wide row
    (`layers.tsx:289`).
  - **R-126 is extended, not reversed.** The Layers panel is still drawn for its names and the `⋯` is still the row's
    only control; its menu gains a fifth item by the owner's word. Hide/Show still leads it.
- Targets:
  - ✅ this entry · ✅ Story 5.6's spec — Story 5.6's Create run (2026-09-18).
  - ✅ `apps/web/components/controls/sidebar.tsx` (the always-present row) ·
    ✅ `apps/web/components/controls/layers.tsx` (the absent-when-empty menu item) ·
    ✅ `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (the ONE confirm) ·
    ✅ `packages/section-runtime/src/doc-edit.ts` (`clearDarkOverrides`, `darkOverrideCount`) ·
    ✅ `packages/section-runtime/src/controls.ts` (`darkOverridesInForce` — one definition of "carries an override",
    which the moon, both entry points, the confirm's count and the project count all read) ·
    ✅ `apps/web/dark-mode.test.ts` · ✅ `tools/probe/run-verify-editor.cjs` (steps 50–53) — Story 5.6's Dev
    (2026-09-18).
  - ⬜ `EXPERIENCE.md` § the frame/PRD divergence table, where the missing per-section clear is recorded — at 5.6's
    Review.
- **Deliberately not touched:** the export (R-74) — neither surface is drawn and this file is the record; the
  project-level row, which is R-131's; `resetSection`, which keeps stored dark overrides on purpose (FR-F4,
  `controls.test.ts:413`) and is why a deliberate clear had to exist at all.

**R-134 — the project-level "Clear dark overrides" asks first.** Story 5.6's Review Question 4, ruled option 1
(owner, 2026-09-19): *"Ask first, the same way the per-section one does — a small window naming how many sections it
will clear, opening with focus on Cancel."*

- **Why it was a question.** D6a draws the row with a bare `Clear` and no confirm — but D5 drew "Reset this design"
  with no confirm either, and the owner added one there (**R-115**). This button is wider than any of them: every
  section of every canvas, and saved data, with no undo. Review found it was the only destructive act in the product
  that asked nothing.
- **What it binds.** The app's one dialog vocabulary (`kit/dialog.ts`, the 460px sheet), the count NAMED in the
  sentence and derived from the docs, focus opening on **Cancel** (R-115, UX-DR14). With nothing to clear it **says
  so** under the row instead of asking — R-12, and the shape the per-section row beside it already uses. The confirm
  is the JavaScript layer over a form that still posts without it, and the server action refuses a Light-only project
  on its own, so the dialog is never the only thing between a press and the database.
- Targets: ✅ this entry · ✅ Story 5.6's spec (its Question 4 and § Owner's manual test) ·
  ✅ `apps/web/app/(app)/app/(authed)/projects/[id]/settings/theme-settings.tsx` ·
  ✅ `tools/probe/run-verify-editor.cjs` (step 53) — Story 5.6's Review (2026-09-19).
- **Deliberately not touched:** the export (R-74) — D6a draws the row without one and this file is the record; the
  per-section confirm, which R-133 already placed in `editor.tsx`; the action's own Light-only refusal, which is a
  server rule and not a dialog.

**R-135 — on a Light-only project the editor says nothing about dark, the two clears included.** Story 5.6's Review
Question 5, ruled option 1 (owner, 2026-09-19): *"Hide both in the editor while the project is Light only — the row
and the menu item are simply absent, like the sun."*

- **Why it was a question.** Review found the two surfaces contradicting each other: Theme settings greys its Clear
  with D6b's reason — *"Switch to Light + Dark to use or clear them"* — while the editor's panel row and `⋯` item
  still cleared that section's overrides on the same project.
- **What it binds.** On `dark_enabled = false` the editor renders neither entry point: `onClearDark` is not passed to
  the panel (which draws no row without it) and a Layers row's `darkOverride` flag is false, so the menu item is
  absent. **Absent, never greyed** — UX-DR3, R-118, R-128, and the same answer the sun already gets. The ONE thing
  that greys with its reason stays D6b's project-level row, where the overrides exist and are merely not in force.
- Targets: ✅ this entry · ✅ Story 5.6's spec (its Question 5, its I/O matrix's Light-only row and § Owner's manual
  test step 16) · ✅ `apps/web/app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx` (both entry points) ·
  ✅ `tools/probe/run-verify-editor.cjs` (step 53) — Story 5.6's Review (2026-09-19).
- **Deliberately not touched:** what is STORED — nothing here deletes an override or changes one, and switching back
  to Light + Dark returns both entry points with every override intact (FR-D7, AD-17); R-133, which is scoped by this
  rather than reversed.

**R-136 — the moon badge's words are its name and its hover title, not print beside it.** The owner's instruction at
Story 5.6's Review (2026-09-19): *"in controls panel for any setting when using Dark override, just show the black
moon icon and drop 'Dark override' text along with it. Add title on the icon so users know on hover what it is for."*

- **Why it arose.** Dev printed "Dark override" beside the 12px badge in every overridden control row, reading UX-DR8
  literally. In a 280px panel the head of a control row already holds the label, the value words and the reset arrow,
  and two more words there push a long label to wrap.
- **What it binds.** `MoonBadge` carries `title` as well as its accessible name, so the words reach a pointer on hover
  and a screen reader always; a CONTROL row draws the badge alone. **UX-DR8 is satisfied, not waived** — through
  `DESIGN.md:534-536`'s carve-out for where the layout genuinely cannot hold the word, the same carve-out R-132 used
  for the sun. **D6a's own project-level row is untouched:** there the frame prints the words beside the badge and
  they stay, because that row has the width for them.
- Targets: ✅ this entry · ✅ Story 5.6's spec · ✅ `apps/web/components/kit/moon-badge.tsx` ·
  ✅ `apps/web/components/controls/sidebar.tsx` · ✅ `epics.md` (UX-DR8's own example, and Story 5.6's AC) ·
  ✅ `EXPERIENCE.md:652` (the frame/PRD divergence row) · ✅ `tools/probe/run-verify-editor.cjs` (step 48) ·
  ✅ `tools/probe/run-verify-controls.cjs` (step 5) — Story 5.6's Review (2026-09-19).
- **Deliberately not touched:** the export (R-74) — `Editor Sidebar Kit.dc.html:178-179` draws the badge and never
  draws words beside it in a control row, so this is the Kit's own shape rather than a departure from it; the badge's
  12px filled-chip geometry, which is the Kit's and not D6a's bare crescent (the two differ, and the Kit's is the one
  built).

**R-137 — Desktop is a real 1440 × 900 viewport, like the other two.** Story 5.7's Q1, ruled option 1 (owner,
2026-09-19): *"Desktop becomes a real 1440 × 900 screen, like the other two."*

- **Why it was a question.** Two approved frames draw the same canvas differently, and standing rule 6 refuses a guess
  between them. `S4 Editor.dc.html:63` — the editor at rest, and what Stories 5.1–5.6 built — gives the page card
  `height:100%` and a top-only radius, standing on the bottom of the stage: on a 1440 laptop roughly 1380 of the page's
  own pixels, a height no visitor will ever have. `B Missing Surfaces.dc.html:740` draws the same canvas under device
  preview as a fixed **1440 × 900** with ground below it and the chip `VIEWPORT 1440 × 900 · SHOWN AT 46%` — and that
  chip was read and deliberately **kept** through the A7 correction pass (§A7 item 6, 2026-09-04), which is what made
  it a contradiction rather than an artist's licence.
- **What it binds.** ONE RULE FOR ALL THREE DEVICES: the canvas iframe is always a named device's viewport in both
  axes — Desktop **1440 × 900**, Tablet **834 × 1112** (`D8 Editor Below 1440.dc.html:39`, `EXPERIENCE.md:62`), Mobile
  **390 × 844** (UX-DR17) — fitted by `min(1, stageW/deviceW, stageH/deviceH)` and never magnified. The page card
  therefore takes the device's size rather than the room available, is **centred in the ground with a radius on all
  four corners**, and no longer stands on the bottom of the window; the editor's skeleton follows the card, and the
  chip states a size that does not change when a panel folds. **B11a supersedes S4a`:62-63` on the card's GEOMETRY and
  on nothing else** — the ground, the ink, the shadow and the 6px radius stay S4a's.
- **What it costs, and the owner took it knowingly:** about a third less page in view while editing at 1440, and a band
  of ground below the card. What it buys is FR-D14's whole point — `100vh`, `position: sticky`, `position: fixed` and
  the fold are honest on desktop as well as on a phone — and it narrows `prd.md:66`'s carve-out to what it should
  always have been: 900 is a NOMINAL desktop viewport, never this visitor's window.
- Targets:
  - ✅ this entry · ✅ Story 5.7's spec (its Question 1, its I/O matrix and its tasks) ·
    ✅ `epics.md` (Story 5.7's AC) · ✅ `EXPERIENCE.md` (the device-preview paragraph and B11's divergence row) —
    Story 5.7's Create run (2026-09-19).
- **Deliberately not touched:** the export (R-74) — neither frame is edited and both stand as drawn, this entry being
  the record of which governs which property; **browser zoom**, which is the reader's own accessibility setting, is
  never the canvas scale and may not be defeated (FR-D14, WCAG 1.4.4, `EXPERIENCE.md:613-618`); S4a's stage padding,
  ground, shadow and 864 arithmetic, which the card keeps as its width ceiling at rest.

**R-138 — the viewport chip tucks into the stage's corner, and the page card may never reach it.** Story 5.7's Q2,
ruled option 1 (owner, 2026-09-19): *"Tuck it in + keep page clear."*

- **Why it was a question.** The owner reported the chip "overlaying the canvas on desktop". Measured on the
  **deployed** editor at 1440 × 900 before anything was changed (a throwaway account through the Auth Admin API, the
  harness's own seed): **Desktop at rest does NOT overlap** — 139px of ground between the chip's bottom and the card's
  top — but **Tablet overlaps by 84 × 5px**, the chip's bottom-right corner printing `SHOWN AT 74%` over the page's
  top-left corner, and **Desktop with both panels folded leaves 4px**, which the card's `0 4px 16px` shadow bleeds
  across. The cause is geometric and not cosmetic: **the chip is pinned to the stage's corner while the card moves**,
  so any height-bound card rises to meet it. The literal request — "a bit up and left" — had only ~5px of room before
  the chip touched the top bar's rule and the Layers rule, and would not have fixed Tablet, so R-83's numbered options
  were put to the owner rather than guessed at.
- **What it binds.** TWO HALVES, AND NEITHER ALONE IS SUFFICIENT. The chip sits at **4px / 4px** of the canvas ground
  rather than `B Missing Surfaces.dc.html:740`'s drawn 9px / 12px; and the ground's **top padding is 32px** rather than
  `S4 Editor.dc.html:62`'s 24px, so the card's top edge clears the chip's bottom on **every device**. The invariant —
  *the chip never overlaps the page card, on any device* — is what the walk asserts; the two offsets are how it is
  delivered and are not themselves normative.
- **What it costs:** 8px of fitted height, measured on the deployed editor at 1440 × 900 after the change — every
  device clears the chip by 8px, and folded Desktop by 13px. Tablet reads 74% before and after and Desktop is
  width-bound at 1440 and does not move at all; **Mobile is the one number that changed, 98% → 97%**, which
  `apps/web/editor.test.ts`'s worked stage now carries (820 tall, not 828) and the owner's manual test quotes. The chip's own ink, fill, hairline, radius, type and words are untouched — this is a position,
  not a redesign.
- **It amends R-137's "deliberately not touched" line**, which reserved S4a's stage padding. R-137 gave the card the
  device's size; that is precisely what let a tall card reach a chip drawn for a card that filled the height, so the
  padding had to answer for it. The other three sides stay S4a's.
- Targets:
  - ✅ this entry · ✅ Story 5.7's spec (its Question 2 and its Owner's test findings) ·
    ✅ `EXPERIENCE.md` (B11's divergence row) · ✅ the code and the walk
    (`components/editor/device-switch.tsx`, `(editor)/editor.tsx`, `editor-skeleton.tsx`,
    `tools/probe/run-verify-editor.cjs` step 55) — Story 5.7's Dev run (2026-09-19).
- **Deliberately not touched:** the export (R-74) — B11a is not edited and stands as drawn, this entry being the
  record of where the built chip departs from it and why; the chip's words, which are UX-DR17's verbatim; the ground,
  the ink, the shadow, the 6px radius and the 28px sides, which stay S4a's.

**R-139 — the canvas ground carries the same 32px at the bottom as at the top.** Story 5.7's Q3 (its Review), ruled
option 1 (owner, 2026-09-19): *"Give the bottom the same 32 px as the top. I do not see the desktop floating too."*

- **Why it was a question.** R-137 says the card "no longer stands on the bottom of the window"; R-138 says "the other
  three sides stay S4a's", and S4a has no bottom padding. Measured on the deployed editor at Review: every
  HEIGHT-BOUND card — Tablet, Mobile, and Desktop whenever a panel is folded or the window is short — ended at
  `bottom: 0` with its `0 4px 16px` shadow cut off. Only a width-bound Desktop floated, which is why the owner did not
  see Desktop floating either.
- **What it binds.** The ground is `py-8`, in the editor and in its skeleton. It is the GROUND's padding, never a
  device's, so one rule covers all three. **It amends R-138's "the other three sides stay S4a's" to the two sides.**
- **What it costs:** on the 1440 × 900 stage Tablet reads 71% (was 74%) and Mobile 93% (was 97%); a width-bound
  Desktop does not move.
- Targets:
  - ✅ this entry · ✅ Story 5.7's spec (its Question 3, its Review Findings, its owner's test step 4) ·
    ✅ `EXPERIENCE.md` (B11's divergence row) · ✅ the code, the test and the walk (`(editor)/editor.tsx`,
    `editor-skeleton.tsx`, `apps/web/editor.test.ts`, `tools/probe/run-verify-editor.cjs` step 55) — Story 5.7's
    Review (2026-09-19).
- **Deliberately not touched:** the export (R-74); the 28px sides, which stay S4a's.

**R-140 — B6's "Download a copy" is not built, because nothing in Inflozo can read such a file back in.**
Story 5.8's Q1, ruled option 1 (owner, 2026-09-19): *"Leave the button out for now."*

- **Why it was a question.** `B Missing Surfaces.dc.html:1384` draws a second control in the Retrying panel, beside
  "Retry now": **"Download a copy"**. It would write the project document to the customer's disk — and **no surface,
  in any story of any epic, reads such a file back**. Under R-118 that is an absent control; under R-74 it is a drawn
  one, and R-118's own list has never before held an item with no owning story at all, so the two rules did not settle
  it between them (standing rule 6). **It was raised as an open item on 2026-09-04 and never answered:**
  `reconcile-designs.md:4614` — *"FR-D10 — the 'Download a copy' affordance in Retrying (B6): adopt or strike"* — and
  `:4453` records the same thing as "an affordance no FR names". That file is `record` and is not edited (standing
  rule 5); this entry is its answer, which is **strike**.
- **What it binds.** The Retrying panel carries **"Retry now" and nothing else**. It is ABSENT, never greyed and never
  captioned (UX-DR3) — R-118 applied a sixth time, and the first time to a control with **no** future story named. The
  panel's reassurance sentence is untouched and is what it was drawn for: *"Your work is safe on this device. Nothing
  is lost if you close the tab — we will send it when the connection returns."* Should a "restore from a file" story
  ever be written, the button lands with it and works on the day it ships.
- **What it costs:** in the one state where cloud sync is failing, the customer's only escape is to leave the tab open
  until the connection returns. Accepted knowingly: the local journal already survives a reload and a closed tab
  (FR-D9), so the exposure is browser eviction alone, which FR-D9 already states as a limitation rather than a
  requirement.
- Targets:
  - ✅ this entry · ✅ Story 5.8's spec (its Question 1, its Code Map and its Boundaries) ·
    ✅ `epics.md` (Story 5.8's AC) · ✅ `EXPERIENCE.md` (B6's divergence row) — Story 5.8's Create run (2026-09-19).
- **Deliberately not touched:** the export (R-74) — B6 is not edited and stands as drawn, this entry being the record
  of which of its two controls is built and why; the panel's fill, ink, radius, type and its two sentences, which are
  B6's verbatim.

**R-141 — ⌘Z and ⇧⌘Z land with the undo arrows, not with the keyboard map.** Story 5.8's Q2, ruled option 1 (owner,
2026-09-19): *"Build ⌘Z and ⇧⌘Z here too, with the arrows."*

- **Why it was a question.** Story 5.9 owns FR-D11's map ENTIRE and tests it as one journey, and the precedent had run
  twice in a row: Story 5.6 built S4a's sun and not `.`, Story 5.7 built the device track and not `1` `2` `3`. Applying
  it a third time would have shipped an editor whose headline feature — undo — no keyboard could reach by the gesture
  every person alive reaches for, through the owner's own manual test of that very story.
- **What it binds.** **A ⌘-MODIFIED SHORTCUT MAY LAND WITH THE CONTROL IT DRIVES; A SINGLE-KEY ONE MAY NOT.** The two
  are different rules, and UX-DR11 is the reason: a single-key binding is live only while the shell holds focus and
  never while a text field or a `contenteditable` has it (WCAG 2.1.4), which is exactly the condition Story 5.9's
  keyboard journey exists to verify and which cannot be verified one key at a time. A ⌘-modified binding carries no
  such condition and cannot collide with typing on the canvas. So Story 5.8 builds **⌘Z, ⇧⌘Z and ⌘S**; `1` `2` `3`,
  `L`, `.`, `[` `]` and every other single-key binding stay Story 5.9's, and R-118's rule is untouched for them.
- **Story 5.9 is narrowed, not relieved.** It still builds and tests the COMPLETE map as one journey (FR-D11,
  UX-DR11, UX-DR21, NFR-6(d)) — it will simply find these three already working, as it would have found ⌘S. Its
  acceptance is unchanged: the complete set works, verified with no pointer events.
- Targets:
  - ✅ this entry · ✅ Story 5.8's spec (its Question 2, its Boundaries, its tasks, its matrix and the owner's test) ·
    ✅ `epics.md` (Stories 5.8 and 5.9's ACs) · ✅ `EXPERIENCE.md` (the shortcut table's note) —
    Story 5.8's Create run (2026-09-19).
- **Deliberately not touched:** R-118, which governs a CONTROL with no story to make it work and is not what this
  ruling is about; the map itself, which is unchanged in content and in ownership; the single-key focus rule, which is
  the whole reason the two halves are separated here.

**R-145 — a shortcut arrives with the action it drives, so FR-D11's map is completed over six stories rather than
one.** Story 5.9's Q1, ruled option 1 (owner, 2026-09-19): *"Build the eight that work; each of the other five
arrives with its own story."*

- **Why it was a question.** R-141 had just said Story 5.9 "still builds and tests the COMPLETE map", and
  `EXPERIENCE.md`'s own table calls FR-D11's thirteen "the complete set". Five of those thirteen press a control no
  story has built: **`⌘K`** (the Section Picker, Story 5.10), **`[` `]`** (the design ring, 5.11), **`⇧R`** (Site
  Remix, 5.12), **`P`** (Preview Mode, 5.15) and **`⌘⏎`** (Ship it, 7.18). R-118 answers this for a CONTROL and had
  never been asked about a KEY; R-141 answers WHEN a binding may land early and says nothing about one that cannot
  land at all. Two approved rulings, neither of which settled it — standing rule 6, so it was asked.
- **What it binds.** **A BINDING WHOSE ACTION HAS NOT BEEN BUILT IS ABSENT** — not bound, not listed in the `?`
  sheet, never greyed and never captioned (UX-DR3). R-118 applied a seventh time, and the first time to a key rather
  than a button. Story 5.9 builds the eight that have something to press — `L`, `.`, `1` `2` `3`, `Esc`, `⌘D`, `Del`,
  plus `?` (R-147) — and finds `⌘Z`, `⇧⌘Z` and `⌘S` already passing (R-141). **Each of the five remaining keys is
  now a criterion of its own story**, which is where its test lives too; the map is complete when 7.18 ships.
- **How it is kept honest.** The map is ONE TABLE naming all thirteen with the story that lands each, and both the
  key handler and the sheet's rows are DERIVED from it (standing rule 4). A key cannot be advertised without being
  bound, and a key cannot be bound without being listed.
- **What it costs:** no single run ever asserts "all thirteen" before Epic 7, and R-141's sentence about 5.9 testing
  the complete map is narrowed by this entry. Accepted: the alternative was an editor with no single-key shortcut at
  all through six more stories the owner tests by hand.
- Targets:
  - ✅ this entry · ✅ Story 5.9's spec (its Question 1, its Boundaries, its matrix and its map task) ·
    ✅ `epics.md` (Story 5.9's AC, and Stories 5.10, 5.11, 5.12, 5.15 and 7.18 each gaining their key) ·
    ✅ `EXPERIENCE.md` (the shortcut table's when-it-is-built note) — Story 5.9's Create run (2026-09-19).
- **Deliberately not touched:** FR-D11's map itself — no key is added, removed or remapped by this ruling, only
  scheduled; R-141, whose modifier rule still decides whether a binding MAY land early; the single-key focus
  condition, which every key here carries whenever it lands.

**R-146 — the keyboard journey runs on every commit, over a test-only mount of the real editor.** Story 5.9's Q2,
ruled option 1 (owner, 2026-09-19): *"Build it, as the plan says."*

- **Why it was a question.** Every browser check in this project runs against the DEPLOYED site, by hand, once per
  story (R-82), and the same gap for the dashboard was closed exactly that way — **DW-16**, closed at Story 3.9 by
  `run-verify-dashboard.py` and not by a browser in CI. **DW-167** names Story 5.9 as its owner and gives the reason
  it was deferred four times: *"`apps/web` runs `node --test` with no DOM, and a DOM for it is a dependency (Ask
  First)."* That dependency has since arrived on its own — `@playwright/test` is a root devDependency since Story
  4.11's render matrix — so what was left was cost, which is the owner's.
- **What it binds.** The NFR-6(d) keyboard-only journey runs **inside `pnpm check`**, and therefore inside CI's
  `check` job, which is the only place a gate can block a deploy (R-116 fixes `deploy`'s `needs` at `[check, rls]`).
  It drives a **harness mount**: a page that answers `notFound()` unless `INFLOZO_HARNESS=1`, rendering the REAL
  `Editor` component with the pilot fixture as its props, so a browser can open the editor with no database.
  **Executed for it (2026-09-19):** `next dev` with no Supabase environment is ready in 307 ms and serves every route
  outside `(authed)`. It closes **DW-167**, whose reset-wiring walk the journey carries.
- **What the harness does NOT prove, and who does.** The server read, the session, the sync route and the CSP are the
  DEPLOYED walk's, which R-82 requires every story to run anyway — `run-verify-editor.cjs` gains the same journey
  from step 71. Nothing is mocked in either: the harness passes fixture props to a real component, exactly as
  `/pilots` has since Story 4.5.
- **What it costs:** about a minute on every `pnpm check`, a Chromium download in CI, and one test-only page that
  must keep step with the real one — which is a compile error rather than a silent drift, because both are typed
  against `EditorData`.
- Targets:
  - ✅ this entry · ✅ Story 5.9's spec (its Question 2, its tasks, its Design Notes and its Verification) ·
    ✅ `epics.md` (Story 5.9's AC) · ✅ `EXPERIENCE.md` (the four keyboard rows of the verified-by table) —
    Story 5.9's Create run (2026-09-19).
- **Deliberately not touched:** R-82, which still sends every story's review to the real infrastructure and is not
  softened by a harness that runs earlier; R-116, whose `needs: [check, rls]` is why this went inside `check` rather
  than into a job of its own; NFR-6(d)'s own definition, which is the deployed run and stays it.

**R-147 — `?` opens the shortcuts card, and it is FR-D11's fourteenth key.** Story 5.9's Q3, ruled option 1 (owner,
2026-09-19): *"Yes — `?` opens the card, and the menu row opens the same card everywhere else."*

- **Why it was a question.** `S3 Dashboard.dc.html:362` draws a **Keyboard shortcuts** row in the account menu with a
  mono **`?`** chip on it, and Story 1.5 left the row out by name — *"Story 5.9 adds it back with the shortcuts it
  lists"* (`account-menu.tsx:43-46`). But **the editor draws no account menu at all** (`shell.tsx:295-297`), so inside
  the one surface the card is about, the row is unreachable and `?` is the only door. FR-D11 calls its list complete,
  so binding `?` adds a key the PRD's list does not hold — a PRD-touching decision, and his.
- **What it binds.** `?` opens the shortcuts card from anywhere the editor holds focus, and the account menu's row
  opens the same card on every other screen. It is a **single-character shortcut** and carries the identical
  condition every other one carries — live only while the shell holds focus, never while a text field or a
  `contenteditable` has it (UX-DR11, WCAG 2.1.4). The card is the map's own table printed through the Kit's shortcut
  rows (`Editor Sidebar Kit.dc.html:274-280`) inside the app's one dialog vocabulary, and it lists exactly the keys
  that work (R-145).
- **What it costs:** FR-D11's "complete set" is now thirteen actions plus the key that lists them, and this entry is
  the record of that difference. Accepted: a map nobody can read from inside the editor is a map that is not used.
- Targets:
  - ✅ this entry · ✅ Story 5.9's spec (its Question 3, its Boundaries, its tasks and the owner's test) ·
    ✅ `epics.md` (Story 5.9's AC) · ✅ `EXPERIENCE.md` (the shortcut table) — Story 5.9's Create run (2026-09-19).
- **Deliberately not touched:** the thirteen actions of FR-D11's map, which are unchanged; S3's row, which is built
  as drawn; WCAG 2.1.4's remedy — this product still takes active-on-focus, and neither remapping nor a way to turn
  shortcuts off is built.

**R-148 — `Backspace` deletes the selected section, as `Del` does.** Story 5.9's Q4, ruled option 1 (owner,
2026-09-19): *"Keep both — Del and Backspace delete the selected section."*

- **Why it was a question.** FR-D11 names `Del`. A Mac laptop has no such key: the key labelled "delete" reports
  `Backspace`. Story 5.9's Dev bound both, and the spec's own Ask First reserves any global binding beyond FR-D11's
  map to the owner — the Review found it had not been asked.
- **What it binds.** One action, two hardware keys, one chip on the card (`Del`, as the frame draws it). Both carry the
  single-key condition (UX-DR11, WCAG 2.1.4): in any text field `Backspace` deletes a character and nothing else.
  A site-wide section still asks first (R-115); `⌘Z` undoes it.
- Targets: ✅ this entry · ✅ Story 5.9's spec (Question 4) · ✅ `lib/keymap.ts` (the `remove` row's comment).

**R-149 — the canvas stays ONE tab stop, and axe's `frame-focusable-content` is excepted on the canvas iframe alone.**
Story 5.9's Q5, ruled option 1 (owner, 2026-09-19): *"Keep the one Tab stop, and record this one scanner rule as a
deliberate exception for the canvas frame only."*

- **Why it was a question.** UX-DR9 makes the canvas one stop, built as `tabIndex={-1}` on the iframe. axe-core refuses
  that attribute on any frame whose document holds a focusable element — executed on production at `27a638fa`, where
  every one of step 8's scans went red on it. UX-DR9 as built and NFR-5's zero could not both stand.
- **What it binds.** NFR-5's zero holds for every rule on every element **except this rule on this element**. The
  exception is a node filter in `tools/probe/run-verify-editor.cjs` step 8, never a disabled rule: the same rule on any
  other frame still fails, and so does every other rule on the canvas frame and inside it.
- **What carries the weight instead:** everything in the canvas has a keyboard route through Layers and the Controls
  panel, and `tools/keyboard/journey.spec.mjs` proves it on every commit (R-146).
- **What it costs:** an automated WCAG 2.1.1 rule is answered by argument and a journey rather than by the scanner.
  Accepted: the alternative is dozens of Tab presses through the site's own links on every pass.
- Targets: ✅ this entry · ✅ Story 5.9's spec (Question 5) · ✅ `run-verify-editor.cjs` step 8 · ✅ `prd.md` NFR-5.

**R-150 — the Section Picker shows the whole library, Pro tagged; the rail has no "Free only" switch.**
Story 5.10's Q1, ruled option 1 (owner, 2026-09-19): *"No switch — the picker always shows everything, Pro tagged."*

- **Why it was a question.** `S5 Section Picker.dc.html:73-76` draws a **`Free only`** toggle in the rail's footer.
  **R-77** struck the identical affordance from B8's Site Remix for the identical reason — the canvas is open and
  FR-L3's exit sheet catches Pro at deploy — but R-77 was ruled about *Remix*, and carrying a ruling from one surface
  to another is exactly what standing rule 6 refuses to guess.
- **What it binds.** R-77's reasoning is now the rule for **browsing the library**, not just for re-rolling it. Every
  design offered on this canvas is shown; the ✦ Pro tag is the only Pro signal and is never pressable (UX-DR19, B10).
  **S5a and S5c are superseded on the rail footer alone** — every other pixel of both frames stands.
- **What it also avoids:** a small fraction of the library is `[Free]` (derived, `tools/inventory-gen.py`), so the
  toggle would have emptied most categories on press — a Free user would never meet the designs that sell the upgrade.
- Targets: ✅ this entry · ✅ Story 5.10's spec (Question 1, its Boundaries and its tasks) ·
  ✅ `EXPERIENCE.md` § *Drawn, but on the wrong mechanism* · ✅ `epics.md` (Story 5.10's AC) ·
  ⬜ `S5` loses the row whenever a library pass next touches the frames (as R-77's own B8 row still awaits).

**R-151 — the picker's dark preview is R-132's ONE button, not S5's segmented pair.** Story 5.10's Q2, ruled option 1
(owner, 2026-09-19): *"One button in the picker's header, exactly like the editor's (sun in light, moon in dark),
flipping the same setting the canvas uses."*

- **Why it was a question.** S5a`:82-85` and S5c`:236-239` draw a **two-cell sun/moon segmented** in the picker's
  header. **R-132** had already settled the same control everywhere else as *one button that swaps its glyph*, with
  `aria-pressed` and an accessible name naming the destination. Two approved things disagreed about one control's
  shape. There was also a mechanical half: `onShortcut` yields every single-key binding to `dialog[open]`, so with the
  picker open `.` and the top bar's own button are both out of reach.
- **What it binds.** One control, `components/editor/mode-toggle.tsx` reused verbatim, in the picker's header at the
  segmented's drawn position, flipping **the same `mode`** the canvas holds — so the picker and the page behind it can
  never disagree about which mode is being looked at, and a mode chosen in the picker survives closing it. S5's
  segmented is superseded; its **position** is kept. The previews alone invert: *"app chrome stays light"* (S5c's own
  caption) is untouched.
- Targets: ✅ this entry · ✅ Story 5.10's spec (Question 2, its tasks) · ✅ `EXPERIENCE.md` § *Drawn, but on the
  wrong mechanism* · ✅ `epics.md` (Story 5.10's AC) · ⬜ `S5`'s header, on the next library pass.

**R-152 — site-wide designs ARE in the picker; a second replaces the first; and a globe marks them instead of a
sentence.** Story 5.10's Q3, ruled option 1 (owner, 2026-09-19) with an amendment in his own words: *"Offer them, and
say plainly where they went — and picking a second one replaces the first. Do not add a text message that this is
shown on all templates. Instead for such Global sections — use a Globe icon with proper title/label visible on hover."*

- **Why it was a question.** Headers, announcement bars and footers are **shared**, and the editor's stack order is
  *derived*, not stored (`apps/web/editor.test.ts:103` — site-wide non-`a3`, then the canvas, then `a3` footers). So a
  header cannot land in the gap a user pressed "+" in, however it was invoked; honouring the invoked position would
  mean reopening Story 5.4's stack rule. And nothing in the code refuses a *second* header: `placementRefusal` knows
  only `a25`, and `canDuplicate` (`editor.tsx:1725`) governs duplication, not placement.
- **What it binds.** (1) A design whose `compileTarget` is `default.hbs` is **offered** on every canvas, and lands in
  the Site-wide group rather than at the invoked position. (2) **Picking a second one in the same category replaces
  the first** — header replaces header, footer replaces footer — as one edit, so `⌘Z` puts the old one back.
  (3) **No sentence, no toast, no banner.** A site-wide design carries the Kit's existing **`Globe`**
  (`components/kit/icons.tsx:412`, already the product's glyph for Sites and for an external link) on its **picker
  card**, with a hover `title` and the same string as its accessible name. The mark arrives *before* the press, which
  is where the surprise was.
- **What it does NOT touch, deliberately.** **Layers keeps no glyph** — R-126 removed the globe badge from B7's
  Site-wide group on the owner's own test and is not reversed here; the group's *name* is still what identifies it.
  The canvas name tag is Story 5.2's chrome and is `pointer-events: none`, so a hover `title` could not fire there
  anyway. **And the polite `#editor-said` announcement stays**: it is a screen reader's only access to a glyph and a
  hover, every other placement already announces (UX-DR12), and it is not a visible message — which is what the
  amendment struck.
- Targets: ✅ this entry · ✅ Story 5.10's spec (Question 3, its I/O matrix, its tasks and the owner's test) ·
  ✅ `EXPERIENCE.md` (the Site-wide singleton row) · ✅ `epics.md` (Story 5.10's AC).

**R-153 — the Section Picker's grid is FOUR COLUMNS OF TILES, a card's shape says what the section is, and the
`Add` lives in the footer strip.** The owner's test of the deployed Story 5.10, in his own words (owner, 2026-09-20):
*"I cannot clearly see what Rail section is. It is very thin. When I hover over it Add button is cut off. 1. Make the
grid 4 columns only. 2. On hover, show the Add button (only show icon, no text) in the bottom strip of the section
between name and Free/Pro. The Add icon buttons should be center aligned. 3. For thin/wider sections, can we span two
columns, so they are clearly visible. 4. For Longer sections we can span them two rows."*

- **Why it was wrong as drawn.** S5a`:88` draws **CSS multi-column** (`column-width:300px`), which gives every card
  the width of a column and the height of **its own content**. At 1440 that is five narrow columns, and a header —
  about 100px tall at Desktop width — is drawn as a ~20px sliver with its name under it. The fault he actually
  pressed follows from the same geometry: S5a's hover wash is the `Add` button and runs `top:0 → bottom:41px`, so on
  a section shorter than the pill inside it **the pill is cropped**. The frame was drawn with stress-fill cards of
  one comfortable height; the real library is not one height, and the miniature is the point of this surface.
- **What it binds.** (1) The grid is **four columns** of a fixed row unit, packed `dense`. (2) A card's **span is
  measured from the design's own drawn aspect** — its height at Desktop width, which the preview already knows:
  a **band** spans two columns, a **feed** spans two rows, everything between is one tile (`apps/web/lib/picker.ts`'s
  `spanFor`, the only place the two thresholds live) — **and that is the standard every future design inherits
  automatically**, which is his item 5 of the same day: a design's shape is *measured*, never authored, so a
  category added in Epic 9 or 10 is drawn wide, tall or ordinary with no entry in any list and nothing to remember.
  (3) The `Add` is an **icon, not a word**, in the card's
  **footer strip**, centred on the card between the name and the tier badge, revealed on hover and on focus — and
  always present where there is no pointer to hover with. S5a's wash stays as the hover treatment, decoration only.
- **What it does NOT touch.** Everything else in S5a and S5c stands: the 22px-inset panel, the 240px rail and its
  rows, `ALL CATEGORIES` with no number, the search field and its `⌘K` chip, the header, the card's own chrome, the
  tier badges, and S5c's rule that only the preview interiors invert. **S5a and S5c are superseded on the grid's
  shape and the `Add`'s seat alone.**
- Targets: ✅ this entry · ✅ Story 5.10's spec (its findings, its tasks, its owner test) · ✅ `EXPERIENCE.md`
  § *Drawn, but on the wrong mechanism* · ✅ `epics.md` (Story 5.10's AC) · ⬜ `S5`'s grid, on the next library pass.

**R-154 — the picker's rail leads with `All sections`, its heading is `CATEGORIES`, the meta line is the count
alone, and a hovered card takes a BORDER and nothing else.** The owner's second pass over the deployed Story 5.10
(owner, 2026-09-20), items 2, 3, 4 and 6 of six: *"Add 'All sections' link with count in the sidebar of section
picker at top. Remove 'shown in your pack: Paper' from top of section picker. Rename 'ALL CATEGORIES' to just
'CATEGORIES' in section picker sidebar. On hover, do not add any shadow/overlay on the section. Instead just add a
small border around it. And do not lift up on hover."*

- **Why each.** (1) S5a`:37` heads the rail `ALL CATEGORIES` but gives no way *back* to everything once a category
  is chosen — the only exit was pressing the chosen row again, which nothing tells you. A first row that says
  `All sections` and carries the same derived count as every other row is the exit, and it makes the heading beneath
  it redundant as *"all"* — hence `CATEGORIES`. (2) S5a`:81`'s `· shown in your pack: {pack}` states the surface's
  own premise: **every** preview is in the project's pack, by construction, so the line never varied and never told
  him anything. (3) S5a`:89-100`'s hover — a `rgba(28,27,26,.25)` wash over the preview, a 2px lift and a swapped
  shadow — **hides the miniature**, which is the one thing the card exists to show, and moves the card under the
  pointer. A 1px `--color-coral` border marks the card without covering it or moving it.
- **What it binds.** The rail's first row is `All sections`, a radio like any other carrying the empty value, with
  the count of everything offered on this canvas; the heading under it reads `CATEGORIES`; the header's meta line is
  `{n} designs` plus S5c's ` · dark mode`, and **names no pack**; and a hovered or focus-within card changes its
  **border colour only** — no wash, no shadow change, no transform. The header title follows the chosen rail row, so
  with nothing chosen it reads `All sections` too (decided rather than asked: two names for one state is a bug).
- **What it takes with it.** `EditorData.stylePack` and the `projects.style_pack` read added for that line are
  **deleted** — nothing else read them, and dead plumbing outlives the reason it was laid.
- Targets: ✅ this entry · ✅ Story 5.10's spec (its findings, tasks and owner test) · ✅ `EXPERIENCE.md`
  § *Drawn, but on the wrong mechanism* · ✅ `epics.md` (Story 5.10's AC) · ⬜ `S5`, on the next library pass.

**R-155 — a Section Picker preview is served ONE design's stylesheet, and the work lands in Story 5.10 rather than
waiting for Epic 9.** Story 5.10's Question 4, ruled **option 3** (owner, 2026-09-20): *"I would like to go with
option 3."*

- **Why it was a question.** The picker was slow on the deployed editor and the owner asked for options rather than a
  fix. Three costs were measured on the harness at 1600×1000 on 2026-09-20: `/canvas` is served `cache-control:
  no-store`, so every preview frame **re-downloads** it (50,877 bytes each); the picker is **unmounted on close**, so
  every open pays again; and `pilotsCanvasDocument()` puts **every** design's stylesheet in **every** frame, so the
  parse cost grows with the square of the library. Option 3 is the third.
- **What it binds.** `pilotsCanvasDocument(only?)` narrows to one design; `/canvas?design={id}` serves it, with an
  unknown id a **404** rather than a quiet fallback to the whole library; `previewSrc()` is the one place a preview's
  address is built. **The editor's own canvas is unchanged** and still carries every stylesheet, because it may draw
  any section in its document. Executed, same harness, same run shape: **50,877 bytes a frame → 14,675–19,687**, and
  the four previews land at **213 ms against 278 ms**. The byte split is why it is worth doing at five designs:
  42,511 of the document's 50,577 bytes ARE design stylesheets.
- **Where it lands, and why not its own story.** In **Story 5.10**. It changes only the surface this story built and
  the route that surface reads, it has **no user-visible change at all** — every preview draws exactly as before, which
  is the acceptance criterion — and the alternative was a story in Epic 9 whose own trigger (**DW-200**) is a payload
  problem this halves in advance. A separate story would repeat a whole review-deploy-test cycle for a change with no
  screen. **DW-200 is NOT closed**: its subject is the editor's *initial* payload — every placeable design handed to
  `read.ts` — which this does not touch.
- **What was NOT ruled, and stays open.** Options 1, 2 and 4 of that question. Option 1's caching is the half that
  makes a SECOND open free, and the owner chose 3 over it; it is recorded here so a later story does not re-derive it.
- Targets: ✅ this entry · ✅ Story 5.10's spec (Question 4, its tasks and its verification) · ✅ `epics.md`
  (Story 5.10's AC) · ✅ `deferred-work.md` (DW-200's note that the picker half is answered).

**R-156 — choosing a Layers row brings its section into view, and a picker card names its category.** Two more from
the owner's walk of the deployed Story 5.10 (owner, 2026-09-20): *"When selecting a card in Left Layers Panel, the
canvas should smooth scroll to that section so that section is in view. Add minor space at the top of that section
and do not touch to the top edge… Show section category in minimal fonts before the Free/Pro pills. Right now it just
shows the name."*

- **The reveal.** The canvas iframe is exactly the device's size (R-137) and its own document is longer, so the
  scroll is `contentWindow.scrollTo`, not the stage's. It is smooth, honours `prefers-reduced-motion` in JS (this is
  not a CSS animation, and `canvas-chrome.css` cannot carry a `scroll-behavior` rule — every selector in it must be
  keyed on `data-inflozo-`), and leaves **24 canvas pixels of air** above the section, which shrink with the fit
  exactly as the section does. **Only from Layers**: a press on the canvas is already looking at the section, and
  moving the page under that pointer would be a fault rather than a courtesy.
- **One exemption, found by execution rather than reasoning.** A **sticky** section — a site-wide header — travels
  with the viewport and is in view wherever the page is. Measured on the harness canvas at scroll 2425: the stuck
  root reports `getBoundingClientRect().top` **0** and `offsetTop` **2425**, so *neither* number is its layout
  position, and a naive reveal nudged the page 24px for nothing. Sticky and fixed roots are therefore left alone.
  A section near the document's END is a second honest limit: the browser runs out of scroll and clamps, which is
  right, and is why the journey's stop derives both ends of its walk instead of taking the last row.
- **The category on the card.** In the rail heading's own mono 10.5 on `--color-ink-soft-aa`, immediately before the
  tier pill, and in the card's accessible name between the design's name and its tier. No new size, no new token. A
  search crosses the rail (UX-DR6), so a card has to be able to say where it came from.
- Targets: ✅ this entry · ✅ Story 5.10's spec (its findings, tasks and owner test) · ✅ `EXPERIENCE.md` (the Layers
  surface row) · ✅ `epics.md` (Story 5.10's AC) · ⬜ `S5`, on the next library pass.

**R-157 — the canvas document may be KEPT by the browser, and the Section Picker is kept in the window once
opened.** Story 5.10's Question 5, ruled **option 1** (owner, 2026-09-20): *"Yes — let the browser keep the pages,
and keep the picker in the window once opened."* The pair to R-155: that one made a first open lighter, this one
makes every open after it free, which is what the owner's original complaint was — *"each time he will have to
wait… he needs to add many sections as he builds"*.

- **What it binds, half one — the address carries the build.** `next.config.ts` inlines `INFLOZO_CANVAS_V` from
  `VERCEL_GIT_COMMIT_SHA` or the runner's `GITHUB_SHA` (`vercel build` runs inside CI's deploy job, so the runner's
  environment is its environment), and every canvas address carries it — the editor's, the pilots review's and the
  keyboard harness's. The route then serves `private, max-age=31536000, immutable` **only when a version is
  present**, and `no-store` otherwise, so a request without one can never be answered from a stale copy. Nothing is
  cached outside production: an edited stylesheet must never be held while it is being edited. The pictures cannot
  carry the build — a relative `canvas?image=x` drops the document's query when it resolves — so they take
  `private, max-age=600`, which is all a session needs.
- **What it binds, half two — the picker is mounted on the first open and kept.** A closed `<dialog>` is
  `display:none`, which keeps every preview's browsing context alive while drawing nothing. An editor that has
  never opened the picker still carries no frames at all. One consequence had to be handled: a hidden element
  measures 0, and a zero would drop the fit to 0 and put the skeleton back over a drawn preview, so
  `section-preview.tsx` ignores a zero-width measurement and the last real size stands.
- **Measured on a production build of the harness (2026-09-20), which is the only place either half is live —
  `next dev` caches nothing by design.** A second visit in a new tab fetched **0 bytes** for every preview against
  16,551 / 16,430 / 19,687 / 14,675 on the first. And the second `⌘K` of a session completed in **25 ms** against
  **295 ms** for the first, creating no frame and fetching nothing.
- **One thing the first measurement got wrong, and it is the reason `pilots.test.ts` now asserts the address.** The
  keyboard harness had its own canvas path written as a literal, with no version — so the guard correctly refused
  to let anything be kept and the numbers came out flat. An address that quietly loses its `v=` does not go stale,
  it goes **slow, silently**; the harness path is built by `lib/canvas.ts` now and the test fails if any of the
  three drops it.
- Targets: ✅ this entry · ✅ Story 5.10's spec (Question 5, its tasks and verification) · ✅ `epics.md` (Story
  5.10's AC) · ✅ `apps/web/pilots.test.ts` (the address) · ✅ `run-verify-editor.cjs` step 83 (the header and the
  kept picker, on the deployed site).

**R-158 — the design ring is proved on the Controls review page, and the shipped library gains no design.**
Story 5.11's Question 1, ruled **option 1** (owner, 2026-09-20): *"Build it, and make the Controls review page a
real ring … I do not want to build all designs. Just a couple of samples enough for testing."*

- **Why it was a question.** Every category in `packages/library/designs/` holds **exactly one** design — the five
  pilots Story 4.10 chose — so `[`/`]`, the on-section arrows and Shuffle have nowhere to go in the editor. The
  story's whole claim is what happens **between** two designs, so on the deployed editor every assertion would be
  vacuous and the owner's test (R-80) would be a test of absence: "the arrows are correctly not there".
- **What it binds.** Two more designs in **`packages/library/fixtures/controls/`** — the fixture category that
  already carries a validated `content.json` with an authored array, a full control schema and the library's one
  `darkOverride` control, is already read by `controls.test.ts` and by the deployed `/controls`, and is **not** the
  shipped library. Three in the ring rather than two, because two make `◀` and `▶` indistinguishable and cannot
  prove a parked value surviving an **intermediate** design (1 → 2 → 3 → 1). `/controls` mounts the design picker
  over them, so the rule is exercised on **production** by the owner and by `run-verify-controls.cjs` (R-82); the
  keyboard harness takes the same ring, so `pnpm keyboard` walks it on every commit (R-146).
- **What it explicitly does NOT do, in his own words.** No library design is authored here. `packages/library/designs/`
  is untouched (AD-35), Epics 9 and 10 still author every shipped design, and *"a couple of samples enough for
  testing"* is exactly the fixture pair — not a pilot, not a category, not a third surface.
- **What the editor shows meanwhile.** The Design block, the strip, and the counter reading **"Design 1 of 1"** with
  one sentence saying the category has one design so far; the arrows and Shuffle are **absent**, never greyed
  (UX-DR3, R-118). The day Epic 9 fills a category they appear with no further work, because every count is derived.
- Targets: ✅ this entry · ✅ Story 5.11's spec (Question 1, its tasks, its verification and its owner test) ·
  ✅ `epics.md` (Story 5.11's AC) · ✅ `epic-5-context.md` · ⬜ `B1`, on the next library pass.

**R-159 — Shuffle is built in BOTH places, and the two frames that disagree about the section's pill are
reconciled.** Story 5.11's Question 2, ruled **option 2** (owner, 2026-09-20): *"In both places."*

- **Why it was a question.** Shuffle has two drawn homes and one of them no longer exists: `S6 Variant Shuffle.dc.html:140` draws a
  **`Try a design`** card (the destination's thumbnail, its name, *"Same words, new look"*, its tier badge) inside
  the Style group, and R-113 abolished S4c's pinned card that the group's pinned position belonged to; `B1b` draws
  **Shuffle** in a pill on the section itself, which S4b and S6 both draw without it.
- **What it binds.** Both. The panel's Design block ends with S6's **`Try a design`** card, which is the one place
  that can show **where a shuffle would take you before you press** — its whole argument — and the section's pill
  gains a Shuffle control **with the ring, before the divider**, because the divider in the built pill separates
  *which design* from *this section* (Duplicate · Delete · drag) and a shuffle is a which-design act. In the pill it
  is **icon-only** (the Kit's `Refresh`, its words carried as accessible name and hover title) through
  `DESIGN.md:534-536`'s carve-out — the same one R-132's mode button and R-136's moon badge use — because every
  other control in that pill is a 26px round icon target and a word would be the only text in it. Both are **absent**
  where the ring holds one design (UX-DR3).
- **And the pill itself is settled.** B1b draws an **ink** pill at the section's **top-left**; S4b and S6`:67` both
  draw the counter and arrows in the **white** quick-action pill at `top:10px;right:10px` that Story 5.4 built and
  R-125 placed. Two frames agree, one is the outlier, and R-118 already said `◀ ▶` arrive **in S4b's pill** — so
  **S4b + S6 govern the pill and B1b governs the affordance**. B1b's colour, its seat and its `⋯` are not built
  (R-126 keeps the `⋯` as the Layers row's one control).
- Targets: ✅ this entry · ✅ Story 5.11's spec (Question 2, its tasks and its owner test) · ✅ `EXPERIENCE.md`
  § *Drawn, but on the wrong mechanism* (the new **B1** row) · ✅ `epics.md` (Story 5.11's AC) ·
  ✅ `epic-5-context.md` · ⬜ `B1`, on the next library pass.
- **AMENDED by the owner's test of the deployed page, the same day (2026-09-20, Story 5.11's finding 3: *"Remove
  'Try a Design' in controls panel"*).** Shuffle keeps **ONE seat, the section pill's** — option 3's answer. S6`:140`'s
  `Try a design` card is **not drawn**, and with it went the one thing the card did that the button cannot: name and
  picture the destination before the press. In the editor Shuffle is therefore **pointer-only** (the pill is drawn on
  hover, and FR-D11's map is full so R-145 forbids it a key); what that costs in reach is nothing, because `[` and `]`
  get to every design a Shuffle could land on, and `journey.spec.mjs` proves so on every commit. His findings 2 and 4
  of the same test amended the block beside it: the counter prints **`7 of 18`** (the label to its left already says
  *Design*) and B1a`:395`'s **`Cycle designs` footer with its `[` `]` chips is not drawn** either — the `?` card is
  R-147's one place for them. **Everything else in R-159 stands**: S4b + S6 govern the pill, B1b governs the
  affordance, and in the pill the control is icon-only. Recorded at Story 5.11's Review, 2026-09-20 (the amendment
  had reached the spec and the code and not this entry — standing rule: propagate, never localise).
- Amendment targets: ✅ this entry · ✅ Story 5.11's spec (its Always bullet, tasks, AC and `## Owner's test findings`)
  · ✅ `EXPERIENCE.md` (the **B1** row) · ✅ `epics.md` (Story 5.11's AC) · ✅ `epic-5-context.md` · ⬜ `B1`, on the
  next library pass.

**R-160 — Where a parked value and a carried value disagree, the parked one wins.** Story 5.11's Question 3, ruled
**option 1** (owner, 2026-09-20): *"Show None — what you left that design with. Going back to a design always looks
exactly the way you left it, which is the promise the whole story is sold on."*

- **Why it was a question.** Two of FR-D19's promises pull apart in one narrow case: a control designs 1 and 3 share and
  design 2 lacks is PARKED against 1 on the way to 2, then CARRIED from 3 on the way back to 1 with whatever was set on 3.
  Both rules are kept; they disagree about which value design 1 then shows.
- **What it binds.** The parked record is restored over the carried value and cleared in the same breath (`switchControls`,
  `packages/section-runtime/src/controls.ts`), so returning to a design always shows it as it was left — which is what the
  owner's own test of the page checks (step 9). The other reading is one line and is not built.
- Targets: ✅ this entry · ✅ Story 5.11's spec (Question 3) · ✅ `epic-5-context.md` · ✅ the comment beside `switchControls`.

**R-161 — Site Remix re-rolls the canvas you are looking at, and the header and footer are left alone.**
Story 5.12's Question 1, ruled **option 1** (owner, 2026-09-20): *"Leave the header and footer alone in this
story … undo stays exactly as safe as it is now."*

- **Why it was a question.** FR-D17 names both halves as hard requirements — "site-wide singletons are excluded
  **unless explicitly included**" *and* **single-step undo** — and the two collide in the code: `commit(written,
  touched)` journals ONE doc and `undo()` restores ONE doc (`apps/web/lib/journal.ts:109-119`, whose own header
  says *"one transaction touches exactly one doc"*). Including the header therefore means a Remix touching two
  docs, so either undo learns to restore several at once or *"one undo, always"* becomes false.
- **What it binds.** The dice re-rolls the **current canvas's doc only**, in one `commit`, so the whole re-roll
  stays one journal entry and one `⌘Z` and the journal is untouched by this story. B8's *"Include the header and
  footer"* tick-box is **ABSENT, not greyed** (UX-DR3, R-118 applied again) — and so is B8's "Every page" row,
  which FR-D17 never asked for.
- **Why it is deferrable rather than dropped.** It is unprovable today either way: the header category in
  `packages/library/designs/` holds one design, so a ticked box would change nothing on any surface in the repo.
  The tick-box, and the `txn`-grouped undo it needs, land in the first story that has a site-wide ring to prove
  them on — `unsyncedEdits` already counts by `txn` in anticipation.
- Targets: ✅ this entry · ✅ Story 5.12's spec (Question 1, its Boundaries and its I/O matrix) ·
  ✅ `epic-5-context.md` · ⬜ `epics.md` (Story 5.12's AC, at this story's Done) · ⬜ `B8`, on the next library pass.

**R-162 — the dice is built in BOTH places: the editor's top bar and the Controls review page.** Story 5.12's
Question 2, ruled **option 1** (owner, 2026-09-20): *"The editor and the Controls review page."*

- **Why it was a question.** R-158's problem, one story later and one level up: every ring in the shipped library
  is length 1, so a Remix in the owner's own editor can move nothing and his test (R-80) would again be a test of
  absence. `/controls` already carries R-158's three fixture designs.
- **What it binds.** The dice, its roll and its confirm are mounted in the editor's top bar **and** beside the
  Controls review page's heading, over that page's own `ControlState`. On `/controls` the owner presses it and
  watches a section really change design with his typed words carrying; in the editor the confirm tells the truth
  — one sentence saying there is nothing to remix yet, with **Close** alone (R-12's shape, as R-134 already answers
  an empty "Clear dark overrides"). `run-verify-controls.cjs` proves the re-roll on production (R-82) and
  `pnpm keyboard` walks `⇧R` over the harness's ringed canvas on every commit (R-146).
- **What it does NOT do.** No design is authored in `packages/library/designs/` (AD-35, R-158 stands). `/controls`
  saves nothing and has no journal, so `⌘Z` is proved in the editor harness and not there.
- Targets: ✅ this entry · ✅ Story 5.12's spec (Question 2, its tasks, its verification and its owner test) ·
  ✅ `epic-5-context.md`.

**R-163 — the Site Remix control is a rolling 3D cube in Inflozo's own colours, and it is R-92's third stated
exception.** Story 5.12's Question 3, ruled **option 1** (owner, 2026-09-20): *"A real little cube. Six faces in
3D, coral pips on the app's paper white with our hairline edge, tumbling for about a second and settling on a
face."*

- **Why it was a question.** The export draws **no control at all** for Site Remix — `EXPERIENCE.md:154` gives
  `⇧R` as the surface's only door — so there is no frame to read, and R-92 says a glyph the export does not draw is
  a Claude Design prompt and never a new drawing in the repository, unless the owner names one (R-130, R-142).
- **What it binds.** A CSS 3D cube of six faces on `--color-surface` with a `--color-line` edge and pips in
  `--color-coral`, ~900 ms with a settling curve, inside a button with `mode-toggle.tsx`'s own geometry and its
  words carried as an accessible name and hover title (`DESIGN.md:534-536`'s carve-out — R-132, R-136, R-159).
  It is **icon-only with no label and no key chip**, in the owner's words *"just dice and no additional button or
  text"*. `globals.css`'s reduced-motion block flattens the roll. **Amended by R-164 the same day:** the confirm
  opens on the press, and it is the confirmed re-roll that lands on the roll's own `transitionend`, so a reader
  who asks for no motion gets the re-roll at once.
- **How it differs from R-130 and R-142.** Those two admitted a **Tabler path** the owner named. This one admits a
  **drawing of our own**, in token colours, because no icon set has a tumbling die — so R-92's scope now reads:
  the export governs every glyph it draws, and what it does not draw enters only where the owner names it, whether
  that is a Tabler path or, here, a shape built from the token layer. No hex enters a `.tsx`
  (`tokens.test.ts:125`).
- Targets: ✅ this entry · ✅ Story 5.12's spec (Question 3, its tasks and its Design Notes) ·
  ✅ `epic-5-context.md` · ⬜ `B8`, on the next library pass (the control it never drew).

**R-164 — the question comes first, the roll is the answer, and every face of the die is a different face.**
Three instructions from the owner on 2026-09-20, after seeing Story 5.12's dice on the deployed app. They are
one re-shaping of the same control, so they are one ruling.

- **(1) The confirm opens on the press, at once.** The first build rolled the cube on the press and opened the
  dialog on its `transitionend`, putting ~900ms between the press and the question — and animating a decision
  nobody had taken yet. His words: *"The popup should appear before the dice rolls."*
- **(2) The cube rolls on the CONFIRMED Remix, and the canvas lands as it settles.** *"Once user confirms for
  remix, the dice should continue rolling till the remix is done for all section."* The re-roll is one
  synchronous `commit`, so what the roll measures is the arrival, not the work: `onRemix` fires on the same
  `transitionend` the dialog used to. **Which end of the roll the canvas lands on was a routine call and was
  made, not asked** — it lands as the die STOPS, because that is the slot machine FR-D17 names
  (`B Missing Surfaces.dc.html:1622`) and the alternative shows the result while the die is still deciding.
- **(3) Each face draws its own number of pips.** *"The dice should show different number dots on each face."*
  **This was a defect, not a preference.** Every pip is a gradient LAYER positioned in percentages, and a layer
  defaults to `background-size: auto` — the whole 18px face. A percentage `background-position` resolves to
  `(container − layer) × pct`, so at that size every pip resolved to `0` and **all six faces drew one centred
  dot**. Executed and seen in Chromium before the fix and after it.
- **WHY IT SHIPPED GREEN, AND THE RULE THAT COMES OUT OF IT.** Both deployed walks asserted the face's computed
  `background-image` — the very rule they had been handed — and neither asked where the pips landed. That is a
  check reading back its own input, and standing rule 2's shape: **a geometric claim is proved by measuring the
  geometry.** Both probes and `pnpm keyboard` now compute each layer's centre from the box and the layer size
  and count the distinct ones; with the fix removed, face 2 collapses to one place and the check fails (control
  run, 2026-09-20).
- **What it does NOT change.** R-161 (the canvas you are on, one `commit`, one `⌘Z`), R-162 (the dice in the
  editor and on `/controls`) and R-163 (a real cube in token colours, icon-only, ~900ms with a settling curve)
  all stand. No hex enters a `.tsx`. The confirm is still B8 as re-specified, opening on Cancel.
- Targets: ✅ this entry · ✅ Story 5.12's spec (its frozen matrix and Intent, amended on his instruction, its
  acceptance criteria, its Design Notes and its owner test) · ✅ `remix-dice.tsx` · ✅ `globals.css` ·
  ✅ `tools/keyboard/journey.spec.mjs` · ✅ both deployed probes · ✅ `epic-5-context.md` (Story 5.12's review, 2026-09-20 — it still said the confirm opened on the event).

**R-165 — the preview-subject picker is built now, over the bundled publication, and Story 5.18 changes only
where its rows come from.** Story 5.13's Question 1, ruled **option 1** (owner, 2026-09-20): *"Build the list
now, over the sample publication."*

- **Why it was a question.** FR-D22 and Story 5.13's own acceptance criteria both say the user may override the
  subject *"once a site is connected"* — which is Story 5.18, five stories later — while `D5 Canvas Markers and
  Template Switcher.dc.html` D5e draws the picker in full. Read as a gate, the story would ship a pill that names
  the subject and nothing pressable; read as a description of where the rows come from, the picker can be real
  today, because the bundled publication already carries the rows D5e draws — a feed of dozens of posts, about
  three quarters of them with a feature image and the rest without.
- **What it binds.** D5e is built in full: the SUBJECT group, its search field, the style-guide entry first with
  its caption, then the feed's own posts with their dates and the **"has image"** marker *in words*, and D5e's
  helper line verbatim. The choice is per canvas and persists in `project_template_prefs.preview_subject` — the
  column the schema has carried since the complete-schema migration with **no reader anywhere** until this story.
  Story 5.18 swaps the source behind the same surface and rebuilds nothing.
- **Why it matters that it is pressable.** FR-D22's central claim is that a subject **with** a feature image and
  one **without** produce structurally different markup under FR-H8's media guards. `packages/library/designs/a24/1`
  binds `src:feature_image` with a `srcset`, so the guard removes the whole element — which the owner can now see
  by hand (R-80) instead of taking on trust. It is R-158's shape one story on: prove the rule on bundled data
  rather than assert it vacuously and wait.
- **What it does NOT do.** B9's **connected** state and its SOURCE group stay **ABSENT, not greyed** (UX-DR3,
  R-118 again): until Story 5.18 every canvas in the product renders the bundled publication, so the pill reads
  *"Previewing with: Sample content"* on every project — **including one whose `projects.linked_site_id` is set by
  Story 3.4's "Use your brand"**, because the pill describes the canvas and never the paperwork. No design is
  authored and no Ghost server is touched.
- Targets: ✅ this entry · ✅ Story 5.13's spec (Question 1, its Boundaries, its tasks and its owner test) ·
  ✅ `epic-5-context.md` · ✅ `epics.md` (Story 5.13's criteria and the FR-D22 summary line) · ✅ `prd.md` FR-D22's
  *"once a site is connected"*, and the same condition in FR-D15 and the glossary's *Preview subject* row. The
  last two were promised "at this story's Done", missed by Story 5.13's Done commit, and landed on 2026-09-21 at
  the owner's request, found while planning Story 5.14.

**R-166 — the content-source pill is built smaller than it is drawn, so the page card never moves.** Story
5.13's Question 2, ruled **option 1** (owner, 2026-09-20): *"Make the pill a little smaller, and leave your page
exactly as it is."*

- **Why it was a question.** `EXPERIENCE.md:159` puts the pill at the **canvas foot**, and the ground there is
  **32px** — `py-8`, which the owner himself set at **R-139** after finding a height-bound card standing on the
  window's edge. B9 draws the pill at about **27px** (`padding:5px 12px` over 12.5px type) and D5e states its
  target as **30px**; at `ViewportChip`'s own 4px inset that leaves between one pixel of clearance and two
  pixels of overlap against the card's bottom edge at Tablet, Mobile and a short-window Desktop. That is exactly
  the failure **R-138** was measured and ruled on, with no margin left.
- **What it binds.** The pill is built at **24px**. `py-8` does not move and no page card loses a pixel at any
  device. 24px is above WCAG 2.5.8's target floor, and it is the same trade `ViewportChip` already makes in the
  opposite corner: a thing that lives in that ground is sized for the ground, not for a frame's detail card.
- **What it does NOT change.** B9 governs the pill in every other respect — the dashed border and grey dot for
  sample content, the solid hairline and mint dot Story 5.18 will reach, the words, the radius and the type — and
  D5e governs the menu. R-138's and R-139's insets and padding stand exactly as delivered. The export is
  untouched (R-74); this entry is the record of the one difference, as R-138's own delivery already is.
- **How it is proved.** By measuring the geometry, never by reading back the rule (R-164): the deployed walk
  compares the pill's box to the page card's box at all three devices, and a pill that grew back past the ground
  fails it.
- Targets: ✅ this entry · ✅ Story 5.13's spec (Question 2, its Boundaries, its Design Notes, its tasks and its
  acceptance criteria) · ✅ `epic-5-context.md` · ✅ `epics.md` (Story 5.13's criteria, 2026-09-21) · ⬜ `B9`, on
  the next library pass.

**R-167 — a page's "looked at" record runs out at any change to the page.** Story 5.14's Question 1, ruled
**option 1** (owner, 2026-09-21): *"Any change to the page brings it back."*

- **Why it was a question.** FR-D16 says the editor "tracks which member states each canvas has been viewed in and
  surfaces the unchecked combinations", and gives the reason: "a design checked only as Anonymous ships a
  logged-in state nobody has seen". No document says when that record goes stale, and
  `project_template_prefs.member_states_viewed` (AD-22) holds only a set per canvas. A record that never expires
  clears the reminder for good after the first pass on each page, which is the forgetting FR-D16 exists to catch.
  A record that expires only on structural changes (a section added, removed or swapped, or its Member
  visibility changed) misses a members-only line reworded from the panel while previewing a signed-out visitor.
- **What it binds.** Any change to a canvas's doc, undo and redo included, leaves that canvas viewed only as the
  visitor on screen. A change to the site doc (the header or footer, which render on every page) does the same for
  the canvas on screen and empties every other canvas's record. A hydrate is not a change. Only the records that
  change are written, through one server action in one ordered chain. `afterChange` in `apps/web/lib/view-as.ts`
  is the ONE place the rule is decided, and `commit()` and `restore()` are its only callers.
- **What it does NOT change.** The reminder never blocks (FR-D16). The record is never part of the doc, the
  journal or `⌘Z` (AD-22). View as itself stays a session mode, back to Anonymous on reload (`EXPERIENCE.md:230`).
  Story 7.18's Pre-flight step reads the same record through `unviewed`.
- Targets: ✅ this entry · ✅ Story 5.14's spec (Question 1, its Boundaries and matrix, its tasks, its acceptance
  criteria and its owner test) · ✅ `epic-5-context.md` · ✅ `epics.md` (Story 5.14's criteria) · ✅ `prd.md`
  FR-D16's second paragraph, and ✅ `epics.md` Story 7.18's Pre-flight row, both at Story 5.14's Dev (2026-09-21) ·
  ✅ `apps/web/lib/view-as.ts` (`afterChange`) and `editor.tsx` (`commit()`, `restore()`), the same Dev.

**R-168 — a section hidden from the visitor being previewed is left out of the page, exactly as that visitor sees
it.** Story 5.14's Question 2, ruled **option 1** (owner, 2026-09-21): *"Leave it out, exactly as a paid member
sees the page."*

- **Why it was a question.** Three sources disagreed, and none had been ruled.
  - `P0 Editor Primitives - Spec.md:376-377` and `P0-4 Member Action Editor.dc.html:152` say a section hidden for
    the current View-as audience "ghosts to 40 % with a 'Hidden for this audience' pill; it is never removed from
    the editor". It is flagged ⚑, and `reconcile-designs.md`'s P0·4 table lists it as "Owner: accept", which was
    never given.
  - `A2-0 Category Proof.dc.html:44` draws the bar normally, with a dashed outline and a line such as "Not shown to
    free members".
  - What Stories 4.10 and 5.4 built, and the owner tested at 5.4, leaves the section out of the page. FR-D1's
    pixel-faithful canvas with zero chrome at rest points the same way.
- **What it binds.** On the canvas, `gateMembers` leaves out a section whose Member visibility excludes the visitor
  being previewed, as it already does. No ghost, pill or outline is drawn over the page. The section's Layers row
  stays, and R-124's caption names the visitor ("The canvas is previewing a paying member, so this section is not
  drawn here"), now following View as rather than the constant it read until Story 5.14. A2's own `audience`
  control follows the same rule when its Epic 9 story builds it.
- **What it does NOT change.** R-124's select and its four values, and R-126's Layers panel, which draws nothing
  about who can see a section. The export is untouched (R-74). The P0·4 ghost and A2-0's outline are superseded on
  this point, and this entry is the record.
- Targets: ✅ this entry · ✅ Story 5.14's spec (Question 2 and its Boundaries) · ✅ `epic-5-context.md` ·
  ✅ `epics.md` (Story 5.14's criteria) · ✅ `prd.md` FR-D16's first paragraph, at Story 5.14's Dev (2026-09-21) ·
  ⬜ `P0 Editor Primitives - Spec.md` and `A2 Announcement Bars - Spec.md`, on the next library pass.

**R-169 — the not-viewed reminder is a coral dot on each unviewed row of View as's menu, and nothing beside the
button.** The owner, on Story 5.14's deployed build (`d4d6e266`, 2026-09-21): *"Remove '2 not viewed' text. Instead
just show a coral dot in the dropdown items. Dot means that list items is yet to be viewed."*

- **What it binds.**
  - No marker sits beside the View as button: S4d's "2 not viewed" chip (`S4 Editor.dc.html:405`) is not built.
  - In the menu, each visitor this page has not been looked at as carries ONE coral dot in the row's trailing slot,
    where the check sits on the current row. The current row is always viewed, so the two never meet.
  - The dot is 8px, D5b's row mark and the app's one dot in a menu row, in `coral-deep`, the check's own ink.
  - The dot's word, "Not viewed", is kept in the row **for screen readers only**. A sighted reader's signal is the
    dot's presence, which is a shape, so colour never carries it alone.
- **What it supersedes.**
  - S4d's marker, and Story 5.14's "N not viewed" marker and its "Not viewed" chip on each row.
  - FR-D16's "a quiet marker beside the toggle".
  - The spec's boundary "every dot has its word beside it". The word stays, held for assistive technology.
  - This departs, for this one control and on the owner's word, from R-130's "the shape never travels alone", which
    governs D5b's switcher rows.
- **What it does NOT change.** R-167's record and when it runs out. `unviewed`, and Story 7.18's Pre-flight row,
  which reads it. The reminder never blocks. The export is untouched (R-74).
- Targets: ✅ this entry · ✅ Story 5.14's spec (its Boundaries, matrix, tasks, criteria, owner test and findings) ·
  ✅ `apps/web/components/editor/view-as.tsx` · ✅ `apps/web/lib/view-as.ts` (the marker's words removed) ·
  ✅ `prd.md` FR-D16's second paragraph · ✅ `epics.md` Story 5.14's criteria · ✅ `EXPERIENCE.md`'s S4d row ·
  ✅ `epic-5-context.md` · ✅ the deployed walk's step 90 and step 8, and the keyboard journey — Story 5.14's Dev
  (2026-09-21).

**R-170 — each visitor has one name, and the signed-out one is "Logged out user".** The owner, the same day: *"rename
Anonymous to Logged out user like it is in Controls and View as dropdown value. All of these should be same to avoid
confusion."*

- **What it binds.**
  - The button's value, the menu's row, R-124's panel caption and the live-region sentence all name each visitor with
    S4d's row title: **Logged out user · Free member · Paid member**.
  - In a sentence they read "a logged out user", "a free member" and "a paid member", no longer "a visitor who is not
    signed in" and "a paying member".
  - `lib/view-as.ts` derives every sentence from the rows, so the four places cannot drift apart.
- **What it supersedes.** S4a's trigger value "Anonymous" (`S4 Editor.dc.html:33`) and B9's "Anonymous"
  (`B Missing Surfaces.dc.html:1417`), and "Anonymous" as FR-D16's word for the first state.
- **What it does NOT change.**
  - The Controls panel's Member visibility list keeps A22's audience words: Everyone · Logged out · Free members ·
    Paid members. The owner named it as the model, and its entries are audiences, plural beside plural.
  - The ids `anonymous`, `free` and `paid` in `MEMBER_STATES` and in the stored record.
  - The export is untouched (R-74).
- Targets: ✅ this entry · ✅ Story 5.14's spec · ✅ `apps/web/lib/view-as.ts` (`VALUE` removed, `PREVIEWING` derived) ·
  ✅ `view-as.tsx` · ✅ `prd.md` FR-D16, FR-H5's strip sentence and Appendix A's A32 row ·
  ✅ `sections-inventory.md`'s A32 row · ✅ `epics.md` (FR-D16's summary and Story 5.14's criteria) ·
  ✅ `EXPERIENCE.md` (the IA row and S4d's) · ✅ `epic-5-context.md` · ✅ the deployed walk (steps 37 and 90) and the
  keyboard journey — Story 5.14's Dev (2026-09-21). ⬜ `B9` and `S4a`, on the next library pass.

**R-171 — the top bar's two menus, Template and View as, share one look.** The owner, on Story 5.14's deployed build
(`6f2944ef`, 2026-09-21):

> *"Add icons for dropdown items in Template at top. Use relevant icons from Tabler icons. Use a relevant icon for any
> custom template a user may create. Remove eye icon from the View As dropdown. Just keep the icons in the dropdown
> items. Both Template and View as dropdown to look similar. Add relevant one liners below the template name. Add
> 'Custom template' one liner below custom templates. Remove Auto generated and Empty text from right of list items.
> Instead show the relevant icons there which are currently shown on left."*

- **What it binds.**
  - **One anatomy for both menus**, in `apps/web/components/editor/bar-menu.tsx`:
    - D5b's trigger (32px, `0 12px`, an 8px gap, label and value, chevron).
    - S4d's card (radius 12, 6px padding, `shadow-lg`), headed in 11/600 uppercase: "Templates" and "Preview as".
    - A list that scrolls inside the card.
    - Rows of a 15px glyph, the name at 13/500 over one 11px line, and a trailing slot.
    - The current row carries the coral check and no tint. *(Superseded the same day by **R-172**: the row in force
      is highlighted, not ticked.)*
  - **The Template rows.** Each leads with a Tabler glyph: `home` · `article` (Post) · `file-text` (Page) · `tag` ·
    `user` (Author) · `user-plus` (Signup) · `login-2` (Signin) · `user-circle` (Member home) · `error-404` · `lock`
    (Private). A custom template from Story 7.16's Routes Manager takes `template`. Each glyph is emitted from
    `packages/library/icons/tabler.json`, which is R-92's third owner-named exception after R-130 and R-142.
  - **The one-liners.** Under each name sits one line (`CANVASES[key].caption`), and a custom template's reads
    "Custom template".
  - **The marks.** R-130's three state marks move to the row's trailing slot, beside the check on the current row.
    Their words, "Auto-generated" and "Empty", are no longer printed. Each is the mark's hover title and the row's
    `sr-only` text, which is `DESIGN.md`'s carve-out (R-132, R-136, R-159).
  - **View as's trigger loses its eye.** Its rows keep their glyphs.
  - **Both menus open on their checked row**, scrolled into view.
- **What it supersedes.**
  - D5b's row drawing: dot first, word on the right, the coral tint on the current row.
  - S4a's eye on the View as trigger.
  - R-130's "the word 'Empty' stays beside it": the shape now travels with its word as a title and a screen reader's
    text, not in print, on the owner's word.
- **What it does NOT change.** The Membership group, the rows' order and states, R-128's absent rows, and R-98's
  "Opening…", which is now said on the pressed row's one line. The export is untouched (R-74).
- Targets: ✅ this entry · ✅ Story 5.14's spec (its owner's findings, tasks, criteria and owner test) ·
  ✅ `bar-menu.tsx`, `template-switcher.tsx`, `view-as.tsx`, `kit/icons.tsx` (eleven Tabler glyphs), `lib/editor.ts`
  (the captions) · ✅ `prd.md` FR-D6's switcher sentence · ✅ `epics.md` UX-DR8, Story 7.16's custom-template rows and
  Story 5.22's narrow top bar (the wider group touches the right-hand cluster below about 950px) ·
  ✅ `DESIGN.md`'s carve-out · ✅ `EXPERIENCE.md`'s Template Switcher row · ✅ the deployed walk (steps 40, 43, 90)
  and the keyboard journey — Story 5.14's Dev (2026-09-21). ⬜ `D5b` and `S4a`, on the next library pass.

**R-172 — the row in force is highlighted, not ticked, in both of the bar's menus.** The owner, on Story 5.14's
deployed build (`545b815e`, 2026-09-21): *"For active template or view as — instead of showing a tick mark, show that
list item as highlighted."*

- **What it binds.** In the Template list and in View as's, the current row takes D5b's own current-row treatment: the
  `coral-tint` ground and its name at 600. No row carries a tick. The row keeps its tint under the pointer, and
  `aria-current` tells a screen reader which row it is. It is built once, in `bar-menu.tsx`'s row.
- **What it supersedes.** S4d's check with no tint on View as's current row, R-171's "current row carries the coral
  check and no tint", and D5b's check beside its tint.
- **What it does NOT change.** The not-viewed dots (R-169) and the state marks (R-171), which keep the trailing slot.
  `DESIGN.md` already names `coral-tint` as the ground of a selected row. The export is untouched (R-74).
- Targets: ✅ this entry · ✅ Story 5.14's spec (finding 9, its criteria, tasks and owner test) · ✅ `bar-menu.tsx`,
  `template-switcher.tsx`, `view-as.tsx` · ✅ `EXPERIENCE.md`'s Template Switcher row · ✅ the deployed walk (steps
  40 and 90) — Story 5.14's Dev (2026-09-21). ⬜ `S4d` and `D5b`, on the next library pass.

**R-173 — a link typed into a section's text takes the Style Pack's link look.** The owner, answering Story 5.14's
Question 3 (2026-09-21) with option 2: *"Fix it inside this story now."* His finding on the deployed build: *"Any
text that is made an anchor link using the text controls becomes blue … I want to make them look good and not
generic blue anchor links."*

- **What it binds.** A plain link, an `<a>` with no class, reads FR-E1's link style: the pack's `--link-color` and
  `--link-decoration`, the two tokens R-112 gave values that nothing read. That covers every link the `a` mark writes.
  In Paper it is ink words with the accent underline in light, and accent words in dark.
  - **At zero specificity**, so a design that draws its own links keeps them.
  - **Never invisible.** On a contrast, accent or image ground the link keeps the ground's own words, and on
    contrast the underline takes `--accent-on-contrast`. The ground is the Background role in force (`data-bg`),
    so a design drawn on a ground of its own locks that role or writes its own link rule
    (`docs/section-authoring.md`).
  - **One rule, in the token block** (`tokens.ts`'s `referenceTokensCss()`). It reaches the canvas, `/pilots`,
    `/controls`, the render matrix, and the theme through Epic 6's pack blocks. It names no mode (AD-30).
- **What it does NOT change.** R-112's values; FR-D4's four marks and the link record; any design's own link rule;
  any design's pixels (the render matrix is unchanged). The export is untouched (R-74).
- Targets: ✅ this entry · ✅ Story 5.14's spec (finding 6, Question 3, the frozen block on his word, its criteria,
  tasks and owner test) · ✅ `packages/section-runtime/src/tokens.ts` and the regenerated `reference-tokens.css` ·
  ✅ `tokens.test.ts` · ✅ the deployed walk (step 20) · ✅ `prd.md` FR-E1 and FR-D4 · ✅ `epics.md` Story 5.14 and
  Story 6.1 · ✅ `docs/section-authoring.md` · ✅ R-112's entry · ✅ `deferred-work.md` (DW-155) — Story 5.14's Dev
  (2026-09-21). ⬜ T1 and T3, when a theme first ships the token block (Story 6.1).

**R-174 — the four moving parts the table marks "no" hold still while you design, like every other one.** Story
5.15's Question 1, ruled **option 1** (owner, 2026-09-22): *"Hold all four still while you design; Preview shows them
moving."*

- **Why it was a question.**
  - FR-D20 (`prd.md:243`) and Story 5.15's card named "sticky/shrink headers, scroll reveal, tabs, accordions" as
    edit-safe modules that "run always, because designing their open and closed states requires it".
  - Research §7, which FR-D20 itself names as the table the declaration lives in, marks `header-scroll`, `reveal`,
    `tabs` and `accordion` **no**, and `registry.json` carries §7's values (DW-133).
  - Only `lightbox` and `carousel` had ever been ruled directly, so the difference was the owner's (standing rule 6).
- **What it binds.** All four are suppressed on the canvas and render at rest, which is their no-JavaScript state
  (FR-G7(4)):
  - tabs stack, each with its label
  - fold-out panels stay as the section is set (A9's default state)
  - fading content is simply shown
  - a shrinking header keeps its full size

  Preview runs them. No `editSafe` value changes, so `derive-module-reach.py --check` is untouched.
- **What it does NOT change.** Every other §7 value. A countdown keeps ticking while you design ("ticking digits
  interfere with nothing", §7), although B3a draws one stopped: the frames are non-normative for behaviour.
- Targets:
  - Done at Story 5.15's Create (2026-09-22): ✅ this entry · ✅ Story 5.15's spec · ✅ `epics.md` (Story 5.15's
    criteria) · ✅ `epic-5-context.md`.
  - Done at Story 5.15's Dev (2026-09-22): ✅ `prd.md` FR-D20's example list · ✅ `epics.md`'s FR-D20 summary ·
    ✅ `deferred-work.md` DW-133, closed · ✅ research §7's confirmation line · ✅ VERIFY-AT-BUILD row 50.

**R-175 — the PAUSED chip shows only on the section pointed at or selected, and only on a part that moves by
itself.** Story 5.15's Question 2, ruled **options 1 and 3 together** (owner, 2026-09-22): *"Only on the section you
point at or select, but only on parts that move by themselves, not all sections be default."*

- **Why it was a question.** Two approved sources disagreed on one point.
  - B3a draws the chips on the canvas at rest, as "the one exception to a chrome-free canvas"
    (`B Missing Surfaces.dc.html:681`), and Story 5.15's card says the states match B3a.
  - FR-D1 (`prd.md:218`) says that with nothing hovered or selected, the canvas carries zero editing chrome.
- **What it binds.**
  - **When.** A chip is drawn only while its section is hovered or selected, and never at rest. FR-D1, AD-21's
    rest-is-zero and the deployed walk's step 3 all hold.
  - **Which.** Only on a held-still part that **moves by itself**: one that changes the page on a timer or as the
    page scrolls, with nothing pressed. A part that waits for a press or a submit never carries one, because held
    still it looks exactly as it does at rest: a phone menu, a sign-up form, a lightbox, tabs, a carousel's arrows.
  - **Where it is said.** `registry.json` gains `movesByItself` on every row, the one place that says which, and the
    editor filters `core`'s held-still mounts through it. Which modules carry a chip is read off that file — the rows
    with `editSafe: false` and `movesByItself: true` — and is not listed here, where it would go stale with the first
    new row (standing rule: derive, never restate). A part that rewrites itself once as the page loads does not
    move, so it carries none.
- **What it does NOT change.**
  - B3a's chip itself: its look, its words, and its place on the behaviour rather than in a status bar.
  - A carousel's optional autoplay (research §3.5) is a per-design choice that the module row cannot see, so an
    autoplaying carousel carries no chip. Its first category story may raise it.
  - Today's library draws no chip anywhere, because the pilots' `nav-drawer` and `member-form` both wait for a
    press. CI draws one on controls fixture 1, which declares `marquee` for exactly that.
  - The export is untouched (R-74).
- Targets:
  - Done at Story 5.15's Create (2026-09-22): ✅ this entry · ✅ Story 5.15's spec · ✅ `epics.md` (Story 5.15's
    criteria) · ✅ `epic-5-context.md`.
  - Done at Story 5.15's Dev (2026-09-22): ✅ `registry.json` (`movesByItself` on every row, its rule in `about`) ·
    ✅ `prd.md` FR-D20 · ✅ `EXPERIENCE.md`'s behaviours paragraph · ✅ `docs/section-authoring.md` · ✅ research §7's
    preamble · ✅ `ARCHITECTURE-SPINE.md` AD-21 · ✅ R-120's pointer above.
  - Owed on the next library pass: ⬜ B3a's caption.

**R-176 — where a page has no page 2, no page-2 preview is offered at all.** Story 5.16's Question 1, ruled **option 1,
with the control absent rather than greyed** (owner, 2026-09-22): *"Do not give option to preview Page 2. As it will not
exist."*

- **Why it was a question.** FR-D21 (`prd.md:245`) says the fixture "carries enough posts for a second page to exist"
  and that page 2 is "deliberately a middle page". That holds on Home, where 52 posts at 12 a page make five pages. It
  does not hold on an archive, which since Story 5.13 lists only its own tag's or writer's posts: no sample writer has
  more than 7, and only two tags have more than 12. Read in Ghost's source on both majors, a page past the last is a
  404 (`routing/controllers/channel.js:55-60`), so FR-D21's promise and FR-H3's sizes disagreed on archives.
- **What it binds.**
  - Page 2 is previewed only where it exists: the page's shown main feed lists more posts than one page holds.
    Where it exists it is the real one — on the sample tags Field Notes and Reporting, the last page.
  - Where it does not, the **Preview page** row is **absent**: no greyed value and no sentence. A hidden main feed
    shows no list, so it offers none either.
  - Nothing is invented: no deeper `pagination`, no page-1 rows relabelled (FR-H3).
  - When page 2 stops existing while it is on screen, the canvas returns to page 1 and `#editor-said` says why.
- **What it does NOT change.** The sample publication (FR-H3's sizes, the owner's at Story 4.4) stays as it is, and
  Home's page 2 is still the middle page FR-D21 describes.
- **Amended by R-179 (owner, 2026-09-22):** page 2 is its own design, so a hidden main feed on page 1 no longer removes
  the page-2 control. A page whose posts fit on one page still offers none.
- Targets:
  - Done at Story 5.16's Create (2026-09-22): ✅ this entry · ✅ Story 5.16's spec (the frozen block on his word) ·
    ✅ `epics.md` (Story 5.16's criteria) · ✅ `epic-5-context.md`.
  - Done at Story 5.16's Dev (2026-09-22): ✅ `prd.md` FR-D21.

**R-177 — page 2 is edited exactly as page 1 is, and stands for every page after it.** Story 5.16's Question 2, ruled
**option 2, with page 2 standing for every later page** (owner, 2026-09-22): *"Page 2 should allow to change
everything - any change in Page 2 will be same for all subsequent pages - 3,4,5.. So do not allow to change Page 3 and
onwards."*

- **Why it was a question.** D5d draws page 2 as a focused view — every layer but the main feed's greyed, no outline —
  and FR-D21 says nothing about what can be changed there. The frames are non-normative for behaviour (build-sequence
  standing rule 6), so the difference was the owner's.
- **What it binds.**
  - Every section page 2 shows can be pointed at, selected, edited on the canvas, changed in its panel, duplicated,
    deleted, moved, re-rolled and added after — on the canvas, in Layers and by key — as on page 1.
  - A change there is made to that section. Pages 3, 4, 5… are the same page design (read in Ghost's source: an
    archive keeps one template on every page, and `/page/N/` always renders `index.hbs`), so they carry it — and so
    does page 1, which shows the same sections (R-127 on Home, one template on an archive).
  - A section page 2 leaves out — on Home, anything above the main feed — is greyed in Layers and cannot be picked.
  - No page 3 or later is previewed or changed. Links on the canvas never navigate, so the pager's Older link does not
    open page 3.
  - A section added on Home's page 2 from the gap above the main feed lands directly below it, the first place page 2
    has (R-127 puts nothing above the feed on page 2).
- **What it does NOT change.** D5d's pill, its row and its words; R-127's rule for what page 2 is made of; the export,
  which is untouched (R-74). D5d's greyed layers are superseded by this entry, which is the record of the divergence.
- Targets:
  - Done at Story 5.16's Create (2026-09-22): ✅ this entry · ✅ Story 5.16's spec (the frozen block on his word) ·
    ✅ `epics.md` (Story 5.16's criteria) · ✅ `epic-5-context.md`.
  - Done at Story 5.16's Dev (2026-09-22): ✅ `prd.md` FR-D21.
- **Amended the same day by R-178:** a change made on page 2 does NOT reach page 1. The second bullet of "What it
  binds" above records the reading the owner corrected.

**R-178 — page 1 and page 2 are designed separately: page 2 starts as a copy of page 1, nothing done on page 2 changes
page 1, and pages 3, 4, 5… share page 2's design.** The owner, clarifying Story 5.16's Question 2 the same day
(2026-09-22): *"No, Page 1 is designed independent from Page 2, 3, 4, ... But when page 2 is being designed, it copied
everything from Page 1 on initial load when the user opens Page 2 the first time for edit. If user makes edits on Page
2, then Page 1 should never be edited/modified. Page 1 should remain as it is. Only Page 3, 4, 5, 6, ... should have
same design as that of Page 2. Page 1 should remain an independently designed page."*

- **Why it was needed.** R-177 was recorded reading "any change in Page 2 will be same for all subsequent pages" as
  reaching page 1 too, because under R-127 page 2 was page 1's own sections. The owner corrected that reading.
- **What it binds.**
  - Page 1 and page 2 are two designs, and pages 3, 4, 5… show page 2's.
  - Page 2 starts as a copy of page 1 and follows it until the first change made on page 2, which makes the copy page
    2's own ("the first time for edit", and AD-22's rule that only an edit materialises). Undoing that change, or
    removing every section from page 2, returns it to following page 1.
  - Nothing done on page 2 ever changes page 1.
  - **It holds on Tag and Author pages too.** R-177 makes page 2 editable there, and only a separate page-2 design lets
    both rulings hold. Ghost uses one file for every page of an archive, and marks page 2 and after with its `paged`
    context (read in source on both majors, `context.js` 5:35-36 and 6:32-33), so the theme can switch designs there.
  - On Home, page 2 is `index.hbs`, the file Ghost serves at `/page/N/`. `/index` stays a 404 and the Template switcher
    gains no row: page 2 is reached from the page-2 switch, so R-127's "no canvas" stands, while what page 2 is made of
    changes.
  - A design that can go on the Home page can go on page 2: Ghost hands `home.hbs` and `index.hbs` the same posts and
    pagination, so copying page 1 never refuses a section.
- **What it supersedes.** R-127's rule that page 2 IS the Home doc from its main feed down, as the whole of page 2 (it
  may stay page 2's starting point: Story 5.16's Question 3), and R-177's reading that page 1 carries a change made on
  page 2.
- **Open, asked the same day.** What page 2 starts from on Home — the Home page from the post grid down, or all of it
  (Story 5.16's Question 3) — and whether the site-wide header and footer can be changed from page 2, which R-177 and
  R-178 answer differently (Question 4). **Both ruled the same day: R-179 and R-180.**
- Targets:
  - Done at Story 5.16's Create (2026-09-22): ✅ this entry · ✅ the pointers under R-127 and R-177 · ✅ Story 5.16's
    spec (its Question 2, the two questions it opened, and its status back to `draft`) · ✅ `epics.md` (Story 5.16's
    criteria) · ✅ `epic-5-context.md`.
  - ✅ Story 5.16's spec, rewritten when Questions 3 and 4 were ruled — the same day, R-179 and R-180 below.
  - Done at Story 5.16's Dev (2026-09-22): ✅ `prd.md` FR-D21, FR-D6 and FR-I1 · ✅ `ARCHITECTURE-SPINE.md` AD-22
    (page 2's round trip, and its three keys) and AD-27(d) (`pageTwoStack`) · ✅ `sections-inventory.md` `:804-806` and
    §3's heading · ✅ `epics.md` Story 7.3, which compiles page 2's own design and an archive's page-2 branch ·
    ✅ DW-194 (its note).

**R-179 — page 2 starts as an exact copy of page 1, on Home, Tag and Author alike.** Story 5.16's Question 3, ruled
**option 2** (owner, 2026-09-22): *"Page 2 starts as an exact copy of Page 1. User can edit each section/style of page 2
independently from Page 1. Users can also edit Page 2 indepenedntly for Authors, Tags, too."*

- **Why it was a question.** R-127 made page 2 the Home doc from its main feed down, so a welcome above the grid
  appears once, on page 1. R-178's words said page 2 "copied everything from Page 1", and the two disagreed on where
  page 2 starts.
- **What it binds.**
  - Page 2 starts as every section of page 1, in order, with its words and settings: the band above a Home's grid
    included. It follows page 1 until the first change made on it (R-178).
  - Each section of page 2, and each of its settings, is then changed on its own. "Style" is each section's own
    settings, and the Style Pack stays one for the whole site (Epic 6).
  - Tag and Author pages likewise.
  - Page 2 is its own doc: Home's under `index` (the file Ghost serves at `/page/N/`), and Tag's and Author's under
    `tag-paged` and `author-paged`, which a migration adds first (R-99).
  - `pageTwoStack` replaces `indexStack` as the one implementation (AD-27(d)): page 2's own doc, else an exact copy of
    page 1.
- **What it keeps.** On a Home with no main feed — a landing page, which offers no page 2 in the editor — the compiled
  page 2 stays R-127's plain list of posts, so `/page/2/` does not repeat a landing page with no posts. That is Story
  7.3's to compile. `/index` stays a 404, and the Template switcher gains no row.
- **What it supersedes.** R-127's slice as page 2's content, and R-176's application to a hidden main feed: page 2 is
  its own design, so a hidden grid on page 1 still offers page 2.
- Targets:
  - Done at Story 5.16's Create (2026-09-22): ✅ this entry · ✅ Story 5.16's spec, re-planned whole ·
    ✅ `epics.md` (Story 5.16's criteria) · ✅ `epic-5-context.md` · ✅ the pointers under R-127 and R-176.
  - Done at Story 5.16's Dev (2026-09-22): as R-178's, all ✅.

**R-180 — the header and footer can be changed from page 2, and the existing site-wide prompt says it changes them
everywhere.** Story 5.16's Question 4, ruled **option 2, with the prompt** (owner, 2026-09-22): *"Yes allow them to
change from Page 2 too. Keep the existing prompt stating that this will change it everywhere."*

- **Why it was a question.** A site-wide section is one shared instance on every page (FR-D5). R-177 said page 2 lets
  you change everything, and R-178 said nothing done on page 2 may change page 1. For the header and footer, both could
  not hold.
- **What it binds.**
  - A site-wide section can be changed from page 2, and the change shows on every page, page 1 included. It is
    R-178's one exception.
  - FR-D5's existing dialog asks before Hide and Delete, on every page, as it always has. On page 2 it also asks before
    the first change to each site-wide section, in its own vocabulary: "Change {name} everywhere?", opening on Cancel,
    with **Change it everywhere** and **Cancel**. A confirmed section asks nothing more until page 2 is left.
  - Nothing new asks on page 1.
- **Read, and stated to the owner.** "Keep the existing prompt" is read as extending that dialog to a change made from
  page 2. If only Hide and Delete were meant, the extra ask is one guard to remove.
- Targets:
  - Done at Story 5.16's Create (2026-09-22): ✅ this entry · ✅ Story 5.16's spec · ✅ `epics.md` (Story 5.16's
    criteria) · ✅ `epic-5-context.md`.
  - Done at Story 5.16's Dev (2026-09-22): ✅ `prd.md` FR-D5's site-wide sentence and FR-D21.

**R-181 — a note under the Preview page row says that every page after page 2 uses its design.** The owner, after
Story 5.16's Dev (2026-09-22): *"Add a note that subsequent pages will take design from Page 2."*

- **What it binds.** Under D5d's **Preview page** row, on page 1's main feed and on page 2's copy of it, the Kit's
  helper caption reads **"Pages 3, 4, 5 and on use page 2's design."** It is written once, as `lib/page-two.ts`'s
  `LATER_PAGES` (R-170), and the row's radio group reads it as its description, so a screen reader hears it with the
  choice.
- **Where, and why there.** D5d draws the same caption under its Pagination row (`:428`), so the note follows the frame
  (R-74). The row is where page 2 is chosen, on both pages.
- **What it does NOT change.** R-177's rule itself; the pill; Layers; the frames (R-74).
- Targets: ✅ this entry · ✅ Story 5.16's spec (the frozen block on his word, its first criterion, a task and the owner's
  test) · ✅ `lib/page-two.ts`, `kit/segmented.tsx`, `kit/labels.tsx`, `controls/sidebar.tsx` · ✅ `page-two.test.ts`,
  the entering journey and step 92 · ✅ `EXPERIENCE.md`'s Page 2 Preview row — Story 5.16, after its Dev (2026-09-22).

**R-182 — `{page_number}` prints the page's own number, in `{members}`'s form, and only where it was typed.** Story
5.16's Question 5, ruled **option 1** (owner, 2026-09-22): *"The current page number. Ghost uses a helper {{page}} and
I think we need to use {{page}} or {page} instead of {page_number}. We need to use same format like we have used for
member count - {members}. If we do not have any issues in using {page_number} then only we should use it as it is more
informative. Page 1 should respect the design user created. If user does not uses {page_number} then we should not
show it."* Asked after his request of the same day: *"I want to have a {page_number} dynamic data that I can add
anywhere where I can edit text inline. So users can add a header, hero and show the Page number there."*

- **What it binds.**
  - `{page_number}` is an inline token in R-27's form: single braces, typed into a text or pressed as a chip.
  - **Every text field of every section accepts it.** That is the one exception to R-27's per-field lists; every
    other word in braces still prints exactly as typed.
  - On the canvas it shows the page on screen: 1 on page 1 and 2 on page 2. On the live site each page shows its own
    number, so page 3, which uses page 2's design (R-177), shows 3.
  - Nothing adds a page number by itself, on any page. Where the user typed the token on page 1, page 1 shows 1.
- **The name, checked as he asked** (read in Ghost's source, 5.130.6 and 6.58.0). There is no `{{page}}` helper: no
  `page.js` in `core/frontend/helpers/`. `{{page}}` appears only inside the `{{pagination}}` helper's own template,
  which that helper renders after merging `pagination`'s properties onto its context (`pagination.js:52`), so there
  `{{page}}` is `pagination.page`. Ghost 6 words it `{{t "Page {page} of {totalPages}" …}}`. Inflozo substitutes its
  own token and never passes it through `{{t}}`, so `{page_number}` clashes with neither, and the more informative
  name stands.
- **What it does NOT decide.** How the theme emits it, and where Ghost serves `pagination.page` to the header in
  `default.hbs`: both are Story 5.16a's to read in source and record on T1 and T3 (standing rule 1).
- **⚠ ONE BULLET OF THIS RULING IS REVERSED — see R-186 (owner, 2026-09-23).** Where this entry says page 1 prints "1"
  where the user typed the token, **page 1 now prints nothing and the token is not offered there at all.** The entry is
  left as it was written rather than corrected, because it is the record of what was ruled on 2026-09-22; R-186 is what
  binds. Everything else here stands.
- Targets: ✅ this entry · ✅ Story 5.16's spec (Question 5) · ✅ `epics.md` Story 5.16a — Story 5.16, 2026-09-22.
  ✅ Story 5.16a's spec · ✅ `prd.md` FR-D4 and FR-G3 (the one token every field accepts) · ✅ `ARCHITECTURE-SPINE.md`
  AD-4 (R-27's amendment) and AD-5 (the one unescaped constant) · ✅ `vocabulary.ts`'s `PAGE_NUMBER` beside
  `INLINE_TOKENS`, which stays at three · ✅ the panel's placeholder menu · ✅ `docs/section-authoring.md`
  — Story 5.16a, 2026-09-23.

**R-183 — where a page has no page number, `{page_number}` prints nothing.** Story 5.16's Question 6, ruled **option
2** (owner, 2026-09-22): *"If there are no page number - show nothing."*

- **What it binds.** On a post, a page and the 404 page, the token prints nothing. A header reading "Orbit Weekly ·
  page {page_number}" reads "Orbit Weekly · page" there.
- Targets: ✅ this entry · ✅ Story 5.16's spec (Question 6) · ✅ `epics.md` Story 5.16a — Story 5.16, 2026-09-22.
  ✅ Story 5.16a's spec · ✅ executed on T1 and T3 (`MEASUREMENTS.md` §49: a post, a standalone page and the 404 print
  nothing on both majors, because Ghost leaves `pagination` off those templates entirely) — Story 5.16a, 2026-09-23.

**R-184 — the page number token is its own story, straight after Story 5.16.** Story 5.16's Question 7, ruled
**option 1** (owner, 2026-09-22): *"Its own story, straight after this one"*.

- **What it binds.** It is **Story 5.16a, "The page number token"**, numbered with the board's lettered suffix so it
  sorts straight after 5.16 and no other story is renumbered. Story 5.16 goes to Review as it stands.
- Targets: ✅ this entry · ✅ Story 5.16's spec (Question 7) · ✅ `epics.md` (Story 5.16a's card) ·
  ✅ `sprint-status.yaml` (its backlog row) · ✅ `epic-5-context.md` — Story 5.16, 2026-09-22.

**R-185 — every dynamic placeholder is reached from one `{}` icon beside the field's label, and P0-1's chip row is
withdrawn.** Story 5.16a's Question 1, answered with a design of the owner's own (owner, 2026-09-23): *"It should not
repeat. Change in how dynamic placeholders ({members}, {page_numbers} etc to be shown. We will show a small '{}' icon
near the label of the field where we can have dynamic placeholders. On click of that, it will show the list of
placeholders we can choose and a small descriptions below each. On right side we will have option to copy that code and
insert that code. Keep overall design clean and minimal. This should be done for all future placeholders and existing
ones. Add a note about this design so it is not missed when we work on them in future."*

- **What it binds, for every placeholder there will ever be.** A field that accepts any placeholder carries **a small
  `{}` icon beside its label** and nothing else — no caption, no chip row, no sentence under the field. The icon opens
  a menu listing the placeholders **that field** accepts: per row, the placeholder's code, **a one-line description
  under it**, and on the right **Copy** and **Insert**. **The card holds the rows and nothing else.**
  *Amended the same day, before anything was built* (owner, 2026-09-23): *"Do not mention 'anything else in braces
  prints exactly as you typed it' anywhere. It is understood."* — so `P0-1:193`'s info box is withdrawn along with the
  chip row, and that sentence appears **nowhere in the product**.
- **It replaces a drawn frame, deliberately.** `P0-1 Inline Text Toolbar.dc.html:174-204` drew the caption
  `TOKENS THIS FIELD ACCEPTS`, a chip row and a grey info box **under** the field, and `:197` ruled "a field with no
  tokens shows no row at all". R-182 made `{page_number}` a token every text field accepts, which would have put that
  block under every text box — eight times in the Newsletter's panel. **The owner withdrew it rather than repeat it.**
  R-74 still stands: the export remains the design authority for everything it draws that a later ruling has not
  replaced, and this surface is **extrapolated from the nearest frame that has these parts** — S4d's and D5b's menu
  anatomy, already built as `apps/web/components/editor/bar-menu.tsx` under R-171, whose row is a name over **one line
  of description** with a **trailing slot**. No second vocabulary is invented.
- **A placeholder cannot arrive without its description.** The description is not decoration; it is what the menu is
  for. Every placeholder is declared in one place with its one-liner, and a design declaring a placeholder that has
  none is **refused at authoring time** — so "all future placeholders" is a gate, not a habit.
- Targets: ✅ this entry · ✅ Story 5.16a's spec (Question 1, and the surface it builds) · ✅ `DESIGN.md` § Components
  (the note the owner asked for, written at Create so a later story cannot miss it) · ✅ `epics.md` Story 5.16a's card
  — Story 5.16a, 2026-09-23. ✅ `docs/section-authoring.md` (what an author declares, and the description they must
  write) · ✅ `EXPERIENCE.md` (the field's affordance) · ✅ `epic-5-context.md` · ✅ built:
  `components/controls/placeholder-menu.tsx` over `bar-menu.tsx`'s `PlaceholderRow`, with `vocabulary.ts`'s
  `PLACEHOLDERS` and `validate.ts`'s `no-placeholder-description` refusal — Story 5.16a's Dev, 2026-09-23.

**R-186 — `{page_number}` is offered on page 2 alone and never prints on page 1; R-182's "page 1 shows 1" is
reversed.** Story 5.16a's Question 2, answered outside its three options (owner, 2026-09-23): *"{page_number} should be
only offered on 2nd page design of paginated content. We want to show pages only on 2nd, 3, 4, 5… etc pages and never
on the first page. We should not give the placeholder option for any text field on the 1st page. If we want to have
each page hold it, no problem, but do not give options to the users to add {page_number} on 1st page."*

- **The offer.** The `{}` menu lists `{page_number}` **only while the canvas is showing page 2** of a paginated
  template. On page 1 — and on Post, Page, 404, Private and a custom template — no text field offers it, so a field
  whose only placeholder is this one carries no `{}` button there at all. It follows the page-2 control exactly, which
  R-176 already offers only where a page 2 exists, so "paginated content" needs no second rule.
- **The print.** Nothing on page 1. The number on pages 2, 3, 4, 5… — page 3 prints 3 because it renders page 2's
  design (R-177). Nothing on a post, a standalone page or the 404 (R-183, unchanged).
- **Holding it on page 1 is accepted, and cannot be prevented.** The header and footer are one object shared by every
  page (R-180), and a page 2 that still follows page 1 is page 1's own rows (R-179), so a field that page 1 shows can
  carry the token. The owner ruled this explicitly — *"If we want to have each page hold it, no problem"* — and page 1
  simply prints nothing in its place. **The visible cost:** a header reading "Orbit Weekly · page {page_number}" reads
  "Orbit Weekly · page" on the front page and on every post.
- **It reverses R-182 on one point only.** R-182's third bullet had page 1 printing "1" where the user typed the token;
  it now prints nothing. Everything else in R-182 stands: the name, the form, the canvas showing the number as a
  visitor sees it, the token showing again on click-in, and nothing appearing that the user did not type.
- **The theme guard changes shape, and must be executed before it is trusted.** One constant is no longer enough:
  Ghost prints `pagination.page` as 1 on page 1. The emission becomes a guarded constant — the candidate is
  `{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}`, whose guard is falsy exactly on page 1 and where
  `pagination` is absent. **Standing rule 1 binds:** it is read in Ghost's source on both majors and executed on T1 and
  T3 into `MEASUREMENTS.md` §49 before anything is emitted for it.
- **⚠ THE GUARD SHIPS IN A DIFFERENT SPELLING, and the difference was measured, not chosen** (Story 5.16a's Dev,
  2026-09-23). The candidate above spells `@root`, and **gscan refuses every `@root.…` path as an ERROR on BOTH
  bundled versions** — `GS120-NO-UNKNOWN-GLOBALS`, whose allow-list (`@site`, `@member`, `@setting`, `@config`,
  `@labs`, `@custom`, `@page` and `{{#foreach}}`'s data variables) is byte-identical in gscan 4.49.7 and 6.4.2 — so a
  theme carrying it cannot pass the 0-errors gate every emitted theme must pass. **What ships is
  `{{#if pagination.prev}}{{pagination.page}}{{/if}}`**: the same guard, one qualifier shorter, executed on T1 and T3
  and printing exactly what this ruling requires. The `@root` form was preferred because only it survives a
  context-changing block; §49 (d) measures that difference and prices it at zero — it appears only inside
  `{{#foreach}}`, and no design puts an editable prop inside a Ghost repeat. **Nothing about what the customer sees
  changes**, which is why this is recorded rather than asked.
- Targets: ✅ this entry · ✅ Story 5.16a's spec · ✅ R-182's entry (the reversed bullet, marked not rewritten)
  — Story 5.16a, 2026-09-23. ✅ `epics.md` Story 5.16a's card · ✅ `DESIGN.md` § Components (a placeholder may be
  offered on some pages only) · ✅ `EXPERIENCE.md` · ✅ `epic-5-context.md` · ✅ `MEASUREMENTS.md` §49 (executed on
  T1 and T3) · ✅ built: `PAGE_NUMBER_HBS` in `marks.ts` — Story 5.16a's Dev, 2026-09-23.

**R-187 — the header and footer never offer `{page_number}`; only page 2's own sections do.** Story 5.16a's Question 3,
ruled **option 2** (owner, 2026-09-23): *"Do not offer it in the header or the footer — only in page 2's own
sections."*

- **What it binds.** A site-wide section — one stored in the `site` doc and compiled into `default.hbs` — **never**
  lists `{page_number}` in its `{}` menu, on page 2 or anywhere else. The offer survives only on the page's own
  sections while the canvas shows page 2. Together with R-186 the rule is one line: **offered when the canvas shows
  page 2 AND the section is not site-wide.**
- **Why he ruled it.** The header and footer are one object across every page (R-180), so a page number added there
  would print on page 2 and leave a hole in the same sentence on the front page and on every post. Option 2 makes
  "never a page number on page 1" absolute for everything site-wide. **The cost he accepted:** his own first example
  for this feature was the header — *"users can add a header, hero and show the Page number there"* — and the header is
  now the one place it cannot be added from. A page number goes in a section that belongs to page 2: a hero, a heading,
  a grid's small line.
- **It restricts the OFFER, not the substitution.** A user who types `{page_number}` into a header by hand is still
  honoured — it prints on page 2 and nothing elsewhere. One substitution rule everywhere is kept deliberately: a token
  that printed in one section and shipped as literal `{page_number}` to a visitor in another would be worse than the
  hole it avoided, and R-186 already drew the line at the offer.
- Targets: ✅ this entry · ✅ Story 5.16a's spec — Story 5.16a, 2026-09-23. ✅ `epics.md` Story 5.16a's card
  · ✅ `DESIGN.md` § Components · ✅ `EXPERIENCE.md` · ✅ `epic-5-context.md` · ✅ built: `placeholdersOffered` in
  `vocabulary.ts`, the one function every caller asks — Story 5.16a's Dev, 2026-09-23.

**R-188 — what the owner's own test of R-185's menu changed, and the note that now has a check behind it.** Story
5.16a's owner test and its Question 4 (owner, 2026-09-23). Five findings on the surface, and one ruling on the
`{{#foreach}}` limitation: *"Leave the written note, and add a check that shouts the day it stops being true."*

- **The five findings, in his words.** (1) *"Copy and Instert should be minimal icons from tabler icons. Show
  title/label on hover."* (2) *"Once copied, show a tick icon instead of copy and show back the copy icons after 2
  seconds."* (3) *"Once inserted, close the list."* (4) *"Do not crop the description. Right now it is cropped 'The
  number of the page a vi...'."* (5) *"For multiple placeholders in the list, show hover effects on each item."*
- **What each binds.** The two row actions are Tabler `copy` and `text-plus`, glyphs with **no words**, each naming
  itself through `title` (the hover label he asked for) and `aria-label`; Copy answers with Tabler `check` for **two
  seconds** and is Copy again; **Insert closes the menu**, reversing R-185's first reading that it is "a thing you may
  do more than once"; the description **wraps to as many lines as it needs** and is never truncated; and every row
  carries `BarMenuRow`'s own hover. Findings 4 and 5 land in `PlaceholderRow` itself, so the placeholder menu and the
  Template switcher still cannot drift apart (R-171, R-74).
- **Tabler enters the Kit only where he names it**, and he named three. Not a fifth stated exception to R-92 but R-185
  reaching the rows it opened: `copy`, `text-plus` and `check`, each `tabler.json`'s own `outline`, emitted from it
  and verified path for path. They are named for the menu — `PlaceholderCopy`, `PlaceholderInsert`,
  `PlaceholderCopied` — because `icons.tsx` already carries an export-drawn `Copy` and `Check` that other surfaces
  read, and one name means one thing (R-170). The precedent is `SyncCheck`.
- **Question 4, ruled option 1.** `{page_number}` emits one constant that Handlebars resolves against the CURRENT
  context, so inside a `{{#foreach}}` it would read the row rather than the page and print empty on the site while the
  canvas printed the number — the two emitters disagreeing, which is the one thing §7.3 exists to prevent. The
  `@root` spelling survives the block and gscan refuses it as an ERROR on both majors (MEASUREMENTS §49), so the
  constant cannot reach for it. **No design does this today** — swept, not asserted — and the remedy he chose forbids
  nothing: the note stays in `docs/section-authoring.md`, and a sweep in `tools/stress/test-vocabulary.mjs` fails the
  day an editable prop appears inside a `data-repeat`, naming the design and handing the reader the note. He declined
  the outright refusal because it would also block editable words in a repeating row that never wanted a page number.
- Targets: ✅ this entry · ✅ Story 5.16a's spec, `## Owner's test findings` and Question 4 — Story 5.16a, 2026-09-23.
  ✅ `DESIGN.md` § Components · ✅ built: `icons.tsx`'s three glyphs, `bar-menu.tsx`'s `PlaceholderRow` and
  `PLACEHOLDER_ACTION`, `placeholder-menu.tsx`, the sweep in `tools/stress/test-vocabulary.mjs` and step 93 of the
  deployed walk — Story 5.16a's Fix, 2026-09-23.

**R-189 — there is no Rosa: the edit lock says WHERE, never WHO.** Story 5.17's Create, Question 1 (owner,
2026-09-23): *"Say where, not who — 'somewhere else'."* The three frames for FR-D18 — `B Missing
Surfaces.dc.html` B5a, B5b, B5c — were drawn assuming two people share a project. **They cannot happen.** A project
carries one `user_id` and team seats are explicitly out of v1 (`prd.md` Appendix G), so the other editing context is
**always the same person** — another tab, another browser, another device. The choreography, the escalation and every
frame's shape are untouched; only the words change, and **"Or message Rosa" is removed entirely, because there is
nobody to message**.

- **The strings, and they are the whole ruling.** The reader's bar (B5a): **"You are editing this site somewhere
  else — you are reading along here"** with **Request editing**. The holder's popover (B5b): **"Your other session
  wants to edit"** over *"If you hand over, your unsynced edits are sent first. You keep reading along."* The
  take-over confirm (B5c): **"Take over from your other session?"** over *"That session has not responded for
  <duration>. It has edits that never reached the server."*, and its danger panel's second line becomes **"They exist
  only in that session. We cannot retrieve them from here."** — the frame's own sentence with the person taken out,
  which EXPERIENCE.md already called *exactly right*.
- **Two things the person's removal takes with it.** B5b's 32 × 32 avatar keeps its size and its place in row one —
  the mark-then-ask shape is what makes the popover readable — and carries the Kit's `Lock`, B5a's own padlock,
  in place of initials. And the revived former holder's sentence is read **by the session it is about**, so it is
  **"This session had 7 unsynced edits; they were not included."** — one pronoun, so the sentence is true from where
  it is read. Both are routine judgements inside his ruling, recorded here rather than asked.
- **Already-approved strings that survive word for word**, and are why option 1 was the recommendation: *"No
  response; that session has X unsynced edits"* — there "that session" IS the other one — and the revived holder's
  sentence above. One vocabulary across the whole flow.
- **The export is NOT edited and EXPERIENCE.md's Appendix A is NOT edited** (R-74, and the same reason standing
  rule 5 gives). The frames stay as Claude Design drew them and F2 re-specifies them, which is the pattern F2
  already used for B5c's itemised list; Appendix A's prompts are the dated record of what was asked of the designer
  and rewriting one would make it lie about what produced the export. A future session finding "Rosa" there has
  found the record, not a miss.
- Targets: ✅ this entry · ✅ Story 5.17's spec, Question 1 and its string table — Story 5.17's Create, 2026-09-23.
  ✅ `EXPERIENCE.md` F2, § State Patterns, § Destructive confirms and the IA row · ✅ `prd.md` FR-D18 ·
  ✅ `epics.md` Story 5.17 · ✅ `epic-5-context.md` · ✅ built: `lock-bar.tsx`, `lock-request.tsx`,
  `lock-takeover.tsx` — Story 5.17's Dev (2026-09-24; read on `app.inflozo.com` by `run-verify-lock.cjs`).

**R-190 — an edit that is on your computer but not on the server is UNSYNCED, everywhere.** Story 5.17's Create,
Question 2 (owner, 2026-09-23): *"'unsynced' everywhere."* The approved wording named one number with two words —
B5c's *"7 **unsynced** edits will be lost"* against FR-D18's *"That session had 14 **unsaved** edits"* — seconds
apart in the same flow. **`unsynced` wins, and `unsaved` appears nowhere in the product.** The reason is the
indicator on the same screen: `persistence-indicator.tsx` prints **"Saved on this device"** and then **"Synced"**, so
an edit written locally and not yet sent genuinely *has* been saved; calling it unsaved would contradict the badge
two inches above it. This is R-170 applied a third time — one name for one thing, across bar, popover, confirm and
announcement.

- **What it does NOT change:** the stored column and the wire field stay `unsynced_edits`, which they already were
  (§AD2 — *"Edits is canonical, everywhere"*), and the number still counts **user-perceived edits, never operations**
  (AD-16), so a Shuffle or a Site Remix is one edit however many ops it cost.
- Targets: ✅ this entry · ✅ Story 5.17's spec — Story 5.17's Create, 2026-09-23. ✅ `EXPERIENCE.md` F2 ·
  ✅ `prd.md` FR-D18 · ✅ `epics.md` Story 5.17 · ✅ `epic-5-context.md` · ✅ built: every string in Story 5.17's
  three surfaces — Story 5.17's Dev (2026-09-24; `lock.test.ts` asserts `unsaved` appears in none of them).

**R-191 — another device hears a lock request at its next check-in, up to ~15 s; Supabase Realtime is not used in
v1.** Story 5.17's Dev, Question 3 (owner, 2026-09-24): *"Leave it at about fifteen seconds."* Executing §AD2's
transport for the first time (`MEASUREMENTS.md` §50) found its middle layer has nowhere to live: the app has no
browser-side Supabase client — no `NEXT_PUBLIC_*` key, and a session cookie that is `httpOnly` precisely because
there is none — and a PRIVATE Realtime channel is refused without a policy on `realtime.messages`, which is a
migration. **The lock's signals are `BroadcastChannel` (same browser: instant and free) and the ~15 s heartbeat
(everything else)**, the row itself carrying the nudge, the release and the take-over.

- **What it costs, and he was shown it before he ruled.** Another device hears a request at its next beat, up to
  ~15 s late, so the holder there can have as little as ~15 of the requester's ~30 s to answer before *Take over
  anyway* appears. Both sessions are always the same person (R-189), and B5c still says exactly how many edits a
  take-over would lose before anything is lost.
- **What it does NOT change.** §AD4's constants (heartbeat ~15 s, nudge ~30 s, stale ~60 s), the choreography, the
  strings and the protocol; and nothing about the transport is ever shown.
- **Reopening it is a story of its own, with a Schema phase (R-99):** a browser-side client, a published key, a
  script-readable session and a `realtime.messages` policy — the things the security posture deliberately lacks.
- Targets: ✅ this entry · ✅ Story 5.17's spec, Question 3 — Story 5.17's Dev, 2026-09-24 · ✅ `addendum.md` §AD2
  (Signaling) · ✅ `ARCHITECTURE-SPINE.md`'s Supabase row · ✅ `deferred-work.md` DW-239, closed ·
  ✅ `epic-5-context.md` · ✅ the code comments that called it open (`lib/lock.ts`, `lib/lock-client.ts`,
  `editor.tsx`).

**R-192 — a session reading along has every control that would edit DISABLED, and keeps every control that only
changes the view.** Story 5.17, the owner's test of the Dev build `e6341b38` (owner, 2026-09-24): *"In read only,
make all controls disabled/non-editable. Also disable inline text editing/adding links/etc."* F2 said the reader's
controls stay *visible* and "nothing responds", and the build met that only in its effect: `commit()` refused every
change, but 53 of the settings panel's 55 controls still looked live, took focus and opened their pickers, and
Layers' ⋯ menus, **+ Add section** and **Site Remix** still opened over nothing — executed from a reader's side on
`app.inflozo.com` before the fix.

- **Disabled, natively.** A `<fieldset disabled>` (`kit/greyed.ts`'s `ReadOnly`, drawn only while reading along, so
  the holder's DOM is untouched) makes every control inside it greyed, unresponsive and out of the Tab order, while a
  screen reader still reads each one with its value as unavailable. **Not** P0-0's `aria-disabled` plus a reason per
  control — that is one control among live ones; here the whole editor is read-only and the reason is said once, by
  B5a's bar, which the panel is `aria-describedby`.
- **Reading is not editing.** Picking a section, opening a group or a list item, Template, View as, dark mode, the
  device sizes and Preview stay live, because F2's own rule is that the reader can *see what is set*.
- **Where it reaches:** the settings panel (every field, switch, picker, the `{}` and link buttons, the rich text
  field, Reset this design and Clear dark overrides); Layers (⋯, drag, + Add section); the section pill (the ring,
  Shuffle, Duplicate, Delete; the grip absent); the top bar (Site Remix, Undo, Redo); and the editing shortcuts,
  classified once in `lib/keymap.ts` as a `Record` over every gesture so a new one cannot compile unclassified.
- **What it does NOT reach:** FR-L3's read-only (a Free project over its cap, D4e) is a different state with a
  different remedy and its own story; the same `ReadOnly` is there for it, unruled.
- Targets: ✅ this entry · ✅ Story 5.17's spec (`## Owner's test findings` 2, and its manual test step 3) ·
  ✅ `EXPERIENCE.md` F2, the reader's row · ✅ built: `kit/greyed.ts`, `sidebar.tsx`, `item-list.tsx`, `rich-field.tsx`,
  `layers.tsx`, `section-pill.tsx`, `lib/keymap.ts`, `editor.tsx` — Story 5.17's Dev, walked by `run-verify-lock.cjs`.

**R-193 — once the canvas shows the customer's own site, an untouched Tag page and Author page start on the site's
tag and writer with the most posts.** Story 5.18's Create, Question 1, ruled **option 1** (owner, 2026-09-24): *"The
tag and writer with the most posts."* FR-D22 made the untouched subject *"a fixed Orbit Weekly tag and author on the
archives"* — the sample magazine's own **Field Notes** and **Rosa Menendez** — which a real site does not have, so
the rule could not be followed on live content without inventing one.

- **The rule.** The tag, and the author, whose `count.posts` is highest in the site's own list; **a tie goes to the
  name that comes first in the alphabet** (Ghost's own order for tags and authors). It is only the starting choice:
  the customer's own pick from the pill still wins and is kept, as R-165 built it.
- **What it does NOT change.** Post and Page still start on the style-guide article and page, which exist whatever
  the source; the sample's own archives keep Field Notes and Rosa Menendez, so the snapshots and the render matrix do
  not move; and a site with no tag (or no author) at all still previews the sample's, saying why.
- **What the ruling raised.** A brand-new Ghost site holds one post, one tag and one author — `fixtures.json` and
  `fixture-manager.js`, read in source on 5.130.6 and 6.58.0: the post *Coming soon*, tagged *News* and written by the
  site's owner (the fixture user is the owner placeholder), plus the page *About this site* — so the fullest archive
  is a one-post archive. The owner asked what can be done there, which is Story 5.18's Question 2 — ruled as R-194.
- Targets: ✅ this entry · ✅ Story 5.18's spec (Question 1, its tasks and its owner test) — Story 5.18's Create,
  2026-09-24. ✅ `prd.md` FR-D22 and the glossary's *Preview subject* row · ✅ `epics.md` (Story 5.13's
  untouched-subject criterion, Story 5.18's criteria) · ✅ `epic-5-context.md` · ⬜ built: `apps/web/lib/live-content.ts`
  — Story 5.18's Dev.

**R-194 — on a site too thin to fill a page, the canvas shows the site as it is, and the note that says so offers
the full page one press away.** Story 5.18's Create, Question 2, ruled **option 1** (owner, 2026-09-24): *"Show your
one post, and put a 'Preview with sample content' button in that note."* A brand-new Ghost site holds one post, one
tag and one author (R-193's third bullet), so on live content every list is one card in a grid built for twelve.

- **The rule.** The canvas keeps showing the site's own content — connecting a site shows its content (FR-C4) and a
  list is never padded with posts nobody chose (R-36). The editor-only note FR-H4 gives a section whose list does not
  fill it — *"This site has 1 post; this section shows up to 12 per page."* — carries one button, **Preview with
  sample content**, which switches the whole editor to Sample content: the pill's own SOURCE row, one action with two
  doors. Focus then lands on the pill, which now reads "Sample content" and is where the site comes back.
- **Where it appears.** Only while the canvas is showing the site's content. On Sample content, or on a project with
  no linked site, there is nothing to switch to, and the button is absent (UX-DR3) whatever the note says. It changes
  the view and not the site, so a session reading along keeps it live (R-192): it is drawn outside the panel's
  `ReadOnly` rows.
- **What it does NOT do.** No threshold and no automatic switch — option 2 was declined, because it broke FR-C4, drew
  an arbitrary line at one page, and would change the editor under the customer on the twelfth post. Nothing is
  stored: the source stays session state.
- Targets: ✅ this entry · ✅ Story 5.18's spec (Question 2, its matrix, its strings, its tasks and its owner test) —
  Story 5.18's Create, 2026-09-24. ✅ `prd.md` FR-H4's indicator sentence · ✅ `epics.md` Story 5.18 ·
  ✅ `epic-5-context.md` · ⬜ built: `components/controls/sidebar.tsx`, `editor.tsx` — Story 5.18's Dev.


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

**R-142 — the persistence indicator is an ICON IN A CIRCLE, not a dot and a label.** The owner, 2026-09-19, on his
read of Story 5.8's Dev build: *"Instead of dot, keep the colors but with icons inside a circle. Use appropriate
Tabler Icons for different stages. Add title/labels so we can hover over it to know the status."*

- **What it replaces.** `B Missing Surfaces` B6 draws one 6px dot and one printed label per state, `prd.md` names the
  five labels as *the drawn ones*, and `EXPERIENCE.md`'s state table says *"one dot and one label, never a spinner"*.
  The states, their meanings and their hues all survive; what changes is that the STATE IS CARRIED BY A GLYPH and the
  words move to the `title` a hover shows and to the accessible name a screen reader reads.
- **It makes the accessibility floor STRONGER, not weaker, and that is measured rather than argued.** Against the
  bar's own paper, B6's four dots measure 1.62:1 (grey), 2.86:1 (coral), 2.75:1 (mint) and 4.85:1 (danger) — three of
  them under the 3:1 WCAG 2.1 asks of a graphic that carries meaning. They were legal only because the LABEL carried
  the meaning and the dot was decoration, so removing the label and keeping the dot — which is what was first asked
  for — would have been the one change that broke it. Worse, coral *"Syncing"* against mint *"Synced"* measures
  **1.04:1**: as near identical as two colours get, and it is the pair that separates "still sending" from "safe on
  the server". A distinct glyph per state makes colour and shape redundant with each other, which is what
  `EXPERIENCE.md`'s *"colour classifies; it never carries the only signal"* actually asks for — and every state keeps
  a text equivalent, on the hover and in a polite live region.
- **The fill is each hue's deeper `-text` value, not its bright one.** White on the bright fills measures 2.99:1 and
  3.11:1; on the `-text` values it measures 5.28–5.41:1, and the circle clears 4.85:1 against paper. The project has
  made exactly this move once before and for exactly this reason (`marigold-solid`, Story 1.5, ruled 2026-09-06).
- **The glyphs are Tabler, and this is R-130's second stated exception rather than a widening of R-26.** B6 draws a
  dot, so there is no export glyph to read for any of the five states, and the owner named the set — which is
  precisely R-130's shape. Their paths are NOT retyped: each is `packages/library/icons/tabler.json`'s own `outline`,
  emitted from that file, and `run-verify-editor.cjs` step 61 asserts each state's path data against that same file
  so two states can never silently come to share one glyph. `check` · `clock` · `arrow-up` · `exclamation-mark` ·
  `upload`.
- **B6's "never a spinner" is untouched.** Nothing animates, and Syncing is a STATIC arrow for that reason.
- **Where it lands.** `prd.md` §FR-D10's label paragraph · `EXPERIENCE.md`'s Persistence indicator row and its
  accessibility floor (which used the indicator as its own example) · `components/kit/persistence-indicator.tsx` ·
  `components/kit/icons.tsx`'s licence note · Story 5.8's spec.

**R-143 — the undo/redo pair sits beside the save state, not in S4a's right-hand cluster.** The owner, 2026-09-19:
*"Move the undo/redo buttons near the dot show them after the dot."*

- **What it replaces.** `S4 Editor.dc.html:41-43` draws the pair on the RIGHT, between the device track and Ship it.
  They now sit immediately after the persistence indicator, which is the bar's third item.
- **Why it is better than the frame, and the frame could not have known.** Undo and the save state answer the same
  question — *what has happened to my work* — so they belong to the same glance. The frame drew the bar before either
  had behaviour behind it.
- **Only the POSITION moves.** The buttons are still S4a's own: 28 × 28, 8px radius, 2px apart, the unavailable one at
  `opacity:.35`, `aria-disabled` and never `disabled`. R-141's keys still call the arrows' own handlers.
- **One consequence to carry forward.** Story 5.22 collapses the bar's RIGHT cluster into D8b's `⋯` below 1440. The
  pair will not collapse with it — which is right for undo, and means that story re-tunes the project name's
  truncation rather than the pair.

**R-144 — the resting indicator reports what is OWED: green when the server has it, grey when it does not.** The
owner, 2026-09-19: *"Keep the dot as green until user makes any edits. So it shows clear status that the status is
saved on server. And any new edits are being saved in browser."*

- **What it replaces.** B6 flashes *"Synced"* for four seconds after a save and then fades to *"Saved on this device"*
  for ever. So the resting appearance meant BOTH "saved here, not sent" and "everything is sent" — one appearance for
  two different truths — and the stronger of the two was visible for four seconds in every hour of editing.
- **It costs no new vocabulary.** Green is B6's own *"Synced"* and grey is its *"Saved on this device"*. What goes is
  the four-second fade, and with it the timer that drove it: the resting state is now DERIVED from the journal
  (`unsynced(journal)`), so it cannot drift from what is actually owed.
- **An undo is owed too.** Undoing a change the server already has makes the document differ from the server again,
  so the circle goes grey and the next flush sends it — which the old machine could not express at all.
- **One matrix row changed with it.** ⌘S with nothing owed used to flash *"Synced"* for four seconds to acknowledge
  the press; the indicator is now already the green check, so the press re-asserts it and sends nothing. There is
  still no request, which was always the rule.

