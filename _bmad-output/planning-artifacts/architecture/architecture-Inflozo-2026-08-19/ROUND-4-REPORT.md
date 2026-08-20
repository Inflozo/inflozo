---
title: Inflozo Architecture Stress Test — Round 4 Report · security, performance, on real infrastructure
type: stress-test report
status: complete — all four passes ran
created: 2026-08-20
evidence: MEASUREMENTS.md §21a–§21r (executed this round), §14–§20 (Round 3)
---

# Round 4 — what an attacker can do, whether it is secure enough, whether it is fast enough

**All four passes ran.** Pass 1 attacked the live estate (two real Ghosts, real Supabase, real
Vercel, real Dodo) — 17 sections of new executed evidence in `MEASUREMENTS.md` §21. Pass 2 ran the
three lenses (adversarial, edge-case, verification-gap) over the spine, `SCHEMA.sql` and
`MEASUREMENTS.md`; every checkable claim it produced was then **executed** rather than reported as
reasoned. Pass 3 put the Ghost-specific attacks to the Ghost Build Room. Pass 4 ran red team and
pre-mortem.

Nothing in this report is reasoned where it could have been run. **17 findings, 15 CONFIRMED by
execution, 2 SUSPECTED and marked as such.**

---

## 1. Regression table — what was re-tested, and whether it still holds

Every previously-closed item re-run this round. **All hold. Nothing MOVED.**

| Previously closed | Round 4 re-test | |
|---|---|---|
| `lock_generation` monotonic trigger (R1 d13) | rewind → 403 `42501` | holds |
| `edit_locks.user_id` frozen (R1 d13) | re-parent → 403 | holds |
| `assets.stored_bytes` not UPDATE-able (R1 d13) | PATCH → 403 | holds |
| AD-7 tables denied to `authenticated` (R2-1) | 403 `42501` both tables | holds |
| Cross-tenant project read scoped (AD-6) | rows=0, `Content-Range: */0` | holds |
| `count(*)` oracle scoped by RLS | `*/0` | holds |
| `suggestions_public` hides another user's unapproved image (R1 d3) | `image_path` null | holds |
| Base `suggestions.image_path` unreadable by client (§10 gate) | 403 | holds |
| A cannot edit or delete B's suggestion (R1 d3 corrected) | 403 | holds |
| F8 — raw SVG still lands byte-identical (§16c) | `<script>` + `@import` present | holds *(the hole holds too)* |
| Server-only buckets + folder scoping deny (§16c) | 3× RLS denial | holds |
| `storage` not PostgREST-exposed (D6 control) | 404 | holds |
| gscan 0/0 on real upload, both majors (AD-34) | 0 err / 0 warn each | holds |
| AD-5 numeric entities, incl. `{{#if}}` in user text | no live mustache emitted | holds |
| AD-4 splice — user quote in an attribute | `&quot;`, no breakout | holds |
| Zero `{{{` in emitted output (AD-5) | none | holds |
| `{{comments}}` emits the jsdelivr script (§15c) | present on both majors | holds |
| Integration token refused `GET /themes/` (§15h) | 501 / 403 | holds |
| Supabase secret key refused from a browser UA (§20) | 401 | holds |

---

## 2. Findings, ranked by severity

### CRITICAL

**F11 — Twelve AD-8 tables are unreachable by the server. §19d fixed the instance, not the class.**
*(CONFIRMED · build-stopper · §21o)*
Round 3 found `billing_events`/`site_credentials` held only `REFERENCES, TRIGGER, TRUNCATE` for
`service_role` and granted those two. Every other AD-8 table still has the identical signature:
`deploys`, `deploy_jobs`, `entitlements`, `subscriptions`, `exports`, `project_site_bindings`,
`deployed_template_names`, `asset_usages`, `checkout_consents`, `notifications`,
`template_binding_checklist`, `profiles`. AD-8 says these are "written by server routes under the
service role"; none of them can be. E7's first deploy and E12's first entitlement write both fail
with `42501`.
**Blast radius:** the owner's build — it stops E7 and E12 dead. Not a security hole.
**AD:** AD-8, AD-7. **Change:** one `RLS-TEST.sql` assertion that every AD-8 table holds
`SELECT`+`INSERT` for `service_role` — not thirteen more grant lines.

