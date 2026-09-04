/* A26 Post Footers — shared render kit.
   Loaded by run_script via new Function(src + ';return {...}')().
   Every block takes a token object t, so light, dark and the three packs
   are the same code with a different t — which is the category's own rule. */

const PACKS = {
  paper: {
    name: 'PAPER', r: 8, head: "Georgia,serif", body: "'Inter',sans-serif",
    l: { bg:'#FBF9F5', surface:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459', border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', onContrast:'#FBF9F5', stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)', shadow:'0 4px 16px rgba(28,27,26,.08)' },
    d: { bg:'#171511', surface:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F', border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', onContrast:'#171511', stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)', shadow:'none' }
  },
  tangerine: {
    name: 'TANGERINE', r: 14, head: "'Bricolage Grotesque',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#FFF4EA', surface:'#FFFFFF', hover:'#F6E3D2', text:'#2A1B12', muted:'#7A6154', border:'#EFD8C3', accent:'#E8541F', onAccent:'#FFFFFF', contrast:'#2A1B12', onContrast:'#FFF4EA', stripe:'repeating-linear-gradient(45deg,#F6E3D2 0 10px,#F0E0CE 10px 20px)', shadow:'0 4px 16px rgba(42,27,18,.08)' },
    d: { bg:'#1E1310', surface:'#2A1B15', hover:'#33241B', text:'#FDF3E7', muted:'#AA9B8E', border:'#3A2A21', accent:'#F27C4A', onAccent:'#1E1310', contrast:'#FDF3E7', onContrast:'#1E1310', stripe:'repeating-linear-gradient(45deg,#33241B 0 10px,#3B2A20 10px 20px)', shadow:'none' }
  },
  ink: {
    name: 'INK', r: 6, head: "'Inter',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#F5F5F7', surface:'#FFFFFF', hover:'#E7E7EC', text:'#16161A', muted:'#63636E', border:'#E3E3E8', accent:'#2F6FED', onAccent:'#FFFFFF', contrast:'#16161A', onContrast:'#F5F5F7', stripe:'repeating-linear-gradient(45deg,#E7E7EC 0 10px,#DEDEE4 10px 20px)', shadow:'0 4px 16px rgba(22,22,26,.08)' },
    d: { bg:'#16161A', surface:'#1F1F25', hover:'#25252B', text:'#F4F4F6', muted:'#9C9CA2', border:'#2E2E34', accent:'#5A8CF5', onAccent:'#16161A', contrast:'#F4F4F6', onContrast:'#16161A', stripe:'repeating-linear-gradient(45deg,#25252B 0 10px,#1E1E24 10px 20px)', shadow:'none' }
  }
};

function tok(pack, mode) {
  const p = PACKS[pack] || PACKS.paper;
  return Object.assign({ r: p.r, head: p.head, body: p.body, pack: p.name, mode }, mode === 'd' ? p.d : p.l);
}
const T = tok('paper', 'l');
const TD = tok('paper', 'd');

/* ---- the fixture: the post every A26 frame closes ---- */
const POST = {
  title: 'The four hundred domains that refuse to move',
  issue: 'Issue 118', date: '14 August 2026', updated: '20 August 2026', read: '9 min read',
  tail: 'The list is not getting longer, and the people on it are not getting younger. Whatever this is, it is the last decade of it.'
};
const TAGS = ['Reporting', 'The web', 'Archives'];
const A1 = { name: 'Rosa Menendez', ini: 'RM', role: 'Staff writer',
  bio: 'Writes about the parts of the internet that stopped changing. Ten years at a daily paper before this; now in Lisbon.' };
const A2 = { name: 'Daniel Reith', ini: 'DR', role: 'Transport',
  bio: 'Covers transport, and the things a city builds once.' };
