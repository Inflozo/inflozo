'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useOptimistic, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react'
import {
  claimKey, conditionValues, ghostName, GHOST_SETTING_GROUPS, GROUP_WORDS, POSTS_PER_PAGE, SETTING_WORDS, settingKey,
  USER_SETTING_CAP, type SettingGroup, type Visibility,
} from '@inflozo/section-runtime/custom-settings'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ConditionRow } from '@/components/kit/condition-row'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { BusyLabel, Submit, useSubmitting } from '@/components/kit/submit'
import { greyedProps, ReadOnly, reason, ring, type Greyed } from '@/components/kit/greyed'
import { AlertTriangle, Lock, TypeGlyph } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { CounterChip, HelperCaption } from '@/components/kit/labels'
import { glyphOf, LayerThumb } from '@/components/kit/layers-row'
import { MoonBadge } from '@/components/kit/moon-badge'
import { Select } from '@/components/kit/select'
import { StepperBox } from '@/components/kit/stepper'
import { sitesPath } from '@/lib/connect-rule'
import { LOCK_COPY, TAB_SESSION_KEY } from '@/lib/lock'
import { isRich, type Mark, type PropValue } from '@inflozo/section-runtime'
import {
  choicesOf, conditionWord, droppedWords, fileName, settingsReadOnly, startOf, THEME_WORDS, type Promotable, type RowState, type SiteBasics,
  type StoredSetting,
} from '@/lib/theme-settings'
import {
  clearProjectDarkOverrides, deleteSetting, promoteControl, setPostsPerPage, setProjectMode, updateSetting, type SettingsResult,
} from './actions'

