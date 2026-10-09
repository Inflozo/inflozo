'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useOptimistic, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  claimKey, conditionValues, GHOST_SETTING_GROUPS, GROUP_WORDS, POSTS_PER_PAGE, SETTING_WORDS, settingKey, USER_SETTING_CAP,
  type SettingGroup, type Visibility,
} from '@inflozo/section-runtime/custom-settings'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ConditionRow } from '@/components/kit/condition-row'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { BusyLabel, Submit, useSubmitting } from '@/components/kit/submit'
import { greyedProps, ReadOnly, reason, ring, type Greyed } from '@/components/kit/greyed'
import { Lock } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { CounterChip, HelperCaption } from '@/components/kit/labels'
import { MoonBadge } from '@/components/kit/moon-badge'
import { Select } from '@/components/kit/select'
import { StepperBox } from '@/components/kit/stepper'
import { Toggle } from '@/components/kit/toggle'
import { sitesPath } from '@/lib/connect-rule'
import { LOCK_COPY, TAB_SESSION_KEY } from '@/lib/lock'
import { conditionWord, settingsReadOnly, THEME_WORDS, type Promotable, type SiteBasics, type StoredSetting } from '@/lib/theme-settings'
import {
  clearProjectDarkOverrides, deleteSetting, promoteControl, setPostsPerPage, setProjectMode, updateSetting, type SettingsResult,
} from './actions'

/* D6a, AS FAR AS IT IS BUILT (`D6 Theme Settings Completed.dc.html`). Two columns at tablet and up, one below — what Ghost
   owns on the left, the promote builder on the right, as B17 and D6a draw them.

   THE LEFT COLUMN: POSTS PER PAGE (Story 7.9, `:54-66`) — the one value the theme owns outright, a `− n +` stepper whose
   every step is a real submit of a plain form and says "Saving…" while it posts (R-98), the `posts_per_page` chip and the
   caption verbatim; SITE BASICS (Story 7.9's Question 2, ruled option 1, `:69-100`) — the linked site's title, logo and
   accent, read and never written, each "from Ghost" with its way into Ghost Admin, or one caption and a link to Sites
   where no site is linked; then R-131's PROJECT-MODE BLOCK (`:102-121`), byte for byte as Story 5.6 built it.

   THE RIGHT COLUMN: CUSTOM SETTINGS (Story 7.9, `:139-235`) — the meter over the derived seventeen, D6a's two captions
   (its numbers derived, `SETTING_WORDS.limits`), the freeze notice, the project's settings as rows with Edit and Delete,
   and PROMOTE A CONTROL (Question 1, ruled option 1) for toggles and choice controls; D6a's closing note under it.

   STILL ABSENT, each a later story's (R-118: absent, not greyed): D6a's left rail (Story 7.12 gives the page a second
   surface), Credits and D6b's Free row (Story 7.28), and everything a promotion of a text prop, a picture or the accent
   brings — D6c's confirm, the lock pill, the pack-switch caption on a colour row, parking, the canvas preview (Story 7.10).
   Nothing here reaches a theme: Story 7.10 writes `config.custom` with the lines that read it.

   READING ALONG (R-192): while another session holds the project's lock, the whole page is the Kit's `ReadOnly` — every
   editing control disabled and dimmed as B5a dims the editor's panel, every value readable, and LOCK_COPY's one sentence
   says why. The holder is server truth (`liveHolder`); whether it is THIS tab is the tab's own `sessionStorage`, so the
   server's render assumes a live lock is someone else's and the tab corrects it before it can edit anything. */

const noSubscribe = () => () => {}
const tabSession = (): string | null => {
  try {
    return sessionStorage.getItem(TAB_SESSION_KEY)
  } catch {
    return null
  }
}

const HEADING = 'font-display text-[20px] font-bold tracking-[-0.015em] text-ink'
const LINK = `self-start rounded-sm text-[11.5px] font-medium text-sky-text hover:underline ${ring}`
const alert = (state: SettingsResult | null) =>
  state && 'error' in state ? <span role="alert"><HelperCaption>{state.error}</HelperCaption></span> : null

