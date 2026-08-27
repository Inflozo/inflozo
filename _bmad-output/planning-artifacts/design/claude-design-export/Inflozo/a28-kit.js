/* A28 Comments — shared render kit.
   NOTE: any literal Ghost Handlebars in emitted markup must be written with
   {&#8203;{ / }&#8203;} entities — a bare {{ … }} is a DC value hole and renders empty. */
/*
   Loaded by run_script via new Function(src + ';return {...}')().
   Every block takes a token object t, so light, dark and the three packs
   are the same code with a different t — the category's own rule.
   The one thing that does NOT take t is the Ghost block: it is drawn in
   Ghost's own colours and type, because that is the truth about it. */

const PACKS = {
  paper: {
    name: 'PAPER', r: 8, head: "Georgia,serif", body: "'Inter',sans-serif",
    l: { bg:'#FBF9F5', surface:'#FFFFFF', hover:'#F4F0E8', text:'#232019', muted:'#6B6459', border:'#EBE5DB', accent:'#D96C3F', onAccent:'#FFFFFF', contrast:'#232019', onContrast:'#FBF9F5', onContrastMuted:'#B5AC9C', contrastBorder:'#3A342B', stripe:'repeating-linear-gradient(45deg,#EDE4D8 0 10px,#E5DACB 10px 20px)', shadow:'0 4px 16px rgba(28,27,26,.08)', shadowSm:'0 1px 2px rgba(28,27,26,.06)' },
    d: { bg:'#171511', surface:'#211D17', hover:'#2A251E', text:'#F2EDE4', muted:'#A79E8F', border:'#332E27', accent:'#E0805A', onAccent:'#171511', contrast:'#EDE7DA', onContrast:'#171511', onContrastMuted:'#5A5348', contrastBorder:'#D2CBBC', stripe:'repeating-linear-gradient(45deg,#3A342B 0 10px,#332E26 10px 20px)', shadow:'none', shadowSm:'none' }
  },
  tangerine: {
    name: 'TANGERINE', r: 14, head: "'Bricolage Grotesque',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#FFF4EA', surface:'#FFFFFF', hover:'#F6E3D2', text:'#2A1B12', muted:'#7A6154', border:'#EFD8C3', accent:'#E8541F', onAccent:'#FFFFFF', contrast:'#2A1B12', onContrast:'#FFF4EA', onContrastMuted:'#B7A395', contrastBorder:'#433024', stripe:'repeating-linear-gradient(45deg,#F6E3D2 0 10px,#F0E0CE 10px 20px)', shadow:'0 4px 16px rgba(42,27,18,.08)', shadowSm:'0 1px 2px rgba(42,27,18,.06)' },
    d: { bg:'#1E1310', surface:'#2A1B15', hover:'#33241B', text:'#FDF3E7', muted:'#AA9B8E', border:'#3A2A21', accent:'#F27C4A', onAccent:'#1E1310', contrast:'#FDF3E7', onContrast:'#1E1310', onContrastMuted:'#6B5C50', contrastBorder:'#D8C9BB', stripe:'repeating-linear-gradient(45deg,#33241B 0 10px,#3B2A20 10px 20px)', shadow:'none', shadowSm:'none' }
  },
  ink: {
    name: 'INK', r: 6, head: "'Inter',sans-serif", body: "'Inter',sans-serif",
    l: { bg:'#F5F5F7', surface:'#FFFFFF', hover:'#E7E7EC', text:'#16161A', muted:'#63636E', border:'#E3E3E8', accent:'#2F6FED', onAccent:'#FFFFFF', contrast:'#16161A', onContrast:'#F5F5F7', onContrastMuted:'#9A9AA4', contrastBorder:'#2E2E34', stripe:'repeating-linear-gradient(45deg,#E7E7EC 0 10px,#DEDEE4 10px 20px)', shadow:'0 4px 16px rgba(22,22,26,.08)', shadowSm:'0 1px 2px rgba(22,22,26,.06)' },
    d: { bg:'#16161A', surface:'#1F1F25', hover:'#25252B', text:'#F4F4F6', muted:'#9C9CA2', border:'#2E2E34', accent:'#5A8CF5', onAccent:'#16161A', contrast:'#F4F4F6', onContrast:'#16161A', onContrastMuted:'#6C6C74', contrastBorder:'#C9C9D0', stripe:'repeating-linear-gradient(45deg,#25252B 0 10px,#1E1E24 10px 20px)', shadow:'none', shadowSm:'none' }
  }
};
function tok(pack, mode) {
  const p = PACKS[pack] || PACKS.paper;
  return Object.assign({ r: p.r, head: p.head, body: p.body, pack: p.name, mode }, mode === 'd' ? p.d : p.l);
}
const T = tok('paper', 'l');
const TD = tok('paper', 'd');

