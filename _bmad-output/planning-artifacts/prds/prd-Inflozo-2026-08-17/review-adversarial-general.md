---
title: Adversarial Review — Inflozo PRD v2.1
reviewer: adversarial-general
date: 2026-08-17
target: prd.md (v2.1, "final") + addendum.md
---

# Adversarial Review — Inflozo PRD v2.1

**Verdict:** This is a strong v2.1 — most of the classic PRD failure modes are already patched — but it is not safe to hand to autonomous agents yet. Two requirements are unbuildable or self-contradictory as written (forced library updates sold as opt-in; compiler "synthesis defaults" that are documented nowhere), the flagship "safe installs" promise rests on an Admin API endpoint Ghost does not document, and the business model's own math invites export-and-cancel. The document's confidence is its biggest liability: it states mechanisms ("detect custom-theme capability", "tracks the last routes.yaml delivered") that no public Ghost API supports, and downstream agents will either invent them or build theater.

Findings: **2 critical · 8 high · 13 medium · 6 low = 29.**

---

## CRITICAL

### C1. Library updates are compulsory while being sold as opt-in — FR-J14 contradicts itself
**Location:** FR-J14; §1.4 differentiators 5 & 7; addendum AD3.
**Quote:** "the user updates by redeploying — never automatically" vs., two sentences later, "Compiles always use the current library version (a single live library, no per-project pinning) … consequently any redeploy picks up the latest sections."
**Why it fails:** These cannot both be true. With no pinning, *every* redeploy is an automatic, involuntary, full library upgrade. A user who redeploys to fix one line of copy silently absorbs every section change since their last deploy — the exact behavior "never automatically" promises away. The "Updates available" notice is decoration: the user has no way to decline. This also detonates differentiator 5 ("an Inflozo theme never breaks your site"): a library regression ships to user sites piggybacked on unrelated edits, and the only escape (rollback to an old artifact) throws away the edit the user was trying to make. AD3 records pinning as rejected "for implementation simplicity" — fine, but then the PRD must stop claiming updates are user-controlled. Downstream agents will build both halves faithfully and ship a product that lies to its users.
**Fix:** Pick one. Either (a) pin each project to its last-deployed library version with an explicit "Upgrade library" action (reverse AD3), or (b) delete "never automatically," reword differentiator 7, and add an FR requiring a pre-deploy diff summary + mandatory confirmation whenever the library advanced ("this redeploy includes library changes X, Y — continue?"), plus render-matrix evidence that the user's placed variants are visually unchanged.

### C2. "Documented synthesis defaults" are documented nowhere — the compiler's behavior for untouched templates is pure invention
**Location:** FR-D6; FR-I1; §7.4.
**Quote:** "Templates the user hasn't touched compile from documented synthesis defaults so a home-only design still produces a complete, coherent theme (defaults derive header/footer/style from the Home canvas)."
**Why it fails:** "Derive header/footer/style" covers three of the ~10 decisions per template. A blank-canvas user designs Home only; the compiler must then emit `post.hbs`, `page.hbs`, `tag.hbs`, `author.hbs`, `error.hbs` — which post header variant? Which content layout? Related posts or not? Which archive header? Which pagination style for the tag feed? Appendix A inventories 487 variants but defines zero default compositions; no appendix, no `sections-inventory.md` section, nothing supplies the recipe. The word "documented" points at a document that does not exist. Three downstream agents will produce three different default themes, and the one thing G2 (<15 min to first deploy) depends on — a blank project producing a coherent full theme — is unspecified at its core.
**Fix:** A normative appendix (or a section in `sections-inventory.md`): per template, the exact default section stack (category + variant id + key control values) and the derivation rules from the Home canvas. One page of tables. Until it exists, FR-D6 is a wish, not a requirement.

---

## HIGH

