# Regression Audit — Inflozo PRD v2.3

- **Audited:** `prd.md` (v2.3, 593 lines), `sections-inventory.md`, `addendum.md`
- **Checklist:** `validation-report.md` (40 findings against v2.1)
- **Contract:** `.memlog.md` — `(decision) validation triage criticals/highs/mediums/lows`, `(decision) post-triage round 2`, `(change) v2.2 hardening`, `(change) v2.3`, `(decision) M13 CLOSED`
- **Run at:** 2026-08-18
- **Scope:** verification only. Nothing was changed.

---

## Verdict

**33 LANDED · 4 PARTIAL · 0 MISSING · 3 REGRESSED.**

The hardening passes were unusually disciplined. Every one of the 40 agreed fixes is physically present in the text — there is not a single MISSING. Arithmetic that the fixes touched re-verifies exactly: wave counts 156/199/132 sum to 487 and match their named Appendix A groups; per-category counts still sum to 487; 34 × 2 = 68 [Free]; the eight variants newly named in the Quiet and Ledger starters are all real #1/#2 [Free] variants of their categories; all 116 FR ids are defined and referenced with zero dangling cross-references. The C2 fix in particular over-delivers: the Synthesis Defaults section is a genuinely normative six-part spec, not a gesture.

What the passes did *not* do is propagate. Three of the four PARTIALs and all three REGRESSIONs are the same failure mode: a fix was written correctly into its home FR and nowhere else, so the hedge, the gate, or the new constraint contradicts an older unqualified sentence that nobody went back to touch.

The three regressions are not cosmetic. **The worst is H8** — the takeover fix's journal-clearing rule, read literally, destroys FR-D9's own persist-undo-across-reloads promise (an explicit owner decision), because a reload re-acquires the lock and every lock acquisition hydrates. That is a v2.2 fix eating a v1.0 feature inside the same requirement. Second: **H3's** signature-gated restore quietly downgrades the "safe installs" brand pillar to best-effort for exactly the case the pillar exists to serve (third-party themes), while §1.4, FR-L3 and the glossary still assert it unconditionally. Third: **M15's** post-launch Test/Live split doubled the standing infrastructure and Appendix F was never re-run, so the break-even number the PRD quotes in three places is stale from the first customer onward.

Recommended disposition: 6 text edits (listed per finding) close all seven problems. None requires a decision reversal; all seven are propagation debt.

---

## Fix-landing table (all 40)

Fix column = the **memlog triage decision** (the contract), not the report's suggestion, where the two differ.

### Critical

| ID | Agreed fix (memlog) | Status | Evidence / gap |
|---|---|---|---|
| C1 · FR-J14 forced updates | Keep single live library; delete "never automatically"; add pre-deploy confirm listing library changes | **LANDED** | FR-J14: "a **mandatory confirm step** lists the changes ("This deploy includes library updates: … — continue?") before compile proceeds. A live site never changes except through a user-initiated redeploy plus this confirmation." §1.4 diff 7 reworded to "users pick up improvements by signing in and redeploying (FR-J14)" — no "never automatically" survives anywhere (grep-verified across all three files). AD3 retains the pinning rejection consistently. |
| C2 · FR-D6 synthesis defaults | Author normative synthesis-defaults tables into `sections-inventory.md` (Ghost structure docs consulted first) | **PARTIAL** | Tables present and strong: `sections-inventory.md` § Synthesis Defaults, six parts (scope/trigger, inheritance, six default stacks, main-feed rule, invariants), every referenced variant verified [Free]. FR-D6 and the glossary point at it. **Gap:** no compiler-side FR knows synthesis exists. FR-J1 defines compiler input as "project doc (per-template ordered section instances…)" — an untouched template *has no doc* — and FR-I1 lists the always-compiled files without a word about where their content comes from. See F-2. |

### High