/* ---- fixtures ---- */
const CURRENT = {
  title: 'The four hundred domains that refuse to move',
  author: 'Rosa Menendez', ini: 'RM',
  bio: 'Writes about the parts of the internet that stopped changing. Ten years at a daily paper before this; now in Lisbon.'
};
const HEAD = 'Discussion';
const COUNT = '24 comments';
const COUNT_ZERO = 'No comments yet';
const COUNT_STRESS = '1,284 comments';
const RULE_LINE = 'Comments are open to members. Be civil, stay on the story, and no links to your own work.';
const RULES = ['Keep it about the story', 'Disagree with the argument, not the person', 'No promotional links'];
const RULES_STRESS = ['Keep it about the story, not the reporter, and not the last thing you read elsewhere', 'Disagree with the argument, not the person', 'No promotional links, and no reposting your newsletter', 'Moderated weekdays by Rosa and Marguerite'];
const PROMPT = {
  heading: 'Join the discussion',
  body: "Orbit Weekly members can comment on every story. It is free, and it takes a minute.",
  button: 'Sign up', signin: 'Already a member? Sign in'
};
const CLOSED = 'Comments are closed on this post.';

/* Ghost's own comments, drawn inside Ghost's own block. Not the theme's. */
const GC = [
  { name: 'Teodora Vasilescu', ini: 'TV', when: '2 days ago', body: 'I looked up three of the domains in the piece. Two still resolve to a server in Bucharest that was decommissioned in 2011, which is somehow more alarming than if they had simply gone dark.' },
  { name: 'Jonah Okafor', ini: 'JO', when: '1 day ago', body: 'The Thursday letter reference sent me back to the archive. Worth reading the 2019 piece alongside this one.' }
];

/* ---- width table ---- */
const SZ = {
  1440: { margin: 72, content: 1296, measure: 720, gut: 24, pad: 96 },
  834:  { margin: 40, content: 754,  measure: 754, gut: 24, pad: 80 },
  390:  { margin: 20, content: 350,  measure: 350, gut: 20, pad: 64 }
};

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const eyebrow = (t, txt, c) => `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c || t.muted};font-family:${t.body}">${txt}</span>`;
const hair = (t, c) => `<div style="height:1px;background:${c || t.border}"></div>`;