### H1. The "safe installs" snapshot depends on an Admin API capability Ghost does not document
**Location:** FR-J13; §1.4 differentiator 5; P8.
**Quote:** "download and archive the currently active theme via the Admin API as a restorable artifact."
**Why it fails:** Ghost's *documented* Admin API for themes is upload and activate. Theme download is an internal endpoint used by Ghost Admin's UI; whether a Custom Integration JWT can call it — on self-hosted 5.x, 6.x, and especially Ghost(Pro) — is unverified in this PRD. The document knows this problem class intimately: FR-I4 hedges the routes endpoint as "community-known internal" with a first-class manual fallback. FR-J13 gets no such treatment; it asserts the capability flatly, and the brand promise ("an Inflozo theme never breaks your site") plus the warn-and-proceed fallback quietly become "we warned you" on any host where the endpoint is closed. That fallback firing on 100% of Ghost(Pro) connections would gut the differentiator at launch.
**Fix:** Same treatment as FR-I4: name the endpoint as internal/undocumented, require verification per Ghost version/host as an acceptance criterion on all four §4 targets, and specify the degraded path (e.g., "snapshot unavailable on this host — Ghost keeps your previous theme in Settings → Design; here's how to reactivate it") as a designed flow, not a warning toast.

### H2. Ghost(Pro) Starter "capability detection" has no mechanism — no API exposes it
**Location:** FR-C2; FR-C5; §7.6 risk table.
**Quote:** "Detect custom-theme capability: Ghost(Pro) Starter does not permit custom themes … Such connections are accepted but marked Preview-only." Plus FR-C5: the daily health check "re-runs version + custom-theme capability detection."
**Why it fails:** Ghost has no endpoint that reports plan or theme-upload permission. The `site`/`settings` reads FR-C2 specifies return neither. The only reliable probe is attempting a theme upload — a side-effecting action P8 ("read-only") forbids outside deploys. So an FR that sounds like a settled behavior (connect-time flag, daily re-check, auto-lift on plan upgrade) has no implementable detection step, and the architect must invent one: hostname heuristic (`*.ghost.io` + guess), a probe upload + delete (violates P8's spirit and pollutes the site's theme list), or flag-on-first-failed-deploy (which contradicts "deploy attempts are blocked" — blocking requires knowing *before* the attempt).
**Fix:** The PRD must choose the mechanism. Honest option: connect-time heuristic (Ghost(Pro) hostname + a documented, versioned lookup) with the authoritative signal being the first deploy attempt's error response, and Preview-only set/cleared from that; rewrite FR-C2/C5 accordingly.

### H3. Theme-name freeze vs. collision-rename is a deadlock, and the freeze's scope is ambiguous
**Location:** FR-J10; FR-B5.
**Quote:** "The theme name freezes at the project's first deploy to a site … a collision at first deploy prompts a project rename instead of overwriting."
**Why it fails:** "First deploy to a site" — first deploy *ever*, or first deploy *to each site*? FR-B5 makes projects site-switchable, so the case is reachable: project with slug `blog` first-deploys to Site 1 (name freezes), switches target, first-deploys to Site 2 where another project's `inflozo-blog` already lives. Collision → "prompts a project rename" → but renaming this project "changes the display name only" because its theme name is frozen. The prompt asks for an action the same FR defines as a no-op. Deploy to Site 2 is permanently blocked. Two downstream agents will resolve the freeze scope differently and one of them builds the deadlock.
**Fix:** Freeze per project×site (each site gets its own frozen slug, collision resolved by a per-site slug suffix), and say so explicitly.

### H4. Tag and author archives are excluded from the main-feed rule — broken pagination on every archive page
**Location:** FR-H2; FR-D6; Appendix A §29, §34.
**Quote:** "On every collection template (index and custom collections), exactly one section is designated the main feed."
**Why it fails:** Ghost paginates taxonomy pages (`/tag/x/page/2/`, `/author/y/page/2/`) with the same native pagination context as collections. `tag.hbs` and `author.hbs` are in the template switcher, but FR-H2's designation rule scopes itself to "index and custom collections" — so on archive templates every feed section is `{{#get}}`-driven with a fixed Count, meaning page 2 of every tag archive renders the same posts as page 1. That is precisely the indexable-duplicate failure FR-H2 painstakingly guards against for zero-feed collections, silently reintroduced on every archive of every theme. As written, all 487-variant themes ship with broken archive pagination.
**Fix:** Extend the main-feed designation and lifecycle to all paginated contexts: index, custom collections, tag, and author templates (archives likely *default* to a designated collection-bound feed rather than allowing zero-feed).

