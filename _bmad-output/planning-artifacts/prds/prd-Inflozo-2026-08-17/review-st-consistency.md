---
title: Inflozo PRD v2.3 — Cross-File Consistency Audit
scope: prd.md · sections-inventory.md · addendum.md
method: mechanical (scripted extraction + diff), no eyeballing
date: 2026-08-18
---

# Cross-File Consistency Audit — prd.md v2.3 / sections-inventory.md / addendum.md

## Verdict

**PASS with defects — no arithmetic or identifier faults.** The two axes most likely to
break a downstream build survived both hardening passes intact:

- **Section-count arithmetic is exact and self-consistent at every level.** `sections-inventory.md`
  enumerates precisely 487 numbered variants across 34 categories with no gaps in any category's
  1..n sequence; every category's declared header count equals its actual entry count; the PRD's
  Appendix A table matches the inventory row-for-row on ID, name, count, and group; the five group
  sums (47 / 199 / 109 / 104 / 28) total 487; and the §8 wave counts (E9 156 = 47+109,
  E10 199, E11 132 = 104+28) sum to 487 and match exactly the Appendix A groups their prose names.
  68 [Free] variants = 34 categories × 2, matching G5, FR-G2, Appendix A's summary line, and
  Appendix F's `(68)`.
- **ID continuity is perfect.** 116 FR IDs defined (FR-A1..A6, B1..B7, C1..C8, D1..D18, E1..E5,
  F1..F7, G1..G6, H1..H6, I1..I5, J1..J15, K1..K6, L1..L5, M1..M4, N1..N5, O1..O4, P1..P3, Q1..Q6):
  zero duplicates, zero gaps within any letter group, and **every FR ID referenced anywhere in the
  three files resolves to a definition** — including the range/slash forms `FR-J12–J15`, `FR-E1/E4`,
  `FR-J3/J4`. Same for G1–G10, P1–P8, NFR-1..9, T1–T4, E1–E15, AD1–AD3, and every `A17 #1` /
  `A32 #2` / `Appendix A §34` style pointer (all 19 explicit variant-ID citations in the Synthesis
  Defaults and Appendix E resolve to the correct variant *name* in the inventory).
- **Numeric coherence is clean.** Every figure stated in more than one place agrees.
- **The v2.0 version pin was genuinely dropped** from `sections-inventory.md`; no file claims to
  describe an older PRD version.
- **No "primary feed" survivors.** The rename to "main feed" is complete.

