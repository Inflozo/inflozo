/* A29 Archive Headers — controls-reconciliation kit, 25 August 2026.
   Panel row helpers in the category's existing markup vocabulary, plus the
   shared Content / Universal / Data / Editing groups. Row styles are copied
   from A29-1's drawn panel and A28's reconciled panels verbatim. */
globalThis.A29K = (function () {
const MONO = "'JetBrains Mono',monospace";
const b = s => `<strong style="font-weight:600">${s}</strong>`;
const bd = s => `<strong style="font-weight:600;color:#3A3835">${s}</strong>`;
const code = s => `<code style="font-family:'JetBrains Mono',monospace;font-size:12px">${s}</code>`;
const hb = s => '{&#8203;{' + s + '}&#8203;}';
const lab = s => `<span style="font-size:12px;font-weight:500;color:#6E6A64">${s}</span>`;
const note = s => `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${s}</span>`;
const row = inner => `<div style="display:flex;flex-direction:column;gap:5px">${inner}</div>`;
const tag = (t, c) => `<span style="font-family:${MONO};font-size:9px;color:${c || '#A2765A'}">${t}</span>`;

/* segmented control · A29-1's own row, 11.5 px */
function seg(label, vals, active, n, small) {
  const fs = small ? '11px' : '11.5px', pad = small ? '5px 4px' : '6px 4px';
  const cells = vals.map(v => v === active
    ? `<span style="flex:1;text-align:center;font-size:${fs};padding:${pad};border-radius:24px;background:#FFFFFF;box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600">${v}</span>`
    : `<span style="flex:1;text-align:center;font-size:${fs};padding:${pad};border-radius:24px;color:#6E6A64">${v}</span>`).join('');
  return row(`${lab(label)}<div style="display:flex;background:#EFECE7;border-radius:24px;padding:3px">${cells}</div>${note(n)}`);
}
/* dropdown */
function sel(label, value, n) {
  return row(`${lab(label)}<div style="height:36px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:#1C1B1A">${value}</span><span style="font-size:10px;color:#8A857C">▾</span></div>${note(n)}`);
}
/* read-only / locked row */
function ro(label, value, n) {
  return row(`${lab(label)}<div style="height:36px;background:#F2EFEA;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:#8A857C">${value}</span><span style="font-size:10px;color:#8A857C">🔒</span></div>${note(n)}`);
}
/* authored string field · INLINE · PANEL · LINK PICKER · CATALOG */
function txt(label, value, t, n, locked) {
  const bg = locked ? '#F2EFEA' : '#FFFFFF', col = locked ? '#8A857C' : '#1C1B1A';
  return row(`${lab(label)}<div style="height:34px;background:${bg};border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 11px"><span style="font-size:12px;color:${col};flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${value}</span>${tag(t, locked ? '#8A857C' : '#A2765A')}</div>${note(n)}`);
}
function group(title, rows) {
  return `<div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;flex-direction:column;gap:10px"><span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">${title}</span>${rows.join('')}</div>`;
}
const foot = c => `<div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${c}</span></div>`;

/* ── the three universal rows ──────────────────────────────────────────── */
const VS_STD = `64 · 96 · 132 above and below; 80 at 834, 64 at 390. ${bd('This is the row this design called Padding')} ⚑.`;
function trio(o) {
  const rows = [];
  rows.push(o.bgLock
    ? ro('Background role', o.bgValue, o.bgNote)
    : seg('Background role', ['Background', 'Surface', 'Contrast'], o.bgActive || 'Background', o.bgNote, true));
  rows.push(o.vsLock
    ? ro('Vertical spacing', o.vsValue || 'Comfortable', o.vsNote)
    : seg('Vertical spacing', ['Compact', 'Comfortable', 'Spacious'], 'Comfortable', o.vsNote || VS_STD, true));
  rows.push(o.tdLock
    ? ro('Top divider', o.tdValue || 'None', o.tdNote)
    : seg('Top divider', ['None', 'Line', 'Fade'], o.tdActive || 'None', o.tdNote, true));
  return group("UNIVERSAL · EVERY PLACEABLE SECTION · OUTSIDE THIS DESIGN'S LIST", rows);
}

/* ── the Data group · the archive source, recut ────────────────────────── */
const D_NAME = `From Ghost · Custom text. From Ghost reads ${code(hb('#tag') + hb('name'))}, ${code(hb('#author') + hb('name'))} or the route's own title ⚑. ${bd('The rendered name is Ghost-owned')} — clicking it says "Edit in Ghost".`;
const D_DESC = `From Ghost · Custom text · Off. From Ghost reads the tag description or the author bio; most tags have none ⚑. ${bd('At From Ghost the text is not inline-editable')} — P0·1 shows its lock pill instead.`;
const D_EMPTY = `Head and notice · Head only. ${bd('Hide is not offered')} — A17 renders nothing at zero, so hiding the head leaves a blank route ⚑.`;
const D_WHERE = `Read-only. ${bd("Ghost's route decides")} — tag, author, or a routes.yaml collection; the section reports it and cannot change it ⚑.`;
const IMG_FOCUS = `Centre · Top · Bottom, in the Image Picker's popover and never a hidden field ⚑. ${bd('New in this pass')}: it applies to the uploaded image ${bd('and to the Ghost one')}, because Ghost stores no focal point and A29 cropped from the centre only. A30, A31 and A32 all carry it.`;
function dataGroup(o) {
  const rows = [sel('Name', 'From Ghost', D_NAME), sel('Description', 'From Ghost', D_DESC)];
  if (o.image) {
    rows.push(sel('Image', 'From Ghost', `From Ghost · Upload · Off. Reads ${code(hb('#tag') + hb('feature_image'))} or the author's cover ⚑ — the cover, not the profile picture.`));
    rows.push(sel('Image focus', 'Centre', IMG_FOCUS));
  } else {
    rows.push(ro('Image', 'From Ghost', `${bd('Disabled in this design')} ⚑ — nothing here draws an image. The field is kept on the section, not discarded, so switching to 5 Full Bleed or 6 Image Split finds it. ${bd('Drawn disabled in this pass')}; the field list had already ruled it.`));
  }
  rows.push(sel('When the archive is empty', 'Head and notice', D_EMPTY));
  rows.push(ro('Where this runs', 'Tag archive', D_WHERE));
  if (o.tail) rows.push(note(o.tail));
  return group('THE DATA GROUP · THE ARCHIVE SOURCE · THE SAME IN ALL FOURTEEN · NOT COUNTED', rows);
}

/* ── the Content group · the authored strings ──────────────────────────── */
const C_EYEBROW = `Inline, ${bd('P0·1')}. Defaults by route — Tag · Author · Archive ⚑. ${bd('Clearing it brings the default back')}, which is why Eyebrow: Show · Hide now exists above.`;
const C_TITLE = `Inline, ${bd('P0·1')}. Empty means "use Ghost's name" ⚑; the Ghost name itself is not editable here and answers "Edit in Ghost".`;
const C_EMPTY = `Inline. Renders under the head at zero posts, clamped at 560 ⚑.`;
const C_ZERO = `${bd('New in this pass')} ⚑. It was a hardcoded English literal separate from ${code('emptyText')}, and it renders inside every design's count slot. Now a ${bd('theme translation-catalog string')} — ${code('archive.count_empty')} — not an authored field, because it is a plural form of Ghost's number rather than a sentence the publication writes.`;
const C_BACKURL = `${bd('Link Picker')} ⚑ — pages, posts, tags, authors, Portal actions, a URL or an email, with the popover's open-in-new-tab and rel nofollow · noreferrer · sponsored. Defaults to ${code(hb('@site.url'))}.`;
function contentGroup(rows) {
  return group('CONTENT · THE AUTHORED STRINGS · EDITED ON CANVAS', rows);
}

/* ── the Editing group ────────────────────────────────────────────────── */
const E_SHARED = fields => `${bd('Every authored string edits inline on canvas')} with the ${bd('P0·1')} toolbar — bold · italic · underline · link, its popover carrying ${bd('Open in new tab')} and rel ${bd('nofollow · noreferrer · sponsored')}: ${fields}. ${bd('Ghost-owned content is never inline-editable')} ⚑ — the archive name, the post count, tag names, the author bio, location and website all answer ${bd('"Edit in Ghost"')} or show P0·1's lock pill. ${bd('Every URL field opens the Ghost-aware Link Picker')}. ${bd('No fixed English visitor-facing string ships')}: the authored strings carry the old literals as defaults and the zero count is the ${code('archive.count_empty')} catalog string. ${bd('There is no Preview control')} in this panel and there never was one to remove — states are ${bd('P0·6')}'s switcher, audiences are View as.`;
function editingGroup(fields, extra) {
  const rows = [note(E_SHARED(fields))];
  (extra || []).forEach(x => rows.push(note(x)));
  return group('EDITING · THE P0 PRIMITIVES', rows);
}

/* ── the amber Reconciled paragraph in the notes card ──────────────────── */
function reconciled(body) {
  return `<span style="border-top:1px solid #EBE5DB;padding-top:9px"><strong style="font-weight:600;color:#B25B2A">Reconciled.</strong> ${body}</span>`;
}
/* ── the Reconciled line at the foot of the drawn spec card ────────────── */
function specRec(body) {
  return `<span style="border-top:1px solid #EBE5DB;padding-top:9px"><strong style="font-weight:600;color:#B25B2A">Reconciled ⚑</strong> ${body}</span>`;
}
return { MONO, b, bd, code, hb, lab, note, row, tag, seg, sel, ro, txt, group, foot, trio, dataGroup, contentGroup, editingGroup, reconciled, specRec, VS_STD, C_EYEBROW, C_TITLE, C_EMPTY, C_ZERO, C_BACKURL, IMG_FOCUS };
})();