export function ThemeSettings({
  projectId,
  darkEnabled,
  overriddenSections,
  postsPerPage,
  basics,
  settings,
  controls,
  bound,
  holder,
}: {
  projectId: string
  darkEnabled: boolean
  /** how many sections of this project carry a dark override an emitter could use — derived, never stored */
  overriddenSections: number
  /** `projects.posts_per_page` (FR-Q1) */
  postsPerPage: number
  /** Site basics from the linked site, or null where the project links none */
  basics: SiteBasics | null
  /** the project's custom settings, in their order */
  settings: readonly StoredSetting[]
  /** what the Promote form offers */
  controls: readonly Promotable[]
  /** each row's "Layer · Control", by setting id */
  bound: Readonly<Record<string, string>>
  /** the session holding the project's lock while it is live, or null */
  holder: string | null
}) {
  const readOnly = useSyncExternalStore(noSubscribe, () => settingsReadOnly(holder, tabSession()), () => holder !== null)
  return (
    <>
      {readOnly ? <Banner kind="info">{LOCK_COPY.reading}</Banner> : null}
      <div data-readonly={readOnly ? '' : undefined} className={`flex flex-col gap-6 tablet:flex-row tablet:items-start ${readOnly ? 'opacity-[.55]' : ''}`}>
        <ReadOnly on={readOnly}>
          <div className="flex min-w-0 flex-1 flex-col gap-[15px]">
            <PostsPerPage projectId={projectId} value={postsPerPage} />
            <div aria-hidden className="h-px bg-line-faint" />
            <SiteBasicsGroup basics={basics} />
            <ModeBlock projectId={projectId} darkEnabled={darkEnabled} overriddenSections={overriddenSections} />
          </div>
          <div aria-hidden className="hidden w-px self-stretch bg-line-faint tablet:block" />
          <CustomSettings projectId={projectId} settings={settings} controls={controls} bound={bound} />
        </ReadOnly>
      </div>
    </>
  )
}

/* ───────────────────────────── Posts per page (FR-Q1, D6a :54-66) ───────────────────────────── */

/** Each step is the form's own submit; once the page's scripts run, a step shows its value at once and the saves queue
 *  behind it (`useOptimistic`). The − is spent at 1 and the + at 100, and a spent step submits nothing. */
function PostsPerPage({ projectId, value }: { projectId: string; value: number }) {
  const [state, dispatch, saving] = useActionState<SettingsResult | null, FormData>(setPostsPerPage, null)
  const [shown, setShown] = useOptimistic(value)
  const form = useRef<HTMLFormElement>(null)
  return (
    <form ref={form} action={dispatch} className="flex flex-col gap-2">
      <input type="hidden" name="project" value={projectId} />
      <h2 id="posts-per-page-label" className={HEADING}>{THEME_WORDS.postsPerPage}</h2>
      <div className="flex flex-wrap items-center gap-[11px]">
        <StepperBox
          id="posts-per-page"
          label={THEME_WORDS.postsPerPage}
          value={shown}
          min={POSTS_PER_PAGE.min}
          max={POSTS_PER_PAGE.max}
          name="posts_per_page"
          busy={saving}
          large
          onStep={(step) =>
            startTransition(() => {
              const next = shown + step
              setShown(next)
              const data = new FormData(form.current ?? undefined)
              data.set('posts_per_page', String(next))
              dispatch(data)
            })
          }
        />
        <CounterChip>posts_per_page</CounterChip>
        <span role="status" className="text-helper-caption text-ink-soft">{saving ? THEME_WORDS.saving : ''}</span>
      </div>
      <HelperCaption>{THEME_WORDS.postsCaption}</HelperCaption>
      {shown >= POSTS_PER_PAGE.max ? <HelperCaption>{THEME_WORDS.postsCeiling}</HelperCaption> : null}
      {alert(state)}
    </form>
  )
}

/* ───────────────────────────── Site basics (Question 2, D6a :69-100) ───────────────────────────── */

