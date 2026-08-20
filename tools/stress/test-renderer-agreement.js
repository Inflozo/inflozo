// tools/stress/test-renderer-agreement.js — E0(a)'s exit criterion, made runnable.
//
// §7.3's central claim is that the canvas and the shipped theme agree BY CONSTRUCTION, and the
// justification is "the same code ran". Until now that was a promise: the rebuilt pipeline had only
// the theme emitter, so nothing could have caught the two drifting.
//
// This asserts the claim node by node. It renders one source through BOTH emitters and requires the
// element tree, the classes and the attribute names to be identical — because those three are what
// the design's stylesheet selects on, and a difference in any of them is a canvas that lies.
//
// Two differences are EXPECTED and are the entire point of having two emitters:
//   1. a repeat expands against real rows here and becomes {{#foreach}} there
//   2. a binding resolves to a value here and becomes a mustache there
// Both are differences in TEXT and in bound ATTRIBUTE VALUES, never in structure. The comparison is
// therefore over structure, and it is deliberately blind to the two things that must differ.
//
// Run:  node test-renderer-agreement.js
const assert = require('assert');
const { JSDOM } = require('jsdom');
const { renderCanvas, renderSection, UserText } = require('./compile.js');

let n = 0;
const ok = (label) => { n++; console.log('  ok  ' + label); };

