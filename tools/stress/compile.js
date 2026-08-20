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

// ─────────────────────────────────────────────────────────────────────────────
// AD-36 — an untrusted value never reaches an interpreting sink un-validated.
//
// Round 4 found four separate defects that are one missing idea. In each, a value from outside was
// carefully ESCAPED and then handed to something that INTERPRETS it, and escaping is the wrong tool
// for that job. AD-5 is this same idea applied to braces and AD-4 to marks; neither generalised.
//
//   1. a user's link `javascript:alert(1)` reached href untouched -- there is no character in it
//      to escape, so every escaper passes it through intact
//   2. a design author's helper argument broke out of the mustache into raw theme text, because
//      bindExpr built Handlebars SOURCE by string concatenation
//   3. a design could bind any attribute name it liked, including `onload`
//   4. a Ghost tag colour carried extra CSS declarations onto the customer's live site
//
// The mechanism is the same in all four: PARSE, then rebuild from validated parts. Never
// interpolate an untrusted string into a syntax.
// ─────────────────────────────────────────────────────────────────────────────

// (1) URL schemes. The Conventions row promised this for GHOST-sourced values only, and lives in
//     ghost-shim. A user-typed link is equally a stranger to the visitor who clicks it, and on the
//     canvas the same value is a same-origin URL inside the owner's authenticated session -- so the
//     check belongs in the shared core, over BOTH sources.
const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;
// A value with no scheme at all is relative and therefore same-origin: '/about', '#top', 'x.png'.
// The colon test is what separates 'foo/bar:baz' (a path) from 'javascript:...' (a scheme).
function safeUrl(value) {
  const v = String(value == null ? '' : value).trim();
  // Control characters and whitespace inside a scheme are how `java\nscript:` slips past a naive
  // prefix test; strip them before deciding, and reject rather than repair.
  const probe = v.replace(/[\u0000-\u0020]/g, '').toLowerCase();
  const scheme = probe.match(/^([a-z0-9+.-]*):/);
  if (!scheme) return v;                       // relative — no scheme to abuse
  return SAFE_SCHEME.test(probe) ? v : '#';    // '#' is inert and visible; never silently dropped
}

// (2)+(3) The binding vocabulary is a grammar, not a template. Every part is validated and the
//     mustache is rebuilt from the validated parts.
// Handlebars' real path vocabulary, not a narrower invention: an optional `@` prefix (@site.logo,
// @custom.accent_colour, @member), optional `../` ascents, then dotted identifiers. Widened after
// the first run refused `@site.logo` -- a grammar that rejects the language it is parsing is a
// broken parser, not a strict one. What it still refuses is every character the breakout needed:
// braces, quotes, whitespace, backslash.
const PATH_RE   = /^(\.\.\/)*@?[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/;
const HELPERS   = {
  // arg is constrained per helper, by enum where the vocabulary is closed
  img_url: { param: 'size',   ok: (a) => /^[a-z0-9_]+$/i.test(a) },
  date:    { param: 'format', ok: (a) => /^[A-Za-z0-9 ,:/.\-]+$/.test(a) },
};
// The attributes a design may bind. An event handler is not on it, and neither is `style` --
// AD-3's carve-out emits its custom property through the stylesheet path, not through a binding.
const BINDABLE_ATTRS = new Set([
  'href', 'src', 'srcset', 'alt', 'title', 'id', 'datetime', 'value', 'poster',
  'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'width', 'height',
]);
// The subset of those whose value the browser resolves as a URL.
const URL_ATTRS = new Set(['href', 'src', 'srcset', 'poster']);

function assertBindableAttr(attr) {
  const a = String(attr).toLowerCase();
  if (!BINDABLE_ATTRS.has(a)) {
    throw new Error(`AD-36: attribute "${attr}" is not bindable. ` +
      `A design may bind only: ${[...BINDABLE_ATTRS].join(', ')}.`);
  }
  return a;
}

function bindExpr(spec) {
  const [path, helper] = splitFirst(spec, '|');
  if (!PATH_RE.test(path)) {
    throw new Error(`AD-36: "${path}" is not a valid binding path. ` +
      `A path is dotted identifiers only -- this is what stopped a crafted design emitting raw ` +
      `theme text through the mustache it was being concatenated into.`);
  }
  if (!helper) return `{{${path}}}`;
  const [name, arg] = splitFirst(helper, ':');
  const h = Object.prototype.hasOwnProperty.call(HELPERS, name) ? HELPERS[name] : null;
  if (!h) throw new Error(`AD-36: unknown helper "${name}"`);
  if (arg === undefined || !h.ok(arg)) {
    throw new Error(`AD-36: helper "${name}" got an invalid ${h.param} argument ${JSON.stringify(arg)}. ` +
      `The argument is validated, never interpolated -- a quote here used to close the parameter ` +
      `and reopen as raw theme text.`);
  }
  return `{{${name} ${path} ${h.param}="${arg}"}}`;
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
    const [rawAttr, spec] = splitFirst(el.getAttribute('data-bind-attr'), ':');
    const attr = assertBindableAttr(rawAttr);           // AD-36 (3)
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
      const [rawAttr, path] = splitFirst(el.getAttribute(a), ':');
      const attr = assertBindableAttr(rawAttr);         // AD-36 (3)
      const v = get(content, path);
      // AD-36 (1): a user-supplied URL is scheme-checked BEFORE it becomes a marker. Doing it here
      // rather than in UserText.esc is deliberate -- esc() runs over every text prop and a scheme
      // is only meaningful in a URL context, so the check belongs where the context is known.
      if (v != null) el.setAttribute(attr, users.put(URL_ATTRS.has(attr) ? safeUrl(v) : v));
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

module.exports = { renderSection, Tokens, UserText, T0, T1, U0, U1,
                   safeUrl, bindExpr, assertBindableAttr, BINDABLE_ATTRS };
