/* Cervicale, toracico, lombare */
"use strict";
const { SIT, FSIT, VB, R, o, STAND, FSTAND, SUP, HOOK, PRONE, QUAD, dowel, M } = require("./libreria");

const chair = { type: "chair", under: "pelvis" };
const ZH = { j: "head", w: 170, dy: 6 };
const ZL = { j: "head", w: 190, dx: 50, dy: -18 }; // supino
const nod = (r) => ({ type: "arc", at: "head", r: r || 15, a0: 300, a1: 20 });
const turn = { type: "arc", at: ["head", 0, -14], r: 14, a0: 200, a1: 340 };
const hookArms = { aa: { ua: 88, fa: 88 }, ab: { ua: 86, fa: 86 } };
// cuneo dietro la schiena (test di McGill)
const wedge = (gap) => (J) => { const b1 = M.add(J.pelvis, J.lower + 90, 12 + gap), b2 = M.add(J.shoulder, J.upper + 90, 12 + gap); return [{ type: "poly", pts: [[b1[0], 186], b1, b2, [b2[0] - 6, b2[1]], [b2[0] - 6, 186]], fill: "#C9B79C" }]; };

const hinge = (id) => ({ id, anchor: "anklea", move: [{ j: "pelvis", bend: 6 }], frames: [
  { pose: { t: 180, la: {}, lb: {}, aa: { ik: R(180, [-10, -14]), bend: 1 }, ab: { ik: R(180, [-14, 42]) } }, props: (J) => [dowel(J)] },
  { pose: { t: 118, la: { ik: [22, 80] }, lb: { ik: [22, 80] }, aa: { ik: R(118, [-10, -14]), bend: 1 }, ab: { ik: R(118, [-14, 42]) }, hl: ["la"] }, props: (J) => [dowel(J)] }] });
const waiter = (id) => ({ id, vb: [-20, -30, 340, 227], frames: [
  { pose: { t: 180, la: { ik: [22, 80] }, lb: { ik: [-20, 80], pf: 25 }, aa: { ua: 178, fa: 180 }, ab: { ua: -20, fa: -14 } }, props: [{ type: "kb", at: ["handa", 0, -2], up: true }] }] });

