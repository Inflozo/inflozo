---
title: 'Story 5.21 — The two Ghost-surface shims on the canvas'
type: 'feature'
created: '2026-09-26'
status: 'ready-for-dev'
owner_test: pending
review_loop_iteration: 0
baseline_commit: 'f73c33d9aad31caaa264daf609810c9b3398cda1'
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md']
---

## In plain English

When your project is linked to a Ghost site, the editor now shows the two things Ghost adds to every page by itself:
its announcement bar, as a strip across the very top of the page above your header, and Ghost's floating **Subscribe**
button in the bottom-right corner. Both come from your site's own settings — the bar's real words in its real colour,
only for the visitors it is set to reach (switch **View as** to check), and the button only where you have switched it
on in Ghost, never on a phone — and neither can be clicked, selected, moved or saved into your design. Change either in
Ghost admin and reopen the editor, and the canvas follows, so you design your header knowing exactly what will sit above
it and beside it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On a real site, Ghost's `{{ghost_head}}` adds its own announcement bar above everything the theme renders,
and Portal's floating subscribe button in the bottom corner. Neither is on the canvas, so a header, an Inflozo
announcement bar or a corner design is authored against a page that is missing its top strip and its corner button, and
the stacking is discovered after deploy. The connection's snapshot already stores the bar and the button's on/off
(Stories 3.3 and 3.7), and nothing draws either.

**Approach:** The editor draws both inside the canvas document, where Ghost puts them. The strip is the body's first child,
in normal flow, so it pushes the design down; the button is `position: fixed` at the end of the body. Each uses Ghost's
own markup, stylesheet and rules, as read in its source and recorded on both test servers first, and each follows View
as. Both are inert: nothing selects them, they are not in the doc, and nothing compiles them. They are drawn from the
connection's snapshot, and the editor re-reads Ghost's settings once as it opens, so a change made in Ghost admin shows
up at the next open.

## Boundaries & Constraints

**Always:**

- **The frame (R-74).** The canvas is `S4 Editor.dc.html` **S4a**: the ground, the page card, and zero chrome at rest.
  - The export draws neither shim. Swept at this Create: no frame draws Ghost's bar or Portal's button, and S4a opens
    straight onto the site header.
  - Each shim is therefore drawn to **Ghost's own look**: its markup, its stylesheet and its rules, recorded in
    MEASUREMENTS §55. FR-H5 calls them "Inflozo-drawn approximations of Ghost's own markup". They stand in for Ghost's
    page, not for Inflozo's interface, so no Inflozo vocabulary applies to them.
