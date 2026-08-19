# Validation Report — Inflozo PRD v2.1

- **PRD:** `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md`
- **Rubric:** `.claude/skills/bmad-prd/assets/prd-validation-checklist.md`
- **Run at:** 2026-08-17T22:50:04+05:30
- **Grade:** Poor

## Overall verdict

This is an unusually decision-dense, testable PRD: nearly every FR carries a verifiable consequence, trade-offs are recorded with what was given up (Addendum AD3, Appendix G, FR-J14's "chosen for implementation simplicity"), and the appendices are genuinely normative rather than decorative. What's at risk is the handoff layer, not the substance: there is no glossary and no user journeys for a product whose thesis is experience quality, so the UX agent must reconstruct flows from FR prose — and one real coherence gap (every starter emits `routes.yaml`, putting the manual Ghost Admin step into every starter first deploy) could ship unexamined into onboarding design.

The adversarial and consistency reviewers materially shift that picture, and they drive the grade. Two critical findings make the PRD unsafe to hand to autonomous agents as-is: FR-J14 promises updates arrive "never automatically" while mandating a single unpinned live library, so every redeploy is a compulsory upgrade the user cannot decline; and FR-D6's "documented synthesis defaults" — the mechanism a home-only design depends on to produce a complete theme — are documented nowhere. Around them sits a cluster of asserted-but-unavailable third-party mechanisms (theme download via an Admin API endpoint Ghost doesn't document; Ghost(Pro) plan detection no API exposes), an unsatisfiable Definition of Done (deploy to T4, a target that blocks deploys by design), and stale companion-file residue from the same-day hardening pass. The grade is *Poor* by the rubric's formula (any critical finding); the substance underneath grades strong, and each critical is a one-paragraph decision away from resolution — this is a hardening problem, not a rethink.

## Dimension verdicts

- Decision-readiness — strong
- Substance over theater — strong
- Strategic coherence — strong
- Done-ness clarity — strong
- Scope honesty — strong
- Downstream usability — adequate
- Shape fit — adequate

## Findings by severity

Consolidated and deduplicated across the three reviewers (rubric walker, adversarial, consistency). Where two reviewers found the same defect it appears once with both credited.

### Critical (2)

**[Adversarial C1]** — Library updates are compulsory while being sold as opt-in (FR-J14; §1.4 diff 5 & 7; AD3)
"The user updates by redeploying — never automatically" vs. "Compiles always use the current library version (a single live library, no per-project pinning)." With no pinning, every redeploy is an involuntary full library upgrade; the "Updates available" notice is decoration. A library regression ships piggybacked on unrelated edits, detonating differentiator 5.
Fix: Pin per-project with an explicit "Upgrade library" action (reversing AD3), **or** delete "never automatically," reword differentiator 7, and require a pre-deploy library diff + mandatory confirmation.

**[Adversarial C2]** — "Documented synthesis defaults" are documented nowhere (FR-D6; FR-I1; §7.4)
The compiler's behavior for untouched templates (post/page/tag/author/error from a home-only design) is unspecified at its core — "derive header/footer/style" covers three of ~10 decisions per template, and no appendix or inventory section supplies the default section stacks. Three downstream agents will produce three different default themes; G2 (<15 min first deploy) depends on this exact mechanism.
Fix: A normative appendix (or inventory section): per template, the exact default section stack (category + variant id + key control values) and derivation rules. One page of tables.

### High (10)

**[Rubric · Strategic coherence]** — Every starter forces the manual routes.yaml step into first deploy, unreconciled with G2 (Appendix E; FR-I1/I4/I5)
All 10 starters ship members templates designed → every starter project emits routes.yaml → FR-I4's manual Ghost Admin upload lands on every first deploy, at the confetti moment. The PRD never acknowledges the tension.
Fix: Starters ship members present-but-undesigned (Portal covers the flows; no routes.yaml), or the "one more step" card becomes an explicitly designed part of the first-deploy journey.

**[Consistency F1]** — Definition of Done requires deploying to T4, a target that blocks deploys by design (§4 DoD, E7, E11 vs. T4/FR-C2)
"Deployable … to all live Ghost deploy targets (§4)" is unsatisfiable: T4 is a Ghost(Pro) Starter whose job is verifying the Preview-only block.
Fix: Deployable set = T1–T3; T4's acceptance criterion is the block path (E3's exit already has it right).

