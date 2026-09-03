/* Inflozo walkthrough — the mock interaction layer.
   Step 5c. Nothing here talks to anything: it moves classes around so the product
   behaves the way EXPERIENCE.md says it behaves. Plain script, no modules, no fetch —
   it has to run from a double-click on file://.

   Everything is delegated off <body>, so markup generated later needs no wiring. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── overlays: menus, popovers, sheets, modals ─────────────────────────────
     [data-open="id"] shows #id · [data-close] hides its nearest overlay ·
     Esc closes the topmost · a click outside a menu closes it. Focus moves in on
     open and returns to the invoking control on close (EXPERIENCE.md § Accessibility
     Floor — "every menu, popover and sheet"). */
  var lastInvoker = null;

  function open(id, invoker) {
    var el = document.getElementById(id);
    if (!el) return;
    lastInvoker = invoker || null;
    el.classList.add('is-open');
    document.body.classList.add('has-overlay');
    var f = el.querySelector('[autofocus], input, button, a, [tabindex]');
    if (f) { try { f.focus(); } catch (e) {} }
  }

  function close(el) {
    if (!el) return;
    el.classList.remove('is-open');
    if (!$('.overlay.is-open')) document.body.classList.remove('has-overlay');
    if (lastInvoker) { try { lastInvoker.focus(); } catch (e) {} lastInvoker = null; }
  }

  function closeTop() {
    var opened = $$('.overlay.is-open');
    if (opened.length) close(opened[opened.length - 1]);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;

    var opener = t.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      var id = opener.getAttribute('data-open');
      var el = document.getElementById(id);
      // a menu button toggles its own menu
      if (el && el.classList.contains('is-open')) { close(el); return; }
      $$('.overlay.menu.is-open').forEach(close);
      open(id, opener);
      return;
    }

    if (t.closest('[data-close]')) {
      e.preventDefault();
      close(t.closest('.overlay'));
      return;
    }

    // clicking the scrim of a sheet, or anywhere outside an open menu, closes it
    if (t.classList && t.classList.contains('overlay') && t.classList.contains('sheet-wrap')) {
      close(t); return;
    }
    if (!t.closest('.overlay.menu')) $$('.overlay.menu.is-open').forEach(close);

    /* ── segmented controls and inline radio groups ────────────────────────── */
    var seg = t.closest('.seg > *');
    if (seg && seg.parentNode.classList.contains('seg') && !seg.parentNode.closest('.greyed')) {
      $$('*', seg.parentNode).forEach(function (s) { s.classList.remove('on'); });
      seg.classList.add('on');
      var act = seg.parentNode.getAttribute('data-sets');
      if (act) setState(act, seg.getAttribute('data-value') || seg.textContent.trim());
    }

    var card = t.closest('.radiocard');
    if (card && card.parentNode) {
      $$('.radiocard', card.parentNode).forEach(function (c) {
        c.classList.remove('on');
        var r = c.querySelector('.radio'); if (r) r.classList.remove('on');
      });
      card.classList.add('on');
      var rr = card.querySelector('.radio'); if (rr) rr.classList.add('on');
    }

    /* ── toggles and checkboxes ────────────────────────────────────────────── */
    var tog = t.closest('.toggle');
    if (tog && !tog.closest('.greyed')) tog.classList.toggle('on');

    var chk = t.closest('.check, .checkrow');
    if (chk) {
      var box = chk.classList.contains('check') ? chk : chk.querySelector('.check');
      if (box && !box.hasAttribute('data-master')) {
        box.classList.toggle('on');
        box.innerHTML = box.classList.contains('on') ? '&#10003;' : '';
        if (box.hasAttribute('data-shortcut')) {
          // the `ghost backup` row ticks every row below it AND THE ROWS STAY VISIBLE
          $$('[data-backup-row] .check').forEach(function (b) {
            b.classList.toggle('on', box.classList.contains('on'));
            b.innerHTML = box.classList.contains('on') ? '&#10003;' : '';
          });
        }
        syncBackupGate();
      }
    }

    /* ── tabs ──────────────────────────────────────────────────────────────── */
    var tab = t.closest('[data-tab]');
    if (tab) {
      e.preventDefault();
      var group = tab.closest('[data-tabs]');
      var name = tab.getAttribute('data-tab');
      $$('[data-tab]', group).forEach(function (x) { x.classList.toggle('on', x === tab); });
      $$('[data-panel]', group).forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== name;
      });
    }

    /* ── generic state setter: [data-set="key:value"] ──────────────────────── */
    var setter = t.closest('[data-set]');
    if (setter) {
      var parts = setter.getAttribute('data-set').split(':');
      setState(parts[0], parts.slice(1).join(':'));
      if (setter.tagName === 'A' && setter.getAttribute('href') === '#') e.preventDefault();
    }

    /* ── the design ring: ◀ ▶ on the canvas and in the sidebar ─────────────── */
    var nav = t.closest('[data-design-nav]');
    if (nav) { e.preventDefault(); cycleDesign(parseInt(nav.getAttribute('data-design-nav'), 10)); }

    var thumb = t.closest('[data-design-index]');
    if (thumb) { e.preventDefault(); setDesign(parseInt(thumb.getAttribute('data-design-index'), 10)); }

    /* ── selecting a section on the canvas, or a row in Layers ─────────────── */
    var pick = t.closest('[data-section-pick]');
    if (pick) { select(pick.getAttribute('data-section-pick')); return; }
    var sec = t.closest('[data-section]');
    if (sec && !t.closest('a')) select(sec.getAttribute('data-section'));
    var deselect = t.closest('[data-deselect]');
    if (deselect) select(null);
  });

  /* ── body classes drive the big mode switches ──────────────────────────────
     A state is a class on <body> so CSS does the work: preview mode, dark, the
     device widths, the read-only treatments. */
  function setState(key, value) {
    var b = document.body;
    b.className = b.className.split(/\s+/).filter(function (c) {
      return c && c.indexOf(key + '-') !== 0;
    }).join(' ');
    if (value) b.classList.add(key + '-' + value);
    document.dispatchEvent(new CustomEvent('state', { detail: { key: key, value: value } }));
  }
  window.setState = setState;

  /* ── the canvas selection, and the sidebar that follows it ─────────────────
     Selection SURVIVES the chrome taking focus (EXPERIENCE.md §7.3 part 2) —
     it is cleared only by Esc, by selecting something else, or by deleting it. */
  function select(name) {
    $$('[data-section]').forEach(function (el) {
      el.classList.toggle('is-selected', !!name && el.getAttribute('data-section') === name);
    });
    $$('[data-layer]').forEach(function (el) {
      el.classList.toggle('on', !!name && el.getAttribute('data-layer') === name);
    });
    $$('[data-panel-for]').forEach(function (el) {
      el.hidden = el.getAttribute('data-panel-for') !== (name || '__none__');
    });
    var empty = $('[data-panel-empty]');
    if (empty) empty.hidden = !!name;
    announce(name ? name + ' selected' : 'Nothing selected');
  }

  /* ── the design ring ───────────────────────────────────────────────────────
     Position is always shown, `]` past the last returns to the first, and the
     canvas announces the change politely because it is the one thing a
     screen-reader user cannot see happen. */
  function setDesign(i) {
    var ring = $('[data-ring]');
    if (!ring) return;
    var names = ring.getAttribute('data-ring').split('|');
    var n = names.length;
    var idx = ((i % n) + n) % n;
    ring.setAttribute('data-current', idx);
    $$('[data-design-view]').forEach(function (el) {
      el.hidden = parseInt(el.getAttribute('data-design-view'), 10) !== idx;
    });
    $$('[data-design-count]').forEach(function (el) {
      el.textContent = (idx + 1) + ' of ' + n;
    });
    $$('[data-design-slash]').forEach(function (el) {
      el.textContent = (idx + 1) + ' / ' + n;
    });
    $$('[data-design-name]').forEach(function (el) { el.textContent = names[idx]; });
    $$('[data-design-index]').forEach(function (el) {
      el.classList.toggle('on', parseInt(el.getAttribute('data-design-index'), 10) === idx);
    });
    // The control panel is THIS DESIGN'S. A hero with no image offers no image controls,
    // and says so — the panels barely overlap, which is the model working.
    $$('[data-design-panel]').forEach(function (el) {
      el.hidden = parseInt(el.getAttribute('data-design-panel'), 10) !== idx;
    });
    announce('Design ' + (idx + 1) + ' of ' + n + ' — ' + names[idx]);
  }
  function cycleDesign(delta) {
    var ring = $('[data-ring]');
    if (!ring) return;
    setDesign(parseInt(ring.getAttribute('data-current') || '0', 10) + delta);
  }

  /* ── the polite live region ────────────────────────────────────────────────
     Canvas status, persistence and deploy progress all announce politely. */
  function announce(msg) {
    var r = $('#live-polite');
    if (r) { r.textContent = ''; setTimeout(function () { r.textContent = msg; }, 30); }
  }
  window.announce = announce;

  /* ── the backup gate: the master confirm is disabled until every row is
     covered, and the deploy button follows it. The reason line names how many
     rows remain, and the master turning on is ANNOUNCED — a button silently
     becoming available is invisible without it. */
  function syncBackupGate() {
    var rows = $$('[data-backup-row] .check');
    if (!rows.length) return;
    var left = rows.filter(function (b) { return !b.classList.contains('on'); }).length;
    var master = $('[data-master]');
    var go = $('[data-gate-go]');
    var why = $('[data-gate-reason]');
    var ready = left === 0;
    if (master) {
      master.classList.toggle('is-ready', ready);
      if (!ready && master.classList.contains('on')) {
        master.classList.remove('on'); master.innerHTML = '';
      }
    }
    var confirmed = master && master.classList.contains('on');
    if (go) go.classList.toggle('off', !confirmed);
    if (why) {
      why.textContent = confirmed ? ''
        : (ready ? 'Tick the confirmation above and this unlocks.'
                 : left + ' row' + (left === 1 ? '' : 's') + ' still to tick, or run ghost backup and tick the shortcut.');
    }
    if (ready && master && !master.hasAttribute('data-announced')) {
      master.setAttribute('data-announced', '1');
      announce('Every row is covered. The confirmation is now available.');
    }
  }
  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-master]');
    if (!m) return;
    var rows = $$('[data-backup-row] .check');
    if (rows.filter(function (b) { return !b.classList.contains('on'); }).length) return;
    m.classList.toggle('on');
    m.innerHTML = m.classList.contains('on') ? '&#10003;' : '';
    syncBackupGate();
  });

  /* ── typed confirms ────────────────────────────────────────────────────────
     Only where the action is irreversible and account-wide. */
  document.addEventListener('input', function (e) {
    var f = e.target.closest('[data-typed]');
    if (!f) return;
    var want = f.getAttribute('data-typed');
    var btn = document.querySelector(f.getAttribute('data-typed-target'));
    if (btn) btn.classList.toggle('off', f.value.trim() !== want);
  });

  /* ── the deploy wizard ─────────────────────────────────────────────────────
     One surface, six steps on the first deploy to a site and four thereafter. */
  function gotoStep(n) {
    var wiz = $('[data-wizard]');
    if (!wiz) return;
    $$('[data-step]', wiz).forEach(function (s) {
      s.hidden = parseInt(s.getAttribute('data-step'), 10) !== n;
    });
    if (n >= 10) { wiz.setAttribute('data-at', n); window.scrollTo(0, 0); return; }
    $$('[data-rail-step]', wiz).forEach(function (r) {
      var i = parseInt(r.getAttribute('data-rail-step'), 10);
      r.classList.toggle('on', i === n);
      r.classList.toggle('done', i < n);
      var num = r.querySelector('.n');
      if (num) num.innerHTML = i < n ? '&#10003;' : String(i);
    });
    wiz.setAttribute('data-at', n);
    window.scrollTo(0, 0);
    var h = $('[data-step]:not([hidden]) h2', wiz);
    if (h) announce(h.textContent);
  }
  window.gotoStep = gotoStep;
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (!g) return;
    e.preventDefault();
    gotoStep(parseInt(g.getAttribute('data-goto'), 10));
  });

  /* ── fake progress, so shipping feels like shipping ────────────────────────
     [data-run="targetStep"] fills its bars, then moves on. */
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-run]');
    if (!r) return;
    e.preventDefault();
    var next = parseInt(r.getAttribute('data-run'), 10);
    var host = document.getElementById(r.getAttribute('data-run-host') || 'ship');
    if (!host) { gotoStep(next); return; }
    gotoStep(parseInt(r.getAttribute('data-goto-first') || next, 10));
    var steps = $$('[data-progress-step]', host);
    var i = 0;
    (function tick() {
      if (i >= steps.length) { setTimeout(function () { gotoStep(next); }, 500); return; }
      var s = steps[i];
      s.classList.remove('pending'); s.classList.add('running');
      announce(s.getAttribute('data-progress-step'));
      var bar = s.querySelector('.bar');
      if (bar) bar.style.width = '100%';
      setTimeout(function () {
        s.classList.remove('running'); s.classList.add('done');
        var dot = s.querySelector('[data-dot]');
        if (dot) dot.outerHTML = '<span class="tick" data-dot>&#10003;</span>';
        i++; tick();
      }, 850);
    })();
  });

  /* ── the persistence indicator cycles like the real one ────────────────────
     Four labels, one dot, NEVER a spinner. */
  var PERSIST = [
    ['Saved on this device', 'grey'],
    ['Syncing', 'coral'],
    ['Synced', 'mint'],
    ['Saved on this device', 'grey']
  ];
  function nudgeSave() {
    var el = $('[data-persist]');
    if (!el) return;
    var i = 1;
    function show(k) {
      el.innerHTML = '<span class="dot ' + PERSIST[k][1] + '"></span>' + PERSIST[k][0];
      announce(PERSIST[k][0]);
    }
    show(1);
    setTimeout(function () { show(2); }, 900);
    setTimeout(function () { show(3); }, 2600);
  }
  window.nudgeSave = nudgeSave;

  /* ── inline editing on the canvas ──────────────────────────────────────────
     Click text inside a selection and you are typing. Selecting raises exactly
     four marks. */
  document.addEventListener('click', function (e) {
    var ed = e.target.closest('[data-editable]');
    $$('[data-editable]').forEach(function (el) {
      if (el !== ed) { el.removeAttribute('contenteditable'); el.classList.remove('is-editing'); }
    });
    if (ed) {
      ed.setAttribute('contenteditable', 'true');
      ed.classList.add('is-editing');
      ed.focus();
    } else {
      hideToolbar();
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target.closest('[data-editable]')) nudgeSave();
  });

  function hideToolbar() {
    var tb = $('#inline-toolbar');
    if (tb) tb.classList.remove('is-open');
  }
  document.addEventListener('selectionchange', function () {
    var tb = $('#inline-toolbar');
    if (!tb) return;
    var sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { hideToolbar(); return; }
    var node = sel.anchorNode;
    var host = node && (node.nodeType === 1 ? node : node.parentNode).closest('[data-editable]');
    if (!host) { hideToolbar(); return; }
    var r = sel.getRangeAt(0).getBoundingClientRect();
    if (!r.width) { hideToolbar(); return; }
    tb.classList.add('is-open');
    tb.style.left = Math.max(8, r.left + r.width / 2 - tb.offsetWidth / 2) + 'px';
    tb.style.top = (r.top + window.scrollY - tb.offsetHeight - 8) + 'px';
  });
  document.addEventListener('click', function (e) {
    var mark = e.target.closest('[data-mark]');
    if (!mark) return;
    e.preventDefault();
    // the selection is HELD, not re-derived: applying a mark must not collapse it
    document.execCommand(mark.getAttribute('data-mark'));
    mark.classList.toggle('is-pressed');
  });

  /* ── FR-D11's shortcut map, and the WCAG 2.1.4 rule that makes it legal ────
     Every single-character shortcut is live ONLY while the editor shell holds
     focus, and NEVER while a text field or a contenteditable has it. Without
     that rule a speech-input user saying a word near the canvas fires Preview
     Mode or a Site Remix. Cmd-modified shortcuts are unaffected. */
  function typing(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    var t = (el.tagName || '').toLowerCase();
    return t === 'input' || t === 'textarea' || t === 'select';
  }

  document.addEventListener('keydown', function (e) {
    var mod = e.metaKey || e.ctrlKey;
    var inText = typing(document.activeElement);

    if (e.key === 'Escape') {
      // Esc steps outward, one level per press, and announces where it landed
      if ($('.overlay.is-open')) { closeTop(); return; }
      if (document.body.classList.contains('mode-preview')) {
        setState('mode', null); announce('Back to editing'); return;
      }
      var ed = $('[data-editable].is-editing');
      if (ed) {
        ed.removeAttribute('contenteditable'); ed.classList.remove('is-editing');
        hideToolbar(); announce('Left text editing. The section is still selected.'); return;
      }
      if ($('[data-section].is-selected')) { select(null); announce('Deselected. Focus is on the canvas.'); return; }
      return;
    }

    if (mod) {
      var k = e.key.toLowerCase();
      if (k === 'k' && !e.shiftKey && $('#section-picker-link')) {
        e.preventDefault(); window.location.href = $('#section-picker-link').href; return;
      }
      if (k === 's') { e.preventDefault(); nudgeSave(); announce('Saved.'); return; }
      if (k === 'enter' || e.key === 'Enter') {
        var ship = $('[data-ship]'); if (ship) { e.preventDefault(); window.location.href = ship.href; }
        return;
      }
      return;
    }

    if (inText) return;                      // <- WCAG 2.1.4, and it is the whole rule
    if (!document.body.hasAttribute('data-editor-shell')) return;

    switch (e.key) {
      case '[': cycleDesign(-1); break;
      case ']': cycleDesign(1); break;
      case 'l': case 'L': document.body.classList.toggle('layers-hidden'); break;
      case 'p': case 'P':
        setState('mode', document.body.classList.contains('mode-preview') ? null : 'preview');
        announce(document.body.classList.contains('mode-preview') ? 'Preview mode. Everything is running.' : 'Back to editing');
        break;
      case '.': document.body.classList.toggle('canvas-dark'); announce('Dark preview ' + (document.body.classList.contains('canvas-dark') ? 'on' : 'off')); break;
      case '1': setState('device', 'desktop'); break;
      case '2': setState('device', 'tablet'); break;
      case '3': setState('device', 'mobile'); break;
      case 'R': if (e.shiftKey) { var rm = $('#remix'); if (rm) open('remix'); } break;
      default: return;
    }
    e.preventDefault();
  });

  /* ── search filters ────────────────────────────────────────────────────────
     [data-filter="selector"] hides non-matching rows and shows the empty state. */
  document.addEventListener('input', function (e) {
    var f = e.target.closest('[data-filter]');
    if (!f) return;
    var q = f.value.trim().toLowerCase();
    var items = $$(f.getAttribute('data-filter'));
    var hits = 0;
    items.forEach(function (el) {
      var match = !q || el.textContent.toLowerCase().indexOf(q) > -1;
      el.hidden = !match;
      if (match) hits++;
    });
    var none = document.querySelector(f.getAttribute('data-filter-empty') || '__none__');
    if (none) {
      none.hidden = hits > 0;
      var echo = none.querySelector('[data-filter-echo]');
      if (echo) echo.textContent = f.value;
    }
  });

  /* ── the Style Pack crossfade, 300ms — long enough to see the site change
     its mind, which is the moment the product is selling. Honours
     prefers-reduced-motion by becoming an instant state change. */
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pack]');
    if (!p) return;
    var name = p.getAttribute('data-pack');
    $$('[data-pack]').forEach(function (x) { x.classList.toggle('on', x === p); });
    var site = $('[data-site]');
    if (site) {
      site.setAttribute('data-packing', '1');
      setTimeout(function () {
        site.setAttribute('data-theme', name.toLowerCase().replace(/\s+/g, '-'));
        site.removeAttribute('data-packing');
      }, 300);
    }
    $$('[data-pack-name]').forEach(function (x) { x.textContent = name; });
    announce('Style Pack: ' + name);
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
    syncBackupGate();
    var ring = $('[data-ring]');
    if (ring) setDesign(parseInt(ring.getAttribute('data-current') || '0', 10));
    var wiz = $('[data-wizard]');
    if (wiz) gotoStep(parseInt(wiz.getAttribute('data-at') || '1', 10));
  });
})();
