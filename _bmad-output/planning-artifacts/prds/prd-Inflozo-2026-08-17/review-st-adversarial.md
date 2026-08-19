---
title: Adversarial Review — Inflozo PRD v2.3 (v2.2/v2.3 material)
reviewer: st-adversarial (hostile, second pass)
date: 2026-08-18
target: prd.md v2.3 "final" + sections-inventory.md (incl. Synthesis Defaults) + addendum.md
prior passes: review-adversarial.md (v1.0, 45 findings), review-adversarial-general.md (v2.1, 29 findings)
---

# Adversarial Review — v2.2/v2.3 Material

**Verdict: not final.** The v2.1 hardening was real — I re-tested the old findings and most are genuinely closed (see *What survives*). But the v2.2/v2.3 additions were written **as patches to individual FRs and never propagated**, which is the same failure mode the v1.0 review named on its last line and the document has now committed a third time. Three defects are launch-blocking: an edit-URL-in-place flow that lets Inflozo push one site's archived theme onto a different live site, a Translations module that hands every Free user a white-label bypass, and a paywall placement model that exists in three mutually incompatible forms across normative text.

The pattern in the new material: **every v2.2/v2.3 feature was specified against the FR it replaced and against nothing else.** FR-Q6 was never checked against FR-J15, Appendix B, Appendix F, or §7.5. FR-C8's URL edit was never checked against what URL-keying protects. FR-C5's compatibility watch was never checked against the data model that would have to feed it. FR-L1's yearly default was never checked against the arithmetic in the appendix that cites it as a retention lever. Each is one paragraph of work; together they are the reason this cannot go downstream.

Findings: **3 critical · 13 high · 14 medium · 7 low = 37.**

---

## CRITICAL

### C1. FR-C8's edit-URL-in-place lets Inflozo push one site's archived theme onto a different live site
**Location:** FR-C8; FR-J13; FR-C6; §1.4 differentiator 5.
**Scenario:** User connects `blog.example.com` (Site record S1). Inflozo captures S1's pre-Inflozo snapshot — the user's old Casper fork — keyed by that URL, and deploys. Months later the user opens Manage keys on S1 and, per FR-C8, edits the URL to `shop.example.com` and re-pastes that site's Admin/Content keys — because that is exactly the flow FR-C8 offers and it does not ask *whether it is the same site*. FR-C8 states the site record "and its pre-Inflozo snapshot survive the change." Now S1 points at a Ghost install Inflozo has never touched, carrying a snapshot of a completely different site's theme. Two consequences fire simultaneously: (a) FR-J13's capture trigger is "Inflozo's **first** theme upload to a site" — S1 has already had one, so `shop.example.com`'s real active theme is **never snapshotted**; (b) the one-click "Restore original theme" now uploads and activates `blog.example.com`'s Casper fork over `shop.example.com`'s live design. The brand promise ("an Inflozo theme never breaks your site") is not merely unmet — the safety mechanism becomes the thing that breaks the site, and the victim site's own escape hatch was silently skipped. FR-C8's only guard ("Moved domains? Edit the URL on the existing site instead") points *toward* this path, not away from it, and it fires on the new-site-connect path only.
**Collides:** FR-C8 × FR-J13 × FR-C6 × §1.4 #5.
**Fix:** On URL edit, fingerprint the new target via the Admin `site` endpoint (title + version + oldest-post `published_at`) against the stored fingerprint; on mismatch, force "this is a different site" — drop the snapshot association, reset the FR-J13 first-upload flag, and re-capture on next upload.

### C2. FR-Q6 makes the "Built with Inflozo" credit a user-overridable string — Free white-label in two clicks
**Location:** FR-Q6; FR-J15; Appendix F ("Credit removal (white-label) — Pro only"); Appendix A §A3.
**Scenario:** FR-Q6 is written as a universal rule, not a list: "**every** compiler-generated, visitor-facing chrome string … lives in one standard string catalog," consumed "**exclusively** via Ghost's `{{t}}` helper … never hard-coded literals; **compile validation enforces this**." The "Built with Inflozo" credit is compiler-generated, visitor-facing, lives in a shared footer partial, and — per FR-J15 — is injected by the compiler into `default.hbs` when a Free user has no footer. By FR-Q6's own enforcement rule it **must** be a catalog string, because a hard-coded literal is forbidden. FR-Q6 then says the Translations surface "lets the user override **any** label, in any language." So: Free user opens Translations, finds `Built with Inflozo`, overrides it to a single space, deploys. FR-J15's "Free deploys and exports always retain credits" and Appendix F's Pro-only white-label row are both defeated, with no gate anywhere in the path — FR-L3's exit gates check for Pro *sections*, not translated strings. The same trick strips the README credit if that string is catalogued too.
**Collides:** FR-Q6 × FR-J15 × FR-L3 × Appendix F.
**Fix:** Name the credit strings as a locked catalog namespace — not listed in the Translations surface, not overridable on any plan, `{{t}}`-emitted from a compiler-owned partial, and excluded from FR-Q6's "any label" rule in one clause.

