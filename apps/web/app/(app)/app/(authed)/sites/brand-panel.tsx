import Link from 'next/link'
import { ring } from '@/components/kit/greyed'
import { ExternalLink, X } from '@/components/kit/icons'
import { Submit } from '@/components/kit/submit'
import { title as sheetTitle } from '@/components/kit/dialog'
import { BRAND_COPY } from '@/lib/probe-rule'
import { ProjectThumb } from '../placeholder'
import { skipBrand, useBrand } from './actions'

/* ───────── S2 Onboarding.dc.html — S2c, the auto-branding moment (`:150-196`), and FR-C4's one
   screen. It is where CONNECT LANDS when the site it just read has a brand to offer, and where
   the Sites card's offer link goes for ever after.

   TWO COLUMNS SINCE THE OWNER ASKED FOR IT (2026-09-10): "Make the popup as two column. On left
   show the Your Site Today card. On [the right] show the options for Which Project and buttons
   below." So the left column is everything READ off the customer's Ghost — the logo, the title and
   host, the accent, the menu, the fonts note and the mini homepage wearing the accent — and the
   right column is everything DECIDED: which project, and the two presses.

   THE MINI HOMEPAGE MOVED INTO THE LEFT COLUMN RATHER THAN BEING DROPPED. The frame draws it as
   the right half of a 760 split card, and the right half is now the chooser; it is "your site
   today" as much as the accent swatch is, and it is the one thing on the screen that shows what
   the brand LOOKS like, so it goes with its own half. Nothing S2c drew has been removed.

   ONE COMPONENT, TWO CHROMES, AND `panel-modal.tsx` RECORDS WHY THERE ARE TWO. The Sites card's
   offer is a `PanelLink`, so its plain click opens `/sites?brand=…` over the list and its `href`
   into a `<dialog>` over the list — the popup. `connectSite`'s landing is a SERVER ACTION's
   `redirect()`, and those are not intercepted (executed, 2026-09-10), so the moment straight after
   a connect stays the full-screen onboarding S2 draws. Both render this file.

   ONE DEPARTURE FROM THE FRAME, and it is a fact Inflozo does not have: the frame captions the
   swatch with the accent's NAME ("Burnt orange"). Ghost answers a hex and nothing else (§40), so
   the swatch is captioned with the hex in mono — the card's own idiom for a machine value, the
   same one the site's address is printed in. Naming a colour would be asserting what was not read.

   THE MENU ENTRIES ARE NOT LINKS, AND THE SITE'S OWN ADDRESS IS — a distinction this note used to
   blur, and the owner's ask of 2026-09-10 is why it now states it. The menu entries keep their
   `url` in the column for the epic that turns a menu into a section, but the frame draws them as
   text pills and so does this: an `href` off a value read from someone's Ghost menu is an
   attribute this screen has no reason to write. The SITE'S address is a different thing — it is
   the address Inflozo connected, or the public one Ghost reports for it, and the Sites card has
   linked it with a new-tab glyph since his finding 4 on Story 3.2. The logo is an `<img>` and is `https:`-only, checked in `brandOf` — `img-src`
   admits `data:` (`csp.ts:60`) and a `data:` SVG is script.

   BOTH CONTROLS ARE `<form action={serverAction}>` WITH A HIDDEN SITE ID, so both work with
   JavaScript off — `site-notices.tsx` is the pattern, and there is no client component here.

   AND NEITHER MOVES WHEN IT IS PRESSED. `Submit` draws both labels in one grid cell
   (`kit/submit.tsx`'s `BusyLabel`), so **Use your brand** is already as wide as **Taking your
   brand…** before anything is clicked — the owner's ask of 2026-09-10, and the reason the two are
   stacked full-width in the rail rather than sitting side by side in it: at the rail's width a
   row of two would have wrapped as the labels grew, which is the same layout shift by another
   route.

   THE CAPTION UNDER **Use your brand** IS THE OWNER'S RULING (Question 1, option 1, 2026-09-08):
   the screen says WHICH project will wear the brand before the press, not after. With nothing to
   brand yet it says one will be made; at the project cap it names the one that will be branded
   instead; and where a project for this site already exists it ASKS instead of telling, which is
   his Question 3 ruling and is true whether or not there are cards to choose from. The decision
   rides in a hidden field and `useBrand` re-counts it, so a cap filled in another tab sends the
   customer back here with a true sentence rather than rebranding a project this screen never
   named. */

/** What the popup's `<dialog aria-labelledby>` points at — one panel is ever in the document. */
export const BRAND_TITLE_ID = 'brand-panel-title'

export type BrandProject = {
  id: string
  name: string
  style_pack: unknown
  linked_site_id: string | null
}

