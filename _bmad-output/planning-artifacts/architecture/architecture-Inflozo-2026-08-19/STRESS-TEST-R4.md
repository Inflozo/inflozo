---
title: Inflozo Architecture Stress Test — Round 4 · SECURITY & PERFORMANCE, ON REAL INFRASTRUCTURE
type: stress-test prompt + round-3 handover
status: ready to run in a fresh session
created: 2026-08-20
supersedes: STRESS-TEST-R3.md (round 3 — all four passes ran; 13 decisions applied; real infra provisioned)
posture: break it, prove it is fast, then harden it
---

# Break Inflozo. Measure it. Then make it hard to break.

Rounds 1, 2 and 3 asked *"is this architecture correct?"* Round 4 asks **three different questions**,
and they are found by three different reflexes:

1. **What can an attacker do?** — compromise it, as an adversary with a goal.
2. **Is this secure enough?** — not "did I find bugs", but: would you put other people's website
   credentials behind it? What is *missing* that no single finding reveals?
3. **Is this fast enough?** — the product's own promises are numeric (NFR-1, NFR-2, G1) and almost
   none of them has ever been measured on real hardware.

Three rounds of correctness work have exercised none of the three.

**Every test in this round runs against real infrastructure — Vercel, Supabase, Ghost, Dodo, Resend.**
No containers standing in for platforms, no reasoning where a command would do. All of it is
provisioned and credentialed already (Part 2). A reasoned finding is worth a tenth of a demonstrated
one, and this round has no excuse for reasoning.

Read this file whole before starting. It carries three rounds of established fact so you spend the
session finding new things rather than rediscovering old ones.

---

## Part 0 — What is different about this round

Round 3 ran all four of its passes, applied 13 decisions, and then **provisioned real
infrastructure** and executed against it. The architecture is no longer mostly-reasoned: nearly
every external claim it depends on has now been run against the real platform.

**That changes your job in two ways.**

1. **The easy findings are gone.** Do not expect to win by noticing an unverified version number.
   Three rounds have mined that seam.
2. **You have live systems to attack.** Two real Ghost installs, a real Supabase project, a real
   Vercel Pro project, a real Dodo test account, real Resend. Credentials are in `tools/probe/.env`
   (gitignored). **Use them. A reasoned vulnerability is worth a tenth of a demonstrated one.**

**The standing rule of this project, which is also your method:**

> A claim about an external platform is a hypothesis until read in that platform's source or executed
> against it. **Cite or execute. Never assert, and never accept an assertion because it sounds
> authoritative.**

Five claims have entered this codebase as confident normative text and been falsified by execution.
The most recent, found in Round 3: **FR-L2 states "there is no documented `subscription.cancelled`"
and there is.** Assume a sixth is present and that it is somewhere that looks like evidence.

---

## Part 0b — Re-test everything. Re-report nothing.

Three rounds have closed 28 register items, applied 62 decisions and executed 20 sections of
`MEASUREMENTS.md`. Two instructions follow, and they pull in opposite directions on purpose.

**RE-TEST all of it.** Every closed finding is a regression test now. Code changed, grants changed,
platforms move on their own schedules — Supabase withdraws automatic grants on **2026-10-30**, Ghost
bumps its bundled gscan per minor, Dodo ships events. A closed item is a *claim that was true once*.
Re-run the harness in `tools/probe/` and `tools/stress/`; it exists for exactly this.

**Do NOT re-report what is already resolved.** Before you write up anything, check whether it is
already known:

    grep -rn "<the thing>" _bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/
    # MEASUREMENTS.md · VERIFY-AT-BUILD.md · ROUND-2-DECISIONS.md · ROUND-3-DECISIONS.md
    # ROUND-3-REPORT.md · STRESS-TEST-R2.md Part 3 · ARCHITECTURE-SPINE.md
    git log --oneline --all           # every commit message states its evidence

Then classify it, and the classification is the whole point:

| what you found | how to report it |
|---|---|
| known, re-tested, **still true** | one line in a **regression table**. Not a finding. |
| known, re-tested, **NO LONGER true** | **a finding, and a loud one** — the platform moved under us |
| known, and the *fix* was never actually applied | **a finding** — say which decision, and that it drifted |
| genuinely new | a finding |

**A report that re-flags `@even`/`@odd` parity, or the backslash escape, or the gscan pairing, has
wasted the round.** Those are settled. Prove they are *still* settled in one line each, and spend the
session on what is not.

---

## Part 1 — What Inflozo is, and what an attacker gets out of it

A visual site builder for Ghost CMS. Users drag pre-made sections onto a canvas; the product compiles
the design into a Ghost theme and **deploys it to the customer's own Ghost site**. The owner is a
solo founder who is not an engineer — every finding lands in plain language with numbered options and
one marked **(RECOMMENDED)**.

**Why this system is worth attacking, stated plainly, because it shapes where to aim:**

- Inflozo holds **Ghost Admin API credentials for other people's live websites**, in Vault. A
  compromise there is site takeover for every connected customer.
- Inflozo **writes code that runs on other people's domains**. A compiler injection is stored XSS on
  every site that deploys after it — and the victims are *the customers' visitors*, who never heard
  of Inflozo.
- The library is **484 design files authored by a team**. A malicious or careless design is a supply
  chain into every generated theme.