### C3. The paywall exists in three incompatible placement models — the default post page of every generated theme is unbuildable
**Location:** Synthesis Defaults §3 `post.hbs` row 2; Appendix A §A32; FR-D5; FR-D12; FR-G1; §1.4 differentiator 4; Appendix G ("nested/columns free-form layout" deferred).
**Scenario:** Synthesis Defaults specifies the default post page as a five-row stack and puts the paywall *inside* row 2: "**A32 #1 Fade + Card** emitted at the gated cutoff inside `{{#unless access}}`" — a property of the A25 Post Content Layout instance. Appendix A treats A32 as a **category of 12 placeable sections** ("a flagship differentiator") that FR-G1 makes launch deliverables and FR-D12 puts in the Section Picker. FR-D5's Layers panel is "an ordered section list" — a flat vertical stack, which §1.4 #4 makes a binding structural model and Appendix G reinforces by deferring nesting. These cannot all be true. Concretely: a user on a gated post opens Layers on `post.hbs`. Where is the paywall? If it is stack row 2.5, the flat model has no representation for it and dragging A25 moves the paywall with it — or doesn't. If it is a placeable row, then dragging it above A24 must do *something*, and P1 ("the canvas shows the true website") requires the canvas to render it where the stack says, which is not where Handlebars will emit it. If it is a Style-group choice of A25 (the model A33 Koenig uses — "Style group of Post Content Layout"), then A32's 12 variants are not sections at all and FR-D13 Shuffle, FR-D2 hover actions, and the Section Picker's Free/Pro badging all apply to something that isn't in the stack. **Three implementing agents will build three different products here**, and this is the default post template of every theme Inflozo generates.
**Collides:** Synthesis Defaults §3 × Appendix A §A32 × FR-D5 × FR-D12 × FR-D13 × §1.4 #4 × Appendix G.
**Fix:** Declare A32 a **slot-bound section**: exactly one A32 instance per `post.hbs`, occupying a fixed "gated cutoff" slot rendered inside the content layout, shown in Layers as a locked, non-draggable row nested under A25 — and say so in FR-D5, FR-H2's sibling text, and Appendix A §A32.

---

## HIGH

### H1. FR-Q6's locale-file scheme collides with itself for English sites — which file holds the overrides is undefined
**Location:** FR-Q6; §7.4 (`locales/…`).
**Scenario:** FR-Q6 describes two files: "the **site-language file** carries the user's labels (language code defaults to the connected site's `@site.locale`…), and **`en.json` always ships so every key resolves**." For an English Ghost site — the majority case and every §4 test target — those are the same file. Does `en.json` carry the user's overrides (so the "always resolves" fallback no longer contains defaults) or the English defaults (so an English-site user's overrides are compiled into a file Ghost never loads and silently do nothing)? A user overrides "Older posts" → "More stories", deploys, and the live site shows one or the other depending on which agent built the compiler. Worse, the stated mechanism assumes a Ghost fallback chain — site-language file → `en.json` — that is not how Ghost theme i18n resolves: Ghost loads the publication-language file and falls back to **the key itself**, not to `en.json`. The scheme is designed around a behavior nobody verified (see M4).
**Collides:** FR-Q6 × §7.4 × Ghost's `{{t}}` resolution.
**Fix:** One rule: the theme ships exactly one locale file, named for the project's language, containing defaults overwritten by the user's overrides — plus `en.json` identical to it when the language is English; state that missing keys fall back to the English key literal, not to `en.json`.

### H2. Chrome strings generated in JS cannot go through `{{t}}` — FR-Q6's enforcement rule is unsatisfiable for shipped variants
**Location:** FR-Q6; FR-J4; FR-J5; Appendix A §A34 #6–10, §A14.
**Scenario:** FR-Q6: sections and partials consume catalog strings "exclusively via Ghost's `{{t}}` helper … never hard-coded literals; **compile validation enforces this**." FR-J4 bundles vanilla JS behavior modules into `assets/js/main.js` — a **static file Ghost never runs through Handlebars**. A34 #8 "Load More Ticker — button with remaining-count badge" updates its badge in JS after each fetch; A34 #9–10 infinite-scroll variants render loading and end-of-feed states in JS; the lightbox (FR-J4, A14 galleries) renders "3 of 12" counters in JS. `{{t}}` cannot reach any of them. So compile validation either fails every one of those variants forever, or it silently exempts JS — at which point FR-Q6's "every chrome string" promise is false and a German site gets German pagination links above an English "Loading…". Three agents: data-attributes on the mount node, a per-theme JSON string map emitted at compile, or hard-coded English in `main.js`.
**Collides:** FR-Q6 × FR-J4 × Appendix A §A34/§A14.
**Fix:** Require the compiler to emit resolved catalog strings for JS-consumed keys as `data-i18n-*` attributes on each behavior module's mount element, and scope FR-Q6's `{{t}}`-only rule to `.hbs` output explicitly.

### H3. Translation overrides sit outside FR-J14's backward-compatibility contract — monthly drops silently revert them
**Location:** FR-Q6; FR-J14.
**Scenario:** FR-J14's contract enumerates exactly what library releases may not break: variants are "never deleted, only superseded"; "section content/control schema changes are append-only or ship a migration map." The **string catalog is neither a variant nor a section schema** — it is registry data FR-Q6 invented after that contract was written. Sequence: a German user overrides 40 chrome strings and deploys. Month 2's library drop rewords the English key `Page {page} of {pages}` to `Page {current} of {total}` (a copy improvement — exactly the kind of thing a monthly cadence produces). The user's override is keyed to the old string. Next redeploy: FR-J14's mandatory confirm lists *section* changes and says nothing about strings; the compile emits the new key with no override; the German site reverts to English pagination. Nothing warns, nothing migrates, and the user's only signal is a visitor complaint.
**Collides:** FR-Q6 × FR-J14 × FR-C5 (the redeploy the watch recommends is the trigger).
**Fix:** Extend FR-J14's contract to the string catalog: keys are append-only and never reworded in place; a superseded key ships a migration map that carries the user's override forward.

