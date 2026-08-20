// Inflozo compiler spike — option D.
// One annotated-HTML source, two renderers. Handlebars is generated, never parsed.
const { JSDOM } = require('jsdom');

// Handlebars text can't survive HTML serialization intact (attr values escape quotes,
// text nodes escape < >). So we emit opaque ASCII tokens and swap them back afterwards.
class Tokens {
  constructor() { this.map = []; }
  put(expr) { const t = `__HBS_${this.map.length}__`; this.map.push([t, expr]); return t; }
  resolve(html) {
    let out = html.replace(/<!--(__HBS_\d+__)-->/g, '$1');  // unwrap ours; author comments are left alone
    for (const [t, expr] of this.map) out = out.split(t).join(expr);
    return out;
  }
}

const splitFirst = (s, ch) => { const i = s.indexOf(ch); return i === -1 ? [s, undefined] : [s.slice(0, i), s.slice(i + 1)]; };
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

// data-bind="published_at|date:D MMM YYYY"  ->  {{date published_at format="D MMM YYYY"}}
function bindExpr(spec) {
  const [path, helper] = splitFirst(spec, '|');
  if (!helper) return `{{${path}}}`;
  const [name, arg] = splitFirst(helper, ':');
  if (name === 'img_url') return `{{img_url ${path} size="${arg}"}}`;
  if (name === 'date') return `{{date ${path} format="${arg}"}}`;
  throw new Error(`unknown helper: ${name}`);
}

function bindValue(spec, ctx) {
  const [path, helper] = splitFirst(spec, '|');
  const raw = get(ctx, path);
  if (!helper || raw == null) return raw;
  const [name, arg] = splitFirst(helper, ':');
  if (name === 'img_url') { const w = { s: 300, m: 600, l: 1200 }[arg]; return raw.replace('/content/images/', `/content/images/size/w${w}/`); }
  if (name === 'date') return new Date(raw).toISOString().slice(0, 10);
  return raw;
}

// User content is data, never code: a headline containing {{...}} must render literally.
//
// CORRECTED 2026-08-20 (Round 3, decision D2). This was
//     const escapeHbs = (s) => String(s).replace(/\{\{/g, '\\{{');
// which is the backslash rule MEASUREMENTS.md §3 refuted and AD-5 replaced. It is
// inert for exactly one input shape and live for the rest: a user typing
// `C:\{{@site.title}}` shipped `C:\\{{@site.title}}`, which Handlebars reads as an
// escaped backslash followed by a LIVE expression, and the site's own title
// appeared inside the user's headline. `C:\{{#if x}}y{{/if}}` produced a theme that
// would not compile at all. test.js asserted only the one shape that worked, so
// this shipped through two stress-test rounds printing "16 checks passed".
//
// AD-5: escape by HTML numeric entity. Handlebars never sees a mustache; the
// browser decodes the exact characters back.
const escapeUserText = (s) => String(s)
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')   // strip anything marker-shaped
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

// AD-4: the theme renderer must never put escaped user text into a DOM. The HTML
// parser decodes `&#123;` straight back to `{` on assignment and the serializer
// never re-escapes it, so a DOM round trip re-creates the live mustache. User text
// therefore goes in as an opaque marker and is substituted into the serialized
// STRING, last, across the template and every emitted partial (R2-5).
const U0 = String.fromCharCode(3), U1 = String.fromCharCode(4);
class UserText {
  constructor() { this.map = []; }
  put(value) { const m = `${U0}${this.map.length}${U1}`; this.map.push(value); return m; }
  // ONE regex pass. A loop of per-marker replaces re-scans its own output, so a
  // user who types slot 0's marker shape inside slot 3's text ships it raw.
  substitute(text) {
    return text.replace(new RegExp(`${U0}(\\d+)${U1}`, 'g'),
      (m, i) => (this.map[+i] === undefined ? m : escapeUserText(this.map[+i])));
  }
}

function parse(src) {
  const dom = new JSDOM(`<body>${src}</body>`);
  return { doc: dom.window.document, root: dom.window.document.body };
}

function serialize(root, tokens) {
  return tokens.resolve(root.innerHTML).replace(/^\s*[\r\n]/gm, '').trim();
}

// ---------- renderer 1: canvas ----------
function renderCanvas(src, content, ghost) {
  const { root } = parse(src);
  for (const el of [...root.querySelectorAll('[data-repeat]')]) {
    const list = (ghost[el.getAttribute('data-repeat')] || []).slice(0, +el.getAttribute('data-repeat-limit') || undefined);
    const parent = el.parentNode;
    for (const item of list) {
      const clone = el.cloneNode(true);
      applyBindings(clone, item);
      ['data-repeat', 'data-repeat-limit', 'data-partial'].forEach((a) => clone.removeAttribute(a));
      parent.insertBefore(clone, el);
    }
    el.remove();
  }
  applyProps(root, content, { users: null });
  return serialize(root, new Tokens());
}

