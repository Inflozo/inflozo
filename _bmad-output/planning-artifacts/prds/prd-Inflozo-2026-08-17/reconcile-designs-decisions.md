---
title: Inflozo — Ghost Build Room rulings on the design reconciliation
status: live (the merge acts on this file; tick each propagation as it lands)
created: 2026-08-27
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
2026-08-27, the same day as the session.** Tier 3 — the inventory merge — is what remains, and §A is
written to drive it.

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
| 🟡 | **`prd.md`, its companions, `sections-inventory.md`, the 34 specs** | **Tier 3 — the inventory merge. Begun 2026-08-27; the normative half has landed, the specs have not.** Per-ruling status in the table below |

### Tier 3, ruling by ruling

**Probe first (§E-1):** ✅ **run and landed.** `tools/probe/run-verify-47.py` against T1 and T3 →
`MEASUREMENTS.md` **§30**, register item **47 closed** and **52 added**, `appendix-b1 §5` corrected.
**The premise was wrong: there is no per-template `{{#get}}` budget.** Ghost races *each* get against
5000 ms on both majors and 150 gets on one template resolved in full, so **R-20's provisional cap of twelve was withdrawn by the owner on 2026-08-27 — no hard cap, the panel warns past 25. (Superseded text: the cap stood at twelve
on a latency budget** (≈ 10 ms per pick) rather than on an abort threshold. Item 47 anticipated only the
downward correction; the owner took the upward decision the same day — **no cap, warn past 25**.)

| Ruling | Normative documents | The 34 specs |
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
| **R-26** inline icons, Tabler | ✅ FR-F1, `Appendix C`, FR-Q7 | ⬜ |
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

**Still open in Tier 3, stated so it is not mistaken for done:**

- **The 34 category specs.** Not edited. Every ⬜ in the right-hand column above.
- **The per-category `Content:` / `Controls:` / `Data:` unions in `sections-inventory.md`.** The rosters
  are regenerated and gated; the three union lines under each heading are still the pre-merge ones and
  still carry pre-merge `#N` references. They were **not** machine-derived because the export declares
  fields in five different prose shapes and a union assembled by regex put `aria-live` and `required` in
  it — and a wrong `contentSchema` is worse than a stale one, since it is the storage contract
  park-and-restore runs on (FR-D17's preservation gate fails on a field with nowhere to live).
- **`research-section-js-libraries.md` §7's "Designs requiring it" and "Trigger in the inventory"
  columns.** Same reason: deriving them from the specs' Behaviour prose over-matched badly — every A1
  design picked up `accordion` and `mode-toggle` from sentences that merely *mention* them. The
  edit-safe column and the module list itself landed in Tier 2 and are correct; only the two design-list
  columns are stale.
- **R-2, R-10, R-12 and R-29's normative halves**, and the **FR that R-29 needs drafted (R11)**.

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
| 7 | A24/A26: `feature_image_caption` needs a second triple-stash carve-out — **after probe family 27** | AD-5(2), §7.3 mechanic 3 |
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
corpus). **Two reached him afterwards**, and both are ruled here.

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
  derived count.
- **Multi-module sections** — FR-G7(2) gains one sentence: **a design may declare N modules; the
  compiler emits the union and each `§7` line is restated** (A1, A4, A14, A15, A22). **R8 closes.**
- **Probe families** — 41 less families 2, 8, 9 and 31; family 1 reduced to its budget half.
- **`tools/tuple-check.py`** reads `derived-fields-A1-A12.md` (186 designs) and cannot see the native
  tuples that now outrank them. Extend it to read the specs or the merged inventory — `doc-audit.py`
  currently runs the old one.

---

## E · Execution list — what still needs a `/bmad-build` probe run

Run against **T1** and **T3** (`tools/probe/.env`, pattern `tools/probe/run-verify-all.py`) **before
the inventory merge**. Results land in `MEASUREMENTS.md`, `VERIFY-AT-BUILD.md` and the companion each
row names. The full per-category probe text stays in `reconcile-designs.md` §(a).

**Newly blocking on a ruling above:**

| # | Claim | Fixes |
|---|---|---|
| E-1 | The per-template `{{#get}}` abort threshold (`appendix-b1 §5`); time 12–24 single-id gets on one template | **R-20's cap** — the only number in this file left unmeasured |
| E-2 | `feature_image_caption`'s stored shape (HTML?), `{{…}}` vs `{{{…}}}`, gscan on the triple-stash | **R-10 #7** — a second AD-5(2) carve-out, or neither A24 nor A26 renders captions |
| E-3 | `@member` prefill and `@member.email` under `cacheMembersContent` (family 18) | **R-28** — confirmatory only; the safe shape is already taken |
| E-4 | `<details name>` under `stylelint-plugin-use-baseline` at the pin (family 38) | **R-15** — the Tier-2 entry's wording |

**Unchanged and still open:** families 3–7, 10–30, 32–37, 39–41 as written in `reconcile-designs.md`,
with families **2, 8, 9 and 31 struck** and family **1** reduced to E-1. Families 38–41 are not Ghost
probes (Baseline tooling, browsers and AT, font files, the app's own keys) and stay listed so they
are not lost.

---

## F · What this session did not reach

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
