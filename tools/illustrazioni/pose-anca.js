/* Anca e adduttori */
"use strict";
const { VB, R, o, STAND, FSTAND, SUP, HOOK, PRONE, QUAD, dowel } = require("./libreria");

const benchSh = { type: "bench", x: "shoulder", dx: -48, w: 58, top: "shoulder", dy: 9 };

const SIDE_CABLE = (out) => (J) => {
  const r = [{ type: "raw", svg: `<circle cx="${J.wrista[0].toFixed(1)}" cy="${J.wrista[1].toFixed(1)}" r="3.2" fill="#34413F"/>` },
    { type: "text", x: J.shoulder[0], y: J.headTop[1] - 8, text: "maniglia del cavo, cavo di lato: il tronco non ruota", size: 9 }];
  if (out) r.push({ type: "arrow", from: ["shoulder", 14, 6], to: ["wrista", -6, 0] });
  return r;
};

module.exports = [
  { id: "hip-thrust-mono", anchor: "shoulder", move: [{ j: "pelvis", bend: -6 }], frames: [
    { pose: { t: 236, h: 28, la: { ik: [46, 6], ft: 90 }, lb: { th: 150, sh: 62 }, aa: { ua: -70, fa: -75 }, groundOn: ["heela"], hl: ["la"] }, props: [benchSh] },
    { pose: { t: 270, h: 40, la: { stay: true }, lb: { th: 182, sh: 92 }, aa: { ua: -70, fa: -75 }, hl: ["la"] }, props: [benchSh] }] },

  { id: "clamshell", anchor: "pelvis", move: ["kneeb"], frames: [
    { pose: { view: "front", t: 270, h: -8, la: { K: [28, 22], A: [56, 9] }, lb: { K: [29, 29], A: [57, 17] }, aa: { ua: -90, fa: -95 }, ab: { E: [16, 14], Wr: [32, 18] }, groundOn: ["kneea"], hl: ["lb"] } },
    { pose: { view: "front", t: 270, h: -8, la: { K: [28, 22], A: [56, 9] }, lb: { K: [30, -6], A: [57, 17] }, aa: { ua: -90, fa: -95 }, ab: { E: [16, 14], Wr: [32, 18] }, hl: ["lb"] } }] },

  { id: "abduzione-decubito", anchor: "pelvis", move: [{ j: "ankleb", bend: 8 }], frames: [
    { pose: { view: "front", t: 270, h: -8, la: { K: [26, 16], A: [36, 2] }, lb: { th: 92, sh: 92, ft: 180 }, aa: { ua: -90, fa: -95 }, ab: { E: [10, 18], Wr: [24, 28] }, groundOn: ["kneea"], hl: ["lb"] } },
    { pose: { view: "front", t: 270, h: -8, la: { K: [26, 16], A: [36, 2] }, lb: { th: 125, sh: 125, ft: 215 }, aa: { ua: -90, fa: -95 }, ab: { E: [10, 18], Wr: [24, 28] }, hl: ["lb"] } }] },

  { id: "copenhagen", anchor: "shoulder", move: [{ j: "pelvis", bend: 6 }], frames: [
    { pose: { view: "front", t: 232, la: { th: 25, sh: 15 }, lb: { th: 72, sh: 72, ft: 162 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 2], Wr: [28, 12] }, groundOn: ["elbowa"], hl: ["lb"] }, props: [{ type: "bench", x: "ankleb", dx: -26, w: 44, top: "ankleb", dy: 7 }] },
    { pose: { view: "front", t: 250, la: { th: 70, sh: 70, ft: 160, stay: false }, lb: { stay: true, ft: 160 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 2], Wr: [28, 12] }, hl: ["lb", "la"] }, props: [{ type: "bench", x: "ankleb", dx: -26, w: 44, top: "ankleb", dy: 7 }] }] },

  { id: "squeeze-adduttori", noFloor: true, frames: [
    { pose: { view: "front", t: 270, root: [95, 100], la: { K: [40, 6], A: [70, 12], ft: 0 }, lb: { K: [40, -6], A: [70, -12], ft: 180 }, aa: { E: [24, -4], Wr: [46, -6] }, ab: { E: [24, 4], Wr: [46, 6] }, hl: ["la", "lb"] },
      props: [{ type: "mat", x0: 30, y0: 52, x1: 270, y1: 148, layer: "back" }, { type: "ball", at: ["pelvis", 40, 0], r: 6, layer: "front" },
        { type: "arrow", from: ["kneea", 0, 22], to: ["kneea", 0, 10] }, { type: "arrow", from: ["kneeb", 0, -22], to: ["kneeb", 0, -10] },
        { type: "text", x: 150, y: 190, text: "vista dall'alto", size: 10 }] }] },

  { id: "isometria-muro", frames: [
    { pose: o(FSTAND, { lb: { K: [6, 12], A: [8, 50] }, la: { th: 0, sh: 0 }, ab: { E: [4, 26], Wr: [-8, 40] }, hl: ["lb", "la"] }),
      props: [{ type: "wall", x: "kneeb", dx: 7, w: 10 }, { type: "arrow", from: ["kneeb", -12, 0], to: ["kneeb", 4, 0] }] }] },

  { id: "pull-through-cavo", anchor: "anklea", move: [{ j: "handa", bend: -10 }], frames: [
    { pose: { t: 122, la: { ik: [18, 80] }, lb: { ik: [18, 80] }, aa: { ua: -14, fa: -22 }, ab: { ua: -12, fa: -20 }, hl: ["la"] }, props: [{ type: "cable", x: 22, y: 176, to: "handa" }] },
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 18, fa: 26 }, ab: { ua: 14, fa: 22 }, hl: ["la"] }, props: [{ type: "cable", x: 22, y: 176, to: "handa" }] }] },

  { id: "step-down-laterale", anchor: "anklea", move: [{ j: "ankleb", bend: 4 }], frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { th: 6, sh: 4 }, aa: { E: [-14, 16], Wr: [0, 30] }, ab: { E: [14, 16], Wr: [0, 30] }, groundOn: ["heela"], lift: 34, hl: ["la"] }), props: [{ type: "box", x: "anklea", dx: -26, w: 40, top: "heela", dy: 2 }] },
    { pose: o(FSTAND, { la: { K: [4, 24], A: [0, 56] }, lb: { th: 12, sh: 6 }, aa: { E: [-14, 16], Wr: [0, 30] }, ab: { E: [14, 16], Wr: [0, 30] }, hl: ["la"] }), props: [{ type: "box", x: "anklea", dx: -26, w: 40, top: "heela", dy: 2 }] }] },

  { id: "landmine-affondo", anchor: "anklea", move: [{ j: "kneeb", bend: 8 }], frames: [
    { pose: { t: 176, la: {}, lb: {}, aa: { ik: R(176, [16, 16]) }, ab: { ik: R(176, [16, 18]) }, hl: ["la"] }, props: [{ type: "landmine", x: "pelvis", dx: 118, at: "handa" }] },
    { pose: { t: 172, la: { ik: [36, 52] }, lb: { th: -18, sh: -95, ft: 20 }, aa: { ik: R(172, [16, 16]) }, ab: { ik: R(172, [16, 18]) }, hl: ["la", "lb"] }, props: [{ type: "landmine", x: "pelvis", dx: 118, at: "handa" }] }] },

  { id: "90-90", move: [{ j: "kneea", bend: -10 }], frames: [
    { pose: { view: "front", t: 180, la: { K: [-24, 12], A: [8, 16], ft: 90 }, lb: { K: [36, 6], A: [42, -8], ft: 0 }, aa: { E: [-8, 26], Wr: [8, 40] }, ab: { E: [8, 26], Wr: [-8, 40] }, groundOn: ["kneea"], hl: ["la", "lb"] } },
    { pose: { view: "front", t: 180, la: { K: [-36, 6], A: [-42, -8], ft: 0 }, lb: { K: [24, 12], A: [-8, 16], ft: 270 }, aa: { E: [-8, 26], Wr: [8, 40] }, ab: { E: [8, 26], Wr: [-8, 40] }, groundOn: ["kneeb"], hl: ["la", "lb"] } }] },

  { id: "suitcase-carry", frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { K: [2, 40], A: [3, 76] }, ab: { ua: 4, fa: 2 }, aa: { ua: -10, fa: -10 } }), props: [{ type: "kb", at: "handb" }] }] },

  { id: "atterraggio-mono", ghost: false, vb: VB, frames: [
    { pose: o(STAND, { lift: 30, dx: -60, aa: { ua: -30, fa: -20 }, ab: { ua: -30, fa: -20 } }), props: [{ type: "box", x: "anklea", dx: -26, w: 46, top: 156 }] },
    { pose: { shift: 110, t: 150, la: { ik: [22, 62] }, lb: { th: -5, sh: -70, pf: 20 }, aa: { ua: 50, fa: 60 }, ab: { ua: 40, fa: 50 }, hl: ["la"] }, props: [{ type: "box", x: "pelvis", dx: -136, w: 46, top: 156 }] }] },

  { id: "rincorsa-attacco", ghost: false, vb: VB, frames: [
    { pose: { dx: -40, t: 140, la: { ik: [26, 56] }, lb: { ik: [-18, 66] }, aa: { ua: -140, fa: -150 }, ab: { ua: -130, fa: -140 }, h: -20 } },
    { pose: { free: true, dx: 30, lift: 34, t: 186, la: { th: 4, sh: -6, pf: 40 }, lb: { th: 8, sh: 0, pf: 40 }, aa: { ua: 172, fa: 176 }, ab: { ua: 160, fa: 170 } } }] },

  { id: "anca-hip-hike", anchor: "anklea", frames: [
    { pose: o(FSTAND, { t: 173, h: -7, la: { th: 0, sh: 0 }, lb: { th: 0, sh: 0 }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, groundOn: ["heela"], lift: 34, hl: ["la"] }),
      props: [{ type: "box", x: "anklea", dx: -26, w: 40, top: "heela", dy: 2 }, { type: "line", from: ["hipa", -16, 0], to: ["hipb", 16, 0], dash: "3 3", col: "#E0703A" }] },
    { pose: o(FSTAND, { t: 187, h: 7, la: { th: 0, sh: 0 }, lb: { th: 0, sh: 0 }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }),
      props: [{ type: "box", x: "anklea", dx: -26, w: 40, top: "heela", dy: 2 }, { type: "line", from: ["hipa", -16, 0], to: ["hipb", 16, 0], dash: "3 3", col: "#E0703A" }, { type: "arrow", from: ["hipb", 22, 12], to: ["hipb", 22, -6] }] }] },

  { id: "anca-abduzione-isometrica-supina", noFloor: true, frames: [
    { pose: { view: "front", t: 270, root: [80, 100], la: { th: 92, sh: 90, ft: 0 }, lb: { th: 88, sh: 90, ft: 180 }, aa: { E: [24, -4], Wr: [46, -6] }, ab: { E: [24, 4], Wr: [46, 6] }, hl: ["la", "lb"] },
      props: [{ type: "mat", x0: 20, y0: 58, x1: 280, y1: 142, layer: "back" }, { type: "loop", a: ["kneea", -4, 0], b: ["kneeb", -4, 0], pad: 6, ry: 5, col: "#E7C66B", w: 4 },
        { type: "arrow", from: ["kneea", 6, 8], to: ["kneea", 6, 20] }, { type: "arrow", from: ["kneeb", 6, -8], to: ["kneeb", 6, -20] },
        { type: "text", x: 150, y: 190, text: "vista dall'alto", size: 10 }] }] },

  { id: "anca-band-walk-laterale", anchor: "anklea", move: [{ j: "ankleb", bend: 0, off: [0, -20] }], frames: [
    { pose: o(FSTAND, { t: 180, la: { K: [-6, 30], A: [-8, 66] }, lb: { K: [6, 30], A: [8, 66] }, aa: { E: [-12, 20], Wr: [2, 32] }, ab: { E: [12, 20], Wr: [-2, 32] }, hl: ["la", "lb"] }), props: [{ type: "loop", a: "anklea", b: "ankleb", pad: 4, ry: 3 }] },
    { pose: o(FSTAND, { t: 180, la: { K: [-8, 30], A: [-16, 66] }, lb: { K: [14, 30], A: [26, 66] }, aa: { E: [-12, 20], Wr: [2, 32] }, ab: { E: [12, 20], Wr: [-2, 32] }, hl: ["la", "lb"] }), props: [{ type: "loop", a: "anklea", b: "ankleb", pad: 4, ry: 3 }] }] },

  { id: "anca-extrarotazione-seduto", anchor: "pelvis", move: [{ j: "anklea", bend: 6 }], frames: [
    { pose: { view: "front", t: 180, la: { K: [-3, 12], A: [-3, 52], ft: 90 }, lb: { K: [3, 12], A: [3, 52], ft: 90 }, aa: { E: [-6, 26], Wr: [-4, 50] }, ab: { E: [6, 26], Wr: [4, 50] }, groundOn: ["pelvis"], lift: 60, hl: ["la"] },
      props: [{ type: "bench", x: "pelvis", dx: -50, w: 100, top: "pelvis", dy: 11 }, { type: "post", x: "pelvis", dx: -70, y: "anklea", dy: -4 }, { type: "band", from: ["pelvis", -70, 46], to: "anklea" }] },
    { pose: { view: "front", t: 180, la: { K: [-3, 12], A: [14, 50], ft: 90 }, lb: { K: [3, 12], A: [3, 52], ft: 90 }, aa: { E: [-6, 26], Wr: [-4, 50] }, ab: { E: [6, 26], Wr: [4, 50] }, groundOn: ["pelvis"], lift: 60, hl: ["la"] },
      props: [{ type: "bench", x: "pelvis", dx: -50, w: 100, top: "pelvis", dy: 11 }, { type: "post", x: "pelvis", dx: -70, y: ["pelvis", 0, 42] }, { type: "band", from: ["pelvis", -70, 46], to: "anklea" }] }] },

  { id: "anca-intrarotazione-seduto", anchor: "pelvis", move: [{ j: "ankleb", bend: -6 }], frames: [
    { pose: { view: "front", t: 180, la: { K: [-3, 12], A: [-3, 52], ft: 90 }, lb: { K: [3, 12], A: [3, 52], ft: 90 }, aa: { E: [-6, 26], Wr: [-4, 50] }, ab: { E: [6, 26], Wr: [4, 50] }, groundOn: ["pelvis"], lift: 60, hl: ["lb"] },
      props: [{ type: "bench", x: "pelvis", dx: -50, w: 100, top: "pelvis", dy: 11 }, { type: "post", x: "pelvis", dx: -70, y: ["pelvis", 0, 42] }, { type: "band", from: ["pelvis", -70, 46], to: "ankleb" }] },
    { pose: { view: "front", t: 180, la: { K: [-3, 12], A: [-3, 52], ft: 90 }, lb: { K: [3, 12], A: [22, 49], ft: 90 }, aa: { E: [-6, 26], Wr: [-4, 50] }, ab: { E: [6, 26], Wr: [4, 50] }, groundOn: ["pelvis"], lift: 60, hl: ["lb"] },
      props: [{ type: "bench", x: "pelvis", dx: -50, w: 100, top: "pelvis", dy: 11 }, { type: "post", x: "pelvis", dx: -70, y: ["pelvis", 0, 42] }, { type: "band", from: ["pelvis", -70, 46], to: "ankleb" }] }] },

  { id: "anca-hip-airplane", anchor: "anklea", frames: [
    { pose: { view: "front", t: 180, tL: 0.45, h: 30, la: { K: [-2, 41], A: [-2, 82] }, lb: { K: [10, -4], A: [14, -14] }, aa: { ua: -95, fa: -95 }, ab: { ua: 95, fa: 95 }, hl: ["la"] } },
    { pose: { view: "front", t: 226, tL: 0.75, h: 40, la: { K: [-2, 41], A: [-2, 82] }, lb: { th: 120, sh: 120 }, aa: { ua: -40, fa: -40 }, ab: { ua: 140, fa: 140 }, hl: ["la"] }, props: [{ type: "arc", at: "pelvis", r: 30, a0: 330, a1: 260 }] }] },

  { id: "anca-rotazione-mono-carico", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { K: [4, 34], A: [6, 58] }, aa: { E: [-6, 24], Wr: [16, 14] }, ab: { E: [6, 24], Wr: [-16, 14] }, hl: ["la"] }), props: [{ type: "cable", x: 30, y: "wrista", to: "wrista" }] },
    { pose: o(FSTAND, { shW: 9, hr: 0.8, la: { th: 0, sh: 0 }, lb: { K: [4, 34], A: [6, 58] }, aa: { E: [2, 24], Wr: [16, 14] }, ab: { E: [2, 24], Wr: [0, 14] }, hl: ["la"] }), props: [{ type: "cable", x: 30, y: "wrista", to: "wrista" }, { type: "arc", at: "pelvis", r: 26, a0: 160, a1: 20 }] }] },

  { id: "anca-psoas-march", anchor: "pelvis", frames: [
    { pose: { t: 270, la: { th: 180, sh: 90 }, lb: { th: 180, sh: 90 }, aa: { ua: 88, fa: 88 }, groundOn: ["pelvis"], hl: ["la"] }, props: [{ type: "loop", a: "toea", b: "toeb", pad: 3, ry: 3 }] },
    { pose: { t: 270, la: { th: 205, sh: 115 }, lb: { th: 100, sh: 100 }, aa: { ua: 88, fa: 88 }, hl: ["la"] }, props: [{ type: "band", from: "toea", to: "toeb" }, { type: "arrow", from: ["kneea", 16, -10], to: ["kneea", 2, -16], bend: 0 }, { type: "arrow", from: ["ankleb", -24, -16], to: ["ankleb", -4, -6] }] }] },

  { id: "anca-flessione-seduto-oltre90", anchor: "pelvis", move: [{ j: "kneea", bend: 6 }], frames: [
    { pose: { t: 180, la: { th: 90, sh: 0 }, lb: { th: 90, sh: 0 }, aa: { ua: 10, fa: 10 }, ab: { ua: 8, fa: 8 }, groundOn: ["heela"], hl: ["la"] }, props: [{ type: "chair", under: "pelvis" }] },
    { pose: { t: 180, la: { th: 128, sh: 22 }, lb: { th: 90, sh: 0 }, aa: { ua: 10, fa: 10 }, ab: { ua: 8, fa: 8 }, hl: ["la"] }, props: [{ type: "chair", under: "pelvis" }] }] },

  { id: "anca-adduzione-decubito", anchor: "pelvis", move: [{ j: "anklea", bend: 6 }], frames: [
    { pose: { view: "front", t: 270, h: -8, la: { th: 90, sh: 90, ft: 180 }, lb: { K: [22, 22], A: [26, 40] }, aa: { ua: -90, fa: -95 }, ab: { E: [10, 18], Wr: [24, 30] }, groundOn: ["ankleb"], hl: ["la"] } },
    { pose: { view: "front", t: 270, h: -8, la: { th: 102, sh: 102, ft: 192 }, lb: { K: [22, 22], A: [26, 40] }, aa: { ua: -90, fa: -95 }, ab: { E: [10, 18], Wr: [24, 30] }, hl: ["la"] } }] },

  { id: "anca-adduzione-slider", anchor: "anklea", move: [{ j: "ankleb", bend: 0, off: [0, -8] }], frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { th: 0, sh: 0 }, aa: { E: [-4, 24], Wr: [14, 16] }, ab: { E: [4, 24], Wr: [-14, 16] }, hl: ["lb"] }), props: [{ type: "slider", under: "heelb" }] },
    { pose: o(FSTAND, { la: { K: [-6, 28], A: [-14, 58] }, lb: { ik: [58, 58] }, aa: { E: [-4, 24], Wr: [14, 16] }, ab: { E: [4, 24], Wr: [-14, 16] }, hl: ["lb"] }), props: [{ type: "slider", under: "heelb" }] }] },

  { id: "anca-hinge-bastone", anchor: "anklea", move: [{ j: "pelvis", bend: 6 }], frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ik: R(180, [-10, -14]), bend: 1 }, ab: { ik: R(180, [-14, 42]) } }, props: (J) => [dowel(J)] },
    { pose: { t: 118, la: { ik: [22, 80] }, lb: { ik: [22, 80] }, aa: { ik: R(118, [-10, -14]), bend: 1 }, ab: { ik: R(118, [-14, 42]) }, hl: ["la"] }, props: (J) => [dowel(J)] }] },

  { id: "anca-rdl-bstance", anchor: "anklea", move: [{ j: "head", bend: -10 }], frames: [
    { pose: { t: 180, la: {}, lb: { ik: [-16, 80], pf: 45 }, aa: { ua: 0, fa: 0 }, ab: { ua: 0, fa: 0 }, hl: ["la"] }, props: [{ type: "db", at: "handa" }] },
    { pose: { t: 104, la: { ik: [24, 81] }, lb: { stay: true, pf: 45 }, aa: { ua: 0, fa: 0 }, ab: { ua: 0, fa: 0 }, hl: ["la"] }, props: [{ type: "db", at: "handa" }] }] },

  { id: "anca-ponte-ischio-mono", anchor: "shoulder", move: [{ j: "pelvis", bend: -6 }], frames: [
    { pose: { t: 270, la: { ik: [74, -40], ft: 160 }, lb: { th: 180, sh: 180 }, aa: { ua: 88, fa: 88 }, groundOn: ["pelvis"], hl: ["la"] }, props: [{ type: "box", x: "heela", dx: -16, w: 34, top: "heela", dy: 1 }] },
    { pose: { t: 290, h: 20, la: { stay: true, ft: 165 }, lb: { th: 190, sh: 190 }, aa: { ua: 70, fa: 70 }, hl: ["la"] }, props: [{ type: "box", x: "heela", dx: -16, w: 34, top: "heela", dy: 1 }] }] },

  { id: "anca-skater-squat", anchor: "anklea", move: [{ j: "kneeb", bend: 8 }], frames: [
    { pose: { t: 180, la: {}, lb: { th: -8, sh: -95, ft: -10 }, aa: { ua: 8, fa: 8 }, ab: { ua: 8, fa: 8 }, hl: ["la"] } },
    { pose: { t: 138, la: { ik: [28, 46] }, lb: { th: -14, sh: -100, ft: -10 }, aa: { ua: 85, fa: 88 }, ab: { ua: 80, fa: 85 }, hl: ["la"] }, props: [{ type: "towel", at: ["kneeb", 0, 9], w: 22, h: 6 }] }] },

  { id: "anca-cossack-squat", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { ik: [-36, 75] }, lb: { ik: [36, 75] }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] }, hl: ["la", "lb"] }), props: [{ type: "kb", at: ["shoulder", 0, 6] }] },
    { pose: o(FSTAND, { h: 0, la: { K: [-26, 18], A: [-34, 40] }, lb: { ik: [80, 36], ft: 180 }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] }, hl: ["la", "lb"] }), props: [{ type: "kb", at: ["shoulder", 0, 6] }] }] },

  { id: "anca-landmine-squat", anchor: "anklea", move: [{ j: "pelvis", bend: 6 }], frames: [
    { pose: { t: 172, la: {}, lb: {}, aa: { ik: R(172, [16, 14]) }, ab: { ik: R(172, [16, 16]) }, hl: ["la"] }, props: [{ type: "landmine", x: "pelvis", dx: 120, at: "handa" }] },
    { pose: { t: 152, la: { ik: [30, 42] }, lb: { ik: [30, 42] }, aa: { ik: R(152, [16, 14]) }, ab: { ik: R(152, [16, 16]) }, hl: ["la"] }, props: [{ type: "landmine", x: "pelvis", dx: 120, at: "handa" }] }] },

  { id: "anca-step-up-laterale", anchor: "ankleb", move: [{ j: "pelvis", bend: -6 }], frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { K: [12, 28], A: [18, 50] }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["lb"] }), props: [{ type: "box", x: "ankleb", dx: -14, w: 60, top: "heelb", dy: 2 }] },
    { pose: o(FSTAND, { la: { th: -4, sh: 4 }, lb: { th: 3, sh: 0 }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["lb"] }), props: [{ type: "box", x: "ankleb", dx: -14, w: 60, top: "heelb", dy: 2 }] }] },

  { id: "anca-pallof-mezzo-ginocchio", anchor: "kneeb", frames: [
    { pose: { t: 180, la: { th: 88, sh: 2 }, lb: { th: 0, sh: -90, ft: -100 }, aa: { ua: 18, fa: 148 }, ab: { ua: 22, fa: 146 }, groundOn: ["kneeb"], hl: ["la", "lb"] }, props: SIDE_CABLE(false) },
    { pose: { t: 180, la: { th: 88, sh: 2 }, lb: { th: 0, sh: -90, ft: -100 }, aa: { ua: 88, fa: 90 }, ab: { ua: 84, fa: 88 }, groundOn: ["kneeb"], hl: ["la", "lb"] }, props: SIDE_CABLE(true) }] },

  { id: "anca-rock-back-adduttori", noFloor: true, frames: [
    { pose: { view: "front", t: 90, root: [130, 92], h: 0, la: { K: [-4, -3], A: [-46, -6], ft: 180 }, lb: { th: 0, sh: 0, ft: 90 }, aa: { E: [8, -4], Wr: [18, -5] }, ab: { E: [8, 4], Wr: [18, 5] }, hl: ["lb"] },
      props: [{ type: "mat", x0: 30, y0: 40, x1: 270, y1: 182, layer: "back" }, { type: "text", x: 150, y: 196, text: "vista dall'alto", size: 10 }] },
    { pose: { view: "front", t: 90, root: [104, 92], h: 0, la: { K: [-4, -3], A: [-24, -6], ft: 180 }, lb: { ik: [22, 80], ft: 90 }, aa: { E: [20, -4], Wr: [44, -5] }, ab: { E: [20, 4], Wr: [44, 5] }, hl: ["lb"] },
      props: [{ type: "mat", x0: 30, y0: 40, x1: 270, y1: 182, layer: "back" }, { type: "arrow", from: [150, 70], to: [118, 70] }, { type: "text", x: 150, y: 196, text: "vista dall'alto", size: 10 }] }] },

  { id: "anca-squat-profondo-assistito", anchor: "anklea", frames: [
    { pose: { t: 178, la: {}, lb: {}, aa: { ik: [42, 4] }, ab: { ik: [42, 6] } }, props: (J) => [{ type: "post", x: J.wrista[0] + 3, y: 20 }] },
    { pose: { t: 150, la: { ik: [24, 18], bend: 1 }, lb: { ik: [24, 18] }, aa: { ik: [44, 20] }, ab: { ik: [44, 22] }, hl: ["la"] }, props: (J) => [{ type: "post", x: J.wrista[0] + 3, y: 20 }] }] },

  { id: "anca-y-balance", anchor: "anklea", move: [{ j: "toeb", bend: 8 }], frames: [
    { pose: { t: 180, la: {}, lb: { th: 10, sh: -20 }, aa: { ua: 20, fa: 20 }, ab: { ua: 10, fa: 10 }, hl: ["la"] }, props: [{ type: "line", from: [60, 186], to: [280, 186], w: 3, col: "#E0703A", dash: "6 4" }] },
    { pose: { t: 165, la: { ik: [24, 60] }, lb: { ik: [74, 56], pf: 30 }, aa: { ua: -10, fa: -10 }, ab: { ua: -20, fa: -20 }, hl: ["la"] }, props: [{ type: "line", from: [60, 186], to: [280, 186], w: 3, col: "#E0703A", dash: "6 4" }] }] },

  { id: "anca-appoggio-mono-perturbazioni", frames: [
    { pose: o(FSTAND, { la: { K: [-2, 42], A: [0, 82] }, lb: { K: [6, 30], A: [8, 54] }, aa: { E: [-16, 18], Wr: [-28, 34] }, ab: { E: [16, 18], Wr: [28, 34] }, hl: ["la"] }),
      props: [{ type: "post", x: 20, y: 90 }, { type: "band", from: [20, 100], to: ["pelvis", -12, 0] }, { type: "arrow", from: ["pelvis", -30, -16], to: ["pelvis", -54, -16] }, { type: "arrow", from: ["pelvis", 40, -16], to: ["pelvis", 60, -16] }] }] },

  { id: "anca-muro-spostamento", ghost: false, vb: VB, frames: [
    { pose: o(FSTAND, { dx: -40, la: { K: [-14, 32], A: [-22, 72] }, lb: { K: [12, 34], A: [24, 72] }, aa: { E: [-10, 20], Wr: [-6, -4] }, ab: { E: [10, 20], Wr: [6, -4] } }), props: [{ type: "net", y0: -30, y1: 40, layer: "front" }, { type: "arrow", from: [150, 140], to: [200, 140] }] },
    { pose: o(FSTAND, { free: true, dx: 50, lift: 40, la: { th: 2, sh: 0, pf: 50 }, lb: { th: -2, sh: 0, pf: 50 }, aa: { ua: 176, fa: 172 }, ab: { ua: 184, fa: 188 } }), props: [{ type: "net", y0: -30, y1: 40, layer: "front" }] }] },

  { id: "anca-attacco-mono", ghost: false, vb: VB, frames: [
    { pose: { dx: -30, t: 160, la: { ik: [22, 70] }, lb: { th: -30, sh: -60, pf: 30 }, aa: { ua: -120, fa: -130 }, ab: { ua: -110, fa: -120 }, hl: ["la"] } },
    { pose: { free: true, dx: 40, lift: 30, t: 186, la: { th: 0, sh: 0, pf: 50 }, lb: { th: 110, sh: 20 }, aa: { ua: 160, fa: 200 }, ab: { ua: 150, fa: 140 }, hl: ["la"] } }] },

  { id: "anca-atterraggio-attacco", ghost: false, vb: VB, frames: [
    { pose: { dx: -50, lift: 34, t: 165, la: { th: 6, sh: 0, pf: 40 }, lb: { th: 20, sh: -10, pf: 40 }, aa: { ua: 60, fa: 20 }, ab: { ua: -30, fa: -10 } } },
    { pose: { free: true, dx: 40, t: 150, la: { ik: [24, 62] }, lb: { th: -10, sh: -60, pf: 20 }, aa: { ua: 40, fa: 30 }, ab: { ua: 70, fa: 70 }, hl: ["la"] } }] },

  { id: "anca-difesa-spostamento", ghost: false, frames: [
    { pose: o(FSTAND, { dx: -10, la: { K: [-12, 32], A: [-20, 68] }, lb: { K: [12, 32], A: [20, 68] }, aa: { E: [-8, 22], Wr: [10, 38] }, ab: { E: [8, 22], Wr: [-10, 38] } }) },
    { pose: o(FSTAND, { free: true, dx: 30, t: 196, la: { ik: [-60, 60] }, lb: { K: [18, 22], A: [26, 50] }, aa: { E: [-2, 26], Wr: [14, 50] }, ab: { E: [-14, 22], Wr: [-18, 46] }, hl: ["la", "lb"] }), props: [{ type: "volley", at: ["wrista", 0, 14], r: 8 }] }] },
];
