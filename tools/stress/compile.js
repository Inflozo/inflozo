// tools/stress/compile.js — the compile pipeline AS DECIDED, for measurement.
// Differs from prds/.../spike-compiler/compile.js in four ways, each a decision
// that landed after the spike was written:
//   AD-5   user braces escape as HTML numeric entities, never as backslashes
//   AD-4   the theme renderer splices user text into the STRING, never innerHTML
//   R2-5   user-text substitution is the LAST stage, over the whole emitted file tree
//   R2-7   the compiler's own token uses C0 control characters, which a section
//          author's index.html cannot carry as text — so a design containing
//          `<!--__HBS_0__-->` is inert instead of duplicating a {{#foreach}} block
//   R1 d7  nested repeats are processed deepest-first, so no inner data-repeat leaks
const { JSDOM } = require('jsdom');

const T0 = String.fromCharCode(1), T1 = String.fromCharCode(2);  // R2-7 token delimiters
const U0 = String.fromCharCode(3), U1 = String.fromCharCode(4);  // user-text markers

class Tokens {
  constructor() { this.map = []; }
  put(expr) { const t = `${T0}${this.map.length}${T1}`; this.map.push([t, expr]); return t; }
  resolve(html) {
    // unwrap OUR comment-wrapped markers first (spike finding), then substitute
    let out = html.replace(new RegExp(`<!--(${T0}\\d+${T1})-->`, 'g'), '$1');
    // REVERSE insertion order, and it is load-bearing once repeats nest. Repeats are
    // processed deepest-first, so an inner repeat's tokens are inserted BEFORE the
    // outer replacement that will carry them into the string. Forward order (what the
    // spike does) substitutes the inner tokens before they exist and ships them raw.
    for (let i = this.map.length - 1; i >= 0; i--) {
      const [t, expr] = this.map[i];
      out = out.split(t).join(expr);
    }
    // an inner replacement can itself re-introduce a comment-wrapped marker
    out = out.replace(new RegExp(`<!--(${T0}\\d+${T1})-->`, 'g'), '$1');
    return out;
  }
}

class UserText {
  constructor() { this.map = []; }
  put(value) { const m = `${U0}${this.map.length}${U1}`; this.map.push([m, value]); return m; }
  // AD-5: & first, then every brace the user typed becomes a numeric entity.
  static esc(s) {
    return String(s)
      // R1 decision 6 says the marker shape is one "escaped user text can never
      // contain". That is only true if the escaper actually removes it. C0 control
      // characters are not escapable HTML, so they must be dropped, not encoded --
      // otherwise a paste carrying them lands in the emitted file looking like a marker.
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
  }
  // R2-5: runs LAST, over every emitted file — template and every partial.
  // ONE regex pass, never a loop of per-marker replaces. A sequential loop re-scans
  // its own output: a user who types the marker shape for slot 0 inside the text of
  // slot 3 gets that shape written into the file AFTER slot 0 was already processed,
  // and it ships raw. Escaping cannot save this — the marker is not made of escapable
  // characters. Single-pass replacement never revisits what it just wrote.
  substitute(text) {
    const re = new RegExp(`${U0}(\\d+)${U1}`, 'g');
    return text.replace(re, (m, i) => {
      const e = this.map[+i];
      return e ? UserText.esc(e[1]) : m;
    });
  }
}

const splitFirst = (s, ch) => { const i = s.indexOf(ch); return i === -1 ? [s, undefined] : [s.slice(0, i), s.slice(i + 1)]; };
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

function bindExpr(spec) {
  const [path, helper] = splitFirst(spec, '|');
  if (!helper) return `{{${path}}}`;
  const [name, arg] = splitFirst(helper, ':');
  if (name === 'img_url') return `{{img_url ${path} size="${arg}"}}`;
  if (name === 'date') return `{{date ${path} format="${arg}"}}`;
  throw new Error(`unknown helper: ${name}`);
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

function applyProps(scope, content, users) {
  const all = (sel) => [...scope.querySelectorAll(sel), ...(scope.matches?.(sel) ? [scope] : [])];
  for (const el of all('[data-prop]')) {
    const v = get(content, el.getAttribute('data-prop'));
    el.textContent = v == null ? el.textContent : users.put(v);   // a marker, never markup
    el.removeAttribute('data-prop'); el.removeAttribute('data-empty');
  }
  for (const a of ['data-prop-attr', 'data-prop-attr2']) {
    for (const el of all(`[${a}]`)) {
      const [attr, path] = splitFirst(el.getAttribute(a), ':');
      const v = get(content, path);
      if (v != null) el.setAttribute(attr, users.put(v));
      el.removeAttribute(a);
    }
  }
  for (const el of all('[data-module]')) el.removeAttribute('data-module');
}

const depth = (el) => { let d = 0; for (let p = el; p; p = p.parentElement) d++; return d; };

// Render one annotated section into .hbs text plus its partials. One Tokens
// instance per section, so a nested partial body resolves in the same pass.
function renderSection(src, content, users) {
  const dom = new JSDOM(`<body>${src}</body>`);
  const doc = dom.window.document, root = doc.body;
  const tokens = new Tokens();
  const partials = {};

  // R1 decision 7 part B: deepest-first. Outer-first lifts the parent out of the
  // tree with the inner data-repeat attribute still on it, and it ships verbatim.
  const repeats = [...root.querySelectorAll('[data-repeat]')].sort((a, b) => depth(b) - depth(a));
  for (const el of repeats) {
    if (!el.isConnected) continue;
    const source = el.getAttribute('data-repeat');
    const limit = el.getAttribute('data-repeat-limit');
    const partialName = el.getAttribute('data-partial');
    ['data-repeat', 'data-repeat-limit', 'data-partial'].forEach((a) => el.removeAttribute(a));
    emitBindings(el, tokens);
    applyProps(el, content, users);
    const body = el.outerHTML;
    const open = `{{#foreach ${source}${limit ? ` limit="${limit}"` : ''}}}`;
    let replacement;
    if (partialName) { partials[partialName] = body; replacement = `${open}\n  {{> "${partialName}"}}\n{{/foreach}}`; }
    else { replacement = `${open}\n${body}\n{{/foreach}}`; }
    el.parentNode.replaceChild(doc.createComment(tokens.put(replacement)), el);
  }

  emitBindings(root, tokens);
  applyProps(root, content, users);

  // AD-4 / AD-5: serialize FIRST, then resolve into the string. No document ever
  // parses the result, so numeric entities cannot be decoded back into live braces.
  const template = tokens.resolve(root.innerHTML).replace(/^\s*[\r\n]/gm, '').trim();
  const out = {};
  for (const [k, v] of Object.entries(partials)) out[k] = tokens.resolve(v);
  return { template, partials: out };
}

module.exports = { renderSection, Tokens, UserText, T0, T1, U0, U1 };