const PREV = { kicker: 'Previous', title: 'Six months of rain, measured by one gardener', date: '7 August 2026', who: 'Naomi Alder' };
const NEXT = { kicker: 'Next', title: 'The night shift at the Port of Algeciras', date: '21 August 2026', who: 'Marguerite Okonjo' };
const SHARE4 = ['Email', 'Copy link', 'Bluesky', 'Mastodon'];

/* ---- width table ---- */
const SZ = {
  1440: { margin: 72, content: 1296, measure: 720, name: 19, bio: 15, meta: 13, av: 56, gap: 40, pad: 96 },
  834:  { margin: 40, content: 754,  measure: 754, name: 19, bio: 15, meta: 13, av: 56, gap: 32, pad: 80 },
  390:  { margin: 20, content: 350,  measure: 350, name: 18, bio: 15, meta: 13, av: 48, gap: 24, pad: 64 }
};

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const rule = t => `<div style="height:1px;background:${t.border}"></div>`;
const eyebrow = (t, txt) => `<span style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${t.muted}">${txt}</span>`;

function avatar(t, p, size) {
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${t.hover};color:${t.text};font-size:${Math.round(size*0.3)}px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:${t.body}">${p.ini}</span>`;
}
function plate(t, w, h, label, radius) {
  return `<div style="width:${w};height:${h}px;border-radius:${radius === undefined ? t.r : radius}px;background:${t.stripe};display:flex;align-items:flex-end;padding:8px;box-sizing:border-box;flex-shrink:0">${label ? mono(9, t.muted, label) : ''}</div>`;
}
function link(t, txt, accent) {
  return `<span style="font-size:14px;font-weight:600;color:${accent ? t.accent : t.text};font-family:${t.body}">${txt}</span>`;
}

/* ---- the five footer blocks ---- */
function tagsBlock(t, o = {}) {
  const items = o.items || TAGS, style = o.style || 'Pills', size = o.size || 13;
  const pill = x => style === 'Pills'
    ? `<span style="display:inline-flex;align-items:center;height:${size + 19}px;padding:0 ${Math.round(size * 1.1)}px;border:1px solid ${t.border};border-radius:${t.r}px;font-size:${size}px;font-weight:500;color:${t.text};font-family:${t.body}">${x}</span>`
    : `<span style="font-size:${size}px;font-weight:500;color:${t.text};font-family:${t.body};border-bottom:1px solid ${t.border};padding-bottom:2px">${x}</span>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:${style === 'Pills' ? 8 : 16}px;align-items:center;${o.align === 'Centre' ? 'justify-content:center' : ''}">${o.label ? `<span style="font-size:13px;color:${t.muted};font-family:${t.body};margin-right:4px">${o.label}</span>` : ''}${items.map(pill).join('')}</div>`;
}