- It is **multi-tenant** over one Postgres, with browser clients writing directly to storage.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/`

| What | Where |
|---|---|
| The spine — 35 invariants, AD-1..AD-35 | `architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` |
| **Everything executed — 20 sections, §14–§20 are Round 3's** | `.../MEASUREMENTS.md` |
| Schema + its runnable proof | `.../SCHEMA.sql`, `.../RLS-TEST.sql`, `.../PRELUDE.sql` |
| External facts register — 28 of 36 now closed | `.../VERIFY-AT-BUILD.md` |
| Round 1's 33 decisions | `.../STRESS-TEST-R2.md` Part 3 |
| Round 2's 16 · Round 3's 13 | `.../ROUND-2-DECISIONS.md` · `.../ROUND-3-DECISIONS.md` |
| Round 3's findings report | `.../ROUND-3-REPORT.md` |
| **Live probe harness + credentials** | `/home/ghost/Dev/Inflozo/tools/probe/` (`.env` is gitignored) |
| The AD-11 stress fixture | `/home/ghost/Dev/Inflozo/tools/stress/` |
| **The PRD — v4.1** | `prds/prd-Inflozo-2026-08-17/prd.md` |
| Normative for mechanism | `prds/prd-Inflozo-2026-08-17/addendum.md` |
| Normative for scope — 484 designs | `prds/prd-Inflozo-2026-08-17/sections-inventory.md` |
| The 7 research companions | `prds/prd-Inflozo-2026-08-17/research-*.md` |

**Never read `prd.md` whole.** `sed -n`: §4 build order 131-169 · §5 FRs 170-455 · §6 NFRs 456-481 ·
§7 architecture 482-700 · §8 epics 701-801 · appendices from 802.

This is a git repository. Round 3 is ~36 commits on `main`; every message states its evidence.

---

## Part 2 — The live estate. It is yours to attack.

Everything below is **disposable and owner-authorised**. Nothing here is a production system.

| Target | What it is | Notes |
|---|---|---|
| `ghost5.inflozo.com` | Ghost **5.130.6**, gscan **4.49.7**, Ghost-CLI on Ubuntu 24.04, MySQL 8 | §4's target T3. Root SSH from this machine. |
| `ghost6.inflozo.com` | Ghost **6.58.0**, gscan **6.4.2**, same stack | §4's target T1. Root SSH. |
| Supabase (new) | PostgreSQL 17.6, **post-cutover grant default**, full 30-table schema applied | psql + publishable/secret keys |
| Supabase (old) | pre-cutover grant regime | **read-only**, for grant comparison |
| Vercel | Pro, `iad1`, project `inflozo-probe`, Fluid on | deploy functions freely |
| Dodo | test mode, webhook → `inflozo-probe.vercel.app/api/dodo` → `billing_events` | 47 event types |
| Resend | sending key, `onboarding@resend.dev` | |

**Both Ghosts carry an identical seeded fixture** — 32 posts (12+12+8), 8 featured, 8 without feature
images, 6 tags all above the 3-post floor, 3 authors, 57 members, a hidden `visibility: none` tier,
announcement bar seeded, comments on.

**Harness already written:** `tools/probe/check-access.py` (verifies every credential, prints no
values), `provision-ghost.sh`, `seed-ghost.py`, `run-verify-13.py`, `run-verify-all.py`,
`run-f8-storage.py`, `run-verify-ghostpro.py` (staged, awaiting a trial), `csp/`.

> ⚠️ **Process-security finding from Round 3, and it is about how this project works, not about the
> product.** Two live credentials were leaked into a chat transcript during Round 3 — a Resend key
> and a Vercel token — both by masking output with a *blacklist* of known prefixes instead of never
> printing values. Both were rotated. **Do not print a secret. Print verdicts.** If you find yourself
> writing a mask, you have already made the mistake.

---

## Part 3 — Executed fact. Do NOT re-derive any of this.

`MEASUREMENTS.md` is the authority; this is the index so you know what not to repeat.

### Compiler and theme output
- **AD-5's numeric-entity escaping works end to end** on a 70-section theme, including `C:\{{@site.title}}`
  — the case no backslash rule can serve. Zero live evaluations, zero parse failures. (§14e)
- **Handlebars' backslash escape is not composable.** 1 backslash inert, ≥2 evaluate live. There is no
  count that renders a literal `\` then `{{`. (§3)
- **`{{{body}}}` is mandatory** in a Ghost layout — Casper and Source both use it, `express-hbs` passes
  `body` as a plain string. AD-5's "zero `{{{`" assertion was corrected to allow exactly one. (§15, D3)
- **Three pipeline ordering rules** are now AD-5b: reverse-order token resolution, single-pass user-text
  substitution, escaper strips the marker delimiters. (§14b)
- **`GS005-TPL-ERR` is FATAL at upload** — Ghost returns 422 and refuses the theme. Round 2's "Ghost
  activates despite errors" is true for `GS110` only, not generally. (§15j)
- **`GS050-CSS-KGWF` is an error on both majors** with no card exclusion at all. (§14c)
- gscan **catches an unresolvable partial reference**; it does **not** catch an orphan partial. (§14c)

### Ghost, both majors, at runtime
- **`@even`/`@odd` track the 1-based `@number` — the first item is ODD.** The docs are wrong. (§15a)
- Helpers **work in error templates**; a single `error.hbs` serves every status (`templates.js:23`
  resolves `['error-{code}','error-{n}xx','error']`). A render failure surfaces as **400**, and
  `{{message}}` shows the raw template error **to the visitor**. (§15j)
- **`partials/content-cta.hbs` overrides the paywall CTA — but only if the theme also references it
  explicitly.** Reproduced 2/2 each way, both majors. (§15b)
- **`{{comments}}` emits ONE script tag from `cdn.jsdelivr.net`** and no server DOM. Third-party JS,
  its own colour scheme, unreachable by theme CSS. (§15c)
- **Ghost 6 caps `?limit` at 100 server-side and silently rewrites; Ghost 5 does not.** (§15d)
- Custom-template labels: strip `custom-`, split hyphens, Title-Case. Offered for **posts and pages**. (§15e)
- **`{{total_members}}` is exact with no `+` below 51.** The majors also differ: Ghost 6 counts `gift`. (§15f)
- **nql differs per major** — Ghost 5 resolves 0.12.7, Ghost 6 resolves 0.13.4. Relative dates and
  nested parens work on both. (§15g)
- Staff Access Token **lifts `GET /themes/`**; integration tokens do not — **501 on Ghost 5, 403 on
  Ghost 6**. (§15h)
- Theme upload ceiling on Ghost-CLI is **1 GB** (SSL vhost), not the 50 MB on the plain vhost. (§15h)
- Ghost identifies a theme by the **zip filename**, not `package.json.name`. (Round 2)
- Ghost **destroys** a stored custom-setting value when its `type` changes, **resets** it when the value
  leaves `options`. (Round 2)
- `{{t}}` **HTML-escapes**, so no input yields a literal brace. (Round 2)
- `{{#get "tiers"}}`: `length` is the pagination total and ignores the visibility filter; rows respect
  it. Test emptiness on a **filtered** get. (Round 2)

### Supabase, hosted
- **E1's exit criterion passes on real hosted Postgres: 38 assertions, 0 failures.** 30 tables, 34
  policies, `ON_ERROR_STOP`, zero errors. (§16a)
- **`PRELUDE.sql` must NOT run against hosted** — its `auth.uid()` stub would overwrite the platform's
  with one returning `NULL`, silently disabling every policy. `RLS-TEST.sql` is now dual-target. (§16)
- **`storage.buckets` ships RLS-on with zero policies** — a client cannot list buckets or flip `public`.
  AD-32 holds by default. (§16b)
- **`grant all` on `storage.*` confers TRUNCATE, which bypasses RLS — and the revoke is a NO-OP**, on
  the local image *and* hosted, because the grantor is `supabase_storage_admin`. The control that
  actually holds is that `storage` is not PostgREST-exposed (**confirmed 404**). (§16b, D6)
- **F8 CONFIRMED: the only sanitizer in the product is advisory.** A real end-user JWT uploaded a
  `<script>`-bearing SVG to `assets/{own}/` and a signed URL served it back byte-identical. Folder
  scoping and the server-only buckets all denied correctly. (§16c)
- **`suggestion-images` has insert and delete policies and NO select policy** — the owner cannot read
  back what they wrote, so the public board's signed URL must be minted with the service key. (§16c)
- **AD-7's server-only tables were unreachable by `service_role`** — `REFERENCES, TRIGGER, TRUNCATE`
  and no SELECT/INSERT. Fixed. RLS was never the obstacle; the missing table grant was. (§19d)
- **The secret key is refused from a browser User-Agent (401)**; the publishable key is accepted. (§20)
- **Passkeys: API present, `passkeys_enabled: false` by default.** Two switches now exist. (§20)
- The `auth_user_entitlement` trigger **fires on the real platform**. (§16a)

### Vercel
- **Fluid co-locates concurrent invocations — up to 4 observed — and also scales out** (40-way burst →
  40 instances). Round 1's "all concurrency on one instance" does not happen. (§17a)
- **`memory` is the INSTANCE budget, confirmed**: retained allocations accumulate across invocations and
  the instance dies at the limit (608→859→…→1860 MB → HTTP 500, recovers on a fresh instance). (§17a)
- **4 GB buys no extra CPU** — both sizes report 2 cores. Cost +14% of a deploy's compute. (§17d)
- **The CSP collision does not exist: setting a header does not force dynamic rendering, reading the
  nonce does.** Marketing keeps SSG (`x-vercel-cache: PRERENDER`) and still carries a policy. (§18)
- **An env var change requires a redeploy** — demonstrated accidentally. (§19, item 24)

### Dodo
- **47 event types**, not the 7 FR-L2 names. (§19a)
- **`subscription.cancelled` EXISTS and FR-L2 says it does not.** Captured signature-verified. (§19b)
- `dunning.started`/`recovered` exist; **`subscription.paused` has no state in AD-28's resolver**. (§19c)
- **A handler returning 200 on a failed store loses the event permanently** — Dodo does not redeliver. (§19e)
- MoR tax observed: 1500 USD + GB address → 1100 GBP + 220 VAT, computed by Dodo. Fee **9.92% of
  pre-tax**; Appendix F survives at ~11–16 subscribers break-even. (§19f, §19h–i)

### Determinism
- **AD-14 holds across seven environments including three physical machines** — byte-identical 197-file
  tree. Only **non-x86** remains untested. (§14d)

---

## Part 4 — Decisions taken. SETTLED. Do not re-litigate.

**Round 1: 33** (`STRESS-TEST-R2.md` Part 3) — decision 3 half-refuted, 6 amended, **12 struck**
(Round 3 ruled for AD-19's advisory lock), 25 dropped.
**Round 2: 16** (`ROUND-2-DECISIONS.md`) — all applied; four changed on contact with execution.
**Round 3: 13** (`ROUND-3-DECISIONS.md`) — all applied, plus decisions **A** (compile memory → 4 GB,
compile stage retries once) and **B** (AD-3's single carve-out: an inline `style` may set a CSS custom
property from bound Ghost data and nothing else).

**Finding a decision wrong on new evidence is in scope and valuable — five already were.** Re-opening
one to re-argue it is not.

### ⚠️ Live contradictions
Round 3 found one (R1 d12 vs Round 2's survivals on AD-19) and the owner ruled. **None is open.**
**If you find a pair of normative documents that contradict each other, stop and say so rather than
picking one.**

---

## Part 5 — Where to aim

This is the round's substance. Work as an attacker with a goal and as an engineer with a stopwatch,
not as an auditor with a checklist.

### 5.1 Threat actors — pick these up explicitly

| | Actor | What they start with | What they want |
|---|---|---|---|
| **A** | An ordinary Inflozo user | an account, a publishable key, direct storage write to their own folder | another tenant's data, or their Ghost credentials |
| **B** | A malicious user targeting *strangers* | the suggestion board, the asset pipeline | code execution in another user's browser |
| **C** | **A library/design author (insider)** | commit rights to `packages/library` — 484 designs, 31 behaviour modules | code on every customer site that deploys after them |
| **D** | A visitor to a deployed customer site | HTML Inflozo generated | anything — they are the ultimate victim and never consented |
| **E** | Someone who controls a connected Ghost | the Content API, the data Inflozo renders | attack the Inflozo editor through data it trusts |
| **F** | A leaked-credential holder | one key: publishable, secret, staff token, Vault ref, Vercel token | maximum blast radius per key |
| **G** | Any authenticated user, seeking cost | rate limits, compile budget, storage quota | make the owner pay, or deny service |

### 5.2 The surfaces that have never been attacked

Round 3 executed a great deal, but **almost none of it was an attack**. These are untouched:

1. **The compiler as an injection channel — beyond AD-5.** AD-5 is proven for *braces*. What about the
   rest? A user controls text, image alt text, link URLs, layer names, custom-setting keys and values,
   translation overrides, and `routes.yaml` content. **Actor D is the victim and they never opted in.**
   Trace every user-controlled value from input to emitted `.hbs` and find one that escapes its context
   — an attribute, a URL scheme, a CSS value, a `<style>` block, a JSON island.
2. **AD-21's same-origin editing iframe.** The canvas renders library HTML *and Ghost data* in an iframe
   on Inflozo's own origin, under a CSP that permits `frame-ancestors 'self'`. Actor E controls Ghost
   data. What reaches that iframe unsanitized, and what does same-origin buy an attacker who gets there?
3. **The Ghost Admin proxy and P8's write allowlist.** AD-10 says one module mints the JWT and decrypts
   the Vault secret, with a four-item write allowlist. Attack the allowlist, the JWT minting, the
   `routes.yaml` upload path (it is a *whole-site* file), and confirm no client path reaches Admin.
4. **Vault.** FR-C3 puts Ghost Admin keys there. Nothing has probed it. Who can decrypt? What does a
   compromised server route get? `pgsodium` is being replaced underneath — a standing watch item.
5. **The edit-lock protocol.** R3 §2.4 named two open holes and they are **still open**: forging
   `edit_locks.holder_session_id` **without advancing `lock_generation`**, and `assets.stored_bytes`
   client-settable **at INSERT**. Round 3 marked them; nobody closed them. Start here — they are known.
6. **The library supply chain (actor C).** 484 design files, 31 behaviour modules, a string catalog, 12
   Style Packs. AD-2 says the library is data, never code — but `behaviour.js` *is* code, and it ships
   to every customer site. What stops a design from exfiltrating, or from breaking the compiler? Round 3
   decision D13 replaced R2-7's unsatisfiable shape rule with a CI lint that **does not exist yet**.
7. **Multi-tenancy beyond `RLS-TEST.sql`'s assertions.** That file proves what it thought to assert.
   Attack what it did not: side channels, error-message leakage, `count(*)` oracles, foreign-key probing,
   sequence leakage, timing. `service_role` now has **BYPASSRLS** and, since §19d, grants on AD-7's
   tables — did that fix open something?
8. **Cost and abuse (actor G).** FR-J11 is 10 deploys/hour/site. The compile is ~486 MB and up to four
   share a 2 GB instance. Storage is metered on `assets.stored_bytes`, which the client sets. Can a user
   make the owner pay? Can they deny service to another tenant?
9. **Auth and session.** Magic links, 30-day rolling sessions, the passkey path that is off at the
   platform but on in our flag, account deletion's 14-day window, `profiles.is_admin`.
10. **The suggestion board.** Public UGC with images, an approval gate, a `SECURITY DEFINER` view. F8
    proved raw SVGs land in `suggestion-images`; D4 specified server-side sanitization that is not built.

### 5.3 Specifically re-examine what Round 3 changed

New code and new grants are where new holes live.

- **D6 / §19d**: `service_role` gained `SELECT, INSERT` on `billing_events` and `site_credentials`.
  Justified — but PostgREST reaches `public` with the secret key. **Can anything but a server route now
  read Vault references?** Prove it either way.
- **Decision B**: AD-3 now permits an inline `style` setting a CSS custom property **from bound Ghost
  data**. Actor E controls that data. **Is `style="--tag-accent: {{accent_color}}"` escapable?** What
  does Ghost allow in a tag's `accent_color`? Test it on the live Ghosts.
- **Decision A**: the compile stage now **retries once**. Is retry safe against a partially-applied
  deploy? AD-19's lock is transaction-scoped — does the retry re-enter it?
- **§19e**: the webhook handler must now return non-2xx on a failed store. Does that create a
  replay or amplification path?

### 5.3b Performance — the third question, and it has never been measured

The product makes **numeric** promises and almost none has been tested on real hardware. Every number
below is measurable today on the live estate. Where a promise has no number, say so — an untestable
promise is a finding.

| Promise | Where | What to measure, on real infrastructure |
|---|---|---|
| **NFR-1** editor latency — a control change paints in one frame | §6 | No editor exists yet, so measure the *floor*: how long does the section-runtime render take for one control change? `tools/stress` renders 70 sections in ~1.0 s on 4 cores. One section is the unit that matters. |
| **NFR-2** output performance — **≤ 40 KB CSS gzipped over the subset a template reaches**, and a JS budget | §6, AD-14's reachability record | The stress theme is checked in. Measure `screen.css` **brotli** (`size-limit`'s default metric, and what the 40 KB number means). Then deploy it to a real Ghost and measure what a *visitor* actually downloads. |
| **G1** first deploy in ten minutes | §1 | Not measurable without the editor, but the **deploy half** is: compile → gscan → zip → upload → activate, end to end, against `ghost5` and `ghost6`. Round 3 measured compile at ~4 s; the upload and activate legs are unmeasured. |
| **AD-11** compile budget | §7.1 | Re-run `tools/stress` on Vercel itself, not locally. Round 3 measured 486 MB peak and found `memory` is the **instance** budget with up to 4 co-located. **Decision A raised it to 4 GB — verify that actually applied and that the margin is what it claims.** |
| **NFR-6(a)** the render matrix — 484 × 3 packs × 2 modes × 3 viewports | §6 | Nothing exists. Estimate the wall-clock honestly and say whether the stated cadence is achievable. |
| Deployed-site performance | P5, FR-J1 | **Deploy the stress theme to a real Ghost and measure the page a visitor gets** — TTFB, transferred bytes, request count, and whether `{{comments}}`'s third-party script from `cdn.jsdelivr.net` (§15c) dominates. |
| Supabase under RLS | AD-6 | AD-6 wraps every policy as `(select auth.uid())` "so the planner hoists it". **Prove it.** `EXPLAIN ANALYZE` a tenant-scoped query on the live project, with and without the wrapper, at a realistic row count. This is a claimed performance property that has never been checked. |
| Cold starts | AD-11 | Fluid instance boot on a real deploy: how long before the first byte on a cold path? |

**Two performance questions that are really security questions**, so do not separate them:

- **Is any of this a denial-of-service lever?** A compile is ~4 s and ~486 MB. FR-J11 allows 10/hour
  per site. What does a Pro account with 25 projects cost the owner in an hour of deliberate abuse?
- **Does RLS degrade with tenant count?** Seed the live project to a realistic scale and measure. An
  isolation mechanism that becomes unusably slow is an availability failure.

### 5.4 Then harden — this is half the round

For every confirmed finding, say what to change, at the level of an AD or a decision. **Prefer one
mechanism that closes a class over three that close instances** — this project has been bitten
repeatedly by fixes applied in one place and not propagated to siblings (five occurrences).

**Then answer question 2 directly: is this secure enough?** That is not the sum of the findings — it
is a judgement, and the owner needs it stated plainly. Ask specifically: **what is missing that no
single finding will reveal?** There is no threat model, no stated trust-boundary diagram, no incident
response, no key-rotation policy, no dependency-integrity story for the 484 designs, no logging or
alerting on the security-relevant paths, and **no security section in the spine at all** — 35 ADs and
not one of them is named for security, though several carry it implicitly.

Say whether you would put other people's live website credentials behind this architecture today, and
what would have to change for the answer to be yes.

---

## Part 6 — How to run it

**Pass 1 — Attack, with the live estate.** Prefer demonstration over reasoning. Every claim gets a
command and its output. Budget most of the round here.

**Pass 2 — `/bmad-review lenses=adversarial,edge-case-hunter,verification-gap`** over
`ARCHITECTURE-SPINE.md`, `SCHEMA.sql` and `MEASUREMENTS.md`, carrying Part 3 in as `also_consider`.
Aim the **adversarial** lens at the threat actors in 5.1, not at general correctness. It requires at
least ten concrete findings; an empty list is a signal to re-check.

**Pass 3 — `/bmad-party-mode --party ghost-build-room`.** That party is persisted and its memlog
carries Rounds 1–3. Put the Ghost-specific attacks to it: what a compromised Ghost can do to the
editor, what a theme can do to a visitor, what the Admin API allows that P8 forbids.

**Pass 4 — `/bmad-advanced-elicitation`, red team and pre-mortem.** Framing: *it is two years on,
Inflozo has 500 paying customers, and there has been a breach that made the news. What was it, which
of the 62 decisions enabled it, and how long was it exploitable before anyone noticed?*

**Do not repeat Round 2's mistake of spending the whole session on one pass.** Round 3 ran all four.

---

## Part 7 — Reporting

Three deliverables. The third is the one the owner actually uses.

### 7.1 The regression table — first, and short

One line per previously-closed item you re-tested: **the item, and `holds` / `MOVED`**. This is how
the owner knows the ground did not shift while attention was elsewhere. Anything that MOVED is a
finding, not a table row.

### 7.2 The technical report — markdown, ranked by severity

For each finding:

- **What an attacker does**, or **what is slow** — concretely. The actor, the steps, the outcome.
- **How you know** — the command and its output, or the file and line. Neither means it is an opinion;
  mark it as one.
- **Blast radius** — one tenant, all tenants, the customers' visitors, or the owner's bill.
- **Which AD or decision** is missing, wrong or too loose.
- **What you would change** — one sentence.

Separate **CONFIRMED** (executed) from **SUSPECTED** (reasoned). **Do not inflate — a padded security
report is worse than a short one, because it buries the real finding.** Say plainly what held; after
three rounds a great deal has, and "held" findings belong in the HTML too.

Then answer the three questions of Part 0 in their own short section: what an attacker can do, whether
this is secure enough, and whether it is fast enough. Judgements, not lists.

### 7.3 ⭐ The decision sheet — a self-contained HTML file the owner clicks through

**A template already exists and works: `tools/probe/report-template.html`.** Copy it, replace the
`FINDINGS` array, change nothing else. Write the result to
`.../architecture-Inflozo-2026-08-19/ROUND-4-FINDINGS.html`.

It renders every finding in **plain language**, with numbered options, the recommended one marked, a
**Choose** button per option, and a **textarea per finding** for counter-questions. A **Copy my reply**
button assembles every selection and question into one block the owner pastes straight back into chat.
It is one file, no CDN, no build step, works by double-clicking, and follows the OS light/dark setting.

The array shape, and every field earns its place:

```js
{
  id: "F1",
  severity: "critical|high|medium|low|held",   // "held" = attacked and did NOT break. Include these.
  status: "CONFIRMED|SUSPECTED",
  area: "Security|Performance|Both",
  actor: "who could do this, in plain words",  // omit for pure performance findings
  radius: "one tenant | all tenants | customers' visitors | the owner's bill",
  plain: "One paragraph a non-engineer can act on. What breaks, for whom, and whether it is happening
          now or only after launch. No jargon; if a term is unavoidable, define it in the sentence.",
  analogy: "optional one-liner — concrete beats clever",
  evidence: "the command and its verbatim output",
  ad: "AD-32 / decision D4",
  options: [
    { label: "…", why: "what it costs and what it buys", recommended: true },
    { label: "…", why: "…" },
    { label: "Do nothing for now", why: "honest where deferring is genuinely fine — say why" }
  ]
}
```

**Rules for that file, because it is the one the owner reads:**

- **Plain language throughout.** If a sentence needs the reader to know what RLS or a nonce is, rewrite
  it. The technical detail belongs behind the "How we know" fold, not in `plain`.
- **Always give a real option to do nothing** where deferring is defensible, and say what it costs.
  A sheet where every option is "fix it" is not a decision sheet.
- **Exactly one option per finding marked `recommended`**, and the `why` must say why *that* one.
- **Include the "held" findings.** Knowing what was attacked and survived is what makes the rest
  credible.
- **Never put a secret in it.** It is a file on disk that may get shared.

**Say explicitly which passes you ran.** Round 2's most useful admission was that three of its four
did not.

You may edit files — this is a git repository and the owner has authorised edits in prior rounds — but
**branch first, and never commit a secret.** `tools/probe/.env` is gitignored; keep it that way.

### Do not spend the run re-deriving these

Everything in Part 3, plus: Handlebars' backslash escape is not composable · `{{x}}}` is a parse error
· `GS100` is an error on both gscan majors and fires when any declared `config.custom` key is
unreferenced · `GS051-CUSTOM-FONTS` needs both font variables in one file · the `config.custom` cap is
20 and the types are `select|boolean|color|image|text` · excluding a Koenig card restores gscan's
rules for it · Vercel Pro limits (300 s default / 800 s max, 2 GB default / 4 GB max, 4.5 MB body cap)
· `middleware.ts` is `proxy.ts` in Next 16 · a Vercel env var needs a redeploy · a column-level REVOKE
is a no-op while a table-level GRANT stands · TRUNCATE is not subject to RLS · Supabase withdraws
automatic `public` grants on **2026-10-30** · legacy Supabase JWT keys are deleted **late 2026**.

### Open items you may use but need not close

VERIFY 1 & 2 (Ghost(Pro), deferred to E14 — the probe is written and waiting), VERIFY 6's statutory
half (an owner action: does Dodo send the annual renewal notice?), VERIFY 5's residual (one reading at
the annual price), VERIFY 16 & 17 (E4 tooling), and arm64 determinism.
