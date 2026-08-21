---
title: 'Inflozo — executed measurements and findings'
type: architecture-companion
status: final
created: '2026-08-19'
---

# Executed measurements

Everything here was run, not read. Reproduction commands are given because AD-23 requires a
recording rather than a paraphrase, and because three of these findings contradict text that
currently reads as normative.

Reference machine: Linux, 4 cores, 32 GB, Node v22.23.2, `jsdom` 30.0.1, `handlebars` 4.7.9,
`gscan` 6.4.2, PostgreSQL 17.11 (Docker `postgres:17-alpine`).

---

## 1. The spike reproduces

    cd spike-compiler && npm install jsdom handlebars gscan && node test.js

**16/16 renderer assertions pass** on this machine, unchanged. The spike is reproducible, not
merely reported.

---

## 2. Compile sizing — the 40-section stress fixture · behind AD-11

§7.1 requires duration and memory to come from a measurement against the 40-section stress
fixture, not from a platform default. This is that measurement.

**Fixture.** The stress template carries 40 sections; the other six synthesizable templates
carry their Synthesis Default stacks, modelled at five each — **70 section renders across 7
templates**, assembled into a complete theme: 173 files, `screen.css` with one flat stylesheet
per placed design, `cards.css`, `main.js`, 8 woff2 subsets, 80 hashed image renditions
(incompressible random bytes, so the zip figure is honest), `locales/en.json`, a full
`package.json` carrying `image_sizes` and the three FR-Q5 built-ins.

| Stage | Wall time |
| --- | --- |
| render + serialize (70 sections) | **770 ms** (11.0 ms/section) |
| assemble the rest of the tree | 14 ms |
| gscan 6.4.2 — **both specs** (v5 217 ms + v6 88 ms) | **305 ms** |
| FR-J17 quality gate (§11) | **700 ms** |
| zip | 222 ms |
| **total** | **~2.0 s** |

**Corrected at the reviewer gate.** The first version of this table timed **one** gscan spec while the
pipeline commits to two, and omitted the FR-J17 gate entirely — a stage the PRD makes mandatory on
every compile. Both are measured above and folded into AD-11. Both specs score **0 errors, 0
warnings** on the stress fixture.

| | |
| --- | --- |
| Peak RSS | **289 MB** |
| Theme size | 9.75 MB uncompressed · 9.66 MB zipped |
| gscan | **0 errors, 0 warnings** |

**Sizing decided from it:** `maxDuration: 300` and `memory: 2048` — both the Vercel Pro
defaults, giving ~140× duration and ~7× memory headroom. The reference machine has 4 cores
against Vercel Fluid's 1 vCPU, and the real function additionally pays Storage reads and font
subsetting, which the fixture did not; a 10× shell factor still lands two orders of magnitude
inside the ceiling. **§7.1's gscan-boundary split therefore does not trigger and is not
built** (recorded as Deferred in the spine).

**Two things kept out of the function to make that true.** Image renditions are generated in
the browser at upload (AD-12) — a `sharp` dependency would have dominated both figures. And
the 9.66 MB zip never crosses a function boundary (AD-13), because Vercel caps request *and*
response bodies at 4.5 MB.

---

## 3. Handlebars escaping · behind AD-5 · **contradicts §7.3**

§7.3 identifies a real bug in the spike's escaping rule and then states a remedy: *"The
backslash is escaped too. The emitted form is `\{{`."* The bug is real. **The remedy was
executed and does not work.**

    node -e "H=require('handlebars');for(n=0;n<5;n++)console.log(n,JSON.stringify(H.compile('\\\\'.repeat(n)+'{{t}}')({t:'LIVE'})))"

| backslashes emitted before `{{t}}` | renders |
| --- | --- |
| 0 | `LIVE` |
| 1 | `{{t}}` — inert, **and the backslash is consumed** |
| 2 | `\LIVE` |
| 3 | `\\LIVE` |
| 4 | `\\\LIVE` |

