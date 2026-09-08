import type { ChangeEventHandler } from 'react'
import { fieldTone, greyedProps, labelTone, reason, ring, type Greyed } from './greyed'
import { Search } from './icons'

/* Editor Sidebar Kit.dc.html:53 — inputs. Radius 8, hairline border, coral caret,
   placeholder in ink-soft-aa, and on focus a coral-text border plus THE ring. 12.5px is
   the frame's size and is not rounded to a role (F-111). */

const field = 'rounded-sm border text-ink caret-coral placeholder:text-ink-soft-aa'

/* TWO HEIGHTS, and the second is a frame's. The Kit's own input is 36px at 12.5px (:53); S2b·2
   draws the connect wizard's three fields at 44px, 13px, padding 0 14 — a form the customer
   pastes long keys into, which is why it is bigger there and nowhere else. The label follows the
   field (13px on the 44, the Kit's 12px on the 36), so one prop moves the whole control rather
   than a caller stacking utilities the stylesheet's order would decide between. */
const metrics: Record<36 | 44, { box: string; label: string; mono: string }> = {
  36: { box: 'h-9 px-[11px] text-[12.5px]', label: 'text-control-label', mono: 'text-control-label' },
  44: { box: 'h-11 px-[14px] text-ui-dense', label: 'text-ui-dense', mono: '' },
}

type Base = { id: string; label: string; greyed?: Greyed }

export function TextInput({
  id,
  label,
  name,
  defaultValue,
  value,
  placeholder,
  maxLength,
  mono = false,
  error,
  hint,
  greyed,
  size = 36,
  type = 'text',
  autoComplete,
  required,
  onChange,
}: Base & {
  /** Present when the field is inside a form that submits it. */
  name?: string
  defaultValue?: string
  /**
   * A CONTROLLED value, with `onChange` — for a form whose action can refuse: React resets the
   * form after every action, so an uncontrolled field loses what was typed on a refusal (the
   * connect wizard, review 2026-09-08). Leave it out and the field is the DOM's, as the Kit's are.
   */
  value?: string
  /** The browser's own "fill this in", with or without JavaScript. */
  required?: boolean
  placeholder?: string
  /** The schema's own maximum, so the field refuses the character the action would refuse. */
  maxLength?: number
  mono?: boolean
  /**
   * The refusal sentence, in the same helper-caption slot a greyed control's reason takes —
   * under the control, never a tooltip (P0-0). Danger-text, because it says something failed.
   */
  error?: string | null
  /**
   * A caution the field wants to give while it is still being filled in — NOT a refusal, so it
   * takes the helper-caption slot in marigold rather than the danger red an `error` takes, and
   * the two can be shown together. S2b·2's `http://` warning is the first of them.
   */
  hint?: string | null
  /** 36 is the Kit's own input; 44 is S2b·2's. */
  size?: 36 | 44
  /** `email` gives a phone the @ keyboard and the browser its own address suggestions. */
  type?: 'text' | 'email'
  autoComplete?: string
  /** Present when a field's own value decides something as it is typed (S2b·2's URL warning). */
  onChange?: ChangeEventHandler<HTMLInputElement>
}) {
  const m = metrics[size]
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className={`${m.label} font-medium ${labelTone(greyed)}`}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        onChange={onChange}
        defaultValue={defaultValue}
        value={value}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={Boolean(greyed)}
        aria-invalid={error ? true : undefined}
        className={`${field} ${m.box} ${error ? 'border-danger caret-danger' : fieldTone(greyed)} ${ring} focus-visible:border-coral-text ${mono ? `font-mono ${m.mono}` : ''} ${greyed ? 'text-ink-faint' : ''}`}
        {...greyedProps(id, greyed)}
        // After the spread, so a field that is both greyed and refused is described by both
        // sentences rather than the reason overwriting the error (review, 2026-09-05).
        aria-describedby={
          [error && `${id}-error`, hint && `${id}-hint`, greyed && `${id}-reason`]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-helper-caption leading-[1.5] text-danger-text">
          {error}
        </p>
      ) : null}
      {hint ? (
        // `role="status"`: it appears as the field is typed into, so it is announced without
        // stealing focus — an `alert` would interrupt the typing it is commenting on.
        <p id={`${id}-hint`} role="status" className="text-helper-caption leading-[1.5] text-marigold-text">
          {hint}
        </p>
      ) : null}
      {reason(id, greyed)}
    </div>
  )
}

export function Multiline({ id, label, defaultValue, greyed }: Base & { defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className={`text-control-label font-medium ${labelTone(greyed)}`}>
        {label}
      </label>
      <textarea
        id={id}
        defaultValue={defaultValue}
        readOnly={Boolean(greyed)}
        className={`h-16 resize-none rounded-sm border px-[11px] py-[9px] text-[12.5px] leading-[1.5] text-ink caret-coral placeholder:text-ink-soft-aa ${fieldTone(greyed)} ${ring} focus-visible:border-coral-text`}
        {...greyedProps(id, greyed)}
      />
      {reason(id, greyed)}
    </div>
  )
}

/** The search variant carries a keyboard hint chip on its right. */
export function SearchInput({
  id,
  label,
  placeholder,
  hint,
}: {
  id: string
  label: string
  placeholder: string
  hint: string
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className="text-control-label font-medium text-ink-soft">
        {label}
      </label>
      <div className="flex h-9 items-center gap-2 rounded-sm border border-line bg-surface px-[10px] has-[:focus-visible]:border-coral-text has-[:focus-visible]:shadow-focus">
        <Search className="shrink-0 text-ink-soft" />
        <input
          id={id}
          type="search"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink caret-coral outline-none placeholder:text-ink-soft-aa [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="rounded-[5px] border border-line px-[5px] py-px font-mono text-helper-caption text-ink-soft">
          {hint}
        </kbd>
      </div>
    </div>
  )
}
