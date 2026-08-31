/* A21 Author Showcases — shared render kit.
   NOTE: any literal Ghost Handlebars in emitted markup must be written with
   {&#8203;{ / }&#8203;} entities — a bare {{ … }} is a DC value hole and renders empty.
   Loaded by run_script via new Function(src + ';return {...}')().
   Every block takes a token object t, so light, dark and the three packs are the
   same code with a different t — the category's own rule. */

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

/* ---- fixtures ---- Orbit Weekly's masthead. Twelve, because §8 asks for twelve. */
const AUTHORS = [
  { name:'Rosa Menendez', ini:'R', img:true, n:68, bio:'Writes about the parts of the internet that stopped changing. Ten years at a daily paper before this.', loc:'Lisbon', site:'rosamenendez.com', x:'rosamz' },
  { name:'Tomás Alvarez', ini:'T', img:true, n:41, bio:'Transport and procurement, and the long argument about the ring road.', loc:'Seville', site:null, x:'tomasalv' },
  { name:'Ada Fenwick', ini:'A', img:true, n:37, bio:'Energy desk. Formerly a grid operator, which explains the spreadsheets.', loc:'Leeds', site:'adafenwick.co.uk', x:null },
  { name:'Inês Duarte', ini:'I', img:false, n:29, bio:'Runs the picture desk. Shoots most of the portraits on this site.', loc:'Porto', site:null, x:null },
  { name:'Jonah Weiss', ini:'J', img:true, n:24, bio:null, loc:null, site:null, x:null },
  { name:'Priya Raghunathan', ini:'P', img:true, n:19, bio:'Housing, rents, and the paperwork underneath both.', loc:'Bristol', site:null, x:'priyarag' },
  { name:'Callum Boyd', ini:'C', img:true, n:14, bio:'Weekend editor. Interviews, mostly.', loc:'Glasgow', site:null, x:null },
  { name:'Mei Lin Chow', ini:'M', img:true, n:11, bio:'Climate reporting and the money that moves with it.', loc:'Singapore', site:'meilinchow.com', x:null },
  { name:'Dara Okonjo', ini:'D', img:true, n:9, bio:'Data and maps.', loc:'Lagos', site:null, x:'daraok' },
  { name:'Henrik Sørensen', ini:'H', img:true, n:7, bio:'Corrections, letters and the style guide.', loc:'Copenhagen', site:null, x:null },
  { name:'Sofia Marchetti', ini:'S', img:true, n:6, bio:'Culture desk, and the Friday film column.', loc:'Milan', site:null, x:null },
  { name:'Owen Pritchard', ini:'O', img:true, n:4, bio:'Fact-checking and the archive.', loc:'Cardiff', site:null, x:null }
];
const ONE = [AUTHORS[0]];
const BARE = [
  { name:'Jonah Weiss', ini:'J', img:false, n:24, bio:null, loc:null, site:null, x:null },
  { name:'Inês Duarte', ini:'I', img:false, n:29, bio:null, loc:null, site:null, x:null },
  { name:'Owen Pritchard', ini:'O', img:false, n:1, bio:null, loc:null, site:null, x:null }
];
const STRESS = [
  { name:'Maria-Christina Vasconcelos de Almeida', ini:'M', img:true, n:1, bio:'Reports on municipal procurement, the maintenance backlog and the budget lines that decide which bridge gets fixed this year and which one waits until the next one, which is longer than any bio anybody should write.', loc:'Vila Nova de Gaia', site:'vasconcelosdealmeida.pt', x:'mcvasconcelos' },
  { name:'Jo Ng', ini:'J', img:false, n:0, bio:null, loc:null, site:null, x:null },
  { name:'Tomás Alvarez', ini:'T', img:true, n:41, bio:'Transport and procurement, and the long argument about the ring road.', loc:'Seville', site:null, x:'tomasalv' }
];
const SITE = { name: 'Orbit Weekly', total: 214, writers: 12 };
const HEAD = { eyebrow: 'The masthead', heading: 'The people who write Orbit Weekly', blurb: 'Twelve reporters, one picture desk, and a corrections column nobody volunteers for. Every name here links to everything they have written.' };
const NOTICE = 'No writers to show yet. As soon as someone publishes their first post, they appear here.';
const CTA = 'Write for us';
const plural = a => `${a.n} ${a.n === 1 ? 'post' : 'posts'}`;
const firstName = a => a.name.split(' ')[0];
const take = n => AUTHORS.slice(0, n);

