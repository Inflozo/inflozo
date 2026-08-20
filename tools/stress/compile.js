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
    const spec = el.getAttribute('data-bind');
    const expr = bindExpr(spec);
    const guard = el.getAttribute('data-empty');
    el.textContent = tokens.put(expr);
    el.removeAttribute('data-bind'); el.removeAttribute('data-empty');
    // the PATH, not the built expression — see wrapGuard. The attribute branch below always did
    // this correctly, which is why the defect only ever showed on a text binding.
    if (guard === 'hide') wrapGuard(el, spec.split('|')[0], tokens);
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

// FR-H8: media guards wrap the ELEMENT, never the attribute — and the guard is on the BOUND
// FIELD, never on a helper argument.
//
// This took a plain expression string and tried to parse the field back out of it with
// `.split(' ').pop()`. For a bare `{{title}}` that happened to work; for a helper it took the LAST
// token, which is the helper's argument. A `data-bind="published_at|date:YYYY"` with
// `data-empty="hide"` emitted `{{#if format=YYYY}}` — a guard on an identifier that does not
// exist, so the block NEVER renders and the content is silently and permanently gone.
//
// The fix is to stop parsing: the callers already know the field, so they pass it. [Round 4]
function wrapGuard(el, field, tokens) {
  const doc = el.ownerDocument;
  el.parentNode.insertBefore(doc.createComment(tokens.put(`{{#if ${field}}}`)), el);
  el.parentNode.insertBefore(doc.createComment(tokens.put(`{{/if}}`)), el.nextSibling);
}

