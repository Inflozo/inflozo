// Assemble a real Ghost theme from compiler output, then run Ghost's own gscan on it.
const fs = require('fs'); const path = require('path');
const { renderTheme } = require('./compile');
const gscan = require('gscan');

const out = path.join(__dirname, 'theme');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'partials', 'sections', 'home'), { recursive: true });
fs.mkdirSync(path.join(out, 'assets', 'css'), { recursive: true });

const read = (f) => fs.readFileSync(path.join(__dirname, 'sections', f), 'utf8');
const hero = renderTheme(read('hero-centered.html'),
  { title: 'Notes on building things', subtitle: 'Design, code, and the occasional rant.', cta: { label: 'Read the archive', url: '/archive/' } }, 'hero');
const grid = renderTheme(read('post-grid.html'), { title: 'From the blog' }, 'latest-posts');

// section partials, named from the layer names
fs.writeFileSync(path.join(out, 'partials/sections/home/hero.hbs'), `{{!-- Hero · Centered --}}\n${hero.template}\n`);
fs.writeFileSync(path.join(out, 'partials/sections/home/latest-posts.hbs'), `{{!-- Latest Posts · 3-up grid --}}\n${grid.template}\n`);
for (const [name, body] of Object.entries(grid.partials))
  fs.writeFileSync(path.join(out, `partials/${name}.hbs`), `{{!-- Post card --}}\n${body}\n`);

// C2 decision: no engines.ghost-api (it is itself a gscan warning)
fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify({
  name: 'inflozo-spike', description: 'Compiler spike', version: '1.0.0',
  engines: { ghost: '>=6.0.0' }, license: 'MIT', keywords: ['ghost-theme'],
  author: { name: 'Inflozo', email: 'hello@inflozo.com' },
  config: { posts_per_page: 12, card_assets: true },
}, null, 2) + '\n');

fs.writeFileSync(path.join(out, 'default.hbs'), `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{meta_title}}</title>
  <link rel="stylesheet" href="{{asset "css/main.css"}}">
  {{ghost_head}}
</head>
<body class="{{body_class}}">
  <a class="skip-link" href="#main">Skip to content</a>
  <main id="main">{{{body}}}</main>
  {{ghost_foot}}
</body>
</html>
`);
fs.writeFileSync(path.join(out, 'index.hbs'), `{{!< default}}\n\n{{> "sections/home/hero"}}\n{{> "sections/home/latest-posts"}}\n`);
fs.writeFileSync(path.join(out, 'post.hbs'), `{{!< default}}\n\n{{#post}}\n<article class="post">\n  <h1 class="post__title">{{title}}</h1>\n  {{#if feature_image}}\n  <img class="post__image" src="{{img_url feature_image size="l"}}" alt="{{title}}">\n  {{/if}}\n  <section class="post__content">{{content}}</section>\n</article>\n{{/post}}\n`);
// C2 decision: page.hbs gates on @page.show_title_and_feature_image (kills GS110)
fs.writeFileSync(path.join(out, 'page.hbs'), `{{!< default}}\n\n{{#post}}\n<article class="page">\n  {{#if @page.show_title_and_feature_image}}\n  <h1 class="page__title">{{title}}</h1>\n  {{#if feature_image}}\n  <img class="page__image" src="{{img_url feature_image size="l"}}" alt="{{title}}">\n  {{/if}}\n  {{/if}}\n  <section class="page__content">{{content}}</section>\n</article>\n{{/post}}\n`);
fs.writeFileSync(path.join(out, 'assets/css/main.css'), `:root {
  --accent: #1f6feb;
  --gh-font-heading: var(--font-heading, ui-sans-serif, system-ui, sans-serif);
  --gh-font-body: var(--font-body, ui-serif, Georgia, serif);
}
body { font-family: var(--gh-font-body); }
h1, h2, h3 { font-family: var(--gh-font-heading); }
.hero { padding: 4rem 1rem; text-align: center; }
.post-card { display: block; }
.kg-width-wide { max-width: 1000px; margin-inline: auto; }
.kg-width-full { max-width: 100%; }
`);

console.log('--- generated partials/post-card.hbs ---');
console.log(fs.readFileSync(path.join(out, 'partials/post-card.hbs'), 'utf8'));
console.log('--- generated index.hbs ---');
console.log(fs.readFileSync(path.join(out, 'index.hbs'), 'utf8'));

gscan.check(out, { checkVersion: 'v6' }).then((res) => {
  const f = gscan.format(res, { checkVersion: 'v6' });
  const errs = f.results.error || [], warns = f.results.warning || [];
  console.log(`\n=== GSCAN v6 ===\nERRORS: ${errs.length}   WARNINGS: ${warns.length}`);
  for (const e of errs) console.log('  ERROR  ', e.rule?.replace(/<[^>]+>/g, ''), '|', (e.failures || []).map((x) => x.ref).join(', '));
  for (const w of warns) console.log('  WARN   ', w.rule?.replace(/<[^>]+>/g, ''), '|', (w.failures || []).map((x) => x.ref).join(', '));
  if (!errs.length && !warns.length) console.log('  clean — 0 errors, 0 warnings');
}).catch((e) => { console.error('gscan failed:', e.message); process.exit(1); });
