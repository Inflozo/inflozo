# Buildability Simulation — Inflozo PRD v2.3

**Method.** Not a critique. I tried to actually do three jobs from these documents — draft the architecture, decompose three epics into stories, and write the test plan — and logged every point where I had to invent a fact the PRD does not supply. Every finding names the task I was performing when I hit the wall. Sources read in full: `prd.md` (593 lines), `sections-inventory.md` (685 lines, incl. Synthesis Defaults), `addendum.md`. Cross-checks run against `_bmad-output/planning-artifacts/design/` (referenced by E1).

Counts: **28 invented facts / stalls** in Simulation 1 · **22 FRs that resist decomposition + 7 sequencing breaks** in Simulation 2 · **24 untestable requirements or unmeasurable NFRs** in Simulation 3.

---

## Verdict — can autonomous agents build this?

**No, not unaided — but the failure is narrow and localized, not diffuse.**

This PRD is genuinely above-average on *product* decisions. FR-L2's entitlement transition table is complete. FR-L3's downgrade rules resolve every over-limit resource. The Synthesis Defaults document is the best-specified artifact in the set — it is directly compilable, states its own invariants, and even explains why it picks A28 #2 over #1. FR-J10's per-site theme-name freeze anticipates a failure mode most PRDs never see. The epic wave arithmetic checks exactly (156 + 199 + 132 = 487, and each wave's category membership sums correctly — I verified all three). Appendix I's glossary genuinely disambiguates.

It fails precisely where an autonomous chain needs it most: **the machine's mechanisms, the data model's completeness, the quality gates' thresholds, and the epic ordering.**

Three failures are structural, not cosmetic:

1. **The single most expensive component in the product is never named.** §7.3 mandates one-source sections, §7.4 shows the theme tree, FR-J1 states input and output — but nothing states *how content gets from the project doc into the `.hbs`*. Working it through (Simulation 1, stall A4), Ghost's Handlebars offers no literal-object construct and no theme-registered helpers, so partial-parameter passing is impossible for any `items[]` section — which is most of the marketing library. **A Handlebars partial evaluator with an AST→source printer is therefore forced**, and Handlebars ships no printer. That is a multi-week component sitting on E4's exit criterion, unscoped and unmentioned.

2. **§8's sequencing is circular in five places.** An SM building epics in the stated order stalls at E3. E3's exit criterion requires E7's deploy path; E3's FR-C7 requires E6, E11, and E4; E4's exit criterion requires E7's compiler; E7 requires E8's asset bundling and E12's entitlements. This is not a reordering nit — the exit criteria as written cannot be met in the stated order.

3. **§7.5 is prescriptive and incomplete — the worst combination.** It dictates eight table shapes, constraining the architect, while omitting at least eight tables the FRs require. One omission is not merely a gap but a live defect: FR-J10's frozen theme name has nowhere to live except derivation from `deploys`, and FR-J7's retention pruning (last 10 / last 3) deletes the row that would carry it — silently unfreezing the name and producing exactly the orphaned themes FR-J10 forbids.

An architect agent can produce *an* architecture from this, but it will make ~28 consequential decisions the PRD did not make, several of which (snapshot RLS scoping, CSP vs Handlebars, thumbnail capture path) change the security posture or the cost model. A QA agent cannot write a pass/fail test for the product's headline goals at all, because the PRD sets p75 targets and then forbids the telemetry that would measure them.

**Recommended gate: not ready for Architect handoff.** Roughly 15 decisions would clear the critical path — they are enumerated in Findings by Severity.

---

## Simulation 1 — Architect (what I built, where I stalled)

### What I successfully built

