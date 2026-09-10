/**
 * THE CONNECT WIZARD'S PURE HALF (FR-C1, FR-C2) — the address normaliser, the version floor, the
 * card's two labels, and the one table that turns a code into a sentence. No `fetch`, no Supabase,
 * no environment, so `node --test` reaches every branch; `sites/actions.ts` next door does the
 * reaching. The shape `admin-rule.ts` set for Story 3.1 and `purge-rule.ts` for 2.6.
 *
 * THE 4.x REFUSAL IS PROVED HERE AND NOWHERE ELSE. No Ghost 4 server exists — T1 is 6.58.0 and T3
 * is 5.130.6 (MEASUREMENTS §38, "not executed, and cannot be") — so the floor is executed against
 * an injected version string rather than against a server, and that is the whole reason it is a
 * pure function instead of an `if` inside the action.
 */

/** The floor FR-C2 names: 5.x and 6.x accepted, 4.x and older refused with a friendly sentence. */
export const MIN_GHOST_MAJOR = 5

/**
 * WHAT THE CUSTOMER TYPED, AS AN ORIGIN. Scheme defaults to https, host lowercased, path and
 * trailing slash dropped — so `orbitweekly.com`, `https://orbitweekly.com/` and
 * `https://OrbitWeekly.com` are one row under `unique (user_id, url)` rather than three.
 *
 * `http://` IS KEPT WHEN IT IS TYPED. It is warned, never rewritten: both test Ghosts answer a
 * plain-http admin call that carries a key with a 301 to https (§38c as corrected at Review,
 * 2026-09-08 — the 403 there was measured with no key at all), which `fetchWithKey` never follows
 * (`redirect: 'manual'`), so a connect against one fails with `ghost_redirected`'s sentence instead
 * of Inflozo quietly connecting to a different address than the one the user gave.
 *
 * The PUBLIC url is a different value and lives in `site_settings.public_url` — read from
 * `GET /admin/site/` at connect. On Ghost(Pro) the two differ by design (EXPERIENCE.md:113).
 */
export function normaliseSiteUrl(input: string | null | undefined): string | null {
  const typed = (input ?? '').trim()
  // A space is the "orbit weekly" row of the matrix: not a URL, and `new URL` would encode it
  // into one rather than refuse it.
  if (!typed || /\s/.test(typed)) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return null
  }
  // `ftp://`, `javascript:` and `file://` are not site addresses, and `adminUrl` would happily
  // build one out of any of them.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  // A bare word is a typo, not a host. `localhost` is refused with it, deliberately: a Ghost the
  // browser's Content-key check could reach is not one Vercel's function can.
  if (!url.hostname.includes('.')) return null
  // AN IP LITERAL IS NOT A SITE ADDRESS EITHER. `10.0.0.1`, `127.0.0.1`, `169.254.169.254` and
  // `[::1]` all pass the dot test; refusing them keeps the function's fetch off a bare address, for
  // the same reason `localhost` is refused, and loses nothing — a Ghost on a bare IP has no
  // certificate the browser's own Content-key check would trust (review, 2026-09-08). A public
  // NAME that resolves to a private range still passes — this is a shape check, not a resolver —
  // and DW-58 records what that is worth on Vercel's function (review 2, 2026-09-08).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.startsWith('[')) return null
  return `${url.protocol}//${url.host.toLowerCase()}`
}

/** The warning's condition, read off what was TYPED — the field says so before Connect is pressed. */
export const isPlainHttp = (input: string | null | undefined): boolean =>
  /^http:\/\//i.test((input ?? '').trim())

/**
 * WHAT GHOST ANSWERED, CHECKED BEFORE IT BECOMES A LINK. `GET /admin/site/`'s `url` goes into
 * `site_settings.public_url` and onto the card's address as its `href`, and `icon` becomes
 * `favicon_url`; neither is trusted to be a URL because Ghost sent it (review, 2026-09-08). The
 * value is kept AS SENT — the public url carries its trailing slash (§38a) and is not normalised —
 * and only refused when it is not an http(s) URL at all.
 */
export const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

