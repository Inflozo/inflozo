/* B Missing Surfaces, B6 · "PERSISTENCE, FIVE STATES" — one indicator, one dot that changes
   colour, NEVER A SPINNER. The frame draws five labels and the type below is exactly those
   five, so any other label is a compile error. The expanded panel appears only on Retrying
   and belongs to the editor story, not to the kit. */

export type PersistenceState =
  | 'Saved on this device'
  | 'Syncing'
  | 'Synced'
  | 'Retrying'
  | 'Syncing every change to the cloud'

const dot: Record<PersistenceState, string> = {
  'Saved on this device': 'bg-line-strong',
  Syncing: 'bg-coral',
  Synced: 'bg-mint',
  Retrying: 'bg-danger',
  'Syncing every change to the cloud': 'bg-line-strong',
}

const strong: Record<PersistenceState, boolean> = {
  'Saved on this device': false,
  Syncing: true,
  Synced: false,
  Retrying: true,
  'Syncing every change to the cloud': false,
}

export function PersistenceIndicator({
  state,
  seconds,
}: {
  state: PersistenceState
  /** Retrying counts down to the next attempt, so waiting feels finite. */
  seconds?: number
}) {
  const label = state === 'Retrying' && seconds !== undefined ? `Retrying · ${seconds}s` : state
  return (
    <span role="status" className="inline-flex items-center gap-[6px]">
      <span aria-hidden className={`size-[6px] shrink-0 rounded-full ${dot[state]}`} />
      <span className={`text-[12.5px] ${strong[state] ? 'font-medium text-ink' : 'text-ink-soft'}`}>
        {label}
      </span>
    </span>
  )
}
