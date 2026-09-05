import { updatedLabel } from '@/lib/projects'
import { Placeholder } from './placeholder'
import { ProjectMenu } from './project-menu'

/**
 * S3a's card, at the state a Story 1.5 project is actually in.
 *
 * WHAT THE FRAME DRAWS AND THIS DOES NOT, because none of it exists yet: the site favicon, the
 * domain and the deploy chip (Live / Failed / Never deployed) — E3 links a site and E7 deploys
 * one. What stays is FR-B5's visible half: every project here is unlinked, so every card wears
 * "Sample content", and the updated-at line takes the slot the deploy chip has on the frame.
 *
 * THE CARD IS NOT A LINK. Opening a project is Story 5.1's — the editor and its URL scheme —
 * and a card that navigated nowhere would be the lie UX-DR3 forbids.
 */
export function ProjectCard({
  project,
  now,
  atCap,
}: {
  project: { id: string; name: string; style_pack: unknown; updated_at: string }
  now: Date
  atCap: boolean
}) {
  return (
    <article className="overflow-hidden rounded border border-line bg-surface shadow-sm transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-md">
      <Placeholder stylePack={project.style_pack} />
      <div className="flex flex-col gap-2 p-[14px_16px]">
        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 truncate text-[15px] font-semibold text-ink tablet:text-ui">{project.name}</h2>
          <ProjectMenu id={project.id} name={project.name} atCap={atCap} />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-pill border border-line px-[9px] py-[2px] text-helper-caption text-ink-soft">
            Sample content
          </span>
          <span className="ml-auto text-[11.5px] text-ink-soft">
            {updatedLabel(project.updated_at, now)}
          </span>
        </div>
      </div>
    </article>
  )
}
