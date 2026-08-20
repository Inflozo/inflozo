---
title: Compiler Architecture Spike (C7 option D)
status: normative-companion
role: empirical validation of the C7 compiler decision — annotated HTML in, Ghost theme out
created: 2026-08-18
---

# C7 spike — result: PASSES

Validates that Inflozo can generate production-grade Ghost themes without ever
parsing or executing Handlebars.

## Run it

    npm install jsdom handlebars gscan
    node test.js     # 16 assertions on the two renderers
    node build.js    # assembles theme-output/ and runs Ghost's gscan on it

## Result

- `test.js` — **21/21 pass**
- `build.js` — generated theme scores **0 errors, 0 warnings** on gscan 6.4.2, against
  **both** the v5 and v6 specs.

## What was proven

1. HTML's built-in parser and serializer replace the Handlebars printer that option A
   would have required. No Handlebars parsing anywhere in the pipeline.
2. Handlebars expressions containing quotes survive serialization intact inside
   attributes (`src="{{img_url feature_image size="m"}}"`) via opaque ASCII tokens
   swapped after serialization — the risk that could have sunk the approach.
3. Block helpers inject as HTML comments carrying tokens and unwrap cleanly.
4. Repeating elements extract to real partials invoked with NO parameters
   (`{{> "post-card"}}`), because `{{#foreach}}` supplies the context.
5. FR-H8 media guards wrap the element, never the attribute.
6. User content containing `{{...}}` is emitted inert **as HTML numeric entities** (`&#123;`) and
   renders literally. **Corrected 2026-08-20 (Round 3, decision D2)** — this line previously read
   "emitted inert (`\\{{`)" and the code matched it. That backslash rule is refuted: it is inert for
   exactly one input shape and **live** for the rest, and `test.js` asserted only that one shape, so
   the suite printed 16/16 while a user typing `C:\\{{@site.title}}` shipped the site's own title
   into their headline and `C:\\{{#if x}}y{{/if}}` produced a theme that would not compile. See
   `MEASUREMENTS.md` §3 for the executed ladder and AD-5 for the rule. §4 of `test.js` now runs all
   seven shapes, including the marker shape itself.
7. Canvas and compiled output produce an identical element/class skeleton.
8. Zero builder fingerprints survive into the output.

## Bugs the spike caught (all implementation, none architectural)

- **The escaping rule this spike shipped for two rounds was wrong, and its own test hid that.**
  Recorded here rather than quietly fixed: a runnable artifact printing a pass count is evidence
  only of what it actually asserts. See item 6 above.

- **Order of operations in token resolution.** Comment-wrapped markers must be unwrapped
  BEFORE tokens are substituted. Substitute first and a marker Inflozo inserted becomes
  indistinguishable from a comment the section author wrote. This is a real design
  constraint for the compiler, not just a bug.
- Attribute specs contain their own colons (`src:feature_image|img_url:m`) — split on the
  first separator only.
- `splitFirst` with an absent separator silently truncated the path.

## Two PRD decisions confirmed empirically

- **C2 is real and now closed.** Omitting `engines.ghost-api` removes the standing gscan
  warning; the 0-errors-0-warnings gate IS reachable. It was unreachable only because the
  PRD mandated emitting that key.
- **The GS110 page-builder warning** is silenced by gating `page.hbs` on
  `@page.show_title_and_feature_image`, exactly as the C2 fix specified.

## Not covered

No live Ghost install; gscan is static analysis. Runtime rendering on a real Ghost, and
the four docs-vs-code conflicts in `research-ghost-binding-contexts.md`, remain open
§7.6 items.
