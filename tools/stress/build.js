// tools/stress/build.js — AD-11's budget, re-measured on realistic sections.
//
// Round 1 decision 10 and Round 1 finding 3: the fixture behind AD-11's ~2.1 s /
// ~290 MB was never checked in, and per-section cost scales ~7.4x from the spike's
// toy shape to a realistic section. This is the rebuilt fixture.
//
//   node build.js            compile, assemble, gate, zip; print the budget table
//   node build.js --keep     leave theme/ on disk for gscan or a manual upload
//
// The two-checker gate (AD-34) is the same Ghost-major -> gscan-version pairing as
// _bmad-output/.../fixtures-r2/gate.js: gscan 4.49.7 answers for Ghost 5, 6.4.2 for Ghost 6.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { renderSection, UserText, T0, T1, U0, U1 } = require('./compile');
const { IMAGE_SIZES } = require('../../packages/library/src/vocabulary.ts');
const { stressStack, source } = require('./sections');

const OUT = path.join(__dirname, 'theme');
const ms = (t) => Number(process.hrtime.bigint() - t) / 1e6;
const rss = () => Math.round(process.memoryUsage().rss / 1048576);
let peak = 0; const mark = () => { peak = Math.max(peak, rss()); };

// ---------------------------------------------------------------- content
// Deliberately hostile user text: braces, marks, the compiler's own marker shape.
// AD-5 must render every one of these inert, and the emitted theme must still compile.
const HOSTILE = [
  'Notes on {{title}} and other things',
  'C:\\{{@site.title}} — the path case',
  'Hi {{#if @member}}member{{/if}}, welcome',
  `a user typing the marker: ${U0}0${U1}`,
  'quotes " and & and <b>bold</b>',
];
const text = (i, base) => (i % 7 === 0 ? HOSTILE[i % HOSTILE.length] : base);

function contentFor(kind, i) {
  const c = {
    title: text(i, `Section ${i} headline`), subtitle: `A sentence for section ${i}.`,
    eyebrow: `Issue ${i}`, footnote: 'No spam. Unsubscribe anytime.', note: 'Prices in USD.',
    utilityNote: 'Free weekly issue', logoText: 'Orbit Weekly', logoAlt: 'Orbit Weekly home',
    signinLabel: 'Sign in', perMonth: '/month', tierCta: 'Subscribe',
    emailLabel: 'Email address', submitLabel: 'Subscribe', fine: 'No spam.',
    blurb: 'A newsletter about building things.', copyright: '(c) Orbit Weekly',
    mediaCaption: 'Photo credit', relatedTitle: 'More like this',
    cta: { label: text(i, 'Get started'), url: '/start/' },
    cta2: { label: 'Read a sample', url: '/sample/' },
  };
  for (let n = 1; n <= 5; n++) {
    c[`stat${n}`] = { label: `Metric ${n}`, value: `${n}2,000` };
    c[`trust${n}`] = { src: `/content/images/trust-${n}.svg` };
    c[`proof${n}`] = { src: `/content/images/proof-${n}.jpg` };
    c[`benefit${n}`] = `Benefit ${n}`;
    c[`img${n}`] = { src: `/content/images/g-${n}.jpg`, alt: `Gallery image ${n}`, caption: `Caption ${n}` };
  }
  for (let n = 6; n <= 8; n++) c[`img${n}`] = { src: `/content/images/g-${n}.jpg`, alt: `Gallery image ${n}`, caption: `Caption ${n}` };
  for (let n = 1; n <= 2; n++) {
    c[`col${n}`] = { title: `Column ${n}` };
    for (let m = 1; m <= 3; m++) c[`col${n}`][`link${m}`] = { label: `Item ${m}`, url: `/c${n}-${m}/` };
  }
  return c;
}

// ---------------------------------------------------------------- 7 templates, 70 sections
const TEMPLATES = [
  { file: 'custom-stress', sections: 40 },   // the 40-section stress template
  { file: 'index', sections: 5 }, { file: 'post', sections: 5 }, { file: 'page', sections: 5 },
  { file: 'tag', sections: 5 }, { file: 'author', sections: 5 }, { file: 'error', sections: 5 },
];

const t0 = process.hrtime.bigint();
const users = new UserText();
const rendered = [];        // { tmpl, layer, hbs }
const sharedPartials = {};  // name -> body
let sectionCount = 0;