function SiteBasicsGroup({ basics }: { basics: SiteBasics | null }) {
  return (
    <section aria-labelledby="site-basics" className="flex flex-col gap-[15px]">
      <div className="flex flex-col gap-1">
        <h2 id="site-basics" className={HEADING}>{THEME_WORDS.siteBasics}</h2>
        <span className="text-[12.5px] leading-[1.5] text-ink-soft">{basics === null ? THEME_WORDS.noSite : THEME_WORDS.basicsLead}</span>
        {basics === null ? <Link href={sitesPath()} className={LINK}>{THEME_WORDS.sites}</Link> : null}
      </div>
      {basics === null ? null : (
        <>
          <Basic label={THEME_WORDS.siteTitle} admin={basics.admin}>
            <span className={`min-w-0 flex-1 truncate text-[13px] ${basics.title === null ? 'text-ink-soft' : 'text-ink-mid'}`}>{basics.title ?? THEME_WORDS.notSet}</span>
          </Basic>
          <Basic label={THEME_WORDS.logo} admin={basics.admin}>
            {basics.logo === null ? null : <img src={basics.logo} alt="" className="h-8 w-11 shrink-0 rounded-[5px] object-contain" />}
            <span className={`min-w-0 flex-1 truncate text-[12.5px] font-medium ${basics.logo === null ? 'text-ink-soft' : 'text-ink-mid'}`}>
              {basics.logo === null ? THEME_WORDS.notSet : (basics.logo.split('/').pop() ?? basics.logo)}
            </span>
          </Basic>
          <Basic label={THEME_WORDS.accent} admin={basics.admin} caption>
            {basics.accent === null ? null : <span aria-hidden className="size-[22px] shrink-0 rounded-[6px] shadow-hairline-inset" style={{ background: basics.accent }} />}
            <span className={`min-w-0 flex-1 text-[12.5px] ${basics.accent === null ? 'text-ink-soft' : 'font-mono text-ink'}`}>{basics.accent ?? THEME_WORDS.notSet}</span>
          </Basic>
        </>
      )}
    </section>
  )
}

/** One Ghost-owned value: its label, the value in D6a's locked field with "from Ghost", and the way into Ghost Admin. */
function Basic({ label, admin, caption = false, children }: { label: string; admin: string | null; caption?: boolean; children: ReactNode }) {
  const [feeds, variable, rest] = THEME_WORDS.accentCaption
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-control-label font-medium text-ink-soft">{label}</span>
      <div className="flex min-h-[38px] items-center gap-[9px] rounded-sm border border-line bg-line-soft px-[11px] py-[7px]">
        {children}
        <span className="shrink-0 font-mono text-[10.5px] text-ink-soft-aa">{THEME_WORDS.fromGhost}</span>
        <Lock size={12} className="shrink-0 text-ink-soft-aa" />
      </div>
      {caption ? (
        <span className="text-[11.5px] leading-[1.45] text-ink-soft">
          {feeds}<span className="font-mono text-[11px]">{variable}</span>{rest}
        </span>
      ) : null}
      {admin === null ? null : (
        <a href={admin} target="_blank" rel="noreferrer" className={LINK}>{THEME_WORDS.change}</a>
      )}
    </div>
  )
}

/* ───────────────────────────── Custom settings (FR-Q2, D6a :139-235) ───────────────────────────── */

function CustomSettings({ projectId, settings, controls, bound }: {
  projectId: string
  settings: readonly StoredSetting[]
  controls: readonly Promotable[]
  bound: Readonly<Record<string, string>>
}) {
  return (
    <section aria-labelledby="custom-settings" className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 id="custom-settings" className="flex-1 text-[14px] font-semibold text-ink">{THEME_WORDS.custom}</h2>
          <CounterChip>{SETTING_WORDS.meter(settings.length)}</CounterChip>
        </div>
        <span className="text-[12px] leading-[1.5] text-ink-soft">{THEME_WORDS.customLead}</span>
        <span className="text-[11.5px] leading-[1.5] text-ink-soft">{SETTING_WORDS.limits}</span>
      </div>
      <div className="flex gap-[9px] rounded-thumb border border-line bg-paper-raised p-[10px_12px]">
        <Lock size={13} className="mt-[2px] shrink-0 text-ink-soft-aa" />
        <span className="text-[11.5px] leading-[1.5] text-ink-mid">{THEME_WORDS.freeze}</span>
      </div>
      {settings.length === 0 ? (
        <p className="text-[12px] text-ink-soft">{THEME_WORDS.empty}</p>
      ) : (
        <ul className="flex list-none flex-col gap-[7px]">
          {settings.map((s) => (
            <SettingItem key={s.id} projectId={projectId} setting={s} settings={settings} bound={bound[s.id]} />
          ))}
        </ul>
      )}
      <PromoteForm projectId={projectId} settings={settings} controls={controls} />
      <Banner kind="info" live={false}>{THEME_WORDS.afterDeploy}</Banner>
    </section>
  )
}

/** One stored setting: D6a's row — the label, "Layer · Control → key", the type word — with its condition and its frozen
 *  date when it has them, then Edit (a `<details>`, the browser's own disclosure) and Delete. */