### H4. Appendix B still claims the shim covers "exactly this surface" — and it has no `{{t}}`, no catalog, no locales
**Location:** Appendix B preamble; FR-H5; FR-Q6.
**Scenario:** This is the v1.0 review's C1/H6 defect, reintroduced by v2.3. Appendix B is declared normative and states: "The helper shim (FR-H5) must cover **exactly this surface**." It enumerates `@site`, Post/Page, Tag, Author, Tier, `@member`, pagination context, portal actions, `@custom`, and query rules. FR-H5 was expanded to include `{{t}}` — Appendix B was not. An architect scoping the shim package (§7.1 calls it "a first-class, golden-tested package") from the appendix that claims exhaustiveness builds no `{{t}}`, and every chrome string on canvas renders blank or raw. Golden fidelity tests (NFR-6c) then compare a canvas missing all pagination/error/member-form labels against live Ghost output that has them, and the harness fails on every fixture — or the shim quietly grows past its "exactly" contract, which is the other half of the original finding.
**Collides:** Appendix B × FR-H5 × FR-Q6 × NFR-6(c).
**Fix:** Add a `{{t}}` / string-catalog / `locales/` block to Appendix B, or delete the word "exactly" and point the shim's contract at FR-H5 alone.

### H5. FR-Q6 ships "any language" while Appendix G defers RTL — nothing stops the user from building the broken thing
**Location:** FR-Q6; Appendix G (RTL); FR-G4; G4.
**Scenario:** Appendix G's v2.3 narrowing says "RTL layout (v1 generated themes are LTR). **Translation itself ships in v1**." FR-Q6 then offers the user override of "any label, **in any language**" with a user-selectable language code for unlinked projects. So the product actively offers the path the appendix defers: an Arabic or Hebrew publisher translates all 40 chrome strings, sets the language to `ar`, deploys — and gets Arabic text in a hard-LTR layout with left-aligned headings, LTR pagination arrows, and mirrored-wrong nav. No warning fires at the language selector, at compile, or in pre-deploy checks. FR-G4's WCAG AA claim and G4's Accessibility ≥ 95 are both false for that output, and the user reached it entirely through supported UI.
**Collides:** FR-Q6 × Appendix G × FR-G4 × G4.
**Fix:** Maintain an RTL language-code list; selecting one (or a linked site whose `@site.locale` is one) shows a blocking-acknowledgement notice — "Inflozo v1 generates left-to-right layouts; your text will read correctly but the layout will not mirror" — recorded as a pre-deploy warning.

### H6. FR-C5's compatibility watch has no data source anywhere in the document
**Location:** FR-C5; FR-G3; §7.5 `deploys`; Appendix F (retention levers); §7.6 verify list.
**Scenario:** FR-C5 (Pro): the daily check "compares each connected site's Ghost version against **the library's compatibility data**; when a Ghost release affects **something the site's deployed theme uses**, the user gets an in-app notification." Two inputs, neither of which exists. (a) FR-G3 fixes the registry entry format — `{ id, category, name, tier, contentSchema, controlSchema, quickControls[], hbs, css, js?, dataBindings?, darkCapabilities, previewSeed }` — with **no compatibility field**, and no FR says who authors compatibility data or when. (b) "what the deployed theme uses" requires a per-deploy variant manifest; §7.5's `deploys` row is `id, project_id, site_id, version, artifact_path, gscan jsonb, status, activated, created_at` — no manifest, so the only way to know is to unzip and parse the stored artifact, which no FR specifies. Meanwhile Appendix F names this watch as one of three retention levers offsetting the modeled churn spike, so a load-bearing business mechanism rests on a feature with no inputs. It is also a permanent hand-maintained editorial job for a solo founder that Appendix F's economics — which counts only servers — never costs.
**Collides:** FR-C5 × FR-G3 × §7.5 × Appendix F.
**Fix:** Add `ghostCompat: { minVersion, helpers[], deprecatedAt? }` to FR-G3's registry entry and a `variant_manifest jsonb` column to `deploys`; state that compatibility data is authored per Ghost release as part of the FR-J14 cadence.

