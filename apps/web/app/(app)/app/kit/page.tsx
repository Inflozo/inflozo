import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { group, shortName, theme, type Token } from '@/tokens'
import { Accordion } from '@/components/kit/accordion'
import { FreeBadge, LiveBadge, ProBadge, ResultChip, StatusChip, TagChip, VersionChip } from '@/components/kit/badge'
import { Banner, BannerLink } from '@/components/kit/banner'
import { AddButton, Button, IconButton, SplitButton } from '@/components/kit/button'
import { CanvasPill, CanvasPillButton } from '@/components/kit/canvas-pill'
import { ConditionRow } from '@/components/kit/condition-row'
import { DesignPicker } from '@/components/kit/design-picker'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { DragGrip } from '@/components/kit/grip'
import { Bolt, Link, LinkOff, Redo, Undo } from '@/components/kit/icons'
import { AssetRow, DropZone } from '@/components/kit/image-control'
import { Multiline, SearchInput, TextInput } from '@/components/kit/input'
import { ControlLabel, HelperCaption, PanelLabel, SectionHeader } from '@/components/kit/labels'
import { LayersRow, SiteWideGroup } from '@/components/kit/layers-row'
import { Progress, Skeleton } from '@/components/kit/loading'
import { MoonBadge } from '@/components/kit/moon-badge'
import { NewPackCell, PackCell, VariantThumb } from '@/components/kit/pack-cell'
import { PersistenceIndicator } from '@/components/kit/persistence-indicator'
import { QuickControlsCard } from '@/components/kit/quick-controls-card'
import { InlineRadio, RadioCards } from '@/components/kit/radio-card'
import { Segmented } from '@/components/kit/segmented'
import { FontRow, Menu, Select, SelectThumb } from '@/components/kit/select'
import { ShortcutRow } from '@/components/kit/shortcut-row'
import { Stepper } from '@/components/kit/stepper'
import { SwatchRow } from '@/components/kit/swatch-row'
import { Toast } from '@/components/kit/toast'
import { Toggle } from '@/components/kit/toggle'
import { Tooltip } from '@/components/kit/tooltip'
import { Visibility } from '@/components/kit/visibility'

/* ────────────────────────────────────────────────────────────────── the review surface

   The gallery is how "matches the frame" is CHECKED BY LOOKING: open it beside
   `Editor Sidebar Kit.dc.html`, both at 280px, and the groups are the same groups in the
   same order with the same states. It is internal — noindex — and it has no behaviour:
   every state the frame draws is its own instance, which is why nothing here holds state
   and nothing here is a client component. */

export const metadata: Metadata = {
  title: 'Component kit — Inflozo',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }
export const dynamic = 'force-static'

/** The Kit's own column: 280px, the narrow end of the 280–320px Controls sidebar. */
function Group({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <section aria-label={name} className="flex w-[280px] flex-col gap-3 rounded border border-line bg-paper p-5 shadow-sm">
      <h3 className="font-mono text-helper-caption font-normal text-ink-soft">{name}</h3>
      {note ? <p className="font-mono text-[10px] leading-[1.5] text-ink-soft">{note}</p> : null}
      {children}
    </section>
  )
}

