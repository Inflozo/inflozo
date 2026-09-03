/* Inflozo walkthrough — the mock interaction layer.
   Step 5c. Nothing here talks to anything: it moves classes and attributes around so the
   lifted frames behave the way EXPERIENCE.md says the product behaves. Plain script, no
   modules, no fetch — it has to run from a double-click on file://.

   Everything is delegated off <body>, so markup generated later needs no wiring. The hooks
   are the ones build-app.py attaches at lift time and nothing else:
     [data-open=id]      raises overlay #id            [data-close]        closes the nearest overlay
     [data-pick=g]       an option of pick group g     [data-picked]       the option the frame drew selected
     [data-goto=n]       a wizard step jump            [data-run=n]        progress, then step n
     [data-typed=text]   a typed confirm               body[data-keys]     page-level keys (FR-D11)
     body[data-esc=url]  Esc leaves the page           .layers             the panel L hides

   F-081: what no lifted screen carries is not here — the first cut's design ring, backup gate,
   persistence indicator, inline toolbar, pack crossfade, remix and confetti went with it. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function announce(msg) {
    var r = $('#live-polite');
    if (r) { r.textContent = ''; setTimeout(function () { r.textContent = msg; }, 30); }
  }

  /* ── overlays: menus, popovers, sheets, modals ─────────────────────────────
     EXPERIENCE.md § Accessibility Floor — "every menu, popover and sheet: focus moves in on
     open, is trapped while open, and returns to the invoking control on close" (F-024). */
  var invokers = {};

  function name(el) {
    var h = el.querySelector('h1, h2, h3, h4');
    var t = (h ? h.textContent : el.textContent).trim().replace(/\s+/g, ' ');
    return t.slice(0, 80);
  }

  function open(id, invoker) {
    var el = document.getElementById(id);
    if (!el || el.classList.contains('is-open')) return;
    invokers[id] = invoker || null;
    if (!el.hasAttribute('role')) {
      el.setAttribute('role', el.classList.contains('menu-lifted') ? 'menu' : 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', name(el));
    }
    el.classList.add('is-open');
    document.body.classList.add('has-overlay');
    if (invoker) invoker.setAttribute('aria-expanded', 'true');
    // link() wraps drawn elements in display:contents anchors, which have no box and take no focus —
    // the first focusable WITH a box is the one that can (F-025)
    var f = $$('[autofocus], ' + FOCUSABLE, el).filter(function (x) { return x.offsetWidth || x.offsetHeight; })[0] || el;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { f.focus(); } catch (e) {}
  }

  function close(el) {
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    if (!$('.overlay.is-open')) document.body.classList.remove('has-overlay');
    var inv = invokers[el.id];
    if (inv) { inv.setAttribute('aria-expanded', 'false'); try { inv.focus(); } catch (e) {} }
    invokers[el.id] = null;
  }

  function closeTop() {
    var opened = $$('.overlay.is-open');
    if (opened.length) close(opened[opened.length - 1]);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;

    var opener = t.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      var el = document.getElementById(opener.getAttribute('data-open'));
      if (el && el.classList.contains('is-open')) { close(el); return; }   // a menu button toggles its own menu
      $$('.overlay.menu-lifted.is-open').forEach(close);
      open(opener.getAttribute('data-open'), opener);
      return;
    }
    if (t.closest('[data-close]')) {
      e.preventDefault();
      close(t.closest('.overlay'));
      return;
    }
    // the scrim of a sheet, or anywhere outside an open menu, closes it (F-026)
    if (t.classList.contains('overlay') && t.classList.contains('sheet-lifted')) { close(t); return; }
    if (!t.closest('.overlay.menu-lifted')) $$('.overlay.menu-lifted.is-open').forEach(close);

    // F-047: the frames' own href="#" anchors are drawn affordances with no destination — never a jump to top
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ── the keyboard half of what trigger() / link() attach (F-023, F-025) ──── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target;
    if (!el.closest || typing(el)) return;
    if (el.matches('[role="button"], [data-open], [data-close], [data-goto], [data-run]') && el.tagName !== 'BUTTON') {
      e.preventDefault(); el.click(); return;
    }
    if (el.matches('[role="link"]') && e.key === 'Enter') {
      var a = el.closest('a[href]');
      if (a) { e.preventDefault(); window.location.href = a.getAttribute('href'); }
    }
  });

  /* ── the focus trap: Tab inside an open overlay wraps between its ends ─── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var opened = $$('.overlay.is-open');
    if (!opened.length) return;
    var top = opened[opened.length - 1];
    var f = $$(FOCUSABLE, top).filter(function (x) { return x.offsetWidth || x.offsetHeight; });
    if (!f.length) { e.preventDefault(); top.focus(); return; }
    var first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (!top.contains(cur)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
  });

  /* ── typed confirms: only where the action is irreversible and account-wide ─ */
  function syncTyped(f) {
    var btn = document.querySelector(f.getAttribute('data-typed-target'));
    if (!btn) return;
    var ok = f.value.trim() === f.getAttribute('data-typed');
    btn.classList.toggle('off', !ok);
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }
  document.addEventListener('input', function (e) {
    var f = e.target.closest && e.target.closest('[data-typed]');
    if (f) syncTyped(f);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[aria-disabled="true"]');
    if (b) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ── the deploy wizard: one surface, several drawn steps ───────────────────
     F-054: a step change is announced from the step's own title and focus moves to the step. */
  function gotoStep(n, silent) {
    var wiz = $('[data-wizard]');
    if (!wiz) return;
    $$('.overlay.is-open').forEach(close);
    var shown = null;
    $$('[data-step]', wiz).forEach(function (s) {
      s.hidden = parseInt(s.getAttribute('data-step'), 10) !== n;
      if (!s.hidden) shown = s;
    });
    wiz.setAttribute('data-at', n);
    window.scrollTo(0, 0);
    if (shown && !silent) { announce(shown.getAttribute('data-step-title') || ''); try { shown.focus(); } catch (e) {} }
  }
  window.gotoStep = gotoStep;
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('[data-goto]');
    if (!g) return;
    e.preventDefault();
    gotoStep(parseInt(g.getAttribute('data-goto'), 10));
  });

  /* ── shipping takes long enough to read (F-033) ────────────────────────────
     [data-run=n]: go to data-goto-first, raise the gate overlay if there is one (F1's snapshot
     gate), then announce each [data-progress-step] with a dwell, then step n. */
  document.addEventListener('click', function (e) {
    var r = e.target.closest && e.target.closest('[data-run]');
    if (!r) return;
    e.preventDefault();
    var next = parseInt(r.getAttribute('data-run'), 10);
    var host = document.getElementById(r.getAttribute('data-run-host') || '');
    gotoStep(parseInt(r.getAttribute('data-goto-first') || next, 10));
    var gate = r.getAttribute('data-run-gate');
    var steps = host ? $$('[data-progress-step]', host) : [];
    var i = 0;
    function tick() {
      if (i >= steps.length) { setTimeout(function () { gotoStep(next); }, 600); return; }
      announce(steps[i].getAttribute('data-progress-step'));
      i++;
      setTimeout(tick, 900);
    }
    if (gate && document.getElementById(gate)) {
      open(gate, null);
      setTimeout(function () { close(document.getElementById(gate)); tick(); }, 2400);
    } else {
      tick();
    }
  });

  /* ── FR-D11's shortcut map, and the WCAG 2.1.4 rule that makes it legal ────
     Every single-character shortcut is live ONLY while the editor shell holds
     focus, and NEVER while a text field or a contenteditable has it. Without
     that rule a speech-input user saying a word near the canvas fires Preview
     Mode. Cmd-modified shortcuts are unaffected. Page-level keys are declared on
     <body data-keys="]:next.html,[:prev.html,p:preview.html"> (F-022, F-014). */
  function typing(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    var t = (el.tagName || '').toLowerCase();
    return t === 'input' || t === 'textarea' || t === 'select';
  }

  function keyMap() {
    var m = {}, spec = document.body.getAttribute('data-keys') || '';
    spec.split(',').forEach(function (pair) {
      var i = pair.indexOf(':');
      if (i > 0) m[pair.slice(0, i).trim().toLowerCase()] = pair.slice(i + 1).trim();
    });
    return m;
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var inText = typing(document.activeElement);

    if (e.key === 'Escape') {
      // Esc steps outward, one level per press
      if ($('.overlay.is-open')) { closeTop(); return; }
      var back = document.body.getAttribute('data-esc');
      if (back && !inText) window.location.href = back;
      return;
    }

    if (inText) return;                      // <- WCAG 2.1.4, and it is the whole rule
    if (!document.body.hasAttribute('data-editor-shell')) return;

    var k = e.key.toLowerCase();
    if (k === 'l') {
      document.body.classList.toggle('layers-hidden');
      announce(document.body.classList.contains('layers-hidden') ? 'Layers hidden' : 'Layers shown');
      e.preventDefault(); return;
    }
    var to = keyMap()[k];
    if (to) { e.preventDefault(); window.location.href = to; }
  });

  /* ── picking, in the frame's own idiom ─────────────────────────────────────
     A lifted control has its selected look in an INLINE style and no class to hook,
     because the export draws one state per element. So picking works by swapping that
     inline style between siblings: the option the frame drew as selected carries
     `data-picked`, and its style becomes the group's "on" look. Nothing is guessed —
     the selected appearance is the one that was drawn. */
  var PICKED = {};

  function initPicks() {
    $$('[data-picked]').forEach(function (el) {
      var g = el.getAttribute('data-pick');
      if (!g || PICKED[g]) return;
      PICKED[g] = { on: el.getAttribute('style') || '', el: el };
      var sib = $$('[data-pick="' + g + '"]').filter(function (x) { return !x.hasAttribute('data-picked'); })[0];
      PICKED[g].off = sib ? (sib.getAttribute('style') || '') : '';
    });
  }

  function pickOpt(opt) {
    var g = opt.getAttribute('data-pick'), state = PICKED[g];
    if (!state || opt === state.el) return;
    var attr = state.el.hasAttribute('aria-checked') ? 'aria-checked' : 'aria-selected';
    state.el.setAttribute('style', state.off);
    state.el.setAttribute(attr, 'false'); state.el.setAttribute('tabindex', '-1');
    opt.setAttribute('style', state.on);
    opt.setAttribute(attr, 'true'); opt.setAttribute('tabindex', '0');
    state.el = opt;
    var label = (opt.textContent || '').trim().slice(0, 60);
    if (label) announce(label + ' selected');
  }

  document.addEventListener('click', function (e) {
    var opt = e.target.closest && e.target.closest('[data-pick]');
    if (opt) pickOpt(opt);
  });
  // arrow keys move within a pick group, as a tab list or radio group does
  document.addEventListener('keydown', function (e) {
    var opt = e.target.closest && e.target.closest('[data-pick]');
    if (!opt || ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) < 0) return;
    var all = $$('[data-pick="' + opt.getAttribute('data-pick') + '"]');
    var i = all.indexOf(opt) + ((e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1);
    var nxt = all[(i + all.length) % all.length];
    e.preventDefault(); pickOpt(nxt); nxt.focus();
  });

  /* ── style-hover / style-focus, as the export writes them ──────────────────
     The frames carry their hover and focus states as `style-hover="…"` attributes,
     which the export's own runtime applies. Screens here are LIFTED from those
     frames verbatim, so the same attribute has to mean the same thing — otherwise a
     lifted screen is the drawing with its interactions quietly removed. */
  function applyInline(el, css, store) {
    var prev = {};
    css.split(';').forEach(function (d) {
      var i = d.indexOf(':');
      if (i < 0) return;
      var k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (!k) return;
      prev[k] = el.style.getPropertyValue(k);
      el.style.setProperty(k, v, 'important');
    });
    el[store] = prev;
  }

  function restoreInline(el, store) {
    var prev = el[store];
    if (!prev) return;
    Object.keys(prev).forEach(function (k) {
      if (prev[k]) el.style.setProperty(k, prev[k]);
      else el.style.removeProperty(k);
    });
    el[store] = null;
  }

  ['mouseover', 'mouseout', 'focusin', 'focusout'].forEach(function (type) {
    var enter = type === 'mouseover' || type === 'focusin';
    var a = (type[0] === 'm') ? 'style-hover' : 'style-focus';
    var store = (type[0] === 'm') ? '_h' : '_f';
    document.addEventListener(type, function (e) {
      var el = e.target.closest ? e.target.closest('[' + a + ']') : null;
      if (!el) return;
      if (enter) applyInline(el, el.getAttribute(a), store);
      else restoreInline(el, store);
    }, true);
  });

  /* ── boot ──────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('#live-polite')) {
      var r = document.createElement('div');
      r.id = 'live-polite';
      r.setAttribute('aria-live', 'polite');
      r.className = 'sr-only';
      document.body.appendChild(r);
    }
    initPicks();
    $$('[data-typed]').forEach(syncTyped);
    var wiz = $('[data-wizard]');
    if (wiz) gotoStep(parseInt(wiz.getAttribute('data-at') || '1', 10), true);
  });
})();
