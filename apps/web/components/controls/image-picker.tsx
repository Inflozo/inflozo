'use client'

import { AssetRow } from '@/components/kit/image-control'
import { openPopover } from '@/components/kit/select'
import { ring } from '@/components/kit/greyed'

/* The Image Picker (Appendix C, Story 4.5): the Kit's asset row (`Editor Sidebar Kit.dc.html:256`) over a
   pool of pictures. An image prop stores an ASSET ID and the render resolves it (AD-27(b)), so what this
   hands back is an id from `assets`, never a URL. Replace opens the pool in a `popover="auto"` grid —
   EXTRAPOLATED: no frame draws the pool, so it is the Kit's own menu surface holding the asset row's
   thumbnail at a larger size. Uploading is Epic 5's. */

export type Asset = { id: string; src: string; meta: string }

export function ImagePicker({
  id,
  label,
  value,
  assets,
  onChange,
}: {
  id: string
  label: string
  value: unknown
  assets: readonly Asset[]
  onChange: (id: string) => void
}) {
  const current = assets.find((a) => a.id === value)
  const pop = `${id}-pool`
  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
        {label}
      </span>
      <AssetRow
        name={current ? `${current.id}.svg` : 'No picture'}
        meta={current?.meta ?? '—'}
        src={current?.src}
        replace={{
          id,
          'aria-label': `Replace ${label}`,
          popoverTarget: pop,
          onClick: (event) => {
            const el = document.getElementById(pop)
            if (el) openPopover(el, event.currentTarget, { side: 'down', align: 'right' })
          },
        }}
      />
      <div
        id={pop}
        popover="auto"
        role="dialog"
        aria-label={`Choose the ${label.toLowerCase()}`}
        className="w-[280px] flex-col gap-2 rounded border border-line bg-surface p-[10px] shadow-lg open:flex"
      >
        <span className="px-[2px] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
          Orbit Weekly pictures
        </span>
        <div className="grid grid-cols-4 gap-[6px]">
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-label={a.id}
              aria-pressed={a.id === value}
              onClick={(event) => {
                event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover()
                onChange(a.id)
              }}
              className={`overflow-hidden rounded-[6px] border ${a.id === value ? 'border-coral shadow-[0_0_0_2px_var(--color-coral-wash)]' : 'border-line hover:border-line-strong'} ${ring}`}
            >
              <img src={a.src} alt="" className="block aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
