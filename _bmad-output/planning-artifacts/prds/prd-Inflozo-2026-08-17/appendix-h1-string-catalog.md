---
title: Inflozo Appendix H.1 — Chrome String Catalog
status: normative-companion
role: normative companion to prd.md — the catalog FR-Q6 requires; the single source of every compiler-generated visitor-facing string, its stable key, and its English default. FR-Q6's compile validation validates against this file.
created: 2026-08-18
updated: 2026-08-19
---

# Appendix H.1 — Chrome String Catalog (normative)

FR-Q6 mandates that **every** compiler-generated, visitor-facing chrome string lives in one catalog, is consumed via `{{t}}`, and that compile validation enforces it. FR-Q6 enumerates categories only. **This file is the catalog.** Without it, no design can be authored against the rule and no acceptance criterion can be written — it therefore blocks E7 and E9–E11 and must be complete before section authoring starts.

Voice follows Appendix H: short, warm, confident, lightly playful; errors are human and name the fix; destructive and billing moments stay plain.

---

## 1. Rules

These govern the catalog itself. They are as normative as the keys.

**S0 — Overrides are ICU MessageFormat, not plain strings.** `{` and `}` are **syntax**, not characters, in every default and every user override alike. A user typing a literal brace is writing a malformed message, which is why FR-Q8 refuses it at entry rather than at compile: the compile-time check is a backstop, and the entry-time check is the one that keeps a whole-page 500 out of the user's hands (V9). **S0 is now proven rather than asserted, and both escape hatches are closed.** Executed against Ghost 6.58.0's bundled `intl-messageformat` 5.4.3: the standard ICU escape for a literal brace, `'{'`, **throws** — so ICU's own documented way out is unavailable on this version. And the numeric-entity form `&#123;`, which the compiler uses for user text elsewhere, **parses but does not render**: Ghost's `{{t}}` helper HTML-escapes its output, emitting `&amp;#123;`, so the visitor reads a literal `&#123;`. There is therefore no repair the surface could offer even if it wanted to, and "refuse and explain" is the only correct behaviour rather than merely the strict one.

**S1 — Keys are permanent identifiers. Append-only, never reworded in place.**
A key is never renamed, never reused for a different meaning, and never deleted — themes already deployed reference it, and a user's override is stored against it. This extends FR-J14's backward-compatibility contract to catalog data (the contract previously covered designs and section schemas only).

  **Keys are dotted `namespace.name`, not the English string itself.** FR-Q6 says "readable-English keys", and Ghost's `{{t}}` convention is often to pass the English source string. That convention is incompatible with S1 and S2: if the key *is* the English default, then improving the copy renames the key and silently orphans every override — precisely the failure this catalog exists to prevent. Dotted keys work identically in Ghost (`{{t}}` is a lookup with fallback to the argument), and S4 guarantees the lookup always hits, so a raw key can never leak to a visitor. "Readable" is satisfied by the namespace, which tells a translator where the string appears.

**S2 — The English default may be revised; the meaning may not.**
A typo fix or a tone pass on a default is a normal library drop: users who never overrode the key get the better copy, users who did keep theirs. But **any change of meaning, of grammatical role, or of the placeholder set is a new key.** The old key is marked `superseded_by` in the catalog, stays in the catalog forever, and ships in the **migration map** (§6), which carries the user's override forward on the next drop and lists the change in FR-J14's confirm step.

**S3 — Placeholders are part of the key's contract.**
Syntax is `{name}` (FR-Q6), passed as `{{t}}` hash params: `{{t "pagination.page_of" page=pagination.page pages=pagination.pages}}`. A key's placeholder set is fixed at creation. Adding, removing or renaming one is an S2 meaning change and needs a new key. Placeholder names are `snake_case` and English regardless of the target language.

**S4 — Every key ships in every emitted locale file.**
The compiler writes the **whole** catalog into **every** locale file it emits (FR-Q6): always `en.json`, plus the project-language file when the project language is not English. A key absent from a file would resolve to the raw dotted key on the live site — visitor-visible garbage — and the `en.json` case is worse than it sounds, because Ghost falls back to the **`en` file**, so a missing `en.json` produces raw keys across a whole non-English site rather than one string. Compile validation asserts catalog-key-set equality **for each emitted file**, **less the `canvas`-marked keys**, which render only in the editor and are never written into a locale file (see V3 and §3.9).