/* ---- width table (A17's, unchanged) ---- */
const SZ = {
  1440: { margin: 72, content: 1296, gut: 24, pad: 96 },
  834:  { margin: 40, content: 754,  gut: 24, pad: 80 },
  390:  { margin: 20, content: 350,  gut: 20, pad: 64 }
};

/* ---- primitives ---- */
const MONO = "'JetBrains Mono',monospace";
const mono = (s, c, txt) => `<span style="font-family:${MONO};font-size:${s}px;color:${c}">${txt}</span>`;
const cap = txt => `<div style="font-family:${MONO};font-size:12px;color:#6E6A64">${txt}</div>`;
const sub = txt => `<span style="font-family:${MONO};font-size:11px;color:#6E6A64">${txt}</span>`;
const note = (txt, w) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#6B6459;max-width:${w || 1290}px">${txt}</p>`;
const b = txt => `<strong style="font-weight:600">${txt}</strong>`;
const code = txt => `<code style="font-family:${MONO};font-size:12px">${txt}</code>`;
const hb = s => s.replace(/\{\{/g, '{&#8203;{').replace(/\}\}/g, '}&#8203;}');
const hbc = s => code(hb(s));
const eyebrowEl = (t, txt, c) => `<span style="font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${c || t.muted};font-family:${t.body}">${txt}</span>`;
const hair = (t, c) => `<div style="height:1px;background:${c || t.border}"></div>`;
const gap = h => `<div style="height:${h}px"></div>`;

/* A1's striped plate with its mono caption. */
function plate(t, w, h, label, radius) {
  return `<div style="${w ? `width:${w}px;` : 'width:100%;'}height:${h}px;border-radius:${radius === undefined ? t.r : radius}px;background:${t.stripe};display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;overflow:hidden">${label === false ? '' : mono(9.5, t.muted, label || 'AUTHOR PORTRAIT')}</div>`;
}
/* A1·6's avatar, with A1·6's initials fallback. Circle by default; Rounded square
   is one control value in three designs and uses the pack radius.
   AVATARS WITH NO PHOTOGRAPH ⚑ 29 August 2026: a writer pulled from Ghost shows
   ONE letter, never two — Ghost cannot produce two initials from a name, and every
   `ini` in the fixtures is one character for that reason. Lists the user types
   themselves (A12's authored people) keep two; A21 has none of those. */
