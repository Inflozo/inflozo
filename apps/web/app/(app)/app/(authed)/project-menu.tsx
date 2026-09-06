'use client'

import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { Copy, Pencil, Trash } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { openNewProject } from '@/components/shell/shell'
import { arrowKeys, openMenu } from '@/lib/menu'
import { matchesName, NAME_MAX } from '@/lib/projects'
import { deleteProject, duplicateProject, renameProject, type ActionResult } from './projects/actions'

/* ────────────────────────────────────── S3c's ⋯ menu, and the two confirms behind it.

   THE MENU IS S3c, drawn: 160px, surface on a `line` hairline, `shadow-lg`, padding 6, opening
   down under the trigger; Rename · Duplicate · a rule · Delete, Delete in danger-text with its
   trash in danger. Light dismiss, Escape and the return of focus to the ⋯ are the platform's —
   that is what `popover="auto"` is for — and `lib/menu.ts` adds only the placement and the
   arrow keys.

   RENAME AND DELETE HAVE NO FRAME and are extrapolated from S12c, the nearest typed confirm
   (R-74: extrapolate from the nearest frame, never invent a second vocabulary): a 460px
   `<dialog>`, the display title, the 13px body, the right-aligned Cancel + primary footer, and
   for Delete the danger-tint disc, the mono chip in the label and the mono field.

   DELETE IS CENTRED ON THE OWNER'S OWN INSTRUCTION — "the Delete Project Popup needs a better
   design. With the icon in top center. And overall better visuals." (his test, 2026-09-05). So
   the disc moved from the left of the title to above it and grew to 52px, the title and the
   sentence centre under it, the two buttons are equal halves at 44 rather than a right-aligned
   pair at 36, and the icon is the trash the ⋯ menu's Delete already wears rather than a warning
   triangle — one delete, one symbol. It stays inside the S12c vocabulary: same dialog, same
   tokens, same typed name, same focus-on-Cancel. RENAME IS UNTOUCHED: it is not destructive and
   a form with one field is right-aligned like every other form in the app.

   BOTH OPEN WITH FOCUS ON CANCEL (EXPERIENCE.md § Destructive confirms), which is why Cancel
   carries `autoFocus` — a confirm whose primary action is irreversible never opens on it.

   No wit on this surface: delete is a serious voice (Appendix H). */

/* `m-auto` IS LOAD-BEARING. The user agent centres a modal `<dialog>` with `inset:0; margin:auto`,
   and Tailwind's Preflight resets `margin:0` on `*` — so every dialog opened flush against the
   top-left corner until this was here (executed, and visible in the D4b screenshot that found it). */
const sheet =
  'm-auto w-[460px] max-w-[calc(100vw-20px)] flex-col rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex'

const title = 'font-display text-[20px] font-bold tracking-[-0.01em] text-ink'

const item = `flex w-full items-center gap-[9px] rounded-sm p-[8px_12px] text-left text-ui-dense font-medium transition-colors ${ring}`

/**
 * DUPLICATE IS ONE ACTION FOR THE WHOLE GRID, so its failure Banner sits above the grid rather
 * than inside whichever card was clicked (the story's matrix). Every card's Duplicate is still
 * a real `<form>` posting the id, so it works with JavaScript switched off; what the context
 * carries is the shared `formAction` and nothing else.
 */
const DuplicateContext = createContext<((formData: FormData) => void) | null>(null)

export function DuplicateScope({ children }: { children: ReactNode }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(duplicateProject, null)
  const error = state && 'error' in state ? state.error : null
  // The matrix's *Duplicate, at cap* row answers `at_cap` with the D4b sheet, the same
  // contextual prompt "New project" raises — and a card rendered under the cap can still meet
  // it by the time it posts (a second tab). Only `'failed'` was rendered, so that race was a
  // click that did nothing at all; every other code now says its sentence rather than none
  // (review, 2026-09-05). The action revalidates the page before answering `at_cap`, so the
  // sheet it opens already has the true `atCap` and is D4b.
  useEffect(() => {
    if (error?.code === 'at_cap') openNewProject()
  }, [error])
  const failed = error && error.code !== 'at_cap' ? error.message : null

  return (
    <DuplicateContext value={action}>
      {failed ? <Banner kind="error">{failed}</Banner> : null}
      {children}
    </DuplicateContext>
  )
}