| ID | Agreed fix (memlog) | Status | Evidence / gap |
|---|---|---|---|
| H1 · starters force routes.yaml | Starters ship members templates present-but-undesigned; Portal covers flows; no routes.yaml on starter first deploy | **LANDED** | FR-O1: "starters ship them present-but-undesigned, so Ghost's native Portal serves those flows, no routes.yaml is emitted (FR-I1), and a starter's first deploy never requires the manual routes step (FR-I4) — the confetti moment stays uninterrupted." Appendix E preamble carries the same sentence. Two-file fix, both files landed. |
| H2 · DoD requires deploy to T4 | Deployable set = T1–T3; T4 pass = the block works | **LANDED** | §4: "**Deployable targets are T1–T3.** T4 exists to verify the Starter block path (FR-C2) — wherever an exit criterion says "all live Ghost deploy targets (§4)", it means: deploys succeed end-to-end on T1–T3, and the block path passes on T4." Resolves the DoD line, E3/E7/E11 exits and NFR-6(d) in one definition. |
| H3 · FR-J13 undocumented download | Label unofficial + verify on all 4 targets + Inflozo signature metadata; restore guaranteed only for Inflozo-signed themes; 3rd-party never touched; fallback → Ghost Settings → Design | **REGRESSED** | All four elements present in FR-J13 verbatim, plus §7.6 verify-item 4. But the hedge stops at FR-J13: §1.4 diff 5, FR-L3 and Appendix I still promise the snapshot and its restore unconditionally. See F-3. |
| H4 · Ghost(Pro) capability detection | No detection; inform upfront that Starter cannot deploy; proceed-then-fail with check/upgrade guidance | **PARTIAL** | FR-C2 fully rewritten ("**no detection API exists**"; user-declared plan; "the deploy attempt's error response is the authoritative signal"); FR-C5, §7.6 risk row and the glossary all echo it. **Gap:** FR-C2's clearing condition — "when the user updates the site's plan via Manage keys (FR-C8)" — points at a field FR-C8 does not define. See F-4. |
| H5 · name freeze vs collision rename | Freeze per project × site; collisions get a suffix | **LANDED** | FR-J10: "**The theme name freezes per site, at the project's first deploy to that site** … a collision at first deploy to a site auto-resolves with a slug suffix (e.g. `inflozo-blog-2`) … never deadlocking on the frozen name." FR-B3's rename clause agrees. |
| H6 · archives excluded from main-feed rule | Main-feed rule extends to tag/author templates (Ghost pagination docs consulted) | **LANDED** | FR-H2: "**index, custom collections, and the tag and author archive templates** (Ghost serves archives the same paginated `posts` context and `/page/N/` URLs as collections…)". Propagated: inventory A17 header ("Home, tag/author archives"), Synthesis Defaults § 4 main-feed rule, and the designation lifecycle ("tag and author templates start with a designated main feed from the Synthesis Defaults"). Three-file fix, all three landed. |
| H7 · FR-Q5 half-pair promotion | Color promotion accent-only in v1 | **LANDED** | FR-Q5: "Color promotion is **accent-only in v1** (FR-Q3) … Other pack tokens have no dark built-in counterpart and are not promotable (deferred: Appendix G)." Matched in FR-Q3 and in Appendix G's deferral line. (Edge case unaddressed — see F-8.) |
| H8 · takeover loss + undo vs hydrate | Takeover clears losing device's undo journal; message states concrete loss count | **REGRESSED** | Both halves present — FR-D9 clearing rule, FR-D18 "That session had 14 unsaved edits; they were not included", AD1 § "Journal invalidation on hydrate", AD2 § "Takeover loss accounting". But the clearing trigger is "**any** hydrate … (lock acquisition or takeover)" / FR-D10 "**every** lock acquisition", which swallows the ordinary reload case and contradicts FR-D9's own persistence promise two sentences earlier. See F-1. |
| H9 · G8–G10 unmeasurable | Internal goals, tracked manually by owner; **no** telemetry FR | **LANDED** | §1.3: "G8–G10 are internal business goals: the owner tracks them manually outside the product. No in-app analytics or telemetry requirement exists in v1 (NFR-8's privacy stance stands); instrumentation is added only if and when the owner requests it." No FR-R was added — correct, the owner rejected the report's suggestion. |
| H10 · export-and-cancel economics | Owner rejects lock-in; four value-based levers adopted (round 2): FR-J14 monthly cadence, FR-C5 Pro compatibility watch, FR-L1 yearly-default checkout, App F month-1 churn spike modeled | **PARTIAL** | All four levers present: FR-J14 "**Post-launch cadence (retention commitment)** … target: monthly drops"; FR-C5 "**Compatibility watch (Pro)**"; FR-L1 "Checkout pre-selects the **yearly** plan (two months free)"; App F "**Retention modeling (deliberate no-lock-in)**". **Gap:** the new Pro gate is absent from Appendix F, which §5 declares the definition of Free/Pro gating. See F-5. (G10 tension: F-9.) |

### Medium