Working from §7.1–7.6 plus the FRs, I got a coherent design for: the Vercel/Supabase topology; auth (magic link primary, passkeys flagged); the Content-API-in-browser / Admin-API-server-only split (§7.2 is clean and its rationale in FR-C3 is sound); the storage bucket layout; the canvas overlay-chrome geometry (same-origin iframe, `getBoundingClientRect` offset by iframe position, re-measure on ResizeObserver + MutationObserver + iframe scroll); per-section subtree re-render on control change rather than whole-template re-render; the CSS emission model (per-variant CSS modules as source of truth, concatenated into `screen.css` at compile — FR-J3 and §7.4 agree on this, and the picker's per-variant preview requirement forces the per-variant source form); and the deploy state machine. The Synthesis Defaults compile path I could design directly from the document with no invention at all.

Then I hit walls.

### A4 — STALL: the content-baking mechanism is undefined, and it is not free

**Task:** designing the compile pipeline's core transform — project doc → theme `.hbs` files.

**Where I looked:** FR-J1 (input/output only), §7.3 (asserts markup is "byte-comparable to shipped markup", describes no mechanism), §7.4 (shows the output tree), P3 ("bake by default"), P4 ("one source of truth").

I worked the options:

- **(i) Inject content as a Handlebars context in the compiled theme.** Requires the compiled `.hbs` to declare a literal object. Ghost's Handlebars has no `{{#let}}`, no literal-object construct, and themes cannot register custom helpers. **Impossible.**
- **(ii) Pass content as partial hash params** (`{{> section-3 headline="…"}}`). Works for scalars. Handlebars hash params **cannot express arrays of objects**, so every section with `items[]` — A5 Features, A8 Testimonials, A9 FAQ, A10 Stats, A11 Logo Walls, A12 About, A13 Process, A14 Galleries, A16 Contact, and more — cannot receive its content this way. **Impossible for most of the library.**
- **(iii) Partial evaluation:** run Handlebars over the source `.hbs` resolving only Inflozo-namespaced expressions to literals, while leaving every Ghost helper (`{{#foreach posts}}`, `{{title}}`, `{{@custom.*}}`, `{{#unless access}}`) untouched as source text. **This is the only survivor, so it is forced.**

**What I had to assume:** (iii), implemented as a `Handlebars.parse()` AST walk with a hand-written AST→source printer (Handlebars ships a parser, not a printer) or a source-span splicer.

**What breaks if I assume wrong:** nothing — I don't think an architect can assume otherwise. The finding is that the PRD *hides* a component whose cost is comparable to the entire editor shell, and puts it on the critical path for E4's exit criterion ("5 pilot sections … compile byte-identical") three epics before the compiler epic. Two consequences nobody has costed:

- §7.3's "byte-comparable markup" claim is not a property of the design; it is a property this partial evaluator must *earn*, expression by expression.
- A user typing `{{title}}` into a headline would be re-evaluated by Ghost at render time on the live site. Escaping the substituted literals is required and unspecified.

### A5 — STALL: "one partial per placed section instance group" — "instance group" is undefined

**Task:** emitting `partials/`.

Two placements of A17 #1 with different control values: one parameterized partial, or two partials? §7.4's phrase is the only occurrence of "instance group" in either document. **Assumed:** one partial per placed instance, `partials/sections/{template}-{n}-{variantId}.hbs`, content baked. **If wrong** (one partial per variant, parameterized), FR-Q3's `{{@custom.*}}` rewrite — where a bound control reads from Ghost Admin instead of the baked value — becomes per-invocation and needs an entirely different mechanism.

### A6 — DERIVED (unstated): the control→CSS mechanism

**Task:** making two A5 Features instances on one page render at columns=3 and columns=4 from a single shared CSS file.

Nothing in the PRD states how a control value reaches CSS. Options: data attributes with attribute selectors, per-instance inline custom properties, or generated per-instance classes. I could resolve this one myself: P2 and Appendix C forbid open-valued controls, so every control's value set is closed and enumerable — which makes data-attribute selectors viable and is almost certainly the intent. **Derivable, but this is the load-bearing fact that determines whether 487 variants can be authored as static CSS at all**, and it is stated nowhere.

### A7 — STALL: section CSS authoring format

Is registry `css` plain CSS with `var(--tokens)`, or PostCSS/Tailwind? FR-G3 says only "css". **Assumed:** plain CSS + build-time concat/minify. **If wrong** and the team adopts Tailwind for the Next.js app (the default choice), the section CSS must be explicitly excluded from the app's Tailwind pipeline — and utility classes are structurally incompatible with token-only styling (FR-E4). Nothing says so.

### A1 — STALL: the compile job model

**Task:** designing FR-J8's five-stage progress UI and its Cancel affordance.

FR-J8 requires Compiling → Checking → Uploading → Activating → Live with cancel during the first two stages. §7.5 has no `jobs` table; `deploys` has a `status` column but FR-J7 says artifacts are stored on *successful* compile, implying failed compiles have no row — so the progress UI would have nothing to poll. **Assumed:** a `deploy_jobs` row created at request time with a stage enum + a cancel flag, client polls at 1 Hz. **If wrong** (a single long-running function streaming SSE), cancel semantics change entirely: server-side cancellation requires the job record.

Related unstated: Vercel Node function max duration and memory for a job that assembles a tree, subsets fonts, fetches assets from Storage, runs gscan, and zips.

### A2 / A3 — STALL: font strategy

**Task:** implementing FR-J3's "compiler bundles woff2 subsets of the project's font pairing".

*Which subsets?* Content-driven subsetting is **actively wrong** here: the theme renders posts the user writes *after* deploy, which the compiler cannot see. **Assumed:** static pre-built latin + latin-ext subsets checked into the repo. **If wrong** (dynamic subsetting), the compile function needs a native subsetting binary on Vercel, and it collides head-on with FR-Q6's promise of translations "in any language" — a latin subset breaks Cyrillic, Greek, CJK.

*Which fonts?* FR-E1 says "a curated pool of ~30 Google Fonts pairings". Appendix D names 12. **The other ~18 are not listed anywhere in either document.** Weights per family, and variable-vs-static, are also unstated — and both determine bundle size, `@font-face` emission, and the NFR-2 Lighthouse outcome. I had to invent the pool. There is no fixture for FR-E3's "font pairing list" UI.

### A8 — STALL: gscan version policy

FR-J6 makes gscan the deploy gate and targets 0 errors / 0 warnings for all library output. gscan adds rules across versions. A gscan bump can turn the entire shipped library red and **block every user's deploy simultaneously**. §7.6's "Verify at build time" list has six items; gscan is not one of them. **Assumed:** pin the version; upgrade only behind a library release with a full re-run. Unstated, and it is a live-availability risk, not a build-time one.

### A9 — STALL (security-relevant): where does the pre-Inflozo snapshot live, and what is its RLS key?

**Task:** designing the FR-J13 table.

FR-J13 says the snapshot is "a per-site artifact **keyed by site URL**", surviving project deletion *and* site disconnect. FR-C6 confirms disconnect must not delete it. But NFR-3 mandates "RLS on every table keyed to `auth.uid()`". A table keyed by URL and not by user has no `auth.uid()` to key on — and if two users connect the same Ghost site (an agency and its client, entirely plausible given the multi-site-operator persona in §3), a URL-global key means **one user's archived theme zip is reachable by another user**.

**Assumed:** `site_snapshots(user_id, site_url, artifact_path, captured_at)`, unique on `(user_id, site_url)`, RLS on `user_id`. **If wrong** (genuinely global URL key intended, which is the literal reading), NFR-3 is violated and cross-tenant leakage of a theme archive is possible. This is the ambiguity I would escalate first.

### A10 — STALL: snapshot collision on URL edit

FR-C8 lets the user edit a site's URL in place, carrying the snapshot. If the target URL already has a snapshot (the user previously connected it), the unique key collides. Undefined. **Assumed:** keep the incumbent, discard the moved one. Silently breaks the safety promise for whichever site loses.

### A11 — STALL: asset usage tracking

**Task:** FR-K4's "Used in 3 projects" chip and "deleting a used asset … lists affected projects; compile blocks until resolved".

§7.5 has no join table. Deriving usage means scanning every `project_templates.doc` jsonb for the asset id — and FR-K1's grid shows chips for *all* assets at once, so N scans per page load. **Assumed:** an `asset_usages(asset_id, project_id)` table recomputed server-side on each doc upsert. This introduces a correctness hazard the PRD never acknowledges: with local-first persistence syncing every 3 minutes (FR-D10/AD1), a doc can reference an asset for minutes before the server learns of it, so **FR-K4's delete warning is wrong by up to one sync interval** — a user can delete an asset the server believes is unused while it is in fact placed.

### A12 — STALL, and a latent defect: where does the frozen theme name live?

**Task:** FR-J10's "theme name freezes per site, at the project's first deploy to that site".

That is a fact about a `(project, site)` pair. §7.5 stores it nowhere. The only derivation available is "the name on the earliest `deploys` row for this project+site". **But FR-J7 prunes deploy artifacts to the last 10 (Pro) / 3 (Free).** If pruning removes rows (or the row's name field, which does not exist either), the frozen name is lost, the next deploy re-derives a fresh name, and Ghost Admin accumulates the orphaned themes FR-J10 explicitly promises to prevent — plus rollback history splits across two theme names.

**Assumed:** a `project_site_bindings(project_id, site_id, theme_name, frozen_at)` table exempt from pruning. **This one is not merely a gap: the PRD's own data model contradicts the PRD's own guarantee.**

### A13–A16 — STALL: four more missing tables

Building the schema from §7.5 plus the FRs, these are required and absent:

- **`notifications`** (FR-B7: per-user feed, unread badge, mark-all-read, **90-day retention** — which also needs a cron job; §7.1's cron list contains only health checks).
- **`edit_locks`** (AD2 names "a lock record per project … in Postgres"; §7.5 does not carry it).
- **routes state on `sites`** (FR-I4: the last routes.yaml *offered* per site, plus a "Routes unverified" verification state).
- **`entitlements`** — FR-L2 names "an `entitlements` state machine" with five states; §7.5 has only `subscriptions.status`. Table or derived view? **Assumed** derived. If a table was intended, the "verify directly on return from checkout, don't wait for the webhook" write path differs.

### A17 — STALL: `{{#get}}` is async; Handlebars block helpers are synchronous

**Task:** implementing FR-H5's shim.

`{{#get}}` maps to Content API fetches; Handlebars renders synchronously. To render at all, the runtime must pre-resolve every `{{#get}}` — parse the AST, extract invocations and params, fetch, then render against a cache. But `{{#get}}` params can reference the *current render context* (A27 Related Posts: `{{#get "posts" filter="tag:{{primary_tag.slug}}"}}`), which is only known during render, so a pure pre-pass fails.

**Assumed:** restrict the registry so `{{#get}}` filters may reference only the **template-level** context (the post/tag/author being previewed), which is knowable before render. **If wrong**, the shim needs an async Handlebars — which does not exist upstream and would be a significant build.

Note the assumption **silently constrains the section library**, and nobody has been told. A27's "`{{#get}}` by primary tag with fallback to latest" is a *conditional second query based on the first query's result count* — two sequential round trips, and on the live Ghost side it must be expressed as nested `{{#get}}` blocks with an `{{#if}}`. The canvas must emulate that identically for NFR-6(c) to pass.

### A18 / A19 — STALL: rich text has no storage format and no editing engine

**Task:** FR-D4 inline editing.

*Engine:* §7.3 says "contenteditable regions … mapped to schema props via data-attributes", implying raw contenteditable, not an editor library. **Assumed:** raw contenteditable + a mark serializer + paste sanitization to `<strong>/<em>/<u>/<a>`. **If wrong** (ProseMirror/Lexical/Tiptap intended), the editor's own DOM lives *inside* the iframe — which breaks §7.3's byte-comparable-markup claim outright.

*Storage format:* unstated. A text prop with marks is HTML, a portable JSON tree, or plain-text-plus-marks-array. P3's baking makes an HTML string natural — but then the compiler emits unescaped user HTML via `{{{ }}}`, and FR-Q3's "binding to a Ghost Admin text setting strips marks" implies a dual mode. **Assumed:** constrained HTML string, sanitized on write, emitted triple-stash. Every text control, the compiler, and FR-Q3's strip behavior change if wrong.

*Two editors, one value:* FR-D4 requires every text prop to be editable **both** on canvas **and** in the sidebar's Content group ("owner requirement"). A plain sidebar `<textarea>` cannot show marks. **Assumed:** the sidebar hosts a second contenteditable sharing the toolbar. Materially affects the controls-engine story; unstated.

### A20 — STALL: how is the project thumbnail captured?

FR-B1 requires an "auto-captured canvas thumbnail". §7.1 lists "thumbnail capture" among the Vercel Node functions — implying **server-side**, which means running the whole section runtime headless (Playwright/Chromium on Vercel: large, slow, and not in Appendix F's ≈$45/mo fixed cost model). **Assumed:** client-side capture from the same-origin iframe document. **If wrong**, a headless-browser service is required and **Appendix F's unit economics — and therefore G7's "break-even at ~8–9 Pro subscribers" — are wrong.**

### A22 — STALL: CSP vs Handlebars-in-the-browser

NFR-3 requires "CSP on app and marketing" and states no policy. §7.1 mandates a Handlebars runtime in the browser. **`Handlebars.compile()` builds templates via `new Function`** — which a CSP without `'unsafe-eval'` blocks. So either the app ships `'unsafe-eval'` (gutting the CSP on the exact surface that renders user content) or all 487 variants are **precompiled** into a browser bundle per library release. Precompilation is compatible with FR-J14's single live library, so it works — but it is a real build-pipeline component, and neither NFR-3 nor §7.3 confronts the conflict. **Assumed:** precompiled templates, CSP without `unsafe-eval`.

### A21, A23, A24, A25, A26, A27, A28 — remaining inventions

- **A21 Deploy concurrency.** §4 serializes CI runs per target because "theme activation is globally stateful", but nothing governs two *user* projects deploying to the same site concurrently. FR-J11's 10/hour rate limit is not a mutex. **Assumed:** a per-site advisory lock.
- **A23 Account deletion vs Dodo.** FR-A5 cancels the subscription at soft-delete and offers "Restore account" for 14 days — but says nothing about the subscription on restore. **Assumed:** restore returns as Free; user re-subscribes. The alternative (defer cancellation to hard purge) bills a user for 14 days after they asked to be deleted — a direct hit on G9's <2% refund/dispute counter. **The PRD makes no decision.**
- **A24 `admin` claim.** §3 names a Supabase custom claim gating moderation. No FR provisions it. **Assumed:** manual SQL.
- **A25 Library versioning.** FR-J14's confirm step must list "what changed … naming the project's affected placed sections". That needs (a) a `library_version` stamped on each deploy — `deploys` has no such column — and (b) a machine-readable library changelog format. Neither exists.
- **A26 "nearest current variant".** FR-J14: a placed section that no longer resolves "degrades to the nearest current variant". **"Nearest" is defined nowhere.** By category? By structural similarity? By index? **Assumed:** same category, lowest index. If wrong, users get arbitrary re-designs of live sites.
- **A27 Compatibility watch has no substrate.** FR-C5 (Pro feature) promises the daily check compares "each connected site's Ghost version against **the library's compatibility data**" and notifies "when a Ghost release affects something the site's deployed theme uses". FR-G3's registry entry format has **no compatibility field**. There is no per-variant declaration of Ghost feature dependencies, no per-release impact feed, and no process to author either. **I could not design this at all** — there is nothing to build from.
- **A28 Export log.** FR-Q2 freezes custom-setting keys "once deployed **or exported**". Nothing records exports. **Assumed:** an `exports` table.

### Where the PRD over-specifies — decisions taken away from the architect

1. **§7.3's same-origin mandate rests on a false premise.** It asserts "rect measurement and contenteditable **require** [same-origin]". They do not: a cross-origin iframe can measure its own rects and `postMessage` them out, and can host its own contenteditable and post selection state. The PRD hard-forecloses the safer design on a factual error, then pushes the entire XSS surface onto a sanitizer whose spec is itself incomplete (see T8, Simulation 3). This is the clearest case of the PRD making an architect's call, and making it wrong.
2. **§7.5 — a prescriptive-but-incomplete data model.** It constrains eight table shapes while omitting at least eight required tables (A9, A12, A13–A16, A25, A28). Incomplete guidance that still binds is worse than none.
3. **Implementation constants stated as spec:** FR-D10's 3-minute sync interval; AD1's IndexedDB choice and op-log design; AD2's ~15 s heartbeat / ~30 s nudge timeout / ~60 s stale threshold; FR-K2's WebP q≈82 and 2400 px cap; FR-J3's content-hashed filenames; FR-J10's exact naming scheme; §7.1's "not Edge".
4. **FR-K2 over-specifies against a stale fact.** It requires "a bundled encoder or server-side transcode" because "the browser cannot encode WebP natively (Safari)". Safari has supported `canvas.toBlob('image/webp')` since well before the 16.4 floor NFR-7 sets. An agent following the PRD ships ~300 KB of dead wasm.
5. **FR-E4 dictates the exact CSS emission structure.** Arguably justified — it is load-bearing for the "Auto dark mode works with JS disabled" promise — but it is architecture written as requirement.
6. **Correctly placed, for contrast:** §7.3's rejection of React section re-implementations is a genuine product invariant (P4), and AD3's rejected-alternatives log is exactly the right way to hand an architect the shape of a decision without re-litigating it. More of the doc should look like AD3.

---

## Simulation 2 — Story writer (the three epics, FRs that resist decomposition)

I decomposed **E1 (foundation)**, **E7 (compiler — the middle heavyweight)**, and **E12 (billing — late)**.

### E1 · Foundations & Design System

| Story | Acceptance criteria drawn from | Status |
|---|---|---|
| E1.S1 Repo, Next.js App Router, CI/CD, two domains one deployment | §7.1 | **Writeable.** Needs host-based middleware rewrites into route groups — mechanism unstated but derivable. |
| E1.S2 Supabase schema + RLS | §7.5, NFR-3 | **BLOCKED.** See S-DB below. |
| E1.S3 Design tokens/components per the design references | E1 text | **BLOCKED.** See S20 below. |
| E1.S4 Magic-link auth, branded template via Resend SMTP | FR-A1, §7.1 | **Writeable, clean.** "No password field exists anywhere" is a directly testable AC. |
| E1.S5 Base nav shell + "dashboard skeleton" | E1 exit | **BLOCKED.** See S21, S1 below. |

**S-DB (blocked).** Writing E1.S2 means writing the migration. §7.5 gives eight tables; the FRs require at least eight more (A9, A12, A13, A14, A15, A16, A25, A28 above). An SM writing this story from §7.5 will ship eight tables, and **every later epic will carry an un-storied migration** — §8 contains no story anywhere for "add the remaining tables". The AC "RLS on every table, verified" is testable; *which* tables is not answerable from the PRD.

**S20 (blocked): "design tokens/components per the design references at `_bmad-output/planning-artifacts/design/`".** I opened the directory. It contains `claude-design-prompt.md` (a prompt for *producing* mockups) and 20 `.dc.html` artboards. The prompt's own §Calibration text says: *"Label every frame in this set 'Calibration reference — not a spec.' Nothing here overrides the PRD."* **There is no token list, no component inventory, no type or spacing scale for the app chrome.** I could not write a pass condition. **Invented:** extract tokens from the mockups' inline CSS. Real risk: those are canvas artboards, not a design system, and E1 is the epic every subsequent UI story inherits from.

**S21 (undefined term): "dashboard skeleton".** The cut line between E1's skeleton and the real dashboard is not defined anywhere — which matters enormously because of S1.

**S1 (coverage gap): FR-B1 through FR-B6 belong to no epic.** I grepped §8 for every FR id and for "dashboard"/"project". §8 names exactly five FR ids in total (FR-B7, FR-C2, FR-C7, FR-J12, FR-Q). "Dashboard" appears once, as E1's exit ("dashboard skeleton"). **Project CRUD, project cards with thumbnails and deploy-status chips, create-from-starter/blank/duplicate/redesign, rename/duplicate/delete with its live-theme warning, plan caps at creation, project↔site linking, the connected-sites strip, the asset quota meter, the "What's new" popover — none of it is assigned to any epic.** That is the entire primary surface of the product outside the editor.

**S2 (coverage gap): FR-P (Transactional Email) belongs to no epic.** Its five emails are implied across E1/E3/E7/E12, and FR-P3's owner-relay flows fall to E14 by inference. The Resend integration and branded templates have no owner.

### E7 · Compiler, Deploy & Routes

This epic, as scoped, contains: theme assembly, gscan gate, artifacts, deploy/activate, rollback, history, ZIP export, pre-activation snapshot, the library-update redeploy flow, the full Routes Manager, the Theme Settings surface, the custom-settings builder, and the Translations module. That is **four epics wearing a trenchcoat.** Decomposing:

| Story | Status |
|---|---|
| E7.S1 Theme assembly (FR-J1, J2, §7.4) | **Writeable at outcome level** ("compiled `index.hbs` contains the user's headline literally *and* still contains `{{#foreach posts}}`") — even though the mechanism is undefined (A4). Credit where due: an outcome AC exists. |
| E7.S2 Synthesis Defaults | **Writeable, excellent.** `sections-inventory.md` §Synthesis Defaults gives file-level ACs, invariants, and rationale. Best-specified story in the whole PRD. |
| E7.S3 gscan gate | **BLOCKED** — S4 |
| E7.S4 Deploy + activate + progress + cancel | **Writeable.** FR-J8's two-button split and five stages are concrete. |
| E7.S5 Rollback + deploy history | **Writeable**, except retention differs by plan → depends on E12 (Q5). |
| E7.S6 Pre-activation snapshot | **BLOCKED** — S12 |
| E7.S7 Routes Manager | **BLOCKED** — S5 |
| E7.S8 Theme Settings + custom-settings builder | **Mostly writeable**; blocked on S13 |
| E7.S9 Translations module | **BLOCKED** — S3 |
| E7.S10 ZIP export + credits | **Writeable**; gating depends on E12 (Q5) |
| E7.S11 Library-update redeploy flow | **BLOCKED** — S6, S7 |

**S4: FR-J6's "human-readable mapping" does not exist.** The gate must map gscan output to friendly messages. gscan carries ~100 rules. There is no mapping table in any document. Appendix H gives the *voice* and one worked example ("Ghost said no — your Admin key expired"). An SM cannot write "human-readable" as an AC; a Dev must invent ~100 strings with no reviewer.

**S5: FR-I2's filter builder has no field→NQL mapping.** The builder offers All/Any groups over **tag, author, primary tag/author, featured, visibility, published date, has-feature-image** → "compiled to NQL". Writing this story I needed eight mappings and had none. Two are genuinely hard: *published date* — Ghost NQL has **no relative-date syntax**, so "within the last 30 days" cannot compile to a static routes.yaml filter at all; *has-feature-image* → presumably `feature_image:-null`. **If any mapping is wrong, the generated routes.yaml silently returns the wrong posts on the user's live site** — a failure mode with no test surface. FR-I2 also requires client-side "filter syntax" validation, i.e. an NQL parser, which appears in no dependency list.

**S3: FR-Q6's "standard string catalog" does not exist.** FR-Q6 requires that every compiler-generated chrome string live in "one standard string catalog in the section registry", that sections consume them "exclusively via `{{t}}` — never hard-coded literals", and that "compile validation enforces this". It enumerates *categories* (pagination, load-more, member-form feedback, error-page copy, search placeholder, skip-link, lightbox/gallery labels, "Read more"-type labels) but **no keys and no English defaults**. The AC "every chrome string resolves from the catalog" is unwriteable without the catalog. And the enforcement rule constrains all 487 variants in E9–E11, so the catalog must be authored *before* the library — E7 does precede E9, which is correct, but E4's pilot sections precede E7 and would hard-code strings.

**S12: FR-J13's acceptance criterion is a research task.** FR-J13 states that "verifying [the internal theme-download endpoint] per Ghost version/host on all four §4 targets **is an acceptance criterion**". A story whose AC is "find out whether X exists" cannot be marked done-or-not-done by a test; only "investigated". Compounding it: the degraded path is specified as "a **designed flow**, not a warning toast" — with no design, and the UX workflow is delegated out of this PRD entirely (§ intro).

**S13: FR-Q2's key immutability has no data to test against.** Keys are immutable "once deployed **or exported**". Nothing records exports (A28). The AC "renaming a key after export is rejected" has no state to assert on.

**S6/S7: FR-J14 is undecomposable in two places** — "nearest current variant" is undefined (A26), and the "human-readable summary of what changed, grouped by category, naming the project's affected placed sections" requires a machine-readable library changelog format that does not exist (A25).

### E12 · Billing & Entitlements

The best-specified epic in the document. FR-L2's five transitions, idempotency, signature verification, and the return-from-checkout direct-verify are all directly testable. FR-L3's downgrade rules resolve every over-limit resource explicitly and even handle the rollback/restore carve-out. FR-L5 pins upgrade prompts to exactly four moments. I wrote six clean stories with real ACs.

Three gaps stopped me:

**S16: plan switching is undefined.** FR-L1 sells monthly and yearly. FR-L2's transition table covers only `free ↔ pro_active ↔ pro_past_due`. A monthly Pro user switching to yearly produces a Dodo subscription-updated event that maps to **no defined transition**, and FR-L4's "upgrade/cancel/resume" does not name it. **Assumed:** not supported in v1 (cancel + resubscribe). If wrong, an entire billing flow is missing from the epic.

**S17: refunds and disputes have no entitlement transition.** G9 tracks a "refund/dispute rate < 2%" counter and FR-N1 mandates a Refund policy page for Dodo — but no FR says what happens to entitlements when a refund or chargeback fires. Dodo will webhook it; the handler has no case. **Assumed:** treat as immediate cancellation.

**S18: FR-L3's "any surface exposing compiled theme code" refers to nothing.** Appendix G defers the in-app code viewer to post-v1. The clause is dead in v1; an SM will spend time hunting for the surface it gates.

**S15: FR-A5's restore-vs-subscription decision** (see A23) is equally a story blocker — E2 owns deletion cascade and cannot write the restore AC.

### Additional FRs that resist decomposition

**S9: FR-G1/G5 — 487 variants with a human-judgment uniqueness bar, and no story-batching rule.** FR-G5: "A reviewer must be able to name what is structurally different about any two variants." Within-category pairwise comparisons across 34 categories total roughly 3,500. There is no automated test, and E9/E10/E11's exit criteria ("passes render matrix + compile CI") do not test uniqueness at all. Separately, §8 gives no guidance on story granularity: is a variant a story (487 stories), or a category (34)? **Assumed:** one story per category, AC = all N variants pass the matrix. Uniqueness goes untested by construction.

**S10: FR-C7's "variety is an acceptance criterion".** Proposals "must differ in layout structure, not merely palette". No test can assert "differs in layout structure". **Assumed:** the proposals share no variant id in any equivalent slot. Probably the intent; entirely unstated.

**S11: FR-I4's "where the connected Ghost version is verified to accept the community-known internal routes endpoint".** Verified by whom, when, stored where? Runtime probe per deploy, or a build-time capability table keyed by Ghost major.minor? **Assumed:** build-time table. Untestable as written.

**S14: NFR-8's GDPR export has no FR, no epic, and no story.** NFR-8 requires "GDPR export + delete". FR-A5 specifies deletion in detail. **No FR anywhere specifies export** — not its format, scope, delivery, or latency. §8 assigns it to no epic. A compliance obligation with zero requirement substrate.

**S19: FR-B1's thumbnail capture** (see A20) — mechanism undefined, and the choice moves the cost model.

**S22: FR-H2's main-feed designation lifecycle is unassigned.** The auto-designate-on-first-placement, transfer-on-delete, and user-reassign behaviors are editor behaviors; E4 is the runtime, E5 is the shell, and neither names them.

### Is §8's sequencing buildable in order? No — seven breaks

| # | Break | Detail |
|---|---|---|
| **Q1** | **E4 exit needs E7** | E4's exit criterion is "5 pilot sections render editor-perfect **and compile byte-identical**". The compiler is E7 — three epics later. E4 cannot exit as written. |
| **Q2** | **E3 exit needs E7** | E3's exit is "Starter-block path verified". FR-C2 makes **the deploy attempt's error response the authoritative signal** for the Starter block. Deploy is E7. E3 cannot verify its own exit criterion. |
| **Q3** | **E3 needs E4, E6, E11** | E3 includes FR-C7 redesign proposals, which render "2–3 **starter** + **Style Pack** combinations populated with the user's real content" — requiring the section runtime (E4), the packs (E6), and the starters (E11). E3 is epic #3; its dependencies are epics 4, 6, and 11. **The worst break in §8.** |
| **Q4** | **E7 needs E8** | FR-J3 and FR-K5 require referenced assets bundled into the zip at compile. E8 (Asset Library) is after E7, and E8's own exit says "quota **and bundling** verified end-to-end" — so bundling is E8's deliverable inside E7's component. |
| **Q5** | **E7 needs E12** | FR-J12 blocks export for Free accounts with Pro sections; FR-J15's credit toggle is Pro-gated; FR-J7's artifact retention differs by plan (10/3). All require entitlements, which land in E12. E7's exits must be built entitlement-blind and retrofitted. |
| **Q6** | **E13's table is written by E3, E7, E12** | FR-B7's feed carries deploy outcomes (E7), billing events (E12), health changes (E3), and library notices (E7). E13 is last, so four earlier epics write to a table that does not exist yet. |
| **Q7** | **The 5 pilot sections are never enumerated** | E4/E5/E6 all gate on "pilot sections", and the choice determines whether E5's "full editing loop" exercises site-wide singletons (FR-D5), dynamic feeds (FR-H2), and members-aware sections (FR-D16). The SM must invent the set, and a wrong pick lets three epics exit green on a trivially easy subset. |

**Credit:** I verified the wave arithmetic and it holds exactly. E9 = A1–A3 (47) + A17–A23 (109) = **156** ✓. E10 = A4–A16 = **199** ✓. E11 = A24–A34 = **132** ✓. Total 487 ✓. That level of care in §8 makes the sequencing breaks more surprising, not less.

---

## Simulation 3 — QA (untestable requirements, unmeasurable NFRs)

I wrote the test plan against §4's Definition of Done and §6's NFRs, then logged everything I could not turn into a pass/fail.

### The DoD clauses

| Clause | Testable? |
|---|---|
| Every FR implemented | Needs a traceability matrix over 116 FRs. Feasible in principle; ~20 of them have no observable outcome (below). |
| Every variant passes the render matrix | **T11** below — no diff threshold stated. |
| 10 starters deployable to all live targets | Testable, but **T20** below — timing. |
| Marketing site live with full gallery | Testable. |
| Billing verified test-mode → live-mode | Testable. |
| Rollback verified | Testable. |
| **Docs complete** | **T19 — no pass condition.** I defined it as "every page in FR-N4's list exists and is non-empty". The PRD does not. |

### NFRs — measurability audit

**T1 — CRITICAL: NFR-1's p75 targets are unmeasurable by construction.**
NFR-1 sets "editor TTI < 3 s (p75, warm)"; G1 sets "< 10 minutes (p75)" for connect→branded canvas; G2 sets "< 15 minutes (p75)" for blank→first deploy. A p75 requires a distribution over real sessions. §4 mandates that all pre-launch testing runs on production **with no users**, so no distribution exists. And §1.3 states "**No in-app analytics or telemetry requirement exists in v1**", reinforced by NFR-8 — so no distribution will exist post-launch either. §1.3 explicitly hands G8–G10 to manual owner tracking; **G1, G2, and NFR-1 are not on that list.** The PRD sets p75 targets and then forbids the only instrument that could measure them. I cannot write a pass/fail test for any of them.

**T2 — NFR-1's "60 fps" has no measurement method or threshold.** No dropped frames? p95 frame time < 16.7 ms? No long task > 50 ms? **Invented:** Chrome trace over a scripted interaction, ≥ 55 fps sustained.

**T3 — the reference environment is not reproducible in CI.** Credit: NFR-1 *does* define one ("a mid-tier laptop with 4× CPU throttle (Chrome DevTools)") plus a 40-section stress fixture — far better than most PRDs. But CI runs on GitHub/Vercel runners, and "4× throttle on a GitHub runner" is not the same machine as "4× throttle on a mid-tier laptop". The gate is either manual-only or non-deterministic. No CPU/memory spec is given.

**T4 — "warm" is undefined** (warm HTTP cache? warm serverless function? both?).

**T5 — CRITICAL: NFR-2's Lighthouse targets have no specified hosting environment.** Generated themes run on **the user's** Ghost server. A theme scoring 92 on Ghost(Pro)'s CDN (T2) can score 70 on a $6 DigitalOcean droplet (T1/T3) with identical markup — TTFB alone decides it. NFR-2 says "on the fixture content set" and names no host. **The measurement is environment-determined and the environment is unspecified**, so "Performance ≥ 90" has no truth value.

**T6 — NFR-2 and G4 state different measurement scopes for the same target.** G4: "measured on **library defaults and the 12 preset packs**". NFR-2: "on **the fixture content set**". Neither term is defined, and they are not the same thing.

**T7 — "maximal design" (NFR-2's < 30 KB gz JS ceiling) is undefined.** **Invented:** all nine FR-J4 behavior modules bundled. Testable once assumed.

**T8 — CRITICAL, security: NFR-3 specifies the sanitizer as an incomplete denylist.** It requires "script, iframe, and event-handler stripping" — **exactly three categories**. Not named: `<object>`, `<embed>`, `<base>`, `javascript:` and `data:` hrefs, `<svg>` with inline handlers, `<form>` actions, CSS `expression()`, `<meta http-equiv>`. A Dev implementing NFR-3 literally ships an XSS into the same-origin canvas that §7.3 mandates. **A denylist stated as the requirement is a defect in the spec, not just an omission** — and §7.3 explicitly makes this sanitizer the *sole* isolation mechanism, having rejected the iframe boundary. No sanitizer library is named and no XSS test corpus is specified. **Invented:** DOMPurify with an allowlist config + an OWASP payload corpus.

**T9 — NFR-3's CSP has no policy, so "CSP on app and marketing" is trivially satisfiable and untestable.** And it collides with §7.1's browser Handlebars via `new Function` (see A22) — a conflict no requirement acknowledges.

**T10 — NFR-5 has no tool, no threshold, and no method**, and its central clause collides with the architecture. "The app itself meets WCAG 2.1 AA (keyboard-complete editor including reorder via keyboard, focus management in overlays…)". Zero axe violations? Which ruleset? Manual audit against which checklist? Worse: **"keyboard-complete editor" against a canvas whose content lives in an iframe, whose editing chrome is positioned *outside* that iframe (§7.3), and whose inline editing is contenteditable *inside* it** — the focus order between overlay chrome and iframe content is architecturally hostile, and nothing connects NFR-5 to §7.3.

**T11 — NFR-6(a) has no diff threshold, and no baseline-maintenance policy.** 487 × 3 packs × 2 modes × 3 viewports = **8,766 screenshots per run.** "Passes" has no tolerance (pixel %? anti-aliasing? font-rendering variance across runners?). **Invented:** 0.1% pixel diff. Set it too tight and the gate is permanently red; too loose and it catches nothing. No policy for baseline churn when a Style Pack or shared primitive changes — which would invalidate all 8,766 at once.

**T12 — CRITICAL: NFR-6(c), the test that guarantees the product's core differentiator, has an undefined tolerance and a built-in guaranteed divergence.** Golden fidelity is "fixture theme rendered by live Ghost vs. canvas emulator, **DOM-normalized** diff". "DOM-normalized" is defined nowhere. Which normalizations are legal — whitespace, attribute order, the editor-mode data attributes, `{{ghost_head}}` output, Ghost's injected members script, comment nodes? And one divergence is **structural and permanent**: FR-H5 specifies the shim's `{{img_url}}` as "URL pass-through / asset resolution", while live Ghost emits `/content/images/size/w600/…` with a full `srcset`. **Image URLs will always differ.** If the normalizer strips them, the test can never catch a real `img_url` bug — and FR-J5's `srcset`/WebP/lazy-loading requirements sit entirely inside that blind spot. The single test underwriting "100% WYSIWYG" cannot be specified from this PRD.

**T13 — NFR-7 + FR-D9: undo persistence is unfalsifiable on Safari.** FR-D9 promises undo survives reloads and sessions, then hedges: "durability is bounded by the browser — the app requests `navigator.storage.persist()`, but an evicting browser can still clear it". Safari's eviction policy makes the promise contingent. No pass/fail test can be written for a requirement whose failure mode is pre-excused.

**T14 — NFR-8's GDPR export is untestable because it does not exist** (S14). **T15 — NFR-8 permits "privacy-respecting analytics" while §1.3 says no analytics ship in v1** — nothing to test either way.

**T16 — FR-J6's "0 errors, 0 warnings" target may be unachievable and is asserted, not verified.** gscan emits warnings for conditions a theme cannot always avoid. If even one library-wide warning is unavoidable, the exit criteria of E9, E10, and E11 are all unmeetable — discovered at the end of three library epics.

**T17 — CRITICAL: the gate and the enforcer are different programs.** FR-J6 runs gscan **server-side inside Inflozo** (one pinned version). Each target Ghost validates the upload with **its own bundled gscan**, and T1 (6.x), T3 (5.x), and T2 (Ghost(Pro), whatever it runs) carry three different versions. **A theme passing Inflozo's gate can be rejected by the target's gate on upload** — the exact "friendly explanation" failure FR-J8 tries to prevent, and the direct opposite of the FR-J6 promise. No requirement addresses version alignment; §7.6's verify-at-build-time list omits it.

**T18 — T4 is only half testable, on the only path it exists to test.** T4 (Ghost(Pro) Starter) exists solely to verify the Preview-only path. FR-C2 says the flag "clears on the **first successful deploy** or when the user updates the site's plan via Manage keys". On T4 a successful deploy can *never* happen — that is the point of T4 — so **the clear-on-deploy branch of the state machine is untestable on the only target that exercises the feature.** Testing it requires a fifth configuration (upgrade T4 to Publisher), which §4 does not provide and Appendix F does not budget.

**T20 — the DoD's deploy matrix collides with the product's own rate limit.** DoD requires 10 starters deployed end-to-end to T1–T3 = 30 deploys, and §4 requires them serialized per target because activation is globally stateful. **FR-J11 caps deploys at 10/hour per site.** A full DoD run therefore takes ≥ 3 hours at the theoretical floor, before compile time, and every re-run costs the same. Nothing plans for this, and Ghost(Pro)'s own upload limits on T2 are unknown.

**T22–T24 — remaining no-pass-condition requirements.** FR-J13's "best-effort basis" for third-party themes has no pass condition. FR-D14's "lockups and state corruption are not [acceptable]" leaves "lockup" undefined (**invented:** no main-thread block > 5 s). FR-N2 specifies the gallery's previews in a "**sandboxed** iframe" while §7.3/NFR-3 mandate a **same-origin** canvas iframe for the same runtime — two security models for one component, with no test for either, and `sandbox` interacts with the `new Function` problem in A22.

**T21 — FR-G5's uniqueness bar** is a human-judgment AC at ~3,500-comparison scale with no reviewer, no rubric, and no gate (S9).

### Deploy targets T1–T4 as described

- **T1 (self-hosted 6.x):** testable. Needs API keys in CI secrets — unstated but obvious.
- **T2 (Ghost(Pro) Publisher):** testable for deploy. **But FR-J13's snapshot depends on an undocumented theme-*download* endpoint that a managed host is the most likely of the four to block** — and FR-J13 makes verification an acceptance criterion, so T2's DoD status is genuinely unknown until built. Honest of the PRD; still means the DoD cannot be planned.
- **T3 (self-hosted 5.x):** testable, and it is the target that exposes T17's gscan skew.
- **T4 (Ghost(Pro) Starter):** **not fully testable as described** — see T18.
- **§4 over-claims its own gates.** It says the automated gates "run on CI runners **against** these live Ghost targets". Only NFR-6(c) golden fidelity and NFR-6(d) E2E actually touch a live Ghost; the render matrix touches none, and compile CI needs only gscan. Minor, but it inflates the perceived infrastructure dependency.

### Requirements with no observable outcome at all

G6's "editor feel", §1.2's "most beautiful UI/UX in the Ghost ecosystem", P6's "delight in small doses", FR-D4's "Koenig/Medium-style" toolbar, FR-J6's "human-readable", FR-C7's "variety", FR-G5's uniqueness, FR-J13's "best-effort". **Credit where due:** P1 ("with nothing selected the canvas shows no outlines, handles, grids, or badges") *is* testable by screenshot; FR-E2's "≤ 300 ms crossfade" is a real number; Appendix H's canonical strings are string-equality assertions; NFR-4 and NFR-9 are clean checklist NFRs. The PRD is capable of writing testable requirements — it just does not do it consistently in §6.

---

## Findings by severity (each naming the blocked task)

### CRITICAL — an autonomous agent stops, guesses, or ships a defect

| # | Finding | Blocked task |
|---|---|---|
| **C1** | **The content-baking mechanism is undefined and, once derived, forces a Handlebars partial evaluator with an AST→source printer.** Options (i) and (ii) are impossible on Ghost; (iii) is forced. Handlebars ships no printer. Unscoped, unmentioned, on the critical path. | Architect: compile pipeline (A4). Blocks E4's exit criterion and all of E7.S1. |
| **C2** | **§8 sequencing is circular in five places.** E4 exit needs E7; E3 exit needs E7; E3's FR-C7 needs E4+E6+E11; E7 needs E8; E7 needs E12. | SM: building epics in the stated order — stalls at E3 (Q1–Q5). |
| **C3** | **§7.5 omits the table that carries FR-J10's frozen theme name, and FR-J7's retention pruning destroys the only derivation** — silently unfreezing names, orphaning themes in Ghost Admin, and splitting rollback history. The PRD's data model contradicts the PRD's guarantee. | Architect: schema design (A12). SM: E1.S2. |
| **C4** | **FR-J13's snapshot table has an ambiguous RLS key.** "Keyed by site URL" read literally violates NFR-3 and allows one user to reach another user's archived theme when both connect the same Ghost site. | Architect: schema + security review (A9). |
| **C5** | **NFR-3 specifies the canvas sanitizer as a three-item denylist**, while §7.3 makes that sanitizer the *sole* isolation mechanism (having rejected the iframe boundary on a false premise). Implementing NFR-3 literally ships an XSS. | QA: writing the sanitization test plan (T8). Architect: §7.3 (over-spec #1). |
| **C6** | **NFR-1 / G1 / G2 set p75 targets in a product that forbids telemetry** (§1.3, NFR-8), on a reference environment not reproducible in CI. The product's headline goals have no pass/fail test, pre- or post-launch. | QA: NFR-1 test plan (T1, T3). |
| **C7** | **NFR-6(c) golden fidelity — the test underwriting "100% WYSIWYG" — has undefined normalization and a permanent, structural divergence** (`{{img_url}}` pass-through vs Ghost's real image URLs), which also blinds it to every FR-J5 `srcset`/WebP/lazy-load requirement. | QA: golden-fidelity harness (T12). Also E4's harness deliverable. |
| **C8** | **Inflozo's gscan and each target Ghost's bundled gscan are different programs at different versions.** A theme passing the FR-J6 gate can be rejected on upload by T1/T2/T3. Not addressed anywhere; not on §7.6's verify list. | QA: deploy test plan across T1–T3 (T17). Architect: A8. |
| **C9** | **FR-B1–B6 (the entire Projects & Dashboard surface) belong to no epic**, and **FR-P (transactional email) belongs to no epic**, and **NFR-8's GDPR export has no FR at all.** | SM: §8 coverage sweep (S1, S2, S14). |
| **C10** | **FR-C5's Compatibility Watch — a Pro-differentiating feature — has zero substrate.** No per-variant Ghost-dependency declaration in FR-G3's registry format, no release impact feed, no authoring process. I could not design it. | Architect: A27. SM: undecomposable. |

### HIGH — a story or design is blocked pending one decision

| # | Finding | Blocked task |
|---|---|---|
| H1 | FR-I2's filter builder has **no field→NQL mapping** for its eight fields; relative dates are not expressible in NQL at all. Wrong mappings silently serve wrong posts on live sites. | SM: E7.S7 (S5). |
| H2 | FR-Q6's "standard string catalog" **does not exist** — no keys, no defaults — yet compile validation must enforce exclusive use of it across all 487 variants. | SM: E7.S9 (S3); constrains E9–E11. |
| H3 | FR-J6's "human-readable mapping" of ~100 gscan rules **does not exist**. | SM: E7.S3 (S4). |
| H4 | FR-J14's **"nearest current variant" is undefined**, and its change-summary needs a machine-readable library changelog format that does not exist, plus a `library_version` column `deploys` lacks. | SM: E7.S11 (S6, S7); Architect A25/A26. |
| H5 | **The ~30 font pairings are never enumerated** (12 of them appear in Appendix D), and subsetting strategy, weights, and variable-vs-static are unstated — with FR-Q6's "any language" promise directly conflicting with latin-only subsets. | Architect: A2/A3. SM: E6 font-pool story. |
| H6 | **FR-A5's restore-vs-Dodo-cancellation is undecided.** The unstated alternative bills a deleted user for 14 days. | SM: E2 deletion story (S15, A23). |
| H7 | **Plan switching (monthly↔yearly) and refunds/disputes map to no FR-L2 transition.** | SM: E12 (S16, S17). |
| H8 | **FR-B1's thumbnail capture path is unstated**, and the server-side reading requires headless Chromium — which invalidates Appendix F's cost model and G7's break-even claim. | Architect: A20. |
| H9 | **NFR-3's CSP has no policy and collides with browser Handlebars' `new Function`**; resolving it requires precompiling all 487 variants per library release — a real pipeline component. | Architect: A22. QA: T9. |
| H10 | **E1.S3 has no acceptance criterion.** The referenced design artifacts are mockups self-labeled "Calibration reference — not a spec", with no token list or component inventory for app chrome. | SM: E1.S3 (S20). |
| H11 | **NFR-6(a) has no diff threshold and no baseline-churn policy** across 8,766 screenshots. | QA: T11. |
| H12 | **NFR-2's Lighthouse targets are environment-determined with no environment specified**, and NFR-2 and G4 name two different measurement scopes. | QA: T5, T6. |
| H13 | **NFR-5 has no tool, threshold, or method**, and "keyboard-complete editor" is architecturally hostile to §7.3's outside-the-iframe chrome + inside-the-iframe contenteditable. Nothing connects the two. | QA: T10. |
| H14 | **T4's Preview-only clear-path is untestable** on the only target that exercises it; a fifth configuration is needed and neither §4 nor Appendix F provides one. | QA: T18. |
| H15 | **`{{#get}}` is async, Handlebars is synchronous**, and resolving it silently constrains what the section library may express — a constraint E9–E11 have not been told about. | Architect: A17. |

### MEDIUM — an architect can decide, but should be told they are deciding

`{{#get}}`-instance partial granularity (A5) · control→CSS mechanism, derivable but unstated and load-bearing for all 487 variants (A6) · section CSS authoring format vs the app's likely Tailwind (A7) · compile job model and cancel semantics (A1) · four missing tables: notifications + retention cron, edit locks, routes state, entitlements-as-table-or-view (A13–A16) · asset-usage tracking and its up-to-3-minute staleness window that makes FR-K4's delete warning wrong (A11) · rich-text storage format and the two-editors-one-value problem (A18/A19) · deploy concurrency lock per site (A21) · snapshot collision on FR-C8 URL edit (A10) · export log for FR-Q2 (A28) · `admin` claim provisioning (A24) · the five pilot sections are never enumerated though three epics gate on them (Q7) · notifications table written by four epics before it exists (Q6) · FR-H2's main-feed lifecycle unassigned (S22) · FR-L3's "surface exposing compiled theme code" gates a feature Appendix G defers (S18) · E1's "dashboard skeleton" cut line (S21) · FR-D18's "X unsaved edits" counts *ops*, not user-perceived edits (a shuffle is several ops) · FR-J11's 10/hr limit vs the DoD's 30-deploy matrix, ≥3 h serialized (T20) · FR-N2's "sandboxed iframe" vs §7.3's same-origin, for the same runtime (T24) · FR-D14's "lockup" threshold undefined (T23) · §4 over-claims that all automated gates run against live Ghost (only two of four do).

### Over-specification — the PRD taking the architect's call

1. **§7.3's same-origin mandate** rests on the factually incorrect claim that rect measurement and contenteditable *require* same-origin. It forecloses the safer design and then under-specifies the sanitizer it substituted (C5). **The most consequential over-specification in the document.**
2. **§7.5** — prescriptive on eight tables, missing at least eight. Constrains without enabling.
3. **Implementation constants as spec:** FR-D10's 3-minute interval; AD1's IndexedDB op-log design; AD2's 15 s / 30 s / 60 s; FR-K2's q≈82 and 2400 px; FR-J3's content-hashing; FR-J10's naming scheme; §7.1's "not Edge".
4. **FR-K2 mandates a WebP encoder for a Safari limitation that no longer applies** at NFR-7's own 16.4+ floor — ~300 KB of dead wasm if followed literally.
5. **FR-E4** dictates exact CSS emission structure. Defensible (it underwrites the JS-disabled dark-mode promise) but still architecture written as requirement.

### What is genuinely build-ready — do not touch it

`sections-inventory.md` § **Synthesis Defaults** (compilable as written, with stated invariants and rationale for every non-obvious choice) · **FR-L2** (complete transition table, idempotency, signature verification, the webhook-lag carve-out) · **FR-L3** (every over-limit resource resolved, including the rollback/restore carve-out) · **FR-J10**'s per-site name freeze *as a policy* (the storage for it is C3) · **Appendix I**'s glossary · **§8's wave arithmetic** (verified exact) · **NFR-4** and **NFR-9** (clean, checkable) · **Appendix H**'s canonical strings (string-equality testable) · **AD3**'s rejected-alternatives log — the single best pattern in the document, and the model the rest of §7 should follow.