export function ProjectMenu({ id, name, atCap }: { id: string; name: string; atCap: boolean }) {
  const menuId = `project-menu-${id}`
  const menu = useRef<HTMLDivElement>(null)
  const rename = useRef<HTMLDialogElement>(null)
  const remove = useRef<HTMLDialogElement>(null)
  const duplicate = useContext(DuplicateContext)
  // Without the scope the Duplicate `<form>` would have no action and post a GET to `?id=…`, a
  // click that reloads the page and duplicates nothing — so it is refused at render, loudly.
  if (!duplicate) throw new Error('ProjectMenu must render inside DuplicateScope')

  const [renamed, renameAction, renaming] = useActionState<ActionResult | null, FormData>(renameProject, null)
  const [removed, deleteAction, removing] = useActionState<ActionResult | null, FormData>(deleteProject, null)
  const [typed, setTyped] = useState('')
  // A result the dialog was CLOSED on is spent: reopened, it starts clean rather than with the
  // last attempt's sentence still on screen (review, 2026-09-05). Identity is enough — every
  // action call returns a new object.
  const [renamedSeen, setRenamedSeen] = useState<ActionResult | null>(null)
  const [removedSeen, setRemovedSeen] = useState<ActionResult | null>(null)

  // A dialog closes when its action succeeded, and stays open with its sentence when it did not.
  useEffect(() => {
    if (renamed && 'ok' in renamed) rename.current?.close()
  }, [renamed])
  useEffect(() => {
    if (removed && 'ok' in removed) remove.current?.close()
  }, [removed])

  const close = () => menu.current?.hidePopover()

  /**
   * EVERY CONFIRM OPENS WITH FOCUS ON CANCEL (EXPERIENCE.md § Destructive confirms), and the
   * `autoFocus` prop alone does not do it: React applies it once at mount and does not leave
   * the `autofocus` ATTRIBUTE in the DOM, so `showModal()` — which looks for that attribute —
   * fell through to the first focusable control instead. Executed: the rename dialog opened on
   * its name field. So the button says which one it is and the dialog is told, every time.
   */
  const open = (dialog: HTMLDialogElement | null) => {
    close()
    if (!dialog) return
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-cancel]')?.focus()
  }

  const renameError = renamed !== renamedSeen && renamed && 'error' in renamed ? renamed.error : null
  // The field's own refusal goes in the field's helper-caption slot; anything else is a Banner
  // above the form. Only `bad_name` was read, so a rename that FAILED left the dialog open,
  // unchanged and silent — the sentence was composed and never shown (review, 2026-09-05).
  const nameError = renameError?.code === 'bad_name' ? renameError.message : null
  const renameFailed = renameError && renameError.code !== 'bad_name' ? renameError.message : null
  const deleteError = removed !== removedSeen && removed && 'error' in removed ? removed.error.message : null
  const armed = matchesName(typed, name)

  return (
    <>
      <button
        type="button"
        popoverTarget={menuId}
        aria-label={`Options for ${name}`}
        onClick={(event) => {
          // S3c draws it under the trigger; the ⋯ sits at the card's right edge, so the menu
          // hangs leftwards from it. The rect is read here because the popover is still
          // display:none when this runs — see lib/menu.ts.
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'right' })
        }}
        // S3c draws the trigger in ink while its menu is open; the popover is the next sibling.
        className={`rounded-sm px-1 font-semibold tracking-[2px] text-ink-soft transition-colors hover:text-ink [&:has(+:popover-open)]:text-ink ${ring}`}
      >
        ⋯
      </button>

      <div
        ref={menu}
        id={menuId}
        popover="auto"
        onKeyDown={arrowKeys}
        // `flex` UNCONDITIONALLY WOULD KEEP THE MENU ON SCREEN: the popover's hidden state is the
        // user agent's `[popover]:not(:popover-open){display:none}`, and ANY author `display`
        // beats it — executed, the ⋯ menu rendered inside every card and its items sat in the tab
        // order. `open:` is Tailwind 4's `:is([open], :popover-open)`, so the display arrives with
        // the open state; `flex-col` is inert while the element is hidden.
        className="w-[160px] flex-col rounded border border-line bg-surface p-[6px] shadow-lg open:flex"
      >
        <button type="button" onClick={() => open(rename.current)} className={`${item} text-ink hover:bg-paper`}>
          <span className="shrink-0 text-ink-soft">
            <Pencil size={15} />
          </span>
          Rename
        </button>

        {/* At the cap a duplicate would be a second project, so the same contextual prompt the
            "New project" button raises is what opens — D4b, with the plan's own sentence. */}
        {atCap ? (
          <button
            type="button"
            onClick={() => {
              close()
              openNewProject()
            }}
            className={`${item} text-ink hover:bg-paper`}
          >
            <span className="shrink-0 text-ink-soft">
              <Copy size={15} />
            </span>
            Duplicate
          </button>
        ) : (
          <form action={duplicate} onSubmit={close}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={`${item} text-ink hover:bg-paper`}>
              <span className="shrink-0 text-ink-soft">
                <Copy size={15} />
              </span>
              Duplicate
            </button>
          </form>
        )}

        <div aria-hidden className="m-[4px_8px] h-px bg-line" />

        <button
          type="button"
          onClick={() => {
            setTyped('')
            open(remove.current)
          }}
          className={`${item} text-danger-text hover:bg-danger-tint`}
        >
          <span className="shrink-0 text-danger">
            <Trash size={15} />
          </span>
          Delete
        </button>
      </div>

      {/* ── Rename */}
      <dialog
        ref={rename}
        aria-labelledby={`rename-${id}-title`}
        onClose={(event) => {
          setRenamedSeen(renamed)
          // The field is uncontrolled, so a refused or abandoned edit stayed in it and the next
          // open showed that instead of the name; `reset()` restores `defaultValue`, which React
          // keeps at the current name (review, 2026-09-06).
          event.currentTarget.querySelector('form')?.reset()
        }}
        className={`${sheet} gap-[18px]`}
      >
        <h2 id={`rename-${id}-title`} className={title}>
          Rename project
        </h2>
        {renameFailed ? <Banner kind="error">{renameFailed}</Banner> : null}
        <form action={renameAction} className="flex flex-col gap-[18px]">
          <input type="hidden" name="id" value={id} />
          {/* `maxLength` is the schema's own number, so the 81st character cannot be typed or
              pasted and the matrix's "nothing sent" is true of it natively — the sentence still
              belongs to the server, which never trusts the field (review, 2026-09-05). */}
          <TextInput
            id={`rename-${id}`}
            name="name"
            label="Name"
            defaultValue={name}
            maxLength={NAME_MAX}
            error={nameError}
          />
          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="secondary" size={36} data-cancel onClick={() => rename.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size={36}>
              {renaming ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </dialog>

      {/* ── Delete, S12c's shape, centred */}
      <dialog
        ref={remove}
        aria-labelledby={`delete-${id}-title`}
        onClose={() => setRemovedSeen(removed)}
        className={`${sheet} gap-5`}
      >
        <div className="flex flex-col items-center gap-[14px] text-center">
          {/* The disc, and a softer ring around it so the icon reads as the subject of the
              window rather than a bullet beside the title. Both are `danger-tint`; the ring is
              the same token at 50%, which is a token used twice and not a second colour. */}
          <span
            aria-hidden
            className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger ring-8 ring-danger-tint/50"
          >
            <Trash size={22} strokeWidth={1.7} />
          </span>
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h2 id={`delete-${id}-title`} className={`${title} wrap-anywhere`}>
              Delete {name}?
            </h2>
            <p className="text-ui-dense leading-[1.5] text-ink-soft">
              This project will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            // The server re-checks the typed name and never trusts this; the guard is here so
            // a greyed button cannot be pressed into action by Enter.
            if (!armed) event.preventDefault()
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-col gap-[7px]">
            <label
              htmlFor={`delete-${id}-typed`}
              className="text-center text-control-label font-medium text-ink-soft"
            >
              Type{' '}
              <span className="rounded-[5px] border border-line bg-paper px-[6px] py-px font-mono text-control-label text-ink">
                {name}
              </span>{' '}
              to confirm
            </label>
            <input
              id={`delete-${id}-typed`}
              name="typed"
              type="text"
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.currentTarget.value)}
              aria-describedby={deleteError ? `delete-${id}-error` : undefined}
              className={`h-10 rounded-sm border border-danger bg-surface px-3 font-mono text-ui-dense text-ink caret-danger ${ring}`}
            />
            {deleteError ? (
              <p
                id={`delete-${id}-error`}
                role="alert"
                className="text-helper-caption leading-[1.5] text-danger-text"
              >
                {deleteError}
              </p>
            ) : null}
          </div>

          {/* Two equal halves, so neither destructive choice looks like the small one, and so
              both are a full-width tap target at 390. Cancel is first: it is the way out. */}
          <div className="grid grid-cols-2 gap-[10px]">
            <Button
              type="button"
              variant="secondary"
              size={44}
              data-cancel
              className="w-full"
              onClick={() => remove.current?.close()}
            >
              Cancel
            </Button>
            {/* The kit greys with `aria-disabled`, never `disabled`: the button stays in the tab
                order so a screen reader still reaches it and its state (greyed.ts). */}
            <Button
              type="submit"
              variant="danger"
              size={44}
              aria-disabled={armed ? undefined : true}
              className={`w-full ${armed ? '' : 'opacity-45'}`}
            >
              {removing ? 'Deleting…' : 'Delete project'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
