/* FISIOEXERCISE – motore delle illustrazioni stilizzate (SVG originali).
   Ogni posa è descritta da angoli assoluti dei segmenti corporei; il motore calcola
   le articolazioni (cinematica diretta), appoggia la figura a terra e disegna attrezzi e frecce.

   Convenzione degli angoli (gradi, spazio dello schermo, figura rivolta a destra):
     0 = verso il basso, 90 = verso destra (davanti), 180 = verso l'alto, 270/-90 = verso sinistra (dietro).
   Tronco (t): direzione bacino → spalle (in piedi = 180). tc = flessione del rachide (curva).
   Capo (h): flessione del capo rispetto al tronco (+ = mento verso il petto).
   Arti: a = lato vicino (in primo piano), b = lato lontano.
     gambe: th (coscia), sh (gamba), ft (piede; default sh+90 = caviglia a 90°)
     braccia: ua (braccio), fa (avambraccio), hd (mano; default = fa)
   Vista frontale (view:"front"): stessi angoli, + = verso la destra dello schermo;
     a = arto a sinistra dello schermo (lato destro del paziente), b = a destra. */
"use strict";

const W = 300, H = 200, FLOOR = 186;
const L = { trunk: 54, neck: 9, head: 10, ua: 30, fa: 26, hand: 8, th: 43, sh: 41, foot: 15, heel: 5 };
const C = {
  bg: "#F2F6F5", floor: "#B9CBC6", near: "#2F6158", far: "#A3BFB8", hl: "#E0703A", hlFar: "#EFB394",
  eq: "#34413F", eqLight: "#6E7F7B", band: "#C2477A", wood: "#C9B79C", ball: "#8FB8DE", arrow: "#E0703A", ghost: "#2F6158",
};
const rad = (d) => (d * Math.PI) / 180;
const dir = (a) => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p, a, len) => { const d = dir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; };
const f1 = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;

function defaults(p) {
  const q = Object.assign({ view: "side", t: 180, tc: 0, h: 0, hr: 0 }, p);
  const leg = (l) => { l = Object.assign({ th: 0, sh: 0 }, l); return l; };
  const arm = (r) => { r = Object.assign({ ua: 0, fa: 0 }, r); return r; };
  q.la = leg(q.la); q.lb = leg(q.lb || q.la); q.aa = arm(q.aa); q.ab = arm(q.ab || q.aa); q.la = Object.assign({}, q.la); q.lb = Object.assign({}, q.lb); q.aa = Object.assign({}, q.aa); q.ab = Object.assign({}, q.ab);
  return q;
}

/* cinematica inversa a due segmenti: target [dx,dy] rispetto alla radice → [angolo1, angolo2] */
function ik(T, l1, l2, bend) {
  let d = Math.hypot(T[0], T[1]);
  const dmax = l1 + l2 - 0.01; if (d > dmax) d = dmax;
  const base = Math.atan2(T[0], T[1]) * 180 / Math.PI;
  const c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const al = Math.acos(c) * 180 / Math.PI;
  const a1 = base + bend * al;
  const k = add([0, 0], a1, l1);
  const a2 = Math.atan2(T[0] - k[0], T[1] - k[1]) * 180 / Math.PI;
  return [a1, a2];
}