| ID | Agreed fix (memlog) | Status | Evidence / gap |
|---|---|---|---|
| M1 · epic wave counts | Corrected to 156 / 199 / 132 | **LANDED** | E9 "(156)", E10 "(199)", E11 "(132)". Independently re-summed against Appendix A groups: Structure 16+15+16 = 47 plus Ghost Content 18+15+15+15+15+16+15 = 109 → **156**; Marketing A4–A16 → **199**; Template-Specific 104 + Ghost Native 28 → **132**; total 487. |
| M2 · Quiet & Ledger Pro variants | Rewrite both with named [Free] variants; delete FR-O4's swap-later clause | **LANDED** | Appendix E: "**Quiet** … Center Stage hero (A4 #1), Editorial Rules list (A18 #1), Narrow Classic reading (A25 #1), Author Bio Card close (A26 #1) — all [Free]"; "**Ledger** … (A4 #2), (A17 #1), (A10 #1), (A32 #2) — all [Free]". All eight verified against the inventory as #1/#2 = [Free]. FR-O4 now reads clean: "composed exclusively of [Free] variants end-to-end" — no transitional "currently use… those swap" language. |
| M3 · inventory version pin | Drop the pin | **LANDED** | `sections-inventory.md` frontmatter: "status: normative companion to prd.md (same folder; no version pin — the PRD frontmatter carries the version)". |
| M4 · `private.hbs` | Add as a conditional emit, same pattern as members | **LANDED** | FR-I1: "`private.hbs` follows the same conditional pattern: it compiles only when a Private Site Gate section (Appendix A §31) is designed." §7.4 tree carries the matching comment; Synthesis Defaults lists it under NEVER-synthesized. Three-file fix, all three landed. |
| M5 · no glossary | Add a glossary appendix | **LANDED** | Appendix I — 16 terms, each with a "Defined in" FR pointer, including the new v2.2/v2.3 terms (Synthesis Defaults, Chrome strings, Preview-only, Edit lock). |
| M6 · no user journeys | Delegate to the bmad-ux pass; delegation sentence in the PRD | **LANDED** | Header: "journey and flow authorship is delegated to the UX workflow (bmad-ux), which must cover at minimum connect → first deploy, blank-canvas build, Free-plan ship, and downgrade recovery, using the §3 personas." Names the four journeys — stronger than the contract required. |
| M7 · perf reference / two budgets | Facilitator picks a reference per the fast-and-snappy mandate | **LANDED** | NFR-1: "**Reference environment:** a mid-tier laptop with 4× CPU throttle (Chrome DevTools); **stress fixture:** a 40-section template." G6 and FR-D14 both cite it. The 16 ms/100 ms collision is resolved in FR-F4: "paints its optimistic UI within one frame; the resulting canvas re-render completes within G6's 100 ms budget … (one budget per interaction — no competing numbers)." |
| M8 · goal clocks | G1 clock starts at credentials submitted — **superseded by round 2:** G1 retargeted to < 10 min p75 end-to-end *including* key creation | **LANDED** | G1: "< 10 minutes (p75) end-to-end for a first-time user — including creating the Custom Integration in Ghost Admin (FR-C1)". Round-2 contract, not the earlier one, is what is in the text — correct. G2 carries p75; G6 is pass/fail on the NFR-1 environment. |
| M9 · unenforceable AA claim | Scope the AA guarantee to presets/defaults; user token edits transfer responsibility | **LANDED** | G4: "measured on library defaults and the 12 preset packs; user token edits can break AA (FR-E3 warns; responsibility transfers to the user)". FR-G4 and FR-E3 carry the matching clauses. (§1.4 diff 4 note: F-10.) |
| M10 · routes drift unverifiable | Rename tracked state to last-offered; add live route verification probe | **LANDED** | FR-I4: "Inflozo tracks the last routes.yaml **offered** per site … verifies where possible by fetching a representative route URL on the live site; until verified, the site shows a "Routes unverified — did you upload routes.yaml?" reminder state." |
| M11 · snapshot keyed by URL | Round 2, option 1: FR-C8 edit-URL-in-place carries site record + snapshot; connect flow hints on matching credentials | **LANDED** | FR-C8: "**edit the site URL in place** (for domain moves: the site record and its pre-Inflozo snapshot, FR-J13, survive the change) … "Moved domains? Edit the URL on the existing site instead."" FR-J13 closes the loop: "a moved domain never strands a snapshot." Two-FR fix, both landed. |
| M12 · safety ops on disconnected sites | No rollback on disconnected sites — safety ops require a connection | **LANDED** | FR-L3: "Safety operations — rollback (FR-J9) and snapshot restore (FR-J13) — remain available throughout **for connected sites**; they execute via the site's Admin API, so a disconnected site has neither until reconnected (a reconnection performed to run a restore counts against the connection cap like any other)." Also FR-J9's edit-lock exemption. |
| M13 · marked props → Ghost settings | Round-2 close: upfront confirm at bind time; on confirm marks stripped and formatting disabled while bound; unbinding re-enables | **LANDED** | FR-Q3 carries the exact confirm string and the strip/disable/re-enable rule; FR-D4 carries the mirror ("exception: a prop bound to a Ghost Admin text setting is plain-text-locked while bound — FR-Q3"). Two-FR fix, both landed. |
| M14 · i18n absent from both scope and out-of-scope | LTR-only, RTL deferred — **extended by round 2:** FR-Q6 Translations module reverses the locales deferral | **LANDED** | FR-Q6 (new): standard chrome-string catalog, `{{t}}`, `locales/`, user overrides, canvas shim. Propagated to FR-H5 (`{{t}}` in the shim list), FR-J5 (no hard-coded literals), §7.4 (`locales/…`), Appendix G (narrowed to "RTL layout … Translation itself ships in v1"), Appendix I (Chrome strings row), E7 scope. Six-site fix, all six landed. |
| M15 · production-testing mandate expires | Supersede: two infra sets — existing prod becomes permanent Test, fresh Live set at go-live | **PARTIAL** | §4 "**Post-launch topology (Test vs Live)**" is present and precise; NFR-6(d) matches ("pre-launch: production … post-launch: the Test environment"). **Gap:** Appendix F still costs a single infra set, so break-even ≈ 8–9 is stale from the first customer. See F-6. |
| M16 · no descope lever | Owner re-affirms no cut-line — all 487 ship, slip delays launch | **LANDED** | §4: "**No de-scope contingency (owner decision):** the full FR scope and the 487-variant inventory are not de-scopeable; if library waves slip, launch slips." No cut-line appendix added — correct, the owner rejected the report's suggestion. |