/* A1's avatar with A1's initials fallback — used by the theme's frame only. */
function avatar(t, p, size, ink) {
  if (p.photo === false) {
    return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${ink ? 'rgba(255,255,255,.16)' : t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-family:${t.head};font-size:${Math.round(size * 0.42)}px;font-weight:700;color:${ink || t.muted}">${p.ini}</span></span>`;
  }
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${t.stripe};flex-shrink:0;display:block"></span>`;
}

/* ================= THE GHOST BLOCK =================
   Drawn in Ghost's colours and Ghost's type, at .62 opacity, inside a dashed
   outline — because the theme cannot style one pixel of it. mode is 'light'
   or 'dark' and is the {{comments mode=}} attribute, NOT the pack's mode. */
const GHOST = {
  light: { bg:'transparent', text:'#15171A', muted:'#626D79', border:'#E1E3E6', field:'#FFFFFF', chip:'#F1F3F4', accent:'#15171A' },
  dark:  { bg:'transparent', text:'#F4F5F6', muted:'#9BA0A6', border:'#3A3D42', field:'rgba(255,255,255,.06)', chip:'rgba(255,255,255,.09)', accent:'#F4F5F6' }
};
const GFONT = "'Inter',-apple-system,sans-serif";

function gAvatar(g, size, ini) {
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:${g.chip};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:${GFONT};font-size:${Math.round(size * .36)}px;font-weight:600;color:${g.muted}">${ini}</span>`;
}
function gComment(g, c, w) {
  return `<div style="display:flex;gap:12px;align-items:flex-start">${gAvatar(g, 40, c.ini)}
    <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
      <div style="display:flex;gap:8px;align-items:baseline;font-family:${GFONT}"><span style="font-size:15px;font-weight:600;color:${g.text}">${c.name}</span><span style="font-size:13px;color:${g.muted}">${c.when}</span></div>
      <div style="font-family:${GFONT};font-size:15px;line-height:1.55;color:${g.text};max-width:${w}px">${c.body}</div>
      <div style="display:flex;gap:16px;font-family:${GFONT};font-size:13px;color:${g.muted};padding-top:2px"><span>♡ 4</span><span>Reply</span></div>
    </div></div>`;
}
function gEditor(g, w, txt) {
  return `<div style="display:flex;gap:12px;align-items:center">${gAvatar(g, 40, 'RM')}
    <div style="flex:1;height:44px;border:1px solid ${g.border};border-radius:6px;background:${g.field};display:flex;align-items:center;padding:0 14px;font-family:${GFONT};font-size:15px;color:${g.muted}">${txt || 'Join the discussion'}</div></div>`;
}
function gSignedOut(g) {
  return `<div style="border:1px solid ${g.border};border-radius:6px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;align-items:flex-start">
    <span style="font-family:${GFONT};font-size:16px;font-weight:600;color:${g.text}">Become a member of Orbit Weekly to start commenting</span>
    <span style="font-family:${GFONT};font-size:14px;color:${g.muted}">Ghost draws this prompt, its wording and its buttons.</span>
    <div style="display:flex;gap:10px;padding-top:4px">
      <span style="font-family:${GFONT};font-size:14px;font-weight:600;color:#FFFFFF;background:${g.accent};padding:9px 16px;border-radius:5px">Sign up</span>
      <span style="font-family:${GFONT};font-size:14px;font-weight:600;color:${g.text};border:1px solid ${g.border};padding:8px 15px;border-radius:5px">Sign in</span>
    </div></div>`;
}
/* state: 'member' | 'signedout' | 'zero' · compact drops one comment */
function ghostBlock(t, o = {}) {
  const mode = o.mode || (t.mode === 'd' ? 'dark' : 'light');
  const g = GHOST[mode];
  const state = o.state || 'member';
  const w = o.w || 720, textW = Math.min(w - 64, 620);
  const label = o.label === false ? '' :
    `<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">${mono(9.5, g.muted, `GHOST COMMENTS BLOCK · {&#8203;{comments title="" count=false mode="${mode}" saturation=60}&#8203;}`)}${mono(9.5, g.muted, o.labelRight || "GHOST'S COLOURS AND TYPE · THE THEME STYLES NOTHING INSIDE THIS OUTLINE ⚑")}</div>`;
  let body;
  if (state === 'signedout') body = [gSignedOut(g), gComment(g, GC[0], textW), o.compact ? '' : gComment(g, GC[1], textW)].join('');
  else if (state === 'zero') body = [gEditor(g, w), `<span style="font-family:${GFONT};font-size:14px;color:${g.muted}">Ghost draws nothing below the box until the first comment arrives.</span>`].join('');
  else body = [gEditor(g, w, o.editorText), gComment(g, GC[0], textW), o.compact ? '' : gComment(g, GC[1], textW)].join('');
  return `<div style="width:${o.flex ? 'auto' : w + 'px'};${o.flex ? 'flex:1;min-width:0;' : ''}border:1px dashed ${g.border};border-radius:${t.r}px;padding:${o.pad || '16px 18px 20px'};display:flex;flex-direction:column;gap:${o.gap || 18}px;opacity:${o.opacity || .72};box-sizing:border-box">${label}${body}</div>`;
}

/* ================= THE THEME'S FRAME =================
   Everything below here is the section, and every pixel of it is the design. */

/* Heading: Label · Heading · Count only · None. Count: Beside · Under · Off. */
function sectionHead(t, o = {}) {
  const kind = o.kind || 'Label', ink = o.ink || t.text, mutedInk = o.mutedInk || t.muted;
  const text = o.text || HEAD, count = o.count === undefined ? COUNT : o.count;
  const countEl = c => `<span style="font-size:${o.countSize || 15}px;color:${mutedInk};font-family:${t.body};white-space:nowrap">${c}</span>`;
  if (kind === 'None') return '';
  if (kind === 'Count only') {
    return `<span style="font-family:${t.head};font-size:${o.size || 22}px;font-weight:700;letter-spacing:-0.01em;color:${ink};${o.align === 'Centre' ? 'text-align:center;width:100%;display:block' : ''}">${count}</span>`;
  }
  const main = kind === 'Heading'
    ? `<span style="font-family:${t.head};font-size:${o.size || 28}px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:${ink}">${text}</span>`
    : eyebrow(t, text, mutedInk);
  if (o.countPos === 'Off' || count === false) {
    return `<span style="display:flex;width:100%;${o.align === 'Centre' ? 'justify-content:center' : ''}">${main}</span>`;
  }
  if (o.countPos === 'Under') {
    return `<span style="display:flex;flex-direction:column;gap:6px;${o.align === 'Centre' ? 'align-items:center' : 'align-items:flex-start'};width:100%">${main}${countEl(count)}</span>`;
  }
  return `<span style="display:flex;align-items:${kind === 'Heading' ? 'baseline' : 'center'};justify-content:${o.align === 'Centre' ? 'center' : 'space-between'};gap:${o.align === 'Centre' ? 12 : 24}px;width:100%">${main}${countEl(count)}</span>`;
}

/* The rules line — one sentence — and the rules list, 2 to 4 items. */
function rulesLine(t, o = {}) {
  return `<p style="margin:0;font-size:${o.size || 15}px;line-height:1.6;color:${o.ink || t.muted};font-family:${t.body};max-width:${o.w || 620}px;${o.align === 'Centre' ? 'margin:0 auto;text-align:center' : ''}">${o.text || RULE_LINE}</p>`;
}
function rulesList(t, o = {}) {
  const items = o.items || RULES;
  return `<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${o.gap || 8}px;max-width:${o.w || 320}px">
    ${items.map(r => `<li style="display:flex;gap:10px;align-items:flex-start;font-size:${o.size || 15}px;line-height:1.5;color:${o.ink || t.muted};font-family:${t.body}"><span style="width:5px;height:5px;border-radius:50%;background:${o.dot || t.border};flex-shrink:0;margin-top:7px"></span><span>${r}</span></li>`).join('')}
  </ul>`;
}

/* The member prompt — the theme's, drawn only where a design says so. */
function promptCard(t, o = {}) {
  const plain = o.style === 'Hairline';
  const ink = o.ink || t.text, mutedInk = o.mutedInk || t.muted;
  const form = o.form === 'Link only'
    ? `<span style="font-size:14px;font-weight:600;color:${o.accent || t.accent};font-family:${t.body}">${PROMPT.button} →</span>`
    : `<span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="height:44px;width:${o.fieldW || 280}px;border:1px solid ${o.border || t.border};border-radius:${t.r}px;background:${plain ? t.surface : t.bg};display:flex;align-items:center;padding:0 14px;font-size:15px;color:${mutedInk};font-family:${t.body};box-sizing:border-box">you@example.com</span><span style="height:44px;display:flex;align-items:center;background:${o.accent || t.accent};color:${o.onAccent || t.onAccent};font-size:14px;font-weight:600;padding:0 18px;border-radius:${t.r}px;font-family:${t.body}">${PROMPT.button}</span></span>`;
  return `<div style="${o.flex ? 'flex:1;min-width:0;' : `width:${o.w || 720}px;`}box-sizing:border-box;background:${plain ? 'transparent' : (o.ground || t.surface)};${plain ? `border-top:1px solid ${o.border || t.border};border-bottom:1px solid ${o.border || t.border};` : `border:1px solid ${o.border || t.border};border-radius:${t.r}px;box-shadow:${plain ? 'none' : t.shadowSm};`}padding:${o.pad || (plain ? '22px 0' : '24px 26px')};display:flex;flex-direction:column;gap:12px;align-items:${o.align === 'Centre' ? 'center' : 'flex-start'};${o.align === 'Centre' ? 'text-align:center;' : ''}">
    <span style="font-family:${t.head};font-size:${o.size || 22}px;font-weight:700;letter-spacing:-0.01em;color:${ink}">${PROMPT.heading}</span>
    <span style="font-size:15px;line-height:1.6;color:${mutedInk};font-family:${t.body};max-width:520px">${PROMPT.body}</span>
    ${form}
    <span style="font-size:13px;color:${mutedInk};font-family:${t.body}">${PROMPT.signin}</span>
  </div>`;
}

/* The notice that replaces the block when {{#if comments}} is false. */
function closedNotice(t, o = {}) {
  return `<div style="${o.flex ? 'flex:1;' : `width:${o.w || 720}px;`}box-sizing:border-box;border:1px solid ${o.border || t.border};border-radius:${t.r}px;padding:20px 22px;display:flex;align-items:center;gap:10px;background:${o.ground || 'transparent'}">
    <span style="font-size:15px;color:${o.ink || t.muted};font-family:${t.body}">${o.text || CLOSED}</span></div>`;
}

/* The disclosure bar — 7's summary row, a real <details> summary. */
function discloseBar(t, o = {}) {
  return `<div style="width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:${o.pad || '18px 0'};border-top:1px solid ${t.border};${o.open ? '' : `border-bottom:1px solid ${t.border};`}min-height:44px">
    <span style="display:flex;align-items:baseline;gap:14px">${o.kind === 'Heading' ? `<span style="font-family:${t.head};font-size:22px;font-weight:700;letter-spacing:-0.01em;color:${t.text}">${HEAD}</span>` : eyebrow(t, HEAD)}<span style="font-size:15px;color:${t.muted};font-family:${t.body}">${o.count || COUNT}</span></span>
    <span style="display:flex;align-items:center;gap:10px"><span style="font-size:14px;font-weight:600;color:${t.text};font-family:${t.body}">${o.open ? 'Hide' : 'Show'}</span><span style="font-size:11px;color:${t.muted};transform:rotate(${o.open ? '180deg' : '0deg'});display:inline-block">▼</span></span></div>`;
}

/* ---- frame chrome ---- */
/* The route: A25 body · A26 post footer · A28 THIS SECTION · A27 related · A3 footer ⚑ */
function footerAbove(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  const av = w === 390 ? 48 : 56;
  const mw = o.measure || Math.min(s.measure, s.content);
  return `<div style="display:flex;flex-direction:column;gap:10px;opacity:.45;width:${mw}px;margin:0 auto">
    ${hair(t)}
    <div style="display:flex;gap:16px;align-items:flex-start;padding-top:14px">${avatar(t, { photo: true }, av)}<div style="display:flex;flex-direction:column;gap:5px">
      <span style="font-family:${t.head};font-weight:700;font-size:19px;line-height:1.25;color:${t.text}">${CURRENT.author}</span>
      <span style="font-size:15px;line-height:1.6;color:${t.muted};font-family:${t.body};max-width:520px">${CURRENT.bio}</span>
    </div></div>
  </div>
  <div style="height:22px;display:flex;align-items:flex-end">${mono(10, t.muted, o.aboveNote || 'A26·1 POST FOOTER ABOVE · NOT THIS SECTION · DRAWN AT HALF OPACITY')}</div>`;
}
/* What sits below on a post route: A27's related set, then A3's footer. */
function relatedBelow(t, w, o = {}) {
  const s = SZ[w] || SZ[1440];
  const n = w === 390 ? 1 : 3;
  const cw = Math.floor((s.content - 24 * (n - 1)) / n);
  return `<div style="height:20px;display:flex;align-items:flex-end">${mono(10, t.muted, o.belowNote || 'A27·1 THREE UP AND A3 SITE FOOTER BELOW · NOT THIS SECTION')}</div>
  <div style="display:flex;flex-direction:column;gap:14px;opacity:.4;padding-top:12px">
    ${hair(t)}
    <div style="display:flex;gap:24px">${['The night shift at the Port of Algeciras', 'Why the new tram line stops short of the hospital', 'Rosa Ferreira on machines that do not exist yet'].slice(0, n).map(ti => `<div style="width:${cw}px;display:flex;flex-direction:column;gap:10px"><div style="height:${Math.round(cw / 1.5)}px;border-radius:${t.r}px;background:${t.stripe}"></div><span style="font-family:${t.head};font-size:19px;font-weight:700;line-height:1.2;color:${t.text}">${ti}</span></div>`).join('')}</div>
  </div>`;
}

function frame(w, t, inner, o = {}) {
  const s = SZ[w] || SZ[1440];
  const pad = o.padTop === undefined ? s.pad : o.padTop;
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,${t.mode === 'd' ? '.24' : '.14'});overflow:hidden;box-sizing:border-box">
    ${o.chrome === false ? '' : `<div style="height:${w === 390 ? 52 : 60}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${s.margin}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(t.r, 7)}px;background:${t.accent}"></span><span style="font-family:${t.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
      ${w === 390 ? `<span style="font-size:18px;color:${t.text}">☰</span>` : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${t.body}"><span>Reporting</span><span>Interviews</span><span>Archive</span><span style="color:${t.text};font-weight:600">Subscribe</span></div>`}
    </div>`}
    ${o.above === false ? '' : `<div style="padding:${o.top === undefined ? 32 : o.top}px ${s.margin}px 0">${footerAbove(t, w, o)}</div>`}
    <div style="${o.flush ? '' : `padding:0 ${s.margin}px`}">
      <div style="height:${pad}px;display:flex;align-items:flex-end;padding-bottom:4px;${o.flush ? `padding-left:${s.margin}px` : ''}">${o.padNote === false ? '' : mono(10, t.muted, `${pad} · A28'S OWN TOP PADDING · A28 SITS BELOW A26 AND ABOVE A27 ⚑`)}</div>
      ${inner}
      <div style="height:${o.padBottom === undefined ? pad : o.padBottom}px"></div>
    </div>
    ${o.below === false ? '' : `<div style="padding:0 ${s.margin}px 36px">${relatedBelow(t, w, o)}</div>`}
  </div>`;
}

/* A bare frame: the section alone. For state strips and pack crops. */
function crop(t, w, inner, o = {}) {
  return `<div style="width:${w}px;background:${o.ground || t.bg};border:1px solid ${t.border};border-radius:8px;padding:${o.pad || '20px'};box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px">${inner}${o.label ? sub(o.label) : ''}</div>`;
}

/* ---- the control panel ---- */
function seg(values, active) {
  return `<div style="display:flex;background:#EFECE7;border-radius:24px;padding:3px">${values.map(v => `<span style="flex:1;text-align:center;font-size:11.5px;padding:6px 4px;border-radius:24px;${v === active ? 'background:#FFFFFF;box-shadow:0 1px 2px rgba(28,27,26,.06);font-weight:600' : 'color:#6E6A64'}">${v}</span>`).join('')}</div>`;
}
function selectRow(value, disabled) {
  return `<div style="height:36px;background:${disabled ? '#F2EFEA' : '#FFFFFF'};border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:12.5px;color:${disabled ? '#8A857C' : '#1C1B1A'}">${value}</span><span style="font-size:10px;color:#8A857C">${disabled ? '🔒' : '▾'}</span></div>`;
}
function ctl(name, kind, values, active, hint, disabled) {
  const body = kind === 'seg' ? seg(values, active) : selectRow(active, disabled);
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${name}</span>${body}${hint ? `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${hint}</span>` : ''}</div>`;
}
/* The item controls for the rules list — only the designs that draw it get this. */
function itemList(o = {}) {
  const items = o.items || RULES;
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">House rules</span>
    <div style="display:flex;flex-direction:column;gap:6px">${items.map(r => `<div style="height:34px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;gap:8px;padding:0 9px"><span style="font-size:11px;color:#B3ADA3">⠿</span><span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r}</span><span style="font-size:11px;color:#8A857C">✕</span></div>`).join('')}
    <div style="height:34px;border:1px dashed #D8D2C8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#6E6A64">+ Add a rule</div></div>
    <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.hint || 'Two to four. <strong style="font-weight:600">A new rule lands at the foot reading "Be kind"</strong> ⚑ and is drag-ordered. Removing the last one turns the list off.'}</span></div>`;
}
/* The Comments block — three fields, identical in all ten, below the design's own
   controls and not counted toward the brief's 4–7. */
function blockBlock(o = {}) {
  return `<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">THE COMMENTS BLOCK · IDENTICAL IN ALL TEN · NOT COUNTED</span>
    ${ctl('Block colour', 'select', null, o.mode || 'Match the page', o.modeHint === false ? '' : 'Match the page · Light · Dark. Compiles to <strong style="font-weight:600">{&#8203;{comments mode=}&#8203;}</strong>; the block has no other colour control ⚑.')}
    ${ctl('Avatars', 'seg', ['Muted', 'Standard', 'Vivid'], o.sat || 'Standard', o.satHint === false ? '' : 'Ghost\'s <strong style="font-weight:600">saturation</strong> attribute — 40 · 60 · 80. The only other thing the helper exposes.')}
    ${ctl('When commenting is off', 'select', null, o.closed || 'Show the notice', o.closedHint === false ? '' : 'Or Hide the section. Fires when <strong style="font-weight:600">{&#8203;{#if comments}&#8203;}</strong> is false ⚑.')}
    ${ctl('Who can comment', 'select', null, 'Paid members only', 'Read-only here. <strong style="font-weight:600">Ghost → Settings → Membership → Commenting</strong> owns it; the section reports it and cannot change it ⚑.', true)}
  </div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 10 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.block === false ? '' : blockBlock(o.blockOpts || {})}
    <div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${o.count} CONTROLS + THE BLOCK</span></div></div>`;
}
function panelNote(title, paras, w) {
  return `<div style="width:${w || 948}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${sub(title)}${paras.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function specCol(items, w) {
  return `<div style="width:${w || 634}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;font-size:12.5px;line-height:1.65;color:#3A3835">${items.map(p => `<span>${p}</span>`).join('')}</div>`;
}
function trow(cols, widths, headRow) {
  return `<div style="display:grid;grid-template-columns:${widths};${headRow ? 'background:#F7F5F2;' : ''}border-bottom:1px solid ${headRow ? '#E7E2DB' : '#F1EDE6'}">${cols.map(c => `<span style="font-size:${headRow ? 10.5 : 11.5}px;${headRow ? 'font-weight:600;color:#6E6A64;letter-spacing:.04em;text-transform:uppercase;' : 'color:#3A3835;'}padding:${headRow ? '8px 11px' : '7px 11px'};line-height:1.45">${c}</span>`).join('')}</div>`;
}
function table(rows, widths, w) {
  return `<div style="width:${w || 1288}px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:12px;overflow:hidden;box-sizing:border-box">${rows.map((r, i) => trow(r, widths, i === 0)).join('')}</div>`;
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

/* The ten spec fields, in order, as one pair of columns. */
function specSection(label, o) {
  const left = [
    `${b('1 · Descriptor.')} ${o.descriptor}`,
    `${b('2 · Structural descriptor.')} ${code(o.tuple)}<br><span style="color:#6B6459">${o.tupleNote}</span>`,
    `${b('3 · Archetype.')} ${o.archetype}`,
    `${b('4 · Responsive rule.')} ${o.responsive}`,
    `${b('5 · Content fields.')} ${o.fields}`
  ];
  const right = [
    `${b('6 · Controls, in sidebar order.')} ${o.controls}`,
    `${b('7 · Data.')} ${o.data}`,
    `${b('8 · Empty state.')} ${o.empty}`,
    `${b('9 · Behaviour module.')} ${o.module}`,
    `${b('10 · Accessibility.')} ${o.a11y}`,
    `${b('Flagged ⚑')} ${o.flagged}`
  ];
  return section(label, 'THE WRITTEN SPEC · ALL TEN FIELDS', stack([specCol(left), specCol(right)]));
}

/* One design file, assembled. Each design supplies render(t, w, vals) and its words. */
function buildDesign(o) {
  const vals = o.vals || {}, tabletVals = o.tabletVals || vals, mobileVals = o.mobileVals || vals;
  const S = [];
  S.push(intro({ kicker: `A28 COMMENTS · DESIGN ${o.n} OF 10 · PAPER PACK · ${o.countWord} CONTROLS + THE COMMENTS BLOCK`, title: o.title, paras: o.paras }));

  S.push(section(`A28-${o.n} desktop light`, o.primaryCap,
    [frame(1440, T, o.render(T, 1440, vals), o.frameOpts || {}), note(o.primaryNote)].join('\n  ')));

  S.push(section(`A28-${o.n} states`, o.statesCap,
    [(o.states || []).map(s => crop(s.dark ? TD : T, s.w || 1336, s.inner, { label: s.label, ground: s.ground, pad: s.pad })).join(''), note(o.statesNote)].join('\n  '),
    '0 56px 48px'));

  S.push(wrapIf('showControls', section(`A28-${o.n} controls`, `THE CONTROL PANEL · ${o.countWord} CONTROLS + THE SHARED COMMENTS BLOCK`,
    stack([panel(o.panel), panelNote(o.panelNoteTitle || 'WHAT THIS PANEL SETTLES', o.panelNote)]))));

  S.push(wrapIf('showResponsive', section(`A28-${o.n} responsive`, o.responsiveCap,
    [stack([
      col('834px', o.tabletLabel, frame(834, T, o.render(T, 834, tabletVals), o.tabletFrameOpts || o.frameOpts || {})),
      col('390px', o.mobileLabel, frame(390, T, o.render(T, 390, mobileVals), o.mobileFrameOpts || o.frameOpts || {}))
    ]), note(o.responsiveNote)].join('\n  '))));

  S.push(wrapIf('showDark', section(`A28-${o.n} dark`, o.darkCap,
    [frame(1440, TD, o.render(TD, 1440, o.darkVals || vals), o.frameOpts || {}), note(o.darkNote)].join('\n  '))));

  S.push(wrapIf('showSpec', specSection(`A28-${o.n} spec`, o.spec)));
  return doc(S);
}