### H5. FR-Q5's "its dark counterpart already exists" is false for every token except accent
**Location:** FR-Q5; FR-Q3; FR-Q2 cap math.
**Quote:** "Promoting a color token (FR-Q3) creates the *light* setting; its dark counterpart already exists, so both modes stay owner-controllable as a pair."
**Why it fails:** The built-ins reserve exactly one dark color: Dark accent. Promote `surface`, `background`, or `text` and no dark counterpart exists. The architect now faces an undecided fork: (a) auto-create a dark twin per promoted color — consuming *two* of the 17 user slots per promotion, wrecking the carefully-stated cap arithmetic and the visible meter's semantics; or (b) promote light-only — shipping the exact broken half-pair FR-Q5 claims cannot happen (owner edits light surface in Ghost Admin; dark surface stays baked; dark mode visually diverges from light forever). Both are defensible; the PRD picks neither.
**Fix:** Decide: color promotion creates a light+dark pair costing 2 slots (meter shows it), or promotion is accent-only in v1, or dark values always derive from light via the pack's pairing rules. One sentence; currently a contradiction.

### H6. Edit-lock takeover destroys work with unspecified semantics — and the undo stack survives a doc it no longer matches
**Location:** FR-D18; FR-D10; FR-D9; addendum AD1/AD2.
**Quote:** "A revived former holder becomes read-only and is told its unsynced edits were not included" and "On every lock acquisition, the cloud snapshot is authoritative: the local doc is replaced before editing resumes."
**Why it fails:** Two silent gaps. (1) The former holder's unsynced ops: "not included" — but are they *destroyed*, *recoverable*, or *merged later*? The local journal still physically contains them; when that device later re-acquires the lock, the doc is replaced by the cloud snapshot — do its orphaned ops vanish, replay, or linger as landmines in the undo stack? Up to 3 minutes of work (unbounded with autosave off) is at stake and the PRD shrugs. (2) FR-D9 protects undo only against *schema* mismatches ("no-op gracefully"), not against *doc-state* mismatches: after hydrate-from-cloud, every persisted undo entry references a document that no longer exists. Replaying an inverse op against the wrong doc is exactly the "corrupt state" FR-D9 forbids, and nothing specifies clearing or rebasing the stack on hydrate.
**Fix:** Specify: on hydrate-from-authoritative-snapshot, the local undo journal is cleared (or archived as a read-only "recovered edits" bundle the user can inspect); takeover UX states the loss in edits, not vibes ("14 changes on your other device were not included and cannot be merged"). AD1/AD2 get one paragraph each.

### H7. G8–G10 are unmeasurable — no FR builds the instrumentation
**Location:** §1.3 G8/G9/G10; NFR-8; §5 (absence).
**Quote:** "≥ 30% of signups reach first deploy within 7 days · counter: 7-day rollback rate < 10%."
**Why it fails:** Activation funnels, 90-day conversion cohorts, monthly churn, rollback rates — all require event instrumentation, identity-joined analytics, and cohort reporting. No FR specifies any of it. The only mention of analytics in the entire document is NFR-8's aside ("no third-party trackers beyond privacy-respecting analytics") — a constraint on a system nobody is asked to build. Downstream agents build zero telemetry and the launch flies blind against its own goals. The counter-metrics are also underdefined: "7-day rollback rate" — per deploy, per user, per site? And it's perverse: rollback is a headline safety feature; a *low* rate may mean it's broken or undiscoverable, a high rate may mean users are playing with the toy you built them.
**Fix:** An FR-R (analytics/telemetry): named events (signup, connect, first_deploy, rollback, upgrade, cancel), the chosen privacy-respecting tool, dashboard requirements, and precise denominators for every goal and counter in §1.3.