### Low (all 12 applied as recommended)

| ID | Agreed fix | Status | Evidence / gap |
|---|---|---|---|
| L1 · Google Fonts hotlinking | Bundle woff2 subsets in the theme zip | **LANDED** | FR-J3: "fonts are **self-hosted** … bundles woff2 subsets of the project's font pairing … generated themes make no third-party font requests (Google Fonts hotlinking is a documented GDPR liability…)". Echoed in FR-E1 and the §7.4 tree (`assets/fonts/…`). |
| L2 · FR-D10 fallback vs AD3/NFR-1 | Exempt fallback mode; scope AD3's rejection to the default path | **LANDED** | FR-D10: "(Fallback mode is a degraded state exempt from NFR-1's no-added-latency clause … AD3's rejection of per-change sync applies to the default path only.)" NFR-1 and AD3 both carry the mirror clause. Three-site fix, all three landed. |
| L3 · destructive image optimization | State the destruction in the upload UI | **LANDED** | FR-K2: "Optimization is destructive by design — originals are not retained; the upload UI states the trade-off ("Images are optimized (WebP, max 2400 px); originals aren't stored")." |
| L4 · infinite scroll no-JS fallback | Add to FR-G4's fallback list with the numbered-links rule | **REGRESSED** | FR-G4 landed: "load-more **and infinite scroll** fall back to numbered links". But the C2 fix then wrote the opposite into the inventory. See F-7. |
| L5 · flapping health emails | Cool-down cap per site per N days | **LANDED** | FR-C5: "at most **one health email per site per rolling 7 days** (a flapping site logs to the notifications center, never to email)." |
| L6 · no backup/RPO requirement | One line — PITR, targets, restore tested pre-launch | **LANDED** | NFR-4: "Supabase Postgres point-in-time recovery (PITR) enabled for user work-product, with a restore drill exercised before launch." |
| L7 · inventory hedges "~487" | Drop the tilde | **LANDED** | Inventory: "**Totals: 34 categories · 487 variants (exact; per-category counts sum to 487).**" grep confirms no `~487` survives; Appendix H's "487 gorgeous sections" microcopy is now safe. |
| L8 · "all 15–20 sibling designs" | "every sibling design in its category (up to 18)" | **LANDED** | §1.4 diff 2: "flip a placed section through every sibling design in its category (up to 18)". Correct — 18 is the true max (A4, A17). |
| L9 · "primary feed" vs "main feed" | Align to "main feed" | **LANDED** | Inventory A17: "Data group per FR-H2 (+ pagination when main feed)". grep confirms zero remaining "primary feed" in any current artifact. |
| L10 · Publisher $29 vs ~$31 | Note "monthly billing" in Appendix F | **LANDED** | App F: "Ghost(Pro) Publisher ~$31 monthly billing". |
| L11 · last soft phrases | Pin FR-I3's "gracefully" and FR-J14's change-summary granularity | **LANDED** | FR-I3: "the switcher drops the removed template; an editor viewing it switches to Home with a notice." FR-J14: "a human-readable summary of what changed (grouped by category, naming the project's affected placed sections)." |
| L12 · no `[ASSUMPTION]` index | 6-line "Verify at build time" list in §7.6 | **LANDED** | §7.6 carries all six, numbered, each with its dependent FR: Ghost(Pro) lineup (FR-C2), Supabase passkeys (FR-A2), internal routes endpoint (FR-I4), internal theme-download endpoint (FR-J13), Dodo fees (App F), Ghost 6 pagination (App B). |

---

## Findings (PARTIAL / MISSING / REGRESSED only)

### F-1 · HIGH · REGRESSED — the H8 journal-clearing rule destroys FR-D9's persist-undo-across-reloads promise