function authorBlock(t, o = {}) {
  const av = o.av || 56, people = o.people || [A1], lines = o.lines || 2;
  const one = p => `<div style="display:flex;gap:${Math.round(av * 0.29)}px;align-items:flex-start">${avatar(t, p, av)}<div style="display:flex;flex-direction:column;gap:5px;min-width:0">
    <span style="font-family:${t.head};font-weight:700;font-size:${o.nameSize || 19}px;line-height:1.25;color:${t.text}">${p.name}</span>
    ${lines === 0 ? '' : `<span style="font-size:15px;line-height:1.6;color:${t.muted};font-family:${t.body};display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;overflow:hidden;max-width:${o.bioWidth || 560}px">${p.bio}</span>`}
    ${o.link === false ? '' : `<span style="font-size:14px;font-weight:600;color:${o.accentLink ? t.accent : t.text};font-family:${t.body};margin-top:2px">More from ${p.name.split(' ')[0]} →</span>`}
  </div></div>`;
  if (people.length > 2) {
    return `<div style="display:flex;align-items:center;gap:12px"><div style="display:flex">${people.map((p, i) => `<span style="margin-left:${i ? -10 : 0}px;display:inline-flex;border:2px solid ${t.bg};border-radius:50%">${avatar(t, p, 40)}</span>`).join('')}</div><span style="font-size:15px;color:${t.text};font-family:${t.body}">Rosa Menendez, Daniel Reith and Naomi Alder</span></div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:${o.gap || 20}px">${people.map((p, i) => `${i && o.hair !== false ? rule(t) : ''}${one(p)}`).join('')}</div>`;
}

function shareBlock(t, o = {}) {
  const n = o.links || 3, style = o.style || 'Words', box = o.box || 38;
  const items = SHARE4.slice(0, n);
  const one = x => style === 'Glyphs'
    ? `<span style="width:${box}px;height:${box}px;border:1px solid ${t.border};border-radius:${Math.min(t.r, 8)}px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${t.text};font-family:${t.body}">${x.slice(0, 1)}</span>`
    : `<span style="font-size:15px;font-weight:600;color:${t.text};font-family:${t.body}">${x}</span>`;
  return `<div style="display:flex;align-items:center;gap:${style === 'Glyphs' ? 8 : 24}px;${o.align === 'Split' ? 'justify-content:space-between;width:100%' : o.align === 'Centre' ? 'justify-content:center' : ''}">
    ${o.label === false ? '' : `<span style="font-size:13px;color:${t.muted};font-family:${t.body}">${o.labelText || 'Share this piece'}</span>`}
    <div style="display:flex;align-items:center;gap:${style === 'Glyphs' ? 8 : 24}px">${items.map(one).join('')}</div></div>`;
}

function shareTower(t, o = {}) {
  const items = SHARE4.slice(0, o.links || 3);
  return `<div style="display:flex;flex-direction:column;gap:8px;align-items:${o.align || 'flex-start'}">
    ${items.map(x => `<span style="width:38px;height:38px;border:1px solid ${t.border};border-radius:${Math.min(t.r, 8)}px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${t.text};font-family:${t.body}">${x.slice(0, 1)}</span>`).join('')}</div>`;
}

function subscribeBlock(t, o = {}) {
  const stacked = o.field === 'Stacked';
  return `<div style="display:flex;flex-direction:column;gap:${o.gap || 14}px;${o.align === 'Centre' ? 'align-items:center;text-align:center' : ''}">
    ${o.prompt === 'One line' ? '' : `<span style="font-family:${t.head};font-weight:700;font-size:${o.size || 22}px;line-height:1.2;color:${t.text}">Orbit Weekly, Thursdays</span>`}
    <span style="font-size:15px;line-height:1.6;color:${t.muted};font-family:${t.body};max-width:420px">One long read and five short ones, once a week.</span>
    <div style="display:flex;${stacked ? 'flex-direction:column;' : ''}gap:8px;${stacked ? 'width:320px' : ''}">
      <span style="height:44px;${stacked ? '' : 'width:280px;'}border:1px solid ${t.border};border-radius:${Math.min(t.r, 8)}px;background:${t.surface};display:flex;align-items:center;padding:0 14px;font-size:15px;color:${t.muted};font-family:${t.body};box-sizing:border-box">you@example.com</span>
      <span style="height:44px;background:${t.accent};color:${t.onAccent};border-radius:${Math.min(t.r, 8)}px;display:flex;align-items:center;justify-content:center;padding:0 20px;font-size:14px;font-weight:600;font-family:${t.body}">Subscribe</span>
    </div></div>`;
}

function nextPrevBlock(t, o = {}) {
  const w = o.width || 'auto', style = o.style || 'Words', h = o.height || 0;
  const one = (p, right) => {
    if (style === 'Picture behind') {
      return `<div style="flex:1;height:${h || 240}px;border-radius:${o.radius === 0 ? 0 : t.r}px;background:${t.stripe};position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:24px;box-sizing:border-box">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,${t.mode === 'd' ? 'rgba(23,21,17,.82)' : 'rgba(35,32,25,.72)'} 0%,${t.mode === 'd' ? 'rgba(23,21,17,.15)' : 'rgba(35,32,25,.10)'} 62%)"></div>
        <div style="position:relative;display:flex;flex-direction:column;gap:8px;${right ? 'align-items:flex-end;text-align:right' : ''}">
          <span style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${t.mode === 'd' ? '#D9D1C4' : '#EFE9DE'};font-family:${t.body}">${p.kicker}</span>
          <span style="font-family:${t.head};font-weight:700;font-size:22px;line-height:1.22;color:#FFFFFF;max-width:420px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.title}</span>
        </div></div>`;
    }
    const thumb = style === 'Thumbnail' ? plate(t, '64px', 64, '') : '';
    return `<div style="flex:1;display:flex;gap:14px;align-items:center;${right ? 'flex-direction:row-reverse;text-align:right' : ''};${o.boxed ? `border:1px solid ${t.border};border-radius:${t.r}px;padding:18px;` : ''}min-width:0">
      ${thumb}<div style="display:flex;flex-direction:column;gap:6px;min-width:0">
        <span style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${t.muted};font-family:${t.body}">${p.kicker}</span>
        <span style="font-family:${t.head};font-weight:700;font-size:${o.titleSize || 19}px;line-height:1.25;color:${t.text};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.title}</span>
      </div></div>`;
  };
  const items = o.items || [PREV, NEXT];
  return `<div style="display:flex;gap:${o.gap || 24}px;align-items:stretch;width:${w}">${items.map((p, i) => one(p, items.length > 1 && i === 1 && o.mirror !== false)).join(o.divider ? `<div style="width:1px;background:${t.border}"></div>` : '')}</div>`;
}

/* ---- frame chrome: the article tail above the footer ---- */
function articleTail(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  return `<div style="display:flex;flex-direction:column;gap:10px;opacity:.5;width:${o.measure || s.measure}px;${o.centre ? 'margin:0 auto' : ''}">
    <span style="font-family:${t.head};font-weight:700;font-size:${w === 390 ? 22 : 26}px;line-height:1.2;color:${t.text}">A note on the list</span>
    <span style="font-size:${w === 390 ? 17 : 19}px;line-height:1.7;color:${t.text};font-family:${t.body}">${POST.tail}</span>
  </div>
  <div style="height:22px;display:flex;align-items:flex-end">${mono(10, t.muted, o.tailNote || 'A25 ARTICLE ABOVE · NOT THIS SECTION · DRAWN AT HALF OPACITY')}</div>
  <div style="height:${o.gap || 64}px;display:flex;align-items:flex-end;padding-bottom:6px">${mono(10, t.muted, o.gapNote === false ? '64' : "64 · THE ARTICLE'S TRAILING GAP · FIXED AT EVERY WIDTH · A26 OWNS IT")}</div>`;
}

function frame(w, t, inner, o = {}) {
  const s = SZ[w] || SZ[1440];
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,${t.mode === 'd' ? '.24' : '.14'});overflow:hidden;box-sizing:border-box;padding:0 ${o.flush ? 0 : s.margin}px">
    ${o.chrome === false ? '' : `<div style="height:${w === 390 ? 52 : 60}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};${o.flush ? `padding:0 ${s.margin}px` : ''}">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(t.r, 7)}px;background:${t.accent}"></span><span style="font-family:${t.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
      ${w === 390 ? `<span style="font-size:18px;color:${t.text}">☰</span>` : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${t.body}"><span>Reporting</span><span>Interviews</span><span>Archive</span><span style="color:${t.text};font-weight:600">Subscribe</span></div>`}
    </div>`}
    <div style="padding-top:${o.top === undefined ? 32 : o.top}px;${o.flush ? `padding-left:${s.margin}px;padding-right:${s.margin}px` : ''}">${o.tail === false ? '' : articleTail(t, w, o)}</div>
    <div style="${o.flush ? '' : ''}">${inner}</div>
    <div style="height:${o.bottom === undefined ? 40 : o.bottom}px"></div></div>`;
}