/* D6a, AS FAR AS IT IS BUILT (`D6 Theme Settings Completed.dc.html`). Two columns at tablet and up, one below — what Ghost
   owns on the left, the promote builder on the right, as B17 and D6a draw them.

   THE LEFT COLUMN: POSTS PER PAGE (Story 7.9, `:54-66`) — the one value the theme owns outright, a `− n +` stepper whose
   every step is a real submit of a plain form and says "Saving…" while it posts (R-98), the `posts_per_page` chip and the
   caption verbatim; SITE BASICS (Story 7.9's Question 2, ruled option 1, `:69-100`) — the linked site's title, logo and
   accent, read and never written, each row as D6a draws it (the logo's with its way into Ghost Admin), or one caption and a link to Sites
   where no site is linked; then R-131's PROJECT-MODE BLOCK (`:102-121`) as Story 5.6 built it, flat in the column (Question 4).

   THE RIGHT COLUMN: CUSTOM SETTINGS (Story 7.9, `:139-235`) — the meter over the derived seventeen, D6a's two captions
   (its numbers derived, `SETTING_WORDS.limits`), the freeze notice, the project's settings as rows with Edit and Delete,
   and PROMOTE A CONTROL (Question 1, ruled option 1) for toggles and choice controls; D6a's closing note under it.
   Since the owner's rulings of 2026-10-10: Which control lists its controls page by page, each with its section, its
   values and the one in force (Question 5), the form says what the site's owner will see in Ghost (Question 5, D6c's
   "What ships" extrapolated), and every setting is named ONCE, by its key, because that is all Ghost reads (Question 6).

   STORY 7.10 COMPLETES THE RIGHT COLUMN: Promote a control offers a section's texts, rich texts and pictures and the Style
   Pack's accent beside its switches and choices, and opens on the one the editor's ↗ named (`?promote=`); a rich text asks
   D6c's confirm first (`:291-317` — its line with and without its formatting) and the accent its caution, each a Kit sheet
   opening on Cancel with **Promote it** saying it is busy while it posts; each row prints the start the canvas holds and,
   where the compile would leave it out or refuse it, its state's sentence (the module's `bindingState`); the promoted
   accent carries D6a's colour caption (`:168-177`); Edit keeps Group and Only show when and no longer edits a Default
   (Question 1, ruled option 1: the canvas decides the start); and Site basics' accent says what Ghost's own colour is
   for, with its way into Ghost (Question 3, ruled option 1). `compileTheme` writes `config.custom` with the lines that read
   each key; nothing deploys before Story 7.18.

   STILL ABSENT, each a later story's (R-118: absent, not greyed): D6a's left rail (Story 7.12 gives the page a second
   surface), and Credits and D6b's Free row (Story 7.28).

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
  states,
  promote,
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
  /** Story 7.10 — each row's state and start, by setting id (`rowStates`) */
  states: Readonly<Record<string, RowState>>
  /** Story 7.10 — the `?promote=` id the editor's ↗ named; the form opens on it while it is offered */
  promote: string | null
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
          <CustomSettings projectId={projectId} settings={settings} controls={controls} bound={bound} states={states} promote={promote} />
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
          {/* D6a draws the three rows differently and they are built as drawn (Question 2, "the drawing as drawn"): the
              title locked with its own line under it, the logo locked with "from Ghost" and the way into Ghost Admin, the
              accent on a white field with its swatch and "from Ghost" — corrected at Story 7.9's Review */}
          <Basic label={THEME_WORDS.siteTitle} chip={false} below={<span className={CAPTION}>{THEME_WORDS.titleCaption}</span>}>
            <span className={`min-w-0 flex-1 truncate text-[13px] ${basics.title === null ? 'text-ink-soft' : 'text-ink-mid'}`}>{basics.title ?? THEME_WORDS.notSet}</span>
          </Basic>
          <Basic label={THEME_WORDS.logo} below={basics.admin === null ? null : <a href={basics.admin} target="_blank" rel="noreferrer" className={LINK}>{THEME_WORDS.change}</a>}>
            {basics.logo === null ? null : <img src={basics.logo} alt="" className="h-8 w-11 shrink-0 rounded-[5px] object-contain" />}
            <span className={`min-w-0 flex-1 truncate text-[12.5px] font-medium ${basics.logo === null ? 'text-ink-soft' : 'text-ink-mid'}`}>
              {basics.logo === null ? THEME_WORDS.notSet : fileName(basics.logo)}
            </span>
          </Basic>
          <Basic
            label={THEME_WORDS.accent}
            open
            below={
              <>
                <span className={CAPTION}>{THEME_WORDS.accentCaption}</span>
                {basics.admin === null ? null : <a href={basics.admin} target="_blank" rel="noreferrer" className={LINK}>{THEME_WORDS.change}</a>}
              </>
            }
          >
            {basics.accent === null ? null : <span aria-hidden className="size-[22px] shrink-0 rounded-[6px] shadow-hairline-inset" style={{ background: basics.accent }} />}
            <span className={`min-w-0 flex-1 text-[12.5px] ${basics.accent === null ? 'text-ink-soft' : 'font-mono text-ink'}`}>{basics.accent ?? THEME_WORDS.notSet}</span>
          </Basic>
        </>
      )}
    </section>
  )
}

const CAPTION = 'text-[11.5px] leading-[1.45] text-ink-soft'

/** One Ghost-owned value: its label, the value in D6a's field — locked and grey unless `open` (the accent's white one),
 *  with "from Ghost" unless `chip` is false (the title's) — and what D6a draws under it. */
function Basic({ label, chip = true, open = false, below, children }: { label: string; chip?: boolean; open?: boolean; below: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-control-label font-medium text-ink-soft">{label}</span>
      <div className={`flex min-h-[38px] items-center gap-[9px] rounded-sm border border-line px-[11px] py-[7px] ${open ? 'bg-surface' : 'bg-line-soft'}`}>
        {children}
        {chip ? <span className="shrink-0 font-mono text-[10.5px] text-ink-soft-aa">{THEME_WORDS.fromGhost}</span> : null}
        {open ? null : <Lock size={12} className="shrink-0 text-ink-soft-aa" />}
      </div>
      {below}
    </div>
  )
}

/* ───────────────────────────── Custom settings (FR-Q2, D6a :139-235) ───────────────────────────── */