function portrait(t, a, size, o = {}) {
  const rad = o.shape === 'square' ? `${Math.round(t.r * (size > 90 ? 1.6 : 1))}px` : '50%';
  const ring = o.ring ? `box-shadow:0 0 0 3px ${o.ring};` : '';
  if (a.img === false || o.initials) {
    return `<span style="width:${size}px;height:${size}px;border-radius:${rad};background:${o.ink ? 'rgba(255,255,255,.14)' : t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0;${ring}"><span style="font-family:${t.head};font-size:${Math.round(size * 0.38)}px;font-weight:700;color:${o.ink || t.muted}">${a.ini}</span></span>`;
  }
  return `<span style="width:${size}px;height:${size}px;border-radius:${rad};background:${t.stripe};flex-shrink:0;display:block;${ring}"></span>`;
}
/* A portrait at picture scale — A26·11's call: a photograph, not an avatar. */
function portraitPlate(t, a, w, h, o = {}) {
  if (a.img === false) {
    return `<div style="width:${w}px;height:${h}px;border-radius:${o.radius === undefined ? t.r : o.radius}px;background:${t.hover};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-family:${t.head};font-size:${Math.round(Math.min(w, h) * 0.3)}px;font-weight:700;color:${t.muted}">${a.ini}</span></div>`;
  }
  return `<div style="width:${w}px;height:${h}px;border-radius:${o.radius === undefined ? t.r : o.radius}px;background:${t.stripe};flex-shrink:0;display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;overflow:hidden">${mono(9.5, t.muted, o.label || 'AUTHOR PORTRAIT 4:5')}</div>`;
}
function nameEl(t, a, size, o = {}) {
  const s = size || 21;
  return `<span style="font-family:${t.head};font-size:${s}px;font-weight:700;line-height:${s >= 56 ? 1.02 : (s >= 30 ? 1.1 : 1.25)};letter-spacing:${s >= 56 ? '-0.03em' : (s >= 30 ? '-0.02em' : '-0.01em')};color:${o.ink || t.text};${o.w ? `max-width:${o.w}px;` : ''}display:block;text-wrap:pretty">${o.text || a.name}</span>`;
}
function bioEl(t, a, o = {}) {
  if (!a.bio && !o.text) return '';
  const lines = o.lines || 2;
  return `<span style="font-size:${o.size || 15}px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};${o.w ? `max-width:${o.w}px;` : ''}display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;overflow:hidden;text-wrap:pretty">${o.text || a.bio}</span>`;
}
function countEl(t, a, o = {}) {
  return `<span style="font-size:${o.size || 13}px;color:${o.mutedInk || t.muted};font-family:${t.body};font-variant-numeric:tabular-nums;white-space:nowrap">${o.text || plural(a)}</span>`;
}
/* A29·12's archive meta line, verbatim: 14 px muted items separated by ·,
   absent items dropped with their separators. */
function metaEl(t, a, o = {}) {
  const items = (o.items || [a.loc, a.site, plural(a)]).filter(Boolean);
  if (!items.length) return '';
  return `<span style="display:flex;flex-wrap:wrap;align-items:center;gap:0 10px;font-size:${o.size || 14}px;color:${o.mutedInk || t.muted};font-family:${t.body}">${items.map((m, i) => `${i ? '<span>·</span>' : ''}<span style="font-variant-numeric:tabular-nums">${m}</span>`).join('')}</span>`;
}
/* The archive link — A1's ghost action, pointed at the author's A29 route. */
function archiveLink(t, a, o = {}) {
  return `<span style="display:inline-flex;align-items:center;gap:6px;min-height:${o.h || 44}px;font-size:${o.size || 14}px;font-weight:500;color:${o.ink || t.text};font-family:${t.body}">${o.text || (a ? `${firstName(a)}’s posts` : 'The full masthead')}<span style="color:${o.mutedInk || t.muted}">→</span></span>`;
}
/* A1's primary button and its link variant. */
function actionEl(t, o = {}) {
  if (o.kind === 'Link') return `<span style="display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:${o.accent || t.accent};font-family:${t.body}">${o.text || CTA} →</span>`;
  return `<span style="height:44px;display:inline-flex;align-items:center;background:${o.outline ? 'transparent' : (o.fill || t.accent)};color:${o.outline ? (o.fill || t.accent) : (o.onAccent || t.onAccent)};font-size:14px;font-weight:600;padding:0 18px;border-radius:${t.r}px;font-family:${t.body};${o.outline ? `border:1px solid ${o.fill || t.accent};` : ''}box-sizing:border-box">${o.text || CTA}</span>`;
}
/* The author social row. Drawn with Ghost's own block helper ⚑ 29 August 2026:
   {{#social_accounts author}} … {{/social_accounts}}. Nine platforms — x,
   facebook, linkedin, bluesky, threads, mastodon, tiktok, youtube, instagram —
   and the helper SKIPS any platform with nothing set, which is the category's
   "an absent handle reserves nothing" rule kept by Ghost rather than by us.
   THE THEME ASSEMBLES NO ADDRESS: Ghost stores a handle in several shapes (bare
   handle, @handle, whole URL, a server for Mastodon and Bluesky), so gluing on a
   prefix produces broken links. Per account the helper gives `href` (finished
   address), `name` (the platform's own label — use it as the accessible name)
   and `type` (the platform key). The icon is chosen from `type` through a
   FALLBACK, so a platform Ghost adds before this theme has an icon renders
   instead of erroring the page.
   THE WEBSITE IS NOT ONE OF THE NINE ⚑ — it is the author's own `website` field,
   drawn beside the row.
   Each account is a P0·2 icon slot from the brand set — a 32 px box in a 44 px
   target ⚑. The earlier "the theme checks nine fields, there is no loop" note
   was wrong and is withdrawn. */