What remains is **1 high, 5 medium, 14 low**. The high finding is a genuine hole rather than a
mismatch: an inventoried, normative launch deliverable (A31 #10 Private Site Gate) has no surface
anywhere in the three files on which it can be designed, which makes FR-I1's `private.hbs` branch
and §7.4's `private.hbs` row unreachable. The mediums are all classic hardening residue —
statements that were correct before a v2.2/v2.3 edit narrowed or moved their target.

---

## Axis 1 — Section count arithmetic

**Result: CLEAN. Zero defects.**

Verified mechanically (per-category header count vs. actual numbered entries vs. PRD table vs.
group sums vs. epic wave counts):

| Check | Expected | Actual | Verdict |
|---|---|---|---|
| Categories enumerated in `sections-inventory.md` | 34 | 34 | ✓ |
| Variants enumerated (numbered entries) | 487 | 487 | ✓ |
| Per-category declared count == actual entries | 34/34 | 34/34 | ✓ |
| Per-category numbering gap-free (1..n) | 34/34 | 34/34 | ✓ |
| `[Free]` markers, positions #1 and #2 only | 68 | 68 | ✓ |
| PRD Appendix A table (prd.md:419–453) vs inventory: ID / name / count / group | identical | identical | ✓ |
| PRD table total row (prd.md:453 `**487**`) | 487 | 487 | ✓ |
| Group sums: Structure&Chrome / Marketing / GhostContent / Template-Specific / GhostNative | — | 47 / 199 / 109 / 104 / 28 | ✓ sum 487 |
| E9 "Library Wave 1 (156)" = Structure&Chrome + Ghost Content | 47+109 | 156 | ✓ |
| E10 "Library Wave 2 (199)" = Marketing (A4–A16) | 199 | 199 | ✓ |
| E11 "Library Wave 3 (132)" = Template-Specific + Ghost Native | 104+28 | 132 | ✓ |
| Wave total | 487 | 156+199+132 = 487 | ✓ |

E9's prose parenthetical ("headers, bars, footers" + "grids, lists, featured, tags, authors,
newsletter, search") names exactly A1–A3 and A17–A23 — 3 + 7 = 10 categories, the exact membership
of the two groups it sums. E10's "(A4–A16, Heroes through Contact)" matches A4 Heroes and
A16 Contact. E11's "+ members" is redundant (A30 already sits inside Template-Specific) but not
wrong.

All 14 occurrences of `487`, all 6 of `34`, and both of `68` across the three files were extracted
and compared; every one agrees.

---

## Axis 2 — ID continuity

**Result: CLEAN. Zero defects.**

- **FR IDs:** 116 defined, 0 duplicate definitions, 0 gaps. Full extraction of every
  `\bFR-[A-Z]\d+\b` token across all three files produced **zero references to an undefined ID**
  and **zero defined IDs that are never referenced**.
- **Goals G1–G10:** contiguous, all defined in the §1.3 table; G6 (3 refs), G8/G10 (2 refs each)
  resolve.
- **Principles P1–P8:** contiguous; every in-text `P<n>` citation (P1×2, P2×5, P3×3, P4×4 incl.
  `sections-inventory.md:685`, P5×5) lands on a defined principle. No P9+ referenced.
- **NFR-1..NFR-9:** contiguous; all 9 defined, all referenced IDs resolve.
- **Deploy targets T1–T4:** all defined at prd.md:89–92; `T1–T3` (deployable) and `T4`
  (Starter-block path) used consistently; "all four §4 targets" (FR-J13, §7.6 item 4) matches the
  four defined.
- **Epics E1–E15:** contiguous, all defined at prd.md:381–409; "Epics 9–11" (prd.md:364) resolves
  to the three library waves.
- **Addendum anchors AD1–AD3:** all three headings exist; all 9 citations (`§AD1`, `§AD2`, `(AD1)`,
  `AD3's`) resolve.
- **Appendix section IDs:** `Appendix A §31` (×2), `§33`, `§34` (×2) all resolve to the correct
  inventory categories. All 19 `A<n> #<m>` variant citations verified against the inventory by name:

  Synthesis Defaults — A1#1 Classic Left, A3#1 Minimal Single Row, A33#1 Editorial, A17#1 Classic
  Cards, A34#1 Numbered Classic, A24#1 Classic Center, A25#1 Narrow Classic, A32#1 Fade + Card,
  A26#1 Author Bio Card, A27#1 Trio Cards, A28#2 Minimal Thread, A29#1 Tag Banner, A29#2 Author
  Split, A31#1 404 Minimal Type — **all 14 exact**.
  Appendix E — Quiet: A4#1 Center Stage, A18#1 Editorial Rules, A25#1 Narrow Classic, A26#1 Author
  Bio Card; Ledger: A4#2 Split Editorial, A17#1 Classic Cards, A10#1 Big Number Row, A32#2 Hard
  Stop Card — **all 8 exact, and all are #1/#2, i.e. genuinely [Free]**, so FR-O4's "all [Free]"
  claim holds.

---

## Axis 3 — Dangling cross-references

**Result: 1 high, 2 medium, 4 low.** Every `see §X` / `per FR-Y` / `Appendix Z` / `AD-n` pointer
was extracted and resolved; **no pointer targets a non-existent anchor**. The defects below are
pointers whose *target no longer says what the referring text implies*.

### HIGH-1 — `private.hbs` has no design surface anywhere in the three files

Three normative statements assume the user can *design* a Private Site Gate, and no requirement
provides the canvas on which to do it.

- `prd.md:196` (FR-I1): *"`private.hbs` follows the same conditional pattern: it compiles only when
  a Private Site Gate section (Appendix A §31) is designed."*
- `prd.md:329` (§7.4): *"`private.hbs`           # only if a Private Site Gate section is designed
  (FR-I1, Appendix A §31)"*
- `sections-inventory.md:547` (A31): *"(Compile targets: 404/500 → error.hbs variants; Private Site
  Gate → private.hbs; …)"*
- `sections-inventory.md:557`: *"10. **Private Site Gate** — styled password-access page."*
- `sections-inventory.md:607`: *"**NEVER synthesized:** … `private.hbs` … These exist only when the
  user designs them."*

But the only two surfaces that create designable canvases exclude it:

- `prd.md:144` (FR-D6) template switcher: *"Home, Post, Page, Tag archive, Author archive, Members
  (Signup / Signin / Account), 404, plus any custom templates created in the Routes Manager (FR-I)."*
  — **no Private entry.**
- `prd.md:198` (FR-I3): Routes-Manager-created templates compile as `custom-{name}.hbs`, not
  `private.hbs`.

**Downstream impact:** an agent implementing FR-D6 builds a switcher with no Private canvas;
`private.hbs` is then never emitted, A31 #10 is placeable only on a wrong template, and FR-G1's
*"every listed variant is a launch deliverable"* is violated by a variant that is structurally
undeliverable. Also blocks E11's exit gate for A31 and NFR-6's render matrix for that variant.

**Should be:** FR-D6's switcher list gains a conditional **Private** canvas (appearing when a
Private Site Gate is placed, mirroring how members templates appear), or FR-I1/A31 drop the
`private.hbs` branch and route A31 #10 to a custom template like Coming Soon/Maintenance.

### MED-1 — FR-D6 asserts unqualified synthesis; the companion it points at excludes three of FR-D6's own switcher entries