function CustomSettings({ projectId, settings, controls, bound, states, promote }: {
  projectId: string
  settings: readonly StoredSetting[]
  controls: readonly Promotable[]
  bound: Readonly<Record<string, string>>
  states: Readonly<Record<string, RowState>>
  promote: string | null
}) {
  return (
    <section aria-labelledby="custom-settings" className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* where focus lands once a deleted row has gone (Story 7.9's Review), so it never falls to the page */}
          <h2 id="custom-settings" tabIndex={-1} className="flex-1 rounded-sm text-[14px] font-semibold text-ink outline-none">{THEME_WORDS.custom}</h2>
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
            <SettingItem key={s.id} projectId={projectId} setting={s} settings={settings} bound={bound[s.id]} state={states[s.id]} />
          ))}
        </ul>
      )}
      <PromoteForm projectId={projectId} settings={settings} controls={controls} promote={promote} />
      <Banner kind="info" live={false}>{THEME_WORDS.afterDeploy}</Banner>
    </section>
  )
}

/** One stored setting: D6a's row — the label, "Layer · Control → key", the type word — with its condition and its frozen
 *  date when it has them, then Edit (a `<details>`, the browser's own disclosure) and Delete. Story 7.10: the start the
 *  canvas holds for a switch, a choice and the accent; the state's sentence where the compile would leave the setting out
 *  or refuse it; and, on the promoted accent, D6a's colour caption (`:168-177`). */
function SettingItem({ projectId, setting, settings, bound, state }: {
  projectId: string
  setting: StoredSetting
  settings: readonly StoredSetting[]
  bound: string | undefined
  state: RowState | undefined
}) {
  const when = setting.visibility_condition
  const target = when === null ? undefined : settings.find((o) => o.key === when.key)
  return (
    <li data-setting={setting.key} className="flex flex-col gap-[7px] rounded-thumb border border-line bg-surface p-[10px_12px]">
      <div className="flex items-center gap-[11px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          {/* Question 6: Ghost prints the key's words, so the row does too — whatever an earlier label said */}
          <span className="text-[12.5px] font-semibold text-ink">{ghostName(setting.key)}</span>
          <span className="text-[11px] text-ink-soft-aa">
            {/* a control no longer placed and visible names nothing, so no arrow points from it */}
            {bound === undefined ? null : `${bound} → `}<span className="font-mono text-[10.5px]">{setting.key}</span>
          </span>
        </div>
        <span className="shrink-0 rounded-pill border border-line px-[7px] py-[2px] text-[10px] font-semibold text-ink-soft-aa">{THEME_WORDS.typeWord(setting.type)}</span>
      </div>
      {state?.start == null ? null : <HelperCaption>{THEME_WORDS.starts(state.start)}</HelperCaption>}
      {state?.note == null ? null : <span data-setting-state={state.state}><HelperCaption>{state.note}</HelperCaption></span>}
      {when === null ? null : <HelperCaption>{THEME_WORDS.onlyWhen(ghostName(target?.key ?? when.key), when.value)}</HelperCaption>}
      {setting.frozen_at === null ? null : <HelperCaption>{THEME_WORDS.frozenSince(setting.frozen_at)}</HelperCaption>}
      {(setting.bound_to as { kind?: unknown }).kind === 'token' ? (
        // D6a's colour row caption (`:176`): the marigold note, its triangle, the frame's words
        <span className="flex items-start gap-[7px] rounded-[8px] border border-marigold-line bg-marigold-tint-soft p-[7px_9px] text-[11px] leading-[1.5] text-marigold-text">
          <AlertTriangle size={12} strokeWidth={1.9} className="mt-[2px] shrink-0 text-marigold-solid" />
          {THEME_WORDS.accentRowCaption}
        </span>
      ) : null}
      <div className="flex items-start gap-3">
        <EditForm projectId={projectId} setting={setting} others={settings.filter((o) => o.id !== setting.id)} />
        <DeleteForm projectId={projectId} setting={setting} dependents={settings.filter((o) => o.visibility_condition?.key === setting.key).map((o) => ghostName(o.key))} />
      </div>
    </li>
  )
}