`prd.md:147` (FR-D9), `prd.md:148` (FR-D10), `prd.md:156` (FR-D18), `addendum.md` AD1.

FR-D9 makes two claims in the same paragraph:

> "The undo stack persists locally (per browser) across reloads and sessions — a deleted section is recoverable with all its customizations via undo **even after a reload**"

> "On **any** hydrate from the authoritative cloud snapshot (lock acquisition or takeover — FR-D10/FR-D18), the local undo journal is **cleared**"

FR-D10 fixes the trigger unambiguously: "On **every** lock acquisition (FR-D18), the cloud snapshot is authoritative: the local doc is replaced before editing resumes." FR-D18 establishes that the lock is per *editing context* and is what opening a project obtains. A reload ends the editing context and opens a new one, therefore re-acquires the lock, therefore hydrates, therefore clears the journal — **on every ordinary refresh, on the same device, with no second editor anywhere.** Undo-after-reload is dead as written.

AD1 states both halves too, which confirms this is propagation debt rather than a deliberate reversal: "The persisted op-log doubles as the undo/redo stack (last 100 ops), **which is what makes undo survive reloads for free**" sits four bullets above "Journal invalidation on hydrate."

This also contradicts a standing owner decision (memlog): "deleted sections recoverable via undo WITH all customizations; undo stack persists across reloads (per browser)". The H8 triage decision only required clearing on **takeover** ("takeover clears losing device undo journal"); the implementer generalised it to all hydrates, which over-shoots the contract.

**Fix (one clause, three places):** scope the clearing to hydrates that *supersede* the local doc — takeover, and any lock acquisition where the cloud snapshot's revision differs from the local doc's base revision. A same-session reload that re-acquires its own uncontested lock and finds the cloud snapshot unchanged must keep its journal. Update FR-D9, FR-D10's "every lock acquisition" sentence, and AD1's invalidation bullet together, or the next reader re-derives the contradiction.

### F-2 · MEDIUM · PARTIAL (C2) — the Synthesis Defaults exist, but no compiler-side requirement invokes them

`sections-inventory.md:598–685`, `prd.md:144` (FR-D6), `prd.md:196` (FR-I1), `prd.md:215` (FR-J1).

The tables are excellent and the C2 gap they were written to close is genuinely closed *as a specification*. What is missing is the call site. Two problems:

1. **FR-J1** defines the compiler's input as "project doc (per-template ordered section instances with content values, control values, dark overrides) + Style Pack + routes config + referenced assets." An untouched template has no doc at all (the inventory's own trigger definition: "**Untouched** = the template has no `project_templates` doc"). A developer implementing FR-J1 literally emits nothing for those templates. Only FR-D6 — a *Template switcher* requirement in the Editor Core domain — mentions synthesis, and it is the last place a compiler implementer looks. FR-I1, which enumerates exactly the files that must always be emitted, is silent on where their content comes from.
2. **FR-D6's own sentence over-reaches.** It lists "Home, Post, Page, Tag archive, Author archive, **Members (Signup / Signin / Account)**, 404, plus any custom templates" and then says "Templates the user hasn't touched compile from the normative Synthesis Defaults." The inventory's § 1 says the exact opposite for three of those: "**NEVER synthesized:** `members/signup.hbs` / `signin.hbs` / `account.hbs` … `custom-{name}.hbs`". FR-I1 and FR-O1 agree with the inventory, so FR-D6 is the outlier.