/* cinematica: restituisce le articolazioni in coordinate locali (bacino = 0,0) */
function joints(p) {
  const J = {}; const front = p.view === "front";
  J.pelvis = [0, 0];
  const lower = p.t + p.tc / 2, upper = p.t - p.tc / 2;
  const TL = L.trunk * (p.tL || 1);
  J.mid = add(J.pelvis, lower, TL / 2);
  J.shoulder = add(J.mid, upper, TL / 2);
  J.upper = upper; J.lower = lower;
  const ha = upper - p.h; J.headA = ha;
  J.neck = add(J.shoulder, p.n != null ? upper - p.n : ha, L.neck);
  J.head = add(J.neck, ha, L.head);
  J.headTop = add(J.head, ha, L.head);
  // offset laterali (vista frontale): perpendicolari al tronco
  const perpT = p.t - 90; // verso il "davanti" in vista laterale, verso destra schermo in frontale
  const hipOff = p.hipW != null ? p.hipW : front ? 9 : 0, shOff = p.shW != null ? p.shW : front ? 16 : 0;
  // in vista frontale con tronco verticale: perpT=90 → destra. a = sinistra schermo
  for (const s of ["a", "b"]) {
    const sg = s === "a" ? -1 : 1;
    const hip = add(J.pelvis, perpT, sg * hipOff);
    const sho = add(J.shoulder, perpT, sg * shOff);
    const lg = p["l" + s], ar = p["a" + s];
    const ang = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI;
    J["hip" + s] = hip;
    if (lg.K) { J["knee" + s] = [hip[0] + lg.K[0], hip[1] + lg.K[1]]; lg.th = ang(hip, J["knee" + s]); }
    else {
      if (lg.ik) { const r = ik(lg.ik, L.th * (lg.thL || 1), L.sh * (lg.shL || 1), lg.bend || 1); lg.th = r[0]; lg.sh = r[1]; }
      J["knee" + s] = add(hip, lg.th, L.th * (lg.thL || 1));
    }
    if (lg.A) { J["ankle" + s] = [hip[0] + lg.A[0], hip[1] + lg.A[1]]; lg.sh = ang(J["knee" + s], J["ankle" + s]); }
    else J["ankle" + s] = add(J["knee" + s], lg.sh, L.sh * (lg.shL || 1));
    if (lg.ft == null) lg.ft = lg.sh + 90 - (lg.pf || 0);
    if (front) {
      J["heel" + s] = add(J["ankle" + s], lg.sh, 4);
      J["toe" + s] = add(J["heel" + s], lg.ft, 7 * (lg.ftL || 1));
    } else {
      const fl = lg.ftL || 1;
      J["heel" + s] = add(add(J["ankle" + s], lg.ft, -L.heel * fl), lg.ft - 90, 5);
      J["toe" + s] = add(add(J["ankle" + s], lg.ft, L.foot * fl), lg.ft - 90, 4);
    }
    J["shoulder" + s] = sho;
    if (ar.E) { J["elbow" + s] = [sho[0] + ar.E[0], sho[1] + ar.E[1]]; ar.ua = ang(sho, J["elbow" + s]); }
    else {
      if (ar.ik) { const r = ik(ar.ik, L.ua * (ar.uaL || 1), L.fa * (ar.faL || 1), ar.bend || -1); ar.ua = r[0]; ar.fa = r[1]; }
      J["elbow" + s] = add(sho, ar.ua, L.ua * (ar.uaL || 1));
    }
    if (ar.Wr) { J["wrist" + s] = [sho[0] + ar.Wr[0], sho[1] + ar.Wr[1]]; ar.fa = ang(J["elbow" + s], J["wrist" + s]); }
    else J["wrist" + s] = add(J["elbow" + s], ar.fa, L.fa * (ar.faL || 1));
    if (ar.hd == null) ar.hd = ar.fa + (ar.wr || 0);
    J["hand" + s] = add(J["wrist" + s], ar.hd, L.hand * 0.6);
    J["fingers" + s] = add(J["wrist" + s], ar.hd, L.hand);
  }
  return J;
}

function bodyPoints(J) {
  const keys = Object.keys(J).filter((k) => Array.isArray(J[k]));
  const pts = keys.map((k) => J[k]);
  pts.push([J.headTop[0], J.headTop[1]], [J.head[0] - L.head, J.head[1]], [J.head[0] + L.head, J.head[1]], [J.head[0], J.head[1] + L.head], [J.head[0], J.head[1] - L.head]);
  return pts;
}
function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

/* punti che toccano il pavimento (per l'appoggio automatico): suole, ginocchia, mani, glutei, schiena, capo */
function contactY(J, p) {
  const ys = [J.heela[1] + 2, J.toea[1] + 2, J.heelb[1] + 2, J.toeb[1] + 2, J.kneea[1] + 6, J.kneeb[1] + 6,
    J.fingersa[1] + 3, J.fingersb[1] + 3, J.elbowa[1] + 5, J.elbowb[1] + 5, J.pelvis[1] + 11, J.mid[1] + 11, J.shoulder[1] + 10, J.head[1] + L.head, J.ankleb[1] + 5, J.anklea[1] + 5];
  if (p.ignoreGround) for (const k of p.ignoreGround) ys[k] = -Infinity;
  return Math.max(...ys);
}

function layout(p0, opt) {
  const p = defaults(p0);
  const J = joints(p);
  let ox, oy;
  if (p.root) { ox = p.root[0]; oy = p.root[1]; }
  else {
    const bb = bbox(bodyPoints(J));
    const groundY = (p.floor != null ? p.floor : FLOOR) - (p.lift || 0);
    const cy = p.groundOn ? Math.max(...p.groundOn.map((k) => J[k][1] + (/heel|toe/.test(k) ? 2 : /knee/.test(k) ? 6 : /pelvis|mid|shoulder/.test(k) ? 11 : /head/.test(k) ? 0 : /fingers|hand/.test(k) ? 3 : /elbow/.test(k) ? 5 : 0))) : contactY(J, p);
    oy = groundY - cy;
    ox = (opt && opt.ox != null) ? opt.ox : W / 2 - (bb.x0 + bb.x1) / 2 + (p.dx || 0);
  }
  if (opt && opt.anchor) { const [k, pos] = opt.anchor; ox = pos[0] - J[k][0]; oy = pos[1] - J[k][1]; }
  const A = {};
  for (const k of Object.keys(J)) A[k] = Array.isArray(J[k]) ? [J[k][0] + ox, J[k][1] + oy] : J[k];
  return { p, J: A, ox, oy };
}

