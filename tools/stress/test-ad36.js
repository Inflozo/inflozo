// tools/stress/test-ad36.js — AD-36's four vectors, as a runnable check.
//
// Each of these was EXECUTED against this pipeline in Round 4 and worked. They are the regression
// test for the one invariant they share: an untrusted value never reaches an interpreting sink
// un-validated. Run:  node test-ad36.js
const assert = require('assert');
const { renderSection, UserText, safeUrl, bindExpr, assertBindableAttr } = require('./compile.js');

// render the way a real compile does: renderSection, then R2-5's substitution pass over the output
function compile(src, content) {
  const users = new UserText();
  const r = renderSection(src, content || {}, users);
  return users.substitute(r.template);
}
const threw = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };
let n = 0;
const ok = (label) => { n++; console.log('  ok  ' + label); };

console.log('AD-36 — untrusted value into an interpreting sink\n');

// ── (1) a user-supplied URL reaches href with no scheme validation ───────────────
// Round 4:  content.link='javascript:alert(document.domain)' -> <a href="javascript:...">
{
  const out = compile('<a data-prop-attr="href:link">x</a>', { link: 'javascript:alert(document.domain)' });
  assert(!/href="javascript:/i.test(out), 'javascript: reached href: ' + out);
  assert(/href="#"/.test(out), 'expected the inert # fallback, got: ' + out);
  ok('javascript: in a user link is neutralised');

  for (const [bad, why] of [
    ['data:text/html,<script>alert(1)</scr' + 'ipt>', 'data: document'],
    ['vbscript:msgbox(1)', 'vbscript:'],
    ['JaVaScRiPt:alert(1)', 'mixed case'],
    ['java\nscript:alert(1)', 'newline inside the scheme'],
    ['javascript:alert(1)', 'leading control character'],
    ['  javascript:alert(1)', 'leading whitespace'],
  ]) {
    assert.strictEqual(safeUrl(bad), '#', `${why} survived: ${JSON.stringify(safeUrl(bad))}`);
  }
  ok('data:, vbscript:, case, control-char and whitespace evasions all neutralised');

  // ...and the fix must not break legitimate links. A guard that blocks everything is not a guard.
  for (const good of ['https://ok.example/a?b=1#c', 'http://ok.example', 'mailto:a@b.example',
                      '/about', '#top', 'img/x.png', 'tel:+441234567890']) {
    assert.strictEqual(safeUrl(good), good, `legitimate URL was mangled: ${good}`);
  }
  const rel = compile('<a data-prop-attr="href:link">x</a>', { link: '/about' });
  assert(/href="\/about"/.test(rel), 'relative link broken: ' + rel);
  ok('ordinary and relative links are untouched');
}

// ── (2) a design author breaks out of a helper argument into raw theme text ──────
// Round 4:  size:800"}}<script>alert(1)</script>{{"  ->  a live <script> in the emitted .hbs
{
  const attack = 'src:featureImage|img_url:800"}}<script>alert(1)</scr' + 'ipt>{{"';
  const msg = threw(() => compile(`<img data-bind-attr='${attack}'>`));
  assert(msg && /AD-36/.test(msg), 'helper-arg breakout was NOT refused; got: ' + msg);
  ok('a crafted helper argument is refused at compile time');

  assert(threw(() => bindExpr('a|img_url:8"x')), 'a quote in the arg must be refused');
  assert(threw(() => bindExpr('a}}{{b')), 'a path containing braces must be refused');
  assert(threw(() => bindExpr('a|nosuch:1')), 'an unknown helper must be refused');
  ok('quote-in-arg, brace-in-path and unknown-helper are all refused');

  // the legitimate vocabulary still compiles, and to the same shape as before
  assert.strictEqual(bindExpr('featureImage|img_url:800'), '{{img_url featureImage size="800"}}');
  assert.strictEqual(bindExpr('publishedAt|date:YYYY'), '{{date publishedAt format="YYYY"}}');
  assert.strictEqual(bindExpr('post.title'), '{{post.title}}');
  ok('the legitimate binding vocabulary is unchanged');
}

// ── (3) a design may name any attribute, including an event handler ──────────────
// Round 4:  data-bind-attr="onload:featureImage"  ->  <div onload="{{featureImage}}">
{
  const msg = threw(() => compile('<div data-bind-attr="onload:featureImage">x</div>'));
  assert(msg && /AD-36/.test(msg), 'onload binding was NOT refused; got: ' + msg);
  for (const bad of ['onerror', 'onclick', 'ONLOAD', 'style', 'formaction', 'xlink:href'])
    assert(threw(() => assertBindableAttr(bad)), `${bad} must not be bindable`);
  ok('event handlers, style and formaction are not bindable');

  const good = compile('<img data-bind-attr="src:featureImage">');
  assert(/src="\{\{featureImage\}\}"/.test(good), 'legitimate attribute binding broke: ' + good);
  ok('legitimate attribute bindings still emit');
}

// ── (4) what already held, re-asserted so a future change cannot quietly undo it ──
{
  const out = compile('<p data-prop="title">x</p>',
    { title: 'Notes on {{@site.title}} and {{#if @member}}x{{/if}}' });
  assert(!/\{\{[^&]/.test(out), 'AD-5 regression: a live mustache reached the output: ' + out);
  ok('AD-5 still holds — user braces ship as entities, never as a mustache');

  const q = compile('<a data-prop-attr="href:link">x</a>', { link: 'https://ok.example/"onclick="alert(1)' });
  assert(!/onclick="alert/.test(q), 'AD-4 regression: attribute break-out: ' + q);
  ok('AD-4 still holds — a quote in a user value cannot break the attribute');
}

// ── FR-H8 — a media guard is on the BOUND FIELD, never on a helper argument ──────
// Not AD-36, but it lives in the same file because it is the same compiler and the same class of
// mistake: a value pulled back out of a built string instead of being carried through. Named as a
// known defect in build-sequence.md step 2, and still live when Round 4 checked.
{
  const g = (src) => renderSection(src, {}, new UserText()).template;

  const dated = g('<time data-bind="published_at|date:YYYY" data-empty="hide">x</time>');
  assert(/\{\{#if published_at\}\}/.test(dated), 'guard is not on the bound field: ' + dated);
  assert(!/\{\{#if format/.test(dated), 'guard was built from the helper argument: ' + dated);
  ok('a date-helper text binding guards on the field, not on "format"');

  const img = g('<img data-bind-attr="src:feature_image|img_url:800" data-empty="hide">');
  assert(/\{\{#if feature_image\}\}/.test(img), 'attribute guard regressed: ' + img);
  ok('an img_url attribute binding still guards on the field');

  const plain = g('<p data-bind="title" data-empty="hide">x</p>');
  assert(/\{\{#if title\}\}/.test(plain), 'plain guard regressed: ' + plain);
  ok('a plain field binding still guards correctly');
}

console.log(`\n${n} checks passed.`);
