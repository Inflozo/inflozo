const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { renderCanvas, renderTheme } = require('./compile');

const read = (f) => fs.readFileSync(path.join(__dirname, 'sections', f), 'utf8');
const hero = read('hero-centered.html');
const grid = read('post-grid.html');

const heroContent = { title: 'Notes on building things', subtitle: 'Design, code, and the occasional rant.', cta: { label: 'Read the archive', url: '/archive/' } };
const gridContent = { title: 'From the blog' };
const ghost = { posts: [
  { title: 'On typography', url: '/on-typography/', feature_image: '/content/images/2026/03/type.jpg', published_at: '2026-03-14' },
  { title: 'The cost of clever', url: '/cost-of-clever/', feature_image: '/content/images/2026/02/clever.jpg', published_at: '2026-02-02' },
  { title: 'A post with no image', url: '/no-image/', feature_image: null, published_at: '2026-01-09' },
]};

let pass = 0; const ok = (m) => { console.log('  ✓', m); pass++; };

console.log('\n1. Hero — design content only');
const heroTheme = renderTheme(hero, heroContent, 'home-hero');
const heroCanvas = renderCanvas(hero, heroContent, ghost);
assert(!/\{\{/.test(heroTheme.template), 'hero must contain no handlebars');
ok('emits zero Handlebars (nothing comes from Ghost)');
assert(heroTheme.template.includes('Notes on building things'));
assert(heroTheme.template.includes('href="/archive/"'));
ok('content baked into text and attribute');
assert(!/data-(prop|bind|empty|repeat|partial)/.test(heroTheme.template), 'no directives may survive');
ok('zero builder fingerprints in output');
assert(heroCanvas.includes('Notes on building things'));
ok('canvas renders the same content');

console.log('\n2. Post grid — Ghost data, loop, partial');
const gridTheme = renderTheme(grid, gridContent, 'home-latest-posts');
assert(gridTheme.template.includes('{{#foreach posts limit="3"}}'), gridTheme.template);
assert(gridTheme.template.includes('{{/foreach}}'));
ok('loop emitted as {{#foreach posts limit="3"}}');
assert(gridTheme.template.includes('{{> "post-card"}}'));
ok('repeating element extracted to {{> "post-card"}} with no params');
assert(gridTheme.partials['post-card'], 'partial must be produced');
ok('partial file produced');
const card = gridTheme.partials['post-card'];
assert(card.includes('{{img_url feature_image size="m"}}'), card);
ok('THE RISKY ONE: quotes inside an attribute survived — not &quot;');
assert(card.includes('{{date published_at format="D MMM YYYY"}}'), card);
ok('quotes inside a text-node helper survived');
assert(/\{\{#if feature_image\}\}[\s\S]*<img[\s\S]*\{\{\/if\}\}/.test(card), card);
ok('FR-H8 media guard wraps the ELEMENT, not the attribute');

console.log('\n3. Output is valid Handlebars');
Handlebars.registerHelper('foreach', function (ctx, o) { return (ctx || []).map((i) => o.fn(i)).join(''); });
Handlebars.registerHelper('img_url', (u) => u || '');
Handlebars.registerHelper('date', (d) => String(d || ''));
Handlebars.registerPartial('post-card', card);
const out = Handlebars.compile(gridTheme.template)(ghost);
ok('template + partial compile and render without error');
assert(out.includes('On typography') && out.includes('The cost of clever'));
ok('renders real post titles through the partial');
assert(!out.includes('A post with no image') || !/no-image[\s\S]{0,200}<img/.test(out));
ok('post with null feature_image renders without a broken <img>');

console.log('\n4. Escaping — user content is data, not code');
const evil = renderTheme(hero, { ...heroContent, title: 'Try {{@site.title}} here' }, 'x');
assert(evil.template.includes('\\{{@site.title}}'), evil.template);
ok('a headline containing {{...}} is emitted inert');
assert(Handlebars.compile(evil.template)({}).includes('{{@site.title}}'));
ok('and renders as literal text, not an expression');

console.log('\n5. Canvas vs theme agreement');
const canvasGrid = renderCanvas(grid, gridContent, ghost);
const themeRendered = Handlebars.compile(gridTheme.template)(ghost);
const strip = (s) => s.replace(/\s+/g, ' ').replace(/<!--.*?-->/g, '').trim();
const classes = (s) => (strip(s).match(/class="[^"]*"/g) || []).join('|');
assert.strictEqual(classes(canvasGrid), classes(themeRendered));
ok('canvas and compiled output produce an identical class/element skeleton');

console.log(`\n${pass} checks passed\n`);