// AD-1: ONE function, both emitters. `users` is a UserText on the theme path and NULL on the
// canvas path — that single parameter is the whole difference, which is what makes §7.3's
// "canvas and shipped output agree by construction" a property of the code rather than a promise.
//
// AD-4's half that reads backwards: on the canvas the value goes into a DOM, because the user must
// see their own literal text. On the theme path it becomes a marker and is spliced into the STRING
// later — never through a DOM, because an HTML parser decodes AD-5's numeric entities back into
// live braces.
function applyProps(scope, content, users) {
  const all = (sel) => [...scope.querySelectorAll(sel), ...(scope.matches?.(sel) ? [scope] : [])];
  for (const el of all('[data-prop]')) {
    const v = get(content, el.getAttribute('data-prop'));
    // canvas: the literal string into the DOM. theme: a marker, never markup.
    el.textContent = v == null ? el.textContent : (users ? users.put(v) : String(v));
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
      // It runs on BOTH emitters: on the theme a `javascript:` link is the visitor's problem, and
      // on the canvas it is a same-origin URL inside the owner's own authenticated session.
      if (v != null) {
        const safe = URL_ATTRS.has(attr) ? safeUrl(v) : v;
        el.setAttribute(attr, users ? users.put(safe) : String(safe));
      }
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

// ─────────────────────────────────────────────────────────────────────────────
// Emitter 2 — the canvas.
//
// E0(a)'s missing half. The theme emitter has been measured and attacked for four rounds; this one
// did not exist in the rebuilt pipeline, so §7.3's central claim was asserted rather than shown.
// It shares `applyProps`, `safeUrl`, `bindExpr`'s grammar and `assertBindableAttr` with the theme
// path — sharing them is the point, not an optimisation.
//
// The two emitters differ in exactly two places, and both differences are required:
//   1. a repeat EXPANDS against real Ghost rows here, and becomes {{#foreach}} there
//   2. a binding RESOLVES to a value here, and becomes a mustache there
// Everything else — the element tree, the classes, the control attributes, the stripped
// directives, the URL scheme check, the attribute allowlist — is identical, and
// `test-renderer-agreement.js` asserts that node by node.
// ─────────────────────────────────────────────────────────────────────────────

// AD-1 bans Intl, toLocale* and Date.toString/getHours because each reads the machine rather than
// the argument, which would void AD-14 the first time two machines rendered the same date. UTC
// getters are the safe form, so the formatter is written from them and is deliberately small.
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function formatDate(raw, fmt) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const p2 = (x) => String(x).padStart(2, '0');
  const map = {
    YYYY: String(d.getUTCFullYear()),
    MMMM: MONTHS[d.getUTCMonth()],
    MMM:  MONTHS[d.getUTCMonth()],
    MM:   p2(d.getUTCMonth() + 1),
    DD:   p2(d.getUTCDate()),
  };
  // longest key first, so MMMM is not eaten by MM
  return String(fmt || 'YYYY-MM-DD').replace(/YYYY|MMMM|MMM|MM|DD/g, (k) => map[k]);
}

// The canvas counterpart of bindExpr: same spec, same grammar, a value instead of a mustache.
// It re-parses through bindExpr first so an invalid spec fails identically on both emitters —
// a design that is refused by the compiler must not silently render on the canvas.
function bindValue(spec, ctx) {
  bindExpr(spec);                                   // validate: AD-36 (2), both sides
  const [path, helper] = splitFirst(spec, '|');
  const raw = get(ctx, path);
  if (raw == null) return null;
  if (!helper) return String(raw);
  const [name, arg] = splitFirst(helper, ':');
  if (name === 'date') return formatDate(raw, arg);           // the format argument is HONOURED
  if (name === 'img_url') return String(raw);                 // size is a Ghost-side concern
  return String(raw);
}

function renderCanvas(src, content, ghost) {
  const dom = new JSDOM(`<body>${src}</body>`);
  const doc = dom.window.document, root = doc.body;

  // repeats expand against real rows. Deepest-first, matching the theme path (R1 decision 7B).
  const repeats = [...root.querySelectorAll('[data-repeat]')].sort((a, b) => depth(b) - depth(a));
  for (const el of repeats) {
    if (!el.isConnected) continue;
    const limit = +el.getAttribute('data-repeat-limit') || undefined;
    const rows = (get(ghost, el.getAttribute('data-repeat')) || []).slice(0, limit);
    const parent = el.parentNode;
    for (const row of rows) {
      const clone = el.cloneNode(true);
      ['data-repeat', 'data-repeat-limit', 'data-partial'].forEach((a) => clone.removeAttribute(a));
      applyCanvasBindings(clone, row);
      applyProps(clone, content, null);
      parent.insertBefore(clone, el);
    }
    el.remove();
  }

  applyCanvasBindings(root, ghost);
  applyProps(root, content, null);
  return root.innerHTML.replace(/^\s*[\r\n]/gm, '').trim();
}

function applyCanvasBindings(scope, ctx) {
  const all = (sel) => [...scope.querySelectorAll(sel), ...(scope.matches?.(sel) ? [scope] : [])];
  for (const el of all('[data-bind]')) {
    const v = bindValue(el.getAttribute('data-bind'), ctx);
    const guard = el.getAttribute('data-empty');
    el.removeAttribute('data-bind'); el.removeAttribute('data-empty');
    // FR-H8: the guard removes the ELEMENT, which is what {{#if}} does on the other side.
    if (v == null) { if (guard === 'hide') el.remove(); continue; }
    el.textContent = v;
  }
  for (const el of all('[data-bind-attr]')) {
    const [rawAttr, spec] = splitFirst(el.getAttribute('data-bind-attr'), ':');
    const attr = assertBindableAttr(rawAttr);        // AD-36 (3), both sides
    const v = bindValue(spec, ctx);
    const guard = el.getAttribute('data-empty');
    el.removeAttribute('data-bind-attr'); el.removeAttribute('data-empty');
    if (v == null) { if (guard === 'hide') el.remove(); continue; }
    // AD-36 (1) on the canvas too: a javascript: URL here runs on Inflozo's own origin.
    el.setAttribute(attr, URL_ATTRS.has(attr) ? safeUrl(v) : v);
  }
  for (const el of all('[data-module]')) el.removeAttribute('data-module');
}

module.exports = { renderSection, renderCanvas, bindValue, formatDate,
                   Tokens, UserText, T0, T1, U0, U1,
                   safeUrl, bindExpr, assertBindableAttr, BINDABLE_ATTRS };