/* ---- the control panel ---- */
function seg(t, values, active) {
  return `<div style="display:flex;background:#EFECE7;border-radius:24px;padding:3px">${values.map(v => `<span style="flex:1;text-align:center;font-size:11.5px;padding:6px 4px;border-radius:24px;${v === active ? 'background:#FFFFFF;box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600' : 'color:#6E6A64'}">${v}</span>`).join('')}</div>`;
}
function selectRow(value) {
  return `<div style="height:36px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px">${value}</span><span style="font-size:10px;color:#8A857C">▾</span></div>`;
}
function ctl(name, kind, values, active, hint) {
  const body = kind === 'seg' ? seg(null, values, active) : selectRow(active);
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${name}</span>${body}${hint ? `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${hint}</span>` : ''}</div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 15 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.foot || ''}
    <div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${o.count} CONTROLS</span></div></div>`;
}
function panelNote(title, paras) {
  return `<div style="width:948px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${sub(title)}${paras.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function specCol(items) {
  return `<div style="width:634px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${items.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function row(cols, widths, head) {
  return `<div style="display:grid;grid-template-columns:${widths};${head ? 'background:#F7F5F2;' : ''}border-bottom:1px solid ${head ? '#E7E2DB' : '#F1EDE6'}">${cols.map(c => `<span style="font-size:${head ? 10.5 : 11.5}px;${head ? 'font-weight:600;color:#6E6A64;letter-spacing:.04em;text-transform:uppercase;' : 'color:#3A3835;'}padding:${head ? '8px 11px' : '7px 11px'};line-height:1.45">${c}</span>`).join('')}</div>`;
}

/* ---- section + document wrappers ---- */
function section(label, capText, inner, pad) {
  return `<section${label ? ` data-screen-label="${label}"` : ''} style="padding:${pad || '0 56px 48px'};display:flex;flex-direction:column;gap:16px">
  ${capText ? cap(capText) : ''}
  ${inner}