function SettingItem({ projectId, setting, settings, bound }: {
  projectId: string
  setting: StoredSetting
  settings: readonly StoredSetting[]
  bound: string | undefined
}) {
  const when = setting.visibility_condition
  const target = when === null ? undefined : settings.find((o) => o.key === when.key)
  return (
    <li data-setting={setting.key} className="flex flex-col gap-[7px] rounded-thumb border border-line bg-surface p-[10px_12px]">
      <div className="flex items-center gap-[11px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[12.5px] font-semibold text-ink">{setting.label}</span>
          <span className="text-[11px] text-ink-soft-aa">
            {bound === undefined ? '' : `${bound} `}→ <span className="font-mono text-[10.5px]">{setting.key}</span>
          </span>
        </div>
        <span className="shrink-0 rounded-pill border border-line px-[7px] py-[2px] text-[10px] font-semibold text-ink-soft-aa">{THEME_WORDS.typeWord(setting.type)}</span>
      </div>
      {when === null ? null : <HelperCaption>{THEME_WORDS.onlyWhen(target?.label ?? when.key, when.value)}</HelperCaption>}
      {setting.frozen_at === null ? null : <HelperCaption>{THEME_WORDS.frozenSince(setting.frozen_at)}</HelperCaption>}
      <div className="flex items-start gap-3">
        <EditForm projectId={projectId} setting={setting} others={settings.filter((o) => o.id !== setting.id)} />
        <DeleteForm projectId={projectId} setting={setting} />
      </div>
    </li>
  )
}

function EditForm({ projectId, setting, others }: { projectId: string; setting: StoredSetting; others: readonly StoredSetting[] }) {
  const [state, dispatch] = useActionState<SettingsResult | null, FormData>(updateSetting, null)
  const details = useRef<HTMLDetailsElement>(null)
  // controlled, so a refusal keeps what was typed (React resets a form after every action)
  const [label, setLabel] = useState(setting.label)
  const [group, setGroup] = useState<SettingGroup>(setting.group_name)
  const [byDefault, setByDefault] = useState(setting.default_value)
  const [when, setWhen] = useState<Visibility | null>(setting.visibility_condition)
  useEffect(() => {
    if (state && 'ok' in state && details.current) details.current.open = false
  }, [state])
  const id = `setting-${setting.id}`
  return (
    <details ref={details} className="min-w-0 flex-1">
      <summary className={`w-max cursor-pointer list-none rounded-sm text-[11.5px] font-medium text-sky-text hover:underline ${ring}`}>
        {THEME_WORDS.edit}
      </summary>
      <form action={dispatch} className="mt-[10px] flex flex-col gap-[10px]">
        <input type="hidden" name="project" value={projectId} />
        <input type="hidden" name="setting" value={setting.id} />
        <div className="flex gap-2">
          <TextInput id={`${id}-label`} label={THEME_WORDS.labelInGhost} name="label" value={label} onChange={(e) => setLabel(e.target.value)} required className="min-w-0 flex-1" />
          <KeyField id={`${id}-key`} value={setting.key} />
        </div>
        <GroupField id={`${id}-group`} group={group} onGroup={setGroup} />
        {setting.type === 'boolean' ? (
          <Toggle id={`${id}-default`} label={THEME_WORDS.defaultValue} checked={byDefault === 'true'} onToggle={(on) => setByDefault(on ? 'true' : 'false')} />
        ) : (
          <Select
            id={`${id}-default`}
            label={THEME_WORDS.defaultValue}
            value={byDefault ?? ''}
            options={(setting.options ?? []).map((o) => ({ value: o.label, label: o.label, active: o.label === byDefault }))}
            onSelect={setByDefault}
          />
        )}
        <input type="hidden" name="default" value={byDefault ?? ''} />
        <WhenField id={`${id}-when`} when={when} others={others} onWhen={setWhen} />
        <Submit busy={THEME_WORDS.saving} variant="primary" size={32} className="self-start">{THEME_WORDS.save}</Submit>
        {alert(state)}
      </form>
    </details>
  )
}

/** The key once the row exists: read-only, always — the update grant omits `key` (FR-Q2, "rename changes the label only"). */
function KeyField({ id, value }: { id: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">{THEME_WORDS.key}</span>
      <span id={id} className="flex h-9 items-center truncate rounded-sm border border-line bg-line-soft px-[11px] font-mono text-control-label text-ink-mid">
        {value}
      </span>
    </div>
  )
}