const SOCIAL_ORDER = ['facebook', 'twitter', 'linkedin', 'threads', 'bluesky', 'mastodon', 'tiktok', 'youtube', 'instagram', 'website'];
const SOCIAL_LEGACY = ['facebook', 'twitter', 'website']; /* pre-helper sites */
const SOCIAL_GLYPH = {
  facebook: '<path d="M14 21v-8h3l1-4h-4V7a2 2 0 0 1 2-2h2V1.5A22 22 0 0 0 15.5 1C13 1 11 3 11 6v3H7v4h4v8z"></path>',
  twitter: '<path d="M4 4l11.7 16H20L8.3 4z"></path><path d="M4 20l6.8-7.4M13.2 11.3L20 4"></path>',
  linkedin: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><line x1="8" y1="11" x2="8" y2="16"></line><line x1="8" y1="8" x2="8" y2="8.01"></line><line x1="12" y1="16" x2="12" y2="11"></line><path d="M16 16v-3a2 2 0 0 0-4 0"></path>',
  threads: '<path d="M12 20.5c-5 0-8-3.4-8-8.5S7 3.5 12 3.5c3.4 0 5.7 1.4 6.9 3.6"></path><path d="M9.5 13.6c0 1.6 1.3 2.4 2.7 2.4 2.2 0 3.3-1.4 3.3-4.4-1-.7-2.2-1-3.4-.9-1.6.1-2.6.9-2.6 2.9z"></path>',
  bluesky: '<path d="M12 10C11 7 8 3.5 5.5 3.5 4 3.5 3.5 5 3.5 7c0 4 3 6.5 6 7-2 .5-3.5 2-2.5 4 .8 1.6 3.3.7 5-2.5 1.7 3.2 4.2 4.1 5 2.5 1-2-.5-3.5-2.5-4 3-.5 6-3 6-7 0-2-.5-3.5-2-3.5C16 3.5 13 7 12 10z"></path>',
  mastodon: '<path d="M18.6 15.5c2-1 2.4-5 2.4-7 0-4-2.6-5.3-9-5.3S3 4.5 3 8.5c0 6 1.5 9.5 7 9.5 1.2 0 2.3-.2 3-.5"></path><path d="M8.5 12V8.7a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.5 1V12"></path>',
  tiktok: '<path d="M10 13a3 3 0 1 0 3 3V4c.8 2 2.3 3.2 4.5 3.4"></path>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"></rect><path d="M10 9.5l5 2.5-5 2.5z"></path>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.5"></circle>',
  website: '<circle cx="12" cy="12" r="8.5"></circle><line x1="3.5" y1="12" x2="20.5" y2="12"></line><path d="M12 3.5c2.5 3 2.5 14 0 17M12 3.5c-2.5 3-2.5 14 0 17"></path>'
};
/* a — the author object: any of the ten keys, filled or absent. Absent keys drop. */
function socialRow(t, a = {}, o = {}) {
  const order = o.legacy ? SOCIAL_LEGACY : SOCIAL_ORDER;
  const filled = order.filter(n => a[n] || (n === 'twitter' && a.x));
  if (!filled.length) return '';
  const ink = o.mutedInk || t.muted;
  const slots = filled.map(n => {
    const glyph = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SOCIAL_GLYPH[n]}</svg>`;
    return `<span title="brand-${n === 'twitter' ? 'x' : n}" style="width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><span style="width:32px;height:32px;border:1px solid ${o.border || t.border};border-radius:${Math.min(t.r, 8)}px;display:inline-flex;align-items:center;justify-content:center">${glyph}</span></span>`;
  }).join('');
  return `<span style="display:flex;align-items:center;gap:0;flex-wrap:wrap;margin-left:-6px">${slots}</span>`;
}
/* A19·3's surface card: radius token, md shadow in light, hairline in dark. */
function cardBox(t, inner, o = {}) {
  return `<div style="${o.w ? `width:${o.w}px;` : 'width:100%;'}background:${o.ground || t.surface};border-radius:${t.r}px;box-shadow:${t.mode === 'd' ? 'none' : (o.flat ? t.shadowSm : t.shadow)};${t.mode === 'd' || o.flat ? `border:1px solid ${t.border};` : ''}padding:${o.pad === undefined ? '28px' : o.pad};box-sizing:border-box;overflow:hidden;${o.style || ''}">${inner}</div>`;
}
/* The section head — eyebrow, heading, blurb, optional action. Every design
   that has a head uses this one. */