export type BrandSite = {
  id: string
  /** The site's own name, as the card shows it. */
  title: string
  host: string
  /** The PUBLIC address, whole — `public_url || url`, exactly what the Sites card links. `host` is
      what is DRAWN and this is where the link GOES, so the panel shows the short form and still
      opens the real address (on Ghost(Pro) the two differ by design). */
  url: string
  /** `https:`-only, already checked in `brandOf` and re-checked where it crosses. */
  logo: string | null
  accent: string | null
  nav: { label: string; url?: string }[]
}

export function BrandPanel({
  site,
  caption,
  failed,
  projects,
  targetId,
  choosing,
  popup,
}: {
  site: BrandSite
  caption: string
  /** `?failed=1` — the press that could not be written, said above the buttons. */
  failed: boolean
  projects: BrandProject[]
  /** Which card opens selected: exactly what `brandTarget` would have written unasked. */
  targetId: string | null
  /** The chooser is drawn only where the brand is going onto a project that already exists AND
      there is more than one to choose between (the owner's Question 3 ruling and his B1). */
  choosing: boolean
  /** TRUE when this panel is the window over the Sites list (`/sites?brand=…`) rather than the
      full screen `connectSite` lands on. It travels into both forms as a hidden field so a
      refused **Use your brand** redirects onto the chrome the press came from — `keys-panel.tsx`
      carries the argument, and this is the same defect on the other popup (standing rule 3). */
  popup: boolean
}) {
  /** The hidden field both forms on this panel carry — see `popup` above. */
  const chrome = popup ? <input type="hidden" name="popup" value="1" /> : null
  return (
    <>
      {/* S2c's heading pair, and the ✕ at the right edge — the owner's ask of 2026-09-10 ("Add a
          cross button too which will close the popup").

          NO FRAME DRAWS IT, so it is extrapolated from the nearest one that does (R-74): S2c is a
          PAGE in the export and a page has no ✕; S11e is the export's popup and this is its ✕,
          markup for markup — the same 28px hit area, the same `X` at 14/1.8, the same
          `<Link href="/sites">` destination its footer Cancel has.

          AND THERE IS NOTHING FOR A SECOND WAY OUT TO DISAGREE WITH. **Skip** writes nothing at
          all — not even a note that it was pressed (`actions.ts`) — so the ✕, the backdrop and
          Escape land exactly where Skip does and the offer stays on the card either way. That is
          also why it is the same control in BOTH chromes rather than a popup-only one: on the full
          page it means what Skip means, which is "not now". */}
      <div className="flex shrink-0 items-start gap-4 border-b border-line-faint p-[18px_20px] tablet:p-[24px_28px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <h1 id={BRAND_TITLE_ID} className={`${sheetTitle} wrap-anywhere`}>
            {BRAND_COPY.title}
          </h1>
          <p className="text-ui-dense leading-[1.55] text-ink-soft">{BRAND_COPY.sub(site.host)}</p>
        </div>
        <Link
          href="/sites"
          aria-label={BRAND_COPY.close}
          className={`flex size-7 shrink-0 items-center justify-center rounded-thumb text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <X size={14} strokeWidth={1.8} />
        </Link>
      </div>

      {/* The two columns scroll separately from `tablet` up, for `keys-panel.tsx`'s reason: one
          scroller would stretch the rail to the taller column and push the buttons below the fold,
          which is the whole thing a popup is here to avoid. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto tablet:flex-row tablet:items-stretch tablet:overflow-hidden">
        <SiteToday site={site} />

        <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-line-faint bg-paper-raised p-[16px_20px] tablet:w-[360px] tablet:overflow-y-auto tablet:border-t-0 tablet:border-l tablet:p-[20px_22px]">
          <form action={useBrand} className="flex flex-1 flex-col gap-4">
            <input type="hidden" name="site_id" value={site.id} />
            {chrome}
            {/* THE CHOOSER, AND IT IS REAL RADIO INPUTS — not the Kit's presentational
                `RadioCards`, which draws the shape with `role="radio"` on buttons and posts
                nothing. Both controls on this screen work with JavaScript off (Boundaries), and a
                native radio inside this form is the only version of a chooser that does; it is
                also why this is cards and not a `<select>`, which cannot hold a drawing. R-74: no
                frame draws this, so it is extrapolated from the two that draw its parts —
                `radio-card.tsx`'s coral border and tint (Editor Sidebar Kit `:117`) and
                `design-picker.tsx`'s 64×44 wireframe tile (`:71`) — same components, same tokens,
                no second vocabulary. */}
            {choosing ? (
              <fieldset className="m-0 w-full border-0 p-0">
                {/* A real `<legend>`, and the cards in a flex column INSIDE the fieldset rather
                    than making the fieldset itself the flex container — a legend is laid out
                    specially and does not want to be a flex item. */}
                <legend className="mb-[10px] w-full text-ui-dense font-semibold text-ink">
                  {BRAND_COPY.whichProject}
                </legend>
                <div className="flex flex-col gap-[10px]">
                  {projects.map((project) => (
                    <label
                      key={project.id}
                      /* THE HIGHLIGHT IS `:has(:checked)` AND NOTHING ELSE. A static class on the
                         pre-selected card would stay lit after the customer picked a different
                         one — two cards coral, with scripts off and nothing to clear it. The
                         `defaultChecked` below lights the right card on first paint and the
                         browser moves it from there, no JavaScript involved. */
                      className="flex cursor-pointer items-center gap-[11px] rounded-thumb border border-line bg-surface p-[12px_13px] text-left hover:border-line-strong has-[:checked]:border-coral has-[:checked]:bg-coral-tint has-[:focus-visible]:shadow-focus"
                    >
                      <input
                        type="radio"
                        name="project_id"
                        value={project.id}
                        defaultChecked={project.id === targetId}
                        /* `outline-none`: the LABEL carries the coral ring
                           (`has-[:focus-visible]:shadow-focus` above), so without this a keyboard
                           user got the UA outline on the 16px dot AND the ring on the card — two
                           focus indicators, which `greyed.ts:60`'s `ring` exists to prevent and
                           which axe cannot see (review 3, 2026-09-08). */
                        className="size-4 shrink-0 accent-coral outline-none"
                      />
                      <ProjectThumb stylePack={project.style_pack} />
                      {/* THE NAME AND ITS BINDING ARE STACKED, not a row. Side by side they shared
                          the rail's width with the radio and the thumbnail, and a project called
                          anything at all truncated to "Orbit …" beside a tag that never did
                          (measured at 1440 when the panel was first rendered, 2026-09-10). The
                          name is the thing being chosen; it gets the line. */}
                      <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                        <span className="truncate text-ui-dense font-semibold text-ink">{project.name}</span>
                        {project.linked_site_id === site.id ? (
                          <span className="truncate text-control-label text-ink-soft">{BRAND_COPY.thisSite}</span>
                        ) : project.linked_site_id ? (
                          /* BOUND TO A DIFFERENT SITE, and saying so is the whole of the change:
                             the brand still lands where the customer points it and
                             `linked_site_id` is still never written, so nothing about the binding
                             moves. An unlabelled card beside one marked "This site's project"
                             reads as unbound, which is the one thing it is not. */
                          <span className="truncate text-control-label text-ink-soft">{BRAND_COPY.otherSite}</span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              /* The decision the caption states, carried back so `useBrand` can refuse it if it
                 has gone stale. Empty means "make a project for this site". */
              <input type="hidden" name="project_id" value={targetId ?? ''} />
            )}

            {/* THE PRESSES SIT AT THE BOTTOM OF THE RAIL — `mt-auto` — under whatever the chooser
                left above them, which is what "the options, and buttons below" means when the
                options are sometimes absent. */}
            <div className="mt-auto flex flex-col gap-[10px]">
              {/* The matrix's "insert fails → the page says so". `useBrand` redirects back here
                  with the flag rather than returning a value, so the message survives scripts off
                  — the same shape `recheckPlan` uses on the Sites page. ABOVE the buttons and not
                  below them: it arrives with the document rather than as a later change, so a live
                  region is not announced for it, and it is the reason the customer is being asked
                  to press again (review, 2026-09-08). */}
              {failed ? (
                <p role="status" className="text-helper-caption text-coral-text">
                  {BRAND_COPY.failed}
                </p>
              ) : null}
              <p id="brand-caption" className="text-helper-caption text-ink-soft">
                {caption}
              </p>
              <Submit
                busy={BRAND_COPY.using}
                size={44}
                variant="primary"
                className="w-full"
                aria-describedby="brand-caption"
              >
                {BRAND_COPY.use}
              </Submit>
            </div>
          </form>

          {/* Its own `<form>` and not a second button in the one above — a form cannot nest, and
              Skip posts a different action. It sits under the primary rather than beside it: the
              rail is 340 wide and both labels grow when pressed, so a row of two would wrap. */}
          <form action={skipBrand}>
            <input type="hidden" name="site_id" value={site.id} />
            {chrome}
            <Submit busy={BRAND_COPY.skipping} size={44} variant="ghost" weight="font-medium" className="w-full">
              {BRAND_COPY.skip}
            </Submit>
          </form>
        </aside>
      </div>
    </>
  )
}

/** The left column: everything read off the customer's Ghost, and nothing decided. */
function SiteToday({ site }: { site: BrandSite }) {
  const { logo, accent, nav, title, host, url } = site
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-[16px_20px] tablet:overflow-y-auto tablet:p-[20px_22px]">
      <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">
        {BRAND_COPY.siteToday}
      </h2>

      <div className="flex items-center gap-[14px]">
        {logo ? (
          // The customer's own logo, https-only. `alt=""` — the site's name is the line beside it,
          // and a screen reader reading it twice is worse than not at all.
          <img src={logo} alt="" width={48} height={48} className="size-12 shrink-0 rounded-thumb object-contain" />
        ) : (
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-thumb bg-ink font-display text-[22px] font-bold text-paper"
          >
            {/* `Array.from` and not `slice(0, 1)`: a Ghost title starting with an emoji is a
                surrogate PAIR, and half of one renders as the replacement character. */}
            {(Array.from(title)[0] ?? '').toUpperCase()}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-[2px]">
          <span className="truncate text-body font-semibold text-ink">{title}</span>
          {/* THE ADDRESS OPENS IN A NEW TAB AND SAYS SO — the owner's ask of 2026-09-10 ("Make the
              URL on left side an anchor link and show a new tab icon. On clicking it should open in
              a new tab"). It is a straight lift of the Sites card's own markup, which has linked
              the same address since his finding 4 one story earlier, glyph included; two addresses
              in one app behaving two ways is what this closes.

              THE VALUE IS THE ONE THE CARD LINKS — `public_url || url` (`brand-screen.tsx`), the
              address Inflozo connected or the public one Ghost reports — and NEVER a url read out
              of the customer's Ghost menu. That distinction is the file's own rule two paragraphs
              up: the menu entries stay text pills with no `href`, and this is not one of them. */}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`flex min-w-0 items-center gap-[5px] rounded-sm font-mono text-control-label text-ink-soft underline-offset-2 hover:underline ${ring}`}
          >
            <span className="truncate">{host}</span>
            <ExternalLink size={12} className="shrink-0" label="opens in a new tab" />
          </a>
        </div>
      </div>

      {accent ? (
        <div className="flex flex-col gap-[10px]">
          <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.accent}</h3>
          <div className="flex items-center gap-[10px]">
            {/* THE ONE INLINE `style` ON THIS SCREEN, and the value behind it matched
                `#rgb`/`#rrggbb` in `brandOf` before it was ever stored. */}
            <span aria-hidden style={{ background: accent }} className="size-7 shrink-0 rounded-full shadow-hairline-inset" />
            <span className="font-mono text-ui font-medium text-ink">{accent}</span>
          </div>
        </div>
      ) : null}

      {nav.length > 0 ? (
        <div className="flex flex-col gap-[10px]">
          <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.navigation}</h3>
          <ul className="flex list-none flex-wrap gap-[6px] p-0">
            {nav.map((item, index) => (
              <li
                key={`${item.url}-${index}`}
                className="rounded-pill border border-line bg-surface px-[10px] py-[3px] text-control-label font-medium text-ink"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* THE FRAME NESTS THIS UNDER Navigation and always draws a menu; a real site need not have
          one, and the sentence is about FONTS. It is one of the elements the story's own acceptance
          criterion enumerates, so it stays whatever else is readable (review, 2026-09-08). */}
      <p className="text-[11.5px] leading-[1.5] text-ink-soft">{BRAND_COPY.fonts}</p>

      {/* The frame's mini homepage, now at the foot of the half it belongs to. Its paper is the
          app's own `line` and `line-strong`, as the dashboard card's placeholder is
          (`placeholder.tsx`) — only the button is the customer's colour, which is the whole thing
          the drawing is here to show. */}
      <div className="mt-auto flex flex-col items-center gap-3 rounded-thumb bg-paper p-5">
        <div aria-hidden className="flex h-[170px] w-[250px] max-w-full flex-col gap-2 rounded-thumb bg-surface p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="h-[8px] w-[34px] rounded-[2px] bg-ink" />
            <div className="flex gap-1">
              <div className="h-[5px] w-4 rounded-[2px] bg-line-strong" />
              <div className="h-[5px] w-4 rounded-[2px] bg-line-strong" />
            </div>
          </div>
          <div className="mt-[10px] h-[26px] w-[80%] rounded-[3px] bg-ink" />
          <div className="h-[8px] w-[60%] rounded-[2px] bg-line-strong" />
          <div
            style={accent ? { background: accent } : undefined}
            className={`mt-2 h-5 w-[74px] rounded-[5px] ${accent ? '' : 'bg-line-strong'}`}
          />
        </div>
        <p className="text-center text-ui-dense text-ink-soft">{BRAND_COPY.homepage}</p>
      </div>
    </div>
  )
}