### H8. The business model funds its own churn: export-and-cancel is the rational Pro behavior
**Location:** Appendix F; FR-J12; FR-J15; P5; §1.5; G10.
**Quote:** "Theme ZIP export (all plans)" + "Deployed sites: zero runtime dependence on Inflozo" + "Pro accounts can disable both [credits] per project."
**Why it fails:** One month of Pro ($15) buys: build up to 25 themes from all 487 variants, export them white-labeled, cancel. The themes work forever (P5 — correctly, but it removes the hostage). Against Fantasma's $99/yr and theme shops' $89–149 one-time, Inflozo is accidentally the *cheapest one-shot theme tool on the market* — while its G10 goal assumes <5% monthly churn with no product mechanic that rewards staying subscribed beyond (a) re-editing and (b) library updates, which C1 shows are compulsory anyway and which a canceled user forfeits without consequence since their theme keeps running. Nothing in the PRD addresses generated-theme licensing either: may an exported theme be resold or redistributed? The legal pages list (FR-N1) doesn't include theme license terms. Separately, §1.5's justification leans on unverifiable competitor claims stated as fact ("no image optimization, no gscan/performance or code-quality story") — if Fantasma ships any of these before launch, the positioning section is fiction.
**Fix:** Either accept and model one-shot economics honestly in Appendix F (blended LTV with a churn spike after month 1, which changes break-even), or add a stated retention mechanic (e.g., white-label export requires active subscription per Terms; theme license terms as a required legal page), and mark §1.5 claims with a verification date.

---

## MEDIUM

### M1. "Impossible to make ugly" and "Accessibility ≥ 95" are unenforceable the moment FR-E3 exists
**Location:** §1.4 differentiator 4; G4; FR-G4; FR-E3.
**Quote:** "every possible output is cohesive" / "Token edits run a live AA contrast check … a warning, never a block."
**Why it fails:** FR-G4 claims AA "via token pairs," but FR-E3 lets users edit every token to failing values with only a warning. So AA and Lighthouse-a11y-95 are properties of the 12 presets, not of "every possible output" — yet G4 is written as a goal over *generated themes*, unqualified. QA agents will fail builds that are working as designed.
**Fix:** Scope G4/FR-G4 to preset packs and library defaults; state explicitly that user token edits can break AA and that the warning transfers responsibility.

### M2. Goal measurements are undefined: G1's 60-second clock includes a manual Ghost Admin task
**Location:** G1, G2, G6.
**Quote:** "Connect Ghost site → branded canvas with the user's real content and colors: < 60 seconds."
**Why it fails:** FR-C1's connect flow requires the user to open Ghost Admin, create a Custom Integration from screenshotted instructions, and paste two keys. No first-time human does that in 60 seconds — so either the clock starts after key paste (unstated) or the goal is theater. G2 has no percentile (median? p75?); G6's "60fps" names no reference hardware or page size. None of these can be turned into a pass/fail test as written.
**Fix:** Define each goal's clock start/stop, percentile, and measurement environment in §1.3.

### M3. Unbounded performance promise: "no hard cap" + 60fps with no stated budget
**Location:** FR-D14; NFR-1; G6; FR-F4; FR-E2.
**Quote:** "No hard cap on sections per template … the editor must hold NFR-1 performance on long pages."
**Why it fails:** An unbounded input with a fixed performance floor is unfalsifiable — 60fps at 500 sections in a Handlebars iframe is not going to happen, and "long pages" is not a number. Also, the same interaction has two different budgets: G6 says control changes visible "< 100 ms," FR-F4 says "within one frame" (16 ms). Which is the acceptance criterion? (Same issue for the ≤300 ms pack crossfade on arbitrarily long pages.)
**Fix:** A tested reference budget ("60fps up to N sections; degradation strategy beyond N"), and one number per interaction.