**[Adversarial H1]** — The "safe installs" snapshot depends on an undocumented Admin API capability (FR-J13; §1.4 diff 5; P8)
Theme *download* is an internal Ghost endpoint; whether a Custom Integration JWT can call it on 5.x/6.x/Ghost(Pro) is unverified. FR-I4 hedges the analogous routes endpoint; FR-J13 asserts flatly.
Fix: FR-I4-style treatment — name it internal, verify per §4 target as an acceptance criterion, design the degraded path.

**[Adversarial H2]** — Ghost(Pro) Starter "capability detection" has no mechanism (FR-C2; FR-C5)
No Ghost API reports plan or theme-upload permission; the only reliable probe is a side-effecting upload P8 forbids. The connect-time flag, daily re-check, and pre-attempt blocking have no implementable detection step.
Fix: Choose the mechanism: hostname heuristic + lookup, with the first deploy attempt's error response as the authoritative signal; rewrite FR-C2/C5.

**[Adversarial H3]** — Theme-name freeze vs. collision-rename deadlock; freeze scope ambiguous (FR-J10; FR-B5)
Site-switchable projects make the case reachable: frozen name collides on Site 2, the collision prompt asks for a rename the same FR defines as a display-only no-op. Deploy permanently blocked.
Fix: Freeze per project×site with per-site slug suffix; say so explicitly.

**[Adversarial H4]** — Tag/author archives excluded from the main-feed rule → broken pagination on every archive (FR-H2)
The designation rule scopes to "index and custom collections," so archive templates ship `{{#get}}`-driven feeds where page 2 renders page 1's posts — the exact indexable-duplicate failure FR-H2 guards against elsewhere.
Fix: Extend main-feed designation and lifecycle to all paginated contexts (index, collections, tag, author).

**[Adversarial H5]** — FR-Q5's "its dark counterpart already exists" is false for every token except accent (FR-Q5; FR-Q3; FR-Q2)
Promote `surface`/`background`/`text` and no dark counterpart exists; auto-creating one breaks the 17-slot cap arithmetic, promoting light-only ships the broken half-pair FR-Q5 claims impossible.
Fix: Decide: pair costs 2 slots, or promotion is accent-only in v1, or dark derives from light via pack pairing rules. One sentence.

**[Adversarial H6 + Rubric]** — Edit-lock takeover loss semantics and the undo stack vs. a hydrated doc are unspecified (FR-D18; FR-D10; FR-D9; AD1/AD2)
"Not included" unsynced edits: destroyed, recoverable, merged? And after hydrate-from-cloud, persisted undo entries reference a doc that no longer exists — FR-D9 covers schema mismatch only.
Fix: On hydrate, clear (or archive) the journal; takeover UX states the loss in edits. One paragraph each in AD1/AD2.

**[Adversarial H7]** — G8–G10 are unmeasurable: no FR builds the instrumentation (§1.3; NFR-8)
Activation funnels, conversion cohorts, churn, rollback rates all require telemetry no FR specifies. Launch flies blind against its own goals; "7-day rollback rate" lacks a denominator.
Fix: An FR-R (analytics): named events, tool, dashboards, precise denominators for every goal and counter.

**[Adversarial H8]** — Export-and-cancel is the rational Pro behavior; no retention mechanic or theme license terms (Appendix F; FR-J12/J15; P5; G10)
One month of Pro buys 25 white-labeled forever-working themes — the cheapest one-shot theme tool on the market, against a G10 assuming <5% monthly churn. FR-N1's legal pages omit theme license terms; §1.5's competitor claims are stated as fact without a verification date.
Fix: Model one-shot economics honestly (blended LTV, revised break-even) **or** add a stated retention mechanic (e.g., white-label export requires active subscription per Terms) + theme license terms as a required legal page; date the §1.5 claims.

### Medium (16)