`prd.md:144` (FR-D6): *"Templates the user hasn't touched compile from the normative **Synthesis
Defaults** (`sections-inventory.md` § Synthesis Defaults …)"* — stated of *templates* generally,
in the same sentence whose switcher list includes **Members (Signup / Signin / Account)**.

`sections-inventory.md:607` narrows it: *"**NEVER synthesized:** `members/signup.hbs` /
`signin.hbs` / `account.hbs` (Portal serves untouched flows — FR-I1), `private.hbs`,
`custom-{name}.hbs`, `home.hbs` …"*

**Downstream impact:** a literal reading of FR-D6 synthesizes members templates for every project.
That emits `members/*.hbs`, which per FR-I1 *"automatically adds its route … to `routes.yaml`"*,
which per FR-I4 forces the manual Ghost Admin → Labs step on **every first deploy** — directly
breaking FR-O1's *"a starter's first deploy never requires the manual routes step (FR-I4) — the
confetti moment stays uninterrupted"* and FR-I5's *"no routes.yaml surprises"*.

**Should be:** FR-D6 reads *"Templates the user hasn't touched — within the synthesizable set
defined in `sections-inventory.md` § Synthesis Defaults §1 — compile from …"*, or names the
exclusion inline (members, private, custom).

### MED-2 — The companion generalizes an FR-I1 rule that FR-I1 scopes to members templates only

`sections-inventory.md:604`: *"**Untouched** = the template has no `project_templates` doc (or its
doc has zero sections after FR-I1's \"removed everything\" rule)."*

`prd.md:196` (FR-I1) states that rule for exactly one class of template: *"Removing every section
from a designed **members** template returns it to untouched: its file and auto-added route are not
emitted on the next compile."*

The companion applies it to `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`,
`error.hbs` — where the consequence is the *opposite* of FR-I1's (there, emptying suppresses the
file; here, emptying resurrects the full default stack, so an intentionally empty Home is
impossible). The PRD states this nowhere.

**Should be:** FR-I1 (or FR-D6) states the general rule — "emptying any template returns it to
untouched; standard templates then re-synthesize, conditional templates stop emitting" — so the
companion's citation is accurate.

### LOW-1 — `sections-inventory.md:607` uses a bare `§7.4` to point into `prd.md`

*"…`home.hbs` (not emitted at all; Home compiles to `index.hbs` per §7.4)"*. Every other cross-file
pointer is file-qualified (cf. prd.md:144's *"`sections-inventory.md` § Synthesis Defaults"*).
**Should be:** *"per `prd.md` §7.4"*.

### LOW-2 — FR-J13's "all four §4 targets" acceptance criterion is partly unreachable on T4

`prd.md:233`: *"verifying it per Ghost version/host on all four §4 targets is an acceptance
criterion"*. But `prd.md:94`: *"**Deployable targets are T1–T3.** T4 exists to verify the Starter
block path (FR-C2)"*, and the snapshot triggers *"at Inflozo's first theme upload to a site"* —
which T4 rejects by definition. **Should be:** scope the criterion to T1–T3, or state explicitly
that on T4 only the download endpoint (not the snapshot flow) is probed.

### LOW-3 — Synthesis Defaults §1 leaves switcher-open behavior undefined for the non-synthesizable set

`sections-inventory.md:605`: *"Opening an untouched template in the switcher renders this same
default stack as the starting canvas; the first edit materializes the stack…"* — defined only for
the six synthesizable templates. FR-D6's switcher also opens Members canvases, which have no
default stack. **Should be:** one line — non-synthesizable canvases open empty.

### LOW-4 — §7.5 data-model sketch omits entities the FRs and addendum name

`prd.md:342–351` lists 8 tables. Not present: the lock record (`addendum.md:23` *"**Lock record**
per project (holder session id, heartbeat timestamp) in Postgres"*), notifications (FR-B7, with a
stated 90-day retention and an FR-A5 delete cascade over "notification rows"), `entitlements`
(FR-L2 names it in backticks; §7.5 has only `subscriptions`), theme-settings / custom-settings
definitions (FR-Q1/Q2), and the per-site snapshot record (FR-J13). The heading says "sketch", so
this is informational, but FR-A5's cascade and FR-B7's retention are testable requirements against
tables that do not appear.

---

## Axis 4 — Terminology drift

**Result: 2 medium, 5 low.** The named checks came back mostly clean:

| Term under audit | Result |
|---|---|
| "main feed" (renamed from "primary") | **CLEAN.** 11 uses, all "main feed"/"main-feed"/"designated main feed". Every one of the 12 occurrences of "primary" across all three files is an unrelated sense (primary CTA, primary tag, primary author, primary persona, primary control, magic link is primary). Glossary row present (prd.md:580). |
| "last-offered" routes state | **CLEAN** — single-use, no competing survivor. `prd.md:199`: *"Inflozo tracks the last routes.yaml **offered** per site"*. No "last uploaded"/"last deployed routes" anywhere. Not in the glossary, but it is used exactly once. |
| "library" vs "section library" | **CLEAN.** "Asset Library" is always capitalized and qualified (6 uses); bare "library" always means the section library and is never adjacent to an asset-quota sentence in a way that could confuse. |
| "variant" vs "section" | Mostly clean; see LOW-6. |
| "Test/Live infra" | **MED-4** below. |
| "snapshot" vs "pre-Inflozo snapshot" | **MED-3** and LOW-7 below. |
| "Style Pack" vs "pack" | **CLEAN.** 18 bare-"pack" uses, all inside FR-E / Appendix D / Appendix E where the antecedent is unambiguous. Not a defect. |

### MED-3 — One artifact, two names; the surviving heading encodes the superseded trigger

The pre-Inflozo theme archive is called two things:

- **"Pre-activation snapshot"** — `prd.md:233` (FR-J13's own bolded heading:
  *"**Pre-activation snapshot (\"safe installs\")**"*), `prd.md:67` (P8: *"the pre-activation
  snapshot (FR-J13)"*), `prd.md:393` (E7 scope list).
- **"Pre-Inflozo snapshot"** — `prd.md:120` (FR-B3), `:133` (FR-C6), `:135` (FR-C8), `:250` (FR-L3),
  and the glossary at `prd.md:583`: *"| Pre-Inflozo snapshot | The archived previously-active theme,
  captured before Inflozo's first **upload** to a site | FR-J13 |"*.

Worse than the split: the surviving heading is *semantically stale*. The memlog's triage P4 moved
the capture point from activation to upload, and FR-J13's own body encodes the new rule —
*"at Inflozo's first theme **upload** to a site (deploy-only included — manual activation in Ghost
Admin must not bypass the safety net)"* — so the heading "**Pre-activation** snapshot" now names
precisely the trigger the hardening pass rejected.

**Downstream impact:** an agent skimming headings and P8's summary line implements capture at
activate-time, which silently reopens the deploy-only bypass FR-J13 exists to close.

**Should be:** rename FR-J13's heading, P8, and E7 to **"pre-Inflozo snapshot"** (the glossary's
canonical term), or to "first-upload snapshot".