function headBlock(t, o = {}) {
  const centre = o.align === 'Centre';
  const parts = [];
  if (o.eyebrow !== false) { parts.push(eyebrowEl(t, o.eyebrowText || HEAD.eyebrow, o.mutedInk || t.muted)); parts.push(gap(o.gapEyebrow || 14)); }
  parts.push(`<h2 style="margin:0;font-family:${t.head};font-size:${o.size || 40}px;font-weight:700;line-height:${(o.size || 40) >= 56 ? 1.02 : 1.1};letter-spacing:-0.03em;color:${o.ink || t.text};${o.w ? `max-width:${o.w}px;` : ''}text-wrap:pretty">${o.headingText || HEAD.heading}</h2>`);
  if (o.blurb !== false) {
    parts.push(gap(o.gapBlurb || 16));
    parts.push(`<p style="margin:0;font-size:${o.blurbSize || 17}px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};max-width:${o.blurbW || 620}px;text-wrap:pretty">${o.blurbText || HEAD.blurb}</p>`);
  }
  if (o.action) {
    parts.push(gap(18));
    parts.push(`<div style="display:flex;${centre ? 'justify-content:center' : ''}">${actionEl(t, { kind: o.action, fill: o.fill, onAccent: o.onAccent, text: o.actionText, outline: o.outline })}</div>`);
  }
  return `<div style="display:flex;flex-direction:column;${centre ? 'align-items:center;text-align:center;' : ''}${o.w ? `max-width:${o.w}px;` : ''}${centre && o.w ? 'margin:0 auto;' : ''}">${parts.join('')}</div>`;
}
/* The zero-writer notice — A29·1's line, re-pointed at authors. */
function noticeEl(t, o = {}) {
  return `<p style="margin:0;font-size:${o.size || 17}px;line-height:1.6;color:${o.mutedInk || t.muted};font-family:${t.body};max-width:${o.w || 560}px">${o.text || NOTICE}</p>`;
}

