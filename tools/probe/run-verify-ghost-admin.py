#!/usr/bin/env python3
"""The connect wizard, its probes, FR-C4's auto-branding screen, the site ⋯ menu and FR-C8's key management, driven through the real UI on the deployed site and read off the wire. Stories 3.2-3.6.

    python3 tools/probe/run-verify-ghost-admin.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-ghost-admin.py           # the whole round trip, T1 and T3
    python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com
    python3 tools/probe/run-verify-ghost-admin.py --shots /tmp/shots   # + screenshots at 1440/834/390

WHY IT EXISTS, AND WHY IT CHANGED. Story 3.1 drove a bearer-gated verify route, because the Admin
chokepoint had no product caller and R-82 wants the Vault write, the decryption and both real
Ghosts executed on the DEPLOYED function rather than on a laptop that cannot write to the live
database. Story 3.2 built that caller — the connect wizard — and DELETED the route (DW-48), so this
harness now drives the product itself: a throwaway account signs in, pastes T1's real keys into
S2b·2 on `app.inflozo.com`, and every claim is read back off PostgREST and off the transaction
pooler. Nothing here calls an endpoint that exists only for testing.

WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails. The steps are
named here in the order the run prints them (a docstring that names fewer than the run prints is a
list gone stale — the sibling harness's own note):

  keys           every key this run needs is in `tools/probe/.env`, BY NAME. Printed in both modes;
                 no value is ever printed
  browser-js     the embedded Playwright script PARSES, checked before a key is read or a byte is
                 spent. The script is a Python string until node reads it, so no test in the
                 repository can see it, and a REDECLARATION in it surfaced only in the middle of a
                 live run (Review, 2026-09-08). IT CATCHES A REDECLARATION AND NOT THE SHADOWING
                 CLASS: the Dev failure the same day — a block-scoped `const same` that put every
                 earlier caller in its temporal dead zone — is VALID SYNTAX, and `node --check`
                 exits 0 on it. Executed, not assumed (review 3, 2026-09-08); the note beside that
                 step says the same thing, and the guard there is placement, not this gate
  vault-off-rest THE BOUND THE DESIGN RESTS ON, re-executed every run rather than remembered
                 (§21j): `GET /rest/v1/{decrypted_secrets,secrets,site_credentials}` with the
                 secret key -> 404 all three, `/rest/v1/sites` -> 200 as the positive control. A
                 leaked API key yields references, not keys
  settings-keys  STORY 3.3, printed in both modes: the six settings keys the probes read are
                 really in the INTEGRATION key's own `GET /admin/settings/` payload on both
                 majors — `portal_button`, the two `codeinjection_*` and the three
                 `announcement_*`. §15h item 21 measured the announcement three with a STAFF
                 token, a credential the product does not hold until Epic 7, so this had to be
                 executed rather than inherited (§39)
  brand-keys     STORY 3.4, printed in both modes: the keys `BRAND_KEYS` names — FR-C4's brand
                 reader takes them off the SAME payload — `accent_color`, `logo`, `icon`,
                 `cover_image`, `navigation`, `title`, `description` — are really in the integration key's own
                 `GET /admin/settings/` on both majors, and the CONTAINER of each is recorded.
                 `navigation` is a JSON *string*, as `announcement_visibility` is (§40); the
                 reader admits an array too, and this is what says which branch is live
  then, in the browser, as one throwaway account that starts on the Free plan:
  first-run      `/sites` with nothing connected is an EMPTY SCREEN — the owner's finding 7: his
                 own title and subtitle (read from the app, not retyped), a drawing, and TWO
                 "Connect site" buttons, the bar's and the centred one. No handshake and no key
                 field is on this route any more
  sites-bar      THE TOP BAR IS THE SHELL'S, like Projects' (his finding 5, amended): 64px with a
                 1px rule, the field placeholdered "Search sites…" — the frame's own (S11a :52) —
                 "Connect site" as its only other control, and NO BELL anywhere (Story 13.4's,
                 ruled out of this story at Question 4)
  axe-empty      axe over the empty screen, at 1440 and 390
  same-size      the empty screen's own button opens S11b, and the sheet's box is THE SAME at both
                 steps, at 1440 and again at 390. Measured before the fix: 520×665.7 then 520×608.5, a 57px shrink that swept
                 the sheet's top edge 28.6px down and uncovered the card behind it — his findings
                 1 and 2, which were one cause
  find-link      "Where do I find these?" is an `<a href="?step=integration">` with no border and no
                 chevron, above the fields and on the right (his finding 3 — a departure from the
                 frame, which draws a bordered box that reads as a dropdown)
  handshake      `/sites/connect`, where the "Connect site" LINK goes with JavaScript off, IS
                 S2b·1: "1/2", three numbered steps, the integration screenshot really served (not
                 a 404 behind an <img>), Back — an `<a href="/sites">` — and "Done — next" — a
                 LINK, so it is followed
  keys-step      "Done — next" lands on S2b·2: the three fields the frame draws, all three
                 `required`, and NO fourth. The Staff Access Token is not asked for here and the
                 page is read to prove it; and the page card is ONE SIZE at both steps (it was
                 480×694.7 then 560×661 before the fix)
  http-warned    `http://…` typed into the API URL: the app's own HTTP_WARNING appears UNDER THE
                 FIELD as it is typed, before anything is submitted
  js-off         the keys form is PROGRESSIVELY ENHANCED — `method=post`, an `action` attribute that
                 posts to the page, and React 19's encoded `$ACTION_*` hidden fields — so a scripts-off
                 browser submits it natively to the server action. (Whether the authed shell paints
                 it visibly without JS is DW-56, a shell question, not this story's.)
  http-connect   a plain-http address SUBMITTED after the warning: the browser skips its check, the
                 server's own call carries the key, the deployed function receives a 301 (read off the
                 audit) and answers `ghost_redirected`, and NO site connects
  malformed      `abc` as the Admin key: the field says what a key looks like, the wire shows NO
                 sites row — refused before Vault and before the network — and the other two
                 fields KEEP what was typed (React resets a form after its action; the values
                 are state)
  not-a-url      `orbit weekly` as the address: `url_invalid`'s sentence UNDER THE URL FIELD, no
                 row, and the audit shows no Ghost call was made for it (the I/O matrix's "Not a
                 URL" row, on the deployed site)
  unreachable    `https://nonexistent.inflozo.com`: the deployed function's own fetch fails and
                 `ghost_unreachable`'s sentence names the host, no row (the matrix's "Unreachable
                 host" row)
  bogus-key      a key of the right shape whose `kid` Ghost never issued: `ghost_unknown_key`'s
                 sentence under the field (§37 — a regenerated key, never an "expired" one), no row
  content-wrong-key  the Content API key with one character changed: the browser's own check (§38b)
                 answers 401 and the submit NEVER LEAVES THE PAGE — counted, not assumed
  connect        T1's real keys, its address typed as a BARE HOST (the matrix's "Bare host typed"
                 row — the row stores the https origin): the wire shows the row with
                 `ghost_version`, `content_key`, the title and `site_settings.public_url` as
                 `GET /admin/site/` answers them with no key (§38a), and
                 `credentials_present {content,admin} = true, staff = false`; the pooler shows a
                 `private.site_credentials` row and a live `vault.secrets` row behind its ref —
                 and STORY 3.4 MOVED WHERE IT LANDS: the browser is on `/sites/brand?site={id}`,
                 S2c, naming the site it just read, because T1's settings carry a brand
  brand-screen   STORY 3.4: S2c on the deployed site (`S2 Onboarding.dc.html:150-196`) — including
                 the owner's ask of 2026-09-10, items 2 and 3: the site's address is an ANCHOR with
                 the new-tab glyph pointing at the PUBLIC url while the menu pills stay text with
                 no href, and there is a ✕ going to /sites. Asserted
                 against the ROW the probe just wrote — the heading and its sub-line naming the
                 host, "Your site today", the accent swatch really painted in the row's accent and
                 CAPTIONED WITH THE HEX (the frame's colour NAME is the one departure: Ghost
                 answers a hex and nothing else), the menu as text pills with NO links, "Fonts
                 stay yours", the homepage caption, both buttons, and the caption under **Use your
                 brand** saying a project will be MADE — this account has none yet
  brand-logo     THE `<img>` HALF OF THE LOGO SLOT, which is what a customer whose Ghost carries a
                 logo sees and which no run had ever rendered: §40 records `logo` as an EMPTY
                 STRING on both majors, so every other step draws the monogram tile. The reason
                 recorded for leaving it unproved was that a logo needs an Admin WRITE — it does
                 not: the row is patched through the SERVICE ROLE, as `brand-none` already patches
                 it, and put back in a `finally`. Exactly one `<img>` carrying that src, and the
                 monogram tile NOT drawn beside it
  brand-failed-line  THE MATRIX'S "insert fails -> the page says so". EVERY failure branch in
                 `useBrand` redirects to `&failed=1` (the count is not written down here — it was,
                 as "four", and there are five: review 5, 2026-09-09, standing rule 4), and until
                 now the sentence they redirect to was asserted by `BRAND_COPY.failed.length > 0`
                 and by nothing else at any level, so deleting the block that renders it would have
                 shipped green. Asserted BOTH WAYS: printed with the flag, absent without it — and
                 a REAL failure branch is now driven to it, because visiting the flagged URL by
                 hand proves the sentence renders and NOT that anything redirects there
  brand-js-off   both S2c controls are `<form action={serverAction}>`, read off S2c fetched as a
                 FRESH DOCUMENT because that is what a scripts-off browser is served: method=post, an action
                 attribute, React's encoded `$ACTION_*` hidden fields, one hidden `site_id` and one
                 submit each, and exactly one carrying the hidden `project_id` — the decision the
                 caption states. (The Sites card's offer is a LINK and needs no form to work with
                 scripts off; it is asserted where it is drawn, in `brand-seed`.)
  axe-brand      axe-core over S2c at 1440 and 390
  brand-popup    THE OWNER'S ASK OF 2026-09-10 AND HIS TEST OF IT THE SAME DAY: the card's offer
                 opens S2c as a WINDOW over the Sites list — `/sites?brand=<id>`, a parameter on
                 the list and not a route of its own — **with the shell's top bar still drawn**,
                 which is his finding ("the pop up opens but then the top bar with search box and
                 Connect site buttons disappears": the bar is keyed on the exact path, and an
                 intercepted popup lives at the panel's own URL). The press closes it and leaves
                 the list, the offer opens it again, Skip closes it too, and **the ✕ is a fourth
                 way out** (his ask, item 3) that leaves the offer on the card — it writes nothing,
                 exactly as Skip writes nothing; Back after it re-opens nothing (the ✕ replaces,
                 as every other way out does); the offer itself reads BRAND_COPY.opening with
                 `aria-busy` inside a held fetch and a second click starts no second one (R-98,
                 step 25 of his test); and Escape is the fifth way out, leaving the URL off
                 `?brand=` with the list and the bar still there
  brand-skip     **Skip** writes NOTHING — no project, and no note that it was pressed — the
                 browser returns to `/sites`, and the card still carries the offer link, so it can
                 be taken later. The card itself is unchanged: its title and address as
                 `GET /admin/site/` answers them, the address a link to the PUBLIC url, and
                 "Checked just now" stamped by that read
  decrypt-path   STORY 3.3, and DW-54's THIRD GAP CLOSING: the probe runs on the STORED key
                 through `call()`, so the first connect leaves TWO `vault_decrypt` rows and,
                 carrying the site's id, THREE `admin_read` rows — `site/` from the connect
                 action plus `config/` and `settings/` from the probe. Before this story nothing
                 in the product decrypted at all
  probe-selfhosted  FR-C2's four probes on a real self-hosted Ghost: `hostSettings` is absent, so
                 `capability` is `full` with source `probe` — the SAME answer with the
                 ghostpro_preview_probe flag on or off, which is why this step says nothing about
                 the flag (the flag-off branch is proved in `probe-rule.test.ts`, against a
                 Ghost(Pro) payload no server here can send); `site_settings` carries
                 `code_injection` true (see
                 injection-live), `portal_button` false with source `probe` — Ghost answers a
                 real boolean, so no question — the announcement's three values with
                 `visibility` still the JSON STRING Ghost sends, and Story 3.2's `public_url`
                 untouched beside them
  no-payload-leak  NFR-3: neither `codeinjection_head` nor `codeinjection_foot` appears in the
                 `sites` row, in any response body the page received, or in the rendered `/sites`
                 HTML. The marker `injection-live` wrote is what makes that assertion real
  injection-notice  the one-time sky notice is on the card because Ghost really has code
                 injection set; **Got it** stamps `code_injection_notice_shown_at` and the notice
                 does not come back on a full reload (nor after a re-probe — `re-adopt` proves
                 that, where the re-probe happens)
  card           the card the owner finalised (his findings 4 and 6), read off the rendered boxes:
                 the address carries the new-tab glyph, and "Connected" has left the pills' line to
                 sit just above "Checked …" and closer to it than to the pills
  brand-seed     STORY 3.4, driven the way the owner tests it: the offer LINK on the card, then
                 **Use your brand**. A project exists named from the site's own Ghost title, with
                 `linked_site_id` set — FR-B5's first writer — and `style_pack.brand.accent` equal
                 to the site's; the Sites card's tally turns into the app's own "1 project"; and
                 the DASHBOARD card's wireframe is painted in that accent, read with
                 `getComputedStyle` off the rendered card
  skeleton-soft-nav
                 RECORDED, NEVER ASSERTED, and it is a step the run prints: pressing Sites in the
                 sidebar and polling `main` every 50ms, so the path the router really takes
                 between two commits is in the log. What it draws there is timing this run cannot
                 hold still — the first version of `skeleton-shape` asserted exactly this by
                 HOLDING the RSC request and saw neither sentence, because holding it stops the
                 router committing the navigation at all and the boundary is drawn after the
                 commit (executed, then corrected)
  skeleton-shape THE OWNER'S TEST OF 2026-09-09, finding 2 ("they are showing a generic shmmer"),
                 and ruling R-98. Read off the STREAMED DOCUMENT of each route, where React puts
                 the segment's Suspense fallback before it streams the content over it, so there
                 is no timing to lose: /sites' body carries "Loading sites…" and NOT the
                 dashboard's "Loading projects…", and / carries the second and not the first. THE
                 CONTROL IS THE PAIR — before this fix /sites had no `loading.tsx` of its own and
                 carried the dashboard's, image band and all, which is a state no arrangement of
                 those four booleans passes. The drawing agrees: the 16:10 band is counted in both
                 bodies and belongs to only one of them, matched on the class pair only a
                 FALLBACK carries — the real project card wears the same 16:10 band, so counting
                 the band alone left that half of the pair unable to fail (review, 2026-09-09)
  busy-label     THE SAME TEST, finding 1 ("the button does not says anything"), and the same
                 ruling. The POST is HELD and S2c's buttons are read inside the hold: the pressed
                 one goes from the app's own BRAND_COPY.skip to BRAND_COPY.skipping with
                 `aria-busy` and `aria-disabled` — never `disabled`, which would drop the control
                 the user is waiting on out of the tab order — while the button in the OTHER form
                 is untouched, because `useFormStatus` is a form's status and not a page's. Driven
                 on **Skip**, which writes nothing, so the assertion cannot disturb the row the
                 at-cap steps read next. `held > 0` is its control: a press whose POST was never
                 held would resolve before the read and could not fail. AND NOTHING MOVES (his
                 ask of 2026-09-10): the pressed control's box and its neighbour's position are
                 measured at rest and inside the hold and must be identical
  brand-atcap    the seed above just put this Free account at F.1's cap of 1 project, so the
                 owner's Question 1 ruling (2026-09-08) is live: the caption NAMES the project it
                 will brand before the press, and pressing it writes `style_pack.brand` onto that
                 row and changes NOTHING else — not its name, not its `slug`, not its
                 `linked_site_id` — and makes no second project
  brand-stale    THE CAP IS WHAT REFUSES, and this is the only step that executes it: at the Free
                 cap the hidden decision is blanked in the DOM — the exact body S2c emits before
                 any project exists, and what a second tab that filled the cap leaves behind — and
                 the press writes NOTHING, returning to S2c with the TRUE caption naming the
                 project. Every other step presses a real button and so posts a real project id,
                 which takes the other half of `useBrand`'s guard; the paywall's own half was
                 resting on a line nothing asserted, and the matrix's "cap changed under the page"
                 row had no proof at any level. Pressed IN THE WINDOW, so the refusal must answer
                 inside it — `/sites?brand=…`, dialog open, cards and bar behind — which is
                 `brandBase()` executed (the twin of Manage keys' finding 3)
  brand-forged-project  ...AND THE OTHER HALF OF THAT SAME TERNARY. A press carrying a project_id
                 no project of this caller's carries — what a deleted project and another account's
                 row both look like through his own RLS-scoped read — writes nothing and returns to
                 S2c. That is the `!picked` clause, which every step that presses a real button
                 walks past; with it gone the post falls into the INSERT branch and makes a SECOND
                 project at the Free cap, so the count proves the paywall as well as the guard
  brand-none     a card that offers nothing is not drawn (UX-DR3): with the brand taken off the
                 row through the service role (no Ghost here can answer without an accent, a logo
                 AND a menu), the card draws no offer link and `/sites/brand?site=…` renders the
                 NOT-FOUND page — as does a `?site=` naming a row NO ACCOUNT carries. (The
                 stranger's row is a different question and `brand-ownership` asks it.) The
                 brand is restored in a `finally`. The assertion is the page the
                 customer SEES, because the HTTP status on these routes is 200: `/sites/brand`
                 has its OWN `loading.tsx` since R-98 — the group-wide `(authed)/loading.tsx` is
                 gone — so the shell has streamed and the status is committed before `notFound()`
                 throws. The reason changed with the route groups and the status did not;
                 measured, not excused — DW-67, amended. The brand is put back afterwards
  dialog         S11a's "Connect site" is a LINK to /sites/connect that JavaScript turns into S11b:
                 the sheet opens with its title pair and the handshake, Escape closes it, and no
                 POST left the page (Cancel, Escape and the backdrop all send nothing)
  sheet-submit   "Done — next" INSIDE the sheet shows the three fields with the URL unchanged; the
                 same address submitted from the sheet is refused inside the still-open sheet
                 ("… is already connected."), and the account still has one site
  sheet-reopen   a reopened sheet is a FRESH one: at the handshake, no fields, no sentence from the
                 last attempt
  at-cap         T3's keys on a Free account that already has T1: Appendix F.1's own sentence,
                 evaluated from the app's `siteCapSentence('free')` rather than typed here, and no
                 second row
  then STORY 3.5, on that same state — Free, one site, one project linked to it:
  ghost-slot     S11c: at the FREE cap the grid's next cell is the dashed upgrade box, beside the
                 card and on its row, reading the app's own `siteCapSentence('free')` and
                 `goProLabel()` — no number is typed here (standing rule 4)
  site-menu      S11a's ⋯ at the TOP RIGHT of the header row, level with the site's name (DW-57),
                 196px wide (the frame's own, `S11 Sites.dc.html:77`) and holding EXACTLY ONE item,
                 **Disconnect** — Manage keys, Re-check and Reconnect are 3.6's and 3.7's and are
                 ABSENT, not greyed (UX-DR3). Escape closes it and returns focus to the ⋯, which is
                 the platform's, not ours. The count is read off the very selector `lib/menu.ts`'s
                 arrow keys walk, so a row added without a story fails a step
  axe-disconnect axe-core over the open confirm at 1440 and 390
  disconnect-confirm  THE OWNER'S QUESTION 2 RULING (option 1, 2026-09-09) in its two observable
                 halves: the dialog opens with focus on **Cancel** (EXPERIENCE.md § Destructive
                 confirms) and there is NOTHING TO TYPE INTO — zero fields, and Disconnect live on
                 the first click. It names the site and says what happens; Cancel closes it and the
                 site is still connected
  axe-menu       axe-core over the open ⋯ menu at 1440 and 390, REOPENED at each width: a popover's
                 coordinates are written at the click (`lib/menu.ts`) and do not survive a resize,
                 so auditing one opened at 1440 while the viewport says 390 audits nothing
  disconnect-js-off  the confirm is a real `<form action={disconnectSite}>` in the SERVED document —
                 method=post, an action attribute, React's encoded `$ACTION_*` fields, one hidden
                 `site_id`, one submit and ZERO fields to type into, so re-adding the typed field
                 cannot pass by being hidden — AND the ⋯ row that opens it is an `<a href>` with a
                 DESTINATION, `/sites/disconnect?site=<id>`, whose own served document carries the
                 same confirm and the same wired form. Both halves off served markup, because a
                 `<button onClick>` opens nothing with scripts off. The menu itself is a native
                 popover opened by `popovertarget`; the shell's own no-JS paint is DW-56
  disconnect-forged  A SECOND ACCOUNT'S SITE ID forged into that form and submitted from the
                 fixture's own session. `disconnectSite` reads the row through the CALLER'S session
                 before it writes anything and the write is `supabaseAdmin()`'s, so that read is the
                 whole guard: the press is watched LANDING on the not-found page (standing rule 2 —
                 a negative assertion needs a positive control), the stranger's row is byte-identical
                 afterwards, and the caller's own site is not disconnected either
  disconnect     THE PRESS, AND FR-C6 IN ONE STEP. The card leaves the list and `/sites` is the
                 empty screen again — while the ROW survives, stamped `disconnected_at`, with
                 `content_key` null and `credentials_present` every-one-false (the mirror it claims
                 to be). The vault ref is nulled and the secret behind it is GONE (DW-44's trigger).
                 NOTHING ELSE MOVED: the project, its name, its `style_pack` and its
                 `linked_site_id`, and a fixture `site_snapshots` row patched in through the service
                 role — no product code writes one until Story 7.20 — are byte-identical after it,
                 its `purge_after` still null, because the 90-day orphan clock is DERIVED from
                 `sites.disconnected_at` and never stamped there (DW-43 closed, DW-75 owns the job).
                 AND THE RECORD DOES NOT COUNT AGAINST THE CAP — on Free, with it disconnected and
                 nothing active, the grid draws no ghost slot and the connect form is open.
                 THE SECRET'S ABSENCE IS STILL READ FROM `vault.secrets` AND NOT FROM A LOG ENTRY,
                 and that is now a choice rather than the only option: since **Story 3.6** closed
                 DW-76, `remove()` writes one `credential_change` row and the `audit` step below
                 counts it. Reading the vault remains the stronger of the two — a log line says a
                 removal was attempted; this says the key is gone
  re-adopt       FR-C6: the record disconnected BY THE PRODUCT above — the first run in which that
                 branch is reached the way a customer reaches it — `/sites` is the EMPTY SCREEN,
                 its button opens the sheet, and reconnecting
                 RE-ADOPTS the record — same id, `disconnected_at` cleared, `site_settings` intact
                 (its `public_url` and its `brand` both survive), a NEW vault ref, the
                 OLD secret gone (DW-44's replace path, live — the `rotated` proof DW-54 deferred)
  re-adopt-at-cap  AND RE-ADOPTION IS REFUSED AT THE CAP — the branch ORDER, executed for the first
                 time: a DISCONNECTED record does not answer "already connected", it falls through
                 to the cap check, because a record coming back is a site becoming ACTIVE
                 (`actions.ts:178`). It needed a retained record, which nothing could produce until
                 Story 3.5 built `disconnected_at`'s writer. No key is spent: the cap is decided
                 before `fetchWithKey`
  pro-connect-t3 the service role flips the entitlement row to `pro_active` (no billing exists
                 until Epic 12), and T3 is connected THROUGH THE SHEET with a trailing-slash
                 address: the row stores the typed origin without it, the public url as Ghost
                 sends it, `ghost_version` from config/, a secret behind its ref; the sheet CLOSES
                 on success and the second card shows "Ghost 5.x"
  ghost-slot-pro S11c's OTHER HALF: on Pro there is nothing further to sell, so the grid draws no
                 ghost slot at all. Pro AT its cap needs ten connected Ghost sites and is ⛔
                 unexecuted, recorded rather than claimed
  disconnect-again  THE SAME ID POSTED TWICE. A record already disconnected redirects to `/sites`
                 with the cards still drawn — a REDIRECT, not the not-found page a stranger's id
                 gets — and its `disconnected_at` is the instant it already carried, so the second
                 press re-stamps nothing. The row is made by the service role for this press alone
                 and deleted inside the step, so no later count sees it
  disconnect-route-answers  THE SAME THREE STATES ON THE ROUTE, which is the half a scripts-off
                 browser reaches. A second account's id and a malformed one are `notFound()`; the
                 caller's OWN already-disconnected record REDIRECTS to `/sites`, as the action does.
                 All three were one `notFound()` until the review of 2026-09-09
  disconnect-failed  THE FAILURE THE CUSTOMER SEES. `?disconnect=<id>` puts the app's own
                 `connectMessage('disconnect_failed')` on THAT card and no other (the shape
                 `?recheck=` already has), and the site is STILL CONNECTED — which is the whole
                 point of stamping only after `remove()` returns. ⛔ The throw itself is not
                 induced: breaking the pooler breaks every other step in the run, so the code path
                 is read and the SURFACE is executed
  brand-rerun    THE OFFER TAKEN A SECOND TIME, WITH ROOM — the only state in this run where a
                 second press could make a SECOND project for one site, and until the review of
                 2026-09-08 it did. It runs after `pro-connect-t3` because every brand step above
                 it is on a FREE account whose cap of 1 the first press fills, which sends every
                 later press down the at-cap branch. On Pro the caption names the project already
                 made for this site rather than promising a new one, and the press leaves the
                 same single row: FR-C4's "re-runnable" and the matrix's "seeding again writes
                 the same pack"
  brand-picker-js-off  THE CHOOSER'S OWN progressive enhancement, read off S2c fetched as a FRESH
                 DOCUMENT while the cards are on it — one real `<input type="radio"
                 name="project_id">` per card, INSIDE the method=post form that carries the hidden
                 `site_id` and the submit button, exactly one pre-checked and no leftover hidden
                 decision field. `brand-js-off` above runs when the account has NO projects, so
                 the document it reads has no chooser in it and the criterion "given the chooser,
                 when JavaScript is off" was being recorded against the one screen without one
  axe-brand-picker  axe-core over S2c WITH THE CARDS DRAWN, at 1440 and 390 — `axe-brand` runs
                 before any project exists, so the radio cards, their `:has(:checked)` coral and
                 their stacking at 390 had never been looked at
  brand-picker   THE OWNER'S QUESTION 3 RULING (2026-09-08, his A1 and B1), which is the ONLY
                 step with more than one project: a second press with a choice to offer ASKS
                 ("You already put your brand on X. Apply it again?" · "Which project?") and
                 draws one card per project, each carrying that project's OWN 64x44 wireframe in
                 its OWN Style-Pack colours — FR-B1's placeholder, which claims to be no preview.
                 The card for the project this site is already on is PRE-SELECTED, so touching
                 nothing writes exactly what Question 1 ruled; choosing the other card puts the
                 brand on THAT row and changes nothing else about it, and the count stays at two.
                 The two wireframes are read with getComputedStyle and asserted DISTINCT: a
                 chooser whose pictures all match would be telling the customer nothing. It also
                 proves the pack is MERGED and not replaced: the second project is seeded with a
                 key `defaultStylePack()` does not carry, and the key is still there after the
                 press. Before that the fixture's pack was byte-identical to the default, so a
                 write that replaced the whole column passed every assertion (review 4)
  brand-atcap-picker  THE OWNER'S QUESTION 4 RULING (2026-09-08, option 1): at the cap AND with a
                 choice to offer, the ticked card is the project for THIS SITE — the one labelled
                 "This site's project" — and not the one worked on most recently, so the tick and
                 the label sit on one card. The state is a DOWNGRADE, the only way to be at the cap
                 with more than one project (Pro with 2, then Free, which includes 1); the
                 entitlement is put back in a `finally`. The step prints the row the pre-ruling
                 rule would have ticked, so it says whether it discriminated. IT ALSO CARRIES THE
                 OWNER'S QUESTION 6 RULING (option 1, 2026-09-09): the caption over the cards keeps
                 the limit and NAMES NO PROJECT, because the cards do — asserted with its control,
                 that the naming sentence this screen printed before the ruling is GONE from it,
                 while `brand-atcap` proves that same sentence alive at the cap with one project
  search         the shell's field on Sites, on the deployed page: the title of one site leaves one
                 card, the ADDRESS of the other leaves one, and a word that matches neither leaves
                 none with the app's own "No sites match …"
  portal-question  STORY 3.3: `portal_button_source` seeded to `default` on the fixture's OWN row
                 through the service role (no Ghost hides the setting, so no UI can produce this),
                 the ONE question driven on the deployed card, and "Yes, it shows" answered — the
                 row comes back `portal_button` true with source `declared`, never `probe`
  plan-question  `plan_ask` seeded true, the ONLY question FR-C8 allows, answered "No — themes are
                 restricted": `capability` `preview_only` with source `user_declared`, `plan_ask`
                 cleared
  notices-js-off  EVERY control this story adds is a `<form action={serverAction}>`, asserted where
                 all of them are on screen at once — Got it, both answers of each question, B15's
                 Re-check plan, and the second card's own notice: `method=post`, an `action`
                 attribute, React's encoded `$ACTION_*` hidden fields, one hidden site_id and one
                 submit each. The same wiring `js-off` asserts for the keys form; the shell's own
                 no-JS paint is DW-56
  axe-notices    axe-core over `/sites` with EVERY block on screen at once — the code-injection
                 notice, both questions and B15 — at 1440 and 390
  ownership      THE GUARD BETWEEN TWO ACCOUNTS, executed. The four actions this story adds write
                 through the service role, which bypasses RLS, and take the site id from a FORM
                 field — so `.eq('user_id', …)` inside the action is the whole of it. A second
                 throwaway user gets a site row, its id is forged into a notice form the fixture
                 legitimately has on screen, the form is submitted from the fixture's own session,
                 and the foreign row is read back BYTE-IDENTICAL. Added by the review of
                 2026-09-08: deleting that one `.eq` left every gate and every step here green
  brand-ownership  THE GUARD BETWEEN TWO ACCOUNTS FOR STORY 3.4's TWO ACTIONS, which is not
                 `ownership`'s: these write `projects` through the CALLER'S OWN session, so RLS
                 is the guard rather than an `.eq('user_id')`. The second account's real site id
                 is opened as `/sites/brand?site=` (not found), as `/sites?brand=` (the window
                 closes onto the list rather than 404ing over it), and then forged into S2c's own
                 **Use your brand** and **Skip** forms and submitted from the fixture's session:
                 the caller's projects are byte-identical afterwards and none is linked to the
                 stranger's site. The acceptance criterion says "when the page is opened OR
                 EITHER ACTION IS POSTED" and only the page had ever been asked
  preview-notice  B15 (`B Missing Surfaces.dc.html:1188-1225`) on the deployed card: its sky panel
                 and cause sentence, "What clears this" with both routes out (Publisher or higher,
                 and self-hosted), and Export theme zip / Ship it ABSENT because neither path
                 exists in any epic (UX-DR3, DW-60). The chip is on the card's STATE line at 1440,
                 834 and 390 — below the metadata pills, above "Checked …" — and BESIDE
                 "Connected" wherever the card can hold both, which at 834 it cannot: the shell's
                 220px sidebar and the three-column grid leave about 139px, against 78 for
                 "Connected" and 109 for the chip, and the two metadata pills already stack there
                 for the same reason. Read off the rendered boxes at each width, because that is
                 what the owner looks at (DW-57, and he ruled the 834 wrap at spec Question 2 —
                 leave it, the grid stays three-up). Then
                 **Re-check plan** re-runs the same probe and a self-hosted Ghost clears ITSELF
                 back to `full`/`probe`
  keys-screen    STORY 3.6: S11a's ⋯ carries **Manage API keys** above the rule, the row's click
                 opens S11e's WIDE POPUP over the Sites list at `/sites?manage=<id>` — and the
                 panel draws three credential rows with the app's OWN sentences (read out of
                 `lib/connect-rule.ts`, never retyped here). The URL is text with NO input element
                 in it, and NOTHING on it offers to reveal a key — the element count for that is
                 asserted at zero, which is the departure from B20's eye made checkable
  keys-popup     THE POPUP'S OWN BEHAVIOUR, and every claim in it is one of the owner's findings
                 of 2026-09-10 made checkable. The popup is `/sites?manage=<id>` — a parameter on
                 the LIST and no longer a route of its own — so: THE SHELL'S TOP BAR IS STILL THERE
                 while it is open (his finding 1, on both popups: the bar is drawn from a table
                 keyed on the exact path, and an intercepted route moved the path off `/sites`);
                 a refusal keeps the window open with the sentence under its own field AND the
                 cards still behind it (his finding 3, which is the same defect by the other door);
                 an EMPTY Save says which box is empty (his finding 4 — it used to say nothing at
                 all, by decision); Cancel returns to the list with the panel unmounted; the ⋯ row
                 opens it a SECOND time; Escape does the same as Cancel; and a typed URL is still
                 the FULL page with no dialog at all
  axe-keys-screen  axe-core over S11e's POPUP at 1440 and 390 — reopened at each width, because a
                 popover cannot survive a resize (`axeAt`'s own note)
  axe-keys-route   axe-core over the same panel as the FULL page, at both widths
  keys-malformed  `hello` into the Admin field: refused UNDER THAT FIELD, and nothing written
  keys-foreign-key  T3's Admin key pasted into T1's screen: T1 never issued it, so T1 answers 401
                 `Unknown Admin API Key` at `GET /admin/config/` and the refusal fires there —
                 under the Admin field, with GHOST'S sentence, nothing written. The `site/`
                 comparison is never reached. This step was called `keys-other-site` and asserted
                 our own "belongs to a different Ghost site" sentence until the owner ruled R-100
                 (2026-09-09): `api_keys` has no install identity, so Ghost gives one answer to a
                 wrong key and to another site's key and Inflozo may not claim to tell them apart
  keys-other-site  THE GUARD R-100 KEEPS, and the only step that executes it: THIS Ghost reporting a
                 public address different from the one recorded at connect, which is a domain move.
                 T1's OWN valid key is refused with the disconnect+reconnect sentence, nothing
                 written. ⛔ The BASELINE is seeded — the record's `site_settings.public_url` is
                 moved through the service role, because neither test Ghost has a second address —
                 and restored afterwards; the comparison, the refusal and the sentence are the
                 product's
  keys-rotate    a rotated Admin key saved on T1, read back through the pooler:
                 `admin_key_rotated_at` moved, `admin_key_id` is the new key's public id half,
                 `vault.secrets` holds one secret for the ref and it is NOT the old one, and
                 exactly one new `credential_change` row stamped with THIS screen's route.
                 ⛔ The key is re-pasted, not regenerated — regenerating would invalidate
                 `GHOST6_ADMIN_API_KEY` for every probe in this repository
  keys-token     DW-54's `staff-removed`, driven live for the first time: the harness's own token
                 added and then removed on T1 — `credentials_present.staff` true then false, the
                 Vault secret GONE behind the nulled ref, the site still active with
                 `disconnected_at` null, and two `credential_change` rows. Wrapped in a `finally`
                 that nulls the ref if the run aborts mid-way: a real full-Administrator credential
                 sits in Vault between the two presses
  keys-test      **Test connection** pressed: one `admin_read` row for `GET /admin/config/`, the
                 result drawn on the screen, and `sites.health` and `sites.last_checked_at`
                 UNCHANGED — the negative control that this story did not step on Story 3.7's
  keys-js-off    the ⋯ row's `href` in the served markup and the route's own forms wired —
                 `method=post`, an `action` attribute, React's encoded `$ACTION_*` fields, one
                 hidden `site_id` and one submit each. Every form served is wired, and the TYPED
                 FIELD LIST is what pins the shape rather than a hand-typed count
  keys-forged    a second account's site id in `/sites/keys?site=…` and forged into each form: the
                 not-found page, and every row of both accounts byte-identical — WATCHED LANDING,
                 not re-read afterwards (standing rule 2)
  moved-domains  FR-C8's hint on the new card, naming 90 days; and the same connect against a
                 record whose `admin_key_id` is null showing NO hint. ⛔ The old record is seeded
                 through the pooler because neither test Ghost has a second reachable address —
                 the connect, the lookup, the redirect and the hint are all the product's
  audit          `private.credential_audit` read through the pooler — and STORY 3.6 MOVED THESE
                 COUNTS, exactly as this line said it would: `public.credential_action` gained
                 `credential_change`, and `store()` and `remove()` each write one row through it
                 inside the transaction that makes the change (DW-76, closed). Derived, never typed:
                 one `in` per connect, and one `out` per removal that ACTUALLY took a key — which is
                 the single `disconnect`, because `remove('staff')` matches no row on a site that
                 never had a token and so writes nothing. Each row is stamped with ITS OWN writer's
                 route, so the `sites/connect` rows and the `sites/disconnect` row are told apart,
                 and each `detail` is exactly `{kind, direction}` and never a credential. One
                 `admin_read ok` for
                 `config/` with a NULL `site_id` per connect and, carrying the id, one for `site/`
                 plus TWO per probe (Story 3.3 — three connects and one Re-check plan), with two
                 `vault_decrypt ok` rows per probe; every count DERIVED from those two numbers,
                 never written down. The bogus key's `admin_read error` at 401 and the plain-http
                 one at 301 — BOTH asserted by status; every row stamped with the action's own
                 route; and no `detail` anywhere holding a `kid:secret`
  probe-failure  A PROBE THAT CANNOT RUN CHANGES NOTHING — three matrix rows in one: a site row
                 with NO credential behind it (seeded through the service role; no UI can make one)
                 has B15's Re-check plan pressed on the deployed card. `call()` answers
                 `credential_missing`, the audit gets one `vault_decrypt` ERROR row and NO
                 `admin_read` row — nothing reached Ghost — the row is byte-identical to what it
                 was, the card still reads Connected, and the banner under the button says to try
                 again. The CONNECT-TIME variant is not reproducible: at connect the key has just
                 passed `config/` and gone into Vault
  axe-sites · axe-sheet · axe-connect · axe-keys
                 axe-core at WCAG 2.1 AA over `/sites` with the cards, the open sheet,
                 `/sites/connect` and `/sites/connect?step=keys`, each at 1440 AND 390, and no
                 horizontal scroll (`axe-empty` above covers the empty screen)
  user-gone      `GET /auth/v1/admin/users/{id}` -> 404 after GoTrue deletes the throwaway user
  secret-gone    both sites' refs are gone from the vault — the CASCADE path of DW-44's trigger:
                 auth.users -> sites -> site_credentials -> the trigger, under GoTrue's role
  no-secret-leak no response body this run received contains any key it typed
  users before == after, read from the Admin API before any sweep and after cleanup
  injection-live PRINTED LAST, because its restore is the last thing the run does. STORY 3.3's one
                 sanctioned write to a test Ghost (the owner's ruling, 2026-09-08, Question 1,
                 widened to both servers): the harness reads T1's and T3's current
                 `codeinjection_foot`, writes `<!-- inflozo probe -->` BEFORE the browser starts so
                 the first connect meets a site that really has code injection set, and in a
                 `finally` — passing, failing or interrupted — puts back exactly what it found and
                 re-reads to prove it. It is the HARNESS's write and never the product's:
                 `ADMIN_WRITES` is untouched and `permitted()` still denies every non-GET the app
                 could make. It is signed with `GHOST6_STAFF_ACCESS_TOKEN` /
                 `GHOST5_STAFF_ACCESS_TOKEN` because the integration key the PRODUCT holds is
                 refused on `PUT /admin/settings/` — 403 on Ghost 6, 501 on Ghost 5, executed
                 2026-09-08 (§39).

THREE OF STORY 3.1's LIVE PROOFS LEFT WITH THE ROUTE, and DW-54 records it rather than letting
anyone believe they still run: `write-denied` (no product caller makes an allowed write until Epic
7's deploy path), `rotated` — which `re-adopt` above now drives live through the product, one story
early — and `staff-removed` (until Epic 7 stores and removes the token). The other two are unit
contracts in `apps/web/ghost-admin-rule.test.ts` and, for the trigger, the RLS gate, until the story
that re-drives each live. THE DECRYPT PATH IS NO LONGER ONE OF THEM: Story 3.3's probe is its
product caller, and `decrypt-path` above executes it on the deployed function every run.

THE POOLER IS READ FROM THE BROWSER HALF, read-only, through the app's own installed `postgres`
driver (3.4.9) — `vault` and `private` answer 404 over PostgREST by design (§21j), so there is no
other way to see them, and reading them beside the UI steps is what lets "the card says Connected"
and "there is a secret behind the ref" be one assertion.

--shots DIR saves each surface at 1440, 834 and 390 (`s11-empty`, `s2b1`, `s2b2`, `s11a`, `s11b`,
Story 3.3's `b15` and Story 3.4's `s2c`) —
the frame comparison the spec's Review owes, re-takeable at Deploy — and asserts nothing extra. The
empty screen has no frame: it is the owner's finding 7, extrapolated from S3b (R-74).

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

ONE FIXTURE USER IS CREATED AND DELETED HERE, and its two sites go with it. The states no UI can
yet produce are made on it by the service role and nothing else: a PRO entitlement (Epic 12's
billing does not exist), a site row with no credential behind it, and a `site_snapshots` row (Story
7.20 takes the first real one). **A DISCONNECTED RECORD IS NO LONGER ONE OF THEM** — Story 3.5
built its writer, so `re-adopt` is driven through the product's own ⋯ menu. The Admin-API user
count is read before and after — BEFORE any sweep of strays, so a step that created a user it
should not have is reported as the leak it is rather than tidied away — and a count that could not
be read FAILS the run, because it is the cleanup's control.

Playwright and axe-core are resolved from the machine, and the helpers that do it — `Admin`,
`load_env`, `playwright_dir`, `axe_path` and the fixture sweep — are IMPORTED from
`run-verify-passkeys.py` through the sibling `_sibling` pattern rather than copied, so a fix to
any lands on all of them (propagate, never localise).
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'
FIXTURE = r'^ghost-admin-harness-\d+@inflozo\.com$'

# The app's own files, READ rather than retyped: a harness carrying its own copy of a sentence or
# of the audit route proves nothing about the app Vercel serves.
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
CONNECT_ACTIONS = os.path.join(WEB, 'app', '(app)', 'app', '(authed)', 'sites', 'actions.ts')
CONNECT_RULE = os.path.join(WEB, 'lib', 'connect-rule.ts')
PROBE_RULE = os.path.join(WEB, 'lib', 'probe-rule.ts')
PLAN = os.path.join(WEB, 'lib', 'plan.ts')
PG_DIR = os.path.join(WEB, 'node_modules', 'postgres')


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
playwright_dir, axe_path = _passkeys.playwright_dir, _passkeys.axe_path
_deletion = _sibling('run-verify-account-deletion')
rest = _deletion.rest
# The project's ONE JWT mint and Admin client, so `injection-live`'s write is signed exactly the
# way every other probe in `tools/probe/` signs (propagate, never localise).
_all = _sibling('run-verify-all')


def audit_route():
    """The `route` string the connect action stamps on every audit row, read out of the action."""
    found = re.search(r"const ROUTE = '([^']+)'", open(CONNECT_ACTIONS, encoding='utf-8').read())
    if not found:
        sys.exit('  FAIL  sites/actions.ts no longer declares its audit `route` name')
    return found.group(1)


def app_text():
    """The app's own sentences, EVALUATED from `lib/connect-rule.ts` and `lib/plan.ts` rather than
    parsed out of them or retyped here: Node strips the types (`--experimental-strip-types` is a
    no-op on 24 and the switch on 22.6+), both modules import nothing, and a wording change in
    either moves this run with it. `%s` stands where the app puts the host."""
    script = (
        f"import {{ connectMessage, DISCONNECT, HTTP_WARNING, KEYS, ORPHAN_SNAPSHOT_DAYS, projectsLabel, SITES_EMPTY }} from 'file://{os.path.abspath(CONNECT_RULE)}';"
        f"import {{ BRAND_COPY, INJECTION_COPY, PLAN_COPY, PORTAL_COPY, PREVIEW_COPY }} from 'file://{os.path.abspath(PROBE_RULE)}';"
        f"import {{ goProLabel, siteCapSentence }} from 'file://{os.path.abspath(PLAN)}';"
        "console.log(JSON.stringify({"
        " credential_malformed: connectMessage('credential_malformed'),"
        " ghost_unknown_key: connectMessage('ghost_unknown_key'),"
        " content_key_unknown: connectMessage('content_key_unknown'),"
        " ghost_redirected: connectMessage('ghost_redirected'),"
        " url_invalid: connectMessage('url_invalid'),"
        " ghost_unreachable: connectMessage('ghost_unreachable', '%s'),"
        " already_connected: connectMessage('already_connected', '%s'),"
        " http_warning: HTTP_WARNING,"
        " empty_title: SITES_EMPTY.title,"
        " empty_sub: SITES_EMPTY.sub,"
        " no_match: SITES_EMPTY.noMatch('zzznomatch'),"
        " injection_body: INJECTION_COPY.body,"
        " injection_dismiss: INJECTION_COPY.dismiss,"
        " portal_body: PORTAL_COPY.body,"
        " portal_yes: PORTAL_COPY.yes,"
        " plan_body: PLAN_COPY.body,"
        " plan_preview: PLAN_COPY.preview,"
        " preview_chip: PREVIEW_COPY.chip,"
        " preview_title: PREVIEW_COPY.title,"
        " preview_clears_title: PREVIEW_COPY.clearsTitle,"
        " preview_clears: PREVIEW_COPY.clears,"
        " preview_recheck: PREVIEW_COPY.recheck,"
        " preview_recheck_failed: PREVIEW_COPY.recheckFailed,"
        # STORY 3.4 — S2c's every sentence, and the two the frame does not draw (the card's offer
        # and the caption under the button, which is the owner's Question 1 ruling in words).
        " brand_title: BRAND_COPY.title,"
        " brand_sub: BRAND_COPY.sub('%s'),"
        " brand_site_today: BRAND_COPY.siteToday,"
        " brand_accent: BRAND_COPY.accent,"
        " brand_navigation: BRAND_COPY.navigation,"
        " brand_fonts: BRAND_COPY.fonts,"
        " brand_homepage: BRAND_COPY.homepage,"
        " brand_use: BRAND_COPY.use,"
        " brand_skip: BRAND_COPY.skip,"
        # The owner's test of 2026-09-09, finding 1: what the two buttons say while they work.
        " brand_using: BRAND_COPY.using,"
        " brand_skipping: BRAND_COPY.skipping,"
        " brand_offer: BRAND_COPY.offer,"
        " brand_close: BRAND_COPY.close,"
        " brand_opening: BRAND_COPY.opening,"
        " brand_will_create: BRAND_COPY.willCreate,"
        " brand_will_brand: BRAND_COPY.willBrand('%s'),"
        # The owner's Question 3 ruling (2026-09-08): the second press asks, and where there is
        # more than one project it offers cards carrying each project's own wireframe.
        " brand_already_on: BRAND_COPY.alreadyOn('%s'),"
        # The owner's Question 6 ruling (option 1, 2026-09-09): at the cap AND with cards, the
        # caption keeps the limit and hands the choice to the cards instead of naming a project.
        " brand_at_limit_choose: BRAND_COPY.atLimitChoose,"
        " brand_which_project: BRAND_COPY.whichProject,"
        " brand_this_site: BRAND_COPY.thisSite,"
        " brand_failed: BRAND_COPY.failed,"
        " one_project: projectsLabel(1),"
        # STORY 3.5 — the ⋯ menu's one item, the confirm's every word, and the failure line the
        # card prints. Read from the app for the reason every sentence above it is: a harness that
        # retypes a sentence proves nothing about the one Vercel serves.
        " disconnect_menu: DISCONNECT.menu,"
        " disconnect_title: DISCONNECT.title('%s'),"
        " disconnect_body: DISCONNECT.body,"
        " disconnect_cancel: DISCONNECT.cancel,"
        " disconnect_busy: DISCONNECT.busy,"
        " disconnect_failed: connectMessage('disconnect_failed'),"
        # STORY 3.6 — Manage keys' every word, read from the app for the reason every sentence
        # above it is. `movedDomains` is called with ORPHAN_SNAPSHOT_DAYS, which is where the one
        # number this screen's copy needs lives: `KEYS` itself names none (standing rule 4).
        " keys_menu: KEYS.menu,"
        " keys_opening: KEYS.opening,"
        " keys_title: KEYS.title('%s'),"
        " keys_sub: KEYS.sub,"
        " keys_url_label: KEYS.urlLabel,"
        " keys_url_reason: KEYS.urlReason,"
        " keys_present: KEYS.present,"
        " keys_absent: KEYS.absent,"
        " keys_admin_name: KEYS.admin.name,"
        " keys_admin_enables: KEYS.admin.enables,"
        " keys_admin_save: KEYS.admin.save,"
        " keys_content_name: KEYS.content.name,"
        " keys_content_enables: KEYS.content.enables,"
        " keys_content_save: KEYS.content.save,"
        " keys_staff_name: KEYS.staff.name,"
        " keys_staff_enables: KEYS.staff.enables,"
        " keys_staff_add: KEYS.staff.add,"
        " keys_staff_remove: KEYS.staff.remove,"
        " keys_no_reveal: KEYS.noReveal,"
        " keys_roll_hint: KEYS.rollHint,"
        " keys_cancel: KEYS.cancel,"
        " keys_test: KEYS.test.label,"
        " keys_test_passed: KEYS.test.passed,"
        " keys_test_needs_token: KEYS.test.routesWithoutToken,"
        " keys_other_site: connectMessage('keys_other_site'),"
        " keys_malformed: connectMessage('credential_malformed'),"
        " keys_empty_admin: connectMessage('credential_empty'),"
        " keys_moved: KEYS.movedDomains(ORPHAN_SNAPSHOT_DAYS),"
        # S11c's ghost slot, both halves derived from `PLANS` — nothing here names a number.
        " go_pro: goProLabel(),"
        " at_cap: siteCapSentence('free') }))")
    try:
        proc = subprocess.run(['node', '--experimental-strip-types', '--input-type=module', '-e', script],
                              capture_output=True, text=True, timeout=60)
    except FileNotFoundError:
        sys.exit('  FAIL  node is not on PATH; the sentences are read through it')
    lines = [l for l in proc.stdout.splitlines() if l.startswith('{')]
    if proc.returncode != 0 or not lines:
        sys.exit('  FAIL  the app\'s sentences could not be evaluated from lib/connect-rule.ts and lib/plan.ts: '
                 + proc.stderr.strip()[-400:])
    return json.loads(lines[-1])


# ── STORY 3.3's ONE SANCTIONED WRITE TO A TEST GHOST (the owner's ruling, 2026-09-08, Question 1,
#    widened to BOTH servers). It is the HARNESS's write, never the product's: `ADMIN_WRITES` is
#    untouched and `permitted()` still denies every non-GET the app could make.
#
#    IT IS MADE WITH THE STAFF ACCESS TOKEN, and that was executed rather than chosen: the
#    INTEGRATION Admin key — the only credential the product holds — is refused on
#    `PUT /admin/settings/` with 403 NoPermissionError on Ghost 6 and 501 NotImplementedError on
#    Ghost 5 (2026-09-08, MEASUREMENTS §39 — the same major split as `GET /admin/themes/`). The
#    tokens are the harness's own, `GHOST6_STAFF_ACCESS_TOKEN` / `GHOST5_STAFF_ACCESS_TOKEN`, and
#    nothing in the app ever sees one: the PRODUCT's staff token is Epic 7's, at first deploy.
INJECTION_MARK = '<!-- inflozo probe -->'
FOOT = 'codeinjection_foot'


def ghost_for(env, prefix, token_key):
    """One `Ghost` from `run-verify-all.py`, so the JWT mint is the one the whole project uses."""
    return _all.Ghost(env[f'{prefix}_URL'], env[token_key],
                      int(env[f'{prefix}_VERSION'].split('.')[0]), env[f'{prefix}_CONTENT_API_KEY'])


def read_foot(ghost):
    return {row['key']: row['value'] for row in ghost.api('GET', 'settings/')['settings']}.get(FOOT)


def write_foot(ghost, value):
    ghost.api('PUT', 'settings/', {'settings': [{'key': FOOT, 'value': value}]})


def same_box(a, b):
    """GHOST NORMALISES AN EMPTY BOX TO `null` and will not answer an empty STRING again once
    anything has been written to it (executed on both majors, 2026-09-08, §39). So the restore is
    asserted on the box's CONTENT: the same string, or both empty. `injectionFlag` cannot tell an
    empty string, a null and an absent key apart either, which is why the product sees no
    difference between what the step found and what it put back."""
    empty = lambda v: v is None or v == ''
    return a == b or (empty(a) and empty(b))


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    privileged wire reads and the read-only pooler reads live here too, so the database can be
#    read BETWEEN two UI steps.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)
const postgres = require(process.env.PG_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const USER_ID = process.env.USER_ID
const OTHER_USER_ID = process.env.OTHER_USER_ID
const CONFIRM = process.env.CONFIRM_URL
const ROUTE = process.env.AUDIT_ROUTE
const GHOSTS = JSON.parse(process.env.GHOSTS)
const BOGUS = process.env.BOGUS_KEY
/* STORY 3.6: the harness's own Staff Access Token for T1 — the credential the PRODUCT first
   stores and removes on this story's screen (DW-54's `staff-removed`). Through the environment,
   never argv. */
const STAFF_TOKEN = process.env.T1_STAFF_TOKEN
const SAY = JSON.parse(process.env.SENTENCES)
/* What `injection-live` put in BOTH test Ghosts' Site-footer code-injection box before this run
   started, and takes back out in the Python half's `finally` (the owner's ruling, 2026-09-08).
   It is here so the no-payload-leak sweep can look for the exact string. */
const MARK = process.env.INJECTION_MARK

/* `load`, NOT `networkidle`, AND A MINUTE TO DO IT IN — the sibling harness's own finding: the
   FIRST authed render on a cold deployment took longer than Playwright's 30s default, and Deploy
   always meets a fresh deployment. Every step asserts through a locator that waits on its own. */
const NAV_TIMEOUT = 60000
/* THE CHECK STAMP IS A CLOCK, AND TWO STEPS PINNED ON ONE MINUTE OF IT. `Checked just now` is a
   RELATIVE label with a 60-second life, so a slow run reached `brand-skip` after the card had
   rolled to "Checked 1 minute ago" and went red on a build with nothing wrong with it — then the
   `card` step's locator waited 30s for the same gone string and killed the run (review's own run
   2, 2026-09-09). What both steps mean is "this run's probe stamped it", which is what this
   matches; the freshness is not the claim either of them is making. */
const CHECKED = /Checked (just now|\d+ (minute|hour)s? ago)/

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

/* THE POOLER, READ-ONLY. `vault` and `private` answer 404 over PostgREST (§21j), so this is the
   only way to see either — the same connection shape the app itself opens (`server/ghost-admin/
   db.ts`): transaction pooler, one connection, no prepared statements. MOSTLY READ-ONLY: two steps
   write through it — `moved-domains` seeds the old record and `keys-token`'s `finally` nulls a ref
   the run may have left behind — and the line that claimed "nothing here writes" was false from the
   day the first of them landed (review, 2026-09-09). Fixture writes only, on the throwaway user's
   own rows; nothing here writes anything a customer owns. */
const sql = postgres(process.env.PG_URL, {
  max: 1, prepare: false, ssl: 'require', connect_timeout: 10, idle_timeout: 20,
})
const secretsBehind = async (ref) =>
  ref ? (await sql`select count(*)::int as n from vault.secrets where id = ${ref}`)[0].n : -1
const refOf = async (siteId) => {
  const rows = await sql`select admin_key_vault_ref from private.site_credentials where site_id = ${siteId}`
  return rows[0] ? rows[0].admin_key_vault_ref : null
}

/* PostgREST with the SERVICE ROLE — how the wire is read between two UI steps, and how the two
   fixture states no UI can yet produce are made: a DISCONNECTED record (Story 3.5's Disconnect does
   not exist) and a PRO entitlement (Epic 12's billing does not). It never stands in for a user:
   every claim about what a USER may do is made through that user's own session. */
const wire = async (path) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
const patch = async (path, body) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    method: 'PATCH',
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
/* One INSERT under the service role, for the one fixture state that has no UI and no probe: a
   site row with no credential behind it. */
const insert = async (path, body) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    method: 'POST',
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
const rowsOf = async (select = 'id') => (await wire(`/sites?user_id=eq.${USER_ID}&select=${select}`)).body || []
/* STORY 3.4: the projects "Use your brand" writes, in the dashboard's own order. Read through the
   SERVICE ROLE, like every other wire read here — what a USER may do is still only ever driven
   through that user's own session, in the browser. */
const projectsOf = async () => (await wire(
  // `id` BREAKS THE TIE, as it does in S2c, in `useBrand` and on the dashboard: two rows with the
  // same `updated_at` come back in an arbitrary order, and a step that compares two reads of this
  // list then fails on the ORDER rather than on a change. Propagated here at the second review
  // (2026-09-08) — the app's three readers were fixed and the harness's own reader was missed,
  // which is standing rule 7 exactly ("a propagation list cannot audit itself").
  `/projects?user_id=eq.${USER_ID}&select=id,name,slug,style_pack,linked_site_id&order=updated_at.desc,id.desc`)).body || []
/* THE SAME LIST, KEYED BY ID: what `brand-ownership` actually asks is "did anything about the
   caller's projects change", which is a question about the ROWS and not about the order PostgREST
   returned them in. Sorting by id before comparing makes the assertion say what it means, and the
   step prints both sides when they differ so a real change names itself rather than hiding behind
   a boolean (review 2, 2026-09-08 — this comparison failed once on a run where nothing had
   written, and a boolean could not say why). */
const projectsById = (rows) => JSON.stringify([...rows].sort((a, b) => (a.id < b.id ? -1 : 1)))
/* A hex as `getComputedStyle` reports it, so "the card is painted in the site's accent" is read
   off the RENDERED card rather than off the class attribute. */
const rgbOf = (hex) => {
  /* A SITE CAN QUALIFY ON ITS LOGO OR ITS MENU ALONE — `hasBrand` is an OR — so the accent can be
     null on a row S2c really draws. This used to throw and take the whole run down as an opaque
     `browser` failure rather than failing the step that asked (review 3, 2026-09-08). */
  if (typeof hex !== 'string' || hex === '') return null
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return `rgb(${[0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(', ')})`
}
/* The fixture's audit rows, by id: a step that must make NO Ghost call proves it by the count. */
const readAudit = () => sql`select id from private.credential_audit where user_id = ${USER_ID}`
/* Story 3.3: the DECRYPT path's own rows. `call()` writes one `vault_decrypt` per decryption in
   the same statement as the read (`ghost-admin/index.ts:181-203`), so a decryption that went
   unrecorded is not a thing that can happen — this counts them. */
const readAuditRows = () => sql`
  select action::text as action, site_id, outcome, detail
    from private.credential_audit
   where user_id = ${USER_ID}
   order by occurred_at, id
`

/* `site_settings` is one jsonb column and PostgREST PATCH replaces the WHOLE of it, so a fixture
   state is read-merge-written rather than written — otherwise seeding `plan_ask` would silently
   delete the `public_url` the card links to. Story 3.3's four blocks are each seeded this way,
   on the throwaway user's OWN row, through the service role: 3.2's `disconnected_at` fixture is
   the precedent, and the states below are ones no UI can yet produce (a Ghost that hides
   `portal_button`, and a Ghost(Pro) plan — ⛔ §4 T4, no such site exists). */
const patchSettings = async (siteId, extra) => {
  const rows = (await wire(`/sites?id=eq.${siteId}&select=site_settings`)).body || []
  const merged = { ...((rows[0] || {}).site_settings || {}), ...extra }
  for (const [key, value] of Object.entries(extra)) if (value === undefined) delete merged[key]
  return patch(`/sites?id=eq.${siteId}`, { site_settings: merged })
}

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/* What `GET /admin/site/` answers WITH NO KEY (§38a) — the title and public url the card must show. */
const publicSite = async (ghost) =>
  fetch(`${ghost.url}/ghost/api/admin/site/`).then((r) => r.json()).then((j) => j.site || {}).catch(() => ({}))

// axe-core at WCAG 2.1 AA, at BOTH widths — the card goes one column at 390 and a violation that
// only exists there is still a violation. `evaluate` and not `addScriptTag`: the app serves a
// per-session CSP with no `unsafe-inline`, which blocks an injected <script>.
const AXE_SOURCE = process.env.AXE_PATH ? require('fs').readFileSync(process.env.AXE_PATH, 'utf8') : null
/* `atWidth` IS STORY 3.5's, and it exists because a POPOVER cannot survive a resize: `lib/menu.ts`
   writes the trigger's rect as FIXED coordinates at the moment of the click, so a menu opened at
   1440 and measured at 390 is being audited where it will never be. The hook reopens it at each
   width, which is the only way "axe at 1440 and 390 on the menu" means anything. Every other
   caller passes nothing and is unchanged. */
const axeAt = async (page, label, atWidth) => {
  if (!AXE_SOURCE) return record(`axe-${label}`, 'axe-core not on this machine — not run')
  const found = []
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    if (atWidth) await atWidth(width)
    await page.evaluate(AXE_SOURCE)
    const r = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }))
    for (const v of r.violations) found.push(`${width}: ${v.id} x${v.nodes.length}`)
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (wide) found.push(`${width}: horizontal scroll`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  step(`axe-${label}`, found.length === 0,
       found.length === 0 ? 'zero violations at WCAG 2.1 AA, 1440 and 390; no horizontal scroll'
                          : found.join(', '))
}

/* A sentence with its `%s` hole taken out: the harness matches the halves it can be sure of
   rather than rebuilding the app's own interpolation. `within` narrows it to one region. */
const says = async (page, text, within = page) => {
  for (const part of text.split('%s').map((p) => p.trim()).filter(Boolean)) {
    if (!(await within.getByText(part, { exact: false }).first().isVisible().catch(() => false))) return false
  }
  return true
}

/* THE WIZARD'S OWN FORM, and every locator below is scoped to it. The shell around the page carries
   two more forms (Sign out, desktop and mobile) with their own submit buttons, and a Next form whose
   `action` is a server action carries HIDDEN inputs of its own — executed on the deployed site,
   2026-09-08: `form input` counted 9 and `form button[type="submit"]` matched three, and the run
   failed on the harness rather than on the product. */
const WIZARD = 'form:has(#s2b-api-url)'

const fill = async (page, url, adminKey, contentKey) => {
  await page.fill('#s2b-api-url', url)
  await page.fill('#s2b-admin-key', adminKey)
  await page.fill('#s2b-content-key', contentKey)
}
const submit = (page) => page.locator(`${WIZARD} button[type="submit"]`).click()
const errorAt = (page, field) => page.locator(`#s2b-${field}-error`)
const sheet = (page) => page.locator('dialog[open]')
/* TWO of these are drawn on the empty screen — the top bar's and the centred one, as Projects
   draws both (UX-DR6) — and one of the two is hidden behind the `tablet:` seam on the list. So
   the locator is the VISIBLE ones: `.count()` is then "how many can be pressed here". */
const opener = (page) => page.locator('a[href="/sites/connect"]:visible', { hasText: 'Connect site' })
const bar = (page) => page.locator('div:has(> form[role="search"])').first()
const boxOf = async (locator) => (await locator.boundingBox()) || { x: -1, y: -1, width: -1, height: -1 }

/* STORY 3.4 — S2c. A CONNECT WHOSE SITE HAS A BRAND NOW LANDS HERE and not on the list, and both
   test servers answer an accent and a menu (§40), so this is the LIVE path for every connect in
   this run rather than a branch. `skipS2c` presses **Skip**, which writes nothing and returns to
   `/sites`; the steps that only need a site connected use it to get back to where they were. */
const s2cHeading = (page) => page.getByRole('heading', { name: SAY.brand_title })
const skipS2c = async (page) => {
  await s2cHeading(page).waitFor()
  const landed = page.url()
  // `exact`, because the shell's own skip-to-content control is a LINK named "Skip to content".
  await page.getByRole('button', { name: SAY.brand_skip, exact: true }).click()
  // `!brand`: pressed inside the popup the pathname is ALREADY `/sites`, so a bare pathname wait
  // returned at once and every read after it raced the action (review 7, 2026-09-10).
  await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
  return landed
}
const same = (a, b) => Math.abs(a - b) < 0.5

/* `--shots`: each surface at the three widths the spec names, for the frame comparison. Assertion-free. */
const SHOTS = process.env.SHOTS_DIR || ''
const shoot = async (page, name) => {
  if (!SHOTS) return
  for (const width of [1440, 834, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.screenshot({ path: `${SHOTS}/${name}-${width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  context.setDefaultNavigationTimeout(NAV_TIMEOUT)
  const page = await context.newPage()

  /* ONE RETRY ON A NAVIGATION THAT TIMED OUT, AND IT IS COUNTED SO IT CANNOT HIDE.
     Seven review runs on 2026-09-08 each lost exactly one navigation out of ~50 to the 60s
     timeout, every time on an AUTHED route (`/sites`, `/sites/connect`, S2c, the not-found
     path), every time at a different point, and never twice in the same place. Everything
     measurable was healthy at the time: PostgREST 0.25s, GoTrue 0.2-0.8s, the transaction
     pooler 152ms with 19 backends and nothing idle-in-transaction, the edge answering /sites
     in 0.35s ten times in a row, no rate-limit or challenge header, and the local DNS stub
     resolving 150/150. The control that would have settled whether it is this deployment —
     the same run against the previous one — CANNOT be driven: a preview URL cannot carry the
     magic-link sign-in, so it failed at the first browser step and proves nothing.
     So this is NOT a diagnosis, it is a retry: `waitUntil` and every timeout are unchanged, a
     second attempt is made only after a timeout, and `navRetries` is printed with the result.
     A run that needed retries is a run that says so. DW-68 carries the open question.
     ponytail: a counted retry, not a re-plumbing. Delete it the day the cause is known. */
  let navRetries = 0
  /* IT WRAPS EVERY WAY THIS RUN NAVIGATES, NOT ONLY `goto`. The first version wrapped `goto`
     alone, and the review's own four consecutive runs then failed three times — every one of
     them on a `waitForURL` after a form submission, which the wrapper never saw, so `navRetries`
     stayed 0 and the run died rather than riding over the hang it was written for. The class
     DW-68 describes is wider than one method (review, 2026-09-08). `waitForURL` and `reload` are
     both safe to repeat: the first resolves at once if the navigation has since landed, and the
     second is a fresh GET of a page this run only ever reads. */
  const retrying = (name) => {
    const raw = page[name].bind(page)
    page[name] = async (...args) => {
      try {
        return await raw(...args)
      } catch (e) {
        if (!/Timeout .* exceeded/.test(String(e && e.message))) throw e
        navRetries += 1
        /* `waitForURL` takes a PREDICATE, and printing it printed the function's source into the
           note — the one line a reader goes to after a hang (review 3, 2026-09-08). */
        const what = typeof args[0] === 'function' ? '<predicate>' : (args[0] ?? '')
        console.log(`  note: page.${name}(${what}) timed out; retrying once (retry ${navRetries})`)
        return await raw(...args)
      }
    }
  }
  for (const name of ['goto', 'waitForURL', 'reload']) retrying(name)

  // Every POST the page makes, and every body it received. The first is how "nothing left the
  // browser" is PROVED rather than assumed; the second is the no-secret-leak sweep's input.
  let posts = 0
  const bodies = []
  page.on('request', (r) => { if (r.method() === 'POST') posts += 1 })
  page.on('response', async (r) => {
    if (!r.url().startsWith(APP)) return
    const body = await r.text().catch(() => '')
    if (body) bodies.push(body)
  })
  const sent = async (fn) => { const before = posts; await fn(); return posts - before }

  /* WAIT FOR THE DATABASE, NEVER FOR THE DOM TO BLINK. A `<form action={serverAction}>` button's
     click resolves the moment the POST leaves, and React detaches and re-renders the row while the
     action is still running — so a `waitFor({ state: 'hidden' })` can resolve on the re-render
     rather than on the write. Run 2 of Story 3.3's Dev harness caught exactly that: "Got it" had
     visibly gone from the card while `code_injection_notice_shown_at` was still null, and the next
     step's navigation was racing the same POST. Every one of the four answer actions below waits
     on the row it wrote. */
  const until = async (read, deadline = 20000) => {
    const stop = Date.now() + deadline
    for (;;) {
      const value = await read()
      if (value) return value
      if (Date.now() > stop) return null
      await page.waitForTimeout(300)
    }
  }

  const [T1, T3] = GHOSTS
  const short = (v) => v.split('.').slice(0, 2).join('.')
  let t1SiteId = null
  let t3SiteId = null
  const refs = []

  try {
    await page.goto(CONFIRM, { waitUntil: 'load' })

    // ── `/sites` WITH NOTHING CONNECTED IS AN EMPTY SCREEN — the owner's finding 7 (2026-09-08),
    //    and the words and the drawing are his rulings at Questions 5 and 6. It used to BE the
    //    handshake (EXPERIENCE.md:318, amended with this story); the handshake is now behind the
    //    button, in the sheet, and at `/sites/connect` for a browser with no JavaScript.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.empty_title).waitFor()
    const drawing = await page.locator('main svg[aria-hidden="true"]').count()
    const openers = await opener(page).count()
    // THE SHEET IS RENDERED ON THIS PAGE — closed — because its button is what opens it, so the
    // key fields are PRESENT and hidden rather than absent. Visibility is the question the owner
    // asked ("show an empty screen"), and it is the one asked here (run 1 of the Fix failed on a
    // `.count() === 0` that was the harness's mistake, not the product's — the same lesson as
    // Review's run 1).
    const fieldsShown = await page.locator('#s2b-api-url').isVisible()
    const handshakeShown = await page.getByText('First, a quick handshake.').isVisible().catch(() => false)
    step('first-run',
      await says(page, SAY.empty_sub) && drawing >= 1 && openers === 2
      && handshakeShown === false && fieldsShown === false,
      `the empty screen: ${JSON.stringify(SAY.empty_title)} over ${JSON.stringify(SAY.empty_sub)}, a drawing ` +
      `(${drawing} aria-hidden svg), ${openers} "Connect site" buttons (the bar's and the centred one, as ` +
      `Projects draws both), and NOTHING of the handshake on screen: its headline visible = ` +
      `${handshakeShown}, the key fields visible = ${fieldsShown} (the closed sheet holds them)`)

    // ── THE TOP BAR IS THE SHELL'S, as Projects' is (his finding 5, amended): the field on the
    //    left, "Connect site" on the right, the frame's 1px rule under both — and NO BELL, which
    //    is Story 13.4's and which he ruled out of this story at Question 4.
    const field = page.locator('input[name="q"]:visible')
    const placeholder = await field.getAttribute('placeholder').catch(() => null)
    const rule = await bar(page).evaluate((el) => {
      const s = getComputedStyle(el)
      return { border: s.borderBottomWidth, height: el.getBoundingClientRect().height }
    }).catch(() => ({ border: 'none', height: 0 }))
    const inBar = await bar(page).locator('a, button').count()
    const bells = await page.locator('[aria-label*="otification" i], [aria-label*="ell" i]').count()
    step('sites-bar',
      placeholder === 'Search sites…' && rule.border === '1px' && Math.round(rule.height) === 64
      && inBar === 1 && bells === 0,
      `a ${Math.round(rule.height)}px bar with a ${rule.border} rule under it, the field placeholder ` +
      `${JSON.stringify(placeholder)} — the frame's own (S11a :52) — ${inBar} control beside it ` +
      `("Connect site"), and ${bells} bells anywhere on the page (Story 13.4's, ruled out at Question 4)`)
    await axeAt(page, 'empty')
    await shoot(page, 's11-empty')

    // ── THE EMPTY SCREEN'S BUTTON OPENS THE SHEET (the last line of his finding 7), and the sheet
    //    IS ONE SIZE AT BOTH STEPS (his findings 1 and 2). Measured on the deployed site before
    //    the fix: 520×665.7 at step 1, 520×608.5 at step 2 — it shrank 57px and its top edge swept
    //    28.6px down the page, which is the card he saw appear behind it. Both panes now share one
    //    grid cell, so the box cannot move.
    await opener(page).last().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    const shot = page.locator('dialog[open] img[src="/connect/integration.png"]')
    // The picture is served, not a broken <img> behind an alt: the app host rewrites every path
    // it sees onto /app/…, so a public/ folder outside the proxy matcher would 404 in silence.
    const shotOk = await shot.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
    const box1 = await boxOf(sheet(page))
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    const box2 = await boxOf(sheet(page))
    // …and at 390, where the sheet is the viewport's width and the owner's step 12 looks
    // (review 2, 2026-09-08): back to step 1, measure, forward, measure.
    await page.setViewportSize({ width: 390, height: 844 })
    await sheet(page).locator('a[href="?step=integration"]', { hasText: 'Back' }).click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]:visible')
    const narrow1 = await boxOf(sheet(page))
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    const narrow2 = await boxOf(sheet(page))
    await page.setViewportSize({ width: 1440, height: 900 })
    const sameBox = (a, b) => same(a.width, b.width) && same(a.height, b.height) && same(a.x, b.x) && same(a.y, b.y)
    step('same-size',
      shotOk && sameBox(box1, box2) && sameBox(narrow1, narrow2),
      `the empty screen's own button opened the sheet with the integration screenshot served = ${shotOk}; ` +
      `the box is ${box1.width}×${box1.height} at (${box1.x}, ${box1.y}) at step 1 and ` +
      `${box2.width}×${box2.height} at (${box2.x}, ${box2.y}) at step 2 at 1440, and ` +
      `${narrow1.width}×${narrow1.height} then ${narrow2.width}×${narrow2.height} at 390 — nothing behind it is uncovered`)

    // ── "Where do I find these?" IS A LINK, NOT A DROPDOWN (his finding 3). The frame draws a
    //    bordered box with a chevron (S2 Onboarding.dc.html:135-138) and he read it as a select
    //    that would not open. It is now his words as a subtle link at the top right of the step,
    //    above the fields — a deliberate departure from the frame, and still the same
    //    `<a href="?step=integration">` that works with JavaScript off.
    const find = sheet(page).getByText('Where do I find these?')
    const shape = await find.evaluate((el) => {
      const a = el.closest('a')
      const s = a ? getComputedStyle(a) : null
      return { tag: a ? 'A' : el.tagName, href: a ? a.getAttribute('href') : null,
               border: s ? s.borderTopWidth : 'n/a', chevrons: a ? a.querySelectorAll('svg').length : -1 }
    })
    const findBox = await boxOf(find)
    const urlBox = await boxOf(sheet(page).locator('#s2b-api-url'))
    step('find-link',
      shape.tag === 'A' && shape.href === '?step=integration' && shape.border === '0px'
      && shape.chevrons === 0 && findBox.y < urlBox.y && findBox.x > box2.x + box2.width / 2,
      `it is an <${shape.tag} href=${JSON.stringify(shape.href)}> with a ${shape.border} border and ` +
      `${shape.chevrons} chevrons — a link, not the frame's bordered box — sitting above the fields ` +
      `(y ${Math.round(findBox.y)} < ${Math.round(urlBox.y)}) and on the right of the step`)
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})

    // ── THE FULL-PAGE PAIR, which is where the "Connect site" LINK goes with JavaScript off.
    await page.goto(`${APP}/sites/connect`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    const numbered = await page.locator('ol li').count()
    const nextLink = page.locator('a[href="?step=keys"]:visible', { hasText: 'Done — next' })
    const pageShot = await page.locator('img[src="/connect/integration.png"]')
      .evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
    const pageBox1 = await boxOf(page.locator('main div.bg-surface').first())
    const backHref = await page.locator('a:visible', { hasText: /^Back$/ }).first().getAttribute('href').catch(() => null)
    step('handshake',
      (await page.locator('text=1/2').count()) > 0 && numbered === 3 && pageShot
      && (await nextLink.count()) === 1 && backHref === '/sites',
      `S2b·1 on its own route: "1/2", ${numbered} numbered steps, the screenshot served = ${pageShot}, ` +
      `Back is <a href=${JSON.stringify(backHref)}> and "Done — next" is a link`)
    await shoot(page, 's2b1')

    await nextLink.click()
    await page.waitForSelector('#s2b-content-key')
    // The VISIBLE fields: a server-action form carries hidden `$ACTION_*` inputs of its own.
    const fields = await page.locator(`${WIZARD} input:not([type="hidden"])`).count()
    const required = await page.locator(`${WIZARD} input[required]`).count()
    const token = await page.locator('text=/staff access token/i').count()
    // The full-page pair jumped the same way the sheet did — 480×694.7 then 560×661, because the
    // frame draws step 1 at 480 and step 2 at 560. One card, one size, both steps (finding 1).
    const pageBox2 = await boxOf(page.locator('main div.bg-surface').first())
    step('keys-step',
      fields === 3 && required === 3 && token === 0 && (await page.locator('text=Where do I find these?').count()) === 1
      && same(pageBox1.width, pageBox2.width) && same(pageBox1.height, pageBox2.height),
      `S2b·2 shows ${fields} fields (API URL, Admin API key, Content API key), ${required} of them required, ` +
      `"Where do I find these?" at the top right, and mentions the Staff Access Token ${token} times ` +
      `(FR-C1: never here); the page card is ${pageBox1.width}×${pageBox1.height} at step 1 and ` +
      `${pageBox2.width}×${pageBox2.height} at step 2`)
    await shoot(page, 's2b2')

    // ── The `http://` warning, as the field is typed into and before anything is submitted.
    const typedHttp = await sent(async () => {
      await page.fill('#s2b-api-url', T3.url.replace('https://', 'http://'))
      await page.waitForSelector('#s2b-api-url-hint')
    })
    step('http-warned',
      await says(page, SAY.http_warning, page.locator('#s2b-api-url-hint')) && typedHttp === 0,
      `the warning under the field is the app's own HTTP_WARNING, shown as it is typed, and ${typedHttp} POSTs left the page`)

    // ── PROGRESSIVELY ENHANCED. The keys form is `<form action={serverAction}>` fed to
    //    `useActionState`, so React 19 renders it for a scripts-off submit: `method=post`, an
    //    `action` attribute that posts to the page itself, and the encoded `$ACTION_*` hidden
    //    fields a no-JS POST carries to reach the server action. This asserts that WIRING (what
    //    the story controls); whether the AUTHED SHELL paints the wizard visibly with scripts off
    //    is a separate, pre-existing shell question — the fields render in the HTML but compute a
    //    zero box without hydration (executed, Review 2) — recorded as DW-56 and owed a manual
    //    check, not this story's to fix.
    const njForm = page.locator(WIZARD)
    const njMethod = (await njForm.getAttribute('method')) || ''
    const njAction = await njForm.getAttribute('action')
    const njHidden = await page.locator(`${WIZARD} input[type="hidden"]`).evaluateAll((els) => els.map((e) => e.name))
    const njPE = njHidden.filter((n) => n.startsWith('$ACTION'))
    step('js-off',
      njMethod.toLowerCase() === 'post' && njAction !== null && njPE.length > 0,
      `the keys form is a progressively-enhanced server action: method=${JSON.stringify(njMethod)}, an action ` +
      `attribute present (${JSON.stringify(njAction)}, posts to the page), and React's ${njPE.length} ${JSON.stringify(njPE)} ` +
      `hidden field(s) a scripts-off POST carries. (Whether the authed shell paints it visibly without JS is ` +
      `DW-56, a shell question, not this story's.)`)

    // ── A plain-http address SUBMITTED. The field warned as it was typed; the customer submits
    //    anyway. The browser skips its Content-key check (`skipped_http`) and the server's own call
    //    carries the key — the deployed function receives a 301 to https (read off the audit below,
    //    Review 2: the 301 is what the Vercel function's own fetch gets, and `redirect: 'manual'`
    //    never follows it) and answers `ghost_redirected`. A plain-http address NEVER connects a
    //    site. (Until this review the submit itself silently did nothing — the dead-button fix.)
    await fill(page, T3.url.replace('https://', 'http://'), T3.adminKey, T3.contentKey)
    const httpPosted = await sent(async () => {
      await submit(page)
      await page.waitForSelector('text=sent us somewhere else', { timeout: 30000 }).catch(() => {})
    })
    const httpShown = await says(page, SAY.ghost_redirected)
    const afterHttp = await rowsOf()
    step('http-connect',
      httpPosted >= 1 && httpShown && afterHttp.length === 0,
      `a plain-http address is warned then submittable; ${httpPosted} POST(s) left the page, the deployed ` +
      `function received a 301 and answered ghost_redirected ("Your site sent us somewhere else…") = ${httpShown}, ` +
      `and NO site connected (${afterHttp.length} rows) — the audit step reads the 301 off the wire`)

    // ── A malformed Admin key: refused before Vault AND before the network — and the OTHER two
    //    fields keep what was typed. React resets a form after its action, so the wizard holds its
    //    values as state (review, 2026-09-08).
    await fill(page, T1.url, 'abc', T1.contentKey)
    await submit(page)
    await errorAt(page, 'admin-key').waitFor()
    const afterMalformed = await rowsOf()
    const keptUrl = await page.inputValue('#s2b-api-url')
    const keptContent = await page.inputValue('#s2b-content-key')
    step('malformed',
      await says(page, SAY.credential_malformed) && afterMalformed.length === 0
      && keptUrl === T1.url && keptContent === T1.contentKey,
      `the field says what a key looks like; the wire shows ${afterMalformed.length} sites rows; the URL ` +
      `and Content key fields kept what was typed = ${keptUrl === T1.url && keptContent === T1.contentKey}`)

    // ── NOT A URL: "orbit weekly" is a typo, not a site that did not answer, and the two never
    //    share a sentence — under the URL field, and no Ghost call made (review 2, 2026-09-08).
    const auditBeforeTypo = (await readAudit()).length
    await fill(page, 'orbit weekly', T1.adminKey, T1.contentKey)
    await submit(page)
    await errorAt(page, 'api-url').waitFor()
    const afterTypo = await rowsOf()
    const auditAfterTypo = (await readAudit()).length
    step('not-a-url',
      await says(page, SAY.url_invalid) && afterTypo.length === 0 && auditAfterTypo === auditBeforeTypo,
      `url_invalid's sentence is under the URL field, the wire shows ${afterTypo.length} sites rows, and the ` +
      `audit grew by ${auditAfterTypo - auditBeforeTypo} rows — Ghost was never called`)

    // ── UNREACHABLE: a host that does not exist. The browser's own check fails and lets the
    //    submit through, and the deployed function's fetch is what answers, naming the host.
    await fill(page, 'https://nonexistent.inflozo.com', T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector("text=We couldn't reach nonexistent.inflozo.com", { timeout: 45000 })
    const afterUnreachable = await rowsOf()
    step('unreachable',
      await says(page, SAY.ghost_unreachable.replace('%s', 'nonexistent.inflozo.com')) && afterUnreachable.length === 0,
      `ghost_unreachable's sentence names the host in the banner and the wire shows ${afterUnreachable.length} sites rows`)

    // ── A key of the right shape whose `kid` Ghost never issued (§37).
    await fill(page, T1.url, BOGUS, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Ghost said no')
    const afterBogus = await rowsOf()
    step('bogus-key',
      await says(page, SAY.ghost_unknown_key) && afterBogus.length === 0,
      `ghost_unknown_key's sentence is shown and the wire shows ${afterBogus.length} sites rows`)

    // ── The Content API key, checked IN THE BROWSER (§38b): a 401 stops the submit dead.
    await fill(page, T1.url, T1.adminKey, T1.contentKey.slice(0, -1) + (T1.contentKey.endsWith('a') ? 'b' : 'a'))
    const posted = await sent(async () => {
      await submit(page)
      await errorAt(page, 'content-key').waitFor()
    })
    step('content-wrong-key',
      await says(page, SAY.content_key_unknown) && posted === 0,
      `Ghost's 401 on the Content API is shown under the field, and ${posted} POSTs left the page ` +
      '— the server action was never called')

    // ── T1, for real. The card's title and address are what `GET /admin/site/` answers (§38a),
    //    the address is a link to the PUBLIC url, and "Checked just now" is stamped by that read.
    const pub1 = await publicSite(T1)
    // Typed as a BARE HOST — the matrix's "Bare host typed" row: normalised to the https origin
    // before anything is called, and that origin is what the row stores (review 2, 2026-09-08).
    await fill(page, T1.url.replace(/^https:\/\//, ''), T1.adminKey, T1.contentKey)
    await submit(page)
    // STORY 3.4: THE CONNECT NOW LANDS ON S2c, because T1's settings carry an accent and a menu.
    await s2cHeading(page).waitFor()
    const landedOn = page.url()
    const rows = await rowsOf('*')
    const row = rows[0] || {}
    t1SiteId = row.id || null
    const ref1 = t1SiteId ? await refOf(t1SiteId) : null
    const present = row.credentials_present || {}
    const cardOf = (title) => page.locator('article', { hasText: title })
    step('connect',
      rows.length === 1 && row.url === T1.url && row.ghost_version === T1.version && Boolean(row.content_key)
      && row.title === pub1.title && (row.site_settings || {}).public_url === pub1.url
      && Boolean(row.settings_read_at) && present.content === true && present.admin === true
      && present.staff === false && Boolean(ref1) && (await secretsBehind(ref1)) === 1
      && landedOn.replace(/\?.*$/, '') === `${APP}/sites/brand`
      && landedOn.includes(`site=${t1SiteId}`),
      `${rows.length} row: url ${row.url} from a bare host, ghost_version ${row.ghost_version}, content_key stored = ${Boolean(row.content_key)}, ` +
      `title ${JSON.stringify(row.title)} and site_settings.public_url ${(row.site_settings || {}).public_url} ` +
      `both as GET /admin/site/ answers them, ` +
      `settings_read_at set = ${Boolean(row.settings_read_at)}, credentials_present ${JSON.stringify(present)}, ` +
      `a site_credentials row with a ref = ${Boolean(ref1)}, vault.secrets rows behind it = ${await secretsBehind(ref1)}; ` +
      `and the browser landed on ${landedOn} — S2c, naming the site it just read, not the list (Story 3.4)`)

    // ── S2c ON THE DEPLOYED SITE (`S2 Onboarding.dc.html:150-196`), read against the ROW the probe
    //    just wrote — so "the screen shows what we stored" is one assertion and not two beliefs.
    const brandRead = (row.site_settings || {}).brand || {}
    const s2c = await page.locator('main').innerText().catch(() => '')
    const saidOn = (text) => s2c.toLowerCase().includes(String(text).toLowerCase())
    // The swatch's caption is THE HEX, not a colour name: the frame prints "Burnt orange" and
    // Ghost answers a hex and nothing else (§40), so naming one would assert what was not read.
    const swatch = await page.locator('main [style]').evaluateAll(
      (els, want) => els.some((el) => getComputedStyle(el).backgroundColor === want),
      rgbOf(brandRead.accent))
    const pills = await page.locator('main ul li').allInnerTexts().catch(() => [])
    const navMatches = (brandRead.nav || []).every((item) => pills.includes(item.label))
    // NO PILL IS A LINK: the frame draws text, and an href off a value read from someone's Ghost
    // is an attribute this screen has no reason to write.
    const pillLinks = await page.locator('main ul li a').count()
    /* THE LOGO SLOT, AND IT HAD NO LIVE PROOF OF EITHER OUTCOME. §40 records `logo` as an EMPTY
       STRING on both majors, so `brandOf` stores null and the branch this run always renders is
       the monogram tile — the `<img>` half is proved by `probe-rule.test.ts` alone and cannot be
       driven from here, because writing a logo to a test Ghost is an Admin WRITE and this story
       makes none ("Ask First"). So assert the branch that is live, by the row rather than by a
       constant: the tile carries the first CODE POINT of the site's own Ghost title, uppercased,
       and no image is drawn beside it (review 3, 2026-09-08). */
    const firstCp = (Array.from(String(row.title || ''))[0] || '').toUpperCase()
    const imgs = await page.locator('main img').count()
    const spans = await page.locator('main span').allInnerTexts().catch(() => [])
    const logoSlot = brandRead.logo
      ? imgs === 1
      : imgs === 0 && spans.some((t) => t.trim() === firstCp)
    /* THE OWNER'S ASK OF 2026-09-10, ITEMS 2 AND 3, and both are read off the DOM rather than off
       the words: "Make the URL on left side an anchor link and show a new tab icon. On clicking it
       should open in a new tab" and "Add a cross button too which will close the popup."

       THE ADDRESS IS THE SITE'S OWN and never a menu entry — `pillLinks === 0` above is the other
       half of that and stays true. It is the PUBLIC url (`public_url || url`), which on Ghost(Pro)
       is not `sites.url`, so it is compared against what `GET /admin/site/` answered. */
    const addressLink = await page.locator('main a[target="_blank"]').evaluateAll((all, want) =>
      all.filter((a) => a.getAttribute('href') === want)
        .map((a) => ({ rel: a.getAttribute('rel') || '', svgs: a.querySelectorAll('svg').length })),
      pub1.url || T1.url)
    const closeControl = await page.locator(`main a[href="/sites"][aria-label]`).evaluateAll((all, word) =>
      all.filter((a) => a.getAttribute('aria-label') === word).length, SAY.brand_close)
    step('brand-screen',
      saidOn(SAY.brand_title) && (await says(page, SAY.brand_sub.replace('%s', new URL(pub1.url || T1.url).host)))
      && saidOn(SAY.brand_site_today) && saidOn(SAY.brand_accent) && saidOn(brandRead.accent)
      && saidOn(SAY.brand_navigation) && navMatches && pillLinks === 0 && logoSlot
      && saidOn(SAY.brand_fonts) && saidOn(SAY.brand_homepage)
      && saidOn(SAY.brand_use) && saidOn(SAY.brand_skip)
      && saidOn(SAY.brand_will_create) && swatch
      && addressLink.length === 1 && addressLink[0].rel.includes('noreferrer') && addressLink[0].svgs === 1
      && closeControl === 1,
      `S2c against the row: accent ${brandRead.accent} captioned as the HEX (the frame's colour ` +
      `NAME is the one departure) and painted on the swatch = ${swatch}; the menu ` +
      `${JSON.stringify((brandRead.nav || []).map((n) => n.label))} drawn as ${pills.length} text ` +
      `pill(s) with ${pillLinks} links; "Your site today", "Fonts stay yours", "Your homepage, ` +
      `already wearing your brand.", both buttons, and the caption ${JSON.stringify(SAY.brand_will_create)} ` +
      `— this account has no project yet, so the screen says one will be MADE. The logo slot: ` +
      `the row's logo is ${JSON.stringify(brandRead.logo ?? null)}, so the LIVE branch is the ` +
      `monogram tile carrying ${JSON.stringify(firstCp)} with ${imgs} image(s) beside it = ${logoSlot}. ` +
      `HIS ASK OF 2026-09-10: the site's address is ${addressLink.length} link with target=_blank, ` +
      `rel=${JSON.stringify((addressLink[0] || {}).rel)} and ${(addressLink[0] || {}).svgs} new-tab ` +
      `glyph — pointing at the PUBLIC url, while the menu pills stay text with ${pillLinks} links; ` +
      `and there are ${closeControl} ✕ controls named ${JSON.stringify(SAY.brand_close)} going to /sites`)

    /* ── THE TWO SLOTS ON S2c THAT NO RUN HAS EVER RENDERED, and the stated reason for one of
       them was wrong. The `<img>` half of the logo slot is the branch MOST REAL CUSTOMERS get —
       a Ghost site with a logo — and it had been left "unit-proved only" because writing a logo
       to a test Ghost is an Admin write this story does not make. But nothing here needs Ghost:
       `brand-none` below already drives S2c off a PATCHED FIXTURE ROW through the service role,
       which is a Supabase write and not a Ghost one, and the same handle reaches the logo. The
       failure line is the same shape of gap from the other end — `useBrand`'s failure branches
       all redirect to `&failed=1` and the sentence they redirect to was asserted by
       `BRAND_COPY.failed.length > 0` and by nothing else, at any level (review 4, 2026-09-09).
       Both restore in a `finally`, as `brand-none` does. */
    let logoShot, failedShown, failedAbsent
    const LOGO = 'https://ghost6.inflozo.com/content/images/size/w256h256/inflozo-review-4.png'
    try {
      await patchSettings(t1SiteId, { brand: { ...brandRead, logo: LOGO } })
      await page.goto(landedOn, { waitUntil: 'load' })
      await s2cHeading(page).waitFor()
      logoShot = await page.locator('main img').evaluateAll((els) => els.map((el) => el.getAttribute('src')))
      // NO MONOGRAM BESIDE IT: the two are one slot and drawing both would be the bug.
      const tiles = await page.locator('main span').allInnerTexts().catch(() => [])
      logoShot = { srcs: logoShot, tile: tiles.some((t) => t.trim() === firstCp) }
    } finally {
      await patchSettings(t1SiteId, { brand: brandRead })
    }
    // `logoShot?.` AND NOT `logoShot.`: it is assigned INSIDE the try, so anything that threw
    // between the patch and the read — a navigation timeout, DW-68's own 30-60s hang — reached
    // this line undefined and died as a TypeError reported as the opaque `browser` step, hiding
    // which assertion was even being made. A red `brand-logo` names itself (review 5, 2026-09-09).
    step('brand-logo',
      logoShot?.srcs.length === 1 && logoShot.srcs[0] === LOGO && logoShot.tile === false,
      `with an https: logo on the row S2c drew ${logoShot?.srcs.length} image(s) ` +
      `${JSON.stringify(logoShot?.srcs)} and the monogram tile ${logoShot?.tile ? 'AS WELL' : 'not at all'} ` +
      `— the branch a customer whose Ghost carries a logo gets, which until now was proved by a ` +
      `unit test alone. The row was patched through the service role and put back in a finally: ` +
      `no Ghost was written, which is what "Ask First" forbids`)

    await page.goto(`${landedOn}&failed=1`, { waitUntil: 'load' })
    await s2cHeading(page).waitFor()
    failedShown = await says(page, SAY.brand_failed)
    await page.goto(landedOn, { waitUntil: 'load' })
    await s2cHeading(page).waitFor()
    failedAbsent = await says(page, SAY.brand_failed)
    // AND A REAL FAILURE BRANCH IS DRIVEN TO IT. The two assertions above prove the SENTENCE
    // renders off the flag; they prove nothing about anything ever SETTING the flag, because the
    // step types the flagged URL itself — the same shape of gap the step was written to close, one
    // level up (review 5, 2026-09-09). `decision_missing` is the one branch a browser can reach
    // without fault injection: `useBrand` refuses a post whose `project_id` field is not there AT
    // ALL (a crafted body, not a press), which is `typeof chosen !== 'string'` and NOT the blank
    // value `brand-stale` posts. Removing the input is exactly that post.
    await page.evaluate(() => {
      const f = document.querySelector('input[name="project_id"]')
      if (f) f.remove()
    })
    await page.getByRole('button', { name: SAY.brand_use, exact: true }).click()
    // WAIT FOR THE FLAG, not for the path: the press starts ON `/sites/brand`, so a predicate on
    // the pathname alone is already true and resolves before the redirect has happened at all.
    await page.waitForURL((u) => u.searchParams.get('failed') === '1').catch(() => {})
    await s2cHeading(page).waitFor().catch(() => {})
    const failedByBranch = await says(page, SAY.brand_failed)
    const failedFlagInUrl = new URL(page.url()).searchParams.get('failed') === '1'
    step('brand-failed-line',
      failedShown && !failedAbsent && failedByBranch && failedFlagInUrl,
      `S2c asked for with &failed=1 printed ${JSON.stringify(SAY.brand_failed)} = ${failedShown}, ` +
      `and the same screen without the flag did not = ${!failedAbsent}. This is the matrix's ` +
      `"insert fails -> the page says so": every failure branch in useBrand redirects here, and ` +
      `the sentence they redirect to was asserted by its own LENGTH and nothing else. AND A REAL ` +
      `BRANCH NOW DRIVES IT: a press whose project_id input was REMOVED (decision_missing, not ` +
      `the blank value brand-stale posts) landed back on ${page.url().split('?')[0]} carrying ` +
      `failed=1 (${failedFlagInUrl}) and printing the sentence (${failedByBranch})`)

    // ── BOTH CONTROLS ARE FORMS, so S2c works with JavaScript off — the same wiring `js-off`
    //    asserts for the keys form. (The Sites card's offer is a LINK and needs no form to work
    //    without scripts; it is asserted where it is drawn, in `brand-seed`.)
    // A SCRIPTS-OFF BROWSER IS SERVED THE SERVER'S HTML, so that is what this reads: S2c fetched
    // as a FRESH DOCUMENT. React emits `method="POST"` and the encoded `$ACTION_*` fields only
    // when it renders on the SERVER — S2c was reached by the connect action's own client-side
    // redirect, whose DOM is built from an RSC payload and carries neither, so the first version
    // of this step read `method: ""` and `encoded: 0` off two forms that are perfectly wired
    // (executed, runs 2-4). `js-off` and `notices-js-off` both read a document `goto` fetched,
    // and this had copied their question without their setup.
    await page.goto(landedOn, { waitUntil: 'load' })
    await s2cHeading(page).waitFor()
    const brandForms = await page.locator('main form').evaluateAll((forms) => forms.map((f) => ({
      method: (f.getAttribute('method') || '').toLowerCase(),
      // `!== null`, NEVER a truthiness test: React emits `action=""` — the empty string means
      // "post to this page", which is exactly the progressive enhancement being asserted, and
      // `Boolean('')` called all four of these unwired (executed, run 2). `notices-js-off` next
      // door had it right and this copied the idea without the idiom.
      action: f.getAttribute('action') !== null,
      encoded: f.querySelectorAll('input[type="hidden"][name^="$ACTION"]').length,
      site: f.querySelectorAll('input[type="hidden"][name="site_id"]').length,
      decision: f.querySelectorAll('input[type="hidden"][name="project_id"]').length,
      submits: f.querySelectorAll('button[type="submit"]').length,
    })))
    const brandWired = brandForms.filter((f) => f.method === 'post' && f.action && f.encoded > 0
                                                && f.site === 1 && f.submits === 1)
    step('brand-js-off',
      brandForms.length === 2 && brandWired.length === 2
      && brandForms.filter((f) => f.decision === 1).length === 1,
      `${brandForms.length} form(s) on S2c and ${brandWired.length} of them progressively enhanced: ` +
      `method=post, an action attribute, React's encoded $ACTION_* hidden fields, one hidden ` +
      `site_id and one submit each. Exactly one carries the hidden project_id — the decision the ` +
      `caption states, which useBrand re-counts and refuses if it has gone stale. Read: ` +
      `${JSON.stringify(brandForms)}`)

    await axeAt(page, 'brand')
    await shoot(page, 's2c')

    // ── **Skip** WRITES NOTHING. Not a project, and not a note that it was pressed: the offer is
    //    a link on the card and stays there, so skipped and not-yet-taken are one state (FR-C4's
    //    "skippable and re-runnable").
    await skipS2c(page)
    await page.waitForSelector('text=Connected')
    const afterSkip = await projectsOf()
    const offerHref = `/sites/brand?site=${t1SiteId}`
    const offerAfterSkip = await page.locator(`article a[href="${offerHref}"]`).count()
    const card = await cardOf('Connected').first().innerText().catch(() => '')
    const href = await cardOf('Connected').first().locator('a[target="_blank"]').getAttribute('href').catch(() => null)
    step('brand-skip',
      afterSkip.length === 0 && page.url().replace(/\?.*$/, '') === `${APP}/sites`
      && offerAfterSkip === 1 && card.includes(SAY.brand_offer)
      && card.includes('Connected') && card.includes(`Ghost ${short(T1.version)}`)
      && CHECKED.test(card) && href === pub1.url,
      `Skip left ${afterSkip.length} project(s) — nothing written — and the browser on ${page.url()}; ` +
      `the card still carries the offer (${offerAfterSkip} link to ${offerHref}, reading ` +
      `${JSON.stringify(SAY.brand_offer)}), so it can be taken later. The card behind it is ` +
      `unchanged: ${JSON.stringify(card.replace(/\s+/g, ' ').trim())}, its address linking to ` +
      `${href} = the public url`)
    await shoot(page, 's11a')

    // ── STORY 3.3: THE DECRYPT PATH, LIVE, AND IT IS DW-54's THIRD GAP CLOSING. The probe runs on
    //    the STORED key through `call()`, so each of its two GETs is a `vault_decrypt` row and an
    //    `admin_read` row carrying the site's id — on top of the `site/` read the connect action
    //    made. Counted rather than restated: one connect = 1 config/ with a NULL site_id (the
    //    typed key), then site/ + config/ + settings/ with the id, and two decryptions.
    const afterConnect = await readAuditRows()
    const decrypts = afterConnect.filter((r) => r.action === 'vault_decrypt')
    const withId = afterConnect.filter((r) => r.action === 'admin_read' && r.site_id === t1SiteId && r.outcome === 'ok')
    step('decrypt-path',
      decrypts.length === 2 && decrypts.every((r) => r.outcome === 'ok') && withId.length === 3,
      `${decrypts.length} vault_decrypt row(s), all ok = ${decrypts.every((r) => r.outcome === 'ok')}, and ` +
      `${withId.length} admin_read ok rows carrying the site id — site/ from the connect action plus ` +
      `config/ and settings/ from the probe on the STORED key. Before 3.3 nothing in the product ` +
      `decrypted at all (DW-54).`)

    // ── THE FOUR PROBES, ON A SELF-HOSTED GHOST. `hostSettings` is absent on both majors (§15h
    //    item 2, §39), which means self-hosted and unlimited — so `capability` is `full` and its
    //    source is `probe`.
    //    THIS STEP SAYS NOTHING ABOUT THE FLAG, deliberately: `capabilityOf` answers `full` for an
    //    absent `hostSettings` whether the flag is on or off — it is a fact about the payload, not
    //    a judgement about a plan — so a run here CANNOT tell the two apart and a sentence claiming
    //    it did would be a result with no control behind it (review, 2026-09-08). The flag-off
    //    branch is proved where it can be: `probe-rule.test.ts`, against a Ghost(Pro) payload.
    const probed = (await rowsOf('*')).find((r) => r.id === t1SiteId) || {}
    const ss = probed.site_settings || {}
    const ann = ss.announcement || {}
    step('probe-selfhosted',
      probed.capability === 'full' && probed.capability_source === 'probe'
      && ss.code_injection === true && ss.portal_button === false && ss.portal_button_source === 'probe'
      && typeof ann.content === 'string' && typeof ann.visibility === 'string'
      && ss.public_url === pub1.url && ss.plan_ask === undefined,
      `capability ${probed.capability} / source ${probed.capability_source} (hostSettings absent = ` +
      `self-hosted and unlimited, which is the same answer with the flag on or off — this step ` +
      `cannot and does not test the flag); site_settings.code_injection ${ss.code_injection} (the harness set the Site ` +
      `footer — see injection-live), portal_button ${ss.portal_button} source ${ss.portal_button_source} ` +
      `(Ghost answered a real boolean, so no question), announcement.visibility ${JSON.stringify(ann.visibility)} ` +
      `stored as the JSON STRING Ghost sends, and Story 3.2's public_url still there = ` +
      `${ss.public_url === pub1.url}; no plan_ask`)

    // ── NFR-3: THE PAYLOAD IS COMPUTED TO ONE BOOLEAN AND DISCARDED. Neither `codeinjection_head`
    //    nor `codeinjection_foot` may appear in the row, in any response the page received, or in
    //    the rendered HTML — the marker the harness wrote is what makes that assertion real.
    const html = await page.content()
    const rowText = JSON.stringify(await rowsOf('*'))
    step('no-payload-leak',
      !/codeinjection/i.test(rowText) && !rowText.includes(MARK) && !html.includes(MARK)
      && !bodies.some((b) => b.includes(MARK)),
      `the sites rows name codeinjection = ${/codeinjection/i.test(rowText)} and hold the marker = ` +
      `${rowText.includes(MARK)}; the rendered /sites HTML holds it = ${html.includes(MARK)}; any of the ` +
      `${bodies.length} response bodies held it = ${bodies.some((b) => b.includes(MARK))}`)

    // ── THE ONE-TIME NOTICE, END TO END. It is on the card because Ghost really has code injection
    //    set (injection-live), "Got it" stamps the COLUMN, and the notice never comes back — not on
    //    a reload, and not after a re-probe (which `re-adopt` below proves, where the re-probe is).
    const noticeShown = await page.getByText(SAY.injection_body).isVisible().catch(() => false)
    // "Got it" is on screen once: it is the only block showing at this point (portal read cleanly,
    // no plan_ask, capability full), so the button's own name is the whole locator.
    await page.getByRole('button', { name: SAY.injection_dismiss }).first().click()
    const stampedAt = await until(async () =>
      ((await rowsOf('id,code_injection_notice_shown_at')).find((r) => r.id === t1SiteId) || {})
        .code_injection_notice_shown_at)
    const stampedRow = { code_injection_notice_shown_at: stampedAt }
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const backAfterReload = await page.getByText(SAY.injection_body).isVisible().catch(() => false)
    step('injection-notice',
      noticeShown && Boolean(stampedRow.code_injection_notice_shown_at) && backAfterReload === false,
      `the sky notice was on the card = ${noticeShown}; "${SAY.injection_dismiss}" stamped ` +
      `code_injection_notice_shown_at = ${Boolean(stampedRow.code_injection_notice_shown_at)}; after a full ` +
      `reload it is back = ${backAfterReload}`)

    // ── THE CARD THE OWNER FINALISED (his findings 4 and 6). The address carries the new-tab
    //    glyph; "Connected" left the pills' line and sits just above "Checked …", closer to it
    //    than to the pills. Read off the rendered boxes, not off the class attribute: the
    //    complaint was about what he saw.
    const first = cardOf('Connected').first()
    const arrow = await first.locator('a[target="_blank"] svg').count()
    const pillBox = await boxOf(first.getByText(`Ghost ${short(T1.version)}`))
    const connBox = await boxOf(first.getByText('Connected', { exact: true }))
    const checkBox = await boxOf(first.getByText(CHECKED))
    const pillGap = connBox.y - (pillBox.y + pillBox.height)
    const stateGap = checkBox.y - (connBox.y + connBox.height)
    step('card',
      arrow === 1 && pillGap > 0 && stateGap >= 0 && stateGap < pillGap,
      `the address carries ${arrow} new-tab glyph; the pills line ends at y ` +
      `${Math.round(pillBox.y + pillBox.height)}, "Connected" starts at ${Math.round(connBox.y)} and ` +
      `the check stamp at ${Math.round(checkBox.y)} — so Connected is BELOW the pills and just above ` +
      `Checked, ${Math.round(stateGap)}px from it against ${Math.round(pillGap)}px from the pills`)

    // ── FR-C4's SEED, DRIVEN THE WAY THE OWNER TESTS IT: the offer link on the card, then
    //    **Use your brand**. This account has no project and room for one, so the caption said a
    //    project would be MADE — and this is where that sentence becomes true or false.
    const offer = () => page.locator(`article a[href="${offerHref}"]`).first()
    await offer().click()
    await s2cHeading(page).waitFor()
    const saidCreate = await page.getByText(SAY.brand_will_create).isVisible().catch(() => false)
    /* ── brand-popup: THE OFFER OPENS A WINDOW OVER THE LIST, and the press closes it again.

       The owner asked for S2c as a popup on 2026-09-10 ("make the 'Nice site. Want to keep the
       vibe?' as a popup instead of as a page") and then TESTED IT THE SAME DAY: "the pop up opens
       but then the top bar with search box and Connect site buttons disappears." It did. The popup
       was an intercepted route, which lives at the panel's own URL, and the shell draws that bar
       from a table keyed on the EXACT path — so opening the window took the bar off the screen.

       It is `/sites?brand=<id>` now, a parameter on the list itself, so the path never leaves the
       one the bar belongs to. `topBar` below is that finding made checkable, and it is asserted on
       every one of the four states this step walks through. */
    const brandShape = async () => await page.evaluate(() => ({
      open: !!document.querySelector('dialog[aria-labelledby="brand-panel-title"][open]'),
      inDom: !!document.querySelector('dialog[aria-labelledby="brand-panel-title"]'),
      cards: document.querySelectorAll('article').length,
      topBar: !!document.querySelector('input[name="q"]')
        && [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/sites/connect'),
    }))
    const brandOpened = await brandShape()
    await page.getByRole('button', { name: SAY.brand_use, exact: true }).click()
    // `!brand`, NOT the bare pathname: inside the popup the pathname is already `/sites`, so the
    // first writing of this wait returned before the action had answered and the "closed" read
    // below saw the window still open (review 7, 2026-09-10 — the run's own FAIL).
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
    // READ BEFORE ANYTHING RELOADS. A reload destroys the client router state, so the popup would
    // be gone whatever the code did — this assertion has to be taken on the very document the
    // press left behind or it is a control that cannot fail (standing rule 2).
    await page.waitForTimeout(400)
    const brandClosed = await brandShape()
    /* …AND THE OFFER OPENS IT AGAIN, ON THE SAME DOCUMENT. That last clause is the whole step:
       reloading first would destroy the client router state and the second open would pass on any
       code at all. The regression is a RETAINED slot, so the retention has to still be there when
       the second press happens. The brand is already applied by now, so the card still carries the
       offer (FR-C4's "skippable and re-runnable") and this is a real press, not a contrivance. */
    await offer().click()
    await s2cHeading(page).waitFor()
    const brandReopened = await brandShape()
    // …and **Skip** — the panel's other way out, and a SECOND server action leaving the popup —
    // closes it too. The frame draws two presses and no Cancel, and the offer stays on the card
    // either way (`skipBrand` writes nothing at all); the ✕ below is the owner's addition.
    await skipS2c(page)
    await page.waitForTimeout(400)
    const brandSkipped = await brandShape()
    /* …AND THE ✕ IS A FOURTH WAY OUT — his ask of 2026-09-10, item 3 ("Add a cross button too which
       will close the popup"). It is not a fifth behaviour: **Skip** writes nothing at all, so the
       ✕ lands exactly where Skip lands and the offer is still on the card afterwards. That last
       clause is what this drives — the offer has to be there to press again. */
    await offer().click()
    await s2cHeading(page).waitFor()
    const beforeClose = await brandShape()
    await page.locator(`dialog[open] a[href="/sites"][aria-label="${SAY.brand_close}"]`).click()
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
    await page.waitForTimeout(400)
    const afterClose = await brandShape()
    const offerStillThere = await offer().count()
    /* AND THE ✕ LEAVES NO ENTRY BEHIND. Every way out of the window replaces the history entry
       (`panel-modal.tsx`, `brandRedirect`), and the ✕ was the one that pushed: Back after it
       re-opened the popup (review 7, 2026-09-10). The history here is [/sites, /sites], so Back
       lands on a list with no `?brand=` — with the push it was [/sites, /sites?brand=, /sites]
       and Back re-drew the window. Discriminating on the fixed code AND on the old. */
    await page.goBack({ waitUntil: 'load' }).catch(() => {})
    await page.waitForTimeout(600)
    const backUrlBrand = new URL(page.url()).searchParams.get('brand')
    const afterBack = await brandShape()
    /* …AND ESCAPE IS THE FIFTH, and it is the only one `panel-modal.tsx` itself performs: the
       native element closes without navigating, so `onClose` has to move the URL off `?brand=`
       or the address bar names a window that is not on screen. `keys-popup` asserts this on the
       other window; this one never had (review 7, 2026-09-10). Then the offer opens it AGAIN,
       so the Escape run is proved to have left nothing mounted. */
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    /* THE OFFER SAYS IT IS WORKING (R-98, step 25 of the owner's test): the window's RSC fetch is
       HELD and the link is read inside the hold — it must say BRAND_COPY.opening, be `aria-busy`,
       and a second click inside the hold must start no second fetch. `brand_opening` was handed
       to this run and read by nothing (review 7, 2026-09-10). A local counter, not `held`, so the
       POST control of `busy-label` below stays its own. */
    let openFetches = 0
    const holdOpen = async (route) => {
      const r = route.request()
      if (r.method() !== 'GET' || !r.url().includes('brand=') || !r.headers()['rsc']) return route.continue()
      openFetches += 1
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return route.continue()
    }
    await page.route(anyApp, holdOpen)
    await offer().click()
    const offerBusy = await page.locator(`article a[href="${offerHref}"][aria-busy="true"]`).first()
      .waitFor({ timeout: 2500 }).then(() => true).catch(() => false)
    const offerBusyText = (await offer().innerText().catch(() => '')).trim()
    await offer().click({ force: true }).catch(() => {})
    await s2cHeading(page).waitFor()
    await page.unroute(anyApp, holdOpen)
    const fetchesInHold = openFetches
    const escOpened = await brandShape()
    await page.keyboard.press('Escape')
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
    await page.waitForTimeout(400)
    const brandAfterEscape = await brandShape()
    step('brand-popup',
      brandOpened.open && brandOpened.cards > 0 && brandOpened.topBar
      && !brandClosed.open && brandClosed.cards > 0 && brandClosed.topBar
      && brandReopened.open && brandReopened.topBar && !brandSkipped.open
      && beforeClose.open && !afterClose.open && !afterClose.inDom
      && afterClose.cards > 0 && afterClose.topBar && offerStillThere === 1
      && !backUrlBrand && !afterBack.inDom
      && offerBusy && offerBusyText === SAY.brand_opening && fetchesInHold === 1
      && escOpened.open && !brandAfterEscape.open && !brandAfterEscape.inDom && brandAfterEscape.cards > 0 && brandAfterEscape.topBar,
      `the card's offer opened S2c as a WINDOW over the Sites list — an open <dialog> = ` +
      `${brandOpened.open} with ${brandOpened.cards} cards still behind it AND THE TOP BAR STILL ` +
      `DRAWN = ${brandOpened.topBar}, which is his test finding of 2026-09-10: the bar went with ` +
      `the path while this was an intercepted route. Pressing ${JSON.stringify(SAY.brand_use)} ` +
      `closed it and left the list: open = ${brandClosed.open}, ${brandClosed.cards} cards, bar ` +
      `= ${brandClosed.topBar}. The offer opened it A SECOND time = ${brandReopened.open}; ` +
      `${JSON.stringify(SAY.brand_skip)} closed it as well = ${!brandSkipped.open}, so BOTH server ` +
      `actions that leave the panel leave it. AND THE ✕ IS A FOURTH WAY OUT (his ask, item 3): ` +
      `open = ${beforeClose.open} → pressed → open = ${afterClose.open}, nothing left in the DOM ` +
      `= ${!afterClose.inDom}, ${afterClose.cards} cards, and the offer is still on the card ` +
      `(${offerStillThere}) — it writes nothing, exactly as Skip writes nothing. BACK AFTER THE ✕ ` +
      `re-opens nothing: brand param = ${JSON.stringify(backUrlBrand)}, dialog in DOM = ` +
      `${afterBack.inDom} (the ✕ replaces, as every other way out does). THE OFFER SAID IT WAS ` +
      `WORKING inside a held fetch: aria-busy = ${offerBusy}, reading ${JSON.stringify(offerBusyText)} ` +
      `(the app's own BRAND_COPY.opening), and a second click in the hold started ${fetchesInHold} ` +
      `fetch(es) in all — one. AND ESCAPE IS THE FIFTH WAY OUT: open = ${escOpened.open} → Escape → ` +
      `open = ${brandAfterEscape.open}, in DOM = ${brandAfterEscape.inDom}, ${brandAfterEscape.cards} cards and ` +
      `the bar = ${brandAfterEscape.topBar}`)

    const seeded = (await until(async () => {
      const list = await projectsOf()
      return list.length ? list : null
    })) || []
    const made = seeded[0] || {}
    const seededBrand = ((made.style_pack || {}).brand) || {}
    await page.reload({ waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const tally = await cardOf('Connected').first().innerText().catch(() => '')
    // …AND THE DASHBOARD CARD IS PAINTED IN IT. `placeholderFor` prefers `brand.accent` over the
    // preset's, so the wireframe's middle block is the customer's own colour — read off the
    // RENDERED card with getComputedStyle, not off a class attribute.

    await page.goto(`${APP}/`, { waitUntil: 'load' })
    await page.getByText(made.name || 'project').first().waitFor()
    const painted = await page.locator('article > div[aria-hidden="true"] > div:last-child > div')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
    step('brand-seed',
      saidCreate && seeded.length === 1 && made.linked_site_id === t1SiteId
      && seededBrand.accent === brandRead.accent && made.name === pub1.title
      && Boolean(made.slug) && tally.includes(SAY.one_project)
      // THE MIDDLE BLOCK AND ONLY IT — `placeholder.tsx` paints the middle of three in its button
      // row and leaves the outer two `bg-line`. `includes` over the three stayed green through
      // the bug it exists to catch, the accent painted on the wrong block; and the first run of
      // this assertion said LAST, which is what reading the row rather than the component gets
      // you (review, 2026-09-08 — executed, then corrected against the source).
      && painted[1] === rgbOf(brandRead.accent)
      && painted.filter((c) => c === rgbOf(brandRead.accent)).length === 1,
      `the caption said a project would be made = ${saidCreate}; pressing "${SAY.brand_use}" wrote ` +
      `${seeded.length} project named ${JSON.stringify(made.name)} — the site's own Ghost title — ` +
      `slug ${JSON.stringify(made.slug)}, linked_site_id = the site = ${made.linked_site_id === t1SiteId} ` +
      `(FR-B5's first writer), style_pack.brand.accent ${seededBrand.accent} equal to the site's ` +
      `${brandRead.accent}; the Sites card now reads ${JSON.stringify(SAY.one_project)} = ` +
      `${tally.includes(SAY.one_project)}, and the dashboard card's wireframe blocks compute to ` +
      `${JSON.stringify(painted)} — the accent ${rgbOf(brandRead.accent)} on the MIDDLE one and ` +
      `on no other (${painted.filter((c) => c === rgbOf(brandRead.accent)).length} of 3)`)

    /* ── THE OWNER'S TEST OF 2026-09-09, BOTH FINDINGS, ON THE DEPLOYED SITE (ruling R-98).

       Each state being asserted here EXISTS ONLY WHILE SOMETHING IS IN FLIGHT, and on a healthy
       deployment that is a few hundred milliseconds — so each step HOLDS the request the press
       makes and reads the screen inside the hold. `route.continue()` after a wait changes nothing
       about what is sent or what comes back: the delay is in this browser, not in the app, and
       both steps let the navigation land afterwards and leave the run where it found it.

       EACH CARRIES ITS OWN CONTROL, because a step that cannot tell the fix from its absence is
       not evidence for it (standing rule 2). `skeleton-shape` asserts the two routes AGAINST EACH
       OTHER, so the state before the fix — /sites carrying the dashboard's boundary — is a state
       it cannot pass in; `busy-label` fails if nothing was ever held, so a press whose POST
       resolved before the read cannot read as a pass.

       This block runs where it does because `brand-seed` has just made the one project: the
       dashboard has a card and /sites has a card, so both skeletons stand in for something. */
    let held = 0
    /* THE MATCHER AND THE HANDLER ARE BOTH KEPT, because `page.unroute` matches them BY REFERENCE:
       a fresh arrow passed to `unroute` removes nothing, and the hold would have stayed installed
       over every step after this block. */
    const anyApp = (u) => u.href.startsWith(APP)
    const holding = (match) => async (route) => {
      if (!match(route.request())) return route.continue()
      held += 1
      await new Promise((r) => setTimeout(r, 4000))
      // `.catch`: a navigation that lands during the hold aborts the held request, and a
      // `continue()` on it then throws — OUTSIDE any step's try, as an unhandled rejection that
      // took the whole browser half down with no step result printed (review 7, 2026-09-10).
      return route.continue().catch(() => {})
    }
    const holdPost = holding((r) => r.method() === 'POST')

    /* FINDING 2: "I want the loading shimmer to match the cards they show."

       PROVED OFF THE STREAMED DOCUMENT, and the first version of this step was proved wrong by
       running it. That one HELD the RSC request of a soft navigation and read the screen inside
       the hold, and it saw NEITHER sentence and stayed on the dashboard — because holding that
       request stops the router COMMITTING the navigation at all, and the loading boundary is what
       is drawn AFTER the commit while the page's own data streams. The instrument was measuring
       the wrong half of the navigation (executed against `4363ff02`, 2026-09-09).

       A hard navigation has no such race: React streams the layout with the segment's Suspense
       fallback inside it and then streams the content over it, so the fallback is IN the document
       body whatever the timing. The sentence in that body names which boundary the route is
       under, which is the whole finding — and the two routes are asserted AGAINST EACH OTHER,
       which is the control: before this fix /sites carried the dashboard's, and there was no
       arrangement of these four booleans that could tell one from the other by accident.

       The soft navigation is RECORDED beside it rather than asserted, because what the router
       draws between two commits is timing this run cannot hold still. */
    const LOADING_SITES = 'Loading sites…'
    const LOADING_PROJECTS = 'Loading projects…'
    const bodyOf = async (path) => {
      const response = await page.goto(`${APP}${path}`, { waitUntil: 'load' })
      return (await response.text().catch(() => '')) || ''
    }
    const sitesHtml = await bodyOf('/sites')
    await page.waitForSelector('text=Connected')
    const dashHtml = await bodyOf('/')
    const sitesSaysSites = sitesHtml.includes(LOADING_SITES)
    const sitesSaysProjects = sitesHtml.includes(LOADING_PROJECTS)
    const dashSaysProjects = dashHtml.includes(LOADING_PROJECTS)
    const dashSaysSites = dashHtml.includes(LOADING_SITES)

    /* And the drawing under the sentence, off the same body: the site card's skeleton has three
       40px monogram tiles and NO image band, which is the difference he was looking at.

       MATCHED ON THE SKELETON'S OWN CLASS PAIR, NOT ON THE SHAPE ITSELF, which is what this
       comment used to CLAIM it did while `aspect-[16/10]` matched `placeholder.tsx` too — the
       REAL project card. By the time this step runs `brand-seed` has made a project, so the
       finished page satisfied `bandInDash > 0` whether the dashboard's skeleton was drawn or
       deleted: half the pair could not fail (review, 2026-09-09). `bg-paper-sunk` before the
       band, and `bg-paper-sunk` after `rounded-thumb`, appear only in the two fallbacks — and
       the site tile is now counted BOTH ways too, so each route's drawing is asserted present on
       its own route and absent on the other. */
    const bandOf = (html) => (html.match(/bg-paper-sunk tablet:aspect-\[16\/10\]/g) || []).length
    const tileOf = (html) => (html.match(/size-10 shrink-0 rounded-thumb bg-paper-sunk/g) || []).length
    const bandInSites = bandOf(sitesHtml)
    const bandInDash = bandOf(dashHtml)
    const tileInSites = tileOf(sitesHtml)
    const tileInDash = tileOf(dashHtml)

    // The soft navigation, polled and recorded. `textContent`, not `innerText`: the sentence is
    // `sr-only` and clipped, and what matters is that it is in the tree.
    await page.getByRole('link', { name: 'Sites', exact: true }).first().click()
    const seen = []
    for (let i = 0; i < 80; i += 1) {
      const text = await page.locator('main').evaluate((el) => el.textContent).catch(() => '')
      const tag = text.includes(LOADING_SITES) ? 'sites-skeleton'
        : text.includes(LOADING_PROJECTS) ? 'projects-skeleton'
        : text.includes('Connected') ? 'sites-page' : 'dashboard'
      if (seen[seen.length - 1] !== tag) seen.push(tag)
      if (tag === 'sites-page') break
      await page.waitForTimeout(50)
    }
    await page.waitForURL((u) => u.pathname === '/sites')
    await page.waitForSelector('text=Connected')
    record('skeleton-soft-nav',
      `pressing Sites in the sidebar and polling every 50ms went ${seen.join(' -> ')}. Recorded, ` +
      `not asserted: what the router draws between two commits is timing this run cannot hold ` +
      `still, and the first version of this step asserted it and measured the wrong half`)
    step('skeleton-shape',
      sitesSaysSites && !sitesSaysProjects && dashSaysProjects && !dashSaysSites
      && bandInSites === 0 && bandInDash > 0 && tileInSites > 0 && tileInDash === 0,
      `the streamed document of each route carries its OWN loading boundary: /sites says ` +
      `${JSON.stringify(LOADING_SITES)} = ${sitesSaysSites} and does NOT say ` +
      `${JSON.stringify(LOADING_PROJECTS)} = ${!sitesSaysProjects}; / says the second = ` +
      `${dashSaysProjects} and not the first = ${!dashSaysSites}. THE CONTROL IS THE PAIR — ` +
      `before this fix /sites had no boundary of its own and carried the dashboard's, which is ` +
      `the state the second and fourth booleans exclude. The drawing agrees, and it is a pair ` +
      `both ways: the skeleton's 16:10 image band appears ${bandInDash} time(s) in the ` +
      `dashboard's body and ${bandInSites} in /sites', and the skeleton's 40px monogram tile ` +
      `${tileInSites} time(s) in /sites' and ${tileInDash} in the dashboard's. R-98`)

    /* FINDING 1: "the button does not says anything." Proved on SKIP rather than on Use your
       brand, deliberately: Skip writes nothing, so the assertion cannot disturb the row the
       at-cap steps below are about to read. Both buttons are the same `Submit`. */
    // `offer()` is the run's own locator for the card's link — by href, so it is the same control
    // whether it is drawn as an `<a>` or, since R-98, as a `next/link`.
    await offer().click()
    await s2cHeading(page).waitFor()
    // INSIDE THE WINDOW. `main form button[type="submit"]` also matched the card's Disconnect
    // submit behind the popup, so `nth(1)` was Use your brand and the press rebranded the row this
    // step exists to leave alone (review 7, 2026-09-10 — the run's own FAIL).
    const submits = page.locator('dialog[open] form button[type="submit"]')
    const idle = (await submits.allInnerTexts()).map((t) => t.trim())
    // THE OWNER'S ASK OF 2026-09-10 — "ensure that does not change the layout or add any layout
    // shifts" — measured, not read: the pressed control's box and its neighbour's position before
    // the press and inside the hold. `{pending ? busy : children}` passes every other assertion
    // in this step and moved Skip by 41px (review 7, 2026-09-10).
    const boxIdle = await boxOf(submits.nth(1))
    const siblingIdle = await boxOf(submits.nth(0))
    await page.route(anyApp, holdPost)
    await submits.nth(1).click()
    /* WAITED FOR, NOT READ ON THE NEXT LINE. `pending` turns true on the render AFTER the submit,
       so reading the label immediately raced React and would have reported the idle word — the
       same beat `account-menu.tsx` records for the ref it keeps. The wait is inside the 4s hold. */
    const wentBusy = await page.getByRole('button', { name: SAY.brand_skipping, exact: true })
      .waitFor({ timeout: 3000 }).then(() => true).catch(() => false)
    const busyText = (await submits.nth(1).innerText().catch(() => '')).trim()
    const busyAttr = await submits.nth(1).getAttribute('aria-busy').catch(() => null)
    const disabledAttr = await submits.nth(1).getAttribute('aria-disabled').catch(() => null)
    // `useFormStatus` is the FORM's status, so the button in the other form is untouched — the
    // screen says which control is working rather than that the screen is.
    const siblingText = (await submits.nth(0).innerText().catch(() => '')).trim()
    const boxBusy = await boxOf(submits.nth(1))
    const siblingBusy = await boxOf(submits.nth(0))
    const noShift = boxIdle.width === boxBusy.width && boxIdle.height === boxBusy.height
      && boxIdle.x === boxBusy.x && boxIdle.y === boxBusy.y
      && siblingIdle.x === siblingBusy.x && siblingIdle.y === siblingBusy.y
    // The navigation lands FIRST and the handler is removed after it: `unroute` does not abort a
    // hold that is already running, and removing it mid-flight is one less thing to reason about.
    // `!brand`: the press is inside the popup, where the pathname is already `/sites` — the bare
    // wait returned at once, the `goto` below aborted the held POST, and the hold's late
    // `continue()` crashed the run (review 7, 2026-09-10).
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
    await page.unroute(anyApp, holdPost)
    await page.waitForSelector('text=Connected')
    step('busy-label',
      held > 0 && wentBusy && idle[1] === SAY.brand_skip && busyText === SAY.brand_skipping
      && busyAttr === 'true' && disabledAttr === 'true' && siblingText === SAY.brand_use && noShift,
      `NOTHING MOVED: the pressed control was ${boxIdle.width}×${boxIdle.height} at rest and ` +
      `${boxBusy.width}×${boxBusy.height} busy, its neighbour at y ${siblingIdle.y} then ` +
      `${siblingBusy.y} (his ask of 2026-09-10, measured). ` +
      `held ${held} POST(s) and read S2c's buttons inside the hold: the pressed one went from ` +
      `${JSON.stringify(idle[1])} to ${JSON.stringify(busyText)} — the app's own ` +
      `BRAND_COPY.skipping — with aria-busy=${busyAttr} and aria-disabled=${disabledAttr} ` +
      `(never \`disabled\`, so it keeps focus and stays announced), while the button in the OTHER ` +
      `form still read ${JSON.stringify(siblingText)}. \`held > 0\` is the control: a press whose ` +
      `POST was never held would have resolved before the read and could not fail. R-98`)

    // ── AT THE CAP, WHICH THE SEED ABOVE JUST PUT THIS FREE ACCOUNT AT (F.1: Free includes 1
    //    project). THE OWNER RULED THIS PATH (Question 1, option 1, 2026-09-08) and asked the
    //    screen to NAME the project it will brand BEFORE the press — so the caption is read
    //    first, and then what it promised is checked against the row.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await offer().click()
    await s2cHeading(page).waitFor()
    const namedIt = await says(page, SAY.brand_will_brand.replace('%s', made.name))
    const stillCreate = await page.getByText(SAY.brand_will_create).isVisible().catch(() => false)
    await page.getByRole('button', { name: SAY.brand_use, exact: true }).click()
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand')) // pressed in the popup — see review 7
    await page.waitForSelector('text=Connected')
    const afterCap = await projectsOf()
    // NOT `same`: that name is a module-level helper up in the wizard's locators, and a
    // block-scoped const of the same name put every earlier step in this try block into its
    // temporal dead zone — `same-size` threw before this step was ever reached (executed, run 1).
    const rebranded = afterCap[0] || {}
    step('brand-atcap',
      namedIt && !stillCreate && afterCap.length === 1 && rebranded.id === made.id
      && rebranded.name === made.name && rebranded.slug === made.slug
      && rebranded.linked_site_id === made.linked_site_id
      && ((rebranded.style_pack || {}).brand || {}).accent === brandRead.accent,
      `at the Free cap of 1 the caption NAMED the project it would brand ` +
      `(${JSON.stringify(SAY.brand_will_brand.replace('%s', made.name))}) = ${namedIt}, and no longer ` +
      `promised a new one = ${!stillCreate}; pressing it left ${afterCap.length} project — the same ` +
      `row (${rebranded.id === made.id}) with its name, slug and linked_site_id untouched ` +
      `(${rebranded.name === made.name && rebranded.slug === made.slug && rebranded.linked_site_id === made.linked_site_id}) ` +
      `and style_pack.brand written again, idempotently`)

    // A PRESS THAT HAS NOT LANDED PROVES NOTHING ABOUT "NOTHING WAS WRITTEN" (standing rule 2).
    // The two steps below both refuse and REDIRECT BACK TO `/sites/brand` — the path the press
    // started on — so `waitForURL(pathname === '/sites/brand')` is already true the instant it is
    // called and returns before the server has answered at all; `s2cHeading` is on the old document
    // too, so it returns as well, and the rows could then be read BEFORE the action ran. A false
    // "nothing was written" is exactly what these steps exist to rule out. Waiting on the action's
    // own POST is the control, and it is the same fix `brand-ownership` took this review
    // (review 5, 2026-09-09; propagate, never localise).
    const pressAndLand = async (name) => {
      const [resp] = await Promise.all([
        page.waitForResponse((r) => r.request().method() === 'POST', { timeout: NAV_TIMEOUT })
          .catch(() => null),
        page.getByRole('button', { name, exact: true }).click(),
      ])
      await s2cHeading(page).waitFor().catch(() => {})
      return Boolean(resp)
    }

    // ── THE CAP IS WHAT REFUSES, NOT MERELY A STALE DECISION — and this is the ONLY step that
    //    executes it. `useBrand`'s guard reads `chosen === '' ? Boolean(target) : !picked`, so an
    //    EMPTY decision at the cap is refused and no project can be made past F.1's limit; every
    //    other step presses a real button and so always posts a real project id, which takes the
    //    other half of that ternary. The review found the paywall resting on a line nothing
    //    asserted (2026-09-08). It is also the only proof of the matrix's "cap changed under the
    //    page" row: nothing written, and back on S2c with the true caption.
    //    The hidden field is blanked in the DOM, which is exactly the stale post a second tab
    //    produces — the page said "we'll make one" before the cap filled.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await offer().click()
    await s2cHeading(page).waitFor()
    await page.evaluate(() => {
      // NAMED, NOT SWALLOWED. Without the field this step posts S2c's own real decision, which
      // the cap ACCEPTS — so every assertion below would hold and the step would report "the
      // stale decision wrote nothing" having never posted one (review, 2026-09-09).
      const f = document.querySelector('input[type="hidden"][name="project_id"]')
      if (!f) throw new Error('brand-stale: S2c drew no project_id hidden field to blank')
      f.value = ''
    })
    const staleLanded = await pressAndLand(SAY.brand_use)
    const afterStale = await projectsOf()
    const trueCaption = await says(page, SAY.brand_will_brand.replace('%s', made.name))
    /* AND THE REFUSAL ANSWERED INSIDE THE WINDOW. This press was made in the popup, so `useBrand`
       redirected onto `brandBase()`'s popup address — `/sites?brand=…` — and the list is still
       behind the re-drawn panel with the bar over it. With `brandBase` answering the full page
       instead, every assertion above still held: S2c's heading and caption are on the full page
       too. This is "the one he did not hit" made checkable (review 7, 2026-09-10). */
    const staleShape = await brandShape()
    const staleUrl = new URL(page.url())
    const staleInWindow = staleShape.open && staleShape.cards > 0 && staleShape.topBar
      && staleUrl.pathname === '/sites' && Boolean(staleUrl.searchParams.get('brand'))
    step('brand-stale',
      staleLanded && afterStale.length === 1 && afterStale[0].id === made.id && trueCaption && staleInWindow,
      `at the Free cap, a press carrying an EMPTY decision — the body S2c itself emits before any ` +
      `project exists, and what a second tab that filled the cap leaves behind — wrote nothing: ` +
      `${afterStale.length} project, still the same row (${afterStale[0]?.id === made.id}), and the ` +
      `browser is back on S2c with the TRUE caption naming it = ${trueCaption} rather than the ` +
      `promise it was posted with (the action's POST was seen to answer first = ${staleLanded}, ` +
      `because a re-read that raced the press would report "nothing written" for the wrong ` +
      `reason). The cap refuses, not just the staleness. AND IT ANSWERED IN THE WINDOW: dialog ` +
      `open = ${staleShape.open}, ${staleShape.cards} cards behind it, bar = ${staleShape.topBar}, ` +
      `at ${staleUrl.pathname}?brand=… = ${Boolean(staleUrl.searchParams.get('brand'))}`)

    // ── AND THE OTHER HALF OF THAT TERNARY. `brand-stale` posts the EMPTY decision, so it takes
    //    `chosen === '' ? Boolean(target)`; every other step presses a real button, so `picked` is
    //    always found and `!picked` — the clause that refuses a project id THAT IS NOT THE
    //    CALLER'S — was executed by nothing at any level (review 5, 2026-09-09). It is what stands
    //    between a crafted body and a write onto a row the screen never offered, AND it is the
    //    cap's second guard: with `!picked` gone, a post naming an unknown id falls through to the
    //    INSERT branch and makes a project past F.1's limit, which is why the count is the
    //    assertion. The id is a uuid no project carries, which is what a deleted project or
    //    another account's row both look like through the caller's own RLS-scoped read.
    const FORGED_PROJECT = '00000000-0000-4000-8000-00000000dead'
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await offer().click()
    await s2cHeading(page).waitFor()
    await page.evaluate((id) => {
      const f = document.querySelector('input[type="hidden"][name="project_id"]')
      // `if (f)` SKIPPED SILENTLY and the forgery never happened: the press then wrote the real
      // decision, which is legal here, and every assertion below held anyway (review, 2026-09-09).
      if (!f) throw new Error('brand-forged-project: S2c drew no project_id hidden field to forge')
      f.value = id
    }, FORGED_PROJECT)
    const forgedProjectLanded = await pressAndLand(SAY.brand_use)
    const afterForgedProject = await projectsOf()
    const forgedCaption = await says(page, SAY.brand_will_brand.replace('%s', made.name))
    step('brand-forged-project',
      forgedProjectLanded && afterForgedProject.length === 1 && afterForgedProject[0].id === made.id
      && afterForgedProject[0].name === made.name && forgedCaption,
      `a press carrying a project_id no project of this caller's carries ` +
      `(${FORGED_PROJECT}) wrote NOTHING and came back to S2c: still ` +
      `${afterForgedProject.length} project, still ${JSON.stringify(afterForgedProject[0]?.name)} ` +
      `(${afterForgedProject[0]?.id === made.id}), true caption = ${forgedCaption}, and the POST ` +
      `was seen to answer before the rows were re-read = ${forgedProjectLanded}. This is the ` +
      `\`!picked\` half of useBrand's guard, which every other step walks past by pressing a real ` +
      `button — and with it gone the post falls into the INSERT branch and makes a SECOND project ` +
      `at the Free cap, so the count is the paywall's proof as much as the guard's`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })

    // ── A CARD THAT OFFERS NOTHING IS NOT DRAWN (UX-DR3), and the route that would draw it 404s.
    //    No Ghost here can produce a site with no accent, no logo and no menu, so the state is
    //    seeded on the fixture's OWN row through the service role and then put back — the same
    //    idiom as the Portal and plan questions below.
    const brandKept = brandRead
    // RESTORED IN A `finally`, WHICH IS THIS FILE'S OWN IDIOM (`injection-live` restores exactly
    // what it found, passing or failing). A throw between the strip and the restore left the row
    // stripped for every step after it — and every one of them reaches S2c (review, 2026-09-08).
    /* DECLARED OUTSIDE THE `try` BELOW ON PURPOSE: `brand-ownership` asks the same question of a
       row a DIFFERENT account owns, hundreds of lines further down, and a `const` inside that try
       is scoped to it — which is how the review's own first run threw `rendered is not defined`
       after 48 steps. Same family as the `const same` shadowing Dev hit: a helper lives at the
       level every step that needs it can see. `node --check` cannot see this one — it is valid
       syntax — so the rule is the placement, not a check. */
    /* WHAT THE CUSTOMER GETS, not only what the wire says. `notFound()` renders Next's own 404
       page, and the HTTP status beside it is MEASURED rather than excused or predicted: a route
       whose segment has a `loading.tsx` streams its shell first, so the status line is committed
       before the page component ever runs and `notFound()` lands in an already-successful
       response. Until R-98 that was true of EVERY page in `(authed)`, because one boundary sat
       over the whole group; the route-group split (`(dashboard)/`, `sites/(list)/`) means it is
       now true per route — `/sites/brand` has its own boundary and so should still answer 200,
       while `/kit` and `/sites/connect` have none at all. The assertion stays the page the
       customer sees and the status stays RECORDED beside it, so this run reports what changed
       rather than this comment predicting it (DW-67). */
    const rendered = async (url) => {
      const r = await page.goto(url, { waitUntil: 'load' })
      // A LOCATOR THAT WAITS ON ITSELF, never `innerText` the instant `load` fires — the same
      // Suspense boundary that commits the 200 means the SKELETON is what is on screen at `load`,
      // and run 4 read the skeleton and reported "not the not-found page" about a page that had
      // not rendered yet. Racing the two possible outcomes also makes a failure say which it saw.
      const saw = await Promise.race([
        page.getByText('could not be found', { exact: false }).first()
          .waitFor({ timeout: 20000 }).then(() => 'not-found').catch(() => null),
        s2cHeading(page).waitFor({ timeout: 20000 }).then(() => 'S2c').catch(() => null),
      ])
      return { status: r ? r.status() : 0, saw }
    }

    let stripped, offerGone, direct, forgedSite
    try {
      stripped = await patchSettings(t1SiteId, { brand: undefined })
      await page.goto(`${APP}/sites`, { waitUntil: 'load' })
      await page.waitForSelector('text=Connected')
      offerGone = await page.locator(`article a[href="${offerHref}"]`).count()
      direct = await rendered(`${APP}${offerHref}`)
      // A site id NO ROW ANYWHERE CARRIES. It is not the cross-account question — that one needs a
      // row a DIFFERENT account really owns, and it is asked in `brand-ownership` below, where the
      // fixture for it exists (review, 2026-09-08: this step used to claim the stranger's row and
      // forge a nonexistent uuid, which RLS never had to refuse).
      forgedSite = await rendered(`${APP}/sites/brand?site=00000000-0000-4000-8000-000000000000`)
    } finally {
      await patchSettings(t1SiteId, { brand: brandKept })
    }
    step('brand-none',
      stripped.status === 200 && offerGone === 0
      && direct.saw === 'not-found' && forgedSite.saw === 'not-found',
      `with the brand taken off the row (HTTP ${stripped.status}) the card draws ${offerGone} offer ` +
      `link(s), and ${offerHref} rendered ${JSON.stringify(direct.saw)}; a ?site= naming a row that ` +
      `does not exist rendered ${JSON.stringify(forgedSite.saw)} (the STRANGER'S row is ` +
      `brand-ownership's). Both answer HTTP ${direct.status}/${forgedSite.status} rather than ` +
      `404: /sites/brand has its own Suspense boundary (sites/brand/loading.tsx), so the shell ` +
      `has streamed and the status is committed before notFound() throws. Since R-98 that is a ` +
      `property of THIS ROUTE rather than of the whole group — the group-wide boundary is gone ` +
      `(DW-67). The brand was put back afterwards`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── S11b: the same pair behind S11a's button. The opener is a LINK to /sites/connect that
    //    JavaScript turns into the sheet; Escape closes it and nothing is sent either way.
    const opened = await sent(async () => {
      await opener(page).first().click()
      await page.waitForSelector('dialog[open] #connect-site-title')
    })
    const sheetSays = await sheet(page).innerText().catch(() => '')
    await shoot(page, 's11b')
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})
    const stillOpen = await sheet(page).count()
    step('dialog',
      (await opener(page).count()) === 1 && opened === 0 && stillOpen === 0
      && sheetSays.includes('Connect your Ghost site') && sheetSays.includes('Same quick handshake as onboarding.')
      && !sheetSays.includes('First, a quick handshake.') && sheetSays.includes('Cancel'),
      `"Connect site" is a link to /sites/connect that opened S11b ("Connect your Ghost site — Same quick ` +
      `handshake as onboarding.", the handshake, Cancel); Escape closed it (${stillOpen} left open) and ` +
      `${opened} POSTs left the page`)

    // ── INSIDE THE SHEET: "Done — next" is the same anchor, intercepted into local state, so the
    //    URL does not move; the same address again, submitted from the sheet, is refused IN it.
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    const urlBefore = page.url()
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    await sheet(page).getByText('is already connected').waitFor()
    const stillOne = await rowsOf()
    step('sheet-submit',
      page.url() === urlBefore && await says(page, SAY.already_connected, sheet(page)) && (await sheet(page).count()) === 1
      && stillOne.length === 1,
      `"Done — next" inside the sheet showed the three fields with the URL unchanged (${urlBefore}); the same ` +
      `address again was answered inside the still-open sheet with the sentence, and the account still has ${stillOne.length} site`)

    // ── A REOPENED sheet is a fresh one: no last-attempt sentence, back at the handshake.
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    const reopened = await sheet(page).innerText().catch(() => '')
    // Both panes are always in the DOM — that is what makes the box one size — so "no fields"
    // is a VISIBILITY question, not a presence one.
    const reopenedFields = await sheet(page).locator('#s2b-api-url').isVisible()
    step('sheet-reopen',
      !reopened.includes('is already connected') && reopened.includes('1/2') && reopenedFields === false,
      `reopened: at the handshake ("1/2"), the keys pane hidden (visible = ${reopenedFields}), and no sentence ` +
      `from the last attempt = ${!reopened.includes('is already connected')}`)
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})

    // ── T3 on a Free account that already has T1: Appendix F.1's own sentence, from the page route.
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await fill(page, T3.url, T3.adminKey, T3.contentKey)
    await submit(page)
    await page.waitForSelector(`text=${SAY.at_cap}`)
    const capped = await rowsOf()
    step('at-cap',
      capped.length === 1,
      `the banner reads ${JSON.stringify(SAY.at_cap)} — the app's own siteCapSentence('free') — and ` +
      `the account still has ${capped.length} site`)


    /* ═══════════ STORY 3.5 — S11c's GHOST SLOT, S11a's ⋯ MENU, AND THE ONE WRITER OF
       `sites.disconnected_at`. The account is on FREE with T1 connected and one project linked to
       it, which is exactly the state all three need: at the cap for the slot, one card for the
       menu, and something for the disconnect to leave alone. ═══════════ */

    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── S11c: THE GRID'S NEXT CELL AT THE FREE CAP. Every word of it is the app's own — the
    //    sentence is `siteCapSentence('free')` and the pill is `goProLabel()`, both derived from
    //    `PLANS` — so this step cannot restate a number Appendix F.1 owns (standing rule 4).
    const slotOf = () => page.locator('a[href="/billing"]', { hasText: SAY.at_cap })
    const slotBox = await boxOf(slotOf().first())
    const freeCard = await boxOf(cardOf(pub1.title || 'Ghost6').first())
    const slotText = (await slotOf().first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    step('ghost-slot',
      (await slotOf().count()) === 1 && slotText.includes(SAY.at_cap) && slotText.includes(SAY.go_pro)
      && slotBox.x > freeCard.x && Math.abs(slotBox.y - freeCard.y) < 2,
      `at the FREE cap the grid's next cell is S11c: one dashed link to /billing reading ` +
      `${JSON.stringify(slotText)} — the app's own siteCapSentence('free') and goProLabel(), not a ` +
      `number typed here — sitting beside the card at x ${Math.round(slotBox.x)} against the card's ` +
      `${Math.round(freeCard.x)}, on the same grid row (y ${Math.round(slotBox.y)} vs ` +
      `${Math.round(freeCard.y)})`)

    // ── S11a's ⋯, AT THE TOP RIGHT OF THE HEADER ROW (DW-57). TWO items since Story 3.6, in the
    //    frame's own order: **Manage API keys** above the thin rule and **Disconnect** below it.
    //    Re-check connection and Reconnect are Story 3.7's and are still ABSENT rather than greyed
    //    (UX-DR3). The list is read off the very selector `lib/menu.ts`'s arrow keys walk, so a row
    //    added without a story is a failing step and not a review note — and the ORDER is asserted,
    //    because "above the rule" is the whole of what the frame says about where 3.6's row goes.
    // BY ROLE AND BY NAME, scoped to T1's own card: the label is the component's
    // `Options for {title}` and a Ghost title with a quote in it would break an attribute selector.
    const t1CardLoc = () => cardOf(pub1.title || 'Ghost6').first()
    const dots = () => t1CardLoc().getByRole('button', { name: /^Options for / })
    const menuBox0 = await boxOf(page.locator(`article h2`).first())
    await dots().first().click()
    const menuEl = page.locator(`#site-menu-${t1SiteId}`)
    await menuEl.waitFor({ state: 'visible' })
    const menuItems = await menuEl.locator('a[href], button').allInnerTexts()
    const dotsBox = await boxOf(dots().first())
    const menuWidth = Math.round((await boxOf(menuEl)).width)
    // Escape is the PLATFORM's, not ours — that is why every menu here is a popover — and the
    // owner's manual test names it: the menu closes and the ⋯ is focused again.
    await page.keyboard.press('Escape')
    const menuClosed = (await menuEl.isVisible().catch(() => false)) === false
    const backOnDots = await page.evaluate(() =>
      Boolean(document.activeElement && (document.activeElement.getAttribute('aria-label') || '')
        .startsWith('Options for')))
    // THE RULE IS BETWEEN THE TWO, not above both: read off the DOM order of the menu's children,
    // because "Manage API keys above the thin line, Disconnect in red below it" is what the owner's
    // manual test looks at and a class alone cannot say which side of it a row is on.
    const menuOrder = await menuEl.evaluate((el) =>
      [...el.children].map((child) => (child.getAttribute('aria-hidden') === 'true' ? '—rule—' : child.textContent.trim())))
    step('site-menu',
      (await dots().count()) === 1 && menuItems.length === 2
      && menuItems[0].trim() === SAY.keys_menu && menuItems[1].trim() === SAY.disconnect_menu
      && JSON.stringify(menuOrder) === JSON.stringify([SAY.keys_menu, '—rule—', SAY.disconnect_menu])
      && dotsBox.x > menuBox0.x && Math.abs(dotsBox.y - menuBox0.y) < 24
      && menuWidth === 196 && menuClosed && backOnDots,
      `one ⋯ on the card, at the header row's right edge (x ${Math.round(dotsBox.x)} against the ` +
      `title's ${Math.round(menuBox0.x)}, level with it at y ${Math.round(dotsBox.y)} vs ` +
      `${Math.round(menuBox0.y)}); the menu is ${menuWidth}px wide — the frame's own ` +
      `(S11 Sites.dc.html:77) — and holds ${menuItems.length} items, ${JSON.stringify(menuItems)}, ` +
      `laid out ${JSON.stringify(menuOrder)} — Story 3.6's row ABOVE the frame's own rule and ` +
      `Disconnect below it. Re-check connection and Reconnect are 3.7's and are ABSENT, not greyed ` +
      `(UX-DR3). Escape closed it = ${menuClosed} and returned focus to the ⋯ = ${backOnDots}`)

    // ── THE CONFIRM, AND THE OWNER'S QUESTION 2 RULING IN ITS TWO OBSERVABLE HALVES (option 1,
    //    2026-09-09): it opens with focus on CANCEL, and there is NOTHING TO TYPE INTO — the
    //    project-delete dialog's look without its typed name field. Cancel leaves the site
    //    connected, which is the matrix's own way out.
    const openConfirm = async () => {
      if ((await menuEl.isVisible().catch(() => false)) === false) await dots().first().click()
      await menuEl.waitFor({ state: 'visible' })
      // BY ROLE `link` AND NOT `button`: the menu row is an `<a href="/sites/disconnect?site=…">`,
      // which is what gives it a destination with scripts off. `disconnect-js-off` reads that href.
      await menuEl.getByRole('link', { name: SAY.disconnect_menu, exact: true }).click()
      await page.waitForSelector('dialog[open]')
    }
    await openConfirm()
    const dialog = page.locator('dialog[open]')
    const onCancel = await page.evaluate(() =>
      document.activeElement ? document.activeElement.hasAttribute('data-cancel') : false)
    // A FIELD IS WHAT THIS RULING FORBIDS, so the assertion is that there is not one — any input
    // that is not the form's own hidden `site_id`.
    const typedFields = await dialog.locator('input:not([type="hidden"]), textarea').count()
    const confirmText = (await dialog.innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
    const confirmButton = dialog.getByRole('button', { name: SAY.disconnect_menu, exact: true })
    // LIVE ON THE FIRST CLICK: nothing greys it, because nothing has to be typed first.
    const armed = (await confirmButton.getAttribute('aria-disabled')) === null
    // The confirm NAMES THE SITE — the app's own `DISCONNECT.title(host)`, interpolated with the
    // very title the card shows (`sites.title`, written from `GET /admin/site/`).
    const titleSaid = confirmText.includes(SAY.disconnect_title.replace('%s', pub1.title || 'Ghost6'))
    await axeAt(page, 'disconnect')
    await dialog.getByRole('button', { name: SAY.disconnect_cancel, exact: true }).click()
    const closedOnCancel = (await page.locator('dialog[open]').count()) === 0
    const stillThere = ((await rowsOf('id,disconnected_at')).find((r) => r.id === t1SiteId) || {})
    step('disconnect-confirm',
      onCancel && typedFields === 0 && armed && titleSaid && closedOnCancel
      && stillThere.disconnected_at === null && confirmText.includes(SAY.disconnect_body),
      `the confirm opens with focus on Cancel = ${onCancel} (EXPERIENCE.md § Destructive confirms), ` +
      `names the site in its title = ${titleSaid} and says what happens ` +
      `(${JSON.stringify(confirmText.slice(0, 120))}); there are ${typedFields} fields to type into — ` +
      `the owner's Question 2 ruling is option 1, a SIMPLE confirm — and Disconnect is live on the ` +
      `first click = ${armed}. Cancel closed it = ${closedOnCancel} and the site is still ` +
      `connected (disconnected_at ${JSON.stringify(stillThere.disconnected_at)})`)

    // axe over the MENU, reopened at each width, because a popover's coordinates are written at
    // the click and do not survive a resize (see `axeAt`).
    await axeAt(page, 'menu', async () => {
      await page.keyboard.press('Escape').catch(() => {})
      await dots().first().click()
      await menuEl.waitFor({ state: 'visible' })
    })
    await page.keyboard.press('Escape').catch(() => {})

    // ── EVERY CONTROL IS A REAL FORM — the same shape `notices-js-off` asserts, on the ONE form
    //    that step's selector deliberately excludes.
    //    A SCRIPTS-OFF BROWSER IS SERVED THE SERVER'S HTML, so `goto` is the setup — the same one
    // `notices-js-off` and `js-off` use, and the one `brand-js-off` was corrected to (runs 2-4):
    // React emits `method="POST"` and the encoded `$ACTION_*` fields only when it renders on the
    // SERVER, so a form reached through a client-side transition carries neither.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const confirmForms = await page.locator('article dialog form').evaluateAll((forms) =>
      forms.map((f) => ({
        method: (f.getAttribute('method') || '').toLowerCase(),
        // `!== null`, NEVER truthiness: React emits `action=""`, which MEANS "post to this page".
        action: f.getAttribute('action') !== null,
        encoded: f.querySelectorAll('input[type="hidden"][name^="$ACTION"]').length,
        site: f.querySelectorAll('input[type="hidden"][name="site_id"]').length,
        // A FIELD TO TYPE INTO IS WHAT THE OWNER'S QUESTION 2 RULING FORBIDS, asserted in the
        // served markup as well as on screen, so re-adding one cannot pass by being hidden.
        typed: f.querySelectorAll('input:not([type="hidden"]), textarea').length,
        submits: f.querySelectorAll('button[type="submit"]').length,
      })))
    const wiredConfirm = confirmForms.filter((f) => f.method === 'post' && f.action && f.encoded > 0
                                                    && f.site === 1 && f.submits === 1 && f.typed === 0)
    /* AND THE ROW THAT OPENS IT HAS A DESTINATION, which is the half the first Dev pass got wrong:
       a `<button onClick>` opens nothing with scripts off. It is an `<a href>` — the shape
       `ConnectSiteButton` already is — so the SAME confirm is reachable as a document at
       `/sites/disconnect?site=<id>`, rendered from the same component and posting the same action.
       Both halves are read out of SERVED markup: the menu row's href off `/sites`, and the route's
       own form off a second `goto` no script touched. */
    const rowHref = await page.locator(`#site-menu-${t1SiteId} a`, { hasText: 'Disconnect' })
      .getAttribute('href')
    await page.goto(`${APP}${rowHref}`, { waitUntil: 'load' })
    const routeForms = await page.locator('form').evaluateAll((forms) =>
      forms.filter((f) => f.querySelector('input[name="site_id"]')).map((f) => ({
        method: (f.getAttribute('method') || '').toLowerCase(),
        action: f.getAttribute('action') !== null,
        encoded: f.querySelectorAll('input[type="hidden"][name^="$ACTION"]').length,
        site: f.querySelectorAll('input[type="hidden"][name="site_id"]').length,
        typed: f.querySelectorAll('input:not([type="hidden"]), textarea').length,
        submits: f.querySelectorAll('button[type="submit"]').length,
      })))
    const routeSaid = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ')
    const wiredRoute = routeForms.filter((f) => f.method === 'post' && f.action && f.encoded > 0
                                                && f.site === 1 && f.submits === 1 && f.typed === 0)
    step('disconnect-js-off',
      confirmForms.length === 1 && wiredConfirm.length === 1
      && rowHref === `/sites/disconnect?site=${t1SiteId}`
      && routeForms.length === 1 && wiredRoute.length === 1
      && routeSaid.includes(SAY.disconnect_body) && routeSaid.includes(SAY.disconnect_cancel),
      `the ⋯ confirm is ${confirmForms.length} real <form> in the SERVED document and ` +
      `${wiredConfirm.length} of them progressively enhanced: method=post, an action attribute, ` +
      `React's encoded $ACTION_* hidden fields, one hidden site_id, one submit and ZERO fields to ` +
      `type into. Read: ${JSON.stringify(confirmForms)}. AND THE ROW THAT OPENS IT IS AN <a href> ` +
      `WITH A DESTINATION (${JSON.stringify(rowHref)}), not a button that does nothing without a ` +
      `script: that route serves ${routeForms.length} form, ${wiredRoute.length} of them wired the ` +
      `same way (${JSON.stringify(routeForms)}), saying the same body sentence and offering the same ` +
      `Cancel — so the ⋯ AND the confirm both work with JavaScript off. The menu itself is a native ` +
      `popover opened by popovertarget; the shell's own no-JS paint is DW-56`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── A SECOND ACCOUNT'S SITE ID, FORGED INTO THIS FORM. `disconnectSite` reads the row through
    //    the CALLER'S OWN session before it writes anything, so RLS refuses it and `notFound()` is
    //    the whole answer — and, because the write below is `supabaseAdmin()`'s, that read is the
    //    only thing standing between two accounts. A negative assertion needs a positive control
    //    (standing rule 2): the press is watched LANDING before the rows are re-read.
    const stranger = ((await insert('/sites', {
      user_id: OTHER_USER_ID, url: 'https://stranger.inflozo.com', title: 'Stranger',
    })).body || [])[0] || {}
    const strangerBefore = JSON.stringify({
      disconnected_at: stranger.disconnected_at, content_key: stranger.content_key,
      credentials_present: stranger.credentials_present,
    })
    await openConfirm()
    const forgedDisconnect = await page.evaluate((id) => {
      const field = document.querySelector('dialog[open] form input[name="site_id"]')
      if (!field) return false
      field.value = id
      field.form.querySelector('button[type="submit"]').click()
      return true
    }, stranger.id)
    const forgedLanded = await page.getByText('could not be found', { exact: false }).first()
      .waitFor({ timeout: 20000 }).then(() => true).catch(() => false)
    const strangerRow = ((await wire(`/sites?id=eq.${stranger.id}&select=*`)).body || [])[0] || {}
    const strangerAfter = JSON.stringify({
      disconnected_at: strangerRow.disconnected_at, content_key: strangerRow.content_key,
      credentials_present: strangerRow.credentials_present,
    })
    const mineUntouched = ((await rowsOf('id,disconnected_at')).find((r) => r.id === t1SiteId) || {})
    step('disconnect-forged',
      Boolean(stranger.id) && forgedDisconnect && forgedLanded && strangerAfter === strangerBefore
      && mineUntouched.disconnected_at === null,
      `a site id owned by a DIFFERENT account was forged into the ⋯ confirm and submitted from the ` +
      `fixture's own session (forged = ${forgedDisconnect}); the press was seen to LAND on the ` +
      `not-found page = ${forgedLanded} — its ownership read came back empty through RLS — and the ` +
      `stranger's row is byte-identical afterwards = ${strangerAfter === strangerBefore} ` +
      `(${strangerAfter}). The caller's own site was not disconnected either ` +
      `(disconnected_at ${JSON.stringify(mineUntouched.disconnected_at)}), which is the other way a ` +
      `guard could be wrong. The stamp runs under supabaseAdmin(), so that read is the whole guard.`)

    // ── THE PRESS. FR-C6 IN ONE STEP: the credentials go and NOTHING ELSE DOES. A fixture
    //    `site_snapshots` row is patched in through the service role — no product code writes one
    //    until Story 7.20 (DW-75) — precisely so the promise "your archived theme stays" has
    //    something to be true about; `brand-logo` is the precedent for a fixture row.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const snapIn = await insert('/site_snapshots', {
      user_id: USER_ID, site_id: t1SiteId, storage_path: `site-snapshots/${USER_ID}/${t1SiteId}/before.zip`,
      theme_name: 'casper', bytes: 1234,
    })
    const snapBefore = JSON.stringify((snapIn.body || [])[0] || null)
    const projectsBeforeDisconnect = await projectsOf()
    const refBefore = await refOf(t1SiteId)
    const secretsBefore = await secretsBehind(refBefore)
    await openConfirm()
    await page.locator('dialog[open]').getByRole('button', { name: SAY.disconnect_menu, exact: true }).click()
    // WITH T1 GONE THE ACCOUNT HAS NO ACTIVE SITE, so `/sites` is the empty screen again — which
    // is also the assertion that the card really left the list rather than merely re-rendering.
    // A FAILURE HERE NAMES ITSELF (the file's own rule, and `brand-ownership` is the precedent):
    // waiting bare threw a locator timeout with no page in it, so a run could not say whether the
    // press had been REFUSED — `remove()` throwing redirects to `?disconnect=<id>` and leaves the
    // card standing, which is a different fault from a press that never arrived (executed
    // 2026-09-09, run 7).
    const wentEmpty = await page.getByText(SAY.empty_title).waitFor({ timeout: 30000 })
      .then(() => true).catch(() => false)
    const endedOn = page.url()
    const endedSaw = wentEmpty ? '' :
      (await page.locator('main').evaluate((el) => el.textContent).catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 160)
    const goneRow = ((await wire(`/sites?id=eq.${t1SiteId}&select=*`)).body || [])[0] || {}
    const gonePresent = goneRow.credentials_present || {}
    const refAfter = await refOf(t1SiteId)
    const secretsAfter = await secretsBehind(refBefore)
    const projectsAfterDisconnect = await projectsOf()
    const stillLinked = projectsAfterDisconnect.filter((r) => r.linked_site_id === t1SiteId).length
    const snapAfter = JSON.stringify(((await wire(`/site_snapshots?site_id=eq.${t1SiteId}&select=*`)).body || [])[0] || null)
    // A RECORD INFLOZO KEPT IS NOT A SITE, AND THE CAP IS THE PLACE THAT SHOWS IT: on FREE, whose
    // cap is one, this account now holds one DISCONNECTED record and no active one — and the page
    // draws NO ghost slot and offers the connect form, which `re-adopt` below then walks through
    // successfully. That is the matrix's "disconnected records and the cap", and the row now names
    // THIS state: it used to read "one active + three disconnected", which on a Free cap of one is
    // at the cap by the active row alone. Flagged here rather than reinterpreted silently, raised as
    // the story's Question 4, and the owner corrected the row (option 1, 2026-09-09) to "none
    // connected + three let go" — the state this step has executed all along.
    const slotsWhileGone = await slotOf().count()
    step('disconnect',
      Boolean(goneRow.id) && Boolean(goneRow.disconnected_at) && goneRow.content_key === null
      && gonePresent.content === false && gonePresent.admin === false && gonePresent.staff === false
      && refAfter === null && secretsBefore === 1 && secretsAfter === 0
      && projectsById(projectsAfterDisconnect) === projectsById(projectsBeforeDisconnect)
      && stillLinked === 1 && snapAfter === snapBefore && snapBefore !== 'null'
      && slotsWhileGone === 0 && wentEmpty,
      `the card left the list and /sites is the empty screen again — and the ROW is still there ` +
      `(FR-C6: a disconnected record is a record Inflozo KEPT), stamped disconnected_at ` +
      `${JSON.stringify(goneRow.disconnected_at)} with content_key null and credentials_present ` +
      `${JSON.stringify(gonePresent)} — every one false, the mirror it claims to be. The vault ref ` +
      `is nulled (${refAfter}) and the secret behind it went from ${secretsBefore} to ` +
      `${secretsAfter} (DW-44's trigger). NOTHING ELSE MOVED: ` +
      `${projectsAfterDisconnect.length} project(s), byte-identical to before = ` +
      `${projectsById(projectsAfterDisconnect) === projectsById(projectsBeforeDisconnect)} — name, ` +
      `style_pack and all — with ${stillLinked} still carrying linked_site_id, and the fixture ` +
      `site_snapshots row untouched = ${snapAfter === snapBefore} (its purge_after is still null: ` +
      `the 90-day orphan clock is DERIVED from sites.disconnected_at and never stamped there, which ` +
      `is what closes DW-43 with no SQL and leaves the job itself to Story 7.20, DW-75). And the ` +
      `RECORD DOES NOT COUNT AGAINST THE CAP: on FREE with one disconnected row and no active one ` +
      `the grid draws ${slotsWhileGone} ghost slot and the connect form is open — which is what ` +
      `re-adopt below then walks through` +
      (wentEmpty ? '' : `. ⚠ THE PRESS DID NOT REACH THE EMPTY SCREEN: it ended on ` +
        `${JSON.stringify(endedOn)} showing ${JSON.stringify(endedSaw)} — a "?disconnect=" in that ` +
        `URL is remove() having thrown and the site still connected, which is the refusal path, not ` +
        `a press that never arrived`))
    // The fixture goes with the site's record only at the cascade; it is removed here so the
    // re-adopt below reads a row this run has not left lying about.
    await fetch(`${SB}/rest/v1/site_snapshots?site_id=eq.${t1SiteId}`, {
      method: 'DELETE', headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    }).catch(() => {})

    // ── FR-C6: a DISCONNECTED record is RE-ADOPTED in place — same id, its `site_settings` intact,
    //    `disconnected_at` cleared, the key re-stored and the OLD secret already dropped by the
    //    trigger (DW-44's replace path, live). SINCE STORY 3.5 THE DISCONNECT ABOVE IS THE
    //    PRODUCT'S OWN: the service role no longer patches the record into that state, which is
    //    what makes this the first run where the re-adoption branch is reached the way a customer
    //    reaches it. With no active site, `/sites` is already the empty screen.
    await page.getByText(SAY.empty_title).waitFor()
    await opener(page).last().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    // STORY 3.4: the reconnect re-probes, so it lands on S2c again — the offer is re-runnable by
    // construction. Skip writes nothing and comes back to the list this step is about.
    await skipS2c(page)
    await page.waitForSelector('text=Connected')
    const readopted = await rowsOf('id,disconnected_at,ghost_version,site_settings')
    const ref1b = t1SiteId ? await refOf(t1SiteId) : null
    // STORY 3.3: re-adopting RE-PROBES, and that is where "the notice never comes back after a
    // re-probe" is proved — the probe writes `site_settings.code_injection` true again while
    // `code_injection_notice_shown_at`, which the connect action never touches, keeps it away.
    const reprobed = (readopted[0] || {}).site_settings || {}
    const noticeBack = await page.getByText(SAY.injection_body).isVisible().catch(() => false)
    step('re-adopt',
      Boolean(goneRow.disconnected_at) && readopted.length === 1 && readopted[0].id === t1SiteId
      && readopted[0].disconnected_at === null && Boolean(ref1b) && ref1b !== ref1
      && (await secretsBehind(ref1)) === 0 && (await secretsBehind(ref1b)) === 1
      && reprobed.code_injection === true && noticeBack === false
      && Boolean(reprobed.public_url) && Boolean(reprobed.brand),
      `the record was disconnected BY THE PRODUCT (the ⋯ menu's own Disconnect, above), /sites became the empty screen, and reconnecting ` +
      `through the sheet its own button opens ` +
      `re-adopted it: same id = ${readopted[0] && readopted[0].id === t1SiteId}, disconnected_at cleared, a NEW ` +
      `vault ref = ${Boolean(ref1b) && ref1b !== ref1}, secrets behind the old ref ${await secretsBehind(ref1)}, ` +
      `behind the new ${await secretsBehind(ref1b)} (the trigger dropped the replaced one); the RE-PROBE wrote ` +
      `code_injection ${reprobed.code_injection} again and the dismissed notice came back = ${noticeBack}; ` +
      `and the record came back CARRYING WHAT IT HELD — site_settings.public_url and .brand both ` +
      `survived the disconnect, which is Story 3.5's own criterion and what makes a re-adopted site ` +
      `the one Inflozo already knew rather than a stranger with the same name`)
    refs.push(ref1b)

    // ── RE-ADOPTION AT THE CAP IS REFUSED, and it is a branch ORDER this run had never reached.
    //    Story 3.2's connect action answers `already_connected` only for a record that is STILL
    //    connected, so a DISCONNECTED one falls through to the cap check below it — "a record
    //    coming back is a site becoming active" (`actions.ts:178`). The `at-cap` step above ran
    //    with no retained record at all, so the fall-through itself was never executed; until
    //    Story 3.5 built `disconnected_at`'s writer, no state in this run could produce one.
    //    T1 is active again and the account is still FREE, whose cap is one, so a retained record
    //    for T3's address is all this needs — and no key is spent: the cap is decided BEFORE
    //    `fetchWithKey`, so nothing reaches Ghost. The row is deleted inside the step, before
    //    `pro-connect-t3` connects T3 for real.
    const retained = ((await insert('/sites', {
      user_id: USER_ID, url: T3.url.replace(/\/$/, ''), title: 'Retained',
      disconnected_at: new Date().toISOString(),
    })).body || [])[0] || {}
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await fill(page, T3.url, T3.adminKey, T3.contentKey)
    await submit(page)
    const refusedAtCap = await page.waitForSelector(`text=${SAY.at_cap}`, { timeout: 20000 })
      .then(() => true).catch(() => false)
    const retainedAfter = ((await wire(`/sites?id=eq.${retained.id}&select=*`)).body || [])[0] || {}
    step('re-adopt-at-cap',
      Boolean(retained.id) && refusedAtCap && retainedAfter.disconnected_at === retained.disconnected_at
      && retainedAfter.content_key === null,
      `on FREE with T1 active and a RETAINED record for T3's address, connecting that address back ` +
      `was refused with ${JSON.stringify(SAY.at_cap)} = ${refusedAtCap} — the app's own ` +
      `siteCapSentence('free') — and the retained record was NOT revived: disconnected_at is the ` +
      `instant it already carried = ${retainedAfter.disconnected_at === retained.disconnected_at} and ` +
      `content_key is still null. That is the branch ORDER: a disconnected record does not answer ` +
      `"already connected", it falls through to the cap, because a record coming back is a site ` +
      `becoming ACTIVE (actions.ts:178). No key was spent — the cap is decided before fetchWithKey`)
    await fetch(`${SB}/rest/v1/sites?id=eq.${retained.id}`, {
      method: 'DELETE', headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    }).catch(() => {})

    // ── ON PRO, THROUGH THE SHEET: T3 with a trailing slash. The row stores the typed origin
    //    without it, the public url as Ghost sends it (with it), `5.130.6` from config/ — and a
    //    connect that succeeds from the sheet CLOSES it, leaving the second card behind. No
    //    billing exists yet (Epic 12), so the service role flips the entitlement row the signup
    //    trigger made.
    const pro = await patch(`/entitlements?user_id=eq.${USER_ID}`, { state: 'pro_active' })
    const pub3 = await publicSite(T3)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, `${T3.url}/`, T3.adminKey, T3.contentKey)
    await submit(page)
    // T3 answers an accent and a menu too (§40), so this connect lands on S2c as well.
    const t3Landed = await skipS2c(page)
    await page.waitForSelector(`text=Ghost ${short(T3.version)}`)
    const both = await rowsOf('*')
    const row3 = both.find((r) => r.url === T3.url) || {}
    t3SiteId = row3.id || null
    const ref3 = t3SiteId ? await refOf(t3SiteId) : null
    refs.push(ref3)
    const sheetLeft = await sheet(page).count()
    const card3 = await cardOf(pub3.title || 'Ghost5').first().innerText().catch(() => '')
    step('pro-connect-t3',
      pro.status === 200 && Array.isArray(pro.body) && pro.body.length === 1 && pro.body[0].state === 'pro_active'
      && both.length === 2 && row3.ghost_version === T3.version && row3.title === pub3.title
      && (row3.site_settings || {}).public_url === pub3.url && Boolean(row3.content_key)
      && Boolean(ref3) && (await secretsBehind(ref3)) === 1 && sheetLeft === 0
      && card3.includes('Connected') && card3.includes(`Ghost ${short(T3.version)}`)
      && page.url().replace(/\?.*$/, '') === `${APP}/sites`,
      `entitlement flipped to pro_active (HTTP ${pro.status}); ${both.length} rows, T3's url stored as ` +
      `${JSON.stringify(row3.url)} from a trailing-slash input, ghost_version ${row3.ghost_version}, ` +
      `public_url ${(row3.site_settings || {}).public_url}, a vault secret behind its ref = ${(await secretsBehind(ref3)) === 1}; ` +
      `the sheet closed on success (${sheetLeft} left open), the connect landed on ${t3Landed} — ` +
      `S2c for T3 (Story 3.4) — and after Skip the second card reads ` +
      `${JSON.stringify(card3.replace(/\s+/g, ' ').trim())}`)

    // ── ...AND S11c's OTHER HALF. On Pro there is nothing further to sell, so there is nothing to
    //    draw: the slot is the FREE cap's alone (the dashboard's own rule, one row down the plan
    //    table). Pro AT its cap needs ten connected sites and no run can make them — the frame's
    //    own answer for that state is the same absence, and it is RECORDED as unexecuted rather
    //    than claimed (⛔, standing rule 1).
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const proSlots = await slotOf().count()
    const proCards = await page.locator('article').count()
    step('ghost-slot-pro',
      proSlots === 0 && proCards === 2,
      `on PRO with ${proCards} sites the grid has ${proSlots} ghost slot — S11c is the FREE cap's ` +
      `alone. Pro AT the cap is ⛔ unexecuted here: it needs ten connected Ghost sites`)

    // ── THE SAME ID POSTED TWICE. A record already disconnected has nothing left to do: the action
    //    finds it through the caller's OWN session, sees the stamp and redirects to /sites without
    //    touching it — NOT `notFound()`, which is a stranger's answer and would tell a customer his
    //    own record had vanished. A row Inflozo KEPT is made by the service role for exactly this
    //    press and deleted again inside this step, so no later count sees it.
    const kept = ((await insert('/sites', {
      user_id: USER_ID, url: 'https://kept.inflozo.com', title: 'Kept',
      disconnected_at: new Date().toISOString(),
    })).body || [])[0] || {}
    const keptBefore = kept.disconnected_at
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const t3Dots = () => cardOf(pub3.title || 'Ghost5').first().getByRole('button', { name: /^Options for / })
    await t3Dots().first().click()
    const t3Menu = page.locator(`#site-menu-${t3SiteId}`)
    await t3Menu.waitFor({ state: 'visible' })
    await t3Menu.getByRole('link', { name: SAY.disconnect_menu, exact: true }).click()
    await page.waitForSelector('dialog[open]')
    await page.evaluate((id) => {
      const field = document.querySelector('dialog[open] form input[name="site_id"]')
      field.value = id
      field.form.querySelector('button[type="submit"]').click()
    }, kept.id)
    // BACK ON /sites, and the ONE assertion that separates this from `notFound()`: the cards are
    // still drawn. `waitForURL` alone would pass on the not-found page if it shared the path.
    const againLanded = await page.waitForURL((u) => u.pathname === '/sites' && !u.search, { timeout: 20000 })
      .then(() => page.waitForSelector('text=Connected', { timeout: 20000 })).then(() => true).catch(() => false)
    const keptAfter = ((await wire(`/sites?id=eq.${kept.id}&select=*`)).body || [])[0] || {}
    const t3Still = ((await rowsOf('id,disconnected_at')).find((r) => r.id === t3SiteId) || {})
    step('disconnect-again',
      Boolean(kept.id) && againLanded && keptAfter.disconnected_at === keptBefore
      && t3Still.disconnected_at === null,
      `an ALREADY-disconnected record of the caller's own, posted a second time: the press landed ` +
      `back on /sites with the cards still drawn = ${againLanded} — a redirect, not the not-found ` +
      `page a stranger's id gets — and the row's disconnected_at is the same instant it already ` +
      `carried (${JSON.stringify(keptAfter.disconnected_at)} = ${keptAfter.disconnected_at === keptBefore}), ` +
      `so the second press re-stamped nothing. The card whose confirm carried the forged id (T3) is ` +
      `still connected (disconnected_at ${JSON.stringify(t3Still.disconnected_at)})`)
    // ── AND THE SAME THREE STATES ON THE ROUTE ITSELF, which is the half a scripts-off browser
    //    reaches. `/sites/disconnect?site=` answered ALL THREE with `notFound()` until the review
    //    of 2026-09-09: a stranger's id (right), a malformed one (right), and an ALREADY
    //    DISCONNECTED one (wrong — it is the caller's own record, and the action redirects it to
    //    `/sites`). Press Disconnect with scripts off and go Back and the browser re-requests this
    //    page, so that third state is on the ordinary path, not a corner of it.
    const routeSays = async (site) => {
      await page.goto(`${APP}/sites/disconnect?site=${site}`, { waitUntil: 'load' }).catch(() => {})
      const saw = await Promise.race([
        page.getByText('could not be found', { exact: false }).first()
          .waitFor({ timeout: 20000 }).then(() => 'not-found').catch(() => null),
        page.waitForURL((u) => u.pathname === '/sites', { timeout: 20000 })
          .then(() => 'sites').catch(() => null),
        page.getByText(SAY.disconnect_cancel, { exact: true }).first()
          .waitFor({ timeout: 20000 }).then(() => 'confirm').catch(() => null),
      ])
      return `${saw} @ ${new URL(page.url()).pathname}`
    }
    const strangerGet = await routeSays(stranger.id)
    const goneGet = await routeSays(kept.id)
    const mangledGet = await routeSays('not-a-uuid')
    step('disconnect-route-answers',
      strangerGet.startsWith('not-found') && goneGet.startsWith('sites')
      && mangledGet.startsWith('not-found'),
      `GET /sites/disconnect?site= — a SECOND ACCOUNT'S id: ${strangerGet} (RLS reads nothing, so ` +
      `there is no page); a MALFORMED id: ${mangledGet} (PostgREST answers 22P02 and there is no ` +
      `row it could be, which is what notFound() says); the caller's OWN ALREADY-DISCONNECTED ` +
      `record: ${goneGet} — a redirect to /sites and NOT the not-found page, the same answer ` +
      `disconnectSite gives that state. All three were one notFound() until the review of ` +
      `2026-09-09, so the third told a customer his own record had vanished`)

    await fetch(`${SB}/rest/v1/sites?id=eq.${kept.id}`, {
      method: 'DELETE', headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    }).catch(() => {})

    // ── AND THE FAILURE THE CUSTOMER SEES. `remove()` throwing — Vault unreachable, the pooler
    //    refusing — leaves the site CONNECTED and redirects here naming it, the shape `?recheck=`
    //    already has: the banner belongs to ONE card and no other claims a failure that was not
    //    its own. The throw itself cannot be induced against a live Vault without breaking it for
    //    every other step, so what is executed is the surface — the parameter's own rendering, on
    //    the two-card page where "only that card" can actually fail.
    await page.goto(`${APP}/sites?disconnect=${t3SiteId}`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const failedCard = await cardOf(pub3.title || 'Ghost5').first().innerText().catch(() => '')
    const otherCard = await cardOf(pub1.title || 'Ghost6').first().innerText().catch(() => '')
    const failedRow = ((await rowsOf('id,disconnected_at')).find((r) => r.id === t3SiteId) || {})
    step('disconnect-failed',
      failedCard.includes(SAY.disconnect_failed) && !otherCard.includes(SAY.disconnect_failed)
      && failedRow.disconnected_at === null,
      `?disconnect=<id> put ${JSON.stringify(SAY.disconnect_failed)} — the app's own ` +
      `connectMessage('disconnect_failed') — on THAT card = ` +
      `${failedCard.includes(SAY.disconnect_failed)} and on no other = ` +
      `${!otherCard.includes(SAY.disconnect_failed)}, and the site is STILL CONNECTED ` +
      `(disconnected_at ${JSON.stringify(failedRow.disconnected_at)}) — which is the whole point of ` +
      `stamping only AFTER remove() returns. ⛔ The throw itself is not induced: breaking the pooler ` +
      `breaks every other step in this run, so the code path is read and the SURFACE is executed`)

    // ── THE OFFER TAKEN A SECOND TIME, WITH ROOM. Every other brand step above ran on a FREE
    //    account whose cap is 1, so the first press filled it and every later press took the
    //    at-cap branch — the one branch where a second press could insert a SECOND project for
    //    the same site was unreachable, and it was the branch that did (review, 2026-09-08).
    //    `pro-connect-t3` has just flipped this account to `pro_active`: one project, 25 allowed.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const beforeRerun = await projectsOf()
    await offer().click()
    await s2cHeading(page).waitFor()
    const saidRebrand = await says(page, SAY.brand_already_on.replace('%s', beforeRerun[0].name))
    const promisedNew = await page.getByText(SAY.brand_will_create).isVisible().catch(() => false)
    await page.getByRole('button', { name: SAY.brand_use, exact: true }).click()
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand')) // pressed in the popup — see review 7
    await page.waitForSelector('text=Connected')
    const afterRerun = await projectsOf()
    // NOT `cardOf('Connected').first()`: `pro-connect-t3` has connected T3, so there are TWO
    // cards saying Connected and the first is not necessarily T1's (executed, review run 1).
    const tallyRerun = await cardOf(pub1.title || 'Ghost6').first().innerText().catch(() => '')
    const sameRow = afterRerun[0] && beforeRerun[0] && afterRerun[0].id === beforeRerun[0].id
      && afterRerun[0].slug === beforeRerun[0].slug && afterRerun[0].name === beforeRerun[0].name
    step('brand-rerun',
      beforeRerun.length === 1 && saidRebrand && !promisedNew
      && afterRerun.length === 1 && sameRow && tallyRerun.includes(SAY.one_project),
      `on PRO with ${beforeRerun.length} project and room to spare — the offer link is ` +
      `still on the card and the caption ASKED, naming the project for this site ` +
      `(${JSON.stringify(SAY.brand_already_on.replace('%s', beforeRerun[0].name))}) = ${saidRebrand}, ` +
      `and did NOT promise a new one = ${!promisedNew}; pressing "${SAY.brand_use}" a second time left ` +
      `${afterRerun.length} project — the same row, name and slug = ${sameRow} — and T1's card reads ` +
      `${JSON.stringify(SAY.one_project)} = ${tallyRerun.includes(SAY.one_project)}. FR-C4's ` +
      `"re-runnable", and the matrix's "seeding again ` +
      `writes the same pack": the offer never retires, so this is the only thing that keeps a press ` +
      `from being a project factory`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })

    // ── THE CHOOSER, WHICH IS THE OWNER'S QUESTION 3 RULING (2026-09-08, his A1/B1): with MORE
    //    THAN ONE project the second press stops telling and starts asking — one card per project,
    //    each carrying that project's OWN wireframe in its OWN colours, the project this site is
    //    already on pre-selected. The account is Pro here, so a second project fits; it is made
    //    through the service role because no screen in this epic makes one for a test.
    // `mode` IS A KEY `defaultStylePack()` DOES NOT CARRY, and that is the whole point of it
    // being here: the fixture's pack used to be byte-identical to the default, so a `useBrand`
    // that REPLACED the column instead of merging it passed every assertion in this file — the
    // action's own docstring claims "a pack E6 has since written survives untouched" and nothing
    // could tell the two apart (review 4, 2026-09-09). The schema is `.loose()`, so an unknown
    // key is exactly what E6 widening the column looks like from here.
    // AND IT CARRIES NO `preset` AT ALL, which makes the OTHER half of the merge discriminate.
    // Review 4 added a floor that repairs a `preset` that is absent or not a string, so the row
    // STORED stays parseable by `stylePackSchema` — and the fixture it landed beside already had
    // `preset: 'paper'`, which is byte-identical to `DEFAULT_PRESET`, so deleting the floor or
    // inverting it left every assertion in this step green (review 5, 2026-09-09). With the key
    // absent, the `preset === 'paper'` assertion below is the floor under execution: it can only
    // pass if `useBrand` put it there. `mode` still discriminates merge-from-replace, so the one
    // fixture now proves both halves.
    //
    // WHAT THIS FIXTURE STILL DOES NOT REACH, said plainly rather than left to be discovered:
    // `linked_site_id` is absent, so the card draws neither label, and `BRAND_COPY.otherSite`
    // ("Another site's project") is the one sentence in BRAND_COPY that NO step renders — delete
    // the branch and the run stays green (review, 2026-09-09). Binding it needs a SECOND site of
    // this account's alive at this point in the run, which the sequence above does not guarantee,
    // so it is written here rather than faked; `thisSite`, the label the ruling turns on, IS
    // asserted, by `brand-picker` and `brand-atcap-picker`.
    const second = (await insert('/projects', {
      user_id: USER_ID, name: 'Field Notes', slug: 'field-notes',
      style_pack: { mode: 'dark' },
    })).body
    const secondId = (second && second[0] && second[0].id) || null
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await offer().click()
    await s2cHeading(page).waitFor()
    const asked = await says(page, SAY.brand_already_on.replace('%s', made.name))
    const askedWhich = await says(page, SAY.brand_which_project)
    const cards = page.locator('fieldset label:has(input[name="project_id"])')
    const cardCount = await cards.count()
    // PRE-SELECTED ON THE PROJECT THIS SITE IS ALREADY ON — the owner's "purely additive": touch
    // nothing and the write is the one he already approved at Question 1.
    const preselected = await page.locator('input[name="project_id"]:checked').getAttribute('value')
    // AND THE THUMBNAILS ARE EACH PROJECT'S OWN COLOUR, which is the whole of what he asked for:
    // the accent block in each card's 64x44 drawing, read off the RENDERED page. The branded one
    // wears the site's accent; the fresh one wears Paper's, so the two cards really are telling
    // the customer apart rather than repeating one picture.
    const thumbs = await cards.locator('span[aria-hidden] > span:last-child > span:nth-child(2)')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
    // ── THE CHOOSER'S OWN JS-OFF READ AND ITS OWN AXE PASS, HERE BECAUSE THIS IS THE ONLY STATE
    //    THAT HAS A CHOOSER IN IT. `brand-js-off` and `axe-brand` both run on the FIRST S2c visit,
    //    when the account has no projects — so the document they read carries the hidden
    //    `project_id` and no cards, and "given the chooser, when JavaScript is off, then it still
    //    posts" was recorded as executed against the one screen with no chooser (review,
    //    2026-09-08). A scripts-off browser is served the SERVER's HTML, so this re-fetches S2c as
    //    a fresh document, as `brand-js-off` does.
    await page.goto(page.url(), { waitUntil: 'load' })
    await s2cHeading(page).waitFor()
    const pickerOff = await page.locator('main form').evaluateAll((forms) => forms.map((f) => ({
      method: (f.getAttribute('method') || '').toLowerCase(),
      action: f.getAttribute('action') !== null,
      encoded: f.querySelectorAll('input[type="hidden"][name^="$ACTION"]').length,
      site: f.querySelectorAll('input[type="hidden"][name="site_id"]').length,
      radios: f.querySelectorAll('input[type="radio"][name="project_id"]').length,
      checked: f.querySelectorAll('input[type="radio"][name="project_id"]:checked').length,
      hidden: f.querySelectorAll('input[type="hidden"][name="project_id"]').length,
      submits: f.querySelectorAll('button[type="submit"]').length,
    })))
    // THE RADIOS MUST BE IN THE FORM THE BUTTON SUBMITS, which is what `querySelectorAll` from the
    // form element asks — the Kit's presentational `RadioCards` would put `role="radio"` on
    // buttons and post nothing, and this is the assertion that would catch that swap.
    const pf = pickerOff.find((f) => f.radios > 0) || {}
    step('brand-picker-js-off',
      pf.method === 'post' && pf.action === true && pf.encoded > 0 && pf.site === 1
      && pf.radios === cardCount && pf.checked === 1 && pf.hidden === 0 && pf.submits === 1,
      `the chooser, in the document a scripts-off browser is served: ${pf.radios} real ` +
      `<input type="radio" name="project_id"> — one per card (${pf.radios === cardCount}) — INSIDE ` +
      `the method=post form that carries the hidden site_id and the submit button, with exactly ` +
      `${pf.checked} pre-checked and ${pf.hidden} leftover hidden decision fields. It posts with ` +
      `no JavaScript at all, which is the owner's A1 shape and the only one that does`)
    await axeAt(page, 'brand-picker')

    // PICK THE OTHER ONE and press: the brand must land on the card that was chosen, not on the
    // one the rule would have picked on its own.
    await page.locator(`input[name="project_id"][value="${secondId}"]`).check()
    await page.getByRole('button', { name: SAY.brand_use, exact: true }).click()
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand')) // pressed in the popup — see review 7
    await page.waitForSelector('text=Connected')
    const afterPick = await projectsOf()
    const chosenRow = afterPick.find((r) => r.id === secondId) || {}
    const untouched = afterPick.find((r) => r.id === made.id) || {}
    step('brand-picker',
      Boolean(secondId) && asked && askedWhich && cardCount === 2
      && preselected === made.id && thumbs.length === 2
      && thumbs.includes(rgbOf(brandRead.accent)) && new Set(thumbs).size === 2
      && afterPick.length === 2
      && ((chosenRow.style_pack || {}).brand || {}).accent === brandRead.accent
      && (chosenRow.style_pack || {}).mode === 'dark' && (chosenRow.style_pack || {}).preset === 'paper'
      && chosenRow.name === 'Field Notes' && chosenRow.slug === 'field-notes'
      && chosenRow.linked_site_id === null
      && untouched.name === made.name && untouched.slug === made.slug
      && untouched.linked_site_id === t1SiteId,
      `with 2 projects the second press ASKED ` +
      `(${JSON.stringify(SAY.brand_already_on.replace('%s', made.name))} = ${asked}, ` +
      `${JSON.stringify(SAY.brand_which_project)} = ${askedWhich}) and drew ${cardCount} cards, ` +
      `pre-selected on ${preselected === made.id ? 'the project this site is already on' : preselected} ` +
      `— touch nothing and the write is Question 1's. The two wireframes computed to ` +
      `${JSON.stringify(thumbs)}: the site's accent ${rgbOf(brandRead.accent)} on the branded card ` +
      `and a different colour on the fresh one (${new Set(thumbs).size} distinct), so the drawings ` +
      `tell the projects apart — FR-B1's Style-Pack placeholder, claiming to be no preview. ` +
      `Choosing "Field Notes" put the brand on THAT row (accent ` +
      `${((chosenRow.style_pack || {}).brand || {}).accent}) and changed nothing else about it — ` +
      `name, slug and a null linked_site_id intact — while "${made.name}" kept its own binding to ` +
      `the site. THE PACK WAS MERGED AND NOT REPLACED: the fixture's own \`mode\` came back as ` +
      `${JSON.stringify((chosenRow.style_pack || {}).mode)} beside preset ` +
      `${JSON.stringify((chosenRow.style_pack || {}).preset)}, which is the action's "a pack E6 ` +
      `has since written survives untouched" under execution rather than in a comment. ` +
      `AND THE PRESET FLOOR TOO: the fixture was inserted with NO preset, so a stored ` +
      `${JSON.stringify((chosenRow.style_pack || {}).preset)} is review 4's repair running, not ` +
      `the fixture's own value being echoed back. ` +
      `Still ${afterPick.length} projects: a chooser, never a factory`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })

    // ── THE OWNER'S QUESTION 4 RULING (2026-09-08, option 1), EXECUTED: at the cap, with a choice
    //    to offer, the card already TICKED is the project for THIS SITE — the one carrying the
    //    "This site's project" label — and not the one worked on most recently. Before the ruling
    //    those could be two different cards, which is what he was shown and settled.
    //    THE STATE IS A DOWNGRADE, and it is the only way to be at the cap WITH more than one
    //    project: this account is Pro with 2, and Free includes 1. The entitlement is flipped
    //    through the service role, as `pro-connect-t3` flips it the other way, and put back in a
    //    `finally` so nothing after this step inherits a plan it did not ask for.
    try {
      await patch(`/entitlements?user_id=eq.${USER_ID}`, { state: 'free' })
      await page.goto(`${APP}/sites`, { waitUntil: 'load' })
      await offer().click()
      await s2cHeading(page).waitFor()
      // The cards are drawn in the page's own `updated_at desc, id desc` order, so the FIRST one
      // is what the pre-ruling rule would have ticked. Reading it is what makes this a
      // discriminator rather than a tautology: if the two are the same row, the step says so.
      const order = await page.locator('input[name="project_id"]')
        .evaluateAll((els) => els.map((el) => el.value))
      const tickedAtCap = await page.locator('input[name="project_id"]:checked').getAttribute('value')
      // THE TICK AND THE LABEL ON THE SAME CARD, which is the whole of what he ruled — read off
      // the label element that CONTAINS the checked radio, not off two separate locators.
      const tickedCard = await page.locator('label:has(input[name="project_id"]:checked)').innerText()
      /* THE OWNER'S QUESTION 6 RULING (option 1, 2026-09-09), AND ITS OWN CONTROL. This state —
         at the cap AND with cards — used to print the sentence that NAMES a project, so the
         caption answered and the cards then asked. It must now print the one that names none, and
         the named one must be GONE from this screen: asserting only the new sentence would pass on
         a page that printed both. `brand-atcap` next door still asserts `brand_will_brand` at the
         cap with ONE project, so the sentence this step now refuses is proved alive elsewhere in
         the same run — the pair is what makes each assertion mean something. */
      const cappedCaption = await says(page, SAY.brand_at_limit_choose)
      const oldCaption = await says(page, SAY.brand_will_brand.replace('%s', made.name))
      step('brand-atcap-picker',
        order.length === 2 && tickedAtCap === made.id
        && tickedCard.includes(SAY.brand_this_site) && tickedCard.includes(made.name)
        && cappedCaption && !oldCaption,
        `downgraded to Free with ${order.length} projects — at the cap AND with a choice, which no ` +
        `other step reaches: the ticked card is ${JSON.stringify(made.name)}, the project for THIS ` +
        `SITE (${tickedAtCap === made.id}), and it is the same card that carries ` +
        `${JSON.stringify(SAY.brand_this_site)} (${tickedCard.includes(SAY.brand_this_site)}) — the ` +
        `owner's Question 4 ruling, where the pre-ruling rule would have ticked the first card in ` +
        `${JSON.stringify(order)}, ${order[0] === made.id ? 'which is the SAME row here' : 'a DIFFERENT row'}. ` +
        `THE CAPTION HANDS THE CHOICE OVER rather than pre-answering it (his Question 6, option ` +
        `1): it printed ${JSON.stringify(SAY.brand_at_limit_choose)} = ${cappedCaption}, and the ` +
        `sentence that NAMES a project — the one this screen printed before the ruling — is gone ` +
        `= ${!oldCaption}. It still names one at the cap with a single project, which is what ` +
        `brand-atcap asserts in this same run`)
    } finally {
      await patch(`/entitlements?user_id=eq.${USER_ID}`, { state: 'pro_active' })
      await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    }

    // ── THE SEARCH HE ASKED FOR (finding 5, amended): the shell's own field, on Sites, matching a
    //    site by its TITLE or its ADDRESS. It is the dashboard's field with a different noun, so
    //    what is proved here is the match and the empty answer, on the deployed page.
    const searchFor = async (text) => {
      await page.fill('input[name="q"]:visible', text)
      await page.keyboard.press('Enter')
      await page.waitForURL((u) => u.searchParams.get('q') === text)
      // `next/form` navigates on the client, so the grid re-renders a beat after the URL moves.
      await page.waitForTimeout(800)
      return page.locator('article').count()
    }
    const byTitle = await searchFor(pub1.title || 'Ghost6')
    const byAddress = await searchFor(new URL(T3.url).host)
    const byNothing = await searchFor('zzznomatch')
    // `no_match` was evaluated from the app as `noMatch('zzznomatch')`, which is the word just
    //    searched for — so the sentence on screen is the app's own, whole.
    const emptyAnswer = await page.getByText(SAY.no_match).isVisible().catch(() => false)
    step('search',
      byTitle === 1 && byAddress === 1 && byNothing === 0 && emptyAnswer,
      `two cards, then one: searching the title ${JSON.stringify(pub1.title)} left ${byTitle} card, ` +
      `searching the address ${JSON.stringify(new URL(T3.url).host)} left ${byAddress}, and a word that ` +
      `matches nothing left ${byNothing} with the app's own "No sites match …" = ${emptyAnswer}`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── STORY 3.3's TWO QUESTIONS, AND B15. Each of the three states below is one NO UI CAN YET
    //    PRODUCE — a Ghost that hides `portal_button`, and a Ghost(Pro) plan whose payload is
    //    UNOBSERVED (⛔ §4 T4: no such site exists until the launch-gate Starter trial). So each is
    //    seeded on the throwaway user's OWN row through the service role, exactly as 3.2 seeded a
    //    disconnected record and a Pro entitlement, and then DRIVEN in the browser on the deployed
    //    site: the screen is real even though the Ghost that would cause it is not.

    const settingsOfT1 = async () =>
      ((await rowsOf('id,capability,capability_source,site_settings')).find((r) => r.id === t1SiteId) || {})

    // The Portal question: `portal_button_source` `default` is what the probe writes when Ghost's
    // payload had no boolean. "Yes" is the primary, because Portal defaults to ON.
    const seedPortal = await patchSettings(t1SiteId, { portal_button_source: 'default' })
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.portal_body).waitFor()
    await page.getByRole('button', { name: SAY.portal_yes }).first().click()
    const portalAnswered = (await until(async () => {
      const settings = (await settingsOfT1()).site_settings || {}
      return settings.portal_button_source === 'declared' ? settings : null
    })) || {}
    step('portal-question',
      seedPortal.status === 200 && portalAnswered.portal_button === true
      && portalAnswered.portal_button_source === 'declared',
      `seeded portal_button_source = default (HTTP ${seedPortal.status}); the ONE question appeared with ` +
      `${JSON.stringify(SAY.portal_yes)} as the primary, and answering it wrote portal_button ` +
      `${portalAnswered.portal_button} with source ${JSON.stringify(portalAnswered.portal_button_source)} ` +
      `— never 'probe', which only a real read may write (Story 3.7 re-reads it)`)

    // The plan question: the ONE path in the whole story that asks (FR-C8), reachable only when
    // `hostSettings` was present and its shape could not be read.
    const seedPlan = await patchSettings(t1SiteId, { plan_ask: true })
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.plan_body).waitFor()
    await page.getByRole('button', { name: SAY.plan_preview }).first().click()
    const planned = (await until(async () => {
      const row = await settingsOfT1()
      return row.capability_source === 'user_declared' ? row : null
    })) || {}
    step('plan-question',
      seedPlan.status === 200 && planned.capability === 'preview_only'
      && planned.capability_source === 'user_declared' && (planned.site_settings || {}).plan_ask === undefined,
      `seeded plan_ask = true (HTTP ${seedPlan.status}); answering ${JSON.stringify(SAY.plan_preview)} wrote ` +
      `capability ${planned.capability} with source ${planned.capability_source} — user_declared, never probe ` +
      `— and cleared plan_ask = ${(planned.site_settings || {}).plan_ask === undefined}`)

    // Every block at once, for axe: the site is preview_only from the answer above, and the other
    // three states are seeded back on beside it.
    await patchSettings(t1SiteId, { portal_button_source: 'default', plan_ask: true })
    await patch(`/sites?id=eq.${t1SiteId}`, { code_injection_notice_shown_at: null })
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.preview_title).waitFor()

    // ── EVERY CONTROL THIS STORY ADDS IS A FORM, and this is that assertion made where all of them
    //    are on screen at once: the code-injection notice's Got it, both answers of each question,
    //    and B15's Re-check plan — plus the second card's own notice. Same shape `js-off` asserts
    //    for the keys form: `method=post`, an `action` attribute that posts to the page, and the
    //    encoded `$ACTION_*` hidden fields a scripts-off POST carries to reach the server action.
    //    None of these is a client component and none of them holds state; the shell's own no-JS
    //    paint is DW-56 and not this story's.
    /* `:not(dialog form)` IS STORY 3.5's, and it is not decoration. The ⋯ menu's confirm is a
       `<form action={disconnectSite}>` carrying its OWN hidden `site_id`, and it lives INSIDE the
       same `<article>` — first in document order, because the ⋯ is in the header row. Without this
       the count below would silently start including it, and `ownership` below would forge the
       stranger's id into the DISCONNECT form instead of a notice form: the row it re-reads would
       still look untouched (nothing there compares `disconnected_at`) while the guard the step
       exists for went unexercised. The disconnect form has its own step, `disconnect-js-off`. */
    const NOTICE_FORM = 'article form:not(dialog form):has(input[name="site_id"])'
    const noticeForms = await page.locator(NOTICE_FORM).evaluateAll((forms) =>
      forms.map((f) => ({
        method: (f.getAttribute('method') || '').toLowerCase(),
        action: f.getAttribute('action') !== null,
        encoded: [...f.querySelectorAll('input[type="hidden"]')].some((i) => i.name.startsWith('$ACTION')),
        site: [...f.querySelectorAll('input[name="site_id"]')].length,
        submits: f.querySelectorAll('button[type="submit"]').length,
      })))
    const wired = noticeForms.filter((f) => f.method === 'post' && f.action && f.encoded
                                            && f.site === 1 && f.submits === 1)
    // THE EXPECTED COUNT IS DERIVED FROM WHAT IS ON SCREEN, not written down. `>= 6` was a floor
    // the run cleared by one, so exactly one control could become a client `onClick` — vanishing
    // from a locator that can only ever match forms — and the step would still pass while that
    // control silently stopped working with scripts off (review, 2026-09-08). Counting every
    // BUTTON inside the notice blocks and requiring one form per button closes it: a control that
    // leaves the form set is still counted on the button side, so the two numbers disagree.
    // `:not(dialog button)` AND NOT `article :not(dialog) button`: the latter reads "a button under
    // SOME element that is not a dialog", and the ⋯ confirm's Submit has a plain <div> for a parent,
    // so it matched and this step went red the first live run after Story 3.5 landed (executed,
    // 2026-09-09). Excluding by ANCESTOR is what the form selector above already does.
    const noticeButtons = await page.locator('article button[type="submit"]:not(dialog button)').count()
    step('notices-js-off',
      noticeForms.length > 0 && wired.length === noticeForms.length && noticeForms.length === noticeButtons,
      `${noticeButtons} submit control(s) on the two cards — Got it, both answers of each question and ` +
      `Re-check plan — against ${noticeForms.length} form(s) wrapping them (equal = ` +
      `${noticeForms.length === noticeButtons}: every control is a form, none is a client handler), and ` +
      `${wired.length} of them are progressively-enhanced server actions: method=post, an ` +
      `action attribute, React's encoded $ACTION_* hidden fields, exactly one hidden site_id and one submit ` +
      `each. No client component, no state (the shell's own no-JS paint is DW-56).`)

    await axeAt(page, 'notices')

    // ── OWNERSHIP, AND IT IS THE ONLY THING BETWEEN TWO ACCOUNTS. The four actions this story
    //    adds write through `supabaseAdmin()`, which bypasses RLS by construction, and the site
    //    id arrives as a FORM FIELD — so `.eq('user_id', user.id)` in `writeSite`/`rowFor` is the
    //    whole guard, and until now no test in the repository observed it: deleting that one line
    //    left `pnpm check`, the RLS gate and every step here green, because the unit tests never
    //    call an action and this harness only ever ran as a single user (review, 2026-09-08,
    //    Verification Gap). So: a row belonging to SOMEBODY ELSE, forged into a form the fixture
    //    legitimately has on screen, submitted from the fixture's own session.
    const foreign = (await insert('/sites', {
      user_id: OTHER_USER_ID, url: 'https://foreign.inflozo.com', title: 'Foreign',
      capability: 'preview_only', capability_source: 'user_declared',
    })).body
    const foreignId = (foreign && foreign[0] && foreign[0].id) || null
    // `disconnected_at` AND `credentials_present` ARE IN THE COMPARISON SINCE STORY 3.5: the page
    // now carries a form that writes exactly those two, so a post that reached the wrong form must
    // be able to fail this step rather than pass it by being compared on the wrong columns.
    const foreignFields = (r) => JSON.stringify(r ? {
      capability: r.capability, source: r.capability_source,
      shown: r.code_injection_notice_shown_at, site_settings: r.site_settings,
      disconnected_at: r.disconnected_at, credentials_present: r.credentials_present,
    } : null)
    const foreignBefore = foreignFields(foreign && foreign[0])
    // Swap the hidden id in the FIRST notice form and submit it — the same POST a hand-rolled
    // curl would make, made through the page so the action sees a real session.
    const forged = await page.evaluate((id) => {
      // A NOTICE form, never the ⋯ confirm — see the selector note at `notices-js-off`.
      const field = document.querySelector('article form:not(dialog form) input[name="site_id"]')
      if (!field) return false
      field.value = id
      field.form.querySelector('button[type="submit"]').click()
      return true
    }, foreignId)
    await page.waitForLoadState('networkidle').catch(() => {})
    const foreignRow = ((await wire(`/sites?id=eq.${foreignId}&select=*`)).body || [])[0] || {}
    const foreignAfter = foreignFields(foreignRow)
    step('ownership',
      Boolean(foreignId) && forged && foreignAfter === foreignBefore,
      `a site row owned by a DIFFERENT account was forged into a notice form and submitted from ` +
      `the fixture's own session (forged = ${forged}); the row is byte-identical afterwards = ` +
      `${foreignAfter === foreignBefore} (${foreignAfter}). The service role bypasses RLS, so ` +
      `.eq('user_id') in the action is the only thing that refused it.`)

    // ── THE SAME QUESTION, ASKED OF STORY 3.4's TWO ACTIONS, because its acceptance criterion
    //    says "when the page is opened OR EITHER ACTION IS POSTED" and only the page had ever
    //    been asked — with a uuid no row anywhere carries, which RLS never had to refuse
    //    (review, 2026-09-08). These two write `projects` through the CALLER'S OWN session, so
    //    the guard is RLS itself rather than an `.eq()`: a stranger's site id reads back no row
    //    and `useBrand` throws `notFound()` before it can decide anything.
    const foreignPage = await rendered(`${APP}/sites/brand?site=${foreignId}`)
    /* THE SAME ID IN THE POPUP'S ADDRESS. `brand-screen.tsx`'s `gone()` 404s on the full page and
       redirects to `/sites` in the window — because a `notFound()` inside the list's own
       `<Suspense>` would take the whole Sites list with it. Nothing had driven that branch
       (review 7, 2026-09-10): the list must be there, and no window. */
    await page.goto(`${APP}/sites?brand=${foreignId}`, { waitUntil: 'load' })
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'), { timeout: NAV_TIMEOUT })
      .catch(() => {})
    await page.waitForSelector('text=Connected').catch(() => {})
    const foreignPopup = await page.evaluate(() => ({
      brandParam: new URL(location.href).searchParams.get('brand'),
      dialogInDom: !!document.querySelector('dialog[aria-labelledby="brand-panel-title"]'),
      cards: document.querySelectorAll('article').length,
    }))
    const foreignPopupClosed = !foreignPopup.brandParam && !foreignPopup.dialogInDom && foreignPopup.cards > 0
    const projectsBefore = await projectsOf()
    // The forge is made on S2c ITSELF — the fixture's own, legitimately on screen — so both hidden
    // fields and React's `$ACTION_*` are the real ones and only the site id is a stranger's.
    const forgeBrand = async (label) => {
      await page.goto(`${APP}${offerHref}`, { waitUntil: 'load' })
      await s2cHeading(page).waitFor()
      return page.evaluate(([id, name]) => {
        // `innerText`, not `textContent`: `BusyLabel` keeps BOTH labels in the button and hides
        // one with `visibility: hidden`, which `innerText` omits and `textContent` concatenates —
        // so this found no button, pressed nothing, and the byte-identical re-read passed for the
        // wrong reason (review 7, 2026-09-10 — the run's own FAIL).
        const button = [...document.querySelectorAll('button[type="submit"]')]
          .find((b) => b.innerText.trim() === name)
        if (!button) return false
        button.form.querySelector('input[name="site_id"]').value = id
        button.click()
        return true
      }, [foreignId, label])
    }
    // A NEGATIVE ASSERTION NEEDS A POSITIVE CONTROL (standing rule 2). `forgeBrand` returns true
    // because it FOUND the button and called click() — not because the server ever saw the post —
    // and `networkidle` is swallowed with `.catch(() => {})`, so a press that had not landed yet
    // satisfied "the projects are byte-identical" for the wrong reason. Both actions have an
    // observable server answer and this now waits for it: the forged **Use your brand** reaches
    // `useBrand`, whose site read returns no row through RLS, so it calls `notFound()` and the
    // not-found page renders; the forged **Skip** redirects to `/sites`. Either one proves the
    // round trip completed before the rows are re-read (review 5, 2026-09-09).
    const forgedUse = await forgeBrand(SAY.brand_use)
    /* THE POST HAS TWO OBSERVABLE LANDINGS AND THE CONTROL TAKES EITHER, because what it is here
       to prove is that the press REACHED the server — not which branch the server then chose.
       `useBrand`'s site read is `.maybeSingle()`: a stranger's row comes back as no row and no
       error and it calls `notFound()`, but a read that ERRORS redirects to `&failed=1` instead,
       deliberately ("one transient PostgREST failure is not a stranger's row", review 4). Waiting
       only for the not-found page therefore reported "the press never arrived" about a press that
       had arrived and been refused the other way — twice in five runs, while the security claim
       beneath it (no row written, nothing linked to the stranger's site) passed every time.
       Which landing happened is RECORDED, so a run says which branch it exercised rather than
       hiding the difference (executed 2026-09-09, runs 2 and 5). */
    const sawNotFound = await page.getByText('could not be found', { exact: false }).first()
      .waitFor({ timeout: 20000 }).then(() => true).catch(() => false)
    /* AND WHERE IT ACTUALLY WENT, read after the wait rather than waited on: `page.waitForURL` is
       wrapped by the DW-68 retry, so racing one against the locator spent a second 20s and two
       navRetries on a step that had already answered. */
    const forgedUseUrl = page.url()
    const forgedUseSaw = (await page.locator('main').evaluate((el) => el.textContent).catch(() => ''))
      .replace(/\s+/g, ' ').trim().slice(0, 140)
    const forgedUseLanded = sawNotFound ? 'not-found'
      : (new URL(forgedUseUrl).searchParams.get('failed') === '1' ? 'failed-redirect' : null)
    const afterUse = await projectsOf()
    const forgedSkip = await forgeBrand(SAY.brand_skip)
    const forgedSkipLanded = await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('brand'))
      .then(() => true).catch(() => false)
    const afterForgedSkip = await projectsOf()
    // NOT A RE-READ COMPARED WITH ITSELF: nothing may now be LINKED to the stranger's site, which
    // is the one row `useBrand` could have written if RLS had let it through.
    const linkedToForeign = afterForgedSkip.filter((row) => row.linked_site_id === foreignId).length
    step('brand-ownership',
      foreignPage.saw === 'not-found' && foreignPopupClosed && forgedUse && forgedSkip
      && Boolean(forgedUseLanded) && forgedSkipLanded
      && afterUse.length === projectsBefore.length && afterForgedSkip.length === projectsBefore.length
      && projectsById(afterUse) === projectsById(projectsBefore)
      && projectsById(afterForgedSkip) === projectsById(projectsBefore) && linkedToForeign === 0,
      `/sites/brand?site= a row a DIFFERENT account owns rendered ${JSON.stringify(foreignPage.saw)} — ` +
      `and as /sites?brand= the WINDOW closed onto the list (brand param ` +
      `${JSON.stringify(foreignPopup.brandParam)}, dialog ${foreignPopup.dialogInDom}, ` +
      `${foreignPopup.cards} cards), never the 404 over the list — ` +
      `RLS returns no row and no row is not found; then that same id was forged into S2c's OWN ` +
      `"${SAY.brand_use}" form (${forgedUse}) and its "${SAY.brand_skip}" form (${forgedSkip}) and ` +
      `submitted from the fixture's session — and EACH POST WAS SEEN TO LAND before the rows were ` +
      `re-read (the forged Use reached useBrand and was refused, landing on ` +
      `${JSON.stringify(forgedUseLanded)} — "not-found" is its site read coming back EMPTY through ` +
      `RLS and "failed-redirect" is that read erroring, and both are the server answering this ` +
      `press. It ended on ${JSON.stringify(forgedUseUrl)} showing ${JSON.stringify(forgedUseSaw)}; ` +
      `the forged Skip redirected to /sites = ` +
      `${forgedSkipLanded}), because a byte-identical re-read proves nothing about a press that ` +
      `never arrived. The caller still has ${afterUse.length} project, ` +
      `byte-identical to the ${projectsBefore.length} it had before ` +
      `(${projectsById(afterUse) === projectsById(projectsBefore)}` +
      // A DIFFERENCE NAMES ITSELF. A boolean here cost the review a run it could not explain.
      `${projectsById(afterUse) === projectsById(projectsBefore) ? '' :
         `; before=${projectsById(projectsBefore)} afterUse=${projectsById(afterUse)} ` +
         `afterSkip=${projectsById(afterForgedSkip)}`}), and ${linkedToForeign} of them ` +
      `is linked to the stranger's site — the one row a press could have written. These two write ` +
      `through the caller's OWN session, so RLS is the guard and not an .eq() — the acceptance ` +
      `criterion's "or either action is posted", executed`)

    // ── B15, THE PREVIEW-ONLY NOTICE (`B Missing Surfaces.dc.html:1188-1225`), on the deployed
    //    card at the three widths the spec names — and then its own Re-check plan, which is the
    //    matrix's "a site that now allows custom themes clears to `full` on its own": T1 is
    //    self-hosted, so the re-run probe finds no `hostSettings` and clears it.
    await patchSettings(t1SiteId, { plan_ask: undefined })
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.preview_title).waitFor()
    const t1Card = page.locator('article', { hasText: SAY.preview_title }).first()
    const widths = []
    let placed = true
    for (const width of [1440, 834, 390]) {
      await page.setViewportSize({ width, height: 1200 })
      const chipBox = await boxOf(t1Card.getByText(SAY.preview_chip, { exact: true }))
      const stateBox = await boxOf(t1Card.getByText('Connected', { exact: true }))
      const pillBox = await boxOf(t1Card.getByText(`Ghost ${short(T1.version)}`))
      const checkBox = await boxOf(t1Card.getByText('Checked', { exact: false }).first())
      const inner = Math.round((await boxOf(t1Card)).width - 36)
      // B15 MUST ALSO FIT THE CARD IT IS IN. The chip's placement was measured at all three
      // widths and the BLOCK below it at none — and 834 is the width that squeezes: a padded sky
      // panel, an ordered list with an 18px marker, and a 36px button inside ~139px of content
      // (review, 2026-09-08). A block wider than its own scroll box is content running off the
      // card, which is the one thing the owner would see and no assertion would.
      const overflow = await t1Card.locator('section[aria-labelledby^="preview-"]').evaluate(
        (el) => el.scrollWidth - el.clientWidth)
      if (overflow > 1) placed = false
      // DW-57 IS THE RULE AND THIS IS IT: the chip is on the STATE line — below the metadata
      // pills, never on them, and above the "Checked …" timestamp the state line ends with.
      const onStateLine = chipBox.y > pillBox.y && chipBox.y <= checkBox.y
      // BESIDE "Connected" WHEREVER THE CARD CAN HOLD BOTH, and it cannot at 834: the shell's
      // 220px sidebar plus the three-column grid leave the card about 139px of content, and
      // "Connected" and the chip measure 78 and 109 (measured with the app's own fonts,
      // 2026-09-08). The two metadata PILLS already stack there for the same reason, which is
      // the layout the owner tested and accepted at 3.2 — so the chip wraps with them rather
      // than the story quietly re-flowing his card. HE RULED IT (2026-09-08, spec Question 2):
      // "Leave it — the tag wraps on a tablet and nowhere else", and declined widening the grid.
      // DW-57 carries the rule 3.5 and 3.7 inherit: ON the state line always, BESIDE "Connected"
      // only where the card can hold it.
      const beside = Math.abs(chipBox.y - stateBox.y) <= 6
      const fits = inner >= 195
      widths.push(`${width}: card ${inner}px, chip y ${Math.round(chipBox.y)} · Connected ` +
                  `${Math.round(stateBox.y)} · pills ${Math.round(pillBox.y)} · Checked ` +
                  `${Math.round(checkBox.y)} — on the state line = ${onStateLine}, B15 overflow ` +
                  `${overflow}px, beside Connected = ${beside}` +
                  `${fits ? '' : ' (the card is too narrow for both, as it is for the two pills)'}`)
      if (!onStateLine || (fits && !beside)) placed = false
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await shoot(page, 'b15')
    // `innerText` is the RENDERED text, so the frame's uppercase "What clears this" comes back
    // upper-cased by CSS rather than by the copy — matched case-insensitively for that reason
    // (run 3 of the Dev harness failed on exactly this, and it was the harness, not the product).
    const b15 = await t1Card.innerText()
    const said = (text) => b15.toLowerCase().includes(text.toLowerCase())
    const clears = SAY.preview_clears.every((line) => said(line))
    const absent = !/Export theme zip|Ship it/i.test(b15)
    // Re-check plan: the same probe, re-run, on a site that is really self-hosted.
    await page.getByRole('button', { name: SAY.preview_recheck }).first().click()
    const cleared = (await until(async () => {
      const row = await settingsOfT1()
      return row.capability === 'full' ? row : null
    })) || {}
    step('preview-notice',
      placed && said(SAY.preview_title) && said(SAY.preview_clears_title) && clears && absent
      && cleared.capability === 'full' && cleared.capability_source === 'probe',
      `B15 on the deployed card: the sky panel's own cause sentence = ${said(SAY.preview_title)}, ` +
      `${JSON.stringify(SAY.preview_clears_title)} with ` +
      `both routes out present = ${clears} (Publisher or higher, and self-hosted), and Export theme zip / ` +
      `Ship it ABSENT = ${absent} (UX-DR3 — neither path exists until E11 and E7). The chip was on the STATE ` +
      `line at every width, and beside Connected wherever the card could hold both — ${widths.join(' | ')}. ` +
      `Then Re-check plan re-ran the probe and a self-hosted Ghost cleared itself: capability ` +
      `${cleared.capability}, source ${cleared.capability_source}`)

    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── The audit trail, through the pooler: three connects, each `config/` with a NULL site_id
    //    and each `site/` carrying the id; the bogus key at 401; the plain-http call at 301.
    const audit = await sql`
      select action::text as action, route, site_id, outcome, detail
        from private.credential_audit
       where user_id = ${USER_ID}
       order by occurred_at, id
    `
    const reads = audit.filter((r) => r.action === 'admin_read')
    const beforeRow = reads.filter((r) => r.outcome === 'ok' && r.site_id === null)
    const withRow = reads.filter((r) => r.outcome === 'ok' && r.site_id !== null)
    const errs = reads.filter((r) => r.outcome === 'error')
    const at = (status) => errs.filter((r) => String((r.detail || {}).status) === status)
    const httpStatuses = errs.map((r) => (r.detail || {}).status).filter((v) => v !== undefined)
    // EVERY ROW CARRIES THE ROUTE OF THE ACTION THAT WROTE IT, and since Story 3.6 that is no
    // longer one string: `remove()` audits, and the only caller that has removed a key by here is
    // `disconnectSite`, whose route is its own. Stamping a removal `sites/connect` is the exact
    // defect the review of 2026-09-09 named before the rows existed, so the assertion is the SET
    // and each action's rows are checked against it below.
    const routes = [...new Set(audit.map((r) => r.route))].sort()
    const stamped = audit.every((r) => (r.action === 'credential_change' ? true : r.route === ROUTE))
    const objects = audit.every((r) => r.detail !== null && typeof r.detail === 'object')
    const leak = audit.filter((r) => /[0-9a-f]{16,}:[0-9a-f]{16,}/.test(JSON.stringify(r)))
    // DW-76, CLOSED BY STORY 3.6 AND EXECUTED HERE. A key going IN and a key coming OUT each leave
    // one row, in the same transaction as the write. One `in` per
    // connect (every connect stores the Admin key) and one `out` per removal that ACTUALLY took a
    // key — which is the single `disconnect` above, because `remove('staff')` matches no row on a
    // site that never had a token and must therefore write nothing.
    const changes = audit.filter((r) => r.action === 'credential_change')
    const wentIn = changes.filter((r) => (r.detail || {}).direction === 'in')
    const cameOut = changes.filter((r) => (r.detail || {}).direction === 'out')
    // NOT DERIVED FROM THE ROWS, AND IT MUST NOT BE: an expectation read out of the thing it is
    // asserting is vacuous. It is the RUN'S OWN count, declared here beside `CONNECTS` below and
    // for the same reason — this script performs exactly one disconnect, and that disconnect is
    // the only press in the run that takes a credential out (review, 2026-09-09, correcting the
    // comment above, which claimed both were derived).
    const REMOVALS = 1
    const changeRoutes = [...new Set(changes.map((r) => r.route))].sort()
    // Nothing in a `credential_change` detail but the kind and the direction — `AuditDetail` is the
    // type-level guard and this is the live one.
    const changeDetail = changes.every((r) =>
      Object.keys(r.detail || {}).sort().join(',') === 'direction,kind'
      && ['admin', 'staff'].includes((r.detail || {}).kind))
    // DERIVED, NEVER COUNTED BY HAND. Three connects succeeded above (T1, T1 re-adopted, T3) and
    // B15's Re-check plan ran the probe once more. A connect is one `config/` on the TYPED key
    // (null site_id) plus, with the id, one `site/` and the probe's `config/` + `settings/`; a
    // bare probe is two. Every probe call decrypts, so `vault_decrypt` is two per probe — and
    // before Story 3.3 that number was zero, which is what DW-54's third gap was.
    const CONNECTS = 3
    const PROBES = CONNECTS + 1
    const decryptRows = audit.filter((r) => r.action === 'vault_decrypt')
    step('audit',
      beforeRow.length === CONNECTS && withRow.length === CONNECTS + PROBES * 2
      && withRow.filter((r) => r.site_id === t1SiteId).length === CONNECTS - 1 + (PROBES - 1) * 2
      && withRow.some((r) => r.site_id === t3SiteId)
      && decryptRows.length === PROBES * 2 && decryptRows.every((r) => r.outcome === 'ok')
      && wentIn.length === CONNECTS && cameOut.length === REMOVALS && changeDetail
      && JSON.stringify(changeRoutes) === JSON.stringify([ROUTE, 'sites/disconnect'].sort())
      && at('401').length >= 1 && at('301').length >= 1 && errs.length >= 2 && stamped && objects && leak.length === 0,
      `${audit.length} rows: ${beforeRow.length} admin_read ok with a NULL site_id (config/ on the typed key, ` +
      `one per connect), ${withRow.length} with a site_id — ${CONNECTS} site/ reads plus ${PROBES * 2} probe ` +
      `reads (config/ and settings/ per probe: ${CONNECTS} connects and one Re-check plan); ` +
      `${decryptRows.length} vault_decrypt row(s), all ok = ${decryptRows.every((r) => r.outcome === 'ok')}; ` +
      `${errs.length} admin_read error(s) at status ${JSON.stringify(httpStatuses)} (the bogus key at 401 and ` +
      `the plain-http attempt — its status is what the Vercel function's own fetch received); ` +
      `DW-76's rows, live for the first time: ${wentIn.length} credential_change IN — one per ` +
      `connect — and ${cameOut.length} OUT, the one disconnect that actually took a key ` +
      `(remove('staff') matched no row and wrote none, which is the point), across routes ` +
      `${JSON.stringify(changeRoutes)}, every detail exactly {kind,direction} = ${changeDetail}; ` +
      `every read stamped ${ROUTE} = ${stamped} (the routes seen this run: ${JSON.stringify(routes)}); ` +
      `every detail a jsonb object = ${objects}; rows that look like they ` +
      `hold a key = ${leak.length}`)

    // ── A PROBE THAT CANNOT RUN CHANGES NOTHING. Three matrix rows meet here and all three are the
    //    same contract: "No stored key" (`call()` answers `credential_missing`), "Probe throws"
    //    (the site stays as it was and a code is logged with no value) and "Re-check plan → probe
    //    failure → the card is unchanged and a banner says to try again". The state is seeded the
    //    only way it can be — a site row with NO credential behind it, which no UI can make — and
    //    then B15's own button is pressed on the deployed card.
    //    THE CONNECT-TIME VARIANT of "Probe throws" is not reproducible: at connect the key has
    //    just passed `config/` and gone into Vault, so there is no way to make the next call fail
    //    on demand. It is the SAME `probeSite` catch one caller earlier, and `sites/actions.ts`
    //    wraps it in a second try of its own so a throw on the way in cannot fail a connect either.
    const orphan = (await insert('/sites', {
      user_id: USER_ID, url: 'https://orphan.inflozo.com', title: 'Orphan',
      capability: 'preview_only', capability_source: 'user_declared',
    })).body
    const orphanId = (orphan && orphan[0] && orphan[0].id) || null
    const orphanBefore = orphan && orphan[0] ? JSON.stringify({
      capability: orphan[0].capability, source: orphan[0].capability_source,
      settings_read_at: orphan[0].settings_read_at, site_settings: orphan[0].site_settings,
    }) : null
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    const orphanCard = page.locator('article', { hasText: 'orphan.inflozo.com' }).first()
    await orphanCard.getByRole('button', { name: SAY.preview_recheck }).click()
    // The redirect names the SITE whose re-check failed (review, 2026-09-08) — the banner belongs
    // to one card, not to the page.
    await page.waitForURL((u) => u.searchParams.get('recheck') === orphanId).catch(() => {})
    const banner = await page.getByText(SAY.preview_recheck_failed).isVisible().catch(() => false)
    const orphanAfterRow = ((await rowsOf('*')).find((r) => r.id === orphanId)) || {}
    const orphanAfter = JSON.stringify({
      capability: orphanAfterRow.capability, source: orphanAfterRow.capability_source,
      settings_read_at: orphanAfterRow.settings_read_at, site_settings: orphanAfterRow.site_settings,
    })
    const orphanAudit = (await readAuditRows()).filter((r) => r.site_id === orphanId)
    const failedDecrypt = orphanAudit.filter((r) => r.action === 'vault_decrypt' && r.outcome === 'error')
    const reached = orphanAudit.filter((r) => r.action === 'admin_read')
    const stillConnected = await orphanCard.getByText('Connected', { exact: true }).isVisible().catch(() => false)
    step('probe-failure',
      Boolean(orphanId) && banner && orphanAfter === orphanBefore && failedDecrypt.length === 1
      && reached.length === 0 && stillConnected,
      `a site with NO credential behind it: Re-check plan answered ${JSON.stringify(SAY.preview_recheck_failed)} ` +
      `under the button = ${banner}; the row is byte-identical to what it was = ` +
      `${orphanAfter === orphanBefore} (${orphanAfter}); the audit shows ${failedDecrypt.length} vault_decrypt ` +
      `ERROR row for it and ${reached.length} admin_read rows — nothing reached Ghost; and the card still reads ` +
      `Connected = ${stillConnected}, because a probe that could not run is not a connection that broke`)


    /* ───────── STORY 3.6 — MANAGE KEYS, FR-C8. Driven LAST, deliberately: every step below writes
       to `private.site_credentials` and to the audit log, and `audit` above derives its counts from
       the connects and probes that came before. Putting these after it keeps that derivation honest
       and lets each step here assert its OWN delta instead. The account is on PRO here with T1 and
       T3 connected, which is what `keys-foreign-key` needs — two real Ghosts, one screen. */

    const keysUrl = (id) => `${APP}/sites/keys?site=${id}`
    const openKeys = async (id) => {
      await page.goto(keysUrl(id), { waitUntil: 'load' })
      // The URL row's reason is on this screen and on no other, and it carries no `%s` hole.
      await page.getByText(SAY.keys_url_reason).first().waitFor()
    }
    /* THE SAME PANEL BY THE DOOR THE CUSTOMER USES. `openKeys` above is a document load, which is
       the FULL page (`sites/keys/page.tsx`); this is the ⋯ row's own click, which soft-navigates to
       `/sites?manage=<id>` — the SAME route, with the panel drawn in a `<dialog>` over the cards.
       Both draw `keys-screen.tsx`, so a step that does not care which door it came through may use
       either. The two ADDRESSES differ, which they did not before the owner's test of 2026-09-10:
       the popup used to be an intercepted route at the full page's own URL, and every answer from
       inside it was then a navigation the interception did not survive. */
    const openKeysPopup = async (id, name) => {
      await page.goto(`${APP}/sites`, { waitUntil: 'load' })
      await page.waitForSelector('text=Connected')
      await cardOf(name).first().getByRole('button', { name: /^Options for / }).first().click()
      const menu = page.locator(`#site-menu-${id}`)
      await menu.waitFor({ state: 'visible' })
      await menu.getByRole('link', { name: SAY.keys_menu, exact: true }).click()
      await page.locator('dialog[open]').getByText(SAY.keys_url_reason).first().waitFor()
    }
    /* What the screen looks like from outside: is it a window over the list, or a page instead of
       it? Read off the DOM and not off the URL — a URL says which door was used and not what is on
       screen, and every one of the owner's findings was about what was on screen.

       `topBar` IS HIS FINDING 1 ON BOTH POPUPS, made checkable: the search field and **Connect
       site** are drawn by the SHELL from a table keyed on the exact path, so while the panel was a
       route of its own they simply were not rendered. */
    const keysShape = async () => await page.evaluate(() => ({
      dialogOpen: !!document.querySelector('dialog[open]'),
      dialogInDom: !!document.querySelector('dialog[aria-labelledby="keys-panel-title"]'),
      panelMounted: !!document.querySelector('#keys-panel-title'),
      // The Sites cards are <article>s (`(list)/page.tsx`), and the panel contains none — so
      // "the list is still there" and "the panel is drawn instead of it" are distinguishable.
      cardsBehind: document.querySelectorAll('article').length,
      topBar: !!document.querySelector('input[name="q"]')
        && [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/sites/connect'),
    }))
    /* The credential row for a site, read READ-ONLY through the pooler — `private` answers 404 over
       PostgREST by design (§21j), so this is the only way to see what the chokepoint wrote. */
    const credsOf = async (siteId) => (await sql`
      select admin_key_id, admin_key_rotated_at, staff_token_vault_ref, staff_token_rotated_at,
             admin_key_vault_ref
        from private.site_credentials where site_id = ${siteId}
    `)[0] || {}
    const changesFor = async (siteId) => (await sql`
      select route, detail from private.credential_audit
       where site_id = ${siteId} and action = 'credential_change' order by occurred_at, id
    `)
    const kidOf = (key) => String(key).split(':')[0]

    // ── keys-screen: the ⋯ row goes somewhere, and what it goes to is S11e's wide popup around B20.
    const t1Name = pub1.title || 'Ghost6'
    await openKeysPopup(t1SiteId, t1Name)
    await page.waitForURL((u) => u.pathname === '/sites' && u.searchParams.get('manage') === t1SiteId)
    const openedAs = await keysShape()
    const screen = (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ')
    const named = [SAY.keys_admin_name, SAY.keys_content_name, SAY.keys_staff_name].every((n) => screen.includes(n))
    const enabled = [SAY.keys_admin_enables, SAY.keys_content_enables, SAY.keys_staff_enables]
      .every((n) => screen.includes(n.replace(/\s+/g, ' ')))
    const tokenAbsent = screen.includes(SAY.keys_absent)
    // THE URL IS TEXT. Not a field, not a disabled field, not a readonly one (A9 item 17): the
    // assertion is that no input anywhere on this screen carries the site's address as its value.
    const urlIsText = screen.includes(SAY.keys_url_reason) && screen.includes(pub1.url || T1.url)
    const urlFields = await page.locator('input').evaluateAll((all, address) =>
      all.filter((i) => (i.value || '').includes(address) || i.name === 'url').length, T1.url)
    // AND NOTHING OFFERS TO REVEAL A KEY — B20 draws an eye and this screen deliberately has none.
    const reveals = await page.evaluate(() =>
      [...document.querySelectorAll('button, a, [title], svg title')]
        .filter((el) => /\b(show|reveal|unmask|hide)\b/i.test(`${el.textContent || ''} ${el.getAttribute('title') || ''} ${el.getAttribute('aria-label') || ''}`)).length)
    const noRevealSaid = screen.includes(SAY.keys_no_reveal)
    const t1Kid = kidOf(T1.adminKey)
    const maskDrawn = screen.includes(t1Kid)
    step('keys-screen',
      named && enabled && tokenAbsent && urlIsText && urlFields === 0 && reveals === 0
      && noRevealSaid && maskDrawn && screen.includes(SAY.keys_roll_hint)
      && openedAs.dialogOpen && openedAs.panelMounted && openedAs.cardsBehind > 0,
      `the ⋯ row opened S11e's popup at /sites?manage=<id> — an OPEN <dialog> = ` +
      `${openedAs.dialogOpen} with ${openedAs.cardsBehind} Sites cards still behind it, which is ` +
      `the owner's finding 1. All three credentials named = ${named}, each with ` +
      `the app's own one line on what it enables = ${enabled}, the token reading ` +
      `${JSON.stringify(SAY.keys_absent)} = ${tokenAbsent}. The address is TEXT with its reason ` +
      `= ${urlIsText} and there are ${urlFields} inputs carrying it — no field and no disabled field ` +
      `(A9 item 17). ${reveals} elements offer to show a key (B20's eye cannot exist: the secret half ` +
      `never leaves the chokepoint) and the screen says so itself = ${noRevealSaid}; the Admin row is ` +
      `masked with the key's PUBLIC id half = ${maskDrawn}. The roll-keys hint is the app's own = ` +
      `${screen.includes(SAY.keys_roll_hint)}`)

    await axeAt(page, 'keys-screen', async () => { await openKeysPopup(t1SiteId, t1Name) })
    await axeAt(page, 'keys-route', async () => { await openKeys(t1SiteId) })

    /* ── keys-popup: THE POPUP'S OWN BEHAVIOUR, and every claim here is one of the owner's four
       findings of 2026-09-10 made checkable. He walked this screen and reported that the top bar
       vanished when the window opened, that pressing the row twice landed the window on a blank
       screen, that Test connection "opens a new popup in the background with Test results" on a
       blank screen, and that an empty Save said nothing at all — "Overall the user experience is
       not good and is very buggy. There should be only one perfect popup and that only should be
       source of truth."

       THE FIRST THREE WERE ONE CAUSE: the popup was an INTERCEPTED ROUTE, so opening it moved the
       URL off `/sites` — which is where the shell reads its top bar from — and every answer from
       inside it was a navigation Next did not intercept, so the full page loaded behind the still
       open window and took the list with it. It is `/sites?manage=<id>` now, a parameter on the
       list, and the route never changes at all.

       A REFUSAL IS THE WRITE THIS STEP USES because it writes nothing: `hello` is refused by
       `parseCredential` before Vault is reached, so the step's own subject is the CHROME. */
    await openKeysPopup(t1SiteId, t1Name)
    const onOpen = await keysShape()
    await page.fill('#keys-admin', 'hello')
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    await page.getByText(SAY.credential_malformed).first().waitFor()
    const afterRefusal = await keysShape()
    // HIS FINDING 4: an EMPTY save. It used to redirect in silence — "a press with nothing to do
    // says nothing about it" — which is R-98 broken by a decision rather than by an omission.
    await page.fill('#keys-admin', '')
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    await page.waitForURL((u) => u.searchParams.get('keys') === 'credential_empty', { timeout: 20000 }).catch(() => {})
    const emptySaid = await page.locator('#keys-admin-error').innerText().catch(() => '')
    const afterEmpty = await keysShape()
    // Cancel: the footer control, which in the popup is the back-anchor and on the page a <Link>.
    await page.locator('dialog[open]').getByRole('link', { name: SAY.keys_cancel, exact: true }).last().click()
    // `!manage`: the pathname is already `/sites` inside the popup (review 7 of 3.4, 2026-09-10).
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('manage'))
    const afterCancel = await keysShape()
    // AND THE ROW OPENS IT AGAIN. This is the regression the whole step exists for: with the panel
    // left mounted, the second press changed the URL and drew nothing at all.
    await openKeysPopup(t1SiteId, t1Name)
    const secondOpen = await keysShape()
    await page.keyboard.press('Escape')
    await page.waitForURL((u) => u.pathname === '/sites' && !u.searchParams.get('manage'))
    const afterEscape = await keysShape()
    // …and a typed URL is still the FULL page, which is the half that has to keep working with no
    // script at all (`keys-js-off` reads its markup).
    await openKeys(t1SiteId)
    const typedUrl = await keysShape()
    step('keys-popup',
      onOpen.dialogOpen && onOpen.topBar && onOpen.cardsBehind > 0
      && afterRefusal.dialogOpen && afterRefusal.topBar && afterRefusal.cardsBehind > 0
      && emptySaid.includes(SAY.keys_empty_admin) && afterEmpty.dialogOpen && afterEmpty.cardsBehind > 0
      && !afterCancel.panelMounted && !afterCancel.dialogInDom && afterCancel.cardsBehind > 0
      && secondOpen.dialogOpen && secondOpen.panelMounted
      && !afterEscape.panelMounted && !afterEscape.dialogInDom && afterEscape.cardsBehind > 0
      && typedUrl.panelMounted && !typedUrl.dialogInDom && typedUrl.cardsBehind === 0,
      `THE TOP BAR IS STILL THERE while the window is open = ${onOpen.topBar} — his finding 1, and ` +
      `it holds because /sites?manage= never leaves the route the shell draws that bar for. ` +
      `A refusal keeps the window OPEN with the sentence under its own field = ` +
      `${afterRefusal.dialogOpen}, the bar still drawn = ${afterRefusal.topBar} and ` +
      `${afterRefusal.cardsBehind} cards still behind it — which is his finding 3 by the door a ` +
      `refusal uses (the three actions redirect with RedirectType.replace, so there is one ` +
      `history entry for the panel however many keys are saved). An EMPTY Save now says which box ` +
      `is empty = ${JSON.stringify(emptySaid)} with the window still open = ${afterEmpty.dialogOpen} ` +
      `— his finding 4, which used to redirect in silence. Cancel returns to the list with the ` +
      `panel UNMOUNTED = ${!afterCancel.panelMounted} and no dialog left in the DOM = ` +
      `${!afterCancel.dialogInDom}; the ⋯ row opens it A SECOND time = ${secondOpen.dialogOpen}; ` +
      `Escape does the same as Cancel = ${!afterEscape.panelMounted}; and a typed URL is the FULL ` +
      `page — panel drawn = ${typedUrl.panelMounted}, no dialog = ${!typedUrl.dialogInDom}, ` +
      `${typedUrl.cardsBehind} Sites cards on it`)

    // ── keys-malformed: refused UNDER THE ADMIN FIELD, and nothing written.
    await openKeys(t1SiteId)
    const keysBeforeBad = await credsOf(t1SiteId)
    await page.fill('#keys-admin', 'hello')
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    await page.waitForURL((u) => u.searchParams.get('keys') === 'credential_malformed', { timeout: 20000 }).catch(() => {})
    const malformedSaid = await page.locator('#keys-admin-error').innerText().catch(() => '')
    const keysAfterBad = await credsOf(t1SiteId)
    step('keys-malformed',
      malformedSaid.includes(SAY.keys_malformed)
      && keysAfterBad.admin_key_vault_ref === keysBeforeBad.admin_key_vault_ref
      && String(keysAfterBad.admin_key_rotated_at) === String(keysBeforeBad.admin_key_rotated_at),
      `"hello" in the Admin API key field: refused UNDER THAT FIELD with the app's own sentence ` +
      `(${JSON.stringify(malformedSaid.slice(0, 90))}) — refused before Vault and before the network — ` +
      `and the credential row is untouched: same vault ref = ` +
      `${keysAfterBad.admin_key_vault_ref === keysBeforeBad.admin_key_vault_ref}, same rotation ` +
      `stamp = ${String(keysAfterBad.admin_key_rotated_at) === String(keysBeforeBad.admin_key_rotated_at)}`)

    // ── keys-foreign-key: T3's REAL Admin key, valid on its own Ghost, pasted into T1's screen.
    //    IT WAS CALLED `keys-other-site` AND ASSERTED OUR OWN SENTENCE, and that was wrong — the
    //    owner ruled it R-100 (2026-09-09). The key is sent to T1's Ghost, which never issued it,
    //    so T1 answers 401 `Unknown Admin API Key` at `config/` and the `site/` comparison is never
    //    reached. Ghost decides "is this key mine" by one lookup in `api_keys`, a table with no
    //    domain or install column (MEASUREMENTS §37), so it gives the same 401 to a wrong key and
    //    to another site's key and Inflozo may not claim to tell them apart. The customer is
    //    protected either way: refused under the field, nothing written.
    //    NO `.catch(() => {})` ON THE WAIT: a wrong prediction here used to cost a silent 30-second
    //    timeout and then a red assertion, which reads as a product failure rather than a stale test.
    await openKeys(t1SiteId)
    const beforeOther = await credsOf(t1SiteId)
    await page.fill('#keys-admin', T3.adminKey)
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    await page.waitForURL((u) => u.searchParams.get('keys') === 'ghost_unknown_key', { timeout: 30000 })
    const otherSaid = await page.locator('#keys-admin-error').innerText().catch(() => '')
    const afterOther = await credsOf(t1SiteId)
    step('keys-foreign-key',
      otherSaid.includes(SAY.ghost_unknown_key)
      && afterOther.admin_key_vault_ref === beforeOther.admin_key_vault_ref
      && afterOther.admin_key_id === beforeOther.admin_key_id,
      `T3's own Admin API key — valid, and valid on the WRONG Ghost — pasted into T1's screen: ` +
      `REFUSED under the Admin field with GHOST'S OWN answer ` +
      `(${JSON.stringify(otherSaid.slice(0, 120))}), and NOTHING was written — same vault ref and ` +
      `admin_key_id still ${JSON.stringify(afterOther.admin_key_id)}. T1 answered 401 Unknown Admin ` +
      `API Key at GET config/ — it never issued this key — so the refusal fires before GET site/ is ` +
      `called at all. R-100: Inflozo cannot tell "another site's key" from "wrong key" and does not ` +
      `pretend to; the domain-move sentence belongs to the step below, which is where it is earned`)

    // ── keys-other-site: THE GUARD R-100 KEEPS, and the only step that executes it. It fires when
    //    THIS Ghost reports a public address different from the one recorded at connect — a domain
    //    move, which is FR-C8's edit-URL-in-place hazard reaching the record through the key field.
    //    ⛔ THE BASELINE IS SEEDED, not the answer: neither test Ghost can be given a second
    //    address, so the RECORD's `site_settings.public_url` is moved instead and T1's own valid key
    //    is pasted. `config/` 200 (own key, own Ghost), `site/` 200 with T1's real url, the hosts
    //    differ, the guard fires. The comparison, the refusal, the sentence and the untouched
    //    credential row are all the product's — the same shape `moved-domains` declares below.
    //    AND IT PROVES THE FIX OF 2026-09-09 TOO: the guard now compares Ghost's recorded answer
    //    with Ghost's current one, so the restore at the end puts the record back to a state where
    //    a legitimate rotation is NOT refused.
    await patchSettings(t1SiteId, { public_url: 'https://moved.example.com/' })
    await openKeys(t1SiteId)
    const beforeMoved = await credsOf(t1SiteId)
    await page.fill('#keys-admin', T1.adminKey)
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    await page.waitForURL((u) => u.searchParams.get('keys') === 'keys_other_site', { timeout: 30000 })
    const movedSaid = await page.locator('#keys-admin-error').innerText().catch(() => '')
    const afterMoved = await credsOf(t1SiteId)
    await patchSettings(t1SiteId, { public_url: pub1.url })
    step('keys-other-site',
      movedSaid.includes(SAY.keys_other_site)
      && afterMoved.admin_key_vault_ref === beforeMoved.admin_key_vault_ref
      && afterMoved.admin_key_id === beforeMoved.admin_key_id,
      `the record's recorded public address moved to a host T1's Ghost will never report, then T1's ` +
      `OWN valid key pasted into T1's own screen: REFUSED under the field with the app's own ` +
      `sentence, which names the fix (${JSON.stringify(movedSaid.slice(0, 120))}), and NOTHING was ` +
      `written — same vault ref, admin_key_id still ${JSON.stringify(afterMoved.admin_key_id)}. The ` +
      `key is valid and config/ passed; it is GET site/'s url, whose host differs from the recorded ` +
      `site_settings.public_url, that stops it. ⛔ The BASELINE is seeded because neither test Ghost ` +
      `has a second address; everything after it is the product's. The record is restored to ` +
      `${JSON.stringify(pub1.url)} afterwards, so later steps rotate against a truthful baseline`)

    // ── keys-rotate: THE ROTATION, live. ⛔ The key is RE-PASTED rather than regenerated in Ghost
    //    Admin: regenerating T1's integration key would invalidate `GHOST6_ADMIN_API_KEY` for every
    //    other run and every other probe in `tools/probe/`. What the product does is identical
    //    either way — `store()` mints a NEW vault secret, DW-44's trigger drops the one behind the
    //    ref it replaces, `admin_key_rotated_at` moves and `admin_key_id` is rewritten — and the
    //    assertion is on the SECRET's identity, not on the key's, so a re-paste proves the whole
    //    path (the same argument `re-adopt` makes for DW-44's replace path).
    await openKeys(t1SiteId)
    const beforeRotate = await credsOf(t1SiteId)
    const changesBeforeRotate = (await changesFor(t1SiteId)).length
    await page.fill('#keys-admin', T1.adminKey)
    await page.locator('form:has(#keys-admin) button[type="submit"]').click()
    // POLLED ON THE DATABASE, NOT ON THE URL: a save that succeeds redirects to the very URL it was
    // posted from, so `waitForURL` on the absence of `?keys=` resolves against the STARTING url and
    // waits for nothing at all — the assertion would then read the row before the write landed.
    const afterRotate = (await until(async () => {
      const row = await credsOf(t1SiteId)
      return row.admin_key_vault_ref && row.admin_key_vault_ref !== beforeRotate.admin_key_vault_ref ? row : null
    })) || {}
    const oldGone = (await secretsBehind(beforeRotate.admin_key_vault_ref)) === 0
    const newHeld = (await secretsBehind(afterRotate.admin_key_vault_ref)) === 1
    const rotateChanges = await changesFor(t1SiteId)
    const rotateRow = rotateChanges[rotateChanges.length - 1] || {}
    step('keys-rotate',
      afterRotate.admin_key_vault_ref !== beforeRotate.admin_key_vault_ref && oldGone && newHeld
      && new Date(afterRotate.admin_key_rotated_at) > new Date(beforeRotate.admin_key_rotated_at)
      && afterRotate.admin_key_id === t1Kid
      && rotateChanges.length === changesBeforeRotate + 1
      && rotateRow.route === 'sites/keys' && (rotateRow.detail || {}).kind === 'admin'
      && (rotateRow.detail || {}).direction === 'in',
      `a key saved from Manage keys on T1: the vault ref MOVED, the secret behind the old ref is ` +
      `gone = ${oldGone} (DW-44's trigger, on the product's own rotation path) and there is exactly ` +
      `one behind the new = ${newHeld}; admin_key_rotated_at advanced to ` +
      `${JSON.stringify(afterRotate.admin_key_rotated_at)}; admin_key_id is the key's public id half ` +
      `= ${afterRotate.admin_key_id === t1Kid}; and DW-76 wrote exactly ` +
      `${rotateChanges.length - changesBeforeRotate} new credential_change row, stamped ` +
      `${JSON.stringify(rotateRow.route)} — THIS screen's route and not the connect's — with detail ` +
      `${JSON.stringify(rotateRow.detail)}. ⛔ The key is re-pasted, not regenerated: regenerating ` +
      `T1's integration key would invalidate GHOST6_ADMIN_API_KEY for every probe in this repo. The ` +
      `SECRET's identity is what is asserted, so the path is the same one a real rotation takes`)

    // ── keys-token: DW-54's `staff-removed`, DRIVEN LIVE FOR THE FIRST TIME. Nothing in the product
    //    had ever stored or removed a Staff Access Token — Epic 7 asks for one at first deploy, and
    //    FR-C8 has always said it can be added and taken away at any time. This is that screen.
    //    AND IT IS WRAPPED, because between the store and the removal a real Staff Access Token —
    //    a full-Administrator credential — is sitting in the product's Vault. An abort in that
    //    window (a timeout, a failed selector, a killed run) used to leave it there until the
    //    throwaway account was purged. The `finally` nulls the ref through the pooler so DW-44's
    //    trigger drops the secret behind it whatever happens (review, 2026-09-09); `injection-live`
    //    carries the same shape one story up.
    let tokenStored = false
    try {
    await openKeys(t1SiteId)
    const changesBeforeToken = (await changesFor(t1SiteId)).length
    await page.fill('#keys-staff', STAFF_TOKEN)
    await page.locator('form:has(#keys-staff) button[type="submit"]').click()
    const withToken = (await until(async () => {
      const row = await credsOf(t1SiteId)
      return row.staff_token_vault_ref ? row : null
    })) || {}
    await page.getByText(SAY.keys_staff_remove).first().waitFor({ timeout: 20000 }).catch(() => {})
    const tokenSecret = await secretsBehind(withToken.staff_token_vault_ref)
    const presentAfterAdd = ((await rowsOf('id,credentials_present,disconnected_at')).find((r) => r.id === t1SiteId) || {})
    const tokenScreen = (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ')
    const removeOffered = tokenScreen.includes(SAY.keys_staff_remove)
    // …AND OUT AGAIN. The site must still be Connected through both — removing degrades, never
    // disconnects, which is the whole of "a partially credentialed site is an ordinary state".
    await page.getByRole('button', { name: SAY.keys_staff_remove, exact: true }).click()
    const withoutToken = (await until(async () => {
      const row = await credsOf(t1SiteId)
      return row.staff_token_vault_ref === null ? row : null
    })) || {}
    const secretAfterRemove = withToken.staff_token_vault_ref
      ? await secretsBehind(withToken.staff_token_vault_ref) : -1
    const presentAfterRemove = ((await rowsOf('id,credentials_present,disconnected_at')).find((r) => r.id === t1SiteId) || {})
    const tokenChanges = (await changesFor(t1SiteId)).slice(changesBeforeToken)
    const staffRows = tokenChanges.filter((r) => (r.detail || {}).kind === 'staff')
    step('keys-token',
      Boolean(withToken.staff_token_vault_ref) && tokenSecret === 1
      && (presentAfterAdd.credentials_present || {}).staff === true && removeOffered
      && withoutToken.staff_token_vault_ref === null && secretAfterRemove === 0
      && (presentAfterRemove.credentials_present || {}).staff === false
      && presentAfterRemove.disconnected_at === null
      && staffRows.length === 2
      && JSON.stringify(staffRows.map((r) => (r.detail || {}).direction)) === JSON.stringify(['in', 'out'])
      && staffRows[0].route === 'sites/keys' && staffRows[1].route === 'sites/keys/remove-token',
      `DW-54's staff-removed, live at last — the product had no way in for the token until this ` +
      `screen. ADDED: a vault secret behind staff_token_vault_ref = ${tokenSecret === 1}, ` +
      `credentials_present.staff true = ${(presentAfterAdd.credentials_present || {}).staff === true}, ` +
      `and the row then offers its removal = ${removeOffered} (it is drawn only where it could act, ` +
      `UX-DR3). REMOVED: the ref nulled, the secret behind it GONE = ${secretAfterRemove === 0} ` +
      `(read from vault.secrets through the pooler, not from a log line), credentials_present.staff ` +
      `false, and the site STILL CONNECTED — disconnected_at ` +
      `${JSON.stringify(presentAfterRemove.disconnected_at)}. Removing degrades, never disconnects. ` +
      `DW-76 wrote ${staffRows.length} credential_change rows for it, ` +
      `${JSON.stringify(staffRows.map((r) => `${r.route} ${(r.detail || {}).direction}`))} — each ` +
      `stamped with the control that pressed it`)
    tokenStored = withoutToken.staff_token_vault_ref !== null
    } finally {
      // Only if the product's own removal did NOT run to completion. It is a no-op on the happy
      // path, and on any other it is the difference between a dropped secret and a live one.
      if (tokenStored) {
        await sql`update private.site_credentials set staff_token_vault_ref = null
                   where site_id = ${t1SiteId} and staff_token_vault_ref is not null`
        console.log('  NOTE  keys-token: the run left a staff token behind; the ref was nulled by the harness')
      }
    }

    /* ── keys-test: ONE `GET config/` on the STORED key, and NOTHING is written — the negative
       control that this story did not step on Story 3.7's state machine.

       AND IT IS PRESSED IN THE WINDOW, which is the owner's finding 3 (2026-09-10) executed by its
       own door: "When I click Test Connection in the Pop up, It tests it but opens a new popup in
       the background with Test results. Then both these popup appear on a blank screen." It did:
       `testConnection` redirects onto the panel's own address, an intercepted route did not
       intercept a server action's redirect, and the full page loaded behind the still-open window
       and took the Sites list with it. `openKeys` (a document load onto the full page) would prove
       the CALL and nothing about the chrome — so this step opens the window. */
    await openKeysPopup(t1SiteId, t1Name)
    const healthBefore = ((await rowsOf('id,health,last_checked_at')).find((r) => r.id === t1SiteId) || {})
    const readsBefore = (await sql`
      select count(*)::int as n from private.credential_audit
       where site_id = ${t1SiteId} and action = 'admin_read'`)[0].n
    await page.getByRole('button', { name: SAY.keys_test, exact: true }).click()
    await page.waitForURL((u) => u.searchParams.get('test') !== null, { timeout: 30000 }).catch(() => {})
    const tested = (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ')
    // WHERE THE RESULT LANDED, and how many windows there are to read it in.
    const afterTest = await keysShape()
    const windows = await page.locator('dialog[aria-labelledby="keys-panel-title"]').count()
    const panels = await page.locator('#keys-panel-title').count()
    const testRows = (await sql`
      select route, detail from private.credential_audit
       where site_id = ${t1SiteId} and action = 'admin_read' order by occurred_at, id`).slice(readsBefore)
    const healthAfter = ((await rowsOf('id,health,last_checked_at')).find((r) => r.id === t1SiteId) || {})
    step('keys-test',
      tested.includes(SAY.keys_test_passed) && tested.includes(SAY.keys_test_needs_token)
      && testRows.length === 1 && testRows[0].route === 'sites/keys/test'
      && healthAfter.health === healthBefore.health
      && String(healthAfter.last_checked_at) === String(healthBefore.last_checked_at)
      && afterTest.dialogOpen && afterTest.topBar && afterTest.cardsBehind > 0
      && windows === 1 && panels === 1,
      `PRESSED IN THE WINDOW, and the result landed IN IT: ${windows} window and ${panels} panel ` +
      `in the document, still open = ${afterTest.dialogOpen}, ${afterTest.cardsBehind} Sites cards ` +
      `still behind it and the top bar still drawn = ${afterTest.topBar} — the owner's finding 3, ` +
      `where the answer used to load the full page behind the window and take the list with it. ` +
      `The result is DRAWN — ` +
      `${JSON.stringify(SAY.keys_test_passed)} = ${tested.includes(SAY.keys_test_passed)} — and it ` +
      `says what still needs the token the customer has not added = ` +
      `${tested.includes(SAY.keys_test_needs_token)}. It made exactly ${testRows.length} Admin call, ` +
      `stamped ${JSON.stringify((testRows[0] || {}).route)}. AND IT WROTE NOTHING: sites.health is ` +
      `still ${JSON.stringify(healthAfter.health)} and last_checked_at still ` +
      `${JSON.stringify(healthAfter.last_checked_at)} — both are Story 3.7's state machine, and a ` +
      `manual press that wrote either would fire its transition semantics from outside it`)

    // ── keys-js-off: the ⋯ row has a DESTINATION and the route's three forms are wired, both read
    //    off SERVED markup — React emits method=post and the encoded $ACTION_* fields only when it
    //    renders on the server, so a form reached by a client transition carries neither.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    const keysHref = await page.locator(`#site-menu-${t1SiteId} a`).first().getAttribute('href')
    await page.goto(keysUrl(t1SiteId), { waitUntil: 'load' })
    const keysForms = await page.locator('form').evaluateAll((forms) =>
      forms.filter((f) => f.querySelector('input[name="site_id"]')).map((f) => ({
        method: (f.getAttribute('method') || '').toLowerCase(),
        action: f.getAttribute('action') !== null,
        encoded: f.querySelectorAll('input[type="hidden"][name^="$ACTION"]').length,
        site: f.querySelectorAll('input[type="hidden"][name="site_id"]').length,
        field: [...f.querySelectorAll('input:not([type="hidden"])')].map((i) => i.name).join(','),
        submits: f.querySelectorAll('button[type="submit"]').length,
      })))
    const wiredKeys = keysForms.filter((f) => f.method === 'post' && f.action && f.encoded > 0
                                              && f.site === 1 && f.submits === 1)
    const keysFields = keysForms.map((f) => f.field).sort()
    // DERIVED, NOT COUNTED: the FIELD LIST is what pins the screen's shape — the three credentials
    // plus Test connection, which types nothing — and "every form served is wired" is the claim
    // worth making. A hand-typed 4 said neither, and silently depended on `keys-token` having
    // removed the token first (with one present, the staff form has no typed field and the list
    // changes shape). Review, 2026-09-09.
    const EXPECTED_KEYS_FIELDS = ['', 'admin_key', 'content_key', 'staff_token']
    step('keys-js-off',
      keysHref === `/sites/keys?site=${t1SiteId}`
      && keysForms.length > 0 && wiredKeys.length === keysForms.length
      && JSON.stringify(keysFields) === JSON.stringify(EXPECTED_KEYS_FIELDS),
      `the ⋯ row is an <a href> with a real destination (${JSON.stringify(keysHref)}), so it is a ` +
      `navigation and not a control that does nothing without a script; and the route it lands on ` +
      `serves ${keysForms.length} forms, ${wiredKeys.length} of them progressively enhanced — ` +
      `method=post, an action attribute, React's encoded $ACTION_* fields, one hidden site_id and ` +
      `one submit each: ${JSON.stringify(keysForms)}. Their typed fields are ${JSON.stringify(keysFields)} ` +
      `— the three credentials plus Test connection, which has none. So paste a key, add the token, ` +
      `remove it and test the connection all work with JavaScript off`)

    // ── keys-forged: A SECOND ACCOUNT'S SITE ID, in the URL and in each of the three forms. The
    //    page reads under the caller's OWN session, so RLS is the whole guard; each action reads
    //    the same way before it writes. A negative assertion needs a positive control (standing
    //    rule 2): every press is WATCHED LANDING before anything is re-read.
    const victim = ((await insert('/sites', {
      user_id: OTHER_USER_ID, url: 'https://victim.inflozo.com', title: 'Victim',
    })).body || [])[0] || {}
    const victimBefore = JSON.stringify((await wire(`/sites?id=eq.${victim.id}&select=*`)).body || [])
    await page.goto(keysUrl(victim.id), { waitUntil: 'load' }).catch(() => {})
    const pageRefused = await page.getByText('could not be found', { exact: false }).first()
      .waitFor({ timeout: 20000 }).then(() => true).catch(() => false)
    const landings = []
    for (const which of ['#keys-admin', '#keys-staff', null]) {
      await openKeys(t1SiteId)
      const forged = await page.evaluate(({ id, field }) => {
        const form = field
          ? document.querySelector(field).closest('form')
          : [...document.querySelectorAll('form')].find((f) =>
              f.querySelector('input[name="site_id"]') && f.querySelectorAll('input:not([type="hidden"])').length === 0)
        if (!form) return false
        form.querySelector('input[name="site_id"]').value = id
        form.querySelector('button[type="submit"]').click()
        return true
      }, { id: victim.id, field: which })
      landings.push(forged && await page.getByText('could not be found', { exact: false }).first()
        .waitFor({ timeout: 20000 }).then(() => true).catch(() => false))
    }
    const victimAfter = JSON.stringify((await wire(`/sites?id=eq.${victim.id}&select=*`)).body || [])
    const victimCreds = (await sql`select * from private.site_credentials where site_id = ${victim.id}`).length
    step('keys-forged',
      Boolean(victim.id) && pageRefused && landings.every(Boolean) && victimAfter === victimBefore
      && victimCreds === 0,
      `a site id owned by a DIFFERENT account: /sites/keys?site=<id> is the not-found page = ` +
      `${pageRefused}, and forged into the Admin form, the token form and the Test connection form ` +
      `and submitted from the fixture's own session, every press was seen to LAND on the not-found ` +
      `page = ${JSON.stringify(landings)} — its ownership read came back empty through RLS. The ` +
      `stranger's row is byte-identical afterwards = ${victimAfter === victimBefore} and it has ` +
      `${victimCreds} credential rows`)

    // ── moved-domains: FR-C8's hint. ⛔ THE OLD RECORD IS SEEDED and the rest is the product's:
    //    there is no SECOND reachable address for either test Ghost, so a genuine domain move
    //    cannot be performed here — what can be, and is, is the state a domain move leaves behind:
    //    a record the caller already has whose `admin_key_id` is the key being connected with. The
    //    connect, the lookup, the redirect and the hint are all live.
    const decoy = ((await insert('/sites', {
      user_id: USER_ID, url: 'https://old-address.inflozo.com', title: 'Old address',
      disconnected_at: new Date().toISOString(),
    })).body || [])[0] || {}
    await sql`
      insert into private.site_credentials (site_id, user_id, admin_key_id)
      values (${decoy.id}, ${USER_ID}, ${kidOf(T3.adminKey)})
    `
    const movedAgain = async () => {
      // T3 out through the product's own ⋯, then back in through the sheet: a connect is what
      // carries the hint, and re-adoption is a connect.
      await page.goto(`${APP}/sites`, { waitUntil: 'load' })
      await page.waitForSelector('text=Connected')
      // BY THE SITE ID, not the title: a `hasText` substring match on T3's title is a needless
      // second way for this click to miss when a precise id is already in hand. `popovertarget`
      // carries `t3SiteId` itself, same as the menu it opens.
      await page.locator(`button[popovertarget="site-menu-${t3SiteId}"]`).click()
      const menu3 = page.locator(`#site-menu-${t3SiteId}`)
      await menu3.waitFor({ state: 'visible' })
      await menu3.getByRole('link', { name: SAY.disconnect_menu, exact: true }).click()
      await page.waitForSelector('dialog[open]')
      await sheet(page).getByRole('button', { name: SAY.disconnect_menu, exact: true }).click()
      await page.waitForURL((u) => u.pathname === '/sites', { timeout: 30000 })
      await opener(page).first().click()
      await page.waitForSelector('dialog[open] a[href="?step=keys"]')
      await sheet(page).locator('a[href="?step=keys"]').click()
      const contentField = page.locator('dialog[open] #s2b-content-key')
      await contentField.waitFor()
      await fill(page, T3.url, T3.adminKey, T3.contentKey)
      await submit(page)
      // NOT `waitForURL(pathname === '/sites')`: A FAILED SUBMIT LEAVES THE DIALOG OPEN ON TOP OF
      // THE SAME `/sites` THE FLOW WAS ALREADY ON, so that predicate is already true before the
      // submit even lands and proves nothing (found live, 2026-09-09 — it read a failed reconnect
      // as a success and the run only surfaced the lie two steps later, as a T3 that had silently
      // stayed disconnected). A real success is a real navigation: `redirect()` tears down this
      // exact dialog instance, so waiting for THIS element to be gone is the same signal
      // `s2cHeading(page).waitFor()` gives the FIRST connect, spelled for a dialog that has no
      // heading of its own to wait on.
      const reconnected = await contentField.waitFor({ state: 'detached', timeout: 60000 })
        .then(() => true).catch(() => false)
      if (!reconnected) {
        const shown = (await page.locator('dialog[open]').innerText().catch(() => '')).replace(/\s+/g, ' ')
        throw new Error(`moved-domains: T3's reconnect did not navigate away — the dialog is still ` +
          `open ${shown ? 'saying ' + JSON.stringify(shown) : 'with nothing readable in it'}`)
      }
      if (page.url().includes('/sites/brand')) await skipS2c(page)
      await page.waitForSelector('text=Connected')
      return page.url()
    }
    const movedTo = await movedAgain()
    const hinted = await says(page, SAY.keys_moved)
    const onOneCard = await page.locator('article', { hasText: SAY.keys_moved.slice(0, 24) }).count()
    // …AND THE NEGATIVE CONTROL. A record whose `admin_key_id` is null NEVER matches — which is
    // every record connected before this story's migration — so the same connect prints no hint.
    await sql`update private.site_credentials set admin_key_id = null where site_id = ${decoy.id}`
    await movedAgain()
    const hintedAgain = await says(page, SAY.keys_moved)
    await sql`delete from private.site_credentials where site_id = ${decoy.id}`
    step('moved-domains',
      Boolean(decoy.id) && hinted && onOneCard === 1 && !hintedAgain,
      `a connect whose Admin key id matches ANOTHER record this caller holds: the redirect carried ` +
      `?moved= (${JSON.stringify(new URL(movedTo).search)}) and FR-C8's hint is on that ONE card ` +
      `(${onOneCard} of them) reading the app's own ${JSON.stringify(SAY.keys_moved)} — the 90 days ` +
      `derived from ORPHAN_SNAPSHOT_DAYS, not typed into the sentence. THE CONTROL: with the same ` +
      `record's admin_key_id set to NULL — which is every record connected before this story's ` +
      `migration — the identical connect printed NO hint = ${!hintedAgain}, because a null never ` +
      `matches and a missing hint is not a wrong one. ⛔ The OLD record is seeded through the pooler: ` +
      `neither test Ghost has a second reachable address, so a real domain move cannot be performed ` +
      `here. The connect, the lookup, the redirect and the hint are all the product's`)

    /* THE REFS `secret-gone` READS ARE RE-TAKEN HERE, and this is not tidying: `keys-rotate` put a
       NEW secret behind T1's ref and `moved-domains` reconnected T3 twice, so the two refs pushed
       further up were already dropped by DW-44's trigger. Left as they were, `secret-gone` would
       have found zero secrets behind them and PASSED without the account cascade doing anything —
       a control that cannot fail (standing rule 2). These are the refs that are actually live when
       the user is deleted. */
    refs.length = 0
    refs.push(await refOf(t1SiteId), await refOf(t3SiteId))

    // ── axe over every surface: the list, both steps of the page pair, and the open sheet.
    await axeAt(page, 'sites')
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    await axeAt(page, 'sheet')
    await page.keyboard.press('Escape')
    await page.goto(`${APP}/sites/connect`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    await axeAt(page, 'connect')
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await page.waitForSelector('#s2b-content-key')
    await axeAt(page, 'keys')

    // ── The cascade: GoTrue deletes the user, Postgres cascades to both sites and their
    //    credentials rows, and DW-44's trigger takes both secrets with them.
    await admin(`/admin/users/${USER_ID}`, { method: 'DELETE' })
    const gone = await admin(`/admin/users/${USER_ID}`)
    step('user-gone', gone.status === 404, `GET /admin/users/{id} -> HTTP ${gone.status}`)

    const left = []
    for (const ref of refs) left.push(await secretsBehind(ref))
    step('secret-gone', refs.length === 2 && refs.every(Boolean) && left.every((n) => n === 0),
      `the vault after the account went: ${JSON.stringify(left)} row(s) behind the two sites' refs`)

    const typed = [T1.adminKey, T1.contentKey, T3.adminKey, T3.contentKey, BOGUS]
    const leaked = typed.filter((k) => bodies.some((b) => b.includes(k)))
    step('no-secret-leak', leaked.length === 0,
      `${bodies.length} response bodies scanned for the ${typed.length} keys this run typed; ` +
      `${leaked.length === 0 ? 'none appeared' : 'A KEY CAME BACK IN A RESPONSE'}`)

  } catch (error) {
    step('browser', false, `${error && error.message ? error.message : error}`)
  } finally {
    // WHAT THE RUN COST IN RETRIES, always printed — a clean run says zero and a run that rode
    // over the 2026-09-08 navigation timeouts says how many (DW-68). A retry that is not
    // reported is a retry that hides a hang, and IN THE `finally` because the run that most needs
    // the number is the one that hung and then FAILED — at the end of the `try` it printed only
    // on the runs that did not need it (review, 2026-09-08).
    console.log(`  note: navigation retries this run: ${navRetries}`)
    await sql.end({ timeout: 5 }).catch(() => {})
    await browser.close()
    process.stdout.write('\n@@RESULT@@' + JSON.stringify(steps) + '\n')
  }
})()
'''


def run_browser(cfg):
    pw = playwright_dir()
    if not pw:
        print('  FAIL  playwright is not on this machine. Set PLAYWRIGHT_DIR to a playwright')
        print('        package directory, or install one; see memory `headless-browser-tooling`.')
        return [{'name': 'browser', 'ok': False, 'detail': 'playwright not resolvable'}]
    if not os.path.isdir(PG_DIR):
        return [{'name': 'browser', 'ok': False,
                 'detail': f'the postgres driver is not at {os.path.relpath(PG_DIR)}; run pnpm install'}]

    with tempfile.TemporaryDirectory() as work:
        script = os.path.join(work, 'connect-wizard.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, PG_DIR=os.path.abspath(PG_DIR),
                     AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=1200)
        except subprocess.TimeoutExpired as timed_out:
            # THE NOTES SURVIVE THE HANG. `TimeoutExpired` carries what the child had already
            # written, and this is the ONE case the retry count exists for — a run that hung —
            # so discarding it here threw away the number DW-68 is measured with
            # (review 3, 2026-09-08).
            #
            # AND IT CARRIES THEM AS BYTES, `text=True` NOTWITHSTANDING: on POSIX the exception
            # `run()` re-raises is the one `communicate()` built from its raw accumulator, before
            # the decode. So `line.startswith('note:')` raised TypeError and killed the report
            # this block exists to print — executed, 2026-09-09, and the whole reason it is
            # written down: the only path that reaches here is a run nobody was watching.
            hung = timed_out.stdout or ''
            if isinstance(hung, bytes):
                hung = hung.decode('utf-8', 'replace')
            for line in hung.splitlines():
                if line.lstrip().startswith('note:'):
                    print(f'  {line.strip()}')
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 1200s'}]
        except FileNotFoundError:
            return [{'name': 'browser', 'ok': False, 'detail': 'node is not on PATH; Playwright is Node'}]
    # THE BROWSER'S OWN NOTES REACH THE OUTPUT ON A PASSING RUN TOO. Everything but the result
    # line used to be discarded unless the run failed, so the navigation-retry count added on
    # 2026-09-08 was invisible in exactly the case that matters — a run that passed only because
    # it retried. A retry that is not reported is a retry that hides a hang (DW-68).
    for line in proc.stdout.splitlines():
        if line.lstrip().startswith('note:'):
            print(f'  {line.strip()}')
    for line in proc.stdout.splitlines():
        if line.startswith('@@RESULT@@'):
            return json.loads(line[len('@@RESULT@@'):])
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:], file=sys.stderr)
    return [{'name': 'browser', 'ok': False, 'detail': f'node exited {proc.returncode} with no result'}]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='the plumbing alone: every key present by name, playwright, axe and the '
                         'postgres driver resolvable, and §21j re-executed over PostgREST. No '
                         'browser and no user, so it runs before the story is deployed.')
    ap.add_argument('--url', default=APP,
                    help='where the app lives. app.inflozo.com by default; a Review run may point '
                         'this at a deployment URL.')
    ap.add_argument('--shots', default='',
                    help='a directory to save each surface into at 1440, 834 and 390 — the frame '
                         'comparison. Created if missing; asserts nothing.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_DB_POOLER_URL',
              'GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST6_CONTENT_API_KEY', 'GHOST6_VERSION',
              'GHOST5_URL', 'GHOST5_ADMIN_API_KEY', 'GHOST5_CONTENT_API_KEY', 'GHOST5_VERSION',
              # Story 3.3's `injection-live`, and only that: the HARNESS's own credential for the
              # one write the owner sanctioned. The product never holds one until Epic 7.
              'GHOST6_STAFF_ACCESS_TOKEN', 'GHOST5_STAFF_ACCESS_TOKEN']
    missing = [k for k in needed if not env.get(k)]
    print(f'  {"PASS" if not missing else "FAIL"}  keys: present in tools/probe/.env by name: '
          f'{", ".join(k for k in needed if env.get(k))}'
          + (f'; MISSING: {", ".join(missing)}' if missing else ''))
    if missing:
        print('  RESULT: FAILED')
        return 1

    # ── THE BROWSER SCRIPT PARSES, and this costs a second before anything is spent. Neither
    #    failure it was written for is reachable by any test the repository has — the script is a
    #    Python STRING until node reads it.
    #    IT ANSWERS ONE OF THE TWO, AND THE CLAIM THAT IT ANSWERS BOTH WAS FALSE. A redeclared
    #    `afterSkip` (Review, 2026-09-08) is a SyntaxError and this catches it instantly. A
    #    block-scoped `const same` shadowing the module-level helper (Dev, the same day) is VALID
    #    SYNTAX — `node --check` exits 0 on it — so that class still surfaces only as a mid-run
    #    ReferenceError, exactly as the note at the `same` helper already says. Executed and
    #    corrected rather than argued (review 3, 2026-09-08): cite or execute, never assert.
    with tempfile.TemporaryDirectory() as work:
        probe = os.path.join(work, 'syntax.mjs')
        with open(probe, 'w') as fh:
            fh.write(BROWSER_JS)
        parsed = subprocess.run(['node', '--check', probe], capture_output=True, text=True)
    js_ok = parsed.returncode == 0
    print(f'  {"PASS" if js_ok else "FAIL"}  browser-js: the embedded Playwright script parses'
          + ('' if js_ok else ' — ' + next((l.strip() for l in parsed.stderr.splitlines()
                                             if 'Error' in l), 'see below')))
    if not js_ok:
        print(parsed.stderr.strip()[-600:])
        print('  RESULT: FAILED')
        return 1

    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']
    failed = False

    # ── §21j, THE BOUND THE DESIGN RESTS ON, re-executed every run rather than remembered.
    off_api = {}
    for table in ('decrypted_secrets', 'secrets', 'site_credentials'):
        st, _ = rest(sb, secret, 'GET', f'/{table}?limit=1')
        off_api[table] = st
    st_sites, _ = rest(sb, secret, 'GET', '/sites?limit=1')
    ok = all(v == 404 for v in off_api.values()) and st_sites == 200
    failed = failed or not ok
    print(f'  {"PASS" if ok else "FAIL"}  vault-off-rest: '
          f'GET /rest/v1/{{decrypted_secrets,secrets,site_credentials}} -> {json.dumps(off_api)}; '
          f'the positive control /rest/v1/sites -> {st_sites}')

    # ── §39, RE-EXECUTED EVERY RUN: the six settings keys FR-C2's probes read are really in the
    #    INTEGRATION key's own `GET /admin/settings/` payload, on both majors. §15h item 21 measured
    #    the three announcement keys with a STAFF token — a credential the product does not hold
    #    until Epic 7 — so "the integration key can read them too" was a hypothesis this story had
    #    to execute rather than inherit (standing rule: cite or execute, never assert).
    WANT = ('portal_button', 'codeinjection_head', 'codeinjection_foot',
            'announcement_content', 'announcement_background', 'announcement_visibility')
    seen = {}
    for label, prefix in (('T1', 'GHOST6'), ('T3', 'GHOST5')):
        try:
            rows = {r['key'] for r in ghost_for(env, prefix, f'{prefix}_ADMIN_API_KEY')
                    .api('GET', 'settings/')['settings']}
            seen[label] = [k for k in WANT if k not in rows] or 'all six present'
        except Exception as e:
            # THE CLASS ALONE IS NOT A REASON. `--check` is the pre-spend gate for the whole run,
            # so a red one printing "HTTPError" and nothing else told the reader to go and
            # reproduce it by hand (review, 2026-09-09). The message is truncated and no key can
            # reach it: the credential rides in the Authorization header, never in the URL.
            seen[label] = f'{type(e).__name__}: {str(e)[:120]}'
    keys_ok = all(v == 'all six present' for v in seen.values())
    failed = failed or not keys_ok
    print(f'  {"PASS" if keys_ok else "FAIL"}  settings-keys: GET /admin/settings/ read with '
          f'GHOST6_ADMIN_API_KEY and GHOST5_ADMIN_API_KEY (the integration key, no staff token) — '
          f'{json.dumps(seen)}; the keys wanted: {", ".join(WANT)}')

    # ── §40, RE-EXECUTED EVERY RUN: Story 3.4's brand reader takes the SAME payload, so the
    #    keys it reads have to be in it, on both majors, with the CONTAINER each really arrives in.
    #    `announcement_visibility` turned out to be a JSON *string* (§39c), which is what made
    #    `navigation`'s container a real question rather than a pedantic one — and it is a string
    #    too. Recorded key by key so a major that changes its mind is caught here rather than on a
    #    customer's screen (standing rule: cite or execute, never assert).
    BRAND_KEYS = ('accent_color', 'logo', 'icon', 'cover_image', 'navigation', 'title', 'description')
    brand_seen = {}
    for label, prefix in (('T1', 'GHOST6'), ('T3', 'GHOST5')):
        try:
            flat = {r['key']: r.get('value') for r in ghost_for(env, prefix, f'{prefix}_ADMIN_API_KEY')
                    .api('GET', 'settings/')['settings']}
            missing_brand = [k for k in BRAND_KEYS if k not in flat]
            shapes = {k: type(flat.get(k)).__name__ for k in BRAND_KEYS}
            # The one container the reader has to get right: a JSON array inside a STRING.
            nav = flat.get('navigation')
            nav_shape = ('json-string' if isinstance(nav, str) and nav.strip().startswith('[')
                         else 'array' if isinstance(nav, list) else type(nav).__name__)
            brand_seen[label] = ({'missing': missing_brand} if missing_brand
                                 else {'types': shapes, 'navigation': nav_shape})
        except Exception as e:
            brand_seen[label] = f'{type(e).__name__}: {str(e)[:120]}'
    brand_ok = all(isinstance(v, dict) and 'missing' not in v and v['navigation'] in ('json-string', 'array')
                   for v in brand_seen.values())
    failed = failed or not brand_ok
    print(f'  {"PASS" if brand_ok else "FAIL"}  brand-keys: the {len(BRAND_KEYS)} FR-C4 keys in the same '
          f'GET /admin/settings/ payload, read with GHOST6_ADMIN_API_KEY and GHOST5_ADMIN_API_KEY — '
          f'{json.dumps(brand_seen)}; wanted: {", ".join(BRAND_KEYS)} (MEASUREMENTS §40)')

    if args.check:
        pw, axe = playwright_dir(), axe_path()
        print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
        print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
        print(f'  postgres driver: {"resolved" if os.path.isdir(PG_DIR) else "NOT FOUND"} '
              f'({os.path.relpath(PG_DIR)})')
        print(f'  the audit route the app stamps: {audit_route()}')
        for code, text in app_text().items():
            print(f'  the app\'s own text, evaluated — {code}: {text!r}')
        print('  --check: the plumbing alone — no browser, no user, nothing connected')
        print('  RESULT: ' + ('FAILED' if failed or not pw or not axe or not os.path.isdir(PG_DIR)
                              else 'all steps passed'))
        return 1 if (failed or not pw or not axe or not os.path.isdir(PG_DIR)) else 0

    admin = Admin(sb, secret)
    stamp = int(time.time())
    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale ghost-admin-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')

    user_id = None
    other_id = None
    # ── `injection-live`, HALF ONE (the owner's ruling, 2026-09-08). Both test Ghosts get one
    #    harmless line in the Site-footer code-injection box BEFORE the browser starts, so the very
    #    first connect meets a site that really has code injection set. The value found is kept
    #    here and put back in the `finally` below — passing, failing or interrupted.
    injection = {}
    try:
        for label, prefix in (('T1', 'GHOST6'), ('T3', 'GHOST5')):
            state = {'label': label, 'prefix': prefix}
            injection[prefix] = state
            ghost = ghost_for(env, prefix, f'{prefix}_STAFF_ACCESS_TOKEN')
            state['ghost'] = ghost
            found = read_foot(ghost)
            # A RUN THAT WAS KILLED between the write and the `finally` left the marker in the
            # box. Adopting it as "what we found" and faithfully restoring it would make the
            # marker PERMANENT, and every later run would agree it belonged there. The box is
            # ours only when it holds exactly our marker, so that is the one value that
            # reconciles to empty (review, 2026-09-08).
            state['stale'] = found == INJECTION_MARK
            state['found'] = None if state['stale'] else found
            write_foot(ghost, INJECTION_MARK)
            # READ BACK THROUGH THE PRODUCT'S OWN CREDENTIAL, not the one that wrote it: what the
            # probe will see is the integration key's view, and that is the claim being made.
            state['seen'] = read_foot(ghost_for(env, prefix, f'{prefix}_ADMIN_API_KEY'))
            state['set'] = state['seen'] == INJECTION_MARK
    except Exception as error:
        print(f'  FAIL  injection-live: the code-injection box could not be set: {type(error).__name__}')
        failed = True

    try:
        status, user = admin.call('POST', '/admin/users',
                                  {'email': f'ghost-admin-harness-{stamp}@inflozo.com', 'email_confirm': True})
        if status not in (200, 201) or not user.get('id'):
            print(f'  FAIL  could not create the fixture user: HTTP {status}')
            return 1
        user_id = user['id']
        print('  fixture user created (Free plan, so T3 after T1 is the cap proof)')

        # STORY 3.3's `ownership` step needs a row that belongs to SOMEBODY ELSE. The four new
        # actions write with the service role, so `.eq('user_id', …)` is the entire guard between
        # one account and another's sites — and nothing observed it (review, 2026-09-08).
        status, other = admin.call('POST', '/admin/users',
                                   {'email': f'ghost-admin-harness-{stamp}-other@inflozo.com',
                                    'email_confirm': True})
        if status not in (200, 201) or not other.get('id'):
            print(f'  FAIL  could not create the SECOND fixture user: HTTP {status}')
            return 1
        other_id = other['id']

        status, link = admin.call('POST', '/admin/generate_link',
                                  {'type': 'magiclink', 'email': f'ghost-admin-harness-{stamp}@inflozo.com'})
        if status != 200 or not link.get('hashed_token'):
            print(f"  FAIL  generate_link (the fixture's sign-in link) answered HTTP {status}")
            return 1

        # A `kid` of the right shape that Ghost has never issued (§37: 401 Unknown Admin API Key).
        bogus = '0' * 24 + ':' + 'ab' * 32
        ghosts = [
            {'label': 'T1', 'url': env['GHOST6_URL'].rstrip('/'), 'adminKey': env['GHOST6_ADMIN_API_KEY'],
             'contentKey': env['GHOST6_CONTENT_API_KEY'], 'version': env['GHOST6_VERSION']},
            {'label': 'T3', 'url': env['GHOST5_URL'].rstrip('/'), 'adminKey': env['GHOST5_ADMIN_API_KEY'],
             'contentKey': env['GHOST5_CONTENT_API_KEY'], 'version': env['GHOST5_VERSION']},
        ]
        # `%s` marks the app's own host hole, so the browser half matches the halves around it
        # rather than rebuilding the interpolation.
        says = app_text()
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
        steps = run_browser({
            'APP_URL': args.url.rstrip('/'),
            'SHOTS_DIR': os.path.abspath(args.shots) if args.shots else '',
            'SB_URL': sb,
            'SB_SECRET': secret,
            'PG_URL': env['SUPABASE_DB_POOLER_URL'],
            'USER_ID': user_id,
            'OTHER_USER_ID': other_id,
            'CONFIRM_URL': f'{args.url.rstrip("/")}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink',
            'AUDIT_ROUTE': audit_route(),
            'GHOSTS': json.dumps(ghosts),
            # STORY 3.6's `keys-token`: the token the harness already owns for `injection-live`,
            # now ALSO the one the product stores and removes through Manage keys — the first
            # product path that does either (DW-54's `staff-removed`, closing here). It is the
            # HARNESS's own credential for T1 and nothing in the app has ever held one before.
            'T1_STAFF_TOKEN': env['GHOST6_STAFF_ACCESS_TOKEN'],
            'BOGUS_KEY': bogus,
            'INJECTION_MARK': INJECTION_MARK,
            'SENTENCES': json.dumps(says),
        })
        for s in steps:
            mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
            print(f'  {mark:6} {s["name"]}: {s["detail"]}')
            if s['ok'] is False:
                failed = True
        # The browser half deleted the user itself (`user-gone`); a second DELETE below would only
        # answer 404 and mask a step that made a user it should not have.
        if any(s['name'] == 'user-gone' and s['ok'] for s in steps):
            user_id = None
    finally:
        # ── `injection-live`, HALF TWO, AND IT RUNS FIRST IN THIS BLOCK: the owner's ruling is that
        #    both boxes go back to exactly what the step found, on failure too. Each restore is
        #    re-read and asserted; a restore that could not be made is a FAILED run, loudly, because
        #    the alternative is leaving a line in someone's live footer and saying nothing.
        for prefix, state in injection.items():
            try:
                write_foot(state['ghost'], state['found'])
                state['back'] = read_foot(state['ghost'])
                state['ok'] = same_box(state['back'], state['found'])
            except Exception as error:
                state['ok'] = False
                state['back'] = f'RESTORE FAILED: {type(error).__name__}'
        if injection:
            ok = all(s.get('set') and s.get('ok') for s in injection.values())
            failed = failed or not ok
            told = '; '.join(
                f'{s["label"]} ({s["prefix"]}_STAFF_ACCESS_TOKEN wrote, {s["prefix"]}_ADMIN_API_KEY read): '
                f'found {json.dumps(s.get("found"))}, the integration key then saw '
                f'{json.dumps(s.get("seen"))}, restored to {json.dumps(s.get("back"))} '
                f'(the same empty or the same string = {s.get("ok")})'
                + (' — NOTE: the box already held this harness\'s own marker when the run started, '
                   'so an earlier run was killed before its restore; reconciled to empty'
                   if s.get('stale') else '')
                for s in injection.values())
            print(f'  {"PASS" if ok else "FAIL"}  injection-live: {told}')
        if user_id:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        # The `ownership` fixture goes with it, and its site row cascades — so the count below
        # still has to come back to where it started.
        if other_id:
            admin.call('DELETE', f'/admin/users/{other_id}', {})
        # The count is compared BEFORE any sweep of strays, so a user a step created by mistake is
        # reported as the leak it is rather than tidied away (the sibling harness's own note).
        after = admin.user_count()
        print(f'  fixture user {"deleted" if user_id else "already gone (the cascade step)"}; users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray ghost-admin-harness-* user(s) existed after cleanup and were swept.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