/* ------- disegno ------- */
function seg(a, b, w, col, extra) { return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${extra || ""}/>`; }
function poly(pts, w, col, extra) { return `<polyline points="${pts.map(pt).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra || ""}/>`; }

/* ---- figura "da scheda": pelle, maglietta, pantaloncini, scarpe, contorno scuro ---- */
const SKIN = { near: "#F2C8A2", far: "#D9A982" }, SHIRT = { near: "#2F6F64", far: "#5E8F86" },
  SHORTS = { near: "#45525E", far: "#7D8892" }, SHOE = { near: "#2B3130", far: "#5D6463" }, HAIR = "#5A3E2B", OUT = "#1E2826";
const HL = { near: "#E8743B", far: "#F0A57C" };
function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
// capsula rastremata da a (raggio r1) a b (raggio r2)
function cap(a, b, r1, r2, fill) { return { t: "cap", a, b, r1, r2, fill }; }
function circ(c, r, fill) { return { t: "c", c, r, fill }; }
function path(d, fill) { return { t: "p", d, fill }; }
function shapeSvg(sh, stroke) {
  const st = stroke ? ` stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"` : "";
  if (sh.t === "c") return `<circle cx="${f1(sh.c[0])}" cy="${f1(sh.c[1])}" r="${f1(sh.r)}" fill="${sh.fill}"${st}/>`;
  if (sh.t === "p") return `<path d="${sh.d}" fill="${sh.fill}"${st}/>`;
  const dx = sh.b[0] - sh.a[0], dy = sh.b[1] - sh.a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const p1 = [sh.a[0] + nx * sh.r1, sh.a[1] + ny * sh.r1], p2 = [sh.b[0] + nx * sh.r2, sh.b[1] + ny * sh.r2];
  const p3 = [sh.b[0] - nx * sh.r2, sh.b[1] - ny * sh.r2], p4 = [sh.a[0] - nx * sh.r1, sh.a[1] - ny * sh.r1];
  return `<path d="M${pt(p1)} L${pt(p2)} A${f1(sh.r2)} ${f1(sh.r2)} 0 0 0 ${pt(p3)} L${pt(p4)} A${f1(sh.r1)} ${f1(sh.r1)} 0 0 0 ${pt(p1)} Z" fill="${sh.fill}"${st}/>`;
}
// un pezzo del corpo: prima il contorno di tutte le forme, poi i riempimenti (contorno unico)
function part(shapes) { return shapes.map((x) => shapeSvg(x, true)).join("") + shapes.map((x) => shapeSvg(x, false)).join(""); }

function legSvg(J, s, tone, p, hl) {
  const front = p.view === "front";
  const H = J["hip" + s], K = J["knee" + s], A = J["ankle" + s];
  const skin = hl ? HL[tone] : SKIN[tone];
  const sh = [];
  const rT = front ? 6.4 : 7.2, rK = front ? 4.6 : 4.9, rA = front ? 3.2 : 3.3;
  sh.push(cap(H, K, rT, rK, skin));
  const calf = lerp(K, A, 0.3);
  sh.push(cap(K, calf, rK, front ? 4.4 : 4.8, skin), cap(calf, A, front ? 4.4 : 4.8, rA, skin));
  const kneel = front && Math.hypot(A[0] - K[0], A[1] - K[1]) < 12; // tibia di scorcio (ginocchio a terra visto di fronte)
  if (kneel) { sh.length = 1; sh.push(circ(K, 5.4, skin)); }
  if (!p["noFoot" + s] && !kneel) {
    if (front) sh.push(cap(A, J["toe" + s], 3.4, 3.6, SHOE[tone]));
    else {
      const he = J["heel" + s], to = J["toe" + s];
      sh.push(path(`M${pt(lerp(A, he, 0.15))} L${pt(he)} L${pt(to)} L${pt(lerp(A, to, 0.35))} Z`, SHOE[tone]));
      sh.push(cap(he, to, 2.6, 2.4, SHOE[tone]), circ(A, 3.4, SHOE[tone]));
    }
  }
  // pantaloncini sulla parte alta della coscia
  sh.push(circ(H, front ? 7.2 : 7.8, SHORTS[tone]), cap(H, lerp(H, K, 0.42), rT + 0.9, rT + 0.4, SHORTS[tone]));
  return part(sh);
}
function armSvg(J, s, tone, hl) {
  const S = J["shoulder" + s], E = J["elbow" + s], Wr = J["wrist" + s], F = J["fingers" + s];
  const skin = hl ? HL[tone] : SKIN[tone];
  const sh = [cap(S, E, 4.4, 3.4, skin), cap(E, Wr, 3.4, 2.5, skin), cap(Wr, F, 2.9, 2.3, skin), circ(J["hand" + s], 3.1, skin)];
  sh.push(circ(S, 5.4, SHIRT[tone]), cap(S, lerp(S, E, 0.45), 5.2, 4.6, SHIRT[tone]));
  return part(sh);
}
function trunkSvg(J, p, tone) {
  const front = p.view === "front";
  const col = SHIRT[tone];
  const neck = part([cap(J.shoulder, J.neck, 3.6, 3.4, SKIN.near)]);
  if (front) {
    const perp = p.t - 90;
    const a = add(J.pelvis, perp, -12), b = add(J.pelvis, perp, 12);
    const c = add(J.shoulder, perp, 17), d = add(J.shoulder, perp, -17);
    const cm = add(J.mid, perp, 12), dm = add(J.mid, perp, -12);
    const body = `M${pt(a)} L${pt(b)} Q${pt(cm)} ${pt(c)} Q${pt(J.shoulder)} ${pt(d)} Q${pt(dm)} ${pt(a)} Z`;
    const sp = add(J.pelvis, p.t, -2);
    const shorts = path(`M${pt(add(sp, perp, -12.5))} L${pt(add(sp, perp, 12.5))} L${pt(add(add(sp, perp, 12.5), p.t, 9))} L${pt(add(add(sp, perp, -12.5), p.t, 9))} Z`, SHORTS.near);
    return neck + part([path(body, col), shorts]);
  }
  const P0 = J.pelvis, P1 = J.mid, P2 = J.shoulder;
  const N = 12, frontPts = [], backPts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * (2 * P1[0] - (P0[0] + P2[0]) / 2) + t * t * P2[0];
    const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * (2 * P1[1] - (P0[1] + P2[1]) / 2) + t * t * P2[1];
    const ang = t < 0.5 ? J.lower : J.upper;
    const fw = 8 + 3.2 * Math.exp(-Math.pow((t - 0.72) / 0.2, 2)) - 1.2 * Math.exp(-Math.pow((t - 0.35) / 0.12, 2)), bw = 8.6 + 1.8 * Math.exp(-Math.pow((t - 0.8) / 0.15, 2)) - (t > 0.95 ? 1 : 0);
    frontPts.push(add([x, y], ang - 90, fw)); backPts.push(add([x, y], ang + 90, bw));
  }
  const d = "M" + frontPts.map(pt).join(" L") + " L" + backPts.reverse().map(pt).join(" L") + " Z";
  // bacino (pantaloncini): ovale lungo il tronco basso
  const sp = [cap(add(P0, J.lower, -2), add(P0, J.lower, 9), 10, 9.4, SHORTS.near)];
  return neck + part([path(d, col)].concat(sp));
}
function headSvg(J, p, hl) {
  const front = p.view === "front", h = J.head, ha = J.headA;
  const skin = SKIN.near; // il capo non si colora: il movimento è indicato dalle frecce
  let o = "";
  if (front) {
    const off = (p.hr || 0) * 4.5;
    o += part([circ(h, 9.6, skin)]);
    o += `<path d="M${pt(add(add(h, ha - 90, -9.4), ha, 1))} A9.6 9.6 0 0 1 ${pt(add(add(h, ha - 90, 9.4), ha, 1))} Q${pt(add(h, ha, 4))} ${pt(add(add(h, ha - 90, -9.4), ha, 1))} Z" fill="${HAIR}"/>`;
    const e1 = add(add(h, ha - 90, -3.4 + off), ha, -1), e2 = add(add(h, ha - 90, 3.4 + off), ha, -1);
    o += `<circle cx="${f1(e1[0])}" cy="${f1(e1[1])}" r="1.1" fill="${OUT}"/><circle cx="${f1(e2[0])}" cy="${f1(e2[1])}" r="1.1" fill="${OUT}"/>`;
    const m = add(add(h, ha - 90, off * 0.8), ha, -5);
    o += `<path d="M${pt(add(m, ha - 90, -2.2))} Q${pt(add(m, ha, -1.2))} ${pt(add(m, ha - 90, 2.2))}" fill="none" stroke="${OUT}" stroke-width="0.9" stroke-linecap="round"/>`;
    return o;
  }
  const fa = ha - 90; // direzione del viso
  const nose = add(add(h, fa, 11.2), ha, -1);
  const chin = add(add(h, fa, 6.5), ha, -8.4);
  const sh = [circ(h, 9.6, skin), path(`M${pt(add(add(h, fa, 8.6), ha, 3))} L${pt(nose)} L${pt(add(add(h, fa, 9), ha, -3))} Z`, skin), cap(add(h, ha, -3), chin, 5, 3, skin)];
  o += part(sh);
  // capelli sulla parte posteriore/alta del capo
  const b1 = add(add(h, fa, 4), ha, 9.6), b2 = add(add(h, fa, -6), ha, -6.5);
  o += `<path d="M${pt(b1)} A9.9 9.9 0 0 0 ${pt(b2)} Q${pt(add(add(h, fa, -1), ha, 2))} ${pt(b1)} Z" fill="${HAIR}" stroke="${OUT}" stroke-width="1.2"/>`;
  const eye = add(add(h, fa, 5.6), ha, 1.6);
  o += `<circle cx="${f1(eye[0])}" cy="${f1(eye[1])}" r="1.15" fill="${OUT}"/>`;
  const ear = add(add(h, fa, -1), ha, 0);
  o += `<ellipse cx="${f1(ear[0])}" cy="${f1(ear[1])}" rx="1.8" ry="2.6" transform="rotate(${f1(-ha)} ${f1(ear[0])} ${f1(ear[1])})" fill="${SKIN.far}" stroke="${OUT}" stroke-width="0.8"/>`;
  return o;
}

