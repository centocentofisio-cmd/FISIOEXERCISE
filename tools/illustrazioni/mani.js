/* Illustrazioni ravvicinate di avambraccio e mano (vista laterale e vista dorsale/palmare). */
"use strict";
const M = require("./motore");
const { C, add, seg, f1, pt } = M;
const SKIN = C.near, SKIN2 = "#4F7F77", BACK = C.far;

function bg(table) {
  let o = `<rect x="-200" y="-200" width="700" height="600" fill="${C.bg}"/>`;
  if (table) o += `<rect x="-200" y="${table.y}" width="${(table.x1 || 500) + 200}" height="300" fill="${C.wood}" opacity="0.7"/>`;
  return o;
}

/* Mano vista dal lato radiale.
   w: polso [x,y]; fore: direzione avambraccio (gomito→polso); wrist: flessione del polso (+ verso il palmo)
   palm: "down" | "up" (verso cui guarda il palmo); f: [mcp, pip, dip] flessione delle dita lunghe;
   th: [cmc, mcp, ip] del pollice; foreLen: lunghezza visibile dell'avambraccio; col: colore. */
function handSide(o) {
  const s = o.palm === "up" ? 1 : -1;
  const col = o.col || SKIN;
  const W = o.w, fore = o.fore != null ? o.fore : 90;
  const E = add(W, fore, -(o.foreLen || 110));
  const hd = fore + s * (o.wrist || 0);
  const K = add(W, hd, 34);
  const f = o.f || [0, 0, 0], th = o.th || [0, 0, 0];
  let out = "";
  // dita posteriori (medio, anulare) più chiare
  const finger = (base, lens, ang, w, c) => {
    let p = base, a = ang, r = "";
    lens.forEach((l, i) => { a += s * f[i]; const q = add(p, a, l); r += seg(p, q, w, c); p = q; });
    return { svg: r, tip: p };
  };
  const back = finger(add(K, hd + s * 90, -2), [23, 15, 11], hd, 9.5, o.colBack || BACK);
  out += back.svg;
  out += seg(E, W, 22, col);
  out += seg(W, K, 20, col);
  const idx = finger(add(K, hd + s * 90, 1), [21, 13, 10], hd, 9, col);
  out += idx.svg;
  // pollice: parte dal lato palmare vicino al polso
  let tb = add(add(W, hd, 7), hd + s * 90, 7), ta = hd + s * (32 + th[0]);
  const t1 = add(tb, ta, 15); ta += s * th[1]; const t2 = add(t1, ta, 12); ta += s * th[2]; const t3 = add(t2, ta, 10);
  out += seg(tb, t1, 10, SKIN2) + seg(t1, t2, 9, SKIN2) + seg(t2, t3, 8.5, SKIN2);
  // unghia indice
  return { svg: out, tip: idx.tip, thumb: t3, knuckle: K, wrist: W, palm: add(add(W, hd, 18), hd + s * 90, 12), dir: hd, palmN: hd + s * 90 };
}

/* Mano vista dal dorso o dal palmo. d: direzione delle dita; spread: apertura (gradi);
   curl: [0..1] per ogni dito (accorciamento apparente da flessione); thumb: angolo del pollice rispetto a d
   (segno = lato del pollice) oppure thumbTip: punto da raggiungere; palmar: true = si vede il palmo. */