/** The host on its own, for the sentences that name it. Never throws: a bad address has no host. */
export function hostOf(input: string | null | undefined): string {
  const origin = normaliseSiteUrl(input)
  return origin ? new URL(origin).host : (input ?? '').trim()
}

export type VersionVerdict =
  | { ok: true; major: number; minor: number }
  | { ok: false; code: 'ghost_too_old' | 'ghost_unreachable'; major?: number; minor?: number }

/**
 * `GET /admin/config/` answers the full three-part version (`6.58.0`, `5.130.6` — 3.1's harness
 * executed both); `GET /admin/site/` answers two parts, which is why the stored value comes from
 * `config/`. A Ghost that answers NO version is refused as unreachable rather than accepted: it is
 * not a Ghost this product knows how to deploy to, and guessing would be the wrong kind of kind.
 */
export function versionVerdict(version: string | null | undefined): VersionVerdict {
  const found = /^(\d+)\.(\d+)/.exec((version ?? '').trim())
  if (!found) return { ok: false, code: 'ghost_unreachable' }
  const major = Number(found[1])
  const minor = Number(found[2])
  if (major < MIN_GHOST_MAJOR) return { ok: false, code: 'ghost_too_old', major, minor }
  return { ok: true, major, minor }
}

/** S11a's version chip: `6.58.0` -> "Ghost 6.58". Absent while nothing has been read. */
export function ghostLabel(version: string | null | undefined): string | null {
  const found = /^(\d+)\.(\d+)/.exec((version ?? '').trim())
  return found ? `Ghost ${found[1]}.${found[2]}` : null
}

const AGO: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

/**
 * S11a's "Checked 2 minutes ago", and "Checked just now" for the minute after a connect. `now` is
 * the caller's one clock for the whole render, so two cards a millisecond apart never disagree —
 * the argument `updatedLabel` makes in `lib/projects.ts`.
 */
export function checkedLabel(at: string | Date | null | undefined, now: Date): string {
  if (!at) return 'Not checked yet'
  const when = at instanceof Date ? at : new Date(at)
  if (Number.isNaN(when.getTime())) return 'Not checked yet'
  const seconds = Math.max(0, Math.round((now.getTime() - when.getTime()) / 1000))
  if (seconds < 60) return 'Checked just now'
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, size] of AGO) {
    if (seconds >= size) return `Checked ${format.format(-Math.floor(seconds / size), unit)}`
  }
  return 'Checked just now'
}

/**
 * THE SITES SEARCH (the owner's finding 5, 2026-09-08). The shell's field is drawn on Sites as it is
 * on Projects and posts `?q=` to whatever page it sits on, so this is `filterProjects`'s twin — the
 * repeated-key array included — and it lives here because the match is over what the CARD shows:
 * the title, and the address under it. Both the raw url and the host are matched, so "orbitweekly",
 * "orbitweekly.com" and "https://orbitweekly.com" all find the same card.
 */
export function filterSites<
  T extends { title: string | null; url: string; site_settings: { public_url?: string } | null },
>(rows: readonly T[], q: string | string[] | undefined): { query: string; shown: T[] } {
  const raw = Array.isArray(q) ? q[0] : q
  const query = raw?.trim() ?? ''
  const needle = query.toLowerCase()
  const shown = query
    ? rows.filter((row) => {
        const publicUrl = row.site_settings?.public_url || row.url
        return [row.title || hostOf(row.url), row.url, publicUrl, hostOf(publicUrl)].some((field) =>
          field.toLowerCase().includes(needle),
        )
      })
    : [...rows]
  return { query, shown }
}

/**
 * S11a's "n projects" pill: how many projects link each site (FR-B5, at most one site per project,
 * so the tally is over `projects.linked_site_id`). Here rather than in the page so it is under test
 * before the first story writes that column (review 2, 2026-09-08).
 */
export function projectCounts(projects: readonly { linked_site_id: string | null }[]): Map<string, number> {
  const linked = new Map<string, number>()
  for (const { linked_site_id: id } of projects) if (id) linked.set(id, (linked.get(id) ?? 0) + 1)
  return linked
}

/** "1 project", "2 projects", "0 projects". */
export const projectsLabel = (count: number): string => `${count} project${count === 1 ? '' : 's'}`