// Normalise the theme so it can be parsed as HTML and compared for STRUCTURE:
//   - strip Handlebars BLOCKS ({{#foreach}}, {{#if}}, {{/…}}): they wrap elements and have no
//     canvas counterpart by design — leaving them in would compare the emitters' differences.
//   - collapse every remaining INLINE mustache to a quote-free token X. The theme legitimately
//     emits `src="{{img_url feature_image size="800"}}"` — valid Handlebars that gscan passes 0/0,
//     but NOT valid HTML, so a raw parse mistakes the inner `size="800"` for a stray attribute.
//     Canvas values carry no mustaches, so this is a no-op there. AD-5's user braces are numeric
//     entities (&#123;), never `{{`, so they are untouched.
const htmlSafe = (html) =>
  html.replace(/\{\{[#/][^}]*\}\}/g, '')
      .replace(/\{\{[^}]*\}\}/g, 'X')
      .replace(/^\s*[\r\n]/gm, '').trim();

// A structural skeleton: tag, class list, and the SORTED SET OF ATTRIBUTE NAMES. Values are
// excluded on purpose — `src="https://x.jpg"` and `src="{{img_url …}}"` are the same structure and
// must compare equal, or the test is asserting that the emitters are identical rather than that
// they agree.
function skeleton(html) {
  const doc = new JSDOM(`<body>${html}</body>`).window.document;
  const out = [];
  const walk = (el, d) => {
    for (const c of el.children) {
      const names = [...c.attributes].map((a) => a.name).sort().join(',');
      out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}[${c.getAttribute('class') || ''}]{${names}}`);
      walk(c, d + 1);
    }
  };
  walk(doc.body, 0);
  return out;
}

function bothWays(src, content, ghost) {
  const canvas = renderCanvas(src, content, ghost);
  const users = new UserText();
  const t = renderSection(src, content, users);
  return { canvas, theme: users.substitute(t.template) };
}

function agree(label, src, content, ghost) {
  const { canvas, theme } = bothWays(src, content, ghost);
  const a = skeleton(htmlSafe(canvas)), b = skeleton(htmlSafe(theme));
  assert.deepStrictEqual(a, b,
    `RENDERERS DISAGREE — ${label}\n  canvas:\n${a.join('\n')}\n  theme:\n${b.join('\n')}`);
  ok(label);
  return { canvas, theme };
}

console.log('§7.3 — the canvas and the shipped theme agree by construction\n');

// ── a static section: no repeat, no binding. The two must be structurally identical. ──
agree('a static section agrees exactly',
  `<section class="hero" data-align="center" data-density="roomy">
     <p class="hero__eyebrow" data-prop="eyebrow">e</p>
     <h1 class="hero__title" data-prop="title">t</h1>
     <a class="hero__cta" data-prop-attr="href:ctaUrl" data-prop="ctaLabel">c</a>
   </section>`,
  { eyebrow: 'Issue 12', title: 'A headline', ctaLabel: 'Read it', ctaUrl: 'https://ok.example/x' },
  {});

// ── AD-3: a control is one attribute on the section root, and the stylesheet selects on it.
//    If these differ between emitters, every design's CSS is a coin flip.
{
  const { canvas, theme } = bothWays(
    `<section class="hero" data-align="center" data-density="roomy" data-tone="dark">
       <h1 data-prop="title">t</h1></section>`,
    { title: 'x' }, {});
  for (const attr of ['data-align="center"', 'data-density="roomy"', 'data-tone="dark"']) {
    assert(canvas.includes(attr), `canvas lost the control attribute ${attr}`);
    assert(theme.includes(attr), `theme lost the control attribute ${attr}`);
  }
  ok('AD-3 control attributes survive identically on both emitters');
}

// ── a Ghost-bound section with a repeat. Rendered with ONE row so the shapes line up: the theme
//    emits one body inside {{#foreach}}, so one row is the honest comparison. ──
const feedSrc =
  `<section class="feed" data-cols="three">
     <article class="card" data-repeat="posts" data-repeat-limit="3">
       <img class="card__img" data-bind-attr="src:feature_image|img_url:800" data-empty="hide">
       <h2 class="card__title" data-bind="title">t</h2>
       <time class="card__date" data-bind="published_at|date:MMM DD, YYYY">d</time>
       <a class="card__link" data-bind-attr="href:url">go</a>
     </article>
   </section>`;
const onePost = { posts: [{ title: 'Post one', url: 'https://s.example/1',
                            feature_image: 'https://s.example/1.jpg',
                            published_at: '2026-08-20T10:00:00Z' }] };
agree('a Ghost-bound repeat agrees, structure for structure', feedSrc, {}, onePost);

// ── the directive vocabulary must be gone from BOTH. AD-34 asserts this over the theme; a canvas
//    that leaked a directive would style differently, since designs select on data-* attributes. ──
{
  const { canvas, theme } = bothWays(feedSrc, {}, onePost);
  for (const [name, html] of [['canvas', canvas], ['theme', theme]]) {
    for (const d of ['data-repeat', 'data-repeat-limit', 'data-bind', 'data-bind-attr',
                     'data-prop', 'data-prop-attr', 'data-partial', 'data-empty', 'data-module']) {
      assert(!new RegExp(`\\b${d}=`).test(html), `${name} leaked the directive ${d}: ${html}`);
    }
  }
  ok('no directive attribute survives on either emitter');
}

// ── the two differences that MUST exist, asserted so nobody "fixes" them into agreement ──
{
  const { canvas, theme } = bothWays(feedSrc, {}, onePost);
  assert(/\{\{#foreach posts limit="3"\}\}/.test(theme), 'theme lost its foreach: ' + theme);
  assert(!/\{\{#foreach/.test(canvas), 'canvas emitted a foreach; it must expand real rows');
  assert(canvas.includes('Post one'), 'canvas did not resolve the bound value');
  assert(/\{\{title\}\}/.test(theme), 'theme did not defer the bound value to Ghost');
  ok('the two intended differences are present: foreach-vs-rows, mustache-vs-value');
}

// ── AD-4/AD-5, the half that reads backwards. The canvas must show the user their own literal
//    braces; the theme must ship them inert. Same serializer, opposite correct outcomes. ──
{
  const { canvas, theme } = bothWays(
    `<p data-prop="title">t</p>`, { title: 'Notes on {{title}} and C:\\{{@site.title}}' }, {});
  assert(canvas.includes('{{title}}'), 'canvas must show the user their own literal text: ' + canvas);
  assert(!/&#123;/.test(canvas), 'canvas must not show the user HTML entities: ' + canvas);
  assert(theme.includes('&#123;&#123;title&#125;&#125;'), 'theme must ship braces inert: ' + theme);
  assert(!/\{\{title\}\}/.test(theme), 'theme shipped a LIVE mustache from user text: ' + theme);
  ok('AD-4/AD-5 — the canvas decodes and the theme ships inert, from one serializer');
}

// ── AD-36 must hold on BOTH emitters. On the theme a javascript: link is the visitor's problem;
//    on the canvas it is a same-origin URL inside the owner's own authenticated session. ──
{
  const { canvas, theme } = bothWays(
    `<a data-prop-attr="href:link" data-prop="label">l</a>`,
    { link: 'javascript:alert(document.domain)', label: 'Click' }, {});
  assert(!/javascript:/i.test(canvas), 'CANVAS shipped a javascript: URL — same-origin XSS: ' + canvas);
  assert(!/javascript:/i.test(theme), 'theme shipped a javascript: URL: ' + theme);
  ok('AD-36 — the URL scheme check runs on both emitters, not just the theme');
}

// ── FR-H8's guard: absent data removes the element on the canvas and wraps it in {{#if}} on the
//    theme. Different mechanisms, same user-visible outcome — which is what agreement means here. ──
{
  const src = `<section class="c"><img class="m" data-bind-attr="src:feature_image|img_url:800" data-empty="hide"><h2 class="t" data-bind="title">t</h2></section>`;
  const { canvas } = bothWays(src, {}, { title: 'Only a title' });     // no feature_image
  assert(!/<img/.test(canvas), 'canvas kept a media element with no data: ' + canvas);
  assert(/Only a title/.test(canvas), 'canvas lost the sibling that DOES have data: ' + canvas);
  const { theme } = bothWays(src, {}, { title: 'x', feature_image: 'y' });
  assert(/\{\{#if feature_image\}\}/.test(theme), 'theme guard is not on the bound field: ' + theme);
  ok('FR-H8 — an empty media binding hides the element on both, by each emitter\'s own mechanism');
}

console.log(`\n${n} checks passed — the two emitters agree.`);