**S5 — `{{t}}` is the rule for `.hbs` output only. JS-consumed strings go through `data-i18n-*`.**
Ghost never runs `assets/js/main.js` through Handlebars, so `{{t}}` cannot reach a string that JavaScript writes at runtime. Keys marked **JS** in the tables below are resolved at compile time (defaults + overrides) and emitted as `data-i18n-*` attributes on their module's **mount element**; the JS module reads them from its own root node and never carries a literal.

  - **Attribute-name derivation (mechanical, no judgement):** strip the leading namespace segment, replace every `.` and `_` with `-`, prefix `data-i18n-`. `pagination.load_more_loading` on the pagination mount → `data-i18n-load-more-loading`.
  - Placeholders are emitted **intact** (`{current}`, `{total}`); the JS module substitutes at runtime. Never pre-substitute at compile time — the values are not known then.
  - Compile validation for JS keys asserts the attribute is present on the mount element, not that a `{{t}}` call exists.

**S6 — A catalog string that becomes a user-edited text prop leaves the catalog path.**
Several designs expose a chrome string as an editable text prop (an A31 error headline, for example). The catalog default is that prop's **initial value**. The moment the user edits it, the value is user content: the compiler emits it as a literal, and the `{{t}}`-only enforcement rule does not apply to it. Enforcement covers **compiler-generated** chrome, not user text — otherwise the rule is unsatisfiable for every text prop in the library.

**S7 — `credit.*` is a locked namespace.**
Credit strings are in the catalog (so they compile through the same path and satisfy S4), but they are **not listed in the Translations surface and are not overridable on any plan** — not Free, not Pro. They are emitted verbatim in every locale file and are never translated. Whether the credit *appears* is the plan question (FR-J15: Pro may disable per project; Free always retains). What the credit *says* is not a question at all. An override for a `credit.*` key can only arise from a tampered payload, since the surface never offers one: compile validation **fails the build** rather than silently dropping it, so nothing is ever quietly discarded.

**S8 — Ghost's own strings are not in this catalog.**
Strings rendered by Ghost or by a Ghost-injected script belong to Ghost's i18n namespace and cannot be reached by the theme catalog. Enumerated in §5. Attempting to catalog them produces a Translations surface that lies about what it controls.

**S9 — Additions.**
A new chrome string needs a key here **before** the design that uses it is authored. New keys are appended to their namespace; namespaces are appended at the end. No key is ever inserted into a numbered position — position carries no meaning.

---

## 2. Table legend

| Marker | Meaning |
|---|---|
| **JS** | Consumed by bundled JS. Emitted as `data-i18n-*` on the module mount element, not via `{{t}}` (S5). |
| **a11y** | Screen-reader-only or attribute-borne (`aria-label`, `alt`, `title`). Still a catalog string. |
| **prop** | Also serves as the initial value of an editable text prop; leaves the catalog path once edited (S6). |
| **locked** | Not overridable, not listed in Translations (S7). |
| **canvas** | Rendered by the canvas shim only; never emitted into a compiled theme. |

---

## 3. The catalog

### 3.1 `pagination.*` — 18 keys

Serves A34 (all 10 pagination styles) and FR-H2's main-feed designation. Numbered styles use Ghost's native `pagination` context; Load More and Infinite styles ship JS with a numbered-link fallback, which is why both `{{t}}` and **JS** keys appear here.

| Key | English default | |
|---|---|---|
| `pagination.label` | Pagination | a11y |
| `pagination.newer` | Newer posts | |
| `pagination.older` | Older posts | |
| `pagination.previous` | Previous | |
| `pagination.next` | Next | |
| `pagination.page_of` | Page {page} of {pages} | |
| `pagination.page_number` | Page {page} | |
| `pagination.goto_page` | Go to page {page} | a11y |
| `pagination.current_page` | Current page, page {page} | a11y |
| `pagination.showing_range` | Showing {from}–{to} of {total} | |
| `pagination.load_more` | Load more | |
| `pagination.load_more_count` | Load {count} more | |
| `pagination.load_more_loading` | Loading… | JS |
| `pagination.load_more_remaining` | {count} more to read | JS |
| `pagination.load_more_error` | Couldn't load more posts. | JS |
| `pagination.retry` | Try again | JS |
| `pagination.end_of_feed` | You're all caught up | JS |
| `pagination.loading_label` | Loading more posts | JS, a11y |