/**
 * S11a WITH NOTHING CONNECTED — the owner's finding 7, and the words he ruled at Question 5. No
 * frame draws this screen: the export has S11a, S11b and S11c and no empty state, so it is
 * extrapolated from the nearest one that has, S3b's Projects empty screen (R-74). Here rather than
 * in the page so the harness can read the app's own sentences instead of retyping them.
 */
export const SITES_EMPTY = {
  title: "One handshake and you're in.",
  sub: 'Connect your Ghost site — it takes about a minute.',
  /** "No sites match …", the Projects grid's own answer to a search that found nothing. */
  noMatch: (query: string) => `No sites match “${query}”.`,
} as const

/**
 * STORY 3.5 — DISCONNECT'S EVERY WORD, AND THEY LIVE HERE AND NOWHERE ELSE. `site-menu.tsx` draws
 * them and `run-verify-ghost-admin.py` reads them out of this file, so the screen and the harness
 * cannot disagree about what the customer was shown (`PREVIEW_COPY` and `BRAND_COPY` in
 * `probe-rule.ts` are the precedent).
 *
 * NO NUMBER IS IN HERE. The cap's sentence is `siteCapSentence()`'s, derived from `PLANS`; nothing
 * in this object may name a plan, a count or a deadline (standing rule 4, and
 * `connect-rule.test.ts` asserts it).
 *
 * THE BODY SAYS WHAT DISCONNECTING COSTS AND WHAT IT DOES NOT, because that is the whole of the
 * owner's Question 2 ruling (option 1, 2026-09-09): a simple confirm, no typed field. Nothing of
 * the customer's is destroyed — FR-C6 keeps the record, the projects, their names and their
 * colours — so the friction matches the risk and the sentence carries the reassurance the typed
 * field would otherwise have to.
 */
export const DISCONNECT = {
  /** S11a's ⋯ menu item, and the confirm's own primary: one word for one action. */
  menu: 'Disconnect',
  title: (host: string) => `Disconnect ${host}?`,
  /* NO COUNT, IN WORDS EITHER. "two Ghost keys" was a tally in the one object whose header
     forbids one, and it goes stale the day Epic 7 stores a staff token and disconnecting takes
     three (review, 2026-09-09). The sentence says what is forgotten, not how many. */
  body:
    'Inflozo will forget this site\u2019s Ghost keys. Your projects, their names and their colours ' +
    'stay exactly as they are, and nothing on your Ghost site changes. To connect again you paste ' +
    'them once more.',
  cancel: 'Cancel',
  /** R-98: a submit control cannot exist without the present tense it wears while it works. */
  busy: 'Disconnecting\u2026',
} as const

/**
 * FR-C6's ORPHAN CLOCK, IN DAYS, AND IT LIVES OUTSIDE THE COPY. FR-C8's "Moved domains?" hint has
 * to name it — "your old site's snapshot is kept for 90 days" — and `KEYS` below may hold no
 * number at all (standing rule 4, and `connect-rule.test.ts` asserts it), so the sentence takes the
 * figure as an argument and the figure lives here. The clock itself is DERIVED from
 * `sites.disconnected_at` and stamped nowhere (DW-43); the job that acts on it is Story 7.20's
 * (DW-75), and it reads this constant rather than carrying a second copy of the number.
 */
export const ORPHAN_SNAPSHOT_DAYS = 90

