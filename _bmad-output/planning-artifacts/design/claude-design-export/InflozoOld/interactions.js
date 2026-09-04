// Inflozo mock interactions — generic, pattern-based; safe on every kit page.
(function () {
  if (window.__inflozoIx) return; window.__inflozoIx = 1;
  function norm(v) { return (v || '').toLowerCase().replace(/\s+/g, ''); }
  function isCoral(v) { v = norm(v); return v.indexOf('#ff5941') >= 0 || v.indexOf('rgb(255,89,65)') >= 0; }
  function isInk(v) { v = norm(v); return v.indexOf('#1c1b1a') >= 0 || v.indexOf('rgb(28,27,26)') >= 0; }
  function isHairline(v) { v = norm(v); return v.indexOf('#e7e2db') >= 0 || v.indexOf('rgb(231,226,219)') >= 0; }
  function walkUp(el, pred, depth) {
    var d = depth || 8;
    while (el && el.nodeType === 1 && d--) { if (pred(el)) return el; el = el.parentElement; }
    return null;
  }
  function chevFlip(svg) {
    var p = svg && svg.querySelector('polyline');
    if (!p) return;
    var pts = p.getAttribute('points');
    if (pts === '6 9 12 15 18 9') p.setAttribute('points', '18 15 12 9 6 15');
    else if (pts === '18 15 12 9 6 15') p.setAttribute('points', '6 9 12 15 18 9');
  }
  document.addEventListener('click', function (e) {
    var t = e.target;

    // 1 · toggle switch (36×20)
    var tog = walkUp(t, function (el) { return el.style && el.style.width === '36px' && el.style.height === '20px'; }, 4);
    if (tog) {
      var on = isCoral(tog.style.background || tog.style.backgroundColor);
      var knob = tog.firstElementChild;
      tog.style.background = on ? '#D8D2C9' : '#FF5941';
      if (knob) { knob.style.left = on ? '2px' : 'auto'; knob.style.right = on ? 'auto' : '2px'; }
      return;
    }

    // 2 · segmented pills / device trio (container bg #EFECE7)
    var segItem = walkUp(t, function (el) {
      var p = el.parentElement;
      if (!p || !p.style) return false;
      var bg = norm(p.style.background || p.style.backgroundColor);
      return bg.indexOf('#efece7') >= 0 || bg.indexOf('rgb(239,236,231)') >= 0;
    }, 4);
    if (segItem && segItem.parentElement.children.length > 1) {
      var kids = segItem.parentElement.children;
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i], active = (k === segItem);
        k.style.background = active ? '#FFFFFF' : 'transparent';
        k.style.boxShadow = active ? '0 1px 2px rgba(28,27,26,.06)' : 'none';
        if (k.tagName === 'SPAN') { k.style.fontWeight = active ? '600' : '500'; k.style.color = active ? '#1C1B1A' : '#6E6A64'; }
      }
      return;
    }

    // 3 · upvote pill (▲ + mono count)
    var up = walkUp(t, function (el) {
      return el.querySelector && el.children.length && el.querySelector(':scope > svg path[d="M12 5l8 12H4z"]');
    }, 4);
    if (up) {
      var tri = up.querySelector('svg path'), cnt = up.querySelector('span');
      var voted = isCoral(up.style.border || up.style.borderColor);
      up.style.border = voted ? '1px solid #E7E2DB' : '1px solid #FF5941';
      up.style.background = voted ? 'transparent' : '#FFEDE8';
      if (tri) tri.parentElement.setAttribute('fill', voted ? '#6E6A64' : '#E84B34');
      if (cnt) {
        var n = parseInt(cnt.textContent, 10);
        if (!isNaN(n)) cnt.textContent = voted ? (n - 1) : (n + 1);
        cnt.style.color = voted ? '#6E6A64' : '#E84B34';
      }
      return;
    }

    // 4 · stepper − / +
    if (t.tagName === 'SPAN' && (t.textContent === '−' || t.textContent === '+') && t.parentElement && t.parentElement.children.length === 3) {
      var mid = t.parentElement.children[1];
      var num = parseInt(mid.textContent, 10);
      if (!isNaN(num)) { mid.textContent = Math.max(1, num + (t.textContent === '+' ? 1 : -1)); return; }
    }

    // 5 · radio cards (16px circle + card border)
    var card = walkUp(t, function (el) {
      var c = el.querySelector && el.querySelector(':scope > span');
      return c && c.style && c.style.width === '16px' && c.style.height === '16px' && el.style && el.style.border;
    }, 5);
    if (card && card.parentElement) {
      var sibs = card.parentElement.children;
      for (var j = 0; j < sibs.length; j++) {
        var s = sibs[j], circ = s.querySelector && s.querySelector(':scope > span');
        if (!circ || circ.style.width !== '16px') continue;
        var pick = (s === card);
        s.style.border = pick ? '1px solid #FF5941' : '1px solid #E7E2DB';
        s.style.background = pick ? '#FFF9F7' : 'transparent';
        circ.style.border = pick ? '1.5px solid #FF5941' : '1.5px solid #C9C2B8';
        circ.innerHTML = pick ? '<span style="width:8px;height:8px;border-radius:50%;background:#FF5941"></span>' : '';
        circ.style.display = 'inline-flex'; circ.style.alignItems = 'center'; circ.style.justifyContent = 'center';
      }
      return;
    }

    // 6 · accordion / FAQ headers — toggle body + flip chevron
    var head = walkUp(t, function (el) {
      if (!el.querySelector || !el.style || el.style.cursor !== 'pointer') return false;
      return !!el.querySelector(':scope > svg polyline, :scope > div > svg polyline');
    }, 4);
    if (head) {
      // shape (a): wrapper column [header-row, answer…]
      var innerChev = head.querySelector(':scope > div > svg');
      if (innerChev) {
        var body = head.children[head.children.length - 1];
        if (body && body !== head.firstElementChild) {
          body.style.display = (body.style.display === 'none') ? '' : 'none';
        }
        chevFlip(innerChev);
        return;
      }
      // shape (b): header row; body is next sibling (app accordions)
      var nxt = head.nextElementSibling;
      if (nxt && !(nxt.querySelector && nxt.querySelector(':scope > svg polyline')) && nxt.style && nxt.style.cursor !== 'pointer') {
        nxt.style.display = (nxt.style.display === 'none') ? '' : 'none';
      }
      chevFlip(head.querySelector(':scope > svg'));
      return;
    }

    // 7 · filter chips (pill + hairline + pointer)
    var chip = walkUp(t, function (el) {
      return el.style && el.style.cursor === 'pointer' && el.style.borderRadius === '24px' && (isHairline(el.style.border || el.style.borderColor) || isInk(el.style.background || el.style.backgroundColor));
    }, 3);
    if (chip) {
      var actv = isInk(chip.style.background || chip.style.backgroundColor);
      chip.style.background = actv ? '#FFFFFF' : '#1C1B1A';
      chip.style.color = actv ? '#6E6A64' : '#F7F5F2';
      return;
    }

    // 8 · layers eye — dim / undim
    var eye = walkUp(t, function (el) {
      return el.tagName && el.tagName.toLowerCase() === 'svg' && el.querySelector && el.querySelector('path[d^="M2 12s3.5-7"]');
    }, 3);
    if (eye) {
      var off = eye.getAttribute('stroke') === '#C9C2B8';
      eye.setAttribute('stroke', off ? '#1C1B1A' : '#C9C2B8');
      return;
    }
  }, true);
})();