function GroupField({ id, group, onGroup }: { id: string; group: SettingGroup; onGroup: (g: SettingGroup) => void }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <Select
        id={id}
        label={THEME_WORDS.group}
        value={GROUP_WORDS[group]}
        options={GHOST_SETTING_GROUPS.map((g) => ({ value: g, label: GROUP_WORDS[g], active: g === group }))}
        onSelect={(g) => onGroup(g as SettingGroup)}
      />
      <input type="hidden" name="group" value={group} />
      <HelperCaption>{THEME_WORDS.groupCaption}</HelperCaption>
    </div>
  )
}

/** D6a's "Only show when": another setting of this project and one of its values — a choice's labels, a switch's On or
 *  Off — through the Kit's live `ConditionRow`; greyed with its reason where there is no other setting to name. */
function WhenField({ id, when, others, onWhen }: { id: string; when: Visibility | null; others: readonly StoredSetting[]; onWhen: (w: Visibility | null) => void }) {
  const named = others.filter((o) => conditionValues(o).length > 0 && o.key.length >= 2)
  const target = when === null ? undefined : named.find((o) => o.key === when.key)
  const values = target === undefined ? [] : conditionValues(target)
  const greyed: Greyed | undefined = named.length === 0 ? { reason: THEME_WORDS.whenNone } : undefined
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center gap-2">
        <span className="flex-1 text-control-label font-medium text-ink-soft">{THEME_WORDS.when}</span>
        <span className="text-[10px] text-ink-soft-aa">{THEME_WORDS.optional}</span>
      </div>
      <ConditionRow
        id={id}
        field={target?.label ?? 'Setting'}
        operator="is"
        // a condition whose setting has gone (deleted elsewhere) shows and posts nothing — `deleteSetting` clears it too
        values={target === undefined || when === null ? [] : [conditionWord(when.value)]}
        fields={named.map((o) => ({ value: o.key, label: o.label, active: o.key === when?.key }))}
        options={values.map((v, i) => ({ value: String(i), label: conditionWord(v), active: v === when?.value }))}
        onField={(key) => {
          const first = conditionValues(named.find((o) => o.key === key) ?? { type: 'text', options: null })[0]
          onWhen(first === undefined ? null : { key, value: first })
        }}
        onValue={(i) => {
          const v = values[Number(i)]
          if (target !== undefined && v !== undefined) onWhen({ key: target.key, value: v })
        }}
        onRemove={target === undefined ? undefined : () => onWhen(null)}
        greyed={greyed}
      />
      <input type="hidden" name="when_key" value={target === undefined ? '' : target.key} />
      <input type="hidden" name="when_value" value={target === undefined || when === null ? '' : String(when.value)} />
      <HelperCaption>{THEME_WORDS.whenCaption}</HelperCaption>
    </div>
  )
}

/** Delete asks first (R-134): the setting named, focus on Cancel, and — once its key is frozen — the warning that a later
 *  setting with the same key brings the site owner's stored value back (FR-Q2). The confirm is the scripted layer over a
 *  form that still posts without it. */