### H7. The redeploy FR-C5 recommends is unreachable for exactly the users who need it
**Location:** FR-C5; FR-J14; FR-D18; FR-L3; FR-B7.
**Scenario:** A Free user with three Pro sections on canvas (fully legal — FR-L3's open canvas) deployed six months ago. Ghost 6.9 deprecates a helper their theme uses. FR-C5's watch is **Pro-only**, so they are never told. Now the Pro version: a Pro user gets the notification, clicks through to redeploy, and hits three gates in sequence — FR-D18 requires the edit lock (their other laptop holds it; taking over destroys that session's unsynced edits), FR-J14's mandatory confirm requires accepting every library change since their last deploy, and if they have since lapsed to Free with Pro sections placed, FR-L3 blocks the deploy outright with a sheet telling them to swap sections. The notification says "redeploy to stay compatible"; the product can make that impossible, and nothing in FR-C5 acknowledges any of the three gates. A safety recommendation the user cannot act on is worse than silence.
**Collides:** FR-C5 × FR-J14 × FR-D18 × FR-L3.
**Fix:** Make compatibility redeploys a first-class exempt path — no library-update confirm bundling, no edit-lock requirement (it redeploys the working doc unchanged), and available on Free; and extend the watch itself to Free connections since the risk is plan-independent.

### H8. FR-L1's yearly default breaks Appendix F's arithmetic and G7's headline number
**Location:** FR-L1; Appendix F; G7; G10.
**Scenario:** Appendix F computes everything from the **monthly** price: "Dodo: 4% + 40¢, +1.5% international, +0.5% subscription → net ≈ **$13.70–13.93 on $15**… **break-even ≈ 8–9 Pro subscribers**… Modeled 1,000 Free + 200 Pro: ≈ $110–160/mo infra vs ≈ **$2,700/mo net**." FR-L1 then makes **yearly the pre-selected plan**. Run the same fee schedule on $150: 4% ($6.00) + 0.5% subscription ($0.75) + $0.40 = $142.85 domestic; +1.5% international = $140.60. Per month that is **$11.72–11.90**, not $13.70–13.93. Against the appendix's own fixed cost of $105–125/mo, break-even is **9–11 subscribers, not 8–9**, and the 200-Pro model yields ≈ **$2,360/mo**, not $2,700 — a 13% overstatement of the number the owner plans runway against. The appendix cites FR-L1 as a retention lever in the very next paragraph and never re-ran its own math against it.
**Collides:** FR-L1 × Appendix F × G7.
**Fix:** State a plan mix assumption (e.g. 70% yearly), recompute blended net/mo and break-even from it, and update G7's "~8–9" accordingly.

### H9. FR-L2's entitlement machine has no refund or chargeback transition — a refunded yearly subscriber keeps Pro for a year
**Location:** FR-L2; FR-L1; FR-N1 (Refund policy); G9; §7.6 (Dodo $30 disputes).
**Scenario:** FR-L2 enumerates the "full transition table" over four webhook events: activated, renewed, payment failed, cancelled. **Refund and chargeback are none of these.** With FR-L1 defaulting checkout to $150/yr, the exposure is 10× what it was: user pays $150, creates 25 projects, exports 25 white-labeled themes, requests a refund on day 20. Dodo refunds. No specified webhook case fires; `subscriptions.status` stays `pro_active` with `period_end` 345 days out; the user keeps 25 projects, 10 connections, 5 GB, and white-label for the rest of the year, having paid nothing. The same hole applies to chargebacks, where Inflozo also eats Dodo's $30 dispute fee. G9's counter-metric ("refund/dispute rate < 2%") measures a failure mode the entitlement machine cannot respond to.
**Collides:** FR-L2 × FR-L1 × G9 × Appendix F.
**Fix:** Add `pro_active → free` on `payment.refunded` / `dispute.opened` (immediate, not at period end) to FR-L2's table, and state the read-only-project consequence explicitly.

### H10. Annual auto-renewal ships with no renewal notice, and FR-P2 forbids adding one
**Location:** FR-L1; FR-P1; FR-P2; G9.
**Scenario:** FR-P1 defines "**exactly five** user-facing transactional emails" — magic link, email change, reconnect needed, payment failed, deploy failure. FR-P2 then forbids the category a renewal notice would live in: "No marketing, digest, or **nudge** emails in v1." So a user who bought the pre-selected yearly plan gets charged $150 twelve months later with **zero advance contact** — the first email they receive is nothing, and the first thing they notice is a card statement. That is the textbook generator of the disputes G9 caps at 2%, and advance renewal notice for annual auto-renewing subscriptions is a statutory requirement in several of Inflozo's target markets (California ARL, various EU/UK consumer rules). Dodo as merchant of record may or may not send one; the PRD never says which party owns it, which is itself the defect.
**Collides:** FR-L1 × FR-P1 × FR-P2 × G9 × FR-N1.
**Fix:** Either state that Dodo sends the renewal reminder as MoR (verified, added to §7.6's build-time list) or make it FR-P1 email #6 and carve it out of FR-P2.

### H11. G1 and G2 are p75 targets that no specified mechanism can compute — §1.3 forbids the instrumentation in the same section
**Location:** §1.3 G1, G2, and the note below the table.
**Scenario:** v2.3 fixed the old "unmeasurable goal" finding by adding percentiles and clock scope: G1 is now "< 10 minutes (**p75**) end-to-end for a first-time user — **including creating the Custom Integration in Ghost Admin**," G2 "< 15 minutes (p75)." A separate v2.2/v2.3 edit added, four lines later: "G8–G10 are internal business goals… **No in-app analytics or telemetry requirement exists in v1**… instrumentation is added only if and when the owner requests it." The carve-out names G8–G10 and pointedly excludes G1/G2 — which are precisely the two goals that need per-user timing across a funnel, one of whose steps happens **inside Ghost Admin, in another browser tab, on a third party's product**. A p75 requires a distribution; no distribution can be collected. The two fixes landed independently and made each other false. QA cannot write a pass/fail test for either.
**Collides:** §1.3 G1 × G2 × the no-telemetry note × NFR-8.
**Fix:** Redefine G1/G2 as moderated usability-test targets with a stated n (e.g. "8 first-time users, timed by the observer, pre-launch") — or add the two funnel timestamps as the sole telemetry exception.

### H12. A29/A30/A31 mix incompatible compile targets and context bindings inside one category — Variant Shuffle produces broken pages
**Location:** Appendix A §A29, §A30, §A31; FR-D13; FR-D17; FR-I1; Synthesis Defaults §3.
**Scenario:** Three categories put structurally non-interchangeable variants in one Shuffle ring. **A29** (14): #1 Tag Banner binds the *tag* object, #2 Author Split binds the *author* object — the Synthesis Defaults author noticed this and hand-patched around it ("#2 required: #1 binds the tag object"), then generalized nothing. A user on `author.hbs` presses `]` — FR-D13's flagship one-keypress play feature — and lands on #3 Tag Cover, which binds a tag that does not exist in author context: the archive header renders empty on the live site. **A30** (15): #1/#3–#8 are signup pages, #2/#9/#10 signin, #11/#12 account, #15 a magic-link confirmation state — each compiling to a *different file* per FR-I1. Shuffling the signup canvas to #11 Account Panel produces a signup page showing account settings. **A31** (10): #1–#5 target `error.hbs`, #10 targets `private.hbs`, #6/#7/#9 target custom page templates, #8 is an archive empty state — so shuffling the 404 section to #10 changes which **file** the section compiles into, and per FR-I1 designing a Private Site Gate is what triggers `private.hbs` emission at all. FR-D17 Site Remix does all of this at once, across every template, in one click, while promising "never-lose-content."
**Collides:** FR-D13 × FR-D17 × Appendix A §A29/§A30/§A31 × FR-I1 × Synthesis Defaults §3.
**Fix:** Add a `bindingContext` / `compileTarget` field to FR-G3's registry entry; FR-D13 and FR-D17 cycle only within variants sharing the placed instance's value, and the Section Picker filters on it.

### H13. A30's two Free variants are a signup page and a signin page — the members Account page has zero Free variants
**Location:** Appendix A §A30; FR-G2; FR-L3; FR-I1.
**Scenario:** FR-G2 promises "Every category includes **at least 2 Free-tier variants** so a Free user can ship a complete, good-looking site." A30's two Free variants are #1 Signup Center Card and #2 Signin Minimal. Every account-page variant — #11 Account Panel, #12 Account Minimal List — is **Pro**. So a Free user who designs `members/account.hbs` (a supported, first-class canvas in FR-D6's switcher, which per FR-I1 auto-emits its route the moment they touch it) has **no Free option at all**. At the exit, FR-L3's block sheet instructs them to "swap each to a Free variant via Shuffle" — there is nothing to swap to. Their only remediation is deleting every section from the template to return it to untouched, which no FR tells them and which the sheet does not offer. The same arithmetic trap sits in A29 (one Free tag header, one Free author header — one usable option each) and A31 (both Free variants are 404 pages; the Private Site Gate and every utility page are Pro-only).
**Collides:** FR-G2 × Appendix A §A30/§A29/§A31 × FR-L3 × FR-I1.
**Fix:** Restate FR-G2 as "at least 2 Free variants **per compile target / binding context** within a category," and re-tier A30 #11, A29 #7, and A31 #10 to [Free] (inventory totals unchanged; 68 Free becomes 71).

### H14. FR-H2 was extended to tag/author archives but not to FR-I2 channels — the same broken-pagination bug survives
**Location:** FR-H2; FR-I2; Appendix A §A34; FR-I5.
**Scenario:** v2.3 correctly extended the main-feed designation to "index, custom collections, and the tag and author archive templates." FR-I2 ships **channels** in v1 as a distinct routes.yaml construct — "filtered post streams with their own path and RSS feed" — and Ghost paginates channels exactly like collections, serving `/page/N/` from the same native posts context. FR-H2's enumeration does not include them, and a channel is not a collection in routes.yaml. Sequence: user builds a channel at `/newsletter/` filtered to `tag:newsletter`, assigns `custom-newsletter.hbs`, drops a Post Grid on it. No main-feed designation rule applies, so the feed is `{{#get}}`-driven with a fixed Count; `/newsletter/page/2/` renders the identical twelve posts as page 1, indefinitely, indexable. That is precisely the duplicate-content failure FR-H2's zero-feed SEO guard exists to prevent, reintroduced in the one paginated context the fix did not reach — and the SEO guard does not fire either, because the template *has* a feed.
**Collides:** FR-H2 × FR-I2 × FR-I5.
**Fix:** Add "and channels" to FR-H2's paginated-context list — one word, plus a Synthesis-Defaults-style default designation when a channel template is created.

### H15. "Restoring the snapshot skips the gscan gate" does not help — Ghost validates the upload itself
**Location:** FR-J13; FR-J6; §1.4 differentiator 5; §7.6 verify list.
**Scenario:** FR-J13's fix for the old "safety gate blocks the safety net" finding is: "Restoring the snapshot skips the gscan gate (it restores **exactly what previously ran**)." Skipping *Inflozo's* gate changes nothing, because the restore is an Admin API theme **upload**, and Ghost runs its own gscan on upload and rejects themes carrying fatal errors. The realistic case is the exact one the snapshot exists for: the user's pre-Inflozo theme is an old Casper fork or a marketplace theme installed years ago, on a site since upgraded from Ghost 5 to 6. It ran fine as an already-installed theme; it will not survive re-upload under current validation. So the one-click restore fails with a Ghost error at the worst possible moment, and "restores exactly what previously ran" is a promise Inflozo does not control and never verified — while §7.6's build-time verify list covers the theme *download* endpoint (item 4) and not the re-upload path.
**Collides:** FR-J13 × FR-J6 × §1.4 #5 × §7.6.
**Fix:** Add "snapshot re-upload accepted by Ghost, including a theme with gscan errors" to §7.6's verify list on all four targets, and specify the designed fallback when Ghost rejects it (offer the snapshot zip as a download plus Settings → Design guidance).

### H16. FR-J13's no-recapture rule keys on the theme *name*, while the signature is name **plus** marker — a manually installed export defeats it
**Location:** FR-J13; FR-J12; FR-J15.
**Scenario:** FR-J13 defines the signature as "the `inflozo-*` name **plus** a `package.json` marker," then writes the protective rule against the name alone: the snapshot "is never re-captured while the active theme is an **`inflozo-*` theme**." Sequence: Pro user exports their theme (FR-J12, white-labeled per FR-J15), renames the zip's package name to `acme-blog` — Ghost takes the theme name from `package.json` — and installs it manually in Ghost Admin. Later they connect that site to Inflozo and deploy. Inflozo sees an active theme named `acme-blog`, concludes it is not an `inflozo-*` theme, and captures it as the site's **pre-Inflozo snapshot**. The user's "restore my original site" button now restores an Inflozo theme — the exact "restore-to-original silently becomes restore-to-Inflozo" outcome the rule was written to prevent, reached through two supported features.
**Collides:** FR-J13 × FR-J12 × FR-J15.
**Fix:** Key the no-recapture rule on the `package.json` marker, not the theme name — one clause, and it is the reason the marker exists.

### H17. The per-site snapshot has no place to live — §7.1's only artifact bucket is project-keyed, and FR-A5 purges it
**Location:** §7.1 buckets; FR-J13; FR-B3; FR-A5.
**Scenario:** FR-J13 was hardened to make the snapshot survive project deletion and disconnect/reconnect — "a per-site artifact keyed by site URL." §7.1's storage layout was never updated: the buckets are `assets/{userId}/…`, `deploy-artifacts/{projectId}/…`, and `thumbnails`. There is **no per-site bucket**, so the only place an implementing agent can put the snapshot is under a projectId — which is exactly what FR-B3's survival guarantee forbids, and §7.5 has no snapshots table either. Then FR-A5: account deletion "cascades projects, templates, assets, connections, and **deploy artifacts**," with no snapshot carve-out — so a user who deletes their Inflozo account while their live site runs an Inflozo theme has their escape hatch destroyed by the GDPR purge, silently, with no warning in the deletion flow.
**Collides:** §7.1 × §7.5 × FR-J13 × FR-B3 × FR-A5.
**Fix:** Add a `site-snapshots/{siteId}/…` bucket to §7.1 and a `site_snapshots` row to §7.5; make FR-A5's deletion flow offer the snapshot as a download before purging it.

---

## MEDIUM

### M1. FR-D6 says untouched templates synthesize — its own normative companion excludes five template kinds
**Location:** FR-D6; Synthesis Defaults §1; FR-I1.
**Scenario:** FR-D6 states flatly: "**Templates the user hasn't touched** compile from the normative Synthesis Defaults… so a home-only design still produces a complete, coherent theme." Synthesis Defaults §1 then lists "**NEVER synthesized**: `members/signup.hbs` / `signin.hbs` / `account.hbs`, `private.hbs`, `custom-{name}.hbs`, `home.hbs`, `routes.yaml` entries." FR-D6 carries no exclusion, and it is the FR an agent reads first. An agent implementing FR-D6 literally synthesizes members templates for every project — reintroducing the v1.0 review's C2 (dead members files shipping with no routes) that FR-I1 was rewritten to fix.
**Fix:** Add "(except members, private, and custom templates — see Synthesis Defaults §1)" to FR-D6.

### M2. FR-C2 clears Preview-only "via Manage keys" — FR-C8 no longer has a plan field
**Location:** FR-C2; FR-C8.
**Scenario:** FR-C2's Preview-only flag "clears on the first successful deploy **or when the user updates the site's plan via Manage keys (FR-C8)**." FR-C8, rewritten in v2.3 around URL editing, offers exactly four things: re-paste keys, edit the URL, test the connection, save. There is **no plan control**. A user who upgraded their Ghost(Pro) site from Starter to Publisher and wants to clear the flag without a failed-then-successful deploy cycle has nowhere to do it, and an agent building FR-C8 to its own text ships a dangling cross-reference.
**Fix:** Add "site plan (Ghost(Pro) only): Starter / Publisher or higher" to FR-C8's Manage keys field list.

### M3. FR-Q6's Translations module is absent from the plan table and from the data model
**Location:** FR-Q6; Appendix F table; §7.5.
**Scenario:** Appendix F's feature table has a row for "Dark mode authoring · Routes · Style Pack editing ✓ ✓" and no row for Translations or the custom-settings builder — so whether a Free user gets the Translations surface is undefined at the exact moment C2 makes that gate matter. §7.5's data model sketch likewise has nowhere to store translation overrides: `projects` carries `style_pack jsonb` and nothing else, and there is no table for custom-setting definitions (FR-Q2), routes config (FR-I2), notifications (FR-B7), or edit locks (AD2) either — every v2.x addition landed in the FRs and none in the sketch.
**Fix:** Add a "Theme Settings · Translations" row to Appendix F (both ✓), and add `project_config jsonb` (theme settings + custom settings + routes + translation overrides) to `projects` plus `notifications` and `project_locks` tables to §7.5.

### M4. FR-Q6 and FR-C5 rest on unverified external behavior — and §7.6's verify list, the PRD's own discipline for exactly this, was not extended
**Location:** §7.6 "Verify at build time"; FR-Q6; FR-C5.
**Scenario:** §7.6 lists six external facts to re-confirm before the dependent epic starts — routes endpoint, theme-download endpoint, Dodo terms, Ghost 6 pagination, etc. It stops at v2.1's feature set. FR-Q6 introduces a hard dependency on Ghost's `{{t}}` resolution semantics, its locale-file selection from the publication-language setting, and its missing-key fallback, across both 5.x and 6.x — none verified, and H1 shows the PRD already describes the fallback incorrectly. FR-C5's compatibility watch depends on Ghost publishing usable per-release deprecation data. Neither is on the list.
**Fix:** Add items 7 ("Ghost `{{t}}` + `locales/` resolution and fallback on 5.x and 6.x") and 8 ("Ghost release-note format usable as compatibility data") to §7.6.

### M5. G1 and G2 cannot both be true, because nothing says whether G2 contains G1
**Location:** §1.3 G1, G2.
**Scenario:** G1: connect → branded canvas, < 10 min p75, explicitly including Ghost Admin integration setup. G2: "Blank project → first successful deploy, < 15 min p75." A blank project cannot deploy without a connected site, so G2's journey **contains** G1's — leaving 5 minutes for choosing a starter or building a page, designing, compiling, gscan, uploading, and activating. Either G2's clock excludes connect (unstated), or the two targets are jointly unachievable by construction.
**Fix:** State G2 as "from an existing connection: blank project → first successful deploy," excluding connect.

### M6. FR-J14's degradation clause describes a state its own contract forbids
**Location:** FR-J14.
**Scenario:** Same paragraph: "variants are **never deleted**, only superseded (hidden from the Section Picker; **placed instances keep rendering**)" and, three clauses later, "a placed section that **no longer resolves** degrades to the nearest current variant with a visible notice." If variants are never deleted, no placed section can fail to resolve. One agent builds no degradation path (correctly, per the contract) and another builds it plus the deletion case it implies; the contract's credibility is the casualty either way.
**Fix:** Scope the degradation clause to its real trigger — a project doc referencing a variant id from a *migration* that failed — or delete it.

### M7. Appendix F tells the reader to model a churn spike and then does not, while G10 asserts the opposite
**Location:** Appendix F "Retention modeling"; G10.
**Scenario:** Appendix F: "an export-and-cancel cohort is expected — **model a month-1 churn spike honestly in blended LTV**." No spike is modeled, no LTV appears, no churn assumption is stated, and break-even is not re-derived. G10 meanwhile sets a hard target of "Pro monthly churn < 5%." So the economics appendix expects a month-1 spike and the goals table forbids one, and the owner has two contradictory numbers for the same quantity.
**Fix:** Put a number in Appendix F (e.g. "assume 25% month-1 churn, 4% steady-state → blended LTV ≈ $X") and restate G10 as steady-state churn measured from month 2.

### M8. FR-J14's cadence commitment makes "487" wrong by design — and Appendix H hard-codes it as verbatim copy
**Location:** FR-J14; G5; FR-G1; Appendix H.
**Scenario:** FR-J14 commits to "monthly drops of new variants and/or Style Packs" and to never deleting variants. G5 and FR-G1 fix the library at "34 categories, 487 unique variants," and Appendix H makes "Every great site starts somewhere. Yours starts with **487 gorgeous sections**." a canonical string "reused verbatim." One month after GA the product's own empty state lies, and the marketing gallery (FR-N2, E14's exit criterion "gallery renders all 487 variants") is pinned to a number the roadmap guarantees will move.
**Fix:** Make the microcopy count-agnostic ("hundreds of gorgeous sections") and restate G5/FR-G1 as "487 at GA; grows post-launch per FR-J14."

### M9. A URL-keyed snapshot survives disconnect — and a different site at the same URL later adopts it
**Location:** FR-C6; FR-J13.
**Scenario:** FR-C6: "snapshots are keyed by site URL and survive disconnect/reconnect." User disconnects `blog.example.com`; the snapshot persists, orphaned, keyed to that URL. Six months later they connect a *different* Ghost install now serving that URL — a staging-to-production cutover, or a rebuilt site. FR-J13's capture trigger fires (first upload to this site record, active theme is not `inflozo-*`), but nothing says whether the new capture overwrites the orphan or the orphan is silently adopted as this site's "original." Restore then reinstalls a theme from a site that no longer exists.
**Fix:** Give orphaned snapshots a TTL or bind them to the site record id rather than the raw URL, and state the overwrite rule.

### M10. The compatibility alert is in-app only, with 90-day retention, for users who by definition are not logging in
**Location:** FR-C5; FR-B7; FR-P2.
**Scenario:** FR-C5's compatibility notification goes to FR-B7's notifications center, which FR-P2 forbids escalating to email ("Theme updates available… surfaced in-app only") and FR-B7 prunes at 90 days. The population at risk is precisely the population that deployed once and left — a Ghost release breaks their theme, the notice lands in a feed they never open, and it is deleted before they next sign in. The only signal Inflozo has that a customer's site is broken expires unread.
**Fix:** Exempt site-health and compatibility notifications from the 90-day prune, and carve compatibility alerts out of FR-P2 as an extension of FR-P1's existing "Reconnect needed" health email.

### M11. Translations are derived from the linked site's locale, and FR-B5 lets a project change sites
**Location:** FR-Q6; FR-B5; FR-J10.
**Scenario:** FR-Q6 defaults the locale "to the connected site's `@site.locale`, **user-selectable for unlinked projects**" — i.e. a linked project's language is not user-selectable. User builds a project against their German site, overrides 40 chrome strings, deploys. Per FR-B5 they switch the project's target to their English site (supported, "switchable"). The locale code now derives from an English site: do the German overrides ship as `en.json`, get orphaned, or get dropped? FR-Q6 has no rule for a language change, and FR-J10's per-site theme-name freeze means the project legitimately serves both sites over its life.
**Fix:** Store the language on the project (defaulted from the site at first link, always user-editable), and warn on site switch when the new site's locale differs.

### M12. §4's Live/Test cutover strands every pre-launch record, including the public suggestions board
**Location:** §4 post-launch topology; FR-M3; FR-N5.
**Scenario:** §4: "at go-live, a **fresh** infrastructure set is provisioned as Live (**new Supabase project**…) and takes over the production domains; the existing pre-launch stack… becomes the permanent Test environment." The pre-launch stack has been serving the real marketing site on inflozo.com with a **public suggestions board** (FR-M3) collecting real submissions and votes from real visitors, plus the dogfooded FR-N5 Ghost theme project. At cutover all of it stays behind in Test: the public board resets to empty on launch day, and the project that builds the company's own blog theme lives in the test environment forever. No migration is specified.
**Fix:** One line in §4: suggestions, votes, and the dogfood project are exported from Test and imported into Live at cutover; everything else starts empty.

### M13. A31 models error pages two ways at once — one `error.hbs` cannot be both
**Location:** Synthesis Defaults §3 `error.hbs`; Appendix A §A31; FR-I1.
**Scenario:** Synthesis Defaults says the default error page is A31 #1 with the "**numeral bound to the error context's status code** — one `error.hbs` serves 404 and 500." Appendix A treats status as a **variant identity**: #1–#4 are 404 designs ("huge 404", "apology + search + popular tags") and #5 is a separate "500 Calm — reassuring server-error page." Both cannot hold. If the numeral is bound, #5 is a redundant variant and #2's "apology + search + popular tags" is wrong copy for a 500. If it is not bound, the default error page prints "404" on server errors. And since FR-I1 emits one `error.hbs`, a user who picks #2 serves a search box to visitors hitting a 500.
**Fix:** Bind the numeral and message to the error context in every A31 error variant, and re-describe #5 as a *treatment* (calm//playful/recovery) rather than a status code.

### M14. Promoting the accent silently disarms the Style Pack switcher on the live site
**Location:** FR-Q3; FR-Q5; FR-E2; §1.4 differentiator.
**Scenario:** User promotes the accent token to Ghost Admin (FR-Q3/FR-Q5) and deploys; the site owner picks a color. Later the user switches Style Packs — FR-E2's designed "wow moment," a full restyle in ≤ 300 ms — and redeploys. The new pack's accent compiles only as the `@custom` **default**, and Ghost keeps the owner's stored value, so the live site's accent does not change. The canvas shows the new pack; the site shows the old accent. FR-Q5's one-time caution covers contrast, not this.
**Fix:** Warn at pack switch when the accent is promoted ("your site's accent is set in Ghost Admin and won't change"), and surface the promoted-token state in the Style panel.

---

## LOW

### L1. Appendix C's Text Field row does not carry FR-Q3's plain-text lock
**Location:** Appendix C; FR-Q3; FR-D4. Appendix C is normative and still says Text Field/Area allows "text + inline marks (bold/italic/underline/link)" with no mention of the bound-to-Ghost-setting lock that v2.3 added in two other places. **Fix:** add "(marks disabled while the prop is bound to a Ghost Admin text setting — FR-Q3)".

### L2. FR-J3 says assets are "copied"; FR-J5 says they ship "pre-generated responsive sizes"
**Location:** FR-J3 vs FR-J5. FR-J3: referenced assets "are **copied** into `assets/images/` with content-hashed filenames." FR-J5: "theme-bundled assets ship **pre-generated responsive sizes** from compile." One pipeline, two descriptions; the second was added to close an old finding and the first was not updated. **Fix:** state the rendition set in FR-J3 (e.g. 400/800/1600 widths + original).

### L3. T4's acceptance criterion became trivial when Preview-only became user-declared
**Location:** §4 T4; FR-C2. §4 requires "the block path passes on T4," but FR-C2 now sets Preview-only from a user's self-declaration, so the block path can pass without ever touching T4. The real test is that a deploy attempt against a Starter site fails and flips the flag. **Fix:** restate T4's criterion as "a deploy attempt against T4 fails with the friendly Starter message and sets Preview-only."

### L4. E4 must implement `{{t}}` against a catalog E7 defines
**Location:** §8 E4, E7; FR-H5; FR-Q6. E4 ships the helper shim and five pilot sections rendering "editor-perfect"; the shim's `{{t}}` needs the string-catalog format, which lands in E7 with the Translations module. **Fix:** move the catalog *format* (not the Translations UI) into E4's scope.

### L5. The Translations catalog cannot control Ghost's native search overlay
**Location:** FR-Q6 ("search placeholder"); Appendix A §A23; §7.6. A23 #1–#8 are triggers for Ghost's bundled Sodo search, whose overlay strings belong to Ghost, not the theme. The theme-side placeholder is translatable; the results overlay is not. **Fix:** scope FR-Q6's search entry to theme-rendered trigger text.

### L6. E11's exit criterion sits exactly on FR-J11's rate limit
**Location:** FR-J11; §8 E11; §4. FR-J11 caps deploys at 10/hour/site; E11's exit is "every starter deploys 0/0 gscan to all live Ghost deploy targets" = 10 starters per target, with E2E and manual testing on the same droplets. **Fix:** exempt the §4 test targets from the rate limit, or state that the gate runs serialized across hours.

### L7. NFR-2's 30 KB JS budget does not count the custom search overlay
**Location:** NFR-2; FR-J4; Appendix A §A23 #9–12. "Total theme JS < 30 KB gzipped for a **maximal** design" is measured against FR-J4's nine behavior modules; A23's Custom Overlay variants add a client-side Content API search client with NQL querying and result rendering, which FR-J4's list omits. **Fix:** add search to FR-J4's module list and re-derive the budget.

---

## Scorecard

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 13 |
| Medium | 14 |
| Low | 7 |
| **Total** | **37** |

## What survives (verified, not assumed)

I re-tested the prior passes' findings rather than trusting the changelog. Genuinely closed: the epic wave counts are now correct (156/199/132, and they sum to 487); the inventory's tilde is gone and the totals assert exactness; FR-J10's per-site name freeze resolves the old rename/collision deadlock cleanly; rollback and snapshot restore are explicitly exempted from the edit lock; FR-D9/AD1's journal-clear-on-hydrate closes the undo-corruption hole properly; fonts are self-hosted; infinite scroll is in FR-G4's no-JS list; G4 is scoped to packs and library defaults; FR-C2 honestly admits no plan-detection API exists; FR-J13 names the download endpoint as internal and puts it on the verify list; NFR-4 has PITR and a restore drill.

I also spot-checked all **19 variant references in the Synthesis Defaults** against `sections-inventory.md` — every id, name, and [Free] marking resolves correctly (A1 #1, A3 #1, A4 #1/#2, A10 #1, A17 #1, A18 #1, A24 #1, A25 #1, A26 #1, A27 #1, A28 #2, A29 #1/#2, A31 #1, A32 #1/#2, A33 #1, A34 #1). The Synthesis Defaults' *internal* craft is good; what it lacks is any check against the FRs it interacts with (C3, H12, M1, M13).

## Minimum bar before handing downstream

C1, C2, and C3 are not negotiable — each is a one-paragraph decision and each currently ships a product that either destroys a customer's site, gives away the paid feature, or cannot be built consistently. H1–H5 (the entire Translations module) should be settled together in one pass, because FR-Q6 was written in isolation and touches six other requirements. H8–H10 are the owner's own money and should not go to an agent at all.
