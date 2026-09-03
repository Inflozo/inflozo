/* Inflozo step 5b — the prototype's interaction layer.
   Plain script, no modules, no fetch: it has to run from a double-click on file://.

   ONE RULE GOVERNS THIS FILE, AND IT COMES FROM R-75 RATHER THAN FROM TASTE:
   "every page must read complete with JavaScript off." So everything here is ADDITIVE.
   Nothing is hidden by default, nothing collapses, no state is only reachable by
   clicking. Switch JavaScript off and 5b is exactly what it was — every frame, every
   state, every annotation, all visible at once. That is what makes it the checking
   artifact, and it is not negotiable.

   IT ALSO TOUCHES NOTHING INSIDE A LIFTED FRAME. That is the second rule, and it was
   learned by breaking it: wiring the frames' own controls inserted 200 elements across
   117 frames, and an assertion that "every page's frames must respond" pressured the
   build into a link from the binding checklist to itself, purely to pass. A check that
   can be satisfied by fabrication is worse than no check. So the frames are lifted
   byte-identical and stay that way — `build.py` asserts it — and navigation lives in the
   scaffolding around them.

   What is left is exactly the behaviour THE EXPORT ITSELF DECLARES: `style-hover` and
   `style-focus`, which the export's own runtime applies and which 5b was missing
   entirely. Replaying them makes this build MORE faithful, not less.

   This is why 5b and 5c behave differently and neither is a bug. 5c hides, reveals and
   navigates because it is the product. 5b does none of those, because it is the proof. */
(function () {
  'use strict';

  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── the export's own hover and focus states ───────────────────────────────
     Frames carry these as `style-hover` / `style-focus` attributes, applied by the
     export's runtime. A screen lifted out of a frame keeps the attribute, so it has
     to keep the behaviour too — otherwise the lift is the drawing with its
     interactions quietly removed. */
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

  /* ── the surface list on each page jumps rather than reloads ───────────────
     Anchors already work with JS off; this only smooths them and marks where you
     landed, so a page with fifteen frames on it does not lose you. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
    $$('.landed').forEach(function (x) { x.classList.remove('landed'); });
    t.classList.add('landed');
    setTimeout(function () { t.classList.remove('landed'); }, 1600);
  });

})();