**[Adversarial M5 / Consistency F2]** — Epic wave counts 150/200/137 don't match their named Appendix A groups (§8 E9–E11)
Actual sums: 156/199/132; both triples total 487, masking the error. An SM agent mis-scopes three epics.
Fix: Renumber 156 / 199 / 132.

**[Adversarial M7 / Consistency F4 / Rubric]** — Quiet & Ledger still composed of Pro variants despite FR-O4 and the logged "rebuilt Free-only" decision (Appendix E; FR-O4)
The memlog records the rebuild as done; Appendix E was never updated; FR-O4 carries draft-state "currently use… those swap" language in a status:final document, and the swap names no target variants.
Fix: Rewrite the two Appendix E compositions with named [Free] variants; delete FR-O4's transitional clause.

**[Consistency F3 / Rubric]** — sections-inventory.md frontmatter pins "prd.md v2.0"; the PRD is v2.1
Fix: Bump, or drop the version pin so it can't drift again.

**[Consistency F5 / Rubric]** — Inventory A31 requires `private.hbs`; FR-I1/§7.4 never emit it, and FR-J1 binds output to §7.4
Fix: Add `private.hbs` as a conditional emit (same pattern as members templates).

**[Rubric · Downstream usability]** — No Glossary (whole PRD)
"Pre-Inflozo snapshot", "site-wide singleton", "main feed", "Preview-only" are defined at point of first use, buried inside FRs — hostile to extraction by downstream agents.
Fix: 12–15 term glossary appendix, one line each, pointing at the defining FR.

**[Rubric · Shape fit]** — Consumer-grade product, no user journeys (whole PRD)
The critical flows exist as timings (G1/G2) and procedural FR narration, but the UX agent inherits fragments, not journeys; if delegation to the UX pass is intended, the PRD never says so.
Fix: One delegation sentence in the header, or 3–4 short journeys using the §3 personas.

**[Rubric + Adversarial M3]** — Performance targets lack a reference environment and stress fixture; two budgets for one interaction (NFR-1; G6; FR-D14; FR-F4)
"No hard cap" + "hold NFR-1 on long pages" is unfalsifiable; G6 says <100 ms where FR-F4 says one frame (16 ms).
Fix: Reference device + throttle, a named stress fixture ("60fps up to N sections; degradation beyond N"), one number per interaction.

**[Adversarial M2]** — Goal measurements undefined: G1's 60-second clock includes a manual Ghost Admin task (G1, G2, G6)
Fix: Define each goal's clock start/stop, percentile, and measurement environment in §1.3.

**[Adversarial M1]** — "Impossible to make ugly" / "Accessibility ≥ 95" unenforceable once FR-E3 allows failing token edits (G4; FR-G4; FR-E3)
Fix: Scope G4/FR-G4 to preset packs and library defaults; state that user token edits transfer responsibility.

**[Adversarial M4]** — "Routes never silently drift" is unverifiable in the primary manual flow (FR-I4)
Fix: Rename the tracked state ("last routes.yaml offered"), add a route-URL verification probe + "unverified" nag state.

**[Adversarial M8]** — Pre-Inflozo snapshot keyed by site URL; domain migration makes restore silently impossible forever (FR-J13)
Fix: Key by stable site identity (Ghost site UUID), URL as display metadata; define a re-key path.

**[Adversarial M9]** — Safety operations are not available for force-disconnected sites; rollback's lock requirement unspecified (FR-L3; FR-C6; FR-J9; FR-D18)
Fix: Scope safety ops to connected sites (decide whether reconnect-for-restore breaches the cap); exempt rollback/restore from the edit lock explicitly.

**[Adversarial M10]** — Promoting a text prop with inline marks to a Ghost `@custom` setting loses formatting or emits raw HTML (FR-Q3; FR-D4)
Fix: Disallow promotion of marked props (with a "remove formatting" prompt), or strip with an explicit warning.

**[Adversarial M11]** — i18n absent from scope *and* out-of-scope (§5; Appendix G; Appendix B)
Fix: One Appendix G line stating the v1 position (English chrome, LTR, `{{date}}` locale behavior).

**[Adversarial M12]** — The production-testing mandate expires at "first customer" with no successor regime (§4; NFR-6(d); P7)
Fix: One paragraph on post-launch test topology (flagged test accounts, Dodo test mode, the live Ghost fleet retained).

