'use client'

import Form from 'next/form'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { Globe, Image, MenuLines, Plus, Projects, Search, X } from '@/components/kit/icons'
import { NEW_PROJECT_DIALOG } from '@/lib/projects'
import type { PlanId } from '@/lib/plan'
import { stripApp } from '@/routing'
import { AccountMenu } from './account-menu'
import type { ShellUser } from '@/lib/shell-user'

/* ──────────────────────────────────────── S3 Dashboard.dc.html — the shell, 1440 and 390.

   Every value is read off the frame and never rounded (F-111): the 220px sidebar with its
   24/12/16 padding, the 64px top bar at 0 24, the 60px bar at 390 with its 0 12 0 6, the
   320×36 search field, the 44px touch targets. `tablet:` is the seam — the frame draws 1440
   and 390, and the sidebar holds from `tablet` (834) up.

   ABSENT, deliberately, and each is another epic's: the storage meter under the nav (E8), the
   notifications bell (E13) and the what's-new sparkle (the epic's cut line). Absent, not
   greyed — there is nothing behind any of them to reach yet (UX-DR3).

   AND ABSENT ON THE OWNER'S RULING: the 32px avatar the 390 frame draws at the right of the top
   bar. It and the account row inside ☰ read as one control duplicated, so the menu moved into
   the drawer and the top bar keeps ☰ · the wordmark · search (2026-09-05, spec question 2,
   option 1 — see account-menu.tsx, which carries the rest of that ruling).

   The shell lives in `(authed)/layout.tsx`, so every later authenticated surface is inside it
   by where its file sits. The search field and "New project" belong to the DASHBOARD and are
   drawn only there: on any other surface they would be controls with nothing to act on. */

const NAV = [
  { href: '/', label: 'Projects', Icon: Projects },
  { href: '/sites', label: 'Sites', Icon: Globe },
  { href: '/assets', label: 'Assets', Icon: Image },
] as const

/*
 * `proxy.ts` rewrites `app.inflozo.com/x` onto the internal `/app/x`, and on localhost the
 * internal prefix is reached directly — so the path a link is written with (`/sites`) and the
 * path the router reports can differ by exactly that prefix. `stripApp` is `routing.ts`'s own
 * strip, so "am I on the dashboard" is one answer at both addresses and one function under test.
 */
// A segment, never a prefix — `routing.ts:13` records `startsWith('/app')` eating /apply.
const isActive = (path: string, href: string) => path === href || (href !== '/' && path.startsWith(`${href}/`))

/** The one opener: the button is in the layout and the sheet is rendered by the page. */
export const openNewProject = () => {
  const sheet = document.getElementById(NEW_PROJECT_DIALOG)
  if (sheet instanceof HTMLDialogElement && !sheet.open) sheet.showModal()
}

/**
 * S3's coral call to action, in the three sizes the frames draw it: the top bar's 36, S3b's
 * centred 44, and 390's full-width 48 in the body. Coral is THE action of this surface and
 * appears once per view — the empty state and the top bar are never on screen together.
 */