</section>`;
}
function wrapIf(prop, s) { return `<sc-if value="{{ ${prop} }}" hint-placeholder-val="{{ true }}">\n${s}\n</sc-if>`; }
function stack(parts) { return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">${parts.join('')}</div>`; }
function col(w, label, inner) {
  return `<div style="display:flex;flex-direction:column;gap:8px;width:${w}">${label ? sub(label) : ''}${inner}</div>`;
}

const PROPS = '{&quot;showControls&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showResponsive&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showDark&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;},&quot;showSpec&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Canvas&quot;}}';

function doc(sections, props, logic) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  body { margin:0; background:#EDEAE6; font-family:'Inter',sans-serif; color:#1C1B1A; -webkit-font-smoothing:antialiased; }
  a { color:#232019; text-decoration:none; }
  a:hover { color:#D96C3F; }
</style>
</helmet>
${sections.join('\n\n')}
</x-dc>
<script type="text/x-dc" data-dc-script data-props="${props || PROPS}">
${logic || `class Component extends DCLogic {
  renderVals() {
    return {
      showControls: this.props.showControls ?? true,
      showResponsive: this.props.showResponsive ?? true,
      showDark: this.props.showDark ?? true,
      showSpec: this.props.showSpec ?? true
    };
  }
}`}
</script>
</body>
</html>
`;
}

function intro(o) {
  return `<section style="padding:56px 56px 24px;display:flex;flex-direction:column;gap:14px;max-width:1100px">
  ${mono(12, '#6E6A64', o.kicker)}
  <h1 style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:46px;letter-spacing:-0.03em;line-height:1.04">${o.title}</h1>
  ${o.paras.map(p => `<p style="margin:0;font-size:16px;line-height:1.6;color:#3A3835;max-width:760px;text-wrap:pretty">${p}</p>`).join('\n  ')}
</section>`;
}
