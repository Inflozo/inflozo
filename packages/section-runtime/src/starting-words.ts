// Story 7.12 — QUESTION 1, RULED OPTION 1 (owner, 2026-10-15): a section's own starting words nobody retyped.
//
// A design arrives with sample words — Three Up's eyebrow "The archive", its link "Browse the archive". They are the
// section's CONTENT, not catalog labels (DW-145), so Translations never lists them and they stay exactly as written until
// the customer retypes them on the canvas. On a project whose language is not English they would reach visitors in
// English, so Translations lists them (each with an Edit link to its canvas) and Story 7.18b's Pre-flight repeats the same
// list as a warning — never a block. ONE function feeds both.
//
// "Untouched" is a text or rich-text prop the design prints, with an authored `default` and no `catalog` key (a catalog
// prop's starting words ARE a label, and Translations lists it), whose stored value is still that default's words — a
// rich text whose marks alone changed still reads the same English — or holds none at all. A value the customer cleared is
// theirs, not the design's. Only PLACED, VISIBLE sections count: a hidden one renders nothing, and a synthesized `auto-*`
// instance is the Synthesis Defaults', not one the customer placed.
//
// ponytail: top-level props only — a list's item props (`items[].label`) are not compared with their items' defaults; add
// them when a library design prints a list whose starting items carry words of their own.
//
// Pure (AD-1): docs and a library lookup in, rows out.

import type { PropDef } from '@inflozo/library'
import { getPath, markupProps } from './controls.ts'
import type { ProjectDoc } from './doc-schema.ts'
import { plainText } from './marks.ts'

/** What this reads of a design. A `SectionRegistryEntry` satisfies it. */
export type StartingEntry = { name: string; html: string; contentSchema: Readonly<Record<string, PropDef>> }

/** One section whose starting words are untouched: the doc it sits in (its `template_key`), the instance, its layer's name
 *  (the design's own where the layer has none) and each untouched prop's words, in markup order. */
export type StartingWords = { key: string; instanceId: string; layer: string; words: string[] }

export function untouchedWords(docs: Readonly<Record<string, ProjectDoc>>, library: (designId: string) => StartingEntry | undefined): StartingWords[] {
  const out: StartingWords[] = []
  for (const [key, doc] of Object.entries(docs)) {
    for (const i of doc.instances) {
      if (i.hidden || i.instanceId.startsWith('auto-')) continue
      const entry = library(i.designId)
      if (entry === undefined) continue
      const words: string[] = []
      for (const path of markupProps(entry.html)) {
        const def = entry.contentSchema[path]
        if (def === undefined || path.includes('[]') || (def.type !== 'text' && def.type !== 'richtext') || def.catalog !== undefined) continue
        const start = plainText(def.default)
        if (start.trim() === '') continue
        const value = getPath(i.content, path)
        if (value == null || plainText(value) === start) words.push(start)
      }
      if (words.length > 0) out.push({ key, instanceId: i.instanceId, layer: i.layerName.trim() || entry.name, words })
    }
  }
  return out
}
