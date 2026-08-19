# Validation Report — Inflozo PRD v2.3

- **PRD:** `_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17/prd.md`
- **Rubric:** `.claude/skills/bmad-prd/assets/prd-validation-checklist.md`
- **Run at:** 2026-08-18T09:12:00+05:30
- **Grade:** Poor

## Overall verdict

This is a decided document, not a deliberating one: §5's 116 FRs carry bounded consequences rather than adjectives, §7.6's "Verify at build time" list is a better instrument than an Open Questions section for a `status:final` PRD, and the hard trade-offs (destructive image optimization, un-pinnable library versions, takeover data loss, export-and-cancel churn) are named with what was given up. Two things are at risk. First, Appendix A's normative inventory degrades after category A16: **219 of 487 variants carry no declared control set**, which is exactly the deliverable §4 declares non-de-scopeable. Second, §8's epic breakdown has silent coverage holes — FR-B (dashboard), FR-P (email), and FR-D18 (edit lock) are named in no epic — so an SM agent driven by epic order will under-produce against a PRD whose own DoD says "every FR implemented."

The other five reviewers change the picture in two directions at once. **External-claims verification** read Ghost's source and killed four load-bearing platform facts: Ghost applies a hard method allowlist to integration tokens (`themes: ['POST','PUT']`), so the theme *download* the "safe installs" differentiator rests on returns 403 on every version and every host — FR-J13's hedge is not "undocumented and version-dependent," it is impossible; `routes.yaml` upload is likewise impossible while its *download* is permitted, so FR-I4 is wrong in both directions at once; plan detection *is* possible via an allowlisted `GET /admin/config/`, so FR-C2's flat "no detection API exists" — asserted three times — is false; and `engines.ghost-api`, which FR-J1 mandates, is a standing gscan *warning*, making the 0-errors-0-warnings gate structurally unreachable as specified. **Buildability** tried to do three downstream jobs from the document and could not hand it to an architect: the compile pipeline's core transform is never named (and once derived, forces a Handlebars partial evaluator with an AST→source printer, a multi-week component sitting unscoped on E4's exit criterion), §8's sequencing is circular in five places, and §7.5 is prescriptive-but-incomplete in the one way that produces a live defect — FR-J10's frozen theme name has nowhere to live except a `deploys` row FR-J7's retention prunes away. **Adversarial** found three launch-blockers in the new material alone. And **three reviewers independently reached the same root cause: every v2.2/v2.3 fix was written into its home FR and stopped there, never propagated to the other locations still asserting the old behavior.** Regression found that 9 of the 11 new contradictions fit that single pattern; adversarial found every new feature specified against the FR it replaced and against nothing else; buildability met the same gaps from the other side, as epic-ownership holes. One process defect, roughly 25 findings.

This is a different *Poor* from v2.1's. v2.1 failed on internal self-contradiction — FR-J14 promising the opposite of itself two sentences later, "documented synthesis defaults" pointing at a document that did not exist — and every critical was findable by reading the PRD against itself. v2.3 is internally near-clean: the arithmetic is exact at every level, all 116 FR IDs resolve, the 487-variant chain re-verifies three ways independently, and the consistency sweep found no dangling reference anywhere in three files. What it now rests on is a set of external platform facts that are false, plus fixes that never left their home FR. Four of the criticals here cannot be found by re-reading the PRD at all — only by reading Ghost's source. The document is precise; it is wrong about the outside world, and it was hardened one requirement at a time. Both are fixable, and neither is a rethink: the platform corrections are wording changes with a known correct wording, and the propagation debt is a grep away.

## Dimension verdicts

- Decision-readiness — strong
- Substance over theater — strong
- Strategic coherence — strong
- Done-ness clarity — adequate
- Scope honesty — strong
- Downstream usability — adequate
- Shape fit — strong

## Findings by severity

Consolidated and deduplicated across all six reviewers (rubric walker, regression, adversarial, external-claims, buildability, consistency). Where two or more reviewers found the same defect it appears once, with each credited. Where reviewers reached the same *area* by different failure modes — the FR-J13 snapshot cluster, the Appendix F economics cluster — the findings are kept separate, because each needs a different fix. **155 findings before dedup · 135 after.**

### Critical (13)

**[External-claims F1 + Buildability]** — Theme download is unreachable with a Custom Integration key; "safe installs" has no primary path (FR-J13; §1.4 #5; §7.6 item 4; E7)
`GET /admin/themes/:name/download/` exists and the Admin Integration role holds `theme: read` — but Ghost applies a harder gate to integration tokens *before* permissions are consulted: `tokenPermissionCheck`'s allowlist is `themes: ['POST','PUT']`, and anything else returns a 403 `NoPermissionError`. Every download attempt with an Admin API key fails on **every Ghost version and every host** — self-hosted 5.x, 6.x and Ghost(Pro) alike. `GET /themes/` and `/themes/active` are blocked by the same line. FR-J13 frames this as version/host variance and makes verification on all four §4 targets an acceptance criterion — a criterion that can only ever fail, on all four, discovered in E7. Buildability reached the same wall from the story side (S12: "a story whose AC is 'find out whether X exists' cannot be marked done-or-not-done") and the QA side (T22: "best-effort" has no pass condition). Source: `web/api/endpoints/admin/middleware.js`.
Fix: Delete the "internal, undocumented … verify per version/host" framing. State that Ghost blocks all `GET /themes/*` with an integration token, so a Custom Integration can never capture a snapshot, and that **the designed degraded path is the default path, not a fallback**: before first activation the user is told no snapshot could be captured and that Ghost retains the previous theme under Settings → Design. Rollback between Inflozo-built versions is unaffected. Revise §1.4 #5 to the honest promise. Optional out-of-scope note: a Ghost **Staff Access Token** bypasses the integration allowlist.

**[External-claims F2 + Buildability T16]** — The compile gate cannot be green as specified; `engines.ghost-api` is a standing gscan warning (FR-J1; §7.4; NFR-7 vs G3, FR-J6, NFR-6(b))
gscan's v5 and v6 specs both carry `GS010-PJ-GHOST-API-PRESENT` at level **warning**: "The `ghost-api` version is no longer used and can be removed." FR-J1 mandates emitting it, §7.4 bakes it into the skeleton, and NFR-7 claims it is *what* covers 5.x and 6.x — all three wrong at once. Emitting it guarantees a warning on **every single compile**, against G3, FR-J6 and NFR-6(b). A second guaranteed warning comes free: `GS110-NO-MISSING-PAGE-BUILDER-USAGE` fires unless page templates gate markup with `{{#if @page.show_title_and_feature_image}}`, which nothing emits. Buildability suspected exactly this and named the blast radius: if even one library-wide warning is unavoidable, the exit criteria of E9, E10 and E11 are all unmeetable, discovered at the end of three library epics.
Fix: FR-J1 emits **no `engines.ghost-api`**; strike it from §7.4. NFR-7: compatibility comes from the helper surface used (Appendix B), verified by gscan against the v6 spec and by golden tests, not from a `package.json` declaration. FR-I1/§7.4: `page.hbs` gates its title/feature-image markup. FR-J6: keep 0/0 and add the standing v6 constraints the library must satisfy.

**[Adversarial C1]** — FR-C8's edit-URL-in-place lets Inflozo push one site's archived theme onto a different live site (FR-C8; FR-J13; FR-C6; §1.4 #5)
User connects `blog.example.com`; Inflozo captures its pre-Inflozo snapshot and deploys. Months later the user opens Manage keys, edits the URL to `shop.example.com` and re-pastes that site's keys — exactly the flow FR-C8 offers, and it never asks whether it is the same site. FR-C8 states the site record "and its pre-Inflozo snapshot survive the change." Two consequences fire at once: FR-J13's capture trigger is "Inflozo's **first** theme upload to a site" and S1 has already had one, so the new site's real theme is **never snapshotted**; and "Restore original theme" now uploads and activates the *other* site's theme over a live design. The safety mechanism becomes the thing that breaks the site, and the victim's own escape hatch was silently skipped.
Fix: On URL edit, fingerprint the new target via the Admin `site` endpoint (title + version + oldest-post `published_at`) against the stored fingerprint; on mismatch force "this is a different site" — drop the snapshot association, reset the first-upload flag, re-capture on next upload.

**[Adversarial C2]** — FR-Q6 makes the "Built with Inflozo" credit a user-overridable string: Free white-label in two clicks (FR-Q6; FR-J15; FR-L3; Appendix F)
FR-Q6 is a universal rule, not a list: "**every** compiler-generated, visitor-facing chrome string … lives in one standard string catalog," consumed "**exclusively** via `{{t}}` … never hard-coded literals; compile validation enforces this." The credit is compiler-generated, visitor-facing and injected into `default.hbs` for Free users, so by FR-Q6's own enforcement rule it **must** be a catalog string. FR-Q6 then lets the user override "**any** label." Free user opens Translations, overrides `Built with Inflozo` to a space, deploys. FR-J15's "Free deploys and exports always retain credits" and Appendix F's Pro-only white-label row are both defeated — FR-L3's exit gates check for Pro *sections*, not translated strings.
Fix: Name the credit strings as a locked catalog namespace — not listed in the Translations surface, not overridable on any plan, `{{t}}`-emitted from a compiler-owned partial, excluded from FR-Q6's "any label" rule in one clause.

**[Adversarial C3]** — The paywall exists in three incompatible placement models; the default post page of every generated theme is unbuildable (Synthesis Defaults §3; Appendix A §A32; FR-D5; FR-D12; FR-D13; §1.4 #4; Appendix G)
Synthesis Defaults puts A32 #1 *inside* row 2 of the post stack, as a property of the A25 Post Content Layout instance. Appendix A treats A32 as a category of 12 **placeable sections** ("a flagship differentiator") that FR-G1 makes launch deliverables and FR-D12 puts in the Section Picker. FR-D5's Layers panel is a flat ordered list, which §1.4 #4 makes binding and Appendix G reinforces by deferring nesting. These cannot all be true — and each reading breaks a different requirement (drag semantics, P1's true-website canvas, or the applicability of Shuffle and Free/Pro badging). Three implementing agents will build three different products, on the default post template of every theme Inflozo generates.
Fix: Declare A32 a **slot-bound section** — exactly one instance per `post.hbs`, occupying a fixed "gated cutoff" slot rendered inside the content layout, shown in Layers as a locked, non-draggable row nested under A25 — and say so in FR-D5, FR-H2's sibling text and Appendix A §A32.

**[Buildability C4 + Adversarial H17]** — The pre-Inflozo snapshot has no store, an ambiguous RLS key, and FR-A5 purges it (FR-J13; FR-C6; FR-B3; FR-A5; NFR-3; §7.1; §7.5)
FR-J13 makes the snapshot "a per-site artifact keyed by site URL" surviving project deletion and disconnect. §7.1's buckets are `assets/{userId}`, `deploy-artifacts/{projectId}` and `thumbnails` — **no per-site bucket**, so an implementing agent must put it under a projectId, exactly what FR-B3 forbids; §7.5 has no snapshots table either. NFR-3 mandates RLS keyed to `auth.uid()`, and a table keyed by URL has no `auth.uid()` to key on: if two users connect the same Ghost site (an agency and its client — the multi-site-operator persona in §3), **one user's archived theme zip is reachable by another**. And FR-A5's deletion cascade names "deploy artifacts" with no snapshot carve-out, so a GDPR purge silently destroys the escape hatch of a user whose live site is still running an Inflozo theme.
Fix: `site_snapshots(user_id, site_id, artifact_path, captured_at)` with RLS on `user_id`, plus a `site-snapshots/{siteId}/…` bucket in §7.1; make FR-A5 offer the snapshot as a download before purging.

**[Buildability C1]** — The content-baking mechanism is undefined, and once derived it forces a Handlebars partial evaluator with an AST→source printer (FR-J1; §7.3; §7.4; P3; P4)
Nothing states how content gets from the project doc into the `.hbs`. Injecting a Handlebars context is impossible (Ghost's Handlebars has no literal-object construct and themes cannot register helpers); partial hash params cannot express arrays of objects, so most of the marketing library cannot receive content that way. Partial evaluation is the only survivor and is therefore forced — a `Handlebars.parse()` AST walk with a hand-written AST→source printer, because Handlebars ships a parser and no printer. The PRD hides a component whose cost is comparable to the entire editor shell and puts it on the critical path for E4's exit criterion, three epics before the compiler epic. Two uncosted consequences: §7.3's "byte-comparable markup" is not a property of the design but something this evaluator must earn expression by expression; and escaping substituted literals (a user typing `{{title}}` into a headline) is required and unspecified.
Fix: Name the mechanism in §7.3 or FR-J1, scope it as its own component with an epic slot before E4's exit, and state the escaping rule.

**[Buildability C2 + Adversarial L4]** — §8's sequencing is circular in five places, plus three more ordering breaks (§8 E3, E4, E7, E8, E12, E13)
E4's exit ("compile byte-identical") needs E7's compiler, three epics later. E3's exit ("Starter-block path verified") needs E7's deploy, because FR-C2 makes the deploy error the authoritative signal. E3's FR-C7 redesign proposals need the section runtime (E4), the packs (E6) and the starters (E11) — E3 is epic #3. E7 needs E8's asset bundling (E8's own exit claims bundling as its deliverable) and E12's entitlements (FR-J12's export block, FR-J15's credit toggle, FR-J7's plan-differentiated retention). E13's notifications table is written by E3, E7 and E12 first. The five pilot sections three epics gate on are never enumerated, so a wrong pick lets three epics exit green on a trivially easy subset. Adversarial adds an eighth: E4 must implement `{{t}}` against a catalog E7 defines.
Fix: Re-sequence or split the exits — move the compile clause out of E4 into a joint E4/E7 gate, move FR-C7 out of E3, name the five pilot sections, move the catalog format into E4, and create the notifications table in E1.

**[Buildability C3]** — §7.5 has no home for FR-J10's frozen theme name, and FR-J7's pruning destroys the only derivation (§7.5; FR-J10; FR-J7)
"The theme name freezes per site, at the project's first deploy to that site" is a fact about a `(project, site)` pair that §7.5 stores nowhere. The only derivation is the earliest `deploys` row for that pair — and FR-J7 prunes deploy artifacts to the last 10 (Pro) / 3 (Free). When pruning removes those rows the frozen name is lost, the next deploy re-derives a fresh one, and Ghost Admin accumulates exactly the orphaned themes FR-J10 promises to prevent, with rollback history split across two theme names. **The PRD's own data model contradicts the PRD's own guarantee.** (External-claims F6 attacks the same guarantee from the platform side.)
Fix: Add a `project_site_bindings(project_id, site_id, theme_name, frozen_at)` table, exempt from pruning.

**[Buildability C5]** — NFR-3 specifies the canvas sanitizer as a three-item denylist while §7.3 makes it the sole isolation mechanism (NFR-3; §7.3)
NFR-3 requires "script, iframe, and event-handler stripping" — exactly three categories. Unnamed: `<object>`, `<embed>`, `<base>`, `javascript:` and `data:` hrefs, `<svg>` with inline handlers, `<form>` actions, CSS `expression()`, `<meta http-equiv>`. Implementing NFR-3 literally ships an XSS into the same-origin canvas §7.3 mandates. A denylist stated as the requirement is a defect in the spec, not just an omission. Compounding it, §7.3's same-origin mandate rests on a false premise — it asserts rect measurement and contenteditable *require* same-origin, and they do not (a cross-origin iframe can measure its own rects, `postMessage` them out, and host its own contenteditable). The PRD forecloses the safer design on a factual error and then under-specifies the sanitizer it substituted. No library is named; no XSS corpus is specified.
Fix: Restate NFR-3 as an allowlist (element + attribute + URL-scheme, named library and config), require an OWASP payload corpus as a test artifact, and correct or drop §7.3's justification so the boundary decision can be re-opened on its real merits.

**[Buildability C7]** — NFR-6(c) golden fidelity, the test underwriting "100% WYSIWYG", has undefined normalization and a permanent structural divergence (NFR-6(c); FR-H5; FR-J5)
"DOM-normalized diff" is defined nowhere — whitespace, attribute order, editor-mode data attributes, `{{ghost_head}}` output, Ghost's injected members script, comment nodes are all undecided. And one divergence is structural and permanent: FR-H5 specifies the shim's `{{img_url}}` as "URL pass-through / asset resolution" while live Ghost emits `/content/images/size/w600/…` with a full `srcset`. **Image URLs will always differ.** If the normalizer strips them the test can never catch a real `img_url` bug — and FR-J5's `srcset`/WebP/lazy-loading requirements sit entirely inside that blind spot.
Fix: Enumerate the legal normalizations in NFR-6(c), and either make the shim emit Ghost-shaped image URLs or add a separate explicit image-URL conformance test.

**[Buildability C8]** — Inflozo's gscan and each target Ghost's bundled gscan are different programs at different versions, with no version policy (FR-J6; §4 T1–T3; §7.6)
FR-J6 runs gscan server-side inside Inflozo at one pinned version; each target Ghost validates the upload with its own bundled gscan, and T1 (6.x), T3 (5.x) and T2 (Ghost(Pro)) carry three different versions. **A theme passing Inflozo's gate can be rejected by the target's gate on upload** — the exact failure FR-J8 tries to prevent, and the direct opposite of FR-J6's promise. Separately, a gscan bump can turn the entire shipped library red and block every user's deploy simultaneously — a live-availability risk. Neither is addressed; §7.6's verify list omits gscan entirely.
Fix: State the version policy (pin; upgrade only behind a library release with a full re-run) and the alignment rule (Inflozo's pinned version ≥ the newest bundled version across supported targets, or the gate reports which targets it can guarantee). Add gscan's current warning set to §7.6, re-run before E7 exit.

**[Buildability C10 + Adversarial H6]** — FR-C5's Compatibility Watch has zero substrate anywhere in the document (FR-C5; FR-G3; §7.5 `deploys`; Appendix F)
The daily check "compares each connected site's Ghost version against **the library's compatibility data**" and notifies "when a Ghost release affects **something the site's deployed theme uses**." Neither input exists: FR-G3's registry entry format has no compatibility field and no FR says who authors compatibility data or when; and "what the deployed theme uses" needs a per-deploy variant manifest, which `deploys` does not carry, so the only route is unzipping the stored artifact — specified nowhere. Meanwhile Appendix F names this watch as one of three retention levers offsetting the modeled churn spike, so a load-bearing business mechanism rests on a feature with no inputs — and on a permanent hand-maintained editorial job for a solo founder that Appendix F, which counts only servers, never costs. The buildability architect could not design it at all.
Fix: Add `ghostCompat: { minVersion, helpers[], deprecatedAt? }` to FR-G3 and a `variant_manifest jsonb` column to `deploys`; state that compatibility data is authored per Ghost release as part of the FR-J14 cadence — or cut the feature and remove it from Appendix F's retention levers.

### High (41)

**[Rubric · Done-ness clarity]** — 219 of 487 variants (16 categories) declare no control set (`sections-inventory.md` A17–A24, A26–A33; vs Appendix A, FR-G3, FR-F3)
A1–A16 each declare `Content:` and `Controls:`. A17–A24 and A26–A33 declare neither (A22 content only; A25 and A34 controls in prose). A17's "Data group per FR-H2" is a legitimate external source but appears on A17 alone, does not extend to A20 or A21, and does nothing for A24, A26, A28–A33. The schemas demonstrably exist somewhere — the Synthesis Defaults specify A24 #1's hidden meta row and A29 #1's built-in tag accent, controls those categories never declare. FR-G3 requires `contentSchema, controlSchema, quickControls[]` per variant; FR-F3 requires 3–5 Quick Controls and a ≈15-control cap. This lands on the deliverable §4 declares non-de-scopeable and on the category the inventory calls "a flagship differentiator" (A32). E9–E11's Dev agent invents product surface with no PRD authority, on 45% of the library.
Fix: Extend the A1–A16 pattern through A17–A34 — one `Content:` line (or an explicit "post-bound per Appendix B / FR-H2" pointer) and one `Controls:` line per category. Mechanical, not creative: the Synthesis Defaults and the variant descriptors already imply most of it.

**[Rubric · Downstream usability + Buildability C9]** — §8's epics leave FR-B, FR-P and FR-D18 unowned (§8 E1–E15)
Across fifteen epics §8 cites exactly five FR IDs. FR-B1–B6 — project cards with auto-captured thumbnails and deploy-status chips, four creation paths, delete-warning semantics, plan caps at creation, the connected-sites strip, quota meter and changelog popover — reduce to E1's phrase "dashboard skeleton", whose cut line is itself undefined. FR-P1–P3 (five transactional emails plus two owner-relay flows) appear in no epic at all; Resend is in §7.1's stack and nowhere in the sequencing. FR-D18, the edit lock, is absent from E5 even though E7's deploy and export require it — a cross-device data-loss mechanism with a bespoke protocol in AD2, owned by nobody. §8's preamble is a backstop, but an SM expanding epics in order produces no dashboard stories, no email stories and no lock stories. Buildability grepped §8 for every FR id and reached the identical three blocks.
Fix: Add FR ranges to each epic line (E1 … FR-A1, FR-B1–B6; E5 … FR-D1–D18; and a small E5b or an explicit line in E12/E15 owning FR-P1–P3), so epic membership is checkable rather than inferred.

**[Buildability C9/S14]** — NFR-8's GDPR export has no FR, no epic and no story (NFR-8; §5; §8)
NFR-8 requires "GDPR export + delete". FR-A5 specifies deletion in detail. **No FR anywhere specifies export** — not its format, scope, delivery or latency — and §8 assigns it to no epic. A compliance obligation with zero requirement substrate.
Fix: Add an FR (format, scope, delivery channel, latency) and assign it to an epic, or state explicitly that Supabase's own export tooling discharges it and name that as the mechanism.

**[Rubric · Downstream usability]** — The UX delegation's mandated floor omits the flows the PRD itself calls designed (header sentence; FR-J13, FR-D18, FR-I4, FR-J14, FR-C2)
The header names a floor: connect → first deploy, blank-canvas build, Free-plan ship, downgrade recovery. Those four are the happy paths. Meanwhile FR-J13 instructs a UX workflow directly — "the degraded path is a **designed flow, not a warning toast**" — and that flow is on none of the four. Nor are FR-D18's three-party lock choreography, FR-I4's "one more step" card and persistent "Routes unverified" state, FR-J14's mandatory library-update confirm, or FR-C2's Preview-only explanation and clearing conditions. These are the five highest-friction moments in the product and each already has named UI states in the FR text; because the delegation is the only journey authority, nothing downstream notices. External-claims F1 raises the stakes: FR-J13's degraded path is not a fallback at all — it is first-run UX for every user.
Fix: Extend the header's minimum list to name these as required *flows* (distinct from journeys), or add a one-line "Flows delegated to bmad-ux" list next to §4 with their FR anchors.

**[Rubric · Decision-readiness + Adversarial H11 + Buildability C6]** — G1, G2 and NFR-1 set p75 targets in a product that forbids the telemetry to compute them (§1.3 G1/G2; NFR-1; §4 DoD)
G1 "< 10 minutes (p75) end-to-end … including creating the Custom Integration in Ghost Admin" and G2 "< 15 minutes (p75)" are the only goals with a percentile and no measurement binding, and §1.3 forecloses the mechanism four lines later: "No in-app analytics or telemetry requirement exists in v1." That carve-out names G8–G10 and pointedly excludes G1/G2 — precisely the two that need per-user timing across a funnel, one of whose steps happens inside Ghost Admin, in another tab, on a third party's product. NFR-1's "editor TTI < 3 s (p75, warm)" has the same problem, and §4's pre-launch testing runs on production with no users, so no distribution exists before launch either. §4's DoD omits G1/G2 entirely. QA cannot write a pass/fail test for any of the three. (Rubric rated medium; buildability rated critical; merged at high.)
Fix: Redefine G1/G2/NFR-1 as moderated usability-test targets with a stated n ("8 first-time users, timed by the observer, on the NFR-1 reference environment, pre-launch") — or add the two funnel timestamps as the sole telemetry exception.

**[Regression F-1]** — The takeover fix's journal-clearing rule destroys FR-D9's persist-undo-across-reloads promise (FR-D9; FR-D10; FR-D18; AD1)
FR-D9 claims the undo stack "persists locally across reloads and sessions … even after a reload" and, in the same paragraph, that "on **any** hydrate from the authoritative cloud snapshot (lock acquisition or takeover) the local undo journal is **cleared**." FR-D10 fixes the trigger: "on **every** lock acquisition the cloud snapshot is authoritative." A reload ends the editing context and opens a new one, therefore re-acquires the lock, therefore hydrates, therefore clears — on every ordinary refresh, same device, no second editor anywhere. Undo-after-reload is dead as written, contradicting a standing owner decision; the H8 triage only required clearing on *takeover*. The adversarial pass read the same clause as a clean fix, which is itself evidence of how easy the misread is.
Fix: Scope the clearing to hydrates that *supersede* the local doc — takeover, and any lock acquisition where the cloud snapshot's revision differs from the local doc's base revision. Update FR-D9, FR-D10 and AD1 together.

**[External-claims F3]** — "No detection API exists" is false (FR-C2; FR-C5; §7.6; Appendix I)
`GET /ghost/api/admin/config/` is declared `permissions: false`, is in the integration allowlist (`config: ['GET']`), and returns `hostSettings` — which on Ghost(Pro) carries the host limit block including `customThemes`. Absence of `hostSettings` (self-hosted) means unlimited. The PRD asserts the opposite three times. This turns FR-C2's "ask the user which plan the site is on" — friction sitting directly inside G1's 10-minute budget — into an automatic capability probe, and removes the need for the Manage-keys plan field that regression F-4 and adversarial M2 both flag as missing.
Fix: FR-C2 reads `hostSettings.limits` for a `customThemes` limit and marks Preview-only automatically; because the shape is undocumented and host-controlled this is a **probe with a fallback** to asking the user, with the deploy error remaining authoritative. Update §7.6's risk row, Appendix I's gloss, and add the `hostSettings.limits` shape to the verify list.

**[External-claims F4]** — Connect-time Admin key validation validates nothing (FR-C2)
`GET /ghost/api/admin/site/` is mounted on `publicAdminApi`, whose middleware chain contains **no authentication step** (`[cors, urlRedirects, prettyUrls, tokenPermissionCheck]`). A request with a malformed, revoked or fabricated Admin key returns 200. FR-C2's validation passes any string the user pastes, and the failure surfaces later at first deploy as "Ghost said no" — exactly the experience FR-C2 exists to prevent.
Fix: Mint the Admin JWT and call an **authenticated** endpoint — `GET /config/`, which proves the key *and* returns `hostSettings` for plan detection (F3) and `version`. Note explicitly that `GET /site/` is public and must not be used to validate a key.

**[External-claims F5 + Rubric · Done-ness + Buildability S11]** — routes.yaml: the automation hedge is impossible and the verification pessimism is unnecessary (FR-I4)
Both halves of FR-I4 are wrong, in opposite directions. **Upload:** `POST /settings/routes/yaml` requires `setting: edit`; integrations get `settings: ['GET']`. "Where the connected Ghost version is verified to accept the community-known internal routes endpoint, Inflozo may attempt automated upload first" describes a capability that exists on no version, and keeping it invites E7 to build and test a path that always 403s. (Buildability could not decompose that clause anyway: "verified by whom, when, stored where?") **Verification:** `GET /settings/routes/yaml` needs only `setting: browse` and *is* allowlisted — the live routes.yaml is directly readable, so "Inflozo cannot observe whether the Labs upload was completed" is false, and the "representative route URL" probe (whose two undefined terms the rubric also flagged) plus the persistent "Routes unverified" state are a weaker substitute for a byte comparison.
Fix: Rewrite FR-I4 — the guided "one more step" card is the only upload path on every version and host; verification is authoritative, not inferred: read the live `routes.yaml` and compare byte-for-byte with the compiled routes, resurfacing the card whenever they differ (route removals, a routeless project deploying after a routed one, rollbacks) and clearing the moment they match. No "unverified" limbo state is needed, and FR-C5's daily check gains routes-drift detection for free.

**[External-claims F6]** — Theme-name collision cannot be detected, and Ghost silently overwrites (FR-J10)
`GET /themes/` is blocked for integrations, so Inflozo cannot enumerate a site's installed themes, and Ghost's `setFromZip` **overwrites** a theme whose name matches (signalled only by an `X-Cache-Invalidate` header). FR-J10's promise — "a collision at first deploy to a site auto-resolves with a slug suffix … never overwriting another project's deployed theme" — has no API to stand on. Exposure is small (two Inflozo projects with the same slug on one site, or a pre-existing theme literally named `inflozo-{slug}`), but the sentence claims a guarantee.
Fix: Scope the claim to Inflozo's own records — Inflozo tracks the frozen name per site and suffixes on its own collisions; a collision with a theme Inflozo did not deploy cannot be detected in advance, the `inflozo-` prefix makes it vanishingly unlikely, and the first-deploy confirmation names the theme that will be created.

**[External-claims F7]** — Competitive claims about Fantasma are unsourced and one is wrong (§1.5; FR-N1/N3)
Fantasma Pro ships "Publish to Ghost" via an Admin API key plus connected-site preview. Describing it as "a solid build→export pipeline" is inaccurate and quietly removes deployment from Inflozo's differentiator list. The remaining shortcomings — no membership/monetization sections, no versioning/rollback, no image optimization, no gscan/perf story, "one Source-derived aesthetic (a known user complaint)" — appear nowhere in Fantasma's public material either way, and §1.5 states them flatly while they carry the $15/mo-vs-$99/yr justification, so they will end up on the marketing site as factual comparative claims about a named competitor. Confirmed as stated: $99/yr, "155+ presets", form-based sidebar editing.
Fix: Rewrite §1.5 to what is verifiable, dated ("As of August 2026 its public product material describes…"), and add a note that any competitor claim reused on the marketing site must be re-verified at publish time and dated.

**[External-claims F8]** — Dodo's event vocabulary does not match FR-L2's state machine (FR-L2; §7.6)
FR-L2 names "subscription activated / renewed / payment failed / cancelled". Dodo documents `subscription.active`, `.updated`, `.on_hold`, `.failed`, `.renewed`, plus `payment.succeeded` / `.failed`. There is **no documented `subscription.cancelled`**, and Inflozo's `pro_past_due` corresponds to Dodo's `on_hold`, whose dunning/grace timing is Dodo-controlled and may not equal Inflozo's 7-day grace. (Webhook idempotency and HMAC-SHA256 verification are confirmed.)
Fix: Map states to Dodo's actual event names, detect cancellation from `subscription.updated` plus a direct subscription read, and state that the 7-day grace is *Inflozo's* window, reconciled against Dodo's on-hold state rather than assumed to match. Add "confirm the full Dodo event catalogue" to §7.6.

**[Adversarial H1]** — FR-Q6's locale-file scheme collides with itself for English sites (FR-Q6; §7.4)
FR-Q6 describes two files: "the **site-language file** carries the user's labels … and **`en.json` always ships so every key resolves**." For an English Ghost site — the majority case and every §4 test target — those are the same file. Does `en.json` carry the overrides (so the "always resolves" fallback no longer holds defaults) or the defaults (so the user's overrides compile into a file Ghost never loads)? A user renames "Older posts" and gets one or the other depending on which agent built the compiler. (The adversarial pass also argued the stated Ghost fallback chain is wrong; external-claims verified `{{t}}` + `locales/` against `theme-i18n.js` and marks that half CONFIRMED. The collision stands regardless.)
Fix: One rule — the theme ships exactly one locale file, named for the project's language, containing defaults overwritten by the user's overrides, plus `en.json` identical to it when the language is English.

**[Adversarial H2]** — Chrome strings generated in JS cannot go through `{{t}}`, making FR-Q6's enforcement rule unsatisfiable (FR-Q6; FR-J4; Appendix A §A34 #6–10, §A14)
FR-J4 bundles vanilla JS behavior modules into `assets/js/main.js` — a static file Ghost never runs through Handlebars. A34 #8 updates a remaining-count badge in JS; #9–10 render loading and end-of-feed states in JS; the lightbox renders "3 of 12" counters in JS. `{{t}}` cannot reach any of them, so compile validation either fails those variants forever or silently exempts JS — at which point "every chrome string" is false and a German site gets German pagination above an English "Loading…".
Fix: Emit resolved catalog strings for JS-consumed keys as `data-i18n-*` attributes on each module's mount element, and scope FR-Q6's `{{t}}`-only rule to `.hbs` output explicitly.

**[Adversarial H3]** — Translation overrides sit outside FR-J14's backward-compatibility contract, so monthly drops silently revert them (FR-Q6; FR-J14; FR-C5)
FR-J14's contract covers variants ("never deleted, only superseded") and section content/control schemas ("append-only or ship a migration map"). The string catalog is neither — it is registry data FR-Q6 invented after that contract was written. A German user overrides 40 strings; month 2's drop rewords a key as a copy improvement; the override is keyed to the old string; the confirm step lists *section* changes and says nothing; the site reverts to English. Nothing warns, nothing migrates, and the user's first signal is a visitor complaint.
Fix: Extend FR-J14's contract to the catalog — keys are append-only and never reworded in place; a superseded key ships a migration map carrying the override forward.

**[Adversarial H4]** — Appendix B still claims the shim covers "exactly this surface", and it has no `{{t}}`, no catalog, no locales (Appendix B; FR-H5; FR-Q6; NFR-6(c))
This is the v1.0 review's C1/H6 defect, reintroduced by v2.3. Appendix B is normative and states "the helper shim must cover **exactly this surface**". FR-H5 was expanded to include `{{t}}`; Appendix B was not. An architect scoping the shim from the appendix that claims exhaustiveness builds no `{{t}}`, and every chrome string on canvas renders blank or raw — then golden fidelity compares a canvas missing all pagination/error/member-form labels against live Ghost output that has them, and fails on every fixture. Or the shim quietly grows past its "exactly" contract, which is the other half of the original finding.
Fix: Add a `{{t}}` / string-catalog / `locales/` block to Appendix B, or delete the word "exactly" and point the shim's contract at FR-H5 alone.

**[Adversarial H5]** — FR-Q6 ships "any language" while Appendix G defers RTL, and nothing stops the user building the broken thing (FR-Q6; Appendix G; FR-G4; G4)
Appendix G says "RTL layout (v1 generated themes are LTR). Translation itself ships in v1." FR-Q6 then offers override of "any label, in any language" with a user-selectable language code. An Arabic or Hebrew publisher translates all 40 strings, sets `ar`, deploys — Arabic text in a hard-LTR layout with left-aligned headings, LTR pagination arrows and mirrored-wrong nav. No warning fires at the selector, at compile, or in pre-deploy checks, and FR-G4's WCAG AA claim and G4's Accessibility ≥ 95 are both false for that output, reached entirely through supported UI.
Fix: Maintain an RTL language-code list; selecting one (or linking a site whose `@site.locale` is one) shows a blocking-acknowledgement notice, recorded as a pre-deploy warning.

**[Adversarial H7]** — The redeploy FR-C5 recommends is unreachable for exactly the users who need it (FR-C5; FR-J14; FR-D18; FR-L3)
A Free user with three Pro sections on canvas (legal — FR-L3's open canvas) is never told at all, because the watch is Pro-only. A Pro user who *is* told hits three gates in sequence: FR-D18's edit lock (their other laptop holds it; taking over destroys that session's unsynced edits), FR-J14's mandatory confirm bundling every library change since their last deploy, and — if they have since lapsed to Free with Pro sections placed — FR-L3 blocking the deploy outright. The notification says "redeploy to stay compatible"; the product can make that impossible, and FR-C5 acknowledges none of it.
Fix: Make compatibility redeploys a first-class exempt path — no library-update confirm bundling, no edit-lock requirement (the working doc is unchanged), available on Free; and extend the watch to Free connections, since the risk is plan-independent.

**[Adversarial H8]** — FR-L1's yearly default breaks Appendix F's arithmetic and G7's headline number (FR-L1; Appendix F; G7)
Appendix F computes everything from the monthly price: net ≈ $13.70–13.93 on $15, break-even ≈ 8–9, 200 Pro ⇒ ≈ $2,700/mo net. FR-L1 then pre-selects yearly. The same fee schedule on $150: 4% ($6.00) + 0.5% ($0.75) + $0.40 = $142.85 domestic, $140.60 international — **$11.72–11.90 per month**, not $13.70–13.93. Against the appendix's own $105–125/mo fixed cost, break-even becomes **9–11**, and the 200-Pro model yields ≈ **$2,360/mo** — a 13% overstatement of the number the owner plans runway against. The appendix cites FR-L1 as a retention lever in the very next paragraph and never re-ran its own math. (Compounds with regression F-6's uncosted Test/Live doubling and buildability H8's thumbnail cost — three independent errors moving the same number the same way.)
Fix: State a plan-mix assumption (e.g. 70% yearly), recompute blended net/mo and break-even from it, and update G7's "~8–9".

**[Adversarial H9 + Buildability H7]** — FR-L2's entitlement machine has no refund, chargeback or plan-switch transition (FR-L2; FR-L1; FR-N1; G9)
FR-L2 enumerates a "full transition table" over four events: activated, renewed, payment failed, cancelled. **Refund and chargeback are none of these**, and with FR-L1 defaulting to $150/yr the exposure is 10×: pay $150, create 25 projects, export 25 white-labeled themes, request a refund on day 20. Dodo refunds; no specified case fires; `subscriptions.status` stays `pro_active` with `period_end` 345 days out. The same hole applies to chargebacks, where Inflozo also eats a $30 dispute fee. G9's counter-metric measures a failure mode the machine cannot respond to. Buildability found the same two gaps plus a third: a monthly Pro user switching to yearly produces a Dodo `subscription.updated` that maps to no defined transition either.
Fix: Add `pro_active → free` on refund and dispute-opened (immediate, not at period end), state the read-only-project consequence, and decide plan switching (support it, or state "cancel + resubscribe" for v1).

**[Adversarial H10]** — Annual auto-renewal ships with no renewal notice, and FR-P2 forbids adding one (FR-L1; FR-P1; FR-P2; G9; FR-N1)
FR-P1 defines "exactly five" transactional emails; FR-P2 forbids the category a renewal notice lives in ("No marketing, digest, or **nudge** emails in v1"). A user who bought the pre-selected yearly plan is charged $150 twelve months later with zero advance contact — the textbook generator of the disputes G9 caps at 2%, and advance notice for annual auto-renewal is statutory in several target markets (California ARL, various EU/UK consumer rules). Dodo as merchant of record may or may not send one; the PRD never says which party owns it, which is itself the defect.
Fix: Either state that Dodo sends the renewal reminder as MoR (verified, added to §7.6) or make it FR-P1 email #6 and carve it out of FR-P2.

**[Adversarial H12]** — A29/A30/A31 mix incompatible compile targets and binding contexts inside one Shuffle ring (Appendix A §A29/§A30/§A31; FR-D13; FR-D17; FR-I1)
A29 (14): #1 binds the *tag* object, #2 the *author* object — the Synthesis Defaults author noticed and hand-patched around it, then generalized nothing; a user on `author.hbs` presses `]` and lands on #3 Tag Cover, which binds a tag that does not exist in author context, so the archive header renders empty on the live site. A30 (15): signup, signin, account and magic-link variants each compile to a *different file*; shuffling the signup canvas to #11 produces a signup page showing account settings. A31 (10): #1–#5 target `error.hbs`, #10 targets `private.hbs`, #6/#7/#9 target custom page templates — shuffling changes which **file** the section compiles into. FR-D17 Site Remix does all of this at once, across every template, in one click, while promising "never-lose-content."
Fix: Add a `bindingContext` / `compileTarget` field to FR-G3's registry entry; FR-D13 and FR-D17 cycle only within variants sharing the placed instance's value, and the Section Picker filters on it.

**[Adversarial H13]** — A30's two Free variants are a signup and a signin page, so the members Account page has zero Free options (Appendix A §A30/§A29/§A31; FR-G2; FR-L3; FR-I1)
FR-G2 promises "at least 2 Free-tier variants per category so a Free user can ship a complete, good-looking site." A30's are #1 Signup Center Card and #2 Signin Minimal; every account-page variant is Pro. A Free user who designs `members/account.hbs` — a first-class canvas in FR-D6's switcher — has **no Free option at all**, and FR-L3's block sheet tells them to "swap each to a Free variant via Shuffle" when there is nothing to swap to. Their only remediation is deleting every section to return the template to untouched, which no FR tells them and the sheet does not offer. The same arithmetic trap sits in A29 and A31.
Fix: Restate FR-G2 as "at least 2 Free variants **per compile target / binding context** within a category", and re-tier A30 #11, A29 #7 and A31 #10 to [Free] (totals unchanged; 68 Free becomes 71).

**[Adversarial H14]** — FR-H2 was extended to tag/author archives but not to FR-I2 channels, so the same broken-pagination bug survives (FR-H2; FR-I2; FR-I5)
v2.3 correctly extended main-feed designation to "index, custom collections, and the tag and author archive templates." FR-I2 ships **channels** in v1 as a distinct routes.yaml construct, and Ghost paginates channels exactly like collections — but FR-H2's enumeration omits them and a channel is not a collection in routes.yaml. A channel at `/newsletter/` with a Post Grid gets a `{{#get}}`-driven feed with a fixed Count, so `/newsletter/page/2/` renders the identical twelve posts as page 1, indefinitely, indexable. That is exactly the duplicate-content failure FR-H2's SEO guard exists to prevent, reintroduced in the one paginated context the fix did not reach — and the guard does not fire either, because the template *has* a feed.
Fix: Add "and channels" to FR-H2's paginated-context list, plus a Synthesis-Defaults-style default designation when a channel template is created.

**[Adversarial H15]** — "Restoring the snapshot skips the gscan gate" does not help, because Ghost validates the upload itself (FR-J13; FR-J6; §1.4 #5; §7.6)
Skipping *Inflozo's* gate changes nothing: the restore is an Admin API theme **upload**, and Ghost runs its own gscan on upload and rejects themes with fatal errors. The realistic case is the exact one the snapshot exists for — an old Casper fork or a marketplace theme installed years ago, on a site since upgraded from Ghost 5 to 6. It ran fine as an already-installed theme; it will not survive re-upload under current validation. So the one-click restore fails with a Ghost error at the worst possible moment, and "restores exactly what previously ran" is a promise Inflozo does not control and never verified — while §7.6 covers the *download* endpoint and not the re-upload path.
Fix: Add "snapshot re-upload accepted by Ghost, including a theme with gscan errors" to §7.6, and specify the designed fallback when Ghost rejects it (offer the snapshot zip as a download plus Settings → Design guidance).

**[Adversarial H16]** — FR-J13's no-recapture rule keys on the theme *name*, while the signature is name **plus** marker (FR-J13; FR-J12; FR-J15)
FR-J13 defines the signature as "the `inflozo-*` name **plus** a `package.json` marker," then writes the protective rule against the name alone. A Pro user exports their theme, renames the zip's package name to `acme-blog` (Ghost takes the theme name from `package.json`), installs it manually, later connects that site and deploys. Inflozo sees `acme-blog`, concludes it is not an Inflozo theme, and captures it as the site's **pre-Inflozo snapshot** — so "restore my original site" now restores an Inflozo theme, the exact outcome the rule was written to prevent, reached through two supported features.
Fix: Key the no-recapture rule on the `package.json` marker, not the theme name — one clause, and it is the reason the marker exists.

**[Consistency HIGH-1]** — `private.hbs` has no design surface anywhere in the three files (FR-D6 vs FR-I1, §7.4, `sections-inventory.md` A31)
Three normative statements assume the user can *design* a Private Site Gate — FR-I1's conditional emit, §7.4's tree row, and A31 #10 itself, reinforced by the Synthesis Defaults' "NEVER synthesized … these exist only when the user designs them." But the only two surfaces that create designable canvases exclude it: FR-D6's switcher lists Home, Post, Page, Tag, Author, Members, 404 and custom templates — **no Private entry** — and FR-I3's Routes-Manager templates compile as `custom-{name}.hbs`. So `private.hbs` is never emitted, A31 #10 is placeable only on a wrong template, and FR-G1's "every listed variant is a launch deliverable" is violated by a variant that is structurally undeliverable; E11's exit gate for A31 and the render matrix for that variant are blocked too. Note the v2.1 fix M4 (add `private.hbs` as a conditional emit) *did* land in all three files — only the emit half was ever asked for.
Fix: FR-D6's switcher gains a conditional **Private** canvas (appearing when a Private Site Gate is placed, mirroring members templates), or FR-I1/A31 drop the `private.hbs` branch and route A31 #10 to a custom template.

**[Buildability H1]** — FR-I2's filter builder has no field→NQL mapping, and relative dates are not expressible in NQL at all (FR-I2)
The builder offers All/Any groups over tag, author, primary tag/author, featured, visibility, published date and has-feature-image → "compiled to NQL", and supplies none of the eight mappings. Two are genuinely hard: *published date* — Ghost NQL has no relative-date syntax, so "within the last 30 days" cannot compile to a static routes.yaml filter at all; *has-feature-image* → presumably `feature_image:-null`. If any mapping is wrong the generated routes.yaml silently returns the wrong posts on the user's live site, with no test surface. FR-I2 also requires client-side "filter syntax" validation — an NQL parser — which appears in no dependency list.
Fix: Add the eight mappings to FR-I2 or Appendix B, decide what "published date" means for a static file (fixed date, or drop the field), and name the NQL parser dependency.

**[Buildability H2]** — FR-Q6's "standard string catalog" does not exist — no keys, no defaults (FR-Q6; E7; E9–E11)
FR-Q6 requires every chrome string to live in "one standard string catalog in the section registry", consumed "exclusively via `{{t}}`", with "compile validation enforces this". It enumerates *categories* (pagination, load-more, member-form feedback, error-page copy, search placeholder, skip-link, lightbox/gallery labels, "Read more"-type labels) and **no keys and no English defaults**. "Every chrome string resolves from the catalog" is unwriteable as an AC, and the enforcement rule constrains all 487 variants, so the catalog must exist before the library is built.
Fix: Author the catalog (keys + English defaults) as a normative appendix or inventory section — the way the Synthesis Defaults were authored to close the v2.1 C2 gap.

**[Buildability H3]** — FR-J6's "human-readable mapping" of ~100 gscan rules does not exist (FR-J6; Appendix H)
The gate must map gscan output to friendly messages. gscan carries ~100 rules and there is no mapping table in any document; Appendix H gives the voice and one worked example. An SM cannot write "human-readable" as an AC, and a Dev must invent ~100 strings with no reviewer.
Fix: Supply the mapping for the rules the compiler can actually trip (a much smaller set, since Inflozo controls the output), or state the fallback verbatim format and scope the mapping to a named shortlist.

**[Buildability H4 + Adversarial M6]** — FR-J14's "nearest current variant" is undefined, the degradation clause contradicts its own contract, and the change summary has no substrate (FR-J14; §7.5 `deploys`)
"Nearest" is defined nowhere — by category, by structural similarity, by index? Get it wrong and users get arbitrary re-designs of live sites. Worse, the same paragraph says variants are "**never deleted**, only superseded (placed instances keep rendering)" and then that a section which "**no longer resolves**" degrades — a state the contract forbids, so one agent builds no degradation path (correctly) and another builds it plus the deletion case it implies. Separately the confirm step's "human-readable summary … naming the project's affected placed sections" needs a `library_version` on each deploy (no such column) and a machine-readable library changelog format (does not exist).
Fix: Define "nearest" or scope the clause to failed migrations and delete the rest; add `library_version` to `deploys`; specify the changelog format the confirm step consumes.

**[Buildability H5]** — The ~30 font pairings are never enumerated, and the subsetting strategy conflicts with FR-Q6's "any language" (FR-E1; FR-J3; Appendix D)
FR-E1 says "a curated pool of ~30 Google Fonts pairings"; Appendix D names 12, and the other ~18 appear nowhere. Weights per family and variable-vs-static are unstated, and both determine bundle size, `@font-face` emission and the NFR-2 Lighthouse outcome; there is no fixture for FR-E3's font-pairing UI. On subsetting: content-driven subsetting is actively wrong here (the theme renders posts written *after* deploy, which the compiler cannot see), so static latin + latin-ext subsets are the workable answer — and they collide head-on with FR-Q6's promise of translations "in any language", because a latin subset breaks Cyrillic, Greek and CJK.
Fix: Enumerate the pool (or reduce it to Appendix D's 12 and say so), state weights and variable-vs-static, name the subset ranges, and reconcile with FR-Q6 (e.g. non-latin languages get the full face, with a stated size consequence).

**[Buildability H6]** — FR-A5's restore-vs-Dodo-cancellation is undecided, and the unstated alternative bills a deleted user for 14 days (FR-A5; FR-L2; G9)
FR-A5 cancels the subscription at soft-delete and offers "Restore account" for 14 days, and says nothing about the subscription on restore. The alternative reading (defer cancellation to hard purge) bills a user for 14 days after they asked to be deleted — a direct hit on G9's <2% refund/dispute counter. The PRD makes no decision, so E2's deletion story cannot write its restore AC.
Fix: One clause in FR-A5 stating the subscription's state on soft-delete and on restore.

**[Buildability H8]** — FR-B1's thumbnail capture path is unstated, and the server-side reading invalidates Appendix F and G7 (FR-B1; §7.1; Appendix F; G7)
FR-B1 requires an "auto-captured canvas thumbnail". §7.1 lists "thumbnail capture" among the Vercel Node functions — implying server-side, which means running the whole section runtime headless (Playwright/Chromium on Vercel: large, slow, and absent from Appendix F's ≈$45/mo fixed-cost model). Client-side capture from the same-origin iframe is the cheap reading, but nothing states which. If server-side, a headless-browser service is required and Appendix F's unit economics — and G7's break-even claim — are wrong.
Fix: State the capture path in FR-B1 or §7.1; if server-side, cost it in Appendix F.

**[Buildability H9]** — NFR-3's CSP has no policy and collides with browser Handlebars' `new Function` (NFR-3; §7.1; §7.3)
"CSP on app and marketing" with no directives is trivially satisfiable and untestable. Worse, §7.1 mandates a Handlebars runtime in the browser and `Handlebars.compile()` builds templates via `new Function`, which a CSP without `'unsafe-eval'` blocks. So either the app ships `'unsafe-eval'` — gutting the CSP on the exact surface that renders user content — or all 487 variants are **precompiled** into a browser bundle per library release. Precompilation is compatible with FR-J14's single live library, so it works, but it is a real build-pipeline component and neither NFR-3 nor §7.3 confronts the conflict.
Fix: State the CSP directives, choose precompilation explicitly, and name the precompile step as a component of the library release pipeline.

**[Buildability H10]** — E1.S3 has no acceptance criterion; the referenced design artifacts self-label "not a spec" (§8 E1; `_bmad-output/planning-artifacts/design/`)
E1 says "design tokens/components per the design references". The directory contains a prompt for *producing* mockups and 20 `.dc.html` artboards, and the prompt's own Calibration text says *"Label every frame in this set 'Calibration reference — not a spec.' Nothing here overrides the PRD."* There is no token list, no component inventory, no type or spacing scale for the app chrome — no pass condition can be written, and E1 is the epic every subsequent UI story inherits from. (The pointer itself resolves; it is the authority that is missing, not the file.)
Fix: Produce a token list + component inventory for app chrome (the bmad-ux pass is the natural owner), or state that E1.S3's acceptance is "tokens extracted from the calibration artboards and reviewed by the owner" and accept the looseness deliberately.

**[Buildability H11]** — NFR-6(a) has no diff threshold and no baseline-churn policy across 8,766 screenshots (NFR-6(a); FR-G6)
487 × 3 packs × 2 modes × 3 viewports = 8,766 screenshots per run, and "passes" has no tolerance — pixel %? anti-aliasing? font-rendering variance across runners? Too tight and the gate is permanently red; too loose and it catches nothing. There is also no policy for baseline churn when a Style Pack or a shared primitive changes, which would invalidate all 8,766 at once.
Fix: State the diff threshold and the renderer/runner pinning, and state the baseline-regeneration policy — who approves a mass rebaseline, on what evidence.

**[Buildability H12 + Rubric · Done-ness]** — NFR-2's Lighthouse targets are environment-determined with no environment, and G4 and NFR-2 name two different measurement scopes (§1.3 G4; NFR-2; E15)
Generated themes run on *the user's* Ghost server: a theme scoring 92 on Ghost(Pro)'s CDN can score 70 on a $6 droplet with identical markup — TTFB alone decides it — so "Performance ≥ 90" has no truth value without a named host. On top of that, G4 measures "on library defaults and the 12 preset packs" while NFR-2 measures "on the fixture content set"; "fixture content set" appears once, is not in the Glossary, and is not obviously Orbit Weekly or the "fixture theme" of FR-H5/NFR-6(c). E15's "perf/a11y audits" inherits both ambiguities.
Fix: Pick one content basis and reference it from both (add it to Appendix I), and name the hosting environment the number is measured on — e.g. "T2 (Ghost(Pro) Publisher), cold cache, mobile emulation."

**[Buildability H13]** — NFR-5 has no tool, threshold or method, and "keyboard-complete editor" is architecturally hostile to §7.3 (NFR-5; §7.3)
"The app itself meets WCAG 2.1 AA (keyboard-complete editor including reorder via keyboard, focus management in overlays…)" names no tool, ruleset, or manual-audit checklist. Worse, a keyboard-complete editor over a canvas whose content lives in an iframe, whose editing chrome sits *outside* that iframe, and whose inline editing is contenteditable *inside* it, has a focus-order problem the architecture creates and no requirement addresses.
Fix: Name the tool and ruleset and the manual-audit checklist, and add one paragraph to §7.3 on the focus model across the iframe boundary.

**[Buildability H14]** — T4's Preview-only clear-path is untestable on the only target that exercises it (§4 T4; FR-C2; Appendix F)
T4 (Ghost(Pro) Starter) exists solely to verify the Preview-only path, and FR-C2 says the flag "clears on the first successful deploy or when the user updates the site's plan via Manage keys". On T4 a successful deploy can never happen — that is the point of T4 — so the clear-on-deploy branch is untestable on the only target that exercises the feature. Testing it needs a fifth configuration §4 does not provide and Appendix F does not budget. (External-claims F3's automatic probe would give the flag a second, testable clearing path.)
Fix: Add a temporary fifth configuration to §4 and budget it, or state that the clear-on-deploy branch is verified on T2 by simulating the Starter error response.

**[Buildability H15]** — `{{#get}}` is async, Handlebars is synchronous, and resolving it silently constrains what the library may express (FR-H5; Appendix A §A27; Appendix B; NFR-6(c))
To render at all, the canvas runtime must pre-resolve every `{{#get}}` — parse the AST, extract invocations, fetch, render against a cache. But `{{#get}}` params can reference the *current render context* (A27 Related Posts: `filter="tag:{{primary_tag.slug}}"`), known only during render, so a pure pre-pass fails. The workable restriction — filters may reference only the template-level context — silently constrains the section library, and E9–E11 have not been told. Worse, A27's "`{{#get}}` by primary tag with fallback to latest" is a conditional second query based on the first query's result count: two sequential round trips, expressed on live Ghost as nested `{{#get}}` with an `{{#if}}`, which the canvas must emulate identically for NFR-6(c) to pass.
Fix: State the constraint in FR-H5 or Appendix B (and therefore in FR-G3's registry contract), before 487 variants are written against it.

### Medium (50)

**[Rubric · Decision-readiness]** — Appendix F's modeled mix contradicts G9 by ~5× (Appendix F "Economics basis"; G9; G10)
"Modeled 1,000 Free + 200 Pro: ≈ $110–160/mo infra vs ≈ **$2,700/mo net**" implies a 16.7% paid share, against G9's "≥ 3% free→Pro within 90 days" with G10's "<5% monthly churn". At the PRD's own targets the steady-state paid share lands nowhere near 200/1200. The infra-cost conclusion survives (it is dominated by fixed cost), but "$2,700/mo net" is the sentence a founder re-reads when deciding to build this.
Fix: Re-model at G9's rate, or relabel the mix explicitly as a capacity-headroom scenario rather than a revenue projection.

**[Rubric · Strategic coherence]** — Nothing validates the thesis's headline claim; the play loop is ungated (§1.2; §1.3; §4 DoD; FR-D17)
§1.2 stakes the product on being "extremely easy, genuinely fun, and the most beautiful UI/UX in the Ghost ecosystem — closer to playing with a well-made toy", and §1.4 #2 says "Choosing a design becomes play." G3–G6 measure output correctness and editor responsiveness; G8–G10 measure business outcomes; none measures the play loop. FR-D17 Site Remix — the purest expression of the claim, with "never-lose-content" as a hard requirement — appears in no goal, no NFR, no DoD line, and reaches §8 only inside E5's list. The most differentiated feature is the least gated, and adversarial H12 shows a gate would have caught a real defect.
Fix: Give the play loop one gate — a Site Remix / Variant Shuffle acceptance in E5's exit (content preservation across N shuffles and a full re-roll on the 40-section fixture, zero prop loss). Testable without telemetry.

**[Rubric · Scope honesty]** — The market/behavioral assumption class carries no source and no verification trigger (§1.3 G8–G10; §1.5; Appendix F)
§7.6 handles engineering-world facts impeccably — six named items, each tied to its dependent FR. Nothing does the same for the numbers that decide whether the business is worth building: "≥ 30% of signups reach first deploy within 7 days", "≥ 3% free→Pro", "churn < 5%", §1.5's "~155 presets" and "a known user complaint", and Appendix F's modeled mix are all presented with the same typographic confidence as the verified facts, with no attribution and no re-check. External-claims F7/F13/F14 confirm the risk is live: one §1.5 claim is outright wrong, one stale, one unprovable.
Fix: Add a second block under §7.6 — "Assumed, unvalidated" — listing the five or six behavioral/market figures with whatever basis exists (comparable-product benchmark, competitor page snapshot date, or "founder estimate").

**[Rubric · Downstream usability]** — "Read-only" names two different editor states with different remedies (FR-D18; FR-L3; Appendix I)
FR-D18's read-only means another session holds the edit lock, remedied by "Request editing" or takeover. FR-L3's read-only means the account is over its Free project cap, remedied by upgrading or picking a different project. Both render the same editor in a non-editing state; the Glossary defines "Edit lock" but not "read-only", and no passage distinguishes them. A UX agent designing the banner, or a Dev implementing the guard, ships one message for two situations.
Fix: Name them distinctly ("locked elsewhere" vs "plan-locked") and add both to Appendix I.

**[Regression F-2a]** — The Synthesis Defaults exist, but no compiler-side requirement invokes them (`sections-inventory.md` § Synthesis Defaults; FR-I1; FR-J1)
The tables close the v2.1 C2 gap as a *specification*; what is missing is the call site. FR-J1 defines the compiler's input as "project doc (per-template ordered section instances…)" — and an untouched template has no doc at all, so a developer implementing FR-J1 literally emits nothing for those templates. Only FR-D6, a Template-switcher requirement in the Editor Core domain, mentions synthesis, and it is the last place a compiler implementer looks. FR-I1, which enumerates exactly the files that must always be emitted, is silent on where their content comes from.
Fix: One clause in FR-J1 ("templates with no doc are synthesized per `sections-inventory.md` § Synthesis Defaults before assembly") and one in FR-I1.

**[Regression F-2b + Adversarial M1 + Consistency MED-1]** — FR-D6 asserts unqualified synthesis; its own normative companion excludes members, private and custom (FR-D6 vs `sections-inventory.md` §1; FR-I1; FR-O1; FR-I4)
FR-D6 lists "Home, Post, Page, Tag archive, Author archive, **Members (Signup / Signin / Account)**, 404, plus any custom templates" and then says untouched templates compile from the Synthesis Defaults. The inventory says the exact opposite for three of those: "**NEVER synthesized:** `members/signup.hbs` / `signin.hbs` / `account.hbs` … `custom-{name}.hbs`". FR-I1 and FR-O1 agree with the inventory, so FR-D6 is the outlier — and it is the FR an agent reads first. The consistency pass traces the chain: a literal build emits members templates → FR-I1 auto-adds their routes → FR-I4 forces the manual Ghost Labs step on **every first deploy**, re-breaking the exact promise the v2.1 H1 fix created ("the confetti moment stays uninterrupted"). Found by three reviewers independently.
Fix: Narrow FR-D6's sentence to the six synthesizable templates, or name the exclusion inline.

**[Regression F-3]** — Signature-gated restore contradicts the unhedged "safe installs" pillar in three other places (FR-J13 vs §1.4 #5, FR-L3, Appendix I)
FR-J13 now hedges twice — capture depends on an "internal, undocumented" capability, and restore is guaranteed "only for Inflozo-signed themes", with third-party themes archived "on a best-effort basis". Note what that means: the pre-Inflozo snapshot is *by definition* the third-party theme that was active before Inflozo arrived, so the one artifact the snapshot exists to protect is the one whose restore is explicitly not guaranteed. Three passages still sell it flat: §1.4 #5 ("a snapshot of the site's previous theme … and one-click rollback", presented as a brand promise), FR-L3 ("snapshot restore … remain available throughout"), and Appendix I (capture asserted unconditionally, where FR-J13 says it may not happen at all). External-claims F1 settles what the hedge was hedging: capture is impossible, not uncertain.
Fix: Rewrite all four locations against the verified capability (F1's wording), not against the hedge.

**[Regression F-4 + Adversarial M2]** — FR-C2 clears Preview-only via a Manage-keys field FR-C8 does not have (FR-C2 vs FR-C8)
"The flag clears on the first successful deploy or **when the user updates the site's plan via Manage keys (FR-C8)**." FR-C8's flow is fully enumerated — re-paste Admin/Content keys, edit the site URL in place, test the connection, save — with no plan field. The data model backs FR-C2's side (`sites.capability` exists in §7.5), so this is a missing UI affordance, not a missing concept, and it is the *only* non-deploy escape from Preview-only.
Fix: Add "declared Ghost(Pro) plan (clears or sets Preview-only)" to FR-C8's field list — or adopt external-claims F3's automatic probe and delete the declaration step entirely.

**[Regression F-5 + Adversarial M3]** — Appendix F, declared the sole definition of Free/Pro gating, is missing rows for both features v2.2/v2.3 added (FR-C5; FR-Q6 vs Appendix F)
§5's preamble is explicit: "Free/Pro gating is defined in Appendix F." v2.3 introduced "Compatibility watch (**Pro**)" and never added the row; FR-Q6's Translations surface has no row either, so whether a Free user gets it is undefined at the exact moment adversarial C2 makes that gate matter. An SM building the entitlements matrix from Appendix F, as §5 instructs, gates neither. Substantively, the compatibility gate means Free users are not told when a Ghost release breaks their deployed theme — awkward beside §1.4 #5's unqualified "an Inflozo theme never breaks your site."
Fix: Add "Compatibility watch" (— / ✓) and "Theme Settings · Translations" rows. If the brand promise is to stand, consider making the breakage *notice* Free-visible while keeping the richer watch Pro.

**[Regression F-6]** — The post-launch two-infra-set decision was never costed; break-even ≈ 8–9 is stale (§4 post-launch topology vs Appendix F, G7)
§4 mandates a fresh Live infrastructure set at go-live while the pre-launch stack becomes the permanent Test environment. Appendix F still models one: "core fixed ≈ $45/mo … plus **launch-mandated** test infrastructure ≈ $60–80/mo → total ≈ $105–125/mo … break-even ≈ 8–9 Pro subscribers." The word "launch-mandated" signals the author believed the test infra was temporary — the posture the M15 fix reversed. From the first customer onward the standing cost is roughly two app stacks plus the retained Ghost fleet, ≈ $150–170/mo, pushing break-even to ≈ **11–13**. The stale figure is quoted in two places and G7 is a measurable goal.
Fix: Re-run Appendix F with Test as permanent, restate break-even, update G7's parenthetical. (Org-level Supabase/Vercel pricing may soften the doubling — check rather than assume 2×.)

**[External-claims F9]** — Ghost 5.x reached end of life in January 2026 (§4 T3; NFR-7; FR-C2; Appendix F)
Ghost's LTS policy puts 5.x support through January 2026; 6.x is the only supported line. The PRD mandates a permanent self-hosted 5.x droplet as a **deployable** target, serialized in CI, and Appendix F pays for it. Supporting 5.x *connections* is defensible — real users lag. Maintaining a 5.x deploy target and CI lane as a launch blocker is not obviously worth it.
Fix: Keep FR-C2's acceptance of 5.x; reframe T3 as "retained as a compatibility target for lagging sites, and the first candidate to drop under schedule pressure — 5.x reached EOL in January 2026", and note the EOL in NFR-7 so the Architect does not treat 5.x parity as permanent.

**[External-claims F10]** — Theme zip size has limits and the PRD has no budget (FR-J3; FR-K5; §7.4)
Ghost rejects oversized theme uploads with `COMPRESSED_TOO_LARGE`, `ENTRY_TOO_LARGE` and `TOTAL_TOO_LARGE` (host-configured byte values; Ghost(Pro) Starter is separately documented at a 5 MB upload limit). Inflozo bundles self-hosted woff2 subsets, all referenced images at up to 2400 px, per-section CSS and pre-generated responsive sizes — a media-heavy project can plausibly exceed a few MB, and nothing budgets for it.
Fix: FR-J3 enforces a theme-size budget surfaced pre-deploy (total zip, per-entry, uncompressed total); probe the real host limits on the §4 targets and set the budget below the lowest observed. Add to §7.6.

**[External-claims F11]** — Content API request volume is unbounded by the PRD (P5; FR-H4; NFR-1)
Ghost documents the Content API as cacheable and unmetered and open CORS makes the client-side design work — but Ghost ships a `content_api_key` brute-force limiter, and Ghost(Pro) sites sit behind an edge the PRD does not model, while the editor fans out reads across canvas, Section Picker previews and Link Picker search.
Fix: FR-H4 — "client-side Content API reads are batched and de-duplicated per resource, with a per-session request ceiling; on 429 or repeated failure the editor falls back to Orbit Weekly with a named cause".

**[External-claims F12]** — Appendix F's Ghost(Pro) test-infra costs are stale (Appendix F; §4 T4; FR-H6)
Appendix F assumes "Publisher ~$31 monthly billing, Starter ~$11." Current list prices are Publisher $29/mo billed yearly (higher monthly) and Starter $18/mo monthly / $15 yearly — Starter understated by roughly 60%. Break-even is not materially threatened by this alone but it compounds with regression F-6 and adversarial H8. Also: Ghost(Pro) Starter has **no paid subscriptions**, so tier/paywall behaviour (FR-H6) cannot be exercised on T4 at all.
Fix: Correct both line items, and state that Appendix E / FR-H6 acceptance work targets T1–T3.

**[Adversarial M4]** — §7.6's verify list was not extended to the v2.3 dependencies (§7.6; FR-Q6; FR-C5)
The list stops at v2.1's feature set. FR-Q6 introduced a hard dependency on Ghost's `{{t}}` resolution, locale-file selection and missing-key fallback across 5.x and 6.x; FR-C5's compatibility watch depends on Ghost publishing usable per-release deprecation data. Neither is listed. (External-claims has since verified the `{{t}}`/`locales/` mechanism directly, which discharges the first and demonstrates the second is exactly the right kind of item to list.)
Fix: Add "Ghost release-note format usable as compatibility data" to §7.6, alongside the four replacements external-claims recommends (delete items 3 and 4 — both settled — and add `hostSettings.limits` shape, theme-upload size limits, the Dodo event catalogue, and gscan's current v6 warning set).

**[Adversarial M5]** — G1 and G2 cannot both be true, because nothing says whether G2 contains G1 (§1.3 G1, G2)
G1: connect → branded canvas, <10 min p75, explicitly including Ghost Admin integration setup. G2: "Blank project → first successful deploy, <15 min p75." A blank project cannot deploy without a connected site, so G2's journey contains G1's — leaving 5 minutes for choosing a starter or building a page, designing, compiling, gscan, uploading and activating. Either G2's clock excludes connect (unstated), or the two are jointly unachievable by construction.
Fix: State G2 as "from an existing connection: blank project → first successful deploy", excluding connect.

**[Adversarial M7 + Regression F-9]** — Appendix F tells the reader to model a churn spike and then does not, while G10 asserts the opposite (Appendix F "Retention modeling"; G10)
Appendix F: "an export-and-cancel cohort is expected — **model a month-1 churn spike honestly in blended LTV**." No spike is modeled, no LTV appears, no churn assumption is stated, and break-even is not re-derived. G10 sets a hard target of "Pro monthly churn < 5%". The economics section expects a month-1 spike and the goals table forbids one; the owner has two contradictory numbers for the same quantity.
Fix: Put a number in Appendix F ("assume 25% month-1 churn, 4% steady-state → blended LTV ≈ $X") and restate G10 as steady-state churn measured from month 2.

**[Adversarial M8]** — FR-J14's cadence commitment makes "487" wrong by design, and Appendix H hard-codes it as verbatim copy (FR-J14; G5; FR-G1; Appendix H; E14)
FR-J14 commits to "monthly drops of new variants and/or Style Packs" and to never deleting variants. G5 and FR-G1 fix the library at "34 categories, 487 unique variants", and Appendix H makes "Yours starts with **487 gorgeous sections**" a canonical string reused verbatim. One month after GA the product's own empty state lies, and E14's exit criterion ("gallery renders all 487 variants") is pinned to a number the roadmap guarantees will move.
Fix: Make the microcopy count-agnostic ("hundreds of gorgeous sections") and restate G5/FR-G1 as "487 at GA; grows post-launch per FR-J14."

**[Adversarial M9 + Buildability A10]** — URL-keyed snapshots have no identity check, no collision rule and no TTL (FR-C6; FR-J13; FR-C8)
FR-C6: "snapshots are keyed by site URL and survive disconnect/reconnect." Disconnect `blog.example.com` and the snapshot persists, orphaned. Six months later a *different* Ghost install serves that URL — a staging-to-production cutover, or a rebuilt site — and nothing says whether the new capture overwrites the orphan or the orphan is silently adopted as this site's "original", so restore reinstalls a theme from a site that no longer exists. The buildability pass adds the mirror case: editing a site URL to one that already has a snapshot collides on the unique key, with no defined winner.
Fix: Bind snapshots to the site record id rather than the raw URL, give orphans a TTL, and state the overwrite rule for both the reconnect and the URL-edit path.

**[Adversarial M10]** — The compatibility alert is in-app only, with 90-day retention, for users who by definition are not logging in (FR-C5; FR-B7; FR-P2)
FR-C5's notification lands in FR-B7's notifications center, which FR-P2 forbids escalating to email and FR-B7 prunes at 90 days. The population at risk is precisely the population that deployed once and left: a Ghost release breaks their theme, the notice lands in a feed they never open, and it is deleted before they next sign in. The only signal Inflozo has that a customer's site is broken expires unread.
Fix: Exempt site-health and compatibility notifications from the 90-day prune, and carve compatibility alerts out of FR-P2 as an extension of FR-P1's existing "Reconnect needed" health email.

**[Adversarial M11]** — Translations derive from the linked site's locale, and FR-B5 lets a project change sites (FR-Q6; FR-B5; FR-J10)
FR-Q6 defaults the locale "to the connected site's `@site.locale`, user-selectable for unlinked projects" — so a linked project's language is not user-selectable. Build against a German site, override 40 strings, deploy, then per FR-B5 switch the project's target to an English site: do the German overrides ship as `en.json`, get orphaned, or get dropped? FR-Q6 has no rule for a language change, and FR-J10's per-site name freeze means the project legitimately serves both sites over its life.
Fix: Store the language on the project (defaulted from the site at first link, always user-editable) and warn on site switch when the new site's locale differs.

**[Adversarial M12]** — §4's Live/Test cutover strands every pre-launch record, including the public suggestions board (§4; FR-M3; FR-N5)
At go-live a *fresh* infrastructure set (new Supabase project) becomes Live and takes over the production domains, while the pre-launch stack becomes Test. But that pre-launch stack has been serving the real marketing site with a **public suggestions board** collecting real submissions and votes from real visitors, plus the dogfooded FR-N5 Ghost theme project. At cutover all of it stays behind in Test: the board resets to empty on launch day, and the project that builds the company's own blog theme lives in the test environment forever. No migration is specified.
Fix: One line in §4 — suggestions, votes and the dogfood project are exported from Test and imported into Live at cutover; everything else starts empty.

**[Adversarial M13]** — A31 models error pages two ways at once; one `error.hbs` cannot be both (Synthesis Defaults §3; Appendix A §A31; FR-I1)
Synthesis Defaults says the default error page is A31 #1 with the "numeral bound to the error context's status code — one `error.hbs` serves 404 and 500." Appendix A treats status as a **variant identity**: #1–#4 are 404 designs and #5 is a separate "500 Calm." If the numeral is bound, #5 is redundant and #2's "apology + search + popular tags" is wrong copy for a 500. If it is not, the default error page prints "404" on server errors. And since FR-I1 emits one `error.hbs`, a user who picks #2 serves a search box to visitors hitting a 500.
Fix: Bind the numeral and message to the error context in every A31 error variant, and re-describe #5 as a *treatment* (calm / playful / recovery) rather than a status code.

**[Adversarial M14]** — Promoting the accent silently disarms the Style Pack switcher on the live site (FR-Q3; FR-Q5; FR-E2)
Promote the accent token to Ghost Admin and deploy; the site owner picks a color. Later switch Style Packs — FR-E2's designed "wow moment", a full restyle in ≤300 ms — and redeploy. The new pack's accent compiles only as the `@custom` *default*, and Ghost keeps the owner's stored value, so the live site's accent does not change: the canvas shows the new pack, the site shows the old accent. FR-Q5's one-time caution covers contrast, not this.
Fix: Warn at pack switch when the accent is promoted, and surface the promoted-token state in the Style panel.

**[Consistency MED-2]** — The companion generalizes an FR-I1 rule that FR-I1 scopes to members templates only (`sections-inventory.md` §1 vs FR-I1)
The companion defines "Untouched = the template has no `project_templates` doc (or its doc has zero sections after FR-I1's 'removed everything' rule)". FR-I1 states that rule for exactly one class: "Removing every section from a designed **members** template returns it to untouched: its file and auto-added route are not emitted." The companion applies it to `index.hbs`, `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs` — where the consequence *inverts*: there, emptying suppresses the file; here, emptying resurrects the full default stack, so an intentionally empty Home is impossible. The PRD states this nowhere.
Fix: FR-I1 (or FR-D6) states the general rule — "emptying any template returns it to untouched; standard templates then re-synthesize, conditional templates stop emitting."

**[Consistency MED-3]** — One artifact, two names, and the surviving heading encodes the superseded trigger (FR-J13 heading, P8, E7 vs FR-B3, FR-C6, FR-C8, FR-L3, Appendix I)
The pre-Inflozo theme archive is "Pre-activation snapshot" in FR-J13's own bolded heading, P8's summary line and E7's scope list, and "Pre-Inflozo snapshot" in five other places including the glossary. Worse than the split: triage P4 moved the capture point from activation to upload, and FR-J13's body encodes the new rule ("at Inflozo's first theme **upload** to a site — deploy-only included; manual activation in Ghost Admin must not bypass the safety net"), so the surviving heading names precisely the trigger the hardening pass rejected. An agent skimming headings implements capture at activate-time and silently reopens the deploy-only bypass FR-J13 exists to close.
Fix: Rename FR-J13's heading, P8 and E7 to "pre-Inflozo snapshot" (the glossary's canonical term), or to "first-upload snapshot".

**[Consistency MED-4]** — §4 overloads "Live" for two opposed concepts, and neither environment is in the glossary (§4; NFR-6(d); Appendix I)
"**Live-infrastructure testing** (owner mandate)… all testing runs on the real production infrastructure" sits fifteen lines above "at go-live a fresh infrastructure set is provisioned as **Live** … the existing pre-launch stack becomes the permanent **Test** environment … all testing runs exclusively against Test." The stack the first line calls "live infrastructure" is exactly the stack the second renames Test, while Live becomes a set testing must never touch. Two further senses are in play ("live Ghost deploy targets", and FR-B1's "Live vX" chip), and Appendix I has no row for either environment. A reader taking the headline mandate at face value post-launch **points the E2E suite at customer data**; NFR-6(d) resolves it only by a parenthetical.
Fix: Add two glossary rows (Test environment, Live environment) and rename the §4 label to "Production-infrastructure testing (pre-launch)" so "Live" is reserved for the post-launch set.

**[Consistency MED-5 + Buildability]** — FR-D18 calls it the unsynced-*edit* count; AD2 calls the same field the unsynced-*op* count (FR-D18 vs `addendum.md` AD2)
Both prescribe the identical user-visible string — "That session had 14 unsaved edits" — while naming the heartbeat field differently. The buildability pass names the consequence: a shuffle is several ops, so an agent picking "ops" reports a number that does not match what the user did, in a message whose whole purpose is telling them what they lost.
Fix: Pick one (user-perceived edits is what the string promises) and state the ops→edits mapping in AD2.

**[Buildability + Adversarial M3 + Consistency LOW-4]** — §7.5 is prescriptive and incomplete, the worst combination (§7.5 vs FR-B7, FR-L2, FR-I4, FR-Q1/Q2/Q6, FR-J13, FR-J10, AD2)
§7.5 dictates eight table shapes, constraining the architect, while omitting at least eight tables the FRs require: `notifications` (FR-B7, with a 90-day retention that also needs a cron job §7.1 does not list), `edit_locks` (AD2 names "a lock record per project … in Postgres"), routes state on `sites` (FR-I4's last-offered plus verification state), `entitlements` (FR-L2 names it in backticks; §7.5 has only `subscriptions.status` — table or derived view?), theme-settings / custom-settings definitions, translation overrides, the export log, the site-snapshot record, and `project_site_bindings`. An SM writing E1.S2 from §7.5 ships eight tables and **every later epic carries an un-storied migration** — §8 has no story anywhere for "add the remaining tables". "RLS on every table, verified" is testable; *which* tables is not answerable from the PRD.
Fix: Either complete §7.5 or demote it explicitly to "illustrative, not exhaustive — the Architect owns the full schema", and add a schema story to §8.

**[Buildability A6]** — The control→CSS mechanism is unstated and load-bearing for all 487 variants (§7.3; FR-F1; Appendix C; FR-E4)
Nothing states how a control value reaches CSS — data attributes with attribute selectors, per-instance inline custom properties, or generated per-instance classes. It is derivable (P2 and Appendix C forbid open-valued controls, so every value set is closed and enumerable, which makes data-attribute selectors viable and is almost certainly the intent) — but this is *the* fact that determines whether 487 variants can be authored as static CSS at all, and it is stated nowhere.
Fix: State the mechanism in §7.3 alongside the one-source rule.

**[Buildability A5]** — "One partial per placed section instance group" — "instance group" is undefined (§7.4; FR-Q3)
Two placements of A17 #1 with different control values: one parameterized partial, or two partials? The phrase occurs once in either document. The choice determines how FR-Q3's `{{@custom.*}}` rewrite works — a bound control reading from Ghost Admin instead of the baked value becomes per-invocation under one reading and needs an entirely different mechanism.
Fix: Define the term, or state the emission rule directly (`partials/sections/{template}-{n}-{variantId}.hbs`, content baked).

**[Buildability A7]** — Section CSS authoring format is unstated and collides with the app's likely Tailwind (FR-G3; §7.1; FR-E4)
Is registry `css` plain CSS with `var(--tokens)`, or PostCSS/Tailwind? FR-G3 says only "css". If the team adopts Tailwind for the Next.js app (the default choice), section CSS must be explicitly excluded from the app's Tailwind pipeline — and utility classes are structurally incompatible with FR-E4's token-only styling. Nothing says so.
Fix: One sentence in §7.3 or FR-G3 naming the authoring format and the exclusion.

**[Buildability A1]** — The compile job model and cancel semantics have no substrate (FR-J8; §7.5; §7.1)
FR-J8 requires a five-stage progress UI (Compiling → Checking → Uploading → Activating → Live) with cancel during the first two stages. §7.5 has no `jobs` table, and FR-J7 stores artifacts on *successful* compile — implying failed compiles have no row, so the progress UI has nothing to poll. Server-side cancellation requires a job record; a single long-running function streaming SSE changes cancel semantics entirely. Vercel Node function max duration and memory are also unstated for a job that assembles a tree, subsets fonts, fetches assets from Storage, runs gscan and zips.
Fix: Add a `deploy_jobs` row (stage enum + cancel flag) to §7.5, or state the SSE model and its cancel semantics explicitly.

**[Buildability A11]** — Asset-usage tracking is underived, and its staleness window makes FR-K4's delete warning wrong (FR-K4; FR-K1; FR-D10; AD1)
FR-K4 promises a "Used in 3 projects" chip and "deleting a used asset … lists affected projects; compile blocks until resolved". §7.5 has no join table, so usage must be derived by scanning every `project_templates.doc` jsonb — and FR-K1's grid shows chips for all assets at once, so N scans per page load. A server-side `asset_usages` table recomputed on doc upsert is the workable answer, and it introduces a correctness hazard the PRD never acknowledges: with local-first persistence syncing every 3 minutes, a doc can reference an asset for minutes before the server learns of it, so **the delete warning is wrong by up to one sync interval** — a user can delete an asset the server believes is unused while it is in fact placed.
Fix: Name the tracking mechanism and state the staleness consequence (or make delete re-verify against the client's live doc before proceeding).

**[Buildability A18/A19]** — Rich text has no storage format, no editing engine, and no answer to the two-editors-one-value problem (FR-D4; §7.3; FR-Q3)
*Engine:* §7.3's "contenteditable regions … mapped to schema props via data-attributes" implies raw contenteditable, not an editor library — and if a ProseMirror/Lexical/Tiptap is intended instead, the editor's own DOM lives *inside* the iframe, which breaks §7.3's byte-comparable-markup claim outright. *Storage:* a text prop with marks is HTML, a portable JSON tree, or plain-text-plus-marks; P3's baking makes an HTML string natural, but then the compiler emits unescaped user HTML via `{{{ }}}` and FR-Q3's mark-stripping implies a dual mode. *Two editors:* FR-D4 requires every text prop editable both on canvas and in the sidebar's Content group ("owner requirement"), and a plain `<textarea>` cannot show marks.
Fix: State the engine, the storage format and the sanitization point in §7.3 or FR-D4 — all three change the controls engine, the compiler and FR-Q3's strip behavior.

**[Buildability A21]** — Deploy concurrency between two projects targeting one site is ungoverned (§4; FR-J11)
§4 serializes CI runs per target because "theme activation is globally stateful", but nothing governs two *user* projects deploying to the same site concurrently, and FR-J11's 10/hour rate limit is not a mutex.
Fix: Specify a per-site advisory lock for deploy+activate.

**[Buildability A24]** — §3's `admin` custom claim is provisioned by no FR (§3; FR-M)
§3 names a Supabase custom claim gating moderation. No FR provisions it — not who grants it, how, or through what surface.
Fix: One clause in FR-M (or FR-A) naming the provisioning path, even if it is "manual SQL by the owner".

**[Buildability A28/S13]** — Nothing records exports, so FR-Q2's key immutability has no state to test against (FR-Q2; FR-J12)
FR-Q2 freezes custom-setting keys "once deployed **or exported**". No table, column or event records an export, so the AC "renaming a key after export is rejected" has nothing to assert on.
Fix: Add an `exports` record (or an `exported_at` stamp on the project) to §7.5.

**[Buildability Q7]** — The five pilot sections are never enumerated, though three epics gate on them (§8 E4, E5, E6)
E4, E5 and E6 all gate on "pilot sections", and the choice determines whether E5's "full editing loop" exercises site-wide singletons (FR-D5), dynamic feeds (FR-H2) and members-aware sections (FR-D16). The SM must invent the set, and a wrong pick lets three epics exit green on a trivially easy subset.
Fix: Name the five in §8, chosen to span the hard cases.

**[Buildability Q6]** — FR-B7's notifications table is written by four epics before the epic that creates it (§8 E3, E7, E12, E13; FR-B7)
FR-B7's feed carries deploy outcomes (E7), billing events (E12), health changes (E3) and library notices (E7). E13 is last, so four earlier epics write to a table that does not exist yet.
Fix: Create the notifications table in E1's schema story; leave the feed UI in E13.

**[Buildability S21]** — E1's "dashboard skeleton" cut line is undefined (§8 E1)
The boundary between E1's skeleton and the real dashboard is stated nowhere — which matters enormously because FR-B1–B6 belong to no epic at all, so "skeleton" is currently the only place the entire Projects surface is even gestured at.
Fix: Define the cut line in E1's exit criterion, alongside assigning FR-B1–B6 to an epic.

**[Buildability S22]** — FR-H2's main-feed designation lifecycle is assigned to no epic (FR-H2; §8 E4, E5)
Auto-designate-on-first-placement, transfer-on-delete and user-reassign are editor behaviors. E4 is the runtime, E5 is the shell, and neither names them.
Fix: Assign the lifecycle to E5 explicitly.

**[Buildability S9/T21 + S10]** — FR-G5's uniqueness bar is a ~3,500-comparison human judgment with no rubric, reviewer or gate, and §8 gives no story-granularity rule (FR-G5; FR-C7; §8 E9–E11)
FR-G5: "A reviewer must be able to name what is structurally different about any two variants." Within-category pairwise comparisons across 34 categories total roughly 3,500. There is no automated test, and E9/E10/E11's exit criteria (render matrix + compile CI) do not test uniqueness at all — **it goes untested by construction.** Separately, §8 gives no guidance on story granularity: is a variant a story (487 stories) or a category (34)? The same shape recurs in FR-C7's "variety is an acceptance criterion" — proposals "must differ in layout structure, not merely palette", which no test can assert.
Fix: State the story-granularity rule in §8 (one story per category is the workable answer), and either give FR-G5 and FR-C7 mechanical proxies (no two variants in a category share the same structural descriptor tuple; proposals share no variant id in any equivalent slot) or state that they are review-time human gates with a named reviewer.

**[Buildability T19]** — "Docs complete" has no pass condition (§4 DoD; FR-N4)
The DoD lists "docs complete" as a gate and defines nothing. The workable reading is "every page in FR-N4's list exists and is non-empty"; the PRD does not say so.
Fix: One clause pointing the gate at FR-N4's enumerated pages.

**[Buildability T2/T3/T4]** — NFR-1's 60 fps has no measurement method, its reference environment is not reproducible in CI, and "warm" is undefined (NFR-1; §4)
"60 fps" names no criterion — no dropped frames? p95 frame time < 16.7 ms? no long task > 50 ms? The reference environment is real credit ("a mid-tier laptop with 4× CPU throttle" plus a 40-section stress fixture is far better than most PRDs) but it is **not reproducible in CI**: "4× throttle on a GitHub runner" is not that machine, and no CPU/memory spec is given, so the gate is either manual-only or non-deterministic. "Warm" is undefined (warm HTTP cache? warm serverless function? both?).
Fix: State the frame criterion and define "warm"; then either name a fixed runner spec or declare the perf gate manual-only against the reference laptop.

**[Buildability T23]** — FR-D14's "lockup" threshold is undefined (FR-D14)
"Slower is acceptable, lockups and state corruption are not" is an excellent bounding sentence with one unbounded term. No pass condition without a number.
Fix: One clause — e.g. "no main-thread block > 5 s".

**[Buildability T24]** — FR-N2's "sandboxed iframe" vs §7.3's same-origin, for the same runtime (FR-N2; §7.3; NFR-3)
FR-N2 specifies the marketing gallery's previews in a **sandboxed** iframe while §7.3 and NFR-3 mandate a **same-origin** canvas iframe for the same section runtime — two security models for one component, with no test for either. `sandbox` also interacts with the `new Function` problem in the CSP finding.
Fix: State which model the gallery uses and why it differs, or align them.

**[Buildability]** — §4 over-claims that its automated gates run against live Ghost (§4; NFR-6)
§4 says the automated gates "run on CI runners **against** these live Ghost targets". Only NFR-6(c) golden fidelity and NFR-6(d) E2E actually touch a live Ghost — the render matrix touches none, and compile CI needs only gscan. Minor, but it inflates the perceived infrastructure dependency and misleads whoever budgets the CI lane.
Fix: Name which of the four gates are live-target gates.

**[Buildability over-specification]** — FR-K2 mandates a WebP encoder for a Safari limitation that no longer applies (FR-K2; NFR-7)
FR-K2 requires "a bundled encoder or server-side transcode" because "the browser cannot encode WebP natively (Safari)". Safari has supported `canvas.toBlob('image/webp')` since well before the 16.4 floor NFR-7 itself sets, so an agent following the PRD literally ships ~300 KB of dead wasm.
Fix: Correct the stated reason and let the implementation use the native path with the encoder as a fallback.

**[Adversarial L6 + Buildability T20]** — The DoD's 30-deploy matrix collides with FR-J11's 10/hour rate limit (§4 DoD; §8 E11; FR-J11)
The DoD requires 10 starters deployed end-to-end to T1–T3 = 30 deploys, and §4 requires them serialized per target because activation is globally stateful. FR-J11 caps deploys at 10/hour per site. A full DoD run therefore takes ≥ 3 hours at the theoretical floor, before compile time, and every re-run costs the same — with Ghost(Pro)'s own upload limits on T2 unknown. E11's exit criterion sits on exactly the same wall. Nothing plans for it.
Fix: Exempt the §4 test targets from the rate limit, or state that the gate runs serialized across hours and budget the DoD run accordingly.

### Low (31)

**[Rubric · Substance over theater]** — §3's personas are declared to drive prioritization but no requirement cites one (§3; §5; §8)
"Personas (for tone and prioritization, not permissions)" lists four, each one line. Their mapping to product decisions is inferable (the multi-site operator ↔ Pro's 10 connections; the creator with taste ↔ FR-E3/FR-D7/FR-I2) but never stated, and no FR, epic or scope call invokes a persona as its reason. Their real job — being handed to bmad-ux by the header sentence — is legitimate; the claim about prioritization is what's unearned.
Fix: Attach one persona name to each of the four or five prioritization calls that actually turned on them, or narrow the parenthetical to "for tone and for the UX workflow."

**[Rubric · Scope honesty + Regression F-10f + Buildability T15]** — NFR-8 leaves an analytics door §1.3 closes (NFR-8; §1.3)
NFR-8 permits "no third-party trackers **beyond privacy-respecting analytics**"; §1.3 states "No in-app analytics or telemetry requirement exists in v1 (NFR-8's privacy stance stands)" and cites NFR-8 as its authority. Permitted ≠ required, so not a hard contradiction — but a Dev agent reading NFR-8 alone may ship Plausible into the app, and QA has nothing to test either way.
Fix: Scope the clause — "privacy-respecting analytics on the marketing site only; the authenticated app ships no analytics in v1."

**[Rubric · Scope honesty]** — Whether an over-limit read-only project can still export is unstated (FR-L3; FR-J12)
FR-L3 puts "all but one project" into read-only on a downgraded Free account and says they "stay viewable"; FR-J12 grants ZIP export to all plans, gated only on Pro-section content. FR-L3 explicitly preserves rollback and snapshot restore through downgrade but does not mention export. Given the no-lock-in stance the answer is probably yes — but a Dev agent has to guess, on a billing boundary.
Fix: One clause in FR-L3.

**[Regression F-7]** — The Synthesis Defaults' pagination rationale contradicts FR-G4 and the inventory's own A34 line (`sections-inventory.md` Synthesis Defaults vs FR-G4, A34)
The C2 fix justifies its default as "A34 #1 Numbered Classic … **the only style that is fully functional with JS disabled** (FR-G4), which is why defaults never use Load More/Infinite." FR-G4, as amended by the L4 fix *in the same hardening pass*, says the opposite: "load-more **and infinite scroll** fall back to numbered links" — and so does A34's own header 94 lines earlier. Two fixes from one pass, landing in one file, disagreeing. The decision is fine; only the reason is wrong, and a wrong reason in a normative document licenses a downstream agent to "fix" FR-G4 or skip the fallback.
Fix: "…the only style that needs no JS fallback path, which is why defaults never use Load More/Infinite."

**[Regression F-8]** — Accent promotion is undefined for Light-only projects (FR-Q5; FR-Q3)
FR-Q5 justifies accent-only promotion entirely through the dark pair ("its dark counterpart — the Dark accent built-in — already exists"), but its own preceding sentence says the built-ins compile only for Light+Dark projects. In a Light-only project the counterpart does not exist and the justification evaporates. Permitted there (harmless — no dark mode to break) or blocked (the letter of FR-Q5)? Unstated.
Fix: One clause — "In Light-only projects the accent promotes as a single light setting; no dark counterpart is needed."

**[Regression F-10a]** — A synthesized paywall trips FR-H6's own members-disabled warning (Synthesis Defaults `post.hbs`; FR-H6)
The default post stack auto-emits "A32 #1 Fade + Card inside `{{#unless access}}`". FR-H6 requires that placing paywall sections on a members-disabled site warns in the editor "and a pre-deploy check repeats it", so every untouched-post project on such a site trips a warning about a section the user never placed — harmless at runtime, which is exactly why it is noise. The same stack handles the analogous comments case gracefully and says so.
Fix: Suppress the check for synthesized instances, as the comments case already is.

**[Regression F-10b]** — Compatibility-watch notices are in neither FR-B7's nor FR-P2's list (FR-B7; FR-P2; FR-C5)
FR-B7 enumerates the notification feed's contents (deploy, health, billing, FR-J14 updates, announcements) without the new compatibility notice, and FR-C5 cites "in-app only per FR-P2" where FR-P2's in-app-only rule is written for "Theme updates available (FR-J14)" specifically.
Fix: Add the notification type to both lists.

**[Regression F-10c + Consistency LOW-2]** — "Verify the download endpoint on all four §4 targets" is partly unreachable on T4 (FR-J13; §7.6 item 4 vs §4)
T4 is a Ghost(Pro) Starter that cannot accept a theme upload by design (the H2 fix's own definition), and the snapshot triggers "at Inflozo's first theme upload to a site" — so the criterion as phrased implies an end-to-end run the block path prevents. One H3 fix colliding with one H2 fix from the same triage. (External-claims F1 makes it moot: the criterion can only ever fail, on all four.)
Fix: Scope the criterion to T1–T3, or state that on T4 only the endpoint is probed — and then rewrite it entirely per F1.

**[Regression F-10d]** — Light-only projects waste 3 of Ghost's 20 custom-setting slots (FR-Q5; FR-Q2)
Deliberate per the review-triage 5/7 decision (uniform 17-slot cap, no collisions), correctly implemented, and worth flagging only because a future reader will read it as a bug and "fix" it.
Fix: A one-line rationale in FR-Q2 immunises it.

**[Regression F-10e]** — "Closed control vocabulary" vs "open but disciplined" (§1.4 #4, P2 vs FR-F1, Appendix C)
Differentiator 4 still sells "a **closed** control vocabulary with no raw CSS values"; FR-F1 says "The vocabulary **may grow** when a section genuinely needs a new type" and Appendix C says "The vocabulary is **open** but disciplined." Pre-existing — it dates to the round-six owner reversal, not to these hardening passes, and was not among the 40 findings. Flagged because it is live and one word wide.
Fix: "closed" → "disciplined" in §1.4 #4 and P2.

**[External-claims F13]** — Theme-shop price range overstated (§1.5)
"$89–149 one-time" is the top half of the official marketplace's $35–$149 range (typical cluster $69–99).
Fix: "$35–149 one-time (most $69–99)" — the comparison still favours Inflozo and stops being contestable.

**[External-claims F14]** — "The one shipping builder" / "only shipping visual Ghost builder" cannot be sourced (§1.1; §1.5)
No competitor surfaced in search, but an exhaustive-market negative is unprovable and the claim will be reused on the marketing site.
Fix: "the most prominent shipping visual Ghost builder".

**[External-claims F15]** — `@site.locale` also appears as `lang` in the Content API response (Appendix B; FR-Q6)
Correct in theme context; the Content API `/settings/` response exposes the same value under both `lang` and `locale`.
Fix: One parenthetical in Appendix B so the editor reads the right field.

**[Adversarial L1]** — Appendix C's Text Field row does not carry FR-Q3's plain-text lock (Appendix C; FR-Q3; FR-D4)
Appendix C is normative and still says Text Field/Area allows "text + inline marks" with no mention of the bound-to-Ghost-setting lock v2.3 added in two other places.
Fix: Add "(marks disabled while the prop is bound to a Ghost Admin text setting — FR-Q3)".

**[Adversarial L2]** — FR-J3 says assets are "copied"; FR-J5 says they ship pre-generated responsive sizes (FR-J3 vs FR-J5)
One pipeline, two descriptions; the second was added to close an old finding and the first was not updated.
Fix: State the rendition set in FR-J3 (e.g. 400/800/1600 widths + original).

**[Adversarial L3]** — T4's acceptance criterion became trivial when Preview-only became user-declared (§4 T4; FR-C2)
§4 requires "the block path passes on T4", but FR-C2 now sets Preview-only from a user's self-declaration, so the block path can pass without ever touching T4.
Fix: Restate T4's criterion as "a deploy attempt against T4 fails with the friendly Starter message and sets Preview-only."

**[Adversarial L5 + External-claims claim 25]** — The Translations catalog cannot control Ghost's native search overlay (FR-Q6; Appendix A §A23)
A23 #1–#8 are triggers for Ghost's bundled Sodo search, whose overlay strings belong to Ghost, not the theme — verified against Ghost's separate `portal`/`comments`/`search` i18n namespaces. The theme-side placeholder is translatable; the results overlay is not.
Fix: Scope FR-Q6's search entry to theme-rendered trigger text.

**[Adversarial L7 + Buildability T7]** — NFR-2's 30 KB JS budget has an undefined denominator and omits A23's search client (NFR-2; FR-J4; Appendix A §A23 #9–12)
"Total theme JS < 30 KB gzipped for a **maximal** design" is measured against FR-J4's nine behavior modules, and "maximal design" is itself undefined. A23's Custom Overlay variants add a client-side Content API search client with NQL querying and result rendering, which FR-J4's list omits entirely.
Fix: Add search to FR-J4's module list, define "maximal design" (all modules bundled), and re-derive the budget.

**[Consistency LOW-1]** — Bare `§7.4` pointing into `prd.md` from the companion (`sections-inventory.md` Synthesis Defaults §1)
Every other cross-file pointer is file-qualified.
Fix: "per `prd.md` §7.4".

**[Consistency LOW-3]** — Switcher-open behavior is defined only for the six synthesizable templates (`sections-inventory.md` Synthesis Defaults §1; FR-D6)
"Opening an untouched template in the switcher renders this same default stack as the starting canvas" — but FR-D6's switcher also opens Members canvases, which have no default stack.
Fix: One line — non-synthesizable canvases open empty.

**[Consistency LOW-5]** — Pack gutters reuse the per-section Vertical spacing labels verbatim (FR-E1 vs `sections-inventory.md` universal controls)
FR-E1 carefully separates pack *density* (Compact/Comfortable/**Airy**) from the per-section Vertical spacing scale — then the very next clause gives **gutters** the same three labels as that per-section scale (Compact/Comfortable/Spacious), with no disambiguating note.
Fix: Give gutters its own scale (e.g. Tight/Normal/Wide, matching the Galleries `gap` control) or add the same "distinct from" note.

**[Consistency LOW-6]** — Appendix H's verbatim-reuse string counts variants as "sections" (Appendix H; Appendix I)
"Yours starts with 487 gorgeous **sections**." 487 is the *variant* count; 34 is the section/category count, and the glossary distinguishes the two. Cosmetic in a user-facing string, flagged because Appendix H is normative and this is the only place the two units are conflated in a reused literal. (Adversarial M8 attacks the same string on a different ground.)
Fix: Count-agnostic microcopy solves both at once.

**[Consistency LOW-7]** — "Snapshot" carries two normative senses; the glossary defines one (FR-D9, FR-D10, FR-D18, `addendum.md` vs Appendix I)
Sense A is the theme archive (FR-J13). Sense B is the synced project document — "the authoritative cloud snapshot", "the last synced snapshot", "hydrates from the fresh server snapshot". Every individual use is qualified, so no single sentence is ambiguous, but Appendix I defines only sense A and the two appear within nine lines of each other.
Fix: Add a glossary row for **cloud snapshot**.

**[Consistency LOW-8/LOW-14]** — Universal controls live only in the companion, so FR-F3's ≈15 cap has an unstated +3 baseline (`sections-inventory.md` vs prd.md; FR-D7)
The companion defines three per-section universal controls — Background role, Vertical spacing, Top divider. "Universal control" appears **zero** times in `prd.md` and "Top divider" appears zero times, so FR-F3's "Hard cap ≈ 15 visible controls per section" has an unstated +3 baseline. FR-D7 also lowercases the named control ("background role") against the companion's "Background role".
Fix: FR-F3 names the three universal controls and their exemption from (or inclusion in) the ≈15 cap; align the capitalization.

**[Consistency LOW-9]** — FR-D16's member-state preview omits a state Appendix B defines (FR-D16 vs Appendix B)
FR-D16 previews Anonymous / Free member / Paid member; Appendix B's `@member` also defines `status: comped`. Sections that branch on status (A22, A30, A32) have no preview for it.
Fix: Add the state, or state that comped previews as paid.

**[Consistency LOW-10]** — `addendum.md` is not enrolled in the normative set it is cited as governing (prd.md preamble; `addendum.md` frontmatter; FR-D9/D10/D18)
The PRD's preamble enumerates the authoritative surface and does not name `addendum.md`; the addendum self-declares "Not normative for scope" — yet FR-D10 ("Mechanism: `addendum.md` §AD1"), FR-D18 (§AD2) and FR-D9 (AD1) cite it as the mechanism of record, and FR-D10 binds to it normatively. Neither companion carries an `updated` date, so a reader cannot tell whether either kept pace with prd.md's 2026-08-18 bump.
Fix: Name `addendum.md` in the preamble with its intended force, and add `updated:` to both companions.

**[Consistency LOW-11 + Buildability S18]** — "Any surface exposing compiled theme code" vs the Routes Manager's YAML pane, gating a feature Appendix G defers (FR-L3 vs FR-I2, FR-I4, Appendix F, Appendix G)
FR-L3 blocks "deploy, ZIP export, and any surface exposing compiled theme code" for projects containing Pro sections. FR-I2 ships "a live YAML preview pane" and FR-I4 a routes.yaml **download button** — and routes.yaml is compiled output included in the theme zip — while Appendix F grants Routes to Free unconditionally. Meanwhile the clause's intended target, the in-app code viewer, is deferred to post-v1 by Appendix G, so it is dead in v1 either way and an SM will spend time hunting for the surface it gates.
Fix: FR-L3 states that routes.yaml (containing no section code) is exempt — or drops the clause until the code viewer ships.

**[Consistency LOW-12]** — 16 of the 487 are not placeable sections, and no FR carves them out (Appendix A §A33, §A34; FR-D12/D13/G5/G6; NFR-6(a); E14)
A33 Koenig Card Treatments (6) is site-wide `cards.css` styling, "one treatment active per project (Style group of Post Content Layout)", and A34 Pagination Styles (10) are "designs behind the feed Pagination control". Neither is placed on a canvas, yet both count toward 487 and therefore fall inside every requirement that quantifies over "every variant" — the Section Picker rail, Variant Shuffle, FR-G5's uniqueness bar, the render matrix, and E14's "gallery renders all 487 variants". Each needs a host context no requirement specifies. Predates the hardening passes; a modelling wrinkle, but it surfaces the moment E9/E11 and E14 are planned. (Adversarial C3 shows the same modelling question is a critical for A32.)
Fix: One carve-out clause naming A33 and A34 as non-placeable treatments, with their host context for the matrix and the gallery.

**[Consistency LOW-13]** — FR-D5's hide-all case is covered by no rule (FR-D5 vs `sections-inventory.md` Synthesis Defaults §1)
A fully hidden template is neither "designed with content" nor "zero sections", so it compiles an empty body with no rule covering it.
Fix: State whether hide-all counts as untouched (re-synthesize) or as designed (emit empty).

**[Buildability T13]** — Undo persistence is unfalsifiable on Safari (NFR-7; FR-D9)
FR-D9 promises undo survives reloads and sessions, then hedges: "durability is bounded by the browser — the app requests `navigator.storage.persist()`, but an evicting browser can still clear it." Safari's eviction policy makes the promise contingent, and no pass/fail test can be written for a requirement whose failure mode is pre-excused. The hedge is honest; it just means QA needs a different assertion — "the journal is present after reload within the same session" — which *is* testable, and which regression F-1 shows is currently broken anyway.
Fix: Scope the testable claim to the same-session reload and state the eviction case as a known limitation rather than a requirement.

**[Buildability over-specification]** — Implementation constants stated as spec (FR-D10; AD1; AD2; FR-K2; FR-J3; FR-J10; §7.1; FR-E4)
FR-D10's 3-minute sync interval; AD1's IndexedDB choice and op-log design; AD2's ~15 s heartbeat / ~30 s nudge / ~60 s stale thresholds; FR-K2's WebP q≈82 and 2400 px cap; FR-J3's content-hashed filenames; FR-J10's exact naming scheme; §7.1's "not Edge". FR-E4's exact CSS emission structure is arguably justified — it underwrites the JS-disabled dark-mode promise — but it is still architecture written as requirement. None is wrong; they are decisions the architect would otherwise own, and pinning them silently costs the option to tune.
Fix: Mark them as defaults-with-rationale rather than requirements, so the Architect knows which numbers are load-bearing and which are starting points.

## Mechanical notes

**The clean results are load-bearing, and there are a lot of them.** This document is not sloppy. Four reviewers ran independent mechanical sweeps and the machine-checkable layer came back essentially perfect; the failures above are failures of *propagation* and of *external fact*, not of care.

- **Inventory arithmetic: verified programmatically, three times independently** (regression, consistency, buildability). All 34 declared per-category counts equal the actual numbered entries; every category's 1..n numbering is gap-free; they sum to 487; exactly two `[Free]` per category, 68 total, matching G5, FR-G2, Appendix A's summary line and Appendix F's `(68)`; the Appendix A table matches `sections-inventory.md` category by category on ID, name, count *and* group. Every variant line carries a structural descriptor after an em dash (FR-G5's bar) — 0 bare entries.
- **Epic wave counts sum correctly and match their named groups.** E9 156 = Structure & Chrome 47 + Ghost Content 109; E10 199 = Marketing A4–A16; E11 132 = Template-Specific 104 + Ghost Native 28; total 487. Re-summed independently by three reviewers. E9's prose parenthetical names exactly the ten categories in the two groups it sums.
- **ID continuity: clean.** 116 FRs across domains A–Q, zero duplicates, zero gaps within any letter group, **zero references to an undefined ID and zero defined IDs that are never referenced** — including the range and slash forms `FR-J12–J15`, `FR-E1/E4`, `FR-J3/J4`. Same for G1–G10, P1–P8, NFR-1..9, T1–T4, E1–E15, AD1–AD3. Domain letters run A–I, then Q, then J–P — deliberate and explained in §5's preamble; fine for machine consumption, but a naive alphabetical sort will misorder it.
- **Cross-references: all resolve.** Every `§n.n` maps to a real heading; `Appendix A §31/§33/§34` land correctly in the companion; `addendum.md §AD1/§AD2` resolve; E1's `_bmad-output/planning-artifacts/design/` exists and is populated. One notation inconsistency: §7.6 says "Epics 9–11" where §8 uses "E9 · … E11 ·".
- **All 19 Synthesis Defaults variant references resolve** — every id, name and `[Free]` marking checked against the inventory by two reviewers independently (A1 #1, A3 #1, A4 #1/#2, A10 #1, A17 #1, A18 #1, A24 #1, A25 #1, A26 #1, A27 #1, A28 #2, A29 #1/#2, A31 #1, A32 #1/#2, A33 #1, A34 #1). The eight Appendix E starter variants likewise, all verified genuinely `[Free]`, so FR-O4's "all [Free]" claim holds.
- **The v2.0 pin was genuinely dropped.** A full scan across all three files returns only `prd.md`'s own `version: "2.3"`. No file claims to describe an earlier PRD version, and there are no stale dates — the only date tokens outside frontmatter are deliberate external-fact stamps.
- **Numeric coherence: clean.** Every quantity stated in more than one place was extracted and compared pairwise — 24 of them, from the 20-setting cap and its 3+17 split, through plan limits, retention, pricing, interaction budgets, pack and starter counts, `posts_per_page`, undo depth, sync interval, stress fixture, viewports, Lighthouse thresholds and the gscan target. All agree.
- **Regression outcome: 33 LANDED · 4 PARTIAL · 0 MISSING · 3 REGRESSED** across all 40 v2.1 findings. Not one agreed fix is absent from the text. The multi-file fixes that were *consciously treated* as multi-file all landed clean (H6 → three files, M14 → six sites, M4 → three files, M13 → two FRs, L2 → three sites) — the propagation discipline exists; it was applied unevenly.
- **Terminology: no synonym drift.** The "main feed" rename is complete (11 uses; all 12 occurrences of "primary" are unrelated senses). Glossary variance is trivial and position-driven only — `Style Pack` 24 / `Style Packs` 9, `main feed` 8 / `Main feed` 4, `Preview-only` 6 / `preview-only` 1 — all sentence-initial or table-cell-initial capitalization. No term is expressed two ways.
- **Appendix G deferral coherence: clean in both directions.** All 17 bullets checked each way — nothing in the PRD still calls "deferred" something Appendix G no longer defers, and no FR delivers something Appendix G still defers. The i18n narrowing to RTL-only is correctly encoded across all six touch points.
- **Assumptions Index roundtrip: N/A** — the PRD uses no `[ASSUMPTION]` tags; §7.6's "Verify at build time" list is the functional substitute and roundtrips correctly (all six items cite the FR or appendix that depends on them). Its *class* coverage is the gap, not its integrity. **UJ protagonist naming: N/A by design** — zero `UJ-` or `SM-` IDs, consistent with the delegation sentence.
- **Required sections for launch stakes: present** — measurable goals, principles, users, release strategy with an explicit DoD, FRs, NFRs, technical direction, epic sequencing, non-goals, glossary, unit economics, voice canon. The one absent-by-choice section (user journeys) is delegated with a named consumer. Companion coupling is deliberate on both sides, and nothing load-bearing lives only in the addendum — AD1's journal-invalidation rule and AD2's takeover loss accounting are already promoted into FR-D9 and FR-D18 as normative text.

## Reviewer files

- `review-st-rubric.md` — rubric walker (primary; seven dimensions, dimension verdicts and Overall verdict drive this report's spine)
- `review-st-regression.md` — audit of whether the 40 v2.1 findings landed in v2.3
- `review-st-adversarial.md` — hostile read of the new v2.2/v2.3 material
- `review-st-external-claims.md` — web-verified check of claims about Ghost, Dodo Payments and the competitor
- `review-st-buildability.md` — architect, story-writer and QA simulations
- `review-st-consistency.md` — cross-file mechanical sweep

Prior run, retained for history: `validation-report-v2.1.md` / `.html` (40 findings against v2.1, all triaged and encoded into v2.2/v2.3). Stale reviewer files from earlier sessions: `review-rubric.md`, `review-adversarial.md`, `review-adversarial-general.md`, `review-consistency.md`, `review-structure.md`, `review-2026-08-17.md`.