/**
 * STORY 3.6 — MANAGE KEYS' EVERY WORD, AND THEY LIVE HERE AND NOWHERE ELSE, exactly as
 * `DISCONNECT` above does. `keys-panel.tsx` draws them and `run-verify-ghost-admin.py` reads them
 * out of this file, so the screen and the harness cannot disagree about what the customer was
 * shown.
 *
 * THE `S11d` CITATIONS BELOW ARE THE WORDS' PROVENANCE AND THEY STILL HOLD; THE CHROME AROUND THEM
 * IS NOW `S11e Manage Keys Popup.dc.html` (in the export, by his ruling), the owner's own frame from his test of
 * this story on 2026-09-10 — two columns instead of one long one, because S11d's single column ran
 * off the bottom of a laptop. Its subtitle is the constraint: *"Same content as the long screen,
 * nothing removed."* NOT ONE SENTENCE IN THIS OBJECT MOVED FOR IT, which is how that constraint is
 * checkable rather than claimed — the harness prints this list and the Fix left it identical.
 *
 * NO NUMBER IS IN HERE, and `connect-rule.test.ts` asserts it over this object as it does over
 * `DISCONNECT`: the orphan clock's figure is `ORPHAN_SNAPSHOT_DAYS`'s, and nothing else on this
 * screen counts anything. `movedDomains` takes the days rather than spelling them.
 *
 * TWO DEPARTURES FROM THE FRAMES, BOTH RECORDED RATHER THAN SILENT (R-74; the precedent is Story
 * 3.4's hex-instead-of-colour-name):
 *
 *   1. NO REVEAL, AND NO TRAILING CHARACTERS. B20 masks each key with its first AND last
 *      characters and offers an eye. The last characters cannot be drawn: they are the secret half,
 *      which exists for milliseconds inside `server/ghost-admin/index.ts` and reaches no render
 *      path (AD-10). So the screen draws the half that is not a secret — the Admin key's `id`, the
 *      part before the colon, which rides in the header of every JWT Inflozo mints — and says so
 *      in `noReveal`. `Eye` and `EyeOff` exist in the Kit and are deliberately unused here.
 *   2. "Added" AND "Not added", NEVER "Working". B20 draws a green dot and "Working" beside each
 *      present credential, which is a claim that a check has just passed. Nothing checks on load —
 *      the health badge, its stored timestamp and the daily re-check are Story 3.7's — so the
 *      screen says what it KNOWS (a key is held, or it is not) and offers **Test connection** for
 *      the rest. This is also the acceptance criterion "present or absent, and never an error
 *      badge".
 */