### MED-4 — §4 overloads "Live" for two opposed concepts, and neither environment is in the glossary

- `prd.md:88`: *"**Live-infrastructure testing (owner mandate — must-have).** Until go-live and the
  first customer, all testing runs on the real production infrastructure…"*
- `prd.md:99`: *"**Post-launch topology (Test vs Live):** … a fresh infrastructure set is
  provisioned as **Live** … the existing pre-launch stack — including Ghost targets T1–T4 — becomes
  the permanent **Test** environment … From the first customer onward, all testing … runs
  exclusively against Test"*

The stack that line 88 calls "live infrastructure" is exactly the stack line 99 renames **Test**,
while **Live** becomes a set that testing must never touch. Two further senses of the same word are
in play: "live Ghost deploy targets" (12 uses in §4/§8/NFR-6) and the deploy status chip
*"Live vX"* (FR-B1) / progress step *"→ Live"* (FR-J8). Appendix I has **no row for Test
environment or Live environment**, and the "Defined in" chain for the topology is a §4 bullet.

**Downstream impact:** the CI/E2E configuration is the single place this matters most, and NFR-6(d)
resolves it only by a parenthetical — *"(pre-launch: production, per §4's mandate; post-launch: the
Test environment, §4)"*. A reader who takes line 88 at face value post-launch points the E2E suite
at customer data.

**Should be:** add two glossary rows (**Test environment**, **Live environment**), and rename
line 88's label to "Production-infrastructure testing (pre-launch)" so the word "Live" is reserved
for the post-launch set.

### LOW-5 — Two different pack tokens share the identical value scale, and FR-E1 disambiguates only one of them

`prd.md:160` (FR-E1): *"spacing density (Compact/Comfortable/**Airy** — a pack-level token, distinct
from the per-section Vertical spacing scale Compact/Comfortable/Spacious), **site width
(Narrow/Normal/Wide) + gutters (Compact/Comfortable/Spacious)**"*.

The parenthetical carefully separates *density* from *per-section vertical spacing* — then the very
next clause gives **gutters** the same three labels as the per-section scale
(`sections-inventory.md:10`: *"Vertical spacing (Compact/Comfortable/Spacious)"*), with no
disambiguating note. **Should be:** give gutters its own scale (e.g. Tight/Normal/Wide, matching
the Galleries `gap` control at `sections-inventory.md:257`) or add the same "distinct from" note.

### LOW-6 — Appendix H's canonical string counts variants as "sections"

`prd.md:568`: *"empty dashboard **\"Every great site starts somewhere. Yours starts with 487
gorgeous sections.\"**"*. Appendix H is normative and its strings are "reused verbatim", but 487 is
the **variant** count (34 sections/categories). Glossary `prd.md:576` distinguishes the two.
Cosmetic in a user-facing string; flagged because Appendix H is normative and this is the only
place the two units are conflated in a reused literal.

