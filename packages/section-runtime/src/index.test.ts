import { test } from 'node:test'
import assert from 'node:assert/strict'
// DW-1's proof: an import that CROSSES the package boundary. Until `packages/library` declared an
// `exports` map, the `workspace:*` arrow three packages already carried could not resolve, and
// every test in the repo asserted only its own package name.
import { BINDING_CONTEXTS, DIRECTIVES } from '@inflozo/library'
import { JSDOM } from 'jsdom'
import { renderCanvas, renderTheme } from './index.ts'

test('the library resolves across the workspace boundary', () => {
  assert.ok(DIRECTIVES['data-bind'], 'the directive set is readable from another package')
  assert.ok(!(BINDING_CONTEXTS as readonly string[]).includes('page'))
})

// Story 5.3 — the canvas's editing stamps. Each sits on the element the editor will make editable, with the path, the
// authored item's index in its array (not its position on the page) and the Ghost field's name; lifted off, the render is
// exactly the render without `editing`, so nothing about the stamps can change what the canvas shows.
test('editing stamps each text prop, item and Ghost word, and stripped of them the canvas render is the plain one', () => {
  const src = `<section class="s">
    <h2 data-prop="title">Title</h2>
    <p data-bind="@site.title">Site</p>
    <nav data-helper="navigation"></nav>
    <ul><li data-items="features" data-prop="features[].title" data-empty="hide">Feature</li></ul>
    <p data-if="@site.members_enabled"><span data-prop="yes">Yes</span></p><p data-else><span data-prop="no">No</span></p>
    <img data-prop-attr="src:picture" alt="">
  </section>`
  const input = {
    target: 'default.hbs',
    schema: {
      title: { type: 'text', label: 'Title' },
      features: { type: 'array', label: 'Features' },
      'features[].title': { type: 'text', label: 'Feature' },
      yes: { type: 'richtext', label: 'Yes', marks: ['strong'] },
      no: { type: 'text', label: 'No' },
      picture: { type: 'image', label: 'Picture' },
    },
    content: { title: 'Hello', features: [{ title: 'A' }, { title: '' }, { title: 'C' }], yes: 'On' },
    ghost: { '@site': { title: 'Orbit Weekly', members_enabled: true } },
    site: { navigation: [{ label: 'Home', url: 'https://orbit.example/' }] },
  } as const
  const doc = () => new JSDOM('<body></body>').window.document
  const plain = renderCanvas(doc(), src, input as never)
  const stamped = renderCanvas(doc(), src, { ...input, editing: true } as never)
  const body = new JSDOM(`<body>${stamped}</body>`).window.document.body
  const stamps = [...body.querySelectorAll('*')].flatMap((el) =>
    [...el.attributes].filter((a) => a.name.startsWith('data-inflozo-')).map((a) => `${el.tagName.toLowerCase()} ${a.name}=${a.value}`),
  )
  assert.deepEqual(stamps, [
    'h2 data-inflozo-prop=title',
    'p data-inflozo-ghost=Site title',
    'nav data-inflozo-ghost=Navigation',
    'li data-inflozo-prop=features[].title',
    'li data-inflozo-item=0',
    'li data-inflozo-prop=features[].title',
    'li data-inflozo-item=2',
    'span data-inflozo-prop=yes',
  ], 'the hidden middle item leaves the third its own index; the removed arm and the image prop carry none')
  for (const el of body.querySelectorAll('*')) for (const a of [...el.attributes]) if (a.name.startsWith('data-inflozo-')) el.removeAttribute(a.name)
  assert.ok(stamps.length > 0 && body.innerHTML !== stamped, 'control: the strip removed something')
  assert.equal(body.innerHTML, plain)
  assert.throws(() => renderTheme(doc(), src, { ...input, editing: true } as never), /canvas emitter's alone/)
})