export const KEYS = {
  /** S11a's ⋯ menu item, the frame's own third row (`S11 Sites.dc.html:80`). */
  menu: 'Manage API keys',
  /* WHAT THE ⋯ ROW SAYS WHILE THE WINDOW IS ON ITS WAY (R-98, and the owner's test of 2026-09-10,
     finding 2). Opening the panel is two server round trips, and until this the row said nothing
     through them — so a second press was there to be made, and it landed the window on a blank
     screen. `PanelLink` swaps to this and refuses the second press. */
  opening: 'Opening\u2026',
  /** S11d's title pair (`:197-198`). */
  title: (host: string) => `API keys — ${host}`,
  sub: 'Rolled your keys in Ghost Admin? Paste the new ones here — they take effect right away.',

  /** S11d's read-only address row (`:203-205`). A9 item 17: there is no field and no edit control. */
  urlLabel: 'Site URL',
  urlReason:
    'Fixed for this connection. Moving the site to a new domain means disconnecting and connecting again.',

  /** The three credentials. `enables` is B20's own one line each — what it lets Inflozo DO. */
  present: 'Added',
  absent: 'Not added',
  admin: {
    name: 'Admin API key',
    enables: 'Uploads your theme when you ship.',
    /** S11d's own control (`:210`), and B20's "Rotate" is the same act. */
    paste: 'Paste new',
    save: 'Save key',
    busy: 'Saving\u2026',
    ask: 'Paste the new Admin API key from your Inflozo integration.',
  },
  content: {
    name: 'Content API key',
    enables: 'Reads your posts, pages and tags, so previews use your real content.',
    paste: 'Paste new',
    save: 'Save key',
    busy: 'Saving\u2026',
    ask: 'Paste the new Content API key from your Inflozo integration.',
  },
  staff: {
    name: 'Staff Access Token',
    /* B20's sentence, and then D1b's disclosure VERBATIM and unsoftened — "It is a
       full-Administrator credential: anything that user can do in Ghost Admin, this token can do."
       (A1, 2026-09-04). FR-C3's honesty rule: Ghost offers no narrower credential, so saying so
       plainly is the only lever there is. */
    enables:
      'Uploads routes.yaml, and reads the live theme for the snapshot and the drift report. ' +
      'It is a full-Administrator credential: anything that user can do in Ghost Admin, this ' +
      'token can do. Add or remove it at any time.',
    /* NOTHING RETROACTIVE IS OFFERED, and this line is why it is not merely omitted: adding the
       token starts the safety net from that moment, and a customer who reads "reads the live
       theme for the snapshot" could reasonably expect one of the theme already replaced. */
    forward:
      'Adding it starts the safety-net copy from then on — it cannot copy a theme that has already been replaced.',
    add: 'Add token',
    addBusy: 'Adding\u2026',
    remove: 'Remove token',
    removeBusy: 'Removing\u2026',
    ask: 'Ghost Admin → your avatar → Your profile → Staff Access Token.',
  },

  /** The one departure recorded above, said to the customer rather than only in a comment. */
  noReveal:
    'Only the start of each key is shown. Inflozo cannot read the rest back either — your Ghost keeps it.',

  /** S11d's hint block (`:232`). */
  rollHint:
    'To roll keys: Ghost Admin → Settings → Integrations → Inflozo → Regenerate. Old keys stop working the moment you regenerate.',

  /** S11d's footer (`:238`) — Cancel only: each credential row carries its own save. */
  cancel: 'Cancel',

  /* S11d's **Test connection** (`:235`) and B20's capability list under it. It proves the Admin
     key reaches this Ghost RIGHT NOW and stores nothing — `sites.health` and `sites.last_checked_at`
     are Story 3.7's state machine, and writing either from a manual press would drive that machine
     from outside it. So there is no "Passed · 2 min ago" here: that stamp arrives with 3.7. */
  test: {
    label: 'Test connection',
    busy: 'Testing\u2026',
    passed: 'Inflozo reached your Ghost site.',
    can: ['Read your posts and pages', 'Read and upload your theme'],
    routesWithToken: 'Upload routes.yaml',
    routesWithoutToken: 'Upload routes.yaml — needs the Staff Access Token',
  },

  /**
   * FR-C8's hint, printed on the NEW card after a connect whose Admin key Inflozo has met before.
   * The days are the caller's — `ORPHAN_SNAPSHOT_DAYS` — so this object still names no number.
   */
  movedDomains: (days: number | string) =>
    `Moved domains? Re-point your projects to this site — your old site's snapshot is kept for ${days} days.`,
  /**
   * …AND THE SAME HINT WHERE THE OLD RECORD IS STILL CONNECTED, which is the shape the owner's own
   * test step 10 produces on Ghost(Pro): two live addresses, one Ghost. THE SNAPSHOT CLAUSE IS
   * DROPPED RATHER THAN REWORDED, because the 90-day clock is DERIVED from `sites.disconnected_at`
   * (DW-43) and a record that was never let go has no clock at all — promising one would name a
   * deadline that is not running (review, 2026-09-09).
   */
  movedStillConnected:
    'Moved domains? Re-point your projects to this site. Your other site is still connected — ' +
    'disconnect it when you no longer need it.',
} as const

/**
 * The connect sheet's dialog id. S11a's "Connect site" sits in the SHELL's top bar (the owner's
 * finding 5) and the sheet is rendered by the page, so the DOM is the only thing the two share —
 * one constant rather than two string literals a rename could separate (`NEW_PROJECT_DIALOG`'s
 * own argument, `lib/projects.ts`).
 */
export const CONNECT_SITE_DIALOG = 'connect-site-sheet'

/**
 * MANAGE KEYS HAS TWO ADDRESSES AND ONE PANEL, and both are written here so a rename cannot move
 * one without the other (standing rule 7 — the ⋯ row and `actions.ts` each used to spell the full
 * page out for themselves).
 *
 * `keysPath` IS THE ROUTE AND IT IS WHAT THE ⋯ ROW'S `href` NAMES: a typed URL, a modified click,
 * a refresh, a shared link and a scripts-off browser are all document loads and all land on
 * `sites/keys/page.tsx`, which draws the same panel as a full page. That is an acceptance
 * criterion of Story 3.6, not a nicety.
 *
 * `keysPopupPath` IS THE SAME PANEL AS A WINDOW OVER THE SITES LIST, and it is a QUERY PARAMETER
 * ON `/sites` rather than a route of its own — the owner's test of 2026-09-10, findings 2, 3 and
 * 5: "There should be only one perfect popup and that only should be source of truth." The panel
 * used to be an intercepted route at `keysPath`, which moved the URL off `/sites`, and everything
 * that answered the customer afterwards — Test connection, every save, every refusal — was a
 * navigation the interception did not survive: the full page loaded BEHIND the still-open window
 * and took the list with it. On `/sites?manage=…` the route never changes, so an action's redirect
 * is an ordinary same-route answer, exactly as `?recheck=`, `?disconnect=` and `?moved=` already
 * are on this list.
 */