### LOW-7 — "snapshot" carries two normative senses; the glossary defines only one

Sense A (theme archive): FR-J13 and callers. Sense B (the synced project document): `prd.md:147`
*"the authoritative cloud snapshot"*, `:148` *"the cloud snapshot is authoritative"*, `:156`
*"refreshes to the last synced snapshot"*, `addendum.md:16` *"the current doc jsonb snapshot
upserts to `project_templates`"*, `:25` *"hydrates from the fresh server snapshot"*. Every
individual use is qualified ("cloud", "synced", "server", "pre-Inflozo"), so no single sentence is
ambiguous — but Appendix I defines only sense A, and the two senses appear within nine lines of
each other (FR-D9/D10 vs. FR-J13's callers). **Should be:** add a glossary row for **cloud
snapshot**.

### LOW-8 — Universal-control names live only in the companion; one capitalization split

`sections-inventory.md:10` defines three per-section universal controls — *"Background role (Swatch
Row: Base/Surface/Accent/Contrast/Image), Vertical spacing (Compact/Comfortable/Spacious), Top
divider (None/Line/Fade)"*. The phrase "universal control" appears **zero** times in `prd.md`, and
"Top divider" appears zero times. FR-F3's *"Hard cap ≈ 15 visible controls per section"* therefore
has an unstated +3 baseline. Additionally FR-D7 writes the named control in lowercase —
`prd.md:145`: *"Mode-scoped controls (background role, per-mode image swaps…)"* vs. the companion's
"Background role". **Should be:** FR-F3 names the three universal controls and their exemption (or
inclusion) in the ≈15 cap.

### LOW-9 — FR-D16's member-state preview omits a state Appendix B defines

`prd.md:154` (FR-D16): *"view canvas as Anonymous / Free member / Paid member"*. `prd.md:468`
(Appendix B): *"**`@member`** … { name, email, status: free/paid/**comped**, paid flag }"*. Sections
that branch on `status` (A22, A30, A32) have no preview for `comped`. **Should be:** either add the
state or state that comped previews as paid.

---

## Axis 5 — Version and status coherence

**Result: CLEAN on the substantive checks; 1 low.**

| File | Frontmatter | Verdict |
|---|---|---|
| `prd.md` | `version: "2.3"` · `status: final` · `created: 2026-08-17` · `updated: 2026-08-18` | ✓ |
| `sections-inventory.md` | `status: normative companion to prd.md (same folder; no version pin — the PRD frontmatter carries the version)` | ✓ **pin confirmed dropped** |
| `addendum.md` | `purpose: … Not normative for scope; normative for intent when the architect designs these areas.` | see LOW-10 |

- **The v2.0 pin is gone.** A full scan for `v?2\.[0-3]` across all three files returns only
  `prd.md:3`'s own `version: "2.3"`. No file anywhere claims to describe an earlier PRD version.
- No stale dates: the only date tokens outside prd.md's frontmatter are `2026` in FR-A2's
  *"(as of May 2026…)"*, FR-C2's *"Ghost's 2026 lineup"*, and §7.6's verify-list — all deliberate
  external-fact stamps, all consistent with the memlog's research events.

### LOW-10 — `addendum.md` is not enrolled in the normative set it is cited as governing

`prd.md:11` enumerates the authoritative surface: *"This PRD is the single source of truth.
Appendices A–I are normative … (Appendix A's full inventory lives in `sections-inventory.md`, same
folder)."* — `addendum.md` is **not named**. `addendum.md:3` in turn self-declares *"Not normative
for scope"*. Yet three requirements cite it as the mechanism of record: FR-D10 *"(Mechanism:
`addendum.md` §AD1.)"*, FR-D18 *"(Mechanism: `addendum.md` §AD2.)"*, and FR-D9 *"(AD1)"* — and
FR-D10 additionally binds to it normatively: *"AD3's rejection of per-change sync applies to the
default path only."* Neither companion file carries an `updated` date, so a reader cannot tell
whether either kept pace with prd.md's 2026-08-18 bump. **Should be:** name `addendum.md` in the
prd.md:11 preamble with its intended force, and add `updated:` to both companions.

---

## Axis 6 — Numeric and limit coherence

**Result: CLEAN. Zero defects.** Every number stated in more than one place was extracted and
compared pairwise.