module.exports = [
  /* ---------- CERVICALE ---------- */
  { id: "cerv-flessione-craniocervicale", anchor: "shoulder", zoom: ZL, frames: [
    { pose: o(HOOK, hookArms, { h: 0, n: 0, groundOn: ["pelvis"] }), props: [{ type: "towel", at: ["head", 0, 11], w: 16, h: 4 }] },
    { pose: o(HOOK, hookArms, { h: 16, n: 0, hl: ["head"] }), props: [{ type: "towel", at: ["head", 0, 11], w: 16, h: 4 }, nod(16)] }] },

  { id: "cerv-flessione-capo-sollevato", anchor: "shoulder", zoom: ZL, frames: [
    { pose: o(HOOK, hookArms, { h: 16, n: 0, groundOn: ["pelvis"] }) },
    { pose: o(HOOK, hookArms, { h: 26, n: 14, hl: ["head"] }), props: [{ type: "arrow", from: ["head", 18, -2], to: ["head", 18, -14] }] }] },

  { id: "cerv-ccf-quadrupedia", anchor: "shoulder", zoom: { j: "head", w: 200, dx: -30, dy: 10 }, frames: [
    { pose: o(QUAD, { h: 14, n: 0, hl: ["head"] }), props: [nod(16)] },
    { pose: o(QUAD, { h: -16, n: 0, hl: ["head"] }), props: [{ type: "arc", at: "head", r: 16, a0: 20, a1: 300 }] }] },

  { id: "cerv-retrazione", anchor: "shoulder", zoom: ZH, frames: [
    { pose: o(SIT, { n: 18, h: -2 }), props: [chair] },
    { pose: o(SIT, { n: -14, h: 0, hl: ["head"] }), props: [chair, { type: "arrow", from: ["head", 18, 0], to: ["head", 6, 0] }] }] },

  { id: "cerv-retrazione-elastico", anchor: "shoulder", zoom: { j: "head", w: 190, dx: 20, dy: 10 }, frames: [
    { pose: o(SIT, { n: 14, h: -2 }), props: [chair, { type: "post", x: "head", dx: 70, y: 40 }, { type: "band", from: ["head", 70, 0], to: ["head", -9, 0] }] },
    { pose: o(SIT, { n: -14, h: 0, hl: ["head"] }), props: [chair, { type: "post", x: "head", dx: 76, y: 40 }, { type: "band", from: ["head", 76, 0], to: ["head", -9, 0] }] }] },

  { id: "cerv-estensori-quadrupedia", anchor: "shoulder", zoom: { j: "head", w: 200, dx: -30, dy: 10 }, frames: [
    { pose: o(QUAD, { n: 0, h: 8 }) },
    { pose: o(QUAD, { n: 45, h: 50, hl: ["head"] }), props: [{ type: "arc", at: "neck", r: 20, a0: 20, a1: 80 }] }] },

  { id: "cerv-rotazione-quadrupedia", anchor: "shoulder", zoom: { j: "head", w: 200, dx: -30, dy: 10 }, frames: [
    { pose: o(QUAD, { h: 6 }) },
    { pose: o(QUAD, { h: 6, hl: ["head"] }), props: [{ type: "arc", at: ["head", 0, 0], r: 6, ry: 17, a0: 250, a1: 110 }, { type: "text", x: "head", dx: 0, y: 0, text: "" }] }] },

  { id: "cerv-isometria-rotazione", zoom: { j: "head", w: 220, dy: 30 }, frames: [
    { pose: o(FSIT, { aa: { E: [-14, -4], Wr: [5, -21] }, hl: ["head"] }), props: [chair, { type: "arrow", from: ["head", 14, -14], to: ["head", -2, -18], bend: -4 }] }] },

  { id: "cerv-flessione-seduto-elastico", anchor: "shoulder", zoom: { j: "head", w: 190, dx: -20, dy: 10 }, frames: [
    { pose: o(SIT, { n: 0, h: 0 }), props: (J) => [chair, { type: "post", x: J.shoulder[0] - 70, y: 40 }, { type: "band", from: [J.shoulder[0] - 70, J.shoulder[1] - 23], to: ["head", 9, -5] }] },
    { pose: o(SIT, { n: 22, h: 40, hl: ["head"] }), props: (J) => [chair, { type: "post", x: J.shoulder[0] - 70, y: 40 }, { type: "band", from: [J.shoulder[0] - 70, J.shoulder[1] - 23], to: ["head", 8, -5] }] }] },

  { id: "cerv-estensione-elastico", anchor: "shoulder", zoom: { j: "head", w: 190, dx: 20, dy: 10 }, frames: [
    { pose: o(SIT, { n: 22, h: 30 }), props: (J) => [chair, { type: "post", x: J.shoulder[0] + 80, y: 40 }, { type: "band", from: [J.shoulder[0] + 80, J.shoulder[1] - 22], to: ["head", -9, 0] }] },
    { pose: o(SIT, { n: 0, h: 2, hl: ["head"] }), props: (J) => [chair, { type: "post", x: J.shoulder[0] + 80, y: 40 }, { type: "band", from: [J.shoulder[0] + 80, J.shoulder[1] - 22], to: ["head", -9, 0] }] }] },

  { id: "cerv-inclinazione-elastico", anchor: "shoulder", zoom: { j: "head", w: 190, dx: -10, dy: 20 }, frames: [
    { pose: o(FSIT, { h: 0 }), props: (J) => [chair, { type: "post", x: J.shoulder[0] - 70, y: 40 }, { type: "band", from: [J.shoulder[0] - 70, J.shoulder[1] - 22], to: ["head", -9, -3] }] },
    { pose: o(FSIT, { h: 24, hl: ["head"] }), props: (J) => [chair, { type: "post", x: J.shoulder[0] - 70, y: 40 }, { type: "band", from: [J.shoulder[0] - 70, J.shoulder[1] - 22], to: ["head", -9, -3] }] }] },

  { id: "cerv-y-prono", anchor: "pelvis", frames: [
    { pose: o(PRONE, { aa: { ua: 0, fa: 0 }, ab: { ua: 4, fa: 4 }, groundOn: ["pelvis"], lift: 62 }), props: (J) => [{ type: "bench", x: J.anklea[0] - 6, w: J.shoulder[0] - J.anklea[0] + 14, top: J.pelvis[1] + 11 }, { type: "towel", at: ["head", 4, 11], w: 14 }] },
    { pose: o(PRONE, { aa: { ua: 112, fa: 112, wr: 0 }, ab: { ua: 110, fa: 110 }, hl: ["aa", "ab"] }), props: (J) => [{ type: "bench", x: J.anklea[0] - 6, w: J.shoulder[0] - J.anklea[0] + 14, top: J.pelvis[1] + 11 }, { type: "towel", at: ["head", 4, 11], w: 14 }] }] },

  { id: "cerv-riposizionamento", anchor: "shoulder", frames: [
    { pose: o(SIT, { dx: -40, n: 0, h: 0 }), props: (J) => laser(J) },
    { pose: o(SIT, { n: 10, h: 16, hl: ["head"] }), props: (J) => laser(J) }] },

  { id: "cerv-stabilita-sguardo", anchor: "shoulder", zoom: { j: "head", w: 200, dy: 30 }, frames: [
    { pose: o(FSIT, { aa: { E: [6, 22], Wr: [16, 10], uaL: 0.6 } }), props: [chair, { type: "card", at: ["head", 0, 26], text: "A" }] },
    { pose: o(FSIT, { hr: 0.8, aa: { E: [6, 22], Wr: [16, 10] }, hl: ["head"] }), props: [chair, { type: "card", at: ["head", 0, 26], text: "A" }, turn] }] },

  { id: "cerv-coordinazione-occhio-capo", anchor: "shoulder", zoom: { j: "head", w: 220, dy: 30 }, frames: [
    { pose: o(FSIT, { hr: 0 }), props: [chair, { type: "target", at: ["head", -80, -6], r: 7 }, { type: "target", at: ["head", 80, -6], r: 7 }] },
    { pose: o(FSIT, { hr: 0.9, hl: ["head"] }), props: [chair, { type: "target", at: ["head", -80, -6], r: 7 }, { type: "target", at: ["head", 80, -6], r: 7 }, { type: "line", from: ["head", 8, 0], to: ["head", 72, -6], dash: "3 3", col: "#E0703A", w: 1.4 }] }] },

  { id: "cerv-rotazione-attiva", anchor: "shoulder", zoom: { j: "head", w: 170, dy: 20 }, frames: [
    { pose: o(FSIT, {}), props: [chair] },
    { pose: o(FSIT, { hr: -0.9, hl: ["head"] }), props: [chair, { type: "arc", at: ["head", 0, -14], r: 14, a0: 340, a1: 200 }] }] },

  { id: "cerv-snag-rotazione", anchor: "shoulder", zoom: { j: "head", w: 170, dy: 20 }, frames: [
    { pose: o(FSIT, { aa: { E: [-6, 22], Wr: [10, -4] }, ab: { E: [6, 22], Wr: [-10, -4] } }), props: (J) => [{ type: "strap", from: J.wrista, to: [J.neck[0] - 7, J.neck[1] - 2] }, { type: "strap", from: J.wristb, to: [J.neck[0] + 7, J.neck[1] - 2] }] },
    { pose: o(FSIT, { hr: 0.9, aa: { E: [-6, 22], Wr: [10, -4] }, ab: { E: [6, 22], Wr: [-4, -2] }, hl: ["head"] }), props: (J) => [{ type: "strap", from: J.wrista, to: [J.neck[0] - 7, J.neck[1] - 2] }, { type: "strap", from: J.wristb, to: [J.neck[0] + 7, J.neck[1] - 2] }, turn] }] },

  { id: "cerv-neurodinamica-mediano", anchor: "shoulder", frames: [
    { pose: o(FSIT, { h: 18, aa: { ua: -92, fa: 180, hd: -110 }, hl: ["aa"] }), props: [chair] },
    { pose: o(FSIT, { h: -18, aa: { ua: -92, fa: -92, hd: 180 }, hl: ["aa"] }), props: [chair] }] },

  /* ---------- TORACICO ---------- */
  { id: "tor-respirazione-costale", frames: [
    { pose: { t: 270, la: { th: 180, sh: 90, ft: 180 }, lb: { th: 180, sh: 90, ft: 180 }, aa: { ik: [24, -2], bend: -1 }, ab: { ik: [24, -2], bend: -1 }, groundOn: ["pelvis"] },
      props: [{ type: "wall", x: "anklea", dx: 8, w: 10 }, { type: "arc", at: ["mid", -6, -8], r: 18, a0: 200, a1: 330 }] }] },

  { id: "tor-rotazione-quadrupedia", anchor: "kneea", frames: [
    { pose: o(QUAD, { t: 96, h: 12, la: { th: 28, sh: -92, ft: -95 }, aa: { E: [8, 22], Wr: [16, -9] }, ab: { ua: 4, fa: 4, hd: 90 }, groundOn: ["kneea"] }) },
    { pose: o(QUAD, { t: 96, h: -40, la: { th: 28, sh: -92, ft: -95 }, aa: { E: [-2, -28], Wr: [16, -9] }, ab: { ua: 4, fa: 4, hd: 90 }, hl: ["aa"] }), props: [{ type: "arc", at: "shoulder", r: 28, a0: 70, a1: -70 }] }] },

  { id: "tor-thread-needle", anchor: "kneea", frames: [
    { pose: o(QUAD, { t: 78, h: 10, aa: { E: [-6, 24], Wr: [-16, 36], hd: -90 }, ab: { ua: 6, fa: 6, hd: 90 }, groundOn: ["kneea"] }) },
    { pose: o(QUAD, { t: 92, h: -45, aa: { ua: 180, fa: 180 }, ab: { ua: 2, fa: 2, hd: 90 }, hl: ["aa"] }), props: [{ type: "arc", at: "shoulder", r: 30, a0: 100, a1: -80 }] }] },

  { id: "tor-open-book", noFloor: true, frames: [
    { pose: { t: 180, root: [140, 110], la: { th: 90, sh: 0 }, lb: { th: 92, sh: 2 }, aa: { ua: 90, fa: 90 }, ab: { ua: 92, fa: 92 } }, props: [{ type: "mat", x0: 50, y0: 18, x1: 250, y1: 182, layer: "back" }, { type: "roller", at: ["kneea", 0, 0], r: 6 }, { type: "text", x: 150, y: 196, text: "vista dall'alto", size: 10 }] },
    { pose: { t: 180, root: [140, 110], la: { th: 90, sh: 0 }, lb: { th: 92, sh: 2 }, aa: { ua: -88, fa: -88 }, ab: { ua: 92, fa: 92 }, hl: ["aa"] }, props: [{ type: "mat", x0: 50, y0: 18, x1: 250, y1: 182, layer: "back" }, { type: "roller", at: ["kneea", 0, 0], r: 6 }, { type: "arc", at: "shoulder", r: 46, a0: 0, a1: -180 }, { type: "text", x: 150, y: 196, text: "vista dall'alto", size: 10 }] }] },

  { id: "tor-rotazione-mezzo-ginocchio", anchor: "pelvis", frames: [
    { pose: { view: "front", t: 180, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { E: [8, 12], Wr: [16, 18] }, ab: { E: [-8, 12], Wr: [-16, 18] }, groundOn: ["kneea"] }, props: [{ type: "post", x: 24, y: 40 }, { type: "band", from: ["shoulder", -100, 16], to: ["shoulder", 0, 16] }] },
    { pose: { view: "front", t: 180, shW: 8, hr: 0.8, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { ua: 88, fa: 88 }, ab: { ua: 86, fa: 86 }, hl: ["trunk"] }, props: [{ type: "post", x: 24, y: 40 }, { type: "band", from: ["shoulder", -100, 16], to: "wristb" }, { type: "arc", at: "shoulder", r: 30, a0: 200, a1: 340 }] }] },

  { id: "tor-estensione-panca", anchor: "kneea", frames: [
    { pose: { t: 128, h: 0, la: { th: 2, sh: -92, ft: -95 }, aa: { E: R(128, [4, -30]), Wr: R(128, [-6, -6]) }, groundOn: ["kneea"] }, props: (J) => [{ type: "bench", x: J.elbowa[0] - 14, w: 60, top: J.elbowa[1] + 5 }] },
    { pose: { t: 86, h: 0, tc: -16, la: { th: 46, sh: -92, ft: -95 }, aa: { E: R(86, [4, -30]), Wr: R(86, [-6, -6]) }, hl: ["trunk"] }, props: (J) => [{ type: "bench", x: J.elbowa[0] - 14, w: 60, top: J.elbowa[1] + 5 }] }] },

  { id: "tor-worlds-greatest", anchor: "anklea", frames: [
    { pose: { t: 110, h: 10, la: { ik: [40, 40] }, lb: { th: -62, sh: -66, pf: 10 }, aa: { E: [14, 22], Wr: [30, 32] }, ab: { ik: [16, 52] }, groundOn: ["toeb"] } },
    { pose: { t: 120, h: -55, la: { ik: [40, 40] }, lb: { th: -62, sh: -66, pf: 10 }, aa: { ua: 186, fa: 186 }, ab: { ik: [16, 52] }, hl: ["aa", "trunk"] }, props: [{ type: "arc", at: "shoulder", r: 30, a0: 80, a1: -90 }] }] },

  { id: "tor-wall-angel", anchor: "anklea", frames: [
    { pose: o(FSTAND, { aa: { ua: -112, fa: 180 }, ab: { ua: 112, fa: 180 } }), props: [{ type: "wallBack" }] },
    { pose: o(FSTAND, { aa: { ua: -155, fa: -160 }, ab: { ua: 155, fa: 160 }, hl: ["aa", "ab"] }), props: [{ type: "wallBack" }] }] },

  { id: "tor-prono-y", anchor: "pelvis", move: ["wrista"], frames: [
    { pose: o(PRONE, { aa: { ua: 92, fa: 92 }, ab: { ua: 90, fa: 90 }, groundOn: ["pelvis"] }), props: [{ type: "towel", at: ["head", 2, 11], w: 14 }] },
    { pose: o(PRONE, { aa: { ua: 106, fa: 106 }, ab: { ua: 104, fa: 104 }, hl: ["aa", "ab"] }), props: [{ type: "towel", at: ["head", 2, 11], w: 14 }] }] },

  { id: "tor-prono-w", noFloor: true, frames: [
    { pose: { view: "front", t: 90, root: [120, 100], h: 0, la: { th: -90, sh: -90, ft: -90 }, lb: { th: -90, sh: -90, ft: -90 }, aa: { E: [6, -26], Wr: [32, -26] }, ab: { E: [6, 26], Wr: [32, 26] }, hl: ["aa", "ab"] },
      props: [{ type: "mat", x0: 20, y0: 40, x1: 280, y1: 160, layer: "back" }, { type: "text", x: 150, y: 190, text: "vista dall'alto: si sollevano gomiti e mani", size: 10 }] }] },

  { id: "tor-rematore-split-stance", anchor: "anklea", move: [{ j: "wrista", bend: -6 }], frames: [
    { pose: { t: 172, la: { ik: [-20, 80], pf: 30 }, lb: { ik: [24, 80] }, aa: { ua: 86, fa: 86 }, ab: { ua: 10, fa: 10 } }, props: [{ type: "cable", x: "anklea", dx: 140, y: "shoulder", dy: 4, to: "wrista" }] },
    { pose: { t: 178, la: { ik: [-20, 80], pf: 30 }, lb: { ik: [24, 80] }, aa: { ik: [-10, 50] }, ab: { ua: 10, fa: 10 }, hl: ["aa"] }, props: [{ type: "cable", x: "anklea", dx: 140, y: "shoulder", dy: 4, to: "wrista" }] }] },

  { id: "tor-wall-slide-serrato", anchor: "anklea", vb: [-10, -20, 320, 213], frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 92, fa: 180 }, ab: { ua: 90, fa: 180 } }, props: (J) => [{ type: "wall", x: J.wrista[0] + 5, w: 10 }, { type: "roller", at: ["elbowa", 3, -12], r: 5 }] },
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 152, fa: 176 }, ab: { ua: 150, fa: 176 }, hl: ["aa"] }, props: (J) => [{ type: "wall", x: J.wrista[0] + 5, w: 10 }, { type: "roller", at: ["elbowa", 4, -12], r: 5 }] }] },

  { id: "tor-landmine-press", anchor: "kneea", frames: [
    { pose: { t: 178, la: { th: 0, sh: -92, ft: -95 }, lb: { th: 90, sh: 0 }, aa: { ik: [10, 8] }, ab: { ua: 10, fa: 20 }, groundOn: ["kneea"] }, props: [{ type: "landmine", x: "pelvis", dx: 130, at: "handa" }] },
    { pose: { t: 172, la: { th: 0, sh: -92, ft: -95 }, lb: { th: 90, sh: 0 }, aa: { ua: 128, fa: 128 }, ab: { ua: 10, fa: 20 }, hl: ["aa"] }, props: [{ type: "landmine", x: "pelvis", dx: 130, at: "handa" }] }] },

  { id: "tor-lift-cavo", anchor: "pelvis", move: [{ j: "wrista", bend: 10 }], frames: [
    { pose: { view: "front", t: 180, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { E: [-14, 30], Wr: [-6, 52] }, ab: { E: [-22, 34], Wr: [-38, 52] }, groundOn: ["kneea"] }, props: [{ type: "cable", x: 24, y: 172, to: "wristb" }] },
    { pose: { view: "front", t: 182, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { E: [26, -18], Wr: [46, -42] }, ab: { E: [12, -24], Wr: [16, -46] }, hl: ["aa", "ab", "trunk"] }, props: [{ type: "cable", x: 24, y: 172, to: "wrista" }] }] },

  { id: "tor-halo", anchor: "anklea", zoom: { j: "head", w: 200, dy: 30 }, frames: [
    { pose: o(FSTAND, { aa: { E: [2, 26], Wr: [16, 18] }, ab: { E: [-2, 26], Wr: [-16, 18] } }), props: [{ type: "kb", at: ["shoulder", 0, 14], up: true }] },
    { pose: o(FSTAND, { aa: { E: [-6, -12], Wr: [22, -26] }, ab: { E: [12, 6], Wr: [-4, -22] }, hl: ["aa", "ab"] }), props: [{ type: "kb", at: ["head", 14, -4], up: true }, { type: "arc", at: "head", r: 24, a0: 120, a1: -60 }] }] },

  waiter("tor-waiter-walk"),

  { id: "tor-landmine-rotational-press", anchor: "pelvis", frames: [
    { pose: o(FSTAND, { shW: 10, hr: 0.6, la: { ik: [-18, 82] }, lb: { K: [14, 40], A: [20, 80] }, ab: { E: [4, 24], Wr: [-2, 6] }, aa: { E: [6, 24], Wr: [14, 6] } }), props: [{ type: "landmine", x: "pelvis", dx: 120, at: "handb" }] },
    { pose: o(FSTAND, { hr: -0.5, la: { ik: [-18, 82] }, lb: { ik: [22, 80], pf: 30 }, ab: { ua: 214, fa: 214 }, aa: { ua: -20, fa: -10 }, hl: ["ab", "trunk"] }), props: [{ type: "landmine", x: "pelvis", dx: 120, at: "handb" }, { type: "arc", at: "pelvis", r: 30, a0: 340, a1: 200 }] }] },

  { id: "tor-simulazione-attacco-elastico", anchor: "anklea", vb: [-20, -40, 340, 227], frames: [
    { pose: { t: 192, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 230, fa: 172 }, ab: { ua: 120, fa: 140 } }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }] },
    { pose: { t: 160, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 120, fa: 110 }, ab: { ua: 20, fa: 20 }, hl: ["aa"] }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }] }] },

  /* ---------- LOMBARE ---------- */
  { id: "lomb-rotazione-supina", noFloor: true, frames: [
    { pose: { view: "front", t: 270, root: [110, 100], la: { K: [24, 6], A: [46, 7], ft: 90 }, lb: { K: [24, -6], A: [46, -7], ft: 90 }, aa: { ua: 0, fa: 0 }, ab: { ua: 180, fa: 180 } }, props: [{ type: "mat", x0: 20, y0: 30, x1: 280, y1: 172, layer: "back" }, { type: "text", x: 150, y: 192, text: "vista dall'alto", size: 10 }] },
    { pose: { view: "front", t: 270, root: [110, 100], la: { K: [30, 34], A: [50, 12], ft: 90 }, lb: { K: [34, 24], A: [52, 4], ft: 90 }, aa: { ua: 0, fa: 0 }, ab: { ua: 180, fa: 180 }, hl: ["la", "lb"] }, props: [{ type: "mat", x0: 20, y0: 30, x1: 280, y1: 172, layer: "back" }, { type: "arc", at: "pelvis", r: 36, a0: -30, a1: 40 }, { type: "text", x: 150, y: 192, text: "vista dall'alto", size: 10 }] }] },

  { id: "lomb-press-up", anchor: "pelvis", frames: [
    { pose: o(PRONE, { la: { th: -90, sh: -90, ft: -10 }, lb: { th: -90, sh: -90, ft: -10 }, aa: { ik: [4, 9], bend: -1 }, groundOn: ["pelvis"] }) },
    { pose: o(PRONE, { t: 140, tc: -18, h: -6, la: { th: -90, sh: -90, ft: -10 }, lb: { th: -90, sh: -90, ft: -10 }, aa: { stay: true }, hl: ["trunk"] }) }] },

  { id: "lomb-slider-sciatico", anchor: "pelvis", frames: [
    { pose: o(SIT, { tc: 20, t: 172, n: 26, h: 36, la: { th: 90, sh: -6 }, lb: { th: 90, sh: 0 } }), props: [{ type: "bench", x: "pelvis", dx: -40, w: 60, top: "pelvis", dy: 11 }] },
    { pose: o(SIT, { tc: 20, t: 172, n: -10, h: -26, la: { th: 92, sh: 80 }, lb: { th: 90, sh: 0 }, hl: ["la"] }), props: [{ type: "bench", x: "pelvis", dx: -40, w: 60, top: "pelvis", dy: 11 }] }] },

  { id: "lomb-slider-femorale", noFloor: true, frames: [
    { pose: { t: 180, root: [150, 104], h: -26, la: { th: -24, sh: -120 }, lb: { th: 138, sh: 46 }, aa: { ik: [44, 36] }, ab: { ik: [40, 34] }, hl: ["la"] }, props: [{ type: "mat", x0: 60, y0: 18, x1: 240, y1: 182, layer: "back" }, { type: "text", x: 150, y: 196, text: "vista dall'alto, sul fianco", size: 10 }] },
    { pose: { t: 180, root: [150, 104], h: 26, la: { th: 8, sh: -80 }, lb: { th: 138, sh: 46 }, aa: { ik: [44, 36] }, ab: { ik: [40, 34] }, hl: ["la"] }, props: [{ type: "mat", x0: 60, y0: 18, x1: 240, y1: 182, layer: "back" }, { type: "text", x: 150, y: 196, text: "vista dall'alto, sul fianco", size: 10 }] }] },

  hinge("lomb-hinge-bastone"),

  { id: "lomb-bird-dog", anchor: "kneeb", frames: [
    { pose: o(QUAD, { groundOn: ["kneea"] }) },
    { pose: o(QUAD, { la: { th: -90, sh: -90, ft: -90 }, lb: { th: 0, sh: -90, ft: -95 }, ab: { ua: 90, fa: 90 }, hl: ["la", "ab"] }) }] },

  { id: "lomb-curl-up-mcgill", anchor: "pelvis", frames: [
    { pose: { t: 270, la: { ik: [48, 4], ft: 90 }, lb: { th: 90, sh: 90 }, aa: { ua: 80, fa: 94 }, ab: { ua: 80, fa: 94 }, groundOn: ["pelvis"] } },
    { pose: { t: 266, tc: 9, la: { ik: [48, 4], ft: 90 }, lb: { th: 90, sh: 90 }, aa: { ua: 80, fa: 94 }, ab: { ua: 80, fa: 94 } }, props: [{ type: "arrow", from: ["head", 0, -12], to: ["head", 0, -24] }, { type: "arrow", from: ["shoulder", 0, -12], to: ["shoulder", 0, -22] }] }] },

  { id: "lomb-ponte-marcia", anchor: "shoulder", frames: [
    { pose: { t: 294, h: 24, la: { ik: [42, 36], ft: 90 }, lb: { ik: [40, 36], ft: 90 }, aa: { ua: 70, fa: 70 }, ab: { ua: 70, fa: 70 }, groundOn: ["heela"] } },
    { pose: { t: 294, h: 24, la: { stay: true }, lb: { th: 160, sh: 80 }, aa: { ua: 70, fa: 70 }, ab: { ua: 70, fa: 70 }, hl: ["la"] } }] },

  { id: "lomb-bear-plank", anchor: "wrista", frames: [
    { pose: o(QUAD, { groundOn: ["kneea"] }) },
    { pose: o(QUAD, { la: { th: 2, sh: -98, ft: 25 }, lb: { th: 2, sh: -98, ft: 25 }, hl: ["trunk"] }), props: [{ type: "arrow", from: ["kneea", 0, 12], to: ["kneea", 0, 2] }] }] },

  { id: "lomb-hollow", anchor: "pelvis", frames: [
    { pose: { t: 270, la: { th: 90, sh: 90 }, aa: { ua: -90, fa: -90 }, groundOn: ["pelvis"] } },
    { pose: { t: 266, tc: 10, h: 10, la: { th: 108, sh: 108 }, aa: { ua: -102, fa: -102 }, hl: ["trunk"] } }] },

  { id: "lomb-flessori-isometria", anchor: "pelvis", frames: [
    { pose: { t: 210, la: { ik: [50, 6], ft: 90 }, lb: { ik: [48, 6], ft: 90 }, aa: { ik: R(210, [16, 16]) }, ab: { ik: R(210, [14, 18]) }, groundOn: ["pelvis"] }, props: wedge(0) },
    { pose: { t: 210, la: { ik: [50, 6], ft: 90 }, lb: { ik: [48, 6], ft: 90 }, aa: { ik: R(210, [16, 16]) }, ab: { ik: R(210, [14, 18]) }, hl: ["trunk"] }, props: (J) => wedge(10)(J).concat([{ type: "arrow", from: ["mid", -26, 6], to: ["mid", -40, 6] }]) }] },

  { id: "lomb-reverse-hyper", anchor: "pelvis", move: [{ j: "anklea", bend: -10 }], frames: [
    { pose: { t: 90, la: { th: 6, sh: 6, ft: 96 }, lb: { th: 4, sh: 4, ft: 94 }, aa: { ik: [6, 22] }, groundOn: ["pelvis"], lift: 92 }, props: (J) => [{ type: "bench", x: J.pelvis[0] - 8, w: 92, top: J.pelvis[1] + 11 }] },
    { pose: { t: 90, la: { th: -88, sh: -88, ft: 0 }, lb: { th: -88, sh: -88, ft: 0 }, aa: { ik: [6, 22] }, hl: ["la"] }, props: (J) => [{ type: "bench", x: J.pelvis[0] - 8, w: 92, top: J.pelvis[1] + 11 }] }] },

  waiter("lomb-waiter-carry"),

  { id: "lomb-plank-drag", anchor: "anklea", frames: [
    { pose: { t: 100, la: { th: -78, sh: -78, ft: 10 }, aa: { ua: 0, fa: 0, hd: 90 }, ab: { ua: 0, fa: 0, hd: 90 }, groundOn: ["toea"] }, props: [{ type: "kb", at: ["handa", -16, -12] }] },
    { pose: { t: 100, la: { th: -78, sh: -78, ft: 10 }, aa: { ua: 0, fa: 0, hd: 90 }, ab: { ua: -26, fa: -30 }, hl: ["trunk"] }, props: [{ type: "kb", at: ["handb", 0, -6] }] }] },

  { id: "lomb-stacco-kb", anchor: "anklea", move: [{ j: "pelvis", bend: -6 }], frames: [
    { pose: { t: 128, la: { ik: [26, 68] }, lb: { ik: [26, 68] }, aa: { ua: 2, fa: 2 }, ab: { ua: 2, fa: 2 }, hl: ["la"] }, props: [{ type: "kb", at: "handa" }] },
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 4, fa: 4 }, ab: { ua: 4, fa: 4 }, hl: ["la"] }, props: [{ type: "kb", at: "handa" }] }] },

  { id: "lomb-jefferson-curl", anchor: "anklea", frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 2, fa: 2 }, ab: { ua: 2, fa: 2 }, groundOn: ["heela"], lift: 26 }, props: [{ type: "box", x: "heela", dx: -6, w: 26, top: "heela", dy: 2 }, { type: "db", at: "handa" }] },
    { pose: { t: 98, tc: 72, h: 40, la: { ik: [14, 83] }, lb: { ik: [14, 83] }, aa: { ua: 4, fa: 4 }, ab: { ua: 4, fa: 4 }, hl: ["trunk"] }, props: [{ type: "box", x: "heela", dx: -6, w: 26, top: "heela", dy: 2 }, { type: "db", at: "handa" }] }] },

  { id: "lomb-sollevamento-gesto", ghost: false, frames: [
    { pose: { dx: -40, t: 140, la: { ik: [26, 52] }, lb: { ik: [22, 54] }, aa: { ik: R(140, [24, 50]) }, ab: { ik: R(140, [22, 50]) } }, props: [{ type: "crate", at: ["wrista", 6, 4], w: 34, h: 22 }] },
    { pose: { free: true, dx: 10, t: 180, la: {}, lb: {}, aa: { ik: [30, 40] }, ab: { ik: [30, 40] } }, props: (J) => [{ type: "crate", at: ["wrista", 16, -2], w: 34, h: 22 }, { type: "bench", x: J.wrista[0] - 2, w: 70, top: J.wrista[1] + 9 }] }] },

  { id: "lomb-cammino", frames: [
    { pose: { t: 178, la: { ik: [24, 80] }, lb: { ik: [-22, 80], pf: 30 }, aa: { ua: -24, fa: -14 }, ab: { ua: 24, fa: 50 } } }] },
];

function laser(J) {
  const wallX = J.pelvis[0] + 170;
  const fa = (J.headA - 90) * Math.PI / 180; const d = [Math.sin(fa), Math.cos(fa)];
  const from = [J.head[0] + d[0] * 8, J.head[1] + d[1] * 8];
  const k = (wallX - from[0]) / d[0]; const to = [wallX, from[1] + d[1] * k];
  return [{ type: "chair", under: "pelvis" }, { type: "wall", x: wallX, w: 10 }, { type: "target", at: [wallX - 1, J.head[1] - 2], r: 6 }, { type: "laser", from, to }];
}