export const keysPath = (siteId: string) => `/sites/keys?site=${siteId}`
export const keysPopupPath = (siteId: string) => `/sites?manage=${siteId}`

/**
 * THE CODES → SENTENCES TABLE, AND IT LIVES HERE AND NOWHERE ELSE. The action answers a code and
 * a subject; the wizard renders the sentence. Two copies of a refusal sentence is how a refusal
 * drifts from the one the owner read and approved.
 *
 * "EXPIRED" APPEARS IN NONE OF THEM, and `connect-rule.test.ts` asserts it: Ghost's `api_keys`
 * has no expiry column (MEASUREMENTS §37), so a 401 is a key REGENERATED or an integration
 * removed. Telling a customer their key expired sends them looking for a setting Ghost has not got.
 *
 * `at_cap` is deliberately absent: its sentence is Appendix F.1's, derived from `PLANS` by
 * `siteCapSentence()` in `lib/plan.ts`, and a second copy here could disagree with the pill.
 *
 * NO BACKTICKS. The spec's matrix writes its two examples in Markdown code spans; the sentence the
 * customer reads is plain text under a field, where a backtick is a stray character (review,
 * 2026-09-08).
 */
export const CONNECT_MESSAGES = {
  url_invalid: () => "That doesn't look like a site address — try https://yoursite.com.",
  content_key_unknown: () => "Ghost doesn't recognise this Content API key.",
  credential_malformed: () =>
    'An Admin API key looks like 65a3f…:9c2b41d8e0f… — an id, a colon, then a long secret.',
  // Only a crafted post reaches this (`maxLength` refuses the character first); it is still
  // answered under its own field rather than as a "try again" banner (review, 2026-09-08).
  content_key_malformed: () =>
    "That doesn't look like a Content API key — copy it again from the Inflozo integration.",
  ghost_unknown_key: () =>
    "Ghost said no — this Admin API key doesn't match your site. Copy the whole key from the " +
    'Inflozo integration and try again.',
  // Inflozo mis-signing its own JWT is OUR bug and must never be shown as the user's (§37).
  ghost_bad_signature: () =>
    "Something went wrong on our side while signing in to your Ghost. It isn't your key — please try again.",
  ghost_unauthorized: () => 'Ghost refused this Admin API key. Copy it again from the Inflozo integration.',
  ghost_unreachable: (host: string) =>
    `We couldn't reach ${host}. Check the address — it's your Ghost site's own.`,
  ghost_redirected: () =>
    'Your site sent us somewhere else. Connect with the address your site actually uses.',
  ghost_too_old: (version: string) =>
    `Your site runs Ghost ${version}. Inflozo needs Ghost ${MIN_GHOST_MAJOR} or newer — please update Ghost, then connect.`,
  // DW-52: every Ghost answer the map above does not name — a 403, a 429, a 5xx. (Plain http is
  // NOT one of them: Ghost answers it with a 301, which is `ghost_redirected` — §38c as corrected
  // at Review.) The status is in the sentence so a support reply has something to work from.
  ghost_refused: (status: string) =>
    `Ghost refused the connection (HTTP ${status}). Check the address and the keys.`,
  already_connected: (host: string) => `${host} is already connected.`,
  credential_store_unavailable: () =>
    "We couldn't save your key just now. Nothing was connected — try again in a moment.",
  connect_failed: () => "We couldn't connect that site just now. Try again in a moment.",
  // STORY 3.5. IT NAMES NO HALF, deliberately: `remove()` throwing leaves the site connected with
  // its keys, and the stamp failing after it leaves it connected with none — two different states,
  // one honest sentence, and pressing again is idempotent from either (`remove()` on a null ref is
  // a no-op, and the stamp then lands).
  disconnect_failed: () => "We couldn't disconnect that site just now. Try again in a moment.",
  /* STORY 3.6 — THE THREE MANAGE-KEYS CODES.

     `keys_other_site` is FR-C8's rule enforced on its one remaining path. FR-C8 removed
     edit-URL-in-place because it would carry one site's record, snapshot and first-upload flag onto
     a DIFFERENT live Ghost install; re-pasting another install's keys into an existing record
     reaches the same end state through the field FR-C8 left open. So it is REFUSED, not warned,
     and the sentence names the fix rather than only the fault. */
  keys_other_site: () =>
    'These keys belong to a different Ghost site. Moving a site means disconnecting this one and ' +
    'connecting the new address.',
  /* A staff token that does not parse. It is `parseCredential`'s `credential_malformed` under a
     different name, because the SENTENCE differs: the Admin key's names the integration, and a
     Staff Access Token is not on the integration at all — it is on the person's own profile. */
  token_malformed: () =>
    "That doesn't look like a Staff Access Token — copy the whole thing from your Ghost profile, " +
    'including the part before the colon.',
  /* THE OWNER'S TEST, 2026-09-10, FINDING 4: "when I click Save Key without any inputs, it does
     not show any error." It did not, and that was a written decision rather than an oversight —
     `saveKeys` read "a press with nothing to do says nothing about it". R-98 is his own ruling the
     other way round: a pressed control says what happened, and "nothing happened" is something.

     THREE CODES AND NOT ONE, because the FIELD IS DERIVED FROM THE CODE (`keysFieldOf`) and the
     frozen Boundaries put a refusal under the box it came in. One shared `credential_empty` would
     have had to carry a field beside it in the URL, which is exactly what that derivation exists
     to stop. */
  credential_empty: () => 'Paste the new Admin API key first — this box is empty.',
  content_key_empty: () => 'Paste the new Content API key first — this box is empty.',
  token_empty: () => 'Paste your Staff Access Token first — this box is empty.',
  /* Everything on this screen that is ours rather than the customer's: a read that failed, a write
     that would not land. It says nothing changed, because nothing did — every write here is
     validated before it is made. */
  keys_failed: () => "We couldn't save that just now. Nothing changed — try again in a moment.",
  /* `call()` THROWS THIS when the site has no Admin secret behind its ref, and until this story
     nothing rendered it: the wizard never calls `call()` with an empty store. **Test connection**
     does, so the code needed a sentence of its own — the fallback was `keys_failed`, which told
     someone who pressed a read-only test that a save had failed (review, 2026-09-09). */
  credential_missing: () =>
    'Inflozo has no Admin API key for this site any more. Paste it again above, then test.',
  /* A REMOVAL THAT COULD NOT REACH THE STORE, and it is NOT `credential_store_unavailable`: that
     sentence says "We couldn't save your key… Nothing was connected", which is a connect's words
     about a save, shown here for taking a token OUT. `disconnect_failed` is the precedent for a
     removal-shaped failure and this is its twin one row down (review, 2026-09-09). */
  token_remove_failed: () =>
    "We couldn't remove that token just now. It is still there — try again in a moment.",
} as const