### M4. "Routes never silently drift" is unverifiable — Inflozo cannot observe the manual upload
**Location:** FR-I4.
**Quote:** "Inflozo tracks the last routes.yaml delivered per site … so the live site's routes never silently drift from the deployed theme."
**Why it fails:** In the primary (manual) flow, "delivered" means "we showed the user a download button." Whether the user completed the Labs upload is unknowable to Inflozo, so the tracked state measures Inflozo's output, not Ghost's reality — and the no-drift guarantee is marketing wearing an FR's clothes. A user who skips the step has drift the system believes impossible.
**Fix:** Rename the state honestly ("last routes.yaml *offered*"), and add a verification probe where possible (fetch a route URL from the live site and check the response) with an "unverified — did you upload it?" nag state.

### M5. Epic wave counts don't match the categories the epics name
**Location:** §8 E9/E10/E11 vs. Appendix A table.
**Quote:** "E9 · Library Wave 1 (150)" / "E10 · Library Wave 2 (200)" / "E11 · Library Wave 3 (137)."
**Why it fails:** Sum the categories each epic assigns itself: E9 (A1–A3 + A17–A23) = 156; E10 (A4–A16) = 199; E11 (A24–A34) = 132. Both triples total 487, which is exactly how this kind of error survives review. An SM agent slicing stories by the stated numbers mis-scopes three epics.
**Fix:** 156 / 199 / 132.

### M6. Even the total is soft: the winning document says "~487"
**Location:** Appendix A ("on any conflict the inventory wins"); `sections-inventory.md` line 8; G5; Appendix H.
**Quote:** Inventory: "**Totals: 34 categories · ~487 variants.**" PRD: "487 unique variants … every listed variant is a launch deliverable."
**Why it fails:** The PRD declares the inventory normative and conflict-winning, then the inventory hedges the headline number with a tilde. So the launch deliverable is "approximately 487" — and Appendix H hard-codes "487 gorgeous sections" as canonical microcopy, which becomes a lie if the count drifts by one.
**Fix:** Delete the tilde in the inventory (count the list and assert it), or make the microcopy count-agnostic.

### M7. Appendix E's two "all-Free" starters are specified with Pro variants and unspecified replacements
**Location:** FR-O4; Appendix E items 5, 9; inventory A4/A18/A17/A32.
**Quote:** "where their Appendix E compositions currently use Pro variants, those swap to [Free] variants."
**Why it fails:** Verified against the inventory: Quiet's "Big Type Manifesto" (A4 #8) and "Minimal Index" (A18 #4), Ledger's "Feature Post Hero," "Meta-Rich Rows," and "Tier Cards Inline" are all Pro (only the first two per category are Free). So the normative starter specs are self-declared stale, and "swap to [Free] variants" names no targets — which of the two Free variants per category, chosen by whom? The v2.1 "final" PRD ships with a known-wrong appendix and a TODO disguised as a rule.
**Fix:** Update Appendix E to name the actual Free compositions for Quiet and Ledger.

### M8. Pre-Inflozo snapshot keyed by site URL — domains change
**Location:** FR-J13.
**Quote:** "The snapshot is a per-site artifact keyed by site URL … never re-captured while the active theme is an `inflozo-*` theme."
**Why it fails:** A user migrates their Ghost site to a new domain and reconnects: new URL key → no snapshot found → and re-capture is forbidden because the active theme is `inflozo-*`. Restore-to-original is now silently impossible for that site, forever — the exact outcome the never-re-capture rule exists to prevent, produced by the keying choice. URL is an identity proxy; Ghost sites have stable identifiers.
**Fix:** Key by a stable site identity (Ghost site UUID from the Admin `site` endpoint) with URL as display metadata; define a re-key path on URL change.

