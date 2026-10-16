// STORY 7.16a — THE ROUTES FIXTURES: one config per shape the Routes Manager emits, read by `routes.test.ts` (every
// filter through both majors' NQL, every file through `js-yaml`) and by `tools/probe/record-routes.mjs` (every file through
// Ghost 6.58.0's own `route-settings-parser.js` and 5.130.6's `validate.js` — MEASUREMENTS §82). One list, so the test and
// the recorder can never judge two different sets of files.
//
// `mongo` is the INTENDED filter, written by hand: what each emitted filter must mean once Ghost's NQL reads it — `$ne`s on
// one key merged into `$nin` is NQL's own simplification (`@tryghost/mongo-utils`), the same meaning. `RELATIVE` stands for
// a relative term's resolved date, checked by shape (it is the clock's).

import type { RoutesConfig } from './routes.ts'

export const RELATIVE = '<relative>'

export type RoutesFixture = {
  name: string
  config: RoutesConfig
  /** every filter the file carries, in file order, with what it must parse to */
  filters: { where: string; nql: string; mongo: unknown }[]
}

const tax = { tag: 'tag', author: 'author' }

export const ROUTES_FIXTURES: readonly RoutesFixture[] = [
  {
    name: 'one collection',
    config: {
      collections: [{ path: '/tutorials/', filter: { match: 'any', conditions: [{ field: 'tag', op: 'any', values: ['tutorials'] }] }, template: 'custom-tutorials.hbs', limit: 10 }],
      routes: [],
      taxonomies: tax,
    },
    filters: [
      { where: 'collections./tutorials/', nql: "tag:'tutorials'", mongo: { tag: 'tutorials' } },
      { where: 'collections./', nql: "tag:-'tutorials'", mongo: { tag: { $ne: 'tutorials' } } },
    ],
  },
  {
    name: 'collection order — two All collections',
    config: {
      collections: [
        { path: '/craft/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'any', values: ['craft'] }, { field: 'featured', is: true }] }, template: 'custom-craft-list.hbs' },
        { path: '/field-notes/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'any', values: ['field-notes'] }, { field: 'feature_image', is: true }] }, template: 'custom-field-notes-list.hbs', limit: 6 },
      ],
      routes: [],
      taxonomies: tax,
    },
    filters: [
      { where: 'collections./craft/', nql: "tag:'craft'+featured:true", mongo: { $and: [{ tag: 'craft' }, { featured: true }] } },
      { where: 'collections./field-notes/', nql: "tag:'field-notes'+feature_image:-null", mongo: { $and: [{ tag: 'field-notes' }, { feature_image: { $ne: null } }] } },
      {
        where: 'collections./',
        nql: "(tag:-'craft',featured:false)+(tag:-'field-notes',feature_image:null)",
        mongo: { $and: [{ $or: [{ tag: { $ne: 'craft' } }, { featured: false }] }, { $or: [{ tag: { $ne: 'field-notes' } }, { feature_image: null }] }] },
      },
    ],
  },
  {
    name: "the owner's test — an All collection before a one-condition one",
    config: {
      collections: [
        { path: '/craft/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'any', values: ['craft'] }, { field: 'featured', is: true }] }, template: 'custom-craft-list.hbs' },
        { path: '/field-notes/', filter: { match: 'any', conditions: [{ field: 'tag', op: 'any', values: ['field-notes'] }] }, template: 'custom-field-notes-list.hbs', limit: 6 },
      ],
      routes: [],
      taxonomies: tax,
    },
    filters: [
      { where: 'collections./craft/', nql: "tag:'craft'+featured:true", mongo: { $and: [{ tag: 'craft' }, { featured: true }] } },
      { where: 'collections./field-notes/', nql: "tag:'field-notes'", mongo: { tag: 'field-notes' } },
      { where: 'collections./', nql: "(tag:-'craft',featured:false)+tag:-'field-notes'", mongo: { $and: [{ $or: [{ tag: { $ne: 'craft' } }, { featured: false }] }, { tag: { $ne: 'field-notes' } }] } },
    ],
  },
  {
    name: 'Any of several, multi-value and none-of',
    config: {
      collections: [
        { path: '/notes/', filter: { match: 'any', conditions: [{ field: 'tag', op: 'any', values: ['a', 'b'] }, { field: 'author', op: 'any', values: ['ann'] }] }, template: 'custom-notes.hbs' },
        { path: '/quiet/', filter: { match: 'all', conditions: [{ field: 'tag', op: 'none', values: ['a', 'b'] }] }, template: 'custom-quiet.hbs' },
      ],
      routes: [],
      taxonomies: tax,
    },
    filters: [
      { where: 'collections./notes/', nql: "tag:['a','b'],author:'ann'", mongo: { $or: [{ tag: { $in: ['a', 'b'] } }, { author: 'ann' }] } },
      { where: 'collections./quiet/', nql: "tag:-['a','b']", mongo: { tag: { $nin: ['a', 'b'] } } },
      // a negated Any is flattened into the + chain, never wrapped
      { where: 'collections./', nql: "tag:-['a','b']+author:-'ann'+tag:['a','b']", mongo: { $and: [{ tag: { $nin: ['a', 'b'] } }, { author: { $ne: 'ann' } }, { tag: { $in: ['a', 'b'] } }] } },
    ],
  },
  {
    name: 'every field, a channel, a static route and taxonomies',
    config: {
      collections: [{
        path: '/members-picks/',
        filter: {
          match: 'all',
          conditions: [
            { field: 'primary_tag', op: 'any', values: ['picks'] },
            { field: 'primary_author', op: 'none', values: ['bot'] },
            { field: 'visibility', op: 'any', values: ['members', 'paid'] },
            { field: 'published_at', op: '>=', at: { date: '2026-01-01' } },
          ],
        },
        template: 'custom-picks.hbs',
        limit: 12,
      }],
      routes: [
        { path: '/reading-list/', channel: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { ago: 30, unit: 'd' } }] }, template: 'custom-reading-list.hbs' },
        { path: '/landing/', template: 'custom-landing.hbs' },
        { path: '/featured/', channel: { match: 'all', conditions: [{ field: 'featured', is: true }, { field: 'visibility', op: 'none', values: ['paid'] }] }, template: 'custom-reading-list.hbs', limit: 4 },
      ],
      taxonomies: { tag: 'topic', author: 'writer' },
    },
    filters: [
      {
        where: 'collections./members-picks/',
        nql: "primary_tag:'picks'+primary_author:-'bot'+visibility:['members','paid']+published_at:>='2026-01-01'",
        mongo: { $and: [{ primary_tag: 'picks' }, { primary_author: { $ne: 'bot' } }, { visibility: { $in: ['members', 'paid'] } }, { published_at: { $gte: '2026-01-01' } }] },
      },
      {
        where: 'collections./',
        nql: "primary_tag:-'picks',primary_author:'bot',visibility:-['members','paid'],published_at:<'2026-01-01'",
        mongo: { $or: [{ primary_tag: { $ne: 'picks' } }, { primary_author: 'bot' }, { visibility: { $nin: ['members', 'paid'] } }, { published_at: { $lt: '2026-01-01' } }] },
      },
      { where: 'routes./reading-list/', nql: 'published_at:>now-30d', mongo: { published_at: { $gt: RELATIVE } } },
      { where: 'routes./featured/', nql: "featured:true+visibility:-'paid'", mongo: { $and: [{ featured: true }, { visibility: { $ne: 'paid' } }] } },
    ],
  },
  {
    // AN EXACT DATE MEANS THE WHOLE DAY: "after" and "on or before" are said by the next day (`nodeOf`'s `byTheDay`), across
    // a year's end and 29 February; "on or after" and "before" stand as written
    name: 'exact dates by the day — the four operators, a year end and a leap day',
    config: {
      collections: [
        { path: '/new-year/', filter: { match: 'all', conditions: [{ field: 'published_at', op: '>', at: { date: '2025-12-31' } }] }, template: 'custom-notes.hbs' },
        { path: '/leap/', filter: { match: 'all', conditions: [{ field: 'published_at', op: '<=', at: { date: '2024-02-28' } }] }, template: 'custom-notes.hbs' },
      ],
      routes: [
        { path: '/window/', channel: { match: 'all', conditions: [{ field: 'published_at', op: '>=', at: { date: '2024-02-29' } }, { field: 'published_at', op: '<', at: { date: '2026-03-01' } }] }, template: 'custom-fresh.hbs' },
      ],
      taxonomies: tax,
    },
    filters: [
      { where: 'collections./new-year/', nql: "published_at:>='2026-01-01'", mongo: { published_at: { $gte: '2026-01-01' } } },
      { where: 'collections./leap/', nql: "published_at:<'2024-02-29'", mongo: { published_at: { $lt: '2024-02-29' } } },
      { where: 'collections./', nql: "published_at:<'2026-01-01'+published_at:>='2024-02-29'", mongo: { $and: [{ published_at: { $lt: '2026-01-01' } }, { published_at: { $gte: '2024-02-29' } }] } },
      { where: 'routes./window/', nql: "published_at:>='2024-02-29'+published_at:<'2026-03-01'", mongo: { $and: [{ published_at: { $gte: '2024-02-29' } }, { published_at: { $lt: '2026-03-01' } }] } },
    ],
  },
  {
    name: 'routes only — the index collection carries no filter',
    config: {
      collections: [],
      routes: [{ path: '/landing/', template: 'custom-landing.hbs' }],
      taxonomies: tax,
    },
    filters: [],
  },
  {
    name: 'a relative channel of every unit and operator',
    config: {
      collections: [],
      routes: [
        { path: '/fresh/', channel: { match: 'any', conditions: [{ field: 'published_at', op: '>', at: { ago: 2, unit: 'w' } }, { field: 'published_at', op: '>=', at: { ago: 1, unit: 'M' } }] }, template: 'custom-fresh.hbs' },
        { path: '/archive-old/', channel: { match: 'all', conditions: [{ field: 'published_at', op: '<', at: { ago: 1, unit: 'y' } }, { field: 'published_at', op: '<=', at: { ago: 400, unit: 'd' } }] }, template: 'custom-fresh.hbs' },
      ],
      taxonomies: tax,
    },
    filters: [
      { where: 'routes./fresh/', nql: 'published_at:>now-2w,published_at:>=now-1M', mongo: { $or: [{ published_at: { $gt: RELATIVE } }, { published_at: { $gte: RELATIVE } }] } },
      { where: 'routes./archive-old/', nql: 'published_at:<now-1y+published_at:<=now-400d', mongo: { $and: [{ published_at: { $lt: RELATIVE } }, { published_at: { $lte: RELATIVE } }] } },
    ],
  },
]