export type MessageCode = keyof typeof CONNECT_MESSAGES

/** Every code the connect action can answer with. `at_cap`'s sentence comes from `lib/plan.ts`. */
export type ConnectCode = MessageCode | 'at_cap'

/**
 * Which field a refusal belongs under; everything else is the form's banner. S2b·2 has the first
 * three (`url` is the wizard's alone) and Story 3.6's Manage keys adds `staff_token`, which no
 * connect screen has ever drawn — the token is Epic 7's at first deploy and Manage keys is the
 * only surface that takes one.
 */
export type ConnectField = 'url' | 'admin_key' | 'content_key' | 'staff_token'

/**
 * WHICH FIELD A MANAGE-KEYS CODE BELONGS UNDER, DERIVED IN ONE PLACE. `saveKeys` cannot answer its
 * caller — it redirects, so the screen works with JavaScript off — so the code travels back in the
 * URL and the field is worked out HERE rather than trusted from the URL beside it: a hand-typed
 * `?field=` could otherwise put a refusal sentence under a field it has nothing to do with.
 * Anything this does not name is the panel's banner.
 */
export const keysFieldOf = (code: string): ConnectField | null =>
  code === 'content_key_unknown' || code === 'content_key_malformed' || code === 'content_key_empty'
    ? 'content_key'
    : code === 'token_malformed' || code === 'token_empty'
      ? 'staff_token'
      : code === 'credential_malformed' || code === 'credential_empty' || code === 'keys_other_site' || code === 'ghost_unknown_key' || code === 'ghost_unauthorized'
        ? 'admin_key'
        : null
