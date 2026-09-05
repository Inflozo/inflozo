/* Editor Sidebar Kit.dc.html:274 — shortcut rows: the action, and its mono kbd chips. */

export function ShortcutRow({ action, keys, last = false }: { action: string; keys: string[]; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${last ? '' : 'border-b border-line'}`}
    >
      <span className="text-[12.5px] font-medium text-ink">{action}</span>
      <span className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-[5px] border border-line bg-surface px-[6px] py-px font-mono text-helper-caption text-ink-soft"
          >
            {k}
          </kbd>
        ))}
      </span>
    </div>
  )
}