function TokenSheet({ tokens }: { tokens: Token[] }) {
  const colors = group(tokens, '--color')
  const radii = group(tokens, '--radius')
  const shadows = group(tokens, '--shadow')
  const text = group(tokens, '--text')
  const breakpoints = group(tokens, '--breakpoint')
  const durations = group(tokens, '--duration')

  return (
    <section aria-labelledby="tokens" className="flex flex-col gap-6">
      <div className="flex flex-col gap-[6px]">
        <h2 id="tokens" className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">
          The token layer
        </h2>
        <p className="max-w-[820px] font-mono text-control-label text-ink-soft">
          read out of <code>app/globals.css</code> at build · every value below occurs verbatim in the
          Claude Design export, and <code>tokens.test.ts</code> is the grep that keeps it true
        </p>
      </div>

      <div className="flex flex-wrap gap-[9px]">
        {colors.map(({ name, value }) => (
          <div key={name} className="flex w-[152px] items-center gap-[9px]">
            <span
              aria-hidden
              style={{ background: value }}
              className="size-6 shrink-0 rounded-full shadow-hairline-inset"
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[11.5px] font-medium text-ink">{shortName(name, '--color')}</span>
              <span className="truncate font-mono text-[10px] text-ink-soft">{value}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {radii.map(({ name, value }) => (
          <div key={name} className="flex flex-col items-center gap-[6px]">
            <span aria-hidden style={{ borderRadius: value }} className="size-14 border border-line bg-surface" />
            <span className="text-[11.5px] font-medium text-ink">{shortName(name, '--radius')}</span>
            <span className="font-mono text-[10px] text-ink-soft">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        {shadows.map(({ name, value }) => (
          <div key={name} className="flex flex-col items-center gap-[6px]">
            <span aria-hidden style={{ boxShadow: value }} className="h-[34px] w-[72px] rounded-sm border border-line bg-surface" />
            <span className="text-[11.5px] font-medium text-ink">{shortName(name, '--shadow')}</span>
            <span className="font-mono text-[10px] text-ink-soft">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-display text-[44px] font-extrabold tracking-[-0.03em] text-ink">
          Bricolage Grotesque — display
        </span>
        <span className="font-ui text-body text-ink">Inter — the interface face, 400 / 500 / 600</span>
        <span className="font-mono text-ui-dense text-ink-soft">JetBrains Mono — values, keys and counters</span>
        {text.map(({ name, value }) => (
          <span key={name} style={{ fontSize: value }} className="text-ink">
            {shortName(name, '--text')} — {value}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-[10px]">
        {breakpoints.map(({ name, value }) => (
          <span key={name} className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-[14px] py-[7px] text-ui-dense font-medium text-ink">
            {shortName(name, '--breakpoint')} <span className="font-mono text-ink-soft">{value}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-[14px] py-[7px] text-ui-dense font-medium text-ink">
          app-floor <span className="font-mono text-ink-soft">pointer: coarse</span>
        </span>
        {durations.map(({ name, value }) => (
          <span key={name} className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-[14px] py-[7px] text-ui-dense font-medium text-ink">
            {shortName(name, '--duration')} <span className="font-mono text-ink-soft">{value}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default function KitGallery() {
  const tokens = theme()

  return (
    <main className="flex flex-col gap-7 bg-paper p-12">
      <header className="flex max-w-[820px] flex-col gap-[6px]">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.02em] text-ink">
          Editor sidebar kit
        </h1>
        <p className="font-mono text-control-label text-ink-soft">
          every control type allowed in the 280–320px Controls sidebar · named values first · colour
          comes from the Style Pack, never a picker here · one coral action per surface
        </p>
      </header>

      <TokenSheet tokens={tokens} />

      <div className="flex flex-wrap items-start gap-6">
        {/* labels & text */}
        <Group name="labels &amp; text">
          <PanelLabel>Panel label — 13 / 600 / 0.04em</PanelLabel>
          <ControlLabel>Control label — 12 / 500</ControlLabel>
          <HelperCaption>
            Helper caption — 11px, one line of guidance under a control. Never jargon.
          </HelperCaption>
          <SectionHeader name="Hero" counter="4 / 18" />
          <HelperCaption>↑ selected-section header with variant counter chip (mono)</HelperCaption>
        </Group>

        {/* accordion headers */}
        <Group name="accordion headers">
          <Accordion id="acc-content" title="Content" open>
            <HelperCaption>open — body renders below</HelperCaption>
          </Accordion>
          <Accordion id="acc-data" title="Data">
            <HelperCaption>never seen — this one is closed</HelperCaption>
          </Accordion>
          <HelperCaption>closed</HelperCaption>
        </Group>

        {/* inputs */}
        <Group name="inputs — radius 8 · coral caret · focus ring 2px solid coral-text">
          <TextInput id="in-rest" label="Text · rest" defaultValue="The slow return of the personal homepage" />
          <Multiline id="in-multi" label="Multiline" defaultValue="Why writers are leaving the feed — and coming home." />
          <SearchInput id="in-search" label="Search · with key hint" placeholder="Find a section…" hint="⌘K" />
          <TextInput id="in-mono" label="Mono value (keys, URLs)" defaultValue="https://orbitweekly.com" mono />
          <TextInput
            id="in-greyed"
            label="Overlay tint"
            defaultValue="Soft dark"
            greyed={{ reason: 'Not available while the media uses the accent colour.' }}
          />
        </Group>

        {/* segmented */}
        <Group name="segmented — pill on paper · active = surface + sm shadow">
          <Segmented id="seg-two" label="Two options" options={['Left', 'Right']} active="Left" />
          <Segmented
            id="seg-three"
            label="Three options — named values, never numbers"
            options={['Compact', 'Comfortable', 'Spacious']}
            active="Comfortable"
          />
          <Segmented
            id="seg-moon"
            label="With moon badge — carries a dark-mode override"
            options={['None', 'Soft', 'Strong']}
            active="Soft"
            moon
          />
          <Segmented
            id="seg-greyed"
            label="Arrows"
            options={['Show', 'Hide']}
            active="Show"
            greyed={{ reason: 'Nothing to scroll at this count — the row already fits.' }}
          />
          <Segmented
            id="seg-r69"
            label="Order"
            options={['Newest', 'Oldest', 'Custom']}
            active="Newest"
            greyed={{ reason: 'The list you picked is the order.', value: null }}
          />
        </Group>

        {/* design picker */}
        <Group name="design picker — 64×44 wireframe diagrams · coral active ring" note="quick controls show 3 favorites; the Design accordion shows all">
          <DesignPicker id="picker" active={0} count={7} total={18} />
        </Group>

        {/* swatch row */}
        <Group name="swatch row — 7 colour roles · 24px circles · active = coral ring">
          <SwatchRow
            id="swatches"
            swatches={[
              { role: 'Background', color: 'var(--color-paper-raised)' },
              { role: 'Surface', color: 'var(--color-surface)' },
              { role: 'Text', color: 'var(--color-ink-deep)' },
              { role: 'Muted', color: 'var(--color-ink-soft-aa)' },
              { role: 'Border', color: 'var(--color-line)' },
              { role: 'Accent', color: 'var(--color-coral-deep)' },
              { role: 'Contrast', color: 'var(--color-surface)' },
            ]}
            active="Accent"
          />
          <SwatchRow
            id="swatches-greyed"
            label="Background"
            swatches={[
              { role: 'Paper', color: 'var(--color-paper-raised)' },
              { role: 'Sunk', color: 'var(--color-paper-sunk)' },
              { role: 'Tint', color: 'var(--color-coral-tint)' },
              { role: 'Strong', color: 'var(--color-coral-tint-strong)' },
            ]}
            greyed={{ reason: 'This design is always on a contrast background.' }}
          />
        </Group>

        {/* stepper · toggle · micro-controls */}
        <Group name="stepper · toggle · micro-controls">
          <Stepper id="step-count" label="Count — tabular numerals" value={12} />
          <Toggle id="tog-on" label="Toggle · on — 36×20, coral" checked />
          <Toggle id="tog-off" label="Toggle · off" />
          <Toggle
            id="tog-greyed"
            label="Dark mode switch"
            greyed={{ reason: 'Off while the header sits over the hero image.' }}
          />
          <Stepper
            id="step-greyed"
            label="Columns"
            value={3}
            greyed={{ reason: 'Fixed at 3 while the lead item is full width.' }}
          />
          <div className="flex items-center justify-between">
            <ControlLabel>Visibility eye · shown / hidden</ControlLabel>
            <span className="flex gap-[10px]">
              <Visibility shown name="Hero" />
              <Visibility shown={false} name="Footer" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <ControlLabel>Drag grip — 6 dots</ControlLabel>
            <DragGrip label="Reorder" />
          </div>
        </Group>

        {/* select rows & menus */}
        <Group name="select rows &amp; menus">
          <Select id="sel-closed" label="Select · closed (with mini thumb)" value="Post Grid" thumb={<SelectThumb />} />
          <FontRow id="sel-font" label="Title font" family="Georgia, serif" />
          <ControlLabel>Dropdown menu — check on active</ControlLabel>
          <Menu
            label="Template"
            items={[{ label: 'Home', active: true }, { label: 'Post' }, { label: 'Delete', danger: true }]}
          />
        </Group>

        {/* radio cards */}
        <Group name="radio cards — selected gets coral border + tint wash">
          <RadioCards
            id="radio"
            label="Option"
            active="selected"
            options={[
              { value: 'selected', title: 'Selected option', consequence: 'One line of consequence, plainly said.' },
              { value: 'unselected', title: 'Unselected option', consequence: 'Hover firms up the hairline.' },
            ]}
          />
          <HelperCaption>inline radios (in lists): 13px circle, coral dot when picked</HelperCaption>
          <div className="flex items-center gap-4">
            <InlineRadio label="Picked" picked />
            <InlineRadio label="Not picked" picked={false} />
          </div>
        </Group>

        {/* buttons */}
        <Group name="buttons — sizes 44/36/32 · coral = THE action of the surface">
          <div className="flex flex-wrap items-center gap-[10px]">
            <Button variant="coral">
              <Bolt size={13} />
              Ship it
            </Button>
            <SplitButton menuLabel="Deploy options">Split</SplitButton>
          </div>
          <div className="flex flex-wrap items-center gap-[10px]">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-[10px]">
            <Button variant="coral-outline" size={32}>Coral outline</Button>
            <Button variant="danger" size={32}>Danger</Button>
            <Button variant="danger-outline" size={32}>Danger outline</Button>
          </div>
          <AddButton>+ Add section — dashed affordance</AddButton>
          <div className="flex items-center gap-[6px]">
            <IconButton label="Undo">
              <Undo />
            </IconButton>
            <IconButton label="Redo" disabled>
              <Redo />
            </IconButton>
            <HelperCaption>icon buttons 28px — enabled / disabled at 35%</HelperCaption>
          </div>
        </Group>

        {/* badges & chips */}
        <Group name="badges &amp; chips — marigold only for Pro/celebration">
          <div className="flex flex-wrap items-center gap-2">
            <ProBadge />
            <FreeBadge />
            <LiveBadge version="v4" />
            <VersionChip>v5</VersionChip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ResultChip tone="clean">0 errors · 0 warnings</ResultChip>
            <ResultChip tone="warned">0 · 2</ResultChip>
            <ResultChip tone="failed">1 error</ResultChip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="recommended">Recommended</StatusChip>
            <StatusChip tone="planned">Planned</StatusChip>
            <StatusChip tone="shipped">Shipped</StatusChip>
            <TagChip>tag:tutorials</TagChip>
          </div>
          <div className="flex items-center gap-2">
            <MoonBadge />
            <HelperCaption>moon badge — 12px, marks any control carrying a dark-mode override</HelperCaption>
          </div>
        </Group>

        {/* tooltips */}
        <Group name="tooltips — ink fill · 12px white · 6px radius" note="keyboard-key variant carries a mono kbd chip">
          <div className="flex flex-wrap gap-3">
            <Tooltip>Duplicate section</Tooltip>
            <Tooltip keys="]">Next design</Tooltip>
          </div>
        </Group>

        {/* composite: quick controls */}
        <Group name="composite — quick controls card (3–5 most-used, surface card)">
          <QuickControlsCard>
            <DesignPicker id="quick-picker" active={0} count={7} total={18} />
            <Segmented
              id="quick-density"
              label="Density"
              options={['Compact', 'Comfortable', 'Spacious']}
              active="Comfortable"
            />
          </QuickControlsCard>
        </Group>

        {/* composite: variant + pack cards */}
        <Group
          name="composite — variant thumb · pack cards"
          note="pack cell: glyph in the pack's heading font · palette dots · pencil to edit · active = coral ring"
        >
          <VariantThumb name="Editorial Stack" line="Same words, new look" pro />
          <div className="grid grid-cols-3 gap-[6px]">
            <PackCell
              name="Paper"
              glyphFamily="Georgia, serif"
              palette={['var(--color-paper-raised)', 'var(--color-coral-deep)', 'var(--color-ink-deep)']}
              active
            />
            <PackCell
              name="Tangerine"
              glyphFamily="var(--font-display)"
              palette={['var(--color-paper-raised)', 'var(--color-coral)', 'var(--color-ink)']}
            />
            <NewPackCell />
          </div>
        </Group>

        {/* layers rows */}
        <Group name="layers rows — grip · mini-thumb · name · eye (rest / hover / selected)">
          <LayersRow name="Rest" />
          <LayersRow name="Hover — wash" className="bg-coral-wash" />
          <LayersRow name="Selected — coral tint" selected />
          <LayersRow name="Hidden" shown={false} />
          <SiteWideGroup pages={9}>
            <LayersRow name="Header" />
          </SiteWideGroup>
        </Group>

        {/* condition row */}
        <Group name="condition row — field · operator · value (+ chips for lists)">
          {/* The frame draws this row in a 352px panel; at the sidebar's 280px floor it
              scrolls inside its own box rather than clip or reflow. */}
          <div className="overflow-x-auto">
            <div className="w-[296px]">
              <ConditionRow id="cond" field="Tag" operator="is any of" values={['Travel']} />
            </div>
          </div>
        </Group>

        {/* feedback banners */}
        <Group name="feedback banners — one icon, one plain sentence">
          <Banner kind="info">
            Info — sky tint. <BannerLink href="/kit">Links get sky, not coral.</BannerLink>
          </Banner>
          <Banner kind="success">Success — mint. &ldquo;Live! Your site just got gorgeous.&rdquo;</Banner>
          <Banner kind="notice">Notice — marigold. Warnings never block a deploy.</Banner>
          <Banner kind="error">Error — danger, serious voice. No puns here.</Banner>
        </Group>

        {/* toast */}
        <Group name="toast — bottom-center pill · icon + message + action">
          <Toast action="View">
            Optimized: <span className="font-mono text-control-label">4.2 MB → 380 KB</span>
          </Toast>
        </Group>

        {/* loading */}
        <Group name="loading — skeletons, not spinners · progress bars coral">
          <Skeleton />
          <Progress label="Uploading" count="1.1 of 2.4 MB" percent={46} />
        </Group>

        {/* image control */}
        <Group name="image control — asset row + drop zone">
          <AssetRow name="hero-shot.jpg" meta="380 KB · WebP" />
          <DropZone formats="JPG, PNG, SVG or WebP" />
        </Group>

        {/* panel empty state */}
        <Group name="panel empty state — nothing selected">
          <EmptyPanel
            title="Nothing selected"
            instruction="Click any section on the canvas — its controls appear here."
          />
        </Group>

        {/* shortcut rows */}
        <Group name="shortcut rows — action + mono kbd chips">
          <div className="flex flex-col">
            <ShortcutRow action="Shuffle design" keys={['[', ']']} />
            <ShortcutRow action="Duplicate section" keys={['⌘D']} />
            <ShortcutRow action="Ship it" keys={['⌘⏎']} last />
          </div>
        </Group>

        {/* persistence indicator */}
        <Group name="persistence — one dot, one word, never a spinner">
          <PersistenceIndicator state="Saved on this device" />
          <PersistenceIndicator state="Syncing" />
          <PersistenceIndicator state="Synced" />
          <PersistenceIndicator state="Retrying" seconds={12} />
          <PersistenceIndicator state="Syncing every change to the cloud" />
        </Group>
      </div>

      {/* The only dark ground the app has. There is no app dark palette: these components
          are drawn on ink because that is where they live (owner's ruling, 2026-09-05). */}
      <section aria-label="On the canvas — the ink ground" className="flex flex-col gap-4 rounded bg-ink-deep p-8">
        <h3 className="font-mono text-helper-caption text-paper-sunk">
          over the canvas — ink pills, 10px radius · 4px padding · lg shadow · 30px targets
        </h3>
        <CanvasPill label="Formatting">
          <CanvasPillButton label="Bold">
            <span className="font-display text-ui font-bold">B</span>
          </CanvasPillButton>
          <CanvasPillButton label="Italic">
            <span className="font-display text-ui italic">I</span>
          </CanvasPillButton>
          <CanvasPillButton label="Underline">
            <span className="font-display text-ui underline">U</span>
          </CanvasPillButton>
          <CanvasPillButton label="Add link">
            <Link />
          </CanvasPillButton>
          <CanvasPillButton label="Remove link — the selection carries no link" disabled>
            <LinkOff />
          </CanvasPillButton>
        </CanvasPill>
        <p className="max-w-[560px] text-[12.5px] leading-[1.5] text-paper-sunk">
          The paywall editor&rsquo;s surround is the other place ink-deep carries app chrome. No coral
          except where something is live.
        </p>
      </section>
    </main>
  )
}