| Quantity | Locations | Values | Verdict |
|---|---|---|---|
| Ghost custom-settings cap | P3 (`:62`), FR-Q2 (`:205`), Appendix B (`:471`) | 20 / 20 / 20 | ✓ |
| Reserved dark slots | FR-Q2 (`:205`) "3 slots and their keys are reserved", FR-Q5 (`:208`) "three built-in custom settings" | 3 / 3 | ✓ |
| User-definable slots | FR-Q2 "cap at 17", FR-Q5 "leaving 17 slots" | 17 / 17 | ✓ 17+3=20 |
| Reserved unconditionally (incl. Light-only) | FR-Q2, FR-Q5, FR-D7 (`:145`) | consistent | ✓ |
| Ghost setting types | FR-Q2 "Ghost's exact five", FR-Q3 (5 mappings), Appendix B "5 setting types" | 5 / 5 / 5 | ✓ |
| Projects Free/Pro | FR-B4 (`:121`), §3 persona (`:79`), Appendix F (`:532`) | 1/25 · 25 · 1/25 | ✓ |
| Site connections Free/Pro | FR-C5 (`:132`), §3 (`:79`), Appendix F (`:533`) | 1/10 · 10 · 1/10 | ✓ |
| Asset storage | FR-K3 (`:241`), Appendix F (`:535`) | 100 MB / 5 GB (both) | ✓ |
| Per-upload cap | FR-K2 (`:240`), Appendix F (`:536`) | 10 MB (both, both columns) | ✓ |
| Deploy history retention | FR-J7 (`:221`), FR-L3 (`:250`), Appendix F (`:537`) | Pro 10 / Free 3 (all three) | ✓ |
| Free library at exits | Appendix A summary (`:415`), Appendix F (`:534`) | 68 / 68 | ✓ |
| Pricing | G7 (`:35`), FR-L1 (`:248`), E12 (`:403`), Appendix F (`:530`, `:542`) | $15/mo · $150/yr throughout | ✓ |
| Break-even | G7 "~8–9 Pro subscribers", Appendix F "≈ 8–9 Pro subscribers" | ✓ |
| G1 / G2 targets | `:29` <10 min p75 · `:30` <15 min p75 | no competing timing anywhere | ✓ |
| Interaction budget | G6 (`:34`) 60fps/<100 ms, NFR-1 (`:286`) 60 fps/<100 ms, FR-F4 (`:171`) "within G6's 100 ms budget", E5 (`:389`) 60 fps | one budget, no competitors | ✓ |
| Pack switch | FR-E2 (`:161`) ≤300 ms, E6 (`:391`) <300 ms | ✓ |
| Style Packs | FR-E2 "12 curated presets", G4 "the 12 preset packs", E6 "12 presets", Appendix D header "(12 presets…)" **and 12 table rows** | ✓ |
| Starters | FR-O1 "10 starters", Appendix E header "(10)" **and 10 numbered entries**, §4 DoD "10 starter templates" | ✓ |
| Free-only starters | FR-O4 "Quiet and Ledger", Appendix E #5 Quiet / #9 Ledger | ✓ |
| `posts_per_page` | FR-Q1 (`:204`) default 12, `sections-inventory.md:676` "(FR-Q1, default 12)" | ✓ |
| Shuffle sibling ceiling | §1.4 "(up to 18)" vs max category size (A4=18, A17=18) | ✓ |
| Undo depth | FR-D9 "100-step", AD1 "last 100 ops" | ✓ |
| Cloud sync interval | FR-D10 "every 3 minutes", AD1 "(default 3, user-toggleable)" | ✓ |
| Stress fixture | FR-D14, NFR-1 | 40-section (both) | ✓ |
| Font pool | FR-E1, FR-J3, Appendix D | ~30 pairings (all three) | ✓ |
| Viewports / breakpoints | FR-D8 (390/834), FR-G4 (390→1440+), FR-G6 & NFR-6 (3 viewports) | ✓ |
| Lighthouse | G4 (≥90 perf / ≥95 a11y), NFR-2 (≥90 / ≥95) | ✓ |
| gscan target | G3, FR-J6 "0 errors, 0 warnings", NFR-6(b) "gscan 0/0", E11 "0/0" | ✓ |
| Upgrade prompt moments | FR-L5 "exactly four moments" + 4 enumerated | ✓ (memlog's earlier "five" fully retired) |
| Transactional emails | FR-P1 "Exactly five" + 5 enumerated + FR-P3's 2 relays | ✓ |
| Control vocabulary | FR-F1 core set = 11 types; Appendix C table = 11 rows | ✓ (Date Picker present in both) |
| Fixed infra | Appendix F: $45 core + $60–80 test = "$105–125" | ✓ arithmetic holds |

---

## Axis 7 — Deferral coherence

**Result: CLEAN on the substantive checks; 1 low.**

Appendix G (`prd.md:546–564`) carries 17 bullets. Each was checked in both directions.

**Nothing in the PRD still calls "deferred" something Appendix G no longer defers.** A full scan of
`defer*` produces exactly two in-body uses, both correct: FR-J4's *"Vanilla JS, no framework,
deferred"* (script loading, unrelated) and FR-Q5's *"Other pack tokens have no dark built-in
counterpart and are not promotable (deferred: Appendix G)"* — which matches Appendix G's
*"promotion of non-accent color tokens to Ghost Admin (v1 is accent-only — FR-Q5…)"*.

**The i18n narrowing to RTL-only is correctly encoded.** `prd.md:564`: *"RTL layout (v1 generated
themes are LTR). Translation itself ships in v1: section copy is user-authored via text props (any
language), and chrome strings are user-overridable via the Translations module (FR-Q6 — `{{t}}` +
`locales/`)."* No residual "locales deferred" / "i18n deferred" text survives anywhere; FR-Q6,
FR-H5's `{{t}}` shim, FR-J5's *"all chrome strings emit via `{{t}}`"*, §7.4's `locales/` row, and
the Appendix I "Chrome strings" glossary entry are mutually consistent.