const tRender = process.hrtime.bigint();
for (const t of TEMPLATES) {
  const stack = stressStack(t.sections);
  stack.forEach((s, n) => {
    const layer = `${s.kind}-${n + 1}`;
    const r = renderSection(source(s), contentFor(s.kind, sectionCount), users);
    rendered.push({ tmpl: t.file, layer, hbs: r.template });
    for (const [name, body] of Object.entries(r.partials)) sharedPartials[name] = body;
    sectionCount++;
    if (sectionCount % 10 === 0) mark();
  });
}
const renderMs = ms(tRender);
mark();

// ---------------------------------------------------------------- assemble
const tAssemble = process.hrtime.bigint();
fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['partials/sections', 'partials/shared', 'assets/css', 'assets/js', 'assets/fonts', 'assets/img', 'locales'])
  fs.mkdirSync(path.join(OUT, d), { recursive: true });

const write = (rel, body) => fs.writeFileSync(path.join(OUT, rel), body);

for (const t of TEMPLATES) fs.mkdirSync(path.join(OUT, 'partials/sections', t.file), { recursive: true });
for (const r of rendered) write(`partials/sections/${r.tmpl}/${r.layer}.hbs`, `{{!-- ${r.layer} --}}\n${r.hbs}\n`);
// A repeat partial is invoked by its BARE name ({{> "post-card"}}), so it is filed at
// partials/<name>.hbs. Filing it in a subdirectory silently breaks every reference.
for (const [name, body] of Object.entries(sharedPartials)) write(`partials/${name}.hbs`, `${body}\n`);

const includes = (t) => rendered.filter((r) => r.tmpl === t).map((r) => `{{> "sections/${t}/${r.layer}"}}`).join('\n');

// AD-17: all three FR-Q5 dark built-ins declared AND referenced through real chains.
// The scheme class is emitted BESIDE {{body_class}} (Round 2: body_class carries nothing from @custom).
write('default.hbs', `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{meta_title}}</title>
  <link rel="stylesheet" href="{{asset "css/screen.css"}}">
  <link rel="stylesheet" href="{{asset "css/cards.css"}}">
  <style>
    :root {
      --accent: {{@custom.accent_colour}};
      --dark-accent: {{@custom.dark_accent_colour}};
    }
    {{#if @custom.dark_logo}}.scheme-dark .hdr__logo-img { content: url({{@custom.dark_logo}}); }{{/if}}
  </style>
  {{ghost_head}}
</head>
<body class="{{body_class}} {{#match @custom.color_scheme "Dark"}}scheme-dark{{else}}{{#match @custom.color_scheme "Light"}}scheme-light{{/match}}{{/match}}">
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main">{{{body}}}</main>
  <script defer src="{{asset "js/main.js"}}"></script>
  {{ghost_foot}}
</body>
</html>
`);