**Fix:** add one clause to FR-J1 ("templates with no doc are synthesized per `sections-inventory.md` § Synthesis Defaults before assembly") and one to FR-I1 (the standard set's untouched members compile from the same source); narrow FR-D6's sentence to the six synthesizable templates.

### F-3 · MEDIUM · REGRESSED (H3) — signature-gated restore contradicts the unhedged "safe installs" pillar in three other places

`prd.md:233` (FR-J13) vs `prd.md:52` (§1.4 diff 5), `prd.md:283` (FR-L3), `prd.md:583` (Appendix I).

FR-J13 now correctly hedges twice: capture depends on "an **internal, undocumented** Admin API capability" that may be unavailable, and **restore** is signature-gated — "Rollback and automated restore are guaranteed only for Inflozo-signed themes … a third-party active theme is archived on a best-effort basis … Inflozo does not guarantee restoring it."

Note what that means: the pre-Inflozo snapshot is *by definition* the third-party theme that was active before Inflozo arrived. So the one artifact the snapshot exists to protect is precisely the one whose restore is now explicitly not guaranteed. That may well be the right engineering call, but three other passages still sell it flat:

- §1.4 differentiator 5: "a snapshot of the site's previous theme before Inflozo's first activation, **and one-click rollback**" — no hedge, presented as a brand promise.
- FR-L3: "Safety operations — rollback (FR-J9) and **snapshot restore** (FR-J13) — remain available throughout for connected sites" — availability asserted unconditionally.
- Appendix I: "Pre-Inflozo snapshot | The archived previously-active theme, captured before Inflozo's first upload to a site" — capture asserted unconditionally, where FR-J13 says it may not happen at all.

**Fix:** hedge diff 5 to what FR-J13 actually guarantees (Inflozo-signed rollback always; previous-theme snapshot best-effort with a designed fallback to Ghost Settings → Design), add "where a snapshot was captured" to FR-L3's clause, and add "where the download capability is available" to the glossary row.

### F-4 · MEDIUM · PARTIAL (H4) — FR-C2 clears Preview-only via a Manage-keys field FR-C8 does not have

`prd.md:129` (FR-C2) vs `prd.md:135` (FR-C8).

FR-C2: "The flag clears on the first successful deploy or **when the user updates the site's plan via Manage keys (FR-C8)**."

FR-C8's Manage keys flow is fully enumerated — "re-paste Admin/Content keys, **edit the site URL in place** …, test the connection, save re-encrypts to Vault" — and contains no plan field, no plan selector, nothing plan-related. The declared-plan value that FR-C2 collects at connect time therefore has no defined edit surface. The data model backs FR-C2's side (`sites.capability (full/preview_only)` exists in §7.5), so this is a missing UI affordance, not a missing concept.

It matters because it is the *only* non-deploy escape from Preview-only: a user who mis-declares Starter at connect, or who genuinely upgrades their Ghost(Pro) plan, is otherwise stuck attempting a deploy to clear a flag that blocks nothing but is displayed everywhere.

**Fix:** add "declared Ghost(Pro) plan (clears or sets Preview-only, FR-C2)" to FR-C8's enumerated Manage-keys fields.

### F-5 · MEDIUM · PARTIAL (H10) — a new Pro-gated feature that Appendix F, the normative gating table, does not list

`prd.md:132` (FR-C5) vs `prd.md:530–540` (Appendix F).

§5's preamble is explicit: "Free/Pro gating is defined in Appendix F." v2.3 then introduced "**Compatibility watch (Pro):** the daily check also compares each connected site's Ghost version against the library's compatibility data…" and never added the row. Appendix F's feature list still runs Projects / Site connections / Section library / Asset storage / Per-upload cap / Deploy history / ZIP export / Credit removal / Dark-mode-Routes-Style-Pack-editing.

Two consequences. First, mechanical: an SM or Dev agent building the entitlements matrix from Appendix F (as §5 instructs) will not gate the compatibility watch at all. Second, substantive and worth an owner glance: this gate means **Free users are not told when a Ghost release breaks their deployed theme** — which sits awkwardly beside the §1.4 diff 5 "an Inflozo theme never breaks your site" promise, made without a plan qualifier. Gating the *notification* about breakage is a different kind of lever from gating a capability.

**Fix:** add a "Compatibility watch" row to Appendix F (— / ✓), and if the owner wants the brand promise intact, consider making the notice Free-visible while keeping the richer watch Pro.

### F-6 · MEDIUM · PARTIAL (M15) — the post-launch two-infra-set decision was never costed; break-even ≈ 8–9 is stale

`prd.md:117` (§4 post-launch topology) vs `prd.md:542` (Appendix F economics), `prd.md:36` (G7).

§4 now mandates: "at go-live, a fresh infrastructure set is provisioned as **Live** (new Supabase project, Vercel production environment, live Dodo) … the existing pre-launch stack — including Ghost targets T1–T4 — becomes the permanent **Test** environment."

Appendix F still models exactly one: "core fixed ≈ $45/mo (Supabase Pro $25 + Vercel Pro $20) **plus launch-mandated test infrastructure ≈ $60–80/mo** … → **total fixed ≈ $105–125/mo** … **break-even ≈ 8–9 Pro subscribers**." The word "launch-mandated" even signals the author believed the test infra was temporary — which is the posture M15 reversed.

From the first customer onward the standing fixed cost is roughly *two* app stacks plus the retained Ghost fleet: ≈ $150–170/mo, pushing break-even to ≈ **11–13** Pro subscribers at the stated $13.70–13.93 net per $15. The stale 8–9 figure is quoted in two places (G7 and Appendix F), and G7 is a measurable goal.

**Fix:** re-run Appendix F with the Test set as permanent, restate break-even, and update G7's parenthetical. (Note Supabase/Vercel org-level pricing may soften the doubling — worth checking rather than assuming a clean 2×.)

### F-7 · LOW · REGRESSED (L4) — the Synthesis Defaults contradict FR-G4's no-JS fallback, and contradict the inventory's own A34 line

`sections-inventory.md:677` vs `prd.md:180` (FR-G4) and `sections-inventory.md:583` (A34).

The C2 fix justifies its pagination default like this:

> "Pagination style = **A34 #1 Numbered Classic** … — **the only style that is fully functional with JS disabled** (FR-G4), which is why defaults never use Load More/Infinite."

FR-G4, as amended by the L4 fix in the same hardening pass, says the opposite: "load-more **and infinite scroll** fall back to numbered links". So does A34's own header 94 lines earlier: "Load More and Infinite ship JS with numbered-link fallback." Two fixes from the same pass, landing in the same file, disagreeing.

The *decision* (default to Numbered) is fine and probably right — Numbered needs no fallback path at all. Only the stated reason is wrong, and a wrong reason in a normative document is a licence for a downstream agent to "fix" FR-G4 or to skip building the fallback.

**Fix:** replace the rationale — "…the only style that needs no JS fallback path, which is why defaults never use Load More/Infinite."

### F-8 · LOW · PARTIAL (H7) — accent promotion is undefined for Light-only projects

`prd.md:207` (FR-Q5), `prd.md:205` (FR-Q3).

FR-Q5 justifies accent-only promotion entirely through the dark pair: "promoting the accent creates the *light* setting, and its dark counterpart — the Dark accent built-in — **already exists**, so both modes stay owner-controllable as a pair."

But FR-Q5's own preceding sentence says the built-ins are compiled only for Light+Dark projects: "**Light+Dark projects always compile three built-in custom settings**"; "Light-only projects simply don't compile them (FR-Q2)". So in a Light-only project the dark counterpart does *not* exist, and the entire stated justification evaporates. Is accent promotion permitted there (harmless — there is no dark mode to break) or blocked (the letter of FR-Q5)? Unstated.

**Fix:** one clause in FR-Q5 — "In Light-only projects the accent promotes as a single light setting; no dark counterpart is needed."

### F-9 · LOW — G10's churn target was not reconciled with Appendix F's expected churn spike

`prd.md:38` (G10) vs `prd.md:544` (App F).

The H10 round-2 fix added: "themes work forever and export stays open, so **an export-and-cancel cohort is expected** — model a month-1 churn spike honestly in blended LTV." G10 still reads, unqualified: "Pro monthly churn < 5%".

If a month-1 spike is the honest expectation, a flat <5% monthly target is either unachievable or silently means steady-state-after-month-1. Not a hard contradiction — a measurable goal that the economics section expects to be missed by design.

**Fix:** qualify G10 ("< 5% steady-state, excluding the month-1 export-and-cancel cohort modeled in Appendix F") — or accept the miss deliberately and say so.

### F-10 · LOW — smaller residue, listed for completeness (no fix strictly required)

- **`prd.md:144`/`sections-inventory.md:630–637` — synthesized paywall trips FR-H6's own warning.** The default `post.hbs` stack auto-emits "**A32 #1 Fade + Card** … inside `{{#unless access}}`". FR-H6 requires that "placing portal/signup/paywall sections on a site with members disabled warns in the editor, **and a pre-deploy check repeats it**". Every untouched-post project on a members-disabled site therefore trips a warning about a section the user never placed. (Harmless at runtime — `{{#unless access}}` never fires with members off — which is exactly why the warning is noise.) Note that the same stack handles the analogous comments case gracefully and says so: "A28 **#2** Minimal Thread … #2 over #1 deliberately — bare native output renders nothing when comments are disabled." Give A32 the same treatment: suppress the check for synthesized instances.
- **`prd.md:120` (FR-B7) / `prd.md:279` (FR-P2) — compatibility-watch notices are not in either list.** FR-B7 enumerates the notification feed's contents (deploy, health, billing, FR-J14 updates, announcements) without the new compatibility notice; FR-C5 cites "in-app only per FR-P2", but FR-P2's in-app-only rule is written for "Theme updates available (FR-J14)" specifically. Add the type to both.
- **`prd.md:233` (FR-J13) / `prd.md:396` (§7.6 item 4) — "verify the download endpoint on all four §4 targets" is partly unreachable.** T4 is a Ghost(Pro) Starter that cannot accept a theme upload by design (H2's own fix), and the snapshot triggers "at Inflozo's first theme upload to a site". The endpoint can be probed on T4 independently, but the acceptance criterion as phrased implies an end-to-end run that the block path prevents. One qualifying clause fixes it.
- **`prd.md:207` (FR-Q5) — Light-only projects waste 3 of Ghost's 20 slots.** Deliberate per the review-triage 5/7 decision (uniform 17-slot cap, no collisions), correctly implemented, and worth flagging only because a future reader will read it as a bug and "fix" it. A one-line rationale in FR-Q2 would immunise it.
- **`prd.md:47` (§1.4 diff 4) / `prd.md:64` (P2) vs `prd.md:174` (FR-F1) / Appendix C — "closed control vocabulary" vs "open but disciplined".** Differentiator 4 still sells "a **closed** control vocabulary with no raw CSS values"; FR-F1 says "The vocabulary **may grow** when a section genuinely needs a new type" and Appendix C says "The vocabulary is **open** but disciplined (FR-F1)". **Pre-existing** — it dates to the round-six owner reversal, not to these hardening passes, and was not among the 40 findings. Flagged because it is live and one word wide ("closed" → "disciplined").
- **`prd.md:40` (§1.3) vs `prd.md:293` (NFR-8).** §1.3's H9 fix says "No in-app analytics or telemetry requirement exists in v1", while NFR-8 permits "no third-party trackers **beyond privacy-respecting analytics**". Permitted ≠ required, so not a contradiction — but the two sentences will read as one to a skimming agent. Optional tightening.

---

## New contradictions introduced by the hardening passes

Ranked by blast radius. Cross-referenced to the findings above; the point of this section is the *pattern*, which is worth as much as the individual items.

| # | Collision | Introduced by | Severity |
|---|---|---|---|
| 1 | Undo-persists-across-reloads (FR-D9, AD1, owner decision) **vs** journal-cleared-on-every-lock-acquisition (FR-D9, FR-D10, AD1) | H8 fix over-shooting its contract (takeover → *all* hydrates) | **High** — kills a shipped-feature promise inside the same requirement |
| 2 | §1.4 diff 5 / FR-L3 / Appendix I assert snapshot + restore unconditionally **vs** FR-J13's endpoint-dependent capture and signature-gated restore | H3 fix hedged its home FR only | Medium |
| 3 | Appendix F single-infra economics + break-even 8–9 (also G7) **vs** §4's permanent Test + new Live sets | M15 fix landed in §4 and NFR-6, never re-costed | Medium |
| 4 | FR-C2 clears Preview-only "via Manage keys (FR-C8)" **vs** FR-C8's enumerated fields, which have no plan field | H4 fix invented a call site that H4 did not build | Medium |
| 5 | FR-C5's "Compatibility watch (**Pro**)" **vs** Appendix F, which §5 declares the sole definition of Free/Pro gating | H10 round-2 lever added to an FR, not to the gating table | Medium |
| 6 | Synthesis Defaults: "Numbered … the only style fully functional with JS disabled" **vs** FR-G4 and inventory A34's numbered-link fallback | C2 fix colliding with the L4 fix — same pass, same file | Low |
| 7 | FR-D6 "templates the user hasn't touched compile from the Synthesis Defaults" over a list including Members **vs** inventory's "NEVER synthesized: members/…, custom-…" | C2 fix; FR-D6's sentence was not narrowed after the inventory drew the line | Low |
| 8 | Synthesized `post.hbs` auto-emits A32 paywall **vs** FR-H6's members-disabled warning + pre-deploy check | C2 fix vs a v2.1 guard | Low |
| 9 | G10 "Pro monthly churn < 5%" **vs** Appendix F's expected month-1 export-and-cancel spike | H10 round-2 fix; the goal was not re-qualified | Low |
| 10 | FR-B7 / FR-P2 notification-type lists **vs** the new compatibility-watch notice they must carry | H10 round-2 lever, not propagated | Low |
| 11 | FR-J13 + §7.6 item 4 "verify on all four §4 targets" **vs** §4's T4-cannot-deploy definition | H3 fix vs H2 fix — two fixes from the same triage | Low |

**The pattern.** Nine of the eleven are the identical error: **the fix was written into its home FR and stopped there.** Not one is a wrong decision; every one is an un-propagated one. The two multi-file fixes that were consciously treated as multi-file (H6 → three files, M14 → six sites, M4 → three files, M13 → two FRs, L2 → three sites) all landed clean, which shows the discipline exists — it just was not applied uniformly.

Practical consequence for the next pass: the highest-yield check is not re-reading the FRs that changed, but grepping the *terms* they own — `snapshot`, `Preview-only`, `undo`/`hydrate`, `break-even`, `Pro`-gated feature names — and reading every other hit. Four of the six medium-or-worse items above surface in a single grep each.

**Not contradictions (checked and clean).** Worth recording so the next auditor does not re-open them: the 17-slot cap arithmetic across FR-Q2/FR-Q5/FR-J2/Appendix B (deliberate, consistent, including the Light-only reserve); the 487 / 68 / 34 / 156-199-132 count chain (re-summed independently, exact at every level); the eight starter variants named in Appendix E (all verified [Free] in the inventory); FR-J14's mandatory confirm against FR-J8's cancel window and FR-J9's rollback path (rollback redeploys stored artifacts, so it is correctly outside the confirm); FR-L5's "exactly four" upgrade moments against FR-L3's open canvas; FR-P1's "exactly five" emails against every notice added in v2.2/v2.3 (all in-app); all 116 FR ids defined and referenced, zero dangling.