function handFlat(o) {
  const W = o.w, d = o.d != null ? o.d : 180, side = o.side || -1; // side: lato del pollice (-1 sinistra)
  const col = o.palmar ? "#4F7F77" : SKIN;
  const E = add(W, d, -(o.foreLen || 90));
  let out = seg(E, W, 24, col);
  const K = add(W, d, 36);
  // palmo
  const perp = d + 90;
  const pa = add(W, perp, 15), pb = add(W, perp, -15), pc = add(K, perp, -18), pd = add(K, perp, 18);
  out += `<path d="M${pt(pa)} L${pt(pd)} L${pt(pc)} L${pt(pb)} Z" fill="${col}" stroke="${col}" stroke-width="10" stroke-linejoin="round"/>`;
  const lens = [40, 44, 41, 33], offs = [13.5, 4.5, -4.5, -13.5].map((x) => x * -side);
  const spread = o.spread || 0, curl = o.curl || [0, 0, 0, 0];
  const tips = [];
  lens.forEach((l, i) => {
    const base = add(K, perp, offs[i]);
    const a = d + (i - 1.5) * spread * -side * -1;
    const tip = add(base, a, l * (1 - 0.55 * curl[i]));
    tips.push(tip);
    out += seg(base, tip, 9, col);
    if (!o.palmar) { const n = add(tip, a, -4); out += `<circle cx="${f1(n[0])}" cy="${f1(n[1])}" r="2.4" fill="${C.bg}" opacity="0.55"/>`; }
  });
  // pollice
  const tbase = add(add(W, d, 8), perp, side < 0 ? 15 : -15);
  let tt;
  if (o.thumbTip) tt = o.thumbTip;
  else tt = add(add(tbase, d + (o.thumb != null ? o.thumb : 40) * (side < 0 ? 1 : -1), 22), d + (o.thumb != null ? o.thumb : 40) * (side < 0 ? 1 : -1) * 0.6, 18);
  const tm = [(tbase[0] * 0.45 + tt[0] * 0.55) + (side < 0 ? 4 : -4) * Math.cos((d) * Math.PI / 180), (tbase[1] * 0.45 + tt[1] * 0.55)];
  const tc = o.palmar ? SKIN : SKIN2;
  out += seg(tbase, tm, 11, tc) + seg(tm, tt, 9.5, tc);
  if (o.palmar) out += `<path d="M${pt(add(add(W, d, 22), perp, 10))} Q${pt(add(add(W, d, 16), perp, 0))} ${pt(add(add(W, d, 26), perp, -12))}" fill="none" stroke="${C.bg}" stroke-width="1.4" opacity="0.6"/>`;
  return { svg: out, tips, thumb: tt, knuckle: K, wrist: W, center: add(W, d, 20) };
}

/* Piede visto dal lato mediale (punta a destra). a: caviglia; pf: flessione plantare; arch: 0..1 altezza dell'arco;
   hallux/toes: estensione (+) o flessione (-) dell'alluce e delle altre dita; shin: direzione ginocchio→caviglia. */
function footSide(o) {
  const A = o.a, fd = 90 - (o.pf || 0), col = o.col || SKIN;
  const shin = o.shin != null ? o.shin : 0;
  const K = add(A, shin, -(o.shinLen || 100));
  const down = fd - 90; // verso la pianta
  const heel = add(add(A, fd, -13), down, 14), heelBack = add(add(A, fd, -19), down, 6);
  const ball = add(heel, fd, 52), ballTop = add(ball, down, -12);
  const mid = add(add(heel, fd, 26), down, -(3 + 9 * (o.arch || 0)));
  const ankF = add(A, fd, 9), ankB = add(A, fd, -9);
  let out = seg(K, A, 20, col);
  const lt = o.toes || 0, hx = o.hallux || 0;
  const lesser = [add(ballTop, down, 4), null]; lesser[1] = add(lesser[0], fd + lt, 14);
  out += seg(lesser[0], lesser[1], 8, BACK);
  out += `<path d="M${pt(heelBack)} L${pt(ankB)} L${pt(ankF)} L${pt(ballTop)} L${pt(ball)} Q${pt(mid)} ${pt(heel)} Z" fill="${col}" stroke="${col}" stroke-width="7" stroke-linejoin="round"/>`;
  const h0 = add(ballTop, down, 5), h1 = add(h0, fd + hx, 17);
  out += seg(h0, h1, 9, SKIN2);
  return { svg: out, heel, ball, mid, toe: h1, ankle: A };
}
/* Pianta del piede vista dal fondo del lettino (per inversione/eversione). c: centro; rot: rotazione (gradi); sx: larghezza apparente */
function sole(c, rot, sx, col) {
  const g = `<g transform="translate(${f1(c[0])},${f1(c[1])}) rotate(${rot}) scale(${sx || 1},1)">` +
    `<ellipse cx="0" cy="22" rx="13" ry="16" fill="${col || SKIN}"/><ellipse cx="2" cy="-12" rx="18" ry="24" fill="${col || SKIN}"/>` +
    [[-12, -38, 6], [-1, -42, 5], [8, -40, 4.5], [15, -36, 4], [20, -30, 3.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col || SKIN}"/>`).join("") + `</g>`;
  return g;
}

function label(x, y, t, size, col) { return `<text x="${x}" y="${y}" font-family="Public Sans,Segoe UI,Arial,sans-serif" font-size="${size || 12}" font-weight="700" fill="${col || C.eqLight}" text-anchor="middle">${t}</text>`; }
function arrow(a, b, bend) { return M.arrowPath(a, b, bend); }
function arc(c, r, a0, a1, ry) { return M.propSvg({ type: "arc", at: c, r, a0, a1, ry }, {}, "side"); }
function db(c, side) { return M.propSvg({ type: "db", at: c, flat: !side }, {}, side ? "side" : "front"); }

module.exports = { footSide, sole, bg, handSide, handFlat, label, arrow, arc, db, SKIN, SKIN2, BACK };