### M9. "Safety operations remain available throughout" — not for the sites you were forced to disconnect
**Location:** FR-L3; FR-C6; FR-J9; FR-D18.
**Quote:** "Safety operations — rollback (FR-J9) and snapshot restore (FR-J13) — remain available throughout."
**Why it fails:** Rollback and restore execute via the Admin API, which requires a *connected* site. The same FR forces a downgraded user to "disconnect down to" one connection — for the other nine sites there are no credentials, so the safety operations are exactly as available as the connection cap allows: not. Separately, FR-D18 gates "deploy and ZIP export" behind the edit lock; a rollback is an artifact redeploy — does it need the lock? If yes, an emergency rollback from a second device forces a takeover ritual mid-incident; if no, say so. Unspecified either way.
**Fix:** State that safety ops apply to *connected* sites only (reconnecting for a restore doesn't breach the cap — or does it? decide), and explicitly exempt rollback/restore from the edit-lock requirement (they ship known artifacts, not the working doc).

### M10. Promoting a text prop to Ghost Admin silently strips the user's inline marks
**Location:** FR-Q3; FR-D4.
**Quote:** "text prop → text" (FR-Q3) vs. "every text prop is editable directly on canvas … bold, italic, underline, link … available on any text prop" (FR-D4).
**Why it fails:** Ghost `@custom` text settings are plain strings. A text prop carrying `<strong>`/`<a>` marks promoted to a setting either loses the marks (silent formatting loss the user discovers post-deploy) or emits stored HTML into a Ghost Admin text field (garbage in the owner's UI, and triple-stache injection in the theme). The PRD defines neither.
**Fix:** Disallow promotion of props containing marks (with a "remove formatting to promote" prompt), or strip marks at promotion with an explicit warning.

### M11. Internationalization is absent from scope *and* from out-of-scope
**Location:** §5 (absence); Appendix G (absence); Appendix B (binds `@site.locale`).
**Why it fails:** Marketplace-quality Ghost themes ship translatable strings (`locales/en.json`, `{{t}}`); Ghost sites declare a locale, which Appendix B even catalogs as bindable. The PRD never says whether generated themes hard-code English chrome strings ("Read more", "Page 2 of 5", form labels), whether `{{date}}` respects locale, or whether RTL is supported — and Appendix G, which lists fourteen deliberate deferrals, doesn't mention i18n. Silence is not a boundary; downstream agents will each assume a different answer, and non-English Ghost publishers (a large slice of self-hosted Ghost) hit it immediately.
**Fix:** One Appendix G line ("i18n/RTL: v1 themes are English-chrome, LTR, dates localized via `{{date}}` locale — or not") — but written down.

### M12. The production-testing mandate expires at "first customer" with no successor
**Location:** §4; NFR-6(d); P7.
**Quote:** "Until go-live and the first customer, all testing runs on the real production infrastructure … E2E — Playwright against production Vercel."
**Why it fails:** The mandate is explicitly time-boxed and nothing replaces it. Day 2, with real users on production: does the E2E suite still run real deploys, real Dodo transactions, and theme activations against production? There is no staging by design. The PRD regulates the pre-launch window in loving detail and says nothing about the regime it knows is coming.
**Fix:** One paragraph: post-launch test topology (dedicated test accounts flagged out of analytics, Dodo test mode, the same live Ghost targets retained as a permanent test fleet — they're already in the budget).

### M13. Single-GA + "everything ships" + 487 normative variants = no descope lever exists anywhere
**Location:** P7; §4; FR-G1; §7.6.
**Quote:** "100% of this PRD ships before go-live" / "every listed variant is a launch deliverable."
**Why it fails:** The risk table itself flags "library scale (487 variants) slips schedule" — but the only mitigations are process (factory workflow, CI). The PRD structurally forbids the one mitigation that always works: cutting scope. If wave 3 slips, launch slips; no priority ordering within the library, no "launch-blocking vs. fast-follow" partition exists for *any* feature. An owner mandate is a fact, but a PRD that hands autonomous agents an unfalsifiable all-or-nothing plan should at least rank what dies last.
**Fix:** Keep the mandate, add a ranked cut-line appendix ("if forced: A15 Video, A28 Comments, and starters 6–10 are the sacrifice order") — unused if all goes well, priceless if not.

---

## LOW

### L1. Google Fonts hotlinking: GDPR exposure and a third-party runtime dependency in "self-contained" themes
**Location:** FR-J3; NFR-2.
**Quote:** "fonts load via Google Fonts with `display=swap`."
**Why it fails:** German case law (LG München, 2022) made hotloading Google Fonts a GDPR liability for EU *site owners* — Inflozo's customers. It's also a third-party runtime dependency and a Lighthouse variable in themes the PRD otherwise makes proudly self-contained (P5). Custom font *uploads* are rightly deferred; self-hosting the curated 30-pairing pool in the theme zip is not the same feature and isn't considered.
**Fix:** Bundle woff2 subsets of the curated pool into `assets/fonts/` at compile. Bounded work (the pool is fixed at ~30 pairings), removes the liability.

### L2. The local-storage-failure fallback is the exact design AD3 rejected for latency
**Location:** FR-D10; addendum AD3; NFR-1.
**Quote:** "the editor falls back to immediate per-change cloud sync" vs. AD3: "Per-change cloud autosave … rejected by owner: too chatty, perceived risk to editor speed."
**Why it fails:** In fallback mode the editor runs the rejected architecture, and NFR-1's "saving must never add perceptible input latency" is not exempted for it. Either the fallback violates NFR-1 or the rejection rationale was wrong; the PRD asserts both.
**Fix:** Exempt fallback mode from NFR-1's latency clause explicitly (degraded mode, honestly labeled), or debounce the fallback.

### L3. Image optimization is destructive with no original retained
**Location:** FR-K2.
**Quote:** "raster images convert to WebP (q≈82), max long edge 2400 px."
**Why it fails:** Originals are discarded client-side; a 6000px portfolio photograph is permanently ceilinged at 2400px/q82. When the policy inevitably changes (AVIF, larger sizes for wide layouts), there is nothing to re-derive from. Two of the ten starters (Bloom, Studio) target exactly the image-centric users who will notice.
**Fix:** Either keep originals for Pro (quota priced accordingly) or state the destruction in the upload UI as an accepted trade.

### L4. Infinite scroll's no-JS and SEO story is unstated
**Location:** FR-G4; FR-H2; Appendix A §34.
**Why it fails:** FR-G4 enumerates JS-disabled fallbacks and names load-more ("falls back to numbered links") but not infinite scroll; FR-H2 offers infinite scroll as a pagination style without stating whether `/page/N/` URLs remain crawlable links in the markup. Probably intended to mirror load-more — but "probably" is the defect.
**Fix:** Add infinite scroll to FR-G4's fallback list with the same numbered-links rule.

### L5. Flapping connections generate an email per flap
**Location:** FR-C5.
**Quote:** "sends once per healthy→unhealthy transition … resets on recovery."
**Why it fails:** A site flapping daily (expiring cert, intermittent host) transitions healthy→unhealthy repeatedly; "resets on recovery" re-arms the email each cycle. The dedup logic dedupes the steady state and amplifies the noisy one.
**Fix:** A cool-down (max one health email per site per N days) on top of the transition rule.

### L6. No backup/recovery NFR for user work-product
**Location:** NFR-4 (absence).
**Why it fails:** Projects are hours of user work in Supabase Postgres; NFR-4 covers autosave retries and spend caps but names no RPO/RTO, no PITR requirement, no restore drill. "Supabase probably has backups" is not a requirement.
**Fix:** One line in NFR-4: PITR enabled, RPO/RTO targets, restore tested pre-launch.

---

## Scorecard

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 8 |
| Medium | 13 |
| Low | 6 |
| **Total** | **29** |

**What survives:** the FR-Q cap arithmetic (3+17=20) is consistent everywhere it appears; the entitlement state machine is complete; the downgrade rules are genuinely explicit; P8's read-only stance is coherent; the Appendix A totals cross-check (487 both ways); break-even math in Appendix F is arithmetically sound. The rot is concentrated where the PRD asserts mechanisms third parties (Ghost, the market, the user's browser profile) don't actually provide.

**Minimum bar before handing downstream:** resolve C1 and C2, and settle H1–H5 (each is a one-paragraph decision). H6–H8 can ride along as flagged architect inputs, but the metrics FR (H7) must exist before the SM writes stories or launch instrumentation will simply never be built.
