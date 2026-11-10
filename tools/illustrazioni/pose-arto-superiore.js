/* Spalla, gomito, polso e mano */
"use strict";
const { SIT, FSIT, VB, R, o, STAND, FSTAND, SUP, HOOK, PRONE, QUAD, M } = require("./libreria");
const H = require("./mani");
const { C, add, seg, f1 } = M;

const chair = { type: "chair", under: "pelvis" };
const stick = (at) => ({ type: "roller", at, r: 3.5 });
const benchUnder = (J) => ({ type: "bench", x: Math.min(J.anklea[0], J.headTop[0]) - 6, w: Math.abs(J.shoulder[0] - J.anklea[0]) + 20, top: J.pelvis[1] + 11 });
const ZARM = { j: "elbowa", w: 170, dy: 0 };
const T = (x, y, t, s) => ({ type: "text", x, y, text: t, size: s || 10 });

// martello / manubrio caricato da un lato: manico dalla mano in direzione a
function hammer(h, a, len) { const e = add(h, a, len || 34); const p = add(e, a + 90, 7), q = add(e, a - 90, 7); return seg(h, e, 4, "#8C6B3E") + seg(p, q, 9, C.eq); }
function flexbar(a, b) { return seg(a, b, 9, "#D9534F"); }
function vbClose(x, y) { return [x, y, 150, 100]; }

/* ---- scene ravvicinate (mano) ---- */
const close = {
  prono: (sup) => {
    const w = [120, 92];
    const h = H.handFlat({ w, d: 90, palmar: sup, side: sup ? 1 : -1, foreLen: 120 });
    return H.bg({ y: 116 }) + h.svg + H.arc([90, 92], 8, sup ? 250 : 110, sup ? 110 : 250, 18) + H.label(130, 152, sup ? "palmo in alto (supinazione)" : "palmo in basso (pronazione)", 9);
  },
};

