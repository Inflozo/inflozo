import { fieldTone, greyedProps, labelTone, reason, ring, type Greyed } from './greyed'
import { Search } from './icons'

/* Editor Sidebar Kit.dc.html:53 — inputs. Radius 8, hairline border, coral caret,
   placeholder in ink-soft-aa, and on focus a coral-text border plus THE ring. 12.5px is
   the frame's size and is not rounded to a role (F-111). */

const field =
  'h-9 rounded-sm border px-[11px] text-[12.5px] text-ink caret-coral placeholder:text-ink-soft-aa'

type Base = { id: string; label: string; greyed?: Greyed }

export function TextInput({
  id,
  label,
  name,
  defaultValue,
  placeholder,
  mono = false,
  error,
  greyed,
}: Base & {
  /** Present when the field is inside a form that submits it. */
  name?: string
  defaultValue?: string
  placeholder?: string
  mono?: boolean
  /**
   * The refusal sentence, in the same helper-caption slot a greyed control's reason takes —
   * under the control, never a tooltip (P0-0). Danger-text, because it says something failed.
   */
  error?: string | null
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className={`text-control-label font-medium ${labelTone(greyed)}`}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={Boolean(greyed)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${field} ${error ? 'border-danger caret-danger' : fieldTone(greyed)} ${ring} focus-visible:border-coral-text ${mono ? 'font-mono text-control-label' : ''} ${greyed ? 'text-ink-faint' : ''}`}
        {...greyedProps(id, greyed)}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-helper-caption leading-[1.5] text-danger-text">
          {error}
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
