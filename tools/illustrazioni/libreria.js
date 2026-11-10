/* Pose di base e utilità condivise per le illustrazioni. */
"use strict";
const M = require("./motore");
// ruota un vettore [x,y] (definito per il tronco verticale) secondo l'angolo del tronco t
function R(t, v) { const d = (t - 180) * Math.PI / 180; const c = Math.cos(d), s = Math.sin(d); return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c]; }
const o = (...a) => Object.assign({}, ...a);
const HANG = { ua: 3, fa: 8 }, HANGB = { ua: -3, fa: 4 };
const STAND = { t: 180, la: {}, lb: {}, aa: HANG, ab: HANGB };
const FSTAND = { view: "front", t: 180, la: { th: 2, sh: 0 }, lb: { th: -2, sh: 0 }, aa: { ua: -7, fa: -4 }, ab: { ua: 7, fa: 4 } };
// supino (capo a sinistra), prono e quadrupedia (capo a destra)
const SUP = { t: 270, la: { th: 90, sh: 90 }, aa: { ua: 88, fa: 88 } };
const HOOK = { t: 270, la: { ik: [48, 4], ft: 90 }, lb: { ik: [46, 4], ft: 90 }, aa: { ua: 88, fa: 88 } };
const PRONE = { t: 90, la: { th: -90, sh: -90 }, aa: { ua: -88, fa: -88 } };
const QUAD = { t: 90, h: -5, la: { th: 0, sh: -90, ft: -95 }, aa: { ua: 0, fa: 0, hd: 90 } };
// seduto (vista laterale e frontale): usare con props chair
const SIT = { t: 180, la: { th: 90, sh: 0 }, lb: { th: 90, sh: 0 }, aa: { ik: [26, 50] }, ab: { ik: [24, 50] }, groundOn: ["heela"] };
const FSIT = { view: "front", t: 180, la: { K: [-4, 10], A: [-6, 51], ft: 90 }, lb: { K: [4, 10], A: [6, 51], ft: 90 }, aa: { E: [-4, 26], Wr: [6, 44] }, ab: { E: [4, 26], Wr: [-6, 44] }, groundOn: ["heela"] };
// bastone lungo la schiena (nuca, dorso, sacro)
function dowel(J) {
  const back = J.upper + 90, backL = J.lower + 90;
  const a = M.add(J.pelvis, backL, 12), b = M.add(J.headTop, back, 12);
  const a2 = M.add(a, J.lower, -12), b2 = M.add(b, J.upper, 10);
  return { type: "dowel", from: a2, to: b2 };
}
const VB = [-60, -84, 420, 280]; // inquadratura allargata (salti, braccia sopra la testa)
module.exports = { SIT, FSIT, VB, R, o, HANG, HANGB, STAND, FSTAND, SUP, HOOK, PRONE, QUAD, dowel, M };