Handlebars' escape is **not composable**. Exactly one backslash escapes a mustache and it
disappears; every count ≥ 2 evaluates. There is therefore **no** emission that renders a
literal `\` followed by a literal `{{` — so a user who types `C:\{{title}}` cannot be served
correctly by any backslash rule, and a block helper typed after a backslash produces a
template that will not compile on any count.

**HTML numeric entity encoding closes it completely.** Escape `&` first, then emit `&#123;`
for every `{` and `&#125;` for every `}` the user typed. Handlebars never sees a mustache;
the browser decodes the exact characters back. Every case round-trips — `{{title}}`,
`C:\{{title}}`, `{{{title}}}`, `{{#if x}}…{{/if}}`, `{{!-- c --}}` — with zero parse failures
and no interaction with Handlebars' escaping rules at all.

Under the preamble's precedence, this is a **fact about an external platform settled by
execution**, which outranks the PRD body. It does not change any product decision: FR-J1's
guarantee is unchanged and is now actually delivered. **It is in E0(a)'s scope** — the PRD
already puts "the escaping bug already found" there; what changes is that the fix it names is
not the fix that works.

---

## 4. A mustache may not abut a closing brace · behind AD-5

    node -e "require('handlebars').precompile(':root{--a:{{@custom.x}}}')"   # Parse error

Handlebars reads `}}}` as a triple-stash close. FR-Q5 mandates an inline token block in
`default.hbs` for promoted colours, and the natural emitted form is exactly this shape — so
the theme would fail to compile, and gscan reports it as *"Templates must contain valid
Handlebars"* rather than as anything that points at the cause.

`;}`, ` }` and a newline all parse. The emitter therefore terminates every declaration, and
compile CI asserts the emitted theme contains **zero `{{{` and zero `}}}`** sequences —
Inflozo emits no triple-stash by design (AD-4), so the assertion is exact and closes the whole
class rather than this one instance.

---

## 5. `GS100`'s exact trigger · closes §7.6 item 19 · behind AD-17

Five fixture themes, each differing only in how the three FR-Q5 `config.custom` keys are
referenced, checked against **both** the v5 and v6 specs.

| Fixture | v5 | v6 |
| --- | --- | --- |
| A — none referenced | GS100 **error** | GS100 **error** |
| B — all three referenced, FR-Q5's fallback-chain form | **0 errors, 0 warnings** | **0 errors, 0 warnings** |
| C — referenced only inside `{{#if}}` guards | clean | clean |
| D — referenced only inside a partial | clean | clean |
| E — two of the three referenced | GS100 **error** | GS100 **error** |

Four facts, all previously assumed:

1. `GS100` is an **error**, not a warning, on both specs — so it blocks a deploy outright.
2. It fires when **any** declared key is unreferenced. Partial reference is not partial credit.
3. A reference **inside a `{{#if}}` guard counts** — which is what makes FR-Q5's fallback
   chains a real reference rather than a token mention.
4. A reference **from a partial counts** — the reference need not live in `default.hbs`.

**FR-Q5's always-declare-always-reference design is confirmed sufficient**, and its stated
reason — that the conditional design would have put a gscan collision inside the one setting
a user is most likely to toggle — is exactly right.

---

## 6. `GS051-CUSTOM-FONTS` — a rule the PRD never names · behind AD-18

Every fixture above, including the clean ones, carried one standing warning on **both** specs.
Read from `gscan/lib/specs/v5.js:751` and `gscan/lib/checks/051-custom-fonts-css-properties.js`:

```js
'GS051-CUSTOM-FONTS': {
    level: 'warning',
    rule: 'Missing support for custom fonts',
    regex: /^(?=[\s\S]*--gh-font-heading)(?=[\s\S]*--gh-font-body)/
}
```

The check scans every `.css` and `.hbs` file and passes if **one file** contains **both**
strings. Nothing in the PRD mentions it, and without it every theme Inflozo ships carries a
standing warning — which makes G3's "warnings surfaced, always", FR-J6's 0/0 target and every
category gate's automated sheet unmeetable at once, on all 484 designs simultaneously.

Closed by AD-18. The 40-section fixture scores 0/0 with the two variables present, which is
the proof that the fix is sufficient at scale.

---

## 7. Excluding a Koenig card restores gscan's rules for it · confirms FR-Q7

Setting `card_assets: { exclude: ['callout'] }` produced **12 new warnings**, each demanding a
`.kg-callout-*` class the theme must now style. **[Corrected 2026-08-20: this section previously
said 10. Re-run under both checkers, the number is 12 on each — `GS050-CSS-KGCO`, `-KGCOE`,
`-KGCOT` and nine `-KGCOBG*` background variants. The count is quantified again per card in §13.]** FR-Q7 states this ("Excluding a card also
restores gscan's Koenig rules for it, so checking scales with what Inflozo actually wrote") —
confirmed, and now quantified. It is a build obligation on E7 and on E10's A33 category gate:
designing a card means styling **every** class gscan checks for it, or the 0/0 target breaks.

---

## 8. Schema and RLS · behind AD-6 through AD-9

    docker run -d --name pg -e POSTGRES_PASSWORD=x postgres:17-alpine
    psql -f PRELUDE.sql -f SCHEMA.sql -f RLS-TEST.sql

`SCHEMA.sql` applies clean to PostgreSQL 17.11 on the first run. The static sweep reports:

- **0** public tables with RLS disabled
- **policies across tables — re-derive from the proof; this line is deliberately not a number.**
  It once read "34 policies across 26 tables" and has gone stale twice since: **37 / 28** after Round
  2's grants, **46 / 29** after Round 4 (the parent-ownership policies, `renewal_reminders`, and the
  AD-7 tables moving to `private`). That drift is Round 1 decision 24's whole point — a count
  restated by hand in a second place goes stale the first time the schema moves. `RLS-TEST.sql`
  prints the live figure on every run; container and hosted were confirmed identical at **46 / 29**
  on 2026-08-20. *(Round 3 decision D8 flagged this line for re-derivation; Round 4 re-derived it.)*
- exactly **2** deliberate server-only tables (`site_credentials`, `billing_events`) — both
  RLS-enabled with zero policies, which is AD-7's deny mechanism. **Both moved to the `private`
  schema in Round 4 (F6), and a third joined them** (`credential_audit`), so the equivalent
  present-day check is that `public` holds exactly one deny-all table, `feature_flags`
- **0** tables carrying `user_id` without a policy that scopes on it

The behavioural pass proves isolation rather than asserting it — every line reads PASS:
cross-tenant project insert blocked, cross-tenant site update invisible, `is_admin`
self-grant blocked by the freeze trigger, `deploys` row forge blocked, vote-as-another-user
blocked, unapproved suggestion image `NULL` through the public view, the 17-setting cap held,
the 6-digit-hex colour rule held, the `credit.*` namespace lock held.

**E1's exit criterion — "RLS verified on every table the schema story creates" — now has a
runnable artifact instead of a sentence.**

---

## 9. Versions, read rather than recalled

npm registry, 2026-08-19: `next` 16.3.1 · `@supabase/supabase-js` 2.112.3 · `gscan` 6.4.2 ·
`jsdom` 30.0.1 · `handlebars` 4.7.9 · `stylelint-plugin-use-baseline` 1.4.5 ·
`browserslist-config-baseline` 0.5.0 · `eslint-plugin-compat` 7.0.2 · `size-limit` 13.0.3 ·
`web-features` 3.35.0 · `resend` 6.20.0 · `dodopayments` 2.47.0 · `zod` 4.4.3.

`TryGhost/Ghost` `ghost/core/package.json` at `main` (6.58.1-rc.0) declares **`"gscan":
"6.4.2"`** — so FR-J6's pin at 6.4.2 satisfies "at or above the newest bundled by any
supported target" as a read fact rather than a hope.

Vercel Functions limits, `vercel.com/docs/functions/limitations` (page dated 2026-07-01): Pro
duration default 300 s, maximum 800 s GA, 1800 s in beta; memory default 2 GB / 1 vCPU,
maximum 4 GB / 2 vCPU; function bundle 250 MB uncompressed; **request and response body
capped at 4.5 MB**.

Supabase Vault: `pgsodium` is pending deprecation, but Vault's interface (`vault.secrets`,
`decrypted_secrets`) is explicitly unchanged and its internals migrate off `pgsodium`.
FR-C3's posture holds. Standing watch item, not a blocker.

---

## 10. A leak this review found in its own schema, and a Postgres trap

The first draft put FR-M3's unapproved-image gate in a view and left the base table readable.
Probed on PostgreSQL 17.11, `anon` read the unapproved `image_path` straight off
`public.suggestions`, going around the view entirely. A view is not an access control when the
table underneath it is still granted.

The intuitive fix is also wrong, and silently:

    revoke select (image_path) on public.suggestions from anon;   -- NO-OP

**A column-level `REVOKE` does nothing while a table-level `GRANT` stands.** The probe still
returned `img/secret.png`. The correct form revokes the table grant and grants the allowed
column list back:

    revoke select on public.suggestions from anon, authenticated;
    grant  select (id, user_id, category, title, body, status, vote_count,
                   created_at, image_approved) on public.suggestions to anon, authenticated;

After which `select image_path from public.suggestions` as `anon` raises
`ERROR: permission denied for table suggestions`, and the `SECURITY DEFINER`
`suggestions_public` view — the only path to the column — serves it gated.

Two consequences landed in the schema. The gate is now two mechanisms, not one. And FR-M4's
moderation stopped being an RLS policy: an admin policy would have had to re-open the very
column the gate closes, and status, merge, hide and image approval are all facts the server
asserts, which AD-8 already routes through a service-role server route.

`RLS-TEST.sql` now asserts the leak is closed. Every line reads PASS.

---

## 11. The FR-J17 quality gate, measured because AD-11 had omitted it

The reconciliation review pointed out that AD-11's headroom — the number that retires §7.1's compile
split — was computed without the one compile stage the PRD makes mandatory. Measured rather than
estimated, on the same stress-fixture theme:

| | |
| --- | --- |
| `.hbs` files parsed | 79 |
| elements walked | 569 |
| links / images / headings checked | 40 / 2 / 72 |
| CSS declarations parsed | 4,610 |
| **wall time** | **697 ms** |
| peak RSS | 265 MB (inside the render stage's own 289 MB) |

The proxy runs the gate's actual shape — parse every emitted `.hbs` with the Handlebars still in it,
walk it for inline handlers, link accessible names, `alt` presence and heading order, and parse
every declaration in `screen.css` and `cards.css`. It does not run axe-core or the contrast pass,
both of which are per-render rather than per-file and are already budgeted inside the NFR-6(a)
matrix. **AD-11's conclusion survives at ~140× headroom instead of ~250×**, which is the point of
measuring rather than asserting: the number moved and the decision did not.

---

## 12. Four version rows that were recalled, not read

The version-lens reviewer checked the Stack table's own claim — *"every version above was read from
the live npm registry or the vendor's docs"* — and found four rows where that was false. Re-checked
here directly against `registry.npmjs.org`:

| Row | Stated | Actual `latest` |
| --- | --- | --- |
| TypeScript | 5.x | **7.0.2** |
| pnpm | 10.x | **11.22.0** |
| Node.js | 22 LTS | **24.x** is Vercel's default and the active LTS |
| React | "19.x, bundled with Next 16" | **19.2.8**, and a **peerDependency**, not bundled |

All four are corrected in the Stack table, and the failure is recorded rather than quietly fixed.
This is the exact failure mode the project's standing rule names — a recalled fact stated with the
confidence of a read one — reproduced inside the document that restates the rule. It is worth more
as a recorded near-miss than as a silent edit.

Two platform facts were also wrong and are load-bearing, both confirmed here against the vendor:

1. **`middleware.ts` is deprecated in Next 16**, renamed to **`proxy.ts`**, which runs on the Node.js
   runtime; `middleware.ts` survives only for Edge use cases and will be removed
   (`nextjs.org/blog/next-16`). A session-aware CSP is a Node-runtime concern, so the spine had
   committed to both the deprecated file and the wrong runtime.
2. **A Vercel environment variable cannot be changed without a redeploy** — env-var changes apply
   only to new deployments. The spine had put the passkey feature flag behind an env var *for the
   express purpose of* disabling it without a redeploy (FR-A2). Flags are now rows in
   `feature_flags`, read server-side per request.

Verified and unchanged: every other Stack row matches npm `latest`; all of AD-11 and AD-13's Vercel
limits; `browserslist-config-baseline@0.5.0` at the `2026-08-18` pin resolving to exactly Chrome/Edge
121, Firefox 122, Safari/iOS 17.2; `GS100` at `error` level inherited from `v4.js` into v5 and v6;
`GS051-CUSTOM-FONTS` exactly as quoted; Ghost `main` declaring both `gscan 6.4.2` and
`handlebars 4.7.9`, so AD-5's execution basis is Ghost's real runtime.

One further correction: **`size-limit` has no engine of its own** and measures nothing without a
preset — `@size-limit/file` is required — and its default metric is **brotli**, which is what NFR-2's
40 KB budget therefore means. And the WebAuthn surface landed in `@supabase/auth-js` **2.75.0**, not
2.105.0, so the PRD's floor is a safe over-pin rather than a capability boundary.


---

## 13. Two gscan majors, not one gscan twice · behind AD-34 · **corrects §2 and §11**

`ghost:5-alpine` → Ghost **5.130.6**, bundling gscan **4.49.7**.
`ghost:6-alpine` → Ghost **6.58.0**, bundling gscan **6.4.2**.
Image digests: `ghost@sha256:a0506f3f…48bdb5` (5-alpine), `ghost@sha256:c917e2a3…a70a3f2` (6-alpine).

    docker exec iz-ghost5 cat /var/lib/ghost/versions/*/node_modules/gscan/package.json | grep version

### 13a. The same theme, three verdicts

The theme is the probe theme (a `page.hbs` with no `@page.show_title_and_feature_image` guard, and
one `{{#get}}` using `limit="all"`), chosen because it discriminates. Verdicts as reported by the
Admin theme-upload endpoint on each real Ghost, against the local checkers:

| checker | errors | warnings |
| --- | --- | --- |
| gscan 6.4.2 at `checkVersion: 'v5'` — **what the gate used to run** | **0** | 1 |
| **real Ghost 5.130.6** (gscan 4.49.7) | **1** | 0 |
| gscan 4.49.7 at `checkVersion: 'v5'` — **what the gate runs now** | **1** | 0 |
| gscan 6.4.2 at `checkVersion: 'v6'` | 0 | 2 |
| **real Ghost 6.58.0** (gscan 6.4.2) | 0 | 2 |

The corrected pairing reproduces both real Ghosts exactly — error counts **and** rule codes
(`GS110-NO-MISSING-PAGE-BUILDER-USAGE` on 5.x; that plus `GS090-NO-LIMIT-ALL-IN-GET-HELPER` on 6.x).
The spike theme scores **0 errors / 0 warnings under both checkers**, so nothing regressed.

### 13b. Where the two v5 specs actually differ

    261 rules in gscan 4.49.7's v5 spec; 259 in gscan 6.4.2's.

| rule | 4.49.7 | 6.4.2 |
| --- | --- | --- |
| `GS110-NO-MISSING-PAGE-BUILDER-USAGE` | **error** | warning |
| `GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE` | **error** | warning |
| `GS050-CSS-KGVIDTHUMB` · `-KGVIDTHUMBPL` · `-KGVIDTI` | warning | **absent** |
| `GS005-NO-INLINE-DYNAMIC-PARTIAL` | absent | error |

`GS100` and `GS051-CUSTOM-FONTS` exist in **both** with identical regexes; the `config.custom` cap is
**20** in both and the allowed types (`select|boolean|color|image|text`) are unchanged. **AD-17 and
AD-18 therefore survive the version split unchanged** — only the GS110 pair and the three GS050
video rules moved.

### 13c. Cost — the split does not buy a second gscan's worth of time

Five runs each on the spike theme, medians (the first call of each process is module load and is
excluded as cold):

| checker | median |
| --- | --- |
| gscan 4.49.7 (Ghost 5 verdict) | **27.9 ms** |
| gscan 6.4.2 (Ghost 6 verdict) | **29.6 ms** |
| both | **57.5 ms** |

**Scope limit, stated because it matters:** this is the two-section spike theme, **not** AD-11's
40-section stress fixture — which Round 1 established is not checked in anywhere in the repo and
which Round 1 decision 10 is still open against. §2's `217 + 88 = 305 ms` was measured on that
fixture and is **not** comparable to the numbers above. What these numbers do establish is that
running two gscan *majors* costs about the same per pass as running one twice, so the split is not a
new budget risk. **The authoritative re-measure against AD-11 waits on decision 10's rebuilt fixture.**

### 13d. A33 Koenig card treatments, quantified under both checkers

`card_assets.exclude` restores gscan's rules for each excluded card (§7). Measured on the spike theme:

| excluded | gscan 4.49.7 (Ghost 5) | gscan 6.4.2 (Ghost 6) |
| --- | --- | --- |
| none (`card_assets: true`) | 0 | 0 |
| one — `callout` | **12** | **12** |
| six — `callout, button, header, product, toggle, video` | **53** | **50** |

**A33 is six designs.** So the category's full styling obligation is **53 classes on Ghost 5 and 50
on Ghost 6**, and the **3-warning delta is exactly** `GS050-CSS-KGVIDTHUMB`, `-KGVIDTHUMBPL` and
`-KGVIDTI` — the video-thumbnail rules that exist only in 4.49.7 and that the previous gate could
never see. This lands on **E7** and **E10's A33 category gate** simultaneously: designing a Koenig
card means styling every class gscan checks for it, on **both** majors, or FR-J6's 0/0 target breaks
on Ghost 5 only — the harder failure to notice.

---

## 14. AD-11 re-measured on the rebuilt stress fixture · Round 3 · **corrects §2 and §11**

Round 1 decision 10 is closed. The fixture is checked in at `tools/stress/` and this is its
measurement. §2's numbers were taken on a fixture that was never committed and that Round 1
established was ~7.4x too light per section; these replace them.

    cd tools/stress && npm install && node build.js && node gate.js theme

**Fixture shape.** Eight annotated-HTML archetypes sized from `sections-inventory.md` — header with
a nav repeat, split hero with a stat row and a trust rail, post feed with a **nested** tag repeat,
tiers with a benefit sub-repeat, gallery, member-aware CTA band, article body with a related-posts
repeat, footer with three nav repeats. **Mean 39.1 elements and 21.0 directives per section**
against the spike's toy hero at **5 elements and 3 directives**. 70 renders over 7 templates
(`custom-stress` 40, six others 5 each), 197 files, 10.20 MB uncompressed / 10.09 MB zipped, with
80 hashed renditions and 8 woff2 subsets generated as incompressible seeded bytes.

The pipeline it runs is the one **as decided**, not the one the spike ships: AD-5 numeric entities,
AD-4's splice-after-serialization, R2-5's substitute-last-over-the-file-tree, R2-7's unforgeable
token and R1 decision 7's nested repeats.

### 14a. The budget

| stage | §2 claimed | host · node 22 · 4 cores | **node 24 · 2 GB · 1 vCPU** | node 24 · musl · 1 vCPU |
| --- | --- | --- | --- | --- |
| render + serialize (70) | 770 ms | 1046 ms | **1422 ms** | 1768 ms |
| per section | 11.0 ms | 14.9 ms | **20.3 ms** | 25.3 ms |
| assemble | 14 ms | 38 ms | **42 ms** | 78 ms |
| substitute user text | *(not measured)* | 8 ms | **16 ms** | 9 ms |
| FR-J17 quality gate | 700 ms | 984 ms | **1554 ms** | 1738 ms |
| zip | 222 ms | 240 ms | **260 ms** | 264 ms |
| gscan 4.49.7 + 6.4.2 | 305 ms | 493 ms | **641 ms** | 816 ms |
| **total** | **~2.0 s** | **~2.8 s** | **~3.9 s** | **~4.7 s** |
| peak RSS | 289 MB | 454 MB | **486 MB** | 456 MB |

**AD-11's decision survives; its headroom does not.** Against `maxDuration: 300` and
`memory: 2048` the worst measured case is **~4.7 s and 486 MB** — **~64x duration** and **~4.2x
memory**, where AD-11 states ~140x and ~7x. §7.1's gscan-boundary split still does not trigger and
is still not built. The same caveat §2 carries applies unchanged: the fixture reads no Storage bytes
and subsets no fonts, so the real function pays more than this.

**`substitute user text` is a stage §2 never had.** R2-5 made it one, and it is cheap only if it is
a single regex pass — the first implementation looped one replace per marker over every file and
cost **289 ms**, 36x the corrected 8 ms.

### 14b. Three defects that only appear once the decided pipeline is actually run

None of these is visible on a two-section fixture, which is why two rounds did not see them.

1. **Token resolution must run in REVERSE insertion order.** Repeats are processed deepest-first
   (R1 decision 7), so an inner repeat's tokens are inserted *before* the outer replacement that
   carries them into the string. Forward order — what `spike-compiler/compile.js` does — substitutes
   the inner tokens before they exist, and **ten `partials/*.hbs` shipped raw `\u0001N\u0002` tokens**.
2. **User-text substitution must be one regex pass, never a loop of per-marker replaces.** A loop
   re-scans its own output: a user who types the marker shape for slot 0 inside the text of slot 3
   gets that shape written into the file *after* slot 0 was processed, and it ships raw. Escaping
   cannot save this, because the marker is not made of escapable characters.
3. **The escaper must strip the marker delimiters.** R1 decision 6 calls for "a marker shape escaped
   user text can never contain" — true only if the escaper removes it. Two files shipped delimiters
   straight through until the escaper dropped C0 controls.

### 14c. The two-checker verdict, on a real fixture

    Ghost 5.x  via gscan 4.49.7 (v5)  ->  ERRORS 0  WARNINGS 0
    Ghost 6.x  via gscan 6.4.2 (v6)   ->  ERRORS 0  WARNINGS 0

§13c's scope limit is lifted: the pair costs **493–816 ms** on the 197-file theme rather than the
57.5 ms measured on the two-section spike, and the split is still not a budget risk.

**`GS050-CSS-KGWF` is an ERROR on both majors even under `card_assets: true`** — a theme that never
styles `.kg-width-wide` and `.kg-width-full` scores 1 error on 4.49.7 *and* 6.4.2. It is not in
§13d's exclusion arithmetic, because it fires without any exclusion at all. E6 and E7 both need it.

**gscan does catch an unresolvable partial reference** — `{{> "sections/index/does-not-exist"}}`
scores `GS005-TPL-ERR`, an error on both majors. It does **not** catch an orphan partial, which is
AD-34's assertion and remains so.

### 14d. AD-14 determinism across environments

The 197-file tree is **byte-identical** — `sha256 b442dfa9f6bf23af…` over `find … | sort | xargs
sha256sum` under `LC_ALL=C` — across four environments: host (node 22.23.2, ext4, 4 cores), and
containers at node 22 glibc, **node 24 glibc** and **node 24 musl/alpine**, each 2 GB / 1 vCPU on
overlayfs. Two libc implementations, two Node majors, two filesystems, two CPU allocations.

**Residual CLOSED 2026-08-20 — three physically separate machines, one digest.** The same 197-file
tree, byte-identical, built on this workstation and on **two DigitalOcean droplets in Frankfurt**
(`DO-Regular` vCPUs, kernel 6.8.0-124, Node 22.23.2, different hardware and a different datacentre
from the reference machine and from each other):

    workstation          b442dfa9f6bf23afa16d7ce5717924a7bdfa60ebd6ed95c5cf45dcb9dab79ace   197 files
    droplet 178.128…187  b442dfa9f6bf23afa16d7ce5717924a7bdfa60ebd6ed95c5cf45dcb9dab79ace   197 files
    droplet 164.92…18    b442dfa9f6bf23afa16d7ce5717924a7bdfa60ebd6ed95c5cf45dcb9dab79ace   197 files

Together with §14d's earlier four environments that is **seven** — two libc implementations, two Node
majors, three filesystems, three CPU allocations and three physical machines. **AD-14 holds.**

**What remains untested, and it is now the only thing:** a **non-x86 architecture**. All three
machines are `x86_64`. An arm64 runner would exercise the one axis nothing here touches — and since
Vercel and most CI now offer arm, it is worth folding into the NFR-6(a) container image rather than
left as a note.

### 14e. AD-5 end-to-end on a full theme

The fixture plants five hostile strings in user text, including `C:\{{@site.title}}` — the case that
defeats every backslash rule (§3). Compiled with Handlebars 4.7.9 against a context binding
`site.title` and `title`: **zero live evaluations, zero parse failures**, and the browser's own
parser decodes every one back to the exact characters the user typed. `grep` finds no live `{{title}}`,
`{{@site.title}}` or `{{#if @member}}` anywhere in the emitted tree.

---

## 15. Executed against two real Ghosts · closes eleven §7.6 items · Round 3, real infra

First runtime evidence in this project's history. Every prior Ghost claim came from source
reading, gscan specs, or containers. `research-ghost-binding-contexts.md` §1179 states the gap
plainly: *"Nothing was executed at runtime … No Ghost 5 or Ghost 6 instance was booted to
observe actual rendering."* These are those instances.

**Targets** (§4's T3 and T1), both Ghost-CLI production installs — nginx, MySQL 8.0.46, systemd,
Let's Encrypt, Ubuntu 24.04.4, Node 22.23.2, 1 GB + 2 GB swap:

| | host | ghost | gscan | nql |
| --- | --- | --- | --- | --- |
| **T3** | `ghost5.inflozo.com` | **5.130.6** | **4.49.7** | **0.12.7** (nql-lang 0.6.3) |
| **T1** | `ghost6.inflozo.com` | **6.58.0** | **6.4.2** | **0.13.4** (nql-lang 0.7.0) |

Both bundle exactly the gscan pair §13 measured, so these verdicts are comparable to Round 2's.
Fixtures are identical on both boxes: 32 posts (12+12+8), 8 featured, 8 without a feature image,
6 tags all above the 3-post floor, 3 authors at 11/11/10, 57 members.
Harness: `tools/probe/` — `provision-ghost.sh`, `seed-ghost.py`, `run-verify-13.py`, `run-verify-all.py`.

### 15a. Item 13 — the four docs-vs-code conflicts, at runtime. **Identical on both majors; the code wins every time.**

**Conflict 1 — `@even`/`@odd` parity. The docs are wrong.** This is the one that blocks E9.

    ROW|index=0|number=1|even=false|odd=true |first=true |last=false
    ROW|index=1|number=2|even=true |odd=false|first=false|last=false
    ROW|index=2|number=3|even=false|odd=true |first=false|last=false
    ROW|index=3|number=4|even=true |odd=false|first=false|last=true

Parity tracks the **1-based `@number`**, not the 0-based `@index` — so **the first item is `odd`**.
`docs.ghost.org/themes/helpers/functional/foreach` says "`@even` — true if the `@index` is even",
which would make the first item even. A library authored against the docs zebra-stripes backwards
in every alternating design, and nothing but a human eye on a real site would catch it.

**Conflict 2 — helpers in error templates are permitted.** Inside a real 404, `error-404.hbs` ran
`{{statusCode}}`, `{{message}}`, `{{meta_title}}`, `{{@site.title}}`, `{{t}}`, `{{img_url}}` and a
live `{{#get}}` that returned rows. The docs' prohibition is a robustness recommendation, not a
constraint. *(The non-404 `error.hbs` path is still unexercised — triggering a genuine 5xx on a
healthy Ghost needs a deliberately broken template. Recorded as still open rather than covered.)*

**Conflict 3 — `@config` carries more than `posts_per_page`.** `@config.image_sizes.m.width` → `800`,
traversable. `posts_per_page` echoed the theme's own `7` rather than a platform default, which is
what proves the theme's config is being read.

**Conflict 4 — nested partial directories resolve.** `{{> "deep/nested/thing"}}` rendered from
`partials/deep/nested/thing.hbs`, three levels down.

### 15b. Item 11 — the paywall override point. **CONFIRMED, and it has a condition nobody knew about.**

`partials/content-cta.hbs` **does** replace Ghost's default `gh-post-upgrade-cta` at the
`{{content}}` cutoff, on both majors. The register calls refutation here "the highest-cost in the
list after 14(a)"; it did not happen.

**But the override only takes effect if the theme also references that partial explicitly from a
template.** Reproduced 2/2 each way, on both majors:

| theme contains | CTA rendered from |
| --- | --- |
| `partials/content-cta.hbs` alone | **Ghost's core default** |
| the same partial **plus** `{{> "content-cta"}}` in a template | **the theme's partial** |

Ghost registers `partialsDir: [core helperTemplates, theme partials]` and
`templates.execute('content-cta')` reads `handlebars.partials['content-cta']`, so the theme's copy
should always win — and without an explicit reference it does not. Dropping the partial in and
expecting it to work is the natural thing a theme author does, and it silently fails.
**Library rule for E7 and A32: the compiler emits an explicit `{{> "content-cta"}}` reference
whenever it emits the partial.** Not a convention — a compile assertion.

### 15c. Item 15 — what a theme may style inside `{{comments}}`. **Almost nothing.** Blocks E10's A28.

`{{comments}}` emits **exactly one element** and no DOM of its own:

    <script defer src="https://cdn.jsdelivr.net/ghost/comments-ui@~1.6/umd/comments-ui.min.js"
      data-ghost-comments="…" data-api="…" data-key="…" data-count="true" data-post-id="…"
      data-color-scheme="auto" data-avatar-saturation="60" data-accent-color="#FF1A75"
      data-comments-enabled="all" data-publication="Ghost6" crossorigin="anonymous"></script>

Three consequences, all binding on A28's ten designs:

1. **The thread is not server-rendered and not reachable by theme CSS.** A28 is confined to the
   chrome *around* the thread, exactly as AD-23's entry anticipated — now with evidence.
2. **It is third-party JavaScript from `cdn.jsdelivr.net`.** Any CSP a generated theme carries must
   allow that origin or the comments silently never appear, and it sits outside NFR-2's JS budget
   while still being on the page.
3. **It carries its own `data-color-scheme="auto"` and `data-accent-color` from Ghost's settings** —
   *not* from the Style Pack. So a dark-mode canvas and a live comment thread can disagree, and
   FR-D7's mode handling cannot reach it. That belongs on §1.2's carve-out list.

### 15d. Item 12 — API pagination. **The majors genuinely differ.**

| request | Ghost 5.130.6 | Ghost 6.58.0 |
| --- | --- | --- |
| `?limit=all` | echoes `all` | **echoes `100`** |
| `?limit=200` | echoes `200` | **echoes `100`** |

Ghost 6 caps server-side at 100 and silently rewrites the request; Ghost 5 applies no cap.
FR-H2's Count ceiling of 100 and its ban on `limit="all"` are both confirmed correct — and the
Ghost 5 half is confirmed *permissive*, so a design that over-fetches is invisible on 5.x and
capped on 6.x. The gate catches it either way: `GS090-NO-LIMIT-ALL-IN-GET-HELPER` and
`GS090-NO-LIMIT-OVER-100-IN-GET-HELPER` fired on the v6 spec and were absent from v5, independently
re-confirming VERIFY 33.

### 15e. Item 14c — the Template dropdown's label transform. **Closed.**

| filename | label Ghost derives | offered for |
| --- | --- | --- |
| `custom-member-home.hbs` | **`Member Home`** | `["page", "post"]` |
| `custom-two-word.hbs` | **`Two Word`** | `["page", "post"]` |

Strip `custom-`, split on hyphens, Title-Case each word, join with spaces. Identical on both majors.
§7.4's live filename-and-label preview can now show the true label. **Also newly recorded:** custom
templates are offered for **posts as well as pages**, which FR-I1's page-binding flow assumed was
pages only.

### 15f. Item 18 — `{{total_members}}`. **The PRD's rule is wrong below 51.**

Executed at two counts on both majors:

| members | renders |
| --- | --- |
| 45 | **`45`** — exact, no rounding, **no `+`** |
| 57 | **`50+`** |

`prd.md` says the value is "a string, always, since Ghost rounds it down and appends `+`". Read from
`core/frontend/utils/member-count.js`, the brackets are: **≤ 50 exact**; 51–100 round to 10;
101–1,000 to 50; 1,001–10,000 to 100; 10,001–100,000 to 1,000; above that `humanNumber` lowercased.
Every Inflozo user starts under 51, so **the common case is the one the PRD gets wrong** — a design
that hard-codes an "N+" shape is wrong for essentially every new site.

**And the two majors compute the total differently:**

| | Ghost 5 | Ghost 6 |
| --- | --- | --- |
| `total` | `free + paid + comped` | `free + paid + comped + **gift**` |
| at ≤ 50 | returns a raw **number** | returns a comma-formatted **string** |

A site with gift subscriptions reports a different member count on the two majors. `md5sum` of that
file differs between the boxes — checking rather than assuming "same helper, same behaviour" is what
surfaced it.

### 15g. Item 20 — the NQL build Ghost resolves. **Neither major runs what FR-I2 was proved against.**

`prd.md` records FR-I2's two normative rules as "proved against `@tryghost/nql@0.13.x`, not against
Ghost's resolved build." Resolved builds:

- **Ghost 5.130.6 → nql 0.12.7** (nql-lang 0.6.3)
- **Ghost 6.58.0 → nql 0.13.4** (nql-lang 0.7.0)

So the proof covers Ghost 6 and **never covered Ghost 5**, which NFR-7 supports publicly and T3
tests permanently. This is AD-34's pattern for the third time — the version a major *bundles*
differing from the version a claim was proved against, after gscan and `member-count.js`.

**Executed at runtime, both majors, identical results — no defect reproduced:**

    NQL|relative_date  filter="published_at:>=now-30d"                 -> 1 row
    NQL|nested_parens  filter="(tag:craft+featured:true),(tag:systems)" -> 5 rows
    NQL|inner_group    filter="tag:craft+(featured:true,featured:false)"-> 5 rows

Both relative dates and nested parentheses work on 0.12.7 and 0.13.4. FR-I2's rules hold on both —
but they now hold on *observed* grounds rather than on a version that neither major runs.

### 15h. Items 2, 3, 9, 21 — closed in passing

- **Item 2 · `hostSettings` is ABSENT on self-hosted**, both majors. `GET /admin/config/` returns
  `clientExtensions, database, emailAnalytics, … , version` and no `hostSettings` key at all, so
  FR-C2's probe must treat **absence** as "not Ghost(Pro)" rather than reading a flag. The
  Ghost(Pro) half stays blocked behind the Starter trial, deliberately.
- **Item 3 · the host's theme-upload ceiling is 1 GB, not 50 MB.** Ghost-CLI writes two different
  values, and the operative one is on the SSL vhost every real deploy uses:
  `ghost<N>.inflozo.com.conf → client_max_body_size 50m` but
  `ghost<N>.inflozo.com-ssl.conf → client_max_body_size 1g`. ~100× headroom over the 10.09 MB stress
  theme. This is the answer for a Ghost-CLI self-hosted box only; Ghost(Pro) will differ.
- **Item 9 · the Owner's Staff Access Token DOES lift `GET /themes/`**, both majors — and the
  integration token does not, with **different rejections per major: 501 on Ghost 5, 403 on Ghost 6.**
  AD-24's mapping table must fold both into one Inflozo code, or the same cause produces "server
  does not support this" on 5.x and "no permission" on 6.x. Confirmation is worth more than the
  register expected: FR-J10's uniqueness no longer rests on `project_site_bindings` alone, and
  FR-J13's snapshot and FR-J16's drift check both gain a working primary path.
- **Item 21 · all three announcement settings are readable** through the Admin API with the staff
  token — `announcement_content`, `announcement_visibility` (a JSON string, `"[\"visitors\"]"`),
  `announcement_background`. FR-C4's seed is executable as designed.

### 15i. Method note — creating authors without invitations

Ghost's `/users/` endpoint cannot create staff, only invite them, which needs working email. **The
Universal Import endpoint can:** `POST /db/` with a `users` payload creates staff users directly, no
invitation and no acceptance, landing as `status=locked` with the role given. Plus-addressing
(`umngkmr+priya@gmail.com`) satisfies the `users_email_unique` index from one real inbox. This
unblocks A21 and A12 #9 fixtures far earlier than assumed.

### 15j. One `error.hbs` serves every error, and gscan is not advisory at upload

**The error-template hierarchy, read from `core/frontend/services/rendering/templates.js:23-34`:**

```js
getErrorTemplateHierarchy(statusCode)  ->  ['error-' + code, 'error-' + code[0] + 'xx', 'error']
```

So `error.hbs` is Ghost's own final fallback for **every** status. A theme needs no
`error-404.hbs` and no per-status variants unless it wants them.

**Executed on both majors with a single `error.hbs` and no other error template:**

| trigger | status | `error.hbs` rendered |
| --- | --- | --- |
| missing route | **404** | yes |
| a partial missing at render time | **400** | yes |

Helpers work in both cases and on both majors — `{{statusCode}}`, `{{message}}`, `{{meta_title}}`,
`{{@site.title}}`, `{{t}}`, `{{img_url}}` and a live `{{#get}}` returning rows. This closes the half
of item 13's conflict 2 that §15a left open: the docs' "error templates shouldn't use any theme
helpers" is a recommendation on **every** error path, not only on `error-404.hbs`.

**Note the status:** a render failure surfaces as **400, not 500** — Ghost classifies it as an
`IncorrectUsageError`. `{{statusCode}}` therefore carries `400` and `{{message}}` carries the
underlying template error verbatim: `[custom-boom.hbs] The partial boom could not be found`.
**That message is shown to visitors**, so an emitted theme must never rely on a partial it does not
ship — the failure is public, not silent. AD-34's orphan-partial assertion covers the reverse case;
this is the one it does not.

**And a correction to a Round 2 reading.** §13a records that Ghost 5 "activates the theme anyway"
despite a gscan error, and that is true for `GS110`. It is **not** true in general. A theme carrying
`GS005-TPL-ERR` was **rejected at upload**, on both majors:

    HTTP 422  type=ThemeValidationError
    message : Theme "inflozo-probe-all" is not compatible or contains errors.
      error : GS005-TPL-ERR — Templates must contain valid Handlebars
              ref=custom-boom.hbs  The partial this-partial-does-not-exist could not be found

So gscan errors split into **fatal at upload** and **reported but activated**, and FR-J6 cannot
treat "Ghost accepts it anyway" as a general property. This also answers the hard half of item 10:
a theme that fails Ghost's own gscan is **not** always re-uploadable, so FR-J13's snapshot restore
must assume rejection is possible and surface the 422 detail rather than retrying blindly.

---

## 16. Real hosted Supabase · E1's exit criterion, D6's open probe, and F8 · Round 3

Project `adasbmxypwvnxznzzxwp`, PostgreSQL **17.6**, created with Supabase's **post-2026-05-30**
grant default (`authenticated` holds **no** table privileges in `public`). A second, older project
supplies the pre-cutover half. Reproduction:

    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f SCHEMA.sql -f RLS-TEST.sql

**`PRELUDE.sql` is omitted, and that is not optional.** It is a stand-in for a bare container, and
against a real project its `create or replace function auth.uid()` would **overwrite Supabase's own
implementation with one returning `NULL`** — silently disabling every policy in the schema while the
proof still reported PASS. Read from the live project before anything was applied, the platform's
own function is:

```sql
coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
         (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
```

Its **first branch is the exact setting `RLS-TEST.sql` already sets**, so impersonation is identical
on both targets and the stub was never needed. `RLS-TEST.sql` is now **dual-target rather than
forked** — it tests `has_schema_privilege(current_user, 'auth', 'CREATE')` and installs the
stand-ins only where it owns the schema — because two copies of one proof is the divergence this
project keeps finding.

### 16a. The result

| | container (Round 2) | **hosted (this run)** |
| --- | --- | --- |
| `SCHEMA.sql` | applies clean | **applies clean, `ON_ERROR_STOP`, 0 errors** |
| tables / policies | 30 / 34 | **30 / 34** |
| assertions | 36 PASS | **38 PASS, 0 FAIL, 0 psql errors** |

**Two things confirmed live that were previously only designed.** `auth.users = 2 → entitlements = 2,
profiles = 2`: R1 decision 14's `auth_user_entitlement` trigger fires on the real platform, so
AD-28's "an entitlements row is created at signup" stops being aspirational. And the four buckets of
§12 exist with `public = false`, carrying exactly the three policies the file installs.

### 16b. D6's open probe — answered, and the finding holds

`SCHEMA.sql` §12 printed, during the hosted apply:

    WARNING:  D6 NOT APPLIED: TRUNCATE remains granted on 4 storage grants. The grantor is
              supabase_storage_admin and this role cannot revoke it.

**Hosted `postgres` cannot perform the revoke either.** D6 was written to *attempt and report* rather
than assume, which is the only reason this surfaced as a visible warning instead of a migration that
looks clean and protects nothing. The control that actually holds is the one `RLS-TEST.sql` now
asserts, independently confirmed over HTTP: **`storage` is not a PostgREST-exposed schema** —
`GET /rest/v1/buckets` with the publishable key returns **404**, which also refutes the reachability
half of Round 3's **F3** on the real platform.

### 16c. F8 — CONFIRMED. The only sanitizer in the product is advisory.

Executed with a **real end-user JWT** (publishable key + password grant), never the secret key:

| target | result |
| --- | --- |
| `assets/{own}/evil.svg` | **ACCEPTED — HTTP 200** |
| served back through a signed URL | **`<script>` present: true · `@import` present: true · byte-identical** |
| `assets/{another user}/evil.svg` | denied — *new row violates row-level security policy* |
| `suggestion-images/{own}/evil.svg` | **ACCEPTED — HTTP 200** |
| `deploy-artifacts/{own}/evil.svg` | denied — RLS, no policy |
| `site-snapshots/{own}/evil.svg` | denied — RLS, no policy |

The conventions row says "an uploaded SVG is sanitized with DOMPurify". AD-12 puts that pass **in the
browser**; AD-32 lets the browser write the bucket **directly**. A client that declines to run it
uploads raw bytes and **nothing server-side ever sees the file**. Sanitizer placement is not a
hardening detail — it is the entire property.

**The containment holds, and that bounds the severity.** Folder scoping and the no-policy deny
mechanism both work on real Supabase, so `assets/` is self-XSS on the storage origin rather than a
cross-tenant hole. **`suggestion-images/` is the exception** — FR-M3 approves those onto a public
board, so one user's unsanitized file reaches every visitor. Round 3 decision **D4** already puts
server-side re-sanitization on exactly that bucket; this is the evidence it was the right call
rather than a precaution.

**One unplanned finding, and it needs writing down before E13.** Signing a URL for
`suggestion-images` returns **HTTP 400** while `assets` signs fine: §12 gives that bucket `insert`
and `delete` policies and **no `select` policy**, so the owner can write a file and then cannot read
it back. That is consistent with the design ("write your own; nobody reads directly"), but it means
**the server route that mints the signed URL for the public board must use the service key**, and no
AD says so. E13 builds that reader over this.

---

## 17. Vercel Fluid, executed · closes R1 decision 11 · **AD-11's memory headroom is wrong**

Round 1 finding 5 — *"Vercel Fluid shares one instance across concurrent invocations; `memory: 2048`
is the INSTANCE budget"* — was **read from Vercel's docs and never executed**. R1 decision 11 said to
measure it during E0. This is that measurement, on a real Pro project (`inflozo-probe`, `iad1`).

Probe: a Node function holding a module-scope instance id, an invocation counter, a live concurrency
counter and an optional retained allocation. Two invocations reporting the same id ran in the same
instance — that is the whole experiment. Runtime **Node v24.18.1**, matching the Stack table's pin.
`AWS_LAMBDA_FUNCTION_MEMORY_SIZE` is unset, so Fluid is not classic Lambda.

### 17a. Both halves of Round 1's claim, judged separately

**Half one — "shares one instance across concurrent invocations": TRUE, but not as stated.**

| burst | distinct instances | max co-located on one |
| --- | --- | --- |
| 5 concurrent | **4** | 2 |
| 20 concurrent | **13** | 4 |
| 40 concurrent (300 MB each) | **40** | 1 |

Fluid **does** co-locate — up to **4** concurrent invocations on one instance were observed. But it
also **scales out**, and under a 40-way burst it gave every invocation its own instance. So the
pessimistic reading Round 1's wording invites — *all* concurrency landing on one instance — does not
happen. Co-location is real, bounded, and load-dependent.

**Half two — "`memory: 2048` is the INSTANCE budget": CONFIRMED, decisively.**

Sequential invocations, each allocating 250 MB and **retaining** it at module scope, all landing on
one warm instance:

    invocation #2   RSS   608 MB
    invocation #3   RSS   859 MB
    invocation #4   RSS  1109 MB
    invocation #5   RSS  1359 MB
    invocation #6   RSS  1610 MB
    invocation #7   RSS  1860 MB
    invocation #8   HTTP 500  — killed, between 1860 MB and ~2110 MB

Memory accumulates across invocations on a warm instance, is **not** reclaimed between them, and the
instance dies at the 2 GB line. The platform recovers immediately on a fresh instance (next request:
57 MB, invocation #1), so the failure is one lost request, not a lasting outage.

### 17b. What this does to AD-11 — the headroom is not what §14 says

§14 measures **486 MB peak RSS** for one compile of the 40-section stress fixture, and reads that as
**~4.2× memory headroom** against `memory: 2048`. That number silently assumes one compile per
instance. It is now measured that up to **4 concurrent invocations share one instance's 2 GB**:

    4 concurrent compiles x 486 MB  =  1,944 MB  against a 2,048 MB instance budget  =  95%

**The real headroom against concurrent deploys is roughly 4 compiles, not 4.2x of anything** — and
the fifth co-located compile is an OOM, which §17a shows arrives as an HTTP 500 on a request that
already told the user their deploy started.

This is not hypothetical for this product. Deploys are exactly the bursty path: §4's Definition of
Done runs **30 serialized starter deploys** across T1–T3, FR-J11 permits **10 deploys per hour per
site**, and a Pro user holds **25 projects**. Three or four overlapping compiles is an ordinary
Tuesday, not a stress case.

**What is NOT concluded here:** that AD-11's decision is wrong. `maxDuration: 300` is confirmed as
the real Pro default (`functionDefaultTimeout: 300`, read from the project's own resource config),
Fluid is **on by default** for new projects (`fluid: true`), and §7.1's gscan-boundary split still
buys nothing. What changes is that **memory headroom must be stated per instance under concurrency,
not per compile** — and on that basis the margin is thin enough to need a decision rather than a
footnote.

**Also worth keeping:** memory is retained between invocations on a warm instance unless the code
releases it. AD-1's ban on module-level mutable state in the core is what keeps the compile from
accumulating across invocations — a rule adopted for determinism that turns out to carry a memory
consequence nobody had connected to it.

### 17c. Method note

`peakConcurrentOnThisInstance` in the first probe was a **cumulative** counter and therefore reported
stale peaks from earlier bursts; the co-location figures above are taken from live concurrency and
from RSS, not from that counter. Recorded because the first reading of the 40-way burst looked like
4-way co-location with 300 MB allocations, and it was not.

### 17d. Does 4 GB cost more, and does it buy CPU? Measured.

**It buys no CPU.** Identical CPU-bound work, same code, same region, five runs each:

| memory | median | cores reported |
| --- | --- | --- |
| 2048 MB | **1,992 ms** | 2 |
| 4096 MB | **1,892 ms** | 2 |

~5% apart, inside run-to-run variance, and **both sizes already report 2 cores**. An earlier note in
this session claimed 4 GB brings a second vCPU and would roughly halve compile time; that is **false**
and is corrected here rather than quietly dropped. Node's JavaScript is single-threaded, so a second
core would not have halved it in any case.

**It costs more, and the amount is trivial.** Fluid bills **Active CPU at $0.128/hour — only while
code actually runs, I/O wait is free** — and **Provisioned Memory at $0.0106/GB-hour**
(`vercel.com/docs/functions/usage-and-pricing`, read 2026-08-20). With duration unchanged, only the
memory reservation doubles:

| per compile (~4 s) | 2 GB | 4 GB |
| --- | --- | --- |
| provisioned memory | $0.0000236 | $0.0000471 |
| active CPU | $0.000142 | $0.000142 |
| **total** | **$0.000166** | **$0.000189** |

**+14% of a deploy's compute — about 2 cents per thousand deploys, $2.30 per hundred thousand.**
Against Appendix F's blended **$12.61/month net per Pro customer**, a user deploying ten times a day
pays about **5.7 cents/month** in compile at 4 GB against 5.0 at 2 GB. **No Appendix F break-even
moves**, so G7's 11–15-subscriber cash break-even and the 160–180 payback are unaffected.

---

## 18. The Next 16 CSP, executed · closes R1 decision 5 · deferred through three rounds

NFR-3's per-session CSP and R1 decision 5 — *"two CSP policies: nonce-based on `app.inflozo.com`,
static on `inflozo.com`"* — were carried by Rounds 1, 2 and 3 without ever being run. Round 1
finding 6 stated the hazard: *"Next 16 CSP requires nonce + `strict-dynamic`; nonces force dynamic
rendering"*, which reads as a collision with the marketing site being SSG. This is that test: a real
Next **16.3.1** app, built locally and deployed to Vercel Pro (`iad1`).

**Item 25 confirmed from Next's own source**, not from the blog post it was originally cited to.
`next/dist/lib/constants.js` in 16.3.1 declares **both**:

    MIDDLEWARE_FILENAME = "middleware"      MIDDLEWARE_LOCATION_REGEXP = "(?:src/)?middleware"
    PROXY_FILENAME      = "proxy"           PROXY_LOCATION_REGEXP      = "(?:src/)?proxy"

### 18a. The finding that dissolves the collision

`next build` route manifest, with `proxy.ts` setting a CSP on **every** route:

    ┌ ○ /            <- marketing. STATIC, and it receives a CSP
    ├ ○ /_not-found
    ├ ƒ /editor      <- app. DYNAMIC, because it READS the nonce
    └ ○ /frame       <- STATIC
    ƒ Proxy (Middleware)

**Setting a CSP header in `proxy.ts` does not force dynamic rendering. Reading the nonce does.**
Round 1 finding 6 is correct on both clauses, but the operative distinction is between *emitting* the
header and *consuming* it in the page — and only the second costs prerendering. The marketing site
therefore keeps SSG **and** carries a CSP; it simply carries one without a nonce. R1 decision 5's
split is not a workaround for a collision, it is the shape the framework already wants.

### 18b. Two policies, one deployment — verified on Vercel

| | `/` (marketing branch) | `/editor` (app branch) |
| --- | --- | --- |
| `x-vercel-cache` | **PRERENDER** | MISS |
| `cache-control` | `public, max-age=0, must-revalidate` | `private, no-cache, no-store` |
| `script-src` | `'self'` | `'self' 'nonce-…' 'strict-dynamic'` |
| `connect-src` | *(default-src)* | `'self' https://ghost5… https://ghost6…` |
| `frame-ancestors` | `'self'` | `'self'` |

**`x-vercel-cache: PRERENDER` while serving a CSP** is the whole answer to the SSG question, on the
real platform rather than in a build manifest.

**The nonce is genuinely per-request.** Two consecutive requests to the same deployment:

    nonce="NzFmODdhMTAtNmMxZS00MjY5LTljNjktZjQyMTdlZjY5NTAx"
    nonce="YTUzZTUyM2ItNzNlZC00NGFmLTg0NTItMWJhMTk0NDg5ODlk"

and locally the nonce in the `content-security-policy` header was confirmed to **match the nonce
attribute in the delivered HTML** — the `proxy.ts` → `x-nonce` request header → `headers()` path
works end to end. A nonce that did not match would fail silently: the policy would look correct and
every inline script would be blocked.

**Host routing works from one deployment.** `Host: inflozo.com` returned `x-inflozo-policy:
marketing-static`; `Host: app.inflozo.com` returned `app-nonce`. That is §7.1's "two domains, one
deployment" exercised rather than assumed.

**`frame-ancestors 'self'`** is emitted on the iframe host page, which is what AD-21's same-origin
editing canvas needs and why NFR-3 chose it over `'none'`.

### 18c. What this does NOT prove — stated because the gap is the interesting part

The probe is a minimal app: three routes, one inline script. It establishes the **mechanism** —
two policies, one deployment, per-request nonce, SSG preserved, Node runtime. It does **not**
establish that the real editor runs under `script-src 'self'` with **no `'unsafe-eval'`**. That
claim rests on §7.1's "there is no Handlebars runtime in the browser" and on nothing in the editor
calling `new Function`, and it stays unproven until E5 has a canvas to test. The conventions row
should be read as a requirement on E5, not as a verified property.

---

## 19. Dodo, executed in test mode · closes VERIFY 6 · **FR-L2 refuted, and AD-7 has a hole**

Real Dodo test-mode account, real API, real webhooks delivered to a Vercel receiver that writes into
the **actual `billing_events` table** — deliberately, so FR-L2's schema meets genuine payloads rather
than invented ones. Base URL `https://test.dodopayments.com`.

### 19a. The event catalogue — 47, not 7

Read from the registered endpoint's own `filter_types`:

| group | n | group | n |
| --- | --- | --- | --- |
| `subscription.*` | **11** | `credit.*` | 9 |
| `dispute.*` | 7 | `payout.*` | 5 |
| `payment.*` | 4 | `entitlement_grant.*` | 4 |
| `abandoned_checkout.*` | 2 | `dunning.*` | **2** |
| `refund.*` | 2 | `license_key.*` | 1 |

**All seven events FR-L2 names exist.** The problem is the other forty.

### 19b. ⚠️ `subscription.cancelled` EXISTS. FR-L2 says it does not.

FR-L2 states, as normative text:

> *"There is **no documented `subscription.cancelled`**: cancellation is detected from
> `subscription.updated` plus a direct read of the subscription, never inferred from an event name
> that does not exist."*

Executed — a real subscription cancelled through the API, and Dodo delivered, signature-verified:

    subscription.cancelled   sig_ok=true
    subscription.updated     sig_ok=true

**This is the project's named failure mode, fifth instance:** an unverified claim about an external
platform entering as normative text, with a confident *reason* attached that stops anyone
re-examining it. FR-L2's cancellation path does an extra API read it does not need, and the sentence
asserting why must be struck rather than softened.

### 19c. Three more gaps in FR-L2's state machine

1. **`dunning.started` / `dunning.recovered` exist.** FR-L2 infers the 7-day grace and `pro_past_due`
   from `payment.failed`. Explicit dunning events are a better signal, and `dunning.recovered` maps
   directly onto the `pro_past_due → pro_active` transition currently derived by inference.
2. **Five `subscription.*` events are unhandled:** `expired`, `paused`, `unpaused`, `plan_changed`,
   `update_payment_method`. **`paused`/`unpaused` is the one that matters** — AD-28's resolver has
   `free | pro_active | pro_past_due` and **no state for a paused subscription**, so a paused customer
   resolves to whatever the last event left behind.
3. **`dispute.*` has seven events, FR-L2 uses one.** It moves `pro_active → free` on dispute opened
   and leaves restoration manual (`restored_by`, `restored_reason`). **`dispute.won` exists** and
   could drive that restoration instead of a human.

### 19d. ⚠️ AD-7's server-only tables are unreachable by the service role

The receiver's write was refused with the **secret key**:

    ERROR: permission denied for table billing_events   (42501)
    HINT:  GRANT SELECT, INSERT ON public.billing_events TO service_role;

    billing_events -> service_role:  REFERENCES, TRIGGER, TRUNCATE      <- no SELECT/INSERT

AD-7 says these tables are *"reachable **only by the service role** inside a server route."* On real
Supabase the service role **cannot reach them at all**. `SCHEMA.sql` §11a(7) grants AD-7's tables
"NOTHING", and that "nothing" landed on `service_role` as well as on `anon`/`authenticated`.
**FR-L2's webhook handler cannot store the payload it exists to store**, so the `entitlements` state
machine has no input.

Invisible until now because `PRELUDE.sql` never creates a `service_role`. Note RLS was never the
obstacle — `service_role` carries `bypassrls = true`; the missing **table grant** was. Same shape as
Round 1's "a view is not access control while the table grant stands", arriving from the other side.
Fix applied to the live project and required in `SCHEMA.sql`:
`grant select, insert on public.billing_events, public.site_credentials to service_role;`

### 19e. A webhook handler that returns 200 on a failed store loses the event forever

The receiver was written to always return 200 so Dodo would not retry indefinitely. Consequence:
when 19d's grant error hit, `payment.succeeded` and `subscription.active` were **acknowledged and
discarded**, and Dodo never redelivered them. Only the later cancellation was captured, after the
grant was fixed.

**Binding on E12:** FR-L2's handler must return a **non-2xx** when it cannot persist, so the
provider retries. Idempotency is what makes that safe, and `billing_events.dodo_event_id` is already
the unique key for it — the design was right and the handler's error path was wrong.

### 19f. Merchant-of-record tax handling, observed

A product priced **1500 USD** with a GB billing address was charged as:

    recurring_pre_tax_amount  1100 GBP        tax  220 GBP        total  1319 GBP
    settlement_amount         1319 GBP        settlement_currency GBP

Dodo converted the currency **and computed 20% UK VAT itself** — 1100 x 0.20 = 220, exactly. That is
FR-L1's "Dodo as merchant of record, taxes handled by Dodo", observed rather than assumed.
**`settlement_amount` equals `total_amount` here, so the API does not expose Dodo's own fee at the
payment level** — item 5's fee schedule is a dashboard/agreement fact, not an API one.

### 19g. No renewal-reminder event exists

Nothing among the 47 matches `remind`, `upcoming` or a pre-renewal notice; the nearest are
`subscription.renewed` (after the fact) and the two `dunning.*` events (after a failure).
**This is suggestive, not conclusive** — an email need not have a webhook. VERIFY item 6's statutory
half still needs a written answer from Dodo support, and if the answer is no, FR-P1 grows a sixth
email that E12 must build.

### 19h. The fee schedule, from one real transaction · VERIFY item 5

Owner-supplied, from the Dodo payment record for the test subscription:

    charged to the customer   £13.19
    VAT (Dodo remits)         £2.20     = exactly 20% of the £10.99 pre-tax -> UK VAT
    Dodo fee                  £1.09
    net to the merchant       £9.90

    fee as % of PRE-TAX revenue   9.92%
    fee as % of gross charged     8.26%
    merchant keeps                90.1% of pre-tax revenue

**Merchant of record confirmed by the owner**, consistent with §19f's observation that Dodo computed
and collected the VAT itself.

**What one data point cannot establish, stated because it is the load-bearing unknown.** A fee of
`rate x amount + fixed` has many solutions through a single observation — £0.20 fixed implies 8.10%,
£0.40 implies 6.28%, £0.60 implies 4.46%. **The fixed component is exactly what makes Appendix F's
60/40 yearly/monthly mix matter**, because a yearly customer pays it once and a monthly customer pays
it twelve times. It is undetermined and a second observation at the annual price would settle it.

### 19i. Appendix F recomputed — the break-even is robust to that uncertainty

Appendix F assumes Pro at **$15/mo or $150/yr**, a **60/40 yearly/monthly** mix, and a blended net of
**$12.61/mo** per Pro customer.

| fee structure | monthly net | yearly net /mo | **blended** |
| --- | --- | --- | --- |
| Appendix F's assumption | — | — | **$12.61** |
| observed 9.92% applied flat to both *(worst case)* | $13.51 | $11.26 | **$12.16** |
| 5.5% + $0.50 | $13.68 | $11.77 | **$12.53** |
| 6.3% + $0.40 | $13.65 | $11.68 | **$12.47** |
| 4.5% + $0.60 | $13.72 | $11.89 | **$12.62** |

Applying the observed rate flat to both plans is the **pessimistic** reading — it charges any fixed
component twelve times over on the annual plan — and even then the blended figure is **$12.16, only
3.6% below** Appendix F's number. Every plausible rate/fixed split lands between **$12.16 and $12.62**.

**Cash break-even moves from 11–15 Pro subscribers to ~11–16.** G7's payback range of 160–180 shifts
by well under one subscriber. **Appendix F stands, and the fee-structure ambiguity does not need
resolving before E12** — it should be settled with a second observation at the annual price when one
naturally occurs, not chased now.

**Recorded as provisional:** one transaction, GBP, credit card, UK VAT, on a USD-priced product that
Dodo currency-converted. A US or EU card, or a same-currency charge, may differ.

---

## 20. VERIFY item 4 — the Supabase passkey API. **Present, and disabled by default.**

§7.6 item 4 asks for "Supabase passkey API status and `supabase-js` ≥ 2.105.0 behaviour". Item 28
established that the WebAuthn surface landed in `@supabase/auth-js` **2.75.0**, well below the PRD's
floor, and explicitly left open "whether the Beta API is *usable*". This closes that.

**The client half is real.** `@supabase/supabase-js@2.112.3` resolves `@supabase/auth-js@2.112.3`,
whose `GoTrueClient` carries a full WebAuthn vocabulary — `webauthn`, `passkey`, `passkeys`,
`credential_options`, `credential_response`, `webauthnAbortService`, `credentialError` — and lists
`'webauthn'` alongside `'totp'` and `'phone'` as an MFA factor type.

**The server half exists and is switched off.** Against the live project, as a signed-in user:

    POST /auth/v1/factors  {"factor_type":"webauthn"}
      -> 422  mfa_webauthn_enroll_not_enabled  "MFA enroll is disabled for WebAuthn"

    POST /auth/v1/factors  {"factor_type":"totp"}          <- the control
      -> 200  factor created, QR returned

    GET /auth/v1/settings  ->  passkeys_enabled: false

The TOTP control matters: the endpoint, the session and the enrolment flow all work, so the 422 is
**WebAuthn specifically being disabled**, not a broken probe. `passkeys_enabled: false` is a
**project setting**, not a missing capability — so this is a switch, not a gap.

**Consequence, and it is the one §7.6 predicted:** FR-A2's `passkeys` feature flag stays off and
magic link remains primary, so nothing else moves. **One thing to add for E2, which the register did
not anticipate:** there are now **two** switches — Inflozo's `feature_flags.passkeys` row *and*
Supabase's project-level `passkeys_enabled`. If they disagree the user is offered a passkey flow the
platform will refuse with a 422. **E2 must read the platform setting, not only its own flag**, or the
flag's whole purpose — turning the feature off without a redeploy — is defeated from the other side.

**Still unexecuted, and honestly so:** a complete enrolment and assertion round trip needs a browser
and a real authenticator. What is established is that the API is present, the client supports it, and
it is off by default — which is what item 4 asked.

---

## 21. Round 4 — attack & performance, executed against the live estate · 2026-08-20

Real end-user JWTs (publishable key + password grant), never the secret key except where the secret
key IS the subject. Two tenants A/B. Every line is a PostgREST/Admin-API call, not reasoning.
Probes: `scratchpad/attack_supabase*.py`, `attack_board.py`, `attack_ghost_accent.py`,
`rls_perf2.sql`, `deploy_timing.py`, `visitor.py` (session scratch; verdict-only, no secrets printed).

### 21a. Public board — self-approval and forgery AT INSERT (F1, HIGH)
`authenticated` holds INSERT on **all** columns of `suggestions` (verified via
`information_schema.role_column_grants`: INSERT covers `image_approved, vote_count, status, hidden,
merged_into, …`). The RLS insert policy checks only `user_id = auth.uid()`. Executed, tenant B:

    POST /rest/v1/suggestions {image_approved:true, vote_count:99999, status:'shipped', image_path:…}
      -> HTTP 201
    (anon) GET /rest/v1/suggestions_public?id=eq.<sid>
      -> {"status":"shipped","vote_count":99999,"image_path":"suggestion-images/<B>/evil.svg"}

The FR-M3 admin approval gate, the vote count and the roadmap status are all client-set at creation.
Chains with §16c/F8 (raw `<script>` SVG lands in `suggestion-images` byte-identical, re-confirmed this
run) → an attacker's unsanitized image reaches every board visitor with no admin in the loop.

### 21b. Owner policy authorizes by the child's own user_id, never the parent (F2, HIGH, systemic)
The uniform AD-6 policy is `user_id = (select auth.uid())` with no parent-ownership check. Tenant A,
against tenant B's project id:

    POST /rest/v1/project_templates {project_id:<B's project>, user_id:<A>, template_key:'home', doc:{}}
      -> HTTP 201   (row created, attached to B's project)
    POST … {project_id:<random uuid>, …}
      -> HTTP 409 code 23503 (foreign_key_violation)

So a client can (a) attach child rows to **another tenant's project** and (b) use the FK error as a
cross-tenant existence oracle. A server route that reads a project's children by `project_id` alone
under `service_role` (bypassrls) ingests the foreign row — cross-tenant compile/theme injection.
Bounded by UUID unguessability of `project_id`.

### 21c. Whole-row INSERT grants defeat the narrowed UPDATE grants (F3, MEDIUM, systemic)
`§11` narrows UPDATE column-by-column; INSERT stays whole-row. Executed:

    POST /rest/v1/assets {bytes:9999999, stored_bytes:1, …}  -> HTTP 201  (meter understated at rest)
    PATCH /rest/v1/assets?id=eq.<id> {stored_bytes:5e8}      -> HTTP 403  (UPDATE correctly locked)

`assets.stored_bytes` (FR-K3 meter → quota evasion), `edit_locks.lock_generation` (arbitrary initial
value) and the F1 columns are all the same class. One fix — column-narrow the INSERT grants, or a
BEFORE INSERT trigger that resets server-asserted columns — closes all of them.

### 21d. edit_locks holder reseated without advancing lock_generation (F4, MEDIUM) — R3 §2.4, still open
    POST  /rest/v1/edit_locks {holder:'device-1', lock_generation:5} -> 201
    PATCH /rest/v1/edit_locks {holder:'device-2-SEIZED'}             -> 200, holder=device-2 at gen STILL 5
    PATCH /rest/v1/edit_locks {lock_generation:1}                    -> 403 (monotonic trigger HELD)
    PATCH /rest/v1/edit_locks {user_id:<B>}                          -> 403 (identity frozen HELD)

AD-15 detects takeover from the generation advancing; a reseated holder at the same generation is a
split-brain the displaced device never notices. R1 d32 deferred the protocol; it is still undecided.

### 21e. Decision B — accent_color is a CSS-injection channel (F5, MEDIUM), both Ghosts
`POST /ghost/api/admin/tags {accent_color:…}`, then read back. Ghost's validation is a loose char
filter, not a CSS validator — it rejects some payloads and passes others:

    '#ff0000; background:url(https://evil.example/track.png)'  -> 422 REJECTED (has space + //. )
    'red;}body{display:none'                                    -> 201 ACCEPTED verbatim
    '#fff" onmouseover="x'                                       -> 201 ACCEPTED verbatim
    'javascript:alert(1)'                                        -> 201 ACCEPTED verbatim
    '#fff;background:url(x)'                                     -> 201 ACCEPTED verbatim
    '#fff;width:100vw'                                           -> 201 ACCEPTED verbatim
    '#f00;/* c */color:red'                                      -> 201 ACCEPTED verbatim
    '#fff;position:fixed;inset:0;background:#000;z-index:99999'  -> 422 REJECTED

Emitted as `style="--tag-accent: {{accent_color}}"`, Ghost HTML-escapes `{{ }}` so `"`/`<` cannot
break the attribute or inject script, and inline styles cannot hold a selector — so the quote and
brace vectors are inert. What survives is **extra CSS declarations on the same tag element**
(layout/defacement/tracking). Actor E (controls the Ghost); blast radius is the customer's visitors.
Ghost's own filter is not a control Inflozo can rely on. Inflozo must strictly parse accent_color
(hex/rgb/hsl only) in ghost-shim before it reaches the custom property.

### 21f. AD-7 tables are on the PostgREST data API (F6, MEDIUM)
    (authenticated) GET /rest/v1/site_credentials -> 403 42501   (HELD)
    (authenticated) GET /rest/v1/billing_events   -> 403 42501   (HELD)
    (secret key)    GET /rest/v1/site_credentials -> 200, rows=1  <-- service_role reads it over REST,
                                                                       no server route involved

AD-7 reads "reachable only by the service role inside a server route". It is reachable by the service
role from anywhere PostgREST is exposed. A leaked secret key dumps every tenant's Vault references
over HTTP. Move `site_credentials`/`billing_events` to a schema outside `PGRST_DB_SCHEMAS`.

### 21g. RLS index coverage (P1, MEDIUM scaling) and the AD-6 wrapper (P2, HELD)
21 of 29 RLS-scoped tables have **no index whose first key is user_id** (only `assets, entitlements,
notifications, passkey_labels, profiles, projects, sites, subscriptions` do). RLS rewrites every
tenant query to `where user_id = uid`; an unfiltered list seq-scans the whole multi-tenant table.

AD-6's wrapper proven on 200k rows (50k for the target tenant), claims set, `set role authenticated`:

    with an index on user_id:  wrapped 11.8ms  |  bare 11.2ms   (both Index Only Scan)
    NO index (seq scan):       wrapped 23.4ms  |  bare 320.9ms   (14x)

Wrapped emits `Index Cond: (user_id = (InitPlan 1).col1)` — auth.uid() computed **once**. Bare inlines
the `coalesce(current_setting(...))` and, on a seq scan, re-evaluates it **per row**. The wrapper is
real insurance, but it only removes the per-row call; it does not remove the seq scan. P1 is the
missing half — index user_id on every RLS table.

### 21h. Performance held
- `screen.css` = **1.36 KB brotli** (raw 42 KB, gzip 2.2 KB) on the 70-section stress theme — far under
  NFR-2's 40 KB. Caveat: the synthetic fixture's CSS is highly repetitive and compresses unusually well.
- **Deploy half, measured**: upload **7.2 s (Ghost 5) / 7.5 s (Ghost 6)**, activate **1.6 s / 1.4 s**,
  gscan **0/0 on upload** both majors, for the 10.09 MB / 70-section theme. With R3's ~3.9 s compile
  that is ~13 s end to end — inside G1's 10 minutes with three orders of magnitude to spare.
- **Visitor page** (Ghost's own active theme): homepage ~59 KB, post ~19 KB, the `{{comments}}`
  cdn.jsdelivr.net script present on posts (§15c). Ghost's portal/search/comments scripts dominate a
  visitor's download and are outside Inflozo's theme and CSP.

### 21i. Regressions re-tested — all HELD
lock_generation monotonic (403) · edit_locks.user_id frozen (403) · assets.stored_bytes UPDATE locked
(403) · site_credentials/billing_events denied to authenticated (403) · cross-tenant project read
scoped (rows=0, Content-Range */0) · count(*) oracle scoped · suggestions_public hides another user's
unapproved image (null) · base suggestions.image_path unreadable by client (403) · A cannot edit/delete
B's suggestion (403) · F8 raw SVG still lands byte-identical, server-only buckets + folder scoping deny
· storage schema not PostgREST-exposed (404, D6 control) · gscan 0/0 on upload both majors.

### 21j. Vault — probed for the first time (5.2 item 4). HELD, and it bounds 21f.
`site_credentials.admin_key_vault_ref` is a UUID into `vault.secrets`. Probed live:

    supabase_vault 0.3.1 present.
    grants on vault.secrets / vault.decrypted_secrets: service_role only (SELECT,DELETE);
      anon/authenticated hold nothing.
    (secret key) GET /rest/v1/decrypted_secrets -> 404   (vault is NOT a PostgREST-exposed schema)
    (secret key) GET /rest/v1/secrets           -> 404

So decryption needs `service_role` **and** a path that is not the REST data API. A leaked **API
secret key** reads `site_credentials` over REST (21f) and gets the opaque `vault_ref` UUIDs, but
**cannot decrypt them** — `decrypted_secrets` is 404 over PostgREST. Actual decryption requires a
direct DB connection (server route via the pooler, or the DB password). This bounds 21f: the leak
yields references, billing PII and full `public` read, not the Ghost admin secrets themselves — real,
but not immediate site-takeover. The AD-10 decrypt chokepoint holds. Watch item: `pgsodium` is being
replaced under `supabase_vault`; re-probe on the vault major bump.

### 21k. The compiler as an injection channel — beyond AD-5 (5.2 item 1). Three findings, executed.
Run against the real pipeline (`tools/stress/compile.js`, the decided AD-4/AD-5/R2-5 ordering).
`full()` = renderSection then the R2-5 user-text substitution pass, i.e. what actually ships.

**HELD first, because it bounds the rest.** AD-5's numeric-entity escaping and the AD-4 splice hold
against every user-text vector tried: braces, block helpers and the marker shape all ship inert, and
a user quote inside an attribute is escaped, so no attribute breakout:

    user title = 'Notes on {{@site.title}} and {{#if @member}}x{{/if}}'
      -> live mustache in output: false          (entities, as designed)
    user href  = 'https://ok.example/" onclick="alert(1)'
      -> <a href="https://ok.example/&quot; onclick=&quot;alert(1)">    (escaped, no breakout)
    plain data-bind -> <div>{{html_field}}</div>   zero `{{{`

**F7 (CONFIRMED, HIGH) — a user-supplied URL reaches `href` with no scheme validation.**

    content.link = 'javascript:alert(document.domain)'
    <a data-prop-attr="href:link">  ->  <a href="javascript:alert(document.domain)">x</a>

The Conventions row promises *"every Ghost-sourced value is scheme-validated (`http`/`https` only)
before reaching `href`, `src` or `srcset`"* — but that carve-out names **Ghost-sourced** values and
lives in `ghost-shim`. A **user-typed link** (FR-D/AD-4's `marks[].href`, and any `data-prop-attr`
image/link control) goes through `applyProps`, which HTML-escapes and never checks the scheme.
Escaping is the wrong control for a URL: `javascript:` contains no escapable character. Actor B or a
compromised design; the victim is a **visitor to the customer's deployed site** (actor D). The same
gap covers `data:` and `vbscript:`.

**F8b (CONFIRMED, HIGH, actor C) — helper arguments are unescaped string interpolation.**
`bindExpr` builds Handlebars source by template literal:
`` `{{img_url ${path} size="${arg}"}}` `` — neither `path` nor `arg` is validated. A design file
(`packages/library`, 484 of them, actor C) that writes a crafted `data-bind-attr` breaks straight out
of the mustache into raw theme text:

    data-bind-attr='src:featureImage|img_url:800"}}<script>alert(1)</script>{{"'
      ->  <img src="{{img_url featureImage size="800"}}<script>alert(1)</script>{{""}}">

That is a live `<script>` in the emitted `.hbs`, on every customer site that deploys the design.
AD-5 closes the *user-text* half of this class and nothing closes the *author* half — the same
asymmetry AD-2/D13 already noted for the marker shape, arriving through the binding vocabulary.

**F9 (CONFIRMED, MEDIUM, actor C) — a design may name any attribute, including an event handler.**

    <div data-bind-attr="onload:featureImage">  ->  <div onload="{{featureImage}}">x</div>

`applyProps`/`emitBindings` accept the attribute name verbatim. AD-34's gate asserts "no inline event
handlers" over emitted files, so the gate is the only thing standing between this and a shipped
theme — a single check, on the far side of the pipeline, with no authoring-time check in front of it
(D13's CI lint is still unbuilt). Note the DOM does refuse a quote inside an attribute *name*
(jsdom `InvalidCharacterError`), so the breakout is via the attribute-name whitelist, not via quoting.

**One mechanism closes all three**: a binding vocabulary that is parsed and validated, not
interpolated — attribute names from a fixed allowlist, helper args typed (`size` ∈ enum), and every
URL-bearing attribute scheme-checked in `ghost-shim` for **user** values as well as Ghost values.

### 21l. Actor G — cost and denial of service, computed from measured figures. Mostly HELD.
Inputs are all measured, none assumed: compile 3.9 s / 486 MB peak (§14), upload+activate 8.8 s
(§21h, this round), Fluid Active-CPU $0.128/CPU-hr and $0.0106/GB-hr at 2 cores (§17d), `memory:
4096` (AD-11 after decision A), FR-J11 = 10 deploys/hour/site, a Pro account holds 25 projects.

    one deploy               12.7 s wall  ->  $0.000427
    1 site  at 10/hr          10/hr  = $0.004/hr  = $3.07/month
    25 sites at 10/hr        250/hr  = $0.107/hr  = $76.84/month   <- a Pro account at full abuse
    steady-state concurrency  250/hr x 12.7 s = 0.88 concurrent    <- no co-location pressure

**The compute lever is not material.** A single account deploying flat-out costs the owner ~$77/month
against a $15/month subscription — unpleasant, bounded, and visible in NFR-9's spend alarms long
before it matters. FR-J11 is adequate as a compute control and no per-account concurrency limit is
needed: at 4 GB, eight 486 MB compiles fit an instance and the worst case reaches 0.88 concurrent.

**The storage meter is the real lever, and it is F3's consequence.** FR-K3 meters
`assets.stored_bytes`, which §21c shows the client sets **at INSERT**. The meter can be written as
1 byte per asset while the object bytes land in Storage for real, so the Free 100 MB / Pro 5 GB caps
bound nothing — the true limit is Supabase's own storage bill. Closing F3 closes this too; it is one
finding with two consequences, not two findings.

### 21m. AD-10 / P8 — the write allowlist is code discipline, not a credential boundary (F10). Executed.
P8 permits Inflozo **four** Admin writes: theme upload, theme activate, `routes.yaml` upload, and the
consented announcement-bar clear. That allowlist lives in `apps/web/server/ghost-admin/*`. The
question actor F asks is different: what does the **stored credential** permit if that code is
bypassed — by a server-side bug, an SSRF into the proxy, or a Vault compromise? Executed against both
live Ghosts with the Admin API key Inflozo stores:

    ghost5 (5.130.6)                       ghost6 (6.58.0)
      GET /admin/members/   200, incl. email   200, incl. email     <- subscriber PII
      GET /admin/users/     200                200                  <- staff accounts
      GET /admin/settings/  200 (99 rows)      200 (117 rows)       <- whole site config
      POST /admin/posts/    201 CREATED        201 CREATED          <- arbitrary content write
      GET /admin/themes/    501                403                  (§15h, integration tokens: HELD)

So one Ghost Admin key is **full site control**: read every subscriber's email address, read staff,
and publish content on the customer's site. The four-item allowlist is a good invariant and it holds
*inside Inflozo's own code path*, but it bounds nothing about the credential. Nothing in the spine
states this: AD-10 reads as though the allowlist were the boundary, and the blast radius of the thing
`site_credentials` protects has never been written down. (The Staff Access Token's 400s are its
different auth scheme in this probe, not a narrower scope — §15h already established it is *wider*,
lifting `GET /themes/`.)

**Consequence for the spine:** AD-10 should say plainly that the credential is all-or-nothing, that
Ghost offers no scoped-integration mechanism to reduce it, and that the compensating controls are
therefore the decrypt chokepoint (§21j, holds), key rotation (`admin_key_rotated_at` exists as a
column and no policy uses it), and logging on the proxy (does not exist). This is the single largest
item behind "would you put other people's website credentials behind this?"

### 21n. ⚠️ The RLS harness is advisory, not a gate (F0). Executed — and this is the meta-finding.
`RLS-TEST.sql` is E1's exit criterion and, under AD-26, the gate every future migration relies on.
Its header says *"expect every line to read PASS"*. Counted in the file as shipped:

    raise exception  : 2      (lines 443, 454 — the two storage.buckets checks only)
    raise notice 'FAIL: 36

`\set ON_ERROR_STOP on` aborts on a SQL **ERROR**. A `raise notice` is severity NOTICE, and the
structural sentinels (§262–326) are plain `select … as finding` statements that return rows without
raising. Executed, the exact shapes the file uses:

    $ psql "$DB" -v ON_ERROR_STOP=1 -f fail-shape.sql   # a FAIL notice + a sentinel finding row
    exit code: 0

**So 36 of 38 assertions cannot fail the run.** Any CI keyed on the exit code is green while the
output prints `FAIL:`. This is the finding that explains the others: §21a/b/c/d all describe holes in
a schema whose proof has reported PASS for three rounds. It also means the *regression* half of this
round's mandate — "every closed finding is a regression test now" — is not mechanically true. Two
lines of change per assertion (`notice` → `exception`, and wrapping each sentinel in a `do` block
that raises) converts the whole file from a report into a gate.

### 21o. ⚠️ §19d fixed the instance, not the class — 12 more AD-8 tables are unreachable by the server (F11, CRITICAL for E7/E12)
Round 3's §19d found `billing_events` and `site_credentials` held `REFERENCES, TRIGGER, TRUNCATE` and
no SELECT/INSERT for `service_role`, and granted those two. **Every other AD-8 table still has the
identical signature.** Read from the live project:

    billing_events              INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE   <- fixed in R3
    site_credentials            INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE   <- fixed in R3
    deploys                     REFERENCES,TRIGGER,TRUNCATE
    deploy_jobs                 REFERENCES,TRIGGER,TRUNCATE
    entitlements                REFERENCES,TRIGGER,TRUNCATE
    subscriptions               REFERENCES,TRIGGER,TRUNCATE
    exports                     REFERENCES,TRIGGER,TRUNCATE
    project_site_bindings       REFERENCES,TRIGGER,TRUNCATE
    deployed_template_names     REFERENCES,TRIGGER,TRUNCATE
    asset_usages                REFERENCES,TRIGGER,TRUNCATE
    checkout_consents           REFERENCES,TRIGGER,TRUNCATE
    notifications               REFERENCES,TRIGGER,TRUNCATE
    template_binding_checklist  REFERENCES,TRIGGER,TRUNCATE
    profiles                    REFERENCES,TRIGGER,TRUNCATE

AD-8 says these tables *"are written by server routes under the service role"*. None of them can be.
The first deploy, the first entitlement write, the first notification and FR-I6's checklist all fail
with `42501` the moment E7/E12 run — the same failure §19d hit, in twelve more places. This is a
build-stopper, not a security hole, and it is the exact pattern the round was warned about: a fix
applied where it was found and not propagated to its siblings. **The durable form is a
`RLS-TEST.sql` assertion that every AD-8 table holds SELECT+INSERT for `service_role`**, not thirteen
more grant lines.

### 21p. AD-9 is 3/4 implemented — `custom_settings` has no freeze trigger (F12, HIGH)
AD-9 names four frozen columns and devotes a sentence to why `frozen_at` must be frozen alongside
`key` ("freezing only `key` left a two-statement bypass: null the stamp, then rename"). The trigger
was never created. Triggers actually present:

    profiles                 profiles_privilege_frozen          <- present
    deployed_template_names  deployed_template_names_frozen     <- present
    projects                 projects_revision_monotonic, projects_slug_frozen  <- present
    custom_settings          custom_settings_cap                <- the CAP only; NO freeze guard

Executed as the table owner (AD-31 requires these to hold against the service role too):

    update custom_settings set key='renamed_key' where …   -> OPEN: renamed despite frozen_at set
    update custom_settings set frozen_at = null where …    -> OPEN: the two-statement bypass, by name
    update profiles set is_admin=true where …              -> HELD (42501)   <- the control

The column-level GRANT still stops a *client*, so this is not remotely exploitable today. What it
breaks is FR-Q2's guarantee against a **server bug**: a renamed `custom_settings.key` erases the site
owner's stored `@custom` value on their live Ghost, silently and unrecoverably.

### 21q. Four more verified structural gaps
**F13 (HIGH) — nothing creates a `profiles` row.** §11b provisions `entitlements` from an
`auth.users` trigger; there is no equivalent for `profiles`, and `auth_user_entitlement` is the only
non-internal trigger on `auth.users`. Live counts after this round's signups:

    auth.users = 6    entitlements = 6    profiles = 2

Four users have no profile. `is_admin`, `autosave_enabled` and `free_editable_project_id` read NULL
for them — and AD-15 makes `autosave_enabled` load-bearing for data loss. §16a read "profiles = 2" as
confirming the design; those two rows were seeded by `RLS-TEST.sql`, not by signup.

**F14 (MEDIUM) — `site_snapshots` is fully client-writable.** `authenticated` holds
`SELECT, INSERT, UPDATE, DELETE` (it sits in §10a's owner list and §11a(1)'s full-CRUD list), while
AD-32 makes the `site-snapshots` *bucket* server-only with no policy at all, because "a snapshot a
client could write defeats FR-J13 entirely". The bucket is governed and the table that points into it
is not, so a client can forge or delete the pointer to its own pre-Inflozo theme backup.

**F15 (MEDIUM) — the board's UPDATE path has the same hole as its INSERT path.** `authenticated`
holds whole-row UPDATE on `suggestions` (`image_approved, status, vote_count, hidden, merged_into…`),
and `suggestions_author_update` permits it while `status = 'open'`. So §21a's self-approval works by
UPDATE as well as by INSERT — one fix must cover both verbs.

**F16 (LOW) — `sync_vote_count` fires on `INSERT DELETE` only.** A client that UPDATEs its own
`suggestion_votes.suggestion_id` from S1 to S2 desyncs the denormalized `vote_count` on both rows;
the public board reads that column.

### 21r. Pass 4 — red team and pre-mortem. The finding about the findings.
Both methods converge on the same structural verdict, and it is not any single hole.

**Red team's chain, built only from executed findings:** sign up → post to the public board with
`image_approved: true` (§21a, HTTP 201, no admin) → the image is a raw SVG because the only sanitizer
is client-side and was skipped (§16c) → it renders to every board visitor including the founder, on
`app.inflozo.com` → same origin, so the session token is readable, with the `javascript:` href gap
(§21k) as a second route through the editor iframe → the founder is `is_admin`.
**Blue's rebuttal is fair** — the last step needs a script-execution sink the editor does not yet
have, and `script-src 'self'` is specified. **Red's counter stands**: §18c states plainly that the
canvas half of that CSP is a *requirement on E5, not a measured property*. The control that stops the
chain is the one control never tested.

**Pre-mortem, 2028, 500 customers.** The headline is not stolen cards or defaced sites — it is
*"site builder leaked 40,000 newsletter subscriber emails"*, and it is news because the victims never
heard of Inflozo. 500 customers × ~80 subscribers sit behind one all-or-nothing Ghost Admin key
(§21m). Time exploitable: **since the schema was written, ~26 months.** Time to detection: until a
customer asked why their subscribers were getting spam — there is no audit log on the Admin proxy, no
log on Vault decryption, no alert on anomalous `site_credentials` reads. **Detection was external.**

**Which of the 62 decisions enabled it: none.** Every one was individually sound. R1 d13 correctly
narrowed UPDATE and nobody asked about INSERT. §19d correctly granted two tables and nobody asked
about the other twelve. AD-6 correctly gave every policy one shape, and that shape authorizes the
child rather than the parent. **The failure mode is fifteen good decisions each closing the instance
in front of it, in a project whose own stated rule is to prefer the mechanism that closes the class.**
The round-4 prompt named that pattern and counted five prior occurrences; this round found six more.

**Prevention, ranked by what would actually have changed the outcome:**
1. **A harness that fails** (§21n). Two of the six structural findings would have surfaced in Round 1.
2. **An audit log on the credential paths.** Would not have prevented the breach; would have cut 26
   months of dwell to days. **Only logging detects — everything else on this list only prevents.**
3. **A written blast-radius statement in AD-10**, so the consent screen can tell the truth (§21m).
4. **AD-36** — a named invariant for untrusted-value-into-interpreting-sink, so the next instance is
   recognised as a member of a class rather than found by a fourth stress test.
5. **Class-closing assertions rather than fixes** — every finding becomes an assertion over *all*
   tables, never a grant line for one.

The pre-mortem's question for the owner: *what would have to be true to find this in month 2 rather
than month 26?* Exactly one item on that list answers it. The architecture has 35 invariants and not
one of them is about knowing that something happened.

---

## 22. Round 4 decisions APPLIED, and proved · 2026-08-20

The owner took 14 of 17 recommendations and deviated on three (F16 → remove-and-re-add, S1 → test
first, H2 → re-measure on real designs), plus two directions: **F4's takeover is allowed with a
"you were taken over and lost these changes" message to the displaced device**, and **S2's story
must also design a per-account budget**. Everything below is executed, not asserted.

### 22a. Two breaks found while applying, both pre-existing
**`SCHEMA.sql` had not applied to a bare container since Round 3.** §19d's fix added
`grant ... to service_role` and `PRELUDE.sql` never created that role:

    psql:/s.sql:858: ERROR:  role "service_role" does not exist

The hosted path kept working because Supabase provides the role, so the break was invisible to the
run everyone was doing. `PRELUDE.sql` now creates it `bypassrls`, matching the platform — which is
also what makes the new AD-7/AD-8 service-role assertions mean the same thing on both targets.

**`PRELUDE.sql` did not model `storage.buckets`' real default.** Round 3 §16b established that the
platform ships it **RLS on, zero policies**; the stand-in shipped it with RLS off, so RLS-TEST's
`storage.buckets` assertion — one of only two that could ever abort — failed on **every** container
run. Fixed in the stand-in rather than weakened in the test.

### 22b. F0 — the harness is a gate now, and that is proved by mutation
36 `raise notice 'FAIL` → `raise exception`; the structural sentinels, which returned findings as
**rows**, are wrapped in blocks that raise. Then every fix was reverted one at a time against a
freshly built database, and the gate had to catch it:

    revert F1  (grant update (image_approved))         -> exit 3   FAIL (F3): suggestions.image_approved
    revert F2  (drop the parent-ownership policy)      -> exit 3   FAIL (F2): project_templates
    revert F3  (grant insert (stored_bytes) on assets) -> exit 3   FAIL (F3): assets.stored_bytes
    revert F11 (revoke insert on deploys)              -> exit 3   FAIL (F11): deploys
    revert F12 (drop custom_settings_key_frozen)       -> exit 3   FAIL: missing guard trigger(s)
    revert F13 (drop auth_user_profile)                -> exit 3   FAIL: missing guard trigger(s)
    revert F4  (drop edit_locks_takeover_advances)     -> exit 3   FAIL: missing guard trigger(s)
    revert P1  (drop deploys_user_id_idx)              -> exit 3   FAIL (P1): deploys
    revert F16 (grant update on suggestion_votes)      -> exit 3   FAIL (F16): a vote was moved
    unmutated control                                  -> exit 0

**9 of 9 caught.** Clean run on a brand-new container: **67 assertions, 0 failures, exit 0**, 45
policies over 28 tables — up from 38 assertions that could not fail.

### 22c. Writing the assertions found four more instances of the same class
This is the argument for class assertions over per-table fixes, and it happened while the work ran.
The F3 catalogue check went red on its first execution against tables nobody had flagged:

    FAIL (F3): sites.deploy_rate_limit_exempt (INSERT), sites.capability (INSERT),
               projects.revision (INSERT), custom_settings.frozen_at (INSERT)

§11 had revoked UPDATE on all three and named the writable columns, and §11a granted **whole-row
INSERT** beside it — so everything §11 forbade was available one verb over. Round 4's attack pass
found this class on `suggestions`, `assets` and `edit_locks`; the assertion found the other four for
free. INSERT is now column-narrowed on all seven.

Two further self-corrections worth recording, because both were the gate working on its author:
`role_table_grants` lists **table-level grants only**, so the first reachability assertion called
`suggestions` unreachable the moment F1 moved it to column-level grants — fixed by using
`has_any_column_privilege`. And building `'public.'||tablename` inside a qual let the planner
evaluate the privilege test **before** the schema filter, failing on `public.pg_statistic`; passing
the OID removes the possibility.

### 22d. AD-36 implemented and proved — `tools/stress/test-ad36.js`, 10 checks
All four vectors are inert and every legitimate case still works:

    ok  javascript: in a user link is neutralised
    ok  data:, vbscript:, case, control-char and whitespace evasions all neutralised
    ok  ordinary and relative links are untouched
    ok  a crafted helper argument is refused at compile time
    ok  quote-in-arg, brace-in-path and unknown-helper are all refused
    ok  the legitimate binding vocabulary is unchanged
    ok  event handlers, style and formaction are not bindable
    ok  legitimate attribute bindings still emit
    ok  AD-5 still holds — user braces ship as entities, never as a mustache
    ok  AD-4 still holds — a quote in a user value cannot break the attribute

**The first draft of the path grammar was wrong and the fixture caught it**: it refused
`@site.logo`, because it had been written against dotted identifiers rather than against
Handlebars' actual vocabulary. A grammar that rejects the language it parses is a broken parser, not
a strict one — the "legitimate case still works" half of each check is what caught it, and that is
why it is part of the invariant rather than a courtesy.

### 22e. The hardened compiler still ships
Nothing regressed on the real pipeline or the real Ghosts:

    70 sections over 7 templates, 197 files, 10.20 MB   (render 983 ms, gate 900 ms, total 2.16 s)
    gscan 4.49.7 (v5): 0 errors 0 warnings  ·  gscan 6.4.2 (v6): 0 errors 0 warnings
    AD-14 determinism: two builds byte-identical (aede7be372ed0950)
    live upload+activate: ghost5 5.95 s + 1.53 s · ghost6 5.60 s + 2.40 s, 0/0 on upload both

### 22f. What was applied, by decision
| | Decision | Mechanism | Proof |
|---|---|---|---|
| F0 | make the harness fail | 36 notices → exceptions; sentinels raise | 9/9 mutation test |
| F11 | fix twelve + assert the class | `service_role` CRUD loop + catalogue assertion | revert `deploys` → caught |
| F1 | lock create **and** edit; sanitize on approval | column-narrowed INSERT+UPDATE on `suggestions` | 3 behavioural regressions |
| F10 | write the radius down, log every use | AD-10 rewritten; `private.credential_audit` | table + deny assertion |
| AD36 | one rule, one shared check | `AD-36` + `compile.js` + `test-ad36.js` | 10 checks |
| F2 | parent-ownership on the shared rule | `owns_project()` + restrictive policy loop | cross-tenant insert now 42501 |
| F13 | signup provisions the profile | `provision_profile()` + trigger | 6 users → 6 profiles |
| F3 | lock create like edit, everywhere | INSERT narrowed on 7 tables | catalogue assertion, both verbs |
| F6 | move off the data API | `private` schema | assertion: not in `public` |
| F12 | add the missing guard | `guard_custom_setting_freeze()` | rename + null both 42501 |
| F4 | decide the protocol *(owner: allow, then notify)* | `guard_lock_takeover()` | reseat blocked, real takeover works |
| F14 | backup record read-only | `site_snapshots` → AD-8 select-only | grant assertion |
| P1 | index now, assert for new tables | 19 indexes + catalogue assertion | revert one → caught |
| F16 | remove-and-re-add *(owner deviation)* | UPDATE grant removed | move now 42501 |
| S1 | test with a staff login first *(deferred)* | register item 34 | — |
| S2 | note on the story + per-account budget *(owner)* | register item 35 | — |
| H2 | re-measure on real designs *(deferred)* | register item 36 | — |

---

## 23. Round 4 follow-through · 2026-08-20

### 23a. E0(a) closed — the canvas emitter exists and the two renderers are proven to agree
§7.3 rests the product on canvas and shipped theme agreeing **by construction**, justified by "the
same code ran". The rebuilt pipeline had only the theme emitter, so that was a promise nothing could
falsify. `renderCanvas` now shares `applyProps`, `safeUrl`, `bindExpr`'s grammar and
`assertBindableAttr` with the theme path — **the `users` parameter is the only difference between
them** (a `UserText` on the theme, `null` on the canvas).

`tools/stress/test-renderer-agreement.js` — 8 checks, comparing the two **node by node**:

    ok  a static section agrees exactly
    ok  AD-3 control attributes survive identically on both emitters
    ok  a Ghost-bound repeat agrees, structure for structure
    ok  no directive attribute survives on either emitter
    ok  the two intended differences are present: foreach-vs-rows, mustache-vs-value
    ok  AD-4/AD-5 — the canvas decodes and the theme ships inert, from one serializer
    ok  AD-36 — the URL scheme check runs on both emitters, not just the theme
    ok  FR-H8 — an empty media binding hides the element on both, by each emitter's own mechanism

The comparison is over **structure** — tag tree, classes, attribute names — because those three are
what a design's stylesheet selects on, and it is deliberately blind to the two things that must
differ. Those two are asserted **positively** as well, so nobody "fixes" them into agreement.

**The test caught a flaw in itself first, and it is worth recording.** The theme legitimately emits
`src="{{img_url feature_image size="800"}}"` — valid Handlebars that gscan passes 0/0, but **not**
valid HTML, so a raw parse read the inner `size="800"` as a stray attribute and reported a
disagreement that did not exist. Inline mustaches are collapsed before the structural compare.

Both defects `build-sequence.md` names are now fixed in the live pipeline: the FR-H8 guard (§22, and
it was silent content loss) and the date helper, which **now honours its format argument** — written
from UTC getters, since AD-1 bans `Intl` and `toLocale*` for reading the machine rather than the
argument. `spike-compiler/` is **retired**, not repaired (`RETIRED.md`): it is a second copy of the
pipeline missing six rounds of decisions, it does not run, and its one unique asset was `renderCanvas`.

### 23b. Supabase now blocks DELETE on storage tables — and not TRUNCATE
Found by the reset script failing:

    ERROR: 42501: Direct deletion from storage tables is not allowed. Use the Storage API instead.
    CONTEXT: PL/pgSQL function storage.protect_delete()

Two new triggers, `protect_buckets_delete` and `protect_objects_delete`, refuse a direct SQL DELETE
**even to `postgres`**. That is the platform enforcing AD-32's own rule — a row delete orphans the
bytes — and it is welcome. Re-tested what it does *not* cover:

    trigger coverage:  protect_buckets_delete  DELETE
                       protect_objects_delete  DELETE          <- DELETE only
    grants still held: anon TRUNCATE, authenticated TRUNCATE   <- unchanged
    as authenticated:  truncate storage.objects   -> SUCCEEDED

**So the platform now guards the recoverable verb and leaves the destructive one open.** D6 is
unchanged: the control that holds is that `storage` is not PostgREST-exposed, which `RLS-TEST.sql`
asserts. Second time this item has moved under us — re-check after any storage-api upgrade.

### 23c. FR-P1's sixth email, decided and built into the schema
Owner decision: send our own renewal reminder at **30 days (annual) / 7 days (monthly)**, and leave
Dodo's ~2-day reminder **on** — they fire at different moments, so they complement rather than
duplicate. `public.renewal_reminders` carries the send record and **its primary key
`(user_id, period_end)` is the never-send-twice rule**, expressed as a database fact rather than as
something the cron must remember. Keyed on the renewal being announced rather than the send time, so
a renewal date that moves earns a fresh reminder. AD-33's closed cron set gains its **seventh**, with
E12 as its owner, and the schema still applies clean: **67 assertions, 0 failures, exit 0**.

**The consequence of owning it is stated in the AD rather than discovered later:** a silent failure
of that job now means nobody is warned at all, so it belongs on the NFR-9 alerting path.

### 23d. The harness is now pure SQL, and runs on three targets
`RLS-TEST.sql` opened with `\set ON_ERROR_STOP on` and `\pset pager off`. Those are **psql client
directives, not SQL** — the Supabase dashboard SQL editor sends raw SQL to the server, which
rejected the very first line:

    ERROR: 42601: syntax error at or near "\"
    LINE 26: \set ON_ERROR_STOP on

`SCHEMA.sql` and `PRELUDE.sql` were already clean, which is why the schema applied and only the
proof failed. Removed; `ON_ERROR_STOP` belongs on the psql **command line** (`-v ON_ERROR_STOP=1`),
where it serves the two psql targets, and the editor needs no equivalent — it runs the script as one
transaction and an exception aborts it outright. Same contract, different mechanism.

**The file is also self-cleaning now**, because the fix exposed a second problem. Several assertions
are stateful — the FR-Q2 cap inserts 17 settings, the theme-name test claims a binding, the takeover
test advances a generation — so a second run died on a duplicate key, which **reads as "the schema is
broken" when it means "the fixture is still here"**. The editor makes an accidental re-run one click
away. The file now deletes its own four fixture users first, cascading everything they own.

Verified on a clean container:

    psql -f, ON_ERROR_STOP on the command line   exit 0   67 PASS   0 FAIL
    whole file as ONE query string (editor)      exit 0   67 PASS   0 FAIL
    the same, run three times in a row           exit 0   67 PASS   0 FAIL   0 ERROR

And it still bites, in editor mode, with no `ON_ERROR_STOP` anywhere:

    drop trigger auth_user_profile      -> exit 1  ERROR: FAIL: missing guard trigger(s)
    grant update (image_approved) …     -> exit 1  ERROR: FAIL (F3): suggestions.image_approved (UPDATE)

---

## 24. Propagation audit, and the reliability gap · 2026-08-20

### 24a. Every Round 4 finding cross-referenced against the docs. Three gaps found.
Checked mechanically rather than from memory — standing rule 2 ("propagate, never localise") is the
rule this project has broken most often, and an audit done by recollection is how it stays broken.
Each of the 20 finding ids was searched across the spine, the schema and the register.

**17 of 20 had propagated. Three had not, and one of them mattered:**

- **F0 was an orphan in the spine.** The finding — the harness could not fail — lived in
  `MEASUREMENTS.md` and in `RLS-TEST.sql`'s own header, and **nowhere in the architecture**. AD-26 is
  the invariant that owns `supabase/tests/rls.sql`; it required every migration to ship a row there
  and said **nothing about that file having to raise**. So the single most expensive defect this
  project has found was recorded as evidence and not as a rule, and the real repo's harness would
  have been rebuilt with no instruction to make it a gate. **AD-26 now carries it**, with the three
  consequences that bind every future migration: `raise exception` not `raise notice`, catalogue
  queries wrapped in a raising block, and the harness **mutation-tested** rather than trusted.
- **§23a — the renderer-agreement proof was not referenced from AD-1**, whose "the same code ran is
  the proof" sentence is exactly the claim it makes runnable. Added.
- **§23b — the new storage DELETE guard was not in AD-32.** Added, including the part that matters:
  it does **not** cover TRUNCATE.

**Also corrected while auditing**: §8's policy count, which Round 3's decision D8 had already flagged
for re-derivation, still carried a stale figure inside its own correction. It is now not a number at
all — the proof prints the live one, and container and hosted agree at **46 / 29**. Register item 37
is marked **superseded** by 37b rather than left reading OPEN.

### 24b. AD-11's cold-start row — Round 4 asked for it and never filled it
The round-4 prompt's performance table listed *"Cold starts — Fluid instance boot on a real deploy:
how long before the first byte on a cold path?"* and the round did not measure it. Closed now,
against the live probe deployment:

    request 1, after hours idle   1325 ms
    requests 2-7, warm             657 · 598 · 604 · 576 · 632 · 403 ms   (median 601 ms)
    cold-start penalty             ~724 ms

The warm figure is dominated by network RTT to `iad1` from this machine, not by the function. **The
penalty is ~0.7 s and it is immaterial to every budget the product states** — against AD-11's 300 s
compile ceiling it is noise, and against G1's ten minutes it is invisible. Where it is worth
remembering is perceived responsiveness on a user's *first* action after idle, which is a UX note for
E5 rather than a budget concern.

### 24c. ⚠️ The reliability leg is the weak one, and NFR-4 names a gate nobody has run
Security and performance have both been executed hard. **Reliability has not been tested at all.**

NFR-4 reads: *"Supabase Postgres point-in-time recovery (PITR) enabled for user work-product, **with
a restore drill exercised before launch**."* Searched across every measurement file: **zero mentions
of a restore drill, and zero evidence any restore has ever been attempted.** The probe project shows
`wal_level=logical` and `archive_mode=on`, so the machinery is there, but PITR itself is a Supabase
**paid add-on** and whether it is enabled — and at what retention — has never been checked. Appendix F
already carries a `[NOTE FOR PM]` to confirm the retention window matches NFR-4 before launch; that
note and this gate are the same item, and neither has been actioned.

**Three reliability facts that follow from AD-29 and have no evidence behind them:**

1. **No restore has ever been performed.** A backup that has not been restored from is a hypothesis,
   and this project's own standing rule 1 is about exactly that class of belief.
2. **Storage has no PITR at all** — AD-29 states this plainly — and `site-snapshots` holds the one
   artifact that *cannot* be regenerated: a customer's pre-Inflozo theme. There is currently **no
   backup story for it whatsoever**, only a lifecycle rule that deletes it.
3. **No failure path has been executed.** AD-20's partial-success state, AD-24's error envelope and
   §19e's webhook contract all describe what happens when something breaks; not one of them has been
   run against a real failure — a Ghost that 500s mid-upload, a dropped connection, an unreachable
   Supabase.

---

## 25. The reliability round · 2026-08-20 · **NFR-4's restore drill, run for the first time**

Security and performance had both been executed hard. Reliability had never been tested at all.
Three parts: the restore drill NFR-4 names as a launch gate, the storage-backup question AD-29
leaves open, and a set of deliberate failures against a real Ghost.

### 25a. ⚠️ R1 — the obvious backup is silently incomplete, and it looks fine
The first drill ever run found a defect on the first attempt.

    pg_dump --schema=public --schema=private   ->  22.9 s, 131 KB, 32 tables with data
    pg_restore into a virgin target            ->   0.7 s

It **looks** like a complete success: 29 public tables, 3 private tables, every row present —
`profiles` 4, `custom_settings` 17, `sites` 2. Then:

    foreign keys in the live project : 56
    foreign keys after restore       : 43        <-- 13 missing

**All 13 reference `auth.users`.** They failed with *"insert or update violates foreign key
constraint"* because the users are in the `auth` schema, which was not in the dump — so the restored
database contains every project, design and setting **belonging to users who do not exist**. Every
row orphaned, no error at the end of the restore loud enough to notice, and a `pg_restore` exit that
reads as success.

**The fix, verified:** include `--schema=auth`. Our role *can* read it (`postgres`, non-superuser,
`has_table_privilege(auth.users) = true`, 23 auth tables dumped). With it:

    pg_dump --schema=public --schema=private --schema=auth  ->  26.2 s, 218 KB
    pg_restore into a virgin target                          ->   1.1 s, 1 cosmetic error
    foreign keys restored : 56 of 56
    auth.users restored   : 4      profiles: 4      orphaned rows: 0

### 25b. R2 — `--no-privileges` throws away the security model
The conventional cross-account restore flags are `--no-owner --no-privileges`. The second one is
wrong for this schema, and the harness caught it immediately:

    harness against the restored copy  ->  ERROR: permission denied for table sites

`SCHEMA.sql` §11a exists because **this schema grants IN and names every privilege** (R2-1). A dump
that strips privileges restores the tables, the rows and the RLS policies, and drops **every grant** —
so `authenticated` holds nothing and the application is dead. It **fails closed rather than open**,
which is the safe direction and worth stating, but a restore that needs the grants re-applied by hand
is not a restore. Dump with `--no-owner` **only**.

### 25c. R3 — a restore target needs the platform roles created first
Restoring *with* privileges produced **31 `ERROR: role … does not exist`**. Grants naming
`anon`, `authenticated`, `service_role`, `supabase_auth_admin` and others cannot apply to a target
that has never heard of them. Benign, and it means the runbook has an order: **create the roles,
then restore.** `PRELUDE.sql` already does this for the container; the runbook must do it for any
other target.

### 25d. The restore runbook, as proved
    1. create roles: anon, authenticated, service_role, supabase_auth_admin
    2. pg_dump  --schema=public --schema=private --schema=auth --no-owner --format=custom
    3. pg_restore --no-owner            (NOT --no-privileges)
    4. re-create the storage buckets and their policies — storage is NOT in the dump
    5. run RLS-TEST.sql against the restored copy. It is the acceptance test for the restore.

**Step 5 is the point of the whole exercise.** The harness is what turned "the restore succeeded"
into "the restore is missing 13 foreign keys and every grant", and no reading of a `pg_restore` exit
code would have.

**Timings at this scale are meaningless and are recorded so they are not mistaken for a measurement**:
41 rows, dump 26 s (dominated by connection latency, not data), restore 1 s. **This is a
correctness drill, not a capacity one** — re-run it against a realistic volume before launch.

### 25e. What is still NOT tested, stated plainly
**Supabase's own PITR restore has not been exercised and cannot be from here.** `wal_level=logical`,
`archive_mode=on` and `archive_command=/usr/bin/admin-mgr wal-push` — so the physical WAL archiving
machinery *is* running on this project. But triggering a point-in-time restore is a dashboard action
gated on the paid add-on, and no management token exists in the probe environment. **NFR-4's gate is
therefore half-closed:** the logical backup/restore path is now proved end to end; the platform PITR
path is proved to be *running* and never proved to *restore*. That half stays an owner action, and
Appendix F's `[NOTE FOR PM]` about the retention window is the same item.

### 25f. Deliberate failures against a real Ghost — four clean, one not
Every one of these was described by an AD and none had ever been run. Ghost 6.58.0.

| what was done | result | verdict |
|---|---|---|
| upload a corrupt zip | `422 ValidationError` — *"Failed to read zip file"* | clean, typed, site untouched |
| upload a valid zip that is not a theme | `422 ThemeValidationError` | clean, typed, site untouched |
| activate a theme that does not exist | `422 ValidationError` — *"cannot be activated because it was not found"* | clean, typed, site untouched |
| upload a theme with a fatal gscan error (unclosed `{{#foreach}}`) | `422 ThemeValidationError`, **upload refused outright** | confirms §15j — `GS005-TPL-ERR` is fatal at upload |
| **upload the same theme name twice, concurrently** | **`500 InternalServerError` — `EEXIST: file already exists, mkdir '/var/…'`** | **⚠️ see below** |

**⚠️ Ghost has no lock on theme upload, and the failure is a raw 500 with a filesystem path in it.**
Two concurrent uploads of the same theme name: one returned 200, the other returned a **500** whose
message leaks a server directory. Two consequences, and the first is a confirmation rather than a
finding:

1. **AD-19 is load-bearing, and this is what it prevents.** The per-site advisory lock over
   upload-and-activate exists exactly so two deploys cannot interleave a globally stateful operation.
   Until now that was reasoning; this is the failure it stops, executed. FR-J11's rate limit would
   *not* have prevented it — a limit is not a mutex, which is the sentence AD-19 already carries.
2. **AD-24's gscan mapping must handle a raw Ghost 500, and must not pass it through.** The
   verbatim-passthrough fallback is wrong here: the message contains the server's directory layout,
   and "an unexpected error occurred" tells the user nothing actionable. This is a second signature
   for the same treatment §7.6's malformed-`visibility` cascade already gets.

**Nothing broke the site.** After all five failures, both Ghosts served their homepage (HTTP 200,
~59 KB) and their Content API. **No failure left a partially-applied theme**, which is FR-J11's
promise and had never been checked.

---

## 26. FR-J7 rollback retention, built · 2026-08-21

Owner decision: **at most 10 stored versions per project on Pro and 3 on Free, pinned included in
that count**, stated in the UI rather than implied. A version may be **pinned** to survive pruning.

### 26a. The N−1 cap could not live in the database, and the split follows AD-9's shape
The owner's rule is "at most N−1 pinned", so a customer who pins every slot is never left unable to
deploy. **N is plan-dependent**, and AD-28 makes `resolveEntitlement` the *only* thing that decides
plan state — a trigger reading `entitlements` to find the limit would be a second decider, which is
the exact divergence AD-28 exists to prevent.

So the rule splits the way AD-9 already splits its own ("the trigger is the floor under the UI, not a
substitute for it"):

| where | what it enforces | why there |
|---|---|---|
| server route | the plan-specific cap, **N−1** | it is the only place allowed to ask what plan someone is on |
| `guard_pin_leaves_a_slot()` | **at least one version stays unpinned** | plan-independent, so it can live in the database and hold against the service role too (AD-31) |

The floor is the same rule stated without reference to a plan: a project whose every version is
pinned has nowhere to put its next build, and the only ways out are refusing the deploy or silently
unpinning something the customer explicitly asked to keep. Refusing the *pin* is the least bad of
the three, and it is the one the customer can act on.

`deploys.pinned` is **not granted to the client** — `deploys` is select-only under AD-8, so a pin is
set by a server route like every other server-asserted fact.

### 26b. Verified on a clean container
    harness: exit 0, 70 assertions, 0 failures     (was 67 before this change)

    PASS (FR-J7): a version can be pinned while an unpinned slot remains
    PASS (FR-J7): the last unpinned version cannot be pinned (42501)
    PASS (FR-J7): unpinning is always allowed

The third matters as much as the second: **unpinning is unconditional**, or a customer could pin
their way into a state they cannot get out of.

### 26c. Mutation-tested, per AD-26
    drop trigger deploys_pin_leaves_a_slot        -> exit 3  FAIL: missing guard trigger(s)
    grant update (pinned) … to authenticated      -> exit 3  FAIL (F3): deploys.pinned (UPDATE)
    control (unmutated)                           -> exit 0

Both new guards are caught by an assertion written over a **catalogue** rather than over a name —
`pinned` was added to the server-asserted column list and the trigger to the required-guard list, so
neither needed a bespoke check. That is AD-26's "prefer an assertion over a catalogue" paying off on
the first change made after it was written down.

### 26d. Still owed to this decision, and it is not a database concern
- **The UI must state the limit** — a history list that silently drops its oldest entry reads as
  complete when it is not (E7/E13).
- **The history must never show a version it cannot restore.** A dead Restore button is worse than a
  short list.
- **The pruning job skips pinned rows** and applies 10/3 through `resolveEntitlement` (E7, AD-33's
  artifact-retention cron).

---

## 27. Second propagation audit · 2026-08-21 · **the class assertions were not class assertions**

The first audit (§24a) asked "does each finding reach an owning document". This one looked in
different directions — restated counts, dangling references, and whether the *assertions themselves*
had kept pace with the schema. The third direction found the real defect.

### 27a. ⚠️ Two "class" assertions had hardcoded their own member lists, and both had already drifted
`RLS-TEST.sql`'s F11 check is the assertion written in Round 4 specifically because §19d had fixed an
instance and left twelve siblings. **It hardcoded its own list of tables** — and by the time this
audit ran, two tables had joined the class it guards and neither was being checked:

    in the AD-8 class (SCHEMA §10b) : … renewal_reminders  site_snapshots
    actually asserted by F11        : … (neither)

`site_snapshots` joined in Round 4 (F14); `renewal_reminders` was added a day later. **A class
assertion that names its members is an instance assertion wearing a class costume** — the exact
defect it exists to catch, occurring inside the assertion itself. The same audit found the function
check had the same shape and had already lost `guard_pin_leaves_a_slot()`.

**Both now derive from the catalogue**, and the derivations are self-evidently true rather than
lists to maintain:

- **F11:** *if the client can read a table but cannot insert into it, the server must be able to
  insert — or no row can ever come into existence.*
- **5d:** *every function in `public` that returns `trigger` must not be executable by a client.*

Proved against a table that **does not exist in the schema at all** — a brand-new AD-8-shaped table
created on the fly was caught immediately, which is the only real test of a derived assertion:

    revoke insert on renewal_reminders from service_role  -> CAUGHT
    revoke insert on site_snapshots    from service_role  -> CAUGHT
    a brand-new client-readable table nobody declared     -> CAUGHT

### 27b. ⚠️ And the function check was testing a proxy, not the property — a hole that pre-dates Round 4
Mutation-testing the de-hardcoded version exposed something worse than drift. The check asked
`proacl is null` — *"has this function never been granted or revoked?"* — as a stand-in for *"can a
client execute it?"*. **Those are not the same question.** An explicit `grant execute … to public`
sets a non-null ACL, so the function becomes world-executable **and the assertion goes quiet**:

    grant execute on function guard_pin_leaves_a_slot() to public   -> MISSED by the old form

This is not a Round 4 regression; the `proacl is null` form dates from R1 d16/R2-11 and has been
green over this hole ever since. It now asks the real question — `has_function_privilege` for `anon`
and `authenticated`, which between them cover a null ACL, an explicit grant to PUBLIC, and a direct
grant to either role. Re-tested:

    grant execute … to public          -> CAUGHT
    grant execute … to authenticated   -> CAUGHT

**The general lesson, and it is worth more than the two fixes:** an assertion that tests a *proxy*
for the property it cares about inherits every gap between the two. Test the property.

### 27c. Restated counts, again
Standing rule 3 says counts are derived, not restated, and three **live** documents still stated one:
the spine's frontmatter ("§7.6's 21 items"), and `build-sequence.md` twice ("37 items"). All three
now describe the register as *the* count rather than quoting a number. The round records
(`STRESS-TEST-R2/R3/R4`, the decision files) also carry old figures and were **left alone
deliberately** — they are dated records of what was true then, and editing them would falsify the
history the project relies on.

Also found: **step 1's prompt was not marked historical** the way step 2's was, and it instructs
against "21 verify-at-build items". Marked.

### 27d. Clean
Dangling file references: none — the ten unresolved names are library files not yet authored, the
future repo's own harness, or files belonging to Supabase and Ghost. Dangling `§` references: none.
Final state: **schema applies clean, 70 assertions, 0 failures.**

### 27e. Completeness pass — the audits' own findings, propagated in full
Both audits' *fixes* were applied when they were found. This pass asked the harder question: were
they propagated **everywhere they belong**, including documents neither audit had opened. Three gaps.

**The second audit's most valuable lesson had no owning rule.** AD-26 carried "prefer an assertion
over a catalogue to an assertion over a name" — written 2026-08-20 and **violated the same day** —
but nothing recorded *why* it had failed, and nothing at all recorded the sharper finding: that an
assertion testing a **proxy** for the property it cares about inherits every gap between the two. The
`proacl is null` form had been green over its hole through **all four rounds**. AD-26 now carries
both as numbered invariants, with the evidence that the softer version of the rule did not hold.

**The plain-English document was materially out of date**, and it is the one a human actually reads.
Written before the backup decision, it still told the reader the storage question was "the open
question, deliberately still open", listed file backups as an open decision, and described uploaded
images as possibly the customer's only copy — which the compile-pipeline finding had since disproved
(a deployed image ships **inside** the theme package, so it also exists on the customer's own Ghost).
All three corrected, plus its check count (67 → 70) and a new row for rollback retention.

**A live count was still restated in three places** (§27c) after standing rule 3 had been cited
against exactly that. Now derived.

**Nothing else moved:** schema applies clean, **70 assertions / 0 failures**, compiler 13 + 8. Every
finding from both audits now resolves to an owning invariant — verified mechanically rather than by
recollection, which is the only reason the first two passes found anything.

---

## 28. Register item 34 / Round 4's S1 — closed by execution · 2026-08-21 · **HELD**

S1 was Round 4's only SUSPECTED security finding: the theme's `<style>` block emits
`--accent: {{@custom.accent_colour}}` and an unquoted `url({{@custom.dark_logo}})`, and unlike an
inline `style` attribute that context **can carry selectors** — so if Ghost accepted loose values in
a custom setting the payload class would be strictly larger than the tag-`accent_color` finding.
The owner chose "test it properly with a staff login, then decide". Done.

**Three probe defects, each of which produced a convincing false result.** Recording all three,
because every one of them looked like an answer:

1. **Round 4 used an integration token.** Ghost refuses those for settings writes — and the *control*
   write of a valid `#1f6feb` was refused **identically**, which is exactly why it was marked
   SUSPECTED rather than held. Correct call at the time.
2. **This round's first attempt passed the staff token raw.** A Staff Access Token is `id:secret` and
   must be minted into a JWT the same way an Admin API key is. Raw → `400 Invalid token`.
3. **Theme settings are not on `/settings/`.** Writes there return **`200` and silently do nothing** —
   every value read back as `None`, *including the control*. They live on
   `/ghost/api/admin/custom_theme_settings/`, whose payload is the whole settings array.

Executed on the right endpoint with a real staff session, against the stress theme's own
`config.custom`, on Ghost 6.58.0:

    #ff0000                                        -> 200, stored          <- control passes
    '#fff; } body{display:none} .x{color:#fff'     -> 422 Validation error
    '#fff;background:url(https://evil.example/…)'  -> 422 Validation error
    'notacolour'                                   -> 422 Validation error

**Ghost validates `color`-typed custom settings strictly. S1 is refuted and the `<style>` block holds.**

**What it does not change.** A tag's `accent_color` is a *different field on a different endpoint*
and is still loose — `red;}body{display:none}`, `#fff;background:url(x)` and `#fff;width:100vw` were
all accepted verbatim on both majors (§21e). AD-36(4) stands: `ghost-shim` parses every bound colour,
and it must, because the value that *is* loose reaches an inline `style` on the customer's live site.
This closes a suspected **escalation**, not the rule.

**The lesson worth keeping, and it is the third time this session:** *a result whose control did not
pass is not a result.* All three defects above were caught by the control failing alongside the
payloads — a 403 for everything, a 400 for everything, a silent null for everything. Without a
control in every probe, each would have been recorded as "Ghost rejects it — held", and the last one
would have been a **false negative on a real security question**.
