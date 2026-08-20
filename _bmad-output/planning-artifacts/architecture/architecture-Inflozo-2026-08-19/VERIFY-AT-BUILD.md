---
title: 'Inflozo — §7.6 verify-at-build register, with owners'
type: architecture-companion
status: final
created: '2026-08-19'
---

# Verify-at-build — every item, with an owning epic

§7.6 lists 21 external-world facts and instructs that each be re-confirmed before the epic
that depends on it. Until now none of them had an owner. This closes that.

**Two owners per item, deliberately.** **E0(b)** executes *every* item against a real Ghost
before the epics that rest on them — that is §8's stated scope and §4's binding build order,
and it does not change. The **standing owner** is the epic that carries the consequence: it
re-confirms before it ships, it owns the fallback if the item is refuted, and it re-runs the
check on any version bump. An item with only a spike owner is an item nobody re-checks in
eighteen months.

**Refutation is a scope change, raised before the dependent epic begins** — not a bug found
inside it. AD-23 governs the form: every result lands in `fixtures/` as a dated recording
with the command that produced it.

| # | Item | Executed by | Standing owner | Consequence if refuted |
| --- | --- | --- | --- | --- |
| 1 | ⛔ Ghost(Pro) 2026 plan lineup + the Starter custom-theme restriction | E0(b), then the §4 T4 gate | **E15** (launch gate) · consumed by E3 | Public launch and all Ghost(Pro)-aimed marketing stay blocked. Rides with item 2. |
| 2 | ⛔ The `hostSettings.limits` shape from `GET /admin/config/`, per host | E0(b), then the §4 T4 gate | **E15** (launch gate) · probe built in E3 | FR-C2's probe path stays flagged off and asking the user stays primary. Blocks launch, not an epic. |
| 3 | Theme-upload size limits per host, measured on T1–T3 | E0(b) | **E7** (FR-J3 budget) · E8 (FR-K5) | The theme-size budget moves below the new lowest observed; the pre-deploy budget surface is unchanged. |
| 4 | Supabase passkey API status and `supabase-js` ≥ 2.105.0 behaviour | E0(b) | **E2** (FR-A2/A3) | The passkey feature flag stays off; magic link is already primary, so nothing else moves. |
| 5 | Dodo fee schedule and MoR terms | E0(b) | **E12** (FR-L1/L2) · Appendix F | Appendix F's break-evens are recomputed. The billing adapter is swappable by design. |
| 6 | The full Dodo event catalog, and whether Dodo sends the annual renewal notice as MoR | E0(b) | **E12** (owns email 6 and FR-P2's carve-out) | If Dodo does not send it, email #6 is built in E12 — it is statutory in several target markets. |
| 7 | gscan's current v6 warning set | E0(b), then **before E7 exits and at every category gate** | **E7** (FR-J6) · executed by E9/E10 per gate | A single unavoidable library-wide warning makes every category gate unmeetable. gscan stays pinned at 6.4.2 until a library release re-runs the whole inventory. |
| 8 | Whether Ghost release notes are usable as compatibility data | E0(b) | **E3** (FR-C5) | The per-release broadcast degrades to a manual owner-authored notice; the `ghostCompat` mechanism is unaffected. |
| 9 | Whether the Owner's Staff Access Token lifts `GET /themes/` | E0(b) | **E7** (FR-J10, FR-J13) | FR-J10's uniqueness keeps resting on `project_site_bindings` alone. Already the assumed state, so refutation costs nothing. |
| 10 | Snapshot re-upload acceptance, including a theme that fails Ghost's own gscan | E0(b) | **E7** (FR-J13) | The designed fallback — offer the zip, point at Settings → Design — becomes the primary restore path. |
| 11 | `partials/content-cta.hbs` as the paywall override point, per Ghost version | E0(b) | **E7** (emission) · consumed by E5 (FR-H6 editor) | A24/A32's whole paywall surface loses its compile target. This is the highest-cost refutation in the list after 14(a). |
| 12 | Ghost 6 API pagination — `?limit=all` removed, max 100 per page | E0(b) | **E4** (`{{#get}}` shim) · E5 (Count control) | FR-H2's cap of 100 is already the safe reading; a lower real cap moves the control's ceiling. |
| 13 | The four docs-vs-code conflicts in `research-ghost-binding-contexts.md` — chiefly `@even`/`@odd` parity | E0(b) on a scratch Ghost | **E4** (shim + binding contexts) · **blocks E9** | Parity inverted the wrong way zebra-stripes the entire library backwards. `spike-compiler/` is static analysis and does not close this. |
| 14a | Retitling a page with a template selected — does the template still apply? | E0(b) | **E7** (FR-I1) · E5 (FR-D6) | The load-bearing premise under FR-I1, FR-D6, FR-O1 and the whole A30 re-point. The *previous* version of this premise was found false mid-encode and forced a rebuild of five sections. |
| 14b | `{{#get "tiers"}}` on a site with a hidden tier — the direct research-vs-research conflict | E0(b) | **E4** (shim) · E5 (FR-H6) | Resolved by execution because precedence cannot settle it. FR-H6's explicit `visibility:public` filter is correct on either reading and ships either way. |
| 14c | The Template dropdown's label transform on a multi-word name | E0(b) | **E7** (FR-I3 naming step) | §7.4's live filename-and-label preview shows the wrong label. Cheap to fix, impossible to fix after a user has shipped. |
| 14d | `data-portal="upgrade"` for a logged-in free member | E0(b) | **E4** (Appendix B) · E5 (FR-F6 Link Picker) | The Link Picker's Upgrade action already emits `account/plans`, which is the safe form. |
| 15 | What a theme may style inside `{{comments}}`'s native output | E0(b) | **E4** (FR-H3 comments fixture) · **blocks E10's A28** | A28's ten designs stay scoped to the chrome around the thread. Confirm before E10 opens the category. |
| 16 | Regenerating the style-guide fixture against the pinned Ghost target | E4 | **E4** (FR-H3) · re-run at every target bump · re-confirmed E15 | A renderer-derived fixture turns a changed card into a visible diff instead of silent canvas drift. The diff is reviewed, never accepted. |
| 17 | Re-computing the Baseline floor before each category block, and re-verifying licences at every bump | E4 (tooling) | **E4** (FR-G8) · executed by E9/E10 per block | `web-features` moves under a fixed date pin, so the resolved floor is recomputed and diffed. A bump carries a render-matrix re-run. |
| 18 | `{{total_members}}`'s rounding and `+` suffix; `{{content_api_key}}` rendering in a theme context | E0(b) | **E4** (shim, Appendix B core helpers) | Six designs and the whole zero-custom-setting result rest on them. The shim already renders the string shape, so the canvas shows the failure while designing. |
| 19 | `GS100`'s exact trigger on a fixture, on both specs | **CLOSED BY EXECUTION, 2026-08-19** — see `MEASUREMENTS.md` | **E7** (FR-Q5/FR-J6) — re-prove on any gscan bump | Confirmed: error level; fires when *any* declared key is unreferenced; `{{#if}}` guards and partials both count as references. FR-Q5's design is sufficient. |
| 20 | The NQL build Ghost actually resolves at runtime (`"catalog:"` in Ghost's `package.json`) | E0(b) | **E7** (FR-I2) | Two normative FR-I2 rules rest on it — the relative-date restore and the nested-parenthesis defect. Both were proved against `@tryghost/nql@0.13.x`, not against Ghost's resolved build. |
| 21 | The announcement-bar seed against a running Ghost — all three settings readable, and that clearing the content stops the script | E0(b) | **E3** (FR-C4 connect read) · E5 (the shim) | FR-C4's seed and its one-click clear both rest on it; the shim would draw a bar Ghost is not emitting. |

## ⛔ The one action item with a date on it

Items 1 and 2 are the only two that block **public launch** rather than an epic, and neither can be
executed until somebody obtains a Ghost(Pro) Starter site. That is a purchasing action, not an
engineering one, so it is written here as an action item with a trigger rather than left as a note.

**Action:** open a **Ghost(Pro) Starter trial**, capture what `GET /admin/config/` actually returns,
and verify FR-C2's Preview-only detection against that recording.

**Trigger — do it when E13 closes and E14 opens, not before.** The timing is a real constraint in
both directions:

- **Not earlier.** A Ghost(Pro) trial is time-boxed. Bought during E7 it expires long before the
  launch gate needs it, and it would have to be bought twice.
- **Not later.** **E14 is the first epic that cannot ship without the answer.** FR-N4's *Hosting
  requirements* docs page describes a Starter limitation this document inferred from a payload
  nobody has observed, and §4's gate forbids that page shipping as verified until the capture
  exists. Every marketing claim aimed at Ghost(Pro) users sits behind the same gate. Discovering
  this at E15 means either a launch delay or shipping a docs page that states an unverified fact.

**Owner:** E14 acquires and captures · **E15** verifies the detection against the recording and
holds the launch gate. **Definition of done:** a real Starter `hostSettings.limits` payload checked
into `fixtures/ghost/` with its capture date and command (AD-23), FR-C2's probe verified against it,
and the `ghostpro_preview_probe` feature flag flipped on.

**If the trial cannot be obtained:** that is a scope decision for the owner, not an engineering
workaround — the honest fallback is shipping with the Ghost(Pro) path documented as untested and
withholding all Ghost(Pro)-aimed marketing, which is what §4 already specifies.

---

## Two items this architecture run added to the register

Neither was in §7.6, and both were found by execution rather than reading.

| # | Item | Standing owner | Status |
| --- | --- | --- | --- |
| 22 | `GS051-CUSTOM-FONTS` — a warning on **both** specs, requiring `--gh-font-heading` and `--gh-font-body` in the same file | **E6** (token emission) · **E7** (compile validation) | Confirmed present in gscan 6.4.2. Closed by AD-18. Re-check the rule's regex on any gscan bump. |
| 23 | Handlebars' escape is not composable, and a mustache may not abut a closing brace | **E0(a)** (in scope now) · **E7** (emitter + CI assertion) | Confirmed against `handlebars@4.7.9` — the same version Ghost `main` declares. Closed by AD-5, which supersedes §7.3's stated remedy. |
| 24 | A Vercel environment variable cannot be changed without a redeploy | **E1** (flag store) · **E2**, **E3** (the two flags) | Confirmed against Vercel's docs. FR-A2 asks for exactly the capability an env-var flag cannot give, so flags are rows in `feature_flags`. Closed by the Feature-flags convention. |
| 25 | Next 16 deprecated `middleware.ts` in favour of `proxy.ts`, on the Node.js runtime | **E1** | Confirmed against `nextjs.org/blog/next-16`. NFR-3's per-session CSP is a Node-runtime concern, so this is a correction and not merely a rename. Re-check at every Next major. |
| 26 | The two Baseline floors do not track each other | **E4** (FR-G8 tooling) · executed by E9/E10 per block | `browserslist-config-baseline` honours the `widelyAvailableOnDate` pin; `stylelint-plugin-use-baseline` inlines a frozen data map and offers **no date option**. §7.6 item 17's "recompute and diff the resolved floor" therefore covers the browserslist half only. Closed by AD-34's note; the stylelint half is diffed at every plugin bump. |
| 27 | `size-limit` needs a preset, and its default metric is brotli | **E7** (NFR-2 gate) | Confirmed by installing and running it. `@size-limit/file` is required or the gate measures nothing, and NFR-2's 40 KB number means brotli, not gzip. |
| 28 | The WebAuthn surface landed in `@supabase/auth-js` 2.75.0, not 2.105.0 | **E2** (FR-A2) | Read from the registry across seven versions. The PRD's ≥ 2.105.0 floor is a safe over-pin, not a capability boundary — which does not change §7.6 item 4, since whether the Beta API is *usable* is still unexecuted. |

## Items Round 2 added to the register

Both were found by execution. Item 29 is unresolved and is the only entry here without an answer.

| # | Item | Standing owner | Status |
| --- | --- | --- | --- |
| 29 | **`storage.buckets`' own default RLS and grant state on real Supabase** — AD-32 governs `storage.objects` with three policies and says "no bucket is public", which is a claim about a row in `storage.buckets`. Nothing governs that table. | **E1** (schema) · **E8** (assets), **E3** (snapshots) | **UNRESOLVED.** Supabase's Storage docs describe `storage.objects` only and do not state the `buckets` default either way; `PRELUDE.sql` is a stand-in, not evidence, so its state there proves nothing. **Refutation consequence:** if a client can update `storage.buckets`, flipping `public` on `site-snapshots` exposes every user's pre-Inflozo theme — the one bucket AD-29 calls irreplaceable. Resolve by executing `select` and `update` on `storage.buckets` as `authenticated` against a real Supabase project, before E8 ships direct client uploads. |
| 30 | **Ghost identifies a theme by the uploaded zip's filename, not by `package.json.name`** | **E7** (deploy) | **Confirmed** against Ghost 6.58.0, 2026-08-19: four byte-identical zips uploaded as `probe2.zip`, `inflozo-site.zip`, `inflozo-site-v2.zip` and `MyTheme.zip` produced four separate themes, all with `package.json.name = inflozo-probe`. The filename is also the activate and delete key. Closed by AD-19's theme-identity rule. Re-check on any Ghost major, since it governs whether a deploy replaces or accumulates. |
| 31 | **The gscan version each supported Ghost major BUNDLES** — the gate's Ghost-5 verdict is only as good as this pairing, and `checkVersion: 'v5'` on a newer gscan is not a substitute | **E7** (compile gate) · **E15** (Ghost version sweep) | **Confirmed** 2026-08-20: Ghost 5.130.6 bundles gscan **4.49.7**; Ghost 6.58.0 bundles **6.4.2**. Read from `ghost@sha256:a0506f3f…48bdb5` and `ghost@sha256:c917e2a3…a70a3f2`. Closed by AD-34's pairing rule; `MEASUREMENTS.md` §13 carries the verdict comparison and the spec diff. **Refutation consequence:** if a Ghost minor changes its bundled gscan, the gate's verdict for that major is stale and FR-J6's 0/0 claim is false for it — silently, because Ghost activates a theme despite reported errors. Re-read at every supported Ghost minor, not every major. |
