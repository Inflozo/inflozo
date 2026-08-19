Stress-test the Inflozo architecture. Be adversarial — your job is to break it, not to praise it.

Run this as **four passes in order**, using the BMAD skills named. Do not skip a pass, and do not
merge them: each has a different method, and the point is that they disagree with each other.

---

## Context you need before any pass

**Inflozo** is a visual site builder for Ghost CMS. Users drag pre-made sections onto a canvas; the
product compiles the design into a clean, hand-editable Ghost theme and deploys it. The central
claim is that canvas and shipped site agree **by construction** — one authored source (annotated
HTML) feeds two renderers, one producing canvas DOM and one producing Handlebars `.hbs` text.

Base path: `/home/ghost/Dev/Inflozo/_bmad-output/planning-artifacts/`

| What | Where |
|---|---|
| The spine — 35 invariants, AD-1..AD-35 | `architecture/architecture-Inflozo-2026-08-19/ARCHITECTURE-SPINE.md` |
| Everything claimed as executed | `.../MEASUREMENTS.md` |
| Schema + its runnable RLS proof | `.../SCHEMA.sql`, `.../RLS-TEST.sql`, `.../PRELUDE.sql` |
| External facts still unverified | `.../VERIFY-AT-BUILD.md` |
| The decision log for the whole run | `.../.memlog.md` |
| **The PRD — v4.1, 366 KB** | `prds/prd-Inflozo-2026-08-17/prd.md` |
| Normative for mechanism (short, read whole) | `prds/prd-Inflozo-2026-08-17/addendum.md` |
| Normative for scope — 484 designs | `prds/prd-Inflozo-2026-08-17/sections-inventory.md` |
| The runnable compiler spike | `prds/prd-Inflozo-2026-08-17/spike-compiler/` |

**Never read `prd.md` whole.** Read by section with `sed -n`: §4 build order 131-169 · §5 FRs
170-455 · §6 NFRs 456-481 · §7 architecture 482-700 · §8 epics 701-801 · appendices from 802 ·
Appendix F.1 plan matrix ~1037.

**The one rule that governs this project.** A claim about an external platform is a hypothesis until
read in that platform's source or executed against it. Four such claims entered this PRD as
normative text with the confidence of research and were verified FALSE — each deleted or damaged a
working feature. A fifth was caught during the architecture run. **Cite or execute. Never assert,
and never accept an assertion because it sounds authoritative.**

---

## PASS 1 — Execute. No skill; this is hands-on.

**Do this first, because no review skill does it.** The lenses reason; they do not run anything, and
this project's entire failure history is reasoning that sounded right. You have `node`, `npm`,
`docker`, `curl` and web access.

**Start with the author's own flagged weak point.** AD-5 replaces a broken escaping rule with HTML
numeric entity encoding — every `{` and `}` a user types becomes `&#123;` / `&#125;`, so Handlebars
never sees a mustache. That was proven **against Handlebars**. It was **not** proven through the
full pipeline.

The compiler HTML-escapes user text, walks the DOM, serializes with `outerHTML`, then resolves
tokens. **Does `&#123;` survive `outerHTML`?** If the serializer escapes the `&` to `&amp;`, output
is `&amp;#123;` and the reader sees a literal `&#123;` instead of `{` — the fix broken in exactly
the place it was declared closed. Check **text nodes and attribute values separately**; they escape
differently. Then check the ordering interaction with §7.3's opaque-token mechanic and the
"unwrap markers before substituting tokens" rule.

Run it end to end: `cd spike-compiler && npm install jsdom handlebars gscan`, then compile a case
where a user typed `C:\{{title}}` into a text prop **and** into an `alt` attribute, render the
output through real Handlebars, and determine what a browser would actually display.

Then execute against these, in expected-yield order:

1. **Determinism (AD-14).** Byte-identical compile across machines and runs is claimed. Hunt
   `Set`/`Map`/`Object.keys` iteration order, hash-based filenames, the byte-identical-partial
   hoist, layer-name slug collision ordering, locale-sensitive sort. NFR-6(c1)'s committed snapshots
   and FR-J16's zero-false-positive drift check both rest on it.
2. **AD-11's measurement.** The stress fixture repeated **two** section types 70 times. Real
   sections vary in DOM size, control count and repeater depth. Re-run with something adversarial
   and see whether the per-section cost holds.
3. **The RLS proof.** Stand it up (`docker run -d -e POSTGRES_PASSWORD=x postgres:17-alpine`, apply
   PRELUDE → SCHEMA → RLS-TEST). It passes 23 assertions — are they the right 23? Attack tenant
   isolation in ways it does not attempt: column-level grants, the `SECURITY DEFINER` view,
   `storage.objects`, service-role paths.
