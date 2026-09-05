'use client'

import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { AlertTriangle, Copy, Pencil, Trash } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { openNewProject } from '@/components/shell/shell'
import { arrowKeys, openMenu } from '@/lib/menu'
import { matchesName } from '@/lib/projects'
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
   for Delete the 38px danger-tint disc, the mono chip in the label and the mono field.

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
  const failed = state && 'error' in state && state.error.code === 'failed' ? state.error.message : null

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

  const [renamed, renameAction, renaming] = useActionState<ActionResult | null, FormData>(renameProject, null)
  const [removed, deleteAction, removing] = useActionState<ActionResult | null, FormData>(deleteProject, null)
  const [typed, setTyped] = useState('')

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

  const nameError = renamed && 'error' in renamed && renamed.error.code === 'bad_name' ? renamed.error.message : null
  const deleteError = removed && 'error' in removed ? removed.error.message : null
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
        className={`rounded-sm px-1 font-semibold tracking-[2px] text-ink-soft transition-colors hover:text-ink ${ring}`}
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
          <form action={duplicate ?? undefined} onSubmit={close}>
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
      <dialog ref={rename} aria-labelledby={`rename-${id}-title`} className={`${sheet} gap-[18px]`}>
        <h2 id={`rename-${id}-title`} className={title}>
          Rename project
        </h2>
        <form action={renameAction} className="flex flex-col gap-[18px]">
          <input type="hidden" name="id" value={id} />
          <TextInput
            id={`rename-${id}`}
            name="name"
            label="Name"
            defaultValue={name}
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

      {/* ── Delete, S12c's shape */}
      <dialog ref={remove} aria-labelledby={`delete-${id}-title`} className={`${sheet} gap-[18px]`}>
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger"
          >
            <AlertTriangle size={17} strokeWidth={1.8} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={`delete-${id}-title`} className={title}>
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
          className="flex flex-col gap-[18px]"
        >
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-col gap-[6px]">
            <label htmlFor={`delete-${id}-typed`} className="text-control-label font-medium text-ink-soft">
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

          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="secondary" size={36} data-cancel onClick={() => remove.current?.close()}>
              Cancel
            </Button>
            {/* The kit greys with `aria-disabled`, never `disabled`: the button stays in the tab
                order so a screen reader still reaches it and its state (greyed.ts). */}
            <Button
              type="submit"
              variant="danger"
              size={36}
              aria-disabled={armed ? undefined : true}
              className={armed ? '' : 'opacity-45'}
            >
              {removing ? 'Deleting…' : 'Delete project'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