write('index.hbs', `{{!< default}}\n\n${includes('index')}\n`);
// FR-H7 / §7.4: the TEMPLATE opens the block its sections are evaluated in, once, and a section's own
// text never carries it — so the block is read from the one copy of the context matrix, never written
// here (Story 4.6). Epic 7's compiler reads the same row.
const { targets: CONTEXTS } = require('../../packages/library/contexts/matrix.json');
const opened = (target, body) => {
  const block = CONTEXTS[target] && CONTEXTS[target].block;
  return block ? `{{#${block}}}\n${body}\n{{/${block}}}` : body;
};
write('post.hbs', `{{!< default}}\n\n${opened('post.hbs', includes('post'))}\n`);
// C2 / GS110: page.hbs gates on @page.show_title_and_feature_image
write('page.hbs', `{{!< default}}\n\n${opened('page.hbs', `{{#if @page.show_title_and_feature_image}}\n<h1 class="page__title">{{title}}</h1>\n{{/if}}\n${includes('page')}`)}\n`);
write('tag.hbs', `{{!< default}}\n\n${includes('tag')}\n`);
write('author.hbs', `{{!< default}}\n\n${includes('author')}\n`);
write('error.hbs', `{{!< default}}\n\n<h1 class="err__code">{{statusCode}}</h1>\n${includes('error')}\n`);
write('custom-stress.hbs', `{{!< default}}\n\n${includes('custom-stress')}\n`);

write('package.json', JSON.stringify({
  name: 'inflozo-stress', description: 'AD-11 stress fixture', version: '1.0.0',
  engines: { ghost: '>=5.0.0' }, license: 'MIT', keywords: ['ghost-theme'],
  author: { name: 'Inflozo', email: 'hello@inflozo.com' },
  config: {
    posts_per_page: 12, card_assets: true,
    // FR-J2's NORMATIVE map, READ rather than restated (standing rule: counts are derived). This
    // literal disagreed with the PRD on three of its five keys — m/l/xl were 800/1600/2400 — so the
    // harness gated a theme whose renditions no shipped design would ever ask for, and Story 4.3's
    // recordings would have been a faithful recording of the WRONG theme (NFR-6(c2)).
    image_sizes: Object.fromEntries(Object.entries(IMAGE_SIZES).map(([k, w]) => [k, { width: w }])),
    custom: {
      color_scheme: { type: 'select', options: ['Auto', 'Light', 'Dark'], default: 'Auto' },
      dark_accent_colour: { type: 'color', default: '#8ab4f8' },
      dark_logo: { type: 'image' },
      accent_colour: { type: 'color', default: '#1f6feb' },
    },
  },
}, null, 2) + '\n');

// AD-18: --gh-font-heading and --gh-font-body in the SAME file (GS051, both majors)
const packCss = `:root {
  --font-heading: var(--gh-font-heading, "Inter", ui-sans-serif, system-ui, sans-serif);
  --font-body: var(--gh-font-body, "Source Serif 4", ui-serif, Georgia, serif);
  --colour-base: #ffffff; --colour-surface: #f6f8fa; --colour-ink: #10141a;
  --colour-accent: var(--accent, #1f6feb); --measure: 68ch; --gutter: 1.5rem;
}
.scheme-dark { --colour-base: #0d1117; --colour-surface: #161b22; --colour-ink: #e6edf3;
  --colour-accent: var(--dark-accent, #8ab4f8); }
body { font-family: var(--font-body); background: var(--colour-base); color: var(--colour-ink); }
h1, h2, h3 { font-family: var(--font-heading); }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 1rem; top: 1rem; }
`;
// one flat stylesheet per placed design (AD-2), concatenated into screen.css
const designIds = [...new Set(rendered.map((r) => r.layer.replace(/-\d+$/, '')))];
let designCss = '';
for (const r of rendered) {
  const id = r.hbs.match(/class="(d-a\d+-\d+)/);
  if (!id) continue;
  designCss += `\n/* ${id[1]} */\n.${id[1]} { padding-block: var(--pad, 4rem); container-type: inline-size; }\n` +
    `.${id[1]}[data-bg="surface"] { background: var(--colour-surface); }\n` +
    `.${id[1]}[data-spacing="compact"] { --pad: 2rem; }\n` +
    `.${id[1]}[data-spacing="spacious"] { --pad: 7rem; }\n` +
    `.${id[1]}[data-divider="line"] { border-block-start: 1px solid color-mix(in srgb, var(--colour-ink) 12%, transparent); }\n` +
    `.${id[1]} .ico { inline-size: 1.25rem; block-size: 1.25rem; fill: currentColor; }\n` +
    `.${id[1]} a { color: var(--colour-accent); text-underline-offset: 0.15em; }\n` +
    `@container (min-width: 40rem) { .${id[1]} { --pad: 5rem; } }\n`;
}
write('assets/css/screen.css', packCss + designCss);
// GS050-CSS-KGWF is an ERROR on both majors even with card_assets: true -- the theme
// must style .kg-width-wide and .kg-width-full itself. Executed: without these two
// selectors the stress theme scores 1 error on gscan 4.49.7 AND 6.4.2.
write('assets/css/cards.css', `.kg-width-wide { max-inline-size: 1000px; margin-inline: auto; }
.kg-width-full { max-inline-size: 100%; }
` + Array.from({ length: 40 }, (_, n) =>
  `.kg-card-${n} { margin-block: 1.5rem; }\n.kg-width-wide.kg-card-${n} { max-inline-size: 1000px; }\n`).join(''));
write('assets/js/main.js', `// FR-G7 behaviour modules, bundled\n` +
  Array.from({ length: 31 }, (_, n) => `function mod${n}(root){const t=root.querySelectorAll('[data-mod="${n}"]');for(const e of t){e.dataset.ready='1';}}\n`).join('') +
  `document.addEventListener('DOMContentLoaded',()=>{${Array.from({ length: 31 }, (_, n) => `mod${n}(document)`).join(';')}});\n`);

write('locales/en.json', JSON.stringify(Object.fromEntries(
  Array.from({ length: 120 }, (_, n) => [`section.string.${n}`, `String number ${n}`])), null, 2) + '\n');

write('routes.yaml', `routes:\n  /stress/:\n    template: custom-stress\ncollections:\n  /:\n    permalink: /{slug}/\n    template: index\ntaxonomies:\n  tag: /tag/{slug}/\n  author: /author/{slug}/\n`);

// 8 woff2 subsets + 80 hashed renditions (AD-12: 20 assets x 4). Incompressible
// bytes, so the zip figure is honest rather than flattered by zeros -- but SEEDED,
// not random: AD-14 says compile is byte-identical on every machine and every run,
// and asset bytes are an input the shell hands in, not something compile invents.
// AES-CTR over zeros: deterministic from the seed, incompressible, and fast enough
// that generating the fixture's bytes does not show up as compile cost.
const stream = (seed, bytes) => {
  const k = crypto.createHash('sha256').update(seed).digest();
  const c = crypto.createCipheriv('aes-128-ctr', k.subarray(0, 16), k.subarray(16, 32));
  return Buffer.concat([c.update(Buffer.alloc(bytes)), c.final()]).subarray(0, bytes);
};
for (let n = 0; n < 8; n++) write(`assets/fonts/subset-${n}.woff2`, stream(`font-${n}`, 30 * 1024));
const SIZES = [15, 55, 150, 280];   // 400 / 800 / 1600 / original, KB
for (let a = 0; a < 20; a++) for (let s = 0; s < 4; s++) {
  const b = stream(`asset-${a}-${s}`, SIZES[s] * 1024);
  write(`assets/img/asset-${a}-${['400', '800', '1600', 'orig'][s]}-${crypto.createHash('sha1').update(b).digest('hex').slice(0, 8)}.jpg`, b);
}
const assembleMs = ms(tAssemble);
mark();

// ---------------------------------------------------------------- R2-5: substitute user text LAST, over the whole tree
const tSub = process.hrtime.bigint();
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const textFiles = walk(OUT).filter((f) => /\.(hbs|json|css|js|yaml)$/.test(f));
for (const f of textFiles) {
  const before = fs.readFileSync(f, 'utf8');
  const after = users.substitute(before);
  if (after !== before) fs.writeFileSync(f, after);
}
const subMs = ms(tSub);

// ---------------------------------------------------------------- AD-34 leak assertions
const tGate = process.hrtime.bigint();
const allFiles = walk(OUT);
const hbsFiles = allFiles.filter((f) => f.endsWith('.hbs'));
const leaks = [];
// The set is DERIVED from packages/library, never restated (standing rule 4). The seven names
// this line used to carry were the spike's, and they were stale the moment §7.3's gap table was
// answered — the settled vocabulary is more than three times that. The three directives absent
// from CONSUMED_DIRECTIVES survive on purpose: Portal and sodo-search read them on the live site.
const { CONSUMED_DIRECTIVE_RE: DIRECTIVE } = require('../../packages/library/src/vocabulary.ts');
for (const f of textFiles) {
  const s = fs.readFileSync(f, 'utf8');
  if (DIRECTIVE.test(s)) leaks.push(`directive attribute survived in ${path.relative(OUT, f)}`);
  if (s.includes(T0) || s.includes(T1)) leaks.push(`compiler expression token survived in ${path.relative(OUT, f)}`);
  if (s.includes(U0) || s.includes(U1)) leaks.push(`user-text marker survived in ${path.relative(OUT, f)}`);
}
const allTemplateText = hbsFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
for (const f of hbsFiles.filter((f) => f.includes('partials'))) {
  const name = path.relative(path.join(OUT, 'partials'), f).replace(/\.hbs$/, '');
  if (!allTemplateText.includes(`{{> "${name}"}}`)) leaks.push(`orphan partial: ${name}`);
}
// AD-5 rule 2, as literally stated
const tripleOpen = [], tripleClose = [];
for (const f of hbsFiles) {
  const s = fs.readFileSync(f, 'utf8'); const rel = path.relative(OUT, f);
  for (const m of s.match(/\{\{\{/g) || []) tripleOpen.push(rel);
  for (const m of s.match(/\}\}\}/g) || []) tripleClose.push(rel);
}

// ---------------------------------------------------------------- FR-J17 gate proxy (MEASUREMENTS §11 shape)
const { JSDOM } = require('jsdom');
const Handlebars = require('handlebars');
let parsed = 0, walked = 0, links = 0, images = 0, headings = 0, decls = 0;
const gateFindings = [];
for (const f of hbsFiles) {
  const src = fs.readFileSync(f, 'utf8');
  try { Handlebars.precompile(src); parsed++; }
  catch (e) { gateFindings.push(`${path.relative(OUT, f)}: ${e.message.split('\n')[0]}`); }
  const doc = new JSDOM(`<body>${src.replace(/\{\{[^}]*\}\}/g, 'X')}</body>`).window.document;
  const els = doc.body.querySelectorAll('*'); walked += els.length;
  for (const el of els) {
    for (const a of el.attributes) if (/^on/i.test(a.name)) gateFindings.push(`inline handler ${a.name} in ${path.relative(OUT, f)}`);
    if (el.tagName === 'A') { links++; if (!el.textContent.trim() && !el.getAttribute('aria-label')) gateFindings.push(`link without an accessible name in ${path.relative(OUT, f)}`); }
    if (el.tagName === 'IMG') { images++; if (el.getAttribute('alt') == null) gateFindings.push(`img without alt in ${path.relative(OUT, f)}`); }
    if (/^H[1-6]$/.test(el.tagName)) headings++;
  }
}
for (const c of ['assets/css/screen.css', 'assets/css/cards.css'])
  decls += (fs.readFileSync(path.join(OUT, c), 'utf8').match(/[^;{}]+:[^;{}]+;/g) || []).length;
const gateMs = ms(tGate);
mark();

// ---------------------------------------------------------------- zip
const tZip = process.hrtime.bigint();
const zipPath = path.join(__dirname, 'theme.zip');
fs.rmSync(zipPath, { force: true });
execFileSync('zip', ['-qr', zipPath, '.'], { cwd: OUT });
const zipMs = ms(tZip);
mark();

const du = walk(OUT).reduce((a, f) => a + fs.statSync(f).size, 0);
const totalMs = ms(t0);

// ---------------------------------------------------------------- report
const MB = (b) => (b / 1048576).toFixed(2);
console.log(`
=== tools/stress — AD-11 budget, realistic sections ===
node ${process.version}   files ${allFiles.length}   sections ${sectionCount} over ${TEMPLATES.length} templates
theme ${MB(du)} MB uncompressed   ${MB(fs.statSync(zipPath).size)} MB zipped

| stage                                   | wall |
| --------------------------------------- | ---- |
| render + serialize (${String(sectionCount).padStart(2)} sections)        | ${renderMs.toFixed(0).padStart(5)} ms  (${(renderMs / sectionCount).toFixed(1)} ms/section)
| assemble the rest of the tree           | ${assembleMs.toFixed(0).padStart(5)} ms
| substitute user text over the tree      | ${subMs.toFixed(0).padStart(5)} ms
| FR-J17 quality gate + leak assertions   | ${gateMs.toFixed(0).padStart(5)} ms
| zip                                     | ${zipMs.toFixed(0).padStart(5)} ms
| TOTAL (before gscan)                    | ${totalMs.toFixed(0).padStart(5)} ms
peak RSS ${peak} MB

FR-J17 proxy: ${parsed}/${hbsFiles.length} .hbs parsed · ${walked} elements walked · ${links} links / ${images} images / ${headings} headings · ${decls} CSS declarations
AD-34 leak assertions: ${leaks.length === 0 ? 'clean' : leaks.length + ' LEAK(S)'}`);
for (const l of leaks.slice(0, 10)) console.log('   !', l);
if (gateFindings.length) { console.log(`FR-J17 findings: ${gateFindings.length}`); for (const g of gateFindings.slice(0, 8)) console.log('   !', g); }
console.log(`AD-5 rule 2 ("zero {{{ and zero }}} in the emitted theme"): {{{ x${tripleOpen.length} in ${[...new Set(tripleOpen)].join(', ') || '-'} · }}} x${tripleClose.length} in ${[...new Set(tripleClose)].join(', ') || '-'}`);

if (!process.argv.includes('--keep')) console.log(`\ntheme/ kept at ${OUT} — run:  node gate.js theme`);