4. **AD-19 + Vercel Fluid.** `pg_advisory_xact_lock` through Supabase's pooler, from a runtime where
   invocations share an instance. Does module-level state leak in a way "pure core" does not prevent?

---

## PASS 2 — `/bmad-review lenses=adversarial,edge-case-hunter,verification-gap`

Run it over `ARCHITECTURE-SPINE.md`, `SCHEMA.sql` and `MEASUREMENTS.md` together, carrying Pass 1's
executed findings in as `also_consider`.

The **adversarial** lens is the load-bearing one here and it requires at least ten concrete
findings — an empty list is a signal to re-check, not a pass. Point it at this specific question:

> Construct two units one level down — two epics from §8 (prd.md lines 701-801) — that each obey
> every AD to the letter and still build incompatibly. Clashing shared-data shapes, two owners of
> one entity, conflicting state-mutation paths. Every pair is a missing or too-loose AD.

The **verification-gap** lens: name every claim in the spine or MEASUREMENTS that reads like a fact
about an external platform (Ghost, gscan, Handlebars, Postgres, Supabase, Vercel, Dodo, Next) but
carries no citation, no fixture and no executed evidence.

The **edge-case-hunter** lens: aim it at the compiler pipeline and the edit-lock protocol
(`addendum.md` §AD1/§AD2 are normative for mechanism), not at the app surfaces.

---

## PASS 3 — `/bmad-party-mode --party ghost-build-room`

That party is persisted for exactly this kind of question. Put the **Ghost-specific** claims in
front of it — the ones where being wrong is expensive and where the PRD has already been wrong four
times:

- Is "one annotated-HTML source, two renderers" actually sufficient for all 484 designs, or does
  some category in `sections-inventory.md` need something the directive vocabulary cannot express?
- The five constructs §7.3 admits are missing from the spike (`{{#get}}` blocks, member visibility,
  `{{t}}` chrome strings, `srcset`/`sizes`, and the control → `data-{control}` write) — is E4's exit
  gate sufficient to prove them, and is the list actually complete?
- AD-30 claims FR-D7 scopes exactly three things to mode and resolves each without any design
  stylesheet selecting on mode. **Walk the real inventory for a counterexample.** One breaks it.
- Does anything in the theme structure or helper surface break on Ghost 5.x, which NFR-7 supports
  publicly and T3 tests permanently?

---

## PASS 4 — `/bmad-advanced-elicitation`

Take everything from passes 1–3 and run **red team** and **pre-mortem** over the synthesis.

The pre-mortem framing: *it is eighteen months out, the library is built, and the architecture
failed. What failed, and which AD should have prevented it?* Weight it toward the failure modes this
project has actually suffered — an unverified external claim propagating, and a decision made in one
place and never propagated to everything depending on it.

---

## Reporting

One consolidated report at the end, ranked by severity. For each finding:

- **What breaks** — concretely. Name the two units that diverge, or the input producing wrong output.
- **How you know** — the command and its output, or the source file and line. Neither means it is an
  opinion; mark it as one.
- **Which AD** is missing, wrong, or too loose.
- **What you would change** — one sentence.

Separate **CONFIRMED** (executed) from **SUSPECTED** (reasoned). Do not inflate. Say plainly which
invariants survived — knowing what held is as useful as knowing what broke.

**Do not edit any file.** Report only. If two approved decisions contradict each other, stop and say
so rather than picking one.

### Already verified — lead with new ground

Confirmed by execution during the architecture run and independently re-checked: Handlebars'
backslash escape is not composable; `{{x}}}` is a parse error; `GS100` is an error on both gscan
specs and fires when any declared `config.custom` key is unreferenced, with `{{#if}}` guards and
partials both counting as references; `GS051-CUSTOM-FONTS` requires both font variables in one file;
excluding a Koenig card restores gscan's rules for it; Vercel's limits (Pro 300 s default / 800 s
max, 2 GB default / 4 GB max, 4.5 MB body cap); Ghost `main` bundles gscan 6.4.2 and handlebars
4.7.9; `middleware.ts` is deprecated in Next 16 for `proxy.ts`; a Vercel env var cannot change
without a redeploy. Re-check any of these if something looks wrong — but do not spend the run
re-deriving them.

### One overlap to know about

`/bmad-architecture` with the **validate** intent runs the Reviewer Gate against the spine and
produces a bespoke HTML report. That gate has already been run once on this spine — `lint_spine.py`
plus the two configured reviewer lenses — and its findings are already folded in. Run it **last, and
only if you want the HTML report as a deliverable**; expect it to partly re-cover Pass 2.