function EditForm({ projectId, setting, others }: { projectId: string; setting: StoredSetting; others: readonly StoredSetting[] }) {
  const [state, dispatch] = useActionState<SettingsResult | null, FormData>(updateSetting, null)
  const details = useRef<HTMLDetailsElement>(null)
  // controlled, so a refusal keeps what was chosen (React resets a form after every action)
  const [group, setGroup] = useState<SettingGroup>(setting.group_name)
  const [when, setWhen] = useState<Visibility | null>(setting.visibility_condition)
  useEffect(() => {
    if (!state || !('ok' in state) || !details.current) return
    details.current.open = false
    // the Save that had focus is hidden with the form: focus goes back to Edit, never to the page
    details.current.querySelector('summary')?.focus()
  }, [state])
  const id = `setting-${setting.id}`
  return (
    <details ref={details} className="min-w-0 flex-1">
      <summary
        // R-192: a disabled fieldset does not disable a <summary>, so a reading-along page refuses the disclosure itself
        onClick={(event) => {
          if (event.currentTarget.closest('fieldset:disabled')) event.preventDefault()
        }}
        className={`w-max cursor-pointer list-none rounded-sm text-[11.5px] font-medium text-sky-text hover:underline ${ring}`}
      >
        {THEME_WORDS.edit}
      </summary>
      <form action={dispatch} className="mt-[10px] flex flex-col gap-[10px]">
        <input type="hidden" name="project" value={projectId} />
        <input type="hidden" name="setting" value={setting.id} />
        {/* Question 6, ruled option 1: Ghost names a setting by its key and the key never changes, so neither does the name */}
        <div className="flex flex-col gap-[5px]">
          <div className="flex gap-2">
            <Fixed id={`${id}-label`} label={THEME_WORDS.labelInGhost} value={ghostName(setting.key)} />
            <Fixed id={`${id}-key`} label={THEME_WORDS.key} value={setting.key} mono />
          </div>
          <HelperCaption>{THEME_WORDS.nameFixed}</HelperCaption>
        </div>
        <GroupField id={`${id}-group`} group={group} onGroup={setGroup} />
        {/* Question 1, ruled option 1 (owner, 2026-10-10): the canvas decides where a setting starts, and the row prints
            it — so Edit has no Default of its own, and `updateSetting` writes none */}
        <WhenField id={`${id}-when`} when={when} others={others} onWhen={setWhen} />
        <Submit busy={THEME_WORDS.saving} variant="primary" size={32} className="self-start">{THEME_WORDS.save}</Submit>
        {alert(state)}
      </form>
    </details>
  )
}

/** A value the form shows and never posts, in D6a's locked field (the Key, `:197-202`): the key, always — the update grant
 *  omits it — and, since Question 6, the name Ghost makes of it, which is fixed with it. The Promote form's key too: it is
 *  the label's, worked out again by the action, so what shows is what is stored. */