/* ---- frame chrome ---- */
/* The route: A1 site header · A4 hero · A21 THIS SECTION · A6 CTA · A3 footer ⚑ */
function siteHeader(t, w) {
  const s = SZ[w] || SZ[1440];
  return `<div style="height:${w === 390 ? 52 : 60}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${t.border};padding:0 ${s.margin}px">
      <div style="display:flex;align-items:center;gap:10px"><span style="width:24px;height:24px;border-radius:${Math.min(t.r, 7)}px;background:${t.accent}"></span><span style="font-family:${t.head};font-size:16px;font-weight:700;color:${t.text}">Orbit Weekly</span></div>
      ${w === 390 ? `<span style="font-size:18px;color:${t.text}">☰</span>` : `<div style="display:flex;align-items:center;gap:20px;font-size:15px;color:${t.muted};font-family:${t.body}"><span>Reporting</span><span>Interviews</span><span style="color:${t.text};font-weight:600">Writers</span><span>Subscribe</span></div>`}
    </div>`;
}
function ctaBelow(t, w, o = {}) {
  return `<div style="height:22px;display:flex;align-items:flex-end">${mono(10, t.muted, o.belowNote || 'A6·1 CTA BANNER BELOW · NOT THIS SECTION · DRAWN AT LOW OPACITY')}</div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px;opacity:.4;padding-top:20px">
    <span style="font-family:${t.head};font-size:${w === 390 ? 24 : 30}px;font-weight:700;color:${t.text};text-align:center">Get the Friday edition</span>
    <span style="height:40px;display:inline-flex;align-items:center;background:${t.accent};color:${t.onAccent};font-size:14px;font-weight:600;padding:0 18px;border-radius:${t.r}px;font-family:${t.body}">Subscribe</span>
  </div>`;
}
function frame(w, t, inner, o = {}) {
  const s = SZ[w] || SZ[1440];
  const pad = o.padTop === undefined ? s.pad : o.padTop;
  const padNote = o.padNoteText === undefined ? `${pad} · A21'S OWN TOP PADDING · A21 SITS BETWEEN PAGE SECTIONS ⚑` : o.padNoteText;
  return `<div style="width:${w}px;background:${t.bg};border-radius:8px;box-shadow:0 12px 40px rgba(28,27,26,${t.mode === 'd' ? '.24' : '.14'});overflow:hidden;box-sizing:border-box">
    ${o.chrome === false ? '' : siteHeader(t, w)}
    <div style="${o.flush ? '' : `padding:0 ${s.margin}px`}">
      <div style="height:${pad}px;display:flex;align-items:flex-end;padding-bottom:4px;${o.flush ? `padding-left:${s.margin}px;` : ''}">${padNote === false ? '' : mono(10, t.muted, padNote)}</div>
      ${inner}
      <div style="height:${o.padBottom === undefined ? pad : o.padBottom}px"></div>
    </div>
    ${o.below === false ? '' : `<div style="padding:0 ${s.margin}px 36px">${ctaBelow(t, w, o)}</div>`}
  </div>`;
}
/* A bare frame: the section alone. For state strips and pack crops. */
function crop(t, w, inner, o = {}) {
  return `<div style="width:${w}px;background:${o.ground || t.bg};border:1px solid ${t.border};border-radius:8px;padding:${o.pad === undefined ? '20px' : o.pad};box-sizing:border-box;display:flex;flex-direction:column;gap:${o.gap || 10}px;overflow:hidden">${inner}${o.label ? `<span style="font-family:${MONO};font-size:11px;color:${o.labelInk || '#6E6A64'};padding:${o.pad === '0' ? '0 20px 16px' : '0'}">${o.label}</span>` : ''}</div>`;
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
/* The Data group — the Writers block. Eight rows plus one conditional list,
   identical in all fifteen, below the design's own controls and the universal
   trio, and not counted toward any design's control count ⚑. P0·5's
   "Populate from…" panel configured for authors.
   ITEM COUNTS ARE A NUMBER PICKER ⚑ 29 August 2026: How many is a stepper, 1 to
   the design's own maximum, and the old Three · Six · Twelve · All row is gone.
   "All" is retired — it promised a number this document cannot name.
   THE REMOVE BUTTON NEVER GREYS OUT ⚑: the hand-picked list's ✕ stays visible
   and clickable at one reference and explains why it cannot go lower. */
function stepRow(n, disabled) {
  return `<div style="height:36px;background:${disabled ? '#F2EFEA' : '#FFFFFF'};border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 10px"><span style="font-size:12px;color:#8A857C">−</span><span style="font-size:12.5px;font-weight:600;color:${disabled ? '#8A857C' : '#1C1B1A'}">${n}</span><span style="font-size:12px;color:#8A857C">+</span></div>`;
}
function stepCtl(name, n, hint, disabled) {
  return `<div style="display:flex;flex-direction:column;gap:5px"><span style="font-size:12px;font-weight:500;color:#6E6A64">${name}</span>${stepRow(n, disabled)}${hint ? `<span style="font-size:11px;color:#6E6A64;line-height:1.5">${hint}</span>` : ''}</div>`;
}
function sourceBlock(o = {}) {
  const cap = o.cap || 24, many = o.many === undefined ? 6 : o.many;
  return `<div style="border-top:1px solid #E7E2DB;padding-top:13px;display:flex;flex-direction:column;gap:11px">
    <span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:#6E6A64">THE DATA GROUP · THE WRITERS BLOCK · IDENTICAL IN ALL FIFTEEN · NOT COUNTED</span>
    ${ctl('Writers', 'select', null, o.src || 'All writers', 'All writers · Hand-picked ⚑. ' + hbc('{{#get "authors" include="count.posts"}}') + '. <strong style="font-weight:600">Ghost returns only authors with a published post</strong> ⚑.')}
    ${ctl('How many', 'select', null, '', '', true) && stepCtl('How many', many, o.manyHint === false ? '' : `<strong style="font-weight:600">A number picker, 1–${cap}</strong> ⚑ 29 August 2026 — item counts are a number picker, never a row of fixed buttons; it drew Three · Six · Twelve · All, and <strong style="font-weight:600">"All" is retired</strong>. Numbers above this design's own maximum are drawn greyed with the reason in place. <strong style="font-weight:600">Disabled at Hand-picked</strong>, where the list is the count ⚑.`, o.manyDisabled)}
    ${ctl('Order', 'select', null, o.order || 'Most posts', o.orderHint === false ? '' : `Most posts · Name A–Z · Newest account ⚑ — ${hbc('order="count.posts desc"')}, ${hbc('"name asc"')}, ${hbc('"created_at desc"')}. <strong style="font-weight:600">Ghost has no editorial ordering of authors</strong> ⚑. Disabled at Hand-picked.`)}
    ${ctl('Bio', 'select', null, o.bio || 'From Ghost', o.bioHint === false ? '' : `From Ghost · Off. Reads ${hbc('{{bio}}')}; <strong style="font-weight:600">most Ghost authors have none</strong> ⚑, so absence is the normal case.`, o.bioDisabled)}
    ${ctl('Role', 'select', null, o.role || 'Off', 'Off · Authored per writer ⚑ — one short string per author, keyed by slug. <strong style="font-weight:600">Never a Ghost field and it never claims to be</strong> ⚑.')}
    ${ctl('Each writer links to', 'select', null, o.link || 'Their author archive', 'Read-only. Ghost\'s ' + hbc('{{url}}') + ' — <strong style="font-weight:600">the A29 archive route</strong>; the section cannot repoint it ⚑.', true)}
    ${ctl('When there are no writers', 'select', null, o.empty || 'Head and notice', o.emptyHint === false ? '' : 'Head and notice · Hide the section ⚑. <strong style="font-weight:600">Hiding is offered here and was not in A29</strong> — A21 is never the only section on its route ⚑.')}
  </div>`;
}
function panel(o) {
  return `<div style="width:320px;background:#F7F5F2;border:1px solid #E7E2DB;border-radius:12px;box-shadow:0 1px 2px rgba(28,27,26,.06);padding:18px;display:flex;flex-direction:column;gap:15px;box-sizing:border-box">
    <div style="display:flex;flex-direction:column;gap:7px;border-bottom:1px solid #E7E2DB;padding-bottom:14px">
      <span style="font-size:12px;font-weight:500;color:#6E6A64">Design</span>
      <div style="height:38px;background:#FFFFFF;border:1px solid #E7E2DB;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 11px"><span style="font-size:13px;font-weight:600">${o.name}</span><span style="font-size:10px;color:#8A857C">${o.n} / 15 ▾</span></div>
      <span style="font-size:11px;color:#6E6A64;line-height:1.5">${o.blurb}</span>
    </div>
    ${o.controls.join('\n')}
    ${o.source === false ? '' : sourceBlock(o.sourceOpts || {})}
    <div style="border-top:1px solid #E7E2DB;padding-top:12px;display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#6E6A64">Reset this design</span><span style="margin-left:auto;font-family:${MONO};font-size:10.5px;color:#6E6A64">${o.count} CONTROLS + THE SOURCE</span></div></div>`;
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
    `${b('Repeating items ⚑')} ${o.items}`,
    `${b('Flagged ⚑')} ${o.flagged}`
  ];
  return section(label, 'THE WRITTEN SPEC · ALL TEN FIELDS', stack([specCol(left), specCol(right)]));
}

/* Design 2 Cards' render lives in the kit because the category proof re-renders
   it in three packs, light and dark — one function, six token objects. */
function renderCards(t, w, v = {}) {
  const s = SZ[w] || SZ[1440];
  const list = v.list === undefined ? take(3) : v.list;
  const cols = v.cols || (w === 1440 ? 3 : (w === 834 ? 2 : 1));
  const cw = Math.floor((s.content - s.gut * (cols - 1)) / cols);
  const hSize = w === 1440 ? 40 : (w === 834 ? 34 : 28);
  const head = v.head === false ? '' : headBlock(t, { size: hSize, w: 720, blurbSize: w === 390 ? 16 : 17 });
  if (!list.length) return `<div style="width:${s.content}px">${head}${gap(24)}${noticeEl(t)}</div>`;
  const av = w === 390 ? 56 : 64;
  const card = a => cardBox(t, `<div style="display:flex;flex-direction:column;height:100%">
      <div style="display:flex;align-items:center;gap:14px">${portrait(t, a, av, { shape: v.shape })}<div style="display:flex;flex-direction:column;gap:5px;min-width:0">${nameEl(t, a, 19)}${countEl(t, a)}</div></div>
      ${a.bio && v.bio !== false ? gap(16) + bioEl(t, a, { lines: 3 }) : ''}
      <div style="margin-top:auto;padding-top:18px">${archiveLink(t, a, { h: 24 })}</div>
    </div>`, { w: cw, pad: w === 390 ? '22px' : '28px', style: 'height:100%', flat: v.flat || t.mode === 'd' });
  return `<div style="width:${s.content}px">${head}${head ? gap(w === 390 ? 36 : 48) : ''}<div style="display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:${s.gut}px;align-items:stretch">${list.map(card).join('')}</div></div>`;
}

/* One design file, assembled. Each design supplies render(t, w, vals) and its words. */
function buildDesign(o) {
  const vals = o.vals || {}, tabletVals = o.tabletVals || vals, mobileVals = o.mobileVals || vals;
  const S = [];
  S.push(intro({ kicker: `A21 AUTHOR SHOWCASES · DESIGN ${o.n} OF 15 · PAPER PACK · ${o.countWord} CONTROLS + THE WRITERS SOURCE`, title: o.title, paras: o.paras }));

  S.push(section(`A21-${o.n} desktop light`, o.primaryCap,
    [frame(1440, T, o.render(T, 1440, vals), o.frameOpts || {}), note(o.primaryNote)].join('\n  ')));

  S.push(section(`A21-${o.n} states`, o.statesCap,
    [(o.states || []).map(s => crop(s.dark ? TD : T, s.w || 1336, s.inner, { label: s.label, ground: s.ground, pad: s.pad, gap: s.gap })).join(''), note(o.statesNote)].join('\n  '),
    '0 56px 48px'));

  S.push(wrapIf('showControls', section(`A21-${o.n} controls`, `THE CONTROL PANEL · ${o.countWord} CONTROLS + THE SHARED WRITERS SOURCE GROUP`,
    stack([panel(o.panel), panelNote(o.panelNoteTitle || 'WHAT THIS PANEL SETTLES', o.panelNote)]))));

  S.push(wrapIf('showResponsive', section(`A21-${o.n} responsive`, o.responsiveCap,
    [stack([
      col('834px', o.tabletLabel, frame(834, T, o.render(T, 834, tabletVals), o.tabletFrameOpts || o.frameOpts || {})),
      col('390px', o.mobileLabel, frame(390, T, o.render(T, 390, mobileVals), o.mobileFrameOpts || o.frameOpts || {}))
    ]), note(o.responsiveNote)].join('\n  '))));

  S.push(wrapIf('showDark', section(`A21-${o.n} dark`, o.darkCap,
    [frame(1440, TD, o.render(TD, 1440, o.darkVals || vals), o.frameOpts || {}), note(o.darkNote)].join('\n  '))));

  S.push(wrapIf('showSpec', specSection(`A21-${o.n} spec`, o.spec)));
  return doc(S);
}
