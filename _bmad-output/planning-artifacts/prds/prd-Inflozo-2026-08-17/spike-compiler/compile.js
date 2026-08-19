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
const escapeHbs = (s) => String(s).replace(/\{\{/g, '\\{{');

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
  applyProps(root, content, { canvas: true });
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

function applyProps(scope, content, { canvas }) {
  for (const el of [...scope.querySelectorAll('[data-prop]')]) {
    const v = get(content, el.getAttribute('data-prop'));
    el.textContent = v == null ? el.textContent : (canvas ? v : escapeHbs(v));
    el.removeAttribute('data-prop'); el.removeAttribute('data-empty');
  }
  for (const el of [...scope.querySelectorAll('[data-prop-attr]')]) {
    const [attr, path] = splitFirst(el.getAttribute('data-prop-attr'), ':');
    const v = get(content, path);
    if (v != null) el.setAttribute(attr, canvas ? v : escapeHbs(v));
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

  emitBindings(root, tokens);
  applyProps(root, content, { canvas: false });
  return { template: serialize(root, tokens), partials, name };
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

module.exports = { renderCanvas, renderTheme };
