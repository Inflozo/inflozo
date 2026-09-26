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
category gate's automated sheet unmeetable at once, on every design in the library simultaneously.

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

**Re-probed 2026-09-07 (Story 3.1 Dev and Review), through the transaction pooler as `postgres`,
read-only, and by the REST control again:**

    vault.create_secret: FOUR arguments, THREE defaults — (new_secret text, new_name text DEFAULT NULL,
      new_description text DEFAULT '', new_key_id uuid DEFAULT NULL) RETURNS uuid, SECURITY DEFINER,
      owner supabase_admin (supabase_vault 0.3.1). The docs' three-positional shape resolves through
      the defaults; the gate's stand-in in PRELUDE.sql models the four.
    vault.secrets: relrowsecurity f, no policies, owner supabase_admin.
      grants: postgres DELETE,SELECT,REFERENCES,TRUNCATE; service_role DELETE,SELECT; nobody else.
    roles: postgres rolbypassrls t (not superuser); supabase_auth_admin rolbypassrls f and holds no
      grant on vault.secrets — so a trigger deleting a secret on GoTrue's cascade must run as its
      owner (DW-44's `security definer`), and the gate proves that under a probe role with no vault grant.
    private.credential_audit.action is the enum (admin_write, admin_read, vault_decrypt, …);
      `outcome` is free text with no check constraint (DW-53).
    (secret key) GET /rest/v1/decrypted_secrets, /secrets, /site_credentials -> 404 PGRST205, all three;
      /rest/v1/sites -> 200 (positive control). Now a step of tools/probe/run-verify-ghost-admin.py.
    pooler TLS from the app's driver (postgres.js 3.4.9): ssl 'require' connects but does not verify
      the chain (the driver sets rejectUnauthorized false for it); ssl 'verify-full' fails
      SELF_SIGNED_CERT_IN_CHAIN — the pooler's certificate chains to Supabase's own CA (DW-50).
      pg_stat_ssl through the pooler reports the backend leg (ssl f), never the client leg.

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

> **Amended 2026-09-04 — ruling R-89, the monthly leg is withdrawn.** Asked at step 6 whether the
> reminder should cover monthly subscriptions as well as annual, the owner ruled **"Only annually"**.
> The **30-day annual** reminder above stands unchanged; the **7-day monthly** one is not built.
> The reason is FR-P2: twelve reminders a year to a monthly subscriber is a nudge campaign whatever
> it is called, and the statutory basis — California's ARL, the EU/UK rules — attaches to the annual
> term, not to a monthly card charge people already expect. **Nothing else in §23c moves:**
> `renewal_reminders`, its `(user_id, period_end)` primary key, AD-33's seventh cron and its E12
> ownership are all unchanged, and the decision to leave Dodo's ~2-day reminder on is unchanged too.
> *(The line above is left as written, per the standing rule that a dated decision is not rewritten
> to match a later one.)*

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

---

## 29. Ghost Build Room (step 4b) — four claims settled by execution · 2026-08-27

Four probe families from `reconcile-designs.md` §(a) were settled inside the step-4b session rather
than deferred to a spike, because the owner's rulings depended on them. Hosts: **T1**
`ghost6.inflozo.com` (6.58.0) and **T3** `ghost5.inflozo.com` (5.130.6), credentials
`tools/probe/.env`. Rulings and propagation targets: `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`.

### 29a. Probe family 2 — the members signup endpoint is JSON-only and token-gated. **Refuted the no-JS claim.**

The owner's hypothesis, from `docs.ghost.org/themes/members`, was that a `data-members-form` submits
natively and CSS renders the result — the docs describe `loading` / `success` / `error` classes on the
`<form>` and never mention JavaScript. Tested rather than argued.

    # A  native-form shape, no token
    curl -X POST "$H/members/api/send-magic-link/" \
      -H 'Content-Type: application/x-www-form-urlencoded' \
      --data 'email=probe-a@inflozo.test&emailType=subscribe&honeypot='
    # B  JSON, no token          C  GET /members/api/integrity-token/
    # D  JSON + token            E  urlencoded + token        F  -L, print url_effective

| Sent | Ghost 6.58.0 | Ghost 5.130.6 |
| --- | --- | --- |
| A · form-encoded, no token | `400 BadRequestError` | `400` **"Email is required."** |
| B · JSON, no token | `400 BadRequestError` | `500 EmailError` — *accepted*, SMTP absent |
| C · `GET …/integrity-token/` | `200` + token | `200` + token |
| D · JSON **with** token | `500 EmailError` — *accepted* | `500 EmailError` — *accepted* |
| E · form-encoded **with** token | `400 BadRequestError` | `400` **"Email is required."** |
| F · follow redirects, native shape | no redirect, ends on the API URL | no redirect, ends on the API URL |

**Three independent findings, each fatal alone.**

1. **The endpoint never parses `application/x-www-form-urlencoded`.** Row E proves it with a *valid*
   token, and Ghost 5 says so in words — the body was dropped, so `email` was missing. A native
   `<form>` cannot send JSON. Its own submit can therefore never reach this endpoint on either major.
2. **Ghost 6 additionally requires an `integrityToken`** fetched from a separate GET (B fails, D
   succeeds). A plain form cannot make a request before submitting itself.
3. **There is no redirect back** (row F). Even were a submit accepted, the browser leaves the page and
   renders raw JSON — no page survives for CSS to style.

**Where the documented classes actually come from.** `portal.min.js`
(`cdn.jsdelivr.net/ghost/portal@~2.69`, injected by `{{ghost_head}}`):

    Array.prototype.forEach.call(document.querySelectorAll(`form[data-members-form]`),
      function(t){ let n=t.querySelector(`[data-members-error]`); … t.addEventListener(`submit`,r) })
    … t.classList.remove(`loading`) … t.classList.add(`error`)

Portal attaches the submit listener and applies the classes itself. **The owner's reading of the CSS
mechanism was correct; JavaScript is what puts the class there.** Every designed sent/error state
survives — only the "works without JavaScript" promise was false.

**Recorded as a documentation defect:** `docs.ghost.org/themes/members` states none of this. The
question must not be reopened from that page alone.

### 29b. Probe family 31 — Portal's share page exists on 6.x only, and is unthemeable. **D15 held.**

`portal@~2.69` carries a real page in `getPageFromLinkPath`:

    else if (e === `share`) return { page: `share` }

Destinations present: X, Facebook, LinkedIn, Threads, Bluesky — fixed order, **no Mastodon**.
`portal@~2.51` (served to Ghost 5.130.6) has **no `share` branch**, so `data-portal="share"` falls
through to `{page:'default'}` and a Share button opens the **sign-in** modal on every Ghost 5 site.
Portal renders in a shadow-DOM iframe; theme CSS reaches nothing inside it.

**Consequence:** D15's own site-wide ordered share list stands unchanged — it works on both majors,
carries Mastodon, and can be themed.

### 29c. Ghost's native search — the sealed frame and the index's real field set

Executed while ruling out a vendored search engine (decision R-24).

    curl -sL "https://cdn.jsdelivr.net/ghost/sodo-search@~1.8/umd/sodo-search.min.js"
    curl -G "$H/ghost/api/content/search-index/posts/" --data-urlencode "key=$CONTENT_KEY"

- **It renders inside an iframe.** `this.node.contentDocument.documentElement` / `.head` / `.body`,
  with its own injected `<style>` and stylesheet URL. Theme CSS reaches nothing inside; only Ghost's
  `brandColor` crosses the boundary.
- **Triggers:** any element carrying `[data-ghost-search]` (`getCustomTriggerButtons()`), a
  `#/search` or `#/search/` fragment (`handleSearchUrl()`), and ⌘K (`addKeyboardShortcuts()`).
- **The live posts index returns exactly** `id, slug, title, excerpt, url, updated_at, visibility`
  — **no post body**. Separate `search-index/tags/` and `search-index/authors/` endpoints, `200` on
  both majors.

**Therefore full-content search does not exist natively, and no Inflozo-drawn results surface can be
styled.** Every A23 design that draws results has nothing to draw.

### 29d. Probe family 1 (order half) — `filter="id:[…]"` discards the requested order

Four known posts requested in deliberately reversed order, both majors, no `order=`:

    requested            D, C, B, A
    Ghost 6.58 returned  A, B, C, D
    Ghost 5.130 returned A, B, C, D          # = published_at desc

**Hand-picked order is not achievable with one get.** It costs **one `{{#get}}` per picked item**, and
`appendix-b1 §5` documents a per-template abort threshold that A1-7 already approaches (up to seven
gets on one page). **Still to measure:** that threshold — it fixes the hand-pick cap (R-20).

### 29e. Recorded because it bounds everything above

Both `sodo-search` and `portal` are loaded from jsDelivr at a **floating minor range** (`@~1.8`,
`@~2.69`), so their internals can change without a Ghost upgrade on the customer's site. **No Inflozo
theme may depend on their markup, class names or internal behaviour** — only on the documented
attribute surface (`data-ghost-search`, `data-portal`, `data-members-*`).

---

## 30. VERIFY item 47 — the `{{#get}}` abort threshold, measured · 2026-08-27 · **it is not per template**

Run before the inventory merge, as ruling R-20 and §E-1 of `reconcile-designs-decisions.md` require.
It was the only number those rulings left open. `tools/probe/run-verify-47.py`, against **T1**
(`ghost6.inflozo.com`, 6.58.0) and **T3** (`ghost5.inflozo.com`, 5.130.6).

    python3 tools/probe/run-verify-47.py              # N distinct single-id gets
    python3 tools/probe/run-verify-47.py --identical  # the same id, N times

**Method.** One probe theme, five templates, each carrying a different number of single-id
`{{#get "posts" filter="id:…" limit="1"}}` blocks — exactly the shape hand-picked order costs after
§29d. Each route rendered three times; the table reports best-of-three, how many gets actually
resolved, whether `data-aborted-get-helper` appeared and whether `X-Ghost-Degraded-Render` was set.
The probe uploads its theme, restores the previously active one and deletes itself.

### 30a. No abort, at any count either major reaches

| gets on one template | T1 6.58.0 best | T3 5.130.6 best | resolved | `data-aborted-get-helper` | `X-Ghost-Degraded-Render` |
|---|---|---|---|---|---|
| 1 | 0.650 s | 0.666 s | 1 / 1 | none | unset |
| 8 | 0.770 s | 0.709 s | 8 / 8 | none | unset |
| 16 | 0.855 s | 0.775 s | 16 / 16 | none | unset |
| 24 | 0.923 s | 0.881 s | 24 / 24 | none | unset |
| 33 | 0.967 s | 0.912 s | 33 / 33 | none | unset |

A first pass ran the same ladder to **36 · 48 · 72 · 100 · 150** gets on one template. **Every get
resolved on both majors, with no abort marker and no degraded-render header** — 150 gets rendered in
1.855 s (T1) and 1.563 s (T3). The table above is the re-run with **all ids distinct**, because
Ghost 6 dedups identical queries (§30c) and the high ladder cycled a 33-post fixture.

**Marginal cost of one hand-picked item: ≈ 10 ms on Ghost 6, ≈ 8 ms on Ghost 5** — 32 further gets
cost 0.317 s and 0.246 s respectively.

### 30b. What actually aborts is one slow get, at 5000 ms, on both majors

`optimization.getHelper.timeout.threshold` in `core/shared/config/defaults.json` is **5000**
(`level: error`) at **v5.130.6 and v6.58.0 alike**, with a separate `notify.threshold` of 200 ms that
only logs a warning. `core/frontend/helpers/get.js` races **each invocation** against that timer:

    // get.js — one race per {{#get}} call, not one per template
    const timeout = new Promise((resolve) => { … `{{#get}} took longer than ${threshold}ms and was aborted` … }, threshold);
    response = await Promise.race([apiResponse, timeout]);

    // and, on abort:
    return new SafeString(`<span data-aborted-get-helper>Could not load content</span>` + rendered);

**There is no cumulative per-template budget.** Twelve fast gets are twelve independent 5-second
races, not one shared one. `appendix-b1 §5` and §29d both said "a per-template abort threshold";
that reading is corrected in place by this section.

### 30c. Ghost 6 dedups identical `{{#get}}` queries within one render; Ghost 5 does not

`get.js` on 6.58.0 carries `generateCacheKey(resource, apiOptions)` and a per-request
`options.data._queryCache` Map that stores the in-flight promise, so two identical gets on one page
cost one API call. **v5.130.6 has no such code.** Measured, same id repeated N times:

| gets | T1 6.58.0 identical / distinct | T3 5.130.6 identical / distinct |
|---|---|---|
| 24 | 0.859 s / 0.923 s | 0.864 s / 0.881 s |
| 33 | 0.881 s / 0.967 s | 1.002 s / 0.912 s |

The difference is inside run-to-run noise at this size — **the query is cheap enough that the cache
does not dominate.** It is recorded because hand-picking never sends duplicate ids, so the cache is
not available to it on either major, and because it is a real 5→6 behaviour difference.

### 30d. Consequence for R-20

The hand-pick cap **is not a platform limit**. Ghost imposes none in the range any section would
use. R-20's "about twelve per section" therefore **stands at twelve as ruled**, on a latency budget
rather than an abort threshold — item 47 anticipated only the downward correction ("if the threshold
is low, the cap drops"), and the threshold is not low. Twelve picks cost ≈ 0.12 s of extra server
render on an idle Ghost. **Raising it above twelve would be a new owner decision, not a consequence
of this measurement**, and is flagged as such rather than taken here.

---

## 31. E-2, E-3 and E-4 — the three probes `reconcile-designs-decisions.md` §E left open · 2026-08-31

Run before step 5, on the owner's instruction. All three are closed here. **Two of the three refuted
the premise of the ruling that asked for them**, which is now the fourth and fifth time that has
happened in this project and the reason standing rule 1 exists.

### 31a. `feature_image_caption` — E-2. The field is a SafeString; **R-10 #7 is withdrawn**

    python3 tools/probe/run-verify-e2.py

**The ask.** R-10 #7 said A24 and A26 need "a second triple-stash carve-out" to AD-5(2), and marked
itself not applicable until this ran. AD-5(2) exists because a triple stash is an XSS surface, so the
carve-out is only justified if the double stash actually escapes.

**Method.** Two posts per host — a SUBJECT whose `feature_image_caption` carries mixed markup
(`<a href>`, `<em>`, `<strong>`, `<b>`, `<script>`, an entity) and a CONTROL carrying plain text with
no markup at all — then one theme printing **both** stashes around each, rendered live, plus gscan
4.49.7 and 6.4.2 over that theme through `tools/stress/gate.js`.

**Two controls, both passed** (standing rule 2). *Render control:* on the plain-text CONTROL post the
two stashes rendered identically on both majors — so any difference on the SUBJECT is Ghost's, not the
probe's markup. *gscan control:* the same theme was scanned with the triple stash and again with it
removed, and produced an **identical rule set** — so "gscan does not object" is a measurement and not
an absence of signal.

| Question | T1 · Ghost 6.58.0 | T3 · Ghost 5.130.6 |
|---|---|---|
| Stored shape (Admin API and Content API) | **HTML, verbatim** — including `<script>alert(1)</script>` | **HTML, verbatim** — including `<script>alert(1)</script>` |
| `{{feature_image_caption}}` vs `{{{…}}}` | **identical** | **identical** |
| gscan on a theme carrying the triple stash | indifferent — same rules with and without | indifferent — same rules with and without |

**Finding 1 — the double stash does not escape this field, so the carve-out is unnecessary.**
Ghost hands `feature_image_caption` to Handlebars already marked safe; `{{ }}` and `{{{ }}}` produce
byte-identical output on both majors. **R-10 #7 is WITHDRAWN, not applied** — AD-5(2) does not move,
and A24/A26 render captions with the ordinary double stash. Using `{{{ }}}` here would add an XSS
surface and buy nothing.

**Finding 2 — Ghost 6 sanitises this field at render and Ghost 5 does not.** Same stored bytes, same
template, different output:

| Sent | Stored (both) | T1 renders | T3 renders |
|---|---|---|---|
| `<a href="…">A Person</a>` | verbatim | **kept** | kept |
| `<em>em</em>` | verbatim | **stripped to `em`** | kept |
| `<strong>strong</strong>` | verbatim | **stripped to `strong`** | kept |
| `<b>b</b>` | verbatim | **kept** | kept |
| `<script>alert(1)</script>` | verbatim | **removed entirely** | **emitted into the page** |

Two consequences, and neither is a theme's to fix. **(a)** A caption designed with italics gets them on
Ghost 5 and loses them on Ghost 6 — a cross-major rendering difference A24 and A26 must state rather
than discover. **(b)** On Ghost 5 the field is an **unescapable script vector**: it stores a `<script>`
verbatim, emits it into the page, and the theme cannot escape it because the double stash does not
escape either. The author is trusted staff, so this is self-inflicted rather than visitor-supplied —
but *"a theme can make this safe"* is false and is now written down. Register item **53**.

### 31b. `cacheMembersContent` — E-3. Read in source on both majors; **it gives R-28 its mechanism**

Read rather than toggled: the flag is absent from `defaults.json` and from both hosts'
`config.production.json`, so it is **experimental and off by default**, and reading the branch it
controls answers the question without changing a live server's configuration.

    ssh root@ghost6.inflozo.com  # /var/www/ghost6/versions/6.58.0/core/…
    ssh root@ghost5.inflozo.com  # /var/www/ghost5/versions/5.130.6/core/…

`core/frontend/web/middleware/frontend-caching.js`, **identical on 6.58.0 and 5.130.6**:

```js
// CASE: Never cache if the request is made by a member and the site is not configured to cache members content
if (res.isPrivateBlog || (req.member && !shouldCacheMembersContent)) {
    return shared.middleware.cacheControl('private')(req, res, next);
}
// CASE: Cache member's content if this feature is enabled
if (req.member && shouldCacheMembersContent) {
    const memberTier = calculateMemberTier(req.member, freeTier);
    if (!memberTier) {            // more than one active subscription -> not cached
        return shared.middleware.cacheControl('private')(req, res, next);
    }
    res.set({'X-Member-Cache-Tier': memberTier.id});
    return shared.middleware.cacheControl('public', {maxAge: config.get('caching:frontend:maxAge')})(req, res, next);
}
```

**Finding.** With the flag **off** — the default, and the state of both probe hosts — a member's page is
`Cache-Control: private` and nothing is shared. With it **on**, a member's rendered page is cached
**`public`, keyed only by tier**. So **any `@member` value that is not tier-derived — `@member.email`,
`@member.name`, `@member.uuid` — server-rendered into a page would be cached publicly and served to
every other member on that tier.** A theme cannot detect the flag and cannot opt out of it.

This is **not** confirmatory as §E assumed. It is the mechanism behind **AD-38 / R-28** — "member PII is
never server-rendered" — which until now was a prudent rule with no stated failure mode. It now has
one, on both majors. Register item **54**.

### 31c. `<details name>` at the FR-G8 pin — E-4. **Newly, not Widely: the Tier-2 entry is required**

Read from `web-features` **3.36.0**, the dataset FR-G8 computes its floor from (§6 of
`research-section-js-libraries.md`).

| | |
|---|---|
| Feature | `details-name` — *Mutually exclusive `<details>` elements* |
| Baseline status | **`low`** (Newly available) |
| `baseline_low_date` | **2024-09-03** |
| Becomes Baseline **Widely** | **2027-03-03** (low + 30 months) |
| FR-G8's pin | `widelyAvailableOnDate: 2026-08-18` |
| Verdict at the pin | **NEWLY — so the Tier-2 allowlist entry is REQUIRED**, and R-15's wording stands |

**And D19's "acceptable degradation" now has a measured floor.** `details-name` support begins at
Chrome/Edge 120, **Firefox 130**, Safari/iOS 17.2. FR-G8's pinned floor is Chrome/Edge 121,
**Firefox 122**, Safari/iOS 17.2 — so the browsers that fall short are **Firefox 122–129 only**;
every other browser inside the floor supports it. D19 said an older browser may show more than one
panel open and nothing is built for it. That is now a named eight-version window rather than an
open-ended risk. Register item **55**.

**This entry expires when the pin moves.** `details-name` reaches Widely on 2027-03-03, and a
`widelyAvailableOnDate` at or beyond that date makes the Tier-2 entry unnecessary — recompute rather
than assume (`prd.md` §7.6 verify item 17).

---

## 32. `{{comment_count}}` substitutes nothing — R-10 #8 is right, and `appendix-h1`'s reason was wrong · 2026-08-31

    python3 tools/probe/run-verify-comment-count.py

**Why this ran.** R-10 #8 said *"strike `%` from `comments.count_*`"*. `appendix-h1` §3.9 said the
opposite **and gave a reason**: *"`comments.count_one` / `count_many` use `%` rather than `{count}`
because Ghost's `{{plural}}` / `{{comment_count}}` helpers substitute `%` themselves."* One of the two
had to be wrong, and the claim under R-10 #8 belongs to probe family 30, which had never been run.
Applying either on argument would have been the failure standing rule 1 exists to prevent.

**The first run's control FAILED, and that was the finding.** It asked "does exactly one of `%` and
`{count}` get substituted?" Neither does. `{{comment_count}}` performs **no server-side substitution at
all** — it emits a `<script>` carrying `data-ghost-comment-count-*` attributes and **no text and no
number**. Both placeholders reach the attribute verbatim. The probe refused to report a result, which
is the control working exactly as intended.

**Server side, both majors** (`<div>` markers stripped for width):

| Template | Emitted |
|---|---|
| `{{comment_count}}` | `<script data-ghost-comment-count="<id>" …-singular="comment" …-plural="comments" …-tag="span" …-autowrap="true">` |
| `{{comment_count singular="% comment" …}}` | same, with `…-singular="% comment"` — **verbatim** |
| `{{comment_count singular="{count} comment" …}}` | same, with `…-singular="{count} comment"` — **verbatim** |

**Client side.** `core/frontend/public/comment-counts.min.js`, and its source
`core/frontend/src/comment-counts/comment-counts.js` — **identical on 6.58.0 and 5.130.6**:

```js
let text = e.dataset.ghostCommentCountEmpty;
if (count === 1) { text = e.dataset.ghostCommentCountSingular
                        ? `${count} ${e.dataset.ghostCommentCountSingular}` : count; }
if (count  >  1) { text = e.dataset.ghostCommentCountPlural
                        ? `${count} ${e.dataset.ghostCommentCountPlural}`   : count; }
```

**It replaces nothing. It PREPENDS the count and a space.** The script then creates an element of
`…-tag` (default `span`), sets its `textContent`, inserts it after itself and removes itself.

**Three findings.**

1. **`%` is a visible defect, so R-10 #8 is CONFIRMED** — but not for the reason it gave. A value of
   `"% comment"` renders **`1 % comment`** on the page. The correct catalog value is the **bare noun**:
   `comments.count_one` = `comment`, `comments.count_many` = `comments`. No placeholder, no number.
2. **`appendix-h1` §3.9's stated reason is FALSE for `{{comment_count}}`** and is corrected there.
   **Scope note:** `{{plural}}` is a *different helper* and was **not** tested here — it may well
   substitute `%`. The appendix's sentence bundled the two; only the `{{comment_count}}` half is
   disproved, and the correction says so rather than tarring both.
3. **With JavaScript off there is no count and no word — there is nothing.** The `<script>` renders
   invisibly and no element is ever inserted. Not "0 comments", not an empty string in a styled box:
   the element does not exist. Every A28 design's no-JS line must say that, and any design that reads
   the count aloud needs its `aria-label` fallback on the surrounding element rather than on the count
   (R-10 #8's other two clauses, both confirmed). `{{comments}}` itself does render server-side —
   544 characters on both hosts — so the widget and its count degrade differently.

**Control:** the bare `{{comment_count}}` call emits its own default singular/plural attributes, distinct
from the hash-param cases — proving the attributes reflect the arguments rather than being fixed, which
is what makes "passed through verbatim" a measurement. Passed on both hosts. Register item **56**.

---

## 33. Ghost Admin's backup paths DO differ between the majors — register 41 · 2026-08-31

`BACKUP-GATE.md` hard-codes an Admin menu path per backup option, read from Ghost's documentation on
2026-08-21. Register item 41 suspected at least one is wrong for one major. **It is worse than one
path: on Ghost 6 the whole branch the paths name does not exist.**

Read from the built admin bundle on each server — `core/built/admin/assets` — not from documentation.

| | T3 · Ghost 5.130.6 | T1 · Ghost 6.58.0 |
|---|---|---|
| `Advanced` label present | **yes** | **no** |
| `Labs` label present | **yes** | **no route** — `labs` survives only as a settings *key*, a JSON blob read by feature flags |
| `Import/Export` label present | **yes** | **no** |
| `Export` label present | **yes** | replaced — see below |
| Settings routes | Advanced → Labs, Import/Export | **`settings/migration`**, and there is **no `settings/advanced` and no `settings/labs`** |

Ghost 6's full settings route list, read from the bundle: `about · access · analytics · api · design ·
emails · integrations · memberemails · members · **migration** · newsletters · recommendations ·
routes · staff · stripe · stripe-connect · theme · verifications`.

**And the export UI is behind a feature flag on Ghost 6.** The bundle carries a lab flag
`selfServeArchives`, described in its own text as *"Replaces the individual export buttons with a
single **Export data** flow for downloading a full site archive"* — so on Ghost 6 what a customer sees
depends on a flag Inflozo does not control and cannot read from a theme.

**Verdict.** `BACKUP-GATE.md`'s paths are **correct for Ghost 5 and wrong for Ghost 6**, and the fix is
not to write a second hard-coded path: the Ghost 6 surface is itself flag-dependent, so any path we
bake in is wrong for some customers on the day we ship it. The gate **links to Ghost's own help for
the connected site's major** and describes what the customer is looking for rather than the clicks to
reach it.

**Scope of this evidence, stated so it is not over-read.** This is the built admin **bundle** — the
routes and labels the app ships. It is not a click-through of a live admin, so the exact Ghost 6 label
chain a customer sees is **not** established here; what is established is that the Ghost 5 chain does
not exist on Ghost 6. Capturing the real Ghost 6 wording is E15's job against a live admin.
Register item **41**.

---

## 34. Supabase Storage has NO recovery of its own — register 38's precondition · 2026-08-31

The owner ruled on 2026-08-31 to keep a second copy of the two unrecoverable buckets. The ruling
named two things to verify before the mechanism is built. Both are read here, from Supabase's own
pages rather than from memory.

**(i) Does Supabase Storage already offer versioning, soft delete or a retention window?**
Read at `supabase.com/docs/guides/storage`: **no.** The page documents multi-protocol access, CDN
delivery, image transformation and access control, and **says nothing about versioning, soft delete,
retention or recovery of a deleted object.** There is no built-in undo to lean on, so the second copy
is **necessary, not merely prudent** — the option the ruling offered as "rely on what Supabase
already gives us" does not exist.

**(ii) Current pricing, because "single-digit dollars" was an estimate carried from Round 4.**
Read at `supabase.com/pricing`, Pro plan: **100 GB storage included, then $0.0213 per GB per month**;
egress **250 GB included, then $0.03 per GB**.

**What that makes the second copy cost.** It is a duplicate of two buckets, so its price is the
duplicated bytes at $0.0213/GB/month **once the 100 GB included allowance is used** — and the copy is
written once per object and read only in a recovery, so it adds storage but essentially no egress.
Below the allowance it is **free**; at, say, 50 GB of duplicated artifacts beyond it, **about $1.07 a
month**. The Round 4 estimate was the right order of magnitude and is now a read figure rather than a
recollection.

**This expires.** Both are facts about an external platform on a date, and Supabase changes both its
feature set and its prices. **Re-read before E1 builds the mechanism** — if versioning has shipped by
then it may replace the copy entirely. Register item **38**.

---

## 35. A33's unverified card selectors — eight confirmed, one refuted, two findings nobody asked for · 2026-09-03

    python3 tools/probe/run-verify-a33-cards.py

**The ask.** A33 ships a stylesheet and nothing else: its whole job is selecting Ghost's own card
markup inside a post body, where we own the stylesheet and nothing else. Six of its selectors were
marked `unverified`, two of them absent from Ghost's published class list. **A wrong selector styles
nothing and does it silently** — no build fails, no test goes red, the card renders unstyled on a
customer's site.

**Method, and why it is a source read.** Ghost renders Koenig cards from `@tryghost/kg-default-nodes`
— one renderer per card type, class names as literals. Reading the renderer is more direct than
constructing twenty cards through the Admin API, and it covers cards a fixture cannot exercise: the
email card never renders on the web at all, so no post could have shown its class.

**The control caught a real error on the first run.** Four classes Ghost documents —
`kg-image-card`, `kg-bookmark-card`, `kg-gallery-card`, `kg-toggle-card` — must come back or the
extractor is reading the wrong thing. On the first run **Ghost 5 returned zero card types**: the
probe had assumed Ghost 6's path (`build/cjs/nodes`) and Ghost 5 uses `lib/nodes`. It refused to
report the unknowns. The path is now found rather than assumed.

### 35a. Eight of nine assumptions hold, on both majors

| Card | A33 assumed | T1 6.58.0 | T3 5.130.6 |
|---|---|---|---|
| call-to-action | `kg-cta-card` ⚑ *was unverified* | **confirmed** | **confirmed** |
| callout | `kg-callout-card` | confirmed | confirmed |
| product | `kg-product-card` ⚑ *inners unverified* | **confirmed**, and the inners are `kg-product-title`, `kg-product-image`, `kg-product-description-wrapper`, `kg-product-button-wrapper` | confirmed |
| header | `kg-header-card` ⚑ *Ghost 6 shape unverified* | **confirmed**, and the shape is now known — see §35c | confirmed |
| image · bookmark · gallery · toggle | *(the control)* | confirmed | confirmed |

### 35b. One assumption is WRONG, and the fix is deletion rather than correction

**`kg-email-card` does not exist on the web, and never did.** The email card's renderer:

```js
if (!html || options.target !== 'email') {
    return renderEmptyContainer(document);
}
```

On any web render the target is not `email`, so the card returns an **empty container** — no class,
no element to style. **A33's `.kg-email-card` rule matches nothing, ever.** The spec was right that
the card "never renders on the web" and wrong to carry a selector for it anyway. **Remove the
selector rather than correcting it**; there is nothing to correct it to.

### 35c. Ghost 6's header card, now that it is readable

`kg-header-card` plus `kg-v2` and, per configuration: `kg-header-card-content`,
`kg-header-card-heading`, `kg-header-card-subheading`, `kg-header-card-subheading-wrapper`,
`kg-header-card-text`, `kg-header-card-image`, `kg-header-button-wrapper`, `kg-style-accent`,
`kg-style-image`, `kg-layout-split`, `kg-size-large`, `kg-swapped`, `kg-align-center`,
`kg-content-wide`.

### 35d. TWO FINDINGS NOBODY ASKED FOR, and the second is the one that matters

**(1) `kg-nft-card` is still in both builds.** A33 draws twenty cards and this is a twenty-first.
Whether to style it or to state that it is deliberately unstyled is a decision, not a fix.

**(2) Ghost 5 ships TWO renderers, and six card types emit DIFFERENT classes depending on which.**
5.130.6 carries both `kg-default-nodes` (Lexical) and `kg-default-cards` (mobiledoc), because a
Ghost 5 site can hold posts written before Lexical. Where they differ:

| Card | Lexical only | Mobiledoc only |
|---|---|---|
| **header** | the entire `kg-header-card-*` set above, `kg-v2`, `kg-style-*`, `kg-layout-split` | — |
| **file** | — | `kg-file-card-medium`, `kg-file-card-small` |
| **product** | `kg-product-title`, `kg-product-image`, `kg-product-description-wrapper`, `kg-product-button-wrapper` | — |
| **video** | `kg-thumbnail`, `kg-custom-thumbnail`, `kg-width-wide`, `kg-width-full` | — |
| **embed** | `kg-twitter-card`, `kg-twitter-link` | — |

**So an older Ghost 5 post renders cards A33's selectors will not match** — most severely the header
card, which in mobiledoc carries almost none of the structure the treatments style. This was on
nobody's list and no spec mentions it. It needs a ruling: style both shapes, or state that Inflozo's
card treatments apply to Lexical posts only and say so where a customer can see it. Register item
**57**.

---

## 36. Ghost has no focal point, so Image focus is ours to resolve · 2026-09-03

Checked during the pass-five stress test, because every Image-focus prompt asserts *"Ghost never sees
this — it is a hint the compiler resolves"* and that is a claim about an external platform. R-51 gives
the control a second axis; if Ghost had a focal-point parameter, the control would be a **binding**
rather than a hint and would belong in a different half of the architecture entirely.

Read from Ghost's own `img_url` helper on T1 (6.58.0):

| | |
|---|---|
| Parameters `img_url` accepts | `absolute` · `format` · `size` — **and nothing else** |
| Focal point / gravity / crop | **absent** — no such option exists anywhere in the helper or the image-size utilities |

**So the claim holds.** A focus value never reaches Ghost: Inflozo resolves the crop at compile and
emits the result, which is why Image focus is a **control** and not a data binding, and why it can
carry a horizontal axis at all without Ghost having to support one.

**This expires with the helper.** If Ghost ever adds a focal-point parameter, the right design would
change — the crop could be deferred to Ghost's own image service rather than baked at compile.
Re-read at any Ghost major. Register item **58**.

## 37. Admin API keys do not expire — what Ghost returns for a regenerated key · 2026-09-03

Executed during the step-5b/5c review pass (F-062), because two lifted frames, the voice canon and
the PRD's own error-copy example all rested on "Ghost said no — your Admin key expired", a cause no
one had seen Ghost produce. Read-only, `GET` only, integration key and staff token from
`tools/probe/.env`; the JWT is minted exactly as FR-C2 mints it.

    cd <scratchpad>/ravi && python3 probe-ro.py      # GET only; nothing written

Control first — the real integration key on both servers:

    T3 Ghost 5 https://ghost5.inflozo.com   config/ (integration) 200 version= 5.130.6
    T1 Ghost 6 https://ghost6.inflozo.com   config/ (integration) 200 version= 6.58.0

Then a correctly formed JWT whose `kid` is a key id Ghost has never issued (the shape of a key that
was regenerated or whose integration was deleted), a JWT signed with the wrong secret, and a
tampered signature — identical on both majors:

    bogus key id ->  401 Unknown Admin API Key | UnauthorizedError
    wrong secret ->  401 Invalid token: invalid signature
    tampered jwt ->  401 Invalid token: invalid signature

Read in source (Ghost 6.54.1, local checkout): `core/server/services/auth/api-key/admin.js:15,129` —
`unknownAdminApiKey: 'Unknown Admin API Key'`, `code: 'UNKNOWN_ADMIN_API_KEY'`, thrown when
`models.ApiKey.findOne({id: apiKeyId})` finds nothing; `core/server/data/schema/schema.js:387`
`api_keys` — `id, type, secret, …` and **no expiry column**. Read at docs.ghost.org/admin-api:
"You can regenerate the Admin API key any time"; the only thing with an expiry is the JWT Inflozo
mints ("Max 5 minutes after 'now'").

**So "your Admin key expired" is a failure that does not exist.** The real causes are: the key was
regenerated or the integration deleted in Ghost Admin (401 `Unknown Admin API Key`), **or the key was
issued by a DIFFERENT Ghost install (the same 401 `Unknown Admin API Key`)**, or Inflozo mis-signed
the JWT (401 `Invalid token`, a bug of ours, never the user's). Propagated: `prd.md`
Appendix H's example, `EXPERIENCE.md`'s voice table, prompt A7 item 11 (S8d′ and S11a), AD-24's
mapping owes one row per code.

**The third cause, added 2026-09-09 and executed on both majors.** It follows from the source read
above and was assumed away for a whole story before anyone ran it. `models.ApiKey.findOne({id:
apiKeyId})` looks the key up by id in `api_keys`, and that table has **no domain, url, site or install
column** — Ghost's own `url` is a config-file value, not a database one. So "does this key belong to
this install" is decided entirely by *which database the request reaches*, and a key from another
install is indistinguishable from a key that was never issued. Both are `Unknown Admin API Key`.

    # T1 = ghost6.inflozo.com (6.58.0), T3 = ghost5.inflozo.com (5.130.6)
    GHOST6_ADMIN_API_KEY -> T1 GET /ghost/api/admin/config/    200        <- the control
    GHOST5_ADMIN_API_KEY -> T1 GET /ghost/api/admin/config/    401 UNKNOWN_ADMIN_API_KEY
    GHOST6_ADMIN_API_KEY -> T3 GET /ghost/api/admin/config/    401 UNKNOWN_ADMIN_API_KEY

**The consequence, and it is a product rule** (owner's ruling **R-100**, 2026-09-09, at Story 3.6's
review): **no surface may claim to have recognised another site's key.** Story 3.6's Manage keys
originally promised the sentence "These keys belong to a different Ghost site" for that case; there is
no answer from Ghost that earns it. The key is refused and nothing is written — by this 401 — and the
sentence shown is this code's own. `GET /admin/site/` is kept for the question it *can* answer: what
public address this Ghost reports now, versus the one recorded at connect, which is a domain move.

⛔ **Unobserved, and it would break the first paragraph rather than this one:** two Ghost installs
sharing one database (a staging instance restored from a production dump) would accept each other's
keys at `config/` outright, because the lookup would find the row. That is a real configuration and
no probe here has produced it; FR-C6 already records the neighbouring fact that one address can serve
a different install after a cutover, which is why a snapshot is never adopted on URL match alone.

Two things recorded in passing from the same run, both majors:

    settings/routes/yaml/ (integration) 200 ok      <- readable with the Admin API key alone
    settings/routes/yaml/ (staff)       200 ok
    themes/ (integration) 501 (Ghost 5) / 403 (Ghost 6)   <- unchanged from §15h
    themes/ (staff)       200, themes listed

The first is why `BACKUP-GATE.md` records that `routes.yaml` *could* be offered as a download on the
no-token path; the ruling of 2026-09-03 (F-077) ties both downloads to the staff token and the
loosening is left to the owner.

## 38. What connect can read with no key, and what a browser can read with the Content key · 2026-09-08

Story 3.2's wizard rests on three claims about the two live Ghosts that nothing above had executed. Run
from this machine at Create, keys read from `tools/probe/.env` by name (`GHOST6_URL`, `GHOST5_URL`,
`GHOST6_CONTENT_API_KEY`, `GHOST5_CONTENT_API_KEY`); `curl` with a 15 s ceiling.

**(a) `GET /admin/site/` answers with NO credential at all, on both majors** — which is why FR-C2 forbids it
as a validator and why 3.2 reads it only *after* `config/` has passed:

    ghost6 (6.58.0)  GET /ghost/api/admin/site/   200  title "Ghost6"  url "https://ghost6.inflozo.com/"
                     version "6.58"  accent_color "#FF1A75"  logo null  icon null  description null
    ghost5 (5.130.6) GET /ghost/api/admin/site/   200  title "Ghost5"  url "https://ghost5.inflozo.com/"
                     version "5.130"  description "Thoughts, stories and ideas."

`version` here is TWO parts; `GET /admin/config/` (3.1's harness, `config-no-version`) answers the full
`6.58.0` / `5.130.6`, and that is what `sites.ghost_version` stores. The public `url` carries a trailing slash.

**(b) The Content API is readable from a browser origin, and the preflight allows `Accept-Version`:**

    GET /ghost/api/content/settings/?key=<content key>   Origin: https://app.inflozo.com   Accept-Version: v5.0
      ghost6 -> 200, access-control-allow-origin: *, vary: Accept-Version, Accept-Encoding
      ghost5 -> 200, access-control-allow-origin: *   (settings incl. title, url, accent_color, codeinjection_*)
    OPTIONS (same URL)  Origin + Access-Control-Request-Method: GET + Access-Control-Request-Headers: accept-version
      both  -> 204, access-control-allow-origin: *, access-control-allow-headers: accept-version, max-age 86400
    GET with a 25-hex key Ghost never issued
      both  -> 401  UnauthorizedError | "Unknown Content API Key"

So a browser-side `settings` read with `Accept-Version: v5.0` works against both majors, and a wrong key is
a 401 with that message. The app's CSP is the only thing that could block it (`csp.ts`, 3.2 widens
`connect-src` to `https:` — the origin being checked at connect is never a stored one).

**(c) Plain `http://` to the admin API is refused, not redirected, on both:**

    GET http://ghost6.inflozo.com/ghost/api/admin/config/   -> 403 Forbidden, no Location
    GET http://ghost5.inflozo.com/ghost/api/admin/config/   -> 403 Forbidden, no Location

An `http://` site address therefore fails at validation with Ghost's own 403 (the chokepoint's `ghost_refused`
family), which is why 3.2 warns the moment the field says `http://` rather than after Connect.

**(c) corrected, 2026-09-08 (Story 3.2's code review, the Real-infra verifier): the 403 above was measured with
NO credential, and that is not the request the wizard makes.** Re-executed with the request shape `fetchWithKey`
sends — the JWT minted from the real Admin key, `redirect` not followed (`urllib` with the redirect handler
disabled, cross-checked with `curl` without `-L`), keys `GHOST6_ADMIN_API_KEY` / `GHOST5_ADMIN_API_KEY` by name:

    GET http://ghost6.inflozo.com/ghost/api/admin/config/   Authorization: Ghost <jwt>   -> 301  Location: https://ghost6.inflozo.com/ghost/api/admin/config/
    GET http://ghost5.inflozo.com/ghost/api/admin/config/   Authorization: Ghost <jwt>   -> 301  Location: https://ghost5.inflozo.com/ghost/api/admin/config/
      body "Moved Permanently. Redirecting to https://…" — Express's redirect, issued by Ghost once the key authenticates
    the same with no header                                                              -> 403  (the shape (c) had measured)
    the same with `Authorization: Ghost garbage`                                         -> 400
    the same with a well-formed JWT whose kid Ghost never issued                         -> 401  Unknown Admin API Key
    a client that FOLLOWED the 301 read HTTP 200 with the full config body — a probe that forgets
      `redirect: manual` would "prove" plain http works

So the answer is decided by authentication, and a plain-http address with a valid key is a REDIRECT, which the
chokepoint answers as `ghost_redirected` ("Your site sent us somewhere else. Connect with the address your site
actually uses.") and never follows (`redirect: 'manual'`, 3.1's review) — the audit row carries `status: 301`.
No row is written either way; the warning under the field still comes first. 3.2's harness step `http-connect`
executes this shape through the deployed wizard.

**Not executed, and cannot be:** a Ghost 4.x — no server exists (T1 is 6, T3 is 5). The "please update
Ghost" refusal is proved on the version rule alone (`lib/connect-rule.ts`) with `4.48.0` injected.

## 39. What the integration key reads from `GET /admin/settings/`, and what it may not write · 2026-09-08

Story 3.3's four connect-time probes read two Admin endpoints. §15h item 21 had measured the three
announcement keys with a **Staff Access Token** — a credential Inflozo does not hold until Epic 7 —
so "the integration key can read them too" was a hypothesis, not a fact. Executed on both live test
servers with the keys named by variable, no value printed: **T1** `ghost6.inflozo.com` 6.58.0
(`GHOST6_ADMIN_API_KEY`) and **T3** `ghost5.inflozo.com` 5.130.6 (`GHOST5_ADMIN_API_KEY`).

    GET /ghost/api/admin/config/    Authorization: Ghost <jwt>  Accept-Version: v6.0  -> 200
    GET /ghost/api/admin/settings/  Authorization: Ghost <jwt>  Accept-Version: v6.0  -> 200
      (and the same two on T3 with v5.0 -> 200, 200)

**(a) `hostSettings` is absent on both majors, re-confirmed.** `config.config` answers, on T1,
`clientExtensions, database, emailAnalytics, enableDeveloperExperiments, environment,
exploreTestimonialsUrl, klipy, labs, mail, mailgunIsConfigured, security, signupForm, stripeDirect,
useGravatar, version` — and on T3 the same list with `tenor` for `klipy` and no `klipy`. **Neither
carries `hostSettings`**, which is what §15h item 2 found and what makes both sites self-hosted and
unlimited: `capability` `full`, `capability_source` `probe`. A real Ghost(Pro) payload remains
**⛔ unobserved** until the §4 T4 Starter trial.

**(b) `settings/` answers `{ meta, settings: [{ key, value }, …] }` — a flat array, not an object.**
T1 returns 117 rows and T3 99; the first row of each is `{"key": "title", "value": "Ghost6"}` /
`"Ghost5"`. `apps/web/lib/probe-rule.ts`'s `settingsOf` flattens it once.

**(c) All six keys the probes read are in the INTEGRATION key's payload, on both majors.** Values as
found on 2026-09-08:

    portal_button            false                                          (a real JSON boolean, both)
    codeinjection_head       ""                                             (both)
    codeinjection_foot       ""                                             (both, before this session)
    announcement_content     "<p>Fixture announcement — seeded for VERIFY 21.</p>"  (both)
    announcement_background  "accent"                                       (both)
    announcement_visibility  "[\"visitors\"]"                               (both — a JSON STRING)

So `portal_button` is readable on both and the Portal question is unreachable here — `portal_button_source`
is `probe`, and the `default`/question branch is a unit contract and a seeded harness step. And
`announcement_visibility` is confirmed to be a **JSON string** through the integration key, exactly
as §15h item 21 saw it through the staff token; Story 3.4's seed decides its shape, so 3.3 stores it
verbatim.

**(d) The integration key may NOT write settings — 403 on Ghost 6, 501 on Ghost 5.** The same major
split as `GET /admin/themes/` (AD-24). This is why Story 3.3's harness step `injection-live` signs
its one sanctioned write with the harness's own staff token:

    PUT /ghost/api/admin/settings/  {"settings":[{"key":"codeinjection_foot","value":"<!-- x -->"}]}
      with GHOST6_ADMIN_API_KEY  -> 403  {"type":"NoPermissionError","message":"API tokens do not have permission to access this endpoint"}
      with GHOST5_ADMIN_API_KEY  -> 501  {"type":"NotImplementedError","message":"The server does not support the functionality required to fulfill the request."}
      with GHOST6_STAFF_ACCESS_TOKEN / GHOST5_STAFF_ACCESS_TOKEN  -> 200, and the value is then
        readable through the INTEGRATION key on the same server

The product's own allowlist is untouched by this: `permitted()` denies every non-GET Inflozo could
make, and the write is the harness's alone (the owner's ruling, 2026-09-08, Story 3.3 Question 1).

**(e) Ghost normalises an empty code-injection box to `null` and will not answer `""` again.** Found
`""` on both servers, wrote `<!-- inflozo probe -->`, wrote `""` back — and both then read `null`;
writing `null` explicitly also reads `null`. So a restore is byte-identical in **content** (the box
is empty, as it was found) but not in Ghost's JSON representation of empty, and the harness's
`same_box` asserts on the content for that reason. The product cannot tell the two apart either:
`injectionFlag` treats `""`, `null` and an absent key as the same "no code injection".

## 40. The seven brand keys in `GET /admin/settings/`, key by key, on both majors · 2026-09-08

Story 3.4 adds a **fifth reader** to the payload §39 measured — `brandOf` — and FR-C4's whole
screen is built from what it returns, so the container of each key had to be executed rather than
assumed (standing rule 1). `announcement_visibility` had already turned out to be a JSON *string*
(§39c), which made `navigation` a real question and not a pedantic one. Executed with the
**integration** key alone, no Staff Access Token, keys named by variable and no value printed:
**T1** `ghost6.inflozo.com` 6.58.0 (`GHOST6_ADMIN_API_KEY`) and **T3** `ghost5.inflozo.com` 5.130.6
(`GHOST5_ADMIN_API_KEY`).

    GET /ghost/api/admin/settings/  Authorization: Ghost <jwt>  Accept-Version: v6.0 / v5.0  -> 200, 200
      (the same 117 rows on T1 and 99 on T3 as §39b; every key below is PRESENT in both)

    key            T1 (6.58.0)                                          T3 (5.130.6)                    type
    accent_color   "#FF1A75"                                            "#FF1A75"                       string
    logo           ""                                                   ""                              string (EMPTY)
    icon           ""                                                   ""                              string (EMPTY)
    cover_image    "https://static.ghost.org/v5.0.0/images/publication-cover.jpg"   (identical)         string
    navigation     "[{\"label\":\"Home\",\"url\":\"/\"},{\"label\":\"About\",\"url\":\"/about/\"}]"     string (JSON)
    title          "Ghost6"                                             "Ghost5"                        string
    description    null                                                 "Thoughts, stories and ideas."  null / string

**(a) `navigation` is a JSON STRING on both majors, never an array.** The same container
`announcement_visibility` uses, and the answer the spec asked Dev to find. `navOf` parses the
string; it also admits an already-parsed array, because absorbing one major changing its mind is
cheaper here than discovering it on a customer's screen — but the LIVE branch on both test servers
is the string. `secondary_navigation` is present in the same shape (`"[{\"label\":\"Sign
up\",\"url\":\"#/portal/\"}]"`) and is **not read**: FR-C4's menu is the primary one.

**(b) `logo` and `icon` are EMPTY STRINGS at rest, not null and not absent.** So "" has to mean *no
logo* — an `<img src="">` re-requests the page — which is why `brandOf` refuses the empty string
before it ever asks whether the value is a URL. `cover_image` carries Ghost's own default cover on
both servers, an absolute `https:` URL.

**(c) `description` is `null` on T1 and a string on T3**, from the same key on the same endpoint. An
absent description is a real answer, so it is stored as null rather than as `""`.

**(d) Every one of the seven is readable with the integration key**, so FR-C4's brand rides the read
Story 3.3 already makes: no second Admin call, no allowlist item, and connect, **Re-check plan** and
Story 3.7's cron stay the same function.

**(e) What this does NOT say.** These are the values the two test servers happened to hold on
2026-09-08, not a claim about what Ghost guarantees. `accent_color` was a 6-digit hex on both, and
`brandOf` admits `#rgb` as well because Ghost's own field accepts it — that shorter form is
**unobserved** here. The three-digit branch is a unit contract in `apps/web/probe-rule.test.ts`.

---

## 41. The Template Context Matrix, recorded on both majors and read in Ghost's source · 2026-09-14

Story 4.6 made appendix B.1 data — `packages/library/contexts/matrix.json` — and FR-H7's refusals
depend on every row of it, while §0 of that appendix says nothing downstream catches an error in it.
So each row was executed rather than transcribed (standing rule 1). **T1** `ghost6.inflozo.com`
6.58.0 and **T3** `ghost5.inflozo.com` 5.130.6, staff token and Content API key named by variable only:

    python3 tools/probe/record-contexts.py
      probe theme generated from matrix.json -> gscan 4.49.7 ERRORS 0 · gscan 6.4.2 ERRORS 0
        (the theme carries {{#if f includeZero=true}} on every number; both majors took it at upload)
      per server: upload + activate · GET / · /page/2/ · two posts · a page · a tag archive
        · an author archive with no profile_image · a missing path (404) · restore the previous
        theme in a finally and re-read it -> 'casper' active again on both
      the whole Content API row behind every frame that printed an id, one tier, one newsletter
      public.js · default-settings.json · update-{global,local}-template-options.js through
        cdn.jsdelivr.net/npm/ghost@<v>/ at the floor, both servers' versions, every gate and the
        published release before each (url + sha256 in fixtures/ghost-source.json)
    -> packages/library/contexts/fixtures/ghost5.json · ghost6.json · ghost-source.json

The controls, which void the run if they fail and did not: a root `{{title}}` prints **empty** on
`index.hbs`, `post.hbs` and `page.hbs`, while `{{#post}}{{title}}{{/post}}` beside it prints the title;
on a page `{{#post}}` and `{{#page}}` print the same title; a misspelt field prints empty in every scope.
`packages/library/src/contexts.test.ts` asserts all of it per commit, offline.

**(a) The wrapper rule holds on both majors** (appendix §3a, §8's "also unverified" line) — the
single most expensive mistake available is real, and the matrix encodes it.

**(b) `meta_title` and `meta_description` are not a post's, tag's or author's fields in a theme.**
Inside every resource block `{{meta_title}}` printed the PAGE's meta — `Ghost6` on `/`, `Ghost6 (Page 2)`
on page 2, `Ghost5 (Page 1)` on a tag archive — while `{{#if meta_title}}` read the null field and said
0. A guard and its value would disagree, so neither is bindable; both left the matrix.

**(c) `page` is not a field inside the post block.** `{{page}}` printed empty on a page, on both.

**(d) `reading_time` is a helper over a number.** Every post on both servers carries an API
`reading_time` of **0**; `{{reading_time}}` printed `1 min read`, `{{#if reading_time}}` said 0 and
`{{#if reading_time includeZero=true}}` said 1 — the executed reason for the number guard. On the
paid post that heads `/`, the helper printed **nothing** while the guard said 1, because it counts the
body the visitor may not read.

**(e) The `@site` gates, read in source.** The site's social keys are absent from `public.js` and
`default-settings.json` at 6.35.0 and present at **6.36.0** (so the appendix was right, and the
export's "the site's accounts arrived in 6.38.0" is the `{{#social_accounts}}` helper's release).
Corrections: `@site.admin_url` arrives at **6.22.1**, not 6.23.0; and keys the appendix
called "not gated" are absent at the 5.0.0 floor — `comments_enabled`/`comments_access` 5.3.0,
`portal_signup_terms_html`/`portal_signup_checkbox_required` 5.42.0, `recommendations_enabled` 5.61.0,
`allow_self_signup` 5.62.0, `donations_enabled` 5.120.2. Each gate was found by bisecting the npm
releases, then the recorder read the gate and the release before it.

**(f) What this does NOT say.** Author social handles and images, a tag's description, accent
colour and image, a post's custom excerpt, a tier's description, benefits and welcome page and a
newsletter's description are empty on both seeded servers, so no render proves them; each is named
`unverified` in the matrix with that reason, rather than passed. `errorDetails` needs a theme
validation error and `private.hbs` needs private mode — neither was executed. Every version below the
two servers was read in source only, and only for `@site`: a resource field's version (P0·2 dates the
author social handles to 5.118.0) is not recorded.

---

## 42. `core` at the Baseline pin, and `core` in real Chromium on both majors · 2026-09-14

Story 4.7 wrote FR-G7(4)'s runtime, `packages/library/modules/core.js`, and every platform feature it
reaches was read against the dataset FR-G8's floor is computed from before it was used (standing rule 1).

**(a) The web-features facts.** Read from `web-features` **3.35.0**, the version research §A3 pins —
`https://cdn.jsdelivr.net/npm/web-features@3.35.0/data.json`, sha256
`266c466f6e3b3f4736e07662631e1eba668ca0ee3dcb86af1987c75cbfadebf0` — each against the pin
`widelyAvailableOnDate: 2026-08-18`:

| What `core` uses | Feature / compat key | Baseline | Widely on |
|---|---|---|---|
| `AbortController` | `aborting` / `api.AbortController` | high | 2021-09-25 |
| a listener's `signal` option | `events` / `api.EventTarget.addEventListener.options_parameter.options_signal_parameter` | high | 2024-03-20 |
| `MediaQueryList`'s `change` event | `matchmedia` / `api.MediaQueryList.change_event` | high | 2023-03-16 |
| `IntersectionObserver` | `intersection-observer` | high | 2021-09-25 |
| media-query range syntax, `(width < 768px)` | `media-query-range-syntax` | high | 2025-09-27 |
| `setTimeout`, for reporting a module's error asynchronously | `settimeout` | high | 2018-01-29 |
| ~~`AbortSignal.any()`~~ | `abortsignal-any` / `api.AbortSignal.any_static` | **low** (Newly, 2024-03-19) | — |

Every row `core` uses is Widely before the pin. **`AbortSignal.any()` is Newly, so Tier 3, and is never
used**: each mount has its own `AbortController`, and `stop()` aborts `core`'s own listeners through a
second one.

**(b) `core` in real Chromium, on T1 and T3.** `python3 tools/probe/run-verify-core.py` — keys read by
variable name only:

    probe theme: main.js = bundle(['probe', 'probe-motion', 'probe-throws'], core.js + probe files, probe rows)
      control: checkThemeJs REFUSES it ("names probe, probe-motion, probe-throws, with no source")
        and passes bundle([]) over packages/library/modules/
      gscan 4.49.7 ERRORS 0 WARNINGS 0 · gscan 6.4.2 ERRORS 0 WARNINGS 0
    per server: upload + activate · wait for this run's nonce on / · Chromium 1228 (Playwright 1.61.1)
      · restore the previous theme in a finally and re-read it -> 'casper' active again on both
    -> Ghost 5.130.6: 22 of 22 rows hold · Ghost 6.58.0: 22 of 22 rows hold

The rows, each identical on both majors: with JavaScript on at 1024 px the plain and animating mounts ran
once, `js-enabled` sat on those two elements and never on `<html>` or `<body>`, `ctx.t` printed
"Loading 12 more", `ctx.observe` fired, and **one** `IntersectionObserver` served both; the `:768` mount did
not run, ran at 600 px under a second observer for its own `rootMargin`, and at 1024 px again aborted and
lost its class while the plain mount was untouched; the throwing mount ran and was unmarked, and **its
error was the only page error**. Under reduced motion the animating mount waited, mounted when the
preference cleared and aborted when it returned. **With JavaScript off — the control for all of it — no
element carried `js-enabled`, no module ran, and all four declarations stood.** The same rows run in jsdom
per commit (`packages/library/modules/core.test.mjs`), where each was also mutated and seen to fail.

**(c) What this does NOT say.** Editing suppression and `stop()` are not reachable from a theme's
`main.js` (the canvas calls `core` with `{ editing: true }`), so they are proven in jsdom only until Story
5.15's canvas exists. No feature module exists yet, so no module's own no-JS or edit-safe value was seen
behaving — that confirmation moved to each module's first category story (VERIFY-AT-BUILD 50).

## 43. The Baseline floor's three tools, executed at the pin · 2026-09-14

Story 4.8 wired FR-G8's enforcement. Planning executed every tool in a scratch install first and found that none
of them enforces the policy as written; the Dev run re-executed each fact in the workspace, at the pinned
versions, on Node 24.18.1 and pnpm 11.22.0 (standing rule 1). Pins, all older than pnpm 11's one-day release-age
gate by the npm registry's `time` field: `stylelint` 17.15.0 (2026-09-04) · `stylelint-plugin-use-baseline` 1.4.6
(2026-08-22) · `browserslist-config-baseline` 0.5.0 (2025-08-04) · `eslint-plugin-compat` 7.0.2 (2026-04-29) ·
`web-features` 3.35.0 (2026-08-17) · `size-limit` and `@size-limit/file` 13.0.3 (2026-07-30). The lockfile resolves
`baseline-browser-mapping` to **2.11.20** (planning ran 2.11.23) and `browserslist` to 4.28.9. `web-features`'
`data.json` is sha256 `266c466f6e3b3f4736e07662631e1eba668ca0ee3dcb86af1987c75cbfadebf0`, the file §42 read.

**(a) The pin is read from the working directory.** `browserslist-config-baseline` calls
`readConfig(process.cwd(), "browserslist-config-baseline")`. With the root `package.json` pin and the library's
`"browserslist": ["extends browserslist-config-baseline"]`, browserslist for `packages/library/modules/core.js`
from the repo root gives Chrome/Edge 121, Firefox 122, Safari and iOS 17.2 (with `mobileToDesktop`, Chrome and
Firefox for Android 121 and 122). **From `/tmp`, the same file resolves to Firefox 123 and Safari 17.4**, and so does
the repo root with the pin removed. `baseline-browser-mapping` 2.11.20 and 2.11.23 both give the 2026-08-18 floor.
Research §A3's method over `web-features` 3.35.0 **and 3.38.0** gives the same seven versions.
`browserslist.loadConfig` finds no config at the root or in `apps/web`.

**(b) The pin reaches `eslint-plugin-compat`, which sees bare globals only.** Linted as
`packages/library/modules/probe.js` from the root:

    new ImageCapture()        compat/compat: ImageCapture is not supported in Safari 17.2, iOS Safari 17.2
    requestIdleCallback(f)    compat/compat: requestIdleCallback is not supported in Safari 17.2, iOS Safari 17.2
    window.ImageCapture       compat/compat: ImageCapture is not supported in Safari 17.2, iOS Safari 17.2
    win.ImageCapture · new win.ImageCapture() · Object.groupBy · Promise.withResolvers() · AbortSignal.any([])
    · el.checkVisibility()    (no compat/compat message)

From `/tmp` (no pin reached) `new ImageCapture()` draws only `no-undef` — the control: Safari 17.4 has it.

**(c) The stylelint plugin is not the pin.** Every identifier-shaped `css.properties.<prop>[.<value>]` compat key
of `web-features` 3.35.0 (2,356 rows) as a one-declaration rule, Widely meaning `baseline_low_date` + 30 months on
or before 2026-08-18, through the plugin alone at `available: "widely"`:

    plugin 1.4.5 · wider 37: mask-mode, mask-mode: alpha, mask-mode: luminance, mask-mode: match-source (+33 cursor values)
                 · narrower 10: offset-path: ray, offset-path: url, offset-position, offset-position: auto|bottom|center|left|normal|right|top
    plugin 1.4.6 · wider 37: the same 4 mask-mode rows (+33 cursor values) · narrower 0

`web-features` 3.38.0 has 2,368 such rows, and 1.4.6 passes 12 more it does not know (`flex-wrap: balance`,
`frame-sizing` and five values, `link-parameters` and `none`, `window-drag` and two values) — so bumping the dataset
is a floor decision the check makes visible, which is why `web-features` stays at 3.35.0. The plugin also passes
`@supports (animation-timeline: view()) { … }` and sees neither nesting nor vendor prefixes (planning, confirmed by
the check's rows below).

**(d) Tier 2, recomputed.** From 3.35.0, `baseline_low_date` + 30 months: backdrop-filter 2027-03-16 ·
text-wrap-balance 2026-11-13 · scrollbar-width 2027-06-11 · scrollbar-color 2028-06-12 · starting-style 2027-02-06 ·
details-name 2027-03-03 · fetch-priority 2027-04-29, all after the pin. **`masks` is high, low 2023-12-07, Widely
2026-06-07 — before the pin, so `mask-image` is Tier 1.** **`text-wrap-pretty` is `baseline: false`** in 3.35.0 and
3.38.0 (Chrome 117, Safari 26, no Firefox) — R-105 keeps it by name.

**(e) `size-limit`.** Run from the repo root, where it finds `@size-limit/file` in `devDependencies`:
`size-limit --json --limit "1 B" packages/library/modules/core.js` exits 1 and prints
`{"passed": false, "size": 2250, "sizeLimit": 1}` — brotli, its default. `bundle([], { core })` measures 2,308 B.

**(f) The check.** `node tools/check-baseline.mjs`, run by `pnpm test`:

    controls: ImageCapture refused at Safari 17.2 · a second notBaseline refused naming R-105 · an altered date refused
      naming both dates · size-limit at 1 B passed: false · the plugin against the pin, through stylelint.config.mjs:
      2356 rows: 0 wider, 0 narrower (refused by name: mask-mode; admitted: cursor values)
    the floor: chrome 121 · chrome_android 121 · edge 121 · firefox 122 · firefox_android 122 · safari 17.2 · safari_ios 17.2
    Tier 2: seven dates as (d); text-wrap-pretty: not Baseline on the pin, kept by R-105
    stylesheets: Tier 1, Tier 2, @supports (A3-16) and the three prefixes pass; 19 refusal rows each refused by the
      rule the story's matrix names; 3 sheets linted clean, 17 of Ghost's ignored
    size: main.js (core) is 2308 B brotli
    check-baseline: PASS

Each subject was then broken in place and restored, and each run exited 1 naming it: **the root pin removed** — the
ImageCapture control fails ("the pin did not reach eslint-plugin-compat") and the floor row prints browserslist's
unpinned Firefox 123 / Safari 17.4; **text-wrap-balance's `widely` set to 2026-11-14** — "baseline.json says widely
2026-11-14, web-features 3.35.0 says 2026-11-13"; **`mask-mode` removed from `plugin.refused`** — "wider than the pin:
css.properties.mask-mode, …alpha, …luminance, …match-source", and the `mask-mode: alpha` row; **`notBaseline` added
to backdrop-filter** — "carries notBaseline, and R-105 keeps text-wrap-pretty alone".

**(g) What this does NOT say.** No tool reads HTML, so `details-name` and `fetch-priority` are checked for their
dates only (DW-137, Story 7.8). At-rules, selectors, functions and units are not diffed against the pin. Tier 2's
conditions — no layout, contrast or interaction, a scrim behind `backdrop-filter` — are review rules no linter sees.

**(h) The review's executions (2026-09-14).** Five review layers, the real-infrastructure one re-running (b), (f) and
the Dev push's CI and Vercel evidence with a negative control each. Executed and settled: `settings.lintAllEsApis: true`
on `eslint-plugin-compat` changes nothing over the modules (`Object.groupBy`, `Promise.withResolvers` still pass);
`font-family: 'Inter', -apple-system, sans-serif` passes the prefix closure, and must — it is the export's stack, in
every frame — so it is now a legal row; an upper-case `display: -WEBKIT-BOX` is refused by the value list already.
Executed and NOT settled, now DW-139: through the real config, `@container style(--x: 1) { … }`,
`.a { color: if(style(--x: 1): red; else: blue); }`, `sibling-index()` and `random()` all pass — the plugin knows an
at-rule by its name only, and (c)'s diff covers `css.properties`; `web-features` 3.35.0 also carries `css.at-rules`,
`css.selectors` and `css.types` rows, none diffed. The review added three controls to the check (an entry whose `css`
names something other than its feature; `text-wrap-pretty` gaining a low date; `@supports (text-wrap: nowrap)` and
`(text-wrap: balance2)` refused), two preconditions (a pin that is not `YYYY-MM-DD`; a `BROWSERSLIST` or
`BROWSERSLIST_CONFIG` variable, which overrides every config file) and one guard in `eslint.config.js` — ESLint started
anywhere but the repo root throws, because the pin is read from the working directory (from `/tmp`: "eslint must run
from the repo root", exit 2). After the patches `pnpm check` is green and the check prints the same floor.

## 44. `{{t}}` over a locale file, recorded on both majors, and the catalog under Ghost's own formatter · 2026-09-14

Story 4.9 turned FR-Q6's catalog into code. Its whole contract rests on one premise — Ghost resolves a dotted key
from `locales/en.json` — which planning read in both releases' npm tarballs (`ghost@5.130.6`, `ghost@6.58.0`) and ran
under the libraries they pin, and which the Dev run then **recorded** on T3 (5.130.6, `ghost5.inflozo.com`) and T1
(6.58.0, `ghost6.inflozo.com`) before any code was written against it (AD-23). Command:
`python3 tools/probe/record-shim.py`; fixtures `packages/ghost-shim/fixtures/ghost{5,6}/index.json` and `post.json`,
group `TR` and the `verbatim` blocks; asserted per commit by `packages/ghost-shim/src/contract.test.ts`.

**(a) What Ghost does, read in source.** Identical in shape on both majors:

| Fact | 5.130.6 | 6.58.0 |
|---|---|---|
| A theme's i18n is fulltext mode; it reads `locales/<site locale>.json` and falls back to `en.json` only when that whole file is missing | `ThemeI18n.js:13-15,34-36`; `I18n.js:106-128` | `theme-i18n.js:13-15,34-36`; `i18n.js:99-121` |
| A dotted key is looked up as ONE key | `I18n.js:143-150`, `jp.stringify(['$', key])` | `i18n.js:139-142`, `get(strings, [key])` |
| A missing key, or an empty value, prints the key | `I18n.js:146,150` (`\|\| fallback`) | `i18n.js:132,142` |
| `new MessageFormat` sits outside the try; a format error renders "An error occurred" | `I18n.js:219-234` | `i18n.js:208-223,269-271` |
| Bundled `intl-messageformat` | 5.4.3 | 5.4.3 |
| `{{plural}}` replaces the FIRST `%` and returns an unescaped `SafeString` | `helpers/plural.js:30-36` | identical file |
| i18next is used only behind `themeTranslation`, a private labs flag | — | `helpers/t.js:33-55`; `shared/labs.js:42-51` |

**(b) What Ghost printed.** The probe theme shipped `locales/en.json` with a plain key, a flat dotted key, a
**nested** `probe` object, and the probe strings below; the site locale is `en` on both boxes. Every row is
character-identical on the two majors:

    TR|plain_control         {{t "Plain key"}}                                          Plain value, read from locales/en.json   ← the control
    TR|dotted_hit            {{t "probe.dotted_hit"}}                                   Dotted key, looked up as one key
    TR|nested_miss           {{t "probe.nested_miss"}}   (only probe: { nested_miss })  probe.nested_miss
    TR|missing_key           {{t "probe.no_such_key"}}                                  probe.no_such_key
    TR|params_path           {{t "probe.page_of" page=pagination.page pages=pagination.pages}}   Page 1 of 3
    TR|param_undefined       … pages=no_such_field                                      Page 1 of          (a hole)
    TR|param_omitted         {{t "probe.page_of" page=pagination.page}}                 An error occurred
    TR|minutes_reading_time  {{t "probe.reading_time" minutes=reading_time}}  (post)    0 min read   — the FIELD, API value 0; {{reading_time}} prints "1 min read"
    TR|date_param            {{t "probe.updated_on" date=(date updated_at format="D MMM YYYY")}}   Updated 20 Aug 2026
    verbatim t-escape-text   {{t "probe.escape"}}                                       Tom &amp; &lt;b&gt;Jerry&lt;/b&gt; &quot;said&quot; it&#x27;s
    verbatim t-escape-attr   <i title="{{t "probe.escape"}}">                           the same escape, inside the attribute
    verbatim t-param-html    {{t "probe.by" author="<b>A&B</b>"}}                       By &lt;b&gt;A&amp;B&lt;/b&gt;
    verbatim t-plural        {{plural pagination.total … plural=(t "probe.posts_many")}}   33 posts <i>many</i>   — markup survives

The recorder refuses to write a `TR` row unless `TR|plain_control` printed the file's value, and it restores the
previous theme (`casper` on both), reads it back as active, then deletes the probe theme and reads the theme list
back without it. `contract.test.ts` feeds `t()` the recorded locale file and asserts every row the shim renders; the
omitted param and `{{plural}}` are asserted as facts only Ghost produces.

**(c) Executed under the libraries, not on a site.** In the workspace, `intl-messageformat` 5.4.3 (root devDependency,
exact) with Node 24.18.1: `It's` and `'quoted'` survive; `It''s` renders `It's`; `{count, plural, one {#} other {#}}`
formats when `count` is given; `'{'`, `{` and `{a b}` throw; an omitted variable throws ("was not provided"); a number
prints as `String(n)`; `% post` is literal. `@formatjs/icu-messageformat-parser` **3.5.18** (the spine's "current",
installed in a scratch directory) **parses `'{'` as a literal `{`** and `It''s` as `It's`, and throws on `{` and
`{a b}` — so a validator built on it accepts an override 5.4.3 throws on (DW-142).

**(d) The check, first run.** `node tools/check-catalog.mjs`: every control failed naming its subject (a removed key,
a one-copy default, an order/mark/retirement change, a duplicate in the bytes, `It''s here` — "Ghost renders "It's
here" and the shim renders "It''s here"", a plural and `'{'` — each the throw, an unlocked credit key); then §3 and
`catalog.json` agreed in order and both directions, the format rules held, and every default rendered identically
under 5.4.3 and the shim's `t()`. It printed 151 keys in 14 namespaces, 42 js, 3 locked, 1 canvas, 11 retired — the
figures appendix-h1 §4 used to carry, which it no longer does. By hand in the working tree, then restored: deleting
`pagination.older` from `catalog.json` failed "in appendix-h1… and missing from catalog.json"; `nav.more` → `More…`
in the appendix only failed "the English default differs", naming both files.

**(e) The gscan harness.** `tools/stress/build.js` now writes `locales/en.json` from the catalog, every key but the
canvas one, and the archetypes carry `{{t}}` for every literal: `node gate.js theme` → gscan 4.49.7 and 6.4.2 both
**0 errors, 0 warnings**.

**(f) What this does NOT say.** No locale file was emitted by a compiler and no override was validated: `locales/`
emission, V3, V7, V9 and V10 are Epic 7's (Stories 7.5, 7.6, 7.12). The site locale was `en` on both boxes, so the
file-level fallback of (a) row 1 is read in source, not recorded — and it contradicts FR-Q6's sentence that Ghost
"falls back to `en` for any key the active locale does not resolve": the fallback is to the **file**, only when
`<locale>.json` is absent, never per key (VERIFY-AT-BUILD row 32, Story 7.12). The "whole-page 500" for a
constructor throw is read in source, not observed; §15j saw a 400 for a template error at upload.

## 45. The pilots' Ghost rows, recorded on both majors, and the snapshot check's first run · 2026-09-15

Story 4.10 authors the five pilot sections (PRD §8, R-108) and renders `data-members` and `data-if` / `data-else` on
both emitters. Planning read the facts in both releases' npm tarballs (`ghost@5.130.6`, `ghost@6.58.0`) and in Portal
(`@tryghost/portal` 2.51.5 and 2.69.339, the `~2.51` / `~2.69` pins in `core/shared/config/defaults.json`), and executed
a no-param partial under Handlebars 4.7.9; the Dev run then **recorded** the rows it could on T3 (5.130.6,
`ghost5.inflozo.com`) and T1 (6.58.0, `ghost6.inflozo.com`) before any runtime code was written against them (AD-23).
Command: `python3 tools/probe/record-shim.py`; fixtures `packages/ghost-shim/fixtures/ghost{5,6}/index.json` and
`index-page-2.json`, group `PILOT`, with the new partial `tools/probe/theme-shim/partials/probe-card.hbs`
(`{{title}}@first={{@first}};`); asserted per commit by `packages/ghost-shim/src/contract.test.ts`.

**(a) What Ghost printed.** Both majors, signed out, the probe theme active (previous theme `casper` restored and read
back as active; the probe theme deleted and read back as gone, on both):

    PILOT|partial_noparam  {{#foreach posts limit="2"}}{{> "probe-card"}}{{/foreach}}   page 1: PROBE Gated Post@first=true;On typography and restraint@first=false;
                                                                                          page 2: Ten years of one layout@first=true;The paragraph is the unit@first=false;
    PILOT|nav_items        {{#foreach @site.navigation}}{{label}}={{url}};{{/foreach}}  6: Essay=/;Notes=/;Inflozo=/;   5: Ghost 5 Home=/;Ghost 5 About=/;
    PILOT|if_member_paid   {{#if @member.paid}}PAID{{else}}NOT_PAID{{/if}}              NOT_PAID
    PILOT|if_logo          {{#if @site.logo}}LOGO{{else}}NO_LOGO{{/if}}                 NO_LOGO   (neither box has a logo; SITE|logo is empty)
    PILOT|if_self_signup   {{#if @site.allow_self_signup}}ASK{{/if}}                    ASK       (MEMBER|allow_self_signup is true)
    PILOT|get_latest       {{#get "posts" limit="1" order="published_at desc"}}…{{/get}} PROBE Gated Post — the feed's first card

**(b) The finding the recording made.** A no-param partial inside `{{#foreach}}` renders against the ROW, `@first`
included, as `foreach.js:88-91` reads — the case A17 #1 is in the set for holds. But **`{{url}}` inside
`{{#foreach @site.navigation}}` is not the item's field: it printed `/` for every item on both majors**, while the same
loop's `{{this.url}}` (group `raw-nav-items`) printed `/essay/`, `/notes/` and `https://inflozo.com`. The bare name is
Ghost's `url` helper, which recognises a navigation item only when it carries `slug` and `current` — which only
`{{navigation}}`'s own partial adds — and otherwise prints the site root. Story 4.6's context recording had carried
the same `/` since 2026-09-14 and read it as proof of the field. `matrix.json` now types `navigation.url` as `helper`
with that note, so `bindable` refuses it, and A1 #1 links its nav through `data-helper="navigation"` (Ghost's own
`<ul class="nav">`, recorded since Story 4.3). The signed-in member arms stay cited, not recorded: creating a member is
outside the recorder's writes (spec Ask First), and `update-local-template-options.js:25-37` (5) / `:27-39` (6) is the
source for `@member` and `@member.paid`.

**(c) Read, not recorded.** `allow_self_signup` is `members_signup_access === 'all'` and members are enabled when it is
not `'none'` (`SettingsHelpers.js:22-32` on 5, `settings-helpers.js:22-32` on 6), so self-signup implies members.
Portal submits `input[data-members-email]`'s value and writes `data-members-error` (both Portal builds'
`umd/portal.min.js`; Ghost 5's own signup card, `signup-renderer.js:19-31`). `{{#match a ">" b}}` compares numbers and
`{{page_url n}}` takes a page number (`match.js`, `page_url.js:11-16`), which is what R-109 declined to build on.

**(d) The snapshot check, first run.** `node tools/check-snapshots.mjs` (Node 24.18.1): its six controls each failed on
the subject handed to it — one class changed in a pilot (naming `template.hbs` and the first differing line), a
missing snapshot, a snapshot with no design, a `title` binding added to A1 #1 at `default.hbs`, A24 #1 at `index.hbs`
(FR-H7, naming `title`) and A17 #1 at `post.hbs` (R-7). Then every design validated, returned `[]` from
`checkBindings` at each of its targets, rendered on both emitters, and produced one theme text across its targets;
`--update` wrote the snapshots and the next run passed. The check prints its totals and stores none.

**(e) What this does NOT say.** No theme was compiled or deployed (Epic 7, the joint gate Story 7.35), no pixel was
compared (Story 4.11), and no signed-in member was rendered by Ghost. Nor was the other arm of two rows: neither box
has a logo and both allow self-signup, so `{{#if @site.logo}}`'s LOGO arm and `{{#if @site.allow_self_signup}}`'s
empty arm were never printed by Ghost — the contract test derives their expectation from the box's own site row and
cannot tell. A snapshot is the runtime's text with
content and controls at their defaults — not a compiled `partials/sections/…` file.

## 46. Member-state preview — the member object, `{{#has}}`, the announcement audience and `gift`, read in source on both majors · 2026-09-21

Story 5.14 builds FR-D16's View as. Its planning read four facts in both releases' npm tarballs, and the Dev run read
them again with the commands below (2026-09-21) — read-in-source under standing rule 1, not recorded on T1 or T3: no
member was created on either box (outside every recorder's writes, as §45(e) says of the signed-in arms), and until Story
5.18 the canvas previews the bundled publication rather than a connected site. Command, into a scratch directory:

    curl -sSL https://registry.npmjs.org/ghost/-/ghost-5.130.6.tgz | tar -xz -C 5
    curl -sSL https://registry.npmjs.org/ghost/-/ghost-6.58.0.tgz | tar -xz -C 6

**(a) The member object — `core/frontend/services/theme-engine/middleware/update-local-template-options.js`**, lines
`:25-38` on 5.130.6 and `:27-40` on 6.58.0. The block is **character-identical**; `diff` of the two files differs only in
the `url-utils` import, 6's `admin_url` and 6's `getHelperDeduplication` query cache:

```js
const member = req.member ? {
    uuid: req.member.uuid,
    email: req.member.email,
    name: req.member.name,
    firstname: req.member.name && req.member.name.split(' ')[0],
    avatar_image: req.member.avatar_image,
    subscriptions: req.member.subscriptions && req.member.subscriptions.map((sub) => { … }),
    paid: req.member.status !== 'free',
    status: req.member.status
} : null;
```

**Finding.** Exactly R-4's eight fields, and `null` when no member is signed in. `paid` is `status !== 'free'`, so every
status but `free` is a paying member to a theme — which is why View as offers three visitors and no fourth: `comped`
previews as Paid, and so does (d)'s `gift`. The line range R-4 and Story 5.14's spec cite, `:27-40`, is 6.58.0's; on
5.130.6 the same block is `:25-38`.

**(b) `{{#has any="@member"}}` — `core/frontend/helpers/has.js:128`**, identical on both majors:

```js
const data = _.pick(options.data, ['site', 'config', 'labs']);
```

and `evaluateList` (`:109-119`) looks an `@`-path up in that `data` alone (`_.has(data, prop.replace(/@/, ''))`). **Finding.**
`@member` is never in it, so `{{#has any="@member"}}` is false for every visitor on both majors and can never test for a
signed-in one — FR-D16's rule, now with its line. Neither emitter writes a `{{#has` (`core.ts:480` and `:1492` say so),
and the only one in the repository is a recording row of the probe theme (`tools/probe/theme-shim/index.hbs:63`).

**(c) The announcement bar's audience** — 5.130.6 `core/server/services/announcement-bar-service/AnnouncementBarSettings.js`
and 6.58.0 `…/announcement-bar-settings.js`, `:35-41`, identical but for the `require` path of the values file:

```js
if (visibilities.includes(AnnouncementVisibilityValues.VISITORS) && !member) {
    announcement = announcementContent;
} else if (visibilities.includes(AnnouncementVisibilityValues.FREE_MEMBERS) && (member?.status === 'free')) {
    announcement = announcementContent;
} else if (visibilities.includes(AnnouncementVisibilityValues.PAID_MEMBERS) && (member && member.status !== 'free')) {
    announcement = announcementContent;
}
```

**Finding.** `paid_members` means any status but `free`, so a comped (and on 6 a gift) member sees a paid-members bar —
the same line as (a). Story 5.21's strip follows View as with exactly these three audiences.

**(d) `gift`, a status no Inflozo document named** — `core/server/data/schema/schema.js`, `members.status`:
`isIn: [['free', 'paid', 'comped']]` on 5.130.6 (`:449`) and `isIn: [['free', 'paid', 'comped', 'gift']]` on 6.58.0
(`:440`); and 6.58.0's `core/server/services/members/members-api/services/member-bread-service.js:135`,
`if (member.status === 'comped' || member.status === 'gift') {`, which builds a gift member a non-Stripe subscription
named "Gift subscription". **Finding.** Ghost 6 has a fourth member status. Through (a) it is `paid: true`, so it previews
as Paid like `comped`; FR-D16 and Appendix B now say so.

**(e) What this does NOT say.** Nothing here was rendered by Ghost: no signed-in member exists on either probe box, so
every member arm is read, not recorded. `checkPostAccess` (`members/content-gating.js`), which decides what a visitor
may READ, was not read — it is Story 5.20's, with the gated-body indicator and DW-128. And no emitter changed: the canvas
previews the tier through Story 4.10's `data-members`, whose truth table is `agreement.test.ts`'s and whose theme arms
are `tools/check-snapshots.mjs`'s, both untouched by Story 5.14.

## 47. `core` run from the editor's realm against the canvas window raises no CSP violation — recorded on production · 2026-09-22

Story 5.15 makes the editor run `core` itself, from its own bundle, against the canvas iframe's window (`apps/web/lib/
behaviours.ts`, DW-136). The canvas document carries no script and no nonce, and both documents carry the app's nonce
policy with no `'unsafe-eval'` (§ the CSP row). "Code in the editor's realm acting on the canvas window compiles nothing
in the canvas, so its policy has nothing to refuse" was reasoned at Create and executed here, under standing rule 1, by
`tools/probe/run-verify-editor.cjs` steps 5 and 91 against `https://app.inflozo.com`.

**Runs.** Dev (2026-09-22) at `1e147c74`, deployment `dpl_HyjusRNeW4sCdTqdzjtn61v1z1JR`; Review (2026-09-22) at
`61290c1b`, deployment `dpl_HrwUpJ5JN6yNBC2aeVyJSvrN6reM`, both READY and both the checkout's HEAD. Each run: 0 FAIL,
535 PASS, first attempt. The command, keys by name: `SUPABASE_URL SUPABASE_SECRET_KEY VERCEL_TOKEN VERCEL_TEAM_ID
VERCEL_PROJECT node tools/probe/run-verify-editor.cjs`, Node 24.18.1.

**(a) Violations.** Step 5's scripted session listens for `securitypolicyviolation` in BOTH documents across the whole
walk, and since Story 5.15 that session includes `core` running from the editor while designing and in Preview — in by
the pill and by `P`, out by Back to editing, `Esc` and `P`, at Desktop and at Mobile, with a link, a submit and typing
in Preview. Recorded: **zero events in either document** (`[]`), both runs.

**(b) The mounts, read back.** Step 91 reads `js-enabled` on every `[data-module]` in the canvas: while designing
`{ bar: false, form: false, mounts: 2, enabled: 0 }` (Rail's `nav-drawer` and the Inline Row's `member-form`, both held
still at rest); in Preview `{ bar: true, form: true, mounts: 2, enabled: 2 }`; back to editing `enabled: 0` again. So
`core` really ran in the canvas document from the editor's side, and the editing rule really held.

**(c) The controls (standing rule 2).** `new Function('')` throws `EvalError` in each document from a script carrying
its own nonce; **`eval('1')` called from the editor on the canvas `contentWindow` throws `EvalError` under the canvas's
policy** (the new control: had the parent realm been able to compile in the child, (a)'s zero would mean nothing); and
the recorder saw one refusal from each document (`/projects/<id>` and `/canvas`, directive `script-src`), so its zero is
a result. Step 8's axe scan of Preview: zero violations, behind its planted `image-alt` control.

**What this does NOT say.** No behaviour module exists yet, so what ran was `core` and its no-op stand-ins
(`behaviours.ts`, FR-G7(2)); the first real module file is measured by its own category story. The PAUSED chip was not
drawn on production — the shipped library has no held-still part that moves by itself (R-175) — and its look is the
keyboard journey's, in CI, on controls fixture 1. T1 and T3 were not touched at Review: `core.js` is byte-identical to
the Dev commit's, whose `run-verify-core.py` run (22 of 22 rows on both majors) stands.

## 48. Page 2 — which template Ghost renders at `/page/N/`, the page's address, its pager and its 404, read in source on both majors; and `template_key_shape` widened on production · 2026-09-22

Story 5.16 makes page 2 of a paginated canvas visible and designable (FR-D21, R-176 to R-180). Its Create run read
these facts in both releases' npm tarballs, and the Dev run read them again with the commands below (2026-09-22) —
read-in-source under standing rule 1; the recorded rows cited are Story 4.10's, captured on T1 and T3 on 2026-09-14
(`packages/library/contexts/fixtures/ghost{5,6}.json`, `tools/probe/record-contexts.py`). Command, into a scratch
directory:

    curl -sSL https://registry.npmjs.org/ghost/-/ghost-5.130.6.tgz | tar -xz -C 5
    curl -sSL https://registry.npmjs.org/ghost/-/ghost-6.58.0.tgz | tar -xz -C 6

**(a) Which template renders `/page/2/` — `core/frontend/services/rendering/templates.js:67`**, identical on both
majors:

```js
if (routerOptions.frontPageTemplate && (requestOptions.path === '/' || requestOptions.path === '/' && requestOptions.page === 1)) {
    templateList.unshift(routerOptions.frontPageTemplate);
}
```

with `frontPageTemplate: 'home'` set by the collection router (5.130.6 `routing/CollectionRouter.js:107`, 6.58.0
`routing/collection-router.js:117`). **Finding.** `home` is put first only when the path is exactly `/`, so `/page/2/`
renders `index.hbs`: Home's page 2 is `index.hbs`, and the canvas renders it there. Recorded, both majors: `/` →
`home.hbs` and `/page/2/` → `index.hbs` (`ghost5.json`, `ghost6.json`, the `template` of each page row).

**(b) An archive keeps ONE file on every page, and page 2 on is `paged`.** `getEntriesTemplateHierarchy` (`:48-72`)
builds `tag-{slug} → tag → index` (and the author's) whatever the page number, so there is no second archive file to
design; `core/frontend/services/rendering/context.js` pushes `paged` when `pageParam > 1` (5.130.6 `:35-36`, 6.58.0
`:32-33`). **Finding.** An archive's page-2 design has to live inside that one file, behind `{{#is "paged"}}` — which is
why Tag and Author store their page 2 under keys of their own (`tag-paged`, `author-paged`, R-178) and Story 7.3
compiles the branch.

**(c) `nav-current` is an exact match — `core/frontend/helpers/tpl/navigation.hbs:3`** is
`<li class="{{link_class for=(url) class=(concat "nav-" slug)}}">`, and `core/frontend/services/theme-engine/handlebars/
utils.js` — `diff` of the two majors' files prints nothing — decides the class: `_urlMatch` (`:21-30`) strips a leading
and a trailing slash from both and compares them for equality; `buildLinkClasses` pushes `nav-current` on that match
(`:61`) and otherwise `nav-current-parent` when `_urlParentMatch` (`:33-50`) finds the item's path a prefix of the
location's (`:63`). **Finding.** On `/page/2/` the `/` item compares `''` with `page/2` and gets `nav-{slug}` alone — no
`nav-current` and no `-parent` (its one part, `''`, is not `page`); on an archive's page 2 that archive's own item gets
`nav-current-parent`, which `ghost-shim`'s `navigationItems` does not draw (a DW). Recorded on T3: `/` draws
`nav-ghost-5-home nav-current`, and `/page/2/`, both posts, the page, `/tag/archive/`, `/author/priya-raman/` and the 404
draw `nav-ghost-5-home` ALONE (`ghost5.json`; T1's menu carries no `/` item). So the canvas is right to mark Home on
Home's page 1 only — and wrong while Post, Page and 404 are still handed `/` (a DW; the archives are fixed by this story).

**(d) The pager's links — `core/frontend/helpers/page_url.js:16`** calls `getPaginatedUrl(page, options.data.root)`,
`core/frontend/meta/paginated-url.js:4-36`, identical on both majors: the base is whatever precedes `/page/N/`
(`baseUrlPattern = new RegExp('(.+)?(/page/\\d+/)')`, `:15`) or the URL itself on page 1, and `prev` on page 2 is `/`
joined to that base. **Finding.** On `/tag/news/page/2/` the Newer link is `/tag/news/` and the Older link
`/tag/news/page/3/`; an archive's pager is based on the archive, never on `/` — the other half of DW-218, fixed by
`templateContext`'s `paginationBase` (`orbit-weekly.test.ts` holds it to the shim's `pageUrl`).

**(e) Past the last page is a 404 — `core/frontend/services/routing/controllers/channel.js:56`** and `collection.js:56`,
identical on both majors: `if (pathOptions.page > result.meta.pagination.pages) { return next(new errors.NotFoundError(…)) }`.
**Finding.** Where a list fits on one page Ghost serves no page 2, so the editor offers none (R-176); on the bundled
publication that is every writer's archive and every tag but two (`orbit-weekly.test.ts` derives which).

**(f) What no canvas reads.** `core/frontend/helpers/body_class.js` adds `home-template` only in the `home` context
(`:21-22`, whose pattern is `^\/$`, `context.js` 5.130.6 `:20`, 6.58.0 `:17`) and `paged` from page 2 on (`:44-45`);
`core/frontend/meta/title.js:22-23` adds ` (Page N)`. No section design reads either, so the canvas renders none.

**(g) The Schema phase, on production** (`SUPABASE_DB_POOLER_URL`, PostgreSQL 17.6, 2026-09-22 — R-99, pushed alone as
`c8eff23d`). `pg_constraint` before: both `template_key_shape` checks list `site · home · index · post · page · tag ·
author · error · private` plus the `custom:` pattern. In a transaction that was ROLLED BACK, on the same database:

```
before the apply           index INSERTS on both tables · tag-paged and author-paged REFUSED 23514 (template_key_shape)
applied, one transaction   both constraints read back listing tag-paged and author-paged, convalidated true
after the apply            index, tag-paged and author-paged INSERT on both tables
                           home-paged and tag-page still REFUSED 23514 — the control
rows left behind           0 on project_templates, 0 on project_template_prefs
```

`bash supabase/tests/run-rls-gate.sh` exits 0 with the migration and `SCHEMA.sql` agreeing, its Story 5.16 block
green; with the migration withheld (a scratch copy of `supabase/`, `INFLOZO_ARCH_DIR` at the prior `SCHEMA.sql`) it
aborts at that block with `23514`, exit 3.

**What this does NOT say.** Nothing above was rendered by Ghost for this story: the recorded rows are Story 4.10's.
Review's read-only `GET /page/2/` on T1 and T3 — no key, nothing written — was the one execution this section still
owed, and it landed at Review:

**(h) Executed at Review (2026-09-22), read-only public `GET`, no key, on both test servers.**
- **T3 `ghost5.inflozo.com` (5.130.6).** `/` → 200 with `<li class="nav-ghost-5-home nav-current">` for the `/` item —
  the control: on page 1 the home item DOES carry `nav-current`. `/page/2/` → 200 with `<li class="nav-ghost-5-home">`
  for the same item — **no `nav-current`**, (c) as read. Its pager: `<link rel="prev" href="https://ghost5.inflozo.com/">`
  and `<a class="newer-posts" href="/">` — `pagination.prev` is `/`, (d) as read; on `/`, `rel="next"` and
  `older-posts` point at `/page/2/`. `/page/999/` → **404**, (e) as read.
- **T1 `ghost6.inflozo.com` (6.58.0).** `/` → 200, `/page/2/` → 200 with `rel="prev"` → `https://ghost6.inflozo.com/`
  and `newer-posts` → `/`; `/page/999/` → **404**. **T1's navigation holds no `/` item** (its items are the site's own
  five pages), so the `nav-current` claim is testable on T3 alone — which is why the spec words it "where the site's
  menu holds `/`".
- **Two things to know before grepping either page for a class.** Ghost writes the item's class from its LABEL, slugged
  — `nav-ghost-5-home`, never a literal `nav-home` — so "the item gets only its own class" means that slug class; and
  on T3's `/` the Portal item (`href="#/portal/"`) also carries `nav-current`, because a fragment link matches the page
  it is on. Neither is this story's, and neither moves (c): the `/` item alone is what the shim's `nav-current` is
  about.

## 49. `{page_number}` — the page-1 guard executed on both majors, and why the emitted constant spells `pagination` and not `@root` · 2026-09-23

**Command.** `python3 tools/probe/record-page-number.py` — one theme upload per server (a second only where the first is refused or never served) and two activations, the previous theme restored in a `finally` and re-read to prove it; no content, no setting and no key written.

**Why.** Story 5.16a emits ONE constant Handlebars expression into user text (AD-5's first deliberate exception), guarded so page 1 prints nothing (R-186). The guard — `#if` on `pagination.prev` — was read in Ghost's source on both majors (bookshelf-pagination assigns only `next` on page 1, so `prev` is literally `null` there) and controlled locally under express-hbs 2.5.0. Standing rule 1 says that is a hypothesis until it is executed against a real Ghost. This is that execution, and every marker is in `default.hbs` — the layout, where a site-wide section compiles (R-180) and the hardest place for `pagination` to reach.

### (a) gscan refuses `@root` as an ERROR on both majors — so the emitted constant cannot spell it

- with the `@root` markers: Ghost 5.x via gscan 4.49.7 — GS120-NO-UNKNOWN-GLOBALS / 1 warnings · Ghost 6.x via gscan 6.4.2 — GS120-NO-UNKNOWN-GLOBALS / 1 warnings
- with them removed: Ghost 5.x via gscan 4.49.7 — 0 errors / 1 warnings · Ghost 6.x via gscan 6.4.2 — 0 errors / 1 warnings

`GS120-NO-UNKNOWN-GLOBALS` is the one error code the gate reports — `gate.js` counts by rule, so "ERRORS 1" is one rule refusing, not one path; the recorded message is *"`{{@root.pagination.page}}` is not a known global"*, and the probe theme carries four `@root` paths, each of which the rule's source refuses (review, 2026-09-23: "fires four times" was inferred from the source, not counted in the output). Read in gscan's own source at both bundled versions — `lib/ast-linter/rules/internal/scope.js:5-13`, byte-identical in gscan 4.49.7 (Ghost 5) and 6.4.2 (Ghost 6) — the allow-list is `@site`, `@member`, `@setting`, `@config`, `@labs`, `@custom`, `@page` and `{{#foreach}}`'s own data variables, and `isOnAllowlist` tests `parts[0]` alone, so no `@root.…` path can pass. `lint-no-unknown-globals.js` checks a block helper's PARAMS, so `{{#if @root.pagination.prev}}` is refused as well as the value.

**And the refusal is gscan's alone — Ghost itself served the `@root` theme on both boxes**, as the verdict lines below record, so the expression is CORRECT at runtime and unshippable by the product's own standard: `tools/stress/gate.js` must report 0 errors on both majors for every theme we emit (AD-34), and a Ghost admin marks a theme carrying a fatal gscan error invalid. **Finding: the emitted constant is `{{#if pagination.prev}}{{pagination.page}}{{/if}}`** — the same guard, one qualifier shorter, and the only spelling that is both correct in `default.hbs` and gscan-clean. The spec's Design Note preferred `@root` for a reason (d) measures and prices at zero.

### (b) T3 `ghost5.inflozo.com` (5.130.6)

**Ghost's own verdict on the upload.** `root` theme → upload HTTP 200, activated and SERVED

| Address | HTTP | `{{pagination.page}}` | `{{pagination.prev}}` | **plain guard** | `{{@root.…page}}` | `{{@root.…prev}}` | **@root guard** | in-loop `{{title}}` | in-loop `{{pagination.page}}` | in-loop `{{@root.…page}}` |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` — list page 1 | 200 | `1` | *(empty)* | *(empty)* | `1` | *(empty)* | *(empty)* | `PROBE Gated Post` | *(empty)* | `1` |
| `/page/2/` — list page 2 | 200 | `2` | `1` | `2` | `2` | `1` | `2` | `Ten years of one layout` | *(empty)* | `2` |
| `/page/3/` — list page 3 | 200 | `3` | `2` | `3` | `3` | `2` | `3` | `On dependable dullness` | *(empty)* | `3` |
| `/a-brief-history-of-the-sidebar/` — a post | 200 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |
| `/member-home-preview/` — a public page | 200 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |
| `/inflozo-probe-no-such-page/` — the 404 | 404 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |

### (c) T1 `ghost6.inflozo.com` (6.58.0)

**Ghost's own verdict on the upload.** `root` theme → upload HTTP 200, activated and SERVED

| Address | HTTP | `{{pagination.page}}` | `{{pagination.prev}}` | **plain guard** | `{{@root.…page}}` | `{{@root.…prev}}` | **@root guard** | in-loop `{{title}}` | in-loop `{{pagination.page}}` | in-loop `{{@root.…page}}` |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` — list page 1 | 200 | `1` | *(empty)* | *(empty)* | `1` | *(empty)* | *(empty)* | `PROBE Gated Post` | *(empty)* | `1` |
| `/page/2/` — list page 2 | 200 | `2` | `1` | `2` | `2` | `1` | `2` | `Ten years of one layout` | *(empty)* | `2` |
| `/page/3/` — list page 3 | 200 | `3` | `2` | `3` | `3` | `2` | `3` | `On dependable dullness` | *(empty)* | `3` |
| `/a-brief-history-of-the-sidebar/` — a post | 200 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |
| `/member-home-preview/` — a public page | 200 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |
| `/inflozo-probe-no-such-page/` — the 404 | 404 | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | — | — | — |

### (d) What it means

- **R-186 holds.** The guard prints nothing at `/`, the page's own number from `/page/2/` on, and nothing on a post, a standalone page and the 404 — identically on both majors.
- **R-183 comes free.** Ghost leaves `pagination` off post, page and the 404 entirely, and Handlebars renders a missing path as the empty string rather than throwing (it compiles with `{preventIndent: true}` alone — no `strict`, no `assumeObjects`).
- **`{{pagination.page}}` resolves in `default.hbs`.** express-hbs renders the page template and then the layout with the SAME locals object, so the layout sees the response root.
- **The one place the two spellings differ is inside `{{#foreach}}`**, and the table measures it: the in-loop `{{title}}` control prints, so the block ran, and `{{pagination.page}}` is empty inside it while `{{@root.pagination.page}}` is not. That is Handlebars, not Ghost — a path lookup does not walk out to the parent context. **It costs nothing today: no design in the library puts a `data-prop` inside a `data-repeat`** (the authored-array props a design does repeat are expanded by `expandItems` on BOTH emitters, never as `{{#foreach}}`), so the emitted constant never lands inside one. `docs/section-authoring.md` says so where an author would need to know it.

**What this does NOT say.** Nothing here was rendered through Inflozo's own emitter: the markers are the raw expressions, written by hand into a probe theme. That the emitter produces exactly this string, once per occurrence and with every other character of user text escaped, is `agreement.test.ts`'s and `ad36.test.ts`'s, per commit.

## 50. `edit_locks` — the compare-and-swap, the take-over guard and Realtime broadcast, executed on the real Supabase project · 2026-09-23

`python3 tools/probe/record-edit-lock.py`. Story 5.17. The first execution of FR-D18's protocol and of `addendum.md:45`'s transport claim — MEASUREMENTS.md carried no occurrence of "realtime" or "broadcast" before this. One throwaway account and two projects of its own, created and deleted in a `finally`; two real GoTrue sessions of that one account, because the lock is one person's devices negotiating with each other. Every write below went through the `authenticated` role under RLS and the column grants — never the service key.

### (a) The protocol, step by step

| Step | Verdict | What the real project answered |
|---|---|---|
| `filtered-update/hit` | **PASS** | HTTP 200, 1 row(s) returned |
| `filtered-update/miss` | **PASS** | HTTP 200, 0 row(s) returned, unsynced_edits still 7 |
| `cas-race/control` | **PASS** | uncontended CAS 1 -> 2: HTTP 200, 1 row(s) |
| `cas-race/one-wins` | **PASS** | both fired at 2 -> 3: session 0 HTTP 200 1 row(s) in 362 ms · session 1 HTTP 200 0 row(s) in 836 ms · the row now holds racer-0 at generation 3 |
| `takeover-guard/refused` | **PASS** | HTTP 403, SQLSTATE 42501; the holder is still racer-0 at generation 3 |
| `takeover-guard/control` | **PASS** | the same holder change at generation 3 -> 4: HTTP 200, 1 row(s) |
| `insert-grant/named-refused` | **PASS** | INSERT naming lock_generation: HTTP 403, SQLSTATE 42501 |
| `insert-grant/defaults-to-1` | **PASS** | plain INSERT: HTTP 201, lock_generation 1 |
| `insert-grant/second-is-23505` | **PASS** | a second INSERT for the same project: HTTP 409, SQLSTATE 23505 |
| `realtime/public` | RECORD | subscribed, received in 23 ms, payload intact, and a message on another project's channel did NOT arrive |
| `realtime/private` | RECORD | subscribed=False received=None isolated=None — CHANNEL_ERROR: Unauthorized: You do not have permissions to read from this Channel topic: lock:23d50c0d-4b64-42ab-aaab-50905922f863 |

### (b) What it means

- **The CAS is expressible through PostgREST, so FR-D18 needs no migration and Story 5.17 has no Schema phase.** `PATCH /edit_locks?project_id=eq.<id>&lock_generation=eq.<N>` with `Prefer: return=representation` returns the row it changed and an EMPTY ARRAY — HTTP 200, not an error — when the filter misses. The empty array is the whole protocol: it is how a session learns it was beaten without a second round trip.
- **Two sessions racing the same CAS produce exactly one winner.** Postgres re-evaluates the `WHERE` after the row lock is released under READ COMMITTED, so the loser's filter no longer matches and it changes nothing. No advisory lock, no `security definer` function and no serializable retry is needed.
- **`guard_lock_takeover` is live and answers `42501`** to a holder change at an unchanged generation, which PostgREST surfaces as HTTP 403 with the SQLSTATE in the body. The displaced device's detection signal therefore cannot be routed around by a client.
- **`lock_generation` is genuinely outside the INSERT grant**: an INSERT that names it is refused, a plain INSERT defaults it to 1, and a second INSERT for the same project is `23505` — the matrix's fall-through to the CAS path, executed.

### (c) Realtime broadcast

- **A public channel `lock:<project id>` WORKS.** Subscribed, the message arrived in **23 ms** with its payload intact, and a message sent on ANOTHER project's channel did not arrive — the isolation control, without which "it was received" proves only that something arrived.
- **A private channel is REFUSED.** subscribed: `False` — `CHANNEL_ERROR: Unauthorized: You do not have permissions to read from this Channel topic: lock:23d50c0d-4b64-42ab-aaab-50905922f863`.

**No publication and no Postgres Changes are involved.** Broadcast is ephemeral pub/sub over the Realtime socket; nothing is read from WAL, so nothing here would have needed a migration on the publication. **A PRIVATE channel is a different matter**: Realtime authorises it against `realtime.messages`, this project has no policy there, and adding one is a migration — which is the Ask First the spec names. A PUBLIC channel needs no policy and carries the opposite cost: the topic is `lock:<project id>`, so anyone holding the publishable key and a project id could join it and watch the nudges go by.

### (d) What this does NOT say — and it decides the story

Every call above was made by a **Node script holding a user access token**. The app has no such thing in the browser: `apps/web/lib/supabase/server.ts` is "THE ONLY PLACE A SUPABASE CLIENT IS MADE", there is no `NEXT_PUBLIC_*` key, and `lib/supabase/cookies.ts` sets the session cookie `httpOnly: true` precisely because "this app has none, so the cookie is closed to script". So the **browser cannot open a Realtime socket and cannot PATCH PostgREST directly** without a browser-side client, a public key and a script-readable session — none of which exists, and each of which is an architectural change the owner has not been asked for.

The CAS is unaffected: it runs from a **route handler under the user's own session** (`projects/[id]/sync/route.ts`'s shape), which is the same `authenticated` role, the same RLS and the same grants this section executed. Realtime's middle transport layer is the part that has nowhere to live, and it is put to the owner rather than invented.

## 51. The Content API from a browser — CORS, `formats=mobiledoc` as "no body", and Ghost's brute limiter, executed read-only on both majors · 2026-09-24

`env $(grep -E '^GHOST[56]_(URL|CONTENT_API_KEY)=' tools/probe/.env | xargs) python3 tools/probe/record-content-api.py`. Story 5.18. Every request carried `Origin: https://app.inflozo.com` and `Accept-Version: v5.0` — the two headers the editor's reads carry — and nothing was written to either server. The facts were read in Ghost's source on both majors at the spec's Create; this is their execution (standing rule 1).

### (a) Step by step

| Server | Step | Verdict | What Ghost answered |
|---|---|---|---|
| T3 ghost5 | `control` | **PASS** | `settings/` with the real key: HTTP 200 |
| T3 ghost5 | `cors/posts` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T3 ghost5 | `cors/pages` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T3 ghost5 | `cors/tags` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T3 ghost5 | `cors/authors` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T3 ghost5 | `cors/settings` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T3 ghost5 | `cors/preflight` | **PASS** | OPTIONS → HTTP 204, `access-control-allow-origin: *`, `access-control-allow-headers: accept-version`, `access-control-max-age: 86400` |
| T3 ghost5 | `cache-control` | RECORD | `Cache-Control: public, max-age=0` on `settings/` |
| T3 ghost5 | `no-body/posts` | **PASS** | 33 posts: the plain read carries `html` on every row (True) · with `formats=mobiledoc` none carries html, plaintext, lexical, mobiledoc (True) · `reading_time` and `excerpt` present on every row (True) and identical to the plain read's (True) · **99,402 bytes against 110,057** · keys: access, authors, canonical_url, codeinjection_foot, codeinjection_head, comment_id, comments, created_at, custom_excerpt, custom_template, email_subject, excerpt, feature_image, feature_image_alt, feature_image_caption, featured, frontmatter, id, meta_description, meta_title, og_description, og_image, og_title, primary_author, primary_tag, published_at, reading_time, slug, tags, title, twitter_description, twitter_image, twitter_title, updated_at, url, uuid, visibility |
| T3 ghost5 | `no-body/by-slug` | **PASS** | `filter=slug:'<slug>'` (quoted, the editor's shape) → HTTP 200, 1 row, no body, `reading_time` 0 as the plain read's |
| T3 ghost5 | `by-slug/gone-is-a-browse` | **PASS** | a slug no post holds → HTTP 200, 0 rows — a browse, never a 404 (which Ghost would count against the network) |
| T3 ghost5 | `no-body/pages` | **PASS** | 2 pages: the plain read carries `html` on every row (True) · with `formats=mobiledoc` none carries html, plaintext, lexical, mobiledoc (True) · `reading_time` and `excerpt` present on every row (True) and identical to the plain read's (True) · **1,973 bytes against 2,072** · keys: access, canonical_url, codeinjection_foot, codeinjection_head, comment_id, comments, created_at, custom_excerpt, custom_template, excerpt, feature_image, feature_image_alt, feature_image_caption, featured, frontmatter, id, meta_description, meta_title, og_description, og_image, og_title, published_at, reading_time, show_title_and_feature_image, slug, title, twitter_description, twitter_image, twitter_title, updated_at, url, uuid, visibility |
| T3 ghost5 | `fields-drops-reading-time` | **PASS** | `fields=id,slug,title,reading_time` → HTTP 200, `reading_time` on 0 of 5 rows |
| T3 ghost5 | `past-last/tags` | **PASS** | `filter=tags:'<slug>'` on a tag of 5 posts: page 1 total 5 (the control) · page 2 → HTTP 200, 0 rows, `meta.pagination.pages` 1 |
| T3 ghost5 | `past-last/authors` | **PASS** | `filter=authors:'<slug>'` on a author of 10 posts: page 1 total 10 (the control) · page 2 → HTTP 200, 0 rows, `meta.pagination.pages` 1 |
| T3 ghost5 | `count-order/tags` | **PASS** | `include=count.posts&order=count.posts desc` → HTTP 200, counts [9, 8, 7, 6, 5, 5] |
| T3 ghost5 | `count-order/authors` | **PASS** | `include=count.posts&order=count.posts desc` → HTTP 200, counts [12, 11, 10] |
| T3 ghost5 | `ids-order` | RECORD | `filter=id:[c,b,a]` → 3 rows, in the REQUESTED order: False; in the newest-first order: True |
| T3 ghost5 | `settings` | RECORD | 50 keys: accent_color, allow_self_signup, codeinjection_foot, codeinjection_head, comments_enabled, cover_image, default_email_address, description, donations_enabled, editor_default_email_recipients, facebook, firstpromoter_account, icon, labs, lang, locale, logo, members_enabled, members_invite_only, members_signup_access, members_support_address, meta_description, meta_title, navigation, og_description, og_image, og_title, outbound_link_tagging, paid_members_enabled, portal_button, portal_button_icon, portal_button_signup_text, portal_button_style, portal_default_plan, portal_name, portal_plans, portal_signup_checkbox_required, portal_signup_terms_html, recommendations_enabled, secondary_navigation, site_uuid, support_email_address, timezone, title, twitter, twitter_description, twitter_image, twitter_title, url, version · `codeinjection_head` present: True, `codeinjection_foot` present: True · `timezone`: `Etc/UTC` · `title`: "Ghost5" · navigation urls: ['relative'] (2 items) |
| T1 ghost6 | `control` | **PASS** | `settings/` with the real key: HTTP 200 |
| T1 ghost6 | `cors/posts` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T1 ghost6 | `cors/pages` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T1 ghost6 | `cors/tags` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T1 ghost6 | `cors/authors` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T1 ghost6 | `cors/settings` | **PASS** | 200 → `access-control-allow-origin: *` · a key Ghost never issued → HTTP 401 UnauthorizedError · "Unknown Content API Key", `access-control-allow-origin: *` |
| T1 ghost6 | `cors/preflight` | **PASS** | OPTIONS → HTTP 204, `access-control-allow-origin: *`, `access-control-allow-headers: accept-version`, `access-control-max-age: 86400` |
| T1 ghost6 | `cache-control` | RECORD | `Cache-Control: public, max-age=0` on `settings/` |
| T1 ghost6 | `no-body/posts` | **PASS** | 33 posts: the plain read carries `html` on every row (True) · with `formats=mobiledoc` none carries html, plaintext, lexical, mobiledoc (True) · `reading_time` and `excerpt` present on every row (True) and identical to the plain read's (True) · **99,954 bytes against 110,609** · keys: access, authors, canonical_url, codeinjection_foot, codeinjection_head, comment_id, comments, created_at, custom_excerpt, custom_template, email_subject, excerpt, feature_image, feature_image_alt, feature_image_caption, featured, frontmatter, id, meta_description, meta_title, og_description, og_image, og_title, primary_author, primary_tag, published_at, reading_time, slug, tags, title, twitter_description, twitter_image, twitter_title, updated_at, url, uuid, visibility |
| T1 ghost6 | `no-body/by-slug` | **PASS** | `filter=slug:'<slug>'` (quoted, the editor's shape) → HTTP 200, 1 row, no body, `reading_time` 0 as the plain read's |
| T1 ghost6 | `by-slug/gone-is-a-browse` | **PASS** | a slug no post holds → HTTP 200, 0 rows — a browse, never a 404 (which Ghost would count against the network) |
| T1 ghost6 | `no-body/pages` | **PASS** | 2 pages: the plain read carries `html` on every row (True) · with `formats=mobiledoc` none carries html, plaintext, lexical, mobiledoc (True) · `reading_time` and `excerpt` present on every row (True) and identical to the plain read's (True) · **1,973 bytes against 2,072** · keys: access, canonical_url, codeinjection_foot, codeinjection_head, comment_id, comments, created_at, custom_excerpt, custom_template, excerpt, feature_image, feature_image_alt, feature_image_caption, featured, frontmatter, id, meta_description, meta_title, og_description, og_image, og_title, published_at, reading_time, show_title_and_feature_image, slug, title, twitter_description, twitter_image, twitter_title, updated_at, url, uuid, visibility |
| T1 ghost6 | `fields-drops-reading-time` | **PASS** | `fields=id,slug,title,reading_time` → HTTP 200, `reading_time` on 0 of 5 rows |
| T1 ghost6 | `past-last/tags` | **PASS** | `filter=tags:'<slug>'` on a tag of 5 posts: page 1 total 5 (the control) · page 2 → HTTP 200, 0 rows, `meta.pagination.pages` 1 |
| T1 ghost6 | `past-last/authors` | **PASS** | `filter=authors:'<slug>'` on a author of 10 posts: page 1 total 10 (the control) · page 2 → HTTP 200, 0 rows, `meta.pagination.pages` 1 |
| T1 ghost6 | `count-order/tags` | **PASS** | `include=count.posts&order=count.posts desc` → HTTP 200, counts [9, 8, 7, 6, 5, 5] |
| T1 ghost6 | `count-order/authors` | **PASS** | `include=count.posts&order=count.posts desc` → HTTP 200, counts [12, 11, 10] |
| T1 ghost6 | `ids-order` | RECORD | `filter=id:[c,b,a]` → 3 rows, in the REQUESTED order: False; in the newest-first order: True |
| T1 ghost6 | `settings` | RECORD | 62 keys: accent_color, allow_self_signup, bluesky, codeinjection_foot, codeinjection_head, comments_enabled, cover_image, default_email_address, description, donations_enabled, editor_default_email_recipients, facebook, firstpromoter_account, icon, instagram, labs, lang, linkedin, locale, logo, mastodon, members_enabled, members_invite_only, members_signup_access, members_support_address, meta_description, meta_title, navigation, og_description, og_image, og_title, outbound_link_tagging, paid_members_enabled, portal_button, portal_button_icon, portal_button_signup_text, portal_button_style, portal_default_plan, portal_name, portal_plans, portal_signup_checkbox_required, portal_signup_terms_html, recommendations_enabled, secondary_navigation, site_uuid, support_email_address, threads, tiktok, timezone, title, transistor_portal_button_text, transistor_portal_description, transistor_portal_enabled, transistor_portal_heading, transistor_portal_url_template, twitter, twitter_description, twitter_image, twitter_title, url, version, youtube · `codeinjection_head` present: True, `codeinjection_foot` present: True · `timezone`: `Etc/UTC` · `title`: "Ghost6" · navigation urls: ['absolute', 'relative'] (3 items) |
| T1 ghost6 | `limiter/control` | **PASS** | a read with the real key first: HTTP 200 — the count starts from zero |
| T1 ghost6 | `limiter/failures` | **PASS** | 100 reads with a key Ghost never issued: HTTP 401 × 100 |
| T1 ghost6 | `limiter/the-real-key` | **PASS** | then ONE read with the real key → HTTP 429 TooManyRequestsError · "Too many attempts." at 12:49:40 UTC — the limiter runs BEFORE authentication, so a good key is refused with the rest |
| T1 ghost6 | `limiter/cors-on-429` | RECORD | the 429 carries `access-control-allow-origin: *` — so a browser CAN read its status, and the editor can name it |

### (b) What it means

- **The browser may read every Content API route the editor uses, and a refusal too.** `access-control-allow-origin: *` is on the 200 and on the 401 of `posts/` `pages/` `tags/` `authors/` `settings/`, and the preflight allows `accept-version` — so a wrong key reaches the editor as a readable 401, not as "not answering".
- **There is no HTTP caching to lean on**: the 60 s cache is the editor's own.
- **`formats=mobiledoc` is "no body" on both majors** — no `html`, `plaintext`, `lexical` or `mobiledoc`, while `reading_time` and `excerpt` are still computed on the server and identical to a plain read's. `fields=` is not the alternative: it loses `reading_time`, which a17/1 and a24/1 print.
- **A post and a page carry `codeinjection_head` and `codeinjection_foot` of their OWN** (the keys column of `no-body/*` above), beside the site's on `/settings/` — so the editor's whitelist, not the request, is what keeps both out of every row it caches.
- **A missing subject is a browse that answers `200 []`**, and past an archive's last page is `200 []` too — so nothing the editor asks for is ever a 404, which Ghost would count against the customer's network.
- **Ghost limits FAILED requests per network, not keys**, and checks before it authenticates: after the run of failures above, the real key was refused as well. FR-H4's *"because Ghost rate-limits Content API keys"* is corrected to that sentence wherever it is stated.

**T1's Content API refused this machine's network from 12:49 UTC** — every key, the site's own search included. How long is Ghost's config, read in source on both majors and NOT measured by this run: `spam.content_api_key` holds a network for `minWait` 3,600,000 ms within a `lifetime` of 3,600 s (`core/shared/config/defaults.json`). That is the cost the editor's failure policy exists to never impose on a customer: a refusal is never retried, three failures stop reading, and every session has a ceiling.

**What this does NOT say.** Nothing here ran through a Ghost(Pro) edge (DW-249): whether an edge's own 429 carries `access-control-allow-origin`, the edge's limits, and whether the `*.ghost.io` admin origin serves the Content API with these headers are the Ghost(Pro) trial's, on VERIFY-AT-BUILD's checklist.

## 52. How long Ghost's Content API limiter holds a network — timed on T1 after a real 429 · 2026-09-24

`env $(grep -E '^GHOST6_(URL|CONTENT_API_KEY)=' tools/probe/.env | xargs) python3 -` over a loop of a few lines: one `GET settings/` on T1 with the **real** key every 300 s, carrying `Accept-Version: v5.0` and `Origin: https://app.inflozo.com`, printing the UTC time and the status, and stopping at the first 200. Story 5.18. §51 left the length of the hold to Ghost's config; this times it. The hold was earned by `tools/probe/run-verify-live-content.cjs`'s last step (`MAJORS=6`, at `ee146bbf`) — a real-key read first as its control (200), then 100 reads with a key Ghost never issued (401 × 100), then the editor's one read (429) — at **14:22:54 UTC**.

| UTC | T1 `settings/` with the real key |
|---|---|
| 14:23:10 · 14:28:11 · 14:33:12 · 14:38:12 · 14:43:13 · 14:48:14 · 14:53:14 · 14:58:15 · 15:03:16 · 15:08:16 · 15:13:17 · 15:18:17 | 429 every time |
| 15:23:18 | **200** |

**What it means.**

- **The hold is an hour, measured**: still refused 55 min 23 s after the 429, answered 60 min 24 s after it. That is Ghost's own config, read in both majors' npm tarballs (6.58.0 and 5.130.6, `core/shared/config/defaults.json`): `spam.content_api_key` = `minWait` 3,600,000 · `maxWait` 86,400,000 · `lifetime` 3,600 · `freeRetries` 99 — `maxWait` is on both majors too, which §51 did not print. The limiter is `express-brute` 1.0.1 (the `dependencies` of both `ghost` packages) over its `MemoryStore` (`spam-prevention.js`'s `contentApiKey`), whose first held delay is `minWait` (`index.js:17-23`) and whose entry is deleted `lifetime` seconds after its last write (`lib/MemoryStore.js`) — both an hour after the 100th failure, which is what the table shows. FR-H4's *"for at least an hour"* holds.
- **The probe did not lengthen what it measured**: a held request is answered by the fail callback without writing the store (`index.js:126-146`), and the first answered request resets the count.
- The store is in memory, so a restart of that Ghost ends a hold early; nothing here depended on one.

## 53. A secondary feed's `{{#get}}` — `include`, shadowing, the three Source filters, hand-picked order and `pagination` inside a get, executed on both majors; and gscan refusing `author:` · 2026-09-25

**Command.** `python3 tools/probe/record-shim.py` (its docstring is its help — any flag uploads), run twice on 2026-09-25: the `FEED` group of `tools/probe/theme-shim/index.hbs`, each row under the full native feed of the same Home page, recorded into `packages/ghost-shim/fixtures/ghost{5,6}/index.json` (`values.FEED`) and asserted per commit by `packages/ghost-shim/src/contract.test.ts`. One probe-theme upload and activation per server per run, `casper` restored and the probe theme deleted each time; the second run added `by_authors`. The picks are the site's own three newest public posts, taken in the order 2nd · 3rd · 1st so that no date order can pass for the picked one (`feed_picks(g)`, substituted into `__FEED_IDS__` / `__FEED_PICKS__` at zip time).

**Why.** Story 5.19 renders a SECONDARY feed — every feed on a paginated page but its main feed — as the same markup inside `{{#get "posts"}}`. That rests on facts about Ghost's `get` helper that were read in source and had never been executed (standing rule 1): that a get shadows the page's own `posts`, which of a post's relations it carries, what `pagination` means inside it, and that the fold's three filters answer on both majors.

| Row (under Home's native feed) | T3 `ghost5.inflozo.com` 5.130.6 | T1 `ghost6.inflozo.com` 6.58.0 |
|---|---|---|
| `native` — `posts.length` · `pagination.page/pages` · `next` | `12\|1/3\|2` | `12\|1/3\|2` |
| `get_plain` — `limit="3"`, no `include`: `title\|primary_tag.name\|primary_author.name` | `PROBEs Gated Post\|\|;On typography and restraint\|\|;The cost of clever\|\|;` | `PROBE Gated Post\|\|;On typography and restraint\|\|;The cost of clever\|\|;` |
| `get_include` — the same with `include="tags,authors"` | `PROBEs Gated Post\|\|Umang;On typography and restraint\|Craft\|Tom Whitlock;The cost of clever\|Systems\|Umang;` | `PROBE Gated Post\|\|Umang;On typography and restraint\|Craft\|Tom Whitlock;The cost of clever\|Systems\|Umang;` |
| `shadow_zero` — a get matching nothing: `{{#if posts}}FULL{{else}}EMPTY{{/if}}`, the get's own `{{else}}` printing `GET_ELSE` | `EMPTY` | `EMPTY` |
| `shadow_rows` — `tag:'craft'`, `limit="2"`, the same test | `FULL:2` | `FULL:2` |
| `by_tag` — `filter="tag:'craft'"`, oldest first, `limit="3"` | `the-weight-of-a-headline, notes-on-naming-things, systems-that-outlive-teams` | the same |
| `by_author` — `filter="author:'priya-raman'"`, the same | `everything-is-a-list, on-dependable-dullness, the-last-mile-of-design` | the same |
| `by_authors` — `filter="authors:'priya-raman'"`, the same | `everything-is-a-list, on-dependable-dullness, the-last-mile-of-design` | the same |
| `featured` — `filter="featured:true"`, the same | `notes-on-naming-things, systems-that-outlive-teams, what-survives-a-migration` | the same |
| `picks_single` — three single-id gets in the picked order (published 08-11 · 08-10 · 08-12) | `the-cost-of-clever, a-quiet-week-in-the-archive, on-typography-and-restraint` | the same |
| `picks_existence` — the same three inside `{{#get "posts" filter="id:[…]" limit="1"}}{{#if posts}}` | the same three, in the same order | the same |
| `picks_none` — the existence get over an id no post has | `EMPTY` | `EMPTY` |
| `pagination_in_get` — inside `tag:'craft'` `limit="2"`: `page/pages\|next\|{{page_url pagination.next}}` | `1/5\|2\|/page/2/` | `1/5\|2\|/page/2/` |

The trailing commas and semicolons are the rows' own separators; the two majors differ only in the newest post's title, which is the site's own content (T3 carries a probe post titled `PROBEs Gated Post`).

**What it means.**

- **A get shadows `posts`, and runs its block at zero.** Over a full native feed, `{{#if posts}}` inside a get matching nothing is false, and the get's own `{{else}}` did not run — the block ran with an empty list. So the secondary feed's premise holds on both majors, and the `{{#if posts}}` around the section is what makes zero render NOTHING, heading and container together (FR-H4): the get alone would print the section's frame around no posts.
- **Without `include`, a get carries no tags and no writers** — `primary_tag` and `primary_author` are empty on both majors, as the Content API serializer's `defaultRelations` (Admin API only) predicted. With `include="tags,authors"` both print. **Fixed as the spec's Ask First directs: every posts query is emitted with `include="tags,authors"`** (`packages/ghost-shim/src/index.ts`, `POSTS_INCLUDE`), which moved exactly one line of the snapshots — Latest Post's `{{#get}}` (`packages/library/snapshots/a4/13/template.hbs`), whose card prints `primary_tag.name` and printed nothing on a live site until now, while the canvas printed the tag.
- **The three Source filters answer, identically on both majors.** `tag:'…'` and `authors:'…'` expand to `tags.slug` and `authors.slug`; the singular `author:'…'` answers the same posts at render.
- **Hand-picked order is the order of the single-id gets**, and survives inside the existence get; an existence get over ids that match nothing renders nothing — a hand-picked section whose every pick has gone vanishes.
- **Inside a get, `pagination` is the QUERY's** (9 Craft posts at 2 a page is `1/5`), and `{{page_url pagination.next}}` is `/page/2/` — the ROUTE's page 2, Home's. A pager inside a secondary feed would link to a wrong page, not a missing one, so both emitters leave a secondary feed's pager out.

**And gscan refuses the singular writer filter — the one change this record forced on the fold.** Executed with `tools/stress/gate.js` over the stress theme's five secondary feeds, and over a control copy differing only in that one filter:

```
authors:'priya-raman' (as built)          author:'priya-raman' (the control copy)
Ghost 5.x via gscan 4.49.7 (v5) -> 0 / 0   Ghost 5.x via gscan 4.49.7 (v5) -> ERRORS 1  ERROR GS001-DEPR-AUTH-FILT
Ghost 6.x via gscan 6.4.2  (v6) -> 0 / 0   Ghost 6.x via gscan 6.4.2  (v6) -> ERRORS 1  ERROR GS001-DEPR-AUTH-FILT
```

The rule is `level: 'error'`, `fatal: false`, at `lib/specs/v5.js:527` in both bundled gscans — the `v5` spec 4.49.7 checks Ghost 5 with, and the one 6.4.2's `v6` spec extends (`v6.js:3`, `previousSpec = require('./v5')`): *"`filter="author:[...]"` should be replaced with `filter="authors:[...]"`"*. Not fatal, which is why Ghost itself uploaded and served the probe theme carrying `by_author` on both boxes — but every theme Inflozo emits must scan at 0 errors on both majors (AD-34), so **the fold writes `authors:'…'`** (`packages/section-runtime/src/controls.ts`, `withData`), where the spec's text said `author:'…'`. The two answer the same three posts on both majors (the table), so nothing a customer sees changes.

**What this does NOT say.** The markers are raw expressions written by hand into a probe theme, not the emitter's output. That the emitter produces them — the whole section inside the get and `{{#if posts}}`, the existence get around the picks, the pager left out on both emitters, a crafted Source value inert — is `agreement.test.ts`'s and `ad36.test.ts`'s, per commit, and gscan's verdict on the emitted secondary feeds is `tools/stress`'s.

## 54. The paywall — what Ghost sends a visitor who may not read a paid post, its own box and stylesheet, `{{reading_time}}` on a withheld body, `/tiers/` and a hidden tier, and Subscription access "Nobody" — recorded on both majors · 2026-09-26

**Command.** `python3 tools/probe/record-shim.py` (its docstring is its help — any flag uploads), run twice on 2026-09-26: the `MEMBERS` group of `tools/probe/theme-shim/index.hbs` (under Home) and the probe template `tools/probe/theme-shim/custom-inflozo-members.hbs` (inside `{{#post}}`, printing the post's `visibility`, `access`, the bare `{{reading_time}}`, the field inside `{{t}}`, the five `@site` member flags, `@site.signup_url` and `@labs.members`, and `{{content}}` verbatim). Per server, TWO Paid-members-only posts are created with the staff token and deleted in a `finally`, each read back gone: a LONG one — twelve paragraphs with Ghost's `paywall` card (the author's Public preview marker, `<!--members-only-->`) after the third — and a SHORT one — one sentence, no card. Every page is fetched signed out. Then, on T3 only, Subscription access is set to **Nobody** with the staff token (`PUT settings/` `members_signup_access: none`), the long post is re-rendered, and `all` is put back in a `finally` and READ BACK — the run's own restore check passed. Recorded into `packages/ghost-shim/fixtures/ghost{5,6}/members-long.json` and `members-short.json`, `ghost5/members-long-nobody.json`, and `values.MEMBERS` of `index.json` on both; every row below is asserted per commit by the seven `MEMBERS ·` tests of `packages/ghost-shim/src/contract.test.ts`. The Content API `tiers/` and `settings/` reads and the Admin `settings/` read (integration key) ride the same run, keys by name only; the Admin read keeps the five member keys and NO Stripe key (the recorder never copies one, and a test asserts none is in the fixture).

**Why.** Story 5.20 draws a paywall canvas, warns on a members-off site, and changes what `{{reading_time}}` prints — every one of them resting on Ghost facts read in source at the spec's Create (its Code Map) and never executed (standing rule 1): what `forPost` sends a visitor without access, Ghost's own `content-cta` box and `tpl/styles.js`, the reading-time helper's `if (!post.html && !post.reading_time)`, what `/tiers/` answers, and what "Nobody" changes.

| Row (signed out) | T3 `ghost5.inflozo.com` 5.130.6 | T1 `ghost6.inflozo.com` 6.58.0 |
|---|---|---|
| long post — `visibility` · `access` | `paid` · `false` | `paid` · `false` |
| long post — what was sent | the html BEFORE the marker, exactly: 2022 of the author's 8110 characters | the same |
| long post — `{{reading_time}}` · the field in `{{t}}` · the stored `reading_time` | `6 min read` · `6 min read` · 6 | the same |
| short post (no marker) — what was sent | `''` — no body, no preview | the same |
| short post — `{{reading_time}}` · the field · the stored value | `''` · `0 min read` · 0 | the same |
| `{{content}}` after the preview — Ghost's own box | `<aside class="gh-post-upgrade-cta">`, `background-color` the site's accent `#0da51e`, **This post is for paying subscribers only** · Subscribe now (`data-portal="signup"`) · Already have an account? Sign in (`data-portal="signin"`) | the same markup and words; accent `#3832e5`; the `<h2>`'s indent 16 spaces where 5 has 12 (6 writes it through `{{t}}`) |
| `<style id="gh-members-styles">` in `{{ghost_head}}` | 1257 characters, byte-equal to `tpl/styles.js` | the same bytes |
| Portal's script · Stripe's script in `{{ghost_head}}` | present · present | present · present |
| Content API `tiers/` (`include=monthly_price,yearly_price,benefits`) | three: Free (`free`, `public`) · Ghost5 (`paid`, `public`, USD 500 / 5000) · **Ghost5 Pro (`paid`, visibility `none`, USD 1500 / 15000, 7 trial days)** | the same three, named Ghost6 and Ghost6 Pro |
| `tiers/?filter=type:paid+visibility:public` | one: Ghost5 | one: Ghost6 |
| `{{#get "tiers"}}`: `tiers.length` · `{{#foreach}}` plain · `{{#foreach … visibility="all"}}` · with FR-H6's filter | `3` · Free, Ghost5 · all three · Ghost5 | `3` · Free, Ghost6 · all three · Ghost6 |
| no tier carries benefits | — | — |
| Content API `settings/` member keys | `members_enabled` true · `members_invite_only` false · `members_signup_access` `all` · `allow_self_signup` true · `paid_members_enabled` true · `portal_plans` `[free, monthly, yearly]` | the same |
| Admin `settings/` (integration key) member keys | the same five: the stored `members_signup_access` and the four calculated flags | the same |

**Subscription access "Nobody", T3 only** (the long post, signed out, the same page as the control above):

| Row | before (the control) | with Nobody |
|---|---|---|
| `access` · what was sent · the box | `false` · the preview · Ghost's own box | `false` · the SAME preview · the SAME box, byte for byte |
| `@site.members_enabled` · `allow_self_signup` · `paid_members_enabled` · `@labs.members` | true · true · true · true | false · false · false · false |
| `@site.signup_url` | `#/portal` | `https://feedly.com/i/subscription/feed/https%3A%2F%2Fghost5.inflozo.com%2Frss%2F` |
| Portal's script · the CTA stylesheet · Stripe's script | present · present · present | **present** · **present** · gone |
| Admin `settings/` | `members_signup_access` `all`, the flags true | `none`, the three calculated flags false |

**What it means.**

- **Ghost withholds exactly as read in source, on both majors.** A visitor without access is sent the html before the author's marker, or nothing at all where there is no marker — and the reading time stays the WHOLE post's, computed before gating. `{{reading_time}}` prints nothing only where no body was sent AND the stored time is 0; the field inside `{{t}}` prints `0 min read` there. **DW-128's "Ghost prints no reading time for a body it withholds" holds at 0 only**, which is what `readingTime` now does (`packages/ghost-shim/src/index.ts`) and what the bare path hands it (`core.ts`).
- **Ghost's own box is one markup on both majors**, differing in one line's whitespace, and its stylesheet is `tpl/styles.js` byte for byte — which is what `contentCta` and `CTA_STYLES` are, held equal per commit. The accent is the site's, which the canvas passes through the colour parser (NFR-3).
- **Ghost does NOT hide a hidden tier.** `/tiers/` answers it on both majors; `{{#foreach}}` drops it by default and `visibility="all"` brings it back; `type:paid+visibility:public` answers the public paid tier alone. FR-H6's filter is therefore load-bearing — every `tiers` query must carry it (`tiers-unfiltered`) — and §7.6 item 14(b) is settled by execution.
- **"Nobody" unlocks nothing (R-198's premise, confirmed):** the members-only post still stops at the cut and Ghost's box still renders, while every member flag goes false and `signup_url` becomes the RSS feed.
- **But Ghost did NOT stop loading Portal**, and the ruled sentence said it would. `{{ghost_head}}` drops Portal and the CTA stylesheet only where members, donations AND recommendations are all off (`ghost_head.js:53`, 5.130.6), and on a site with Stripe connected donations stay on by default (`SettingsHelpers.js:173-175`, `areDonationsEnabled` = Stripe connected ∧ `enableTipsAndDonations`, which `core/shared/config/defaults.json:204` sets true; the Content API reported `donations_enabled` true on both boxes) — so on T3 Portal loaded, and its sign-up screen then answers **"Memberships unavailable, contact the owner for access."** (read in source: `@tryghost/portal` 2.51.5, `SignupPage.js:714-716`, `isSignupAllowed` false and `isSigninAllowed` false). Either way nobody can sign up there — the ruling's substance — so C3b's sentence keeps that and drops the clause the recording moved: *"…so your posts for members still stop at the cut, but nobody can sign up there."* (`apps/web/lib/paywall.ts`; the spec's Spec Change Log, `EXPERIENCE.md:354` and `epics.md`'s 5.20 criteria carry the correction).
- **The record's source is sound:** Admin `settings/` carries the stored access and Ghost's own calculated flags on both majors with the integration key, so `site_settings.members` is copied from two named keys — `members_signup_access` and `paid_members_enabled` — and never filtered from a payload that also carries every Stripe setting.

**What this does NOT say.** The markers are raw expressions written by hand into a probe theme, not the emitter's output; the canvas's agreement with them is `contract.test.ts`'s (the box, the stylesheet, `readingTime`) and the section runtime's (`agreement.test.ts`, `ad36.test.ts`) per commit. Portal's "Memberships unavailable" was READ in Portal's source at the version T3 pins, not clicked in a browser on T3. Nothing here records a free member's or a paid member's page (the Content API has no member session); `postAccess` is `checkPostAccess` read in source for those, and its truth table is `access.test.ts`.