module.exports = [
  /* ---------- SPALLA ---------- */
  { id: "sp-pendolo", anchor: "anklea", frames: [
    { pose: { t: 110, h: 10, la: { ik: [16, 82] }, lb: { ik: [-10, 82] }, aa: { ua: 0, fa: 0 }, ab: { ik: R(110, [-6, 44]) } }, props: (J) => [{ type: "bench", x: J.wristb[0] - 10, w: 60, top: J.wristb[1] + 6 }] },
    { pose: { t: 110, h: 10, la: { ik: [16, 82] }, lb: { ik: [-10, 82] }, aa: { ua: 24, fa: 24 }, ab: { ik: R(110, [-6, 44]) }, hl: ["aa"] }, props: (J) => [{ type: "bench", x: J.wristb[0] - 10, w: 60, top: J.wristb[1] + 6 }, { type: "arc", at: "shouldera", r: 62, a0: 70, a1: 115 }] }] },

  { id: "sp-flessione-bastone", anchor: "pelvis", move: [{ j: "wrista", bend: -20 }], frames: [
    { pose: o(HOOK, { aa: { ua: 150, fa: 150 }, ab: { ua: 150, fa: 150 }, groundOn: ["pelvis"] }), props: [stick("handa")] },
    { pose: o(HOOK, { aa: { ua: 260, fa: 260 }, ab: { ua: 260, fa: 260 }, hl: ["aa"] }), props: [stick("handa")] }] },

  { id: "sp-extrarotazione-bastone", noFloor: true, frames: [
    { pose: { view: "front", t: 270, root: [130, 96], la: { th: 90, sh: 90, ft: 0 }, lb: { th: 90, sh: 90, ft: 180 }, aa: { E: [28, 2], Wr: [32, 4] }, ab: { E: [24, 10], Wr: [32, 24] }, hl: ["aa"] }, props: (J) => [{ type: "mat", x0: 20, y0: 40, x1: 280, y1: 160, layer: "back" }, { type: "dowel", from: J.wristb, to: J.wrista }, T(150, 190, "vista dall'alto")] },
    { pose: { view: "front", t: 270, root: [130, 96], la: { th: 90, sh: 90, ft: 0 }, lb: { th: 90, sh: 90, ft: 180 }, aa: { E: [28, 2], Wr: [28, 28] }, ab: { E: [24, 18], Wr: [30, 34] }, hl: ["aa"] }, props: (J) => [{ type: "mat", x0: 20, y0: 40, x1: 280, y1: 160, layer: "back" }, { type: "dowel", from: J.wristb, to: J.wrista }, { type: "arc", at: "elbowa", r: 22, a0: -60, a1: 60 }, T(150, 190, "vista dall'alto")] }] },

  { id: "sp-sleeper", noFloor: true, frames: [
    { pose: { t: 180, root: [130, 110], la: { th: 100, sh: 10 }, lb: { th: 110, sh: 20 }, aa: { ua: 90, fa: 90, faL: 0.2 }, ab: { ik: [40, -2] }, hl: ["aa"] }, props: [{ type: "mat", x0: 50, y0: 20, x1: 250, y1: 182, layer: "back" }, T(150, 196, "vista dall'alto, sul fianco da trattare")] },
    { pose: { t: 180, root: [130, 110], la: { th: 100, sh: 10 }, lb: { th: 110, sh: 20 }, aa: { ua: 90, fa: 6 }, ab: { ik: [34, 18] }, hl: ["aa"] }, props: [{ type: "mat", x0: 50, y0: 20, x1: 250, y1: 182, layer: "back" }, { type: "arrow", from: ["wrista", 12, -14], to: ["wrista", 10, 0] }, T(150, 196, "vista dall'alto, sul fianco da trattare")] }] },

  { id: "sp-stretch-pettorale", anchor: "elbowa", frames: [
    { pose: { t: 180, la: {}, lb: { ik: [16, 82] }, aa: { E: [-4, 2], Wr: [-6, -24] }, ab: { ua: 4, fa: 4 } }, props: (J) => [{ type: "post", x: J.wrista[0] - 6, y: 10 }] },
    { pose: { t: 168, la: { ik: [-14, 82] }, lb: { ik: [20, 80] }, aa: { E: [-10, 0], Wr: [-12, -26] }, ab: { ua: 4, fa: 4 } }, props: (J) => [{ type: "post", x: J.wrista[0] - 6, y: 10 }, { type: "arrow", from: ["shoulder", 10, -2], to: ["shoulder", 26, -2] }] }] },

  { id: "sp-isometrie-cuffia", frames: [
    { pose: o(FSTAND, { aa: { E: [-2, 28], Wr: [-6, 34], faL: 0.3 }, hl: ["aa"] }), props: [{ type: "wallL", x: "wrista", dx: -3, w: 10 }, { type: "towel", at: ["elbowa", 7, -6], w: 6, h: 12 }, { type: "arrow", from: ["wrista", 16, -10], to: ["wrista", 2, -10] }] }] },

  { id: "sp-er-90-90", anchor: "anklea", frames: [
    { pose: o(STAND, { aa: { E: [3, 2], fa: 90 }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 120, y: 40 }, { type: "band", from: ["shoulder", 120, 0], to: "handa" }] },
    { pose: o(STAND, { aa: { E: [3, 2], fa: 180 }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 120, y: 40 }, { type: "band", from: ["shoulder", 120, 0], to: "handa" }, { type: "arc", at: "elbowa", r: 22, a0: 0, a1: -90 }] }] },

  { id: "sp-er-pliometrica", anchor: "anklea", frames: [
    { pose: o(STAND, { aa: { E: [3, 2], fa: 110 }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 120, y: 40 }, { type: "band", from: ["shoulder", 120, 0], to: "handa" }, { type: "arc", at: "elbowa", r: 22, a0: -60, a1: -10 }] },
    { pose: o(STAND, { aa: { E: [3, 2], fa: 178 }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 120, y: 40 }, { type: "band", from: ["shoulder", 120, 0], to: "handa" }, { type: "arc", at: "elbowa", r: 22, a0: -10, a1: -90 }, T(230, 30, "rapido")] }] },

  { id: "sp-decelerazione-eccentrica", anchor: "anklea", vb: [-20, -40, 340, 227], frames: [
    { pose: { t: 178, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 150, fa: 150 }, ab: { ua: 70, fa: 90 } }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }] },
    { pose: { t: 160, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 60, fa: 40 }, ab: { ua: 10, fa: 10 }, hl: ["aa"] }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }, T(240, 20, "lento, controllato")] }] },

  { id: "sp-prono-y", anchor: "pelvis", frames: [
    { pose: o(PRONE, { aa: { ua: 0, fa: 0 }, ab: { ua: 4, fa: 4 }, groundOn: ["pelvis"], lift: 62 }), props: (J) => [benchUnder(J), { type: "towel", at: ["head", 4, 11], w: 14 }] },
    { pose: o(PRONE, { aa: { ua: 112, fa: 112 }, ab: { ua: 110, fa: 110 }, hl: ["aa", "ab"] }), props: (J) => [benchUnder(J), { type: "towel", at: ["head", 4, 11], w: 14 }] }] },

  { id: "sp-flessione-decubito", noFloor: true, move: [{ j: "wrista", bend: 20 }], frames: [
    { pose: { t: 180, root: [140, 104], la: { th: 20, sh: 0 }, lb: { th: 40, sh: 10 }, aa: { ua: 0, fa: 0 }, ab: { ua: 70, fa: 70 } }, props: [{ type: "mat", x0: 50, y0: 10, x1: 250, y1: 182, layer: "back" }, T(150, 196, "vista dall'alto, sul fianco sano")] },
    { pose: { t: 180, root: [140, 104], la: { th: 20, sh: 0 }, lb: { th: 40, sh: 10 }, aa: { ua: 140, fa: 140 }, ab: { ua: 70, fa: 70 }, hl: ["aa"] }, props: [{ type: "mat", x0: 50, y0: 10, x1: 250, y1: 182, layer: "back" }, T(150, 196, "vista dall'alto, sul fianco sano")] }] },

  { id: "sp-estensione-prona", anchor: "pelvis", move: [{ j: "wrista", bend: 10 }], frames: [
    { pose: o(PRONE, { aa: { ua: 0, fa: 0 }, ab: { ua: 3, fa: 3 }, groundOn: ["pelvis"], lift: 62 }), props: (J) => [benchUnder(J), { type: "towel", at: ["head", 4, 11], w: 14 }] },
    { pose: o(PRONE, { aa: { ua: -84, fa: -84 }, ab: { ua: -82, fa: -82 }, hl: ["aa", "ab"] }), props: (J) => [benchUnder(J), { type: "towel", at: ["head", 4, 11], w: 14 }] }] },

  { id: "sp-wall-slide", anchor: "anklea", vb: [-10, -20, 320, 213], frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 92, fa: 180 }, ab: { ua: 90, fa: 180 } }, props: (J) => [{ type: "wall", x: J.wrista[0] + 5, w: 10 }] },
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 152, fa: 176 }, ab: { ua: 150, fa: 176 }, hl: ["aa"] }, props: (J) => [{ type: "wall", x: J.wrista[0] + 5, w: 10 }] }] },

  { id: "sp-dynamic-hug", anchor: "anklea", frames: [
    { pose: o(FSTAND, { aa: { E: [-24, 14], Wr: [-34, 0] }, ab: { E: [24, 14], Wr: [34, 0] } }), props: [{ type: "band", from: "wrista", to: "wristb", layer: "back" }] },
    { pose: o(FSTAND, { aa: { E: [-14, 18], Wr: [12, 14] }, ab: { E: [14, 18], Wr: [-12, 14] }, hl: ["aa", "ab"] }), props: [{ type: "band", from: "wrista", to: "wristb", layer: "back" }, { type: "arrow", from: ["wrista", -36, -8], to: ["wrista", -8, -8] }, { type: "arrow", from: ["wristb", 36, -8], to: ["wristb", 8, -8] }] }] },

  { id: "sp-push-up-plus", anchor: "wrista", frames: [
    { pose: { t: 100, la: { th: -78, sh: -78, ft: 10 }, aa: { ua: 0, fa: 0, hd: 90 }, ab: { ua: 0, fa: 0, hd: 90 }, groundOn: ["toea"] } },
    { pose: { t: 100, tc: 10, la: { th: -78, sh: -78, ft: 10 }, aa: { ua: 0, fa: 0, hd: 90, uaL: 1.08 }, ab: { ua: 0, fa: 0, hd: 90, uaL: 1.08 }, hl: ["aa"] }, props: [{ type: "arrow", from: ["mid", 6, -12], to: ["mid", 6, -24] }] }] },

  { id: "sp-bottom-up-press", anchor: "anklea", vb: [-10, -20, 320, 213], frames: [
    { pose: o(STAND, { aa: { ua: 40, fa: 180, hd: 180 }, hl: ["aa"] }), props: [{ type: "kb", at: ["handa", 0, -2], up: true }] },
    { pose: o(STAND, { aa: { ua: 178, fa: 180 }, hl: ["aa"] }), props: [{ type: "kb", at: ["handa", 0, -2], up: true }] }] },

  { id: "sp-carry-overhead", vb: [-20, -30, 340, 227], frames: [
    { pose: { t: 180, la: { ik: [22, 80] }, lb: { ik: [-20, 80], pf: 25 }, aa: { ua: 178, fa: 180 }, ab: { ua: -20, fa: -14 } }, props: [{ type: "kb", at: ["handa", 0, -2], up: true }] }] },

  { id: "sp-ckcuest", anchor: "pelvis", frames: [
    { pose: { view: "front", t: 180, tL: 0.25, la: { th: -3, sh: 0, thL: 0.5, shL: 0.05 }, lb: { th: 3, sh: 0, thL: 0.5, shL: 0.05 }, aa: { ik: [-30, 48] }, ab: { ik: [30, 48] }, groundOn: ["fingersa"] }, props: (J) => [{ type: "line", from: [J.fingersa[0], 184], to: [J.fingersa[0], 196], w: 3, col: "#E0703A" }, { type: "line", from: [J.fingersb[0], 184], to: [J.fingersb[0], 196], w: 3, col: "#E0703A" }] },
    { pose: { view: "front", t: 180, tL: 0.25, la: { th: -3, sh: 0, thL: 0.5, shL: 0.05 }, lb: { th: 3, sh: 0, thL: 0.5, shL: 0.05 }, aa: { ik: [-30, 48] }, ab: { E: [-8, 26], Wr: [-48, 40] }, hl: ["ab"] }, props: (J) => [{ type: "line", from: [J.fingersa[0], 184], to: [J.fingersa[0], 196], w: 3, col: "#E0703A" }, { type: "line", from: [J.fingersa[0] + 74, 184], to: [J.fingersa[0] + 74, 196], w: 3, col: "#E0703A" }] }] },

  { id: "sp-diagonale-d2", anchor: "anklea", frames: [
    { pose: o(FSTAND, { aa: { E: [10, 26], Wr: [30, 48] }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 90, y: 150 }, { type: "band", from: ["pelvis", 90, 30], to: "wrista" }] },
    { pose: o(FSTAND, { aa: { ua: -148, fa: -152 }, hl: ["aa"] }), props: [{ type: "post", x: "pelvis", dx: 90, y: 150 }, { type: "band", from: ["pelvis", 90, 30], to: "wrista" }] }] },

  /* ---------- GOMITO ---------- */
  { id: "gom-flessoestensione-attiva", anchor: "pelvis", zoom: { j: "shoulder", w: 190, dx: 10, dy: -20 }, frames: [
    { pose: o(HOOK, { aa: { ua: 180, fa: 260 }, ab: { E: [10, -20], Wr: [-8, -40] }, groundOn: ["pelvis"], hl: ["aa"] }) },
    { pose: o(HOOK, { aa: { ua: 180, fa: 182 }, ab: { E: [12, -24], Wr: [2, -50] }, hl: ["aa"] }), props: [{ type: "arc", at: "elbowa", r: 18, a0: 200, a1: 270 }] }] },

  { id: "gom-pronosupinazione-attiva", vb: [40, 40, 180, 120], custom: () => [close.prono(true), close.prono(false)] },

  { id: "gom-llps-estensione", anchor: "pelvis", zoom: { j: "elbowa", w: 200, dy: -10 }, frames: [
    { pose: o(SUP, { aa: { ua: 90, fa: 130 }, ab: { ua: 88, fa: 88 }, groundOn: ["pelvis"], lift: 50 }), props: (J) => [{ type: "bench", x: J.headTop[0] - 6, w: 230, top: J.pelvis[1] + 11 }, { type: "towel", at: ["elbowa", 0, 6], w: 12, h: 6 }, { type: "db", at: "handa" }] },
    { pose: o(SUP, { aa: { ua: 90, fa: 98 }, ab: { ua: 88, fa: 88 }, hl: ["aa"] }), props: (J) => [{ type: "bench", x: J.headTop[0] - 6, w: 230, top: J.pelvis[1] + 11 }, { type: "towel", at: ["elbowa", 0, 6], w: 12, h: 6 }, { type: "db", at: "handa" }] }] },

  { id: "gom-stretch-estensori", anchor: "anklea", frames: [
    { pose: o(STAND, { aa: { ua: 90, fa: 90, hd: 90 }, ab: { ik: [40, 6] } }) },
    { pose: o(STAND, { aa: { ua: 90, fa: 90, hd: 20 }, ab: { ik: [46, 8] }, hl: ["aa"] }), props: [{ type: "arrow", from: ["wrista", 16, -8], to: ["wrista", 10, 10], bend: -4 }] }] },

  { id: "gom-isometria-estensori-polso", vb: [40, 40, 180, 120], custom: () => [isoEst(false)] },

  { id: "gom-isometria-flessori-gomito", anchor: "pelvis", zoom: { j: "elbowa", w: 190, dy: -10 }, frames: [
    { pose: o(SIT, { aa: { ua: 2, fa: 92 }, ab: { ik: [42, 24] }, hl: ["aa"] }), props: [chair, { type: "arrow", from: ["wrista", 8, 20], to: ["wrista", 8, 6] }] }] },

  { id: "gom-presa-isometrica", anchor: "anklea", frames: [
    { pose: o(STAND, { aa: { ua: 4, fa: 92 }, hl: ["aa"] }), props: [{ type: "ball", at: ["handa", 3, 0], r: 5 }] },
    { pose: o(STAND, { aa: { ua: 40, fa: 40 }, hl: ["aa"] }), props: [{ type: "ball", at: ["handa", 3, 0], r: 5 }] }] },

  { id: "gom-tyler-twist", anchor: "anklea", zoom: { j: "shoulder", w: 210, dy: 30 }, frames: [
    { pose: o(FSTAND, { aa: { E: [-2, 28], Wr: [14, 30] }, ab: { E: [2, 22], Wr: [-14, 6] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.shoulder[0], J.shoulder[1] - 2], [J.shoulder[0], J.shoulder[1] + 38]) }, T(150, 196, "barra verticale: la mano sana torce")] },
    { pose: o(FSTAND, { aa: { E: [6, 16], Wr: [16, 22] }, ab: { E: [-6, 16], Wr: [-16, 22] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.wrista[0] - 4, J.wrista[1] + 2], [J.wristb[0] + 4, J.wristb[1] + 2]) }, T(150, 196, "braccia avanti: il polso affetto si flette lentamente")] }] },

  { id: "gom-curl-elastico", anchor: "anklea", frames: [
    { pose: o(STAND, { aa: { ua: 2, fa: 8 }, hl: ["aa"] }), props: [{ type: "band", from: "toea", to: "handa" }] },
    { pose: o(STAND, { aa: { ua: 4, fa: 150 }, hl: ["aa"] }), props: [{ type: "band", from: "toea", to: "handa" }] }] },

  { id: "gom-carico-quadrupedia", ghost: false, frames: [
    { pose: { dx: -20, t: 150, la: { ik: [24, 82] }, lb: { ik: [24, 82] }, aa: { ik: R(150, [10, 56]) }, ab: { ik: R(150, [10, 56]) } }, props: (J) => [{ type: "bench", x: J.wrista[0] - 30, w: 70, top: J.fingersa[1] + 2 }] },
    { pose: o(QUAD, { free: true, t: 96, aa: { ua: 14, fa: 14, hd: 90 }, ab: { ua: 14, fa: 14, hd: 90 }, hl: ["aa"] }), props: [{ type: "arrow", from: ["shoulder", -6, -20], to: ["shoulder", 14, -20] }] }] },

  { id: "gom-wall-dribble", anchor: "anklea", vb: [-10, -40, 320, 213], frames: [
    { pose: o(STAND, { aa: { ua: 170, fa: 176 }, hl: ["aa"] }), props: (J) => [{ type: "wall", x: J.wrista[0] + 18, w: 10 }, { type: "medball", at: ["fingersa", 8, 0], r: 6 }, { type: "arrow", from: ["fingersa", 4, 14], to: ["fingersa", 14, 14] }] }] },

  /* ---------- POLSO E MANO ---------- */
  { id: "pm-pronosupinazione-attiva", vb: [40, 40, 180, 120], custom: () => [close.prono(true), close.prono(false)] },

  { id: "pm-tendon-gliding", vb: [0, 0, 300, 200], custom: () => [tendonGliding()] },

  { id: "pm-neurodinamica-mediano", anchor: "anklea", frames: [
    { pose: o(FSTAND, { h: 18, aa: { ua: -92, fa: 180, hd: -110 }, hl: ["aa"] }) },
    { pose: o(FSTAND, { h: -18, aa: { ua: -92, fa: -92, hd: 180 }, hl: ["aa"] }) }] },

  { id: "pm-stretch-estensori-polso", vb: [40, 40, 180, 120], custom: () => {
    const a = H.handSide({ w: [140, 90], fore: 90, wrist: 0, f: [0, 0, 0] });
    const b = H.handSide({ w: [140, 90], fore: 90, wrist: 70, f: [80, 95, 50], th: [10, 20, 20] });
    return [H.bg() + a.svg, H.bg() + b.svg + H.arrow([182, 70], [170, 112], -10)]; } },

  { id: "pm-dart-thrower", vb: [40, 40, 180, 120], custom: () => {
    const tab = { y: 110 };
    const a = H.handSide({ w: [140, 92], fore: 90, wrist: -30, f: [40, 50, 30], th: [0, 10, 10] });
    const b = H.handSide({ w: [140, 92], fore: 90, wrist: 40, f: [40, 50, 30], th: [0, 10, 10] });
    return [H.bg(tab) + a.svg + H.label(130, 152, "estensione + deviazione radiale", 9), H.bg(tab) + b.svg + H.arrow([190, 60], [186, 116], -12) + H.label(130, 152, "flessione + deviazione ulnare", 9)]; } },

  { id: "pm-isometria-estensori-polso", vb: [40, 40, 180, 120], custom: () => [isoEst(true)] },

  { id: "pm-tyler-twist", anchor: "anklea", zoom: { j: "shoulder", w: 210, dy: 30 }, frames: [
    { pose: o(FSTAND, { aa: { E: [-2, 28], Wr: [14, 30] }, ab: { E: [2, 22], Wr: [-14, 6] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.shoulder[0], J.shoulder[1] - 2], [J.shoulder[0], J.shoulder[1] + 38]) }, T(150, 196, "barra verticale: la mano sana torce")] },
    { pose: o(FSTAND, { aa: { E: [6, 16], Wr: [16, 22] }, ab: { E: [-6, 16], Wr: [-16, 22] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.wrista[0] - 4, J.wrista[1] + 2], [J.wristb[0] + 4, J.wristb[1] + 2]) }, T(150, 196, "braccia avanti: il polso affetto si flette lentamente")] }] },

  { id: "pm-tyler-twist-inverso", anchor: "anklea", zoom: { j: "shoulder", w: 210, dy: 30 }, frames: [
    { pose: o(FSTAND, { aa: { E: [-2, 22], Wr: [14, 6] }, ab: { E: [2, 28], Wr: [-14, 30] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.shoulder[0], J.shoulder[1] - 2], [J.shoulder[0], J.shoulder[1] + 38]) }, T(150, 196, "mano affetta in flessione di polso")] },
    { pose: o(FSTAND, { aa: { E: [6, 16], Wr: [16, 22] }, ab: { E: [-6, 16], Wr: [-16, 22] }, hl: ["aa"] }), props: (J) => [{ type: "raw", svg: flexbar([J.wrista[0] - 4, J.wrista[1] + 2], [J.wristb[0] + 4, J.wristb[1] + 2]) }, T(150, 196, "braccia avanti: il polso affetto si estende lentamente")] }] },

  { id: "pm-deviazione-radiale", vb: [50, 20, 180, 120], custom: () => devScene(true) },
  { id: "pm-deviazione-ulnare", vb: [50, 20, 180, 120], custom: () => devScene(false) },

  { id: "pm-presa-pallina", vb: [40, 40, 180, 120], custom: () => {
    const a = H.handSide({ w: [120, 90], fore: 90, f: [40, 50, 30], th: [10, 20, 10] });
    const b = H.handSide({ w: [120, 90], fore: 90, f: [70, 80, 50], th: [20, 30, 20] });
    return [H.bg() + `<circle cx="${f1(a.knuckle[0] + 2)}" cy="${f1(a.knuckle[1] + 22)}" r="14" fill="${C.ball}"/>` + a.svg, H.bg() + `<ellipse cx="${f1(b.knuckle[0])}" cy="${f1(b.knuckle[1] + 19)}" rx="13" ry="9" fill="${C.ball}"/>` + b.svg + H.label(130, 152, "stringere 3-5 s", 9)]; } },

  { id: "pm-hand-gripper", vb: [40, 40, 180, 120], custom: () => {
    const grip = (open) => { const top = [160, 88], bot = open ? [168, 132] : [168, 116]; return seg([140, 84], [196, 92], 7, C.eq) + seg([150, open ? 128 : 112], [196, 94], 7, C.eq) + `<path d="M196,92 q10,-2 6,8" fill="none" stroke="${C.eqLight}" stroke-width="3"/>`; };
    const a = H.handSide({ w: [120, 90], fore: 90, f: [55, 60, 30], th: [10, 10, 10] });
    const b = H.handSide({ w: [120, 90], fore: 90, f: [75, 75, 40], th: [20, 20, 10] });
    return [H.bg() + grip(true) + a.svg, H.bg() + grip(false) + b.svg]; } },

  { id: "pm-pinza-plastilina", vb: [60, 40, 180, 120], custom: () => {
    const a = H.handFlat({ w: [150, 135], d: 150, palmar: false, side: -1, curl: [0.55, 0.7, 0.75, 0.75], spread: 0 });
    const tip = a.tips[0];
    const a2 = H.handFlat({ w: [150, 135], d: 150, palmar: false, side: -1, curl: [0.55, 0.7, 0.75, 0.75], thumbTip: [tip[0] - 2, tip[1] + 4] });
    const b = H.handFlat({ w: [150, 135], d: 150, palmar: false, side: -1, curl: [0.75, 0.8, 0.8, 0.8] });
    const side = b.tips[0];
    const b2 = H.handFlat({ w: [150, 135], d: 150, palmar: false, side: -1, curl: [0.75, 0.8, 0.8, 0.8], thumbTip: [side[0] - 6, side[1] + 8] });
    const putty = (p) => `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="8" ry="5" fill="#E8B04B"/>`;
    return [H.bg() + a2.svg + putty([tip[0] - 4, tip[1] + 6]) + H.label(150, 52, "pinza termino-terminale", 9), H.bg() + b2.svg + putty([side[0] - 8, side[1] + 9]) + H.label(150, 52, "pinza laterale (a chiave)", 9)]; } },

  { id: "pm-opposizione-pollice", vb: [60, 40, 180, 120], custom: () => {
    const a = H.handFlat({ w: [150, 140], d: 180, palmar: true, side: 1, thumb: 70, spread: 4 });
    const b0 = H.handFlat({ w: [150, 140], d: 180, palmar: true, side: 1, curl: [0, 0, 0.3, 0.55] });
    const t = b0.tips[3];
    const b = H.handFlat({ w: [150, 140], d: 180, palmar: true, side: 1, curl: [0, 0, 0.3, 0.55], thumbTip: [t[0] + 3, t[1] + 3] });
    return [H.bg({ y: 150 }) + a.svg + H.label(150, 52, "abduzione palmare", 9), H.bg({ y: 150 }) + b.svg + H.label(150, 52, "opposizione: pollice-mignolo", 9)]; } },

  { id: "pm-stabilizzazione-trapezio-metacarpale", vb: [40, 40, 180, 120], custom: () => {
    const a = H.handSide({ w: [120, 96], fore: 90, wrist: 0, f: [20, 30, 15], th: [-20, 10, 5], palm: "down" });
    return [H.bg({ y: 120 }) + a.svg + H.label(130, 150, "pollice a 'C', l'indice spinge verso il pollice", 7)]; } },

  { id: "pm-estensione-dita-elastico", vb: [70, 40, 160, 107], custom: () => {
    const a = H.handFlat({ w: [150, 150], d: 180, palmar: false, side: -1, spread: -3, curl: [0.25, 0.2, 0.25, 0.3], thumbTip: [148, 96] });
    const b = H.handFlat({ w: [150, 150], d: 180, palmar: false, side: -1, spread: 12 });
    const ring = (h) => { const xs = h.tips.map((p) => p[0]).concat([h.thumb[0]]), ys = h.tips.map((p) => p[1]).concat([h.thumb[1]]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 4; return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1((Math.max(...xs) - Math.min(...xs)) / 2 + 3)}" ry="${f1((Math.max(...ys) - Math.min(...ys)) / 2 + 5)}" fill="none" stroke="${C.band}" stroke-width="2.6"/>`; };
    return [H.bg() + a.svg + ring(a), H.bg() + b.svg + ring(b)]; } },

  { id: "pm-torsione-asciugamano", anchor: "anklea", zoom: { j: "shoulder", w: 200, dy: 30 }, frames: [
    { pose: o(FSTAND, { aa: { E: [-4, 26], Wr: [10, 24] }, ab: { E: [4, 26], Wr: [-10, 24] } }), props: (J) => [{ type: "line", from: ["wrista", -6, 0], to: ["wristb", 6, 0], w: 10, col: "#E7C66B" }, { type: "arc", at: ["wrista", -2, 0], r: 6, ry: 12, a0: 250, a1: 110 }, { type: "arc", at: ["wristb", 2, 0], r: 6, ry: 12, a0: 110, a1: 250 }] }] },

  { id: "pm-carico-polso-quadrupedia", ghost: false, frames: [
    { pose: { dx: -20, t: 150, la: { ik: [24, 82] }, lb: { ik: [24, 82] }, aa: { ik: R(150, [10, 56]) }, ab: { ik: R(150, [10, 56]) } }, props: (J) => [{ type: "bench", x: J.wrista[0] - 30, w: 70, top: J.fingersa[1] + 2 }] },
    { pose: o(QUAD, { free: true, t: 96, aa: { ua: 14, fa: 14, hd: 90 }, ab: { ua: 14, fa: 14, hd: 90 }, hl: ["aa"] }), props: [{ type: "arrow", from: ["shoulder", -6, -20], to: ["shoulder", 14, -20] }] }] },

  { id: "pm-propriocezione-polso-palla", anchor: "anklea", frames: [
    { pose: o(STAND, { t: 170, aa: { ik: R(170, [22, 46]) } }), props: (J) => [{ type: "ball", at: ["fingersa", 2, 12], r: 12 }, { type: "bench", x: J.fingersa[0] - 30, w: 70, top: J.fingersa[1] + 24 }, { type: "arc", at: ["fingersa", 2, 12], r: 18, a0: 200, a1: 340 }] }] },

  { id: "pm-carry-kettlebell-capovolto", frames: [
    { pose: { t: 180, la: { ik: [22, 80] }, lb: { ik: [-20, 80], pf: 25 }, aa: { ua: 20, fa: 180 }, ab: { ua: -20, fa: -14 }, hl: ["aa"] }, props: [{ type: "kb", at: ["handa", 0, -2], up: true }] }] },

  { id: "pm-pliometria-polso", vb: [40, 20, 180, 120], custom: () => {
    const tab = { y: 104, x1: 150 };
    const a = H.handSide({ w: [160, 98], fore: 90, wrist: 40, f: [50, 50, 30], palm: "up", th: [0, 10, 10] });
    const b = H.handSide({ w: [160, 98], fore: 90, wrist: -30, f: [10, 10, 5], palm: "up" });
    const ball = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#8A5A44"/>`;
    return [H.bg(tab) + a.svg + ball(196, 76), H.bg(tab) + b.svg + ball(200, 40) + H.arrow([200, 70], [200, 52])]; } },

  { id: "pm-palleggio-muro-pallavolo", anchor: "anklea", vb: [-10, -20, 320, 213], frames: [
    { pose: o(STAND, { aa: { ua: 150, fa: 210 }, ab: { ua: 150, fa: 210 }, hl: ["aa"] }), props: (J) => [{ type: "wall", x: J.fingersa[0] + 60, w: 10 }, { type: "volley", at: ["fingersa", 8, -4], r: 8 }, { type: "arrow", from: ["fingersa", 22, -4], to: ["fingersa", 52, -4] }] }] },
];