**No FR delivers something Appendix G still defers.** Checked one by one:

| Appendix G bullet | Delivering FR? | Verdict |
|---|---|---|
| Shareable preview links | none | ✓ |
| custom font uploads | FR-E1/FR-J3 restrict to the curated pool; FR-K1 asset types are Image/SVG/Logo | ✓ |
| team seats/collaboration | FR-D18 enforces single active editor | ✓ |
| in-app compiled-code viewer | FR-J12 export only; FR-L3 blocks "any surface exposing compiled theme code" | ✓ (see LOW-11) |
| account-level custom Style Pack library | FR-E3: *"there is no account-level custom pack library in v1"* | ✓ |
| AI copy or layout suggestions | FR-C7 / FR-D17 are combinatorial re-rolls, never AI | ✓ |
| theme export marketplace | none | ✓ |
| per-breakpoint editing | FR-D8: *"there is no per-breakpoint editing"* | ✓ |
| nested/columns free-form layout | §1.4 *"strict vertical-stack model"*; FR-D14 | ✓ |
| comments on suggestions | FR-M2: *"No comments in v1"* | ✓ |
| app dark theme | FR-D7 is site-authoring only | ✓ |
| ActivityPub/social-web section group | no such category in the 34 | ✓ |
| brand extraction from arbitrary URLs | FR-C4 reads the connected Ghost site only | ✓ |
| public deploy quality badges/reports | none; AD3 records the rejection | ✓ |
| live-site theme preview UX | FR-J8 ships deploy-without-activate with no preview surfacing; AD3 concurs | ✓ |
| promotion of non-accent color tokens | FR-Q3/Q5 accent-only in v1 | ✓ |
| RTL layout | FR-Q6 ships translation, not direction | ✓ |

### LOW-11 — "Any surface exposing compiled theme code" vs. the Routes Manager's YAML pane

`prd.md:250` (FR-L3): *"deploy, ZIP export, and any surface exposing compiled theme code all block
for a project containing Pro sections"*. `prd.md:197` (FR-I2) ships *"a live YAML preview pane"*,
and FR-I4 ships a routes.yaml **download button** — and routes.yaml is compiled output that
*"is included in the theme zip"*. Meanwhile Appendix F (`:540`) grants Routes to Free
unconditionally: *"| Dark mode authoring · Routes · Style Pack editing | ✓ | ✓ |"*.
Whether the YAML pane and its download are an "exit" is undefined. It contains no section markup,
so the practical risk is low, but the two statements point opposite ways and an implementer must
guess. **Should be:** FR-L3 states that routes.yaml (containing no section code) is exempt.

---

## Additional observation (informational, not counted)

### LOW-12 — 16 of the 487 are not placeable sections, and no FR carves them out

A33 Koenig Card Treatments (6) is *"Site-wide `cards.css` styling … One treatment active per
project (Style group of Post Content Layout)"* and A34 Pagination Styles (10) are *"Designs behind
the feed Pagination control (FR-H2)"*. Neither is placed on a canvas, yet both count toward 487 and
therefore fall inside every requirement that quantifies over "every variant": FR-D12's Section
Picker rail, FR-D13's Variant Shuffle, FR-G5's uniqueness bar, FR-G6/NFR-6(a)'s render matrix
(*"every section variant × 3 reference Style Packs × light/dark × 3 viewports"*), and E14's exit
*"gallery renders all 487 variants"*. Each needs a host context that no requirement specifies.
This predates the hardening passes and is a modelling wrinkle rather than drift, but it will
surface as an ambiguity the moment E9/E11 and E14 are planned.

---

## Severity-ranked summary

**Totals: 1 high · 5 medium · 14 low = 20 defects.** Axes 1, 2, 5 (pin), 6 and 7 (deferral
direction) are defect-free.