**F0 — The RLS harness is advisory, not a gate.** *(CONFIRMED · §21n)*
`RLS-TEST.sql` is E1's exit criterion and, under AD-26, the gate every future migration relies on.
It contains **2** `raise exception` and **36** `raise notice 'FAIL:`. `ON_ERROR_STOP` aborts on SQL
ERROR; a NOTICE is not one, and the structural sentinels are plain `select`s that return rows without
raising. Executed with the file's own shapes: **psql exits 0.**
**Blast radius:** every other finding — this is why they survived three rounds of a green harness.
**AD:** AD-26, E1's exit criterion. **Change:** `notice` → `exception`, and wrap each sentinel in a
`do` block that raises. One commit.

### HIGH

**F1 — Anyone can self-approve an image onto the public board, and forge votes and roadmap status.**
*(CONFIRMED · §21a, §21q F15)*
`authenticated` holds **whole-row INSERT and whole-row UPDATE** on `suggestions`, including
`image_approved`, `vote_count`, `status`, `hidden`, `merged_into`. The policy checks only
`user_id = auth.uid()`. Executed: `POST` with `image_approved:true, vote_count:99999,
status:'shipped'` → HTTP 201, and an anonymous read of `suggestions_public` returns all three.
Chains with F8/§16c (raw `<script>` SVG lands byte-identical) → an unsanitized image reaches every
board visitor with no admin in the loop.
**Blast radius:** all tenants + anonymous visitors to the board.
**AD:** AD-8, FR-M3, decision D4. **Change:** column-narrow the INSERT and UPDATE grants the same way
§11 narrows UPDATE elsewhere, and build D4's server-side sanitize on approval.

