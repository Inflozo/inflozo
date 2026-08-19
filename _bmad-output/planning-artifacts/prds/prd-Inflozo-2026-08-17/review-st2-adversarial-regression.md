---
title: Inflozo PRD v3.0 — Stress Test 2, Adversarial + Regression Review
reviewer: adversarial-regression
target: prd.md v3.0 + sections-inventory.md, addendum.md, appendix-b1-template-contexts.md, appendix-h1-string-catalog.md
date: 2026-08-18
---

# Stress Test 2 — Adversarial + Regression

**Verdict: the v3.0 encode largely held, and the arithmetic reconciles — but the root cause recurred.**

The counts are clean, the FR graph is clean, the membership correction propagated almost perfectly, and every one of the 13 v2.3 criticals I sampled is answered in the PRD body. That is a genuinely different document from v2.3.

But the failure mode that produced ~25 of the 135 v2.3 findings — *a fix written into its home FR and stopped there* — recurred in v3.0, in three distinct places, and one of them is a CRITICAL. The v3.0 final-verification entry in `.memlog.md` is itself the tell: it certifies "Zero stale counts (487/104/132/8766/459) **anywhere in prd.md**". Scoped to `prd.md`. Two of the seven normative companions still carry `487`.

**Counts: 4 CRITICAL · 22 HIGH · 15 MEDIUM · 5 LOW (46 total).** Regression contributes R-1/R-2/R-3 (HIGH) and R-4/R-5 (MEDIUM); the rest are adversarial.

---

## Regression

### R-0. Verdict on the encode

Sampled 31 findings and decisions, weighted to blast radius. Verified as **propagated correctly and completely**:

| # | Decision / finding | Home | Propagation checked | Result |
|---|---|---|---|---|
| 1 | C7 annotated-HTML compiler (no Handlebars parsing) | FR-J1 | §7.3, §7.1 Rendering, FR-H5, NFR-3 CSP (`no 'unsafe-eval'`), Appendix I glossary, preamble spike ref, E4 scope | PASS |
| 2 | C2 no `engines.ghost-api` | FR-J1 | §7.4 tree comment, NFR-7, FR-J6, §7.6 item 7 | PASS |
| 3 | C2 `page.hbs` gates on `@page.show_title_and_feature_image` | FR-I1 | FR-J6, appendix-b1 §3b | PASS |
| 4 | C5 paywall → non-placeable treatment | FR-H6 | FR-D5, FR-D12, FR-D13, FR-D17, FR-G1, §7.4, Appendix A carve-out table, Appendix I, sections-inventory A32 + carve-out, Appendix F row | PASS |
| 5 | C5 member-visibility control replaces the placed member ask | FR-D5 | Appendix C row, Appendix A universal-controls note, sections-inventory A2/A6/A22/A26 | PASS |
| 6 | Membership = ordinary Pages, `custom-{name}.hbs`, no route | FR-I1 | FR-D6, FR-D13 surface partition, FR-G2, FR-I5, FR-O1, §7.4, Appendix A A30 row, Appendix E preamble, sections-inventory A30 + NEVER-synthesized list, appendix-b1 §3/§7 | PASS — no surviving `members/` claim anywhere; every mention is an explicit negation |
| 7 | Account-scope cut (display-only Member Home; magic-link-sent is a form state) | A30 #11 | sections-inventory A30 content line (`sent-state copy`), variant list (13, no Account Panel / Account Minimal / Magic-Link Sent) | PASS |
| 8 | Never emit `page-{slug}.hbs` | FR-I1 | sections-inventory A30, §7.4 frozen-filename rule | PASS |
| 9 | Custom-template filenames are a frozen public API | §7.4 | FR-I1, sections-inventory A30, FR-J16's stable-filename requirement | PASS on the rule (see H-9 for the gap it left) |
| 10 | C1 Staff Access Token replaces the unreachable integration download | FR-J13 | FR-C1, FR-C3, FR-C8, §1.4 #5, §7.1 Vault, §7.5 `sites.staff_token_vault_ref`, E3 scope, FR-J16 | PASS on text (see C-3 for what it did *not* propagate to) |
| 11 | Pre-deploy drift detection (new FR) | FR-J16 | FR-C1, FR-J13, §7.5 variant-manifest row, Appendix I glossary, E7 scope | PASS |
| 12 | Count recomputation 487→485 etc. | FR-G1 | 30 occurrences in prd.md, Appendix A table + group sums, sections-inventory totals, NFR-5, NFR-6(a), E9–E11, E14, F.1 | **PARTIAL FAIL — see R-1** |
| 13 | 70 [Free] (68 + A29 #7 + A31 #10, A30 held) | FR-G2 | Appendix A tiering para, sections-inventory totals + all 70 tags, F.1 row, FR-O4 | PASS (independently recounted, see ledger) |
| 14 | Placeable 457 / treatments 28 | FR-G1 | Appendix A carve-out, sections-inventory carve-out, Appendix I, FR-D5/D12/D13/D17 | PASS |
| 15 | H30 no Lighthouse on generated themes | NFR-2 | G4, §7.6 removal, E14's marketing-only carve-out, E15 gate list | PASS — E14's `≥ 95` is explicitly scoped to Inflozo's own host |
| 16 | H31 reversal: axe-core / WCAG 2.1 AA / zero violations | NFR-5 | G4, FR-G4, FR-E3 live contrast check, FR-Q5 promotion caution, NFR-6(a) shared renders, E9–E11 exits, E15 | PASS |
| 17 | C10 NFR-3 text-node rule | NFR-3 | §7.3 same-origin justification, FR-H4, FR-C2 code-injection flag, FR-N2 gallery | **PARTIAL FAIL — see R-2 and C-1** |
| 18 | C4 `credit.*` locked namespace | FR-Q6 | FR-J15, appendix-h1 S7 + §3.13 + V7, F.1 Translations row | PASS |
| 19 | C3 no edit-URL-in-place | FR-C8 | FR-C6 record-id keying, FR-J13 snapshot binding, §7.5 | PASS |
| 20 | C6 `site_snapshots` keyed on `user_id` | §7.5 | §7.1 bucket, FR-J13, FR-A5 download-before-purge, FR-C6 orphan TTL | PASS on storage (see C-4 for what the purge clause broke) |
| 21 | C8 epic re-sequencing + E4/E7 joint gate + 5 pilot sections | §8 | E3 exit note, E4 exit note, E5/E6 gates, E13 FR-C7 move, E1 notifications table | PASS |
| 22 | C9 `project_site_bindings` exempt from pruning | §7.5 | FR-J10, FR-J7 | PASS |
| 23 | C12 gscan version pin | FR-J6 | §7.6 item 7, §7.6 risk row | PASS |
| 24 | C13 one compatibility broadcast per release | FR-C5 | FR-G3 `ghostCompat`, FR-P1/P2 carve-out, F.1 row, §7.6 item 8, §7.5 note | PASS |
| 25 | H1 exactly one locale file | FR-Q6 | §7.4 tree, Appendix B chrome-strings block, appendix-h1 S4/V3 | PASS |
| 26 | H2 JS strings via `data-i18n-*` | FR-Q6 | FR-J4, appendix-h1 S5/V5/V6 | PASS |
| 27 | M46 unsynced **edits** canonical | FR-D18 | AD1 ops-vs-edits, AD2 `unsynced_edits`, AD4 load-bearing list | PASS |
| 28 | H36 journal cleared only on superseding hydrate | FR-D9 | FR-D10, AD1.1 three-outcome table, Appendix I "Cloud snapshot" | PASS |
| 29 | M43 §4 targets exempt from FR-J11 rate limit | §4 | FR-J11 (deliberate duplication, logged as accepted) | PASS |
| 30 | M49 Test→Live cutover migration | §4 | E15 exit | PASS |
| 31 | M35 E1 dashboard cut line | §8 E1 | E13 close-out list | PASS |

**Cross-reference integrity: clean.** Every one of the 119 FR identifiers referenced across all five files resolves to a definition (zero dangling). Every `Appendix X` and `Appendix A §nn` reference resolves. Every `§n.n` reference resolves in its host document, and the `§n` references into the three research companions resolve to real `## n.` headings. All seven normative companions named in the preamble exist and carry `status` frontmatter; `spike-compiler/` exists and is populated; `_bmad-output/planning-artifacts/design/` (cited by E1) exists.

---

### R-1 · HIGH — the root cause recurred: two companions still say **487**

`.memlog.md`'s final verification claims "Zero stale counts (487/104/132/8766/459) **anywhere in prd.md**" — and that scoping is exactly the defect. The count fix stopped at `prd.md` and `sections-inventory.md`.

- `appendix-b1-template-contexts.md:267` — "**Inverts zebra striping across the entire 487-variant library.**" This is the single highest-priority verify-at-build item in the whole document (`@even`/`@odd` parity), and its blast-radius statement is stale.
- `appendix-h1-string-catalog.md:287` — "Load-bearing for NFR-5 (axe-core, WCAG 2.1 AA on all **487** variants)". Directly contradicts NFR-5's "all 485 shipped variants".

Both files are marked **normative-companion**. A downstream agent reading either gets a different library size from the PRD's. Fix is two edits, but the *pattern* is what matters: the verification was scoped to one file when the decision spanned seven.

### R-2 · HIGH — the C10 scope cut did not reach FR-D16

C10 (canvas never reads post/page body HTML) propagated to NFR-3, §7.3 and FR-H4 — where FR-H4 states it unconditionally: "`{{content}}` renders dummy placeholder prose **in every content layout**."

FR-D16 was left in its pre-C10 form: "With a linked site, **gated** post bodies render Orbit Weekly stand-in text with a 'gated content — shown with sample text' indicator: the browser-safe Content API never returns members-only content, so real gated bodies are not previewable."

That sentence's entire premise is that *non-gated* bodies **are** previewable, and it gives a distinct visual affordance to a distinction that no longer exists. Two FRs now describe two different canvas behaviours for `{{content}}`. This is also the seed of C-1 below.

### R-3 · HIGH — the `data-portal="upgrade"` correction did not reach the inventory

v3.0's membership research found and fixed a real Ghost defect: `upgrade` is not a Portal value, `account/plans` is, and Ghost's own Source theme ships the broken one. That correction landed in FR-F6, Appendix B (with the "must not be copied" warning) and sections-inventory A30. It did **not** land in two other places in the same normative file:

- `sections-inventory.md:421` — A22 Newsletter/Subscribe, `Controls:` line: "portal action (signup / signup/{tier} / **upgrade**)".
- `sections-inventory.md:588` — A32 Paywall, `Content:` line: "cta labels (portal actions signup / signup/{tier} / **upgrade**)".

`sections-inventory.md` is the file the E9–E11 category stories are authored against. A dev building A22's 16 variants or A32's 12 designs from the inventory ships the exact broken attribute the PRD went to the trouble of documenting. 28 variants across the two categories.

### R-4 · MEDIUM — the tier-purchasability rule reached A30 and A32 but not A7

FR-H6 declares the rule normatively for "Pricing sections, the paywall, membership pages", and the inventory records it on **A30** ("Paid CTAs gate on `@site.paid_members_enabled`, never on tier presence") and implicitly on A32 via its shared FR-H6 reference. **A7 Pricing & Tiers (15 variants)** — the largest tier-bound category and the one a normal marketing homepage actually uses — carries neither the `paid_members_enabled` gate nor the `type:paid+visibility:public` filter in its inventory entry. FR-H6 covers it at the PRD level, so this is not unsafe, but the category story will be written from the inventory line.

### R-5 · MEDIUM — `admin` claim provisioning is still unowned

Buildability A24 ("§3's `admin` custom claim is provisioned by no FR") was answered by adding the words "admin claim" to E13's story list. There is still no FR, no mechanism (Supabase dashboard? SQL? a bootstrap script?), and §7.5's beyond-the-sketch table does not mention it. The moderation surface FR-M4 specifies cannot be reached in production without one.

---

## Adversarial

### CRITICAL

**C-1 · NFR-6(c3), the only gate on the WYSIWYG promise, cannot pass by design.**
`NFR-6(c3)` — "the canvas rendered against the same page deployed to a real Ghost target, at (a)'s threshold" — inherits (a)'s threshold of **1% differing pixels**. FR-H4 and NFR-3 mandate that the canvas renders **dummy placeholder prose** for `{{content}}` in every content layout, while the deployed page renders the real post body. On `post.hbs` — the template this test matters most on — the entire content column differs, permanently, by design. Ghost additionally injects the Portal floating button via `{{ghost_head}}`, renders a real comments app where FR-H5 puts "a styled placeholder", and executes any code injection FR-C2 warned about. The only exclusion the PRD states is FR-D16's gated-body carve-out.

This is the C10 decision (canvas reads no body HTML) and the C11 decision (layer-3 perceptual diff) landing in the same document without ever being reconciled — the v2.3 root cause, at the highest stakes in the PRD. §1.2's "the canvas is the page, not a preview of it" has no surviving test.
*Fix:* NFR-6(c3) needs an explicit exclusion set (post/page body region, Portal button, comments mount, code-injection regions) and a region-scoped threshold, or it needs to compare chrome-and-section regions only. Say which, in NFR-6(c3), not in an FR three sections away.

**C-2 · NFR-3's CSP forbids the same-origin iframe §7.3 mandates.**
NFR-3 sets `frame-ancestors 'none'` app-wide. `frame-ancestors 'none'` is equivalent to `X-Frame-Options: DENY` — it blocks framing **including from the same origin**. §7.3 mandates a same-origin canvas iframe; FR-N2 reuses the same hosting model for the marketing gallery on SSG pages. Implemented literally, the editor canvas and every gallery preview are blank. The PRD never says whether the canvas iframe is a real document (blocked), `srcdoc`, or a blob URL — a distinction that also determines whether the rest of the CSP applies to it at all.
*Fix:* `frame-ancestors 'self'`, plus one sentence in §7.3 stating the iframe's document source.

**C-3 · The Staff-Access-Token capability is asserted as settled fact in five places and listed as unverified in a sixth.**
FR-J13: "Inflozo therefore reads the live theme with the site Owner's Staff Access Token (FR-C1), which that allowlist **does not bind**." FR-C1, FR-C3, §1.4 #5 and FR-J16 all build on it as fact. §7.6 item 9 then says: "**Whether** the Owner's Staff Access Token lifts `GET /themes/`" — and frames the consequence as *theme-name collision detection*, not as the pre-Inflozo snapshot or the drift check. §7.6's risk table has **no row** for it.

Every other external-world dependency in v3.0 is either verified with a citation or carries a risk row and a designed fallback. This one — the replacement for the highest-severity v2.3 finding, introduced by owner override rather than by verification — is the exception. If it is false, FR-C1's mandatory third credential, FR-J13, FR-J16, §1.4 #5's brand promise and E3's connect wizard all fall at once, and the degraded path becomes the only path.
*Fix:* restate §7.6 item 9 to name the snapshot and drift check as the dependents, add a risk row with the fallback (the FR-J13 degraded path becomes default), and verify before E3 — not before E7.

**C-4 · FR-A5's GDPR purge is gated on an action a departed user will never take.**
Same FR, two clauses: "honors a 14-day soft-delete window **then hard purge (GDPR)**" and "the purge proceeds **only once the user has downloaded or explicitly declined** them [the snapshots]". A user who requests deletion and never signs in again is never purged, indefinitely. That is the *normal* case for account deletion. Self-contradictory as written, and on the wrong side of the obligation it cites.
*Fix:* offer the download during the 14-day window and at the deletion request, then purge on the deadline regardless — or hold snapshots only, under a separate stated legitimate-interest basis with its own TTL.

---

### HIGH

**H-1 · `bindingContext` / `compileTarget` are the mechanism three FRs and one epic gate depend on, and they are declared in hedged prose.**
FR-D12 (picker filter), FR-D13 (shuffle partition), FR-D17 (remix restriction) and E5's zero-prop-loss exit all partition on *equality* of these two values. The declared values in `sections-inventory.md` and Appendix A include:
- single filenames (`post.hbs`), **sets** (`post.hbs, page.hbs` on A24/A25), a **wildcard** (`any` on 20 categories), a **template** (`custom-{name}.hbs`), a **directory** (`assets/css (cards.css)`), and a **non-file** (`collection empty state`, A31 #8);
- per-variant enumerations (A29, A31) alongside parenthetical hedges that are *not* per-variant: A20 "`tags` (+ `posts` **on the variants that show them**)", A21 "`authors` (+ `posts` on the variants that show them)", A22 "`none` (+ `@member`; **`tiers` on #8**)", A7/A12/A15 "`none` (`tiers`/`authors`/`posts` via the Data group)".

Equality over that value space is not defined. Is `any` equal to `post.hbs`? Does A20 #7 (which shows posts) share a ring with A20 #3 (which doesn't)? A22 #8 declares `tiers` alone and therefore has a one-member shuffle ring — the arrows do nothing on it and the Picker offers only it. FR-G3 says these are "declared per category, or per variant where a category's variants differ" — six categories differ *and are not declared per variant*.
*Fix:* make both fields closed enumerations in the registry, resolve `any` and the sets into an explicit match relation, and push every hedge into per-variant declarations. This is a prerequisite for E4, not E9.

**H-2 · A31 #8 "Empty Tag State" has a compile target that is not a file and no surface that can place it.**
Declared `compileTarget: the empty state of a collection template`. FR-G3 defines `compileTarget` as "the file it compiles into". §7.4's tree has no such artifact — an empty state is an `{{else}}` branch inside `{{#foreach posts}}` on `tag.hbs`/`index.hbs`. FR-D12 offers only variants whose `compileTarget` matches the template being edited; nothing matches. So A31 #8 is a launch deliverable (FR-G1: "every listed variant is a launch deliverable") with no picker entry, no shuffle partner and no emission rule. Same structural defect the v2.3 review found for `private.hbs`.

**H-3 · FR-G5's "mechanical proxy" is a CI assertion over free prose and therefore tests nothing.**
"Every variant declares the structural descriptor that follows its name in Appendix A, and no two variants in a category may share a structural **descriptor tuple** — a CI assertion over the inventory." What follows each name in the inventory is a sentence: *"logo left, links right, optional CTA button end."* "Tuple" is defined nowhere. String-equality over 485 distinct English sentences passes unconditionally. The proxy exists precisely so the ~3,500 pairwise comparisons are not unaided human judgment, and as specified it restores exactly that.
*Fix:* define the descriptor as a real tuple (e.g. `{arrangement, media_position, columns, emphasis, chrome}`) with closed values, and make it a registry field, not a prose suffix.

**H-4 · FR-L3's exit-block remediation does not apply to 22 of the things it gates.**
The sheet offers, per section: "upgrade · **swap to a Free variant via Shuffle** · **remove it**". The 28 non-placeable treatments are explicitly excluded from Shuffle (FR-D13) and from Layers (FR-D5), and 22 of them are Pro (A32 #3–#12, A33 #3–#6, A34 #3–#10). A Free user who selects A34 #5 as their pagination style, or A33 #4 as their Koenig treatment, hits a block sheet whose two remedial actions do not exist for their object. There is no stated "none" option for A33 or A34 either — `cards.css` and `partials/pagination.hbs` ship unconditionally per §7.4.
*Fix:* add a fourth remediation ("revert to a Free treatment") and state the default treatment for A33 and A34.

**H-5 · The Private canvas fix propagated the word, not the mechanism.**
v2.3 Consistency HIGH-1: "`private.hbs` has no design surface anywhere in the three files." v3.0's FR-D6: "a conditional **Private** canvas … it appears **once a Private Site Gate (Appendix A §31) is called for**, opens empty, and compiles `private.hbs` only when designed — without it that variant is a launch deliverable with no surface that can create it." The PRD names the problem and then leaves the trigger as "is called for". Nothing anywhere says what calls for it. A31 #10 can only be placed on the Private canvas, which only appears once A31 #10 is called for. Meanwhile the three membership canvases — structurally the identical case — are unconditional switcher entries. Two identical cases, two different treatments, one of them circular.

**H-6 · The membership `custom-{name}` filename is a frozen public API with no naming rule and no collision rule.**
§7.4: "A `custom-{name}.hbs` filename may **never** change once deployed" — Ghost stores the exact string on every page selecting it, and the filename *is* the Template-dropdown label the user must recognise. Yet:
- Nothing states where `{name}` comes from for the three membership canvases. FR-D6 names them "Signup / Signin / Member Home"; `sections-inventory.md` A30's worked example is `custom-membership.hbs` → "Membership"; §7.4's worked example is `custom-member-home.hbs` → "Member Home". Three fixed canvases or one user-named page is not decided.
- FR-I3's Routes Manager custom templates emit into the **same namespace** (`custom-{name}.hbs`, theme root). A user creating a Routes Manager template named "signup" collides with the membership canvas. §7.4's collision rule ("numeric suffix on collision within its directory") is scoped to *section partials* and explicitly excludes custom templates from the whole rule it belongs to. FR-I2's validation checks "path collisions, unknown templates, filter syntax" — not filename collisions with the membership class.
A silent collision here detaches live pages with no error at compile, upload or render, which is the exact failure §7.4 wrote the frozen-API rule to prevent.

**H-7 · FR-B1's client-side thumbnail capture is probably unimplementable, and Appendix F depends on it.**
"The thumbnail is captured client-side from the same-origin canvas (§7.3) … no headless browser and no server-side render of the section runtime exists anywhere in the product." No method is named. The two client-side options both fail here:
- `canvas.drawImage` / SVG `foreignObject` → the canvas is **tainted** the moment a Ghost-hosted image is drawn. Ghost serves `/content/images/…` without CORS headers by default, and FR-H4 puts the user's real content on the canvas. `toBlob` then throws a SecurityError.
- A DOM-to-image library re-implements rendering, which P4 and §7.3 reject in every other context.

F.3 rests on this: "thumbnail capture is client-side from the canvas (FR-B1), so **no headless-browser service exists to cost**", and §7.1 states "no headless browser runs on Vercel and Appendix F carries no Chromium line item". If the capture path needs a server, an uncosted service appears in a model whose break-even is 9–11 customers.

**H-8 · NFR-4 mandates PITR; Appendix F costs no PITR line.**
"Supabase Postgres **point-in-time recovery (PITR) enabled** for user work-product, with a restore drill exercised before launch" — an NFR, and an E15 gate. F.3's Supabase line is `$25` for "Supabase Pro (organization)". PITR is a paid Supabase add-on on top of Pro, not an included feature, and it is billed **per project** — so both Live and Test would carry it under §4's two-set topology. This is the largest single uncosted item in Appendix F, and it lands directly on G7's headline number. Verify the current add-on price and re-run F.5; a three-figure monthly add-on roughly doubles the fixed cost and moves break-even from ~11 to the high teens.

**H-9 · Appendix F models servers and prices a product whose dominant cost is authorship.**
F.3 is titled "Cost basis — permanent fixed cost" and contains eight infrastructure lines and no labour line. Against it:
- 485 hand-authored variants (annotated HTML + plain flat CSS + optional JS + content schema + control schema + `ghostCompat` + `previewSeed` + `darkCapabilities` + `quickControls`), each of which must clear responsive 390→1440, WCAG 2.1 AA at zero axe violations, the structural-uniqueness bar, the render matrix and compile CI.
- FR-J14 commits, as a **retention commitment**, to "monthly drops of new variants and/or Style Packs" — forever. F.6 then names that cadence as one of three levers offsetting modeled churn, at zero cost.
- 8,730 screenshot baselines needing a first human approval pass, plus the per-release mass-rebaseline reviews NFR-6(a) mandates.
- 10 starter templates, each a fully designed multi-template project.

"Break-even at 9–10 Pro subscribers" is a statement about hosting, presented in G7 as a statement about the business. That is not a rounding error; it is the difference between "profitable at 10 customers" and "profitable never, at $15/mo, if authorship is bought". State it: either the labour is the founder's own unpaid time (say so in F.3 and in the assumed-and-unvalidated table) or it is a line item.

**H-10 · Appendix F's capacity claim is wrong by ~10× against the plan matrix it sits next to.**
F.7: "≈ 1,200 accounts consume ≈ $140–190/mo of infrastructure … **comfortably inside Supabase Pro's included storage and egress**." F.1 grants Pro users **5 GB** of asset storage and Free users 100 MB. At the scenario's own shape: 200 × 5 GB + 1,000 × 100 MB = **1.1 TB** against Supabase Pro's included **100 GB**. Even at 20% quota utilisation it is 2× over. Add the storage F.3 waves through as "storage-cheap": deploy artifacts at 10 per project × 25 projects × 200 Pro = **50,000 theme zips** (each carrying up to 200 KB of fonts plus bundled images), plus up to 10 pre-Inflozo snapshots per Pro account, all explicitly *excluded from the user's quota* and therefore paid by Inflozo. None of it is computed anywhere.
*Fix:* compute the storage line at the scenario's shape and at a stated utilisation rate, and retire "comfortably inside".

**H-11 · E14's two exit criteria contradict each other.**
"*Exit:* gallery renders all 485 variants; … **Lighthouse ≥ 95** on the marketing site." FR-N2 puts every variant on a category SSG page "as a live render … in a same-origin iframe" with a per-preview light/dark toggle. A4 Heroes is 18 iframes on one page; A17 is 18; A1/A3 are 16. Each iframe boots the section runtime, its stylesheet and its font faces. Lighthouse ≥ 95 (LCP + TBT) on an 18-iframe page is not reachable. One of the two has to give — lazy-mount below the fold, static screenshots with live-render on demand, or drop the score.

**H-12 · NFR-2's CSS budget has no artifact to measure.**
"(4) a **CSS budget of ≤ 50 KB gzipped per rendered template** (tokens + shared primitives + that template's section styles)". §7.4 emits **one** `assets/css/screen.css` containing "tokens + base + used-section styles" for the whole theme, plus `cards.css`. There is no per-template stylesheet, so "per rendered template" is not a measurable property of the emitted theme — and the union across 8+ templates is what the visitor actually downloads. Either emit per-template CSS (which fights the "one organized stylesheet" requirement in FR-J1) or restate the budget against the artifact that exists.

**H-13 · The Owner Staff Access Token breaks the security posture P8 advertises, and the persona who most needs it usually cannot supply it.**
FR-C1 makes it **required, not optional**, for every connection. A Ghost Staff Access Token carries the full permissions of the staff user — for the Owner, that is unrestricted Admin API access: create, edit and delete posts, pages, members, tiers and settings. P8 promises "Inflozo never creates, modifies, or deletes the user's Ghost content", and NFR-3's threat model treats the vault contents as "Admin API keys and the Owner Staff Access Token" without distinguishing their blast radii. A vault compromise is now site-destroying rather than theme-scoped, and nothing in NFR-3, NFR-4 or §7.6 acknowledges the escalation.

Separately: Ghost has exactly one Owner per site. §3's **multi-site operator** persona (Pro, up to 10 connections) is typically an Administrator on a client's site, not the Owner. For that persona the snapshot and drift check are unavailable by default, and FR-J13's "designed degraded path" is the ordinary path — which the PRD frames as the exception.

**H-14 · Three credential mints inside a 10-minute p75.**
G1: "Connect Ghost site → branded canvas … **< 10 minutes** end-to-end for a first-time user, **including creating the Custom Integration in Ghost Admin**". FR-C1 now requires the user to create a Custom Integration *and* mint a Staff Access Token on the Owner account, then paste **three** credentials. G1's text still names only the integration. The target was set against a two-key flow and was not revisited when the third credential landed — and the test that gates it is a moderated session with n=8, run once.

**H-15 · NFR-3's `connect-src` is per-user dynamic, stated as a static header.**
"`connect-src 'self'` plus the Supabase project origin **and the connected Ghost site's origin**". A Pro account holds up to 10 connections, each an arbitrary user-supplied domain, and a project can switch sites (FR-B5). CSP is a response header. That means the app's CSP must be computed per request from the signed-in user's site list — on an app that also serves SSG marketing pages from the same deployment (§7.1: "two domains, one deployment"). Neither the mechanism nor the marketing/app split of the policy is stated.

**H-16 · Upload-succeeds / activate-fails is unspecified, and four requirements disagree about what happened.**
FR-J8's stages are Compiling → Checking → Uploading → (Activating) → Live, and "once Uploading starts, the deploy runs to completion". Ghost's upload and activate are separate operations. If upload succeeds and activate fails:
- FR-J11 says "a failed upload never leaves a partially active theme" — but this was not a failed *upload*.
- FR-J13 triggers the snapshot at "Inflozo's first theme **upload** to a site (deploy-only included)" — so it fired.
- FR-J10 freezes the theme name "at the project's first **deploy** to that site" — did a deploy occur?
- FR-J16 compares against "what Inflozo **last deployed** there" — the theme *is* on the site, so the manifest must be updated or the next deploy reports false drift, violating FR-J16's zero-false-positive requirement.
Four FRs, four different notions of "deployed". This is the most likely real-world partial failure and it has no defined state.

**H-17 · Swatch Row's five roles do not map onto the seven Style Pack colour tokens.**
Appendix C, Swatch Row: allowed values **Base / Surface / Accent / Contrast / Image**. FR-E1's colour token set: **background, surface, text, muted text, border, accent, on-accent**. "Base" ≈ background (different name), "Contrast" ≈ on-accent or an inverse (undecided), and "Image" is not a colour token at all. This is the **Background role** universal control — it sits on every one of the 485 variants and on every per-mode dark override (FR-D7, FR-F5). The mapping from its five values to CSS custom properties is the single most-used compile rule in the library, and it is not written down.

**H-18 · The Paywall editor is a whole second canvas surface with no spec, no epic exit and no UX delegation.**
FR-H6 introduces "a standalone **Paywall editor** with its own canvas". That is a second editing surface with its own selection model, its own controls sidebar (A32 carries the universal controls plus six of its own), its own light/dark and member-state previews, and its own relationship to the Ghost paywall cutoff. It is owned by E5 (FR-H6), its designs ship in E11 (A32), and its output is emitted by E7 (`partials/content-cta.hbs`) — with no joint gate across the three. It appears in none of the four mandated UX journeys and none of the five mandated flows. The delegation header names FR-J13's snapshot gate, FR-D18's lock choreography, FR-I4's routes card, FR-J14's confirm and FR-C2's Preview-only explanation — but not the one *new editor* in the release.

**H-19 · The dev-team assumption is load-bearing and unstated as a risk.**
§7.3: "**All 485 sections are authored by the dev team** as project work (E9–E11)." §8: "In the library epics **a category is a story** — 34 stories, not 485." E9 is 156 variants in 10 stories; E10 is 199 in 13; E11 is 130 in 11 *plus the ten starters*. That is a median of ~15 variants per story, each variant carrying its own responsive, AA, uniqueness and render-matrix obligations, plus 8,730 baselines to approve. §4 forbids de-scope: "if library waves slip, **launch slips**". §7.6's risk row for library scale offers "factory workflow + shared primitives" as the mitigation — a process, against a volume problem.

Said plainly: E9–E11 is the majority of the release's work, it is sequenced *after* the entire editor, compiler and style system, it has no cut line, and the mitigation is a workflow. If any part of this plan slips, it slips here, and the PRD's only response is to move the launch date. That may be the right choice — but the PRD nowhere states the assumed team size, the per-variant authoring budget, or what "the dev team" is. An Architect reading E9's "10 stories" will size the epic by story count.

---

### MEDIUM

**M-1 · G7's headline break-even excludes a cost that exists at the first customer.** F.5 offers two numbers: 9–10 (baseline, Test excluded) and ~11 (Test included). §4 makes Test permanent "**from the first customer onward**". Break-even by definition requires ≥1 customer, so the 9–10 figure describes a state that cannot exist. G7 quotes 9–10. It is disclosed ("**before** the permanent Test-environment cost"), which makes it honest — and still the wrong headline.

**M-2 · F.7 applies a conversion *rate* as a standing population *ratio*.** "At G9's actual target: 1,000 Free implies ≈ 31 Pro." G9 is "≥3% free→Pro **within 90 days of signup**" — a cohort conversion rate. With 4%/mo Pro churn and continuous signup, the steady-state Pro share of the live population is materially below the cohort conversion rate. $391/mo is optimistic; the direction and rough magnitude should be stated.

**M-3 · F.6's monthly tenure double-counts month 1.** "1 month paid, then 75% continue into a 4%/mo geometric (1 ÷ 0.04 = 25 further months) → **19.75 months**." On the stated model, `1/p = 25` is the expected *total* months from the start of the geometric phase, so *further* months is 24, giving `1 + 0.75 × 24 = 19.0`. ~4% overstatement of the monthly cohort's LTV. Small, but it is one of two inputs to the blended figure the whole appendix quotes.

**M-4 · F.4's midpoint rounds up.** Domestic $13.925 + international $13.70 → $13.8125, stated as **$13.82**. Correct to $13.81. Every downstream figure (blended $12.61, break-even, LTV) is computed from $13.82; the drift is ~1¢/customer/month and does not move any conclusion.

**M-5 · F.3's baseline band excludes its own minimum.** Lines sum to $107 with Resend on the free tier ("free tier covers launch send volume") and T4 at the $15 yearly rate, and to $127 at the maxima. The stated band is **$110–130**. The low end is above the computed floor.

**M-6 · A33 loses its selection surface when A25 is removed; A34 loses it on a zero-feed template.** A33's Koenig treatment is chosen in "the Style group of Post Content Layout (A25)". A25 is an ordinary placeable section a user can delete. `assets/css/cards.css` ships unconditionally (§7.4, FR-J3). A34's pagination style is chosen on "the designated main feed" — and FR-H2 explicitly allows a paginated template with **zero** feed sections, while `partials/pagination.hbs` is listed as unconditional site chrome. In both cases the emitted artifact outlives its control, with no stated default.

**M-7 · FR-C5's exempt compatibility redeploy silently carries every unrelated library change.** FR-J14 is emphatic: "Compiles always use the current library version … **any redeploy includes all library changes since the project's last deploy** — there is no way to redeploy without them", and therefore "a **mandatory confirm step**" precedes every deploy where the library has advanced, so that "a live site never changes except through a user-initiated redeploy plus this confirmation." FR-C5's compatibility redeploy is then exempted from that confirm. The exemption is stated as re-shipping "a design that already ran" — but by FR-J14's own mechanics it cannot: it recompiles against the current library and ships every accumulated change. The exemption defeats the guarantee it was carved out of.

**M-8 · `previewSeed` and `darkCapabilities` are registry fields with no definition.** Both appear in FR-G3's entry format. `previewSeed` gets one sentence in FR-H3 ("maps into this dataset") with no shape; `darkCapabilities` appears once more in FR-F7 ("dark-override capability flags") and nowhere else. Both are per-variant authoring obligations across all 485 variants, and E4 owns the registry format.

**M-9 · FR-L2's dispute transition has no reverse.** "`pro_active → free` **immediately on a dispute being opened**." Disputes are frequently resolved in the merchant's favour, and are sometimes bank error or friendly fraud on a legitimate customer. The instant consequence is FR-L3's over-limit cascade: 24 of 25 projects read-only, deploys blocked. No transition back exists in the state machine.

**M-10 · A22 #8 has an empty shuffle ring; A20/A21's rings are undefined.** Consequence of H-1, called out separately because it is user-visible: FR-D13's arrows and `[ ]` keys are advertised on every placed section, and on A22 #8 they will do nothing.

**M-11 · No epic owns the initial render-matrix baseline approval.** NFR-6(a) requires a stored screenshot baseline for every variant and makes mass rebaseline an owner-approved event with a sampled review. The *first* 8,730 baselines have to be approved by someone; E9–E11 exit on "passes the render matrix" (which presumes baselines exist) and E15 does "render-matrix sign-off". The bootstrap is unassigned.

**M-12 · F.3 asserts Vercel and Supabase usage rather than computing it.** "Vercel Pro (team) $20 — priced per seat; a second project or environment on the same team adds nothing." True of seats; not true of function execution and bandwidth, and §7.1 explicitly budgets compile as "a long-running Node function" sized above the platform default. Probably fine at the modelled population — but it is asserted, in the one appendix whose job is not to assert.

**M-13 · NFR-6's CI volume is uncosted.** 8,730 Playwright screenshots plus an axe pass per run, a nightly compile-CI over 100% of variants, and per-commit `.hbs` snapshot diffs for 485 variants. F.3 disposes of this in a clause: "the render matrix runs on **CI runners already inside the Vercel/CI lane**". Vercel does not provide general-purpose CI runners; this is GitHub Actions minutes (or equivalent) at multi-hour nightly runs, and it is the one variable cost that scales with library size rather than with customers.

---

### LOW

**L-1** — F.4's Dodo fee schedule ("4% + 40¢, plus 1.5% international, plus 0.5% subscription") is applied consistently but is a §7.6 verify-at-build item; every figure in F.4–F.7 is downstream of it, and F.5's bands are narrow enough that a 0.5% schedule change moves break-even by a whole customer.

**L-2** — FR-J11's rate-limit exemption is stated verbatim in both §4 and FR-J11. The memlog logs this as accepted duplication with known drift risk; it is worth one cross-reference instead of a second copy.

**L-3** — `§7.2` is never referenced from anywhere in the PRD. Harmless, but it is the only §7 subsection with no inbound link, which usually means its content lives somewhere else too (it does — §7.1 and FR-C3 both restate the client/server API split).

**L-4** — Appendix E's Ledger starter is claimed "all [Free]" and enumerates A4 #2, A17 #1, A10 #1, A32 #2 — all correctly [Free]. But a starter is "Home + Post + Page + Tag + Author + 404 designed" and therefore also carries a header (A1) and footer (A3), which the enumeration omits. The claim holds under the first-two rule; the enumeration reads as exhaustive and is not.

**L-5** — `appendix-h1-string-catalog.md` §4's totals table is immediately preceded by §3.13, and the section numbering runs `## 3` → `### 3.13` → `## 4`. Any automated key-count check that walks `### 3.x` tables will run into §4's summary table (13 rows keyed the same way) and over-count by 13. Cosmetic, but the catalog is explicitly a machine-validated artifact (V1–V8).

---

## Arithmetic ledger

Every figure recomputed from primary text, independent of `.memlog.md`'s claims.

| # | Claim | Where | Independently computed | Result |
|---|---|---|---|---|
| 1 | 119 FR definitions | §5 | 119 (`^- \*\*FR-…\*\*`) | **PASS** |
| 2 | Zero duplicate FR ids | §5 | 0 | **PASS** |
| 3 | Zero gaps, 17 letter blocks | §5 | 17 blocks, contiguous 1..n: A6 B7 C8 D18 E5 F7 G6 H8 I5 J16 K6 L5 M4 N5 O4 P3 Q6 | **PASS** |
| 4 | Zero dangling FR references | all 5 files | 0 across prd, inventory, addendum, appendix-b1, appendix-h1 | **PASS** |
| 5 | 34 categories | FR-G1 | 34 headers in inventory; 34 rows in Appendix A | **PASS** |
| 6 | 485 variants | FR-G1, G5 | Appendix A table sums to 485; inventory headers sum to 485; **485 enumerated variant lines** | **PASS** |
| 7 | Group sums 47+199+109+102+28 | Appendix A | 47 (16+15+16) · 199 (18+16+11×15) · 109 (18+15+15+15+15+16+15) · 102 (16+12+15+12+10+14+13+10) · 28 (12+6+10) = **485** | **PASS** |
| 8 | Appendix A ≡ sections-inventory on all 34 rows | Appendix A | id, name and count match on every row | **PASS** |
| 9 | 70 [Free] | FR-G2, Appendix A | 70 variant-line tags; exactly first-two of all 34 (68) + A29 #7 + A31 #10 | **PASS** |
| 10 | 68 base Free | Appendix A | 34 × 2 = 68 | **PASS** |
| 11 | Placeable 457 | FR-G1 | 485 − 28 = 457 | **PASS** |
| 12 | Treatments 28 | FR-G1 | A32 12 + A33 6 + A34 10 = 28 | **PASS** |
| 13 | A30 = 13 | Appendix A | 13 enumerated; no surviving "15" | **PASS** |
| 14 | E9 wave = 156 | §8 | A1–A3 (47) + A17–A23 (109) = 156 | **PASS** |
| 15 | E10 wave = 199 | §8 | A4–A16 = 199 | **PASS** |
| 16 | E11 wave = 130 | §8 | A24–A31 (102) + A32–A34 (28) = 130 | **PASS** |
| 17 | Waves sum to 485 | §8 | 156+199+130 = 485 | **PASS** |
| 18 | Story counts 10+13+11 = 34 | §8 | A1–A3+A17–A23 = 10 · A4–A16 = 13 · A24–A34 = 11 · = 34 | **PASS** |
| 19 | Render matrix 8,730 | NFR-6(a) | 485 × 3 × 2 × 3 = 8,730 | **PASS** |
| 20 | NFR-5 scope "all 485" | NFR-5 | consistent with 6 | **PASS** |
| 21 | Stale 487 | all files | **2 occurrences**: appendix-b1:267, appendix-h1:287 | **FAIL** (R-1) |
| 22 | Stale 104 / 132 / 8766 / 459 | all files | 0 occurrences | **PASS** |
| 23 | Stale "71 Free" | all files | 0 occurrences | **PASS** |
| 24 | Every FR owned by exactly one epic | §8 | all 119 mapped; FR-P1 deliberately split across E1/E3/E7/E12 by email number; FR-Q6 deliberately split E4/E7; FR-G1/G4/G5/G6 jointly E9–E11 as stated | **PASS** |
| 25 | 12 Style Packs / 30 pairings | Appendix D | 12 pack rows · 30 pool rows (D1–D30) | **PASS** |
| 26 | "23 emit 3 files, 3 emit 2, 4 emit 5" | Appendix D | Files column: 2 → D12, D19, D22 (3) · 5 → D8, D15, D27, D30 (4) · 3 → remaining 23. 23+3+4 = 30 | **PASS** |
| 27 | D.a rule 3 "D12, D19 and D22 are the pool's two-file pairings" | Appendix D.a | three pairings, each emitting two files; matches the Files column | **PASS** |
| 28 | String catalog = 131 keys | appendix-h1 §4 | 18+7+12+22+12+6+15+8+10+8+4+6+3 = **131**; every namespace's declared count equals its enumerated rows | **PASS** |
| 29 | Catalog locked = 3, listed = 128 | appendix-h1 §4 | 3 `credit.*`; 131−3 = 128 | **PASS** |
| 30 | Dodo net, monthly $15 | F.4 | dom 15−(4.5%+0.40) = 13.925 → **13.93**; intl 15−(6%+0.40) = **13.70** | **PASS** |
| 31 | Monthly midpoint $13.82 | F.4 | (13.925+13.70)/2 = **13.8125** → 13.81 | **FAIL (1¢)** — M-4 |
| 32 | Dodo net, yearly $150 | F.4 | dom 150−(6.75+0.40) = **142.85**; intl 150−(9.00+0.40) = **140.60**; mid **141.725** → 141.73 | **PASS** |
| 33 | Yearly per month $11.81 | F.4 | 141.73 ÷ 12 = 11.8108 | **PASS** |
| 34 | Blended net $12.61 | F.4 | 0.6×11.81 + 0.4×13.82 = **12.614** | **PASS** |
| 35 | "8.8% below $13.82" | F.4 | (13.82−12.614)/13.82 = **8.73%** | **PASS** (rounding) |
| 36 | Sensitivity ±8%; −6%/+10% | F.4 | range 11.81–13.82, mid 12.815, ±**7.84%**; vs blend −6.4% / +9.6% | **PASS** |
| 37 | "20 points of mix ≈ 40¢" | F.4 | 0.20 × (13.82−11.81) = **$0.402** | **PASS** |
| 38 | Break-even 9–10 on $120 | F.5 | 120 ÷ 12.61 = **9.52**; band 110→**8.72**, 130→**10.31** | **PASS** arithmetically; **see M-1** for the basis |
| 39 | Break-even ≈11 on $135 | F.5 | 135 ÷ 12.61 = **10.71**; band 125→**9.91**, 145→**11.50** | **PASS** |
| 40 | F.3 baseline ≈$120 (band 110–130) | F.3 | lines sum **$107–127** (Resend 0–20, T4 at $15) | **FAIL (band floor)** — M-5 |
| 41 | F.3 total ≈$135 (band 125–145) | F.3 | 120 + 15 = 135 ✓ against the stated baseline | **PASS** given 40 |
| 42 | F.3 completeness | F.3 | **no PITR line** (NFR-4 mandates it) · **no labour line** (485 variants + monthly cadence) · **no CI line** | **FAIL** — H-8, H-9, M-13 |
| 43 | Monthly LTV ≈$273 | F.6 | 19.75 × 13.82 = **272.95** ✓ against the stated tenure; stated tenure itself should be **19.0** (M-3) | **PASS on stated inputs** |
| 44 | Yearly renew rate 0.96¹² = 61.3% | F.6 | 0.96^12 = **0.6127** | **PASS** |
| 45 | Yearly 2.94 terms ≈ 35.2 months | F.6 | 1 + 0.75/(1−0.6127) = **2.936** → ×12 = **35.2** | **PASS** |
| 46 | Yearly LTV ≈$416 | F.6 | 2.936 × 141.73 = **416.1** | **PASS** |
| 47 | Blended LTV ≈$359 | F.6 | 0.6×416 + 0.4×273 = **358.8** | **PASS** |
| 48 | "6% steady-state → ≈$280" | F.6 | monthly 13.5 mo × 13.82 = 186.6; yearly 2.431 × 141.73 = 344.5; blend = **281.3** | **PASS** |
| 49 | 200/1,200 = 16.7%, ">5× the 3% goal" | F.7 | 16.67%; 16.67/3 = **5.56×** | **PASS** |
| 50 | 1,000 Free ⇒ ≈31 Pro ⇒ ≈$391/mo | F.7 | 31 × 12.61 = **390.9**; 391/135 = **2.90×** | **PASS** arithmetically; **see M-2** for the model |
| 51 | 200 Pro ⇒ ≈$2,522/mo | F.7 | 200 × 12.61 = **2,522** | **PASS** |
| 52 | "≈1,200 accounts … comfortably inside Supabase Pro's included storage" | F.7 | 200×5 GB + 1,000×0.1 GB = **1.1 TB** vs **100 GB** included | **FAIL** — H-10 |
| 53 | FR-G5 "~3,500 pairwise comparisons" | FR-G5 | Σ C(n,2) over the 34 category sizes = **3,313** | **PASS** (stated with "~"; the true figure is ~5% lower) |
| 54 | "up to 18" siblings in Shuffle | §1.4 #2 | max category size = 18 (A4, A17) | **PASS** |
| 55 | Ghost custom settings: 3 reserved + 17 user = 20 | FR-Q2/Q5 | 3+17 = 20 | **PASS** |
| 56 | FR-P1 "exactly five" + conditional sixth | FR-P1 | 5 enumerated + 1 conditional; E12 owns (4) and (6), E1 (1)–(2), E3 (3), E7 (5) | **PASS** |
| 57 | §4 DoD "30 serialized deploys" | §4, FR-J11 | 10 starters × 3 deployable targets = **30** | **PASS** |
| 58 | Appendix D ceiling "≤5 font files" | D.a rule 5 | max Files in the pool = 5 (D8, D15, D27, D30) | **PASS** |

**Ledger verdict: the library, epic, catalog and pricing arithmetic reconciles.** 53 of 58 rows PASS. Five failures: the stale `487` in two normative companions (21), a 1¢ midpoint rounding (31), an F.3 band floor below its own minimum (40), and — the two that matter for the business — F.3's missing PITR / labour / CI lines (42) and F.7's storage claim, wrong by an order of magnitude against the plan matrix on the facing page (52). Every count that governs scope — 119 FRs, 34 categories, 485 variants, 47/199/109/102/28, 70 [Free], 457/28, 156/199/130, 10+13+11, 8,730 — is exact.

---

## What I would fix first

1. **C-1** — give NFR-6(c3) an exclusion set and a region-scoped threshold. Without it the PRD has no test for its central claim.
2. **C-2** — `frame-ancestors 'self'`, and one sentence naming the canvas iframe's document source.
3. **C-3** — move the Staff-token verification to before E3, name the snapshot and drift check as its dependents, and add the risk row.
4. **C-4** — decouple the snapshot download offer from the GDPR purge deadline.
5. **H-1** — turn `bindingContext` and `compileTarget` into closed enumerations with a defined match relation, before E4 exits. Three FRs and E5's headline gate rest on them.

Then the two-minute fixes: the stale `487` in appendix-b1 and appendix-h1, and the two `upgrade` portal actions in `sections-inventory.md`.
