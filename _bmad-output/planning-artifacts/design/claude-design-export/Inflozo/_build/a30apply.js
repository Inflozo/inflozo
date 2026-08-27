/* A30 · apply the controls-reconciliation patch. Load order:
   a23lib · a30lib · a30page · a30d1 · a30d2 · a30d3 · a30kit · a30patch · this.
   Mutates each loaded design descriptor, then A30PAGE.buildPage rebuilds the frame. */
globalThis.A30APPLY = (function () {
const K = globalThis.A30LIB, PG = globalThis.A30PAGE, A = globalThis.A30K, PP = globalThis.A30P;
const rec = body => `<span style="border-top:1px solid #EBE5DB;padding-top:9px"><strong style="font-weight:600;color:#B25B2A">Reconciled.</strong> ${body}</span>`;
const specRec = body => `<span style="border-top:1px solid #EBE5DB;padding-top:9px"><strong style="font-weight:600;color:#B25B2A">Reconciled ⚑</strong> ${body}</span>`;
const STATES_CAP = 'THE FORM STATES EVERY A30 DESIGN OWES · SIGN-IN · SENT · CODE · EXPIRED · INVALID · FOCUS · SIGNED-IN · NO-JS · ALL EIGHT REACHED IN PLACE THROUGH P0·6';
const ACCOUNT_CAP = 'DESKTOP 1440 · LIGHT · THE ACCOUNT PAGE · DISPLAY-ONLY, EVERY ACTION HANDS OFF TO PORTAL';
const b = K.b, code = K.code;

const FRAME_NOTE = {
  6: { cap: ' · SCRIM VALUES STILL TO BE RE-CHECKED AGAINST A REAL PHOTOGRAPH ⚑' },
  8: { cap: ' · TIER BUTTONS → PORTAL SIGNUP/{TIERID}/MONTHLY ⚑ · PRICES VIA GHOST’S PRICE HELPER',
       note: ` ${b('Wired in this pass')} ⚑: each card's button is a Portal tier deep link — ${code('signup/{tierId}/monthly')} or ${code('signup/{tierId}/yearly')} — and ${b('price-toggle swaps the hrefs as well as the prices')} (module note on the frame). The free row's CTA is plain ${code('signup')}. ${b('Prices render through Ghost’s')} ${code('{{price}}')} ${b('helper')} ⚑, because ${code('monthly_price')} and ${code('yearly_price')} are in the smallest currency unit and a raw print shows “600” for $6 — including in the no-JS state, where both prices render side by side.` },
  11: { acap: ' · RAIL ROWS → PORTAL ACCOUNT/PLANS · ACCOUNT/NEWSLETTERS · ACCOUNT/PROFILE ⚑',
        anote: ` ${b('Wired in this pass')} ⚑: Billing, Newsletters and Profile open ${code('account/plans')}, ${code('account/newsletters')} and ${code('account/profile')} — ${b('Portal’s named panels exist')}, which answers the spec's open question. Billing is still absent on a comped membership, and each row's accessible name still ends “opens in Ghost's Portal”.` },
  13: { cap: ' · STEP 01 TIER LINKS → PORTAL SIGNUP/{TIERID} ⚑',
        note: ` ${b('Wired in this pass')} ⚑: step 01's tier boxes are Portal tier deep links (${code('signup/{tierId}')}), the same targets as 8 Tiers' card buttons, and ${b('links rather than radios')} because choosing one navigates to Portal. Prices render through ${code('{{price}}')} for the same smallest-currency-unit reason.` }
};

function apply(d) {
  const n = d.n, p = PP.P[n], f = FRAME_NOTE[n] || {};
  d.rail = PP.railLine(n, p.count);
  d.statesCap = STATES_CAP;
  if (f.cap) d.primaryCap = d.primaryCap + f.cap;
  if (f.note) d.primaryNote = d.primaryNote + f.note;
  if (f.acap) d.accountCap = (d.accountCap || ACCOUNT_CAP) + f.acap;
  if (f.anote) d.accountNote = d.accountNote + f.anote;
  const c = d.controls;
  c.cap = `THE CONTROL PANEL · ${p.count} OF ITS OWN + THE UNIVERSAL TRIO + THE DATA GROUP · QUICK: ${p.quick}`;
  c.count = p.count;
  c.rows = PP.rows(n, c.rows);
  c.dataGroup = A.dataGroup(p.data || {});
  c.tail = PP.tailOf(n);
  c.settles = c.settles.concat([rec(p.rec)]);
  d.spec[1][0] = K.specRow(6, 'Controls', p.specCtl);
  d.spec[1] = d.spec[1].concat([specRec(p.specRec)]);
  return d;
}
return { apply, rec, specRec };
})();
