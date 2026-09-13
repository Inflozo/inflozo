import type { ComponentProps } from 'react'
import { Upload } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:256 — image control: the asset row and the drop zone.
   The checkerboard behind a placeholder thumbnail is the frame's own repeating gradient.

   Story 4.5: the row can show the picture itself (`src`, in the checkerboard's box) and its Replace
   can act — `replace` is spread onto that button, so a caller makes it a popover's trigger. No hooks. */

export function AssetRow({
  name,
  meta,
  src,
  replace,
}: {
  name: string
  meta: string
  src?: string
  replace?: Omit<ComponentProps<'button'>, 'type' | 'className' | 'children'>
}) {
  return (
    <div className="flex items-center gap-[10px] rounded-sm border border-line bg-surface p-[8px_10px]">
      {src ? (
        <img src={src} alt="" className="h-8 w-11 shrink-0 rounded-[6px] object-cover" />
      ) : (
        <span
          aria-hidden
          className="h-8 w-11 shrink-0 rounded-[6px] bg-[repeating-linear-gradient(45deg,var(--color-paper-sunk)_0_6px,var(--color-line)_6px_12px)]"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-control-label font-medium text-ink">{name}</span>
        <span className="font-mono text-[10px] text-ink-soft">{meta}</span>
      </span>
      <button type="button" {...replace} className={`shrink-0 text-control-label font-semibold text-coral-text ${ring}`}>
        Replace
      </button>
    </div>
  )
}

export const DropZone = ({ formats }: { formats: string }) => (
  <button
    type="button"
    className={`flex w-full flex-col items-center gap-[6px] rounded-thumb border-[1.5px] border-dashed border-coral bg-coral-tint/60 p-4 ${ring}`}
  >
    <Upload size={18} className="text-coral-deep" />
    <span className="text-control-label font-semibold text-ink">Drop an image — we&rsquo;ll optimize it ✨</span>
    <span className="text-helper-caption text-ink-soft">{formats}</span>
  </button>
)