function applyBindings(scope, ctx) {
  for (const el of [...scope.querySelectorAll('[data-bind]'), ...(scope.hasAttribute('data-bind') ? [scope] : [])]) {
    const v = bindValue(el.getAttribute('data-bind'), ctx);
    if (v == null && el.getAttribute('data-empty') === 'hide') { el.remove(); continue; }
    el.textContent = v == null ? '' : v;
    el.removeAttribute('data-bind'); el.removeAttribute('data-empty');
  }
  for (const el of [...scope.querySelectorAll('[data-bind-attr]')]) {
    const [attr, spec] = splitFirst(el.getAttribute('data-bind-attr'), ':');
    const v = bindValue(spec, ctx);
    if (v == null && el.getAttribute('data-empty') === 'hide') { el.remove(); continue; }
    el.setAttribute(attr, v == null ? '' : v);
    el.removeAttribute('data-bind-attr'); el.removeAttribute('data-empty');
  }
}

// `users` is null on the canvas path (the user must see their own literal text)
// and a UserText instance on the theme path.
function applyProps(scope, content, { users }) {
  for (const el of [...scope.querySelectorAll('[data-prop]')]) {
    const v = get(content, el.getAttribute('data-prop'));
    el.textContent = v == null ? el.textContent : (users ? users.put(v) : v);
    el.removeAttribute('data-prop'); el.removeAttribute('data-empty');
  }
  for (const el of [...scope.querySelectorAll('[data-prop-attr]')]) {
    const [attr, path] = splitFirst(el.getAttribute('data-prop-attr'), ':');
    const v = get(content, path);
    if (v != null) el.setAttribute(attr, users ? users.put(v) : v);
    el.removeAttribute('data-prop-attr');
  }
}

// ---------- renderer 2: theme (.hbs) ----------
function renderTheme(src, content, name) {
  const { doc, root } = parse(src);
  const tokens = new Tokens();
  const partials = {};

  for (const el of [...root.querySelectorAll('[data-repeat]')]) {
    const source = el.getAttribute('data-repeat');
    const limit = el.getAttribute('data-repeat-limit');
    const partialName = el.getAttribute('data-partial');
    ['data-repeat', 'data-repeat-limit', 'data-partial'].forEach((a) => el.removeAttribute(a));

    const inner = new Tokens();
    emitBindings(el, inner);
    const body = inner.resolve(el.outerHTML);

    const open = `{{#foreach ${source}${limit ? ` limit="${limit}"` : ''}}}`;
    let replacement;
    if (partialName) {
      partials[partialName] = body;
      replacement = `${open}\n  {{> "${partialName}"}}\n{{/foreach}}`;
    } else {
      replacement = `${open}\n${body}\n{{/foreach}}`;
    }
    const marker = doc.createComment(tokens.put(replacement));
    el.parentNode.replaceChild(marker, el);
  }

  const users = new UserText();
  emitBindings(root, tokens);
  applyProps(root, content, { users });
  // R2-5: substitute LAST, over the template AND every emitted partial. Running it
  // over the template alone ships a raw marker in the partial with the text absent.
  const template = users.substitute(serialize(root, tokens));
  for (const k of Object.keys(partials)) partials[k] = users.substitute(partials[k]);
  return { template, partials, name };
}

function emitBindings(scope, tokens) {
  const all = (sel) => [...scope.querySelectorAll(sel), ...(scope.matches?.(sel) ? [scope] : [])];
  for (const el of all('[data-bind]')) {
    const expr = bindExpr(el.getAttribute('data-bind'));
    const guard = el.getAttribute('data-empty');
    el.textContent = tokens.put(expr);
    el.removeAttribute('data-bind'); el.removeAttribute('data-empty');
    if (guard === 'hide') wrapGuard(el, expr, tokens);
  }
  for (const el of all('[data-bind-attr]')) {
    const [attr, spec] = splitFirst(el.getAttribute('data-bind-attr'), ':');
    const expr = bindExpr(spec);
    const guard = el.getAttribute('data-empty');
    el.setAttribute(attr, tokens.put(expr));
    el.removeAttribute('data-bind-attr'); el.removeAttribute('data-empty');
    if (guard === 'hide') wrapGuard(el, spec.split('|')[0], tokens);
  }
}

// FR-H8: media guards wrap the ELEMENT, never the attribute.
function wrapGuard(el, expr, tokens) {
  const field = expr.replace(/^\{\{|\}\}$/g, '').split(' ').pop().replace(/"/g, '');
  const doc = el.ownerDocument;
  el.parentNode.insertBefore(doc.createComment(tokens.put(`{{#if ${field}}}`)), el);
  el.parentNode.insertBefore(doc.createComment(tokens.put(`{{/if}}`)), el.nextSibling);
}

module.exports = { renderCanvas, renderTheme, escapeUserText };