| # | Sev | Axis | File:line | One-line |
|---|---|---|---|---|
| HIGH-1 | **High** | 3 | prd.md:144 vs :196 / :329 / inv:547, 557, 607 | `private.hbs` has no design surface: FR-D6's switcher omits Private, so A31 #10 — a normative launch deliverable — is unbuildable and FR-I1/§7.4's `private.hbs` branch is unreachable. |
| MED-1 | Med | 3 | prd.md:144 vs inv:607 | FR-D6 says untouched templates synthesize, unqualified, in the same sentence that lists Members in the switcher; the companion excludes members/private/custom. Literal build emits members templates + auto-routes on every project, breaking FR-O1/FR-I4/FR-I5. |
| MED-2 | Med | 3 | inv:604 vs prd.md:196 | Companion cites "FR-I1's 'removed everything' rule" as general; FR-I1 states it only for members templates, and the generalization inverts its effect for standard templates. |
| MED-3 | Med | 4 | prd.md:233, :67, :393 vs :120, :133, :135, :250, :583 | "Pre-activation snapshot" vs "Pre-Inflozo snapshot" — one artifact, two names; the surviving heading names the activation-time trigger that FR-J13's own body and the glossary replaced with "first upload". |
| MED-4 | Med | 4 | prd.md:88 vs :99 | "Live" names both the pre-launch test stack ("Live-infrastructure testing") and the post-launch production set (**Live**) — the former becomes **Test**. Neither environment has a glossary row. |
| MED-5 | Med | 3 | prd.md:156 vs addendum.md:26–27 | FR-D18 calls the heartbeat field the *"unsynced-edit count"*; AD2 calls the same field the *"unsynced-op count"* — while both prescribe the identical user-visible string *"That session had 14 unsaved edits"*. One unit must win. |
| LOW-1 | Low | 3 | inv:607 | Bare `§7.4` pointing into prd.md; every other cross-file pointer is file-qualified. |
| LOW-2 | Low | 3 | prd.md:233 vs :94 | FR-J13 requires theme-download verification "on all four §4 targets"; T4 is Preview-only and can never take the first upload that triggers a snapshot. |
| LOW-3 | Low | 3 | inv:605 | Switcher-open behavior defined only for the six synthesizable templates; Members/Private/custom canvases undefined. |
| LOW-4 | Low | 3 | prd.md:342–351 | §7.5 sketch omits lock record (AD2), notifications (FR-B7 + FR-A5 cascade), `entitlements` (FR-L2), theme-settings, snapshot record. |
| LOW-5 | Low | 4 | prd.md:160 vs inv:10 | Pack **gutters** reuse Compact/Comfortable/Spacious verbatim from the per-section Vertical spacing scale; FR-E1 disambiguates only the *density* scale (Airy). |
| LOW-6 | Low | 4 | prd.md:568 | Appendix H's verbatim-reuse string says "487 gorgeous **sections**"; 487 is the variant count. |
| LOW-7 | Low | 4 | prd.md:147, :148, :156, addendum.md:16, :25 | "snapshot" carries a second normative sense (the synced project doc) with no glossary row; Appendix I defines only the theme archive. |
| LOW-8 | Low | 4 | inv:10 vs prd.md (absent), prd.md:145 | "Universal controls" / "Top divider" exist only in the companion, so FR-F3's ≈15-control cap has an unstated +3 baseline; FR-D7 also lowercases the named control "Background role". |
| LOW-9 | Low | 4 | prd.md:154 vs :468 | FR-D16 previews Anonymous/Free/Paid; Appendix B's `@member.status` also defines `comped`, which has no preview state. |
| LOW-10 | Low | 5 | prd.md:11, addendum.md:3 | `addendum.md` is absent from prd.md's normative-set preamble and self-declares "not normative for scope", yet FR-D9/D10/D18 cite AD1–AD3 as the mechanism of record; neither companion carries an `updated` date. |
| LOW-11 | Low | 7 | prd.md:250 vs :197 / :199 / :540 | FR-L3 blocks "any surface exposing compiled theme code"; FR-I2's live YAML pane + FR-I4's download expose routes.yaml, and Appendix F grants Routes to Free unconditionally. |
| LOW-12 | Low | — | prd.md:451–452, inv:575, 583 | A33 (6) + A34 (10) count toward 487 but are not placeable; FRs quantifying over "every variant" (FR-D12/D13/G5/G6, NFR-6a, E14) have no carve-out. |
| LOW-13 | Low | 3 | prd.md:143 vs inv:604 | FR-D5's hide-all case is neither "designed with content" nor "zero sections", so a fully hidden template compiles an empty body with no rule covering it. |
| LOW-14 | Low | 4 | prd.md:145 vs inv:10 | Capitalization split on the named control: "background role" (FR-D7) vs "Background role" (companion). |

### The five that would actually mislead a downstream agent

1. **HIGH-1** — an agent builds the template switcher from FR-D6 and A31 #10 becomes undeliverable.
2. **MED-1** — an agent reads FR-D6 literally and every project ships members templates plus an
   auto-added route, forcing the manual Ghost Labs step on every first deploy.
3. **MED-3** — an agent implements the snapshot at activation time, silently reopening the
   deploy-only bypass FR-J13 exists to close.
4. **MED-4** — an agent points the post-launch E2E suite at the **Live** stack because §4's headline
   mandate says testing runs on live infrastructure.
5. **MED-5** — an agent picks "ops" or "edits" for the heartbeat counter and the takeover message
   reports a number that does not match what the user did.

— End of audit —