function Fixed({ id, label, value, mono = false }: { id: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">{label}</span>
      <span id={id} className={`flex h-9 items-center truncate rounded-sm border border-line bg-line-soft px-[11px] text-control-label text-ink-mid ${mono ? 'font-mono' : ''}`}>
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
        field={target === undefined ? 'Setting' : ghostName(target.key)}
        operator="is"
        // a condition whose setting has gone (deleted elsewhere) shows and posts nothing — `deleteSetting` clears it too
        values={target === undefined || when === null ? [] : [conditionWord(when.value)]}
        fields={named.map((o) => ({ value: o.key, label: ghostName(o.key), active: o.key === when?.key }))}
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
function DeleteForm({ projectId, setting, dependents }: { projectId: string; setting: StoredSetting; dependents: readonly string[] }) {
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
          <h2 id={`${id}-title`} className={title}>{THEME_WORDS.deleteTitle(ghostName(setting.key))}</h2>
          <p id={`${id}-body`} className="text-ui-dense leading-[1.55] text-ink-soft">
            {THEME_WORDS.deleteBody(setting)}
            {dependents.length === 0 ? null : ` ${THEME_WORDS.deleteDependents(dependents)}`}
          </p>
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
              // the row goes with its form, so focus waits at the card's heading rather than falling to the page
              document.getElementById('custom-settings')?.focus()
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

/** PROMOTE A CONTROL (Question 1, ruled option 1; D6a :180-235): which control, its label in Ghost, the key it makes, the
 *  group, an optional condition, and Promote. At the cap the button greys with the module's sentence (UX-DR3); with
 *  nothing left to offer, the control's select greys with its own.
 *
 *  THE OWNER'S RULINGS OF 2026-10-10. Question 5 (option 3): Which control lists its controls page by page, each row the
 *  control, its section, every value and the one in force (`ControlRow`); the label starts as the control's own name and
 *  the group as the page's (Home → Homepage, Post → Post, else Site wide), each until the user changes it; and under the
 *  form, before Promote, one sentence says what the site's owner will see in Ghost and what it changes — D6c's "What
 *  ships" box, extrapolated (R-74). Question 6 (option 1): Ghost names a setting by its key alone (`ghostName`), so the
 *  key is the label's, shown read-only as D6a draws it (`:197-202`) and worked out again by the action, never posted. */
function PromoteForm({ projectId, settings, controls, promote }: { projectId: string; settings: readonly StoredSetting[]; controls: readonly Promotable[]; promote: string | null }) {
  const [state, dispatch] = useActionState<SettingsResult | null, FormData>(promoteControl, null)
  // by the control's own id, never its place: a revalidation that adds or drops a row must not move the choice. Story 7.10
  // (Story 7.9's Question 5, option 3): the editor's ↗ names one, and the form opens on it while it is offered — an id not
  // offered (promoted already, gone, another project's) opens on the first row, as before; it is compared, never parsed
  const [chosen, setChosen] = useState<string | null>(promote)
  const [typedLabel, setTypedLabel] = useState<string | null>(null)
  const [typedGroup, setTypedGroup] = useState<SettingGroup | null>(null)
  const [when, setWhen] = useState<Visibility | null>(null)
  const ask = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!state) return
    // the sheet closes on ANY answer: a refusal is drawn under the form, behind a modal sheet it was never seen (the review)
    ask.current?.close()
    if (!('ok' in state)) return
    setChosen(null)
    setTypedLabel(null)
    setTypedGroup(null)
    setWhen(null)
  }, [state])
  const control = controls.find((c) => c.id === chosen) ?? controls[0]
  // the label and the group follow the control until they are changed — what shows is what posts
  const label = typedLabel ?? control?.control ?? ''
  const group = typedGroup ?? control?.group ?? 'site_wide'
  const key = claimKey(new Set(settings.map((s) => s.key)), settingKey(label))
  const full = settings.length >= USER_SETTING_CAP
  const none: Greyed | undefined = controls.length === 0 ? { reason: THEME_WORDS.noControls } : undefined
  const stopped: Greyed | undefined = full ? { reason: SETTING_WORDS.cap } : none
  return (
    <form action={dispatch} className="flex flex-col gap-[10px] rounded-thumb border border-dashed border-line-strong bg-paper-raised p-3">
      <h3 className="text-[12.5px] font-semibold text-ink">{THEME_WORDS.promote}</h3>
      <input type="hidden" name="project" value={projectId} />
      <input type="hidden" name="promote" value={control?.id ?? ''} />
      <Select
        id="promote-which"
        label={THEME_WORDS.which}
        value={control?.label ?? '—'}
        options={controls.map((c) => ({
          value: c.id, label: c.label, active: c === control, group: c.page,
          icon: c.kind === 'token' ? <AccentDot colour={c.setting.default_value ?? ''} /> : <LayerThumb glyph={glyphOf(c.category)} />, contents: <ControlRow c={c} />,
        }))}
        onSelect={setChosen}
        menuWidth="w-[min(440px,calc(100vw-32px))]"
        greyed={none}
      />
      <div className="flex gap-2">
        <TextInput id="promote-label" label={THEME_WORDS.labelInGhost} name="label" value={label} onChange={(e) => setTypedLabel(e.target.value)} required className="min-w-0 flex-1" />
        <Fixed id="promote-key" label={THEME_WORDS.key} value={key} mono />
      </div>
      <GroupField id="promote-group" group={group} onGroup={setTypedGroup} />
      <WhenField id="promote-when" when={when} others={settings} onWhen={setWhen} />
      {control === undefined || stopped !== undefined ? null : (
        <div data-promote-summary className="flex flex-col gap-[6px] rounded-thumb border border-line bg-surface p-[11px_12px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft-aa">{THEME_WORDS.willGet}</span>
          <span className="text-[12.5px] leading-[1.5] text-ink-mid">{THEME_WORDS.gets(control, ghostName(key) || '…', group)}</span>
        </div>
      )}
      <div className="flex items-center gap-[9px]">
        {stopped === undefined ? (
          <Submit
            busy={THEME_WORDS.promoting}
            variant="primary"
            size={32}
            // a rich text and the accent ask first (D6c, the accent's caution): the button stays a plain submit, and the sheet
            // posts the form itself with the acknowledgement the action requires
            onClick={(event) => {
              if (control?.confirm == null) return
              event.preventDefault()
              openOnCancel(ask.current)
            }}
          >
            {THEME_WORDS.promoteButton}
          </Submit>
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
      {control?.confirm == null ? null : <PromoteAsk ask={ask} c={control} name={ghostName(key) || label} />}
    </form>
  )
}

/** The accent's row in Which control: the pack's own accent, where a section's row has its layer's picture. */
const AccentDot = ({ colour }: { colour: string }) => <span aria-hidden className="size-[14px] shrink-0 rounded-[4px] shadow-hairline-inset" style={{ background: colour }} />

/**
 * WHAT PROMOTE ASKS FIRST (Story 7.10), inside the form so **Promote it** is a real submit that says it is busy while it
 * posts (R-98): for a rich text, D6c (`D6 Theme Settings Completed.dc.html:291-317`) — the amber type chip, the title naming
 * the setting, the frame's sentence, WHAT SHIPS with the line as it is (a link as the frame's mono chip, bold, italic and
 * underline as they read) and as Ghost will hold it, the marks it drops, then "Demote it later…", Cancel and **Promote
 * it**; for the accent, the caution in the same sheet. Both open on Cancel (UX-DR14). The action refuses a post without
 * `confirmed`, so a hand-made POST cannot skip it.
 */
function PromoteAsk({ ask, c, name }: { ask: RefObject<HTMLDialogElement | null>; c: Promotable; name: string }) {
  const accent = c.confirm === 'accent'
  const dropped = accent ? null : droppedWords(c.value)
  return (
    <dialog ref={ask} onClick={closeOnBackdrop} aria-labelledby="promote-ask-title" aria-describedby="promote-ask-body" className={`${sheet} w-[520px] gap-4`}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-marigold-tint text-marigold-solid">
          {accent ? <AlertTriangle size={17} strokeWidth={1.8} /> : <TypeGlyph size={17} />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
          <h2 id="promote-ask-title" className={`${title} text-[19px] leading-[1.2]`}>{accent ? THEME_WORDS.accentTitle : THEME_WORDS.confirmTitle(name)}</h2>
          <p id="promote-ask-body" className="text-[13px] leading-[1.6] text-ink-mid">{accent ? THEME_WORDS.accentBody : THEME_WORDS.confirmBody}</p>
        </div>
      </div>
      {accent ? null : (
        <div data-what-ships className="flex flex-col gap-[6px] rounded-thumb border border-line bg-paper-raised p-[11px_12px]">
          <span className="font-mono text-[10px] tracking-[0.06em] text-ink-soft-aa">{THEME_WORDS.whatShips}</span>
          <span data-ships="before" className="text-[12.5px] leading-[1.5] text-ink-mid"><Formatted value={c.value} /></span>
          <div aria-hidden className="h-px bg-line-faint" />
          <span data-ships="after" className="text-[12.5px] leading-[1.5] text-ink-mid">{isRich(c.value) ? c.value.text : String(c.value ?? '')}</span>
          {dropped === null ? null : <span className="text-[11px] leading-[1.45] text-ink-soft">{dropped}</span>}
        </div>
      )}
      <div className="flex items-center gap-[10px]">
        <span className="flex-1 text-[11.5px] leading-[1.45] text-ink-soft">{accent ? null : THEME_WORDS.formattingBack}</span>
        <Button type="button" variant="secondary" size={36} data-cancel onClick={() => ask.current?.close()}>
          {THEME_WORDS.cancel}
        </Button>
        <Submit busy={THEME_WORDS.promoting} variant="marigold" size={36} name="confirmed" value="yes">
          {THEME_WORDS.promoteIt}
        </Submit>
      </div>
    </dialog>
  )
}

/** A rich text's line as it reads with its marks — D6c's "before": a link as the frame's mono chip, the rest as they look.
 *  Words only, never markup (AD-4): each run is a text node. */
function Formatted({ value }: { value: PropValue }) {
  if (!isRich(value)) return <>{String(value ?? '')}</>
  const marks = (value.marks ?? []) as readonly Mark[]
  const cuts = [...new Set([0, value.text.length, ...marks.flatMap((m) => [m.start, m.end])])].filter((n) => n >= 0 && n <= value.text.length).sort((a, b) => a - b)
  return (
    <>
      {cuts.slice(0, -1).map((from, n) => {
        const to = cuts[n + 1] as number
        const on = new Set(marks.filter((m) => m.start <= from && m.end >= to).map((m) => m.mark))
        const words = value.text.slice(from, to)
        const style = `${on.has('strong') ? 'font-semibold' : ''} ${on.has('em') ? 'italic' : ''} ${on.has('u') ? 'underline' : ''}`
        return on.has('a')
          ? <span key={from} className={`rounded-[5px] border border-line bg-line-soft px-[5px] py-px font-mono text-[11.5px] ${style}`}>{words}</span>
          : <span key={from} className={style}>{words}</span>
      })}
    </>
  )
}

/** One row of Which control (Question 5): the control's own name with its section beside it, then every value the site's
 *  owner could pick and the one in force now. `data-promotable` carries the row's D6a name, which the deployed walk reads
 *  and chooses it by. */
function ControlRow({ c }: { c: Promotable }) {
  const choices = choicesOf(c.setting)
  const start = startOf(c.setting)
  return (
    <span data-promotable={c.label} className="flex min-w-0 flex-1 flex-col gap-[2px]">
      <span className="flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate">{c.control}</span>
        <span className="max-w-[50%] shrink-0 truncate text-[11px] font-normal text-ink-soft-aa">{c.section}</span>
      </span>
      <span className="truncate text-[11px] font-normal text-ink-soft">
        {/* Story 7.10: a text, a picture and the accent have no values to list — the kind's word, and its start where it has one */}
        {choices.length > 0 ? `${choices.join(' · ')} — ` : `${THEME_WORDS.typeWord(c.setting.type)}${start === '' ? '' : ' — '}`}
        {start === '' ? '' : THEME_WORDS.now(start)}
      </span>
    </span>
  )
}

/* ───────────────────────────── R-131's project-mode block (D6a :102-121) ─────────────────────────────

   Two rows, read off the frame: "This project" over a two-segment control — `Light only` | `Light + Dark` — with its
   caption verbatim; then the bordered row carrying the moon badge with its label "Dark override", the title "Clear
   dark overrides", a sub-caption counting the sections that hold one, and a secondary Clear. D6a's footnote about the
   badge closes it.

   FLAT IN THE COLUMN, AS D6a DRAWS IT (Story 7.9's Question 4, ruled option 1, owner, 2026-10-10): a rule above it and
   nothing around it. R-131 built it as D6b's detail draws it — a white card with a shadow — when it was the only thing on
   the page; beside Posts per page and Site basics the card read as a second surface, so it took D6a's shape.

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
    <div data-mode-block className="flex flex-col gap-[9px] border-t border-line-faint pt-[14px]">
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

      <form ref={clearForm} action={onClear} className="flex flex-col gap-[6px]">
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