function DeleteForm({ projectId, setting }: { projectId: string; setting: StoredSetting }) {
  const [state, dispatch] = useActionState<SettingsResult | null, FormData>(deleteSetting, null)
  const form = useRef<HTMLFormElement>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const id = `delete-${setting.id}`
  return (
    <form ref={form} action={dispatch} className="flex shrink-0 flex-col items-end gap-1">
      <input type="hidden" name="project" value={projectId} />
      <input type="hidden" name="setting" value={setting.id} />
      <DeleteButton onAsk={() => openOnCancel(confirm.current)} />
      {alert(state)}
      <dialog ref={confirm} onClick={closeOnBackdrop} aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`} className={`${sheet} gap-[18px]`}>
        <div className="flex flex-col gap-[6px]">
          <h2 id={`${id}-title`} className={title}>{THEME_WORDS.deleteTitle(setting.label)}</h2>
          <p id={`${id}-body`} className="text-ui-dense leading-[1.55] text-ink-soft">{THEME_WORDS.deleteBody(setting)}</p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
            {THEME_WORDS.cancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            size={36}
            onClick={() => {
              confirm.current?.close()
              form.current?.requestSubmit()
            }}
          >
            {THEME_WORDS.deleteButton}
          </Button>
        </div>
      </dialog>
    </form>
  )
}

function DeleteButton({ onAsk }: { onAsk: () => void }) {
  const { pending } = useSubmitting()
  return (
    <button
      type="submit"
      aria-disabled={pending || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        // R-134: never straight to the action. The button stays a plain submit and the dialog submits the form itself
        event.preventDefault()
        if (!pending) onAsk()
      }}
      className={`rounded-sm text-[11.5px] font-medium text-danger-text hover:underline ${ring}`}
    >
      <BusyLabel pending={pending} busy={THEME_WORDS.deleting}>
        {THEME_WORDS.deleteButton}
      </BusyLabel>
    </button>
  )
}

/** PROMOTE A CONTROL (Question 1, ruled option 1; D6a :180-235): which control, its label in Ghost, the key — generated
 *  live from the label and editable until Promote — the group, an optional condition, and Promote. At the cap the button
 *  greys with the module's sentence (UX-DR3); with nothing left to offer, the control's select greys with its own. */
function PromoteForm({ projectId, settings, controls }: { projectId: string; settings: readonly StoredSetting[]; controls: readonly Promotable[] }) {
  const [state, dispatch] = useActionState<SettingsResult | null, FormData>(promoteControl, null)
  const [chosen, setChosen] = useState(0)
  const [label, setLabel] = useState('')
  const [typedKey, setTypedKey] = useState<string | null>(null)
  const [group, setGroup] = useState<SettingGroup>('site_wide')
  const [when, setWhen] = useState<Visibility | null>(null)
  useEffect(() => {
    if (!state || !('ok' in state)) return
    setChosen(0)
    setLabel('')
    setTypedKey(null)
    setGroup('site_wide')
    setWhen(null)
  }, [state])
  const control = controls[chosen] ?? controls[0]
  // the key follows the label until it is typed into, and again once it is emptied — what shows is what posts
  const key = typedKey ?? claimKey(new Set(settings.map((s) => s.key)), settingKey(label))
  const full = settings.length >= USER_SETTING_CAP
  const none: Greyed | undefined = controls.length === 0 ? { reason: THEME_WORDS.noControls } : undefined
  const stopped: Greyed | undefined = full ? { reason: SETTING_WORDS.cap } : none
  return (
    <form action={dispatch} className="flex flex-col gap-[10px] rounded-thumb border border-dashed border-line-strong bg-paper-raised p-3">
      <h3 className="text-[12.5px] font-semibold text-ink">{THEME_WORDS.promote}</h3>
      <input type="hidden" name="project" value={projectId} />
      <input type="hidden" name="instance" value={control?.instanceId ?? ''} />
      <input type="hidden" name="control" value={control?.controlKey ?? ''} />
      <Select
        id="promote-which"
        label={THEME_WORDS.which}
        value={control?.label ?? '—'}
        options={controls.map((c, i) => ({ value: String(i), label: c.label, active: c === control }))}
        onSelect={(i) => setChosen(Number(i))}
        greyed={none}
      />
      <div className="flex gap-2">
        <TextInput id="promote-label" label={THEME_WORDS.labelInGhost} name="label" value={label} onChange={(e) => setLabel(e.target.value)} required className="min-w-0 flex-1" />
        <TextInput id="promote-key" label={THEME_WORDS.key} name="key" value={key} onChange={(e) => setTypedKey(e.target.value === '' ? null : e.target.value)} mono className="min-w-0 flex-1" />
      </div>
      <GroupField id="promote-group" group={group} onGroup={setGroup} />
      <WhenField id="promote-when" when={when} others={settings} onWhen={setWhen} />
      <div className="flex items-center gap-[9px]">
        {stopped === undefined ? (
          <Submit busy={THEME_WORDS.promoting} variant="primary" size={32}>{THEME_WORDS.promoteButton}</Submit>
        ) : (
          <button
            type="button"
            className="inline-flex h-8 shrink-0 cursor-not-allowed items-center rounded-thumb border border-grey-border bg-grey-field px-[13px] text-control-label font-semibold text-ink-faint"
            {...greyedProps('promote-submit', stopped)}
            // with nothing to offer, the select above already says why — one sentence, not two
            aria-describedby={full ? 'promote-submit-reason' : 'promote-which-reason'}
          >
            {THEME_WORDS.promoteButton}
          </button>
        )}
        {control?.setting.type === 'select' && stopped === undefined ? (
          <span className="flex-1 text-[11px] leading-[1.45] text-ink-soft">{THEME_WORDS.named((control.setting.options ?? []).map((o) => o.label))}</span>
        ) : null}
      </div>
      {full ? reason('promote-submit', stopped) : null}
      {alert(state)}
    </form>
  )
}

/* ───────────────────────────── R-131's project-mode block (D6a :102-121), unchanged ─────────────────────────────

   Two rows, read off the frame: "This project" over a two-segment control — `Light only` | `Light + Dark` — with its
   caption verbatim; then the bordered row carrying the moon badge with its label "Dark override", the title "Clear
   dark overrides", a sub-caption counting the sections that hold one, and a secondary Clear. D6a's footnote about the
   badge closes it.

   THE ONE THING THAT GREYS, WITH ITS REASON, IS D6b'S CLEAR ROW (`:271-283`) — because there the overrides genuinely
   exist and are merely not in force. Its sentence is the frame's own, and so is the line under it: the overrides are
   kept, not discarded (FR-D7, AD-17). The Pro label D6a carries is not drawn: dark-mode authoring is a FREE capability
   (`EXPERIENCE.md:715`, `:859`), and D6a is labelled Pro for the Credits row (Story 7.28).

   THE COUNT IS DERIVED by walking the project's docs (`darkOverrideCount`), never stored — standing rule 4.

   IT ASKS FIRST (R-134, owner 2026-09-19, Review's Question 4), in the app's ONE dialog vocabulary and exactly as the
   per-section clear does: the count named, focus opening on Cancel (R-115, UX-DR14). It is the widest destructive act
   in the product — every section of every canvas, and saved data — and it was the only one that asked nothing. With
   nothing to clear it SAYS so rather than asking, which is R-12 and the shape the panel row beside it uses.
   The confirm is the JavaScript layer over a form that still posts without it; the action refuses a Light-only
   project on its own, so nothing here is the only thing standing between a press and the database.

   ponytail: the pill is two SUBMIT buttons rather than the Kit's `Segmented`, because a `Segmented` is a radio group
   of `type="button"` and this control has to post a form — so it says what it is doing while it saves (R-98) and
   stays a plain form's submit. (Story 7.9's Question 3, ruled option 1, owner, 2026-10-09, as Story 3.9's Question 5:
   the app needs JavaScript and its forms do not — this route streams behind its `loading.tsx`, so with scripts off it
   stays on its skeleton, and nothing here promises otherwise.) Switch it to `Segmented` the day that component learns
   to submit. */

const TRACK = 'flex w-max rounded-pill bg-paper-sunk p-[3px]'
const SEGMENT = 'flex min-w-[104px] items-center justify-center rounded-[20px] px-[14px] py-[6px] text-[12.5px]'

function ModeBlock({ projectId, darkEnabled, overriddenSections }: {
  projectId: string
  darkEnabled: boolean
  /** how many sections of this project carry a dark override an emitter could use — derived, never stored */
  overriddenSections: number
}) {
  const [mode, onMode] = useActionState<SettingsResult | null, FormData>(setProjectMode, null)
  const [cleared, onClear] = useActionState<SettingsResult | null, FormData>(clearProjectDarkOverrides, null)
  const clearForm = useRef<HTMLFormElement>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const [nothingToClear, setNothingToClear] = useState(false)
  const n = overriddenSections
  const carry = `${n === 0 ? 'No' : n} ${n === 1 ? 'section carries' : 'sections carry'} a dark override`

  return (
    <div className="flex max-w-[520px] flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm">
      <form action={onMode} className="flex flex-col gap-[6px]">
        <input type="hidden" name="project" value={projectId} />
        <span className="text-[12px] font-medium text-ink-soft">This project</span>
        <div className={TRACK} role="group" aria-label="This project">
          <ModeSegment on={!darkEnabled} value="off" label="Light only" busy="Saving…" />
          <ModeSegment on={darkEnabled} value="on" label="Light + Dark" busy="Saving…" />
        </div>
        <HelperCaption>Every Style Pack ships a hand-paired dark palette, so dark is already paid for.</HelperCaption>
        {mode && 'error' in mode ? <span role="alert"><HelperCaption>{mode.error}</HelperCaption></span> : null}
      </form>

      <form ref={clearForm} action={onClear} className="flex flex-col gap-[6px] border-t border-line pt-[14px]">
        <input type="hidden" name="project" value={projectId} />
        <div
          data-clear-row
          data-greyed={darkEnabled ? undefined : ''}
          className={`flex items-center gap-[10px] rounded-sm border p-[9px_11px] ${
            darkEnabled ? 'border-line bg-surface' : 'border-grey-border bg-grey-field'
          }`}
        >
          <MoonBadge />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className={`text-[12.5px] font-medium ${darkEnabled ? 'text-ink' : 'text-ink-faint'}`}>
              Clear dark overrides
            </span>
            <span className={`text-[11px] ${darkEnabled ? 'text-ink-soft' : 'text-ink-faint'}`}>{carry}</span>
          </div>
          <ClearButton
            greyed={!darkEnabled}
            onAsk={() => {
              if (n === 0) {
                setNothingToClear(false)
                return requestAnimationFrame(() => setNothingToClear(true))
              }
              openOnCancel(confirm.current)
            }}
          />
        </div>
        {/* D6b's own reason, verbatim: the row is greyed about what is IN FORCE, never about what is stored */}
        {darkEnabled ? null : (
          <>
            <HelperCaption>
              {n === 0
                ? 'This project is Light only, so nothing renders a dark override. Switch to Light + Dark to design one.'
                : `This project is Light only, so nothing renders the dark overrides ${n === 1 ? 'that section' : `those ${n} sections`} still ${n === 1 ? 'holds' : 'hold'}. Switch to Light + Dark to use or clear them.`}
            </HelperCaption>
            <HelperCaption>
              The overrides are kept, not discarded — greying the row is a statement about what is in force, never
              about what is stored.
            </HelperCaption>
          </>
        )}
        <div role="status">
          {nothingToClear ? <HelperCaption>Nothing to clear: no section of this project carries a dark override.</HelperCaption> : null}
        </div>
        {cleared && 'error' in cleared ? <span role="alert"><HelperCaption>{cleared.error}</HelperCaption></span> : null}
        <HelperCaption>
          The same badge marks an overridden control in the sidebar, and it always carries the label &ldquo;Dark
          override&rdquo;.
        </HelperCaption>

        <dialog
          ref={confirm}
          onClick={closeOnBackdrop}
          aria-labelledby="cleardark-project-title"
          aria-describedby="cleardark-project-body"
          className={`${sheet} gap-[18px]`}
        >
          <div className="flex flex-col gap-[6px]">
            <h2 id="cleardark-project-title" className={title}>
              Clear dark overrides?
            </h2>
            <p id="cleardark-project-body" className="text-ui-dense leading-[1.55] text-ink-soft">
              {n === 1 ? 'One section' : `All ${n} sections`} of this project {n === 1 ? 'has' : 'have'} its dark
              version following its light one again. Your words, pictures and light settings stay.
            </p>
          </div>
          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="coral"
              size={36}
              onClick={() => {
                confirm.current?.close()
                clearForm.current?.requestSubmit()
              }}
            >
              Clear overrides
            </Button>
          </div>
        </dialog>
      </form>
    </div>
  )
}

/** One half of D6a's pill, and a real submit control: pressed, it says what it is doing (R-98). */
function ModeSegment({ on, value, label, busy }: { on: boolean; value: 'on' | 'off'; label: string; busy: string }) {
  const { pending, guard } = useSubmitting()
  return (
    <button
      type="submit"
      name="dark"
      value={value}
      aria-pressed={on}
      // the segment already in force has nothing to save: no write, no revalidate, no busy label it could never show
      onClick={(event) => (on ? event.preventDefault() : guard(event))}
      className={`${SEGMENT} ${ring} ${on ? 'bg-surface font-semibold text-ink shadow-sm' : 'font-medium text-ink-soft'}`}
    >
      <BusyLabel pending={pending && !on} busy={busy}>
        {label}
      </BusyLabel>
    </button>
  )
}

/** D6a's secondary Clear. Greyed with D6b's reason while the project is Light only — `aria-disabled`, never
 *  `disabled`, so it keeps its tab stop and its sentence is read (`greyed.ts`). */
function ClearButton({ greyed, onAsk }: { greyed: boolean; onAsk: () => void }) {
  const { pending } = useSubmitting()
  return (
    <button
      type="submit"
      aria-disabled={greyed || pending || undefined}
      aria-busy={pending || undefined}
      onClick={(event) => {
        // R-134: never straight to the action. The button stays a plain submit and the dialog submits the form itself
        event.preventDefault()
        if (!greyed) onAsk()
      }}
      className={`h-7 shrink-0 rounded-[9px] border px-[11px] text-[12px] font-semibold ${ring} ${
        greyed ? 'border-grey-border bg-grey-field text-ink-faint' : 'border-line bg-surface text-ink hover:bg-paper-sunk'
      }`}
    >
      <BusyLabel pending={pending} busy="Clearing…">
        Clear
      </BusyLabel>
    </button>
  )
}