**F2 — The owner policy authorizes the child row, never the parent.** *(CONFIRMED · systemic · §21b)*
AD-6's uniform policy is `user_id = (select auth.uid())` with no parent-ownership term. Tenant A, with
tenant B's project id: `POST /project_templates {project_id: <B's>, user_id: <A>}` → **HTTP 201**; a
random project id → 409 `23503`. So a client can attach child rows to another tenant's project *and*
use the FK error as a cross-tenant existence oracle. A `service_role` route reading a project's
children by `project_id` (bypassrls) ingests the foreign row.
**Blast radius:** cross-tenant, bounded by UUID unguessability.
**AD:** AD-6. **Change:** add a parent-ownership term to the uniform policy for every child table, or
a shared `owns_project(project_id)` predicate.

**F7 — A user-supplied URL reaches `href` with no scheme validation, in both renderers.**
*(CONFIRMED · §21k)*
`content.link = 'javascript:alert(document.domain)'` → `<a href="javascript:alert(document.domain)">`
in the emitted theme. The Conventions row promises scheme validation, but only for **Ghost-sourced**
values, and it lives in `ghost-shim`. User-typed links (AD-4's `marks[].href`, any `data-prop-attr`
URL) go through `applyProps`, which HTML-escapes and never checks the scheme. Escaping is the wrong
control: `javascript:` has no escapable character. **Both renderers call `marks.ts`** — so on the
theme side this is a visitor's problem, and on the canvas side it is a same-origin `javascript:` URL
inside the owner's authenticated session (Pass 3's finding).
**Blast radius:** the customers' visitors, and the editing user's own session.
**AD:** AD-4, Conventions/NFR-3 carve-outs. **Change:** one scheme allowlist
(`http`/`https`/`mailto`/relative) in the shared core, applied to user values as well as Ghost values.

**F8b — Helper arguments are unescaped string interpolation.** *(CONFIRMED · actor C · §21k)*
`bindExpr` builds Handlebars source by template literal: `` `{{img_url ${path} size="${arg}"}}` ``.
A design file with `data-bind-attr='src:featureImage|img_url:800"}}<script>alert(1)</script>{{"'`
emits a live `<script>` into the theme. AD-5 closes the *user-text* half of this class; nothing closes
the *author* half. Pass 3's reframing matters: the malicious author is rare, but `size:800px` instead
of `size:800` is a Thursday, and it has the same root cause — interpolating instead of parsing.
**Blast radius:** every customer site deploying that design; the customers' visitors.
**AD:** AD-2, AD-5, decision D13. **Change:** parse the binding vocabulary and build mustaches from
validated tokens — helper names and arg types from a fixed grammar.

**F12 — AD-9 is 3/4 implemented; `custom_settings` has no freeze trigger.** *(CONFIRMED · §21p)*
AD-9 names four frozen columns and explains why `frozen_at` must be frozen alongside `key`. Executed
as the table owner: `key` renamed and `frozen_at` nulled, while `profiles.is_admin` correctly refused
(42501). The column GRANT still stops a *client*, so this is not remotely exploitable — what it breaks
is FR-Q2's guarantee against a **server bug**, which erases a site owner's stored `@custom` value on
their live Ghost, silently.
**Blast radius:** one tenant's live site settings. **AD:** AD-9, AD-31. **Change:** create the trigger.

**F13 — Nothing creates a `profiles` row.** *(CONFIRMED · §21q)*
`auth_user_entitlement` is the only non-internal trigger on `auth.users`. Live: **6 users, 6
entitlements, 2 profiles**. `is_admin`, `autosave_enabled` and `free_editable_project_id` read NULL for
the other four — and AD-15 makes `autosave_enabled` load-bearing for data loss. §16a read
"profiles = 2" as confirming the design; those two rows were seeded by `RLS-TEST.sql`, not by signup.
**Blast radius:** every user. **AD:** AD-28's signup provisioning. **Change:** the sibling trigger.

### MEDIUM

**F3 — Whole-row INSERT grants defeat the narrowed UPDATE grants.** *(CONFIRMED · systemic · §21c)*
`§11` narrows UPDATE column-by-column; INSERT stays whole-row everywhere. `assets.stored_bytes` is
settable at INSERT (HTTP 201 with `bytes:9999999, stored_bytes:1`) while UPDATE correctly 403s. This
is the class F1 belongs to, and it is also FR-K3's quota lever (§21l): the meter can read 1 byte per
asset while the objects land for real, so the Free 100 MB / Pro 5 GB caps bound nothing.
**Blast radius:** the owner's storage bill; the board (F1). **AD:** AD-8, AD-31.
**Change:** column-narrow INSERT grants, or a BEFORE INSERT trigger resetting server-asserted columns.

**F4 — The edit lock's holder can be reseated without advancing `lock_generation`.**
*(CONFIRMED · §21d · named open in R3 §2.4, still open)*
`PATCH {holder_session_id:'device-2'}` → 200 with generation unchanged at 5. AD-15 detects takeover
from the generation advancing, so this is a split-brain the displaced device never notices. The
monotonic trigger and identity freeze both HELD.
**Blast radius:** one tenant's editing session; lost work. **AD:** AD-15, R1 d32 (deferred).
**Change:** the protocol state diagram R1 d32 defers, before E5 builds it.

**F5 — Decision B's `accent_color` is a CSS-injection channel.** *(CONFIRMED · both Ghosts · §21e)*
Ghost's validation is a loose character filter, not a CSS validator. Accepted verbatim on 5.130.6 and
6.58.0: `red;}body{display:none`, `#fff;background:url(x)`, `#fff;width:100vw`, `#f00;/* c */color:red`,
`javascript:alert(1)`. Rejected: the `url(https://…)` form and a `position:fixed` overlay — i.e. a
regex that got lucky twice. Handlebars escaping means script is unreachable, so this is defacement and
tracking, not XSS. Decision B itself is sound; the wrong part is the assumption that the bound value
is a colour. **Note where the check cannot live:** the FR-J17 gate sees
`style="--tag-accent: {{accent_color}}"` and correctly passes it — the value arrives at runtime, after
every gate has run.
**Blast radius:** the customers' visitors. **AD:** AD-3 decision B.
**Change:** strictly parse `accent_color` (hex/rgb/hsl) in `ghost-shim`; fall back to the pack default.

**F6 — AD-7's tables are on the PostgREST data API.** *(CONFIRMED · §21f, bounded by §21j)*
`authenticated` is correctly denied (403 both tables). The **secret key** reads `site_credentials`
over `/rest/v1/` directly — no server route involved — contradicting AD-7's "reachable only by the
service role **inside a server route**". **Bounded by the Vault probe (§21j, new this round):**
`vault.secrets` and `vault.decrypted_secrets` are granted to `service_role` only and are **not**
PostgREST-exposed (404). So a leaked secret key yields Vault *references*, billing payloads and full
`public` read — not the Ghost admin secrets themselves. Real, but not immediate site takeover.
**Blast radius:** all tenants' metadata and billing records. **AD:** AD-7.
**Change:** move `site_credentials`/`billing_events` to a schema outside `PGRST_DB_SCHEMAS`.

**F9 — A design may bind any attribute, including an event handler.** *(CONFIRMED · §21k)*
`data-bind-attr="onload:featureImage"` → `<div onload="{{featureImage}}">`. AD-34's gate asserts "no
inline event handlers" over emitted files, so a single check on the far side of the pipeline is the
only control, with nothing at authoring time (D13's lint is unbuilt).
**Blast radius:** every site deploying the design. **AD:** AD-2, AD-34.
**Change:** an attribute-name allowlist in the binding grammar (same fix as F8b).

**F10 — The Ghost Admin key is all-or-nothing, and the spine never says so.** *(CONFIRMED · §21m)*
Executed on both majors with the key Inflozo stores: `GET /admin/members/` returns subscriber
**emails**, `/admin/users/` returns staff, `/admin/settings/` returns the whole config, and
`POST /admin/posts/` **creates content** — all far outside P8's four writes. Ghost has no scoped
integration; the JWT carries no scope claim. P8's allowlist is a real invariant about Inflozo's own
behaviour and **not a boundary on the credential**. AD-10 reads as though it were.
**Blast radius:** every connected customer's site and subscriber list.
**AD:** AD-10, P8. **Change:** state the blast radius in AD-10; add the audit log and key rotation
(`admin_key_rotated_at` exists and nothing writes it); say it plainly on the connect screen.

**F14 — `site_snapshots` is fully client-writable.** *(CONFIRMED · §21q)*
`authenticated` holds `SELECT, INSERT, UPDATE, DELETE` on the table, while AD-32 makes the
`site-snapshots` *bucket* server-only with no policy because "a snapshot a client could write defeats
FR-J13 entirely". The bucket is governed; the table pointing into it is not.
**Blast radius:** one tenant's irreplaceable pre-Inflozo backup. **AD:** AD-8, AD-32.
**Change:** move `site_snapshots` to the select-only list.

**P1 — 21 of 29 RLS tables have no `user_id` index.** *(CONFIRMED · scaling · §21g)*
RLS rewrites every tenant query to `where user_id = uid`. Only `assets, entitlements, notifications,
passkey_labels, profiles, projects, sites, subscriptions` are indexed on it. Measured on 200k rows:
**320.9 ms** unindexed vs **11.2 ms** indexed.
**Blast radius:** availability as tenant count grows. **AD:** AD-6, AD-26.
**Change:** index `user_id` on every RLS table; assert it in `RLS-TEST.sql` so AD-26 gates it in.

### LOW

**F16 — `sync_vote_count` fires on INSERT and DELETE only** (§21q). A client that UPDATEs its own
`suggestion_votes.suggestion_id` desyncs the denormalized count the public board reads.

### SUSPECTED — reasoned, not executed

**S1 — The `<style>` block is a wider CSS-injection context than F5.** `default.hbs` emits
`--accent: {{@custom.accent_colour}}` inside a `<style>` element and an unquoted
`url({{@custom.dark_logo}})`. Unlike an inline `style` attribute, that context permits **selectors**,
so the payload class is strictly larger than F5's. **Not executed:** Ghost refuses custom-setting
writes to an integration token (`403 API tokens do not have permission to access this endpoint` — the
control write with a valid `#1f6feb` hex 403s identically), so this needs a session cookie or a
staff-token path to test. Ghost validates `color`-typed settings, which likely blocks it — but F5
proved Ghost's colour validation is a loose filter, so "likely" is the whole question.
**Change:** parse `@custom` colours in `ghost-shim` and quote emitted `url()` values; execute this in
E0(b) with a staff session.

**S2 — Export bypasses the deploy rate limit.** FR-J11's 10/hour is derived from `deploys.created_at`
scoped by site; FR-J12 export runs the same compile pipeline and writes `exports` with
`site_id` null. So the compile budget appears unmetered on the export path. **Not executed** — no
route exists yet. Worth one line in E7's story rather than a decision now; §21l shows the compute
lever is small ($77/month at full abuse).

---

## 3. The three questions

### What can an attacker do?

**Today, against the schema as it stands:** put an unsanitized image on the public board seen by every
visitor including the founder (F1 + §16c); forge vote counts and roadmap status; attach rows to
another tenant's project and probe which project ids exist (F2); make the storage quota meter read
whatever they like (F3); seize an edit lock invisibly (F4). With a leaked secret key: read every
tenant's Vault references, billing payloads and all of `public` — but **not** decrypt the Ghost
credentials (§21j bounds this).

**What they cannot do, and it is worth saying:** reach another tenant's rows through RLS, read another
tenant's storage folder, write the server-only buckets, escape AD-5's brace escaping, break out of an
attribute with a quote, list or flip a storage bucket's `public` flag, or read `site_credentials` as an
ordinary signed-in user. **Twelve of nineteen re-tested controls were attacked directly and held.**

**The chain that matters** is F1 → unsanitized SVG → same-origin board page → session token, and its
last step depends on a script-execution sink plus a CSP whose canvas half §18c admits is unverified.

### Is it secure enough?

**Not yet — but the gap is smaller than the finding count suggests, and it is not where you would
expect.** The tenant isolation core is genuinely sound: one policy shape, executed, and it held under
direct attack. What is missing is not more controls; it is **three absences that no single finding
reveals**:

1. **No verification that fails.** A proof that exits 0 on 36 of 38 failures is a report, not a gate
   (F0). This is why six structural holes survived three rounds of "verified by execution."
2. **No detection, anywhere.** No audit log on the Admin proxy, no log on Vault decryption, no alert on
   anomalous `site_credentials` reads. The pre-mortem's answer to *"how long before anyone noticed?"*
   is **until a customer asked why their subscribers were getting spam.** Every other item on the fix
   list prevents; only this one detects.
3. **No security invariant among the 35.** AD-5 is "untrusted value into an interpreting sink" applied
   to braces; AD-4 is it applied to marks; F5, F7, F8b and F9 are all four the same idea, unnamed. The
   room's verdict: *not four bugs — one missing idea, four times.*

**Would I put other people's website credentials behind this architecture today? No — and the reason
is F10 plus absence 2, not any of the RLS findings.** One Ghost Admin key is the customer's entire
subscriber list and the ability to publish on their domain; nothing logs its use, nothing rotates it,
and the spine never states that blast radius. **What would make the answer yes,** in order: make the
harness fail (one commit); write the audit log on the Admin proxy and Vault decrypt; column-narrow the
INSERT/UPDATE grants; add the scheme allowlist and the binding grammar; state AD-10's blast radius and
put it on the connect screen; then AD-36 to name the class. None of that is architectural surgery —
the architecture is sound. It is a fortnight of work that has never been scheduled because the harness
kept saying PASS.

### Is it fast enough?

**Yes, with one scaling caveat, and every number below is measured on real infrastructure.**

| Promise | Measured | Verdict |
|---|---|---|
| NFR-2 ≤ 40 KB CSS | `screen.css` **1.36 KB brotli** (42 KB raw, 2.2 KB gzip) | passes with enormous margin — but the fixture's CSS is synthetic and compresses unusually well |
| G1 deploy half | compile 3.9 s + upload **7.3 s** + activate **1.5 s** ≈ **13 s** end to end, gscan 0/0 on upload both majors | inside ten minutes by three orders of magnitude |
| AD-11 compile budget | 486 MB peak; at 4 GB, 8 co-located compiles fit; worst-case abuse reaches **0.88 concurrent** | decision A's 4 GB is comfortable; no concurrency cap needed |
| AD-6's `(select auth.uid())` hoist | **verified and it matters**: seq scan 23.4 ms wrapped vs **320.9 ms** bare (14×); indexed, both ~11 ms | the claim is true |
| Visitor page | homepage ~59 KB, post ~19 KB; the `{{comments}}` jsdelivr script present | Ghost's own scripts dominate, not Inflozo's theme |
| Cost at full abuse | $0.000427/deploy; **$77/month** for a Pro account deploying flat-out | bounded; FR-J11 is adequate |

**The caveat is P1**, and it is the one number that gets worse with success: 21 of 29 RLS tables have
no `user_id` index, so tenant-scoped lists degrade linearly with *total* rows rather than the tenant's.
AD-6's wrapper removes the per-row function call; it does not remove the scan.

**NFR-6(a)'s render matrix** — 484 × 3 packs × 2 modes × 3 viewports = **8,712 renders** — has nothing
built and cannot be estimated honestly from anything measured here. That is a real gap in the
performance story and it belongs to E4/E15.

---

## 4. What to change — one mechanism per class

Ordered by what actually changes the outcome, not by severity.

1. **Make `RLS-TEST.sql` fail** — `notice` → `exception`, sentinels wrapped in raising `do` blocks. *(F0)*
2. **Assert grant shape as a class, not per table** — every AD-8 table holds `SELECT`+`INSERT` for
   `service_role`; no client role holds whole-row INSERT on a table with server-asserted columns;
   every RLS table has a `user_id` index. *(F11, F3, F1, P1)*
3. **Audit log on the credential paths** — every Admin API write with its allowlist item, every Vault
   decryption with route and `site_id`, every entitlement and `is_admin` change. **The only item that
   buys detection.** *(F10, absence 2)*
4. **AD-36 — untrusted value into an interpreting sink.** A scheme allowlist in the shared core, a
   parsed binding grammar with an attribute allowlist and typed helper args, strict colour parsing in
   `ghost-shim`. One invariant, four findings. *(F5, F7, F8b, F9, S1)*
5. **Parent-ownership in the uniform policy.** *(F2)*
6. **The small ones:** `custom_settings` freeze trigger, `profiles` provisioning trigger,
   `site_snapshots` to select-only, `sync_vote_count` on UPDATE. *(F12, F13, F14, F16)*
7. **The edit-lock protocol** — R1 d32's state diagram, before E5 builds it. *(F4)*

---

## 5. Passes run

| Pass | Ran | Output |
|---|---|---|
| 1 — attack the live estate | **yes** | `MEASUREMENTS.md` §21a–§21m, §21o–§21q |
| 2 — `/bmad-review` adversarial, edge-case, verification-gap | **yes** | 3 lenses, 41 raw findings; every checkable claim then executed |
| 3 — `/bmad-party-mode --party ghost-build-room` | **yes** | memlog updated; produced the AD-36 framing and the marks.ts/iframe link |
| 4 — red team + pre-mortem | **yes** | §21r |

**Method note, stated because it is the round's own standing rule.** Pass 2's lenses produced
reasoned findings; 9 of them were then run against the live project or the real compiler and became
CONFIRMED, 2 remain SUSPECTED and are labelled. F11, F12, F13, F14 and F0 were *found* by reasoning
and *established* by execution — which is the division of labour the standing rule intends.