function isoEst(pm) {
  const tab = { y: 100, x1: 152 };
  const a = H.handSide({ w: [160, 94], fore: 90, wrist: -6, f: [80, 90, 60], th: [60, 40, 30], palm: "down" });
  const dbc = [184, 110];
  return H.bg(tab) + a.svg + H.db(dbc, true) + H.arrow([200, 120], [200, 100]) + H.label(130, 150, pm ? "tenere il polso in posizione" : "isometria 30-45 s", 8);
}
function devScene(rad) {
  const out = [];
  for (const up of [false, true]) {
    const w = [150, 70];
    const ang = rad ? (up ? 125 : 150) : (up ? 240 : 210); // direzione del manico
    const fist = `<circle cx="${w[0]}" cy="${w[1] + 18}" r="10" fill="${C.near}"/>`;
    let s = H.bg() + seg([w[0], w[1] - 80], w, 22, C.near) + seg(w, [w[0], w[1] + 14], 18, C.near) + hammer([w[0], w[1] + 18], ang, 40) + fist;
    if (up) s += H.arc([w[0], w[1] + 18], 26, rad ? 120 : 60, rad ? 70 : 110);
    s += H.label(150, 136, rad ? "peso davanti: deviazione radiale" : "peso dietro: deviazione ulnare", 8);
    out.push(s);
  }
  return out;
}
function tendonGliding() {
  const pos = [[0, 0, 0], [0, 95, 85], [90, 100, 75], [90, 95, 0], [90, 0, 0]];
  const names = ["aperta", "uncino", "pugno pieno", "pugno dritto", "a tavolo"];
  let s = H.bg();
  pos.forEach((f, i) => {
    const cx = i < 3 ? 0 + i * 100 : 50 + (i - 3) * 100, cy = i < 3 ? -6 : 92;
    const h = H.handSide({ w: [30, 30], fore: 90, f, foreLen: 18, th: [10, 15, 10] });
    s += `<g transform="translate(${cx},${cy}) scale(1.25)">${h.svg}</g>`;
    s += H.label(cx + 55, cy + 96, (i + 1) + ". " + names[i], 10);
  });
  return s;
}