- **One source: the connection's snapshot**, handed to the editor as `EditorData.site.surfaces`.
  - `read.ts` derives it from `sites.site_settings`, re-validated on the way out (`storedMembers`' shape).
  - It is handed for every linked site that is **not disconnected**. An unlinked project gets none, and so does a
    disconnected site.
  - The snapshot holds:
    - `announcement {content, background, visibility}` — verbatim since 3.3;
    - `portal_button` and `portal_button_source` (3.3);
    - `brand.accent` (3.4);
    - `members.signup_access` (5.20);
    - two keys this story adds from the same Admin payload: **`portal_button_style`** and **`portal_button_signup_text`**.
  - No Content API read and no read of `/members/api/announcement/` feeds a shim.
- **Where they draw.**
  - They draw on **every page canvas**, in design and in Preview, on page 1 and page 2.
  - They draw **whatever the content pill says**: they are the connection's settings, not its content.
  - They **never** draw on a template surface (the Paywall).
- **The strip — Ghost's announcement bar.**
  - **When it shows.** All three must hold:
    - the content has words;
    - the visibility list is not empty;
    - the View as visitor is in the list.
    This is §46(c)'s rule: Logged out user ↔ `visitors`, Free member ↔ `free_members`, Paid member ↔ `paid_members`, where
    paid means any status but free.
  - **Where it goes.** It is the canvas body's **first child, before `#canvas`**, never inside it. That is where Ghost
    prepends `#announcement-bar-root`, so the strip takes real vertical space and pushes the design down.
  - **Its markup** is Ghost's own:
    `div.gh-announcement-bar.<accent|dark|light> > div.gh-announcement-bar-content + button[aria-label="close"] > svg`.
    A background outside those three is Ghost's default, `dark`.
  - **Its stylesheet** is Ghost's, recorded verbatim. It is appended to the canvas document's head once, as Ghost's
    script appends it at run time. `--ghost-accent-color` is set on the strip itself, from the snapshot's accent (Ghost's
    default `#FF1A75` when there is none) — **never on `:root`**, so the design renders exactly as before.
  - **Its words.** The stored HTML is parsed inertly (`DOMParser`, the runtime's `readMarks`). It is written only as text
    plus bold, italic and link, through text nodes or `serializeMarks`. **The stored HTML never reaches `innerHTML`**
    (NFR-3; Ghost's own bar injects it raw).
- **The button — Portal's floating trigger.**
  - **When it shows.** All three must hold:
    - `portal_button` is true;
    - `members.signup_access` is not `none` (a site with no members record is not checked);
    - the canvas is at least **640px** wide. This is a media query, so a device change needs no repaint. Portal draws no
      button below 640px.
  - **Its look for a Logged out user** follows `portal_button_style`: icon and text, icon only, or text only. The label is
    `portal_button_signup_text`, and an empty label draws none, as Portal does.
  - **Its look for a Free or Paid member** is Portal's member look: a 60px circle with no label, the halo ring and the
    person icon. A preview member has no avatar.
  - **The icon** is always Ghost's default person icon (`user.svg`) — DW-278.
  - **Its box** is Portal's: `position: fixed; bottom: 0; right: 0`, 98px tall, `z-index: 3999998`. It sits inside a shadow
    root whose host carries `all: initial`, as Portal's iframe keeps the theme out, and it is appended as the canvas
    body's **last child**, outside `#canvas`. Its accent comes from the snapshot.
- **Inert, by construction.**
  - Both roots carry `inert` and `pointer-events: none; user-select: none`. A press, a hover or a touch passes to what
    lies beneath:
    - under the strip that is the ground, where R-123 deselects;
    - under the button it is the section there.
  - Neither is ever focusable, pressable or selected. Neither is in Layers, the doc, the journal, Shuffle, Remix or
    anything compiled.
- **Marked for NFR-6(c3).** The two roots carry `data-ghost-surface="announcement-bar"` and
  `data-ghost-surface="portal-button"`.
  - They carry **no `data-inflozo-*`** attribute: step 3 and the journey's `marked()` count those.
  - They carry **no `data-module`**: `core` would mount it.
- **Painted by the editor alone.**
  - `paint()` draws, updates or removes both after it writes `#canvas`. A re-read that lands redraws only the shims.
  - Dark mode and a device change need no redraw.
  - `/pilots`, the Picker's cards, the ring's tiles, the snapshots and the render matrix never draw a shim, and each of
    those renders stays byte-identical. **That is the control.**
- **The editor re-reads Ghost's settings once when it opens.**
  - It is the same single Admin `settings/` read, through the chokepoint (AD-10), as 5.20's Re-check; the Paywall's
    re-check on entry stays.
  - It writes every key the settings payload decides — the members record, the Portal keys and the announcement —
    through **one mapping shared with `probePatch`**, so connect, the daily check and the re-read can never disagree.
  - A declared Portal answer is never overwritten by an assumption.
  - It is a look, never an edit: no journal entry and no `⌘Z`. It stays live while reading along (R-192), and it is
    silent unless C3b's card is up. A refusal leaves the stored snapshot drawn.
- **A sticky root is pinned only while it is stuck** (`pinned()`). With the strip above it, a sticky header scrolls with
  the page until the strip has gone. So its outline, tag and badge ride the page layer until then and the view layer
  after, switching as the canvas scrolls.
- **No new words (R-170), control or route (R-98).** The shims print Ghost's words: the site's announcement and its
  signup label.

**Ask First:**

- If the recorder finds that Ghost's bar is **not** the body's first child, that a one-line bar at 1440 is not 48px tall,
  or that Portal draws its button below 640px — stop and say so. The placement rule rests on each of these.
- If the recorder finds the announcement script still injected with the visibility list emptied — stop. The "cleared"
  rule rests on Ghost's `isFilled`.
- Anything that needs a migration — stop (R-99). None is expected: `site_settings` is `jsonb`.

**Never:**

- **No Admin write by the product** (P8, AD-10). The one-click "turn Ghost's own bar off" is DW-66's and waits behind
  Epic 7, and `announcement_clear` stays uncalled. The recorder and the live walk switch Ghost's settings with the
  harness's staff token and restore them; the product never does.
- **No live binding.** No read of the members-API announcement endpoint (sections-inventory A2's own reason), and no
  Content API read for either shim.
- **No warning** when a corner design meets the button. Sections-inventory A2: "No warning is needed once the thing being
  warned about is on screen." Settling the collision is DW-276's.
- **None of Portal's behaviour**: no popup, no dismiss, no hover state, and no chosen icon (DW-278).
- **No shim** on a template surface, in the Picker, in the ring, on `/pilots`, in the render matrix or in a snapshot.
- **Never edit** the export (R-74) or the pilots (AD-35).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| A connected site with a bar and the button | Home, Logged out user, Desktop; content `<p>Fixture announcement — seeded for VERIFY 21.</p>`, `accent`, `["visitors"]`; button on, `icon-and-text`, "Subscribe" | strip = the body's first child, the words in white on the site's accent, the ✕; `#canvas` starts at the strip's bottom; the button bottom-right, person icon + "Subscribe" | N/A |
| View as Free member | same | no strip (not in the list); the button is the member circle | N/A |
| View as Paid member, list `["paid_members"]` | a comped or gift member previews as Paid | strip shown | N/A |
| Nothing to show | the list `[]`, or content empty or without words | no strip | N/A |
| Mobile (390) / Tablet (834) | button on | the strip wraps as Ghost's does; no button at 390, the button at 834 | N/A |
| The button off, or members off | `portal_button` false, or `signup_access: none` | no button | N/A |
| Icon only / text only | `portal_button_style` | a 60px circle / the label alone | N/A |
| Empty label | `portal_button_signup_text: ""`, icon and text | the icon alone, no label | N/A |
| A hostile announcement | `<script>`, `onerror`, `<img>`, `style`, a `javascript:` link | the words, bold, italic and safe links only; nothing runs and nothing loads | the parse is inert |
| An unknown background | `"neon"` | Ghost's default, `dark` | N/A |
| Sample content on the pill | a linked, connected site | both still drawn (the connection's, not the content's) | N/A |
| No connection | unlinked project, or a disconnected site | neither | N/A |
| The Paywall surface | Template ▾ → Paywall | neither | N/A |
| Page 2, dark mode, Preview | any | both drawn, unchanged; in Preview a press passes through | N/A |
| A press or hover on the strip | any | nothing hovers; a press deselects (R-123) | N/A |
| A press on the button | a section beneath | that section is hovered and selected | N/A |
| A selected sticky header, scrolled past the strip | a1/1 | the outline, the tag and the badge stay on the header throughout | N/A |
| The editor opens | a connected site with its Admin key | one Admin `settings/` read; the snapshot and both shims follow Ghost | refused: the stored snapshot stays drawn, nothing said |
| The bar cleared in Ghost admin | content emptied or no box ticked, then the editor reopened | no strip | N/A |
| The button's setting unreadable | `portal_button_source: 'default'` or `'declared'` | the button drawn per the stored value; the re-read never puts an assumption over a declared answer | N/A |

</frozen-after-approval>

## Code Map

**Read in Ghost's source** — npm tarballs at 2026-09-26: ghost 5.130.6 and 6.58.0; `@tryghost/announcement-bar` 1.1.556, the
newest in both majors' `~1.1` pin; `@tryghost/portal` 2.51.5 (`~2.51`, Ghost 5) and 2.69.339 (`~2.69`, Ghost 6), the pins
at g5 `core/shared/config/defaults.json:211-223` and g6 `:309-321`. **These are hypotheses until the first task records
them** (standing rule 1).

- **`{{ghost_head}}`** (`core/frontend/helpers/ghost_head.js`):
  - **The announcement script** (g5 :106-140, g6 :175-209) is injected only when `announcement_content &&
    announcement_visibility.length` (`isFilled`), or on an admin preview.
    - Its tag: `<script defer src=".../announcement-bar@~1.1/umd/announcement-bar.min.js"
      data-announcement-bar="{site}" data-api-url="{site}members/api/announcement/">`.
    - There is no labs gate in the helper. g5 gates the endpoint behind a GA labs flag.
  - **The Portal script** (g5 :51-84, g6 :121-153) is injected when members, donations or recommendations are on.
  - Both majors also emit `<style>:root {--ghost-accent-color: …}</style>` (g5 :343-353, g6 :466-476).
- **The bar's audience** (`announcement-bar-settings.js` :28-50 on both majors; MEASUREMENTS §46(c)):
  - an empty list shows nothing;
  - `visitors` means no member;
  - `free_members` means status free;
  - `paid_members` means any status but free (comped, and on 6 gift).
  - The endpoint returns `{}` otherwise and never exposes the list.
- **The bar in the page** (1.1.556 bundle; readable in 1.1.7 `src/`):
  - **Mount.** If there is no `#announcement-bar-root`, it creates one and `document.body.prepend`s it. A theme that
    already has that id gets the bar there instead — no Inflozo design declares one.
  - **Style and structure.** It appends one global `<style>` to `<head>`. There is no shadow root and no iframe.
  - **Markup.** `div.gh-announcement-bar.{bg} > div.gh-announcement-bar-content` holds the stored HTML, injected through
    `dangerouslySetInnerHTML` with no sanitising. Beside it sits `button[aria-label="close"] > svg`.
  - **Dismiss** is kept in sessionStorage.
- **The bar's CSS**, verbatim values:
  - **The bar:** `position: relative; z-index: 90; display: flex; align-items: center; justify-content: center; padding:
    12px 48px; min-height: 48px; font-size: 15px; line-height: 23px; text-align: center`, with `box-sizing: border-box`
    on everything.
  - **The three backgrounds:**
    - `dark` is `#15171a` with `#fff` text;
    - `light` is `#f0f0f0` with `#15171a` text;
    - `accent` is `var(--ghost-accent-color)` with `#fff` text.
  - **Fonts:** no font-family and no font-weight, so the bar inherits the theme's body font.
  - **Descendants** are reset with `.gh-announcement-bar :not(path){all:unset}`, then:
    - `strong` 700;
    - `i` and `em` italic;
    - `a` is `#fff`, 700 and underlined (`.light a` takes the accent).
  - **The close button:** absolute, 32×32, `right: 8px`, vertically centred, a 10px svg; `.light` uses `#888`.
  - There are no media queries.
- **Portal's button** (2.69.339 `src/components/trigger-button.jsx` and `.styles.js`; 2.51.5 `TriggerButton.js` has the same
  logic, styles and icons):
  - **When it draws nothing:**
    - below 640px (`isMobile: window.innerWidth < 640`, :225, :251, :282);
    - when `!portal_button`;
    - when `members_signup_access === 'none'` (`utils/helpers.js:277-279`).
  - **The frame:** an iframe in `#ghost-portal-root`, appended at the end of `<body>` (`index.jsx:8-13`). Its attributes are
    `title="portal-trigger" class="gh-portal-triggerbtn-iframe" data-testid="portal-trigger-frame"`, with the inline style
    `z-index: 3999998; position: fixed; bottom: 0; right: 0; height: 98px; max-width: 500px`. Its width is 105px without
    a label, otherwise the measured width + 2 (`frame.jsx:27-41`, :296-299).
  - **The look:**
    - the wrapper has `padding: 10px 28px 0 17px`;
    - the button is 60px tall, `min-width: 60px`, `border-radius: 999px`, the accent background, `box-shadow: rgba(0,0,0,.24)
      0 8px 16px -2px`;
    - `icon-and-text` has `padding: 0 12px 0 16px`, with the label 16px/400 in the system stack, `#fff`, 8px padding,
      `nowrap`, 380px max with an ellipsis.
  - **The icon:** null draws `user.svg` — 26px beside a label, 34px alone. `icon-1`…`icon-5` are 24px SVGs; anything else is
    a 26px `<img>`.
  - **A signed-in member** always sees a 60px circle with no label, a 4px `rgba(255,255,255,.15)` halo, and the avatar or
    the user icon (:54-60, :188).
  - **Nothing moves it to the left.**
- **The defaults** (`core/server/data/schema/default-settings/default-settings.json`):
  - `portal_button` **`"false"`** (g5 :338, g6 :409), and nothing in `core/server` sets it on;
  - `portal_button_style` `icon-and-text`;
  - `portal_button_icon` null;
  - `portal_button_signup_text` "Subscribe";
  - `announcement_visibility` `"[]"`;
  - `announcement_background` `dark`.
  - The four `portal_button*` keys are public, and reach the Content API and `@site` (`settings-cache/public.js` g5 :37-45,
    g6 :44-52). No `announcement_*` key is public.
- **Ghost Admin** (the shipped settings bundles):
  - **The announcement:** `#/settings/announcement-bar/edit`. Sidebar Site → **Announcement bar** → Customize opens the
    modal "Announcement", which holds:
    - the field "Announcement";
    - **Background color** Dark · Light · Accent;
    - **Visibility** "Public visitors" · "Free members" · "Paid members" — the last only when paid members are on.
    - There is no on/off switch: the owner empties the text or unticks every box.
  - **Portal:** `#/settings/portal/edit`. Sidebar Membership → "Portal settings" (5) or "Signup portal" (6) → Customize →
    tab **Look & feel**, which holds:
    - **Show portal button**;
    - **Button style** Icon and text · Icon only · Text only;
    - **Icon**;
    - **Signup button text**.

**Executed read-only at this Create (2026-09-26; keys by name: `GHOST5_URL`, `GHOST5_CONTENT_API_KEY`, `GHOST5_ADMIN_API_KEY`,
and the same three `GHOST6_`).** Every call answered 200 on both servers.

- **The Admin `settings/` on T1 and T3:**
  - `announcement_content` `"<p>Fixture announcement — seeded for VERIFY 21.</p>"`, `announcement_background` `accent` and
    `announcement_visibility` `"[\"visitors\"]"` (a JSON string). These are left from `run-verify-all.py` item 21, so
    **both boxes show a bar to logged-out visitors today**.
  - `portal_button` **false**, `portal_button_style` `icon-and-text`, `portal_button_signup_text` "Subscribe" and
    `portal_button_icon` null.
  - `members_signup_access` `all`, `donations_enabled` true.
  - `accent_color` `#3832e5` on T1 and `#0da51e` on T3.
- **The Content API `settings/`** carries the four `portal_button*` keys and no `announcement_*`.
- **The anonymous home page** carries both scripts in `<head>`: the Portal tag (`portal@~2.69` on T1, `~2.51` on T3) and
  the announcement tag above. No injected `<style>` mentions either surface.
- **`/members/api/announcement/`**, read anonymously, answers
  `{"announcement":[{"announcement":"<p>…</p>","announcement_background":"accent"}]}` with no visibility field.

**The frames and the documents.**

- **S4a** (`S4 Editor.dc.html:27`, the canvas :62-105) opens straight onto the header. Its coral "Subscribe" pill (:64-67) is
  the header's own call to action, not Portal. The rest of the sweep:
  - S4b to S4d, D8a and D8b draw no shim either.
  - B3a's dark top strip (`B Missing Surfaces.dc.html:656`) is an **Inflozo A2 Countdown**, not Ghost's bar.
  - The only mention of Portal's button in the export is `A30-0 Category Proof.dc.html:34` ("not drawn here").
- **EXPERIENCE.md** has no Information Architecture row for these surfaces (the Editor table, :139-178), which the Docs task
  adds.
- **The PRD:**
  - FR-H5 :331 (the contract), §7.3 :567, NFR-3 :481, NFR-6(c) :487;
  - FR-C2 :206 and FR-C5 :211 (the bar and the button re-read daily);
  - §7.5's `sites` row, :655, lists the Portal state and **not** the announcement;
  - §1.2 item 2, :64, claims the button is "on by default on essentially every site".
- **The spine:** AD-21 (:249-256) already puts "5.21's two inert Ghost shims" inside the canvas document, never serialized.
- **The register:** VERIFY-AT-BUILD item 21 (:49) and item 51 (:289; Portal and the bar float, so never depend on their
  markup in a theme). `reconcile-designs.md` NE-A2-7 (:294) asked for this very probe and it never ran — that file is a
  **record**, so §55 answers it instead.
- **Sections-inventory** A2 (:128-134) holds the stack story and the "no warning" rule.
- **Epics:**
  - 7.34 (:3666-3699) names both shims as exclusion regions;
  - 9.7 (A2 #11 Toast, "bottom right") and 10.78 (A22 #14 Slide-in Card) own the corner defaults (DW-276).

**The snapshot and the re-read.**

- `apps/web/lib/probe-rule.ts`:
  - `portalState` :65-73 and `announcementOf` :82-93;
  - `probePatch` :584-620 — the declared rule :596-604, `members` :611-612, and `plan_ask` :614-616, which is config's and
    stays out of the shared mapping;
  - `storedMembers` :555-558 is the re-validation shape;
  - `PORTAL_COPY` :505-509.
- `apps/web/server/site-probe.ts`:
  - `probeSite` :58-150 (connect, Re-check plan and the daily cron);
  - `readMembers` :183-231 — one `settings/` read that writes only `members` and never stamps `settings_read_at`. Its
    ownership read comes first (:185-196), and `server-wiring.test.ts:355-362` holds that order by source text.
- `(editor)/actions.ts` `recheckMembers` :150-161 (via RLS).
- `(editor)/read.ts`:
  - :183 already selects `site_settings`;
  - :327-330 attaches `members` to both `EditorSite` variants.
- `apps/web/lib/live-content.ts` `EditorSite` :510-515: `{title, origin, key, members?}` or `{title, unreadable, members?}`.
- DW-65 and DW-271: every writer reads, then writes the whole `site_settings`.

**The canvas.**

- **The document:** `lib/pilots.ts:119-136`.
  - The body is exactly `<body><div id="canvas"></div></body>`, and `pilots.test.ts:30` holds that literal.
  - `4-editor` stays last (`pilots.test.ts:115`).
  - It carries no script and is `immutable` per build (`canvas/route.ts:19-31`), so **no per-site byte may enter it**.
  - The policy is `style-src 'self' 'unsafe-inline'` and `img-src 'self' data: https:` (`csp.ts:72-91`).
- **`editor.tsx`:**
  - `latest` :812.
  - `paint()` :1862-2013 — its only DOM write is `mount.innerHTML` :1969. `paywall` is `isSurface(now.key)` :1928, and
    `wire(doc)` :1979.
  - The View as door `chooseVisitor` repaints (:1766-1772). Dark mode's `flip` only restamps (:1504-1512), and a device
    change repaints nothing (:1518-1524).
  - `pickAt` → `rootFrom` (`lib/selection.ts:17-23`) is null on the ground. The click is R-123's `choose(pickAt(…))` (:2430).
  - The canvas scroll listener :2349-2361 returns early unless something is hovered or edited.
  - `layerFor` :2827 → `pinned`.
  - `members` state and `recheck` :544-572. The re-check effect fires on `[surface]`, and `offCard` gates on the chosen
    source (:3353).
- **`lib/canvas-layer.ts`:**
  - the hosts :105-127 (`all: initial`, `z-index: 2147483647`, `pointer-events: none`, appended to the body);
  - `dropChromeLayers` removes `[data-inflozo-chrome]`;
  - `pinned` :133-140, whose ponytail note names this story's case: "a sticky root that has not yet reached its stuck
    position … trails it … until it sticks".
- **`lib/canvas-chrome.css`:** every selector must be keyed on `[data-inflozo-` (`pilots.test.ts:42-63`), so **no shim rule
  goes there**.
- **`lib/view-as.ts`** :27-47: `VISITORS` is anonymous, free and paid, and paid is `status !== 'free'`.
- **Safe words.** `packages/section-runtime/src/marks.ts`:
  - `readMarks(root, allowed, lines)` :605 (UNSEEN :596) keeps `strong`/`b`, `em`/`i`, `u`, and an `a` whose href is http,
    https, mailto or tel;
  - `serializeMarks` :224, and `allowedMarks` :156 needs a richtext `PropDef`.
  - The inert parse is `lib/inline.ts:222-224`. Both helpers are exported (`index.ts:26-27, 58`) and `editor.tsx` already
    imports `serializeMarks`.

**The harness and the walks.**

- `app/(app)/app/harness/editor/layout.tsx`: `MEMBERS_OFF_SITE` :89-96 is chosen by `x-inflozo-harness-site` (:111). Its
  origin, `https://127.0.0.1:9`, answers nothing, so the chosen source stays `'site'` while the paint is the sample.
- `tools/keyboard/journey.spec.mjs`:
  - keyboard only — `.click(`, `.hover(` and `.mouse.` fail the run at :150-159;
  - `pointAt` synthesises `pointerover` (:1319-1323), and hit-testing is proven with `elementFromPoint` inside
    `page.evaluate`;
  - 5.20's walks, with their header pattern, are :2302-2540.
- `tools/probe/run-verify-editor.cjs`:
  - step 3 counts `data-inflozo-*` (:506-520);
  - step 4 compares `#canvas > *` `outerHTML` with `/pilots` (:522-566);
  - step 5 is the CSP session (:570-576);
  - the highest step is 95 (:5642), and its seeded project links no site.
- `tools/probe/run-verify-live-content.cjs`:
  - plants and restores `site_settings` over REST (:862-903);
  - stores an Admin key through Manage keys (5.20's T3 flow);
  - `GHOST6_ADMIN_API_KEY` and `GHOST6_STAFF_ACCESS_TOKEN` exist in `tools/probe/.env`.
- **The recorders are Python and serve no browser** (`record-shim.py`). The first Node recorder takes `@playwright/test`'s
  chromium, as the walks do. A new file under `tools/` needs its row in `tools/doc-audit.py`'s catalogue (:311, :325 are
  the pattern).

## Tasks & Acceptance

**Execution:**

- [ ] **FIRST, before any code** — `tools/probe/record-ghost-surfaces.cjs` (new, with its `tools/doc-audit.py` catalogue
  row). It writes `packages/ghost-shim/fixtures/ghost{5,6}/surfaces.json`, which is written up as MEASUREMENTS **§55**. On
  T1 **and** T3, anonymous, in chromium, at 1440 × 900, 834 × 1112 and 390 × 844:
  - **With the fixture bar as it stands:**
    - `#announcement-bar-root`'s index among the body's children;
    - the verbatim `<style>` the script appended;
    - the bar's box, its close button's box, and the computed background, colour, font size, line height and padding.
  - **Portal:** switch `portal_button` on with the staff token, then record each `portal_button_style`:
    - `#ghost-portal-root`'s place;
    - the trigger iframe's inline style and box;
    - the button's box and computed height, radius, background, shadow, label font and label box;
    - the control: no trigger at 390.
  - **The bar cleared:** set `announcement_visibility` to `[]` and reload. Record that the script is absent and no bar
    root exists.
  - **In `finally`,** restore both settings and read them back: `portal_button` false and `["visitors"]`.

  Its header documents what it writes, because `--help` is not read (memory: the recorders run on any flag).

  -- NE-A2-7 and item 21's second half, recorded; every number the shims use stands on this.
- [ ] `apps/web/lib/probe-rule.ts` (+ `probe-rule.test.ts`) — **one mapping** and one reader.
  - `settingsPatch(previous, settings)` returns every key the settings payload decides: `code_injection`, the Portal
    keys under the declared rule, `announcement`, `brand` and `members`. `probePatch` becomes that plus
    `plan_ask`/capability.
  - The Portal reader adds `portal_button_style` (Ghost's three, else `icon-and-text`) and `portal_button_signup_text`
    (a string, else "Subscribe").
  - `storedSurfaces(site_settings)` re-validates on the way out.
  - Never a `stripe_*` key.

  -- Connect, the daily check and the editor's re-read write the same keys the same way.
- [ ] `apps/web/server/site-probe.ts` + `(editor)/actions.ts` (+ `server-wiring.test.ts`) — widen and rename 5.20's pair:
  - `readMembers` → `readSettings` and `recheckMembers` → `recheckSite`.
  - Keep the one `settings/` read, the ownership read first, the unstamped `settings_read_at` and the refusal shape.
  - Write `settingsPatch`, and return `{ members, surfaces }` as stored.
  - The wiring test's order assertion follows the rename; its control is the old order failing it.

  -- One read serves C3b and the shims.
- [ ] `apps/web/lib/live-content.ts` (`EditorSite`) + `(editor)/read.ts` — `surfaces` beside `members`, from
  `storedSurfaces`, on every linked site that is not disconnected. -- Server truth at first paint.
- [ ] `apps/web/lib/ghost-surfaces.ts` (new, pure) + `apps/web/ghost-surfaces.test.ts` — the pure half. `node --test`
  reaches it, as it does `lib/view-as.ts`. It holds:
  - `announcementFor(surfaces, visitor)` and `portalFor(surfaces, members, visitor)`, each answering null or what to draw;
  - `shimsOn(key, site)`, which is false on a surface and without a connection;
  - the strip's and the button's markup, built from text and marks only. The stored paragraphs run on inline, as Ghost's
    `all: unset` leaves them, and no `<br>` appears between them;
  - `ANNOUNCEMENT_CSS` (recorded, verbatim) and the button's constants;
  - the `data-ghost-surface` values.

  The test covers:
  - §46(c)'s truth table;
  - every row of the I/O matrix that is a rule;
  - the hostile content row (an AD-36-shaped vector list: each attack inert, and plain words still printed);
  - both CSS sources equal to `surfaces.json` on each major.

  -- The rules are unit-tested; the DOM write stays a few lines.
- [ ] `(editor)/editor.tsx` — the draw and the re-read:
  - `paint()` syncs both shims after `mount.innerHTML`: the strip prepended to the body, the button's host appended, the
    announcement stylesheet appended once per document, and both removed where they are not due.
  - A `surfaces` state holds what the re-read lands and redraws only the shims.
  - The editor re-reads once on open, beside the Paywall's own on entry, and never twice for one opening.
  - `offCard` keeps its gate.

  -- The canvas half of FR-H5.
- [ ] `apps/web/lib/canvas-layer.ts` + `editor.tsx`'s scroll listener — a sticky root is `pinned` only while stuck (its
  top at or above its computed `top`). The listener re-renders when the shown root's answer changes, whether it is
  hovered or selected. The ponytail note gives way to the rule.

  -- The strip makes "stuck from the start" false for every sticky header.
- [ ] `app/(app)/app/harness/editor/layout.tsx` + `tools/keyboard/journey.spec.mjs` — the harness and the walk.
  - A `surfaces` harness site, chosen by `x-inflozo-harness-site: surfaces`:
    - the fixture's words plus a bold word and a link;
    - `accent`;
    - `["visitors", "free_members"]`;
    - the button on, `icon-and-text`, "Subscribe".
  - The Story 5.21 journeys, keyboard only:
    - the strip is the body's first child, and `#canvas`'s top equals its height;
    - `elementFromPoint` passes through both shims;
    - View as's three visitors;
    - 390 against 834;
    - dark mode, Preview and page 2 leave both unchanged;
    - Sample content keeps both, and the Paywall shows neither;
    - Layers, Undo and the journal are unchanged;
    - zero `data-inflozo-*` at rest;
    - `#canvas`'s markup is identical to the same page with no site;
    - a selected sticky header's outline equals its box after scrolling past the strip.

  -- R-146: the wiring, on every commit.
- [ ] `tools/probe/run-verify-editor.cjs` (step 96) + `run-verify-live-content.cjs` (a Story 5.21 section, T1) — the
  deployed walks (R-82).
  - **Step 96:** the seeded project links no site, so no `[data-ghost-surface]` appears on any canvas it visits, and steps
    3 and 4 still hold.
  - **The live walk, first on a SEEDED snapshot:** the shims per visitor and device, on Sample content and on the
    Paywall.
  - **Then REAL:**
    - T1's Admin key goes in through Manage keys, and `portal_button` is switched on with the staff token;
    - the editor opens and re-reads, showing the fixture words in T1's accent and the button;
    - T1's own home page is opened anonymously at the same device, and the bar's height (±1px) and the button's box
      (±2px) are compared with the canvas's at 1440 and 834, where the fixture's words hold one line in any font. At
      390 neither page has a button;
    - visibility goes to `[]`, the editor is reopened, and the strip is gone;
    - everything is restored and read back in `finally`.

  -- Proven on production against a real Ghost.
- [ ] **Docs** (standing rule 3):
  - **MEASUREMENTS §55.**
  - **PRD:**
    - FR-H5, as built: the snapshot keys, the re-read on open and the marker;
    - FR-C5: the editor re-reads on open;
    - §7.5's `sites` row gains the announcement and the button's style and label;
    - NFR-3: `announcement_content` is rendered only through the inert parse and the serializer;
    - NFR-6(c3): the canvas marks both regions `[data-ghost-surface]`, and §55 names Ghost's live roots;
    - §1.2 item 2 and FR-C2's reason: `portal_button` is off by default, per §55 — the ask itself is unchanged
      (DW-277).
  - **The spine AD-21:** the strip is the first child and the button's host the last, outside `#canvas`, never
    `data-inflozo-*`; `pinned` is "stuck", not "sticky".
  - **EXPERIENCE.md:** an Editor row for "Ghost's Own Surfaces" (S4a · §55).
  - **`epics.md`:**
    - 5.21's frame line: S4a draws neither shim, and each is drawn to Ghost's look;
    - its stacking sentence becomes fidelity: a `position: fixed` element at `top: 0` covers the strip, as it covers
      Ghost's bar at `z-index: 90`;
    - 7.34's card gains the canvas marker and §55's live roots (item 51: those roots float).
  - **VERIFY-AT-BUILD** item 21's second half, closed by §55.
  - **The ledger:** DW-276 to DW-278, and DW-271 amended.

**Acceptance Criteria:**

- **The frame.** Given a connected site with a bar and the button on, when the editor opens on Home at Desktop, then the
  canvas **matches frame S4a**: the ground, the page card and zero chrome at rest. Ghost's strip sits inside the card at
  its top, and Portal's button sits in its bottom-right corner, each **matching Ghost's own look as recorded in
  MEASUREMENTS §55**.
- **The design is pushed down, not changed.** Given the strip, when the canvas renders, then:
  - `#canvas` begins at the strip's bottom edge;
  - every `#canvas > *` root's `outerHTML` equals the same page's without a site (run-verify-editor step 4's comparison);
  - `/pilots`, `node tools/check-snapshots.mjs` and the render matrix are unchanged.
- **Stacking, as the live page stacks.** Given a site-wide header, when the strip is above it, then the header meets the
  strip exactly as it meets Ghost's bar on the live page:
  - whatever is in flow starts below the strip;
  - a sticky header sticks once the strip has scrolled away;
  - an element fixed at `top: 0` covers the strip according to its z-index against 90.
  The live walk compares T1's page with the canvas at the same device.
- **The member-state toggle.** Given View as, when the visitor changes, then the strip follows `announcement_visibility`
  (§46(c)) and the button takes Portal's member look for a Free or Paid member.
- **Inert.** Given either shim, when it is pointed at, pressed or touched, then:
  - the event reaches what lies beneath;
  - nothing selects the shim;
  - Layers, the journal and the doc are unchanged;
  - neither shim is ever offered to Shuffle or Remix or reaches any compile.
- **Cleared means gone.** Given the bar cleared in Ghost admin (the text emptied or no box ticked), when the editor opens
  again, then the re-read has written it and the strip is gone.
- **NFR-3.** Given any stored announcement, when it is drawn, then only its words and Ghost's three marks reach the page,
  through the inert parse. No script runs and no request is made: the hostile vectors in `ghost-surfaces.test.ts` stay
  inert, and the live walk's `securitypolicyviolation` count stays zero.
- **NFR-6(c3).** Given the canvas, when a comparison needs the two regions, then `[data-ghost-surface]` finds exactly the
  shims drawn and nothing else.
- **R-98 and R-192.** Given the story adds no pressable control and no route, when `busy.test.ts` runs, then it passes
  unchanged. The re-read on open runs while reading along too, and edits nothing.

## Spec Change Log

## Design Notes

**Why Ghost's look and not a frame.** R-74 makes the export the authority for what Inflozo's interface is built from. These
two are not Inflozo's interface: FR-H5 defines them as approximations of the markup Ghost injects. The export draws
neither — the sweep at this Create found no frame showing Ghost's bar or Portal's button, and S4a opens straight onto the
site header. So S4a governs the canvas they sit in, and Ghost's source and §55's recording govern the shims themselves.
A shim drawn in Inflozo's vocabulary would misstate the page.

**Why the light DOM for the bar and a shadow root for the button.** This mirrors Ghost:
- Ghost's bar lives in the page. It inherits the theme's body font and meets the theme's CSS as it will on the live site,
  so the strip does the same, with Ghost's own sheet.
- Portal's button lives in an iframe the theme cannot reach, so its shim sits in a shadow root with `all: initial` on the
  host. A second iframe inside the canvas would buy nothing more.

**Why the connection and not the content pill** (a routine call, stated). FR-H5 draws both from "the connection's stored
settings snapshot", and FR-C5 ties them to the site's own settings. The pill chooses whose **content** fills the page:
switching to Sample content to see a fuller grid (R-194) changes the posts, not whether Ghost's bar sits above the
header. 5.20's `offCard` follows the pill because it speaks about the site's content access, which is a different kind
of fact. As a result the harness, whose site never answers, still exercises both shims.

**Why a re-read on open.** "The strip disappears the moment the user clears Ghost's bar" needs Inflozo to learn it:
- Ghost tells Inflozo nothing, and the daily check alone would leave a cleared bar on the canvas for up to a day.
- Inflozo's own one-click clear (FR-C4) is DW-66's, behind Epic 7.
- 5.20 already re-reads on entering the Paywall ("we re-check whenever you open this screen"), so widening that one read
  to the whole settings payload, once per opening, costs one Admin GET.
- It also lets the owner test against his own Ghost admin without waiting for the cron.

**Why "stuck", not "sticky".** Every pilot header is sticky at `top: 0`, which `pinned()` treated as fixed from the first
frame. With the strip above it, the header scrolls with the page for the strip's height and then sticks. Chrome held in
the fixed layer from the start would sit a strip's height below the header once it sticks, and nothing re-places it on
scroll. So the layer follows the stuck state, and the one switch happens as it sticks.

**Corrected facts** (standing rule 1; each goes to its document in the Docs task):
- **Portal's button is off by default.** Ghost's `default-settings.json` says so on both majors, and both test servers
  have it off. PRD §1.2's "on by default on essentially every site" and FR-C2's reason for defaulting the ask to on rest
  on the opposite. The ask is untouched — it has never been reachable — and DW-277 holds the question for the owner.
- **"All sit below Ghost's strip" is true of what is in flow.** An element fixed at `top: 0`, or absolutely positioned
  against the page, covers Ghost's bar on the live site at the bar's `z-index: 90`. The canvas shows that too, because the
  strip is where Ghost puts it. No pilot is fixed or absolutely positioned; the first overlay header arrives with Epic
  9's A1.

**Routine calls, each stated rather than asked.**
- The button always draws Ghost's default person icon, which moves no edge by more than 2px (DW-278).
- The close ✕ is drawn, since it is part of Ghost's bar, and it does nothing.
- An unknown background falls back to Ghost's default, `dark`.
- An empty label draws none, as Portal does.
- A site with no members record is not checked for members off.
- A design that declares `#announcement-bar-root` would move Ghost's bar into itself on the live site. None does, and the
  shim's code carries that ceiling in a `ponytail:` comment.
- The shims are drawn in Preview as well, because they are the site's, not chrome.
- An axe scan of a canvas with a connected site would read the strip's contrast. That contrast is Ghost's and the site
  owner's, while NFR-5's zero is about Inflozo's interface. A scan that meets it filters `[data-ghost-surface]` as a node
  filter, as R-149 filtered one rule on one node — never as a disabled rule.

**What is not built, and where it went.**
- **DW-276:** a corner design (A2 #11 Toast, A22 #14 Slide-in Card) meets the button, and no rule settles which moves.
  Owners: 9.7 and 10.78.
- **DW-277:** the Portal ask's "on" default rests on a claim Ghost's source contradicts. It is the owner's, if the case is
  ever reachable.
- **DW-278:** the chosen icon is not drawn.
- **DW-66:** unchanged — the seed and the one-click clear.
- **DW-271:** amended — the re-read on open is a third writer.

## Verification

**Commands** (Node 24; keys by variable name only, never printed):

- `env $(grep -E '^(GHOST5_URL|GHOST5_STAFF_ACCESS_TOKEN|GHOST6_URL|GHOST6_STAFF_ACCESS_TOKEN)=' tools/probe/.env | xargs)
  node tools/probe/record-ghost-surfaces.cjs` (read its header first; it writes to both servers).
  - Expected: exit 0 on T1 6.58.0 and T3 5.130.6, with `surfaces.json` written per major.
  - Every *Ask First* finding is stated either way in §55.
  - Both servers are read back as they were: `portal_button` false and visibility `["visitors"]`.
- `pnpm check` — expected: exit 0, including:
  - `ghost-surfaces.test.ts` (the rules, the hostile content, both CSS sources equal to the recording);
  - `probe-rule.test.ts` (one mapping, never Stripe);
  - `server-wiring.test.ts` (the ownership order, renamed);
  - `live-content.test.ts`, `editor.test.ts` and `busy.test.ts`;
  - `pilots.test.ts` **unchanged** — the canvas document gains no byte.
- `node tools/check-snapshots.mjs` and `bash tools/matrix/run-matrix-gate.sh` — expected: no snapshot and no baseline moves.
  This is the control that nothing but the editor draws a shim.
- `pnpm keyboard` — expected: green, with the Story 5.21 journeys among the passes.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) node
  tools/probe/run-verify-editor.cjs` — expected: 0 FAIL on `app.inflozo.com`, with step 96 among the passes. It is
  known-flaky (DW-222, DW-220), so record every run.
- `env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST6_URL|GHOST6_CONTENT_API_KEY|GHOST6_ADMIN_API_KEY|GHOST6_STAFF_ACCESS_TOKEN)=' tools/probe/.env | xargs) MAJORS=6 NO_429=1 node tools/probe/run-verify-live-content.cjs`
  — expected: 0 FAIL with the Story 5.21 section.
  - T1's `portal_button` and visibility are restored and read back.
  - Tell the owner first: it switches T1's button on and its bar off for about a minute.
- `python3 tools/doc-audit.py --check`, twice — expected: PASS.

**The real services this story touches (R-82):**
- **T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`:**
  - the recorder on both;
  - the live walk on T1;
  - the read-only reads above, at this Create.
- **Supabase production:** the walks' throwaway accounts, sites and snapshots, each deleted, with the users counted
  before and after.
- **Vercel and GitHub Actions:** the deployment for each push.
- **Resend and Dodo:** not touched.

## Owner's manual test

On the real site after Deploy, in a desktop browser about 1440 wide. Deploy confirms the URLs.

- Steps 1–12 use your **Ghost 5 Project**, which reads ghost5.inflozo.com.
- ghost5 already carries the test announcement "Fixture announcement — seeded for VERIFY 21.", shown to public visitors
  in its green accent, and its floating button is off.
- Steps 6, 11 and 12 change a setting in ghost5's own admin, and step 12 puts everything back.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | `https://app.inflozo.com/projects/99d4d277-540f-4407-b9e1-033d4c93058f` | Editor, Home, Desktop | Open the project and look at the top of the page. | — | A green strip across the very top of the page, **above your header**: "Fixture announcement — seeded for VERIFY 21." in white, centred, with a small ✕ at its right. Your header starts just below it, and the rest of the page is as before. |
| 2 | same | Editor, Home | Point at the strip, then click it. Look at Layers. | — | Nothing outlines and nothing is selected; a section you had selected is let go. Layers lists the same rows as before, with no row for the strip. |
| 3 | same | Top bar → **View as** | Choose **Free member**, then **Paid member**, then **Logged out user**. | — | The strip disappears for Free member and Paid member, because the bar is set for public visitors only, and comes back for Logged out user. |
| 4 | same | Top bar → devices | Choose **Mobile**, then **Tablet**, then **Desktop**. | — | The strip stays at the very top at every size; on Mobile the words may wrap onto two lines. |
| 5 | same | Canvas | Click your header to select it, then scroll the page down slowly. | — | The strip scrolls away, the header then sticks to the top, and its outline stays on the header the whole way. |
| 6 | `https://ghost5.inflozo.com/ghost/#/settings/portal/edit` | Ghost admin → Portal → **Look & feel** | Switch on **Show portal button**. Leave Button style on **Icon and text** and the text on **Subscribe**. Save. | Subscribe | Saved. |
| 7 | the step 1 URL | Editor, Home, Desktop | Reload the page. | — | A green rounded **Subscribe** button with a person icon floats in the bottom-right corner of the page. It may appear a moment after the page does, while the editor checks your site. |
| 8 | same | Canvas | Point at the button, then click it. | — | Nothing opens. The section underneath the button is the one that outlines and gets selected. |
| 9 | same | View as, then devices | Choose **Free member**. Then choose **Mobile**. Then go back to **Logged out user** and **Desktop**. | — | As a Free member the button is a round icon with no words. On Mobile there is no button at all, because Ghost never shows it on phones. Back at Desktop, **Subscribe** returns. |
| 10 | same | **Template ▾** → **Paywall**, then Home and the pill at the canvas foot | Open the Paywall and look. Go back to Home, switch the pill to **Sample content**, then back to your site. | — | The Paywall shows neither the strip nor the button. On Sample content both stay, because they belong to your connected site, not to the sample posts. |
| 11 | `https://ghost5.inflozo.com/ghost/#/settings/announcement-bar/edit` | Ghost admin → **Announcement** | Untick **Public visitors**, so that no Visibility box is ticked. Save. Reload the editor. | — | The strip is gone and your header sits at the very top of the page. |
| 12 | the step 11 URL, then `https://ghost5.inflozo.com/ghost/#/settings/portal/edit` | Ghost admin | Tick **Public visitors** again and Save. In Portal's **Look & feel**, switch **Show portal button** off and Save. Reload the editor. | — | The strip is back and the button is gone. ghost5 is as it was. |
| 13 | `https://app.inflozo.com/projects/b6d4db35-8e5e-45e1-a70f-4daa28916d51` | **Pilot sections**, Home | Open it. | — | No strip and no button, because this project is not linked to a site. |