function figureSvg(L0, opt) {
  const { p, J } = L0; opt = opt || {};
  const hl = new Set((p.hl || []).filter((k) => k !== "trunk"));
  let o = "";
  if (p.view === "front") {
    const legs = legSvg(J, "a", "near", p, hl.has("la")) + legSvg(J, "b", "near", p, hl.has("lb"));
    const arms = armSvg(J, "a", "near", hl.has("aa")) + armSvg(J, "b", "near", hl.has("ab"));
    const body = trunkSvg(J, p, "near") + headSvg(J, p, hl.has("head"));
    o = p.armsBehind ? arms + legs + body : legs + body + arms;
  } else {
    o += armSvg(J, "b", "far", hl.has("ab")) + legSvg(J, "b", "far", p, hl.has("lb"));
    o += trunkSvg(J, p, "near") + headSvg(J, p, hl.has("head"));
    o += legSvg(J, "a", "near", p, hl.has("la")) + armSvg(J, "a", "near", hl.has("aa"));
  }
  if (opt.ghost) return `<g opacity="0.14" filter="grayscale(1)">${o}</g>`;
  return o;
}

/* ------- attrezzi ------- */
function P(J, ref) { // risolve un riferimento: [x,y] oppure "joint" oppure ["joint",dx,dy]
  if (typeof ref === "string") return J[ref];
  if (Array.isArray(ref) && typeof ref[0] === "string") { const b = J[ref[0]]; return [b[0] + (ref[1] || 0), b[1] + (ref[2] || 0)]; }
  return ref;
}
function db(c, side, ang) { // manubrio
  if (side) return `<g><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="7.5" fill="${C.eq}"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="3" fill="${C.eqLight}"/></g>`;
  const a = ang == null ? 90 : ang; const e1 = add(c, a, -9), e2 = add(c, a, 9);
  return seg(e1, e2, 3, C.eq) + seg(add(c, a, -11), add(c, a, -7), 11, C.eq) + seg(add(c, a, 7), add(c, a, 11), 11, C.eq);
}
function kb(c, up, rot) { // kettlebell appeso alla mano (up = capovolto, bottom-up)
  const s = up ? -1 : 1;
  const bell = [c[0], c[1] + s * 11];
  return `<g><path d="M${f1(c[0] - 5)},${f1(c[1] + s * 4)} Q${f1(c[0])},${f1(c[1] - s * 5)} ${f1(c[0] + 5)},${f1(c[1] + s * 4)}" fill="none" stroke="${C.eq}" stroke-width="3"/><circle cx="${f1(bell[0])}" cy="${f1(bell[1])}" r="8.5" fill="${C.eq}"/><rect x="${f1(bell[0] - 5)}" y="${f1(up ? bell[1] - 10 : bell[1] + 6)}" width="10" height="4" rx="1" fill="${C.eq}"/></g>`;
}
function arrowPath(a, b, bend, col) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1; const nx = -dy / len, ny = dx / len;
  const c = [mx + nx * (bend || 0), my + ny * (bend || 0)];
  // punta orientata secondo la tangente finale
  const tx = b[0] - c[0], ty = b[1] - c[1], tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl, uy = ty / tl;
  const end = [b[0] - ux * 4, b[1] - uy * 4];
  const h1 = [b[0] - ux * 8 - uy * 5, b[1] - uy * 8 + ux * 5], h2 = [b[0] - ux * 8 + uy * 5, b[1] - uy * 8 - ux * 5];
  return `<path d="M${pt(a)} Q${pt(c)} ${pt(end)}" fill="none" stroke="${col || C.arrow}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${len > 30 ? "0" : "0"}"/><path d="M${pt(b)} L${pt(h1)} L${pt(h2)} Z" fill="${col || C.arrow}"/>`;
}