export function NewProjectButton({ look }: { look: 'bar' | 'empty' | 'mobile' }) {
  if (look === 'mobile') {
    return (
      <button
        type="button"
        onClick={openNewProject}
        className={`h-12 w-full rounded bg-coral-text text-[15px] font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}
      >
        + New project
      </button>
    )
  }
  return (
    <Button variant="coral" size={look === 'bar' ? 36 : 44} onClick={openNewProject}>
      <Plus size={look === 'bar' ? 14 : 15} />
      New project
    </Button>
  )
}

/**
 * The search is a GET form and that is the whole of its state: the field is in the layout and
 * the cards are in the page, and the URL is the one thing both already share, so `?q=` needs
 * no client state and no context. Enter searches.
 * ponytail: Enter-to-search; live filtering is a router.replace on input if the owner wants it.
 *
 * `next/form`, not a bare `<form>`: a bare GET is a full document navigation, which threw the
 * phone's field away the moment Enter was pressed — `searchOpen` is layout state and a reload
 * starts it closed. A client navigation keeps the layout, so the box the user typed into stays
 * on screen with the results under it (review, 2026-09-05). The action is the path the router
 * reports, so it is right on both hosts.
 */
function SearchField({ id, wide, focused = false }: { id: string; wide: boolean; focused?: boolean }) {
  const q = useSearchParams().get('q') ?? ''
  const pathname = usePathname()
  return (
    <Form
      action={pathname}
      role="search"
      className={`flex h-9 items-center gap-2 rounded-sm border border-line bg-surface px-[10px] has-[:focus-visible]:border-coral-text has-[:focus-visible]:shadow-focus ${
        wide ? 'w-full' : 'w-[320px]'
      }`}
    >
      <Search size={15} className="shrink-0 text-ink-soft" />
      <label htmlFor={id} className="sr-only">
        Search projects
      </label>
      <input
        id={id}
        name="q"
        type="search"
        // The value is whatever the URL says, and a new URL is a new field.
        key={q}
        defaultValue={q}
        // THE PHONE'S FIELD IS FOCUSED BY BEING RENDERED. The search button used to set the
        // state and then chase the field with a `requestAnimationFrame`, which fires before
        // React has committed the element — so the tap opened the field and left the cursor
        // nowhere (the owner's finding 7). `autoFocus` runs on mount, which is exactly when
        // the field exists, and mount is what the tap causes.
        autoFocus={focused}
        placeholder="Search projects…"
        className="min-w-0 flex-1 bg-transparent text-ui-dense text-ink caret-coral outline-none placeholder:text-ink-soft-aa [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd
        aria-hidden
        className="hidden shrink-0 rounded-[5px] border border-line px-[5px] py-px font-mono text-helper-caption text-ink-soft tablet:block"
      >
        ⌘K
      </kbd>
    </Form>
  )
}

const Wordmark = ({ size }: { size: 19 | 20 }) => (
  <Link
    href="/"
    style={{ fontSize: size }}
    className={`rounded-sm font-display font-extrabold tracking-[-0.02em] text-ink ${ring}`}
  >
    Inflozo
  </Link>
)

function NavItem({
  href,
  label,
  Icon,
  active,
  big,
  onNavigate,
}: {
  href: string
  label: string
  Icon: (p: { size?: number }) => ReactNode
  active: boolean
  big: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center rounded-sm transition-colors ${
        big ? 'gap-3 p-[12px_14px] text-[15px]' : 'gap-[10px] p-[8px_12px] text-ui-dense'
      } ${
        active
          ? big
            ? 'bg-paper font-semibold text-ink'
            : 'bg-surface font-semibold text-ink shadow-sm'
          : 'font-medium text-ink-soft hover:bg-paper-sunk'
      } ${ring}`}
    >
      <Icon size={big ? 18 : 16} />
      {label}
    </Link>
  )
}

export function Shell({
  user,
  plan,
  children,
}: {
  user: ShellUser
  plan: PlanId
  children: ReactNode
}) {
  const path = stripApp(usePathname())
  const onDashboard = path === '/'
  const drawer = useRef<HTMLDialogElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  // ⌘K (and Ctrl+K) puts the cursor in the field, whichever of the two is on screen: only one
  // is ever visible, so "the visible one" is unambiguous and needs no width test here.
  // Lower-cased, because Shift or Caps Lock reports `K`; and not under a modal, where the
  // field would be inert and, at 390, mount behind it (review, 2026-09-05).
  useEffect(() => {
    if (!onDashboard) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
      // …nor under an open menu: the field would take focus and leave the popover orphaned.
      if (document.querySelector('dialog[open], :popover-open')) return
      event.preventDefault()
      // At 390 the field is focused BY BEING MOUNTED (`autoFocus`, see SearchField) — a
      // `requestAnimationFrame` here fired before React committed it (the owner's finding 7).
      // At 1440 the field is already on screen, so it is simply the visible one.
      setSearchOpen(true)
      const fields = [...document.querySelectorAll<HTMLInputElement>('input[name="q"]')]
      fields.find((field) => field.offsetParent !== null)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDashboard])

  /**
   * `showModal()` hands focus to the first focusable thing inside the panel, which is the
   * wordmark — and the ring the app draws around every focusable control then appeared around
   * the logo the moment ☰ was tapped (the owner's finding 5). The DIALOG takes the focus
   * instead: it is the thing that just opened, a screen reader announces it, Tab still walks
   * into the panel from there, and `tabIndex={-1}` is what makes an element focusable without
   * putting it in the tab order.
   */
  const openDrawer = () => {
    const panel = drawer.current
    if (!panel) return
    panel.showModal()
    panel.focus()
  }

  /**
   * A tap on the scrim closes the drawer (the owner's finding 4). A modal `<dialog>` does not
   * do this itself — the platform gives Escape and the focus trap, not light dismiss — and the
   * backdrop's clicks arrive on the dialog element, so "outside" is a rect test rather than a
   * target test alone: the panel's own padding is also the dialog element, and closing on a tap
   * in the padding would be the same bug with the sign flipped.
   *
   * The confirms and the New project sheet deliberately do NOT get this: a destructive confirm
   * that a stray tap dismisses is the thing the typed name exists to prevent, and Escape and
   * Cancel are their two ways out (EXPERIENCE.md § Destructive confirms).
   */
  const dismissDrawer = (event: MouseEvent<HTMLDialogElement>) => {
    const panel = drawer.current
    if (!panel || event.target !== panel) return
    const box = panel.getBoundingClientRect()
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    if (outside) panel.close()
  }

  const nav = (big: boolean, onNavigate?: () => void) => (
    <nav aria-label="Sections" className="flex flex-col gap-[2px]">
      {NAV.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          big={big}
          active={isActive(path, item.href)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-dvh flex-col tablet:flex-row">
      {/* ── the 220px sidebar, tablet and up */}
      <div className="hidden w-[220px] shrink-0 flex-col border-r border-line p-[24px_12px_16px] tablet:flex">
        {/* A landmark, so the wordmark is inside one (axe `region`, second review 2026-09-05). */}
        <header className="p-[0_12px_24px]">
          <Wordmark size={20} />
        </header>
        {nav(false)}
        <div className="mt-auto">
          <AccountMenu user={user} plan={plan} variant="sidebar" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── the 60px bar at 390 */}
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line p-[0_12px_0_6px] tablet:hidden">
          <button
            type="button"
            aria-label="Menu"
            onClick={openDrawer}
            className={`inline-flex size-11 items-center justify-center rounded-sm text-ink ${ring}`}
          >
            <MenuLines size={20} />
          </button>
          <Wordmark size={19} />
          <div className="ml-auto flex items-center">
            {onDashboard ? (
              <button
                type="button"
                aria-label="Search projects"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((open) => !open)}
                className={`inline-flex size-11 items-center justify-center rounded-sm text-ink-soft ${ring}`}
              >
                <Search size={18} />
              </button>
            ) : null}
          </div>
        </header>
        {onDashboard && searchOpen ? (
          <div className="border-b border-line p-[10px_12px] tablet:hidden">
            <SearchField id="q-mobile" wide focused />
          </div>
        ) : null}

        {/* ── the 64px top bar at 1440. The dashboard's own controls, so only there. */}
        {onDashboard ? (
          <div className="hidden h-16 shrink-0 items-center gap-3 border-b border-line px-6 tablet:flex">
            <SearchField id="q" wide={false} />
            <div className="ml-auto">
              <NewProjectButton look="bar" />
            </div>
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>

      {/* ── ☰: a modal dialog, so the scrim, Escape and the focus trap are the platform's.
          No `tablet:hidden` on it: closed, the user agent hides it anyway, and open across the
          seam (a tablet rotated) it would have been an invisible modal holding the page inert
          (review, 2026-09-05) — now it stays a closable panel until dismissed. */}
      <dialog
        ref={drawer}
        aria-label="Menu"
        tabIndex={-1}
        onClick={dismissDrawer}
        className="m-0 h-dvh max-h-dvh w-[300px] max-w-[300px] flex-col bg-surface p-[20px_14px_16px] shadow-lg outline-none backdrop:bg-scrim open:flex"
      >
        <div className="flex items-center justify-between p-[0_10px_20px]">
          <Wordmark size={20} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => drawer.current?.close()}
            className={`-mt-[10px] -mr-3 inline-flex size-11 items-center justify-center rounded-sm text-ink-soft ${ring}`}
          >
            <X size={18} />
          </button>
        </div>
        {nav(true, () => drawer.current?.close())}
        {/* The phone's account menu, on the owner's ruling: this row opens it, upwards, and
            the top bar carries no second initial. */}
        <div className="mt-auto border-t border-line pt-1">
          <AccountMenu
            user={user}
            plan={plan}
            variant="drawer"
            onNavigate={() => drawer.current?.close()}
          />
        </div>
      </dialog>
    </div>
  )
}