### 3.2 `card.*` — 9 keys

Post-card chrome across A17–A22, A27, plus the two module labels that belong to a card surface: `video-facade`'s poster link (A15, A4 #17) and `shuffle`'s refresh control (A27 #11) — FR-G7.

| Key | English default | |
|---|---|---|
| `card.read_more` | Read more | |
| `card.continue_reading` | Continue reading | |
| `card.read_full_story` | Read the full story | |
| `card.read_more_about` | Read more: {title} | a11y |
| `card.featured` | Featured | |
| `card.members_only` | Members only | |
| `card.paid_only` | Paid members | |
| `card.play_video` | Play video | a11y |
| `card.shuffle_again` | Show me different picks | JS |

### 3.3 `post.*` — 12 keys

Post header/content/footer chrome: A24, A25 (TOC, share rail), A26, A27.

| Key | English default | |
|---|---|---|
| `post.reading_time` | {minutes} min read | |
| `post.reading_time_short` | {minutes} min | |
| `post.by` | By {author} | |
| `post.updated_on` | Updated {date} | |
| `post.table_of_contents` | On this page | JS |
| `post.share` | Share | |
| `post.share_on` | Share on {network} | a11y |
| `post.copy_link` | Copy link | |
| `post.link_copied` | Link copied | JS |
| `post.previous_post` | Previous post | |
| `post.next_post` | Next post | |
| `post.related_heading` | More like this | prop |

### 3.3a `countdown.*` — 6 keys

The `countdown` module (FR-G7), reached by A2 #6 *Countdown* and A6 #11 *Countdown CTA*. Every string here is written by JavaScript at runtime, so all six are **JS** keys carried as `data-i18n-*` on the mount element (S5). The unit labels are separate keys rather than one formatted string because languages pluralise and order them differently, and the module never concatenates.

| Key | English default | |
|---|---|---|
| `countdown.days` | {count} days | JS |
| `countdown.hours` | {count} hours | JS |
| `countdown.minutes` | {count} min | JS |
| `countdown.seconds` | {count} sec | JS |
| `countdown.ended` | This has ended | JS |
| `countdown.time_remaining` | Time remaining | JS, a11y |

### 3.4 `member.*` — 24 keys

A30 members pages, A32 paywall CTAs, the header/footer member links, and every `data-members-form` on any template. `member.read_so_far` is A32 #12's approximate tease — bucketed to 5% by the module — and `member.read_so_far_static` is its **server-rendered no-JS baseline**, which is why one is marked JS and the other is not.

**Precision on error strings.** Ghost's members script writes the *server's* message into `[data-members-error]` on a failed submit; that message is Ghost's, in Ghost's language, and is not catalog-controlled (S8). The `member.error_*` keys below cover the theme's own client-side validation and the generic states the theme renders from the form's `success`/`error` classes. A design that renders both must not imply the two come from the same place.

| Key | English default | |
|---|---|---|
| `member.email_placeholder` | Your email address | |
| `member.name_placeholder` | Your name | |
| `member.signup_cta` | Subscribe | prop |
| `member.signup_free_cta` | Sign up free | prop |
| `member.signin_cta` | Sign in | |
| `member.continue` | Continue | |
| `member.sending` | Sending… | JS |
| `member.signup_success` | You're in. Welcome aboard. | |
| `member.already_subscribed` | You're already subscribed. | |
| `member.magic_link_sent_title` | Check your inbox | |
| `member.magic_link_sent_body` | We sent a sign-in link to {email}. | |
| `member.magic_link_resend` | Send it again | |
| `member.magic_link_resent` | Sent — check your inbox again. | JS |
| `member.read_so_far` | About {percent}% read | JS |
| `member.read_so_far_static` | You're partway through this post. | |
| `member.error_generic` | Something went wrong. Try again. | |
| `member.error_email_required` | Enter your email address. | |
| `member.error_email_invalid` | That email doesn't look right. | |
| `member.error_no_account` | We couldn't find an account for that email. | |
| `member.signed_in_as` | Signed in as {email} | |
| `member.account` | Account | |
| `member.sign_out` | Sign out | |
| `member.manage_billing` | Manage billing | |
| `member.upgrade` | Upgrade | prop |

### 3.5 `error.*` — 12 keys

`error.hbs` serves every status code (FR-I1 emits no `error-404.hbs`), so a design branches on `{{statusCode}}` and needs **both** copy sets in one template — that is why 404 and 500 keys coexist here.

`{{statusCode}}` and `{{message}}` are Ghost's error context, rendered raw (M21). `{{message}}` is Ghost's English string and is **not** catalog-controlled (S8); a design that wants translated body copy uses `error.404_body` / `error.500_body` instead of `{{message}}`.

| Key | English default | |
|---|---|---|
| `error.404_title` | Page not found | prop |
| `error.404_body` | The page you were looking for isn't here. | prop |
| `error.404_search_prompt` | Try a search instead | prop |
| `error.404_popular_heading` | Popular posts | prop |
| `error.500_title` | Something went wrong | prop |
| `error.500_body` | We're having trouble loading this page. Try again in a moment. | prop |
| `error.generic_title` | Something went wrong | prop |
| `error.generic_body` | That didn't work. Try again, or head back home. | prop |
| `error.code_label` | Error {code} | |
| `error.home_link` | Back to home | |
| `error.all_posts_link` | Browse all posts | |
| `error.page_label` | Error page | a11y |

### 3.6 `private.*` — 6 keys

`private.hbs` (A31 #10 Private Site Gate). Ghost supplies `{{error.message}}` = "Incorrect access code." after a failed submit — English, Ghost's namespace. **Prefer `private.error`**, so the page is translatable; a design that renders `{{error.message}}` ships an untranslatable string on a page that has no other English on it.

| Key | English default | |
|---|---|---|
| `private.heading` | This site is private | prop |
| `private.body` | Enter the password to continue. | prop |
| `private.password_placeholder` | Password | |
| `private.password_label` | Site password | a11y |
| `private.submit` | Continue | |
| `private.error` | That password didn't work. | |

### 3.7 `search.*` — 15 keys, **nine of them retired 2026-08-27**

**⚠ Ruling R-24 deleted A23 and made search Ghost's own.** Under **S1 a key is never deleted**, so the
nine overlay keys below are **retired, not removed**: a theme already deployed references them and a
user's override is stored against them. **A retired key is still emitted in every locale file (S4) and
is never reused for a different meaning.** What changes is that **no design renders it any more.**

**What a theme still owns of search: the trigger, and nothing else.** `sodo-search` renders **inside an
iframe** with its own injected stylesheet, so theme CSS reaches nothing within it and only Ghost's accent
colour crosses (`MEASUREMENTS.md` §29c). Its own strings are **Ghost's**, and **S8 keeps Ghost's strings
out of this catalog** — which is exactly why the overlay keys must go quiet rather than be re-pointed at
sodo. The live namespace is therefore **the trigger's label and its accessible name**, wherever the
Search affordance is placed: A1's header control (Off · Icon · Button · Bar), or any button or link whose
Link Picker destination is "Ghost search" (FR-F6).

**⌘K is Ghost's.** `sodo-search` binds it, **no Inflozo design may bind it**, and the `command-palette`
module is deleted — so the two key-hint strings are retired with the overlay's.

| Key | English default | | Status |
|---|---|---|---|
| `search.placeholder` | Search | | **live** — a Bar-form trigger's placeholder |
| `search.placeholder_long` | Search this site | | **live** |
| `search.trigger_label` | Search | a11y | **live** — the accessible name on every form of the affordance |
| `search.trigger_close` | Close search | a11y | **live** |
| `search.key_hint_mac` | ⌘K | JS | **retired** — ⌘K is `sodo-search`'s, and no Inflozo design may bind it |
| `search.key_hint_win` | Ctrl K | JS | **retired** — as above |
| `search.overlay_placeholder` | Search posts | JS | **retired** — the overlay is Ghost's (S8) |
| `search.overlay_label` | Site search | JS, a11y | **retired** |
| `search.overlay_empty` | Start typing to search | JS | **retired** |
| `search.overlay_no_results` | No results for "{query}" | JS | **retired** |
| `search.overlay_no_results_hint` | Try a different word. | JS | **retired** |
| `search.overlay_results_count` | {count} results | JS | **retired** |
| `search.overlay_loading` | Searching… | JS | **retired** |
| `search.overlay_error` | Search isn't available right now. | JS | **retired** |
| `search.overlay_tags_heading` | Popular tags | JS | **retired** |

### 3.8 `gallery.*` — 8 keys

A11 galleries and the lightbox (`lightbox toggle` control). The lightbox is entirely JS-rendered, so almost everything here is **JS**.

| Key | English default | |
|---|---|---|
| `gallery.open_image` | View image | a11y |
| `gallery.counter` | {current} of {total} | JS |
| `gallery.image_label` | Image {current} of {total} | JS, a11y |
| `gallery.next` | Next image | JS, a11y |
| `gallery.previous` | Previous image | JS, a11y |
| `gallery.close` | Close | JS, a11y |
| `gallery.loading` | Loading image… | JS |
| `gallery.caption_label` | Caption | a11y |

### 3.9 `comments.*` — 10 keys

A28 wrappers around Ghost's native `{{comments}}`. Ghost's comments UI is an injected members script — **everything the script renders is Ghost's** (S8). The catalog covers only the wrapper chrome Inflozo emits around it.

Ghost's `{{comment_count}}` takes `empty` / `singular` / `plural` hash params, so those three strings are theme-supplied and must come from the catalog as sub-expressions: `{{comment_count empty=(t "comments.count_none") singular=(t "comments.count_one") plural=(t "comments.count_many")}}`. The same `(t "...")` sub-expression form applies to `{{plural}}` anywhere it appears.

`comments.count_one` / `count_many` use `%` rather than `{count}` because Ghost's `{{plural}}`/`{{comment_count}}` helpers substitute `%` themselves — this is the one place the S3 placeholder syntax does not apply, and it is dictated by Ghost.

`comments.placeholder` is **canvas-only**: it is the FR-H5 shim's stand-in for `{{comments}}`, which cannot run in the canvas iframe. It is keyed here so the string has one home, but it is never written into a locale file and never reaches a visitor.

| Key | English default | |
|---|---|---|
| `comments.heading` | Comments | prop |
| `comments.count_none` | No comments yet | |
| `comments.count_one` | % comment | |
| `comments.count_many` | % comments | |
| `comments.show` | Show comments | |
| `comments.show_count` | Show comments ({count}) | JS |
| `comments.hide` | Hide comments | JS |
| `comments.members_only` | Comments are for members. | |
| `comments.signin_prompt` | Sign in to join the conversation | |
| `comments.placeholder` | Comments appear here on your live site. | canvas |

### 3.10 `archive.*` — 17 keys

A29 archive headers (`tag.hbs` / `author.hbs`), **the main feed's empty state** (FR-H4 — `archive.empty_heading` / `archive.empty_body` moved here from the retired A31 #8, which was that state trying to be a design), and A29 #13's progressive filter/sort strip — whose six control labels are **server-rendered on real links** (they work with JS off) while its three status strings are written by the `filter-strip` module and marked JS accordingly (FR-G7).

`posts_one` / `posts_many` use `%` for the same Ghost-helper reason as §3.9.

| Key | English default | |
|---|---|---|
| `archive.posts_none` | No posts yet | |
| `archive.posts_one` | % post | |
| `archive.posts_many` | % posts | |
| `archive.written_by` | Written by {author} | |
| `archive.tagged` | Tagged {tag} | |
| `archive.empty_heading` | Nothing here yet | prop |
| `archive.empty_body` | There are no posts in this collection yet. | prop |
| `archive.home` | Home | |
| `archive.filter_by_tag` | Filter by tag | |
| `archive.filter_by_author` | Filter by author | |
| `archive.filter_all` | All | |
| `archive.sort_newest` | Newest first | |
| `archive.sort_oldest` | Oldest first | |
| `archive.sort_title` | A–Z | |
| `archive.filter_loading` | Loading… | JS |
| `archive.filter_error` | Couldn't apply that filter. | JS |
| `archive.filter_none` | Nothing matches that filter. | JS |

### 3.11 `nav.*` — 4 keys

Header, announcement bar and footer chrome (A1–A3). The nav *items* are `@site.navigation` data and the header CTA is a text prop — neither is chrome.

| Key | English default | |
|---|---|---|
| `nav.menu` | Menu | |
| `nav.close` | Close | |
| `nav.more` | More | |
| `nav.announcement_dismiss` | Dismiss | JS, a11y |

### 3.12 `a11y.*` — 7 keys

Screen-reader-only strings with no visible counterpart. Load-bearing for NFR-5 (axe-core, WCAG 2.1 AA on every design in the library) — an untranslated skip link fails the same rule in every language.

| Key | English default | |
|---|---|---|
| `a11y.skip_to_content` | Skip to content | |
| `a11y.skip_to_nav` | Skip to navigation | |
| `a11y.main_navigation` | Main navigation | |
| `a11y.footer_navigation` | Footer navigation | |
| `a11y.open_menu` | Open menu | |
| `a11y.close_menu` | Close menu | |
| `a11y.reading_progress` | Reading progress | JS, a11y |

### 3.13 `credit.*` — 3 keys · **LOCKED (S7)**

Present in the catalog, absent from the Translations surface, not overridable on any plan, never translated. Emitted verbatim into every locale file.

`credit.product_name` exists so a footer design can split the phrase around a link without a design inventing a literal; it is locked for the same reason as the rest.

| Key | English default | |
|---|---|---|
| `credit.built_with` | Built with Inflozo | locked |
| `credit.product_name` | Inflozo | locked |
| `credit.readme` | Built with Inflozo — https://inflozo.com | locked |

---

## 4. Totals

| Namespace | Keys | of which JS | of which locked |
|---|--:|--:|--:|
| `pagination.*` | 18 | 6 | — |
| `card.*` | 9 | 1 | — |
| `post.*` | 12 | 2 | — |
| `countdown.*` | 6 | 6 | — |
| `member.*` | 24 | 3 | — |
| `error.*` | 12 | — | — |
| `private.*` | 6 | — | — |
| `search.*` | 15 | 11 | — |
| `gallery.*` | 8 | 6 | — |
| `comments.*` | 10 | 2 | — |
| `archive.*` | 17 | 3 | — |
| `nav.*` | 4 | 1 | — |
| `a11y.*` | 7 | 1 | — |
| `credit.*` | 3 | — | 3 |
| **Total** | **151** | **42** | **3** |

Listed in the Translations surface: **148** (total minus the 3 locked). `comments.placeholder` is listed but marked canvas-only.

**The JS-marked set is derived from FR-G7's behaviour-module registry, not from a fixed number.** It was previously written against the ten modules `prd.md` FR-J4 used to name, which left four modules with visitor-facing text and nowhere to put it — `countdown`'s unit labels, `toc`'s heading (built client-side from `{{content}}`, so it cannot come through `{{t}}`), `video-facade`'s poster label and `shuffle`'s refresh control. V6 asserts that no bundled module contains a visitor-facing literal, so those gaps were not cosmetic: each was a module that could not satisfy V6. **The rule, not the count, is normative:** every module that writes visitor-facing text at runtime has its strings here and marked JS, and re-deriving is part of adding a module.

---

**The canvas-state markers stay out of this catalog.** "Auto-generated", "Page 2" and "Gated content — shown with sample text" are **app** strings — they render in the Inflozo editor and never in a generated theme — so they live in `prd.md` Appendix H, not here (FR-D6, FR-D16, FR-D21). The `post.*` namespace is unchanged by the Post Content section's promotion (Appendix A §25): its table-of-contents heading is already `post.table_of_contents`, and drop caps, measure and type scale emit no text at all.

## 5. Out of catalog — Ghost's namespace, not Inflozo's

Not overridable from the Translations surface. A design must not attempt to supply these, and the Translations surface must not imply it controls them, or the user overrides a string and sees no change on the live site.

| Surface | Owner | Note |
|---|---|---|
| Ghost's native search overlay (sodo-search) — placeholder, "No results", section headings, keyboard hints inside the overlay | Ghost | Theme-rendered **trigger** text is in-catalog (§3.7); everything inside the overlay is not |
| Portal — signup/signin/account modal, plan names, billing copy | Ghost | Reached by `data-portal` links; Ghost renders every string |
| Ghost's comments UI (reply, edit, delete, sort, moderation, timestamps) | Ghost | Only the A28 wrapper chrome is Inflozo's (§3.9) |
| `{{message}}` on `error.hbs` | Ghost | Ghost's error text. Use `error.*` body copy for translatable copy (§3.5) |
| `{{error.message}}` on `private.hbs` | Ghost | "Incorrect access code." Prefer `private.error` (§3.6) |
| Ghost's default `content-cta` upgrade prompt | Ghost | Overridden wholesale by `partials/content-cta.hbs` — an A32 paywall design replaces the markup, so its strings become `member.*` catalog strings |
| Date output from `{{date}}` | Ghost | Follows the site's publication language; no catalog key exists or should |
| User-edited text props (S6) | The user | Compiled as literals; the Translations surface never lists them |

---

## 6. Migration map

Emitted whenever S2 forces a new key. Ships with the library drop, is applied by the compiler on the next compile of any project holding an override on a superseded key, and is what FR-J14's confirm step reads to tell the user what changed.

```json
{
  "version": "2026-09-01",
  "migrations": [
    {
      "from": "pagination.end_of_feed",
      "to": "pagination.feed_complete",
      "reason": "meaning change: now also covers a filtered collection",
      "carry_override": true
    }
  ]
}
```

- `carry_override: true` copies the user's override to the new key verbatim and leaves the old override in place (S1: the old key is never deleted, and an older deployed theme may still reference it).
- `carry_override: false` is for a meaning change where carrying the old text forward would be **wrong**. The old override is retained but not copied; the new key falls back to its English default, and the confirm step names the key so the user can re-translate it.
- A drop that only revises English defaults (S2, meaning unchanged) emits **no** migration entry — overrides are already keyed correctly and are untouched.

---

**A carried-forward override is re-validated after migration** (V9, V10). A key that gains or loses a placeholder between catalog versions carries an override written against the old signature, and migrating it without re-checking is how a valid override becomes a malformed one — the one path by which a user who changed nothing gets a broken string.

## 7. Compile validation

FR-Q6 says "compile validation enforces this". These are the assertions, so the rule is writeable as an acceptance criterion.

| # | Assertion | Fails when |
|---|---|---|
| V1 | Every visitor-facing string literal in emitted `.hbs` is inside a `{{t}}` call or a `(t "…")` sub-expression | A design hard-codes a label |
| V2 | Every `{{t}}` key used in emitted `.hbs` exists in this catalog | A design invents a key, or misspells one |
| V3 | **Every** emitted locale file's key set equals the catalog's key set, minus `canvas`-marked keys — checked per file, and `en.json` must be one of them | A key was added to the catalog but not emitted, or a non-English project shipped without its `en.json` fallback (S4, FR-Q6) |
| V4 | Every `{{t}}` call supplies exactly the placeholder set its key declares | A missing hash param would render `{count}` literally to a visitor (S3) |
| V5 | Every **JS**-marked key referenced by a bundled module is present as a `data-i18n-*` attribute on that module's mount element, with placeholders intact | The German site shows English "Loading…" (S5) |
| V6 | No bundled JS module contains a visitor-facing string literal | Same failure, from the other direction |
| V7 | No `credit.*` key carries an override in the compiled locale file | An override leaked into a locked key (S7) |
| V8 | No emitted string literal or `{{t}}` key targets an out-of-catalog surface in §5 | A design tries to translate Portal or the native search overlay |
| V9 | **Every user override compiles under `intl-messageformat`** — checked at entry in the Translations surface and again here as a backstop (FR-Q8). **Refuses; never repairs — see S0, where both escape routes are executed and both fail.** The message names the offending character in the user's own string and says braces mark a placeholder | An unbalanced brace in one override. Ghost parses every string through an ICU `MessageFormat` constructor that throws **outside** its own error handling, so the throw escapes into `res.render` and returns a **whole-page 500 across the entire site** — not a fallback string, not a missing label |
| V10 | **Every override's placeholder set matches its catalog entry's declared set** | V4 checks the `{{t}}` *call* side; the *override* side was uncovered. An override that drops `{count}` renders a label missing its number; one that invents `{total}` renders the token literally |

V1's "visitor-facing" excludes user text props (S6), which the compiler emits as literals by design and marks as such in the emission record so the validator can tell them apart from a hard-coded label. Without that mark V1 cannot distinguish the two and the rule is unenforceable — **the emission record must carry the distinction**.