function propSvg(pr, J, view) {
  const t = pr.type;
  const fl = pr.floor != null ? pr.floor : FLOOR;
  const PX = pr.x == null ? 0 : typeof pr.x === "number" ? pr.x + (pr.dx || 0) : P(J, pr.x)[0] + (pr.dx || 0);
  const PY = pr.y == null ? null : typeof pr.y === "number" ? pr.y : P(J, pr.y)[1] + (pr.dy || 0);
  const TOP = pr.top == null ? null : typeof pr.top === "number" ? pr.top : P(J, pr.top)[1] + (pr.dy || 0);
  switch (t) {
    case "wall": { const x = PX; return `<rect x="${x}" y="0" width="${pr.w || 8}" height="${fl}" fill="${C.wood}" opacity="0.55"/>`; }
    case "wallL": { const x = PX; return `<rect x="${x - (pr.w || 8)}" y="0" width="${pr.w || 8}" height="${fl}" fill="${C.wood}" opacity="0.55"/>`; }
    case "box": { const y = TOP != null ? TOP : P(J, pr.under)[1] + 2; return `<rect x="${f1(PX)}" y="${f1(y)}" width="${pr.w}" height="${f1(fl - y)}" rx="2" fill="${C.wood}"/>`; }
    case "slope": { // piano inclinato (decline board)
      const y0 = pr.y0, y1 = pr.y1; return `<path d="M${PX},${fl} L${PX},${y0} L${PX + pr.w},${y1} L${PX + pr.w},${fl} Z" fill="${C.wood}"/>`; }
    case "bench": { const y = TOP != null ? TOP : P(J, pr.under)[1] + (pr.off || 11); const x = PX; const w = pr.w; const h = fl - y;
      return `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="7" rx="3" fill="${C.eq}"/>` + seg([x + 8, y + 6], [x + 8, fl], 4, C.eqLight) + seg([x + w - 8, y + 6], [x + w - 8, fl], 4, C.eqLight) + (h < 0 ? "" : ""); }
    case "chair": { const c = P(J, pr.under || "pelvis"); const y = c[1] + 11; const x = c[0] - 16;
      return `<rect x="${f1(x)}" y="${f1(y)}" width="34" height="6" rx="2" fill="${C.eq}"/>` + seg([x + 4, y + 5], [x + 4, fl], 3.5, C.eqLight) + seg([x + 30, y + 5], [x + 30, fl], 3.5, C.eqLight) + (pr.back ? seg([x + 2, y], [x - 2, y - 40], 4, C.eqLight) : ""); }
    case "ball": { const c = P(J, pr.at); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${pr.r || 22}" fill="${C.ball}" opacity="0.9"/>`; }
    case "ballFloor": { const r = pr.r || 22; return `<circle cx="${f1(PX)}" cy="${f1(fl - r)}" r="${r}" fill="${C.ball}" opacity="0.9"/>`; }
    case "medball": { const c = P(J, pr.at); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${pr.r || 8}" fill="#8A5A44"/>`; }
    case "volley": { const c = P(J, pr.at); const r = pr.r || 7; return `<g><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="#F4E3A1" stroke="#2D5C9A" stroke-width="1.5"/><path d="M${f1(c[0] - r)},${f1(c[1])} Q${f1(c[0])},${f1(c[1] - r * 0.7)} ${f1(c[0] + r)},${f1(c[1])}" fill="none" stroke="#2D5C9A" stroke-width="1.2"/></g>`; }
    case "roller": { const c = P(J, pr.at); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${pr.r || 7}" fill="${C.ball}" stroke="${C.eqLight}" stroke-width="1"/>`; }
    case "db": return db(P(J, pr.at), view !== "front" && !pr.flat, pr.ang);
    case "kb": return kb(P(J, pr.at), pr.up);
    case "plate": { const c = P(J, pr.at); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${pr.r || 15}" fill="${C.eq}"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="3" fill="${C.eqLight}"/>`; }
    case "bar": { const a = P(J, pr.from), b = P(J, pr.to); return seg(a, b, pr.w || 3.5, C.eq); }
    case "landmine": { const piv = [PX, fl - 3]; const h = P(J, pr.at); const d = [h[0] - piv[0], h[1] - piv[1]]; const l = Math.hypot(...d); const end = [piv[0] + d[0] / l * (l + 14), piv[1] + d[1] / l * (l + 14)];
      const plate = [piv[0] + d[0] / l * (l - 6), piv[1] + d[1] / l * (l - 6)];
      return `<rect x="${PX - 6}" y="${fl - 6}" width="12" height="6" fill="${C.eq}"/>` + seg(piv, end, 4, C.eq) + `<circle cx="${f1(plate[0])}" cy="${f1(plate[1])}" r="13" fill="${C.eq}" opacity="0.9"/><circle cx="${f1(plate[0])}" cy="${f1(plate[1])}" r="3" fill="${C.eqLight}"/>`; }
    case "dowel": { const a = P(J, pr.from), b = P(J, pr.to); return seg(a, b, 3.5, "#8C6B3E"); }
    case "band": { // elastico da un ancoraggio (punto fisso) a un punto del corpo
      const a = P(J, pr.from), b = P(J, pr.to);
      let o = seg(a, b, 2.6, C.band);
      if (pr.anchor !== false && !(typeof pr.from === "string")) o += `<rect x="${f1(a[0] - 3)}" y="${f1(a[1] - 3)}" width="6" height="6" rx="1" fill="${C.eq}"/>`;
      return o; }
    case "loop": { // anello elastico attorno a due punti (es. ginocchia)
      const a = P(J, pr.a), b = P(J, pr.b); const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2; const rx = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + (pr.pad || 8), ry = pr.ry || 4;
      const rot = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${ry}" fill="none" stroke="${pr.col || C.band}" stroke-width="${pr.w || 2.6}" transform="rotate(${f1(rot)} ${f1(cx)} ${f1(cy)})"/>`; }
    case "crate": { const c = P(J, pr.at); const w = pr.w || 30, h = pr.h || 20; return `<rect x="${f1(c[0] - w / 2)}" y="${f1(c[1] - h / 2)}" width="${w}" height="${h}" rx="2" fill="#B98A5A" stroke="#7A5634" stroke-width="1.5"/>`; }
    case "wallBack": return `<rect x="-200" y="-200" width="700" height="${fl + 200}" fill="${C.wood}" opacity="0.28"/>`;
    case "card": { const c = P(J, pr.at); return `<rect x="${f1(c[0] - 6)}" y="${f1(c[1] - 9)}" width="12" height="15" rx="1.5" fill="#FFFFFF" stroke="${C.eq}" stroke-width="1"/><text x="${f1(c[0])}" y="${f1(c[1] + 3)}" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="${C.hl}" text-anchor="middle">${pr.text || "A"}</text>`; }
    case "poly": { const pts = pr.pts.map((q) => P(J, q)); return `<path d="M${pts.map(pt).join(" L")} Z" fill="${pr.fill || C.wood}"${pr.op ? ` opacity="${pr.op}"` : ""}/>`; }
    case "net": { // rete da pallavolo vista di fronte
      const y0 = pr.y0 || 18, y1 = pr.y1 || 70; let o = `<g opacity="0.55">`;
      for (let x = -100; x <= W + 100; x += 9) o += seg([x, y0], [x, y1], 0.8, C.eq);
      for (let y = y0; y <= y1; y += 9) o += seg([-100, y], [W + 100, y], 0.8, C.eq);
      return o + `</g>` + `<rect x="-100" y="${y0 - 3}" width="${W + 200}" height="5" fill="#F7F7F2" stroke="${C.eq}" stroke-width="0.8"/>`; }
    case "mat": { return `<rect x="${pr.x0 || 20}" y="${pr.y0 || 40}" width="${(pr.x1 || 280) - (pr.x0 || 20)}" height="${(pr.y1 || 160) - (pr.y0 || 40)}" rx="8" fill="#D9E6E3"/>`; }
    case "ring": { const c = P(J, pr.at); return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${pr.rx || 3}" ry="${pr.ry || 8}" fill="none" stroke="${C.band}" stroke-width="2.6" transform="rotate(${pr.rot || 0} ${f1(c[0])} ${f1(c[1])})"/>`; }
    case "cable": { // colonna del cavo con puleggia all'altezza y
      const x = PX, y = PY; const h = P(J, pr.to);
      return `<rect x="${x - 5}" y="${Math.min(y - 20, 20)}" width="10" height="${fl - Math.min(y - 20, 20)}" fill="${C.eqLight}" opacity="0.6"/>` + `<circle cx="${x}" cy="${y}" r="4" fill="${C.eq}"/>` + seg([x, y], h, 1.8, C.eq); }
    case "post": { const x = PX, y = PY; return `<rect x="${x - 3}" y="${y}" width="6" height="${fl - y}" fill="${C.eqLight}" opacity="0.7"/>`; }
    case "towel": { const c = P(J, pr.at); return `<rect x="${f1(c[0] - (pr.w || 16) / 2)}" y="${f1(c[1] - (pr.h || 4) / 2)}" width="${pr.w || 16}" height="${pr.h || 4}" rx="1.5" fill="#E7C66B" transform="rotate(${pr.rot || 0} ${f1(c[0])} ${f1(c[1])})"/>`; }
    case "strap": { const a = P(J, pr.from), b = P(J, pr.to); return seg(a, b, 3, "#E7C66B"); }
    case "line": { const a = P(J, pr.from), b = P(J, pr.to); return seg(a, b, pr.w || 2, pr.col || C.eqLight, pr.dash ? ` stroke-dasharray="${pr.dash}"` : ""); }
    case "cone": return `<path d="M${PX - 5},${fl} L${PX},${fl - 12} L${PX + 5},${fl} Z" fill="#E8913A"/>`;
    case "target": { const c = P(J, pr.at); return `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${pr.r || 6}" fill="none" stroke="${C.hl}" stroke-width="2"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="2" fill="${C.hl}"/>`; }
    case "laser": { const a = P(J, pr.from), b = P(J, pr.to); return seg(a, b, 1.2, "#D63B3B", ` stroke-dasharray="3 2"`) + `<circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="2.5" fill="#D63B3B"/>`; }
    case "cuff": { const c = P(J, pr.at); return `<rect x="${f1(c[0] - 9)}" y="${f1(c[1] - 3)}" width="18" height="6" rx="3" fill="#7BA7D9"/>`; }
    case "board": { // tavoletta / disco instabile sotto un piede
      const c = P(J, pr.under); return `<path d="M${f1(c[0] - 18)},${f1(c[1] + 2)} L${f1(c[0] + 18)},${f1(c[1] + 2)} L${f1(c[0] + 18)},${f1(c[1] + 6)} L${f1(c[0] - 18)},${f1(c[1] + 6)} Z" fill="${C.wood}"/><path d="M${f1(c[0] - 6)},${f1(c[1] + 6)} Q${f1(c[0])},${fl + 2} ${f1(c[0] + 6)},${f1(c[1] + 6)}" fill="${C.eqLight}"/>`; }
    case "slider": { const c = P(J, pr.under); return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1] + 3)}" rx="10" ry="2.5" fill="${C.eqLight}"/>`; }
    case "text": return `<text x="${PX}" y="${pr.y}" font-family="Public Sans,Segoe UI,Arial,sans-serif" font-size="${pr.size || 11}" font-weight="700" fill="${pr.col || C.eqLight}" text-anchor="${pr.anchor || "middle"}">${pr.text}</text>`;
    case "arrow": { const a = P(J, pr.from), b = P(J, pr.to); return arrowPath(a, b, pr.bend, pr.col); }
    case "arc": { // freccia circolare attorno a un punto (rotazioni)
      const c = P(J, pr.at), r = pr.r || 10, a0 = pr.a0 != null ? pr.a0 : 200, a1 = pr.a1 != null ? pr.a1 : 340;
      const s = [c[0] + r * Math.cos(rad(a0)), c[1] + r * Math.sin(rad(a0))], e = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))];
      const ry = pr.ry || r;
      const s2 = [c[0] + r * Math.cos(rad(a0)), c[1] + ry * Math.sin(rad(a0))], e2 = [c[0] + r * Math.cos(rad(a1)), c[1] + ry * Math.sin(rad(a1))];
      s[0] = s2[0]; s[1] = s2[1]; e[0] = e2[0]; e[1] = e2[1];
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
      const tang = sweep ? a1 + 90 : a1 - 90; const tx = Math.cos(rad(tang)), ty = Math.sin(rad(tang));
      const h1 = [e[0] - tx * 7 - ty * 4, e[1] - ty * 7 + tx * 4], h2 = [e[0] - tx * 7 + ty * 4, e[1] - ty * 7 - tx * 4];
      return `<path d="M${pt(s)} A${r},${ry} 0 ${large} ${sweep} ${pt(e)}" fill="none" stroke="${pr.col || C.arrow}" stroke-width="2.4" stroke-linecap="round"/><path d="M${pt([e[0] + tx * 2, e[1] + ty * 2])} L${pt(h1)} L${pt(h2)} Z" fill="${pr.col || C.arrow}"/>`; }
    case "raw": return typeof pr.svg === "function" ? pr.svg(J) : pr.svg;
    default: throw new Error("attrezzo sconosciuto: " + t);
  }
}

/* Disegna un fotogramma. frame = { pose, props:[...], ghost: layout del fotogramma precedente, arrows:[...] } */
function frameSvg(fr) {
  const { lay } = fr; const view = lay.p.view;
  const props = fr.props || [];
  const back = props.filter((x) => x.layer === "back" || ["wall", "wallL", "wallBack", "box", "bench", "chair", "ballFloor", "post", "cable", "slope", "cone", "board", "slider", "mat", "net0"].includes(x.type) && x.layer !== "front");
  const front = props.filter((x) => !back.includes(x));
  let o = `<rect x="-200" y="-200" width="700" height="600" fill="${C.bg}"/>`;
  if (!fr.noFloor) o += `<rect x="-200" y="${FLOOR}" width="700" height="200" fill="${C.floor}" opacity="0.55"/>`;
  o += back.map((x) => propSvg(x, lay.J, view)).join("");
  if (fr.ghost) o += figureSvg(fr.ghost, { ghost: true });
  o += figureSvg(lay);
  o += front.map((x) => propSvg(x, lay.J, view)).join("");
  return o;
}

function svgDoc(inner, title, vb, num) {
  const v = vb || [0, 0, W, H];
  if (num) { const k = v[2] / W, x = v[0] + 13 * k, y = v[1] + 13 * k;
    inner += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(9 * k)}" fill="${OUT}"/><text x="${f1(x)}" y="${f1(y + 4 * k)}" font-family="Public Sans,Segoe UI,Arial,sans-serif" font-size="${f1(11.5 * k)}" font-weight="800" fill="#fff" text-anchor="middle">${num}</text>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.join(" ")}" width="${W}" height="${H}" role="img" aria-label="${title.replace(/"/g, "&quot;")}"><title>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title>${inner}</svg>`;
}

module.exports = { W, H, FLOOR, L, C, layout, frameSvg, svgDoc, propSvg, figureSvg, add, dir, seg, poly, arrowPath, pt, f1 };