/* FOUR CODES THAT ARE **NOT** THE ADMIN FIELD'S, and they were until the review of 2026-09-09.
   `ghost_unreachable`, `ghost_redirected`, `ghost_refused` and `ghost_bad_signature` say "check the
   address" or "connect with the address your site actually uses" — under a field on the ONE screen
   whose address is read-only text with no edit affordance at all (A9 item 17). They are the panel's
   banner instead, which is also what the wizard's own `FIELD_OF` has always done with them: two maps
   over one vocabulary that disagreed on four codes is the drift standing rule "propagate, never
   localise" exists to catch. The two the I/O matrix names — `ghost_unknown_key` and
   `ghost_unauthorized` — stay under `admin_key`, because those two ARE about the key that was
   typed. */

/**
 * WHAT `connectSite` ANSWERS, AND IT LIVES HERE RATHER THAN BESIDE THE ACTION. A `'use server'`
 * module may export only async functions — every export becomes a Server Action — so a constant
 * or a type exported from `sites/actions.ts` silently strips EVERY export from it and the wizard's
 * import of the action itself fails to resolve (executed under `next build`, 2026-09-08). The
 * same rule that put `signedIn()` in `lib/supabase/server.ts` (DW-38) puts these three here.
 */
export type ConnectResult =
  | { ok: true }
  | { error: { code: ConnectCode; message: string; field?: ConnectField } }

/**
 * The ceiling on each of the three fields, and it is the field's own `maxLength` so the form
 * refuses the character the action would. A Ghost Admin key is 24 hex + ':' + 64 hex and a Content
 * key is 26 hex; the cap is generous rather than exact, because the SHAPE is `parseCredential`'s
 * to judge and a length check that disagreed with it would refuse a real key with the wrong
 * sentence.
 */
export const CONNECT_MAX = 300

/**
 * @param subject the host for the codes that name one, the version for `ghost_too_old`, and the
 * HTTP status for `ghost_refused`. One parameter, because the table is one lookup and a
 * per-code argument list would be a second thing to keep in step with it.
 */
export const connectMessage = (code: MessageCode, subject = ''): string => CONNECT_MESSAGES[code](subject)

/**
 * The `http://` warning, under the URL field as it is typed. It is a WARNING and not a refusal:
 * the site may genuinely be plain http, and Ghost's own answer — a 301 to https that is never
 * followed, so `ghost_redirected` (§38c as corrected at Review) — is the honest one if it is.
 */
export const HTTP_WARNING =
  "Most Ghost sites use https:// — use that if yours does. Without HTTPS the editor can't load your live content."

/**
 * FR-C3's honesty rule and the spine's blast-radius rule, in one sentence each, in the
 * helper-caption slot above Connect (S2b·2 :136-138). §21m executed it: the stored key reads
 * every member's email address and can publish posts. Ghost offers no narrower credential, so
 * informed consent is the only lever there is.
 */
export const ADMIN_KEY_CONSENT =
  "Your Admin API key lets Inflozo read everything Ghost Admin can — members' email addresses " +
  'included. Inflozo only ever writes your theme and your routes file.'

/** The wizard's two steps. Step 1 is the guide, step 2 the three fields (S2b·1 / S2b·2). */
export type Step = 'integration' | 'keys'

/**
 * `?step=` off a Next `searchParams`, which hands a REPEATED key (`?step=a&step=b`) over as an
 * array — the shape `filterProjects` was fixed for. Anything that is not `keys` is step 1, so a
 * hand-typed value lands on the guide rather than on an empty form.
 */
export const stepOf = (value: string | string[] | undefined): Step =>
  (Array.isArray(value) ? value[0] : value) === 'keys' ? 'keys' : 'integration'