**[Adversarial M13 + Rubric]** — No descope lever exists anywhere despite §7.6 naming library-scale slip as a risk (P7; §4; FR-G1)
Fix: Keep the all-ships mandate; add a ranked cut-line appendix for the forced case.

### Low (12)

**[Adversarial L1]** — Google Fonts hotlinking: GDPR exposure (LG München 2022) + third-party runtime dependency in self-contained themes (FR-J3). Fix: bundle woff2 subsets of the ~30-pairing pool at compile.
**[Adversarial L2 / Consistency F9]** — FR-D10's failure fallback is the AD3-rejected per-change cloud sync, with NFR-1's latency clause not exempted. Fix: exempt fallback mode explicitly; scope AD3's rejection to the default path.
**[Adversarial L3]** — Destructive image optimization, no originals retained (FR-K2). Fix: keep originals for Pro, or state the destruction in the upload UI.
**[Adversarial L4]** — Infinite scroll's no-JS/SEO fallback unstated (FR-G4; FR-H2). Fix: add it to FR-G4's fallback list with the numbered-links rule.
**[Adversarial L5]** — Flapping connections email per flap (FR-C5). Fix: cool-down cap per site per N days.
**[Adversarial L6]** — No backup/RPO/RTO/PITR requirement for user work-product (NFR-4). Fix: one line — PITR, targets, restore tested pre-launch.
**[Adversarial M6 / Consistency F6]** — The conflict-winning inventory hedges "~487" where the PRD asserts exactly 487 and Appendix H hard-codes the number in microcopy. Counts verify exactly, so: drop the tilde (or make microcopy count-agnostic). (Adversarial rates medium; counts verifying exactly caps the impact.)
**[Consistency F7]** — "All 15–20 sibling designs" overstates the actual 6–18 per-category range (§1.4 diff 2). Fix: "every sibling design in its category (up to 18)".
**[Consistency F8]** — "Primary feed" vs. defined term "main feed" in inventory A17. Fix: align to "main feed".
**[Consistency F10]** — Publisher $29 (memlog) vs. ~$31 (Appendix F) — likely annual vs. monthly billing. Fix: note "monthly billing" in Appendix F.
**[Rubric]** — Last soft phrases: FR-I3 "drop the removed template gracefully" (editor behavior unstated), FR-J14 change-summary granularity unspecified. Fix: one clause each.
**[Rubric]** — No `[ASSUMPTION]` index for load-bearing external-world claims (Ghost(Pro) plans, Supabase passkey beta, internal routes endpoint, Dodo fees, Ghost 6 `?limit=all`). Fix: a 6-line "Verify at build time" list in §7.6.

## Mechanical notes

- Variant math verified twice, independently: per-category counts sum to exactly 487; 34 × 2 = 68 [Free], matching FR-G2, Appendix A, Appendix F.
- Every FR/NFR/§/AD cross-reference in all four workspace documents resolves — zero dangling IDs (mechanically extracted and checked).
- ID continuity clean; FR-Q's out-of-alphabet position self-explained in the §5 preamble.
- All ~106 memlog decisions are reflected in the PRD or explicitly superseded; all seven review-triage decisions and P1–P5 present in the PRD text.
- Money and versions consistent: $15/mo · $150/yr across G7/§1.5/FR-L1/App F/E12; break-even 8–9 arithmetically checks; 12 Style Packs = Appendix D; 10 starters = Appendix E.
- `private.hbs` omission caught independently by both the rubric walker and the consistency review.
- E1's design pointer (`_bmad-output/planning-artifacts/design/`) verified present.
- Memlog hygiene: one triage entry triplicated — harmless in an append-only log.

## Reviewer files

- `review-rubric.md` (rubric walker — refreshed this run; previous version reviewed pre-hardening v2.x)
- `review-adversarial-general.md` (adversarial reviewer, this run)
- `review-consistency.md` (ad-hoc cross-document consistency reviewer, this run)

Stale files from earlier sessions, retained for history (their findings were dispositioned into v2.1): `review-adversarial.md`, `review-structure.md`, `review-2026-08-17.md`.
